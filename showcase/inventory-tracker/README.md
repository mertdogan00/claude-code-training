# Stok Defteri (Inventory Tracker)

A small shop's daily stock ledger: what is in stock, what is about to run out. Add products,
sell or restock with a tap, and watch the critical-stock strip and the movement history
update live, with zero page reloads. Built for shop owners, workshop managers, and small
depots who just need a fast "what do I have" screen.

## The one prompt that built it

The exact recipe below is copied verbatim from `prompts/apps/inventory-tracker.md`, between
its two `---` fences.

```
> Work as a full product team and drive this job from start to finish WITHOUT stopping to ask
> for my confirmation at any point. First print a short numbered plan (max 6 lines), then
> immediately execute it. Report as you go: product manager (scope), backend, frontend, data
> engineer, then QA walking the acceptance checklist item by item.
>
> THE JOB: a "Stok Defteri" (inventory ledger) web application for a small business.
>
> FEATURES, all required:
> 1. Add-product form: name, category, quantity, critical threshold (alert below it, default
>    5), unit price. Validate on both client and server.
> 2. Product list: search box (name, instant filter) + category dropdown filter; each row has
>    minus/plus buttons that decrease/increase quantity by one (a sale / a restock).
> 3. Critical-stock strip: products at or below their threshold pinned to the top in a
>    reddish band with an "order now" badge.
> 4. Summary cards: distinct products, total stock value (sum of qty × unit price), number of
>    critical products. Values update after every action without a page reload.
> 5. Movement history: every add/decrease/increase writes a row (timestamp, product, change);
>    a "Last 10 movements" box renders it, newest first.
>
> TECHNICAL FRAME, non-negotiable:
> - Node built-in modules ONLY (`node:http`, `node:fs`, `node:sqlite`); no npm packages.
> - Files exactly: `server.js` · `lib/db.js` (schema + queries) ·
>   `public/index.html` · `public/style.css` · `public/app.js`.
> - JSON API under `/api/` for every read and write; the frontend never reloads the page.
> - `package.json` with `"dev": "node --watch server.js"`; port 3000.
>
> LOOK: dark theme (background #16150f, accent #d97757), mobile friendly, the critical strip
> visually loud but not cartoonish. All user-facing UI text in TURKISH; code and comments in
> English.
>
> QUALITY BAR: quantity can never go negative (guard server-side; disable the minus button at
> zero client-side); validation messages in Turkish; data survives a server restart; seed the
> database with 6 sample products on first run so the screen is never empty.
>
> ACCEPTANCE CHECKLIST, verify each yourself before declaring done:
> 1. `npm run dev` starts clean and seeds 6 products on a fresh database.
> 2. Adding a product makes it appear in the list and updates the summary cards.
> 3. Decreasing a product below its threshold moves it into the critical strip.
> 4. The minus button cannot take a quantity below zero, and the server also rejects it.
> 5. Restarting the server keeps all products and the movement history.
>
> DEFINITION OF DONE: checklist all green. Close by printing the start command and the
> three steps that prove the critical-strip behavior.
```

## Run it

```
cd showcase/inventory-tracker
npm run dev
```

Open **http://localhost:3000**. On a fresh checkout there is no `stok-defteri.sqlite` file
yet, so the first launch creates the database and seeds 6 sample products automatically. Set
`PORT=xxxx` in the environment to run on a different port.

Three steps that prove the critical-strip behavior:
1. Load the page: two of the six seeded products (Mavi Tükenmez Kalem 4/5, Bulaşık Deterjanı
   3/4) already sit in the reddish critical band with an "Sipariş Ver" badge.
2. Press the `-` button on "Cam Temizleyici" (starts at 7, threshold 6) once. Its quantity
   drops to 6, and the row jumps into the critical band immediately, no reload.
3. Keep pressing `-` on any critical product until it hits 0: the button greys out and
   disables itself, and the "Son 10 Hareket" box logs every step, newest first.

## What you get

- Add-product form (name, category, quantity, critical threshold with a 5 default, unit
  price) with matching validation on the client and the server, all messages in Turkish.
- Product list with an instant-filter search box, a category dropdown, and per-row minus/plus
  buttons that post to `/api/products/:id/increment|decrement`.
- Critical-stock strip: products at or below their threshold are grouped to the top of the
  list in a reddish band with an "Sipariş Ver" (order now) badge.
- Summary cards (distinct products, total stock value, critical-product count) that
  recompute after every add/increment/decrement, no page reload.
- Movement history: every product creation, sale, and restock writes a row; the "Son 10
  Hareket" box shows the latest 10, newest first.
- SQLite storage via `node:sqlite` (`DatabaseSync`), zero npm dependencies, dark theme
  (`#16150f` background, `#d97757` accent), mobile-friendly layout.

## Verified

All items below were exercised for real over HTTP against a running server (port 3002 for
the test run; the shipped default is port 3000), then the process was terminated and checked
for leaks.

- [x] **`npm run dev` starts clean and seeds 6 products on a fresh database.** Deleted the
  database file, started the server, `GET /api/products` returned exactly 6 seeded products
  and `GET /api/movements` returned their 6 creation rows.
- [x] **Adding a product makes it appear in the list and updates the summary cards.**
  `POST /api/products` with a valid payload returned the new row; the product count went from
  6 to 7 and the total-stock-value sum reflected the new product's qty × unit price.
- [x] **Decreasing a product below its threshold moves it into the critical strip.**
  Decremented "Cam Temizleyici" from 7 to 6 (threshold 6); it appeared in the
  `quantity <= critical_threshold` critical set on the very next `GET /api/products`.
- [x] **The minus button cannot take a quantity below zero, and the server also rejects it.**
  Drove "Bulaşık Deterjanı" down to 0 via three decrements, then sent a fourth: server
  answered `400` with `{"errors":["Miktar sıfırın altına inemez."]}` and the stored quantity
  stayed at 0. The client-side guard (`minusBtn.disabled = product.quantity <= 0`) is in
  `public/app.js`.
- [x] **Restarting the server keeps all products and the movement history.** Snapshotted all
  7 products and the movement count (10), sent `SIGTERM` to the running process, confirmed
  with `ps` that it exited, restarted `node server.js` against the same database file, and
  confirmed both the 7 products (same ids, names, quantities) and the 10 movements matched
  exactly, with no re-seed.
- [x] Also checked: server-side validation rejects an empty name / negative quantity /
  negative price in one call, all in Turkish; static files (`index.html`, `app.js`,
  `style.css`) serve with `200` and the correct content types.
- [x] **Process cleanup.** Server was started detached (`setsid node server.js`) so its PID
  was also its process group id; killed with `kill -TERM -<PGID>`. Confirmed via `ps` and
  `ss -ltnp` that the port was free and, by checking `/proc/<pid>/cwd` for every remaining
  `node server.js` process, that none belonged to `inventory-tracker` (only sibling demo apps
  and the current shell remained).

**Deviation note:** the task brief that generated this app suggested a plain
`"dev": "node server.js"` script. This build kept the recipe's own non-negotiable
`"dev": "node --watch server.js"` instead, since the technical frame section of the mega
prompt marks it explicitly non-negotiable and every sibling prompt in `prompts/apps/` uses
the same convention. Restart-persistence testing was still done as a deliberate manual
stop/start of `node server.js` (decoupled from `--watch`) to get an unambiguous restart
signal.
