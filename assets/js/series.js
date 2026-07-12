const SERIES_INDEX_URL = "data/series.json";
const BOOK_FALLBACK_COVER = "assets/img/core/book-cover.png.avif";
const SEARCH_PAGE_SIZE = 16;
const MAX_SERIES_ID_LENGTH = 120;
const SAFE_SERIES_ID = /^[a-z0-9-]+$/;
const SAFE_BOOK_ID = /^[a-z0-9-]+$/;
const SAFE_SERIES_DETAIL_PATH = /^data\/series\/[a-z0-9-]+\.json$/;
const SAFE_BOOK_DETAIL_PATH = /^data\/book\/[a-z0-9-]+\.json$/;

const params = new URLSearchParams(window.location.search);
const seriesId = sanitizeSlugParam(params.get("id"));

const page = document.querySelector(".series-page");
const headerInput = document.querySelector("#site-search");
const titleNode = document.querySelector("#series-results-title");
const summaryNode = document.querySelector("[data-series-summary]");
const emptyNode = document.querySelector("[data-series-empty]");
const resultsNode = document.querySelector("[data-series-results]");
const actionsNode = document.querySelector("[data-series-actions]");
const loadMoreButton = document.querySelector("[data-series-load-more]");
const managedImageLoader = window.BiaCungImageLoader;
const skeletonRenderer = window.BiaCungSkeleton;

let currentResults = [];
let visibleCount = 0;

function normalizeText(value) {
  return value == null ? "" : String(value).trim();
}

function normalizeSeriesDetailPayload(payload) {
  if (Array.isArray(payload)) {
    return payload.find((entry) => entry && typeof entry === "object") || null;
  }

  return payload && typeof payload === "object" ? payload : null;
}

function getNormalizedSeriesItems(indexEntries) {
  const dedupedEntries = [];
  const seenKeys = new Set();

  (Array.isArray(indexEntries) ? indexEntries : []).forEach((entry) => {
    const id = sanitizeSlugParam(entry?.id);
    const detail = normalizeText(entry?.detail);
    const key = `${id}::${detail}`;

    if (!id || !detail || seenKeys.has(key)) {
      return;
    }

    seenKeys.add(key);
    dedupedEntries.push({ id, detail });
  });

  return dedupedEntries;
}

function sanitizeSlugParam(value) {
  const normalized = normalizeText(value)
    .toLowerCase()
    .replace(/[\u0000-\u001F\u007F]+/g, "")
    .slice(0, MAX_SERIES_ID_LENGTH);

  return SAFE_SERIES_ID.test(normalized) ? normalized : "";
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

function buildSeriesDetailUrl(slug) {
  const value = sanitizeSlugParam(slug);
  return value ? `series.html?id=${encodeURIComponent(value)}` : "series.html";
}

function buildBookDetailUrl(slug) {
  const value = normalizeText(slug).toLowerCase();
  if (!SAFE_BOOK_ID.test(value)) {
    return "";
  }

  return value ? `detail.html?id=${encodeURIComponent(value)}` : "";
}

function buildBookDetailDataUrl(slug) {
  const value = normalizeText(slug).toLowerCase();
  if (!SAFE_BOOK_ID.test(value)) {
    return "";
  }

  return value ? `data/book/${encodeURIComponent(value)}.json` : "";
}

function truncateText(value, maxLength) {
  const normalized = normalizeText(value);
  if (!normalized || normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

function isSafeDetailPath(path, pattern) {
  return pattern.test(normalizeText(path));
}

function getBookDisplayTitle(book) {
  const title = normalizeText(book?.title);
  if (title && title.toLowerCase() !== "ma hang" && title.toLowerCase() !== "mã hàng") {
    return title;
  }

  return normalizeText(book?.title_original || book?.id);
}

async function fetchJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }

  return response.json();
}

async function fetchOptionalJson(url) {
  try {
    return await fetchJson(url);
  } catch (error) {
    return null;
  }
}

function syncSearchInput() {
  if (headerInput) {
    headerInput.value = "";
  }
}

function setPageState(state) {
  page?.classList.toggle("is-loading", state === "loading");
  page?.classList.toggle("is-empty", state === "empty" || state === "error");
  page?.classList.toggle("is-ready", state === "results");
}

function updateCopy({ title, summary, empty }) {
  if (titleNode) {
    titleNode.textContent = title;
  }

  if (summaryNode) {
    summaryNode.textContent = summary;
  }

  if (emptyNode) {
    emptyNode.textContent = empty;
  }
}

function setLoadMoreState() {
  if (!actionsNode || !loadMoreButton) {
    return;
  }

  const hasMore = visibleCount < currentResults.length;
  actionsNode.hidden = !hasMore;
  loadMoreButton.textContent = "Xem thêm";
}

function createCard({ title, subtitle, description, image, href, meta }) {
  const article = document.createElement("article");
  article.className = "book-card";

  const link = document.createElement("a");
  link.href = href;

  const media = document.createElement("div");
  media.className = "book-media";

  const img = document.createElement("img");
  img.className = "cover";
  img.width = 360;
  img.height = 500;
  managedImageLoader?.mount({
    imageNode: img,
    frameNode: media,
    src: normalizeUrl(image),
    alt: title ? `Bìa sách ${title}` : "Bìa sách",
    fallbackSrc: BOOK_FALLBACK_COVER
  });
  media.appendChild(img);

  const content = document.createElement("div");
  content.className = "book-card-content";

  const heading = document.createElement("h3");
  heading.className = "book-title";
  heading.textContent = title || "Không có tiêu đề";
  content.appendChild(heading);

  if (subtitle) {
    const subtitleNode = document.createElement("p");
    subtitleNode.className = "book-subtitle";
    subtitleNode.textContent = subtitle;
    content.appendChild(subtitleNode);
  }

  if (description) {
    const descriptionNode = document.createElement("p");
    descriptionNode.className = "book-description";
    descriptionNode.textContent = description;
    content.appendChild(descriptionNode);
  }

  if (meta) {
    const metaNode = document.createElement("p");
    metaNode.className = "book-meta";
    metaNode.textContent = meta;
    content.appendChild(metaNode);
  }

  link.append(media, content);
  article.appendChild(link);
  return article;
}

function resetRenderedResults() {
  currentResults = [];
  visibleCount = 0;
  resultsNode?.replaceChildren();
  setLoadMoreState();
}

function appendVisibleResults() {
  if (!resultsNode || visibleCount >= currentResults.length) {
    setLoadMoreState();
    return;
  }

  const nextVisibleCount = Math.min(visibleCount + SEARCH_PAGE_SIZE, currentResults.length);
  const nextItems = currentResults.slice(visibleCount, nextVisibleCount);

  nextItems.forEach((result) => {
    resultsNode.appendChild(createCard(result));
  });

  visibleCount = nextVisibleCount;
  setLoadMoreState();
}

function setResults(results) {
  currentResults = Array.isArray(results) ? results : [];
  visibleCount = 0;
  resultsNode?.replaceChildren();
  appendVisibleResults();
}

function renderLoadingSkeletons(count = SEARCH_PAGE_SIZE) {
  skeletonRenderer?.renderBookCardGrid(resultsNode, count);
}

async function loadAllSeriesCards() {
  const seriesIndex = await fetchJson(SERIES_INDEX_URL);
  const detailEntries = getNormalizedSeriesItems(seriesIndex);

  const seriesDetails = await Promise.all(
    detailEntries.map((entry) => {
      const detailPath = normalizeText(entry?.detail);
      return isSafeDetailPath(detailPath, SAFE_SERIES_DETAIL_PATH) ? fetchOptionalJson(detailPath) : null;
    })
  );

  return seriesDetails
    .map((series) => normalizeSeriesDetailPayload(series))
    .filter(Boolean)
    .sort((a, b) => normalizeText(a.name || a.id).localeCompare(normalizeText(b.name || b.id), "vi"))
    .map((series) => ({
      title: normalizeText(series.name || series.id),
      subtitle: Array.isArray(series.work_ids) ? `(${series.work_ids.length} tác phẩm)` : "",
      // description: normalizeText(series.description).split("\n")[0],
      image: series.thumbnail,
      href: buildSeriesDetailUrl(series.id),
      meta: ""
    }));
}

async function loadSeriesBooks(seriesSlug) {
  const detailPath = `data/series/${encodeURIComponent(seriesSlug)}.json`;
  if (!isSafeDetailPath(detailPath, SAFE_SERIES_DETAIL_PATH)) {
    throw new Error("Invalid series id");
  }

  const series = normalizeSeriesDetailPayload(await fetchJson(detailPath));
  if (!series) {
    throw new Error("Invalid series detail payload");
  }

  const workIds = Array.isArray(series.work_ids) ? series.work_ids.map((workId) => normalizeText(workId)).filter(Boolean) : [];

  const books = await Promise.all(
    workIds.map(async (workId) => {
      const bookDetailUrl = buildBookDetailDataUrl(workId);
      const book = bookDetailUrl && isSafeDetailPath(bookDetailUrl, SAFE_BOOK_DETAIL_PATH)
        ? await fetchOptionalJson(bookDetailUrl)
        : null;
      if (!book) {
        return null;
      }

      const editions = Array.isArray(book.editions) ? book.editions : [];
      const firstEdition = editions[0] || {};

      return {
        title: getBookDisplayTitle(book),
        subtitle: Array.isArray(book.authors) ? book.authors.join(", ") : "",
        description: "",
        image: firstEdition.thumbnail || book.thumbnail,
        href: buildBookDetailUrl(book.id),
        meta: editions.length ? `(${editions.length} phiên bản)` : ""
      };
    })
  );

  return {
    series,
    books: books.filter(Boolean)
  };
}

async function renderSeriesIndexPage() {
  document.title = "Series | Bìa Cứng";
  updateCopy({
    title: "Danh sách series",
    summary: "Đang tải toàn bộ series hiện có.",
    empty: "Hiện chưa có dữ liệu để hiển thị."
  });

  const seriesCards = await loadAllSeriesCards();

  if (!seriesCards.length) {
    resultsNode?.replaceChildren();
    setPageState("empty");
    updateCopy({
      title: "Danh sách series",
      summary: "Hiện chưa có dữ liệu series để hiển thị.",
      empty: "Kho dữ liệu hiện chưa có series nào."
    });
    return;
  }

  setResults(seriesCards);
  setPageState("results");
  updateCopy({
    title: "Danh sách series",
    summary: `Hiển thị tất cả ${seriesCards.length} series`,
    empty: ""
  });
  updateSeriesIndexSeo(seriesCards);
}

async function renderSeriesDetailPage() {
  updateCopy({
    title: "Series",
    summary: "Đang tải danh sách tác phẩm thuộc series.",
    empty: "Không thể tải series này."
  });

  const { series, books } = await loadSeriesBooks(seriesId);
  const workCount = Array.isArray(series.work_ids) ? series.work_ids.length : 0;

  document.title = `${normalizeText(series.name || series.id)} | Bìa Cứng`;

  if (!books.length) {
    resultsNode?.replaceChildren();
    setPageState("empty");
    updateCopy({
      title: normalizeText(series.name || series.id),
      summary: workCount
        ? `Series này có ${workCount} tác phẩm trong dữ liệu gốc, nhưng hiện chưa tải được danh sách hiển thị.`
        : "Series này hiện chưa có tác phẩm nào.",
      empty: workCount
        ? "Có lỗi khi tải danh sách sách thuộc series này."
        : "Series này hiện chưa có `work_ids` để hiển thị."
    });
    return;
  }

  setResults(books);
  setPageState("results");
  updateCopy({
    title: normalizeText(series.name || series.id),
    summary: `Hiển thị ${books.length} tác phẩm thuộc series “${normalizeText(series.name || series.id)}”`,
    empty: ""
  });
  updateSeriesDetailSeo(series, books);
}

function updateSeriesIndexSeo(seriesCards) {
  const seo = window.BiaCungSEO;
  if (!seo) {
    return;
  }

  const description = truncateText(
    `Khám phá ${seriesCards.length} series sách và danh sách tác phẩm thuộc từng bộ sách trên Bìa Cứng.`,
    220
  );

  seo.setCanonical("series.html");
  seo.setMetaByName("description", description);
  seo.setMetaByProperty("og:url", `${seo.SITE_URL}series.html`);
  seo.setMetaByProperty("og:title", "Series | Bìa Cứng");
  seo.setMetaByProperty("og:description", description);
  seo.setMetaByProperty("og:image", seo.FALLBACK_IMAGE);
  seo.setMetaByName("twitter:title", "Series | Bìa Cứng");
  seo.setMetaByName("twitter:description", description);
  seo.setMetaByName("twitter:image", seo.FALLBACK_IMAGE);

  seo.setStructuredData("series-structured-data", {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Series | Bìa Cứng",
    url: `${seo.SITE_URL}series.html`,
    description,
    inLanguage: "vi-VN",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: seriesCards.length,
      itemListElement: seriesCards.map((series, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: series.title,
        url: seo.toAbsoluteUrl(series.href)
      }))
    }
  });
}

function updateSeriesDetailSeo(series, books) {
  const seo = window.BiaCungSEO;
  if (!seo || !series) {
    return;
  }

  const pagePath = `series.html?id=${encodeURIComponent(series.id)}`;
  const pageUrl = seo.toAbsoluteUrl(pagePath);
  const imageUrl = seo.toAbsoluteUrl(normalizeUrl(series.thumbnail)) || seo.FALLBACK_IMAGE;
  const description = truncateText(
    [
      normalizeText(series.description),
      books.length ? `Hiện có ${books.length} tác phẩm thuộc series này trên Bìa Cứng.` : ""
    ].filter(Boolean).join(" "),
    220
  );

  seo.setCanonical(pagePath);
  seo.setMetaByName("description", description);
  seo.setMetaByProperty("og:url", pageUrl);
  seo.setMetaByProperty("og:title", `${normalizeText(series.name || series.id)} | Bìa Cứng`);
  seo.setMetaByProperty("og:description", description);
  seo.setMetaByProperty("og:image", imageUrl);
  seo.setMetaByName("twitter:title", `${normalizeText(series.name || series.id)} | Bìa Cứng`);
  seo.setMetaByName("twitter:description", description);
  seo.setMetaByName("twitter:image", imageUrl);

  seo.setStructuredData("series-structured-data", {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: normalizeText(series.name || series.id),
    url: pageUrl,
    image: imageUrl,
    description,
    inLanguage: "vi-VN",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: books.length,
      itemListElement: books.map((book, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: book.title,
        url: seo.toAbsoluteUrl(book.href)
      }))
    }
  });
}

async function main() {
  if (!resultsNode || !summaryNode || !emptyNode || !titleNode) {
    window.BiaCungPageLoader?.hide();
    return;
  }

  syncSearchInput();
  resetRenderedResults();
  setPageState("loading");
  renderLoadingSkeletons();
  updateCopy({
    title: seriesId ? "Đang tải series" : "Danh sách series",
    summary: seriesId
      ? "Đang tải thông tin series và danh sách tác phẩm liên quan."
      : "Đang tải danh sách series hiện có trên Bìa Cứng.",
    empty: "Vui lòng chờ trong giây lát."
  });
  window.BiaCungPageLoader?.handoff("Đang tải dữ liệu series...");

  try {
    if (!seriesId) {
      await renderSeriesIndexPage();
      return;
    }

    await renderSeriesDetailPage();
  } catch (error) {
    resultsNode?.replaceChildren();
    setPageState("empty");
    updateCopy({
      title: seriesId ? "Series không tồn tại" : "Danh sách series",
      summary: seriesId
        ? `Không tìm thấy series với id “${seriesId}”.`
        : "Không thể tải danh sách series lúc này.",
      empty: "Vui lòng thử lại sau."
    });
  } finally {
    window.BiaCungPageLoader?.hide();
  }
}

loadMoreButton?.addEventListener("click", () => {
  appendVisibleResults();
});

main();
