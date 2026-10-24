import re

def main():
    with open("data/yilore_scan/chunks/03n.ctd_m3ury.js", "r", encoding="utf-8") as f:
        c = f.read()
    print("=== 03n.ctd_m3ury.js (75000..105742) ===")
    print(c[75000:])

    for name in ["0-vwt1sabek0n.js", "0aqvyyh8e.j.8.js", "0rnid.xu5-s9d.js", "17ikho7kpl46u.js"]:
        with open(f"data/yilore_scan/chunks/{name}", "r", encoding="utf-8") as f:
            txt = f.read()
        print(f"\n=== {name} (len={len(txt)}) first 1500 chars ===")
        print(txt[:1500])

if __name__ == "__main__":
    main()
