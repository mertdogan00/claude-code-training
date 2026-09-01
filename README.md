# Claude Code Training

Hands-on companion repository for the **Claude Code training** (Sept 2, 2026, Orion Tekmer,
Ankara) by [Mert Doğan](https://github.com/mertdogan00), co-founder of Framepx.

You do NOT need to know how to code. This repo is the exact workspace used on stage: clone
it, step into a stage folder, and let Claude Code do the typing while you do the thinking.

## Quickstart

```bash
# 0. install Node 24 or newer from https://nodejs.org (details per OS in docs/setup/)
# 1. install Claude Code
npm install -g @anthropic-ai/claude-code

# 2. clone this repo and enter it
git clone https://github.com/mertdogan00/claude-code-training.git
cd claude-code-training

# 3. start
claude
```

You need **Node 24 or newer** plus **Claude Code** itself; that is the whole toolbox. A
Claude **Pro** plan or higher is the simplest way in; pay-as-you-go API billing also works
(see [pricing](https://claude.com/pricing)). The demo apps under `showcase/` need one
`npm install` each and nothing else; see `docs/setup/`.

## The five stops

The training is one journey with five stops. Stop 1 is talk only; from stop 2 on, every
stop has a folder in this repo that you can redo at home:

| Stop | On stage | In this repo |
|---|---|---|
| 1 · Big Picture | where AI came from, why Claude Code | (talk only) |
| 2 · Setup | terminal basics, Git and GitHub, install on 3 systems, first launch | `docs/setup/` + `exercises/stage-2-hello/` |
| 3 · Core Concepts | prompt, token, context, CLAUDE.md, commands, live before/after | `exercises/stage-3-context/` + `commands.md` |
| 4 · Extending | skills, plugins, MCP | `exercises/stage-4-extend/` + `skills/` |
| 5 · Live Build | the room votes between Satış Analitik Paneli, Neon Breaker and QR Menü, one prompt forms a team of agents, an app is born and runs with `node server.js` | `exercises/stage-5-build/` + `prompts/apps/` (built: `showcase/`) |

## Map

| Path | What it is |
|---|---|
| `PRESENTER.md` | the stage navigation script: which file, which command, at which moment |
| `CLAUDE.md` | the project memory: how Claude behaves in THIS repo (annotated as a teaching example) |
| `docs/setup/` | install guides: macOS · Windows · Linux |
| `exercises/` | four folders, one per hands-on stage: `stage-2-hello/`, `stage-3-context/`, `stage-4-extend/`, `stage-5-build/`, each with its own README |
| `prompts/` | ready-to-paste prompt library |
| `prompts/apps/` | THREE team-forming mega-prompts: each one makes Claude Code spawn lead and worker sub-agents, publish a contract first and run QA last (Satış Analitik Paneli, Neon Breaker, QR Menü). One simple stack: one folder, Express, the built-in `node:sqlite`, plain HTML, CSS and JavaScript, no build step |
| `showcase/` | the SAME three prompts, already built by real agent teams: the code, a BUILD-LOG.md of the team at work, screenshots; `npm install` then `node server.js` |
| `data/` | sample sales CSV the dashboard prompt reads |
| `skills/` | FOUR finished skills with scripts and templates (`skills/README.md` has the picker) |
| `commands.md` | the command card: terminal basics + the 15 slash commands in three tiers |
| `resources.md` | official links: docs, marketplaces, MCP, models |
| `after-training.md` | your path after the event: what to build first |

## How to use this repo after the training

1. Read `CLAUDE.md` (it is short, and it is the whole trick).
2. Redo `exercises/stage-2-hello/`, then `exercises/stage-3-context/`, on your own machine.
   Feel the CLAUDE.md difference once more, on your own screen.
3. Install a skill from `skills/` (`skills/README.md`) and run it on a real file.
4. Paste ONE mega-prompt from `prompts/apps/` and watch Claude Code form a team and a whole
   app get born; run it with `npm install` then `node server.js` and open
   http://localhost:3000; then change one feature with a single follow-up sentence. (Or
   browse `showcase/` for the same three, already built by agent teams, each with its
   BUILD-LOG.md and screenshots.)

Start small, grow it one piece at a time.
