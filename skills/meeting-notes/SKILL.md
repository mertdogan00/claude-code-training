---
name: meeting-notes
description: Turn raw meeting notes into structured Turkish minutes - use when the user gives messy notes, a transcript or bullet fragments from a meeting
---

# Meeting Notes

When the user invokes this skill with raw notes (pasted text or a file path):

1. Read everything first; do not summarize line by line.
2. Fill the output template at `references/template.md` exactly, in Turkish:
   - **Özet** (3 sentences: what was discussed, what changed)
   - **Kararlar** (numbered; one sentence each, with who decided when stated)
   - **Aksiyonlar** (table: iş · sahibi · tarih; write "?" when the notes do not say)
   - **Açık konular** (raised but not resolved)
3. Never invent owners or dates; missing is missing.
4. End with one line: the single most urgent follow-up.

Keep the whole output under one screen. If the notes are in English, still answer in
Turkish: the reader of the minutes is Turkish.
