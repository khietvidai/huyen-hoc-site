import sys
import asyncio
import urllib.parse
import json

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

from camoufox.async_api import AsyncCamoufox

async def main():
    async with AsyncCamoufox(headless=True) as browser:
        page = await browser.new_page()
        query = 'xin quẻ kinh dịch hỏi công việc'
        encoded_query = urllib.parse.quote_plus(query)
        forums_url = f"https://www.google.com/search?q={encoded_query}&udm=18&hl=vi"
        
        await page.goto(forums_url, wait_until="domcontentloaded")
        await asyncio.sleep(3)
        
        # Trích xuất chi tiết từng card kết quả
        cards = await page.evaluate('''() => {
            const results = [];
            // Tìm tất cả các container chứa liên kết đến trang ngoài
            const allLinks = document.querySelectorAll('#rso a, div.g a, div[data-hveid] a');
            for (const a of allLinks) {
                const href = a.href;
                if (!href || href.includes('google.com') || href.startsWith('javascript:')) continue;
                
                // Tìm tiêu đề và đoạn snippet
                let title = '';
                const h3 = a.querySelector('h3');
                if (h3) {
                    title = h3.innerText.trim();
                } else if (a.innerText && a.innerText.length > 15) {
                    title = a.innerText.split('\\n')[0].trim();
                }
                
                // Lấy snippet xung quanh
                let snippet = '';
                let parent = a.closest('div[data-hveid]') || a.parentElement;
                if (parent) {
                    snippet = parent.innerText.replace(title, '').replace(/\\n+/g, ' ').trim();
                }
                
                if (title && href && !results.some(r => r.url === href)) {
                    results.push({
                        title,
                        url: href,
                        snippet: snippet.slice(0, 200)
                    });
                }
            }
            return results;
        }''')
        
        print(f"Trích xuất được {len(cards)} card diễn đàn:")
        print(json.dumps(cards[:8], ensure_ascii=False, indent=2))

if __name__ == "__main__":
    asyncio.run(main())
