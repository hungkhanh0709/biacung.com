# Sách Tết Đông A — ghi chú dữ liệu và nguồn

Cập nhật: 30/10/2026. Đã nhập và rà soát 8 tựa, 16 phiên bản trong [series](../../data/series/sach-tet-dong-a.json). Không còn field chờ xác nhận; dữ kiện chưa rõ được chấp nhận để trống theo schema. Xem [quy ước nhập liệu](sach-tet-input-conventions.md).

## Quyết định đã chốt

- `authors = ["Hồ Anh Thái (tuyển chọn)"]`, liên kết tác giả `ho-anh-thai`. `publisher = "NXB Văn Học"` cho cả 16 phiên bản theo người dùng, kể cả 2025/2026 mà nguồn ban đầu ghi NXB Dân Trí.
- Bản cứng: `caption = "Bìa Cứng Giới Hạn"`, `format = "Bìa cứng"`. Bản mềm: `caption = "Bản Phổ Thông"`, `format = "Bìa mềm"`.
- `pub_year` lấy năm trong tên Sách Tết; `last_pub_year` và ID phiên bản đã đồng bộ. Năm phát hành thực tế trước Tết không thay quy tắc này. Trang 2024 có dòng nhầm Giáp Thìn 2023; dùng năm 2024 theo tựa và xác nhận người dùng.
- Giữ `translators = []`, `illustrators = []`, `proofreaders = []`, `page_count = null`, `size_cm = ""`, `weight_g = null` theo người dùng. Giữ thông tin có nguồn trong `detail`, bao gồm số trang, khổ sách, bìa áo và phụ kiện; không xóa mô tả chỉ vì field có cấu trúc để trống.
- Giữ ISBN có nguồn; chưa tìm thấy dùng `null`. Không suy ra ISBN bản cứng từ bản mềm.
- Giá bìa dùng chuỗi hậu tố `k`. Người dùng đã chốt 2019 bản cứng `1200k`, 2020 bản cứng `888k`, 2021 phổ thông `328k`/S365 `999k`, 2026 bản cứng `1400k`. Không dùng giá ưu đãi làm giá bìa.
- Bản giới hạn 2026 chưa rõ số lượng và khoảng số: `print_run = null`, `copy_numbering = null`; giữ mô tả đánh số nhảy và mỗi bản duy nhất trong `detail`. Các bản phổ thông chưa rõ số lượng dùng `print_run = null`, giữ mô tả đánh số đã có nguồn. Không suy ra ST 0501 hoặc số lượng 500 từ năm khác.
- Năm 2019 chỉ có hai edition đã nhập. Người dùng bác bỏ việc tạo edition thứ ba từ câu “19 bản rất đặc biệt” trong dữ liệu thô.
- Chỉ dùng field có sẵn trong schema; không thêm field giấy, bìa áo, in màu, tranh hoặc hộp. Không lưu chính sách giao số ngẫu nhiên, vận chuyển hay trạng thái còn/hết hàng vào quy cách ấn bản.

## Giá và số lượng theo năm

Dấu `—` tương ứng `null`, chưa rõ số lượng; không phải số 0. Giá và số lượng của từng phiên bản được lưu độc lập.

| Năm | JSON | Giá phổ thông / giới hạn | Số bản phổ thông / giới hạn |
| --- | --- | --- | --- |
| 2019 | [Kỷ Hợi](../../data/book/ho-anh-thai-sach-tet-ky-hoi-2019.json) | 268k / 1200k | 1900 / 100 |
| 2020 | [Canh Tý](../../data/book/ho-anh-thai-sach-tet-canh-ty-2020.json) | 288k / 888k | — / 100 |
| 2021 | [Tân Sửu](../../data/book/ho-anh-thai-sach-tet-tan-suu-2021.json) | 328k / 999k | 1656 / 365 |
| 2022 | [Nhâm Dần](../../data/book/ho-anh-thai-sach-tet-nham-dan-2022.json) | 359k / 1100k | — / 500 |
| 2023 | [Quý Mão](../../data/book/ho-anh-thai-sach-tet-quy-mao-2023.json) | 399k / 1200k | — / 500 |
| 2024 | [Giáp Thìn](../../data/book/ho-anh-thai-sach-tet-giap-thin-2024.json) | 399k / 1200k | — / 500 |
| 2025 | [Ất Tỵ](../../data/book/ho-anh-thai-sach-tet-at-ty-2025.json) | 419k / 1300k | — / 500 |
| 2026 | [Bính Ngọ](../../data/book/ho-anh-thai-sach-tet-binh-ngo-2026.json) | 419k / 1400k | — / — |

## Nguồn

- 2019, 2021, 2022, 2023: nội dung thô và ảnh do người dùng cung cấp trong cuộc trò chuyện; chưa có URL/ngày bài Facebook.
- 2020: nội dung người dùng và [trang Đông A](https://sachdonga.vn/products/sachtet2020).
- 2024: nội dung người dùng và [trang Đông A](https://sachdonga.vn/products/sach-tet-giap-thin-2024).
- 2025: nội dung người dùng và [trang Đông A](https://sachdonga.vn/products/sach-tet-at-ty-2025).
- 2026: nội dung người dùng và [trang Đông A](https://sachdonga.vn/products/sach-tet-binh-ngo-2026).
- Thông tin từ trang sản phẩm được đối chiếu cho bản phổ thông; không tự áp dụng thông số sang bản giới hạn. Xác nhận trực tiếp của người dùng được ưu tiên khi khác nguồn ban đầu.
- Người dùng bổ sung 292 trang cho phổ thông 2021 và tên bản cứng S365; đã ghi vào `detail`, giữ `page_count = null` theo quy ước.

| Năm | Mã sản phẩm từ nguồn, không dùng thay ISBN |
| --- | --- |
| 2022 | `8936203361056` |
| 2024 | `8936203364323` |
| 2025 | `8936203365016` |
| 2026 | `8936203365399` |

## Ảnh và dọn file tạm

Ảnh được xem trước khi gán, đặt trong `/assets/img/books/<bookId>/`; thumbnail series ở `/assets/img/series/sach-tet-dong-a.jpg`. File được sao chép nguyên byte, không crop/nén/chỉnh sửa. Chỉ giữ asset đang được JSON tham chiếu; không lặp thumbnail trong `gellery_imgs`.

Lượt chuẩn bị commit giữ thêm 4 ảnh bộ sách/ruột bản cứng 2022 và ảnh bìa kèm postcard 2025. Các góc tương tự bìa/trang nhạc/trang thơ 2022 được bỏ vì đã có ảnh rõ trong bộ hiện tại; `2023.jpg` là ảnh quảng bá “SẮP PHÁT HÀNH”, bỏ vì đã có thumbnail nhận diện sách và ảnh postcard. `.DS_Store` là file hệ thống macOS, được dọn khỏi thư mục tạm. `2022-limited-1.jpg` trùng nguyên byte với `2022-limited.jpg`, cùng dùng một asset bộ sách mở hộp.

Ảnh postcard 2025 chỉ bổ sung vào gallery trong lượt dọn này; không bổ sung thông số sách từ ảnh. Các bản nguồn được dọn sau khi đối chiếu byte và kiểm tra ảnh qua server.

Lưu ý tên file nguồn:

- File `2026-limited-1.pg` thực tế là JPEG; đã chuẩn hóa phần mở rộng `.jpg`, giữ nguyên byte.
- File có tên `2025.jpg` từng xuất hiện với hai nội dung khác nhau: lượt cũ là bìa Bính Ngọ 2026; lượt dọn cuối là postcard Ất Tỵ 2025. Gán theo nội dung đã xem, không chỉ theo tên file.
- Hai ảnh ruột 2026 từ các URL cũ đã chuyển về local: `https://cdn.hstatic.net/products/1000328521/3_6a8b6f32b62046f8bb969e7fdf60945f_master.jpg` và `https://cdn.hstatic.net/products/1000328521/5_325ae8076ed04adebed3dd7c59055528_master.jpg`.
- Ảnh cũ `1_f2a52e060c2a471db68a400f58b6e183_master.jpg` cùng hình bìa/postcard 2026; dùng bản local người dùng cung cấp có độ phân giải cao hơn, không lặp gallery.

Các bảng bên dưới lưu tên nguồn trước khi dọn. Tên gọi phiên bản trong bảng nguồn mô tả nhóm ảnh; caption hiện tại theo phần quyết định.

### Sách Tết Ất Tỵ 2025 — ghi chú nhập liệu

| Nguồn trước khi dọn | Tên asset | Sử dụng |
| --- | --- | --- |
| `2025-1.jpg` | `dong-a-bia-mem-cover.jpg` | Thumbnail bản phổ thông |
| `2025-2.jpg` | `dong-a-interior-illustration.jpg` | Gallery nội dung chung hai phiên bản |
| `2025-limited.jpg` | `dong-a-bia-cung-set.jpg` | Thumbnail bản giới hạn |
| `2025-limited-3jpg.jpg` | `dong-a-bia-cung-cover-detail.jpg` | Gallery bản giới hạn, chi tiết bìa |
| `2025-limited-1.jpg` | `dong-a-bia-cung-box.jpg` | Gallery bản giới hạn, hộp |
| `2025-limited-2.jpg` | `dong-a-bia-cung-artwork.jpg` | Gallery bản giới hạn, tranh |

### Sách Tết Bính Ngọ 2026 — ghi chú nhập liệu

| Nguồn trong `data/series/sach-tet/` | Asset | Sử dụng |
| --- | --- | --- |
| `2026.jpg` | `dong-a-cover-promo.jpg` | Thumbnail phổ thông; trùng nguyên byte với asset có sẵn, tái sử dụng |
| `2026-1.jpg` | `dong-a-bia-mem-cover-and-postcard.jpg` | Gallery phổ thông, bìa và postcard |
| `2026-2.jpg` | `dong-a-bia-mem-cover-and-postcard-photo.jpg` | Gallery phổ thông, ảnh thực tế sách và postcard |
| `2026-3.jpg` | `dong-a-bia-mem-interior-music.jpg` | Gallery phổ thông, trang nhạc |
| `2026-4.jpg` | `dong-a-bia-mem-cover-standing.jpg` | Gallery phổ thông, sách đặt đứng |
| `2026-5.jpg` | `dong-a-bia-mem-interior-spring-story.jpg` | Gallery phổ thông, trang văn |
| `2026-limited-1.pg` | `dong-a-bia-cung-set.jpg` | Thumbnail giới hạn, sách cùng hộp và tranh |
| `2026-limited-2.jpg` | `dong-a-bia-cung-box.jpg` | Gallery giới hạn, hộp |
| `2026-limited-3.jpg` | `dong-a-bia-cung-box-open.jpg` | Gallery giới hạn, hộp mở |
| `2026-limited-4.jpg` | `dong-a-bia-cung-title-page.jpg` | Gallery giới hạn, trang tên sách |
| `2026-limited-5.jpg` | `dong-a-bia-cung-interior-fish-illustration.jpg` | Gallery giới hạn, trang minh họa cá |
| `2026-limited-6.jpg` | `dong-a-bia-cung-interior-horse-illustration.jpg` | Gallery giới hạn, trang minh họa ngựa |

### Sách Tết Canh Tý 2020 — ghi chú nhập liệu

| File nguồn trong `data/series/sach-tet/` | Tên asset | Trường |
| --- | --- | --- |
| `2020-3.jpg` | `dong-a-bia-mem-cover.jpg` | Thumbnail bản phổ thông |
| `2020.jpg` | `dong-a-bia-mem-cover-standing.jpg` | Gallery bản phổ thông |
| `2020-limited-2.jpg` | `dong-a-bia-cung-set.jpg` | Thumbnail bản bìa cứng |
| `2020-limited.jpg` | `dong-a-bia-cung-set-display.jpg` | Gallery bản bìa cứng |

### Sách Tết Giáp Thìn 2024 — ghi chú nhập liệu

| Nguồn trước khi dọn | Tên asset | Sử dụng |
| --- | --- | --- |
| `2024-2.jpg` | `dong-a-bia-mem-cover-standing.jpg` | Thumbnail bản phổ thông |
| `2024-1.jpg` | `dong-a-cover-promo.jpg` | Gallery bản phổ thông |
| `2024.jpg` | `dong-a-cover-and-postcard-promo.jpg` | Gallery bản phổ thông, nguồn thông tin postcard |
| `2024-3.jpg` | `dong-a-interior-illustration.jpg` | Gallery chung hai phiên bản |
| `2024-4.jpg` | `dong-a-interior-illustration-2.jpg` | Gallery chung hai phiên bản |
| `2024-limited-1.jpg` | `dong-a-bia-cung-set.jpg` | Thumbnail bản giới hạn |
| `2024-limited-2.jpg` | `dong-a-bia-cung-cover-on-box.jpg` | Gallery bản giới hạn |
| `2024-limited-3.jpg` | `dong-a-bia-cung-box.jpg` | Gallery bản giới hạn |
| `2024-limited-4.jpg` | `dong-a-bia-cung-artwork.jpg` | Gallery bản giới hạn |

### Sách Tết Kỷ Hợi 2019 — ghi chú nhập liệu

| Phiên bản | Trường | Ảnh local |
| --- | --- | --- |
| Phổ thông | `thumbnail` | `/assets/img/books/ho-anh-thai-sach-tet-ky-hoi-2019/dong-a-bia-mem-cover.jpg` |
| Phổ thông | `gellery_imgs` | `/assets/img/books/ho-anh-thai-sach-tet-ky-hoi-2019/dong-a-bia-mem-cover-standing.jpg`, `/assets/img/books/ho-anh-thai-sach-tet-ky-hoi-2019/dong-a-bia-mem-cover-angle.jpg` |
| Đặc biệt | `thumbnail` | `/assets/img/books/ho-anh-thai-sach-tet-ky-hoi-2019/dong-a-bia-cung-set.jpg` |

### Sách Tết Nhâm Dần 2022 — ghi chú nhập liệu

| Tên asset | Sử dụng |
| --- | --- |
| `dong-a-cover-photo.jpg` | Thumbnail bản phổ thông |
| `dong-a-cover-promo.jpg` | Gallery bản phổ thông, ảnh dựng bìa |
| `dong-a-interior-van.jpg` | Gallery chung, trang Văn |
| `dong-a-interior-tho.jpg` | Gallery chung, trang Thơ |
| `dong-a-interior-music.jpg` | Gallery chung, trang nhạc |
| `dong-a-bia-cung-set.jpg` | Thumbnail bản giới hạn, ảnh bộ sách/hộp/tranh |
| `dong-a-bia-cung-cover-standing.jpg` | Gallery bản giới hạn, ảnh sách đứng |
| `dong-a-bia-cung-box.jpg` | Gallery bản giới hạn, ảnh hộp |
| `dong-a-bia-cung-artwork.jpg` | Gallery bản giới hạn, ảnh tranh |

### Sách Tết Quý Mão 2023 — ghi chú nhập liệu

| Tên nguồn trước khi dọn | Tên asset | Sử dụng |
| --- | --- | --- |
| `2023-0.jpg`, `2023-1.jpg` | `dong-a-cover-and-postcard-promo.jpg` | Thumbnail bản phổ thông |
| `2023-2.jpg` | `dong-a-interior-and-postcard.jpg` | Gallery bản phổ thông |
| `2023-limited.jpg`, `2023-limited-1.jpg` | `dong-a-bia-cung-set.jpg` | Thumbnail bản giới hạn |
| `2023-limited-3.jpg` | `dong-a-bia-cung-cover-standing.jpg` | Gallery, sách đứng |
| `2023-limited-2.jpg` | `dong-a-bia-cung-cover-on-box.jpg` | Gallery, sách trên hộp |
| `2023-limited-4.jpg` | `dong-a-bia-cung-cover-and-artwork.jpg` | Gallery, sách và tranh |
| `2023-limited-5.jpg` | `dong-a-bia-cung-set-open.jpg` | Gallery, bộ sản phẩm mở hộp |
| `2023-limited-6.jpg` | `dong-a-bia-cung-spine.jpg` | Gallery, gáy sách |
| `2023-limited-7.jpg` | `dong-a-bia-cung-artwork.jpg` | Gallery, tranh |
| `2023-limited-8.jpg` | `dong-a-bia-cung-box.jpg` | Gallery, hộp |

### Sách Tết Tân Sửu 2021 — ghi chú nhập liệu

| Tên nguồn trong thư mục tạm | Tên asset | Cách sử dụng |
| --- | --- | --- |
| `2021-1.jpg` | `dong-a-cover-promo.jpg` | Thumbnail bản phổ thông; ảnh dựng quảng bá bìa sách |
| `2021 -limited-11.jpg` | `dong-a-bia-cung-set.jpg` | Thumbnail bản giới hạn; ảnh sách kèm hộp và tranh sơn mài |
| `2021.jpg` | `dong-a-interior-illustration.jpg` | Gallery chung cho hai phiên bản; ảnh nội dung ruột sách |

### Source image mapping (earlier cleanup)

| Nguồn | Asset | Sử dụng | SHA-256 |
| --- | --- | --- | --- |
| `2019-1.jpg` | `/assets/img/books/ho-anh-thai-sach-tet-ky-hoi-2019/dong-a-cover-promo.jpg` | Đã gán | `f2cd91fd9f058f19e9c7333f4b0a86af3f735f2e893a809050d4840ef8001c1b` |
| `2019-limited-111.jpg` | `/assets/img/books/ho-anh-thai-sach-tet-ky-hoi-2019/dong-a-bia-cung-set-open.jpg` | Đã gán | `59b0b96f80e90a17e93b1f2fa892e62ba59fdc21f4714b312f17f2b49838f3f6` |
| `2020-0.jpg` | `/assets/img/books/ho-anh-thai-sach-tet-canh-ty-2020/dong-a-cover-promo.jpg` | Đã gán | `bf6982675b78c880069469e00ddeda146ae47921ac66643a0ab3f675f0bc8e67` |
| `2020-1.jpg` | `/assets/img/books/ho-anh-thai-sach-tet-canh-ty-2020/dong-a-interior-illustration.jpg` | Đã gán | `ca55a5e47d97aabba5d22f2b029415df6920f28b53f00fc836f9ef18c14eae38` |
| `2020-5.jpg` | `/assets/img/books/ho-anh-thai-sach-tet-canh-ty-2020/dong-a-interior-illustration-2.jpg` | Đã gán | `0765324340770e2f031435c35a662415afa4bc6e231620b4dae2a72f234e3783` |
| `2020-23.jpg` | `/assets/img/books/ho-anh-thai-sach-tet-canh-ty-2020/dong-a-bia-mem-cover.jpg` | Đã gán | `c5c9ed2484d063f1c9a3488f6f75c5f2821995a62f1f15dc78c11af488397d70` |
| `2025.jpg` | `/assets/img/books/ho-anh-thai-sach-tet-binh-ngo-2026/dong-a-cover-promo.jpg` | Đã gán | `410ab4bf876ed02d300c227dc4b17385e77e7196adb7b6e16c2fe9dea28211de` |
| `sach-tet.jpg` | `/assets/img/series/sach-tet-dong-a.jpg` | Đã gán | `569ec7c263687abaac9605b0c846399980e2c8bd953b9b9db6ba34b70013836e` |
| `2022.jpg` | `/assets/img/books/ho-anh-thai-sach-tet-nham-dan-2022/dong-a-cover-photo.jpg` | Đã gán 2022 | `74da37441fe6b53b89739bd47ad0b963a6fe0269bf8ceff9d155455ff2a725a5` |
| `2022-0.jpg` | `/assets/img/books/ho-anh-thai-sach-tet-nham-dan-2022/dong-a-cover-promo.jpg` | Đã gán 2022 | `eb09f093a4421a53d598b6e39e352945776e8ef5bcdaa8649e72fb811b66a561` |
| `2022-1.jpg` | `/assets/img/books/ho-anh-thai-sach-tet-nham-dan-2022/dong-a-interior-van.jpg` | Đã gán 2022 | `d4d6a085cb9a17853559067a6036203a7926d5f25332302553496bfc4d1863cd` |
| `2022-2.jpg` | `/assets/img/books/ho-anh-thai-sach-tet-nham-dan-2022/dong-a-interior-tho.jpg` | Đã gán 2022 | `91bb244ab78a8345726db366241258fc5423a1614fc854d080986f52b621910e` |
| `2022-3.jpg` | `/assets/img/books/ho-anh-thai-sach-tet-nham-dan-2022/dong-a-interior-music.jpg` | Đã gán 2022 | `d6777f4e544455d1928b8ec4c2bd867fb9c592194fa8742182e075783598042a` |
| `2022-limted-1.jpg` | `/assets/img/books/ho-anh-thai-sach-tet-nham-dan-2022/dong-a-bia-cung-set.jpg` | Đã gán 2022 | `0657955995e8f880b296d2234b199c7aaf846df9067756980d957d3f1a1f023f` |
| `2022-limted-2.jpg` | `/assets/img/books/ho-anh-thai-sach-tet-nham-dan-2022/dong-a-bia-cung-artwork.jpg` | Đã gán 2022 | `ee9ebc4368502ff24338d2fb2586c769789ce7f5fa493bd5796c8323b03a7c4b` |
| `2022-limted-3.jpg` | `/assets/img/books/ho-anh-thai-sach-tet-nham-dan-2022/dong-a-bia-cung-box.jpg` | Đã gán 2022 | `903daae240c63481260f4990fcd7af4ea4f6eb40dcc5094c28ca89d8e9e09723` |
| `2022-limted-4.jpg` | `/assets/img/books/ho-anh-thai-sach-tet-nham-dan-2022/dong-a-bia-cung-cover-standing.jpg` | Đã gán 2022 | `94b6bd85277631b5889cb24c116881e65fe898ad4efe764c9f59ae9cd84a7dd3` |
| `2020-4.jpg` | — | Loại: màu/chi tiết ảnh kém | `ce53477c0a8ec589b36973d81bef54a0f10a612b53ccbd636a66e4ad77de7101` |

### Source image mapping (commit preparation)

| Source | Asset |
| --- | --- |
| `2022-limited.jpg` | `/assets/img/books/ho-anh-thai-sach-tet-nham-dan-2022/dong-a-bia-cung-set-open.jpg` |
| `2022-limited-12.jpg` | `/assets/img/books/ho-anh-thai-sach-tet-nham-dan-2022/dong-a-bia-cung-interior-illustration.jpg` |
| `2022-limited-3.jpg` | `/assets/img/books/ho-anh-thai-sach-tet-nham-dan-2022/dong-a-bia-cung-interior-art-section.jpg` |
| `2022-limited-4.jpg` | `/assets/img/books/ho-anh-thai-sach-tet-nham-dan-2022/dong-a-bia-cung-interior-music-section.jpg` |
| `2025.jpg` | `/assets/img/books/ho-anh-thai-sach-tet-at-ty-2025/dong-a-bia-mem-cover-and-postcard.jpg` |
