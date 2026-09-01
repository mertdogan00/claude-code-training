'use strict';

// SQLite access layer for Cuzdan. Node built-in node:sqlite only, no npm packages.

const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const DB_PATH = path.join(__dirname, '..', 'cuzdan.sqlite');
const CATEGORIES = ['food', 'transport', 'bills', 'entertainment', 'groceries', 'other'];

const db = new DatabaseSync(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    note TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

// Seed 8 sample expenses on first run so every widget has something to show.
// Timestamps are interpolated between the start of the current month and now,
// oldest first, so they always land within this month and never in the
// future (which would otherwise outrank a real new entry in newest-first
// order on early days of the month).
function seedIfEmpty() {
  const row = db.prepare('SELECT COUNT(*) AS count FROM expenses').get();
  if (row.count > 0) return;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
  const spanMs = Math.max(60000, now.getTime() - monthStart.getTime());

  const plan = [
    { fraction: 0.05, category: 'food', amount: 145.5, note: 'Kahve ve simit' },
    { fraction: 0.15, category: 'transport', amount: 65, note: 'Otobus karti' },
    { fraction: 0.3, category: 'groceries', amount: 320, note: 'Haftalik market' },
    { fraction: 0.42, category: 'bills', amount: 450, note: 'Elektrik faturasi' },
    { fraction: 0.55, category: 'other', amount: 75, note: 'Kirtasiye' },
    { fraction: 0.68, category: 'groceries', amount: 260, note: 'Meyve sebze' },
    { fraction: 0.82, category: 'entertainment', amount: 180, note: 'Sinema bileti' },
    { fraction: 0.93, category: 'food', amount: 210, note: 'Aksam yemegi' },
  ];

  const insert = db.prepare(
    'INSERT INTO expenses (amount, category, note, created_at) VALUES (?, ?, ?, ?)'
  );

  for (const item of plan) {
    const date = new Date(monthStart.getTime() + spanMs * item.fraction);
    insert.run(item.amount, item.category, item.note, date.toISOString());
  }
}

seedIfEmpty();

function listExpenses(limit) {
  if (limit) {
    return db
      .prepare('SELECT * FROM expenses ORDER BY created_at DESC, id DESC LIMIT ?')
      .all(limit);
  }
  return db.prepare('SELECT * FROM expenses ORDER BY created_at DESC, id DESC').all();
}

function listExpensesForMonth(year, month) {
  const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  return db
    .prepare("SELECT * FROM expenses WHERE substr(created_at, 1, 7) = ? ORDER BY created_at DESC")
    .all(prefix);
}

function addExpense({ amount, category, note }) {
  const createdAt = new Date().toISOString();
  const stmt = db.prepare(
    'INSERT INTO expenses (amount, category, note, created_at) VALUES (?, ?, ?, ?)'
  );
  const info = stmt.run(amount, category, note, createdAt);
  return db.prepare('SELECT * FROM expenses WHERE id = ?').get(info.lastInsertRowid);
}

function deleteExpense(id) {
  const info = db.prepare('DELETE FROM expenses WHERE id = ?').run(id);
  return info.changes > 0;
}

function getLimit() {
  const row = db.prepare("SELECT value FROM settings WHERE key = 'monthly_limit'").get();
  return row ? Number(row.value) : null;
}

function setLimit(value) {
  db.prepare(
    "INSERT INTO settings (key, value) VALUES ('monthly_limit', ?) " +
      'ON CONFLICT(key) DO UPDATE SET value = excluded.value'
  ).run(String(value));
  return value;
}

module.exports = {
  CATEGORIES,
  listExpenses,
  listExpensesForMonth,
  addExpense,
  deleteExpense,
  getLimit,
  setLimit,
};
