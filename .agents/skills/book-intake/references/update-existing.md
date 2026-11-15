# Cập nhật sách đã có

Chỉ đổi sách/trường người dùng yêu cầu, bằng Chrome MCP qua form `book-input` hiện có. Tuân thủ quy tắc bắt buộc trong [SKILL.md](../SKILL.md): không gọi API ghi trực tiếp; Chrome MCP treo/bị khóa/không kết nối được thì báo người dùng và giữ nháp. Không vá `data/book/*.json` hoặc `data/book.json` trực tiếp.

## Chuẩn bị trước khi lưu

1. Xác nhận bookId/tác phẩm và phạm vi. Đọc [Caption/Format](caption-format.md) hoặc [tra tên nguyên tác](book-intake-workflow.md#tra-tên-nguyên-tác) khi sửa các trường đó. Chỉ sửa awards thì giữ edition/ID/ảnh/author/series.
2. Dùng `data/_raw/` cho một tựa, tiếp tục nháp cùng lượt. Giữ `baseline-book.json` và candidate `book.json`, ghi `evidence.scope.baseline: "data/_raw/baseline-book.json"`. Không tạo thư mục phiên hay chụp lại toàn bộ kho; không gửi snapshot index/author lên server. Raw của tựa khác đang dở thì giữ nguyên.
3. Candidate sao sâu baseline, chỉ sửa trường được phép. Awards theo [quy tắc dữ liệu](book-intake-workflow.md#quy-tắc-dữ-liệu): tra `data/awards/` và nguồn chính thức, hợp nhất nhãn không trùng, ghi award_claims. Nobel của tác giả được kế thừa; giải tác phẩm không lan sang sách cùng tác giả.
   - Khi bổ sung gallery, URL ảnh ngoài đã có trong baseline được giữ theo từng URL, kể cả khi mảng được nối thêm ảnh local. Kiểm tra cuối chỉ chấp nhận URL ngoài đã tồn tại ở cùng trường của đúng edition; không yêu cầu tải lại hoặc xóa ảnh cũ để vượt kiểm tra.
   - Yêu cầu bổ sung dữ liệu/ảnh không cho phép xóa dữ liệu cũ. Giữ các phần tử đã có trong mảng, nhất là `translators`, `illustrators`, `proofreaders`; hợp nhất thông tin mới không trùng. Không dùng default rỗng cho trường đã có dữ liệu chỉ vì nguồn mới không nhắc lại.
   - Nguồn mới ghi thêm vai trò khác không tự cho phép chuyển hoặc xóa vai trò đang lưu. Ví dụ ảnh ghi Nguyễn Thạch Giang khảo đính/chú giải: bổ sung vào `detail`, vẫn giữ tên trong `translators` nếu người dùng chưa yêu cầu sửa trường đó. Ghi nhận mâu thuẫn thực tế khi có, không tự giải quyết bằng cách bỏ dữ liệu.
   - Khi bổ sung edition thiếu thông tin, chủ động đề xuất nguồn theo [tham khảo edition tương đồng](book-intake-workflow.md#tham-khảo-edition-tương-đồng); chỉ sao chép các trường được người dùng xác nhận. Ngụ ngôn La Fontaine S100 đã được chốt dùng NXB và họa sĩ của bản phổ thông; danh sách 13 dịch giả của S895 được người dùng yêu cầu đồng bộ cho cả S100 và bản phổ thông, thay nhãn chung `Nhiều Người Dịch`. ISBN, khối lượng và dải số S100 chưa có thì giữ trống, bỏ khỏi Memo checklist theo yêu cầu người dùng.
4. Giữ số lượng/dữ kiện ngoài phạm vi; thêm edition theo yêu cầu và sort theo năm/ngày. Đổi năm/format/giá thì sinh ID theo form, rà tham chiếu liên quan. Chất liệu giữ trong detail; giá theo [quy cách giá](book-intake-workflow.md#giá-bìa), không lấy giá sale. Mâu thuẫn trang/ISBN ưu tiên nguồn đơn vị phát hành.
5. Nếu cần chuyển thumbnail ngoài về local, tải đúng URL hiện có, xem ảnh/codec và theo skill ảnh một nguồn → một asset. Không xử lý lại ảnh ngoài phạm vi.

Form tự sort edition theo năm giảm dần, cùng năm theo ngày giảm dần; trong cùng năm bản có ngày đứng trước bản thiếu ngày, cùng khóa giữ thứ tự. Thiếu cả năm/ngày đứng cuối. Không đổi dữ kiện/ID để sort, không bổ sung ngày giả cho edition cũ. Đối chiếu thứ tự trong preview và output một lần.

Lựa chọn đã chốt cho Nghìn lẻ một đêm S100 năm 2023: gộp V20/S80 dù khác màu/logo bìa; 100 bộ, giá cơ bản 12tr, V20 13tr và S80 12tr. Caption giữ S100, thông tin biến thể ở detail; không hỏi/tách lại.

Khi năm/giá/format làm đổi edition ID, ghi `evidence.scope.edition_id_map` dạng `{ "id-cu": "id-moi" }`. Bước kiểm tra cuối dùng ánh xạ này để đối chiếu đúng edition trong baseline sau khi form sắp xếp lại; không lấy vị trí mảng để xác nhận các URL ảnh cũ của edition đã đổi ID.

## Lưu qua ứng dụng

### Sửa Book ID theo yêu cầu

Book ID dùng chung cho file, ảnh, edition ID và liên kết. Không tạo hồ sơ trùng để đổi ID. Chuẩn bị candidate, baseline và bản đồ ID cũ → mới ở raw; chỉ đổi khi form hỗ trợ đủ tham chiếu. Nếu chưa hỗ trợ, báo giới hạn và giữ nháp, không dùng API/script thay form. Cập nhật liên kết bằng control/nút lưu của form; rà tham chiếu cũ bằng rg. Không thêm endpoint/logic ứng dụng cho việc nhập dữ liệu.

Kiểm tra `GET /api/index-state` và `GET /api/books/<bookId>` cùng origin; tải form, điền trường cần đổi, xem preview so baseline. Nếu Lưu tất cả chuẩn hóa ngoài phạm vi, dùng các nút lưu riêng trong phần Xem trước JSON của form. Nếu vẫn không giữ được đúng phạm vi thì báo lỗi và giữ nháp; không tự gửi candidate tới API:

Trước khi lưu, rà riêng các giá trị/phần tử bị xóa hoặc làm rỗng so baseline. Mỗi thay đổi giảm dữ liệu phải có yêu cầu sửa/xóa tương ứng của người dùng; nếu chưa có thì giữ baseline và chỉ bổ sung. Không coi việc thêm thông tin đó vào `detail` là thay thế cho dữ liệu có cấu trúc đã lưu.

Dùng Chrome MCP điền form, xem preview rồi bấm **Lưu tất cả** hoặc các nút **Lưu detail.json**, **Lưu book.json**, **Lưu author.json**, **Lưu series.json** đúng phạm vi. Các request do nút lưu của ứng dụng phát sinh là một phần của form; agent không tự tạo request ghi.

- Giữ metadata/search_text cũ, bổ sung keyword mới không trùng theo cách form chuẩn hóa; đồng bộ caption/format/awards cuối. `updated_at` là ngày sửa dữ liệu cho sitemap, không dùng để sort. API tự suy `last_pub_date`/`last_pub_year` từ edition mới nhất, kể cả khi xóa/sửa ngày. Chỉ thêm `pub_date` cho edition đã đối chứng trong phạm vi; giữ edition cũ thiếu key nếu chưa tra.
- Giữ cụm từ trong search_text cũ; chỉ nối keyword/cụm còn thiếu, không loại trùng từng từ làm mất tựa/tên tác giả. Đối chiếu field với baseline; không bắt kiểm UI search khi chỉ nhập dữ liệu.
- Chỉ sửa awards thì không lưu lại author/series. Trước mỗi lần ghi, đọc lại so baseline để tránh đè thay đổi mới.
- Các nút lưu riêng có thể chỉ hoàn tất một phần: lỗi thì đọc lại, xác định phần đã lưu và chỉ thao tác lại phần còn thiếu qua form. Sai dữ liệu/quy tắc thì sửa nháp/hướng dẫn rồi điền và lưu lại bằng Chrome MCP, không vá output.
- Khi đổi năm làm đổi edition ID, kiểm lại thumbnail/gallery sau khi lưu hoàn tất. Nếu thao tác lưu form làm mất ảnh so với candidate đã duyệt, điền lại URL ảnh trên form, xem preview và bấm nút lưu rồi đọc lại đối chiếu; nếu form tiếp tục làm mất ảnh thì báo lỗi, giữ nháp, không dùng API fallback; không lấy bản đã mất ảnh làm baseline mới.

## Xác minh và kết thúc

1. Đọc lại đúng output sách và entry index; phần sửa khớp candidate, dữ liệu/ảnh ngoài phạm vi khớp baseline (trừ thứ tự sort). Form đã sort, không chạy sort-book/check riêng nếu output đúng. cleanup tự kiểm quan hệ liên quan và dùng evidence.scope.baseline để giữ giá/URL cũ không sửa; không chuẩn hóa edition khác để vượt kiểm tra.
2. Mở trực tiếp `/detail?id=<bookId>` bằng Chrome MCP, chọn edition vừa thêm/sửa, kiểm metadata/ảnh; ghi verification.json theo workflow. Không kiểm home/search hay trang tác giả/series. Khi sửa awards ở cấp sách, xác nhận nhãn trên detail đúng sách.
3. Nếu raw chứa nháp của sách này, chỉ merge trường được yêu cầu cùng evidence; giữ các thay đổi chưa lưu khác. Trường đó đã đổi độc lập thì đối chiếu/hợp nhất trước; không chép toàn bộ output đè nháp.
4. Chạy cleanup một lần (đã gồm finish), không check → finish → cleanup. Báo thay đổi, link detail, dữ kiện thiếu và trạng thái dọn; giữ thư mục raw/.gitkeep. Không tạo hồ sơ lâu dài.
