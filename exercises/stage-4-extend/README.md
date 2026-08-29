# Stage 4: extend Claude Code

Goal: see the SAME assistant grow hands: a skill, a plugin, an MCP connection.

## 4a. Install the example skill (2 minutes)

The finished skill lives in `../../skills/pdf-summarizer/`. Read its `SKILL.md`: it is just
a markdown file with instructions: that IS a skill.

Ask Claude Code, from the repo root:

> skills/pdf-summarizer klasöründeki beceriyi bu projeye skill olarak kur.

Then type `/` and watch it appear in the list. Run it on any PDF.

**The point:** yesterday this was a prompt you kept re-typing; now it is a command.

## 4b. Install a plugin from the official marketplace (3 minutes)

Inside Claude Code:

```
/plugin
```

Browse the official marketplace, pick one (on stage we install one live), confirm, and try
the new capability. Where to find more: see `../../resources.md`.

## 4c. Connect an MCP server (3 minutes)

MCP is how Claude Code talks to OUTSIDE systems (your files were always local; MCP opens
doors to services). Example used on stage: a Cloudflare MCP server. Setup commands and the
directory of public MCP servers: `../../resources.md`.

**The ladder you just climbed:** prompt → skill (reusable) → plugin (packaged) → MCP (talks
to the outside world).
