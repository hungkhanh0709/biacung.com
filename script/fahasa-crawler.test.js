const assert = require('assert');
const path = require('path');

const { buildBookDetailFromHtml } = require(path.join(__dirname, 'fahasa-crawler'));

const sampleHtml = `
<html>
  <head>
    <title>Bí Mật Tối Thượng - The Secret Of Secrets - Bìa Cứng - Kèm Chữ Ký In Của Dan Brown (Chỉ Có Tại Bản In Đầu) - FAHASA.COM</title>
    <meta property="og:image" content="https://cdn1.fahasa.com/media/catalog/product/z/7/z7900503102192_ead4e10ee27824a61dfa22fe98659290.jpg" />
  </head>
  <body>
    <h1 id="fhs_name_product_desktop">Bí Mật Tối Thượng - The Secret Of Secrets - Bìa Cứng - Kèm Chữ Ký In Của Dan Brown (Chỉ Có Tại Bản In Đầu)</h1>
    <table class="data-table table-additional">
      <tr><td>Tên Nhà Cung Cấp</td><td>Bách Việt</td></tr>
      <tr><td>Tác giả</td><td>Dan Brown</td></tr>
      <tr><td>Người Dịch</td><td>Lê Đình Chi</td></tr>
      <tr><td>NXB</td><td>Dân Trí</td></tr>
      <tr><td>Năm XB</td><td>2026</td></tr>
      <tr><td>Trọng lượng (gr)</td><td>1500</td></tr>
      <tr><td>Kích Thước Bao Bì</td><td>24 x 16 x 4.9 cm</td></tr>
      <tr><td>Số trang</td><td>952</td></tr>
      <tr><td>Hình thức</td><td>Bìa Cứng</td></tr>
    </table>
    <div class="price-box">
      <span>Special Price 385.200 đ</span>
      <span>Regular Price: 428.000 đ -10%</span>
    </div>
    <img class="fhs-p-img" src="/media/catalog/product/z/7/z7900503102192_ead4e10ee27824a61dfa22fe98659290.jpg" />
    <section>
      <h2>Mô tả sản phẩm</h2>
      <p>ĐIỀU GÌ ĐÁNG MONG CHỜ NHẤT Ở "BÍ MẬT TỐI THƯỢNG"?</p>
      <p>Điều gì sẽ xảy ra nếu...</p>
    </section>
  </body>
</html>`;

const parsed = buildBookDetailFromHtml(sampleHtml, 'https://www.fahasa.com/bi-mat-toi-thuong-the-secret-of-secrets-bia-cung.html');

assert.strictEqual(parsed.id, 'dan-brown-the-secret-of-secrets');
assert.strictEqual(parsed.title, 'Bí Mật Tối Thượng');
assert.strictEqual(parsed.title_original, 'The Secret of Secrets');
assert.deepStrictEqual(parsed.authors, ['Dan Brown']);
assert.strictEqual(parsed.editions.length, 1);
assert.strictEqual(parsed.editions[0].publisher, 'NXB Dân Trí');
assert.deepStrictEqual(parsed.editions[0].issuers, ['Bách Việt']);
assert.deepStrictEqual(parsed.editions[0].translators, ['Lê Đình Chi']);
assert.strictEqual(parsed.editions[0].pub_year, 2026);
assert.strictEqual(parsed.editions[0].weight_g, 1500);
assert.strictEqual(parsed.editions[0].page_count, 952);
assert.strictEqual(parsed.editions[0].format, 'Bìa cứng');
assert.strictEqual(parsed.editions[0].cover_price, '428k');
assert.strictEqual(parsed.editions[0].size_cm, '24 x 16 x 4.9');
assert.strictEqual(parsed.editions[0].thumbnail, 'https://cdn1.fahasa.com/media/catalog/product/z/7/z7900503102192_ead4e10ee27824a61dfa22fe98659290.jpg');
assert.ok(parsed.editions[0].detail.includes('ĐIỀU GÌ ĐÁNG MONG CHỜ NHẤT'));

const markdownSample = `
Bí Mật Tối Thượng - The Secret Of Secrets - Bìa Cứng

Tác giả: Dan Brown
Người Dịch: Lê Đình Chi
NXB: Dân Trí
Tên Nhà Cung Cấp: Bách Việt
Năm XB: 2026
Trọng lượng (gr): 1500
Số trang: 952
Kích Thước Bao Bì: 24 x 16 x 4.9 cm
Hình thức: Bìa Cứng
Regular Price: 428.000 đ
https://cdn1.fahasa.com/media/catalog/product/z/7/z7900503102192_ead4e10ee27824a61dfa22fe98659290.jpg
`;

const markdownParsed = buildBookDetailFromHtml(markdownSample, 'https://www.fahasa.com/bi-mat-toi-thuong-the-secret-of-secrets-bia-cung.html');
assert.strictEqual(markdownParsed.title, 'Bí Mật Tối Thượng');
assert.deepStrictEqual(markdownParsed.authors, ['Dan Brown']);
assert.deepStrictEqual(markdownParsed.editions[0].translators, ['Lê Đình Chi']);
assert.strictEqual(markdownParsed.editions[0].format, 'Bìa cứng');
assert.strictEqual(markdownParsed.editions[0].cover_price, '428k');
assert.strictEqual(markdownParsed.editions[0].thumbnail, 'https://cdn1.fahasa.com/media/catalog/product/z/7/z7900503102192_ead4e10ee27824a61dfa22fe98659290.jpg');

const pipeTableSample = `
| Người Dịch | Lê Đình Chi |
| NXB | Dân Trí |
| Tên Nhà Cung Cấp | Bách Việt |
`;

const pipeTableParsed = buildBookDetailFromHtml(pipeTableSample, 'https://www.fahasa.com/bi-mat-toi-thuong-the-secret-of-secrets-bia-cung.html');
assert.deepStrictEqual(pipeTableParsed.editions[0].translators, ['Lê Đình Chi']);

const soldOutSample = `
###
Cân Bằng Mong Manh

Nhà cung cấp:
NXB Trẻ
Tác giả:Rohinton Mistry
Nhà xuất bản:Trẻ
Hình thức bìa:Bìa Mềm
Special Price 315.000 đ
Sản phẩm tạm hết hàng

Thông tin chi tiết
Năm XB
10/2014
Trọng lượng (gr)
1100
Kích Thước Bao Bì
13x20
Số trang
1056
Hình thức
Bìa Mềm
`;

const soldOutParsed = buildBookDetailFromHtml(soldOutSample, 'https://www.fahasa.com/can-bang-mong-manh.html');
assert.strictEqual(soldOutParsed.title, 'Cân Bằng Mong Manh');
assert.strictEqual(soldOutParsed.editions[0].cover_price, '315k');
assert.strictEqual(soldOutParsed.editions[0].pub_year, 2014);

const noisyPriceSample = `
Giáo Khoa - Tham Khảo
Tác giả: Someone Else
Năm XB
2014
`;
const noisyPriceParsed = buildBookDetailFromHtml(noisyPriceSample, 'https://www.fahasa.com/foo.html');
assert.strictEqual(noisyPriceParsed.editions[0].cover_price, '');
assert.strictEqual(noisyPriceParsed.editions[0].pub_year, 2014);

const vegasSample = `
Cân Bằng Mong Manh

Thông tin chi tiết
Năm XB
10/2014
Trọng lượng (gr)
1100
Kích Thước Bao Bì
13x20
Số trang
1056
Hình thức
Bìa Mềm
`;
const vegasParsed = buildBookDetailFromHtml(vegasSample, 'https://www.fahasa.com/thac-loan-o-las-vegas.html');
assert.strictEqual(vegasParsed.editions[0].pub_year, 2014);

const truyenKieuSample = `
  <html>
  <head>
    <title>Sách Truyện Kiều - Bìa Cứng - Phiên Bản Độc Quyền 50 Năm Fahasa - FAHASA.COM</title>
    <meta property="og:image" content="https://cdn1.fahasa.com/media/catalog/product/0/w/0w5a5533.jpg" />
  </head>
  <body>
    <h1 id="fhs_name_product_desktop">Sách Truyện Kiều - Bìa Cứng - Phiên Bản Độc Quyền 50 Năm Fahasa</h1>
    <table class="data-table table-additional">
      <tr><td>Tên Nhà Cung Cấp</td><td>Đông A</td></tr>
      <tr><td>Tác giả</td><td>Nguyễn Du</td></tr>
      <tr><td>Người Dịch</td><td>Nguyễn Thạch Giang</td></tr>
      <tr><td>NXB</td><td>Văn Học</td></tr>
      <tr><td>Năm XB</td><td>2026</td></tr>
      <tr><td>Trọng lượng (gr)</td><td>2000</td></tr>
      <tr><td>Kích Thước Bao Bì</td><td>30 x 25 x 2.2 cm</td></tr>
      <tr><td>Số trang</td><td>208</td></tr>
      <tr><td>Hình thức</td><td>Bìa Cứng</td></tr>
    </table>
  </body>
</html>`;

const truyenKieuParsed = buildBookDetailFromHtml(truyenKieuSample, 'https://www.fahasa.com/truyen-kieu-an-ban-cao-cap-bia-cung-phien-ban-doc-quyen-50-nam-fahasa.html');
assert.strictEqual(truyenKieuParsed.id, 'nguyen-du-truyen-kieu');
assert.strictEqual(truyenKieuParsed.editions[0].pub_year, 2026);
assert.strictEqual(truyenKieuParsed.editions[0].page_count, 208);

console.log('fahasa-crawler regression tests passed');
