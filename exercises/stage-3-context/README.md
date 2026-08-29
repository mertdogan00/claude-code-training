# Stage 3: feel what context changes

Goal: experience, not read about, what `CLAUDE.md` does.

## The exercise (5 minutes)

1. In THIS folder, start Claude Code and ask, in Turkish:

   > Bu klasördeki menu.txt dosyasından bana bir haftalık yemek planı çıkar.

   Note the answer's style.

2. Now open `CLAUDE.md` in this folder. Read the three rules in it.

3. Ask the SAME question again in a fresh session (`/clear` first).

4. Compare: same model, same question, different behavior. The difference is CONTEXT: you
   told it once, in a file, and it now applies every time.

## What to notice

- Claude read `CLAUDE.md` without you pasting anything.
- The rules changed its formatting, language and caution level.
- This is "proje bazlı hafıza": write it once, benefit forever.

## Bonus

Change one rule in `CLAUDE.md` (for example: "plans must be vegetarian") and ask again.
