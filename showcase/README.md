# Showcase: the prompts, already built

Every app here was born from ONE mega-prompt in [`../prompts/apps/`](../prompts/apps/), run
end to end by Claude Code, then tested for real. This folder is the "output" half of the
repo's "prompt to output" story: open a recipe in `prompts/apps/`, then open the matching
folder here to see exactly what that one prompt produced.

Two reasons it exists:

1. **Proof you can browse.** Anyone who reads a recipe can see the finished result, run it,
   and read a `Verified` checklist of what was actually tested. No trust required.
2. **The stage fallback.** During the live build, if the room's chosen app takes too long or
   Claude Code stumbles, the presenter opens the matching folder here and runs it: "Claude
   Code already built this from that one prompt, here is the result."

## The six builds

| App | What it is | Recipe | Run |
|---|---|---|---|
| [data-dashboard](data-dashboard/) | Sales panel from a CSV: totals, daily chart, category bars, city table, a backend insight box | [data-dashboard.md](../prompts/apps/data-dashboard.md) | `cd showcase/data-dashboard && npm run dev` -> :3000 |
| [reflex-game](reflex-game/) | 30-second click-the-target game; the target shrinks and jumps; a persistent Top 5 leaderboard by name | [reflex-game.md](../prompts/apps/reflex-game.md) | `cd showcase/reflex-game && npm run dev` -> :3001 |
| [inventory-tracker](inventory-tracker/) | Stock ledger with critical-threshold alerts, a red order-now strip, and movement history | [inventory-tracker.md](../prompts/apps/inventory-tracker.md) | `cd showcase/inventory-tracker && npm run dev` -> :3000 |
| [appointment-book](appointment-book/) | Weekly Mon-Sat half-hour calendar; conflicts rejected server-side; occupancy bar; print tomorrow's list | [appointment-book.md](../prompts/apps/appointment-book.md) | `cd showcase/appointment-book && npm run dev` -> :3000 |
| [expense-tracker](expense-tracker/) | Personal budget: income and expenses, month-end projection, a three-band spending limit | [expense-tracker.md](../prompts/apps/expense-tracker.md) | `cd showcase/expense-tracker && npm run dev` -> :3000 |
| [qr-menu](qr-menu/) | Two-faced cafe menu: a customer view and an admin panel behind a login | [qr-menu.md](../prompts/apps/qr-menu.md) | `cd showcase/qr-menu && npm run dev` -> :3000 |

The first four are the ones the room votes on; the last two are the homework extras. All six
follow the same skeleton on purpose: a small modular Node app, data in SQLite, up with one
`npm run dev`.

## What they all share

- **Node built-ins only.** No npm packages, no `node_modules`. The one dependency is Node
  itself and its built-in `node:sqlite`, so a fresh clone runs with nothing to install.
- **Node 24 or newer recommended.** There `node:sqlite` is built in with no flag. On Node
  22.x add the flag: `node --experimental-sqlite server.js` (see `docs/setup/`).
- **Standalone.** Each folder runs on its own; nothing else in the repo needs to be present.
  The SQLite file is created on first start and is gitignored, so every clone starts fresh.
- **One port at a time.** Most default to port 3000 (reflex-game uses 3001); run them one at
  a time, or override with `PORT=3010 npm run dev` where noted in the app's own README.

Each app folder carries its own `README.md` with the exact prompt that built it, how to run
it, an honest feature list, and the `Verified` checklist.
