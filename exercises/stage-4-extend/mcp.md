# Connect an MCP server (step by step, three public options)

MCP (Model Context Protocol) is how Claude Code talks to OUTSIDE systems. A skill changes
how Claude behaves; an MCP server gives it a new PLACE to reach: a service, a database,
live documentation.

All three options below are **public and need no API key**; pick ONE, run its command, done.

## Option 1: Cloudflare docs (the stage demo)

Live official documentation for the whole Cloudflare platform:

```bash
claude mcp add --transport sse cloudflare-docs https://docs.mcp.cloudflare.com/sse
```

Then ask:

> How do I set up a cron trigger for a Cloudflare Worker? Answer from the live docs.

## Option 2: Context7 (fresh docs for any library)

Up-to-date, version-specific documentation for thousands of libraries and frameworks
(works keyless with basic rate limits; a free key from context7.com raises them):

```bash
claude mcp add --transport http context7 https://mcp.context7.com/mcp
```

Then ask:

> Using Context7, how do I define a two-column responsive layout in Tailwind CSS v4?

## Option 3: DeepWiki (ask any public GitHub repo a question)

Free, no signup; three tools (ask a question, read the wiki structure, read contents):

```bash
claude mcp add --transport http deepwiki https://mcp.deepwiki.com/mcp
```

Then ask:

> Using DeepWiki, what does the anthropics/claude-code repository say about plugins?

## After adding any of them

Restart Claude Code (or start a new session), then watch the tool calls when you ask: the
answer now comes from a LIVE source, not memory. `/mcp` lists what is connected right now.

## Housekeeping

```bash
claude mcp list                # what is connected
claude mcp remove cloudflare-docs
```

## Where to find more servers

- Official registry and spec: https://modelcontextprotocol.io
- Cloudflare's public servers: https://developers.cloudflare.com/agents/model-context-protocol/

The ladder, complete: prompt → skill (reusable) → plugin (packaged) → MCP (the outside world).
