---
name: toplanti-notu
description: Turn raw meeting notes into structured Turkish minutes - use when the user gives messy notes, a transcript or bullet fragments from a meeting
---

# Toplantı Notu

When the user invokes this skill with raw notes (pasted text or a file path):

1. Read everything first; do not summarize line by line.
2. Produce, in Turkish:
   - **Özet** (3 cümle: ne konuşuldu, ne değişti)
   - **Kararlar** (numbered; each one sentence, who decided if stated)
   - **Aksiyonlar** (table: iş · sahibi · tarih; "?" when the notes do not say)
   - **Açık konular** (what was raised but not resolved)
3. Never invent owners or dates; missing is missing.
4. End with one line: the single most urgent follow-up.

Keep the whole output under one screen. If the notes are in English, still answer in Turkish.
