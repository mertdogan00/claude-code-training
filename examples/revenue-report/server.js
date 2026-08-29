// Tiny modular backend on Node built-ins only. Run: npm run dev  ->  http://localhost:3000
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { week, setDay } from './db.js';

const PUBLIC = new URL('./public/', import.meta.url);
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript' };

createServer(async (req, res) => {
  if (req.url === '/api/week') {
    return res.writeHead(200, { 'content-type': 'application/json' })
              .end(JSON.stringify(week()));
  }
  if (req.url === '/api/day' && req.method === 'POST') {
    let body = '';
    for await (const chunk of req) body += chunk;
    const { day, total } = JSON.parse(body);
    setDay(day, Number(total));
    return res.writeHead(200, { 'content-type': 'application/json' }).end('{"ok":true}');
  }
  const path = req.url === '/' ? 'index.html' : req.url.slice(1);
  try {
    const ext = path.slice(path.lastIndexOf('.'));
    const file = await readFile(new URL(path, PUBLIC));
    res.writeHead(200, { 'content-type': MIME[ext] ?? 'text/plain' }).end(file);
  } catch {
    res.writeHead(404).end('yok');
  }
}).listen(3000, () => console.log('hazır → http://localhost:3000'));
