# Mega prompt · Neon Breaker (an arcade canvas Breakout, built by a team)

One shot, fully autonomous, and Claude Code does not build it alone: it forms a team of
sub-agents and runs them in parallel. Works in an empty folder, no data file needed. Paste the
block below AS-IS into a fresh Claude Code session.

---

> **You are the ORCHESTRATOR.** Drive this job from start to finish WITHOUT stopping for my
> confirmation at any point. First print a numbered plan (max 8 lines) so the room can follow
> on screen, then execute it. This runs live in front of an audience: narrate every step.
>
> STEP 1, PUBLISH THE CONTRACT before anyone writes a line: the file list, the port, the API
> routes with their JSON shapes, the shape of a level definition and of a round result. Print
> it on screen, then write it into `BUILD-LOG.md`. Parallel work fits only because of this.
>
> STEP 2, FORM THE TEAM, FOR REAL. Use your Agent tool to spawn three LEAD sub-agents and run
> them in parallel wherever their work is independent:
> - **Backend Lead**: `server.js`, the SQLite scores table, seeded demo scores, the leaderboard
>   API and its input validation.
> - **Frontend Lead**: `public/index.html`, `public/style.css`, `public/app.js`, the canvas
>   game loop, physics, power-ups, particles, sound, HUD and menus.
> - **QA Lead**: turns the checklist below into real checks, starts the server, plays in a
>   browser, hits the API with curl, reports pass or fail per item and fixes what fails. QA
>   hunts three bugs on purpose: tunneling, a stuck ball, leaderboard input abuse.
> A lead may spawn a worker or two. You do NOT write the app yourself: you integrate and
> run QA last.
>
> THE JOB: build "Neon Breaker", a canvas Breakout that feels like a real indie arcade release,
> not a school exercise: paddle physics with a feel, levels that speed up, power-ups raining
> down, particles, synthesized sound, and a leaderboard that survives a restart.
>
> THE STACK, non-negotiable, no build step and no framework:
> - ONE folder, created here, holding exactly: `package.json`, `server.js`, `public/`
>   (`index.html`, `style.css`, `app.js`), `data.sqlite`, `README.md`, `BUILD-LOG.md`.
> - `package.json` carries `"type": "module"` and a `start` script running `node server.js`.
> - `server.js`: Node 24, Express from npm, and the BUILT-IN `node:sqlite` module
>   (`import { DatabaseSync } from 'node:sqlite'`). Nothing native compiles on this machine.
> - `public/` is plain HTML, CSS and JavaScript, the play field on a `<canvas>`: no bundler, no
>   CSS framework, no game engine. Sound is synthesized with Web Audio, no audio files.
> - `data.sqlite` is created and seeded with demo scores on FIRST START; deleting it resets it.
> - The only two commands anyone ever types: `npm install`, then `node server.js`, serving
>   http://localhost:3000. `PORT=3001 node server.js` must override the port.
> - All user-facing UI text in TURKISH; code, comments, `README.md` and `BUILD-LOG.md` in
>   English.
>
> FEATURES, all required:
> 1. Paddle physics with feel: the bounce angle depends on WHERE the ball hits the paddle
>    (centre straight, edges up to 60 degrees), speed rises per level, collision is swept so a
>    fast ball never tunnels, and a flat horizontal loop is nudged back to a normal angle.
> 2. Five levels with distinct patterns and palettes, a speed ramp per level, and three brick
>    types: normal, two-hit, unbreakable.
> 3. Power-ups falling from broken bricks (çoklu top, geniş raket, yavaş top, ekstra can),
>    caught with the paddle, each showing a countdown chip in the HUD.
> 4. Juice: particle bursts on every break, a screen shake on a lost life, growing combo text.
> 5. Synthesized sound (paddle blip, brick tone pitched by row, chime, thud), mute toggle.
> 6. Neon HUD with lives, score and level, and a pause on Space or Esc: blurred overlay, frozen
>    game state, a 3-2-1 countdown on resume.
> 7. Leaderboard in SQLite (name, score, level, date), top 10, the fresh entry highlighted;
>    the POST validates the name and the score server-side.
> 8. Touch: the paddle follows the finger, a tap launches the ball, the canvas scales to 390px.
>
> ACCEPTANCE CHECKLIST, the QA Lead verifies each ON SCREEN or with curl and reports pass/fail:
> 1. `npm install` then `node server.js` start clean; http://localhost:3000 shows the start
>    screen with no console errors.
> 2. Level 1 can be cleared: the last brick breaks, level 2 loads with a different pattern, and
>    Space pauses mid-level with the ball frozen in place.
> 3. A power-up drops in level 1, is caught, shows a countdown chip, and visibly stops working
>    when the chip reaches zero.
> 4. Through a full level the ball never passes through a brick, nor leaves the play field.
> 5. `curl -s -X POST localhost:3000/api/scores -H 'content-type: application/json' -d
>    '{"name":"","score":-5}'` returns HTTP 400 with a Turkish message, and
>    `curl -s localhost:3000/api/scores` returns a valid top-10 JSON that survives a restart.
> 6. At 390px width with touch emulation, dragging moves the paddle and a tap launches the ball.
>
> DEFINITION OF DONE: every checklist item green; `README.md` with the product name, the two
> commands, the controls, the features and the team; `BUILD-LOG.md` with the plan, the team,
> the contract, the tests QA ran and every bug fixed. Close with the run command.

---

**Stage note:** while the team works, ask the room: "the physics worker and the HUD worker are
writing into the same app in the same second, so what stops them from colliding?" The answer is
the contract the orchestrator published first. When it finishes, run `npm install`, then
`node server.js`, open http://localhost:3000 and let an audience member play level 1 on the
projector and try to catch the first power-up. Fallback if the build stalls:
`cd showcase/neon-breaker` and `node server.js`.
