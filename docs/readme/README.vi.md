# FileNavigation

[Tất cả ngôn ngữ](../../README.md) · [Bản phát hành mới nhất](https://github.com/CSXFanMeng/filenavigation/releases/latest)

FileNavigation là ứng dụng máy tính Rust + Tauri để tìm tệp và thư mục trong một thư mục cục bộ đã chọn. Quá trình tìm kiếm chạy hoàn toàn trên máy; tên, đường dẫn và nội dung không được tải lên.

## Tính Năng

- Tìm kiếm tệp và thư mục cục bộ
- Backend Rust/Tauri hoàn toàn bất đồng bộ, hỗ trợ hủy và tiến trình trực tiếp
- Lọc, sắp xếp và hiển thị kết quả tăng dần
- Giao diện đáp ứng hiện đại với biểu tượng Lucide và trạng thái tiêu điểm dễ truy cập
- Cửa sổ không khung do ứng dụng vẽ với nút điều khiển được bản địa hóa
- Không gian làm việc cố định và danh sách kết quả cuộn độc lập
- Giao diện 20 ngôn ngữ trong các tệp riêng
- Kiểm tra GitHub Release mới nhất với ghi chú theo ngôn ngữ hiện tại
- Hiển thị digest của bộ cài để kiểm tra tính toàn vẹn

## Tải Xuống

- Windows: `.exe` và `.msi`
- macOS: `.dmg` và `.app`
- Linux: `.deb`, `.rpm` và `.AppImage`

Tải từ [GitHub Releases](https://github.com/CSXFanMeng/filenavigation/releases/latest).

## Phát Triển Và Build

```bash
npm install
npm run tauri:dev
npm run tauri:build
```

Nếu PowerShell chặn `npm.ps1`, hãy dùng `npm.cmd`. Sản phẩm build nằm trong `src-tauri/target/release/bundle/`.

## Ngôn Ngữ Và Cập Nhật

Bản dịch nằm trong `src/i18n/locales`. [RELEASE_NOTES.md](../../RELEASE_NOTES.md) dùng các khối `<!-- lang:xx -->`. Trình cập nhật chọn ngôn ngữ hiện tại, sau đó tiếng Anh và cuối cùng là toàn bộ nội dung Release.

## Giấy Phép

Dự án sử dụng [FileNavigation Non-Commercial Source License](../../LICENSE.md). Cấm sử dụng thương mại, bán lại, lưu trữ SaaS, dịch vụ trả phí, tích hợp thương mại mã nguồn đóng và đóng gói trong sản phẩm thương mại.
