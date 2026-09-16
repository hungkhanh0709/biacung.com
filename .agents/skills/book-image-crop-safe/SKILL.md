---
name: book-image-crop-safe
description: Clone ảnh gốc với prefix bookId rồi crop toàn bộ thumbnail và gellery_imgs đang được website dùng trong một lượt. Dùng khi cần chuẩn hóa tỷ lệ ảnh cho từng bookId trong biacung.com mà vẫn giữ bản gốc ngay cạnh ảnh hiện tại.
---

# Book Image Crop Safe

Xử lý đúng một `bookId` mỗi lần. Việc người dùng gọi skill với `bookId` là yêu cầu hoàn tất toàn bộ quy trình: clone ảnh gốc rồi crop tất cả ảnh mục tiêu trong cùng lượt. Không chờ người dùng confirm từng file hoặc từng framing.

## Phạm vi

- JSON: `data/book/<bookId>.json`.
- Ảnh mục tiêu: `thumbnail` và `gellery_imgs` của edition được chọn.
- Giữ nguyên cách viết `gellery_imgs` của schema.
- Không sửa metadata, thứ tự gallery hoặc URL nếu basename ảnh đang dùng không đổi.
- Nếu có nhiều edition mà chưa xác định được edition mục tiêu, dừng và hỏi lại.

## Quy trình

### 1. Kiểm tra đầu vào

1. Xác nhận `bookId` chỉ gồm chữ thường, chữ số và dấu gạch ngang.
2. Đọc toàn bộ JSON, kiểm tra trường `id` khớp và thu thập danh sách duy nhất theo thứ tự `thumbnail` rồi `gellery_imgs`.
3. Xác nhận mọi ảnh tồn tại trong `assets/img/books/<bookId>/` và không phải URL remote.
4. Xem trực tiếp tất cả ảnh; ghi nhận kích thước pixel, orientation/EXIF, codec và bố cục cần giữ.

### 2. Clone ảnh gốc

Với mỗi file đang được JSON tham chiếu, tạo một bản sao byte-for-byte ngay trong cùng thư mục với tên:

`<bookId>_<basename-hiện-tại>`

Ví dụ:

`chauchaubook-back-cover.jpg` → `j-d-salinger-the-catcher-in-the-rye_chauchaubook-back-cover.jpg`

Các quy tắc:

- Bản có prefix `bookId` là bản gốc để người dùng tự backup; không crop và không đưa vào JSON.
- File basename cũ, chẳng hạn `chauchaubook-back-cover.jpg`, tiếp tục là asset website và sẽ được crop.
- Không ghi đè nếu file clone đích đã tồn tại; xem đó là backup đã được tạo ở lần chạy trước và dùng chính file clone làm nguồn khi cần crop lại.
- Không xóa file clone tự động.

### 3. Crop toàn bộ ảnh mục tiêu

- Mặc định cho ảnh dọc ở `detail-focus-cover`: tỷ lệ `3:4`.
- Với nguồn hiển thị đủ lớn, ưu tiên `1680 × 2240`.
- Không upscale. Với ảnh nhỏ hơn, dùng crop `3:4` lớn nhất phù hợp.
- Nếu ảnh đã là `3:4`, không crop chỉ để thay đổi kích thước.
- Không ép ảnh ngang hoặc bố cục sẽ mất chủ thể về `3:4`; đề xuất ngoại lệ riêng.
- Xử lý orientation khi tạo bản crop, nhưng file clone có prefix phải giữ nguyên dữ liệu gốc.
- Chọn focal point riêng cho từng ảnh; không mặc định crop giữa hàng loạt.

Thực hiện lần lượt cho mọi ảnh mục tiêu, không dừng sau từng file:

1. Dùng bản clone `<bookId>_<basename>` làm nguồn để bản crop luôn xuất phát từ ảnh gốc.
2. Chọn focal point riêng, tạo kết quả crop vào file tạm và xem trực tiếp.
3. Nếu kết quả đúng orientation, kích thước và không mất chi tiết quan trọng, thay ngay file basename cũ mà website đang dùng.
4. Nếu một ảnh thật sự không thể crop về tỷ lệ chung mà không phá bố cục, giữ nguyên riêng ảnh đó, tiếp tục các ảnh còn lại và báo rõ ngoại lệ ở cuối; không hỏi confirm cho các ảnh bình thường.
5. Giữ nguyên URL trong JSON. Chỉ cập nhật JSON nếu người dùng yêu cầu đổi basename.
6. Sau khi xử lý hết, xem lại toàn bộ ảnh và kiểm tra trang `detail-focus-cover` nếu có thể.

## Hoàn tất

Xác nhận:

- Mỗi ảnh mục tiêu có đúng một bản clone `<bookId>_<basename>` chưa bị crop.
- Các file basename cũ là ảnh crop đã được duyệt.
- JSON parse thành công và mọi URL vẫn tồn tại.
- Không có file ngoài book hiện tại bị thay đổi.

Báo cáo ngắn gọn các file clone, crop thực tế của từng ảnh, file đã thay và kết quả kiểm tra. Không tự chuyển sang `bookId` tiếp theo.
