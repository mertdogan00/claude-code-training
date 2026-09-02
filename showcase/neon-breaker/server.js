import express from 'express';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { networkInterfaces } from 'node:os';

const PORT = Number(process.env.PORT) || 3000;
const ROOT = import.meta.dirname;
const DB_PATH = path.join(ROOT, 'data.sqlite');
const PUBLIC_DIR = path.join(ROOT, 'public');

const db = new DatabaseSync(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    score INTEGER NOT NULL,
    level INTEGER NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_scores_score ON scores (score DESC);
`);

seedIfEmpty();

function seedIfEmpty() {
  const row = db.prepare('SELECT COUNT(*) AS n FROM scores').get();
  if (row.n > 0) return;

  const seedNames = [
    'Deniz', 'Ada', 'Efe_34', 'Zeynep', 'Kerem-YT', 'Elif', 'Mert99', 'Aslı', 'Burak', 'Ceren'
  ];
  const seedScores = [900, 1450, 2100, 2800, 3600, 4300, 5100, 6000, 7200, 8200];
  const seedLevels = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5];

  const insert = db.prepare(
    'INSERT INTO scores (name, score, level, created_at) VALUES (?, ?, ?, ?)'
  );
  const now = Date.now();
  const twoWeeksMs = 14 * 24 * 60 * 60 * 1000;

  for (let i = 0; i < seedNames.length; i++) {
    const spread = (i / (seedNames.length - 1)) * twoWeeksMs;
    const createdAt = new Date(now - twoWeeksMs + spread).toISOString();
    insert.run(seedNames[i], seedScores[i], seedLevels[i], createdAt);
  }
}

const LEVELS = [
  {
    id: 1,
    name: 'Başlangıç',
    speed: 1.0,
    rows: 6,
    cols: 10,
    palette: { bg: '#070713', accent: '#00f0ff', bricks: ['#00f0ff', '#33f7ff', '#66faff'] },
    grid: Array.from({ length: 6 }, () => Array(10).fill(1)),
  },
  {
    id: 2,
    name: 'Kafes',
    speed: 1.1,
    rows: 6,
    cols: 10,
    palette: { bg: '#0a0716', accent: '#ff2ea6', bricks: ['#ff2ea6', '#ff6bc7', '#c026a3'] },
    grid: [
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
      [0, 2, 0, 1, 0, 1, 0, 2, 0, 1],
      [1, 0, 1, 0, 2, 0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0, 1, 0, 1, 0, 2],
      [1, 0, 2, 0, 1, 0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0, 2, 0, 1, 0, 1],
    ],
  },
  {
    id: 3,
    name: 'Kule',
    speed: 1.2,
    rows: 6,
    cols: 10,
    palette: { bg: '#08091a', accent: '#7c5cff', bricks: ['#7c5cff', '#a48bff', '#5a3cff'] },
    grid: [
      [3, 2, 2, 3, 2, 2, 3, 2, 2, 3],
      [3, 1, 1, 3, 1, 1, 3, 1, 1, 3],
      [3, 1, 1, 3, 1, 1, 3, 1, 1, 3],
      [3, 1, 1, 3, 1, 1, 3, 1, 1, 3],
      [3, 1, 1, 3, 1, 1, 3, 1, 1, 3],
      [3, 1, 1, 3, 1, 1, 3, 1, 1, 3],
    ],
  },
  {
    id: 4,
    name: 'Kalkan',
    speed: 1.32,
    rows: 6,
    cols: 10,
    palette: { bg: '#071409', accent: '#aaff00', bricks: ['#aaff00', '#d4ff66', '#7fbf00'] },
    grid: [
      [3, 2, 2, 2, 2, 2, 2, 2, 2, 3],
      [2, 1, 1, 1, 1, 1, 1, 1, 1, 2],
      [2, 1, 1, 1, 1, 1, 1, 1, 1, 2],
      [2, 1, 1, 1, 1, 1, 1, 1, 1, 2],
      [2, 1, 1, 1, 1, 1, 1, 1, 1, 2],
      [3, 2, 2, 2, 2, 2, 2, 2, 2, 3],
    ],
  },
  {
    id: 5,
    name: 'Çekirdek',
    speed: 1.45,
    rows: 7,
    cols: 11,
    palette: { bg: '#140a06', accent: '#ffb020', bricks: ['#ffb020', '#ffd280', '#e08c00'] },
    grid: [
      [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
      [3, 0, 0, 0, 2, 2, 2, 0, 0, 0, 3],
      [3, 0, 0, 2, 2, 1, 2, 2, 0, 0, 3],
      [3, 0, 2, 2, 1, 1, 1, 2, 2, 0, 3],
      [3, 0, 0, 2, 2, 1, 2, 2, 0, 0, 3],
      [3, 0, 0, 0, 2, 2, 2, 0, 0, 0, 3],
      [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    ],
  },
];

const ACHIEVEMENTS = [
  { id: 'ilk-bolum', title: 'İlk Bölüm', description: 'Bir bölümü tamamla.' },
  { id: 'kayipsiz', title: 'Kayıpsız', description: 'Bir bölümü can kaybetmeden tamamla.' },
  { id: 'kombo-10', title: 'Kombo 10', description: 'Tek seferde 10 vuruşluk kombo yap.' },
  { id: 'guc-toplayici', title: 'Güç Toplayıcı', description: 'Bir turda dört farklı güçlendirme türünü topla.' },
  { id: 'bes-bin', title: 'Beş Bin', description: 'Tek turda 5000 puan topla.' },
];

const NAME_PATTERN = /^[a-zA-Z0-9 _\-çÇğĞıİiöÖşŞüÜ]+$/u;

function validateScoreBody(body) {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return { error: 'Geçersiz istek gövdesi.' };
  }

  const { name, score, level } = body;

  if (typeof name !== 'string') {
    return { error: 'İsim metin olmalı.' };
  }
  const trimmedName = name.trim();
  if (trimmedName.length < 1 || trimmedName.length > 12) {
    return { error: 'İsim 1 ile 12 karakter arasında olmalı.' };
  }
  if (!NAME_PATTERN.test(trimmedName)) {
    return { error: 'İsim yalnızca harf, rakam, boşluk, alt çizgi ve tire içerebilir.' };
  }

  if (typeof score !== 'number' || !Number.isInteger(score) || score < 0 || score > 999999) {
    return { error: 'Skor 0 ile 999999 arasında bir tam sayı olmalı.' };
  }

  if (typeof level !== 'number' || !Number.isInteger(level) || level < 1 || level > 5) {
    return { error: 'Bölüm 1 ile 5 arasında bir tam sayı olmalı.' };
  }

  return { value: { name: trimmedName, score, level } };
}

function getLocalUrl() {
  return `http://localhost:${PORT}`;
}

function getLanUrl() {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] ?? []) {
      if (net.family === 'IPv4' && !net.internal) {
        return `http://${net.address}:${PORT}`;
      }
    }
  }
  return null;
}

const app = express();
app.use(express.json({ limit: '16kb' }));
app.use(express.static(PUBLIC_DIR));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, product: 'Neon Breaker', levels: LEVELS.length });
});

app.get('/api/levels', (req, res) => {
  res.json({ levels: LEVELS });
});

app.get('/api/achievements', (req, res) => {
  res.json({ achievements: ACHIEVEMENTS });
});

app.get('/api/scores', (req, res) => {
  const raw = req.query.limit;
  let limit = 10;

  if (raw !== undefined) {
    if (!/^\d+$/.test(String(raw))) {
      return res.status(400).json({ ok: false, error: 'Limit 1 ile 50 arasında bir sayı olmalı.' });
    }
    limit = Number(raw);
    if (limit < 1 || limit > 50) {
      return res.status(400).json({ ok: false, error: 'Limit 1 ile 50 arasında bir sayı olmalı.' });
    }
  }

  const rows = db
    .prepare('SELECT id, name, score, level, created_at FROM scores ORDER BY score DESC, created_at ASC LIMIT ?')
    .all(limit);

  res.json({ scores: rows });
});

app.post('/api/scores', (req, res) => {
  const result = validateScoreBody(req.body);
  if (result.error) {
    return res.status(400).json({ ok: false, error: result.error });
  }

  const { name, score, level } = result.value;
  const createdAt = new Date().toISOString();

  const insert = db.prepare('INSERT INTO scores (name, score, level, created_at) VALUES (?, ?, ?, ?)');
  const info = insert.run(name, score, level, createdAt);
  const id = Number(info.lastInsertRowid);

  const rankRow = db
    .prepare('SELECT COUNT(*) AS n FROM scores WHERE score > ? OR (score = ? AND created_at < ?)')
    .get(score, score, createdAt);
  const rank = rankRow.n + 1;

  const top = db
    .prepare('SELECT id, name, score, level, created_at FROM scores ORDER BY score DESC, created_at ASC LIMIT 10')
    .all();

  res.status(201).json({ ok: true, id, rank, scores: top });
});

app.use('/api', (req, res) => {
  res.status(404).json({ ok: false, error: 'Bulunamadı.' });
});

app.use((err, req, res, next) => {
  if (err && (err.type === 'entity.too.large' || err.type === 'entity.parse.failed')) {
    return res.status(400).json({ ok: false, error: 'Geçersiz istek gövdesi.' });
  }
  res.status(500).json({ ok: false, error: 'Sunucu hatası.' });
});

app.listen(PORT, '0.0.0.0', () => {
  const lan = getLanUrl();
  const lanPart = lan ? `, LAN: ${lan}` : '';
  console.log(`Neon Breaker running at ${getLocalUrl()}${lanPart}`);
});
