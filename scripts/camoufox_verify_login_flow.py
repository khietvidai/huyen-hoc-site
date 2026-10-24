import sys
import asyncio
from camoufox.async_api import AsyncCamoufox

sys.stdout.reconfigure(encoding="utf-8")


async def verify():
    async with AsyncCamoufox(headless=True) as browser:
        page = await browser.new_page(viewport={"width": 1440, "height": 900})
        await page.goto("http://localhost:5168/", wait_until="domcontentloaded")
        btn = page.locator("#btn-use-on-web")
        await btn.wait_for(state="visible", timeout=15000)
        await asyncio.sleep(0.5)

        # Scroll to and click 'Bắt đầu ngay' (#btn-use-on-web)
        await btn.scroll_into_view_if_needed()
        await asyncio.sleep(0.3)
        await btn.click()
        await asyncio.sleep(0.8)

        url_after_click = page.url
        body_text_gate = await page.locator("body").inner_text()
        print("URL after clicking Bắt đầu ngay:", url_after_click)
        assert "/en/app" in url_after_click, f"Expected /en/app in {url_after_click}"
        assert "ĐĂNG NHẬP CỬU NHỊ" in body_text_gate, "Expected login modal on /en/app when not logged in"
        await page.screenshot(path="data/yilore_scan/audit/login_gate_en_app.png")

        # Log in with cuunhi / 999999
        await page.locator('input[placeholder*="cuunhi"]').fill("cuunhi")
        await page.locator('input[type="password"]').fill("999999")
        await page.locator('button[type="submit"]:has-text("ĐĂNG NHẬP NGAY")').click()
        await asyncio.sleep(1.0)

        url_after_login = page.url
        body_text_app = await page.locator("body").inner_text()
        print("URL after login:", url_after_login)
        assert "/en/app" in url_after_login
        assert "ĐĂNG NHẬP CỬU NHỊ" not in body_text_app
        assert "sổ tay" in body_text_app.lower()
        assert "Quản trị viên" in body_text_app
        await page.screenshot(path="data/yilore_scan/audit/logged_in_en_app.png")

        # Test clicking 'Đăng xuất' inside /en/app returns to /
        await page.locator('aside button:has-text("Đăng xuất")').click()
        await asyncio.sleep(0.8)
        print("URL after logout:", page.url)
        assert page.url.rstrip("/") == "http://localhost:5168"
        print("ALL ASSERTIONS PASSED!")


if __name__ == "__main__":
    asyncio.run(verify())
