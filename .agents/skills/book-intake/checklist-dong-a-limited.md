# Checklist ấn bản Đông A

Đối chiếu hồ sơ trong `data/book/*.json` ngày 08/11/2026; bổ sung danh sách 25 tựa bản chữ A do người dùng cung cấp ngày 12/11/2026.

- **Có:** `☑` là đã có hồ sơ tựa sách và liên kết tới JSON; `☐` là chưa có hồ sơ. Dấu này không xác nhận đã có đúng edition của mã bản trong dòng.
- **Mã bản:** giữ mã hoặc tên edition đang theo dõi (độc bản A, cao cấp, phổ thông…); mã chưa khớp dữ liệu được nêu trong Memo. Chỉ ghép edition có căn cứ từ caption, số lượng hoặc dải đánh số; không lấy bản phổ thông hay edition của đơn vị khác để điền thay.
- **Phát hành:** lấy `pub_date` của đúng edition, hiển thị ngày/tháng/năm; thiếu key, `null` hoặc chưa xác định đúng edition thì ghi `Thiếu`. Riêng 25 tựa bản chữ A trong danh sách người dùng cung cấp, được ghi năm ở dạng `YYYY` khi chỉ biết năm; giữ ngày đầy đủ nếu đã có trong đúng edition. Không tự bổ sung ngày/tháng hoặc lấy năm của bản S100/S500 thay cho bản chữ A.
- **Giá:** chép nguyên giá trị `cover_price` đã lưu, kể cả cách ghi cũ như `2500k` hoặc `2tr6`; không quy đổi hoặc tự chuẩn hóa. Chưa có đúng edition hoặc giá rỗng thì ghi `Thiếu`. Một dòng có nhiều edition cùng mã ghi rõ giá theo từng hình thức.
- **Hình:** ghi `Thiếu` khi `gellery_imgs` rỗng hoặc chưa có đúng edition để đối chiếu; có gallery thì để trống. Thumbnail không thay cho gallery. Đây chỉ là trạng thái theo dõi, không phải yêu cầu tự tải thêm ảnh hoặc tạo gallery; một ảnh đầu vào được phép chỉ có thumbnail.
- **Memo:** chỉ giữ thông tin còn cần xác nhận/collect; mốc thời gian và giá cũ chưa có trong đúng edition được giữ làm dữ kiện cần đối chiếu. Dữ kiện đã đủ/đúng thì bỏ Memo, không ghi lịch sử xử lý hoặc trạng thái kỹ thuật.

Có **143 dòng theo dõi**, tương ứng **82 tựa/tập sách** sau khi gộp các ấn bản cùng tựa: **111 dòng đã có hồ sơ tựa**, **32 dòng chưa tìm thấy hồ sơ**. Tập I và Tập II của Lịch sử La Mã được tính riêng; mục Tập I còn cần xác nhận.

Các dòng Bố già liên kết cùng một hồ sơ tác phẩm; mỗi dòng đối chiếu edition riêng. Dòng Đại Việt sử ký toàn thư – S895 có hai edition (bìa da thật và bìa buckram).

Danh sách bản chữ A gồm **25 tựa**: **4 tựa năm 2021**, **12 tựa năm 2023**, **9 tựa năm 2024**. Năm này áp dụng riêng cho bản chữ A; các edition S100/S500 được đối chiếu độc lập. Người dùng xác nhận “Tuyển truyện Thạch Lam” là “Gió đầu mùa & Hà Nội băm sáu phố phường”, “Tuyển truyện Nam Cao” là “Đôi lứa xứng đôi / Nửa đêm / Cười”; các dòng bản chữ A liên kết cùng hồ sơ tương ứng.

## Danh sách đối chiếu

Sắp theo tên sách (A–Z tiếng Việt), rồi mã edition tăng dần trong cùng tựa; các dòng cùng mã giữ thứ tự tương đối.

| STT | Có | Sách | Mã bản | Phát hành | Giá | Hình | Memo |
| --- | :---: | --- | --- | --- | ---: | :---: | --- |
| 1 | ☑ | [60 bí quyết vẽ sơn dầu](../../../data/book/nguyen-dinh-dang-60-bi-quyet-ve-son-dau.json) | S500 | 16/03/2026 | 1tr200k |  |  |
| 2 | ☑ | [Anh em nhà Karamazov](../../../data/book/fyodor-dostoevsky-anh-em-nha-karamazov.json) | S100 | 01/07/2019 | 1tr200k |  |  |
| 3 | ☑ | [Anh hùng ca Odyssée](../../../data/book/homere-odyssee.json) | S365 | 15/08/2026 | 2tr500k |  |  |
| 4 | ☑ | [Bách khoa toàn thư biểu tượng và hoa văn Mật Tạng](../../../data/book/robert-beer-the-encyclopedia-of-tibetan-symbols-and-motifs.json) | S500 | 05/08/2025 | Vải xanh: 1tr200k; Buckram vàng ký trực tiếp: 3tr900k |  |  |
| 5 | ☑ | [Bí mật của Synnøve / Chuyện tình chàng Arne / Cậu trai vui vẻ](../../../data/book/bjrnstjerne-bjrnson-bi-mat-cua-synnve-chuyen-tinh-chang-arne-cau-trai-vui-ve-cua-bjrnstjerne-bjrnson.json) | S1200 | 29/12/2023 | 1tr |  |  |
| 6 | ☑ | [Bỉ vỏ](../../../data/book/nguyen-hong-bi-vo.json) | Bản Chữ A | 08/01/2023 | Thiếu | Thiếu | |
| 7 | ☑ | [Bỉ vỏ](../../../data/book/nguyen-hong-bi-vo.json) | S100 | 09/09/2022 | Thiếu |  |  |
| 8 | ☑ | [Bỉ vỏ](../../../data/book/nguyen-hong-bi-vo.json) | S896 | 25/08/2022 | 1tr500k |  |  |
| 9 | ☑ | [Bố già 55 – Bìa da dê](../../../data/book/mario-puzo-the-godfather.json) | GF55 (306 bản) | 27/12/2024 | 3tr500k |  |  |
| 10 | ☑ | [Bố già](../../../data/book/mario-puzo-the-godfather.json) | Bản Chữ A | 2021 | Thiếu | Thiếu | Chưa có bản chữ A; cần bổ sung ngày/tháng phát hành, giá, ảnh và quy cách. |
| 11 | ☑ | [Bố già](../../../data/book/mario-puzo-the-godfather.json) | S100 | Thiếu | Thiếu | Thiếu | Chưa có bản S100. |
| 12 | ☑ | [Bố già 55 – Bìa buckram](../../../data/book/mario-puzo-the-godfather.json) | S276 / BG55 | 27/12/2024 | 1tr500k |  |  |
| 13 | ☑ | [Bố già](../../../data/book/mario-puzo-the-godfather.json) | S500 | 30/12/2019 | 500k |  |  |
| 14 | ☑ | [Bố già (bản tri ân)](../../../data/book/mario-puzo-the-godfather.json) | S500 | 11/01/2024 | Thiếu | Thiếu | Quà tặng kèm combo, không bán lẻ. Chưa rõ số lượng in thực tế. |
| 15 | ☑ | [Bố già](../../../data/book/mario-puzo-the-godfather.json) | S500 | 26/07/2026 | 2tr400k |  |  |
| 16 | ☑ | [Cha con Giáo hoàng](../../../data/book/mario-puzo-the-family.json) | S500 | Thiếu | 800k |  | Cần xác nhận mã S500 và bổ sung print_run/copy_numbering; detail ghi 500 bản DA 001–DA 500. Cần đối chiếu năm 2023/2024. Cần đối chiếu nguồn cũ: mốc 01/2024. |
| 17 | ☑ | [Chàng ngốc](../../../data/book/fyodor-dostoevsky-chang-ngoc.json) | Bản Chữ A | 08/01/2023 | Thiếu | Thiếu |  |
| 18 | ☑ | [Chàng ngốc](../../../data/book/fyodor-dostoevsky-chang-ngoc.json) | S100 | 05/11/2022 | Thiếu |  | Cần bổ sung giá S100 |
| 19 | ☐ | Chàng ngốc | S1200 | Thiếu | Thiếu | Thiếu | Cần nhập hồ sơ. Cần đối chiếu nguồn cũ: mốc 07/2022, giá 2.000.000đ. |
| 20 | ☑ | [Con Bim trắng tai đen](../../../data/book/gavriil-troyepolsky-con-bim-trang-tai-den.json) | S100 | 08/08/2024 | 3tr900k |  |  |
| 21 | ☑ | [Con Bim trắng tai đen](../../../data/book/gavriil-troyepolsky-con-bim-trang-tai-den.json) | S365 | Thiếu | Thiếu | Thiếu | Chưa có bản S365. Cần xác nhận mã S365/S500 hoặc hai ấn bản riêng. Cần đối chiếu nguồn cũ: mốc 07/2023, giá 1.500.000đ. |
| 22 | ☐ | Cuốn theo chiều gió | Bản Chữ A | 2021 | Thiếu | Thiếu | Cần nhập hồ sơ bản chữ A; bổ sung ngày/tháng phát hành, giá, ảnh và quy cách. |
| 23 | ☐ | Cuốn theo chiều gió | S100 | Thiếu | Thiếu | Thiếu | Cần nhập hồ sơ. |
| 24 | ☐ | Cuốn theo chiều gió | S365 | Thiếu | Thiếu | Thiếu | Cần nhập hồ sơ. Cần đối chiếu nguồn cũ: mốc 07/2021, giá 2.000.000đ. |
| 25 | ☑ | [Dại thì chết](../../../data/book/mario-puzo-fools-die.json) | S500 | Thiếu | Thiếu | Thiếu | Chưa có bản S500. Cần đối chiếu nguồn cũ: mốc 02/2023, giá 800.000đ. |
| 26 | ☑ | [Đại Việt sử ký toàn thư](../../../data/book/nhieu-tac-gia-dai-viet-su-ky-toan-thu.json) | Bản Chữ A | 2024 | Thiếu | Thiếu | Chưa có bản chữ A; cần bổ sung ngày/tháng phát hành, giá, ảnh và quy cách. |
| 27 | ☑ | [Đại Việt sử ký toàn thư](../../../data/book/nhieu-tac-gia-dai-viet-su-ky-toan-thu.json) | S100 | Thiếu | Thiếu | Thiếu | Chưa có bản S100; cần xác nhận năm phát hành. |
| 28 | ☑ | [Đại Việt sử ký toàn thư](../../../data/book/nhieu-tac-gia-dai-viet-su-ky-toan-thu.json) | S895 | Thiếu | Bìa da thật: 6tr; Bìa buckram: 5tr |  | Cần đối chiếu nguồn cũ: mốc 07/2026. |
| 29 | ☑ | [Đảo mộng mơ](../../../data/book/nguyen-nhat-anh-dao-mong-mo.json) | S100 | Thiếu | Thiếu | Thiếu | Chưa có bản S100. |
| 30 | ☑ | [Đất máu Sicily](../../../data/book/mario-puzo-the-sicilian.json) | S500 | Thiếu | 800k |  | Cần đối chiếu năm 2023 trong JSON với năm 2024 trong danh sách cũ. Cần đối chiếu nguồn cũ: mốc 01/2024. |
| 31 | ☐ | Đất tiền đất bạc | S500 | Thiếu | Thiếu | Thiếu | Cần nhập hồ sơ. Cần đối chiếu nguồn cũ: mốc 11/2022, giá 700.000đ. |
| 32 | ☐ | Đấu trường u ám | S500 | Thiếu | Thiếu | Thiếu | Cần nhập hồ sơ. Cần đối chiếu nguồn cũ: mốc 03/2023, giá 700.000đ. |
| 33 | ☑ | [Đôi lứa xứng đôi / Nửa đêm / Cười](../../../data/book/nam-cao-doi-lua-xung-doi-nua-dem-cuoi.json) | Bản Chữ A | 18/01/2025 | Thiếu | Thiếu | Thiếu giá, ISBN, số trang và khối lượng. |
| 34 | ☑ | [Đôi lứa xứng đôi / Nửa đêm / Cười](../../../data/book/nam-cao-doi-lua-xung-doi-nua-dem-cuoi.json) | S100 | Thiếu | Thiếu | Thiếu | Chưa có bản S100. |
| 35 | ☑ | [Đôi lứa xứng đôi / Nửa đêm / Cười](../../../data/book/nam-cao-doi-lua-xung-doi-nua-dem-cuoi.json) | S500 | Thiếu | Thiếu | Thiếu | Chưa có bản S500. Cần đối chiếu nguồn cũ: mốc 05/2023, giá 1.200.000đ. |
| 36 | ☐ | Đông Dương xinh đẹp và kỳ vĩ | Bản Chữ A | 2021 | Thiếu | Thiếu | Cần nhập hồ sơ. |
| 37 | ☐ | Đông Dương xinh đẹp và kỳ vĩ | Phổ thông | Thiếu | Thiếu | Thiếu | Cần nhập hồ sơ. |
| 38 | ☐ | Đông Dương xinh đẹp và kỳ vĩ | S365 | Thiếu | Thiếu | Thiếu | Cần nhập hồ sơ. Cần đối chiếu nguồn cũ: mốc 02/2021, giá 3.000.000đ. |
| 39 | ☑ | [Gatsby vĩ đại](../../../data/book/f-scott-fitzgerald-the-great-gatsby.json) | Bản Chữ A | 08/01/2023 | Thiếu | Thiếu | |
| 40 | ☑ | [Gatsby vĩ đại](../../../data/book/f-scott-fitzgerald-the-great-gatsby.json) | S100 | 10/10/2022 | Thiếu |  | Cần bổ sung giá, ISBN, số trang, trọng lượng và dải đánh số. |
| 41 | ☑ | [Gatsby vĩ đại](../../../data/book/f-scott-fitzgerald-the-great-gatsby.json) | S500 | 30/08/2022 | 1tr200k |  | Thiếu ISBN riêng và khối lượng. |
| 42 | ☑ | [Gió đầu mùa & Hà Nội băm sáu phố phường](../../../data/book/thach-lam-gio-dau-mua-ha-noi-bam-sau-pho-phuong.json) | Bản Chữ A | 18/01/2025 | Thiếu | Thiếu | Thiếu giá, ISBN, số trang và khối lượng. |
| 43 | ☑ | [Gió đầu mùa & Hà Nội băm sáu phố phường](../../../data/book/thach-lam-gio-dau-mua-ha-noi-bam-sau-pho-phuong.json) | S100 | Thiếu | Thiếu | Thiếu | Chưa có bản S100. |
| 44 | ☑ | [Gió đầu mùa & Hà Nội băm sáu phố phường](../../../data/book/thach-lam-gio-dau-mua-ha-noi-bam-sau-pho-phuong.json) | S500 | Thiếu | Thiếu | Thiếu | Chưa có bản S500. Cần đối chiếu nguồn cũ: mốc 06/2023, giá 1.200.000đ. |
| 45 | ☐ | Hán Sở diễn nghĩa | S100 | Thiếu | Thiếu | Thiếu | Cần nhập hồ sơ. |
| 46 | ☐ | Hành trình thám hiểm Đông Dương | Phổ thông | Thiếu | Thiếu | Thiếu | Cần nhập hồ sơ. |
| 47 | ☐ | Hành trình thám hiểm Đông Dương | S100 | Thiếu | Thiếu | Thiếu | Cần nhập hồ sơ. |
| 48 | ☐ | Hành trình thám hiểm Đông Dương | S365 | Thiếu | Thiếu | Thiếu | Cần nhập hồ sơ. Cần đối chiếu nguồn cũ: mốc 08/2023, giá 1.500.000đ. |
| 49 | ☐ | Hạt bụi người bay ngược | Chưa cung cấp | Thiếu | Thiếu | Thiếu | Cần nhập hồ sơ. Cần xác nhận mã bản. |
| 50 | ☑ | [Hoàng tử bé](../../../data/book/antoine-de-saint-exupery-le-petit-prince.json) | Bản Chữ A | 18/01/2025 | Thiếu | Thiếu |  |
| 51 | ☑ | [Hoàng tử bé](../../../data/book/antoine-de-saint-exupery-le-petit-prince.json) | S100 | 03/03/2023 | 4tr200k |  | Cần bổ sung số trang. |
| 52 | ☑ | [Hoàng tử bé](../../../data/book/antoine-de-saint-exupery-le-petit-prince.json) | S500 | Thiếu | Thiếu | Thiếu | Chưa có bản S500. Cần đối chiếu nguồn cũ: mốc 10/2022, giá 1.200.000đ. |
| 53 | ☑ | [Hồ Chí Minh – Tiểu sử bằng hình](../../../data/book/dong-a-ho-chi-minh-tieu-su-bang-hinh.json) | S500 | Thiếu | 2tr |  | Cần đối chiếu nguồn cũ: mốc 10/2025. |
| 54 | ☑ | [Khát vọng sống](../../../data/book/irving-stone-lust-for-life.json) | S100 | Thiếu | Thiếu | Thiếu | Chưa có bản S100. |
| 55 | ☑ | [Khâm định Việt sử thông giám cương mục](../../../data/book/quoc-su-quan-trieu-nguyen-kham-dinh-viet-su-thong-giam-cuong-muc.json) | S365 | 16/11/2026 | 3tr900k |  |  |
| 56 | ☑ | [Kho tàng truyện cổ tích Việt Nam](../../../data/book/nguyen-dong-chi-kho-tang-truyen-co-tich-viet-nam.json) | S365 | Thiếu | Thiếu | Thiếu | Chưa có bản S365. Cần đối chiếu nguồn cũ: mốc 05/2025, giá 3.000.000đ. |
| 57 | ☐ | Kiêu hãnh và định kiến | S100 | Thiếu | Thiếu | Thiếu | Cần nhập hồ sơ. |
| 58 | ☑ | [Lịch sử La Mã](../../../data/book/theodor-mommsen-the-history-of-rome-vol-1.json) | Chưa cung cấp | Thiếu | 1200k |  | Cần xác nhận dòng này là Tập I và bổ sung mã bản. |
| 59 | ☑ | [Lịch sử La Mã – Tập II](../../../data/book/theodor-mommsen-the-history-of-rome-vol-3.json) | Chưa cung cấp | Thiếu | 1200k |  | Cần xác nhận mã bản của edition Tập II (Quyển III) hiện có. |
| 60 | ☑ | [Luật im lặng](../../../data/book/mario-puzo-omerta.json) | S500 | Thiếu | 700k |  | Cần đối chiếu năm 2023 trong JSON với năm 2024 trong danh sách cũ. Cần đối chiếu nguồn cũ: mốc 01/2024. |
| 61 | ☑ | [Lục Vân Tiên](../../../data/book/nguyen-dinh-chieu-luc-van-tien.json) | S500 | Thiếu | 2tr200k |  | Cần đối chiếu nguồn cũ: mốc 26/07/2026. |
| 62 | ☑ | [Mahabharata / Sử thi Ấn Độ](../../../data/book/dk-mahabharata-bang-hinh-thien-su-thi-vi-dai-nhat-cua-an-do.json) | S365 | Thiếu | Thiếu | Thiếu | Chưa có bản S365; hồ sơ hiện có bản phổ thông Đông A 2021. Cần đối chiếu nguồn cũ: mốc 06/2022, giá 3.500.000đ. |
| 63 | ☑ | [Một chiến dịch ở Bắc Kỳ](../../../data/book/charles-edouard-hocquard-mot-chien-dich-o-bac-ky.json) | Bản Chữ A | 08/01/2023 | Thiếu | Thiếu |  |
| 64 | ☑ | [Một chiến dịch ở Bắc Kỳ](../../../data/book/charles-edouard-hocquard-mot-chien-dich-o-bac-ky.json) | Bìa cứng áo ôm (phổ thông + cao cấp) | 18/05/2020 | 320k |  |  |
| 66 | ☑ | [Một chiến dịch ở Bắc Kỳ](../../../data/book/charles-edouard-hocquard-mot-chien-dich-o-bac-ky.json) | S100 | 17/12/2022 | 8tr |  |  |
| 67 | ☑ | [Một chiến dịch ở Bắc Kỳ](../../../data/book/charles-edouard-hocquard-mot-chien-dich-o-bac-ky.json) | S500 | 06/10/2020 | 1tr200k |  |  |
| 68 | ☑ | [Napoléon Bonaparte](../../../data/book/adam-zamoyski-napoleon-a-life.json) | Bản Chữ A | 08/01/2023 | Thiếu | Thiếu |  |
| 69 | ☐ | Napoléon Bonaparte | S100 | Thiếu | Thiếu | Thiếu | Cần nhập hồ sơ. |
| 70 | ☑ | [Napoléon Bonaparte](../../../data/book/adam-zamoyski-napoleon-a-life.json) | S500 | 15/09/2021 | 2tr100k |  |  |
| 71 | ☑ | [Nghệ nhân và Margarita](../../../data/book/mikhail-bulgacov-nghe-nhan-va-margarita.json) | Bản Chữ A | 08/01/2023 | Thiếu | Thiếu |  |
| 72 | ☑ | [Nghệ nhân và Margarita](../../../data/book/mikhail-bulgacov-nghe-nhan-va-margarita.json) | S100 | 28/01/2022 | Thiếu |  |  |
| 73 | ☑ | [Nghệ nhân và Margarita](../../../data/book/mikhail-bulgacov-nghe-nhan-va-margarita.json) | S1200 | 19/01/2022 | 1tr500k |  |  |
| 74 | ☑ | [Nghệ thuật Dessin](../../../data/book/nguyen-dinh-dang-nghe-thuat-dessin.json) | Bản Chữ A | 2024 | Thiếu | Thiếu | Chưa có bản chữ A; cần bổ sung ngày/tháng phát hành, giá, ảnh và quy cách. |
| 75 | ☑ | [Nghệ thuật Dessin](../../../data/book/nguyen-dinh-dang-nghe-thuat-dessin.json) | S1200 | 17/11/2022 | 1tr400k |  |  |
| 76 | ☑ | [Nghìn lẻ một đêm](../../../data/book/antoine-galland-nghin-le-mot-dem.json) | Bản Chữ A | 2024 | Thiếu | Thiếu | Chưa có bản chữ A; cần bổ sung ngày/tháng phát hành, giá, ảnh và quy cách. |
| 77 | ☑ | [Nghìn lẻ một đêm](../../../data/book/antoine-galland-nghin-le-mot-dem.json) | S100 | 15/04/2023 | 12tr |  | Cần bổ sung NXB, ISBN, số trang, khối lượng và dải đánh số. |
| 78 | ☑ | [Nghìn lẻ một đêm](../../../data/book/antoine-galland-nghin-le-mot-dem.json) | S896 | Thiếu | Thiếu | Thiếu | Chưa có bản S896. Cần xác nhận mã: S895 hay S896. Cần đối chiếu nguồn cũ: mốc 04/2022, giá 2.500.000đ. |
| 79 | ☑ | [Ngụ ngôn La Fontaine](../../../data/book/la-fontaine-the-fables-of-la-fontaine.json) | Bản Chữ A | 2024 | Thiếu | Thiếu | Chưa có bản chữ A; cần bổ sung ngày/tháng phát hành, giá, ảnh và quy cách. |
| 80 | ☑ | [Ngụ ngôn La Fontaine](../../../data/book/la-fontaine-the-fables-of-la-fontaine.json) | S100 | 01/08/2023 | 6tr |  |  |
| 81 | ☑ | [Ngụ ngôn La Fontaine](../../../data/book/la-fontaine-the-fables-of-la-fontaine.json) | S895 | 11/01/2023 | 2tr400k |  |  |
| 82 | ☑ | [Người kép già](../../../data/book/kim-lan-nguoi-kep-gia.json) | S100 | Thiếu | Thiếu | Thiếu | Chưa có bản S100. |
| 83 | ☑ | [Người kép già](../../../data/book/kim-lan-nguoi-kep-gia.json) | S365 | Thiếu | Thiếu | Thiếu | Chưa có bản S365. Cần đối chiếu nguồn cũ: mốc 03/2021, giá 1.500.000đ. |
| 84 | ☐ | Nhà thờ Đức Bà Paris | S100 | Thiếu | Thiếu | Thiếu | Cần nhập hồ sơ. |
| 85 | ☐ | Nhà thờ Đức Bà Paris | S500 | Thiếu | Thiếu | Thiếu | Cần nhập hồ sơ. Cần đối chiếu nguồn cũ: mốc 10/2022, giá 1.800.000đ. |
| 86 | ☐ | Nhà văn / Cuộc đời và tác phẩm | S365 | Thiếu | Thiếu | Thiếu | Cần nhập hồ sơ. Cần đối chiếu nguồn cũ: mốc 07/2024, giá 1.800.000đ. |
| 87 | ☑ | [Những cuốn sách thay đổi lịch sử](../../../data/book/michael-collins-remarkable-books.json) | S100 | Thiếu | Thiếu | Thiếu | Chưa có bản S100. |
| 88 | ☐ | Những ngôi sao Eger | S100 | Thiếu | Thiếu | Thiếu | Cần nhập hồ sơ. |
| 89 | ☑ | [Những tầng ký ức](../../../data/book/tran-dai-thang-layers-of-memory.json) | S365 | Thiếu | 2tr6 |  | Cần đối chiếu nguồn cũ: mốc 05/2026. |
| 90 | ☑ | [Những trận chiến thay đổi lịch sử](../../../data/book/dk-nhung-tran-chien-thay-doi-lich-su.json) | S365 | Thiếu | Thiếu | Thiếu | Chưa có bản S365. Cần đối chiếu nguồn cũ: mốc 04/2024, giá 1.800.000đ. |
| 91 | ☑ | [Ông già và biển cả](../../../data/book/ernest-hemingway-the-old-man-and-the-sea.json) | Bản Chữ A | 08/01/2023 | Thiếu | Thiếu |  |
| 92 | ☑ | [Ông già và biển cả](../../../data/book/ernest-hemingway-the-old-man-and-the-sea.json) | S100 | 02/12/2022 | Thiếu |  | Cần bổ sung giá S100, ISBN, số trang, khối lượng và dải đánh số. |
| 93 | ☑ | [Ông già và biển cả](../../../data/book/ernest-hemingway-the-old-man-and-the-sea.json) | S500 | Thiếu | Thiếu | Thiếu | Chưa có bản Đông A S500. Cần đối chiếu nguồn cũ: mốc 09/2022, giá 1.200.000đ. |
| 94 | ☑ | [Ông trùm cuối cùng](../../../data/book/mario-puzo-the-last-don.json) | S500 | Thiếu | Thiếu | Thiếu | Chưa có bản S500. Cần đối chiếu nguồn cũ: mốc 01/2024, giá 800.000đ. |
| 95 | ☑ | [Quả dưa đỏ](../../../data/book/nguyen-trong-thuat-qua-dua-do.json) | S365 | Thiếu | Thiếu | Thiếu | Chưa có bản S365. Cần đối chiếu nguồn cũ: mốc 06/2023, giá 1.200.000đ. |
| 96 | ☑ | [Quo Vadis](../../../data/book/henryk-sienkiewicz-quo-vadis.json) | Bản Chữ A | 08/01/2023 | Thiếu | Thiếu |  |
| 97 | ☑ | [Quo Vadis](../../../data/book/henryk-sienkiewicz-quo-vadis.json) | S100 | Thiếu | Thiếu | Thiếu | Chưa có bản S100. |
| 98 | ☑ | [Quo Vadis](../../../data/book/henryk-sienkiewicz-quo-vadis.json) | S500 | 29/07/2020 | 1tr |  |  |
| 99 | ☐ | Robinson Crusoe | S100 | Thiếu | Thiếu | Thiếu | Cần nhập hồ sơ. |
| 100 | ☑ | [Sách Tết Canh Tý 2020](../../../data/book/ho-anh-thai-sach-tet-canh-ty-2020.json) | S100 | Thiếu | 888k |  |  |
| 101 | ☑ | [Sách Tết Giáp Thìn 2024](../../../data/book/ho-anh-thai-sach-tet-giap-thin-2024.json) | S500 | Thiếu | 1200k |  |  |
| 102 | ☑ | [Sách Tết Kỷ Hợi 2019](../../../data/book/ho-anh-thai-sach-tet-ky-hoi-2019.json) | S100 | Thiếu | 1200k |  |  |
| 103 | ☑ | [Sách Tết Nhâm Dần 2022](../../../data/book/ho-anh-thai-sach-tet-nham-dan-2022.json) | S500 | Thiếu | 1100k |  |  |
| 104 | ☑ | [Sách Tết Quý Mão 2023](../../../data/book/ho-anh-thai-sach-tet-quy-mao-2023.json) | S500 | Thiếu | 1200k |  |  |
| 105 | ☑ | [Sách Tết Tân Sửu 2021](../../../data/book/ho-anh-thai-sach-tet-tan-suu-2021.json) | S365 | Thiếu | 999k |  |  |
| 106 | ☐ | Sắp đặt và Diễn | Chưa cung cấp | Thiếu | Thiếu | Thiếu | Cần nhập hồ sơ. Cần xác nhận mã bản. |
| 107 | ☑ | [Số đỏ – Bản tri ân](../../../data/book/vu-trong-phung-so-do.json) | S100 | Thiếu | Thiếu | Thiếu | Chưa có bản S100; cần xác nhận bản tri ân và bản S100 có cùng đợt phát hành. |
| 108 | ☑ | [Số đỏ](../../../data/book/vu-trong-phung-so-do.json) | Bản Chữ A | 2024 | Thiếu | Thiếu | Chưa có bản chữ A; cần bổ sung ngày/tháng phát hành, giá, ảnh và quy cách. |
| 109 | ☑ | [Số đỏ](../../../data/book/vu-trong-phung-so-do.json) | S500 | Thiếu | Thiếu | Thiếu | Chưa có bản S500. Cần đối chiếu nguồn cũ: mốc 11/2020, giá 800.000đ. |
| 110 | ☐ | Thái Bình Thiên Quốc | S365 | Thiếu | Thiếu | Thiếu | Cần nhập hồ sơ “Thái Bình Thiên Quốc diễn nghĩa”. Cần đối chiếu nguồn cũ: mốc 09/2023, giá 1.500.000đ. |
| 111 | ☐ | Thần khúc | S100 | Thiếu | Thiếu | Thiếu | Cần nhập hồ sơ. |
| 112 | ☐ | Thần khúc | S1200 | Thiếu | Thiếu | Thiếu | Cần nhập hồ sơ. Cần đối chiếu nguồn cũ: mốc 06/2022, giá 2.600.000đ. |
| 113 | ☑ | [Thép đã tôi thế đấy](../../../data/book/nikolai-alekseyevich-ostrovsky-how-the-steel-was-tempered.json) | S500 | Thiếu | 2tr300k |  | Cần đối chiếu nguồn cũ: mốc 15/07/2026. |
| 114 | ☑ | [Thi khúc & Thi phẩm](../../../data/book/sully-prudhomme-thi-khuc-thi-pham.json) | S1200 | Thiếu | 1tr1 |  | Cần đối chiếu print_run 1223 với dải số SP0001–SP1200. |
| 115 | ☐ | Thiên hoàng Minh Trị | S100 | Thiếu | Thiếu | Thiếu | Cần nhập hồ sơ. |
| 116 | ☑ | [Thống khổ & phiêu linh](../../../data/book/irving-stone-the-agony-and-the-ecstasy-a-biographical-novel-of-michelangelo.json) | S365 | Thiếu | Thiếu | Thiếu | Chưa có bản S365. Cần đối chiếu nguồn cũ: mốc 10/2023, giá 1.500.000đ. |
| 117 | ☑ | [Thương nhớ mười hai](../../../data/book/vu-bang-thuong-nho-muoi-hai.json) | Bản Chữ A | 08/01/2023 | Thiếu | Đã có | |
| 118 | ☑ | [Thương nhớ mười hai](../../../data/book/vu-bang-thuong-nho-muoi-hai.json) | S100 | Thiếu | Thiếu | Thiếu | Chưa có bản S100. |
| 119 | ☑ | [Thương nhớ mười hai](../../../data/book/vu-bang-thuong-nho-muoi-hai.json) | S896 | Thiếu | Thiếu | Thiếu | Chưa có bản S896. Cần xác nhận mã: S890 hay S896. Cần đối chiếu nguồn cũ: mốc 04/2022, giá 1.500.000đ. |
| 120 | ☑ | [Tội ác của Sylvestre Bonnard & Đảo chim cánh cụt](../../../data/book/anatole-france-toi-ac-cua-sylvestre-bonnard-dao-chim-canh-cut.json) | S1200 | Thiếu | Thiếu | Thiếu | Cần xác nhận bản buckram giới hạn hiện có trong JSON có phải S1200; chưa đủ căn cứ ghép edition. |
| 121 | ☑ | [Tội ác và hình phạt](../../../data/book/fyodor-dostoevsky-toi-ac-va-trung-phat.json) | Bản Chữ A | 08/01/2023 | Thiếu | Thiếu |  |
| 122 | ☑ | [Tội ác và hình phạt](../../../data/book/fyodor-dostoevsky-toi-ac-va-trung-phat.json) | S100 | 07/04/2022 | Thiếu |  |  |
| 123 | ☑ | [Tội ác và hình phạt](../../../data/book/fyodor-dostoevsky-toi-ac-va-trung-phat.json) | S500 | 01/12/2021 | 2tr500k |  |  |
| 124 | ☑ | [Tổng thống K. thứ tư](../../../data/book/mario-puzo-the-fourth-k.json) | S500 | Thiếu | Thiếu | Thiếu | Chưa có bản S500. Cần đối chiếu nguồn cũ: mốc 04/2023, giá 800.000đ. |
| 125 | ☑ | [Trần Tiến – Người hát thơ mình](../../../data/book/tran-tien-tran-tien-nguoi-hat-tho-minh-ca-khuc-nhung-cau-chuyen.json) | S365 | Thiếu | 2500k |  | Cần đối chiếu nguồn cũ: mốc 20/04/2026. |
| 126 | ☑ | [Truyện cổ Grimm](../../../data/book/jacob-ludwig-karl-grimm-kinder-und-hausmarchen.json) | Bản Chữ A | 08/01/2023 | Thiếu | Thiếu |  |
| 127 | ☑ | [Truyện cổ Grimm](../../../data/book/jacob-ludwig-karl-grimm-kinder-und-hausmarchen.json) | S100 | Thiếu | Thiếu | Thiếu | Chưa có bản S100. |
| 128 | ☑ | [Truyện cổ Grimm](../../../data/book/jacob-ludwig-karl-grimm-kinder-und-hausmarchen.json) | S500 | Thiếu | Thiếu | Thiếu | Chưa có bản S500. Cần đối chiếu nguồn cũ: mốc 06/2021, giá 2.200.000đ. |
| 129 | ☑ | [Truyện Kiều](../../../data/book/nguyen-du-truyen-kieu.json) | S500 | 26/07/2026 | 2tr200k |  |  |
| 130 | ☑ | [Truyện ngắn Nguyễn Huy Thiệp](../../../data/book/nguyen-huy-thiep-truyen-ngan-nguyen-huy-thiep.json) | Bản Chữ A | 08/01/2023 | Thiếu | Thiếu |  |
| 131 | ☑ | [Truyện ngắn Nguyễn Huy Thiệp](../../../data/book/nguyen-huy-thiep-truyen-ngan-nguyen-huy-thiep.json) | S100 | 31/01/2021 | 4tr500k |  |  |
| 132 | ☑ | [Truyện ngắn Nguyễn Huy Thiệp](../../../data/book/nguyen-huy-thiep-truyen-ngan-nguyen-huy-thiep.json) | S500 | 18/12/2020 | 900k |  |  |
| 133 | ☑ | [Tuyển tập kịch Jacinto Benavente](../../../data/book/jacinto-benavente-tuyen-tap-kich-jacinto-benavente.json) | Trăm năm Nobel | 28/10/2022 | 1tr |  |  |
| 134 | ☑ | [Tuyển tập thơ William Butler Yeats](../../../data/book/william-butler-yeats-tuyen-tap-tho-william-butler-yeats.json) | Trăm năm Nobel | 16/12/2023 | 1tr |  |  |
| 135 | ☐ | Văn mới 5 năm 2011 - 2015 | Chưa cung cấp | Thiếu | Thiếu | Thiếu | Cần nhập hồ sơ. Cần xác nhận mã bản. |
| 136 | ☐ | Văn mới 5 năm đầu thế kỷ | Chưa cung cấp | Thiếu | Thiếu | Thiếu | Cần nhập hồ sơ. Cần xác nhận mã bản. |
| 137 | ☑ | [Việt Nam sử lược (bản chữ A)](../../../data/book/tran-trong-kim-viet-nam-su-luoc.json) | Bản Chữ A | 22/08/2021 | Thiếu |  |  |
| 138 | ☑ | [Việt Nam sử lược](../../../data/book/tran-trong-kim-viet-nam-su-luoc.json) | S100 | 28/05/2021 | Thiếu |  |  |
| 139 | ☑ | [Việt Nam sử lược](../../../data/book/tran-trong-kim-viet-nam-su-luoc.json) | S500 | 01/02/2021 | 900k |  |  |
| 140 | ☑ | [Việt Nam văn hóa sử cương](../../../data/book/dao-duy-anh-viet-nam-van-hoa-su-cuong.json) | Bản Chữ A | 18/01/2025 | Thiếu | Thiếu |  |
| 141 | ☑ | [Việt Nam văn hóa sử cương](../../../data/book/dao-duy-anh-viet-nam-van-hoa-su-cuong.json) | S100 | 26/06/2023 | 5tr |  |  |
| 142 | ☑ | [Việt Nam văn hóa sử cương](../../../data/book/dao-duy-anh-viet-nam-van-hoa-su-cuong.json) | S500 | 20/09/2022 | 1tr500k |  |  |
| 143 | ☐ | Viết về bè bạn | Chưa cung cấp | Thiếu | Thiếu | Thiếu | Cần nhập hồ sơ. Cần xác nhận mã bản. |
