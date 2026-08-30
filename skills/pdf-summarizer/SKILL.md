---
name: pdf-summarizer
description: Summarize a PDF in Turkish - use when the user gives a PDF path and wants its essence, decisions or action items
---

# PDF Summarizer

When the user invokes this skill with a PDF path:

1. Get the text. Try the bundled extractor first; it uses `pdftotext` when the machine has
   it and tells you when it does not:

   ```bash
   python3 scripts/extract_text.py <file.pdf>
   ```

   If the script reports that no extractor is available, read the PDF directly with your own
   file reading (you can read PDFs natively); the script exists to make big PDFs cheap, not
   to gatekeep.

2. Produce, in Turkish:
   - **3 cümlelik özet** (the whole document in three sentences)
   - **Karar/aksiyon listesi** (every decision or action item found, one line each)
   - **Sayılar** (figures, amounts and dates worth remembering)
3. If the PDF is longer than 20 pages, summarize section by section first, then merge.
4. End with one line: what the user should probably DO with this document.

Keep the whole output under one screen; the user wants the essence, not a rewrite.
