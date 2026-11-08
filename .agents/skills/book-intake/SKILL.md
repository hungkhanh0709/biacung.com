---
name: book-intake
description: "Nhập trọn sách từ tin phát hành/ảnh: tra nguồn, lập nháp, lưu qua form/API, xử lý ảnh và kiểm tra UI. Cập nhật sách đã có khi người dùng yêu cầu; chỉ dừng ở nháp nếu được chỉ định."
---

# Nhập sách

Đọc [workflow](references/book-intake-workflow.md) trước khi làm; lệnh chạy từ repo root. Tự hoàn tất phạm vi được yêu cầu, không đòi người dùng điền schema hoặc duyệt từng bước.

- **Sách mới:** một tựa mỗi lượt, đầu vào/nháp tại `data/_raw/`. Tiếp tục nháp đang dở của cùng lượt, không nhập trùng.
- **Sách đã có:** theo [cập nhật có phạm vi](references/update-existing.md), chỉ đổi sách/trường được yêu cầu.
- **Ngày phát hành:** nhập `pub_date` theo [quy ước ngày](references/book-intake-workflow.md#ngày-phát-hành); giữ `pub_year` tương thích, không chuyển đổi hàng loạt edition cũ.
- **Giá bìa:** dưới 1 triệu dùng `k` (`900k`); từ 1 triệu dùng `tr` và phần nghìn `k` (`3tr900k`), tròn triệu ghi `3tr`. Chi tiết trong [workflow](references/book-intake-workflow.md#giá-bìa).
- **Caption/Format:** ưu tiên keyword và Memo trong [bảng tham chiếu](references/caption-format.md), không dùng `vocab`. Format chưa xác định được thì hỏi người dùng trước khi lưu.
- **Lưu dữ liệu:** dùng [book-batch-input](../book-batch-input/SKILL.md).
- **Ảnh:** dùng [book-image-crop-safe](../book-image-crop-safe/SKILL.md).

Bắt đầu bằng `git status --short`, rồi `init` và `sources` theo workflow. Raw bị gitignore: mở từng ảnh được liệt kê và ghi review trước khi tra web hoặc hỏi danh tính sách.

Khi sửa lỗi quy trình, sửa hướng dẫn/nháp trước rồi lưu lại qua form/API; không vá JSON đầu ra hoặc đổi logic ứng dụng. Không commit/push/deploy khi chưa được yêu cầu.

Báo ngắn gọn sách/edition đã lưu, URL/UI đã kiểm tra, dữ kiện thiếu và trạng thái dọn nháp. Chỉ nhận hoàn tất khi toàn workflow đạt.
