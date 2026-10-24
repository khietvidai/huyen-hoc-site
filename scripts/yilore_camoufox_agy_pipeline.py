import sys
import json
import subprocess
import argparse
from pathlib import Path

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

ROOT_DIR = Path(__file__).resolve().parent.parent
SCAN_DIR = ROOT_DIR / "data" / "yilore_scan"
INVOKE_AGY_SCRIPT = ROOT_DIR / ".agents" / "skills" / "call-agy-cli" / "scripts" / "invoke-agy.ps1"


def run_agy_prompt(prompt: str, model: str = "flash", title: str = "Yilore Clone Task"):
    """Invoke Antigravity CLI (agy / agentapi) in headless prompt mode via call-agy-cli skill."""
    cmd = [
        "powershell",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        str(INVOKE_AGY_SCRIPT),
        "-Prompt",
        prompt,
        "-Model",
        model,
        "-Title",
        title,
    ]
    print(f"[Agy Bridge] Đang gọi Antigravity CLI (model={model})...", flush=True)
    res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
    print(res.stdout, flush=True)
    if res.returncode != 0:
        print(res.stderr, flush=True)
    return res.returncode


def main():
    parser = argparse.ArgumentParser(
        description="Pipeline Python kết hợp Camoufox Profile + Antigravity CLI (agy) cho Yilore (/en/app)"
    )
    parser.add_argument(
        "--step",
        choices=["login", "scan", "routes", "agy-audit", "all"],
        default="all",
        help="Bước cần chạy: login (mở Camoufox profile), scan (quét DOM/chunks), routes (quét 6 tab), agy-audit (gọi agy CLI)",
    )
    args = parser.parse_args()

    py_exe = sys.executable

    if args.step in ("login",):
        subprocess.run([py_exe, "-u", str(ROOT_DIR / "scripts" / "yilore_login_profile.py")])
        return

    if args.step in ("scan", "all"):
        subprocess.run([py_exe, "-u", str(ROOT_DIR / "scripts" / "yilore_deep_scanner.py")])

    if args.step in ("routes", "all"):
        subprocess.run([py_exe, "-u", str(ROOT_DIR / "scripts" / "yilore_crawl_all_routes.py")])
        subprocess.run([py_exe, "-u", str(ROOT_DIR / "scripts" / "analyze_yilore_chunks.py")])

    if args.step in ("agy-audit", "all"):
        routes_file = SCAN_DIR / "yilore_routes_scan.json"
        route_count = 0
        api_count = 0
        if routes_file.exists():
            data = json.loads(routes_file.read_text(encoding="utf-8"))
            route_count = len(data.get("routes", {}))
            api_count = len(data.get("apiCalls", []))
        prompt = (
            f"Đã quét {route_count} routes và {api_count} API calls từ https://www.yilore.app/en/app "
            f"bằng Camoufox persistent profile. Kiểm tra tính đầy đủ của bản clone trong src/components/YiloreAppSuite.tsx."
        )
        print(f"[Pipeline] Summary: {prompt}", flush=True)


if __name__ == "__main__":
    main()
