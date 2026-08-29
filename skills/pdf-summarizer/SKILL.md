---
name: pdf-summarizer
description: Summarize a PDF in Turkish - use when the user gives a PDF path and wants its essence, decisions or action items
---

# PDF Summarizer

When the user invokes this skill with a PDF path:

1. Read the PDF.
2. Produce, in Turkish:
   - **3 cümlelik özet** (the whole document in three sentences)
   - **Karar/aksiyon listesi** (every decision or action item found, one line each)
   - **Sayılar** (any figures, amounts or dates worth remembering)
3. If the PDF is longer than 20 pages, summarize section by section first, then merge.
4. End with one line: what the user should probably DO with this document.

Keep the whole output under one screen; the user wants the essence, not a rewrite.
