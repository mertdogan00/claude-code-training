---
name: klasor-raporu
description: Report what lives in a folder in plain Turkish - use when the user asks what a directory contains, how big it is, or what changed lately
---

# Klasör Raporu

When invoked with a folder path (default: current directory):

1. Walk the folder (skip node_modules, .git, hidden caches).
2. Report in Turkish, under one screen:
   - **Ne var:** file-type breakdown (kaç kod, kaç doküman, kaç görsel...) with sizes
   - **En büyük 5 dosya** (path + size)
   - **En son değişen 5 dosya** (path + date)
   - **Dikkat:** anything suspicious (0-byte files, huge files, .env with plaintext look)
3. End with one line: this folder's apparent PURPOSE, guessed from its contents; say "tahmin"
   openly.

Never open file contents except tiny text heads needed for the purpose guess.
