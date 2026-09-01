# BUILD-LOG: Satış Analitik Paneli

How this folder came to exist. One mega prompt
([`prompts/apps/data-dashboard.md`](../../prompts/apps/data-dashboard.md)) went into a fresh
Claude Code session. That session acted as the ORCHESTRATOR: it printed a plan, published a
contract, formed a team of sub agents, integrated their work, and let QA try to break the
result. Nobody typed a second instruction.

## 1. The plan the orchestrator printed

1. Publish the contract (file list, port, routes, JSON shapes, DB schema, filter params) before
   anyone writes a line.
2. Spawn the Backend Lead and the Frontend Lead in parallel, both building against that
   contract and nothing else.
3. Backend Lead: `package.json` plus `npm install` first (that unblocks the frontend), then
   `server.js`, the schema, the CSV import or the row generator, every aggregation and the
   insight engine.
4. Frontend Lead: `public/`, the KPI cards, the charts, the filter bar, the product table, the
   insight panel, the dark look and the 390px layout.
5. QA Lead once both land: run the server on port 3000, turn the six acceptance items into real
   checks, report pass or fail per item, fix the fails.
6. Orchestrator review: an independent curl pass over every route plus 1440x900 and 390x844
   frames read back with a headless browser.
7. Fix wave: workers repair what the review caught, each on its own port so nothing collides.
8. Clean check: wipe `node_modules`, `npm install`, `node server.js`, prove HTTP 200 and a JSON
   route, then kill the server and free the port.

## 2. The team

| Role | Model | Effort | Owned |
|---|---|---|---|
| Orchestrator | Claude Opus 5 | high | the contract, integration, review, this log and the README |
| Backend Lead | Claude Sonnet | medium | `package.json`, `server.js`, schema, seeding, every route, the insight engine |
| Frontend Lead | Claude Sonnet | medium | `public/index.html`, `public/style.css`, `public/app.js` |
| QA Lead | Claude Sonnet | medium | the six acceptance checks, the browser and curl runs, the fixes they forced |
| Backend fix worker | Claude Sonnet | low | the three server side defects the orchestrator review found |
| Frontend fix worker | Claude Sonnet | low | the insight figure, the phone KPI grid |
| Frontend polish worker | Claude Sonnet | low | the city card stretch, the repeated caption |

The two leads ran at the same time, in separate sessions, on separate ports. They never read
each other's files. The only thing they shared was the contract below.

## 3. The contract, published before any code

**Port.** 3000 by default, `PORT=3001 node server.js` overrides it.

**Files.** `package.json` (type module, `start` runs `node server.js`, deps `express` and
`chart.js`), `server.js`, `public/index.html`, `public/style.css`, `public/app.js`,
`data.sqlite` (created on first start, gitignored), plus this log, the README and
`screenshots/`, which belong to the orchestrator.

**Schema.** One table:

```sql
CREATE TABLE IF NOT EXISTS sales (
  id INTEGER PRIMARY KEY, date TEXT, product TEXT, category TEXT,
  qty INTEGER, unit_price REAL, city TEXT, revenue REAL
);
```

One CSV row is one order, so `orders = COUNT(*)`, `units = SUM(qty)`,
`revenue = SUM(revenue)`, `avgBasket = revenue / orders`.

**Seeding.** First start only. CSV lookup ladder resolved from the folder holding `server.js`,
first hit wins: `data/sales-data.csv`, `../data/sales-data.csv`, `../../data/sales-data.csv`.
Inside this repo the third rung finds `data/sales-data.csv` at the repo root (120 rows, source
`csv`). From an empty folder nothing matches and the server generates 120 realistic rows over
the last 90 days (source `generated`). Deleting `data.sqlite` and restarting reseeds.

**Shared filter parameters** on every data route, all optional, empty means not set:
`from` and `to` (`YYYY-MM-DD`, inclusive), `category`, `city`. A malformed or unknown value is
ignored rather than thrown: every route answers HTTP 200 with JSON in every case.

**Routes and shapes.**

| Route | Returns |
|---|---|
| `GET /api/meta` | `{ categories[], cities[], dateRange:{min,max}, rowCount, source }` |
| `GET /api/kpis` | `{ range:{from,to,prevFrom,prevTo,days}, current:{revenue,units,orders,avgBasket}, previous:{...}, change:{...} }`, change in percent or `null` |
| `GET /api/timeline` | `{ granularity, points:[{bucket,label,revenue,units,orders}] }`, granularity `day` / `week` / `month` |
| `GET /api/categories` | `{ total, items:[{category,revenue,units,orders,share}] }` |
| `GET /api/cities` | `{ items:[{city,revenue,units,orders}] }`, revenue descending |
| `GET /api/products` | `{ total, items:[{product,category,revenue,units,orders,share}] }` |
| `GET /api/insights` | `{ insights:[{id,kind,title,text,value,valueLabel}] }`, 3 to 5 items, each with a real number |

**Static.** `express.static('public')` at `/`, and Chart.js from `node_modules` at
`/vendor/chart.umd.js`. No CDN: the machine may be offline at show time.

**Division of ports while the team worked.** 3000 was reserved for QA and the orchestrator, the
Backend Lead smoke tested on 3011, the Frontend Lead ran a throwaway mock API on 3012 so it
could build and screenshot the UI before `server.js` existed.

## 4. What QA ran

The QA Lead started the real server on port 3000 and turned the six acceptance items into
checks, in a headless browser driven through CDP and with curl:

1. Clean start and a clean browser console, proved by listening to `console` and `pageerror`
   and asserting an empty array, not by assuming.
2. `curl -s localhost:3000/api/kpis`: revenue 445390, units 526, orders 120, all non zero.
3. Last 7 days (`from=2026-08-22&to=2026-08-28`): the KPI card read ₺128.160,00 and the sum of
   the product table rows was 128160, matching to the cent, and the browser showed every widget
   change at once.
4. Month granularity redraws with fewer points than day granularity (28 day points against 1
   month point on this one month CSV).
5. `curl -s localhost:3000/api/insights`: 4 insights, each carrying a numeric `value`.
6. At 390px `document.documentElement.scrollWidth === clientWidth === 390`, measured in the
   page, plus a 390x844 frame read back.

It also checked the things nobody asks about until they break: `PORT=3001` really moves the
port, deleting `data.sqlite` reseeds to 120 rows, there is no em dash character in the source,
`index.html` pulls Chart.js from `/vendor` and not from a CDN, the donut click applies a
category filter, and the product table search and column sorting work when actually driven in a
browser.

## 5. Bugs found and fixed

| # | Found by | Bug | Fix |
|---|---|---|---|
| 1 | Backend Lead, own smoke test | An invalid `from` or `to` (`?from=bad`) threw `Invalid time value` and returned HTTP 500, breaking the contract's "always 200" rule | `isValidDateStr` guard; invalid dates are ignored and the request falls back to the full range |
| 2 | QA Lead | Every user facing string in `public/` was written without Turkish characters (`sü` and `ı` and `ğ` missing throughout), while `server.js` had them | All labels, headings, buttons, placeholders and empty states rewritten with proper Turkish characters |
| 3 | QA Lead | On first load the date inputs were empty, so the full range was used, so the previous period was empty and all four KPI changes came back `null`: the dashboard opened with four dashes | First load defaults to the last 14 days of `/api/meta` `dateRange`, so it opens with real percent changes and the range is visible in the inputs |
| 4 | QA Lead | With `change` null the cards showed a bare `-` with no explanation | Each card now carries a muted "önceki dönem verisi yok" line in that state |
| 5 | QA Lead | At month granularity the single point was invisible because `pointRadius` was 0 | Radius rises to 5 when a series has one point or fewer |
| 6 | Orchestrator review | Week labels were wrong across a month boundary: the week of Monday 2026-07-27 read "27-2 Tem", which says 27 to 2 of July | Cross month weeks name both months ("27 Tem - 2 Ağu 2026"), weeks inside one month keep the short form ("3-9 Ağu") |
| 7 | Orchestrator review | Insight text and `valueLabel` used "35.080,00 TL" and wrote percentages with a decimal point ("yüzde 61.9") | All money goes through one helper and carries ₺, all percentages use the Turkish comma ("yüzde 61,9") |
| 8 | Orchestrator review | Narrow filters (`category=Food&city=Antalya` over three days, or an unknown category) returned a single insight, below the contract's minimum of 3 | Thin and empty result sets now produce three honest observations with `value: 0` |
| 9 | Orchestrator review | The insight card printed its `valueLabel` as a bare paragraph, so a lone number hung under each card | The figure became an accent colored chip tied to its sentence |
| 10 | Orchestrator review | At 390px each KPI card took a full row, so a phone showed one and a half cards before the fold | Two by two KPI grid under 460px |
| 11 | Orchestrator review | The city chart card stretched to the height of the taller insight panel, leaving a third of it blank | The row no longer stretches and the chart fills its card |
| 12 | Orchestrator review | The same "DEĞER" caption repeated under all five insight figures | Caption dropped, the accent figure stays |

## 6. Integration decisions the orchestrator made

- **The repo CSV spans one month** (2026-08-01 to 2026-08-28), so the period before the full
  range is empty by definition. Rather than fake a comparison, the dashboard opens on the last
  14 days, where the previous 14 days are real, and "filtreleri temizle" widens to the full
  range where the cards say plainly that there is no previous period. Both states are honest and
  both look deliberate.
- **The CSV lookup ladder got a third rung.** The prompt names `data/sales-data.csv` and
  `../data/sales-data.csv`. From an empty folder created next to the repo those two are right,
  but this proof lives two levels down in `showcase/data-dashboard/`, so `../../` was added.
  Both paths the prompt names are still checked first.
- **`package-lock.json` was kept.** It is not in the contract's file list, but it makes the
  pre training `npm install` reproducible, which matters more than a tidy listing.

## 7. Verification the orchestrator ran last

`node_modules` deleted, `npm install --no-audit --no-fund` from scratch, `PORT=3000 node
server.js`, `curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/` returned 200, an
`/api` route answered JSON, the server was killed by process group and port 3000 was confirmed
free with `ss -ltnp`. `node_modules` was left installed so the fallback starts in seconds.
