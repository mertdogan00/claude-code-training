# Presenter flow: which file, which command, at which moment

The stage script. Each hands-on moment in the deck has a row here; the slide tells the room
WHAT is happening, this file tells the presenter exactly WHERE to go and WHAT to type.
Before doors: `git -C claude-code-training pull`, log terminal font up, phone on the same
network for the remote-control demo.

## Stop 2 · Setup

| Deck moment | Do this |
|---|---|
| Install slide (3 systems) | nothing to run live; point at `docs/setup/` |
| "First launch" terminal frame | in an empty folder: `claude` → let the welcome screen sit on screen; type `/help`, scroll it slowly |
| Two-engines frame (Node + Python) | run `node -v` and `python3 --version` live, read both versions out loud; point people at `docs/setup/` ("the demos and skill scripts need these, Claude Code itself does not") |
| Remote control demo | phone: open the Claude app, connect to this machine, send one small task |

## Stop 3 · Core Concepts

| Deck moment | Do this |
|---|---|
| CLAUDE.md before/after | `cd exercises/stage-3-context` → `claude` → paste: `Create a one-week meal plan from the menu.txt file in this folder.` → show the plain answer → open `CLAUDE.md`, read the 3 rules aloud → `/clear` → paste the SAME sentence → the answer is now a Turkish table with a budget line |
| Command card slide | live-type the Tier 1 five in the open session: `/help`, `/context`, `/compact` are safe to show instantly |
| Model ladder | `/model` → show the picker, close it |

## Stop 4 · Extending

| Deck moment | Do this |
|---|---|
| Skill install | repo root, inside Claude Code: `Install skills/pdf-summarizer into this project as a skill.` → type `/` → it is in the list → run `/pdf-summarizer` on any PDF in Downloads |
| Plugin install | `/plugin` → Discover tab → pick whatever lands well tonight → install → type `/` again |
| MCP connect | in the terminal: `claude mcp add --transport sse cloudflare-docs https://docs.mcp.cloudflare.com/sse` → new session → ask: `How do I set up a cron trigger for a Cloudflare Worker? Answer from the live docs.` → point at the tool calls. Backups if wifi hates SSE: Context7 or DeepWiki, commands in `exercises/stage-4-extend/mcp.md` |

## Stop 5 · Live Build

| Deck moment | Do this |
|---|---|
| The vote | hands up per option, count out loud, announce the winner |
| Recipe frame of the winner | open `prompts/apps/<winner>.md` on screen, scroll it slowly: point at the autonomy clause, the file tree, the checklist |
| The build | `mkdir demo && cd demo && claude` (dashboard: repo root instead) → paste everything between the `---` lines → do NOT type anything else |
| While it builds | read the role reports aloud; ask the room the stage-note question in the prompt file |
| The reveal | run the start command Claude prints → browser → let the room direct one change ("make the target faster") |

## Pocket answers

- The live build fails, drags, or the wifi dies mid-build: open `showcase/<winner>/`, run
  `npm run dev`, and show the finished app. "Claude Code built this from that exact prompt,
  here is the result." All six candidates are pre-built and tested under `showcase/`.
- Wifi dies during MCP: show `exercises/stage-4-extend/mcp.md` and narrate it; the skill and
  plugin demos work offline.
- The build stalls on a question it should not ask: reply `continue as planned, no more
  confirmations` and tighten the prompt file tomorrow.
- Someone asks "can it see my files?": `/permissions` on screen is the honest answer.
