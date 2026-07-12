const HOME_DATA_URL = "data/home.json";
const BOOK_INDEX_URL = "data/book.json";
const BOOK_FALLBACK_COVER = "assets/img/core/book-cover.png.avif";
const SERIES_DETAIL_DIR = "data/series";
const SEARCH_PAGE_SIZE = 16;
const MAX_QUERY_LENGTH = 120;
const SAFE_BOOK_DETAIL_PATH = /^data\/book\/[a-z0-9-]+\.json$/;
const SAFE_SERIES_DETAIL_PATH = /^data\/series\/[a-z0-9-]+\.json$/;

const params = new URLSearchParams(window.location.search);
const keyword = sanitizeQueryParam(params.get("q"));

const page = document.querySelector(".search-page");
const headerInput = document.querySelector("#site-search");
const emptyNode = document.querySelector("[data-search-empty]");
const resultsNode = document.querySelector("[data-search-results]");
const actionsNode = document.querySelector("[data-search-actions]");
const loadMoreButton = document.querySelector("[data-search-load-more]");
const managedImageLoader = window.BiaCungImageLoader;
const skeletonRenderer = window.BiaCungSkeleton;

let currentResults = [];
let visibleCount = 0;

function normalizeText(value) {
  return value == null ? "" : String(value).trim();
}

function sanitizeQueryParam(value) {
  return normalizeText(value)
    .replace(/[\u0000-\u001F\u007F]+/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, MAX_QUERY_LENGTH);
}

function normalizeSearchText(value) {
  return normalizeText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
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

function isSafeDetailPath(path, pattern) {
  return pattern.test(normalizeText(path));
}

function buildDetailUrl(type, slug) {
  const value = normalizeText(slug);
  if (!value) {
    return "";
  }

  if (type === "series") {
    return `series.html?id=${encodeURIComponent(value)}`;
  }

  return `detail.html?id=${encodeURIComponent(value)}`;
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

function syncSearchInputs(value) {
  [headerInput].forEach((input) => {
    if (input) {
      input.value = value;
    }
  });
}

function setPageState(state) {
  page?.classList.toggle("is-loading", state === "loading");
  page?.classList.toggle("is-empty", state === "empty" || state === "error" || state === "idle");
  page?.classList.toggle("is-ready", state === "results");
}

function updateEmptyState(copy) {
  if (emptyNode) {
    emptyNode.textContent = copy;
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

  // if (description) {
  //   const descriptionNode = document.createElement("p");
  //   descriptionNode.className = "book-description";
  //   descriptionNode.textContent = description;
  //   content.appendChild(descriptionNode);
  // }

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

async function loadSeriesMatches(normalizedKeyword) {
  const homeConfig = await fetchJson(HOME_DATA_URL);
  const seriesConfig = Array.isArray(homeConfig)
    ? homeConfig.find((entry) => entry && entry.id === "series-focus")
    : null;
  const seriesIds = Array.isArray(seriesConfig?.item_ids) ? seriesConfig.item_ids : [];

  if (!seriesIds.length) {
    return [];
  }

  const seriesEntries = await Promise.all(
    seriesIds.map((seriesId) => {
      const detailPath = `${SERIES_DETAIL_DIR}/${encodeURIComponent(normalizeText(seriesId))}.json`;
      return isSafeDetailPath(detailPath, SAFE_SERIES_DETAIL_PATH) ? fetchOptionalJson(detailPath) : null;
    })
  );

  return seriesEntries
    .filter(Boolean)
    .map((series) => {
      const text = normalizeSearchText(
        [series.name, series.id, series.description, ...(Array.isArray(series.work_ids) ? series.work_ids : [])].join(" ")
      );
      if (normalizedKeyword && !text.includes(normalizedKeyword)) {
        return null;
      }

      return series;
    })
    .filter(Boolean)
    .map((series) => ({
      type: "series",
      title: normalizeText(series.name || series.id),
      subtitle: Array.isArray(series.work_ids) ? `${series.work_ids.length} tác phẩm` : "Series tuyển chọn",
      description: normalizeText(series.description).split("\n")[0],
      image: series.thumbnail,
      href: buildDetailUrl("series", series.id),
      meta: ""
    }));
}

async function loadBookMatches(normalizedKeyword) {
  const bookIndex = await fetchJson(BOOK_INDEX_URL);
  const matchedEntries = Array.isArray(bookIndex)
    ? bookIndex
      .map((entry) => {
        const searchableText = normalizeSearchText(entry?.search_text);
        if (normalizedKeyword && !searchableText.includes(normalizedKeyword)) {
          return null;
        }

        return entry;
      })
      .filter(Boolean)
    : [];

  if (!matchedEntries.length) {
    return [];
  }

  const books = await Promise.all(
    matchedEntries.map(async (entry) => {
      const detailPath = normalizeText(entry?.detail);
      if (!detailPath || !isSafeDetailPath(detailPath, SAFE_BOOK_DETAIL_PATH)) {
        return null;
      }

      const book = await fetchOptionalJson(detailPath);
      if (!book) {
        return null;
      }

      const editions = Array.isArray(book.editions) ? book.editions : [];
      const firstEdition = editions[0] || {};

      return {
        type: "book",
        title: normalizeText(book.title || book.title_original || book.id),
        subtitle: Array.isArray(book.authors) ? book.authors.join(", ") : "",
        // description: normalizeText(firstEdition.caption),
        image: firstEdition.thumbnail || book.thumbnail,
        href: buildDetailUrl("book", book.id),
        meta: editions.length ? `(${editions.length} phiên bản)` : ""
      };
    })
  );

  return books.filter(Boolean);
}

async function renderResults() {
  if (!resultsNode || !emptyNode) {
    window.BiaCungPageLoader?.hide();
    return;
  }

  syncSearchInputs(keyword);
  resetRenderedResults();
  const hasKeyword = Boolean(keyword);
  document.title = hasKeyword
    ? `Kết quả tìm kiếm “${keyword}” | Bìa Cứng`
    : "Tất cả kết quả | Bìa Cứng";
  setPageState("loading");
  renderLoadingSkeletons();
  updateEmptyState(
    hasKeyword
      ? `Đang tra cứu dữ liệu cho “${keyword}”.`
      : "Đang tải toàn bộ bìa sách và series hiện có."
  );
  window.BiaCungPageLoader?.handoff("Đang tải kết quả tìm kiếm...");

  try {
    const normalizedKeyword = normalizeSearchText(keyword);
    const [seriesMatches, bookMatches] = await Promise.all([
      loadSeriesMatches(normalizedKeyword),
      loadBookMatches(normalizedKeyword)
    ]);

    const results = [...seriesMatches, ...bookMatches];

    if (!results.length) {
      resultsNode?.replaceChildren();
      setPageState("empty");
      updateEmptyState(
        hasKeyword
          ? `Không tìm thấy kết quả phù hợp cho “${keyword}”. Thử dùng tên tác giả, tên sách, NXB hoặc một từ khóa ngắn hơn.`
          : "Hiện chưa có dữ liệu để hiển thị. Kho dữ liệu hiện chưa có sách hoặc series nào."
      );
      return;
    }

    setResults(results);
    setPageState("results");
  } catch (error) {
    resultsNode?.replaceChildren();
    setPageState("error");
    updateEmptyState("Không thể tải dữ liệu tìm kiếm lúc này. Vui lòng thử lại sau.");
  } finally {
    window.BiaCungPageLoader?.hide();
  }
}

loadMoreButton?.addEventListener("click", () => {
  appendVisibleResults();
});

renderResults();
