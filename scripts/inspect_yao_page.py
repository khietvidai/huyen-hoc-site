import re
import urllib.request

def main():
    req = urllib.request.Request("https://www.yilore.app/en/hexagram/qiangua1/yao-1", headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=20) as resp:
        html = resp.read().decode("utf-8", errors="ignore")
    m = re.search(r"<main[^>]*>(.*?)</main>", html, re.S)
    if m:
        print(m.group(1)[:12000])

if __name__ == "__main__":
    main()
