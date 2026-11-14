---
name: book-intake
description: "Nhập trọn sách từ tin phát hành/ảnh: tra nguồn, lập nháp, lưu qua form book-input bằng Chrome MCP, xử lý ảnh và kiểm tra UI. Cập nhật sách đã có khi người dùng yêu cầu; chỉ dừng ở nháp nếu được chỉ định."
---

# Nhập sách

Đọc [workflow](references/book-intake-workflow.md) trước khi làm; lệnh chạy từ repo root. Luồng mặc định: đọc raw → bổ sung dữ kiện còn thiếu → xử lý ảnh → điền form bằng Chrome MCP, preview và lưu một lần → mở đúng link detail xác nhận sách/edition → cleanup. Tự hoàn tất, không đòi người dùng điền schema hoặc duyệt từng bước.

**Bắt buộc Chrome MCP qua form `book-input`:** mọi thao tác nhập mới và cập nhật thông tin sách phải dùng Chrome MCP để điền các control hiện có, xem trước và bấm nút lưu trên `/book-input.html`. Form là nguồn quy tắc thống nhất về chuẩn hóa, ID và đồng bộ dữ liệu. Không gọi API ghi trực tiếp, kể cả `fetch`/POST trong `evaluate_script`, không dùng shell/script hoặc sửa JSON chính thức để thay bước lưu form. Có thể dùng Chrome MCP gọi hàm điền form sẵn có như `populateFormFromBookDetail`, nhưng vẫn phải xem preview và lưu bằng nút của form. Nếu Chrome MCP treo, bị khóa hoặc không kết nối được, báo ngay lỗi thực tế cho người dùng, giữ nháp và dừng nhập/lưu; không tự chuyển sang API, trình duyệt/công cụ khác hay khởi chạy MCP thay thế. CLI chỉ phục vụ chuẩn bị nháp/asset và các bước kiểm tra, sắp xếp đã có trong workflow.

- **Sách mới:** một tựa mỗi lượt, đầu vào/nháp tại `data/_raw/`. Tiếp tục nháp đang dở của cùng lượt, không nhập trùng.
- **Book ID:** dùng tên tác giả và tựa gốc đã xác minh khi tạo được slug Latin; sách có tựa gốc tiếng Anh phải dùng tựa đó, không mặc định tựa Việt. Không tự dịch ngược để tạo tên tiếng Anh. Không đổi hàng loạt ID cũ.
- **Gộp/tách edition:** nếu chỉ khác hộp/phụ kiện/giá còn ruột, bìa, chữ ký và dải số giống nhau, hỏi người dùng gộp hay tách trước khi lưu. Không hỏi lại lựa chọn đã chốt. Gộp thì giữ giá cơ bản trong `cover_price`, các tùy chọn và giá đầy đủ trong `detail`, hợp nhất ảnh không trùng.
- **Thumbnail:** chọn trong tập ảnh người dùng cung cấp, ưu tiên bìa rõ và đúng bản ở kích thước card. Không tự tìm/tải thêm ảnh web khi đã có ảnh đầu vào; ảnh không dùng được thì báo người dùng. Một ảnh thì chỉ thumbnail, gallery `[]`.
- **Sách đã có:** nhập thêm edition vào đúng tác phẩm đã có; giữ các edition và dữ kiện cũ. Sửa trường cũ theo [cập nhật có phạm vi](references/update-existing.md); không tự xóa tên người, làm rỗng mảng hoặc chuyển vai trò đã lưu.
- **Tham khảo edition tương đồng:** khi edition mới thiếu thông tin, chủ động tìm edition đã có của cùng tác phẩm, tác giả và đơn vị phát hành; đối chiếu dịch giả cùng các dấu hiệu về bản dịch/nội dung. Nếu tương đồng cao, đề xuất edition nguồn và từng trường/giá trị muốn sao chép, hỏi xác nhận trước khi áp dụng theo [quy tắc tham khảo](references/book-intake-workflow.md#tham-khảo-edition-tương-đồng). Không hỏi lại phạm vi đã được xác nhận.
- **Ngày phát hành:** chỉ có năm → `pub_year`, bỏ `pub_date`; có tháng/năm → thêm `pub_date` với ngày 01; đủ ngày/tháng/năm → giữ ngày thật. Chi tiết trong [quy ước ngày](references/book-intake-workflow.md#ngày-phát-hành).
- **Giá bìa:** dưới 1 triệu dùng `k` (`900k`); từ 1 triệu dùng `tr` và phần nghìn `k` (`3tr900k`), tròn triệu ghi `3tr`. Chi tiết trong [workflow](references/book-intake-workflow.md#giá-bìa).
- **Caption/Format:** ưu tiên keyword và Memo trong [bảng tham chiếu](references/caption-format.md), không dùng `vocab`. Format chưa xác định được thì hỏi người dùng trước khi lưu.
- **Lưu dữ liệu:** dùng [book-batch-input](../book-batch-input/SKILL.md).
- **Ảnh:** dùng [book-image-crop-safe](../book-image-crop-safe/SKILL.md) để giảm dung lượng, giữ chất lượng/toàn khung. Mỗi nguồn tối đa một asset; không clone, backup, tạo biến thể hoặc tự bổ sung ảnh “official”/gallery. Kiểm cả pixel và byte, không coi ảnh trong giới hạn pixel là đã tối ưu.

Bắt đầu bằng `node script/book-intake.js sources` và xem `git status --short`. `sources` tự tạo raw nếu chưa có; chỉ chạy `init` nếu cần tạo nháp. Raw bị gitignore: mở từng ảnh được liệt kê và ghi review trước khi tra web hoặc hỏi danh tính sách. Không lặp sources/check ở từng skill con.

Chỉ tra cứu dữ kiện còn thiếu; dừng khi có nguồn đủ rõ. Không thử nhiều keyword để kiểm chức năng search. Form tự sort edition và index khi lưu: năm giảm dần, cùng năm ngày giảm dần; trong cùng năm bản có ngày đứng trước bản thiếu ngày, cùng khóa giữ thứ tự. Không dùng `updated_at` để sort. Chỉ chạy `sort-book` nếu index thực tế chưa đúng.

Khi sửa lỗi quy trình, sửa hướng dẫn/nháp trước rồi lưu lại qua form `book-input` bằng Chrome MCP; không vá JSON đầu ra hoặc đổi logic ứng dụng. Không commit/push/deploy khi chưa được yêu cầu.

Báo ngắn gọn sách/edition đã lưu, link detail đã kiểm tra, dữ kiện thiếu và trạng thái dọn nháp. Xác minh đúng edition mới/cập nhật và ảnh trên detail là đủ; không bắt kiểm home, search, các trang tác giả/series. Chạy `cleanup` một lần sau xác minh (đã bao gồm kiểm tra cuối); `finish` chỉ dùng khi muốn kiểm mà chưa dọn.
