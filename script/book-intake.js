// Local intake helpers. Research/OCR and visual review remain agent responsibilities.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const publication = require('../assets/js/publication-date');

const ROOT = path.resolve(__dirname, '..');
const RAW = 'data/_raw';
const SOURCE_IMAGE = /\.(?:jpe?g|png|webp|avif|gif|heic|heif|tiff?|bmp)$/i;
const isSourceImage = (name) => !name.startsWith('previews/') && SOURCE_IMAGE.test(name);
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const hash = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const text = (value) => typeof value === 'string' && value.trim().length > 0;
const key = (value) => String(value || '').normalize('NFC').trim().toLocaleLowerCase('vi');
const authorName = (value) => String(value || '').trim().replace(/\s*\((?:tuyển chọn|biên soạn|chủ biên|sưu tầm)\)\s*$/iu, '').trim();
const slug = (value) => key(value).replace(/đ/g, 'd').normalize('NFD').replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
function write(file, value) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const temp = `${file}.${process.pid}.tmp`;
    fs.writeFileSync(temp, JSON.stringify(value, null, 2) + '\n');
    fs.renameSync(temp, file);
}
function within(parent, candidate) {
    const base = fs.realpathSync(parent);
    const resolved = fs.existsSync(candidate) ? fs.realpathSync(candidate) : path.resolve(candidate);
    return resolved !== base && resolved.startsWith(base + path.sep);
}
function draftPath(root, value = RAW) {
    const raw = path.join(root, RAW);
    const candidate = path.resolve(root, value);
    if (candidate !== raw || !fs.existsSync(candidate) || !within(root, candidate)
        || fs.lstatSync(candidate).isSymbolicLink() || !fs.statSync(candidate).isDirectory()) {
        throw new Error('Chỉ dùng thư mục data/_raw/ cho một tựa sách mỗi lượt.');
    }
    return candidate;
}
function vocabulary(root) {
    const counts = { caption: new Map(), format: new Map() };
    for (const name of fs.readdirSync(path.join(root, 'data/book'))) {
        if (!name.endsWith('.json')) continue;
        for (const edition of read(path.join(root, 'data/book', name)).editions || []) {
            for (const field of ['caption', 'format']) {
                if (text(edition[field])) counts[field].set(edition[field], (counts[field].get(edition[field]) || 0) + 1);
            }
        }
    }
    return {
        source: 'data/book/*.json', advisory_only: true,
        canonical_reference: '.agents/skills/book-intake/references/caption-format.md',
        ...Object.fromEntries(Object.entries(counts).map(([field, values]) => [field,
            [...values].map(([value, count]) => ({ value, count }))
                .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value, 'vi'))]))
    };
}
function emptyBook(root) {
    const template = read(path.join(root, 'data/template/book-detail.json'));
    const arrayFields = new Set(['authors', 'awards', 'series', 'series_ids', 'issuers', 'translators', 'illustrators', 'proofreaders', 'gellery_imgs']);
    const nullFields = new Set(['isbn', 'pub_date', 'pub_year', 'print_run', 'page_count', 'copy_numbering', 'weight_g']);
    function blank(object) {
        return Object.fromEntries(Object.keys(object).filter((field) => field !== 'title' || object === template).map((field) => {
            if (field === 'editions') return [field, [blank(template.editions[0])]];
            return [field, arrayFields.has(field) ? [] : nullFields.has(field) ? null : ''];
        }));
    }
    return blank(template);
}
function init(root) {
    const folder = path.join(root, RAW);
    fs.mkdirSync(folder, { recursive: true });
    draftPath(root);
    const created = [];
    function create(name, content) {
        const file = path.join(folder, name);
        if (fs.existsSync(file)) {
            if (fs.lstatSync(file).isSymbolicLink() || !fs.statSync(file).isFile()) throw new Error(`File nháp không an toàn: ${name}`);
            return;
        }
        fs.writeFileSync(file, content, { flag: 'wx' });
        created.push(name);
    }
    create('.gitkeep', '');
    create('source.md', '# Nội dung người dùng cung cấp\n\n');
    create('book.json', JSON.stringify(emptyBook(root), null, 2) + '\n');
    create('evidence.json', JSON.stringify({ fields: {}, searches: [], conflicts: [], image_reviews: [], images: [] }, null, 2) + '\n');
    const sources = scanSources(root, folder);
    return { draft: RAW, created, sources, next: 'Mở trực tiếp từng absolute_path trong sources.images; ghi image_reviews trước khi lưu. Không dùng rg --files thông thường để kết luận _raw không có ảnh vì bị gitignore.' };
}
function isCoverPrice(value) {
    const thousands = /^(?:0|[1-9]\d*)(?:\.\d+)?k$/.test(value) ? Number(value.slice(0, -1)) : null;
    if (thousands !== null) return thousands > 0 && thousands < 1000;
    const millions = /^[1-9]\d*tr(?:(?<remainder>(?:0|[1-9]\d{0,2})(?:\.\d+)?)k)?$/.exec(value);
    return Boolean(millions && (millions.groups.remainder === undefined
        || (Number(millions.groups.remainder) > 0 && Number(millions.groups.remainder) < 1000)));
}
function updateBaseline(root, value, bookId) {
    if (!value) return undefined;
    const file = path.resolve(root, value);
    if (!file.endsWith('.json') || !fs.existsSync(file) || !within(path.join(root, RAW), file)) {
        throw new Error('Baseline phải là JSON snapshot trong data/_raw/.');
    }
    const baseline = read(file);
    if (baseline.id !== bookId || !Array.isArray(baseline.editions)) throw new Error('Baseline không khớp sách đang cập nhật.');
    return baseline;
}
function validate(root, book, { relations = false, images = false, allowExisting = false, baseline, editionIdMap = {} } = {}) {
    const errors = [], missing = [], warnings = [];
    const bad = (message) => errors.push(message);
    const template = read(path.join(root, 'data/template/book-detail.json'));
    if (!book || typeof book !== 'object' || Array.isArray(book)) return { errors: ['Book phải là object.'], missing, warnings };
    if (typeof book.id !== 'string' || !SLUG.test(book.id)) bad('id phải là kebab-case.');
    if (!text(book.title)) bad('Thiếu title.');
    for (const field of ['authors', 'awards', 'series', 'editions']) {
        if (!Array.isArray(book[field])) bad(`${field} phải là mảng.`);
    }
    if (!book.authors?.length || !book.authors.every?.(text)) bad('Thiếu authors hoặc authors không hợp lệ.');
    for (const field of ['title', 'title_original']) if (typeof book[field] !== 'string') bad(`${field} phải là string.`);
    if (!text(book.title_original)) missing.push('title_original');
    for (const field of Object.keys(book)) if (!(field in template)) bad(`Field ngoài schema: ${field}`);
    for (const field of ['awards', 'series']) if (Array.isArray(book[field]) && !book[field].every(text)) bad(`${field} phải chứa string không rỗng.`);
    const editionIds = new Set();
    if (!Array.isArray(book.editions) || !book.editions.length) bad('Cần ít nhất một edition.');
    const imageFiles = new Set();
    const expectedEditionOrder = publication.sortEditions(book.editions);
    for (const [i, edition] of (Array.isArray(book.editions) ? book.editions : []).entries()) {
        const at = `editions[${i}]`;
        const originalId = Object.entries(editionIdMap).find(([, updatedId]) => updatedId === edition?.id)?.[0];
        const previous = allowExisting && baseline?.id === book.id
            ? (baseline.editions?.find((entry) => entry.id === edition?.id)
                || baseline.editions?.find((entry) => entry.id === originalId)
                || baseline.editions?.[i]) : null;
        if (!edition || typeof edition !== 'object' || Array.isArray(edition)) { bad(`${at} phải là object.`); continue; }
        for (const field of Object.keys(template.editions[0])) {
            if (field !== 'title' && field !== 'pub_date' && !(field in edition)) bad(`${at}.${field} thiếu key (dùng default khi chưa rõ).`);
        }
        for (const field of Object.keys(edition)) if (!(field in template.editions[0])) bad(`${at}.${field} ngoài schema.`);
        if (typeof edition.id !== 'string' || !SLUG.test(edition.id) || !edition.id.startsWith(`${book.id}-`)) bad(`${at}.id không có prefix bookId hợp lệ.`);
        if (editionIds.has(edition.id)) bad(`${at}.id trùng.`);
        editionIds.add(edition.id);
        for (const field of ['series_ids', 'issuers', 'translators', 'illustrators', 'proofreaders', 'gellery_imgs']) {
            if (!Array.isArray(edition[field]) || !edition[field].every(text)) bad(`${at}.${field} phải là mảng string.`);
        }
        for (const field of ['caption', 'publisher', 'format', 'cover_price', 'size_cm', 'thumbnail', 'detail']) {
            if (typeof edition[field] !== 'string') bad(`${at}.${field} phải là string.`);
        }
        if ('title' in edition && !text(edition.title)) bad(`${at}.title override phải có nội dung hoặc bỏ key.`);
        for (const field of ['pub_year', 'print_run', 'page_count', 'weight_g']) {
            if (edition[field] !== null && (!Number.isFinite(edition[field]) || edition[field] <= 0)) bad(`${at}.${field} phải là số dương hoặc null.`);
        }
        if (edition.pub_year !== null && (!Number.isInteger(edition.pub_year) || edition.pub_year < 1000 || edition.pub_year > 9999)) bad(`${at}.pub_year phải là năm 4 chữ số.`);
        if ('pub_date' in edition && edition.pub_date !== null && !publication.isIsoDate(edition.pub_date)) bad(`${at}.pub_date phải là ngày YYYY-MM-DD có thật hoặc null.`);
        if (publication.isIsoDate(edition.pub_date) && edition.pub_year !== Number(edition.pub_date.slice(0, 4))) bad(`${at}.pub_year phải khớp năm của pub_date.`);
        if (!publication.normalizeYear(edition.pub_year) && !edition.pub_date) missing.push(`${at}.pub_date`);
        if (expectedEditionOrder[i] !== edition) bad(`${at}: thứ tự edition chưa giảm dần theo năm/ngày; xem preview và lưu lại qua form.`);
        for (const field of ['isbn', 'copy_numbering']) if (edition[field] !== null && !text(edition[field])) bad(`${at}.${field} phải là string hoặc null.`);
        if (text(edition.cover_price) && !isCoverPrice(edition.cover_price)
            && previous?.cover_price !== edition.cover_price) bad(`${at}.cover_price phải có dạng 900k, 3tr900k hoặc 3tr.`);
        for (const field of ['pub_year', 'publisher', 'format', 'cover_price', 'thumbnail']) {
            if (edition[field] == null || edition[field] === '') missing.push(`${at}.${field}`);
        }
        if (!edition.issuers?.length) missing.push(`${at}.issuers`);
        const urls = [edition.thumbnail, ...(Array.isArray(edition.gellery_imgs) ? edition.gellery_imgs : [])].filter(text);
        if (images && !text(edition.thumbnail)) bad(`${at}.thumbnail còn thiếu.`);
        if (new Set(urls).size !== urls.length) bad(`${at}: thumbnail/gallery lặp ảnh.`);
        for (const url of urls) {
            // A photo of several works may be shared without copying the asset.
            const localImage = /^\/assets\/img\/books\/[a-z0-9]+(?:-[a-z0-9]+)*\/[a-z0-9]+(?:-[a-z0-9]+)*\.(jpg|jpeg|png|webp|avif)$/.test(url);
            if (!localImage) {
                const unchanged = url === edition.thumbnail
                    ? previous?.thumbnail === edition.thumbnail
                    : Array.isArray(previous?.gellery_imgs) && previous.gellery_imgs.includes(url);
                if (/^https?:\/\//.test(url) && unchanged) continue;
                bad(`${at}: URL ảnh phải local trong assets/img/books, tên kebab-case: ${url}`); continue;
            }
            const file = path.join(root, url.slice(1));
            imageFiles.add(file);
            if (images && (!fs.existsSync(file) || !within(path.join(root, 'assets/img/books'), file))) bad(`Không tìm thấy ảnh local an toàn: ${url}`);
        }
    }
    if (errors.length) return { errors, missing, warnings };
    // Match work identity as well as filename; the same title may have different authors.
    const matches = [];
    // Identity was resolved before saving. Post-save checks need only this work.
    const candidates = allowExisting ? [] : fs.readdirSync(path.join(root, 'data/book')).filter((f) => f.endsWith('.json'));
    for (const filename of candidates) {
        const existing = read(path.join(root, 'data/book', filename));
        const sameTitle = [existing.title, existing.title_original, ...(existing.editions || []).map((e) => e.title)]
            .filter(text).some((v) => [book.title, book.title_original].filter(text).some((candidate) => key(v) === key(candidate)));
        const sameAuthor = Array.isArray(book.authors) && (existing.authors || []).some((v) => book.authors.some((a) => key(a) === key(v)));
        if (existing.id === book.id || (sameTitle && sameAuthor)) matches.push(existing.id);
    }
    if (!allowExisting && matches.length) bad(`Đã có sách: ${matches.join(', ')}; không ghi đè khi yêu cầu thêm mới.`);
    else if (matches.some((id) => id !== book.id)) warnings.push(`Có thể trùng tác phẩm: ${matches.join(', ')}`);
    let homePosition = null;
    if (relations) {
        const index = read(path.join(root, 'data/book.json'));
        const entries = index.filter((e) => e.detail === `data/book/${book.id}.json`);
        if (entries.length !== 1) bad('book.json phải có đúng một liên kết tới sách.');
        const summary = publication.getPublicationSummary(book);
        if (entries.length === 1 && (entries[0].last_pub_year !== summary.last_pub_year
            || (entries[0].last_pub_date || '') !== (summary.last_pub_date || ''))) bad('last_pub_date/last_pub_year chưa khớp; chạy npm run sort-book.');
        if (entries.length === 1 && !text(entries[0].search_text)) bad('Index thiếu search_text.');
        const authors = read(path.join(root, 'data/author.json'));
        const linkedAuthors = authors.filter((a) => a.work_ids?.includes(book.id));
        for (const name of Array.isArray(book.authors) ? book.authors : []) {
            // Role annotations are display metadata; permit the canonical author without them.
            const bare = key(authorName(name));
            const linked = linkedAuthors.filter((a) => key(authorName(a.name)) === bare);
            if (linked.length !== 1) bad(`author.json: cần đúng một liên kết cho ${name}; kiểm tra alias/vai trò.`);
        }
        const expectedAuthors = new Set(book.authors.map((n) => key(authorName(n))));
        for (const author of linkedAuthors) if (!expectedAuthors.has(key(authorName(author.name)))) bad(`author.json: liên kết tác giả dư ${author.id}.`);
        const seriesIndex = read(path.join(root, 'data/series.json'));
        const seriesIds = new Set((Array.isArray(book.editions) ? book.editions : []).flatMap((e) => Array.isArray(e?.series_ids) ? e.series_ids : []));
        const linkedSeriesNames = [];
        for (const id of seriesIds) {
            if (!SLUG.test(id)) { bad(`Series ID không hợp lệ: ${id}`); continue; }
            const file = path.join(root, `data/series/${id}.json`);
            if (seriesIndex.filter((s) => s.id === id && s.detail === `data/series/${id}.json`).length !== 1 || !fs.existsSync(file)) { bad(`Series chưa liên kết đúng: ${id}`); continue; }
            const series = read(file);
            if (series.id !== id || !series.work_ids?.includes(book.id)) bad(`Series ${id} chưa có work_ids của sách.`);
            linkedSeriesNames.push(key(series.name));
            if (!book.series?.some?.((name) => key(name) === key(series.name))) bad(`Thiếu tên series ${series.name} trong book.series.`);
        }
        for (const name of Array.isArray(book.series) ? book.series : []) if (!linkedSeriesNames.includes(key(name))) bad(`Series ${name} chưa gán vào edition.series_ids.`);
        const sortedIndex = publication.sortBookEntries(index);
        if (index.some((entry, i) => sortedIndex[i] !== entry)) bad('Index chưa giảm dần theo năm/ngày; chạy npm run sort-book.');
        homePosition = sortedIndex.findIndex((e) => e.detail === `data/book/${book.id}.json`) + 1;
    }
    return { errors, missing, warnings, duplicateCandidates: matches, homePosition, imageFiles: [...imageFiles].map((f) => path.relative(root, f)) };
}
function inventory(folder, { sourceImagesOnly = false } = {}) {
    const files = [];
    function walk(dir) {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const file = path.join(dir, entry.name);
            if (file === path.join(folder, '.gitkeep')) continue;
            if (entry.isSymbolicLink()) throw new Error(`Không xử lý symlink trong nháp: ${file}`);
            if (sourceImagesOnly && path.relative(folder, file) === 'previews') continue;
            if (entry.isDirectory()) walk(file);
            else if (entry.isFile()) {
                if (!sourceImagesOnly || isSourceImage(path.relative(folder, file))) files.push(file);
            }
            else throw new Error(`File không được hỗ trợ: ${file}`);
        }
    }
    walk(folder);
    return Object.fromEntries(files.map((f) => [path.relative(folder, f), hash(f)]));
}
// Read the filesystem directly: the raw input is intentionally ignored by Git/ripgrep.
// Keep earlier snapshots too, so deleting/replacing an unprocessed source cannot hide it.
function scanSources(root, folder = draftPath(root)) {
    folder = draftPath(root, folder);
    const manifestFile = path.join(folder, 'source-inventory.json');
    const previous = fs.existsSync(manifestFile) ? read(manifestFile) : { version: 1, images: [] };
    if (previous.version !== 1 || !Array.isArray(previous.images)) throw new Error('source-inventory.json không hợp lệ.');
    const current = Object.entries(inventory(folder, { sourceImagesOnly: true })).map(([source, sha256]) => ({
        source, sha256, bytes: fs.statSync(path.join(folder, source)).size
    }));
    const registered = new Map(previous.images.map((entry) => [`${entry.source}\0${entry.sha256}`, entry]));
    for (const entry of current) registered.set(`${entry.source}\0${entry.sha256}`, entry);
    const manifest = { version: 1, images: [...registered.values()] };
    if (JSON.stringify(previous) !== JSON.stringify(manifest) || !fs.existsSync(manifestFile)) write(manifestFile, manifest);
    return {
        draft: path.relative(root, folder), image_count: current.length, registered_image_count: manifest.images.length,
        images: manifest.images.map((entry) => ({ ...entry, absolute_path: path.join(folder, entry.source),
            present: current.some((image) => image.source === entry.source && image.sha256 === entry.sha256) }))
    };
}
function reviewSources(root, folder, book, { imported = false } = {}) {
    const sources = scanSources(root, folder);
    const evidence = read(path.join(folder, 'evidence.json'));
    const reviews = Array.isArray(evidence.image_reviews) ? evidence.image_reviews : [];
    const mappings = Array.isArray(evidence.images) ? evidence.images : [];
    const errors = [];
    const assets = new Set();
    for (const image of sources.images) {
        const review = reviews.find((entry) => entry.source === image.source && entry.sha256 === image.sha256);
        const at = `Ảnh đầu vào ${image.source}`;
        if (!review || !Number.isFinite(Date.parse(review.reviewed_at)) || !text(review.observations)
            || !Array.isArray(review.extracted_fields) || !review.extracted_fields.every(text)
            || !text(review.reason) || !['website', 'reference', 'unresolved'].includes(review.decision)) {
            errors.push(`${at}: chưa có bản ghi đã xem/đọc chữ khớp SHA-256 trong evidence.image_reviews.`);
            continue;
        }
        if (review.decision === 'unresolved') {
            errors.push(`${at}: chưa xác định được cách dùng; ${review.reason}`);
            continue;
        }
        if (review.decision === 'website' && (!Array.isArray(review.edition_ids) || !review.edition_ids.length
            || review.edition_ids.some((id) => !book.editions?.some((edition) => edition.id === id)))) {
            errors.push(`${at}: cần edition_ids đúng cho ảnh website.`);
            continue;
        }
        if (!imported || review.decision === 'reference') continue;
        const matching = mappings.filter((entry) => entry.source === image.source && entry.source_sha256 === image.sha256);
        const outputs = new Set(mappings.filter((entry) => entry.source_sha256 === image.sha256).map((entry) => entry.asset).filter(text));
        if (outputs.size > 1) errors.push(`${at}: một ảnh nguồn chỉ được có một file website, không tạo biến thể.`);
        const validMappings = matching.filter((mapping) => {
            const file = typeof mapping.asset === 'string' && path.resolve(root, mapping.asset);
            const imageDir = path.join(root, 'assets/img/books');
            const valid = file && fs.existsSync(file) && within(imageDir, file)
                && mapping.asset_sha256 === hash(file);
            if (valid) assets.add(path.relative(root, file));
            return valid;
        });
        if (!validMappings.length) errors.push(`${at}: chưa có asset đã nhập khớp hash và báo cáo xử lý.`);
        if (review.decision === 'website') {
            for (const id of review.edition_ids) {
                const edition = book.editions.find((entry) => entry.id === id);
                const urls = [edition.thumbnail, ...(edition.gellery_imgs || [])];
                if (!validMappings.some((entry) => entry.asset && urls.includes('/' + entry.asset.replace(/^\//, '')))) {
                    errors.push(`${at}: đã chọn dùng cho website nhưng chưa được gán thumbnail/gallery của ${id}.`);
                }
            }
        }
    }
    return { ...sources, errors, assets: [...assets] };
}
function verifyUi(root, book, result, ui) {
    const localUrl = (value) => { try { const u = new URL(value); return ['127.0.0.1', 'localhost'].includes(u.hostname) && u.protocol === 'http:'; } catch { return false; } };
    if (!Number.isFinite(Date.parse(ui?.checked_at)) || !localUrl(ui?.detail?.url)) return false;
    const detailUrl = new URL(ui.detail.url);
    if (!['/detail', '/detail.html'].includes(detailUrl.pathname)
        || detailUrl.searchParams.get('id') !== book.id
        || ui.detail.metadata_matches !== true || ui.detail.images_load !== true) return false;
    const checked = ui.detail.edition_ids;
    const required = result.requiredEditionIds || (book.editions || []).map((edition) => edition.id);
    return Array.isArray(checked) && checked.length > 0
        && checked.every((id) => book.editions?.some((edition) => edition.id === id))
        && required.every((id) => checked.includes(id));
}
function finish(root, folder) {
    folder = draftPath(root, folder);
    const book = read(path.join(folder, 'book.json'));
    if (!SLUG.test(book.id || '')) throw new Error('Book id không hợp lệ.');
    const savedPath = path.join(root, `data/book/${book.id}.json`);
    const saved = read(savedPath);
    const sourceReview = reviewSources(root, folder, saved, { imported: true });
    if (sourceReview.errors.length) throw new Error(sourceReview.errors.join('\n'));
    // Property order is irrelevant, array/edition order is deliberate.
    const stable = (v) => Array.isArray(v) ? v.map(stable) : v && typeof v === 'object'
        ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, stable(v[k])])) : v;
    if (JSON.stringify(stable(book)) !== JSON.stringify(stable(saved))) throw new Error('book.json nháp chưa khớp file đã lưu; đối chiếu form và đồng bộ lại.');
    const evidence = read(path.join(folder, 'evidence.json'));
    const baseline = updateBaseline(root, evidence.scope?.baseline, book.id);
    const result = validate(root, saved, { relations: true, images: true, allowExisting: true, baseline,
        editionIdMap: evidence.scope?.edition_id_map || {} });
    if (result.errors.length) throw new Error(result.errors.join('\n'));
    if (!Array.isArray(evidence.conflicts) || !Array.isArray(evidence.images)) throw new Error('evidence.json phải có conflicts/images là mảng.');
    if (evidence.conflicts.length) throw new Error('Còn mâu thuẫn chưa giải quyết trong evidence.json.');
    // Evidence explains decisions; it need not duplicate every value in book.json.
    const changed = saved.editions.filter((edition) => {
        const previous = baseline?.editions.find((entry) => entry.id === edition.id);
        return !previous || JSON.stringify(stable(previous)) !== JSON.stringify(stable(edition));
    });
    result.requiredEditionIds = (changed.length ? changed : saved.editions.slice(0, 1)).map((edition) => edition.id);
    const ui = read(path.join(folder, 'verification.json'));
    if (!verifyUi(root, book, result, ui)) {
        throw new Error('Chưa xác minh Chrome tại đúng link detail: metadata/ảnh, edition_ids vừa thêm/sửa và checked_at. Giữ nháp khi chưa xác nhận.');
    }
    return { bookId: book.id, verified: true, ...result };
}
function cleanup(root, folder) {
    folder = draftPath(root, folder);
    // Recheck current sources, saved data, asset hashes and UI before deleting raw.
    const { bookId } = finish(root, folder);
    // Empty the verified raw input; keep its reusable directory and tracked placeholder.
    for (const name of fs.readdirSync(folder)) {
        if (name !== '.gitkeep') fs.rmSync(path.join(folder, name), { recursive: true });
    }
    fs.writeFileSync(path.join(folder, '.gitkeep'), '', { flag: 'a' });
    return { cleaned: path.relative(root, folder), bookId };
}
function main(args) {
    const [command, ...rest] = args;
    const option = (name) => { const i = rest.indexOf(name); return i < 0 ? undefined : rest[i + 1]; };
    if (command === 'init') {
        if (rest.length) throw new Error('Dùng init không kèm tên phiên; đầu vào cố định tại data/_raw/.');
        return init(ROOT);
    }
    if (command === 'vocab') return vocabulary(ROOT);
    if (command === 'sources') {
        fs.mkdirSync(path.join(ROOT, RAW), { recursive: true });
        return scanSources(ROOT, draftPath(ROOT, option('--draft')));
    }
    if (command === 'check') {
        const bookId = option('--book');
        if (bookId && rest.includes('--draft')) throw new Error('Chọn --draft data/_raw hoặc --book book-id.');
        const folder = !bookId && draftPath(ROOT, option('--draft'));
        if (bookId && !SLUG.test(bookId)) throw new Error('Book id không hợp lệ.');
        const book = read(folder ? path.join(folder, 'book.json') : path.join(ROOT, `data/book/${bookId}.json`));
        const baseline = updateBaseline(ROOT, option('--baseline'), book.id);
        const result = validate(ROOT, book, { relations: rest.includes('--relations'), images: rest.includes('--images') || rest.includes('--originals'), allowExisting: Boolean(bookId), baseline });
        const rawBookPath = path.join(ROOT, RAW, 'book.json');
        if (folder || (fs.existsSync(rawBookPath) && read(rawBookPath).id === book.id)) {
            const sourceReview = reviewSources(ROOT, folder || draftPath(ROOT), book, { imported: rest.includes('--images') || rest.includes('--originals') });
            result.source_images = sourceReview;
            result.errors.push(...sourceReview.errors);
        }
        if (result.errors.length) process.exitCode = 1;
        return result;
    }
    if (command === 'finish' || command === 'cleanup') {
        const folder = draftPath(ROOT, option('--draft'));
        return command === 'finish' ? finish(ROOT, folder) : cleanup(ROOT, folder);
    }
    throw new Error('Dùng init | sources | vocab | check [--draft data/_raw] / --book <id> [--images --relations] [--baseline data/_raw/updates/.../baseline-book.json] | finish [--draft data/_raw] | cleanup [--draft data/_raw].');
}
if (require.main === module) {
    try { console.log(JSON.stringify(main(process.argv.slice(2)), null, 2)); }
    catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = { init, emptyBook, vocabulary, validate, finish, cleanup, draftPath, inventory, hash, slug, isSourceImage, scanSources, reviewSources, verifyUi, isCoverPrice };
