---
name: folder-report
description: Report what lives in a folder in plain Turkish - use when the user asks what a directory contains, how big it is, or what changed lately
---

# Folder Report

When invoked with a folder path (default: the current directory):

1. Run the bundled scanner first; it does the walking so you do not have to:

   ```bash
   python3 scripts/scan.py <folder>
   ```

   It prints JSON: file-type breakdown with sizes, the 5 largest files, the 5 most recently
   changed files, and a warnings list (0-byte files, files over 50 MB, anything named like a
   secret). It skips `node_modules`, `.git` and hidden caches on its own.

2. Turn that JSON into a Turkish report, under one screen:
   - **Ne var:** the type breakdown in one readable paragraph, sizes humanized
   - **En büyük 5** and **En son değişen 5** as two short lists
   - **Dikkat:** every warning from the scanner, one line each; say "temiz" if none
3. End with one line: this folder's apparent PURPOSE, guessed from names and types; mark it
   openly as a guess ("tahmin").

Never open file contents except tiny text heads needed for the purpose guess. If the script
fails (no python3), fall back to your own directory listing tools and produce the same
report shape.
