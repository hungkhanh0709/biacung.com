# Cập nhật sách đã có

Chỉ đổi sách/trường người dùng yêu cầu, qua form/API hiện có. Không vá `data/book/*.json` hoặc `data/book.json` trực tiếp.

## Chuẩn bị trước khi lưu

1. Xác nhận bookId/tác phẩm và phạm vi. Đọc [Caption/Format](caption-format.md) hoặc [tra tên nguyên tác](book-intake-workflow.md#tra-tên-nguyên-tác) khi sửa các trường đó. Chỉ sửa awards thì giữ edition/ID/ảnh/author/series.
2. Giữ raw đang dở; tạo `data/_raw/updates/<request-id>/` cho nguồn, snapshot JSON/index, hash và kế hoạch trước/sau. Không chạy init đè lượt khác hoặc gửi cả snapshot index/author lên server.
3. Candidate sao sâu baseline, chỉ sửa trường được phép. Awards theo [quy tắc dữ liệu](book-intake-workflow.md#quy-tắc-dữ-liệu): tra `data/awards/` và nguồn chính thức, hợp nhất nhãn không trùng, ghi award_claims. Nobel của tác giả được kế thừa; giải tác phẩm không lan sang sách cùng tác giả.
4. Chuẩn hóa edition: giữ số lượng/thứ tự/dữ kiện ngoài phạm vi; ghi nguồn và baseline chưa đối chứng. Đổi format/giá thì sinh ID theo form, rà tham chiếu cũ. Chất liệu giữ trong detail; giá bìa `1tr5` → `1500k`, không lấy giá sale. Mâu thuẫn trang/ISBN ưu tiên nguồn đơn vị phát hành.
5. Nếu cần chuyển thumbnail ngoài về local, tải đúng URL hiện có, xem ảnh/codec và theo skill ảnh một nguồn → một asset. Không xử lý lại ảnh ngoài phạm vi.

## Lưu qua ứng dụng

Kiểm tra `GET /api/index-state` và `GET /api/books/<bookId>` cùng origin; tải form, điền trường cần đổi, xem preview so baseline. Nếu form chuẩn hóa ngoài phạm vi, dùng candidate đã kiểm tra với hai endpoint review, thay vì Lưu tất cả:

```text
POST /api/books/save/book-detail-review
{ "bookId": "...", "bookDetail": <candidate> }

POST /api/books/save/book-index-review
{ "bookIndexReview": <entry riêng của sách> }
```

- Giữ metadata/search_text cũ, bổ sung keyword mới không trùng theo cách form chuẩn hóa; đồng bộ caption/format/awards cuối. updated_at dùng ngày local; last_pub_year giữ nguyên nếu không đổi năm edition.
- Chỉ sửa awards thì không POST author/series. Trước mỗi lần ghi, đọc lại so baseline để tránh đè thay đổi mới.
- Hai endpoint không phải transaction: lỗi thì đọc lại, xác định phần đã lưu và chỉ chạy phần còn thiếu. Sai payload/quy tắc thì sửa nháp/hướng dẫn rồi lưu lại, không vá output.

## Xác minh và kết thúc

1. Đọc lại API/workspace; field sửa khớp candidate, các field/edition/ID/hash ảnh ngoài phạm vi khớp baseline. Index chỉ đổi entry được yêu cầu. Kiểm quan hệ bằng helper và chạy sort-book.
2. Reload detail/tìm kiếm trên Chrome, kiểm nhãn/link/ảnh. Nobel phải thấy đủ sách đã cập nhật, giải tác phẩm chỉ khớp đúng tác phẩm trong nhóm. Dùng `/detail.html` hoặc static-server nếu cần; không sửa server/năm để qua kiểm tra.
3. Nếu raw chứa nháp của sách này, chỉ merge trường được yêu cầu cùng evidence; giữ các thay đổi chưa lưu khác. Trường đó đã đổi độc lập thì đối chiếu/hợp nhất trước; không chép toàn bộ output đè nháp.
4. Báo thay đổi, nguồn và UI đã kiểm tra. Chỉ dọn `updates/<request-id>` của lượt này sau khi đạt; giữ raw lượt khác. Toàn bộ raw đã hoàn tất thì dọn nội dung, giữ thư mục/`.gitkeep`. Không tạo hồ sơ lâu dài.
