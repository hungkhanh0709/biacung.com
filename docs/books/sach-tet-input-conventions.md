# Quy ước nhập Sách Tết Đông A

Áp dụng cho các lần nhập tiếp theo của series `sach-tet-dong-a`. Đối chiếu schema và style hiện có của dự án; các dữ kiện chưa rõ vẫn để trống. Nguồn và các xác nhận hiện tại được lưu trong [memo tổng hợp](sach-tet-dong-a-memo.md).

Chỉ sử dụng các trường JSON đã có trong schema, kể cả khi lập checklist cho từng phiên bản. Không tạo nhãn field riêng cho giấy, bìa áo, in màu, dấu hoặc phụ kiện; không đưa các mục đó thành yêu cầu bổ sung độc lập trong checklist. Thông tin quy cách có nguồn rõ được giữ trong `detail`/`format`; thiếu thông tin thì giữ mô tả hiện có, không tự tạo trường hoặc suy ra đặc tính không tồn tại.

Checklist chỉ giữ field còn chờ xác nhận. Sau khi người dùng chốt, cập nhật dữ liệu nếu cần và xóa mục tương ứng khỏi checklist; lưu lịch sử xác nhận trong memo, không để các mục đã hoàn tất làm dài danh sách.

Slug sách theo mẫu `ho-anh-thai-sach-tet-<ten-nam-am-lich>-<nam>`, ví dụ `ho-anh-thai-sach-tet-binh-ngo-2026`. Giữ đồng bộ ID sách, tên file `data/book/<bookId>.json`, thư mục ảnh, tiền tố ID phiên bản và các tham chiếu trong index, tác giả, series, sitemap.

## Caption và format

Theo xác nhận người dùng ngày 30/10/2026, cả 16 phiên bản dùng đúng các giá trị sau:

| Nhóm phiên bản | `caption` | `format` |
| --- | --- | --- |
| Bìa cứng giới hạn | `Bìa Cứng Giới Hạn` | `Bìa cứng` |
| Bìa mềm phổ thông | `Bản Phổ Thông` | `Bìa mềm` |

Đồng bộ ID phiên bản theo format và index tìm kiếm theo caption. Giữ thông tin có nguồn trong `detail`, gồm bìa áo nếu nguồn có nêu; không tự sửa hoặc xóa mô tả khi rút gọn format.

## Tác giả

Theo xác nhận người dùng ngày 29/10/2026, cả 8 tựa 2019–2026 dùng `authors = ["Hồ Anh Thái (tuyển chọn)"]`, liên kết vào tác giả `ho-anh-thai`; không gắn các tựa này vào mục `nhieu-tac-gia`. Giữ các câu mô tả có nguồn trong `detail`.

## ISBN

Theo xác nhận người dùng ngày 29/10/2026, áp dụng cho cả 16 phiên bản: giữ ISBN đã có nguồn xác nhận; chưa tìm thấy thì ghi `isbn = null`, không dùng chuỗi rỗng, không suy đoán ISBN dùng chung giữa các phiên bản. Các mục này không còn chờ xác nhận chỉ vì chưa có ISBN.

## Giá bìa

Áp dụng cho cả 16 phiên bản: `cover_price` dùng chuỗi số nghìn với hậu tố `k`, ví dụ `888.000đ` thành `"888k"`, `1.200.000đ` thành `"1200k"`. Người dùng đã xác nhận giá bản đặc biệt 2019 và bản bìa cứng 2020 lần lượt là `"1200k"` và `"888k"`. Chỉ chuẩn hóa giá bìa đã biết; giá chưa xác nhận giữ chuỗi rỗng theo mặc định, không suy đoán hoặc dùng giá ưu đãi thay giá bìa.

## Năm của sách

Theo xác nhận của người dùng ngày 29/10/2026, `pub_year` lấy năm trong tên Sách Tết. Ví dụ: Sách Tết Kỷ Hợi 2019 có `pub_year = 2019` cho hai phiên bản phổ thông và đặc biệt. Đồng bộ `last_pub_year` trong `data/book.json` và ID phiên bản theo quy tắc hiện có của form: `<bookId>-<pub_year>-<issuer>-<format>-<price>`.

## Số lượng và đánh số bản phổ thông

Theo xác nhận người dùng ngày 29/10/2026, áp dụng cho 8 bản phổ thông: nếu chưa tìm thấy thông tin thì dùng `print_run = null` và `copy_numbering = null` theo mặc định hiện tại của form, không dùng chuỗi rỗng thay `null`. Giữ số lượng, khoảng đánh số hoặc mô tả đánh số riêng khi đã có nguồn. Nếu chỉ biết mỗi cuốn có số riêng thì giữ đúng mô tả đó, không suy đoán tiền tố/khoảng số. Các mục chưa có dữ kiện đã được chấp nhận để trống, không còn chờ xác nhận. Giữ thông tin có nguồn trong `detail`.

## Số lượng và đánh số bản giới hạn 2026

Ngày 30/10/2026, người dùng xác nhận chưa rõ số lượng và khoảng đánh số. Dùng `print_run = null`, `copy_numbering = null` cho bản giới hạn 2026; giữ mô tả đánh số nhảy và mỗi bản duy nhất trong `detail`, không suy đoán dữ kiện còn thiếu hoặc tiếp tục liệt kê thành mục chờ xác nhận.

## Ảnh thumbnail và gallery trên trang detail

- Đặt asset sử dụng trên website trong `assets/img/books/<bookId>/`; JSON dùng đường dẫn bắt đầu bằng `/assets/img/books/<bookId>/`.
- Dùng tên file chữ thường, kebab-case, mô tả đơn vị/phiên bản và nội dung ảnh. Giữ đúng phần mở rộng của ảnh gốc.
- Ví dụ cho tựa 2019: `dong-a-bia-mem-cover.jpg`, `dong-a-bia-mem-cover-standing.jpg`, `dong-a-bia-mem-cover-angle.jpg`, `dong-a-bia-cung-set.jpg`.
- Chọn ảnh nhận diện rõ sách hoặc bộ ấn bản làm `thumbnail`. Đặt các góc bổ sung trong `gellery_imgs`, giữ đúng cách viết của schema và không lặp lại file thumbnail.
- Xem nội dung ảnh trước khi gán phiên bản hoặc đặt tên. Khi lấy ảnh từ thư mục tạm, sao chép sang asset chuẩn; sau khi xác minh bản sao khớp nguyên byte, đường dẫn JSON hợp lệ và ảnh đã được sử dụng, xóa bản nguồn tương ứng trong `data/series/sach-tet/` theo yêu cầu người dùng. Giữ các ảnh chưa dùng hoặc chưa xác định phiên bản. Ghi lại ánh xạ tên nguồn sang asset trong memo để đối chiếu.
- Khi người dùng yêu cầu dọn toàn bộ thư mục tạm: ảnh của tựa chưa nhập có thể chuyển nguyên byte sang thư mục asset theo tựa đã nhận diện từ bìa, ghi rõ đang chờ dữ liệu trong memo; không tự tạo JSON sách. Ảnh tổng hợp series đặt trong `/assets/img/series/`. Ảnh chất lượng kém bị loại phải có lý do ghi trong biên bản dọn dẹp.

## Nội dung `detail`

- Giữ thông tin có nguồn trong mô tả, kể cả số trang và khổ sách, khi người dùng yêu cầu để trống các trường có cấu trúc như `page_count` hoặc `size_cm`. Không tự xóa dữ kiện trong `detail` chỉ để khớp với trường rỗng; chỉ áp dụng thông tin cho đúng phiên bản có nguồn xác nhận.
- Mỗi ý một dòng, bắt đầu bằng `- `; dùng dấu xuống dòng thật khi nhập form (được lưu thành `\n` trong chuỗi JSON).
- Giữ phần mô tả hợp tuyển và vai trò tuyển chọn nếu nguồn cung cấp; tách riêng các ý về bìa, giấy, số lượng, đánh số, dấu và phụ kiện.
- Bỏ emoji, tiêu đề quảng bá và lời kêu gọi theo dõi. Chỉ dùng dữ kiện có trong nguồn hoặc đã được người dùng xác nhận.
- Kích thước phụ kiện phải ghi rõ tên phụ kiện trong `detail`; không đưa vào `size_cm` của sách.

Ví dụ:

```text
- Bìa cứng, in trên giấy Tant White 120 gsm.
- Giới hạn 100 bản, đánh số từ ĐA - 001 đến ĐA - 100.
- Đóng dấu đỏ của Đông A.
- Kèm hộp sơn mài truyền thống.
- Kèm 1 tranh sơn mài xuân Kỷ Hợi khổ 17,5 x 24,5 cm.
- Kèm 1 bookmark sơn mài.
```

Tham chiếu style: `data/book/thach-lam-gio-dau-mua.json` cho `detail` dạng danh sách; `data/book/edmondo-de-amicis-cuore.json` cho asset local theo sách và tên file mô tả phiên bản/góc chụp. Không sao chép thông số riêng của các tựa mẫu.
