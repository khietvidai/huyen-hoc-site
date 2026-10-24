import sys
import json
import re
import asyncio
from pathlib import Path

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

from camoufox.async_api import AsyncCamoufox

ROOT_DIR = Path(__file__).resolve().parent.parent
PROFILE_DIR = ROOT_DIR / ".camoufox_yilore_profile"
SCAN_DIR = ROOT_DIR / "data" / "yilore_scan"
SCREENSHOTS_DIR = SCAN_DIR / "screenshots"
CHUNKS_DIR = SCAN_DIR / "chunks"

ROUTES = [
    ("daily_guidance", "https://www.yilore.app/en/app/daily-guidance"),
    ("chat", "https://www.yilore.app/en/app/chat"),
    ("history", "https://www.yilore.app/en/app/history"),
    ("memory", "https://www.yilore.app/en/app/memory-management"),
    ("profile", "https://www.yilore.app/en/app/profile"),
    ("relationships", "https://www.yilore.app/en/app/relationships"),
]


async def extract_route_dom(page, name: str):
    return await page.evaluate(
        """(name) => {
        const text = (el) => (el.innerText || el.textContent || '').trim();
        return {
            name,
            url: location.href,
            title: document.title,
            bodyText: document.body.innerText,
            html: document.querySelector('main') ? document.querySelector('main').outerHTML : document.body.innerHTML,
            buttons: Array.from(document.querySelectorAll('button')).map(b => ({
                text: text(b),
                ariaLabel: b.getAttribute('aria-label'),
                title: b.getAttribute('title'),
                className: b.className,
            })),
            inputs: Array.from(document.querySelectorAll('input, textarea, select')).map(i => ({
                tag: i.tagName.toLowerCase(),
                type: i.getAttribute('type'),
                placeholder: i.getAttribute('placeholder'),
                ariaLabel: i.getAttribute('aria-label'),
                value: i.value,
                className: i.className,
            })),
        };
    }""",
        name,
    )


async def main():
    SCREENSHOTS_DIR.mkdir(parents=True, exist_ok=True)
    CHUNKS_DIR.mkdir(parents=True, exist_ok=True)

    api_calls = []
    route_snapshots = {}

    async with AsyncCamoufox(
        headless=False,
        persistent_context=True,
        user_data_dir=str(PROFILE_DIR),
        os="windows",
        window=(1440, 900),
    ) as context:
        page = context.pages[0] if context.pages else await context.new_page()

        async def on_response(response):
            url = response.url
            ct = response.headers.get("content-type", "")
            try:
                if "api.yilore" in url or "/api/" in url:
                    body = await response.text()
                    api_calls.append(
                        {
                            "url": url,
                            "method": response.request.method,
                            "status": response.status,
                            "requestBody": response.request.post_data,
                            "responseBody": body[:20000],
                        }
                    )
                elif "/_next/static/chunks/" in url and url.endswith(".js"):
                    c_name = url.split("/")[-1].split("?")[0]
                    if not (CHUNKS_DIR / c_name).exists():
                        body = await response.text()
                        (CHUNKS_DIR / c_name).write_text(body, encoding="utf-8")
            except Exception:
                pass

        page.on("response", on_response)

        for r_name, r_url in ROUTES:
            print(f"[Crawler] Đang quét route '{r_name}': {r_url}", flush=True)
            await page.goto(r_url, wait_until="domcontentloaded", timeout=60000)
            await asyncio.sleep(3.5)
            await page.screenshot(path=str(SCREENSHOTS_DIR / f"route_{r_name}.png"), full_page=True)
            route_snapshots[r_name] = await extract_route_dom(page, r_name)

            # Trên trang daily_guidance, thử mở nút Draw và Settings
            if r_name == "daily_guidance":
                try:
                    draw_btn = page.locator('button:has-text("Draw")').first
                    if await draw_btn.count() > 0 and await draw_btn.is_visible():
                        print("[Crawler] Đang click nút 'Draw'...", flush=True)
                        await draw_btn.click(timeout=3000)
                        await asyncio.sleep(2.5)
                        await page.screenshot(path=str(SCREENSHOTS_DIR / "modal_draw.png"), full_page=True)
                        route_snapshots["modal_draw"] = await extract_route_dom(page, "modal_draw")
                        # Đóng modal nếu có nút close hoặc nhấn Escape
                        await page.keyboard.press("Escape")
                        await asyncio.sleep(1)
                except Exception as e:
                    print(f"[Crawler] Lỗi khi mở Draw: {e}", flush=True)

                try:
                    # Click nút bánh răng Settings ở góc phải header
                    header_btns = page.locator("header button")
                    cnt = await header_btns.count()
                    if cnt > 0:
                        await header_btns.nth(cnt - 1).click(timeout=3000)
                        await asyncio.sleep(1.5)
                        await page.screenshot(path=str(SCREENSHOTS_DIR / "modal_settings.png"), full_page=True)
                        route_snapshots["modal_settings"] = await extract_route_dom(page, "modal_settings")
                        await page.keyboard.press("Escape")
                except Exception as e:
                    print(f"[Crawler] Lỗi khi mở Settings: {e}", flush=True)

        # Lưu kết quả
        (SCAN_DIR / "yilore_routes_scan.json").write_text(
            json.dumps(
                {"apiCalls": api_calls, "routes": route_snapshots},
                ensure_ascii=False,
                indent=2,
            ),
            encoding="utf-8",
        )
        print(f"[Crawler] Đã quét xong {len(route_snapshots)} views và {len(api_calls)} API calls!", flush=True)


if __name__ == "__main__":
    asyncio.run(main())
