---
name: chauchaubook-input
description: Chuẩn hóa ảnh local và metadata Chauchaubook cho một sách trong dự án biacung.com từ bookId. Dùng khi cần nhận diện, đổi tên, sắp thứ tự ảnh và cập nhật đúng edition Chauchaubook trong data/book/<bookId>.json.
---

# Chauchaubook Input

Nhận một `bookId` và hoàn tất toàn bộ quy trình cho sách đó. Chỉ thao tác trong:

- `assets/img/books/<bookId>/`
- `data/book/<bookId>.json`

Giữ nguyên mọi dữ liệu không thuộc phạm vi Chauchaubook. Field `gellery_imgs` là cách viết có chủ ý của schema dự án; không đổi thành `gallery_imgs`.

## Chuẩn tham chiếu

Nếu có trong repository, dùng `fredrik-backman-en-man-som-heter-ove` làm mẫu về cấu trúc JSON, đường dẫn ảnh local và cách đặt tên. Không sao chép dữ liệu riêng của cuốn sách mẫu.

Metadata chuẩn:

```yaml
series: Chauchaubook
series_ids: chauchaubook
caption: Bìa Vẽ Tay Bởi Châu Châu Book
detail: Tác phẩm bìa sách do Châu Châu Book vẽ tay trên chất liệu canvas bằng màu acrylic.
```

Trong JSON, `series` và `series_ids` là mảng:

```json
{
  "series": ["Chauchaubook"],
  "editions": [
    {
      "series_ids": ["chauchaubook"],
      "caption": "Bìa Vẽ Tay Bởi Châu Châu Book",
      "detail": "Tác phẩm bìa sách do Châu Châu Book vẽ tay trên chất liệu canvas bằng màu acrylic."
    }
  ]
}
```

## Quy trình bắt buộc

### 1. Xác định đầu vào và phạm vi

1. Xác nhận `bookId` chỉ gồm chữ thường, chữ số và dấu gạch ngang.
2. Đọc toàn bộ `data/book/<bookId>.json` và kiểm tra `id` khớp `bookId`.
3. Liệt kê toàn bộ file ảnh trong `assets/img/books/<bookId>/`.
4. Không tạo dữ liệu sách mới nếu JSON hoặc folder ảnh không tồn tại.

### 2. Chọn đúng edition Chauchaubook

Chỉ cập nhật edition Chauchaubook. Nhận diện theo thứ tự bằng chứng sau:

1. `series_ids` chứa `chauchaubook`.
2. `id`, `caption`, `format` hoặc `detail` chứa `chauchaubook`/`Châu Châu Book`.
3. `thumbnail` hoặc `gellery_imgs` trỏ đến ảnh có tên `chauchaubook-*`.
4. Nếu sách chỉ có đúng một edition và folder ảnh rõ ràng là ảnh bìa vẽ tay Chauchaubook, chọn edition đó.

Nếu có nhiều edition nhưng không edition nào có bằng chứng phân biệt, không đoán và không cập nhật hàng loạt; báo rõ edition đang mơ hồ.

### 3. Xem và phân loại ảnh

Phải xem nội dung của tất cả ảnh, đặc biệt khi tên nguồn là hash hoặc chuỗi ngẫu nhiên. Có thể dùng kích thước ảnh để hỗ trợ nhưng không phân loại chỉ dựa vào tên hoặc thứ tự file.

Nhận diện theo dấu hiệu thị giác:

- **Bìa cũ:** sách trước khi được vẽ/bọc thủ công; thường là bìa in thương mại nguyên bản.
- **Mặt trước:** thấy tiêu đề/tác giả hoặc bố cục chính của bìa đã hoàn thiện.
- **Mặt sau:** mặt đối diện bìa trước, thường không có tiêu đề chính.
- **Sách đứng:** toàn cuốn dựng đứng hoặc góc dựng thể hiện độ dày/gáy/cạnh.
- **Cấu tạo bên trong:** bìa lót, endpaper, artwork khi mở bìa, minh họa hoặc ruột sách.
- **Cạnh và chi tiết phụ:** fore-edge, gáy, dây đánh dấu, charm, chi tiết chất liệu, góc cận cảnh và ảnh bổ sung.

Chọn `thumbnail` là ảnh sản phẩm Chauchaubook hoàn thiện đẹp nhất: rõ toàn bộ mặt trước, tiêu đề dễ nhận biết, bố cục cân đối và ít bị che/khuất. Không chọn ảnh bìa cũ, mặt sau, ảnh cận chi tiết hoặc ảnh nội thất làm thumbnail.

### 4. Đổi tên file

Dùng tiền tố `chauchaubook-`, chữ thường và kebab-case. Giữ đúng phần mở rộng thực tế của file, ưu tiên phần mở rộng chữ thường; không đổi codec chỉ để đổi đuôi.

| Loại ảnh | Tên chuẩn |
|---|---|
| Ảnh thumbnail/mặt trước đẹp nhất | `chauchaubook-cover.<ext>` |
| Bìa cũ trước khi custom | `chauchaubook-before-custom.<ext>` |
| Mặt sau | `chauchaubook-back-cover.<ext>` |
| Sách đứng | `chauchaubook-cover-standing.<ext>` |
| Góc nghiêng nhưng không dựng đứng | `chauchaubook-cover-angle.<ext>` |
| Bìa lót | `chauchaubook-endpaper.<ext>` |
| Artwork ở bìa lót | `chauchaubook-endpaper-art.<ext>` |
| Minh họa/ruột sách | `chauchaubook-interior-illustration.<ext>` |
| Cạnh sách | `chauchaubook-fore-edge.<ext>` |
| Gáy sách | `chauchaubook-spine.<ext>` |
| Dây đánh dấu | `chauchaubook-bookmark.<ext>` |
| Chi tiết mặt trước | `chauchaubook-cover-detail.<ext>` |
| Chi tiết mặt sau | `chauchaubook-back-cover-detail.<ext>` |
| Chi tiết gáy | `chauchaubook-spine-detail.<ext>` |

Nếu có nhiều ảnh cùng loại, thêm hậu tố `-2`, `-3` trước phần mở rộng. Lập bảng ánh xạ tên cũ sang tên mới trước khi đổi. Không ghi đè file đích đã tồn tại; dùng tên tạm cho các trường hợp hoán đổi tên. Sau khi đổi, cập nhật mọi đường dẫn của edition mục tiêu đang tham chiếu tên cũ.

### 5. Sắp thứ tự sử dụng ảnh

Trang detail tự ghép `thumbnail` trước `gellery_imgs`, nên không lặp lại cùng một file trong gallery.

Đặt:

1. `thumbnail`: `chauchaubook-cover.<ext>`.
2. `gellery_imgs`, theo thứ tự nhóm:
   1. Bìa cũ (`before-custom`), nếu có.
   2. Ảnh mặt trước bổ sung, nếu khác file thumbnail.
   3. Mặt sau.
   4. Sách đứng, rồi góc nghiêng.
   5. Bìa lót/cấu tạo bên trong/minh họa nội thất.
   6. Cạnh sách, dây đánh dấu, gáy, ảnh cận chi tiết và các ảnh phụ khác.

Trong cùng một nhóm, ưu tiên ảnh toàn cảnh trước ảnh cận cảnh. Không đưa file không phải ảnh hoặc ảnh không thuộc sản phẩm vào JSON.

### 6. Bổ sung metadata

- Ở cấp sách, bảo đảm mảng `series` chứa đúng một giá trị `Chauchaubook`; giữ lại các series khác và thứ tự hiện có.
- Với mỗi edition đã xác định là Chauchaubook, bảo đảm mảng `series_ids` chứa đúng một `chauchaubook`; giữ các ID khác.
- Đặt `caption` chính xác là `Bìa Vẽ Tay Bởi Châu Châu Book`.
- Đặt `detail` chính xác là `Tác phẩm bìa sách do Châu Châu Book vẽ tay trên chất liệu canvas bằng màu acrylic.`
- Không tự suy đoán ISBN, năm, nhà xuất bản, đơn vị phát hành, dịch giả, giá hoặc thông số khác.

### 7. Kiểm tra đến khi hoàn thành

Trước khi kết thúc, xác nhận:

- JSON parse thành công và `id` khớp `bookId`.
- Mọi ảnh được tham chiếu đều tồn tại.
- Tất cả ảnh của sản phẩm đã được phân loại; nêu rõ file nào bị loại và lý do nếu có.
- Tên ảnh tuân theo `chauchaubook-*`, không có va chạm hoặc tên hash cũ còn sót.
- `thumbnail` là ảnh đẹp nhất và không trùng file trong `gellery_imgs`.
- Gallery đúng thứ tự nhóm quy định và không có đường dẫn trùng nhau.
- Metadata chuẩn tồn tại đúng cấp và chỉ các edition Chauchaubook bị sửa.

Báo cáo ngắn gọn: edition đã cập nhật, ảnh được chọn làm thumbnail, thứ tự gallery, các file đã đổi tên, metadata đã bổ sung và kết quả kiểm tra.
