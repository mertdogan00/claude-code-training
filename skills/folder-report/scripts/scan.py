#!/usr/bin/env python3
"""Folder scanner for the folder-report skill: prints one JSON report to stdout."""
import json
import os
import sys

SKIP_DIRS = {"node_modules", ".git", "__pycache__", ".venv", "venv", ".cache", "dist", "build"}
SECRET_HINTS = (".env", "id_rsa", "credentials", "secret", ".pem", ".key")
TYPE_MAP = {
    "code": {".py", ".js", ".ts", ".jsx", ".tsx", ".go", ".rs", ".rb", ".php", ".java", ".c",
             ".cpp", ".h", ".sh", ".sql", ".html", ".css"},
    "docs": {".md", ".txt", ".pdf", ".doc", ".docx", ".rtf"},
    "data": {".csv", ".json", ".xml", ".yaml", ".yml", ".xlsx", ".db", ".sqlite"},
    "images": {".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".ico"},
    "media": {".mp4", ".mp3", ".wav", ".mov", ".avi"},
}


def kind(name):
    ext = os.path.splitext(name)[1].lower()
    for k, exts in TYPE_MAP.items():
        if ext in exts:
            return k
    return "other"


def main():
    root = sys.argv[1] if len(sys.argv) > 1 else "."
    types, files, warnings = {}, [], []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS and not d.startswith(".")]
        for name in filenames:
            path = os.path.join(dirpath, name)
            try:
                st = os.stat(path)
            except OSError:
                continue
            k = kind(name)
            bucket = types.setdefault(k, {"count": 0, "bytes": 0})
            bucket["count"] += 1
            bucket["bytes"] += st.st_size
            files.append({"path": os.path.relpath(path, root), "bytes": st.st_size,
                          "mtime": int(st.st_mtime)})
            if st.st_size == 0:
                warnings.append(f"0-byte file: {os.path.relpath(path, root)}")
            if st.st_size > 50 * 1024 * 1024:
                warnings.append(f"large file (>50MB): {os.path.relpath(path, root)}")
            if any(h in name.lower() for h in SECRET_HINTS):
                warnings.append(f"possible secret material: {os.path.relpath(path, root)}")
    report = {
        "root": os.path.abspath(root),
        "total_files": len(files),
        "types": types,
        "largest": sorted(files, key=lambda f: -f["bytes"])[:5],
        "recent": sorted(files, key=lambda f: -f["mtime"])[:5],
        "warnings": warnings[:20],
    }
    json.dump(report, sys.stdout, indent=1)


if __name__ == "__main__":
    main()
