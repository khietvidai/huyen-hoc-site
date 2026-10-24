import os
import re
import json
import html as html_lib
import urllib.request
import urllib.error
from concurrent.futures import ThreadPoolExecutor, as_completed

BASE_WEB = "https://www.yilore.app"
BASE_API = "https://api.yilore.lichen.xin"

def strip_tags(s):
    if not s:
        return ""
    s = re.sub(r"<br\s*/?>", "\n", s, flags=re.I)
    s = re.sub(r"</p\s*>", "\n\n", s, flags=re.I)
    s = re.sub(r"</li\s*>", "\n", s, flags=re.I)
    s = re.sub(r"<[^>]+>", "", s)
    s = html_lib.unescape(s)
    lines = [line.strip() for line in s.splitlines()]
    out = "\n".join([l for l in lines if l])
    return out.strip()

def fetch_text(url, timeout=20):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read().decode("utf-8", errors="ignore")

def parse_hexagram_html(html_str, slug, lang):
    m_num = re.search(r"(\d+)$", slug)
    hex_num = int(m_num.group(1)) if m_num else 0

    m_main = re.search(r"<main[^>]*>(.*?)</main>", html_str, re.S)
    main_html = m_main.group(1) if m_main else html_str

    # h1 & lead paragraph
    m_h1 = re.search(r"<h1[^>]*>(.*?)</h1>", main_html, re.S)
    title = strip_tags(m_h1.group(1)) if m_h1 else ""
    m_lead = re.search(r"<h1[^>]*>.*?</h1>\s*<p[^>]*>(.*?)</p>", main_html, re.S)
    subtitle = strip_tags(m_lead.group(1)) if m_lead else ""

    # Section: opening
    gua_ci = ""
    image_commentary = ""
    overview_text = ""
    guaxiang_img = ""
    m_open = re.search(r'<section id="opening"[^>]*>(.*?)</section>', main_html, re.S)
    if m_open:
        sec = m_open.group(1)
        h3_blocks = re.findall(r"<h3[^>]*>(.*?)</h3>\s*<div[^>]*>(.*?)</div>", sec, re.S)
        if len(h3_blocks) >= 1:
            gua_ci = strip_tags(h3_blocks[0][1])
        if len(h3_blocks) >= 2:
            image_commentary = strip_tags(h3_blocks[1][1])
        m_gx = re.search(r'<img[^>]+src="([^"]*guaxiang[^"]*)"', sec)
        if m_gx:
            guaxiang_img = html_lib.unescape(m_gx.group(1))
        m_ov = re.search(r'<div class="mt-6 prose[^"]*">(.*?)</div>\s*$', sec, re.S)
        if m_ov:
            overview_text = strip_tags(m_ov.group(1))

    # Section: yilore-reading
    card_front = ""
    card_back = ""
    reading_title = ""
    reading_sections = []
    m_yr = re.search(r'<section id="yilore-reading"[^>]*>(.*?)</section>', main_html, re.S)
    if m_yr:
        sec = m_yr.group(1)
        imgs = re.findall(r'<img[^>]+src="([^"]+)"', sec)
        for im in imgs:
            im_u = html_lib.unescape(im)
            if "a.webp" in im_u or "a-en.webp" in im_u:
                card_front = im_u
            elif "b.webp" in im_u or "b-en.webp" in im_u:
                card_back = im_u
        h2s = [strip_tags(x) for x in re.findall(r"<h2[^>]*>(.*?)</h2>", sec, re.S)]
        if len(h2s) >= 2:
            reading_title = h2s[1]
        elif h2s:
            reading_title = h2s[0]
        for h3_m in re.finditer(r"<h3[^>]*>(.*?)</h3>", sec, re.S):
            sub_h = strip_tags(h3_m.group(1))
            start_pos = h3_m.end()
            next_h = re.search(r"<h[23][^>]*>", sec[start_pos:], re.S)
            chunk = sec[start_pos:start_pos + next_h.start()] if next_h else sec[start_pos:]
            reading_sections.append({
                "heading": sub_h,
                "body": strip_tags(chunk)
            })

    # Section: divination (Career, Love, Wealth, Health)
    divination = {}
    m_div = re.search(r'<section id="divination"[^>]*>(.*?)</section>', main_html, re.S)
    if m_div:
        sec = m_div.group(1)
        for art in re.findall(r"<article[^>]*>(.*?)</article>", sec, re.S):
            m_h3 = re.search(r"<h3[^>]*>(.*?)</h3>", art, re.S)
            key = strip_tags(m_h3.group(1)) if m_h3 else "item"
            ps = [strip_tags(p) for p in re.findall(r"<p[^>]*>(.*?)</p>", art, re.S)]
            body = ps[-1] if ps else strip_tags(art)
            divination[key] = body

    # Section: yao-ci (6 lines)
    lines = []
    m_yao = re.search(r'<section id="yao-ci"[^>]*>(.*?)</section>', main_html, re.S)
    if m_yao:
        sec = m_yao.group(1)
        for a_match in re.finditer(r'<a[^>]+href="([^"]+)"[^>]*>\s*<article[^>]*>(.*?)</article>\s*</a>', sec, re.S):
            href = a_match.group(1)
            art = a_match.group(2)
            m_img = re.search(r'<img[^>]+src="([^"]+)"', art)
            img_url = html_lib.unescape(m_img.group(1)) if m_img else ""
            m_pos = re.search(r'<p class="text-xs text-stone-500">(.*?)</p>', art, re.S)
            pos_label = strip_tags(m_pos.group(1)) if m_pos else ""
            m_h3 = re.search(r"<h3[^>]*>(.*?)</h3>", art, re.S)
            line_title = strip_tags(m_h3.group(1)) if m_h3 else ""
            m_body = re.search(r"</h3>\s*<div[^>]*>(.*?)</div>", art, re.S)
            line_body = strip_tags(m_body.group(1)) if m_body else ""
            lines.append({
                "href": href,
                "positionLabel": pos_label,
                "title": line_title,
                "summary": line_body,
                "cardUrl": img_url
            })

    # Section: faq
    faqs = []
    m_faq = re.search(r'<section id="faq"[^>]*>(.*?)</section>', main_html, re.S)
    if m_faq:
        sec = m_faq.group(1)
        for art in re.findall(r"<article[^>]*>(.*?)</article>", sec, re.S):
            m_q = re.search(r"<h3[^>]*>(.*?)</h3>", art, re.S)
            m_a = re.search(r"</h3>\s*<div[^>]*>(.*?)</div>", art, re.S)
            if m_q and m_a:
                faqs.append({
                    "question": strip_tags(m_q.group(1)),
                    "answer": strip_tags(m_a.group(1))
                })

    return {
        "hexagramNumber": hex_num,
        "slug": slug,
        "lang": lang,
        "title": title,
        "subtitle": subtitle,
        "guaCi": gua_ci,
        "imageCommentary": image_commentary,
        "overview": overview_text,
        "guaxiangImage": guaxiang_img,
        "cardFrontImage": card_front,
        "cardBackImage": card_back,
        "readingTitle": reading_title,
        "readingSections": reading_sections,
        "divination": divination,
        "lines": lines,
        "faqs": faqs,
    }

def parse_blog_html(html_str, url):
    m_main = re.search(r"<main[^>]*>(.*?)</main>", html_str, re.S)
    main_html = m_main.group(1) if m_main else html_str
    m_h1 = re.search(r"<h1[^>]*>(.*?)</h1>", main_html, re.S)
    title = strip_tags(m_h1.group(1)) if m_h1 else ""
    imgs = [html_lib.unescape(x) for x in re.findall(r'<img[^>]+src="([^"]+)"', main_html)]
    text_body = strip_tags(main_html)
    return {
        "url": url,
        "title": title,
        "images": imgs,
        "content": text_body[:15000]
    }

def download_file(url, dest_path):
    if os.path.exists(dest_path) and os.path.getsize(dest_path) > 100:
        return True, "cached"
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = resp.read()
            if len(data) > 50:
                with open(dest_path, "wb") as f:
                    f.write(data)
                return True, f"downloaded ({len(data)}B)"
            return False, "empty"
    except Exception as e:
        return False, str(e)

def main():
    os.makedirs("data/yilore_scan/scraped", exist_ok=True)

    # 1. Fetch sitemap.xml to get all hexagram slugs and blog URLs
    print("Fetching sitemap.xml...")
    xml = fetch_text(f"{BASE_WEB}/sitemap.xml")
    locs = re.findall(r"<loc>(.*?)</loc>", xml)

    zh_hex_urls = [
        u for u in locs
        if re.match(r"^https://www\.yilore\.app/zh-TW/hexagram/[a-z0-9]+$", u)
    ]
    en_hex_urls = [
        u for u in locs
        if re.match(r"^https://www\.yilore\.app/en/hexagram/[a-z0-9]+$", u)
    ]
    blog_urls = [u for u in locs if "/blog/" in u]

    print(f"Found {len(zh_hex_urls)} zh-TW hexagram pages, {len(en_hex_urls)} en hexagram pages, {len(blog_urls)} blog pages")

    # Map slug -> number
    slug_map = {}
    for u in zh_hex_urls:
        slug = u.rsplit("/", 1)[-1]
        m = re.search(r"(\d+)$", slug)
        if m:
            slug_map[int(m.group(1))] = slug

    print(f"Unique hexagram slugs mapped: {len(slug_map)} / 64")

    # Fetch all 64 in zh-TW and all 64 in en (even if some en URLs weren't in sitemap, try slug_map!)
    hexagrams_zh = {}
    hexagrams_en = {}

    def fetch_hex_job(num, slug, lang):
        url = f"{BASE_WEB}/{lang}/hexagram/{slug}"
        try:
            html_s = fetch_text(url, timeout=20)
            parsed = parse_hexagram_html(html_s, slug, lang)
            return num, lang, parsed, None
        except Exception as e:
            return num, lang, None, str(e)

    print("Scraping all 64 Hexagrams in zh-TW and en (128 pages)...")
    with ThreadPoolExecutor(max_workers=24) as ex:
        futs = []
        for num, slug in sorted(slug_map.items()):
            futs.append(ex.submit(fetch_hex_job, num, slug, "zh-TW"))
            futs.append(ex.submit(fetch_hex_job, num, slug, "en"))
        for fut in as_completed(futs):
            num, lang, parsed, err = fut.result()
            if parsed:
                if lang == "zh-TW":
                    hexagrams_zh[num] = parsed
                else:
                    hexagrams_en[num] = parsed
            else:
                print(f"  [WARN] Hexagram {num} ({lang}): {err}")

    print(f"Scraped {len(hexagrams_zh)} zh-TW hexagrams and {len(hexagrams_en)} EN hexagrams!")

    # Merge into a unified 64-hexagram catalog
    merged_hexagrams = []
    for num in sorted(slug_map.keys()):
        zh = hexagrams_zh.get(num, {})
        en = hexagrams_en.get(num, {})
        merged_hexagrams.append({
            "hexagramNumber": num,
            "slug": slug_map[num],
            "zh": zh,
            "en": en,
        })

    with open("data/yilore_scan/scraped/hexagrams_64_full.json", "w", encoding="utf-8") as f:
        json.dump(merged_hexagrams, f, ensure_ascii=False, indent=2)
    print("Saved data/yilore_scan/scraped/hexagrams_64_full.json")

    # 2. Scrape all blog articles and life-config pages
    extra_urls = blog_urls + [
        f"{BASE_WEB}/en/blog",
        f"{BASE_WEB}/zh-TW/blog",
        f"{BASE_WEB}/en/life-config",
        f"{BASE_WEB}/zh-TW/life-config",
        f"{BASE_WEB}/en/privacy",
        f"{BASE_WEB}/en/terms",
    ]
    blogs_and_pages = []
    print(f"Scraping {len(extra_urls)} blog & content pages...")
    with ThreadPoolExecutor(max_workers=12) as ex:
        fut_map = {ex.submit(fetch_text, u, 20): u for u in extra_urls}
        for fut in as_completed(fut_map):
            u = fut_map[fut]
            try:
                h_txt = fut.result()
                blogs_and_pages.append(parse_blog_html(h_txt, u))
            except Exception as e:
                print(f"  [WARN] Page {u}: {e}")

    with open("data/yilore_scan/scraped/blogs_and_pages.json", "w", encoding="utf-8") as f:
        json.dump(blogs_and_pages, f, ensure_ascii=False, indent=2)
    print(f"Saved {len(blogs_and_pages)} pages to data/yilore_scan/scraped/blogs_and_pages.json")

    # 3. Download all Card & UI Assets into public/
    download_jobs = []

    # 64 Hexagram Cards (Hant front & back, EN front & back, Guaxiang diagrams)
    for n in range(1, 65):
        # Hant cards
        download_jobs.append((
            f"https://yilore-cards.oss-cn-hangzhou.aliyuncs.com/card_hant_webp/{n}a.webp",
            f"public/yilore-cards/hant/{n}a.webp"
        ))
        download_jobs.append((
            f"https://yilore-cards.oss-cn-hangzhou.aliyuncs.com/card_hant_webp/{n}b.webp",
            f"public/yilore-cards/hant/{n}b.webp"
        ))
        # EN cards (Supabase)
        download_jobs.append((
            f"https://awarcwfehhrxlshyzare.supabase.co/storage/v1/object/public/yilore_webp/{n}/{n}a-en.webp",
            f"public/yilore-cards/en/{n}a-en.webp"
        ))
        download_jobs.append((
            f"https://awarcwfehhrxlshyzare.supabase.co/storage/v1/object/public/yilore_webp/{n}/{n}b-en.webp",
            f"public/yilore-cards/en/{n}b-en.webp"
        ))
        # Guaxiang diagram
        download_jobs.append((
            f"https://yilore-cards.oss-cn-hangzhou.aliyuncs.com/guaxiang/{n}-{n}c.webp",
            f"public/yilore-cards/guaxiang/{n}-{n}c.webp"
        ))

    # 60 Jiazi Day Pillar (rizhu) cards
    for r_idx in range(1, 61):
        download_jobs.append((
            f"https://yilore-cards.oss-cn-hangzhou.aliyuncs.com/rizhu/rizhu_webp/{r_idx}.webp",
            f"public/yilore-cards/rizhu/{r_idx}.webp"
        ))

    # Heluo & Reading specific Yao cards
    specific_yao_urls = [
        ("https://yilore-cards.oss-cn-hangzhou.aliyuncs.com/53/53a.webp", "public/yilore-cards/heluo/53a.webp"),
        ("https://yilore-cards.oss-cn-hangzhou.aliyuncs.com/53/53b.webp", "public/yilore-cards/heluo/53b.webp"),
        ("https://yilore-cards.oss-cn-hangzhou.aliyuncs.com/4/4a.webp", "public/yilore-cards/heluo/4a.webp"),
        ("https://yilore-cards.oss-cn-hangzhou.aliyuncs.com/4/4b.webp", "public/yilore-cards/heluo/4b.webp"),
        ("https://yilore-cards.oss-cn-hangzhou.aliyuncs.com/53/53-6a.webp", "public/yilore-cards/yao/53-6a.webp"),
        ("https://yilore-cards.oss-cn-hangzhou.aliyuncs.com/53/53-6b.webp", "public/yilore-cards/yao/53-6b.webp"),
        ("https://yilore-cards.oss-cn-hangzhou.aliyuncs.com/card_hant_webp/7-3a.webp", "public/yilore-cards/yao/7-3a.webp"),
        ("https://yilore-cards.oss-cn-hangzhou.aliyuncs.com/card_hant_webp/7-3b.webp", "public/yilore-cards/yao/7-3b.webp"),
        ("https://yilore-cards.oss-cn-hangzhou.aliyuncs.com/card_hant_webp/7-4a.webp", "public/yilore-cards/yao/7-4a.webp"),
        ("https://yilore-cards.oss-cn-hangzhou.aliyuncs.com/card_hant_webp/7-4b.webp", "public/yilore-cards/yao/7-4b.webp"),
        ("https://yilore-cards.oss-cn-hangzhou.aliyuncs.com/64/64-3a.webp", "public/yilore-cards/yao/64-3a.webp"),
        ("https://yilore-cards.oss-cn-hangzhou.aliyuncs.com/64/64-3b.webp", "public/yilore-cards/yao/64-3b.webp"),
        ("https://yilore-cards.oss-cn-hangzhou.aliyuncs.com/64/64-6a.webp", "public/yilore-cards/yao/64-6a.webp"),
        ("https://yilore-cards.oss-cn-hangzhou.aliyuncs.com/64/64-6b.webp", "public/yilore-cards/yao/64-6b.webp"),
    ]
    download_jobs.extend(specific_yao_urls)

    # App assets (heluo-cards & domain icons)
    app_assets = [
        (f"{BASE_WEB}/app-assets/heluo-cards/red_icon.svg", "public/app-assets/heluo-cards/red_icon.svg"),
        (f"{BASE_WEB}/app-assets/heluo-cards/destiny_frame.svg", "public/app-assets/heluo-cards/destiny_frame.svg"),
        (f"{BASE_WEB}/app-assets/heluo-cards/destiny_divider.svg", "public/app-assets/heluo-cards/destiny_divider.svg"),
        (f"{BASE_WEB}/app-assets/heluo-cards/yuantangframe.svg", "public/app-assets/heluo-cards/yuantangframe.svg"),
        (f"{BASE_WEB}/app-assets/heluo-cards/gua_placeholder_front.png", "public/app-assets/heluo-cards/gua_placeholder_front.png"),
        (f"{BASE_WEB}/app-assets/heluo-cards/yao_placeholder_front.png", "public/app-assets/heluo-cards/yao_placeholder_front.png"),
        (f"{BASE_WEB}/1.webp", "public/yilore-assets/domain_1_career.webp"),
        (f"{BASE_WEB}/2.webp", "public/yilore-assets/domain_2_love.webp"),
        (f"{BASE_WEB}/3.webp", "public/yilore-assets/domain_3_wealth.webp"),
        (f"{BASE_WEB}/4.webp", "public/yilore-assets/domain_4_health.webp"),
    ]
    download_jobs.extend(app_assets)

    print(f"Downloading {len(download_jobs)} card & visual assets with 24 threads...")
    ok_count = 0
    fail_count = 0
    with ThreadPoolExecutor(max_workers=24) as ex:
        fut_map = {ex.submit(download_file, url, dst): (url, dst) for url, dst in download_jobs}
        for fut in as_completed(fut_map):
            url, dst = fut_map[fut]
            ok, msg = fut.result()
            if ok:
                ok_count += 1
            else:
                fail_count += 1
                print(f"  [FAIL] {url} -> {msg}")

    print(f"Asset download complete: {ok_count} succeeded, {fail_count} failed.")

if __name__ == "__main__":
    main()
