#!/usr/bin/env python3
"""Text extractor for the pdf-summarizer skill.

Uses the poppler `pdftotext` binary when available (fast, layout-aware). Prints the text to
stdout; prints a clear notice to stderr and exits 3 when no extractor exists, so the skill
knows to fall back to native PDF reading.
"""
import shutil
import subprocess
import sys


def main():
    if len(sys.argv) != 2:
        print("usage: extract_text.py <file.pdf>", file=sys.stderr)
        return 2
    pdf = sys.argv[1]
    if shutil.which("pdftotext"):
        return subprocess.call(["pdftotext", "-layout", pdf, "-"])
    print("no pdftotext on this machine; read the PDF natively instead", file=sys.stderr)
    return 3


if __name__ == "__main__":
    sys.exit(main())
