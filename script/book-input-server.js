const http = require('http');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const dataDir = path.join(rootDir, 'data');
const bookDir = path.join(dataDir, 'book');
const seriesDir = path.join(dataDir, 'series');

function ensureDirectory(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function readJsonFile(filePath, fallback = null) {
    if (!fs.existsSync(filePath)) {
        return fallback;
    }

    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
        return fallback;
    }
}

function writeJsonFile(filePath, payload) {
    ensureDirectory(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));
}

function normalizeText(value) {
    return (value == null ? '' : String(value)).trim();
}

function sanitizeBookDetailPayload(payload, fallbackId = '') {
    const source = payload && typeof payload === 'object' ? payload : {};
    const { book_id, updated_at, ...rest } = source;

    return {
        ...rest,
        id: normalizeText(rest.id || fallbackId)
    };
}

function sanitizeSeriesDetailPayload(payload, fallbackId = '') {
    const source = payload && typeof payload === 'object' ? payload : {};
    const { detail, ...rest } = source;

    return {
        ...rest,
        id: normalizeText(rest.id || fallbackId)
    };
}

function slugify(value) {
    return (value || '')
        .toLowerCase()
        .replace(/đ/g, 'd')
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function mergeAuthors(existingAuthors, incomingAuthors) {
    const orderedIds = [];
    const mergedById = new Map();

    const upsert = (author) => {
        if (!author || typeof author !== 'object') {
            return;
        }

        const authorId = normalizeText(author.id || slugify(author.name || ''));
        if (!authorId) {
            return;
        }

        const normalizedAuthor = {
            ...author,
            id: authorId,
            name: normalizeText(author.name || authorId),
            work_ids: Array.isArray(author.work_ids)
                ? [...new Set(author.work_ids.map((workId) => normalizeText(workId)).filter(Boolean))]
                : []
        };

        if (!mergedById.has(authorId)) {
            orderedIds.push(authorId);
        }

        mergedById.set(authorId, normalizedAuthor);
    };

    (Array.isArray(existingAuthors) ? existingAuthors : []).forEach(upsert);
    (Array.isArray(incomingAuthors) ? incomingAuthors : []).forEach(upsert);

    return orderedIds.map((authorId) => mergedById.get(authorId));
}

function mergeSeries(existingSeries, incomingSeries, bookId) {
    const merged = Array.isArray(existingSeries) ? existingSeries.map((entry) => ({ ...entry })) : [];
    (Array.isArray(incomingSeries) ? incomingSeries : []).forEach((seriesItem) => {
        const seriesId = slugify(seriesItem.name || seriesItem.id || '');
        if (!seriesId) {
            return;
        }

        const existingEntry = merged.find((entry) => entry.id === seriesId);
        if (existingEntry) {
            existingEntry.detail = existingEntry.detail || `data/series/${seriesId}.json`;
            return;
        }

        merged.push({
            id: seriesId,
            detail: `data/series/${seriesId}.json`
        });
    });

    return merged;
}

function normalizeArrayPayload(payload) {
    if (Array.isArray(payload)) {
        return payload;
    }

    if (payload && typeof payload === 'object') {
        return [payload];
    }

    return [];
}

function normalizeBookIndexEntry(entry, fallbackUpdatedAt, existingEntry = null) {
    if (!entry || typeof entry !== 'object' || !entry.detail) {
        return null;
    }

    const detailPath = normalizeText(entry.detail);
    if (!detailPath) {
        return null;
    }

    return {
        ...(existingEntry && typeof existingEntry === 'object' ? existingEntry : {}),
        ...entry,
        detail: detailPath,
        search_text: normalizeText(entry.search_text || ''),
        updated_at: normalizeText(entry.updated_at || existingEntry?.updated_at || fallbackUpdatedAt)
    };
}

function mergeBookIndexEntries(existingBookIndex, incomingEntries, fallbackUpdatedAt) {
    const orderedDetails = [];
    const mergedByDetail = new Map();

    const upsert = (entry) => {
        const normalizedEntry = normalizeBookIndexEntry(entry, fallbackUpdatedAt, mergedByDetail.get(normalizeText(entry?.detail)));
        if (!normalizedEntry) {
            return;
        }

        const detailPath = normalizedEntry.detail;

        if (!mergedByDetail.has(detailPath)) {
            orderedDetails.push(detailPath);
        }

        mergedByDetail.set(detailPath, normalizedEntry);
    };

    (Array.isArray(existingBookIndex) ? existingBookIndex : []).forEach(upsert);
    normalizeArrayPayload(incomingEntries).forEach(upsert);

    return orderedDetails.map((detailPath) => mergedByDetail.get(detailPath));
}

function mergeDetailPayload(existingPayload, incomingPayload, fallbackIdPath) {
    const existing = sanitizeBookDetailPayload(existingPayload, fallbackIdPath);
    const incoming = sanitizeBookDetailPayload(incomingPayload, fallbackIdPath);
    const merged = {
        ...existing,
        ...incoming
    };

    merged.id = normalizeText(incoming.id || existing.id || fallbackIdPath);
    if (Array.isArray(incoming.editions)) {
        const existingEditionsById = new Map(
            (Array.isArray(existing.editions) ? existing.editions : [])
                .filter((edition) => normalizeText(edition?.id))
                .map((edition) => [normalizeText(edition.id), edition])
        );
        merged.editions = incoming.editions.map((edition) => {
            const normalizedEdition = {
                ...(existingEditionsById.get(normalizeText(edition?.id)) || {}),
                ...edition,
                series_ids: Array.isArray(edition?.series_ids) ? edition.series_ids : []
            };
            if (!Object.prototype.hasOwnProperty.call(edition, 'title')) {
                delete normalizedEdition.title;
            }
            const editionTitle = normalizeText(normalizedEdition.title);
            const defaultTitle = normalizeText(merged.title);
            if (!editionTitle || editionTitle.toLocaleLowerCase('vi') === defaultTitle.toLocaleLowerCase('vi')) {
                delete normalizedEdition.title;
            } else {
                normalizedEdition.title = editionTitle;
            }

            const { id, title, ...editionFields } = normalizedEdition;
            return {
                ...(id ? { id } : {}),
                ...(title ? { title } : {}),
                ...editionFields
            };
        });
    }
    return merged;
}

function writeSeriesDetailFiles(seriesPayload, bookId) {
    const incomingSeries = normalizeArrayPayload(seriesPayload);
    incomingSeries.forEach((seriesItem) => {
        if (!seriesItem || typeof seriesItem !== 'object') {
            return;
        }

        const seriesId = slugify(seriesItem.id || seriesItem.name || '');
        if (!seriesId) {
            return;
        }

        const filePath = path.join(seriesDir, `${seriesId}.json`);
        const existingSeriesDetail = readJsonFile(filePath, null);
        const normalizedSeriesItem = sanitizeSeriesDetailPayload(seriesItem, seriesId);
        const mergedSeriesDetail = {
            ...(existingSeriesDetail || {}),
            ...normalizedSeriesItem,
            id: seriesId,
            name: normalizeText(normalizedSeriesItem.name || existingSeriesDetail?.name || ''),
            description: normalizeText(normalizedSeriesItem.description || existingSeriesDetail?.description || ''),
            thumbnail: normalizeText(normalizedSeriesItem.thumbnail || existingSeriesDetail?.thumbnail || ''),
            work_ids: Array.isArray(normalizedSeriesItem.work_ids)
                ? [...new Set(normalizedSeriesItem.work_ids.filter(Boolean))]
                : (Array.isArray(existingSeriesDetail?.work_ids) ? existingSeriesDetail.work_ids.slice() : [])
        };

        if (bookId && !mergedSeriesDetail.work_ids.includes(bookId)) {
            mergedSeriesDetail.work_ids.push(bookId);
        }

        writeJsonFile(filePath, mergedSeriesDetail);
    });
}

function saveBookIndexReview(bookIndexReview, updatedAt) {
    const existingBookIndex = readJsonFile(path.join(dataDir, 'book.json'), []);
    const mergedBookIndex = mergeBookIndexEntries(existingBookIndex, bookIndexReview, updatedAt);
    writeJsonFile(path.join(dataDir, 'book.json'), mergedBookIndex);
    return mergedBookIndex;
}

function saveBookDetailReview(bookDetailReview, bookId) {
    const normalizedBookId = slugify(bookId || bookDetailReview?.id || '');
    if (!normalizedBookId) {
        throw new Error('Missing book id');
    }

    const filePath = path.join(bookDir, `${normalizedBookId}.json`);
    const existingBookDetail = readJsonFile(filePath, null);
    const mergedBookDetail = mergeDetailPayload(existingBookDetail, bookDetailReview, normalizedBookId);
    mergedBookDetail.id = normalizedBookId;
    writeJsonFile(filePath, mergedBookDetail);
    return mergedBookDetail;
}

function saveAuthorReview(authorReview, bookId) {
    const existingAuthors = readJsonFile(path.join(dataDir, 'author.json'), []);
    const incomingAuthors = normalizeArrayPayload(authorReview).map((author) => {
        if (!author || typeof author !== 'object') {
            return null;
        }

        const authorId = normalizeText(author.id || slugify(author.name || ''));
        if (!authorId) {
            return null;
        }

        const workIds = Array.isArray(author.work_ids)
            ? author.work_ids.map((workId) => normalizeText(workId)).filter(Boolean)
            : [];
        if (bookId && !workIds.includes(bookId)) {
            workIds.push(bookId);
        }

        return {
            ...author,
            id: authorId,
            name: normalizeText(author.name || authorId),
            work_ids: workIds
        };
    }).filter(Boolean);

    const mergedAuthors = mergeAuthors(existingAuthors, incomingAuthors);
    writeJsonFile(path.join(dataDir, 'author.json'), mergedAuthors);
    return mergedAuthors;
}

function saveSeriesReview(seriesReview, bookId) {
    const existingSeries = readJsonFile(path.join(dataDir, 'series.json'), []);
    const incomingSeries = normalizeArrayPayload(seriesReview).filter((entry) => slugify(entry?.id || entry?.name || ''));
    if (!incomingSeries.length) {
        return existingSeries;
    }

    writeSeriesDetailFiles(incomingSeries, bookId);
    const mergedSeries = mergeSeries(existingSeries, incomingSeries, bookId);
    writeJsonFile(path.join(dataDir, 'series.json'), mergedSeries);
    return mergedSeries;
}

function getContentType(filePath) {
    if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
    if (filePath.endsWith('.js')) return 'application/javascript; charset=utf-8';
    if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
    if (filePath.endsWith('.json')) return 'application/json; charset=utf-8';
    return 'application/octet-stream';
}

function serveStaticFile(requestUrl) {
    const pathname = new URL(requestUrl, 'http://127.0.0.1').pathname;
    const relativePath = pathname === '/' ? '/index.html' : pathname;
    const filePath = path.join(rootDir, relativePath.replace(/^\//, ''));

    if (!filePath.startsWith(rootDir)) {
        return null;
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        return {
            statusCode: 200,
            contentType: getContentType(filePath),
            body: fs.readFileSync(filePath)
        };
    }

    return null;
}

function handleSave(req, res) {
    let body = '';
    req.on('data', (chunk) => {
        body += chunk;
    });

    req.on('end', () => {
        try {
            const payload = JSON.parse(body || '{}');
            const bookDetail = payload.bookDetail || {};
            const bookIndex = payload.bookIndex || [];
            const authorPayload = payload.authorPayload || [];
            const seriesPayload = payload.seriesPayload || [];
            const bookId = slugify(bookDetail.id || '');
            const detailPath = `data/book/${bookId}.json`;

            if (!bookId) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Missing book id' }));
                return;
            }

            ensureDirectory(bookDir);
            ensureDirectory(seriesDir);

            saveBookDetailReview(bookDetail, bookId);
            const updatedAt = new Date().toISOString().slice(0, 10);
            const mergedBookIndex = saveBookIndexReview(bookIndex, updatedAt);
            const mergedAuthors = saveAuthorReview(authorPayload, bookId);
            saveSeriesReview(seriesPayload, bookId);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: true, bookId, detailPath, updatedAt }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
    });
}

function handleSaveBookIndexReview(req, res) {
    let body = '';
    req.on('data', (chunk) => {
        body += chunk;
    });

    req.on('end', () => {
        try {
            const payload = JSON.parse(body || '{}');
            const review = payload.bookIndexReview || payload.bookIndex || payload.review || payload || {};
            const updatedAt = normalizeText(review.updated_at || new Date().toISOString().slice(0, 10));
            const mergedBookIndex = saveBookIndexReview(review, updatedAt);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: true, count: mergedBookIndex.length, updatedAt }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
    });
}

function handleSaveBookDetailReview(req, res) {
    let body = '';
    req.on('data', (chunk) => {
        body += chunk;
    });

    req.on('end', () => {
        try {
            const payload = JSON.parse(body || '{}');
            const review = payload.bookDetail || payload.bookDetailReview || payload.review || payload || {};
            const bookId = normalizeText(payload.bookId || review.id || '');
            const savedBookDetail = saveBookDetailReview(review, bookId);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: true, bookId: savedBookDetail.id }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
    });
}

function handleSaveAuthorReview(req, res) {
    let body = '';
    req.on('data', (chunk) => {
        body += chunk;
    });

    req.on('end', () => {
        try {
            const payload = JSON.parse(body || '{}');
            const review = payload.authorReview || payload.authorPayload || payload.review || payload || [];
            const bookId = normalizeText(payload.bookId || payload.bookDetail?.id || '');
            const mergedAuthors = saveAuthorReview(review, bookId);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: true, count: mergedAuthors.length }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
    });
}

function handleSaveSeriesReview(req, res) {
    let body = '';
    req.on('data', (chunk) => {
        body += chunk;
    });

    req.on('end', () => {
        try {
            const payload = JSON.parse(body || '{}');
            const review = payload.seriesReview || payload.seriesPayload || payload.review || payload || [];
            const bookId = normalizeText(payload.bookId || payload.bookDetail?.id || '');
            const mergedSeries = saveSeriesReview(review, bookId);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: true, count: mergedSeries.length }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
    });
}

function handleGetBook(req, res, slug) {
    const normalizedSlug = slugify(slug);
    if (!normalizedSlug || normalizedSlug !== slug) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'invalid book id' }));
        return;
    }

    const filePath = path.join(bookDir, `${normalizedSlug}.json`);
    if (!fs.existsSync(filePath)) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'not found' }));
        return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    const bookDetail = readJsonFile(filePath, {});
    res.end(JSON.stringify(sanitizeBookDetailPayload(bookDetail, normalizedSlug)));
}

function handleGetIndexState(req, res) {
    const bookIndex = readJsonFile(path.join(dataDir, 'book.json'), []);
    const authors = readJsonFile(path.join(dataDir, 'author.json'), []);
    const series = readJsonFile(path.join(dataDir, 'series.json'), []);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ bookIndex, authors, series }));
}

const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1');
    const pathname = url.pathname;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (pathname === '/api/books/save' && req.method === 'POST') {
        handleSave(req, res);
        return;
    }

    if (pathname === '/api/books/save/book-index-review' && req.method === 'POST') {
        handleSaveBookIndexReview(req, res);
        return;
    }

    if (pathname === '/api/books/save/book-detail-review' && req.method === 'POST') {
        handleSaveBookDetailReview(req, res);
        return;
    }

    if (pathname === '/api/books/save/author-review' && req.method === 'POST') {
        handleSaveAuthorReview(req, res);
        return;
    }

    if (pathname === '/api/books/save/series-review' && req.method === 'POST') {
        handleSaveSeriesReview(req, res);
        return;
    }

    if (pathname === '/api/index-state' && req.method === 'GET') {
        handleGetIndexState(req, res);
        return;
    }

    const bookMatch = pathname.match(/^\/api\/books\/([^/]+)$/);
    if (bookMatch && req.method === 'GET') {
        handleGetBook(req, res, decodeURIComponent(bookMatch[1]));
        return;
    }

    const staticFile = serveStaticFile(req.url);
    if (staticFile) {
        res.writeHead(staticFile.statusCode, {
            'Content-Type': staticFile.contentType,
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
        });
        res.end(staticFile.body);
        return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'not found' }));
});

if (require.main === module) {
    const port = Number.parseInt(process.env.PORT || '3000', 10);
    server.listen(port, () => {
        console.log(`Book input server listening on http://127.0.0.1:${port}`);
    });
}

module.exports = {
    server,
    handleGetIndexState,
    handleGetBook,
    handleSave,
    mergeBookIndexEntries,
    mergeAuthors,
    mergeSeries
};
