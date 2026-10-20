import {
  collection,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import {
  db,
  auth,
  handleFirestoreError,
  OperationType,
  isAuthorizedAdminUser,
} from './firebase';
import { Language } from '../data/kytData';

// Synchronized verbatim with firebase-blueprint.json & firestore.rules
export const SAFE_ID_REGEX = /^[a-zA-Z0-9_-]+$/;
export const MAX_ID_LENGTH = 128;
export const MAX_LABEL_LENGTH = 200;
export const MAX_CATEGORY_LENGTH = 120;
export const MAX_PIXEL_ID_LENGTH = 64;

export type TrackingEventType =
  | 'page_view'
  | 'helmet_select'
  | 'helmet_detail_view'
  | 'store_directions_click'
  | 'store_detail_open'
  | 'store_address_copy'
  | 'province_filter'
  | 'store_search'
  | 'ecommerce_click'
  | 'language_switch';

export interface TrackingEventRecord {
  eventId: string;
  ownerId?: string;
  eventType: TrackingEventType;
  targetId: string;
  targetLabel: string;
  category: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  lang: Language;
  sessionId: string;
  timestampIso: string;
  syncedToCloud?: boolean;
  syncedToDrive?: boolean;
}

export interface TrackingPixelConfig {
  configId: string;
  ga4MeasurementId: string;
  gtmContainerId: string;
  metaPixelId: string;
  tiktokPixelId: string;
  enableAutoTracking: 'true' | 'false';
}

export interface DriveTrackingFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  webViewLink?: string;
}

const LOCAL_EVENTS_STORAGE_KEY = 'kyt_vn_tracking_events_v1';
const LOCAL_CONFIG_STORAGE_KEY = 'kyt_vn_tracking_config_v1';
const SESSION_ID_STORAGE_KEY = 'kyt_vn_session_id_v1';
const DRIVE_FOLDER_NAME = 'KYT Vietnam Tracking Data';

export const DEFAULT_TRACKING_CONFIG: TrackingPixelConfig = {
  configId: 'global_config',
  ga4MeasurementId: '',
  gtmContainerId: '',
  metaPixelId: '',
  tiktokPixelId: '',
  enableAutoTracking: 'true',
};

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    ttq?: {
      track: (event: string, payload?: Record<string, unknown>) => void;
    };
  }
}

function sanitizeId(raw: string, fallback = 'item_default'): string {
  const cleaned = raw
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, MAX_ID_LENGTH);
  if (!cleaned || !SAFE_ID_REGEX.test(cleaned)) {
    return fallback;
  }
  return cleaned;
}

function sanitizeText(raw: string, maxLen: number, fallback = 'N/A'): string {
  const cleaned = raw.trim().slice(0, maxLen);
  return cleaned.length > 0 ? cleaned : fallback;
}

export function getVisitorSessionId(): string {
  try {
    const existing = sessionStorage.getItem(SESSION_ID_STORAGE_KEY);
    if (existing && SAFE_ID_REGEX.test(existing) && existing.length <= MAX_ID_LENGTH) {
      return existing;
    }
    const created = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem(SESSION_ID_STORAGE_KEY, created);
    return created;
  } catch {
    return `sess_${Date.now()}`;
  }
}

export function detectDeviceType(): 'mobile' | 'desktop' | 'tablet' {
  if (typeof window === 'undefined') return 'desktop';
  const w = window.innerWidth;
  if (w < 640) return 'mobile';
  if (w < 1024) return 'tablet';
  return 'desktop';
}

export function loadLocalEvents(): TrackingEventRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_EVENTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalEvents(events: TrackingEventRecord[]): void {
  try {
    const trimmed = events.slice(0, 500);
    localStorage.setItem(LOCAL_EVENTS_STORAGE_KEY, JSON.stringify(trimmed));
    window.dispatchEvent(new CustomEvent('kyt-tracking-updated'));
  } catch {
    // Ignore storage quota errors
  }
}

export function loadLocalPixelConfig(): TrackingPixelConfig {
  try {
    const raw = localStorage.getItem(LOCAL_CONFIG_STORAGE_KEY);
    if (!raw) return DEFAULT_TRACKING_CONFIG;
    return { ...DEFAULT_TRACKING_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_TRACKING_CONFIG;
  }
}

export function saveLocalPixelConfig(config: TrackingPixelConfig): void {
  try {
    localStorage.setItem(LOCAL_CONFIG_STORAGE_KEY, JSON.stringify(config));
    injectExternalTrackingPixels(config);
    window.dispatchEvent(new CustomEvent('kyt-tracking-config-updated'));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Dynamically injects Google Analytics 4 (GA4), Google Tag Manager (GTM),
 * Meta Pixel, and TikTok Pixel scripts if configured by the site owner.
 */
export function injectExternalTrackingPixels(config: TrackingPixelConfig): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  window.dataLayer = window.dataLayer || [];

  // 1. Google Analytics 4 (GA4)
  const ga4Id = config.ga4MeasurementId.trim();
  if (ga4Id && /^G-[A-Z0-9]+$/i.test(ga4Id)) {
    const scriptId = 'kyt-ga4-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4Id)}`;
      document.head.appendChild(script);

      window.gtag = function gtag(...args: unknown[]) {
        window.dataLayer?.push(args as unknown as Record<string, unknown>);
      };
      window.gtag('js', new Date());
      window.gtag('config', ga4Id);
    }
  }

  // 2. Google Tag Manager (GTM)
  const gtmId = config.gtmContainerId.trim();
  if (gtmId && /^GTM-[A-Z0-9]+$/i.test(gtmId)) {
    const scriptId = 'kyt-gtm-script';
    if (!document.getElementById(scriptId)) {
      window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
      const script = document.createElement('script');
      script.id = scriptId;
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`;
      document.head.appendChild(script);
    }
  }
}

function dispatchToExternalPixels(event: TrackingEventRecord): void {
  if (typeof window === 'undefined') return;

  const payload = {
    event_id: event.eventId,
    event_category: event.category,
    target_id: event.targetId,
    target_label: event.targetLabel,
    device_type: event.deviceType,
    language: event.lang,
    timestamp: event.timestampIso,
  };

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: `kyt_${event.eventType}`,
    ...payload,
  });

  if (typeof window.gtag === 'function') {
    window.gtag('event', event.eventType, payload);
  }

  if (typeof window.fbq === 'function') {
    window.fbq('trackCustom', `KYT_${event.eventType}`, payload);
  }

  if (window.ttq && typeof window.ttq.track === 'function') {
    window.ttq.track(`KYT_${event.eventType}`, payload);
  }
}

/**
 * Syncs a single tracking event to Firebase Firestore if the authorized admin is signed in.
 */
export async function syncEventToFirestore(event: TrackingEventRecord): Promise<boolean> {
  const currentUser = auth.currentUser;
  if (!isAuthorizedAdminUser(currentUser) || !currentUser) {
    return false;
  }

  const validEventId = sanitizeId(event.eventId, `evt_${Date.now()}`);
  const validOwnerId = sanitizeId(currentUser.uid, 'invalid_uid');
  const validSessionId = sanitizeId(event.sessionId, `sess_${Date.now()}`);

  const firestorePayload = {
    eventId: validEventId,
    ownerId: validOwnerId,
    eventType: event.eventType,
    targetId: sanitizeText(event.targetId, MAX_ID_LENGTH, 'unknown'),
    targetLabel: sanitizeText(event.targetLabel, MAX_LABEL_LENGTH, 'Unknown'),
    category: sanitizeText(event.category, MAX_CATEGORY_LENGTH, 'general'),
    deviceType: event.deviceType,
    lang: event.lang,
    sessionId: validSessionId,
    createdAt: serverTimestamp(),
  };

  const docPath = `tracking_events/${validEventId}`;
  try {
    await setDoc(doc(db, 'tracking_events', validEventId), firestorePayload);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
  }
}

/**
 * Primary function to record any user interaction on the KYT Vietnam website.
 * Silent background collection: visitors never see any tracking UI.
 */
export function trackKytEvent(params: {
  eventType: TrackingEventType;
  targetId: string;
  targetLabel: string;
  category: string;
  lang?: Language;
}): void {
  const config = loadLocalPixelConfig();
  if (config.enableAutoTracking === 'false') return;

  const eventId = sanitizeId(
    `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    `evt_${Date.now()}`
  );

  const newEvent: TrackingEventRecord = {
    eventId,
    ownerId: auth.currentUser?.uid,
    eventType: params.eventType,
    targetId: sanitizeText(params.targetId, MAX_ID_LENGTH, 'unknown'),
    targetLabel: sanitizeText(params.targetLabel, MAX_LABEL_LENGTH, 'Unknown'),
    category: sanitizeText(params.category, MAX_CATEGORY_LENGTH, 'general'),
    deviceType: detectDeviceType(),
    lang: params.lang || 'VIE',
    sessionId: getVisitorSessionId(),
    timestampIso: new Date().toISOString(),
    syncedToCloud: false,
    syncedToDrive: false,
  };

  const existing = loadLocalEvents();
  const updated = [newEvent, ...existing];
  saveLocalEvents(updated);

  dispatchToExternalPixels(newEvent);

  if (isAuthorizedAdminUser(auth.currentUser)) {
    syncEventToFirestore(newEvent)
      .then((ok) => {
        if (ok) {
          const currentList = loadLocalEvents();
          const marked = currentList.map((item) =>
            item.eventId === newEvent.eventId ? { ...item, syncedToCloud: true } : item
          );
          saveLocalEvents(marked);
        }
      })
      .catch(() => {});
  }
}

/**
 * Syncs all unsynced local tracking events to Firestore once the admin logs in.
 */
export async function syncPendingLocalEventsToCloud(): Promise<number> {
  const currentUser = auth.currentUser;
  if (!isAuthorizedAdminUser(currentUser)) return 0;

  const localEvents = loadLocalEvents();
  const unsynced = localEvents.filter((e) => !e.syncedToCloud).slice(0, 50);
  if (unsynced.length === 0) return 0;

  let syncedCount = 0;
  const syncedIds = new Set<string>();

  for (const evt of unsynced) {
    try {
      const ok = await syncEventToFirestore(evt);
      if (ok) {
        syncedCount++;
        syncedIds.add(evt.eventId);
      }
    } catch {
      break;
    }
  }

  if (syncedIds.size > 0) {
    const updated = loadLocalEvents().map((item) =>
      syncedIds.has(item.eventId) ? { ...item, syncedToCloud: true } : item
    );
    saveLocalEvents(updated);
  }

  return syncedCount;
}

/**
 * Subscribes to cloud tracking events in Firestore for the authorized admin (boruto47001@gmail.com).
 */
export function subscribeToCloudEvents(
  onUpdate: (events: TrackingEventRecord[]) => void
): () => void {
  const currentUser = auth.currentUser;
  if (!isAuthorizedAdminUser(currentUser)) {
    return () => {};
  }

  const eventsRef = collection(db, 'tracking_events');

  return onSnapshot(
    eventsRef,
    (snapshot) => {
      const cloudEvents: TrackingEventRecord[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        const createdAtTs = d.createdAt as Timestamp | null;
        const iso =
          createdAtTs && typeof createdAtTs.toDate === 'function'
            ? createdAtTs.toDate().toISOString()
            : new Date().toISOString();

        return {
          eventId: String(d.eventId || docSnap.id),
          ownerId: String(d.ownerId || ''),
          eventType: d.eventType as TrackingEventType,
          targetId: String(d.targetId || ''),
          targetLabel: String(d.targetLabel || ''),
          category: String(d.category || ''),
          deviceType: (d.deviceType as 'mobile' | 'desktop' | 'tablet') || 'desktop',
          lang: (d.lang as Language) || 'VIE',
          sessionId: String(d.sessionId || ''),
          timestampIso: iso,
          syncedToCloud: true,
        };
      });

      cloudEvents.sort(
        (a, b) => new Date(b.timestampIso).getTime() - new Date(a.timestampIso).getTime()
      );
      onUpdate(cloudEvents);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'tracking_events');
    }
  );
}

/**
 * Saves the Pixel & GA4 configuration to local storage and Firestore (if authorized admin).
 */
export async function saveTrackingConfigToCloud(
  config: TrackingPixelConfig
): Promise<boolean> {
  const sanitizedConfig: TrackingPixelConfig = {
    configId: sanitizeId(config.configId || 'global_config', 'global_config'),
    ga4MeasurementId: config.ga4MeasurementId.trim().slice(0, MAX_PIXEL_ID_LENGTH),
    gtmContainerId: config.gtmContainerId.trim().slice(0, MAX_PIXEL_ID_LENGTH),
    metaPixelId: config.metaPixelId.trim().slice(0, MAX_PIXEL_ID_LENGTH),
    tiktokPixelId: config.tiktokPixelId.trim().slice(0, MAX_PIXEL_ID_LENGTH),
    enableAutoTracking: config.enableAutoTracking === 'false' ? 'false' : 'true',
  };

  saveLocalPixelConfig(sanitizedConfig);

  const currentUser = auth.currentUser;
  if (!isAuthorizedAdminUser(currentUser) || !currentUser) {
    return false;
  }

  const configDocId = sanitizedConfig.configId;
  const docRef = doc(db, 'tracking_configs', configDocId);
  const docPath = `tracking_configs/${configDocId}`;

  try {
    const existingDoc = await getDoc(docRef);
    const createdAtValue =
      existingDoc.exists() && existingDoc.data()?.createdAt
        ? existingDoc.data().createdAt
        : serverTimestamp();

    await setDoc(docRef, {
      configId: configDocId,
      ownerId: sanitizeId(currentUser.uid, 'admin'),
      ga4MeasurementId: sanitizedConfig.ga4MeasurementId,
      gtmContainerId: sanitizedConfig.gtmContainerId,
      metaPixelId: sanitizedConfig.metaPixelId,
      tiktokPixelId: sanitizedConfig.tiktokPixelId,
      enableAutoTracking: sanitizedConfig.enableAutoTracking,
      createdAt: createdAtValue,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

/**
 * Loads the Pixel & GA4 configuration from Firestore if authorized admin is signed in.
 */
export async function loadTrackingConfigFromCloud(): Promise<TrackingPixelConfig | null> {
  const currentUser = auth.currentUser;
  if (!isAuthorizedAdminUser(currentUser)) return null;

  const docPath = 'tracking_configs/global_config';
  try {
    const snap = await getDoc(doc(db, 'tracking_configs', 'global_config'));
    if (!snap.exists()) return null;
    const d = snap.data();
    const loaded: TrackingPixelConfig = {
      configId: 'global_config',
      ga4MeasurementId: String(d.ga4MeasurementId || ''),
      gtmContainerId: String(d.gtmContainerId || ''),
      metaPixelId: String(d.metaPixelId || ''),
      tiktokPixelId: String(d.tiktokPixelId || ''),
      enableAutoTracking: d.enableAutoTracking === 'false' ? 'false' : 'true',
    };
    saveLocalPixelConfig(loaded);
    return loaded;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, docPath);
  }
}

/**
 * Clears all local tracking events and deletes cloud events if authorized admin.
 */
export async function clearAllTrackingEvents(cloudEvents: TrackingEventRecord[]): Promise<void> {
  saveLocalEvents([]);
  const currentUser = auth.currentUser;
  if (!isAuthorizedAdminUser(currentUser)) return;

  for (const evt of cloudEvents.slice(0, 50)) {
    const validId = sanitizeId(evt.eventId, '');
    if (!validId) continue;
    try {
      await deleteDoc(doc(db, 'tracking_events', validId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `tracking_events/${validId}`);
    }
  }
}

// ============================================================================
// GOOGLE DRIVE DIRECT DATA TRANSFER (SCOPE: drive.file)
// ============================================================================

export function buildTrackingCsvContent(events: TrackingEventRecord[]): string {
  let pageViews = 0;
  let mapDirections = 0;
  let ecommerceClicks = 0;
  let helmetViews = 0;

  for (const e of events) {
    if (e.eventType === 'page_view') pageViews++;
    else if (e.eventType === 'store_directions_click') mapDirections++;
    else if (e.eventType === 'ecommerce_click') ecommerceClicks++;
    else if (e.eventType === 'helmet_select' || e.eventType === 'helmet_detail_view') helmetViews++;
  }

  const summaryLines = [
    `"KYT VIETNAM OFFICIAL WEBSITE - BÁO CÁO DỮ LIỆU TRACKING"`,
    `"Tài khoản Quản trị (Cloud Admin)","boruto47001@gmail.com"`,
    `"Thời điểm đồng bộ Google Drive","${new Date().toISOString()}"`,
    `"Tổng số sự kiện ghi nhận","${events.length}"`,
    `"Lượt tải trang (Page Views)","${pageViews}"`,
    `"Lượt bấm Chỉ đường Đại lý (Google Maps)","${mapDirections}"`,
    `"Lượt Click Shopee & TikTok Shop","${ecommerceClicks}"`,
    `"Lượt xem dòng nón 3D","${helmetViews}"`,
    `""`,
  ];

  const headers = [
    'Event ID',
    'Timestamp (ISO)',
    'Event Type',
    'Target ID',
    'Target Label',
    'Category / Province',
    'Device Type',
    'Language',
    'Session ID',
  ];

  const rows = events.map((e) => [
    `"${e.eventId.replace(/"/g, '""')}"`,
    `"${e.timestampIso}"`,
    `"${e.eventType}"`,
    `"${e.targetId.replace(/"/g, '""')}"`,
    `"${e.targetLabel.replace(/"/g, '""')}"`,
    `"${e.category.replace(/"/g, '""')}"`,
    `"${e.deviceType}"`,
    `"${e.lang}"`,
    `"${e.sessionId.replace(/"/g, '""')}"`,
  ]);

  return '\uFEFF' + [...summaryLines, headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Finds or creates the dedicated "KYT Vietnam Tracking Data" folder in the admin's Google Drive.
 */
export async function ensureKytDriveFolder(
  accessToken: string
): Promise<{ id: string; webViewLink?: string }> {
  const q = encodeURIComponent(
    `mimeType = 'application/vnd.google-apps.folder' and name = '${DRIVE_FOLDER_NAME}' and trashed = false`
  );
  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,webViewLink)&pageSize=1`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!searchRes.ok) {
    throw new Error(`Không thể kết nối Google Drive (HTTP ${searchRes.status}).`);
  }

  const searchData = await searchRes.json();
  if (Array.isArray(searchData.files) && searchData.files.length > 0) {
    return {
      id: searchData.files[0].id,
      webViewLink: searchData.files[0].webViewLink,
    };
  }

  // Create folder if it doesn't exist
  const createRes = await fetch(
    'https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: DRIVE_FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder',
      }),
    }
  );

  if (!createRes.ok) {
    throw new Error(`Không thể tạo thư mục Google Drive (HTTP ${createRes.status}).`);
  }

  return await createRes.json();
}

/**
 * Lists tracking data files created by this app inside the admin's Google Drive.
 */
export async function listDriveTrackingFiles(
  accessToken: string
): Promise<DriveTrackingFile[]> {
  const q = encodeURIComponent(
    `mimeType != 'application/vnd.google-apps.folder' and trashed = false`
  );
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&orderBy=modifiedTime desc&pageSize=15&fields=files(id,name,mimeType,modifiedTime,webViewLink)`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!res.ok) {
    throw new Error(`Không thể tải danh sách tệp từ Google Drive (HTTP ${res.status}).`);
  }

  const data = await res.json();
  return Array.isArray(data.files) ? data.files : [];
}

/**
 * Creates a brand-new CSV tracking data file inside the "KYT Vietnam Tracking Data" folder
 * in boruto47001@gmail.com's Google Drive.
 */
export async function uploadNewTrackingFileToDrive(
  accessToken: string,
  events: TrackingEventRecord[]
): Promise<DriveTrackingFile> {
  const folder = await ensureKytDriveFolder(accessToken);
  const csvContent = buildTrackingCsvContent(events);
  const now = new Date();
  const stamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const fileName = `KYT_Vietnam_Tracking_${stamp}.csv`;

  const metadata = {
    name: fileName,
    mimeType: 'text/csv',
    parents: [folder.id],
    description: `Báo cáo dữ liệu Tracking KYT Vietnam (${events.length} sự kiện) - Đồng bộ tự động cho boruto47001@gmail.com`,
  };

  const boundary = '-------kyt_drive_multipart_boundary_' + Date.now();
  const multipartBody =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: text/csv; charset=UTF-8\r\n\r\n` +
    `${csvContent}\r\n` +
    `--${boundary}--`;

  const uploadRes = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,modifiedTime,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartBody,
    }
  );

  if (!uploadRes.ok) {
    throw new Error(`Tải dữ liệu lên Google Drive thất bại (HTTP ${uploadRes.status}).`);
  }

  return await uploadRes.json();
}

/**
 * Updates/overwrites an existing tracking file in Google Drive.
 * NOTE: Caller MUST display an explicit user confirmation dialog before invoking this function.
 */
export async function overwriteExistingDriveFile(
  accessToken: string,
  fileId: string,
  fileName: string,
  events: TrackingEventRecord[]
): Promise<DriveTrackingFile> {
  const csvContent = buildTrackingCsvContent(events);
  const metadata = {
    name: fileName,
    mimeType: 'text/csv',
    description: `Cập nhật lúc ${new Date().toISOString()} (${events.length} sự kiện)`,
  };

  const boundary = '-------kyt_drive_update_boundary_' + Date.now();
  const multipartBody =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: text/csv; charset=UTF-8\r\n\r\n` +
    `${csvContent}\r\n` +
    `--${boundary}--`;

  const res = await fetch(
    `https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(fileId)}?uploadType=multipart&fields=id,name,mimeType,modifiedTime,webViewLink`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartBody,
    }
  );

  if (!res.ok) {
    throw new Error(`Không thể cập nhật tệp trên Google Drive (HTTP ${res.status}).`);
  }

  return await res.json();
}

/**
 * Deletes a tracking report file from Google Drive.
 * NOTE: Caller MUST display an explicit user confirmation dialog before invoking this function.
 */
export async function deleteDriveTrackingFile(
  accessToken: string,
  fileId: string
): Promise<void> {
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error(`Không thể xóa tệp trên Google Drive (HTTP ${res.status}).`);
  }
}
