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
  tagline: string;
  weight: string;
  certification: string;
  shellMaterial: string;
  visorSpec: string;
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
    tagline: 'Thiết kế khí động học hầm gió thế hệ mới.',
    weight: '1,450g ± 50g',
    certification: 'ECE 22.06 · QCVN',
    shellMaterial: 'ADT-Advanced Thermoplastic (3 cỡ vỏ)',
    visorSpec: 'Optical Class 1 · Pinlock Max Vision',
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
    tagline: 'Nón 3/4 hai kính phát triển từ hầm gió khí động học.',
    weight: '1,400g ± 50g',
    certification: 'ECE 22.06 · QCVN',
    shellMaterial: 'ADT-Advanced Thermoplastic',
    visorSpec: 'Dual Visor · Kính âm chống nắng UV380',
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
    tagline: 'Nón bảo hiểm 1/2 siêu nhẹ 700g, gọn gàng và linh hoạt tối đa cho đô thị.',
    weight: '700g',
    certification: 'QCVN · Chuẩn an toàn Việt Nam',
    shellMaterial: 'ABS Nguyên Sinh Chịu Lực Cao',
    visorSpec: 'Kính chắn gió trong suốt · Lọc UV380',
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
  url: string;
  badge: string;
}

export const OFFICIAL_ONLINE_CHANNELS: OnlineChannel[] = [
  {
    id: 'shopee',
    name: 'Shopee',
    handle: 'shopee.vn/kytvietnam',
    description: 'Gian hàng trực tuyến chính hãng KYT Vietnam trên Shopee với đầy đủ các dòng nón và phụ kiện.',
    url: 'https://shopee.vn/kytvietnam?entryPoint=ShopBySearch&searchKeyword=kyt',
    badge: 'OFFICIAL SHOPEE STORE',
  },
  {
    id: 'tiktok',
    name: 'TikTok Shop',
    handle: 'KYT Vietnam TikTok Shop',
    description: 'Đặt hàng nhanh qua TikTok Shop chính thức của KYT Vietnam cùng các ưu đãi vận chuyển.',
    url: 'https://vt.tiktok.com/ZSghUua4x/?page=TikTokShop',
    badge: 'OFFICIAL TIKTOK SHOP',
  },
];

export function getStoreMapsUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.trim())}`;
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
    id: '86-station',
    name: '86 STATION',
    province: 'TP. Hồ Chí Minh',
    district: 'Quận 6',
    address: 'Lô 22, Số 22K, Đường 43B, Phường 10, Quận 6, TP.HCM',
    availableLines: ['K-Racing Tiger Jet', 'Phụ kiện & Kính KYT'],
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
    id: 'anh-quy',
    name: 'ANH QUÝ',
    province: 'TP. Hồ Chí Minh',
    district: 'Quận 11',
    address: '168/27C Trần Quý, Phường 6, Quận 11, TP.HCM',
    availableLines: ['K-Racing Tiger Jet', 'KYT TT-Course', 'Phụ kiện & Kính KYT'],
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
    id: 'bao-ho-s-biker',
    name: 'BẢO HỘ S BIKER',
    province: 'TP. Hồ Chí Minh',
    district: 'Quận Bình Thạnh',
    address: '319 Bạch Đằng, Phường 15, Quận Bình Thạnh, TP.HCM',
    availableLines: ['KYT Cougar'],
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
    id: 'cho-bao-ho',
    name: 'CHỢ BẢO HỘ',
    province: 'TP. Hồ Chí Minh',
    district: 'Quận Tân Bình',
    address: '812 Lạc Long Quân, Phường 9, Quận Tân Bình, TP.HCM',
    availableLines: ['K-Racing Tiger Jet', 'KYT Venom Open', 'KYT NF-J', 'Pinlock KYT NF-R'],
  },
  {
    id: 'cty-vvp',
    name: 'CÔNG TY TNHH THƯƠNG MẠI DỊCH VỤ VVP',
    province: 'TP. Hồ Chí Minh',
    district: 'TP. Thủ Đức',
    address: '146A Hoàng Diệu 2, Phường Linh Chiểu, TP. Thủ Đức, TP.HCM',
    availableLines: ['K-Racing Tiger Jet', 'Áo mưa & Kính KYT'],
  },
  {
    id: 'cty-megastar',
    name: 'CÔNG TY TNHH TMDV XUẤT NHẬP KHẨU MEGASTAR',
    province: 'TP. Hồ Chí Minh',
    district: 'Quận 5',
    address: '297 Hồng Bàng, Phường 11, Quận 5, TP.HCM',
    availableLines: ['K-Racing Tiger Jet', 'KYT Cougar', 'KYT Venom Open', 'Phụ kiện & Kính KYT'],
  },
  {
    id: 'cua-hang-dung-thu',
    name: 'CỬA HÀNG DŨNG THU',
    province: 'Đắk Lắk',
    district: 'TP. Buôn Ma Thuột',
    address: '83 Phan Bội Châu, Phường Tân Tiến, TP. Buôn Ma Thuột, Đắk Lắk',
    availableLines: ['KYT Cougar'],
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
    id: 'dai-nghia',
    name: 'ĐẠI NGHĨA',
    province: 'Đồng Nai',
    district: 'TP. Long Khánh',
    address: '52 Hoàng Diệu, TP. Long Khánh, Đồng Nai',
    availableLines: ['K-Racing Tiger Jet', 'Phụ kiện KYT'],
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
    id: 'do-phuot-tay-ninh',
    name: 'ĐỒ PHƯỢT TÂY NINH',
    province: 'Tây Ninh',
    district: 'TP. Tây Ninh',
    address: '641 Điện Biên Phủ, Phường Ninh Thạnh, TP. Tây Ninh',
    availableLines: ['K-Racing Tiger Jet'],
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
    id: 'gugo-phuot',
    name: 'GUGÔ PHƯỢT',
    province: 'Tiền Giang',
    district: 'TP. Mỹ Tho',
    address: 'Số 9, Tổ 1, Đường 870, Xã Trung An, TP. Mỹ Tho, Tiền Giang',
    availableLines: ['K-Racing Tiger Jet', 'Phụ kiện & Kính KYT'],
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
    id: 'hebi-can-tho',
    name: 'HEBI CẦN THƠ',
    province: 'Cần Thơ',
    district: 'Quận Ninh Kiều',
    address: '164D Trần Ngọc Quế, Phường Hưng Lợi, Quận Ninh Kiều, TP. Cần Thơ',
    availableLines: ['K-Racing Tiger Jet', 'KYT Venom Open', 'Phụ kiện & Kính KYT'],
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
    id: 'hifa-shop',
    name: 'HIFA SHOP',
    province: 'TP. Hồ Chí Minh',
    district: 'Quận Tân Bình',
    address: '86/8 Phổ Quang, Phường 2, Quận Tân Bình, TP.HCM',
    availableLines: ['KYT TT-Course', 'KYT Falcon'],
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
    id: 'ho-thi',
    name: 'HỒ THI',
    province: 'Kiên Giang',
    district: 'TP. Hà Tiên',
    address: 'Tổ 3, Khu phố 3, Pháo Đài, TP. Hà Tiên, Kiên Giang',
    availableLines: ['KYT TT-Course'],
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
    id: 'luan-tgn',
    name: 'LUÂN TGN',
    province: 'Bình Dương',
    district: 'TP. Thủ Dầu Một',
    address: '48 Đại lộ Bình Dương, Phường Phú Thọ, TP. Thủ Dầu Một, Bình Dương',
    availableLines: ['KYT TT-Revo', 'K-Racing Tiger Jet', 'Áo mưa & Phụ kiện KYT'],
  },
  {
    id: 'mu-bao-hiem-doc-ha-noi',
    name: 'MŨ BẢO HIỂM ĐỘC HÀ NỘI',
    province: 'Hà Nội',
    district: 'Thanh Xuân',
    address: '621 Nguyễn Trãi, Phường Thanh Liệt, TP. Hà Nội',
    availableLines: ['KYT Venom Open', 'Phụ kiện & Kính KYT'],
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
    id: 'non-nghia',
    name: 'NÓN NGHĨA',
    province: 'TP. Hồ Chí Minh',
    district: 'Quận Bình Tân',
    address: '46/64 Đường 18, Phường Bình Hưng Hòa, Quận Bình Tân (KCN Vĩnh Lộc), TP.HCM',
    availableLines: ['K-Racing Tiger Jet', 'Phụ kiện & Kính KYT'],
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
    id: 'phu-nona-ba-ria',
    name: 'PHÚ NONA - BÀ RỊA',
    province: 'Bà Rịa - Vũng Tàu',
    district: 'TX. Phú Mỹ',
    address: 'Phú Mỹ, Tân Thành, Bà Rịa - Vũng Tàu (Đối diện Cây xăng 12)',
    availableLines: ['KYT TT-Revo', 'KYT TT-Course', 'KYT TTR-Jet', 'K-Racing Tiger Jet'],
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
    id: 'phuot-71-store',
    name: 'PHƯỢT 71 STORE',
    province: 'Bến Tre',
    district: 'TP. Bến Tre',
    address: '185/1 Ấp 1, Xã Sơn Đông, TP. Bến Tre',
    availableLines: ['K-Racing Tiger Jet', 'KYT Venom Open'],
  },
  {
    id: 'phuot-chat',
    name: 'PHƯỢT CHẤT',
    province: 'TP. Hồ Chí Minh',
    district: 'TP. Thủ Đức',
    address: '35 Rạch Lùng, KP2, TP. Thủ Đức, TP.HCM',
    availableLines: ['KYT NF-J', 'K-Racing Tiger Jet', 'Phụ kiện & Kính KYT'],
  },
  {
    id: 'phuot-cu-bap',
    name: 'PHƯỢT CU BẮP',
    province: 'Bà Rịa - Vũng Tàu',
    district: 'TP. Vũng Tàu',
    address: '424 Đường 30/4, TP. Vũng Tàu, Bà Rịa - Vũng Tàu',
    availableLines: ['K-Racing Tiger Jet', 'Áo mưa & Kính KYT'],
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
    id: 'phuot-store-bac-ninh',
    name: 'PHƯỢT STORE BẮC NINH',
    province: 'Bắc Ninh',
    district: 'TP. Bắc Ninh',
    address: '718 Cầu Ngà, Phường Vân Dương, TP. Bắc Ninh',
    availableLines: ['KYT Venom Open', 'Phụ kiện & Kính KYT'],
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
    id: 'shop-bao-ho-dong-phuc-loc',
    name: 'SHOP BẢO HỘ ĐỒNG PHÚC LỘC',
    province: 'Đồng Nai',
    district: 'TP. Biên Hòa',
    address: '1506/74/20 Nguyễn Ái Quốc, TP. Biên Hòa, Đồng Nai',
    availableLines: ['K-Racing Tiger Jet', 'Áo mưa & Kính KYT'],
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
    id: 'smiley-shop',
    name: 'SMILEY SHOP',
    province: 'An Giang',
    district: 'TP. Long Xuyên',
    address: 'Lý Thái Tổ, Phường Mỹ Xuyên, TP. Long Xuyên, An Giang',
    availableLines: ['KYT TT-Course', 'K-Racing Tiger Jet'],
  },
  {
    id: 'tan-chi',
    name: 'TÂN CHI',
    province: 'Lâm Đồng',
    district: 'TP. Đà Lạt',
    address: '11 Phan Bội Châu, TP. Đà Lạt, Lâm Đồng',
    availableLines: ['KYT Cougar', 'KYT Venom Open'],
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
    id: 'van-hung',
    name: 'VĂN HƯNG',
    province: 'TP. Hồ Chí Minh',
    district: 'Quận Bình Tân',
    address: '63/16 Đường số 13A, Phường Bình Hưng Hòa, Quận Bình Tân, TP.HCM',
    availableLines: ['K-Racing Tiger Jet', 'Phụ kiện & Kính KYT'],
  },
  {
    id: 'vivu-biker',
    name: 'VIVU BIKER',
    province: 'Long An',
    district: 'TP. Tân An',
    address: '507 Nguyễn Đình Chiểu, Phường 3, TP. Tân An, Long An',
    availableLines: ['K-Racing Tiger Jet', 'KYT D-City', 'Phụ kiện KYT'],
  },
];

const PRESETS: StoreLocation['interiorPreset'][] = ['flagship-dark', 'gallery-white', 'studio-red'];

export const INITIAL_STORE_LOCATIONS: StoreLocation[] = RAW_STORES.map((item, idx) => ({
  ...item,
  googleMapsUrl: getStoreMapsUrl(item.address),
  interiorPreset: PRESETS[idx % PRESETS.length],
}));
