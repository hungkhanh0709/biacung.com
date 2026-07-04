const form = document.getElementById('book-form');
const editionsContainer = document.getElementById('editions-container');
const addEditionButton = document.getElementById('add-edition');
const resetButton = document.getElementById('reset-form');
const bookIdInput = document.getElementById('book-id');
const slugPreview = document.getElementById('slug-preview');
const slugStatus = document.getElementById('slug-status');
const formStatus = document.getElementById('form-status');

setNoHistoryBehavior(form);

const bookIndexOutput = document.getElementById('book-index-output');
const bookDetailOutput = document.getElementById('book-detail-output');
const authorsOutput = document.getElementById('authors-output');
const seriesOutput = document.getElementById('series-output');

let editionCounter = 0;
let pendingLookupTimer = null;
let lookupVersion = 0;
let existingBookIndexEntries = [];
let existingAuthorEntries = [];
let existingSeriesEntries = [];
let existingIndexStatePromise = null;

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

function parseLines(value) {
    return normalizeText(value)
        .split(/\r?\n/)
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

function normalizeNameLines(value) {
    return parseLines(value)
        .map((line) => toTitleCase(line))
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

        if (field.name?.startsWith('edition-caption-')) {
            const formattedCaption = toTitleCase(field.value);
            if (formattedCaption !== field.value) {
                field.value = formattedCaption;
            }
            return;
        }

        if (field.name?.startsWith('edition-issuers-') || field.name?.startsWith('edition-translators-') || field.name?.startsWith('edition-illustrators-') || field.name?.startsWith('edition-proofreaders-')) {
            const normalizedLines = normalizeNameLines(field.value);
            if (normalizedLines !== field.value) {
                field.value = normalizedLines;
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
    formStatus.className = 'status-message';
    if (success) {
        formStatus.classList.add('success');
    } else {
        formStatus.classList.add('error');
    }
}

function getBookSlugFromFormData(formData) {
    const explicitSlug = normalizeText(formData.get('bookId'));
    if (explicitSlug) {
        return slugify(explicitSlug);
    }

    const title = (formData.get('title') || '').trim();
    const titleOriginal = (formData.get('titleOriginal') || '').trim();
    const authors = parseLines(formData.get('authors') || '');
    const authorName = authors[0] || '';
    const baseText = `${authorName} ${titleOriginal || title}`.trim();
    return slugify(baseText);
}

function updateSlugPreview() {
    const formData = new FormData(form);
    const slug = getBookSlugFromFormData(formData);
    if (slugPreview) {
        slugPreview.textContent = slug || 'slug sẽ được tạo';
    }
    if (slugStatus) {
        slugStatus.textContent = slug
            ? `Slug hiện tại: ${slug}`
            : 'Slug sẽ được tạo từ Tựa đề gốc + Tác giả.';
    }
}

function createEditionCard(index = editionCounter, editionData = {}) {
    const card = document.createElement('div');
    card.className = 'edition-card';
    card.innerHTML = `
        <div class="grid">
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
            <label class="field-full-row">
                Auto input (dán nội dung tự do ở đây):
                <textarea class="field-inline" name="edition-raw-${index}" rows="4" placeholder="Dán thông tin nhà sách / mô tả sản phẩm..."></textarea>
                <div class="inline-actions">
                    <button type="button" class="secondary auto-fill" data-for-index="${index}">Tự động nhập</button>
                </div>
            </label>
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
                Chi tiết bản phát hành
                <textarea class="field-tall field-inline" name="edition-detail-${index}" rows="4" placeholder="Bản giới hạn, signed copy..."></textarea>
            </label>
        </div>
        <div class="inline-actions">
            <button type="button" class="danger remove-edition">Xóa bản phát hành</button>
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
        setFieldValue(`edition-issuers-${index}`, editionData.issuers || []);
        setFieldValue(`edition-translators-${index}`, editionData.translators || []);
        setFieldValue(`edition-illustrators-${index}`, editionData.illustrators || []);
        setFieldValue(`edition-proofreaders-${index}`, editionData.proofreaders || []);
        setFieldValue(`edition-format-${index}`, editionData.format || '');
        setFieldValue(`edition-cover-price-${index}`, editionData.cover_price || '');
        setFieldValue(`edition-print-run-${index}`, editionData.print_run ?? '');
        setFieldValue(`edition-page-count-${index}`, editionData.page_count ?? '');
        setFieldValue(`edition-copy-numbering-${index}`, editionData.copy_numbering || '');
        setFieldValue(`edition-size-${index}`, editionData.size_cm || '');
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
                            ? parsed.authors.join('\n')
                            : '';
                    }

                    const normalizeParsedIssuers = (parsedObj, raw) => {
                        let issuers = Array.isArray(parsedObj.issuers) ? parsedObj.issuers.slice() : [];
                        issuers = issuers.filter((issuer) => issuer && !/(liên kết|ấn hành|phối hợp|bởi|phát hành)/i.test(issuer));
                        if (!issuers.length) {
                            if (/đông a|dong a/i.test(raw)) return ['Đông A'];
                            if (/fahasa/i.test(raw)) return ['Fahasa'];
                            if (/vinabook/i.test(raw)) return ['Vinabook'];
                            if (/tiki/i.test(raw)) return ['Tiki'];
                            const m = raw.match(/Công ty[^\n]*?([A-ZĐ][^\s]*\s+[A-ZĐ][^\s]*)\s+(?:NXB|Nhà xuất bản|liên kết|ấn hành|phát hành|$)/i);
                            if (m) return [m[1]];
                        }
                        return issuers;
                    };

                    const normalizedIssuers = normalizeParsedIssuers(parsed, rawText || '');
                    const normalizedPublisher = normalizeText(parsed.publisher || '').replace(/^NXB\s*/i, '');

                    setFieldValue(`edition-isbn-${index}`, parsed.isbn || parsed.sku || '');
                    setFieldValue(`edition-pub-year-${index}`, parsed.pub_year ?? '');
                    setFieldValue(`edition-publisher-${index}`, normalizedPublisher || '');
                    setFieldValue(`edition-issuers-${index}`, normalizedIssuers || []);
                    setFieldValue(`edition-translators-${index}`, parsed.translators || []);
                    setFieldValue(`edition-illustrators-${index}`, parsed.illustrators || []);
                    setFieldValue(`edition-format-${index}`, parsed.format || '');
                    setFieldValue(`edition-cover-price-${index}`, parsed.cover_price || '');
                    setFieldValue(`edition-page-count-${index}`, parsed.page_count ?? '');
                    setFieldValue(`edition-weight-${index}`, parsed.weight_g ?? '');
                    setFieldValue(`edition-size-${index}`, parsed.size_cm || '');
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

function addEdition() {
    const card = createEditionCard(editionCounter);
    // Insert new edition cards at the top so newest editions appear first
    editionsContainer.insertBefore(card, editionsContainer.firstChild);
    editionCounter += 1;
}

function resetForm() {
    form.reset();
    editionsContainer.innerHTML = '';
    editionCounter = 0;
    updateSlugPreview();
    setFormStatus('Sách mới. Bạn có thể nhập thông tin ngay.', true);
    renderOutputs();
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
    const issuers = parseLines(formData.get(`edition-issuers-${index}`) || '').map(toTitleCase);
    const translators = parseLines(formData.get(`edition-translators-${index}`) || '').map(toTitleCase);
    const illustrators = parseLines(formData.get(`edition-illustrators-${index}`) || '').map(toTitleCase);
    const proofreaders = parseLines(formData.get(`edition-proofreaders-${index}`) || '').map(toTitleCase);
    const format = normalizeText(formData.get(`edition-format-${index}`));
    const coverPrice = normalizeText(formData.get(`edition-cover-price-${index}`));
    const printRun = normalizeText(formData.get(`edition-print-run-${index}`));
    const pageCount = normalizeText(formData.get(`edition-page-count-${index}`));
    const copyNumbering = normalizeText(formData.get(`edition-copy-numbering-${index}`));
    const size = normalizeText(formData.get(`edition-size-${index}`));
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
        title: formData.get('title') || '',
        title_original: formData.get('titleOriginal') || '',
        authors: parseLines(formData.get('authors') || ''),
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
    parseLines(formData.get('authors') || '').forEach((entry) => addValues(entry));
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

        if (fieldName.startsWith('edition-issuers-') || fieldName.startsWith('edition-translators-')) {
            addValues(field.value);
        }
    });

    return terms;
}

function buildBookIndexPayload(formData, existingBookIndex = existingBookIndexEntries) {
    const bookId = getBookSlugFromFormData(formData);
    const detailPath = `data/book/${bookId}.json`;
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
    const detailPath = `data/book/${bookId}.json`;
    const searchText = collectSearchTextTerms(formData).join(' ');
    const existingEntry = Array.isArray(existingBookIndexEntries)
        ? existingBookIndexEntries.find((entry) => entry && entry.detail === detailPath)
        : null;

    return {
        detail: detailPath,
        search_text: searchText,
        updated_at: existingEntry?.updated_at || new Date().toISOString().slice(0, 10)
    };
}

function buildAuthorPayload(formData, existingAuthors = existingAuthorEntries) {
    const authors = parseLines(formData.get('authors') || '');
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
    const authors = parseLines(formData.get('authors') || '');
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

function getDownloadFileName(formData, suffix = '') {
    const slug = getBookSlugFromFormData(formData) || 'book';
    const normalizedSuffix = normalizeText(suffix);
    if (!normalizedSuffix) {
        return `${slug}.json`;
    }

    return `${slug}.${normalizedSuffix}.json`;
}

async function refreshExistingIndexState(force = false) {
    if (!force && existingIndexStatePromise) {
        return existingIndexStatePromise;
    }

    existingIndexStatePromise = (async () => {
        try {
            const response = await fetch('/api/index-state', { cache: 'no-store' });
            if (!response.ok) {
                throw new Error('Unable to load index state');
            }

            const payload = await response.json();
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

        renderOutputs();
        return {
            bookIndex: existingBookIndexEntries,
            authors: existingAuthorEntries,
            series: existingSeriesEntries
        };
    })();

    return existingIndexStatePromise;
}

function renderOutputs() {
    updateSlugPreview();

    const formData = new FormData(form);
    const bookDetailPayload = buildBookDetailPayload(formData);
    const bookIndexReviewPayload = buildBookIndexReviewPayload(formData);
    const authorsReviewPayload = buildAuthorReviewPayload(formData);
    const seriesPayload = buildSeriesPayload(formData);

    updateEditionIdPreviews(formData);
    bookIndexOutput.textContent = JSON.stringify(bookIndexReviewPayload, null, 2);
    bookDetailOutput.textContent = JSON.stringify(bookDetailPayload, null, 2);
    authorsOutput.textContent = JSON.stringify(authorsReviewPayload, null, 2);
    seriesOutput.textContent = JSON.stringify(seriesPayload, null, 2);
}

function populateEditionCards(editions = []) {
    editionsContainer.innerHTML = '';
    editionCounter = 0;

    editionsContainer.appendChild(createEditionCard(editionCounter, {}));
    editionCounter += 1;

    sortEditionsByPubYear(editions).forEach((edition) => {
        editionsContainer.appendChild(createEditionCard(editionCounter, edition));
        editionCounter += 1;
    });
}

function populateFormFromBookDetail(detail) {
    if (!detail || typeof detail !== 'object') {
        return;
    }

    if (bookIdInput) {
        bookIdInput.value = detail.id || '';
    }

    const titleField = form.querySelector('[name="title"]');
    const titleOriginalField = form.querySelector('[name="titleOriginal"]');
    const authorsField = form.querySelector('[name="authors"]');
    const awardsField = form.querySelector('[name="awards"]');
    const seriesField = form.querySelector('[name="series"]');

    if (titleField) {
        titleField.value = detail.title || '';
    }
    if (titleOriginalField) {
        titleOriginalField.value = detail.title_original || '';
    }
    if (authorsField) {
        authorsField.value = Array.isArray(detail.authors) ? detail.authors.join('\n') : '';
    }
    if (awardsField) {
        awardsField.value = Array.isArray(detail.awards) ? detail.awards.join('\n') : '';
    }
    if (seriesField) {
        seriesField.value = Array.isArray(detail.series) ? detail.series.join('\n') : '';
    }

    populateEditionCards(detail.editions || []);
    setFormStatus(`Đã load dữ liệu cho ${detail.id || 'sách hiện có'}. Bạn có thể chỉnh sửa hoặc thêm bản phát hành mới.`, true);
    renderOutputs();
}

async function loadExistingBookBySlug(slug) {
    if (!slug) {
        return null;
    }

    const candidates = [
        `/api/books/${encodeURIComponent(slug)}`,
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

function scheduleLookup(force = false) {
    if (pendingLookupTimer) {
        window.clearTimeout(pendingLookupTimer);
    }

    const formData = new FormData(form);
    const slug = getBookSlugFromFormData(formData);
    if (!slug) {
        setFormStatus('Sách mới. Bạn có thể nhập thông tin ngay.', true);
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
            populateFormFromBookDetail(existingBook);
            return;
        }

        setFormStatus('Sách mới. Bạn có thể nhập thông tin và thêm editions mới.', true);
    }, 250);
}

async function persistGeneratedFiles(formData) {
    await refreshExistingIndexState(true);

    const bookId = getBookSlugFromFormData(formData);
    const bookDetailPayload = buildBookDetailPayload(formData);
    const bookIndexPayload = buildBookIndexPayload(formData);
    const authorPayload = buildAuthorPayload(formData);
    const seriesPayload = buildSeriesPayload(formData);

    const response = await fetch('/api/books/save', {
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

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    sanitizeFormValues(form);
    const formData = new FormData(form);
    renderOutputs();

    try {
        const persisted = await persistGeneratedFiles(formData);
        await refreshExistingIndexState(true);
        setFormStatus(`Đã cập nhật các file liên quan cho ${persisted.bookDetailPayload.id}.`, true);
    } catch (error) {
        setFormStatus(error.message || 'Không thể lưu trực tiếp vào workspace. Đã chuyển sang tải file JSON.', false);
        const bookId = getBookSlugFromFormData(formData);
        const baseName = bookId || 'book';
        downloadJson(`${baseName}.book-index.json`, buildBookIndexPayload(formData));
        downloadJson(`${baseName}.json`, buildBookDetailPayload(formData));
        downloadJson(`${baseName}.authors.json`, buildAuthorPayload(formData));
        downloadJson(`${baseName}.series.json`, buildSeriesPayload(formData));
    }
});

addEditionButton.addEventListener('click', () => {
    addEdition();
    renderOutputs();
});
resetButton.addEventListener('click', resetForm);

document.getElementById('download-book-index').addEventListener('click', async () => {
    sanitizeFormValues(form);
    const formData = new FormData(form);
    await refreshExistingIndexState(true);
    downloadJson(getDownloadFileName(formData, 'book-index'), buildBookIndexPayload(formData));
});

document.getElementById('download-book-detail').addEventListener('click', async () => {
    sanitizeFormValues(form);
    const formData = new FormData(form);
    await refreshExistingIndexState(true);
    downloadJson(getDownloadFileName(formData), buildBookDetailPayload(formData));
});

document.getElementById('download-authors').addEventListener('click', async () => {
    sanitizeFormValues(form);
    const formData = new FormData(form);
    await refreshExistingIndexState(true);
    downloadJson(getDownloadFileName(formData, 'authors'), buildAuthorPayload(formData));
});

document.getElementById('download-series').addEventListener('click', async () => {
    sanitizeFormValues(form);
    const formData = new FormData(form);
    await refreshExistingIndexState(true);
    downloadJson(getDownloadFileName(formData, 'series'), buildSeriesPayload(formData));
});

populateEditionCards([]);
updateSlugPreview();
renderOutputs();
refreshExistingIndexState();
scheduleLookup(true);
