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
        
        # Tìm các link kết quả thảo luận
        items = await page.evaluate('''() => {
            const results = [];
            const links = Array.from(document.querySelectorAll('a'));
            for (const a of links) {
                const text = a.innerText || '';
                const href = a.href || '';
                // Lọc những liên kết ngoài có nội dung tiêu đề đáng kể
                if (href && !href.includes('google.com') && !href.startsWith('javascript:') && text.trim().length > 15) {
                    // Lấy đoạn văn bản xung quanh hoặc tiêu đề
                    const lines = text.trim().split('\\n').map(s => s.trim()).filter(Boolean);
                    results.push({
                        title: lines[0],
                        snippet: lines.slice(1).join(' - '),
                        url: href
                    });
                }
            }
            return results;
        }''')
        
        print(f"Tìm thấy {len(items)} kết quả:")
        print(json.dumps(items[:10], ensure_ascii=False, indent=2))

if __name__ == "__main__":
    asyncio.run(main())
