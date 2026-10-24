import asyncio
import json
import os
import sys
from camoufox.async_api import AsyncCamoufox

sys.stdout.reconfigure(encoding="utf-8")

OUT_DIR = r"c:\Users\Admin\Downloads\Ichingtarot\data\hexagram_audit_screenshots"
os.makedirs(OUT_DIR, exist_ok=True)


async def main():
    async with AsyncCamoufox(headless=True) as browser:
        page = await browser.new_page(viewport={"width": 1440, "height": 950})

        print("1. Visiting live /vi/hexagram/qiangua1...")
        await page.goto(
            "https://ichingtarot.com/vi/hexagram/qiangua1",
            wait_until="networkidle",
            timeout=60000,
        )
        await page.wait_for_timeout(1500)
        await page.screenshot(
            path=os.path.join(OUT_DIR, "03_live_qiangua1_top.png"),
            full_page=False,
        )

        await page.evaluate(
            "document.getElementById('yilore-reading')?.scrollIntoView({behavior: 'instant'})"
        )
        await page.wait_for_timeout(1000)
        await page.screenshot(
            path=os.path.join(OUT_DIR, "04_live_qiangua1_cards.png"),
            full_page=False,
        )

        await page.evaluate(
            "document.getElementById('divination')?.scrollIntoView({behavior: 'instant'})"
        )
        await page.wait_for_timeout(1000)
        await page.screenshot(
            path=os.path.join(OUT_DIR, "05_live_qiangua1_divination.png"),
            full_page=False,
        )

        await page.evaluate(
            "document.getElementById('yao-ci')?.scrollIntoView({behavior: 'instant'})"
        )
        await page.wait_for_timeout(1000)
        await page.screenshot(
            path=os.path.join(OUT_DIR, "06_live_qiangua1_yaoci.png"),
            full_page=False,
        )

        print("2. Visiting live /vi/hexagram/qiangua1/yao-1...")
        await page.goto(
            "https://ichingtarot.com/vi/hexagram/qiangua1/yao-1",
            wait_until="networkidle",
            timeout=60000,
        )
        await page.wait_for_timeout(1500)
        await page.screenshot(
            path=os.path.join(OUT_DIR, "07_live_qiangua1_yao1_top.png"),
            full_page=False,
        )
        await page.evaluate(
            "document.getElementById('yilore-reading')?.scrollIntoView({behavior: 'instant'})"
        )
        await page.wait_for_timeout(1000)
        await page.screenshot(
            path=os.path.join(OUT_DIR, "08_live_qiangua1_yao1_cards.png"),
            full_page=False,
        )

        print("3. Visiting live /vi/hexagram/zhungua3...")
        await page.goto(
            "https://ichingtarot.com/vi/hexagram/zhungua3",
            wait_until="networkidle",
            timeout=60000,
        )
        await page.wait_for_timeout(1500)
        await page.screenshot(
            path=os.path.join(OUT_DIR, "09_live_zhungua3_top.png"),
            full_page=False,
        )

        print("Done capturing live screenshots!")


if __name__ == "__main__":
    asyncio.run(main())
