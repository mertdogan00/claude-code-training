'use strict';

// Stok Defteri - inventory tracker for a small business.
// Node built-ins only: node:http, node:fs, node:sqlite (via lib/db.js). Zero npm packages.

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const db = require('./lib/db');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
};

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(body);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1e6) req.destroy();
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('invalid_json'));
      }
    });
    req.on('error', reject);
  });
}

// Validates and normalizes an incoming product payload. Returns { errors } or { value }.
function validateProduct(input) {
  const errors = [];
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  const category = typeof input.category === 'string' ? input.category.trim() : '';
  const quantity = Number(input.quantity);
  const rawThreshold = input.criticalThreshold;
  const threshold =
    rawThreshold === undefined || rawThreshold === null || rawThreshold === ''
      ? 5
      : Number(rawThreshold);
  const unitPrice = Number(input.unitPrice);

  if (!name) errors.push('Ürün adı gerekli.');
  if (!category) errors.push('Kategori gerekli.');
  if (!Number.isFinite(quantity) || !Number.isInteger(quantity) || quantity < 0) {
    errors.push('Miktar sıfır veya pozitif bir tam sayı olmalı.');
  }
  if (!Number.isFinite(threshold) || !Number.isInteger(threshold) || threshold < 0) {
    errors.push('Kritik eşik sıfır veya pozitif bir tam sayı olmalı.');
  }
  if (!Number.isFinite(unitPrice) || unitPrice < 0) {
    errors.push('Birim fiyat sıfır veya pozitif bir sayı olmalı.');
  }

  if (errors.length > 0) return { errors };
  return { value: { name, category, quantity, criticalThreshold: threshold, unitPrice } };
}

async function handleApi(req, res, pathname) {
  if (pathname === '/api/products' && req.method === 'GET') {
    return sendJson(res, 200, db.listProducts());
  }

  if (pathname === '/api/products' && req.method === 'POST') {
    let body;
    try {
      body = await readJsonBody(req);
    } catch {
      return sendJson(res, 400, { errors: ['Geçersiz istek gövdesi.'] });
    }
    const { errors, value } = validateProduct(body);
    if (errors) return sendJson(res, 400, { errors });
    const product = db.insertProduct(value);
    return sendJson(res, 201, product);
  }

  if (pathname === '/api/movements' && req.method === 'GET') {
    return sendJson(res, 200, db.listRecentMovements(10));
  }

  const stepMatch = pathname.match(/^\/api\/products\/(\d+)\/(increment|decrement)$/);
  if (stepMatch && req.method === 'POST') {
    const id = Number(stepMatch[1]);
    const delta = stepMatch[2] === 'increment' ? 1 : -1;
    const result = db.adjustQuantity(id, delta);
    if (result && result.error === 'not_found') {
      return sendJson(res, 404, { errors: ['Ürün bulunamadı.'] });
    }
    if (result && result.error === 'negative') {
      return sendJson(res, 400, { errors: ['Miktar sıfırın altına inemez.'] });
    }
    return sendJson(res, 200, result);
  }

  sendJson(res, 404, { errors: ['Bulunamadı.'] });
}

function serveStatic(req, res, pathname) {
  const filePath = pathname === '/' ? 'index.html' : pathname.slice(1);
  const fullPath = path.join(PUBLIC_DIR, filePath);

  if (!fullPath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.readFile(fullPath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Bulunamadi.');
    }
    const ext = path.extname(fullPath);
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, `http://${req.headers.host}`).pathname;
  if (pathname.startsWith('/api/')) {
    handleApi(req, res, pathname).catch(() => sendJson(res, 500, { errors: ['Sunucu hatası.'] }));
    return;
  }
  serveStatic(req, res, pathname);
});

server.listen(PORT, () => {
  console.log(`Stok Defteri http://localhost:${PORT} adresinde çalışıyor`);
});
