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
        
        links = await page.evaluate('''() => {
            return Array.from(document.querySelectorAll('a')).map(a => ({
                href: a.href,
                text: (a.innerText || '').slice(0, 100),
                h3: a.querySelector('h3') ? a.querySelector('h3').innerText : null
            })).filter(x => x.text && x.text.includes('Kinh Dịch') || x.text.includes('lyso.vn') || x.text.includes('nghỉ việc'));
        }''')
        
        print("Matching links:")
        print(json.dumps(links, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    asyncio.run(main())
