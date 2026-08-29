# Stage 5: build something real

On stage, the room votes for ONE of these. At home, do them all: each teaches a different
muscle. Every scenario has its ready starter prompt in `../../prompts/`.

## The build recipe (why every demo feels the same shape)

One prompt, one small but MODULAR full-stack app: `index.html` + CSS + JS on the front, a
tiny Node.js backend, SQLite for data, `npm run dev` to run. Simple enough to finish live,
modular enough to be honest engineering. Web work runs on Node.js; scientific/data work is
where Python shines: Claude Code picks the right tool if you say the goal.

## Scenario 1: write your own skill

Turn a chore YOU repeat into a skill (like the pdf-summarizer you installed): describe the
chore, let Claude draft the `SKILL.md`, refine, install, run. You write INSTRUCTIONS, not code.

## Scenario 2: connect a real integration

Wire the Stage 4 plugin/MCP path into a routine: "her sabah şu klasördeki yeni dosyaları
özetle", "şu servisten veriyi çek, tabloya dök". Value appears inside a real habit.

## Scenario 3: from idea to product

One sitting, one product on the recipe above: a weekly revenue report app with a chart, a
small signup form with a database, a personal tracker. Starter: `../../prompts/scenario-3.md`.

## Scenario 4: make a GAME

The crowd favorite. One prompt, one playable browser game (score, restart, a little juice),
same recipe (static front, tiny Node server). Starter: `../../prompts/scenario-4-game.md`.
Iterate out loud: "hızlandır", "skor tablosu ekle", "mobilde de oynansın".

## The rule that matters

Start SMALL, run `npm run dev`, verify every step, and let `CLAUDE.md` carry the rules you
find yourself repeating.
