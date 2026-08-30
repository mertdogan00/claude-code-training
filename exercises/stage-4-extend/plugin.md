# Install a plugin from a marketplace (step by step)

A skill is a text file you wrote; a PLUGIN is a packaged capability someone shipped:
commands, agents, sometimes whole MCP connections, installable in seconds.

## Where plugins come from (three tiers, all by Anthropic's rules)

1. **Official marketplace** (`claude-plugins-official`): curated by Anthropic and added to
   Claude Code AUTOMATICALLY on first run; you have it already. Browse it on the web at
   https://claude.com/plugins or inside Claude Code via `/plugin` → Discover tab.
2. **Community marketplace**: third-party plugins that passed Anthropic's automated
   screening. Add it once, then install from it:

   ```
   /plugin marketplace add anthropics/claude-plugins-community
   /plugin install <plugin-name>@claude-community
   ```

3. **Anyone's marketplace**: any GitHub repo with a marketplace file works with
   `/plugin marketplace add owner/repo`. That is the ecosystem bet: the tool grows without
   waiting for Anthropic. Only add sources you trust; a plugin runs with your permissions.

## The flow shown on stage

Inside Claude Code:

```
/plugin
```

1. The plugin manager opens on the **Discover** tab (official marketplace).
2. Each entry shows what it adds (commands / agents / MCP servers) and its context cost.
3. Pick one, confirm, choose a scope (just you vs this project).
4. Type `/` again: its new commands are in the list, ready.

We choose the plugin LIVE based on what the marketplace offers that evening; there is always
something that lands well with the room.

## Try at home (5 minutes)

- Open `/plugin`, install anything that looks useful, run its command once.
- `/plugin list` shows what you have; uninstalling is the same panel.
- Rule of thumb: skill = your own recipe · plugin = someone's packaged recipe.
