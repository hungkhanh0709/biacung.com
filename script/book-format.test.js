const { test } = require('node:test');
const assert = require('node:assert/strict');
const formats = require('../assets/js/book-format');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const publication = require('../assets/js/publication-date');
const { once } = require('node:events');

function formPage() {
    const card = { dataset: {} };
    const page = vm.createContext({
        window: { BiaCungPublication: publication, BiaCungBookFormat: formats },
        document: { getElementById: (id) => id === 'editions-container'
            ? { querySelector: () => card, querySelectorAll: () => [card] } : null }
    });
    const source = fs.readFileSync(path.join(__dirname, 'book-input.js'), 'utf8');
    vm.runInContext(source.slice(0, source.indexOf("\nform.addEventListener('input'")), page);
    return { page, card };
}

test('formats read legacy strings and arrays without losing spelling or composite labels', () => {
    assert.deepEqual(formats.list(' Boxset, bìa cứng '), ['Boxset, bìa cứng']);
    assert.deepEqual(formats.list([' Bìa da PU ', '', 'Bìa da pu', 'Bìa da bò Ý']), ['Bìa da PU', 'Bìa da bò Ý']);
    assert.deepEqual(formats.fromInput('Bìa da PU\nBìa da bò Mỹ\nBìa da PU'), ['Bìa da PU', 'Bìa da bò Mỹ']);
    assert.deepEqual(formats.fromInput(' Bìa da PU; Bìa da bò Mỹ;; Bìa da PU; '), ['Bìa da PU', 'Bìa da bò Mỹ']);
    assert.deepEqual(formats.fromInput('Boxset, bìa cứng; Bìa da PU'), ['Boxset, bìa cứng', 'Bìa da PU']);
    assert.equal(formats.text(['Bìa da PU', 'Bìa da bò Ý']), 'Bìa da PU · Bìa da bò Ý');
    assert.equal(formats.has(['Bìa cứng', 'Chauchaubook'], 'chauchaubook'), true);
});

test('empty or malformed formats cannot become visible labels', () => {
    for (const value of [null, undefined, '', [], {}, 17]) assert.deepEqual(formats.list(value), []);
    assert.deepEqual(formats.list(['Bìa mềm', {}, 17]), ['Bìa mềm']);
    assert.equal(formats.valid(['Bìa mềm', {}]), false);
    assert.equal(formats.valid({}), false);
    assert.equal(formats.valid([]), true);
    assert.equal(formats.valid(''), true);
});

test('form preview preserves existing IDs when materials change, but still handles other identity changes', () => {
    const { page, card } = formPage();
    const values = new Map([
        ['edition-pub-year-0', '2021'], ['edition-issuers-0', 'Đông A'],
        ['edition-cover-price-0', '1tr'], ['edition-format-0', 'Bìa da bò Ý; Bìa da microfiber']
    ]);
    const identity = { pub_year: 2021, issuers: ['Đông A'], cover_price: '1tr', format: [] };
    card.dataset.originalEditionId = 'book-existing-legacy-id';
    card.dataset.originalGeneratedIdWithoutFormat = page.buildEditionId('book', identity);
    const preview = page.buildEditionFromFormData(values, 0, 'book');
    assert.equal(preview.id, 'book-existing-legacy-id');
    assert.deepEqual(Array.from(preview.format), ['Bìa da bò Ý', 'Bìa da microfiber']);
    values.set('edition-format-0', 'Bìa da PU; Bìa da bò Mỹ; Bìa da PU');
    const edited = page.buildEditionFromFormData(values, 0, 'book');
    assert.equal(edited.id, preview.id);
    assert.deepEqual(Array.from(edited.format), ['Bìa da PU', 'Bìa da bò Mỹ']);
    assert.equal(page.normalizeFormatValue(edited.format), 'Bìa da PU; Bìa da bò Mỹ');
    assert.equal(page.buildEditionId('book', edited), page.buildEditionId('book', { ...edited, format: [...edited.format].reverse() }));
    values.set('edition-cover-price-0', '2tr');
    assert.notEqual(page.buildEditionFromFormData(values, 0, 'book').id, preview.id);
    values.set('edition-format-0', '');
    assert.deepEqual(Array.from(page.buildEditionFromFormData(values, 0, 'book').format), []);
});

test('form indexes each material phrase and intake accepts arrays without a keyword whitelist', () => {
    const { page } = formPage();
    const values = new Map([['edition-format-0', 'Bìa da PU; Bìa da bò Ý']]);
    assert.deepEqual(Array.from(page.collectSearchTextTerms(values)), ['bia da pu', 'bia da bo y']);
    const { createPublicationFixture } = require('./test-helpers/publication-fixture');
    const { validate, emptyBook } = require('./book-intake');
    const fixture = createPublicationFixture();
    try {
        assert.deepEqual(emptyBook(fixture.root).editions[0].format, []);
        const book = fixture.read('data/book/test-a.json');
        book.editions = publication.sortEditions(book.editions);
        book.editions[0].format = ['Bìa da bò Ý', 'Nhãn tự do'];
        assert.deepEqual(validate(fixture.root, book, { allowExisting: true }).errors, []);
        book.editions[0].format = [{ material: 'Da bò' }];
        assert.ok(validate(fixture.root, book, { allowExisting: true }).errors.some(e => e.includes('.format')));
    } finally { fixture.cleanup(); }
    assert.deepEqual(require('./edition-parser').parseEditionText('Hình thức: Bìa da PU').format, ['Bìa da PU']);
});

test('search matches broad/narrow material queries per label and selects the correct editions through the index', async () => {
    const editions = [
        { id: 'italy', pub_year: 2024, format: ['Bìa da bò Ý', 'Bìa da microfiber'] },
        { id: 'usa', pub_year: 2023, format: ['Bìa da bò Mỹ'] },
        { id: 'generic', pub_year: 2022, format: 'Bìa da bò' },
        { id: 'goat', pub_year: 2021, format: ['Bìa da dê'] }
    ];
    const book = { id: 'test-book', title: 'Sách kiểm thử', authors: ['Test Author'], editions };
    const index = [{ detail: 'data/book/test-book.json', search_text: 'sach kiem thu test author bia da bo y bia da microfiber bia da bo my bia da bo bia da de' }];
    const page = vm.createContext({
        URLSearchParams,
        window: { BiaCungPublication: publication, BiaCungBookFormat: formats, location: { search: '' } },
        document: { querySelector: () => null },
        fetch: async (url) => ({ ok: true, json: async () => url === 'data/book.json' ? index : book })
    });
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../assets/js/search.js'), 'utf8'), page);
    for (const [query, ids] of [
        ['Bìa da bò', ['italy', 'usa', 'generic']], ['bia da bo', ['italy', 'usa', 'generic']],
        ['Bìa da bò Ý', ['italy']], ['BÌA DA BÒ MỸ', ['usa']],
        ['Bìa da microfiber', ['italy']], ['Ý Bìa da microfiber', []]
    ]) {
        const matches = page.createSearchMatcher(page.getSearchNeedles(query));
        assert.deepEqual(Array.from(page.getMatchingEditions(book, matches), e => e.id), ids, query);
        const cards = await page.loadBookMatches(page.getSearchNeedles(query));
        assert.equal(cards.length, ids.length ? 1 : 0, query);
        if (ids.length) {
            assert.ok(cards[0].href.endsWith(`edition=${ids[0]}`));
            assert.equal(cards[0].meta, `(${ids.length} phiên bản)`);
        }
    }
    assert.equal((await page.loadBookMatches(page.getSearchNeedles('Test Author')))[0].meta, '(4 phiên bản)');
});

test('form-generated arrays and index phrases survive save and reload through both save routes', async (t) => {
    const { createPublicationFixture } = require('./test-helpers/publication-fixture');
    const fixture = createPublicationFixture(); t.after(fixture.cleanup);
    const { server } = require(path.join(fixture.root, 'script/book-input-server.js'));
    server.listen(0, '127.0.0.1'); await once(server, 'listening');
    t.after(() => new Promise(resolve => { server.closeAllConnections(); server.close(resolve); }));
    const origin = `http://127.0.0.1:${server.address().port}`;
    const { page, card } = formPage();
    card.dataset.editionIndex = '0';
    const values = new Map([
        ['bookId', 'format-pilot'], ['title', 'Sách kiểm thử'], ['authors', 'Test Author'],
        ['edition-pub-year-0', '2026'], ['edition-issuers-0', 'Đông A'],
        ['edition-format-0', 'Bìa da bò Ý; Bìa da microfiber']
    ]);
    const detail = page.buildBookDetailPayload(values);
    const index = page.buildBookIndexReviewPayload(values);
    const post = async (endpoint, body) => {
        const response = await fetch(origin + endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        assert.equal(response.status, 200, JSON.stringify(await response.json()));
    };
    await post('/api/books/save', { bookDetail: detail, bookIndex: index });
    let saved = await (await fetch(origin + '/api/books/format-pilot')).json();
    assert.deepEqual(saved.editions[0].format, ['Bìa da bò Ý', 'Bìa da microfiber']);
    const savedIndex = fixture.read('data/book.json').find(e => e.detail === index.detail);
    assert.ok(savedIndex.search_text.includes('bia da bo y'));
    assert.ok(savedIndex.search_text.includes('bia da microfiber'));
    assert.deepEqual(Array.from(page.normalizeFormatValue(saved.editions[0].format).split('; ')), saved.editions[0].format);
    saved.editions[0].format = ['Bìa da PU'];
    await post('/api/books/save/book-detail-review', { bookDetail: saved });
    values.set('edition-format-0', 'Bìa da PU');
    await post('/api/books/save/book-index-review', { bookIndexReview: page.buildBookIndexReviewPayload(values) });
    assert.deepEqual(fixture.read('data/book/format-pilot.json').editions[0].format, ['Bìa da PU']);
    assert.ok(fixture.read('data/book.json').find(e => e.detail === index.detail).search_text.includes('bia da pu'));
});
