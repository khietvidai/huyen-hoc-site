import sys
import json
import re
from pathlib import Path

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

SCAN_DIR = Path(__file__).resolve().parent.parent / "data" / "yilore_scan"
CHUNKS_DIR = SCAN_DIR / "chunks"

target_chunks = [
    "03n.ctd_m3ury.js",
    "0ctt81z3v~bev.js",
    "0v25wi1p~dp-e.js",
    "0xh0t8q8zovv..js",
    "0~qsi2iw~bt-v.js",
    "10bcl6q38vd9y.js",
    "14~f5iat0mj4s.js",
    "0ib.3e8tnanrm.js",
    "0o-zk__2z1g49.js",
    "0ynxxgf160exi.js",
]

summary = []
for cname in target_chunks:
    p = CHUNKS_DIR / cname
    if not p.exists():
        continue
    txt = p.read_text(encoding="utf-8", errors="replace")
    en_strings = re.findall(r'"([A-Z][A-Za-z0-9\s,\.\'’·:\-\?/\(\)&#@\+]{3,90})"', txt)
    unique_en = []
    for s in en_strings:
        if s not in unique_en and not s.startswith("Mozilla"):
            unique_en.append(s)
    summary.append(f"## Chunk: {cname} ({len(txt)} chars)\nStrings sample: {unique_en[:80]}\n")

out_path = SCAN_DIR / "yilore_chunks_summary.md"
out_path.write_text("\n".join(summary), encoding="utf-8")
print("\n".join(summary))
