const BOOK_INDEX_URL = "data/book.json";
const BOOK_FALLBACK_COVER = "/assets/img/core/book-cover.png.avif";
const PAGE_SIZE = 16;
const SAFE_BOOK_ID = /^[a-z0-9-]+$/;
const SAFE_BOOK_DETAIL_PATH = /^data\/book\/[a-z0-9-]+\.json$/;
const CHAUCHAUBOOK_NAME = "chauchaubook";

const page = document.querySelector(".chauchaubook-page");
const titleNode = document.querySelector("[data-chauchaubook-title]");
const kickerNode = document.querySelector("[data-chauchaubook-kicker]");
const emptyNode = document.querySelector("[data-chauchaubook-empty]");
const resultsNode = document.querySelector("[data-chauchaubook-results]");
const actionsNode = document.querySelector("[data-chauchaubook-actions]");
const loadMoreButton = document.querySelector("[data-chauchaubook-load-more]");
const managedImageLoader = window.BiaCungImageLoader;
const skeletonRenderer = window.BiaCungSkeleton;

let currentResults = [];
let visibleCount = 0;

function normalizeText(value) {
  return value == null ? "" : String(value).trim();
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

function buildDetailUrl(bookId) {
  const value = normalizeText(bookId);
  return value ? `detail.html?id=${encodeURIComponent(value)}` : "detail.html";
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

function setPageState(state) {
  page?.classList.toggle("is-loading", state === "loading");
  page?.classList.toggle("is-empty", state === "empty" || state === "error");
  page?.classList.toggle("is-ready", state === "ready");
}

function setLoadMoreState() {
  if (!actionsNode || !loadMoreButton) {
    return;
  }

  actionsNode.hidden = visibleCount >= currentResults.length;
}

function createCard(result) {
  const article = document.createElement("article");
  article.className = "book-card";

  const link = document.createElement("a");
  link.href = result.href;

  const media = document.createElement("div");
  media.className = "book-media";

  const img = document.createElement("img");
  img.className = "cover";
  img.width = 360;
  img.height = 500;
  managedImageLoader?.mount({
    imageNode: img,
    frameNode: media,
    src: normalizeUrl(result.image),
    alt: result.title ? `Bìa sách ${result.title}` : "Bìa sách",
    fallbackSrc: BOOK_FALLBACK_COVER
  });
  media.appendChild(img);

  const content = document.createElement("div");
  content.className = "book-card-content";

  const heading = document.createElement("h3");
  heading.className = "book-title";
  heading.textContent = result.title || "Không có tiêu đề";
  content.appendChild(heading);

  if (result.subtitle) {
    const subtitleNode = document.createElement("p");
    subtitleNode.className = "book-subtitle";
    subtitleNode.textContent = result.subtitle;
    content.appendChild(subtitleNode);
  }

  if (result.meta) {
    const metaNode = document.createElement("p");
    metaNode.className = "book-meta";
    metaNode.textContent = result.meta;
    content.appendChild(metaNode);
  }

  link.append(media, content);
  article.appendChild(link);
  return article;
}

function appendVisibleResults() {
  if (!resultsNode || visibleCount >= currentResults.length) {
    setLoadMoreState();
    return;
  }

  const nextVisibleCount = Math.min(visibleCount + PAGE_SIZE, currentResults.length);
  currentResults.slice(visibleCount, nextVisibleCount).forEach((result) => {
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

function renderLoadingSkeletons(count = PAGE_SIZE) {
  skeletonRenderer?.renderBookCardGrid(resultsNode, count);
}

function updatePageCopy() {
  if (kickerNode) {
    kickerNode.textContent = "Chauchaubook";
  }
  if (titleNode) {
    titleNode.textContent = "Kết quả Chauchaubook";
  }
}

function normalizeName(value) {
  return normalizeText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase();
}

function hasChauchaubookFormat(edition) {
  return normalizeName(edition?.format) === CHAUCHAUBOOK_NAME;
}

function pickEditionShowcaseImage(edition) {
  const candidates = [
    edition?.thumbnail,
    ...(Array.isArray(edition?.gellery_imgs) ? edition.gellery_imgs : [])
  ]
    .map((value) => normalizeUrl(value))
    .filter(Boolean);

  const localAsset = candidates.find((value) => value.startsWith("/") || value.startsWith("assets/"));
  return localAsset || candidates[0] || "";
}

async function loadChauchaubookResults() {
  const bookIndex = await fetchJson(BOOK_INDEX_URL);
  const entries = Array.isArray(bookIndex) ? bookIndex : [];
  const books = await Promise.all(
    entries.map(async (entry) => {
      const detailPath = normalizeText(entry?.detail);
      if (!SAFE_BOOK_DETAIL_PATH.test(detailPath)) {
        return null;
      }

      return fetchOptionalJson(detailPath);
    })
  );

  const results = [];

  books.filter(Boolean).forEach((book) => {
    const bookId = normalizeText(book?.id);
    if (!SAFE_BOOK_ID.test(bookId)) {
      return;
    }

    const editions = Array.isArray(book?.editions) ? book.editions : [];
    editions.forEach((edition) => {
      if (!hasChauchaubookFormat(edition)) {
        return;
      }

      results.push({
        bookId,
        title: normalizeText(book.title || book.title_original || book.id),
        subtitle: Array.isArray(book.authors) ? book.authors.join(", ") : "",
        meta: normalizeText(edition.caption) || "Phiên bản Chauchaubook",
        image: pickEditionShowcaseImage(edition),
        href: buildDetailUrl(book.id),
        pubYear: Number(edition.pub_year) || null
      });
    });
  });

  return results.sort((left, right) => {
    const yearDelta = (right.pubYear || 0) - (left.pubYear || 0);
    if (yearDelta !== 0) {
      return yearDelta;
    }

    return left.title.localeCompare(right.title, "vi");
  });
}

async function renderPage() {
  if (!resultsNode || !emptyNode) {
    window.BiaCungPageLoader?.hide();
    return;
  }

  setPageState("loading");
  renderLoadingSkeletons();
  emptyNode.textContent = "Đang tải tuyển tập Chauchaubook...";
  window.BiaCungPageLoader?.handoff("Đang tải trang Chauchaubook...");

  try {
    const results = await loadChauchaubookResults();

    updatePageCopy();
    document.title = "Chauchaubook | Bìa Cứng";

    if (!results.length) {
      resultsNode.replaceChildren();
      emptyNode.textContent = "Hiện chưa có tác phẩm nào được gắn vào bộ sưu tập Chauchaubook.";
      setPageState("empty");
      return;
    }

    setResults(results);
    setPageState("ready");
  } catch (error) {
    resultsNode?.replaceChildren();
    emptyNode.textContent = "Không thể tải bộ sưu tập Chauchaubook lúc này. Vui lòng thử lại sau.";
    setPageState("error");
  } finally {
    window.BiaCungPageLoader?.hide();
  }
}

loadMoreButton?.addEventListener("click", () => {
  appendVisibleResults();
});

renderPage();
