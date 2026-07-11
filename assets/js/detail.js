const BOOK_FALLBACK_COVER = "assets/img/core/book-cover.png.avif";
const MAX_BOOK_ID_LENGTH = 120;
const SAFE_BOOK_ID = /^[a-z0-9-]+$/;

const params = new URLSearchParams(window.location.search);
const bookId = sanitizeSlugParam(params.get("id"));

const loadingNode = document.querySelector("[data-detail-loading]");
const contentNode = document.querySelector("[data-detail-content]");
const emptyNode = document.querySelector("[data-detail-empty]");
const titleNode = document.querySelector("[data-book-title]");
const originalNode = document.querySelector("[data-book-original]");
const pillsNode = document.querySelector("[data-book-pills]");
const heroCoverNode = document.querySelector("[data-book-cover]");
const editionsHeadingNode = document.querySelector("[data-editions-heading]");
const editionsGridNode = document.querySelector("[data-editions-grid]");
const focusCardNode = document.querySelector("[data-detail-focus-card]");
const editionKickerNode = document.querySelector("[data-edition-kicker]");
const editionTitleNode = document.querySelector("[data-edition-title]");
const editionCoverNode = document.querySelector("[data-edition-cover]");
const editionGalleryNode = document.querySelector("[data-edition-gallery]");
const editionMetaNode = document.querySelector("[data-edition-meta]");
const editionSummaryNode = document.querySelector("[data-edition-summary]");
const editionDescriptionNode = document.querySelector("[data-edition-description]");
const headerInput = document.querySelector("#site-search");
const mobileDetailLayoutQuery = window.matchMedia("(max-width: 44rem)");

let currentBook = null;
let activeEditionIndex = 0;
let activeImageIndex = 0;
let focusCardPulseTimer = 0;

const FOCUS_CARD_TOP_OFFSET = 20;
const FOCUS_CARD_VISIBLE_RATIO = 0.72;

function normalizeText(value) {
  return value == null ? "" : String(value).trim();
}

function sanitizeSlugParam(value) {
  const normalized = normalizeText(value)
    .toLowerCase()
    .replace(/[\u0000-\u001F\u007F]+/g, "")
    .slice(0, MAX_BOOK_ID_LENGTH);

  return SAFE_BOOK_ID.test(normalized) ? normalized : "";
}

function normalizeUrl(value) {
  const normalized = normalizeText(value).replace(/\s+/g, "");
  if (!normalized) {
    return "";
  }

  if (/^(https?:)?\/\//i.test(normalized) || normalized.startsWith("/")) {
    return normalized;
  }

  if (/^[a-z0-9./_-]+$/i.test(normalized)) {
    return normalized;
  }

  return "";
}

function getBookDataUrl(slug) {
  return slug ? `data/book/${encodeURIComponent(slug)}.json` : "";
}

function setVisibility(node, visible) {
  if (!node) {
    return;
  }

  node.hidden = !visible;
}

function setPageState(state) {
  setVisibility(loadingNode, state === "loading");
  setVisibility(contentNode, state === "ready");
  setVisibility(emptyNode, state === "empty");
}

function getDisplayTitle(book) {
  const title = normalizeText(book?.title);
  if (title && title.toLowerCase() !== "ma hang" && title.toLowerCase() !== "mã hàng") {
    return title;
  }

  return normalizeText(book?.title_original || book?.id);
}

function fetchJson(url) {
  return fetch(url, { cache: "no-store" }).then((response) => {
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}`);
    }

    return response.json();
  });
}

function syncSearchInput(book) {
  if (!headerInput) {
    return;
  }

  headerInput.value = getDisplayTitle(book);
}

function buildSearchUrl(query) {
  const keyword = normalizeText(query);
  return keyword ? `search.html?q=${encodeURIComponent(keyword)}` : "search.html";
}

function createPill(text) {
  const pillText = normalizeText(text);
  const pill = document.createElement("a");
  pill.className = "detail-pill";
  pill.href = buildSearchUrl(pillText);
  pill.textContent = pillText;
  return pill;
}

function createContributorLink(text) {
  const linkText = normalizeText(text);
  const link = document.createElement("a");
  link.className = "detail-meta-contributor-link";
  link.href = buildSearchUrl(linkText);
  link.textContent = linkText;
  return link;
}

function dedupeStrings(values) {
  return Array.from(
    new Set(
      (Array.isArray(values) ? values : [])
        .map((value) => normalizeText(value))
        .filter(Boolean)
    )
  );
}

function dedupeStringsLoose(values) {
  const entries = Array.isArray(values) ? values : [];
  const seen = new Set();
  const result = [];

  entries.forEach((value) => {
    const normalized = normalizeText(value);
    if (!normalized) {
      return;
    }

    const key = normalized.toLocaleLowerCase("vi");
    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    result.push(normalized);
  });

  return result;
}

function collectBookTags(book) {
  const editions = Array.isArray(book?.editions) ? book.editions : [];
  const tags = [];

  tags.push(...dedupeStringsLoose(book?.authors));
  tags.push(...dedupeStringsLoose(book?.awards));
  tags.push(...dedupeStringsLoose(book?.series));

  editions.forEach((edition) => {
    tags.push(normalizeText(edition?.publisher));
    tags.push(...dedupeStringsLoose(edition?.issuers));
    tags.push(...dedupeStringsLoose(edition?.translators));
    tags.push(...dedupeStringsLoose(edition?.illustrators));
    tags.push(...dedupeStringsLoose(edition?.proofreaders));
  });

  return dedupeStringsLoose(tags);
}

function getGridColumnCount(gridNode) {
  if (!gridNode) {
    return 1;
  }

  const styles = window.getComputedStyle(gridNode);
  const columns = styles.gridTemplateColumns
    .split(" ")
    .map((value) => value.trim())
    .filter(Boolean);

  return Math.max(1, columns.length);
}

function getEditionCardNode(index) {
  if (!editionsGridNode) {
    return null;
  }

  return editionsGridNode.querySelector(`[data-edition-index="${index}"]`);
}

function preserveEditionViewport(index, renderFn) {
  const previousNode = getEditionCardNode(index);
  const previousTop = previousNode?.getBoundingClientRect().top ?? null;

  renderFn();

  const nextNode = getEditionCardNode(index);
  if (previousTop == null || !nextNode) {
    return;
  }

  const nextTop = nextNode.getBoundingClientRect().top;
  const delta = nextTop - previousTop;

  if (Math.abs(delta) > 1) {
    window.scrollBy({ top: delta });
  }

  const nextButton = nextNode.querySelector(".detail-edition-button");
  nextButton?.focus({ preventScroll: true });
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function usesMobileDetailLayout() {
  return mobileDetailLayoutQuery.matches;
}

function pulseFocusCard() {
  if (!focusCardNode) {
    return;
  }

  window.clearTimeout(focusCardPulseTimer);
  focusCardNode.classList.remove("is-updating");
  void focusCardNode.offsetWidth;
  focusCardNode.classList.add("is-updating");

  focusCardPulseTimer = window.setTimeout(() => {
    focusCardNode.classList.remove("is-updating");
  }, 900);
}

function isFocusCardProminentlyVisible() {
  if (!focusCardNode) {
    return true;
  }

  const rect = focusCardNode.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
  if (!viewportHeight) {
    return true;
  }

  const visibleTop = Math.max(rect.top, 0);
  const visibleBottom = Math.min(rect.bottom, viewportHeight);
  const visibleHeight = Math.max(0, visibleBottom - visibleTop);
  const visibleRatio = visibleHeight / Math.min(rect.height || viewportHeight, viewportHeight);

  return visibleRatio >= FOCUS_CARD_VISIBLE_RATIO && rect.top <= viewportHeight * 0.2;
}

function revealFocusCard() {
  if (!focusCardNode) {
    return;
  }

  pulseFocusCard();

  if (isFocusCardProminentlyVisible()) {
    return;
  }

  const rect = focusCardNode.getBoundingClientRect();
  const topTarget = window.scrollY + rect.top - Math.max(FOCUS_CARD_TOP_OFFSET, window.innerHeight * 0.08);

  window.scrollTo({
    top: Math.max(0, topTarget),
    behavior: prefersReducedMotion() ? "auto" : "smooth"
  });
}

function setImageSource(imageNode, src, alt) {
  if (!imageNode) {
    return;
  }

  imageNode.dataset.fallbackApplied = "false";
  imageNode.alt = alt;
  imageNode.onerror = () => {
    if (imageNode.dataset.fallbackApplied === "true") {
      return;
    }

    imageNode.dataset.fallbackApplied = "true";
    imageNode.src = BOOK_FALLBACK_COVER;
  };
  imageNode.src = src || BOOK_FALLBACK_COVER;
}

function getEditionImageUrls(edition) {
  const images = [
    normalizeUrl(edition?.thumbnail),
    ...dedupeStrings(edition?.gellery_imgs).map((value) => normalizeUrl(value))
  ].filter(Boolean);

  return images.length ? Array.from(new Set(images)) : [BOOK_FALLBACK_COVER];
}

function getHeroImageUrl(book) {
  const editions = Array.isArray(book?.editions) ? book.editions : [];
  const firstEdition = editions[0] || {};
  return normalizeUrl(book?.thumbnail) || normalizeUrl(firstEdition.thumbnail) || BOOK_FALLBACK_COVER;
}

function truncateText(value, maxLength) {
  const normalized = normalizeText(value);
  if (!normalized || normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

function summarizeBook(book, edition) {
  const parts = [];
  const series = dedupeStrings(book?.series);

  if (series.length) {
    parts.push(`Thuộc series ${series.join(", ")}.`);
  }

  if (normalizeText(edition?.caption)) {
    parts.push(normalizeText(edition.caption));
  }

  if (normalizeText(edition?.detail)) {
    parts.push(
      normalizeText(edition.detail)
        .split(/\n+/)
        .map((line) => line.replace(/^[-*]\s*/, ""))
        .filter(Boolean)[0] || ""
    );
  }

  if (!parts.length) {
    const editionCount = Array.isArray(book?.editions) ? book.editions.length : 0;
    return editionCount
      ? `Hiện có ${editionCount} phiên bản bìa được lưu trong kho dữ liệu cho đầu sách này.`
      : "Đầu sách này hiện chưa có mô tả chi tiết.";
  }

  return parts.join(" ");
}

function formatCountLabel(count, singular, plural = singular) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function formatValue(value, suffix = "") {
  const normalized = normalizeText(value);
  return normalized ? `${normalized}${suffix}` : "";
}

function buildEditionSummaryLines(edition) {
  const lines = [];

  if (normalizeText(edition.pub_year)) {
    lines.push(`Năm phát hành: ${normalizeText(edition.pub_year)}`);
  }

  if (normalizeText(edition.format)) {
    lines.push(`Hình thức: ${normalizeText(edition.format)}`);
  }

  if (normalizeText(edition.cover_price)) {
    lines.push(`Giá bìa: ${normalizeText(edition.cover_price)}`);
  }

  if (normalizeText(edition.page_count)) {
    lines.push(`Số trang: ${normalizeText(edition.page_count)} trang`);
  }

  if (normalizeText(edition.print_run)) {
    lines.push(`Số lượng in: ${normalizeText(edition.print_run)} bản`);
  }

  if (normalizeText(edition.copy_numbering)) {
    lines.push(`Đánh số: ${normalizeText(edition.copy_numbering)}`);
  }

  return lines;
}

function buildMetaItems(book, edition) {
  const issuerValues = dedupeStrings(edition.issuers);
  const publisherValue = normalizeText(edition.publisher);
  const distributionValues = publisherValue
    ? [publisherValue, ...issuerValues]
    : issuerValues;
  const contributors = [
    { role: "Tác giả", people: dedupeStrings(book.authors) },
    { role: "Dịch giả", people: dedupeStrings(edition.translators) },
    { role: "Họa sĩ", people: dedupeStrings(edition.illustrators) }
  ].filter((group) => group.people.length > 0);

  const items = [
    { label: "Đơn vị phát hành", value: dedupeStrings(distributionValues), asPills: true },
    { label: "Những người thực hiện", value: contributors, isContributorGroups: true },
    { label: "Hiệu đính", value: dedupeStrings(edition.proofreaders), asPills: true }
  ];

  return items.filter((item) => {
    if (item.isContributorGroups && Array.isArray(item.value)) {
      return item.value.length > 0;
    }

    if (Array.isArray(item.value)) {
      return item.value.length > 0;
    }

    return Boolean(normalizeText(item.value));
  });
}

function isCompactMetaItem(item) {
  if (!item) {
    return false;
  }

  if (item.asPills && Array.isArray(item.value)) {
    return item.value.length === 1 && normalizeText(item.value[0]).length <= 22;
  }

  if (typeof item.value === "string") {
    return normalizeText(item.value).length <= 24;
  }

  return false;
}

function renderContributorGroups(valueNode, groups) {
  valueNode.classList.add("detail-meta-contributors");

  groups.forEach((group) => {
    const row = document.createElement("div");
    row.className = "detail-meta-contributor-row";

    const role = document.createElement("span");
    role.className = "detail-meta-contributor-role";
    role.textContent = group.role;

    const people = document.createElement("div");
    people.className = "detail-meta-contributor-people";

    group.people.forEach((person, index) => {
      if (index > 0) {
        people.appendChild(document.createTextNode(", "));
      }

      people.appendChild(createContributorLink(person));
    });

    row.append(role, people);
    valueNode.appendChild(row);
  });
}

function renderInfoCard(node, title, lines) {
  if (!node) {
    return;
  }

  node.replaceChildren();

  if (!Array.isArray(lines) || !lines.length) {
    node.hidden = true;
    return;
  }

  node.hidden = false;

  const label = document.createElement("span");
  label.className = "detail-meta-label";
  label.textContent = title;
  node.appendChild(label);

  const content = document.createElement("div");
  content.className = "detail-description is-bullet-list";

  const list = document.createElement("ul");
  lines.forEach((line) => {
    const item = document.createElement("li");
    item.textContent = line;
    list.appendChild(item);
  });

  content.appendChild(list);
  node.appendChild(content);
}

function renderDescription(edition) {
  if (!editionDescriptionNode) {
    return;
  }

  editionDescriptionNode.replaceChildren();
  const text = normalizeText(edition?.detail);

  if (!text) {
    editionDescriptionNode.hidden = true;
    return;
  }

  editionDescriptionNode.hidden = false;

  const label = document.createElement("span");
  label.className = "detail-meta-label";
  label.textContent = "Quy cách ấn phẩm";
  editionDescriptionNode.appendChild(label);

  const content = document.createElement("div");
  content.className = "detail-description";

  const lines = text.split(/\n+/).map((line) => normalizeText(line)).filter(Boolean);
  const bulletLines = lines.filter((line) => /^[-*]/.test(line));

  if (bulletLines.length === lines.length && bulletLines.length > 1) {
    const list = document.createElement("ul");
    bulletLines.forEach((line) => {
      const item = document.createElement("li");
      item.textContent = line.replace(/^[-*]\s*/, "");
      list.appendChild(item);
    });
    content.appendChild(list);
    editionDescriptionNode.appendChild(content);
    return;
  }

  lines.forEach((line) => {
    const paragraph = document.createElement("p");
    paragraph.textContent = line.replace(/^[-*]\s*/, "");
    content.appendChild(paragraph);
  });

  editionDescriptionNode.appendChild(content);
}

function renderHeroImage(book) {
  if (!heroCoverNode) {
    return;
  }

  setImageSource(heroCoverNode, getHeroImageUrl(book), `Bìa sách ${getDisplayTitle(book)}`);
}

function renderEditionGallery(edition) {
  if (!editionCoverNode || !editionGalleryNode) {
    return;
  }

  const images = getEditionImageUrls(edition);
  const boundedIndex = Math.min(activeImageIndex, images.length - 1);
  activeImageIndex = boundedIndex < 0 ? 0 : boundedIndex;

  setImageSource(
    editionCoverNode,
    images[activeImageIndex],
    `Bìa phiên bản ${normalizeText(edition.caption) || getDisplayTitle(currentBook)}`
  );

  editionGalleryNode.replaceChildren();

  images.forEach((image, index) => {
    const button = document.createElement("button");
    button.className = `detail-thumb${index === activeImageIndex ? " is-active" : ""}`;
    button.type = "button";
    button.setAttribute("aria-label", `Xem ảnh ${index + 1}`);
    button.setAttribute("aria-pressed", index === activeImageIndex ? "true" : "false");
    button.addEventListener("click", () => {
      activeImageIndex = index;
      renderEditionGallery(edition);
    });

    const imageNode = document.createElement("img");
    imageNode.src = image || BOOK_FALLBACK_COVER;
    imageNode.alt = "";
    imageNode.loading = "lazy";
    imageNode.decoding = "async";
    imageNode.onerror = () => {
      imageNode.src = BOOK_FALLBACK_COVER;
    };

    button.appendChild(imageNode);
    editionGalleryNode.appendChild(button);
  });
}

function renderEditionMeta(book, edition) {
  if (!editionMetaNode) {
    return;
  }

  editionMetaNode.replaceChildren();
  const items = buildMetaItems(book, edition);

  items.forEach((item) => {
    const wrapper = document.createElement("div");
    wrapper.className = `detail-panel${isCompactMetaItem(item) ? " is-compact" : ""}`;

    const label = document.createElement("span");
    label.className = "detail-meta-label";
    label.textContent = item.label;

    const value = document.createElement("div");
    value.className = "detail-meta-value";

    if (item.isContributorGroups && Array.isArray(item.value)) {
      renderContributorGroups(value, item.value);
    } else if (item.asPills && Array.isArray(item.value)) {
      value.classList.add("is-pill-list");
      item.value.forEach((entry) => value.appendChild(createPill(entry)));
    } else {
      value.textContent = Array.isArray(item.value) ? item.value.join(", ") : item.value;
    }

    wrapper.append(label, value);
    editionMetaNode.appendChild(wrapper);
  });
}

function renderEditions(book) {
  if (!editionsGridNode || !editionsHeadingNode || !focusCardNode) {
    return;
  }

  const editions = Array.isArray(book.editions) ? book.editions : [];
  editionsGridNode.replaceChildren();
  editionsGridNode.dataset.layout = usesMobileDetailLayout() ? "mobile" : "desktop";
  const hasEditionChoices = editions.length > 1;

  editionsHeadingNode.textContent = hasEditionChoices ? `${editions.length} Phiên Bản Bìa` : "";
  editionsHeadingNode.hidden = !hasEditionChoices;

  if (editionKickerNode) {
    editionKickerNode.textContent = "Phiên bản đang xem";
  }

  if (!hasEditionChoices) {
    editionsGridNode.appendChild(focusCardNode);
    return;
  }

  const editionNodes = [];

  editions.forEach((edition, index) => {
    const article = document.createElement("article");
    article.className = `detail-edition-card${index === activeEditionIndex ? " is-active" : ""}`;
    article.dataset.editionIndex = String(index);

    const button = document.createElement("button");
    button.className = "detail-edition-button";
    button.type = "button";
    button.setAttribute("aria-pressed", index === activeEditionIndex ? "true" : "false");
    button.addEventListener("click", () => {
      preserveEditionViewport(index, () => {
        activeEditionIndex = index;
        activeImageIndex = 0;
        renderActiveEdition();
        renderEditions(book);
      });

      window.requestAnimationFrame(() => {
        revealFocusCard();
      });
    });

    const inner = document.createElement("div");
    inner.className = "detail-edition-card-inner";

    const media = document.createElement("div");
    media.className = "detail-edition-media";

    const image = document.createElement("img");
    image.alt = "";
    image.width = 240;
    image.height = 340;
    image.loading = "lazy";
    image.decoding = "async";
    image.onerror = () => {
      image.src = BOOK_FALLBACK_COVER;
    };
    image.src = normalizeUrl(edition.thumbnail) || BOOK_FALLBACK_COVER;

    const content = document.createElement("div");
    content.className = "detail-edition-content";

    const title = document.createElement("h3");
    title.className = "detail-edition-title";
    title.textContent = normalizeText(edition.caption) || `${getDisplayTitle(book)} - ${normalizeText(edition.format) || "Phiên bản"}`;

    const subtitle = document.createElement("p");
    subtitle.className = "detail-edition-subtitle";
    subtitle.textContent = dedupeStrings(edition.issuers).join(", ") || normalizeText(edition.publisher) || "Bìa Cứng";

    const meta = document.createElement("p");
    meta.className = "detail-edition-meta";

    const metaParts = [
      formatValue(edition.pub_year),
      normalizeText(edition.cover_price)
    ].filter(Boolean);

    meta.textContent = metaParts.join(" • ");

    media.appendChild(image);
    content.append(title, subtitle);
    if (meta.textContent) {
      content.appendChild(meta);
    }
    inner.append(media, content);
    button.appendChild(inner);
    article.appendChild(button);
    editionNodes.push(article);
  });

  if (usesMobileDetailLayout()) {
    editionsGridNode.appendChild(focusCardNode);
    editionNodes.forEach((node) => {
      editionsGridNode.appendChild(node);
    });
    return;
  }

  const columns = getGridColumnCount(editionsGridNode);
  const rowIndex = Math.floor(activeEditionIndex / columns);
  const insertAfterIndex = Math.min(((rowIndex + 1) * columns) - 1, editionNodes.length - 1);

  editionNodes.forEach((node, index) => {
    editionsGridNode.appendChild(node);

    if (index === insertAfterIndex) {
      editionsGridNode.appendChild(focusCardNode);
    }
  });
}

function renderActiveEdition() {
  const editions = Array.isArray(currentBook?.editions) ? currentBook.editions : [];
  const edition = editions[activeEditionIndex] || editions[0];

  if (!edition || !editionTitleNode || !editionCoverNode) {
    return;
  }

  editionTitleNode.textContent =
    normalizeText(edition.caption) || `${getDisplayTitle(currentBook)} - ${normalizeText(edition.format) || "Phiên bản sưu tầm"}`;

  renderEditionGallery(edition);
  renderEditionMeta(currentBook, edition);
  renderInfoCard(editionSummaryNode, "Thông tin phát hành", buildEditionSummaryLines(edition));
  renderDescription(edition);
  updateSeoMetadata(currentBook, edition);
}

function updateSeoMetadata(book, edition) {
  const seo = window.BiaCungSEO;
  if (!seo || !book || !edition) {
    return;
  }

  const displayTitle = getDisplayTitle(book);
  const authors = dedupeStrings(book.authors);
  const imageUrl = seo.toAbsoluteUrl(normalizeUrl(edition.thumbnail) || getHeroImageUrl(book)) || seo.FALLBACK_IMAGE;
  const pagePath = `detail.html?id=${encodeURIComponent(book.id)}`;
  const pageUrl = seo.toAbsoluteUrl(pagePath);
  const description = truncateText(
    [
      authors.length ? `${displayTitle} - ${authors.join(", ")}.` : displayTitle,
      summarizeBook(book, edition)
    ].filter(Boolean).join(" "),
    220
  );
  const editionName =
    normalizeText(edition.caption) || `${displayTitle} - ${normalizeText(edition.format) || "Phiên bản sưu tầm"}`;

  seo.setCanonical(pagePath);
  seo.setMetaByName("description", description);
  seo.setMetaByProperty("og:url", pageUrl);
  seo.setMetaByProperty("og:title", `${displayTitle} | Bìa Cứng`);
  seo.setMetaByProperty("og:description", description);
  seo.setMetaByProperty("og:image", imageUrl);
  seo.setMetaByName("twitter:title", `${displayTitle} | Bìa Cứng`);
  seo.setMetaByName("twitter:description", description);
  seo.setMetaByName("twitter:image", imageUrl);

  seo.setStructuredData("book-structured-data", {
    "@context": "https://schema.org",
    "@type": "Book",
    name: displayTitle,
    alternateName: normalizeText(book.title_original) || undefined,
    url: pageUrl,
    image: imageUrl,
    inLanguage: "vi-VN",
    description,
    author: authors.map((author) => ({
      "@type": "Person",
      name: author
    })),
    workExample: {
      "@type": "Book",
      name: editionName,
      bookFormat: normalizeText(edition.format) || undefined,
      datePublished: normalizeText(edition.pub_year) || undefined,
      publisher: normalizeText(edition.publisher)
        ? {
          "@type": "Organization",
          name: normalizeText(edition.publisher)
        }
        : undefined
    }
  });
}

function renderBook(book) {
  currentBook = book;
  activeEditionIndex = 0;
  activeImageIndex = 0;

  const displayTitle = getDisplayTitle(book);
  const titleOriginal = normalizeText(book.title_original);
  const authors = dedupeStrings(book.authors);
  const pills = collectBookTags(book);

  document.title = `${displayTitle} | Bìa Cứng`;
  syncSearchInput(book);

  if (titleNode) {
    titleNode.textContent = [displayTitle, authors.join(", ")].filter(Boolean).join(" - ");
  }

  if (originalNode) {
    originalNode.textContent = titleOriginal && titleOriginal !== displayTitle ? titleOriginal : "";
    setVisibility(originalNode, Boolean(originalNode.textContent));
  }

  if (pillsNode) {
    pillsNode.replaceChildren();
    pills.forEach((entry) => {
      pillsNode.appendChild(createPill(entry));
    });
  }

  renderHeroImage(book);
  renderEditions(book);
  renderActiveEdition();

  setPageState("ready");
}

async function main() {
  syncSearchInput({ title: "" });
  setPageState("loading");

  if (!bookId) {
    setPageState("empty");
    window.BiaCungPageLoader?.hide();
    return;
  }

  try {
    const book = await fetchJson(getBookDataUrl(bookId));
    const editions = Array.isArray(book?.editions) ? book.editions : [];

    if (!book || !editions.length) {
      throw new Error("Book data missing editions");
    }

    renderBook(book);
  } catch (error) {
    setPageState("empty");
  } finally {
    window.BiaCungPageLoader?.hide();
  }
}

window.addEventListener("resize", () => {
  if (!currentBook) {
    return;
  }

  preserveEditionViewport(activeEditionIndex, () => {
    renderEditions(currentBook);
  });
});

main();
