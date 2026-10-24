import os
import re
import json
import glob

def clean_hex_short_name_en(title_en, num):
    # e.g. "Hexagram 1 · The Creative (☰): Heaven in Ceaseless Motion..." -> "The Creative"
    m = re.search(r"Hexagram\s+\d+\s*[·—\-]\s*([^(:：]+)", title_en)
    if m:
        return m.group(1).strip()
    m2 = re.search(r"Hexagram\s+\d+\s+([A-Za-z\s\(\)]+?)\s+Explained", title_en)
    if m2:
        return m2.group(1).strip()
    return title_en.split(":")[0].strip()

def clean_hex_short_name_zh(title_zh, num):
    # e.g. "乾卦詳解：..." or "水雷屯卦詳解：..."
    m = re.match(r"^([^：:｜|]+?)詳解", title_zh)
    if m:
        return m.group(1).strip()
    return title_zh.split("：")[0].strip()

def clean_card_title(reading_title):
    if not reading_title:
        return ""
    for prefix in ["Yilore Reads:", "易羅解讀：", "易罗解读："]:
        if reading_title.startswith(prefix):
            return reading_title[len(prefix):].strip()
    return reading_title.strip()

def main():
    with open("data/yilore_scan/scraped/api_full_dump.json", "r", encoding="utf-8") as f:
        api_dump = json.load(f)
    with open("data/yilore_scan/scraped/hexagrams_64_full.json", "r", encoding="utf-8") as f:
        hex_64 = json.load(f)
    with open("data/yilore_scan/scraped/yao_384_full.json", "r", encoding="utf-8") as f:
        yao_384 = json.load(f)
    with open("data/yilore_scan/scraped/blogs_and_pages.json", "r", encoding="utf-8") as f:
        blogs_pages = json.load(f)
    with open("data/yilore_scan/scraped/client_chunks_static_data.json", "r", encoding="utf-8") as f:
        static_chunks = json.load(f)

    # Index yao_384 by (hexagramNumber, yaoPosition)
    yao_map = {}
    for y in yao_384:
        yao_map[(y["hexagramNumber"], y["yaoPosition"])] = y

    # Build compact & complete 64-hexagram catalog for TS
    ts_hexagrams = []
    for item in sorted(hex_64, key=lambda x: x["hexagramNumber"]):
        n = item["hexagramNumber"]
        slug = item["slug"]
        en = item.get("en", {})
        zh = item.get("zh", {})

        name_en = clean_hex_short_name_en(en.get("title", ""), n)
        name_zh = clean_hex_short_name_zh(zh.get("title", ""), n)
        card_title_en = clean_card_title(en.get("readingTitle", ""))
        card_title_zh = clean_card_title(zh.get("readingTitle", ""))

        # Merge 6 lines from main page + yao_384 detail page
        en_lines = en.get("lines", [])
        zh_lines = zh.get("lines", [])
        lines_out = []
        for idx in range(1, 7):
            el = en_lines[idx - 1] if idx - 1 < len(en_lines) else {}
            zl = zh_lines[idx - 1] if idx - 1 < len(zh_lines) else {}
            yd = yao_map.get((n, idx), {})
            yd_en = yd.get("en", {})
            yd_zh = yd.get("zh", {})

            lines_out.append({
                "position": idx,
                "positionLabelEn": el.get("positionLabel") or f"Line {idx}",
                "positionLabelZh": zl.get("positionLabel") or f"第{idx}爻",
                "titleEn": el.get("title") or yd_en.get("title") or "",
                "titleZh": zl.get("title") or yd_zh.get("title") or "",
                "yaoTextEn": yd_en.get("yaoText") or el.get("title") or "",
                "yaoTextZh": yd_zh.get("yaoText") or zl.get("title") or "",
                "summaryEn": el.get("summary") or yd_en.get("subtitle") or "",
                "summaryZh": zl.get("summary") or yd_zh.get("subtitle") or "",
                "tuanEn": yd_en.get("tuanCommentary") or "",
                "tuanZh": yd_zh.get("tuanCommentary") or "",
                "imageEn": yd_en.get("imageCommentary") or "",
                "imageZh": yd_zh.get("imageCommentary") or "",
                "divinationEn": yd_en.get("divination") or {},
                "divinationZh": yd_zh.get("divination") or {},
                "cardUrlLocal": f"/yilore-cards/yao_all/{n}-{idx}a.webp",
                "cardUrlRemoteEn": el.get("cardUrl") or f"https://karapfmpojnzolxlmsxv.supabase.co/storage/v1/object/public/yilore_cards/{n}/{n}-{idx}a-en.webp",
                "cardUrlRemoteZh": zl.get("cardUrl") or f"https://yilore-cards.oss-cn-hangzhou.aliyuncs.com/{n}/{n}-{idx}a.webp",
            })

        div_en = en.get("divination", {})
        div_zh = zh.get("divination", {})

        ts_hexagrams.append({
            "hexagramNumber": n,
            "slug": slug,
            "nameEn": name_en,
            "nameZh": name_zh,
            "fullTitleEn": en.get("title", ""),
            "fullTitleZh": zh.get("title", ""),
            "subtitleEn": en.get("subtitle", ""),
            "subtitleZh": zh.get("subtitle", ""),
            "cardTitleEn": card_title_en,
            "cardTitleZh": card_title_zh,
            "guaCiEn": en.get("guaCi", ""),
            "guaCiZh": zh.get("guaCi", ""),
            "imageCommentaryEn": en.get("imageCommentary", ""),
            "imageCommentaryZh": zh.get("imageCommentary", ""),
            "overviewEn": en.get("overview", ""),
            "overviewZh": zh.get("overview", ""),
            "readingSectionsEn": en.get("readingSections", []),
            "readingSectionsZh": zh.get("readingSections", []),
            "divinationEn": {
                "career": div_en.get("Career", ""),
                "love": div_en.get("Love", ""),
                "wealth": div_en.get("Wealth", ""),
                "health": div_en.get("Health", ""),
            },
            "divinationZh": {
                "career": div_zh.get("事業", ""),
                "love": div_zh.get("感情", ""),
                "wealth": div_zh.get("財運", ""),
                "health": div_zh.get("健康", ""),
            },
            "frontUrlEn": f"/yilore-cards/en/{n}a-en.webp",
            "backUrlEn": f"/yilore-cards/en/{n}b-en.webp",
            "frontUrlZh": f"/yilore-cards/hant/{n}a.webp",
            "backUrlZh": f"/yilore-cards/hant/{n}b.webp",
            "guaxiangUrl": f"/yilore-cards/guaxiang/{n}-{n}c.webp",
            "lines": lines_out,
            "faqsEn": en.get("faqs", []),
            "faqsZh": zh.get("faqs", []),
        })

    # Extract user Ziwei & Heluo Lishu data from api_dump
    me_en = api_dump.get("auth_me_en", {}).get("data", {}).get("data", {})
    me_zh = api_dump.get("auth_me_zh", {}).get("data", {}).get("data", {})
    ziwei_parsed = json.loads(me_en.get("ziwei", "{}")) if isinstance(me_en.get("ziwei"), str) else (me_en.get("ziwei") or {})
    dayun_parsed = json.loads(me_en.get("dayun", "{}")) if isinstance(me_en.get("dayun"), str) else (me_en.get("dayun") or {})

    # Count all downloaded card files
    card_files = glob.glob("public/yilore-cards/**/*.*", recursive=True)
    asset_files = glob.glob("public/yilore-assets/**/*.*", recursive=True) + glob.glob("public/app-assets/**/*.*", recursive=True)

    master_bundle = {
        "stats": {
            "hexagramsCount": len(ts_hexagrams),
            "changingLinesCount": len(yao_384),
            "blogAndContentPagesCount": len(blogs_pages),
            "downloadedCardFilesCount": len(card_files),
            "downloadedUiAssetFilesCount": len(asset_files),
            "conversationMessagesCount": len(api_dump.get("conversations_detail", {}).get("592076b9-e879-4835-8fa9-e74cd8a55ad7", {}).get("messages", {}).get("data", [])),
            "readingReportsCount": len(api_dump.get("reading_reports", {})),
            "dailyGuidanceRecordsCount": len(api_dump.get("daily_guidance_records", {}).get("data", {}).get("data", {}).get("records", [])),
        },
        "userProfileEn": me_en,
        "userProfileZh": me_zh,
        "ziweiAstrolabe": ziwei_parsed,
        "dayun": dayun_parsed,
        "creditsBalance": api_dump.get("credits_balance", {}).get("data", {}).get("data", {}),
        "subscriptionStatus": api_dump.get("subscription_status", {}).get("data", {}).get("data", {}),
        "dailyGuidanceRecords": api_dump.get("daily_guidance_records", {}).get("data", {}).get("data", {}).get("records", []),
        "questionRecords": api_dump.get("question_records_all", {}).get("data", {}).get("data", {}).get("records", []),
        "readingReports": api_dump.get("reading_reports", {}),
        "conversations": api_dump.get("oracle_conversations", {}).get("data", {}).get("data", []),
        "conversationsDetail": api_dump.get("conversations_detail", {}),
        "dailyPlans": api_dump.get("daily_plans", {}).get("data", {}).get("data", {}),
        "promptModels": api_dump.get("prompt_configs_models", {}).get("data", {}).get("data", []),
        "auspiciousWorkbenchSample": api_dump.get("auspicious_workbench_pick_meeting", {}),
        "staticClientData": static_chunks,
        "blogsAndPages": blogs_pages,
        "hexagrams64": ts_hexagrams,
    }

    with open("data/yilore_scan/yilore_full_scraped_data.json", "w", encoding="utf-8") as f:
        json.dump(master_bundle, f, ensure_ascii=False, indent=2)
    print("Saved master bundle to data/yilore_scan/yilore_full_scraped_data.json")
    print("Stats:", json.dumps(master_bundle["stats"], indent=2))

    # Generate src/data/yiloreScrapedCatalog.ts
    ts_code = f"""// AUTO-GENERATED FROM LIVE YILORE.APP SCRAPE (Camoufox + Next.js Chunks + API + Sitemap)
// Contains all 64 Hexagrams, 384 Changing Lines, Ten Gods & Five Elements Daily Picks,
// 15 Occasion Categories, 12 Hour Stars, User Ziwei 12 Palaces, Heluo Lishu Data, and Blog Articles.

export const YILORE_SCRAPED_STATS = {json.dumps(master_bundle["stats"], ensure_ascii=False, indent=2)} as const;

export const YILORE_TEN_GOD_DAILY_PICKS = {json.dumps(static_chunks["tenGodDailyPicks"], ensure_ascii=False, indent=2)} as const;

export const YILORE_FIVE_ELEMENT_DAILY_PICKS = {json.dumps(static_chunks["fiveElementDailyPicks"], ensure_ascii=False, indent=2)} as const;

export const YILORE_OCCASION_CATEGORIES = {json.dumps(static_chunks["occasionCategories"], ensure_ascii=False, indent=2)} as const;

export const YILORE_HOUR_STARS_12 = {json.dumps(static_chunks["hourStars12"], ensure_ascii=False, indent=2)} as const;

export const YILORE_TEN_GOD_FOCUS_AFFINITIES = {json.dumps(static_chunks["tenGodFocusAffinities"], ensure_ascii=False, indent=2)} as const;

export const YILORE_ZIWEI_ASTROLABE = {json.dumps(ziwei_parsed, ensure_ascii=False, indent=2)};

export const YILORE_HELUO_LISHU_EN = {json.dumps(me_en.get("heluo_lishu_data", {}), ensure_ascii=False, indent=2)};

export const YILORE_HELUO_LISHU_ZH = {json.dumps(me_zh.get("heluo_lishu_data", {}), ensure_ascii=False, indent=2)};

export const YILORE_BLOG_ARTICLES = {json.dumps(blogs_pages, ensure_ascii=False, indent=2)};

export const YILORE_HEXAGRAM_CATALOG_64 = {json.dumps(ts_hexagrams, ensure_ascii=False, indent=2)};
"""
    with open("src/data/yiloreScrapedCatalog.ts", "w", encoding="utf-8") as f:
        f.write(ts_code)
    print(f"Generated src/data/yiloreScrapedCatalog.ts ({len(ts_code)} chars)")

if __name__ == "__main__":
    main()
