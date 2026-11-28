# Checklist ấn bản Đông A

## Quy ước

- **Mã bản** đối chiếu theo Caption, số lượng in hoặc dải số của đúng ấn bản. Dùng `Ấn Bản Giới Hạn` khi đã xác nhận loại bản, `-` khi chưa rõ mã hoặc loại bản.
- **Phát hành** lấy `pub_date` theo `DD/MM/YYYY`. Nếu chỉ biết năm, ghi `YYYY` cho các bản chữ A đã xác nhận và hai bản S100 Văn mới đời đầu. Ghi `Sắp phát hành` nếu `is_upcoming: true`, còn thiếu ngày thì ghi `-`.
- **Giá** chép nguyên `cover_price` của đúng ấn bản. Ghi riêng theo hình thức nếu một dòng có nhiều bản. Chưa có giá thì ghi `-`.
- **Hình** để trống khi có `gellery_imgs`, ghi `-` khi chưa có gallery của đúng ấn bản.
- **Memo** chỉ ghi điểm cần đối chiếu, như ấn bản chưa có trong hồ sơ, ngày/giá cũ hoặc nguồn mâu thuẫn. Để trống nếu chỉ thiếu dữ liệu thông thường như giá, ISBN, kích thước, khối lượng, số lượng in hay dải số S100.
- **Hồ sơ** giữ `print_run: null` khi chưa rõ số lượng in và giữ dải số S100 theo hồ sơ. Giữ `page_count: null` cho Ông già và biển cả S100, Văn mới bản số 13 và bản số 41.

## Danh sách đối chiếu

Xếp theo ngày phát hành sớm nhất, từ cũ đến mới, rồi đến `-` và `Sắp phát hành`. STT bắt đầu từ 1 ở mỗi bảng.

### S100 “đời đầu”

| STT | Sách | Mã bản | Phát hành | Giá | Hình | Memo |
| --- | --- | --- | --- | ---: | :---: | --- |
| 1 | [Văn mới 5 năm đầu thế kỷ](../../../data/book/nhieu-tac-gia-van-moi-5-nam-dau-the-ky.json) | S100 | 2005 | - |  |  |
| 2 | [Văn mới 5 năm 2011-2015](../../../data/book/nhieu-tac-gia-van-moi-5-nam-2011-2015.json) | S100 | 2015 | - | - | Chưa có ấn bản S100 trong hồ sơ. |
| 3 | [Văn mới 5 năm 2011-2015](../../../data/book/nhieu-tac-gia-van-moi-5-nam-2011-2015.json) | Bản số 13 | 19/01/2025 | - | - |  |
| 4 | [Văn mới 5 năm đầu thế kỷ](../../../data/book/nhieu-tac-gia-van-moi-5-nam-dau-the-ky.json) | Bản số 41 | 19/01/2025 | - | - |  |
| 5 | [Hạt bụi người bay ngược](../../../data/book/hoa-vang-hat-bui-nguoi-bay-nguoc.json) | S100 | - | - |  |  |
| 6 | [Sắp đặt và diễn](../../../data/book/ho-anh-thai-sap-dat-va-dien.json) | S100 | - | - | - |  |
| 7 | [Viết về bè bạn](../../../data/book/bui-ngoc-tan-viet-ve-be-ban.json) | S100 | - | - | - | |

### S100 New Collection

| STT | Sách | Mã bản | Phát hành | Giá | Hình | Memo |
| --- | --- | --- | --- | ---: | :---: | --- |
| 1 | [Kiêu hãnh và định kiến](../../../data/book/jane-austen-pride-and-prejudice.json) | S100 | 01/06/2019 | 900k |  |  |
| 2 | [Anh em nhà Karamazov](../../../data/book/fyodor-dostoevsky-anh-em-nha-karamazov.json) | S100 | 19/07/2019 | 1tr200k |  |  |
| 3 | [Những ngôi sao Eger](../../../data/book/gardonyi-geza-egri-csillagok.json) | S100 | 01/08/2019 | 1tr |  |  |
| 4 | [Hán Sở diễn nghĩa](../../../data/book/chan-vi-han-so-dien-nghia.json) | S100 | 01/09/2019 | 1tr |  |  |
| 5 | [Bố già](../../../data/book/mario-puzo-the-godfather.json) | S100 | 01/12/2019 | 1tr500k |  |  |
| 6 | [Robinson Crusoe](../../../data/book/daniel-defoe-robinson-crusoe.json) | S100 | 01/01/2020 | 1tr200k |  |  |
| 7 | [Khát vọng sống](../../../data/book/irving-stone-lust-for-life.json) | S100 | 06/03/2020 | 1tr200k |  |  |
| 8 | [Những cuốn sách thay đổi lịch sử](../../../data/book/michael-collins-remarkable-books.json) | S100 | 01/05/2020 | 2tr |  |  |
| 9 | [Thiên hoàng Minh Trị](../../../data/book/donald-keene-emperor-of-japan-meiji-and-his-world-1852-1912.json) | S100 | 20/07/2020 | 1tr500k |  |  |

### Bản "Chữ"

| STT | Sách | Mã bản | Phát hành | Giá | Hình | Memo |
| --- | --- | --- | --- | ---: | :---: | --- |
| 1 | [Đông Dương xinh đẹp và kỳ vĩ](../../../data/book/pierre-dieulefils-indo-chine-pittoresque-monumentale.json) | Bản Chữ A | 24/01/2021 | - |  |  |
| 2 | [Bố già (bản Chữ A da MyQ đỏ)](../../../data/book/mario-puzo-the-godfather.json) | Bản Chữ A | 18/07/2021 | - |  |  |
| 3 | [Việt Nam sử lược (bản chữ A)](../../../data/book/tran-trong-kim-viet-nam-su-luoc.json) | Bản Chữ A | 22/08/2021 | - |  |  |
| 4 | [Cuốn theo chiều gió](../../../data/book/margaret-mitchell-gone-with-the-wind.json) | Bản Chữ A | 20/09/2021 | - |  |  |
| 5 | [Cuốn theo chiều gió](../../../data/book/margaret-mitchell-gone-with-the-wind.json) | Bản Chữ Ô | 20/09/2021 | - |  |  |
| 6 | [Bỉ vỏ](../../../data/book/nguyen-hong-bi-vo.json) | Bản Chữ A | 08/01/2023 | - | - |  |
| 7 | [Chàng ngốc](../../../data/book/fyodor-dostoevsky-chang-ngoc.json) | Bản Chữ A | 08/01/2023 | - | - |  |
| 8 | [Gatsby vĩ đại](../../../data/book/f-scott-fitzgerald-the-great-gatsby.json) | Bản Chữ A | 08/01/2023 | - | - |  |
| 9 | [Một chiến dịch ở Bắc Kỳ](../../../data/book/charles-edouard-hocquard-mot-chien-dich-o-bac-ky.json) | Bản Chữ A | 08/01/2023 | - | - |  |
| 10 | [Napoléon Bonaparte](../../../data/book/adam-zamoyski-napoleon-a-life.json) | Bản Chữ A | 08/01/2023 | - | - |  |
| 11 | [Nghệ nhân và Margarita](../../../data/book/mikhail-bulgacov-nghe-nhan-va-margarita.json) | Bản Chữ A | 08/01/2023 | - | - |  |
| 12 | [Ông già và biển cả](../../../data/book/ernest-hemingway-the-old-man-and-the-sea.json) | Bản Chữ A | 08/01/2023 | - | - |  |
| 13 | [Quo Vadis](../../../data/book/henryk-sienkiewicz-quo-vadis.json) | Bản Chữ A | 08/01/2023 | - | - |  |
| 14 | [Thương nhớ mười hai](../../../data/book/vu-bang-thuong-nho-muoi-hai.json) | Bản Chữ A | 08/01/2023 | - | - |  |
| 15 | [Tội ác và hình phạt](../../../data/book/fyodor-dostoevsky-toi-ac-va-trung-phat.json) | Bản Chữ A | 08/01/2023 | - | - |  |
| 16 | [Truyện cổ Grimm](../../../data/book/jacob-ludwig-karl-grimm-kinder-und-hausmarchen.json) | Bản Chữ A | 08/01/2023 | - | - |  |
| 17 | [Truyện ngắn Nguyễn Huy Thiệp](../../../data/book/nguyen-huy-thiep-truyen-ngan-nguyen-huy-thiep.json) | Bản Chữ A | 08/01/2023 | - | - |  |
| 18 | [Đại Việt sử ký toàn thư](../../../data/book/nhieu-tac-gia-dai-viet-su-ky-toan-thu.json) | Bản Chữ A | 18/01/2025 | - | - |  |
| 19 | [Đôi lứa xứng đôi / Nửa đêm / Cười](../../../data/book/nam-cao-doi-lua-xung-doi-nua-dem-cuoi.json) | Bản Chữ A | 18/01/2025 | - | - |  |
| 20 | [Gió đầu mùa & Hà Nội băm sáu phố phường](../../../data/book/thach-lam-gio-dau-mua-ha-noi-bam-sau-pho-phuong.json) | Bản Chữ A | 18/01/2025 | - | - |  |
| 21 | [Hoàng tử bé](../../../data/book/antoine-de-saint-exupery-le-petit-prince.json) | Bản Chữ A | 18/01/2025 | - | - |  |
| 22 | [Nghệ thuật Dessin](../../../data/book/nguyen-dinh-dang-nghe-thuat-dessin.json) | Bản Chữ A | 18/01/2025 | - | - |  |
| 23 | [Nghìn lẻ một đêm](../../../data/book/antoine-galland-nghin-le-mot-dem.json) | Bản Chữ A | 18/01/2025 | - | - |  |
| 24 | [Ngụ ngôn La Fontaine](../../../data/book/la-fontaine-the-fables-of-la-fontaine.json) | Bản Chữ A | 18/01/2025 | - | - |  |
| 25 | [Số đỏ](../../../data/book/vu-trong-phung-so-do.json) | Bản Chữ A | 18/01/2025 | - | - |  |
| 26 | [Việt Nam văn hóa sử cương](../../../data/book/dao-duy-anh-viet-nam-van-hoa-su-cuong.json) | Bản Chữ A | 18/01/2025 | - | - |  |
| 27 | [Bố già](../../../data/book/mario-puzo-the-godfather.json) | Bản Chữ A | 19/01/2025 | - | - |  |
| 28 | [Con Bim trắng tai đen](../../../data/book/gavriil-troyepolsky-con-bim-trang-tai-den.json) | Bản Chữ A | 19/01/2025 | - | - |  |
| 29 | [Hành Trình Thám Hiểm Đông Dương](../../../data/book/francis-garnier-voyage-dexploration-en-indo-chine.json) | Bản Chữ A | 19/01/2025 | - | - |  |
| 30 | [Lịch sử Việt Nam bằng hình](../../../data/book/dong-a-the-illustrated-history-of-vietnam.json) | Bản Chữ A | 19/01/2025 | - | - |  |
| 31 | [Nhà Thờ Đức Bà Paris](../../../data/book/victor-hugo-notre-dame-de-paris.json) | Bản Chữ A | 19/01/2025 | - | - |  |
| 32 | [Thần khúc](../../../data/book/dante-alighieri-la-divina-commedia.json) | Bản Chữ A | 19/01/2025 | - | - |  |
| 33 | [Truyện Kiều](../../../data/book/nguyen-du-truyen-kieu.json) | Bản Chữ A | 19/01/2025 | - | - |  |
| 34 | [Bách khoa toàn thư biểu tượng và hoa văn Mật Tạng](../../../data/book/robert-beer-the-encyclopedia-of-tibetan-symbols-and-motifs.json) | Bản Chữ A | 25/01/2026 | - |  |  |

### S100 “hậu” New Collection

| STT | Sách | Mã bản | Phát hành | Giá | Hình | Memo |
| --- | --- | --- | --- | ---: | :---: | --- |
| 1 | [Truyện ngắn Nguyễn Huy Thiệp](../../../data/book/nguyen-huy-thiep-truyen-ngan-nguyen-huy-thiep.json) | S100 | 31/01/2021 | 4tr500k |  |  |
| 2 | [Người kép già](../../../data/book/kim-lan-nguoi-kep-gia.json) | S100 (101 bản) | 23/03/2021 | 999k |  |  |
| 3 | [Đảo mộng mơ](../../../data/book/nguyen-nhat-anh-dao-mong-mo.json) | S100 (106 bản) | 08/04/2021 | 1tr900k |  |  |
| 4 | [Việt Nam sử lược](../../../data/book/tran-trong-kim-viet-nam-su-luoc.json) | S100 | 28/05/2021 | - |  |  |
| 5 | [Cuốn theo chiều gió](../../../data/book/margaret-mitchell-gone-with-the-wind.json) | S100 | 09/08/2021 | - |  |  |
| 6 | [Truyện cổ Grimm](../../../data/book/jacob-ludwig-karl-grimm-kinder-und-hausmarchen.json) | S100 | 27/12/2021 | - |  |  |
| 7 | [Napoléon Bonaparte](../../../data/book/adam-zamoyski-napoleon-a-life.json) | S100 | 01/01/2022 | - |  |  |
| 8 | [Nghệ nhân và Margarita](../../../data/book/mikhail-bulgacov-nghe-nhan-va-margarita.json) | S100 | 28/01/2022 | - |  |  |
| 9 | [Tội ác và hình phạt](../../../data/book/fyodor-dostoevsky-toi-ac-va-trung-phat.json) | S100 | 07/04/2022 | - |  |  |
| 10 | [Thương nhớ mười hai](../../../data/book/vu-bang-thuong-nho-muoi-hai.json) | S100 | 28/06/2022 | - |  |  |
| 11 | [Bỉ vỏ](../../../data/book/nguyen-hong-bi-vo.json) | S100 | 09/09/2022 | - |  |  |
| 12 | [Gatsby vĩ đại](../../../data/book/f-scott-fitzgerald-the-great-gatsby.json) | S100 | 10/10/2022 | - |  |  |
| 13 | [Chàng ngốc](../../../data/book/fyodor-dostoevsky-chang-ngoc.json) | S100 | 05/11/2022 | - |  |  |
| 14 | [Ông già và biển cả](../../../data/book/ernest-hemingway-the-old-man-and-the-sea.json) | S100 | 02/12/2022 | - |  |  |
| 15 | [Một chiến dịch ở Bắc Kỳ](../../../data/book/charles-edouard-hocquard-mot-chien-dich-o-bac-ky.json) | S100 | 17/12/2022 | 8tr |  |  |
| 16 | [Số đỏ](../../../data/book/vu-trong-phung-so-do.json) | S100 | 31/01/2023 | 6tr500k |  |  |
| 17 | [Quo Vadis](../../../data/book/henryk-sienkiewicz-quo-vadis.json) | S100 | 20/02/2023 | 6tr500k |  |  |
| 18 | [Hoàng tử bé](../../../data/book/antoine-de-saint-exupery-le-petit-prince.json) | S100 | 03/03/2023 | 4tr200k |  |  |
| 19 | [Nghìn lẻ một đêm](../../../data/book/antoine-galland-nghin-le-mot-dem.json) | S100 | 15/04/2023 | 12tr |  |  |
| 20 | [Việt Nam văn hóa sử cương](../../../data/book/dao-duy-anh-viet-nam-van-hoa-su-cuong.json) | S100 | 26/06/2023 | 5tr |  |  |
| 21 | [Ngụ ngôn La Fontaine](../../../data/book/la-fontaine-the-fables-of-la-fontaine.json) | S100 | 01/08/2023 | 6tr |  |  |
| 22 | [Gió đầu mùa & Hà Nội băm sáu phố phường](../../../data/book/thach-lam-gio-dau-mua-ha-noi-bam-sau-pho-phuong.json) | S100 | 12/10/2023 | 3tr800k |  |  |
| 23 | [Đôi lứa xứng đôi / Nửa đêm / Cười](../../../data/book/nam-cao-doi-lua-xung-doi-nua-dem-cuoi.json) | S100 | 05/11/2023 | 3tr800k |  |  |
| 24 | [Đại Việt sử ký toàn thư](../../../data/book/nhieu-tac-gia-dai-viet-su-ky-toan-thu.json) | S100 | 23/01/2024 | - |  |  |
| 25 | [Nhà thờ Đức Bà Paris](../../../data/book/victor-hugo-notre-dame-de-paris.json) | S100 | 26/05/2024 | 8tr500k |  |  |
| 26 | [Con Bim trắng tai đen](../../../data/book/gavriil-troyepolsky-con-bim-trang-tai-den.json) | S100 | 08/08/2024 | 3tr900k |  |  |
| 27 | [Hành trình thám hiểm Đông Dương](../../../data/book/francis-garnier-voyage-dexploration-en-indo-chine.json) | S100 | 21/11/2024 | 7tr500k |  |  |
| 28 | [Thần khúc](../../../data/book/dante-alighieri-la-divina-commedia.json) | S100 | 06/12/2024 | 11tr |  |  |
| 29 | [Lịch sử Việt Nam bằng hình](../../../data/book/dong-a-the-illustrated-history-of-vietnam.json) | S100 | 26/02/2025 | 11tr |  |  |
| 30 | [Truyện Kiều](../../../data/book/nguyen-du-truyen-kieu.json) | S100 | 25/03/2025 | 11tr |  |  |
| 31 | [Kho tàng truyện cổ tích Việt Nam](../../../data/book/nguyen-dong-chi-kho-tang-truyen-co-tich-viet-nam.json) | S100 (112 bộ) | 08/08/2025 | Bản V: 18tr, bản S: 13tr |  |  |
| 32 | [Văn mới 10 năm 2015 - 2025](../../../data/book/van-moi-10-nam-2015-2025-dong-a.json) | S100 | 05/11/2025 | 3tr |  |  |
| 33 | [Hồ Chí Minh – Tiểu sử bằng hình](../../../data/book/dong-a-ho-chi-minh-tieu-su-bang-hinh.json) | S100 | 01/12/2025 | Bản V: 9tr500k, bản S: 7tr500k |  |  |

### S khác và các ấn bản còn lại

| STT | Sách | Mã bản | Phát hành | Giá | Hình | Memo |
| --- | --- | --- | --- | ---: | :---: | --- |
| 1 | [Bố già](../../../data/book/mario-puzo-the-godfather.json) | S500 | 30/12/2019 | 500k |  |  |
| 2 | [Quo Vadis](../../../data/book/henryk-sienkiewicz-quo-vadis.json) | S500 | 29/07/2020 | 1tr |  |  |
| 3 | [Một chiến dịch ở Bắc Kỳ](../../../data/book/charles-edouard-hocquard-mot-chien-dich-o-bac-ky.json) | S500 | 06/10/2020 | 1tr200k |  |  |
| 4 | [Số đỏ – Bản tri ân](../../../data/book/vu-trong-phung-so-do.json) | Bản Tri Ân | 11/11/2020 | - |  |  |
| 5 | [Số đỏ](../../../data/book/vu-trong-phung-so-do.json) | S500 | 17/11/2020 | 800k |  |  |
| 6 | [Truyện ngắn Nguyễn Huy Thiệp](../../../data/book/nguyen-huy-thiep-truyen-ngan-nguyen-huy-thiep.json) | S500 | 18/12/2020 | 900k |  |  |
| 7 | [Việt Nam sử lược](../../../data/book/tran-trong-kim-viet-nam-su-luoc.json) | S500 | 01/02/2021 | 900k |  |  |
| 8 | [Đông Dương xinh đẹp và kỳ vĩ](../../../data/book/pierre-dieulefils-indo-chine-pittoresque-monumentale.json) | S365 | 24/02/2021 | 3tr |  |  |
| 9 | [Người kép già](../../../data/book/kim-lan-nguoi-kep-gia.json) | S365 | 01/03/2021 | 1tr500k |  |  |
| 10 | [Truyện cổ Grimm](../../../data/book/jacob-ludwig-karl-grimm-kinder-und-hausmarchen.json) | S500 | 28/06/2021 | 2tr200k |  |  |
| 11 | [Cuốn theo chiều gió](../../../data/book/margaret-mitchell-gone-with-the-wind.json) | S365 | 26/07/2021 | 2tr |  |  |
| 12 | [Napoléon Bonaparte](../../../data/book/adam-zamoyski-napoleon-a-life.json) | S500 | 15/09/2021 | 2tr100k |  |  |
| 13 | [Tội ác và hình phạt](../../../data/book/fyodor-dostoevsky-toi-ac-va-trung-phat.json) | S500 | 01/12/2021 | 2tr500k |  |  |
| 14 | [Nghệ nhân và Margarita](../../../data/book/mikhail-bulgacov-nghe-nhan-va-margarita.json) | S1200 | 19/01/2022 | 1tr500k |  |  |
| 15 | [Nghìn lẻ một đêm](../../../data/book/antoine-galland-nghin-le-mot-dem.json) | S895 | 02/04/2022 | 2tr500k |  |  |
| 16 | [Thương nhớ mười hai](../../../data/book/vu-bang-thuong-nho-muoi-hai.json) | S896 | 29/04/2022 | 1tr500k |  |  |
| 17 | [Mahabharata / Sử thi Ấn Độ](../../../data/book/dk-mahabharata-bang-hinh-thien-su-thi-vi-dai-nhat-cua-an-do.json) | S365 | 08/06/2022 | 3tr500k |  |  |
| 18 | [Thần khúc](../../../data/book/dante-alighieri-la-divina-commedia.json) | S1200 | 21/06/2022; 02/02/2023 | 2tr600k |  |  |
| 19 | [Chàng ngốc](../../../data/book/fyodor-dostoevsky-chang-ngoc.json) | S1200 | 30/07/2022 | 1tr |  |  |
| 20 | [Bỉ vỏ](../../../data/book/nguyen-hong-bi-vo.json) | S896 | 25/08/2022 | 1tr500k |  |  |
| 21 | [Gatsby vĩ đại](../../../data/book/f-scott-fitzgerald-the-great-gatsby.json) | S500 | 30/08/2022 | 1tr200k |  |  |
| 22 | [Việt Nam văn hóa sử cương](../../../data/book/dao-duy-anh-viet-nam-van-hoa-su-cuong.json) | S500 | 20/09/2022 | 1tr500k |  |  |
| 23 | [Ông già và biển cả](../../../data/book/ernest-hemingway-the-old-man-and-the-sea.json) | S500 | 29/09/2022 | 1tr200k |  |  |
| 24 | [Nhà thờ Đức Bà Paris](../../../data/book/victor-hugo-notre-dame-de-paris.json) | S500 | 15/10/2022 | 1tr800k |  |  |
| 25 | [Hoàng tử bé](../../../data/book/antoine-de-saint-exupery-le-petit-prince.json) | S500 | 25/10/2022 | 1tr200k |  |  |
| 26 | [Đất tiền đất bạc](../../../data/book/mario-puzo-the-fortunate-pilgrim.json) | S500 | 08/11/2022 | 700k |  |  |
| 27 | [Nghệ thuật Dessin](../../../data/book/nguyen-dinh-dang-nghe-thuat-dessin.json) | S1200 | 17/11/2022 | 1tr400k |  |  |
| 28 | [Ngụ ngôn La Fontaine](../../../data/book/la-fontaine-the-fables-of-la-fontaine.json) | S895 | 11/01/2023 | 2tr400k |  |  |
| 29 | [Dại thì chết](../../../data/book/mario-puzo-fools-die.json) | S500 | 20/02/2023 | 800k |  |  |
| 30 | [Đấu trường u ám](../../../data/book/mario-puzo-the-dark-arena.json) | S500 | 31/03/2023 | 700k |  |  |
| 31 | [Tổng thống K. thứ tư](../../../data/book/mario-puzo-the-fourth-k.json) | S500 | 18/04/2023 | 800k |  |  |
| 32 | [Đôi lứa xứng đôi / Nửa đêm / Cười](../../../data/book/nam-cao-doi-lua-xung-doi-nua-dem-cuoi.json) | S500 | 04/05/2023 | 1tr200k |  |  |
| 33 | [Gió đầu mùa & Hà Nội băm sáu phố phường](../../../data/book/thach-lam-gio-dau-mua-ha-noi-bam-sau-pho-phuong.json) | S500 | 02/06/2023 | 1tr200k |  |  |
| 34 | [Quả dưa đỏ](../../../data/book/nguyen-trong-thuat-qua-dua-do.json) | S365 | 20/06/2023 | 1tr200k |  |  |
| 35 | [Con Bim trắng tai đen](../../../data/book/gavriil-troyepolsky-con-bim-trang-tai-den.json) | S500 | 11/07/2023 | 1tr500k |  |  |
| 36 | [Hành trình thám hiểm Đông Dương](../../../data/book/francis-garnier-voyage-dexploration-en-indo-chine.json) | S365 | 12/08/2023 | 1tr500k |  |  |
| 37 | [Thái Bình Thiên Quốc](../../../data/book/hoang-tieu-phoi-hong-xiu-quan-yan-yi.json) | S365 | 22/09/2023 | 1tr500k |  |  |
| 38 | [Thống khổ & phiêu linh](../../../data/book/irving-stone-the-agony-and-the-ecstasy-a-biographical-novel-of-michelangelo.json) | S365 | 29/10/2023 | 1tr500k |  |  |
| 39 | [Luật im lặng](../../../data/book/mario-puzo-omerta.json) | S500 | 09/01/2024 | 700k |  |  |
| 40 | [Bố già (bản tri ân)](../../../data/book/mario-puzo-the-godfather.json) | S500 | 11/01/2024 | - | - |  |
| 41 | [Đất máu Sicily](../../../data/book/mario-puzo-the-sicilian.json) | S500 | 23/01/2024 | 800k |  |  |
| 42 | [Ông trùm cuối cùng](../../../data/book/mario-puzo-the-last-don.json) | S500 | 23/01/2024 | 800k |  |  |
| 43 | [Cha con Giáo hoàng](../../../data/book/mario-puzo-the-family.json) | S500 | 25/01/2024 | 800k |  |  |
| 44 | [Những trận chiến thay đổi lịch sử](../../../data/book/dk-nhung-tran-chien-thay-doi-lich-su.json) | S365 | 02/05/2024 | 1tr800k |  |  |
| 45 | [Nhà văn: Cuộc đời và tác phẩm](../../../data/book/dk-writers-their-lives-and-works.json) | S365 | 01/07/2024 | 1tr800k |  |  |
| 46 | [Bố già 55 – Bìa da dê](../../../data/book/mario-puzo-the-godfather.json) | GF55 (306 bản) | 27/12/2024 | 3tr500k |  |  |
| 47 | [Bố già 55 – Bìa buckram](../../../data/book/mario-puzo-the-godfather.json) | S276 / BG55 | 27/12/2024 | 1tr500k |  |  |
| 48 | [Kho tàng truyện cổ tích Việt Nam](../../../data/book/nguyen-dong-chi-kho-tang-truyen-co-tich-viet-nam.json) | S365 | 02/06/2025 | 3tr |  |  |
| 49 | [Bách khoa toàn thư biểu tượng và hoa văn Mật Tạng](../../../data/book/robert-beer-the-encyclopedia-of-tibetan-symbols-and-motifs.json) | S500 | 05/08/2025 | Vải xanh: 1tr200k; Buckram: 3tr900k |  |  |
| 50 | [Hồ Chí Minh – Tiểu sử bằng hình](../../../data/book/dong-a-ho-chi-minh-tieu-su-bang-hinh.json) | S500 | 15/10/2025 | 2tr |  |  |
| 51 | [60 bí quyết vẽ sơn dầu](../../../data/book/nguyen-dinh-dang-60-bi-quyet-ve-son-dau.json) | S500 | 16/03/2026 | 1tr200k |  |  |
| 52 | [Trần Tiến – Người hát thơ mình](../../../data/book/tran-tien-tran-tien-nguoi-hat-tho-minh-ca-khuc-nhung-cau-chuyen.json) | S365 | 20/04/2026 | 2500k |  |  |
| 53 | [Những tầng ký ức](../../../data/book/tran-dai-thang-layers-of-memory.json) | S365 | 16/05/2026 | 2tr6 |  |  |
| 54 | [Đại Việt sử ký toàn thư](../../../data/book/nhieu-tac-gia-dai-viet-su-ky-toan-thu.json) | S895 | 22/07/2026 | Bìa da thật: 6tr; Bìa buckram: 5tr |  |  |
| 55 | [Bố già](../../../data/book/mario-puzo-the-godfather.json) | S500 | 26/07/2026 | 2tr400k |  |  |
| 56 | [Lục Vân Tiên](../../../data/book/nguyen-dinh-chieu-luc-van-tien.json) | S500 | 26/07/2026 | 2tr200k |  |  |
| 57 | [Thép đã tôi thế đấy](../../../data/book/nikolai-alekseyevich-ostrovsky-how-the-steel-was-tempered.json) | S500 | 26/07/2026 | 2tr300k |  |  |
| 58 | [Truyện Kiều](../../../data/book/nguyen-du-truyen-kieu.json) | S500 | 26/07/2026 | 2tr200k |  |  |
| 59 | [Anh hùng ca Odyssée](../../../data/book/homere-odyssee.json) | S365 | 15/08/2026 | 2tr500k |  |  |
| 60 | [Khâm định Việt sử thông giám cương mục](../../../data/book/quoc-su-quan-trieu-nguyen-kham-dinh-viet-su-thong-giam-cuong-muc.json) | S365 | 18/11/2026 | 3tr900k |  |  |
| 61 | [Bố già (kỷ niệm 20 năm thành lập Đông A)](../../../data/book/mario-puzo-the-godfather.json) | - | - | - | - | Bìa buckram, hai màu vàng và đỏ. Chờ bổ sung thông tin. |

### Sách Tết

| STT | Sách | Mã bản | Phát hành | Giá | Hình | Memo |
| --- | --- | --- | --- | ---: | :---: | --- |
| 1 | [Sách Tết Kỷ Hợi 2019](../../../data/book/ho-anh-thai-sach-tet-ky-hoi-2019.json) | S100 | 10/01/2019 | 1200k |  |  |
| 2 | [Sách Tết Canh Tý 2020](../../../data/book/ho-anh-thai-sach-tet-canh-ty-2020.json) | S100 | 06/01/2020 | 888k |  |  |
| 3 | [Sách Tết Tân Sửu 2021](../../../data/book/ho-anh-thai-sach-tet-tan-suu-2021.json) | S365 | 05/01/2021 | 999k |  |  |
| 4 | [Sách Tết Nhâm Dần 2022](../../../data/book/ho-anh-thai-sach-tet-nham-dan-2022.json) | S500 | 29/12/2021 | 1100k |  |  |
| 5 | [Sách Tết Quý Mão 2023](../../../data/book/ho-anh-thai-sach-tet-quy-mao-2023.json) | S500 | 23/12/2022 | 1200k |  |  |
| 6 | [Sách Tết Giáp Thìn 2024](../../../data/book/ho-anh-thai-sach-tet-giap-thin-2024.json) | S500 | 05/01/2024 | 1200k |  |  |
| 7 | [Sách Tết Ất Tỵ 2025](../../../data/book/ho-anh-thai-sach-tet-at-ty-2025.json) | Ấn Bản Giới Hạn | 02/01/2025 | 1300k |  |  |
| 8 | [Sách Tết Bính Ngọ 2026](../../../data/book/ho-anh-thai-sach-tet-binh-ngo-2026.json) | Ấn Bản Giới Hạn | 05/01/2026 | 1400k |  |  |

### Trăm năm Nobel

| STT | Sách | Mã bản | Phát hành | Giá | Hình | Memo |
| --- | --- | --- | --- | ---: | :---: | --- |
| 1 | [Thi khúc & Thi phẩm](../../../data/book/sully-prudhomme-thi-khuc-thi-pham.json) | Ấn Bản Giới Hạn | 15/11/2021 | 1tr1 |  |  |
| 2 | [Tội ác của Sylvestre Bonnard & Đảo chim cánh cụt](../../../data/book/anatole-france-toi-ac-cua-sylvestre-bonnard-dao-chim-canh-cut.json) | Ấn Bản Giới Hạn | 01/12/2021 | 1tr500k |  |  |
| 3 | [Tuyển tập kịch Jacinto Benavente](../../../data/book/jacinto-benavente-tuyen-tap-kich-jacinto-benavente.json) | Ấn Bản Giới Hạn | 28/10/2022 | 1tr |  |  |
| 4 | [Lịch sử La Mã - Tập I (Quyển I – II)](../../../data/book/theodor-mommsen-the-history-of-rome-vol-1.json) | Ấn Bản Giới Hạn | 15/11/2022 | 1tr200k |  |  |
| 5 | [Tuyển tập thơ William Butler Yeats](../../../data/book/william-butler-yeats-tuyen-tap-tho-william-butler-yeats.json) | Ấn Bản Giới Hạn | 16/12/2023 | 1tr |  |  |
| 6 | [Bí mật của Synnøve / Chuyện tình chàng Arne / Cậu trai vui vẻ](../../../data/book/bjrnstjerne-bjrnson-bi-mat-cua-synnve-chuyen-tinh-chang-arne-cau-trai-vui-ve-cua-bjrnstjerne-bjrnson.json) | Ấn Bản Giới Hạn | 29/12/2023 | 1tr |  |  |
| 7 | [Lịch sử La Mã - Tập II (Quyển III)](../../../data/book/theodor-mommsen-the-history-of-rome-vol-3.json) | Ấn Bản Giới Hạn | 28/05/2024 | 1tr200k |  |  |
| 8 | [Nông dân (2 tập)](../../../data/book/wadysaw-stanisaw-reymont-nong-dan.json) | Ấn Bản Giới Hạn | 30/12/2024 | 2tr |  |  |
| 9 | [Điên rồ hay thần thánh](../../../data/book/jose-echegaray-dien-ro-hay-than-thanh.json) | Ấn Bản Giới Hạn | 19/01/2025 | 1tr |  |  |
| 10 | [Nàng Mireille](../../../data/book/frederic-mistral-nang-mireille.json) | Ấn Bản Giới Hạn | 19/01/2025 | 800k |  |  |
| 11 | [Pygmalion](../../../data/book/george-bernard-shaw-pygmalion.json) | Ấn Bản Giới Hạn | 31/12/2025 | 600k |  |  |
| 12 | [Bộ ba nhỏ – Lão bộc, Hania, Selim Mirza](../../../data/book/henryk-sienkiewicz-lao-boc-hania-selim-mirza.json) | Ấn Bản Giới Hạn | 31/12/2025 | 900k |  |  |
| 13 | [Tụng ca man dã](../../../data/book/giosue-carducci-tung-ca-man-da.json) | Ấn Bản Giới Hạn | Sắp phát hành | - | - |  |
| 14 | [Cành sậy trước gió](../../../data/book/grazia-deledda-canne-al-vento.json) | Ấn Bản Giới Hạn | Sắp phát hành | - | - |  |
