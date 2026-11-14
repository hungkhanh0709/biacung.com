const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, 'book-input.js'), 'utf8');
const names = [
    'normalizeText', 'parseCommaSeparatedLines', 'toTitleCase', 'authorIdentityName',
    'normalizeAuthorDisplayName', 'normalizeBookTitle', 'slugify',
    'getBookSlugFromFormData', 'getPrimaryAuthorName', 'getAuthorSlugFromFormData',
    'buildAuthorReviewPayload'
];
const context = vm.createContext({});
vm.runInContext(names.map((name) => {
    const match = source.match(new RegExp(`function ${name}\\([^]*?\\n}`));
    assert.ok(match, `Missing function ${name}`);
    return match[0];
}).join('\n'), context);
const formData = (values) => ({ get: (key) => values[key] || '' });

test('author roles stay lowercase and normalization is idempotent', () => {
    const display = context.normalizeAuthorDisplayName('  HỒ ANH THÁI (TUYỂN CHỌN)  ');
    assert.equal(display, 'Hồ Anh Thái (tuyển chọn)');
    assert.equal(context.normalizeAuthorDisplayName(display), display);
    assert.equal(context.normalizeAuthorDisplayName('NGUYỄN DU'), 'Nguyễn Du');
    for (const role of ['biên soạn', 'chủ biên', 'sưu tầm']) {
        assert.equal(context.normalizeAuthorDisplayName(`HỒ ANH THÁI (${role})`), `Hồ Anh Thái (${role})`);
    }
});

test('role display reuses the canonical author and preserves existing work links', () => {
    const existing = [{ id: 'ho-anh-thai', name: 'Hồ Anh Thái', work_ids: ['old-work'], note: 'keep' }];
    const data = formData({ authors: 'Hồ Anh Thái (tuyển chọn)', bookId: 'new-work' });
    const result = JSON.parse(JSON.stringify(context.buildAuthorReviewPayload(data, existing)));
    assert.deepEqual(result, { id: 'ho-anh-thai', name: 'Hồ Anh Thái', work_ids: ['old-work', 'new-work'], note: 'keep' });
    assert.deepEqual(existing[0].work_ids, ['old-work']);
});

test('author lookup and suggested book slug exclude the role suffix', () => {
    const data = formData({ authors: 'Hồ Anh Thái (tuyển chọn)', title: 'Văn Mới' });
    assert.equal(context.getAuthorSlugFromFormData(data), 'ho-anh-thai');
    assert.equal(context.getBookSlugFromFormData(data), 'ho-anh-thai-van-moi');
    assert.equal(context.getBookSlugFromFormData(formData({ bookId: 'existing-book', authors: 'Hồ Anh Thái (tuyển chọn)' })), 'existing-book');
});
