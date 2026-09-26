const fs = require("fs");
const path = require("path");
const { buildSitemapXml, buildSitemapEntries } = require("./generate-sitemap");
const { buildYearPage, getPublishedYears } = require("./generate-award-pages");
const { resolveRequestPath } = require("./static-server");

function normalizeText(value) {
  return value == null ? "" : String(value).trim();
}

function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    return "";
  }
}

function readJsonSafe(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    return fallback;
  }
}

function pushIfMissing(list, condition, message) {
  if (!condition) {
    list.push(message);
  }
}

function auditStaticPages(rootDir, errors) {
  const awardPayloads = ["nobel_literature.json", "pulitzer_fiction.json", "booker_prize.json"]
    .map((file) => readJsonSafe(path.join(rootDir, "data", "awards", file), {}));
  const awardYears = getPublishedYears(awardPayloads);
  const awardYearPages = awardYears.map((year) => `award/${year}/index.html`);
  const navPages = [
    "index.html",
    "about.html",
    "search.html",
    "series.html",
    "detail.html",
    "award/index.html",
    "chauchaubook.html",
    "chauchaubook/works/index.html",
    ...awardYearPages
  ];
  const pageRules = [
    {
      file: "index.html",
      checks: [
        'meta name="description"',
        'meta name="robots" content="index,follow,max-image-preview:large"',
        'meta property="og:title"',
        'rel="canonical" href="https://biacung.com/"',
        'type="application/ld+json"',
        'target": "https://biacung.com/search?q={search_term_string}"'
      ]
    },
    {
      file: "about.html",
      checks: [
        'meta name="description"',
        'meta name="robots" content="index,follow,max-image-preview:large"',
        'type="application/ld+json"'
      ]
    },
    {
      file: "chauchaubook.html",
      checks: [
        'meta name="description"',
        'meta name="robots" content="index,follow,max-image-preview:large"',
        'type="application/ld+json"',
        'rel="canonical" href="https://biacung.com/chauchaubook"',
        'assets/css/chauchaubook-portfolio.css?v=',
        'https://znews.vn/nghi-viec-9x-kiem-tien-tu-nghe-do-bia-cho-sach-post1587206.html',
        'https://tuoitre.vn/co-gai-bo-viec-hoc-phuc-che-sach-giu-ky-uc-tu-nhung-trang-giay-cu-10026082810194445.htm',
        'https://www.vietnam.vn/en/co-gai-bo-viec-hoc-phuc-che-sach-giu-ky-uc-tu-nhung-trang-giay-cu'
      ]
    },
    {
      file: "chauchaubook/works/index.html",
      checks: [
        'meta name="description"',
        'meta name="robots" content="index,follow,max-image-preview:large"',
        'type="application/ld+json"',
        'rel="canonical" href="https://biacung.com/chauchaubook/works"'
      ]
    },
    {
      file: "series.html",
      checks: [
        'meta name="description"',
        'meta name="robots" content="index,follow,max-image-preview:large"',
        'id="series-structured-data"',
        'src="assets/js/seo.js"'
      ]
    },
    {
      file: "detail.html",
      checks: [
        'meta name="description"',
        'meta name="robots" content="index,follow,max-image-preview:large"',
        'id="book-structured-data"',
        'src="assets/js/seo.js"'
      ]
    },
    {
      file: "search.html",
      checks: ['meta name="robots" content="noindex,follow"']
    },
    {
      file: "award/index.html",
      checks: [
        'meta name="robots" content="index,follow,max-image-preview:large"',
        'type="application/ld+json"',
        'rel="canonical" href="https://biacung.com/award/"',
        'data-award-years'
      ]
    }
  ];

  awardYears.forEach((year) => {
    pageRules.push({
      file: `award/${year}/index.html`,
      checks: [
        `rel="canonical" href="https://biacung.com/award/${year}/"`,
        `Giải thưởng sách và văn học ${year}`,
        'data-award-years'
      ]
    });
  });

  pageRules.forEach((rule) => {
    const content = readFileSafe(path.join(rootDir, rule.file));
    rule.checks.forEach((snippet) => {
      pushIfMissing(errors, content.includes(snippet), `${rule.file} is missing required snippet: ${snippet}`);
    });
  });

  navPages.forEach((file) => {
    const content = readFileSafe(path.join(rootDir, file));
    pushIfMissing(
      errors,
      content.includes('href="/award/"'),
      `${file} is missing award navigation link`
    );
    pushIfMissing(
      errors,
      content.includes('href="/chauchaubook" aria-haspopup="true">Chauchaubook</a>'),
      `${file} is missing Chauchaubook navigation link`
    );
    pushIfMissing(
      errors,
      content.includes('href="/chauchaubook/works">Tác phẩm</a>'),
      `${file} is missing Chauchaubook works submenu link`
    );
    pushIfMissing(
      errors,
      content.includes('href="/chauchaubook">Câu chuyện &amp; Quy trình</a>'),
      `${file} is missing Chauchaubook story and process submenu link`
    );
    pushIfMissing(
      errors,
      !/(?:href|src)=["']\/[^"']*\.html(?:[?#][^"']*)?["']/.test(content),
      `${file} contains an internal public URL with an .html suffix`
    );
  });

  const cssVersionChecks = [
    { file: "index.html", snippets: ['assets/css/tokens.css?v=', 'assets/css/home.css?v='] },
    { file: "about.html", snippets: ['assets/css/tokens.css?v=', 'assets/css/home.css?v=', 'assets/css/about.css?v='] },
    {
      file: "chauchaubook.html",
      snippets: [
        'assets/css/tokens.css?v=',
        'assets/css/home.css?v=',
        'assets/css/chauchaubook-portfolio.css?v='
      ]
    },
    {
      file: "chauchaubook/works/index.html",
      snippets: [
        '/assets/css/tokens.css?v=',
        '/assets/css/home.css?v=',
        '/assets/css/search.css?v=',
        '/assets/css/chauchaubook.css?v='
      ]
    },
    { file: "search.html", snippets: ['assets/css/tokens.css?v=', 'assets/css/home.css?v=', 'assets/css/search.css?v='] },
    { file: "series.html", snippets: ['assets/css/tokens.css?v=', 'assets/css/home.css?v=', 'assets/css/search.css?v='] },
    { file: "detail.html", snippets: ['assets/css/tokens.css?v=', 'assets/css/home.css?v=', 'assets/css/detail.css?v='] },
    { file: "award/index.html", snippets: ['/assets/css/tokens.css?v=', '/assets/css/home.css?v=', '/assets/css/award.css?v='] }
  ];

  cssVersionChecks.forEach((rule) => {
    const content = readFileSafe(path.join(rootDir, rule.file));
    rule.snippets.forEach((snippet) => {
      pushIfMissing(errors, content.includes(snippet), `${rule.file} is missing CSS cache-busting version: ${snippet}`);
    });
  });

  const jsVersionChecks = [
    { file: "index.html", snippets: ['assets/js/nav.js?v=', 'assets/js/home.js?v='] },
    { file: "about.html", snippets: ['assets/js/nav.js?v='] },
    { file: "chauchaubook.html", snippets: ['assets/js/nav.js?v='] },
    { file: "chauchaubook/works/index.html", snippets: ['/assets/js/nav.js?v=', '/assets/js/chauchaubook.js?v='] },
    { file: "search.html", snippets: ['assets/js/nav.js?v=', 'assets/js/search.js?v='] },
    { file: "series.html", snippets: ['assets/js/nav.js?v=', 'assets/js/series.js?v='] },
    { file: "detail.html", snippets: ['assets/js/nav.js?v=', 'assets/js/detail.js?v='] },
    { file: "award/index.html", snippets: ['/assets/js/nav.js?v=', '/assets/js/award.js?v='] }
  ];

  jsVersionChecks.forEach((rule) => {
    const content = readFileSafe(path.join(rootDir, rule.file));
    rule.snippets.forEach((snippet) => {
      pushIfMissing(errors, content.includes(snippet), `${rule.file} is missing JS cache-busting version: ${snippet}`);
    });
  });

  const awardTemplate = readFileSafe(path.join(rootDir, "award", "index.html"));
  awardYears.forEach((year) => {
    const generated = readFileSafe(path.join(rootDir, "award", year, "index.html"));
    const expected = buildYearPage(awardTemplate, awardPayloads, year);
    pushIfMissing(errors, generated === expected, `award/${year}/index.html is stale. Run npm run generate-award-pages.`);
  });
}

function auditCoreFiles(rootDir, errors) {
  [
    "robots.txt",
    "sitemap.xml",
    "site.webmanifest",
    "assets/css/chauchaubook-portfolio.css",
    "assets/css/award.css",
    "assets/js/award.js",
    "assets/js/seo.js",
    "script/static-server.js",
    "assets/img/favicon/apple-touch-icon.png",
    "assets/img/favicon/android-chrome-192x192.png",
    "assets/img/favicon/android-chrome-512x512.png",
    "assets/img/favicon/favicon-16x16.png",
    "assets/img/favicon/favicon-32x32.png",
    "assets/img/favicon/favicon.ico",
    "assets/img/awards/2025-laszlo-krasznahorkai.jpg",
    "assets/img/awards/2026-angel-down.jpg",
    "assets/img/awards/2025-james.jpg",
    "assets/img/awards/2025-flesh.jpg",
    "data/awards/booker_prize.json"
  ].forEach((relativePath) => {
    pushIfMissing(errors, fs.existsSync(path.join(rootDir, relativePath)), `Missing required file: ${relativePath}`);
  });

  const robots = readFileSafe(path.join(rootDir, "robots.txt"));
  pushIfMissing(errors, robots.includes("Sitemap: https://biacung.com/sitemap.xml"), "robots.txt is missing sitemap declaration");
}

function auditLocalRoutes(rootDir, errors) {
  const routeRules = [
    ["/", "index.html"],
    ["/about", "about.html"],
    ["/chauchaubook", "chauchaubook.html"],
    ["/chauchaubook/works", "chauchaubook/works/index.html"],
    ["/chauchaubook/works/", "chauchaubook/works/index.html"],
    ["/search", "search.html"],
    ["/series", "series.html"],
    ["/detail", "detail.html"],
    ["/award", "award/index.html"],
    ["/award/", "award/index.html"],
    ["/award/2025", "award/2025/index.html"],
    ["/award/2025/", "award/2025/index.html"],
    ["/award/2026", "award/2026/index.html"],
    ["/award/2026/", "award/2026/index.html"],
    ["/about.html", "about.html"],
    ["/detail.html", "detail.html"]
  ];

  routeRules.forEach(([route, expectedFile]) => {
    const resolved = resolveRequestPath(rootDir, route);
    const expected = path.join(rootDir, expectedFile);
    pushIfMissing(errors, resolved === expected, `Local route ${route} does not resolve to ${expectedFile}`);
  });

  pushIfMissing(errors, resolveRequestPath(rootDir, "/missing-page") === null, "Local server does not return 404 for a missing route");
  pushIfMissing(errors, resolveRequestPath(rootDir, "/%2e%2e%2fpackage.json") === null, "Local server allows path traversal");
}

function auditSitemap(rootDir, errors) {
  const expected = buildSitemapXml(rootDir).trim();
  const current = readFileSafe(path.join(rootDir, "sitemap.xml")).trim();
  pushIfMissing(errors, current === expected, "sitemap.xml is stale. Run `node script/generate-sitemap.js`.");

  const entries = buildSitemapEntries(rootDir);
  pushIfMissing(errors, entries.some((entry) => entry.loc === "https://biacung.com/chauchaubook"), "sitemap.xml does not include Chauchaubook page");
  pushIfMissing(errors, entries.some((entry) => entry.loc === "https://biacung.com/award/"), "sitemap.xml does not include award page");
  pushIfMissing(errors, entries.some((entry) => entry.loc === "https://biacung.com/award/2025/"), "sitemap.xml does not include award year 2025");
  pushIfMissing(errors, entries.some((entry) => entry.loc === "https://biacung.com/award/2026/"), "sitemap.xml does not include award year 2026");
  pushIfMissing(errors, entries.some((entry) => entry.loc === "https://biacung.com/chauchaubook/works"), "sitemap.xml does not include Chauchaubook works page");
  pushIfMissing(errors, !entries.some((entry) => entry.loc === "https://biacung.com/series?id=chauchaubook"), "sitemap.xml includes duplicate Chauchaubook series page");
  pushIfMissing(errors, entries.some((entry) => entry.loc.includes("/detail?id=")), "sitemap.xml does not include book detail URLs");
  pushIfMissing(errors, entries.some((entry) => entry.loc.includes("/series?id=")), "sitemap.xml does not include series detail URLs");
  pushIfMissing(errors, !entries.some((entry) => entry.loc.includes("/search")), "sitemap.xml should not include search result pages");
  pushIfMissing(errors, !entries.some((entry) => entry.loc.includes(".html")), "sitemap.xml contains legacy .html URLs");
  pushIfMissing(errors, !current.includes("<changefreq>"), "sitemap.xml contains changefreq values ignored by Google");
  pushIfMissing(errors, !current.includes("<priority>"), "sitemap.xml contains priority values ignored by Google");
}

function auditData(rootDir, errors, warnings) {
  const bookIndex = readJsonSafe(path.join(rootDir, "data", "book.json"), []);
  const seriesIndex = readJsonSafe(path.join(rootDir, "data", "series.json"), []);
  const seriesById = new Map();
  const taggedBooksBySeriesId = new Map();
  const nobelData = readJsonSafe(path.join(rootDir, "data", "awards", "nobel_literature.json"), null);
  const pulitzerData = readJsonSafe(path.join(rootDir, "data", "awards", "pulitzer_fiction.json"), null);
  const bookerData = readJsonSafe(path.join(rootDir, "data", "awards", "booker_prize.json"), null);
  const nobel2026 = nobelData?.laureates_by_year?.["2026"];
  const nobel2025 = nobelData?.laureates_by_year?.["2025"];
  const nobel2025Laureates = Array.isArray(nobel2025?.laureates) ? nobel2025.laureates : [];

  pushIfMissing(errors, Boolean(nobelData), "Invalid JSON: data/awards/nobel_literature.json");
  pushIfMissing(errors, /^\d{4}-\d{2}-\d{2}$/.test(normalizeText(nobelData?.updated_at)), "Nobel literature data is missing updated_at");
  pushIfMissing(errors, nobel2026?.status === "pending", "Nobel literature 2026 must be marked as pending");
  pushIfMissing(errors, nobel2026?.announcement_date === "2026-10-08", "Nobel literature 2026 announcement date is missing or incorrect");
  pushIfMissing(errors, normalizeText(nobel2026?.schedule_source_url).startsWith("https://www.nobelprize.org/"), "Nobel literature 2026 is missing its official schedule URL");
  pushIfMissing(errors, nobel2025?.announced_on === "2025-10-09", "Nobel literature 2025 announcement date is missing or incorrect");
  pushIfMissing(errors, normalizeText(nobel2025?.source_url).startsWith("https://www.nobelprize.org/"), "Nobel literature 2025 is missing its official source URL");
  pushIfMissing(errors, nobel2025Laureates.length === 1, "Nobel literature 2025 must contain exactly one laureate");

  const nobel2025Laureate = nobel2025Laureates[0] || {};
  pushIfMissing(errors, nobel2025Laureate.name === "László Krasznahorkai", "Nobel literature 2025 laureate is incorrect");
  pushIfMissing(errors, Boolean(normalizeText(nobel2025Laureate.motivation)), "Nobel literature 2025 is missing the official motivation");
  pushIfMissing(errors, Boolean(normalizeText(nobel2025Laureate.motivation_vi)), "Nobel literature 2025 is missing the Vietnamese motivation");
  pushIfMissing(
    errors,
    Boolean(normalizeText(nobel2025Laureate?.photo?.src))
      && fs.existsSync(path.join(rootDir, normalizeText(nobel2025Laureate.photo.src))),
    "Nobel literature 2025 portrait is missing"
  );
  pushIfMissing(errors, nobel2025Laureate?.photo?.creator === "Clément Morin", "Nobel literature 2025 portrait credit is missing or incorrect");
  pushIfMissing(errors, nobel2025Laureate?.photo?.license === "© Nobel Prize Outreach", "Nobel literature 2025 portrait copyright is missing or incorrect");

  const pulitzer2026 = pulitzerData?.laureates_by_year?.["2026"];
  const pulitzer2026Winner = Array.isArray(pulitzer2026?.laureates) ? pulitzer2026.laureates[0] : null;
  const pulitzer2025 = pulitzerData?.laureates_by_year?.["2025"];
  const pulitzerWinner = Array.isArray(pulitzer2025?.laureates) ? pulitzer2025.laureates[0] : null;
  pushIfMissing(errors, Boolean(pulitzerData), "Invalid JSON: data/awards/pulitzer_fiction.json");
  pushIfMissing(errors, pulitzer2026?.announced_on === "2026-05-04", "Pulitzer Fiction 2026 announcement date is missing or incorrect");
  pushIfMissing(errors, pulitzer2026Winner?.name === "Daniel Kraus", "Pulitzer Fiction 2026 winner is incorrect");
  pushIfMissing(errors, pulitzer2026Winner?.work?.title === "Angel Down", "Pulitzer Fiction 2026 winning work is incorrect");
  pushIfMissing(errors, Boolean(normalizeText(pulitzer2026Winner?.citation_vi)), "Pulitzer Fiction 2026 is missing the Vietnamese citation");
  pushIfMissing(
    errors,
    Boolean(normalizeText(pulitzer2026Winner?.work?.cover?.src))
      && fs.existsSync(path.join(rootDir, normalizeText(pulitzer2026Winner.work.cover.src))),
    "Pulitzer Fiction 2026 cover is missing"
  );
  pushIfMissing(errors, pulitzer2025?.announced_on === "2025-05-05", "Pulitzer Fiction 2025 announcement date is missing or incorrect");
  pushIfMissing(errors, pulitzerWinner?.name === "Percival Everett", "Pulitzer Fiction 2025 winner is incorrect");
  pushIfMissing(errors, pulitzerWinner?.work?.title === "James", "Pulitzer Fiction 2025 winning work is incorrect");
  pushIfMissing(errors, Boolean(normalizeText(pulitzerWinner?.citation_vi)), "Pulitzer Fiction 2025 is missing the Vietnamese citation");
  pushIfMissing(
    errors,
    Boolean(normalizeText(pulitzerWinner?.work?.cover?.src))
      && fs.existsSync(path.join(rootDir, normalizeText(pulitzerWinner.work.cover.src))),
    "Pulitzer Fiction 2025 cover is missing"
  );

  const booker2026 = bookerData?.laureates_by_year?.["2026"];
  const booker2025 = bookerData?.laureates_by_year?.["2025"];
  const bookerWinner = Array.isArray(booker2025?.laureates) ? booker2025.laureates[0] : null;
  pushIfMissing(errors, Boolean(bookerData), "Invalid JSON: data/awards/booker_prize.json");
  pushIfMissing(errors, booker2026?.status === "pending", "Booker Prize 2026 must be marked as pending");
  pushIfMissing(errors, booker2026?.announcement_date === "2026-11-09", "Booker Prize 2026 announcement date is missing or incorrect");
  pushIfMissing(errors, normalizeText(booker2026?.schedule_source_url).startsWith("https://thebookerprizes.com/"), "Booker Prize 2026 is missing its official schedule URL");
  pushIfMissing(errors, booker2025?.announced_on === "2025-11-10", "Booker Prize 2025 announcement date is missing or incorrect");
  pushIfMissing(errors, bookerWinner?.name === "David Szalay", "Booker Prize 2025 winner is incorrect");
  pushIfMissing(errors, bookerWinner?.work?.title === "Flesh", "Booker Prize 2025 winning work is incorrect");
  pushIfMissing(errors, Boolean(normalizeText(bookerWinner?.citation_vi)), "Booker Prize 2025 is missing the Vietnamese citation");
  pushIfMissing(
    errors,
    Boolean(normalizeText(bookerWinner?.work?.cover?.src))
      && fs.existsSync(path.join(rootDir, normalizeText(bookerWinner.work.cover.src))),
    "Booker Prize 2025 cover is missing"
  );

  (Array.isArray(bookIndex) ? bookIndex : []).forEach((entry) => {
    const detail = normalizeText(entry?.detail);
    pushIfMissing(errors, detail && fs.existsSync(path.join(rootDir, detail)), `Book index points to missing file: ${detail}`);
  });

  const seriesDir = path.join(rootDir, "data", "series");
  fs.readdirSync(seriesDir)
    .filter((file) => file.endsWith(".json"))
    .forEach((file) => {
      const series = readJsonSafe(path.join(seriesDir, file), null);
      if (!series) {
        errors.push(`Invalid JSON: data/series/${file}`);
        return;
      }

      const expectedId = file.replace(/\.json$/, "");
      const seriesId = normalizeText(series.id);
      if (seriesId !== expectedId) {
        errors.push(`Series id mismatch in data/series/${file}: expected "${expectedId}", got "${seriesId}"`);
        return;
      }

      seriesById.set(seriesId, series);
    });

  (Array.isArray(seriesIndex) ? seriesIndex : []).forEach((entry) => {
    const detail = normalizeText(entry?.detail);
    pushIfMissing(errors, detail && fs.existsSync(path.join(rootDir, detail)), `Series index points to missing file: ${detail}`);
  });

  const bookDir = path.join(rootDir, "data", "book");
  fs.readdirSync(bookDir)
    .filter((file) => file.endsWith(".json"))
    .forEach((file) => {
      const absolutePath = path.join(bookDir, file);
      const payload = readJsonSafe(absolutePath, null);
      if (!payload) {
        errors.push(`Invalid JSON: data/book/${file}`);
        return;
      }

      const expectedId = file.replace(/\.json$/, "");
      if (normalizeText(payload.id) !== expectedId) {
        errors.push(`Book id mismatch in data/book/${file}: expected "${expectedId}", got "${normalizeText(payload.id)}"`);
      }

      const editions = Array.isArray(payload.editions) ? payload.editions : [];
      if (!Array.isArray(payload.authors) || !payload.authors.length) {
        warnings.push(`Book is missing authors: data/book/${file}`);
      }
      if (!editions.length) {
        warnings.push(`Book is missing editions: data/book/${file}`);
      }

      editions.forEach((edition, index) => {
        if (edition?.title != null && typeof edition.title !== "string") {
          errors.push(`Edition title must be a string: data/book/${file}#${index + 1}`);
        }
        if (
          normalizeText(edition?.title)
          && normalizeText(edition.title).toLocaleLowerCase("vi") === normalizeText(payload.title).toLocaleLowerCase("vi")
        ) {
          warnings.push(`Redundant edition title duplicates book title: data/book/${file}#${index + 1}`);
        }
        if (edition?.caption != null && typeof edition.caption !== "string") {
          errors.push(`Edition caption must be a string: data/book/${file}#${index + 1}`);
        }
        if (!normalizeText(edition?.thumbnail)) {
          warnings.push(`Edition missing thumbnail: data/book/${file}#${index + 1}`);
        }
        if (!normalizeText(edition?.publisher)) {
          warnings.push(`Edition missing publisher: data/book/${file}#${index + 1}`);
        }

        const seriesIds = edition?.series_ids;
        if (seriesIds != null && !Array.isArray(seriesIds)) {
          errors.push(`Edition series_ids must be an array: data/book/${file}#${index + 1}`);
          return;
        }

        (Array.isArray(seriesIds) ? seriesIds : []).forEach((rawSeriesId) => {
          const seriesId = normalizeText(rawSeriesId);
          if (!seriesId || !seriesById.has(seriesId)) {
            errors.push(`Edition points to unknown series "${seriesId}": data/book/${file}#${index + 1}`);
            return;
          }

          const taggedBooks = taggedBooksBySeriesId.get(seriesId) || new Set();
          taggedBooks.add(expectedId);
          taggedBooksBySeriesId.set(seriesId, taggedBooks);

          const workIds = Array.isArray(seriesById.get(seriesId)?.work_ids)
            ? seriesById.get(seriesId).work_ids
            : [];
          if (!workIds.includes(expectedId)) {
            errors.push(`Edition series "${seriesId}" does not include work "${expectedId}"`);
          }
        });
      });
    });

  taggedBooksBySeriesId.forEach((taggedBooks, seriesId) => {
    const workIds = Array.isArray(seriesById.get(seriesId)?.work_ids)
      ? seriesById.get(seriesId).work_ids
      : [];
    workIds.forEach((workId) => {
      if (!taggedBooks.has(workId)) {
        errors.push(`Migrated series "${seriesId}" has no tagged edition for work "${workId}"`);
      }
    });
  });
}

function printMessages(header, messages) {
  if (!messages.length) {
    return;
  }

  console.log(header);
  messages.forEach((message) => {
    console.log(`- ${message}`);
  });
}

function main() {
  const rootDir = process.cwd();
  const errors = [];
  const warnings = [];

  auditCoreFiles(rootDir, errors);
  auditLocalRoutes(rootDir, errors);
  auditStaticPages(rootDir, errors);
  auditSitemap(rootDir, errors);
  auditData(rootDir, errors, warnings);

  if (!errors.length) {
    console.log("Release audit passed.");
  } else {
    printMessages("Errors:", errors);
  }

  printMessages("Warnings:", warnings.slice(0, 40));

  if (warnings.length > 40) {
    console.log(`- ...and ${warnings.length - 40} more warnings`);
  }

  if (errors.length) {
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}
