import re
import json

def main():
    with open("data/yilore_scan/chunks/03n.ctd_m3ury.js", "r", encoding="utf-8") as f:
        code = f.read()

    print("03n.ctd_m3ury.js length:", len(code))
    # Let's print the modules inside 03n.ctd_m3ury.js
    # Turbopack modules start with digits like ,12345,e=>{
    modules = re.split(r'(?=,\d+,e=>\{)', code)
    print(f"Found {len(modules)} module sections in 03n.ctd_m3ury.js")
    for i, m in enumerate(modules):
        m_id = re.match(r',(\d+),e=>\{', m)
        mid = m_id.group(1) if m_id else "header"
        exports = re.findall(r'e\.s\(\[(.*?)\]', m)
        print(f"  Module {mid}: len={len(m)}, exports={exports[:3]}")

if __name__ == "__main__":
    main()
