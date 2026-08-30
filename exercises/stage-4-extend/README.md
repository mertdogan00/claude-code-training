# Stage 4: extend Claude Code

Goal: see the SAME assistant grow hands: a skill, a plugin, an MCP connection.

## 4a. Install a skill (2 minutes)

Four finished skills live in `../../skills/`; the table and install steps are in
[`skills/README.md`](../../skills/README.md). On stage we install `pdf-summarizer`; at home
pick whichever matches your week.

Ask Claude Code, from the repo root:

> Install skills/pdf-summarizer into this project as a skill.

Then type `/` and watch it appear in the list. Run it on any PDF.

**The point:** yesterday this was a prompt you kept re-typing; now it is a command, and it
carries its own helper script with it.

## 4b. Install a plugin from a marketplace (3 minutes)

Step-by-step with the exact commands: [`plugin.md`](plugin.md).

Short version: Claude Code ships with the official Anthropic marketplace already added.
Type `/plugin`, browse the Discover tab, pick, confirm, use.

## 4c. Connect an MCP server (3 minutes)

Step-by-step with three public, no-API-key options: [`mcp.md`](mcp.md).

MCP is how Claude Code talks to OUTSIDE systems: your files were always local; MCP opens
doors to live services and documentation.

**The ladder you just climbed:** prompt → skill (reusable) → plugin (packaged) → MCP (talks
to the outside world).
