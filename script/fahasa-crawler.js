(function (root, factory) {
    const api = factory();

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }

    if (root && typeof root === 'object') {
        root.FahasaCrawler = api;
    }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    function normalizeText(value) {
        return (value == null ? '' : String(value)).trim();
    }

    function normalizeWhitespace(value) {
        return normalizeText(value).replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim();
    }

    function decodeHtmlEntities(value) {
        return normalizeText(value)
            .replace(/&nbsp;/gi, ' ')
            .replace(/&amp;/gi, '&')
            .replace(/&quot;/gi, '"')
            .replace(/&#39;/g, "'")
            .replace(/&lt;/gi, '<')
            .replace(/&gt;/gi, '>')
            .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
            .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(Number.parseInt(code, 16)));
    }

    function stripMarkdownLinks(value) {
        return normalizeText(value)
            .replace(/\[([^\]]+)\]\((?:[^()\\]|\\.|(?:\([^()\\]*\)))*\)/g, '$1')
            .replace(/!\[([^\]]*)\]\((?:[^()\\]|\\.|(?:\([^()\\]*\)))*\)/g, '$1');
    }

    function stripLeadingLabel(value) {
        return normalizeWhitespace(value)
            .replace(/^(?:title|tên|tựa đề|name)\s*[:\-]\s*/i, '')
            .trim();
    }

    function escapeRegex(value) {
        return normalizeText(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function stripHtml(html) {
        let text = normalizeText(html);

        text = text
            .replace(/<!--[\s\S]*?-->/g, ' ')
            .replace(/<script[\s\S]*?<\/script>/gi, ' ')
            .replace(/<style[\s\S]*?<\/style>/gi, ' ')
            .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
            .replace(/<(br|\/p|\/div|\/li|\/tr|\/td|\/th|\/h[1-6]|\/section|\/article|\/header|\/footer|\/table|\/ul|\/ol|\/dd|\/dt)\b[^>]*>/gi, '\n')
            .replace(/<[^>]+>/g, ' ');

        text = decodeHtmlEntities(text);
        text = stripMarkdownLinks(text);
        text = text.replace(/\r/g, '\n').replace(/\u00A0/g, ' ');
        return text
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
            .join('\n');
    }

    function slugify(value) {
        return normalizeText(value)
            .toLowerCase()
            .replace(/đ/g, 'd')
            .normalize('NFD')
            .replace(/\p{M}/gu, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    function toTitleCase(value) {
        const normalized = normalizeWhitespace(value);
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
        return normalizeWhitespace(value)
            .replace(/^sách\s*[:\-]?\s+/i, '')
            .trim();
    }

    function extractAttr(tagHtml, attrName) {
        const match = normalizeText(tagHtml).match(new RegExp(`${attrName}\\s*=\\s*["']([^"']+)["']`, 'i'));
        return match ? decodeHtmlEntities(match[1]) : '';
    }

    function resolveUrl(url, baseUrl) {
        if (!url) {
            return '';
        }

        try {
            return new URL(url, baseUrl || 'https://www.fahasa.com/').toString();
        } catch (error) {
            return url;
        }
    }

    function stripTagsForTitle(text) {
        return normalizeWhitespace(String(text || '').replace(/<[^>]+>/g, ' '));
    }

    function extractTagInnerText(html, selectorRegex) {
        const match = normalizeText(html).match(selectorRegex);
        return match ? normalizeWhitespace(stripHtml(match[1])) : '';
    }

    function extractTextLines(source) {
        return stripHtml(source)
            .split('\n')
            .map((line) => normalizeWhitespace(line))
            .filter(Boolean);
    }

    function extractMetaContent(html, key, attrName = 'property') {
        const match = normalizeText(html).match(new RegExp(`<meta[^>]+${attrName}\\s*=\\s*["']${key}["'][^>]+content\\s*=\\s*["']([^"']+)["']`, 'i'))
            || normalizeText(html).match(new RegExp(`<meta[^>]+content\\s*=\\s*["']([^"']+)["'][^>]+${attrName}\\s*=\\s*["']${key}["']`, 'i'));
        return match ? decodeHtmlEntities(match[1]) : '';
    }

    function extractLinesFromHtml(html) {
        return stripHtml(html)
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean);
    }

    function matchLineValue(line, label) {
        const regex = new RegExp(`^\\s*${escapeRegex(label)}(?:\\s*[:\\-]?\\s*|\\s+|$)(.*)$`, 'i');
        const match = line.match(regex);
        return match ? normalizeWhitespace(match[1]) : '';
    }

    function matchPipeTableValue(line, label) {
        const value = normalizeWhitespace(line);
        if (!value.includes('|')) {
            return '';
        }

        const cells = value
            .split('|')
            .map((cell) => normalizeWhitespace(cell))
            .filter(Boolean);

        for (let index = 0; index < cells.length; index += 1) {
            const cell = cells[index];
            if (cell.toLowerCase() !== label.toLowerCase() && !new RegExp(`^${escapeRegex(label)}(?:\\s*[:\\-]?\\s*|\\s+|$)`, 'i').test(cell)) {
                continue;
            }

            for (let nextIndex = index + 1; nextIndex < cells.length; nextIndex += 1) {
                if (cells[nextIndex]) {
                    return cells[nextIndex];
                }
            }
        }

        return '';
    }

    function findLabelValue(lines, labels) {
        for (let index = 0; index < lines.length; index += 1) {
            const line = normalizeWhitespace(lines[index]);

            for (const label of labels) {
                const pipeDelimited = matchPipeTableValue(line, label);
                if (pipeDelimited) {
                    return pipeDelimited;
                }

                const direct = matchLineValue(line, label);
                if (direct) {
                    return direct;
                }

                const labelRegex = new RegExp(`^\\s*${escapeRegex(label)}(?:\\s*[:\\-]?\\s*|\\s+|$)$`, 'i');
                if (labelRegex.test(line)) {
                    for (let offset = index + 1; offset < lines.length; offset += 1) {
                        const nextLine = normalizeWhitespace(lines[offset]);
                        if (nextLine) {
                            return nextLine;
                        }
                    }
                }

                if (line.toLowerCase() === label.toLowerCase()) {
                    for (let offset = index + 1; offset < lines.length; offset += 1) {
                        const nextLine = normalizeWhitespace(lines[offset]);
                        if (nextLine) {
                            return nextLine;
                        }
                    }
                }
            }
        }

        return '';
    }

    function extractLabelValueFromText(text, labels) {
        const source = normalizeWhitespace(stripMarkdownLinks(text));
        if (!source) {
            return '';
        }

        for (const label of labels) {
            const match = source.match(new RegExp(`(?:^|\\n|\\s)${escapeRegex(label)}(?:\\s*[:\\-]?\\s*|\\s+)([^\\n]+)`, 'i'));
            if (match && normalizeWhitespace(match[1])) {
                return normalizeWhitespace(match[1]);
            }
        }

        return '';
    }

    function extractPipeDelimitedValue(source, labels) {
        const lines = stripMarkdownLinks(stripHtml(source))
            .split('\n')
            .map((line) => normalizeWhitespace(line))
            .filter(Boolean);

        for (const line of lines) {
            if (!line.includes('|')) {
                continue;
            }

            const cells = line
                .split('|')
                .map((cell) => normalizeWhitespace(cell))
                .filter(Boolean);

            for (let index = 0; index < cells.length; index += 1) {
                const cell = cells[index];
                for (const label of labels) {
                    if (cell.toLowerCase() === label.toLowerCase() || new RegExp(`^${escapeRegex(label)}\\s*[:\\-]?`, 'i').test(cell)) {
                        for (let nextIndex = index + 1; nextIndex < cells.length; nextIndex += 1) {
                            if (cells[nextIndex]) {
                                return cells[nextIndex];
                            }
                        }
                    }
                }
            }
        }

        return '';
    }

    function extractFirstMatchingLine(lines, regexes) {
        for (const line of lines) {
            for (const regex of regexes) {
                if (regex.test(line)) {
                    return normalizeWhitespace(line);
                }
            }
        }

        return '';
    }

    function splitAuthors(value) {
        return stripLeadingLabel(stripMarkdownLinks(value))
            .split(/[,;]|\band\b|\bvà\b/gi)
            .map((entry) => normalizeWhitespace(entry))
            .filter(Boolean);
    }

    function parseYearFromText(text) {
        const source = normalizeWhitespace(text);
        if (!source) {
            return null;
        }

        const monthYearMatch = source.match(/\b\d{1,2}[\/.-](19\d{2}|20\d{2})\b/);
        if (monthYearMatch) {
            return Number(monthYearMatch[1]);
        }

        const labelMatch = source.match(/(?:năm xb|năm xuất bản|phát hành|published|publication year|pub(?:lished|\.?)?)\D{0,20}(?:\b\d{1,2}[\/.-])?(19\d{2}|20\d{2})/i);
        if (labelMatch) {
            return Number(labelMatch[1]);
        }

        const yearMatches = [...source.matchAll(/\b(19\d{2}|20\d{2})\b/g)].map((match) => Number(match[1]));
        if (!yearMatches.length) {
            return null;
        }

        if (yearMatches.length === 1) {
            return yearMatches[0];
        }

        return null;
    }

    function extractYearFromLabelledLines(lines, labels) {
        const labelSet = Array.isArray(labels) ? labels : [];

        for (let index = 0; index < lines.length; index += 1) {
            const line = normalizeWhitespace(lines[index]);
            if (!line) {
                continue;
            }

            for (const label of labelSet) {
                const labelRegex = new RegExp(`^\\s*${escapeRegex(label)}(?:\\s*[:\\-]?\\s*|\\s+|$)`, 'i');
                if (!labelRegex.test(line)) {
                    continue;
                }

                const directYear = parseYearFromText(line);
                if (directYear) {
                    return directYear;
                }

                for (let offset = index + 1; offset < Math.min(lines.length, index + 4); offset += 1) {
                    const candidate = normalizeWhitespace(lines[offset]);
                    if (!candidate) {
                        continue;
                    }

                    const parsedYear = parseYearFromText(candidate);
                    if (parsedYear) {
                        return parsedYear;
                    }
                }
            }
        }

        return null;
    }

    function parseWeightFromText(text) {
        const source = normalizeWhitespace(text);
        if (!source) {
            return null;
        }

        const labelMatch = source.match(/(?:trọng lượng(?:\s*\(gr\))?|weight|gross weight)\D*(\d{2,5})\s*(?:gr|g|gram|grams)?/i);
        if (labelMatch) {
            return Number(labelMatch[1]);
        }

        if (/^\d{2,5}$/.test(source)) {
            return Number(source);
        }

        const genericMatch = source.match(/\b(\d{2,5})\s*(?:gr|g|gram|grams)\b/i);
        return genericMatch ? Number(genericMatch[1]) : null;
    }

    function parsePageCountFromText(text) {
        const source = normalizeWhitespace(text);
        if (!source) {
            return null;
        }

        const labelMatch = source.match(/(?:số trang|pages?|page count)\D*(\d{1,5})/i);
        if (labelMatch) {
            return Number(labelMatch[1]);
        }

        if (/^\d{1,5}$/.test(source)) {
            return Number(source);
        }

        const genericMatch = source.match(/\b(\d{1,5})\s*(?:trang|pages?|page)\b/i);
        return genericMatch ? Number(genericMatch[1]) : null;
    }

    function parseSizeFromText(text) {
        const source = normalizeWhitespace(text);
        if (!source) {
            return '';
        }

        const labelMatch = source.match(/(?:kích thước(?: bao bì)?|size|dimensions?)\D*([0-9]+(?:[.,][0-9]+)?(?:\s*[x×]\s*[0-9]+(?:[.,][0-9]+)?){1,2})\s*(?:cm|mm|m)?/i);
        const raw = labelMatch ? labelMatch[1] : (source.match(/([0-9]+(?:[.,][0-9]+)?(?:\s*[x×]\s*[0-9]+(?:[.,][0-9]+)?){1,2})\s*(?:cm|mm|m)\b/i)?.[1] || '');
        return normalizeWhitespace(raw).replace(/\s*[x×]\s*/g, 'x').trim();
    }

    function normalizeEnglishTitle(value) {
        const normalized = stripLeadingLabel(stripMarkdownLinks(value));
        if (!normalized) {
            return '';
        }

        const stopWords = new Set(['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'from', 'in', 'of', 'on', 'or', 'the', 'to', 'via', 'with']);
        return normalized
            .split(/(\s+)/)
            .map((token, index) => {
                if (/^\s+$/.test(token)) {
                    return token;
                }

                const lower = token.toLowerCase();
                if (index !== 0 && stopWords.has(lower)) {
                    return lower;
                }

                return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
            })
            .join('');
    }

    function normalizePublisher(value) {
        const cleaned = stripLeadingLabel(stripMarkdownLinks(value));
        if (!cleaned) {
            return '';
        }

        if (/^(?:nxb|nhà xuất bản)\b/i.test(cleaned)) {
            return normalizeWhitespace(cleaned).replace(/^nhà xuất bản\s*/i, 'NXB ').replace(/^nxb\s*/i, 'NXB ');
        }

        return `NXB ${cleaned}`.replace(/\s+/g, ' ').trim();
    }

    function isNoiseTitleLine(line) {
        const value = normalizeWhitespace(line);
        if (!value) {
            return true;
        }

        return /^(?:special price|regular price|đã bán|sản phẩm tạm hết hàng|sản phẩm bán chạy nhất|thông tin chi tiết|mô tả sản phẩm|xem thêm các sản phẩm tương tự|giá sản phẩm|nhà cung cấp|tác giả|nhà xuất bản|hình thức bìa|hình thức|mã hàng|năm xb|trọng lượng|kích thước|số trang|sản phẩm liên quan|fahasa giới thiệu)$/i.test(value)
            || /^(?:\d+(?:[.,]\d+)?\s*[đk%/-].*|.*\d+(?:[.,]\d+)?\s*đ)$/i.test(value)
            || /^(?:\d+\s*[:/]\s*)+\d+$/.test(value);
    }

    function parsePrice(raw) {
        const text = normalizeWhitespace(raw);
        if (!text) {
            return '';
        }

        const compact = text.replace(/\s+/g, '');
        const numeric = compact.match(/([0-9][0-9.,]*)/);
        if (!numeric) {
            return text;
        }

        const amount = numeric[1];
        const lower = compact.toLowerCase();
        const prefersK = /k|kđ|k₫/.test(lower);

        if (prefersK) {
            const value = Number.parseFloat(amount.replace(/\./g, '').replace(/,/g, '.'));
            if (Number.isFinite(value)) {
                return `${String(value).replace(/\.0+$/, '')}k`;
            }
        }

        const integer = Number.parseInt(amount.replace(/[.,]/g, ''), 10);
        if (!Number.isFinite(integer)) {
            return text;
        }

        if (/vnd|vnđ|đ|₫/.test(lower) || integer >= 1000) {
            const k = integer / 1000;
            return `${Number.isInteger(k) ? String(k) : String(Math.round(k * 10) / 10).replace(/\.0$/, '')}k`;
        }

        return String(integer);
    }

    function extractCoverPrice(lines, html) {
        const text = normalizeWhitespace(html);
        const regularMatch = text.match(/Regular Price:?\s*([0-9.,]+)\s*đ?/i);
        if (regularMatch) {
            return parsePrice(regularMatch[1]);
        }

        const regularLabel = findLabelValue(lines, ['Giá bìa', 'Giá bán', 'Giá sản phẩm']);
        if (regularLabel) {
            return parsePrice(regularLabel);
        }

        const specialMatch = text.match(/Special Price:?\s*([0-9.,]+)\s*đ?/i);
        if (specialMatch) {
            return parsePrice(specialMatch[1]);
        }

        return '';
    }

    function extractTitleInfo(source) {
        const rawSource = normalizeText(source);
        const h1Match = rawSource.match(/<h1[^>]*id=["']fhs_name_product_desktop["'][^>]*>([\s\S]*?)<\/h1>/i)
            || rawSource.match(/<h1[^>]*class=["'][^"']*\bfhs_name_product_desktop\b[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i);
        const metaTitle = extractMetaContent(rawSource, 'og:title') || rawSource.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '';
        let rawTitle = normalizeWhitespace(stripHtml(h1Match ? h1Match[1] : metaTitle)).replace(/\s*-\s*FAHASA\.COM$/i, '');
        if (!rawTitle) {
            const lines = extractTextLines(rawSource);
            const fallbackLine = lines.find((line) => !isNoiseTitleLine(line) && /[a-zà-ỹ]/i.test(line)) || '';
            rawTitle = stripTagsForTitle(fallbackLine || '');
        }

        rawTitle = stripLeadingLabel(stripMarkdownLinks(rawTitle));

        const parts = rawTitle.split(/\s+-\s+/).map((part) => normalizeWhitespace(part)).filter(Boolean);
        const formatLike = /^(bìa|hardcover|paperback|phiên bản|kèm|bản in|sách|book|limited|special|deluxe)/i;
        const usableParts = [];

        for (let index = 0; index < parts.length; index += 1) {
            const part = parts[index];
            if (formatLike.test(part)) {
                break;
            }
            usableParts.push(part);
            if (usableParts.length === 2) {
                const nextPart = parts[index + 1];
                if (nextPart && formatLike.test(nextPart)) {
                    break;
                }
            }
        }

        const title = normalizeBookTitle(stripLeadingLabel(usableParts[0] || parts[0] || rawTitle));
        const title_original = normalizeEnglishTitle(usableParts[1] || '');

        return {
            title: title || '',
            title_original: title_original || ''
        };
    }

    function extractThumbnail(source, pageUrl) {
        const rawSource = normalizeText(source);
        const imageCandidates = [];
        const pushCandidate = (value) => {
            const url = normalizeText(value);
            if (url && !imageCandidates.includes(url)) {
                imageCandidates.push(url);
            }
        };

        const imageMatch = rawSource.match(/<img[^>]*class=["'][^"']*\bfhs-p-img\b[^"']*["'][^>]*>/i)
            || rawSource.match(/<img[^>]*class=["'][^"']*\bproduct-image\b[^"']*["'][^>]*>/i)
            || rawSource.match(/<img[^>]*>/i);

        if (!imageMatch) {
            const metaImage = extractMetaContent(rawSource, 'og:image');
            if (metaImage) {
                return resolveUrl(metaImage, pageUrl);
            }

            const urlMatches = rawSource.match(/https?:\/\/[^\s"'()<>]+?\.(?:jpg|jpeg|png|webp)(?:\?[^\s"'()]*)?/gi) || [];
            urlMatches.forEach(pushCandidate);

            const preferred = imageCandidates.find((url) => /\/media\/catalog\/product\//i.test(url) && !/\/wysiwyg\//i.test(url))
                || imageCandidates.find((url) => /cdn1\.fahasa\.com/i.test(url) && !/\/wysiwyg\//i.test(url))
                || imageCandidates.find((url) => /product\.hstatic\.net/i.test(url))
                || imageCandidates[0];
            if (preferred) {
                return preferred;
            }

            return metaImage ? resolveUrl(metaImage, pageUrl) : '';
        }

        const tag = imageMatch[0];
        const src = extractAttr(tag, 'src') || extractAttr(tag, 'data-src') || extractAttr(tag, 'data-original') || extractAttr(tag, 'data-lazy');
        if (src) {
            const baseUrl = src.startsWith('/') ? 'https://cdn1.fahasa.com/' : pageUrl;
            return resolveUrl(src, baseUrl);
        }

        const srcset = extractAttr(tag, 'srcset');
        if (srcset) {
            const firstCandidate = srcset.split(',')[0]?.trim().split(/\s+/)[0] || '';
            if (firstCandidate) {
                return resolveUrl(firstCandidate, pageUrl);
            }
        }

        const metaImage = extractMetaContent(rawSource, 'og:image');
        return metaImage ? resolveUrl(metaImage, pageUrl) : '';
    }

    function extractDescription(lines) {
        const headingIndex = lines.findIndex((line) => /^mô tả sản phẩm$/i.test(line));
        if (headingIndex === -1) {
            return '';
        }

        const collected = [];
        for (let index = headingIndex + 1; index < lines.length; index += 1) {
            const line = normalizeWhitespace(lines[index]);
            if (!line) {
                continue;
            }

            if (/^(thông tin chi tiết|sản phẩm liên quan|ưu đãi|điều kiện áp dụng|thông tin vận chuyển|gợi ý|sách mới|manga mới|light novel mới|đam mỹ mới)$/i.test(line)) {
                break;
            }

            collected.push(line);
            if (collected.length >= 8) {
                break;
            }
        }

        return collected.join('\n');
    }

    function normalizeFormat(value) {
        const cleaned = normalizeWhitespace(value)
            .replace(/^hình thức[:\s-]*/i, '')
            .replace(/^bìa\s*[:\-]?\s*/i, 'Bìa ')
            .replace(/^bìa\s+bìa\s+/i, 'Bìa ')
            .replace(/\s+/g, ' ')
            .trim();

        if (!cleaned) {
            return '';
        }

        const lowercased = cleaned.toLowerCase();
        return lowercased.charAt(0).toUpperCase() + lowercased.slice(1);
    }

    function extractBookId(title, titleOriginal, authors) {
        const authorName = Array.isArray(authors) ? authors[0] || '' : '';
        return slugify([authorName, titleOriginal || title].filter(Boolean).join(' '));
    }

    function buildEditionId(bookId, edition) {
        const year = edition.pub_year ? String(edition.pub_year) : '';
        const issuers = Array.isArray(edition.issuers) ? edition.issuers.join(' ') : normalizeText(edition.issuers);
        const price = edition.cover_price || '';
        return slugify([bookId, year, issuers, edition.format, price].filter(Boolean).join(' '));
    }

    function buildBookDetailFromHtml(source, pageUrl) {
        const titleInfo = extractTitleInfo(source);
        const lines = extractTextLines(source);
        const allText = normalizeWhitespace(stripMarkdownLinks(stripHtml(source)));

        const authors = splitAuthors(findLabelValue(lines, ['Tác giả', 'Author']) || extractLabelValueFromText(allText, ['Tác giả', 'Author']));
        const translators = splitAuthors(
            findLabelValue(lines, ['Người Dịch', 'Người dịch', 'Dịch giả', 'Translator', 'Translators'])
            || extractPipeDelimitedValue(source, ['Người Dịch', 'Người dịch', 'Dịch giả', 'Translator', 'Translators'])
        );
        const illustrators = splitAuthors(
            findLabelValue(lines, ['Minh họa', 'Minh họa:', 'Illustrator', 'Illustrators'])
            || extractPipeDelimitedValue(source, ['Minh họa', 'Minh họa:', 'Illustrator', 'Illustrators'])
        );
        const proofreaders = splitAuthors(
            findLabelValue(lines, ['Hiệu đính', 'Hiệu đính:', 'Proofreader', 'Proofreaders'])
            || extractPipeDelimitedValue(source, ['Hiệu đính', 'Hiệu đính:', 'Proofreader', 'Proofreaders'])
        );
        const publisher = normalizePublisher(findLabelValue(lines, ['NXB', 'Nhà xuất bản', 'Nhà Xuất Bản']));
        const issuers = splitAuthors(findLabelValue(lines, ['Nhà cung cấp', 'Nhà cung cấp:', 'Tên Nhà Cung Cấp', 'Cty phát hành', 'Công ty phát hành']) || extractLabelValueFromText(allText, ['Nhà cung cấp', 'Tên Nhà Cung Cấp', 'Cty phát hành', 'Công ty phát hành']));
        const pubYear = extractYearFromLabelledLines(lines, ['Năm XB', 'Năm xuất bản', 'Phát hành'])
            || parseYearFromText(findLabelValue(lines, ['Năm XB', 'Năm xuất bản', 'Phát hành']) || extractLabelValueFromText(allText, ['Năm XB', 'Năm xuất bản', 'Phát hành']));
        const weight = parseWeightFromText(findLabelValue(lines, ['Trọng lượng (gr)', 'Trọng lượng', 'Trọng lượng bao bì']) || allText);
        const size = parseSizeFromText(findLabelValue(lines, ['Kích Thước Bao Bì', 'Kích Thước', 'Kích thước']) || allText);
        const pageCount = parsePageCountFromText(findLabelValue(lines, ['Số trang', 'Pages']) || allText);
        let format = findLabelValue(lines, ['Hình thức', 'Phân loại']) || extractFirstMatchingLine(lines, [/^(Bìa\s+Cứng|Bìa\s+Mềm|Bìa\s+Da|Hardcover|Paperback)$/i]);
        const coverPrice = extractCoverPrice(lines, source);
        const thumbnail = extractThumbnail(source, pageUrl);
        const detail = extractDescription(lines);

        const normalizedSize = normalizeWhitespace(size).replace(/\s*cm$/i, '').replace(/\s*×\s*/g, ' x ').replace(/\s*x\s*/gi, ' x ').replace(/\s+/g, ' ').trim();
        const normalizedWeight = Number.isFinite(weight) ? weight : Number.parseInt(normalizeWhitespace(weight).replace(/[^\d]/g, ''), 10);
        const normalizedPageCount = Number.isFinite(pageCount) ? pageCount : Number.parseInt(normalizeWhitespace(pageCount).replace(/[^\d]/g, ''), 10);
        const normalizedYear = Number.isFinite(pubYear) ? pubYear : Number.parseInt(normalizeWhitespace(pubYear).replace(/[^\d]/g, ''), 10);
        const normalizedFormat = normalizeFormat(format);

        const bookId = extractBookId(titleInfo.title, titleInfo.title_original, authors);
        const edition = {
            isbn: null,
            caption: '',
            pub_year: Number.isFinite(normalizedYear) ? normalizedYear : null,
            publisher: publisher || '',
            issuers: issuers.length ? issuers : [],
            translators,
            illustrators,
            proofreaders,
            format: normalizedFormat || '',
            cover_price: coverPrice || '',
            print_run: null,
            page_count: Number.isFinite(normalizedPageCount) ? normalizedPageCount : null,
            copy_numbering: null,
            size_cm: normalizedSize || '',
            weight_g: Number.isFinite(normalizedWeight) ? normalizedWeight : null,
            thumbnail: thumbnail || '',
            gellery_imgs: [],
            detail: detail || ''
        };

        edition.id = buildEditionId(bookId, edition);

        return {
            id: bookId,
            title: titleInfo.title || '',
            title_original: titleInfo.title_original || '',
            authors,
            awards: [],
            series: [],
            editions: [edition],
            source_url: pageUrl || '',
            updated_at: new Date().toISOString().slice(0, 10)
        };
    }

    return {
        buildBookDetailFromHtml,
        extractTitleInfo,
        extractThumbnail,
        extractCoverPrice,
        stripHtml,
        slugify
    };
});
