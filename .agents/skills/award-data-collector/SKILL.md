---
name: award-data-collector
description: Thu thập, đối chiếu và cập nhật dữ liệu một năm của Nobel Văn chương, Pulitzer Fiction, Booker Prize, Prix Goncourt hoặc Goodreads Choice Awards cho trang award của biacung.com. Dùng khi người dùng nhập ngắn như "Nobel 2024", "Pulitzer 2024", "Booker 2023", "Goncourt 2026", "Goodreads 2025" hoặc yêu cầu bổ sung dữ liệu giải thưởng văn học theo năm.
---

# Award Data Collector

Nhận tên giải và năm, sau đó hoàn tất dữ liệu đủ để trang `/award/<year>/` sử dụng. Hỗ trợ các tên gọi:

- `Nobel`, `Nobel Văn chương`, `Nobel Literature`
- `Pulitzer`, `Pulitzer Fiction`
- `Booker`, `Booker Prize`
- `Goncourt`, `Prix Goncourt`
- `Goodreads`, `Goodreads Choice Awards`

Nếu đầu vào chỉ gồm tên giải và năm thì tự thực hiện toàn bộ quy trình, không hỏi lại. Chỉ xử lý giải/năm được yêu cầu; không âm thầm hoàn thiện các giải khác.

## Quy trình

1. Đọc [references/schema.md](references/schema.md) và file JSON tương ứng trước khi sửa.
2. Tra cứu web vì dữ liệu giải thưởng, ngày công bố, credit và URL nguồn phải được xác minh. Ưu tiên nguồn chính thức của giải; dùng trang nhà xuất bản hoặc tác giả chỉ để bổ sung metadata sách/ảnh còn thiếu. Đối chiếu các chi tiết dễ sai bằng ít nhất hai nguồn độc lập khi nguồn chính thức không nêu rõ.
3. Phân biệt năm **đã công bố** và **đang chờ**:
   - Đã công bố: ghi kết quả thật, ngày công bố và nguồn chính thức.
   - Chưa công bố: chỉ ghi lịch chính thức, `status: "pending"` và `laureates: []`; không dự đoán người thắng.
   - Với Goodreads, cửa sổ sách đủ điều kiện do Goodreads xác nhận là lịch chính thức hợp lệ cho record `pending` khi ngày công bố chưa có. Vẫn dùng cùng `status: "pending"`, `schedule_source_url` và `laureates: []`; không tạo trạng thái riêng.
4. Cập nhật hoặc tạo object của đúng năm trong `laureates_by_year`, giữ nguyên thứ tự lịch sử của file để tránh diff hàng loạt và cập nhật `updated_at` bằng ngày hiện tại.
5. Với ảnh chân dung hoặc bìa, tải bản có nguồn rõ ràng vào `assets/img/awards/` theo mẫu `<year>-<slug>.<ext>` quy định trong schema. Không hotlink, không dùng ảnh tìm kiếm không truy được nguồn, không đổi codec bằng cách chỉ đổi phần mở rộng. Ghi đầy đủ source/credit hiện có.
6. Nếu là giải cho tác phẩm, kiểm tra `data/book.json`. Khi sách đã có trong thư viện, dùng đúng ID nội bộ làm `work.id`; khi chưa có, tạo ID ổn định dạng `author-title`. Không thêm sách vào thư viện và không tạo field `book_id`.
7. Dịch `motivation` hoặc `citation` sang tiếng Việt sát nghĩa, tự nhiên, không thêm diễn giải chưa có trong nguồn. Giữ nguyên văn nguồn trong field gốc. Với Goncourt, không tự tạo `citation` khi Académie Goncourt không công bố nhận định của hội đồng.
8. Chạy validator của skill rồi chạy `npm run release:check`. Sửa mọi lỗi thuộc phạm vi dữ liệu vừa cập nhật. Ngay khi một giải/năm đạt validator, kiểm tra trang `/award/<year>/`; không chờ các giải còn lại.
9. Nếu giải/năm có trong [checklist thu thập](COLLECTION_PLAN_1901_2026.md), chỉ đánh dấu hoàn tất sau khi các kiểm tra tương ứng đạt. Checklist chỉ lưu trạng thái, không thêm nhật ký phiên làm việc.

```bash
node .agents/skills/award-data-collector/scripts/validate-award-year.js <nobel|pulitzer|booker|goncourt|goodreads> <year>
npm run release:check
```

## Nguyên tắc biên tập

- Không xóa metadata lịch sử đang có nếu nguồn mới không chứng minh nó sai.
- Không sao chép schema cũ thiếu field; dùng object 2025/2026 hoàn chỉnh của cùng loại giải làm chuẩn.
- URL nguồn nằm trong JSON nhưng không cần hiển thị trên giao diện.
- Không sửa `assets/js/award.js`, CSS hay template trừ khi dữ liệu hợp lệ thực sự không thể render bằng schema hiện tại.
- Một năm được xuất bản khi ít nhất một giải có record đã collect hợp lệ: kết quả công bố có ngày/nguồn/laureate, hoặc trạng thái pending có lịch chính thức và `laureates: []`.
- Object lịch sử chưa đạt schema không được tính là đã collect và không được dùng để tự động tạo trang.
- Với Goodreads, chỉ thu thập sáu hạng mục đã chọn: Fiction, Historical Fiction, Mystery & Thriller, Romance, Fantasy và Nonfiction; mỗi hạng mục phải có số phiếu chính thức.
- Mỗi giải độc lập; trang năm hiển thị các kết quả và record `pending` hợp lệ, theo thứ tự Nobel → Pulitzer → Goncourt → Booker → Goodreads.
- Đánh dấu `Trang năm` sau khi trang của ít nhất một giải đã được sinh và kiểm tra; không cần chờ các cột giải còn lại.

Khi bàn giao, nêu ngắn gọn: giải/năm đã cập nhật, người hoặc tác phẩm thắng giải, nguồn chính thức, ảnh đã thêm, trạng thái link nội bộ của sách và kết quả kiểm tra.
