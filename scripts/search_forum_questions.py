import sys
import asyncio
import urllib.parse
import json
import os
import httpx

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

from camoufox.async_api import AsyncCamoufox

QUERIES = [
    {
        "category": "Kinh Dịch - Công việc & Khởi nghiệp",
        "query": "xin quẻ kinh dịch hỏi công việc"
    },
    {
        "category": "Kinh Dịch - Tình duyên & Hôn nhân",
        "query": "xin quẻ kinh dịch tình duyên"
    },
    {
        "category": "Tarot - Nhờ giải trải bài tình cảm",
        "query": "nhờ luận giải trải bài tarot tình yêu"
    },
    {
        "category": "Tarot - Định hướng tương lai & sự nghiệp",
        "query": "trải bài tarot định hướng công việc diễn đàn"
    },
    {
        "category": "Kinh Dịch & Tarot - Giải quẻ & Luận giải",
        "query": "nhờ giải quẻ dịch online"
    }
]

async def resolve_url(client: httpx.AsyncClient, raw_url: str) -> str:
    """Giải mã nhanh link google.com/goto?url hoặc google.com/url sang URL diễn đàn thực tế."""
    if not raw_url:
        return ""
    if "google.com/goto?url=" in raw_url:
        try:
            r = await client.get(raw_url, follow_redirects=False, timeout=3.0)
            loc = r.headers.get("Location")
            if loc:
                return loc
        except Exception:
            pass
    elif "google.com/url?q=" in raw_url:
        parsed = urllib.parse.urlparse(raw_url)
        params = urllib.parse.parse_qs(parsed.query)
        if "q" in params:
            return params["q"][0]
    return raw_url

async def scrape_google_forums(browser, client, query_info):
    category = query_info["category"]
    query = query_info["query"]
    encoded_query = urllib.parse.quote_plus(query)
    url = f"https://www.google.com/search?q={encoded_query}&udm=18&hl=vi"
    
    print(f"\n[Scraper] Đang tìm kiếm: '{query}' trên tab Diễn đàn...", flush=True)
    page = await browser.new_page()
    results = []
    
    try:
        await page.goto(url, wait_until="domcontentloaded", timeout=25000)
        await asyncio.sleep(2.5)
        
        # Trích xuất các bài thảo luận từ DOM
        raw_items = await page.evaluate('''() => {
            const items = [];
            const links = Array.from(document.querySelectorAll('a'));
            for (const a of links) {
                const text = (a.innerText || '').trim();
                const href = a.href || '';
                const h3 = a.querySelector('h3');
                if (h3 && href && (href.includes('/goto?url=') || (!href.includes('google.com') && href.startsWith('http')))) {
                    const title = h3.innerText.trim();
                    const snippet = text.replace(title, '').replace(/\\n+/g, ' ').trim();
                    items.push({ title, snippet, href });
                }
            }
            return items;
        }''')
        
        # Giải mã link đồng thời bằng asyncio.gather
        tasks = [resolve_url(client, item["href"]) for item in raw_items]
        resolved_urls = await asyncio.gather(*tasks)
        
        seen_urls = set()
        for item, final_url in zip(raw_items, resolved_urls):
            target_url = final_url if final_url else item["href"]
            if target_url and target_url not in seen_urls and not target_url.startswith("https://support.google.com"):
                seen_urls.add(target_url)
                results.append({
                    "category": category,
                    "search_query": query,
                    "title": item["title"],
                    "question_snippet": item["snippet"][:250],
                    "url": target_url
                })
                
    except Exception as e:
        print(f"[Scraper Error] Lỗi khi cào query '{query}': {e}", flush=True)
    finally:
        await page.close()
        
    print(f"[Scraper] Thu thập được {len(results)} câu hỏi phù hợp cho chủ đề này.", flush=True)
    return results

async def main():
    print("=" * 60, flush=True)
    print("Bắt đầu thu thập câu hỏi trên Diễn đàn Google qua Camoufox...", flush=True)
    print("=" * 60, flush=True)
    
    all_results = []
    async with httpx.AsyncClient(headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}) as client:
        async with AsyncCamoufox(headless=True) as browser:
            for q in QUERIES:
                res = await scrape_google_forums(browser, client, q)
                all_results.extend(res)
                await asyncio.sleep(1.0)
                
    # Lưu vào thư mục data
    os.makedirs("data", exist_ok=True)
    json_path = os.path.join("data", "forum_questions_ichingtarot.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(all_results, f, ensure_ascii=False, indent=2)
        
    md_path = os.path.join("data", "forum_questions_ichingtarot.md")
    with open(md_path, "w", encoding="utf-8") as f:
        f.write("# Danh Sách Câu Hỏi Diễn Đàn Tiềm Năng Cho Thương Hiệu IchingTarot\n\n")
        f.write(f"Tổng số bài viết tìm thấy: {len(all_results)}\n\n")
        
        for idx, item in enumerate(all_results, 1):
            f.write(f"### {idx}. {item['title']}\n")
            f.write(f"- **Chủ đề:** {item['category']}\n")
            f.write(f"- **Nội dung / Câu hỏi:** {item['question_snippet']}\n")
            f.write(f"- **URL:** [{item['url']}]({item['url']})\n\n")
            
    print("\n" + "=" * 60, flush=True)
    print(f"Hoàn thành! Đã tổng hợp {len(all_results)} bài viết & câu hỏi vào:", flush=True)
    print(f"- JSON: {json_path}", flush=True)
    print(f"- Markdown: {md_path}", flush=True)
    print("=" * 60, flush=True)

if __name__ == "__main__":
    asyncio.run(main())
