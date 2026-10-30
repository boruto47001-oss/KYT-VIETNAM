export type Language = 'VIE' | 'ENG';

export interface HelmetGallerySlide {
  id: string;
  sku: string;
  title: string;
  subtitle: string;
  imageUrl: string;
}

export interface HelmetShowcase {
  id: string;
  name: string;
  shortName: string;
  series: string;
  seriesEn: string;
  tagline: string;
  weight: string;
  certification: string;
  certificationEn: string;
  shellMaterial: string;
  shellMaterialEn: string;
  visorSpec: string;
  visorSpecEn: string;
  slides: HelmetGallerySlide[];
}

export interface StoreLocation {
  id: string;
  name: string;
  province: string;
  district: string;
  address: string;
  googleMapsUrl: string;
  availableLines: string[];
  interiorPreset: 'flagship-dark' | 'gallery-white' | 'studio-red';
}

export interface BrandConfig {
  brandName: string;
  hotline: string;
  supportEmail: string;
}

export const INITIAL_BRAND_CONFIG: BrandConfig = {
  brandName: 'KYT VIETNAM',
  hotline: '1900 636 890',
  supportEmail: 'retail@kytvietnam.vn',
};

export const INITIAL_FLAGSHIP_HELMETS: HelmetShowcase[] = [
  {
    id: 'tt-revo',
    name: 'KYT TT-REVO',
    shortName: 'TT-REVO',
    series: 'Full-Face Aerodynamic Sport',
    seriesEn: 'Full-Face Aerodynamic Sport',
    tagline: 'Thiết kế khí động học hầm gió thế hệ mới.',
    weight: '1,450g ± 50g',
    certification: 'ECE 22.06 · QCVN',
    certificationEn: 'ECE 22.06 · QCVN Certified',
    shellMaterial: 'ADT-Advanced Thermoplastic (3 cỡ vỏ)',
    shellMaterialEn: 'ADT-Advanced Thermoplastic (3 Shell Sizes)',
    visorSpec: 'Optical Class 1 · Pinlock Max Vision',
    visorSpecEn: 'Optical Class 1 · Pinlock Max Vision',
    slides: [
      {
        id: 'tt-revo-01',
        sku: 'REVO-001',
        title: 'TT-REVO_MEGALODON',
        subtitle: 'Thiết kế cá mập Megalodon sắc sảo trên form khí động học TT-REVO',
        imageUrl: '/helmets/tt-revo-megalodon-clean.png',
      },
      {
        id: 'tt-revo-02',
        sku: 'REVO-002',
        title: 'TT-REVO RICCARDO ROSSI 2022 REPLICA',
        subtitle: 'Phiên bản tem đấu Riccardo Rossi 2022 Replica chính hãng',
        imageUrl: '/helmets/tt-revo-rossi-2022.webp',
      },
      {
        id: 'tt-revo-03',
        sku: 'REVO-003',
        title: 'TT REVO - SYNCHROTRON',
        subtitle: 'Đồ họa mạch điện tử Synchrotron tương phản xanh - đỏ - đen',
        imageUrl: '/helmets/tt-revo-synchrotron.webp',
      },
      {
        id: 'tt-revo-04',
        sku: 'REVO-004',
        title: 'TT-REVO SUSHI TIME',
        subtitle: 'Hoạ tiết nghệ thuật Sushi Time độc đáo và nổi bật',
        imageUrl: '/helmets/tt-revo-sushi-time.webp',
      },
      {
        id: 'tt-revo-05',
        sku: 'REVO-005',
        title: 'TT-REVO BAYLISS REPLICA',
        subtitle: 'Phiên bản tem đấu huyền thoại Bayliss Replica',
        imageUrl: '/helmets/tt-revo-bayliss.webp',
      },
    ],
  },
  {
    id: 'ttr-jet',
    name: 'KYT TTR-JET',
    shortName: 'TTR-JET',
    series: 'Aerodynamic Open-Face 2 Kính',
    seriesEn: 'Aerodynamic Dual-Visor Open-Face',
    tagline: 'Nón 3/4 hai kính phát triển từ hầm gió khí động học.',
    weight: '1,400g ± 50g',
    certification: 'ECE 22.06 · QCVN',
    certificationEn: 'ECE 22.06 · QCVN Certified',
    shellMaterial: 'ADT-Advanced Thermoplastic',
    shellMaterialEn: 'ADT-Advanced Thermoplastic',
    visorSpec: 'Dual Visor · Kính âm chống nắng UV380',
    visorSpecEn: 'Dual Visor · UV380 Inner Sun Visor',
    slides: [
      {
        id: 'ttr-jet-01',
        sku: 'TTRJ-001',
        title: 'TT R JET_KASMA 2023 REPLICA',
        subtitle: 'Phiên bản tem đấu Kasma Daniel 2023 Replica chính hãng',
        imageUrl: '/helmets/ttr-jet-kasma-2023.webp',
      },
      {
        id: 'ttr-jet-02',
        sku: 'TTRJ-002',
        title: 'TTR-JET_SUPER KIP 2.0 REPLICA',
        subtitle: 'Phiên bản tem đấu Khairul Idham Pawi #89 Super Kip 2.0',
        imageUrl: '/helmets/ttr-jet-super-kip-2.png',
      },
      {
        id: 'ttr-jet-03',
        sku: 'TTRJ-003',
        title: 'TT R-JET_BULEGA 2021 REPLICA',
        subtitle: 'Phiên bản tem đấu Nicolò Bulega 2021 Replica đen - đỏ - xám',
        imageUrl: '/helmets/ttr-jet-bulega-2021.webp',
      },
      {
        id: 'ttr-jet-04',
        sku: 'TTRJ-004',
        title: 'TT R-JET_FOGGIA MISANO 2022 REPLICA',
        subtitle: 'Phiên bản tem đấu Dennis Foggia Leopard Misano GP 2022',
        imageUrl: '/helmets/ttr-jet-foggia-misano-2022.webp',
      },
      {
        id: 'ttr-jet-05',
        sku: 'TTRJ-005',
        title: 'TT R JET_BASTIANINI 2022 REPLICA',
        subtitle: 'Thiết kế Drudi Performance Enea Bastianini 2022 Replica',
        imageUrl: '/helmets/ttr-jet-bastianini-2022.webp',
      },
    ],
  },
  {
    id: 'tiger-jet',
    name: 'KYT TIGER JET',
    shortName: 'TIGER JET',
    series: 'Nón 1/2 Trùm Tai Có Kính',
    seriesEn: 'Urban Half-Face Helmet with Visor',
    tagline: 'Nón bảo hiểm 1/2 siêu nhẹ 700g, gọn gàng và linh hoạt tối đa cho đô thị.',
    weight: '700g',
    certification: 'QCVN · Chuẩn an toàn Việt Nam',
    certificationEn: 'QCVN · Vietnam Safety Standard',
    shellMaterial: 'ABS Nguyên Sinh Chịu Lực Cao',
    shellMaterialEn: 'High-Impact Virgin ABS Shell',
    visorSpec: 'Kính chắn gió trong suốt · Lọc UV380',
    visorSpecEn: 'Clear Anti-Scratch Visor · UV380 Filter',
    slides: [
      {
        id: 'tiger-jet-01',
        sku: 'TIGR-001',
        title: 'PASTEL SAKURA PINK',
        subtitle: 'Nón 1/2 KYT Tiger Jet hồng Pastel Sakura trẻ trung, khối lượng siêu nhẹ 700g',
        imageUrl: '/helmets/tiger-jet-sakura-pink.png',
      },
      {
        id: 'tiger-jet-02',
        sku: 'TIGR-002',
        title: 'PLAIN MATT ANTHRACITE',
        subtitle: 'Nón 1/2 KYT Tiger Jet xám nhám Anthracite tối giản, khối lượng 700g',
        imageUrl: '/helmets/tiger-jet-matt-anthracite.png',
      },
      {
        id: 'tiger-jet-03',
        sku: 'TIGR-003',
        title: 'PLAIN WHITE',
        subtitle: 'Nón 1/2 KYT Tiger Jet trắng bóng tinh tế kèm kính chắn gió trong suốt',
        imageUrl: '/helmets/tiger-jet-plain-white.png',
      },
      {
        id: 'tiger-jet-04',
        sku: 'TIGR-004',
        title: 'BLACK / RED / GUN METAL',
        subtitle: 'Nón 1/2 KYT Tiger Jet tem thể thao Đen · Đỏ · Xám Gun Metal',
        imageUrl: '/helmets/tiger-jet-black-red-gunmetal.png',
      },
      {
        id: 'tiger-jet-05',
        sku: 'TIGR-005',
        title: 'BLACK / BLUE / YELLOW',
        subtitle: 'Nón 1/2 KYT Tiger Jet phối màu Đen · Xanh · Vàng nổi bật',
        imageUrl: '/helmets/tiger-jet-black-blue-yellow.png',
      },
    ],
  },
];

export interface OnlineChannel {
  id: 'shopee' | 'tiktok';
  name: string;
  handle: string;
  description: string;
  descriptionEn: string;
  url: string;
  badge: string;
}

export const SHOPEE_OFFICIAL_URL =
  'https://shopee.vn/universal-link/kytvietnam?deep_and_web=1&smtt=9&utm_campaign=s1224932733_ss_vn_webs_websitetrackinglink&utm_medium=seller&utm_source=website';

export const OFFICIAL_ONLINE_CHANNELS: OnlineChannel[] = [
  {
    id: 'shopee',
    name: 'Shopee',
    handle: 'shopee.vn/kytvietnam',
    description: 'Gian hàng trực tuyến chính hãng KYT Vietnam trên Shopee với đầy đủ các dòng nón và phụ kiện.',
    descriptionEn: 'KYT Vietnam official flagship store on Shopee with full range of helmets and genuine accessories.',
    url: SHOPEE_OFFICIAL_URL,
    badge: 'OFFICIAL SHOPEE STORE',
  },
  {
    id: 'tiktok',
    name: 'TikTok Shop',
    handle: 'KYT Vietnam TikTok Shop',
    description: 'Đặt hàng nhanh qua TikTok Shop chính thức của KYT Vietnam cùng các ưu đãi vận chuyển.',
    descriptionEn: 'Fast ordering via KYT Vietnam official TikTok Shop with exclusive shipping vouchers.',
    url: 'https://vt.tiktok.com/ZSghUua4x/?page=TikTokShop',
    badge: 'OFFICIAL TIKTOK SHOP',
  },
];

export function getStoreMapsUrl(address: string): string {
  const cleanDestination = address
    .replace(/\([^)]*\)/g, '')
    .replace(/\bĐ\.\s*/g, 'Đường ')
    .replace(/\bTP\.HCM\b/gi, 'TP. Hồ Chí Minh')
    .replace(/\s+/g, ' ')
    .trim();
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(cleanDestination)}`;
}

interface RawStoreSeed {
  id: string;
  name: string;
  province: string;
  district: string;
  address: string;
  availableLines: string[];
}

const RAW_STORES: RawStoreSeed[] = [
  {
    id: 'luan-tgn',
    name: 'LUÂN TGN',
    province: 'Bình Dương',
    district: 'TP. Thủ Dầu Một',
    address: '48 Đại lộ Bình Dương, Phường Phú Thọ, TP. Thủ Dầu Một, Bình Dương',
    availableLines: ['KYT TT-Revo', 'K-Racing Tiger Jet', 'Áo mưa & Phụ kiện KYT'],
  },
  {
    id: 'hieu-kyt-shop',
    name: 'HIẾU KYT SHOP',
    province: 'TP. Hồ Chí Minh',
    district: 'Quận Gò Vấp',
    address: '164/5 Nguyễn Oanh, Phường 17, Quận Gò Vấp, TP.HCM',
    availableLines: ['KYT TT-Revo', 'KYT TT-Course', 'KYT TTR-Jet', 'KYT NF-J', 'K-Racing Tiger Jet'],
  },
  {
    id: 'denshop-vn',
    name: 'ĐENSHOP.VN',
    province: 'Đồng Nai',
    district: 'TP. Biên Hòa',
    address: '74/4 Phan Đình Phùng, Phường Quang Vinh, TP. Biên Hòa, Đồng Nai',
    availableLines: ['K-Racing Tiger Jet', 'KYT Venom Open', 'Phụ kiện & Kính KYT'],
  },
  {
    id: 'bao-chau-bao-loc',
    name: 'BẢO CHÂU - BẢO LỘC',
    province: 'Lâm Đồng',
    district: 'TP. Bảo Lộc',
    address: "713 Trần Phú, Phường B'Lao, TP. Bảo Lộc, Lâm Đồng",
    availableLines: ['KYT Cougar', 'K-Racing Tiger Jet'],
  },
  {
    id: 'n-shop-q7',
    name: 'N-SHOP-Q7',
    province: 'TP. Hồ Chí Minh',
    district: 'Quận Bình Tân',
    address: '46/64 Đường 18, Phường Bình Hưng Hòa, Quận Bình Tân (KCN Vĩnh Lộc), TP.HCM',
    availableLines: ['K-Racing Tiger Jet', 'Phụ kiện & Kính KYT'],
  },
  {
    id: 'non-chat',
    name: 'NÓN CHẤT',
    province: 'Đồng Nai',
    district: 'TP. Biên Hòa',
    address: '1330 Phạm Văn Thuận, Phường Tân Tiến, TP. Biên Hòa, Đồng Nai',
    availableLines: ['KYT NF-J', 'KYT TT-Course', 'KYT Venom Open', 'K-Racing Tiger Jet'],
  },
  {
    id: 'tai-dat-store-q5',
    name: 'TÀI ĐẠT STORE Q5',
    province: 'TP. Hồ Chí Minh',
    district: 'Quận 5',
    address: '297 Đ. Hồng Bàng, Chợ Lớn, Quận 5, TP. Hồ Chí Minh',
    availableLines: ['KYT TT-Revo', 'KYT TTR-Jet', 'K-Racing Tiger Jet', 'KYT Cougar', 'KYT Venom Open', 'Phụ kiện & Kính KYT'],
  },
  {
    id: 'tai-dat-store-q1',
    name: 'TÀI ĐẠT STORE Q1',
    province: 'TP. Hồ Chí Minh',
    district: 'Quận 1',
    address: '22 Trần Khắc Chân, Phường Tân Định, Quận 1, TP. Hồ Chí Minh',
    availableLines: ['KYT TT-Revo', 'KYT TTR-Jet', 'K-Racing Tiger Jet', 'KYT Cougar', 'KYT Venom Open', 'Phụ kiện & Kính KYT'],
  },
  {
    id: 'linh-kyt-shop',
    name: 'LINH KYT SHOP',
    province: 'TP. Hồ Chí Minh',
    district: 'TP. Thủ Đức',
    address: '70 Cây Keo, Phường Tam Phú, TP. Thủ Đức, TP.HCM',
    availableLines: ['KYT NF-R', 'KYT TTR-Jet', 'K-Racing Tiger Jet', 'KYT Venom Open', 'Pinlock KYT'],
  },
  {
    id: 'phu-nona-ba-ria',
    name: 'PHÚ NONA - BÀ RỊA',
    province: 'Bà Rịa - Vũng Tàu',
    district: 'TX. Phú Mỹ',
    address: 'Phú Mỹ, Tân Thành, Bà Rịa - Vũng Tàu (Đối diện Cây xăng 12)',
    availableLines: ['KYT TT-Revo', 'KYT TT-Course', 'KYT TTR-Jet', 'K-Racing Tiger Jet'],
  },
  {
    id: 'phuot-xuyen-viet',
    name: 'PHƯỢT XUYÊN VIỆT',
    province: 'Đồng Nai',
    district: 'Huyện Nhơn Trạch',
    address: '350 Lý Thái Tổ, Huyện Nhơn Trạch, Đồng Nai',
    availableLines: ['K-Racing Tiger Jet', 'KYT Venom Open', 'Phụ kiện & Kính KYT'],
  },
  {
    id: 'tu-binh-duong',
    name: 'TÚ BÌNH DƯƠNG',
    province: 'Bình Dương',
    district: 'TP. Thuận An',
    address: '12 Đại lộ Bình Dương, KP. Bình Hòa, Phường Lái Thiêu, TP. Thuận An, Bình Dương',
    availableLines: ['KYT TT-Revo', 'KYT TTR-Jet', 'K-Racing Tiger Jet', 'Phụ kiện & Kính KYT'],
  },
  {
    id: 'trips-store',
    name: 'TRIPS STORE',
    province: 'Thừa Thiên Huế',
    district: 'TP. Huế',
    address: '23 Tôn Đức Thắng, Phường Phú Nhuận, TP. Huế',
    availableLines: ['KYT TT-Revo', 'KYT TTR-Jet', 'KYT NF-J', 'K-Racing Tiger Jet'],
  },
  {
    id: 'tvk-motorcycle',
    name: 'TVK MOTORCYCLE',
    province: 'Bình Phước',
    district: 'TX. Chơn Thành',
    address: 'Đ. Phạm Hồng Thái, Tổ 6, KP 3, Phường Hưng Long, TX. Chơn Thành, Bình Phước',
    availableLines: ['K-Racing Tiger Jet', 'Phụ kiện KYT'],
  },
  {
    id: 'hebi-can-tho',
    name: 'HEBI CẦN THƠ',
    province: 'Cần Thơ',
    district: 'Quận Ninh Kiều',
    address: '164D Trần Ngọc Quế, Phường Hưng Lợi, Quận Ninh Kiều, TP. Cần Thơ',
    availableLines: ['K-Racing Tiger Jet', 'KYT Venom Open', 'Phụ kiện & Kính KYT'],
  },
  {
    id: 'phuot-71-store',
    name: 'PHƯỢT 71 STORE',
    province: 'Bến Tre',
    district: 'TP. Bến Tre',
    address: '185/1 Ấp 1, Xã Sơn Đông, TP. Bến Tre',
    availableLines: ['K-Racing Tiger Jet', 'KYT Venom Open'],
  },
  {
    id: 'bui-outdoor-shop',
    name: 'BỤI OUTDOOR SHOP',
    province: 'Bình Dương',
    district: 'TP. Thủ Dầu Một',
    address: 'Số 122, Đ. Phú Lợi, Tổ 2, KP1, Phường Phú Hòa, TP. Thủ Dầu Một, Bình Dương',
    availableLines: ['K-Racing Tiger Jet', 'KYT Cougar', 'KYT TT-Course', 'Áo mưa KYT'],
  },
  {
    id: 'smiley-shop',
    name: 'SMILEY SHOP',
    province: 'An Giang',
    district: 'TP. Long Xuyên',
    address: 'Lý Thái Tổ, Phường Mỹ Xuyên, TP. Long Xuyên, An Giang',
    availableLines: ['KYT TT-Course', 'K-Racing Tiger Jet'],
  },
  {
    id: 'vivu-biker',
    name: 'VIVU BIKER',
    province: 'Long An',
    district: 'TP. Tân An',
    address: '507 Nguyễn Đình Chiểu, Phường 3, TP. Tân An, Long An',
    availableLines: ['K-Racing Tiger Jet', 'KYT D-City', 'Phụ kiện KYT'],
  },
  {
    id: 'shop-bao-ho-dong-phuc-loc',
    name: 'SHOP BẢO HỘ ĐỒNG PHÚC LỘC',
    province: 'Đồng Nai',
    district: 'TP. Biên Hòa',
    address: '1506/74/20 Nguyễn Ái Quốc, TP. Biên Hòa, Đồng Nai',
    availableLines: ['K-Racing Tiger Jet', 'Áo mưa & Kính KYT'],
  },
  {
    id: 'cho-bao-ho',
    name: 'CHỢ BẢO HỘ',
    province: 'TP. Hồ Chí Minh',
    district: 'Quận Tân Bình',
    address: '812 Lạc Long Quân, Phường 9, Quận Tân Bình, TP.HCM',
    availableLines: ['K-Racing Tiger Jet', 'KYT Venom Open', 'KYT NF-J', 'Pinlock KYT NF-R'],
  },
  {
    id: 'phuot-4p',
    name: 'PHƯỢT 4P',
    province: 'TP. Hồ Chí Minh',
    district: 'Quận Bình Thạnh',
    address: '135/33 Nguyễn Hữu Cảnh, Phường 22, Quận Bình Thạnh, TP.HCM',
    availableLines: ['KYT TT-Course', 'K-Racing Tiger Jet', 'KYT Venom Open'],
  },
  {
    id: 'gau-bac-cuc',
    name: 'GẤU BẮC CỰC',
    province: 'TP. Hồ Chí Minh',
    district: 'Quận 1',
    address: '161 Nguyễn Thị Minh Khai, Phường Bến Thành, Quận 1, TP.HCM',
    availableLines: ['KYT TT-Course', 'KYT NF-R', 'KYT NF-J', 'KYT Venom Open', 'K-Racing Tiger Jet'],
  },
  {
    id: 'nyc-shop',
    name: 'NYC SHOP',
    province: 'TP. Hồ Chí Minh',
    district: 'Quận 11',
    address: '740 Hồng Bàng, Phường 1, Quận 11, TP.HCM',
    availableLines: ['K-Racing Tiger Jet', 'Áo mưa & Phụ kiện KYT'],
  },
  {
    id: 'gugo-phuot',
    name: 'GUGÔ PHƯỢT',
    province: 'Tiền Giang',
    district: 'TP. Mỹ Tho',
    address: 'Số 9, Tổ 1, Đường 870, Xã Trung An, TP. Mỹ Tho, Tiền Giang',
    availableLines: ['K-Racing Tiger Jet', 'Phụ kiện & Kính KYT'],
  },
  {
    id: 'phuot-chat',
    name: 'PHƯỢT CHẤT',
    province: 'TP. Hồ Chí Minh',
    district: 'TP. Thủ Đức',
    address: '64/40 Đ. Số 8, Hiệp Bình, TP. Thủ Đức, TP. Hồ Chí Minh',
    availableLines: ['KYT NF-J', 'K-Racing Tiger Jet', 'Phụ kiện & Kính KYT'],
  },
  {
    id: '86-station',
    name: '86 STATION',
    province: 'TP. Hồ Chí Minh',
    district: 'Quận 6',
    address: 'Lô 22, Số 22K, Đường 43B, Phường 10, Quận 6, TP.HCM',
    availableLines: ['K-Racing Tiger Jet', 'Phụ kiện & Kính KYT'],
  },
  {
    id: 'vi-vu-phuot',
    name: 'VI VU PHƯỢT',
    province: 'TP. Hồ Chí Minh',
    district: 'TP. Thủ Đức',
    address: '146A Hoàng Diệu 2, Phường Linh Chiểu, TP. Thủ Đức, TP.HCM',
    availableLines: ['K-Racing Tiger Jet', 'Áo mưa & Kính KYT'],
  },
  {
    id: 'da-lat-biker',
    name: 'ĐÀ LẠT BIKER',
    province: 'Lâm Đồng',
    district: 'TP. Đà Lạt',
    address: '28 Hải Thượng, Phường 6, TP. Đà Lạt, Lâm Đồng',
    availableLines: ['KYT Falcon', 'KYT Venom Open', 'Phụ kiện & Kính KYT'],
  },
  {
    id: 'hebi-binh-thanh',
    name: 'HEBI BÌNH THẠNH',
    province: 'TP. Hồ Chí Minh',
    district: 'Quận Bình Thạnh',
    address: '118A Đ. Phan Văn Trị, Phường 12, Quận Bình Thạnh, TP.HCM',
    availableLines: ['K-Racing Tiger Jet', 'Áo mưa KYT'],
  },
  {
    id: 'shop-mai-phuong',
    name: 'SHOP MAI PHƯƠNG',
    province: 'Bình Dương',
    district: 'TP. Thủ Dầu Một',
    address: '15 Đường Yersin, Phường Phú Cường, TP. Thủ Dầu Một, Bình Dương',
    availableLines: ['KYT Cougar', 'K-Racing Tiger Jet', 'KYT Venom Open'],
  },
  {
    id: 'hkd-non-hai',
    name: 'HKD NÓN HẢI',
    province: 'Khánh Hòa',
    district: 'TP. Nha Trang',
    address: '210 Thống Nhất, Phường Tây Nha Trang, Khánh Hòa',
    availableLines: ['KYT TT-Revo', 'KYT TTR-Jet', 'K-Racing Tiger Jet'],
  },
  {
    id: 'anh-dang-soc-trang',
    name: 'ANH ĐĂNG SÓC TRĂNG',
    province: 'Sóc Trăng',
    district: 'TP. Sóc Trăng',
    address: '33 Phạm Ngũ Lão, Phường 1, TP. Sóc Trăng',
    availableLines: ['K-Racing Tiger Jet', 'KYT Venom Open', 'Phụ kiện & Kính KYT'],
  },
  {
    id: 'phuot-store-73',
    name: 'PHƯỢT STORE 73',
    province: 'Bình Dương',
    district: 'TP. Dĩ An',
    address: '318 Ki ốt Số 4, Đ. Lý Thường Kiệt, KP Thống Nhất 1, Phường Dĩ An, TP. Dĩ An, Bình Dương',
    availableLines: ['K-Racing Tiger Jet'],
  },
  {
    id: 'phuot-cu-bap',
    name: 'PHƯỢT CU BẮP',
    province: 'Bà Rịa - Vũng Tàu',
    district: 'TP. Vũng Tàu',
    address: '424 Đường 30/4, TP. Vũng Tàu, Bà Rịa - Vũng Tàu',
    availableLines: ['K-Racing Tiger Jet', 'Áo mưa & Kính KYT'],
  },
];

const PRESETS: StoreLocation['interiorPreset'][] = ['flagship-dark', 'gallery-white', 'studio-red'];

export const INITIAL_STORE_LOCATIONS: StoreLocation[] = RAW_STORES.map((item, idx) => ({
  ...item,
  googleMapsUrl: getStoreMapsUrl(item.address),
  interiorPreset: PRESETS[idx % PRESETS.length],
}));

export interface HelmetSizeRow {
  size: string;
  minCm: number;
  maxCm: number;
  label: string;
}

export interface HelmetSizeModel {
  id: string;
  name: string;
  category: string;
  categoryEn: string;
  sizes: HelmetSizeRow[];
  noteVie?: string;
  noteEng?: string;
}

export const HELMET_SIZE_GUIDES: HelmetSizeModel[] = [
  {
    id: 'voodoo',
    name: 'VOODOO',
    category: 'Open-Face / 3/4',
    categoryEn: 'Open-Face / 3/4',
    sizes: [
      { size: 'M', minCm: 56, maxCm: 58, label: '56 - 58 cm' },
      { size: 'L', minCm: 57, maxCm: 59, label: '57 - 59 cm' },
      { size: 'XL', minCm: 58, maxCm: 60, label: '58 - 60 cm' },
      { size: 'XXL', minCm: 59, maxCm: 61, label: '59 - 61 cm' },
    ],
  },
  {
    id: 'cougar',
    name: 'COUGAR',
    category: 'Open-Face / 3/4',
    categoryEn: 'Open-Face / 3/4',
    sizes: [
      { size: 'M', minCm: 57, maxCm: 57, label: '57 cm' },
      { size: 'L', minCm: 58, maxCm: 58, label: '58 cm' },
      { size: 'XL', minCm: 59, maxCm: 59, label: '59 cm' },
      { size: 'XXL', minCm: 60, maxCm: 60, label: '60 cm' },
    ],
  },
  {
    id: 'tiger-jet',
    name: 'TIGER JET',
    category: 'Nón 1/2 Có Kính',
    categoryEn: 'Half-Face with Visor',
    sizes: [
      { size: 'M', minCm: 56, maxCm: 57, label: '56 - 57 cm' },
      { size: 'L', minCm: 57, maxCm: 58, label: '57 - 58 cm' },
      { size: 'XL', minCm: 58, maxCm: 59, label: '58 - 59 cm' },
      { size: 'XXL', minCm: 59, maxCm: 60, label: '59 - 60 cm' },
    ],
  },
  {
    id: 'nf-r',
    name: 'NF-R',
    category: 'Full-Face Sport Touring',
    categoryEn: 'Full-Face Sport Touring',
    sizes: [
      { size: 'M', minCm: 55, maxCm: 55, label: '55 cm' },
      { size: 'L', minCm: 56, maxCm: 56, label: '56 cm' },
      { size: 'XL', minCm: 57, maxCm: 57, label: '57 cm' },
      { size: 'XXL', minCm: 58, maxCm: 58, label: '58 cm' },
    ],
  },
  {
    id: 'falcon',
    name: 'FALCON',
    category: 'Full-Face Sport',
    categoryEn: 'Full-Face Sport',
    sizes: [
      { size: 'M', minCm: 56, maxCm: 57, label: '56 - 57 cm' },
      { size: 'L', minCm: 57, maxCm: 58, label: '57 - 58 cm' },
      { size: 'XL', minCm: 58, maxCm: 59, label: '58 - 59 cm' },
      { size: 'XXL', minCm: 59, maxCm: 60, label: '59 - 60 cm' },
    ],
  },
  {
    id: 'venom-open',
    name: 'VENOM OPEN',
    category: 'Open-Face / 3/4 2 Kính',
    categoryEn: 'Open-Face Dual Visor',
    sizes: [
      { size: 'M', minCm: 56, maxCm: 56, label: '56 cm' },
      { size: 'L', minCm: 56, maxCm: 57, label: '56 - 57 cm' },
      { size: 'XL', minCm: 57, maxCm: 58, label: '57 - 58 cm' },
      { size: 'XXL', minCm: 58, maxCm: 59, label: '58 - 59 cm' },
    ],
  },
  {
    id: 'nfj',
    name: 'NFJ',
    category: 'Open-Face / 3/4 Cao Cấp',
    categoryEn: 'Premium Open-Face',
    sizes: [
      { size: 'M', minCm: 56, maxCm: 56, label: '56 cm' },
      { size: 'L', minCm: 56, maxCm: 57, label: '56 - 57 cm' },
      { size: 'XL', minCm: 57, maxCm: 58, label: '57 - 58 cm' },
      { size: 'XXL', minCm: 58, maxCm: 59, label: '58 - 59 cm' },
    ],
  },
  {
    id: 'd-city',
    name: 'D-CITY',
    category: 'Urban Jet Helmet',
    categoryEn: 'Urban Jet Helmet',
    sizes: [
      { size: 'M', minCm: 56, maxCm: 56, label: '56 cm' },
      { size: 'L', minCm: 57, maxCm: 57, label: '57 cm' },
      { size: 'XL', minCm: 58, maxCm: 59, label: '58 - 59 cm' },
      { size: 'XXL', minCm: 59, maxCm: 60, label: '59 - 60 cm' },
    ],
  },
  {
    id: 'venom-open-mini',
    name: 'VENOM OPEN MINI',
    category: 'Open-Face / 3/4 Form Nhỏ',
    categoryEn: 'Compact Open-Face',
    sizes: [
      { size: 'M', minCm: 56, maxCm: 57, label: '56 - 57 cm' },
      { size: 'L', minCm: 57, maxCm: 58, label: '57 - 58 cm' },
      { size: 'XL', minCm: 58, maxCm: 59, label: '58 - 59 cm' },
      { size: 'XXL', minCm: 59, maxCm: 60, label: '59 - 60 cm' },
    ],
  },
  {
    id: 'tt-revo',
    name: 'TT-REVO',
    category: 'Full-Face Aerodynamic Sport',
    categoryEn: 'Full-Face Aerodynamic Sport',
    sizes: [
      { size: 'S', minCm: 55, maxCm: 56, label: '55 - 56 cm' },
      { size: 'M', minCm: 56, maxCm: 58, label: '56 - 58 cm' },
      { size: 'L', minCm: 58, maxCm: 60, label: '58 - 60 cm' },
      { size: 'XL', minCm: 60, maxCm: 62, label: '60 - 62 cm' },
    ],
    noteVie:
      'Lưu ý: thời gian đầu đội sẽ hơi chật nhưng sau vài lần sử dụng, phần đệm sẽ mềm và ôm thoải mái gương mặt.',
    noteEng:
      'Note: Initial fit will feel slightly snug, but after a few uses the liner pads will soften and contour comfortably to your face.',
  },
  {
    id: 'ttr-jet',
    name: 'TTR-JET',
    category: 'Aerodynamic Open-Face 2 Kính',
    categoryEn: 'Aerodynamic Dual-Visor Open-Face',
    sizes: [
      { size: 'M', minCm: 57, maxCm: 58, label: '57 - 58 cm' },
      { size: 'L', minCm: 58, maxCm: 60, label: '58 - 60 cm' },
      { size: 'XL', minCm: 60, maxCm: 62, label: '60 - 62 cm' },
      { size: '2XL', minCm: 62, maxCm: 63, label: '62 - 63 cm' },
    ],
  },
];

export const VIETNAM_PROVINCES: string[] = [
  'TP. Hồ Chí Minh',
  'Hà Nội',
  'Đà Nẵng',
  'Bình Dương',
  'Đồng Nai',
  'Cần Thơ',
  'Hải Phòng',
  'Khánh Hòa',
  'Lâm Đồng',
  'Bà Rịa - Vũng Tàu',
  'An Giang',
  'Bắc Giang',
  'Bắc Kạn',
  'Bạc Liêu',
  'Bắc Ninh',
  'Bến Tre',
  'Bình Định',
  'Bình Phước',
  'Bình Thuận',
  'Cà Mau',
  'Cao Bằng',
  'Đắk Lắk',
  'Đắk Nông',
  'Điện Biên',
  'Đồng Tháp',
  'Gia Lai',
  'Hà Giang',
  'Hà Nam',
  'Hà Tĩnh',
  'Hải Dương',
  'Hậu Giang',
  'Hòa Bình',
  'Hưng Yên',
  'Kiên Giang',
  'Kon Tum',
  'Lai Châu',
  'Lạng Sơn',
  'Lào Cai',
  'Long An',
  'Nam Định',
  'Nghệ An',
  'Ninh Bình',
  'Ninh Thuận',
  'Phú Thọ',
  'Phú Yên',
  'Quảng Bình',
  'Quảng Nam',
  'Quảng Ngãi',
  'Quảng Ninh',
  'Quảng Trị',
  'Sóc Trăng',
  'Sơn La',
  'Tây Ninh',
  'Thái Bình',
  'Thái Nguyên',
  'Thanh Hóa',
  'Thừa Thiên Huế',
  'Tiền Giang',
  'Trà Vinh',
  'Tuyên Quang',
  'Vĩnh Long',
  'Vĩnh Phúc',
  'Yên Bái',
];

