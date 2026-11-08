const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { verifyUi } = require('./book-intake');

test('UI verification requires a real search link when a book is outside home limit', (t) => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'book-intake-ui-'));
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    fs.mkdirSync(path.join(root, 'data'));
    fs.writeFileSync(path.join(root, 'data/home.json'), JSON.stringify([{ id: 'recently-archived', limit: 12 }]));
    const book = { id: 'test-book' };
    const result = { homePosition: 107 };
    const ui = {
        checked_at: '2026-11-08T04:00:00Z',
        home: { url: 'http://127.0.0.1:3000/', visible: false, loaded: true, position: 107 },
        detail: { url: 'http://127.0.0.1:3000/detail?id=test-book', metadata_matches: true, images_load: true },
        search: { url: 'http://127.0.0.1:3000/search?q=Test', found: [{ href: 'http://127.0.0.1:3000/detail?id=test-book' }] }
    };
    assert.equal(verifyUi(root, book, result, ui), true);
    const cases = [
        (v) => { v.search.found = []; },
        (v) => { v.search.found[0].href = 'http://127.0.0.1:3000/detail?id=other-book'; },
        (v) => { v.search.found[0].href = 'http://127.0.0.1:3001/detail?id=test-book'; },
        (v) => { v.search.found[0].href = 'http://127.0.0.1:3000/search?id=test-book'; },
        (v) => { v.search.url = 'http://127.0.0.1:3000/search'; },
        (v) => { v.search.url = 'http://127.0.0.1:3000/detail?q=Test'; },
        (v) => { v.home.loaded = false; },
        (v) => { v.home.position = 108; },
        (v) => { v.detail.images_load = false; },
        (v) => { v.detail.url = 'http://127.0.0.1:3000/detail?id=other-book'; },
        (v) => { v.checked_at = 'invalid'; }
    ];
    for (const change of cases) {
        const invalid = structuredClone(ui);
        change(invalid);
        assert.equal(verifyUi(root, book, result, invalid), false, change.toString());
    }
    const inside = structuredClone(ui);
    inside.home.position = 5;
    assert.equal(verifyUi(root, book, { homePosition: 5 }, inside), false);
    const visible = structuredClone(ui);
    visible.home.visible = true;
    delete visible.search;
    assert.equal(verifyUi(root, book, { homePosition: 5 }, visible), true);
});
