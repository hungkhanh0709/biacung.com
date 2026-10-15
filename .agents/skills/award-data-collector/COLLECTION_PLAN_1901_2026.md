# Checklist thu thập dữ liệu giải thưởng văn học

File này theo dõi tiến độ thu thập dữ liệu theo **năm × giải thưởng**. Nội dung chi tiết của từng record nằm trong dataset; file này chỉ giữ định hướng và trạng thái hoàn tất.

Quy ước:

- `[x]`: đã đạt đầy đủ tiêu chuẩn hoàn tất.
- `[ ]`: chưa thu thập, chưa kiểm tra hoặc record cũ chưa đạt schema hiện tại.
- `[-]`: không áp dụng vì giải chưa tồn tại trong năm đó. Năm giải đã tồn tại nhưng không trao giải vẫn là `[ ]` cho đến khi trạng thái không trao giải được nguồn chính thức xác minh, schema và validator hỗ trợ.
- Mỗi ô giải thưởng độc lập; không chờ các giải khác trong cùng năm.
- `Trang năm` có thể hoàn tất ngay khi ít nhất một giải của năm đã hợp lệ.

## Tiêu chuẩn hoàn tất

Chỉ đánh dấu một ô giải thưởng `[x]` sau khi:

- Kết quả hoặc lịch công bố đang chờ được xác minh từ nguồn chính thức.
- Record đúng [schema dữ liệu](references/schema.md), có nguyên văn và bản dịch tiếng Việt khi cần.
- Ảnh có nguồn và credit rõ ràng, được lưu local đúng định dạng và mở được.
- Giải trao cho tác phẩm đã đối chiếu `data/book.json`; chỉ liên kết khi ID, tiêu đề và tác giả cùng khớp.
- Validator của đúng giải/năm đạt.

Riêng `Goodreads`, một năm chỉ hoàn tất khi có đủ sáu hạng mục được theo dõi: **Fiction, Historical Fiction, Mystery & Thriller, Romance, Fantasy và Nonfiction**. Ghi lại số phiếu của từng tác phẩm; không dùng mô tả biên tập của Goodreads làm citation.

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

Thứ tự hiện tại: **Nobel → Pulitzer → Goncourt → Booker → Goodreads (Lựa chọn của độc giả)**.

## Tiến độ 1901–2026

| Năm | Nobel | Pulitzer | Goncourt | Booker | Goodreads | Trang năm |
|---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 2026 | [x] | [x] | [x] | [x] | [x] | [x] |
| 2025 | [x] | [x] | [x] | [x] | [x] | [x] |
| 2024 | [x] | [x] | [x] | [x] | [ ] | [x] |
| 2023 | [x] | [x] | [x] | [x] | [ ] | [x] |
| 2022 | [x] | [x] | [x] | [x] | [ ] | [x] |
| 2021 | [x] | [x] | [x] | [x] | [ ] | [x] |
| 2020 | [x] | [x] | [x] | [x] | [ ] | [x] |
| 2019 | [x] | [x] | [x] | [x] | [ ] | [x] |
| 2018 | [x] | [x] | [x] | [x] | [ ] | [x] |
| 2017 | [x] | [x] | [x] | [x] | [ ] | [x] |
| 2016 | [x] | [x] | [x] | [x] | [ ] | [x] |
| 2015 | [x] | [x] | [x] | [x] | [ ] | [x] |
| 2014 | [x] | [x] | [x] | [x] | [ ] | [x] |
| 2013 | [x] | [x] | [x] | [x] | [ ] | [x] |
| 2012 | [x] | [x] | [x] | [x] | [ ] | [x] |
| 2011 | [x] | [x] | [x] | [x] | [ ] | [x] |
| 2010 | [x] | [ ] | [ ] | [ ] | [ ] | [x] |
| 2009 | [x] | [ ] | [ ] | [ ] | [ ] | [x] |
| 2008 | [x] | [ ] | [ ] | [ ] | [-] | [x] |
| 2007 | [x] | [ ] | [ ] | [ ] | [-] | [x] |
| 2006 | [x] | [ ] | [ ] | [ ] | [-] | [x] |
| 2005 | [x] | [ ] | [ ] | [ ] | [-] | [x] |
| 2004 | [x] | [ ] | [ ] | [ ] | [-] | [x] |
| 2003 | [x] | [ ] | [ ] | [ ] | [-] | [x] |
| 2002 | [x] | [ ] | [ ] | [ ] | [-] | [x] |
| 2001 | [x] | [ ] | [ ] | [ ] | [-] | [x] |
| 2000 | [x] | [ ] | [ ] | [ ] | [-] | [x] |
| 1999 | [x] | [ ] | [ ] | [ ] | [-] | [x] |
| 1998 | [x] | [ ] | [ ] | [ ] | [-] | [x] |
| 1997 | [x] | [ ] | [ ] | [ ] | [-] | [x] |
| 1996 | [x] | [ ] | [ ] | [ ] | [-] | [x] |
| 1995 | [x] | [ ] | [ ] | [ ] | [-] | [x] |
| 1994 | [x] | [ ] | [ ] | [ ] | [-] | [x] |
| 1993 | [x] | [ ] | [ ] | [ ] | [-] | [x] |
| 1992 | [x] | [ ] | [ ] | [ ] | [-] | [x] |
| 1991 | [x] | [ ] | [ ] | [ ] | [-] | [x] |
| 1990 | [x] | [ ] | [ ] | [ ] | [-] | [x] |
| 1989 | [x] | [ ] | [ ] | [ ] | [-] | [x] |
| 1988 | [x] | [ ] | [ ] | [ ] | [-] | [x] |
| 1987 | [x] | [ ] | [ ] | [ ] | [-] | [x] |
| 1986 | [x] | [ ] | [ ] | [ ] | [-] | [x] |
| 1985 | [x] | [ ] | [ ] | [ ] | [-] | [x] |
| 1984 | [x] | [ ] | [ ] | [ ] | [-] | [x] |
| 1983 | [x] | [ ] | [ ] | [ ] | [-] | [x] |
| 1982 | [x] | [ ] | [ ] | [ ] | [-] | [x] |
| 1981 | [x] | [ ] | [ ] | [ ] | [-] | [x] |
| 1980 | [x] | [ ] | [ ] | [ ] | [-] | [x] |
| 1979 | [x] | [ ] | [ ] | [ ] | [-] | [x] |
| 1978 | [x] | [ ] | [ ] | [ ] | [-] | [x] |
| 1977 | [x] | [ ] | [ ] | [ ] | [-] | [x] |
| 1976 | [x] | [ ] | [ ] | [ ] | [-] | [x] |
| 1975 | [x] | [ ] | [ ] | [ ] | [-] | [x] |
| 1974 | [x] | [ ] | [ ] | [ ] | [-] | [x] |
| 1973 | [x] | [ ] | [ ] | [ ] | [-] | [x] |
| 1972 | [x] | [ ] | [ ] | [ ] | [-] | [x] |
| 1971 | [x] | [ ] | [ ] | [ ] | [-] | [x] |
| 1970 | [x] | [ ] | [ ] | [ ] | [-] | [x] |
| 1969 | [x] | [ ] | [ ] | [ ] | [-] | [x] |
| 1968 | [x] | [ ] | [ ] | [-] | [-] | [x] |
| 1967 | [x] | [ ] | [ ] | [-] | [-] | [x] |
| 1966 | [x] | [ ] | [ ] | [-] | [-] | [x] |
| 1965 | [x] | [ ] | [ ] | [-] | [-] | [x] |
| 1964 | [x] | [ ] | [ ] | [-] | [-] | [x] |
| 1963 | [x] | [ ] | [ ] | [-] | [-] | [x] |
| 1962 | [x] | [ ] | [ ] | [-] | [-] | [x] |
| 1961 | [x] | [ ] | [ ] | [-] | [-] | [x] |
| 1960 | [x] | [ ] | [ ] | [-] | [-] | [x] |
| 1959 | [x] | [ ] | [ ] | [-] | [-] | [x] |
| 1958 | [x] | [ ] | [ ] | [-] | [-] | [x] |
| 1957 | [x] | [ ] | [ ] | [-] | [-] | [x] |
| 1956 | [x] | [ ] | [ ] | [-] | [-] | [x] |
| 1955 | [x] | [ ] | [ ] | [-] | [-] | [x] |
| 1954 | [x] | [ ] | [ ] | [-] | [-] | [x] |
| 1953 | [x] | [ ] | [ ] | [-] | [-] | [x] |
| 1952 | [x] | [ ] | [ ] | [-] | [-] | [x] |
| 1951 | [x] | [ ] | [ ] | [-] | [-] | [x] |
| 1950 | [x] | [ ] | [ ] | [-] | [-] | [x] |
| 1949 | [x] | [ ] | [ ] | [-] | [-] | [x] |
| 1948 | [x] | [ ] | [ ] | [-] | [-] | [x] |
| 1947 | [x] | [ ] | [ ] | [-] | [-] | [x] |
| 1946 | [x] | [ ] | [ ] | [-] | [-] | [x] |
| 1945 | [x] | [ ] | [ ] | [-] | [-] | [x] |
| 1944 | [x] | [ ] | [ ] | [-] | [-] | [x] |
| 1943 | [x] | [ ] | [ ] | [-] | [-] | [x] |
| 1942 | [x] | [ ] | [ ] | [-] | [-] | [x] |
| 1941 | [x] | [ ] | [ ] | [-] | [-] | [x] |
| 1940 | [x] | [ ] | [ ] | [-] | [-] | [x] |
| 1939 | [ ] | [ ] | [ ] | [-] | [-] | [ ] |
| 1938 | [ ] | [ ] | [ ] | [-] | [-] | [ ] |
| 1937 | [ ] | [ ] | [ ] | [-] | [-] | [ ] |
| 1936 | [ ] | [ ] | [ ] | [-] | [-] | [ ] |
| 1935 | [ ] | [ ] | [ ] | [-] | [-] | [ ] |
| 1934 | [ ] | [ ] | [ ] | [-] | [-] | [ ] |
| 1933 | [ ] | [ ] | [ ] | [-] | [-] | [ ] |
| 1932 | [ ] | [ ] | [ ] | [-] | [-] | [ ] |
| 1931 | [ ] | [ ] | [ ] | [-] | [-] | [ ] |
| 1930 | [ ] | [ ] | [ ] | [-] | [-] | [ ] |
| 1929 | [ ] | [ ] | [ ] | [-] | [-] | [ ] |
| 1928 | [ ] | [ ] | [ ] | [-] | [-] | [ ] |
| 1927 | [ ] | [ ] | [ ] | [-] | [-] | [ ] |
| 1926 | [ ] | [ ] | [ ] | [-] | [-] | [ ] |
| 1925 | [ ] | [ ] | [ ] | [-] | [-] | [ ] |
| 1924 | [ ] | [ ] | [ ] | [-] | [-] | [ ] |
| 1923 | [ ] | [ ] | [ ] | [-] | [-] | [ ] |
| 1922 | [ ] | [ ] | [ ] | [-] | [-] | [ ] |
| 1921 | [ ] | [ ] | [ ] | [-] | [-] | [ ] |
| 1920 | [ ] | [ ] | [ ] | [-] | [-] | [ ] |
| 1919 | [ ] | [ ] | [ ] | [-] | [-] | [ ] |
| 1918 | [ ] | [ ] | [ ] | [-] | [-] | [ ] |
| 1917 | [ ] | [ ] | [ ] | [-] | [-] | [ ] |
| 1916 | [ ] | [-] | [ ] | [-] | [-] | [ ] |
| 1915 | [ ] | [-] | [ ] | [-] | [-] | [ ] |
| 1914 | [ ] | [-] | [ ] | [-] | [-] | [ ] |
| 1913 | [ ] | [-] | [ ] | [-] | [-] | [ ] |
| 1912 | [ ] | [-] | [ ] | [-] | [-] | [ ] |
| 1911 | [ ] | [-] | [ ] | [-] | [-] | [ ] |
| 1910 | [ ] | [-] | [ ] | [-] | [-] | [ ] |
| 1909 | [ ] | [-] | [ ] | [-] | [-] | [ ] |
| 1908 | [ ] | [-] | [ ] | [-] | [-] | [ ] |
| 1907 | [ ] | [-] | [ ] | [-] | [-] | [ ] |
| 1906 | [ ] | [-] | [ ] | [-] | [-] | [ ] |
| 1905 | [ ] | [-] | [ ] | [-] | [-] | [ ] |
| 1904 | [ ] | [-] | [ ] | [-] | [-] | [ ] |
| 1903 | [ ] | [-] | [ ] | [-] | [-] | [ ] |
| 1902 | [ ] | [-] | [-] | [-] | [-] | [ ] |
| 1901 | [ ] | [-] | [-] | [-] | [-] | [ ] |
