# Checklist thu thập dữ liệu giải thưởng văn học

File này theo dõi tiến độ thu thập dữ liệu theo **năm × giải thưởng**. Nội dung chi tiết của từng record nằm trong dataset; file này chỉ giữ định hướng và trạng thái hoàn tất.

Quy ước:

- `[x]`: đã đạt đầy đủ tiêu chuẩn hoàn tất.
- `[ ]`: chưa thu thập, chưa kiểm tra hoặc record cũ chưa đạt schema hiện tại.
- Mỗi ô giải thưởng độc lập; không chờ các giải khác trong cùng năm.
- `Trang năm` có thể hoàn tất ngay khi ít nhất một giải của năm đã hợp lệ.

## Tiêu chuẩn hoàn tất

Chỉ đánh dấu một ô giải thưởng `[x]` sau khi:

- Kết quả hoặc lịch công bố đang chờ được xác minh từ nguồn chính thức.
- Record đúng [schema dữ liệu](references/schema.md), có nguyên văn và bản dịch tiếng Việt khi cần.
- Ảnh có nguồn và credit rõ ràng, được lưu local đúng định dạng và mở được.
- Giải trao cho tác phẩm đã đối chiếu `data/book.json`; chỉ liên kết khi ID, tiêu đề và tác giả cùng khớp.
- Validator của đúng giải/năm đạt.

Chỉ đánh dấu `Trang năm` `[x]` sau khi:

- Có ít nhất một giải hợp lệ trong năm.
- `npm run release:check` đạt.
- Trang `/award/<year>/`, dataset, ảnh và sitemap truy cập được.
- Canonical, Open Graph, JSON-LD và thứ tự hiển thị giải đã được kiểm tra.
- Trang không hiển thị các giải chưa collect hợp lệ.

## Cách sử dụng

1. Chọn một ô `[ ]` và chỉ collect đúng giải/năm đó.
2. Làm theo [Award Data Collector](SKILL.md) và schema của giải.
3. Chạy validator riêng, `npm run release:check` và kiểm tra trang năm.
4. Đổi ô giải thành `[x]`; đổi `Trang năm` thành `[x]` nếu đạt tiêu chuẩn ở trên.
5. Không ghi nhật ký theo phiên, tên người thắng hoặc chi tiết nguồn vào file này.

Có thể đi từ năm gần nhất về quá khứ để ưu tiên dữ liệu mới, nhưng một năm chưa đủ mọi giải không chặn việc collect năm khác.

## Mở rộng phạm vi

### Thêm năm

- Năm mới hơn: thêm một hàng ở đầu bảng.
- Năm cũ hơn: thêm một hàng ở cuối bảng.
- Khởi tạo tất cả ô mới là `[ ]`; chỉ đánh dấu sau khi kiểm tra thực tế.

### Thêm giải thưởng

Trước khi thêm cột mới vào checklist:

1. Bổ sung dataset, nguồn chính thức ưu tiên và schema tương ứng.
2. Bổ sung validator và khả năng sinh/render trang năm.
3. Xác định vị trí hiển thị của giải trong trang.
4. Thêm cột trước `Trang năm`, khởi tạo các ô là `[ ]` rồi backfill độc lập.

Thứ tự hiện tại: **Nobel → Pulitzer → Goncourt → Booker**.

## Tiến độ 2000–2026

| Năm | Nobel | Pulitzer | Goncourt | Booker | Trang năm |
|---:|:---:|:---:|:---:|:---:|:---:|
| 2026 | [x] | [x] | [x] | [x] | [x] |
| 2025 | [x] | [x] | [x] | [x] | [x] |
| 2024 | [x] | [x] | [x] | [x] | [x] |
| 2023 | [x] | [x] | [x] | [x] | [x] |
| 2022 | [x] | [x] | [x] | [x] | [x] |
| 2021 | [x] | [x] | [x] | [x] | [x] |
| 2020 | [x] | [x] | [x] | [x] | [x] |
| 2019 | [x] | [x] | [x] | [x] | [x] |
| 2018 | [x] | [x] | [x] | [x] | [x] |
| 2017 | [x] | [x] | [x] | [x] | [x] |
| 2016 | [x] | [ ] | [ ] | [ ] | [x] |
| 2015 | [x] | [ ] | [ ] | [ ] | [x] |
| 2014 | [x] | [ ] | [ ] | [ ] | [x] |
| 2013 | [x] | [ ] | [ ] | [ ] | [x] |
| 2012 | [x] | [ ] | [ ] | [ ] | [x] |
| 2011 | [x] | [ ] | [ ] | [ ] | [x] |
| 2010 | [x] | [ ] | [ ] | [ ] | [x] |
| 2009 | [x] | [ ] | [ ] | [ ] | [x] |
| 2008 | [x] | [ ] | [ ] | [ ] | [x] |
| 2007 | [x] | [ ] | [ ] | [ ] | [x] |
| 2006 | [x] | [ ] | [ ] | [ ] | [x] |
| 2005 | [x] | [ ] | [ ] | [ ] | [x] |
| 2004 | [x] | [ ] | [ ] | [ ] | [x] |
| 2003 | [x] | [ ] | [ ] | [ ] | [x] |
| 2002 | [x] | [ ] | [ ] | [ ] | [x] |
| 2001 | [x] | [ ] | [ ] | [ ] | [x] |
| 2000 | [x] | [ ] | [ ] | [ ] | [x] |
