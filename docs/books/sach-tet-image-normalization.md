# Chuẩn hóa ảnh Sách Tết Đông A — 30/10/2026

Áp dụng `book-image-crop-safe` lần lượt cho 8 sách (2019–2026), toàn bộ 16 edition. Bỏ bước backup theo yêu cầu: không tạo file clone có prefix bookId. Ảnh nguồn được xem trực tiếp; crop thử được xem lại trước khi thay file website.

## Kết quả

- 69 → 55 file ảnh: loại 14 file lặp nội dung, mất nét hoặc có nguồn thay thế tốt hơn. Không có cặp file trùng byte trong 69 ảnh nguồn; việc lọc dựa trên nội dung và chất lượng.
- 22 ảnh crop theo chủ thể; 18 ảnh chỉ giảm kích thước/tối ưu; 15 ảnh giữ nguyên byte vì nén lại không tiết kiệm ít nhất 5%.
- Tổng dung lượng: 20,810,202 → 16,439,440 byte (19.85 → 15.68 MiB), giảm 21.0% kể cả ảnh loại bỏ.
- Riêng 55 ảnh giữ lại: 17,872,877 → 16,439,440 byte, giảm 8.0%.
- JPEG quality 85, progressive, optimize, chroma 4:2:0. Không upscale, không sharpen hoặc tạo thêm chi tiết. Mỗi kết quả xuất một lần từ nguồn chưa sửa; các vòng chỉnh crop cũng xuất lại từ nguồn đó.
- Giữ basename các ảnh còn dùng; JSON chỉ sửa `thumbnail` và `gellery_imgs`. Ruột sách dùng chung giữa hai edition chỉ giữ khi nguồn không thể hiện phụ kiện riêng của bản còn lại.
- Thứ tự ưu tiên: ảnh nhận diện edition → ảnh bộ/mở hộp → hộp, tranh → ruột sách. Bỏ các góc bìa gần giống nhau khi không thêm chi tiết.

## Ngoại lệ có chủ đích

- Không ép ảnh bộ sách, trang đôi, tranh ngang hoặc thiết kế quảng bá có postcard/chữ sang 3:4 khi việc crop sẽ cắt chủ thể. Ảnh trang đôi có thể giữ dạng vuông để bảo toàn mép trang.
- Thumbnail giữ bố cục ngang: bìa cứng 2019, 2021, 2024, 2025, 2026; phổ thông 2021, 2022, 2023. Nguồn hiện có không đủ vùng nền để crop 3:4 mà vẫn giữ trọn nội dung nhận diện.
- Thumbnail phổ thông 2019 là 630 × 840; phổ thông 2026 là 720 × 960. Đây là crop từ nguồn hiện có, không phóng lên 1680 × 2240. Bìa cứng 2024 vẫn dùng ảnh bộ 1440 × 960; chưa có ảnh chính diện riêng đủ tốt trong nguồn hiện có.
- Một số ảnh giữ nguyên trên 1680 px vì nguồn đã nén khá gọn và nén lại quality 85 không giảm đáng kể dung lượng. Không giảm thêm quality để chạy theo kích thước file.
- Một số file crop quality 85 nặng hơn nguồn đã nén: giữ chất lượng bản crop thay vì hạ quality thêm khi không có lợi ích rõ rệt. Dung lượng cụ thể được ghi bên dưới.

## Bộ ảnh của từng edition

| Sách | Edition | Thumbnail | Gallery |
| --- | --- | --- | --- |
| Sách Tết Ất Tỵ 2025 | Bìa Cứng Giới Hạn | `dong-a-bia-cung-set.jpg` | `dong-a-interior-illustration.jpg`, `dong-a-bia-cung-box.jpg`, `dong-a-bia-cung-artwork.jpg` |
| Sách Tết Ất Tỵ 2025 | Bản Phổ Thông | `dong-a-bia-mem-cover.jpg` | `dong-a-interior-illustration.jpg`, `dong-a-bia-mem-cover-and-postcard.jpg` |
| Sách Tết Bính Ngọ 2026 | Bìa Cứng Giới Hạn | `dong-a-bia-cung-set.jpg` | `dong-a-bia-cung-box.jpg`, `dong-a-bia-cung-box-open.jpg`, `dong-a-bia-cung-title-page.jpg`, `dong-a-bia-cung-interior-fish-illustration.jpg`, `dong-a-bia-cung-interior-horse-illustration.jpg` |
| Sách Tết Bính Ngọ 2026 | Bản Phổ Thông | `dong-a-bia-mem-cover-standing.jpg` | `dong-a-bia-mem-cover-and-postcard-photo.jpg`, `dong-a-interior-introduction.jpg`, `dong-a-bia-mem-interior-music.jpg`, `dong-a-interior-illustration.jpg`, `dong-a-bia-mem-interior-spring-story.jpg` |
| Sách Tết Canh Tý 2020 | Bìa Cứng Giới Hạn | `dong-a-bia-cung-set-display.jpg` | `dong-a-interior-illustration-2.jpg` |
| Sách Tết Canh Tý 2020 | Bản Phổ Thông | `dong-a-bia-mem-cover.jpg` | `dong-a-interior-illustration-2.jpg` |
| Sách Tết Giáp Thìn 2024 | Bìa Cứng Giới Hạn | `dong-a-bia-cung-set.jpg` | `dong-a-bia-cung-cover-on-box.jpg`, `dong-a-interior-illustration.jpg`, `dong-a-interior-illustration-2.jpg`, `dong-a-bia-cung-box.jpg`, `dong-a-bia-cung-artwork.jpg` |
| Sách Tết Giáp Thìn 2024 | Bản Phổ Thông | `dong-a-bia-mem-cover-standing.jpg` | `dong-a-cover-and-postcard-promo.jpg`, `dong-a-interior-illustration.jpg`, `dong-a-interior-illustration-2.jpg` |
| Sách Tết Kỷ Hợi 2019 | Bìa Cứng Giới Hạn | `dong-a-bia-cung-set.jpg` | `dong-a-bia-cung-set-open.jpg` |
| Sách Tết Kỷ Hợi 2019 | Bản Phổ Thông | `dong-a-bia-mem-cover-standing.jpg` | `dong-a-bia-mem-cover.jpg` |
| Sách Tết Nhâm Dần 2022 | Bìa Cứng Giới Hạn | `dong-a-bia-cung-cover-standing.jpg` | `dong-a-bia-cung-set-open.jpg`, `dong-a-bia-cung-box.jpg`, `dong-a-bia-cung-artwork.jpg`, `dong-a-bia-cung-interior-illustration.jpg`, `dong-a-bia-cung-interior-art-section.jpg`, `dong-a-bia-cung-interior-music-section.jpg` |
| Sách Tết Nhâm Dần 2022 | Bản Phổ Thông | `dong-a-cover-photo.jpg` | `dong-a-interior-van.jpg`, `dong-a-interior-tho.jpg`, `dong-a-interior-music.jpg` |
| Sách Tết Quý Mão 2023 | Bìa Cứng Giới Hạn | `dong-a-bia-cung-cover-standing.jpg` | `dong-a-bia-cung-set.jpg`, `dong-a-bia-cung-set-open.jpg`, `dong-a-bia-cung-spine.jpg`, `dong-a-bia-cung-artwork.jpg`, `dong-a-bia-cung-box.jpg` |
| Sách Tết Quý Mão 2023 | Bản Phổ Thông | `dong-a-cover-and-postcard-promo.jpg` | `dong-a-interior-and-postcard.jpg` |
| Sách Tết Tân Sửu 2021 | Bìa Cứng Giới Hạn | `dong-a-bia-cung-set.jpg` | `dong-a-interior-illustration.jpg` |
| Sách Tết Tân Sửu 2021 | Bản Phổ Thông | `dong-a-cover-promo.jpg` | `dong-a-interior-illustration.jpg` |

## Vùng crop và dung lượng từng file

Tọa độ `left, top, right, bottom` tính bằng pixel trên ảnh nguồn, cạnh phải/dưới không bao gồm. Tất cả nguồn JPEG, EXIF orientation = 1. `Giữ nguyên` nghĩa là không ghi lại JPEG. `Giữ bố cục` nghĩa là không crop, có thể downscale/tối ưu.

### ho-anh-thai-sach-tet-at-ty-2025

| File | Nguồn → kết quả (px) | Vùng crop | Dung lượng (byte) | Xử lý |
| --- | --- | --- | --- | --- |
| `dong-a-bia-cung-set.jpg` | 2048 × 1365 → 1680 × 1120 | Toàn ảnh | 476,453 → 398,844 | Giữ bố cục; tối ưu |
| `dong-a-interior-illustration.jpg` | 2048 × 1365 → 1580 × 1200 | `180, 80, 1760, 1280` | 413,180 → 349,041 | Crop ngang, giữ trọn chủ thể |
| `dong-a-bia-cung-box.jpg` | 2048 × 1365 → 1023 × 1364 | `500, 0, 1523, 1364` | 309,035 → 169,237 | Crop 3:4 |
| `dong-a-bia-cung-artwork.jpg` | 2048 × 1365 → 1410 × 1090 | `350, 170, 1760, 1260` | 345,074 → 268,291 | Crop ngang, giữ trọn chủ thể |
| `dong-a-bia-mem-cover.jpg` | 2048 × 1365 → 1023 × 1364 | `550, 0, 1573, 1364` | 371,753 → 286,313 | Crop 3:4 |
| `dong-a-bia-mem-cover-and-postcard.jpg` | 1080 × 1080 → 1080 × 1080 | Toàn ảnh | 190,135 → 190,135 | Giữ nguyên |

Ảnh đã xóa (đã bỏ toàn bộ tham chiếu trong JSON):

- `dong-a-bia-cung-cover-detail.jpg` — Cận cảnh lặp lại bìa ở ảnh bộ; hộp che một phần bìa.

### ho-anh-thai-sach-tet-binh-ngo-2026

| File | Nguồn → kết quả (px) | Vùng crop | Dung lượng (byte) | Xử lý |
| --- | --- | --- | --- | --- |
| `dong-a-bia-cung-set.jpg` | 2048 × 1463 → 1680 × 1200 | Toàn ảnh | 242,565 → 219,192 | Giữ bố cục; tối ưu |
| `dong-a-bia-cung-box.jpg` | 2048 × 1463 → 2048 × 1463 | Toàn ảnh | 158,731 → 158,731 | Giữ nguyên |
| `dong-a-bia-cung-box-open.jpg` | 2048 × 1463 → 1680 × 1200 | Toàn ảnh | 219,852 → 200,606 | Giữ bố cục; tối ưu |
| `dong-a-bia-cung-title-page.jpg` | 2048 × 1463 → 1680 × 1200 | Toàn ảnh | 323,490 → 301,993 | Giữ bố cục; tối ưu |
| `dong-a-bia-cung-interior-fish-illustration.jpg` | 2048 × 1463 → 2048 × 1463 | Toàn ảnh | 245,862 → 245,862 | Giữ nguyên |
| `dong-a-bia-cung-interior-horse-illustration.jpg` | 2048 × 1463 → 2048 × 1463 | Toàn ảnh | 290,868 → 290,868 | Giữ nguyên |
| `dong-a-bia-mem-cover-standing.jpg` | 1440 × 960 → 720 × 960 | `390, 0, 1110, 960` | 262,194 → 166,770 | Crop 3:4 |
| `dong-a-bia-mem-cover-and-postcard-photo.jpg` | 1440 × 960 → 1440 × 960 | Toàn ảnh | 274,482 → 274,482 | Giữ nguyên |
| `dong-a-interior-introduction.jpg` | 2048 × 2048 → 1680 × 1318 | `100, 300, 1948, 1750` | 411,618 → 399,462 | Crop ngang, giữ trọn chủ thể |
| `dong-a-bia-mem-interior-music.jpg` | 2048 × 1365 → 1680 × 1120 | Toàn ảnh | 507,919 → 431,526 | Giữ bố cục; tối ưu |
| `dong-a-interior-illustration.jpg` | 2048 × 2048 → 1680 × 1318 | `100, 320, 1948, 1770` | 377,662 → 351,618 | Crop ngang, giữ trọn chủ thể |
| `dong-a-bia-mem-interior-spring-story.jpg` | 2048 × 1365 → 1680 × 1120 | Toàn ảnh | 429,302 → 364,704 | Giữ bố cục; tối ưu |

Ảnh đã xóa (đã bỏ toàn bộ tham chiếu trong JSON):

- `dong-a-cover-promo.jpg` — Mockup bìa lặp nội dung; thay bằng ảnh chụp sách đứng.
- `dong-a-bia-mem-cover-and-postcard.jpg` — Mockup postcard lặp thông tin đã có trong ảnh chụp sách và postcard.

### ho-anh-thai-sach-tet-canh-ty-2020

| File | Nguồn → kết quả (px) | Vùng crop | Dung lượng (byte) | Xử lý |
| --- | --- | --- | --- | --- |
| `dong-a-bia-cung-set-display.jpg` | 1920 × 1920 → 1140 × 1520 | `540, 400, 1680, 1920` | 487,831 → 305,792 | Crop 3:4 |
| `dong-a-interior-illustration-2.jpg` | 2048 × 1152 → 1680 × 1006 | `260, 70, 1980, 1100` | 348,744 → 369,743 | Crop ngang, giữ trọn chủ thể |
| `dong-a-bia-mem-cover.jpg` | 2048 × 2048 → 1536 × 2048 | `250, 0, 1786, 2048` | 360,391 → 382,102 | Crop 3:4 |

Ảnh đã xóa (đã bỏ toàn bộ tham chiếu trong JSON):

- `dong-a-bia-cung-set.jpg` — Ảnh bộ 1080 px được thay bằng ảnh cùng bộ 1920 px.
- `dong-a-interior-illustration.jpg` — Nguồn 1120 px, chữ mềm và trang sách bị đạo cụ che; giữ ảnh ruột 2048 px rõ hơn.
- `dong-a-bia-mem-cover-standing.jpg` — Góc bìa gần trùng thumbnail, chủ thể nhỏ hơn và nền nhiều.
- `dong-a-cover-promo.jpg` — Mockup 993 px lặp ảnh bìa, độ phân giải thấp nhất nhóm.

### ho-anh-thai-sach-tet-giap-thin-2024

| File | Nguồn → kết quả (px) | Vùng crop | Dung lượng (byte) | Xử lý |
| --- | --- | --- | --- | --- |
| `dong-a-bia-cung-set.jpg` | 1440 × 960 → 1440 × 960 | Toàn ảnh | 115,718 → 115,718 | Giữ nguyên |
| `dong-a-bia-cung-cover-on-box.jpg` | 2048 × 2048 → 1680 × 1680 | Toàn ảnh | 304,475 → 268,954 | Giữ bố cục; tối ưu |
| `dong-a-interior-illustration.jpg` | 1926 × 1926 → 1926 × 1926 | Toàn ảnh | 660,134 → 660,134 | Giữ nguyên |
| `dong-a-interior-illustration-2.jpg` | 1926 × 1926 → 1926 × 1926 | Toàn ảnh | 472,755 → 472,755 | Giữ nguyên |
| `dong-a-bia-cung-box.jpg` | 2048 × 2048 → 1536 × 2048 | `256, 0, 1792, 2048` | 383,726 → 310,480 | Crop 3:4 |
| `dong-a-bia-cung-artwork.jpg` | 2048 × 2048 → 1536 × 2048 | `256, 0, 1792, 2048` | 278,986 → 277,536 | Crop 3:4 |
| `dong-a-bia-mem-cover-standing.jpg` | 1926 × 1926 → 1443 × 1924 | `220, 0, 1663, 1924` | 597,529 → 610,968 | Crop 3:4 |
| `dong-a-cover-and-postcard-promo.jpg` | 2048 × 1536 → 1680 × 1260 | Toàn ảnh | 224,390 → 191,592 | Giữ bố cục; tối ưu |

Ảnh đã xóa (đã bỏ toàn bộ tham chiếu trong JSON):

- `dong-a-cover-promo.jpg` — Mockup 1080 px lặp bìa; đã có ảnh chụp 1926 px và ảnh postcard.

### ho-anh-thai-sach-tet-ky-hoi-2019

| File | Nguồn → kết quả (px) | Vùng crop | Dung lượng (byte) | Xử lý |
| --- | --- | --- | --- | --- |
| `dong-a-bia-cung-set.jpg` | 1280 × 793 → 1280 × 793 | Toàn ảnh | 87,281 → 87,281 | Giữ nguyên |
| `dong-a-bia-cung-set-open.jpg` | 1908 × 1272 → 1908 × 1272 | Toàn ảnh | 251,831 → 251,831 | Giữ nguyên |
| `dong-a-bia-mem-cover-standing.jpg` | 903 × 1280 → 630 × 840 | `150, 380, 780, 1220` | 80,914 → 73,996 | Crop 3:4 |
| `dong-a-bia-mem-cover.jpg` | 1280 × 853 → 1280 × 853 | Toàn ảnh | 73,822 → 73,822 | Giữ nguyên |

Ảnh đã xóa (đã bỏ toàn bộ tham chiếu trong JSON):

- `dong-a-bia-mem-cover-angle.jpg` — Góc nghiêng có tên sách và chi tiết bìa mất nét; giữ ảnh chính diện rõ hơn.
- `dong-a-cover-promo.jpg` — Mockup bìa không thêm chi tiết edition so với ảnh chụp.

### ho-anh-thai-sach-tet-nham-dan-2022

| File | Nguồn → kết quả (px) | Vùng crop | Dung lượng (byte) | Xử lý |
| --- | --- | --- | --- | --- |
| `dong-a-bia-cung-cover-standing.jpg` | 2048 × 2048 → 1536 × 2048 | `256, 0, 1792, 2048` | 422,749 → 410,497 | Crop 3:4 |
| `dong-a-bia-cung-set-open.jpg` | 2048 × 1536 → 1680 × 1260 | Toàn ảnh | 369,692 → 321,061 | Giữ bố cục; tối ưu |
| `dong-a-bia-cung-box.jpg` | 2048 × 2048 → 1536 × 2048 | `256, 0, 1792, 2048` | 249,804 → 218,366 | Crop 3:4 |
| `dong-a-bia-cung-artwork.jpg` | 1779 × 1779 → 1332 × 1776 | `222, 0, 1554, 1776` | 401,223 → 459,522 | Crop 3:4 |
| `dong-a-bia-cung-interior-illustration.jpg` | 2048 × 1536 → 1680 × 1260 | Toàn ảnh | 332,984 → 301,311 | Giữ bố cục; tối ưu |
| `dong-a-bia-cung-interior-art-section.jpg` | 2048 × 1536 → 1680 × 1260 | Toàn ảnh | 419,851 → 372,289 | Giữ bố cục; tối ưu |
| `dong-a-bia-cung-interior-music-section.jpg` | 2048 × 1536 → 1680 × 1260 | Toàn ảnh | 402,559 → 356,229 | Giữ bố cục; tối ưu |
| `dong-a-cover-photo.jpg` | 2048 × 1536 → 1680 × 1260 | Toàn ảnh | 494,274 → 452,047 | Giữ bố cục; tối ưu |
| `dong-a-interior-van.jpg` | 2048 × 2048 → 1680 × 1680 | Toàn ảnh | 659,380 → 607,473 | Giữ bố cục; tối ưu |
| `dong-a-interior-tho.jpg` | 2048 × 2048 → 1680 × 1680 | Toàn ảnh | 592,920 → 560,457 | Giữ bố cục; tối ưu |
| `dong-a-interior-music.jpg` | 2048 × 2048 → 2048 × 2048 | Toàn ảnh | 565,777 → 565,777 | Giữ nguyên |

Ảnh đã xóa (đã bỏ toàn bộ tham chiếu trong JSON):

- `dong-a-bia-cung-set.jpg` — Ảnh bộ 1344 px lặp các chi tiết đã có ở ảnh mở hộp 2048 px và các ảnh riêng.
- `dong-a-cover-promo.jpg` — Mockup 1200 px lặp ảnh chụp bìa 2048 px.

### ho-anh-thai-sach-tet-quy-mao-2023

| File | Nguồn → kết quả (px) | Vùng crop | Dung lượng (byte) | Xử lý |
| --- | --- | --- | --- | --- |
| `dong-a-bia-cung-cover-standing.jpg` | 2048 × 1365 → 1023 × 1364 | `650, 0, 1673, 1364` | 247,026 → 229,730 | Crop 3:4 |
| `dong-a-bia-cung-set.jpg` | 2048 × 1365 → 1680 × 1120 | Toàn ảnh | 279,333 → 239,471 | Giữ bố cục; tối ưu |
| `dong-a-bia-cung-set-open.jpg` | 2048 × 1365 → 1680 × 1120 | Toàn ảnh | 163,939 → 145,379 | Giữ bố cục; tối ưu |
| `dong-a-bia-cung-spine.jpg` | 1365 × 2048 → 1365 × 1820 | `0, 228, 1365, 2048` | 176,482 → 192,951 | Crop 3:4 |
| `dong-a-bia-cung-artwork.jpg` | 1365 × 2048 → 1365 × 1820 | `0, 228, 1365, 2048` | 228,095 → 251,731 | Crop 3:4 |
| `dong-a-bia-cung-box.jpg` | 1365 × 2048 → 1365 × 1820 | `0, 228, 1365, 2048` | 131,722 → 143,865 | Crop 3:4 |
| `dong-a-cover-and-postcard-promo.jpg` | 2048 × 1536 → 1680 × 1260 | Toàn ảnh | 245,962 → 205,381 | Giữ bố cục; tối ưu |
| `dong-a-interior-and-postcard.jpg` | 1200 × 800 → 1200 × 800 | Toàn ảnh | 193,706 → 193,706 | Giữ nguyên |

Ảnh đã xóa (đã bỏ toàn bộ tham chiếu trong JSON):

- `dong-a-bia-cung-cover-on-box.jpg` — Góc bìa kê trên hộp lặp nội dung của ảnh bìa, ảnh bộ và hộp riêng.
- `dong-a-bia-cung-cover-and-artwork.jpg` — Bìa kèm tranh lặp thông tin đã có ở ảnh bộ và tranh riêng.

### ho-anh-thai-sach-tet-tan-suu-2021

| File | Nguồn → kết quả (px) | Vùng crop | Dung lượng (byte) | Xử lý |
| --- | --- | --- | --- | --- |
| `dong-a-bia-cung-set.jpg` | 2048 × 1535 → 2048 × 1535 | Toàn ảnh | 247,912 → 247,912 | Giữ nguyên |
| `dong-a-interior-illustration.jpg` | 2048 × 1546 → 1540 × 1046 | `0, 500, 1540, 1546` | 251,241 → 226,362 | Crop ngang, giữ trọn chủ thể |
| `dong-a-cover-promo.jpg` | 1875 × 1428 → 1875 × 1428 | Toàn ảnh | 217,544 → 217,544 | Giữ nguyên |

## Kiểm tra

- Đã xem toàn bộ ảnh nguồn và các bộ ảnh sau crop; so sánh chi tiết chữ/minh họa ở tỷ lệ 100% cho các file xử lý.
- 8 JSON parse thành công; chỉ `thumbnail` và `gellery_imgs` thay đổi. 55 file ảnh giải mã thành công; mọi tham chiếu đúng thư mục bookId, không trùng file hoặc trùng byte trong cùng edition; không còn ảnh dư.
- Trình duyệt localhost: chuyển đủ 16 edition và bấm từng ảnh trong 60 mục thumbnail/gallery (55 file duy nhất); mọi ảnh giải mã thành công và khớp thứ tự JSON.
- Kiểm tra viewport 390 × 844 trên hai edition 2026: ảnh tải đầy đủ, gallery hoạt động, không tràn ngang. Xem trực tiếp ảnh dọc 2026 và ảnh bộ ngang 2024 trên `detail-focus-cover`.
- `npm run audit:release`: passed. Có một cảnh báo dữ liệu sẵn có ngoài phạm vi: thiếu publisher ở edition #1 của `robert-louis-stevenson-treasure-island`.
- Giữ nguyên HEAD, nhánh `feature/input`, index Git và các file dữ liệu bên ngoài 8 sách. Chưa stage, commit hay push.
