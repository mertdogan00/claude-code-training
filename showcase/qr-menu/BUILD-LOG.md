# BUILD-LOG: QR Menü

How this folder came to exist. One mega prompt
([`prompts/apps/qr-menu.md`](../../prompts/apps/qr-menu.md)) went into a fresh Claude Code
session. That session acted as the ORCHESTRATOR: it printed a plan, published a contract,
formed a real team of sub agents with the Agent tool, integrated their work, and let QA try to
break the result. Nobody typed a second instruction.

## 1. The plan the orchestrator printed

1. Publish the contract (file list, port, routes, JSON shapes, DB schema, tag vocabulary, seed
   data) before anyone writes a line.
2. Spawn the Backend Lead and the Frontend Lead in parallel, both building against that
   contract and nothing else.
3. Backend Lead: `package.json` plus `npm install` first, then `server.js`, the schema, the
   seed, the public and admin routes, the signed session cookie and the QR generation.
4. Frontend Lead: `public/`, both faces, the phone first customer menu and the admin panel,
   plus the shared stylesheet.
5. QA Lead once both land: run the server, turn the six acceptance items into real checks,
   report pass or fail per item, fix what fails.
6. Orchestrator review: an independent curl pass over every route plus 1440x900 and 390x844
   frames read back with a headless browser.
7. Fix wave: workers repair what the review caught, each on its own port so nothing collides.
8. Clean check: wipe `node_modules`, `npm install`, `node server.js`, prove HTTP 200 and a JSON
   route, then kill the server and free the port.

## 2. The team

| Role | Model | Effort | Owned |
|---|---|---|---|
| Orchestrator | Claude Opus 5 | high | the contract, integration, review, this log and the README |
| Backend Lead | Claude Sonnet | medium | `package.json`, `server.js`, schema, seed, every route, auth, QR |
| Frontend Lead | Claude Sonnet | medium | `public/index.html`, `public/admin.html`, `public/style.css`, `public/app.js` |
| QA Lead | Claude Sonnet | medium | the six acceptance checks, the browser and curl runs, the fixes they forced |

The two leads ran at the same time, in separate sessions, on separate ports. They never read
each other's files. The only thing they shared was the contract below.

## 3. The contract, published before any code

**Port.** 3000 by default, `PORT=3001 node server.js` overrides it. Leads and QA worked on
3012, 3013 and 3014 so three sessions could run at once.

**Files.** Exactly `package.json`, `server.js`, `public/index.html`, `public/admin.html`,
`public/style.css`, `public/app.js`, `data.sqlite` (created on first start, gitignored), plus
`README.md`, this log and `screenshots/`, which belong to the orchestrator. The printable A4
QR sheet at `/admin/qr` is rendered by `server.js` itself, so `public/` keeps exactly the four
files the prompt allows.

**Dependencies.** `express` and `qrcode`. Nothing else. `node:sqlite` is built in.

**Auth.** One constant at the top of `server.js`:

```js
// Change this one line to set the admin password.
const ADMIN_PASSWORD = 'kebap2026';
```

A signed cookie `qrmenu_session` carries `<expiry>.<hmac-sha256>` over an HMAC key kept in the
`meta` table, so the signature survives a restart. Every `/api/admin/*` route and both admin
pages check it on the server. A failed API check returns HTTP 401 and
`{"error":"unauthorized"}`; `/admin` without a session renders the login form only.

**Schema.**

```sql
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price REAL NOT NULL,
  prep_minutes INTEGER NOT NULL DEFAULT 10,
  allergens TEXT NOT NULL DEFAULT '',        -- comma separated tag slugs
  available INTEGER NOT NULL DEFAULT 1,      -- 0 means "tükendi"
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
```

`meta` holds `version`, an integer bumped on every write, and `session_key`, the HMAC secret
generated on first start.

**Tag vocabulary, fixed, five slugs.** `vegan`, `vejetaryen`, `glutensiz`, `laktozsuz`, `aci`.
Turkish labels shown to the guest: Vegan, Vejetaryen, Glutensiz, Laktozsuz, Acı. Both faces use
these slugs and nothing else.

**Seed, written on first start.** Four categories in this order: Başlangıçlar, Ana Yemekler,
Tatlılar, İçecekler. Sixteen items, four per category, each with a Turkish name, a one line
description, a price, a preparation time and its tags.

**JSON shapes.**

```jsonc
// GET /api/menu   (public, no auth; includes sold out items with available=false)
{
  "version": 7,
  "restaurant": { "name": "Bereket Ocakbaşı", "tagline": "Ateşten sofraya" },
  "categories": [ { "id": 1, "name": "Başlangıçlar", "sort_order": 0 } ],
  "items": [ {
    "id": 1, "category_id": 1, "name": "Mercimek Çorbası",
    "description": "Tereyağı ve nane ile", "price": 95, "prep_minutes": 8,
    "allergens": ["vejetaryen", "glutensiz"], "available": true, "sort_order": 0
  } ]
}
// GET /api/version  ->  { "version": 7 }        polled by the customer face
```

**Route list.**

| Method | Route | Auth | Body / query | Answer |
|---|---|---|---|---|
| GET | `/` | no | `?masa=N` optional | `public/index.html` |
| GET | `/admin` | no | | `public/admin.html` (login form until a session exists) |
| GET | `/admin/qr` | yes | `?tables=N` (1 to 40, default 12) | server rendered A4 sheet |
| GET | `/api/menu` | no | | the menu payload above |
| GET | `/api/version` | no | | `{version}` |
| GET | `/api/session` | no | | `{authenticated}` |
| POST | `/api/login` | no | `{password}` | `{ok:true}` and the cookie, or 401 |
| POST | `/api/logout` | no | | `{ok:true}` |
| POST | `/api/admin/categories` | yes | `{name}` | `{category}` |
| PATCH | `/api/admin/categories/:id` | yes | `{name}` | `{category}` |
| DELETE | `/api/admin/categories/:id` | yes | | `{ok:true}` |
| POST | `/api/admin/categories/:id/move` | yes | `{direction:"up"\|"down"}` | `{ok:true}` |
| POST | `/api/admin/items` | yes | item fields | `{item}` |
| PATCH | `/api/admin/items/:id` | yes | any item fields | `{item}` |
| DELETE | `/api/admin/items/:id` | yes | | `{ok:true}` |
| POST | `/api/admin/items/:id/availability` | yes | `{available:boolean}` | `{item}` |
| POST | `/api/admin/items/:id/move` | yes | `{direction}` | `{ok:true}` |
| GET | `/api/admin/qr` | yes | `?tables=N` | `{cards:[{table,url,dataUrl}]}` |

Every write bumps `meta.version`. Item and category order is `sort_order ASC, id ASC` on both
faces.

**Client side rules.** The order note lives in `localStorage` under `qrmenu.order` as
`{"table":3,"lines":{"12":2}}`, so a reload keeps it. The table number comes from `?masa=N` and
is stored. The customer face polls `/api/version` every 3 seconds, refetches on a change and
shows a "menü güncellendi" toast, which keeps the acceptance window under 5 seconds. Prices are
formatted with `Intl.NumberFormat('tr-TR')` and a `₺` suffix. Item images are deterministic CSS
gradients derived from the item id, never a network request.

## 4. What each lead built

**Backend Lead** wrote `package.json` and the whole of `server.js`: the schema and the seed
(4 categories, 16 items, one of them seeded sold out so the "Tükendi" badge is visible on the
very first start), the eighteen routes in the table above, the signed session cookie with the
key in `meta.session_key` and `timingSafeEqual` on both the password and the signature, the
validation layer, the `qrcode` data URLs and the server rendered A4 sheet. It smoke tested on
port 3012.

**Frontend Lead** wrote the four files in `public/`. `index.html` and `admin.html` are thirteen
line shells carrying a `data-page` attribute; `app.js` branches on it and builds both faces.
The customer half does the sticky rail with an IntersectionObserver, the accent folded Turkish
search, the AND filter chips, the gradient thumbnails from the item id, the `localStorage` order
note and the 3 second version poll that redraws without losing state. The admin half does the
login gate, the category and item CRUD modals, the availability switch, the move arrows and an
`apiFetch` wrapper that drops back to the login form on any 401. It could not talk to
`server.js`, which did not exist yet, so it built against the contract and checked its work with
a throwaway mock server on port 3013 driven over the Chrome DevTools protocol.

**QA Lead** ran last, on port 3014, and turned the six acceptance items into real checks.

**Orchestrator** published the contract, reviewed the integrated app independently, dispatched
the fix wave, took the screenshots and wrote the two .md files.

## 5. The tests QA ran

| # | The check | How it was actually measured |
|---|---|---|
| 1 | Clean start, 4 categories, 16 items, no console errors | CDP `Runtime.enable`, counted `consoleAPICalled` and `exceptionThrown`: zero. DOM: 4 `.category-section`, 16 `.item-card` |
| 2 | Admin routes closed without a session | `POST /api/admin/items` with no cookie: 401. `/admin` with cookies cleared: a password field and no panel markup |
| 3 | Sold out propagates in under 5 s | flipped an item by curl while a browser page was already open, then polled the DOM: the badge appeared after 2.05 s in QA's run and 0.41 s in the orchestrator's |
| 4 | QR cards and the table number | asserted table 3's `url` field exactly, loaded `/?masa=3`, and read "Masa 3" from both the header and the order note panel |
| 5 | The order note survives a reload | added two items, read `localStorage['qrmenu.order']`, reloaded, compared the value and the bottom bar |
| 6 | Restart persistence and no 390px overflow | diffed `/api/menu` across a real restart including the availability flags, then compared `scrollWidth` with `clientWidth` at a true 390x844 viewport set with `Emulation.setDeviceMetricsOverride` |
| edges | Abuse | wrong password, malformed JSON, unknown `category_id`, `price: "abc"`, an empty name, a bad move direction, `?tables=0`, `?tables=99`, `?tables=abc`, and deleting a category that still holds items |

## 6. The bugs, and who caught them

**QA Lead, 1 bug.**

1. `public/app.js`, `public/style.css`: the table number reached the header badge and the copied
   text but never the order note panel itself, which is the sheet the guest actually holds up to
   the waiter. Acceptance item 4 asks for it on the note. Fixed by adding an `order-panel-masa`
   line under the panel header, fed from `state.order.table`. Re-verified.

**Orchestrator review, 4 defects, fixed by two workers running in parallel on ports 3012 and
3013.**

2. The customer face was a stretched phone at 1440px: every card spanned the full width, so a
   64px thumbnail sat on the far left and a lonely price on the far right. This is the frame the
   presenter puts on a projector. Fixed in `public/style.css` with one `@media (min-width:760px)`
   block that centres the page into an 840px measure and turns each category into a two column
   grid, with the header band and the sticky rail staying full bleed and their content inset to
   the same column. The 390px layout is byte for byte unchanged.
3. The five tag icons were unreadable at 12px: the vejetaryen mark looked like an accented
   letter, laktozsuz like a stray bracket. Replaced in `public/app.js` with one family of solid
   colour dots, one fixed colour per tag, keeping the Turkish labels and the `title` attributes.
4. `laktozsuz` was a dead filter chip: the seed gave it to nobody, so tapping it on stage would
   have emptied the menu. Two seeded items that genuinely qualify now carry it, and every one of
   the five tags is now on at least one item.
5. Unknown ids answered 200. `DELETE /api/admin/items/9999` returned `{"ok":true}` as if it had
   deleted something. Every id addressed route (both deletes, both patches, the availability
   toggle and both move routes) now answers 404 with `{"error":"not found"}`, and a version bump
   no longer happens when nothing changed. A move at the end of a list is still a 200 no-op.
6. The printable sheet looked like an unstyled page next to the rest of the app: a default grey
   browser button and no heading. It now carries a Turkish heading and a terracotta print
   button, both hidden in `@media print`, with the card grid, the cut lines and the `@page` rule
   untouched.

**Independent verification pass, 2 defects.**

7. `server.js`: the two QR routes are `async`, and neither wrapped its `await` in a `try`. A
   rejected `QRCode.toDataURL` therefore became an unhandled rejection, which Node 24 turns into
   a process exit: one bad request took the whole server down instead of returning an error.
   Reproduced with an oversized `Host` header on `/admin/qr`. Both handlers now catch and answer
   400 with `{"error":"could not build QR codes"}`, and the server stays up.
8. `public/app.js`: the "Notu Gör" control that opens the order note was a `<div>` with a click
   handler, so it could not be reached by keyboard. It is a `<button type="button">` now. Every
   other control on both faces was already a real button, and the rendering is unchanged: the
   1440x900 frame is byte identical to the committed screenshot.

One thing was deliberately left alone: `data.sqlite` is gitignored at the repo root together
with `node_modules`, so a clone starts from the seed and the room's first `node server.js` fills
the menu on its own.

## 7. The clean check

`node_modules` deleted, `npm install --no-audit --no-fund` from scratch, `data.sqlite` deleted,
then `PORT=3002 node server.js` in the background. `curl` on `/` returned HTTP 200 and
`/api/menu` returned JSON with 4 categories and 16 items. The server was then killed by its
process group and the port confirmed free.
