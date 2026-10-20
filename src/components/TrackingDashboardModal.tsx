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
    className="gsi-material-button inline-flex items-center justify-center gap-3 px-5 py-3 rounded-xl bg-white hover:bg-neutral-100 text-[#1f1f1f] font-semibold text-sm shadow-lg transition-all cursor-pointer disabled:opacity-50"
  >
    <div className="gsi-material-button-state" />
    <div className="gsi-material-button-content-wrapper flex items-center gap-3">
      <div className="gsi-material-button-icon w-5 h-5 shrink-0">
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
  const [activeTab, setActiveTab] = useState<'overview' | 'drive' | 'pixels'>('overview');
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [driveToken, setDriveToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  const [localEvents, setLocalEvents] = useState<TrackingEventRecord[]>([]);
  const [cloudEvents, setCloudEvents] = useState<TrackingEventRecord[]>([]);
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

  const isAuthorizedAdmin = isAuthorizedAdminUser(currentUser);

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

  // Also check in-memory token when modal opens
  useEffect(() => {
    if (!isOpen) return;
    getAccessToken().then((t) => {
      setDriveToken(t);
      if (t && isAuthorizedAdmin) {
        refreshDriveState(t);
      }
    });
  }, [isOpen, isAuthorizedAdmin, refreshDriveState]);

  // Subscribe to Firestore cloud events when signed in as boruto47001@gmail.com
  useEffect(() => {
    if (!isOpen || !isAuthorizedAdmin) return;
    const unsub = subscribeToCloudEvents((events) => {
      setCloudEvents(events);
    });
    return () => unsub();
  }, [isOpen, isAuthorizedAdmin]);

  // Listen to local tracking updates
  useEffect(() => {
    if (!isOpen) return;
    const refreshLocal = () => {
      setLocalEvents(loadLocalEvents());
    };
    refreshLocal();
    window.addEventListener('kyt-tracking-updated', refreshLocal);
    return () => window.removeEventListener('kyt-tracking-updated', refreshLocal);
  }, [isOpen]);

  // Aggregated Analytics Metrics
  const stats = useMemo(() => {
    let pageViews = 0;
    let mapDirections = 0;
    let ecommerceClicks = 0;
    let helmetViews = 0;
    let shopeeClicks = 0;
    let tiktokClicks = 0;

    const storeRanks = new Map<string, { name: string; province: string; count: number }>();
    const helmetRanks = new Map<string, { label: string; series: string; count: number }>();
    const provinceRanks = new Map<string, number>();

    for (const evt of allEvents) {
      if (evt.eventType === 'page_view') {
        pageViews++;
      } else if (
        evt.eventType === 'store_directions_click' ||
        evt.eventType === 'store_detail_open'
      ) {
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
        if (evt.targetId === 'shopee') shopeeClicks++;
        if (evt.targetId === 'tiktok') tiktokClicks++;
      } else if (evt.eventType === 'helmet_select' || evt.eventType === 'helmet_detail_view') {
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

    return {
      pageViews,
      mapDirections,
      ecommerceClicks,
      helmetViews,
      shopeeClicks,
      tiktokClicks,
      topStores,
      topHelmets,
      topProvinces,
    };
  }, [allEvents]);

  if (!isOpen) return null;

  // Handle Google Sign-In + Auto Cloud Admin Sync + Auto Google Drive Transfer
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

        // Automatically transfer collected tracking data directly to Google Drive on login
        setIsDriveSyncing(true);
        const currentEvents = loadLocalEvents();
        const createdFile = await uploadNewTrackingFileToDrive(
          result.accessToken,
          currentEvents
        );
        await refreshDriveState(result.accessToken);
        setDriveStatusMsg(
          isEn
            ? `Synced Cloud Admin & uploaded "${createdFile.name}" directly to your Google Drive!`
            : `Đã đồng bộ Cloud Admin & chuyển thẳng tệp "${createdFile.name}" vào Google Drive của ${AUTHORIZED_ADMIN_EMAIL}!`
        );
      }
    } catch (err) {
      setAuthError(
        err instanceof Error
          ? err.message
          : isEn
            ? 'Google sign-in failed.'
            : 'Đăng nhập Google thất bại.'
      );
    } finally {
      setIsLoggingIn(false);
      setIsDriveSyncing(false);
    }
  };

  // Create a new tracking report file directly in Google Drive
  const handlePushNewReportToDrive = async () => {
    setAuthError('');
    setDriveStatusMsg('');
    let token = await getAccessToken();
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

  // Execute confirmed overwrite or delete on Google Drive
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

  const handleExportCsv = () => {
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

  // ==========================================================================
  // LOCKED STATE: ONLY boruto47001@gmail.com CAN VIEW OR ACCESS THIS PANEL
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
              PRIVATE CLOUD ADMIN · STEALTH MODE
            </span>
            <h2 id="admin-lock-title" className="text-xl font-extrabold tracking-tight">
              {isEn
                ? 'Restricted Cloud Admin Portal'
                : 'Cổng Quản trị Tracking Nội bộ'}
            </h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {isEn
                ? `This tracking system is hidden from public visitors and locked exclusively to ${AUTHORIZED_ADMIN_EMAIL}. Collected data is synced directly to your Google Drive.`
                : `Hệ thống Tracking đã được ẩn hoàn toàn khỏi khách truy cập và chỉ mở khóa duy nhất cho tài khoản Cloud Admin (${AUTHORIZED_ADMIN_EMAIL}). Dữ liệu thu thập được sẽ chuyển thẳng vào Google Drive của bạn.`}
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-300 flex items-start gap-2 text-left">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <div className="pt-1 flex justify-center">
            <GoogleSignInButton
              onClick={handleAdminGoogleSignIn}
              disabled={isLoggingIn}
              label={
                isLoggingIn
                  ? isEn
                    ? 'Connecting Cloud Admin & Drive...'
                    : 'Đang đồng bộ Admin & Google Drive...'
                  : isEn
                    ? 'Sign in with Google (Admin)'
                    : 'Sign in with Google (Đồng bộ Admin & Drive)'
              }
            />
          </div>

          <p className="text-[11px] font-mono text-neutral-500">
            {isEn
              ? 'Secret shortcut: Ctrl + Shift + K or 5 clicks on footer ©'
              : 'Phím tắt mở nhanh cho Admin: Ctrl + Shift + K hoặc bấm 5 lần vào dấu © ở chân trang'}
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // UNLOCKED DASHBOARD (Strictly for boruto47001@gmail.com)
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
                  KYT PRIVATE ADMIN · STEALTH TRACKING
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  HIDDEN FROM PUBLIC
                </span>
              </div>
              <h2
                id="tracking-modal-title"
                className="text-lg sm:text-xl font-extrabold tracking-tight"
              >
                {isEn
                  ? 'Cloud Admin & Google Drive Tracking Center'
                  : 'Trung tâm Tracking Cloud Admin & Google Drive'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2.5 ml-auto">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs">
              <Cloud className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-emerald-200 font-mono truncate max-w-[180px]">
                {currentUser?.email}
              </span>
              <button
                type="button"
                onClick={() => {
                  logout();
                  onClose();
                }}
                title={isEn ? 'Sign out & lock' : 'Đăng xuất & Khóa'}
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
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-[#E10600] text-white'
                  : 'text-neutral-400 hover:text-white bg-white/[0.04]'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{isEn ? 'Analytics Overview' : 'Thống kê Chuyển đổi'}</span>
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
                  ? `Google Drive Sync (${driveFiles.length})`
                  : `Google Drive của bạn (${driveFiles.length})`}
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
              <span>{isEn ? 'GA4 / Meta / TikTok Pixels' : 'Mã Pixel (GA4 / FB / TikTok)'}</span>
            </button>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {isSyncingCloud && (
              <span className="text-[11px] font-mono text-neutral-400">
                {isEn ? 'Syncing Firestore...' : 'Đang đồng bộ Cloud...'}
              </span>
            )}

            <button
              type="button"
              onClick={handlePushNewReportToDrive}
              disabled={isDriveSyncing}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>
                {isDriveSyncing
                  ? isEn
                    ? 'Uploading to Drive...'
                    : 'Đang chuyển vào Drive...'
                  : isEn
                    ? 'Send Data to Google Drive'
                    : 'Chuyển thẳng vào Google Drive'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              disabled={allEvents.length === 0}
              className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] disabled:opacity-40 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#E10600]" />
              <span>{isEn ? 'Download CSV' : 'Tải CSV'}</span>
            </button>

            {allEvents.length > 0 && (
              <button
                type="button"
                onClick={handleClearEvents}
                className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-red-500/20 border border-white/10 hover:border-red-500/40 text-xs text-neutral-400 hover:text-red-300 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isEn ? 'Reset' : 'Xóa bộ đếm'}</span>
              </button>
            )}
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
                <p className="text-amber-100/80">
                  {pendingConfirmation.type === 'overwrite'
                    ? isEn
                      ? `This will replace the file content with the latest ${allEvents.length} tracking records.`
                      : `Thao tác này sẽ ghi đè nội dung tệp bằng ${allEvents.length} bản ghi sự kiện mới nhất.`
                    : isEn
                      ? 'This file will be permanently removed from your Google Drive.'
                      : 'Tệp báo cáo này sẽ bị xóa khỏi thư mục Google Drive của bạn.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleConfirmDriveMutation}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs cursor-pointer"
              >
                {isEn ? 'Confirm' : 'Xác nhận thực hiện'}
              </button>
              <button
                type="button"
                onClick={() => setPendingConfirmation(null)}
                className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer"
              >
                {isEn ? 'Cancel' : 'Hủy bỏ'}
              </button>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 sm:p-8 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'overview' && (
            <>
              {/* Quick Google Drive Banner inside Overview */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#141A17] via-[#12151B] to-[#171316] border border-emerald-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                    <HardDrive className="w-4 h-4" />
                    <span>
                      {isEn
                        ? 'Direct Google Drive Pipeline Active'
                        : 'Kết nối Chuyển thẳng Dữ liệu vào Google Drive'}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300">
                    {driveToken
                      ? isEn
                        ? `Connected to ${AUTHORIZED_ADMIN_EMAIL}'s Google Drive (Folder: "KYT Vietnam Tracking Data").`
                        : `Đã kết nối trực tiếp tới Google Drive của ${AUTHORIZED_ADMIN_EMAIL} (Thư mục: "KYT Vietnam Tracking Data").`
                      : isEn
                        ? 'Click "Connect Google Drive Session" to authorize direct file uploads for this browser session.'
                        : 'Bấm "Kết nối phiên Google Drive" để đẩy tự động tệp báo cáo CSV thẳng vào Google Drive của bạn.'}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  {!driveToken ? (
                    <GoogleSignInButton
                      onClick={handleAdminGoogleSignIn}
                      disabled={isLoggingIn}
                      label={
                        isEn
                          ? 'Connect Google Drive Session'
                          : 'Kết nối phiên Google Drive'
                      }
                    />
                  ) : (
                    <>
                      {driveFolderLink && (
                        <a
                          href={driveFolderLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <FolderOpen className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{isEn ? 'Open Drive Folder' : 'Mở thư mục Drive'}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => setActiveTab('drive')}
                        className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold cursor-pointer"
                      >
                        {isEn ? 'Manage Drive Files' : 'Quản lý tệp trên Drive'}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* 4 KPI Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 sm:p-5 rounded-2xl bg-[#141419] border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span>{isEn ? 'Total Events / Views' : 'Tổng lượt tương tác'}</span>
                    <Eye className="w-4 h-4 text-neutral-400" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-white">
                    {allEvents.length}
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    {isEn ? `${stats.pageViews} page loads` : `${stats.pageViews} lượt tải trang`}
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-[#141419] border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span>{isEn ? 'Google Maps Clicks' : 'Bấm Chỉ đường Đại lý'}</span>
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
                    <span>{isEn ? 'Shopee & TikTok Clicks' : 'Click Shopee & TikTok'}</span>
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
                    <span>{isEn ? '3D Helmet Explorations' : 'Xem dòng nón 3D'}</span>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-amber-400">
                    {stats.helmetViews}
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    TT-REVO · TTR-JET · TIGER JET
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
                          ? 'Top Dealers by Customer Clicks'
                          : 'Top Đại lý được khách bấm nhiều nhất'}
                      </span>
                    </h3>
                    <span className="text-[11px] font-mono text-neutral-400">
                      {isEn ? 'Maps + Details' : 'Chỉ đường + Chi tiết'}
                    </span>
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
                        ? 'Most Viewed Helmet Models & Graphics'
                        : 'Dòng nón & Tem nón được xem nhiều nhất'}
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

                  <div className="pt-2 border-t border-white/10 space-y-2.5">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                      {isEn
                        ? 'Most Filtered Provinces / Cities'
                        : 'Tỉnh / Thành phố được lọc tìm nhiều nhất'}
                    </h4>
                    {stats.topProvinces.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {stats.topProvinces.map((item) => (
                          <span
                            key={item.province}
                            className="px-2.5 py-1 rounded-lg bg-white/[0.06] border border-white/10 text-xs text-white font-medium"
                          >
                            {item.province}:{' '}
                            <strong className="text-[#FF1E1A] font-mono">{item.count}</strong>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-neutral-500">
                        {isEn
                          ? 'No province filter selections yet.'
                          : 'Chưa có lượt chọn bộ lọc Tỉnh / Thành phố.'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Real-Time Event Log Stream */}
              <div className="p-5 rounded-2xl bg-[#141419] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    {isEn ? 'Real-Time Event Stream' : 'Nhật ký Tương tác Thời gian thực'}
                  </h3>
                  <span className="text-[11px] font-mono text-neutral-400">
                    {isEn
                      ? `Showing latest ${Math.min(allEvents.length, 25)} events`
                      : `Hiển thị ${Math.min(allEvents.length, 25)} sự kiện gần nhất`}
                  </span>
                </div>

                <div className="max-h-56 overflow-y-auto divide-y divide-white/[0.06]">
                  {allEvents.slice(0, 25).map((evt) => {
                    const meta = EVENT_TYPE_LABELS[evt.eventType] || {
                      vie: evt.eventType,
                      eng: evt.eventType,
                      color: 'text-neutral-300',
                    };
                    const timeStr = new Date(evt.timestampIso).toLocaleTimeString(
                      isEn ? 'en-US' : 'vi-VN',
                      { hour: '2-digit', minute: '2-digit', second: '2-digit' }
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
                          {evt.syncedToCloud && (
                            <span
                              title="Synced to Firestore"
                              className="text-emerald-400 font-bold"
                            >
                              ● Cloud
                            </span>
                          )}
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
                      ? `All exported tracking spreadsheets are saved directly inside the "KYT Vietnam Tracking Data" folder in ${AUTHORIZED_ADMIN_EMAIL}'s Google Drive.`
                      : `Toàn bộ dữ liệu tracking thu thập trên website được đóng gói thành bảng tính CSV (mở trực tiếp bằng Google Sheets) trong thư mục "KYT Vietnam Tracking Data" trên Google Drive của ${AUTHORIZED_ADMIN_EMAIL}.`}
                  </p>
                </div>

                <div className="flex items-center flex-wrap gap-2.5 shrink-0">
                  {!driveToken ? (
                    <GoogleSignInButton
                      onClick={handleAdminGoogleSignIn}
                      disabled={isLoggingIn}
                      label={
                        isEn
                          ? 'Sign in with Google to Sync Drive'
                          : 'Sign in with Google (Kết nối Google Drive)'
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

                      {driveFolderLink && (
                        <a
                          href={driveFolderLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 text-xs font-semibold flex items-center gap-1.5"
                        >
                          <FolderOpen className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{isEn ? 'Open Drive Folder' : 'Mở thư mục trên Drive'}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}

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
                              ? 'Create New Report in Drive'
                              : 'Tạo bản ghi mới vào Google Drive'}
                        </span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* List of Files inside Google Drive */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#141419] border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-300 font-bold">
                    {isEn
                      ? 'Tracking Report Files in Your Google Drive'
                      : 'Danh sách Tệp dữ liệu Tracking trong Google Drive của bạn'}
                  </h4>
                  <span className="text-xs font-mono text-neutral-500">
                    {driveFiles.length} {isEn ? 'files' : 'tệp'}
                  </span>
                </div>

                {!driveToken ? (
                  <p className="text-xs text-neutral-400 py-8 text-center">
                    {isEn
                      ? 'Connect your Google Drive session above to view and manage your tracking files.'
                      : 'Vui lòng bấm nút "Sign in with Google" phía trên để kết nối phiên làm việc với Google Drive.'}
                  </p>
                ) : driveFiles.length === 0 ? (
                  <div className="py-8 text-center space-y-3">
                    <p className="text-xs text-neutral-400">
                      {isEn
                        ? 'No tracking files in your Google Drive folder yet.'
                        : 'Chưa có tệp báo cáo nào trong thư mục Google Drive của bạn.'}
                    </p>
                    <button
                      type="button"
                      onClick={handlePushNewReportToDrive}
                      disabled={isDriveSyncing}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
                    >
                      <HardDrive className="w-4 h-4" />
                      <span>
                        {isEn
                          ? 'Send Current Data to Google Drive Now'
                          : 'Chuyển thẳng dữ liệu hiện tại vào Google Drive ngay'}
                      </span>
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-white/[0.08]">
                    {driveFiles.map((file) => (
                      <div
                        key={file.id}
                        className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <FileSpreadsheet className="w-5 h-5 text-emerald-400 shrink-0" />
                          <div className="min-w-0">
                            <p className="font-bold text-white truncate">{file.name}</p>
                            <p className="text-[11px] text-neutral-400 font-mono">
                              {isEn ? 'Updated: ' : 'Cập nhật: '}
                              {new Date(file.modifiedTime).toLocaleString(
                                isEn ? 'en-US' : 'vi-VN'
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center flex-wrap gap-2 shrink-0">
                          {file.webViewLink && (
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-semibold flex items-center gap-1"
                            >
                              <span>{isEn ? 'Open in Drive' : 'Mở trên Drive'}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              setPendingConfirmation({ type: 'overwrite', file })
                            }
                            className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-neutral-200 font-semibold cursor-pointer"
                          >
                            {isEn ? 'Update with Latest Data' : 'Cập nhật dữ liệu mới nhất'}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setPendingConfirmation({ type: 'delete', file })
                            }
                            className="px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/25 border border-red-500/25 text-red-300 cursor-pointer"
                            title={isEn ? 'Delete from Drive' : 'Xóa khỏi Drive'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                  <p className="text-xs text-neutral-400">
                    {isEn
                      ? 'Enter your tracking IDs below. Every dealer click, Google Maps direction click, and Shopee/TikTok click will automatically fire events to these platforms.'
                      : 'Nhập mã ID của bạn vào bên dưới. Mọi lượt khách bấm Chỉ đường Google Maps, mở xem đại lý, xem nón 3D hoặc bấm mua Shopee / TikTok sẽ tự động bắn sự kiện (Event) về trình quản lý quảng cáo.'}
                  </p>
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
