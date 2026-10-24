import os
import sys
import time
from camoufox.sync_api import Camoufox

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

OUT_DIR = os.path.join("data", "yilore_scan", "screenshots_clone_vi")
os.makedirs(OUT_DIR, exist_ok=True)


def main():
    print("[Camoufox] Chụp ảnh giao diện tiếng Việt tại http://localhost:5168/en/app ...")
    with Camoufox(headless=True, window=(1440, 960)) as browser:
        page = browser.new_page(viewport={"width": 1440, "height": 960})
        page.goto("http://localhost:5168/en/app", wait_until="networkidle", timeout=60000)
        time.sleep(2.0)

        # Clear any old localStorage keys so fresh Vietnamese seed data is rendered
        page.evaluate("""() => {
            localStorage.removeItem('yilore_clone_daily_v1');
            localStorage.removeItem('yilore_clone_strategy_v1');
            localStorage.removeItem('yilore_clone_profile_v1');
            localStorage.removeItem('yilore_clone_relationships_v1');
            localStorage.removeItem('yilore_clone_daily_v2');
            localStorage.removeItem('yilore_clone_strategy_v2');
            localStorage.removeItem('yilore_clone_profile_v2');
            localStorage.removeItem('yilore_clone_history_v2');
            localStorage.removeItem('yilore_clone_conversations_v2');
            localStorage.removeItem('yilore_clone_relationships_v2');
        }""")
        page.reload(wait_until="networkidle")
        time.sleep(2.0)

        # Wait for web fonts to load
        page.evaluate("() => document.fonts ? document.fonts.ready : Promise.resolve()")
        time.sleep(0.8)

        # 1. Ledger top (Sổ Tay Mệnh Lý)
        page.screenshot(path=os.path.join(OUT_DIR, "01_clone_ledger_vi.png"))
        print("Saved 01_clone_ledger_vi.png")

        # 2. Daily Guidance (Chỉ Dẫn Hàng Ngày)
        page.locator("aside nav button", has_text="Chỉ Dẫn Hàng Ngày").click()
        time.sleep(1.2)
        page.screenshot(path=os.path.join(OUT_DIR, "02_clone_daily_guidance_vi.png"))
        print("Saved 02_clone_daily_guidance_vi.png")

        # 3. Chat (Trò Chuyện)
        page.locator("aside nav button", has_text="Trò Chuyện").click()
        time.sleep(1.2)
        page.screenshot(path=os.path.join(OUT_DIR, "03_clone_chat_vi.png"))
        print("Saved 03_clone_chat_vi.png")

        # 4. History (Lịch Sử Quẻ)
        page.locator("aside nav button", has_text="Lịch Sử Quẻ").click()
        time.sleep(1.2)
        page.screenshot(path=os.path.join(OUT_DIR, "04_clone_history_vi.png"))
        print("Saved 04_clone_history_vi.png")

        # 5. Memory (Bộ Nhớ)
        page.locator("aside nav button", has_text="Bộ Nhớ").click()
        time.sleep(1.2)
        page.screenshot(path=os.path.join(OUT_DIR, "05_clone_memory_vi.png"))
        print("Saved 05_clone_memory_vi.png")

        # 6. Profile (Hồ Sơ Cá Nhân)
        page.locator("aside nav button", has_text="Hồ Sơ Cá Nhân").click()
        time.sleep(1.2)
        page.screenshot(path=os.path.join(OUT_DIR, "06_clone_profile_vi.png"))
        print("Saved 06_clone_profile_vi.png")

        # 7. Relationships (Hồ Sơ Quan Hệ)
        page.locator("aside nav button", has_text="Hồ Sơ Quan Hệ").click()
        time.sleep(1.2)
        page.screenshot(path=os.path.join(OUT_DIR, "07_clone_relationships_vi.png"))
        print("Saved 07_clone_relationships_vi.png")

    print("[Camoufox] Đã chụp xong toàn bộ 7 màn hình tiếng Việt!")


if __name__ == "__main__":
    main()
