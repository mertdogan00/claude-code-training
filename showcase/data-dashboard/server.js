// Satis Analitik Paneli, API server.
// Node 24 + Express + the built-in node:sqlite module. No native build step.

import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import express from 'express';

const HERE = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';
const DB_FILE = resolve(HERE, 'data.sqlite');

const CATEGORIES = ['Kitchen', 'Electronics', 'Food'];
const CITIES = ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya'];
const CATALOG = [
  { product: 'Coffee Maker', category: 'Electronics', price: 2400 },
  { product: 'Grinder', category: 'Electronics', price: 1150 },
  { product: 'French Press', category: 'Kitchen', price: 480 },
  { product: 'Cup Set', category: 'Kitchen', price: 260 },
  { product: 'Thermos', category: 'Kitchen', price: 350 },
  { product: 'Coffee Beans 1kg', category: 'Food', price: 620 }
];

/* ---------------------------------------------------------------- data layer */

const db = new DatabaseSync(DB_FILE);
db.exec('PRAGMA journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    product TEXT NOT NULL,
    category TEXT NOT NULL,
    qty INTEGER NOT NULL,
    unit_price REAL NOT NULL,
    city TEXT NOT NULL,
    revenue REAL NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date);
  CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
`);

function setMeta(key, value) {
  db.prepare('INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
    .run(key, String(value));
}

function getMeta(key) {
  const row = db.prepare('SELECT value FROM meta WHERE key = ?').get(key);
  return row ? row.value : null;
}

function rowCount() {
  return db.prepare('SELECT COUNT(*) AS n FROM sales').get().n;
}

/* CSV import. The columns are date,product,category,qty,unit_price,city. */

function splitCsvLine(line) {
  const out = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') { field += '"'; i += 1; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { out.push(field); field = ''; }
    else field += ch;
  }
  out.push(field);
  return out.map((v) => v.trim());
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
  if (lines.length < 2) return [];
  const header = splitCsvLine(lines[0]).map((h) => h.toLowerCase());
  const idx = (name) => header.indexOf(name);
  const need = ['date', 'product', 'category', 'qty', 'unit_price', 'city'];
  if (need.some((n) => idx(n) === -1)) {
    throw new Error('CSV header must contain date,product,category,qty,unit_price,city');
  }
  const rows = [];
  for (const line of lines.slice(1)) {
    const cells = splitCsvLine(line);
    const qty = Number(cells[idx('qty')]);
    const price = Number(cells[idx('unit_price')]);
    const date = cells[idx('date')];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(qty) || !Number.isFinite(price)) continue;
    rows.push({
      date,
      product: cells[idx('product')],
      category: cells[idx('category')],
      qty,
      unit_price: price,
      city: cells[idx('city')]
    });
  }
  return rows;
}

function replaceRows(rows, source) {
  const insert = db.prepare(
    'INSERT INTO sales (date, product, category, qty, unit_price, city, revenue) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  db.exec('BEGIN');
  try {
    db.exec('DELETE FROM sales');
    for (const r of rows) {
      insert.run(r.date, r.product, r.category, r.qty, r.unit_price, r.city, r.qty * r.unit_price);
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
  setMeta('source', source);
  setMeta('imported_at', new Date().toISOString());
  return rows.length;
}

/* Seed. The repo CSV wins when it is reachable, otherwise 120 rows are generated. */

function findRepoCsv() {
  const candidates = [
    resolve(HERE, 'data/sales-data.csv'),
    resolve(HERE, '../data/sales-data.csv'),
    resolve(HERE, '../../data/sales-data.csv'),
    resolve(HERE, '../../../data/sales-data.csv')
  ];
  return candidates.find((p) => existsSync(p)) || null;
}

function generateRows(count = 120) {
  let seed = 20260902;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  const end = new Date('2026-08-28T00:00:00Z');
  const rows = [];
  for (let i = 0; i < count; i += 1) {
    const item = CATALOG[Math.floor(rand() * CATALOG.length)];
    const day = new Date(end.getTime() - Math.floor(rand() * 28) * 86400000);
    const weekendBoost = [0, 6].includes(day.getUTCDay()) ? 1.4 : 1;
    rows.push({
      date: day.toISOString().slice(0, 10),
      product: item.product,
      category: item.category,
      qty: Math.max(1, Math.round(rand() * 6 * weekendBoost)),
      unit_price: Math.round(item.price * (0.92 + rand() * 0.16)),
      city: CITIES[Math.floor(rand() * CITIES.length)]
    });
  }
  return rows;
}

function seedIfEmpty() {
  if (rowCount() > 0) return;
  const csvPath = findRepoCsv();
  if (csvPath) {
    const rows = parseCsv(readFileSync(csvPath, 'utf8'));
    if (rows.length > 0) {
      replaceRows(rows, `csv:${csvPath}`);
      console.log(`Seeded ${rows.length} rows from ${csvPath}`);
      return;
    }
  }
  const rows = generateRows(120);
  replaceRows(rows, 'generated');
  console.log(`Seeded ${rows.length} generated rows`);
}

seedIfEmpty();

/* ------------------------------------------------------------- aggregations */

function bounds() {
  const row = db.prepare('SELECT MIN(date) AS min, MAX(date) AS max FROM sales').get();
  return { min: row.min || null, max: row.max || null };
}

// Dates arrive from the URL, so anything that is not a plain YYYY-MM-DD is dropped instead of
// being handed to Date, which would throw on the routes that walk back a previous window.
function isoDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  return Number.isNaN(Date.parse(`${value}T00:00:00Z`)) ? null : value;
}

function buildFilter(query) {
  const where = [];
  const params = [];
  const from = isoDate(query.from);
  const to = isoDate(query.to);
  if (from) { where.push('date >= ?'); params.push(from); }
  if (to) { where.push('date <= ?'); params.push(to); }
  if (query.category) { where.push('category = ?'); params.push(String(query.category)); }
  if (query.city) { where.push('city = ?'); params.push(String(query.city)); }
  return { sql: where.length ? `WHERE ${where.join(' AND ')}` : '', params };
}

function selectRows(query) {
  const f = buildFilter(query);
  return db.prepare(`SELECT date, product, category, qty, unit_price, city, revenue FROM sales ${f.sql} ORDER BY date`)
    .all(...f.params);
}

function totals(query) {
  const f = buildFilter(query);
  const row = db.prepare(
    `SELECT COALESCE(SUM(revenue), 0) AS revenue, COALESCE(SUM(qty), 0) AS units, COUNT(*) AS orders
     FROM sales ${f.sql}`
  ).get(...f.params);
  return {
    revenue: Number(row.revenue),
    units: Number(row.units),
    orders: Number(row.orders),
    avgBasket: row.orders > 0 ? Number(row.revenue) / Number(row.orders) : 0
  };
}

function addDays(iso, days) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function dayDiff(a, b) {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000);
}

// The comparison window is the same number of days sitting right before the active one.
function previousWindow(query) {
  const b = bounds();
  const from = isoDate(query.from) || b.min;
  const to = isoDate(query.to) || b.max;
  if (!from || !to) return null;
  const span = dayDiff(from, to) + 1;
  return { ...query, from: addDays(from, -span), to: addDays(from, -1) };
}

// null means there is no comparable previous period, which is not the same as zero growth.
function percentChange(current, previous) {
  if (!previous) return null;
  return ((current - previous) / previous) * 100;
}

function weekStart(iso) {
  const d = new Date(`${iso}T00:00:00Z`);
  const shift = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - shift);
  return d.toISOString().slice(0, 10);
}

function bucketOf(iso, granularity) {
  if (granularity === 'month') return iso.slice(0, 7);
  if (granularity === 'week') return weekStart(iso);
  return iso;
}

function groupBy(rows, keyFn) {
  const map = new Map();
  for (const r of rows) {
    const key = keyFn(r);
    const agg = map.get(key) || { key, revenue: 0, units: 0, orders: 0 };
    agg.revenue += r.revenue;
    agg.units += r.qty;
    agg.orders += 1;
    map.set(key, agg);
  }
  return [...map.values()];
}

function withShare(items) {
  const total = items.reduce((sum, i) => sum + i.revenue, 0);
  return items.map((i) => ({ ...i, share: total > 0 ? (i.revenue / total) * 100 : 0 }));
}

/* Insights are computed here, on the server, from the filtered rows. */

function buildInsights(query) {
  const rows = selectRows(query);
  const out = [];
  if (rows.length === 0) return out;

  const byDay = groupBy(rows, (r) => r.date).sort((a, b) => b.revenue - a.revenue);
  out.push({
    id: 'best-day',
    tone: 'good',
    title: 'En iyi gün',
    text: `${byDay[0].key} tarihinde ${byDay[0].orders} sipariş ile dönemin en yüksek cirosu yakalandı.`,
    value: byDay[0].revenue,
    valueType: 'money'
  });

  const byCategory = withShare(groupBy(rows, (r) => r.category)).sort((a, b) => b.revenue - a.revenue);
  out.push({
    id: 'top-category',
    tone: 'good',
    title: 'Öne çıkan kategori',
    text: `${byCategory[0].key} kategorisi toplam cironun yüzde ${byCategory[0].share.toFixed(1)} kadarını tek başına üretiyor.`,
    value: byCategory[0].revenue,
    valueType: 'money'
  });

  const sorted = [...rows].sort((a, b) => a.date.localeCompare(b.date));
  const half = Math.floor(sorted.length / 2);
  const firstHalf = groupBy(sorted.slice(0, half), (r) => r.product);
  const secondHalf = groupBy(sorted.slice(half), (r) => r.product);
  const firstMap = new Map(firstHalf.map((i) => [i.key, i.revenue]));
  const movers = secondHalf
    .map((i) => ({ key: i.key, change: percentChange(i.revenue, firstMap.get(i.key) || 0), revenue: i.revenue }))
    .filter((i) => i.change !== null && Number.isFinite(i.change))
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
  if (movers.length > 0) {
    const m = movers[0];
    out.push({
      id: 'mover',
      tone: m.change >= 0 ? 'good' : 'warn',
      title: 'En hızlı değişen ürün',
      text: `${m.key}, dönemin ikinci yarısında ilk yarısına göre ${m.change >= 0 ? 'yükseldi' : 'geriledi'}.`,
      value: m.change,
      valueType: 'percent'
    });
  }

  const byCity = withShare(groupBy(rows, (r) => r.city)).sort((a, b) => b.revenue - a.revenue);
  if (byCity.length > 1) {
    const weakest = byCity[byCity.length - 1];
    out.push({
      id: 'action',
      tone: 'warn',
      title: 'Önerilen aksiyon',
      text: `${weakest.key} cironun en küçük parçası. ${byCity[0].key} için çalışan kampanyayı bu şehirde de deneyin.`,
      value: weakest.share,
      valueType: 'percent'
    });
  }

  const avg = rows.reduce((s, r) => s + r.revenue, 0) / rows.length;
  out.push({
    id: 'basket',
    tone: 'neutral',
    title: 'Sipariş başı ciro',
    text: `${rows.length} siparişin ortalama tutarı bu dönemde bu seviyede kaldı.`,
    value: avg,
    valueType: 'money'
  });

  return out.slice(0, 5);
}

/* ------------------------------------------------------------------- routes */

const app = express();
app.use(express.json({ limit: '5mb' }));
app.use(express.text({ type: 'text/csv', limit: '5mb' }));
app.use(express.static(resolve(HERE, 'public')));
app.use('/vendor', express.static(resolve(HERE, 'node_modules/chart.js/dist')));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, rows: rowCount(), source: getMeta('source') });
});

app.get('/api/meta', (_req, res) => {
  const b = bounds();
  const cats = db.prepare('SELECT DISTINCT category FROM sales ORDER BY category').all().map((r) => r.category);
  const cities = db.prepare('SELECT DISTINCT city FROM sales ORDER BY city').all().map((r) => r.city);
  res.json({
    rows: rowCount(),
    source: getMeta('source'),
    importedAt: getMeta('imported_at'),
    dateRange: b,
    categories: cats,
    cities
  });
});

app.get('/api/kpis', (req, res) => {
  const current = totals(req.query);
  const prevQuery = previousWindow(req.query);
  const previous = prevQuery ? totals(prevQuery) : { revenue: 0, units: 0, orders: 0, avgBasket: 0 };
  res.json({
    current,
    previous,
    change: {
      revenue: percentChange(current.revenue, previous.revenue),
      units: percentChange(current.units, previous.units),
      orders: percentChange(current.orders, previous.orders),
      avgBasket: percentChange(current.avgBasket, previous.avgBasket)
    }
  });
});

app.get('/api/timeline', (req, res) => {
  const granularity = ['day', 'week', 'month'].includes(req.query.granularity) ? req.query.granularity : 'day';
  const rows = selectRows(req.query);
  const points = groupBy(rows, (r) => bucketOf(r.date, granularity))
    .sort((a, b) => a.key.localeCompare(b.key))
    .map((p) => ({ bucket: p.key, revenue: p.revenue, units: p.units, orders: p.orders }));
  res.json({ granularity, points });
});

app.get('/api/categories', (req, res) => {
  const items = withShare(groupBy(selectRows(req.query), (r) => r.category))
    .sort((a, b) => b.revenue - a.revenue)
    .map((i) => ({ category: i.key, revenue: i.revenue, units: i.units, orders: i.orders, share: i.share }));
  res.json({ items });
});

app.get('/api/products', (req, res) => {
  const rows = selectRows(req.query);
  const categoryOf = new Map(rows.map((r) => [r.product, r.category]));
  const items = withShare(groupBy(rows, (r) => r.product))
    .sort((a, b) => b.revenue - a.revenue)
    .map((i) => ({
      product: i.key,
      category: categoryOf.get(i.key) || '',
      revenue: i.revenue,
      units: i.units,
      orders: i.orders,
      share: i.share
    }));
  res.json({ items });
});

app.get('/api/cities', (req, res) => {
  const items = withShare(groupBy(selectRows(req.query), (r) => r.city))
    .sort((a, b) => b.revenue - a.revenue)
    .map((i) => ({ city: i.key, revenue: i.revenue, units: i.units, orders: i.orders, share: i.share }));
  res.json({ items });
});

app.get('/api/insights', (req, res) => {
  res.json({ items: buildInsights(req.query) });
});

app.post('/api/import', (req, res) => {
  const text = typeof req.body === 'string' ? req.body : req.body && req.body.csv;
  if (typeof text !== 'string' || text.trim() === '') {
    return res.status(400).json({ ok: false, error: 'CSV content is required' });
  }
  try {
    const rows = parseCsv(text);
    if (rows.length === 0) return res.status(400).json({ ok: false, error: 'No valid rows found' });
    replaceRows(rows, 'upload');
    return res.json({ ok: true, rows: rows.length, dateRange: bounds() });
  } catch (err) {
    return res.status(400).json({ ok: false, error: err.message });
  }
});

app.use('/api', (_req, res) => res.status(404).json({ ok: false, error: 'Unknown API route' }));

// A malformed body or an unexpected throw answers as JSON. Express's default handler would
// return an HTML page carrying a stack trace and absolute paths.
app.use((err, _req, res, _next) => {
  const status = err.status && err.status < 500 ? err.status : 500;
  res.status(status).json({ ok: false, error: status < 500 ? 'Invalid request' : 'Server error' });
});

app.listen(PORT, HOST, () => {
  console.log(`Satis Analitik Paneli is running on http://localhost:${PORT}`);
  console.log(`Rows: ${rowCount()} | source: ${getMeta('source')}`);
});
