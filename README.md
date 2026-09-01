# Claude Code Training

Hands-on companion repository for the **Claude Code training** (Sept 2, 2026, Orion Tekmer,
Ankara) by [Mert Doğan](https://github.com/mertdogan00), co-founder of Framepx.

You do NOT need to know how to code. This repo is the exact workspace used on stage: clone
it, step into a stage folder, and let Claude Code do the typing while you do the thinking.

## Quickstart

```bash
# 1. install Claude Code (details per OS in docs/setup/)
npm install -g @anthropic-ai/claude-code

# 2. clone this repo and enter it
git clone https://github.com/mertdogan00/claude-code-training.git
cd claude-code-training

# 3. start
claude
```

A Claude **Pro** plan or higher is required to use Claude Code
(see [pricing](https://claude.com/pricing)).

## The five stops

The training is one journey with five stops. Stops 1 and 2 happen on stage (the big
picture, then installing); the repo picks you up from stop 2 onward:

| Stop | On stage | In this repo |
|---|---|---|
| 1 · Big Picture | where AI came from, why Claude Code | (talk only) |
| 2 · Setup | terminal basics, Git and GitHub, install on 3 systems | `docs/setup/` |
| 3 · Core Concepts | prompt, context, CLAUDE.md, commands, live before/after | `exercises/stage-3-context/` + `commands.md` |
| 4 · Extending | skills, plugins, MCP | `exercises/stage-4-extend/` + `skills/` |
| 5 · Live Build | the room votes, one app is born from one prompt | `exercises/stage-5-build/` + `prompts/apps/` (built: `showcase/`) |

## Map

| Path | What it is |
|---|---|
| `PRESENTER.md` | the stage navigation script: which file, which command, at which moment |
| `CLAUDE.md` | the project memory: how Claude behaves in THIS repo (annotated as a teaching example) |
| `docs/setup/` | install guides: macOS · Windows · Linux |
| `exercises/` | one folder per training stage, each with its own README |
| `prompts/` | ready-to-paste prompt library |
| `prompts/apps/` | SIX one-shot autonomous mega-prompts (dashboard, game, inventory, appointments, budget, QR menu) |
| `showcase/` | the SAME six prompts, already built and tested: the runnable output of each recipe |
| `data/` | sample sales CSV the dashboard prompt reads |
| `skills/` | FOUR finished skills with scripts and templates (`skills/README.md` has the picker) |
| `commands.md` | the command card: terminal basics + the 15 slash commands in three tiers |
| `resources.md` | official links: docs, marketplaces, MCP, models |
| `after-training.md` | your path after the event: what to build first |

## How to use this repo after the training

1. Read `CLAUDE.md` (it is short, and it is the whole trick).
2. Redo `exercises/stage-3-context/` on your own machine.
3. Install a skill from `skills/` (`skills/README.md`) and run it on a real file.
4. Paste ONE mega-prompt from `prompts/apps/` and watch a whole app get born; then change
   one feature with a single follow-up sentence. (Or browse `showcase/` to see each of those
   six prompts already built and running.)

Start small, grow it one piece at a time.
