import express from 'express';
import QRCode from 'qrcode';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

// Change this one line to set the admin password.
const ADMIN_PASSWORD = 'kebap2026';

const PORT = process.env.PORT || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const RESTAURANT = { name: 'Bereket Ocakbaşı', tagline: 'Ateşten sofraya' };
const TAG_SLUGS = ['vegan', 'vejetaryen', 'glutensiz', 'laktozsuz', 'aci'];
const SESSION_MAX_AGE_MS = 12 * 60 * 60 * 1000;

const db = new DatabaseSync(path.join(__dirname, 'data.sqlite'));

db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    price REAL NOT NULL,
    prep_minutes INTEGER NOT NULL DEFAULT 10,
    allergens TEXT NOT NULL DEFAULT '',
    available INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
`);

function getMeta(key) {
  const row = db.prepare('SELECT value FROM meta WHERE key = ?').get(key);
  return row ? row.value : null;
}

function setMeta(key, value) {
  db.prepare('INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(key, String(value));
}

function bumpVersion() {
  const current = parseInt(getMeta('version') || '0', 10);
  setMeta('version', current + 1);
}

if (getMeta('session_key') === null) {
  setMeta('session_key', crypto.randomBytes(32).toString('hex'));
}
if (getMeta('version') === null) {
  setMeta('version', '0');
}

// Seed on first start only, when there are no categories yet.
const categoryCount = db.prepare('SELECT COUNT(*) AS n FROM categories').get().n;
if (categoryCount === 0) {
  const insertCategory = db.prepare('INSERT INTO categories (name, sort_order) VALUES (?, ?)');
  const insertItem = db.prepare(`
    INSERT INTO items (category_id, name, description, price, prep_minutes, allergens, available, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const seed = [
    {
      name: 'Başlangıçlar',
      items: [
        { name: 'Mercimek Çorbası', description: 'Tereyağı ve nane ile', price: 95, prep_minutes: 8, allergens: ['vejetaryen', 'glutensiz'], available: 1 },
        { name: 'Ezme Salata', description: 'Acı biber ve nar ekşili domates ezmesi', price: 85, prep_minutes: 5, allergens: ['vegan', 'aci'], available: 1 },
        { name: 'Humus', description: 'Nohut püresi ve tereyağı sos', price: 110, prep_minutes: 6, allergens: ['vejetaryen'], available: 1 },
        { name: 'Çiğ Köfte Sarma', description: 'Marul yaprağında bulgurlu köfte', price: 120, prep_minutes: 10, allergens: ['aci'], available: 0 },
      ],
    },
    {
      name: 'Ana Yemekler',
      items: [
        { name: 'Adana Kebap', description: 'Elde çekilmiş kıyma, közlenmiş biber ile', price: 320, prep_minutes: 20, allergens: ['aci'], available: 1 },
        { name: 'Urfa Kebap', description: 'Acısız kıyma kebabı, közlenmiş domates ile', price: 320, prep_minutes: 20, allergens: ['laktozsuz'], available: 1 },
        { name: 'Tavuk Şiş', description: 'Marine edilmiş tavuk göğsü, közde pişmiş', price: 260, prep_minutes: 18, allergens: ['glutensiz'], available: 1 },
        { name: 'Karışık Izgara', description: 'Adana, pirzola ve tavuk kanat bir arada', price: 420, prep_minutes: 25, allergens: ['aci'], available: 1 },
      ],
    },
    {
      name: 'Tatlılar',
      items: [
        { name: 'Baklava', description: 'Antep fıstıklı, şerbetli baklava', price: 140, prep_minutes: 5, allergens: ['vejetaryen'], available: 1 },
        { name: 'Künefe', description: 'Sıcak servis, kaymak ile', price: 160, prep_minutes: 12, allergens: ['vejetaryen'], available: 1 },
        { name: 'Sütlaç', description: 'Fırında pişmiş, tarçınlı sütlaç', price: 100, prep_minutes: 4, allergens: ['vejetaryen', 'glutensiz'], available: 1 },
        { name: 'Kazandibi', description: 'Karamelize taban, süt tatlısı', price: 110, prep_minutes: 4, allergens: ['vejetaryen', 'glutensiz'], available: 1 },
      ],
    },
    {
      name: 'İçecekler',
      items: [
        { name: 'Ayran', description: 'Ev yapımı, soğuk servis', price: 45, prep_minutes: 2, allergens: ['vejetaryen', 'glutensiz'], available: 1 },
        { name: 'Şalgam', description: 'Acılı, geleneksel tarif', price: 50, prep_minutes: 2, allergens: ['vegan', 'aci', 'glutensiz', 'laktozsuz'], available: 1 },
        { name: 'Türk Kahvesi', description: 'Közde pişmiş, lokum ile', price: 70, prep_minutes: 6, allergens: ['vejetaryen', 'glutensiz'], available: 1 },
        { name: 'Limonata', description: 'Taze sıkılmış, nane ile', price: 60, prep_minutes: 3, allergens: ['vegan', 'glutensiz'], available: 1 },
      ],
    },
  ];

  seed.forEach((category, categoryIndex) => {
    const result = insertCategory.run(category.name, categoryIndex);
    const categoryId = Number(result.lastInsertRowid);
    category.items.forEach((item, itemIndex) => {
      insertItem.run(
        categoryId,
        item.name,
        item.description,
        item.price,
        item.prep_minutes,
        item.allergens.join(','),
        item.available,
        itemIndex
      );
    });
  });

  setMeta('version', '1');
}

// --- auth helpers ---

function sign(expiry) {
  const key = getMeta('session_key');
  return crypto.createHmac('sha256', key).update(String(expiry)).digest('hex');
}

function makeSessionCookieValue() {
  const expiry = Date.now() + SESSION_MAX_AGE_MS;
  return `${expiry}.${sign(expiry)}`;
}

function isValidSessionValue(value) {
  if (!value || typeof value !== 'string') return false;
  const dotIndex = value.indexOf('.');
  if (dotIndex === -1) return false;
  const expiryPart = value.slice(0, dotIndex);
  const sigPart = value.slice(dotIndex + 1);
  const expiry = parseInt(expiryPart, 10);
  if (!Number.isFinite(expiry) || expiry < Date.now()) return false;
  const expected = sign(expiry);
  const expectedBuf = Buffer.from(expected, 'hex');
  const actualBuf = Buffer.from(sigPart, 'hex');
  if (expectedBuf.length !== actualBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}

function parseCookies(header) {
  const cookies = {};
  if (!header) return cookies;
  header.split(';').forEach((pair) => {
    const eq = pair.indexOf('=');
    if (eq === -1) return;
    const key = pair.slice(0, eq).trim();
    const value = pair.slice(eq + 1).trim();
    if (key) cookies[key] = decodeURIComponent(value);
  });
  return cookies;
}

function hasValidSession(req) {
  const cookies = parseCookies(req.headers.cookie);
  return isValidSessionValue(cookies.qrmenu_session);
}

function requireAuth(req, res, next) {
  if (!hasValidSession(req)) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  next();
}

function passwordsMatch(candidate) {
  const expected = Buffer.from(ADMIN_PASSWORD);
  const actual = Buffer.from(String(candidate ?? ''));
  if (expected.length !== actual.length) {
    // still run a comparison so timing doesn't leak length differences
    crypto.timingSafeEqual(expected, expected);
    return false;
  }
  return crypto.timingSafeEqual(expected, actual);
}

// --- serialization helpers ---

function serializeItem(row) {
  return {
    id: row.id,
    category_id: row.category_id,
    name: row.name,
    description: row.description,
    price: row.price,
    prep_minutes: row.prep_minutes,
    allergens: row.allergens ? row.allergens.split(',').filter(Boolean) : [],
    available: !!row.available,
    sort_order: row.sort_order,
  };
}

function serializeCategory(row) {
  return { id: row.id, name: row.name, sort_order: row.sort_order };
}

function getVersion() {
  return parseInt(getMeta('version') || '0', 10);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// --- validation helpers ---

function validateName(name) {
  return typeof name === 'string' && name.trim().length > 0;
}

function validatePrice(price) {
  const n = Number(price);
  return Number.isFinite(n) && n >= 0;
}

function categoryExists(categoryId) {
  return !!db.prepare('SELECT id FROM categories WHERE id = ?').get(categoryId);
}

function validateAllergens(allergens) {
  if (allergens === undefined) return true;
  if (!Array.isArray(allergens)) return false;
  return allergens.every((tag) => TAG_SLUGS.includes(tag));
}

// --- app ---

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/api/menu', (req, res) => {
  const categories = db.prepare('SELECT * FROM categories ORDER BY sort_order ASC, id ASC').all();
  const items = db.prepare('SELECT * FROM items ORDER BY sort_order ASC, id ASC').all();
  res.json({
    version: getVersion(),
    restaurant: RESTAURANT,
    categories: categories.map(serializeCategory),
    items: items.map(serializeItem),
  });
});

app.get('/api/version', (req, res) => {
  res.json({ version: getVersion() });
});

app.get('/api/session', (req, res) => {
  res.json({ authenticated: hasValidSession(req) });
});

app.post('/api/login', (req, res) => {
  const { password } = req.body || {};
  if (!passwordsMatch(password)) {
    return res.status(401).json({ error: 'invalid password' });
  }
  const value = makeSessionCookieValue();
  res.setHeader(
    'Set-Cookie',
    `qrmenu_session=${value}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${Math.floor(SESSION_MAX_AGE_MS / 1000)}`
  );
  res.json({ ok: true });
});

app.post('/api/logout', (req, res) => {
  res.setHeader('Set-Cookie', 'qrmenu_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0');
  res.json({ ok: true });
});

// --- admin: categories ---

app.post('/api/admin/categories', requireAuth, (req, res) => {
  const { name } = req.body || {};
  if (!validateName(name)) {
    return res.status(400).json({ error: 'name is required' });
  }
  const maxOrder = db.prepare('SELECT MAX(sort_order) AS m FROM categories').get().m;
  const sortOrder = maxOrder === null ? 0 : maxOrder + 1;
  const result = db.prepare('INSERT INTO categories (name, sort_order) VALUES (?, ?)').run(name.trim(), sortOrder);
  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(Number(result.lastInsertRowid));
  bumpVersion();
  res.json({ category: serializeCategory(category) });
});

app.patch('/api/admin/categories/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id);
  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
  if (!category) {
    return res.status(404).json({ error: 'not found' });
  }
  const { name } = req.body || {};
  if (!validateName(name)) {
    return res.status(400).json({ error: 'name is required' });
  }
  db.prepare('UPDATE categories SET name = ? WHERE id = ?').run(name.trim(), id);
  const updated = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
  bumpVersion();
  res.json({ category: serializeCategory(updated) });
});

app.delete('/api/admin/categories/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id);
  const result = db.prepare('DELETE FROM categories WHERE id = ?').run(id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'not found' });
  }
  bumpVersion();
  res.json({ ok: true });
});

app.post('/api/admin/categories/:id/move', requireAuth, (req, res) => {
  const id = Number(req.params.id);
  const { direction } = req.body || {};
  if (direction !== 'up' && direction !== 'down') {
    return res.status(400).json({ error: 'direction must be up or down' });
  }
  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
  if (!category) {
    return res.status(404).json({ error: 'not found' });
  }
  const neighbor =
    direction === 'up'
      ? db.prepare('SELECT * FROM categories WHERE sort_order < ? ORDER BY sort_order DESC LIMIT 1').get(category.sort_order)
      : db.prepare('SELECT * FROM categories WHERE sort_order > ? ORDER BY sort_order ASC LIMIT 1').get(category.sort_order);
  if (neighbor) {
    db.prepare('UPDATE categories SET sort_order = ? WHERE id = ?').run(neighbor.sort_order, category.id);
    db.prepare('UPDATE categories SET sort_order = ? WHERE id = ?').run(category.sort_order, neighbor.id);
    bumpVersion();
  }
  res.json({ ok: true });
});

// --- admin: items ---

app.post('/api/admin/items', requireAuth, (req, res) => {
  const { category_id, name, description, price, prep_minutes, allergens, available } = req.body || {};
  if (!validateName(name)) {
    return res.status(400).json({ error: 'name is required' });
  }
  if (!validatePrice(price)) {
    return res.status(400).json({ error: 'price must be a non negative number' });
  }
  if (!categoryExists(category_id)) {
    return res.status(400).json({ error: 'unknown category_id' });
  }
  if (!validateAllergens(allergens)) {
    return res.status(400).json({ error: 'unknown allergen tag' });
  }
  const maxOrder = db.prepare('SELECT MAX(sort_order) AS m FROM items WHERE category_id = ?').get(category_id).m;
  const sortOrder = maxOrder === null ? 0 : maxOrder + 1;
  const result = db
    .prepare(
      `INSERT INTO items (category_id, name, description, price, prep_minutes, allergens, available, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      category_id,
      name.trim(),
      description || '',
      Number(price),
      prep_minutes === undefined ? 10 : Number(prep_minutes),
      Array.isArray(allergens) ? allergens.join(',') : '',
      available === false ? 0 : 1,
      sortOrder
    );
  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(Number(result.lastInsertRowid));
  bumpVersion();
  res.json({ item: serializeItem(item) });
});

app.patch('/api/admin/items/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'not found' });
  }
  const { category_id, name, description, price, prep_minutes, allergens, available } = req.body || {};

  if (name !== undefined && !validateName(name)) {
    return res.status(400).json({ error: 'name is required' });
  }
  if (price !== undefined && !validatePrice(price)) {
    return res.status(400).json({ error: 'price must be a non negative number' });
  }
  if (category_id !== undefined && !categoryExists(category_id)) {
    return res.status(400).json({ error: 'unknown category_id' });
  }
  if (allergens !== undefined && !validateAllergens(allergens)) {
    return res.status(400).json({ error: 'unknown allergen tag' });
  }

  const next = {
    category_id: category_id !== undefined ? category_id : existing.category_id,
    name: name !== undefined ? name.trim() : existing.name,
    description: description !== undefined ? description : existing.description,
    price: price !== undefined ? Number(price) : existing.price,
    prep_minutes: prep_minutes !== undefined ? Number(prep_minutes) : existing.prep_minutes,
    allergens: allergens !== undefined ? allergens.join(',') : existing.allergens,
    available: available !== undefined ? (available ? 1 : 0) : existing.available,
  };

  db.prepare(
    `UPDATE items SET category_id = ?, name = ?, description = ?, price = ?, prep_minutes = ?, allergens = ?, available = ?
     WHERE id = ?`
  ).run(
    next.category_id,
    next.name,
    next.description,
    next.price,
    next.prep_minutes,
    next.allergens,
    next.available,
    id
  );
  const updated = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
  bumpVersion();
  res.json({ item: serializeItem(updated) });
});

app.delete('/api/admin/items/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id);
  const result = db.prepare('DELETE FROM items WHERE id = ?').run(id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'not found' });
  }
  bumpVersion();
  res.json({ ok: true });
});

app.post('/api/admin/items/:id/availability', requireAuth, (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'not found' });
  }
  const { available } = req.body || {};
  if (typeof available !== 'boolean') {
    return res.status(400).json({ error: 'available must be a boolean' });
  }
  db.prepare('UPDATE items SET available = ? WHERE id = ?').run(available ? 1 : 0, id);
  const updated = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
  bumpVersion();
  res.json({ item: serializeItem(updated) });
});

app.post('/api/admin/items/:id/move', requireAuth, (req, res) => {
  const id = Number(req.params.id);
  const { direction } = req.body || {};
  if (direction !== 'up' && direction !== 'down') {
    return res.status(400).json({ error: 'direction must be up or down' });
  }
  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
  if (!item) {
    return res.status(404).json({ error: 'not found' });
  }
  const neighbor =
    direction === 'up'
      ? db
          .prepare('SELECT * FROM items WHERE category_id = ? AND sort_order < ? ORDER BY sort_order DESC LIMIT 1')
          .get(item.category_id, item.sort_order)
      : db
          .prepare('SELECT * FROM items WHERE category_id = ? AND sort_order > ? ORDER BY sort_order ASC LIMIT 1')
          .get(item.category_id, item.sort_order);
  if (neighbor) {
    db.prepare('UPDATE items SET sort_order = ? WHERE id = ?').run(neighbor.sort_order, item.id);
    db.prepare('UPDATE items SET sort_order = ? WHERE id = ?').run(item.sort_order, neighbor.id);
    bumpVersion();
  }
  res.json({ ok: true });
});

// --- QR ---

function clampTables(raw) {
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return 12;
  return Math.min(n, 40);
}

async function buildQrCards(req, tables) {
  const cards = [];
  for (let table = 1; table <= tables; table += 1) {
    const url = `${req.protocol}://${req.get('host')}/?masa=${table}`;
    const dataUrl = await QRCode.toDataURL(url, { margin: 1, width: 320 });
    cards.push({ table, url, dataUrl });
  }
  return cards;
}

app.get('/api/admin/qr', requireAuth, async (req, res) => {
  const tables = clampTables(req.query.tables ?? 12);
  try {
    const cards = await buildQrCards(req, tables);
    res.json({ cards });
  } catch {
    res.status(400).json({ error: 'could not build QR codes' });
  }
});

app.get('/admin/qr', async (req, res) => {
  if (!hasValidSession(req)) {
    return res.redirect('/admin');
  }
  const tables = clampTables(req.query.tables ?? 12);
  let cards;
  try {
    cards = await buildQrCards(req, tables);
  } catch {
    return res.status(400).json({ error: 'could not build QR codes' });
  }
  const restaurantName = escapeHtml(RESTAURANT.name);

  const cardsHtml = cards
    .map(
      (card) => `
        <div class="qr-card">
          <div class="qr-card-restaurant">${restaurantName}</div>
          <div class="qr-card-table">Masa ${escapeHtml(card.table)}</div>
          <img src="${escapeHtml(card.dataUrl)}" alt="Masa ${escapeHtml(card.table)} QR kodu" width="220" height="220" />
          <div class="qr-card-hint">Menü için okutun</div>
        </div>`
    )
    .join('\n');

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8" />
<title>${restaurantName} - Masa QR Kodları</title>
<style>
  @page { size: A4; margin: 10mm; }
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 16px; }
  .sheet-heading { font-size: 20px; font-weight: bold; margin: 0 0 4px; }
  .sheet-subheading { font-size: 14px; color: #555; margin: 0 0 16px; }
  .toolbar { margin-bottom: 12px; }
  .toolbar button {
    background: #b5502e;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    padding: 8px 16px;
    cursor: pointer;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: 1fr;
    gap: 0;
  }
  .qr-card {
    border: 1px dashed #999;
    padding: 12px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }
  .qr-card-restaurant { font-weight: bold; font-size: 14px; }
  .qr-card-table { font-size: 20px; font-weight: bold; }
  .qr-card-hint { font-size: 12px; color: #333; }
  .qr-card img { display: block; }
  @media print {
    .toolbar { display: none; }
    .sheet-heading, .sheet-subheading { display: none; }
  }
</style>
</head>
<body>
  <h1 class="sheet-heading">${restaurantName}</h1>
  <p class="sheet-subheading">Masa kartları, kesip masalara yerleştirin</p>
  <div class="toolbar">
    <button onclick="window.print()">Yazdır</button>
  </div>
  <div class="grid">
${cardsHtml}
  </div>
</body>
</html>`);
});

// JSON error handler: keep bad payloads from crashing the server.
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  res.status(400).json({ error: 'invalid request' });
});

app.listen(PORT, () => {
  console.log(`QR Menu server listening on http://localhost:${PORT}`);
});
