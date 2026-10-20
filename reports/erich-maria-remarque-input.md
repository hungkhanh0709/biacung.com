# Nhập sách Erich Maria Remarque

Ngày đối chiếu: 20/10/2026. Nhập và lưu riêng từng tựa qua `book-input.html`, kiểm tra bản xem trước và đọc lại file sau khi lưu.

Nguồn danh sách: [Đông A — Erich Maria Remarque](https://sachdonga.vn/collections/tac-gia-erich-maria-remarque).

## Kết quả

Đủ 10 tác phẩm trong mục tác giả: 9 tác phẩm mới, mỗi tác phẩm một edition Đông A; giữ nguyên Phía Tây Không Có Gì Lạ đã có sẵn.

| Tựa | File dữ liệu | Năm edition | Dịch giả | Trang | Giá bìa | Nguồn Đông A |
| --- | --- | ---: | --- | ---: | --- | --- |
| Phía Tây Không Có Gì Lạ | [JSON](../data/book/erich-maria-remarque-im-westen-nichts-neues.json) | 2025 (có sẵn) | Vũ Hương Giang | 272 | 100k | [Sản phẩm](https://sachdonga.vn/products/phia-tay-khong-co-gi-la-1) |
| Đường Về | [JSON](../data/book/erich-maria-remarque-der-weg-zuruck.json) | 2017 | Vũ Hương Giang | 328 | 70k | [Sản phẩm](https://sachdonga.vn/products/duong-ve) |
| Ba Người Bạn | [JSON](../data/book/erich-maria-remarque-drei-kameraden.json) | 2025 | Vũ Hương Giang | 532 | 150k | [Sản phẩm](https://sachdonga.vn/products/ba-nguoi-ban) |
| Bản Du Ca Cuối Cùng | [JSON](../data/book/erich-maria-remarque-liebe-deinen-nachsten.json) | 2025 | Vũ Kim Thư | 340 | 110k | [Sản phẩm](https://sachdonga.vn/products/ban-du-ca-cuoi-cung) |
| Khải Hoàn Môn | [JSON](../data/book/erich-maria-remarque-arc-de-triomphe.json) | 2017 | Cao Xuân Hạo | 632 | 120k | [Sản phẩm](https://sachdonga.vn/products/khai-hoan-mon-1) |
| Lửa Thương Yêu, Lửa Ngục Tù | [JSON](../data/book/erich-maria-remarque-der-funke-leben.json) | 2017 | Vũ Kim Thư | 448 | 90k | [Sản phẩm](https://sachdonga.vn/products/lua-yeu-thuong-lua-nguc-tu) |
| Thời Gian Để Sống Và Thời Gian Để Chết | [JSON](../data/book/erich-maria-remarque-zeit-zu-leben-und-zeit-zu-sterben.json) | 2017 | Lê Phát | 488 | 100k | [Sản phẩm](https://sachdonga.vn/products/thoi-gian-de-song-va-thoi-gian-de-chet) |
| Bia Mộ Đen | [JSON](../data/book/erich-maria-remarque-der-schwarze-obelisk.json) | 2017 | Vũ Kim Thư | 376 | 75k | [Sản phẩm](https://sachdonga.vn/products/bia-mo-den) |
| Đêm Lisbon | [JSON](../data/book/erich-maria-remarque-die-nacht-von-lissabon.json) | 2017 | Lê Khánh | 328 | 70k | [Sản phẩm](https://sachdonga.vn/products/dem-lisbon) |
| Bóng Tối Thiên Đường | [JSON](../data/book/erich-maria-remarque-schatten-im-paradies.json) | 2018 | Tô Hoàng | 404 | 85k | [Sản phẩm](https://sachdonga.vn/products/bong-toi-thien-duong) |

## Đối chiếu và quyết định dữ liệu

- **Phía Tây Không Có Gì Lạ:** bản có sẵn là 2025/100k. Trang Đông A hiện ghi 2026, giá bìa trong mô tả 80k và giá gạch ngang 100k. Không sửa file hoặc bổ sung edition vào sách cũ vì yêu cầu hiện tại là nhập mới; skill yêu cầu giữ nguyên sách trùng.
- **Bản Du Ca Cuối Cùng:** mô tả Đông A ghi 90k nhưng ô giá gốc ghi 110k. [Fahasa — tái bản 2025](https://www.fahasa.com/ban-du-ca-cuoi-cung-tai-ban-2025.html) khớp mã hàng 8936203365269, năm 2025, Vũ Kim Thư, 340 trang và giá gốc 110k; dùng 110k. Cân nặng 360g và hình bìa trước lấy từ cùng bản này.
- **Lửa Thương Yêu, Lửa Ngục Tù:** dùng tên trên bìa và trong đoạn giới thiệu tác giả của Đông A. Tiêu đề trang ghi “Lửa yêu thương lửa ngục tù”. Số trang dùng 448 theo Đông A; Fahasa ghi 488 nên không dùng số trang và cân nặng từ bảng thông tin đó.
- **Bóng Tối Thiên Đường:** dùng Đông A: năm 2018, Tô Hoàng, 404 trang. Bảng thông tin Fahasa ghi Cao Xuân Hạo, 632 trang, năm 2017, trái với Đông A và ảnh bìa; không dùng các trường này hoặc cân nặng đi kèm.
- **Khải Hoàn Môn:** Đông A không ghi năm edition. Lượt nhập trước đã dùng năm 2017 từ [Fahasa](https://www.fahasa.com/khai-hoan-mon.html), cùng Cao Xuân Hạo, 632 trang, giá 120k, bìa mềm, cân nặng 650g. Thông tin bổ sung và Thư mục Quốc gia xác nhận có bản 2016; chưa đủ bằng chứng để xác định giá trị 01-2017 trên Fahasa là một lần tái bản riêng. Năm 2017 trong JSON hiện cần đối chiếu trang bản quyền, không xem là đã xác minh độc lập.
- Định dạng **Bìa mềm**: Ba Người Bạn có ghi trực tiếp trên Đông A; các tựa còn lại đối chiếu Fahasa. Đường Về có nhắc bìa áo ngay trên tiêu đề sản phẩm; bỏ ghi chú tình trạng hàng “hơi cũ” khỏi tên tác phẩm.
- Kích thước dùng 14.5 x 20.5 theo Đông A. Cân nặng 500g của [Đường Về](https://www.fahasa.com/duong-ve.html), [Thời Gian Để Sống Và Thời Gian Để Chết](https://www.fahasa.com/thoi-gian-de-song-va-thoi-gian-de-chet.html), [Bia Mộ Đen](https://www.fahasa.com/bia-mo-den.html), [Đêm Lisbon](https://www.fahasa.com/dem-lisbon.html) đối chiếu Fahasa; Ba Người Bạn 500g theo Đông A.
- Tựa gốc dùng phần giới thiệu Đông A; bổ sung **Drei Kameraden** và **Die Nacht von Lissabon** từ [thư mục Trung tâm Erich Maria Remarque, Đại học Osnabrück](https://www.remarque.uni-osnabrueck.de/ausgaben/werke.html).
- Không tạo series từ một trang tập hợp sách theo tác giả. `awards`, `series` và `series_ids` để mảng rỗng. Đề cử Nobel không được nhập thành giải thưởng.
- Thumbnail dùng ảnh bìa; gallery chỉ giữ ảnh sách 3D bổ sung khi khác thumbnail, không thêm trang nội dung.

## Trường còn thiếu

- ISBN: chỉ Ba Người Bạn có mã ISBN được nêu rõ, hợp lệ: 978-604-69-9557-9. Tám tựa mới còn lại để `null`; mã hàng 893… không được nhập vào ISBN.
- Cân nặng: Lửa Thương Yêu, Lửa Ngục Tù và Bóng Tối Thiên Đường để `null`.
- Số lượng in, đánh số bản, minh họa, hiệu đính và các quy cách khác không được nguồn xác nhận: để trống theo schema.

## Kiểm tra

- Mỗi file mới có đúng 1 edition, ID khớp slug/năm/Đông A/Bìa mềm/giá.
- `data/book.json` có đúng 9 mục mới; `data/author.json` liên kết đủ 10 tác phẩm, không trùng ID.
- File sách cũ, các mục index cũ, các tác giả khác và dữ liệu series được giữ nguyên.
- Đã tạo lại sitemap và chạy `npm run audit:release`: đạt. Cảnh báo có sẵn: edition thiếu publisher trong `data/book/robert-louis-stevenson-treasure-island.json#1`.

## Đối chiếu bổ sung về đợt phát hành đầu

Người dùng bổ sung: ba tựa ra tháng 12/2016 (Ba Người Bạn, Bóng Tối Thiên Đường, Khải Hoàn Môn); bảy tựa còn lại ra tháng 6/2017, kèm giá bìa. Các mốc tháng này được ghi nhận theo thông tin người dùng; chưa tìm được bài thông báo gốc để xác minh độc lập từng tháng.

| Tựa | Mốc và giá người dùng cung cấp | Edition hiện có trong JSON | Kết quả đối chiếu |
| --- | --- | --- | --- |
| Ba Người Bạn | 12/2016; chưa nêu giá | 2025 / 150k | Có bản 2016 được Thư mục Quốc gia xác nhận, giá 110k. Edition 2025 đang nhập là bản khác; không thay năm và giá bằng dữ liệu bản 2016. |
| Bóng Tối Thiên Đường | 12/2016; chưa nêu giá | 2018 / 85k | Bản tái bản 2018 được Thư mục Quốc gia xác nhận. Mốc đầu 12/2016 cần kiểm tra thêm: biểu ghi s383099 lại ghi năm 2017, giá 85k. |
| Khải Hoàn Môn | 12/2016; chưa nêu giá | 2017 / 120k | Thư mục Quốc gia xác nhận bản 2016 / 120k. Năm 2017 lấy từ Fahasa chưa đủ để phân biệt lỗi thông tin bán hàng với một lần tái bản; cần trang bản quyền của bản đang mô tả. |
| Phía Tây Không Có Gì Lạ | 6/2017 / 65k | 2025 / 100k | Thư mục Quốc gia xác nhận 2017 / 65k; đây là dữ liệu của bản trước, không thay cho bản 2025. |
| Đường Về | 6/2017 / 70k | 2017 / 70k | Khớp năm và giá. |
| Đêm Lisbon | 6/2017 / 70k | 2017 / 70k | Khớp năm và giá theo thông tin người dùng và trang Đông A đã đối chiếu. |
| Lửa Thương Yêu, Lửa Ngục Tù | 6/2017 / 90k | 2017 / 90k | Khớp năm và giá; giữ tên theo bìa. |
| Thời Gian Để Sống Và Thời Gian Để Chết | 6/2017 / 100k | 2017 / 100k | Khớp năm và giá. |
| Bia Mộ Đen | 6/2017 / 75k | 2017 / 75k | Khớp năm và giá. |
| Bản Du Ca Cuối Cùng | 6/2017 / 70k | 2025 / 110k | Thư mục Quốc gia xác nhận 2017 / 70k; edition 2025 có giá khác được đối chiếu riêng, không đổi về giá bản đầu. |

Nguồn thư mục bổ sung:

- [Thư mục Quốc gia 2016, phần 06, trang in 947, mục 16239](https://nlv.gov.vn/dmdocuments/tmqg_2016_part_06.pdf#page=91): Ba Người Bạn — Đông A, NXB Văn học, 2016, Vũ Hương Giang, 110k.
- [Thư mục Quốc gia 2017, phần 2, trang in 1749, mục 1695](https://nlv.gov.vn/dmdocuments/TMQG_2017_Q2.pdf#page=667): Khải Hoàn Môn — Đông A, NXB Văn học, 2016, Cao Xuân Hạo, 120k. Đây là mục sách xuất bản năm trước được bổ sung trong thư mục 2017; không lấy năm của tập thư mục làm năm edition.
- [Thư mục Quốc gia 2017, phần 1, trang in 901, mục 16676–16682](https://nlv.gov.vn/dmdocuments/TMQG_2017_Q1.pdf#page=909): xác nhận năm/giá Bản Du Ca Cuối Cùng 2017/70k, Bia Mộ Đen 2017/75k, Đường Về 2017/70k, Lửa Thương Yêu Lửa Ngục Tù 2017/90k, Phía Tây Không Có Gì Lạ 2017/65k, Thời Gian Để Sống Và Thời Gian Để Chết 2017/100k. Cùng trang ghi Bóng Tối Thiên Đường 2017/85k, cần đối chiếu với mốc 12/2016 người dùng cung cấp.
- [Thư mục Quốc gia tháng 3/2019, trang in 177, mục 2416](https://nlv.gov.vn/dmdocuments/tmqg-03-2019.pdf#page=177): ghi rõ Bóng Tối Thiên Đường tái bản năm 2018, Tô Hoàng, 85k.

Lượt đối chiếu bổ sung chỉ cập nhật báo cáo, không thay đổi JSON hoặc tạo thêm edition. Đợt phát hành đầu và những bản in sau được giữ riêng về mặt chứng cứ; không tự sao chép ISBN, cân nặng, số trang hoặc ảnh của bản mới sang bản cũ. Các nguồn thư mục có cách ghi số trang khác trang bán hàng; chưa dùng chênh lệch đó để kết luận là khác lần in hoặc sửa số trang trong JSON.

