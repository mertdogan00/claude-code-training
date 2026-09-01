const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');

const DB_PATH = path.join(__dirname, '..', 'qr-menu.sqlite');

const db = new DatabaseSync(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    sort_order INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    price REAL NOT NULL,
    sold_out INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

function seedIfEmpty() {
  const { count } = db.prepare('SELECT COUNT(*) AS count FROM categories').get();
  if (count > 0) return;

  const insertCategory = db.prepare('INSERT INTO categories (name, sort_order) VALUES (?, ?)');
  const kahve = insertCategory.run('Kahve', 0).lastInsertRowid;
  const tatli = insertCategory.run('Tatlı', 1).lastInsertRowid;
  const atistirmalik = insertCategory.run('Atıştırmalık', 2).lastInsertRowid;

  const insertProduct = db.prepare(
    'INSERT INTO products (category_id, name, description, price, sold_out) VALUES (?, ?, ?, ?, ?)'
  );

  const seed = [
    [kahve, 'Türk Kahvesi', 'Geleneksel usul, sade veya şekerli', 60, 0],
    [kahve, 'Filtre Kahve', 'Günün demlemesi', 70, 0],
    [kahve, 'Latte', 'Espresso ve buharda ısıtılmış süt', 85, 0],
    [kahve, 'Cappuccino', 'Yoğun köpüklü klasik', 85, 1],
    [tatli, 'Cheesecake', 'Frambuazlı, ev yapımı', 120, 0],
    [tatli, 'Brownie', 'Sıcak servis, çikolata soslu', 95, 0],
    [atistirmalik, 'Tost', 'Kaşarlı, sucuklu', 90, 0],
    [atistirmalik, 'Simit Tabağı', 'Kahvaltılık peynir ve zeytin ile', 75, 0]
  ];

  for (const row of seed) insertProduct.run(...row);
}

seedIfEmpty();

function listCategories() {
  return db.prepare('SELECT * FROM categories ORDER BY sort_order, id').all();
}

function addCategory(name) {
  const { count } = db.prepare('SELECT COUNT(*) AS count FROM categories').get();
  const info = db
    .prepare('INSERT INTO categories (name, sort_order) VALUES (?, ?)')
    .run(name, count);
  return db.prepare('SELECT * FROM categories WHERE id = ?').get(info.lastInsertRowid);
}

function listProducts() {
  return db.prepare('SELECT * FROM products ORDER BY category_id, id').all();
}

function getProduct(id) {
  return db.prepare('SELECT * FROM products WHERE id = ?').get(id);
}

function addProduct({ categoryId, name, description, price }) {
  const info = db
    .prepare(
      'INSERT INTO products (category_id, name, description, price, sold_out) VALUES (?, ?, ?, ?, 0)'
    )
    .run(categoryId, name, description, price);
  return getProduct(info.lastInsertRowid);
}

function updateProduct(id, { categoryId, name, description, price, soldOut }) {
  db.prepare(
    `UPDATE products
     SET category_id = ?, name = ?, description = ?, price = ?, sold_out = ?
     WHERE id = ?`
  ).run(categoryId, name, description, price, soldOut ? 1 : 0, id);
  return getProduct(id);
}

function deleteProduct(id) {
  db.prepare('DELETE FROM products WHERE id = ?').run(id);
}

function categoryExists(id) {
  return Boolean(db.prepare('SELECT id FROM categories WHERE id = ?').get(id));
}

module.exports = {
  listCategories,
  addCategory,
  listProducts,
  getProduct,
  addProduct,
  updateProduct,
  deleteProduct,
  categoryExists
};
