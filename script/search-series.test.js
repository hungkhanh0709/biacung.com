const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('series search returns only editions in the series and keeps legacy work-level matches', async () => {
    const index = [
        { detail: 'data/book/mixed.json', search_text: 'tua sach sach decor dong a' },
        { detail: 'data/book/legacy.json', search_text: 'cu sach sach decor dong a' }
    ];
    const books = {
        'data/book/mixed.json': { id: 'mixed', title: 'Tựa sách', series: ['Sách Decor Đông A'], editions: [
            { id: 'other', pub_year: 2026, series_ids: [] },
            { id: 'decor', pub_year: 2024, series_ids: ['sach-decor-dong-a'] }
        ] },
        'data/book/legacy.json': { id: 'legacy', title: 'Cũ sách', series: ['Sách Decor Đông A'], editions: [
            { id: 'legacy-edition', series_ids: [] }
        ] }
    };
    const page = vm.createContext({
        URLSearchParams,
        window: { BiaCungPublication: require('../assets/js/publication-date'), BiaCungBookFormat: require('../assets/js/book-format'), location: { search: '' } },
        document: { querySelector: () => null },
        fetch: async (url) => ({ ok: true, json: async () => url === 'data/book.json' ? index : books[url] })
    });
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../assets/js/search.js'), 'utf8'), page);
    for (const query of ['Sách Decor Đông A', 'decor']) {
        const matches = await page.loadBookMatches(page.getSearchNeedles(query));
        assert.deepEqual(Array.from(matches, ({ href }) => href).sort(), [
            '/detail?id=legacy&edition=legacy-edition', '/detail?id=mixed&edition=decor'
        ]);
    }
    const titleMatches = await page.loadBookMatches(page.getSearchNeedles('Tựa sách'));
    assert.deepEqual(Array.from(titleMatches, ({ href }) => href), [
        '/detail?id=mixed&edition=other', '/detail?id=mixed&edition=decor'
    ]);
});
