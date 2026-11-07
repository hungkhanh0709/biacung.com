---
name: check-book-new
description: "Điểm tin sách mới trong ngày từ danh sách fanpage công ty phát hành qua Chrome MCP, bỏ bài marketing và lưu bảng booknew_yyyymmdd.md. Dùng khi gọi /check-book-new, $check-book-new hoặc yêu cầu kiểm tra tin sách mới trên các fanpage đã lưu; không dùng cho bước nhập sách vào website."
---

# Check Book New

Lướt fanpage cuối ngày như người dùng: giữ chế độ xem mặc định, đọc một lượng nhỏ bài gần đây, ghi lại tựa sách có tin phát hành đáng chú ý.

## Đầu vào và phạm vi

- Mỗi lần chạy, đọc [fanpages.yaml](fanpages.yaml) cạnh skill. Đây là nguồn danh sách duy nhất; duyệt tuần tự từ trên xuống, giữ nguyên thứ tự cả trong báo cáo. Người dùng có thể thêm, xóa hoặc đổi thứ tự các mục `name` và `url`.
- Mặc định xem bài đăng **hôm nay**, theo múi giờ `Asia/Ho_Chi_Minh`. Xác định ngày thực tế khi chạy, không lấy ngày trong ví dụ hoặc ngày tạo skill. Nếu người dùng chỉ định ngày/khoảng ngày thì dùng phạm vi đó.
- Mục đích là ghi chú tin phát hành, không kiểm tra sách đã tồn tại trong dữ liệu website và không tự nhập sách. Một tựa đã có trên website vẫn có thể có tin tái bản hoặc edition mới.

## Duyệt bằng Chrome MCP

1. Tìm công cụ Chrome MCP và dùng `list_pages` kiểm tra kết nối. Tận dụng phiên đăng nhập sẵn có; mở một tab để kiểm tra và dùng lại tab đó lần lượt cho các URL trong danh sách. Giữ các tab khác của người dùng.
2. Giữ tab/bộ lọc/thứ tự bài mặc định của fanpage; không chuyển sang chế độ mới nhất hoặc tìm kiếm. Lấy snapshot mới để đọc và tương tác. Mở “Xem thêm” khi cần hiểu tin phát hành; mở link bài hoặc hover thời gian khi cần xác định ngày và permalink.
3. Đọc các bài đầu trang rồi cuộn ngắn khi cần. Mặc định tối đa 3 lượt cuộn mỗi fanpage, chỉ để đọc nhóm bài gần đây; không đào lịch sử. Nếu thấy vài bài cũ liên tiếp và không còn bài thuộc ngày cần xem thì có thể sang fanpage kế tiếp. Bài ghim và thứ tự mặc định có thể không theo thời gian: không dừng chỉ vì một bài cũ, và không tính bài ghim cũ thành tin hôm nay.
4. Đối chiếu thời gian từng bài theo múi giờ trên. Với nhãn tương đối như “2 giờ”, dùng thời điểm kiểm tra; gần ranh giới ngày thì mở thông tin thời gian nếu có. Không xác định được ngày thì ghi chú chưa xác minh, không tự gán vào hôm nay. Ngày phát hành trong nội dung có thể ở tương lai; ngày bài đăng mới quyết định bài có thuộc phạm vi kiểm tra hay không.
5. Chỉ lấy nội dung đang hiển thị và link công khai cần cho ghi chú; có thể xem ảnh đính kèm nếu thông tin phát hành nằm trên ảnh. Không lấy cookie/token hay gọi API nội bộ. Không like, bình luận, chia sẻ, theo dõi, nhắn tin hoặc đặt hàng.
6. Gặp lỗi một trang thì ghi trạng thái và tiếp tục trang kế tiếp nếu phiên vẫn dùng được. Gặp CAPTCHA, checkpoint hoặc thông báo chặn/tốc độ thì dừng duyệt, ghi rõ các trang còn lại chưa kiểm tra; không tự vượt chặn hay lặp truy cập. Lỗi kết nối/profile Chrome thì báo đúng lỗi đó, không gọi là Facebook chặn, không tự tắt trình duyệt của người dùng.

## Nhận diện sách mới

Chọn bài có **tựa sách nhận diện được** và **nội dung thông báo phát hành/mở bán**. Đây là đánh giá theo ngữ cảnh, không phải phép khớp từ khóa cứng.

- Dấu hiệu người dùng quan tâm: tên sách, tác giả, dịch giả; các cụm “mời các bạn đón đọc”, “thông tin phát hành”, “chính thức phát hành”, “tái xuất”, “đặt trước”. Các cách diễn đạt tương đương như “sắp ra mắt”, “mở bán”, “tái bản” cũng phù hợp nếu có tin phát hành cụ thể.
- Tính cả sách mới, tái bản/tái xuất, bản dịch/edition mới và mở đặt trước. Khi hữu ích, thêm nhãn ngắn `(đặt trước)`, `(tái bản)` hoặc `(bản đặc biệt)` sau tựa.
- Không bắt buộc phải có đủ tác giả và dịch giả; không đoán thông tin còn thiếu. Từ khóa xuất hiện trong một bài quảng bá lại sách cũ chưa đủ để kết luận có tin mới.
- Bỏ bài trích dẫn, review, giới thiệu lại sách cũ, khuyến mãi, minigame, chúc mừng hoặc sự kiện nếu không kèm thông báo phát hành cụ thể. Teaser chưa lộ tựa thì không đặt tên thay; nếu đáng chú ý, ghi một dòng ngắn dưới bảng.
- Bài có nhiều tựa thì lấy các tựa có thông báo phát hành. Gộp trùng cùng tựa/edition trong một công ty trong ngày; giữ riêng edition khác nếu bài nêu rõ khác biệt.

## Báo cáo

- Lưu ở **repo root**: `booknew_yyyymmdd.md`, với ngày kiểm tra theo phạm vi yêu cầu. Nếu là khoảng nhiều ngày, dùng ngày cuối khoảng cho tên file và ghi rõ khoảng trong nội dung.
- Chỉ dùng **hai cột**: `Cty sách` và `Sách mới`. Mỗi fanpage một dòng, đủ danh sách và đúng thứ tự. Tựa sách là link đến bài Facebook nguồn khi lấy được permalink; nhiều tựa cách nhau bằng `<br>`. Nếu chưa lấy được permalink thì giữ tựa đã xác minh và ghi chú thiếu link, không bịa URL.
- Ghi `-` nếu đã xem nhưng không thấy tin phù hợp trong phần bài đã đọc. Ghi `Chưa kiểm tra — ...` hoặc `Kiểm tra chưa đủ — ...` nếu lỗi/chặn/không xác minh được ngày; không dùng `-` cho các trường hợp này. Nếu đã thấy tựa nhưng kiểm tra chưa đủ, giữ tựa và thêm trạng thái vào cùng ô.
- Đầu file ghi ngày, giờ kiểm tra và phạm vi: “Các bài đọc được trên feed mặc định; không bảo đảm bao quát mọi bài trong ngày.” Ghi thêm giới hạn cụ thể nếu có, không khẳng định đã xem toàn bộ.
- Chạy lại cùng ngày: đọc báo cáo cũ, hợp nhất các tựa đã xác minh, bỏ trùng và cập nhật giờ/trạng thái; không xóa phát hiện trước chỉ vì lần này feed không hiện bài đó. Phân biệt kết quả đã đọc trước đó và lỗi ở lượt hiện tại nếu cần. Không tạo thêm file trạng thái riêng.

Ví dụ hình thức bảng (không phải kết quả kiểm tra thực tế):

```markdown
| Cty sách | Sách mới |
| --- | --- |
| Đông A | - |
| Đông Tây | - |
| Tao Đàn | - |
| Huy Hoàng | [Hai Số Phận](permalink-bai-dang) |
```

Cuối lượt, trả link file báo cáo, số tựa ghi nhận và các trang chưa kiểm tra được nếu có. Chỉ tạo báo cáo khi thực sự chạy kiểm tra; không tạo bảng toàn dấu `-` khi chỉ đang xây/sửa skill.
