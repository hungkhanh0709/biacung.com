---
name: book-batch-input
description: Dùng Chrome MCP mở form book-input của biacung.com và điền các trường sách xác định được từ mô tả tự nhiên, sau đó để người dùng hoàn thiện và tự lưu. Dùng khi nhập một hoặc nhiều sách mới qua giao diện; không dùng để ghi JSON trực tiếp, cập nhật book đã tồn tại hoặc tự thu thập dữ liệu web.
---

# Điền form sách bằng Chrome MCP

Mở form chính chủ của repo, điền những dữ kiện chắc chắn và bàn giao tab trình duyệt cho người dùng. Form chịu trách nhiệm chuẩn hóa slug, edition ID, preview và lưu dữ liệu.

## Điều kiện

- Phải có bộ công cụ Chrome MCP trong phiên hiện tại. Nếu chưa có, dừng và yêu cầu người dùng restart Codex; không quay lại cách ghi JSON trực tiếp.
- Nhánh hiện tại phải có `book-input.html`, `script/book-input.js` và `script/book-input-server.js`.
- Chỉ xử lý sách mới. Nếu slug đã tồn tại, dừng tab đó và báo người dùng.

## Quy trình

1. Trích xuất dữ liệu từ lời người dùng. Chuẩn hóa giá như `280.000đ` thành `280k` và kích thước như `14x20.5 cm` thành `14 x 20.5`; không suy đoán title, author, NXB, năm, số trang, dịch giả hoặc ảnh khi nguồn không nói.
2. Kiểm tra server chưa chạy thì khởi động `npm run book-input-server` và giữ process hoạt động. Chờ log `Book input server listening on http://127.0.0.1:3000`.
3. Với mỗi sách, dùng Chrome MCP mở tab riêng tại `http://127.0.0.1:3000/book-input.html`. Chờ tiêu đề `Nhập dữ liệu sách` và các field xuất hiện.
4. Điền field cơ bản khi biết chắc: `titleOriginal`, `title`, `authors`, `bookId`, `awards`, `series`. Nếu người dùng chỉ đưa slug đích thì điền `bookId`, không tách slug để đoán title hoặc author.
5. Dán nguyên văn thông tin ấn bản vào `edition-raw-0`, rồi bấm `Điền vào form`. Kiểm tra lại kết quả parser trước khi bổ sung trực tiếp các field chắc chắn mà parser bỏ sót.
6. Các field edition đầu tiên có tên `edition-*-0`: `caption`, `pub-year`, `publisher`, `issuers`, `series-ids`, `translators`, `illustrators`, `proofreaders`, `format`, `cover-price`, `page-count`, `print-run`, `copy-numbering`, `size`, `weight`, `thumbnail`, `gallery`, `detail`.
7. Với mô tả “555 bản bìa cứng, đánh số 1-555, có bìa áo”, có thể điền `caption = Bìa Cứng Giới Hạn`, `format = Bìa cứng áo ôm`, `print-run = 555`, `copy-numbering = 001-555`. Giữ nội dung quy cách trong `detail`, bỏ heading trang trí nhưng không viết thêm dữ kiện.
8. Nếu biết series, dùng đúng tên hiển thị ở `series` và đúng slug ở `edition-series-ids-0`; không tự tạo series mới từ phỏng đoán.
9. Mở phần `Xem trước JSON và lưu riêng từng file`, kiểm tra slug/file đích cùng các field đã điền. Không bấm bất kỳ nút lưu hoặc download nào.
10. Bàn giao danh sách tab, field đã điền và field còn thiếu. Giữ server và Chrome mở để người dùng nhập tiếp rồi tự bấm `Lưu tất cả`.

## Ranh giới an toàn

- Không bấm `Lưu tất cả`, nút submit cuối form, hay các nút `Lưu book.json`, `Lưu detail.json`, `Lưu author.json`, `Lưu series.json`.
- Không gọi trực tiếp API save và không sửa `data/*.json` trong workflow này.
- Không điền giá trị có độ tin cậy thấp. Để trống tốt hơn điền sai.
- Không dùng cùng một tab cho nhiều sách; mỗi tab giữ một draft để người dùng hoàn thiện.
- Nếu Chrome MCP lỗi giữa chừng, báo tab và field cuối cùng đã hoàn tất; không tự chuyển sang script hoặc ghi file.
