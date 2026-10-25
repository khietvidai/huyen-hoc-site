import asyncio
import json
import os
import sys
from camoufox.async_api import AsyncCamoufox

sys.stdout.reconfigure(encoding="utf-8")

OUT_DIR = r"c:\Users\Admin\Downloads\Ichingtarot\data\hexagram_audit_screenshots"
os.makedirs(OUT_DIR, exist_ok=True)
BASE_URL = os.environ.get("AUDIT_BASE_URL", "http://localhost:4173")


async def main():
    async with AsyncCamoufox(headless=True) as browser:
        page = await browser.new_page(viewport={"width": 1440, "height": 950})
        await page.set_extra_http_headers({"Cache-Control": "no-cache", "Pragma": "no-cache"})

        print(f"0. Visiting {BASE_URL}/vi/hexagram/...")
        await page.goto(
            f"{BASE_URL}/vi/hexagram/",
            wait_until="networkidle",
            timeout=60000,
        )
        await page.wait_for_timeout(1500)
        await page.screenshot(
            path=os.path.join(OUT_DIR, "after_01_live_catalog.png"),
            full_page=False,
        )

        print(f"1. Visiting {BASE_URL}/vi/hexagram/qiangua1...")
        await page.goto(
            f"{BASE_URL}/vi/hexagram/qiangua1/",
            wait_until="networkidle",
            timeout=60000,
        )
        await page.wait_for_timeout(1500)
        await page.screenshot(
            path=os.path.join(OUT_DIR, "after_03_live_qiangua1_top.png"),
            full_page=False,
        )

        await page.evaluate(
            "document.getElementById('yilore-reading')?.scrollIntoView({behavior: 'instant'})"
        )
        await page.wait_for_timeout(1200)
        await page.screenshot(
            path=os.path.join(OUT_DIR, "after_04_live_qiangua1_cards.png"),
            full_page=False,
        )

        await page.evaluate(
            "document.getElementById('divination')?.scrollIntoView({behavior: 'instant'})"
        )
        await page.wait_for_timeout(1000)
        await page.screenshot(
            path=os.path.join(OUT_DIR, "after_05_live_qiangua1_divination.png"),
            full_page=False,
        )

        await page.evaluate(
            "document.getElementById('yao-ci')?.scrollIntoView({behavior: 'instant'})"
        )
        await page.wait_for_timeout(1200)
        await page.screenshot(
            path=os.path.join(OUT_DIR, "after_06_live_qiangua1_yaoci.png"),
            full_page=False,
        )

        print(f"2. Visiting {BASE_URL}/vi/hexagram/qiangua1/yao-1/...")
        await page.goto(
            f"{BASE_URL}/vi/hexagram/qiangua1/yao-1/",
            wait_until="networkidle",
            timeout=60000,
        )
        await page.wait_for_timeout(1500)
        await page.screenshot(
            path=os.path.join(OUT_DIR, "after_07_live_qiangua1_yao1_top.png"),
            full_page=False,
        )
        await page.evaluate(
            "document.getElementById('yilore-reading')?.scrollIntoView({behavior: 'instant'})"
        )
        await page.wait_for_timeout(1200)
        await page.screenshot(
            path=os.path.join(OUT_DIR, "after_08_live_qiangua1_yao1_cards.png"),
            full_page=False,
        )

        print(f"3. Visiting {BASE_URL}/vi/hexagram/zhungua3/...")
        await page.goto(
            f"{BASE_URL}/vi/hexagram/zhungua3/",
            wait_until="networkidle",
            timeout=60000,
        )
        await page.wait_for_timeout(1500)
        await page.screenshot(
            path=os.path.join(OUT_DIR, "after_09_live_zhungua3_top.png"),
            full_page=False,
        )

        print(f"4. Visiting {BASE_URL}/vi/hexagram/weijigua64/...")
        await page.goto(
            f"{BASE_URL}/vi/hexagram/weijigua64/",
            wait_until="networkidle",
            timeout=60000,
        )
        await page.wait_for_timeout(1500)
        await page.evaluate(
            "document.getElementById('yilore-reading')?.scrollIntoView({behavior: 'instant'})"
        )
        await page.wait_for_timeout(1200)
        await page.screenshot(
            path=os.path.join(OUT_DIR, "after_10_live_weijigua64_cards.png"),
            full_page=False,
        )

        print("Done capturing after-fix live screenshots!")


if __name__ == "__main__":
    asyncio.run(main())
