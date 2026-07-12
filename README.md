# biacung.com

`biacung.com` is a public static website about beautiful book editions, curated book pages, and selected book series.

## What this repo contains

- Static HTML pages for the public site
- CSS and JavaScript assets
- JSON data for books, series, authors, and awards
- Small maintenance scripts for sitemap generation and release checks

## Main pages

- `index.html`: homepage
- `detail.html`: book detail page
- `series.html`: series listing and series detail page
- `search.html`: search page
- `about.html`: about page
- `award*`: awards page

## Project structure

```text
.
├── assets/
│   ├── css/
│   ├── img/
│   └── js/
├── data/
│   ├── book/
│   ├── series/
│   ├── awards/
│   ├── template/
│   └── *.json
├── script/
├── index.html
├── detail.html
├── series.html
├── search.html
├── about.html
└── award*
```

## Local development

You can open the HTML files directly, but using a simple local static server is recommended.

Example:

```bash
python3 -m http.server 5500
```

Then open:

```text
http://localhost:8000
```

## Release workflow

Before publishing updates, it is recommended to run:

```bash
npm run release:check
```

This helps confirm that:

- Important pages still contain required SEO metadata
- Sitemap content is up to date
- Core files exist
- JSON references are valid

## Deployment

The live site is published on GitHub Pages.

Cloudflare is used in front of GitHub Pages for:

- DNS management
- HTTPS enforcement
- proxy and edge protection
- Cloudflare Web Analytics

Cloudflare Web Analytics is expected to use Cloudflare automatic setup.

## Notes

- `sitemap.xml` should be regenerated when content changes
- `robots.txt` should continue to point to the production sitemap

## License

See [LICENSE](LICENSE).
