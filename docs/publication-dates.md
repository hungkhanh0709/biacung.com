# Ngày phát hành và chuyển đổi từng tựa

## Quy ước

- Edition mới lưu `pub_date: "YYYY-MM-DD"` hoặc `null` nếu chưa rõ. Thiếu key là dữ liệu cũ chưa chuyển đổi. `pub_year` tiếp tục là số năm hoặc `null` để tương thích.
- Biết ngày: giữ đúng ngày. Biết tháng/năm: bổ sung ngày 01. Chỉ biết năm: bổ sung 01/01. Ngày 01 chỉ gợi ý cần kiểm tra, không chứng minh thiếu dữ kiện; evidence ghi độ chính xác gốc và phần được bổ sung.
- Không suy ngày từ ngày bài đăng, mở đặt trước, năm nguyên tác hoặc quý. Chỉ có quý thì tra thêm hoặc giữ ngày chưa rõ và năm đã xác nhận.
- Sắp xếp theo các vị trí đã có ngày: edition thiếu `pub_date` (bỏ key, null hoặc ngày lỗi) giữ nguyên chỉ số trong mảng; chỉ các edition có ngày được sắp giảm dần rồi điền lại vào những vị trí vốn có ngày. Một edition vừa được bổ sung ngày không tự vượt qua edition thiếu ngày. Cùng ngày giữ thứ tự. Khi tất cả có ngày, đây là sort ngày giảm dần toàn bộ. Quy tắc tương tự áp dụng cho `last_pub_date` trong index. Không dùng năm hoặc `updated_at` làm fallback sắp xếp.
- Metadata index tính độc lập với vị trí hiển thị, không lấy `editions[0]` làm edition mới nhất. Index giữ `last_pub_year` là năm, thêm `last_pub_date` khi edition mới nhất có ngày đã lưu. Nếu có edition chỉ biết năm mới hơn ngày được ghi của edition khác, metadata vẫn phản ánh năm mới hơn và không lấy ngày của edition cũ hơn; vị trí các edition không đổi vì điều này. Xóa ngày/năm cuối cùng phải xóa cả giá trị dẫn xuất đã cũ.
- `updated_at` tiếp tục ghi ngày sửa dữ liệu cho sitemap (`lastmod`); không dùng sắp xếp phát hành. Không dùng ngày phát hành thay cho ngày sửa nội dung.
- Chỉ bổ sung ngày/tháng trong cùng năm không đổi edition ID hay URL đang được tham chiếu.
- Ví dụ `[cũ A, 18/07, cũ B, 26/07]` → `[cũ A, 26/07, cũ B, 18/07]`; A/B giữ nguyên chỉ số. Nếu chỉ một entry có ngày, cả danh sách giữ nguyên thứ tự. Không dùng comparator trả 0 cho ngày thiếu để sort toàn bộ vì so sánh đó không bảo đảm thứ tự nhất quán.

## Các bước triển khai

1. Cập nhật workflow/skill và schema mẫu, thống nhất hợp đồng dữ liệu và fallback.
2. Dùng chung module ngày cho Node và trình duyệt: kiểm ngày thực, chuẩn hóa ngày thiếu, so sánh ổn định và suy index.
3. Refactor form/parser, preview, các endpoint lưu detail/index và script sort. API suy index từ detail trên đĩa, không tin ngày dẫn xuất do client gửi; lưu detail cũng đồng bộ entry index hiện có.
4. Refactor home/search/detail/series/Chauchaubook: sort trước khi giới hạn/chọn edition, meta trong danh sách chỉ hiển thị năm; chỉ dòng Phát hành trong phần mô tả chi tiết hiển thị đầy đủ ngày/tháng/năm; structured data vẫn ưu tiên ngày ISO.
5. Kiểm thử dữ liệu trộn mới/cũ, ngày lỗi/năm nhuận, nhiều edition, cập nhật/xóa ngày, các endpoint và UI. Kiểm release/audit; không thay dữ liệu thật để chạy thử.

## Vận hành sau refactor

- Không chạy migration/backfill trên `data/book/*.json`. Code mới đọc được toàn bộ dữ liệu cũ ngay.
- `npm run sort-book` chỉ tính lại metadata và thứ tự **index**, không sửa detail hay tự tạo `pub_date` cho edition cũ. Không cần chạy lệnh này trên dữ liệu thật chỉ để triển khai code; UI sort index khi đọc.
- Khi có nguồn chính xác của một tựa: giữ baseline, cập nhật `pub_date` đúng edition qua form/API, rà preview/ID/ảnh, đọc lại index rồi kiểm UI theo workflow cập nhật có phạm vi.
- Đánh giá độ phủ bằng việc thiếu key `pub_date` trên từng edition; `pub_date:null` nghĩa là đã theo schema mới nhưng chưa tìm thấy ngày. Một tựa có thể chứa cả edition mới và cũ.
- Kiểm chứng hồi quy: `npm test`, `npm run audit:release`. API integration chạy trong thư mục tạm với dữ liệu giả lập, không ghi vào kho sách thật.

## Kết quả triển khai ngày 08/11/2026

- Hoàn tất các bước 1–5. `npm test`: 19 bài kiểm thử đạt; bao gồm HTTP API trong workspace tạm và giữ nguyên sách/index không liên quan.
- Test UI chạy script detail thực, xác nhận nhãn `Phát hành:` cho ngày, năm và Chauchaubook; parser nhận nhãn rút gọn và giữ tương thích nhãn nguồn cũ.
- Chrome: kiểm form/preview/lưu thật trên dữ liệu giả, ngày lỗi, tháng/năm được bổ sung, giữ ID và key ngày còn thiếu; kiểm home, search, detail, series, Chauchaubook, chuyển edition và structured data.
- Rà toàn bộ 301 tựa / 387 edition cũ: module mới không tự bổ sung ngày và năm dẫn xuất khớp index hiện có. Không thay `data/book/*.json`, `data/book.json`, author hoặc series thật.
- `npm run release:check` đạt sau khi tái sinh sitemap vốn đang cũ. Còn cảnh báo dữ liệu đã có: một edition của `robert-louis-stevenson-treasure-island` thiếu publisher; không tự đoán NXB trong lượt refactor.
- Không commit hoặc deploy trong lượt này. Những tựa cũ sẽ được cập nhật ngày theo nguồn, từng tựa qua form/API.

## Điều chỉnh bảo toàn vị trí khi chưa đủ ngày

- Áp dụng cùng quy tắc ở form/preview, API, sort-book và mọi UI. Metadata ngày/năm vẫn cập nhật khi vị trí hiển thị được giữ.
- `sort-book --order-from <snapshot-index.json>` chỉ khôi phục thứ tự theo snapshot có cùng tập detail; giữ nguyên metadata hiện tại. Không dùng snapshot để ghi đè nội dung entry.
- Khôi phục vị trí Bố Già và các edition theo commit trước refactor `298ee73`, giữ ngày 18/07/2026 và khổ 18.5 x 26.5 đã xác nhận.

- Đã khôi phục đủ thứ tự 301 entry theo snapshot trước refactor, Bố Già ở vị trí 20; edition trắng/đen ở vị trí 2. Giữ toàn bộ metadata hiện tại, 300 detail sách khác và quan hệ không đổi. Chạy lại sort-book giữ nguyên từng byte của index.
- Kiểm Chrome: form/preview giữ thứ tự, home khớp 12 entry đầu, tìm kiếm chọn edition đầu ban đầu; trang detail giữ đủ 9 edition và ngày ở đúng edition thứ 2. Bộ 19 test và release audit đạt. Server API mới để kiểm tra: cổng 3002; các tiến trình Node đã chạy trước chỉnh sửa cần được khởi động lại để nạp thuật toán mới.
