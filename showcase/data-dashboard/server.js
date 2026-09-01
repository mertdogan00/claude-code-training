// HTTP server and routing for the Sales Panel. Static files are served
// from public/, JSON data comes from the /api/* routes below.
'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { loadDatabase } = require('./lib/db');
const stats = require('./lib/stats');

const PORT = process.env.PORT || 3000;
const CSV_PATH = process.env.CSV_PATH || path.join(__dirname, 'data', 'sales-data.csv');
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'dashboard.sqlite');
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
};

let dbState = { db: null, error: null, loadedRows: 0, skippedRows: 0, totalRows: 0 };

function initialize() {
  try {
    const result = loadDatabase(CSV_PATH, DB_PATH);
    dbState = { db: result.db, error: null, ...result };
    console.log(
      `Sales Panel: loaded ${result.loadedRows} rows, skipped ${result.skippedRows} rows ` +
        `(of ${result.totalRows} total) from ${CSV_PATH}`,
    );
  } catch (err) {
    dbState = { db: null, error: err.message, loadedRows: 0, skippedRows: 0, totalRows: 0 };
    console.error(`Sales Panel startup error: ${err.message}`);
  }
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(body);
}

function handleApi(req, res, pathname) {
  if (dbState.error) {
    sendJson(res, 503, { error: dbState.error });
    return;
  }

  const routes = {
    '/api/summary': () => ({
      ...stats.computeSummary(dbState.db),
      loadedRows: dbState.loadedRows,
      skippedRows: dbState.skippedRows,
      totalRows: dbState.totalRows,
    }),
    '/api/daily': () => stats.computeDaily(dbState.db),
    '/api/categories': () => stats.computeCategories(dbState.db),
    '/api/cities': () => stats.computeCities(dbState.db),
    '/api/insight': () => stats.computeInsight(dbState.db),
  };

  const handler = routes[pathname];
  if (!handler) {
    sendJson(res, 404, { error: 'İstenen API rotası bulunamadı.' });
    return;
  }

  try {
    sendJson(res, 200, handler());
  } catch (err) {
    sendJson(res, 500, { error: `Sunucu hatası: ${err.message}` });
  }
}

function serveStatic(req, res, pathname) {
  const relativePath = pathname === '/' ? 'index.html' : pathname.slice(1);
  const filePath = path.normalize(path.join(PUBLIC_DIR, relativePath));

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 - Erişim engellendi');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 - Sayfa bulunamadı');
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, `http://${req.headers.host}`).pathname;
  if (pathname.startsWith('/api/')) {
    handleApi(req, res, pathname);
  } else {
    serveStatic(req, res, pathname);
  }
});

initialize();
server.listen(PORT, () => {
  console.log(`Sales Panel running at http://localhost:${PORT}`);
});
