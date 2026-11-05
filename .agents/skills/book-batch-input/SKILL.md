---
name: book-batch-input
description: Nhập một hoặc nhiều sách qua form book-input hiện có, điền dữ liệu nháp, xem trước rồi lưu và xác minh trong workspace. Dùng cho bước nhập/lưu dữ liệu; với tin phát hành và ảnh cần nghiên cứu rồi hoàn tất cả quy trình, dùng book-intake điều phối. Chỉ cập nhật sách đã có khi người dùng yêu cầu rõ.
---

# Nhập sách vào workspace

Hoàn tất việc nhập và lưu sách được yêu cầu. Bàn giao bản nháp chưa lưu khi người dùng chỉ muốn điền form, hoặc khi thiếu danh tính tựa/tác giả/edition hay còn mâu thuẫn quan trọng cần họ quyết định. Khi `book-intake` điều phối, tra cứu bổ sung đã nằm trong phạm vi yêu cầu; nếu chỉ nhập dữ liệu đã chốt thì không tự mở rộng thành đợt nghiên cứu.

## Trước khi nhập

1. Xác nhận repo có book-input.html, script/book-input.js, script/book-input-server.js; xem git status để không ghi đè thay đổi sẵn có.
2. Kiểm tra API, không chỉ trang HTML: GET /api/index-state phải trả 200 với bookIndex, authors, series là mảng. Nếu cổng 3000 đang là static-server, khởi động npm run book-input-server, đọc URL thực tế trong log (server có thể chọn cổng 3001 trở lên) và kiểm tra lại API tại đúng URL đó. Dùng cùng origin cho form và API; không mặc định localhost:3000 hay 127.0.0.1:3000 chỉ vì trang mở được. Nếu sandbox chặn mở cổng, yêu cầu quyền thực thi cần thiết.
3. Với mỗi sách, xác định slug từ tựa đề và tác giả được cung cấp, hoặc dùng slug người dùng chỉ định. Kiểm tra data/book/<slug>.json, API và các tác phẩm cùng title/title_original/tác giả, kể cả alias hoặc tên edition khác. Nếu sách đã có, chỉ tải và sửa khi yêu cầu hiện tại nói rõ là cập nhật; nếu đang nhập sách mới, báo trùng, giữ nháp và không ghi đè/đổi slug để lách.

Khi được yêu cầu chỉ cập nhật một trường của sách đã có, theo [nhánh cập nhật có phạm vi](../book-intake/references/update-existing.md): lập candidate từ baseline, xem form preview, dùng endpoint review có sẵn nếu Lưu tất cả gây chuẩn hóa ngoài phạm vi. Lưu qua form/API, không vá JSON đầu ra. Awards cho phép nhãn giải tác giả được kế thừa (Nobel) và giải đúng tác phẩm; ghi nguồn/scope, đồng bộ search_text và kiểm tra UI.

## Điền và kiểm tra

4. Dùng Chrome MCP điền các control form hiện có từ dữ liệu nháp đã kiểm tra. Có thể dùng fill_form, dán vào edition-raw-N rồi sửa parser, hoặc gọi `populateFormFromBookDetail(detail)` sẵn có trong trang (không có tham số isDraft). Hàm này thêm card trống .is-new-edition ở đầu: với sách mới, sau khi đã xác nhận không trùng, kiểm tra mọi input/textarea của card đó rỗng rồi bấm nút .remove-edition trong card; không xóa card có dữ liệu. Sau đó xem preview và so sánh đúng số edition. Không thêm control import JSON, load script contract/vocabulary hay thay hàm ứng dụng để phục vụ tự động hóa. Chrome bị khóa thì thử lại, không đóng phiên khác; có thể dùng API local với payload đã kiểm tra và báo rõ, chưa xem UI thì không nhận đã xác minh UI. Không dùng chỉnh JSON đầu ra trực tiếp làm fallback.
5. Chỉ điền dữ kiện có nguồn rõ. Chuẩn hóa 280.000đ thành 280k, 16x24 cm thành 16 x 24; không suy đoán năm xuất bản từ năm sinh/mất của tác giả hoặc năm gốc tác phẩm, giá từ con số khác/giá ưu đãi, hay tên người minh họa từ cả câu văn. Theo schema sống và defaults của form: mảng chưa biết `[]`; isbn, pub_year, print_run, page_count, copy_numbering, weight_g chưa biết `null`; text khác `""`. Bỏ key edition.title khi không override. Giữ `gellery_imgs`. Optional chưa biết không chặn lưu.
6. Có thể dán nguyên văn vào edition-raw-0; nút Điền vào form chỉ là gợi ý. Sau khi bấm, đối chiếu từng giá trị với nguồn và sửa/xóa mọi kết quả sai, đặc biệt title, authors, pub-year, cover-price, illustrators, format. Điền thủ công các trường rõ ràng mà parser bỏ sót. Giữ quy cách ấn bản trong detail, bỏ heading trang trí và không thêm dữ kiện.
7. Nếu biết series, điền tên hiển thị ở series và slug đúng ở edition-series-ids-N; giữ work_ids cũ. Tái dùng identity tác giả/alias đã có, không tạo author mới vì chú thích `(tuyển chọn)`; xem quy ước collection nếu có. Mở **Xem trước JSON**, so sánh nháp từng field, slug, số edition, ID, thứ tự, tác giả, series và URL ảnh. Form có thể title-case và sinh lại edition ID theo `<bookId>-<year>-<issuer>-<format>-<price>`; không bỏ qua chênh lệch hoặc làm mất dữ kiện để qua validator. Không tải sách cũ/import lại làm mất bản nháp đang sửa.

### Keyword cho filter

Khi book-intake điều phối, trước khi lưu agent chạy `node script/book-intake.js sources` và check. Mọi ảnh phải được xem và ghi image_reviews khớp hash; không dùng git status/rg mặc định để nói raw trống. Đây là trách nhiệm của skill và công cụ riêng; không thêm điều kiện raw/review vào API lưu. Fallback vẫn tuân thủ cùng quy trình.

Đối chiếu quy ước người dùng và edition tương tự trong data/book/*.json; `node script/book-intake.js vocab` chỉ thống kê giá trị/tần suất để tham khảo. Chọn nhãn đúng nghĩa đã chốt như Bìa Cứng Giới Hạn, Bìa cứng. Không tự chế/ghép keyword; thông tin phụ vào detail. Dữ liệu cũ có thể không nhất quán, không coi thống kê là danh sách chuẩn đóng; không dùng whitelist mới để chặn lưu hoặc chuẩn hóa hàng loạt.

## Lưu và xác minh

8. Khi đủ danh tính tựa đề, tác giả, edition và dữ liệu không còn mâu thuẫn quan trọng, bấm **Lưu tất cả**, trừ khi người dùng chỉ muốn nháp. Trong book-intake, title_original/pub_year/publisher chưa tìm được sau tra cứu giữ default và ghi rõ, không bịa. API fallback: `POST /api/books/save` với `bookDetail`, một entry `bookIndex`, authorPayload/seriesPayload liên quan đã merge work_ids; không gửi cả index cũ có thể ghi đè thay đổi mới. Cập nhật có phạm vi dùng endpoint review theo nhánh update-existing. Nếu cơ chế lưu lỗi, sửa workflow/nháp/payload rồi thực thi lại qua form/API; không vá file JSON đầu ra. Khi cả form/API chưa dùng được thì giữ nháp và báo đúng bước còn lỗi.
9. Sau khi lưu, đọc lại data/book/<slug>.json và các index liên quan; kiểm tra chỉ có những phiên bản dự định, dữ kiện đúng và git diff không có sửa đổi ngoài phạm vi. Nếu UI báo lỗi, kiểm tra file/API trước khi thử lại: một phần hoặc toàn bộ dữ liệu có thể đã được ghi. Không retry mù hoặc tải hàng loạt JSON tự động.
10. Chạy `node script/book-intake.js check --book <id> --relations` (chưa bắt buộc ảnh khi bước ảnh còn tiếp), sửa lỗi trong phạm vi sách. Nếu book-intake điều phối, tiếp tục import/crop ảnh, sort, check/UI và dọn nháp theo skill đó; không nhận bước lưu JSON là hoàn tất toàn bộ quy trình. Báo URL/tab, file đã lưu, dữ kiện thiếu và lỗi chưa xử lý; giữ server hoạt động để người dùng chỉnh tiếp.
