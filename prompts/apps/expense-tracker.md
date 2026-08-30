# Mega prompt · Personal Expense Tracker

One shot, fully autonomous. The classic first personal tool: student budgets and household
money. Paste the block below AS-IS into a fresh Claude Code session.

---

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

---

**Why this prompt works:** the projection formula, the 80% rule and the seeding are all
spelled out. Numbers-heavy apps fail on vague math; this prompt does the math in advance.
