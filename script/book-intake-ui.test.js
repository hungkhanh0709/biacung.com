const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { verifyUi } = require('./book-intake');

test('UI verification uses the exact detail link and changed edition without home or search', (t) => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'book-intake-ui-'));
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    const book = { id: 'test-book', editions: [{ id: 'old' }, { id: 'new' }] };
    const result = { requiredEditionIds: ['new'] };
    const ui = {
        checked_at: '2026-11-08T04:00:00Z',
        detail: { url: 'http://127.0.0.1:3000/detail?id=test-book', metadata_matches: true, images_load: true, edition_ids: ['new'] }
    };
    assert.equal(verifyUi(root, book, result, ui), true);
    const cases = [
        (v) => { v.detail.edition_ids = []; },
        (v) => { v.detail.edition_ids = ['old']; },
        (v) => { v.detail.edition_ids = ['other-edition']; },
        (v) => { delete v.detail.edition_ids; },
        (v) => { v.detail.metadata_matches = false; },
        (v) => { v.detail.images_load = false; },
        (v) => { v.detail.url = 'http://127.0.0.1:3000/detail?id=other-book'; },
        (v) => { v.detail.url = 'http://127.0.0.1:3000/search?id=test-book'; },
        (v) => { v.detail.url = 'https://example.com/detail?id=test-book'; },
        (v) => { v.checked_at = 'invalid'; }
    ];
    for (const change of cases) {
        const invalid = structuredClone(ui);
        change(invalid);
        assert.equal(verifyUi(root, book, result, invalid), false, change.toString());
    }
    const html = structuredClone(ui);
    html.detail.url = 'http://localhost:3001/detail.html?id=test-book';
    assert.equal(verifyUi(root, book, result, html), true);
});
