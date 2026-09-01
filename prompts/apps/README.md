# Application mega-prompts

Each file is a ONE-SHOT recipe: paste it as-is into a fresh Claude Code session and a whole
application is born from zero, with no approval pauses. Every recipe here is also already
built and tested under [`showcase/`](../../showcase/): open a recipe, then its folder there to
see exactly what the prompt produced. They all teach the same skeleton:

**autonomy clause** (plan first, then run to the end) → **team instruction** (product manager
→ backend → frontend → data → QA, roles reported separately on screen) → **the job** →
**technical frame** (Node built-ins + `node:sqlite`, zero npm packages, `npm run dev`) →
**numbered features** → **quality bar** → **acceptance checklist** → **definition of done**.

| Prompt | What you get | Who it serves |
|---|---|---|
| [data-dashboard.md](data-dashboard.md) | sales panel with analysis + insight box, from a CSV | anyone who reports numbers |
| [reflex-game.md](reflex-game.md) | browser game with a persistent leaderboard | fun + game-loop logic |
| [inventory-tracker.md](inventory-tracker.md) | stock ledger with critical-threshold alerts | shops, workshops, depots |
| [appointment-book.md](appointment-book.md) | weekly calendar with conflict protection | hairdressers, clinics, consultants |
| [expense-tracker.md](expense-tracker.md) | personal budget with month-end projection | students, household budgets |
| [qr-menu.md](qr-menu.md) | two-faced cafe menu (customer + admin panel) | cafes, restaurants |

## On training night: the vote, then this

The room votes between the FOUR candidates on the slide (dashboard, game, inventory,
appointments). Whichever wins, the follow-through is identical:

1. Open the winner's file above and copy everything between the two `---` lines.
2. In a terminal: `mkdir demo && cd demo && claude` (a virgin session; for the dashboard,
   start in the repo root instead so `data/sales-data.csv` is in reach).
3. Paste. Do not type anything else: the prompt carries its own plan, autonomy and checklist.
4. While it builds, read the role reports out loud; when it finishes, run the start command
   it prints and open the app in the browser.

The options that lost the vote, plus the two extras, are the homework: pick one TONIGHT,
paste it, watch it, then change one feature with a single follow-up sentence ("turn the chart
into a pie", "make the limit weekly"). Editing a living app teaches more than starting one.

## Writing your own mega-prompt

Use the template: WHAT (one-sentence job) · AUTONOMY (no approval stops) · TEAM (roles) ·
FRAME (files, tools) · FEATURES (numbered) · BAR (quality) · CHECKLIST (verifiable) · DONE
(the proof). The longer and more concrete the prompt, the shorter the surprise at the end.
