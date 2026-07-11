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

function getDetailPathValue(entry) {
    if (!entry || typeof entry !== 'object') {
        return '';
    }

    return typeof entry.detail === 'string' ? entry.detail.trim() : '';
}

function normalizePubYearValue(value) {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === 'string' && value.trim() !== '') {
        const parsedYear = Number(value.trim());
        return Number.isFinite(parsedYear) ? parsedYear : null;
    }

    return null;
}

function getLastPubYearFromBookDetail(bookDetail) {
    if (!bookDetail || typeof bookDetail !== 'object' || !Array.isArray(bookDetail.editions)) {
        return '';
    }

    let maxPubYear = null;
    for (const edition of bookDetail.editions) {
        const pubYear = normalizePubYearValue(edition && edition.pub_year);
        if (pubYear === null) {
            continue;
        }

        if (maxPubYear === null || pubYear > maxPubYear) {
            maxPubYear = pubYear;
        }
    }

    return maxPubYear === null ? '' : maxPubYear;
}

function enrichBookEntryWithLastPubYear(entry) {
    const detailPathValue = getDetailPathValue(entry);
    if (!detailPathValue) {
        return {
            ...entry,
            last_pub_year: ''
        };
    }

    const detailPath = path.join(rootDir, detailPathValue);
    if (!fs.existsSync(detailPath)) {
        throw new Error(`Không tìm thấy file chi tiết cho entry: ${detailPathValue}`);
    }

    const bookDetail = readJsonFile(detailPath);
    return {
        ...entry,
        last_pub_year: getLastPubYearFromBookDetail(bookDetail)
    };
}

function getLastPubYearValue(entry) {
    if (!entry || typeof entry !== 'object') {
        return null;
    }

    return normalizePubYearValue(entry.last_pub_year);
}

function compareBookEntries(left, right) {
    const leftLastPubYear = getLastPubYearValue(left);
    const rightLastPubYear = getLastPubYearValue(right);

    if (leftLastPubYear !== rightLastPubYear) {
        if (leftLastPubYear === null) {
            return 1;
        }

        if (rightLastPubYear === null) {
            return -1;
        }

        return rightLastPubYear - leftLastPubYear;
    }

    const leftUpdatedAt = getUpdatedAtValue(left);
    const rightUpdatedAt = getUpdatedAtValue(right);

    if (leftUpdatedAt !== rightUpdatedAt) {
        return rightUpdatedAt.localeCompare(leftUpdatedAt, 'en');
    }

    const leftDetail = getDetailPathValue(left);
    const rightDetail = getDetailPathValue(right);

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

    const hydratedEntries = bookEntries.map(enrichBookEntryWithLastPubYear);
    const sortedEntries = hydratedEntries.slice().sort(compareBookEntries);
    writeJsonFileAtomic(bookIndexPath, sortedEntries);

    console.log(
        `Đã cập nhật last_pub_year và sắp xếp ${sortedEntries.length} mục trong ${path.relative(rootDir, bookIndexPath)}.`
    );
}

try {
    main();
} catch (error) {
    console.error(error.message || error);
    process.exitCode = 1;
}
