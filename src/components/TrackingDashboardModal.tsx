import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  X,
  BarChart3,
  Navigation,
  ShoppingBag,
  Eye,
  MapPin,
  Settings,
  Download,
  Trash2,
  Cloud,
  CheckCircle2,
  LogOut,
  Activity,
  Sparkles,
  HardDrive,
  FolderOpen,
  ExternalLink,
  RefreshCw,
  ShieldAlert,
  Lock,
  FileSpreadsheet,
  AlertTriangle,
  Store,
  KeyRound,
} from 'lucide-react';
import {
  auth,
  AUTHORIZED_ADMIN_EMAIL,
  isAuthorizedAdminUser,
  initAuth,
  googleSignIn,
  getAccessToken,
  logout,
  User,
} from '../lib/firebase';
import {
  TrackingEventRecord,
  TrackingPixelConfig,
  DriveTrackingFile,
  DealerApplicationRecord,
  loadLocalEvents,
  loadLocalPixelConfig,
  saveTrackingConfigToCloud,
  loadTrackingConfigFromCloud,
  subscribeToCloudEvents,
  syncPendingLocalEventsToCloud,
  clearAllTrackingEvents,
  ensureKytDriveFolder,
  listDriveTrackingFiles,
  uploadNewTrackingFileToDrive,
  overwriteExistingDriveFile,
  deleteDriveTrackingFile,
  isSecretAdminUnlocked,
  unlockSecretAdmin,
  lockSecretAdmin,
  loadDealerApplications,
  syncDealerApplicationsWithServerAndCloud,
  submitDealerApplication,
  deleteDealerApplication,
  clearAllDealerApplications,
  buildDealerApplicationsCsv,
  downloadDealerApplicationsCsv,
  runStorageSelfTest,
  StorageSelfTestReport,
  MAX_PIXEL_ID_LENGTH,
} from '../lib/tracking';
import { Language } from '../data/kytData';

interface TrackingDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

interface PendingDriveConfirmation {
  type: 'overwrite' | 'delete';
  file: DriveTrackingFile;
}

const EVENT_TYPE_LABELS: Record<string, { vie: string; eng: string; color: string }> = {
  page_view: { vie: 'Xem trang', eng: 'Page View', color: 'text-neutral-300' },
  helmet_select: { vie: 'Chọn dòng nón', eng: 'Helmet Model', color: 'text-amber-400' },
  helmet_detail_view: { vie: 'Xem chi tiết nón', eng: 'Helmet Spec View', color: 'text-orange-400' },
  store_directions_click: {
    vie: 'Bấm Chỉ đường Map',
    eng: 'Maps Directions',
    color: 'text-[#FF1E1A]',
  },
  store_detail_open: { vie: 'Mở chi tiết đại lý', eng: 'Dealer Details', color: 'text-emerald-400' },
  store_address_copy: { vie: 'Sao chép địa chỉ', eng: 'Copy Address', color: 'text-teal-400' },
  province_filter: { vie: 'Lọc Tỉnh/Thành', eng: 'Province Filter', color: 'text-sky-400' },
  store_search: { vie: 'Tìm kiếm đại lý', eng: 'Dealer Search', color: 'text-indigo-400' },
  ecommerce_click: { vie: 'Click sàn TMĐT', eng: 'E-Commerce Click', color: 'text-[#EE4D2D]' },
  language_switch: { vie: 'Đổi ngôn ngữ', eng: 'Language Switch', color: 'text-purple-400' },
  size_guide_interact: { vie: 'Đo size nón', eng: 'Size Calculator', color: 'text-rose-400' },
  dealer_registration: { vie: 'Đăng ký đại lý', eng: 'Dealer Application', color: 'text-lime-400' },
};

const GoogleSignInButton: React.FC<{
  onClick: () => void;
  disabled?: boolean;
  label: string;
}> = ({ onClick, disabled, label }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="gsi-material-button inline-flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-100 text-[#1f1f1f] font-semibold text-xs shadow-lg transition-all cursor-pointer disabled:opacity-50"
  >
    <div className="gsi-material-button-state" />
    <div className="gsi-material-button-content-wrapper flex items-center gap-2.5">
      <div className="gsi-material-button-icon w-4 h-4 shrink-0">
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          className="w-full h-full block"
        >
          <path
            fill="#EA4335"
            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
          />
          <path
            fill="#4285F4"
            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
          />
          <path
            fill="#FBBC05"
            d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
          />
          <path
            fill="#34A853"
            d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
          />
          <path fill="none" d="M0 0h48v48H0z" />
        </svg>
      </div>
      <span className="gsi-material-button-contents">{label}</span>
    </div>
  </button>
);

export const TrackingDashboardModal: React.FC<TrackingDashboardModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const isEn = lang === 'ENG';
  const [activeTab, setActiveTab] = useState<'dealers' | 'overview' | 'drive' | 'pixels'>('dealers');
  const [secretUnlocked, setSecretUnlocked] = useState<boolean>(() => isSecretAdminUnlocked());
  const [manualKeyInput, setManualKeyInput] = useState<string>('');

  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [driveToken, setDriveToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  const [localEvents, setLocalEvents] = useState<TrackingEventRecord[]>([]);
  const [cloudEvents, setCloudEvents] = useState<TrackingEventRecord[]>([]);
  const [dealerRecords, setDealerRecords] = useState<DealerApplicationRecord[]>([]);
  const [pixelConfig, setPixelConfig] = useState<TrackingPixelConfig>(() =>
    loadLocalPixelConfig()
  );

  // Google Drive state
  const [driveFolderLink, setDriveFolderLink] = useState<string | undefined>(undefined);
  const [driveFiles, setDriveFiles] = useState<DriveTrackingFile[]>([]);
  const [isDriveSyncing, setIsDriveSyncing] = useState<boolean>(false);
  const [driveStatusMsg, setDriveStatusMsg] = useState<string>('');
  const [pendingConfirmation, setPendingConfirmation] =
    useState<PendingDriveConfirmation | null>(null);

  const [saveMessage, setSaveMessage] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [isSyncingCloud, setIsSyncingCloud] = useState<boolean>(false);
  const [isRunningSelfTest, setIsRunningSelfTest] = useState<boolean>(false);
  const [selfTestReport, setSelfTestReport] = useState<StorageSelfTestReport | null>(null);

  // Admin is authorized if unlocked via Shift+K+Y+T+1+2+3 OR signed in with authorized admin email
  const isAuthorizedAdmin = secretUnlocked || isAuthorizedAdminUser(currentUser);

  // Sync Shift+K+Y+T+1+2+3 unlock status
  useEffect(() => {
    const syncAdminState = () => {
      setSecretUnlocked(isSecretAdminUnlocked());
    };
    syncAdminState();
    window.addEventListener('kyt-admin-auth-changed', syncAdminState);
    return () => window.removeEventListener('kyt-admin-auth-changed', syncAdminState);
  }, [isOpen]);

  // Merge local + cloud events without duplicates
  const allEvents = useMemo(() => {
    const map = new Map<string, TrackingEventRecord>();
    for (const evt of localEvents) {
      map.set(evt.eventId, evt);
    }
    for (const evt of cloudEvents) {
      map.set(evt.eventId, evt);
    }
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.timestampIso).getTime() - new Date(a.timestampIso).getTime()
    );
  }, [localEvents, cloudEvents]);

  // Refresh Google Drive folder & file list
  const refreshDriveState = useCallback(async (token: string) => {
    try {
      const folder = await ensureKytDriveFolder(token);
      setDriveFolderLink(folder.webViewLink);
      const files = await listDriveTrackingFiles(token);
      setDriveFiles(files);
    } catch (err) {
      console.warn('Drive refresh warning:', err);
    }
  }, []);

  // Initialize Firebase Auth & check in-memory token
  useEffect(() => {
    const unsub = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setDriveToken(token);
        setAuthError('');
        setIsSyncingCloud(true);
        syncPendingLocalEventsToCloud()
          .then(() => loadTrackingConfigFromCloud())
          .then((cloudCfg) => {
            if (cloudCfg) setPixelConfig(cloudCfg);
          })
          .catch(() => {})
          .finally(() => setIsSyncingCloud(false));

        if (token) {
          refreshDriveState(token);
        }
      },
      () => {
        setCurrentUser(null);
        setDriveToken(null);
        setCloudEvents([]);
        setDriveFiles([]);
      }
    );
    return () => unsub();
  }, [refreshDriveState]);

  // Check in-memory token when modal opens
  useEffect(() => {
    if (!isOpen) return;
    getAccessToken().then((t) => {
      setDriveToken(t);
      if (t && isAuthorizedAdminUser(currentUser)) {
        refreshDriveState(t);
      }
    });
  }, [isOpen, currentUser, refreshDriveState]);

  // Subscribe to Server + Cloud events whenever Admin modal is open and unlocked
  useEffect(() => {
    if (!isOpen || !isAuthorizedAdmin) return;
    syncDealerApplicationsWithServerAndCloud().then((merged) => {
      setDealerRecords(merged);
    });
    const unsub = subscribeToCloudEvents((events) => {
      setCloudEvents(events);
      setLocalEvents(loadLocalEvents());
    });
    return () => unsub();
  }, [isOpen, isAuthorizedAdmin, currentUser]);

  // Listen to local tracking & dealer application updates
  useEffect(() => {
    if (!isOpen) return;
    const refreshLocal = () => {
      setLocalEvents(loadLocalEvents());
      setDealerRecords(loadDealerApplications());
    };
    refreshLocal();
    window.addEventListener('kyt-tracking-updated', refreshLocal);
    window.addEventListener('kyt-dealer-applications-updated', refreshLocal);
    return () => {
      window.removeEventListener('kyt-tracking-updated', refreshLocal);
      window.removeEventListener('kyt-dealer-applications-updated', refreshLocal);
    };
  }, [isOpen]);

  // Aggregated 30-Day (1 Month) Analytics Metrics
  const stats = useMemo(() => {
    let pageViews = 0;
    let mapDirections = 0;
    let ecommerceClicks = 0;
    let helmetViews = 0;
    let shopeeClicks = 0;
    let tiktokClicks = 0;

    const uniqueSessions = new Set<string>();
    const storeRanks = new Map<string, { name: string; province: string; count: number }>();
    const helmetRanks = new Map<string, { label: string; series: string; count: number }>();
    const provinceRanks = new Map<string, number>();
    const dailyMap = new Map<
      string,
      {
        dateKey: string;
        sessions: Set<string>;
        pageViews: number;
        totalEvents: number;
        storeClicks: number;
        ecommerceClicks: number;
      }
    >();

    for (const evt of allEvents) {
      if (evt.sessionId) {
        uniqueSessions.add(evt.sessionId);
      }

      const d = new Date(evt.timestampIso);
      const dateKey = Number.isNaN(d.getTime())
        ? new Date().toISOString().slice(0, 10)
        : d.toISOString().slice(0, 10);

      const dayEntry = dailyMap.get(dateKey) || {
        dateKey,
        sessions: new Set<string>(),
        pageViews: 0,
        totalEvents: 0,
        storeClicks: 0,
        ecommerceClicks: 0,
      };
      dayEntry.totalEvents += 1;
      if (evt.sessionId) dayEntry.sessions.add(evt.sessionId);

      if (evt.eventType === 'page_view') {
        pageViews++;
        dayEntry.pageViews += 1;
      } else if (
        evt.eventType === 'store_directions_click' ||
        evt.eventType === 'store_detail_open'
      ) {
        dayEntry.storeClicks += 1;
        if (evt.eventType === 'store_directions_click') mapDirections++;
        const existing = storeRanks.get(evt.targetId) || {
          name: evt.targetLabel,
          province: evt.category,
          count: 0,
        };
        existing.count += 1;
        storeRanks.set(evt.targetId, existing);
      } else if (evt.eventType === 'ecommerce_click') {
        ecommerceClicks++;
        dayEntry.ecommerceClicks += 1;
        if (evt.targetId === 'shopee') shopeeClicks++;
        if (evt.targetId === 'tiktok') tiktokClicks++;
      } else if (
        evt.eventType === 'helmet_select' ||
        evt.eventType === 'helmet_detail_view' ||
        evt.eventType === 'size_guide_interact'
      ) {
        helmetViews++;
        const existing = helmetRanks.get(evt.targetId) || {
          label: evt.targetLabel,
          series: evt.category,
          count: 0,
        };
        existing.count += 1;
        helmetRanks.set(evt.targetId, existing);
      } else if (evt.eventType === 'province_filter' && evt.targetId !== 'ALL') {
        provinceRanks.set(evt.targetLabel, (provinceRanks.get(evt.targetLabel) || 0) + 1);
      }

      dailyMap.set(dateKey, dayEntry);
    }

    const topStores = Array.from(storeRanks.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const topHelmets = Array.from(helmetRanks.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topProvinces = Array.from(provinceRanks.entries())
      .map(([province, count]) => ({ province, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const dailyHistory = Array.from(dailyMap.values())
      .sort((a, b) => b.dateKey.localeCompare(a.dateKey))
      .slice(0, 30)
      .map((item) => ({
        dateKey: item.dateKey,
        uniqueVisitors: item.sessions.size,
        pageViews: item.pageViews,
        totalEvents: item.totalEvents,
        storeClicks: item.storeClicks,
        ecommerceClicks: item.ecommerceClicks,
      }));

    const now = Date.now();
    const start30d = new Date(now - 30 * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN');
    const endNow = new Date(now).toLocaleDateString('vi-VN');

    return {
      uniqueVisitors: uniqueSessions.size,
      pageViews,
      mapDirections,
      ecommerceClicks,
      helmetViews,
      shopeeClicks,
      tiktokClicks,
      topStores,
      topHelmets,
      topProvinces,
      dailyHistory,
      periodLabel: `${start30d} – ${endNow}`,
    };
  }, [allEvents]);

  if (!isOpen) return null;

  const handleManualUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = manualKeyInput.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    if (cleaned === 'kyt123' || cleaned === 'shiftkyt123') {
      unlockSecretAdmin();
      setSecretUnlocked(true);
      setManualKeyInput('');
      setAuthError('');
    } else {
      setAuthError(
        isEn
          ? 'Invalid secret combination. Hold Shift and type K + Y + T + 1 + 2 + 3.'
          : 'Mã tổ hợp không đúng. Hãy giữ phím Shift và nhấn lần lượt K + Y + T + 1 + 2 + 3.'
      );
    }
  };

  // Optional Google Drive Sign-In for cloud sync
  const handleAdminGoogleSignIn = async () => {
    setAuthError('');
    setDriveStatusMsg('');
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setCurrentUser(result.user);
        setDriveToken(result.accessToken);
        setIsSyncingCloud(true);
        await syncPendingLocalEventsToCloud();
        setIsSyncingCloud(false);

        setIsDriveSyncing(true);
        const currentEvents = loadLocalEvents();
        const createdFile = await uploadNewTrackingFileToDrive(
          result.accessToken,
          currentEvents
        );
        await refreshDriveState(result.accessToken);
        setDriveStatusMsg(
          isEn
            ? `Synced & uploaded "${createdFile.name}" directly to your Google Drive!`
            : `Đã đồng bộ & chuyển thẳng tệp "${createdFile.name}" vào Google Drive của ${AUTHORIZED_ADMIN_EMAIL}!`
        );
      }
    } catch (err) {
      setAuthError(
        err instanceof Error
          ? err.message
          : isEn
            ? 'Google Drive connection failed.'
            : 'Kết nối Google Drive thất bại.'
      );
    } finally {
      setIsLoggingIn(false);
      setIsDriveSyncing(false);
    }
  };

  const handlePushNewReportToDrive = async () => {
    setAuthError('');
    setDriveStatusMsg('');
    const token = await getAccessToken();
    if (!token) {
      await handleAdminGoogleSignIn();
      return;
    }

    setIsDriveSyncing(true);
    try {
      const created = await uploadNewTrackingFileToDrive(token, allEvents);
      await refreshDriveState(token);
      setDriveStatusMsg(
        isEn
          ? `Successfully transferred ${allEvents.length} tracking records to Google Drive (${created.name}).`
          : `Đã chuyển thẳng ${allEvents.length} bản ghi tracking vào Google Drive (${created.name}).`
      );
    } catch (err) {
      setAuthError(
        err instanceof Error
          ? err.message
          : isEn
            ? 'Failed to upload to Google Drive.'
            : 'Không thể tải dữ liệu lên Google Drive.'
      );
    } finally {
      setIsDriveSyncing(false);
    }
  };

  const handleConfirmDriveMutation = async () => {
    if (!pendingConfirmation || !driveToken) return;
    const { type, file } = pendingConfirmation;
    setPendingConfirmation(null);
    setIsDriveSyncing(true);
    setAuthError('');
    setDriveStatusMsg('');

    try {
      if (type === 'overwrite') {
        const updated = await overwriteExistingDriveFile(
          driveToken,
          file.id,
          file.name,
          allEvents
        );
        await refreshDriveState(driveToken);
        setDriveStatusMsg(
          isEn
            ? `Updated "${updated.name}" in Google Drive with ${allEvents.length} records.`
            : `Đã cập nhật tệp "${updated.name}" trên Google Drive với ${allEvents.length} sự kiện mới nhất.`
        );
      } else if (type === 'delete') {
        await deleteDriveTrackingFile(driveToken, file.id);
        await refreshDriveState(driveToken);
        setDriveStatusMsg(
          isEn
            ? `Deleted "${file.name}" from Google Drive.`
            : `Đã xóa tệp "${file.name}" khỏi Google Drive.`
        );
      }
    } catch (err) {
      setAuthError(
        err instanceof Error
          ? err.message
          : isEn
            ? 'Google Drive operation failed.'
            : 'Thao tác trên Google Drive thất bại.'
      );
    } finally {
      setIsDriveSyncing(false);
    }
  };

  const handleSavePixelConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveMessage('');
    try {
      const synced = await saveTrackingConfigToCloud(pixelConfig);
      setSaveMessage(
        synced
          ? isEn
            ? 'Saved & synced to Cloud Firestore!'
            : 'Đã lưu & đồng bộ lên Cloud Firestore!'
          : isEn
            ? 'Saved locally!'
            : 'Đã lưu cấu hình!'
      );
      setTimeout(() => setSaveMessage(''), 3500);
    } catch {
      setSaveMessage(
        isEn ? 'Failed to sync config to Cloud.' : 'Không thể đồng bộ cấu hình lên Cloud.'
      );
    }
  };

  const handleExportTrackingCsv = () => {
    if (allEvents.length === 0) return;
    const headers = [
      'Event ID',
      'Timestamp',
      'Event Type',
      'Target ID',
      'Target Label',
      'Category / Province',
      'Device',
      'Language',
      'Session ID',
    ];
    const rows = allEvents.map((e) => [
      e.eventId,
      e.timestampIso,
      e.eventType,
      `"${e.targetId.replace(/"/g, '""')}"`,
      `"${e.targetLabel.replace(/"/g, '""')}"`,
      `"${e.category.replace(/"/g, '""')}"`,
      e.deviceType,
      e.lang,
      e.sessionId,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `kyt-vietnam-tracking-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearEvents = async () => {
    try {
      await clearAllTrackingEvents(cloudEvents);
      setLocalEvents([]);
      setCloudEvents([]);
    } catch {
      setLocalEvents([]);
    }
  };

  const handleRunSelfTest = async () => {
    setIsRunningSelfTest(true);
    try {
      const report = await runStorageSelfTest();
      setSelfTestReport(report);
      setDealerRecords(loadDealerApplications());
      setLocalEvents(loadLocalEvents());
    } finally {
      setIsRunningSelfTest(false);
    }
  };

  const handleCreateSampleDealerRecord = () => {
    submitDealerApplication({
      storeName: 'KYT Moto Center Sài Gòn (Hồ sơ Test)',
      contactName: 'Nguyễn Hoàng KYT',
      phone: '0909888999',
      email: 'dealer.test@kytvietnam.vn',
      city: 'TP. Hồ Chí Minh',
      address: '128 Nguyễn Thị Minh Khai, Quận 3, TP. Hồ Chí Minh',
      interestedLines: [
        'Full-Face (TT-REVO, NF-R, FALCON)',
        'Open-Face 3/4 (TTR-JET, VENOM OPEN, NFJ, COUGAR, VOODOO)',
      ],
      businessScale: 'Showroom / Cửa hàng chuyên doanh',
      notes: 'Hồ sơ mẫu tạo từ bảng Admin để kiểm tra lưu trữ .CSV đa tầng',
      lang,
    });
    setDealerRecords(loadDealerApplications());
  };

  // ==========================================================================
  // LOCKED STATE: UNLOCK VIA SHIFT + K + Y + T + 1 + 2 + 3
  // ==========================================================================
  if (!isAuthorizedAdmin) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-lock-title"
      >
        <div
          className="relative w-full max-w-md bg-[#0E0E12] text-white rounded-3xl border border-white/15 p-6 sm:p-8 shadow-2xl space-y-6 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-[#E10600] text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-[#E10600]/15 border border-[#E10600]/40 flex items-center justify-center mx-auto text-[#FF1E1A]">
            <Lock className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <span className="inline-block text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded bg-white/[0.06] text-[#FF1E1A] font-bold">
              PRIVATE ADMIN ACCESS · SHIFT + K + Y + T + 1 + 2 + 3
            </span>
            <h2 id="admin-lock-title" className="text-xl font-extrabold tracking-tight">
              {isEn
                ? 'Restricted Admin Portal'
                : 'Cổng Quản trị Dữ liệu Đại lý & Tracking'}
            </h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {isEn
                ? 'Hold Shift and press K + Y + T + 1 + 2 + 3 on your keyboard to unlock Admin access.'
                : 'Nhấn tổ hợp phím Shift + K + Y + T + 1 + 2 + 3 trên bàn phím để mở khóa quyền Admin ngay lập tức.'}
            </p>
          </div>

          {/* Visual Key Combination Badges */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 font-mono text-xs font-bold">
            {['Shift', 'K', 'Y', 'T', '1', '2', '3'].map((k, idx) => (
              <React.Fragment key={k}>
                <kbd className="px-2.5 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white shadow-inner">
                  {k}
                </kbd>
                {idx < 6 && <span className="text-neutral-500">+</span>}
              </React.Fragment>
            ))}
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-300 flex items-start gap-2 text-left">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleManualUnlockSubmit} className="flex items-center gap-2 pt-1">
            <input
              type="password"
              value={manualKeyInput}
              onChange={(e) => setManualKeyInput(e.target.value)}
              placeholder={
                isEn
                  ? 'Or enter keycode KYT123 on mobile...'
                  : 'Hoặc nhập nhanh KYT123 (nếu dùng điện thoại)...'
              }
              className="flex-1 h-10 px-3.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white font-mono focus:outline-none focus:border-[#E10600]"
            />
            <button
              type="submit"
              className="h-10 px-4 rounded-xl bg-[#E10600] hover:bg-[#B80500] text-white text-xs font-bold cursor-pointer shrink-0"
            >
              {isEn ? 'Unlock' : 'Mở khóa'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // UNLOCKED ADMIN DASHBOARD (Via Shift + K + Y + T + 1 + 2 + 3)
  // ==========================================================================
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tracking-modal-title"
    >
      <div
        className="relative w-full max-w-5xl max-h-[90vh] bg-[#0D0D10] text-white rounded-2xl sm:rounded-3xl border border-white/15 shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Header */}
        <div className="px-5 sm:px-8 py-4 sm:py-5 border-b border-white/10 flex flex-wrap items-center justify-between gap-4 bg-[#121216]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E10600]/15 border border-[#E10600]/40 flex items-center justify-center text-[#FF1E1A]">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center flex-wrap gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#E10600] font-bold">
                  KYT ADMIN PORTAL · SHIFT+K+Y+T+1+2+3
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  ADMIN UNLOCKED
                </span>
              </div>
              <h2
                id="tracking-modal-title"
                className="text-lg sm:text-xl font-extrabold tracking-tight"
              >
                {isEn
                  ? 'Dealer Registrations (.CSV) & Tracking Admin Center'
                  : 'Quản trị Hồ sơ Đăng ký Đại lý (.CSV) & Thống kê Website'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2.5 ml-auto">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs">
              <KeyRound className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-emerald-200 font-mono truncate max-w-[180px]">
                {currentUser?.email || 'Admin (Shift+KYT123)'}
              </span>
              <button
                type="button"
                onClick={() => {
                  lockSecretAdmin();
                  setSecretUnlocked(false);
                  if (currentUser) logout();
                  onClose();
                }}
                title={isEn ? 'Lock Admin Mode' : 'Khóa quyền Admin'}
                className="text-neutral-400 hover:text-white ml-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label={isEn ? 'Close' : 'Đóng'}
              className="w-9 h-9 rounded-xl bg-white/[0.07] hover:bg-[#E10600] text-white transition-colors flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="px-5 sm:px-8 py-2.5 bg-[#0A0A0C] border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('dealers')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'dealers'
                  ? 'bg-[#E10600] text-white'
                  : 'text-neutral-400 hover:text-white bg-white/[0.04]'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>
                {isEn
                  ? `Dealer Registrations .CSV (${dealerRecords.length})`
                  : `Đăng ký Đại lý .CSV (${dealerRecords.length})`}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-[#E10600] text-white'
                  : 'text-neutral-400 hover:text-white bg-white/[0.04]'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>
                {isEn
                  ? `Website Analytics (${allEvents.length})`
                  : `Thống kê Website (${allEvents.length})`}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('drive')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'drive'
                  ? 'bg-[#E10600] text-white'
                  : 'text-neutral-400 hover:text-white bg-white/[0.04]'
              }`}
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>
                {isEn
                  ? `Google Drive (${driveFiles.length})`
                  : `Google Drive (${driveFiles.length})`}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('pixels')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'pixels'
                  ? 'bg-[#E10600] text-white'
                  : 'text-neutral-400 hover:text-white bg-white/[0.04]'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>{isEn ? 'Marketing Pixels' : 'Mã Pixel'}</span>
            </button>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <button
              type="button"
              onClick={handleRunSelfTest}
              disabled={isRunningSelfTest}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunningSelfTest ? 'animate-spin' : ''}`} />
              <span>
                {isRunningSelfTest
                  ? isEn
                    ? 'Testing...'
                    : 'Đang kiểm tra...'
                  : isEn
                    ? 'Verify Storage (Self-Test)'
                    : 'Kiểm tra Lưu trữ (Self-Test)'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => downloadDealerApplicationsCsv(dealerRecords)}
              className="px-3.5 py-1.5 rounded-lg bg-[#E10600] hover:bg-[#B80500] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>
                {isEn
                  ? `Download Dealers .CSV (${dealerRecords.length})`
                  : `Tải CSV Đại lý (${dealerRecords.length})`}
              </span>
            </button>

            <button
              type="button"
              onClick={handleExportTrackingCsv}
              disabled={allEvents.length === 0}
              className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] disabled:opacity-40 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isEn ? 'Tracking .CSV' : 'Tải CSV Tracking'}</span>
            </button>
          </div>
        </div>

        {/* Status & Error Banners */}
        {authError && (
          <div className="px-6 py-2.5 bg-red-500/15 border-b border-red-500/30 text-xs text-red-300 flex items-center justify-between gap-3">
            <span>{authError}</span>
            <button
              type="button"
              onClick={() => setAuthError('')}
              className="text-red-200 hover:text-white text-[11px] underline cursor-pointer"
            >
              {isEn ? 'Dismiss' : 'Đóng'}
            </button>
          </div>
        )}

        {driveStatusMsg && (
          <div className="px-6 py-2.5 bg-emerald-500/15 border-b border-emerald-500/30 text-xs text-emerald-300 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{driveStatusMsg}</span>
            </div>
            {driveFolderLink && (
              <a
                href={driveFolderLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold text-emerald-200 hover:text-white underline"
              >
                <span>{isEn ? 'Open Google Drive Folder' : 'Mở thư mục Google Drive'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}

        {/* Mandatory User Confirmation Dialog for Overwriting or Deleting Drive Files */}
        {pendingConfirmation && (
          <div className="px-6 py-4 bg-amber-500/15 border-b border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <p className="font-bold text-amber-200">
                  {pendingConfirmation.type === 'overwrite'
                    ? isEn
                      ? `Confirm overwriting "${pendingConfirmation.file.name}" in Google Drive?`
                      : `Xác nhận cập nhật ghi đè tệp "${pendingConfirmation.file.name}" trên Google Drive?`
                    : isEn
                      ? `Confirm deleting "${pendingConfirmation.file.name}" from Google Drive?`
                      : `Xác nhận xóa vĩnh viễn tệp "${pendingConfirmation.file.name}" khỏi Google Drive?`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleConfirmDriveMutation}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs cursor-pointer"
              >
                {isEn ? 'Confirm' : 'Xác nhận'}
              </button>
              <button
                type="button"
                onClick={() => setPendingConfirmation(null)}
                className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer"
              >
                {isEn ? 'Cancel' : 'Hủy'}
              </button>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 sm:p-8 overflow-y-auto space-y-6 flex-1">
          {/* Interactive Self-Test Diagnostic Report Banner */}
          {selfTestReport && (
            <div className="p-5 rounded-2xl bg-[#111916] border border-emerald-500/40 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                      {selfTestReport.overallPassed
                        ? isEn
                          ? `ALL 4 STORAGE & TRACKING CHECKS PASSED (${selfTestReport.totalDurationMs}ms)`
                          : `KIỂM TRA ĐA TẦNG THÀNH CÔNG 100% (${selfTestReport.totalDurationMs}ms)`
                        : isEn
                          ? 'STORAGE DIAGNOSTIC REPORT'
                          : 'BÁO CÁO KIỂM TRA HỆ THỐNG LƯU TRỮ'}
                    </div>
                    <p className="text-xs text-neutral-300">
                      {isEn
                        ? 'Verified end-to-end write/read persistence across Browser Cache, Server Disk (.JSON/.CSV), and Cloud Sync.'
                        : 'Đã kiểm tra ghi & đọc đối chiếu thực tế trên Trình duyệt, Ổ đĩa Server (.JSON/.CSV) và Đồng bộ Cloud.'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelfTestReport(null)}
                  className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-neutral-200 cursor-pointer"
                >
                  {isEn ? 'Close Report' : 'Đóng báo cáo'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selfTestReport.steps.map((step) => (
                  <div
                    key={step.stepId}
                    className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                      step.passed
                        ? 'bg-black/40 border-emerald-500/30 text-neutral-200'
                        : 'bg-red-950/30 border-red-500/40 text-red-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 font-bold">
                      <span className={step.passed ? 'text-emerald-300' : 'text-red-300'}>
                        {step.passed ? '✓ PASS' : '✕ FAIL'} ·{' '}
                        {isEn ? step.titleEng : step.titleVie}
                      </span>
                      <span className="font-mono text-[11px] text-neutral-400">
                        {step.latencyMs}ms
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      {isEn ? step.detailEng : step.detailVie}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 0: DEALER APPLICATIONS (.CSV) — ADMIN ONLY */}
          {activeTab === 'dealers' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-[#141419] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#FF1E1A] font-bold">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>
                      {isEn
                        ? 'DEALER APPLICATIONS DATABASE (.CSV FORMAT — ADMIN ONLY)'
                        : 'DỮ LIỆU ĐĂNG KÝ LÀM ĐẠI LÝ (.CSV — ĐỒNG BỘ ĐA TẦNG SERVER + LOCAL + CLOUD)'}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    {isEn
                      ? 'Every dealer application submitted on the website is persisted to Server Disk (.JSON & .CSV), LocalStorage, and Cloud.'
                      : 'Mọi hồ sơ đăng ký từ mục "Trở thành đại lý" đều được lưu đồng thời vào ổ đĩa Server (.JSON & .CSV), trình duyệt và Cloud. Khách truy cập không thể xem dữ liệu này.'}
                  </p>
                </div>

                <div className="flex items-center flex-wrap gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleCreateSampleDealerRecord}
                    className="px-3.5 py-2.5 rounded-xl bg-white/[0.07] hover:bg-white/[0.14] border border-white/15 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isEn ? '+ Add Sample Record' : '+ Tạo 1 Hồ sơ Mẫu để Test'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => downloadDealerApplicationsCsv(dealerRecords)}
                    className="px-4 py-2.5 rounded-xl bg-[#E10600] hover:bg-[#B80500] text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>
                      {isEn
                        ? `Download .CSV File (${dealerRecords.length})`
                        : `Tải xuống file .CSV (${dealerRecords.length} hồ sơ)`}
                    </span>
                  </button>

                  {dealerRecords.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        clearAllDealerApplications();
                        setDealerRecords([]);
                      }}
                      className="px-3 py-2.5 rounded-xl bg-white/[0.05] hover:bg-red-500/20 border border-white/10 hover:border-red-500/40 text-xs text-neutral-400 hover:text-red-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isEn ? 'Clear All' : 'Xóa tất cả'}</span>
                    </button>
                  )}
                </div>
              </div>

              {dealerRecords.length === 0 ? (
                <div className="py-12 px-6 rounded-2xl bg-[#141419] border border-white/10 text-center space-y-2">
                  <Store className="w-8 h-8 text-neutral-500 mx-auto" />
                  <h3 className="text-sm font-bold text-white">
                    {isEn
                      ? 'No dealer applications submitted yet'
                      : 'Chưa có hồ sơ đăng ký đại lý nào'}
                  </h3>
                  <p className="text-xs text-neutral-400 max-w-md mx-auto">
                    {isEn
                      ? 'When prospective partners submit the "Become an Official KYT Dealer" form on the website, their applications will appear here and can be downloaded as a .CSV file.'
                      : 'Khi khách hàng gửi biểu mẫu tại mục "Trở thành Đại lý Chính hãng KYT", dữ liệu sẽ lập tức hiển thị tại đây để bạn kiểm tra và tải xuống file .CSV.'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Table of Dealer Applications */}
                  <div className="rounded-2xl bg-[#141419] border border-white/10 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-white/10 bg-black/40 font-mono text-[11px] uppercase text-neutral-400">
                            <th className="py-3 px-4">{isEn ? 'Time' : 'Thời gian'}</th>
                            <th className="py-3 px-4">{isEn ? 'Store Name' : 'Tên cửa hàng'}</th>
                            <th className="py-3 px-4">{isEn ? 'Contact' : 'Người liên hệ'}</th>
                            <th className="py-3 px-4">{isEn ? 'Phone' : 'Số điện thoại'}</th>
                            <th className="py-3 px-4">{isEn ? 'City / Province' : 'Tỉnh / Thành phố'}</th>
                            <th className="py-3 px-4">{isEn ? 'Interested Lines' : 'Dòng nón quan tâm'}</th>
                            <th className="py-3 px-4 text-right">{isEn ? 'Action' : 'Thao tác'}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.06]">
                          {dealerRecords.map((rec) => (
                            <tr key={rec.applicationId} className="hover:bg-white/[0.03]">
                              <td className="py-3 px-4 font-mono text-neutral-400 whitespace-nowrap">
                                {new Date(rec.createdAtIso).toLocaleString(
                                  isEn ? 'en-US' : 'vi-VN'
                                )}
                              </td>
                              <td className="py-3 px-4 font-bold text-white">
                                <div>{rec.storeName}</div>
                                <div className="text-[11px] font-normal text-neutral-400">
                                  {rec.businessScale}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-neutral-200">
                                <div>{rec.contactName}</div>
                                {rec.email !== 'N/A' && (
                                  <div className="text-[11px] text-neutral-500 font-mono">
                                    {rec.email}
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-4 font-mono font-bold text-emerald-400 whitespace-nowrap">
                                {rec.phone}
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-semibold text-[#FF1E1A]">{rec.city}</div>
                                {rec.address !== 'N/A' && (
                                  <div className="text-[11px] text-neutral-400 max-w-[200px] truncate">
                                    {rec.address}
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-4 text-neutral-300 max-w-[220px]">
                                <div className="truncate">{rec.interestedLines.join(', ')}</div>
                                {rec.notes && (
                                  <div className="text-[11px] text-amber-300/90 truncate">
                                    Ghi chú: {rec.notes}
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <button
                                  type="button"
                                  onClick={() => {
                                    deleteDealerApplication(rec.applicationId);
                                    setDealerRecords(loadDealerApplications());
                                  }}
                                  className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/25 text-red-300 transition-colors cursor-pointer"
                                  title={isEn ? 'Delete record' : 'Xóa hồ sơ'}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Live .CSV Raw Data Preview */}
                  <div className="p-4 rounded-2xl bg-[#0A0A0C] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                      <span>RAW .CSV CONTENT PREVIEW (UTF-8)</span>
                      <span>{dealerRecords.length} ROWS</span>
                    </div>
                    <pre className="text-[11px] font-mono text-emerald-300/90 overflow-x-auto max-h-36 p-3 rounded-xl bg-black border border-white/10">
                      {buildDealerApplicationsCsv(dealerRecords)}
                    </pre>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 1: ANALYTICS OVERVIEW (30-DAY ROLLING RETENTION) */}
          {activeTab === 'overview' && (
            <>
              {/* 30-Day Retention & Admin Visit Exclusion Banner */}
              <div className="p-4 rounded-2xl bg-[#141419] border border-emerald-500/30 flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center flex-wrap gap-2 text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>
                      {isEn
                        ? `30-DAY (1 MONTH) ROLLING RETENTION · ${stats.periodLabel}`
                        : `CHU KỲ LƯU TRỮ & TỔNG HỢP 1 THÁNG (30 NGÀY LIÊN TỤC: ${stats.periodLabel})`}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300">
                    {isEn
                      ? 'History is continuously aggregated across a 30-day rolling window (never resets daily). Admin visits and Admin mode interactions are automatically excluded from visitor counts.'
                      : 'Dữ liệu được cộng dồn liên tục xuyên suốt 30 ngày (không bị reset mỗi ngày) để phục vụ tổng hợp tháng. Mọi lượt truy cập của Admin đều tự động được loại trừ, không tính thành lượt truy cập mới.'}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-mono text-emerald-300 font-bold shrink-0">
                  {isEn ? 'ADMIN VISITS EXCLUDED' : 'ĐÃ LOẠI TRỪ LƯỢT ADMIN'}
                </span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 sm:p-5 rounded-2xl bg-[#141419] border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span>{isEn ? '30-Day Visits / Events' : 'Lượt truy cập (30 ngày)'}</span>
                    <Eye className="w-4 h-4 text-neutral-400" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-white">
                    {stats.uniqueVisitors}{' '}
                    <span className="text-sm font-normal text-neutral-400">
                      {isEn ? 'visitors' : 'khách'}
                    </span>
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    {isEn
                      ? `${stats.pageViews} page views · ${allEvents.length} total actions`
                      : `${stats.pageViews} lượt tải trang · ${allEvents.length} tương tác`}
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-[#141419] border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span>{isEn ? 'Google Maps Clicks (30d)' : 'Bấm Chỉ đường (30 ngày)'}</span>
                    <Navigation className="w-4 h-4 text-[#FF1E1A]" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-[#FF1E1A]">
                    {stats.mapDirections}
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    {isEn ? 'Direct navigation intent' : 'Khách bấm đi tới cửa hàng'}
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-[#141419] border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span>{isEn ? 'Shopee & TikTok (30d)' : 'Shopee & TikTok (30 ngày)'}</span>
                    <ShoppingBag className="w-4 h-4 text-[#EE4D2D]" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-[#EE4D2D]">
                    {stats.ecommerceClicks}
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    Shopee: {stats.shopeeClicks} · TikTok: {stats.tiktokClicks}
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-[#141419] border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span>{isEn ? 'Helmet & Size Checks (30d)' : 'Xem nón & Đo size (30 ngày)'}</span>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-amber-400">
                    {stats.helmetViews}
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    3D Coverflow + Bảng quy đổi size nón
                  </p>
                </div>
              </div>

              {/* 2-Column Breakdown: Top Dealers + Top Helmets / Provinces */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="p-5 rounded-2xl bg-[#141419] border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#E10600]" />
                      <span>
                        {isEn
                          ? 'Top Dealers by Customer Clicks (30 Days)'
                          : 'Top Đại lý được khách bấm nhiều nhất (30 ngày)'}
                      </span>
                    </h3>
                    {allEvents.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearEvents}
                        className="text-[11px] font-mono text-neutral-400 hover:text-red-400 cursor-pointer"
                      >
                        {isEn ? 'Clear 30d log' : 'Xóa lịch sử 30 ngày'}
                      </button>
                    )}
                  </div>

                  {stats.topStores.length > 0 ? (
                    <div className="space-y-3">
                      {stats.topStores.map((store, idx) => {
                        const maxCount = stats.topStores[0].count || 1;
                        const pct = Math.max(12, Math.round((store.count / maxCount) * 100));
                        return (
                          <div key={store.name + idx} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-white truncate">
                                {idx + 1}. {store.name}{' '}
                                <span className="text-neutral-400 font-normal">
                                  ({store.province})
                                </span>
                              </span>
                              <span className="font-mono font-bold text-[#FF1E1A] shrink-0">
                                {store.count} {isEn ? 'clicks' : 'lượt'}
                              </span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                              <div
                                className="h-full rounded-full bg-[#E10600]"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-500 py-6 text-center">
                      {isEn
                        ? 'No dealer clicks recorded yet.'
                        : 'Chưa có lượt click đại lý nào.'}
                    </p>
                  )}
                </div>

                <div className="p-5 rounded-2xl bg-[#141419] border border-white/10 space-y-5">
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                      {isEn
                        ? 'Most Viewed Helmet Models & Size Checks (30 Days)'
                        : 'Dòng nón & Bảng size được xem nhiều nhất (30 ngày)'}
                    </h3>
                    {stats.topHelmets.length > 0 ? (
                      <div className="space-y-2.5">
                        {stats.topHelmets.map((h, i) => (
                          <div
                            key={h.label + i}
                            className="flex items-center justify-between text-xs py-1.5 border-b border-white/[0.06]"
                          >
                            <div className="truncate pr-3">
                              <span className="font-semibold text-white">{h.label}</span>
                              <span className="text-neutral-500 ml-2 font-mono text-[11px]">
                                {h.series}
                              </span>
                            </div>
                            <span className="font-mono font-bold text-amber-400 shrink-0">
                              {h.count} {isEn ? 'views' : 'lượt'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-neutral-500 py-2">
                        {isEn ? 'No helmet views recorded yet.' : 'Chưa có dữ liệu xem nón.'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* 30-Day Daily Aggregation Table */}
              {stats.dailyHistory.length > 0 && (
                <div className="p-5 rounded-2xl bg-[#141419] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                      {isEn
                        ? 'Daily Traffic Summary (30-Day Rolling History)'
                        : 'Bảng Tổng hợp Truy cập Theo Ngày (Lưu trữ 30 ngày)'}
                    </h3>
                    <span className="text-[11px] font-mono text-emerald-400">
                      {stats.dailyHistory.length} {isEn ? 'active days' : 'ngày có dữ liệu'}
                    </span>
                  </div>
                  <div className="overflow-x-auto max-h-48">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-white/10 font-mono text-[11px] uppercase text-neutral-400">
                          <th className="py-2 pr-4">{isEn ? 'Date' : 'Ngày'}</th>
                          <th className="py-2 px-3">{isEn ? 'Unique Visitors' : 'Khách truy cập'}</th>
                          <th className="py-2 px-3">{isEn ? 'Page Views' : 'Lượt tải trang'}</th>
                          <th className="py-2 px-3">{isEn ? 'Dealer Clicks' : 'Click Đại lý'}</th>
                          <th className="py-2 px-3">{isEn ? 'E-Commerce' : 'Click TMĐT'}</th>
                          <th className="py-2 pl-3 text-right">{isEn ? 'Total Events' : 'Tổng tương tác'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.06] font-mono">
                        {stats.dailyHistory.map((day) => (
                          <tr key={day.dateKey} className="hover:bg-white/[0.03]">
                            <td className="py-2 pr-4 font-bold text-white">{day.dateKey}</td>
                            <td className="py-2 px-3 text-emerald-400 font-bold">
                              {day.uniqueVisitors}
                            </td>
                            <td className="py-2 px-3 text-neutral-300">{day.pageViews}</td>
                            <td className="py-2 px-3 text-[#FF1E1A]">{day.storeClicks}</td>
                            <td className="py-2 px-3 text-[#EE4D2D]">{day.ecommerceClicks}</td>
                            <td className="py-2 pl-3 text-right text-white font-bold">
                              {day.totalEvents}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 30-Day Event Log Stream (Full Date + Time) */}
              <div className="p-5 rounded-2xl bg-[#141419] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    {isEn
                      ? '30-Day Interaction Log Stream'
                      : 'Nhật ký Tương tác Chi tiết (Chu kỳ 30 ngày)'}
                  </h3>
                  <span className="text-[11px] font-mono text-neutral-400">
                    {isEn
                      ? `Showing latest ${Math.min(allEvents.length, 100)} of ${allEvents.length} events (30d)`
                      : `Hiển thị ${Math.min(allEvents.length, 100)} / ${allEvents.length} sự kiện trong 30 ngày`}
                  </span>
                </div>

                <div className="max-h-56 overflow-y-auto divide-y divide-white/[0.06]">
                  {allEvents.slice(0, 100).map((evt) => {
                    const meta = EVENT_TYPE_LABELS[evt.eventType] || {
                      vie: evt.eventType,
                      eng: evt.eventType,
                      color: 'text-neutral-300',
                    };
                    const timeStr = new Date(evt.timestampIso).toLocaleString(
                      isEn ? 'en-US' : 'vi-VN',
                      {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      }
                    );
                    return (
                      <div
                        key={evt.eventId}
                        className="py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="font-mono text-[11px] text-neutral-500 shrink-0">
                            {timeStr}
                          </span>
                          <span className={`font-bold shrink-0 ${meta.color}`}>
                            [{isEn ? meta.eng : meta.vie}]
                          </span>
                          <span className="text-white font-medium truncate">
                            {evt.targetLabel}
                          </span>
                          <span className="text-neutral-500 text-[11px] truncate">
                            · {evt.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400 shrink-0">
                          <span className="uppercase">{evt.deviceType}</span>
                          <span>·</span>
                          <span>{evt.lang}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* TAB 2: GOOGLE DRIVE DIRECT STORAGE */}
          {activeTab === 'drive' && (
            <div className="space-y-6">
              <div className="p-5 sm:p-6 rounded-2xl bg-[#141419] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-base font-extrabold text-white">
                      {isEn
                        ? 'Google Drive Direct Storage (KYT Vietnam Tracking Data)'
                        : 'Kho lưu trữ Google Drive Trực tiếp (KYT Vietnam Tracking Data)'}
                    </h3>
                  </div>
                  <p className="text-xs text-neutral-400">
                    {isEn
                      ? `Optional: Connect Google Drive to push CSV reports directly into your Drive folder.`
                      : `Tùy chọn nâng cao: Kết nối Google Drive để đẩy tự động tệp CSV vào thư mục trên Drive của bạn.`}
                  </p>
                </div>

                <div className="flex items-center flex-wrap gap-2.5 shrink-0">
                  {!driveToken ? (
                    <GoogleSignInButton
                      onClick={handleAdminGoogleSignIn}
                      disabled={isLoggingIn}
                      label={
                        isEn
                          ? 'Connect Google Drive'
                          : 'Kết nối Google Drive'
                      }
                    />
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => refreshDriveState(driveToken)}
                        className="px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>{isEn ? 'Refresh' : 'Làm mới'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handlePushNewReportToDrive}
                        disabled={isDriveSyncing}
                        className="px-4 py-2 rounded-xl bg-[#E10600] hover:bg-[#ff1e1a] disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>
                          {isDriveSyncing
                            ? isEn
                              ? 'Uploading...'
                              : 'Đang tải lên Drive...'
                            : isEn
                              ? 'Upload CSV to Drive'
                              : 'Tải CSV lên Google Drive'}
                        </span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EXTERNAL PIXELS */}
          {activeTab === 'pixels' && (
            <form onSubmit={handleSavePixelConfig} className="space-y-6">
              <div className="p-5 sm:p-6 rounded-2xl bg-[#141419] border border-white/10 space-y-5">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">
                    {isEn
                      ? 'External Marketing Pixels & Tag Manager'
                      : 'Tích hợp Mã Tracking Quảng cáo (GA4, GTM, Facebook Pixel, TikTok)'}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300">
                      Google Analytics 4 (Measurement ID)
                    </label>
                    <input
                      type="text"
                      maxLength={MAX_PIXEL_ID_LENGTH}
                      placeholder="G-XXXXXXXXXX"
                      value={pixelConfig.ga4MeasurementId}
                      onChange={(e) =>
                        setPixelConfig({ ...pixelConfig, ga4MeasurementId: e.target.value })
                      }
                      className="w-full h-11 px-3.5 rounded-xl bg-black/50 border border-white/15 text-sm text-white font-mono focus:outline-none focus:border-[#E10600]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300">
                      Google Tag Manager (Container ID)
                    </label>
                    <input
                      type="text"
                      maxLength={MAX_PIXEL_ID_LENGTH}
                      placeholder="GTM-XXXXXXX"
                      value={pixelConfig.gtmContainerId}
                      onChange={(e) =>
                        setPixelConfig({ ...pixelConfig, gtmContainerId: e.target.value })
                      }
                      className="w-full h-11 px-3.5 rounded-xl bg-black/50 border border-white/15 text-sm text-white font-mono focus:outline-none focus:border-[#E10600]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300">
                      Meta / Facebook Pixel ID
                    </label>
                    <input
                      type="text"
                      maxLength={MAX_PIXEL_ID_LENGTH}
                      placeholder="123456789012345"
                      value={pixelConfig.metaPixelId}
                      onChange={(e) =>
                        setPixelConfig({ ...pixelConfig, metaPixelId: e.target.value })
                      }
                      className="w-full h-11 px-3.5 rounded-xl bg-black/50 border border-white/15 text-sm text-white font-mono focus:outline-none focus:border-[#E10600]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300">
                      TikTok Pixel ID
                    </label>
                    <input
                      type="text"
                      maxLength={MAX_PIXEL_ID_LENGTH}
                      placeholder="CXXXXXXXXXXXXXXXXX"
                      value={pixelConfig.tiktokPixelId}
                      onChange={(e) =>
                        setPixelConfig({ ...pixelConfig, tiktokPixelId: e.target.value })
                      }
                      className="w-full h-11 px-3.5 rounded-xl bg-black/50 border border-white/15 text-sm text-white font-mono focus:outline-none focus:border-[#E10600]"
                    />
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-white/10">
                  <label className="flex items-center gap-2.5 text-xs text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pixelConfig.enableAutoTracking === 'true'}
                      onChange={(e) =>
                        setPixelConfig({
                          ...pixelConfig,
                          enableAutoTracking: e.target.checked ? 'true' : 'false',
                        })
                      }
                      className="w-4 h-4 accent-[#E10600] rounded"
                    />
                    <span>
                      {isEn
                        ? 'Enable automatic interaction tracking across all sections'
                        : 'Bật tự động ghi nhận tương tác trên toàn bộ trang web'}
                    </span>
                  </label>

                  <div className="flex items-center gap-3">
                    {saveMessage && (
                      <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{saveMessage}</span>
                      </span>
                    )}
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-[#E10600] hover:bg-[#ff1e1a] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      {isEn ? 'Save & Activate Pixels' : 'Lưu & Kích hoạt Mã Tracking'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
