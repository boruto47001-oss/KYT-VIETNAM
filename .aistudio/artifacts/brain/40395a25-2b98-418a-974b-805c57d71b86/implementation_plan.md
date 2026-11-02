# Kế hoạch Khắc phục & Kiểm thử Hệ thống Lưu trữ Đăng ký Đại lý & Tracking Đa tầng

## 1. Chẩn đoán Nguyên nhân Gốc rễ (Root Cause Analysis)

Qua kiểm tra mã nguồn hiện tại (`src/lib/tracking.ts`, `firestore.rules`, `firebase-blueprint.json`), có **3 nguyên nhân kỹ thuật** khiến dữ liệu Form Đăng ký Đại lý và Bộ Tracking chưa lưu trữ bền vững:

1. **Form Đăng ký Đại lý (`submitDealerApplication`) chưa có kết nối Cloud / Server**:
   - Hàm `submitDealerApplication()` trong `src/lib/tracking.ts` chỉ lưu vào `localStorage` (`kyt_vn_dealer_applications_v1`) của trình duyệt hiện tại.
   - Chưa có bảng dữ liệu `/dealer_applications/{applicationId}` trên Cloud Firestore và chưa có API lưu trữ phía Server. Khi khách hàng điền form trên thiết bị khác, trình duyệt ẩn danh, hoặc trong iframe bị giới hạn bộ nhớ cục bộ, dữ liệu không được đồng bộ về máy của Admin.
2. **Bộ Tracking (`trackKytEvent`) bị chặn bởi điều kiện `auth.currentUser` & `isSignedIn()`**:
   - Sau khi chuyển quyền truy cập Admin sang tổ hợp phím `Shift + K + Y + T + 1 + 2 + 3` (`KYT123`) để tránh lỗi `auth/unauthorized-domain` của Google Sign-In trong iframe, biến `auth.currentUser` luôn là `null`.
   - Trong `src/lib/tracking.ts`, lệnh `syncEventToFirestore()` bị bọc trong điều kiện `if (isAuthorizedAdminUser(auth.currentUser))`, và `firestore.rules` bắt buộc `isSignedIn()` cho cả thao tác ghi (`create`) lẫn đọc (`list`/`get`). Hệ quả là 100% lượt tương tác của khách và của Admin khi mở bằng phím tắt đều không được đẩy lên hay tải về từ Cloud Firestore.
3. **Thiếu Lớp Lưu trữ Server (`server.ts`) Dự phòng**:
   - Ứng dụng đang chạy thuần Vite SPA mà chưa có Express Backend API để lưu file vật lý (`.json` / `.csv`) trên ổ đĩa máy chủ làm nguồn đối chiếu dự phòng khi mạng hoặc trình duyệt chặn quyền lưu cục bộ.

---

## 2. Kiến trúc Giải pháp: Đồng bộ Đa tầng (3-Tier Persistence)

Hệ thống lưu trữ mới sẽ hoạt động đồng thời trên **3 tầng (Cloud Firestore + Server Disk API + LocalStorage)** cho cả **Hồ sơ Đăng ký Đại lý** và **Sự kiện Tracking**:

### Tầng 1: Cloud Firestore (`ai-studio-kytvietnamhthngc-...`)
- **Cập nhật `firebase-blueprint.json` & `firestore.rules`**:
  - Bổ sung thực thể `DealerApplication` và collection `/dealer_applications/{applicationId}` với kiểm duyệt schema chặt chẽ (tên cửa hàng, người liên hệ, số điện thoại, email, tỉnh/thành phố, địa chỉ, quy mô kinh doanh, ghi chú, thời gian tạo).
  - Cho phép khách truy cập (`allow create`) gửi sự kiện hợp lệ vào `/tracking_events/{eventId}` và gửi hồ sơ đăng ký hợp lệ vào `/dealer_applications/{applicationId}` thông qua bộ kiểm tra cấu trúc dữ liệu (`isValidTrackingEvent`, `isValidDealerApplication`) mà không bị chặn bởi lỗi Google OAuth iframe.
  - Cho phép bảng Admin (`Shift+KYT123`) truy vấn danh sách (`get`, `list`) và xóa/quản lý dữ liệu đồng bộ thời gian thực (`onSnapshot` / `getDocs`).
  - Triển khai rules mới lên Firebase bằng công cụ `deploy_firebase`.

### Tầng 2: Express Backend Server (`server.ts` trên cổng 3000)
- Tích hợp Express server chạy chung với Vite middleware (`tsx server.ts`), cung cấp các REST API:
  - `GET /api/dealers` & `POST /api/dealers` & `DELETE /api/dealers`: Lưu và đọc trực tiếp danh sách hồ sơ đăng ký đại lý vào file bền vững trên máy chủ (`data/dealer-applications.json` và tự động xuất sẵn `data/dealer-applications.csv` chuẩn UTF-8 BOM).
  - `GET /api/dealers/csv`: Endpoint tải xuống trực tiếp file `.CSV` chuẩn từ máy chủ cho Admin.
  - `GET /api/tracking` & `POST /api/tracking` & `DELETE /api/tracking`: Lưu và đồng bộ sự kiện tracking cùng cấu hình Pixel (`GET/POST /api/tracking/config`) trên máy chủ (`data/tracking-events.json`).
  - `POST /api/diagnostics/self-test`: Endpoint kiểm tra toàn diện khả năng đọc/ghi của Server Disk.

### Tầng 3: Browser Storage (`localStorage` + In-Memory Cache)
- Lưu tức thì ở phía trình duyệt để giao diện phản hồi 0ms, đồng thời tự động hợp nhất (deduplicate theo `id`) dữ liệu từ **Cloud Firestore + Server API + LocalStorage** khi Admin mở bảng quản trị `Shift + K + Y + T + 1 + 2 + 3`.

---

## 3. Công cụ Tự động Kiểm tra & Báo cáo trong Admin (`Shift + K + Y + T + 1 + 2 + 3`)

Bổ sung thanh trạng thái đồng bộ trực tiếp và nút **"Kiểm tra Hệ thống Lưu trữ (Run Self-Test)"** ngay trong `TrackingDashboardModal.tsx`:
- Khi bấm nút, hệ thống sẽ tự động chạy quy trình kiểm thử 4 bước (và tự động dọn dẹp bản ghi test sau khi xác nhận thành công, hoặc cho phép tạo bản ghi test mẫu):
  1. **Test Tracking Event**: Ghi 1 sự kiện tracking thử nghiệm -> Kiểm tra ghi thành công trên LocalStorage, Server API (`/api/tracking`) và Cloud Firestore (`/tracking_events`).
  2. **Test Dealer Registration Form**: Gửi 1 hồ sơ đại lý thử nghiệm -> Kiểm tra lưu thành công trên LocalStorage, Server API (`/api/dealers`) và Cloud Firestore (`/dealer_applications`).
  3. **Test Đọc & Đồng bộ Dữ liệu (Read-back Verification)**: Tải lại danh sách từ cả 3 nguồn và đối chiếu mã ID khớp 100%.
  4. **Test Xuất File `.CSV` (UTF-8 BOM)**: Kiểm tra khả năng tạo chuỗi CSV và phản hồi từ `/api/dealers/csv`.
- Hiển thị bảng kết quả trực quan (Pass/Fail từng tầng kèm độ trễ `ms` và số lượng bản ghi hiện có ở mỗi tầng).

---

## 4. Các File Sẽ Tạo Mới & Cập Nhật

- `firebase-blueprint.json` & `firestore.rules`: Thêm schema `DealerApplication` (`/dealer_applications/{applicationId}`) và cập nhật quy tắc bảo mật cho `/tracking_events`, `/tracking_configs`, `/dealer_applications`.
- `server.ts` & `package.json`: Khởi tạo Express server tích hợp Vite, cung cấp API lưu trữ bền vững `/api/dealers`, `/api/tracking`, `/api/diagnostics/self-test`.
- `src/lib/tracking.ts`:
  - Nâng cấp `submitDealerApplication()`, `getDealerApplications()`, `clearDealerApplications()` để đồng bộ cả 3 tầng (Firestore + Server API + LocalStorage).
  - Nâng cấp `trackKytEvent()`, `getTrackedEvents()`, `clearTrackedEvents()`, `saveTrackingConfig()` để đồng bộ 3 tầng không phụ thuộc `auth.currentUser`.
  - Thêm hàm `runStorageSelfTest()` trả về báo cáo chi tiết từng tầng lưu trữ.
- `src/components/DealerRegistrationSection.tsx`: Hiển thị trạng thái xác nhận lưu thành công đa tầng sau khi khách bấm gửi form.
- `src/components/TrackingDashboardModal.tsx`: Thêm bảng trạng thái kết nối 3 tầng (Cloud Firestore / Server API / LocalStorage) và nút chạy **Kiểm tra Hệ thống Lưu trữ (Self-Test)** trực tiếp trong giao diện Admin.
