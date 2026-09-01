# Stage 5: the big build

The finale. ONE complete application, born from ONE prompt, on stage, from zero. The room votes
between three candidates; the winner's mega-prompt goes on screen and gets pasted into a virgin
Claude Code session. Nobody types a second sentence after that.

## The vote menu (full recipes in `../../prompts/apps/`)

1. **Satış Analitik Paneli** ([data-dashboard.md](../../prompts/apps/data-dashboard.md)):
   a sales dashboard over a CSV, with KPIs, charts, filters and server-computed insights.
   Wow: a column of numbers becomes a live board in minutes.
2. **Neon Breaker** ([neon-breaker.md](../../prompts/apps/neon-breaker.md)): a canvas Breakout
   with real paddle physics, five levels, power-ups, particles, sound and a leaderboard.
   Wow: a real game, on stage, out of one prompt.
3. **QR Menü** ([qr-menu.md](../../prompts/apps/qr-menu.md)): a phone-first restaurant menu
   plus an admin panel, with real QR codes.
   Wow: the room scans the QR from their own phones.

## The build, step by step

1. Hands up, count the votes, declare a winner.
2. Open the winner's recipe on screen so everyone sees what is about to be pasted.
3. In a terminal: `mkdir demo && cd demo && claude`.
4. Copy everything between the two `---` lines in the recipe and paste it in.
5. Type nothing else. The prompt carries its own plan, its autonomy clause and its acceptance
   checklist, so it runs to the end without waiting for approval.

## What to watch while it builds

Every recipe makes Claude Code FORM A TEAM with its Agent tool: a Backend Lead, a Frontend Lead
and a QA Lead, each free to spawn a worker or two, all working against a contract the
orchestrator publishes BEFORE anyone writes a line. Read the narration out loud as it scrolls:
who got spawned, what each one is building, what each one returned, which bug QA caught. That
live org chart is the real lesson, the app is the souvenir. Good question for the room while it
runs: three agents write at the same time, so who keeps the frontend and the backend fitting
together? The answer is on screen: the contract.

## The reveal

```bash
npm install
node server.js        # then open http://localhost:3000
```

Show it, then take ONE change request from the audience and type it as a single sentence.

## Fallback

If the live build stalls, the same app is already in the repo, built by a real agent team from
the same prompt:

```bash
cd showcase/<winner>
node server.js        # npm install was done before doors
```

Show the app, then open its `BUILD-LOG.md`: the plan, the team, the contract, the tests, the
bugs. Same proof, no suspense.

## At home

The two that lost the vote are your homework. Pick one tonight, paste it into an empty folder,
watch the team form, then change one feature with a single follow-up sentence ("turn the donut
into a bar chart", "add a third ball power-up"). Editing a living app teaches more than
starting one. Read the `BUILD-LOG.md` afterwards: it names every agent, every test, every bug.
Writing your own recipe? The template is at the bottom of
[`prompts/apps/README.md`](../../prompts/apps/README.md).
