import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Search,
  ChevronDown,
  Check,
  Send,
  CheckCircle2,
  Download,
  ShieldCheck,
  MapPin,
  Phone,
  X,
} from 'lucide-react';
import { VIETNAM_PROVINCES, Language } from '../data/kytData';
import {
  submitDealerApplication,
  loadDealerApplications,
  downloadDealerApplicationsCsv,
  DealerApplicationRecord,
} from '../lib/tracking';

interface DealerRegistrationSectionProps {
  lang: Language;
  isAdminUnlocked: boolean;
  onOpenAdminModal: () => void;
}

const PRODUCT_LINE_OPTIONS = [
  {
    id: 'fullface',
    labelVie: 'Full-Face (TT-REVO, NF-R, FALCON)',
    labelEng: 'Full-Face (TT-REVO, NF-R, FALCON)',
  },
  {
    id: 'openface',
    labelVie: 'Open-Face 3/4 (TTR-JET, VENOM OPEN, NFJ, COUGAR, VOODOO)',
    labelEng: 'Open-Face 3/4 (TTR-JET, VENOM OPEN, NFJ, COUGAR, VOODOO)',
  },
  {
    id: 'halfface',
    labelVie: 'Urban 1/2 & Jet (TIGER JET, D-CITY, VENOM MINI)',
    labelEng: 'Urban 1/2 & Jet (TIGER JET, D-CITY, VENOM MINI)',
  },
  {
    id: 'accessories',
    labelVie: 'Kính chắn, Pinlock & Phụ kiện KYT chính hãng',
    labelEng: 'Visors, Pinlock & Genuine KYT Accessories',
  },
];

// Normalize Vietnamese string for accent-insensitive search in the City Combobox
function normalizeVietnamese(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

export const DealerRegistrationSection: React.FC<DealerRegistrationSectionProps> = ({
  lang,
  isAdminUnlocked,
  onOpenAdminModal,
}) => {
  const isEn = lang === 'ENG';

  // Form fields
  const [storeName, setStoreName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [address, setAddress] = useState('');
  const [businessScale, setBusinessScale] = useState('Showroom / Cửa hàng chuyên doanh');
  const [interestedLines, setInterestedLines] = useState<string[]>([
    'Full-Face (TT-REVO, NF-R, FALCON)',
    'Open-Face 3/4 (TTR-JET, VENOM OPEN, NFJ, COUGAR, VOODOO)',
  ]);
  const [notes, setNotes] = useState('');

  const [formError, setFormError] = useState('');
  const [submittedRecord, setSubmittedRecord] = useState<DealerApplicationRecord | null>(null);
  const [adminDealerList, setAdminDealerList] = useState<DealerApplicationRecord[]>([]);

  const cityComboRef = useRef<HTMLDivElement | null>(null);

  // Sync dealer list count strictly when Admin is unlocked
  useEffect(() => {
    if (!isAdminUnlocked) {
      setAdminDealerList([]);
      return;
    }
    const syncList = () => {
      setAdminDealerList(loadDealerApplications());
    };
    syncList();
    window.addEventListener('kyt-dealer-applications-updated', syncList);
    return () => window.removeEventListener('kyt-dealer-applications-updated', syncList);
  }, [isAdminUnlocked]);

  // Close city dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cityComboRef.current && !cityComboRef.current.contains(e.target as Node)) {
        setIsCityDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter provinces based on user typing in the searchable combobox
  const filteredProvinces = useMemo(() => {
    const q = normalizeVietnamese(citySearchQuery);
    if (!q) return VIETNAM_PROVINCES;
    return VIETNAM_PROVINCES.filter((prov) => {
      const normProv = normalizeVietnamese(prov);
      if (normProv.includes(q)) return true;
      if (
        (q === 'hcm' || q === 'saigon' || q === 'sai gon' || q === 'tphcm') &&
        normProv.includes('ho chi minh')
      ) {
        return true;
      }
      if ((q === 'hn' || q === 'hanoi') && normProv.includes('ha noi')) {
        return true;
      }
      if ((q === 'brvt' || q === 'vung tau') && normProv.includes('ba ria')) {
        return true;
      }
      return false;
    });
  }, [citySearchQuery]);

  const handleSelectCityOption = (province: string) => {
    setSelectedCity(province);
    setCitySearchQuery(province);
    setIsCityDropdownOpen(false);
    setFormError('');
  };

  const handleToggleProductLine = (lineLabel: string) => {
    setInterestedLines((prev) =>
      prev.includes(lineLabel) ? prev.filter((item) => item !== lineLabel) : [...prev, lineLabel]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const finalCity = selectedCity.trim() || citySearchQuery.trim();
    if (!storeName.trim() || !contactName.trim() || !phone.trim() || !finalCity) {
      setFormError(
        isEn
          ? 'Please fill in Store Name, Contact Name, Phone Number, and City/Province.'
          : 'Vui lòng điền đầy đủ Tên cửa hàng, Người liên hệ, Số điện thoại và Tỉnh/Thành phố.'
      );
      return;
    }

    const record = submitDealerApplication({
      storeName: storeName.trim(),
      contactName: contactName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      city: finalCity,
      address: address.trim(),
      interestedLines,
      businessScale,
      notes: notes.trim(),
      lang,
    });

    setSubmittedRecord(record);
    setStoreName('');
    setContactName('');
    setPhone('');
    setEmail('');
    setSelectedCity('');
    setCitySearchQuery('');
    setAddress('');
    setNotes('');
  };

  return (
    <section
      id="become-dealer"
      className="py-16 sm:py-24 bg-[#F5F5F7] text-[#1D1D1F] border-t border-neutral-200 overflow-hidden"
    >
      <div className="max-w-[1160px] mx-auto px-4 sm:px-6 space-y-8 sm:space-y-12">
        {/* ADMIN-ONLY BAR: Completely invisible to regular visitors; only shown when Shift+K+Y+T+1+2+3 is unlocked */}
        {isAdminUnlocked && (
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0A0A0A] text-white border border-[#E10600]/50 flex flex-wrap items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E10600]/20 border border-[#E10600]/40 flex items-center justify-center text-[#FF1E1A] shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-[#FF1E1A] font-bold">
                  ADMIN MODE UNLOCKED (SHIFT + K + Y + T + 1 + 2 + 3)
                </div>
                <p className="text-xs sm:text-sm text-neutral-200 font-medium">
                  {isEn
                    ? `Collected Dealer Registrations: ${adminDealerList.length} records (Stored in .CSV format)`
                    : `Dữ liệu đăng ký đại lý hiện có: ${adminDealerList.length} hồ sơ (Lưu chuẩn định dạng .CSV — Chỉ Admin mới thấy)`}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => downloadDealerApplicationsCsv(adminDealerList)}
                className="px-4 py-2.5 rounded-xl bg-[#E10600] hover:bg-[#B80500] text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>
                  {isEn
                    ? `Download Dealer Data (.CSV) (${adminDealerList.length})`
                    : `Tải xuống Data Đại lý (.CSV) (${adminDealerList.length})`}
                </span>
              </button>
              <button
                type="button"
                onClick={onOpenAdminModal}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                {isEn ? 'Manage in Admin Portal' : 'Xem bảng dữ liệu Admin'}
              </button>
            </div>
          </div>
        )}

        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-neutral-300/80"
        >
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#6E6E73]">
              <span className="text-[#E10600] font-bold">05</span>
              <span aria-hidden="true">·</span>
              <span>AUTHORIZED DEALER PARTNERSHIP</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#0A0A0A] text-balance">
              {isEn ? 'Become an Official KYT Dealer' : 'Trở thành Đại lý Chính hãng KYT'}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#6E6E73] max-w-md leading-relaxed">
            {isEn
              ? 'Leave your store information below and KYT Vietnam’s distribution team will contact you directly.'
              : 'Điền thông tin cửa hàng bên dưới để bộ phận phát triển đại lý KYT Vietnam liên hệ tư vấn và gửi báo giá trực tiếp.'}
          </p>
        </motion.div>

        {/* Scaled-Up Full-Width Registration Form */}
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.12 }}
          transition={{ duration: 0.65, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white rounded-3xl border border-neutral-200/90 p-7 sm:p-10 lg:p-12 shadow-md"
        >
          {submittedRecord ? (
            <div className="py-14 px-4 text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div className="space-y-2.5 max-w-lg mx-auto">
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-600 font-bold">
                  {isEn ? 'APPLICATION RECEIVED' : 'ĐĂNG KÝ THÀNH CÔNG'}
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0A0A0A]">
                  {isEn
                    ? 'Thank you for registering as a KYT Dealer!'
                    : 'Đã ghi nhận hồ sơ đăng ký Đại lý KYT!'}
                </h3>
                <p className="text-sm sm:text-base text-[#6E6E73] leading-relaxed">
                  {isEn
                    ? `We have received the dealer registration for "${submittedRecord.storeName}" in ${submittedRecord.city}. Our distribution department will contact ${submittedRecord.phone} shortly.`
                    : `Hệ thống đã lưu thông tin đăng ký của "${submittedRecord.storeName}" tại ${submittedRecord.city}. Bộ phận phát triển đại lý KYT Vietnam sẽ liên hệ qua số ${submittedRecord.phone} trong thời gian sớm nhất.`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSubmittedRecord(null)}
                className="px-6 py-3.5 rounded-xl bg-[#0A0A0A] hover:bg-[#E10600] text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                {isEn ? 'Submit Another Registration' : 'Đăng ký thêm hồ sơ khác'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-7">
              <div className="border-b border-neutral-200 pb-5">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#0A0A0A]">
                  {isEn ? 'Dealer Registration Form' : 'Biểu mẫu Đăng ký Làm Đại lý'}
                </h3>
                <p className="text-sm text-[#6E6E73] mt-1.5">
                  {isEn
                    ? 'Fill in your store information below. Fields marked with (*) are required.'
                    : 'Vui lòng điền thông tin cửa hàng hoặc doanh nghiệp của bạn. Các mục có dấu (*) là bắt buộc.'}
                </p>
              </div>

              {formError && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm font-medium text-red-700">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                {/* Tên cửa hàng / Đại lý */}
                <div>
                  <label
                    htmlFor="dealer-store-name"
                    className="block text-sm font-semibold text-[#1D1D1F] mb-2"
                  >
                    {isEn ? 'Store / Company Name *' : 'Tên cửa hàng / Doanh nghiệp *'}
                  </label>
                  <input
                    id="dealer-store-name"
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder={
                      isEn ? 'e.g. Biker Saigon Center' : 'VD: Moto World / Cửa hàng Nón Bảo Hiểm...'
                    }
                    className="w-full h-12 sm:h-13 px-4 text-sm sm:text-base font-medium bg-[#F5F5F7] focus:bg-white text-[#0A0A0A] border border-neutral-300 rounded-xl focus:outline-none focus:border-[#E10600] transition-colors"
                  />
                </div>

                {/* Người liên hệ */}
                <div>
                  <label
                    htmlFor="dealer-contact-name"
                    className="block text-sm font-semibold text-[#1D1D1F] mb-2"
                  >
                    {isEn ? 'Contact Person Full Name *' : 'Họ và tên người liên hệ *'}
                  </label>
                  <input
                    id="dealer-contact-name"
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder={isEn ? 'e.g. Nguyen Van A' : 'VD: Nguyễn Văn A'}
                    className="w-full h-12 sm:h-13 px-4 text-sm sm:text-base font-medium bg-[#F5F5F7] focus:bg-white text-[#0A0A0A] border border-neutral-300 rounded-xl focus:outline-none focus:border-[#E10600] transition-colors"
                  />
                </div>

                {/* Số điện thoại */}
                <div>
                  <label
                    htmlFor="dealer-phone"
                    className="block text-sm font-semibold text-[#1D1D1F] mb-2"
                  >
                    {isEn ? 'Phone Number (Zalo) *' : 'Số điện thoại liên hệ (Zalo) *'}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#6E6E73] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="dealer-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="09xx xxx xxx"
                      className="w-full h-12 sm:h-13 pl-11 pr-4 text-sm sm:text-base font-medium bg-[#F5F5F7] focus:bg-white text-[#0A0A0A] border border-neutral-300 rounded-xl focus:outline-none focus:border-[#E10600] transition-colors"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="dealer-email"
                    className="block text-sm font-semibold text-[#1D1D1F] mb-2"
                  >
                    {isEn ? 'Email Address' : 'Email nhận báo giá (Không bắt buộc)'}
                  </label>
                  <input
                    id="dealer-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="store@example.com"
                    className="w-full h-12 sm:h-13 px-4 text-sm sm:text-base font-medium bg-[#F5F5F7] focus:bg-white text-[#0A0A0A] border border-neutral-300 rounded-xl focus:outline-none focus:border-[#E10600] transition-colors"
                  />
                </div>
              </div>

              {/* HYBRID SEARCH + DROPDOWN CITY COMBOBOX (Kết hợp giữa tìm kiếm và thả chọn) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                <div ref={cityComboRef} className="relative">
                  <label
                    htmlFor="dealer-city-combobox"
                    className="block text-sm font-semibold text-[#1D1D1F] mb-2"
                  >
                    {isEn
                      ? 'City / Province (Search or Select) *'
                      : 'Tỉnh / Thành phố (Gõ tìm kiếm hoặc thả chọn) *'}
                  </label>

                  <div className="relative">
                    <Search className="w-4 h-4 text-[#6E6E73] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="dealer-city-combobox"
                      type="text"
                      role="combobox"
                      aria-expanded={isCityDropdownOpen}
                      aria-autocomplete="list"
                      aria-controls="dealer-city-listbox"
                      required
                      value={citySearchQuery}
                      onFocus={() => setIsCityDropdownOpen(true)}
                      onChange={(e) => {
                        setCitySearchQuery(e.target.value);
                        setSelectedCity(e.target.value);
                        setIsCityDropdownOpen(true);
                      }}
                      placeholder={
                        isEn
                          ? 'Type or select City/Province...'
                          : 'Gõ tìm hoặc bấm chọn Tỉnh/Thành phố...'
                      }
                      className="w-full h-12 sm:h-13 pl-11 pr-16 text-sm sm:text-base font-medium bg-[#F5F5F7] focus:bg-white text-[#0A0A0A] border border-neutral-300 rounded-xl focus:outline-none focus:border-[#E10600] transition-colors"
                    />

                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                      {citySearchQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setCitySearchQuery('');
                            setSelectedCity('');
                            setIsCityDropdownOpen(true);
                          }}
                          aria-label={isEn ? 'Clear city' : 'Xóa thành phố'}
                          className="p-1.5 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setIsCityDropdownOpen((prev) => !prev)}
                        aria-label={isEn ? 'Toggle city dropdown' : 'Mở danh sách Tỉnh/Thành phố'}
                        className="p-1.5 text-neutral-500 hover:text-[#0A0A0A] cursor-pointer"
                      >
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            isCityDropdownOpen ? 'rotate-180 text-[#E10600]' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Dropdown Menu of Provinces */}
                  {isCityDropdownOpen && (
                    <ul
                      id="dealer-city-listbox"
                      role="listbox"
                      className="absolute z-30 mt-1.5 w-full max-h-64 overflow-y-auto rounded-xl bg-white border border-neutral-300 shadow-xl py-1.5 text-sm sm:text-base"
                    >
                      {filteredProvinces.length > 0 ? (
                        filteredProvinces.map((prov) => {
                          const isSelected = selectedCity === prov;
                          return (
                            <li
                              key={prov}
                              role="option"
                              aria-selected={isSelected}
                              onClick={() => handleSelectCityOption(prov)}
                              className={`px-4 py-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                                isSelected
                                  ? 'bg-[#E10600]/10 text-[#E10600] font-semibold'
                                  : 'text-[#1D1D1F] hover:bg-neutral-100'
                              }`}
                            >
                              <span className="flex items-center gap-2.5">
                                <MapPin className="w-4 h-4 text-[#E10600] shrink-0" />
                                <span>{prov}</span>
                              </span>
                              {isSelected && <Check className="w-4 h-4 text-[#E10600]" />}
                            </li>
                          );
                        })
                      ) : (
                        <li className="px-4 py-3 text-sm text-neutral-500 text-center">
                          {isEn
                            ? `No matching province for "${citySearchQuery}".`
                            : `Không tìm thấy Tỉnh/Thành phố khớp với "${citySearchQuery}".`}
                        </li>
                      )}
                    </ul>
                  )}
                </div>

                {/* Quy mô kinh doanh */}
                <div>
                  <label
                    htmlFor="dealer-scale"
                    className="block text-sm font-semibold text-[#1D1D1F] mb-2"
                  >
                    {isEn ? 'Store Format / Scale' : 'Mô hình kinh doanh hiện tại'}
                  </label>
                  <select
                    id="dealer-scale"
                    value={businessScale}
                    onChange={(e) => setBusinessScale(e.target.value)}
                    className="w-full h-12 sm:h-13 px-4 text-sm sm:text-base font-medium bg-[#F5F5F7] focus:bg-white text-[#0A0A0A] border border-neutral-300 rounded-xl focus:outline-none focus:border-[#E10600] transition-colors cursor-pointer"
                  >
                    <option value="Showroom / Cửa hàng chuyên doanh">
                      {isEn
                        ? 'Dedicated Helmet & Gear Showroom'
                        : 'Showroom / Cửa hàng nón & đồ bảo hộ'}
                    </option>
                    <option value="Cửa hàng phụ tùng / Đồ chơi xe">
                      {isEn
                        ? 'Motorcycle Parts & Tuning Shop'
                        : 'Cửa hàng phụ tùng / Đồ chơi xe máy'}
                    </option>
                    <option value="Chuỗi đại lý đa chi nhánh">
                      {isEn ? 'Multi-Branch Retail Chain' : 'Chuỗi cửa hàng nhiều chi nhánh'}
                    </option>
                    <option value="Mở mới cửa hàng">
                      {isEn ? 'Opening New Storefront' : 'Chuẩn bị mở cửa hàng mới'}
                    </option>
                  </select>
                </div>
              </div>

              {/* Địa chỉ chi tiết */}
              <div>
                <label
                  htmlFor="dealer-address"
                  className="block text-sm font-semibold text-[#1D1D1F] mb-2"
                >
                  {isEn ? 'Store Street Address' : 'Địa chỉ cửa hàng / Khu vực kinh doanh'}
                </label>
                <input
                  id="dealer-address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={
                    isEn
                      ? 'Street number, Ward, District...'
                      : 'VD: Số nhà, Tên đường, Phường/Xã, Quận/Huyện...'
                  }
                  className="w-full h-12 sm:h-13 px-4 text-sm sm:text-base font-medium bg-[#F5F5F7] focus:bg-white text-[#0A0A0A] border border-neutral-300 rounded-xl focus:outline-none focus:border-[#E10600] transition-colors"
                />
              </div>

              {/* Dòng sản phẩm quan tâm */}
              <div className="space-y-2.5">
                <span className="block text-sm font-semibold text-[#1D1D1F]">
                  {isEn
                    ? 'Product Lines of Interest'
                    : 'Dòng sản phẩm KYT quan tâm phân phối'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PRODUCT_LINE_OPTIONS.map((opt) => {
                    const label = isEn ? opt.labelEng : opt.labelVie;
                    const checked = interestedLines.includes(opt.labelVie);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleToggleProductLine(opt.labelVie)}
                        className={`px-4 py-3.5 rounded-xl border text-xs sm:text-sm font-semibold text-left flex items-center gap-3 transition-colors cursor-pointer ${
                          checked
                            ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]'
                            : 'bg-[#F5F5F7] text-[#1D1D1F] border-neutral-300 hover:border-neutral-400'
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                            checked
                              ? 'bg-[#E10600] border-[#E10600] text-white'
                              : 'bg-white border-neutral-400'
                          }`}
                        >
                          {checked && <Check className="w-3.5 h-3.5" />}
                        </span>
                        <span className="truncate">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ghi chú thêm */}
              <div>
                <label
                  htmlFor="dealer-notes"
                  className="block text-sm font-semibold text-[#1D1D1F] mb-2"
                >
                  {isEn ? 'Additional Notes' : 'Ghi chú thêm (Nhu cầu số lượng, thời gian dự kiến...)'}
                </label>
                <textarea
                  id="dealer-notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={
                    isEn
                      ? 'Any specific questions regarding wholesale policies...'
                      : 'Nhập thêm câu hỏi hoặc nhu cầu nhập hàng...'
                  }
                  className="w-full p-4 text-sm sm:text-base font-medium bg-[#F5F5F7] focus:bg-white text-[#0A0A0A] border border-neutral-300 rounded-xl focus:outline-none focus:border-[#E10600] transition-colors resize-none"
                />
              </div>

              <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-xs sm:text-sm text-[#6E6E73]">
                  {isEn
                    ? 'Information is encrypted & accessible strictly by KYT Vietnam Admin.'
                    : 'Thông tin đăng ký được bảo mật tuyệt đối và chỉ quản trị viên KYT Vietnam mới có quyền truy cập.'}
                </p>

                <button
                  type="submit"
                  className="px-8 py-4 rounded-xl bg-[#E10600] hover:bg-[#B80500] text-white text-sm sm:text-base font-bold flex items-center justify-center gap-2.5 transition-colors cursor-pointer shrink-0 shadow-lg shadow-[#E10600]/25"
                >
                  <Send className="w-4 h-4" />
                  <span>{isEn ? 'Submit Dealer Application' : 'Gửi Hồ sơ Đăng ký Đại lý'}</span>
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
};
