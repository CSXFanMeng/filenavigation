# FileNavigation

[Tất cả ngôn ngữ](../../README.md) · [Bản phát hành mới nhất](https://github.com/CSXFanMeng/filenavigation/releases/latest)

FileNavigation là ứng dụng máy tính Rust + Tauri để tìm tệp và thư mục trong một thư mục cục bộ đã chọn. Quá trình tìm kiếm chạy hoàn toàn trên máy; tên, đường dẫn và nội dung không được tải lên.

## Tính Năng

- Tìm kiếm tệp và thư mục cục bộ
- Khớp tên tệp theo chuỗi thường hoặc biểu thức chính quy với tùy chọn phân biệt hoa thường
- Backend Rust/Tauri hoàn toàn bất đồng bộ, hỗ trợ hủy và tiến trình trực tiếp
- Lọc, sắp xếp và hiển thị kết quả tăng dần
- Giao diện đáp ứng hiện đại với biểu tượng Lucide và trạng thái tiêu điểm dễ truy cập
- Cửa sổ không khung do ứng dụng vẽ với nút điều khiển được bản địa hóa
- Không gian làm việc cố định và danh sách kết quả cuộn độc lập
- Giao diện 20 ngôn ngữ trong các tệp riêng
- Cửa sổ cập nhật trên thanh tiêu đề với ghi chú GitHub bản địa hóa có thể cuộn và cài đặt tự động có chữ ký
- Cửa sổ cài đặt với chủ đề sáng và tối được lưu lại
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

## Được Xây Dựng Với OpenAI Codex Và GPT-5.6

OpenAI Codex và GPT-5.6 được sử dụng như các cộng sự kỹ thuật cho kiến trúc, tìm kiếm bất đồng bộ có thể hủy, quốc tế hóa theo mô-đun, gỡ lỗi giao diện đáp ứng không viền, tự động hóa CI và phát hành đa nền tảng, tài liệu đa ngôn ngữ, cùng quá trình xác minh liên tục bằng bản dựng và kiểm thử.

AI chỉ được sử dụng trong quá trình phát triển. FileNavigation không gọi dịch vụ OpenAI khi chạy và không gửi tên tệp, đường dẫn, nội dung tìm kiếm hoặc nội dung tệp đến bất kỳ mô hình nào.

## Giấy Phép

Dự án sử dụng [FileNavigation Non-Commercial Source License](../../LICENSE.md). Cấm sử dụng thương mại, bán lại, lưu trữ SaaS, dịch vụ trả phí, tích hợp thương mại mã nguồn đóng và đóng gói trong sản phẩm thương mại.
