# Schema dữ liệu award

## Ánh xạ dataset

| Đầu vào | File | Loại dữ liệu | Nguồn chính ưu tiên |
|---|---|---|---|
| Nobel | `data/awards/nobel_literature.json` | Người đoạt giải | `nobelprize.org` |
| Pulitzer | `data/awards/pulitzer_fiction.json` | Tác phẩm đoạt giải | `pulitzer.org` |
| Booker | `data/awards/booker_prize.json` | Tác phẩm đoạt giải | `thebookerprizes.com` |
| Goncourt | `data/awards/goncourt.json` | Tác phẩm đoạt giải | `academiegoncourt.com` |
| Goodreads | `data/awards/goodreads_choice.json` | Sáu tác phẩm theo hạng mục | `goodreads.com/choiceawards` |

Trang award lấy hợp của các năm đã collect hợp lệ trong năm dataset. Chỉ cần một giải hợp lệ là sinh `/award/<year>/`; các giải chưa collect không xuất hiện trên trang và không chặn giải khác. Object lịch sử chỉ có key năm nhưng thiếu ngày, nguồn hoặc kết quả hợp lệ không được tính là đã collect.

Thứ tự hiển thị cố định: Nobel → Pulitzer → Goncourt → Booker → Goodreads.

## Object của năm

Kết quả đã công bố:

```json
{
  "announced_on": "YYYY-MM-DD",
  "source_url": "https://official.example/...",
  "laureates": []
}
```

Khi giải đã công bố longlist/shortlist nhưng chưa có người thắng, có thể thêm `selection_stage` và `selection_source_url` để truy nguyên trạng thái hiện tại; vẫn giữ `status: "pending"` và không đưa ứng viên vào `laureates`.

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

Khi Goodreads mới công bố cửa sổ sách đủ điều kiện nhưng chưa công bố ngày bình chọn/kết quả, vẫn dùng cùng object `pending`:

```json
{
  "status": "pending",
  "eligibility_start": "YYYY-MM-DD",
  "eligibility_end": "YYYY-MM-DD",
  "schedule_source_url": "https://www.goodreads.com/choiceawards/.../rules",
  "status_note": "Thông tin ngắn, đúng phạm vi nguồn chính thức.",
  "laureates": []
}
```

Đây là record `pending` hợp lệ và được render bằng cùng component chờ như Nobel hoặc Booker. Khi Goodreads công bố ngày kết quả, bổ sung `announcement_date`; không tạo trạng thái trung gian riêng.

## Nobel Văn chương

Mỗi phần tử `laureates` dùng cấu trúc:

```json
{
  "id": "name-country",
  "name": "Tên đúng dấu",
  "name_vi": "Tên quen dùng trong tiếng Việt, nếu có nguồn đáng tin cậy",
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
`name_vi` là metadata tùy chọn: chỉ thêm khi tên Việt hóa/Hán–Việt đã được dùng ổn định trong xuất bản hoặc báo chí Việt Nam; luôn giữ `name` theo nguồn Nobel làm tên chính.

## Pulitzer Fiction, Booker Prize và Prix Goncourt

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
  "citation": "Official citation in its source language",
  "citation_vi": "Bản dịch tiếng Việt",
  "prize_amount": "Giá trị giải nếu nguồn xác nhận"
}
```

Với Goncourt, `citation` và `citation_vi` chỉ bắt buộc khi Académie Goncourt thực sự công bố nhận định của hội đồng. Không dùng mô tả của nhà xuất bản thay cho citation chính thức. `prize_amount` là `€10` khi nguồn chính thức xác nhận khoản tiền thưởng tượng trưng.

Không tạo `book_id`. `work.id` vừa là ID dữ liệu award vừa là ứng viên liên kết nội bộ. Để liên kết đến `/detail?id=<id>`, ID đó phải khớp filename lấy từ `detail` trong `data/book.json`; xác minh tiêu đề và tác giả trước khi dùng ID nội bộ.

Với đồng giải, tạo đủ mọi laureate/work trong cùng mảng. Không nhầm người thắng với finalist, longlist, shortlist hay một giải Goncourt khu vực/biến thể.

## Goodreads Choice Awards

Chỉ theo dõi sáu hạng mục theo đúng thứ tự: `fiction`, `historical-fiction`, `mystery-thriller`, `romance`, `fantasy`, `nonfiction`. Một năm đã công bố chỉ hợp lệ khi có đủ sáu hạng mục, `total_votes_cast` và số phiếu của từng tác phẩm.

```json
{
  "announced_on": "YYYY-MM-DD",
  "source_url": "https://www.goodreads.com/choiceawards/best-books-YYYY",
  "total_votes_cast": 1234567,
  "laureates": [
    {
      "category": "fiction",
      "category_name": "Fiction",
      "category_name_vi": "Tiểu thuyết",
      "category_source_url": "https://www.goodreads.com/choiceawards/...",
      "vote_count": 123456,
      "name": "Tên tác giả",
      "work": {
        "id": "author-title",
        "title": "Tên tác phẩm",
        "work_url": "https://...",
        "publisher": "Nhà xuất bản",
        "published_year": 2026,
        "cover": {
          "src": "assets/img/awards/YYYY-goodreads-title.jpg",
          "alt": "Bìa ...",
          "source_url": "https://..."
        }
      }
    }
  ]
}
```

Không dùng mô tả biên tập của Goodreads làm `citation`. Trang chỉ liên kết nội bộ khi `work.id`, tiêu đề và tác giả khớp dữ liệu thư viện.

## Ảnh

- Nobel portrait: `assets/img/awards/YYYY-person-slug.<ext>`
- Bìa sách: `assets/img/awards/YYYY-title-slug.<ext>`
- Ưu tiên JPEG/WebP hợp lý cho ảnh chụp; giữ PNG khi nguồn có transparency hoặc artwork cần lossless.
- Kiểm tra file tải về thực sự là ảnh và mở được; tránh lưu HTML lỗi với đuôi ảnh.
- Crop/resize chỉ khi cần cho bố cục và không làm sai nội dung bìa hay credit. Giữ tỷ lệ chân dung/bìa phù hợp với component hiện tại.

## Kiểm tra hoàn tất

- JSON parse được; không có key trùng hoặc `book_id`.
- `updated_at` và object năm trong `laureates_by_year` nhất quán.
- Ngày, người thắng, tác phẩm, publisher, citation/motivation (khi có) và số tiền đều có nguồn.
- Với kết quả đã công bố, mọi `photo.src`/`cover.src` tồn tại local; alt và credit hợp lệ.
- Nguyên văn nguồn và bản dịch tiếng Việt cùng tồn tại khi giao diện hiển thị song ngữ.
- Với Goodreads đã công bố, có đủ sáu hạng mục được theo dõi và số phiếu của từng hạng mục.
- `validate-award-year.js` và `npm run release:check` đều pass.
