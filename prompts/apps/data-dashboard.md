# Mega prompt · Satış Analitik Paneli (a sales dashboard, built by a team)

One shot, fully autonomous, and Claude Code does not build it alone: it forms a team of
sub-agents and runs them in parallel. Works in an empty folder, and picks up the repo CSV when
there is one. Paste the block below AS-IS into a fresh Claude Code session.

---

> **You are the ORCHESTRATOR.** Drive this job from start to finish WITHOUT stopping for my
> confirmation at any point. First print a numbered plan (max 8 lines) so the room can follow
> on screen, then execute it. This runs live in front of an audience: narrate every step.
>
> STEP 1, PUBLISH THE CONTRACT before anyone writes a line: the file list, the port, the exact
> API routes and the JSON shape each one returns. Print it on screen, then write it into
> `BUILD-LOG.md`. Parallel work only fits together because this exists first.
>
> STEP 2, FORM THE TEAM, FOR REAL. Use your Agent tool to spawn three LEAD sub-agents and run
> them in parallel wherever their work is independent:
> - **Backend Lead**: `server.js`, the SQLite schema, the CSV import or the row generator,
>   every aggregation endpoint, the insight engine.
> - **Frontend Lead**: `public/index.html`, `public/style.css`, `public/app.js`, the KPI cards,
>   the charts, the filter bar, the product table.
> - **QA Lead**: turns the acceptance checklist below into real checks, starts the server,
>   verifies every item in a browser or with curl, reports pass or fail per item, fixes fails.
> A lead may spawn a worker or two for independent sub-tasks. You do NOT write the app
> yourself: you integrate, resolve conflicts and run QA last.
>
> THE JOB: build "Satış Analitik Paneli", a sales analytics dashboard that looks like a paid
> product: KPI cards, charts, filters that drive every widget at once, and an insight panel the
> server computes.
>
> THE STACK, non-negotiable, no build step and no framework:
> - ONE folder, created here, holding exactly: `package.json`, `server.js`, `public/`
>   (`index.html`, `style.css`, `app.js`), `data.sqlite`, `README.md`, `BUILD-LOG.md`.
> - `package.json` carries `"type": "module"` and a `start` script running `node server.js`.
> - `server.js`: Node 24, Express from npm, and the BUILT-IN `node:sqlite` module
>   (`import { DatabaseSync } from 'node:sqlite'`). Nothing native compiles on this machine.
> - `public/` is plain HTML, CSS and JavaScript: no TypeScript, no bundler, no CSS framework.
>   Charts: Chart.js served from `node_modules` with `express.static`, or SVG drawn by hand.
> - `data.sqlite` is created and seeded on FIRST START; deleting it resets the app.
> - The only two commands anyone ever types: `npm install`, then `node server.js`, serving
>   http://localhost:3000. `PORT=3001 node server.js` must override the port.
> - DATA: if `../data/sales-data.csv` or `data/sales-data.csv` exists, import it (columns
>   `date,product,category,qty,unit_price,city`); otherwise generate 120 realistic rows with
>   those same columns. The build must work from an empty folder AND inside this repo.
> - All user-facing UI text in TURKISH; code, comments, `README.md` and `BUILD-LOG.md` in
>   English.
>
> FEATURES, all required:
> 1. Four KPI cards (ciro, satılan adet, sipariş sayısı, ortalama sepet), each with a percent
>    change against the previous period of the same length.
> 2. Revenue timeline chart with a day / week / month granularity switch.
> 3. Category share donut with percentage labels; clicking a slice applies that category filter.
> 4. City bar chart sorted by revenue, with revenue and units both in the tooltip.
> 5. Product table: sortable columns, an instant search box, revenue, units and share of total
>    per product.
> 6. One filter bar (date range, category, city) driving EVERY widget from a single state, with
>    a visible "filtreleri temizle" reset.
> 7. Insight panel: the SERVER computes 3 to 5 observations from the filtered data (best day,
>    standout category, biggest mover, one concrete suggested action), each carrying the number
>    behind it. The frontend only renders them.
> 8. A premium dark look with one accent color, Turkish number formatting with ₺ on money, and
>    a layout that still reads at 390px phone width.
>
> ACCEPTANCE CHECKLIST, the QA Lead verifies each ON SCREEN or with curl and reports pass/fail:
> 1. `npm install` then `node server.js` start clean; http://localhost:3000 renders real data
>    with no console errors.
> 2. `curl -s localhost:3000/api/kpis` returns non-zero revenue, units and orders.
> 3. Setting the date range to the last 7 days changes the KPI cards, the timeline, the donut,
>    the city chart and the table at once, and the table total matches the revenue card.
> 4. Switching the timeline to month granularity redraws it with fewer, wider points.
> 5. `curl -s localhost:3000/api/insights` returns 3 to 5 insights, each carrying a number.
> 6. At 390px width nothing overflows sideways and the widgets stack readably.
>
> DEFINITION OF DONE: every checklist item green; `README.md` with the product name, the two
> commands, the feature list and the team that built it; `BUILD-LOG.md` with the plan, the
> team, the published contract, the tests QA ran and every bug found and fixed. Close by
> printing the run command and a five-line summary of what each team member built.

---

**Stage note:** while the team works, ask the room: "three sub-agents are writing at the same
time, so who decides that the frontend and the backend still fit together?" The answer is on
screen: the contract the orchestrator published before anyone started typing. When it finishes,
run `npm install`, then `node server.js`, and open http://localhost:3000. Take one change
request from the audience and type it as a single sentence. Fallback if the build stalls:
`cd showcase/data-dashboard` and `node server.js`.
