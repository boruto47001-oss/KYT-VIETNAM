import React, { useState } from 'react';
import { X, MapPin, Navigation, Copy, Check, ShieldCheck } from 'lucide-react';
import { StoreLocation, Language, getStoreMapsUrl } from '../data/kytData';
import { StoreShowroomVisual } from './SmartAssetImage';
import { trackKytEvent } from '../lib/tracking';

interface StoreDetailModalProps {
  store: StoreLocation | null;
  onClose: () => void;
  lang?: Language;
}

const translateProductLine = (line: string, isEn: boolean): string => {
  if (!isEn) return line;
  return line
    .replace('Áo mưa & Phụ kiện KYT', 'KYT Rainwear & Accessories')
    .replace('Phụ kiện & Kính KYT', 'KYT Visors & Accessories')
    .replace('Phụ kiện KYT', 'KYT Accessories')
    .replace('Áo mưa KYT', 'KYT Rainwear');
};

export const StoreDetailModal: React.FC<StoreDetailModalProps> = ({
  store,
  onClose,
  lang = 'VIE',
}) => {
  const [copied, setCopied] = useState(false);
  const isEn = lang === 'ENG';

  if (!store) return null;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(`${store.name} - ${store.address}`);
    setCopied(true);
    trackKytEvent({
      eventType: 'store_address_copy',
      targetId: store.id,
      targetLabel: store.name,
      category: store.province,
      lang,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDirectionsClick = () => {
    trackKytEvent({
      eventType: 'store_directions_click',
      targetId: store.id,
      targetLabel: store.name,
      category: store.province,
      lang,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm transition-opacity duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-store-title"
    >
      <div
        className="relative w-full max-w-xl bg-white text-[#1D1D1F] rounded-2xl border border-neutral-200 overflow-hidden shadow-2xl transition-transform duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Image Banner */}
        <div className="relative aspect-[16/9] w-full bg-[#F5F5F7] border-b border-neutral-200">
          <StoreShowroomVisual
            preset={store.interiorPreset}
            storeName={store.name}
            district={store.district}
            province={store.province}
          />
          <button
            onClick={onClose}
            aria-label={isEn ? 'Close modal' : 'Đóng cửa sổ'}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/75 text-white hover:bg-[#E10600] transition-colors flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Header & Unboxed Metadata */}
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#6E6E73] mb-2">
              <span className="text-[#E10600] font-semibold">{store.province}</span>
              <span aria-hidden="true">·</span>
              <span>{store.district}</span>
            </div>
            <h3 id="modal-store-title" className="text-2xl font-bold tracking-tight text-[#0A0A0A]">
              {store.name}
            </h3>
          </div>

          {/* Core Address Info */}
          <div className="py-5 border-y border-neutral-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-[#6E6E73]">
              <MapPin className="w-4 h-4 text-[#E10600] shrink-0" />
              <span>
                {isEn
                  ? 'Store Address (Click for direct Google Maps navigation)'
                  : 'Địa chỉ cửa hàng (Bấm để mở bản đồ)'}
              </span>
            </div>
            <a
              href={getStoreMapsUrl(store.address)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleDirectionsClick}
              className="block text-base text-[#0A0A0A] hover:text-[#E10600] hover:underline leading-relaxed font-semibold transition-colors"
            >
              {store.address}
            </a>
          </div>

          {/* Available Helmet Lines */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6E6E73] mb-2.5 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#E10600]" />
              <span>
                {isEn
                  ? 'Authorized KYT Product Lines Available'
                  : 'Các dòng sản phẩm KYT phân phối tại điểm bán'}
              </span>
            </h4>
            <p className="text-sm text-[#1D1D1F] leading-relaxed">
              {store.availableLines.map((line) => translateProductLine(line, isEn)).join(' · ')}
            </p>
          </div>

          {/* Action Bar */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={handleCopyAddress}
              className="px-4 py-2.5 text-xs font-semibold text-[#1D1D1F] bg-[#F5F5F7] hover:bg-neutral-200 rounded-lg transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[#E10600]" />
                  <span>{isEn ? 'Address Copied' : 'Đã sao chép địa chỉ'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>{isEn ? 'Copy Address' : 'Sao chép địa chỉ'}</span>
                </>
              )}
            </button>

            <a
              href={getStoreMapsUrl(store.address)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleDirectionsClick}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-[#E10600] hover:bg-[#B80500] rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>{isEn ? 'Get Directions on Google Maps' : 'Mở chỉ đường Google Maps'}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
