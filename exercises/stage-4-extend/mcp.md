# Connect an MCP server (the stage demo, step by step)

MCP (Model Context Protocol) is how Claude Code talks to OUTSIDE systems. A skill changes how
Claude behaves; an MCP server gives it a new PLACE to reach: a service, a database, live docs.

## The demo: Cloudflare's documentation server

One command, from any folder:

```bash
claude mcp add --transport sse cloudflare-docs https://docs.mcp.cloudflare.com/sse
```

Restart Claude Code, then ask:

> Cloudflare Workers'ta bir cron tetikleyici nasıl kurulur? Güncel dokümana göre anlat.

Watch the tool calls: the answer now comes from LIVE documentation, not memory.

## Where to find servers

- Official registry and spec: https://modelcontextprotocol.io
- Cloudflare's public servers: https://developers.cloudflare.com/agents/model-context-protocol/
- Inside Claude Code: `/mcp` lists what is connected right now

## Remove it later

```bash
claude mcp remove cloudflare-docs
```

The ladder, complete: prompt → skill (reusable) → plugin (packaged) → MCP (the outside world).
