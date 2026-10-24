import re
import urllib.request
from collections import Counter

def main():
    req = urllib.request.Request("https://www.yilore.app/sitemap.xml", headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=20) as resp:
        xml = resp.read().decode("utf-8", errors="ignore")

    locs = re.findall(r"<loc>(.*?)</loc>", xml)
    print(f"Total URLs in sitemap.xml: {len(locs)}")

    categories = Counter()
    samples = {}
    for u in locs:
        path = u.replace("https://www.yilore.app", "")
        parts = [p for p in path.split("/") if p]
        if len(parts) == 1:
            cat = f"/{parts[0]}"
        elif len(parts) >= 2:
            cat = f"/{parts[0]}/{parts[1]}"
        else:
            cat = "/"
        categories[cat] += 1
        samples.setdefault(cat, []).append(path)

    for cat, count in sorted(categories.items()):
        print(f"  {cat}: {count} URLs (e.g. {samples[cat][:3]})")

if __name__ == "__main__":
    main()
