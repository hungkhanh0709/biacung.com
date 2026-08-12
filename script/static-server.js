const fs = require("fs");
const http = require("http");
const path = require("path");

const MIME_TYPES = {
  ".avif": "image/avif",
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".webp": "image/webp",
  ".xml": "application/xml; charset=utf-8"
};

function isFile(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch (error) {
    return false;
  }
}

function isDirectory(filePath) {
  try {
    return fs.statSync(filePath).isDirectory();
  } catch (error) {
    return false;
  }
}

function resolveRequestPath(rootDir, pathname) {
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch (error) {
    return null;
  }

  if (decodedPath.includes("\0")) {
    return null;
  }

  const root = path.resolve(rootDir);
  const requested = path.resolve(root, `.${decodedPath}`);
  if (requested !== root && !requested.startsWith(`${root}${path.sep}`)) {
    return null;
  }

  const candidates = [];
  if (decodedPath === "/" || decodedPath.endsWith("/")) {
    candidates.push(path.join(requested, "index.html"));
  } else {
    candidates.push(requested);
    if (!path.extname(requested)) {
      candidates.push(`${requested}.html`);
      if (isDirectory(requested)) {
        candidates.push(path.join(requested, "index.html"));
      }
    }
  }

  return candidates.find(isFile) || null;
}

function createServer(rootDir = process.cwd()) {
  return http.createServer((request, response) => {
    if (request.method !== "GET" && request.method !== "HEAD") {
      response.writeHead(405, { Allow: "GET, HEAD", "Content-Type": "text/plain; charset=utf-8" });
      response.end("Method Not Allowed\n");
      return;
    }

    const requestUrl = new URL(request.url, "http://localhost");
    const filePath = resolveRequestPath(rootDir, requestUrl.pathname);
    if (!filePath) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not Found\n");
      return;
    }

    const contentType = MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream";
    const headers = {
      "Content-Length": fs.statSync(filePath).size,
      "Content-Type": contentType
    };
    response.writeHead(200, headers);

    if (request.method === "HEAD") {
      response.end();
      return;
    }

    fs.createReadStream(filePath).pipe(response);
  });
}

if (require.main === module) {
  const port = Number.parseInt(process.env.PORT || process.argv[2] || "3000", 10);
  const host = process.env.HOST || "127.0.0.1";
  const server = createServer();

  server.listen(port, host, () => {
    console.log(`Bia Cung local server: http://${host}:${port}`);
  });
}

module.exports = { createServer, resolveRequestPath };
