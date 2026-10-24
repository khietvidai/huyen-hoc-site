import sys
import json
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
STATE_FILE = SCAN_DIR / "storage_state.json"


async def extract_page_state(page, label: str):
    """Extract comprehensive UI, DOM, style, and interactive elements from the current view."""
    return await page.evaluate(
        """(label) => {
        const getVisibleText = (el) => (el.innerText || el.textContent || '').trim();
        const getComputedTheme = () => {
            const bodyStyle = window.getComputedStyle(document.body);
            const rootStyle = window.getComputedStyle(document.documentElement);
            return {
                bodyBg: bodyStyle.backgroundColor,
                bodyColor: bodyStyle.color,
                bodyFont: bodyStyle.fontFamily,
                rootFont: rootStyle.fontFamily,
            };
        };

        const buttons = Array.from(document.querySelectorAll('button, [role="button"]')).map((b, idx) => ({
            idx,
            text: getVisibleText(b).slice(0, 120),
            ariaLabel: b.getAttribute('aria-label'),
            title: b.getAttribute('title'),
            className: typeof b.className === 'string' ? b.className : '',
            disabled: b.disabled || false,
            rect: b.getBoundingClientRect().toJSON(),
        })).filter(b => b.rect.width > 0 && b.rect.height > 0);

        const links = Array.from(document.querySelectorAll('a[href]')).map(a => ({
            text: getVisibleText(a).slice(0, 120),
            href: a.getAttribute('href'),
            fullHref: a.href,
            className: typeof a.className === 'string' ? a.className : '',
        }));

        const inputs = Array.from(document.querySelectorAll('input, textarea, select')).map(i => ({
            tag: i.tagName.toLowerCase(),
            type: i.getAttribute('type') || '',
            placeholder: i.getAttribute('placeholder') || '',
            name: i.getAttribute('name') || '',
            id: i.getAttribute('id') || '',
            value: i.value || '',
            className: typeof i.className === 'string' ? i.className : '',
        }));

        const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
            tag: h.tagName.toLowerCase(),
            text: getVisibleText(h),
            className: typeof h.className === 'string' ? h.className : '',
        }));

        const scripts = Array.from(document.querySelectorAll('script[src]')).map(s => s.src);

        const svgs = Array.from(document.querySelectorAll('svg')).slice(0, 50).map(svg => ({
            viewBox: svg.getAttribute('viewBox'),
            className: svg.getAttribute('class') || '',
            outerHTML: svg.outerHTML.slice(0, 1500),
        }));

        return {
            label,
            url: window.location.href,
            title: document.title,
            theme: getComputedTheme(),
            headings,
            buttons,
            links,
            inputs,
            scripts,
            svgCount: document.querySelectorAll('svg').length,
            svgs,
            bodyText: document.body.innerText,
            bodyHtmlSample: document.body.innerHTML.slice(0, 50000),
        };
    }""",
        label,
    )


async def main():
    SCAN_DIR.mkdir(parents=True, exist_ok=True)
    SCREENSHOTS_DIR.mkdir(parents=True, exist_ok=True)
    CHUNKS_DIR.mkdir(parents=True, exist_ok=True)

    saved_state = None
    if STATE_FILE.exists():
        saved_state = json.loads(STATE_FILE.read_text(encoding="utf-8"))

    network_logs = []
    js_chunks = {}

    print("[Scanner] Khởi chạy Camoufox với persistent profile...", flush=True)
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
            status = response.status
            ct = response.headers.get("content-type", "")
            try:
                if "yilore" in url or "supabase" in url or "api" in url:
                    if "json" in ct or "text/x-component" in ct or "/api/" in url or "rest/v1" in url:
                        body = await response.text()
                        network_logs.append(
                            {
                                "url": url,
                                "method": response.request.method,
                                "status": status,
                                "contentType": ct,
                                "requestPostData": response.request.post_data,
                                "responseBody": body[:10000],
                            }
                        )
                    elif "/_next/static/chunks/" in url and url.endswith(".js"):
                        body = await response.text()
                        chunk_name = url.split("/")[-1].split("?")[0]
                        js_chunks[chunk_name] = url
                        (CHUNKS_DIR / chunk_name).write_text(body, encoding="utf-8")
            except Exception:
                pass

        page.on("response", on_response)

        print("[Scanner] Đang truy cập https://www.yilore.app/en/app ...", flush=True)
        await page.goto("https://www.yilore.app/en/app", wait_until="domcontentloaded", timeout=60000)
        await asyncio.sleep(3)

        # Kiểm tra và khôi phục localStorage nếu cần
        if saved_state and saved_state.get("origins"):
            for origin_entry in saved_state["origins"]:
                if "yilore.app" in origin_entry.get("origin", ""):
                    ls_items = origin_entry.get("localStorage", [])
                    has_auth = await page.evaluate("() => !!localStorage.getItem('yilore_web_auth_v1')")
                    if not has_auth and ls_items:
                        print("[Scanner] Đang nạp lại yilore_web_auth_v1 vào localStorage...", flush=True)
                        for item in ls_items:
                            await page.evaluate(
                                "([k, v]) => localStorage.setItem(k, v)",
                                [item["name"], item["value"]],
                            )
                        await page.goto("https://www.yilore.app/en/app", wait_until="domcontentloaded", timeout=60000)
                        await asyncio.sleep(4)

        await asyncio.sleep(3)
        auth_val = await page.evaluate("() => localStorage.getItem('yilore_web_auth_v1')")
        print(f"[Scanner] Trạng thái Auth: {'ĐÃ ĐĂNG NHẬP' if auth_val else 'CHƯA ĐĂNG NHẬP'}", flush=True)
        print(f"[Scanner] URL hiện tại: {page.url}", flush=True)

        views = []

        # 1. Chụp và trích xuất màn hình chính /en/app
        await page.screenshot(path=str(SCREENSHOTS_DIR / "01_app_main.png"), full_page=True)
        main_state = await extract_page_state(page, "01_app_main")
        views.append(main_state)
        print(
            f"[Scanner] Main view: {len(main_state['buttons'])} buttons, {len(main_state['links'])} links, {len(main_state['inputs'])} inputs",
            flush=True,
        )

        # 2. Tải tất cả script chunks trên trang nếu chưa bắt được qua response
        for s_url in main_state.get("scripts", []):
            if "/_next/static/" in s_url and s_url.endswith(".js"):
                c_name = s_url.split("/")[-1].split("?")[0]
                if not (CHUNKS_DIR / c_name).exists():
                    try:
                        txt = await page.evaluate(
                            "async (u) => { const r = await fetch(u); return await r.text(); }",
                            s_url,
                        )
                        (CHUNKS_DIR / c_name).write_text(txt, encoding="utf-8")
                        js_chunks[c_name] = s_url
                    except Exception:
                        pass

        # 3. Duyệt qua các tab/button điều hướng trên trang /en/app
        btn_texts = []
        for b in main_state["buttons"]:
            t = b["text"].strip()
            if t and t not in btn_texts and len(t) < 50:
                btn_texts.append(t)

        print(f"[Scanner] Các button phát hiện được: {btn_texts}", flush=True)

        for idx, b_text in enumerate(btn_texts[:15]):
            # Tránh bấm nút Logout / Sign out
            if any(w in b_text.lower() for w in ["log out", "logout", "sign out", "delete"]):
                continue
            try:
                loc = page.locator(f'button:has-text("{b_text}")').first
                if await loc.count() > 0 and await loc.is_visible():
                    print(f"[Scanner] Đang click thử button [{idx+1}]: '{b_text}'", flush=True)
                    await loc.click(timeout=3000)
                    await asyncio.sleep(2)
                    safe_name = "".join(c if c.isalnum() else "_" for c in b_text)[:30]
                    shot_name = f"btn_{idx+1:02d}_{safe_name}.png"
                    await page.screenshot(path=str(SCREENSHOTS_DIR / shot_name), full_page=True)
                    st = await extract_page_state(page, f"btn_{idx+1:02d}_{b_text}")
                    views.append(st)
                    # Nếu bị chuyển sang trang ngoài /en/app thì quay lại
                    if "/app" not in page.url:
                        await page.goto("https://www.yilore.app/en/app", wait_until="domcontentloaded")
                        await asyncio.sleep(2)
            except Exception as e:
                print(f"[Scanner] Bỏ qua button '{b_text}': {e}", flush=True)

        # 4. Quét thêm trang chủ /en để lấy tài nguyên và thiết kế nếu cần
        try:
            await page.goto("https://www.yilore.app/en", wait_until="domcontentloaded", timeout=30000)
            await asyncio.sleep(2)
            await page.screenshot(path=str(SCREENSHOTS_DIR / "00_landing_en.png"), full_page=True)
            landing_state = await extract_page_state(page, "00_landing_en")
            views.append(landing_state)
        except Exception as e:
            print(f"[Scanner] Lưu ý khi quét /en: {e}", flush=True)

        # Lưu toàn bộ kết quả
        blueprint = {
            "authenticated": bool(auth_val),
            "authData": json.loads(auth_val) if auth_val else None,
            "jsChunks": js_chunks,
            "networkLogs": network_logs,
            "views": views,
        }
        (SCAN_DIR / "yilore_blueprint.json").write_text(
            json.dumps(blueprint, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        print(f"[Scanner] Đã lưu blueprint tại: {SCAN_DIR / 'yilore_blueprint.json'}", flush=True)
        print(f"[Scanner] Đã tải {len(js_chunks)} JS chunks vào: {CHUNKS_DIR}", flush=True)
        print(f"[Scanner] Đã bắt {len(network_logs)} API/network logs.", flush=True)


if __name__ == "__main__":
    asyncio.run(main())
