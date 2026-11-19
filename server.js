/**
 * MultiTools Hub - Local Development Server
 * Pure Node.js built-in HTTP server with MIME types and Clean URLs support
 * Zero external dependencies required.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml; charset=UTF-8',
  '.txt': 'text/plain; charset=UTF-8'
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // Default to index.html for root path
  if (pathname === '/') {
    pathname = '/index.html';
  }

  // Graceful favicon fallback
  if (pathname === '/favicon.ico') {
    const svgFavicon = path.join(ROOT, 'assets', 'images', 'favicon.svg');
    if (fs.existsSync(svgFavicon)) {
      res.writeHead(200, { 'Content-Type': 'image/svg+xml' });
      fs.createReadStream(svgFavicon).pipe(res);
      return;
    }
  }

  let filePath = path.join(ROOT, pathname);

  // Security check: prevent directory traversal
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  // Check if file exists directly
  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) {
      serveFile(filePath, res);
      return;
    }

    // If directory, look for index.html inside
    if (!err && stats.isDirectory()) {
      const dirIndex = path.join(filePath, 'index.html');
      if (fs.existsSync(dirIndex)) {
        serveFile(dirIndex, res);
        return;
      }
    }

    // Clean URLs support: check if appending .html matches a file
    const htmlPath = filePath + '.html';
    if (fs.existsSync(htmlPath)) {
      serveFile(htmlPath, res);
      return;
    }

    // 404 Fallback: serve 404.html if present
    const notFoundPage = path.join(ROOT, '404.html');
    if (fs.existsSync(notFoundPage)) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });
      fs.createReadStream(notFoundPage).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    }
    console.log(`[404] ${req.method} ${pathname}`);
  });
});

function serveFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  res.writeHead(200, {
    'Content-Type': contentType,
    'Cache-Control': 'no-cache, no-store, must-revalidate'
  });

  fs.createReadStream(filePath).pipe(res);
}

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`  🚀 MultiTools Hub Local Server running at:`);
  console.log(`  👉 http://localhost:${PORT}`);
  console.log(`======================================================\n`);
  console.log(`Available Tools:`);
  console.log(` • http://localhost:${PORT}/tools/pdf-merger-organizer.html`);
  console.log(` • http://localhost:${PORT}/tools/pdf-splitter-images.html`);
  console.log(` • http://localhost:${PORT}/tools/safe-zone-checker.html`);
  console.log(` • http://localhost:${PORT}/tools/thumbnail-previewer.html`);
  console.log(` • http://localhost:${PORT}/tools/aspect-ratio-calculator.html`);
  console.log(` • http://localhost:${PORT}/tools/bulk-image-resizer.html`);
  console.log(` • http://localhost:${PORT}/tools/bulk-webp-converter.html`);
  console.log(` • http://localhost:${PORT}/tools/image-watermark-exif-cleaner.html`);
  console.log(` • http://localhost:${PORT}/tools/color-palette-extractor.html`);
  console.log(` • http://localhost:${PORT}/tools/svg-color-changer.html`);
  console.log(` • http://localhost:${PORT}/tools/kdp-bleed-calculator.html`);
  console.log(` • http://localhost:${PORT}/tools/qr-code-generator.html\n`);
});
