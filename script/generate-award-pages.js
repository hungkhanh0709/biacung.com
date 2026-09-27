const fs = require("fs");
const path = require("path");

const SITE_URL = "https://biacung.com";
const AWARD_FILES = ["nobel_literature.json", "pulitzer_fiction.json", "goncourt.json", "booker_prize.json", "goodreads_choice.json"];
const AWARD_NAMES = ["Nobel Văn chương", "Pulitzer Fiction", "Prix Goncourt", "Booker Prize", "Goodreads Choice Awards"];
const AWARD_STRUCTURED_NAMES = ["Nobel Prize in Literature", "Pulitzer Prize for Fiction", "Prix Goncourt", "The Booker Prize", "Goodreads Choice Awards"];

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function escapeAttribute(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceMeta(html, attribute, key, content) {
  const pattern = new RegExp(`(<meta\\s+${attribute}="${escapeRegExp(key)}")\\s+content="[^"]*"`, "i");
  return html.replace(pattern, `$1 content="${escapeAttribute(content)}"`);
}

function isIsoDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));
}

function isCollectedAwardYear(entry) {
  if (!entry || typeof entry !== "object" || !Array.isArray(entry.laureates)) return false;
  if (entry.status === "pending") {
    const hasSchedule = isIsoDate(entry.announcement_date)
      || (isIsoDate(entry.eligibility_start) && isIsoDate(entry.eligibility_end));
    return hasSchedule
      && /^https:\/\//.test(String(entry.schedule_source_url || ""))
      && entry.laureates.length === 0;
  }
  return isIsoDate(entry.announced_on)
    && /^https:\/\//.test(String(entry.source_url || ""))
    && entry.laureates.length > 0;
}

function getPublishedYears(payloads) {
  const years = new Set();
  payloads.forEach((payload) => {
    Object.entries(payload?.laureates_by_year || {}).forEach(([year, entry]) => {
      if (isCollectedAwardYear(entry)) years.add(year);
    });
  });
  return [...years].sort((a, b) => Number(b) - Number(a));
}

function getCollectedAwardIndexes(payloads, year) {
  return payloads.flatMap((payload, index) => (
    isCollectedAwardYear(payload?.laureates_by_year?.[year]) ? [index] : []
  ));
}

function formatVietnameseList(items) {
  if (items.length < 2) return items[0] || "các giải văn học";
  return `${items.slice(0, -1).join(", ")} và ${items.at(-1)}`;
}

function getSocialImage(payloads, year) {
  for (const payload of payloads) {
    if (!isCollectedAwardYear(payload?.laureates_by_year?.[year])) continue;
    const laureates = payload?.laureates_by_year?.[year]?.laureates || [];
    for (const laureate of laureates) {
      const asset = laureate?.photo || laureate?.work?.cover;
      if (asset?.src) {
        return {
          alt: asset.alt || `Giải thưởng sách và văn học ${year}`,
          url: `${SITE_URL}/${String(asset.src).replace(/^\/+/, "")}`
        };
      }
    }
  }

  return {
    alt: `Giải thưởng sách và văn học ${year}`,
    url: `${SITE_URL}/assets/img/favicon/android-chrome-512x512.png`
  };
}

function buildDescription(payloads, year) {
  const awards = formatVietnameseList(
    getCollectedAwardIndexes(payloads, year).map((index) => AWARD_NAMES[index])
  );
  return `Theo dõi kết quả và lịch công bố ${awards} năm ${year}.`;
}

function updateStructuredData(html, payloads, year) {
  return html.replace(
    /(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/,
    (match, opening, jsonText, closing) => {
      const data = JSON.parse(jsonText);
      data.name = `Giải thưởng sách và văn học ${year}`;
      data.url = `${SITE_URL}/award/${year}/`;
      data.description = buildDescription(payloads, year);
      data.about = getCollectedAwardIndexes(payloads, year).map((index) => ({
        "@type": "Thing",
        name: `${AWARD_STRUCTURED_NAMES[index]} ${year}`
      }));
      const formatted = JSON.stringify(data, null, 6).replace(/^/gm, "    ");
      return `${opening}\n${formatted}\n  ${closing}`;
    }
  );
}

function buildYearPage(template, payloads, year) {
  const title = `Giải thưởng sách và văn học ${year} | Bìa Cứng`;
  const description = buildDescription(payloads, year);
  const socialImage = getSocialImage(payloads, year);
  let html = template.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);

  html = replaceMeta(html, "name", "description", description);
  html = replaceMeta(html, "property", "og:url", `${SITE_URL}/award/${year}/`);
  html = replaceMeta(html, "property", "og:title", title);
  html = replaceMeta(html, "property", "og:description", description);
  html = replaceMeta(html, "property", "og:image", socialImage.url);
  html = replaceMeta(html, "property", "og:image:alt", socialImage.alt);
  html = replaceMeta(html, "name", "twitter:title", title);
  html = replaceMeta(html, "name", "twitter:description", description);
  html = replaceMeta(html, "name", "twitter:image", socialImage.url);
  html = html.replace(
    /<link rel="canonical" href="[^"]*"\s*\/>/i,
    `<link rel="canonical" href="${SITE_URL}/award/${year}/" />`
  );
  html = updateStructuredData(html, payloads, year);
  return html.replace("<!DOCTYPE html>", "<!DOCTYPE html>\n<!-- Generated by script/generate-award-pages.js. -->");
}

function writeAwardPages(rootDir = process.cwd()) {
  const template = fs.readFileSync(path.join(rootDir, "award", "index.html"), "utf8");
  const payloads = AWARD_FILES.map((file) => loadJson(path.join(rootDir, "data", "awards", file)));
  const years = getPublishedYears(payloads);

  years.forEach((year) => {
    const outputDir = path.join(rootDir, "award", year);
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(path.join(outputDir, "index.html"), buildYearPage(template, payloads, year));
  });

  return years;
}

if (require.main === module) {
  const years = writeAwardPages();
  console.log(`Generated award year pages: ${years.join(", ")}`);
}

module.exports = { buildYearPage, getPublishedYears, isCollectedAwardYear, writeAwardPages };
