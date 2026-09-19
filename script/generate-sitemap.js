const fs = require("fs");
const path = require("path");

const SITE_URL = "https://biacung.com";

function normalizeText(value) {
  return value == null ? "" : String(value).trim();
}

function loadJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    return fallback;
  }
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function getTodayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function getBookEntries(rootDir) {
  const bookIndex = loadJson(path.join(rootDir, "data", "book.json"), []);

  return (Array.isArray(bookIndex) ? bookIndex : [])
    .map((entry) => {
      const detail = normalizeText(entry?.detail);
      const slug = detail.replace(/^data\/book\//, "").replace(/\.json$/, "");
      return {
        slug,
        detail,
        updatedAt: normalizeText(entry?.updated_at)
      };
    })
    .filter((entry) => entry.slug && entry.detail);
}

function getSeriesEntries(rootDir, bookEntries, fallbackDate) {
  const seriesIndex = loadJson(path.join(rootDir, "data", "series.json"), []);
  const bookUpdatedMap = new Map(bookEntries.map((entry) => [entry.slug, entry.updatedAt || fallbackDate]));

  return (Array.isArray(seriesIndex) ? seriesIndex : [])
    .map((entry) => {
      const id = normalizeText(entry?.id);
      const detailPath = path.join(rootDir, normalizeText(entry?.detail));
      const seriesDetail = loadJson(detailPath, {});
      const workIds = Array.isArray(seriesDetail?.work_ids) ? seriesDetail.work_ids : [];
      const lastmod = workIds
        .map((workId) => bookUpdatedMap.get(normalizeText(workId)))
        .filter(Boolean)
        .sort()
        .at(-1) || fallbackDate;

      return { id, lastmod };
    })
    .filter((entry) => entry.id);
}

function buildSitemapEntries(rootDir) {
  const today = getTodayIsoDate();
  const bookEntries = getBookEntries(rootDir);
  const latestBookDate = bookEntries.map((entry) => entry.updatedAt).filter(Boolean).sort().at(-1) || today;
  const seriesEntries = getSeriesEntries(rootDir, bookEntries, latestBookDate);
  const publicSeriesEntries = seriesEntries.filter((entry) => entry.id !== "chauchaubook");
  const latestSeriesDate = publicSeriesEntries.map((entry) => entry.lastmod).filter(Boolean).sort().at(-1) || latestBookDate;

  return [
    { loc: `${SITE_URL}/`, lastmod: latestBookDate },
    { loc: `${SITE_URL}/about` },
    { loc: `${SITE_URL}/chauchaubook` },
    { loc: `${SITE_URL}/chauchaubook/works`, lastmod: latestBookDate },
    { loc: `${SITE_URL}/series`, lastmod: latestSeriesDate },
    ...publicSeriesEntries.map((entry) => ({
      loc: `${SITE_URL}/series?id=${encodeURIComponent(entry.id)}`,
      lastmod: entry.lastmod
    })),
    ...bookEntries.map((entry) => ({
      loc: `${SITE_URL}/detail?id=${encodeURIComponent(entry.slug)}`,
      lastmod: entry.updatedAt || latestBookDate
    }))
  ];
}

function buildSitemapXml(rootDir) {
  const entries = buildSitemapEntries(rootDir);
  const lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];

  entries.forEach((entry) => {
    lines.push("  <url>");
    lines.push(`    <loc>${escapeXml(entry.loc)}</loc>`);
    if (entry.lastmod) {
      lines.push(`    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`);
    }
    lines.push("  </url>");
  });

  lines.push("</urlset>");
  return `${lines.join("\n")}\n`;
}

function writeSitemap(rootDir) {
  const xml = buildSitemapXml(rootDir);
  fs.writeFileSync(path.join(rootDir, "sitemap.xml"), xml);
  return xml;
}

if (require.main === module) {
  writeSitemap(process.cwd());
}

module.exports = {
  buildSitemapEntries,
  buildSitemapXml,
  writeSitemap
};
