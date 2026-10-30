import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Shuffle,
  Layers,
  ArrowRight,
  CheckCircle2,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Clock,
  Scale,
  Hourglass,
  Compass,
  Camera,
  Check,
  Loader2,
  Sliders,
  HelpCircle,
  ZoomIn,
  Palette,
  Dices,
  Calendar,
  RotateCw,
  FlipHorizontal,
  Music,
  Scroll,
  Lock,
  Flame,
  Crown,
  Heart,
  QrCode,
} from "lucide-react";
import { captureElementToPng } from "../utils/captureHelper";
import { Hexagram, DoubleCardMode, ThreeCardMode, SpreadType, CustomCardPosition } from "../types";
import { AppUser } from "../services/authService";
import { HEXAGRAMS } from "../data/hexagrams";
import {
  SEVEN_STARS_POSITIONS,
  NINE_PALACES_POSITIONS,
  TEN_STARS_POSITIONS,
  TEN_STARS_EXPANDED_POSITIONS,
  TWELVE_BRANCHES_DATA,
  TWELVE_HOUSES_INFO,
  getHouseForBranch,
  CUSTOM_PURPOSE_SUGGESTIONS,
  CUSTOM_SPREAD_TEMPLATES,
  getDefaultCustomPurposes,
  CustomSpreadTemplate,
} from "../data/spreads";
import { CardVisual } from "./CardVisual";
import { XuanBaguaStage, JadeCommandPanel, CardTwoSidedModal } from "./XuanBaguaStage";
import { FlippableSpiritualCard } from "./FlippableSpiritualCard";
import { CardInfoSummary } from "./CardInfoSummary";
import { SpreadDiagram } from "./SpreadDiagram";
import { ExportImageModal } from "./ExportImageModal";
import { Fan360Deck } from "./Fan360Deck";
import { ShuffleDeckAnimation } from "./ShuffleDeckAnimation";
import { TwelveSidedDice } from "./TwelveSidedDice";
import { zenAudio } from "../utils/zenAudio";
import { PRESET_DECK_NAMES, DEFAULT_DECK_ID, INITIAL_PRESET_DECKS, cardImageStore, DeckInfo } from "../services/cardImageStore";

interface CardDrawProps {
  cardImages?: Record<number, string>;
  cardVideos?: Record<number, string>;
  cardBackImage?: string | null;
  isKhongMinhMethod?: boolean;
  isNguCheMethod?: boolean;
  suggestedDrawMode?: DrawMode;
  suggestedCustomCount?: number;
  suggestedCustomPurposes?: string[];
  suggestedDoubleMode?: DoubleCardMode;
  suggestedChoiceALabel?: string;
  suggestedChoiceBLabel?: string;
  suggestedThreeMode?: ThreeCardMode;
  suggestedChoiceCLabel?: string;
  onComplete: (
    primary: Hexagram,
    changingLines: number[],
    transformed?: Hexagram,
    summary?: string,
    drawnCards?: Hexagram[],
    meta?: {
      doubleMode?: DoubleCardMode;
      choiceALabel?: string;
      choiceBLabel?: string;
      threeMode?: ThreeCardMode;
      choiceCLabel?: string;
      threeCards?: boolean;
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
  ) => void;
  onOpenDeckManager?: () => void;
  onManageDeck?: () => void;
  onImageUpdated?: (num: number, url: string) => void;
  onVideoUpdated?: (num: number, videoUrl: string) => void;
  allowReversedCards?: boolean;
  onToggleAllowReversedCards?: () => void;
  defaultCardFaceOpen?: boolean;
  onToggleDefaultCardFaceOpen?: () => void;
  onShowToast?: (msg: string) => void;
  currentUser?: AppUser | null;
  onRequireAuth?: (mode?: "login" | "register" | "upgrade", message?: string) => void;
  activeDeckId?: string;
  onActiveDeckChanged?: (newDeckId: string) => void;
}

type DrawMode = "single" | "double" | "three" | "seven" | "nine" | "ten" | "ten_expanded" | "twelve" | "custom";
type DeckViewMode = "fan360" | "fan" | "grid";

export const CardDraw: React.FC<CardDrawProps> = ({
  cardImages = {},
  cardVideos = {},
  cardBackImage = null,
  isKhongMinhMethod = false,
  isNguCheMethod = false,
  suggestedDrawMode,
  suggestedCustomCount,
  suggestedCustomPurposes,
  suggestedDoubleMode,
  suggestedChoiceALabel,
  suggestedChoiceBLabel,
  suggestedThreeMode,
  suggestedChoiceCLabel,
  currentUser = null,
  onRequireAuth,
  onComplete,
  onOpenDeckManager,
  onManageDeck,
  onImageUpdated,
  onVideoUpdated,
  allowReversedCards: propAllowReversedCards,
  onToggleAllowReversedCards: propOnToggleAllowReversedCards,
  defaultCardFaceOpen: propDefaultCardFaceOpen,
  onToggleDefaultCardFaceOpen: propOnToggleDefaultCardFaceOpen,
  onShowToast,
  activeDeckId,
  onActiveDeckChanged,
}) => {
  const isRegisteredUser = true;
  const isVip = true;
  const [availableDecks, setAvailableDecks] = useState<DeckInfo[]>(INITIAL_PRESET_DECKS);
  useEffect(() => {
    cardImageStore.getDeckList().then(setAvailableDecks).catch(() => {});
  }, [activeDeckId]);
  const activeDeckName = activeDeckId
    ? availableDecks.find((d) => d.id === activeDeckId)?.name || PRESET_DECK_NAMES[activeDeckId] || "Bộ Bài Đang Dùng"
    : "Bộ Cửu Nhị Việt Hóa (64 Quẻ)";




  const handleOpenManager = onOpenDeckManager || onManageDeck || (() => {});
  const [drawMode, setDrawMode] = useState<DrawMode>(() =>
    isKhongMinhMethod || isNguCheMethod ? "three" : suggestedDrawMode || "single"
  );

  const [showMultiDeckPanel, setShowMultiDeckPanel] = useState<boolean>(false);
  const [inspectingTwoSidedCard, setInspectingTwoSidedCard] = useState<{
    card: Hexagram;
    positionLabel?: string;
    positionTitle?: string;
    isReversed?: boolean;
  } | null>(null);

  const handleSelectFiveElementsMode = () => {
    setCustomCount(5);
    setCustomCountInput("5");
    setCustomPurposes([
      "1. HÀNH KIM · Cương Quyết & Nguyên Tắc",
      "2. HÀNH MỘC · Sinh Trưởng & Khởi Phát",
      "3. HÀNH THỦY · Trí Tuệ & Linh Hoạt",
      "4. HÀNH HỎA · Nhiệt Huyết & Danh Vọng",
      "5. HÀNH THỔ · Trung Tâm & Nền Tảng",
    ]);
    setDrawMode("custom");
    setSelectedDeckIndices([]);
    setRevealedCards([]);
  };

  const handleSelectDrawMode = (mode: DrawMode) => {
    setDrawMode(mode);
    setSelectedDeckIndices([]);
    setRevealedCards([]);
  };

  useEffect(() => {
    if (isKhongMinhMethod) {
      setDrawMode("three");
      setThreeSpreadMode("tam_tai");
      setSelectedDeckIndices([]);
      setRevealedCards([]);
    } else if (isNguCheMethod) {
      setDrawMode("three");
      setThreeSpreadMode("ngu_che");
      setSelectedDeckIndices([]);
      setRevealedCards([]);
      if (onActiveDeckChanged) {
      // Giữ nguyên bộ bài người dùng đang chọn (mặc định Bộ Cửu Nhị Việt Hóa)
      }
    } else if (suggestedDrawMode) {
      setDrawMode(suggestedDrawMode);
      setSelectedDeckIndices([]);
      setRevealedCards([]);
    }
  }, [isKhongMinhMethod, isNguCheMethod, suggestedDrawMode]);

  useEffect(() => {
    if (suggestedDoubleMode) {
      setDoubleSpreadMode(suggestedDoubleMode);
    }
    if (suggestedChoiceALabel) {
      setChoiceALabel(suggestedChoiceALabel);
    }
    if (suggestedChoiceBLabel) {
      setChoiceBLabel(suggestedChoiceBLabel);
    }
  }, [suggestedDoubleMode, suggestedChoiceALabel, suggestedChoiceBLabel]);

  useEffect(() => {
    if (isKhongMinhMethod) {
      setThreeSpreadMode("tam_tai");
    } else if (isNguCheMethod) {
      setThreeSpreadMode("ngu_che");
    } else if (suggestedThreeMode) {
      setThreeSpreadMode(suggestedThreeMode);
    }
    if (suggestedChoiceCLabel) {
      setChoiceCLabel(suggestedChoiceCLabel);
    }
  }, [isKhongMinhMethod, isNguCheMethod, suggestedThreeMode, suggestedChoiceCLabel]);

  useEffect(() => {
    if (suggestedCustomPurposes && suggestedCustomPurposes.length > 0) {
      setCustomPurposes([...suggestedCustomPurposes]);
      const cnt = suggestedCustomCount || suggestedCustomPurposes.length;
      setCustomCount(cnt);
      setCustomCountInput(String(cnt));
      setSelectedDeckIndices([]);
      setRevealedCards([]);
    }
  }, [suggestedCustomPurposes, suggestedCustomCount]);
  const [doubleSpreadMode, setDoubleSpreadMode] = useState<DoubleCardMode>("present_future");
  const [choiceALabel, setChoiceALabel] = useState<string>("Lựa chọn A");
  const [choiceBLabel, setChoiceBLabel] = useState<string>("Lựa chọn B");
  const [threeSpreadMode, setThreeSpreadMode] = useState<ThreeCardMode>(() =>
    isKhongMinhMethod ? "tam_tai" : isNguCheMethod ? "ngu_che" : "past_present_future"
  );
  const [choiceCLabel, setChoiceCLabel] = useState<string>("Lựa chọn C");
  const [menhBranchNumber, setMenhBranchNumber] = useState<number>(3); // 1..12 (default 3 = Dần)
  const [isReverseHouses, setIsReverseHouses] = useState<boolean>(false);

  // Custom Spread State (Tùy ý bốc bao nhiêu lá như 6, 12 lá... và thiết lập mục đích từng lá)
  const [customCount, setCustomCount] = useState<number>(6);
  const [customCountInput, setCustomCountInput] = useState<string>("6");
  const [customPurposes, setCustomPurposes] = useState<string[]>(() =>
    getDefaultCustomPurposes(6)
  );

  const [deckViewMode, setDeckViewMode] = useState<DeckViewMode>("fan360");
  const [isShuffling, setIsShuffling] = useState(false);
  const [selectedDeckIndices, setSelectedDeckIndices] = useState<number[]>([]);
  const [revealedCards, setRevealedCards] = useState<Hexagram[]>([]);
  const [isCard2Reversed, setIsCard2Reversed] = useState<boolean>(() => Math.random() < 0.5);
  const [isCard2AReversed, setIsCard2AReversed] = useState<boolean>(() => Math.random() < 0.5);
  const [isCard2BReversed, setIsCard2BReversed] = useState<boolean>(() => Math.random() < 0.5);
  const fanScrollRef = useRef<HTMLDivElement>(null);
  const cardsGridRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedSuccess, setCapturedSuccess] = useState(false);
  const [exportedImageUrl, setExportedImageUrl] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showCardDrawPurification, setShowCardDrawPurification] = useState(false);
  const getStoredCardFaceOpen = (): boolean => {
    if (propDefaultCardFaceOpen !== undefined) return propDefaultCardFaceOpen;
    try {
      const saved = localStorage.getItem("iching_default_card_face_open");
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  };
  const [allFlippedFront, setAllFlippedFront] = useState<boolean>(getStoredCardFaceOpen);
  const [flipSequenceKey, setFlipSequenceKey] = useState<number>(0);
  const [isAllCardsRotated, setIsAllCardsRotated] = useState<boolean>(false);
  const [cardRotationMap, setCardRotationMap] = useState<Record<number, boolean>>({});
  const [gridCardsFlippedFront, setGridCardsFlippedFront] = useState<boolean>(false);
  const [gridCardsRotated, setGridCardsRotated] = useState<boolean>(false);

  // Đồng bộ trạng thái lật úp/mở khi prop thay đổi từ ngoài
  useEffect(() => {
    if (propDefaultCardFaceOpen !== undefined) {
      setAllFlippedFront(propDefaultCardFaceOpen);
      setFlipSequenceKey((k) => k + 1);
    } else {
      try {
        const saved = localStorage.getItem("iching_default_card_face_open");
        if (saved !== null) {
          setAllFlippedFront(JSON.parse(saved));
          setFlipSequenceKey((k) => k + 1);
        }
      } catch {}
    }
  }, [propDefaultCardFaceOpen]);

  const handleToggleRotateCards = () => {
    const next = !isAllCardsRotated;
    setIsAllCardsRotated(next);
    const updated: Record<number, boolean> = {};
    revealedCards.forEach((_, idx) => {
      updated[idx] = next;
    });
    setCardRotationMap(updated);
    zenAudio.playCardFlipSound();
  };

  const handleToggleSingleCardRotation = (index: number) => {
    setCardRotationMap((prev) => {
      const cur = prev[index] ?? isAllCardsRotated;
      return {
        ...prev,
        [index]: !cur,
      };
    });
    zenAudio.playCardFlipSound();
  };

  const isCardRotated = (index: number) => {
    return cardRotationMap[index] ?? revealedCards[index]?.isReversed ?? isAllCardsRotated;
  };

  const handleToggleFlipCards = () => {
    const nextState = !allFlippedFront;
    setAllFlippedFront(nextState);
    setFlipSequenceKey((k) => k + 1);
    try {
      localStorage.setItem("iching_default_card_face_open", JSON.stringify(nextState));
    } catch {}
    if (propOnToggleDefaultCardFaceOpen) {
      propOnToggleDefaultCardFaceOpen();
    }
    zenAudio.playCardFlipSound();
  };

  // Bật/tắt xoay bài qua mặt sau (khóa xoay mặt sau hay mặt trước khi click vào lá bài)
  const [allowFlipOnClick, setAllowFlipOnClick] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("iching_allow_flip_on_click");
      return saved !== null ? saved === "true" : false;
    } catch {
      return false;
    }
  });

  const handleToggleAllowFlipOnClick = () => {
    const next = !allowFlipOnClick;
    setAllowFlipOnClick(next);
    try {
      localStorage.setItem("iching_allow_flip_on_click", String(next));
    } catch {}
    zenAudio.playCardFlipSound();
  };

  // Đóng / Mở đọc ngược lá bài (Mặc định luôn ở trạng thái Chỉ Xem Thuận)
  const [internalAllowReversedCards, setInternalAllowReversedCards] = useState<boolean>(() => {
    try {
      localStorage.removeItem("iching_allow_reversed_cards");
      const saved = localStorage.getItem("iching_allow_reversed_cards_v2");
      return saved === "true";
    } catch {
      return false;
    }
  });

  const effectiveAllowReversedCards =
    typeof propAllowReversedCards === "boolean" ? propAllowReversedCards : internalAllowReversedCards;

  const handleToggleAllowReversedCards = () => {
    if (propOnToggleAllowReversedCards) {
      propOnToggleAllowReversedCards();
      return;
    }
    const next = !effectiveAllowReversedCards;
    setInternalAllowReversedCards(next);
    try {
      localStorage.setItem("iching_allow_reversed_cards_v2", String(next));
    } catch {}
    zenAudio.playCardFlipSound();
  };
  const [isZenAudioPlaying, setIsZenAudioPlaying] = useState<boolean>(false);
  const [ritualNotice, setRitualNotice] = useState<string | null>(null);
  const ritualTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 3-step ritual for random draw (Lần 1: Kính Thiên, Lần 2: Kính Địa, Lần 3: Kính Nhân)
  const [quickDrawStep, setQuickDrawStep] = useState<number>(0);
  const [quickDrawRitualMsg, setQuickDrawRitualMsg] = useState<{
    step: number;
    title: string;
    hanzi: string;
    meaning: string;
    instruction: string;
  } | null>(null);
  const quickDrawResetTimerRef = useRef<NodeJS.Timeout | null>(null);

  const resetQuickDrawRitual = () => {
    setQuickDrawStep(0);
    setQuickDrawRitualMsg(null);
    if (quickDrawResetTimerRef.current) {
      clearTimeout(quickDrawResetTimerRef.current);
      quickDrawResetTimerRef.current = null;
    }
  };

  const triggerRitualNotice = (msg: string) => {
    setRitualNotice(msg);
    if (ritualTimeoutRef.current) clearTimeout(ritualTimeoutRef.current);
    ritualTimeoutRef.current = setTimeout(() => {
      setRitualNotice(null);
    }, 4200);
  };

  useEffect(() => {
    return () => {
      if (ritualTimeoutRef.current) clearTimeout(ritualTimeoutRef.current);
      if (quickDrawResetTimerRef.current) clearTimeout(quickDrawResetTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const handleZenAudioState = (e: any) => {
      if (e.detail && typeof e.detail.isPlaying === "boolean") {
        setIsZenAudioPlaying(e.detail.isPlaying);
      }
    };
    window.addEventListener("zen-audio-state", handleZenAudioState);
    return () => {
      window.removeEventListener("zen-audio-state", handleZenAudioState);
    };
  }, []);

  const handleCaptureDrawnCards = async () => {
    if (!cardsGridRef.current || isCapturing) return;
    const previousFlipped = allFlippedFront;
    try {
      setIsCapturing(true);

      // Programmatically set all cards to face-up (mặt ngửa) if not already
      if (!previousFlipped) {
        setAllFlippedFront(true);
        setFlipSequenceKey((k) => k + 1);
      }

      // Mark container with data-capturing="true" for instant CSS face-up override
      cardsGridRef.current.setAttribute("data-capturing", "true");

      // Brief tick to ensure UI state is settled and rotated
      await new Promise((resolve) => setTimeout(resolve, 150));

      const targetMinWidth = revealedCards.length >= 2 ? 1080 : 720;
      const dataUrl = await captureElementToPng(cardsGridRef.current, {
        backgroundColor: "#15120E",
        pixelRatio: 2,
        minWidth: targetMinWidth,
      });

      const timestamp = new Date().toISOString().slice(0, 10);
      setExportedImageUrl(dataUrl);
      setShowExportModal(true);
      setCapturedSuccess(true);
      setTimeout(() => setCapturedSuccess(false), 3000);
    } catch (err) {
      console.error("Lỗi khi chụp hình các lá bài đã bốc:", err);
    } finally {
      if (cardsGridRef.current) {
        cardsGridRef.current.removeAttribute("data-capturing");
      }
      if (!previousFlipped) {
        setAllFlippedFront(false);
        setFlipSequenceKey((k) => k + 1);
      }
      setIsCapturing(false);
    }
  };

  const handleCustomCountChange = (val: string) => {
    setCustomCountInput(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 1 && num <= 64) {
      setCustomCount(num);
      setSelectedDeckIndices([]);
      setRevealedCards([]);
      setCustomPurposes((prev) => {
        const nextPurposes: string[] = [];
        const defaults = getDefaultCustomPurposes(num);
        for (let i = 0; i < num; i++) {
          nextPurposes.push(prev[i] !== undefined && prev[i].trim() ? prev[i] : defaults[i]);
        }
        return nextPurposes;
      });
    }
  };

  const applyCustomCount = (num: number) => {
    const valid = Math.min(64, Math.max(1, num));
    setCustomCount(valid);
    setCustomCountInput(String(valid));
    setSelectedDeckIndices([]);
    setRevealedCards([]);
    setCustomPurposes(getDefaultCustomPurposes(valid));
  };

  const applyTemplate = (tpl: CustomSpreadTemplate) => {
    setCustomCount(tpl.count);
    setCustomCountInput(String(tpl.count));
    setSelectedDeckIndices([]);
    setRevealedCards([]);
    setCustomPurposes([...tpl.purposes]);
  };

  const handleAutoSuggestAll = () => {
    setCustomPurposes(getDefaultCustomPurposes(customCount));
  };

  const handleClearAllPurposes = () => {
    setCustomPurposes(Array.from({ length: customCount }, (_, i) => `Lá ${i + 1}: `));
  };

  const handlePurposeChange = (idx: number, val: string) => {
    setCustomPurposes((prev) => {
      const next = [...prev];
      while (next.length <= idx) {
        next.push(`Lá ${next.length + 1}: `);
      }
      next[idx] = val;
      return next;
    });
  };

  const targetCount =
    drawMode === "single"
      ? 1
      : drawMode === "double"
      ? 2
      : drawMode === "three"
      ? 3
      : drawMode === "seven"
      ? 7
      : drawMode === "nine"
      ? 9
      : drawMode === "ten"
      ? 10
      : drawMode === "ten_expanded"
      ? 11
      : drawMode === "twelve"
      ? 12
      : customCount;

  // Helper to generate a single 64-card deck with deckNumber and instanceId
  const generateSingleDeck = (deckNum: number): Hexagram[] => {
    const list = HEXAGRAMS.map((h) => ({
      ...h,
      deckNumber: deckNum,
      instanceId: `d${deckNum}_h${h.number}_${Math.random().toString(36).slice(2, 7)}`,
    }));
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  };

  // Helper to generate combined deck of count * 64 cards
  const generateCombinedDeck = (count: number): Hexagram[] => {
    const list: Hexagram[] = [];
    for (let d = 1; d <= count; d++) {
      for (const h of HEXAGRAMS) {
        list.push({
          ...h,
          deckNumber: d,
          instanceId: `d${d}_h${h.number}_${Math.random().toString(36).slice(2, 7)}`,
        });
      }
    }
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  };

  const generateSeparateDecks = (count: number): Record<number, Hexagram[]> => {
    const res: Record<number, Hexagram[]> = {};
    for (let d = 1; d <= count; d++) {
      res[d] = generateSingleDeck(d);
    }
    return res;
  };

  // Multi-Deck Configuration (Sử dụng từ 1 đến 12 bộ bài cùng lúc)
  const [deckCount, setDeckCount] = useState<number>(1);
  const [multiDeckMode, setMultiDeckMode] = useState<"separate" | "combined">("combined");
  const [activeDeckIndex, setActiveDeckIndex] = useState<number>(1); // 1..deckCount (for separate mode)
  const [autoSwitchDeck, setAutoSwitchDeck] = useState<boolean>(true); // Auto-advance to next deck after draw
  const [activeSubDeckSlice, setActiveSubDeckSlice] = useState<number>(1); // 1..deckCount (for combined view slices)
  const [gridSubDeckFilter, setGridSubDeckFilter] = useState<number | "all">("all");

  // Decks State
  const [combinedDeck, setCombinedDeck] = useState<Hexagram[]>(() => generateCombinedDeck(1));
  const [separateDecks, setSeparateDecks] = useState<Record<number, Hexagram[]>>(() => generateSeparateDecks(1));

  // Selected card indices per deck for separate mode: { 1: [0, 5], 2: [12] }
  const [selectedIndicesByDeck, setSelectedIndicesByDeck] = useState<Record<number, number[]>>({});

  const updateDeckCount = (newCount: number) => {
    if (newCount > 2 && !isVip) {
      if (!isRegisteredUser) {
        if (onShowToast) {
          onShowToast("Tính năng sử dụng nhiều hơn 2 bộ bài (3 - 12 bộ, 192 - 768 lá) là đặc quyền dành cho Hội Viên VIP. Vui lòng đăng nhập!");
        }
        if (onRequireAuth) {
          onRequireAuth("login", "Đăng ký hoặc đăng nhập tài khoản VIP để mở khóa từ 3 đến 12 bộ bài cùng lúc (192 - 768 lá)!");
        }
      } else {
        if (onShowToast) {
          onShowToast("Tính năng sử dụng nhiều hơn 2 bộ bài (3 - 12 bộ, 192 - 768 lá) là đặc quyền dành riêng cho Hội Viên VIP. Vui lòng nâng cấp gói VIP!");
        }
        if (onRequireAuth) {
          onRequireAuth("upgrade", "Nâng cấp Hội Viên VIP để sử dụng từ 3 đến 12 bộ bài cùng lúc (192 - 768 lá)!");
        }
      }
      return;
    }
    const maxAllowed = isVip ? 12 : 2;
    const valid = Math.max(1, Math.min(maxAllowed, newCount));
    setDeckCount(valid);
    setSelectedDeckIndices([]);
    setSelectedIndicesByDeck({});
    setRevealedCards([]);
    setActiveDeckIndex(1);
    setActiveSubDeckSlice(1);
    setGridSubDeckFilter("all");
    setCombinedDeck(generateCombinedDeck(valid));
    setSeparateDecks(generateSeparateDecks(valid));
  };

  // Tự động giới hạn tối đa 2 bộ bài cho tài khoản chưa phải VIP
  useEffect(() => {
    if (!isVip && deckCount > 2) {
      updateDeckCount(2);
    }
  }, [isVip, deckCount]);

  const updateMultiDeckMode = (mode: "separate" | "combined") => {
    setMultiDeckMode(mode);
    setSelectedDeckIndices([]);
    setSelectedIndicesByDeck({});
    setRevealedCards([]);
    setActiveDeckIndex(1);
    setActiveSubDeckSlice(1);
    setGridSubDeckFilter("all");
  };

  // Auspicious Resonance: detect duplicate hexagrams when using multiple decks
  const duplicateHexes = React.useMemo(() => {
    const counts: Record<number, number> = {};
    revealedCards.forEach((c) => {
      counts[c.number] = (counts[c.number] || 0) + 1;
    });
    return Object.keys(counts)
      .map(Number)
      .filter((num) => counts[num] > 1);
  }, [revealedCards]);

  const uploadedCount = Object.keys(cardImages).length;

  // Suspense Hold State for long press thrill on cards
  const [holdingCardIdx, setHoldingCardIdx] = useState<number | null>(null);
  const [holdProgress, setHoldProgress] = useState<number>(0);
  const holdStartRef = useRef<number>(0);
  const holdAnimRef = useRef<number | null>(null);
  const triggeredRef = useRef<boolean>(false);

  const cancelCardHold = () => {
    if (holdAnimRef.current) {
      cancelAnimationFrame(holdAnimRef.current);
      holdAnimRef.current = null;
    }
    setHoldingCardIdx(null);
    setHoldProgress(0);
  };

  const startCardHold = (idx: number) => {
    const isAlreadySelected =
      multiDeckMode === "separate" && deckCount >= 2
        ? (selectedIndicesByDeck[activeDeckIndex] || []).includes(idx)
        : selectedDeckIndices.includes(idx);

    if (isShuffling || isAlreadySelected || revealedCards.length >= targetCount) {
      return;
    }
    setHoldingCardIdx(idx);
    setHoldProgress(0);
    triggeredRef.current = false;
    holdStartRef.current = Date.now();

    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(15);
    }
    zenAudio.playCardHoldTremble(0.8);

    const checkProgress = () => {
      const elapsed = Date.now() - holdStartRef.current;
      const duration = 650;
      const prog = Math.min(100, (elapsed / duration) * 100);
      setHoldProgress(prog);

      if (elapsed > 200 && Math.floor(elapsed / 160) % 2 === 0) {
        zenAudio.playCardHoldTremble(1.2);
      }

      if (prog >= 100 && !triggeredRef.current) {
        triggeredRef.current = true;
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate([20, 30, 40]);
        }
        zenAudio.playCardDrawChime();
        handleSelectCard(idx);
        cancelCardHold();
        return;
      }

      if (prog < 100) {
        holdAnimRef.current = requestAnimationFrame(checkProgress);
      }
    };

    holdAnimRef.current = requestAnimationFrame(checkProgress);
  };

  const endCardHold = (idx: number) => {
    if (holdingCardIdx !== idx) return;
    if (!triggeredRef.current) {
      triggeredRef.current = true;
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(25);
      }
      zenAudio.playCardDrawChime();
      handleSelectCard(idx);
    }
    cancelCardHold();
  };

  const handleShuffle = () => {
    resetQuickDrawRitual();
    setIsShuffling(true);
    setSelectedDeckIndices([]);
    setSelectedIndicesByDeck({});
    setRevealedCards([]);
    setIsCard2Reversed(Math.random() < 0.5);
    setIsCard2AReversed(Math.random() < 0.5);
    setIsCard2BReversed(Math.random() < 0.5);

    // Realistic multi-card shuffle soundscape
    zenAudio.playCardShuffleSound();

    setTimeout(() => {
      if (multiDeckMode === "separate" && deckCount >= 2) {
        setSeparateDecks(generateSeparateDecks(deckCount));
      } else {
        setCombinedDeck(generateCombinedDeck(deckCount));
      }
      setIsShuffling(false);
    }, 5500);
  };

  const handleSelectCard = (index: number) => {
    if (quickDrawStep > 0) {
      resetQuickDrawRitual();
    }
    if (isShuffling || revealedCards.length >= targetCount) {
      return;
    }

    // Sacred audio feedback when drawing a card
    zenAudio.playCardDrawSound();

    let currentCard2Reversed = isCard2Reversed;
    if (drawMode === "ten" && revealedCards.length === 1) {
      currentCard2Reversed = Math.random() < 0.5;
      setIsCard2Reversed(currentCard2Reversed);
    }
    let currentCard2AReversed = isCard2AReversed;
    let currentCard2BReversed = isCard2BReversed;
    if (drawMode === "ten_expanded") {
      if (revealedCards.length === 1) {
        currentCard2AReversed = Math.random() < 0.5;
        setIsCard2AReversed(currentCard2AReversed);
      } else if (revealedCards.length === 2) {
        currentCard2BReversed = Math.random() < 0.5;
        setIsCard2BReversed(currentCard2BReversed);
      }
    }

    if (multiDeckMode === "separate" && deckCount >= 2) {
      const currentDeck = separateDecks[activeDeckIndex] || [];
      const deckSelected = selectedIndicesByDeck[activeDeckIndex] || [];
      if (deckSelected.includes(index)) return;

      const card = currentDeck[index];
      if (!card) return;

      setSelectedIndicesByDeck((prev) => ({
        ...prev,
        [activeDeckIndex]: [...(prev[activeDeckIndex] || []), index],
      }));

      const cardSlotIdx = revealedCards.length;
      // Lá hỗ trợ và trở ngại ở trận 10 lá (Lá 2) và 11 lá (Lá 2A & 2B) không bị ảnh hưởng bởi đóng/mở đọc ngược lá bài
      let isReversedThisCard: boolean;
      if (drawMode === "ten" && cardSlotIdx === 1) {
        isReversedThisCard = currentCard2Reversed;
      } else if (drawMode === "ten_expanded" && cardSlotIdx === 1) {
        isReversedThisCard = currentCard2AReversed;
      } else if (drawMode === "ten_expanded" && cardSlotIdx === 2) {
        isReversedThisCard = currentCard2BReversed;
      } else {
        isReversedThisCard = effectiveAllowReversedCards ? Math.random() < 0.5 : false;
      }

      setCardRotationMap((prev) => ({
        ...prev,
        [cardSlotIdx]: isReversedThisCard,
      }));

      const cardWithReversed = { ...card, isReversed: isReversedThisCard };
      const nextRevealed = [...revealedCards, cardWithReversed];
      setRevealedCards(nextRevealed);

      if (autoSwitchDeck && nextRevealed.length < targetCount) {
        setActiveDeckIndex((activeDeckIndex % deckCount) + 1);
      }

      if (nextRevealed.length === targetCount) {
        setAllFlippedFront(getStoredCardFaceOpen());
        setIsAllCardsRotated(false);
        setFlipSequenceKey((k) => k + 1);
        setTimeout(() => {
          zenAudio.playSpiritualRevealChime();
        }, 350);
        processResults(nextRevealed, currentCard2Reversed, currentCard2AReversed, currentCard2BReversed);
      }
    } else {
      // Combined mode or single deck
      if (selectedDeckIndices.includes(index)) return;

      const card = combinedDeck[index];
      if (!card) return;

      const cardSlotIdx = revealedCards.length;
      // Lá hỗ trợ và trở ngại ở trận 10 lá (Lá 2) và 11 lá (Lá 2A & 2B) không bị ảnh hưởng bởi đóng/mở đọc ngược lá bài
      let isReversedThisCard: boolean;
      if (drawMode === "ten" && cardSlotIdx === 1) {
        isReversedThisCard = currentCard2Reversed;
      } else if (drawMode === "ten_expanded" && cardSlotIdx === 1) {
        isReversedThisCard = currentCard2AReversed;
      } else if (drawMode === "ten_expanded" && cardSlotIdx === 2) {
        isReversedThisCard = currentCard2BReversed;
      } else {
        isReversedThisCard = effectiveAllowReversedCards ? Math.random() < 0.5 : false;
      }

      setCardRotationMap((prev) => ({
        ...prev,
        [cardSlotIdx]: isReversedThisCard,
      }));

      const nextSelected = [...selectedDeckIndices, index];
      setSelectedDeckIndices(nextSelected);

      const cardWithReversed = { ...card, isReversed: isReversedThisCard };
      const nextRevealed = [...revealedCards, cardWithReversed];
      setRevealedCards(nextRevealed);

      if (nextSelected.length === targetCount) {
        setAllFlippedFront(getStoredCardFaceOpen());
        setIsAllCardsRotated(false);
        setFlipSequenceKey((k) => k + 1);
        setTimeout(() => {
          zenAudio.playSpiritualRevealChime();
        }, 350);
        processResults(nextRevealed, currentCard2Reversed, currentCard2AReversed, currentCard2BReversed);
      }
    }
  };

  const executeActualQuickDraw = () => {
    if (isShuffling) return;
    setIsShuffling(true);

    // Lá hỗ trợ và trở ngại ở trận 10 lá và 11 lá KHÔNG bị ảnh hưởng bởi đóng/mở đọc ngược lá bài:
    // Luôn độc lập có 50% xác suất ra Hỗ Trợ (Xuôi) hoặc Trở Ngại (Ngược)
    const randomCard2Reversed = Math.random() < 0.5;
    const randomCard2AReversed = Math.random() < 0.5;
    const randomCard2BReversed = Math.random() < 0.5;
    setIsCard2Reversed(randomCard2Reversed);
    setIsCard2AReversed(randomCard2AReversed);
    setIsCard2BReversed(randomCard2BReversed);

    setTimeout(() => {
      if (multiDeckMode === "separate" && deckCount >= 2) {
        const newSelectedByDeck: Record<number, number[]> = {};
        for (let d = 1; d <= deckCount; d++) {
          newSelectedByDeck[d] = [];
        }
        const chosenCards: Hexagram[] = [];

        for (let k = 0; k < targetCount; k++) {
          const targetDeck = (k % deckCount) + 1;
          const deckCards = separateDecks[targetDeck] || [];
          const currentPicked = newSelectedByDeck[targetDeck] || [];

          const available: number[] = [];
          for (let i = 0; i < deckCards.length; i++) {
            if (!currentPicked.includes(i)) available.push(i);
          }
          if (available.length > 0) {
            const randPick = available[Math.floor(Math.random() * available.length)];
            newSelectedByDeck[targetDeck].push(randPick);
            chosenCards.push(deckCards[randPick]);
          }
        }

        setSelectedIndicesByDeck(newSelectedByDeck);
        const randomRotationsSeparate: Record<number, boolean> = {};
        const chosenCardsWithReversal = chosenCards.map((c, idx) => {
          let isRev: boolean;
          if (drawMode === "ten" && idx === 1) {
            isRev = randomCard2Reversed;
          } else if (drawMode === "ten_expanded" && idx === 1) {
            isRev = randomCard2AReversed;
          } else if (drawMode === "ten_expanded" && idx === 2) {
            isRev = randomCard2BReversed;
          } else {
            isRev = effectiveAllowReversedCards ? Math.random() < 0.5 : false;
          }
          randomRotationsSeparate[idx] = isRev;
          return { ...c, isReversed: isRev };
        });
        setCardRotationMap(randomRotationsSeparate);
        setRevealedCards(chosenCardsWithReversal);
        setIsShuffling(false);
        setAllFlippedFront(getStoredCardFaceOpen());
        setIsAllCardsRotated(false);
        setFlipSequenceKey((k) => k + 1);
        zenAudio.playCardDrawSound();
        setTimeout(() => {
          zenAudio.playSpiritualRevealChime();
        }, 380);
        processResults(chosenCardsWithReversal, randomCard2Reversed, randomCard2AReversed, randomCard2BReversed);
      } else {
        const chosenIndices: number[] = [];
        const totalCards = combinedDeck.length;
        while (chosenIndices.length < targetCount && chosenIndices.length < totalCards) {
          const r = Math.floor(Math.random() * totalCards);
          if (!chosenIndices.includes(r)) {
            chosenIndices.push(r);
          }
        }

        setSelectedDeckIndices(chosenIndices);
        const randomRotationsCombined: Record<number, boolean> = {};
        const chosenCards = chosenIndices.map((i, idx) => {
          let isRev: boolean;
          if (drawMode === "ten" && idx === 1) {
            isRev = randomCard2Reversed;
          } else if (drawMode === "ten_expanded" && idx === 1) {
            isRev = randomCard2AReversed;
          } else if (drawMode === "ten_expanded" && idx === 2) {
            isRev = randomCard2BReversed;
          } else {
            isRev = effectiveAllowReversedCards ? Math.random() < 0.5 : false;
          }
          randomRotationsCombined[idx] = isRev;
          return { ...combinedDeck[i], isReversed: isRev };
        });
        setCardRotationMap(randomRotationsCombined);
        setRevealedCards(chosenCards);
        setIsShuffling(false);
        setAllFlippedFront(getStoredCardFaceOpen());
        setIsAllCardsRotated(false);
        setFlipSequenceKey((k) => k + 1);
        zenAudio.playCardDrawSound();
        setTimeout(() => {
          zenAudio.playSpiritualRevealChime();
        }, 380);

        processResults(chosenCards, randomCard2Reversed, randomCard2AReversed, randomCard2BReversed);
      }
      setQuickDrawStep(0);
      setTimeout(() => {
        setQuickDrawRitualMsg(null);
      }, 3500);
    }, 600);
  };

  const handleQuickDraw = () => {
    if (isShuffling) return;

    if (quickDrawResetTimerRef.current) {
      clearTimeout(quickDrawResetTimerRef.current);
    }
    quickDrawResetTimerRef.current = setTimeout(() => {
      setQuickDrawStep(0);
      setQuickDrawRitualMsg(null);
    }, 60000);

    if (quickDrawStep === 0) {
      // Lần 1: Kính Thiên (Bái lạy Trời cao)
      setQuickDrawStep(1);
      zenAudio.playCoinClink(1.25);
      setQuickDrawRitualMsg({
        step: 1,
        title: "Lần 1: Kính Thiên",
        hanzi: "敬天",
        meaning: "Kính bái Trời cao • Cảm ứng Thiên thời & Vận hội vũ trụ khách quan",
        instruction: "Bấm tiếp lần 2 để Kính Địa",
      });
    } else if (quickDrawStep === 1) {
      // Lần 2: Kính Địa (Bái lạy Đất dày)
      setQuickDrawStep(2);
      zenAudio.playCoinClink(1.0);
      setQuickDrawRitualMsg({
        step: 2,
        title: "Lần 2: Kính Địa",
        hanzi: "敬地",
        meaning: "Kính bái Đất dày • Cảm ứng Địa lợi & Môi trường nền móng nuôi dưỡng",
        instruction: "Bấm tiếp lần 3 để Kính Nhân & Bốc Quẻ",
      });
    } else {
      // Lần 3: Kính Nhân (Bái Nhân Đạo -> Bốc Quẻ Thần!)
      setQuickDrawStep(3);
      zenAudio.playSpiritualRevealChime();
      setQuickDrawRitualMsg({
        step: 3,
        title: "Lần 3: Kính Nhân",
        hanzi: "敬人",
        meaning: "Kính bái Con người • Nhân hòa tương hợp, tâm chí thành khai mở quẻ thần linh ứng!",
        instruction: `Đang thỉnh ${targetCount} lá quẻ...`,
      });
      executeActualQuickDraw();
    }
  };

  const scrollFan = (offset: number) => {
    if (fanScrollRef.current) {
      fanScrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  const scrollToRatio = (ratio: number) => {
    if (fanScrollRef.current) {
      const maxScroll = fanScrollRef.current.scrollWidth - fanScrollRef.current.clientWidth;
      fanScrollRef.current.scrollTo({ left: maxScroll * ratio, behavior: "smooth" });
    }
  };

  const processResults = (
    cards: Hexagram[],
    card2ReversedOverride?: boolean,
    card2AReversedOverride?: boolean,
    card2BReversedOverride?: boolean
  ) => {
    const activeCard2Reversed = card2ReversedOverride !== undefined ? card2ReversedOverride : isCard2Reversed;
    const activeCard2AReversed = card2AReversedOverride !== undefined ? card2AReversedOverride : isCard2AReversed;
    const activeCard2BReversed = card2BReversedOverride !== undefined ? card2BReversedOverride : isCard2BReversed;
    const multiDeckMeta = {
      deckCount,
      multiDeckMode,
    };

    setTimeout(() => {
      if (drawMode === "single") {
        onComplete(
          cards[0],
          [],
          undefined,
          `Bốc 1 lá: Quẻ ${cards[0].name} (${cards[0].vietnameseName})${deckCount > 1 ? ` • Bộ #${cards[0].deckNumber || 1}` : ""}`,
          cards,
          multiDeckMeta
        );
      } else if (drawMode === "double") {
        const primary = cards[0];
        const transformed = cards[1];
        if (doubleSpreadMode === "choice_ab") {
          const labelA = choiceALabel.trim() || "Lựa chọn A";
          const labelB = choiceBLabel.trim() || "Lựa chọn B";
          onComplete(
            primary,
            [],
            transformed,
            `Bốc 2 lá [A vs B]: ${labelA} (${primary.name}) vs ${labelB} (${transformed.name})`,
            cards,
            {
              doubleMode: "choice_ab",
              choiceALabel: labelA,
              choiceBLabel: labelB,
              ...multiDeckMeta,
            }
          );
        } else {
          onComplete(
            primary,
            [],
            transformed,
            `Bốc 2 lá [Hiện Tại & Tương Lai]: Quẻ 1 Hiện Tại (${primary.name}) & Quẻ 2 Tương Lai (${transformed.name})`,
            cards,
            {
              doubleMode: "present_future",
              ...multiDeckMeta,
            }
          );
        }
      } else if (drawMode === "three") {
        const cardA = cards[0];
        const cardB = cards[1];
        const cardC = cards[2];
        if (threeSpreadMode === "choice_abc") {
          const labelA = choiceALabel.trim() || "Lựa chọn A";
          const labelB = choiceBLabel.trim() || "Lựa chọn B";
          const labelC = choiceCLabel.trim() || "Lựa chọn C";
          onComplete(
            cardA,
            [],
            cardC,
            `Bốc 3 lá [3 Lựa Chọn A-B-C]: ${labelA} (${cardA.name}) • ${labelB} (${cardB.name}) • ${labelC} (${cardC.name})`,
            cards,
            {
              threeCards: true,
              threeMode: "choice_abc",
              choiceALabel: labelA,
              choiceBLabel: labelB,
              choiceCLabel: labelC,
              spreadType: "three",
              ...multiDeckMeta,
            }
          );
        } else if (isNguCheMethod || threeSpreadMode === "ngu_che") {
          onComplete(
            cardC, // Lấy lá cuối cùng (lá thứ 3 - Nhân) làm Quẻ Chủ Ngự Chế
            [],
            cardA,
            `Ngự Chế Tân Tập Đoán Dịch Tinh Túy (Tam Tài): Thiên (${cardA.name}) • Địa (${cardB.name}) • Nhân — Quẻ Chủ (${cardC.name})`,
            cards,
            {
              threeCards: true,
              threeMode: "ngu_che",
              spreadType: "nguche",
              ...multiDeckMeta,
            }
          );
        } else if (isKhongMinhMethod || threeSpreadMode === "tam_tai") {
          onComplete(
            cardA,
            [],
            cardC,
            `Thỉnh Xăm Khổng Minh (Gia Cát Thần Toán): Thiên Đạo (${cardA.name}) • Địa Đạo (${cardB.name}) • Nhân Đạo (${cardC.name})`,
            cards,
            {
              threeCards: true,
              threeMode: "tam_tai",
              spreadType: isKhongMinhMethod ? "khongminh" : "three",
              ...multiDeckMeta,
            }
          );
        } else {
          onComplete(
            cardA,
            [],
            cardC,
            `Bốc 3 lá [Dòng Thời Gian]: Quá khứ (${cardA.name}) • Hiện tại (${cardB.name}) • Tương lai (${cardC.name})`,
            cards,
            {
              threeCards: true,
              threeMode: "past_present_future",
              spreadType: "three",
              ...multiDeckMeta,
            }
          );
        }
      } else if (drawMode === "seven") {
        onComplete(
          cards[1] || cards[0],
          [],
          cards[4] || cards[3],
          `Trận Pháp Thất Tinh (7 lá): Quá Khứ #${cards[0].number} • Hiện Tại #${cards[1].number} • Gợi Ý #${cards[3].number} • Kết Quả #${cards[4].number}`,
          cards,
          {
            spreadType: "seven_stars",
            ...multiDeckMeta,
          }
        );
      } else if (drawMode === "nine") {
        onComplete(
          cards[0], // Quẻ Chủ: Trung Cung (Cung 5 - Ở giữa)
          [],
          cards[4] || cards[1], // Quẻ Hướng/Biến: Ly Chính Nam (Lá 5) hoặc Càn Tây Bắc (Lá 2)
          `Trận Pháp Cửu Cung Phong Thủy (9 lá): Trung Cung #${cards[0].number} • Càn Tây Bắc #${cards[1].number} • Đoài Chính Tây #${cards[2].number}`,
          cards,
          {
            spreadType: "nine_palaces",
            ...multiDeckMeta,
          }
        );
      } else if (drawMode === "ten") {
        onComplete(
          cards[0],
          [],
          cards[8] || cards[9],
          `Trận Pháp Thập Tinh (10 lá): Hiện Tại #${cards[0].number} • ${activeCard2Reversed ? "Lá 2 Ngược (Trở Ngại)" : "Lá 2 Xuôi (Hỗ Trợ)"} #${cards[1].number} • Khuyên Bảo #${cards[9].number}`,
          cards,
          {
            spreadType: "ten_stars",
            isCard2Reversed: activeCard2Reversed,
            ...multiDeckMeta,
          }
        );
      } else if (drawMode === "ten_expanded") {
        const get2AStatus = activeCard2AReversed ? "Nghịch (Trở Ngại)" : "Thuận (Hỗ Trợ)";
        const get2BStatus = activeCard2BReversed ? "Nghịch (Trở Ngại)" : "Thuận (Hỗ Trợ)";
        let comboDesc = "";
        if (!activeCard2AReversed && !activeCard2BReversed) {
          comboDesc = "Cùng Thuận (Đại Cát Hỗ Trợ)";
        } else if (activeCard2AReversed && activeCard2BReversed) {
          comboDesc = "Cùng Nghịch (Trùng Điệp Trở Ngại)";
        } else if (!activeCard2AReversed && activeCard2BReversed) {
          comboDesc = "Thuận - Nghịch (Hỗ Trợ Đan Xen Trở Ngại)";
        } else {
          comboDesc = "Nghịch - Thuận (Trước Trở Ngại Sau Hỗ Trợ)";
        }

        onComplete(
          cards[0],
          [],
          cards[9] || cards[10],
          `Trận Pháp Thập Tinh Mở Rộng (11 lá: 2A & 2B): Hiện Tại #${cards[0].number} • Quẻ 2: [${comboDesc}] (2A: ${get2AStatus} #${cards[1]?.number} • 2B: ${get2BStatus} #${cards[2]?.number}) • Khuyên Bảo #${cards[10]?.number}`,
          cards,
          {
            spreadType: "ten_stars_expanded",
            isCard2Reversed: activeCard2AReversed,
            isCard2AReversed: activeCard2AReversed,
            isCard2BReversed: activeCard2BReversed,
            isTenStarsExpanded: true,
            ...multiDeckMeta,
          }
        );
      } else if (drawMode === "twelve") {
        // Trận Pháp 12 Địa Chi & 12 Cung Tử Vi
        // 1=Tý, 2=Sửu, 3=Dần... 12=Hợi. Mệnh Cung nằm ở chi menhBranchNumber
        const menhIndex = Math.max(0, Math.min(11, menhBranchNumber - 1));
        const menhCard = cards[menhIndex] || cards[0];
        const diIndex = (menhIndex + 6) % 12; // Cung đối diện (Thiên Di)
        const diCard = cards[diIndex] || cards[1];
        onComplete(
          menhCard,
          [],
          diCard,
          `Trận Pháp 12 Địa Chi & Tử Vi (12 lá): Mệnh Cung tại Chi #${menhBranchNumber} (${menhCard.name}) • Thiên Di tại (${diCard.name})`,
          cards,
          {
            spreadType: "twelve_houses",
            menhBranchNumber: menhBranchNumber,
            diceRollResult: menhBranchNumber,
            ...multiDeckMeta,
          }
        );
      } else if (drawMode === "custom") {
        const customPositionsList: CustomCardPosition[] = cards.map((c, idx) => ({
          index: idx,
          name: `Lá ${idx + 1}`,
          purpose: customPurposes[idx]?.trim() || `Mục đích xem lá ${idx + 1}`,
        }));
        const summaryHighlights = customPositionsList
          .slice(0, 3)
          .map((p, i) => `${p.name} (#${cards[i].number} ${cards[i].name}): ${p.purpose}`)
          .join(" • ");
        onComplete(
          cards[0],
          [],
          cards[cards.length - 1],
          `Trận Pháp Tùy Chỉnh (${cards.length} lá): ${summaryHighlights}${cards.length > 3 ? "..." : ""}`,
          cards,
          {
            spreadType: "custom",
            customPositions: customPositionsList,
            ...multiDeckMeta,
          }
        );
      }
    }, 1400);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-5">
      {/* CỬU NHỊ COMMAND DOCK: NGỌC GIẢN KÍNH MỜ GIẤY TUYÊN THÀNH ĐỒNG BỘ TRANG CHỦ */}
      <JadeCommandPanel
        badgeIcon="☯"
        title="Cửu Nhị Command Dock · Chọn Trận Pháp & Bộ Bài Kinh Dịch"
        rightSlot={
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setShowMultiDeckPanel((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-serif font-bold transition-all cursor-pointer shadow-2xs ${
                showMultiDeckPanel || deckCount >= 2
                  ? "bg-[#261E16] text-[#F3E5AB] border-[#D4AF37]"
                  : "bg-[#FAF6EE] hover:bg-[#EFE6D5] text-[#4A3B28] border-[#C4963E]/40"
              }`}
              title="Tùy chỉnh số lượng bộ bài tham gia (từ 1 đến 12 bộ bài)"
            >
              <Layers className="w-3.5 h-3.5 text-[#C9A55A]" />
              <span>
                Số Bộ Bài: <strong>{deckCount} bộ ({deckCount * 64} lá)</strong>
              </span>
              <span className="text-[10px] opacity-80">{showMultiDeckPanel ? "▲" : "▼"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!isVip) {
                  if (!isRegisteredUser) {
                    if (onShowToast) onShowToast("Thư viện Bộ Hình 64 Quẻ chỉ dành riêng cho Hội Viên VIP. Vui lòng đăng nhập!");
                    if (onRequireAuth) onRequireAuth("login", "Đăng nhập hoặc đăng ký tài khoản VIP để truy cập Thư Viện Bộ Hình 64 Quẻ!");
                  } else {
                    if (onShowToast) onShowToast("Thư viện Bộ Hình 64 Quẻ chỉ dành riêng cho Hội Viên VIP. Vui lòng nâng cấp gói VIP!");
                    if (onRequireAuth) onRequireAuth("upgrade", "Nâng cấp Hội Viên VIP để mở khóa Thư Viện Bộ Hình 64 Quẻ và đổi giữa các bộ bài độc quyền!");
                  }
                  return;
                }
                handleOpenManager();
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#261E16] hover:bg-[#34271C] border border-[#C4963E]/60 text-[#F3E7D0] text-xs font-serif font-bold transition-all shadow-2xs cursor-pointer"
              title={isVip ? "Quản lý ảnh 64 quẻ & nạp hình (Mở Thư Viện)" : "Đặc quyền Hội Viên VIP: Đổi bộ hình hoặc nạp ảnh cho 64 quẻ"}
            >
              <Palette className="w-3.5 h-3.5 text-[#C9A55A]" />
              <span>Bộ Hình:</span>
              <span className="text-[#C9A55A] font-bold">{activeDeckName}</span>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9.5px] font-sans font-bold bg-amber-950/90 text-amber-300 border border-amber-600/50 font-mono">
                <Crown className="w-2.5 h-2.5 text-amber-400" />
                VIP
              </span>
            </button>

            {onActiveDeckChanged && (
              <select
                value={activeDeckId || DEFAULT_DECK_ID}
                onChange={(e) => onActiveDeckChanged(e.target.value)}
                className="px-2.5 py-1 rounded-xl bg-[#FAF6EE] hover:bg-[#EFE6D5] border border-[#C4963E]/45 text-[#1C1813] text-xs font-serif font-semibold cursor-pointer outline-none transition-all shadow-2xs"
                title="Tùy chỉnh đổi nhanh bộ bài đang dùng"
              >
                {availableDecks.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            )}

            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(new CustomEvent("zen-audio-toggle"));
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-serif font-bold transition-all shadow-2xs cursor-pointer ${
                isZenAudioPlaying
                  ? "bg-[#261E16] border-[#D4AF37] text-[#F3E5AB]"
                  : "bg-[#FAF6EE] hover:bg-[#EFE6D5] border-[#C4963E]/40 text-[#4A3B28]"
              }`}
              title="Bật/Tắt nhạc thiền cổ phong Vũ Lâm Linh khi bốc bài"
            >
              <Music className={`w-3.5 h-3.5 text-[#B8862D] ${isZenAudioPlaying ? "animate-bounce" : ""}`} />
              <span>{isZenAudioPlaying ? "Đang Phát Vũ Lâm Linh" : "Nhạc Vũ Lâm Linh"}</span>
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#1C1813]">
                RÚT THẺ BÀI KINH DỊCH ({deckCount >= 2 ? `${deckCount} BỘ • ${deckCount * 64} LÁ` : "ĐỦ 64 LÁ CHU DỊCH"})
              </h3>
              <p className="text-xs text-[#5C4D3B] font-serif mt-0.5">
                {deckCount >= 2
                  ? `Đang kết hợp ${deckCount} bộ bài (${deckCount * 64} lá) theo hình thức ${multiDeckMode === "separate" ? "bốc từng bộ riêng lẻ" : "trộn chung nhiều bộ vào nhau"}. Chọn lá bài cảm ứng để thỉnh quẻ.`
                  : "Tĩnh tâm hướng về điều bạn muốn thấu tỏ, chọn trận pháp bên dưới rồi rút trực tiếp trên Sân Khấu Bát Quái."}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setShowCardDrawPurification(!showCardDrawPurification)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-serif text-[#6E4E16] bg-[#FAF6EE] hover:bg-[#EFE6D5] border border-[#C4963E]/45 transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                <span>⛩️</span>
                <span className="font-semibold underline decoration-dotted">
                  Nghi thức Trai Giới Mộc Dục
                </span>
                <span className="text-[10px] font-mono text-[#8A7960]">
                  {showCardDrawPurification ? "▲ Ẩn" : "▼ Xem"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent("open-donate-modal"))}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-serif font-bold text-amber-300 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-600/50 hover:border-amber-400 transition-all cursor-pointer shadow-2xs active:scale-95"
                title="Quét mã QR donate ủng hộ dự án"
              >
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-500/20" />
                <span>Donate ủng hộ</span>
                <QrCode className="w-3 h-3 text-amber-400" />
              </button>
            </div>
          </div>

          {showCardDrawPurification && (
            <div className="text-left bg-[#140F0B] border border-[#4D351E] rounded-xl p-3.5 sm:p-4 shadow-xl text-xs font-serif text-[#DECAB2] space-y-2.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-[#302113] pb-1.5 text-[#E6D3A3] font-bold text-xs">
                <span className="flex items-center gap-1.5">
                  <span>📜</span> THỦ TỤC TRAI GIỚI MỘC DỤC (齋戒沐浴) TRƯỚC KHI CHẠM THẺ BÀI
                </span>
                <button
                  type="button"
                  onClick={() => setShowCardDrawPurification(false)}
                  className="text-[#8C7A65] hover:text-[#E6D3A3] text-[11px] font-sans px-1.5 py-0.5 rounded cursor-pointer"
                >
                  Đóng ✕
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
                <div className="bg-[#1C140D] p-2.5 rounded-lg border border-[#3E2917] space-y-1">
                  <strong className="text-[#C9A55A] font-bold block text-xs">
                    1. Mộc Dục (沐浴 - Rửa Sạch Đôi Bàn Tay):
                  </strong>
                  <p className="leading-relaxed text-[#BFB09A]">
                    • Đôi bàn tay con người là kênh dẫn năng lượng sinh học trực tiếp khi chạm vào thẻ bài. Rửa sạch hai bàn tay dưới dòng nước mát, lau khô ráo và giữ hơi thở thanh sạch.<br/>
                    • Ăn mặc tề chỉnh, ngồi ngay ngắn, tôn nghiêm để tỏ lòng chí kính.
                  </p>
                </div>

                <div className="bg-[#1C140D] p-2.5 rounded-lg border border-[#3E2917] space-y-1">
                  <strong className="text-[#C9A55A] font-bold block text-xs">
                    2. Trai Giới (齋戒 - Tịnh Hóa Tâm Thức):
                  </strong>
                  <p className="leading-relaxed text-[#BFB09A]">
                    • Dẹp bỏ mọi toan tính vụ lợi, sân hận, đố kỵ hoặc hoang mang lo lắng.<br/>
                    • Hít thở sâu 3 hơi, giữ tâm rỗng rang như mặt gương phẳng (*Hư Tĩnh Sinh Minh*). Nhất tâm hướng trọn ý thức về câu hỏi cần giải đáp.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Draw Mode Selectors or Khong Minh / Ngu Che Method Banner */}
          {isKhongMinhMethod ? (
            <div className="flex items-center gap-2.5 bg-gradient-to-r from-[#2A1D11] via-[#1D140C] to-[#120D08] border border-[#5A3F20] px-3.5 py-2 rounded-xl shadow-md">
              <Scroll className="w-4 h-4 text-[#C9A55A] shrink-0" />
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-serif font-black text-[#E6D3A3] tracking-wide">
                  XĂM KHỔNG MINH · TAM TÀI 3 LÁ (THIÊN - ĐỊA - NHÂN)
                </span>
              </div>
            </div>
          ) : isNguCheMethod ? (
            <div className="flex items-center gap-2.5 bg-gradient-to-r from-[#3A160E] via-[#26110A] to-[#160A06] border border-[#C9A55A]/70 px-3.5 py-2 rounded-xl shadow-md">
              <Crown className="w-4 h-4 text-[#F3D787] shrink-0" />
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-serif font-black text-[#FCE6B4] tracking-wide">
                  NGỰ CHẾ ĐOÁN DỊCH TINH TÚY · TAM TÀI 3 LÁ (LẤY LÁ CUỐI LÀM QUẺ CHỦ)
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2 w-full">
              {/* Dải nút chọn Trận Pháp chuẩn Cửu Nhị Command Dock của Trang Chủ */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSelectDrawMode("single")}
                  className={`px-3 py-1.5 text-xs font-serif rounded-xl transition-all cursor-pointer border ${
                    drawMode === "single"
                      ? "bg-gradient-to-b from-[#261E16] to-[#18130E] text-[#F3E5AB] border-[#D4AF37] font-bold shadow-md scale-[1.02]"
                      : "bg-[#FAF6EE] hover:bg-[#EFE6D5] text-[#4A3B28] border-[#C4963E]/35 font-medium"
                  }`}
                >
                  1 Lá · Đơn Quẻ
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectDrawMode("double")}
                  className={`px-3 py-1.5 text-xs font-serif rounded-xl transition-all cursor-pointer border ${
                    drawMode === "double"
                      ? "bg-gradient-to-b from-[#261E16] to-[#18130E] text-[#F3E5AB] border-[#D4AF37] font-bold shadow-md scale-[1.02]"
                      : "bg-[#FAF6EE] hover:bg-[#EFE6D5] text-[#4A3B28] border-[#C4963E]/35 font-medium"
                  }`}
                >
                  2 Lá · Âm Dương
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectDrawMode("three")}
                  className={`px-3 py-1.5 text-xs font-serif rounded-xl transition-all cursor-pointer border ${
                    drawMode === "three"
                      ? "bg-gradient-to-b from-[#261E16] to-[#18130E] text-[#F3E5AB] border-[#D4AF37] font-bold shadow-md scale-[1.02]"
                      : "bg-[#FAF6EE] hover:bg-[#EFE6D5] text-[#4A3B28] border-[#C4963E]/35 font-medium"
                  }`}
                >
                  3 Lá · Tam Tài
                </button>
                <button
                  type="button"
                  onClick={handleSelectFiveElementsMode}
                  className={`px-3 py-1.5 text-xs font-serif rounded-xl transition-all cursor-pointer border ${
                    drawMode === "custom" && customCount === 5
                      ? "bg-gradient-to-b from-[#261E16] to-[#18130E] text-[#F3E5AB] border-[#D4AF37] font-bold shadow-md scale-[1.02]"
                      : "bg-[#FAF6EE] hover:bg-[#EFE6D5] text-[#4A3B28] border-[#C4963E]/35 font-medium"
                  }`}
                >
                  5 Lá · Ngũ Hành
                </button>

                {/* 7 Lá */}
                <button
                  type="button"
                  onClick={() => handleSelectDrawMode("seven")}
                  className={`px-3 py-1.5 text-xs font-serif rounded-xl transition-all cursor-pointer border flex items-center gap-1 ${
                    drawMode === "seven"
                      ? "bg-gradient-to-b from-[#261E16] to-[#18130E] text-[#F3E5AB] border-[#D4AF37] font-bold shadow-md scale-[1.02]"
                      : "bg-[#FAF6EE] hover:bg-[#EFE6D5] text-[#4A3B28] border-[#C4963E]/35 font-medium"
                  } ${!isRegisteredUser ? "opacity-80" : ""}`}
                >
                  <span>✦ 7 Lá (Thất Tinh Trận)</span>
                  {!isRegisteredUser && <Lock className="w-3 h-3 text-amber-600 shrink-0" />}
                </button>

                {/* 9 Lá */}
                <button
                  type="button"
                  onClick={() => handleSelectDrawMode("nine")}
                  className={`px-3 py-1.5 text-xs font-serif rounded-xl transition-all cursor-pointer border flex items-center gap-1 ${
                    drawMode === "nine"
                      ? "bg-gradient-to-b from-[#261E16] to-[#18130E] text-[#F3E5AB] border-[#D4AF37] font-bold shadow-md scale-[1.02]"
                      : "bg-[#FAF6EE] hover:bg-[#EFE6D5] text-[#4A3B28] border-[#C4963E]/35 font-medium"
                  } ${!isRegisteredUser ? "opacity-80" : ""}`}
                >
                  <span>9 Lá (Cửu Cung)</span>
                  {!isRegisteredUser && <Lock className="w-3 h-3 text-amber-600 shrink-0" />}
                </button>

                {/* 10 Lá */}
                <button
                  type="button"
                  onClick={() => handleSelectDrawMode("ten")}
                  className={`px-3 py-1.5 text-xs font-serif rounded-xl transition-all cursor-pointer border flex items-center gap-1 ${
                    drawMode === "ten"
                      ? "bg-gradient-to-b from-[#261E16] to-[#18130E] text-[#F3E5AB] border-[#D4AF37] font-bold shadow-md scale-[1.02]"
                      : "bg-[#FAF6EE] hover:bg-[#EFE6D5] text-[#4A3B28] border-[#C4963E]/35 font-medium"
                  } ${!isRegisteredUser ? "opacity-80" : ""}`}
                >
                  <span>✦ 10 Lá (Thập Tinh)</span>
                  {!isRegisteredUser && <Lock className="w-3 h-3 text-amber-600 shrink-0" />}
                </button>

                {/* 11 Lá */}
                <button
                  type="button"
                  onClick={() => handleSelectDrawMode("ten_expanded")}
                  className={`px-3 py-1.5 text-xs font-serif rounded-xl transition-all cursor-pointer border flex items-center gap-1 ${
                    drawMode === "ten_expanded"
                      ? "bg-gradient-to-b from-[#261E16] to-[#18130E] text-[#F3E5AB] border-[#D4AF37] font-bold shadow-md scale-[1.02]"
                      : "bg-[#FAF6EE] hover:bg-[#EFE6D5] text-[#4A3B28] border-[#C4963E]/35 font-medium"
                  } ${!isRegisteredUser ? "opacity-80" : ""}`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-inherit" />
                  <span>11 Lá (2A &amp; 2B)</span>
                  {!isRegisteredUser && <Lock className="w-3 h-3 text-amber-600 shrink-0" />}
                </button>

                {/* 12 Lá */}
                <button
                  type="button"
                  onClick={() => handleSelectDrawMode("twelve")}
                  className={`px-3 py-1.5 text-xs font-serif rounded-xl transition-all cursor-pointer border flex items-center gap-1 ${
                    drawMode === "twelve"
                      ? "bg-gradient-to-b from-[#261E16] to-[#18130E] text-[#F3E5AB] border-[#D4AF37] font-bold shadow-md scale-[1.02]"
                      : "bg-[#FAF6EE] hover:bg-[#EFE6D5] text-[#4A3B28] border-[#C4963E]/35 font-medium"
                  } ${!isRegisteredUser ? "opacity-80" : ""}`}
                >
                  <span>12 Lá (Địa Chi)</span>
                  {!isRegisteredUser && <Lock className="w-3 h-3 text-amber-600 shrink-0" />}
                </button>

                {/* Tùy ý số lá */}
                <button
                  type="button"
                  onClick={() => {
                    if (customCount === 5) {
                      setCustomCount(6);
                      setCustomCountInput("6");
                      setCustomPurposes(getDefaultCustomPurposes(6));
                    }
                    handleSelectDrawMode("custom");
                  }}
                  className={`px-3 py-1.5 text-xs font-serif rounded-xl transition-all cursor-pointer border flex items-center gap-1 ${
                    drawMode === "custom" && customCount !== 5
                      ? "bg-gradient-to-b from-[#261E16] to-[#18130E] text-[#F3E5AB] border-[#D4AF37] font-bold shadow-md scale-[1.02]"
                      : "bg-[#FAF6EE] hover:bg-[#EFE6D5] text-[#4A3B28] border-[#C4963E]/35 font-medium"
                  } ${!isRegisteredUser ? "opacity-80" : ""}`}
                >
                  <Sliders className="w-3 h-3 text-inherit" />
                  <span>Tùy Ý ({customCount === 5 ? 6 : customCount} Lá)</span>
                  {!isRegisteredUser && <Lock className="w-3 h-3 text-amber-600 shrink-0" />}
                </button>
              </div>
            </div>
          )}
        </div>
      </JadeCommandPanel>

      {/* MULTI-DECK SELECTION PANEL: 1 ĐẾN 12 BỘ BÀI ĐỒNG THỜI (Thu gọn thông minh, mở khi bấm nút Số Bộ Bài) */}
      {(showMultiDeckPanel || deckCount >= 2) && (
      <div className="bg-[#181410] border border-[#3E3224] rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2C2317] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2A2016] border border-[#52412B] flex items-center justify-center text-[#C9A55A] shadow-inner shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-serif font-bold text-[#F3E7CF] flex items-center gap-2 flex-wrap">
                <span>SỐ LƯỢNG BỘ BÀI SỬ DỤNG (1 ĐẾN 12 BỘ)</span>
                <span className="text-[10px] font-sans font-normal px-2 py-0.5 rounded-full bg-[#34271A] text-[#E0C895] border border-[#503D28]">
                  {deckCount} bộ = {deckCount * 64} lá
                </span>
                {!isVip && (
                  <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-amber-950/90 text-amber-300 border border-amber-600/50 flex items-center gap-1 font-bold">
                    <Crown className="w-2.5 h-2.5 text-amber-400" />
                    VIP: Mở khóa 3-12 bộ
                  </span>
                )}
              </h4>
              <p className="text-xs text-[#9E8E79] mt-0.5">
                {isVip
                  ? "Tài khoản VIP có đặc quyền sử dụng từ 1 đến 12 bộ bài cùng lúc (64 - 768 lá). Chọn bốc từng bộ riêng lẻ hoặc trộn chung nhiều bộ."
                  : "Tài khoản tiêu chuẩn sử dụng tối đa 2 bộ bài (128 lá). Nâng cấp VIP để mở khóa từ 3 đến 12 bộ bài cùng lúc (192 - 768 lá)."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-[#A89882]">Đang dùng:</span>
            <span className="px-2.5 py-1 rounded-lg bg-[#271F15] border border-[#4A3926] text-xs font-serif font-bold text-[#E5C158]">
              {deckCount} bộ bài ({deckCount * 64} lá)
            </span>
          </div>
        </div>

        {/* 12 Deck Buttons */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[#C8B89E]">
            <span className="flex items-center gap-1.5 font-medium">
              <span>Bấm chọn số lượng bộ bài tham gia:</span>
            </span>
            <span className="text-[11px] text-[#8A7963] font-mono">1-2 bộ miễn phí • 3-12 bộ VIP</span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-1.5">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => {
              const isSelected = deckCount === n;
              const isVipOnly = n > 2;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => updateDeckCount(n)}
                  className={`relative py-2 px-1 text-center rounded-xl border text-xs font-serif font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-b from-[#C9A55A] to-[#AA8222] text-[#14120F] border-[#E8C55A] shadow-[0_0_12px_rgba(212,175,55,0.35)] scale-105 z-10"
                      : isVipOnly && !isVip
                      ? "bg-[#14100D]/80 hover:bg-[#221A13] text-[#7A6D5B] hover:text-[#D4C3AC] border-[#2C2116] hover:border-amber-800/40"
                      : "bg-[#14100D] hover:bg-[#221A13] text-[#A89882] hover:text-[#F3E7CF] border-[#2C2116] hover:border-[#4B3724]"
                  }`}
                  title={
                    isVipOnly && !isVip
                      ? `Đặc quyền VIP: ${n} bộ bài Kinh Dịch (${n * 64} lá)`
                      : `${n} bộ bài Kinh Dịch (Tổng cộng ${n * 64} lá)`
                  }
                >
                  {isVipOnly && !isVip && (
                    <span className="absolute -top-1.5 -right-1 px-1 py-0.2 rounded-full bg-amber-950 text-amber-400 border border-amber-600/60 text-[8px] font-sans font-bold flex items-center gap-0.5 leading-none shadow-xs">
                      <Crown className="w-2 h-2 text-amber-400" />
                      VIP
                    </span>
                  )}
                  <div className="text-[10px] font-sans font-normal opacity-80">{n === 1 ? "1 bộ" : `${n} bộ`}</div>
                  <div className="text-xs sm:text-sm font-mono leading-tight mt-0.5">{n * 64} lá</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Multi-Deck Mode Selector (When deckCount >= 2) */}
        {deckCount >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-3 border-t border-[#292015] space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#C8B89E] gap-1">
              <span className="font-serif font-bold text-[#E5D2B3] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C9A55A]" />
                LỰA CHỌN CÁCH THỨC BỐC {deckCount} BỘ BÀI:
              </span>
              <span className="text-[11px] text-[#A69580]">
                (Ví dụ: với 2 bộ là 64x2 = 128 lá, với 3 bộ là 64x3 = 192 lá...)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Mode 1: Bốc từng bộ riêng lẻ */}
              <button
                type="button"
                onClick={() => updateMultiDeckMode("separate")}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  multiDeckMode === "separate"
                    ? "bg-gradient-to-r from-[#2B2014] to-[#201810] border-[#C9A55A] shadow-[0_0_15px_rgba(212,175,55,0.22)]"
                    : "bg-[#130F0C] border-[#291F14] hover:border-[#4A3724] opacity-75 hover:opacity-100"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs sm:text-sm font-serif font-bold text-[#F3E7CF] flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#C9A55A]" />
                    1. Bốc Từng Bộ Bài Riêng Lẻ
                  </span>
                  {multiDeckMode === "separate" ? (
                    <span className="w-5 h-5 rounded-full bg-[#C9A55A] text-[#120F0C] text-xs font-bold flex items-center justify-center shadow">
                      ✓
                    </span>
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-[#483929]" />
                  )}
                </div>
                <p className="text-[11px] text-[#A69580] leading-relaxed">
                  Mỗi bộ bài là 1 cỗ riêng độc lập (đủ 64 lá). Bạn chọn thỉnh lần lượt từ Bộ #1, Bộ #2... đến Bộ #{deckCount}. Các lá bài được đánh dấu rõ thuộc bộ số mấy.
                </p>
              </button>

              {/* Mode 2: Trộn chung nhiều bộ với nhau */}
              <button
                type="button"
                onClick={() => updateMultiDeckMode("combined")}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  multiDeckMode === "combined"
                    ? "bg-gradient-to-r from-[#2B2014] to-[#201810] border-[#C9A55A] shadow-[0_0_15px_rgba(212,175,55,0.22)]"
                    : "bg-[#130F0C] border-[#291F14] hover:border-[#4A3724] opacity-75 hover:opacity-100"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs sm:text-sm font-serif font-bold text-[#F3E7CF] flex items-center gap-1.5">
                    <Shuffle className="w-4 h-4 text-[#C9A55A]" />
                    2. Trộn Chung Nhiều Bộ Vào Nhau ({deckCount * 64} Lá)
                  </span>
                  {multiDeckMode === "combined" ? (
                    <span className="w-5 h-5 rounded-full bg-[#C9A55A] text-[#120F0C] text-xs font-bold flex items-center justify-center shadow">
                      ✓
                    </span>
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-[#483929]" />
                  )}
                </div>
                <p className="text-[11px] text-[#A69580] leading-relaxed">
                  Gộp toàn bộ {deckCount} bộ vào 1 tụ duy nhất ({deckCount === 2 ? "64x2 = 128 lá" : deckCount === 3 ? "64x3 = 192 lá" : `${deckCount}x64 = ${deckCount * 64} lá`}). Cho phép bốc ngẫu nhiên trên toàn bộ tập thẻ khổng lồ.
                </p>
              </button>
            </div>

            {/* Separate Mode Deck Switcher */}
            {multiDeckMode === "separate" && (
              <div className="bg-[#1F1913] border border-[#3B2E1F] rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-[#C8B89E] font-medium font-serif">Đang chọn từ:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {Array.from({ length: deckCount }, (_, i) => i + 1).map((d) => {
                      const isCurrentDeck = activeDeckIndex === d;
                      const pickedCount = (selectedIndicesByDeck[d] || []).length;
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setActiveDeckIndex(d)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-serif font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            isCurrentDeck
                              ? "bg-[#C9A55A] text-[#120F0C] shadow-md"
                              : "bg-[#14100D] hover:bg-[#251D14] text-[#A89882] border border-[#382B1D]"
                          }`}
                        >
                          <span>Bộ #{d}</span>
                          {pickedCount > 0 && (
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-normal ${
                                isCurrentDeck ? "bg-[#120F0C] text-[#C9A55A]" : "bg-[#2E2215] text-[#E0C895]"
                              }`}
                            >
                              {pickedCount} lá
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs text-[#B5A48F] cursor-pointer select-none shrink-0">
                  <input
                    type="checkbox"
                    checked={autoSwitchDeck}
                    onChange={(e) => setAutoSwitchDeck(e.target.checked)}
                    className="accent-[#C9A55A] w-3.5 h-3.5 rounded"
                  />
                  <span>Tự động chuyển bộ sau mỗi lá bốc</span>
                </label>
              </div>
            )}
          </motion.div>
        )}
      </div>
      )}

      {/* 2-CARD DRAW SUB-PANEL: Mode A (Hiện tại - Tương lai) vs Mode B (Lựa chọn A & B) */}
      {drawMode === "double" && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#191510] border border-[#423424] rounded-2xl p-4 shadow-xl space-y-3.5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-[#2C2216] pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C9A55A] animate-pulse" />
              <h4 className="text-xs sm:text-sm font-serif font-bold text-[#F3E7CF] flex items-center gap-1.5">
                CHỌN MỤC ĐÍCH BỐC 2 LÁ BÀI
              </h4>
            </div>
            <span className="text-[11px] text-[#A2927C]">
              Chọn phương án phân tích bạn mong muốn:
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Mode A: Hiện tại & Tương lai */}
            <button
              type="button"
              onClick={() => {
                setDoubleSpreadMode("present_future");
                setSelectedDeckIndices([]);
                setRevealedCards([]);
              }}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                doubleSpreadMode === "present_future"
                  ? "bg-gradient-to-r from-[#292015] to-[#1E1711] border-[#C9A55A] shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                  : "bg-[#14110E] border-[#2C2216] hover:border-[#4B3926] opacity-75 hover:opacity-100"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm font-serif font-bold text-[#F3E7CF] flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#C9A55A]" />
                  a. Hiện Tại & Tương Lai
                </span>
                {doubleSpreadMode === "present_future" ? (
                  <span className="w-5 h-5 rounded-full bg-[#C9A55A] text-[#120F0C] text-xs font-bold flex items-center justify-center shadow">
                    ✓
                  </span>
                ) : (
                  <span className="w-4 h-4 rounded-full border border-[#483929]" />
                )}
              </div>
              <p className="text-[11px] text-[#9E8E79] leading-relaxed">
                <span className="text-[#E0D0B6] font-semibold">Lá 1:</span> Thực trạng hiện tại, gốc rễ nguyên nhân.<br />
                <span className="text-[#E0D0B6] font-semibold">Lá 2:</span> Chiều hướng biến chuyển và kết quả tương lai.
              </p>
            </button>

            {/* Mode B: Lựa chọn A và Lựa chọn B */}
            <button
              type="button"
              onClick={() => {
                setDoubleSpreadMode("choice_ab");
                setSelectedDeckIndices([]);
                setRevealedCards([]);
              }}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                doubleSpreadMode === "choice_ab"
                  ? "bg-gradient-to-r from-[#292015] to-[#1E1711] border-[#C9A55A] shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                  : "bg-[#14110E] border-[#2C2216] hover:border-[#4B3926] opacity-75 hover:opacity-100"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm font-serif font-bold text-[#F3E7CF] flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-[#C9A55A]" />
                  b. Lựa Chọn A & Lựa Chọn B
                </span>
                {doubleSpreadMode === "choice_ab" ? (
                  <span className="w-5 h-5 rounded-full bg-[#C9A55A] text-[#120F0C] text-xs font-bold flex items-center justify-center shadow">
                    ✓
                  </span>
                ) : (
                  <span className="w-4 h-4 rounded-full border border-[#483929]" />
                )}
              </div>
              <p className="text-[11px] text-[#9E8E79] leading-relaxed">
                <span className="text-[#E0D0B6] font-semibold">Lá 1:</span> Phương án / Lựa chọn A.<br />
                <span className="text-[#E0D0B6] font-semibold">Lá 2:</span> Phương án / Lựa chọn B (So sánh xu hướng hai ngã rẽ).
              </p>
            </button>
          </div>

          {/* Optional naming for Choice A and Choice B */}
          {doubleSpreadMode === "choice_ab" && (
            <div className="pt-2.5 border-t border-[#2A2016] grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-[#C4B49B] font-medium block mb-1 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-[#2D2115] text-[#C9A55A] font-bold text-[10px] flex items-center justify-center">A</span>
                  Tên Lựa chọn A (Ứng với Lá 1):
                </label>
                <input
                  type="text"
                  value={choiceALabel}
                  onChange={(e) => setChoiceALabel(e.target.value)}
                  placeholder="VD: Chuyển sang công ty mới, Mua nhà..."
                  className="w-full bg-[#120F0C] border border-[#3E3122] focus:border-[#C9A55A] rounded-xl px-3 py-1.5 text-xs text-[#EFE5D3] placeholder-[#6C5E4E] outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-[#C4B49B] font-medium block mb-1 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-[#2D2115] text-[#E28355] font-bold text-[10px] flex items-center justify-center">B</span>
                  Tên Lựa chọn B (Ứng với Lá 2):
                </label>
                <input
                  type="text"
                  value={choiceBLabel}
                  onChange={(e) => setChoiceBLabel(e.target.value)}
                  placeholder="VD: Ở lại công ty cũ, Giữ nguyên kế hoạch..."
                  className="w-full bg-[#120F0C] border border-[#3E3122] focus:border-[#C9A55A] rounded-xl px-3 py-1.5 text-xs text-[#EFE5D3] placeholder-[#6C5E4E] outline-none"
                />
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* 3-CARD DRAW SUB-PANEL: TIẾN TRÌNH QUÁ KHỨ - HIỆN TẠI - TƯƠNG LAI HOẶC SO SÁNH 3 LỰA CHỌN A - B - C */}
      {drawMode === "three" && isKhongMinhMethod && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#191510] border border-[#523A20] rounded-2xl p-4 shadow-xl space-y-3"
        >
          <div className="flex items-center gap-2 border-b border-[#2C2216] pb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C9A55A] shadow-[0_0_8px_#C9A55A]" />
            <h4 className="text-xs sm:text-sm font-serif font-bold text-[#F3E7CF] flex items-center gap-2">
              <span>TRẬN PHÁP XĂM KHỔNG MINH (TAM TÀI: THIÊN — ĐỊA — NHÂN)</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-500/40">
                3 Lá Định Vị
              </span>
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="bg-[#14110E] p-3 rounded-xl border border-[#2D2216]">
              <span className="text-[#C9A55A] font-serif font-bold flex items-center gap-1.5 mb-1 text-xs">
                <span className="w-4 h-4 rounded bg-[#2D2114] text-[#C9A55A] text-[10px] flex items-center justify-center font-bold">天</span>
                Thiên Đạo (Thiên Thời)
              </span>
              <p className="text-[11px] text-[#9E8E79] leading-relaxed">
                Hoàn cảnh khách quan, thời cơ vũ trụ, vận hội thời cuộc và các biến số bên ngoài chi phối. Tra cứu theo <strong className="text-[#C9A55A]">Vận Thế & Đại Tượng</strong> trong Thuyết Minh.
              </p>
            </div>

            <div className="bg-[#14110E] p-3 rounded-xl border border-[#2D2216]">
              <span className="text-[#EAD8B1] font-serif font-bold flex items-center gap-1.5 mb-1 text-xs">
                <span className="w-4 h-4 rounded bg-[#2D2114] text-[#EAD8B1] text-[10px] flex items-center justify-center font-bold">地</span>
                Địa Đạo (Địa Lợi)
              </span>
              <p className="text-[11px] text-[#9E8E79] leading-relaxed">
                Môi trường thực địa, nền tảng cơ sở vật chất, tài nguyên sẵn có và vị thế chỗ đứng thực tại. Tra cứu theo <strong className="text-[#EAD8B1]">Cấu Trúc Quẻ</strong> trong Thuyết Minh.
              </p>
            </div>

            <div className="bg-[#14110E] p-3 rounded-xl border border-[#2D2216]">
              <span className="text-[#E28355] font-serif font-bold flex items-center gap-1.5 mb-1 text-xs">
                <span className="w-4 h-4 rounded bg-[#2D2114] text-[#E28355] text-[10px] flex items-center justify-center font-bold">人</span>
                Nhân Đạo (Nhân Hòa)
              </span>
              <p className="text-[11px] text-[#9E8E79] leading-relaxed">
                Tâm thế nỗ lực chủ quan, tương tác con người, đạo đối nhân xử thế và ý chí quyết định hành động. Tra cứu theo <strong className="text-[#E28355]">Dòng Chữ Đỏ</strong> trong Thuyết Minh & 384 quẻ xăm linh ứng.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {drawMode === "three" && isNguCheMethod && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#23140D] via-[#190F0A] to-[#130B07] border border-[#8B5E28] rounded-2xl p-4 shadow-xl space-y-3"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#3E2718] pb-2">
            <h4 className="text-xs sm:text-sm font-serif font-bold text-[#FCE6B4] flex items-center gap-2">
              <Crown className="w-4 h-4 text-[#F3D787]" />
              <span>NGỰ CHẾ TÂN TẬP ĐOÁN DỊCH TINH TÚY (TAM TÀI: THIÊN — ĐỊA — NHÂN)</span>
              <span className="text-[10px] font-mono text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40">
                Lấy Lá Cuối Làm Quẻ Chủ + Xí Ngầu 12 Mặt
              </span>
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="bg-[#140C08] p-3 rounded-xl border border-[#362214]">
              <span className="text-[#C9A55A] font-serif font-bold flex items-center gap-1.5 mb-1 text-xs">
                <span className="w-4 h-4 rounded bg-[#2D1D12] text-[#C9A55A] text-[10px] flex items-center justify-center font-bold">天</span>
                Lá 1: Thiên Thời (Khởi Cơ)
              </span>
              <p className="text-[11px] text-[#B8A58E] leading-relaxed">
                Đại diện đạo Trời, thời vận khách quan và khí số khởi nguồn của sự việc.
              </p>
            </div>

            <div className="bg-[#140C08] p-3 rounded-xl border border-[#362214]">
              <span className="text-[#EAD8B1] font-serif font-bold flex items-center gap-1.5 mb-1 text-xs">
                <span className="w-4 h-4 rounded bg-[#2D1D12] text-[#EAD8B1] text-[10px] flex items-center justify-center font-bold">地</span>
                Lá 2: Địa Lợi (Nền Tảng)
              </span>
              <p className="text-[11px] text-[#B8A58E] leading-relaxed">
                Đại diện đạo Đất, hoàn cảnh thực địa, nội tình và môi trường trung gian.
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#2E160D] to-[#1A0D08] p-3 rounded-xl border border-[#C9A55A]/80 shadow">
              <span className="text-[#F3D787] font-serif font-bold flex items-center gap-1.5 mb-1 text-xs">
                <span className="w-4 h-4 rounded bg-[#8B1E14] text-[#FCE6B4] text-[10px] flex items-center justify-center font-bold">人</span>
                Lá 3 (Lá Cuối): Nhân Hòa — QUẺ CHỦ
              </span>
              <p className="text-[11px] text-[#E5D3B3] leading-relaxed">
                <strong>Lấy lá cuối cùng làm Quẻ Chủ</strong>, sau đó <strong>lắc xí ngầu 12 mặt</strong> để trích xuất tranh vẽ Cố Cung & thơ đoán của quẻ cùng tranh & thơ đoán của ngày hôm đó.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {drawMode === "three" && !isKhongMinhMethod && !isNguCheMethod && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#191510] border border-[#423424] rounded-2xl p-4 shadow-xl space-y-3"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-[#2C2216] pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C9A55A] animate-pulse" />
              <h4 className="text-xs sm:text-sm font-serif font-bold text-[#F3E7CF] flex items-center gap-1.5">
                <Hourglass className="w-4 h-4 text-[#C9A55A]" />
                TRẬN PHÁP 3 LÁ: CHỌN MÔ HÌNH QUẺ DỊCH
              </h4>
            </div>
            <span className="text-[11px] text-[#A2927C]">
              Tiến trình thời gian, So sánh 3 lựa chọn hoặc Ngự Chế Đoán Dịch Tinh Túy
            </span>
          </div>

          {/* Ba chế độ của bốc 3 lá trong Bốc Bài Kinh Dịch */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Mode A: Dòng thời gian */}
            <button
              type="button"
              onClick={() => {
                setThreeSpreadMode("past_present_future");
                setSelectedDeckIndices([]);
                setRevealedCards([]);
              }}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                threeSpreadMode === "past_present_future"
                  ? "bg-gradient-to-r from-[#292015] to-[#1E1711] border-[#C9A55A] shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                  : "bg-[#14110E] border-[#2C2216] hover:border-[#4B3926] opacity-75 hover:opacity-100"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm font-serif font-bold text-[#F3E7CF] flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#C9A55A]" />
                  a. Tiến Trình Thời Gian
                </span>
                {threeSpreadMode === "past_present_future" ? (
                  <span className="w-5 h-5 rounded-full bg-[#C9A55A] text-[#120F0C] text-xs font-bold flex items-center justify-center shadow">
                    ✓
                  </span>
                ) : (
                  <span className="w-4 h-4 rounded-full border border-[#483929]" />
                )}
              </div>
              <p className="text-[11px] text-[#9E8E79] leading-relaxed">
                <span className="text-[#E0D0B6] font-semibold">Lá 1:</span> Quá khứ (căn nguyên) • <span className="text-[#E0D0B6] font-semibold">Lá 2:</span> Hiện tại (thực trạng) • <span className="text-[#E0D0B6] font-semibold">Lá 3:</span> Tương lai (kết quả).
              </p>
            </button>

            {/* Mode B: 3 Lựa chọn (A, B, C) */}
            <button
              type="button"
              onClick={() => {
                setThreeSpreadMode("choice_abc");
                setSelectedDeckIndices([]);
                setRevealedCards([]);
              }}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                threeSpreadMode === "choice_abc"
                  ? "bg-gradient-to-r from-[#292015] to-[#1E1711] border-[#C9A55A] shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                  : "bg-[#14110E] border-[#2C2216] hover:border-[#4B3926] opacity-75 hover:opacity-100"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm font-serif font-bold text-[#F3E7CF] flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-[#C9A55A]" />
                  b. So Sánh 3 Lựa Chọn (A — B — C)
                </span>
                {threeSpreadMode === "choice_abc" ? (
                  <span className="w-5 h-5 rounded-full bg-[#C9A55A] text-[#120F0C] text-xs font-bold flex items-center justify-center shadow">
                    ✓
                  </span>
                ) : (
                  <span className="w-4 h-4 rounded-full border border-[#483929]" />
                )}
              </div>
              <p className="text-[11px] text-[#9E8E79] leading-relaxed">
                <span className="text-[#E0D0B6] font-semibold">Lá 1:</span> Lựa chọn A • <span className="text-[#E0D0B6] font-semibold">Lá 2:</span> Lựa chọn B • <span className="text-[#E0D0B6] font-semibold">Lá 3:</span> Lựa chọn C (Đối chiếu 3 ngã rẽ).
              </p>
            </button>

            {/* Mode C: Ngự Chế Tân Tập Đoán Dịch Tinh Túy (Thiên - Địa - Nhân, lấy lá cuối làm quẻ) */}
            <button
              type="button"
              onClick={() => {
                setThreeSpreadMode("ngu_che");
                setSelectedDeckIndices([]);
                setRevealedCards([]);
              }}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                threeSpreadMode === "ngu_che"
                  ? "bg-gradient-to-r from-[#381C11] to-[#24120B] border-[#F3D787] shadow-[0_0_15px_rgba(243,215,135,0.25)]"
                  : "bg-[#14110E] border-[#2C2216] hover:border-[#6E4726] opacity-80 hover:opacity-100"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm font-serif font-bold text-[#FCE6B4] flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-[#F3D787]" />
                  c. Ngự Chế Đoán Dịch Tinh Túy
                </span>
                {threeSpreadMode === "ngu_che" ? (
                  <span className="w-5 h-5 rounded-full bg-[#F3D787] text-[#120F0C] text-xs font-bold flex items-center justify-center shadow">
                    ✓
                  </span>
                ) : (
                  <span className="w-4 h-4 rounded-full border border-[#483929]" />
                )}
              </div>
              <p className="text-[11px] text-[#C8B69E] leading-relaxed">
                Bốc 3 lá <span className="text-[#F3D787] font-semibold">Thiên — Địa — Nhân</span>, lấy <span className="text-[#F3D787] font-bold">lá cuối cùng làm quẻ</span>, lắc xí ngầu 12 mặt trích tranh & thơ đoán của quẻ và ngày đó.
              </p>
            </button>
          </div>

          {/* Sub-inputs when in choice_abc mode */}
          {threeSpreadMode === "choice_abc" && (
            <div className="pt-2.5 border-t border-[#2A2016] grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-[#C4B49B] font-medium block mb-1 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-[#2D2115] text-[#C9A55A] font-bold text-[10px] flex items-center justify-center">A</span>
                  Tên Lựa chọn A (Ứng với Lá 1):
                </label>
                <input
                  type="text"
                  value={choiceALabel}
                  onChange={(e) => setChoiceALabel(e.target.value)}
                  placeholder="VD: Nhận việc cty A..."
                  className="w-full bg-[#120F0C] border border-[#3E3122] focus:border-[#C9A55A] rounded-xl px-3 py-1.5 text-xs text-[#EFE5D3] placeholder-[#6C5E4E] outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-[#C4B49B] font-medium block mb-1 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-[#2D2115] text-[#EAD8B1] font-bold text-[10px] flex items-center justify-center">B</span>
                  Tên Lựa chọn B (Ứng với Lá 2):
                </label>
                <input
                  type="text"
                  value={choiceBLabel}
                  onChange={(e) => setChoiceBLabel(e.target.value)}
                  placeholder="VD: Nhận việc cty B..."
                  className="w-full bg-[#120F0C] border border-[#3E3122] focus:border-[#C9A55A] rounded-xl px-3 py-1.5 text-xs text-[#EFE5D3] placeholder-[#6C5E4E] outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-[#C4B49B] font-medium block mb-1 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-[#2D2115] text-[#E28355] font-bold text-[10px] flex items-center justify-center">C</span>
                  Tên Lựa chọn C (Ứng với Lá 3):
                </label>
                <input
                  type="text"
                  value={choiceCLabel}
                  onChange={(e) => setChoiceCLabel(e.target.value)}
                  placeholder="VD: Tự khởi nghiệp / ở lại cũ..."
                  className="w-full bg-[#120F0C] border border-[#3E3122] focus:border-[#C9A55A] rounded-xl px-3 py-1.5 text-xs text-[#EFE5D3] placeholder-[#6C5E4E] outline-none"
                />
              </div>
            </div>
          )}

          {/* Explanatory box for ngu_che */}
          {threeSpreadMode === "ngu_che" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs pt-1">
              <div className="bg-[#14110E] p-3 rounded-xl border border-[#2D2216]">
                <span className="text-[#C9A55A] font-serif font-bold flex items-center gap-1.5 mb-1 text-xs">
                  <span className="w-4 h-4 rounded bg-[#2D2114] text-[#C9A55A] text-[10px] flex items-center justify-center font-bold">天</span>
                  Lá 1: Thiên Thời
                </span>
                <p className="text-[11px] text-[#9E8E79] leading-relaxed">
                  Đại diện đạo Trời, thời cơ khách quan và khí vận mở đầu.
                </p>
              </div>

              <div className="bg-[#14110E] p-3 rounded-xl border border-[#2D2216]">
                <span className="text-[#EAD8B1] font-serif font-bold flex items-center gap-1.5 mb-1 text-xs">
                  <span className="w-4 h-4 rounded bg-[#2D2114] text-[#EAD8B1] text-[10px] flex items-center justify-center font-bold">地</span>
                  Lá 2: Địa Lợi
                </span>
                <p className="text-[11px] text-[#9E8E79] leading-relaxed">
                  Đại diện đạo Đất, nền tảng hoàn cảnh và môi trường thực tại.
                </p>
              </div>

              <div className="bg-[#24140C] p-3 rounded-xl border border-[#C9A55A]/70">
                <span className="text-[#F3D787] font-serif font-bold flex items-center gap-1.5 mb-1 text-xs">
                  <span className="w-4 h-4 rounded bg-[#8B1E14] text-[#FCE6B4] text-[10px] flex items-center justify-center font-bold">人</span>
                  Lá 3 (Lá Cuối): Nhân Hòa — Quẻ Chủ
                </span>
                <p className="text-[11px] text-[#E5D3B3] leading-relaxed">
                  Lấy lá cuối cùng làm Quẻ Chủ, sau đó lắc xí ngầu 12 mặt (1–6: Hào 1–6, 7: Tĩnh, 8: Thế, 9: Thoán Dương, 10: Tượng Âm, 11: Ứng, 12: Động 6 hào).
                </p>
              </div>
            </div>
          )}

          {/* Explanatory box for past_present_future */}
          {threeSpreadMode === "past_present_future" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs pt-1">
              <div className="bg-[#14110E] p-3 rounded-xl border border-[#2D2216]">
                <span className="text-[#C9A55A] font-serif font-bold flex items-center gap-1.5 mb-1 text-xs">
                  <span className="w-4 h-4 rounded bg-[#2D2114] text-[#C9A55A] text-[10px] flex items-center justify-center font-mono">1</span>
                  Lá 1: Quá Khứ
                </span>
                <p className="text-[11px] text-[#9E8E79] leading-relaxed">
                  Cội nguồn phát sinh, nhân duyên khởi đầu và bài học kinh nghiệm đã qua.
                </p>
              </div>

              <div className="bg-[#14110E] p-3 rounded-xl border border-[#2D2216]">
                <span className="text-[#EAD8B1] font-serif font-bold flex items-center gap-1.5 mb-1 text-xs">
                  <span className="w-4 h-4 rounded bg-[#2D2114] text-[#EAD8B1] text-[10px] flex items-center justify-center font-mono">2</span>
                  Lá 2: Hiện Tại
                </span>
                <p className="text-[11px] text-[#9E8E79] leading-relaxed">
                  Thực trạng trước mắt, điểm nút then chốt và cơ hội / thách thức cần xử trí.
                </p>
              </div>

              <div className="bg-[#14110E] p-3 rounded-xl border border-[#2D2216]">
                <span className="text-[#E28355] font-serif font-bold flex items-center gap-1.5 mb-1 text-xs">
                  <span className="w-4 h-4 rounded bg-[#2D2114] text-[#E28355] text-[10px] flex items-center justify-center font-mono">3</span>
                  Lá 3: Tương Lai
                </span>
                <p className="text-[11px] text-[#9E8E79] leading-relaxed">
                  Chiều hướng biến chuyển, kết quả chung cuộc và triển vọng đón đợi.
                </p>
              </div>
            </div>
          )}

          {/* Gợi ý chuyển sang Xăm Khổng Minh */}
          <div className="pt-1">
            <div className="text-[11px] font-serif text-[#A89882] bg-[#120F0C] border border-[#2E2215] p-2.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <span className="flex items-center gap-1.5 flex-wrap">
                <span>💡 Muốn thỉnh quẻ <strong>Tam Tài (Thiên — Địa — Nhân) & Xăm Khổng Minh</strong>?</span>
                {!isVip && (
                  <span className="text-[10px] uppercase font-sans font-bold text-amber-300 bg-amber-950/80 border border-amber-600/50 rounded px-1.5 py-0.2 flex items-center gap-0.5">
                    <Lock className="w-2.5 h-2.5 text-amber-400" /> VIP
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (!isVip) {
                    if (!currentUser) {
                      onRequireAuth?.("login", "Xăm Khổng Minh dành riêng cho tài khoản VIP. Vui lòng đăng ký hoặc đăng nhập!");
                    } else {
                      onRequireAuth?.("upgrade", "Xăm Khổng Minh dành riêng cho Hội Viên VIP. Vui lòng nâng cấp VIP!");
                    }
                    return;
                  }
                  window.dispatchEvent(new CustomEvent("switch-divination-method", { detail: "khongminh" }));
                }}
                className={`px-3 py-1 rounded-lg border text-xs font-semibold cursor-pointer transition-all active:scale-95 shadow-xs flex items-center gap-1.5 ${
                  !isVip
                    ? "bg-amber-950/40 hover:bg-amber-900/50 border-amber-500/50 text-amber-300"
                    : "bg-[#2E2013] hover:bg-[#3D2B1A] border-[#C9A55A]/60 text-[#E6D3A3]"
                }`}
              >
                {!isVip ? <Lock className="w-3 h-3 text-amber-400" /> : <span>📜</span>}
                <span>{!isVip ? "Khóa VIP · Xăm Khổng Minh" : "Chuyển Sang Xăm Khổng Minh"}</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* 7-CARD DRAW SUB-PANEL: Thất Tinh Trận */}
      {drawMode === "seven" && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#191510] border border-[#423424] rounded-2xl p-4 shadow-xl space-y-3"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-[#2C2216] pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C9A55A] animate-pulse" />
              <h4 className="text-xs sm:text-sm font-serif font-bold text-[#F3E7CF] flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-[#C9A55A]" />
                TRẬN PHÁP THẤT TINH (7 LÁ BÀI DỊCH HỌC)
              </h4>
            </div>
            <span className="text-[11px] text-[#A2927C]">
              Bố cục 3 tầng: Đỉnh (Gợi ý) • Giữa (Bản thân - Hiện tại) • Đáy (Quá khứ & Chướng ngại)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 text-xs">
            {SEVEN_STARS_POSITIONS.map((pos) => (
              <div key={pos.id} className="bg-[#14110E] p-2.5 rounded-xl border border-[#2D2216] flex flex-col justify-between">
                <span className="text-[#C9A55A] font-serif font-bold flex items-center gap-1 mb-1 text-[11px]">
                  <span className="w-4 h-4 rounded bg-[#2D2114] text-[#C9A55A] text-[10px] flex items-center justify-center font-mono shrink-0">
                    {pos.id}
                  </span>
                  <span className="truncate">{pos.name}</span>
                </span>
                <p className="text-[10px] text-[#9E8E79] leading-tight line-clamp-2">
                  {pos.description}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 9-CARD DRAW SUB-PANEL: Cửu Cung Phong Thủy */}
      {drawMode === "nine" && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#191510] border border-[#423424] rounded-2xl p-4 shadow-xl space-y-3"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-[#2C2216] pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C9A55A] animate-pulse" />
              <h4 className="text-xs sm:text-sm font-serif font-bold text-[#F3E7CF] flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-[#C9A55A]" />
                TRẬN PHÁP CỬU CUNG PHONG THỦY (9 LÁ BÀI - PHI TINH LẠC THƯ)
              </h4>
            </div>
            <span className="text-[11px] text-[#EAD8B1] font-medium">
              Quỹ đạo phi tinh: <strong>Ở giữa là 5 ➔ Tây Bắc là 6 ➔ Chính Tây là 7...</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="bg-[#14110E] p-2.5 rounded-xl border border-[#2D2216]">
              <span className="text-[#C9A55A] font-serif font-bold text-[11px] block mb-1">
                ▲ Dòng 1 (Phía Nam):
              </span>
              <p className="text-[11px] text-[#A89882] leading-relaxed">
                Đông Nam (Tốn • Lá 9) • Chính Nam (Ly • Lá 5) • Tây Nam (Khôn • Lá 7)
              </p>
            </div>
            <div className="bg-[#17130F] p-2.5 rounded-xl border border-[#483724] shadow-inner">
              <span className="text-[#E6D3A3] font-serif font-bold text-[11px] block mb-1">
                ✦ Dòng 2 (Hàng Giữa):
              </span>
              <p className="text-[11px] text-[#C4B49D] leading-relaxed">
                Chính Đông (Chấn • Lá 8) • <strong className="text-[#E6D3A3]">Trung Cung (Ở giữa • Lá 1)</strong> • Chính Tây (Đoài • Lá 3)
              </p>
            </div>
            <div className="bg-[#14110E] p-2.5 rounded-xl border border-[#2D2216]">
              <span className="text-[#C9A55A] font-serif font-bold text-[11px] block mb-1">
                ▼ Dòng 3 (Phía Bắc):
              </span>
              <p className="text-[11px] text-[#A89882] leading-relaxed">
                Đông Bắc (Cấn • Lá 4) • Chính Bắc (Khảm • Lá 6) • Tây Bắc (Càn • Lá 2)
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* 10-CARD / 11-CARD DRAW SUB-PANEL: Thập Tinh Trận & Thập Tinh Mở Rộng */}
      {(drawMode === "ten" || drawMode === "ten_expanded") && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#191510] border border-[#423424] rounded-2xl p-4 shadow-xl space-y-3"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2C2216] pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C9A55A] animate-pulse" />
              <h4 className="text-xs sm:text-sm font-serif font-bold text-[#F3E7CF] flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-[#C9A55A]" />
                {drawMode === "ten_expanded"
                  ? "TRẬN PHÁP THẬP TINH MỞ RỘNG (11 LÁ • QUẺ THỨ 2 BỐC 2 LÁ 2A & 2B)"
                  : "TRẬN PHÁP THẬP TINH CHUẨN (10 LÁ BÀI TOÀN DIỆN)"}
              </h4>
            </div>

            {/* Quick Switch between 10-star Standard and 11-star Expanded */}
            <div className="flex items-center gap-1.5 bg-[#120F0C] p-1 rounded-xl border border-[#2D2216] text-[11px]">
              <button
                type="button"
                onClick={() => {
                  setDrawMode("ten");
                  setSelectedDeckIndices([]);
                  setRevealedCards([]);
                }}
                className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                  drawMode === "ten"
                    ? "bg-[#C89B3C] text-[#121110] font-bold shadow-sm"
                    : "text-[#A2927C] hover:text-white"
                }`}
              >
                Chuẩn (10 Lá)
              </button>
              <button
                type="button"
                onClick={() => {
                  setDrawMode("ten_expanded");
                  setSelectedDeckIndices([]);
                  setRevealedCards([]);
                }}
                className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                  drawMode === "ten_expanded"
                    ? "bg-[#C89B3C] text-[#121110] font-bold shadow-sm"
                    : "text-[#A2927C] hover:text-white"
                }`}
              >
                <Sparkles className="w-3 h-3 text-inherit" />
                Mở Rộng 2A & 2B (11 Lá)
              </button>
            </div>
          </div>

          {/* Orientation status controls for Position 2 */}
          {drawMode === "ten" ? (
            <div className="flex flex-wrap items-center justify-between gap-2 bg-[#120F0C] p-2 rounded-xl border border-[#2A2016]">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#C5B39A]">Thế quẻ thứ 2:</span>
                <span
                  className={`text-[11px] font-serif font-bold px-2.5 py-0.5 rounded-full border ${
                    isCard2Reversed
                      ? "bg-red-950/80 text-red-300 border-red-700/80"
                      : "bg-amber-950/80 text-amber-300 border-amber-600/80"
                  }`}
                >
                  Lá 2: {isCard2Reversed ? "NGƯỢC (Trở Ngại)" : "XUÔI (Hỗ Trợ)"}
                </span>
                <button
                  type="button"
                  onClick={() => setIsCard2Reversed((prev) => !prev)}
                  className="text-[11px] text-[#C9A55A] hover:underline cursor-pointer font-medium"
                >
                  [Đổi thế bài]
                </button>
              </div>
              <span className="text-[10px] text-[#8C7D6B] italic">
                *Khi bốc bài, xuôi/ngược được tự động ngẫu nhiên hoá 50/50 theo vận khí.
              </span>
            </div>
          ) : (
            <div className="space-y-2 bg-[#120F0C] p-2.5 rounded-xl border border-[#2A2016]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-[#E5D2B8] font-medium">Quẻ thứ 2 (Hỗ Trợ hoặc Trở Ngại):</span>
                  
                  {/* Card 2A Pill */}
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-[11px] font-serif font-bold px-2 py-0.5 rounded-lg border ${
                        isCard2AReversed
                          ? "bg-red-950/80 text-red-300 border-red-700/80"
                          : "bg-emerald-950/80 text-emerald-300 border-emerald-700/80"
                      }`}
                    >
                      2A: {isCard2AReversed ? "NGƯỢC (Trở Ngại)" : "THUẬN (Hỗ Trợ)"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsCard2AReversed((prev) => !prev)}
                      className="text-[10px] text-[#A2927C] hover:text-white underline cursor-pointer"
                    >
                      [Đổi 2A]
                    </button>
                  </div>

                  {/* Card 2B Pill */}
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-[11px] font-serif font-bold px-2 py-0.5 rounded-lg border ${
                        isCard2BReversed
                          ? "bg-red-950/80 text-red-300 border-red-700/80"
                          : "bg-emerald-950/80 text-emerald-300 border-emerald-700/80"
                      }`}
                    >
                      2B: {isCard2BReversed ? "NGƯỢC (Trở Ngại)" : "THUẬN (Hỗ Trợ)"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsCard2BReversed((prev) => !prev)}
                      className="text-[10px] text-[#A2927C] hover:text-white underline cursor-pointer"
                    >
                      [Đổi 2B]
                    </button>
                  </div>
                </div>

                {/* Overall Combo Badge */}
                <div>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#201A13] border border-[#483624] text-[#F3D389] font-bold">
                    {!isCard2AReversed && !isCard2BReversed && "✦ Cùng Thuận: Đại Cát Trợ Lực"}
                    {isCard2AReversed && isCard2BReversed && "⚠ Cùng Nghịch: Trùng Điệp Trở Ngại"}
                    {!isCard2AReversed && isCard2BReversed && "⚖ Thuận - Nghịch: Đan Xen Lực Cản"}
                    {isCard2AReversed && !isCard2BReversed && "❖ Nghịch - Thuận: Vượt Khó Được Trợ"}
                  </span>
                </div>
              </div>

              {/* Quick combo buttons */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-[#231A12] text-[10px]">
                <span className="text-[#847563]">Chọn nhanh thế bài:</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsCard2AReversed(false);
                    setIsCard2BReversed(false);
                  }}
                  className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                    !isCard2AReversed && !isCard2BReversed
                      ? "bg-emerald-900/60 border-emerald-500 text-emerald-200 font-bold"
                      : "bg-[#181410] border-[#332619] text-[#A2927C] hover:text-white"
                  }`}
                >
                  Cùng Thuận
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCard2AReversed(true);
                    setIsCard2BReversed(true);
                  }}
                  className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                    isCard2AReversed && isCard2BReversed
                      ? "bg-red-900/60 border-red-500 text-red-200 font-bold"
                      : "bg-[#181410] border-[#332619] text-[#A2927C] hover:text-white"
                  }`}
                >
                  Cùng Nghịch
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCard2AReversed(false);
                    setIsCard2BReversed(true);
                  }}
                  className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                    !isCard2AReversed && isCard2BReversed
                      ? "bg-amber-900/60 border-amber-500 text-amber-200 font-bold"
                      : "bg-[#181410] border-[#332619] text-[#A2927C] hover:text-white"
                  }`}
                >
                  Thuận - Nghịch
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCard2AReversed(true);
                    setIsCard2BReversed(false);
                  }}
                  className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                    isCard2AReversed && !isCard2BReversed
                      ? "bg-amber-900/60 border-amber-500 text-amber-200 font-bold"
                      : "bg-[#181410] border-[#332619] text-[#A2927C] hover:text-white"
                  }`}
                >
                  Nghịch - Thuận
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-6 gap-2 text-xs">
            {(drawMode === "ten_expanded" ? TEN_STARS_EXPANDED_POSITIONS : TEN_STARS_POSITIONS).map((pos) => (
              <div key={pos.id} className="bg-[#14110E] p-2.5 rounded-xl border border-[#2D2216] flex flex-col justify-between">
                <span className="text-[#C9A55A] font-serif font-bold flex items-center gap-1 mb-1 text-[11px]">
                  <span className="w-4 h-4 rounded bg-[#2D2114] text-[#C9A55A] text-[10px] flex items-center justify-center font-mono shrink-0">
                    {pos.id}
                  </span>
                  <span className="truncate">{pos.name}</span>
                </span>
                <p className="text-[10px] text-[#9E8E79] leading-tight line-clamp-2">
                  {pos.description}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 12-CARD DRAW SUB-PANEL: 12 Địa Chi & 12 Cung Tử Vi */}
      {drawMode === "twelve" && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#191510] border border-[#423424] rounded-2xl p-4 shadow-xl space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2C2216] pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C9A55A] animate-pulse shadow-[0_0_8px_#C9A55A]" />
              <h4 className="text-xs sm:text-sm font-serif font-bold text-[#F3E7CF] flex items-center gap-1.5">
                <Dices className="w-4 h-4 text-[#C9A55A]" />
                TRẬN PHÁP 12 ĐỊA CHI & 12 CUNG TỬ VI (12 LÁ BÀI DỊCH HỌC)
              </h4>
            </div>
            <div className="flex items-center flex-wrap gap-2 text-[11px] text-[#EAD8B1]">
              <span>Bàn Tử Vi: <strong>4 lá ngang x 4 lá dọc</strong></span>
              <span className="text-[#8C7D6A]">•</span>
              <button
                type="button"
                onClick={() => setIsReverseHouses(!isReverseHouses)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#271E15] hover:bg-[#34271A] text-[#E6D3A3] border border-[#483724] transition-colors cursor-pointer"
                title="Bấm để đảo chiều xoay 12 Cung Tử Vi"
              >
                <RotateCw className={`w-3 h-3 transition-transform duration-300 ${isReverseHouses ? "rotate-180 text-[#FFA07A]" : "text-[#C9A55A]"}`} />
                <span>Chiều xoay: <strong>{isReverseHouses ? "Xoay Nghịch (Dần ➔ Sửu)" : "Xoay Thuận (Dần ➔ Mão)"}</strong> (Đảo)</span>
              </button>
            </div>
          </div>

          {/* KHU VỰC GIEO XÚC XẮC 12 MẶT NGAY TẠI CHỖ BỐC BÀI */}
          <div className="bg-[#130F0C] p-3 sm:p-4 rounded-xl border border-[#3E2E1D]">
            <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-[#2A1F14]">
              <span className="text-xs font-serif font-bold text-[#E6D3A3] flex items-center gap-1.5">
                <Dices className="w-4 h-4 text-[#C9A55A]" />
                GIEO XÚC XẮC 12 MẶT ĐỊNH MỆNH CUNG (TRỰC TIẾP TẠI BÀN BỐC BÀI)
              </span>
              <span className="text-[11px] font-mono text-[#C9A55A] bg-[#241B12] px-2 py-0.5 rounded border border-[#473420]">
                Mệnh Cung hiện tại: Chi {TWELVE_BRANCHES_DATA.find((b) => b.number === menhBranchNumber)?.name} (Số {menhBranchNumber})
              </span>
            </div>
            <TwelveSidedDice
              value={menhBranchNumber}
              onRoll={(num) => setMenhBranchNumber(num)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="bg-[#14110E] p-2.5 rounded-xl border border-[#2D2216]">
              <span className="text-[#C9A55A] font-serif font-bold text-[11px] block mb-1">
                ✦ 12 Vị Trí Địa Chi & 12 Tháng:
              </span>
              <p className="text-[11px] text-[#A89882] leading-relaxed">
                Tý (Tháng 11), Sửu (Tháng Chạp), <strong className="text-[#E6D3A3]">Dần (Tháng Giêng)</strong>, Mão (Tháng 2), Thìn (Tháng 3)... Hợi (Tháng 10).
              </p>
            </div>
            <div className="bg-[#17130F] p-2.5 rounded-xl border border-[#483724] shadow-inner">
              <span className="text-[#E6D3A3] font-serif font-bold text-[11px] block mb-1">
                🎲 Quy Luật Gieo Xúc Xắc:
              </span>
              <p className="text-[11px] text-[#C4B49D] leading-relaxed">
                Gieo được số nào thì <strong className="text-[#E6D3A3]">Cung Mệnh</strong> an tại Chi đó. 11 Cung an luân chuyển <strong>{isReverseHouses ? "nghịch chiều (Dần ➔ Sửu ➔ Tý...)" : "thuận chiều (Dần ➔ Mão ➔ Thìn...)"}</strong>.
              </p>
            </div>
            <div className="bg-[#14110E] p-2.5 rounded-xl border border-[#2D2216]">
              <span className="text-[#C9A55A] font-serif font-bold text-[11px] block mb-1">
                ★ Thứ Tự Chuẩn 12 Cung Tử Vi:
              </span>
              <p className="text-[11px] text-[#A89882] leading-relaxed">
                Cung Mệnh ➔ Phụ Mẫu ➔ Phúc Đức ➔ Điền Trạch ➔ Quan Lộc ➔ Nô Bộc ➔ Thiên Di ➔ Tật Ách ➔ Tài Bạch ➔ Tử Tức ➔ Phu Thê ➔ Huynh Đệ.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* TRẬN PHÁP NGŨ HÀNH (5 LÁ) SUB-BANNER CHUẨN TRANG CHỦ */}
      {drawMode === "custom" && customCount === 5 && (
        <JadeCommandPanel
          badgeIcon="✦"
          title="Trận Pháp Ngũ Hành (5 Lá · Kim Mộc Thủy Hỏa Thổ)"
          rightSlot={
            <span className="text-[11px] font-serif font-bold text-[#6E4E16] bg-[#FAF0D7] px-2.5 py-0.5 rounded-full border border-[#C4963E]/55">
              Chuẩn Sân Khấu Định Mệnh Trang Chủ
            </span>
          }
        >
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-serif">
            {[
              { label: "1. Hành Kim", desc: "Cương quyết & Nguyên tắc", color: "text-amber-900 bg-amber-50 border-amber-300" },
              { label: "2. Hành Mộc", desc: "Sinh trưởng & Khởi phát", color: "text-emerald-900 bg-emerald-50 border-emerald-300" },
              { label: "3. Hành Thủy", desc: "Trí tuệ & Linh hoạt", color: "text-sky-900 bg-sky-50 border-sky-300" },
              { label: "4. Hành Hỏa", desc: "Nhiệt huyết & Danh vọng", color: "text-rose-900 bg-rose-50 border-rose-300" },
              { label: "5. Hành Thổ", desc: "Trung tâm & Nền tảng", color: "text-yellow-900 bg-yellow-50 border-yellow-400" },
            ].map((item) => (
              <div key={item.label} className={`p-2 rounded-xl border ${item.color} flex flex-col justify-center`}>
                <span className="font-bold text-xs">{item.label}</span>
                <span className="text-[10.5px] opacity-85">{item.desc}</span>
              </div>
            ))}
          </div>
        </JadeCommandPanel>
      )}

      {/* CUSTOM SPREAD SUB-PANEL: TÙY Ý NHẬP SỐ LÁ BÀI & MỤC ĐÍCH TỪNG LÁ */}
      {drawMode === "custom" && customCount !== 5 && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#191510] border border-[#423424] rounded-2xl p-4 sm:p-5 shadow-xl space-y-4"
        >
          {/* Header & Number of Cards Input */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2C2216] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C9A55A] shadow-[0_0_8px_#C9A55A]" />
                <h4 className="text-xs sm:text-sm font-serif font-bold text-[#F3E7CF] flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-[#C9A55A]" />
                  TRẬN PHÁP TỰ DO: TÙY Ý NHẬP SỐ LÁ & MỤC ĐÍCH XEM
                </h4>
              </div>
              <p className="text-[11px] text-[#A2927C] mt-0.5">
                Bạn có thể bốc bao nhiêu lá tùy ý (như 4, 6, 8, 12 lá...). Thiết lập mục đích xem cho từng lá bằng cách tự điền hoặc chọn gợi ý bên dưới.
              </p>
            </div>

            {/* Input số lượng lá bài */}
            <div className="flex items-center gap-2 bg-[#120F0C] border border-[#3D3120] rounded-xl px-3 py-1.5 shrink-0">
              <span className="text-xs text-[#C8B89E] font-medium font-serif">Số lá bài:</span>
              <input
                type="number"
                min={1}
                max={deckCount * 64}
                value={customCountInput}
                onChange={(e) => handleCustomCountChange(e.target.value)}
                className="w-14 bg-[#1A140F] border border-[#4B3B28] rounded text-center text-sm font-mono font-bold text-[#C9A55A] outline-none focus:border-[#C9A55A] py-0.5"
                title={`Nhập số lá bài từ 1 đến ${deckCount * 64} lá`}
              />
              <span className="text-xs text-[#8E806E]">lá (1-{deckCount * 64})</span>
            </div>
          </div>

          {/* Quick Count Selection Chips */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] text-[#8E7E6A] font-medium font-serif">Phím chọn nhanh:</span>
            {[3, 4, 5, 6, 8, 10, 12, 16].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => applyCustomCount(num)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer border ${
                  customCount === num
                    ? "bg-[#C9A55A] text-[#120F0C] font-bold border-[#C9A55A] shadow"
                    : "bg-[#14110E] text-[#A89882] border-[#312519] hover:text-[#FFF] hover:border-[#4B3926]"
                }`}
              >
                {num} lá {num === 6 ? "(Lục Hào)" : num === 12 ? "(12 Tháng / 12 Cung)" : ""}
              </button>
            ))}
          </div>

          {/* Preset Templates Bar */}
          <div className="bg-[#14100D] border border-[#2F2417] rounded-xl p-3 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <span className="text-xs font-serif font-bold text-[#EAD8B1] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C9A55A]" />
                Mẫu trận pháp chuyên sâu có sẵn:
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAutoSuggestAll}
                  className="text-[11px] font-medium text-[#C9A55A] hover:underline cursor-pointer flex items-center gap-1 font-serif"
                >
                  ⚡ Gợi ý tự động cho {customCount} lá
                </button>
                <span className="text-[#3E3224]">|</span>
                <button
                  type="button"
                  onClick={handleClearAllPurposes}
                  className="text-[11px] text-[#8E7E6A] hover:text-[#C8B89E] cursor-pointer"
                >
                  Xóa trắng
                </button>
              </div>
            </div>

            {/* Template buttons */}
            <div className="flex flex-wrap gap-1.5">
              {CUSTOM_SPREAD_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => applyTemplate(tpl)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    customCount === tpl.count
                      ? "bg-[#271E14] text-[#F3E7CF] border-[#5E482F] hover:border-[#C9A55A] font-semibold"
                      : "bg-[#100D0A] text-[#887A68] border-[#221A11] hover:text-[#C8B89E]"
                  }`}
                  title={`${tpl.description} (Bấm để áp dụng)`}
                >
                  {tpl.name}
                </button>
              ))}
            </div>
          </div>

          {/* Card Positions: Purpose Input & Suggestions List ("phần dưới trận pháp sẽ điền mục đích lá đó xem là gì, tự điền hoặc gợi ý") */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-serif font-bold text-[#F3E7CF] flex items-center gap-1.5">
                <span>DANH SÁCH MỤC ĐÍCH XEM TỪNG LÁ BÀI ({customCount} LÁ):</span>
              </span>
              <span className="text-[11px] text-[#8E7E6A]">
                Tự gõ hoặc nhấn vào các nhãn gợi ý bên dưới mỗi ô
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#3F3325] scrollbar-track-[#171410]">
              {Array.from({ length: customCount }).map((_, idx) => (
                <div
                  key={idx}
                  className="bg-[#14100D] border border-[#2D2216] rounded-xl p-2.5 space-y-1.5 hover:border-[#4B3A26] transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold text-[#C9A55A] bg-[#221910] px-2 py-1 rounded border border-[#3E2E1D] shrink-0">
                      Lá #{idx + 1}
                    </span>
                    <input
                      type="text"
                      value={customPurposes[idx] || ""}
                      onChange={(e) => handlePurposeChange(idx, e.target.value)}
                      placeholder={`Mục đích xem lá ${idx + 1} (Ví dụ: Căn nguyên, Quý nhân, Trở ngại...)`}
                      className="w-full bg-[#0D0B08] border border-[#34271A] focus:border-[#C9A55A] rounded-lg px-2.5 py-1 text-xs text-[#EAE2D2] outline-none transition-colors"
                    />
                  </div>

                  {/* Gợi ý nhanh: Quick suggestion chips for this specific card */}
                  <div className="flex items-center gap-1 overflow-x-auto py-0.5 scrollbar-none text-[10px]">
                    <span className="text-[#6D604E] shrink-0 text-[9px] uppercase font-mono">Gợi ý:</span>
                    {CUSTOM_PURPOSE_SUGGESTIONS.slice(0, 8).map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => handlePurposeChange(idx, `Lá ${idx + 1}: ${sug}`)}
                        className="shrink-0 px-1.5 py-0.5 rounded bg-[#1C1610] hover:bg-[#2B2117] text-[#A69780] hover:text-[#C9A55A] border border-[#2B2116] hover:border-[#3F3120] transition-colors cursor-pointer"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Interactive Deck Layout: Sân Khấu Giấy Tuyên Thành & Tinh Bàn Bát Quái Vàng Kim */}
      <XuanBaguaStage baguaSize="xl">
        {/* Shuffling 3D Realistic Animation Overlay */}
        <AnimatePresence>
          {isShuffling && (
            <ShuffleDeckAnimation
              cardBackUrl={cardBackImage}
              durationMs={5500}
              onShuffleComplete={() => setIsShuffling(false)}
            />
          )}
        </AnimatePresence>

        {/* Deck Controls Bar & Layout Switcher (Đồng bộ Ngọc Giản Kính Mờ) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 p-3 rounded-2xl bg-[#FAF6EE]/95 border border-[#C4963E]/45 shadow-xs">
          <div className="flex items-center gap-3 flex-wrap text-xs text-[#4A3B28]">
            <div>
              Đã chọn:{" "}
              <span className="font-bold text-[#6E4E16] font-mono text-sm">
                {selectedDeckIndices.length} / {targetCount} lá
              </span>
              {drawMode === "single" && (
                <span className="text-[#807261] ml-2">(Rút 1 lá giải đáp tổng quát)</span>
              )}
              {drawMode === "double" && doubleSpreadMode === "present_future" && (
                <span className="text-[#A4947D] ml-2">
                  ({selectedDeckIndices.length === 0 ? "Lượt 1: Thỉnh lá Hiện Tại" : "Lượt 2: Thỉnh lá Tương Lai"})
                </span>
              )}
              {drawMode === "double" && doubleSpreadMode === "choice_ab" && (
                <span className="text-[#A4947D] ml-2">
                  ({selectedDeckIndices.length === 0 ? `Lượt 1: Thỉnh lá [${choiceALabel.trim() || "Lựa chọn A"}]` : `Lượt 2: Thỉnh lá [${choiceBLabel.trim() || "Lựa chọn B"}]`})
                </span>
              )}
              {drawMode === "three" && threeSpreadMode === "choice_abc" && (
                <span className="text-[#C9A55A] font-medium ml-2">
                  ({selectedDeckIndices.length === 0
                    ? `Lượt 1: Thỉnh lá [${choiceALabel.trim() || "Lựa chọn A"}]`
                    : selectedDeckIndices.length === 1
                    ? `Lượt 2: Thỉnh lá [${choiceBLabel.trim() || "Lựa chọn B"}]`
                    : `Lượt 3: Thỉnh lá [${choiceCLabel.trim() || "Lựa chọn C"}]`})
                </span>
              )}
              {drawMode === "three" && threeSpreadMode === "tam_tai" && (
                <span className="text-[#C9A55A] font-medium ml-2">
                  ({selectedDeckIndices.length === 0
                    ? "Lượt 1: Thỉnh lá THIÊN (Thiên Thời / Hoàn Cảnh Khách Quan)"
                    : selectedDeckIndices.length === 1
                    ? "Lượt 2: Thỉnh lá ĐỊA (Địa Lợi / Nền Tảng Môi Trường)"
                    : "Lượt 3: Thỉnh lá NHÂN (Nhân Hòa / Con Người & Hành Động)"})
                </span>
              )}
              {drawMode === "three" && threeSpreadMode === "ngu_che" && (
                <span className="text-[#F3D787] font-bold ml-2">
                  ({selectedDeckIndices.length === 0
                    ? "Lượt 1: Thỉnh lá THIÊN (Đạo Trời)"
                    : selectedDeckIndices.length === 1
                    ? "Lượt 2: Thỉnh lá ĐỊA (Đạo Đất)"
                    : "Lượt 3: Thỉnh lá NHÂN (Lá Cuối Cùng — Lấy Làm Quẻ Chủ Ngự Chế)"})
                </span>
              )}
              {drawMode === "three" && threeSpreadMode === "past_present_future" && (
                <span className="text-[#C9A55A] font-medium ml-2">
                  ({selectedDeckIndices.length === 0
                    ? "Lượt 1: Thỉnh lá Quá Khứ"
                    : selectedDeckIndices.length === 1
                    ? "Lượt 2: Thỉnh lá Hiện Tại"
                    : "Lượt 3: Thỉnh lá Tương Lai"})
                </span>
              )}
              {drawMode === "seven" && (
                <span className="text-[#C9A55A] font-medium ml-2">
                  ({selectedDeckIndices.length < 7
                    ? `Lượt ${selectedDeckIndices.length + 1}: Thỉnh ${SEVEN_STARS_POSITIONS[selectedDeckIndices.length]?.name}`
                    : "Đã đủ 7 lá Thất Tinh"})
                </span>
              )}
              {drawMode === "nine" && (
                <span className="text-[#C9A55A] font-medium ml-2">
                  ({selectedDeckIndices.length < 9
                    ? `Lượt ${selectedDeckIndices.length + 1}: Thỉnh ${NINE_PALACES_POSITIONS[selectedDeckIndices.length]?.name}`
                    : "Đã đủ 9 lá Cửu Cung Phong Thủy"})
                </span>
              )}
              {drawMode === "ten" && (
                <span className="text-[#C9A55A] font-medium ml-2">
                  ({selectedDeckIndices.length < 10
                    ? `Lượt ${selectedDeckIndices.length + 1}: Thỉnh ${TEN_STARS_POSITIONS[selectedDeckIndices.length]?.name}`
                    : "Đã đủ 10 lá Thập Tinh"})
                </span>
              )}
              {drawMode === "ten_expanded" && (
                <span className="text-[#C9A55A] font-medium ml-2">
                  ({selectedDeckIndices.length < 11
                    ? `Lượt ${selectedDeckIndices.length + 1}: Thỉnh ${TEN_STARS_EXPANDED_POSITIONS[selectedDeckIndices.length]?.name}`
                    : "Đã đủ 11 lá Thập Tinh Mở Rộng"})
                </span>
              )}
              {drawMode === "twelve" && (
                <span className="text-[#C9A55A] font-medium ml-2">
                  ({selectedDeckIndices.length < 12
                    ? `Lượt ${selectedDeckIndices.length + 1}: Thỉnh lá Chi ${TWELVE_BRANCHES_DATA[selectedDeckIndices.length]?.name} (${TWELVE_BRANCHES_DATA[selectedDeckIndices.length]?.lunarMonth}) • ${getHouseForBranch(TWELVE_BRANCHES_DATA[selectedDeckIndices.length]?.number, menhBranchNumber, isReverseHouses).name}`
                    : "Đã đủ 12 lá Tử Vi"})
                </span>
              )}
              {drawMode === "custom" && (
                <span className="text-[#C9A55A] font-medium ml-2">
                  ({selectedDeckIndices.length < customCount
                    ? `Lượt ${selectedDeckIndices.length + 1}: Thỉnh lá #${selectedDeckIndices.length + 1} (${customPurposes[selectedDeckIndices.length] || "Mục đích xem"})`
                    : `Đã đủ ${customCount} lá bài tự chọn`})
                </span>
              )}
            </div>

            <div className="h-3 w-px bg-[#3E3224]" />

            {/* Layout Mode Toggle: Xòe quạt 360° đa tầng vs Dải xòe ngang vs Chiếu 64 lá */}
            <div className="inline-flex items-center p-0.5 bg-[#120F0C] border border-[#34291D] rounded-lg">
              <button
                onClick={() => setDeckViewMode("fan360")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                  deckViewMode === "fan360"
                    ? "bg-[#C89B3C] text-[#121110] font-bold shadow"
                    : "text-[#9E907D] hover:text-[#FFF]"
                }`}
                title="Xòe quạt 360° đa tầng nhiều lớp bài Bát Quái Thiên Địa (Mặc định)"
              >
                <Compass className="w-3.5 h-3.5" />
                Xòe Quạt 360° Đa Tầng
              </button>
              <button
                onClick={() => setDeckViewMode("fan")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                  deckViewMode === "fan"
                    ? "bg-[#C89B3C] text-[#121110] font-bold shadow"
                    : "text-[#9E907D] hover:text-[#FFF]"
                }`}
                title="Xòe toàn bộ 64 lá theo dải bài trượt ngang"
              >
                <Layers className="w-3.5 h-3.5" />
                Dải Xòe Ngang
              </button>
              <button
                onClick={() => setDeckViewMode("grid")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                  deckViewMode === "grid"
                    ? "bg-[#C89B3C] text-[#121110] font-bold shadow"
                    : "text-[#9E907D] hover:text-[#FFF]"
                }`}
                title="Hiện toàn bộ 64 lá bài trải đều dạng bảng Bát Quái 8x8"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Chiếu Bàn 64 Lá
              </button>
            </div>

            {/* 3D Parallax Indicator */}
            <span
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#19140F] text-[11px] font-mono text-[#C9A55A] border border-[#3C2F21] shadow-xs select-none"
              title="Hiệu ứng 3D Parallax: Lá bài nghiêng đa chiều, đổ bóng nổi bề mặt và phản chiếu ánh sáng khi di chuột"
            >
              <Sparkles className="w-3 h-3 text-[#C9A55A]" />
              3D Parallax
            </span>
          </div>

          {drawMode === "twelve" && (
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <TwelveSidedDice
                value={menhBranchNumber}
                onRoll={(num) => setMenhBranchNumber(num)}
                compact={true}
              />
            </div>
          )}
        </div>

        {/* Nghi thức Tam Tài khi bốc ngẫu nhiên (Lần 1: Kính Thiên, Lần 2: Kính Địa, Lần 3: Kính Nhân) */}
        {quickDrawRitualMsg && (
          <div className="mx-auto max-w-2xl my-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-[#241B12] via-[#2F2115] to-[#1C140D] border-2 border-[#C9A55A] shadow-[0_0_30px_rgba(212,175,55,0.35)] flex items-center justify-between gap-3 transition-all animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-full border-2 flex items-center justify-center text-sm font-serif font-bold shadow-md shrink-0 ${
                  quickDrawRitualMsg.step === 1
                    ? "bg-[#251A10] border-[#C9A55A] text-[#E6D3A3]"
                    : quickDrawRitualMsg.step === 2
                    ? "bg-[#2B1B10] border-[#E5A93C] text-[#FFD700]"
                    : "bg-[#331C0E] border-[#FFD700] text-[#FFF] animate-pulse"
                }`}
              >
                {quickDrawRitualMsg.step}/3
              </div>
              <div>
                <div className="text-xs sm:text-sm font-serif font-bold text-[#E6D3A3] flex items-center gap-2">
                  <span>{quickDrawRitualMsg.title}</span>
                  <span className="text-[#C9A55A] font-serif bg-[#14100B] px-2 py-0.5 rounded border border-[#53412B] text-xs">
                    {quickDrawRitualMsg.hanzi}
                  </span>
                </div>
                <div className="text-[11px] sm:text-xs text-[#EAD8B1] leading-snug mt-1">
                  {quickDrawRitualMsg.meaning}
                </div>
              </div>
            </div>
            <div className="text-[11px] font-serif font-bold text-[#C9A55A] bg-[#14100C] border border-[#53412B] px-3 py-1.5 rounded-xl shrink-0 hidden sm:block text-right shadow-inner">
              {quickDrawRitualMsg.instruction}
            </div>
          </div>
        )}

        {/* 0. 360-DEGREE MULTI-TIER RADIAL FAN (MẶC ĐỊNH) */}
        {deckViewMode === "fan360" && (
          <div className="py-2 space-y-3">
            {/* If separate mode with deckCount >= 2: show active deck switcher */}
            {multiDeckMode === "separate" && deckCount >= 2 && (
              <div className="bg-[#18140F] border border-[#3C2E1E] rounded-xl p-2.5 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#C9A55A] font-serif font-bold flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    Vòng Quạt 360° Đang Mở:
                  </span>
                  <span className="text-xs text-[#EAD8B1] font-bold">Bộ bài #{activeDeckIndex}</span>
                  <span className="text-[11px] text-[#A89882]">
                    (Đã bốc {(selectedIndicesByDeck[activeDeckIndex] || []).length}/64 lá)
                  </span>
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  {Array.from({ length: deckCount }, (_, i) => i + 1).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setActiveDeckIndex(d)}
                      className={`px-2.5 py-1 text-xs font-serif rounded-lg border transition-all cursor-pointer ${
                        activeDeckIndex === d
                          ? "bg-[#C9A55A] text-[#120F0C] font-bold border-[#C9A55A]"
                          : "bg-[#14100D] text-[#A89882] border-[#342718] hover:text-[#FFF]"
                      }`}
                    >
                      Bộ #{d}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* If combined mode with deckCount >= 2: show slice switcher (Fan360 displays 64 cards per ring) */}
            {multiDeckMode === "combined" && deckCount >= 2 && (
              <div className="bg-[#18140F] border border-[#3C2E1E] rounded-xl p-2.5 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#C9A55A] font-serif font-bold flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    Tầng Quạt 360° (64 lá/tầng):
                  </span>
                  <span className="text-xs text-[#EAD8B1] font-bold">
                    Cụm #{activeSubDeckSlice} (Lá {(activeSubDeckSlice - 1) * 64 + 1} - {activeSubDeckSlice * 64})
                  </span>
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  {Array.from({ length: deckCount }, (_, i) => i + 1).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setActiveSubDeckSlice(s)}
                      className={`px-2.5 py-1 text-xs font-serif rounded-lg border transition-all cursor-pointer ${
                        activeSubDeckSlice === s
                          ? "bg-[#C9A55A] text-[#120F0C] font-bold border-[#C9A55A]"
                          : "bg-[#14100D] text-[#A89882] border-[#342718] hover:text-[#FFF]"
                      }`}
                    >
                      Cụm #{s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Fan360Deck
              deck={
                multiDeckMode === "separate" && deckCount >= 2
                  ? separateDecks[activeDeckIndex] || []
                  : deckCount >= 2
                  ? combinedDeck.slice((activeSubDeckSlice - 1) * 64, activeSubDeckSlice * 64)
                  : combinedDeck
              }
              selectedIndices={
                multiDeckMode === "separate" && deckCount >= 2
                  ? selectedIndicesByDeck[activeDeckIndex] || []
                  : deckCount >= 2
                  ? selectedDeckIndices
                      .filter(
                        (i) =>
                          i >= (activeSubDeckSlice - 1) * 64 &&
                          i < activeSubDeckSlice * 64
                      )
                      .map((i) => i - (activeSubDeckSlice - 1) * 64)
                  : selectedDeckIndices
              }
              onSelectCard={(localIdx) => {
                if (multiDeckMode === "separate" && deckCount >= 2) {
                  handleSelectCard(localIdx);
                } else if (deckCount >= 2) {
                  handleSelectCard((activeSubDeckSlice - 1) * 64 + localIdx);
                } else {
                  handleSelectCard(localIdx);
                }
              }}
              cardBackUrl={cardBackImage}
              targetCount={targetCount}
              onQuickDraw={handleQuickDraw}
              onShuffle={handleShuffle}
              isShuffling={isShuffling}
              quickDrawStep={quickDrawStep}
            />
          </div>
        )}

        {/* 1. GRID VIEW: FULL CARDS DISPLAYED */}
        {deckViewMode === "grid" && (
          <div className="py-2 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-[#8C7A62] gap-2 px-1">
              <span>
                {multiDeckMode === "separate" && deckCount >= 2
                  ? `Bàn trải Bộ Bài #${activeDeckIndex} (64 lá úp sẵn) • Nhấp vào lá bài bạn cảm ứng để thỉnh:`
                  : `Bàn trải ${deckCount * 64} lá bài úp sẵn • Nhấp vào lá bài bạn cảm ứng để thỉnh:`}
              </span>
              <span className="font-mono text-[#C9A55A]">
                {multiDeckMode === "separate" && deckCount >= 2
                  ? `Bộ #${activeDeckIndex} • 64 lá`
                  : `Tổng cộng ${deckCount * 64} lá`}
              </span>
            </div>

            {/* If separate mode: Deck switcher tabs */}
            {multiDeckMode === "separate" && deckCount >= 2 && (
              <div className="bg-[#18140F] border border-[#3C2E1E] rounded-xl p-2.5 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#C9A55A] font-serif font-bold">Chọn bộ bài hiển thị trên chiếu:</span>
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  {Array.from({ length: deckCount }, (_, i) => i + 1).map((d) => {
                    const isCur = activeDeckIndex === d;
                    const cnt = (selectedIndicesByDeck[d] || []).length;
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setActiveDeckIndex(d)}
                        className={`px-3 py-1 text-xs font-serif rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                          isCur
                            ? "bg-[#C9A55A] text-[#120F0C] font-bold border-[#C9A55A] shadow"
                            : "bg-[#14100D] text-[#A89882] border-[#342718] hover:text-[#FFF]"
                        }`}
                      >
                        <span>Bộ #{d}</span>
                        {cnt > 0 && <span className="text-[10px] font-mono">({cnt})</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* If combined mode and deckCount >= 2: Filter chip bar */}
            {multiDeckMode === "combined" && deckCount >= 2 && (
              <div className="bg-[#18140F] border border-[#3C2E1E] rounded-xl p-2.5 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#C9A55A] font-serif font-bold">Lọc hiển thị ({deckCount * 64} lá trộn chung):</span>
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setGridSubDeckFilter("all")}
                    className={`px-3 py-1 text-xs font-serif rounded-lg border transition-all cursor-pointer ${
                      gridSubDeckFilter === "all"
                        ? "bg-[#C9A55A] text-[#120F0C] font-bold border-[#C9A55A] shadow"
                        : "bg-[#14100D] text-[#A89882] border-[#342718] hover:text-[#FFF]"
                    }`}
                  >
                    Tất Cả ({deckCount * 64} lá)
                  </button>
                  {Array.from({ length: deckCount }, (_, i) => i + 1).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setGridSubDeckFilter(d)}
                      className={`px-2.5 py-1 text-xs font-serif rounded-lg border transition-all cursor-pointer ${
                        gridSubDeckFilter === d
                          ? "bg-[#C9A55A] text-[#120F0C] font-bold border-[#C9A55A] shadow"
                          : "bg-[#14100D] text-[#A89882] border-[#342718] hover:text-[#FFF]"
                      }`}
                    >
                      Phần #{d} (Lá {(d - 1) * 64 + 1} - {d * 64})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Action Bar docked right next to the Grid cards */}
            <div className="flex items-center justify-center gap-3 my-2.5 flex-wrap">
              {drawMode === "twelve" && (
                <TwelveSidedDice
                  value={menhBranchNumber}
                  onRoll={(num) => setMenhBranchNumber(num)}
                  compact={true}
                />
              )}
              <button
                type="button"
                onClick={handleShuffle}
                disabled={isShuffling}
                className="flex items-center gap-2 px-4 py-2 text-xs font-serif font-bold text-[#EAD8B1] hover:text-[#FFF] bg-[#221B14] hover:bg-[#2F241A] border border-[#53412B] hover:border-[#C9A55A] rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50 active:scale-95 group"
                title={`Xáo lại ${deckCount * 64} lá bài theo nghi thức cổ truyền (5.5 giây)`}
              >
                <Shuffle className={`w-3.5 h-3.5 text-[#C9A55A] ${isShuffling ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
                <span>Xáo Lại {deckCount > 1 ? `${deckCount} Bộ (${deckCount * 64} Lá)` : "64 Lá"}</span>
              </button>

              {/* Bật/Tắt Lật Úp Bàn Trải */}
              <button
                type="button"
                onClick={() => {
                  setGridCardsFlippedFront((prev) => !prev);
                  zenAudio.playCardFlipSound();
                }}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-serif font-bold rounded-xl border transition-all cursor-pointer active:scale-95 group ${
                  gridCardsFlippedFront
                    ? "bg-[#2A1F13] text-[#E6D3A3] border-[#C9A55A] ring-1 ring-[#C9A55A]/50"
                    : "bg-[#221B14] text-[#EAD8B1] hover:text-[#FFF] border-[#53412B] hover:border-[#C9A55A]"
                }`}
                title="Bật/Tắt lật úp toàn bộ lá bài trong bàn trải (Mặc định úp bài ☯)"
              >
                <span className="text-xs font-mono">{gridCardsFlippedFront ? "☯" : "卦"}</span>
                <span>{gridCardsFlippedFront ? "Lật Úp Bàn Trải (☯)" : "Lật Mở Xem 64 Lá (卦)"}</span>
              </button>

              {/* Bật/Tắt Xoay Bài Bàn Trải */}
              <button
                type="button"
                onClick={() => {
                  setGridCardsRotated((prev) => !prev);
                  zenAudio.playCardFlipSound();
                }}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-serif font-bold rounded-xl border transition-all cursor-pointer active:scale-95 group ${
                  gridCardsRotated
                    ? "bg-[#2A1F13] text-[#E6D3A3] border-[#C9A55A] ring-1 ring-[#C9A55A]/50"
                    : "bg-[#221B14] text-[#EAD8B1] hover:text-[#FFF] border-[#53412B] hover:border-[#C9A55A]"
                }`}
                title="Bật/Tắt xoay bài: Xoay 180° chiều lá bài trong bàn trải"
              >
                <RotateCw className={`w-3.5 h-3.5 text-[#C9A55A] transition-transform duration-500 ${gridCardsRotated ? "rotate-180 text-[#E6D3A3]" : "group-hover:rotate-180"}`} />
                <span>{gridCardsRotated ? "Xoay Bài: 180°" : "Xoay Bài: 0°"}</span>
              </button>

              <button
                type="button"
                onClick={handleQuickDraw}
                disabled={isShuffling}
                className={`flex items-center gap-2 px-5 py-2 text-xs font-serif font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50 active:scale-95 group ${
                  quickDrawStep === 1
                    ? "text-[#14100B] bg-gradient-to-r from-[#E5A93C] via-[#FCEECB] to-[#C88A2B] ring-2 ring-[#E6D3A3] shadow-[0_0_22px_rgba(229,169,60,0.5)] animate-pulse"
                    : quickDrawStep === 2
                    ? "text-[#14100B] bg-gradient-to-r from-[#FFD700] via-[#FFF8E7] to-[#F0B823] ring-2 ring-[#FFD700] shadow-[0_0_25px_rgba(255,215,0,0.6)] animate-pulse"
                    : "text-[#14100B] bg-gradient-to-r from-[#C9A55A] via-[#F3E7CF] to-[#C89B3C] hover:brightness-110 shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                }`}
                title={
                  quickDrawStep === 0
                    ? "Bấm lần 1 để Kính Thiên (Thiên Thời)"
                    : quickDrawStep === 1
                    ? "Bấm lần 2 để Kính Địa (Địa Lợi)"
                    : "Bấm lần 3 để Kính Nhân (Nhân Hòa) và Bốc Quẻ"
                }
              >
                <Sparkles className="w-3.5 h-3.5 text-[#14100B] group-hover:scale-125 transition-transform" />
                <span>
                  {quickDrawStep === 1
                    ? "Lần 2: Kính Địa (2/3)"
                    : quickDrawStep === 2
                    ? `Lần 3: Kính Nhân • Bốc Quẻ (${targetCount} Lá)`
                    : `Bốc Ngẫu Nhiên: Lần 1 • Kính Thiên (${targetCount} Lá)`}
                </span>
                <div className="flex items-center gap-1 ml-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full transition-all ${quickDrawStep >= 1 ? "bg-[#14100B]" : "bg-[#14100B]/35"}`} />
                  <span className={`w-1.5 h-1.5 rounded-full transition-all ${quickDrawStep >= 2 ? "bg-[#14100B]" : "bg-[#14100B]/35"}`} />
                  <span className={`w-1.5 h-1.5 rounded-full transition-all ${quickDrawStep >= 3 ? "bg-[#14100B]" : "bg-[#14100B]/35"}`} />
                </div>
              </button>

              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent("open-donate-modal"))}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-serif font-bold rounded-xl border border-amber-600/60 bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 hover:text-amber-200 transition-all cursor-pointer shadow-sm active:scale-95 group"
                title="Quét mã QR donate ủng hộ dự án"
              >
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-500/20 group-hover:scale-110 transition-transform" />
                <span>Donate ủng hộ</span>
                <QrCode className="w-3.5 h-3.5 text-amber-400" />
              </button>
            </div>

            {(() => {
              const cardsToRender =
                multiDeckMode === "separate" && deckCount >= 2
                  ? (separateDecks[activeDeckIndex] || [])
                  : multiDeckMode === "combined" && deckCount >= 2 && gridSubDeckFilter !== "all"
                  ? combinedDeck.slice((Number(gridSubDeckFilter) - 1) * 64, Number(gridSubDeckFilter) * 64)
                  : combinedDeck;

              const getGlobalIndex = (idx: number) => {
                if (multiDeckMode === "separate" && deckCount >= 2) return idx;
                if (multiDeckMode === "combined" && deckCount >= 2 && gridSubDeckFilter !== "all") {
                  return (Number(gridSubDeckFilter) - 1) * 64 + idx;
                }
                return idx;
              };

              return (
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 sm:gap-2.5 justify-items-center py-2 px-1 max-h-[620px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#3F3325] scrollbar-track-[#171410]">
                  {cardsToRender.map((card, localIdx) => {
                    const actualIndex = getGlobalIndex(localIdx);
                    const isSelected =
                      multiDeckMode === "separate" && deckCount >= 2
                        ? (selectedIndicesByDeck[activeDeckIndex] || []).includes(actualIndex)
                        : selectedDeckIndices.includes(actualIndex);

                    const selectionOrder =
                      multiDeckMode === "separate" && deckCount >= 2
                        ? (selectedIndicesByDeck[activeDeckIndex] || []).indexOf(actualIndex) + 1
                        : selectedDeckIndices.indexOf(actualIndex) + 1;

                    const isHolding = holdingCardIdx === actualIndex;
                    const isShaking = isHolding && holdProgress > 15;
                    const shakeClass = isShaking
                      ? holdProgress > 50
                        ? "animate-suspense-shake-fierce animate-aura-glow"
                        : "animate-suspense-shake"
                      : "";

                    return (
                      <div
                        key={card.instanceId || `${actualIndex}_${localIdx}`}
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          startCardHold(actualIndex);
                        }}
                        onPointerUp={(e) => {
                          e.stopPropagation();
                          endCardHold(actualIndex);
                        }}
                        onPointerLeave={() => {
                          if (holdingCardIdx === actualIndex) cancelCardHold();
                        }}
                        onPointerCancel={() => {
                          if (holdingCardIdx === actualIndex) cancelCardHold();
                        }}
                        className={`group relative flex flex-col items-center cursor-pointer transition-all ${
                          isSelected ? "-translate-y-2 z-10" : ""
                        } ${isHolding ? "scale-105 z-30" : "hover:-translate-y-1.5"}`}
                        title={`Lá số ${actualIndex + 1}${card.deckNumber ? ` (Bộ #${card.deckNumber})` : ""} - Giữ lâu để cảm nhận linh ứng hồi hộp, buông để thỉnh`}
                      >
                        <div className={`relative ${shakeClass} rounded-xl`}>
                          <CardVisual
                            isBack={!gridCardsFlippedFront}
                            hexagram={card}
                            imageUrl={cardImages[card.number]}
                            cardBackUrl={cardBackImage}
                            slotNumber={actualIndex + 1}
                            size="xs"
                            isReversed={gridCardsRotated}
                            className={
                              isSelected
                                ? "ring-4 ring-[#C9A55A] shadow-[0_0_25px_rgba(212,175,55,0.95)] animate-card-draw-float"
                                : isHolding
                                ? "ring-2 ring-[#C9A55A] shadow-[0_0_20px_rgba(212,175,55,0.9)]"
                                : "hover:ring-2 hover:ring-[#C9A55A]/80 shadow-md"
                            }
                          />
                          {isSelected && (
                            <>
                              <div className="absolute -inset-2 rounded-2xl border border-[#C9A55A]/80 animate-burst-aura pointer-events-none" />
                              <div className="absolute inset-0 bg-[#C9A55A]/25 rounded-xl flex items-center justify-center pointer-events-none">
                                <span className="w-6 h-6 rounded-full bg-[#14110D] border border-[#C9A55A] text-[#C9A55A] text-xs font-bold font-mono flex items-center justify-center shadow-lg">
                                  {selectionOrder}
                                </span>
                              </div>
                            </>
                          )}
                          {deckCount >= 2 && (
                            <div className="absolute top-1 left-1 px-1.5 py-0.2 rounded bg-[#100D0A]/90 border border-[#483925] text-[9px] font-mono text-[#C9A55A] shadow pointer-events-none">
                              B#{card.deckNumber || 1}
                            </div>
                          )}
                          {isHolding && (
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-[#140F0A] border border-[#C9A55A] text-[#C9A55A] text-[8.5px] font-mono font-bold whitespace-nowrap shadow-lg z-40 flex items-center gap-1 animate-pulse pointer-events-none">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              <span>{Math.round(holdProgress)}%</span>
                            </div>
                          )}
                        </div>
                        <span
                          className={`mt-1 text-[10px] font-mono transition-colors ${
                            isSelected || isHolding
                              ? "text-[#C9A55A] font-bold"
                              : "text-[#80705B] group-hover:text-[#C9A55A]"
                          }`}
                        >
                          Lá #{actualIndex + 1}{deckCount >= 2 ? ` (B#${card.deckNumber || 1})` : ""}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* 2. FAN VIEW: FULL RIBBON SPREAD */}
        {deckViewMode === "fan" && (
          <div className="relative py-4 px-1 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-[#8C7A62] gap-2 px-1">
              <span>
                {multiDeckMode === "separate" && deckCount >= 2
                  ? `Dải bài xòe Bộ #${activeDeckIndex} (64 lá) • Cuộn ngang hoặc nhấn các nút để chọn:`
                  : `Dải bài xòe toàn bộ ${deckCount * 64} lá • Cuộn ngang hoặc nhấn các nút để chọn:`}
              </span>
              <span className="font-mono text-[#C9A55A]">
                {multiDeckMode === "separate" && deckCount >= 2
                  ? `Bộ #${activeDeckIndex} • 64 lá`
                  : `${deckCount * 64} lá bài`}
              </span>
            </div>

            {/* Separate mode deck tabs */}
            {multiDeckMode === "separate" && deckCount >= 2 && (
              <div className="bg-[#18140F] border border-[#3C2E1E] rounded-xl p-2.5 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#C9A55A] font-serif font-bold">Xem dải bài bộ:</span>
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  {Array.from({ length: deckCount }, (_, i) => i + 1).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setActiveDeckIndex(d)}
                      className={`px-3 py-1 text-xs font-serif rounded-lg border transition-all cursor-pointer ${
                        activeDeckIndex === d
                          ? "bg-[#C9A55A] text-[#120F0C] font-bold border-[#C9A55A]"
                          : "bg-[#14100D] text-[#A89882] border-[#342718] hover:text-[#FFF]"
                      }`}
                    >
                      Bộ #{d}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Action Bar docked right next to the Ribbon cards */}
            <div className="flex items-center justify-center gap-3 my-2.5 flex-wrap">
              {drawMode === "twelve" && (
                <TwelveSidedDice
                  value={menhBranchNumber}
                  onRoll={(num) => setMenhBranchNumber(num)}
                  compact={true}
                />
              )}
              <button
                type="button"
                onClick={handleShuffle}
                disabled={isShuffling}
                className="flex items-center gap-2 px-4 py-2 text-xs font-serif font-bold text-[#EAD8B1] hover:text-[#FFF] bg-[#221B14] hover:bg-[#2F241A] border border-[#53412B] hover:border-[#C9A55A] rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50 active:scale-95 group"
                title={`Xáo lại ${deckCount * 64} lá bài theo nghi thức cổ truyền (5.5 giây)`}
              >
                <Shuffle className={`w-3.5 h-3.5 text-[#C9A55A] ${isShuffling ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
                <span>Xáo Lại {deckCount > 1 ? `${deckCount} Bộ (${deckCount * 64} Lá)` : "64 Lá"}</span>
              </button>

              {/* Bật/Tắt Lật Úp Dải Xòe */}
              <button
                type="button"
                onClick={() => {
                  setGridCardsFlippedFront((prev) => !prev);
                  zenAudio.playCardFlipSound();
                }}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-serif font-bold rounded-xl border transition-all cursor-pointer active:scale-95 group ${
                  gridCardsFlippedFront
                    ? "bg-[#2A1F13] text-[#E6D3A3] border-[#C9A55A] ring-1 ring-[#C9A55A]/50"
                    : "bg-[#221B14] text-[#EAD8B1] hover:text-[#FFF] border-[#53412B] hover:border-[#C9A55A]"
                }`}
                title="Bật/Tắt lật úp toàn bộ lá bài trong dải xòe (Mặc định úp bài ☯)"
              >
                <span className="text-xs font-mono">{gridCardsFlippedFront ? "☯" : "卦"}</span>
                <span>{gridCardsFlippedFront ? "Lật Úp Dải Bài (☯)" : "Lật Mở Dải Bài (卦)"}</span>
              </button>

              {/* Bật/Tắt Xoay Bài Dải Xòe */}
              <button
                type="button"
                onClick={() => {
                  setGridCardsRotated((prev) => !prev);
                  zenAudio.playCardFlipSound();
                }}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-serif font-bold rounded-xl border transition-all cursor-pointer active:scale-95 group ${
                  gridCardsRotated
                    ? "bg-[#2A1F13] text-[#E6D3A3] border-[#C9A55A] ring-1 ring-[#C9A55A]/50"
                    : "bg-[#221B14] text-[#EAD8B1] hover:text-[#FFF] border-[#53412B] hover:border-[#C9A55A]"
                }`}
                title="Bật/Tắt xoay bài: Xoay 180° chiều lá bài trong dải xòe"
              >
                <RotateCw className={`w-3.5 h-3.5 text-[#C9A55A] transition-transform duration-500 ${gridCardsRotated ? "rotate-180 text-[#E6D3A3]" : "group-hover:rotate-180"}`} />
                <span>{gridCardsRotated ? "Xoay Bài: 180°" : "Xoay Bài: 0°"}</span>
              </button>

              <button
                type="button"
                onClick={handleQuickDraw}
                disabled={isShuffling}
                className={`flex items-center gap-2 px-5 py-2 text-xs font-serif font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50 active:scale-95 group ${
                  quickDrawStep === 1
                    ? "text-[#14100B] bg-gradient-to-r from-[#E5A93C] via-[#FCEECB] to-[#C88A2B] ring-2 ring-[#E6D3A3] shadow-[0_0_22px_rgba(229,169,60,0.5)] animate-pulse"
                    : quickDrawStep === 2
                    ? "text-[#14100B] bg-gradient-to-r from-[#FFD700] via-[#FFF8E7] to-[#F0B823] ring-2 ring-[#FFD700] shadow-[0_0_25px_rgba(255,215,0,0.6)] animate-pulse"
                    : "text-[#14100B] bg-gradient-to-r from-[#C9A55A] via-[#F3E7CF] to-[#C89B3C] hover:brightness-110 shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                }`}
                title={
                  quickDrawStep === 0
                    ? "Bấm lần 1 để Kính Thiên (Thiên Thời)"
                    : quickDrawStep === 1
                    ? "Bấm lần 2 để Kính Địa (Địa Lợi)"
                    : "Bấm lần 3 để Kính Nhân (Nhân Hòa) và Bốc Quẻ"
                }
              >
                <Sparkles className="w-3.5 h-3.5 text-[#14100B] group-hover:scale-125 transition-transform" />
                <span>
                  {quickDrawStep === 1
                    ? "Lần 2: Kính Địa (2/3)"
                    : quickDrawStep === 2
                    ? `Lần 3: Kính Nhân • Bốc Quẻ (${targetCount} Lá)`
                    : `Bốc Ngẫu Nhiên: Lần 1 • Kính Thiên (${targetCount} Lá)`}
                </span>
                <div className="flex items-center gap-1 ml-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full transition-all ${quickDrawStep >= 1 ? "bg-[#14100B]" : "bg-[#14100B]/35"}`} />
                  <span className={`w-1.5 h-1.5 rounded-full transition-all ${quickDrawStep >= 2 ? "bg-[#14100B]" : "bg-[#14100B]/35"}`} />
                  <span className={`w-1.5 h-1.5 rounded-full transition-all ${quickDrawStep >= 3 ? "bg-[#14100B]" : "bg-[#14100B]/35"}`} />
                </div>
              </button>

              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent("open-donate-modal"))}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-serif font-bold rounded-xl border border-amber-600/60 bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 hover:text-amber-200 transition-all cursor-pointer shadow-sm active:scale-95 group"
                title="Quét mã QR donate ủng hộ dự án"
              >
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-500/20 group-hover:scale-110 transition-transform" />
                <span>Donate ủng hộ</span>
                <QrCode className="w-3.5 h-3.5 text-amber-400" />
              </button>
            </div>

            {(() => {
              const fanCards =
                multiDeckMode === "separate" && deckCount >= 2
                  ? separateDecks[activeDeckIndex] || []
                  : combinedDeck;

              return (
                <div
                  ref={fanScrollRef}
                  className="flex items-center -space-x-4 sm:-space-x-5 md:-space-x-6 overflow-x-auto py-8 px-6 scrollbar-thin scrollbar-thumb-[#3F3325] scrollbar-track-[#171410] select-none scroll-smooth"
                >
                  {fanCards.map((card, idx) => {
                    const isSelected =
                      multiDeckMode === "separate" && deckCount >= 2
                        ? (selectedIndicesByDeck[activeDeckIndex] || []).includes(idx)
                        : selectedDeckIndices.includes(idx);

                    const selectionOrder =
                      multiDeckMode === "separate" && deckCount >= 2
                        ? (selectedIndicesByDeck[activeDeckIndex] || []).indexOf(idx) + 1
                        : selectedDeckIndices.indexOf(idx) + 1;

                    const isHolding = holdingCardIdx === idx;
                    const isShaking = isHolding && holdProgress > 15;
                    const shakeClass = isShaking
                      ? holdProgress > 50
                        ? "animate-suspense-shake-fierce animate-aura-glow"
                        : "animate-suspense-shake"
                      : "";

                    return (
                      <div
                        key={card.instanceId || `${idx}_${card.number}`}
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          startCardHold(idx);
                        }}
                        onPointerUp={(e) => {
                          e.stopPropagation();
                          endCardHold(idx);
                        }}
                        onPointerLeave={() => {
                          if (holdingCardIdx === idx) cancelCardHold();
                        }}
                        onPointerCancel={() => {
                          if (holdingCardIdx === idx) cancelCardHold();
                        }}
                        className={`flex-shrink-0 transition-transform duration-200 cursor-pointer ${
                          isSelected ? "-translate-y-8 z-70" : isHolding ? "-translate-y-6 scale-110 z-80" : "hover:-translate-y-5"
                        }`}
                        style={{ zIndex: isHolding ? 99 : isSelected ? 70 : idx + 1 }}
                        title={`Lá số ${idx + 1}${card.deckNumber ? ` (Bộ #${card.deckNumber})` : ""} - Giữ lâu để cảm nhận hồi hộp, buông để thỉnh`}
                      >
                        <div className={`relative ${shakeClass} rounded-xl`}>
                          <CardVisual
                            isBack={!gridCardsFlippedFront}
                            hexagram={card}
                            imageUrl={cardImages[card.number]}
                            cardBackUrl={cardBackImage}
                            slotNumber={idx + 1}
                            size="sm"
                            isReversed={gridCardsRotated}
                            className={
                              isSelected
                                ? "ring-4 ring-[#C9A55A] shadow-[0_0_25px_rgba(212,175,55,0.95)] animate-card-draw-float"
                                : isHolding
                                ? "ring-2 ring-[#C9A55A] shadow-[0_0_25px_rgba(212,175,55,0.9)]"
                                : "hover:ring-2 hover:ring-[#C9A55A]"
                            }
                          />
                          {isSelected && (
                            <>
                              <div className="absolute -inset-2 rounded-2xl border border-[#C9A55A]/80 animate-burst-aura pointer-events-none" />
                              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#14110D] border border-[#C9A55A] text-[#C9A55A] text-xs font-bold font-mono flex items-center justify-center shadow-lg z-20">
                                {selectionOrder}
                              </div>
                            </>
                          )}
                          {deckCount >= 2 && (
                            <div className="absolute top-1 left-1 px-1.5 py-0.2 rounded bg-[#100D0A]/90 border border-[#483925] text-[9px] font-mono text-[#C9A55A] shadow pointer-events-none">
                              B#{card.deckNumber || 1}
                            </div>
                          )}
                          {isHolding && (
                            <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-[#140F0A] border border-[#C9A55A] text-[#C9A55A] text-[9px] font-mono font-bold whitespace-nowrap shadow-lg z-40 flex items-center gap-1 animate-pulse pointer-events-none">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              <span>{Math.round(holdProgress)}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* Fan Navigation Helpers */}
            <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-[#292117] text-xs">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => scrollFan(-320)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#221B14] hover:bg-[#32271D] border border-[#3E3022] text-[#C4B49C] cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Cuộn Trái
                </button>
                <button
                  onClick={() => scrollFan(320)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#221B14] hover:bg-[#32271D] border border-[#3E3022] text-[#C4B49C] cursor-pointer"
                >
                  Cuộn Phải <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-[#8C7A62] flex-wrap">
                <span>Chuyển nhanh:</span>
                <button
                  onClick={() => scrollToRatio(0)}
                  className="px-2 py-0.5 rounded bg-[#201A13] hover:text-[#C9A55A] border border-[#3A2E20] cursor-pointer"
                >
                  Đầu
                </button>
                <button
                  onClick={() => scrollToRatio(0.5)}
                  className="px-2 py-0.5 rounded bg-[#201A13] hover:text-[#C9A55A] border border-[#3A2E20] cursor-pointer"
                >
                  Giữa
                </button>
                <button
                  onClick={() => scrollToRatio(1)}
                  className="px-2 py-0.5 rounded bg-[#201A13] hover:text-[#C9A55A] border border-[#3A2E20] cursor-pointer"
                >
                  Cuối
                </button>
                {deckCount >= 2 && multiDeckMode === "combined" && (
                  <div className="flex items-center gap-1 ml-1 border-l border-[#352A1C] pl-2">
                    <span className="text-[#A2907A]">Nhảy tới bộ:</span>
                    {Array.from({ length: Math.min(6, deckCount) }, (_, i) => i + 1).map((d) => (
                      <button
                        key={d}
                        onClick={() => scrollToRatio((d - 1) / deckCount)}
                        className="px-1.5 py-0.5 rounded bg-[#241C15] hover:text-[#C9A55A] border border-[#3B2D1E] cursor-pointer font-mono"
                      >
                        B#{d}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* REVEALED CARDS WITH LOADED IMAGES */}
        {revealedCards.length > 0 && (() => {
          const isSpreadDiagramMode =
            drawMode === "seven" ||
            drawMode === "nine" ||
            drawMode === "ten" ||
            drawMode === "ten_expanded" ||
            drawMode === "twelve" ||
            drawMode === "custom";

          return (
            <div
              className={`mt-8 ${
                isSpreadDiagramMode
                  ? "p-0 bg-transparent border-0 shadow-none"
                  : "pt-6 animate-in fade-in bg-[#FAF6EE]/95 rounded-2xl p-4 sm:p-6 border-2 border-[#C4963E]/55 shadow-xl"
              }`}
            >
              {!isSpreadDiagramMode && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-5 border-b border-[#C4963E]/35 pb-4">
                  <div className="text-center sm:text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs uppercase font-serif font-bold text-[#F3E5AB] tracking-widest px-3 py-1 rounded-full bg-[#16120D] border border-[#C4963E]/70 shadow-sm">
                        {allFlippedFront
                          ? "CÁC LÁ BÀI BẠN ĐÃ BỐC (MẶT NGỬA QUẺ DỊCH 卦)"
                          : "CÁC LÁ BÀI BẠN ĐÃ BỐC (MẶT SẤP BÁT QUÁI ☯)"}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-600/40">
                        ✓ Cố định sẵn
                      </span>
                    </div>
                    <p className="text-xs text-[#5C4D3C] mt-1.5 font-medium">
                      {allFlippedFront
                        ? "Nhấp vào lá bài để lật mặt sau (Thoán Từ) hoặc bấm 'Soi 2 Mặt' để xem song song cả 2 mặt bài."
                        : "Tất cả quẻ khi ra đều là mặt sấp. Nhấp vào từng lá bài hoặc bấm nút Mở Luôn để lật mở mặt ngửa xem quẻ Dịch."}
                    </p>
                  </div>

                  {/* Chụp hình toàn bộ lá bài button */}
                  <button
                    type="button"
                    onClick={handleCaptureDrawnCards}
                    disabled={isCapturing}
                    className="no-capture flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-serif font-bold bg-[#FFFDF8] hover:bg-[#F3ECE0] text-[#3A2E21] border border-[#C4963E]/55 transition-all cursor-pointer shadow-sm"
                    title="Chụp ảnh các lá bài đã bốc thành tệp hình PNG"
                  >
                    {isCapturing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#9A1F1A]" />
                        <span>Đang chụp...</span>
                      </>
                    ) : capturedSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-700" />
                        <span className="text-emerald-800">Đã lưu ảnh!</span>
                      </>
                    ) : (
                      <>
                        <Camera className="w-3.5 h-3.5 text-[#9A1F1A]" />
                        <span>Chụp Toàn Bộ Lá Bài</span>
                      </>
                    )}
                  </button>

                  {exportedImageUrl && (
                    <button
                      type="button"
                      onClick={() => setShowExportModal(true)}
                      className="no-capture flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-serif font-bold text-[#7A1C18] bg-[#FFFDF8] hover:bg-[#F3ECE0] border border-[#C4963E]/55 transition-colors cursor-pointer"
                      title="Mở lại ảnh đã xuất để phóng to/thu nhỏ lá bài"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Phóng to ảnh xuất</span>
                    </button>
                  )}

                  {/* Nút Bật/Tắt Xoay Bài */}
                  <button
                    type="button"
                    onClick={handleToggleRotateCards}
                    className={`no-capture flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer shadow-sm active:scale-95 group border ${
                      isAllCardsRotated
                        ? "bg-[#1C1610] text-[#F3E5AB] border-[#C4963E]"
                        : "bg-[#FFFDF8] text-[#3A2E21] hover:bg-[#F3ECE0] border-[#C4963E]/50"
                    }`}
                    title="Bật/Tắt xoay bài: Xoay đảo chiều 180° (Ngược / Xuôi) cho toàn bộ các lá bài đã bốc"
                  >
                    <RotateCw className={`w-3.5 h-3.5 text-[#C4963E] transition-transform duration-500 ${isAllCardsRotated ? "rotate-180 text-[#F3E5AB]" : "group-hover:rotate-180"}`} />
                    <span>{isAllCardsRotated ? "Xoay Bài: 180° (Ngược)" : "Xoay Bài: 0° (Thuận)"}</span>
                  </button>

                  {/* Nút Bật/Tắt Lật Úp Bài / Mở Luôn */}
                  <button
                    type="button"
                    onClick={handleToggleFlipCards}
                    className={`no-capture flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer shadow-sm active:scale-95 group border ${
                      allFlippedFront
                        ? "bg-[#9A1F1A] text-[#FFFDF8] border-[#C4963E]"
                        : "bg-[#FFFDF8] text-[#3A2E21] hover:bg-[#F3ECE0] border-[#C4963E]/50"
                    }`}
                    title="Bật/Tắt trạng thái khi hiện quẻ: Mở Luôn (Mặt quẻ 卦) hoặc Úp Bài (Mặt Bát Quái ☯)"
                  >
                    <span className="text-xs font-mono">{allFlippedFront ? "📖" : "🎴"}</span>
                    <span>{allFlippedFront ? "Mở Luôn" : "Úp Bài"}</span>
                  </button>

                  {/* Nút Bật/Tắt Xoay Bài Qua Mặt Sau (Khóa Lật Mặt Trước/Sau khi nhấn) */}
                  <button
                    type="button"
                    onClick={handleToggleAllowFlipOnClick}
                    className={`no-capture flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer shadow-sm active:scale-95 group border ${
                      allowFlipOnClick
                        ? "bg-[#1C1610] text-[#F3E5AB] border-[#C4963E]"
                        : "bg-[#FFFDF8] text-[#6E5C47] hover:bg-[#F3ECE0] border-[#C4963E]/50"
                    }`}
                    title="Bật/Tắt xoay bài qua mặt sau: Khi TẮT, nhấn vào lá bài sẽ không xoay lật mặt trước hay mặt sau nữa"
                  >
                    <FlipHorizontal className={`w-3.5 h-3.5 ${allowFlipOnClick ? "text-[#E2C275]" : "text-[#8C7D6A]"}`} />
                    <span>{allowFlipOnClick ? "Xoay Mặt Sau: BẬT" : "Xoay Mặt Sau: TẮT (Khóa)"}</span>
                  </button>

                  {/* Nút Xem Thuận Nghịch / Chỉ Xem Thuận */}
                  <button
                    type="button"
                    onClick={handleToggleAllowReversedCards}
                    className={`no-capture flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer shadow-sm active:scale-95 group border ${
                      effectiveAllowReversedCards
                        ? "bg-[#1C1610] text-[#F3E5AB] border-[#C4963E]"
                        : "bg-[#FFFDF8] text-[#6E5C47] hover:bg-[#F3ECE0] border-[#C4963E]/50"
                    }`}
                    title={
                      effectiveAllowReversedCards
                        ? "Chế độ: Xem Thuận Nghịch (khi bốc có thể ra quẻ thuận hoặc quẻ nghịch). Bấm để chuyển sang Chỉ Xem Thuận."
                        : "Chế độ: Chỉ Xem Thuận (toàn bộ lá bài ra chiều thuận). Bấm để chuyển sang Xem Thuận Nghịch."
                    }
                  >
                    <RotateCw className={`w-3.5 h-3.5 transition-transform duration-300 ${effectiveAllowReversedCards ? "text-[#E2C275] rotate-180" : "text-[#8C7D6A]"}`} />
                    <span><strong>{effectiveAllowReversedCards ? "Xem Thuận Nghịch" : "Chỉ Xem Thuận"}</strong></span>
                  </button>
                </div>
              )}

            {/* Duplicate Card Resonance Banner (khi có quẻ trùng lặp từ nhiều bộ) */}
            {(() => {
              const duplicateCards = revealedCards.filter(
                (c, idx, arr) => arr.some((other, otherIdx) => otherIdx !== idx && other.number === c.number)
              );
              if (duplicateCards.length === 0) return null;
              const uniqueDupeNums = Array.from(new Set(duplicateCards.map((c) => c.number)));
              return (
                <div className="mb-5 p-3.5 rounded-xl bg-gradient-to-r from-[#2B1D0E] via-[#352513] to-[#2B1D0E] border border-[#C9A55A]/60 shadow-lg text-xs space-y-1">
                  <div className="flex items-center gap-2 text-[#C9A55A] font-serif font-bold">
                    <Sparkles className="w-4 h-4 text-[#C9A55A] animate-pulse" />
                    <span>ĐIỀM LÀNH TRÙNG QUẺ ĐỒNG VỌNG ({deckCount} BỘ BÀI)</span>
                  </div>
                  <p className="text-[#EAD8B1] leading-relaxed">
                    Bạn đã bốc trúng cùng một quẻ từ nhiều bộ bài khác nhau:{" "}
                    {uniqueDupeNums.map((num) => {
                      const sample = duplicateCards.find((c) => c.number === num);
                      const matchingDecks = duplicateCards
                        .filter((c) => c.number === num)
                        .map((c) => `Bộ #${c.deckNumber || 1}`);
                      return (
                        <span key={num} className="font-bold text-[#C9A55A]">
                          [Quẻ #{num} {sample?.name} ({matchingDecks.join(" & ")})]
                        </span>
                      );
                    })}
                    . Trong Dịch học, hiện tượng trùng quẻ khi gieo nhiều bộ thể hiện thông điệp cộng hưởng cực kỳ mãnh liệt, ý trời định đoạt rõ ràng, năng lượng được nhân bội linh ứng!
                  </p>
                </div>
              );
            })()}

            {drawMode === "seven" || drawMode === "nine" || drawMode === "ten" || drawMode === "ten_expanded" || drawMode === "twelve" || drawMode === "custom" ? (
              <div className="space-y-4">
                <SpreadDiagram
                  allFlipped={allFlippedFront}
                  spreadType={
                    drawMode === "twelve"
                      ? "twelve_houses"
                      : drawMode === "seven"
                      ? "seven_stars"
                      : drawMode === "nine"
                      ? "nine_palaces"
                      : drawMode === "ten"
                      ? "ten_stars"
                      : drawMode === "ten_expanded"
                      ? "ten_stars_expanded"
                      : "custom"
                  }
                  cards={revealedCards}
                  cardImages={cardImages}
                  cardVideos={cardVideos}
                  onImageUpdated={onImageUpdated}
                  onVideoUpdated={onVideoUpdated}
                  isCard2Reversed={isCard2Reversed}
                  onToggleCard2Reversed={() => setIsCard2Reversed((prev) => !prev)}
                  isCard2AReversed={isCard2AReversed}
                  onToggleCard2AReversed={() => setIsCard2AReversed((prev) => !prev)}
                  isCard2BReversed={isCard2BReversed}
                  onToggleCard2BReversed={() => setIsCard2BReversed((prev) => !prev)}
                  onSetCard2AReversed={setIsCard2AReversed}
                  onSetCard2BReversed={setIsCard2BReversed}
                  onSetCard2Reversed={setIsCard2Reversed}
                  cardsContainerRef={cardsGridRef}
                  menhBranchNumber={menhBranchNumber}
                  onUpdateMenhBranchNumber={(num) => setMenhBranchNumber(num)}
                  customPositions={
                    drawMode === "custom"
                      ? revealedCards.map((_, i) => ({
                          index: i,
                          name: `Lá ${i + 1}`,
                          purpose: customPurposes[i]?.trim() || `Mục đích xem lá ${i + 1}`,
                        }))
                      : undefined
                  }
                  isAllCardsRotated={isAllCardsRotated}
                  onToggleCardsRotated={handleToggleRotateCards}
                  cardRotationMap={cardRotationMap}
                  onToggleSlotRotation={handleToggleSingleCardRotation}
                  allowFlipOnClick={allowFlipOnClick}
                  onToggleAllowFlipOnClick={handleToggleAllowFlipOnClick}
                />
              </div>
            ) : (
              <div
                ref={cardsGridRef}
                className={`flex flex-wrap items-center justify-center p-3 sm:p-6 bg-gradient-to-b from-[#FAF8F2] to-[#F1EAE0] border border-[#C4963E]/40 rounded-xl max-w-7xl mx-auto gap-4 sm:gap-6 relative overflow-visible`}
              >
                {/* Header Banner - Xuất hiện trang trọng khi chụp ảnh hoặc xem toàn cảnh */}
                <div className="w-full text-center py-2 sm:py-3 mb-1 border-b border-[#C4963E]/40 bg-gradient-to-r from-transparent via-[#F3ECE0] to-transparent">
                  <div className="flex items-center justify-center gap-2 text-xs sm:text-sm md:text-base font-serif font-bold text-[#7A1C18] tracking-widest uppercase">
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C4963E]" />
                    <span>
                      CỬU NHỊ DỊCH HỌC • TRẬN PHÁP{" "}
                      {drawMode === "single"
                        ? "ĐƠN QUẺ CHỦ"
                        : drawMode === "double"
                        ? doubleSpreadMode === "choice_ab"
                          ? "LỰA CHỌN A & B"
                          : "HIỆN TẠI & TƯƠNG LAI"
                        : drawMode === "three"
                        ? threeSpreadMode === "tam_tai"
                          ? "TAM TÀI (THIÊN - ĐỊA - NHÂN)"
                          : threeSpreadMode === "ngu_che"
                          ? "NGỰ CHẾ TINH TÚY"
                          : threeSpreadMode === "choice_abc"
                          ? "TAM PHƯƠNG ÁN (A - B - C)"
                          : "QUÁ KHỨ - HIỆN TẠI - TƯƠNG LAI"
                        : `TÙY CHỈNH (${revealedCards.length} LÁ)`}
                    </span>
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C4963E]" />
                  </div>
                  <p className="text-[9.5px] sm:text-[10.5px] text-[#6E5C47] font-mono mt-0.5">
                    ✦ Thời khắc chiêm bốc: {new Date().toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} ✦
                  </p>
                </div>

                {revealedCards.map((card, i) => {
                  const customImage = cardImages[card.number];
                  const customVideo = cardVideos[card.number];
                  const roleLabel =
                    drawMode === "single"
                      ? "LÁ BÀI THỈNH ĐƯỢC (QUẺ CHỦ)"
                      : drawMode === "double"
                      ? doubleSpreadMode === "choice_ab"
                        ? i === 0
                          ? `LÁ 1: [LỰA CHỌN A] ${choiceALabel.trim() || "Phương án A"}`
                          : `LÁ 2: [LỰA CHỌN B] ${choiceBLabel.trim() || "Phương án B"}`
                        : i === 0
                        ? "LÁ 1: HIỆN TẠI (GỐC RỄ & THỰC TRẠNG)"
                        : "LÁ 2: TƯƠNG LAI (XU HƯỚNG & KẾT QUẢ)"
                      : drawMode === "three" && threeSpreadMode === "choice_abc"
                      ? i === 0
                        ? `LÁ 1: [LỰA CHỌN A] ${choiceALabel.trim() || "Phương án A"}`
                        : i === 1
                        ? `LÁ 2: [LỰA CHỌN B] ${choiceBLabel.trim() || "Phương án B"}`
                        : `LÁ 3: [LỰA CHỌN C] ${choiceCLabel.trim() || "Phương án C"}`
                      : drawMode === "three" && threeSpreadMode === "tam_tai"
                      ? i === 0
                        ? "LÁ 1: THIÊN ĐẠO (THIÊN THỜI & HOÀN CẢNH KHÁCH QUAN)"
                        : i === 1
                        ? "LÁ 2: ĐỊA ĐẠO (ĐỊA LỢI & NỀN TẢNG MÔI TRƯỜNG)"
                        : "LÁ 3: NHÂN ĐẠO (NHÂN HÒA & CON NGƯỜI HÀNH ĐỘNG)"
                      : drawMode === "three" && threeSpreadMode === "ngu_che"
                      ? i === 0
                        ? "LÁ 1: THIÊN ĐẠO (THIÊN THỜI & KHỞI CƠ)"
                        : i === 1
                        ? "LÁ 2: ĐỊA ĐẠO (ĐỊA LỢI & NỀN TẢNG)"
                        : "👑 LÁ 3 (LÁ CUỐI): NHÂN ĐẠO — LẤY LÀM QUẺ CHỦ NGỰ CHẾ"
                      : i === 0
                      ? "LÁ 1: QUÁ KHỨ (CĂN NGUYÊN & KHỞI ĐẦU)"
                      : i === 1
                      ? "LÁ 2: HIỆN TẠI (THỰC TRẠNG & TÌNH THẾ)"
                      : "LÁ 3: TƯƠNG LAI (TRIỂN VỌNG & KẾT QUẢ)";

                  return (
                    <motion.div
                      key={card.instanceId || `${card.number}_${card.deckNumber || 1}_${i}`}
                      initial={{ opacity: 0, scale: 0.85, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.45, delay: i * 0.15 }}
                      className="bg-gradient-to-b from-[#FDFBF7] to-[#F3ECE0] border-2 border-[#C4963E]/60 rounded-xl sm:rounded-2xl shadow-xl flex flex-col items-center text-center relative hover:z-30 overflow-visible p-3 sm:p-5 shrink-0 max-w-full"
                    >
                      {/* Deck Badge if multi-deck */}
                      {deckCount >= 2 && (
                        <div className="absolute top-1.5 sm:top-3 left-1.5 sm:left-3 px-1.5 sm:px-2 py-0.5 rounded-full bg-[#18120C] border border-[#C9A55A]/60 text-[8px] sm:text-[10px] font-serif font-bold text-[#C9A55A] shadow z-20 pointer-events-none">
                          Bộ #{card.deckNumber || 1}
                        </div>
                      )}

                      {/* Role Title — Nhãn Vị Trí Sơn Mài Nổi */}
                      <div className="mb-2 mt-0.5 px-3 py-1 rounded-full bg-[#16120D] border border-[#C4963E]/70 shadow-sm pointer-events-none">
                        <span className="font-serif font-bold text-[#F3E5AB] uppercase tracking-wider text-[9px] sm:text-[11px]">
                          {roleLabel}
                        </span>
                      </div>

                      {/* PROMINENT CARD IMAGE DISPLAY WITH 3D SPIRITUAL FLIP */}
                      <div className="my-1 sm:my-2 relative z-10 hover:z-50">
                        <FlippableSpiritualCard
                          key={`${card.instanceId || card.number}_${flipSequenceKey}_${i}`}
                          hexagram={card}
                          imageUrl={customImage}
                          videoUrl={customVideo}
                          cardBackUrl={cardBackImage}
                          defaultFlipped={allFlippedFront}
                          size="xl"
                          fitMode="contain"
                          deckNumber={card.deckNumber}
                          isReversed={isCardRotated(i)}
                          onRotate={() => handleToggleSingleCardRotation(i)}
                          allowFlipOnClick={allowFlipOnClick}
                          enableHoverZoom={true}
                          onImageUpdated={(num, url) => {
                            if (onImageUpdated) onImageUpdated(num, url);
                          }}
                          onVideoUpdated={(num, url) => {
                            if (onVideoUpdated) onVideoUpdated(num, url);
                          }}
                        />
                      </div>

                      {/* Nút Soi 2 Mặt (Quẻ Tượng & Thoán Từ) */}
                      <button
                        type="button"
                        onClick={() =>
                          setInspectingTwoSidedCard({
                            card,
                            positionTitle: roleLabel,
                            isReversed: isCardRotated(i),
                          })
                        }
                        className="no-capture mt-1 mb-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9A1F1A] hover:bg-[#7A1C18] text-[#FFFDF8] border border-[#C4963E] text-[10px] sm:text-xs font-serif font-bold shadow-sm transition-all cursor-pointer"
                      >
                        <ZoomIn className="w-3 h-3 text-[#E2C275]" />
                        <span>Soi 2 Mặt (Quẻ Tượng & Thoán Từ)</span>
                      </button>

                      {/* Thông tin chi tiết trọn vẹn của lá bài */}
                      <CardInfoSummary
                        card={card}
                        isReversed={isCardRotated(i)}
                        deckNumber={card.deckNumber}
                        showJudgment={true}
                        showAdvice={revealedCards.length <= 2}
                      />
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* View full reading button */}
            <div className="text-center mt-6 no-capture flex items-center justify-center gap-3 flex-wrap">
              <button
                onClick={() => processResults(revealedCards)}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#9A1F1A] via-[#B3261E] to-[#8C1D18] text-[#FFFDF8] border-2 border-[#E2C275] font-serif font-bold text-sm sm:text-base shadow-[0_6px_22px_rgba(154,31,26,0.35)] hover:brightness-110 transition-all cursor-pointer"
              >
                <span>☯ Vào Xem Chi Tiết Luận Giải Quẻ & 6 Hào</span>
                <ArrowRight className="w-4 h-4 text-[#E2C275]" />
              </button>

              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent("open-donate-modal"))}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-600/60 hover:border-amber-400 font-serif font-bold text-sm shadow-md transition-all cursor-pointer active:scale-95 group"
                title="Quét mã QR donate ủng hộ dự án"
              >
                <Heart className="w-4 h-4 text-rose-400 fill-rose-500/20 group-hover:scale-110 transition-transform" />
                <span>Donate Ủng Hộ</span>
                <QrCode className="w-4 h-4 text-amber-400" />
              </button>
            </div>
          </div>
        );
      })()}

      {/* Modal Soi Lá Bài 2 Mặt (Quẻ Tượng & Thoán Từ) */}
      <CardTwoSidedModal
        isOpen={Boolean(inspectingTwoSidedCard)}
        onClose={() => setInspectingTwoSidedCard(null)}
        hexagram={inspectingTwoSidedCard?.card || null}
        positionTitle={inspectingTwoSidedCard?.positionTitle}
        frontImageUrl={inspectingTwoSidedCard ? cardImages[inspectingTwoSidedCard.card.number] : undefined}
        backImageUrl={cardBackImage}
        isReversed={inspectingTwoSidedCard?.isReversed}
        onOpenFullDetail={
          revealedCards.length > 0
            ? () => processResults(revealedCards)
            : undefined
        }
      />
      </XuanBaguaStage>

      <ExportImageModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        imageUrl={exportedImageUrl}
        title="Ảnh Các Lá Bài Đã Bốc"
        filename={`la-bai-da-boc-${new Date().toISOString().slice(0, 10)}.png`}
      />
    </div>
  );
};
