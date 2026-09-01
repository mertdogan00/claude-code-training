import express from 'express';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const PUBLIC_DIR = path.join(import.meta.dirname, 'public');
const DB_PATH = path.join(import.meta.dirname, 'data.sqlite');

// --- Level definitions -----------------------------------------------------
// grid legend: '.' empty, 'n' normal (one hit), 't' two-hit, 'x' unbreakable

const LEVELS = [
  {
    index: 1,
    name: 'Başlangıç',
    palette: {
      bg: '#070312',
      grid: '#1b1140',
      brick: ['#ff2d95', '#00e6ff', '#7cff5a', '#ffd23f'],
      accent: '#00e6ff',
    },
    ballSpeed: 4.6,
    paddleWidth: 130,
    rows: 6,
    cols: 11,
    grid: [
      '...........',
      '..nnnnnnn..',
      '..nnnnnnn..',
      '..nnnnnnn..',
      '...........',
      '...........',
    ],
  },
  {
    index: 2,
    name: 'Piramit',
    palette: {
      bg: '#040616',
      grid: '#131c44',
      brick: ['#00e6ff', '#7cff5a', '#ffd23f', '#ff5da2'],
      accent: '#7cff5a',
    },
    ballSpeed: 5.2,
    paddleWidth: 120,
    rows: 6,
    cols: 11,
    grid: [
      '.....n.....',
      '....ntn....',
      '...nnnnn...',
      '..nntnntn..',
      '.nnnnnnnnn.',
      '...........',
    ],
  },
  {
    index: 3,
    name: 'Kale',
    palette: {
      bg: '#0a0510',
      grid: '#241237',
      brick: ['#ffd23f', '#ff2d95', '#00e6ff', '#a06bff'],
      accent: '#ffd23f',
    },
    ballSpeed: 5.8,
    paddleWidth: 112,
    rows: 6,
    cols: 11,
    grid: [
      '..nnnnnnn..',
      '..x.....x..',
      '..xnnnnnx..',
      '..xnnnnnx..',
      '..x.....x..',
      '..nnnnnnn..',
    ],
  },
  {
    index: 4,
    name: 'Kalp Atışı',
    palette: {
      bg: '#100309',
      grid: '#3a0f24',
      brick: ['#ff2d95', '#ff5da2', '#ffd23f', '#00e6ff'],
      accent: '#ff2d95',
    },
    ballSpeed: 6.4,
    paddleWidth: 104,
    rows: 6,
    cols: 11,
    grid: [
      '..t.....t..',
      '.ttt...ttt.',
      'ttttt.ttttt',
      '..t.t.t.t..',
      '...ttttt...',
      '....ttt....',
    ],
  },
  {
    index: 5,
    name: 'Son Kale',
    palette: {
      bg: '#020308',
      grid: '#161027',
      brick: ['#00e6ff', '#ff2d95', '#7cff5a', '#ffd23f'],
      accent: '#a06bff',
    },
    ballSpeed: 7.0,
    paddleWidth: 96,
    rows: 6,
    cols: 11,
    grid: [
      'xxxxxxxxxxx',
      'x.ttttttt.x',
      'x.tnnnnnt.x',
      'x.tnxxxnt.x',
      'x.tnnnnnt.x',
      'x.ttttttt.x',
    ],
  },
];

// Boot-time assertion so a malformed grid can never ship.
function assertLevelsValid(levels) {
  for (const level of levels) {
    if (level.grid.length !== level.rows) {
      throw new Error(`Level ${level.index}: expected ${level.rows} rows, got ${level.grid.length}`);
    }
    let breakable = 0;
    for (const row of level.grid) {
      if (row.length !== level.cols) {
        throw new Error(`Level ${level.index}: row length ${row.length} !== cols ${level.cols}`);
      }
      for (const ch of row) {
        if (!'.ntx'.includes(ch)) {
          throw new Error(`Level ${level.index}: illegal character '${ch}' in grid`);
        }
        if (ch === 'n' || ch === 't') breakable++;
      }
    }
    if (breakable < 20) {
      throw new Error(`Level ${level.index}: only ${breakable} breakable bricks, need at least 20`);
    }
  }
}

assertLevelsValid(LEVELS);

// --- Database ---------------------------------------------------------------

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

const countStmt = db.prepare('SELECT COUNT(*) AS n FROM scores');
const insertStmt = db.prepare(
  'INSERT INTO scores (name, score, level, created_at) VALUES (?, ?, ?, ?)'
);
const listStmt = db.prepare(
  'SELECT id, name, score, level, created_at FROM scores ORDER BY score DESC, created_at ASC LIMIT ?'
);
const rankStmt = db.prepare(
  `SELECT COUNT(*) AS n FROM scores
   WHERE score > ? OR (score = ? AND created_at < ?)`
);
const getByIdStmt = db.prepare(
  'SELECT id, name, score, level, created_at FROM scores WHERE id = ?'
);

function seedIfEmpty() {
  const { n } = countStmt.get();
  if (n > 0) return;

  const names = [
    'MERT', 'ZEYNEP', 'CAN', 'ELİF', 'BURAK', 'AYŞE',
    'KEREM', 'DENİZ', 'SELİN', 'ONUR', 'İREM', 'BARIŞ',
  ];
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  for (let i = 0; i < names.length; i++) {
    const score = 1200 + Math.round(Math.random() * 12800);
    const level = 1 + (i % 5);
    const daysAgo = Math.round(Math.random() * 28);
    const createdAt = new Date(now - daysAgo * dayMs - i * 1000).toISOString();
    insertStmt.run(names[i], score, level, createdAt);
  }
}

seedIfEmpty();

// --- Validation --------------------------------------------------------------

function sanitizeName(raw) {
  return raw
    .replace(/[\x00-\x1f\x7f]/g, '')
    .replace(/[<>&"']/g, '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleUpperCase('tr-TR');
}

function validateRoundResult(body) {
  if (body === null || typeof body !== 'object') {
    return { error: 'Geçersiz istek gövdesi.' };
  }

  const { name, score, level } = body;

  if (typeof name !== 'string') {
    return { error: 'İsim metin olmalı.' };
  }
  const cleanName = sanitizeName(name);
  if (cleanName.length < 1 || cleanName.length > 12) {
    return { error: 'İsim 1 ile 12 karakter arasında olmalı.' };
  }

  if (typeof score !== 'number' || !Number.isFinite(score) || !Number.isInteger(score)) {
    return { error: 'Skor tam sayı olmalı.' };
  }
  if (score < 0) {
    return { error: 'Skor negatif olamaz.' };
  }
  if (score > 10000000) {
    return { error: 'Skor çok yüksek, geçerli değil.' };
  }

  let lvl = level;
  if (lvl === undefined || lvl === null) {
    lvl = 1;
  }
  if (typeof lvl !== 'number' || !Number.isInteger(lvl) || lvl < 1 || lvl > 5) {
    return { error: 'Seviye 1 ile 5 arasında olmalı.' };
  }

  return { value: { name: cleanName, score, level: lvl } };
}

// --- App ----------------------------------------------------------------------

const app = express();

app.use(express.json({ limit: '4kb' }));

app.get('/api/health', (req, res) => {
  const { n } = countStmt.get();
  res.json({ ok: true, name: 'Neon Breaker', levels: LEVELS.length, scores: n });
});

app.get('/api/levels', (req, res) => {
  res.json({ ok: true, levels: LEVELS });
});

app.get('/api/scores', (req, res) => {
  let limit = Number.parseInt(req.query.limit, 10);
  if (!Number.isFinite(limit)) limit = 10;
  limit = Math.min(50, Math.max(1, limit));
  const scores = listStmt.all(limit);
  res.json({ ok: true, scores });
});

app.post('/api/scores', (req, res) => {
  const result = validateRoundResult(req.body);
  if (result.error) {
    return res.status(400).json({ ok: false, error: result.error });
  }

  const { name, score, level } = result.value;
  const createdAt = new Date().toISOString();
  const info = insertStmt.run(name, score, level, createdAt);
  const entry = getByIdStmt.get(info.lastInsertRowid);
  const { n: rank } = rankStmt.get(entry.score, entry.score, entry.created_at);
  const top = listStmt.all(10);

  res.status(201).json({ ok: true, entry, rank: rank + 1, top });
});

app.use('/api', (req, res) => {
  res.status(404).json({ ok: false, error: 'Bilinmeyen API rotası.' });
});

app.use(express.static(PUBLIC_DIR, { index: 'index.html' }));

// Error handler: bad/oversized JSON body and anything else becomes JSON, never an HTML trace.
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.too.large') {
    return res.status(400).json({ ok: false, error: 'İstek gövdesi çok büyük.' });
  }
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ ok: false, error: 'Geçersiz JSON gövdesi.' });
  }
  console.error(err);
  res.status(500).json({ ok: false, error: 'Sunucu hatası oluştu.' });
});

const PORT = Number(process.env.PORT) || 3000;

const server = app.listen(PORT, () => {
  console.log(`Neon Breaker listening on http://localhost:${PORT}`);
});

function shutdown() {
  server.close(() => {
    db.close();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
