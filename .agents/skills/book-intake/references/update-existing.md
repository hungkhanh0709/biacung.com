# Cập nhật sách đã có

Chỉ đổi sách/trường người dùng yêu cầu, qua form/API hiện có. Không vá `data/book/*.json` hoặc `data/book.json` trực tiếp.

## Chuẩn bị trước khi lưu

1. Xác nhận bookId/tác phẩm và phạm vi. Đọc [Caption/Format](caption-format.md) hoặc [tra tên nguyên tác](book-intake-workflow.md#tra-tên-nguyên-tác) khi sửa các trường đó. Chỉ sửa awards thì giữ edition/ID/ảnh/author/series.
2. Giữ raw đang dở; tạo `data/_raw/updates/<request-id>/` cho nguồn, snapshot JSON/index, hash và kế hoạch trước/sau. Không chạy init đè lượt khác hoặc gửi cả snapshot index/author lên server.
3. Candidate sao sâu baseline, chỉ sửa trường được phép. Awards theo [quy tắc dữ liệu](book-intake-workflow.md#quy-tắc-dữ-liệu): tra `data/awards/` và nguồn chính thức, hợp nhất nhãn không trùng, ghi award_claims. Nobel của tác giả được kế thừa; giải tác phẩm không lan sang sách cùng tác giả.
   - Yêu cầu bổ sung dữ liệu/ảnh không cho phép xóa dữ liệu cũ. Giữ các phần tử đã có trong mảng, nhất là `translators`, `illustrators`, `proofreaders`; hợp nhất thông tin mới không trùng. Không dùng default rỗng cho trường đã có dữ liệu chỉ vì nguồn mới không nhắc lại.
   - Nguồn mới ghi thêm vai trò khác không tự cho phép chuyển hoặc xóa vai trò đang lưu. Ví dụ ảnh ghi Nguyễn Thạch Giang khảo đính/chú giải: bổ sung vào `detail`, vẫn giữ tên trong `translators` nếu người dùng chưa yêu cầu sửa trường đó. Ghi nhận mâu thuẫn thực tế khi có, không tự giải quyết bằng cách bỏ dữ liệu.
   - Khi bổ sung edition thiếu thông tin, chủ động đề xuất nguồn theo [tham khảo edition tương đồng](book-intake-workflow.md#tham-khảo-edition-tương-đồng); chỉ sao chép các trường được người dùng xác nhận. Ngụ ngôn La Fontaine S100 đã được chốt dùng NXB và họa sĩ của bản phổ thông; danh sách 13 dịch giả của S895 được người dùng yêu cầu đồng bộ cho cả S100 và bản phổ thông, thay nhãn chung `Nhiều Người Dịch`. ISBN, khối lượng và dải số S100 chưa có thì giữ trống, bỏ khỏi Memo checklist theo yêu cầu người dùng.
4. Chuẩn hóa edition: giữ số lượng/thứ tự/dữ kiện ngoài phạm vi; ghi nguồn và baseline chưa đối chứng. Đổi năm/format/giá thì sinh ID theo form, rà tham chiếu cũ. Chất liệu giữ trong detail; giá bìa theo [quy cách giá](book-intake-workflow.md#giá-bìa), ví dụ `3900k` → `3tr900k`, không lấy giá sale. Mâu thuẫn trang/ISBN ưu tiên nguồn đơn vị phát hành.
5. Nếu cần chuyển thumbnail ngoài về local, tải đúng URL hiện có, xem ảnh/codec và theo skill ảnh một nguồn → một asset. Không xử lý lại ảnh ngoài phạm vi.

Khi đổi ngày/năm, giữ vị trí của các edition thiếu `pub_date`; chỉ sắp các edition đã có ngày trong những vị trí đang có ngày, bằng ngày giữ thứ tự. Không fallback từ năm để đổi vị trí; bổ sung ngày cho một edition không tự đưa nó lên đầu. Edition mới đặt ở vị trí người dùng chọn trong nháp/form; không tự xáo trộn các edition cũ chưa có ngày. Không đổi dữ kiện/ID chỉ để sắp xếp. Đối chiếu preview và mảng edition đã lưu trước khi hoàn tất.

## Lưu qua ứng dụng

### Sửa Book ID theo yêu cầu

Book ID là danh tính dùng chung cho tên file, thư mục ảnh, edition ID và các liên kết. Không tạo thêm hồ sơ trùng để đổi ID. Chuẩn bị candidate, snapshot và bản đồ ID cũ → mới trong `data/_raw/updates/`; xem form preview trước khi thực hiện. Chạy `node script/book-rename.js --from <id-cu> --to <id-moi>` để xem kế hoạch, thêm `--apply` khi đã kiểm tra. Helper chỉ đổi tên file/thư mục ảnh và khóa `detail` của đúng entry index, giữ vị trí và metadata; đây là bước đổi tham chiếu vì API hiện có chỉ upsert, không đổi khóa. Nội dung JSON sách vẫn phải lưu bằng endpoint detail-review hiện có ngay sau đó, gồm ID/edition ID/URL ảnh mới và candidate đã duyệt. Cập nhật author/series qua endpoint review với work_ids đã thay đúng ID, giữ mọi liên kết khác; cập nhật checklist và rà hết tham chiếu cũ bằng `rg`. Không thêm endpoint hoặc đổi logic ứng dụng cho việc nhập dữ liệu. Giữ snapshot ở raw đến khi kiểm tra dữ liệu, quan hệ và UI hoàn tất.

Kiểm tra `GET /api/index-state` và `GET /api/books/<bookId>` cùng origin; tải form, điền trường cần đổi, xem preview so baseline. Nếu form chuẩn hóa ngoài phạm vi, dùng candidate đã kiểm tra với hai endpoint review, thay vì Lưu tất cả:

Trước khi lưu, rà riêng các giá trị/phần tử bị xóa hoặc làm rỗng so baseline. Mỗi thay đổi giảm dữ liệu phải có yêu cầu sửa/xóa tương ứng của người dùng; nếu chưa có thì giữ baseline và chỉ bổ sung. Không coi việc thêm thông tin đó vào `detail` là thay thế cho dữ liệu có cấu trúc đã lưu.

```text
POST /api/books/save/book-detail-review
{ "bookId": "...", "bookDetail": <candidate> }

POST /api/books/save/book-index-review
{ "bookIndexReview": <entry riêng của sách> }
```

- Giữ metadata/search_text cũ, bổ sung keyword mới không trùng theo cách form chuẩn hóa; đồng bộ caption/format/awards cuối. `updated_at` là ngày sửa dữ liệu cho sitemap, không dùng để sort. API tự suy `last_pub_date`/`last_pub_year` từ edition mới nhất, kể cả khi xóa/sửa ngày. Chỉ thêm `pub_date` cho edition đã đối chứng trong phạm vi; giữ edition cũ thiếu key nếu chưa tra.
- Giữ nguyên các cụm từ trong `search_text` cũ; chỉ nối keyword/cụm mới còn thiếu. Không tách toàn chuỗi rồi loại trùng từng từ, vì sẽ làm mất các cụm tìm kiếm như tựa sách/tên tác giả. Đối chiếu với baseline và kiểm tìm bằng tựa đầy đủ sau khi lưu.
- Chỉ sửa awards thì không POST author/series. Trước mỗi lần ghi, đọc lại so baseline để tránh đè thay đổi mới.
- Hai endpoint không phải transaction: lỗi thì đọc lại, xác định phần đã lưu và chỉ chạy phần còn thiếu. Sai payload/quy tắc thì sửa nháp/hướng dẫn rồi lưu lại, không vá output.

## Xác minh và kết thúc

1. Đọc lại API/workspace; field sửa khớp candidate, các field/edition/ID/hash ảnh ngoài phạm vi khớp baseline. Index chỉ đổi entry được yêu cầu. Kiểm quan hệ bằng helper và chạy sort-book. Khi baseline còn giá kiểu cũ hoặc URL ảnh ngoài ở trường không sửa, dùng `check --book <id> --relations --images --baseline data/_raw/updates/<request-id>/baseline-book.json`; ghi cùng đường dẫn ở `evidence.scope.baseline` để finish/cleanup đối chiếu. Helper chỉ chấp nhận giá cũ/URL ngoài khớp chính xác field baseline; field đã sửa vẫn phải đạt quy cách mới. Không chuyển ảnh hay đổi giá edition khác chỉ để vượt kiểm tra.
2. Reload detail/tìm kiếm trên Chrome, kiểm nhãn/link/ảnh. Với sách ngoài limit home, ghi bằng chứng trang chủ đã tải, vị trí thực và kết quả tìm kiếm đúng sách theo `verification.json` trong workflow; không coi việc nằm ngoài limit là lỗi dữ liệu. Nobel phải thấy đủ sách đã cập nhật, giải tác phẩm chỉ khớp đúng tác phẩm trong nhóm. Dùng `/detail.html` hoặc static-server nếu cần; không sửa server/năm để qua kiểm tra.
3. Nếu raw chứa nháp của sách này, chỉ merge trường được yêu cầu cùng evidence; giữ các thay đổi chưa lưu khác. Trường đó đã đổi độc lập thì đối chiếu/hợp nhất trước; không chép toàn bộ output đè nháp.
4. Báo thay đổi, nguồn và UI đã kiểm tra. Chỉ dọn `updates/<request-id>` của lượt này sau khi đạt; giữ raw lượt khác. Toàn bộ raw đã hoàn tất thì dọn nội dung, giữ thư mục/`.gitkeep`. Không tạo hồ sơ lâu dài.
