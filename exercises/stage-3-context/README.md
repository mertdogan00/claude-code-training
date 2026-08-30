# Stage 3: feel what context changes

Goal: experience, not read about, what `CLAUDE.md` does.

## The exercise (5 minutes)

1. In THIS folder, start Claude Code and ask:

   > Create a one-week meal plan from the menu.txt file in this folder.

   Note the answer's style (and its language).

2. Now open `CLAUDE.md` in this folder. Read the three rules in it.

3. Ask the SAME question again in a fresh session (`/clear` first).

4. Compare: same model, same question, different behavior. You asked in English and got a
   Turkish table with a budget line, because a FILE said so. That is context: you told it
   once, in a file, and it now applies every time.

## What to notice

- Claude read `CLAUDE.md` without you pasting anything.
- The rules changed its language, its format and its caution level.
- This is project-based memory: write it once, benefit forever.

## Bonus

Change one rule in `CLAUDE.md` (for example: "plans must be vegetarian") and ask again.
