# Application mega-prompts

A recipe here is a ONE-SHOT prompt: paste it as-is into a fresh Claude Code session and a whole
application is born from zero, with no approval pauses. The difference from an ordinary prompt
is what happens on screen next. Claude Code does not sit there typing files alone, it FORMS A
TEAM: it spawns lead sub-agents with its Agent tool, gives each one a scope, runs them in
parallel, then integrates their work and puts a QA lead over the result. Watching that unfold
is the lesson; the app is the souvenir.

## The shared skeleton

All three recipes are built the same way:

**autonomy clause** (print a plan, then run to the end, never stop for approval) then
**contract first** (the orchestrator publishes the file list, the port, the routes and the JSON
shapes BEFORE anyone writes code, which is the only reason parallel work fits together) then
**form the team, for real** (a Backend Lead, a Frontend Lead and a QA Lead spawned with the
Agent tool, each free to spawn a worker or two) then **the job** then **the stack** then
**6 to 8 numbered features** then **a 6-item acceptance checklist** the QA lead verifies on
screen or with curl, then **definition of done** (a `README.md` and a `BUILD-LOG.md` that
records the plan, the team, the contract, the tests and every bug fixed).

The stack is the same in all three, and it is deliberately small:

```
<app>/
  package.json     "type": "module", a start script running node server.js
  server.js        Node 24 + Express + the built-in node:sqlite (DatabaseSync)
  public/          plain HTML, CSS and JavaScript
  data.sqlite      created and seeded on first start; delete it to reset
  README.md        BUILD-LOG.md
```

Two commands, always the same two:

```bash
npm install
node server.js        # then open http://localhost:3000
```

`PORT=3001 node server.js` moves it to another port. Node 24 or newer, because `node:sqlite` is
built into it and nothing native has to compile.

| Recipe | What you get | Who it serves |
|---|---|---|
| [data-dashboard.md](data-dashboard.md) | **Satış Analitik Paneli**: KPI cards, revenue timeline, category donut, city bars, a searchable product table, server-computed insights, filters that drive every widget at once | anyone who reports numbers |
| [neon-breaker.md](neon-breaker.md) | **Neon Breaker**: a canvas Breakout with real paddle physics, five levels, falling power-ups, particles, synthesized sound and a leaderboard | fun, and game-loop logic |
| [qr-menu.md](qr-menu.md) | **QR Menü**: a phone-first restaurant menu plus an admin panel behind one password, sold-out toggles and real QR table cards | cafes, restaurants |

The `showcase/` folder holds the same three, already built by real agent teams: the code, a
`BUILD-LOG.md` of who did what, and screenshots. Use it as the stage fallback if a live build
stalls, and as proof of what each recipe produces.

## On training night

The room votes between the three above. Whichever wins, the follow-through is identical:

1. Open the winner's file on screen and copy everything between the two `---` lines.
2. In a terminal: `mkdir demo && cd demo && claude`, a virgin session.
3. Paste. Type nothing else: the prompt carries its own plan, autonomy, team and checklist.
4. While it builds, read the team narration out loud: who got spawned, what each lead is
   doing, what each one returned. That live org chart is the whole point of the stage.
5. When it finishes: `npm install`, then `node server.js`, then open http://localhost:3000.
6. Take one change request from the room and type it as a single sentence.

The two that lost the vote are the homework. Pick one TONIGHT, paste it, watch it, then change
one feature with a single follow-up sentence ("turn the donut into a bar chart", "add a third
ball power-up", "add a dessert category"). Editing a living app teaches more than starting one.
Read the `BUILD-LOG.md` the team leaves behind too: it names every agent, every test, every bug.

## Writing your own mega-prompt

Use the template: AUTONOMY (no approval stops) · CONTRACT (files, port, routes and shapes
published before anyone codes) · TEAM (leads spawned with the Agent tool, plus workers) · WHAT
(the job in one sentence) · STACK (one folder, `package.json`, `server.js`, `public/`, the two
commands) · FEATURES (6 to 8, numbered) · CHECKLIST (6 items, each verifiable on screen or with
curl) · DONE (the proof, plus the build log). The longer and more concrete the prompt, the
shorter the surprise at the end.
