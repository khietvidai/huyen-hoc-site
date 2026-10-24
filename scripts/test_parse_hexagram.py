import re
import json
import urllib.request
from html.parser import HTMLParser

class SimpleDOMParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.headings = []
        self.images = []
        self._curr_tag = None
        self._curr_text = []

    def handle_starttag(self, tag, attrs):
        attr_d = dict(attrs)
        if tag in ("h1", "h2", "h3"):
            self._curr_tag = (tag, attr_d.get("class", ""))
            self._curr_text = []
        elif tag == "img":
            self.images.append({"alt": attr_d.get("alt", ""), "src": attr_d.get("src", "")})

    def handle_data(self, data):
        if self._curr_tag:
            self._curr_text.append(data)

    def handle_endtag(self, tag):
        if self._curr_tag and self._curr_tag[0] == tag:
            txt = " ".join("".join(self._curr_text).split())
            self.headings.append((tag, txt))
            self._curr_tag = None
            self._curr_text = []

def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=20) as resp:
        return resp.read().decode("utf-8", errors="ignore")

def main():
    for url in [
        "https://www.yilore.app/en/hexagram/qiangua1",
        "https://www.yilore.app/zh-TW/hexagram/qiangua1",
        "https://www.yilore.app/zh-TW/blog/iching-beginners-guide",
    ]:
        html = fetch(url)
        p = SimpleDOMParser()
        p.feed(html)
        print(f"\n=== {url} (len={len(html)}) ===")
        for tag, txt in p.headings:
            print(f"  <{tag}>: {txt}")
        for img in p.images:
            print(f"  <img> alt={img['alt']!r} src={img['src']!r}")

if __name__ == "__main__":
    main()
