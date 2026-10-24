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

all_hex_text = []
for h in hexagrams:
    for k in ["name_vi", "headline_vi", "desc_vi", "advice_vi", "yaociIntro_vi", "openingHtml_vi", "yiloreHtml_vi", "divinationHtml_vi"]:
        all_hex_text.append((f"Hex {h['id']} {k}", h.get(k, "")))
    for i, y in enumerate(h.get("yaos_vi", [])):
        all_hex_text.append((f"Hex {h['id']} yao[{i}]", f"{y.get('rank','')} | {y.get('name','')} | {y.get('desc','')}"))
    for i, fq in enumerate(h.get("faqs_vi", [])):
        all_hex_text.append((f"Hex {h['id']} faq[{i}]", f"{fq.get('question','')} | {fq.get('answer','')}"))
    for i, r in enumerate(h.get("relatedHexagrams", [])):
        all_hex_text.append((f"Hex {h['id']} rel[{i}]", f"{r.get('title_vi','')} | {r.get('subtitle_vi','')} | {r.get('desc_vi','')}"))

all_yao_text = []
for k, yp in yaos.items():
    for f in ["headline_vi", "description_vi", "openingHtml_vi", "yiloreHtml_vi", "divinationHtml_vi"]:
        all_yao_text.append((f"Yao {k} {f}", yp.get(f, "")))
    for i, fq in enumerate(yp.get("faqs_vi", [])):
        all_yao_text.append((f"Yao {k} faq[{i}]", f"{fq.get('question','')} | {fq.get('answer','')}"))

combined = all_hex_text + all_yao_text

suspect_patterns = [
    r"\*\*[^*]+\*\*",
    r"vì\s*(?:<strong>)?\s*đơn",
    r"vì\s*(?:<strong>)?\s*Đã có đối tác",
    r"phán đoán tổng thể",
    r"sự giàu có đầu tư",
    r"Mr\.\s*Lee",
    r"làm lợi cho người lớn",
    r"cấu hình thấp",
    r"lục đạo",
    r"sáu câu",
    r"Quẻ Cần",
    r"Quẻ Trân",
    r"Thủy Lôi Trân",
    r"Thiên Sơn Thoát",
    r"Quẻ Tây A",
    r"Zeshanxian",
    r"Trạch Thủy Khoốn",
    r"Trung Phú",
    r"Thuần Lý",
    r"Thượng Lý",
    r"Hạ Lý",
    r"Bát [Qq]uái thứ",
    r"Quyển Kinh Dịch thứ",
    r"Liuyao",
    r"Shenlong",
    r"Liuxu",
    r"Tian Xingjian",
    r"Qianyang",
    r"Chunyang",
    r"Yinjin",
    r"Tongmeng",
    r"Youfu",
    r"Guanheng",
    r"Zhenji",
    r"zhenzhangrenji",
    r"Six Dragons",
    r"Yuanheng",
    r"Lizhen",
    r"Taohui",
    r"Gujing",
    r"Shenwubo",
    r"Zhizhi",
    r"Dushan",
    r"Shuangze",
    r"Houde",
    r"Tongtai",
    r"Jiahe",
    r"Qingsong",
    r"Wuwu",
    r"Yundian",
    r"Shenniu",
    r"Qilin",
    r"Qingzezhu",
    r"Mingjun",
    r"chờ nước của mình vỡ ra",
    r"Tự không cường nghỉ",
    r"theo phe hổ",
    r"chân máy mới",
    r"Khuyến mãi",
    r"Làm ơn\s*·",
    r"Bạch Dương mạnh mẽ",
]

print("=== Suspect Phrase Counts Across 64 Hexagrams & 384 Yaos ===")
for pat in suspect_patterns:
    rx = re.compile(pat)
    cnt = 0
    samples = []
    for loc, txt in combined:
        m = rx.search(txt)
        if m:
            cnt += 1
            if len(samples) < 3:
                samples.append(f"{loc}: {m.group(0)}")
    if cnt > 0:
        print(f"  {pat:30s} -> {cnt:4d} matches | e.g. {samples}")
