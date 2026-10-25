/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Compass,
  Coins,
  Hash,
  Layers,
  HelpCircle,
  RotateCcw,
  RotateCw,
  CheckCircle2,
  Info,
  Flame,
  ArrowRight,
  BookOpen,
  Dices,
  Clock,
  Palette,
  Lock,
  ChevronDown,
  ScrollText,
  Crown,
  Sparkles,
} from "lucide-react";
import { CHI_LIST, CAN_LIST, getCurrentBaziPillars, PillarItem } from "./data/baziConstants";
import { Hexagram, DivinationRecord, DoubleCardMode, ThreeCardMode, SpreadType, CustomCardPosition } from "./types";
import { HEXAGRAMS } from "./data/hexagrams";
import { Header, NavTab } from "./components/Header";
import { BrandLockup } from "./components/BrandMark";
import { CardDraw } from "./components/CardDraw";
import { ThapLaDivination } from "./components/ThapLaDivination";
import { CoinToss } from "./components/CoinToss";
import { YarrowDivination } from "./components/YarrowDivination";
import { MaiHoaDivination } from "./components/MaiHoaDivination";
import { KyMonDivination } from "./components/KyMonDivination";
import { ThaiAtDivination } from "./components/ThaiAtDivination";
import { HexagramDetail } from "./components/HexagramDetail";
import { HistoryView } from "./components/HistoryView";
import { HexagramLibrary } from "./components/HexagramLibrary";
import { DeckManager } from "./components/DeckManager";
import { zenAudio } from "./utils/zenAudio";
import { ManualBookSection } from "./components/ManualBookSection";
import { JiaziSection } from "./components/JiaziSection";
import { JiaziLucNhamSection } from "./components/JiaziLucNhamSection";
import { LucNhamHoaDichSection } from "./components/LucNhamHoaDichSection";
import { LichDungSuSection } from "./components/LichDungSuSection";
import { HanNhietMenhSection } from "./components/HanNhietMenhSection";
import { HomeSection } from "./components/HomeSection";
import { LandingPage } from "./components/LandingPage";
import { YiloreAppSuite } from "./components/YiloreAppSuite";
import { PricingSection } from "./components/PricingSection";
import { DailyHexagramModal } from "./components/DailyHexagramModal";
import { DailyHexagramWidget } from "./components/DailyHexagramWidget";
import { GoogleWorkspaceModal, WorkspaceTab, DivinationReadingData } from "./components/GoogleWorkspaceModal";
import { AuthModal } from "./components/AuthModal";
import { AdminManagementModal } from "./components/AdminManagementModal";
import { AuthService, AppUser } from "./services/authService";
import {
  cardImageStore,
  DEFAULT_DECK_ID,
  DEFAULT_VIP_DECK_ID,
  PRESET_DECK_VERSION,
  getUserCustomDeckId,
  setUserCustomDeckId,
} from "./services/cardImageStore";
import {
  useThemeConfig,
  DynamicBackgroundLayer,
} from "./components/ThemeBackgroundManager";

const STORAGE_KEY = "iching_divination_history_records";

const QUESTION_SUGGESTIONS = [
  "Dự án kinh doanh của tôi tại Hà Nội trong 3 tháng tới có hanh thông không?",
  "Tôi và đối tác A cùng khởi sự tại công ty mới trong 6 tháng tới nên chú ý gì?",
  "Chuyện tình cảm giữa tôi và người ấy tại nơi làm việc trong 1-3 tháng tới ra sao?",
  "Trong 3 tháng tới, tôi nên tiếp tục vị trí hiện tại hay chuyển việc sang cơ hội mới?",
  "Thương vụ đầu tư của tôi tại thị trường mục tiêu trong 3 tháng tới nên tiến hay thủ?",
];

const CATEGORIES = [
  "Tổng quát",
  "Sự nghiệp & Công danh",
  "Tài chính & Đầu tư",
  "Tình cảm & Hôn nhân",
  "Sức khỏe & Bình an",
  "Khởi sự & Ra quyết định",
];

type DivinationMethodId = "cards" | "thapla" | "khongminh" | "nguche" | "yarrow" | "coins" | "maihoa" | "lucnham" | "kymon" | "thaiat";

const DIVINATION_METHODS: {
  id: DivinationMethodId;
  numeral: string;
  title: string;
  chinese: string;
  desc: string;
  toast: string;
  badge?: string;
}[] = [
  {
    id: "cards",
    numeral: "壹",
    title: "Bốc Bài Kinh Dịch",
    chinese: "周易卜卦",
    desc: "Đầy đủ các trận pháp từ 1 đến 12 lá bài (Thất Tinh, Cửu Cung, Thập Tinh...)",
    toast: "Đã chọn hình thức: Bốc Bài Kinh Dịch (Đầy đủ 12 trận pháp)",
  },
  {
    id: "thapla",
    numeral: "貳",
    title: "Tháp La Kinh Dịch",
    chinese: "塔羅周易",
    desc: "Bốc Quẻ Chủ (Bản Quái) • AI ngẫu nhiên chọn 0-6 hào động • Xác lập Quẻ Biến & dải Hào Từ song song",
    toast: "Đã chọn hình thức: Tháp La Kinh Dịch (Bản Quái • Hào Động • Biến Quái)",
    badge: "Mới",
  },
  {
    id: "khongminh",
    numeral: "參",
    title: "Xăm Khổng Minh",
    chinese: "孔明神數",
    desc: "Bốc 3 lá Tam Tài (Thiên - Địa - Nhân) định hào biến & 384 quẻ xăm linh ứng",
    toast: "Đã chọn hình thức: Xăm Khổng Minh (Gia Cát Thần Toán)",
  },
  {
    id: "nguche",
    numeral: "肆",
    title: "Ngự Chế Đoán Dịch Tinh Túy",
    chinese: "御製新集斷易精粹",
    desc: "Bốc 3 lá Thiên - Địa - Nhân (lấy lá cuối làm quẻ), lắc xí ngầu 12 mặt & trích hình + thơ đoán của quẻ và ngày đó",
    toast: "Đã chọn hình thức: Ngự Chế Tân Tập Đoán Dịch Tinh Túy (Cố Cung Bản • 12 Mặt Xí Ngầu)",
    badge: "Cố Cung",
  },
  {
    id: "yarrow",
    numeral: "伍",
    title: "Rút Cỏ Thi",
    chinese: "大衍筮法",
    desc: "Đại Diễn 50 cọng cỏ thi nguyên bản, 18 biến đổi định hào",
    toast: "Đã chọn hình thức: Phép Rút Cỏ Thi 50 Cọng (Đại Diễn) • Cần trai giới mộc dục, tâm tập trung",
  },
  {
    id: "coins",
    numeral: "陸",
    title: "Gieo 3 Đồng Xu",
    chinese: "金錢卦",
    desc: "Ba đồng Càn Long gieo 6 lần định hào biến & Lục Hào chiêm đoán",
    toast: "Đã chọn hình thức: Gieo 3 Đồng Tiền Cổ (Lục Hào) • Thời gian gieo quẻ 6 lần",
  },
  {
    id: "maihoa",
    numeral: "柒",
    title: "Mai Hoa Dịch Số",
    chinese: "梅花易數",
    desc: "Thiệu Khang Tiết • Khởi quẻ thời khắc, con số, trắc tự & Thể Dụng ngũ hành",
    toast: "Đã chọn hình thức: Mai Hoa Dịch Số (Thiệu Khang Tiết)",
  },
  {
    id: "lucnham",
    numeral: "捌",
    title: "Lục Nhâm Đại Độn",
    chinese: "大六壬",
    desc: "Thiên Bàn, Tứ Khóa, Tam Truyền, 12 Thần Tướng & Hoạt Thời chiêm đoán",
    toast: "Đã chọn hình thức: Lục Nhâm Đại Độn (Tam Thức Cổ Truyền)",
    badge: "Tam Thức",
  },
  {
    id: "kymon",
    numeral: "玖",
    title: "Kỳ Môn Độn Giáp",
    chinese: "奇門遁甲",
    desc: "Bát Trận Đồ • Cửu Cung Lạc Thư, Cửu Tinh, Bát Môn, Bát Thần & Kỳ Môn Hóa Dịch",
    toast: "Đã chọn hình thức: Kỳ Môn Độn Giáp (Bát Trận Đồ • Tam Thức Cổ Truyền)",
    badge: "Tam Thức",
  },
  {
    id: "thaiat",
    numeral: "拾",
    title: "Thái Ất Thần Số",
    chinese: "太乙神數",
    desc: "Thiên Thời & Vận Thế • Thái Ất Cửu Cung, Chủ Toán - Khách Toán & Thái Ất Hóa Dịch",
    toast: "Đã chọn hình thức: Thái Ất Thần Số (Thiên Thời Vận Thế • Tam Thức Chi Thượng)",
    badge: "Tam Thức",
  },
];

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>(() => {
    if (typeof window !== "undefined") {
      const p = window.location.pathname.toLowerCase();
      const s = window.location.search.toLowerCase();
      const h = window.location.hash.toLowerCase();
      if (p.includes("/app") || p.includes("/yilore") || s.includes("yilore") || h.includes("yilore")) {
        return "yilore";
      }
    }
    return "home";
  });
  const [divinationMethod, setDivinationMethod] = useState<DivinationMethodId | null>(null);
  const [suggestedDrawMode, setSuggestedDrawMode] = useState<
    "single" | "double" | "three" | "seven" | "nine" | "ten" | "twelve" | "custom"
  >("single");

  const handleSelectDrawModeFromHome = (
    mode: "single" | "double" | "three" | "seven" | "nine" | "ten" | "twelve" | "custom"
  ) => {
    setSuggestedDrawMode(mode);
    setDivinationMethod("cards");
    setCurrentTab("divination");
    setTimeout(() => {
      const el = document.getElementById("ban-boc-que") || document.getElementById("divination-card-draw-area");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 120);
  };

  // Custom loaded card images (64 hexagrams & card back) & active deck
  const [activeDeckId, setActiveDeckId] = useState<string>(() => {
    const curUser = AuthService.getCurrentUser();
    const isVip = Boolean(curUser?.isMember || curUser?.isAdmin);
    if (!isVip) return DEFAULT_DECK_ID;
    return getUserCustomDeckId(curUser?.id, curUser?.preferredDeckId) || DEFAULT_VIP_DECK_ID;
  });
  const [cardImages, setCardImages] = useState<Record<number, string>>({});
  const [cardVideos, setCardVideos] = useState<Record<number, string>>({});
  const [cardBackImage, setCardBackImage] = useState<string | null>(null);
  const [isLoadingImages, setIsLoadingImages] = useState(true);

  // Input states
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);

  // Active reading states
  const [activeQuestion, setActiveQuestion] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [primaryHexagram, setPrimaryHexagram] = useState<Hexagram | null>(null);
  const [changingLines, setChangingLines] = useState<number[]>([]);
  const [transformedHexagram, setTransformedHexagram] = useState<Hexagram | undefined>(undefined);
  const [cardsDrawSummary, setCardsDrawSummary] = useState<string | undefined>(undefined);
  const [activeDoubleMode, setActiveDoubleMode] = useState<DoubleCardMode | undefined>(undefined);
  const [activeChoiceALabel, setActiveChoiceALabel] = useState<string | undefined>(undefined);
  const [activeChoiceBLabel, setActiveChoiceBLabel] = useState<string | undefined>(undefined);
  const [activeThreeMode, setActiveThreeMode] = useState<ThreeCardMode | undefined>(undefined);
  const [activeChoiceCLabel, setActiveChoiceCLabel] = useState<string | undefined>(undefined);
  const [activeDrawnCards, setActiveDrawnCards] = useState<Hexagram[] | undefined>(undefined);
  const [activeSpreadType, setActiveSpreadType] = useState<SpreadType | undefined>(undefined);
  const [activeCustomPositions, setActiveCustomPositions] = useState<CustomCardPosition[] | undefined>(undefined);
  const [activeIsCard2Reversed, setActiveIsCard2Reversed] = useState<boolean | undefined>(undefined);
  const [activeIsCard2AReversed, setActiveIsCard2AReversed] = useState<boolean | undefined>(undefined);
  const [activeIsCard2BReversed, setActiveIsCard2BReversed] = useState<boolean | undefined>(undefined);
  const [activeAiText, setActiveAiText] = useState<string>("");
  const [activeMenhBranchNumber, setActiveMenhBranchNumber] = useState<number | undefined>(undefined);
  const [activeDiceRollResult, setActiveDiceRollResult] = useState<number | undefined>(undefined);
  const [activeDeckCount, setActiveDeckCount] = useState<number | undefined>(undefined);
  const [activeMultiDeckMode, setActiveMultiDeckMode] = useState<"separate" | "combined" | undefined>(undefined);
  const [activeCompanionCards, setActiveCompanionCards] = useState<Record<string, Hexagram | Hexagram[]>>({});
  const [manualSelectedHexNum, setManualSelectedHexNum] = useState<number>(1);
  const [manualSubTab, setManualSubTab] = useState<"book" | "decks">("book");

  // History state
  const [history, setHistory] = useState<DivinationRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Authentication & Member state
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => AuthService.getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register" | "upgrade">("login");

  useEffect(() => {
    // Tự động đồng bộ tài khoản với máy chủ backend khi mở ứng dụng
    AuthService.syncUsersWithServer();

    const handleAuthChange = (e: any) => {
      if (e.detail && e.detail.user !== undefined) {
        const nextUser = e.detail.user;
        setCurrentUser(nextUser);
        const isNowVip = Boolean(nextUser?.isMember || nextUser?.isAdmin);
        if (!isNowVip) {
          setManualSubTab("book");
          loadCustomDeck(DEFAULT_DECK_ID);
        } else {
          // Khi là tài khoản VIP: tự động chuyển qua Bộ Không Chữ (Nguyên Bản)
          // hoặc bộ bài người dùng đã từng tùy chọn trước đó
          const customDeck = getUserCustomDeckId(nextUser?.id, nextUser?.preferredDeckId);
          const targetDeck = customDeck || DEFAULT_VIP_DECK_ID;
          loadCustomDeck(targetDeck);
          if (!customDeck) {
            showToast("Tài khoản VIP: Đã tự động kích hoạt Bộ Không Chữ (Nguyên Bản)!");
          }
        }
      }
    };
    const handleAdminDataChange = () => {
      const cur = AuthService.getCurrentUser();
      setCurrentUser(cur);
      const isNowVip = Boolean(cur?.isMember || cur?.isAdmin);
      if (!isNowVip) {
        setManualSubTab("book");
        loadCustomDeck(DEFAULT_DECK_ID);
      } else {
        const customDeck = getUserCustomDeckId(cur?.id, cur?.preferredDeckId);
        const targetDeck = customDeck || DEFAULT_VIP_DECK_ID;
        loadCustomDeck(targetDeck);
      }
    };
    const handlePopState = () => {
      const p = window.location.pathname.toLowerCase();
      const s = window.location.search.toLowerCase();
      const h = window.location.hash.toLowerCase();
      if (p.includes("/app") || p.includes("/yilore") || s.includes("yilore") || h.includes("yilore")) {
        setCurrentTab("yilore");
      } else {
        setCurrentTab("home");
      }
    };
    window.addEventListener("iching-auth-change", handleAuthChange);
    window.addEventListener("iching-admin-data-change", handleAdminDataChange);
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("iching-auth-change", handleAuthChange);
      window.removeEventListener("iching-admin-data-change", handleAdminDataChange);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // Theme & Background state (Fixed dark spiritual aesthetic)
  const { config: themeConfig } = useThemeConfig();

  // Trai Giới Mộc Dục Guide Modal / Accordion state
  const [showPurificationGuide, setShowPurificationGuide] = useState(false);

  // Google Workspace Modal (Docs, Sheets, Gmail, Drive & Picker)
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [workspaceDefaultTab, setWorkspaceDefaultTab] = useState<WorkspaceTab>("docs");
  const [customWorkspaceReading, setCustomWorkspaceReading] = useState<DivinationReadingData | null>(null);

  // Quẻ Ngày Modal state (hiển thị quẻ Kinh Dịch ngẫu nhiên mỗi ngày theo lịch dương)
  const [isDailyHexagramOpen, setIsDailyHexagramOpen] = useState(false);

  // Bát Tự riêng biệt cho Bảng Lục Nhâm ở Chỗ Bốc Quẻ (độc lập hoàn toàn với Tab Hoa Giáp)
  const [bocQueLucNhamPillars, setBocQueLucNhamPillars] = useState<[PillarItem, PillarItem, PillarItem, PillarItem]>(() => {
    try {
      const saved = localStorage.getItem("iching_lucnham_bazi_bocque");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 4) {
          return parsed as [PillarItem, PillarItem, PillarItem, PillarItem];
        }
      }
    } catch {}
    return getCurrentBaziPillars();
  });

  // Trạng thái Hoạt Thời và gieo xí ngầu Lục Nhâm tại chỗ bốc quẻ
  const [lucNhamHourChi, setLucNhamHourChi] = useState<string>(() => {
    try {
      const saved = localStorage.getItem("iching_lucnham_bazi_bocque");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed[0]?.chi) return parsed[0].chi;
      }
      const cur = getCurrentBaziPillars();
      return cur[0]?.chi || "Ngọ";
    } catch {
      return "Ngọ";
    }
  });
  const [isLucNhamRolling, setIsLucNhamRolling] = useState<boolean>(false);

  const handleSelectLucNhamHoatThoi = (chi: string) => {
    setLucNhamHourChi(chi);
    try {
      localStorage.setItem("lucnham_hoat_thoi_bocque", chi);
    } catch {}
    showToast(`Đã chọn Hoạt Thời: Giờ [${chi}]! Bảng Lục Nhâm Bốc Quẻ đã cập nhật.`);
  };

  const handleApplyLucNhamHourPillar = (chi: string) => {
    setLucNhamHourChi(chi);
    const dayCan = bocQueLucNhamPillars[1]?.can || "Giáp";
    const dayCanIdx = CAN_LIST.findIndex((c) => c.name === dayCan);
    const hourChiIdx = CHI_LIST.findIndex((c) => c.name === chi);
    let newHourCan = bocQueLucNhamPillars[0]?.can || "Giáp";
    if (dayCanIdx >= 0 && hourChiIdx >= 0) {
      const baseHourCan = (dayCanIdx % 5) * 2;
      newHourCan = CAN_LIST[(baseHourCan + hourChiIdx) % 10].name;
    }
    const updated: [PillarItem, PillarItem, PillarItem, PillarItem] = [
      { can: newHourCan, chi },
      bocQueLucNhamPillars[1],
      bocQueLucNhamPillars[2],
      bocQueLucNhamPillars[3],
    ];
    setBocQueLucNhamPillars(updated);
    try {
      localStorage.setItem("iching_lucnham_bazi_bocque", JSON.stringify(updated));
    } catch {}
    showToast(`Đã nạp Hoạt Thời [${newHourCan} ${chi}] vào Trụ Giờ (Chiêm Thời) Bát Tự Lục Nhâm!`);
  };

  const handleRollLucNhamHoatThoi = () => {
    if (isLucNhamRolling) return;
    setIsLucNhamRolling(true);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      const randomIdx = Math.floor(Math.random() * CHI_LIST.length);
      const randomChi = CHI_LIST[randomIdx].name;
      setLucNhamHourChi(randomChi);
      if (step >= 16) {
        clearInterval(interval);
        setIsLucNhamRolling(false);
        handleSelectLucNhamHoatThoi(randomChi);
        showToast(`Đã gieo Hoạt Thời: Giờ [${randomChi}]! Bảng Lục Nhâm Bốc Quẻ đã cập nhật.`);
      }
    }, 60);
  };

  const handleScrollToLucNhamChart = () => {
    const el = document.getElementById("lucnham-chart-area-bocque") || document.getElementById("lucnham-chart-area");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Sync history with external events (such as saving Lục Nhâm from Jiazi tab)
  useEffect(() => {
    const handleHistoryUpdate = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setHistory(JSON.parse(saved));
      } catch (err) {
        console.error(err);
      }
    };
    window.addEventListener("storage", handleHistoryUpdate);
    window.addEventListener("divination_history_updated", handleHistoryUpdate);
    return () => {
      window.removeEventListener("storage", handleHistoryUpdate);
      window.removeEventListener("divination_history_updated", handleHistoryUpdate);
    };
  }, []);

  const handleOpenWorkspace = (tab: WorkspaceTab = "docs", specificReading?: DivinationReadingData) => {
    setWorkspaceDefaultTab(tab);
    if (specificReading) {
      setCustomWorkspaceReading(specificReading);
    } else {
      setCustomWorkspaceReading(null);
    }
    setIsWorkspaceModalOpen(true);
  };

  const handleOpenWorkspaceForRecord = (record?: DivinationRecord, tab: WorkspaceTab = "docs") => {
    if (record) {
      handleOpenWorkspace(tab, {
        question: record.question,
        primaryHexagram: record.primaryHexagram,
        transformedHexagram: record.transformedHexagram,
        changingLines: record.changingLines,
        aiAnalysis: record.aiInterpretation || record.notes,
        divinationMethod: record.spreadType || "Lịch sử chiêm bái",
      });
    } else {
      handleOpenWorkspace(tab);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Phân quyền người dùng: VIP (Hội viên / Admin) được dùng tất cả phương pháp
  const isVip = Boolean(currentUser?.isMember || currentUser?.isAdmin);

  const handleSelectDivinationMethod = (methodId: DivinationMethodId) => {
    if (methodId !== "cards" && methodId !== "thapla" && methodId !== "nguche" && !isVip) {
      if (!currentUser) {
        showToast("Phương pháp này dành riêng cho tài khoản VIP. Vui lòng đăng nhập hoặc đăng ký!");
        setAuthModalMode("login");
        setIsAuthModalOpen(true);
      } else {
        showToast("Phương pháp này dành riêng cho Hội Viên VIP. Vui lòng nâng cấp gói VIP!");
        setAuthModalMode("upgrade");
        setIsAuthModalOpen(true);
      }
      return;
    }
    const next = divinationMethod === methodId ? null : methodId;
    setDivinationMethod(next);
    if (next) {
      const target = DIVINATION_METHODS.find((m) => m.id === next);
      if (target) showToast(target.toast);
    }
  };

  // Tự động chuyển về Bốc Bài Kinh Dịch nếu người dùng không phải VIP
  useEffect(() => {
    if (divinationMethod && divinationMethod !== "cards" && divinationMethod !== "thapla" && divinationMethod !== "nguche" && !isVip) {
      setDivinationMethod("cards");
    }
  }, [isVip, divinationMethod]);

  const VIP_TABS: NavTab[] = ["manual", "jiazi", "calendar", "hannhiet", "decks"];

  const handleSelectTabWithVipCheck = (tabId: NavTab) => {
    if (VIP_TABS.includes(tabId) && !isVip) {
      if (!currentUser) {
        setAuthModalMode("login");
        setIsAuthModalOpen(true);
        showToast("Phân hệ này chỉ dành riêng cho Hội Viên VIP. Vui lòng đăng nhập tài khoản VIP!");
      } else {
        setAuthModalMode("upgrade");
        setIsAuthModalOpen(true);
        showToast("Phân hệ này là đặc quyền dành riêng cho Hội Viên VIP. Vui lòng nâng cấp VIP!");
      }
      return;
    }
    setCurrentTab(tabId);
  };

  const renderVipTabGate = (tabTitle: string, tabDesc: string) => (
    <div className="royal-frame py-14 px-6 text-center max-w-xl mx-auto my-8">
      <span className="royal-corner tl" />
      <span className="royal-corner tr" />
      <span className="royal-corner bl" />
      <span className="royal-corner br" />
      <div className="w-16 h-16 rounded-2xl bg-amber-950/60 border border-amber-600/40 text-amber-400 mx-auto flex items-center justify-center shadow-lg mb-4">
        <Crown className="w-8 h-8 text-amber-400" />
      </div>
      <div className="royal-eyebrow">Đặc Quyền Dành Riêng Cho Hội Viên VIP</div>
      <h3 className="font-display text-2xl sm:text-3xl text-ivory-100 mt-2 mb-2">
        {tabTitle}
      </h3>
      <p className="text-sm text-ivory-400 font-serif leading-relaxed mb-6 max-w-md mx-auto">
        {tabDesc}. Phân hệ này là công trình học thuật chuyên sâu chỉ dành riêng cho Hội Viên VIP của Cửu Nhị.
        {!currentUser
          ? " Vui lòng đăng ký hoặc đăng nhập tài khoản VIP để mở khóa trải nghiệm!"
          : " Nâng cấp lên Hội Viên VIP ngay hôm nay để mở khóa toàn bộ học thuật và tiện ích đỉnh cao!"}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => {
            if (!currentUser) {
              setAuthModalMode("login");
            } else {
              setAuthModalMode("upgrade");
            }
            setIsAuthModalOpen(true);
          }}
          className="royal-btn-gold !px-6 !py-2.5 font-bold cursor-pointer"
        >
          <Crown className="w-4 h-4 mr-1.5 inline" />
          {currentUser ? "Nâng Cấp Hội Viên VIP" : "Đăng Nhập / Đăng Ký VIP"}
        </button>
        <button
          type="button"
          onClick={() => setCurrentTab("home")}
          className="royal-btn-ghost !px-5 !py-2.5 text-xs cursor-pointer"
        >
          Quay Lại Trang Chủ
        </button>
      </div>
    </div>
  );

  // Đóng / Mở đọc ngược lá bài (Mặc định luôn luôn ở trạng thái Chỉ Xem Thuận)
  const [allowReversedCards, setAllowReversedCards] = useState<boolean>(false);

  const handleToggleAllowReversedCards = () => {
    const next = !allowReversedCards;
    setAllowReversedCards(next);
    zenAudio.playCardFlipSound();
    showToast(
      next
        ? "Đã chọn chế độ: Xem Thuận Nghịch"
        : "Đã chọn chế độ: Chỉ Xem Thuận"
    );
  };

  // Trạng thái khi hiện quẻ: Mở luôn (true, mặc định) hay Úp bài (false)
  const [defaultCardFaceOpen, setDefaultCardFaceOpen] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("iching_default_card_face_open");
      return saved !== null ? JSON.parse(saved) : true; // Mặc định là mở luôn
    } catch {
      return true;
    }
  });

  const handleToggleDefaultCardFaceOpen = () => {
    const next = !defaultCardFaceOpen;
    setDefaultCardFaceOpen(next);
    try {
      localStorage.setItem("iching_default_card_face_open", JSON.stringify(next));
    } catch (e) {
      console.error(e);
    }
    zenAudio.playCardFlipSound();
    showToast(next ? "Đã chọn: Khi hiện quẻ sẽ Mở Luôn" : "Đã chọn: Khi hiện quẻ sẽ Úp Bài");
  };

  // Load custom card images from IndexedDB based on active deck
  const loadCustomDeck = async (deckIdToLoad?: string) => {
    try {
      const curUser = AuthService.getCurrentUser();
      const curIsVip = Boolean(curUser?.isMember || curUser?.isAdmin);
      const savedActive = typeof window !== "undefined" ? localStorage.getItem("iching_active_deck_id") : null;

      let targetId = deckIdToLoad;
      if (!targetId) {
        if (savedActive === "deck_ngu_che_khong_chu") {
          localStorage.removeItem("iching_active_deck_id");
          targetId = DEFAULT_DECK_ID;
        } else if (savedActive === "deck_ngu_che") {
          targetId = savedActive;
        } else if (!curIsVip) {
          targetId = DEFAULT_DECK_ID;
        } else {
          // Là tài khoản VIP: tự động dùng Bộ Không Chữ (Nguyên Bản), hoặc bộ đã tùy chỉnh trước đó
          const customDeck = getUserCustomDeckId(curUser?.id, curUser?.preferredDeckId);
          targetId = customDeck || DEFAULT_VIP_DECK_ID;
        }
      } else {
        if (!curIsVip && targetId !== "deck_ngu_che") {
          targetId = DEFAULT_DECK_ID;
        }
      }

      setActiveDeckId(targetId);
      await cardImageStore.setActiveDeckId(targetId);

      const [images, back, videos] = await Promise.all([
        cardImageStore.getDeckImages(targetId),
        cardImageStore.getDeckCardBack(targetId),
        cardImageStore.getDeckVideos(targetId),
      ]);
      setCardImages(images);
      setCardBackImage(back);
      setCardVideos(videos);
      setIsLoadingImages(false);
    } catch (err) {
      console.error("Failed to load custom card deck", err);
      setIsLoadingImages(false);
    }
  };

  useEffect(() => {
    loadCustomDeck(activeDeckId);
    // Subscribe to store updates (e.g. from DeckManager or individual updates)
    const unsubscribe = cardImageStore.subscribe((_cardNum, updatedDeckId) => {
      loadCustomDeck(updatedDeckId);
    });
    // Lắng nghe sự kiện chuyển đổi nhanh phương thức thỉnh quẻ từ các thành phần con
    const handleSwitchMethod = (e: any) => {
      if (e.detail) {
        const methodId = (e.detail === "cards_nguche" ? "nguche" : e.detail) as DivinationMethodId;
        const curUser = AuthService.getCurrentUser();
        const curIsVip = Boolean(curUser?.isMember || curUser?.isAdmin);
        if (methodId !== "cards" && methodId !== "thapla" && methodId !== "nguche" && !curIsVip) {
          if (!curUser) {
            setAuthModalMode("login");
            setIsAuthModalOpen(true);
            showToast("Phương pháp này dành riêng cho tài khoản VIP. Vui lòng đăng nhập hoặc đăng ký!");
          } else {
            setAuthModalMode("upgrade");
            setIsAuthModalOpen(true);
            showToast("Phương pháp này dành riêng cho Hội Viên VIP. Vui lòng nâng cấp gói VIP!");
          }
          return;
        }
        setDivinationMethod(methodId);
      }
    };
    window.addEventListener("switch-divination-method", handleSwitchMethod);

    return () => {
      unsubscribe();
      window.removeEventListener("switch-divination-method", handleSwitchMethod);
    };
  }, [PRESET_DECK_VERSION]);

  const handleActiveDeckChanged = async (newDeckId: string) => {
    const curUser = AuthService.getCurrentUser();
    const curIsVip = Boolean(curUser?.isMember || curUser?.isAdmin);
    if (curIsVip) {
      // Lưu lại tùy chỉnh bộ bài của người dùng VIP vào local & server
      setUserCustomDeckId(newDeckId, curUser?.id);
      AuthService.updateUserPreferredDeck(newDeckId);
    }
    setActiveDeckId(newDeckId);
    await cardImageStore.setActiveDeckId(newDeckId);
    await loadCustomDeck(newDeckId);
    showToast("Đã kích hoạt bộ hình mới thành công!");
  };

  // Update a single card's image for active deck
  const handleImageUpdated = (hexNumber: number, dataUrl: string) => {
    setCardImages((prev) => ({ ...prev, [hexNumber]: dataUrl }));
    cardImageStore.saveDeckCardImage(activeDeckId, hexNumber, dataUrl).catch(console.error);
  };

  // Update a single card's animated video for active deck
  const handleVideoUpdated = (hexNumber: number, videoUrl: string) => {
    setCardVideos((prev) => ({ ...prev, [hexNumber]: videoUrl }));
    cardImageStore.saveDeckCardVideo(activeDeckId, hexNumber, videoUrl).catch(console.error);
  };

  // Update card back image for active deck
  const handleBackUpdated = (dataUrl: string | null) => {
    setCardBackImage(dataUrl);
    if (dataUrl) {
      cardImageStore.saveDeckCardBack(activeDeckId, dataUrl).catch(console.error);
    } else {
      cardImageStore.removeDeckCardBack(activeDeckId).catch(console.error);
    }
  };

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.error("Failed to save history to localStorage", e);
    }
  }, [history]);

  // Companion card handlers (bốc thêm 1 lá kế bên trên mỗi lá bài, hỗ trợ nối tiếp nhiều lá)
  const handleDrawCompanionCard = (slotKey: string) => {
    // Gather all existing companion cards across all slots
    const allExistingCompanions: Hexagram[] = [];
    Object.values(activeCompanionCards).forEach((val) => {
      if (Array.isArray(val)) {
        allExistingCompanions.push(...val);
      } else if (val) {
        allExistingCompanions.push(val);
      }
    });

    const usedNumbers = [
      primaryHexagram?.number,
      transformedHexagram?.number,
      ...(activeDrawnCards?.map((c) => c.number) || []),
      ...allExistingCompanions.map((c) => c.number),
    ].filter(Boolean);
    const pool = HEXAGRAMS.filter((h) => !usedNumbers.includes(h.number));
    const available = pool.length > 0 ? pool : HEXAGRAMS;
    const picked = available[Math.floor(Math.random() * available.length)];
    const isRev = allowReversedCards ? Math.random() < 0.5 : false;
    const pickedWithReversal = { ...picked, isReversed: isRev };

    setActiveCompanionCards((prev) => {
      const prevVal = prev[slotKey];
      const prevList: Hexagram[] = Array.isArray(prevVal)
        ? prevVal
        : prevVal
        ? [prevVal]
        : [];
      const updatedList = [...prevList, pickedWithReversal];
      const updated = { ...prev, [slotKey]: updatedList };

      setHistory((hist) => {
        const existingIdx = hist.findIndex(
          (r) =>
            r.question === activeQuestion &&
            r.primaryHexagram.number === primaryHexagram?.number &&
            Date.now() - r.timestamp < 3600000
        );
        if (existingIdx >= 0) {
          const next = [...hist];
          next[existingIdx] = {
            ...next[existingIdx],
            companionCards: updated,
          };
          return next;
        }
        return hist;
      });
      return updated;
    });
    zenAudio.playCardDrawSound();
    showToast(`Đã bốc thêm lá kế bên: Quẻ #${picked.number} ${picked.name}`);
  };

  const handleRemoveCompanionCard = (slotKey: string, cardIndex?: number) => {
    setActiveCompanionCards((prev) => {
      const prevVal = prev[slotKey];
      const prevList: Hexagram[] = Array.isArray(prevVal)
        ? prevVal
        : prevVal
        ? [prevVal]
        : [];
      const updated = { ...prev };
      if (cardIndex !== undefined && prevList.length > 1) {
        const nextList = prevList.filter((_, i) => i !== cardIndex);
        updated[slotKey] = nextList;
      } else {
        delete updated[slotKey];
      }
      setHistory((hist) => {
        const existingIdx = hist.findIndex(
          (r) =>
            r.question === activeQuestion &&
            r.primaryHexagram.number === primaryHexagram?.number &&
            Date.now() - r.timestamp < 3600000
        );
        if (existingIdx >= 0) {
          const next = [...hist];
          next[existingIdx] = {
            ...next[existingIdx],
            companionCards: updated,
          };
          return next;
        }
        return hist;
      });
      return updated;
    });
    showToast("Đã bỏ lá bốc thêm kế bên");
  };

  // Handle divination completion from any method
  const handleDivinationComplete = (
    primary: Hexagram,
    changing: number[],
    transformed?: Hexagram,
    summary?: string,
    _drawnCards?: Hexagram[],
    meta?: {
      doubleMode?: DoubleCardMode;
      choiceALabel?: string;
      choiceBLabel?: string;
      threeMode?: ThreeCardMode;
      choiceCLabel?: string;
      spreadType?: SpreadType;
      isCard2Reversed?: boolean;
      isCard2AReversed?: boolean;
      isCard2BReversed?: boolean;
      isTenStarsExpanded?: boolean;
      customPositions?: CustomCardPosition[];
      menhBranchNumber?: number;
      diceRollResult?: number;
      deckCount?: number;
      multiDeckMode?: "separate" | "combined";
    }
  ) => {
    const finalQuestion = question.trim() || "Xem tổng quan thời vận và cơ biến";
    const finalCategory = category;

    setActiveQuestion(finalQuestion);
    setActiveCategory(finalCategory);
    setPrimaryHexagram(primary);
    setChangingLines(changing);
    setTransformedHexagram(transformed);
    setCardsDrawSummary(summary);
    setActiveDoubleMode(meta?.doubleMode);
    setActiveChoiceALabel(meta?.choiceALabel);
    setActiveChoiceBLabel(meta?.choiceBLabel);
    setActiveThreeMode(meta?.threeMode);
    setActiveChoiceCLabel(meta?.choiceCLabel);
    setActiveDrawnCards(_drawnCards);
    setActiveSpreadType(meta?.spreadType);
    setActiveCustomPositions(meta?.customPositions);
    setActiveIsCard2Reversed(meta?.isCard2Reversed);
    setActiveIsCard2AReversed(meta?.isCard2AReversed);
    setActiveIsCard2BReversed(meta?.isCard2BReversed);
    setActiveMenhBranchNumber(meta?.menhBranchNumber);
    setActiveDiceRollResult(meta?.diceRollResult);
    setActiveDeckCount(meta?.deckCount);
    setActiveMultiDeckMode(meta?.multiDeckMode);
    setActiveAiText(""); // Reset AI interpretation for fresh inquiry
    setActiveCompanionCards({}); // Reset companion cards for fresh divination

    // Automatically save into history
    const newRecord: DivinationRecord = {
      id: `iching_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: Date.now(),
      question: finalQuestion,
      category: finalCategory,
      primaryHexagram: primary,
      changingLines: changing,
      transformedHexagram: transformed,
      cardsDrawSummary: summary,
      doubleMode: meta?.doubleMode,
      choiceALabel: meta?.choiceALabel,
      choiceBLabel: meta?.choiceBLabel,
      threeMode: meta?.threeMode,
      choiceCLabel: meta?.choiceCLabel,
      drawnCards: _drawnCards,
      spreadType: meta?.spreadType,
      customPositions: meta?.customPositions,
      isCard2Reversed: meta?.isCard2Reversed,
      isCard2AReversed: meta?.isCard2AReversed,
      isCard2BReversed: meta?.isCard2BReversed,
      isTenStarsExpanded: meta?.isTenStarsExpanded || meta?.spreadType === "ten_stars_expanded",
      menhBranchNumber: meta?.menhBranchNumber,
      diceRollResult: meta?.diceRollResult,
      deckCount: meta?.deckCount,
      multiDeckMode: meta?.multiDeckMode,
      isFavorite: false,
    };

    setHistory((prev) => [newRecord, ...prev]);

    // Switch to detail view
    setCurrentTab("detail");
    showToast("Đã lập thành quẻ & lưu vào lịch sử bói!");
  };

  // Save note or updated AI text to the current record in history
  const handleSaveToHistory = (notes?: string, aiText?: string) => {
    if (!primaryHexagram) return;

    if (aiText) {
      setActiveAiText(aiText);
    }

    setHistory((prev) => {
      // Find latest record matching this reading or create a new one
      const existingIdx = prev.findIndex(
        (r) =>
          r.question === activeQuestion &&
          r.primaryHexagram.number === primaryHexagram.number &&
          Date.now() - r.timestamp < 3600000 // within 1 hour
      );

      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          notes: notes !== undefined ? notes : updated[existingIdx].notes,
          aiInterpretation: aiText || updated[existingIdx].aiInterpretation,
          doubleMode: activeDoubleMode || updated[existingIdx].doubleMode,
          choiceALabel: activeChoiceALabel || updated[existingIdx].choiceALabel,
          choiceBLabel: activeChoiceBLabel || updated[existingIdx].choiceBLabel,
          threeMode: activeThreeMode || updated[existingIdx].threeMode,
          choiceCLabel: activeChoiceCLabel || updated[existingIdx].choiceCLabel,
          drawnCards: activeDrawnCards || updated[existingIdx].drawnCards,
          spreadType: activeSpreadType || updated[existingIdx].spreadType,
          customPositions: activeCustomPositions || updated[existingIdx].customPositions,
          isCard2Reversed: activeIsCard2Reversed !== undefined ? activeIsCard2Reversed : updated[existingIdx].isCard2Reversed,
          isCard2AReversed: activeIsCard2AReversed !== undefined ? activeIsCard2AReversed : updated[existingIdx].isCard2AReversed,
          isCard2BReversed: activeIsCard2BReversed !== undefined ? activeIsCard2BReversed : updated[existingIdx].isCard2BReversed,
          isTenStarsExpanded: activeSpreadType === "ten_stars_expanded" || updated[existingIdx].isTenStarsExpanded,
          companionCards: activeCompanionCards,
        };
        return updated;
      } else {
        const newRecord: DivinationRecord = {
          id: `iching_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          timestamp: Date.now(),
          question: activeQuestion,
          category: activeCategory,
          primaryHexagram: primaryHexagram,
          changingLines,
          transformedHexagram,
          cardsDrawSummary,
          doubleMode: activeDoubleMode,
          choiceALabel: activeChoiceALabel,
          choiceBLabel: activeChoiceBLabel,
          threeMode: activeThreeMode,
          choiceCLabel: activeChoiceCLabel,
          drawnCards: activeDrawnCards,
          spreadType: activeSpreadType,
          customPositions: activeCustomPositions,
          isCard2Reversed: activeIsCard2Reversed,
          isCard2AReversed: activeIsCard2AReversed,
          isCard2BReversed: activeIsCard2BReversed,
          isTenStarsExpanded: activeSpreadType === "ten_stars_expanded",
          companionCards: activeCompanionCards,
          notes,
          aiInterpretation: aiText,
          isFavorite: false,
        };
        return [newRecord, ...prev];
      }
    });

    showToast("Đã cập nhật ghi chú nghiệm quẻ!");
  };

  // Select record from History to view in detail
  const handleSelectHistoryRecord = (record: DivinationRecord) => {
    setActiveQuestion(record.question);
    setActiveCategory(record.category);
    setPrimaryHexagram(record.primaryHexagram);
    setChangingLines(record.changingLines);
    setTransformedHexagram(record.transformedHexagram);
    setCardsDrawSummary(record.cardsDrawSummary);
    setActiveDoubleMode(record.doubleMode);
    setActiveChoiceALabel(record.choiceALabel);
    setActiveChoiceBLabel(record.choiceBLabel);
    setActiveThreeMode(record.threeMode);
    setActiveChoiceCLabel(record.choiceCLabel);
    setActiveDrawnCards(record.drawnCards);
    setActiveCustomPositions(record.customPositions);
    setActiveMenhBranchNumber(record.menhBranchNumber);
    setActiveDiceRollResult(record.diceRollResult);
    setActiveCompanionCards(record.companionCards || {});
    const isRecordYarrowOrCoins =
      record.spreadType === "yarrow" ||
      record.spreadType === "coins" ||
      record.cardsDrawSummary?.toLowerCase().includes("cỏ thi") ||
      record.cardsDrawSummary?.toLowerCase().includes("đại diễn") ||
      record.cardsDrawSummary?.toLowerCase().includes("đồng") ||
      record.cardsDrawSummary?.toLowerCase().includes("lục hào");

    setActiveSpreadType(
      record.spreadType ||
        (isRecordYarrowOrCoins
          ? record.cardsDrawSummary?.toLowerCase().includes("cỏ thi")
            ? "yarrow"
            : "coins"
          : (record.customPositions || (record.drawnCards && record.drawnCards.length !== 7 && record.drawnCards.length !== 9 && record.drawnCards.length !== 10 && record.drawnCards.length !== 11 && record.drawnCards.length !== 12 && record.drawnCards.length !== 3 && record.drawnCards.length !== 2 && record.drawnCards.length !== 1))
          ? "custom"
          : record.drawnCards?.length === 7
          ? "seven_stars"
          : record.drawnCards?.length === 9
          ? "nine_palaces"
          : record.drawnCards?.length === 10
          ? "ten_stars"
          : record.drawnCards?.length === 11 || record.isTenStarsExpanded
          ? "ten_stars_expanded"
          : record.drawnCards?.length === 12
          ? "twelve_houses"
          : record.drawnCards?.length === 3
          ? "three"
          : undefined)
    );
    setActiveIsCard2Reversed(record.isCard2Reversed);
    setActiveIsCard2AReversed(record.isCard2AReversed);
    setActiveIsCard2BReversed(record.isCard2BReversed);
    setActiveAiText(record.aiInterpretation || "");
    setCurrentTab("detail");
  };

  // Select hexagram from Library to inspect
  const handleSelectLibraryHexagram = (hex: Hexagram) => {
    setActiveQuestion(`Tra cứu thư viện quẻ số ${hex.number}: ${hex.name}`);
    setActiveCategory("Tra cứu 64 Quẻ");
    setPrimaryHexagram(hex);
    setChangingLines([]);
    setTransformedHexagram(undefined);
    setCardsDrawSummary("Tra cứu bách khoa");
    setActiveDoubleMode(undefined);
    setActiveChoiceALabel(undefined);
    setActiveChoiceBLabel(undefined);
    setActiveThreeMode(undefined);
    setActiveChoiceCLabel(undefined);
    setActiveDrawnCards(undefined);
    setActiveSpreadType(undefined);
    setActiveCustomPositions(undefined);
    setActiveCompanionCards({});
    setActiveAiText("");
    setCurrentTab("detail");
  };

  // Delete a history record
  const handleDeleteRecord = (id: string) => {
    setHistory((prev) => prev.filter((r) => r.id !== id));
    showToast("Đã xóa quẻ khỏi lịch sử!");
  };

  // Toggle favorite
  const handleToggleFavorite = (id: string) => {
    setHistory((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isFavorite: !r.isFavorite } : r))
    );
  };

  // Update note in history
  const handleUpdateNotes = (id: string, notes: string) => {
    setHistory((prev) => prev.map((r) => (r.id === id ? { ...r, notes } : r)));
    showToast("Đã cập nhật ghi chú!");
  };

  // Clear all history
  const handleClearAll = () => {
    setHistory([]);
    showToast("Đã xóa sạch lịch sử bói!");
  };

  // Import history records
  const handleImportRecords = (imported: DivinationRecord[]) => {
    setHistory((prev) => {
      const existingIds = new Set(prev.map((r) => r.id));
      const fresh = imported.filter((r) => !existingIds.has(r.id));
      return [...fresh, ...prev];
    });
    showToast(`Đã nhập thành công ${imported.length} quẻ vào lịch sử!`);
  };

  // Start a new divination
  const handleNewDivination = () => {
    setQuestion("");
    setActiveCompanionCards({});
    setCurrentTab("divination");
  };

  if (currentTab === "yilore") {
    return (
      <>
        <div
          className={
            !currentUser
              ? "pointer-events-none select-none blur-[3px] brightness-75 transition-all duration-300 h-dvh overflow-hidden"
              : ""
          }
        >
          <YiloreAppSuite
            currentUser={currentUser}
            onGoHome={() => {
              if (typeof window !== "undefined") {
                window.history.pushState({}, "", "/");
              }
              setCurrentTab("home");
            }}
            onExitToMainApp={() => {
              AuthService.logout();
              setCurrentUser(null);
              if (typeof window !== "undefined") {
                window.history.pushState({}, "", "/");
              }
              setCurrentTab("home");
              showToast("Đã đăng xuất tài khoản Cửu Nhị.");
            }}
            onShowToast={showToast}
          />
        </div>

        {/* Yêu cầu đăng nhập bắt buộc khi vào /en/app */}
        {!currentUser && (
          <AuthModal
            isOpen={true}
            onClose={() => {
              setIsAuthModalOpen(false);
              if (!AuthService.getCurrentUser()) {
                if (typeof window !== "undefined") {
                  window.history.pushState({}, "", "/");
                }
                setCurrentTab("home");
              }
            }}
            defaultMode={authModalMode}
            onSuccess={(user) => {
              setCurrentUser(user);
              setIsAuthModalOpen(false);
              const isVipUser = Boolean(user.isMember || user.isAdmin);
              if (isVipUser) {
                const customDeck = getUserCustomDeckId(user.id, user.preferredDeckId);
                const targetDeck = customDeck || DEFAULT_VIP_DECK_ID;
                loadCustomDeck(targetDeck);
              }
              if (typeof window !== "undefined" && !window.location.pathname.toLowerCase().includes("/en/app")) {
                window.history.pushState({}, "", "/en/app");
              }
              setCurrentTab("yilore");
              showToast(
                user.isAdmin
                  ? `Chào mừng Quản Trị Viên Cửu Nhị (${user.name})!`
                  : `Đăng nhập Cửu Nhị thành công! Kính chào ${user.name}.`
              );
            }}
            onShowToast={showToast}
          />
        )}

        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-[300] bg-stone-900 border border-amber-500/60 text-stone-100 px-4 py-2.5 rounded-xl shadow-2xl text-xs sm:text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}
      </>
    );
  }

  if (currentTab === "home") {
    return (
      <>
        <LandingPage
          currentUser={currentUser}
          onEnterApp={(tab, method) => {
            if (method) {
              setDivinationMethod(method as DivinationMethodId);
            }
            if (!tab || tab === "yilore") {
              if (typeof window !== "undefined" && !window.location.pathname.toLowerCase().includes("/en/app")) {
                window.history.pushState({}, "", "/en/app");
              }
              setCurrentTab("yilore");
              if (!currentUser) {
                setAuthModalMode("login");
                setIsAuthModalOpen(true);
                showToast("Vui lòng đăng nhập tài khoản Cửu Nhị để sử dụng ứng dụng!");
              }
            } else {
              setCurrentTab(tab);
            }
          }}
          onOpenAuthModal={(mode) => {
            setAuthModalMode(mode || "login");
            setIsAuthModalOpen(true);
          }}
          onLogout={() => {
            AuthService.logout();
            setCurrentUser(null);
            showToast("Đã đăng xuất tài khoản Cửu Nhị.");
          }}
        />

        {/* Toast Notification khi ở Trang Chủ */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-[200] bg-[#1E1914] border border-[#C89B3C] text-[#F3E6C8] px-4 py-2.5 rounded-xl shadow-2xl text-xs sm:text-sm flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Modal Đăng Ký & Đăng Nhập Cửu Nhị */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          defaultMode={authModalMode}
          onSuccess={(user) => {
            setCurrentUser(user);
            setIsAuthModalOpen(false);
            const isVipUser = Boolean(user.isMember || user.isAdmin);
            if (isVipUser) {
              const customDeck = getUserCustomDeckId(user.id, user.preferredDeckId);
              const targetDeck = customDeck || DEFAULT_VIP_DECK_ID;
              loadCustomDeck(targetDeck);
            }
            if (typeof window !== "undefined" && !window.location.pathname.toLowerCase().includes("/en/app")) {
              window.history.pushState({}, "", "/en/app");
            }
            showToast(
              user.isAdmin
                ? `Chào mừng Quản Trị Viên Cửu Nhị (${user.name})!`
                : `Đăng nhập Cửu Nhị thành công! Kính chào ${user.name}.`
            );
            // Sau khi bấm đăng nhập thành công nhảy vào trang /en/app của Cửu Nhị
            setCurrentTab("yilore");
          }}
          onShowToast={showToast}
        />
      </>
    );
  }

  return (
    <div
      className="min-h-screen text-[#EAE2D2] flex flex-col font-sans selection:bg-[#C89B3C] selection:text-[#121110] relative"
    >
      {/* Dynamic Background Layer with Pattern & Brightness */}
      <DynamicBackgroundLayer config={themeConfig} />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E1914] border border-[#C89B3C] text-[#F3E6C8] px-4 py-2.5 rounded-xl shadow-2xl text-xs sm:text-sm flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={handleSelectTabWithVipCheck}
        onShowToast={showToast}
        hasActiveReading={!!primaryHexagram}
        historyCount={history.length}
        onOpenGooglePicker={() => handleOpenWorkspace("picker")}
        onOpenWorkspace={(tab) => handleOpenWorkspace(tab || "docs")}
        onOpenDailyHexagram={() => setIsDailyHexagramOpen(true)}
        currentUser={currentUser}
        onOpenAuthModal={(mode) => {
          setAuthModalMode(mode || "login");
          setIsAuthModalOpen(true);
        }}
        onLogout={() => {
          AuthService.logout();
          setCurrentUser(null);
          showToast("Đã đăng xuất tài khoản.");
        }}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className={`relative z-10 flex-1 w-full mx-auto px-3 sm:px-4 py-6 sm:py-8 ${currentTab === "detail" ? "max-w-7xl" : "max-w-6xl"}`}>
        {/* TAB 0: TRANG CHỦ (PHƯƠNG PHÁP BỐC BÀI I CHING TAROT & LIÊN LẠC) */}
        <div className={(currentTab as string) === "home" ? "space-y-6" : "hidden"}>
          <HomeSection
            onNavigateTab={handleSelectTabWithVipCheck}
            onSelectDrawMode={handleSelectDrawModeFromHome}
            cardImages={cardImages}
            cardVideos={cardVideos}
            currentUser={currentUser}
            onOpenAuthModal={(mode) => {
              setAuthModalMode(mode || "register");
              setIsAuthModalOpen(true);
            }}
            onSelectHexagram={(hexNum) => {
              if (!isVip) {
                if (!currentUser) {
                  setAuthModalMode("login");
                  setIsAuthModalOpen(true);
                  showToast("Thuyết minh 64 quẻ dịch chỉ dành riêng cho Hội Viên VIP. Vui lòng đăng nhập!");
                } else {
                  setAuthModalMode("upgrade");
                  setIsAuthModalOpen(true);
                  showToast("Thuyết minh 64 quẻ dịch là đặc quyền dành riêng cho Hội Viên VIP. Vui lòng nâng cấp gói VIP!");
                }
                return;
              }
              setManualSelectedHexNum(hexNum);
              setCurrentTab("manual");
            }}
          />
        </div>

        {/* TAB BÁO GIÁ: BẢNG GIÁ DỊCH VỤ PHONG THỦY, MỆNH LÝ & ĐẶC QUYỀN HỘI VIÊN */}
        <div className={currentTab === "pricing" ? "space-y-6" : "hidden"}>
          <PricingSection
            onNavigateTab={setCurrentTab}
            onOpenDailyHexagram={() => setIsDailyHexagramOpen(true)}
            cardImages={cardImages}
            historyCount={history.length}
            currentUser={currentUser}
            onOpenAuthModal={(mode) => {
              setAuthModalMode(mode || "register");
              setIsAuthModalOpen(true);
            }}
          />
        </div>

        {/* TAB 1: DIVINATION (BỐC BÀI / THỈNH QUẺ) */}
        <div className={currentTab === "divination" ? "space-y-6" : "hidden"}>
          {/* Quẻ Ngày (Kinh Dịch) Banner Theo Lịch Dương */}
          <DailyHexagramWidget
            onOpenModal={() => setIsDailyHexagramOpen(true)}
            cardImages={cardImages}
          />

          {/* Mindful / Traditional Ritual Preparation */}
          <section className="royal-frame px-5 py-10 sm:px-12 sm:py-14">
            <span className="royal-corner tl" />
            <span className="royal-corner tr" />
            <span className="royal-corner bl" />
            <span className="royal-corner br" />

            <div className="max-w-2xl mx-auto text-center">
              <div className="royal-eyebrow">Thành tâm tất ứng · Tâm động quẻ sinh</div>

              <h2 className="royal-title mt-5 text-3xl sm:text-5xl">
                Tâm niệm bốc bài
                <span className="block italic text-gold-300">Kinh Dịch</span>
              </h2>

              <div className="mt-6 flex items-center justify-center gap-4">
                <span className="h-px w-10 sm:w-16 bg-gold-700" />
                <span className="font-serif text-base sm:text-lg tracking-[0.35em] text-gold-400">齋戒沐浴</span>
                <span className="h-px w-10 sm:w-16 bg-gold-700" />
              </div>

              <p className="mt-6 text-sm sm:text-[15px] leading-relaxed text-ivory-300 font-serif">
                Trước khi thỉnh quẻ, cổ nhân luôn nghiêm cẩn thực hành <strong className="text-gold-300 font-medium">Trai Giới Mộc Dục (齋戒沐浴)</strong>: Tắm gội rửa sạch đôi bàn tay (Mộc Dục) và thanh tịnh tâm thức, loại bỏ mọi tạp niệm lo toan (Trai Giới). Thân tâm trong sạch thì quẻ gieo mới linh ứng giao hòa cùng Thiên Địa.
              </p>

              {/* Trai Giới Mộc Dục Explanatory Accordion Button */}
              <button
                type="button"
                onClick={() => setShowPurificationGuide(!showPurificationGuide)}
                className="royal-link mt-6 cursor-pointer text-left"
              >
                <ScrollText className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                <span>Vì sao cần Trai Giới Mộc Dục trước khi gieo quẻ?</span>
                <ChevronDown className={`w-3.5 h-3.5 text-gold-500 shrink-0 transition-transform ${showPurificationGuide ? "rotate-180" : ""}`} />
              </button>
            </div>

            {showPurificationGuide && (
              <div className="max-w-3xl mx-auto mt-8 text-left border border-gold-800 bg-lacquer-950/70 p-5 sm:p-7 font-serif space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[11px] font-sans uppercase tracking-[0.24em] text-gold-500">Cẩm nang nghi lễ</div>
                    <h3 className="font-display text-2xl text-ivory-100 mt-1">Trai Giới Mộc Dục · 齋戒沐浴</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPurificationGuide(false)}
                    className="royal-link cursor-pointer shrink-0"
                  >
                    Đóng
                  </button>
                </div>

                <blockquote className="border-l border-gold-600 pl-4 italic text-sm text-ivory-300 leading-relaxed">
                  "Thánh nhân dĩ thử trai giới, dĩ sùng đức quảng nghiệp... Tịch nhiên bất động, cảm nhi toại thông thiên hạ chi cố."
                  <span className="block not-italic text-[11px] font-sans uppercase tracking-[0.18em] text-gold-600 mt-2">Khổng Tử · Kinh Dịch Hệ Từ Thượng</span>
                </blockquote>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border border-gold-800 bg-lacquer-900/60 p-4 space-y-2">
                    <div className="flex items-baseline gap-3">
                      <span className="font-serif text-xl text-gold-600 leading-none">壹</span>
                      <strong className="font-display text-lg text-gold-300 font-medium">Mộc Dục · 沐浴</strong>
                    </div>
                    <p className="text-[12.5px] leading-relaxed text-ivory-300">
                      <strong className="text-ivory-100 font-medium">Mộc (沐):</strong> Gội đầu, rửa mặt, súc miệng thanh tịnh, giữ hơi thở thơm sạch.<br/>
                      <strong className="text-ivory-100 font-medium">Dục (浴):</strong> Tắm gội toàn thân, đặc biệt là <strong className="text-gold-300 font-medium">rửa sạch đôi bàn tay dưới dòng nước mát</strong> trước khi chạm vào cỏ thi, đồng tiền cổ hay thẻ bài Kinh Dịch. Bàn tay là kênh phát xuất trường điện từ sinh học, tay sạch thì trường năng lượng mới tinh khiết không bị tạp nhiễm.<br/>
                      <strong className="text-ivory-100 font-medium">Y phục:</strong> Ăn mặc ngay ngắn, tề chỉnh, đầu tóc gọn gàng để tỏ lòng tôn kính với Đạo Trời Đất.
                    </p>
                  </div>

                  <div className="border border-gold-800 bg-lacquer-900/60 p-4 space-y-2">
                    <div className="flex items-baseline gap-3">
                      <span className="font-serif text-xl text-gold-600 leading-none">貳</span>
                      <strong className="font-display text-lg text-gold-300 font-medium">Trai Giới · 齋戒</strong>
                    </div>
                    <p className="text-[12.5px] leading-relaxed text-ivory-300">
                      <strong className="text-ivory-100 font-medium">Trai (齋):</strong> Trai tịnh tâm can, kiêng rượu nồng, chất kích thích và các thú vui ồn ào trước giờ bốc.<br/>
                      <strong className="text-ivory-100 font-medium">Giới (戒):</strong> Ngăn ngừa tà niệm, dứt bỏ tham sân si, dục vọng vị kỷ, lo âu, sân hận hoặc toan tính vụ lợi.<br/>
                      Đưa tâm thức về trạng thái <em>Hư Tĩnh</em> (như mặt gương sáng không dính bụi), nhất tâm hướng trọn ý thức về câu hỏi cần thỉnh vấn.
                    </p>
                  </div>
                </div>

                {/* Tứ Bất Bốc */}
                <div className="space-y-3">
                  <div className="royal-rule text-[11px] font-sans uppercase tracking-[0.22em] text-gold-500">
                    Khẩu quyết cổ nhân · Tứ Bất Bốc
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-[12px] text-ivory-300 leading-relaxed">
                    {[
                      ["Bất thành bất bốc", "Lòng không chí thành, bói chơi đùa thì không ứng."],
                      ["Bất nghi bất bốc", "Lòng không có điều thực sự băn khoăn thì không bốc."],
                      ["Phi nghĩa bất bốc", "Hỏi việc thất đức, hại người, phi pháp thì không bốc."],
                      ["Độc tắc bất cáo", "Cùng một việc bốc đi bốc lại ép quẻ tốt thì quẻ sẽ loạn."],
                    ].map(([title, desc], idx) => (
                      <div key={title} className="border-t border-gold-700 pt-3">
                        <strong className="text-gold-300 font-medium block mb-1">{idx + 1}. {title}</strong>
                        {desc}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border border-cinnabar-600/40 bg-cinnabar-600/5 p-4 text-[12.5px] leading-relaxed text-ivory-300 flex gap-3">
                  <span className="royal-seal w-7 h-7 text-xs shrink-0">誠</span>
                  <p>
                    <strong className="text-gold-300 font-medium">Nguyên lý "Chí Thành Thông Thần":</strong> Kinh Dịch không phải là trò bói toán may rủi tầm thường, mà là sự phản ánh giao cảm vi tế giữa trường năng lượng ý thức con người và quy luật Càn Khôn. Thân sạch (Mộc Dục) và Tâm sáng (Trai Giới) chính là chiếc chìa khóa để linh khí câu thông, quẻ định chuẩn xác nhất.
                  </p>
                </div>
              </div>
            )}

            {/* Question & Category Input Box */}
            <div className="max-w-2xl mx-auto mt-10 pt-8 border-t border-gold-800/70 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium uppercase tracking-[0.2em] text-gold-500 mb-2">
                    Nội dung tâm niệm / Câu hỏi
                  </label>
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="VD: Định hướng công việc và tài vận trong năm nay..."
                    className="w-full bg-lacquer-950 border border-gold-800 focus:border-gold-500 rounded-sm px-4 py-3 text-sm font-serif text-ivory-100 placeholder:text-ivory-500/70 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-[0.2em] text-gold-500 mb-2">
                    Lĩnh vực thỉnh vấn
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-lacquer-950 border border-gold-800 focus:border-gold-500 rounded-sm px-3 py-3 text-sm font-serif text-ivory-100 outline-none cursor-pointer transition-colors"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-lacquer-800">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quick suggestions */}
              <div className="space-y-2.5">
                <span className="text-[11px] uppercase tracking-[0.18em] text-ivory-500 flex items-center gap-1.5">
                  <HelpCircle className="w-3 h-3 text-gold-600" /> Gợi ý câu hỏi chuẩn
                </span>
                <div className="flex flex-wrap gap-2">
                  {QUESTION_SUGGESTIONS.map((sug, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setQuestion(sug)}
                      className="text-left text-[12px] font-serif text-ivory-300 hover:text-gold-200 border border-gold-800 hover:border-gold-500 hover:bg-gold-500/5 rounded-sm px-3 py-1.5 transition-colors cursor-pointer"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Divination Method Switcher */}
          <section className="space-y-6 pt-4">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
              <div className="text-center lg:text-left">
                <div className="royal-eyebrow lg:before:hidden">Phương thức thỉnh quẻ</div>
                <h2 className="royal-title mt-3 text-3xl sm:text-4xl">Tám phép khởi quẻ</h2>
                <p className="mt-2 text-[13px] text-ivory-500 font-serif">
                  Chọn một phương thức chiêm đoán để bắt đầu. Bấm lần nữa để bỏ chọn.
                </p>
              </div>

              {/* Nút Trạng Thái Hiện Quẻ (Mở Luôn / Úp Bài) & Nút Xem Thuận Nghịch */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleDefaultCardFaceOpen}
                  className={`royal-btn-ghost !px-4 !py-2 !text-[11px] ${
                    defaultCardFaceOpen ? "!border-gold-400 !text-gold-200 !bg-gold-500/10" : "!text-ivory-500"
                  }`}
                  title={
                    defaultCardFaceOpen
                      ? "Khi hiện quẻ: Đang ở trạng thái Mở Luôn (Mặt trước). Bấm để chuyển sang Úp Bài."
                      : "Khi hiện quẻ: Đang ở trạng thái Úp Bài (Mặt Bát Quái). Bấm để chuyển sang Mở Luôn."
                  }
                >
                  {defaultCardFaceOpen ? <BookOpen className="w-3.5 h-3.5" /> : <Layers className="w-3.5 h-3.5" />}
                  <span>{defaultCardFaceOpen ? "Mở Luôn" : "Úp Bài"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleAllowReversedCards}
                  className={`royal-btn-ghost !px-4 !py-2 !text-[11px] ${
                    allowReversedCards ? "!border-gold-400 !text-gold-200 !bg-gold-500/10" : "!text-ivory-500"
                  }`}
                  title={allowReversedCards ? "Xem Thuận Nghịch" : "Chỉ Xem Thuận"}
                >
                  <RotateCw className={`w-3.5 h-3.5 transition-transform duration-300 ${allowReversedCards ? "rotate-180" : ""}`} />
                  <span>{allowReversedCards ? "Xem Thuận Nghịch" : "Chỉ Xem Thuận"}</span>
                </button>
              </div>
            </div>

            {/* Thanh Thông Báo Phân Quyền Chiêm Bái 3 Tầng */}
            <div className="mb-4 p-3.5 rounded-xl border border-gold-800/60 bg-gradient-to-r from-obsidian-900/90 via-[#1E1710]/80 to-obsidian-900/90 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-serif">
              <div className="flex items-start sm:items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gold-500/15 border border-gold-500/40 flex items-center justify-center text-gold-400 shrink-0 mt-0.5 sm:mt-0">
                  <Crown className="w-4 h-4 text-gold-400" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-sans font-bold uppercase tracking-wider text-gold-300 text-[11px]">
                      Quy Định Phân Quyền Chiêm Bái
                    </span>
                    {isVip ? (
                      <span className="text-[10px] uppercase font-sans font-semibold tracking-wide text-amber-300 bg-amber-950/80 border border-amber-500/60 rounded px-1.5 py-0.2">
                        👑 Tài Khoản VIP
                      </span>
                    ) : currentUser ? (
                      <span className="text-[10px] uppercase font-sans font-semibold tracking-wide text-gold-400 bg-gold-950/60 border border-gold-600/50 rounded px-1.5 py-0.2">
                        ⭐ Tài Khoản Đã Đăng Ký
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase font-sans font-semibold tracking-wide text-ivory-400 bg-stone-900 border border-stone-700 rounded px-1.5 py-0.2">
                        Khách Vãng Lai
                      </span>
                    )}
                  </div>
                  <p className="text-ivory-400 text-[11.5px] leading-relaxed">
                    {isVip ? (
                      <span className="text-emerald-400 font-medium">
                        Chúc mừng! Bạn là <strong>Hội Viên VIP</strong> — Được sử dụng tất cả 8 đại phương pháp huyền học và toàn bộ 12 trận pháp.
                      </span>
                    ) : currentUser ? (
                      <span>
                        Tài khoản đã đăng ký: Được sử dụng <strong className="text-gold-300">toàn bộ trận pháp Bốc Bài Kinh Dịch (1—12 lá & Tự chọn)</strong>. Chỉ có <strong className="text-amber-400">Hội viên VIP</strong> mới được sử dụng tất cả 8 phương pháp.
                      </span>
                    ) : (
                      <span>
                        Chưa đăng ký: Chỉ được bốc bài Kinh Dịch <strong className="text-gold-300">1, 2 và 3 lá</strong>.{" "}
                        <button
                          type="button"
                          onClick={() => {
                            setAuthModalMode("register");
                            setIsAuthModalOpen(true);
                          }}
                          className="text-gold-400 underline font-semibold hover:text-gold-200 cursor-pointer"
                        >
                          Đăng ký ngay
                        </button>{" "}
                        để mở toàn bộ trận pháp; <strong className="text-amber-400">Nâng cấp VIP</strong> để mở tất cả phương pháp.
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {!isVip && (
                <button
                  type="button"
                  onClick={() => {
                    if (!currentUser) {
                      setAuthModalMode("register");
                    } else {
                      setAuthModalMode("upgrade");
                    }
                    setIsAuthModalOpen(true);
                  }}
                  className="self-start md:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 via-gold-500 to-amber-600 hover:brightness-110 active:scale-95 text-obsidian-950 font-sans font-bold text-[11px] shadow cursor-pointer whitespace-nowrap transition-all"
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span>{currentUser ? "Nâng Cấp Hội Viên VIP" : "Đăng Ký / Nâng Cấp VIP"}</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {DIVINATION_METHODS.map((method) => {
                const isActive = divinationMethod === method.id;
                const isLocked = method.id !== "cards" && method.id !== "thapla" && method.id !== "nguche" && !isVip;
                return (
                  <button
                    key={method.id}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => handleSelectDivinationMethod(method.id)}
                    className={`royal-card group p-5 text-left flex flex-col cursor-pointer transition-all ${
                      isActive ? "!border-gold-400 shadow-[inset_0_0_0_1px_rgba(201,165,90,0.35)] before:!w-full" : ""
                    } ${isLocked ? "opacity-85 hover:border-amber-600/50" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className={`font-serif text-2xl leading-none transition-colors ${isActive ? "text-gold-400" : isLocked ? "text-amber-700/80 group-hover:text-amber-500" : "text-gold-700 group-hover:text-gold-500"}`}>
                        {method.numeral}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {isLocked ? (
                          <span className="flex items-center gap-1 text-[10px] font-sans font-bold uppercase tracking-wider text-amber-300 bg-amber-950/80 border border-amber-500/50 rounded px-1.5 py-0.5 shadow-xs">
                            <Lock className="w-2.5 h-2.5 text-amber-400" />
                            VIP
                          </span>
                        ) : method.id === "cards" ? (
                          <span className="text-[10px] uppercase font-sans font-semibold tracking-wider text-emerald-400 border border-emerald-800/80 bg-emerald-950/50 rounded-sm px-1.5 py-0.5">
                            {!currentUser ? "1-3 Lá" : "12 Trận"}
                          </span>
                        ) : method.id === "thapla" ? (
                          <span className="text-[10px] uppercase font-sans font-semibold tracking-wider text-[#E0B861] border border-[#C4963E]/60 bg-amber-950/60 rounded-sm px-1.5 py-0.5">
                            2 Bộ Bài • 6 Hào
                          </span>
                        ) : method.id === "nguche" ? (
                          <span className="text-[10px] uppercase font-sans font-semibold tracking-wider text-amber-300 border border-amber-700/80 bg-amber-950/60 rounded-sm px-1.5 py-0.5">
                            3 Lá • 12 Mặt
                          </span>
                        ) : isVip ? (
                          <span className="flex items-center gap-0.5 text-[10px] uppercase font-sans font-bold tracking-wider text-amber-300 border border-amber-600/70 bg-amber-950/50 rounded-sm px-1.5 py-0.5">
                            <Crown className="w-2.5 h-2.5 text-amber-400" /> VIP
                          </span>
                        ) : null}
                        {isActive ? (
                          <span className="royal-seal w-6 h-6 text-[11px]">選</span>
                        ) : method.badge ? (
                          <span className="text-[10px] uppercase tracking-[0.18em] text-gold-600 border border-gold-800 rounded-sm px-1.5 py-0.5">
                            {method.badge}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <h3 className="font-display text-xl text-ivory-100 mt-4 leading-tight flex items-center justify-between gap-1.5">
                      <span>{method.title}</span>
                      {isLocked && <Lock className="w-3.5 h-3.5 text-amber-500/70 shrink-0" />}
                    </h3>
                    <div className="text-[11px] font-serif tracking-[0.3em] text-gold-600 mt-1">{method.chinese}</div>
                    <p className="mt-3 text-[12.5px] text-ivory-500 font-serif leading-relaxed">{method.desc}</p>
                    {isLocked && (
                      <div className="mt-auto pt-3 border-t border-amber-950/40 text-[11px] text-amber-400 font-sans font-medium flex items-center gap-1">
                        <Crown className="w-3 h-3 text-amber-400" />
                        <span>Dành riêng cho Hội Viên VIP</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

            {/* Divination Component Rendering */}
            <div
              id="divination-card-draw-area"
              className="royal-frame relative p-3 sm:p-6 transition-all duration-700"
            >
              <span className="royal-corner tl" />
              <span className="royal-corner tr" />
              <span className="royal-corner bl" />
              <span className="royal-corner br" />

              {divinationMethod === null && (
                <div className="py-12 sm:py-16 px-2 text-center max-w-xl mx-auto">
                  <span className="royal-seal w-14 h-14 text-2xl select-none">卦</span>
                  <h3 className="royal-title mt-6 text-2xl sm:text-3xl">
                    Tâm tĩnh khởi quẻ · Vạn sự tùy duyên
                  </h3>
                  <p className="mt-3 text-sm text-ivory-500 font-serif leading-relaxed">
                    Tâm thanh tịnh, ý thành kính! Bạn hãy bấm chọn một trong các hình thức chiêm đoán phía trên để bắt đầu gieo quẻ:
                  </p>
                  <div className="royal-rule mt-6 text-xs">◆</div>
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
                    {DIVINATION_METHODS.map((method) => {
                      const isLocked = method.id !== "cards" && method.id !== "thapla" && method.id !== "nguche" && !isVip;
                      return (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => handleSelectDivinationMethod(method.id)}
                          className={`royal-link cursor-pointer inline-flex items-center gap-1.5 ${isLocked ? "text-ivory-500 hover:text-amber-300" : ""}`}
                        >
                          <span className="font-serif text-gold-600">{method.numeral}</span>
                          <span>{method.id === "cards" ? "Bốc Bài Kinh Dịch (Đủ 12 Trận)" : method.id === "coins" ? "Gieo Đồng Xu" : method.title}</span>
                          {isLocked && <Lock className="w-3 h-3 text-amber-400 inline" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* VIP Barrier Fallback if non-VIP opens a VIP method */}
              {divinationMethod && divinationMethod !== "cards" && divinationMethod !== "thapla" && divinationMethod !== "nguche" && !isVip && (
                <div className="py-12 px-4 text-center max-w-lg mx-auto">
                  <div className="w-16 h-16 rounded-2xl bg-amber-950/60 border border-amber-600/40 text-amber-400 mx-auto flex items-center justify-center shadow-lg mb-4">
                    <Crown className="w-8 h-8 text-amber-400" />
                  </div>
                  <h3 className="font-display text-2xl text-ivory-100 mb-2">Đặc Quyền Dành Riêng Cho Hội Viên VIP</h3>
                  <p className="text-sm text-ivory-400 font-serif leading-relaxed mb-6">
                    Phương pháp <strong className="text-gold-300">{DIVINATION_METHODS.find((m) => m.id === divinationMethod)?.title}</strong> chỉ dành cho tài khoản VIP.
                    {!currentUser
                      ? " Vui lòng đăng ký hoặc đăng nhập tài khoản VIP để sử dụng tất cả phương pháp huyền học đỉnh cao!"
                      : " Nâng cấp hội viên VIP ngay hôm nay để mở khóa toàn bộ tất cả phương pháp huyền học!"}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (!currentUser) {
                          setAuthModalMode("login");
                        } else {
                          setAuthModalMode("upgrade");
                        }
                        setIsAuthModalOpen(true);
                      }}
                      className="royal-btn-gold !px-6 !py-2.5 font-bold cursor-pointer"
                    >
                      <Crown className="w-4 h-4 mr-1.5 inline" />
                      {currentUser ? "Nâng Cấp Hội Viên VIP" : "Đăng Nhập / Đăng Ký VIP"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDivinationMethod("cards")}
                      className="royal-btn-ghost !px-5 !py-2.5 text-xs cursor-pointer"
                    >
                      Quay Lại Bốc Bài Kinh Dịch
                    </button>
                  </div>
                </div>
              )}

              {/* 1. Bốc Bài Kinh Dịch */}
              {divinationMethod === "cards" && (
                <div id="ban-boc-que" className="scroll-mt-24">
                  <CardDraw
                    isKhongMinhMethod={false}
                    isNguCheMethod={false}
                    suggestedDrawMode={suggestedDrawMode}
                    currentUser={currentUser}
                    onRequireAuth={(mode, msg) => {
                      setAuthModalMode(mode || "register");
                      setIsAuthModalOpen(true);
                      if (msg) showToast(msg);
                    }}
                    onComplete={handleDivinationComplete}
                    cardImages={cardImages}
                    cardVideos={cardVideos}
                    cardBackImage={cardBackImage}
                    activeDeckId={activeDeckId}
                    onActiveDeckChanged={handleActiveDeckChanged}
                    allowReversedCards={allowReversedCards}
                    onToggleAllowReversedCards={handleToggleAllowReversedCards}
                    defaultCardFaceOpen={defaultCardFaceOpen}
                    onToggleDefaultCardFaceOpen={handleToggleDefaultCardFaceOpen}
                    onImageUpdated={handleImageUpdated}
                    onVideoUpdated={handleVideoUpdated}
                    onShowToast={showToast}
                    onOpenDeckManager={() => {
                      if (!isVip) {
                        if (!currentUser) {
                          setAuthModalMode("login");
                          setIsAuthModalOpen(true);
                          showToast("Thư viện Bộ Hình 64 Quẻ chỉ dành riêng cho Hội Viên VIP. Vui lòng đăng nhập!");
                        } else {
                          setAuthModalMode("upgrade");
                          setIsAuthModalOpen(true);
                          showToast("Thư viện Bộ Hình 64 Quẻ là đặc quyền dành riêng cho Hội Viên VIP. Vui lòng nâng cấp VIP!");
                        }
                        return;
                      }
                      setManualSubTab("decks");
                      setCurrentTab("manual");
                    }}
                  />
                </div>
              )}

              {/* 2. Tháp La Kinh Dịch (Quẻ Chủ & Quẻ Biến Song Song Trên - Dưới & Dải Hào Từ Biến Dịch) */}
              {divinationMethod === "thapla" && (
                <div id="ban-boc-que-thapla" className="scroll-mt-24">
                  <ThapLaDivination
                    cardImages={cardImages}
                    cardVideos={cardVideos}
                    cardBackImage={cardBackImage}
                    onComplete={handleDivinationComplete}
                    onShowToast={showToast}
                    onNavigateToDetail={() => setCurrentTab("detail")}
                  />
                </div>
              )}

              {/* 3. Xăm Khổng Minh (Chỉ VIP) */}
              {divinationMethod === "khongminh" && isVip && (
                <CardDraw
                  key="khongminh-card-draw"
                  isKhongMinhMethod={true}
                  isNguCheMethod={false}
                  currentUser={currentUser}
                  onRequireAuth={(mode, msg) => {
                    setAuthModalMode(mode || "upgrade");
                    setIsAuthModalOpen(true);
                    if (msg) showToast(msg);
                  }}
                  onComplete={handleDivinationComplete}
                  cardImages={cardImages}
                  cardVideos={cardVideos}
                  cardBackImage={cardBackImage}
                  activeDeckId={activeDeckId}
                  onActiveDeckChanged={handleActiveDeckChanged}
                  allowReversedCards={allowReversedCards}
                  onToggleAllowReversedCards={handleToggleAllowReversedCards}
                  defaultCardFaceOpen={defaultCardFaceOpen}
                  onToggleDefaultCardFaceOpen={handleToggleDefaultCardFaceOpen}
                  onImageUpdated={handleImageUpdated}
                  onVideoUpdated={handleVideoUpdated}
                  onShowToast={showToast}
                  onOpenDeckManager={() => {
                    if (!isVip) {
                      if (!currentUser) {
                        setAuthModalMode("login");
                        setIsAuthModalOpen(true);
                        showToast("Thư viện Bộ Hình 64 Quẻ chỉ dành riêng cho Hội Viên VIP. Vui lòng đăng nhập!");
                      } else {
                        setAuthModalMode("upgrade");
                        setIsAuthModalOpen(true);
                        showToast("Thư viện Bộ Hình 64 Quẻ là đặc quyền dành riêng cho Hội Viên VIP. Vui lòng nâng cấp VIP!");
                      }
                      return;
                    }
                    setManualSubTab("decks");
                    setCurrentTab("manual");
                  }}
                />
              )}

              {/* 3. Ngự Chế Tân Tập Đoán Dịch Tinh Túy (Bốc 3 lá Thiên - Địa - Nhân, lấy lá cuối làm quẻ, lắc xí ngầu 12 mặt) */}
              {divinationMethod === "nguche" && (
                <CardDraw
                  key="nguche-card-draw"
                  isKhongMinhMethod={false}
                  isNguCheMethod={true}
                  currentUser={currentUser}
                  onRequireAuth={(mode, msg) => {
                    setAuthModalMode(mode || "register");
                    setIsAuthModalOpen(true);
                    if (msg) showToast(msg);
                  }}
                  onComplete={handleDivinationComplete}
                  cardImages={cardImages}
                  cardVideos={cardVideos}
                  cardBackImage={cardBackImage}
                  activeDeckId={activeDeckId}
                  onActiveDeckChanged={handleActiveDeckChanged}
                  allowReversedCards={allowReversedCards}
                  onToggleAllowReversedCards={handleToggleAllowReversedCards}
                  defaultCardFaceOpen={defaultCardFaceOpen}
                  onToggleDefaultCardFaceOpen={handleToggleDefaultCardFaceOpen}
                  onImageUpdated={handleImageUpdated}
                  onVideoUpdated={handleVideoUpdated}
                  onShowToast={showToast}
                  onOpenDeckManager={() => {
                    if (!isVip) {
                      if (!currentUser) {
                        setAuthModalMode("login");
                        setIsAuthModalOpen(true);
                        showToast("Thư viện Bộ Hình 64 Quẻ chỉ dành riêng cho Hội Viên VIP. Vui lòng đăng nhập!");
                      } else {
                        setAuthModalMode("upgrade");
                        setIsAuthModalOpen(true);
                        showToast("Thư viện Bộ Hình 64 Quẻ là đặc quyền dành riêng cho Hội Viên VIP. Vui lòng nâng cấp VIP!");
                      }
                      return;
                    }
                    setManualSubTab("decks");
                    setCurrentTab("manual");
                  }}
                />
              )}

              {/* 3. Phép Rút Cỏ Thi (Chỉ VIP) */}
              {divinationMethod === "yarrow" && isVip && (
                <YarrowDivination
                  onComplete={(primary, changing, transformed, summary) => {
                    handleDivinationComplete(
                      primary,
                      changing,
                      transformed,
                      summary || `Chiêm bặc bằng 50 cọng cỏ thi (Đại Diễn): Quẻ #${primary.number} ${primary.name}`,
                      undefined,
                      {
                        spreadType: "yarrow",
                      }
                    );
                  }}
                  onReset={() => {
                    setPrimaryHexagram(null);
                    setChangingLines([]);
                    setTransformedHexagram(undefined);
                  }}
                />
              )}

              {/* 4. Gieo 3 Đồng Xu Lục Hào (Chỉ VIP) */}
              {divinationMethod === "coins" && isVip && (
                <CoinToss
                  onComplete={(primary, changing, transformed, summary) => {
                    handleDivinationComplete(
                      primary,
                      changing,
                      transformed,
                      summary || `Gieo 3 đồng tiền cổ (Lục Hào): Quẻ #${primary.number} ${primary.name}`,
                      undefined,
                      {
                        spreadType: "coins",
                      }
                    );
                  }}
                  onReset={() => {
                    setPrimaryHexagram(null);
                    setChangingLines([]);
                    setTransformedHexagram(undefined);
                  }}
                />
              )}

              {/* 5. Mai Hoa Dịch Số (Chỉ VIP) */}
              {divinationMethod === "maihoa" && isVip && (
                <MaiHoaDivination
                  onComplete={(primary, changing, transformed, summary) => {
                    handleDivinationComplete(
                      primary,
                      changing,
                      transformed,
                      summary || `Mai Hoa Dịch Số: Quẻ #${primary.number} ${primary.name}`,
                      undefined,
                      {
                        spreadType: "maihoa",
                      }
                    );
                  }}
                  onReset={() => {
                    setPrimaryHexagram(null);
                    setChangingLines([]);
                    setTransformedHexagram(undefined);
                  }}
                />
              )}

              {/* 7. Kỳ Môn Độn Giáp (Chỉ VIP) */}
              {divinationMethod === "kymon" && isVip && (
                <KyMonDivination
                  onComplete={(primary, changing, transformed, summary) => {
                    handleDivinationComplete(
                      primary,
                      changing,
                      transformed,
                      summary || `Kỳ Môn Độn Giáp: Quẻ #${primary.number} ${primary.name}`,
                      undefined,
                      {
                        spreadType: "kymon",
                      }
                    );
                  }}
                  onReset={() => {
                    setPrimaryHexagram(null);
                    setChangingLines([]);
                    setTransformedHexagram(undefined);
                  }}
                />
              )}

              {/* 8. Thái Ất Thần Số (Chỉ VIP) */}
              {divinationMethod === "thaiat" && isVip && (
                <ThaiAtDivination
                  onComplete={(primary, changing, transformed, summary) => {
                    handleDivinationComplete(
                      primary,
                      changing,
                      transformed,
                      summary || `Thái Ất Thần Số: Quẻ #${primary.number} ${primary.name}`,
                      undefined,
                      {
                        spreadType: "thaiat",
                      }
                    );
                  }}
                  onReset={() => {
                    setPrimaryHexagram(null);
                    setChangingLines([]);
                    setTransformedHexagram(undefined);
                  }}
                />
              )}

              {/* 6. Lục Nhâm Đại Độn (Chỉ VIP) */}
              {divinationMethod === "lucnham" && isVip && (
                <div className="space-y-4">
                  {/* Khung Khởi Lập Quẻ Lục Nhâm tại Chỗ Bốc Quẻ */}
                  <div className="bg-gradient-to-r from-[#22180F] via-[#1B140D] to-[#22180F] border border-[#5A4126] rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#3E2D1A] pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C9A55A] to-[#8C6218] flex items-center justify-center text-[#120F0B] font-bold shadow text-lg">
                          🧭
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-serif font-bold text-sm sm:text-base text-[#F5EAD4]">
                              LẬP QUẺ LỤC NHÂM ĐẠI ĐỘN
                            </h3>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2C1F12] text-[#D6B97A] border border-[#523E26]">
                              Tam Thức Chi Thủ
                            </span>
                          </div>
                          <p className="text-[11px] text-[#A89882] mt-0.5">
                            Khởi quẻ theo thời khắc & Hoạt Thời • Phần Bảng Lục Nhâm chi tiết đã kéo ra ngoài bên dưới
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleScrollToLucNhamChart}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#C89B3C] via-[#E2C37A] to-[#A87B25] text-[#14100C] text-xs font-serif font-bold shadow hover:brightness-110 active:scale-95 cursor-pointer transition-all ml-auto"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>Xem Bảng Lục Nhâm Bên Dưới ⬇️</span>
                      </button>
                    </div>

                    {/* Câu Hỏi Tâm Niệm */}
                    <div className="bg-[#15100B] border border-[#3A2A1A] rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-amber-400 font-bold shrink-0">Tâm niệm:</span>
                        <span className="text-[#F5EAD4] font-serif italic font-medium truncate">
                          "{question || "Chiêm đoán thời vận, công việc, tài lộc và sự vụ..."}"
                        </span>
                      </div>
                      <span className="text-[11px] text-[#C9A55A] bg-[#241A10] px-2 py-0.5 rounded border border-[#48341E] whitespace-nowrap shrink-0">
                        {category}
                      </span>
                    </div>

                    {/* KHU VỰC HOẠT THỜI: LỰA CHỌN TRỰC TIẾP HOẶC LẮC XÍ NGẦU */}
                    <div className="bg-[#18120B] border border-[#42311E] rounded-xl p-3.5 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="text-xs font-serif font-bold text-[#D6B97A] flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            HOẠT THỜI (THỜI THẦN CHIÊM ĐOÁN):
                          </span>
                          <span className="text-[11px] text-[#A89882] block mt-0.5">
                            Lựa chọn bất kỳ Địa Chi nào trong 12 con giáp hoặc bấm Lắc Xí Ngầu 12 mặt
                          </span>
                        </div>

                        {/* Nút Lắc Xí Ngầu */}
                        <button
                          type="button"
                          disabled={isLucNhamRolling}
                          onClick={handleRollLucNhamHoatThoi}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#C9A55A] to-[#C59B27] hover:from-[#E5C158] hover:to-[#C9A55A] text-[#120F0B] font-bold text-xs shadow-md active:scale-95 cursor-pointer transition-all disabled:opacity-50"
                          title="Lắc xí ngầu 12 mặt để lấy ngẫu nhiên 1 trong 12 Địa Chi"
                        >
                          <Dices className={`w-3.5 h-3.5 ${isLucNhamRolling ? "animate-spin" : ""}`} />
                          <span>{isLucNhamRolling ? "Đang gieo..." : "Lắc Xí Ngầu 12 Mặt"}</span>
                        </button>
                      </div>

                      {/* Thông tin Chi Hoạt Thời Đang Chọn */}
                      {(() => {
                        const curChiObj = CHI_LIST.find((c) => c.name === lucNhamHourChi);
                        return (
                          <div className="bg-[#21170E] border border-[#523B22] rounded-xl p-2.5 flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3D2C1B] to-[#1A120B] border border-[#C9A55A] shadow-[0_0_12px_rgba(212,175,55,0.25)] flex flex-col items-center justify-center shrink-0">
                              <span className="text-lg leading-none font-serif font-bold text-[#E6D3A3]">
                                {curChiObj?.chinese || "午"}
                              </span>
                              <span className="text-[10px] text-[#A89882]">{lucNhamHourChi}</span>
                            </div>
                            <div className="flex-1 min-w-0 text-xs">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-[#F5EAD4] font-serif text-sm">
                                  Giờ {lucNhamHourChi} ({curChiObj?.chinese})
                                </span>
                                <span className="text-[11px] px-2 py-0.2 rounded bg-amber-950/80 text-amber-200 border border-amber-600/70 font-medium">
                                  Hoạt Thời Đang Áp Dụng
                                </span>
                              </div>
                              <p className="text-[11px] text-[#B8A790] mt-0.5">
                                Con Giáp: <strong>{curChiObj?.zodiac}</strong> ({curChiObj?.polarity === "duong" ? "Dương Chi" : "Âm Chi"})
                              </p>
                            </div>
                          </div>
                        );
                      })()}

                      {/* BỘ 12 NÚT BẤM LỰA CHỌN HOẠT THỜI TRỰC TIẾP */}
                      <div>
                        <div className="text-[10.5px] font-serif text-[#CDBFA8] mb-1.5 flex items-center justify-between">
                          <span>BẤM CHỌN 1 TRONG 12 ĐỊA CHI ĐỂ ĐỔI HOẠT THỜI:</span>
                          <span className="text-[9.5px] text-[#8C7D6B]">12 Cung Thời Thần</span>
                        </div>
                        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-1.5">
                          {CHI_LIST.map((item) => {
                            const isSelected = lucNhamHourChi === item.name;
                            return (
                              <button
                                key={item.name}
                                type="button"
                                onClick={() => handleSelectLucNhamHoatThoi(item.name)}
                                className={`p-1.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                                  isSelected
                                    ? "bg-[#C9A55A] text-[#120F0B] font-bold border-[#F5EAD4] shadow-md scale-105 ring-1 ring-[#F5EAD4]"
                                    : "bg-[#22180F] hover:bg-[#302115] text-[#DDD0BE] border-[#3E2D1C] hover:border-amber-500/50"
                                }`}
                                title={`Lựa chọn Hoạt Thời: Giờ ${item.name} (${item.chinese} - ${item.zodiac})`}
                              >
                                <span className="text-base leading-none mb-0.5">{item.emoji}</span>
                                <span className="text-xs font-serif font-bold leading-tight">
                                  {item.name}
                                </span>
                                <span className="text-[9px] opacity-75">{item.chinese}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* ========================================================
                        PHẦN LỤC NHÂM HÓA DỊCH (DIỄN BIẾN SANG 64 QUẺ CHU DỊCH)
                        ======================================================== */}
                    {(() => {
                      const dCan = bocQueLucNhamPillars[1]?.can || "Giáp";
                      const dChi = bocQueLucNhamPillars[1]?.chi || "Tý";
                      const hCan = bocQueLucNhamPillars[0]?.can || "Giáp";
                      return (
                        <LucNhamHoaDichSection
                          dayCan={dCan}
                          dayChi={dChi}
                          hourCan={hCan}
                          hourChi={lucNhamHourChi}
                          onProceedToDetails={(primary, changing, transformed, summary) => {
                            handleDivinationComplete(
                              primary,
                              changing,
                              transformed,
                              summary || `Lục Nhâm Đại Độn (Lục Nhâm Hóa Dịch): Quẻ #${primary.number} ${primary.name}`,
                              undefined,
                              {
                                spreadType: "lucnham",
                              }
                            );
                          }}
                        />
                      );
                    })()}

                    {/* Dẫn xuống Bảng Lục Nhâm đã kéo ra ngoài */}
                    <div className="pt-1 text-center">
                      <button
                        type="button"
                        onClick={handleScrollToLucNhamChart}
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#2A1D11] via-[#3D2916] to-[#2A1D11] hover:from-[#352516] hover:to-[#352516] border border-[#6B4B27] hover:border-[#C9A55A] text-[#E6D3A3] text-xs font-serif font-bold transition-all cursor-pointer shadow flex items-center justify-center gap-2 group"
                      >
                        <Compass className="w-4 h-4 text-[#C9A55A] group-hover:rotate-45 transition-transform" />
                        <span>BẢNG LỤC NHÂM ĐÃ KÉO RA NGOÀI BÊN DƯỚI • BẤM ĐỂ XEM CHI TIẾT ⬇️</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ========================================================
                PHẦN BẢNG LỤC NHÂM ĐƯỢC KÉO RA NGOÀI CHỖ BỐC QUẺ
                - Hoàn toàn độc lập với Bảng Lục Nhâm ở Tab Hoa Giáp
                ======================================================== */}
            {divinationMethod === "lucnham" && isVip && (
              <div id="lucnham-chart-area-bocque" className="w-full mt-6 space-y-4 scroll-mt-20 animate-in fade-in duration-500">
                <div className="bg-[#1C160F] border border-[#523E26] rounded-2xl p-3.5 sm:p-4 shadow-xl flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-[#241A10] via-[#1B140D] to-[#241A10]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C9A55A] to-[#8C6218] flex items-center justify-center text-[#120F0B] font-bold shadow shrink-0 text-lg">
                      🧭
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-sm sm:text-base text-[#F5EAD4] flex items-center gap-2 flex-wrap">
                        <span>BẢNG LỤC NHÂM ĐẠI ĐỘN (CHỖ BỐC QUẺ)</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2C1F12] text-[#D6B97A] border border-[#523E26] font-normal">
                          Bảng Bốc Quẻ Độc Lập
                        </span>
                      </h3>
                      <p className="text-[11px] text-[#A89882] font-serif">
                        Thiên Địa Bàn • Tứ Khóa • Tam Truyền • 12 Thần Tướng • Thần Sát (Độc Lập với Tab Hoa Giáp)
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById("divination-card-draw-area");
                      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl bg-[#291E13] hover:bg-[#382819] text-[#D6B97A] border border-[#543D24] cursor-pointer transition-all ml-auto font-medium"
                    title="Cuộn lên lại chỗ bốc quẻ để đổi Hoạt Thời hoặc lắc xí ngầu"
                  >
                    <span>⬆️ Lên Chỗ Bốc Quẻ</span>
                  </button>
                </div>

                <JiaziLucNhamSection
                  id="lucnham-chart-area-bocque"
                  mode="bocque"
                  storageKey="iching_lucnham_bazi_bocque"
                  storageScope="bocque"
                  boardContextLabel="Bảng Bốc Quẻ"
                  defaultExpanded={true}
                  className="w-full"
                  showHoaDich={false}
                  dayCan={bocQueLucNhamPillars[1]?.can}
                  dayChi={bocQueLucNhamPillars[1]?.chi}
                  hourCan={bocQueLucNhamPillars[0]?.can}
                  hourChi={bocQueLucNhamPillars[0]?.chi || "Tỵ"}
                  selectedHoatThoiBranch={lucNhamHourChi}
                  onPillarsChange={(newPillars) => {
                    setBocQueLucNhamPillars(newPillars);
                  }}
                  onApplyHoatThoi={(chi) => handleApplyLucNhamHourPillar(chi)}
                  onSelectHoatThoi={(chi) => handleSelectLucNhamHoatThoi(chi)}
                  onSelectJiazi={(id) => {
                    setCurrentTab("jiazi");
                    showToast("Đã mở Tab 60 Hoa Giáp để xem chi tiết ảnh và lời bình!");
                    setTimeout(() => {
                      const el = document.getElementById("jiazi-detail-container");
                      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }, 150);
                  }}
                  onProceedToDetails={(primary, changing, transformed, summary) => {
                    handleDivinationComplete(
                      primary,
                      changing,
                      transformed,
                      summary || `Lục Nhâm Đại Độn (Lục Nhâm Hóa Dịch): Quẻ #${primary.number} ${primary.name}`,
                      undefined,
                      {
                        spreadType: "lucnham",
                      }
                    );
                  }}
                />
              </div>
            )}
          </div>

        {/* TAB 2: THUYẾT MINH & BỘ HÌNH 64 QUẺ */}
        {(currentTab === "manual" || currentTab === "decks") && (
          !isVip ? (
            renderVipTabGate(
              "Sách Thuyết Minh 64 Quẻ & Bộ Hình",
              "Sách Thuyết Minh 64 Quẻ Chu Dịch nguyên bản, luận giải cát hung hào từ và thư viện ảnh 64 quẻ"
            )
          ) : (
            <div className="space-y-5">
            {/* Thanh chuyển đổi phân đoạn Thuyết Minh vs Bộ Hình 64 Quẻ */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-gold-800/80">
              <div className="flex items-center gap-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setManualSubTab("book");
                    if (currentTab === "decks") setCurrentTab("manual");
                  }}
                  className={`-mb-px flex items-center gap-2 px-3 sm:px-4 py-3 border-b font-display text-base sm:text-lg transition-colors cursor-pointer ${
                    (manualSubTab === "book" && currentTab !== "decks")
                      ? "border-gold-400 text-gold-200"
                      : "border-transparent text-ivory-500 hover:text-ivory-100"
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Sách Thuyết Minh (64 Quẻ & Bát Quái)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!isVip) {
                      if (!currentUser) {
                        setAuthModalMode("login");
                        setIsAuthModalOpen(true);
                        showToast("Thư viện Bộ Hình 64 Quẻ chỉ dành riêng cho Hội Viên VIP. Vui lòng đăng nhập!");
                      } else {
                        setAuthModalMode("upgrade");
                        setIsAuthModalOpen(true);
                        showToast("Thư viện Bộ Hình 64 Quẻ là đặc quyền dành riêng cho Hội Viên VIP. Vui lòng nâng cấp gói VIP!");
                      }
                      return;
                    }
                    setManualSubTab("decks");
                  }}
                  className={`-mb-px flex items-center gap-2 px-3 sm:px-4 py-3 border-b font-display text-base sm:text-lg transition-colors cursor-pointer ${
                    (manualSubTab === "decks" || currentTab === "decks")
                      ? "border-gold-400 text-gold-200"
                      : "border-transparent text-ivory-500 hover:text-ivory-100"
                  }`}
                >
                  <Palette className="w-4 h-4" />
                  <span>Bộ Hình 64 Quẻ</span>
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-sans font-bold bg-gold-950 text-gold-400 border border-gold-700/60 font-mono">
                    <Crown className="w-2.5 h-2.5 text-amber-400" />
                    VIP
                  </span>
                </button>
              </div>

              <div className="text-[11px] font-serif italic text-ivory-500 pb-3 hidden md:block">
                {(manualSubTab === "book" && currentTab !== "decks")
                  ? "Đọc toàn văn 9 chương Thuyết Minh & 64 Quẻ Dịch"
                  : "Quản lý hình ảnh 64 lá bài, mặt sau & nhiều bộ bài Tarot"}
              </div>
            </div>

            {manualSubTab === "book" && currentTab !== "decks" ? (
              <ManualBookSection
                defaultExpanded={true}
                selectedHexNumber={manualSelectedHexNum}
                cardImages={cardImages}
                cardVideos={cardVideos}
                onImageUpdated={handleImageUpdated}
                onVideoUpdated={handleVideoUpdated}
                onOpenJiazi={() => setCurrentTab("jiazi")}
                onOpenDecks={() => {
                  if (!isVip) {
                    if (!currentUser) {
                      setAuthModalMode("login");
                      setIsAuthModalOpen(true);
                      showToast("Thư viện Bộ Hình 64 Quẻ chỉ dành riêng cho Hội Viên VIP. Vui lòng đăng nhập!");
                    } else {
                      setAuthModalMode("upgrade");
                      setIsAuthModalOpen(true);
                      showToast("Thư viện Bộ Hình 64 Quẻ là đặc quyền dành riêng cho Hội Viên VIP. Vui lòng nâng cấp gói VIP!");
                    }
                    return;
                  }
                  setManualSubTab("decks");
                }}
                currentUser={currentUser}
                onOpenAuthModal={(mode) => {
                  setAuthModalMode(mode || "register");
                  setIsAuthModalOpen(true);
                }}
                onSelectHexagram={(hexNum) => {
                  setManualSelectedHexNum(hexNum);
                  const hex = HEXAGRAMS.find((h) => h.number === hexNum);
                  if (hex) {
                    setPrimaryHexagram(hex);
                    showToast(`Đang xem Thuyết Minh Quẻ #${hex.number} ${hex.name}`);
                  }
                }}
                onOpenDetailTab={(hexNum) => {
                  setManualSelectedHexNum(hexNum);
                  const hex = HEXAGRAMS.find((h) => h.number === hexNum);
                  if (hex) {
                    setPrimaryHexagram(hex);
                    setChangingLines([]);
                    setTransformedHexagram(undefined);
                    setCardsDrawSummary(`Tra cứu từ Thuyết Minh: Quẻ #${hex.number} ${hex.name} (${hex.vietnameseName})`);
                    setActiveQuestion(question.trim() || `Tìm hiểu ý nghĩa Quẻ #${hex.number} ${hex.name}`);
                    setActiveCategory(category);
                    setCurrentTab("detail");
                    showToast(`Đã mở luận giải chi tiết Quẻ #${hex.number} ${hex.name}`);
                  }
                }}
              />
            ) : !isVip ? (
              <div className="royal-frame p-6 sm:p-10 text-center max-w-xl mx-auto my-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
                <span className="royal-corner tl" />
                <span className="royal-corner tr" />
                <span className="royal-corner bl" />
                <span className="royal-corner br" />

                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-amber-500/25 to-amber-700/10 border border-gold-600/60 flex items-center justify-center text-gold-400 shadow-xl">
                  <Crown className="w-8 h-8 text-amber-400 animate-pulse" />
                </div>

                <div className="royal-eyebrow mt-4">Đặc Quyền Hội Viên VIP Cửu Nhị</div>

                <h3 className="royal-title mt-2 text-2xl sm:text-3xl text-gold-200">
                  Thư Viện Bộ Hình 64 Quẻ
                </h3>

                <p className="text-sm font-serif text-ivory-300 leading-relaxed mt-3 max-w-md mx-auto">
                  Tính năng xem trọn bộ tranh 64 quẻ vẽ tay nghệ thuật, chuyển đổi linh hoạt giữa các bộ bài độc quyền (Bộ Quân Tử, Bộ 1 Có Chữ, Bộ 2, Bộ Không Chữ) và tùy biến nạp ảnh cá nhân là đặc quyền dành riêng cho <strong>Hội Viên VIP</strong>.
                </p>

                <div className="p-4 rounded-xl bg-lacquer-900/90 border border-gold-800/80 text-left space-y-2 mt-5 text-xs font-serif text-ivory-400">
                  <div className="flex items-center gap-2 text-gold-300 font-bold">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Đặc quyền mở khóa cho Hội Viên VIP:</span>
                  </div>
                  <div className="flex items-start gap-2 pl-6">
                    <span className="text-gold-500">•</span>
                    <span>Truy cập trọn bộ 64 lá bài tranh vẽ sơn mài cổ truyền & chiêm tinh huyền bí</span>
                  </div>
                  <div className="flex items-start gap-2 pl-6">
                    <span className="text-gold-500">•</span>
                    <span>Tự do đổi giữa 4 bộ bài nguyên bản: Bộ Quân Tử, Bộ Có Chữ 1 & 2, Bộ Không Chữ</span>
                  </div>
                  <div className="flex items-start gap-2 pl-6">
                    <span className="text-gold-500">•</span>
                    <span>Tải lên bộ bài cá nhân, thay đổi hình ảnh từng quẻ và sao lưu dữ liệu riêng</span>
                  </div>
                </div>

                <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (!currentUser) {
                        setAuthModalMode("login");
                      } else {
                        setAuthModalMode("upgrade");
                      }
                      setIsAuthModalOpen(true);
                    }}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-gold-500 via-amber-400 to-gold-600 text-stone-950 font-serif font-bold text-sm shadow-lg shadow-amber-950/60 hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Crown className="w-4 h-4 text-stone-950" />
                    <span>{currentUser ? "Nâng Cấp Hội Viên VIP (1.000.000 VNĐ/Năm)" : "Đăng Nhập / Đăng Ký VIP"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setManualSubTab("book");
                      if (currentTab === "decks") setCurrentTab("manual");
                    }}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-lacquer-800 hover:bg-lacquer-700 text-ivory-300 border border-gold-800/80 font-serif text-xs font-semibold transition-all cursor-pointer"
                  >
                    Về Sách Thuyết Minh
                  </button>
                </div>
              </div>
            ) : (
              <DeckManager
                activeDeckId={activeDeckId}
                onActiveDeckChanged={handleActiveDeckChanged}
                onClose={() => setManualSubTab("book")}
                currentUser={currentUser}
                onOpenAuthModal={(mode) => {
                  setAuthModalMode(mode || "upgrade");
                  setIsAuthModalOpen(true);
                }}
              />
            )}
          </div>
        )
      )}

        {/* TAB: LỤC THẬP HOA GIÁP (60 CAN CHI) */}
        <div className={currentTab === "jiazi" ? "block" : "hidden"}>
          {!isVip ? (
            renderVipTabGate(
              "Lục Thập Hoa Giáp (60 Can Chi)",
              "Lục Thập Hoa Giáp phối quẻ, nạp ảnh can chi và bảng Bát Tự Lục Nhâm chuyên sâu"
            )
          ) : (
            <JiaziSection
              cardImages={cardImages}
              onImageUpdated={handleImageUpdated}
              onSelectHexagram={(hexNumber) => {
                if (!isVip) {
                  setAuthModalMode("upgrade");
                  setIsAuthModalOpen(true);
                  return;
                }
                setManualSelectedHexNum(hexNumber);
                const hex = HEXAGRAMS.find((h) => h.number === hexNumber);
                if (hex) {
                  setPrimaryHexagram(hex);
                  setChangingLines([]);
                  setTransformedHexagram(undefined);
                  setCardsDrawSummary(`Tra cứu từ Hoa Giáp: Quẻ #${hex.number} ${hex.name} (${hex.vietnameseName})`);
                  setActiveQuestion(`Khảo cứu Quẻ #${hex.number} ${hex.name} tương ứng trong Lục Thập Hoa Giáp`);
                  setActiveCategory("Tổng quát");
                  setCurrentTab("manual");
                  showToast(`Đã mở thuyết minh Quẻ #${hex.number} ${hex.name}`);
                }
              }}
            />
          )}
        </div>

        {/* TAB: LỊCH DỤNG SỰ (CAN CHI, TRỰC NHẬT TINH & 12 GIỜ TÂM ẤN PHÚ) */}
        <div className={currentTab === "calendar" ? "block" : "hidden"}>
          {!isVip ? (
            renderVipTabGate(
              "Lịch Dụng Sự & Giờ Tâm Ấn Phú",
              "Tra cứu Can Chi ngày giờ hoàng đạo, Trực Nhật Tinh Tú và 12 Giờ Tâm Ấn Phú gia truyền"
            )
          ) : (
            <LichDungSuSection
              onSelectHourPillar={(can, chi) => {
                showToast(`Đã chọn Giờ ${can} ${chi} cho Dụng Sự`);
              }}
              onOpenDailyHexagram={() => setIsDailyHexagramOpen(true)}
              cardImages={cardImages}
            />
          )}
        </div>

        {/* TAB: HÀN NHIỆT MỆNH (TÔ DÂN PHONG) */}
        <div className={currentTab === "hannhiet" ? "block" : "hidden"}>
          {!isVip ? (
            renderVipTabGate(
              "Bát Tự Hàn Nhiệt Mệnh (Tô Dân Phong)",
              "Khảo sát Hàn Mệnh, Nhiệt Mệnh, Bình Mệnh kết hợp Cửu Cung Phi Tinh và vận trình phong thủy"
            )
          ) : (
            <HanNhietMenhSection />
          )}
        </div>

        {/* TAB: DETAILED INTERPRETATION (GIẢI NGHĨA QUẺ) */}
        {currentTab === "detail" && (
          <div>
            {primaryHexagram ? (
              <HexagramDetail
                question={activeQuestion}
                category={activeCategory}
                primaryHexagram={primaryHexagram}
                changingLines={changingLines}
                transformedHexagram={transformedHexagram}
                cardsDrawSummary={cardsDrawSummary}
                doubleMode={activeDoubleMode}
                choiceALabel={activeChoiceALabel}
                choiceBLabel={activeChoiceBLabel}
                threeMode={activeThreeMode}
                choiceCLabel={activeChoiceCLabel}
                drawnCards={activeDrawnCards}
                spreadType={activeSpreadType}
                customPositions={activeCustomPositions}
                cardImages={cardImages}
                cardVideos={cardVideos}
                cardBackImage={cardBackImage}
                isCard2Reversed={activeIsCard2Reversed}
                onToggleCard2Reversed={() => setActiveIsCard2Reversed((prev) => !prev)}
                isCard2AReversed={activeIsCard2AReversed}
                onToggleCard2AReversed={() => setActiveIsCard2AReversed((prev) => !prev)}
                isCard2BReversed={activeIsCard2BReversed}
                onToggleCard2BReversed={() => setActiveIsCard2BReversed((prev) => !prev)}
                onImageUpdated={handleImageUpdated}
                onVideoUpdated={handleVideoUpdated}
                onSaveToHistory={handleSaveToHistory}
                onNewDivination={handleNewDivination}
                initialAiText={activeAiText}
                menhBranchNumber={activeMenhBranchNumber}
                diceRollResult={activeDiceRollResult}
                deckCount={activeDeckCount}
                multiDeckMode={activeMultiDeckMode}
                defaultCardFaceOpen={defaultCardFaceOpen}
                onToggleDefaultCardFaceOpen={handleToggleDefaultCardFaceOpen}
                onOpenWorkspace={(tab) => handleOpenWorkspace(tab)}
                companionCards={activeCompanionCards}
                onDrawCompanionCard={handleDrawCompanionCard}
                onRemoveCompanionCard={handleRemoveCompanionCard}
                onNavigateToManual={(hexNum) => {
                  setManualSelectedHexNum(hexNum);
                  setCurrentTab("manual");
                  setTimeout(() => {
                    const cardEl = document.getElementById("selected-hex-card");
                    if (cardEl) {
                      cardEl.scrollIntoView({ behavior: "smooth", block: "start" });
                    } else {
                      const el = document.getElementById("thuyet-minh");
                      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }, 120);
                  const hex = HEXAGRAMS.find((h) => h.number === hexNum);
                  showToast(`Đã mở Thuyết Minh Quẻ #${hexNum} ${hex ? hex.name : ""}`);
                }}
                onShowToast={showToast}
              />
            ) : (
              <div className="bg-[#171512] border border-[#3A3225] rounded-2xl p-12 text-center text-[#8C7D6A] max-w-lg mx-auto">
                <div className="w-14 h-14 mx-auto rounded-full bg-[#201B15] border border-[#382E22] flex items-center justify-center text-[#C9A55A] mb-3">
                  <Compass className="w-6 h-6" />
                </div>
                <h4 className="font-serif text-[#EDE0C9] text-base font-bold mb-1">
                  Chưa có lá bài nào được bốc
                </h4>
                <p className="text-xs mb-5">
                  Hãy trở về mục "Bốc Quẻ" để chọn rút lá bài hoặc chọn một quẻ từ Lịch Sử Bói.
                </p>
                <button
                  onClick={() => setCurrentTab("divination")}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#C89B3C] to-[#E2C37A] hover:brightness-110 text-[#14120F] font-bold text-xs rounded-xl shadow cursor-pointer"
                >
                  Đến Trang Bốc Quẻ
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: 64 HEXAGRAMS LIBRARY (BÁCH KHOA 64 QUẺ) */}
        {currentTab === "library" && (
          <HexagramLibrary
            cardImages={cardImages}
            onSelectHexagram={handleSelectLibraryHexagram}
            onImageUpdated={handleImageUpdated}
          />
        )}

        {/* TAB 5: HISTORY (LỊCH SỬ BÓI) */}
        {currentTab === "history" && (
          <HistoryView
            records={history}
            cardImages={cardImages}
            onSelectRecord={handleSelectHistoryRecord}
            onDeleteRecord={handleDeleteRecord}
            onToggleFavorite={handleToggleFavorite}
            onUpdateNotes={handleUpdateNotes}
            onClearAll={handleClearAll}
            onImportRecords={handleImportRecords}
            onOpenWorkspace={handleOpenWorkspaceForRecord}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-12 bg-[#0B0A08]/90">
        <div className="h-px bg-gradient-to-r from-transparent via-gold-600/50 to-transparent" />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center space-y-6">
          <div className="flex justify-center">
            <BrandLockup markSize={44} />
          </div>
          <p className="font-display italic text-lg text-ivory-300 max-w-xl mx-auto leading-relaxed">
            "Thiên hành kiện, quân tử dĩ tự cường bất tức. Địa thế khôn, quân tử dĩ hậu đức tải vật."
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            <a
              href="https://zalo.me/g/vwzsqvnh3gdbzst2psyh"
              target="_blank"
              rel="noopener noreferrer"
              className="royal-link"
            >
              Nhóm Zalo Cửu Nhị · Giao lưu Dịch Lý <span className="text-gold-500">→</span>
            </a>
          </div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-ivory-500/70">
            Bốc Bài Kinh Dịch &amp; Lục Hào Thần Dịch · Trí tuệ cổ nhân
          </p>
        </div>
      </footer>

      {/* Google Workspace Modal (Docs, Sheets, Gmail, Drive & Picker) */}
      <GoogleWorkspaceModal
        isOpen={isWorkspaceModalOpen}
        onClose={() => setIsWorkspaceModalOpen(false)}
        defaultTab={workspaceDefaultTab}
        activeDeckId={activeDeckId}
        onCardImageSet={handleImageUpdated}
        onCardBackSet={(dataUrl) => setCardBackImage(dataUrl)}
        readingData={
          customWorkspaceReading || {
            question: activeQuestion || question,
            primaryHexagram,
            transformedHexagram,
            changingLines,
            aiAnalysis: activeAiText,
            divinationMethod: activeSpreadType || "Bốc bài 3 lá",
          }
        }
      />

      {/* Modal Quẻ Ngày Kinh Dịch Dựa Trên Lịch Dương */}
      <DailyHexagramModal
        isOpen={isDailyHexagramOpen}
        onClose={() => setIsDailyHexagramOpen(false)}
        cardImages={cardImages}
        onNavigateToDetail={(hexNum) => {
          const hex = HEXAGRAMS.find((h) => h.number === hexNum);
          if (hex) {
            setPrimaryHexagram(hex);
            setChangingLines([]);
            setTransformedHexagram(undefined);
            setCardsDrawSummary(`Tra cứu từ Quẻ Ngày: Quẻ #${hex.number} ${hex.name} (${hex.vietnameseName})`);
            setActiveQuestion(question.trim() || `Tìm hiểu vận trình Quẻ Ngày #${hex.number} ${hex.name}`);
            setActiveCategory("Tổng quát");
            setCurrentTab("detail");
            showToast(`Đã mở luận giải chi tiết Quẻ Ngày #${hex.number} ${hex.name}`);
          }
        }}
        onNavigateToManual={(hexNum) => {
          setManualSelectedHexNum(hexNum);
          setCurrentTab("manual");
          const hex = HEXAGRAMS.find((h) => h.number === hexNum);
          showToast(`Đang xem Thuyết Minh Quẻ #${hexNum} ${hex ? hex.name : ""}`);
        }}
        onNavigateToCalendar={() => {
          setCurrentTab("calendar");
          showToast("Đã mở Tab Lịch Dụng Sự & 12 Giờ Tâm Ấn Phú!");
        }}
        onOpenWorkspace={(tab) => handleOpenWorkspace(tab)}
      />

      {/* Modal Đăng Ký Thành Viên & Đăng Nhập Tài Khoản Cửu Nhị */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authModalMode}
        onSuccess={(user) => {
          setCurrentUser(user);
          const isVipUser = Boolean(user.isMember || user.isAdmin);
          if (isVipUser) {
            const customDeck = getUserCustomDeckId(user.id, user.preferredDeckId);
            const targetDeck = customDeck || DEFAULT_VIP_DECK_ID;
            loadCustomDeck(targetDeck);
          }
          showToast(
            user.isMember
              ? `Chúc mừng ${user.name}! Bạn đã là Hội Viên VIP - Đã kích hoạt Bộ Không Chữ (Nguyên Bản).`
              : `Chào mừng ${user.name} đã đăng nhập!`
          );
          setCurrentTab("divination");
        }}
        onShowToast={showToast}
      />

      {/* Modal Quản Trị Hệ Thống Dành Cho Admin cuunhi */}
      <AdminManagementModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        currentUser={currentUser}
        onShowToast={showToast}
      />
    </div>
  );
}
