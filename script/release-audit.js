const fs = require("fs");
const path = require("path");
const { buildSitemapXml, buildSitemapEntries } = require("./generate-sitemap");
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
  const navPages = [
    "index.html",
    "about.html",
    "search.html",
    "series.html",
    "detail.html",
    "award/index.html",
    "chauchaubook.html"
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
        'rel="canonical" href="https://biacung.com/chauchaubook"'
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
      checks: ['meta name="robots" content="noindex,follow"']
    }
  ];

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
      content.includes('href="/chauchaubook">Chauchaubook</a>'),
      `${file} is missing Chauchaubook navigation link`
    );
    pushIfMissing(errors, !content.includes(".html"), `${file} contains a public URL with an .html suffix`);
  });

  const cssVersionChecks = [
    { file: "index.html", snippets: ['assets/css/tokens.css?v=', 'assets/css/home.css?v='] },
    { file: "about.html", snippets: ['assets/css/tokens.css?v=', 'assets/css/home.css?v=', 'assets/css/about.css?v='] },
    {
      file: "chauchaubook.html",
      snippets: [
        'assets/css/tokens.css?v=',
        'assets/css/home.css?v=',
        'assets/css/search.css?v='
      ]
    },
    { file: "search.html", snippets: ['assets/css/tokens.css?v=', 'assets/css/home.css?v=', 'assets/css/search.css?v='] },
    { file: "series.html", snippets: ['assets/css/tokens.css?v=', 'assets/css/home.css?v=', 'assets/css/search.css?v='] },
    { file: "detail.html", snippets: ['assets/css/tokens.css?v=', 'assets/css/home.css?v=', 'assets/css/detail.css?v='] },
    { file: "award/index.html", snippets: ['../assets/css/tokens.css?v=', '../assets/css/home.css?v=', '../assets/css/award.css?v='] }
  ];

  cssVersionChecks.forEach((rule) => {
    const content = readFileSafe(path.join(rootDir, rule.file));
    rule.snippets.forEach((snippet) => {
      pushIfMissing(errors, content.includes(snippet), `${rule.file} is missing CSS cache-busting version: ${snippet}`);
    });
  });
}

function auditCoreFiles(rootDir, errors) {
  [
    "robots.txt",
    "sitemap.xml",
    "site.webmanifest",
    "assets/js/seo.js",
    "script/static-server.js",
    "assets/img/favicon/apple-touch-icon.png",
    "assets/img/favicon/android-chrome-192x192.png",
    "assets/img/favicon/android-chrome-512x512.png",
    "assets/img/favicon/favicon-16x16.png",
    "assets/img/favicon/favicon-32x32.png",
    "assets/img/favicon/favicon.ico"
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
    ["/search", "search.html"],
    ["/series", "series.html"],
    ["/detail", "detail.html"],
    ["/award", "award/index.html"],
    ["/award/", "award/index.html"],
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
  pushIfMissing(errors, entries.some((entry) => entry.loc.includes("/detail?id=")), "sitemap.xml does not include book detail URLs");
  pushIfMissing(errors, entries.some((entry) => entry.loc.includes("/series?id=")), "sitemap.xml does not include series detail URLs");
  pushIfMissing(errors, !entries.some((entry) => entry.loc.includes("/search")), "sitemap.xml should not include search result pages");
  pushIfMissing(errors, !entries.some((entry) => entry.loc.includes(".html")), "sitemap.xml contains legacy .html URLs");
}

function auditData(rootDir, errors, warnings) {
  const bookIndex = readJsonSafe(path.join(rootDir, "data", "book.json"), []);
  const seriesIndex = readJsonSafe(path.join(rootDir, "data", "series.json"), []);

  (Array.isArray(bookIndex) ? bookIndex : []).forEach((entry) => {
    const detail = normalizeText(entry?.detail);
    pushIfMissing(errors, detail && fs.existsSync(path.join(rootDir, detail)), `Book index points to missing file: ${detail}`);
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
        if (!normalizeText(edition?.thumbnail)) {
          warnings.push(`Edition missing thumbnail: data/book/${file}#${index + 1}`);
        }
        if (!normalizeText(edition?.publisher)) {
          warnings.push(`Edition missing publisher: data/book/${file}#${index + 1}`);
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
