const fs = require('fs');
const path = require('path');
const { withPublicationSummary, sortBookEntries } = require('../assets/js/publication-date');

// Rebuild only the index. Legacy detail files are never migrated by this command.
function sortBookIndex(rootDir, { orderFrom } = {}) {
    const indexPath = path.join(rootDir, 'data/book.json');
    const entries = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    if (!Array.isArray(entries)) throw new Error('`data/book.json` phải là một mảng JSON.');
    let ordered = entries;
    if (orderFrom) {
        const previous = JSON.parse(fs.readFileSync(path.resolve(rootDir, orderFrom), 'utf8'));
        const byDetail = new Map(entries.map((entry) => [entry.detail, entry]));
        if (!Array.isArray(previous) || previous.length !== entries.length
            || byDetail.size !== entries.length
            || new Set(previous.map((entry) => entry.detail)).size !== entries.length
            || previous.some((entry) => !byDetail.has(entry.detail))) {
            throw new Error('Snapshot thứ tự phải có cùng tập detail, không trùng hoặc thiếu sách.');
        }
        ordered = previous.map((entry) => byDetail.get(entry.detail));
    }
    const hydrated = ordered.map((entry) => {
        if (!entry.detail) return withPublicationSummary(entry, {});
        const book = JSON.parse(fs.readFileSync(path.join(rootDir, entry.detail), 'utf8'));
        return withPublicationSummary(entry, book);
    });
    const sorted = sortBookEntries(hydrated);
    const temp = `${indexPath}.${process.pid}.tmp`;
    fs.writeFileSync(temp, JSON.stringify(sorted, null, 2) + '\n');
    fs.renameSync(temp, indexPath);
    return sorted;
}

if (require.main === module) {
    try {
        const args = process.argv.slice(2);
        if (args.length && (args.length !== 2 || args[0] !== '--order-from')) {
            throw new Error('Dùng sort-book [--order-from <snapshot-index.json>].');
        }
        const entries = sortBookIndex(path.resolve(__dirname, '..'), { orderFrom: args[1] });
        console.log(`Đã cập nhật ngày/năm phát hành và sắp xếp ${entries.length} mục trong data/book.json.`);
    } catch (error) {
        console.error(error.message || error);
        process.exitCode = 1;
    }
}

module.exports = { sortBookIndex };
