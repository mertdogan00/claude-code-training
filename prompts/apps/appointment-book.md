# Mega prompt · Appointment Book (hairdresser / clinic / consultant)

One shot, fully autonomous. The daily pain of every small business that books by phone.
Paste the block below AS-IS into a fresh Claude Code session.

---

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

---

**Why this prompt works:** the conflict rule is stated twice (UI and server), the time model
is pinned (ISO dates), and the demo path is pre-scripted in the acceptance list. Ambiguity is
where one-shot builds die; this prompt leaves none.
