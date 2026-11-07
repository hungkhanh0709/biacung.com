---
name: book-image-crop-safe
description: Nhập và đặt tên ảnh sách theo dự án, kiểm tra kích thước/dung lượng, resize và tối ưu nhẹ khi cần, cập nhật thumbnail/gellery_imgs. Mỗi ảnh nguồn tạo tối đa một file website; giữ bố cục và không tự tạo clone, backup hay biến thể crop.
---

# Đặt tên và tối ưu ảnh sách

Giữ tên skill cũ để tiếp tục dùng được. Quy trình mặc định đã đổi theo yêu cầu người dùng: **một ảnh nguồn → một file website**. Ảnh dùng nguyên bố cục; chỉ đặt lại tên, kiểm tra dung lượng và resize/nén khi có lợi cho tốc độ tải. Crop hoặc tạo thêm biến thể chỉ thuộc yêu cầu riêng, rõ ràng của người dùng; không tự thực hiện trong lượt nhập sách.

## Nhập ảnh từ data/_raw

1. Chạy `node script/book-intake.js sources`, mở từng ảnh và ghi evidence.image_reviews. Raw bị gitignore nên không kết luận thiếu ảnh từ `rg --files` mặc định. Đọc thông tin trên ảnh và gán đúng edition; chưa nhận diện được thì giữ nguồn và ghi unresolved.
2. Đặt một tên kebab-case mô tả đúng ảnh, ví dụ `bach-viet-gioi-han-cover.jpeg`. Giữ codec/đuôi đúng. Asset nằm ở `/assets/img/books/<bookId>/`; không tạo bản có prefix bookId để backup.
3. Một ảnh duy nhất làm thumbnail và gallery để `[]`. Gallery chỉ chứa những ảnh nguồn khác, không chứa thumbnail lặp lại hoặc bản crop/resize khác của cùng ảnh. Nếu một ảnh dùng ở nhiều vị trí thì dùng chung URL, không nhân bản file.
4. Tạo `data/_raw/image-plan.json` theo mẫu trong [workflow](../book-intake/references/book-intake-workflow.md#image-planjson): mỗi nguồn đúng một entry với source/name/edition_id/role/reason. Không thêm vùng crop. Công cụ chặn cùng ảnh xuất thành hai file, kể cả đã đổi tên nguồn.
5. Chạy `python3 script/book-images.py preview`. File trong previews chỉ là tạm để kiểm tra trước apply, không phải asset thứ hai và được dọn cùng raw. Xem ảnh, đối chiếu bố cục, số pixel và bytes_before/bytes_after trong image-report.json.
6. Mặc định tối đa 1680 × 2240, giữ tỷ lệ gốc và toàn khung, không upscale. Ảnh đã đủ nhỏ thì giữ nguyên byte, không encode lại chỉ để đổi tên. Khi resize cần encode, giữ codec, JPEG/WebP/AVIF quality khoảng 85, PNG lossless; nếu kết quả không nhẹ hơn thì giữ nguồn. Không hy sinh chữ/chi tiết để đạt dung lượng tùy ý.
7. Khi ảnh đạt, chạy `python3 script/book-images.py apply`. Chỉ ghi một asset cho mỗi nguồn và cập nhật JSON chính thức/nháp cùng evidence.images (source/hash → asset/hash, kích thước và dung lượng trước/sau). Không clone ảnh gốc. Giữ nguồn ở raw cho đến khi kiểm tra JSON và UI thành công; book-intake sẽ dọn nguồn/preview sau finish.
8. Kiểm tra `node script/book-intake.js check --book <id> --relations --images` và trang detail. Ảnh chỉ dùng đọc dữ liệu được đánh dấu reference với lý do; không sao chép thành asset nếu website không cần dùng. Ảnh unresolved phải giữ để xử lý tiếp.

## Ảnh đã có trên website

Chỉ xử lý ảnh được yêu cầu, giữ nguyên bố cục, so sánh pixel/dung lượng trước và sau. Khi chỉ đổi tên phải cập nhật đúng URL JSON; không tự tạo gallery, backup hoặc crop. Không xử lý lại ảnh đã tối ưu nếu không có lợi ích. Không xóa ảnh của sách khác.

Báo một tên file đầu ra cho mỗi nguồn, kích thước và dung lượng trước/sau, mức giảm, ảnh giữ nguyên nếu không cần resize. Chỉ dọn các file tạm hoặc biến thể do chính lượt xử lý tạo ra sau khi URL đúng và UI tải được.
