# Mega prompt · Data Dashboard (CSV → analysis → panel)

One shot, fully autonomous: paste the block below AS-IS into a fresh Claude Code session and
let it run to the end. Run it from the repo root (`data/sales-data.csv` lives there). At home,
export your own spreadsheet with `Save As → CSV` (Excel) or `File → Download → CSV`
(Google Sheets) and point the prompt at your file instead.

---

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

---

**Why this prompt works:** team roles + an exact file tree + numbered acceptance criteria +
a visual frame + a definition of done. It never says "make something nice"; it says "done
means exactly this", and it explicitly grants autonomy so the run never stalls waiting for
approval.
