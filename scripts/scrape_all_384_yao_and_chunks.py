import os
import re
import json
import html as html_lib
import urllib.request
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
    return "\n".join([l for l in lines if l]).strip()

def fetch_text(url, timeout=20):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read().decode("utf-8", errors="ignore")

def parse_yao_html(html_str, hex_num, slug, yao_idx, lang):
    m_main = re.search(r"<main[^>]*>(.*?)</main>", html_str, re.S)
    main_html = m_main.group(1) if m_main else html_str

    m_h1 = re.search(r"<h1[^>]*>(.*?)</h1>", main_html, re.S)
    title = strip_tags(m_h1.group(1)) if m_h1 else ""
    m_lead = re.search(r"<h1[^>]*>.*?</h1>\s*<p[^>]*>(.*?)</p>", main_html, re.S)
    subtitle = strip_tags(m_lead.group(1)) if m_lead else ""

    yao_text = ""
    tuan_commentary = ""
    image_commentary = ""
    overview_text = ""
    guaxiang_img = ""

    m_open = re.search(r'<section id="opening"[^>]*>(.*?)</section>', main_html, re.S)
    if m_open:
        sec = m_open.group(1)
        h3_blocks = re.findall(r"<h3[^>]*>(.*?)</h3>\s*<div[^>]*>(.*?)</div>", sec, re.S)
        if len(h3_blocks) >= 1:
            yao_text = strip_tags(h3_blocks[0][1])
        if len(h3_blocks) >= 2:
            tuan_commentary = strip_tags(h3_blocks[1][1])
        if len(h3_blocks) >= 3:
            image_commentary = strip_tags(h3_blocks[2][1])
        m_gx = re.search(r'<img[^>]+src="([^"]*guaxiang[^"]*)"', sec)
        if m_gx:
            guaxiang_img = html_lib.unescape(m_gx.group(1))
        m_ov = re.search(r'<div class="mt-6 prose[^"]*">(.*?)</div>\s*$', sec, re.S)
        if m_ov:
            overview_text = strip_tags(m_ov.group(1))

    card_front = ""
    card_back = ""
    reading_title = ""
    reading_body = ""
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
        reading_title = h2s[-1] if h2s else ""
        reading_body = strip_tags(sec)

    divination = {}
    m_div = re.search(r'<section id="divination"[^>]*>(.*?)</section>', main_html, re.S)
    if m_div:
        sec = m_div.group(1)
        for art in re.findall(r"<article[^>]*>(.*?)</article>", sec, re.S):
            ps = [strip_tags(p) for p in re.findall(r"<p[^>]*>(.*?)</p>", art, re.S)]
            if len(ps) >= 2:
                divination[ps[0]] = "\n".join(ps[1:])
            elif ps:
                divination["insight"] = ps[0]

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
        "yaoPosition": yao_idx,
        "lang": lang,
        "title": title,
        "subtitle": subtitle,
        "yaoText": yao_text,
        "tuanCommentary": tuan_commentary,
        "imageCommentary": image_commentary,
        "overview": overview_text,
        "guaxiangImage": guaxiang_img,
        "cardFrontImage": card_front,
        "cardBackImage": card_back,
        "readingTitle": reading_title,
        "readingBody": reading_body,
        "divination": divination,
        "faqs": faqs,
    }

def download_file(url, dest_path):
    if os.path.exists(dest_path) and os.path.getsize(dest_path) > 100:
        return True
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = resp.read()
            if len(data) > 50:
                with open(dest_path, "wb") as f:
                    f.write(data)
                return True
    except Exception:
        pass
    return False

def build_client_chunks_static_data():
    return {
        "tenGodDailyPicks": {
            "正官": {"basisZh": "今日十神·正官", "basisEn": "Ten god: Direct Officer", "dayBadgeZh": "规范日", "dayBadgeTw": "規範日", "dayBadgeEn": "Regulation Day", "do": "整理待办、走流程审批、和上级对齐目标", "avoid": "钻规则空子、顶撞权威、冲动辞职", "music": "古典钢琴、轻爵士，节奏平稳不吵", "verse": "欲穷千里目，更上一层楼", "verseAuthor": "王之涣《登鹳雀楼》"},
            "七杀": {"basisZh": "今日十神·七杀", "basisEn": "Ten god: Seven Killings", "dayBadgeZh": "破局日", "dayBadgeTw": "破局日", "dayBadgeEn": "Breakthrough Day", "do": "攻克难题、高强度健身、把压力转化成行动", "avoid": "和领导硬顶、危险冲动、带情绪做重大决定", "music": "鼓点清楚的运动 BGM、史诗感配乐", "verse": "将军百战穿金甲，不破楼兰终不还", "verseAuthor": "王昌龄"},
            "正印": {"basisZh": "今日十神·正印", "basisEn": "Ten god: Direct Resource", "dayBadgeZh": "治愈日", "dayBadgeTw": "治癒日", "dayBadgeEn": "Healing Day", "do": "上课进修、向前辈请教、早睡养精神", "avoid": "熬夜刷手机、固执不听劝、超负荷社交", "music": "古琴、钢琴独奏、疗愈纯音乐", "verse": "温故而知新，可以为师矣", "verseAuthor": "《论语》"},
            "偏印": {"basisZh": "今日十神·偏印", "basisEn": "Ten god: Indirect Resource", "dayBadgeZh": "静思日", "dayBadgeTw": "靜思日", "dayBadgeEn": "Contemplation Day", "do": "独处阅读、写日记、慢慢打磨灵感", "avoid": "急着公开发言、凑热闹式社交、信息过载", "music": "环境白噪音、低频纯音乐、独处歌单", "verse": "采菊东篱下，悠然见南山", "verseAuthor": "陶渊明"},
            "比肩": {"basisZh": "今日十神·比肩", "basisEn": "Ten god: Peer", "dayBadgeZh": "协作日", "dayBadgeTw": "協作日", "dayBadgeEn": "Collaboration Day", "do": "和伙伴平行协作、一起运动、互相打气", "avoid": "抢功争名、固执己见、无意义攀比", "music": "独立民谣、和同频朋友分享的歌单", "verse": "海内存知己，天涯若比邻", "verseAuthor": "王勃"},
            "劫财": {"basisZh": "今日十神·劫财", "basisEn": "Ten god: Rob Wealth", "dayBadgeZh": "社交日", "dayBadgeTw": "社交日", "dayBadgeEn": "Social Day", "do": "竞技运动、设定消费上限、把竞争转成动力", "avoid": "冲动大额消费、和人硬抢资源、赌运气", "music": "节奏快的流行、电子，释放竞争感", "verse": "君子之交淡如水，小人之交甘若醴", "verseAuthor": "《庄子》"},
            "食神": {"basisZh": "今日十神·食神", "basisEn": "Ten god: Eating God", "dayBadgeZh": "创意日", "dayBadgeTw": "創意日", "dayBadgeEn": "Creative Day", "do": "下厨、拍 vlog、写作输出、享受创造", "avoid": "暴饮暴食、拖延正事、只享乐不落地", "music": "轻快爵士、做饭时的背景音乐", "verse": "此中有真意，欲辨已忘言", "verseAuthor": "陶渊明"},
            "伤官": {"basisZh": "今日十神·伤官", "basisEn": "Ten god: Hurting Officer", "dayBadgeZh": "表达日", "dayBadgeTw": "表達日", "dayBadgeEn": "Expression Day", "do": "创作输出、表达观点、尝试新风格", "avoid": "嘴快伤人、冲动发帖、和长辈硬杠", "music": "摇滚、说唱、表达欲强的歌", "verse": "少年听雨歌楼上，红烛昏罗帐", "verseAuthor": "蒋捷《虞美人·听雨》"},
            "正财": {"basisZh": "今日十神·正财", "basisEn": "Ten god: Direct Wealth", "dayBadgeZh": "耕耘日", "dayBadgeTw": "耕耘日", "dayBadgeEn": "Harvest Day", "do": "记账复盘、踏实完成 KPI、整理账单", "avoid": "投机暴富幻想、乱签字合同、铺张浪费", "music": "稳重老歌、轻音乐，适合专注算账", "verse": "历览前贤国与家，成由勤俭破由奢", "verseAuthor": "李商隐"},
            "偏财": {"basisZh": "今日十神·偏财", "basisEn": "Ten god: Indirect Wealth", "dayBadgeZh": "奇遇日", "dayBadgeTw": "奇遇日", "dayBadgeEn": "Adventure Day", "do": "留意副业机会、轻社交局、小额试水", "avoid": "all in 赌博心态、轻信高回报、酒局逞强", "music": "都市流行、节奏明快的歌", "verse": "春风得意马蹄疾，一日看尽长安花", "verseAuthor": "孟郊"}
        },
        "fiveElementDailyPicks": {
            "wood": {"basisZh": "今日日柱·木", "basisEn": "Day vibe: Wood", "do": "户外走走、启动新计划、整理桌面", "avoid": "闷在屋里、把事堵到最后、对自己太苛刻", "music": "木吉他、清晨自然声", "verse": "春风又绿江南岸，明月何时照我还", "verseAuthor": "王安石"},
            "fire": {"basisZh": "今日日柱·火", "basisEn": "Day vibe: Fire", "do": "主动表达、展示作品、约朋友见面", "avoid": "情绪上头、熬夜耗能、说话不过脑子", "music": "热情流行、拉丁节奏", "verse": "欲把西湖比西子，淡妆浓抹总相宜", "verseAuthor": "苏轼"},
            "earth": {"basisZh": "今日日柱·土", "basisEn": "Day vibe: Earth", "do": "收拾房间、照顾身体、把琐事收尾", "avoid": "拖延不动、过度操心别人、吃太重口", "music": "舒缓民谣、踏实不躁的轻音乐", "verse": "采菊东篱下，悠然见南山", "verseAuthor": "陶渊明"},
            "metal": {"basisZh": "今日日柱·金", "basisEn": "Day vibe: Metal", "do": "断舍离、定规则、精简待办", "avoid": "说话太冲、钻牛角尖、对自己太狠", "music": "冷色调电子、古典弦乐", "verse": "晴空一鹤排云上，便引诗情到碧霄", "verseAuthor": "刘禹锡"},
            "water": {"basisZh": "今日日柱·水", "basisEn": "Day vibe: Water", "do": "泡澡放松、散步近水、写日记梳理情绪", "avoid": "胡思乱想、逃避沟通、沉溺短视频", "music": "爵士、蓝调、雨声白噪音", "verse": "行到水穷处，坐看云起时", "verseAuthor": "王维"}
        },
        "occasionCategories": [
            {"id": "meeting", "zh": "开会", "en": "Meeting", "focusShishen": "官杀", "intentId": "contract"},
            {"id": "interview", "zh": "面试", "en": "Interview", "focusShishen": "官杀", "intentId": "contract"},
            {"id": "focus", "zh": "专注", "en": "Focus", "focusShishen": "印", "intentId": "other"},
            {"id": "study", "zh": "学习", "en": "Study", "focusShishen": "印", "intentId": "other"},
            {"id": "social", "zh": "社交", "en": "Social", "focusShishen": "食伤", "intentId": "other"},
            {"id": "date", "zh": "约会", "en": "Date", "focusShishen": "食伤", "intentId": "other"},
            {"id": "contract", "zh": "签约", "en": "Contract", "focusShishen": "官杀", "intentId": "contract"},
            {"id": "travel", "zh": "出行", "en": "Travel", "focusShishen": "官杀", "intentId": "travel"},
            {"id": "money", "zh": "财务", "en": "Finance", "focusShishen": "财", "intentId": "opening"},
            {"id": "shopping", "zh": "购物", "en": "Shopping", "focusShishen": "财", "intentId": "opening"},
            {"id": "move", "zh": "搬家", "en": "Move", "focusShishen": "比劫", "intentId": "move"},
            {"id": "renovation", "zh": "装修", "en": "Renovation", "focusShishen": "比劫", "intentId": "renovation"},
            {"id": "opening", "zh": "开业", "en": "Opening", "focusShishen": "财", "intentId": "opening"},
            {"id": "rest", "zh": "休息", "en": "Rest", "focusShishen": "比劫", "intentId": "other"},
            {"id": "other", "zh": "其他", "en": "Other", "focusShishen": "印", "intentId": "other"}
        ],
        "hourStars12": {
            "青龙": {"zh": "偏吉：适合启动、推进重要事", "en": "Favorable: good for starting and pushing ahead"},
            "明堂": {"zh": "偏吉：适合公开、会面、展示", "en": "Favorable: good for meetings and visibility"},
            "金匮": {"zh": "偏吉：适合钱财、契约、收纳", "en": "Favorable: good for money and contracts"},
            "天德": {"zh": "偏吉：适合行善、求助、缓和", "en": "Favorable: good for help and smoothing things"},
            "玉堂": {"zh": "偏吉：适合学习、文书、签约", "en": "Favorable: good for study and paperwork"},
            "司命": {"zh": "偏吉：适合求医、问事、调理", "en": "Favorable: good for health and consultations"},
            "白虎": {"zh": "偏凶：宜稳不宜冲，忌冒险", "en": "Caution: avoid risks; keep steady"},
            "天刑": {"zh": "偏凶：宜守法，忌冲突争执", "en": "Caution: avoid conflict; stay lawful"},
            "朱雀": {"zh": "偏凶：忌口舌是非，慎发言", "en": "Caution: watch your words"},
            "玄武": {"zh": "偏凶：宜守不宜攻，不利开张", "en": "Caution: hold position; weak for launches"},
            "勾陈": {"zh": "偏凶：易拖延纠缠，事不宜急", "en": "Caution: delays and tangles likely"},
            "天牢": {"zh": "偏凶：易受阻，不宜远行硬闯", "en": "Caution: blockages; poor for hard pushes"}
        },
        "tenGodFocusAffinities": {
            "官杀": {"like": ["正印", "偏印", "正官", "七杀", "正财", "偏财"], "dislike": ["伤官", "食神"]},
            "印": {"like": ["正印", "偏印", "正官", "七杀"], "dislike": ["正财", "偏财"]},
            "食伤": {"like": ["食神", "伤官", "比肩", "劫财"], "dislike": ["正官", "七杀"]},
            "财": {"like": ["正财", "偏财", "食神", "伤官"], "dislike": ["比肩", "劫财"]},
            "比劫": {"like": ["比肩", "劫财", "正印", "偏印"], "dislike": ["正官", "七杀"]}
        }
    }

def main():
    os.makedirs("data/yilore_scan/scraped", exist_ok=True)

    # 1. Save client_chunks_static_data.json
    static_data = build_client_chunks_static_data()
    with open("data/yilore_scan/scraped/client_chunks_static_data.json", "w", encoding="utf-8") as f:
        json.dump(static_data, f, ensure_ascii=False, indent=2)
    print("Saved data/yilore_scan/scraped/client_chunks_static_data.json")

    # 2. Load hexagrams_64_full.json to get all 64 slugs
    with open("data/yilore_scan/scraped/hexagrams_64_full.json", "r", encoding="utf-8") as f:
        hex_list = json.load(f)

    # 3. Scrape all 384 Changing Lines in zh-TW and en (768 pages)
    print("Scraping all 384 Changing Line pages in zh-TW and en (768 pages) with 32 threads...")
    yao_zh = {}
    yao_en = {}

    def fetch_yao_job(hex_num, slug, yao_idx, lang):
        url = f"{BASE_WEB}/{lang}/hexagram/{slug}/yao-{yao_idx}"
        try:
            h_str = fetch_text(url, timeout=20)
            parsed = parse_yao_html(h_str, hex_num, slug, yao_idx, lang)
            return hex_num, yao_idx, lang, parsed, None
        except Exception as e:
            return hex_num, yao_idx, lang, None, str(e)

    with ThreadPoolExecutor(max_workers=32) as ex:
        futs = []
        for item in hex_list:
            num = item["hexagramNumber"]
            slug = item["slug"]
            for y_idx in range(1, 7):
                futs.append(ex.submit(fetch_yao_job, num, slug, y_idx, "zh-TW"))
                futs.append(ex.submit(fetch_yao_job, num, slug, y_idx, "en"))
        for fut in as_completed(futs):
            num, y_idx, lang, parsed, err = fut.result()
            if parsed:
                if lang == "zh-TW":
                    yao_zh[(num, y_idx)] = parsed
                else:
                    yao_en[(num, y_idx)] = parsed

    print(f"Scraped {len(yao_zh)}/384 zh-TW yao pages and {len(yao_en)}/384 EN yao pages!")

    merged_yao = []
    for item in hex_list:
        num = item["hexagramNumber"]
        slug = item["slug"]
        for y_idx in range(1, 7):
            merged_yao.append({
                "hexagramNumber": num,
                "slug": slug,
                "yaoPosition": y_idx,
                "zh": yao_zh.get((num, y_idx), {}),
                "en": yao_en.get((num, y_idx), {}),
            })

    with open("data/yilore_scan/scraped/yao_384_full.json", "w", encoding="utf-8") as f:
        json.dump(merged_yao, f, ensure_ascii=False, indent=2)
    print("Saved data/yilore_scan/scraped/yao_384_full.json")

    # 4. Download all 384 Yao card front images into public/yilore-cards/yao_all/
    yao_dl_jobs = []
    for n in range(1, 65):
        for y_idx in range(1, 7):
            yao_dl_jobs.append((
                f"https://yilore-cards.oss-cn-hangzhou.aliyuncs.com/{n}/{n}-{y_idx}a.webp",
                f"public/yilore-cards/yao_all/{n}-{y_idx}a.webp"
            ))

    print(f"Downloading {len(yao_dl_jobs)} Yao card images with 32 threads...")
    ok_cnt = 0
    with ThreadPoolExecutor(max_workers=32) as ex:
        futs = [ex.submit(download_file, u, d) for u, d in yao_dl_jobs]
        for fut in as_completed(futs):
            if fut.result():
                ok_cnt += 1
    print(f"Downloaded {ok_cnt}/{len(yao_dl_jobs)} Yao card images into public/yilore-cards/yao_all/")

if __name__ == "__main__":
    main()
