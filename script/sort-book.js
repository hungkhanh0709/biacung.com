const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const bookIndexPath = path.join(rootDir, 'data', 'book.json');

function readJsonFile(filePath) {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
}

function writeJsonFileAtomic(filePath, payload) {
    const directory = path.dirname(filePath);
    const tempFilePath = path.join(
        directory,
        `.${path.basename(filePath)}.${process.pid}.${Date.now()}.tmp`
    );

    fs.writeFileSync(tempFilePath, JSON.stringify(payload, null, 2) + '\n', 'utf8');
    fs.renameSync(tempFilePath, filePath);
}

function getUpdatedAtValue(entry) {
    if (!entry || typeof entry !== 'object') {
        return '';
    }

    return typeof entry.updated_at === 'string' ? entry.updated_at.trim() : '';
}

function compareBookEntries(left, right) {
    const leftUpdatedAt = getUpdatedAtValue(left);
    const rightUpdatedAt = getUpdatedAtValue(right);

    if (leftUpdatedAt !== rightUpdatedAt) {
        return rightUpdatedAt.localeCompare(leftUpdatedAt, 'en');
    }

    const leftDetail = left && typeof left.detail === 'string' ? left.detail : '';
    const rightDetail = right && typeof right.detail === 'string' ? right.detail : '';

    return leftDetail.localeCompare(rightDetail, 'en');
}

function main() {
    if (!fs.existsSync(bookIndexPath)) {
        throw new Error(`Không tìm thấy file: ${bookIndexPath}`);
    }

    const bookEntries = readJsonFile(bookIndexPath);
    if (!Array.isArray(bookEntries)) {
        throw new Error('`data/book.json` phải là một mảng JSON.');
    }

    const sortedEntries = bookEntries.slice().sort(compareBookEntries);
    writeJsonFileAtomic(bookIndexPath, sortedEntries);

    console.log(`Đã sắp xếp ${sortedEntries.length} mục trong ${path.relative(rootDir, bookIndexPath)}.`);
}

try {
    main();
} catch (error) {
    console.error(error.message || error);
    process.exitCode = 1;
}
