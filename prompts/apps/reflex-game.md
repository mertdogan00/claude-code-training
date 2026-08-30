# Mega prompt · Reflex Game (with a persistent leaderboard)

One shot, fully autonomous: works even in an empty folder. Paste the block below AS-IS into a
fresh Claude Code session and let it run to the end.

---

> Work as a full product team and drive this job from start to finish WITHOUT stopping to ask
> for my confirmation at any point. First print a short numbered plan (max 6 lines) so the
> audience can follow on screen, then immediately execute it. Report as you go: product
> manager (scope), game/frontend engineer (play loop), backend engineer (score service), data
> engineer (persistence), then QA walking the acceptance checklist item by item.
>
> THE JOB: a browser game called "Refleks" (reflex).
>
> GAMEPLAY, exact rules:
> - Pressing Start begins a 30-second round. A round circle target appears at a random
>   position inside the play area.
> - Clicking the target scores +1; the target then shrinks slightly (never below 24px) and
>   jumps to a new random position. Missing (clicking the background) does nothing.
> - A countdown and the live score sit in a top bar, large and readable from meters away.
> - When time runs out: an overlay asks for a player name, saves the score, and shows the
>   Top 5 leaderboard with the fresh entry highlighted. A "Play again" button starts a new
>   round without reloading the page.
>
> TECHNICAL FRAME, non-negotiable:
> - Node built-in modules ONLY (`node:http`, `node:fs`, `node:sqlite`); no npm packages.
> - Files exactly: `server.js` (serves static files + score API) · `public/index.html` ·
>   `public/style.css` · `public/game.js`. Scores persist in SQLite so a server restart
>   keeps the leaderboard.
> - API: `GET /api/scores` (top 5) and `POST /api/scores` (`{ "name": "...", "score": n }`).
> - `package.json` with `"dev": "node --watch server.js"`; port 3001.
>
> LOOK: dark theme (background #16150f, target #d97757); crosshair cursor over the play
> area; a small CSS-only hit animation on every successful click; the top bar numbers use a
> monospace font. All user-facing UI text in TURKISH; code and comments in English.
>
> QUALITY BAR: player name is trimmed to 12 characters, empty becomes "anon"; score must be
> a non-negative integer (validate server-side too); the same name may appear multiple
> times; no global variables leaking between rounds.
>
> ACCEPTANCE CHECKLIST, verify each yourself before declaring done:
> 1. `npm run dev` starts clean; http://localhost:3001 loads the start screen.
> 2. A full round is playable start to finish with the rules above.
> 3. `curl -s localhost:3001/api/scores` returns valid JSON.
> 4. Restarting the server keeps previously saved scores.
> 5. Posting `{ "name": "", "score": -5 }` is rejected with a Turkish error message.
>
> DEFINITION OF DONE: checklist all green. Close by printing the start command and a
> two-step "how to demo this" note (one command + one click).

---

**Stage note:** while Claude works, ask the room: "as the target shrinks, does the game get
easier or harder?" Let an audience member play the first round.
