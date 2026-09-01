# Refleks (Reflex Game)

A browser reaction-time game: a shrinking circle target jumps around a play area for 30
seconds, every hit scores a point, and the round ends with a Turkish-language name prompt
and a persistent Top 5 leaderboard. Built with Node.js built-in modules only (`node:http`,
`node:fs`, `node:sqlite`), zero npm packages.

## The one prompt that built it

This is the exact mega-prompt from `prompts/apps/reflex-game.md`, copied verbatim from
between its two `---` fences:

```
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
```

## Run it

```
cd showcase/reflex-game
npm run dev
```

Then open **http://localhost:3001** in a browser. `npm run dev` runs `node --watch
server.js`, so editing any file under `public/` or `server.js` restarts the server
automatically. Scores are stored in `scores.sqlite` next to `server.js` (created on first
run, ignored by git).

## What you get

- `server.js`: a plain `node:http` server that serves `public/` as static files and exposes
  the score API, backed by `node:sqlite` (`DatabaseSync`).
- `public/index.html`, `public/style.css`, `public/game.js`: the game itself, dark theme
  (`#16150f` background, `#d97757` target), crosshair cursor over the play area, a CSS
  keyframe pulse on every successful hit, monospace top-bar numbers.
- 30-second rounds; the target starts at 64px, shrinks by 3px on every hit down to a 24px
  floor, and re-appears at a random position inside the play area on every hit.
- `GET /api/scores` returns the top 5 scores as JSON; `POST /api/scores` validates and
  inserts a new score.
- Player name is trimmed to 12 characters; an empty or missing name is stored as `anon`.
- Score is validated server-side as a non-negative integer; anything else is rejected with a
  400 response and a Turkish error message, independent of whatever the client sends.
- Round-end overlay: enter a name, save the score, see the Top 5 leaderboard with the just
  saved entry highlighted, then "Tekrar Oyna" (Play again) starts a brand-new round in place,
  no page reload, and no leftover state (score, timer, target size) from the previous round.
- All user-facing text is in Turkish; all code and comments are in English.

## Verified

Tested for real against a running server on port 3001, then the server was killed and
confirmed gone (see below):

- [x] `npm run dev` (`node --watch server.js`) starts clean, no errors in the log.
- [x] `GET /` returns HTTP 200 and serves the start screen (`<title>Refleks</title>`, a
      "Başla" button); `/style.css` and `/game.js` both return HTTP 200.
- [x] Full round playable start to finish, driven through an actual browser (Playwright):
      clicked Start, the target appeared and the 30s countdown ran; clicked the target
      repeatedly and confirmed the score incremented on every hit, the target shrank by 3px
      per hit down to (and never below) a 24px floor, and it re-positioned after every hit;
      clicked the background/play-area and confirmed the score did not change; let the timer
      run out naturally and confirmed the end overlay appeared with the final score frozen;
      entered a name, submitted, and confirmed the score was saved and the Top 5 leaderboard
      rendered sorted correctly with the fresh entry visually highlighted; clicked "Tekrar
      Oyna" and confirmed a new round started in place (no page navigation) with score reset
      to 0 and target size reset to 64px, i.e. no state leaked from the previous round.
      **Note:** this pass caught and fixed a real bug: the CSS class shared by both overlay
      screens (`.overlay { display: flex }`) overrode the browser's built-in `[hidden] {
      display: none }` rule, so the end-screen overlay stayed visible even while `hidden`.
      Fixed by adding an explicit `[hidden] { display: none !important; }` rule in
      `public/style.css`; re-tested after the fix and the round-end overlay now toggles
      correctly.
- [x] `curl -s localhost:3001/api/scores` returns valid JSON (parsed successfully; array of
      up to 5 `{ id, name, score }` objects sorted by score descending).
- [x] Restarting the server keeps previously saved scores: posted three scores, killed the
      server process, started it again, and `GET /api/scores` returned the identical set
      (SQLite file persisted on disk).
- [x] `POST /api/scores` with `{ "name": "", "score": -5 }` is rejected: HTTP 400 with body
      `{"error":"Skor, negatif olmayan bir tam sayi olmalidir."}` (Turkish). Also checked a
      valid score with an empty name, which is accepted and stored as `anon` (per the
      "empty becomes anon" rule, distinct from the negative-score rejection case), a
      non-integer score (rejected), and a missing score field (rejected).
- [x] Long names are trimmed to 12 characters server-side, verified with a 20-character name
      coming back as a 12-character name in the API response.
- [x] After all tests, the server process was terminated by its exact process group id
      (`kill -TERM -<pgid>`) and confirmed gone from `ps`/`ss` with the port free; no
      leftover `node server.js` process for this app was left running.

### How to demo this

1. `cd showcase/reflex-game && npm run dev`
2. Open http://localhost:3001 and click "Başla".
