# BUILD-LOG: Neon Breaker

How a team of sub-agents built this app in one pass, from one pasted prompt.
Recipe: `prompts/apps/neon-breaker.md`.

## 1. The plan the orchestrator printed first

1. Publish the CONTRACT (file list, port, API routes with their JSON shapes, the level definition
   shape, the round result shape) and write it into BUILD-LOG.md.
2. Scaffold `package.json` from the contract and install Express once, so every lead shares one
   dependency tree instead of racing on `npm install`.
3. Spawn Backend Lead and Frontend Lead in parallel; their file sets do not overlap.
4. Integrate, boot the server, fix wiring gaps.
5. Spawn QA Lead: turn the acceptance checklist into real checks, curl the API, drive a headless
   browser, hunt three bugs on purpose (tunneling, stuck ball, leaderboard input abuse).
6. Apply the QA fixes and take the screenshots.
7. Write README.md and close BUILD-LOG.md.
8. Clean check: wipe `node_modules`, reinstall, boot, verify HTTP 200 and a JSON API route, kill.

## 2. The team

| role | owns | model | effort |
|---|---|---|---|
| Orchestrator | the contract, integration, judgement, screenshots, README, this log | Opus 5 | high |
| Backend Lead | `server.js`, the SQLite schema, the seed, the leaderboard API, validation | Sonnet | medium |
| Frontend Lead | `public/index.html`, `public/style.css`, `public/app.js`, the whole canvas game | Sonnet | medium |
| QA Lead | the 6-item acceptance checklist, curl checks, browser play, the bug hunt and the fixes | Sonnet | medium |

Leads were free to spawn a worker or two of their own (Sonnet, low or medium effort). The
orchestrator wrote no game code: it published the contract, integrated, judged and reported.

## 3. THE CONTRACT (published before anyone wrote a line)

Parallel work only fits because this was fixed up front. Both leads were handed this text.

### 3.1 File list and ownership

```
showcase/neon-breaker/
  package.json     orchestrator (fixed by the contract)   "type":"module", start = node server.js
  server.js        Backend Lead
  public/index.html  Frontend Lead
  public/style.css   Frontend Lead
  public/app.js      Frontend Lead
  data.sqlite      created and seeded by server.js on first start; gitignored
  README.md        orchestrator
  BUILD-LOG.md     orchestrator
  screenshots/     orchestrator
```

No lead touches a file it does not own. Node 24, Express from npm, built-in `node:sqlite`
(`import { DatabaseSync } from 'node:sqlite'`). No bundler, no framework, no game engine, no
audio files. UI text in Turkish; code, comments and docs in English.

### 3.2 Port

```js
const PORT = Number(process.env.PORT) || 3000;
```

`node server.js` serves http://localhost:3000. `PORT=3001 node server.js` overrides it.

### 3.3 API routes and JSON shapes

All responses are JSON and all carry `ok`.

`GET /api/health`

```json
{ "ok": true, "name": "Neon Breaker", "levels": 5, "scores": 12 }
```

`GET /api/levels`

```json
{ "ok": true, "levels": [ /* LevelDef, five of them, index 1..5 */ ] }
```

`GET /api/scores?limit=10` (limit clamped to 1..50, default 10)

```json
{ "ok": true, "scores": [
  { "id": 7, "name": "ZEYNEP", "score": 9120, "level": 4, "created_at": "2026-08-30T18:22:11.000Z" }
] }
```

`POST /api/scores`, body = a RoundResult, success 201:

```json
{ "ok": true,
  "entry": { "id": 13, "name": "AYSE", "score": 8450, "level": 3, "created_at": "..." },
  "rank": 2,
  "top": [ /* the new top 10, same entry shape */ ] }
```

`POST /api/scores` failure 400:

```json
{ "ok": false, "error": "Isim 1 ile 12 karakter arasinda olmali." }
```

(the real message carries proper Turkish characters). Unknown `/api/*` route: 404
`{ "ok": false, "error": "..." }`.

### 3.4 Shape of a level definition (LevelDef)

```json
{
  "index": 1,
  "name": "Baslangic",
  "palette": { "bg": "#070312", "grid": "#1b1140",
               "brick": ["#ff2d95", "#00e6ff", "#7cff5a", "#ffd23f"],
               "accent": "#00e6ff" },
  "ballSpeed": 5.0,
  "paddleWidth": 120,
  "rows": 6,
  "cols": 11,
  "grid": ["...........", "..nnnnnnn..", "..ntnnntn..", "...........", "...........", "..........."]
}
```

`grid` is exactly `rows` strings of exactly `cols` characters.
`.` empty, `n` normal (one hit), `t` two-hit, `x` unbreakable.
`ballSpeed` is the level's base ball speed in pixels per frame at 60fps on the 880x620 logical
play field. The server owns the five levels and serves them at `/api/levels`; the client keeps a
tiny generated fallback so a failed fetch never blanks the screen.

### 3.5 Shape of a round result (RoundResult, the POST body)

```json
{ "name": "AYSE", "score": 8450, "level": 3 }
```

Server-side validation, all messages Turkish:

- `name`: string, trimmed, 1 to 12 characters after trimming, control characters and angle
  brackets stripped, uppercased. Anything else: 400.
- `score`: an integer, 0 to 10000000. Not a number, a float, negative or absurd: 400.
- `level`: an integer, 1 to 5. Missing defaults to 1; out of range: 400.
- Body larger than 4KB or not JSON: 400.

### 3.6 Logical play field

The canvas is 880x620 logical pixels and is scaled with CSS to fit the viewport, down to a 390px
wide phone. All physics runs in logical pixels so the game behaves identically at every size.

### 3.7 Test hooks the client must expose (so QA can verify, not guess)

The game exposes a small debug surface on `window.NB`, and honours two URL query parameters. This
is what turns the acceptance checklist into real checks instead of eyeballing.

```
window.NB.state            live game state: phase, level, lives, score, combo, balls[], bricks[],
                           powerups[], activePowerUps[] with their remaining seconds, muted
window.NB.start()          leave the menu and start a run
window.NB.goToLevel(n)     jump straight to level n (1..5)
window.NB.clearBricks()    break every breakable brick of the current level at once
window.NB.dropPowerUp(t)   spawn a power-up of type t at the ball ('multi'|'wide'|'slow'|'life')
window.NB.togglePause()    same effect as Space
window.NB.stepPhysics(n)   advance the simulation n fixed steps with no rendering (headless test)

?autoplay=1                skip the menu, start level 1, and let an autopilot paddle track the
                           ball, so a screenshot or a headless run shows a live play frame
?level=N                   start on level N (implies autoplay)
```

## 4. How the team actually ran

The orchestrator published the contract above, scaffolded `package.json` and installed Express
once (so three agents could not race on the same `node_modules`), then spawned the leads.

- **Round 1, in parallel.** Backend Lead wrote `server.js` (320 lines). Frontend Lead wrote
  `public/index.html`, `public/style.css` and `public/app.js` (1105 lines). Their file sets do
  not overlap, so neither ever blocked on the other. The Frontend Lead could start before
  `server.js` existed because the contract fixed the level shape and required a local fallback.
- **Integration review.** The orchestrator booted the result on port 3001, hit the API with curl,
  and took three headless screenshots (desktop menu, `?autoplay=1` mid-play, 390px phone). Four
  defects came out of that review, listed in section 5.
- **Round 2, in parallel.** Each lead got its own defect list, still on disjoint files: Backend
  Lead on `server.js` only, Frontend Lead on `public/` only.
- **QA Lead, last and alone.** With nobody else editing, QA could fix anything. It turned the
  six acceptance items into real checks driven through the `window.NB` hooks, ran the three
  deliberate bug hunts, and spawned a worker of its own for the API abuse matrix.
- **Final judgement.** The orchestrator re-verified every claim independently rather than
  trusting the reports, then wrote the docs and ran the clean check.

## 5. Bugs found and fixed

### From the orchestrator's integration review (round 2)

1. **Every Turkish string was ASCII-folded.** `Baslangic`, `Basla`, `Siralama`,
   `Isim 1 ile 12 karakter arasinda olmali.` and roughly sixty others shipped without Turkish
   characters, in both `server.js` and `public/`. For a Turkish-speaking room reading a projector
   this is a product defect, not a nitpick. Fixed in both files; the level names now come back
   from the API as `['Başlangıç', 'Piramit', 'Kale', 'Kalp Atışı', 'Son Kale']`, and the seeded
   demo names are correct too (`İREM`, `DENİZ`, `AYŞE`, `BARIŞ`).
2. **`?autoplay=1` never launched the ball.** The mid-play screenshot showed the ball parked on
   the paddle with a score of 0, because the launch hung off a timer that a short headless run
   never reached. Fixed with a synchronous warm-up that advances the simulation 200 physics ticks
   before the first rendered frame, on start and on every level load. The frame now shows the
   ball in flight, broken bricks and a non-zero score.
3. **The AudioContext was constructed on page load**, so every fresh load logged
   "The AudioContext was not allowed to start...". It is now created lazily on the first real
   user gesture (the Başla click, mousedown, touchstart or Space) and never in autoplay mode.
   A fresh load produces no console output at all.
4. **The play field looked flat and empty on a projector.** Bricks were plain rectangles, the
   menu sat on an empty black canvas, and level 1's 21 bricks left most of the field bare. Fixed:
   rounded bricks with a top bevel and a neon `shadowBlur`, cracked-and-dimmed two-hit bricks,
   metal-gradient unbreakable bricks, an ambient backdrop behind the menu (grid, drifting glow,
   idle bricks, a slow demo ball), a brighter ball core with a 14 frame trail, a gradient paddle,
   a proper arcade HUD, and a taller brick field so the play area reads as composed.

### From the QA Lead

5. **The play HUD was visible behind the start menu** (three life icons, a score of 0 and the SES
   button), because `setScreen()` never managed HUD visibility. `#hud` now starts hidden and
   `setScreen()` shows it only during play, pause and the level transition.

### The three deliberate bug hunts

- **Tunneling: not found.** `sweptCircleRect` resolves the earliest contact along the frame's
  travel segment, and `substeps = ceil(travel / (r * 0.5))` keeps every sub-step to at most half
  a ball radius. QA ran 5000 steps at level 5 speed and again at roughly 5.7 times that speed
  with zero boundary or brick skips. The orchestrator re-ran 6000 steps on level 5 and logged
  0 escapes and 0 bricks broken while the ball was nowhere near them. Note that the engine
  renormalises the ball speed every frame, so an over-speed ball cannot be injected from outside:
  the speed is bounded by design, which is itself part of why tunneling cannot happen.
- **Stuck ball: not found, and the guard was proven to fire.** QA forced a near-horizontal loop
  and watched the nudge lift `vy` from 0.096 to 1.78 on frame 40, and a near-vertical loop lift
  `vx` from 0.096 to 1.38 on frame 60. The mechanism works rather than merely existing.
- **Leaderboard input abuse: not found.** A 20 case matrix (empty body, malformed body, a 100KB
  body, `name` as a number, array, object, null, 200 characters, only spaces, `<script>`, control
  characters; `score` as a string, float, NaN, Infinity, negative, 1e30; `level` 0 and 99)
  returned 400 with a Turkish JSON message every time. Unknown extra fields are ignored rather
  than rejected: a body that is otherwise valid but also carries `__proto__` is accepted as a
  normal 201 and pollutes nothing, because only `name`, `score` and `level` are ever read. No
  500, no HTML, no stack trace, and nothing dirty reached the table.

### One fix the orchestrator made itself

6. **`NB.state` did not expose the paddle**, so the documented debug hook could not answer
   "did the Geniş Raket power-up actually widen the paddle". Since section 3.7 of the contract is
   the orchestrator's own surface, it added the one missing line
   (`paddle: { x, y: PADDLE_Y, w, h }`) rather than send the file back. That is the only app-code
   line the orchestrator wrote. With it, the power-up check became a measurement: 130 to 195 with
   the chip at 6.1 seconds, back to 130 the moment it expired.

## 6. The tests QA ran

Driven through the `window.NB` hooks in a headless Chromium and with curl against port 3021:

| # | check | how it was proven |
|---|---|---|
| 1 | clean start, no console errors | headless console log array was empty; `window.NB` present |
| 2 | level 1 clears, level 2 differs, Space freezes the ball | `NB.clearBricks()` moved `state.level` 1 to 2 with a different grid; the ball's `x, y, vx, vy` were byte-identical across a 1.5s pause and moved again after the 3-2-1 resume |
| 3 | a power-up is caught, counts down, and stops | Geniş Raket: paddle 130, 195, 130; Yavaş Top: measured speed ratio exactly 0.6 while active, `activePowerUps` empty after |
| 4 | no tunneling, no escape | 5000 steps at level 5 speed and at roughly 5.7 times it: 0 out-of-field samples, 0 bricks broken with the ball more than 30px away |
| 5 | bad POST is 400 in Turkish; the top 10 survives a restart | `{"ok":false,"error":"İsim 1 ile 12 karakter arasında olmalı."}` with HTTP 400; the server was really killed and restarted and the posted entry was still ranked first |
| 6 | touch drag and tap at 390px | a `touchstart` to `touchmove` drag moved the paddle from 375 to 627 px and the same touch set `launched: true` |

The orchestrator then re-ran items 1 to 5 independently over the DevTools protocol and with curl,
plus a wider validation sweep (empty name, negative score, `<script>` name, level 99, a non-JSON
body, an unknown `/api` route). Every result matched.

## 7. Definition of done

- `npm install` then `node server.js` serves the game on http://localhost:3000. Confirmed.
- All six acceptance items pass. Confirmed twice, by QA and by the orchestrator.
- `README.md` carries the product name, the two commands, the controls, the features, the team
  and the Verified checklist. `BUILD-LOG.md` is this file.
- Clean-room check: `node_modules` deleted, `npm install --no-audit --no-fund` from scratch,
  server started on port 3001, `/` answered HTTP 200 and `/api/health` answered JSON, then the
  process group was killed and the port confirmed free.

Run it with:

```bash
npm install
node server.js
```
