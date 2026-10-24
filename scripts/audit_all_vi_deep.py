import json
import re
import sys
from collections import Counter

sys.stdout.reconfigure(encoding="utf-8")

hex_path = r"D:\ichingtarrro\ichingtarot\data\hexagrams_full.json"
yao_path = r"D:\ichingtarrro\ichingtarot\data\yaos_384.json"
cls_path = r"D:\ichingtarrro\ichingtarot\data\classical_iching_vi.js"

with open(hex_path, encoding="utf-8") as f:
    hexagrams = json.load(f)

with open(yao_path, encoding="utf-8") as f:
    yaos = json.load(f)

with open(cls_path, encoding="utf-8") as f:
    cls_text = f.read()

print("=== 1. CJK characters in classical_iching_vi.js ===")
for i, line in enumerate(cls_text.splitlines(), 1):
    m = re.findall(r"[\u4e00-\u9fff]+", line)
    if m:
        print(f"  Line {i}: {m} -> {line.strip()[:100]}")

print("\n=== 2. Check CJK in hexagrams_full.json Vietnamese fields ===")
# Strip allowed patterns like (乾為天) or (潛龍勿用) or Nguyên văn: 「...」
def strip_allowed_cjk(s):
    if not s:
        return ""
    # Remove parenthesized pure-CJK strings like (乾為天) or (初九：潛龍勿用)
    s = re.sub(r"\([\u4e00-\u9fff\u3000-\u303f\uff00-\uffef\s：，、。；·]+\)", "", s)
    # Remove Nguyên văn: 「...」
    s = re.sub(r"Nguyên văn:\s*「[^」]+」", "", s)
    return s

cjk_re = re.compile(r"[\u4e00-\u9fff]+")

for h in hexagrams:
    hid = h["id"]
    for field in ["name_vi", "headline_vi", "desc_vi", "advice_vi", "yaociIntro_vi", "openingHtml_vi", "yiloreHtml_vi", "divinationHtml_vi"]:
        val = strip_allowed_cjk(h.get(field, ""))
        found = cjk_re.findall(val)
        if found:
            print(f"  [Hex {hid} {field}] CJK: {found}")
    for idx, y in enumerate(h.get("yaos_vi", [])):
        for yf in ["rank", "name", "desc"]:
            val = strip_allowed_cjk(y.get(yf, ""))
            found = cjk_re.findall(val)
            if found:
                print(f"  [Hex {hid} yaos_vi[{idx}].{yf}] CJK: {found} -> {val[:80]}")
    for idx, fq in enumerate(h.get("faqs_vi", [])):
        for ff in ["question", "answer", "q", "a"]:
            val = strip_allowed_cjk(fq.get(ff, ""))
            found = cjk_re.findall(val)
            if found:
                print(f"  [Hex {hid} faqs_vi[{idx}].{ff}] CJK: {found} -> {val[:80]}")

print("\n=== 3. Check CJK in yaos_384.json Vietnamese fields ===")
yao_cjk_count = 0
for k, yp in yaos.items():
    for field in ["headline_vi", "description_vi", "openingHtml_vi", "yiloreHtml_vi", "divinationHtml_vi"]:
        val = strip_allowed_cjk(yp.get(field, ""))
        found = cjk_re.findall(val)
        if found:
            yao_cjk_count += 1
            if yao_cjk_count <= 25:
                print(f"  [Yao {k} {field}] CJK: {found}")
    for idx, fq in enumerate(yp.get("faqs_vi", [])):
        for ff in ["question", "answer", "q", "a"]:
            val = strip_allowed_cjk(fq.get(ff, ""))
            found = cjk_re.findall(val)
            if found:
                yao_cjk_count += 1
                if yao_cjk_count <= 25:
                    print(f"  [Yao {k} faqs_vi[{idx}].{ff}] CJK: {found}")
print(f"Total Yao CJK occurrences: {yao_cjk_count}")

print("\n=== 4. Check Yao yiloreHtml_vi subtitles ===")
bad_yao_subs = []
for k, yp in yaos.items():
    m = re.search(r'<span class="prose[^>]*><p>(.*?)</p></span>', yp.get("yiloreHtml_vi", ""))
    sub = m.group(1) if m else ""
    if not sub or re.search(r"[\u4e00-\u9fff]", sub):
        bad_yao_subs.append((k, sub))
print(f"Yao subtitles with CJK or empty: {len(bad_yao_subs)}, sample: {bad_yao_subs[:10]}")
