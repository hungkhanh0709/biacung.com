# Caption và Format

## Cách áp dụng

- Dùng keyword đúng cách viết trong bảng và áp dụng Memo theo nguồn của edition.
- Caption theo ký hiệu ấn bản; đơn vị phát hành trong Memo là gợi ý.
- Format ưu tiên vật liệu cụ thể. Quy cách phụ ghi trong `detail`.
- Format chưa rõ hoặc cần keyword mới thì hỏi người dùng; keyword đã chốt bổ sung tại đây.
- Không dùng `vocab` để chọn keyword; không thêm whitelist vào form/API.

Thống kê sau refactor ngày 26/11/2026 từ `data/book/*.json`: **339 tựa / 523 phiên bản**, 261 Caption trống, không có Format trống. `Editions` là số phiên bản đang lưu từng nhãn.

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

`format` là mảng chuỗi, gồm hình thức bìa và vật liệu. Nhãn vật liệu có tiền tố `Bìa`, thống nhất với nhãn hình thức. Form nhập các nhãn cách nhau bằng `;` và lưu mảng; dữ liệu chuỗi cũ vẫn đọc được. Sửa Format giữ ID edition hiện có.

- Chọn nhãn vật liệu cụ thể nhất theo nguồn; dùng `Bìa da thật` / `Bìa da nhân tạo` khi chưa rõ loại da.
- Edition nhiều vật liệu dùng các nhãn không trùng; vật liệu từng bản, phụ kiện và quy cách phụ ghi trong `detail`.
- Với bộ có sách chính và quyển chú giải kèm theo, Format theo bìa sách chính; bìa quyển chú giải ghi trong `detail`.
- Italy/Italia → `Ý`; Anh quốc/Vương quốc Anh → `Anh`. Chỉ thêm xuất xứ khi nguồn ghi rõ.
- Microfiber/Microfiter → `Bìa da microfiber`; Heritage Library Buckram → `Bìa buckram`.
- Sách đã thay bìa: ghi rõ vật liệu gốc và sau bảo dưỡng theo phạm vi được xác nhận.

**Editions** là số phiên bản có nhãn; edition nhiều vật liệu có thể xuất hiện ở nhiều dòng.

| Format | Editions | Memo |
| --- | ---: | --- |
| Bìa cứng | 159 | — |
| Bìa mềm | 153 | — |
| Bìa cứng áo ôm | 30 | — |
| Bìa mềm áo ôm | 3 | — |
| Boxset | 2 | — |
| Boxset, bìa cứng | 8 | — |
| Boxset, bìa mềm | 2 | — |
| Bìa vải | 22 | Chưa rõ loại vải. |
| Bìa buckram | 20 | Gồm Heritage Library Buckram. |
| Chauchaubook | 14 | — |
| Bìa da thật | 1 | Dùng khi chưa rõ loại da. |
| Bìa da bò | 22 | Chưa rõ xuất xứ hoặc dòng da. |
| Bìa da bò Ý | 15 | — |
| Bìa da bò Mỹ | 1 | — |
| Bìa da bò Vachetta | 1 | — |
| Bìa da dê | 2 | Chưa rõ xuất xứ. |
| Bìa da dê Pháp | 21 | — |
| Bìa da dê Anh | 9 | — |
| Bìa da bê Ý | 1 | — |
| Bìa da nhân tạo | 4 | Dùng khi chưa rõ loại da. |
| Bìa da PU | 12 | Gồm 9 edition Đông A và 3 Nhã Nam |
| Bìa da microfiber | 16 | Gồm 16 edition Đông A |
| Bìa bonded leather | 12 | — |
| Bìa Si BN-Baladek Masanti | 2 | — |
| Bìa giấy mỹ thuật | 1 | — |
| Bìa giấy Kraft | 0 | — |
| Bìa giấy thủy ấn | 2 | Kết hợp với da ở bìa nửa da. |
| Bìa giấy phủ vân da | 1 | Vinyl faux leather paper. |
| Bìa sơn mài | 3 | — |

Ví dụ Grimm S100:

```json
{
  "caption": "S100",
  "format": ["Bìa da bò Ý", "Bìa da microfiber"],
  "detail": "- V20: bìa bọc da bò Ý.\n- S80: bìa bọc da microfiber."
}
```

### Cần bổ sung dữ liệu

- **Ghi chép từ Nhà chết bản da:** cần xác định loại da nhập từ Ý.
- **Bố Già S100, Đảo Mộng Mơ S100:** cần xác định loại da nhân tạo.
- **Nghìn Lẻ Một Đêm, Người Kép Già, Số Đỏ bản PU:** cần bổ sung hoặc xác định đúng edition.

