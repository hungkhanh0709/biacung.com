# biacung.com

`biacung.com` is a public static website about beautiful book editions, curated book pages, and selected book series.

## What this repo contains

- Static HTML pages for the public site
- CSS and JavaScript assets
- JSON data for books, series, authors, and awards
- Small maintenance scripts for sitemap generation and release checks

## Main pages

- `/`: homepage (`index.html`)
- `/detail`: book detail page (`detail.html`)
- `/series`: series listing and series detail page (`series.html`)
- `/search`: search page (`search.html`)
- `/about`: about page (`about.html`)
- `/chauchaubook`: Chauchaubook page (`chauchaubook.html`)
- `/award/`: awards page (`award/index.html`)

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

Use the project server so local development resolves the same extensionless URLs as GitHub Pages:

Example:

```bash
npm run static-server
```

Then open:

```text
http://localhost:3000
```

The port can be changed with `PORT=5500 npm run static-server`. Physical `.html` files remain in place so previously shared legacy URLs continue to work.

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
