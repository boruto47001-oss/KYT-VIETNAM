# KYT Vietnam — Trang Hệ Thống Cửa Hàng & Trưng Bày Nón Chủ Lực (Apple Minimalist Style)

Xây dựng trang Landing Page kết hợp danh bạ tra cứu cửa hàng phân phối nón bảo hiểm KYT chính hãng theo ngôn ngữ thiết kế tối giản của Apple (Apple Store Retail Directory), sử dụng bảng màu **Trắng - Đen - Đỏ Racing** và cấu trúc dữ liệu tách biệt để dễ dàng cập nhật danh sách đại lý, logo và hình ảnh thực tế.

### User Review & Critical Decisions

> [!IMPORTANT]
> Dưới đây là các quyết định thiết kế đã được xác nhận từ câu trả lời của bạn, kết hợp cùng cấu trúc dữ liệu mẫu sẵn sàng để bạn thay thế tài nguyên thực tế bất cứ lúc nào:

- **Bố cục tra cứu cửa hàng (Đã xác nhận)**: Thiết kế dạng **lưới thẻ tối giản kiểu Apple Store (3 cột trên Desktop)** với hình ảnh mặt tiền/không gian trưng bày, địa chỉ, giờ mở cửa, số điện thoại và nút **Chỉ đường (Google Maps)** trực tiếp.
- **Bộ lọc địa lý thông minh (Đã xác nhận)**: Tích hợp thanh lọc **Tỉnh/Thành phố** và **Quận/Huyện** phụ thuộc tự động (khi chọn Tỉnh/Thành phố, danh sách Quận/Huyện tự động cập nhật tương ứng kèm số lượng cửa hàng).
- **Khu vực mở đầu trang (Đã xác nhận)**: **Hero Banner tôn vinh dòng nón KYT chủ lực** (ví dụ: KYT KX-1 Race GP / TT-Course) với bố cục đối xứng sang trọng, điểm nhấn sắc Đỏ KYT Racing trên nền Trắng/Đen tương phản cao, điều hướng mượt xuống khu vực tìm cửa hàng.
- **Cấu trúc chờ nạp tài nguyên (Mặc định khuyến nghị)**: Tách riêng toàn bộ dữ liệu cửa hàng, thông tin dòng nón Hero và đường dẫn logo/hình ảnh vào một cấu trúc dữ liệu tập trung kèm chế độ xem chi tiết từng cửa hàng (Modal chi tiết không gian & các dòng nón có sẵn tại điểm bán).

---

### 1. Overview & Core Concept

- **What It Does**: Trang đích chính thức giúp khách hàng chiêm ngưỡng dòng nón KYT chủ lực và nhanh chóng tra cứu địa chỉ các cửa hàng, đại lý phân phối KYT chính hãng theo Tỉnh/Thành phố và Quận/Huyện.
- **Target Audience / Persona**: Người chơi xe phân khối lớn, biker yêu thích mũ bảo hiểm chuẩn đua (MotoGP) và khách hàng phổ thông muốn tìm điểm bán KYT chính hãng gần nhất để đội thử size trực tiếp.
- **Key Value**: Mang lại trải nghiệm tra cứu đẳng cấp, rõ ràng, không rối mắt như trang *Apple Find a Store*, đồng thời tôn vinh tinh thần thể thao tốc độ của thương hiệu KYT qua sắc đỏ đặc trưng.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Trải nghiệm đầu trang (Hero Flagship Showcase)**: Người dùng truy cập thấy ngay thanh điều hướng tối giản và Hero Banner khổ rộng tôn vinh mẫu nón chủ lực của KYT, kèm thông số kỹ thuật tinh gọn (trọng lượng, chuẩn an toàn FIM/ECE, chất liệu Tricomposite/Carbon) và nút cuộn mượt xuống danh sách cửa hàng.
  2. **Tra cứu & Lọc cửa hàng theo Tỉnh/Thành - Quận/Huyện**: Người dùng chọn **Tỉnh/Thành phố** (ví dụ: TP. Hồ Chí Minh, Hà Nội, Đà Nẵng...) $\rightarrow$ Hệ thống lập tức lọc danh sách thẻ cửa hàng và mở khóa bộ chọn **Quận/Huyện** tương ứng của tỉnh đó.
  3. **Tương tác thẻ cửa hàng & Chỉ đường**: Mỗi thẻ cửa hàng hiển thị ảnh không gian, tên đại lý, khu vực, địa chỉ, trạng thái giờ hoạt động và số điện thoại. Người dùng có thể bấm **"Chỉ đường"** để mở lộ trình Google Maps hoặc bấm vào thẻ để xem **Chi tiết cửa hàng** (các dòng nón trưng bày tại điểm bán, dịch vụ đo size, thay kính, bảo hành).

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: **Apple Retail Minimalism meets Motorsport Precision** — Không gian trắng thoáng đãng, lưới bố cục sắc sảo, kết hợp khối Hero đen tuyền sang trọng và điểm nhấn đỏ KYT (`#E10600`) đúng tỷ lệ.
  - *Color Palette & Mood (Quy tắc 60-30-10)*:
    - **60% Dominant Neutral Canvas**: Trắng tinh khiết (`#FFFFFF`) và xám bạc Apple (`#F5F5F7`) làm nền chính cho khu vực danh mục cửa hàng, giúp thông tin địa chỉ đọc cực kỳ rõ nét.
    - **30% Structural Contrast**: Đen Obsidian (`#0A0A0A`) và Xám Than (`#1D1D1F`) cho khu vực Hero Flagship, chữ tiêu đề độ tương phản cao và chân trang.
    - **10% High-Intent Accent**: Đỏ KYT Racing (`#E10600` / `#DC2626`) chỉ xuất hiện có chủ đích tại các điểm nhấn hành động chính (nút CTA, chỉ báo bộ lọc đang chọn, đường kẻ tiêu chuẩn đường đua).
  - *Typography & Hierarchy*:
    - **Display / Headings**: `Plus Jakarta Sans` (Geometric Sans hiện đại, kerning chặt `tracking-tight`, mang cảm giác công nghệ cao giống Apple Display).
    - **Body Prose**: `DM Sans` (Rõ ràng, dễ đọc cho địa chỉ và thông tin liên hệ).
    - **Numeric / Specs**: `JetBrains Mono` (`tabular-nums` cho số điện thoại, khung giờ hoạt động, tọa độ và thông số kỹ thuật nón).
  - *Component Styling & Layout*:
    - **Top Bar 3-Zone Contract**: Gồm 3 vùng chuẩn mực: Logo KYT bên trái — Các liên kết điều hướng 1 dòng ở giữa — 1 nút hành động chính ("Tìm cửa hàng") bên phải.
    - **Zero-Pill Metadata Discipline**: Không lạm dụng các nhãn hộp màu mè gây rối mắt; thông tin phân loại cửa hàng và quận/huyện được trình bày bằng chữ tinh tế phân cách bởi dấu chấm giữa (`·`).
    - **Store Grid Layout**: Lưới 3 cột chuẩn trên màn hình rộng (1440px container max-width 1200px, khoảng cách `gap-8`), ảnh tỷ lệ `4:3` đồng nhất chiếm 65% chiều cao thẻ.

- **Interactive Feedback & Motion**:
  - Chuyển đổi danh sách cửa hàng mượt mà (`<= 200ms`) khi chọn Tỉnh/Thành phố hoặc Quận/Huyện.
  - Hiệu ứng nâng nhẹ thẻ cửa hàng (`-translate-y-0.5`) và phóng nhẹ ảnh mặt tiền khi di chuột.
  - Trạng thái trống (Empty State) lịch sự kèm nút "Đặt lại bộ lọc" nếu người dùng chọn tổ hợp khu vực chưa có đại lý.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Bố cục Lưới Thẻ Apple Store kết hợp Ngăn Chi Tiết (Store Detail Modal)**
  - *Chosen Approach*: Hiển thị danh sách cửa hàng dạng lưới thẻ 3 cột thoáng đãng với nút "Chỉ đường" trực tiếp, kèm cửa sổ xem nhanh chi tiết cửa hàng khi nhấp vào thẻ.
  - *Why*: Giữ trọn vẹn thẩm mỹ sang trọng, rộng rãi của Apple Retail (`apple.com/retail/storelist`), giúp hình ảnh cửa hàng và nón KYT nổi bật hơn hẳn so với giao diện bản đồ chia đôi chật chội.
  - *Alternatives Considered*: Nhúng bản đồ Google Maps cố định 50% màn hình — bị loại bỏ theo lựa chọn của bạn để ưu tiên sự tối giản và tập trung vào hình ảnh/địa chỉ.

- **Decision 2: Bộ lọc Cascading (Tỉnh/Thành phố $\rightarrow$ Quận/Huyện) & Cấu trúc Dữ liệu Tách rời**
  - *Chosen Approach*: Khi người dùng chọn một Tỉnh/Thành phố, dropdown/thanh chọn Quận/Huyện sẽ tự động trích xuất đúng các Quận/Huyện hiện có cửa hàng tại tỉnh đó. Toàn bộ dữ liệu đặt trong một cấu trúc mảng chuẩn hóa.
  - *Why*: Tránh việc người dùng chọn nhầm Quận của TP.HCM khi đang xem Hà Nội, đồng thời giúp bạn sau này chỉ cần copy-paste danh sách địa chỉ thực tế và thay link ảnh/logo vào một nơi duy nhất mà không cần sửa giao diện.

---

### 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        KYT STORE LOCATOR APPLICATION                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ Centralized Brand & Store Data Layer (Easy-Swap Config)           │  │
│  │  • Brand Assets (Logo SVG/Image, Hero Helmet Specs & Visuals)     │  │
│  │  • Store Directory Array (Province, District, Address, Maps URL)  │  │
│  └─────────────────────────────────┬─────────────────────────────────┘  │
│                                    │                                    │
│                                    ▼                                    │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ 1. Minimalist Top Navigation Bar (3-Zone Contract)                │  │
│  │    [KYT Wordmark/Logo] ─── [Dòng nón · Hệ thống · Tiêu chuẩn] ─── │  │
│  │                                              [CTA: Tìm cửa hàng]  │  │
│  └─────────────────────────────────┬─────────────────────────────────┘  │
│                                    │                                    │
│                                    ▼                                    │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ 2. Flagship Helmet Hero Banner (Black/White/Red Contrast)         │  │
│  │    • Split/Editorial Showcase of Flagship KYT Helmet              │  │
│  │    • Quick Helmet Switcher (KX-1 Race GP / TT-Course / NZ-Race)   │  │
│  │    • Technical Specs Bar (FIM Homologated · Carbon · Aerodynamic) │  │
│  └─────────────────────────────────┬─────────────────────────────────┘  │
│                                    │                                    │
│                                    ▼                                    │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ 3. Apple-Style Store Locator Engine                               │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │ Cascading Filter Bar                                        │  │  │
│  │  │ [Chọn Tỉnh/Thành phố ▼] ──► [Chọn Quận/Huyện ▼] ── [Đặt lại]│  │  │
│  │  └──────────────────────────────┬──────────────────────────────┘  │  │
│  │                                 ▼                                 │  │
│  │  ┌───────────────────┐ ┌───────────────────┐ ┌─────────────────┐  │  │
│  │  │ Store Card 01     │ │ Store Card 02     │ │ Store Card 03   │  │  │
│  │  │ • 4:3 Store Image │ │ • 4:3 Store Image │ │ • 4:3 Store Img │  │  │
│  │  │ • District · Tier │ │ • District · Tier │ │ • District·Tier │  │  │
│  │  │ • Address & Hours │ │ • Address & Hours │ │ • Address&Hours │  │  │
│  │  │ [Chỉ đường] [Xem] │ │ [Chỉ đường] [Xem] │ │ [Chỉ đường][Xem]│  │  │
│  │  └─────────┬─────────┘ └─────────┬─────────┘ └────────┬────────┘  │  │
│  └────────────┼─────────────────────┼────────────────────┼───────────┘  │
│               └─────────────────────┼────────────────────┘              │
│                                     ▼                                   │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ 4. Interactive Store Detail Modal & Asset Import Guide            │  │
│  │    • Full Store Details, Available Helmet Lines, Copy Address     │  │
│  │    • Direct Google Maps Directions & Phone Call Action            │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

- **Data Model & State**:
  - **Store Entity (`StoreLocation`)**: `id`, `name`, `tier` (Flagship Store / Đại lý Ủy quyền), `province` (Tỉnh/Thành phố), `district` (Quận/Huyện), `address` (Địa chỉ chi tiết), `phone` (Số điện thoại), `hours` (Giờ mở cửa), `image` (Ảnh cửa hàng), `googleMapsUrl` (Link chỉ đường), `availableLines` (Các dòng nón đang trưng bày).
  - **Flagship Helmet Entity (`HelmetShowcase`)**: `id`, `name`, `tagline`, `category`, `weight`, `certification`, `shellMaterial`, `description`, `image`, `accentLabel`.

- **Interactive Component & State Mapping**:
  - `selectedProvince`: Khi thay đổi, tự động đặt `selectedDistrict = 'ALL'` và tính toán lại danh sách `availableDistricts` chỉ gồm các Quận/Huyện thuộc tỉnh đã chọn.
  - `selectedDistrict`: Lọc danh sách cửa hàng chính xác theo Quận/Huyện trong Tỉnh/Thành phố đang chọn.
  - `activeHelmetIndex`: Cho phép người dùng chuyển đổi xem nhanh giữa 3 mẫu nón chủ lực của KYT ngay trên Hero Banner.
  - `selectedStore`: Mở hộp thoại xem chi tiết không gian cửa hàng, sao chép địa chỉ vào bộ nhớ tạm (kèm thông báo xác nhận "Đã sao chép địa chỉ") hoặc mở Google Maps.
