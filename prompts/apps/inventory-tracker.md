# Mega prompt · Inventory Tracker (small business)

One shot, fully autonomous. A small shop's real daily question: "what do I have, what is
about to run out?" Paste the block below AS-IS into a fresh Claude Code session.

---

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

---

**Why this prompt works:** the acceptance list IS the demo script: three products, drop one
below its threshold, watch the strip. The prompt tells the model what "done" must look like,
so nothing is left to taste.
