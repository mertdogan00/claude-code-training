// Loads the sales CSV into an on-disk SQLite database at startup.
// Skips malformed rows and reports how many were skipped.
'use strict';

const fs = require('node:fs');
const { DatabaseSync } = require('node:sqlite');

const REQUIRED_COLUMNS = ['date', 'product', 'category', 'qty', 'unit_price', 'city'];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function readCsvFile(csvPath) {
  try {
    return fs.readFileSync(csvPath, 'utf8');
  } catch {
    throw new Error(`CSV dosyası bulunamadı: ${csvPath}`);
  }
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) {
    throw new Error('CSV dosyası boş.');
  }

  const header = lines[0].split(',').map((cell) => cell.trim());
  const missing = REQUIRED_COLUMNS.filter((col) => !header.includes(col));
  if (missing.length > 0) {
    throw new Error(
      `CSV dosyası geçersiz: eksik sütun(lar): ${missing.join(', ')}. ` +
        `Beklenen sütunlar: ${REQUIRED_COLUMNS.join(', ')}.`,
    );
  }

  const index = {};
  REQUIRED_COLUMNS.forEach((col) => {
    index[col] = header.indexOf(col);
  });

  const rows = [];
  let skipped = 0;

  for (let i = 1; i < lines.length; i += 1) {
    const fields = lines[i].split(',').map((cell) => cell.trim());
    if (fields.length !== header.length) {
      skipped += 1;
      continue;
    }

    const date = fields[index.date];
    const product = fields[index.product];
    const category = fields[index.category];
    const city = fields[index.city];
    const qty = Number(fields[index.qty]);
    const unitPrice = Number(fields[index.unit_price]);

    const isValid =
      DATE_RE.test(date) &&
      product.length > 0 &&
      category.length > 0 &&
      city.length > 0 &&
      Number.isFinite(qty) &&
      qty > 0 &&
      Number.isFinite(unitPrice) &&
      unitPrice > 0;

    if (!isValid) {
      skipped += 1;
      continue;
    }

    rows.push({ date, product, category, qty, unitPrice, city });
  }

  return { rows, skipped, total: lines.length - 1 };
}

function loadDatabase(csvPath, dbPath) {
  const csvText = readCsvFile(csvPath);
  const { rows, skipped, total } = parseCsv(csvText);

  const db = new DatabaseSync(dbPath);
  db.exec('DROP TABLE IF EXISTS sales');
  db.exec(`
    CREATE TABLE sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      product TEXT NOT NULL,
      category TEXT NOT NULL,
      qty INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      city TEXT NOT NULL,
      revenue REAL NOT NULL
    )
  `);

  const insert = db.prepare(
    'INSERT INTO sales (date, product, category, qty, unit_price, city, revenue) VALUES (?, ?, ?, ?, ?, ?, ?)',
  );
  for (const row of rows) {
    insert.run(row.date, row.product, row.category, row.qty, row.unitPrice, row.city, row.qty * row.unitPrice);
  }

  return { db, loadedRows: rows.length, skippedRows: skipped, totalRows: total };
}

module.exports = { loadDatabase, parseCsv };
