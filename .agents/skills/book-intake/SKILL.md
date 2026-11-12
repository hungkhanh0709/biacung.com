---
name: book-intake
description: "Nhập trọn sách từ tin phát hành/ảnh: tra nguồn, lập nháp, lưu qua form/API, xử lý ảnh và kiểm tra UI. Cập nhật sách đã có khi người dùng yêu cầu; chỉ dừng ở nháp nếu được chỉ định."
---

# Nhập sách

Đọc [workflow](references/book-intake-workflow.md) trước khi làm; lệnh chạy từ repo root. Tự hoàn tất phạm vi được yêu cầu, không đòi người dùng điền schema hoặc duyệt từng bước.

- **Sách mới:** một tựa mỗi lượt, đầu vào/nháp tại `data/_raw/`. Tiếp tục nháp đang dở của cùng lượt, không nhập trùng.
- **Book ID:** dùng tên tác giả và tựa gốc đã xác minh khi tạo được slug Latin; sách có tựa gốc tiếng Anh phải dùng tựa đó, không mặc định tựa Việt. Không tự dịch ngược để tạo tên tiếng Anh. Không đổi hàng loạt ID cũ.
- **Gộp/tách edition:** nếu chỉ khác hộp/phụ kiện/giá còn ruột, bìa, chữ ký và dải số giống nhau, hỏi người dùng gộp hay tách trước khi lưu. Không hỏi lại lựa chọn đã chốt. Gộp thì giữ giá cơ bản trong `cover_price`, các tùy chọn và giá đầy đủ trong `detail`, hợp nhất ảnh không trùng.
- **Thumbnail:** so sánh các ảnh ở kích thước card, ưu tiên bìa sáng, sắc nét, đọc rõ tựa và đúng phiên bản. Không chọn ảnh tối chỉ vì bố cục đầy đủ; tìm ảnh bìa tốt hơn từ nguồn chính thức nếu cần, không tự tăng sáng/crop.
- **Sách đã có:** theo [cập nhật có phạm vi](references/update-existing.md), chỉ đổi sách/trường được yêu cầu. Bổ sung thông tin/ảnh phải giữ dữ liệu cũ; không tự xóa tên người, làm rỗng mảng hoặc chuyển vai trò đã lưu khi người dùng chưa yêu cầu sửa/xóa trường đó.
- **Tham khảo edition tương đồng:** khi edition mới thiếu thông tin, chủ động tìm edition đã có của cùng tác phẩm, tác giả và đơn vị phát hành; đối chiếu dịch giả cùng các dấu hiệu về bản dịch/nội dung. Nếu tương đồng cao, đề xuất edition nguồn và từng trường/giá trị muốn sao chép, hỏi xác nhận trước khi áp dụng theo [quy tắc tham khảo](references/book-intake-workflow.md#tham-khảo-edition-tương-đồng). Không hỏi lại phạm vi đã được xác nhận.
- **Ngày phát hành:** nhập `pub_date` theo [quy ước ngày](references/book-intake-workflow.md#ngày-phát-hành); giữ `pub_year` tương thích, không chuyển đổi hàng loạt edition cũ.
- **Giá bìa:** dưới 1 triệu dùng `k` (`900k`); từ 1 triệu dùng `tr` và phần nghìn `k` (`3tr900k`), tròn triệu ghi `3tr`. Chi tiết trong [workflow](references/book-intake-workflow.md#giá-bìa).
- **Caption/Format:** ưu tiên keyword và Memo trong [bảng tham chiếu](references/caption-format.md), không dùng `vocab`. Format chưa xác định được thì hỏi người dùng trước khi lưu.
- **Lưu dữ liệu:** dùng [book-batch-input](../book-batch-input/SKILL.md).
- **Ảnh:** dùng [book-image-crop-safe](../book-image-crop-safe/SKILL.md).

Bắt đầu bằng `git status --short`, rồi `init` và `sources` theo workflow. Raw bị gitignore: mở từng ảnh được liệt kê và ghi review trước khi tra web hoặc hỏi danh tính sách.

Khi sửa lỗi quy trình, sửa hướng dẫn/nháp trước rồi lưu lại qua form/API; không vá JSON đầu ra hoặc đổi logic ứng dụng. Không commit/push/deploy khi chưa được yêu cầu.

Báo ngắn gọn sách/edition đã lưu, URL/UI đã kiểm tra, dữ kiện thiếu và trạng thái dọn nháp. Chỉ nhận hoàn tất khi toàn workflow đạt.
