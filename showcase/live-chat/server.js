import express from 'express';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { WebSocketServer } from 'ws';
import QRCode from 'qrcode';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const TYPING_TIMEOUT_MS = 4000;
const EMOJI_SET = ['\u{1F44D}', '❤️', '\u{1F602}', '\u{1F389}', '\u{1F44F}'];

// ---------------------------------------------------------------------------
// Database
// ---------------------------------------------------------------------------

const db = new DatabaseSync(path.join(__dirname, 'data.sqlite'));

db.exec(`
  CREATE TABLE IF NOT EXISTS rooms (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    slug       TEXT    NOT NULL UNIQUE,
    name       TEXT    NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS messages (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id    INTEGER NOT NULL REFERENCES rooms(id),
    user_id    TEXT    NOT NULL,
    user_name  TEXT    NOT NULL,
    user_color TEXT    NOT NULL,
    text       TEXT    NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_messages_room ON messages(room_id, id);
  CREATE TABLE IF NOT EXISTS reactions (
    message_id INTEGER NOT NULL REFERENCES messages(id),
    user_id    TEXT    NOT NULL,
    emoji      TEXT    NOT NULL,
    PRIMARY KEY (message_id, user_id, emoji)
  );
`);

function seedIfEmpty() {
  const { count } = db.prepare('SELECT COUNT(*) AS count FROM rooms').get();
  if (count > 0) return;

  const now = Date.now();
  const hourAgo = now - 60 * 60 * 1000;
  const insertRoom = db.prepare(
    'INSERT INTO rooms (slug, name, created_at) VALUES (?, ?, ?)'
  );
  const insertMessage = db.prepare(
    `INSERT INTO messages (room_id, user_id, user_name, user_color, text, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  );

  const botId = 'system-hos-geldin';
  const botName = 'Salon Botu';
  const botColor = '#6C5CE7';

  const genelId = insertRoom.run('genel', 'Genel', now).lastInsertRowid;
  insertMessage.run(genelId, botId, botName, botColor, 'Salon Sohbeti\'ne hoş geldiniz!', hourAgo);
  insertMessage.run(genelId, botId, botName, botColor, 'Burada herkesle sohbet edebilirsiniz.', hourAgo + 5 * 60 * 1000);
  insertMessage.run(genelId, botId, botName, botColor, 'İyi sohbetler dileriz.', hourAgo + 10 * 60 * 1000);

  const sorularId = insertRoom.run('sorular', 'Sorular', now).lastInsertRowid;
  insertMessage.run(sorularId, botId, botName, botColor, 'Sorularınızı buraya yazabilirsiniz.', hourAgo + 2 * 60 * 1000);

  const kahveId = insertRoom.run('kahve', 'Kahve', now).lastInsertRowid;
  insertMessage.run(kahveId, botId, botName, botColor, 'Kahve molası için buradayız.', hourAgo + 3 * 60 * 1000);
}

seedIfEmpty();

// ---------------------------------------------------------------------------
// Data helpers
// ---------------------------------------------------------------------------

const stmt = {
  allRooms: db.prepare('SELECT * FROM rooms ORDER BY id'),
  roomById: db.prepare('SELECT * FROM rooms WHERE id = ?'),
  roomBySlug: db.prepare('SELECT * FROM rooms WHERE slug = ?'),
  insertRoom: db.prepare('INSERT INTO rooms (slug, name, created_at) VALUES (?, ?, ?)'),
  messageCount: db.prepare('SELECT COUNT(*) AS count FROM messages WHERE room_id = ?'),
  totalMessages: db.prepare('SELECT COUNT(*) AS count FROM messages'),
  lastMessages: db.prepare(
    'SELECT * FROM messages WHERE room_id = ? ORDER BY id DESC LIMIT ?'
  ),
  searchMessages: db.prepare(
    'SELECT * FROM messages WHERE room_id = ? AND text LIKE ? ORDER BY id DESC LIMIT 50'
  ),
  insertMessage: db.prepare(
    `INSERT INTO messages (room_id, user_id, user_name, user_color, text, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  ),
  messageById: db.prepare('SELECT * FROM messages WHERE id = ?'),
  reactionsForMessage: db.prepare('SELECT emoji, user_id FROM reactions WHERE message_id = ?'),
  reactionExists: db.prepare(
    'SELECT 1 FROM reactions WHERE message_id = ? AND user_id = ? AND emoji = ?'
  ),
  addReaction: db.prepare('INSERT INTO reactions (message_id, user_id, emoji) VALUES (?, ?, ?)'),
  removeReaction: db.prepare(
    'DELETE FROM reactions WHERE message_id = ? AND user_id = ? AND emoji = ?'
  ),
};

function toRoom(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    createdAt: row.created_at,
    messageCount: stmt.messageCount.get(row.id).count,
  };
}

function reactionsFor(messageId) {
  const rows = stmt.reactionsForMessage.all(messageId);
  const reactions = {};
  for (const row of rows) {
    if (!reactions[row.emoji]) reactions[row.emoji] = [];
    reactions[row.emoji].push(row.user_id);
  }
  return reactions;
}

function toMessage(row) {
  return {
    id: row.id,
    roomId: row.room_id,
    userId: row.user_id,
    userName: row.user_name,
    userColor: row.user_color,
    text: row.text,
    createdAt: row.created_at,
    reactions: reactionsFor(row.id),
  };
}

function slugify(name) {
  const map = { c: 'ç', g: 'ğ', i: 'ı', o: 'ö', s: 'ş', u: 'ü' };
  let slug = name.toLowerCase();
  for (const [ascii, turkish] of Object.entries(map)) {
    slug = slug.split(turkish).join(ascii);
  }
  slug = slug
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || `oda-${Date.now()}`;
}

// Identity fields reach SQLite directly, so only trimmed strings are accepted.
function toIdentity(raw, previous = null) {
  const text = (value, max) =>
    typeof value === 'string' || typeof value === 'number' ? String(value).trim().slice(0, max) : '';
  const id = text(raw?.id, 64) || previous?.id;
  if (!id) return null;
  return {
    id,
    name: text(raw?.name, 40) || previous?.name || 'Misafir',
    color: text(raw?.color, 32) || previous?.color || '#C15F3C',
  };
}

// ---------------------------------------------------------------------------
// LAN discovery and QR
// ---------------------------------------------------------------------------

function findLanIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const info of interfaces[name] ?? []) {
      const isIPv4 = info.family === 'IPv4' || info.family === 4;
      if (isIPv4 && !info.internal) return info.address;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Express app
// ---------------------------------------------------------------------------

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const startedAt = Date.now();

app.get('/api/health', (req, res) => {
  res.json({ ok: true, app: 'salon-sohbeti', uptimeSec: Math.floor((Date.now() - startedAt) / 1000) });
});

app.get('/api/rooms', (req, res) => {
  res.json({ rooms: stmt.allRooms.all().map(toRoom) });
});

app.post('/api/rooms', (req, res) => {
  const name = String(req.body?.name ?? '').trim();
  if (!name || name.length > 40) {
    return res.status(400).json({ error: 'Oda adı boş olamaz ve 40 karakteri geçemez.' });
  }
  const slug = slugify(name);
  if (stmt.roomBySlug.get(slug)) {
    return res.status(400).json({ error: 'Bu isimde bir oda zaten var.' });
  }
  const now = Date.now();
  const roomId = stmt.insertRoom.run(slug, name, now).lastInsertRowid;
  const room = toRoom(stmt.roomById.get(roomId));
  broadcastAll({ type: 'room', room });
  res.status(201).json({ room });
});

app.get('/api/rooms/:id/messages', (req, res) => {
  const roomId = Number(req.params.id);
  if (!stmt.roomById.get(roomId)) {
    return res.status(404).json({ error: 'Oda bulunamadı.' });
  }
  const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
  const rows = stmt.lastMessages.all(roomId, limit).reverse();
  res.json({ roomId, messages: rows.map(toMessage) });
});

app.get('/api/rooms/:id/search', (req, res) => {
  const roomId = Number(req.params.id);
  if (!stmt.roomById.get(roomId)) {
    return res.status(404).json({ error: 'Oda bulunamadı.' });
  }
  const q = String(req.query.q ?? '').trim();
  if (!q) return res.json({ roomId, query: q, hits: [] });
  const rows = stmt.searchMessages.all(roomId, `%${q}%`);
  res.json({ roomId, query: q, hits: rows.map(toMessage) });
});

app.get('/api/join', async (req, res) => {
  const lanIp = findLanIp();
  const localUrl = `http://localhost:${PORT}`;
  const lanUrl = lanIp ? `http://${lanIp}:${PORT}` : localUrl;
  const url = lanUrl;
  try {
    const qr = await QRCode.toDataURL(url, { width: 512, margin: 1 });
    res.json({ localUrl, lanUrl, url, port: PORT, qr });
  } catch (err) {
    res.status(400).json({ error: 'QR kodu oluşturulamadı.' });
  }
});

app.get('/api/stats', (req, res) => {
  const rooms = stmt.allRooms.all().length;
  const messages = stmt.totalMessages.get().count;
  const online = new Set([...clients.values()].filter((c) => c.user).map((c) => c.user.id)).size;
  res.json({ rooms, messages, online });
});

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  res.status(400).json({ error: 'İstek gövdesi okunamadı.' });
});

// ---------------------------------------------------------------------------
// WebSocket hub
// ---------------------------------------------------------------------------

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

// ws -> { user, roomId }, the identity from 'hello' is bound here and never
// re-trusted from later frames.
const clients = new Map();
// `${roomId}:${userId}` -> timeout handle, clears a stale typing indicator.
const typingTimers = new Map();

function send(ws, payload) {
  if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(payload));
}

function broadcastAll(payload) {
  const data = JSON.stringify(payload);
  for (const ws of clients.keys()) {
    if (ws.readyState === ws.OPEN) ws.send(data);
  }
}

function broadcastRoom(roomId, payload) {
  const data = JSON.stringify(payload);
  for (const [ws, info] of clients.entries()) {
    if (info.roomId === roomId && ws.readyState === ws.OPEN) ws.send(data);
  }
}

function onlineInRoom(roomId) {
  const users = new Map();
  for (const info of clients.values()) {
    if (info.roomId === roomId && info.user) users.set(info.user.id, info.user);
  }
  return [...users.values()];
}

function broadcastPresence(roomId) {
  if (roomId == null) return;
  broadcastRoom(roomId, { type: 'presence', roomId, online: onlineInRoom(roomId) });
}

function clearTyping(roomId, userId, userName) {
  const key = `${roomId}:${userId}`;
  const timer = typingTimers.get(key);
  if (timer) {
    clearTimeout(timer);
    typingTimers.delete(key);
  }
  broadcastRoom(roomId, { type: 'typing', roomId, userId, userName, isTyping: false });
}

function toggleReaction(messageId, userId, emoji) {
  if (stmt.reactionExists.get(messageId, userId, emoji)) {
    stmt.removeReaction.run(messageId, userId, emoji);
  } else {
    stmt.addReaction.run(messageId, userId, emoji);
  }
  return reactionsFor(messageId);
}

wss.on('connection', (ws) => {
  clients.set(ws, { user: null, roomId: null });

  ws.on('message', (raw) => {
    let frame;
    try {
      frame = JSON.parse(raw.toString());
    } catch {
      return; // malformed frames are ignored, never fatal
    }
    try {
      handleFrame(ws, frame);
    } catch (err) {
      console.error('frame failed:', err?.message ?? err);
      send(ws, { type: 'error', message: 'İstek işlenemedi.' });
    }
  });

  ws.on('close', () => {
    const info = clients.get(ws);
    clients.delete(ws);
    if (info?.user && info.roomId != null) {
      clearTyping(info.roomId, info.user.id, info.user.name);
      broadcastPresence(info.roomId);
    }
  });
});

function handleFrame(ws, frame) {
  const info = clients.get(ws);
  if (!info) return;

  switch (frame.type) {
    case 'hello': {
      const user = toIdentity(frame.user);
      if (!user) {
        return send(ws, { type: 'error', message: 'Geçersiz giriş bilgisi.' });
      }
      const requestedRoomId = Number(frame.roomId);
      const room = stmt.roomById.get(requestedRoomId) ?? stmt.allRooms.all()[0];
      if (!room) {
        return send(ws, { type: 'error', message: 'Geçersiz giriş bilgisi.' });
      }
      const roomId = room.id;
      info.user = user;
      info.roomId = roomId;
      const rows = stmt.lastMessages.all(roomId, 50).reverse();
      send(ws, {
        type: 'welcome',
        user: info.user,
        roomId,
        rooms: stmt.allRooms.all().map(toRoom),
        messages: rows.map(toMessage),
        online: onlineInRoom(roomId),
      });
      broadcastPresence(roomId);
      break;
    }

    case 'switch': {
      if (!info.user) return;
      const newRoomId = Number(frame.roomId);
      const room = stmt.roomById.get(newRoomId);
      if (!room) return send(ws, { type: 'error', message: 'Oda bulunamadı.' });
      const oldRoomId = info.roomId;
      clearTyping(oldRoomId, info.user.id, info.user.name);
      info.roomId = newRoomId;
      const rows = stmt.lastMessages.all(newRoomId, 50).reverse();
      send(ws, {
        type: 'history',
        roomId: newRoomId,
        messages: rows.map(toMessage),
        online: onlineInRoom(newRoomId),
      });
      broadcastPresence(oldRoomId);
      broadcastPresence(newRoomId);
      break;
    }

    case 'message': {
      if (!info.user || info.roomId == null) return;
      const text = String(frame.text ?? '').trim().slice(0, 1000);
      if (!text) return;
      const now = Date.now();
      const id = stmt.insertMessage.run(
        info.roomId, info.user.id, info.user.name, info.user.color, text, now
      ).lastInsertRowid;
      const message = toMessage(stmt.messageById.get(id));
      broadcastAll({ type: 'message', message });
      break;
    }

    case 'typing': {
      if (!info.user || info.roomId == null) return;
      const key = `${info.roomId}:${info.user.id}`;
      const existing = typingTimers.get(key);
      if (existing) clearTimeout(existing);

      if (frame.isTyping) {
        const timer = setTimeout(() => clearTyping(info.roomId, info.user.id, info.user.name), TYPING_TIMEOUT_MS);
        typingTimers.set(key, timer);
        broadcastRoom(info.roomId, {
          type: 'typing', roomId: info.roomId, userId: info.user.id, userName: info.user.name, isTyping: true,
        });
      } else {
        typingTimers.delete(key);
        broadcastRoom(info.roomId, {
          type: 'typing', roomId: info.roomId, userId: info.user.id, userName: info.user.name, isTyping: false,
        });
      }
      break;
    }

    case 'react': {
      if (!info.user) return;
      const messageId = Number(frame.messageId);
      const emoji = String(frame.emoji ?? '');
      const messageRow = stmt.messageById.get(messageId);
      if (!messageRow || !EMOJI_SET.includes(emoji)) {
        return send(ws, { type: 'error', message: 'Geçersiz tepki.' });
      }
      const reactions = toggleReaction(messageId, info.user.id, emoji);
      broadcastAll({ type: 'reaction', messageId, roomId: messageRow.room_id, reactions });
      break;
    }

    case 'profile': {
      if (!info.user) return;
      info.user = toIdentity(
        { id: info.user.id, name: frame.user?.name, color: frame.user?.color },
        info.user
      );
      broadcastPresence(info.roomId);
      break;
    }

    case 'ping': {
      send(ws, { type: 'pong' });
      break;
    }

    default:
      // unknown frame types are ignored, never fatal
      break;
  }
}

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------

server.listen(PORT, '0.0.0.0', () => {
  const lanIp = findLanIp();
  console.log('Salon Sohbeti çalışıyor.');
  console.log(`  Bu bilgisayar : http://localhost:${PORT}`);
  console.log(`  Aynı wifi     : http://${lanIp ?? 'localhost'}:${PORT}`);
});
