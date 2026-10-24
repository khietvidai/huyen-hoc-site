import os
import re
import json
import glob

CHUNKS_DIR = "data/yilore_scan/chunks"

def main():
    chunk_files = sorted(glob.glob(os.path.join(CHUNKS_DIR, "*.js")))
    print(f"Found {len(chunk_files)} chunk files")

    api_paths = set()
    app_routes = set()
    urls = set()

    for path in chunk_files:
        name = os.path.basename(path)
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()

        # Find API paths like /api/v1/...
        for m in re.findall(r'["\'`](/api/v1/[a-zA-Z0-9_\-\/\?\=\&\$\{\}\.]+)["\'`]', content):
            api_paths.add((name, m))
        for m in re.findall(r'["\'`](https?://[^\s"\'`<>]+)["\'`]', content):
            urls.add((name, m))
        # Find route patterns
        for m in re.findall(r'["\'`](/(?:en|zh|app|hexagram|blog|articles|daily-guidance|history|chat|profile|relationships|memory)[a-zA-Z0-9_\-\/]*)["\'`]', content):
            app_routes.add((name, m))

    print("\n=== API PATHS IN CHUNKS ===")
    for name, p in sorted(api_paths):
        print(f"  [{name}] {p}")

    print("\n=== APP ROUTES IN CHUNKS ===")
    for name, r in sorted(app_routes):
        print(f"  [{name}] {r}")

    print("\n=== URLS IN CHUNKS ===")
    for name, u in sorted(urls):
        if not any(x in u for x in ["w3.org", "reactjs.org", "nextjs.org", "mozilla.org"]):
            print(f"  [{name}] {u}")

    # Also check yilore_routes_scan.json apiCalls
    with open("data/yilore_scan/yilore_routes_scan.json", "r", encoding="utf-8") as f:
        routes_scan = json.load(f)
    print("\n=== API CALLS CAPTURED IN yilore_routes_scan.json ===")
    seen_urls = set()
    for call in routes_scan.get("apiCalls", []):
        u = call["url"]
        if u not in seen_urls:
            seen_urls.add(u)
            print(f"  [{call['method']}] {u} -> status {call['status']} (len={len(call.get('responseBody') or '')})")

if __name__ == "__main__":
    main()
