'use strict';

// Cuzdan - personal expense tracker. Node built-ins only, JSON API under /api/.

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

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 1e6) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

async function parseJsonBody(req) {
  const raw = await readBody(req);
  try {
    return JSON.parse(raw || '{}');
  } catch {
    return null;
  }
}

function validateExpenseInput(payload) {
  const errors = [];
  const amount = Number(payload.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    errors.push('Tutar pozitif bir sayi olmali.');
  }
  if (!db.CATEGORIES.includes(payload.category)) {
    errors.push('Gecerli bir kategori seciniz.');
  }
  const note = typeof payload.note === 'string' ? payload.note.trim().slice(0, 200) : '';
  return { amount, category: payload.category, note, errors };
}

// Projection math: spent-so-far / days-elapsed x days-in-month, clamped so day
// one of the month never divides by zero.
function buildState() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysElapsed = Math.max(1, now.getDate());

  const monthExpenses = db.listExpensesForMonth(year, month);
  const total = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const average = total / daysElapsed;
  const projection = average * daysInMonth;

  const categoryTotals = {};
  for (const cat of db.CATEGORIES) categoryTotals[cat] = 0;
  for (const e of monthExpenses) categoryTotals[e.category] += e.amount;

  const categories = db.CATEGORIES.map((category) => ({
    category,
    amount: categoryTotals[category],
    percent: total > 0 ? (categoryTotals[category] / total) * 100 : 0,
  })).sort((a, b) => b.amount - a.amount);

  const limit = db.getLimit();
  let limitStatus = 'neutral';
  let limitPercent = 0;
  if (limit && limit > 0) {
    limitPercent = (total / limit) * 100;
    if (total > limit) limitStatus = 'exceeded';
    else if (limitPercent >= 80) limitStatus = 'warning';
  }

  return {
    month: { total, average, projection, daysElapsed, daysInMonth, year, monthIndex: month },
    categories,
    limit,
    limitPercent,
    limitStatus,
    expenses: db.listExpenses(10),
  };
}

function serveStatic(req, res, pathname) {
  if (req.method !== 'GET') {
    res.writeHead(405);
    res.end();
    return;
  }
  let filePath = pathname === '/' ? '/index.html' : pathname;
  filePath = path.normalize(filePath).replace(/^(\.\.[/\\])+/, '');
  const fullPath = path.join(PUBLIC_DIR, filePath);

  fs.readFile(fullPath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Bulunamadi');
      return;
    }
    const ext = path.extname(fullPath);
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  try {
    if (pathname === '/api/state' && req.method === 'GET') {
      sendJson(res, 200, buildState());
      return;
    }

    if (pathname === '/api/expenses' && req.method === 'POST') {
      const payload = await parseJsonBody(req);
      if (payload === null) {
        sendJson(res, 400, { error: 'Gecersiz istek govdesi.' });
        return;
      }
      const { amount, category, note, errors } = validateExpenseInput(payload);
      if (errors.length > 0) {
        sendJson(res, 400, { error: errors.join(' ') });
        return;
      }
      db.addExpense({ amount, category, note });
      sendJson(res, 201, buildState());
      return;
    }

    const deleteMatch = pathname.match(/^\/api\/expenses\/(\d+)$/);
    if (deleteMatch && req.method === 'DELETE') {
      const ok = db.deleteExpense(Number(deleteMatch[1]));
      if (!ok) {
        sendJson(res, 404, { error: 'Harcama bulunamadi.' });
        return;
      }
      sendJson(res, 200, buildState());
      return;
    }

    if (pathname === '/api/limit' && req.method === 'POST') {
      const payload = await parseJsonBody(req);
      const limit = payload ? Number(payload.limit) : NaN;
      if (!Number.isFinite(limit) || limit <= 0) {
        sendJson(res, 400, { error: 'Limit pozitif bir sayi olmali.' });
        return;
      }
      db.setLimit(limit);
      sendJson(res, 200, buildState());
      return;
    }

    if (pathname.startsWith('/api/')) {
      sendJson(res, 404, { error: 'Bulunamadi.' });
      return;
    }

    serveStatic(req, res, pathname);
  } catch {
    sendJson(res, 500, { error: 'Sunucu hatasi.' });
  }
});

server.listen(PORT, () => {
  console.log(`Cuzdan calisiyor: http://localhost:${PORT}`);
});
