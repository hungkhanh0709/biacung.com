const form = document.getElementById('book-form');
const editionsContainer = document.getElementById('editions-container');
const addEditionButton = document.getElementById('add-edition');
const loadBookButton = document.getElementById('load-book');
const bookIdInput = document.getElementById('book-id');
const authorSlugSuggestions = document.getElementById('author-slug-suggestions');
const formStatus = document.getElementById('form-status');

setNoHistoryBehavior(form);

const bookIndexOutput = document.getElementById('book-index-output');
const bookDetailOutput = document.getElementById('book-detail-output');
const bookDetailFilename = document.getElementById('book-detail-filename');
const authorsOutput = document.getElementById('authors-output');
const seriesOutput = document.getElementById('series-output');
const seriesFilename = document.getElementById('series-filename');
const downloadBookIndexButton = document.getElementById('download-book-index');
const downloadBookDetailButton = document.getElementById('download-book-detail');
const downloadAuthorsButton = document.getElementById('download-authors');
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

function sanitizeBookDetailPayload(bookDetail = {}) {
    if (!bookDetail || typeof bookDetail !== 'object') {
        return {};
    }

    const { book_id, updated_at, ...rest } = bookDetail;
    return rest;
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

async function postJson(pathname, payload) {
    const response = await fetch(apiUrl(pathname), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    let responsePayload = null;

    try {
        responsePayload = await response.json();
    } catch (error) {
        responsePayload = null;
    }

    if (!response.ok) {
        const message = responsePayload?.error || `Request failed (${response.status})`;
        throw new Error(message);
    }

    return responsePayload;
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

function titlesMatch(left, right) {
    const normalizedLeft = normalizeBookTitle(left).toLocaleLowerCase('vi');
    const normalizedRight = normalizeBookTitle(right).toLocaleLowerCase('vi');
    return Boolean(normalizedLeft && normalizedRight && normalizedLeft === normalizedRight);
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

        if (field.name === 'title' || field.name?.startsWith('edition-title-')) {
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

function isSeriesDetailPayload(entry) {
    if (!entry || typeof entry !== 'object') {
        return false;
    }

    return Boolean(
        normalizeText(entry.name)
        || normalizeText(entry.description)
        || normalizeText(entry.thumbnail)
        || (Array.isArray(entry.work_ids) && entry.work_ids.length)
    );
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
    if (!formStatus) {
        return;
    }

    formStatus.textContent = message;
    formStatus.className = 'form-status';
    if (!success) {
        formStatus.classList.add('error');
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

async function useAuthorSuggestionSlug(slug) {
    const normalizedSlug = slugify(slug);
    if (!normalizedSlug || !bookIdInput) {
        return;
    }

    if (pendingLookupTimer) {
        window.clearTimeout(pendingLookupTimer);
        pendingLookupTimer = null;
    }
    lookupVersion += 1;
    blockedAutoLoadSlug = '';
    bookIdInput.value = normalizedSlug;
    hydratedBookSlug = '';
    await loadBookFromCurrentSlug();
}

function createEditionCard(index = editionCounter, editionData = {}, options = {}) {
    const card = document.createElement('div');
    card.className = 'edition-card';
    if (options.isNewEdition) {
        card.classList.add('is-new-edition');
    }
    card.dataset.editionIndex = String(index);
    card.innerHTML = `
        <div class="edition-card-heading">
            <strong>${options.isNewEdition ? 'Phiên bản mới' : 'Phiên bản đã lưu'}</strong>
        </div>
        <div class="grid">
            <label class="field-full-row">
                Nhập nhanh từ nội dung có sẵn
                <textarea class="field-inline" name="edition-raw-${index}" rows="4" placeholder="Dán thông tin nhà sách / mô tả sản phẩm..."></textarea>
                <div class="inline-actions">
                    <button type="button" class="secondary auto-fill" data-for-index="${index}">Điền vào form</button>
                </div>
            </label>
            <div class="field-row-2 field-full-row">
                <label>
                    Tựa của bản dịch / phiên bản
                    <input class="field-inline" name="edition-title-${index}" placeholder="Odyssêy — để trống nếu giống tựa chung" />
                    <span class="field-helper">Chỉ nhập khi khác tựa tiếng Việt mặc định.</span>
                </label>
                <label>
                    Mô tả phiên bản
                    <input class="field-inline" name="edition-caption-${index}" placeholder="Ấn bản giới hạn, bìa vải, bộ 2 tập..." />
                </label>
            </div>
            <input type="hidden" name="edition-isbn-${index}" />
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

            <label class="field-full-row">
                Series IDs
                <textarea class="field-inline" name="edition-series-ids-${index}" rows="2" placeholder="dong-a-classics-bia-vai"></textarea>
                <span class="field-helper">Mỗi ID một dòng. Để trống nếu phiên bản không thuộc series.</span>
            </label>

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

    const setParsedFieldValue = (fieldName, value) => {
        if (Array.isArray(value) ? value.length > 0 : normalizeText(value) !== '') {
            setFieldValue(fieldName, value);
        }
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
        setFieldValue(`edition-title-${index}`, editionData.title || '');
        setFieldValue(`edition-caption-${index}`, editionData.caption || '');
        setFieldValue(`edition-isbn-${index}`, editionData.isbn || '');
        setFieldValue(`edition-series-ids-${index}`, editionData.series_ids || []);
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
                    const parsedTitle = normalizeBookTitle(parsed.title || '');
                    if (titleField && parsedTitle && !normalizeText(titleField.value)) {
                        titleField.value = parsedTitle;
                    }
                    const canonicalTitle = normalizeBookTitle(titleField?.value || '');
                    if (
                        parsedTitle
                        && canonicalTitle
                        && parsedTitle.toLocaleLowerCase('vi') !== canonicalTitle.toLocaleLowerCase('vi')
                    ) {
                        setParsedFieldValue(`edition-title-${index}`, parsedTitle);
                    }

                    const authorsField = form?.querySelector('[name="authors"]');
                    if (authorsField && Array.isArray(parsed.authors) && parsed.authors.length) {
                        authorsField.value = parsed.authors.join(', ');
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

                    setParsedFieldValue(`edition-isbn-${index}`, parsed.isbn || parsed.sku || '');
                    setParsedFieldValue(`edition-pub-year-${index}`, parsed.pub_year ?? '');
                    setParsedFieldValue(`edition-publisher-${index}`, normalizedPublisher || '');
                    setParsedFieldValue(`edition-issuers-${index}`, normalizedIssuers || []);
                    setParsedFieldValue(`edition-translators-${index}`, formatCommaSeparatedNames(parsed.translators || []));
                    setParsedFieldValue(`edition-illustrators-${index}`, formatCommaSeparatedNames(parsed.illustrators || []));
                    setParsedFieldValue(`edition-proofreaders-${index}`, formatCommaSeparatedNames(parsed.proofreaders || []));
                    setParsedFieldValue(`edition-format-${index}`, normalizeFormatValue(parsed.format || ''));
                    setParsedFieldValue(`edition-cover-price-${index}`, parsed.cover_price || '');
                    setParsedFieldValue(`edition-page-count-${index}`, parsed.page_count ?? '');
                    setParsedFieldValue(`edition-weight-${index}`, parsed.weight_g ?? '');
                    setParsedFieldValue(`edition-size-${index}`, normalizeSizeValue(parsed.size_cm || ''));
                    setParsedFieldValue(`edition-thumbnail-${index}`, parsed.thumbnail || '');
                    setParsedFieldValue(`edition-detail-${index}`, parsed.detail || '');

                    setFormStatus('Đã điền các trường nhận diện được; dữ liệu đang có được giữ nguyên.', true);
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
        edition.title,
        edition.caption,
        edition.isbn,
        edition.series_ids,
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
    const primary = sanitizeBookDetailPayload(primaryDetail);
    const secondary = sanitizeBookDetailPayload(secondaryDetail);

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
        editions: sortEditionsByPubYear(mergedEditions)
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
    const seriesIds = parseLines(formData.get(`edition-series-ids-${index}`) || '').map(slugify).filter(Boolean);
    const title = normalizeBookTitle(formData.get(`edition-title-${index}`) || '');
    const defaultTitle = normalizeBookTitle(formData.get('title') || '');
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
        ...(title && !titlesMatch(title, defaultTitle) ? { title } : {}),
        isbn: isbn || null,
        series_ids: [...new Set(seriesIds)],
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

        return String(left?.title || left?.caption || '').localeCompare(String(right?.title || right?.caption || ''), 'vi');
    });
}

function buildBookDetailPayload(formData) {
    const bookId = getBookSlugFromFormData(formData);
    const editions = [];
    const editionCards = Array.from(editionsContainer.querySelectorAll('.edition-card'));

    editionCards.forEach((card) => {
        const index = card.dataset.editionIndex || '';
        const edition = buildEditionFromFormData(formData, index, bookId);
        if (edition.title || edition.caption || edition.publisher || edition.format || edition.isbn || edition.thumbnail || edition.detail || edition.issuers.length || edition.translators.length || edition.illustrators.length || edition.proofreaders.length || edition.gellery_imgs.length) {
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
        editions: sortEditionsByPubYear(editions)
    };
}

function updateEditionIdPreviews(formData) {
    const bookId = getBookSlugFromFormData(formData);
    const editionCards = Array.from(editionsContainer.querySelectorAll('.edition-card'));

    editionCards.forEach((card) => {
        const index = card.dataset.editionIndex || '';
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

    const addEditionFieldValues = (prefix, transform = (value) => value) => {
        for (const [fieldName, value] of formData.entries()) {
            if (fieldName.startsWith(prefix)) {
                addValues(transform(value));
            }
        }
    };

    parseCommaSeparatedLines(formData.get('authors') || '').forEach((entry) => addValues(entry));
    addValues(formData.get('titleOriginal') || '');
    addValues(formData.get('title') || '');
    addEditionFieldValues('edition-title-');
    addEditionFieldValues('edition-publisher-', normalizePublisher);
    addEditionFieldValues('edition-issuers-');
    addEditionFieldValues('edition-translators-');
    addEditionFieldValues('edition-illustrators-');
    addEditionFieldValues('edition-proofreaders-');
    parseLines(formData.get('series') || '').forEach((entry) => addValues(entry));
    addEditionFieldValues('edition-caption-');
    parseLines(formData.get('awards') || '').forEach((entry) => addValues(entry));

    return terms;
}

function getLatestPublicationYear(formData) {
    const years = Array.from(form.elements)
        .filter((field) => field.name?.startsWith('edition-pub-year-'))
        .map((field) => Number.parseInt(normalizeText(formData.get(field.name)), 10))
        .filter((year) => Number.isInteger(year) && year > 0);

    return years.length ? Math.max(...years) : '';
}

function findUnknownSeriesIds(formData) {
    const knownIds = new Set(
        (Array.isArray(existingSeriesEntries) ? existingSeriesEntries : [])
            .map((entry) => slugify(entry?.id || entry?.name || ''))
            .filter(Boolean)
    );
    parseLines(formData.get('series') || '').forEach((name) => knownIds.add(slugify(name)));

    const requestedIds = Array.from(form.elements)
        .filter((field) => field.name?.startsWith('edition-series-ids-'))
        .flatMap((field) => parseLines(formData.get(field.name) || '').map(slugify))
        .filter(Boolean);

    return [...new Set(requestedIds.filter((seriesId) => !knownIds.has(seriesId)))];
}

function buildBookIndexPayload(formData, existingBookIndex = existingBookIndexEntries) {
    const bookId = getBookSlugFromFormData(formData);
    const detailPath = getBookDetailFilePath(bookId);
    const searchText = collectSearchTextTerms(formData).join(' ');
    const updatedAt = new Date().toISOString().slice(0, 10);
    const mergedBookIndex = Array.isArray(existingBookIndex) ? existingBookIndex.filter((entry) => entry && entry.detail !== detailPath) : [];
    const existingEntry = findExistingBookIndexEntry(detailPath, existingBookIndex);

    mergedBookIndex.push({
        detail: detailPath,
        search_text: searchText,
        last_pub_year: getLatestPublicationYear(formData) || existingEntry?.last_pub_year || '',
        updated_at: updatedAt
    });

    return mergedBookIndex.sort((left, right) => (right.updated_at || '').localeCompare(left.updated_at || '', 'en'));
}

function findExistingBookIndexEntry(detailPath, existingBookIndex = existingBookIndexEntries) {
    if (!detailPath || !Array.isArray(existingBookIndex)) {
        return null;
    }

    return existingBookIndex.find((entry) => normalizeText(entry?.detail) === detailPath) || null;
}

function buildBookIndexReviewPayload(formData) {
    const bookId = getBookSlugFromFormData(formData);
    const detailPath = getBookDetailFilePath(bookId);
    const searchText = collectSearchTextTerms(formData).join(' ');
    const updatedAt = new Date().toISOString().slice(0, 10);
    const existingEntry = findExistingBookIndexEntry(detailPath);

    return {
        detail: detailPath,
        search_text: searchText,
        last_pub_year: getLatestPublicationYear(formData) || existingEntry?.last_pub_year || '',
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

async function loadExistingSeriesBySlug(slug, detailPath = '') {
    const normalizedSlug = slugify(slug);
    if (!normalizedSlug) {
        return null;
    }

    if (existingSeriesFileCache.has(normalizedSlug)) {
        return existingSeriesFileCache.get(normalizedSlug);
    }

    const candidates = [
        normalizeText(detailPath),
        `./data/series/${encodeURIComponent(normalizedSlug)}.json`,
        `./data/series/${normalizedSlug}.json`
    ].filter(Boolean);

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

async function resolveExistingSeriesReviewEntry(seriesId, existingSeries = existingSeriesEntries) {
    if (!seriesId) {
        return null;
    }

    const existingSeriesEntry = Array.isArray(existingSeries)
        ? existingSeries.find((entry) => slugify(entry.name || '') === seriesId || entry.id === seriesId)
        : null;

    const loadedSeriesEntry = await loadExistingSeriesBySlug(seriesId, existingSeriesEntry?.detail);
    if (loadedSeriesEntry && existingSeriesEntry && typeof existingSeriesEntry === 'object') {
        return {
            ...existingSeriesEntry,
            ...loadedSeriesEntry
        };
    }

    if (loadedSeriesEntry) {
        return loadedSeriesEntry;
    }

    if (isSeriesDetailPayload(existingSeriesEntry)) {
        return { ...existingSeriesEntry };
    }

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
        const existingSeriesEntry = await resolveExistingSeriesReviewEntry(seriesId, existingSeries);
        const payload = existingSeriesEntry ? { ...existingSeriesEntry } : {
            id: seriesId,
            name,
            description: '',
            thumbnail: '',
            work_ids: []
        };

        delete payload.detail;
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
        downloadBookDetailButton.textContent = 'Lưu detail.json';
    }
    if (downloadSeriesButton) {
        downloadSeriesButton.textContent = 'Lưu series.json';
    }
    bookIndexOutput.textContent = JSON.stringify(bookIndexReviewPayload, null, 2);
    bookDetailOutput.textContent = JSON.stringify(bookDetailPayload, null, 2);
    authorsOutput.textContent = JSON.stringify(authorsReviewPayload, null, 2);
    seriesOutput.textContent = JSON.stringify(seriesPayload, null, 2);
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

        populateEditionCards(editions);
    } finally {
        suppressAutoLookup = false;
    }

    hydratedBookSlug = detail.id || '';
    blockedAutoLoadSlug = '';
    setFormStatus(`Đã load dữ liệu cho ${detail.id || 'sách hiện có'}. Bạn có thể chỉnh sửa hoặc thêm phiên bản mới.`, true);
    renderOutputs();
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

async function loadBookFromCurrentSlug() {
    sanitizeFormValues(form);
    const slug = getBookSlugFromFormData(new FormData(form));
    if (!slug) {
        setFormStatus('Nhập slug, hoặc nhập tác giả và tựa đề trước khi tải.', false);
        bookIdInput?.focus();
        return;
    }

    const originalText = loadBookButton?.textContent || 'Tải dữ liệu';
    try {
        if (loadBookButton) {
            loadBookButton.disabled = true;
            loadBookButton.textContent = 'Đang tải...';
        }
        setFormStatus(`Đang tải ${slug}...`, true);
        const bookDetail = await loadExistingBookBySlug(slug);
        if (!bookDetail) {
            blockedAutoLoadSlug = slug;
            setFormStatus(`Không tìm thấy data/book/${slug}.json. Bạn có thể tiếp tục tạo sách mới.`, false);
            return;
        }

        populateFormFromBookDetail(bookDetail);
    } finally {
        if (loadBookButton) {
            loadBookButton.disabled = false;
            loadBookButton.textContent = originalText;
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
    const bookIndexPayload = buildBookIndexReviewPayload(formData);
    const authorPayload = buildAuthorReviewPayload(formData);
    const seriesEntries = await buildSeriesReviewEntries(formData);
    const seriesPayload = seriesEntries.map((entry) => entry.payload);

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
    authorSlugSuggestions.addEventListener('click', async (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) {
            return;
        }

        const button = target.closest('button[data-author-slug-action]');
        if (!(button instanceof HTMLButtonElement)) {
            return;
        }

        if (button.dataset.authorSlugAction === 'use-existing') {
            button.disabled = true;
            try {
                await useAuthorSuggestionSlug(button.dataset.bookSlug || '');
            } finally {
                if (button.isConnected) {
                    button.disabled = false;
                }
            }
        }
    });
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    sanitizeFormValues(form);
    if (!form.reportValidity()) {
        setFormStatus('Vui lòng điền đủ tựa đề và tác giả.', false);
        return;
    }

    await refreshExistingIndexState(true);
    const formData = new FormData(form);
    const bookId = getBookSlugFromFormData(formData);
    if (!bookId) {
        setFormStatus('Không thể tạo slug sách từ dữ liệu hiện tại.', false);
        return;
    }

    const unknownSeriesIds = findUnknownSeriesIds(formData);
    if (unknownSeriesIds.length) {
        setFormStatus(`Series ID chưa có trong data/series.json hoặc trường Bộ sưu tập: ${unknownSeriesIds.join(', ')}.`, false);
        form.querySelector('[name^="edition-series-ids-"]')?.focus();
        return;
    }

    renderOutputs();
    const submitButtons = Array.from(document.querySelectorAll('[type="submit"][form="book-form"], #book-form [type="submit"]'));

    try {
        submitButtons.forEach((button) => {
            button.disabled = true;
        });
        setFormStatus(`Đang lưu ${bookId}...`, true);
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
    } finally {
        submitButtons.forEach((button) => {
            button.disabled = false;
        });
    }
});

loadBookButton?.addEventListener('click', loadBookFromCurrentSlug);

addEditionButton.addEventListener('click', () => {
    addEdition();
    renderOutputs();
});

downloadBookIndexButton?.addEventListener('click', async (event) => {
    const button = event.currentTarget instanceof HTMLButtonElement ? event.currentTarget : downloadBookIndexButton;
    sanitizeFormValues(form);
    const formData = new FormData(form);
    await refreshExistingIndexState(true);
    const payload = {
        bookId: getBookSlugFromFormData(formData),
        bookIndexReview: buildBookIndexReviewPayload(formData)
    };

    const originalText = button.textContent;
    try {
        button.disabled = true;
        button.textContent = 'Đang lưu...';
        await postJson('/api/books/save/book-index-review', payload);
        await refreshExistingIndexState(true);
        button.textContent = 'Đã lưu';
    } catch (error) {
        console.error('Failed to save book index review', error);
        button.textContent = originalText || 'Lưu book.json';
    } finally {
        window.setTimeout(() => {
            if (button) {
                button.textContent = originalText || 'Lưu book.json';
                button.disabled = false;
            }
        }, 700);
    }
});

downloadBookDetailButton?.addEventListener('click', async () => {
    const button = downloadBookDetailButton;
    sanitizeFormValues(form);
    const formData = new FormData(form);
    await refreshExistingIndexState(true);
    const payload = {
        bookId: getBookSlugFromFormData(formData),
        bookDetail: buildBookDetailPayload(formData)
    };

    const originalText = button.textContent;
    try {
        button.disabled = true;
        button.textContent = 'Đang lưu...';
        await postJson('/api/books/save/book-detail-review', payload);
        await refreshExistingIndexState(true);
        button.textContent = 'Đã lưu';
    } catch (error) {
        console.error('Failed to save book detail review', error);
        button.textContent = originalText || 'Lưu detail.json';
    } finally {
        window.setTimeout(() => {
            if (button) {
                button.textContent = originalText || 'Lưu detail.json';
                button.disabled = false;
            }
        }, 700);
    }
});

downloadAuthorsButton?.addEventListener('click', async (event) => {
    const button = event.currentTarget instanceof HTMLButtonElement ? event.currentTarget : downloadAuthorsButton;
    sanitizeFormValues(form);
    const formData = new FormData(form);
    await refreshExistingIndexState(true);
    const payload = {
        bookId: getBookSlugFromFormData(formData),
        authorReview: buildAuthorReviewPayload(formData)
    };

    const originalText = button.textContent;
    try {
        button.disabled = true;
        button.textContent = 'Đang lưu...';
        await postJson('/api/books/save/author-review', payload);
        await refreshExistingIndexState(true);
        button.textContent = 'Đã lưu';
    } catch (error) {
        console.error('Failed to save author review', error);
        button.textContent = originalText || 'Lưu author.json';
    } finally {
        window.setTimeout(() => {
            if (button) {
                button.textContent = originalText || 'Lưu author.json';
                button.disabled = false;
            }
        }, 700);
    }
});

downloadSeriesButton?.addEventListener('click', async (event) => {
    const button = event.currentTarget instanceof HTMLButtonElement ? event.currentTarget : downloadSeriesButton;
    sanitizeFormValues(form);
    const formData = new FormData(form);
    await refreshExistingIndexState(true);
    const payload = {
        bookId: getBookSlugFromFormData(formData),
        seriesReview: await buildSeriesReviewPayload(formData)
    };

    const originalText = button.textContent;
    try {
        button.disabled = true;
        button.textContent = 'Đang lưu...';
        await postJson('/api/books/save/series-review', payload);
        await refreshExistingIndexState(true);
        button.textContent = 'Đã lưu';
    } catch (error) {
        console.error('Failed to save series review', error);
        button.textContent = originalText || 'Lưu series.json';
    } finally {
        window.setTimeout(() => {
            if (button) {
                button.textContent = originalText || 'Lưu series.json';
                button.disabled = false;
            }
        }, 700);
    }
});

populateEditionCards([]);
updateSlugPreview();
renderOutputs();
refreshExistingIndexState();
scheduleLookup(true);
