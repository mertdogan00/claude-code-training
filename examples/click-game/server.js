// Reflex game backend: serves the game + keeps the top-5 scoreboard in SQLite.
// Run: npm run dev  ->  http://localhost:3001
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync(new URL('./scores.db', import.meta.url).pathname);
db.exec('CREATE TABLE IF NOT EXISTS scores (name TEXT, score INTEGER, at TEXT)');

const top5 = db.prepare('SELECT name, score FROM scores ORDER BY score DESC, at ASC LIMIT 5');
const insert = db.prepare("INSERT INTO scores VALUES (?, ?, datetime('now'))");

const PUBLIC = new URL('./public/', import.meta.url);
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript' };

createServer(async (req, res) => {
  if (req.url === '/api/scores') {
    return res.writeHead(200, { 'content-type': 'application/json' })
              .end(JSON.stringify(top5.all()));
  }
  if (req.url === '/api/score' && req.method === 'POST') {
    let body = '';
    for await (const c of req) body += c;
    const { name, score } = JSON.parse(body);
    insert.run(String(name).slice(0, 12) || 'anon', Number(score) | 0);
    return res.writeHead(200, { 'content-type': 'application/json' })
              .end(JSON.stringify(top5.all()));
  }
  const path = req.url === '/' ? 'index.html' : req.url.slice(1);
  try {
    const ext = path.slice(path.lastIndexOf('.'));
    const file = await readFile(new URL(path, PUBLIC));
    res.writeHead(200, { 'content-type': MIME[ext] ?? 'text/plain' }).end(file);
  } catch {
    res.writeHead(404).end('yok');
  }
}).listen(3001, () => console.log('oyun hazır → http://localhost:3001'));
