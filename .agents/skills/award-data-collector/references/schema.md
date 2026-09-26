# Schema dữ liệu award

## Ánh xạ dataset

| Đầu vào | File | Loại dữ liệu | Nguồn chính ưu tiên |
|---|---|---|---|
| Nobel | `data/awards/nobel_literature.json` | Người đoạt giải | `nobelprize.org` |
| Pulitzer | `data/awards/pulitzer_fiction.json` | Tác phẩm đoạt giải | `pulitzer.org` |
| Booker | `data/awards/booker_prize.json` | Tác phẩm đoạt giải | `thebookerprizes.com` |

Trang award lấy giao của các key trong `laureates_by_year` của cả ba file. Vì vậy một năm chỉ xuất hiện trên giao diện khi năm đó tồn tại trong đủ ba dataset.

## Object của năm

Kết quả đã công bố:

```json
{
  "announced_on": "YYYY-MM-DD",
  "source_url": "https://official.example/...",
  "laureates": []
}
```

Kết quả chưa công bố:

```json
{
  "status": "pending",
  "announcement_date": "YYYY-MM-DD",
  "schedule_source_url": "https://official.example/...",
  "status_note": "Thông tin ngắn, đã được nguồn chính thức xác nhận.",
  "laureates": []
}
```

Chỉ dùng ngày ISO đã được xác minh. Với giải đã công bố, không giữ `status: "pending"`, `announcement_date` hoặc `schedule_source_url`.

## Nobel Văn chương

Mỗi phần tử `laureates` dùng cấu trúc:

```json
{
  "id": "name-country",
  "name": "Tên đúng dấu",
  "country": "Country in English",
  "country_vi": "Quốc tịch dùng trên giao diện tiếng Việt",
  "born_year": 1900,
  "born_place": "Nơi sinh theo nguồn Nobel",
  "motivation": "Official English motivation",
  "motivation_vi": "Bản dịch tiếng Việt",
  "profile_url": "https://www.nobelprize.org/prizes/literature/YYYY/.../facts/",
  "photo": {
    "src": "assets/img/awards/YYYY-person-slug.jpg",
    "alt": "Chân dung nhà văn ...",
    "creator": "Tên tác giả ảnh",
    "source_url": "URL trang chứa ảnh",
    "license": "Credit/copyright đúng như nguồn",
    "license_url": "URL điều khoản hoặc giấy phép",
    "note": "Ghi chú nguồn nếu hữu ích"
  }
}
```

`language` và `genre` là metadata tùy chọn. Không suy đoán quốc tịch từ nơi sinh. Nếu Nobel trao cho nhiều người, giữ đúng thứ tự của nguồn chính thức và tạo một object cho mỗi người.

## Pulitzer Fiction và Booker Prize

Mỗi phần tử `laureates` dùng cấu trúc:

```json
{
  "name": "Tên tác giả",
  "profile_url": "URL hồ sơ chính thức nếu có",
  "work": {
    "id": "author-title",
    "title": "Tên tác phẩm",
    "work_url": "URL tác phẩm chính thức hoặc nhà xuất bản nếu có",
    "publisher": "Nhà xuất bản của edition thắng giải",
    "published_year": 2024,
    "cover": {
      "src": "assets/img/awards/YYYY-title-slug.jpg",
      "alt": "Bìa tiểu thuyết ... của ...",
      "source_url": "URL trực tiếp đến trang nguồn của bìa"
    }
  },
  "citation": "Official English citation",
  "citation_vi": "Bản dịch tiếng Việt",
  "prize_amount": "Giá trị giải nếu nguồn xác nhận"
}
```

Không tạo `book_id`. `work.id` vừa là ID dữ liệu award vừa là ứng viên liên kết nội bộ. Để liên kết đến `/detail?id=<id>`, ID đó phải khớp filename lấy từ `detail` trong `data/book.json`; xác minh tiêu đề và tác giả trước khi dùng ID nội bộ.

Với đồng giải, tạo đủ mọi laureate/work trong cùng mảng. Không nhầm Pulitzer winner với finalist, hoặc Booker winner với longlist/shortlist.

## Ảnh

- Nobel portrait: `assets/img/awards/YYYY-person-slug.<ext>`
- Bìa sách: `assets/img/awards/YYYY-title-slug.<ext>`
- Ưu tiên JPEG/WebP hợp lý cho ảnh chụp; giữ PNG khi nguồn có transparency hoặc artwork cần lossless.
- Kiểm tra file tải về thực sự là ảnh và mở được; tránh lưu HTML lỗi với đuôi ảnh.
- Crop/resize chỉ khi cần cho bố cục và không làm sai nội dung bìa hay credit. Giữ tỷ lệ chân dung/bìa phù hợp với component hiện tại.

## Kiểm tra hoàn tất

- JSON parse được; không có key trùng hoặc `book_id`.
- `updated_at` và object năm trong `laureates_by_year` nhất quán.
- Ngày, người thắng, tác phẩm, publisher, citation/motivation và số tiền đều có nguồn.
- Mọi `photo.src`/`cover.src` tồn tại local; alt và credit hợp lệ.
- Dữ liệu tiếng Anh và bản dịch tiếng Việt cùng tồn tại khi giao diện hiển thị song ngữ.
- `validate-award-year.js` và `npm run release:check` đều pass.
