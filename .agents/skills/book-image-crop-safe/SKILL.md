---
name: book-image-crop-safe
description: Nhập và đặt tên ảnh sách theo dự án, kiểm tra kích thước/dung lượng, resize và tối ưu nhẹ khi cần, cập nhật thumbnail/gellery_imgs. Mỗi ảnh nguồn tạo tối đa một file website; giữ bố cục và không tự tạo clone, backup hay biến thể crop.
---

# Đặt tên và tối ưu ảnh sách

Mục tiêu là giảm dung lượng tải và lưu trữ, giữ chất lượng chữ/chi tiết và toàn bộ bố cục. **Một ảnh nguồn → tối đa một file website được tối ưu**; không giữ thêm bản gốc, clone, backup hay biến thể trong assets. Khi tối ưu ảnh đã có, thay nội dung tại cùng đường dẫn để các vị trí tiếp tục dùng chung URL.

**Phạm vi nguồn:** khi người dùng đã cung cấp ảnh, chỉ xử lý tập ảnh đó; không tự tìm/tải thêm ảnh web, ảnh “official”, ảnh cùng bìa/góc chụp hoặc ảnh khác kích thước để bổ sung thumbnail/gallery. Nguồn web có thể dùng đối chiếu metadata mà không nhập ảnh vào website. Nếu ảnh cung cấp không dùng được, báo rõ thay vì tự thêm ảnh. Chỉ tìm ảnh khi chưa có ảnh đầu vào hoặc người dùng yêu cầu bổ sung/tìm ảnh; không tự mở rộng thành gallery.

## Nhập ảnh từ data/_raw

1. Dùng sources và evidence.image_reviews đã có từ book-intake; chỉ chạy `node script/book-intake.js sources` khi chưa làm hoặc nguồn thay đổi. Mở ảnh chưa xem, đọc thông tin và gán đúng edition; raw bị gitignore nên không suy thiếu ảnh từ rg mặc định. Chưa nhận diện được thì giữ nguồn và ghi unresolved.
2. Đặt một tên kebab-case mô tả đúng ảnh, ví dụ `bach-viet-gioi-han-cover.jpeg`. Giữ codec/đuôi đúng. Asset nằm ở `/assets/img/books/<bookId>/`; không tạo bản có prefix bookId để backup.
3. Chọn thumbnail trong tập ảnh được phép xử lý, ưu tiên bìa rõ, đủ nét và đúng bản khi xem ở kích thước card. Một ảnh đầu vào thì chỉ tạo thumbnail, `gellery_imgs: []`; không tìm hoặc tạo ảnh thứ hai để có gallery. Với nhiều ảnh đầu vào, gallery chỉ dùng ảnh có nội dung bổ sung, không trùng/gần trùng thumbnail. Khác tên file, URL, kích thước, watermark hoặc cách crop không tự biến một ảnh thành nguồn độc lập cần lưu thêm. Đánh dấu nguồn trùng là reference và ghi lý do; không xuất asset. Không mặc định chuyển thumbnail cũ sang gallery khi thay ảnh. Một ảnh dùng nhiều vị trí thì dùng chung URL.
4. Tạo `data/_raw/image-plan.json` theo mẫu trong [workflow](../book-intake/references/book-intake-workflow.md#image-planjson): mỗi nguồn đúng một entry với source/name/edition_id/role/reason. Không thêm vùng crop. Công cụ chặn cùng ảnh xuất thành hai file, kể cả đã đổi tên nguồn.
5. Chạy `python3 script/book-images.py preview`. File trong previews chỉ là tạm để kiểm tra trước apply, không phải asset thứ hai và được dọn cùng raw. Xem ảnh, đối chiếu bố cục, số pixel và bytes_before/bytes_after trong image-report.json.
6. Đánh giá cả số pixel và dung lượng byte. Giới hạn 1680 × 2240 là trần, không phải kích thước đích hay bằng chứng ảnh đã tối ưu; giữ tỷ lệ/toàn khung, không upscale. Thử nén nhẹ ngay cả khi không cần resize: giữ codec, JPEG/WebP/AVIF quality khoảng 85, PNG lossless. Chỉ chọn kết quả nhẹ hơn và vẫn rõ chữ, nét da/giấy, màu sắc sau khi xem preview; nếu không đạt thì giữ nguồn. Không ép mọi ảnh vào một mức KB hoặc tiếp tục giảm chất lượng chỉ để đạt dung lượng tùy ý. Không tạo thêm asset để so sánh; mọi thử nghiệm chỉ ở raw, đầu ra cuối vẫn một file.
7. Khi preview đạt, chạy `python3 script/book-images.py apply` cho cả sách mới/thêm edition. Helper dùng `data/_raw/book.json`, chỉ ghi asset, nháp và evidence.images; không ghi JSON chính thức. Sau đó điền URL và lưu bằng nút form book-input qua Chrome MCP. Sách đã có cần nháp chứa baseline và edition mới trước preview. Giữ nguồn ở raw đến khi xác minh detail thành công; chỉ một asset mỗi nguồn, không clone/backup.
8. Khi book-intake điều phối, xác nhận ảnh cùng bước detail/cleanup của workflow, không chạy check/UI riêng. Chạy độc lập thì kiểm đúng URL ảnh/edition trên detail sau lưu. Ảnh chỉ đọc dữ liệu đánh dấu reference với lý do; unresolved giữ để xử lý tiếp.

Tối ưu một lượt rồi xem preview; chỉ thử lại khi chất lượng/bố cục có vấn đề. Không lặp tinh chỉnh để đạt một mức KB tùy ý.

## Ảnh đã có trên website

Chỉ xử lý ảnh được yêu cầu, giữ nguyên bố cục, so sánh pixel/dung lượng trước và sau. Khi chỉ đổi tên phải cập nhật đúng URL JSON; không tự tạo gallery, backup hoặc crop. Không xử lý lại ảnh đã tối ưu nếu không có lợi ích. Không xóa ảnh của sách khác.

Báo một tên file đầu ra cho mỗi nguồn, kích thước và dung lượng trước/sau, mức giảm; nếu giữ nguyên thì nêu lý do thực tế về dung lượng/chất lượng, không chỉ vì ảnh nằm trong giới hạn pixel. Chỉ dọn các file tạm hoặc biến thể do chính lượt xử lý tạo ra sau khi URL đúng và UI tải được.
