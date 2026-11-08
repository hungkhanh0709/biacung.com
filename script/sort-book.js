const fs = require('fs');
const path = require('path');
const { withPublicationSummary, sortBookEntries } = require('../assets/js/publication-date');

// Rebuild only the index. Legacy detail files are never migrated by this command.
function sortBookIndex(rootDir) {
    const indexPath = path.join(rootDir, 'data/book.json');
    const entries = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    if (!Array.isArray(entries)) throw new Error('`data/book.json` phải là một mảng JSON.');
    const hydrated = entries.map((entry) => {
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
        const entries = sortBookIndex(path.resolve(__dirname, '..'));
        console.log(`Đã cập nhật ngày/năm phát hành và sắp xếp ${entries.length} mục trong data/book.json.`);
    } catch (error) {
        console.error(error.message || error);
        process.exitCode = 1;
    }
}

module.exports = { sortBookIndex };
