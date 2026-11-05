---
name: book-batch-input
description: Nhập một hoặc nhiều sách vào biacung.com từ thông tin người dùng cung cấp, kiểm tra bản xem trước rồi lưu và xác minh trong workspace. Dùng Chrome MCP và form book-input khi khả dụng; chỉ cập nhật sách đã có khi người dùng yêu cầu rõ.
---

# Nhập sách vào workspace

Người dùng đã cho phép skill hoàn tất việc nhập và lưu sách được yêu cầu. Bàn giao bản nháp chưa lưu khi họ yêu cầu chỉ điền form, hoặc khi thiếu tựa đề/tác giả hay còn dữ kiện mâu thuẫn cần họ quyết định. Không tự thu thập dữ liệu web trừ khi được yêu cầu.

## Trước khi nhập

1. Xác nhận repo có book-input.html, script/book-input.js, script/book-input-server.js; xem git status để không ghi đè thay đổi sẵn có.
2. Kiểm tra API, không chỉ trang HTML: GET /api/index-state phải trả 200 với bookIndex, authors, series là mảng. Nếu cổng 3000 đang là static-server, khởi động npm run book-input-server, đọc URL thực tế trong log (server có thể chọn cổng 3001 trở lên) và kiểm tra lại API tại đúng URL đó. Dùng cùng origin cho form và API; không mặc định localhost:3000 hay 127.0.0.1:3000 chỉ vì trang mở được. Nếu sandbox chặn mở cổng, yêu cầu quyền thực thi cần thiết.
3. Với mỗi sách, xác định slug từ tựa đề và tác giả được cung cấp, hoặc dùng slug người dùng chỉ định. Kiểm tra data/book/<slug>.json và API. Nếu sách đã có, chỉ tải và sửa khi yêu cầu hiện tại nói rõ là cập nhật; nếu đang nhập sách mới, báo trùng và không ghi đè.

## Điền và kiểm tra

4. Ưu tiên Chrome MCP: mở một tab riêng cho mỗi sách tại URL của book-input-server, xác nhận tiêu đề và API trước khi điền. Nếu Chrome MCP bị khóa profile, kiểm tra và thử kết nối lại; không đóng phiên Chrome khác hoặc làm mất bản nháp. Nếu vẫn không dùng được mà người dùng yêu cầu hoàn tất việc nhập, có thể dùng API local hoặc chỉnh JSON trong repo như phương án cuối, nhưng phải tuân theo cùng schema/kiểm tra bên dưới và báo rõ cách đã dùng.
5. Chỉ điền dữ kiện có nguồn rõ. Chuẩn hóa 280.000đ thành 280k, 16x24 cm thành 16 x 24; không suy đoán năm xuất bản từ năm sinh/mất của tác giả, giá từ con số khác, hay tên người minh họa từ cả câu văn. Để trống trường chưa biết.
6. Có thể dán nguyên văn vào edition-raw-0; nút Điền vào form chỉ là gợi ý. Sau khi bấm, đối chiếu từng giá trị với nguồn và sửa/xóa mọi kết quả sai, đặc biệt title, authors, pub-year, cover-price, illustrators, format. Điền thủ công các trường rõ ràng mà parser bỏ sót. Giữ quy cách ấn bản trong detail, bỏ heading trang trí và không thêm dữ kiện.
7. Nếu biết series, điền tên hiển thị ở series và slug đúng ở edition-series-ids-0. Mở Xem trước JSON và lưu riêng từng file, kiểm tra slug, số phiên bản, ID, tác giả, series và mọi trường vừa nhập. Form chỉ tải sách cũ khi bấm Tải dữ liệu; đừng trộn bản nháp mới với phiên bản cũ.

## Lưu và xác minh

8. Khi đủ tựa đề, tác giả và dữ liệu không mâu thuẫn, bấm Lưu tất cả cho sách được yêu cầu, trừ khi người dùng yêu cầu dừng ở bản nháp. Có thể dùng API local với payload đã kiểm tra nếu Chrome không hoạt động. Khi buộc phải sửa JSON trực tiếp, cập nhật đồng bộ data/book/<slug>.json, data/book.json, data/author.json và series liên quan, giữ nguyên dữ liệu khác.
9. Sau khi lưu, đọc lại data/book/<slug>.json và các index liên quan; kiểm tra chỉ có những phiên bản dự định, dữ kiện đúng và git diff không có sửa đổi ngoài phạm vi. Nếu UI báo lỗi, kiểm tra file/API trước khi thử lại: một phần hoặc toàn bộ dữ liệu có thể đã được ghi. Không retry mù hoặc tải hàng loạt JSON tự động.
10. Bàn giao URL/tab còn mở, file đã lưu, dữ kiện còn thiếu và mọi lỗi chưa xử lý. Giữ server hoạt động để người dùng chỉnh tiếp.
