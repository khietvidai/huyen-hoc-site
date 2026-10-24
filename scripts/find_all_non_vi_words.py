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

def strip_html(s):
    if not s:
        return ""
    s = re.sub(r"<[^>]+>", " ", s)
    s = re.sub(r"&[a-zA-Z0-9#]+;", " ", s)
    return s

texts = []
for h in hexagrams:
    for k in ["name_vi", "headline_vi", "desc_vi", "advice_vi", "yaociIntro_vi", "openingHtml_vi", "yiloreHtml_vi", "divinationHtml_vi"]:
        texts.append((f"Hex {h['id']} {k}", strip_html(h.get(k, ""))))
    for i, y in enumerate(h.get("yaos_vi", [])):
        texts.append((f"Hex {h['id']} yao[{i}]", f"{y.get('rank','')} {y.get('name','')} {y.get('desc','')}"))
    for i, fq in enumerate(h.get("faqs_vi", [])):
        texts.append((f"Hex {h['id']} faq[{i}]", f"{fq.get('question','')} {fq.get('answer','')}"))
    for i, r in enumerate(h.get("relatedHexagrams", [])):
        texts.append((f"Hex {h['id']} rel[{i}]", f"{r.get('title_vi','')} {r.get('subtitle_vi','')} {r.get('desc_vi','')}"))

for k, yp in yaos.items():
    for f in ["headline_vi", "description_vi", "openingHtml_vi", "yiloreHtml_vi", "divinationHtml_vi"]:
        texts.append((f"Yao {k} {f}", strip_html(yp.get(f, ""))))
    for i, fq in enumerate(yp.get("faqs_vi", [])):
        texts.append((f"Yao {k} faq[{i}]", f"{fq.get('question','')} {fq.get('answer','')}"))

ascii_word_re = re.compile(r"\b[A-Za-z]{2,}\b")

vi_valid = {
    "quan", "gian", "xa", "giao", "xung", "xem", "xe", "xu", "xin", "xanh", "xui", "xao", "xen", "xua",
    "xinh", "giang", "xum", "xay", "xoay", "xoan", "xong", "xom", "xop", "xot", "xoi", "xoe", "xoa", "xoc",
    "quanh", "quang", "quen", "quay", "quam", "quao", "quat", "quau", "quai", "quan", "queo", "quet",
    "khoang", "thoang", "choang", "ngoang", "khoanh", "ngoanh", "khuynh", "nghieng", "nghien", "thuong",
    "phuong", "chuong", "truong", "khuang", "nguyet", "nguyen", "khuyen", "thuyen", "chuyen", "truyen",
    "nhuong", "duong", "luong", "tuong", "vuong", "huong", "cuong", "guong", "xuong", "suong", "buong",
    "muong", "nuong", "ruong", "hoang", "loang", "toang", "xoang", "doanh", "hoanh", "nhanh", "thanh",
    "tranh", "chanh", "khanh", "ghanh", "nganh", "huynh", "thinh", "trinh", "chinh", "khinh", "phinh",
    "nhinh", "nginh", "quynh", "ai", "seo", "faq", "mbti", "tarot", "internet", "marathon", "caffeine",
    "fomo", "taxi", "buff", "fan", "fandom", "wechat"
}

suspect_words = Counter()
word_locs = {}
word_contexts = {}

for loc, txt in texts:
    for m in ascii_word_re.finditer(txt):
        w = m.group(0)
        wl = w.lower()
        if wl in vi_valid:
            continue
        has_fjwz = any(c in wl for c in "fjwz")
        has_pinyin_cluster = bool(re.search(r"(sh|zh|q(?!u)|xj|j[iauo]|x[iauev]|z[h]?[aiueo]|w[aiueo]|f[aiueo]|ian|uan|iao|uai|uei|ong[a-z]|ang[a-z]|ing[a-z]|eng[a-z])", wl))
        is_long_ascii = len(w) >= 7
        if has_fjwz or has_pinyin_cluster or is_long_ascii:
            suspect_words[w] += 1
            if w not in word_locs:
                word_locs[w] = loc
                start = max(0, m.start() - 35)
                end = min(len(txt), m.end() + 35)
                word_contexts[w] = txt[start:end].replace("\n", " ")

print(f"Found {len(suspect_words)} distinct non-Vietnamese/Pinyin/English words:")
for w, c in suspect_words.most_common():
    print(f"{w:24s} ({c:3d}) | {word_locs[w]:28s} | ...{word_contexts[w]}...")
