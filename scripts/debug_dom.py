import sys
import asyncio
import urllib.parse

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
        
        # In các thẻ liên kết và class
        info = await page.evaluate('''() => {
            const allLinks = Array.from(document.querySelectorAll('a')).map(a => ({
                href: a.href,
                text: a.innerText.slice(0, 100),
                h3: a.querySelector('h3') ? a.querySelector('h3').innerText : null,
                parentTag: a.parentElement ? a.parentElement.tagName : null
            })).filter(x => x.text && x.text.length > 5);
            return {
                title: document.title,
                bodySnippet: document.body.innerText.slice(0, 800),
                links: allLinks.slice(0, 15)
            };
        }''')
        
        print("Page Title:", info['title'])
        print("Body Snippet:\n", info['bodySnippet'])
        print("Sample Links:")
        for l in info['links']:
            print("-", l)

if __name__ == "__main__":
    asyncio.run(main())
