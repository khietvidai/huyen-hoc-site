import json
from scrape_all_384_yao_and_chunks import fetch_text, parse_yao_html, BASE_WEB

def main():
    with open("data/yilore_scan/scraped/yao_384_full.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    fixed = 0
    for item in data:
        num = item["hexagramNumber"]
        slug = item["slug"]
        y_idx = item["yaoPosition"]
        for k, lang in [("zh", "zh-TW"), ("en", "en")]:
            if not item.get(k) or not item[k].get("title"):
                url = f"{BASE_WEB}/{lang}/hexagram/{slug}/yao-{y_idx}"
                try:
                    h_str = fetch_text(url, timeout=20)
                    item[k] = parse_yao_html(h_str, num, slug, y_idx, lang)
                    fixed += 1
                    print(f"Fixed Hex {num} yao-{y_idx} ({lang}): {item[k]['title']}")
                except Exception as e:
                    print(f"Still missing Hex {num} yao-{y_idx} ({lang}): {e}")

    with open("data/yilore_scan/scraped/yao_384_full.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    zh_cnt = sum(1 for x in data if x.get("zh", {}).get("title"))
    en_cnt = sum(1 for x in data if x.get("en", {}).get("title"))
    print(f"Final count: zh={zh_cnt}/384, en={en_cnt}/384 (fixed {fixed})")

if __name__ == "__main__":
    main()
