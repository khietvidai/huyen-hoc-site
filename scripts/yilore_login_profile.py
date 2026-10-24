import sys
import os
import asyncio
import ctypes
from ctypes import wintypes
from pathlib import Path

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

ROOT_DIR = Path(__file__).resolve().parent.parent
PROFILE_DIR = ROOT_DIR / ".camoufox_yilore_profile"
SCAN_DATA_DIR = ROOT_DIR / "data" / "yilore_scan"
STOP_SIGNAL_FILE = PROFILE_DIR / "stop.signal"
STATE_FILE = SCAN_DATA_DIR / "storage_state.json"
LOG_FILE = SCAN_DATA_DIR / "login_profile.log"
TARGET_URL = "https://www.yilore.app/en/app"


def get_current_desktop_name() -> str:
    if sys.platform != "win32":
        return "Default"
    user32 = ctypes.windll.user32
    kernel32 = ctypes.windll.kernel32
    hdesk = user32.GetThreadDesktop(kernel32.GetCurrentThreadId())
    buf = ctypes.create_unicode_buffer(256)
    needed = wintypes.DWORD()
    user32.GetUserObjectInformationW(hdesk, 2, buf, 512, ctypes.byref(needed))
    return buf.value


class STARTUPINFOW(ctypes.Structure):
    _fields_ = [
        ("cb", wintypes.DWORD),
        ("lpReserved", wintypes.LPWSTR),
        ("lpDesktop", wintypes.LPWSTR),
        ("lpTitle", wintypes.LPWSTR),
        ("dwX", wintypes.DWORD),
        ("dwY", wintypes.DWORD),
        ("dwXSize", wintypes.DWORD),
        ("dwYSize", wintypes.DWORD),
        ("dwXCountChars", wintypes.DWORD),
        ("dwYCountChars", wintypes.DWORD),
        ("dwFillAttribute", wintypes.DWORD),
        ("dwFlags", wintypes.DWORD),
        ("wShowWindow", wintypes.WORD),
        ("cbReserved2", wintypes.WORD),
        ("lpReserved2", ctypes.POINTER(wintypes.BYTE)),
        ("hStdInput", wintypes.HANDLE),
        ("hStdOutput", wintypes.HANDLE),
        ("hStdError", wintypes.HANDLE),
    ]


class PROCESS_INFORMATION(ctypes.Structure):
    _fields_ = [
        ("hProcess", wintypes.HANDLE),
        ("hThread", wintypes.HANDLE),
        ("dwProcessId", wintypes.DWORD),
        ("dwThreadId", wintypes.DWORD),
    ]


def respawn_on_default_desktop() -> int:
    """Re-launch this script on WinSta0\\Default so GUI windows appear on the user's real screen."""
    SCAN_DATA_DIR.mkdir(parents=True, exist_ok=True)
    if LOG_FILE.exists():
        try:
            LOG_FILE.unlink()
        except Exception:
            pass

    kernel32 = ctypes.windll.kernel32
    si = STARTUPINFOW()
    si.cb = ctypes.sizeof(STARTUPINFOW)
    si.lpDesktop = "WinSta0\\Default"
    si.dwFlags = 0x00000001  # STARTF_USESHOWWINDOW
    si.wShowWindow = 1       # SW_SHOWNORMAL
    pi = PROCESS_INFORMATION()

    cmd = f'"{sys.executable}" -u "{Path(__file__).resolve()}" --on-default-desktop'
    cmd_buf = ctypes.create_unicode_buffer(cmd)

    CREATE_NEW_CONSOLE = 0x00000010
    ok = kernel32.CreateProcessW(
        None,
        cmd_buf,
        None,
        None,
        False,
        CREATE_NEW_CONSOLE,
        None,
        str(ROOT_DIR),
        ctypes.byref(si),
        ctypes.byref(pi),
    )
    if not ok:
        err = ctypes.GetLastError()
        print(f"[Error] CreateProcessW trên WinSta0\\Default thất bại (LastError={err})", flush=True)
        return 1

    print(f"[Desktop Bridge] Đã khởi chạy tiến trình trên WinSta0\\Default (PID={pi.dwProcessId})!", flush=True)
    # Đọc log từ LOG_FILE theo thời gian thực trong khi tiến trình con chạy
    last_pos = 0
    WAIT_TIMEOUT = 0x00000102
    while True:
        res = kernel32.WaitForSingleObject(pi.hProcess, 500)
        if LOG_FILE.exists():
            try:
                with open(LOG_FILE, "r", encoding="utf-8", errors="replace") as f:
                    f.seek(last_pos)
                    chunk = f.read()
                    if chunk:
                        print(chunk, end="", flush=True)
                        last_pos = f.tell()
            except Exception:
                pass
        if res != WAIT_TIMEOUT:
            break

    kernel32.CloseHandle(pi.hProcess)
    kernel32.CloseHandle(pi.hThread)
    return 0


def log(msg: str):
    print(msg, flush=True)
    try:
        SCAN_DATA_DIR.mkdir(parents=True, exist_ok=True)
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(msg + "\n")
    except Exception:
        pass


def bring_camoufox_to_front():
    """Force the Camoufox MozillaWindowClass window to the foreground on Windows."""
    if sys.platform != "win32":
        return
    try:
        user32 = ctypes.windll.user32
        WNDENUMPROC = ctypes.WINFUNCTYPE(wintypes.BOOL, wintypes.HWND, wintypes.LPARAM)
        HWND_TOPMOST = -1
        HWND_NOTOPMOST = -2
        SWP_NOMOVE = 0x0002
        SWP_NOSIZE = 0x0001
        SWP_SHOWWINDOW = 0x0040
        SW_RESTORE = 9

        def cb(hwnd, lparam):
            if not user32.IsWindowVisible(hwnd):
                return True
            cls_buf = ctypes.create_unicode_buffer(256)
            user32.GetClassNameW(hwnd, cls_buf, 256)
            if cls_buf.value == "MozillaWindowClass":
                length = user32.GetWindowTextLengthW(hwnd)
                title_buf = ctypes.create_unicode_buffer(length + 1)
                user32.GetWindowTextW(hwnd, title_buf, length + 1)
                if "Camoufox" in title_buf.value or "Yilore" in title_buf.value or title_buf.value:
                    user32.ShowWindow(hwnd, SW_RESTORE)
                    user32.SetWindowPos(
                        hwnd, HWND_TOPMOST, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE | SWP_SHOWWINDOW
                    )
                    user32.SetWindowPos(
                        hwnd, HWND_NOTOPMOST, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE | SWP_SHOWWINDOW
                    )
                    user32.SwitchToThisWindow(hwnd, True)
                    user32.SetForegroundWindow(hwnd)
                    log(f"[Camoufox] Đã đưa cửa sổ '{title_buf.value}' (HWND={hwnd}) lên màn hình chính!")
            return True

        user32.EnumWindows(WNDENUMPROC(cb), 0)
    except Exception as e:
        log(f"[Camoufox] Không thể ép foreground: {e}")


async def main():
    from camoufox.async_api import AsyncCamoufox

    PROFILE_DIR.mkdir(parents=True, exist_ok=True)
    SCAN_DATA_DIR.mkdir(parents=True, exist_ok=True)

    if STOP_SIGNAL_FILE.exists():
        STOP_SIGNAL_FILE.unlink()

    desk = get_current_desktop_name()
    log("=" * 65)
    log(f"[Camoufox Profile 1] Desktop hiện tại: WinSta0\\{desk}")
    log(f"[Camoufox Profile 1] Thư mục profile: {PROFILE_DIR}")
    log(f"[Target URL] {TARGET_URL}")
    log("=" * 65)

    async with AsyncCamoufox(
        headless=False,
        persistent_context=True,
        user_data_dir=str(PROFILE_DIR),
        os="windows",
        window=(1366, 860),
        humanize=True,
    ) as context:
        page = context.pages[0] if context.pages else await context.new_page()

        bring_camoufox_to_front()

        log(f"[Camoufox] Đang mở trang {TARGET_URL} ...")
        try:
            await page.goto(TARGET_URL, wait_until="domcontentloaded", timeout=60000)
        except Exception as e:
            log(f"[Camoufox] Lưu ý khi tải trang ban đầu: {e}")

        bring_camoufox_to_front()

        log("\n>>> HƯỚNG DẪN:")
        log("1. Cửa sổ trình duyệt Camoufox đã hiển thị trên màn hình thật (WinSta0\\Default).")
        log("2. Hãy đăng nhập Gmail / tài khoản của bạn trên https://www.yilore.app/en/app.")
        log("3. Sau khi login xong, bạn có thể đóng cửa sổ trình duyệt HOẶC nhắn lại trong khung chat.")

        last_url = ""
        tick = 0
        while True:
            open_pages = [p for p in context.pages if not p.is_closed()]
            if not open_pages:
                log("[Camoufox] Phát hiện cửa sổ trình duyệt đã đóng bởi người dùng.")
                break

            if STOP_SIGNAL_FILE.exists():
                log("[Camoufox] Nhận tín hiệu hoàn tất đăng nhập (stop.signal). Đang lưu và đóng an toàn...")
                try:
                    STOP_SIGNAL_FILE.unlink()
                except Exception:
                    pass
                break

            active_page = open_pages[-1]
            current_url = active_page.url
            if current_url != last_url:
                log(f"[Camoufox] URL hiện tại: {current_url}")
                last_url = current_url

            if tick % 5 == 0:
                try:
                    await context.storage_state(path=str(STATE_FILE))
                except Exception:
                    pass

            tick += 1
            await asyncio.sleep(1)

        try:
            await context.storage_state(path=str(STATE_FILE))
            log(f"[Camoufox] Đã lưu bản sao storage_state tại: {STATE_FILE}")
        except Exception:
            pass

    log("[Camoufox] Đã đóng trình duyệt và lưu toàn bộ dữ liệu vào persistent profile thành công!")


if __name__ == "__main__":
    current_desk = get_current_desktop_name()
    if current_desk.lower() != "default" and "--on-default-desktop" not in sys.argv:
        print(f"[Desktop Bridge] Phát hiện đang chạy trong sandbox desktop 'WinSta0\\{current_desk}'. Đang chuyển sang 'WinSta0\\Default'...", flush=True)
        sys.exit(respawn_on_default_desktop())
    asyncio.run(main())
