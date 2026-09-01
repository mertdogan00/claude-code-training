// Satis Analitik Paneli backend. Express + built in node:sqlite, no native deps.
import express from 'express';
import { DatabaseSync } from 'node:sqlite';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

const MONTHS_TR = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

// ---------------------------------------------------------------------------
// Database setup and seeding
// ---------------------------------------------------------------------------

const db = new DatabaseSync(join(__dirname, 'data.sqlite'));

db.exec(`
  CREATE TABLE IF NOT EXISTS sales (
    id         INTEGER PRIMARY KEY,
    date       TEXT    NOT NULL,
    product    TEXT    NOT NULL,
    category   TEXT    NOT NULL,
    qty        INTEGER NOT NULL,
    unit_price REAL    NOT NULL,
    city       TEXT    NOT NULL,
    revenue    REAL    NOT NULL
  );
  CREATE TABLE IF NOT EXISTS meta (
    key   TEXT PRIMARY KEY,
    value TEXT
  );
`);

function toISODate(d) {
  return d.toISOString().slice(0, 10);
}

function findCsvPath() {
  const candidates = ['data/sales-data.csv', '../data/sales-data.csv', '../../data/sales-data.csv'];
  for (const rel of candidates) {
    const abs = join(__dirname, rel);
    if (existsSync(abs)) return abs;
  }
  return null;
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  lines.shift(); // header
  return lines.map((line) => {
    const [date, product, category, qty, unit_price, city] = line.split(',');
    return { date, product, category, qty: Number(qty), unit_price: Number(unit_price), city: city.trim() };
  });
}

function generateRows(count) {
  const categories = ['Electronics', 'Kitchen', 'Food', 'Fashion', 'Sports'];
  const productsByCategory = {
    Electronics: ['Coffee Maker', 'Grinder', 'Blender', 'Toaster'],
    Kitchen: ['Thermos', 'Pan Set', 'Knife Set', 'Cutting Board'],
    Food: ['Coffee Beans 1kg', 'Tea Box', 'Olive Oil', 'Honey Jar'],
    Fashion: ['T-Shirt', 'Jeans', 'Jacket', 'Sneakers'],
    Sports: ['Yoga Mat', 'Dumbbell Set', 'Running Shoes', 'Bicycle Helmet'],
  };
  const priceRanges = {
    Electronics: [800, 3500],
    Kitchen: [200, 1500],
    Food: [80, 900],
    Fashion: [150, 2000],
    Sports: [300, 2500],
  };
  const cities = ['Ankara', 'Istanbul', 'Izmir', 'Bursa', 'Antalya'];
  const now = new Date();
  const rows = [];
  for (let i = 0; i < count; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const products = productsByCategory[category];
    const product = products[Math.floor(Math.random() * products.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const qty = 1 + Math.floor(Math.random() * 10);
    const [lo, hi] = priceRanges[category];
    const unit_price = Math.round((lo + Math.random() * (hi - lo)) * 100) / 100;
    const daysAgo = Math.floor(Math.random() * 90);
    const date = new Date(now);
    date.setUTCDate(date.getUTCDate() - daysAgo);
    rows.push({ date: toISODate(date), product, category, qty, unit_price, city });
  }
  return rows;
}

function seedIfEmpty() {
  const { c } = db.prepare('SELECT COUNT(*) AS c FROM sales').get();
  if (c > 0) return;

  const csvPath = findCsvPath();
  let rows;
  let source;
  if (csvPath) {
    rows = parseCsv(readFileSync(csvPath, 'utf8'));
    source = 'csv';
  } else {
    rows = generateRows(120);
    source = 'generated';
  }

  const insert = db.prepare(
    'INSERT INTO sales (date, product, category, qty, unit_price, city, revenue) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  db.exec('BEGIN');
  for (const r of rows) {
    insert.run(r.date, r.product, r.category, r.qty, r.unit_price, r.city, r.qty * r.unit_price);
  }
  db.exec('COMMIT');

  db.prepare('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)').run('source', source);
}

seedIfEmpty();

// ---------------------------------------------------------------------------
// Shared filter helper: builds a bound WHERE clause from the four filter params
// ---------------------------------------------------------------------------

function isValidDateStr(s) {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(new Date(`${s}T00:00:00Z`).getTime());
}

// A repeated query key arrives as an array, which SQLite cannot bind, so only
// plain non empty strings become filter values. Anything else is ignored.
function isValidTextValue(v) {
  return typeof v === 'string' && v.length > 0;
}

function buildFilter({ from, to, category, city } = {}) {
  const conditions = [];
  const params = [];
  if (isValidDateStr(from)) {
    conditions.push('date >= ?');
    params.push(from);
  }
  if (isValidDateStr(to)) {
    conditions.push('date <= ?');
    params.push(to);
  }
  if (isValidTextValue(category)) {
    conditions.push('category = ?');
    params.push(category);
  }
  if (isValidTextValue(city)) {
    conditions.push('city = ?');
    params.push(city);
  }
  const clause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  return { clause, params };
}

function daysBetweenInclusive(fromStr, toStr) {
  const a = new Date(`${fromStr}T00:00:00Z`);
  const b = new Date(`${toStr}T00:00:00Z`);
  return Math.round((b - a) / 86400000) + 1;
}

function addDays(dateStr, n) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return toISODate(d);
}

function round1(n) {
  return Math.round(n * 10) / 10;
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function pct(current, previous) {
  if (!previous) return null;
  return round1(((current - previous) / previous) * 100);
}

function formatMoney(n) {
  return n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatMoneyTL(n) {
  return `₺${formatMoney(n)}`;
}

function formatPercentNumber(n) {
  return n.toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function formatPercent(n) {
  const sign = n > 0 ? '+' : '';
  return `${sign}${formatPercentNumber(n)}%`;
}

function mondayOf(dateStr) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return toISODate(d);
}

function dayLabel(dateStr) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  return `${d.getUTCDate()} ${MONTHS_TR[d.getUTCMonth()]}`;
}

function weekLabel(mondayStr) {
  const monday = new Date(`${mondayStr}T00:00:00Z`);
  const sunday = new Date(monday);
  sunday.setUTCDate(sunday.getUTCDate() + 6);

  const sameMonth = monday.getUTCFullYear() === sunday.getUTCFullYear() && monday.getUTCMonth() === sunday.getUTCMonth();
  if (sameMonth) {
    return `${monday.getUTCDate()}-${sunday.getUTCDate()} ${MONTHS_TR[monday.getUTCMonth()]}`;
  }

  const sameYear = monday.getUTCFullYear() === sunday.getUTCFullYear();
  const start = `${monday.getUTCDate()} ${MONTHS_TR[monday.getUTCMonth()]}${sameYear ? '' : ` ${monday.getUTCFullYear()}`}`;
  const end = `${sunday.getUTCDate()} ${MONTHS_TR[sunday.getUTCMonth()]} ${sunday.getUTCFullYear()}`;
  return `${start} - ${end}`;
}

function monthLabel(monthStr) {
  const [year, month] = monthStr.split('-');
  return `${MONTHS_TR[Number(month) - 1]} ${year}`;
}

// Resolves the effective from/to for a request: explicit params win, otherwise
// the full min/max date of the rows matching the category/city filter.
function effectiveRange(query) {
  const { clause, params } = buildFilter({ category: query.category, city: query.city });
  const row = db.prepare(`SELECT MIN(date) AS min, MAX(date) AS max FROM sales ${clause}`).get(...params);
  const from = isValidDateStr(query.from) ? query.from : row.min;
  const to = isValidDateStr(query.to) ? query.to : row.max;
  return { from, to };
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

const app = express();

app.get('/api/meta', (req, res) => {
  const { c: rowCount } = db.prepare('SELECT COUNT(*) AS c FROM sales').get();
  const categories = db.prepare('SELECT DISTINCT category FROM sales ORDER BY category ASC').all().map((r) => r.category);
  const cities = db.prepare('SELECT DISTINCT city FROM sales ORDER BY city ASC').all().map((r) => r.city);
  const range = db.prepare('SELECT MIN(date) AS min, MAX(date) AS max FROM sales').get();
  const sourceRow = db.prepare('SELECT value FROM meta WHERE key = ?').get('source');

  res.json({
    categories,
    cities,
    dateRange: { min: range.min || null, max: range.max || null },
    rowCount,
    source: sourceRow ? sourceRow.value : 'generated',
  });
});

app.get('/api/kpis', (req, res) => {
  const { from, to } = effectiveRange(req.query);

  if (!from || !to) {
    res.json({
      range: { from: '', to: '', prevFrom: '', prevTo: '', days: 0 },
      current: { revenue: 0, units: 0, orders: 0, avgBasket: 0 },
      previous: { revenue: 0, units: 0, orders: 0, avgBasket: 0 },
      change: { revenue: null, units: null, orders: null, avgBasket: null },
    });
    return;
  }

  const days = daysBetweenInclusive(from, to);
  const prevTo = addDays(from, -1);
  const prevFrom = addDays(prevTo, -(days - 1));

  const aggregate = (fromStr, toStr) => {
    const { clause, params } = buildFilter({ from: fromStr, to: toStr, category: req.query.category, city: req.query.city });
    const row = db
      .prepare(`SELECT COUNT(*) AS orders, COALESCE(SUM(qty), 0) AS units, COALESCE(SUM(revenue), 0) AS revenue FROM sales ${clause}`)
      .get(...params);
    const avgBasket = row.orders ? row.revenue / row.orders : 0;
    return { revenue: round2(row.revenue), units: row.units, orders: row.orders, avgBasket: round2(avgBasket) };
  };

  const current = aggregate(from, to);
  const previous = aggregate(prevFrom, prevTo);

  res.json({
    range: { from, to, prevFrom, prevTo, days },
    current,
    previous,
    change: {
      revenue: pct(current.revenue, previous.revenue),
      units: pct(current.units, previous.units),
      orders: pct(current.orders, previous.orders),
      avgBasket: pct(current.avgBasket, previous.avgBasket),
    },
  });
});

app.get('/api/timeline', (req, res) => {
  const granularity = ['day', 'week', 'month'].includes(req.query.granularity) ? req.query.granularity : 'day';
  const { clause, params } = buildFilter(req.query);
  const rows = db.prepare(`SELECT date, qty, revenue FROM sales ${clause}`).all(...params);

  const buckets = new Map();
  for (const row of rows) {
    let bucket;
    let label;
    if (granularity === 'week') {
      bucket = mondayOf(row.date);
      label = weekLabel(bucket);
    } else if (granularity === 'month') {
      bucket = row.date.slice(0, 7);
      label = monthLabel(bucket);
    } else {
      bucket = row.date;
      label = dayLabel(bucket);
    }
    if (!buckets.has(bucket)) {
      buckets.set(bucket, { bucket, label, revenue: 0, units: 0, orders: 0 });
    }
    const b = buckets.get(bucket);
    b.revenue += row.revenue;
    b.units += row.qty;
    b.orders += 1;
  }

  const points = [...buckets.values()]
    .sort((a, b) => (a.bucket < b.bucket ? -1 : 1))
    .map((p) => ({ ...p, revenue: round2(p.revenue) }));

  res.json({ granularity, points });
});

app.get('/api/categories', (req, res) => {
  const { clause, params } = buildFilter(req.query);
  const rows = db
    .prepare(`SELECT category, SUM(revenue) AS revenue, SUM(qty) AS units, COUNT(*) AS orders FROM sales ${clause} GROUP BY category`)
    .all(...params);

  const total = rows.reduce((sum, r) => sum + r.revenue, 0);
  const items = rows
    .map((r) => ({
      category: r.category,
      revenue: round2(r.revenue),
      units: r.units,
      orders: r.orders,
      share: total ? round1((r.revenue / total) * 100) : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  res.json({ total: round2(total), items });
});

app.get('/api/cities', (req, res) => {
  const { clause, params } = buildFilter(req.query);
  const rows = db
    .prepare(`SELECT city, SUM(revenue) AS revenue, SUM(qty) AS units, COUNT(*) AS orders FROM sales ${clause} GROUP BY city`)
    .all(...params);

  const items = rows
    .map((r) => ({ city: r.city, revenue: round2(r.revenue), units: r.units, orders: r.orders }))
    .sort((a, b) => b.revenue - a.revenue);

  res.json({ items });
});

app.get('/api/products', (req, res) => {
  const { clause, params } = buildFilter(req.query);
  const rows = db
    .prepare(
      `SELECT product, category, SUM(revenue) AS revenue, SUM(qty) AS units, COUNT(*) AS orders FROM sales ${clause} GROUP BY product, category`
    )
    .all(...params);

  const total = rows.reduce((sum, r) => sum + r.revenue, 0);
  const items = rows
    .map((r) => ({
      product: r.product,
      category: r.category,
      revenue: round2(r.revenue),
      units: r.units,
      orders: r.orders,
      share: total ? round1((r.revenue / total) * 100) : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  res.json({ total: round2(total), items });
});

app.get('/api/insights', (req, res) => {
  const { from, to } = effectiveRange(req.query);
  const insights = [];

  if (!from || !to) {
    insights.push(
      {
        id: 'no-data',
        kind: 'info',
        title: 'Veri bulunamadı',
        text: 'Seçili filtrelerle eşleşen satış kaydı yok.',
        value: 0,
        valueLabel: '₺0,00',
      },
      {
        id: 'no-data-category',
        kind: 'info',
        title: 'Kategori verisi yok',
        text: 'Seçili filtrelerle eşleşen kategori bazlı satış kaydı yok.',
        value: 0,
        valueLabel: '₺0,00',
      },
      {
        id: 'no-data-city',
        kind: 'info',
        title: 'Şehir verisi yok',
        text: 'Seçili filtrelerle eşleşen şehir bazlı satış kaydı yok.',
        value: 0,
        valueLabel: '₺0,00',
      }
    );
    res.json({ insights });
    return;
  }

  const days = daysBetweenInclusive(from, to);
  const prevTo = addDays(from, -1);
  const prevFrom = addDays(prevTo, -(days - 1));

  const { clause: curClause, params: curParams } = buildFilter({ from, to, category: req.query.category, city: req.query.city });
  const currentRows = db.prepare(`SELECT * FROM sales ${curClause}`).all(...curParams);

  const { clause: prevClause, params: prevParams } = buildFilter({
    from: prevFrom,
    to: prevTo,
    category: req.query.category,
    city: req.query.city,
  });
  const previousRows = db.prepare(`SELECT * FROM sales ${prevClause}`).all(...prevParams);

  const groupBy = (rows, key) => {
    const map = new Map();
    for (const r of rows) {
      if (!map.has(r[key])) map.set(r[key], 0);
      map.set(r[key], map.get(r[key]) + r.revenue);
    }
    return map;
  };

  const totalRevenue = currentRows.reduce((sum, r) => sum + r.revenue, 0);

  // 1. Best day
  const byDate = groupBy(currentRows, 'date');
  if (byDate.size > 0) {
    const [bestDate, bestRevenue] = [...byDate.entries()].sort((a, b) => b[1] - a[1])[0];
    insights.push({
      id: 'best-day',
      kind: 'peak',
      title: 'En iyi gün',
      text: `${dayLabel(bestDate)} tarihinde ${formatMoneyTL(bestRevenue)} gelir elde edildi, bu dönemin en yüksek günü.`,
      value: round2(bestRevenue),
      valueLabel: formatMoneyTL(bestRevenue),
    });
  } else {
    insights.push({
      id: 'best-day',
      kind: 'peak',
      title: 'En iyi gün',
      text: 'Bu dönemde satış kaydı bulunamadı.',
      value: 0,
      valueLabel: '₺0,00',
    });
  }

  // 2. Standout category
  const byCategory = groupBy(currentRows, 'category');
  if (byCategory.size > 0) {
    const [topCategory, topCategoryRevenue] = [...byCategory.entries()].sort((a, b) => b[1] - a[1])[0];
    const share = totalRevenue ? round1((topCategoryRevenue / totalRevenue) * 100) : 0;
    insights.push({
      id: 'standout-category',
      kind: 'category',
      title: 'Öne çıkan kategori',
      text: `${topCategory} kategorisi toplam gelirin yüzde ${formatPercentNumber(share)} kadarını oluşturarak öne çıktı.`,
      value: round2(topCategoryRevenue),
      valueLabel: formatMoneyTL(topCategoryRevenue),
    });
  }

  // 3. Biggest mover (category vs previous period)
  const byCategoryPrev = groupBy(previousRows, 'category');
  let bestMover = null;
  for (const [cat, curRev] of byCategory.entries()) {
    const prevRev = byCategoryPrev.get(cat) || 0;
    if (prevRev <= 0) continue;
    const change = pct(curRev, prevRev);
    if (change === null) continue;
    if (!bestMover || Math.abs(change) > Math.abs(bestMover.change)) {
      bestMover = { cat, change, curRev };
    }
  }
  if (bestMover) {
    const direction = bestMover.change >= 0 ? 'arttı' : 'azaldı';
    insights.push({
      id: 'biggest-mover',
      kind: 'mover',
      title: 'En büyük değişim',
      text: `${bestMover.cat} kategorisinin geliri önceki döneme göre yüzde ${formatPercentNumber(Math.abs(bestMover.change))} ${direction}.`,
      value: bestMover.change,
      valueLabel: formatPercent(bestMover.change),
    });
  }

  // 4. Top city
  const byCity = groupBy(currentRows, 'city');
  if (byCity.size > 0) {
    const [topCity, topCityRevenue] = [...byCity.entries()].sort((a, b) => b[1] - a[1])[0];
    insights.push({
      id: 'top-city',
      kind: 'city',
      title: 'Lider şehir',
      text: `${topCity} şehri ${formatMoneyTL(topCityRevenue)} gelir ile lider şehir oldu.`,
      value: round2(topCityRevenue),
      valueLabel: formatMoneyTL(topCityRevenue),
    });
  }

  // 5. Suggested action
  if (byCategory.size > 0) {
    const sortedCategories = [...byCategory.entries()].sort((a, b) => b[1] - a[1]);
    const weakest = sortedCategories[sortedCategories.length - 1];
    insights.push({
      id: 'action',
      kind: 'action',
      title: 'Önerilen aksiyon',
      text: `${weakest[0]} kategorisinde stok ve kampanya gözden geçirilmeli, bu dönemde sadece ${formatMoneyTL(weakest[1])} gelir getirdi.`,
      value: round2(weakest[1]),
      valueLabel: formatMoneyTL(weakest[1]),
    });
  }

  // Guarantee a minimum of 3 insights even when the filter combination leaves too
  // little data for the sections above to fire.
  const fallbackPool = [
    {
      id: 'no-data-city',
      kind: 'info',
      title: 'Şehir verisi yok',
      text: 'Seçili filtrelerle eşleşen şehir bazlı satış kaydı yok.',
      value: 0,
      valueLabel: '₺0,00',
    },
    {
      id: 'no-data-category',
      kind: 'info',
      title: 'Kategori verisi yok',
      text: 'Seçili filtrelerle eşleşen kategori bazlı satış kaydı yok.',
      value: 0,
      valueLabel: '₺0,00',
    },
    {
      id: 'no-data-period',
      kind: 'info',
      title: 'Dönem karşılaştırması yok',
      text: 'Seçili dönemde karşılaştırılabilir bir önceki dönem verisi yok.',
      value: 0,
      valueLabel: '₺0,00',
    },
  ];
  let fallbackIndex = 0;
  while (insights.length < 3 && fallbackIndex < fallbackPool.length) {
    const candidate = fallbackPool[fallbackIndex++];
    if (!insights.some((i) => i.id === candidate.id)) {
      insights.push(candidate);
    }
  }

  res.json({ insights: insights.slice(0, 5) });
});

app.use('/vendor', express.static(join(__dirname, 'node_modules/chart.js/dist')));
app.use(express.static(join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Satis Analitik Paneli http://localhost:${PORT}`);
});
