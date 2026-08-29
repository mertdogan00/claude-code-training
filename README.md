# Claude Code Training

Hands-on companion repository for the **Claude Code training** (Sept 2, 2026, Orion Tekmer,
Ankara) by [Mert Doğan](https://github.com/mertdogan00), co-founder of Framepx.

You do NOT need to know how to code. This repo is the exact workspace used on stage: clone it,
step into a stage folder, and let Claude Code do the typing while you do the thinking.

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

## Map

| Path | What it is |
|---|---|
| `CLAUDE.md` | the project memory: how Claude behaves in THIS repo (annotated as a teaching example) |
| `docs/setup/` | install guides: macOS · Windows · Linux |
| `exercises/stage-3-context/` | feel what context and CLAUDE.md change: the before/after exercise |
| `exercises/stage-4-extend/` | skills, plugins and MCP: extend Claude Code hands-on |
| `exercises/stage-5-build/` | the finale: three build scenarios (the room votes on stage) |
| `prompts/` | ready-to-paste Turkish prompts used in the training |
| `skills/` | a finished example skill to read, install and run |
| `commands.md` | the cheat sheet: every command used on stage |
| `resources.md` | official links: docs, plugin marketplace, MCP, models |
| `after-training.md` | your path after the event: what to build first |

## How to use this repo after the training

1. Read `CLAUDE.md` (it is short, and it is the whole trick).
2. Redo `exercises/stage-3-context/` on your own machine.
3. Install the skill in `skills/pdf-summarizer/` and run it on a real file.
4. Pick ONE boring task from your own life and build it in `exercises/stage-5-build/`.

Start small, grow it one piece at a time.
