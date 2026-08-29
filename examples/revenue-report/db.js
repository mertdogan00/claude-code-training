// SQLite via Node's built-in driver: no npm install, no native build.
import { DatabaseSync } from 'node:sqlite';

export const db = new DatabaseSync(new URL('./data.db', import.meta.url).pathname);

db.exec(`
  CREATE TABLE IF NOT EXISTS revenue (
    day   TEXT PRIMARY KEY,   -- Mon..Sun
    total REAL NOT NULL
  )
`);

const seeded = db.prepare('SELECT COUNT(*) AS n FROM revenue').get();
if (seeded.n === 0) {
  const ins = db.prepare('INSERT INTO revenue (day, total) VALUES (?, ?)');
  for (const [day, total] of [
    ['Pzt', 4200], ['Sal', 3850], ['Çar', 5100], ['Per', 4600],
    ['Cum', 7300], ['Cmt', 8900], ['Paz', 6100],
  ]) ins.run(day, total);
}

export function week() {
  return db.prepare('SELECT day, total FROM revenue').all();
}

export function setDay(day, total) {
  db.prepare('INSERT INTO revenue (day, total) VALUES (?, ?) ON CONFLICT(day) DO UPDATE SET total = excluded.total')
    .run(day, total);
}
