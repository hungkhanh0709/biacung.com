# Nhập sách cho biacung.com

Khi được yêu cầu nhập trọn sách mới từ tin phát hành/nội dung tự nhiên và ảnh,
đọc `.agents/skills/book-intake/SKILL.md` và dùng workflow trong
`.agents/skills/book-intake/references/book-intake-workflow.md`. Skill này điều phối `book-batch-input`
và `book-image-crop-safe`; không dừng sau khi chỉ tạo JSON.

Chỉ dùng `book-batch-input` cho yêu cầu riêng về form/lưu dữ liệu đã chuẩn bị;
chỉ dùng `book-image-crop-safe` cho yêu cầu riêng về ảnh. Tôn trọng yêu cầu
chỉ lập nháp hoặc chỉ làm một bước của người dùng.

Thư mục đầu vào/nháp cố định là `data/_raw/`, một tựa sách mỗi lượt. Người dùng
có thể đặt ảnh trực tiếp vào đây trước khi chạy; không yêu cầu thư mục con hay
tên phiên. Sau hoàn tất dọn nội dung, giữ thư mục cho lượt tiếp theo.
`data/_raw/` bị gitignore: bắt đầu bằng `node script/book-intake.js sources`,
mở từng ảnh được liệt kê rồi ghi evidence.image_reviews trước khi lưu.
Không kết luận không có ảnh từ git status hay `rg --files` mặc định;
nếu cần, dùng `rg --files --hidden --no-ignore data/_raw`.
Tra `title_original` theo mục “Tra tên nguyên tác” trong workflow: ưu tiên
trang bản quyền, nguồn tác giả/NXB và thư viện; Goodreads chỉ là nguồn bổ sung,
không bắt buộc truy cập, gặp chặn thì chuyển nguồn. Đối chiếu đúng tác phẩm/tác giả
và tên ở ngôn ngữ gốc, không lấy tựa bản dịch hoặc năm nguyên tác làm dữ liệu edition Việt.
Không đưa nguồn thô/preview vào git,
mỗi ảnh nguồn tạo một file website; giữ bố cục, chỉ resize khi cần, không tự
clone/crop thành nhiều ảnh hoặc tạo backup. Schema chuẩn nằm ở
`data/template/book-detail.json`; nguồn chuẩn tập trung cho keyword Caption/Format
là `.agents/skills/book-intake/references/caption-format.md`. Đọc file này khi nhập/cập nhật các trường đó;
ưu tiên keyword và Memo trong bảng, Format chưa rõ thì hỏi người dùng trước khi lưu.

Workflow/skill xử lý dữ liệu nháp và kiểm tra riêng. Không thêm whitelist,
chuẩn hóa mới hoặc ràng buộc của skill vào form/API nhập liệu đang có.
Cải tiến skill không mặc nhiên cho phép đổi logic ứng dụng.
Không dùng `vocab` để chọn hoặc kiểm tra keyword; tham khảo trực tiếp bảng Caption/Format.

Khi sửa lỗi nhập liệu: cập nhật workflow/skill trước, áp dụng lại qua cơ chế lưu
hiện có rồi xác minh. Không vá thủ công JSON đầu ra để che lỗi quy trình.
Nobel có thể là nhãn kế thừa từ tác giả; giải riêng tác phẩm chỉ gắn đúng sách.
