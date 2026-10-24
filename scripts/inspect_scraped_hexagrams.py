import json
import urllib.request
import re

def main():
    with open("data/yilore_scan/scraped/hexagrams_64_full.json", "r", encoding="utf-8") as f:
        hex_data = json.load(f)
    print(f"Total hexagrams in hexagrams_64_full.json: {len(hex_data)}")
    h1 = hex_data[0]
    print("Hexagram 1 EN keys:", list(h1["en"].keys()))
    print("Hexagram 1 EN title:", h1["en"]["title"])
    print("Hexagram 1 EN guaCi:", h1["en"]["guaCi"])
    print("Hexagram 1 EN divination keys:", list(h1["en"]["divination"].keys()))
    print("Hexagram 1 EN lines count:", len(h1["en"]["lines"]))
    print("Hexagram 1 EN line 1:", h1["en"]["lines"][0])
    print("Hexagram 1 EN faqs count:", len(h1["en"]["faqs"]))
    print("Hexagram 1 ZH title:", h1["zh"]["title"])
    print("Hexagram 1 ZH divination keys:", list(h1["zh"]["divination"].keys()))
    print("Hexagram 1 ZH lines count:", len(h1["zh"]["lines"]))

    # Also inspect one yao detail page: /en/hexagram/qiangua1/yao-1
    req = urllib.request.Request("https://www.yilore.app/en/hexagram/qiangua1/yao-1", headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=20) as resp:
        html = resp.read().decode("utf-8", errors="ignore")
    m = re.search(r"<main[^>]*>(.*?)</main>", html, re.S)
    if m:
        headings = re.findall(r"<(h[123])[^>]*>(.*?)</\1>", m.group(1), re.S)
        print("\n=== Headings in /en/hexagram/qiangua1/yao-1 ===")
        for tag, txt in headings:
            clean = re.sub(r"<[^>]+>", "", txt).strip()
            print(f"  <{tag}>: {clean}")

if __name__ == "__main__":
    main()
