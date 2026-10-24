import re
import json

def main():
    with open("data/yilore_scan/chunks/0o-zk__2z1g49.js", "r", encoding="utf-8") as f:
        c_dg = f.read()
    idx = c_dg.find("Collaboration Day")
    if idx != -1:
        print("=== Daily Guidance Day Badges & Questions in 0o-zk__2z1g49.js ===")
        print(c_dg[max(0, idx - 800):min(len(c_dg), idx + 2500)])

    with open("data/yilore_scan/chunks/0ctt81z3v~bev.js", "r", encoding="utf-8") as f:
        c_prof = f.read()
    idx2 = c_prof.find("ProfileDestinyPanelsFromPayload")
    if idx2 != -1:
        print("\n=== ProfileDestinyPanelsFromPayload in 0ctt81z3v~bev.js ===")
        print(c_prof[max(0, idx2 - 1500):min(len(c_prof), idx2 + 3500)])

if __name__ == "__main__":
    main()
