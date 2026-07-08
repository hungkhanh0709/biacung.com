const SERIES_INDEX_URL = "data/series.json";
const BOOK_FALLBACK_COVER = "assets/img/book-cover.png.avif";
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

let currentResults = [];
let visibleCount = 0;

function normalizeText(value) {
  return value == null ? "" : String(value).trim();
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
  img.src = normalizeUrl(image) || BOOK_FALLBACK_COVER;
  img.alt = title ? `Bìa sách ${title}` : "Bìa sách";
  img.width = 360;
  img.height = 500;
  img.loading = "lazy";
  img.decoding = "async";
  img.addEventListener("error", () => {
    if (img.dataset.fallbackApplied === "true") {
      return;
    }

    img.dataset.fallbackApplied = "true";
    img.src = BOOK_FALLBACK_COVER;
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

async function loadAllSeriesCards() {
  const seriesIndex = await fetchJson(SERIES_INDEX_URL);
  const detailEntries = Array.isArray(seriesIndex) ? seriesIndex : [];

  const seriesDetails = await Promise.all(
    detailEntries.map((entry) => {
      const detailPath = normalizeText(entry?.detail);
      return isSafeDetailPath(detailPath, SAFE_SERIES_DETAIL_PATH) ? fetchOptionalJson(detailPath) : null;
    })
  );

  return seriesDetails
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

  const series = await fetchJson(detailPath);
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
}

async function main() {
  if (!resultsNode || !summaryNode || !emptyNode || !titleNode) {
    return;
  }

  syncSearchInput();
  resetRenderedResults();

  try {
    if (!seriesId) {
      await renderSeriesIndexPage();
      return;
    }

    await renderSeriesDetailPage();
  } catch (error) {
    setPageState("empty");
    updateCopy({
      title: seriesId ? "Series không tồn tại" : "Danh sách series",
      summary: seriesId
        ? `Không tìm thấy series với id “${seriesId}”.`
        : "Không thể tải danh sách series lúc này.",
      empty: "Vui lòng thử lại sau."
    });
  }
}

loadMoreButton?.addEventListener("click", () => {
  appendVisibleResults();
});

main();
