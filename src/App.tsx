/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Navigation,
  ChevronRight,
  RotateCcw,
  Search,
  ArrowDown,
  ExternalLink,
  ShoppingBag,
} from 'lucide-react';
import {
  INITIAL_BRAND_CONFIG,
  INITIAL_FLAGSHIP_HELMETS,
  INITIAL_STORE_LOCATIONS,
  OFFICIAL_ONLINE_CHANNELS,
  StoreLocation,
  getStoreMapsUrl,
} from './data/kytData';
import { KytBrandLogo, ShopeeOfficialLogo, StoreShowroomVisual } from './components/SmartAssetImage';
import { HelmetCoverflowGallery } from './components/HelmetCoverflowGallery';
import { StoreDetailModal } from './components/StoreDetailModal';

export default function App() {
  const brandConfig = INITIAL_BRAND_CONFIG;
  const helmets = INITIAL_FLAGSHIP_HELMETS;
  const stores = INITIAL_STORE_LOCATIONS;

  // Hero Flagship Helmet Switcher State (TT-REVO, TTR-JET, TIGER JET)
  const [activeHelmetId, setActiveHelmetId] = useState<string>(helmets[0].id);

  // Store Locator Cascading Filter State (Province -> District + Search)
  const [selectedProvince, setSelectedProvince] = useState<string>('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Store Detail Modal State
  const [activeStoreModal, setActiveStoreModal] = useState<StoreLocation | null>(null);

  // Extract unique Provinces with store counts
  const provincesWithCounts = useMemo(() => {
    const countsMap = new Map<string, number>();
    stores.forEach((store) => {
      countsMap.set(store.province, (countsMap.get(store.province) || 0) + 1);
    });
    return Array.from(countsMap.entries())
      .map(([province, count]) => ({ province, count }))
      .sort((a, b) => b.count - a.count);
  }, [stores]);

  // Extract unique Districts dynamically based on selectedProvince
  const availableDistricts = useMemo(() => {
    const relevantStores =
      selectedProvince === 'ALL'
        ? stores
        : stores.filter((s) => s.province === selectedProvince);

    const districtCounts = new Map<string, number>();
    relevantStores.forEach((store) => {
      districtCounts.set(store.district, (districtCounts.get(store.district) || 0) + 1);
    });

    return Array.from(districtCounts.entries()).map(([district, count]) => ({
      district,
      count,
    }));
  }, [stores, selectedProvince]);

  const handleSelectProvince = (province: string) => {
    setSelectedProvince(province);
    setSelectedDistrict('ALL');
  };

  // Filtered Stores
  const filteredStores = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return stores.filter((store) => {
      const matchProvince = selectedProvince === 'ALL' || store.province === selectedProvince;
      const matchDistrict = selectedDistrict === 'ALL' || store.district === selectedDistrict;
      const matchQuery =
        !q ||
        store.name.toLowerCase().includes(q) ||
        store.address.toLowerCase().includes(q) ||
        store.district.toLowerCase().includes(q) ||
        store.province.toLowerCase().includes(q);
      return matchProvince && matchDistrict && matchQuery;
    });
  }, [stores, selectedProvince, selectedDistrict, searchQuery]);

  const handleResetFilters = () => {
    setSelectedProvince('ALL');
    setSelectedDistrict('ALL');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-white">
      {/* 1. TOP BAR CONTRACT (Minimalist Set.Space / Apple Header) */}
      <header className="sticky top-0 z-40 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-white/[0.08]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4 sm:gap-8">
          {/* Zone 1: Official KYT Logo */}
          <a
            href="#"
            aria-label="KYT Vietnam"
            className="whitespace-nowrap shrink-0 flex items-center"
          >
            <KytBrandLogo className="h-7 sm:h-9 w-auto" />
          </a>

          {/* Zone 2: Minimal Single-Line Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs uppercase tracking-widest font-mono text-neutral-400">
            <a
              href="#flagship-hero"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Dòng nón
            </a>
            <a
              href="#online-order"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Đặt hàng Online
            </a>
            <a
              href="#store-locator"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Hệ thống cửa hàng
            </a>
            <a
              href="#kyt-standards"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Tiêu chuẩn
            </a>
          </nav>

          {/* Zone 3: 1 Primary Action Button */}
          <div className="flex items-center shrink-0">
            <a
              href="#store-locator"
              className="px-3.5 sm:px-4 py-2 text-xs font-semibold text-white bg-[#E10600] hover:bg-[#B80500] rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              Hệ thống cửa hàng
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* 2. MINIMALIST HERO & 3D COVERFLOW HELMET STAGE (TT-REVO, TTR-JET, TIGER JET) */}
        <section
          id="flagship-hero"
          className="relative bg-[#0A0A0A] text-white pt-8 pb-12 sm:pt-14 sm:pb-20 border-b border-white/[0.08] overflow-hidden"
        >
          {/* Ambient Crimson Radial Glow */}
          <div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[640px] h-[280px] sm:h-[380px] bg-[#E10600]/12 blur-[110px] pointer-events-none rounded-full"
            aria-hidden="true"
          />

          <div className="max-w-[1120px] mx-auto px-4 sm:px-6 flex flex-col items-center text-center">
            {/* Minimalist Kicker */}
            <p className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.2em] text-[#E10600] mb-2.5">
              WORLD CLASS HELMETS
            </p>

            {/* Ultra-Clean Set.Space Centered Headline */}
            <h1 className="w-full max-w-5xl text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold uppercase tracking-wide leading-tight">
              <span className="block">TÌM KIẾM GIẢI PHÁP MUA HÀNG</span>
              <span className="block mt-2.5 sm:mt-4 md:mt-5 text-[#FF1E1A] drop-shadow-[0_0_24px_rgba(255,30,26,0.65)] font-extrabold">
                TỐI ƯU, CHÍNH HÃNG
              </span>
            </h1>

            {/* Primary Action Buttons */}
            <div className="mt-5 sm:mt-6 flex flex-wrap items-center justify-center gap-3">
              <a
                href="#store-locator"
                className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#E10600] hover:bg-[#B80500] rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <span>Hệ thống cửa hàng</span>
                <ArrowDown className="w-4 h-4" />
              </a>
              <a
                href="#online-order"
                className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <ShoppingBag className="w-4 h-4 text-[#E10600]" />
                <span>Đặt hàng Online</span>
              </a>
            </div>

            {/* 3D Coverflow Gallery (Motion Odd Lights Coverflow style: TT-REVO, TTR-JET, TIGER JET) */}
            <div className="w-full mt-8 sm:mt-12">
              <HelmetCoverflowGallery
                helmets={helmets}
                activeHelmetId={activeHelmetId}
                onSelectHelmet={setActiveHelmetId}
              />
            </div>
          </div>
        </section>

        {/* 2.5. OFFICIAL ONLINE ORDERING (Shopee & TikTok Shop) */}
        <section
          id="online-order"
          className="py-10 sm:py-16 bg-[#0F0F12] text-white border-b border-white/[0.08]"
        >
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-400">
                  <span className="text-[#E10600] font-bold">02</span>
                  <span aria-hidden="true">·</span>
                  <span>OFFICIAL E-COMMERCE</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white text-balance">
                  Đặt hàng Online chính hãng
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-md leading-relaxed">
                Mua sắm trực tiếp tại gian hàng chính thức của KYT Vietnam trên Shopee và TikTok Shop.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {OFFICIAL_ONLINE_CHANNELS.map((channel) => {
                const isShopee = channel.id === 'shopee';
                return (
                  <a
                    key={channel.id}
                    href={channel.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group relative rounded-2xl bg-[#16161A] hover:bg-[#1C1C22] border p-5 sm:p-7 transition-all duration-150 hover:-translate-y-0.5 flex flex-col justify-between gap-5 overflow-hidden ${
                      isShopee
                        ? 'border-white/10 hover:border-[#EE4D2D]/50 hover:shadow-lg hover:shadow-[#EE4D2D]/10'
                        : 'border-white/10 hover:border-white/25'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        {/* Channel Brand Icon Box */}
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 overflow-hidden shadow-md shadow-black/40">
                          {isShopee ? (
                            <ShopeeOfficialLogo className="w-full h-full" />
                          ) : (
                            <div className="w-full h-full bg-[#0A0A0A] border border-white/15 flex items-center justify-center">
                              <svg
                                viewBox="0 0 24 24"
                                className="w-6 h-6 fill-current text-white"
                                aria-hidden="true"
                              >
                                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                              </svg>
                            </div>
                          )}
                        </div>

                        <div>
                          <span
                            className={`text-[10px] font-mono uppercase tracking-widest font-semibold ${
                              isShopee ? 'text-[#EE4D2D]' : 'text-[#00F2FE]'
                            }`}
                          >
                            {channel.badge}
                          </span>
                          <h3 className="text-lg sm:text-xl font-extrabold tracking-tight text-white mt-0.5">
                            {channel.name}
                          </h3>
                        </div>
                      </div>

                      <span
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 ${
                          isShopee
                            ? 'bg-[#EE4D2D] group-hover:bg-[#D73211] text-white shadow-sm shadow-[#EE4D2D]/30'
                            : 'bg-white text-[#0A0A0A] group-hover:bg-neutral-200'
                        }`}
                      >
                        <span>Mua ngay</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </span>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-white/[0.08]">
                      <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                        {channel.description}
                      </p>
                      <p className="text-xs font-mono text-neutral-500 truncate">
                        {channel.handle}
                      </p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </section>

        {/* 3. STORE LOCATOR DIRECTORY (White & Silver Apple Retail Canvas) */}
        <section id="store-locator" className="py-12 sm:py-20 bg-white text-[#1D1D1F]">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-6 sm:space-y-10">
            {/* Section Title (Set.Space Chapter Numbering 03) */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 sm:pb-8 border-b border-neutral-200">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#6E6E73]">
                  <span className="text-[#E10600] font-bold">03</span>
                  <span aria-hidden="true">·</span>
                  <span>KYT OFFICIAL STORE NETWORK</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#0A0A0A] text-balance">
                  Hệ thống cửa hàng
                </h2>
              </div>
            </div>

            {/* Cascading Filter Bar (Mobile-Optimized) */}
            <div className="p-4 sm:p-6 rounded-2xl bg-[#F5F5F7] border border-neutral-200/80 space-y-4 sm:space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-end">
                {/* Filter 1: Tỉnh / Thành phố */}
                <div className="md:col-span-4">
                  <label
                    htmlFor="province-select"
                    className="block text-xs font-semibold text-[#1D1D1F] mb-1.5"
                  >
                    Tỉnh / Thành phố
                  </label>
                  <select
                    id="province-select"
                    value={selectedProvince}
                    onChange={(e) => handleSelectProvince(e.target.value)}
                    className="w-full h-11 px-3.5 text-sm font-medium bg-white text-[#0A0A0A] border border-neutral-300 rounded-xl focus:outline-none focus:border-[#E10600] transition-colors cursor-pointer"
                  >
                    <option value="ALL">
                      Tất cả Tỉnh / Thành phố ({stores.length})
                    </option>
                    {provincesWithCounts.map(({ province, count }) => (
                      <option key={province} value={province}>
                        {province} ({count})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filter 2: Quận / Huyện (Cascading) */}
                <div className="md:col-span-4">
                  <label
                    htmlFor="district-select"
                    className="block text-xs font-semibold text-[#1D1D1F] mb-1.5"
                  >
                    Quận / Huyện / Thành phố
                  </label>
                  <select
                    id="district-select"
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="w-full h-11 px-3.5 text-sm font-medium bg-white text-[#0A0A0A] border border-neutral-300 rounded-xl focus:outline-none focus:border-[#E10600] transition-colors cursor-pointer"
                  >
                    <option value="ALL">
                      {selectedProvince === 'ALL'
                        ? `Tất cả Quận / Huyện (${availableDistricts.length})`
                        : `Tất cả khu vực tại ${selectedProvince}`}
                    </option>
                    {availableDistricts.map(({ district, count }) => (
                      <option key={district} value={district}>
                        {district} ({count})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search Input by Store Name or Street */}
                <div className="md:col-span-4">
                  <label
                    htmlFor="store-search"
                    className="block text-xs font-semibold text-[#1D1D1F] mb-1.5"
                  >
                    Tìm nhanh tên cửa hàng hoặc tên đường
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-[#6E6E73] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="store-search"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="VD: Hiếu KYT, Nguyễn Thị Minh Khai..."
                      className="w-full h-11 pl-10 pr-4 text-sm font-medium bg-white text-[#0A0A0A] border border-neutral-300 rounded-xl focus:outline-none focus:border-[#E10600] transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Horizontal Scrollable Quick Province Selector on Mobile & Results Count */}
              <div className="pt-3 sm:pt-4 border-t border-neutral-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 -mx-1 px-1">
                  <button
                    onClick={() => handleSelectProvince('ALL')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      selectedProvince === 'ALL'
                        ? 'bg-[#0A0A0A] text-white'
                        : 'bg-white text-[#1D1D1F] border border-neutral-200 hover:border-neutral-400'
                    }`}
                  >
                    Toàn quốc ({stores.length})
                  </button>
                  {provincesWithCounts.map(({ province, count }) => {
                    const active = selectedProvince === province;
                    return (
                      <button
                        key={province}
                        onClick={() => handleSelectProvince(province)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                          active
                            ? 'bg-[#E10600] text-white'
                            : 'bg-white text-[#1D1D1F] border border-neutral-200 hover:border-neutral-400'
                        }`}
                      >
                        {province} ({count})
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 text-xs shrink-0">
                  <span className="text-[#6E6E73] font-medium">
                    Hiển thị{' '}
                    <strong className="font-mono tabular-nums text-[#0A0A0A]">
                      {filteredStores.length}
                    </strong>{' '}
                    cửa hàng
                  </span>

                  {(selectedProvince !== 'ALL' ||
                    selectedDistrict !== 'ALL' ||
                    searchQuery.trim() !== '') && (
                    <button
                      onClick={handleResetFilters}
                      className="text-xs font-semibold text-[#E10600] hover:underline flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Đặt lại</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 3-Column Store Card Grid (Responsive for Mobile & Desktop) */}
            {filteredStores.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
                {filteredStores.map((store) => (
                  <article
                    key={store.id}
                    onClick={() => setActiveStoreModal(store)}
                    className="group bg-white rounded-2xl border border-neutral-200 hover:border-neutral-900 transition-all duration-150 hover:-translate-y-0.5 flex flex-col overflow-hidden cursor-pointer"
                  >
                    {/* Card Visual Header */}
                    <div className="aspect-[16/10] sm:aspect-[4/3] w-full bg-[#F5F5F7] border-b border-neutral-200 overflow-hidden relative">
                      <StoreShowroomVisual
                        preset={store.interiorPreset}
                        storeName={store.name}
                        district={store.district}
                        province={store.province}
                      />
                    </div>

                    {/* Card Details Body */}
                    <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4 sm:space-y-5">
                      <div className="space-y-2">
                        {/* Unboxed Metadata */}
                        <div className="flex items-center gap-1.5 text-xs font-medium text-[#6E6E73]">
                          <span className="text-[#E10600] font-semibold">{store.province}</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-[#1D1D1F] font-medium">{store.district}</span>
                        </div>

                        {/* Store Name */}
                        <h3 className="text-base sm:text-lg font-bold tracking-tight text-[#0A0A0A] group-hover:text-[#E10600] transition-colors">
                          {store.name}
                        </h3>

                        {/* Street Address */}
                        <p className="text-sm text-[#1D1D1F] leading-relaxed flex items-start gap-2 pt-0.5">
                          <MapPin className="w-4 h-4 text-[#E10600] shrink-0 mt-0.5" />
                          <span>{store.address}</span>
                        </p>
                      </div>

                      <div className="pt-3.5 border-t border-neutral-100">
                        <div
                          className="flex items-center gap-2.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <a
                            href={getStoreMapsUrl(store.address)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`Tìm trên Google Maps: ${store.address}`}
                            className="flex-1 py-2.5 px-4 text-xs font-semibold text-white bg-[#0A0A0A] hover:bg-[#E10600] rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 min-h-[40px]"
                          >
                            <Navigation className="w-3.5 h-3.5" />
                            <span>Chỉ đường</span>
                          </a>

                          <button
                            onClick={() => setActiveStoreModal(store)}
                            className="py-2.5 px-3.5 text-xs font-semibold text-[#1D1D1F] bg-[#F5F5F7] hover:bg-neutral-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0 min-h-[40px]"
                          >
                            <span>Chi tiết</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="py-14 px-6 text-center rounded-2xl bg-[#F5F5F7] border border-neutral-200 space-y-4">
                <MapPin className="w-8 h-8 text-[#E10600] mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-bold text-[#0A0A0A]">
                    Không tìm thấy cửa hàng phù hợp
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6E6E73]">
                    Vui lòng chọn Tỉnh/Thành phố khác hoặc đặt lại bộ lọc.
                  </p>
                </div>
                <button
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-[#0A0A0A] hover:bg-[#E10600] rounded-lg transition-colors cursor-pointer"
                >
                  Xem tất cả cửa hàng
                </button>
              </div>
            )}
          </div>
        </section>

        {/* 4. SET.SPACE STYLE MINIMALIST CHAPTER 04: STANDARDS MICRO-GRID */}
        <section id="kyt-standards" className="py-14 sm:py-24 bg-[#0A0A0A] text-white border-t border-white/[0.08]">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-10 sm:space-y-14">
            <div className="max-w-2xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-400">
                <span className="text-[#E10600] font-bold">04</span>
                <span aria-hidden="true">·</span>
                <span>AUTHENTIC KYT STANDARD</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white text-balance">
                An tâm tuyệt đối tại mọi điểm bán chính hãng.
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 pt-4 border-t border-white/10">
              <div className="space-y-1.5">
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#E10600] font-semibold">
                  CHÍNH HÃNG 100%
                </h3>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  Đầy đủ tem kiểm định chất lượng và nguồn gốc phân phối chính thức.
                </p>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#E10600] font-semibold">
                  ĐỘI THỬ TRỰC TIẾP
                </h3>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  Đo vòng đầu và thử trực tiếp các size M, L, XL, 2XL ngay tại cửa hàng.
                </p>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#E10600] font-semibold">
                  PHỤ KIỆN ĐỒNG BỘ
                </h3>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  Sẵn có kính chắn Clear, Dark Smoke, Iridium, Pinlock và lót thay thế.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 5. MINIMALIST QUIET FOOTER */}
      <footer className="bg-[#0A0A0A] text-neutral-400 border-t border-white/[0.08] py-10 sm:py-12">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <KytBrandLogo className="h-8 w-auto shrink-0" />
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-white tracking-wide">{brandConfig.brandName}</p>
              <p className="text-xs text-neutral-500">
                Hệ thống cửa hàng phân phối chính hãng trên toàn quốc
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-neutral-400">
            <a href="#flagship-hero" className="hover:text-white transition-colors">
              Dòng nón
            </a>
            <a href="#online-order" className="hover:text-white transition-colors">
              Đặt hàng Online
            </a>
            <a
              href="https://shopee.vn/kytvietnam?entryPoint=ShopBySearch&searchKeyword=kyt"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#EE4D2D] transition-colors"
            >
              Shopee
            </a>
            <a
              href="https://vt.tiktok.com/ZSghUua4x/?page=TikTokShop"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              TikTok Shop
            </a>
            <a href="#store-locator" className="hover:text-white transition-colors">
              Hệ thống cửa hàng
            </a>
          </div>
        </div>
      </footer>

      {/* Store Detail Modal */}
      <StoreDetailModal
        store={activeStoreModal}
        onClose={() => setActiveStoreModal(null)}
      />
    </div>
  );
}
