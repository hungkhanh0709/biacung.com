const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

function createPublicationFixture() {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'biacung-publication-'));
    const repo = path.resolve(__dirname, '../..');
    const write = (name, value) => {
        const file = path.join(root, name);
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, JSON.stringify(value, null, 2));
    };
    const read = (name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
    const template = JSON.parse(fs.readFileSync(path.join(repo, 'data/template/book-detail.json')));
    const edition = (bookId, year) => ({
        ...template.editions[0], id: `${bookId}-${year}`, series_ids: [], pub_year: year,
        title: undefined, pub_date: undefined, caption: 'Bìa Cứng', format: 'Bìa Cứng', cover_price: '900k',
        translators: [], illustrators: [], proofreaders: [], detail: '', size_cm: '',
        thumbnail: `/assets/img/books/${bookId}/cover.jpg`, gellery_imgs: []
    });
    for (const [id, years] of [['test-a', [2024, 2026]], ['test-b', [2025]]]) {
        write(`data/book/${id}.json`, {
            id, title: id === 'test-a' ? 'Sách Kiểm Thử A' : 'Sách Kiểm Thử B',
            title_original: 'Test Book', authors: ['Test Author'], awards: [], series: [],
            editions: years.map((year) => edition(id, year))
        });
    }
    write('data/book.json', [
        { detail: 'data/book/test-b.json', search_text: 'sach kiem thu test author', last_pub_year: 2025, updated_at: '2099-01-01' },
        { detail: 'data/book/test-a.json', search_text: 'sach kiem thu test author', last_pub_year: 2026, updated_at: '2000-01-01' }
    ]);
    write('data/author.json', [{ id: 'test-author', name: 'Test Author', work_ids: ['test-a', 'test-b'] }]);
    write('data/series.json', []);
    write('data/home.json', [{ id: 'recently-archived', limit: 12 }]);
    write('data/template/book-detail.json', template);
    for (const name of ['script/book-input-server.js', 'assets/js/publication-date.js']) {
        fs.mkdirSync(path.dirname(path.join(root, name)), { recursive: true });
        fs.copyFileSync(path.join(repo, name), path.join(root, name));
    }
    return { root, repo, read, write, cleanup: () => fs.rmSync(root, { recursive: true, force: true }) };
}

module.exports = { createPublicationFixture };
