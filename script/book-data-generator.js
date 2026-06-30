const form = document.getElementById('book-form');
const editionsContainer = document.getElementById('editions-container');
const addEditionButton = document.getElementById('add-edition');
const resetButton = document.getElementById('reset-form');

setNoHistoryBehavior(form);

const bookIndexOutput = document.getElementById('book-index-output');
const bookDetailOutput = document.getElementById('book-detail-output');
const authorsOutput = document.getElementById('authors-output');
const seriesOutput = document.getElementById('series-output');

let editionCounter = 0;

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

function normalizePublisher(value) {
    const normalized = normalizeText(value);
    if (!normalized) {
        return '';
    }

    const lowerValue = normalized.toLowerCase();
    if (lowerValue.startsWith('nxb') || lowerValue.startsWith('nhà xuất bản')) {
        return normalized;
    }

    return `NXB ${normalized}`;
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

        const trimmedValue = normalizeText(field.value);
        if (trimmedValue !== field.value) {
            field.value = trimmedValue;
        }
    });
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

function buildSlugFromFormData(formData) {
    const title = (formData.get('title') || '').trim();
    const titleOriginal = (formData.get('titleOriginal') || '').trim();
    const authors = parseLines(formData.get('authors') || '');
    const authorName = authors[0] || '';
    const baseText = `${authorName} ${titleOriginal || title}`.trim();
    return slugify(baseText);
}

function createEditionCard(index = editionCounter) {
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

    const removeButton = card.querySelector('.remove-edition');
    removeButton.addEventListener('click', () => {
        card.remove();
        renderOutputs();
    });

    return card;
}

function addEdition() {
    editionsContainer.appendChild(createEditionCard(editionCounter));
    editionCounter += 1;
}

function resetForm() {
    form.reset();
    editionsContainer.innerHTML = '';
    editionCounter = 0;
    renderOutputs();
}

function buildEditionFromFormData(formData, index) {
    const isbn = normalizeText(formData.get(`edition-isbn-${index}`));
    const caption = normalizeText(formData.get(`edition-caption-${index}`));
    const pubYear = normalizeText(formData.get(`edition-pub-year-${index}`));
    const publisher = normalizePublisher(formData.get(`edition-publisher-${index}`));
    const issuers = parseLines(formData.get(`edition-issuers-${index}`) || '');
    const translators = parseLines(formData.get(`edition-translators-${index}`) || '');
    const illustrators = parseLines(formData.get(`edition-illustrators-${index}`) || '');
    const proofreaders = parseLines(formData.get(`edition-proofreaders-${index}`) || '');
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

    const edition = {
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

    return edition;
}

function buildBookDetailPayload(formData) {
    const title = formData.get('title') || '';
    const bookId = formData.get('bookId')?.trim() || buildSlugFromFormData(formData) || slugify(title);
    const editions = [];
    const inputs = Array.from(form.elements).filter((el) => el.name && el.name.startsWith('edition-caption-'));

    inputs.forEach((_, index) => {
        const edition = buildEditionFromFormData(formData, index);
        if (edition.caption || edition.publisher || edition.format) {
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
        editions,
        updated_at: new Date().toISOString().slice(0, 10)
    };
}

function buildBookIndexPayload(formData) {
    const title = formData.get('title') || '';
    const bookId = formData.get('bookId')?.trim() || buildSlugFromFormData(formData) || slugify(title);
    const detailPath = `data/book/${bookId}.json`;
    return [{
        detail: detailPath,
        search_text: `${formData.get('title') || ''} ${formData.get('titleOriginal') || ''} ${formData.get('authors') || ''}`.toLowerCase().normalize('NFD').replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/g, ' ').trim(),
        updated_at: new Date().toISOString().slice(0, 10)
    }];
}

function buildAuthorPayload(formData) {
    const authors = parseLines(formData.get('authors') || '');
    const title = formData.get('title') || '';
    const bookId = formData.get('bookId')?.trim() || buildSlugFromFormData(formData) || slugify(title);
    return authors.map((name) => ({
        id: slugify(name),
        name,
        work_ids: [bookId]
    }));
}

function buildSeriesPayload(formData) {
    const seriesNames = parseLines(formData.get('series') || '');
    const title = formData.get('title') || '';
    const bookId = formData.get('bookId')?.trim() || buildSlugFromFormData(formData) || slugify(title);

    if (seriesNames.length <= 1) {
        const [name] = seriesNames;
        if (!name) {
            return {};
        }
        return {
            id: slugify(name),
            name,
            description: 'Collection introducing...',
            thumbnail: '',
            work_ids: [bookId]
        };
    }

    return seriesNames.map((name) => ({
        id: slugify(name),
        name,
        description: 'Collection introducing...',
        thumbnail: '',
        work_ids: [bookId]
    }));
}

function renderOutputs() {
    sanitizeFormValues(form);

    const formData = new FormData(form);
    const bookDetailPayload = buildBookDetailPayload(formData);
    const bookIndexPayload = buildBookIndexPayload(formData);
    const authorsPayload = buildAuthorPayload(formData);
    const seriesPayload = buildSeriesPayload(formData);

    bookIndexOutput.textContent = JSON.stringify(bookIndexPayload, null, 2);
    bookDetailOutput.textContent = JSON.stringify(bookDetailPayload, null, 2);
    authorsOutput.textContent = JSON.stringify(authorsPayload, null, 2);
    seriesOutput.textContent = JSON.stringify(seriesPayload, null, 2);
}

form.addEventListener('input', (event) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        const trimmedValue = normalizeText(event.target.value);
        if (trimmedValue !== event.target.value) {
            event.target.value = trimmedValue;
        }
    }

    renderOutputs();
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

form.addEventListener('submit', (event) => {
    event.preventDefault();
    renderOutputs();
});

addEditionButton.addEventListener('click', addEdition);
resetButton.addEventListener('click', resetForm);

document.getElementById('download-book-index').addEventListener('click', () => {
    sanitizeFormValues(form);
    const formData = new FormData(form);
    downloadJson('book.json', buildBookIndexPayload(formData));
});

document.getElementById('download-book-detail').addEventListener('click', () => {
    sanitizeFormValues(form);
    const formData = new FormData(form);
    downloadJson('book-detail.json', buildBookDetailPayload(formData));
});

document.getElementById('download-authors').addEventListener('click', () => {
    sanitizeFormValues(form);
    const formData = new FormData(form);
    downloadJson('author.json', buildAuthorPayload(formData));
});

document.getElementById('download-series').addEventListener('click', () => {
    sanitizeFormValues(form);
    const formData = new FormData(form);
    downloadJson('series.json', buildSeriesPayload(formData));
});

addEdition();
renderOutputs();
