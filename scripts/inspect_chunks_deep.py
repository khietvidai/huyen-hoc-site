import os
import re
import json
import urllib.request

def fetch_text(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return resp.status, resp.read().decode("utf-8", errors="ignore")
    except Exception as e:
        return 0, str(e)

def main():
    # 1. Check sitemap.xml and robots.txt
    for path in ["/robots.txt", "/sitemap.xml", "/en/hexagram", "/en/blog", "/en/life-config"]:
        status, body = fetch_text("https://www.yilore.app" + path)
        print(f"GET {path} -> status {status}, len={len(body)}")
        if path in ["/robots.txt", "/sitemap.xml"]:
            print(body[:2000])

    # 2. Check /app-assets/heluo-cards in 0ctt81z3v~bev.js
    with open("data/yilore_scan/chunks/0ctt81z3v~bev.js", "r", encoding="utf-8") as f:
        c_profile = f.read()
    for m in re.finditer(r'heluo-cards', c_profile):
        start = max(0, m.start() - 300)
        end = min(len(c_profile), m.end() + 500)
        print("\n--- heluo-cards context in 0ctt81z3v~bev.js ---")
        print(c_profile[start:end])

    # 3. Check 0ynxxgf160exi.js around API calls
    with open("data/yilore_scan/chunks/0ynxxgf160exi.js", "r", encoding="utf-8") as f:
        c_api = f.read()
    idx = c_api.find("/api/v1/")
    if idx != -1:
        print("\n--- API client in 0ynxxgf160exi.js ---")
        print(c_api[max(0, idx - 500):min(len(c_api), idx + 8000)])

    # 4. Check POST /api/v1/answer/get in yilore_routes_scan.json
    with open("data/yilore_scan/yilore_routes_scan.json", "r", encoding="utf-8") as f:
        routes_scan = json.load(f)
    for call in routes_scan.get("apiCalls", []):
        if "answer/get" in call["url"] or "relationship-profiles" in call["url"]:
            print(f"\n--- {call['method']} {call['url']} ---")
            print("Request:", call.get("requestBody"))
            print("Response:", (call.get("responseBody") or "")[:2000])

if __name__ == "__main__":
    main()
