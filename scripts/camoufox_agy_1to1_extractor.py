import sys
import re
import json
import asyncio
import urllib.parse
import urllib.request
import subprocess
from pathlib import Path

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

from camoufox.async_api import AsyncCamoufox

ROOT_DIR = Path(__file__).resolve().parent.parent
PROFILE_DIR = ROOT_DIR / ".camoufox_yilore_profile"
SCAN_DIR = ROOT_DIR / "data" / "yilore_scan"
SHOTS_1TO1_DIR = SCAN_DIR / "screenshots_1to1"
DOM_1TO1_DIR = SCAN_DIR / "dom_1to1"
ASSETS_DIR = ROOT_DIR / "public" / "yilore-assets"
STATE_FILE = SCAN_DIR / "storage_state.json"
INVOKE_AGY_PS1 = ROOT_DIR / ".agents" / "skills" / "call-agy-cli" / "scripts" / "invoke-agy.ps1"


async def extract_exact_dom_and_assets(page, view_name: str):
    """Extract exact DOM hierarchy, Tailwind classes, computed styles, SVGs, and image URLs."""
    return await page.evaluate(
        """(viewName) => {
        const cleanHtml = (el) => {
            if (!el) return '';
            return el.outerHTML;
        };

        const images = Array.from(document.querySelectorAll('img')).map(img => ({
            src: img.currentSrc || img.src,
            rawSrc: img.getAttribute('src'),
            alt: img.alt,
            className: img.className,
            width: img.naturalWidth || img.width,
            height: img.naturalHeight || img.height,
        }));

        // Also find any background-image URLs in computed styles
        const bgUrls = [];
        for (const el of Array.from(document.querySelectorAll('*'))) {
            const bg = window.getComputedStyle(el).backgroundImage;
            if (bg && bg !== 'none' && bg.includes('url(')) {
                bgUrls.push({
                    tag: el.tagName.toLowerCase(),
                    className: typeof el.className === 'string' ? el.className : '',
                    backgroundImage: bg,
                });
            }
        }

        const headerEl = document.querySelector('header');
        const mainEl = document.querySelector('main') || document.body;

        // Get exact top-level children order inside main
        const mainChildrenOrder = Array.from(mainEl.children).map((child, idx) => ({
            idx,
            tag: child.tagName.toLowerCase(),
            className: typeof child.className === 'string' ? child.className : '',
            textPreview: (child.innerText || '').trim().slice(0, 200),
            outerHTML: child.outerHTML,
        }));

        return {
            viewName,
            url: location.href,
            bodyClassName: document.body.className,
            htmlClassName: document.documentElement.className,
            headerHTML: cleanHtml(headerEl),
            mainClassName: typeof mainEl.className === 'string' ? mainEl.className : '',
            mainHTML: cleanHtml(mainEl),
            mainChildrenOrder,
            images,
            bgUrls,
        };
    }""",
        view_name,
    )


def download_asset(url: str, dest_dir: Path) -> str:
    """Download an image/asset from yilore.app to public/yilore-assets/ and return local path."""
    if not url or url.startswith("data:"):
        return url
    try:
        parsed = urllib.parse.urlparse(url)
        # If it's /_next/image?url=... extract inner url name
        qs = urllib.parse.parse_qs(parsed.query)
        if "url" in qs and qs["url"]:
            raw_name = Path(qs["url"][0]).name
        else:
            raw_name = Path(parsed.path).name
        if not raw_name or "." not in raw_name:
            raw_name = f"asset_{abs(hash(url)) % 100000}.webp"
        safe_name = re.sub(r"[^a-zA-Z0-9._-]", "_", raw_name)
        local_file = dest_dir / safe_name
        if not local_file.exists():
            req = urllib.request.Request(
                url,
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0",
                    "Referer": "https://www.yilore.app/en/app",
                },
            )
            with urllib.request.urlopen(req, timeout=15) as resp:
                local_file.write_bytes(resp.read())
        return f"/yilore-assets/{safe_name}"
    except Exception as e:
        print(f"[Asset] Không tải được {url}: {e}", flush=True)
        return url


async def main():
    SHOTS_1TO1_DIR.mkdir(parents=True, exist_ok=True)
    DOM_1TO1_DIR.mkdir(parents=True, exist_ok=True)
    ASSETS_DIR.mkdir(parents=True, exist_ok=True)

    saved_state = None
    if STATE_FILE.exists():
        saved_state = json.loads(STATE_FILE.read_text(encoding="utf-8"))

    routes = [
        ("01_ledger", "https://www.yilore.app/en/app"),
        ("02_daily_guidance", "https://www.yilore.app/en/app/daily-guidance"),
        ("03_chat", "https://www.yilore.app/en/app/chat"),
        ("04_history", "https://www.yilore.app/en/app/history"),
        ("05_memory", "https://www.yilore.app/en/app/memory-management"),
        ("06_profile", "https://www.yilore.app/en/app/profile"),
        ("07_relationships", "https://www.yilore.app/en/app/relationships"),
    ]

    all_extracted = {}
    asset_map = {}

    print("[1:1 Extractor] Khởi chạy Camoufox chụp ảnh & trích xuất DOM/CSS 1:1...", flush=True)
    async with AsyncCamoufox(
        headless=False,
        persistent_context=True,
        user_data_dir=str(PROFILE_DIR),
        os="windows",
        window=(1440, 960),
    ) as context:
        page = context.pages[0] if context.pages else await context.new_page()
        await page.set_viewport_size({"width": 1440, "height": 960})

        # Ensure auth token is in localStorage
        await page.goto("https://www.yilore.app/en/app", wait_until="domcontentloaded", timeout=60000)
        if saved_state and saved_state.get("origins"):
            for origin_entry in saved_state["origins"]:
                if "yilore.app" in origin_entry.get("origin", ""):
                    for item in origin_entry.get("localStorage", []):
                        await page.evaluate(
                            "([k, v]) => localStorage.setItem(k, v)",
                            [item["name"], item["value"]],
                        )

        for r_name, r_url in routes:
            print(f"[1:1 Extractor] Đang xử lý '{r_name}' -> {r_url}", flush=True)
            await page.goto(r_url, wait_until="domcontentloaded", timeout=60000)
            # Chờ dữ liệu API & Energy Curve / Calendar tính toán xong
            await asyncio.sleep(5.5)

            # Chụp viewport trên
            await page.screenshot(path=str(SHOTS_1TO1_DIR / f"{r_name}_top.png"), full_page=False)
            # Chụp full page
            await page.screenshot(path=str(SHOTS_1TO1_DIR / f"{r_name}_full.png"), full_page=True)

            # Cuộn xuống cuối trang và chụp phần dưới
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            await asyncio.sleep(1.5)
            await page.screenshot(path=str(SHOTS_1TO1_DIR / f"{r_name}_bottom.png"), full_page=False)
            await page.evaluate("window.scrollTo(0, 0)")

            dom_info = await extract_exact_dom_and_assets(page, r_name)
            all_extracted[r_name] = dom_info

            # Lưu file HTML riêng cho từng view để đối chiếu 1:1
            (DOM_1TO1_DIR / f"{r_name}.html").write_text(dom_info["mainHTML"], encoding="utf-8")

            # Tải về tất cả ảnh thực tế trên trang
            for img in dom_info["images"]:
                src = img.get("src")
                if src and src not in asset_map:
                    local_path = download_asset(src, ASSETS_DIR)
                    asset_map[src] = local_path

            # Nếu ở trang history, click vào thẻ đầu tiên để chụp & lấy DOM 1:1 của Report Overlay
            if r_name == "04_history":
                try:
                    first_card = page.locator("main button").first
                    if await first_card.count() > 0:
                        await first_card.click(timeout=3000)
                        await asyncio.sleep(2.5)
                        await page.screenshot(
                            path=str(SHOTS_1TO1_DIR / "04_history_report_overlay.png"),
                            full_page=True,
                        )
                        overlay_dom = await extract_exact_dom_and_assets(page, "04_history_report_overlay")
                        all_extracted["04_history_report_overlay"] = overlay_dom
                        (DOM_1TO1_DIR / "04_history_report_overlay.html").write_text(
                            overlay_dom["mainHTML"], encoding="utf-8"
                        )
                except Exception as e:
                    print(f"[1:1 Extractor] Lưu ý khi mở history overlay: {e}", flush=True)

    (DOM_1TO1_DIR / "header.html").write_text(
        all_extracted["01_ledger"]["headerHTML"], encoding="utf-8"
    )
    (SCAN_DIR / "yilore_1to1_dom_spec.json").write_text(
        json.dumps(
            {"assetMap": asset_map, "views": all_extracted},
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    print(f"[1:1 Extractor] Đã tải {len(asset_map)} assets vào {ASSETS_DIR}", flush=True)
    print(f"[1:1 Extractor] Đã lưu DOM 1:1 tại {DOM_1TO1_DIR}", flush=True)

    # Gọi agy (agentapi) để ghi nhận phân tích 1:1
    if INVOKE_AGY_PS1.exists():
        prompt_msg = (
            "Analyze the extracted 1:1 DOM & Tailwind specification in data/yilore_scan/dom_1to1/ "
            "and screenshots in data/yilore_scan/screenshots_1to1/ to ensure 1:1 style, layout order, and feature parity."
        )
        print("[1:1 Extractor] Đang kích hoạt lệnh qua agy CLI...", flush=True)
        try:
            subprocess.Popen(
                [
                    "powershell",
                    "-ExecutionPolicy",
                    "Bypass",
                    "-File",
                    str(INVOKE_AGY_PS1),
                    "-Prompt",
                    prompt_msg,
                    "-Model",
                    "flash",
                    "-Title",
                    "Yilore 1:1 Clone Spec",
                ],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
            print("[1:1 Extractor] Đã gửi lệnh agy CLI thành công!", flush=True)
        except Exception as e:
            print(f"[1:1 Extractor] Lưu ý khi gọi agy: {e}", flush=True)


if __name__ == "__main__":
    asyncio.run(main())
