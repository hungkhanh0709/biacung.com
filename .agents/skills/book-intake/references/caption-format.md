# Caption và Format

## Cách áp dụng

- Dùng keyword đúng cách viết trong bảng và áp dụng Memo theo nguồn của edition.
- Caption theo ký hiệu ấn bản; đơn vị phát hành trong Memo là gợi ý.
- Format ưu tiên vật liệu cụ thể. Quy cách phụ ghi trong `detail`.
- Format chưa rõ hoặc cần keyword mới thì hỏi người dùng; keyword đã chốt bổ sung tại đây.
- Không dùng `vocab` để chọn keyword; không thêm whitelist vào form/API.

Thống kê ngày 25/11/2026 từ `data/book/*.json`: **339 tựa / 523 phiên bản**, 261 Caption trống, không có Format trống. `Editions` là số phiên bản đang lưu từng nhãn.

## Caption

| Caption | Editions | Memo |
| --- | ---: | --- |
| Bản Chữ A | 33 | Độc bản ký hiệu A của Đông A. |
| Bản Chữ Ô | 1 | Độc bản ký hiệu Ô của Đông A. |
| Bản Tri Ân | 1 | Số đỏ Đông A tặng bạn đọc đổi S100 Thiên hoàng Minh Trị. |
| S100 | 37 | Thường dùng cho Đông A |
| S200 | 0 | Thường dùng cho Đông A |
| S365 | 9 | Thường dùng cho Đông A |
| S500 | 29 | Thường dùng cho Đông A |
| S895 | 3 | Thường dùng cho Đông A |
| S896 | 1 | Bỉ vỏ Đông A: 6 bản tặng và 890 bản phát hành. |
| S1200 | 5 | Thường dùng cho Đông A |
| S111 | 2 | — |
| S300 | 1 | — |
| S555 | 1 | — |
| S1000 | 1 | — |
| N333 | 1 | Thường dùng cho Nhã Nam |
| H100 | 0 | Thường dùng cho Đông Tây |
| H200 | 0 | Thường dùng cho Đông Tây |
| H365 | 7 | Thường dùng cho Đông Tây |
| H666 | 4 | Thường dùng cho Đông Tây |
| H999 | 1 | Thường dùng cho Đông Tây |
| Ấn Bản Kỷ Niệm 10 Năm Xuất Bản Lần Đầu | 1 | — |
| Ấn Bản Giới Hạn | 110 | Bản giới hạn được nguồn hoặc người dùng xác nhận, có thể không có mã S. Số lượng in chưa rõ: `print_run: null`. |
| Bìa Vẽ Tay Bởi Châu Châu Book | 14 | Chỉ dùng cho Chauchaubook |

## Format

### Giá trị đang lưu

Nhãn cũ để đối chiếu khi chuyển sang Format chuẩn.

| Format | Editions |
| --- | ---: |
| Bìa cứng | 166 |
| Bìa mềm | 153 |
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

### Format cụ thể theo vật liệu

`format` lưu hình thức bìa và vật liệu. Nhãn vật liệu dùng tên ngắn như `Da PU`, `Microfiber`, `Buckram`; nhãn hình thức giữ `Bìa cứng`, `Bìa mềm`, `Bìa cứng áo ôm`.

**Cấu trúc đích:** mảng chuỗi, kể cả chỉ có một nhãn. Form/search hiện chưa hỗ trợ kiểu mảng; khi triển khai cần đọc tương thích chuỗi cũ và lưu qua form.

```json
{
  "caption": "S500",
  "format": ["Da PU"]
}
```

Edition gộp nhiều biến thể dùng mảng nhãn không trùng; vật liệu của từng bản ghi trong `detail`. Ví dụ Grimm S100:

```json
{
  "caption": "S100",
  "format": ["Da bò Ý", "Microfiber"],
  "detail": "- V20: bìa bọc da bò Ý.\n- S80: bìa bọc da microfiber."
}
```

**Cách chuẩn hóa:**

- Chọn nhãn cụ thể nhất theo nguồn; dùng `Da thật` / `Da nhân tạo` khi chưa rõ loại da. Mỗi vật liệu chỉ dùng một nhãn.
- Chỉ ghi vật liệu bề mặt bìa; phụ kiện, màu, hãng và kỹ thuật ghi trong `detail`.
- Chuẩn hóa xuất xứ: Italy/Italia → `Ý`; Anh quốc/Vương quốc Anh → `Anh`. Chỉ thêm xuất xứ khi nguồn ghi rõ.
- Microfiber/Microfiter → `Microfiber`; Heritage Library Buckram → `Buckram`.
- Với sách đã thay bìa, ghi rõ vật liệu gốc và vật liệu sau bảo dưỡng theo phạm vi được xác nhận.

`Mô tả` là số phiên bản nhận diện được vật liệu từ `detail`; edition nhiều vật liệu có thể được tính ở nhiều dòng.

Cột **Phiên bản Đông A** đã thống kê cho `Da PU` và `Microfiber`.

| Format chuẩn | Mô tả | Memo | Phiên bản Đông A |
| --- | ---: | --- | --- |
| Da PU | 12 | Gồm 9 edition Đông A và 3 Nhã Nam | - S100 Anh em nhà Karamazov (bìa gốc PU; có thông báo bảo dưỡng 2023)<br>- S1200 Chàng ngốc (CN 366–CN 815; giá 1tr500k)<br>- S365 Cuốn theo chiều gió<br>- S500 Napoléon Bonaparte<br>- S100 Robinson Crusoe<br>- S500 Tội ác và hình phạt<br>- S500 Truyện Cổ Grimm<br>- S500 Truyện ngắn Nguyễn Huy Thiệp<br>- S500 Việt Nam Sử Lược |
| Microfiber | 16 | Gồm 16 edition Đông A | - S896 Bỉ vỏ<br>- S1200 Chàng ngốc (CN 001–CN 365; giá 2tr)<br>- S500 Con Bim Trắng Tai Đen<br>- S500 Đôi Lứa Xứng Đôi - Nửa Đêm - Cười<br>- S365 Đông Dương Xinh Đẹp Và Kỳ Vĩ<br>- S500 Gatsby vĩ đại<br>- S500 Gió Đầu Mùa & Hà Nội Băm Sáu Phố Phường<br>- S500 Hoàng Tử Bé<br>- S500 Một chiến dịch ở Bắc Kỳ<br>- S895 Ngụ Ngôn La Fontaine<br>- S500 Nhà Thờ Đức Bà Paris<br>- S500 Quo Vadis<br>- S1200 Thần Khúc (đợt 2)<br>- S100 Truyện Cổ Grimm (chỉ S80 trong S100)<br>- S100 Truyện ngắn Nguyễn Huy Thiệp (bản S80 thuộc S100)<br>- S500 Việt Nam Văn Hoá Sử Cương |
| Bonded leather | 12 | — | Chưa thống kê |
| Da bò | 23 | Chưa rõ xuất xứ hoặc dòng da. | Chưa thống kê |
| Da bò Ý | 15 | — | Chưa thống kê |
| Da bò Mỹ | 1 | — | Chưa thống kê |
| Da bò Vachetta | 1 | — | Chưa thống kê |
| Da dê | 2 | Chưa rõ xuất xứ. | Chưa thống kê |
| Da dê Pháp | 21 | — | Chưa thống kê |
| Da dê Anh | 9 | — | Chưa thống kê |
| Da bê Ý | 1 | — | Chưa thống kê |
| Vải | 18 | Chưa rõ loại vải. | Chưa thống kê |
| Buckram | 18 | Gồm Heritage Library Buckram. | Chưa thống kê |
| Canvas | 14 | Bìa vẽ tay Châu Châu Book. | Chưa thống kê |
| Giấy mỹ thuật | 1 | — | Chưa thống kê |
| Giấy Kraft | 1 | — | Chưa thống kê |
| Giấy thủy ấn | 2 | Kết hợp với da ở bìa nửa da. | Chưa thống kê |
| Giấy phủ vân da | 1 | Vinyl faux leather paper. | Chưa thống kê |
| Sơn mài | 3 | — | Chưa thống kê |

#### Cần bổ sung dữ liệu

- **Đại Việt Sử Ký Toàn Thư S895:** tách thông tin vật liệu trong mô tả dùng chung của hai edition da bò và buckram.
- **Ghi chép từ Nhà chết bản da:** cần xác định loại da nhập từ Ý.
- **Bố Già S100, Đảo Mộng Mơ S100:** cần xác định loại da nhân tạo.
- **Nghìn Lẻ Một Đêm, Người Kép Già, Số Đỏ bản PU:** cần bổ sung hoặc xác định đúng edition.

