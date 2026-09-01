const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const db = require('./lib/db');

// To change the panel password, edit this constant. It is the only place it lives.
const ADMIN_PASSWORD = 'kahve123';

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const SESSION_COOKIE = 'qr_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 8;

const sessions = new Map();

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8'
};

function createSession() {
  const token = crypto.randomBytes(24).toString('hex');
  sessions.set(token, Date.now() + SESSION_TTL_MS);
  return token;
}

function isSessionValid(token) {
  if (!token || !sessions.has(token)) return false;
  const expiresAt = sessions.get(token);
  if (Date.now() > expiresAt) {
    sessions.delete(token);
    return false;
  }
  return true;
}

function parseCookies(req) {
  const header = req.headers.cookie;
  const cookies = {};
  if (!header) return cookies;
  for (const part of header.split(';')) {
    const index = part.indexOf('=');
    if (index === -1) continue;
    cookies[part.slice(0, index).trim()] = decodeURIComponent(part.slice(index + 1).trim());
  }
  return cookies;
}

function isAuthenticated(req) {
  const cookies = parseCookies(req);
  return isSessionValid(cookies[SESSION_COOKIE]);
}

function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(body);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > 1_000_000) {
        reject(new Error('Payload too large'));
        req.destroy();
        return;
      }
      raw += chunk;
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function serveStatic(res, filePath) {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(content);
  });
}

function validateProductInput(body, { partial = false } = {}) {
  const errors = [];
  const result = {};

  if (!partial || body.name !== undefined) {
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name) errors.push('Ürün adı zorunludur.');
    result.name = name;
  }

  if (!partial || body.description !== undefined) {
    result.description = typeof body.description === 'string' ? body.description.trim() : '';
  }

  if (!partial || body.price !== undefined) {
    const price = Number(body.price);
    if (!Number.isFinite(price) || price <= 0) errors.push('Fiyat pozitif bir sayı olmalıdır.');
    result.price = price;
  }

  if (!partial || body.categoryId !== undefined) {
    const categoryId = Number(body.categoryId);
    if (!Number.isInteger(categoryId) || !db.categoryExists(categoryId)) {
      errors.push('Geçerli bir kategori seçilmelidir.');
    }
    result.categoryId = categoryId;
  }

  if (body.soldOut !== undefined) result.soldOut = Boolean(body.soldOut);

  return { errors, result };
}

async function handleApi(req, res, pathname) {
  if (pathname === '/api/session' && req.method === 'GET') {
    return sendJson(res, 200, { authenticated: isAuthenticated(req) });
  }

  if (pathname === '/api/login' && req.method === 'POST') {
    const body = await readJsonBody(req);
    if (body.password !== ADMIN_PASSWORD) {
      return sendJson(res, 401, { error: 'Şifre hatalı.' });
    }
    const token = createSession();
    res.setHeader(
      'Set-Cookie',
      `${SESSION_COOKIE}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${SESSION_TTL_MS / 1000}`
    );
    return sendJson(res, 200, { authenticated: true });
  }

  if (pathname === '/api/logout' && req.method === 'POST') {
    const cookies = parseCookies(req);
    sessions.delete(cookies[SESSION_COOKIE]);
    res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; HttpOnly; Path=/; Max-Age=0`);
    return sendJson(res, 200, { authenticated: false });
  }

  if (pathname === '/api/categories' && req.method === 'GET') {
    return sendJson(res, 200, db.listCategories());
  }

  if (pathname === '/api/categories' && req.method === 'POST') {
    if (!isAuthenticated(req)) return sendJson(res, 401, { error: 'Oturum gerekli.' });
    const body = await readJsonBody(req);
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name) return sendJson(res, 400, { error: 'Kategori adı zorunludur.' });
    return sendJson(res, 201, db.addCategory(name));
  }

  if (pathname === '/api/products' && req.method === 'GET') {
    return sendJson(res, 200, db.listProducts());
  }

  if (pathname === '/api/products' && req.method === 'POST') {
    if (!isAuthenticated(req)) return sendJson(res, 401, { error: 'Oturum gerekli.' });
    const body = await readJsonBody(req);
    const { errors, result } = validateProductInput(body);
    if (errors.length) return sendJson(res, 400, { error: errors.join(' ') });
    return sendJson(res, 201, db.addProduct(result));
  }

  const productMatch = pathname.match(/^\/api\/products\/(\d+)$/);
  if (productMatch && (req.method === 'PUT' || req.method === 'DELETE')) {
    if (!isAuthenticated(req)) return sendJson(res, 401, { error: 'Oturum gerekli.' });
    const id = Number(productMatch[1]);
    const existing = db.getProduct(id);
    if (!existing) return sendJson(res, 404, { error: 'Ürün bulunamadı.' });

    if (req.method === 'DELETE') {
      db.deleteProduct(id);
      return sendJson(res, 200, { deleted: true });
    }

    const body = await readJsonBody(req);
    const { errors, result } = validateProductInput(body, { partial: true });
    if (errors.length) return sendJson(res, 400, { error: errors.join(' ') });
    const merged = {
      name: result.name ?? existing.name,
      description: result.description ?? existing.description,
      price: result.price ?? existing.price,
      categoryId: result.categoryId ?? existing.category_id,
      soldOut: result.soldOut ?? Boolean(existing.sold_out)
    };
    return sendJson(res, 200, db.updateProduct(id, merged));
  }

  sendJson(res, 404, { error: 'Not found' });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  try {
    if (pathname.startsWith('/api/')) {
      await handleApi(req, res, pathname);
      return;
    }

    if (pathname === '/' || pathname === '/index.html') {
      return serveStatic(res, path.join(PUBLIC_DIR, 'index.html'));
    }

    if (pathname === '/panel' || pathname === '/panel/') {
      return serveStatic(res, path.join(PUBLIC_DIR, 'panel', 'index.html'));
    }

    const requested = path.normalize(path.join(PUBLIC_DIR, pathname));
    if (!requested.startsWith(PUBLIC_DIR)) {
      res.writeHead(403);
      return res.end('Forbidden');
    }
    return serveStatic(res, requested);
  } catch (err) {
    sendJson(res, 500, { error: err.message || 'Sunucu hatası' });
  }
});

server.listen(PORT, () => {
  console.log(`QR Menü listening on http://localhost:${PORT}`);
});
