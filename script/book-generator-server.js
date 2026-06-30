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

function parseLines(value) {
    return normalizeText(value)
        .split(/\r?\n/)
        .map((entry) => entry.trim())
        .filter(Boolean);
}

function slugify(value) {
    return (value || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[^\p{L}\p{N}\s-]/gu, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

function mergeAuthors(existingAuthors, incomingAuthors, bookId) {
    const merged = Array.isArray(existingAuthors) ? existingAuthors.map((entry) => ({ ...entry })) : [];
    (Array.isArray(incomingAuthors) ? incomingAuthors : []).forEach((author) => {
        const authorId = slugify(author.name || author.id || '');
        const existingAuthor = merged.find((entry) => slugify(entry.name || '') === authorId || entry.id === authorId);
        if (existingAuthor) {
            existingAuthor.work_ids = existingAuthor.work_ids || [];
            if (!existingAuthor.work_ids.includes(bookId)) {
                existingAuthor.work_ids.push(bookId);
            }
            existingAuthor.name = existingAuthor.name || author.name;
            return;
        }

        merged.push({
            id: authorId,
            name: author.name || author.id || '',
            work_ids: [bookId]
        });
    });

    return merged.sort((left, right) => (left.name || '').localeCompare(right.name || '', 'vi'));
}

function mergeSeries(existingSeries, incomingSeries, bookId) {
    const merged = Array.isArray(existingSeries) ? existingSeries.map((entry) => ({ ...entry })) : [];
    (Array.isArray(incomingSeries) ? incomingSeries : []).forEach((seriesItem) => {
        const seriesId = slugify(seriesItem.name || seriesItem.id || '');
        const existingEntry = merged.find((entry) => slugify(entry.name || '') === seriesId || entry.id === seriesId);
        if (existingEntry) {
            existingEntry.work_ids = existingEntry.work_ids || [];
            if (!existingEntry.work_ids.includes(bookId)) {
                existingEntry.work_ids.push(bookId);
            }
            existingEntry.name = existingEntry.name || seriesItem.name;
            return;
        }

        merged.push({
            id: seriesId,
            name: seriesItem.name || seriesItem.id || '',
            description: seriesItem.description || 'Collection introducing...',
            thumbnail: seriesItem.thumbnail || '',
            work_ids: [bookId]
        });
    });

    return merged.sort((left, right) => (left.name || '').localeCompare(right.name || '', 'vi'));
}

function mergeBookIndex(existingBookIndex, detailPath, updatedAt, searchText) {
    const merged = Array.isArray(existingBookIndex) ? existingBookIndex.filter((entry) => entry && entry.detail !== detailPath) : [];
    merged.push({
        detail: detailPath,
        search_text: searchText || detailPath,
        updated_at: updatedAt
    });
    return merged.sort((left, right) => (right.updated_at || '').localeCompare(left.updated_at || '', 'en'));
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
            const bookId = normalizeText(bookDetail.id || '');
            const updatedAt = bookDetail.updated_at || new Date().toISOString().slice(0, 10);
            const detailPath = `data/book/${bookId}.json`;

            if (!bookId) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Missing book id' }));
                return;
            }

            ensureDirectory(bookDir);
            ensureDirectory(seriesDir);

            const existingBookDetail = readJsonFile(path.join(bookDir, `${bookId}.json`), null);
            const existingBookIndex = readJsonFile(path.join(dataDir, 'book.json'), []);
            const existingAuthors = readJsonFile(path.join(dataDir, 'author.json'), []);
            const existingSeries = readJsonFile(path.join(dataDir, 'series.json'), []);

            const mergedBookDetail = {
                ...(existingBookDetail || {}),
                ...bookDetail,
                id: bookId,
                updated_at: updatedAt
            };

            const mergedBookIndex = Array.isArray(existingBookIndex) ? existingBookIndex.filter((entry) => entry && entry.detail !== detailPath) : [];
            const incomingBookIndex = Array.isArray(bookIndex) ? bookIndex : [];
            incomingBookIndex.forEach((entry) => {
                if (entry && entry.detail) {
                    mergedBookIndex.push({
                        detail: entry.detail || detailPath,
                        search_text: entry.search_text || '',
                        updated_at: entry.updated_at || updatedAt
                    });
                }
            });
            mergedBookIndex.sort((left, right) => (right.updated_at || '').localeCompare(left.updated_at || '', 'en'));

            const mergedAuthors = mergeAuthors(existingAuthors, Array.isArray(authorPayload) ? authorPayload : [], bookId);
            const mergedSeries = mergeSeries(existingSeries, Array.isArray(seriesPayload) ? seriesPayload : [], bookId);

            writeJsonFile(path.join(bookDir, `${bookId}.json`), mergedBookDetail);
            writeJsonFile(path.join(dataDir, 'book.json'), mergedBookIndex);
            writeJsonFile(path.join(dataDir, 'author.json'), mergedAuthors);
            writeJsonFile(path.join(dataDir, 'series.json'), mergedSeries);

            (Array.isArray(seriesPayload) ? seriesPayload : []).forEach((seriesItem) => {
                const seriesId = slugify(seriesItem.name || seriesItem.id || '');
                if (!seriesId) {
                    return;
                }
                const outputSeriesPayload = {
                    id: seriesId,
                    name: seriesItem.name || seriesItem.id || '',
                    description: seriesItem.description || 'Collection introducing...',
                    thumbnail: seriesItem.thumbnail || '',
                    work_ids: Array.isArray(seriesItem.work_ids) ? seriesItem.work_ids : [bookId]
                };
                writeJsonFile(path.join(seriesDir, `${seriesId}.json`), outputSeriesPayload);
            });

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: true, bookId, detailPath, updatedAt }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
    });
}

function handleGetBook(req, res, slug) {
    const filePath = path.join(bookDir, `${slug}.json`);
    if (!fs.existsSync(filePath)) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'not found' }));
        return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(fs.readFileSync(filePath, 'utf8'));
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
