const AWARD_DATASETS = [
  {
    id: "nobel-literature",
    url: "/data/awards/nobel_literature.json",
    shortName: "Nobel",
    kind: "person"
  },
  {
    id: "pulitzer-fiction",
    url: "/data/awards/pulitzer_fiction.json",
    shortName: "Pulitzer",
    kind: "book"
  },
  {
    id: "booker-prize",
    url: "/data/awards/booker_prize.json",
    shortName: "Booker",
    kind: "book"
  }
];

const statusNode = document.querySelector("[data-award-status]");
const yearsNode = document.querySelector("[data-award-years]");

function normalizeText(value) {
  return value == null ? "" : String(value).trim();
}

function createElement(tagName, className, textContent) {
  const node = document.createElement(tagName);
  if (className) node.className = className;
  if (textContent) node.textContent = textContent;
  return node;
}

function getSafeAssetUrl(value) {
  const normalized = normalizeText(value).replace(/^\/+/, "");
  return /^assets\/img\/[a-z0-9_./-]+$/i.test(normalized) ? `/${normalized}` : "";
}

function formatAnnouncementDate(value) {
  const match = normalizeText(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return "";

  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC"
  }).format(date);
}

function addMetaItem(list, label, value) {
  if (!normalizeText(value)) return;
  const wrapper = document.createElement("div");
  wrapper.append(createElement("dt", "", label), createElement("dd", "", normalizeText(value)));
  list.append(wrapper);
}

function renderPortrait(laureate) {
  const figure = createElement("figure", "laureate-portrait");
  const photo = laureate?.photo || {};
  const src = getSafeAssetUrl(photo.src);

  if (src) {
    const image = document.createElement("img");
    image.src = src;
    image.alt = normalizeText(photo.alt) || `Chân dung ${normalizeText(laureate.name)}`;
    image.width = 496;
    image.height = 744;
    image.loading = "lazy";
    figure.append(image);
  }

  const caption = createElement("figcaption", "laureate-credit");
  caption.append(`Ảnh: ${normalizeText(photo.creator) || "không rõ"}`);

  if (photo.license) {
    caption.append(` · ${normalizeText(photo.license)}`);
  }

  figure.append(caption);
  return figure;
}

function renderPersonWinner(laureate) {
  const article = createElement("article", "laureate-card");
  article.append(renderPortrait(laureate));

  const content = createElement("div", "laureate-content");
  content.append(createElement("p", "laureate-label", "Người đoạt giải"));

  const heading = createElement("h3", "laureate-title");
  heading.textContent = normalizeText(laureate.name);
  content.append(heading);

  const meta = createElement("dl", "laureate-meta");
  addMetaItem(meta, "Quốc tịch", laureate.country_vi || laureate.country);
  addMetaItem(meta, "Sinh", [laureate.born_year, laureate.born_place].filter(Boolean).join(" · "));
  content.append(meta);

  const quote = createElement("blockquote", "laureate-motivation");
  quote.append(createElement("cite", "", "— Lý do trao giải"));
  quote.append(createElement("p", "", `“${normalizeText(laureate.motivation_vi || laureate.motivation)}”`));
  content.append(quote);


  if (laureate.motivation_vi && laureate.motivation) {
    const original = createElement("div", "laureate-original");
    const originalText = createElement("p", "", `“${normalizeText(laureate.motivation)}”`);
    originalText.lang = "en";
    original.append(originalText);
    content.append(original);
  }

  article.append(content);
  return article;
}

function getInternalBookIds(bookIndex) {
  const entries = Array.isArray(bookIndex) ? bookIndex : [];
  return new Set(entries.flatMap((entry) => {
    const match = normalizeText(entry?.detail).match(/^data\/book\/([a-z0-9-]+)\.json$/);
    return match ? [match[1]] : [];
  }));
}

function getInternalWorkUrl(work, internalBookIds) {
  const workId = normalizeText(work?.id);
  if (/^[a-z0-9-]+$/.test(workId) && internalBookIds.has(workId)) {
    return `/detail?id=${encodeURIComponent(workId)}`;
  }
  return "";
}

function renderBookCover(work) {
  const figure = createElement("figure", "prize-book-cover");
  const cover = work?.cover || {};
  const src = getSafeAssetUrl(cover.src);

  if (src) {
    const image = document.createElement("img");
    image.src = src;
    image.alt = normalizeText(cover.alt) || `Bìa sách ${normalizeText(work.title)}`;
    image.width = 400;
    image.height = 600;
    image.loading = "lazy";
    figure.append(image);
  }

  return figure;
}

function renderBookWinner(laureate, internalBookIds) {
  const work = laureate?.work || {};
  const article = createElement("article", "prize-book-card");
  article.append(renderBookCover(work));

  const content = createElement("div", "prize-book-content");
  content.append(createElement("p", "laureate-label", "Tác phẩm đoạt giải"));

  const title = createElement("h3", "prize-book-title");
  const workUrl = getInternalWorkUrl(work, internalBookIds);
  if (workUrl) {
    const link = createElement("a", "", normalizeText(work.title));
    link.href = workUrl;
    title.append(link);
  } else {
    title.textContent = normalizeText(work.title);
  }
  content.append(title);
  content.append(createElement("p", "prize-book-author", normalizeText(laureate.name)));

  const meta = createElement("dl", "laureate-meta prize-book-meta");
  addMetaItem(meta, "Nhà xuất bản", work.publisher);
  addMetaItem(meta, "Xuất bản", work.published_year);
  addMetaItem(meta, "Giá trị giải", laureate.prize_amount);
  content.append(meta);

  const citation = normalizeText(laureate.citation_vi || laureate.citation);
  if (citation) {
    const quote = createElement("blockquote", "laureate-motivation prize-book-citation");
    if (laureate.citation_vi && laureate.citation) {
      quote.append(createElement("cite", "", "— Nhận định của hội đồng"));
    }
    quote.append(createElement("p", "", citation));
    content.append(quote);
  }

  article.append(content);
  return article;
}

function renderPendingAward(year) {
  const announced = formatAnnouncementDate(year.announcement_date);
  const article = createElement("article", "award-pending");
  article.append(createElement("p", "award-pending-label", "Chưa công bố"));

  const heading = createElement("h3", "award-pending-title");
  heading.append("Chờ công bố vào ngày ");
  const time = createElement("time", "", announced || "đang cập nhật");
  if (normalizeText(year.announcement_date)) time.dateTime = year.announcement_date;
  heading.append(time);
  article.append(heading);

  const note = createElement(
    "p",
    "award-pending-note",
    normalizeText(year.status_note) || "Bìa Cứng sẽ cập nhật kết quả ngay sau thông báo chính thức."
  );
  article.append(note);

  return article;
}

function renderAwardGroup(dataset, payload, yearKey, internalBookIds) {
  const year = payload?.laureates_by_year?.[yearKey] || {};
  const laureates = Array.isArray(year.laureates) ? year.laureates : [];
  const isPending = year.status === "pending";
  if (!isPending && !laureates.length) throw new Error(`${dataset.shortName} không có dữ liệu năm ${yearKey}`);

  const section = createElement("section", "award-group");
  section.id = `${dataset.id}-${yearKey}`;
  section.setAttribute("aria-labelledby", `${dataset.id}-${yearKey}-title`);

  const header = createElement("header", "award-group-header");
  const name = createElement("h3", "award-name");
  name.id = `${dataset.id}-${yearKey}-title`;
  name.textContent = dataset.shortName;
  header.append(name);

  const announced = formatAnnouncementDate(isPending ? year.announcement_date : year.announced_on);
  const detailText = isPending
    ? (announced ? `Dự kiến ${announced}` : "Đang chờ lịch công bố")
    : (announced ? `Công bố ${announced}` : "Đã công bố");
  const detail = createElement("p", "award-group-date", detailText);
  header.append(detail);

  const entries = createElement("div", "award-entries");
  if (isPending) {
    entries.append(renderPendingAward(year));
  } else {
    entries.append(...laureates.map((laureate) => (
      dataset.kind === "person"
        ? renderPersonWinner(laureate)
        : renderBookWinner(laureate, internalBookIds)
    )));
  }
  section.append(header, entries);
  return section;
}

function renderAwardYearContent(yearKey, payloads, internalBookIds) {
  const groups = createElement("div", "award-groups");
  groups.append(...payloads.map((payload, index) => (
    renderAwardGroup(AWARD_DATASETS[index], payload, yearKey, internalBookIds)
  )));
  return groups;
}

function renderDisclosureIcon() {
  const icon = createElement("span", "award-disclosure-icon");
  icon.setAttribute("aria-hidden", "true");
  return icon;
}

function renderAwardYear(yearKey, payloads, internalBookIds, isInitial) {
  const details = createElement("details", "award-year");
  const summary = createElement("summary", "award-year-summary");
  const heading = createElement("h2", "", yearKey);
  heading.id = `year-${yearKey}`;
  summary.append(renderDisclosureIcon(), heading);

  const panel = createElement("div", "award-year-panel");
  let isRendered = false;
  const renderContent = () => {
    if (isRendered) return;
    panel.append(renderAwardYearContent(yearKey, payloads, internalBookIds));
    isRendered = true;
  };

  details.append(summary, panel);
  details.open = isInitial;
  if (isInitial) renderContent();

  details.addEventListener("toggle", () => {
    if (!details.open) return;
    yearsNode.querySelectorAll(".award-year[open]").forEach((year) => {
      if (year !== details) year.open = false;
    });
    renderContent();
    updateYearLocation(yearKey);
  });
  return details;
}

function renderAwardDecade(decade, yearKeys, payloads, internalBookIds, initialYear) {
  const details = createElement("details", "award-decade");
  const summary = createElement("summary", "award-decade-summary");
  summary.append(renderDisclosureIcon(), createElement("span", "", `${decade}s`));

  const list = createElement("div", "award-decade-years");
  list.append(...yearKeys.map((yearKey) => (
    renderAwardYear(yearKey, payloads, internalBookIds, yearKey === initialYear)
  )));
  details.append(summary, list);
  details.open = yearKeys.includes(initialYear);

  details.addEventListener("toggle", () => {
    if (!details.open) return;
    yearsNode.querySelectorAll(".award-decade[open]").forEach((item) => {
      if (item !== details) item.open = false;
    });
  });
  return details;
}

function getPublishedYears(payloads) {
  const yearSets = payloads.map((payload) => new Set(Object.keys(payload?.laureates_by_year || {})));
  if (!yearSets.length) return [];
  return [...yearSets[0]]
    .filter((yearKey) => yearSets.every((years) => years.has(yearKey)))
    .sort((a, b) => Number(b) - Number(a));
}

function groupYearsByDecade(yearKeys) {
  const groups = new Map();
  yearKeys.forEach((yearKey) => {
    const decade = Math.floor(Number(yearKey) / 10) * 10;
    if (!groups.has(decade)) groups.set(decade, []);
    groups.get(decade).push(yearKey);
  });
  return groups;
}

function getRequestedYear(publishedYears) {
  const pathYear = window.location.pathname.match(/^\/award\/(\d{4})\/?$/)?.[1];
  const hashYear = window.location.hash.match(/^#year-(\d{4})$/)?.[1];
  const requestedYear = pathYear || hashYear;
  return publishedYears.includes(requestedYear) ? requestedYear : "";
}

function updateYearLocation(yearKey) {
  const path = `/award/${yearKey}/`;
  window.history.replaceState(null, "", path);
  document.title = `Giải thưởng sách và văn học ${yearKey} | Bìa Cứng`;

  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.href = `https://biacung.com${path}`;
}

async function fetchJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.json();
}

async function loadAwards() {
  try {
    const [payloads, bookIndex] = await Promise.all([
      Promise.all(AWARD_DATASETS.map((dataset) => fetchJson(dataset.url))),
      fetchJson("/data/book.json")
    ]);
    const internalBookIds = getInternalBookIds(bookIndex);
    const publishedYears = getPublishedYears(payloads);
    if (!publishedYears.length) throw new Error("Không có năm nào đủ dữ liệu giải thưởng");

    const requestedYear = getRequestedYear(publishedYears);
    const initialYear = requestedYear || publishedYears[0];
    const decades = [...groupYearsByDecade(publishedYears)].map(([decade, yearKeys]) => (
      renderAwardDecade(decade, yearKeys, payloads, internalBookIds, initialYear)
    ));

    yearsNode.replaceChildren(...decades);
    yearsNode.hidden = false;
    statusNode.hidden = true;

    if (window.location.hash && requestedYear) updateYearLocation(initialYear);
  } catch (error) {
    statusNode.className = "award-data-error";
    statusNode.textContent = "Chưa thể tải đầy đủ hồ sơ giải thưởng. Vui lòng thử tải lại trang.";
    console.error("Award data error:", error);
  }
}

if (statusNode && yearsNode) {
  loadAwards();
}
