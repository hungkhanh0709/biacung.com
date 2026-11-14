const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { init, cleanup, scanSources } = require('./book-intake');
const { sortBookIndex } = require('./sort-book');
const { sortEditions } = require('../assets/js/publication-date');
const { createPublicationFixture } = require('./test-helpers/publication-fixture');

test('cleanup checks a newly added edition once, with detail-only verification and concise evidence', (t) => {
    const f = createPublicationFixture(); t.after(f.cleanup);
    init(f.root);
    const baseline = f.read('data/book/test-a.json');
    f.write('data/_raw/baseline-book.json', baseline);
    const saved = structuredClone(baseline);
    saved.editions.push({ ...saved.editions[0], id: 'test-a-2027', pub_year: 2027, pub_date: null });
    saved.editions = sortEditions(saved.editions);
    f.write('data/book/test-a.json', saved);
    f.write('data/_raw/book.json', saved);
    f.write('data/_raw/evidence.json', {
        scope: { baseline: 'data/_raw/baseline-book.json' }, conflicts: [], images: []
    });
    fs.mkdirSync(path.join(f.root, 'assets/img/books/test-a'), { recursive: true });
    fs.writeFileSync(path.join(f.root, 'assets/img/books/test-a/cover.jpg'), 'test image placeholder');
    sortBookIndex(f.root);
    const verification = {
        checked_at: '2026-11-14T02:00:00Z',
        detail: { url: 'http://127.0.0.1:3000/detail?id=test-a', metadata_matches: true,
            images_load: true, edition_ids: ['test-a-2026'] }
    };
    f.write('data/_raw/verification.json', verification);
    assert.throws(() => cleanup(f.root), /edition_ids/);
    assert.ok(fs.existsSync(path.join(f.root, 'data/_raw/baseline-book.json')));
    verification.detail.edition_ids = ['test-a-2027'];
    f.write('data/_raw/verification.json', verification);
    const outputBefore = fs.readFileSync(path.join(f.root, 'data/book/test-a.json'), 'utf8');
    assert.equal(cleanup(f.root).bookId, 'test-a');
    assert.deepEqual(fs.readdirSync(path.join(f.root, 'data/_raw')), ['.gitkeep']);
    assert.equal(fs.readFileSync(path.join(f.root, 'data/book/test-a.json'), 'utf8'), outputBefore);
});

test('source inventory excludes previews and keeps history when raw images change', (t) => {
    const f = createPublicationFixture(); t.after(f.cleanup);
    init(f.root);
    fs.mkdirSync(path.join(f.root, 'data/_raw/previews'));
    fs.writeFileSync(path.join(f.root, 'data/_raw/previews/preview.jpg'), 'preview');
    const source = path.join(f.root, 'data/_raw/source.jpg');
    fs.writeFileSync(source, 'source-v1');
    const first = scanSources(f.root);
    assert.equal(first.image_count, 1);
    fs.writeFileSync(source, 'source-v2');
    const next = scanSources(f.root);
    assert.equal(next.image_count, 1);
    assert.equal(next.registered_image_count, 2);
    assert.deepEqual(next.images.map(i => i.present), [false, true]);
});
