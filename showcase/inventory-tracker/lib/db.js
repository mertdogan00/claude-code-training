'use strict';

// Schema, seed data, and all product/movement queries for the Stok Defteri app.
// Uses node:sqlite (DatabaseSync), a Node built-in. No npm dependency.

const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');

const DB_PATH = path.join(__dirname, '..', 'stok-defteri.sqlite');
const db = new DatabaseSync(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    critical_threshold INTEGER NOT NULL DEFAULT 5,
    unit_price REAL NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS movements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    change INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

const SEED_PRODUCTS = [
  ['Ekmek', 'Gıda', 40, 10, 6.5],
  ['Süt (1L)', 'Gıda', 18, 8, 24.9],
  ['A4 Kağıt (500 lü)', 'Kırtasiye', 12, 5, 89],
  ['Mavi Tükenmez Kalem', 'Kırtasiye', 4, 5, 7.5],
  ['Cam Temizleyici', 'Temizlik', 7, 6, 39.9],
  ['Bulaşık Deterjanı', 'Temizlik', 3, 4, 54],
];

function seedIfEmpty() {
  const { count } = db.prepare('SELECT COUNT(*) AS count FROM products').get();
  if (count > 0) return;
  const insert = db.prepare(
    'INSERT INTO products (name, category, quantity, critical_threshold, unit_price) VALUES (?, ?, ?, ?, ?)'
  );
  for (const [name, category, quantity, threshold, price] of SEED_PRODUCTS) {
    const result = insert.run(name, category, quantity, threshold, price);
    recordMovement(result.lastInsertRowid, name, quantity);
  }
}

function recordMovement(productId, productName, change) {
  db.prepare(
    'INSERT INTO movements (product_id, product_name, change) VALUES (?, ?, ?)'
  ).run(productId, productName, change);
}

function listProducts() {
  return db.prepare('SELECT * FROM products ORDER BY name COLLATE NOCASE').all();
}

function getProduct(id) {
  return db.prepare('SELECT * FROM products WHERE id = ?').get(id);
}

function insertProduct({ name, category, quantity, criticalThreshold, unitPrice }) {
  const result = db
    .prepare(
      'INSERT INTO products (name, category, quantity, critical_threshold, unit_price) VALUES (?, ?, ?, ?, ?)'
    )
    .run(name, category, quantity, criticalThreshold, unitPrice);
  recordMovement(result.lastInsertRowid, name, quantity);
  return getProduct(result.lastInsertRowid);
}

// Applies delta to a product's quantity. Returns { error: 'negative' } if the
// result would go below zero, { error: 'not_found' } if the product is missing,
// or the updated product row on success.
function adjustQuantity(id, delta) {
  const product = getProduct(id);
  if (!product) return { error: 'not_found' };
  const nextQuantity = product.quantity + delta;
  if (nextQuantity < 0) return { error: 'negative' };
  db.prepare('UPDATE products SET quantity = ? WHERE id = ?').run(nextQuantity, id);
  recordMovement(id, product.name, delta);
  return getProduct(id);
}

function listRecentMovements(limit = 10) {
  return db.prepare('SELECT * FROM movements ORDER BY id DESC LIMIT ?').all(limit);
}

seedIfEmpty();

module.exports = {
  listProducts,
  getProduct,
  insertProduct,
  adjustQuantity,
  listRecentMovements,
};
