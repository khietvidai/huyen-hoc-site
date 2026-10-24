import json
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")

hex_path = r"D:\ichingtarrro\ichingtarot\data\hexagrams_full.json"
yao_path = r"D:\ichingtarrro\ichingtarot\data\yaos_384.json"

with open(hex_path, encoding="utf-8") as f:
    hexagrams = json.load(f)

with open(yao_path, encoding="utf-8") as f:
    yaos = json.load(f)

print(f"Total hexagrams: {len(hexagrams)}, Total yaos: {len(yaos)}")

# 1. Check CJK characters in Vietnamese fields (excluding intentionalzh_title or Nguyên văn quotes)
cjk_re = re.compile(r"[\u4e00-\u9fff]+")

for h in hexagrams:
    hid = h["id"]
    # Check desc_vi
    cjk_desc = cjk_re.findall(h.get("desc_vi", ""))
    if cjk_desc:
        print(f"[Hex {hid}] CJK in desc_vi: {cjk_desc} -> {h['desc_vi'][:120]}")

    # Check yiloreHtml_vi subtitle
    m = re.search(
        r'<span class="prose[^>]*><p>(.*?)</p></span>',
        h.get("yiloreHtml_vi", ""),
    )
    sub = m.group(1) if m else "NONE"
    print(
        f"[Hex {hid:2d}] {h['name_vi']:22s} | yilore subtitle: {sub:30s} | desc_vi[:70]: {h.get('desc_vi','')[:70]}"
    )
