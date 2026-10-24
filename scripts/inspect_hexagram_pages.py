import re
import urllib.request

def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=20) as resp:
        return resp.read().decode("utf-8", errors="ignore")

def main():
    xml = fetch("https://www.yilore.app/sitemap.xml")
    locs = re.findall(r"<loc>(.*?)</loc>", xml)
    en_hex = [u for u in locs if "/en/hexagram/" in u]
    zh_hex = [u for u in locs if "/zh-TW/hexagram/" in u]
    blogs = [u for u in locs if "/blog/" in u]
    print("Sample EN hexagram URLs (first 20):", en_hex[:20])
    print("Sample ZH-TW hexagram URLs (first 20):", zh_hex[:20])
    print("All Blog URLs:", blogs)

    # Fetch /en/hexagram and /en/hexagram/qiangua1 to see how data is embedded (Next.js RSC payload / HTML)
    html_idx = fetch("https://www.yilore.app/en/hexagram")
    print("\n--- /en/hexagram title & snippets ---")
    print("Len:", len(html_idx))
    # Find script tags with self.__next_f.push
    next_f = re.findall(r'self\.__next_f\.push\((.*?)\)</script>', html_idx, re.S)
    print(f"Found {len(next_f)} __next_f chunks in /en/hexagram")
    for i, c in enumerate(next_f[-3:]):
        print(f"Chunk {i}: {c[:1000]}")

    html_q1 = fetch("https://www.yilore.app/en/hexagram/qiangua1")
    print("\n--- /en/hexagram/qiangua1 ---")
    print("Len:", len(html_q1))
    next_f_q1 = re.findall(r'self\.__next_f\.push\((.*?)\)</script>', html_q1, re.S)
    for i, c in enumerate(next_f_q1[-3:]):
        print(f"Chunk {i}: {c[:1500]}")

if __name__ == "__main__":
    main()
