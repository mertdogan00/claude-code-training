# Stage 3: feel what context changes

Goal: experience, not read about, what `CLAUDE.md` does.

This folder ships its three rules in `rules.md`, NOT in `CLAUDE.md`. That is on purpose:
Claude Code loads a `CLAUDE.md` the moment a session starts, so the "before" answer only
exists while the file does not.

## The exercise (5 minutes)

1. In THIS folder, start Claude Code and ask:

   > Create a one-week meal plan from the menu.txt file in this folder.

   Note the answer's style (and its format).

2. Now turn the rules into memory. Either in your terminal:

   ```bash
   mv rules.md CLAUDE.md
   ```

   or ask Claude Code itself:

   > Save the rules in rules.md into this folder's CLAUDE.md.

   Open the new `CLAUDE.md` and read its three rules.

3. Ask the SAME question again in a fresh session (`/clear` first, so the new file is read).

4. Compare: same model, same question, different behavior. The answer now comes back as a
   table with a budget line, because a FILE said so. That is context: you told it once, in a
   file, and it now applies every time.

## What to notice

- Claude read `CLAUDE.md` without you pasting anything.
- The rules changed its format, its budget awareness and its repetition rule.
- This is project-based memory: write it once, benefit forever.

## Bonus

Change one rule in `CLAUDE.md` (for example: "plans must be vegetarian") and ask again.

To run the exercise a second time, rename the file back: `mv CLAUDE.md rules.md`.
