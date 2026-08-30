# Command card: what gets typed on stage, and the 15 worth knowing

## Terminal basics (four is enough tonight)

```bash
pwd          # where am I
ls           # what is in this folder
cd <folder>  # step into a folder
cd ..        # step one level up
```

## Claude Code lifecycle

```bash
claude               # start (current folder = the workspace)
claude --continue    # pick up the last conversation where it left off
```

## The 15 slash commands, in three tiers

### Tier 1 · must-know (you will use these tonight)

```
/help      # list every command
/init      # have Claude write this project's CLAUDE.md for you
/clear     # reset the conversation (context resets too!)
/compact   # summarize the conversation to free context, work continues
/model     # switch the model (fast vs heavy) and save it as default
```

### Tier 2 · good-to-know (first week)

```
/resume    # return to an earlier conversation
/memory    # edit CLAUDE.md files from inside the session
/rewind    # roll code AND conversation back to a checkpoint (the undo)
/plugin    # marketplaces: browse, install, manage
/mcp       # see and manage connected MCP servers
```

### Tier 3 · occasional (nice to have in the pocket)

```
/context      # visualize what is filling the context window
/usage        # what this is costing / plan limits
/permissions  # what Claude may do without asking
/doctor       # setup checkup: diagnoses and fixes install issues
/export       # export the conversation as text
```

Also: `/<skill-name>` runs any installed skill, and `Shift+Tab` cycles permission modes.

## Git in two lines (the repo logic shown on stage)

```bash
git clone <url>   # download the project to your machine
git pull          # fetch updates later
```

## The one to remember

Context is the fuel gauge: when it runs out and resets, the assistant remembers only what is
written in FILES (`CLAUDE.md`, your notes). Write things down; sessions are mortal, files
are not.
