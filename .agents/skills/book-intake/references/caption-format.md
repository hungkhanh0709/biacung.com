# Caption và Format

## Cách áp dụng

- Ưu tiên keyword trong bảng, giữ đúng cách viết và áp dụng Memo theo dữ kiện đã xác minh.
- Đơn vị phát hành trong Memo là gợi ý, không đủ để tự gán mã Caption.
- Format chưa xác định được hoặc không có nhãn phù hợp thì hỏi người dùng, giữ nháp trước khi lưu.
- Quy cách phụ vào `detail`; keyword mới do người dùng chốt thì bổ sung tại đây.
- Không dùng `vocab` hoặc tần suất trong dữ liệu cũ để chọn keyword.

`Editions` đếm số phiên bản trong các file `data/book/*.json` có giá trị trường tương ứng khớp toàn bộ nhãn, không phân biệt hoa/thường và bỏ khoảng trắng ở hai đầu. Số liệu là ảnh chụp dữ liệu hiện tại, không tự cập nhật hay quyết định tính hợp lệ của keyword. Các nhãn ghi “Có trong dữ liệu” cần được đối chiếu trước khi dùng cho sách mới. Tổng cộng 521 phiên bản; 259 Caption trống, không có Format trống.

## Caption

| Caption | Editions | Memo |
| --- | ---: | --- |
| Bản Chữ A | 33 | Độc bản ký hiệu A của Đông A; không gán thành S100 chỉ vì hộp có logo S100. |
| Bản Chữ Ô | 1 | Độc bản ký hiệu Ô của Đông A; phân biệt với Bản Chữ A, không gán thành S100 chỉ vì hộp có logo S100. |
| Bản Tri Ân | 1 | Số đỏ Đông A tặng bạn đọc đổi S100 Thiên hoàng Minh Trị; phân biệt với S100 giấy dó. |
| S100 | 37 | Thường dùng cho Đông A |
| S200 | 0 | Thường dùng cho Đông A |
| S365 | 9 | Thường dùng cho Đông A |
| S500 | 29 | Thường dùng cho Đông A |
| S895 | 3 | Thường dùng cho Đông A |
| S896 | 1 | Bỉ vỏ Đông A: tổng 896 bản, gồm 6 bản tặng và 890 bản NH 001–NH 890 phát hành tới bạn đọc. |
| S1200 | 5 | Thường dùng cho Đông A |
| S111 | 2 | Có trong dữ liệu. |
| S300 | 1 | Có trong dữ liệu. |
| S555 | 1 | Có trong dữ liệu. |
| S1000 | 1 | Có trong dữ liệu. |
| N333 | 1 | Thường dùng cho Nhã Nam |
| H100 | 0 | Thường dùng cho Đông Tây |
| H200 | 0 | Thường dùng cho Đông Tây |
| H365 | 7 | Thường dùng cho Đông Tây |
| H666 | 4 | Thường dùng cho Đông Tây |
| H999 | 1 | Thường dùng cho Đông Tây |
| Ấn Bản Kỷ Niệm 10 Năm Xuất Bản Lần Đầu | 1 | Có trong dữ liệu. |
| Ấn Bản Giới Hạn | 110 | Loại phiên bản hợp lệ khi nguồn hoặc người dùng xác nhận là bản giới hạn. Không bắt buộc có mã S hoặc biết số lượng in; `print_run` chưa rõ thì giữ `null`, không suy số lượng từ Caption. |
| Bìa Vẽ Tay Bởi Châu Châu Book | 14 | Chỉ dùng cho Chauchaubook |

## Format

| Format | Editions |
| --- | ---: |
| Bìa cứng | 166 |
| Bìa mềm | 151 |
| Bìa vải | 22 |
| Bìa buckram | 20 |
| Bìa cứng áo ôm | 30 |
| Boxset | 2 |
| Boxset, bìa cứng | 8 |
| Boxset, bìa mềm | 2 |
| Bìa da thật | 62 |
| Bìa mềm áo ôm | 3 |
| Bìa da nhân tạo | 41 |
| Chauchaubook | 14 |

