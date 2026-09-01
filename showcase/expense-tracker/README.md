# Cüzdan: Personal Expense Tracker

Cüzdan is a single-user, phone-first expense tracker: quick amount entry, a live month view
with a spend projection, a category breakdown, and a monthly limit that changes color as
spending approaches or crosses it. It serves anyone tracking a personal or household budget
who wants a fast one-hand entry form instead of a spreadsheet.

## The one prompt that built it

The exact recipe below is copied verbatim from `prompts/apps/expense-tracker.md`.

```
> Work as a full product team and drive this job from start to finish WITHOUT stopping to ask
> for my confirmation at any point. First print a short numbered plan (max 6 lines), then
> immediately execute it. Report as you go: product manager (scope), backend, frontend, data
> engineer, then QA walking the acceptance checklist item by item.
>
> THE JOB: a personal expense tracker called "Cüzdan" (wallet).
>
> FEATURES, all required:
> 1. Quick entry at the top: amount + category (food & drink, transport, bills,
>    entertainment, groceries, other) + optional note; pressing Enter saves and clears the
>    form, focus returns to the amount field.
> 2. Month view: this month's total, daily average, and a projection: "at this pace, month
>    end lands at X" computed from spent-so-far / days-elapsed × days-in-month.
> 3. Category breakdown: horizontal bars with percentages; the largest category visually
>    emphasized.
> 4. Monthly limit: the user sets a limit once (persisted). A status band turns yellow at
>    80% of the limit and red when exceeded; below 80% it stays neutral.
> 5. Last 10 expenses list, newest first, each with a one-click delete that updates every
>    number on screen without a reload.
>
> TECHNICAL FRAME, non-negotiable:
> - Node built-in modules ONLY (`node:http`, `node:fs`, `node:sqlite`); no npm packages.
> - Files exactly: `server.js` · `lib/db.js` · `public/index.html` · `public/style.css` ·
>   `public/app.js`. JSON API under `/api/` for every read and write.
> - `package.json` with `"dev": "node --watch server.js"`; port 3000.
>
> LOOK: dark theme (background #16150f, accent #d97757); a one-hand phone layout: entry form
> thumb-reachable at the top, numbers large. All user-facing UI text in TURKISH; code and
> comments in English.
>
> QUALITY BAR: amount must be a positive number (validate both sides, Turkish error);
> currency renders with the ₺ symbol and thousands separators; the projection never divides
> by zero on day one; data survives a restart; seed 8 sample expenses across several days so
> every widget has something to show.
>
> ACCEPTANCE CHECKLIST, verify each yourself before declaring done:
> 1. `npm run dev` starts clean with seeded data; all five widgets are populated.
> 2. Adding an expense via the form updates total, average, projection, bars and the list,
>    with no page reload.
> 3. Setting the limit to 1000 with current spending above 80% turns the band the right
>    color; crossing the limit turns it red.
> 4. Deleting an expense from the list updates every number.
> 5. Posting a negative amount with curl is rejected with a Turkish error.
>
> DEFINITION OF DONE: checklist all green. Close by printing the start command and one
> sentence on where the projection math lives.
```

## Run it

```
cd showcase/expense-tracker
npm run dev
```

Open `http://localhost:3000`. The recipe defines port 3000 as the default; set `PORT=<port>`
in the environment to run on a different one (this was tested on port 3004).

## What you get

- `server.js`: plain `node:http` server, static file serving for `public/`, and a JSON API
  under `/api/` (`GET /api/state`, `POST /api/expenses`, `DELETE /api/expenses/:id`,
  `POST /api/limit`). No framework, no npm dependency.
- `lib/db.js`: `node:sqlite` (`DatabaseSync`) access layer: schema creation, one-time seed
  of 8 sample expenses, CRUD for expenses, get/set for the persisted monthly limit.
- `public/index.html` + `public/style.css`: dark theme (`#16150f` background, `#d97757`
  accent), one-hand phone layout with the entry form pinned near the top and large numbers.
- `public/app.js`: fetches `/api/state`, renders all five widgets, and re-renders from the
  JSON response after every add/delete/limit change with no page reload.
- Quick entry form: amount, category (Yeme-İçme, Ulaşım, Faturalar, Eğlence, Market, Diğer),
  optional note; Enter submits, the form clears, and focus returns to the amount field.
- Month view: this month's total, daily average, and the month-end projection.
- Category breakdown: horizontal bars with percentages, the largest category highlighted in
  the accent color.
- Monthly limit band: neutral below 80%, yellow (warning) at 80% or above, red once spending
  exceeds the limit. The limit is set through a small form and persists in SQLite.
- Last 10 expenses, newest first, each with a one-click delete.
- Server-side validation: amount must be a positive finite number, category must be one of
  the six allowed values; both failures return HTTP 400 with a Turkish error message.
- All user-facing text is Turkish; all code and comments are English.

## Verified

All checks below were run for real against a live server on port 3004 (`PORT=3004 node
server.js`, started detached with `setsid` so the whole process group could be killed
afterward), driving the JSON API with `curl`.

- [x] **Checklist 1**: `npm run dev` starts clean with seeded data, all five widgets
  populated. Confirmed via `GET /api/state`: 8 seeded expenses, month total 1705.5, category
  breakdown across all 6 categories, no errors in the server log.
- [x] **Checklist 2**: Adding an expense updates total, average, projection, bars and the
  list with no reload. Confirmed: `POST /api/expenses` with a 300 TL entertainment expense
  moved the total from 1705.5 to 2005.5, recomputed every category percentage, and returned
  the new expense first in the list, all in the same response the front end renders from.
- [x] **Checklist 3**: Limit band colors. Confirmed all three states by setting the limit
  via `POST /api/limit`: limit far above spending gave `status: neutral`; a limit chosen so
  spending sat at exactly 80% gave `status: warning`; adding more spend past that limit gave
  `status: exceeded`. Also confirmed the literal recipe scenario (limit set to 1000 with
  spending already above it) reports `exceeded`.
- [x] **Checklist 4**: Deleting an expense updates every number. Confirmed:
  `DELETE /api/expenses/:id` dropped the total by exactly the deleted amount and recomputed
  average, projection and the limit percentage in the same response.
- [x] **Checklist 5**: Negative amount rejected via curl. Confirmed:
  `curl -X POST /api/expenses -d '{"amount": -50, ...}'` returned HTTP 400 with
  `{"error":"Tutar pozitif bir sayi olmali."}`. Also spot-checked a zero amount (same error)
  and an invalid category (`{"error":"Gecerli bir kategori seciniz."}`).
- [x] **Persistence**: Captured state (total 2005.5, 9 expenses, limit 1000), sent
  `SIGTERM` to the server's process group, restarted `node server.js` against the same
  `cuzdan.sqlite` file, and re-fetched `/api/state`: identical total, count and limit came
  back with no re-seeding (seeding only runs when the expenses table is empty).
- [x] **Day-one division guard**: Live-tested on the first calendar day of the month
  (`daysElapsed: 1`); the projection computed cleanly (`average * daysInMonth`) with no
  `NaN`/`Infinity`. This also surfaced and fixed a real bug: the original seed used fixed
  wall-clock hours, which could land in the future relative to "now" on day one and outrank a
  genuinely new entry in newest-first order. Seeding now interpolates timestamps between the
  start of the current month and "now", so seeded rows are always in the past and always
  within the current month.
- [x] **Process cleanup**: After testing, the server's process group was killed with
  `kill -TERM -<PGID>`; `ps` and a `cwd`-based `pgrep` scan confirmed no `node server.js`
  process for this app was left running.

**Deviation from the recipe:** none in behavior. The one change made during testing was to
the seed data's timestamp generation (see "Day-one division guard" above): the recipe asks
for expenses "across several days," and the fix keeps that intent correct even on day one of
a month, while still spreading naturally across many days on any other day.

Start command: `npm run dev` (runs `node --watch server.js`, port 3000 by default). The
projection math (`average * daysInMonth`, where `average = spentSoFar / max(1, daysElapsed)`)
lives in the `buildState()` function in `server.js`.
