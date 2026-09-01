'use strict';

// Randevu Defteri - appointment book server.
// Node built-ins only (node:http, node:fs, node:sqlite); JSON API under /api/.

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const db = require('./lib/db');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
};

const store = db.openDb();
db.seedIfEmpty(store);

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function serveStatic(res, filename) {
  const filePath = path.join(PUBLIC_DIR, filename);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Bulunamadi');
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filename)] || 'application/octet-stream' });
    res.end(data);
  });
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1e6) {
        reject(new Error('payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function buildStats() {
  const today = db.todayIso();
  const currentWeekStart = db.weekStartOf(today);
  const todayCount = db.countForDate(store, today);
  const weekCount = db.countForWeek(store, currentWeekStart);
  const occupancyPercent = Math.round((weekCount / db.SLOTS_PER_WEEK) * 100);
  const nextFreeSlot = db.findNextFreeSlot(store, today, db.nowTimeHHMM());
  return { todayCount, occupancyPercent, nextFreeSlot };
}

function handleGetWeek(req, res, query) {
  const requested = query.get('weekStart');
  const weekStart = db.isValidDateStr(requested) ? db.weekStartOf(requested) : db.weekStartOf(db.todayIso());
  const appointments = db.getAppointmentsForWeek(store, weekStart);
  sendJson(res, 200, {
    weekStart,
    days: db.weekDates(weekStart),
    slotTimes: db.SLOT_TIMES,
    today: db.todayIso(),
    appointments,
  });
}

async function handleCreateAppointment(req, res) {
  let body;
  try {
    body = await readJsonBody(req);
  } catch {
    return sendJson(res, 400, { error: 'Gecersiz istek govdesi.' });
  }

  const { date, time } = body;
  const customerName = typeof body.customerName === 'string' ? body.customerName.trim() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  const service = typeof body.service === 'string' ? body.service.trim() : '';
  const note = typeof body.note === 'string' ? body.note.trim() : '';

  if (!db.isValidDateStr(date) || db.dayOfWeek(date) === 0) {
    return sendJson(res, 400, { error: 'Gecersiz tarih. Pazar gunleri randevu alinmaz.' });
  }
  if (!db.SLOT_TIMES.includes(time)) {
    return sendJson(res, 400, { error: 'Gecersiz saat.' });
  }
  if (!customerName) {
    return sendJson(res, 400, { error: 'Musteri adi zorunludur.' });
  }
  if (phone && !db.PHONE_PATTERN.test(phone)) {
    return sendJson(res, 400, { error: 'Telefon sadece rakam, bosluk ve bastaki + isaretini icerebilir.' });
  }

  const existing = db.getAppointmentByDateTime(store, date, time);
  if (existing) {
    return sendJson(res, 409, { error: 'Bu saat dolu. Baska bir saat secin.' });
  }

  const appointment = db.insertAppointment(store, { date, time, customerName, phone, service, note });
  sendJson(res, 201, { appointment, stats: buildStats() });
}

function handleDeleteAppointment(res, id) {
  const ok = db.deleteAppointment(store, id);
  if (!ok) {
    return sendJson(res, 404, { error: 'Randevu bulunamadi.' });
  }
  sendJson(res, 200, { ok: true, stats: buildStats() });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function renderPrintPage(date, appointments) {
  const rows = appointments
    .map(
      (a) => `<tr>
        <td>${escapeHtml(a.time)}</td>
        <td>${escapeHtml(a.customerName)}</td>
        <td>${escapeHtml(a.phone)}</td>
        <td>${escapeHtml(a.service)}</td>
        <td>${escapeHtml(a.note)}</td>
      </tr>`
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8">
<title>Yarinin Randevulari - ${escapeHtml(date)}</title>
<style>
  body { background: #ffffff; color: #000000; font-family: Arial, sans-serif; margin: 24px; }
  h1 { font-size: 16px; margin: 0 0 12px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { border: 1px solid #000000; padding: 6px 8px; text-align: left; font-size: 13px; }
</style>
</head>
<body>
<h1>Yarinin Randevulari - ${escapeHtml(date)}</h1>
<table>
  <thead>
    <tr><th>Saat</th><th>Musteri</th><th>Telefon</th><th>Hizmet</th><th>Not</th></tr>
  </thead>
  <tbody>
    ${rows || '<tr><td colspan="5">Randevu yok</td></tr>'}
  </tbody>
</table>
</body>
</html>`;
}

function handlePrintTomorrow(res) {
  const tomorrow = db.addDays(db.todayIso(), 1);
  const appointments = db.getAppointmentsForDate(store, tomorrow);
  const html = renderPrintPage(tomorrow, appointments);
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const { pathname } = url;

  if (req.method === 'GET' && (pathname === '/' || pathname === '/index.html')) {
    return serveStatic(res, 'index.html');
  }
  if (req.method === 'GET' && (pathname === '/style.css' || pathname === '/app.js')) {
    return serveStatic(res, pathname.slice(1));
  }
  if (req.method === 'GET' && pathname === '/print/tomorrow') {
    return handlePrintTomorrow(res);
  }
  if (req.method === 'GET' && pathname === '/api/appointments') {
    return handleGetWeek(req, res, url.searchParams);
  }
  if (req.method === 'POST' && pathname === '/api/appointments') {
    return handleCreateAppointment(req, res);
  }
  if (req.method === 'GET' && pathname === '/api/stats') {
    return sendJson(res, 200, buildStats());
  }
  const deleteMatch = req.method === 'DELETE' && pathname.match(/^\/api\/appointments\/(\d+)$/);
  if (deleteMatch) {
    return handleDeleteAppointment(res, Number(deleteMatch[1]));
  }

  if (pathname.startsWith('/api/')) {
    return sendJson(res, 404, { error: 'Bulunamadi.' });
  }
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Bulunamadi');
});

server.listen(PORT, () => {
  console.log(`Randevu Defteri http://localhost:${PORT} adresinde calisiyor`);
});
