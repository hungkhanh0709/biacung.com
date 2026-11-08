const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { once } = require('node:events');
const vm = require('node:vm');
const publication = require('../assets/js/publication-date');
const { parseEditionText } = require('./edition-parser');
const { sortBookIndex } = require('./sort-book');
const { emptyBook, validate } = require('./book-intake');
const { createPublicationFixture } = require('./test-helpers/publication-fixture');

test('calendar input fills missing components and accepts Vietnamese dates', () => {
    for (const [input, expected] of [
        ['2026', '2026-01-01'], ['2026-07', '2026-07-01'], ['07/2026', '2026-07-01'],
        ['8/11/2026', '2026-11-08'], ['2026-11-08', '2026-11-08'], [' 2026-1-2 ', '2026-01-02'],
        ['2000-02-29', '2000-02-29'], ['2024-02-29', '2024-02-29'], [1980, '1980-01-01']
    ]) assert.equal(publication.normalizePubDate(input), expected, String(input));
});

test('invalid dates do not roll over, truncate, or depend on timezones', () => {
    for (const input of [null, '', '0', '999', '10000', '2026-00', '2026-13', '2026-02-29',
        '1900-02-29', '2026-04-31', '2026-01-00', '2026-01-32', '2026-01-01T00:00:00Z',
        'Quý IV/2019', '2026-11-08 extra', '2026-1-2-3', '31/04/2026']) {
        assert.equal(publication.normalizePubDate(input), null, String(input));
    }
    assert.equal(publication.isIsoDate('2026-1-2'), false);
    assert.equal(publication.isIsoDate('2026-01-02'), true);
});

test('editions use dates, legacy year fallback, stable ties, and unknown dates last', () => {
    const editions = [
        { id: 'unknown', pub_year: null }, { id: 'legacy', pub_year: 2026 },
        { id: 'july-a', pub_date: '2026-07-01', pub_year: 1900 },
        { id: 'july-b', pub_date: '2026-07-01' }, { id: 'old', pub_date: '2025-12-31' },
        { id: 'missing' }, { id: 'november', pub_date: '2026-11-08' }
    ];
    const before = structuredClone(editions);
    assert.deepEqual(publication.sortEditions(editions).map((e) => e.id),
        ['november', 'july-a', 'july-b', 'legacy', 'old', 'unknown', 'missing']);
    assert.deepEqual(editions, before);
});

test('index summary follows the latest effective edition, including newer legacy editions', () => {
    assert.deepEqual(publication.getPublicationSummary({ editions: [
        { pub_date: '2026-07-01', pub_year: 2026 }, { pub_date: '2026-11-08', pub_year: 2026 }
    ] }), { last_pub_date: '2026-11-08', last_pub_year: 2026 });
    assert.deepEqual(publication.getPublicationSummary({ editions: [
        { pub_year: 2026 }, { pub_date: '2025-12-31', pub_year: 2025 }
    ] }), { last_pub_year: 2026 });
    assert.deepEqual(publication.withPublicationSummary({ detail: 'a', last_pub_date: '2026-11-08', last_pub_year: 2026 },
        { editions: [{ pub_date: null, pub_year: null }] }), { detail: 'a', last_pub_year: '' });
});

test('index order ignores updated_at and preserves equal dates', () => {
    const entries = [
        { id: 'old', last_pub_year: 2025, updated_at: '2099-01-01' },
        { id: 'tie-a', last_pub_year: 2026, updated_at: '2000-01-01' },
        { id: 'november', last_pub_date: '2026-11-08', last_pub_year: 2026 },
        { id: 'tie-b', last_pub_year: 2026, updated_at: '2099-01-01' }
    ];
    assert.deepEqual(publication.sortBookEntries(entries).map((e) => e.id), ['november', 'tie-a', 'tie-b', 'old']);
});

test('normalization preserves legacy absence and IDs, while syncing year from new dates', () => {
    const normalized = publication.normalizeBookDetail({ editions: [
        { id: 'legacy', pub_year: 2025 }, { id: 'dated', pub_date: '11/2026', pub_year: 1900 },
        { id: 'unknown', pub_date: null, pub_year: null }
    ] });
    assert.equal(normalized.editions[0].id, 'dated');
    assert.equal(normalized.editions[0].pub_year, 2026);
    assert.equal(normalized.editions[0].pub_date, '2026-11-01');
    assert.equal('pub_date' in normalized.editions[1], false);
    assert.equal(normalized.editions[2].pub_date, null);
    assert.throws(() => publication.normalizeEdition({ pub_date: '2026-02-29' }), /không hợp lệ/);
});

test('publication display and structured data retain legacy precision', () => {
    assert.equal(publication.formatPublicationDate({ pub_date: '2026-11-08' }), '08/11/2026');
    assert.equal(publication.formatPublicationDate({ pub_year: 2026 }), '2026');
    assert.equal(publication.publicationDateForSchema({ pub_date: '2026-11-08', pub_year: 2025 }), '2026-11-08');
    assert.equal(publication.publicationDateForSchema({ pub_year: 2026 }), '2026');
    assert.equal(publication.formatPublicationDate({ pub_year: null }), '');
});

test('detail UI uses Phát hành for dates, years and Chauchaubook editions', () => {
    const page = vm.createContext({
        URLSearchParams,
        document: { querySelector: () => null },
        window: {
            BiaCungPublication: publication,
            location: { search: '' },
            matchMedia: () => ({ matches: false }),
            addEventListener() {}
        }
    });
    // Execute the real page script; an empty URL avoids loading a book or network data.
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../assets/js/detail.js'), 'utf8'), page);
    for (const format of ['Bìa cứng', 'Chauchaubook']) {
        for (const [date, expected] of [
            [{ pub_year: 2026, pub_date: '2026-11-16' }, 'Phát hành: 16/11/2026'],
            [{ pub_year: 2026 }, 'Phát hành: 2026'],
            [{ pub_year: 2026, pub_date: null }, 'Phát hành: 2026']
        ]) {
            const lines = Array.from(page.buildEditionSummaryLines({ ...date, format }));
            assert.equal(lines[0], expected, `${format}: ${JSON.stringify(date)}`);
        }
        assert.ok(!page.buildEditionSummaryLines({ format, pub_year: null, pub_date: null })
            .some((line) => line.startsWith('Phát hành:')));
    }
});

test('parser extracts release dates rather than post dates, preorder dates or original years', () => {
    for (const [raw, expected] of [
        ['Phát hành: 08/11/2026', '2026-11-08'], ['Phát hành: 07/2026', '2026-07-01'],
        ['Phát hành: 2026', '2026-01-01'], ['Sách phát hành tháng 07/2026.', '2026-07-01'],
        ['Sách phát hành ngày 08/11/2026.', '2026-11-08']
    ]) assert.equal(parseEditionText(raw).pub_date, expected, raw);
    for (const raw of ['Ngày đăng: 08/11/2026', 'Mở đặt trước ngày 08/11/2026', 'Nguyên tác xuất bản năm 1900',
        'Phát hành: 31/02/2026', 'Phát hành: Quý IV/2019']) {
        assert.equal(parseEditionText(raw).pub_date, null, raw);
    }
    const datedIssuer = parseEditionText('Phát hành: 08/11/2026\nCty phát hành: Đông A');
    assert.deepEqual(datedIssuer.issuers, ['Đông A']);
    const issuerLabel = parseEditionText('Phát hành: Đông A\nNăm XB: 2026');
    assert.deepEqual(issuerLabel.issuers, ['Đông A']);
    assert.equal(issuerLabel.pub_date, '2026-01-01');
});

test('parser continues accepting legacy publication labels in source text', () => {
    for (const [raw, expected] of [
        ['Ngày phát hành: 08/11/2026', '2026-11-08'],
        ['Tháng xuất bản: 07/2026', '2026-07-01'],
        ['Năm XB: 2026', '2026-01-01'],
        ['Ngày thực hiện: 08/11/2026', '2026-11-08'],
        ['Năm thực hiện: 2026', '2026-01-01']
    ]) assert.equal(parseEditionText(raw).pub_date, expected, raw);
    assert.equal(parseEditionText('Ngày phát hành: 31/02/2026').pub_date, null);
});

test('sort command refreshes only index and is idempotent with mixed schemas', (t) => {
    const fixture = createPublicationFixture(); t.after(fixture.cleanup);
    const book = fixture.read('data/book/test-a.json');
    book.editions[1].pub_date = '2026-11-08';
    fixture.write('data/book/test-a.json', book);
    const original = fs.readFileSync(path.join(fixture.root, 'data/book/test-a.json'), 'utf8');
    const index = sortBookIndex(fixture.root);
    assert.equal(index[0].detail, 'data/book/test-a.json');
    assert.equal(index[0].last_pub_date, '2026-11-08');
    assert.equal('last_pub_date' in index[1], false);
    assert.deepEqual(sortBookIndex(fixture.root), index);
    assert.equal(fs.readFileSync(path.join(fixture.root, 'data/book/test-a.json'), 'utf8'), original);
});

test('intake schema supports legacy and new editions, rejects inconsistent or impossible dates', (t) => {
    const fixture = createPublicationFixture(); t.after(fixture.cleanup);
    assert.equal(emptyBook(fixture.root).editions[0].pub_date, null);
    const book = fixture.read('data/book/test-a.json');
    assert.deepEqual(validate(fixture.root, book, { allowExisting: true }).errors, []);
    assert.ok(validate(fixture.root, book).errors.some((e) => e.includes('pub_date thiếu key')));
    book.editions[1].pub_date = '2025-11-08';
    assert.ok(validate(fixture.root, book, { allowExisting: true }).errors.some((e) => e.includes('phải khớp')));
    book.editions[1].pub_date = '2026-02-29';
    assert.ok(validate(fixture.root, book, { allowExisting: true }).errors.some((e) => e.includes('ngày YYYY-MM-DD')));
    book.editions[1].pub_date = '2026-11-08';
    fixture.write('data/book/test-a.json', book);
    sortBookIndex(fixture.root);
    assert.deepEqual(validate(fixture.root, book, { allowExisting: true, relations: true }).errors, []);
    const index = fixture.read('data/book.json'); index[0].last_pub_date = '2026-01-01';
    fixture.write('data/book.json', index);
    assert.ok(validate(fixture.root, book, { allowExisting: true, relations: true }).errors.some((e) => e.includes('last_pub_date')));
});

test('save APIs normalize dates, refresh index, reject invalid dates and preserve unrelated books', async (t) => {
    const fixture = createPublicationFixture(); t.after(fixture.cleanup);
    const { server } = require(path.join(fixture.root, 'script/book-input-server.js'));
    server.listen(0, '127.0.0.1'); await once(server, 'listening');
    t.after(() => new Promise((resolve) => { server.closeAllConnections(); server.close(resolve); }));
    const origin = `http://127.0.0.1:${server.address().port}`;
    const post = async (endpoint, payload) => {
        const response = await fetch(origin + endpoint, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });
        return { status: response.status, body: await response.json() };
    };
    const unrelatedBook = fs.readFileSync(path.join(fixture.root, 'data/book/test-b.json'), 'utf8');
    const unrelatedEntry = fixture.read('data/book.json')[0];
    const book = fixture.read('data/book/test-a.json');
    let legacyResult = await post('/api/books/save', {
        bookDetail: book, bookIndex: { detail: 'data/book/test-a.json', search_text: 'test author' }
    });
    assert.equal(legacyResult.status, 200);
    assert.ok(fixture.read('data/book/test-a.json').editions.every((e) => !('pub_date' in e)));
    assert.deepEqual(fixture.read('data/author.json'), [{ id: 'test-author', name: 'Test Author', work_ids: ['test-a', 'test-b'] }]);
    assert.deepEqual(fixture.read('data/series.json'), []);
    book.editions[0].pub_date = '07/2026';
    book.editions[1].pub_date = '2026-11-08';
    let result = await post('/api/books/save', {
        bookDetail: book, bookIndex: { detail: 'data/book/test-a.json', search_text: 'test author', last_pub_year: 1900, last_pub_date: '1900-01-01' }
    });
    assert.equal(result.status, 200, JSON.stringify(result.body));
    let saved = fixture.read('data/book/test-a.json');
    assert.deepEqual(saved.editions.map((e) => e.pub_date), ['2026-11-08', '2026-07-01']);
    assert.deepEqual(saved.editions.map((e) => e.pub_year), [2026, 2026]);
    let index = fixture.read('data/book.json');
    assert.equal(index[0].last_pub_date, '2026-11-08');
    assert.equal(index[0].last_pub_year, 2026);
    assert.deepEqual(index[1], unrelatedEntry);

    saved.editions[0].pub_date = '2026-03';
    result = await post('/api/books/save/book-detail-review', { bookId: book.id, bookDetail: saved });
    assert.equal(result.status, 200);
    saved = fixture.read('data/book/test-a.json');
    assert.equal(saved.editions[0].pub_date, '2026-07-01');
    index = fixture.read('data/book.json'); assert.equal(index[0].last_pub_date, '2026-07-01');

    result = await post('/api/books/save/book-index-review', { bookIndexReview: {
        detail: 'data/book/test-a.json', last_pub_date: '2099-01-01', last_pub_year: 2099
    } });
    assert.equal(result.status, 200);
    assert.equal(fixture.read('data/book.json')[0].last_pub_date, '2026-07-01');
    assert.equal(fixture.read('data/book.json')[0].search_text, 'test author');

    const mixed = structuredClone(saved);
    mixed.editions.push({ ...saved.editions[0], id: 'test-a-2027', pub_date: null, pub_year: 2027 });
    result = await post('/api/books/save/book-detail-review', { bookDetail: mixed });
    assert.equal(result.status, 200);
    const mixedIndex = fixture.read('data/book.json')[0];
    assert.equal(mixedIndex.last_pub_year, 2027);
    assert.equal('last_pub_date' in mixedIndex, false);
    assert.equal(fixture.read('data/book/test-a.json').editions[0].id, 'test-a-2027');
    result = await post('/api/books/save/book-detail-review', { bookDetail: saved });
    assert.equal(result.status, 200);
    assert.equal(fixture.read('data/book.json')[0].last_pub_date, '2026-07-01');

    const baseline = fs.readFileSync(path.join(fixture.root, 'data/book/test-a.json'), 'utf8');
    const baselineIndex = fs.readFileSync(path.join(fixture.root, 'data/book.json'), 'utf8');
    const invalid = structuredClone(saved); invalid.editions[0].pub_date = '2026-02-29';
    for (const endpoint of ['/api/books/save', '/api/books/save/book-detail-review']) {
        result = await post(endpoint, { bookDetail: invalid });
        assert.equal(result.status, 400);
        assert.equal(fs.readFileSync(path.join(fixture.root, 'data/book/test-a.json'), 'utf8'), baseline);
        assert.equal(fs.readFileSync(path.join(fixture.root, 'data/book.json'), 'utf8'), baselineIndex);
    }
    saved.editions.forEach((e) => { e.pub_date = null; e.pub_year = null; });
    result = await post('/api/books/save/book-detail-review', { bookDetail: saved });
    assert.equal(result.status, 200);
    index = fixture.read('data/book.json');
    const cleared = index.find((e) => e.detail === 'data/book/test-a.json');
    assert.equal(cleared.last_pub_year, ''); assert.equal('last_pub_date' in cleared, false);
    assert.equal(index[0].detail, 'data/book/test-b.json');
    assert.equal(fs.readFileSync(path.join(fixture.root, 'data/book/test-b.json'), 'utf8'), unrelatedBook);
});
