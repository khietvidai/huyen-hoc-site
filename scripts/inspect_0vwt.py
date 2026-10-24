import re

def main():
    with open("data/yilore_scan/chunks/0-vwt1sabek0n.js", "r", encoding="utf-8") as f:
        code = f.read()
    modules = re.split(r'(?=,\d+,e=>\{)', code)
    print(f"Found {len(modules)} modules in 0-vwt1sabek0n.js")
    for m in modules:
        m_id = re.match(r',(\d+),e=>\{', m)
        mid = m_id.group(1) if m_id else "header"
        exports = re.findall(r'e\.s\(\[(.*?)\]', m)
        print(f"  Module {mid}: len={len(m)}, exports={exports[:3]}")
        if len(m) > 200:
            print("    Preview:", m[:600])

if __name__ == "__main__":
    main()
