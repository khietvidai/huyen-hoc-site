/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Sparkles,
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
} from "lucide-react";
import { CHI_LIST, CAN_LIST, getCurrentBaziPillars, PillarItem } from "./data/baziConstants";
import { Hexagram, DivinationRecord, DoubleCardMode, ThreeCardMode, SpreadType, CustomCardPosition } from "./types";
import { HEXAGRAMS } from "./data/hexagrams";
import { Header, NavTab } from "./components/Header";
import { CardDraw } from "./components/CardDraw";
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
import { HomeSection } from "./components/HomeSection";
import { DailyHexagramModal } from "./components/DailyHexagramModal";
import { DailyHexagramWidget } from "./components/DailyHexagramWidget";
import { GoogleWorkspaceModal, WorkspaceTab, DivinationReadingData } from "./components/GoogleWorkspaceModal";
import { AuthModal } from "./components/AuthModal";
import { AdminManagementModal } from "./components/AdminManagementModal";
import { AuthService, AppUser } from "./services/authService";
import { cardImageStore } from "./services/cardImageStore";
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

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>("home");
  const [divinationMethod, setDivinationMethod] = useState<"cards" | "khongminh" | "yarrow" | "coins" | "maihoa" | "lucnham" | "kymon" | "thaiat" | null>(null);

  // Custom loaded card images (64 hexagrams & card back) & active deck
  const [activeDeckId, setActiveDeckId] = useState<string>("deck_golden");
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
    const handleAuthChange = (e: any) => {
      if (e.detail && e.detail.user !== undefined) {
        setCurrentUser(e.detail.user);
      }
    };
    const handleAdminDataChange = () => {
      const cur = AuthService.getCurrentUser();
      setCurrentUser(cur);
    };
    window.addEventListener("iching-auth-change", handleAuthChange);
    window.addEventListener("iching-admin-data-change", handleAdminDataChange);
    return () => {
      window.removeEventListener("iching-auth-change", handleAuthChange);
      window.removeEventListener("iching-admin-data-change", handleAdminDataChange);
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
      const targetId = deckIdToLoad || (await cardImageStore.getActiveDeckId());
      setActiveDeckId(targetId);
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
    loadCustomDeck();
    // Subscribe to store updates (e.g. from DeckManager or individual updates)
    const unsubscribe = cardImageStore.subscribe((_cardNum, updatedDeckId) => {
      loadCustomDeck(updatedDeckId);
    });
    // Lắng nghe sự kiện chuyển đổi nhanh phương thức thỉnh quẻ từ các thành phần con
    const handleSwitchMethod = (e: any) => {
      if (e.detail) {
        setDivinationMethod(e.detail);
      }
    };
    window.addEventListener("switch-divination-method", handleSwitchMethod);

    return () => {
      unsubscribe();
      window.removeEventListener("switch-divination-method", handleSwitchMethod);
    };
  }, []);

  const handleActiveDeckChanged = async (newDeckId: string) => {
    setActiveDeckId(newDeckId);
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
        onSelectTab={setCurrentTab}
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
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {/* TAB 0: TRANG CHỦ (CỬU NHỊ 玖貳 - PHONG THỦY MỆNH LÝ) */}
        <div className={currentTab === "home" ? "space-y-6" : "hidden"}>
          <HomeSection
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
            <div className="bg-gradient-to-r from-[#1C1813] via-[#241E17] to-[#1C1813] border border-[#3E3426] rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

              <div className="max-w-2xl mx-auto text-center space-y-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif text-[#D4AF37] bg-[#292217] border border-[#483A26]">
                  <Sparkles className="w-3.5 h-3.5" /> Thành Tâm Tất Ứng • Tâm Động Quẻ Sinh
                </span>

                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#F5EAD4] tracking-wide">
                  TÂM NIỆM BỐC BÀI KINH DỊCH
                </h2>

                <p className="text-xs sm:text-sm text-[#A89A84] leading-relaxed">
                  Trước khi thỉnh quẻ, cổ nhân luôn nghiêm cẩn thực hành <strong className="text-[#FFE28A]">Trai Giới Mộc Dục (齋戒沐浴)</strong>: Tắm gội rửa sạch đôi bàn tay (Mộc Dục) và thanh tịnh tâm thức, loại bỏ mọi tạp niệm lo toan (Trai Giới). Thân tâm trong sạch thì quẻ gieo mới linh ứng giao hòa cùng Thiên Địa.
                </p>

                {/* Trai Giới Mộc Dục Explanatory Accordion Button */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowPurificationGuide(!showPurificationGuide)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-serif text-[#E0C070] bg-[#1E1711] hover:bg-[#2A1F16] border border-[#48331E] hover:border-[#D4AF37] transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    <span>📜</span>
                    <span className="font-semibold underline decoration-dotted">Tìm hiểu: Vì sao cần Trai Giới Mộc Dục trước khi gieo quẻ?</span>
                    <span className="text-[11px] font-mono text-[#A89882]">{showPurificationGuide ? "▲ Ẩn" : "▼ Chi tiết"}</span>
                  </button>
                </div>

                {showPurificationGuide && (
                  <div className="mt-3 text-left bg-[#140F0B] border border-[#4D351E] rounded-xl p-4 sm:p-5 shadow-2xl text-xs font-serif text-[#DECAB2] space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center justify-between border-b border-[#302113] pb-2 text-[#FFE28A] font-bold text-sm">
                      <span className="flex items-center gap-2">
                        <span>⛩️</span> CẨM NANG NGHI LỄ: TRAI GIỚI MỘC DỤC (齋戒沐浴)
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowPurificationGuide(false)}
                        className="text-[#8C7A65] hover:text-[#FFE28A] text-xs font-sans px-2 py-0.5 rounded cursor-pointer"
                      >
                        Đóng ✕
                      </button>
                    </div>

                    <p className="italic text-[#E5D5C0] leading-relaxed">
                      "Thánh nhân dĩ thử trai giới, dĩ sùng đức quảng nghiệp... Tịch nhiên bất động, cảm nhi toại thông thiên hạ chi cố." (Khổng Tử • Kinh Dịch Hệ Từ Thượng).
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="bg-[#1C140D] p-3 rounded-lg border border-[#3E2917] space-y-1">
                        <strong className="text-[#D4AF37] font-bold block text-[13px]">
                          1. Mộc Dục (沐浴 - Tẩy Rửa Thân Thể Thanh Khiết):
                        </strong>
                        <p className="text-[11px] leading-relaxed text-[#BFB09A]">
                          • <strong>Mộc (沐):</strong> Gội đầu, rửa mặt, súc miệng thanh tịnh, giữ hơi thở thơm sạch.<br/>
                          • <strong>Dục (浴):</strong> Tắm gội toàn thân, đặc biệt là <strong className="text-[#FFE28A]">rửa sạch đôi bàn tay dưới dòng nước mát</strong> trước khi chạm vào cỏ thi, đồng tiền cổ hay thẻ bài Kinh Dịch. Bàn tay là kênh phát xuất trường điện từ sinh học, tay sạch thì trường năng lượng mới tinh khiết không bị tạp nhiễm.<br/>
                          • <strong>Y phục:</strong> Ăn mặc ngay ngắn, tề chỉnh, đầu tóc gọn gàng để tỏ lòng tôn kính với Đạo Trời Đất.
                        </p>
                      </div>

                      <div className="bg-[#1C140D] p-3 rounded-lg border border-[#3E2917] space-y-1">
                        <strong className="text-[#D4AF37] font-bold block text-[13px]">
                          2. Trai Giới (齋戒 - Tịnh Hóa Tâm Ý Hư Tĩnh):
                        </strong>
                        <p className="text-[11px] leading-relaxed text-[#BFB09A]">
                          • <strong>Trai (齋):</strong> Trai tịnh tâm can, kiêng rượu nồng, chất kích thích và các thú vui ồn ào trước giờ bốc.<br/>
                          • <strong>Giới (戒):</strong> Ngăn ngừa tà niệm, dứt bỏ tham sân si, dục vọng vị kỷ, lo âu, sân hận hoặc toan tính vụ lợi.<br/>
                          • Đưa tâm thức về trạng thái <em>Hư Tĩnh</em> (như mặt gương sáng không dính bụi), nhất tâm hướng trọn ý thức về câu hỏi cần thỉnh vấn.
                        </p>
                      </div>
                    </div>

                    {/* Tứ Bất Bốc */}
                    <div className="p-3 rounded-lg bg-[#20140A] border border-[#482F18] space-y-1.5 text-[11px]">
                      <span className="text-xs font-serif font-bold text-[#FFE28A] flex items-center gap-1.5">
                        <span>📜</span> KHẨU QUYẾT CỔ NHÂN: "TỨ BẤT BỐC" (4 ĐIỀU TUYỆT ĐỐI KHÔNG BỐC QUẺ)
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[#D2C3AB] pt-1">
                        <div className="bg-[#140D07] p-2 rounded border border-[#382312]">
                          <strong className="text-[#D4AF37] block mb-0.5">1. Bất thành bất bốc:</strong>
                          Lòng không chí thành, bói chơi đùa thì không ứng.
                        </div>
                        <div className="bg-[#140D07] p-2 rounded border border-[#382312]">
                          <strong className="text-[#D4AF37] block mb-0.5">2. Bất nghi bất bốc:</strong>
                          Lòng không có điều thực sự băn khoăn thì không bốc.
                        </div>
                        <div className="bg-[#140D07] p-2 rounded border border-[#382312]">
                          <strong className="text-[#D4AF37] block mb-0.5">3. Phi nghĩa bất bốc:</strong>
                          Hỏi việc thất đức, hại người, phi pháp thì không bốc.
                        </div>
                        <div className="bg-[#140D07] p-2 rounded border border-[#382312]">
                          <strong className="text-[#D4AF37] block mb-0.5">4. Độc tắc bất cáo:</strong>
                          Cùng một việc bốc đi bốc lại ép quẻ tốt thì quẻ sẽ loạn.
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#23170D] border border-[#482E18] text-[11px] leading-relaxed text-[#EAD8B5]">
                      💡 <strong>Nguyên lý "Chí Thành Thông Thần":</strong> Kinh Dịch không phải là trò bói toán may rủi tầm thường, mà là sự phản ánh giao cảm vi tế giữa trường năng lượng ý thức con người và quy luật Càn Khôn. Thân sạch (Mộc Dục) và Tâm sáng (Trai Giới) chính là chiếc chìa khóa để linh khí câu thông, quẻ định chuẩn xác nhất.
                    </div>
                  </div>
                )}
              </div>

              {/* Question & Category Input Box */}
              <div className="max-w-2xl mx-auto mt-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#D4AF37] mb-1.5">
                      Nội dung tâm niệm / Câu hỏi:
                    </label>
                    <input
                      type="text"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="VD: Định hướng công việc và tài vận trong năm nay..."
                      className="w-full bg-[#12100E] border border-[#3D3325] focus:border-[#C89B3C] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#F0E4D0] outline-none shadow-inner"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#D4AF37] mb-1.5">
                      Lĩnh vực thỉnh vấn:
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-[#12100E] border border-[#3D3325] focus:border-[#C89B3C] rounded-xl px-3 py-2.5 text-xs sm:text-sm text-[#F0E4D0] outline-none cursor-pointer"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat} className="bg-[#1C1814]">
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Quick suggestions */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-[#2F261C]">
                  <span className="text-[11px] text-[#7A6D5A] flex items-center gap-1">
                    <HelpCircle className="w-3 h-3" /> Gợi ý câu hỏi chuẩn:
                  </span>
                  {QUESTION_SUGGESTIONS.map((sug, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setQuestion(sug)}
                      className="text-[11px] text-[#B8AA94] hover:text-[#FFF] bg-[#221C16] hover:bg-[#30261D] border border-[#382F22] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            </div>

              {/* Divination Method Switcher */}
              <div className="bg-[#191511] border border-[#3D3121] rounded-2xl p-2.5 sm:p-3 shadow-xl">
                <div className="text-[11px] font-mono text-[#A89882] uppercase tracking-wider px-2 pt-1 pb-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-[#2C2116] mb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1.5 text-[#D4AF37] font-bold text-xs">
                      <Sparkles className="w-3.5 h-3.5" /> Phương Thức Thỉnh Quẻ:
                    </span>
                    <span className="text-[10px] font-serif px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-600/50">
                      Toàn Bộ 8 Phương Thức Khởi Quẻ
                    </span>
                  </div>

                  {/* Nút Trạng Thái Hiện Quẻ (Mở Luôn / Úp Bài) & Nút Xem Thuận Nghịch */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Nút Trạng Thái Hiện Quẻ: Mở Luôn (Mặc định) hay Úp Bài */}
                    <button
                      type="button"
                      onClick={handleToggleDefaultCardFaceOpen}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer shadow active:scale-95 border ${
                        defaultCardFaceOpen
                          ? "bg-[#2A1E12] text-[#FFE28A] border-[#D4AF37] ring-1 ring-[#D4AF37]/50"
                          : "bg-[#16120E] text-[#8C7D6A] border-[#382C1E] hover:text-[#C5B49D]"
                      }`}
                      title={
                        defaultCardFaceOpen
                          ? "Khi hiện quẻ: Đang ở trạng thái Mở Luôn (Mặt trước). Bấm để chuyển sang Úp Bài."
                          : "Khi hiện quẻ: Đang ở trạng thái Úp Bài (Mặt Bát Quái). Bấm để chuyển sang Mở Luôn."
                      }
                    >
                      <span className="text-xs">{defaultCardFaceOpen ? "📖" : "🎴"}</span>
                      <span><strong>{defaultCardFaceOpen ? "Mở Luôn" : "Úp Bài"}</strong></span>
                    </button>

                    {/* Nút Xem Thuận Nghịch / Chỉ Xem Thuận */}
                    <button
                      type="button"
                      onClick={handleToggleAllowReversedCards}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer shadow active:scale-95 border ${
                        allowReversedCards
                          ? "bg-[#2A1E12] text-[#FFE28A] border-[#D4AF37] ring-1 ring-[#D4AF37]/50"
                          : "bg-[#16120E] text-[#8C7D6A] border-[#382C1E] hover:text-[#C5B49D]"
                      }`}
                      title={allowReversedCards ? "Xem Thuận Nghịch" : "Chỉ Xem Thuận"}
                    >
                      <RotateCw className={`w-3.5 h-3.5 transition-transform duration-300 ${allowReversedCards ? "text-[#D4AF37] rotate-180" : "text-[#756552]"}`} />
                      <span><strong>{allowReversedCards ? "Xem Thuận Nghịch" : "Chỉ Xem Thuận"}</strong></span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-2 sm:gap-2.5">
                  {/* 1. Bốc Bài Kinh Dịch */}
                  <button
                    type="button"
                    onClick={() => {
                      const next = divinationMethod === "cards" ? null : "cards";
                      setDivinationMethod(next);
                      if (next) {
                        showToast("Đã chọn hình thức: Bốc Bài Kinh Dịch (Đầy đủ 12 trận pháp)");
                      }
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                      divinationMethod === "cards"
                        ? "bg-gradient-to-br from-[#2E2013] to-[#1C140C] border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.25)] ring-1 ring-[#D4AF37]/50"
                        : "bg-[#14100C] border-[#2C2014] hover:border-[#4B3722] opacity-80 hover:opacity-100"
                    }`}
                  >
                    <span className="text-2xl mt-0.5">🎴</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-sm font-serif font-bold text-[#F5EAD4]">
                          Bốc Bài Kinh Dịch
                        </span>
                        {divinationMethod === "cards" && (
                          <span className="w-2 h-2 rounded-full bg-[#D4AF37] shadow-[0_0_6px_#D4AF37]" />
                        )}
                      </div>
                      <p className="text-[11px] text-[#A89882] font-serif leading-tight mt-1">
                        Đầy đủ các trận pháp từ 1 đến 12 lá bài (Thất Tinh, Cửu Cung, Thập Tinh...)
                      </p>
                    </div>
                  </button>

                  {/* 2. Xăm Khổng Minh */}
                  <button
                    type="button"
                    onClick={() => {
                      const next = divinationMethod === "khongminh" ? null : "khongminh";
                      setDivinationMethod(next);
                      if (next) showToast("Đã chọn hình thức: Xăm Khổng Minh (Gia Cát Thần Toán)");
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                      divinationMethod === "khongminh"
                        ? "bg-gradient-to-br from-[#2E2013] to-[#1C140C] border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.25)] ring-1 ring-[#D4AF37]/50"
                        : "bg-[#14100C] border-[#2C2014] hover:border-[#4B3722] opacity-80 hover:opacity-100"
                    }`}
                  >
                    <span className="text-2xl mt-0.5">📜</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-sm font-serif font-bold text-[#F5EAD4]">
                          Xăm Khổng Minh
                        </span>
                        {divinationMethod === "khongminh" && (
                          <span className="w-2 h-2 rounded-full bg-[#D4AF37] shadow-[0_0_6px_#D4AF37]" />
                        )}
                      </div>
                      <p className="text-[11px] text-[#A89882] font-serif leading-tight mt-1">
                        Bốc 3 lá Tam Tài (Thiên - Địa - Nhân) định hào biến & 384 quẻ xăm linh ứng
                      </p>
                    </div>
                  </button>

                  {/* 3. Rút Cỏ Thi */}
                  <button
                    type="button"
                    onClick={() => {
                      const next = divinationMethod === "yarrow" ? null : "yarrow";
                      setDivinationMethod(next);
                      if (next) showToast("Đã chọn hình thức: Phép Rút Cỏ Thi 50 Cọng (Đại Diễn) • Cần trai giới mộc dục, tâm tập trung");
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                      divinationMethod === "yarrow"
                        ? "bg-gradient-to-br from-[#2E2013] to-[#1C140C] border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.25)] ring-1 ring-[#D4AF37]/50"
                        : "bg-[#14100C] border-[#2C2014] hover:border-[#4B3722] opacity-80 hover:opacity-100"
                    }`}
                  >
                    <span className="text-2xl mt-0.5">🌾</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-sm font-serif font-bold text-[#F5EAD4]">
                          Rút Cỏ Thi
                        </span>
                        {divinationMethod === "yarrow" && (
                          <span className="w-2 h-2 rounded-full bg-[#D4AF37] shadow-[0_0_6px_#D4AF37]" />
                        )}
                      </div>
                      <p className="text-[11px] text-[#A89882] font-serif leading-tight mt-1">
                        Đại Diễn 50 cọng cỏ thi nguyên bản, 18 biến đổi định hào
                      </p>
                    </div>
                  </button>

                  {/* 4. Gieo 3 Đồng Xu */}
                  <button
                    type="button"
                    onClick={() => {
                      const next = divinationMethod === "coins" ? null : "coins";
                      setDivinationMethod(next);
                      if (next) showToast("Đã chọn hình thức: Gieo 3 Đồng Tiền Cổ (Lục Hào) • Thời gian gieo quẻ 6 lần");
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                      divinationMethod === "coins"
                        ? "bg-gradient-to-br from-[#2E2013] to-[#1C140C] border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.25)] ring-1 ring-[#D4AF37]/50"
                        : "bg-[#14100C] border-[#2C2014] hover:border-[#4B3722] opacity-80 hover:opacity-100"
                    }`}
                  >
                    <span className="text-2xl mt-0.5">🪙</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-sm font-serif font-bold text-[#F5EAD4]">
                          Gieo 3 Đồng Xu
                        </span>
                        {divinationMethod === "coins" && (
                          <span className="w-2 h-2 rounded-full bg-[#D4AF37] shadow-[0_0_6px_#D4AF37]" />
                        )}
                      </div>
                      <p className="text-[11px] text-[#A89882] font-serif leading-tight mt-1">
                        Ba đồng Càn Long gieo 6 lần định hào biến & Lục Hào chiêm đoán
                      </p>
                    </div>
                  </button>

                  {/* 5. Mai Hoa Dịch Số */}
                  <button
                    type="button"
                    onClick={() => {
                      const next = divinationMethod === "maihoa" ? null : "maihoa";
                      setDivinationMethod(next);
                      if (next) showToast("Đã chọn hình thức: Mai Hoa Dịch Số (Thiệu Khang Tiết)");
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                      divinationMethod === "maihoa"
                        ? "bg-gradient-to-br from-[#2E2013] to-[#1C140C] border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.25)] ring-1 ring-[#D4AF37]/50"
                        : "bg-[#14100C] border-[#2C2014] hover:border-[#4B3722] opacity-80 hover:opacity-100"
                    }`}
                  >
                    <span className="text-2xl mt-0.5">🌸</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-sm font-serif font-bold text-[#F5EAD4]">
                          Mai Hoa Dịch Số
                        </span>
                        {divinationMethod === "maihoa" && (
                          <span className="w-2 h-2 rounded-full bg-[#D4AF37] shadow-[0_0_6px_#D4AF37]" />
                        )}
                      </div>
                      <p className="text-[11px] text-[#A89882] font-serif leading-tight mt-1">
                        Thiệu Khang Tiết • Khởi quẻ thời khắc, con số, trắc tự & Thể Dụng ngũ hành
                      </p>
                    </div>
                  </button>

                  {/* 6. Lục Nhâm Đại Độn */}
                  <button
                    type="button"
                    onClick={() => {
                      const next = divinationMethod === "lucnham" ? null : "lucnham";
                      setDivinationMethod(next);
                      if (next) showToast("Đã chọn hình thức: Lục Nhâm Đại Độn (Tam Thức Cổ Truyền)");
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                      divinationMethod === "lucnham"
                        ? "bg-gradient-to-br from-[#2E2013] to-[#1C140C] border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.25)] ring-1 ring-[#D4AF37]/50"
                        : "bg-[#14100C] border-[#2C2014] hover:border-[#D4AF37] hover:bg-[#1E160F] opacity-90 hover:opacity-100"
                    }`}
                  >
                    <span className="text-2xl mt-0.5">🧭</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-sm font-serif font-bold text-[#F5EAD4]">
                          Lục Nhâm Đại Độn
                        </span>
                        {divinationMethod === "lucnham" ? (
                          <span className="w-2 h-2 rounded-full bg-[#D4AF37] shadow-[0_0_6px_#D4AF37]" />
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-200 border border-amber-600/70 font-medium">
                            Tam Thức
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#A89882] font-serif leading-tight mt-1">
                        Thiên Bàn, Tứ Khóa, Tam Truyền, 12 Thần Tướng & Hoạt Thời chiêm đoán
                      </p>
                    </div>
                  </button>

                  {/* 7. Kỳ Môn Độn Giáp */}
                  <button
                    type="button"
                    onClick={() => {
                      const next = divinationMethod === "kymon" ? null : "kymon";
                      setDivinationMethod(next);
                      if (next) showToast("Đã chọn hình thức: Kỳ Môn Độn Giáp (Bát Trận Đồ • Tam Thức Cổ Truyền)");
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                      divinationMethod === "kymon"
                        ? "bg-gradient-to-br from-[#2E2013] to-[#1C140C] border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.25)] ring-1 ring-[#D4AF37]/50"
                        : "bg-[#14100C] border-[#2C2014] hover:border-[#D4AF37] hover:bg-[#1E160F] opacity-90 hover:opacity-100"
                    }`}
                  >
                    <span className="text-2xl mt-0.5">⛩️</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-sm font-serif font-bold text-[#F5EAD4]">
                          Kỳ Môn Độn Giáp
                        </span>
                        {divinationMethod === "kymon" ? (
                          <span className="w-2 h-2 rounded-full bg-[#D4AF37] shadow-[0_0_6px_#D4AF37]" />
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-200 border border-amber-600/70 font-medium">
                            Tam Thức
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#A89882] font-serif leading-tight mt-1">
                        Bát Trận Đồ • Cửu Cung Lạc Thư, Cửu Tinh, Bát Môn, Bát Thần & Kỳ Môn Hóa Dịch
                      </p>
                    </div>
                  </button>

                  {/* 8. Thái Ất Thần Số */}
                  <button
                    type="button"
                    onClick={() => {
                      const next = divinationMethod === "thaiat" ? null : "thaiat";
                      setDivinationMethod(next);
                      if (next) showToast("Đã chọn hình thức: Thái Ất Thần Số (Thiên Thời Vận Thế • Tam Thức Chi Thượng)");
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                      divinationMethod === "thaiat"
                        ? "bg-gradient-to-br from-[#2E2013] to-[#1C140C] border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.25)] ring-1 ring-[#D4AF37]/50"
                        : "bg-[#14100C] border-[#2C2014] hover:border-[#D4AF37] hover:bg-[#1E160F] opacity-90 hover:opacity-100"
                    }`}
                  >
                    <span className="text-2xl mt-0.5">👑</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-sm font-serif font-bold text-[#F5EAD4]">
                          Thái Ất Thần Số
                        </span>
                        {divinationMethod === "thaiat" ? (
                          <span className="w-2 h-2 rounded-full bg-[#D4AF37] shadow-[0_0_6px_#D4AF37]" />
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-200 border border-amber-600/70 font-medium">
                            Tam Thức
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#A89882] font-serif leading-tight mt-1">
                        Thiên Thời & Vận Thế • Thái Ất Cửu Cung, Chủ Toán - Khách Toán & Thái Ất Hóa Dịch
                      </p>
                    </div>
                  </button>
                </div>
              </div>

            {/* Divination Component Rendering */}
            <div
              id="divination-card-draw-area"
              className="relative rounded-3xl bg-[#140F0A]/50 backdrop-blur-md border border-[#D4AF37]/35 p-2.5 sm:p-5 shadow-2xl transition-all duration-700 animate-divination-breath"
            >
              {divinationMethod === null && (
                <div className="py-12 sm:py-16 text-center space-y-4 max-w-xl mx-auto">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-[#20170F] border border-[#543E23] flex items-center justify-center text-3xl sm:text-4xl shadow-inner select-none">
                    ☯️
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-lg sm:text-xl font-serif font-bold text-[#F5EAD4] tracking-wide">
                      TÂM TĨNH KHỞI QUẺ • VẠN SỰ TÙY DUYÊN
                    </h3>
                    <p className="text-xs sm:text-sm text-[#A89882] font-serif leading-relaxed px-4">
                      Tâm thanh tịnh, ý thành kính! Bạn hãy bấm chọn một trong các hình thức chiêm đoán phía trên để bắt đầu gieo quẻ:
                    </p>
                  </div>
                  <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setDivinationMethod("cards")}
                      className="px-3.5 py-2 rounded-xl bg-[#241B12] hover:bg-[#342618] border border-[#543D22] text-[#FFE28A] font-serif font-medium transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                    >
                      <span>🎴</span> Bốc Bài Kinh Dịch (Đủ 12 Trận)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDivinationMethod("khongminh")}
                      className="px-3.5 py-2 rounded-xl bg-[#241B12] hover:bg-[#342618] border border-[#543D22] text-[#FFE28A] font-serif font-medium transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                    >
                      <span>📜</span> Xăm Khổng Minh
                    </button>
                    <button
                      type="button"
                      onClick={() => setDivinationMethod("yarrow")}
                      className="px-3.5 py-2 rounded-xl bg-[#241B12] hover:bg-[#342618] border border-[#543D22] text-[#FFE28A] font-serif font-medium transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                    >
                      <span>🌾</span> Rút Cỏ Thi
                    </button>
                    <button
                      type="button"
                      onClick={() => setDivinationMethod("coins")}
                      className="px-3.5 py-2 rounded-xl bg-[#241B12] hover:bg-[#342618] border border-[#543D22] text-[#FFE28A] font-serif font-medium transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                    >
                      <span>🪙</span> Gieo Đồng Xu
                    </button>
                    <button
                      type="button"
                      onClick={() => setDivinationMethod("maihoa")}
                      className="px-3.5 py-2 rounded-xl bg-[#241B12] hover:bg-[#342618] border border-[#543D22] text-[#FFE28A] font-serif font-medium transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                    >
                      <span>🌸</span> Mai Hoa Dịch Số
                    </button>
                    <button
                      type="button"
                      onClick={() => setDivinationMethod("lucnham")}
                      className="px-3.5 py-2 rounded-xl bg-[#241B12] hover:bg-[#342618] border border-[#543D22] text-[#FFE28A] font-serif font-medium transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                    >
                      <span>🧭</span> Lục Nhâm Đại Độn
                    </button>
                    <button
                      type="button"
                      onClick={() => setDivinationMethod("kymon")}
                      className="px-3.5 py-2 rounded-xl bg-[#241B12] hover:bg-[#342618] border border-[#543D22] text-[#FFE28A] font-serif font-medium transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                    >
                      <span>⛩️</span> Kỳ Môn Độn Giáp
                    </button>
                    <button
                      type="button"
                      onClick={() => setDivinationMethod("thaiat")}
                      className="px-3.5 py-2 rounded-xl bg-[#241B12] hover:bg-[#342618] border border-[#543D22] text-[#FFE28A] font-serif font-medium transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                    >
                      <span>👑</span> Thái Ất Thần Số
                    </button>
                  </div>
                </div>
              )}

              {/* 1. Bốc Bài Kinh Dịch */}
              {divinationMethod === "cards" && (
                <CardDraw
                  isKhongMinhMethod={false}
                  onComplete={handleDivinationComplete}
                  cardImages={cardImages}
                  cardVideos={cardVideos}
                  cardBackImage={cardBackImage}
                  allowReversedCards={allowReversedCards}
                  onToggleAllowReversedCards={handleToggleAllowReversedCards}
                  defaultCardFaceOpen={defaultCardFaceOpen}
                  onToggleDefaultCardFaceOpen={handleToggleDefaultCardFaceOpen}
                  onImageUpdated={handleImageUpdated}
                  onVideoUpdated={handleVideoUpdated}
                  onShowToast={showToast}
                  onOpenDeckManager={() => {
                    setManualSubTab("decks");
                    setCurrentTab("manual");
                  }}
                />
              )}

              {/* 2. Xăm Khổng Minh */}
              {divinationMethod === "khongminh" && (
                <CardDraw
                  key="khongminh-card-draw"
                  isKhongMinhMethod={true}
                  onComplete={handleDivinationComplete}
                  cardImages={cardImages}
                  cardVideos={cardVideos}
                  cardBackImage={cardBackImage}
                  allowReversedCards={allowReversedCards}
                  onToggleAllowReversedCards={handleToggleAllowReversedCards}
                  defaultCardFaceOpen={defaultCardFaceOpen}
                  onToggleDefaultCardFaceOpen={handleToggleDefaultCardFaceOpen}
                  onImageUpdated={handleImageUpdated}
                  onVideoUpdated={handleVideoUpdated}
                  onShowToast={showToast}
                  onOpenDeckManager={() => {
                    setManualSubTab("decks");
                    setCurrentTab("manual");
                  }}
                />
              )}

              {/* 3. Phép Rút Cỏ Thi */}
              {divinationMethod === "yarrow" && (
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

              {/* 4. Gieo 3 Đồng Xu Lục Hào */}
              {divinationMethod === "coins" && (
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

              {/* 5. Mai Hoa Dịch Số */}
              {divinationMethod === "maihoa" && (
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

              {/* 7. Kỳ Môn Độn Giáp */}
              {divinationMethod === "kymon" && (
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

              {/* 8. Thái Ất Thần Số */}
              {divinationMethod === "thaiat" && (
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

              {/* 6. Lục Nhâm Đại Độn */}
              {divinationMethod === "lucnham" && (
                <div className="space-y-4">
                  {/* Khung Khởi Lập Quẻ Lục Nhâm tại Chỗ Bốc Quẻ */}
                  <div className="bg-gradient-to-r from-[#22180F] via-[#1B140D] to-[#22180F] border border-[#5A4126] rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#3E2D1A] pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#8C6218] flex items-center justify-center text-[#120F0B] font-bold shadow text-lg">
                          🧭
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-serif font-bold text-sm sm:text-base text-[#F5EAD4]">
                              LẬP QUẺ LỤC NHÂM ĐẠI ĐỘN
                            </h3>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2C1F12] text-[#E2B755] border border-[#523E26]">
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
                      <span className="text-[11px] text-[#D4AF37] bg-[#241A10] px-2 py-0.5 rounded border border-[#48341E] whitespace-nowrap shrink-0">
                        {category}
                      </span>
                    </div>

                    {/* KHU VỰC HOẠT THỜI: LỰA CHỌN TRỰC TIẾP HOẶC LẮC XÍ NGẦU */}
                    <div className="bg-[#18120B] border border-[#42311E] rounded-xl p-3.5 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="text-xs font-serif font-bold text-[#E2B755] flex items-center gap-1.5">
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
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C59B27] hover:from-[#E5C158] hover:to-[#D4AF37] text-[#120F0B] font-bold text-xs shadow-md active:scale-95 cursor-pointer transition-all disabled:opacity-50"
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
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3D2C1B] to-[#1A120B] border border-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.25)] flex flex-col items-center justify-center shrink-0">
                              <span className="text-lg leading-none font-serif font-bold text-[#FFE28A]">
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
                                    ? "bg-[#D4AF37] text-[#120F0B] font-bold border-[#F5EAD4] shadow-md scale-105 ring-1 ring-[#F5EAD4]"
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
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#2A1D11] via-[#3D2916] to-[#2A1D11] hover:from-[#352516] hover:to-[#352516] border border-[#6B4B27] hover:border-[#D4AF37] text-[#FFE28A] text-xs font-serif font-bold transition-all cursor-pointer shadow flex items-center justify-center gap-2 group"
                      >
                        <Compass className="w-4 h-4 text-[#D4AF37] group-hover:rotate-45 transition-transform" />
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
            {divinationMethod === "lucnham" && (
              <div id="lucnham-chart-area-bocque" className="w-full mt-6 space-y-4 scroll-mt-20 animate-in fade-in duration-500">
                <div className="bg-[#1C160F] border border-[#523E26] rounded-2xl p-3.5 sm:p-4 shadow-xl flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-[#241A10] via-[#1B140D] to-[#241A10]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#8C6218] flex items-center justify-center text-[#120F0B] font-bold shadow shrink-0 text-lg">
                      🧭
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-sm sm:text-base text-[#F5EAD4] flex items-center gap-2 flex-wrap">
                        <span>BẢNG LỤC NHÂM ĐẠI ĐỘN (CHỖ BỐC QUẺ)</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2C1F12] text-[#E2B755] border border-[#523E26] font-normal">
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
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl bg-[#291E13] hover:bg-[#382819] text-[#E2B755] border border-[#543D24] cursor-pointer transition-all ml-auto font-medium"
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
          <div className="space-y-5">
            {/* Thanh chuyển đổi phân đoạn Thuyết Minh vs Bộ Hình 64 Quẻ */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#17130F] border border-[#3E2F20] p-2 rounded-2xl shadow-xl">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setManualSubTab("book");
                    if (currentTab === "decks") setCurrentTab("manual");
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-serif font-bold transition-all cursor-pointer ${
                    (manualSubTab === "book" && currentTab !== "decks")
                      ? "bg-gradient-to-r from-[#D4AF37] to-[#B38728] text-[#120F0C] shadow-md scale-[1.01]"
                      : "text-[#A89882] hover:text-[#FFF] hover:bg-[#241C15]"
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Sách Thuyết Minh (64 Quẻ & Bát Quái)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setManualSubTab("decks")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-serif font-bold transition-all cursor-pointer ${
                    (manualSubTab === "decks" || currentTab === "decks")
                      ? "bg-gradient-to-r from-[#D4AF37] to-[#B38728] text-[#120F0C] shadow-md scale-[1.01]"
                      : "text-[#A89882] hover:text-[#FFF] hover:bg-[#241C15]"
                  }`}
                >
                  <Palette className="w-4 h-4" />
                  <span>Bộ Hình 64 Quẻ</span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-[#120F0C]/40 text-amber-200 border border-amber-900/50">
                    64
                  </span>
                </button>
              </div>

              <div className="text-[11px] text-[#8C7D6A] pr-3 hidden md:block">
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
                onOpenDecks={() => setManualSubTab("decks")}
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
            ) : (
              <DeckManager
                activeDeckId={activeDeckId}
                onActiveDeckChanged={handleActiveDeckChanged}
                onClose={() => setManualSubTab("book")}
              />
            )}
          </div>
        )}

        {/* TAB: LỤC THẬP HOA GIÁP (60 CAN CHI) */}
        <div className={currentTab === "jiazi" ? "block" : "hidden"}>
          <JiaziSection
            cardImages={cardImages}
            onImageUpdated={handleImageUpdated}
            onSelectHexagram={(hexNumber) => {
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
        </div>

        {/* TAB: LỊCH DỤNG SỰ (CAN CHI, TRỰC NHẬT TINH & 12 GIỜ TÂM ẤN PHÚ) */}
        <div className={currentTab === "calendar" ? "block" : "hidden"}>
          <LichDungSuSection
            onSelectHourPillar={(can, chi) => {
              showToast(`Đã chọn Giờ ${can} ${chi} cho Dụng Sự`);
            }}
            onOpenDailyHexagram={() => setIsDailyHexagramOpen(true)}
            cardImages={cardImages}
          />
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
              />
            ) : (
              <div className="bg-[#171512] border border-[#3A3225] rounded-2xl p-12 text-center text-[#8C7D6A] max-w-lg mx-auto">
                <div className="w-14 h-14 mx-auto rounded-full bg-[#201B15] border border-[#382E22] flex items-center justify-center text-[#D4AF37] mb-3">
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
      <footer className="relative z-10 border-t border-[#261E16] bg-[#100E0C]/90 py-8 text-center text-xs text-[#7A6D5A]">
        <div className="max-w-4xl mx-auto px-4 space-y-3.5">
          <p className="font-serif italic text-[#A6977F]">
            "Thiên hành kiện, quân tử dĩ tự cường bất tức. Địa thế khôn, quân tử dĩ hậu đức tải vật."
          </p>

          {/* Link nhóm Zalo Cửu Nhị */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-[#182C1B] to-emerald-950/70 border border-emerald-600/50 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-serif text-emerald-300 font-semibold">
              Nhóm Zalo Cửu Nhị Giao Lưu Dịch Lý:
            </span>
            <a
              href="https://zalo.me/g/vwzsqvnh3gdbzst2psyh"
              target="_blank"
              rel="noopener noreferrer"
              className="font-serif font-bold text-xs text-[#FFE8A3] hover:text-white underline cursor-pointer inline-flex items-center gap-1"
            >
              <span>Tham gia nhóm Zalo ngay</span>
              <span>➔</span>
            </a>
          </div>

          <p className="text-[11px] text-[#5E5343]">
            Ứng dụng Bốc Bài Kinh Dịch & Lục Hào Thần Dịch • Kết hợp trí tuệ cổ nhân và AI thế hệ mới
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
          showToast(
            user.isMember
              ? `Chúc mừng ${user.name}! Bạn đã là Hội Viên VIP (5 lần hương/ngày & mở toàn văn Thuyết Minh).`
              : `Chào mừng ${user.name} đã đăng nhập!`
          );
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
