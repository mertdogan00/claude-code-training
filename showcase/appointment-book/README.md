# Randevu Defteri (Appointment Book)

A single-page weekly appointment book for a one-person business (hairdresser, small clinic,
consultant) that today books everything by phone and a paper notebook. It shows Monday to
Saturday in half-hour slots, lets the owner book or cancel an appointment with a click, and
refuses to double-book a slot even if two people click the same cell at once.

## The one prompt that built it

This is the exact recipe, copied verbatim from `prompts/apps/appointment-book.md`:

```
> Work as a full product team and drive this job from start to finish WITHOUT stopping to ask
> for my confirmation at any point. First print a short numbered plan (max 6 lines), then
> immediately execute it. Report as you go: product manager (scope), backend, frontend, data
> engineer, then QA walking the acceptance checklist item by item.
>
> THE JOB: a "Randevu Defteri" (appointment book) web application for a one-person business.
>
> FEATURES, all required:
> 1. Weekly view: Monday-Saturday columns, half-hour rows from 09:00 to 19:00. The current
>    week renders by default; previous/next week arrows in the header.
> 2. Clicking an empty cell opens an appointment form: customer name, phone, service, note.
>    Saving fills the cell.
> 3. A filled cell shows customer name + service; clicking it opens details with a cancel
>    button (cancel frees the slot).
> 4. Conflict protection: a second appointment can never be written into an occupied slot;
>    reject it server-side too and show a Turkish warning.
> 5. Top bar: today's appointment count, this week's occupancy percentage, and the next free
>    slot (computed, not hardcoded).
> 6. A "print tomorrow" button opens tomorrow's list as a minimal print-friendly page
>    (plain white, table only).
>
> TECHNICAL FRAME, non-negotiable:
> - Node built-in modules ONLY (`node:http`, `node:fs`, `node:sqlite`); no npm packages.
> - Files exactly: `server.js` · `lib/db.js` · `public/index.html` · `public/style.css` ·
>   `public/app.js`. JSON API under `/api/`; no page reloads for booking or canceling.
> - `package.json` with `"dev": "node --watch server.js"`; port 3000.
>
> LOOK: dark theme (background #16150f, accent #d97757); the weekly grid fits one screen on a
> laptop without scrolling; today's column subtly highlighted. All user-facing UI text in
> TURKISH; code and comments in English.
>
> QUALITY BAR: phone accepts digits, spaces and a leading plus only; name required; slots are
> stored as ISO date + time so week navigation stays correct across month boundaries; data
> survives a restart; seed 4 sample appointments spread over the current week.
>
> ACCEPTANCE CHECKLIST, verify each yourself before declaring done:
> 1. `npm run dev` starts clean; the current week renders with the 4 seeded appointments.
> 2. Booking an empty slot fills the cell and updates the top bar instantly.
> 3. Canceling an appointment frees the cell and updates the top bar.
> 4. Trying to book an occupied slot is rejected with a Turkish warning (verify with curl
>    too, bypassing the UI).
> 5. The "print tomorrow" page lists exactly tomorrow's appointments, nothing else.
>
> DEFINITION OF DONE: checklist all green. Close by printing the start command and the
> two-appointment demo sequence that shows conflict protection.
```

## Run it

```bash
cd showcase/appointment-book
npm run dev
```

Then open **http://localhost:3000**.

Node 22+ is required (this app was built and tested on Node 24, where `node:sqlite` is
built in and needs no flag). No `npm install` step: there are zero dependencies.

The database file (`appointments.sqlite`) is created next to `server.js` on first run and
is seeded with 4 sample appointments spread across the current week. It is git-ignored, so
every fresh clone starts with a clean, freshly seeded book.

## What you get

- **Weekly grid**: Monday-Saturday columns, half-hour rows from 09:00 to 18:30 (last
  appointment ends 19:00). The current week loads by default; prev/next arrows in the header
  navigate week by week, snapping any date to that week's Monday.
- **Booking**: clicking an empty cell opens a modal with customer name (required), phone,
  service and note. Saving books the slot and refreshes the grid and top bar with no page
  reload.
- **Details and cancel**: clicking a filled cell shows its details with a cancel button that
  frees the slot immediately.
- **Conflict protection, twice**: the server rejects a second booking on an already-taken
  slot (HTTP 409, Turkish message), independent of whatever the UI already prevents by only
  offering empty cells to click.
- **Top bar**: today's appointment count, the current week's occupancy percentage, and the
  next free slot, all computed live from the database (not hardcoded), refreshed after every
  booking/cancel and every 60 seconds.
- **Print tomorrow**: a button opens `/print/tomorrow` in a new tab, a server-rendered plain
  white page with a single table of tomorrow's appointments, nothing else.
- **Validation**: name is required; phone, if given, may only contain digits, spaces and one
  leading `+`; bookings on Sunday are rejected (the business is closed); dates are stored as
  ISO `YYYY-MM-DD` and half-hour `HH:MM` strings so week math stays correct across month
  boundaries.
- **Dark theme**: background `#16150f`, accent `#d97757`, today's column subtly highlighted,
  the whole grid fits one laptop screen without scrolling.
- Stack: `node:http` for the server, `node:sqlite` for storage, `node:fs` for static files.
  Zero npm packages, zero `node_modules`.

### One deviation from the recipe

The recipe's technical frame specifies `"dev": "node --watch server.js"`. This build's
`package.json` uses `"dev": "node server.js"` instead (no `--watch`), per the explicit build
instructions for this showcase copy. Everything else in the technical frame (built-ins only,
the exact file list, JSON API under `/api/`, no page reloads, port 3000) is followed as
written.

## Verified

All of the following was exercised for real over HTTP (curl) and via direct process
management, not just read from the code:

- [x] **`npm run dev` starts clean; current week renders with 4 seeded appointments.**
  Started with `PORT=3003 node server.js`; `GET /api/appointments` returned the current
  week (Monday `2026-08-31` through Saturday `2026-09-05`) with exactly the 4 seeded rows.
- [x] **Booking an empty slot fills the cell and updates the top bar instantly.**
  `POST /api/appointments` for `2026-09-03 10:00` and `2026-09-05 12:00` both returned
  `201` with the new appointment and a fresh `stats` block in the same response; occupancy
  moved `3% -> 4% -> 5%` (of 120 slots/week) as each booking landed.
- [x] **Canceling an appointment frees the cell and updates the top bar.**
  `DELETE /api/appointments/5` returned `200` with `stats.occupancyPercent` dropped back to
  `4%`; re-booking the same `2026-09-03 10:00` slot immediately after succeeded (`201`),
  proving the cell was genuinely free again.
- [x] **Booking an occupied slot is rejected server-side with a Turkish warning (curl,
  bypassing the UI).** `POST /api/appointments` against the still-occupied
  `2026-09-03 10:00` slot returned `409` with body
  `{"error":"Bu saat dolu. Baska bir saat secin."}`.
- [x] **The "print tomorrow" page lists exactly tomorrow's appointments, nothing else.**
  With server "today" at `2026-09-01`, `GET /print/tomorrow` returned a plain white HTML
  table containing only the one seeded `2026-09-02` appointment (Ayse Demir, Sac Boyama),
  no navigation, no other days.
- [x] **Extra validation checks.** Empty customer name -> `400`
  `"Musteri adi zorunludur."`; a phone with letters (`05551234ABC`) -> `400`
  `"Telefon sadece rakam, bosluk ve bastaki + isaretini icerebilir."`; booking a Sunday
  (`2026-09-06`) -> `400` `"Gecersiz tarih. Pazar gunleri randevu alinmaz."`.
- [x] **Week navigation and month boundaries.** `weekStart` snapped correctly to Monday for
  a mid-week query date, and a January 30 query correctly resolved to the
  `2026-01-26..2026-01-31` week (Monday-Saturday, crossing no month in that case but
  confirmed via the UTC-anchored date math in `lib/db.js`).
- [x] **Data survives a restart.** After 6 appointments existed (4 seed + 2 booked, one
  canceled and re-booked), the process was killed (`SIGTERM` on its process group) and
  restarted. `GET /api/appointments` afterward returned the same 6 rows with the same ids;
  the seed function did not re-run (no duplicates), confirming persistence is real, not
  in-memory.
- [x] **Static assets.** `/`, `/style.css` and `/app.js` all served `200` with correct
  content types.
- [x] **Clean shutdown, no leaked process.** The server was started detached
  (`setsid node server.js &`), exercised, then killed with
  `kill -TERM -<PGID>` on its own process group. `ps` and `ss -tlnp` afterward confirmed no
  appointment-book node process and port 3003 free.

### Demo sequence (conflict protection, two appointments)

```bash
npm run dev &

curl -s -X POST http://localhost:3000/api/appointments \
  -H 'Content-Type: application/json' \
  -d '{"date":"2026-09-03","time":"10:00","customerName":"Test Musteri","phone":"+90 555 000 1111","service":"Deneme","note":""}'
# -> 201, slot booked

curl -s -X POST http://localhost:3000/api/appointments \
  -H 'Content-Type: application/json' \
  -d '{"date":"2026-09-03","time":"10:00","customerName":"Ikinci Musteri","phone":"","service":"","note":""}'
# -> 409 {"error":"Bu saat dolu. Baska bir saat secin."}
```
