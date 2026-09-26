---
name: award-data-collector
description: Thu thập, đối chiếu và cập nhật dữ liệu một năm của Nobel Văn chương, Pulitzer Fiction hoặc Booker Prize cho trang award của biacung.com. Dùng khi người dùng nhập ngắn như "Nobel 2024", "Pulitzer 2024", "Booker 2023" hoặc yêu cầu bổ sung dữ liệu giải thưởng văn học theo năm.
---

# Award Data Collector

Nhận tên giải và năm, sau đó hoàn tất dữ liệu đủ để trang `/award/<year>/` sử dụng. Hỗ trợ các tên gọi:

- `Nobel`, `Nobel Văn chương`, `Nobel Literature`
- `Pulitzer`, `Pulitzer Fiction`
- `Booker`, `Booker Prize`

Nếu đầu vào chỉ gồm tên giải và năm thì tự thực hiện toàn bộ quy trình, không hỏi lại. Chỉ xử lý giải/năm được yêu cầu; không âm thầm hoàn thiện các giải khác.

## Quy trình

1. Đọc [references/schema.md](references/schema.md) và file JSON tương ứng trước khi sửa.
2. Tra cứu web vì dữ liệu giải thưởng, ngày công bố, credit và URL nguồn phải được xác minh. Ưu tiên nguồn chính thức của giải; dùng trang nhà xuất bản hoặc tác giả chỉ để bổ sung metadata sách/ảnh còn thiếu. Đối chiếu các chi tiết dễ sai bằng ít nhất hai nguồn độc lập khi nguồn chính thức không nêu rõ.
3. Phân biệt năm **đã công bố** và **đang chờ**:
   - Đã công bố: ghi kết quả thật, ngày công bố và nguồn chính thức.
   - Chưa công bố: chỉ ghi lịch chính thức, `status: "pending"` và `laureates: []`; không dự đoán người thắng.
4. Cập nhật hoặc tạo object của đúng năm trong `laureates_by_year`, giữ nguyên thứ tự lịch sử của file để tránh diff hàng loạt và cập nhật `updated_at` bằng ngày hiện tại.
5. Với ảnh chân dung hoặc bìa, tải bản có nguồn rõ ràng vào `assets/img/awards/` theo mẫu `<year>-<slug>.<ext>` quy định trong schema. Không hotlink, không dùng ảnh tìm kiếm không truy được nguồn, không đổi codec bằng cách chỉ đổi phần mở rộng. Ghi đầy đủ source/credit hiện có.
6. Nếu là giải cho tác phẩm, kiểm tra `data/book.json`. Khi sách đã có trong thư viện, dùng đúng ID nội bộ làm `work.id`; khi chưa có, tạo ID ổn định dạng `author-title`. Không thêm sách vào thư viện và không tạo field `book_id`.
7. Dịch `motivation` hoặc `citation` sang tiếng Việt sát nghĩa, tự nhiên, không thêm diễn giải chưa có trong nguồn. Giữ nguyên văn tiếng Anh trong field gốc.
8. Chạy validator của skill rồi chạy `npm run release:check`. Sửa mọi lỗi thuộc phạm vi dữ liệu vừa cập nhật. Kiểm tra trang `/award/<year>/` khi năm đó đã đủ dữ liệu cho cả ba giải.

```bash
node .agents/skills/award-data-collector/scripts/validate-award-year.js <nobel|pulitzer|booker> <year>
npm run release:check
```

## Nguyên tắc biên tập

- Không xóa metadata lịch sử đang có nếu nguồn mới không chứng minh nó sai.
- Không sao chép schema cũ thiếu field; dùng object 2025/2026 hoàn chỉnh của cùng loại giải làm chuẩn.
- URL nguồn nằm trong JSON nhưng không cần hiển thị trên giao diện.
- Không sửa `assets/js/award.js`, CSS hay template trừ khi dữ liệu hợp lệ thực sự không thể render bằng schema hiện tại.
- Không coi trang năm đã sẵn sàng chỉ vì một giải đã hoàn tất. Hệ thống chỉ sinh `/award/<year>/` khi cả ba dataset đều có object trong `laureates_by_year` của năm đó.

Khi bàn giao, nêu ngắn gọn: giải/năm đã cập nhật, người hoặc tác phẩm thắng giải, nguồn chính thức, ảnh đã thêm, trạng thái link nội bộ của sách và kết quả kiểm tra.
