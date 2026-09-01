# Sales Panel (Satış Paneli)

A single-screen sales dashboard that reads a CSV export, loads it into SQLite, and serves a
dark-themed Turkish-language panel with revenue totals, a daily chart, a category breakdown, a
city table, and a backend-generated insight box. It is built for anyone who exports sales data
from a spreadsheet (Excel, Google Sheets) and wants an instant read on what happened without
opening a BI tool: a shop owner, a small sales team, or a trainer showing what one well-written
prompt can produce.

## The one prompt that built it

This is the exact recipe, copied verbatim from between the `---` fences of
`prompts/apps/data-dashboard.md`.

```
> Work as a full product team and drive this job from start to finish WITHOUT stopping to ask
> for my confirmation at any point. First print a short numbered plan (max 6 lines) so I can
> follow along on screen, then immediately execute it. Report as you go, wearing each hat in
> turn: product manager (scope), data engineer (ingest), backend (API), frontend (UI), and
> finally QA (walk the acceptance checklist and mark every item explicitly).
>
> THE JOB: build a "Sales Panel" web application that reads `data/sales-data.csv`
> (columns: date, product, category, qty, unit_price, city; 120 rows, some rows may be
> malformed).
>
> TECHNICAL FRAME, non-negotiable:
> - Small but modular Node.js app. Node built-in modules ONLY (`node:http`, `node:fs`,
>   `node:sqlite`). Do NOT install any npm package.
> - File layout exactly: `server.js` (http server + routing) · `lib/db.js` (loads the CSV
>   into SQLite at startup, skips malformed rows and counts them) · `lib/stats.js` (every
>   aggregation lives here, pure functions) · `public/index.html` · `public/style.css` ·
>   `public/app.js`.
> - `package.json` with `"dev": "node --watch server.js"`; the app listens on port 3000.
> - API: `GET /api/summary` (totals), `GET /api/daily` (per-day revenue), `GET /api/categories`
>   (per-category revenue + percentage), `GET /api/cities` (per-city table), `GET /api/insight`
>   (see feature 5). All responses JSON; errors return `{ "error": "..." }` with a proper
>   status code.
>
> FEATURES, all required:
> 1. Four summary cards on top: total revenue, total units sold, best-earning product,
>    strongest city. Numbers formatted with thousands separators.
> 2. Revenue-by-day chart (line or bars). NO chart library: draw it with plain SVG or
>    div-bars, computed from `/api/daily`.
> 3. Revenue share by category: horizontal bars with percentage labels, sorted descending.
> 4. City table: revenue, units, average basket (revenue/orders), sorted by revenue.
> 5. An "Insight" box: the BACKEND computes three short observations from the data (best day,
>    the category that stands out, one concrete recommended action) and returns them from
>    `/api/insight`; the frontend only renders them.
>
> LOOK: dark theme (background #16150f, accent #d97757), system font stack, single-screen
> layout that stacks vertically on mobile. All user-facing UI text in TURKISH (this app will
> be shown to a Turkish audience); code, comments and file names in English.
>
> QUALITY BAR: each file does one job; functions stay short; user-visible error messages in
> Turkish; malformed CSV rows are skipped and the skipped count is logged at startup and
> shown as a small footnote in the UI.
>
> ACCEPTANCE CHECKLIST, verify each yourself before declaring done:
> 1. `npm run dev` starts with no errors and logs how many rows loaded / skipped.
> 2. `curl -s localhost:3000/api/summary` returns non-zero totals.
> 3. Opening http://localhost:3000 shows all five sections filled with real data.
> 4. Resizing to a phone width keeps every section readable (stacked).
> 5. Deleting one column from a COPY of the CSV and loading it produces a clear Turkish
>    error, not a crash.
>
> DEFINITION OF DONE: checklist all green. Close by printing (a) the one-line command that
> starts the app and (b) a five-line summary of what each file does.
```

## Run it

```bash
cd showcase/data-dashboard
npm run dev
```

Then open **http://localhost:3000**.

The app reads its own local copy of the sample data at `data/sales-data.csv` (120 rows,
identical to the repo-root `data/sales-data.csv`), so this folder runs standalone: no other
part of the repo needs to be present. Override the port with `PORT=3001 npm run dev` if 3000
is busy, or point at a different CSV with `CSV_PATH=/path/to/file.csv npm run dev`.

## What you get

- `server.js` - a plain `node:http` server: routes `/api/*` to JSON handlers, everything else
  to static files in `public/`, with basic path-traversal protection.
- `lib/db.js` - reads the CSV, validates the header against the six required columns, skips
  rows with the wrong field count or invalid/empty values (bad date, non-numeric or
  non-positive qty/price, blank text field), and loads the valid rows into a SQLite table
  (`node:sqlite`, on-disk file `data/dashboard.sqlite`, gitignored, recreated on every start).
- `lib/stats.js` - every aggregation (summary totals, daily revenue, category share, city
  table, insight text) as functions that take the open DB connection and return plain data;
  none of them mutate state.
- `public/index.html` / `public/style.css` / `public/app.js` - the dark-themed (`#16150f`
  background, `#d97757` accent), Turkish-language, mobile-stacking UI. `app.js` only fetches
  the five endpoints and renders what comes back; it does not compute anything itself.
- Five sections: four summary cards, a div-bar daily revenue chart, a horizontal-bar category
  breakdown with percentages, a sortable-by-revenue city table, and an insight box with three
  backend-generated Turkish observations (best day, standout category, one concrete
  recommendation).
- A footnote that reports how many rows were skipped (0 for the shipped sample CSV, since it
  has no malformed rows; the skip logic itself is exercised and confirmed separately, see
  Verified below).

**One deliberate deviation from the recipe:** `package.json`'s `dev` script is `node
server.js`, not the recipe's `node --watch server.js`. This showcase copy is meant to run
unattended as a stage fallback and be started/stopped from scripts, where `--watch`'s
auto-restart-on-file-change behavior is not needed and adds noise to process management. The
app is otherwise built exactly to the recipe.

## Verified

All of the following was tested for real against a running server on this machine (Node
v24.20.0), not assumed:

- [x] **`npm run dev` starts clean and logs counts.** Ran `npm run dev`; output was
      `Sales Panel: loaded 120 rows, skipped 0 rows (of 120 total) from .../data/sales-data.csv`
      followed by `Sales Panel running at http://localhost:3000`. No errors.
- [x] **`curl -s localhost:3000/api/summary` returns non-zero totals.** Response:
      `{"totalRevenue":445390,"totalUnits":526,"bestProduct":{"name":"Coffee Maker","revenue":153600},"strongestCity":{"name":"Izmir","revenue":104480},...}`.
- [x] **All five sections render with real data.** Verified with a headless-browser screenshot
      at 1280x900: summary cards, daily bar chart, category bars, city table, and the insight
      box (three Turkish sentences, e.g. "En güçlü gün 3 Ağustos oldu, 35.080 TL ciro ile.")
      all populated. No console errors.
- [x] **Phone width stays readable.** Resized to 375x812 and re-screenshotted: cards, chart,
      category bars, city table, and insight box all stack into a single readable column.
- [x] **Deleting a column produces a clear Turkish error, not a crash.** Made a copy of the CSV
      with the `unit_price` column removed entirely (header and every row), pointed a second
      instance at it via `CSV_PATH`, and started it. It logged
      `Sales Panel startup error: CSV dosyası geçersiz: eksik sütun(lar): unit_price. Beklenen
      sütunlar: date, product, category, qty, unit_price, city.` and kept running (`/` still
      returned 200, `/api/summary` returned `{"error":"CSV dosyası geçersiz: ..."}` with status
      503), with no stack trace and no process crash.
- [x] Also checked beyond the checklist: static assets (`/style.css`, `/app.js`) return 200,
      an unknown API route returns 404 with a Turkish error body, and the SQLite file
      (`data/dashboard.sqlite`) is created on startup.
- [x] **Process cleanup.** Every test server (main run, `npm run dev` run, and the broken-CSV
      run) was started under its own session with `setsid` and killed with
      `kill -TERM -<pgid>` afterward; confirmed with `ps` and `ss -ltnp` that no `node
      server.js` process and no listener on ports 3000/3001 was left behind.
