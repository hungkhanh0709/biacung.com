const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const parserPath = path.join(__dirname, 'edition-parser.js');
const parserCode = fs.readFileSync(parserPath, 'utf8');
const context = { console, globalThis: {} };
context.globalThis = context;
vm.createContext(context);
vm.runInContext(parserCode, context);

const sample = `**Chú chó Runt**
Tác giả: Craig Silvey
Dịch giả: Nguyễn Thị Cẩm Linh
Minh họa: Sara Acton
Hiệu đính: Alpha One, Beta Two
Kích thước: 14.5 x 20.5 cm
Số trang: 336
Trọng lượng: 500 gram
Giá bìa: 150.000đ
Mã ISBN: 978-632-624-910-1
Mã sản phẩm: 8936203365825
NXB Văn học và Công ty Cổ phần Văn hóa Đông A liên kết phát hành.`;

const parsed = JSON.parse(JSON.stringify(context.parseEditionText(sample)));

assert.strictEqual(parsed.title, 'Chú chó Runt');
assert.deepStrictEqual(parsed.authors, ['Craig Silvey']);
assert.deepStrictEqual(parsed.translators, ['Nguyễn Thị Cẩm Linh']);
assert.deepStrictEqual(parsed.illustrators, ['Sara Acton']);
assert.deepStrictEqual(parsed.proofreaders, ['Alpha One', 'Beta Two']);
assert.strictEqual(parsed.publisher, 'NXB Văn học');
assert.deepStrictEqual(parsed.issuers, ['Đông A']);
assert.strictEqual(parsed.size_cm, '14.5 x 20.5');
assert.strictEqual(parsed.page_count, 336);
assert.strictEqual(parsed.weight_g, 500);
assert.strictEqual(parsed.cover_price, '150k');
assert.strictEqual(parsed.isbn, '978-632-624-910-1');
assert.strictEqual(parsed.sku, '8936203365825');

const freeTextSample = `Gia đình Robinson Thụy Sỹ
Tác giả: Johann David Wyss
Dịch giả: Nguyễn Minh
Kích thước: 13,5 x 20,5 cm
Số trang: 448
Mã sản phẩm: 8936203365146
Mã ISBN: 978-632-617-163-1
Hình thức: Bìa mềm, có bìa áo
Giá bìa: 120.000đ
Trọng lượng: 400 gr
Sách do Công ty Cổ phần Văn hóa Đông A và NXB Văn học liên kết ấn hành
Phát hành: 2025`;
const freeTextParsed = JSON.parse(JSON.stringify(context.parseEditionText(freeTextSample)));
assert.strictEqual(freeTextParsed.publisher, 'NXB Văn học');

console.log('edition-parser regression tests passed');
