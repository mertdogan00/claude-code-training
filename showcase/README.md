# Showcase: the prompts, already built by agent teams

Every app here was born from ONE mega-prompt in [`../prompts/apps/`](../prompts/apps/). Claude
Code read the recipe, formed a real team of sub-agents (a Backend Lead, a Frontend Lead and a
QA Lead, each free to spawn workers), published the contract first, built in parallel,
integrated the parts, and let QA try to break the result. Each folder keeps the evidence: the
code, a `BUILD-LOG.md` of the team at work (plan, roles, contract, tests, bugs found and
fixed), and screenshots. Open a recipe in `prompts/apps/`, then the matching folder here, to
see exactly what that one prompt produced.

## The three builds

| App | Product name and what it is | Recipe |
|---|---|---|
| [data-dashboard](data-dashboard/) | **Satış Analitik Paneli**, a sales dashboard over a CSV: KPI cards, charts, filters that drive every widget, server-computed insights and CSV import | [data-dashboard.md](../prompts/apps/data-dashboard.md) |
| [neon-breaker](neon-breaker/) | **Neon Breaker**, a canvas Breakout: real paddle physics, power-ups, particles, synthesized sound and a leaderboard | [neon-breaker.md](../prompts/apps/neon-breaker.md) |
| [qr-menu](qr-menu/) | **QR Menü**, a phone-first restaurant menu plus an admin panel, with real QR codes | [qr-menu.md](../prompts/apps/qr-menu.md) |

These three are exactly the ones the room votes on at Stop 5.

## Why this folder exists

1. **Proof you can browse.** Anyone who reads a recipe can see the finished product, read who
   did what in `BUILD-LOG.md`, run it, and check the `Verified` list. No trust required.
2. **The stage fallback.** If the live build takes too long or the network dies, the presenter
   opens the matching folder here and runs it: "a team of agents built this from that exact
   prompt, here is the result, and here is who did what."

## Run any of them

```bash
cd showcase/<app>
npm install       # once, needs internet
node server.js    # then open http://localhost:3000
```

`PORT=3001 node server.js` moves it to another port if 3000 is taken.

## What they all share

- **One folder, no build step.** `server.js` (Express on Node with the built-in `node:sqlite`,
  so nothing native compiles on your machine) serves both the API and `public/`, which is
  plain HTML, CSS and JavaScript. No bundler, no framework, no compile.
- **Node 24 or newer.** There `node:sqlite` needs no flag; on Node 22.x it sits behind
  `--experimental-sqlite` (see `docs/setup/`).
- **Standalone.** Each folder runs on its own. `data.sqlite` is created and seeded on first
  start and is gitignored, so every clone starts fresh, your data survives restarts, and
  deleting that one file resets the app.
- **One app at a time** on port 3000; use the `PORT` override above to run a second.
- **The team is on record.** `BUILD-LOG.md` in every folder tells the plan, the roles and
  their models, the contract, every test QA ran and every bug it caught.
- **Screenshots.** `screenshots/` in every folder shows the desktop and phone views.
- **Before a stage,** run `npm install` in all three ahead of time so the fallback starts in
  seconds without a network.

Each app folder's `README.md` carries the product name, the two commands, the features, the
team that built it, the screenshots and the `Verified` checklist.
