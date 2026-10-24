import json
import re
import sys
from collections import Counter

sys.stdout.reconfigure(encoding="utf-8")

hex_path = r"D:\ichingtarrro\ichingtarot\data\hexagrams_full.json"
yao_path = r"D:\ichingtarrro\ichingtarot\data\yaos_384.json"

with open(hex_path, encoding="utf-8") as f:
    hexagrams = json.load(f)

with open(yao_path, encoding="utf-8") as f:
    yaos = json.load(f)

def strip_allowed_cjk(s):
    if not s:
        return ""
    # Allow (乾為天) or (初九：潛龍勿用)
    s = re.sub(r"\([\u4e00-\u9fff\u3000-\u303f\uff00-\uffef\s：，、。；·]+\)", "", s)
    s = re.sub(r"（[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef\s：，、。；·]+）", "", s)
    # Allow Nguyên văn: 「...」
    s = re.sub(r"Nguyên văn:\s*「[^」]+」", "", s)
    return s

cjk_re = re.compile(r"[\u4e00-\u9fff]+")
cjk_counter = Counter()
cjk_contexts = {}

def scan_text(loc, s):
    cleaned = strip_allowed_cjk(s)
    for m in cjk_re.finditer(cleaned):
        w = m.group(0)
        cjk_counter[w] += 1
        if w not in cjk_contexts:
            start = max(0, m.start() - 35)
            end = min(len(cleaned), m.end() + 35)
            cjk_contexts[w] = f"{loc}: ...{cleaned[start:end].replace(chr(10), ' ')}..."

for h in hexagrams:
    hid = h["id"]
    for field in ["name_vi", "headline_vi", "desc_vi", "advice_vi", "yaociIntro_vi", "openingHtml_vi", "yiloreHtml_vi", "divinationHtml_vi"]:
        scan_text(f"Hex {hid} {field}", h.get(field, ""))
    for idx, fq in enumerate(h.get("faqs_vi", [])):
        scan_text(f"Hex {hid} faq[{idx}].q", fq.get("question", ""))
        scan_text(f"Hex {hid} faq[{idx}].a", fq.get("answer", ""))

for k, yp in yaos.items():
    for field in ["headline_vi", "description_vi", "openingHtml_vi", "yiloreHtml_vi", "divinationHtml_vi"]:
        scan_text(f"Yao {k} {field}", yp.get(field, ""))
    for idx, fq in enumerate(yp.get("faqs_vi", [])):
        scan_text(f"Yao {k} faq[{idx}].q", fq.get("question", ""))
        scan_text(f"Yao {k} faq[{idx}].a", fq.get("answer", ""))

print(f"Total unique CJK strings: {len(cjk_counter)}")
for w, c in cjk_counter.most_common():
    print(f"  {w:12s} ({c:3d}) | {cjk_contexts[w]}")
