# Checklist ấn bản Đông A

Đối chiếu với hồ sơ trong `data/book/*.json` ngày 20/11/2026. Bảng Trăm năm Nobel cập nhật ngày 28/11/2026.

- **Có:** `☑` là đã có hồ sơ tựa sách và liên kết tới JSON; `☐` là chưa có hồ sơ. Dấu này không xác nhận đã có đúng edition của mã bản trong dòng.
- **Mã bản:** giữ mã hoặc tên edition đang theo dõi (độc bản A, cao cấp, phổ thông…); mã chưa khớp dữ liệu được nêu trong Memo. Ghi `Thiếu` nếu chưa rõ. Chỉ ghép edition có căn cứ từ caption, số lượng hoặc dải đánh số; không lấy bản phổ thông hay edition của đơn vị khác để điền thay.
- **Ấn Bản Giới Hạn:** là loại phiên bản hợp lệ, ghi trực tiếp trong cột Mã bản khi đã xác nhận đúng edition. Không yêu cầu mã S hay số lượng in để hoàn tất; `print_run` chưa rõ giữ `null`, không tự tạo Memo yêu cầu thu thập.
- **Số lượng in:** chưa biết thì giữ `null`, không tự ghi Memo yêu cầu bổ sung. Tổng số in có thể gồm bản tặng/lưu chiểu/bản chữ và khác số bản phát hành trong dải đánh số; riêng chênh lệch hai con số không đủ để kết luận dữ liệu mâu thuẫn.
- **Phát hành:** lấy `pub_date` của đúng edition, hiển thị ngày/tháng/năm. Bản có `is_upcoming: true` ghi `Sắp phát hành`. Các bản còn lại ghi `Thiếu` khi chưa có ngày hoặc chưa xác định được edition. Với các bản chữ A do người dùng cung cấp, được ghi năm ở dạng `YYYY` khi chỉ biết năm; giữ ngày đầy đủ nếu đã có trong đúng edition. Không tự bổ sung ngày/tháng hoặc lấy năm của bản S100/S500 thay cho bản chữ A.
- **Giá:** chép nguyên giá trị `cover_price` đã lưu, kể cả cách ghi cũ như `2500k` hoặc `2tr6`; không quy đổi hoặc tự chuẩn hóa. Chưa có đúng edition hoặc giá rỗng thì ghi `Thiếu`. Một dòng có nhiều edition cùng mã ghi rõ giá theo từng hình thức.
- **Hình:** ghi `Thiếu` khi `gellery_imgs` rỗng hoặc chưa có đúng edition để đối chiếu; có gallery thì để trống. Thumbnail không thay cho gallery. Đây chỉ là trạng thái theo dõi, không phải yêu cầu tự tải thêm ảnh hoặc tạo gallery; một ảnh đầu vào được phép chỉ có thumbnail.
- **Memo:** chỉ giữ việc cần xác nhận/thu thập có căn cứ; mốc thời gian và giá cũ chưa có trong đúng edition được giữ làm dữ kiện cần đối chiếu. Với bản limited, không tìm thấy giá, ISBN, khối lượng hoặc kích thước là bình thường: để trống trường tương ứng trong hồ sơ, không tự ghi Memo nhắc bổ sung các trường này. Chỉ ghi khi có nguồn mâu thuẫn hoặc người dùng yêu cầu theo dõi cụ thể. Dữ kiện đã đủ/đúng thì bỏ Memo, không ghi lịch sử xử lý hoặc trạng thái kỹ thuật.
- **Dải đánh số S100:** theo xác nhận của người dùng, không cần thu thập `copy_numbering` còn thiếu, không ghi vào Memo; giữ nguyên dải số đã có, không suy từ mã S100.
- **Số trang đã chốt bỏ qua:** Ông già và biển cả S100, Văn mới 5 năm 2011–2015 bản số 13 và Văn mới 5 năm đầu thế kỷ bản số 41 giữ `page_count: null`; không ghi Memo yêu cầu thu thập hoặc sao số trang từ edition khác.

Có **158 dòng theo dõi**, tương ứng **91 tựa/tập sách** đã có hồ sơ. Tập I và Tập II của Lịch sử La Mã được tính riêng; Tập I (Quyển I–II) đã được người dùng xác nhận.

Các dòng Bố già liên kết cùng một hồ sơ tác phẩm; mỗi dòng đối chiếu edition riêng. Dòng Đại Việt sử ký toàn thư – S895 có hai edition (bìa da thật và bìa buckram).

Mã S trong checklist có thể được đối chiếu bằng số lượng hoặc dải đánh số đã lưu dù Caption trong JSON là `Ấn Bản Giới Hạn`; không yêu cầu đổi Caption hay bổ sung mã. Người kép già được ghi theo Caption S100, với tổng số in 101 bản. Bản buckram của Tội ác của Sylvestre Bonnard & Đảo chim cánh cụt được theo dõi theo Caption `Ấn Bản Giới Hạn`; không gán S1200 khi chưa có căn cứ. Hai tuyển tập Jacinto Benavente và William Butler Yeats dùng Caption `Ấn Bản Giới Hạn`; `Trăm năm Nobel` là bộ sưu tập.

Danh sách bản chữ A hiện gồm **32 tựa đã có 33 edition Chữ A** (4 edition phát hành năm 2021, 12 edition phát hành năm 2023, 16 edition phát hành năm 2025, 1 edition phát hành năm 2026); Bố già có hai edition Chữ A riêng năm 2021 và 2025. Đã nhập đủ các tựa Chữ A trong checklist. Hai tựa Văn mới được theo dõi riêng đúng ký hiệu **bản số 41** và **bản số 13**, không tính vào số bản Chữ A. Người dùng xác nhận “Tuyển truyện Thạch Lam” là “Gió đầu mùa & Hà Nội băm sáu phố phường”, “Tuyển truyện Nam Cao” là “Đôi lứa xứng đôi / Nửa đêm / Cười”; các dòng liên kết cùng hồ sơ tương ứng.

## Danh sách đối chiếu

Sắp theo cột **Phát hành** từ cũ đến mới trong từng bảng. Dòng có nhiều ngày xếp theo ngày sớm nhất. Các dòng `Thiếu` và `Sắp phát hành` nằm cuối bảng theo thứ tự đó. STT bắt đầu từ 1 trong mỗi bảng.

### S100 “đời đầu”

Các tựa thuộc giai đoạn 2005–2015. Ngày ở hai dòng Văn mới là ngày của bản đóng lại đang được theo dõi. [Hành trình S100 Đông A](https://vanvn.vn/mot-thu-choi-sach/)

| STT | Có | Sách | Mã bản | Phát hành | Giá | Hình | Memo |
| --- | :---: | --- | --- | --- | ---: | :---: | --- |
| 1 | ☑ | [Văn mới 5 năm 2011-2015](../../../data/book/nhieu-tac-gia-van-moi-5-nam-2011-2015.json) | Bản số 13 | 19/01/2025 | Thiếu | Thiếu |  |
| 2 | ☑ | [Văn mới 5 năm đầu thế kỷ](../../../data/book/nhieu-tac-gia-van-moi-5-nam-dau-the-ky.json) | Bản số 41 | 19/01/2025 | Thiếu | Thiếu |  |
| 3 | ☑ | [Hạt bụi người bay ngược](../../../data/book/hoa-vang-hat-bui-nguoi-bay-nguoc.json) | S100 | Thiếu | Thiếu |  |  |
| 4 | ☑ | [Sắp đặt và diễn](../../../data/book/ho-anh-thai-sap-dat-va-dien.json) | S100 | Thiếu | Thiếu | Thiếu |  |
| 5 | ☑ | [Viết về bè bạn](../../../data/book/bui-ngoc-tan-viet-ve-be-ban.json) | S100 | Thiếu | Thiếu | Thiếu | |

### S100 New Collection

Chín ấn bản thuộc đợt 2019–2020 theo danh sách trưng bày kỷ niệm 20 năm S100 Đông A. [Danh sách trưng bày](https://thegioianh.diendandoanhnghiep.vn/nha-sach-dong-a-ky-niem-hanh-trinh-20-nam-thuc-hien-sach-suu-tam-5547.html)

| STT | Có | Sách | Mã bản | Phát hành | Giá | Hình | Memo |
| --- | :---: | --- | --- | --- | ---: | :---: | --- |
| 1 | ☑ | [Kiêu hãnh và định kiến](../../../data/book/jane-austen-pride-and-prejudice.json) | S100 | 01/06/2019 | 900k |  |  |
| 2 | ☑ | [Anh em nhà Karamazov](../../../data/book/fyodor-dostoevsky-anh-em-nha-karamazov.json) | S100 | 19/07/2019 | 1tr200k |  |  |
| 3 | ☑ | [Những ngôi sao Eger](../../../data/book/gardonyi-geza-egri-csillagok.json) | S100 | 01/08/2019 | 1tr |  |  |
| 4 | ☑ | [Hán Sở diễn nghĩa](../../../data/book/chan-vi-han-so-dien-nghia.json) | S100 | 01/09/2019 | 1tr |  |  |
| 5 | ☑ | [Bố già](../../../data/book/mario-puzo-the-godfather.json) | S100 | 01/12/2019 | 1tr500k |  |  |
| 6 | ☑ | [Robinson Crusoe](../../../data/book/daniel-defoe-robinson-crusoe.json) | S100 | 01/01/2020 | 1tr200k |  |  |
| 7 | ☑ | [Khát vọng sống](../../../data/book/irving-stone-lust-for-life.json) | S100 | 06/03/2020 | 1tr200k |  |  |
| 8 | ☑ | [Những cuốn sách thay đổi lịch sử](../../../data/book/michael-collins-remarkable-books.json) | S100 | 01/05/2020 | 2tr |  |  |
| 9 | ☑ | [Thiên hoàng Minh Trị](../../../data/book/donald-keene-emperor-of-japan-meiji-and-his-world-1852-1912.json) | S100 | 20/07/2020 | 1tr500k |  |  |

### Bản "Chữ"

| STT | Có | Sách | Mã bản | Phát hành | Giá | Hình | Memo |
| --- | :---: | --- | --- | --- | ---: | :---: | --- |
| 1 | ☑ | [Đông Dương xinh đẹp và kỳ vĩ](../../../data/book/pierre-dieulefils-indo-chine-pittoresque-monumentale.json) | Bản Chữ A | 24/01/2021 | Thiếu |  |  |
| 2 | ☑ | [Bố già (bản Chữ A da MyQ đỏ)](../../../data/book/mario-puzo-the-godfather.json) | Bản Chữ A | 18/07/2021 | Thiếu |  |  |
| 3 | ☑ | [Việt Nam sử lược (bản chữ A)](../../../data/book/tran-trong-kim-viet-nam-su-luoc.json) | Bản Chữ A | 22/08/2021 | Thiếu |  |  |
| 4 | ☑ | [Cuốn theo chiều gió](../../../data/book/margaret-mitchell-gone-with-the-wind.json) | Bản Chữ A | 20/09/2021 | Thiếu |  |  |
| 5 | ☑ | [Cuốn theo chiều gió](../../../data/book/margaret-mitchell-gone-with-the-wind.json) | Bản Chữ Ô | 20/09/2021 | Thiếu |  |  |
| 6 | ☑ | [Bỉ vỏ](../../../data/book/nguyen-hong-bi-vo.json) | Bản Chữ A | 08/01/2023 | Thiếu | Thiếu |  |
| 7 | ☑ | [Chàng ngốc](../../../data/book/fyodor-dostoevsky-chang-ngoc.json) | Bản Chữ A | 08/01/2023 | Thiếu | Thiếu |  |
| 8 | ☑ | [Gatsby vĩ đại](../../../data/book/f-scott-fitzgerald-the-great-gatsby.json) | Bản Chữ A | 08/01/2023 | Thiếu | Thiếu |  |
| 9 | ☑ | [Một chiến dịch ở Bắc Kỳ](../../../data/book/charles-edouard-hocquard-mot-chien-dich-o-bac-ky.json) | Bản Chữ A | 08/01/2023 | Thiếu | Thiếu |  |
| 10 | ☑ | [Napoléon Bonaparte](../../../data/book/adam-zamoyski-napoleon-a-life.json) | Bản Chữ A | 08/01/2023 | Thiếu | Thiếu |  |
| 11 | ☑ | [Nghệ nhân và Margarita](../../../data/book/mikhail-bulgacov-nghe-nhan-va-margarita.json) | Bản Chữ A | 08/01/2023 | Thiếu | Thiếu |  |
| 12 | ☑ | [Ông già và biển cả](../../../data/book/ernest-hemingway-the-old-man-and-the-sea.json) | Bản Chữ A | 08/01/2023 | Thiếu | Thiếu |  |
| 13 | ☑ | [Quo Vadis](../../../data/book/henryk-sienkiewicz-quo-vadis.json) | Bản Chữ A | 08/01/2023 | Thiếu | Thiếu |  |
| 14 | ☑ | [Thương nhớ mười hai](../../../data/book/vu-bang-thuong-nho-muoi-hai.json) | Bản Chữ A | 08/01/2023 | Thiếu | Thiếu |  |
| 15 | ☑ | [Tội ác và hình phạt](../../../data/book/fyodor-dostoevsky-toi-ac-va-trung-phat.json) | Bản Chữ A | 08/01/2023 | Thiếu | Thiếu |  |
| 16 | ☑ | [Truyện cổ Grimm](../../../data/book/jacob-ludwig-karl-grimm-kinder-und-hausmarchen.json) | Bản Chữ A | 08/01/2023 | Thiếu | Thiếu |  |
| 17 | ☑ | [Truyện ngắn Nguyễn Huy Thiệp](../../../data/book/nguyen-huy-thiep-truyen-ngan-nguyen-huy-thiep.json) | Bản Chữ A | 08/01/2023 | Thiếu | Thiếu |  |
| 18 | ☑ | [Đại Việt sử ký toàn thư](../../../data/book/nhieu-tac-gia-dai-viet-su-ky-toan-thu.json) | Bản Chữ A | 18/01/2025 | Thiếu | Thiếu |  |
| 19 | ☑ | [Đôi lứa xứng đôi / Nửa đêm / Cười](../../../data/book/nam-cao-doi-lua-xung-doi-nua-dem-cuoi.json) | Bản Chữ A | 18/01/2025 | Thiếu | Thiếu |  |
| 20 | ☑ | [Gió đầu mùa & Hà Nội băm sáu phố phường](../../../data/book/thach-lam-gio-dau-mua-ha-noi-bam-sau-pho-phuong.json) | Bản Chữ A | 18/01/2025 | Thiếu | Thiếu |  |
| 21 | ☑ | [Hoàng tử bé](../../../data/book/antoine-de-saint-exupery-le-petit-prince.json) | Bản Chữ A | 18/01/2025 | Thiếu | Thiếu |  |
| 22 | ☑ | [Nghệ thuật Dessin](../../../data/book/nguyen-dinh-dang-nghe-thuat-dessin.json) | Bản Chữ A | 18/01/2025 | Thiếu | Thiếu |  |
| 23 | ☑ | [Nghìn lẻ một đêm](../../../data/book/antoine-galland-nghin-le-mot-dem.json) | Bản Chữ A | 18/01/2025 | Thiếu | Thiếu |  |
| 24 | ☑ | [Ngụ ngôn La Fontaine](../../../data/book/la-fontaine-the-fables-of-la-fontaine.json) | Bản Chữ A | 18/01/2025 | Thiếu | Thiếu |  |
| 25 | ☑ | [Số đỏ](../../../data/book/vu-trong-phung-so-do.json) | Bản Chữ A | 18/01/2025 | Thiếu | Thiếu |  |
| 26 | ☑ | [Việt Nam văn hóa sử cương](../../../data/book/dao-duy-anh-viet-nam-van-hoa-su-cuong.json) | Bản Chữ A | 18/01/2025 | Thiếu | Thiếu |  |
| 27 | ☑ | [Bố già](../../../data/book/mario-puzo-the-godfather.json) | Bản Chữ A | 19/01/2025 | Thiếu | Thiếu |  |
| 28 | ☑ | [Con Bim trắng tai đen](../../../data/book/gavriil-troyepolsky-con-bim-trang-tai-den.json) | Bản Chữ A | 19/01/2025 | Thiếu | Thiếu |  |
| 29 | ☑ | [Hành Trình Thám Hiểm Đông Dương](../../../data/book/francis-garnier-voyage-dexploration-en-indo-chine.json) | Bản Chữ A | 19/01/2025 | Thiếu | Thiếu |  |
| 30 | ☑ | [Lịch sử Việt Nam bằng hình](../../../data/book/dong-a-the-illustrated-history-of-vietnam.json) | Bản Chữ A | 19/01/2025 | Thiếu | Thiếu |  |
| 31 | ☑ | [Nhà Thờ Đức Bà Paris](../../../data/book/victor-hugo-notre-dame-de-paris.json) | Bản Chữ A | 19/01/2025 | Thiếu | Thiếu |  |
| 32 | ☑ | [Thần khúc](../../../data/book/dante-alighieri-la-divina-commedia.json) | Bản Chữ A | 19/01/2025 | Thiếu | Thiếu |  |
| 33 | ☑ | [Truyện Kiều](../../../data/book/nguyen-du-truyen-kieu.json) | Bản Chữ A | 19/01/2025 | Thiếu | Thiếu |  |
| 34 | ☑ | [Bách khoa toàn thư biểu tượng và hoa văn Mật Tạng](../../../data/book/robert-beer-the-encyclopedia-of-tibetan-symbols-and-motifs.json) | Bản Chữ A | 25/01/2026 | Thiếu |  |  |

### S100 “hậu” New Collection

Các ấn bản S100 từ năm 2021.

| STT | Có | Sách | Mã bản | Phát hành | Giá | Hình | Memo |
| --- | :---: | --- | --- | --- | ---: | :---: | --- |
| 1 | ☑ | [Truyện ngắn Nguyễn Huy Thiệp](../../../data/book/nguyen-huy-thiep-truyen-ngan-nguyen-huy-thiep.json) | S100 | 31/01/2021 | 4tr500k |  |  |
| 2 | ☑ | [Người kép già](../../../data/book/kim-lan-nguoi-kep-gia.json) | S100 (101 bản) | 23/03/2021 | 999k |  |  |
| 3 | ☑ | [Đảo mộng mơ](../../../data/book/nguyen-nhat-anh-dao-mong-mo.json) | S100 (106 bản) | 08/04/2021 | 1tr900k |  |  |
| 4 | ☑ | [Việt Nam sử lược](../../../data/book/tran-trong-kim-viet-nam-su-luoc.json) | S100 | 28/05/2021 | Thiếu |  |  |
| 5 | ☑ | [Truyện cổ Grimm](../../../data/book/jacob-ludwig-karl-grimm-kinder-und-hausmarchen.json) | S100 | 27/12/2021 | Thiếu |  |  |
| 6 | ☑ | [Napoléon Bonaparte](../../../data/book/adam-zamoyski-napoleon-a-life.json) | S100 | 01/01/2022 | Thiếu |  |  |
| 7 | ☑ | [Nghệ nhân và Margarita](../../../data/book/mikhail-bulgacov-nghe-nhan-va-margarita.json) | S100 | 28/01/2022 | Thiếu |  |  |
| 8 | ☑ | [Tội ác và hình phạt](../../../data/book/fyodor-dostoevsky-toi-ac-va-trung-phat.json) | S100 | 07/04/2022 | Thiếu |  |  |
| 9 | ☑ | [Thương nhớ mười hai](../../../data/book/vu-bang-thuong-nho-muoi-hai.json) | S100 | 28/06/2022 | Thiếu |  |  |
| 10 | ☑ | [Bỉ vỏ](../../../data/book/nguyen-hong-bi-vo.json) | S100 | 09/09/2022 | Thiếu |  |  |
| 11 | ☑ | [Gatsby vĩ đại](../../../data/book/f-scott-fitzgerald-the-great-gatsby.json) | S100 | 10/10/2022 | Thiếu |  |  |
| 12 | ☑ | [Chàng ngốc](../../../data/book/fyodor-dostoevsky-chang-ngoc.json) | S100 | 05/11/2022 | Thiếu |  |  |
| 13 | ☑ | [Ông già và biển cả](../../../data/book/ernest-hemingway-the-old-man-and-the-sea.json) | S100 | 02/12/2022 | Thiếu |  |  |
| 14 | ☑ | [Một chiến dịch ở Bắc Kỳ](../../../data/book/charles-edouard-hocquard-mot-chien-dich-o-bac-ky.json) | S100 | 17/12/2022 | 8tr |  |  |
| 15 | ☑ | [Số đỏ](../../../data/book/vu-trong-phung-so-do.json) | S100 | 31/01/2023 | 6tr500k |  |  |
| 16 | ☑ | [Quo Vadis](../../../data/book/henryk-sienkiewicz-quo-vadis.json) | S100 | 20/02/2023 | 6tr500k |  |  |
| 17 | ☑ | [Hoàng tử bé](../../../data/book/antoine-de-saint-exupery-le-petit-prince.json) | S100 | 03/03/2023 | 4tr200k |  |  |
| 18 | ☑ | [Nghìn lẻ một đêm](../../../data/book/antoine-galland-nghin-le-mot-dem.json) | S100 | 15/04/2023 | 12tr |  |  |
| 19 | ☑ | [Việt Nam văn hóa sử cương](../../../data/book/dao-duy-anh-viet-nam-van-hoa-su-cuong.json) | S100 | 26/06/2023 | 5tr |  |  |
| 20 | ☑ | [Ngụ ngôn La Fontaine](../../../data/book/la-fontaine-the-fables-of-la-fontaine.json) | S100 | 01/08/2023 | 6tr |  |  |
| 21 | ☑ | [Gió đầu mùa & Hà Nội băm sáu phố phường](../../../data/book/thach-lam-gio-dau-mua-ha-noi-bam-sau-pho-phuong.json) | S100 | 12/10/2023 | 3tr800k |  |  |
| 22 | ☑ | [Đôi lứa xứng đôi / Nửa đêm / Cười](../../../data/book/nam-cao-doi-lua-xung-doi-nua-dem-cuoi.json) | S100 | 05/11/2023 | 3tr800k |  |  |
| 23 | ☑ | [Đại Việt sử ký toàn thư](../../../data/book/nhieu-tac-gia-dai-viet-su-ky-toan-thu.json) | S100 | 23/01/2024 | Thiếu |  |  |
| 24 | ☑ | [Nhà thờ Đức Bà Paris](../../../data/book/victor-hugo-notre-dame-de-paris.json) | S100 | 26/05/2024 | 8tr500k |  |  |
| 25 | ☑ | [Con Bim trắng tai đen](../../../data/book/gavriil-troyepolsky-con-bim-trang-tai-den.json) | S100 | 08/08/2024 | 3tr900k |  |  |
| 26 | ☑ | [Hành trình thám hiểm Đông Dương](../../../data/book/francis-garnier-voyage-dexploration-en-indo-chine.json) | S100 | 21/11/2024 | 7tr500k |  |  |
| 27 | ☑ | [Thần khúc](../../../data/book/dante-alighieri-la-divina-commedia.json) | S100 | 06/12/2024 | 11tr |  |  |
| 28 | ☑ | [Truyện Kiều](../../../data/book/nguyen-du-truyen-kieu.json) | S100 | 25/03/2025 | 11tr |  |  |
| 29 | ☑ | [Văn mới 10 năm 2015 - 2025](../../../data/book/van-moi-10-nam-2015-2025-dong-a.json) | S100 | 05/11/2025 | 3tr |  |  |

### S khác và các ấn bản còn lại

Gồm S365, S500, S895 và các dòng khác đang theo dõi, kể cả Sách Tết, bản tri ân và bản cao cấp.

| STT | Có | Sách | Mã bản | Phát hành | Giá | Hình | Memo |
| --- | :---: | --- | --- | --- | ---: | :---: | --- |
| 1 | ☑ | [Bố già](../../../data/book/mario-puzo-the-godfather.json) | S500 | 30/12/2019 | 500k |  |  |
| 2 | ☑ | [Một chiến dịch ở Bắc Kỳ](../../../data/book/charles-edouard-hocquard-mot-chien-dich-o-bac-ky.json) | Bìa cứng áo ôm (phổ thông + cao cấp) | 18/05/2020 | 320k |  |  |
| 3 | ☑ | [Quo Vadis](../../../data/book/henryk-sienkiewicz-quo-vadis.json) | S500 | 29/07/2020 | 1tr |  |  |
| 4 | ☑ | [Một chiến dịch ở Bắc Kỳ](../../../data/book/charles-edouard-hocquard-mot-chien-dich-o-bac-ky.json) | S500 | 06/10/2020 | 1tr200k |  |  |
| 5 | ☑ | [Số đỏ – Bản tri ân](../../../data/book/vu-trong-phung-so-do.json) | Bản Tri Ân | 11/11/2020 | Thiếu |  |  |
| 6 | ☑ | [Số đỏ](../../../data/book/vu-trong-phung-so-do.json) | S500 | 17/11/2020 | 800k |  |  |
| 7 | ☑ | [Truyện ngắn Nguyễn Huy Thiệp](../../../data/book/nguyen-huy-thiep-truyen-ngan-nguyen-huy-thiep.json) | S500 | 18/12/2020 | 900k |  |  |
| 8 | ☑ | [Việt Nam sử lược](../../../data/book/tran-trong-kim-viet-nam-su-luoc.json) | S500 | 01/02/2021 | 900k |  |  |
| 9 | ☑ | [Đông Dương xinh đẹp và kỳ vĩ](../../../data/book/pierre-dieulefils-indo-chine-pittoresque-monumentale.json) | S365 | 24/02/2021 | 3tr |  |  |
| 10 | ☑ | [Người kép già](../../../data/book/kim-lan-nguoi-kep-gia.json) | S365 | 01/03/2021 | 1tr500k |  |  |
| 11 | ☑ | [Cuốn theo chiều gió](../../../data/book/margaret-mitchell-gone-with-the-wind.json) | S365 | 26/07/2021 | 2tr |  |  |
| 12 | ☑ | [Napoléon Bonaparte](../../../data/book/adam-zamoyski-napoleon-a-life.json) | S500 | 15/09/2021 | 2tr100k |  |  |
| 13 | ☑ | [Tội ác và hình phạt](../../../data/book/fyodor-dostoevsky-toi-ac-va-trung-phat.json) | S500 | 01/12/2021 | 2tr500k |  |  |
| 14 | ☑ | [Nghệ nhân và Margarita](../../../data/book/mikhail-bulgacov-nghe-nhan-va-margarita.json) | S1200 | 19/01/2022 | 1tr500k |  |  |
| 15 | ☑ | [Nghìn lẻ một đêm](../../../data/book/antoine-galland-nghin-le-mot-dem.json) | S895 | 02/04/2022 | 2tr500k |  |  |
| 16 | ☑ | [Thương nhớ mười hai](../../../data/book/vu-bang-thuong-nho-muoi-hai.json) | S896 | 29/04/2022 | 1tr500k |  |  |
| 17 | ☑ | [Mahabharata / Sử thi Ấn Độ](../../../data/book/dk-mahabharata-bang-hinh-thien-su-thi-vi-dai-nhat-cua-an-do.json) | S365 | 08/06/2022 | 3tr500k |  |  |
| 18 | ☑ | [Thần khúc](../../../data/book/dante-alighieri-la-divina-commedia.json) | S1200 | 21/06/2022; 02/02/2023 | 2tr600k |  |  |
| 19 | ☑ | [Chàng ngốc](../../../data/book/fyodor-dostoevsky-chang-ngoc.json) | S1200 | 30/07/2022 | 1tr |  |  |
| 20 | ☑ | [Bỉ vỏ](../../../data/book/nguyen-hong-bi-vo.json) | S896 | 25/08/2022 | 1tr500k |  |  |
| 21 | ☑ | [Gatsby vĩ đại](../../../data/book/f-scott-fitzgerald-the-great-gatsby.json) | S500 | 30/08/2022 | 1tr200k |  |  |
| 22 | ☑ | [Việt Nam văn hóa sử cương](../../../data/book/dao-duy-anh-viet-nam-van-hoa-su-cuong.json) | S500 | 20/09/2022 | 1tr500k |  |  |
| 23 | ☑ | [Ông già và biển cả](../../../data/book/ernest-hemingway-the-old-man-and-the-sea.json) | S500 | 29/09/2022 | 1tr200k |  |  |
| 24 | ☑ | [Nhà thờ Đức Bà Paris](../../../data/book/victor-hugo-notre-dame-de-paris.json) | S500 | 15/10/2022 | 1tr800k |  |  |
| 25 | ☑ | [Hoàng tử bé](../../../data/book/antoine-de-saint-exupery-le-petit-prince.json) | S500 | 25/10/2022 | 1tr200k |  |  |
| 26 | ☑ | [Đất tiền đất bạc](../../../data/book/mario-puzo-the-fortunate-pilgrim.json) | S500 | 08/11/2022 | 700k |  |  |
| 27 | ☑ | [Nghệ thuật Dessin](../../../data/book/nguyen-dinh-dang-nghe-thuat-dessin.json) | S1200 | 17/11/2022 | 1tr400k |  |  |
| 28 | ☑ | [Ngụ ngôn La Fontaine](../../../data/book/la-fontaine-the-fables-of-la-fontaine.json) | S895 | 11/01/2023 | 2tr400k |  |  |
| 29 | ☑ | [Dại thì chết](../../../data/book/mario-puzo-fools-die.json) | S500 | 20/02/2023 | 800k |  |  |
| 30 | ☑ | [Đấu trường u ám](../../../data/book/mario-puzo-the-dark-arena.json) | S500 | 31/03/2023 | 700k |  |  |
| 31 | ☑ | [Tổng thống K. thứ tư](../../../data/book/mario-puzo-the-fourth-k.json) | S500 | 18/04/2023 | 800k |  |  |
| 32 | ☑ | [Đôi lứa xứng đôi / Nửa đêm / Cười](../../../data/book/nam-cao-doi-lua-xung-doi-nua-dem-cuoi.json) | S500 | 04/05/2023 | 1tr200k |  |  |
| 33 | ☑ | [Gió đầu mùa & Hà Nội băm sáu phố phường](../../../data/book/thach-lam-gio-dau-mua-ha-noi-bam-sau-pho-phuong.json) | S500 | 02/06/2023 | 1tr200k |  |  |
| 34 | ☑ | [Quả dưa đỏ](../../../data/book/nguyen-trong-thuat-qua-dua-do.json) | S365 | 20/06/2023 | 1tr200k |  |  |
| 35 | ☑ | [Con Bim trắng tai đen](../../../data/book/gavriil-troyepolsky-con-bim-trang-tai-den.json) | S500 | 11/07/2023 | 1tr500k |  |  |
| 36 | ☑ | [Hành trình thám hiểm Đông Dương](../../../data/book/francis-garnier-voyage-dexploration-en-indo-chine.json) | S365 | 12/08/2023 | 1tr500k |  |  |
| 37 | ☑ | [Thái Bình Thiên Quốc](../../../data/book/hoang-tieu-phoi-hong-xiu-quan-yan-yi.json) | S365 | 22/09/2023 | 1tr500k |  |  |
| 38 | ☑ | [Thống khổ & phiêu linh](../../../data/book/irving-stone-the-agony-and-the-ecstasy-a-biographical-novel-of-michelangelo.json) | S365 | 29/10/2023 | 1tr500k |  |  |
| 39 | ☑ | [Luật im lặng](../../../data/book/mario-puzo-omerta.json) | S500 | 09/01/2024 | 700k |  |  |
| 40 | ☑ | [Bố già (bản tri ân)](../../../data/book/mario-puzo-the-godfather.json) | S500 | 11/01/2024 | Thiếu | Thiếu |  |
| 41 | ☑ | [Đất máu Sicily](../../../data/book/mario-puzo-the-sicilian.json) | S500 | 23/01/2024 | 800k |  |  |
| 42 | ☑ | [Ông trùm cuối cùng](../../../data/book/mario-puzo-the-last-don.json) | S500 | 23/01/2024 | 800k |  |  |
| 43 | ☑ | [Cha con Giáo hoàng](../../../data/book/mario-puzo-the-family.json) | S500 | 25/01/2024 | 800k |  |  |
| 44 | ☑ | [Những trận chiến thay đổi lịch sử](../../../data/book/dk-nhung-tran-chien-thay-doi-lich-su.json) | S365 | 02/05/2024 | 1tr800k |  |  |
| 45 | ☑ | [Nhà văn: Cuộc đời và tác phẩm](../../../data/book/dk-writers-their-lives-and-works.json) | S365 | 01/07/2024 | 1tr800k |  |  |
| 46 | ☑ | [Bố già 55 – Bìa da dê](../../../data/book/mario-puzo-the-godfather.json) | GF55 (306 bản) | 27/12/2024 | 3tr500k |  |  |
| 47 | ☑ | [Bố già 55 – Bìa buckram](../../../data/book/mario-puzo-the-godfather.json) | S276 / BG55 | 27/12/2024 | 1tr500k |  |  |
| 48 | ☑ | [Kho tàng truyện cổ tích Việt Nam](../../../data/book/nguyen-dong-chi-kho-tang-truyen-co-tich-viet-nam.json) | S365 | 02/06/2025 | 3tr |  |  |
| 49 | ☑ | [Bách khoa toàn thư biểu tượng và hoa văn Mật Tạng](../../../data/book/robert-beer-the-encyclopedia-of-tibetan-symbols-and-motifs.json) | S500 | 05/08/2025 | Vải xanh: 1tr200k; Buckram vàng ký trực tiếp: 3tr900k |  |  |
| 50 | ☑ | [Hồ Chí Minh – Tiểu sử bằng hình](../../../data/book/dong-a-ho-chi-minh-tieu-su-bang-hinh.json) | S500 | 15/10/2025 | 2tr |  |  |
| 51 | ☑ | [60 bí quyết vẽ sơn dầu](../../../data/book/nguyen-dinh-dang-60-bi-quyet-ve-son-dau.json) | S500 | 16/03/2026 | 1tr200k |  |  |
| 52 | ☑ | [Trần Tiến – Người hát thơ mình](../../../data/book/tran-tien-tran-tien-nguoi-hat-tho-minh-ca-khuc-nhung-cau-chuyen.json) | S365 | 20/04/2026 | 2500k |  |  |
| 53 | ☑ | [Những tầng ký ức](../../../data/book/tran-dai-thang-layers-of-memory.json) | S365 | 16/05/2026 | 2tr6 |  |  |
| 54 | ☑ | [Đại Việt sử ký toàn thư](../../../data/book/nhieu-tac-gia-dai-viet-su-ky-toan-thu.json) | S895 | 22/07/2026 | Bìa da thật: 6tr; Bìa buckram: 5tr |  |  |
| 55 | ☑ | [Bố già](../../../data/book/mario-puzo-the-godfather.json) | S500 | 26/07/2026 | 2tr400k |  |  |
| 56 | ☑ | [Lục Vân Tiên](../../../data/book/nguyen-dinh-chieu-luc-van-tien.json) | S500 | 26/07/2026 | 2tr200k |  |  |
| 57 | ☑ | [Thép đã tôi thế đấy](../../../data/book/nikolai-alekseyevich-ostrovsky-how-the-steel-was-tempered.json) | S500 | 26/07/2026 | 2tr300k |  |  |
| 58 | ☑ | [Truyện Kiều](../../../data/book/nguyen-du-truyen-kieu.json) | S500 | 26/07/2026 | 2tr200k |  |  |
| 59 | ☑ | [Anh hùng ca Odyssée](../../../data/book/homere-odyssee.json) | S365 | 15/08/2026 | 2tr500k |  |  |
| 60 | ☑ | [Khâm định Việt sử thông giám cương mục](../../../data/book/quoc-su-quan-trieu-nguyen-kham-dinh-viet-su-thong-giam-cuong-muc.json) | S365 | 18/11/2026 | 3tr900k |  |  |
| 61 | ☑ | [Sách Tết Canh Tý 2020](../../../data/book/ho-anh-thai-sach-tet-canh-ty-2020.json) | S100 | Thiếu | 888k |  |  |
| 62 | ☑ | [Sách Tết Giáp Thìn 2024](../../../data/book/ho-anh-thai-sach-tet-giap-thin-2024.json) | S500 | Thiếu | 1200k |  |  |
| 63 | ☑ | [Sách Tết Kỷ Hợi 2019](../../../data/book/ho-anh-thai-sach-tet-ky-hoi-2019.json) | S100 | Thiếu | 1200k |  |  |
| 64 | ☑ | [Sách Tết Nhâm Dần 2022](../../../data/book/ho-anh-thai-sach-tet-nham-dan-2022.json) | S500 | Thiếu | 1100k |  |  |
| 65 | ☑ | [Sách Tết Quý Mão 2023](../../../data/book/ho-anh-thai-sach-tet-quy-mao-2023.json) | S500 | Thiếu | 1200k |  |  |
| 66 | ☑ | [Sách Tết Tân Sửu 2021](../../../data/book/ho-anh-thai-sach-tet-tan-suu-2021.json) | S365 | Thiếu | 999k |  |  |
| 67 | ☑ | [Truyện cổ Grimm](../../../data/book/jacob-ludwig-karl-grimm-kinder-und-hausmarchen.json) | S500 | Thiếu | 2tr200k |  |  |

### Trăm năm Nobel

| STT | Có | Sách | Mã bản | Phát hành | Giá | Hình | Memo |
| --- | :---: | --- | --- | --- | ---: | :---: | --- |
| 1 | ☑ | [Thi khúc & Thi phẩm](../../../data/book/sully-prudhomme-thi-khuc-thi-pham.json) | Ấn Bản Giới Hạn | 15/11/2021 | 1tr1 |  |  |
| 2 | ☑ | [Tội ác của Sylvestre Bonnard & Đảo chim cánh cụt](../../../data/book/anatole-france-toi-ac-cua-sylvestre-bonnard-dao-chim-canh-cut.json) | Ấn Bản Giới Hạn | 01/12/2021 | 1tr500k |  |  |
| 3 | ☑ | [Tuyển tập kịch Jacinto Benavente](../../../data/book/jacinto-benavente-tuyen-tap-kich-jacinto-benavente.json) | Ấn Bản Giới Hạn | 28/10/2022 | 1tr |  |  |
| 4 | ☑ | [Lịch sử La Mã - Tập I (Quyển I – II)](../../../data/book/theodor-mommsen-the-history-of-rome-vol-1.json) | Ấn Bản Giới Hạn | 15/11/2022 | 1200k |  |  |
| 5 | ☑ | [Tuyển tập thơ William Butler Yeats](../../../data/book/william-butler-yeats-tuyen-tap-tho-william-butler-yeats.json) | Ấn Bản Giới Hạn | 16/12/2023 | 1tr |  |  |
| 6 | ☑ | [Bí mật của Synnøve / Chuyện tình chàng Arne / Cậu trai vui vẻ](../../../data/book/bjrnstjerne-bjrnson-bi-mat-cua-synnve-chuyen-tinh-chang-arne-cau-trai-vui-ve-cua-bjrnstjerne-bjrnson.json) | Ấn Bản Giới Hạn | 29/12/2023 | 1tr |  |  |
| 7 | ☑ | [Lịch sử La Mã - Tập II (Quyển III)](../../../data/book/theodor-mommsen-the-history-of-rome-vol-3.json) | Ấn Bản Giới Hạn | 28/05/2024 | 1200k |  |  |
| 8 | ☑ | [Nông dân (2 tập)](../../../data/book/wadysaw-stanisaw-reymont-nong-dan.json) | Ấn Bản Giới Hạn | 30/12/2024 | 2tr |  |  |
| 9 | ☑ | [Điên rồ hay thần thánh](../../../data/book/jose-echegaray-dien-ro-hay-than-thanh.json) | Ấn Bản Giới Hạn | 19/01/2025 | 1tr |  |  |
| 10 | ☑ | [Nàng Mireille](../../../data/book/frederic-mistral-nang-mireille.json) | Ấn Bản Giới Hạn | 19/01/2025 | 800k |  |  |
| 11 | ☑ | [Pygmalion](../../../data/book/george-bernard-shaw-pygmalion.json) | Ấn Bản Giới Hạn | Thiếu | 600k |  |  |
| 12 | ☑ | [Bộ ba nhỏ – Lão bộc, Hania, Selim Mirza](../../../data/book/henryk-sienkiewicz-lao-boc-hania-selim-mirza.json) | Ấn Bản Giới Hạn | Thiếu | 900k |  |  |
| 13 | ☑ | [Tụng ca man dã](../../../data/book/giosue-carducci-tung-ca-man-da.json) | Thiếu | Sắp phát hành | Thiếu | Thiếu |  |
| 14 | ☑ | [Cành sậy trước gió](../../../data/book/grazia-deledda-canne-al-vento.json) | Thiếu | Sắp phát hành | Thiếu | Thiếu |  |
