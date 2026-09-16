---
name: book-image-crop-safe
description: Clone ảnh gốc với prefix bookId, crop có chủ đích và tối ưu nhẹ dung lượng cho toàn bộ thumbnail và gellery_imgs đang được website dùng trong một lượt. Dùng khi cần chuẩn hóa ảnh cho từng bookId trong biacung.com mà vẫn giữ bản gốc ngay cạnh ảnh hiện tại.
---

# Book Image Crop Safe

Xử lý đúng một `bookId` mỗi lần. Việc người dùng gọi skill với `bookId` là yêu cầu hoàn tất toàn bộ quy trình: clone ảnh gốc rồi crop tất cả ảnh mục tiêu trong cùng lượt. Không chờ người dùng confirm từng file hoặc từng framing.

## Phạm vi

- JSON: `data/book/<bookId>.json`.
- Ảnh mục tiêu: `thumbnail` và `gellery_imgs` của edition được chọn.
- Giữ nguyên cách viết `gellery_imgs` của schema.
- Không sửa metadata, thứ tự gallery hoặc URL nếu basename ảnh đang dùng không đổi.
- Nếu có nhiều edition mà chưa xác định được edition mục tiêu, dừng và hỏi lại.

## Quy trình

### 1. Kiểm tra đầu vào

1. Xác nhận `bookId` chỉ gồm chữ thường, chữ số và dấu gạch ngang.
2. Đọc toàn bộ JSON, kiểm tra trường `id` khớp và thu thập danh sách duy nhất theo thứ tự `thumbnail` rồi `gellery_imgs`.
3. Xác nhận mọi ảnh tồn tại trong `assets/img/books/<bookId>/` và không phải URL remote.
4. Xem trực tiếp tất cả ảnh; ghi nhận kích thước pixel, orientation/EXIF, codec và bố cục cần giữ.

### 2. Clone ảnh gốc

Với mỗi file đang được JSON tham chiếu, tạo một bản sao byte-for-byte ngay trong cùng thư mục với tên:

`<bookId>_<basename-hiện-tại>`

Ví dụ:

`chauchaubook-back-cover.jpg` → `j-d-salinger-the-catcher-in-the-rye_chauchaubook-back-cover.jpg`

Các quy tắc:

- Bản có prefix `bookId` là bản gốc để người dùng tự backup; không crop và không đưa vào JSON.
- File basename cũ, chẳng hạn `chauchaubook-back-cover.jpg`, tiếp tục là asset website và sẽ được crop.
- Không ghi đè nếu file clone đích đã tồn tại; xem đó là backup đã được tạo ở lần chạy trước và dùng chính file clone làm nguồn khi cần crop lại.
- Không xóa file clone tự động.

### 3. Crop toàn bộ ảnh mục tiêu

- Mặc định cho ảnh dọc ở `detail-focus-cover`: tỷ lệ `3:4`.
- Với nguồn hiển thị đủ lớn, ưu tiên `1680 × 2240`.
- Không upscale. Với ảnh nhỏ hơn, dùng crop `3:4` lớn nhất phù hợp.
- Nếu ảnh đã là `3:4`, không crop chỉ để thay đổi kích thước.
- Không ép ảnh ngang hoặc bố cục sẽ mất chủ thể về `3:4`; đề xuất ngoại lệ riêng.
- Xử lý orientation khi tạo bản crop, nhưng file clone có prefix phải giữ nguyên dữ liệu gốc.
- Chọn focal point và vùng crop riêng cho từng ảnh; không mặc định crop giữa hàng loạt.

#### Chọn vùng crop theo nội dung

Việc đạt đúng tỷ lệ chưa đủ. Trước khi crop từng ảnh, phải xem ảnh gốc và xác định phần nào là chủ thể, phần nào là nền có thể bỏ:

1. Ưu tiên giữ trọn hình dáng cuốn sách và các cạnh quan trọng đang xuất hiện trong khung hình: bìa, gáy, fore-edge, đầu/đuôi sách, bookmark hoặc phụ kiện gắn với sách.
2. Không cắt mất hoặc đặt sát mép các nội dung nhận diện quan trọng như tên sách, tên tác giả, logo, minh họa chính, khuôn mặt/nhân vật, hoa văn đặc trưng và chữ trên bìa hay gáy.
3. Dịch khung crop về phía chủ thể để loại trước các vùng thừa như nền trống, mép bàn, vải, bóng tối, chai/lọ trang trí hoặc khoảng không không phục vụ việc giới thiệu sách.
4. Khi không thể giữ mọi thứ, ưu tiên nội dung của cuốn sách hơn đạo cụ và nền. Không hy sinh chi tiết bìa quan trọng chỉ để khung crop cân giữa về hình học.
5. Tạo và xem trực tiếp phương án crop. Nếu đường biên sách hoặc nội dung quan trọng bị cụt, quá sát mép hay mất cân đối, điều chỉnh offset và xem lại trước khi thay file website.

Vùng crop tốt là vùng đạt tỷ lệ chung, loại được phần thừa nhiều nhất nhưng vẫn giữ chủ thể tự nhiên và đủ khoảng thở. Crop giữa chỉ được dùng khi nó thực sự là framing tốt nhất cho ảnh đó.

Thực hiện lần lượt cho mọi ảnh mục tiêu, không dừng sau từng file:

1. Dùng bản clone `<bookId>_<basename>` làm nguồn để bản crop luôn xuất phát từ ảnh gốc.
2. Chọn focal point và offset riêng theo các tiêu chí nội dung ở trên, tạo kết quả crop vào file tạm và xem trực tiếp.
3. Nếu kết quả đúng orientation, kích thước, còn khoảng thở hợp lý và không mất chi tiết quan trọng, chuyển sang bước tối ưu dung lượng.
4. Nếu một ảnh thật sự không thể crop về tỷ lệ chung mà không phá bố cục, giữ nguyên riêng ảnh đó, tiếp tục các ảnh còn lại và báo rõ ngoại lệ ở cuối; không hỏi confirm cho các ảnh bình thường.
5. Giữ nguyên URL trong JSON. Chỉ cập nhật JSON nếu người dùng yêu cầu đổi basename.
6. Sau khi xử lý và tối ưu hết, xem lại toàn bộ ảnh và kiểm tra trang `detail-focus-cover` nếu có thể.

### 4. Tối ưu nhẹ cho web

Chỉ tối ưu file website sau khi framing đã được duyệt. Bản clone có prefix luôn giữ nguyên byte gốc.

- Không upscale. Nếu ảnh crop lớn hơn `1680 × 2240`, mặc định giảm về tối đa `1680 × 2240`; giữ đúng tỷ lệ và không phóng ảnh nhỏ lên.
- Ảnh đã đúng `3:4` không cần crop, nhưng có thể downscale nhẹ nếu lớn hơn kích thước ưu tiên cho web.
- Giữ nguyên codec và phần mở rộng khi có thể để URL không đổi. Với JPEG, bắt đầu ở quality khoảng `85` và chỉ điều chỉnh trong khoảng `82–88` theo độ phức tạp của ảnh. Với định dạng lossless, dùng tối ưu lossless; không tự đổi định dạng.
- Không chạy nén nối tiếp trên file đã crop/nén. Mỗi lần tạo kết quả phải xuất phát từ bản clone nguyên gốc để tránh suy hao tích lũy.
- So sánh dung lượng trước/sau. Mục tiêu là giảm vừa phải và thực chất; không giảm quality thêm nếu tiết kiệm không đáng kể.
- Xem ảnh tối ưu ở kích thước đầy đủ và kích thước hiển thị dự kiến. Không chấp nhận chữ bị nhòe, chi tiết nét vẽ/bề mặt bìa bị bệt, banding, ringing, block JPEG hoặc màu lệch thấy rõ.
- Chỉ thay file basename cũ sau khi cả framing lẫn chất lượng nén đều đạt. Nếu tối ưu làm chất lượng giảm rõ rệt hoặc file không nhẹ hơn, giữ bản crop chất lượng cao hơn và báo lại.

## Hoàn tất

Xác nhận:

- Mỗi ảnh mục tiêu có đúng một bản clone `<bookId>_<basename>` chưa bị crop.
- Các file basename cũ là ảnh crop có framing đã được duyệt và đã tối ưu nhẹ nếu phù hợp.
- JSON parse thành công và mọi URL vẫn tồn tại.
- Không có file ngoài book hiện tại bị thay đổi.

Báo cáo ngắn gọn các file clone, vùng crop thực tế của từng ảnh, kích thước và dung lượng trước/sau, thiết lập tối ưu chính, file đã thay và kết quả kiểm tra. Nêu rõ mọi ảnh giữ nguyên hoặc ngoại lệ. Không tự chuyển sang `bookId` tiếp theo.
