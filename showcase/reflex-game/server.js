import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const PORT = 3001;
const PUBLIC_DIR = join(import.meta.dirname, 'public');
const DB_PATH = join(import.meta.dirname, 'scores.sqlite');
const MAX_BODY_BYTES = 10_000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
};

const db = new DatabaseSync(DB_PATH);
db.exec(`
  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    score INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

const selectTopScores = db.prepare(
  'SELECT id, name, score FROM scores ORDER BY score DESC, created_at ASC LIMIT 5',
);
const insertScore = db.prepare('INSERT INTO scores (name, score) VALUES (?, ?)');

// Empty name becomes "anon"; anything longer than 12 chars is trimmed.
function sanitizeName(rawName) {
  const trimmed = typeof rawName === 'string' ? rawName.trim().slice(0, 12) : '';
  return trimmed.length > 0 ? trimmed : 'anon';
}

function isValidScore(score) {
  return Number.isInteger(score) && score >= 0;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error('payload too large'));
        req.destroy();
        return;
      }
      body += chunk;
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

async function handleGetScores(res) {
  sendJson(res, 200, selectTopScores.all());
}

async function handlePostScore(req, res) {
  let payload;
  try {
    payload = JSON.parse(await readBody(req));
  } catch {
    sendJson(res, 400, { error: 'Gecersiz istek govdesi.' });
    return;
  }

  if (!isValidScore(payload.score)) {
    sendJson(res, 400, { error: 'Skor, negatif olmayan bir tam sayi olmalidir.' });
    return;
  }

  const name = sanitizeName(payload.name);
  const info = insertScore.run(name, payload.score);
  sendJson(res, 201, { id: Number(info.lastInsertRowid), name, score: payload.score });
}

async function serveStatic(req, res) {
  const urlPath = req.url === '/' ? '/index.html' : req.url;
  const safePath = normalize(urlPath).replace(/^(\.\.[/\\])+/, '');
  const filePath = join(PUBLIC_DIR, safePath);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  try {
    const data = await readFile(filePath);
    const type = MIME_TYPES[extname(filePath)] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type }).end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Bulunamadi.');
  }
}

const server = createServer(async (req, res) => {
  try {
    if (req.url === '/api/scores' && req.method === 'GET') {
      await handleGetScores(res);
      return;
    }
    if (req.url === '/api/scores' && req.method === 'POST') {
      await handlePostScore(req, res);
      return;
    }
    if (req.method === 'GET') {
      await serveStatic(req, res);
      return;
    }
    res.writeHead(404).end();
  } catch (err) {
    sendJson(res, 500, { error: 'Sunucu hatasi.' });
  }
});

server.listen(PORT, () => {
  console.log(`Refleks sunucusu calisiyor: http://localhost:${PORT}`);
});
