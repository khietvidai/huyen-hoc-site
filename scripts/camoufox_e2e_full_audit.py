import os
import json
import time
from pathlib import Path
from camoufox.sync_api import Camoufox

ROOT = Path(__file__).resolve().parent.parent
AUDIT_DIR = ROOT / "data" / "yilore_scan" / "audit"
AUDIT_DIR.mkdir(parents=True, exist_ok=True)

APP_URL = "http://localhost:5168/en/app"


def wait_images_loaded(page):
    page.evaluate(
        """() => Promise.all(
            Array.from(document.images)
                .filter(img => !img.complete)
                .map(img => new Promise(resolve => {
                    img.addEventListener('load', resolve, { once: true });
                    img.addEventListener('error', resolve, { once: true });
                    setTimeout(resolve, 3000);
                }))
        )"""
    )


def snap(page, filename: str):
    wait_images_loaded(page)
    page.screenshot(
        path=str(AUDIT_DIR / filename),
        animations="disabled",
        timeout=15000,
    )


def check_broken_images(page, step_name: str):
    wait_images_loaded(page)
    broken = page.evaluate(
        """() => {
        const imgs = Array.from(document.querySelectorAll('img'));
        return imgs
            .filter(img => {
                const src = img.getAttribute('src') || '';
                if (!src) return false;
                return !img.complete || img.naturalWidth === 0;
            })
            .map(img => ({
                src: img.getAttribute('src'),
                alt: img.getAttribute('alt') || '',
                complete: img.complete,
                naturalWidth: img.naturalWidth
            }));
    }"""
    )
    total_imgs = page.evaluate("() => document.querySelectorAll('img').length")
    return {"step": step_name, "total_images": total_imgs, "broken": broken}


def run_audit():
    console_errors = []
    console_warnings = []
    page_errors = []
    failed_requests = []
    http_errors = []
    image_checks = []
    steps_completed = []
    step_failures = []
    msg_stats = {}

    print(f"[*] Starting Camoufox E2E Audit (Vietnamese Version) against {APP_URL} ...")

    with Camoufox(headless=True, window=(1440, 900)) as browser:
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        page.on(
            "console",
            lambda msg: (
                console_errors.append({"type": msg.type, "text": msg.text})
                if msg.type == "error"
                else (
                    console_warnings.append({"type": msg.type, "text": msg.text})
                    if msg.type == "warning"
                    else None
                )
            ),
        )
        page.on("pageerror", lambda exc: page_errors.append(str(exc)))
        page.on(
            "requestfailed",
            lambda req: failed_requests.append(
                {"url": req.url, "failure": str(req.failure)}
            ),
        )
        page.on(
            "response",
            lambda res: (
                http_errors.append({"url": res.url, "status": res.status})
                if res.status >= 400
                else None
            ),
        )

        try:
            # 1. Open Homepage (/), click 'Bắt đầu ngay', verify redirect to /en/app + Login Gate, then log in
            print("[1/8] Navigating to / (Homepage) -> clicking 'Bắt đầu ngay' -> /en/app login gate...")
            context.add_init_script(
                "if (!sessionStorage.getItem('_audit_init')) { localStorage.clear(); sessionStorage.setItem('_audit_init', '1'); }"
            )
            page.goto("http://localhost:5168/", wait_until="domcontentloaded", timeout=60000)
            start_btn = page.locator("#btn-use-on-web")
            start_btn.wait_for(state="visible", timeout=20000)
            time.sleep(0.4)
            start_btn.scroll_into_view_if_needed()
            time.sleep(0.3)
            start_btn.click()
            time.sleep(0.6)

            login_submit = page.locator('button[type="submit"]:has-text("ĐĂNG NHẬP NGAY")')
            if login_submit.count() > 0:
                page.locator('input[placeholder*="cuunhi"]').fill("cuunhi")
                page.locator('input[type="password"]').fill("999999")
                login_submit.click()
                time.sleep(0.8)

            page.locator("h1").first.wait_for(state="visible", timeout=30000)
            time.sleep(0.8)

            body_text_len = page.evaluate("() => document.body.innerText.length")
            print(f"    Home Ledger body text length: {body_text_len}")

            snap(page, "01_ledger_home.png")
            image_checks.append(check_broken_images(page, "01_ledger_home"))
            steps_completed.append("01_ledger_home")

            # Test Quick Lot Modal & Auspicious Time Workbench on Ledger
            print("[2/8] Testing Quick Lot Modal & Auspicious Time Workbench on Ledger...")
            lookup_btn = page.locator("button:has-text('Tra cứu')").first
            if lookup_btn.count() > 0:
                lookup_btn.click()
                time.sleep(0.4)

            quick_lot_btn = page.locator("button:has-text('Rút quẻ')").first
            if quick_lot_btn.count() > 0:
                quick_lot_btn.click()
                time.sleep(0.6)
                snap(page, "02_quick_lot_modal.png")
                image_checks.append(check_broken_images(page, "02_quick_lot_modal"))
                steps_completed.append("02_quick_lot_modal")
                # Close modal
                close_x = page.locator("div.fixed button").first
                if close_x.count() > 0:
                    close_x.click()
                    time.sleep(0.4)

            # 2. Navigate to Daily Guidance ("Chỉ Dẫn Hàng Ngày")
            print("[3/8] Testing Daily Guidance view, monthly calendar, and historical records...")
            nav_daily = page.locator("aside button:has-text('Chỉ Dẫn Hàng Ngày')").first
            nav_daily.click(timeout=10000)
            time.sleep(0.6)

            # Capture the default Daily Guidance view showing 2026-10-20 (#26 Sơn Thiên Đại Súc)
            snap(page, "04_daily_guidance_2026_10_20.png")
            image_checks.append(check_broken_images(page, "04_daily_guidance_2026_10_20"))
            steps_completed.append("04_daily_guidance_2026_10_20")

            # Flip card
            flip_btn = page.locator("button:has-text('Chạm vào thẻ để lật')").first
            if flip_btn.count() > 0:
                flip_btn.click()
                time.sleep(0.5)
                snap(page, "05_daily_guidance_flipped.png")
                image_checks.append(check_broken_images(page, "05_daily_guidance_flipped"))
                steps_completed.append("05_daily_guidance_flipped")

            # Expand monthly calendar
            cal_btn = page.locator("button[aria-label='Xem theo ngày'], button[aria-label='Ẩn lịch tháng']").first
            if cal_btn.count() > 0:
                cal_btn.click()
                time.sleep(0.6)
                snap(page, "03_daily_guidance_calendar.png")
                image_checks.append(check_broken_images(page, "03_daily_guidance_calendar"))
                steps_completed.append("03_daily_guidance_calendar")

            # 3. Navigate to Chat ("Trò Chuyện")
            print("[4/8] Testing Chat view (38 messages + embedded cards)...")
            nav_chat = page.locator("aside button:has-text('Trò Chuyện')").first
            nav_chat.click(timeout=10000)
            time.sleep(0.8)
            snap(page, "06_chat_top.png")
            image_checks.append(check_broken_images(page, "06_chat_top"))
            steps_completed.append("06_chat_top")

            msg_stats = page.evaluate(
                """() => {
                const imgs = Array.from(document.querySelectorAll('main img')).map(i => i.getAttribute('src'));
                return {
                    mainImageCount: imgs.length,
                    sampleImages: imgs.slice(0, 10),
                    textLength: document.querySelector('main')?.innerText?.length || 0
                };
            }"""
            )
            print(f"    Chat view stats: {msg_stats}")

            page.evaluate(
                """() => {
                const scrollables = Array.from(document.querySelectorAll('main div')).filter(
                    el => el.scrollHeight > el.clientHeight + 100
                );
                scrollables.forEach(el => { el.scrollTop = 350; });
            }"""
            )
            time.sleep(0.5)
            snap(page, "07_chat_embedded_cards.png")
            image_checks.append(check_broken_images(page, "07_chat_embedded_cards"))
            steps_completed.append("07_chat_embedded_cards")

            # 4. Navigate to History ("Lịch Sử Quẻ")
            print("[5/8] Testing History view and both full Reading Reports (#64->#32 and #7->#32)...")
            nav_history = page.locator("aside button:has-text('Lịch Sử Quẻ')").first
            nav_history.click(timeout=10000)
            time.sleep(0.6)
            snap(page, "08_history_list.png")
            image_checks.append(check_broken_images(page, "08_history_list"))
            steps_completed.append("08_history_list")

            # Click first reading report ("Trạng thái hiện tại đã ổn định chưa?" #64 -> #32)
            rep1 = page.locator("text=Trạng thái hiện tại đã ổn định chưa?").first
            if rep1.count() > 0:
                rep1.click()
                time.sleep(0.6)
                snap(page, "09_history_detail_report1.png")
                image_checks.append(check_broken_images(page, "09_history_detail_report1"))
                steps_completed.append("09_history_detail_report1")
                close_detail = page.locator("div.fixed button.sticky").first
                if close_detail.count() > 0:
                    close_detail.click()
                    time.sleep(0.4)

            # Click second reading report ("Hành động hiện tại của tôi có đúng đắn không?" #7 -> #32)
            rep2 = page.locator("text=Hành động hiện tại của tôi có đúng đắn không?").first
            if rep2.count() > 0:
                rep2.click()
                time.sleep(0.6)
                snap(page, "10_history_detail_report2.png")
                image_checks.append(check_broken_images(page, "10_history_detail_report2"))
                steps_completed.append("10_history_detail_report2")
                close_detail = page.locator("div.fixed button.sticky").first
                if close_detail.count() > 0:
                    close_detail.click()
                    time.sleep(0.4)

            # 5. Navigate to Memory ("Quản Lý Bộ Nhớ")
            print("[6/8] Testing Memory Management view...")
            nav_memory = page.locator("aside button:has-text('Quản Lý Bộ Nhớ')").first
            nav_memory.click(timeout=10000)
            time.sleep(0.5)
            snap(page, "11_memory_view.png")
            image_checks.append(check_broken_images(page, "11_memory_view"))
            steps_completed.append("11_memory_view")

            # 6. Navigate to Profile ("Hồ Sơ Cá Nhân")
            print("[7/8] Testing Personal Profile view (BaZi, DaYun, Heluo Lishu cards, YuanTang, Day Pillar card)...")
            nav_profile = page.locator("aside button:has-text('Hồ Sơ Cá Nhân')").first
            nav_profile.click(timeout=10000)
            time.sleep(0.6)
            snap(page, "12_profile_top.png")
            image_checks.append(check_broken_images(page, "12_profile_top"))
            steps_completed.append("12_profile_top")

            # 7. Navigate to Relationships ("Hồ Sơ Quan Hệ")
            print("[8/8] Testing Relationships view & Mobile responsive drawer...")
            nav_rel = page.locator("aside button:has-text('Hồ Sơ Quan Hệ')").first
            nav_rel.click(timeout=10000)
            time.sleep(0.5)
            snap(page, "13_relationships_view.png")
            image_checks.append(check_broken_images(page, "13_relationships_view"))
            steps_completed.append("13_relationships_view")

            # Test Mobile Viewport (390x844)
            page.set_viewport_size({"width": 390, "height": 844})
            time.sleep(0.5)
            snap(page, "14_mobile_view.png")
            image_checks.append(check_broken_images(page, "14_mobile_view"))
            steps_completed.append("14_mobile_view")

        except Exception as e:
            print(f"[!] Exception during step: {e}")
            step_failures.append(str(e))
            try:
                snap(page, "99_error_state.png")
            except Exception:
                pass

        context.close()

    all_broken_images = []
    for chk in image_checks:
        for b in chk["broken"]:
            all_broken_images.append({"step": chk["step"], **b})

    report = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "app_url": APP_URL,
        "steps_completed": steps_completed,
        "step_failures": step_failures,
        "console_errors_count": len(console_errors),
        "console_errors": console_errors,
        "console_warnings_count": len(console_warnings),
        "console_warnings": console_warnings[:20],
        "page_errors_count": len(page_errors),
        "page_errors": page_errors,
        "failed_requests_count": len(failed_requests),
        "failed_requests": failed_requests,
        "http_errors_count": len(http_errors),
        "http_errors": http_errors,
        "broken_images_count": len(all_broken_images),
        "broken_images": all_broken_images,
        "image_checks_by_step": image_checks,
        "chat_view_stats": msg_stats,
    }

    report_path = AUDIT_DIR / "camoufox_e2e_audit_report.json"
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\n[+] Audit complete! Report saved to: {report_path}")
    print(f"    - Steps completed: {len(steps_completed)}")
    print(f"    - Step failures:   {len(step_failures)}")
    print(f"    - Console errors:  {len(console_errors)}")
    print(f"    - Page exceptions: {len(page_errors)}")
    print(f"    - HTTP >=400 errs: {len(http_errors)}")
    print(f"    - Broken images:   {len(all_broken_images)}")


if __name__ == "__main__":
    run_audit()
