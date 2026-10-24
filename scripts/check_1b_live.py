import asyncio
from camoufox.async_api import AsyncCamoufox

async def main():
    async with AsyncCamoufox(headless=True) as browser:
        page = await browser.new_page(viewport={"width": 1440, "height": 950})
        await page.goto("https://ichingtarot.com/vi/hexagram/qiangua1", wait_until="networkidle")
        await page.evaluate("document.getElementById('yilore-reading').scrollIntoView({behavior: 'instant'})")
        await page.wait_for_timeout(2000)
        info = await page.evaluate("""() => {
            const imgs = Array.from(document.querySelectorAll('#yilore-reading img'));
            return imgs.map(img => ({
                src: img.getAttribute('src'),
                currentSrc: img.currentSrc,
                complete: img.complete,
                naturalWidth: img.naturalWidth,
                naturalHeight: img.naturalHeight,
                rect: img.getBoundingClientRect(),
                parentHtml: img.parentElement.outerHTML.slice(0, 300)
            }));
        }""")
        print("Live #yilore-reading imgs:", info)

asyncio.run(main())
