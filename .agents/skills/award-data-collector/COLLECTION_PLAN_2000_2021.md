# Kế hoạch thu thập dữ liệu award 2000–2026

## Tiêu chuẩn hoàn tất

Mỗi giải/năm chỉ được đánh dấu hoàn tất khi:

- Kết quả, ngày công bố và nguồn chính thức đã được xác minh.
- Metadata đúng schema; nguyên văn nguồn và bản dịch tiếng Việt cùng tồn tại khi giải có citation/motivation chính thức.
- Với kết quả đã công bố, ảnh có nguồn rõ ràng, được lưu local đúng codec và mở được.
- Pulitzer/Booker/Goncourt đã đối chiếu `data/book.json`; chỉ dùng ID nội bộ khi tiêu đề và tác giả khớp.
- Validator riêng của giải/năm đạt.

Mỗi năm chỉ được đánh dấu trang hoàn tất khi:

- Ít nhất một giải của năm đạt tiêu chuẩn trên; các giải độc lập và không chặn việc xuất bản trang.
- `npm run release:check` đạt.
- `/award/<year>/`, canonical, Open Graph và sitemap đã được kiểm tra; trang chỉ hiển thị các giải đã collect hợp lệ.

## Thứ tự thực hiện

Đi từ năm gần nhất về xa nhất. Với các năm đã đủ ba dataset cũ, backfill Goncourt trước rồi kiểm tra lại trang năm. Với các năm cũ còn thiếu nhiều giải: Nobel → Pulitzer → Booker → Goncourt → release/page check. Không chuyển sang năm kế tiếp nếu hàng hiện tại còn lỗi thuộc phạm vi dữ liệu vừa cập nhật.

## Checklist

| Năm | Nobel | Pulitzer | Booker | Goncourt | Trang năm |
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
| 2017 | [x] | [ ] | [ ] | [ ] | [x] |
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
| 2000 | [ ] | [ ] | [ ] | [ ] | [ ] |

## Nhật ký

- 2026-09-26: kiểm kê ban đầu. Nobel/Pulitzer chủ yếu là object lịch sử chưa đủ schema; Booker 2000–2021 chưa có object. Bắt đầu từ Nobel 2021.
- 2026-09-26: Nobel 2021 hoàn tất; validator đạt. Tiếp tục Pulitzer 2021.
- 2026-09-26: Pulitzer 2021 hoàn tất; validator đạt. Tiếp tục Booker 2021.
- 2026-09-26: Booker 2021 hoàn tất; validator đạt. Chuyển sang kiểm tra release và trang năm 2021.
- 2026-09-26: trang 2021 hoàn tất; release check đạt, HTTP 200, canonical/Open Graph và sitemap đã được xác minh.
- 2026-09-26: Nobel 2020 hoàn tất; validator đạt. Tiếp tục Pulitzer 2020.
- 2026-09-26: Booker 2020 hoàn tất; validator đạt. Pulitzer 2020 vẫn đang chờ hoàn thiện trước khi kiểm tra trang năm.
- 2026-09-27: Pulitzer 2020 hoàn tất; validator đạt. Chuyển sang kiểm tra release và trang năm 2020.
- 2026-09-27: trang 2020 hoàn tất; release check đạt, HTTP 200, canonical/Open Graph/JSON-LD và sitemap đã được xác minh.
- 2026-09-27: Nobel 2019 hoàn tất; validator đạt. Tiếp tục Pulitzer 2019.
- 2026-09-27: Pulitzer 2019 hoàn tất; validator đạt. Tiếp tục Booker 2019.
- 2026-09-27: Booker 2019 hoàn tất; validator đạt. Chuyển sang kiểm tra release và trang năm 2019.
- 2026-09-27: trang 2019 hoàn tất; release check đạt, HTTP 200, canonical/Open Graph/JSON-LD và sitemap đã được xác minh.
- 2026-09-27: mở rộng collector và checklist cho Prix Goncourt; các dấu trang năm cũ được đưa về trạng thái chờ kiểm tra theo chuẩn bốn giải.
- 2026-09-27: Goncourt 2026 được ghi nhận ở trạng thái chờ công bố ngày 03/11/2026; validator đạt. Chuyển sang kiểm tra release và trang năm 2026.
- 2026-09-27: trang 2026 hoàn tất theo chuẩn bốn giải; release check đạt, HTTP 200, metadata Goncourt/JSON-LD và khả năng tương thích trang 2025 đã được xác minh.
- 2026-09-27: đổi quy tắc xuất bản sang hợp các record hợp lệ; chỉ cần một giải đã collect là sinh trang năm. Khôi phục trạng thái trang 2019–2025, các cột giải vẫn được theo dõi độc lập.
- 2026-09-27: Booker 2025 được đối chiếu lại theo nguồn chính thức; chuẩn hóa bản dịch citation, xác minh ảnh bìa và giữ trạng thái hoàn tất trong checklist.
- 2026-09-27: Goncourt 2025 hoàn tất; Laurent Mauvignier và La Maison vide được đối chiếu theo Académie Goncourt, ảnh bìa lấy từ Éditions de Minuit và validator đạt.
- 2026-09-27: Goncourt 2024 hoàn tất; Kamel Daoud và Houris được đối chiếu theo Académie Goncourt, lưu citation chính thức cùng ảnh bìa và validator đạt.
- 2026-09-27: Goncourt 2023 hoàn tất; Jean-Baptiste Andrea và Veiller sur elle được đối chiếu theo Académie Goncourt, ảnh bìa lấy từ L’Iconoclaste và validator đạt.
- 2026-09-27: Goncourt 2022 hoàn tất; Brigitte Giraud và Vivre vite được đối chiếu theo Académie Goncourt, ảnh bìa edition Flammarion được lưu local và validator đạt.
- 2026-09-27: Goncourt 2021 hoàn tất; Mohamed Mbougar Sarr và La plus secrète mémoire des hommes được đối chiếu theo Académie Goncourt, ảnh bìa edition Philippe Rey/Jimsaan được lưu local và validator đạt.
- 2026-09-27: Goncourt 2020 hoàn tất; Hervé Le Tellier và L’Anomalie được đối chiếu theo Académie Goncourt, ảnh bìa edition Gallimard được lưu local và validator đạt.
- 2026-09-27: Goncourt 2019 hoàn tất; Jean-Paul Dubois và Tous les hommes n’habitent pas le monde de la même façon được đối chiếu theo Académie Goncourt, ảnh bìa edition Éditions de l’Olivier được lưu local và validator đạt.
- 2026-09-27: Goncourt 2018 hoàn tất; Nicolas Mathieu và Leurs enfants après eux được đối chiếu theo Académie Goncourt, ảnh bìa edition Actes Sud được lưu local và validator đạt.
- 2026-09-27: trang 2018 được sinh từ record Goncourt độc lập; release check đạt, HTTP 200, canonical/Open Graph/JSON-LD và sitemap đã được xác minh.
- 2026-09-27: Nobel 2018 hoàn tất; Olga Tokarczuk được đối chiếu theo Nobel Prize, ghi đúng ngày công bố hoãn sang năm 2019, lưu chân dung chính thức và validator đạt.
- 2026-09-27: Pulitzer 2018 hoàn tất; Andrew Sean Greer và Less được đối chiếu theo Pulitzer/Hachette, ảnh bìa edition gốc được lưu local và validator đạt; không có bản ghi sách nội bộ khớp để liên kết.
- 2026-09-27: trang 2018 được kiểm tra lại với Nobel, Pulitzer và Goncourt theo đúng thứ tự; release check đạt, HTTP 200 cho trang/dataset/ảnh, canonical/Open Graph/JSON-LD và sitemap đã được xác minh.
- 2026-09-27: Booker 2018 hoàn tất; Anna Burns và Milkman được đối chiếu theo Booker/Faber, bìa Faber được lưu local và validator đạt; không có bản ghi sách nội bộ khớp để liên kết.
- 2026-09-27: trang 2018 hoàn tất đủ bốn giải; release check đạt, HTTP 200 cho trang/dataset/ảnh, JSON-LD đã được xác minh theo thứ tự Nobel → Pulitzer → Goncourt → Booker.
- 2026-09-27: Nobel 2017 hoàn tất; Kazuo Ishiguro được đối chiếu theo Nobel Prize, chân dung chính thức có credit được lưu local và validator đạt.
- 2026-09-27: trang 2017 được sinh từ record Nobel độc lập; release check đạt, HTTP 200 cho trang/dataset/ảnh, canonical/Open Graph/JSON-LD và sitemap đã được xác minh; ba giải chưa collect không xuất hiện.
- 2026-09-27: Nobel 2016 hoàn tất; Bob Dylan được đối chiếu theo Nobel Prize, chân dung chính thức của William Claxton được lưu local và validator đạt.
- 2026-09-27: trang 2016 được sinh từ record Nobel độc lập; release check đạt, HTTP 200 cho trang/dataset/ảnh, canonical/Open Graph/JSON-LD và sitemap đã được xác minh; ba giải chưa collect không xuất hiện.
- 2026-09-27: Nobel 2015 hoàn tất; Svetlana Alexievich được đối chiếu theo Nobel Prize, chân dung chính thức có credit Alexander Mahmoud được lưu local và validator đạt.
- 2026-09-27: trang 2015 được sinh từ record Nobel độc lập; release check đạt, HTTP 200 cho trang/dataset/ảnh, canonical/Open Graph/JSON-LD và sitemap đã được xác minh; ba giải chưa collect không xuất hiện.
- 2026-09-27: Nobel 2014 hoàn tất; Patrick Modiano được đối chiếu theo Nobel Prize, chân dung chính thức có credit Alexander Mahmoud được lưu local và validator đạt.
- 2026-09-27: trang 2014 được sinh từ record Nobel độc lập; release check đạt, HTTP 200 cho trang/dataset/ảnh, canonical/Open Graph/JSON-LD và sitemap đã được xác minh; ba giải chưa collect không xuất hiện.
- 2026-09-27: Nobel 2013 hoàn tất; Alice Munro được đối chiếu theo Nobel Prize, chân dung chính thức của Jenny Munro được lưu local và validator đạt.
- 2026-09-27: trang 2013 được sinh từ record Nobel độc lập; release check đạt, HTTP 200 cho trang/dataset/ảnh, canonical/Open Graph/JSON-LD và sitemap đã được xác minh; ba giải chưa collect không xuất hiện.
- 2026-09-27: Nobel 2012 hoàn tất; Mo Yan được đối chiếu theo Nobel Prize, chân dung chính thức của U. Montan được lưu local và validator đạt.
- 2026-09-27: trang 2012 được sinh từ record Nobel độc lập; release check đạt, HTTP 200 cho trang/dataset/ảnh, canonical/Open Graph/JSON-LD và sitemap đã được xác minh; ba giải chưa collect không xuất hiện.
- 2026-09-27: Nobel 2011 hoàn tất; Tomas Tranströmer được đối chiếu theo Nobel Prize, record cũ được đưa về đúng cấp năm, chân dung chính thức của U. Montan được lưu local và validator đạt.
- 2026-09-27: trang 2011 được sinh từ record Nobel độc lập; release check đạt, HTTP 200 cho trang/dataset/ảnh, canonical/Open Graph/JSON-LD và sitemap đã được xác minh; ba giải chưa collect không xuất hiện.
- 2026-09-27: Nobel 2010 hoàn tất; Mario Vargas Llosa được đối chiếu theo Nobel Prize, chân dung chính thức của U. Montan được lưu local và validator đạt.
- 2026-09-27: trang 2010 được sinh từ record Nobel độc lập; release check đạt, HTTP 200 cho trang/dataset/ảnh, canonical/Open Graph/JSON-LD và sitemap đã được xác minh; ba giải chưa collect không xuất hiện.
- 2026-09-27: Nobel 2009 hoàn tất; Herta Müller được đối chiếu theo Nobel Prize, record cũ được đưa về đúng cấp năm, chân dung chính thức của U. Montan được lưu local và validator đạt.
- 2026-09-27: trang 2009 được sinh từ record Nobel độc lập; release check đạt, HTTP 200 cho trang/dataset/ảnh, canonical/Open Graph/JSON-LD và sitemap đã được xác minh; ba giải chưa collect không xuất hiện, record 2008 chưa collect vẫn không được xuất bản.
- 2026-09-27: Nobel 2008 hoàn tất; Jean-Marie Gustave Le Clézio được đối chiếu theo Nobel Prize, record legacy được chuẩn hóa theo schema, chân dung chính thức của U. Montan được lưu local và validator đạt.
- 2026-09-27: trang 2008 được sinh từ record Nobel độc lập; release check đạt, HTTP 200 cho trang/dataset/ảnh, canonical/Open Graph/JSON-LD và sitemap đã được xác minh; ba giải chưa collect không xuất hiện.
- 2026-09-27: Nobel 2006 hoàn tất; Orhan Pamuk được đối chiếu theo Nobel Prize, chân dung chính thức của U. Montan được lưu local và validator đạt.
- 2026-09-27: trang 2006 được sinh từ record Nobel độc lập; release check đạt, HTTP 200 cho trang/dataset/ảnh, canonical/Open Graph/JSON-LD và sitemap đã được xác minh; ba giải chưa collect không xuất hiện, Nobel 2007 vẫn giữ trạng thái chờ collect.
- 2026-09-27: Nobel 2007 hoàn tất; Doris Lessing được đối chiếu theo Nobel Prize, record legacy được chuẩn hóa theo schema, chân dung chính thức của U. Montan được lưu local và validator đạt.
- 2026-09-27: trang 2007 được sinh từ record Nobel độc lập; release check đạt, HTTP 200 cho trang/dataset/ảnh, canonical/Open Graph/JSON-LD và sitemap đã được xác minh; ba giải chưa collect không xuất hiện.
- 2026-09-27: Nobel 2005 hoàn tất; Harold Pinter được đối chiếu theo Nobel Prize, record cũ được đưa về đúng cấp năm, chân dung chính thức của U. Montan được lưu local và validator đạt.
- 2026-09-27: trang 2005 được sinh từ record Nobel độc lập; release check đạt, HTTP 200 cho trang/dataset/ảnh, canonical/Open Graph/JSON-LD và sitemap đã được xác minh; ba giải chưa collect không xuất hiện, record 2004 chưa collect vẫn không được xuất bản.
- 2026-09-27: Nobel 2004 hoàn tất; Elfriede Jelinek được đối chiếu theo Nobel Prize, record legacy được chuẩn hóa theo schema, chân dung chính thức từ kho lưu trữ Nobel Foundation được lưu local và validator đạt.
- 2026-09-27: trang 2004 được sinh từ record Nobel độc lập; release check đạt, HTTP 200 cho trang/dataset/ảnh, canonical/Open Graph/JSON-LD và sitemap đã được xác minh; ba giải chưa collect không xuất hiện.
- 2026-09-27: Nobel 2003 hoàn tất; J. M. Coetzee được đối chiếu theo Nobel Prize, record legacy được chuẩn hóa theo schema, chân dung chính thức của Ulla Montan được lưu local và validator đạt.
- 2026-09-27: trang 2003 được sinh từ record Nobel độc lập; release check đạt, HTTP 200 cho trang/dataset/ảnh, canonical/Open Graph/JSON-LD và sitemap đã được xác minh; ba giải chưa collect không xuất hiện.
- 2026-09-27: Nobel 2002 hoàn tất; Imre Kertész được đối chiếu theo Nobel Prize, record legacy được chuẩn hóa theo schema, chân dung chính thức từ kho lưu trữ Nobel Foundation được lưu local và validator đạt.
- 2026-09-27: trang 2002 được sinh từ record Nobel độc lập; release check đạt, HTTP 200 cho trang/dataset/ảnh, canonical/Open Graph/JSON-LD và sitemap đã được xác minh; ba giải chưa collect không xuất hiện.
- 2026-09-27: Nobel 2001 hoàn tất; V. S. Naipaul được đối chiếu theo Nobel Prize, record legacy được chuẩn hóa theo schema, chân dung chính thức từ kho lưu trữ Nobel Foundation được lưu local và validator đạt.
- 2026-09-27: trang 2001 được sinh từ record Nobel độc lập; release check đạt, HTTP 200 cho trang/dataset/ảnh, canonical/Open Graph/JSON-LD và sitemap đã được xác minh; ba giải chưa collect không xuất hiện.
