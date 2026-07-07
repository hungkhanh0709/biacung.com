const form = document.getElementById('book-form');
const sourceUrlInput = document.getElementById('source-url');
const crawlButton = document.getElementById('crawl-source');
const editionsContainer = document.getElementById('editions-container');
const addEditionButton = document.getElementById('add-edition');
const bookIdInput = document.getElementById('book-id');
const authorSlugSuggestions = document.getElementById('author-slug-suggestions');

setNoHistoryBehavior(form);
setNoHistoryBehavior(sourceUrlInput);

const bookIndexOutput = document.getElementById('book-index-output');
const bookDetailOutput = document.getElementById('book-detail-output');
const bookDetailFilename = document.getElementById('book-detail-filename');
const authorsOutput = document.getElementById('authors-output');
const seriesOutput = document.getElementById('series-output');
const seriesFilename = document.getElementById('series-filename');
const downloadBookDetailButton = document.getElementById('download-book-detail');
const downloadSeriesButton = document.getElementById('download-series');

let editionCounter = 0;
let pendingLookupTimer = null;
let lookupVersion = 0;
let existingBookIndexEntries = [];
let existingAuthorEntries = [];
let existingSeriesEntries = [];
let existingIndexStatePromise = null;
let suppressAutoLookup = false;
let hydratedBookSlug = '';
let blockedAutoLoadSlug = '';
let renderOutputsVersion = 0;
const existingSeriesFileCache = new Map();

function setNoHistoryBehavior(element) {
    if (!element) {
        return;
    }

    if (element.matches && element.matches('input, textarea, select')) {
        element.autocomplete = 'off';
        element.autocapitalize = 'off';
        element.spellcheck = false;
    }

    element.querySelectorAll?.('input, textarea, select').forEach((field) => {
        field.autocomplete = 'off';
        field.autocapitalize = 'off';
        field.spellcheck = false;
    });
}

function normalizeText(value) {
    return (value == null ? '' : String(value)).trim();
}

function getApiBaseUrl() {
    if (typeof window !== 'undefined' && window.BOOK_GENERATOR_API_BASE) {
        return normalizeText(window.BOOK_GENERATOR_API_BASE);
    }

    return 'http://127.0.0.1:3000';
}

function apiUrl(pathname) {
    const baseUrl = getApiBaseUrl();
    return new URL(pathname, baseUrl).toString();
}

async function fetchJson(pathname, options = {}) {
    const response = await fetch(apiUrl(pathname), options);
    let payload = null;

    try {
        payload = await response.json();
    } catch (error) {
        payload = null;
    }

    return { response, payload };
}

function parseLines(value) {
    return normalizeText(value)
        .split(/\r?\n/)
        .map((entry) => entry.trim())
        .filter(Boolean);
}

function parseCommaSeparatedLines(value) {
    return normalizeText(value)
        .split(/\r?\n|,/)
        .map((entry) => entry.trim())
        .filter(Boolean);
}

function toTitleCase(value) {
    const normalized = normalizeText(value);
    if (!normalized) {
        return '';
    }

    return normalized
        .split(/(\s+)/)
        .map((token) => {
            if (/^\s+$/.test(token)) {
                return token;
            }
            return token
                .split(/([-'])/)
                .map((segment) => {
                    if (!segment || /[-']/.test(segment)) {
                        return segment;
                    }
                    return segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase();
                })
                .join('');
        })
        .join('');
}

function normalizeBookTitle(value) {
    return normalizeText(value)
        .replace(/^sách\s*[:\-]?\s+/i, '')
        .trim();
}

function normalizeFormatValue(value) {
    const normalized = normalizeText(value);
    if (!normalized) {
        return '';
    }

    const lowercased = normalized.toLowerCase();
    return lowercased.charAt(0).toUpperCase() + lowercased.slice(1);
}

function normalizeSizeValue(value) {
    const normalized = normalizeText(value);
    if (!normalized) {
        return '';
    }

    return normalized
        .replace(/\s*[x×]\s*/gi, ' x ')
        .replace(/\s+/g, ' ')
        .trim();
}

function normalizeCommaSeparatedValue(value) {
    return parseCommaSeparatedLines(value)
        .map((line) => toTitleCase(line))
        .join(', ');
}

function formatCommaSeparatedNames(value) {
    if (Array.isArray(value)) {
        return value.join(', ');
    }

    return normalizeCommaSeparatedValue(value);
}

function normalizeIssuerValue(value) {
    const trimmed = normalizeText(value);
    if (!trimmed) {
        return '';
    }

    const simplified = trimmed
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
        .replace(/\s+/g, ' ')
        .replace(/[.]+$/g, '')
        .trim();

    if (/(^|\s)cong ty tnhh van hoa va truyen thong cau vong(\s|$)/.test(simplified)) {
        return 'Rainbow';
    }

    if (/(^|\s)(cty|cong ty)\s+sach\s+tao\s+dan(\s|$)/.test(simplified)) {
        return 'Tao Đàn';
    }

    if (
        /(^|\s)(cty|cong ty)(\s+van hoa)?\s+(&|va)\s+truyen thong\s+tri viet(\s|$)/.test(simplified)
        || /(^|\s)(cty|cong ty)\s+van hoa\s+(&|va)\s+truyen thong\s+tri viet(\s|$)/.test(simplified)
    ) {
        return 'Cty Văn Hóa & Truyền Thông Trí Việt.';
    }

    return toTitleCase(trimmed);
}

function normalizeIssuerLines(value) {
    return parseLines(value)
        .map((line) => normalizeIssuerValue(line))
        .filter(Boolean)
        .join('\n');
}

function normalizePublisher(value) {
    const trimmed = normalizeText(value);
    if (!trimmed) {
        return '';
    }

    const lowerTrimmed = trimmed.toLowerCase();
    if (lowerTrimmed === 'nxb') {
        return 'NXB';
    }

    if (lowerTrimmed.startsWith('nxb ')) {
        return `NXB ${toTitleCase(trimmed.slice(4))}`.trim();
    }

    if (lowerTrimmed === 'nhà xuất bản') {
        return 'Nhà Xuất Bản';
    }

    if (lowerTrimmed.startsWith('nhà xuất bản ')) {
        return `Nhà Xuất Bản ${toTitleCase(trimmed.slice('nhà xuất bản '.length))}`.trim();
    }

    return `NXB ${toTitleCase(trimmed)}`;
}

function sanitizeFormValues(root = form) {
    if (!root) {
        return;
    }

    root.querySelectorAll?.('input, textarea').forEach((field) => {
        if (field.type === 'checkbox' || field.type === 'radio' || field.type === 'hidden') {
            return;
        }

        if (field.name?.startsWith('edition-publisher-')) {
            const normalizedPublisher = normalizePublisher(field.value);
            if (normalizedPublisher !== field.value) {
                field.value = normalizedPublisher;
            }
            return;
        }

        if (field.name === 'title') {
            const normalizedTitle = normalizeBookTitle(field.value);
            if (normalizedTitle !== field.value) {
                field.value = normalizedTitle;
            }
            return;
        }

        if (field.name?.startsWith('edition-caption-')) {
            const formattedCaption = toTitleCase(field.value);
            if (formattedCaption !== field.value) {
                field.value = formattedCaption;
            }
            return;
        }

        if (field.name === 'authors') {
            const normalizedNames = normalizeCommaSeparatedValue(field.value);
            if (normalizedNames !== field.value) {
                field.value = normalizedNames;
            }
            return;
        }

        if (field.name?.startsWith('edition-format-')) {
            const formattedFormat = normalizeFormatValue(field.value);
            if (formattedFormat !== field.value) {
                field.value = formattedFormat;
            }
            return;
        }

        if (field.name?.startsWith('edition-size-')) {
            const normalizedSize = normalizeSizeValue(field.value);
            if (normalizedSize !== field.value) {
                field.value = normalizedSize;
            }
            return;
        }

        if (field.name?.startsWith('edition-translators-')) {
            const normalizedNames = normalizeCommaSeparatedValue(field.value);
            if (normalizedNames !== field.value) {
                field.value = normalizedNames;
            }
            return;
        }

        if (field.name?.startsWith('edition-issuers-')) {
            const normalizedLines = normalizeIssuerLines(field.value);
            if (normalizedLines !== field.value) {
                field.value = normalizedLines;
            }
            return;
        }

        if (field.name?.startsWith('edition-illustrators-') || field.name?.startsWith('edition-proofreaders-')) {
            const normalizedNames = normalizeCommaSeparatedValue(field.value);
            if (normalizedNames !== field.value) {
                field.value = normalizedNames;
            }
            return;
        }

        const trimmedValue = normalizeText(field.value);
        if (trimmedValue !== field.value) {
            field.value = trimmedValue;
        }
    });
}

function slugify(value) {
    return String(value || '')
        .toLowerCase()
        // map Vietnamese đ -> d
        .replace(/đ/g, 'd')
        // decompose combined characters, then remove diacritic marks
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
        // allow only a-z, 0-9, space and hyphen (ASCII-safe)
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function getBookDetailFilePath(bookId) {
    const slug = slugify(bookId) || 'book';
    return `data/book/${slug}.json`;
}

function getSeriesDetailFilePath(seriesId) {
    const slug = slugify(seriesId) || 'series';
    return `data/series/${slug}.json`;
}

function getDownloadFileNameFromSlug(slug, suffix = '') {
    const base = slugify(slug) || 'book';
    const normalizedSuffix = normalizeText(suffix);
    return normalizedSuffix ? `${base}.${normalizedSuffix}.json` : `${base}.json`;
}

function downloadJson(filename, payload) {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function setFormStatus(message, success = true) {
    void message;
    void success;
}

function setEditionCrawlStatus(card, message, success = true) {
    if (!card) {
        return;
    }

    const status = card.querySelector('.edition-crawl-status');
    if (!status) {
        return;
    }

    status.textContent = message;
    status.className = 'inline-status edition-crawl-status';
    if (!success) {
        status.classList.add('error');
    }
}

function getBookSlugFromFormData(formData) {
    const explicitSlug = normalizeText(formData.get('bookId'));
    if (explicitSlug) {
        return slugify(explicitSlug);
    }

    const title = normalizeBookTitle(formData.get('title') || '');
    const titleOriginal = (formData.get('titleOriginal') || '').trim();
    const authors = parseCommaSeparatedLines(formData.get('authors') || '');
    const authorName = authors[0] || '';
    const preferredTitle = slugify(titleOriginal) ? titleOriginal : title;
    const baseText = `${authorName} ${preferredTitle}`.trim();
    return slugify(baseText);
}

function updateSlugPreview() {
    const formData = new FormData(form);
    const slug = getBookSlugFromFormData(formData);
    if (bookIdInput) {
        const detailPath = slug ? getBookDetailFilePath(slug) : 'data/book/{slug}.json';
        bookIdInput.placeholder = detailPath;
        bookIdInput.title = detailPath;
    }
}

function getPrimaryAuthorName(formData) {
    return parseCommaSeparatedLines(formData.get('authors') || '')[0] || '';
}

function getAuthorSlugFromFormData(formData) {
    return slugify(getPrimaryAuthorName(formData));
}

function findAuthorEntryBySlug(authorSlug) {
    if (!authorSlug) {
        return null;
    }

    return Array.isArray(existingAuthorEntries)
        ? existingAuthorEntries.find((entry) => slugify(entry.id || entry.name || '') === authorSlug)
        : null;
}

function getAuthorWorkIds(formData) {
    const authorSlug = getAuthorSlugFromFormData(formData);
    const authorEntry = findAuthorEntryBySlug(authorSlug);
    if (!authorEntry || !Array.isArray(authorEntry.work_ids)) {
        return [];
    }

    return [...new Set(authorEntry.work_ids.map((workId) => normalizeText(workId)).filter(Boolean))];
}

function clearAuthorSlugSuggestions() {
    if (!authorSlugSuggestions) {
        return;
    }

    authorSlugSuggestions.innerHTML = '';
    authorSlugSuggestions.classList.add('hidden');
}

function renderAuthorSlugSuggestions(formData) {
    if (!authorSlugSuggestions) {
        return;
    }

    const authorName = getPrimaryAuthorName(formData);
    const authorSlug = getAuthorSlugFromFormData(formData);
    const workIds = getAuthorWorkIds(formData);

    if (!authorName || !authorSlug || !workIds.length) {
        clearAuthorSlugSuggestions();
        return;
    }

    const currentBookId = normalizeText(formData.get('bookId'));

    authorSlugSuggestions.innerHTML = '';
    authorSlugSuggestions.classList.remove('hidden');

    const title = document.createElement('div');
    title.className = 'author-slug-suggestions-title';
    title.textContent = `Gợi ý slug cho ${authorName} (${authorSlug})`;
    authorSlugSuggestions.appendChild(title);

    const list = document.createElement('div');
    list.className = 'author-slug-suggestion-list';

    workIds.forEach((workId) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'secondary button-small';
        if (workId === currentBookId) {
            button.classList.add('is-selected');
        }
        button.dataset.authorSlugAction = 'use-existing';
        button.dataset.bookSlug = workId;
        button.textContent = workId;
        list.appendChild(button);
    });

    authorSlugSuggestions.appendChild(list);
}

function useAuthorSuggestionSlug(slug) {
    const normalizedSlug = slugify(slug);
    if (!normalizedSlug || !bookIdInput) {
        return;
    }

    blockedAutoLoadSlug = '';
    bookIdInput.value = normalizedSlug;
    hydratedBookSlug = '';
    setFormStatus(`Đã chọn slug có sẵn: ${normalizedSlug}. Dữ liệu sẽ được load từ file tương ứng.`, true);
    renderOutputs();
    scheduleLookup(true);
}

function createEditionCard(index = editionCounter, editionData = {}, options = {}) {
    const card = document.createElement('div');
    card.className = 'edition-card';
    if (options.isNewEdition) {
        card.classList.add('is-new-edition');
    }
    card.dataset.editionIndex = String(index);
    card.innerHTML = `
        <div class="grid">
            <label class="field-full-row">
                Link Fahasa
                <input class="field-inline" name="edition-source-url-${index}" placeholder="https://www.fahasa.com/..." />
                <div class="inline-actions">
                    <button type="button" class="secondary crawl-edition-source">Trích xuất từ URL</button>
                </div>
            </label>
            <div class="inline-status edition-crawl-status">Sẵn sàng.</div>
            <label class="field-full-row">
                Auto input (dán nội dung tự do ở đây):
                <textarea class="field-inline" name="edition-raw-${index}" rows="4" placeholder="Dán thông tin nhà sách / mô tả sản phẩm..."></textarea>
                <div class="inline-actions">
                    <button type="button" class="secondary auto-fill" data-for-index="${index}">Tự động nhập</button>
                </div>
            </label>
            <div class="field-row-2 field-full-row">
                <label>
                    Caption
                    <input class="field-inline" name="edition-caption-${index}" placeholder="Bản dịch tiếng Việt" />
                </label>
                <label>
                    ISBN
                    <input name="edition-isbn-${index}" placeholder="978-..." />
                </label>
            </div>
            <div class="field-row-3 field-full-row">
                <label>
                    Năm xuất bản
                    <input name="edition-pub-year-${index}" placeholder="2026" />
                </label>
                <label>
                    NXB
                    <input name="edition-publisher-${index}" placeholder="NXB Văn Học" />
                </label>
                <label>
                    Cty phát hành
                    <input name="edition-issuers-${index}" placeholder="Đông A" />
                </label>
            </div>

            <div class="field-row-3 field-full-row">
                <label>
                    Dịch giả
                    <input name="edition-translators-${index}" placeholder="Ngọc Thứ Lan" />
                </label>
                <label>
                    Minh họa
                    <input name="edition-illustrators-${index}" placeholder="Illustrator Name" />
                </label>
                <label>
                    Hiệu đính
                    <input name="edition-proofreaders-${index}" placeholder="Proofreader Name" />
                </label>
            </div>

            <div class="field-row-3 field-full-row">
                <label>
                    Định dạng
                    <input name="edition-format-${index}" placeholder="hardcover / paperback" />
                </label>
                <label>
                    Giá bìa
                    <input name="edition-cover-price-${index}" placeholder="120k" />
                </label>
                <label>
                    Số trang
                    <input name="edition-page-count-${index}" placeholder="320" />
                </label>
            </div>

            <div class="field-row-4 field-full-row">
                <label>
                    Số lượng in
                    <input name="edition-print-run-${index}" placeholder="2000" />
                </label>
                <label>
                    Đánh số
                    <input name="edition-copy-numbering-${index}" placeholder="NDD1-NDD500" />
                </label>
                <label>
                    Kích thước
                    <input name="edition-size-${index}" placeholder="14 x 20.5 x 2.5" />
                </label>
                <label>
                    Trọng lượng
                    <input name="edition-weight-${index}" placeholder="450" />
                </label>
            </div>

            <label class="field-full-row">
                Thumbnail
                <input class="field-inline" name="edition-thumbnail-${index}" placeholder="thumbnail.jpg" />
            </label>
            <label class="field-full-row">
                Gallery images
                <textarea class="field-inline" name="edition-gallery-${index}" rows="3" placeholder="img1.jpg"></textarea>
            </label>
            <label class="field-full-row">
                Chi tiết phiên bản
                <textarea class="field-tall field-inline" name="edition-detail-${index}" rows="4" placeholder="Bản giới hạn, signed copy..."></textarea>
            </label>
        </div>
        <div class="inline-actions">
            <button type="button" class="danger remove-edition">Xóa phiên bản</button>
        </div>
    `;

    setNoHistoryBehavior(card);

    // Helper to set field values inside this card
    const setFieldValue = (fieldName, value) => {
        const target = card.querySelector(`[name="${fieldName}"]`);
        if (!target) {
            return;
        }

        if (Array.isArray(value)) {
            target.value = value.join('\n');
            return;
        }

        if (value == null) {
            target.value = '';
            return;
        }

        target.value = String(value);
    };

    const removeButton = card.querySelector('.remove-edition');
    removeButton.addEventListener('click', () => {
        card.remove();
        if (!editionsContainer.querySelector('.edition-card')) {
            addEdition();
        }
        renderOutputs();
    });

    if (editionData && typeof editionData === 'object') {
        setFieldValue(`edition-caption-${index}`, editionData.caption || '');
        setFieldValue(`edition-isbn-${index}`, editionData.isbn || '');
        setFieldValue(`edition-pub-year-${index}`, editionData.pub_year ?? '');
        setFieldValue(`edition-publisher-${index}`, editionData.publisher || '');
        setFieldValue(`edition-issuers-${index}`, Array.isArray(editionData.issuers)
            ? editionData.issuers.map((issuer) => normalizeIssuerValue(issuer)).filter(Boolean)
            : normalizeIssuerLines(editionData.issuers || ''));
        setFieldValue(`edition-translators-${index}`, Array.isArray(editionData.translators) ? editionData.translators.join(', ') : (editionData.translators || ''));
        setFieldValue(`edition-illustrators-${index}`, formatCommaSeparatedNames(editionData.illustrators || []));
        setFieldValue(`edition-proofreaders-${index}`, formatCommaSeparatedNames(editionData.proofreaders || []));
        setFieldValue(`edition-format-${index}`, normalizeFormatValue(editionData.format || ''));
        setFieldValue(`edition-cover-price-${index}`, editionData.cover_price || '');
        setFieldValue(`edition-print-run-${index}`, editionData.print_run ?? '');
        setFieldValue(`edition-page-count-${index}`, editionData.page_count ?? '');
        setFieldValue(`edition-copy-numbering-${index}`, editionData.copy_numbering || '');
        setFieldValue(`edition-size-${index}`, normalizeSizeValue(editionData.size_cm || ''));
        setFieldValue(`edition-weight-${index}`, editionData.weight_g ?? '');
        setFieldValue(`edition-thumbnail-${index}`, editionData.thumbnail || '');
        setFieldValue(`edition-gallery-${index}`, editionData.gellery_imgs || []);
        setFieldValue(`edition-detail-${index}`, editionData.detail || '');
    }

    // Auto-fill button behavior: use parseEditionText (from edition-parser.js) if available
    const autoBtn = card.querySelector('.auto-fill');
    if (autoBtn) {
        autoBtn.addEventListener('click', () => {
            const rawField = card.querySelector(`[name="edition-raw-${index}"]`);
            const rawText = rawField ? rawField.value : '';
            if (typeof window.parseEditionText === 'function') {
                try {
                    const parsed = window.parseEditionText(rawText || '');

                    const titleField = form?.querySelector('[name="title"]');
                    if (titleField && parsed.title) {
                        titleField.value = parsed.title;
                    }

                    const authorsField = form?.querySelector('[name="authors"]');
                    if (authorsField) {
                        authorsField.value = Array.isArray(parsed.authors) && parsed.authors.length
                            ? parsed.authors.join(', ')
                            : '';
                    }

                    const normalizeParsedIssuers = (parsedObj, raw) => {
                        let issuers = Array.isArray(parsedObj.issuers) ? parsedObj.issuers.slice() : [];
                        issuers = issuers.filter((issuer) => issuer && !/(liên kết|ấn hành|phối hợp|bởi|phát hành)/i.test(issuer));
                        if (!issuers.length) {
                            if (/đông a|dong a/i.test(raw)) return ['Đông A'];
                            const m = raw.match(/Công ty[^\n]*?([A-ZĐ][^\s]*\s+[A-ZĐ][^\s]*)\s+(?:NXB|Nhà xuất bản|liên kết|ấn hành|phát hành|$)/i);
                            if (m) return [m[1]];
                        }
                        return issuers.map((issuer) => normalizeIssuerValue(issuer)).filter(Boolean);
                    };

                    const normalizedIssuers = normalizeParsedIssuers(parsed, rawText || '');
                    const normalizedPublisher = normalizeText(parsed.publisher || '').replace(/^NXB\s*/i, '');

                    setFieldValue(`edition-isbn-${index}`, parsed.isbn || parsed.sku || '');
                    setFieldValue(`edition-pub-year-${index}`, parsed.pub_year ?? '');
                    setFieldValue(`edition-publisher-${index}`, normalizedPublisher || '');
                    setFieldValue(`edition-issuers-${index}`, normalizedIssuers || []);
                    setFieldValue(`edition-translators-${index}`, formatCommaSeparatedNames(parsed.translators || []));
                    setFieldValue(`edition-illustrators-${index}`, formatCommaSeparatedNames(parsed.illustrators || []));
                    setFieldValue(`edition-proofreaders-${index}`, formatCommaSeparatedNames(parsed.proofreaders || []));
                    setFieldValue(`edition-format-${index}`, normalizeFormatValue(parsed.format || ''));
                    setFieldValue(`edition-cover-price-${index}`, parsed.cover_price || '');
                    setFieldValue(`edition-page-count-${index}`, parsed.page_count ?? '');
                    setFieldValue(`edition-weight-${index}`, parsed.weight_g ?? '');
                    setFieldValue(`edition-size-${index}`, normalizeSizeValue(parsed.size_cm || ''));
                    setFieldValue(`edition-thumbnail-${index}`, parsed.thumbnail || '');
                    setFieldValue(`edition-detail-${index}`, parsed.detail || '');

                    renderOutputs();
                } catch (err) {
                    console.error('Auto-fill parser error', err);
                    setFormStatus('Lỗi khi phân tích nội dung tự động.', false);
                }
            } else {
                setFormStatus('Chức năng phân tích chưa sẵn sàng.', false);
            }
        });
    }

    return card;
}

function setEditionCardFieldValue(card, fieldName, value) {
    const target = card?.querySelector?.(`[name="${fieldName}"]`);
    if (!target) {
        return;
    }

    if (Array.isArray(value)) {
        target.value = value.join('\n');
        return;
    }

    if (value == null) {
        target.value = '';
        return;
    }

    target.value = String(value);
}

function hydrateEditionCard(card, index, editionData = {}) {
    if (!card) {
        return;
    }

    setEditionCardFieldValue(card, `edition-caption-${index}`, editionData.caption || '');
    setEditionCardFieldValue(card, `edition-isbn-${index}`, editionData.isbn || '');
    setEditionCardFieldValue(card, `edition-pub-year-${index}`, editionData.pub_year ?? '');
    setEditionCardFieldValue(card, `edition-publisher-${index}`, editionData.publisher || '');
    setEditionCardFieldValue(card, `edition-issuers-${index}`, Array.isArray(editionData.issuers)
        ? editionData.issuers.map((issuer) => normalizeIssuerValue(issuer)).filter(Boolean)
        : normalizeIssuerLines(editionData.issuers || ''));
    setEditionCardFieldValue(card, `edition-translators-${index}`, Array.isArray(editionData.translators) ? editionData.translators.join(', ') : (editionData.translators || ''));
    setEditionCardFieldValue(card, `edition-illustrators-${index}`, formatCommaSeparatedNames(editionData.illustrators || []));
    setEditionCardFieldValue(card, `edition-proofreaders-${index}`, formatCommaSeparatedNames(editionData.proofreaders || []));
    setEditionCardFieldValue(card, `edition-format-${index}`, normalizeFormatValue(editionData.format || ''));
    setEditionCardFieldValue(card, `edition-cover-price-${index}`, editionData.cover_price || '');
    setEditionCardFieldValue(card, `edition-print-run-${index}`, editionData.print_run ?? '');
    setEditionCardFieldValue(card, `edition-page-count-${index}`, editionData.page_count ?? '');
    setEditionCardFieldValue(card, `edition-copy-numbering-${index}`, editionData.copy_numbering || '');
    setEditionCardFieldValue(card, `edition-size-${index}`, normalizeSizeValue(editionData.size_cm || ''));
    setEditionCardFieldValue(card, `edition-weight-${index}`, editionData.weight_g ?? '');
    setEditionCardFieldValue(card, `edition-thumbnail-${index}`, editionData.thumbnail || '');
    setEditionCardFieldValue(card, `edition-gallery-${index}`, editionData.gellery_imgs || []);
    setEditionCardFieldValue(card, `edition-detail-${index}`, editionData.detail || '');
}

function isEditionCardEmpty(card) {
    if (!card) {
        return true;
    }

    const fields = Array.from(card.querySelectorAll('input, textarea, select'));
    return fields.every((field) => !normalizeText(field.value));
}

function isMeaningfulValue(value) {
    if (Array.isArray(value)) {
        return value.some((entry) => isMeaningfulValue(entry));
    }

    return normalizeText(value) !== '';
}

function isMeaningfulEdition(edition) {
    if (!edition || typeof edition !== 'object') {
        return false;
    }

    return [
        edition.caption,
        edition.isbn,
        edition.pub_year,
        edition.publisher,
        edition.issuers,
        edition.translators,
        edition.illustrators,
        edition.proofreaders,
        edition.format,
        edition.cover_price,
        edition.print_run,
        edition.page_count,
        edition.copy_numbering,
        edition.size_cm,
        edition.weight_g,
        edition.thumbnail,
        edition.gellery_imgs,
        edition.detail
    ].some((value) => isMeaningfulValue(value));
}

function mergeBookDetails(primaryDetail = {}, secondaryDetail = {}) {
    const primary = primaryDetail && typeof primaryDetail === 'object' ? primaryDetail : {};
    const secondary = secondaryDetail && typeof secondaryDetail === 'object' ? secondaryDetail : {};

    const primaryEditions = Array.isArray(primary.editions) ? primary.editions.filter(isMeaningfulEdition) : [];
    const secondaryEditions = Array.isArray(secondary.editions) ? secondary.editions.filter(isMeaningfulEdition) : [];
    const mergedEditions = [];
    const seenEditionIds = new Set();

    primaryEditions.forEach((edition) => {
        const normalizedEdition = { ...edition };
        const editionId = normalizeText(normalizedEdition.id);
        if (editionId) {
            seenEditionIds.add(editionId);
        }
        mergedEditions.push(normalizedEdition);
    });

    secondaryEditions.forEach((edition) => {
        const normalizedEdition = { ...edition };
        const editionId = normalizeText(normalizedEdition.id);
        const existingIndex = editionId
            ? mergedEditions.findIndex((entry) => normalizeText(entry.id) === editionId)
            : -1;

        if (existingIndex !== -1) {
            mergedEditions[existingIndex] = {
                ...normalizedEdition,
                ...mergedEditions[existingIndex]
            };
            return;
        }

        if (editionId && seenEditionIds.has(editionId)) {
            return;
        }

        mergedEditions.push(normalizedEdition);
        if (editionId) {
            seenEditionIds.add(editionId);
        }
    });

    const pick = (...values) => values.find((value) => isMeaningfulValue(value)) ?? '';

    return {
        id: pick(primary.id, secondary.id),
        title: pick(primary.title, secondary.title),
        title_original: pick(primary.title_original, secondary.title_original),
        authors: Array.isArray(primary.authors) && primary.authors.length
            ? primary.authors
            : (Array.isArray(secondary.authors) ? secondary.authors : []),
        awards: Array.isArray(primary.awards) && primary.awards.length
            ? primary.awards
            : (Array.isArray(secondary.awards) ? secondary.awards : []),
        series: Array.isArray(primary.series) && primary.series.length
            ? primary.series
            : (Array.isArray(secondary.series) ? secondary.series : []),
        editions: sortEditionsByPubYear(mergedEditions),
        updated_at: pick(primary.updated_at, secondary.updated_at, new Date().toISOString().slice(0, 10))
    };
}

function addEdition() {
    const card = createEditionCard(editionCounter, {}, { isNewEdition: true });
    // Insert new edition cards at the top so newest editions appear first
    editionsContainer.insertBefore(card, editionsContainer.firstChild);
    editionCounter += 1;
}

function buildEditionId(bookId, edition) {
    const year = edition.pub_year ? String(edition.pub_year) : '';
    const issuers = Array.isArray(edition.issuers) ? edition.issuers.join(' ') : (edition.issuers || '');
    const price = edition.cover_price || edition.price || '';
    const parts = [bookId, year, issuers, edition.format, price]
        .filter(Boolean)
        .join(' ');
    return slugify(parts);
}

function buildEditionFromFormData(formData, index, bookId) {
    const isbn = normalizeText(formData.get(`edition-isbn-${index}`));
    const caption = toTitleCase(formData.get(`edition-caption-${index}`));
    const pubYear = normalizeText(formData.get(`edition-pub-year-${index}`));
    const publisher = normalizePublisher(formData.get(`edition-publisher-${index}`));
    const issuers = parseLines(formData.get(`edition-issuers-${index}`) || '').map(normalizeIssuerValue);
    const translators = parseCommaSeparatedLines(formData.get(`edition-translators-${index}`) || '').map(toTitleCase);
    const illustrators = parseCommaSeparatedLines(formData.get(`edition-illustrators-${index}`) || '').map(toTitleCase);
    const proofreaders = parseCommaSeparatedLines(formData.get(`edition-proofreaders-${index}`) || '').map(toTitleCase);
    const format = normalizeFormatValue(formData.get(`edition-format-${index}`));
    const coverPrice = normalizeText(formData.get(`edition-cover-price-${index}`));
    const printRun = normalizeText(formData.get(`edition-print-run-${index}`));
    const pageCount = normalizeText(formData.get(`edition-page-count-${index}`));
    const copyNumbering = normalizeText(formData.get(`edition-copy-numbering-${index}`));
    const size = normalizeSizeValue(formData.get(`edition-size-${index}`));
    const weight = normalizeText(formData.get(`edition-weight-${index}`));
    const thumbnail = normalizeText(formData.get(`edition-thumbnail-${index}`));
    const gallery = parseLines(formData.get(`edition-gallery-${index}`) || '');
    const detail = normalizeText(formData.get(`edition-detail-${index}`));
    const editionObject = {
        isbn: isbn || null,
        caption: caption || '',
        pub_year: pubYear ? Number(pubYear) : null,
        publisher: publisher || '',
        issuers,
        translators,
        illustrators,
        proofreaders,
        format: format || '',
        cover_price: coverPrice || '',
        print_run: printRun ? Number(printRun) : null,
        page_count: pageCount ? Number(pageCount) : null,
        copy_numbering: copyNumbering || null,
        size_cm: size || '',
        weight_g: weight ? Number(weight) : null,
        thumbnail: thumbnail || '',
        gellery_imgs: gallery,
        detail: detail || ''
    };

    return {
        id: buildEditionId(bookId, editionObject),
        ...editionObject
    };
}

function sortEditionsByPubYear(editions = []) {
    return [...(Array.isArray(editions) ? editions : [])].sort((left, right) => {
        const leftYear = Number(left?.pub_year);
        const rightYear = Number(right?.pub_year);
        const leftValid = Number.isFinite(leftYear);
        const rightValid = Number.isFinite(rightYear);

        if (leftValid && rightValid) {
            return rightYear - leftYear;
        }

        if (leftValid) {
            return -1;
        }

        if (rightValid) {
            return 1;
        }

        return String(left?.caption || '').localeCompare(String(right?.caption || ''), 'vi');
    });
}

function buildBookDetailPayload(formData) {
    const bookId = getBookSlugFromFormData(formData);
    const editions = [];
    const captionInputs = Array.from(form.elements).filter((el) => el.name && el.name.startsWith('edition-caption-'));

    captionInputs.forEach((field) => {
        const index = field.name.replace('edition-caption-', '');
        const edition = buildEditionFromFormData(formData, index, bookId);
        if (edition.caption || edition.publisher || edition.format || edition.isbn || edition.thumbnail || edition.detail || edition.issuers.length || edition.translators.length || edition.illustrators.length || edition.proofreaders.length || edition.gellery_imgs.length) {
            editions.push(edition);
        }
    });

    return {
        id: bookId,
        title: normalizeBookTitle(formData.get('title') || ''),
        title_original: formData.get('titleOriginal') || '',
        authors: parseCommaSeparatedLines(formData.get('authors') || '').map(toTitleCase),
        awards: parseLines(formData.get('awards') || ''),
        series: parseLines(formData.get('series') || ''),
        editions: sortEditionsByPubYear(editions),
        updated_at: new Date().toISOString().slice(0, 10)
    };
}

function updateEditionIdPreviews(formData) {
    const bookId = getBookSlugFromFormData(formData);
    const captionInputs = Array.from(form.elements).filter((el) => el.name && el.name.startsWith('edition-caption-'));

    captionInputs.forEach((field) => {
        const index = field.name.replace('edition-caption-', '');
        const preview = editionsContainer.querySelector(`[data-edition-id-for="${index}"]`);
        if (!preview) {
            return;
        }

        const edition = buildEditionFromFormData(formData, index, bookId);
        preview.textContent = edition.id || 'ID sẽ được tạo tự động';
    });
}

function normalizeSearchTextValue(value) {
    return normalizeText(value)
        .toLowerCase()
        .replace(/đ/g, 'd')
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function collectSearchTextTerms(formData) {
    const terms = [];
    const seen = new Set();

    const addValues = (value) => {
        if (value == null) {
            return;
        }

        const values = Array.isArray(value) ? value : [value];
        values.forEach((entry) => {
            const normalized = normalizeSearchTextValue(entry);
            if (normalized && !seen.has(normalized)) {
                seen.add(normalized);
                terms.push(normalized);
            }
        });
    };

    addValues(formData.get('title') || '');
    addValues(formData.get('titleOriginal') || '');
    parseCommaSeparatedLines(formData.get('authors') || '').forEach((entry) => addValues(entry));
    parseLines(formData.get('awards') || '').forEach((entry) => addValues(entry));
    parseLines(formData.get('series') || '').forEach((entry) => addValues(entry));

    Array.from(form?.elements || []).forEach((field) => {
        const fieldName = field?.name || '';
        if (!fieldName) {
            return;
        }

        if (fieldName.startsWith('edition-publisher-')) {
            addValues(normalizePublisher(field.value));
            return;
        }

        if (fieldName.startsWith('edition-issuers-') || fieldName.startsWith('edition-translators-') || fieldName.startsWith('edition-illustrators-') || fieldName.startsWith('edition-proofreaders-')) {
            addValues(field.value);
        }
    });

    return terms;
}

function buildBookIndexPayload(formData, existingBookIndex = existingBookIndexEntries) {
    const bookId = getBookSlugFromFormData(formData);
    const detailPath = getBookDetailFilePath(bookId);
    const searchText = collectSearchTextTerms(formData).join(' ');
    const updatedAt = new Date().toISOString().slice(0, 10);
    const mergedBookIndex = Array.isArray(existingBookIndex) ? existingBookIndex.filter((entry) => entry && entry.detail !== detailPath) : [];

    mergedBookIndex.push({
        detail: detailPath,
        search_text: searchText,
        updated_at: updatedAt
    });

    return mergedBookIndex.sort((left, right) => (right.updated_at || '').localeCompare(left.updated_at || '', 'en'));
}

function buildBookIndexReviewPayload(formData) {
    const bookId = getBookSlugFromFormData(formData);
    const detailPath = getBookDetailFilePath(bookId);
    const searchText = collectSearchTextTerms(formData).join(' ');
    const updatedAt = new Date().toISOString().slice(0, 10);

    return {
        detail: detailPath,
        search_text: searchText,
        updated_at: updatedAt
    };
}

function buildAuthorPayload(formData, existingAuthors = existingAuthorEntries) {
    const authors = parseCommaSeparatedLines(formData.get('authors') || '');
    const bookId = getBookSlugFromFormData(formData);
    const mergedAuthors = Array.isArray(existingAuthors) ? existingAuthors.map((entry) => ({ ...entry })) : [];

    authors.forEach((name) => {
        const authorId = slugify(name);
        const existingAuthor = mergedAuthors.find((entry) => slugify(entry.name || '') === authorId || entry.id === authorId);
        if (existingAuthor) {
            existingAuthor.work_ids = existingAuthor.work_ids || [];
            if (!existingAuthor.work_ids.includes(bookId)) {
                existingAuthor.work_ids.push(bookId);
            }
            existingAuthor.name = existingAuthor.name || name;
            return;
        }

        mergedAuthors.push({
            id: authorId,
            name,
            work_ids: [bookId]
        });
    });

    return mergedAuthors.sort((left, right) => (left.name || '').localeCompare(right.name || '', 'vi'));
}

function buildAuthorReviewPayload(formData, existingAuthors = existingAuthorEntries) {
    const authors = parseCommaSeparatedLines(formData.get('authors') || '');
    const bookId = getBookSlugFromFormData(formData);

    if (!authors.length) {
        return {
            id: '',
            name: '',
            work_ids: bookId ? [bookId] : []
        };
    }

    const reviewAuthors = authors.map((name) => {
        const authorId = slugify(name);
        const existingAuthor = Array.isArray(existingAuthors)
            ? existingAuthors.find((entry) => slugify(entry.name || '') === authorId || entry.id === authorId)
            : null;
        const payload = existingAuthor ? { ...existingAuthor } : { id: authorId, name, work_ids: [] };

        payload.id = payload.id || authorId;
        payload.name = name;
        payload.work_ids = Array.isArray(payload.work_ids) ? payload.work_ids.filter(Boolean) : [];
        if (bookId && !payload.work_ids.includes(bookId)) {
            payload.work_ids.push(bookId);
        }

        return payload;
    });

    return reviewAuthors.length === 1 ? reviewAuthors[0] : reviewAuthors;
}

function buildSeriesPayload(formData, existingSeries = existingSeriesEntries) {
    const seriesNames = parseLines(formData.get('series') || '');
    const bookId = getBookSlugFromFormData(formData);
    const mergedSeries = Array.isArray(existingSeries) ? existingSeries.map((entry) => ({ ...entry })) : [];

    seriesNames.forEach((name) => {
        const seriesId = slugify(name);
        const existingSeriesEntry = mergedSeries.find((entry) => slugify(entry.name || '') === seriesId || entry.id === seriesId);
        if (existingSeriesEntry) {
            existingSeriesEntry.work_ids = existingSeriesEntry.work_ids || [];
            if (!existingSeriesEntry.work_ids.includes(bookId)) {
                existingSeriesEntry.work_ids.push(bookId);
            }
            existingSeriesEntry.name = existingSeriesEntry.name || name;
            return;
        }

        mergedSeries.push({
            id: seriesId,
            name,
            description: 'Collection introducing...',
            thumbnail: '',
            work_ids: [bookId]
        });
    });

    return mergedSeries.sort((left, right) => (left.name || '').localeCompare(right.name || '', 'vi'));
}

async function loadExistingSeriesBySlug(slug) {
    const normalizedSlug = slugify(slug);
    if (!normalizedSlug) {
        return null;
    }

    if (existingSeriesFileCache.has(normalizedSlug)) {
        return existingSeriesFileCache.get(normalizedSlug);
    }

    const candidates = [
        `./data/series/${encodeURIComponent(normalizedSlug)}.json`,
        `./data/series/${normalizedSlug}.json`
    ];

    for (const url of candidates) {
        try {
            const response = await fetch(url, { cache: 'no-store' });
            if (!response.ok) {
                continue;
            }

            const payload = await response.json();
            const entries = Array.isArray(payload) ? payload : [payload];
            const match = entries.find((entry) => {
                if (!entry || typeof entry !== 'object') {
                    return false;
                }

                const entrySlug = slugify(entry.id || entry.name || '');
                return entrySlug === normalizedSlug;
            }) || entries.find((entry) => entry && typeof entry === 'object');

            if (match && typeof match === 'object') {
                existingSeriesFileCache.set(normalizedSlug, match);
                return match;
            }
        } catch (error) {
            // continue to next candidate
        }
    }

    existingSeriesFileCache.set(normalizedSlug, null);
    return null;
}

async function buildSeriesReviewEntries(formData, existingSeries = existingSeriesEntries) {
    const seriesNames = parseLines(formData.get('series') || '');
    const bookId = getBookSlugFromFormData(formData);

    if (!seriesNames.length) {
        return [];
    }

    const reviewSeries = [];

    for (const name of seriesNames) {
        const seriesId = slugify(name);
        const existingSeriesEntry = Array.isArray(existingSeries)
            ? existingSeries.find((entry) => slugify(entry.name || '') === seriesId || entry.id === seriesId)
            : null;
        const loadedSeriesEntry = existingSeriesEntry || await loadExistingSeriesBySlug(seriesId);
        const payload = loadedSeriesEntry ? { ...loadedSeriesEntry } : {
            id: seriesId,
            name,
            description: '',
            thumbnail: '',
            work_ids: []
        };

        payload.id = payload.id || seriesId;
        payload.name = payload.name || name;
        payload.description = normalizeText(payload.description);
        payload.thumbnail = normalizeText(payload.thumbnail);
        payload.work_ids = Array.isArray(payload.work_ids) ? payload.work_ids.filter(Boolean) : [];
        if (bookId && !payload.work_ids.includes(bookId)) {
            payload.work_ids.push(bookId);
        }

        const resolvedSlug = slugify(payload.id || payload.name || seriesId);
        reviewSeries.push({
            id: resolvedSlug,
            file_path: getSeriesDetailFilePath(resolvedSlug),
            payload
        });
    }

    return reviewSeries;
}

async function buildSeriesReviewPayload(formData, existingSeries = existingSeriesEntries) {
    const entries = await buildSeriesReviewEntries(formData, existingSeries);

    if (!entries.length) {
        const bookId = getBookSlugFromFormData(formData);
        return {
            id: '',
            name: '',
            description: '',
            thumbnail: '',
            work_ids: bookId ? [bookId] : []
        };
    }

    const payloads = entries.map((entry) => entry.payload);
    return payloads.length === 1 ? payloads[0] : payloads;
}

async function refreshExistingIndexState(force = false) {
    if (!force && existingIndexStatePromise) {
        return existingIndexStatePromise;
    }

    existingIndexStatePromise = (async () => {
        try {
            const { response, payload } = await fetchJson('/api/index-state', { cache: 'no-store' });
            if (!response.ok) {
                throw new Error('Unable to load index state');
            }

            existingBookIndexEntries = Array.isArray(payload?.bookIndex) ? payload.bookIndex : [];
            existingAuthorEntries = Array.isArray(payload?.authors) ? payload.authors : [];
            existingSeriesEntries = Array.isArray(payload?.series) ? payload.series : [];
        } catch (error) {
            try {
                const [bookIndexResponse, authorResponse, seriesResponse] = await Promise.all([
                    fetch('./data/book.json', { cache: 'no-store' }),
                    fetch('./data/author.json', { cache: 'no-store' }),
                    fetch('./data/series.json', { cache: 'no-store' })
                ]);

                existingBookIndexEntries = bookIndexResponse.ok ? await bookIndexResponse.json() : [];
                existingAuthorEntries = authorResponse.ok ? await authorResponse.json() : [];
                existingSeriesEntries = seriesResponse.ok ? await seriesResponse.json() : [];
            } catch (fallbackError) {
                existingBookIndexEntries = [];
                existingAuthorEntries = [];
                existingSeriesEntries = [];
            }
        }

        await renderOutputs();
        return {
            bookIndex: existingBookIndexEntries,
            authors: existingAuthorEntries,
            series: existingSeriesEntries
        };
    })();

    return existingIndexStatePromise;
}

async function renderOutputs() {
    const currentRenderVersion = ++renderOutputsVersion;
    updateSlugPreview();

    const formData = new FormData(form);
    renderAuthorSlugSuggestions(formData);
    const bookSlug = getBookSlugFromFormData(formData);
    const bookDetailFilePath = bookSlug ? getBookDetailFilePath(bookSlug) : 'data/book/{slug}.json';
    const bookDetailPayload = buildBookDetailPayload(formData);
    const bookIndexReviewPayload = buildBookIndexReviewPayload(formData);
    const authorsReviewPayload = buildAuthorReviewPayload(formData);
    const seriesEntries = await buildSeriesReviewEntries(formData);
    const seriesPayload = seriesEntries.length
        ? (seriesEntries.length === 1 ? seriesEntries[0].payload : seriesEntries.map((entry) => entry.payload))
        : {
            id: '',
            name: '',
            description: '',
            thumbnail: '',
            work_ids: getBookSlugFromFormData(formData) ? [getBookSlugFromFormData(formData)] : []
        };

    if (currentRenderVersion !== renderOutputsVersion) {
        return;
    }

    updateEditionIdPreviews(formData);
    if (bookDetailFilename) {
        bookDetailFilename.textContent = bookDetailFilePath;
    }
    if (seriesFilename) {
        seriesFilename.textContent = seriesEntries.length === 1 ? seriesEntries[0].file_path : 'data/series/{slug}.json';
    }
    if (downloadBookDetailButton) {
        downloadBookDetailButton.textContent = 'detail.json';
    }
    if (downloadSeriesButton) {
        downloadSeriesButton.textContent = 'series.json';
    }
    bookIndexOutput.textContent = JSON.stringify(bookIndexReviewPayload, null, 2);
    bookDetailOutput.textContent = JSON.stringify(bookDetailPayload, null, 2);
    authorsOutput.textContent = JSON.stringify(authorsReviewPayload, null, 2);
    seriesOutput.textContent = JSON.stringify(seriesPayload, null, 2);
}

function cancelPendingLookup() {
    if (pendingLookupTimer) {
        window.clearTimeout(pendingLookupTimer);
        pendingLookupTimer = null;
    }

    lookupVersion += 1;
}

function populateEditionCards(editions = []) {
    editionsContainer.innerHTML = '';
    editionCounter = 0;

    editionsContainer.appendChild(createEditionCard(editionCounter, {}, { isNewEdition: true }));
    editionCounter += 1;

    sortEditionsByPubYear(editions).forEach((edition) => {
        editionsContainer.appendChild(createEditionCard(editionCounter, edition, { isNewEdition: false }));
        editionCounter += 1;
    });
}

function populateFormFromBookDetail(detail) {
    if (!detail || typeof detail !== 'object') {
        return;
    }

    const editions = sortEditionsByPubYear(detail.editions || []);
    const existingCards = Array.from(editionsContainer.querySelectorAll('.edition-card'));
    const canReuseCurrentCard = existingCards.length === 1 && isEditionCardEmpty(existingCards[0]) && editions.length > 0;

    suppressAutoLookup = true;

    try {
        if (bookIdInput) {
            bookIdInput.value = detail.id || '';
        }

        const titleField = form.querySelector('[name="title"]');
        const titleOriginalField = form.querySelector('[name="titleOriginal"]');
        const authorsField = form.querySelector('[name="authors"]');
        const awardsField = form.querySelector('[name="awards"]');
        const seriesField = form.querySelector('[name="series"]');

        if (titleField) {
            titleField.value = normalizeBookTitle(detail.title || '');
        }
        if (titleOriginalField) {
            titleOriginalField.value = detail.title_original || '';
        }
        if (authorsField) {
            authorsField.value = Array.isArray(detail.authors) ? detail.authors.join(', ') : '';
        }
        if (awardsField) {
            awardsField.value = Array.isArray(detail.awards) ? detail.awards.join('\n') : '';
        }
        if (seriesField) {
            seriesField.value = Array.isArray(detail.series) ? detail.series.join('\n') : '';
        }

        if (canReuseCurrentCard) {
            hydrateEditionCard(existingCards[0], 0, editions[0]);
            editionCounter = 1;

            editions.slice(1).forEach((edition) => {
                const card = createEditionCard(editionCounter, edition, { isNewEdition: false });
                editionsContainer.appendChild(card);
                editionCounter += 1;
            });
        } else {
            populateEditionCards(editions);
        }
    } finally {
        suppressAutoLookup = false;
    }

    hydratedBookSlug = detail.id || '';
    blockedAutoLoadSlug = '';
    setFormStatus(`Đã load dữ liệu cho ${detail.id || 'sách hiện có'}. Bạn có thể chỉnh sửa hoặc thêm phiên bản mới.`, true);
    renderOutputs();
}

function isBookBasicsEmpty(formData) {
    return !normalizeText(formData.get('title'))
        && !normalizeText(formData.get('titleOriginal'))
        && parseCommaSeparatedLines(formData.get('authors') || '').length === 0
        && parseLines(formData.get('awards') || '').length === 0
        && parseLines(formData.get('series') || '').length === 0;
}

function populateBookBasicsFromCrawlResult(bookDetail) {
    if (!bookDetail || typeof bookDetail !== 'object') {
        return;
    }

    const titleField = form.querySelector('[name="title"]');
    const titleOriginalField = form.querySelector('[name="titleOriginal"]');
    const authorsField = form.querySelector('[name="authors"]');

    if (titleField && !normalizeText(titleField.value) && bookDetail.title) {
        titleField.value = normalizeBookTitle(bookDetail.title || '');
    }

    if (titleOriginalField && !normalizeText(titleOriginalField.value) && bookDetail.title_original) {
        titleOriginalField.value = bookDetail.title_original || '';
    }

    if (authorsField && !normalizeText(authorsField.value) && Array.isArray(bookDetail.authors) && bookDetail.authors.length) {
        authorsField.value = bookDetail.authors.join(', ');
    }
}

function populateEditionCardFromCrawlResult(card, bookDetail, sourceUrl = '') {
    if (!card || !bookDetail || typeof bookDetail !== 'object') {
        return null;
    }

    const editions = Array.isArray(bookDetail.editions) ? bookDetail.editions : [];
    const edition = editions[0];
    if (!edition) {
        return null;
    }

    const index = card.dataset.editionIndex || '0';
    const normalizedEdition = {
        ...edition
    };

    hydrateEditionCard(card, index, normalizedEdition);

    setEditionCrawlStatus(card, 'Đã trích xuất dữ liệu.', true);
    return normalizedEdition;
}

async function loadExistingBookBySlug(slug) {
    if (!slug) {
        return null;
    }

    const candidates = [
        apiUrl(`/api/books/${encodeURIComponent(slug)}`),
        `./data/book/${encodeURIComponent(slug)}.json`,
        `./data/book/${slug}.json`
    ];

    for (const url of candidates) {
        try {
            const response = await fetch(url, { cache: 'no-store' });
            if (!response.ok) {
                continue;
            }
            const payload = await response.json();
            if (payload && typeof payload === 'object' && (payload.id || payload.title || Array.isArray(payload.editions))) {
                return payload;
            }
        } catch (error) {
            // continue to next candidate
        }
    }

    return null;
}

async function crawlFahasaFromUrl(url) {
    const targetUrl = normalizeText(url);
    if (!targetUrl) {
        throw new Error('Vui lòng nhập URL sản phẩm Fahasa.');
    }

    if (!/^https:\/\/(www\.)?fahasa\.com\//i.test(targetUrl)) {
        throw new Error('Hiện chỉ hỗ trợ link từ fahasa.com.');
    }

    try {
        const { response, payload } = await fetchJson('/api/crawl/fahasa', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: targetUrl })
        });

        if (!response.ok) {
            if (response.status === 501) {
                throw new Error(`Backend hiện tại không hỗ trợ POST. Hãy chạy \`node script/book-generator-server.js\` tại ${getApiBaseUrl()}.`);
            }

            if (response.status === 404) {
                throw new Error(`Không tìm thấy endpoint crawl tại ${getApiBaseUrl()}. Hãy chạy \`node script/book-generator-server.js\`.`);
            }

            throw new Error(payload.error || 'Không thể crawl dữ liệu từ Fahasa.');
        }

        const bookDetail = payload?.bookDetail;
        if (!bookDetail || typeof bookDetail !== 'object') {
            throw new Error('Server không trả về dữ liệu sách hợp lệ.');
        }
        return bookDetail;
    } catch (error) {
        if (/fetch/i.test(error.message || '') || /network/i.test(error.message || '')) {
            throw new Error(`Không kết nối được backend crawl tại ${getApiBaseUrl()}. Hãy chạy \`node script/book-generator-server.js\`.`);
        }
        throw error;
    }
}

async function crawlFahasaIntoEditionCard(card, url) {
    const targetUrl = normalizeText(url);
    if (!targetUrl) {
        throw new Error('Vui lòng nhập URL sản phẩm Fahasa.');
    }

    if (!/^https:\/\/(www\.)?fahasa\.com\//i.test(targetUrl)) {
        throw new Error('Hiện chỉ hỗ trợ link từ fahasa.com.');
    }

    const crawlButton = card?.querySelector('.crawl-edition-source');
    if (crawlButton) {
        crawlButton.disabled = true;
    }

    cancelPendingLookup();
    setEditionCrawlStatus(card, 'Đang trích xuất...', true);

    try {
        const bookDetail = await crawlFahasaFromUrl(targetUrl);
        const basicsWereEmpty = isBookBasicsEmpty(new FormData(form));
        const normalizedEdition = populateEditionCardFromCrawlResult(card, bookDetail, targetUrl);
        if (!normalizedEdition) {
            throw new Error('Server không trả về dữ liệu edition hợp lệ.');
        }

        if (basicsWereEmpty) {
            populateBookBasicsFromCrawlResult(bookDetail);
            setFormStatus('Đã đổ dữ liệu vào form.', true);
            renderOutputs();
            scheduleLookup(true);
        } else {
            renderOutputs();
        }

        return bookDetail;
    } catch (error) {
        setEditionCrawlStatus(card, error.message || 'Không thể crawl dữ liệu từ Fahasa.', false);
        throw error;
    } finally {
        if (crawlButton) {
            crawlButton.disabled = false;
        }
    }
}

function scheduleLookup(force = false) {
    if (suppressAutoLookup) {
        return;
    }

    if (pendingLookupTimer) {
        window.clearTimeout(pendingLookupTimer);
    }

    const formData = new FormData(form);
    const slug = getBookSlugFromFormData(formData);
    const title = normalizeText(formData.get('title'));
    const titleOriginal = normalizeText(formData.get('titleOriginal'));
    const hasExplicitBookId = Boolean(normalizeText(formData.get('bookId')));
    if (blockedAutoLoadSlug && slug !== blockedAutoLoadSlug) {
        blockedAutoLoadSlug = '';
    }

    if (!slug) {
        setFormStatus('Sẵn sàng nhập liệu.', true);
        return;
    }

    if (!hasExplicitBookId && slug === blockedAutoLoadSlug) {
        setFormStatus(`Đang tạo slug mới: ${slug}.`, true);
        return;
    }

    if (!hasExplicitBookId && !title && !titleOriginal) {
        const authorName = getPrimaryAuthorName(formData);
        const workIds = getAuthorWorkIds(formData);
        if (authorName && workIds.length) {
            setFormStatus(`Đã tìm thấy ${workIds.length} slug của ${authorName}.`, true);
        } else if (authorName) {
            setFormStatus(`Chưa thấy slug của ${authorName} trong author.json.`, true);
        }
        return;
    }

    if (slug === hydratedBookSlug) {
        return;
    }

    lookupVersion += 1;
    const currentLookupVersion = lookupVersion;

    pendingLookupTimer = window.setTimeout(async () => {
        const existingBook = await loadExistingBookBySlug(slug);
        if (currentLookupVersion !== lookupVersion && !force) {
            return;
        }

        if (existingBook) {
            const currentDetail = buildBookDetailPayload(new FormData(form));
            const mergedDetail = mergeBookDetails(currentDetail, existingBook);
            populateFormFromBookDetail(mergedDetail);
            return;
        }

        setFormStatus('Sẵn sàng nhập liệu.', true);
    }, 250);
}

async function persistGeneratedFiles(formData) {
    await refreshExistingIndexState(true);

    const bookId = getBookSlugFromFormData(formData);
    const bookDetailPayload = buildBookDetailPayload(formData);
    const bookIndexPayload = buildBookIndexPayload(formData);
    const authorPayload = buildAuthorPayload(formData);
    const seriesPayload = buildSeriesPayload(formData);

    const response = await fetch(apiUrl('/api/books/save'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            bookDetail: bookDetailPayload,
            bookIndex: bookIndexPayload,
            authorPayload,
            seriesPayload
        })
    });

    if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.error || 'Không thể lưu dữ liệu vào workspace.');
    }

    return {
        bookDetailPayload,
        bookIndexPayload,
        authorPayload,
        seriesPayload
    };
}

form.addEventListener('input', (event) => {
    if (event.target && ['title', 'titleOriginal', 'authors', 'bookId'].includes(event.target.name)) {
        scheduleLookup();
    }

    renderOutputs();
});

form.addEventListener('change', (event) => {
    if (event.target && ['title', 'titleOriginal', 'authors', 'bookId'].includes(event.target.name)) {
        scheduleLookup(true);
    }
});

form.addEventListener('focusout', (event) => {
    if (event.target && ['title', 'titleOriginal', 'authors', 'bookId'].includes(event.target.name)) {
        scheduleLookup(true);
    }

    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        sanitizeFormValues(form);
        renderOutputs();
    }
});

form.addEventListener('paste', (event) => {
    const target = event.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        window.requestAnimationFrame(() => {
            sanitizeFormValues(form);
            renderOutputs();
        });
    }
});

if (authorSlugSuggestions) {
    authorSlugSuggestions.addEventListener('click', (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) {
            return;
        }

        const button = target.closest('button[data-author-slug-action]');
        if (!(button instanceof HTMLButtonElement)) {
            return;
        }

        if (button.dataset.authorSlugAction === 'use-existing') {
            useAuthorSuggestionSlug(button.dataset.bookSlug || '');
        }
    });
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    sanitizeFormValues(form);
    const formData = new FormData(form);
    renderOutputs();

    try {
        const persisted = await persistGeneratedFiles(formData);
        await refreshExistingIndexState(true);
        setFormStatus(`Đã cập nhật file cho ${persisted.bookDetailPayload.id}.`, true);
    } catch (error) {
        setFormStatus(error.message || 'Không thể lưu trực tiếp vào workspace. Đã chuyển sang tải file JSON.', false);
        const bookId = getBookSlugFromFormData(formData);
        const baseName = bookId || 'book';
        downloadJson(`${baseName}.book-index.json`, buildBookIndexPayload(formData));
        downloadJson(getDownloadFileNameFromSlug(baseName), buildBookDetailPayload(formData));
        downloadJson(`${baseName}.authors.json`, buildAuthorPayload(formData));
        const seriesEntries = await buildSeriesReviewEntries(formData);
        if (!seriesEntries.length) {
            downloadJson('series.json', buildSeriesPayload(formData));
        } else {
            seriesEntries.forEach((entry) => {
                downloadJson(getDownloadFileNameFromSlug(entry.id), entry.payload);
            });
        }
    }
});

addEditionButton.addEventListener('click', () => {
    addEdition();
    renderOutputs();
});

editionsContainer.addEventListener('click', async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
        return;
    }

    const button = target.closest('.crawl-edition-source');
    if (!button) {
        return;
    }

    const card = button.closest('.edition-card');
    if (!(card instanceof HTMLElement)) {
        return;
    }

    const index = card.dataset.editionIndex || '0';
    const sourceField = card.querySelector(`[name="edition-source-url-${index}"]`);
    const targetUrl = sourceField ? sourceField.value : '';

    try {
        await crawlFahasaIntoEditionCard(card, targetUrl);
    } catch (error) {
        const message = error.message || 'Không thể crawl dữ liệu từ Fahasa.';
        setEditionCrawlStatus(card, message, false);
        setFormStatus(message, false);
    }
});

editionsContainer.addEventListener('keydown', async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement) || event.key !== 'Enter') {
        return;
    }

    if (!target.matches('[name^="edition-source-url-"]')) {
        return;
    }

    event.preventDefault();
    const card = target.closest('.edition-card');
    if (!(card instanceof HTMLElement)) {
        return;
    }

    try {
        await crawlFahasaIntoEditionCard(card, target.value);
    } catch (error) {
        const message = error.message || 'Không thể crawl dữ liệu từ Fahasa.';
        setEditionCrawlStatus(card, message, false);
        setFormStatus(message, false);
    }
});

document.getElementById('download-book-index').addEventListener('click', async () => {
    sanitizeFormValues(form);
    const formData = new FormData(form);
    await refreshExistingIndexState(true);
    const slug = getBookSlugFromFormData(formData) || 'book';
    downloadJson(getDownloadFileNameFromSlug(slug, 'book-index'), buildBookIndexPayload(formData));
});

downloadBookDetailButton?.addEventListener('click', async () => {
    sanitizeFormValues(form);
    const formData = new FormData(form);
    await refreshExistingIndexState(true);
    const bookId = getBookSlugFromFormData(formData);
    downloadJson(getDownloadFileNameFromSlug(bookId), buildBookDetailPayload(formData));
});

document.getElementById('download-authors').addEventListener('click', async () => {
    sanitizeFormValues(form);
    const formData = new FormData(form);
    await refreshExistingIndexState(true);
    const slug = getBookSlugFromFormData(formData) || 'book';
    downloadJson(getDownloadFileNameFromSlug(slug, 'authors'), buildAuthorPayload(formData));
});

downloadSeriesButton?.addEventListener('click', async () => {
    sanitizeFormValues(form);
    const formData = new FormData(form);
    await refreshExistingIndexState(true);
    const seriesEntries = await buildSeriesReviewEntries(formData);

    if (!seriesEntries.length) {
        downloadJson('series.json', buildSeriesPayload(formData));
        return;
    }

    if (seriesEntries.length === 1) {
        downloadJson(getDownloadFileNameFromSlug(seriesEntries[0].id), seriesEntries[0].payload);
        return;
    }

    seriesEntries.forEach((entry) => {
        downloadJson(getDownloadFileNameFromSlug(entry.id), entry.payload);
    });
});

populateEditionCards([]);
updateSlugPreview();
renderOutputs();
refreshExistingIndexState();
scheduleLookup(true);
