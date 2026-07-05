const http = require('http');
const fs = require('fs');
const path = require('path');
const { buildBookDetailFromHtml } = require('./fahasa-crawler');

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

function getContentType(filePath) {
    if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
    if (filePath.endsWith('.js')) return 'application/javascript; charset=utf-8';
    if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
    if (filePath.endsWith('.json')) return 'application/json; charset=utf-8';
    return 'application/octet-stream';
}

function isFahasaUrl(rawUrl) {
    try {
        const parsed = new URL(rawUrl);
        return parsed.protocol === 'https:' && (parsed.hostname === 'fahasa.com' || parsed.hostname.endsWith('.fahasa.com'));
    } catch (error) {
        return false;
    }
}

function buildJinaProxyUrl(targetUrl) {
    const parsed = new URL(targetUrl);
    return `https://r.jina.ai/http://${parsed.hostname}${parsed.pathname}${parsed.search}`;
}

async function fetchSourceText(targetUrl) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    try {
        const response = await fetch(targetUrl, {
            signal: controller.signal,
            headers: {
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
                accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'accept-language': 'vi-VN,vi;q=0.9,en;q=0.8'
            }
        });

        return {
            response,
            text: await response.text(),
            source: 'direct'
        };
    } finally {
        clearTimeout(timeout);
    }
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

async function handleCrawlFahasa(req, res) {
    let body = '';
    req.on('data', (chunk) => {
        body += chunk;
    });

    req.on('end', async () => {
        try {
            const payload = JSON.parse(body || '{}');
            const targetUrl = normalizeText(payload.url || '');

            if (!targetUrl) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Missing URL' }));
                return;
            }

            if (!isFahasaUrl(targetUrl)) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Chỉ hỗ trợ URL từ fahasa.com.' }));
                return;
            }

            let fetched = await fetchSourceText(targetUrl);
            let usedProxy = false;

            if (!fetched.response.ok) {
                if (fetched.response.status === 403 || fetched.response.status === 429) {
                    const proxyUrl = buildJinaProxyUrl(targetUrl);
                    fetched = await fetchSourceText(proxyUrl);
                    usedProxy = true;
                }
            }

            if (!fetched.response.ok) {
                res.writeHead(fetched.response.status, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: `Không thể tải trang Fahasa (${fetched.response.status})` }));
                return;
            }

            const bookDetail = buildBookDetailFromHtml(fetched.text, targetUrl);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: true, source: usedProxy ? 'fahasa-proxy' : 'fahasa', bookDetail }));
        } catch (error) {
            const status = error?.name === 'AbortError' ? 504 : 500;
            res.writeHead(status, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message || 'Không thể crawl dữ liệu từ Fahasa.' }));
        }
    });
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

    if (pathname === '/api/crawl/fahasa' && req.method === 'POST') {
        handleCrawlFahasa(req, res);
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
        console.log(`Book generator server listening on http://127.0.0.1:${port}`);
    });
}

module.exports = {
    server,
    buildBookDetailFromHtml,
    handleCrawlFahasa,
    handleGetIndexState,
    handleGetBook,
    handleSave
};
