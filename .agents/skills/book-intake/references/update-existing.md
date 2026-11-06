# Cập nhật sách đã có qua workflow

Dùng khi người dùng cho phép cập nhật các sách xác định hoặc một trường xác định, ví dụ bổ sung giải cho các tác phẩm Han Kang. Đây là nhánh của book-intake, không phải một lượt nhập sách mới. Không chỉnh file data/book/*.json hay data/book.json trực tiếp.

## Chuẩn bị trước khi lưu

1. Đọc các bookId từ data/author.json hoặc yêu cầu; xác nhận đúng identity/tác phẩm. Ghi rõ trường được phép đổi. Cập nhật awards không kéo theo tra lại edition, sinh ID, sửa tên, xử lý ảnh hay đổi author/series.
2. Giữ raw đang có. Tạo thư mục công việc riêng `data/_raw/updates/<request-id>/` chứa nguồn và kế hoạch cho từng sách; không chạy init để ghi đè một lượt đang dở. Lưu snapshot JSON/index và hash trước sửa, giá trị mong đợi cùng claim/nguồn/phạm vi giải. Không gửi cả index/author snapshot cũ lên server.
3. Với Nobel, đối chiếu author trong data/awards/nobel_literature.json và nguồn chính thức; bổ sung Nobel Văn Chương cho các sách được yêu cầu của đúng tác giả. Với giải tác phẩm, chỉ bổ sung cho đúng tác phẩm được xác minh. Ví dụ The Vegetarian có International Booker Prize 2016, bản dịch tiếng Anh Deborah Smith; nhãn này không áp dụng cho Human Acts hoặc We Do Not Part chỉ vì cùng tác giả. Không coi bản Việt là bản dịch đã thắng giải.
4. Candidate là bản sao sâu của book hiện tại, chỉ thay awards bằng hợp nhất nhãn cũ và nhãn được xác minh (không trùng). Ghi evidence.award_claims: label, year, scope, recipient, source_url, locator và ghi chú bản dịch nếu có. Không tạo whitelist mới hoặc sửa form/API.

## Thực thi bằng công cụ ứng dụng hiện có

5. Kiểm tra GET /api/index-state và GET /api/books/<bookId> cùng origin của book-input-server. Tải sách trong form hiện có, điền awards rồi render preview để đối chiếu. So sánh preview với snapshot, đặc biệt số edition, ID và detail. Nếu form chuẩn hóa ngoài phạm vi (chẳng hạn trim dòng đầu detail), không bấm Lưu tất cả để rồi vá output.
6. Với cập nhật awards có phạm vi, dùng hai endpoint review sẵn có. Payload detail lấy từ candidate đã đối chiếu với baseline, không lấy toàn bộ preview đã bị chuẩn hóa ngoài phạm vi:

```text
POST /api/books/save/book-detail-review
{ "bookId": "...", "bookDetail": <candidate chỉ thay awards> }

POST /api/books/save/book-index-review
{ "bookIndexReview": <một entry của chính sách đó> }
```

Index entry giữ metadata và search_text cũ, thêm các nhãn award đã chuẩn hóa chữ thường/không dấu theo cách form hiện có làm nếu chưa có. Không xóa từ khóa khác. updated_at lấy ngày local của lượt cập nhật; last_pub_year không đổi khi không sửa edition. Không POST author/series trong một lượt chỉ sửa awards. Thực hiện từng sách; trước khi ghi phải đọc lại và so baseline để không ghi đè thay đổi mới.
7. Hai endpoint không phải một transaction. Nếu một endpoint lỗi, đọc lại book/index, xác định phần đã lưu rồi chạy lại phần còn thiếu từ cùng candidate; không append keyword/award trùng. Nếu sai quy tắc hoặc payload, sửa workflow/nháp rồi thực thi lại qua API. Không dùng shell/apply_patch để sửa JSON đầu ra.

## Xác minh và kết thúc

8. Đọc lại qua API và từ workspace. Xác nhận awards đúng theo kế hoạch; mọi trường khác trong book bằng baseline, đúng số edition/ID và mọi hash ảnh không đổi. Index chỉ thay entry được yêu cầu, có đủ keyword và ngày cập nhật. Kiểm tra book–author–series bằng helper; chạy sort-book khi quy trình hoàn tất. Không đẩy sách năm cũ lên home bằng cách sửa năm.
9. Reload detail của từng sách, thấy đúng nhãn/link tìm kiếm; tìm Nobel phải thấy đủ các sách được cập nhật, tìm International Booker chỉ thấy đúng tác phẩm trong nhóm kiểm tra. Dùng /detail.html hoặc static-server nếu input-server cũ không phục vụ /detail. Không sửa server để phục vụ skill.
10. Nếu data/_raw/book.json thuộc chính sách vừa cập nhật, kiểm tra riêng awards của nháp còn bằng baseline hoặc candidate rồi merge đúng trường awards cùng evidence/ghi chú. Không yêu cầu mọi field khác trong nháp phải bằng output: nháp có thể chứa nội dung mới chưa lưu, ví dụ detail bổ sung quy cách. Ghi nhận các path khác biệt đó và giữ nguyên chúng; không sao chép toàn bộ output đè nháp, cũng không tự lưu nội dung nháp ngoài phạm vi vào output. Nếu awards của nháp cũng đã được thay độc lập thì đối chiếu/hợp nhất nguồn trước khi tiếp tục. Không dọn raw của lượt khác đang dở.
11. Báo ngắn gọn các thay đổi, nguồn và URL/UI đã kiểm tra; không tạo hồ sơ lâu dài ngoài dữ liệu và ảnh website. Sau khi mọi sách đạt, dọn thư mục updates/<request-id> do lượt này tạo ra. Giữ nguyên raw của lượt khác đang dở; nếu toàn bộ raw thuộc lượt đã hoàn tất thì dọn nội dung, giữ thư mục/.gitkeep cho lượt tiếp theo.
