import sys
from pathlib import Path

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parent.parent

# 1. Update Header.tsx
header_path = ROOT / "src" / "components" / "Header.tsx"
h_txt = header_path.read_text(encoding="utf-8")
if '| "yilore"' not in h_txt:
    h_txt = h_txt.replace('| "home"\n  | "pricing"', '| "home"\n  | "yilore"\n  | "pricing"')
    h_txt = h_txt.replace(
        '      id: "home",\n      label: "Trang Chủ",\n      chinese: "首頁",\n      desc: "Phương pháp bốc bài I Ching Tarot & thông tin liên lạc Cửu Nhị",\n      icon: Home,\n    },',
        '      id: "home",\n      label: "Trang Chủ",\n      chinese: "首頁",\n      desc: "Phương pháp bốc bài I Ching Tarot & thông tin liên lạc Cửu Nhị",\n      icon: Home,\n    },\n    {\n      id: "yilore",\n      label: "Yilore App (/en/app)",\n      chinese: "易羅系統",\n      desc: "Hệ thống Yilore Ledger, Daily Guidance, Chat, History, Memory, Profile & Relationships",\n      icon: Sun,\n    },',
    )
    header_path.write_text(h_txt, encoding="utf-8")
    print("[wire] Updated Header.tsx")

# 2. Update LandingPage.tsx
lp_path = ROOT / "src" / "components" / "LandingPage.tsx"
lp_txt = lp_path.read_text(encoding="utf-8")
if "btn-enter-yilore-app" not in lp_txt:
    target_btn = """              {/* Nút Use on web đen nguyên bản Yilore */}
              <button
                type="button"
                id="btn-use-on-web"
                onClick={() => onEnterApp("divination")}"""
    replacement_btn = """              {/* Nút mở trực tiếp Yilore App Clone (/en/app) */}
              <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                id="btn-enter-yilore-app"
                onClick={() => onEnterApp("yilore")}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-700 text-white font-semibold cursor-pointer transition hover:bg-amber-800 hover:scale-[1.03] active:scale-[0.98] shadow-lg"
              >
                <span>∞ Vào Yilore App (/en/app)</span>
              </button>
              <button
                type="button"
                id="btn-use-on-web"
                onClick={() => onEnterApp("divination")}"""
    lp_txt = lp_txt.replace(target_btn, replacement_btn, 1)
    lp_txt = lp_txt.replace(
        """                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>""",
        """                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
              </div>""",
        1,
    )
    lp_path.write_text(lp_txt, encoding="utf-8")
    print("[wire] Updated LandingPage.tsx")

# 3. Update App.tsx
app_path = ROOT / "src" / "App.tsx"
a_txt = app_path.read_text(encoding="utf-8")
if "YiloreAppSuite" not in a_txt:
    a_txt = a_txt.replace(
        'import { LandingPage } from "./components/LandingPage";',
        'import { LandingPage } from "./components/LandingPage";\nimport { YiloreAppSuite } from "./components/YiloreAppSuite";',
    )
    a_txt = a_txt.replace(
        'const [currentTab, setCurrentTab] = useState<NavTab>("home");',
        """const [currentTab, setCurrentTab] = useState<NavTab>(() => {
    if (typeof window !== "undefined") {
      const p = window.location.pathname.toLowerCase();
      const s = window.location.search.toLowerCase();
      const h = window.location.hash.toLowerCase();
      if (p.includes("/app") || p.includes("/yilore") || s.includes("yilore") || h.includes("yilore")) {
        return "yilore";
      }
    }
    return "home";
  });""",
    )
    a_txt = a_txt.replace(
        '  if (currentTab === "home") {',
        """  if (currentTab === "yilore") {
    return (
      <>
        <YiloreAppSuite
          onExitToMainApp={() => setCurrentTab("divination")}
          onShowToast={showToast}
        />
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-[200] bg-stone-900 border border-amber-500/60 text-stone-100 px-4 py-2.5 rounded-xl shadow-2xl text-xs sm:text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}
      </>
    );
  }

  if (currentTab === "home") {""",
    )
    app_path.write_text(a_txt, encoding="utf-8")
    print("[wire] Updated App.tsx")
