import re
import glob
import os

def main():
    with open("data/yilore_scan/chunks/03n.ctd_m3ury.js", "r", encoding="utf-8") as f:
        code = f.read()

    # Print first 35000 chars of 03n.ctd_m3ury.js in 7000 char chunks to see what static data is at the top of Module 35172
    print("=== 03n.ctd_m3ury.js (0..15000) ===")
    print(code[:15000])
    print("\n=== 03n.ctd_m3ury.js (15000..30000) ===")
    print(code[15000:30000])
    print("\n=== 03n.ctd_m3ury.js (30000..45000) ===")
    print(code[30000:45000])

if __name__ == "__main__":
    main()
