# Skills: four finished, daily-life examples

A skill is a folder: `SKILL.md` (the instructions) plus, when the job earns it, `scripts/`
(executable helpers) and `references/` (templates and rules the skill reads). These four are
complete and installable; each solves something you plausibly do every week.

| Skill | Daily-life moment | Extras it bundles |
|---|---|---|
| [pdf-summarizer](pdf-summarizer/) | a 40-page PDF lands in your inbox | `scripts/extract_text.py` |
| [meeting-notes](meeting-notes/) | messy notes after a meeting | `references/template.md` |
| [folder-report](folder-report/) | "what IS in this folder?" | `scripts/scan.py` |
| [social-post](social-post/) | one announcement, three platforms | `references/platform-notes.md` |

## Install one (pick ONE tonight and actually run it)

**Into this project** (available when Claude Code runs in this repo): from the repo root,
ask Claude Code in your own words, for example:

> Install skills/pdf-summarizer into this project as a skill.

It copies the folder to `.claude/skills/`, and `/pdf-summarizer` appears in the `/` list.

**For yourself everywhere** (available in every project): copy the skill folder into your
user skills directory instead:

```bash
mkdir -p ~/.claude/skills
cp -r skills/pdf-summarizer ~/.claude/skills/
```

Restart Claude Code (or run `/reload-plugins`), type `/`, and it is in the list.

## Then use it

- `/pdf-summarizer some-report.pdf`
- `/meeting-notes` then paste your raw notes
- `/folder-report ~/Downloads` (brace yourself)
- `/social-post` then paste the announcement

## Write your own

Start from the one closest to your need, rename the folder, rewrite `SKILL.md` in plain
sentences: when to trigger, the steps, the output shape, what NOT to do. If a step is
mechanical (walking folders, extracting text), put it in `scripts/` and have the skill call
it; instructions decide, scripts do the heavy lifting.
