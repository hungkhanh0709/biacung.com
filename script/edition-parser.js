(function () {
    // Lightweight free-text edition parser.
    // Exposes window.parseEditionText(text) -> parsed object

    function normalizeWhitespace(s) {
        return (s || '').replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim();
    }

    function cleanInlineText(s) {
        return normalizeWhitespace(String(s || '')
            .replace(/^['"*#_`]+|['"*#_`]+$/g, '')
            .replace(/^[-•]\s*/, '')
            .replace(/\*\*/g, '')
            .replace(/`/g, ''));
    }

    function extractLines(text) {
        return String(text || '').split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    }

    function findByLabel(lines, labelRegex) {
        for (const line of lines) {
            const m = line.match(labelRegex);
            if (m) {
                return line.replace(m[0], '').trim();
            }
        }
        return null;
    }

    function findAllMatches(regex, text) {
        const out = [];
        let m;
        const re = new RegExp(regex, 'gmi');
        while ((m = re.exec(text))) {
            out.push(m[1] || m[0]);
        }
        return out;
    }

    function parsePrice(raw) {
        if (!raw) return '';
        const text = String(raw).trim();
        if (!text) return '';

        const normalized = normalizeWhitespace(text.replace(/\s+/g, ''));
        const explicitCurrency = /(?:đ|₫|vnd|vnđ)/i.test(normalized);

        if (explicitCurrency) {
            const m = normalized.match(/([0-9.,]+)(?:\s*(k|đ|₫|d|vnd|vnđ))?/i);
            if (m) {
                const amount = m[1];
                if (/^(\d{1,3}(\.\d{3})+|\d{1,3}(,\d{3})+)$/.test(amount)) {
                    const digits = amount.replace(/[.,]/g, '');
                    const value = Number.parseInt(digits, 10);
                    if (Number.isFinite(value)) {
                        const thousands = value / 1000;
                        return `${Number.isInteger(thousands) ? thousands : thousands.toFixed(3).replace(/\.0+$/, '')}k`;
                    }
                }
                if (/\.000$/i.test(amount) || /,000$/i.test(amount)) {
                    const value = Number.parseInt(amount.replace(/[.,]000$/, ''), 10);
                    return Number.isFinite(value) ? `${value}k` : normalized;
                }
                return normalized;
            }
            return normalized;
        }

        const m = normalized.match(/([0-9,.]+)\s*(k|đ|d|vnd)?/i);
        if (!m) return normalizeWhitespace(text);
        let num = m[1].replace(/,/g, '').replace(/\./g, '');
        const currency = (m[2] || '').toLowerCase();
        const intVal = parseInt(num, 10) || 0;
        // If already marked with 'k' or ends with k, normalize to lowercase k form
        if (/k/i.test(currency) || /k$/i.test(normalized)) {
            return String(Math.round(intVal)).toLowerCase() + 'k';
        }
        // If VND-like currency or raw contains 'đ'/'vnd', convert large numbers to 'k'
        if (/đ|vnd|d/i.test(currency) || /đ|vnd/i.test(normalized)) {
            if (intVal >= 1000) {
                const k = Math.round(intVal / 1000 * 10) / 10; // keep one decimal if needed
                return (Number.isInteger(k) ? String(k) : String(k)).replace(/\.0$/, '') + 'k';
            }
            return String(intVal) + 'đ';
        }

        // Plain number without currency: if large, show as 'k'
        if (intVal >= 1000) {
            const k = Math.round(intVal / 1000 * 10) / 10;
            return (Number.isInteger(k) ? String(k) : String(k)).replace(/\.0$/, '') + 'k';
        }

        return String(intVal);
    }

    function parseYear(text) {
        const m = String(text || '').match(/(\b20\d{2}\b|\b19\d{2}\b)/);
        return m ? Number(m[0]) : null;
    }

    function parseWeight(text) {
        const m = String(text || '').match(/(\d+)\s*(g|gr|gram|grams)\b/i);
        return m ? Number(m[1]) : null;
    }

    function parseSize(text) {
        const m = String(text || '').match(/(\d+(?:[.,]\d+)?(?:\s*[x×]\s*\d+(?:[.,]\d+)?){1,2}(?:\s*(cm|mm|m))?)/i);
        return m ? m[1].replace(/\s+/g, ' ').replace("cm", "").trim() : null;
    }

    function parsePageCount(text) {
        const m = String(text || '').match(/(\b\d{2,4}\b)\s*(trang|pages|page)?/i);
        return m ? Number(m[1]) : null;
    }

    function parseISBN(text) {
        const m = String(text || '').match(/(97[89][- ]?[0-9][- 0-9]{8,})/i) || String(text || '').match(/\b(\d{13})\b/);
        return m ? m[1].replace(/\s+/g, '').trim() : null;
    }

    function parseAuthors(line) {
        // split by comma or 'và' or 'and'
        return String(line || '').split(/[,;]|\band\b|\bvà\b/gi).map(s => normalizeWhitespace(s)).filter(Boolean);
    }

    function extractPublisherFromText(text) {
        const source = String(text || '').trim();
        if (!source) {
            return null;
        }

        const formatPublisher = (value) => {
            const cleaned = normalizeWhitespace(value || '');
            if (!cleaned) return null;
            return /^(?:nxb|nhà xuất bản)\b/i.test(cleaned) ? cleaned : `NXB ${cleaned}`;
        };

        const pubMatch = source.match(/(?:NXB|Nhà xuất bản)\s+([^,;\.\n]+?)(?=\s+(?:và|and|công ty|cty|liên kết|ấn hành|phối hợp|phát hành|bởi|$))/iu);
        if (pubMatch) {
            let stripped = normalizeWhitespace(pubMatch[1]);
            stripped = stripped.replace(/\s+(?:và|and)\s+.+$/i, '');
            stripped = stripped.replace(/\b(?:liên kết|ấn hành|phối hợp|phát hành|bởi|công ty|cty|cổ phần|văn hóa)\b/gi, ' ');
            return formatPublisher(stripped);
        }

        const fallbackMatch = source.match(/(?:NXB|Nhà xuất bản)\s+(.+)/i);
        if (fallbackMatch) {
            return formatPublisher(fallbackMatch[1]);
        }

        let candidate = source.replace(/^(?:NXB|Nhà xuất bản)\s*/i, '').trim();
        candidate = candidate.replace(/\s+(?:và|and)\s+.+$/i, '').trim();
        candidate = candidate.replace(/\b(?:liên kết|ấn hành|phối hợp|phát hành|bởi|công ty|cty|cổ phần|văn hóa)\b/gi, ' ').trim();
        candidate = normalizeWhitespace(candidate);

        return candidate || null;
    }

    function extractIssuersFromText(text) {
        const source = String(text || '').trim();
        if (!source) {
            return [];
        }

        const knownIssuers = [
            ['Đông A', /đông a|dong a/i],
            ['Fahasa', /fahasa/i],
            ['Vinabook', /vinabook/i],
            ['Tiki', /tiki/i]
        ];

        for (const [name, regex] of knownIssuers) {
            if (regex.test(source)) {
                return [name];
            }
        }

        const companyMatch = source.match(/(?:công ty|cty)(?:\s+cổ\s+phần)?\s+([^,;\.\n]+?)(?=\s+(?:liên kết|ấn hành|phát hành|$))/iu);
        if (companyMatch) {
            let candidate = normalizeWhitespace(companyMatch[1]);
            candidate = candidate.replace(/^(?:văn hóa|sách|nhà sách)\s+/i, '');
            const words = candidate.split(/\s+/).filter(Boolean);
            if (words.length) {
                const selected = words.slice(-2).join(' ');
                if (selected && !/\b(?:nxb|nhà xuất bản|liên kết|ấn hành|phối hợp|bởi|phát hành|văn học)\b/i.test(selected)) {
                    return [selected];
                }
            }
        }

        return [];
    }

    function parse(text) {
        const raw = String(text || '');
        const lines = extractLines(raw);
        const joined = lines.join('\n');

        const result = {
            title: null,
            sku: null,
            isbn: null,
            authors: [],
            translators: [],
            illustrators: [],
            publisher: null,
            issuers: [],
            pub_year: null,
            language: null,
            weight_g: null,
            size_cm: null,
            page_count: null,
            format: null,
            cover_price: null,
            detail: null
        };

        // try labels
        const easyLabel = (labels) => {
            for (const lbl of labels) {
                const v = findByLabel(lines, new RegExp('^\\s*' + lbl + '[:\s]*', 'i'));
                if (v) return v;
            }
            return null;
        };

        result.sku = easyLabel(['Mã sản phẩm', 'Mã hàng', 'Mã SP', 'Mã']);
        if (!result.sku) {
            const skuMatch = raw.match(/\b(\d{8,13})\b/);
            if (skuMatch) result.sku = skuMatch[1];
        }

        const isbnLabel = easyLabel(['Mã ISBN', 'ISBN', 'Mã sách']);
        result.isbn = isbnLabel || parseISBN(raw);

        const titleLine = lines.find(l => /^(Tựa đề|Tên|Title|Cha con|\S.+)$/i.test(l) && !/Tác giả|Người dịch|NXB|Năm|Số trang|Kích thước|Giá bìa|Mã sản phẩm|ISBN|Bìa|Hình thức|Giá/i.test(l));
        if (titleLine) {
            // if contains colon, split
            result.title = cleanInlineText(titleLine.replace(/^(Tựa đề|Title|Tên|Tên sách|Mã sản phẩm)[:\s-]*/i, ''));
            // avoid detecting long description lines; prefer first non-label line
        }

        // Authors
        const authorsLabel = easyLabel(['Tác giả', 'Tác giả:', 'Tác giả\:', 'Author', 'Tác giả|Người viết']);
        if (authorsLabel) {
            result.authors = parseAuthors(authorsLabel);
        } else {
            const aLine = lines.find(l => /Tác giả|Tác giả:|Tác giả\b|Author\b/i.test(l));
            if (aLine) result.authors = parseAuthors(aLine.replace(/.*?:/, '').trim());
        }

        // Translators
        const trLabel = easyLabel(['Người Dịch', 'Người dịch', 'Người dịch:', 'Dịch giả']);
        if (trLabel) result.translators = parseAuthors(trLabel);

        // Illustrators
        const illustratorLabel = easyLabel(['Minh họa', 'Minh họa:', 'Illustrator', 'Illustrators']);
        if (illustratorLabel) {
            result.illustrators = parseAuthors(illustratorLabel);
        } else {
            const illLine = lines.find(l => /Minh họa|Illustrator|Illustrators/i.test(l));
            if (illLine) {
                result.illustrators = parseAuthors(illLine.replace(/.*?:/, '').trim());
            }
        }

        // Publisher: prefer the full raw text so explicit 'NXB ...' phrases are detected,
        // then fall back to the extracted label value when needed.
        const pubLabel = easyLabel(['NXB', 'NXB:', 'Nhà Xuất Bản', 'Nhà xuất bản', 'Nhà xuất bản:']);
        result.publisher = extractPublisherFromText(raw);
        if (!result.publisher && pubLabel) {
            result.publisher = extractPublisherFromText(pubLabel);
        }

        // Issuers / Suppliers
        const issuerLabel = easyLabel(['Nhà Cung Cấp', 'Nhà cung cấp', 'Cty phát hành', 'Công ty', 'Sách do', 'Phát hành bởi', 'Phát hành']);
        result.issuers = extractIssuersFromText(issuerLabel || raw);

        // Year
        const yearLabel = easyLabel(['Năm XB', 'Năm xuất bản', 'Phát hành', 'Phát hành:']);
        result.pub_year = parseYear(yearLabel || raw);

        // Language
        const lang = easyLabel(['Ngôn Ngữ', 'Ngôn ngữ', 'Language']);
        if (lang) result.language = normalizeWhitespace(lang);

        // Weight
        const weightLine = easyLabel(['Trọng lượng', 'Trọng lượng (gr)', 'Trọng lượng:']) || findByLabel(lines, /trọng lượng[:\s]*/i);
        result.weight_g = parseWeight(weightLine || raw);

        // Size
        const sizeLine = easyLabel(['Kích Thước', 'Kích thước', 'Kích Thước Bao Bì', 'Kích thước:']) || findByLabel(lines, /kích thước[:\s]*/i);
        result.size_cm = parseSize(sizeLine || raw);

        // Pages
        const pagesLine = easyLabel(['Số trang', 'Số trang:', 'Pages', 'Số trang:']) || findByLabel(lines, /số trang[:\s]*/i);
        result.page_count = parsePageCount(pagesLine || raw);

        // Format
        const fmt = easyLabel(['Hình thức', 'Hình thức bìa', 'Hình thức:', 'Bìa']);
        if (fmt) result.format = normalizeWhitespace(fmt);
        else {
            const fmtLine = lines.find(l => /Bìa Mềm|Bìa mềm|Bìa cứng|Hardcover|paperback|hình thức|Hình thức/i.test(l));
            if (fmtLine) result.format = fmtLine.replace(/.*?:/, '').trim();
        }

        // Price
        const priceLabel = easyLabel(['Giá bìa', 'Giá bìa:', 'Giá', 'Giá bán']);
        result.cover_price = parsePrice(priceLabel || raw);

        // ISBN fallback
        if (!result.isbn) {
            result.isbn = parseISBN(raw);
        }

        // Post-process: normalize format display (capitalize words) and keep issuers concise
        if (result.format) {
            // Normalize format: keep 'Bìa' prefix when present (e.g., 'Bìa: Bìa mềm' -> 'Bìa mềm')
            const hadBia = /^bìa[:\s-]*/i.test(result.format);
            let fmt = result.format.replace(/^bìa[:\s-]*/i, '').trim();
            // fmt = fmt.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            result.format = hadBia ? `Bìa ${fmt}` : fmt;
        }

        return result;
    }

    // expose to browser and other globals (globalThis preferred)
    try {
        if (typeof globalThis !== 'undefined') {
            globalThis.parseEditionText = parse;
        } else if (typeof window !== 'undefined') {
            window.parseEditionText = parse;
        }
        if (typeof module !== 'undefined' && module.exports) {
            module.exports = { parseEditionText: parse };
        }
        console.debug && console.debug('edition-parser: parseEditionText attached');
    } catch (err) {
        if (typeof console !== 'undefined' && console.error) {
            console.error('edition-parser: failed to attach parseEditionText', err);
        }
    }
})();
