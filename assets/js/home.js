const HOME_DATA_URL = "data/home.json";
const BOOK_INDEX_URL = "data/book.json";
const BOOK_DETAIL_FALLBACK = "assets/img/core/book-cover.png.avif";
const SERIES_DETAIL_URL = "data/series";

function normalizeText(value) {
  return value == null ? "" : String(value).trim();
}

function safeUrl(value) {
  return normalizeText(value).replace(/\s+/g, "");
}

function buildSearchUrl(keyword) {
  const query = normalizeText(keyword);
  return query ? `search.html?q=${encodeURIComponent(query)}` : "search.html";
}

function buildDetailUrl(bookId) {
  const id = normalizeText(bookId);
  return id ? `detail.html?id=${encodeURIComponent(id)}` : "";
}

function buildSeriesDetailUrlPage(seriesId) {
  const id = normalizeText(seriesId);
  return id ? `series.html?id=${encodeURIComponent(id)}` : "";
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

function getSectionGrid(sectionElement) {
  return sectionElement.querySelector("[data-section-grid]");
}

function getSectionLimit(sectionConfig) {
  return Number(sectionConfig.limit) || 0;
}

function getLimitedItemIds(sectionConfig) {
  const itemIds = Array.isArray(sectionConfig.item_ids) ? sectionConfig.item_ids : [];
  const limit = getSectionLimit(sectionConfig);
  return limit > 0 ? itemIds.slice(0, limit) : itemIds;
}

function buildSeriesDetailUrl(seriesId) {
  return `${SERIES_DETAIL_URL}/${encodeURIComponent(seriesId)}.json`;
}

async function loadRecentBooks(bookIndex, limit) {
  const entries = Array.isArray(bookIndex) ? bookIndex : [];
  const maxItems = limit > 0 ? limit : entries.length;
  const books = [];

  for (const entry of entries) {
    if (books.length >= maxItems) {
      break;
    }

    const detailPath = normalizeText(entry.detail);
    if (!detailPath) {
      continue;
    }

    const book = await fetchOptionalJson(detailPath);
    if (book) {
      books.push(book);
    }
  }

  return books;
}

function createCard({ title, subtitle, description, image, href, meta }) {
  const article = document.createElement("article");
  article.className = "book-card";

  const link = document.createElement("a");
  link.href = href;

  const img = document.createElement("img");
  img.className = "cover";
  img.src = image || BOOK_DETAIL_FALLBACK;
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
    img.src = BOOK_DETAIL_FALLBACK;
  });

  const media = document.createElement("div");
  media.className = "book-media";
  media.appendChild(img);

  const content = document.createElement("div");
  content.className = "book-card-content";

  const heading = document.createElement("h3");
  heading.className = "book-title";
  heading.textContent = title || "Không có tiêu đề";

  content.appendChild(heading);

  if (subtitle) {
    const author = document.createElement("p");
    author.className = "book-subtitle";
    author.textContent = subtitle;
    content.appendChild(author);
  }

  if (description) {
    const note = document.createElement("p");
    note.className = "book-description";
    note.textContent = description;
    content.appendChild(note);
  }

  if (meta) {
    const metaText = document.createElement("p");
    metaText.className = "book-meta";
    metaText.textContent = meta;
    content.appendChild(metaText);
  }

  link.append(media, content);
  article.appendChild(link);
  return article;
}

function setSectionState(section, message, type = "loading") {
  const status = section.querySelector("[data-section-status]");
  if (!status) {
    return;
  }

  if (type === "ready") {
    status.hidden = true;
    status.textContent = "";
    return;
  }

  status.hidden = false;
  status.textContent = message;
  status.dataset.state = type;
}

async function renderSeriesSection(sectionConfig, sectionElement) {
  const grid = getSectionGrid(sectionElement);
  const itemIds = getLimitedItemIds(sectionConfig);

  if (!grid) {
    return;
  }

  if (!itemIds.length) {
    setSectionState(sectionElement, "Chưa có dữ liệu cho mục này.");
    return;
  }

  const seriesDetails = await Promise.all(
    itemIds.map((seriesId) => fetchOptionalJson(buildSeriesDetailUrl(seriesId)))
  );

  const validSeries = seriesDetails.filter(Boolean);

  if (!validSeries.length) {
    setSectionState(sectionElement, "Chưa tải được dữ liệu series.");
    return;
  }

  grid.replaceChildren();
  validSeries.forEach((series) => {
    const workCount = Array.isArray(series.work_ids) ? series.work_ids.length : 0;
    const card = createCard({
      title: normalizeText(series.name || series.id),
      subtitle: workCount ? `${workCount} tác phẩm` : "Series tuyển chọn",
      image: safeUrl(series.thumbnail) || BOOK_DETAIL_FALLBACK,
      href: buildSeriesDetailUrlPage(series.id)
    });

    grid.appendChild(card);
  });

  setSectionState(sectionElement, "", "ready");
}

async function renderRecentSection(sectionConfig, sectionElement) {
  const grid = getSectionGrid(sectionElement);
  const limit = getSectionLimit(sectionConfig);

  if (!grid) {
    return;
  }

  const bookIndex = await fetchJson(BOOK_INDEX_URL);
  const recentEntries = Array.isArray(bookIndex) ? bookIndex : [];

  if (!recentEntries.length) {
    setSectionState(sectionElement, "Chưa có sách mới trong kho dữ liệu.");
    return;
  }

  const validBooks = await loadRecentBooks(recentEntries, limit);

  if (!validBooks.length) {
    setSectionState(sectionElement, "Chưa tải được dữ liệu bìa mới.");
    return;
  }

  grid.replaceChildren();
  validBooks.forEach((book) => {
    const editions = Array.isArray(book.editions) ? book.editions : [];
    const firstEdition = editions[0] || {};
    const authors = Array.isArray(book.authors) ? book.authors.join(", ") : "";
    const meta = editions.length ? `(${editions.length} phiên bản)` : "";

    const card = createCard({
      title: normalizeText(book.title || book.title_original || book.id),
      subtitle: authors,
      // description: normalizeText(firstEdition.caption || ""),
      image: safeUrl(firstEdition.thumbnail || book.thumbnail) || BOOK_DETAIL_FALLBACK,
      href: buildDetailUrl(book.id),
      meta
    });

    grid.appendChild(card);
  });

  setSectionState(sectionElement, "", "ready");
}

const SECTION_RENDERERS = {
  "series-focus": renderSeriesSection,
  "recently-archived": renderRecentSection
};

async function main() {
  const sections = document.querySelectorAll("[data-home-section]");
  if (!sections.length) {
    window.BiaCungPageLoader?.hide();
    return;
  }

  try {
    const homeConfig = await fetchJson(HOME_DATA_URL);

    await Promise.all(
      Array.from(sections).map(async (sectionElement) => {
        const sectionId = sectionElement.dataset.homeSection;
        const sectionConfig = homeConfig.find((entry) => entry.id === sectionId);
        const renderSection = SECTION_RENDERERS[sectionId];

        if (!sectionConfig) {
          setSectionState(sectionElement, "Mục này chưa được cấu hình.");
          return;
        }

        if (!renderSection) {
          setSectionState(sectionElement, "Mục này chưa hỗ trợ hiển thị.");
          return;
        }

        try {
          await renderSection(sectionConfig, sectionElement);
        } catch (error) {
          setSectionState(sectionElement, "Có lỗi khi tải dữ liệu.");
        }
      })
    );
  } catch (error) {
    sections.forEach((section) => setSectionState(section, "Không tải được cấu hình trang chủ."));
  } finally {
    window.BiaCungPageLoader?.hide();
  }
}

main();
