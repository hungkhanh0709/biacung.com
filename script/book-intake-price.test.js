const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { emptyBook, isCoverPrice, validate } = require('./book-intake');

test('cover prices distinguish thousands, millions and the remaining thousands', () => {
    for (const price of ['900k', '999k', '999.5k', '1tr', '3tr', '3tr900k', '3tr50k', '1tr0.5k']) {
        assert.equal(isCoverPrice(price), true, price);
    }
    for (const price of ['0k', '1000k', '3900k', '3tr9', '3.9tr', '0tr900k', '3tr0k', '3tr1000k', '3tr050k', '3.900.000đ']) {
        assert.equal(isCoverPrice(price), false, price);
    }
});

test('scoped updates preserve legacy fields only when they match the baseline', (t) => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'book-intake-price-'));
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    fs.mkdirSync(path.join(root, 'data/template'), { recursive: true });
    fs.mkdirSync(path.join(root, 'data/book'));
    fs.copyFileSync(path.join(__dirname, '../data/template/book-detail.json'), path.join(root, 'data/template/book-detail.json'));
    const baseline = emptyBook(root);
    Object.assign(baseline, { id: 'test-book', title: 'Test Book', authors: ['Test Author'] });
    Object.assign(baseline.editions[0], {
        id: 'test-book-limited-3900k', cover_price: '3900k', pub_year: 2026,
        publisher: 'Test Publisher', issuers: ['Test Issuer'], format: 'Bìa cứng',
        thumbnail: '/assets/img/books/test-book/cover.jpg'
    });
    baseline.editions.push({ ...structuredClone(baseline.editions[0]), id: 'test-book-regular-1900k', cover_price: '1900k', thumbnail: 'https://example.com/regular.jpg' });
    const candidate = structuredClone(baseline);
    Object.assign(candidate.editions[0], { id: 'test-book-limited-3tr900k', cover_price: '3tr900k' });
    const check = (book, previous = baseline) => validate(root, book, { allowExisting: true, baseline: previous }).errors;
    assert.deepEqual(check(candidate), []);
    assert.ok(validate(root, candidate, { allowExisting: true }).errors.length);
    const badPrice = structuredClone(candidate);
    badPrice.editions[1].cover_price = '1800k';
    assert.ok(check(badPrice).some((e) => e.includes('cover_price')));
    const badImage = structuredClone(candidate);
    badImage.editions[1].thumbnail = 'https://example.com/different.jpg';
    assert.ok(check(badImage).some((e) => e.includes('URL ảnh')));
    assert.ok(check(candidate, { ...baseline, id: 'other-book' }).length);
});
