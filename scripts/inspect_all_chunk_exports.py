import glob
import os
import re

def main():
    for path in sorted(glob.glob("data/yilore_scan/chunks/*.js")):
        name = os.path.basename(path)
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            code = f.read()
        exports = re.findall(r'e\.s\(\[(.*?)\]', code)
        export_names = []
        for ex in exports:
            names = re.findall(r'"([a-zA-Z0-9_]+)"', ex)
            export_names.extend(names[:8])
        # Check if there are CJK strings
        cjk_count = len(re.findall(r'[\u4e00-\u9fff]+', code))
        print(f"{name:25s} | size={len(code):7d} | cjk={cjk_count:4d} | exports={export_names[:12]}")

    print("\n=== Rest of 03n.ctd_m3ury.js (45000..105742) summary ===")
    with open("data/yilore_scan/chunks/03n.ctd_m3ury.js", "r", encoding="utf-8") as f:
        c = f.read()
    print(c[45000:75000])

if __name__ == "__main__":
    main()
