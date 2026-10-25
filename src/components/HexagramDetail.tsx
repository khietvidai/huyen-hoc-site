import React, { useState, useRef, useEffect } from "react";
import {
  Bookmark,
  Copy,
  Check,
  RotateCcw,
  RotateCw,
  Sparkles,
  AlertCircle,
  Clock,
  Scale,
  Hourglass,
  Camera,
  Loader2,
  Sliders,
  Settings,
  ZoomIn,
  Maximize2,
  ExternalLink,
  Compass,
  Eye,
  FileText,
  Table,
  Mail,
  Plus,
  X,
  CircleDot,
  FlipHorizontal,
  ChevronDown,
  ChevronUp,
  BookOpen,
  BarChart3,
  Scroll,
  Dices,
} from "lucide-react";
import { captureElementToPng } from "../utils/captureHelper";
import { Hexagram, DoubleCardMode, ThreeCardMode, SpreadType, CustomCardPosition } from "../types";
import { HEXAGRAMS } from "../data/hexagrams";
import {
  SEVEN_STARS_POSITIONS,
  TEN_STARS_POSITIONS,
  TEN_STARS_EXPANDED_POSITIONS,
  NINE_PALACES_POSITIONS,
} from "../data/spreads";
import { HexagramVisual } from "./HexagramVisual";
import { CardVisual } from "./CardVisual";
import { FlippableSpiritualCard } from "./FlippableSpiritualCard";
import { CardInfoSummary } from "./CardInfoSummary";
import { TraditionalHexagramFigure } from "./TraditionalHexagramFigure";
import { SpreadDiagram } from "./SpreadDiagram";
import { ExportImageModal } from "./ExportImageModal";
import { FullScreenCardHoverModal, HoverCardData } from "./FullScreenCardHoverModal";
import { XuanBaguaStage, CardTwoSidedModal } from "./XuanBaguaStage";
import { zenAudio } from "../utils/zenAudio";
import { CanonicalHexagramCard } from "./CanonicalHexagramCard";
import { HexagramElementsChart } from "./HexagramElementsChart";
import { XiangzhuanView } from "./XiangzhuanView";
import { KhongMinhSingleHexView } from "./KhongMinhBridgeView";
import { ChangingLinesGuideView } from "./ChangingLinesGuideView";
import { TamTaiDiceRollSection, EarthlyBranchDiceItem } from "./TamTaiDiceRollSection";
import { KhongMinhKinhDichView } from "./KhongMinhKinhDichView";
import { NguCheTinhTuySection } from "./NguCheTinhTuySection";

interface HexagramDetailProps {
  question: string;
  category: string;
  primaryHexagram: Hexagram;
  changingLines: number[];
  transformedHexagram?: Hexagram;
  cardsDrawSummary?: string;
  doubleMode?: DoubleCardMode;
  choiceALabel?: string;
  choiceBLabel?: string;
  threeMode?: ThreeCardMode;
  choiceCLabel?: string;
  drawnCards?: Hexagram[];
  spreadType?: SpreadType;
  customPositions?: CustomCardPosition[];
  cardImages?: Record<number, string>;
  cardVideos?: Record<number, string>;
  cardBackImage?: string | null;
  isCard2Reversed?: boolean;
  onToggleCard2Reversed?: () => void;
  isCard2AReversed?: boolean;
  onToggleCard2AReversed?: () => void;
  isCard2BReversed?: boolean;
  onToggleCard2BReversed?: () => void;
  onImageUpdated?: (num: number, url: string) => void;
  onVideoUpdated?: (num: number, url: string) => void;
  onSaveToHistory: (notes?: string, aiText?: string) => void;
  onNewDivination: () => void;
  initialAiText?: string;
  menhBranchNumber?: number;
  diceRollResult?: number;
  deckCount?: number;
  multiDeckMode?: "separate" | "combined";
  onOpenWorkspace?: (tab: "docs" | "sheets" | "gmail" | "picker") => void;
  companionCards?: Record<string, Hexagram | Hexagram[]>;
  onDrawCompanionCard?: (slotKey: string) => void;
  onRemoveCompanionCard?: (slotKey: string, cardIndex?: number) => void;
  onNavigateToManual?: (hexNumber: number) => void;
  defaultCardFaceOpen?: boolean;
  onToggleDefaultCardFaceOpen?: () => void;
  onShowToast?: (msg: string) => void;
}

export const HexagramDetail: React.FC<HexagramDetailProps> = ({
  question,
  category,
  primaryHexagram,
  changingLines,
  transformedHexagram,
  cardsDrawSummary,
  doubleMode,
  choiceALabel,
  choiceBLabel,
  threeMode,
  choiceCLabel,
  drawnCards,
  spreadType,
  customPositions,
  cardImages = {},
  cardVideos = {},
  cardBackImage = null,
  isCard2Reversed,
  onToggleCard2Reversed,
  isCard2AReversed,
  onToggleCard2AReversed,
  isCard2BReversed,
  onToggleCard2BReversed,
  onImageUpdated,
  onVideoUpdated,
  onSaveToHistory,
  onNewDivination,
  initialAiText = "",
  menhBranchNumber = 3,
  diceRollResult,
  deckCount,
  multiDeckMode,
  onOpenWorkspace,
  companionCards: externalCompanionCards,
  onDrawCompanionCard: externalDrawCompanion,
  onRemoveCompanionCard: externalRemoveCompanion,
  onNavigateToManual,
  defaultCardFaceOpen: propDefaultCardFaceOpen,
  onToggleDefaultCardFaceOpen,
  onShowToast,
}) => {
  const [internalCompanionCards, setInternalCompanionCards] = useState<Record<string, Hexagram | Hexagram[]>>({});
  const companionCards = externalCompanionCards || internalCompanionCards;

  const isYarrowOrCoins =
    spreadType === "yarrow" ||
    spreadType === "coins" ||
    Boolean(
      cardsDrawSummary &&
        spreadType !== "thapla" &&
        (cardsDrawSummary.toLowerCase().includes("cỏ thi") ||
          cardsDrawSummary.toLowerCase().includes("đại diễn") ||
          cardsDrawSummary.toLowerCase().includes("đồng xu") ||
          cardsDrawSummary.toLowerCase().includes("đồng tiền") ||
          cardsDrawSummary.toLowerCase().includes("lục hào"))
    );

  const [detailActiveTab, setDetailActiveTab] = useState<"canonical" | "elements" | "xiangzhuan" | "khongminh">("canonical");

  const [selectedCanonicalLine, setSelectedCanonicalLine] = useState<number | "all">(() => {
    if ((primaryHexagram.number === 1 || primaryHexagram.number === 2) && changingLines.length === 6) {
      return 7;
    }
    return changingLines.length > 0 ? changingLines[0] : 1;
  });

  const [inspectingTwoSidedCard, setInspectingTwoSidedCard] = useState<{
    card: Hexagram;
    positionTitle?: string;
    isReversed?: boolean;
  } | null>(null);

  const [detailCardSize, setDetailCardSize] = useState<"mini" | "compact" | "normal" | "large" | "xlarge">(() => {
    try {
      const isInit = localStorage.getItem("iching_detail_card_size_v3_init");
      if (!isInit) {
        localStorage.setItem("iching_detail_card_size_v3_init", "true");
        localStorage.setItem("iching_detail_card_size", "normal");
        return "normal";
      }
      const saved = localStorage.getItem("iching_detail_card_size");
      if (saved === "mini" || saved === "compact" || saved === "normal" || saved === "large" || saved === "xlarge") return saved;
      return "normal";
    } catch {
      return "normal";
    }
  });

  const handleUpdateDetailCardSize = (size: "mini" | "compact" | "normal" | "large" | "xlarge") => {
    setDetailCardSize(size);
    try {
      localStorage.setItem("iching_detail_card_size", size);
      localStorage.setItem("iching_detail_card_size_v3_init", "true");
    } catch {}
  };

  const [companionCardSize, setCompanionCardSize] = useState<"third" | "normal" | "large" | "same" | "xlarge">(() => {
    try {
      const saved = localStorage.getItem("iching_companion_card_size");
      if (saved === "large" || saved === "same" || saved === "xlarge") return saved;
      // Tự động nâng cấp các thiết lập cũ "third" (1/3) hoặc "normal" sang "same" để các lá bốc thêm luôn to rõ bằng lá chính
      try {
        localStorage.setItem("iching_companion_card_size", "same");
      } catch {}
      return "same"; // Mặc định hiển thị cùng kích cỡ với lá bài chính ("same")
    } catch {
      return "same";
    }
  });

  const [showCompanionButton, setShowCompanionButton] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("iching_show_companion_btn");
      return saved !== null ? saved === "true" : false;
    } catch {
      return false;
    }
  });

  const [showCompanionSection, setShowCompanionSection] = useState<boolean>(true);

  const toggleCompanionButton = () => {
    setShowCompanionButton((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("iching_show_companion_btn", String(next));
      } catch {}
      return next;
    });
  };

  const [showInterpretButton, setShowInterpretButton] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("iching_show_interpret_btn");
      return saved !== null ? saved === "true" : false;
    } catch {
      return false;
    }
  });

  const toggleInterpretButton = () => {
    setShowInterpretButton((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("iching_show_interpret_btn", String(next));
      } catch {}
      return next;
    });
  };

  const [enableSelectionHighlight, setEnableSelectionHighlight] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("iching_enable_selection_ring");
      return saved !== null ? saved === "true" : false;
    } catch {
      return false;
    }
  });

  const toggleSelectionHighlight = () => {
    setEnableSelectionHighlight((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("iching_enable_selection_ring", String(next));
      } catch {}
      return next;
    });
  };

  const handleUpdateCompanionCardSize = (size: "third" | "normal" | "large" | "same" | "xlarge") => {
    const effectiveSize = size === "third" || size === "normal" ? "same" : size;
    setCompanionCardSize(effectiveSize);
    try {
      localStorage.setItem("iching_companion_card_size", effectiveSize);
    } catch {}
  };

  const getCompanionCardSize = (context: "single" | "double" | "three"): "tiny" | "xs" | "sm" | "md" | "lg" | "xl" | "draw-2" | "draw-3" => {
    if (companionCardSize === "xlarge") return "xl";
    if (companionCardSize === "large") return "lg";
    // "same" / mặc định: Luôn bằng kích cỡ lá chính, không bao giờ bị thu nhỏ thành ô bé
    if (context === "three") return "draw-3";
    if (context === "double") return "lg";
    return "xl";
  };

  const getDetailCardSize = (defaultSize: "xs" | "sm" | "md" | "lg" | "xl" | "draw-2" | "draw-3" | "tiny"): "xs" | "sm" | "md" | "lg" | "xl" | "draw-2" | "draw-3" | "tiny" => {
    if (detailCardSize === "mini") return "tiny";
    if (detailCardSize === "compact") return "xs";
    if (detailCardSize === "normal") return defaultSize === "xl" ? "lg" : "md";
    if (detailCardSize === "large") return "lg";
    if (detailCardSize === "xlarge") return "xl";
    return defaultSize;
  };

  const [allowFlipOnClick, setAllowFlipOnClick] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("iching_allow_flip_on_click");
      return saved !== null ? saved === "true" : false;
    } catch {
      return false;
    }
  });

  const toggleAllowFlipOnClick = () => {
    const next = !allowFlipOnClick;
    setAllowFlipOnClick(next);
    try {
      localStorage.setItem("iching_allow_flip_on_click", String(next));
    } catch {}
    zenAudio.playCardFlipSound();
  };

  const getCompanionList = (slotKey: string): Hexagram[] => {
    const val = companionCards[slotKey];
    if (!val) return [];
    return Array.isArray(val) ? val : [val];
  };

  const handleDrawCompanion = (slotKey: string) => {
    if (externalDrawCompanion) {
      externalDrawCompanion(slotKey);
      return;
    }
    const allExisting: Hexagram[] = [];
    Object.values(companionCards).forEach((val) => {
      if (Array.isArray(val)) allExisting.push(...val);
      else if (val) allExisting.push(val);
    });
    const usedNumbers = [
      primaryHexagram.number,
      transformedHexagram?.number,
      ...(drawnCards?.map((c) => c.number) || []),
      ...allExisting.map((c) => c.number),
    ].filter(Boolean);
    const pool = HEXAGRAMS.filter((h) => !usedNumbers.includes(h.number));
    const available = pool.length > 0 ? pool : HEXAGRAMS;
    const picked = available[Math.floor(Math.random() * available.length)];
    const isRev = Math.random() < 0.5;
    const pickedWithReversal = { ...picked, isReversed: isRev };
    setInternalCompanionCards((prev) => {
      const prevVal = prev[slotKey];
      const prevList = Array.isArray(prevVal) ? prevVal : prevVal ? [prevVal] : [];
      return { ...prev, [slotKey]: [...prevList, pickedWithReversal] };
    });
    zenAudio.playCardDrawSound();
  };

  const handleRemoveCompanion = (slotKey: string, cardIndex?: number) => {
    if (externalRemoveCompanion) {
      externalRemoveCompanion(slotKey, cardIndex);
      return;
    }
    setInternalCompanionCards((prev) => {
      const prevVal = prev[slotKey];
      const prevList = Array.isArray(prevVal) ? prevVal : prevVal ? [prevVal] : [];
      const next = { ...prev };
      if (cardIndex !== undefined && prevList.length > 1) {
        next[slotKey] = prevList.filter((_, i) => i !== cardIndex);
      } else {
        delete next[slotKey];
      }
      return next;
    });
  };

  // Xăm Khổng Minh (Tam Tài: Thiên - Địa - Nhân) 12-sided dice state
  const isTamTai = Boolean(
    (threeMode === "tam_tai" || spreadType === "khongminh") &&
      drawnCards &&
      drawnCards.length === 3
  );

  // Ngự Chế Tân Tập Đoán Dịch Tinh Túy (Tam Tài: Thiên - Địa - Nhân, lấy lá cuối làm quẻ, lắc xí ngầu 12 mặt)
  const isNguChe = Boolean(
    (threeMode === "ngu_che" || spreadType === "nguche") &&
      drawnCards &&
      drawnCards.length === 3
  );

  const [userNote, setUserNote] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedCardIdx, setSelectedCardIdx] = useState<number | null>(() => (isTamTai || isNguChe ? 2 : 0));
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedSuccess, setCapturedSuccess] = useState(false);
  const [exportedCardsUrl, setExportedCardsUrl] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [cardFitMode, setCardFitMode] = useState<"contain" | "cover">(() => {
    try {
      const saved = localStorage.getItem("iching_card_fit_mode");
      return saved === "contain" || saved === "cover" ? saved : "cover";
    } catch {
      return "cover";
    }
  });
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const primaryCardRef = useRef<HTMLDivElement>(null);
  const [hoveredCardData, setHoveredCardData] = useState<HoverCardData | null>(null);
  const [enableHoverZoom, setEnableHoverZoom] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("iching_enable_hover_zoom");
      return saved !== null ? saved === "true" : false;
    } catch {
      return false;
    }
  });
  const [showDetailedControls, setShowDetailedControls] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("iching_detail_show_controls");
      return saved !== null ? saved === "true" : true;
    } catch {
      return true;
    }
  });

  const toggleDetailedControls = () => {
    setShowDetailedControls((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("iching_detail_show_controls", String(next));
      } catch {}
      return next;
    });
  };
  const [tamTaiChangingLine, setTamTaiChangingLine] = useState<number | null>(null);
  const [tamTaiTransformedHex, setTamTaiTransformedHex] = useState<Hexagram | undefined>(undefined);
  const [tamTaiTargetHex, setTamTaiTargetHex] = useState<Hexagram>(() => {
    if ((threeMode === "tam_tai" || spreadType === "khongminh") && drawnCards && drawnCards.length === 3) {
      return (selectedCardIdx !== null && drawnCards[selectedCardIdx]) || drawnCards[2] || drawnCards[0] || primaryHexagram;
    }
    return primaryHexagram;
  });

  useEffect(() => {
    if ((threeMode === "tam_tai" || spreadType === "khongminh") && drawnCards && selectedCardIdx !== null && drawnCards[selectedCardIdx]) {
      setTamTaiTargetHex(drawnCards[selectedCardIdx]);
    }
  }, [selectedCardIdx, threeMode, spreadType, drawnCards]);

  const handleApplyTamTaiChangingLine = (
    line: number,
    _diceItem: EarthlyBranchDiceItem,
    targetHex: Hexagram,
    transformedHex?: Hexagram
  ) => {
    setTamTaiChangingLine(line);
    setTamTaiTargetHex(targetHex);
    setTamTaiTransformedHex(transformedHex);
    setSelectedCanonicalLine(line);
  };

  const handleJumpToThuyetMinh = (line: number, targetTab: "canonical" | "khongminh" = "khongminh") => {
    if (isTamTai && onNavigateToManual) {
      const activeHex = tamTaiTargetHex || primaryHexagram;
      onNavigateToManual(activeHex.number);
      return;
    }
    setDetailActiveTab(targetTab);
    setSelectedCanonicalLine(line);
    setTimeout(() => {
      if (targetTab === "khongminh") {
        const lineEl = document.getElementById(`khongminh-line-${line}`);
        if (lineEl) {
          lineEl.scrollIntoView({ behavior: "smooth", block: "center" });
          lineEl.classList.add("ring-4", "ring-amber-400", "ring-offset-2", "ring-offset-[#120F0C]");
          setTimeout(() => {
            lineEl.classList.remove("ring-4", "ring-amber-400", "ring-offset-2", "ring-offset-[#120F0C]");
          }, 3500);
          return;
        }
      } else {
        const lineEl = document.getElementById(`canonical-line-${line}`);
        if (lineEl) {
          lineEl.scrollIntoView({ behavior: "smooth", block: "center" });
          return;
        }
      }
      const el = document.getElementById("thuyet-minh-section");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 150);
  };

  // Trạng thái lật mở mặt quẻ: Đồng bộ với thiết lập Mở Luôn / Úp Bài từ bên ngoài
  const [allCardsFlipped, setAllCardsFlipped] = useState<boolean>(() => {
    if (propDefaultCardFaceOpen !== undefined) return propDefaultCardFaceOpen;
    try {
      const saved = localStorage.getItem("iching_default_card_face_open");
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });
  const [flipSequenceKey, setFlipSequenceKey] = useState<number>(0);

  // Tự động đồng bộ khi prop từ ngoài đổi hoặc khi mở quẻ mới
  useEffect(() => {
    let initialOpen = true;
    if (propDefaultCardFaceOpen !== undefined) {
      initialOpen = propDefaultCardFaceOpen;
    } else {
      try {
        const saved = localStorage.getItem("iching_default_card_face_open");
        if (saved !== null) initialOpen = JSON.parse(saved);
      } catch {}
    }
    setAllCardsFlipped(initialOpen);
  }, [propDefaultCardFaceOpen, primaryHexagram, drawnCards]);

  const handleToggleAllCardsFlip = () => {
    const next = !allCardsFlipped;
    setAllCardsFlipped(next);
    setFlipSequenceKey((k) => k + 1);
    try {
      localStorage.setItem("iching_default_card_face_open", JSON.stringify(next));
    } catch {}
    if (onToggleDefaultCardFaceOpen) {
      onToggleDefaultCardFaceOpen();
    }
    zenAudio.playCardFlipSound();
  };

  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleHoverCard = (data: HoverCardData) => {
    if (!enableHoverZoom) return;
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
    hoverTimerRef.current = setTimeout(() => {
      setHoveredCardData(data);
    }, 50);
  };

  const handleLeaveCard = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    closeTimerRef.current = setTimeout(() => {
      setHoveredCardData(null);
    }, 160);
  };

  const handleEnlargedMouseEnter = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const handleEnlargedMouseLeave = () => {
    closeTimerRef.current = setTimeout(() => {
      setHoveredCardData(null);
    }, 140);
  };

  const toggleHoverZoom = () => {
    setEnableHoverZoom((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("iching_enable_hover_zoom", String(next));
      } catch {}
      if (!next) {
        setHoveredCardData(null);
      }
      return next;
    });
  };

  const isMultiCard = drawnCards && drawnCards.length > 1;

  const handleSave = () => {
    onSaveToHistory(userNote, initialAiText);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleCaptureCards = async () => {
    if (!cardsContainerRef.current || isCapturing) return;
    const previousFlipped = allCardsFlipped;
    try {
      setIsCapturing(true);

      // Programmatically set cards to face-up (mặt ngửa) if not already
      if (!previousFlipped) {
        setAllCardsFlipped(true);
        setFlipSequenceKey((k) => k + 1);
      }

      // Mark container with data-capturing="true" for instant CSS face-up override
      cardsContainerRef.current.setAttribute("data-capturing", "true");

      // Brief tick to ensure UI state is settled and rotated
      await new Promise((resolve) => setTimeout(resolve, 150));

      const minW = (drawnCards && drawnCards.length >= 2) || transformedHexagram ? 1080 : 720;
      const dataUrl = await captureElementToPng(cardsContainerRef.current, {
        backgroundColor: "#15120E",
        pixelRatio: 2,
        minWidth: minW,
      });

      const timestamp = new Date().toISOString().slice(0, 10);
      setExportedCardsUrl(dataUrl);
      setShowExportModal(true);
      setCapturedSuccess(true);
      setTimeout(() => setCapturedSuccess(false), 3000);
    } catch (err) {
      console.error("Lỗi khi chụp hình các lá bài:", err);
    } finally {
      if (cardsContainerRef.current) {
        cardsContainerRef.current.removeAttribute("data-capturing");
      }
      if (!previousFlipped) {
        setAllCardsFlipped(false);
        setFlipSequenceKey((k) => k + 1);
      }
      setIsCapturing(false);
    }
  };

  const handleCapturePrimaryCard = async () => {
    const el = primaryCardRef.current || cardsContainerRef.current;
    if (!el || isCapturing) return;
    try {
      setIsCapturing(true);
      await new Promise((resolve) => setTimeout(resolve, 150));
      const dataUrl = await captureElementToPng(el, {
        backgroundColor: "#15120E",
        pixelRatio: 2,
        minWidth: 720,
      });

      setExportedCardsUrl(dataUrl);
      setShowExportModal(true);
      setCapturedSuccess(true);
      setTimeout(() => setCapturedSuccess(false), 3000);
    } catch (err) {
      console.error("Lỗi khi chụp hình quẻ ban đầu:", err);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleCopy = () => {
    let spreadInfo = "";
    if (drawnCards && (spreadType === "custom" || customPositions)) {
      const positions = customPositions || [];
      spreadInfo =
        `\n【Trận Pháp Tùy Chỉnh (${drawnCards.length} Lá)】:\n` +
        drawnCards
          .map((c, i) => {
            const purpose = positions[i]?.purpose || positions[i]?.name || `Mục đích xem lá ${i + 1}`;
            return `- Lá ${i + 1} [${purpose}]: Quẻ #${c.number} ${c.name}`;
          })
          .join("\n") +
        "\n";
    } else if (drawnCards && drawnCards.length === 7) {
      spreadInfo =
        `\n【Trận Pháp Thất Tinh (7 Lá)】:\n` +
        drawnCards
          .map(
            (c, i) =>
              `${SEVEN_STARS_POSITIONS[i]?.name}: Quẻ #${c.number} ${c.name}`
          )
          .join("\n") +
        "\n";
    } else if (drawnCards && (drawnCards.length === 9 || spreadType === "nine_palaces")) {
      spreadInfo =
        `\n【Trận Pháp Cửu Cung Phong Thủy (9 Lá)】:\n` +
        drawnCards
          .map(
            (c, i) =>
              `${NINE_PALACES_POSITIONS[i]?.name || `Lá ${i + 1}`}: Quẻ #${c.number} ${c.name}`
          )
          .join("\n") +
        "\n";
    } else if (drawnCards && (drawnCards.length === 11 || spreadType === "ten_stars_expanded")) {
      const combo =
        !isCard2AReversed && !isCard2BReversed
          ? "Cùng Thuận (Hỗ Trợ Toàn Diện)"
          : isCard2AReversed && isCard2BReversed
          ? "Cùng Nghịch (Trùng Điệp Trở Ngại)"
          : !isCard2AReversed && isCard2BReversed
          ? "Thuận - Nghịch (Hỗ Trợ Đan Xen Trở Ngại)"
          : "Nghịch - Thuận (Trước Trở Ngại Sau Hỗ Trợ)";
      spreadInfo =
        `\n【Trận Pháp Thập Tinh Mở Rộng (11 Lá: 2A & 2B - Thế: ${combo})】:\n` +
        drawnCards
          .map(
            (c, i) =>
              `${TEN_STARS_EXPANDED_POSITIONS[i]?.name || `Lá ${i + 1}`}${
                i === 1 ? ` (${isCard2AReversed ? "Nghịch: Trở Ngại" : "Thuận: Hỗ Trợ"})` : i === 2 ? ` (${isCard2BReversed ? "Nghịch: Trở Ngại" : "Thuận: Hỗ Trợ"})` : ""
              }: Quẻ #${c.number} ${c.name}`
          )
          .join("\n") +
        "\n";
    } else if (drawnCards && (drawnCards.length === 10 || spreadType === "ten_stars")) {
      spreadInfo =
        `\n【Trận Pháp Thập Tinh (10 Lá)】:\n` +
        drawnCards
          .map(
            (c, i) =>
              `${TEN_STARS_POSITIONS[i]?.name}: Quẻ #${c.number} ${c.name}`
          )
          .join("\n") +
        "\n";
    } else if (drawnCards && drawnCards.length === 3) {
      if (threeMode === "choice_abc") {
        spreadInfo =
          `\n【Trận Pháp 3 Lá - So Sánh 3 Lựa Chọn】:\n` +
          `- Lựa chọn A [${choiceALabel || "Lựa chọn A"}]: Quẻ #${drawnCards[0].number} ${drawnCards[0].name}\n` +
          `- Lựa chọn B [${choiceBLabel || "Lựa chọn B"}]: Quẻ #${drawnCards[1].number} ${drawnCards[1].name}\n` +
          `- Lựa chọn C [${choiceCLabel || "Lựa chọn C"}]: Quẻ #${drawnCards[2].number} ${drawnCards[2].name}\n\n`;
      } else if (threeMode === "ngu_che" || spreadType === "nguche") {
        spreadInfo =
          `\n【Ngự Chế Tân Tập Đoán Dịch Tinh Túy - Bốc 3 Lá Thiên Địa Nhân (Lấy Lá Cuối Làm Quẻ)】:\n` +
          `- Lá 1 (Thiên Đạo): Quẻ #${drawnCards[0].number} ${drawnCards[0].name}\n` +
          `- Lá 2 (Địa Đạo): Quẻ #${drawnCards[1].number} ${drawnCards[1].name}\n` +
          `- Lá 3 (Nhân Đạo • Lá Cuối Cùng Làm Quẻ Chủ): Quẻ #${drawnCards[2].number} ${drawnCards[2].name}\n\n`;
      } else if (threeMode === "tam_tai") {
        spreadInfo =
          `\n【Trận Pháp 3 Lá - Tam Tài (Thiên — Địa — Nhân)】:\n` +
          `- Thiên Đạo [Thiên Thời / Hoàn Cảnh Khách Quan]: Quẻ #${drawnCards[0].number} ${drawnCards[0].name}\n` +
          `- Địa Đạo [Địa Lợi / Nền Tảng Môi Trường]: Quẻ #${drawnCards[1].number} ${drawnCards[1].name}\n` +
          `- Nhân Đạo [Nhân Hòa / Con Người & Hành Động]: Quẻ #${drawnCards[2].number} ${drawnCards[2].name}\n\n`;
      } else {
        spreadInfo =
          `\n【Trận Pháp 3 Lá - Tiến Trình Dòng Thời Gian】:\n` +
          `- Quá Khứ: Quẻ #${drawnCards[0].number} ${drawnCards[0].name}\n` +
          `- Hiện Tại: Quẻ #${drawnCards[1].number} ${drawnCards[1].name}\n` +
          `- Tương Lai: Quẻ #${drawnCards[2].number} ${drawnCards[2].name}\n\n`;
      }
    } else if (doubleMode === "choice_ab" && transformedHexagram) {
      spreadInfo =
        `\n【Trận Pháp 2 Lá - So Sánh 2 Lựa Chọn】:\n` +
        `- Lựa chọn A [${choiceALabel || "Lựa chọn A"}]: Quẻ #${primaryHexagram.number} ${primaryHexagram.name}\n` +
        `- Lựa chọn B [${choiceBLabel || "Lựa chọn B"}]: Quẻ #${transformedHexagram.number} ${transformedHexagram.name}\n\n`;
    }

    const text = `【BỐC BÀI KINH DỊCH】\n` +
      `Câu hỏi: ${question || "Không có"}\n` +
      `Lĩnh vực: ${category}\n` +
      spreadInfo +
      `Quẻ Chủ: Quẻ số ${primaryHexagram.number} - ${primaryHexagram.name} (${primaryHexagram.vietnameseName})\n` +
      (changingLines.length > 0 && (!transformedHexagram || primaryHexagram.number !== transformedHexagram.number)
        ? `Hào Động: ${changingLines.map(l => `Hào ${l}`).join(", ")}\n`
        : "") +
      (transformedHexagram ? `Quẻ Biến: Quẻ số ${transformedHexagram.number} - ${transformedHexagram.name} (${transformedHexagram.vietnameseName})\n` : "") +
      `\nThoán từ: ${primaryHexagram.judgment}\n` +
      `Đại tượng: ${primaryHexagram.image}\n` +
      `\nLời khuyên: ${primaryHexagram.advice}\n` +
      (initialAiText ? `\n【Luận giải】:\n${initialAiText}` : "");

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-6xl xl:max-w-7xl mx-auto space-y-6">
      {/* Top Card: Question & Hexagrams Summary */}
      <div className="royal-frame p-5 sm:p-8">
        <span className="royal-corner tl" />
        <span className="royal-corner tr" />
        <span className="royal-corner bl" />
        <span className="royal-corner br" />
        {/* Question Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between border-b border-gold-800 pb-6 mb-6 gap-5">
          <div className="min-w-0">
            <div className="flex items-center gap-x-3 gap-y-1.5 flex-wrap text-[11px] uppercase tracking-[0.22em] text-gold-500">
              <span className="font-medium">Tâm niệm thỉnh vấn</span>
              <span className="h-px w-6 bg-gold-700" />
              <span className="normal-case tracking-[0.08em] font-serif text-[12.5px] text-gold-300 border border-gold-700 rounded-sm px-2 py-0.5">
                {category}
              </span>
              {deckCount && deckCount > 1 && (
                <span className="normal-case tracking-normal font-serif text-[12px] text-ivory-300 border border-gold-800 rounded-sm px-2 py-0.5 flex items-center gap-1">
                  <span>{deckCount} Bộ Bài</span>
                  <span className="text-ivory-500 font-normal">
                    ({multiDeckMode === "combined" ? `Trộn chung ${deckCount * 64} lá` : "Bốc riêng từng bộ"})
                  </span>
                </span>
              )}
            </div>
            <h2 className="royal-title italic mt-3 text-2xl sm:text-3xl">
              “{question || "Xem tổng quan thời vận và định hướng hành sự"}”
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCaptureCards}
              disabled={isCapturing}
              className="royal-btn-ghost !px-3.5 !py-2 !text-[11px]"
              title="Chụp ảnh toàn bộ các lá bài đã bốc thành tệp hình PNG"
            >
              {isCapturing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-gold-500" />
              ) : capturedSuccess ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Camera className="w-3.5 h-3.5 text-gold-500" />
              )}
              {isCapturing ? "Đang chụp..." : capturedSuccess ? "Đã lưu ảnh!" : "Chụp Toàn Bộ Lá Bài"}
            </button>
            {exportedCardsUrl && (
              <button
                onClick={() => setShowExportModal(true)}
                className="royal-btn-ghost !px-3.5 !py-2 !text-[11px]"
                title="Mở lại ảnh đã xuất để phóng to/thu nhỏ lá bài"
              >
                <ZoomIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Phóng to ảnh xuất</span>
              </button>
            )}
            <button
              onClick={handleCopy}
              className="royal-btn-ghost !px-3.5 !py-2 !text-[11px]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Đã chép" : "Sao chép"}
            </button>
            <button
              onClick={handleSave}
              className="royal-btn !px-4 !py-2 !text-[11px]"
            >
              <Bookmark className="w-3.5 h-3.5" />
              {isSaved ? "Đã Lưu!" : "Lưu Quẻ"}
            </button>
          </div>
        </div>

        {/* Mode-specific banner for 2-card draw */}
        {doubleMode === "choice_ab" && transformedHexagram && (!drawnCards || drawnCards.length !== 3) && (
          <div className="mb-5 border border-gold-800 border-l-2 border-l-gold-500 bg-lacquer-950/50 px-4 py-4 sm:px-5 flex items-start gap-4">
            <Scale className="w-5 h-5 text-gold-500 shrink-0 mt-1" />
            <div className="space-y-1.5 flex-1">
              <h4 className="text-[11px] font-medium uppercase tracking-[0.2em] text-gold-400 flex items-center justify-between flex-wrap gap-x-3 gap-y-1">
                <span>QUẺ SO SÁNH HAI LỰA CHỌN (A & B)</span>
                <span className="normal-case tracking-[0.04em] font-serif italic text-[12px] text-ivory-500">
                  Cân nhắc ngã rẽ và định hướng
                </span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 border-t border-lacquer-700">
                <div className="bg-lacquer-900 p-2.5 rounded-sm border border-gold-800">
                  <div className="text-gold-500 font-bold flex items-center gap-1.5 mb-0.5">
                    <span className="w-4 h-4 rounded bg-lacquer-700 text-gold-500 text-[10px] flex items-center justify-center font-mono">A</span>
                    {choiceALabel || "Lựa chọn A"}:
                  </div>
                  <div className="text-ivory-300">
                    Quẻ {primaryHexagram.number} {primaryHexagram.name}
                  </div>
                </div>
                <div className="bg-lacquer-900 p-2.5 rounded-sm border border-gold-800">
                  <div className="text-[#E28355] font-bold flex items-center gap-1.5 mb-0.5">
                    <span className="w-4 h-4 rounded bg-lacquer-700 text-[#E28355] text-[10px] flex items-center justify-center font-mono">B</span>
                    {choiceBLabel || "Lựa chọn B"}:
                  </div>
                  <div className="text-ivory-300">
                    Quẻ {transformedHexagram.number} {transformedHexagram.name}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {doubleMode === "present_future" && transformedHexagram && (!drawnCards || drawnCards.length !== 3) && (
          <div className="mb-5 border border-gold-800 border-l-2 border-l-gold-500 bg-lacquer-950/50 px-4 py-4 sm:px-5 flex items-start gap-4">
            <Clock className="w-5 h-5 text-gold-500 shrink-0 mt-0.5" />
            <div className="space-y-1 flex-1">
              <h4 className="text-[11px] font-medium uppercase tracking-[0.2em] text-gold-400">
                QUẺ TIẾN TRÌNH HIỆN TẠI & TƯƠNG LAI
              </h4>
              <p className="text-xs text-ivory-300">
                <strong className="text-gold-500">Hiện Tại:</strong> Quẻ #{primaryHexagram.number} {primaryHexagram.name} ({primaryHexagram.vietnameseName}) phản ánh căn nguyên thực tại • <strong className="text-[#E28355]">Tương Lai:</strong> Quẻ #{transformedHexagram.number} {transformedHexagram.name} ({transformedHexagram.vietnameseName}) hé lộ xu hướng biến dịch.
              </p>
            </div>
          </div>
        )}

        {/* Banner for Yarrow Stalks Divination */}
        {spreadType === "yarrow" && (
          <div className="mb-5 border border-gold-800 border-l-2 border-l-gold-500 bg-lacquer-950/50 px-4 py-4 sm:px-5 flex items-start gap-4">
            <span className="royal-seal w-8 h-8 text-sm shrink-0">蓍</span>
            <div className="space-y-1 flex-1">
              <h4 className="text-[11px] font-medium uppercase tracking-[0.2em] text-gold-400 flex items-center justify-between flex-wrap gap-x-3 gap-y-1">
                <span>PHÉP CHIÊM BẶC CỎ THI (CHU DỊCH ĐẠI DIỄN CHI SỐ)</span>
                <span className="normal-case tracking-[0.04em] font-serif italic text-[12px] text-ivory-500">
                  50 Cọng Cỏ Thi • 18 Lần Biến Đổi
                </span>
              </h4>
              <p className="text-xs text-ivory-300">
                Quẻ được lập theo nghi thức truyền thống Đại Diễn chi số (Hệ Từ Thượng - Khổng Tử).
                {changingLines.length > 0 ? (
                  <span>
                    {" "}Xuất hiện các hào Lão Âm (6) / Lão Dương (9) động:{" "}
                    <strong className="text-amber-400">{changingLines.map((l) => `Hào ${l}`).join(", ")}</strong>
                    {transformedHexagram ? ` dẫn đến Biến Quẻ #${transformedHexagram.number} ${transformedHexagram.name}.` : "."}
                  </span>
                ) : (
                  <span> Toàn bộ 6 hào đều là Thiếu Âm (8) / Thiếu Dương (7), là Quẻ Tĩnh thuần nhất.</span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Banner for 3 Coins Divination */}
        {spreadType === "coins" && (
          <div className="mb-5 border border-gold-800 border-l-2 border-l-gold-500 bg-lacquer-950/50 px-4 py-4 sm:px-5 flex items-start gap-4">
            <span className="royal-seal w-8 h-8 text-sm shrink-0">錢</span>
            <div className="space-y-1 flex-1">
              <h4 className="text-[11px] font-medium uppercase tracking-[0.2em] text-gold-400 flex items-center justify-between flex-wrap gap-x-3 gap-y-1">
                <span>GIEO BA ĐỒNG TIỀN CỔ (LỤC HÀO BỐC DỊCH)</span>
                <span className="normal-case tracking-[0.04em] font-serif italic text-[12px] text-ivory-500">
                  3 Đồng Càn Long Thông Bảo • 6 Lần Gieo
                </span>
              </h4>
              <p className="text-xs text-ivory-300">
                Quẻ được xác lập theo phương pháp Lục Hào bốc dịch cổ truyền từ Sơ Hào lên Thượng Hào.
                {changingLines.length > 0 ? (
                  <span>
                    {" "}Các hào động biến:{" "}
                    <strong className="text-amber-400">{changingLines.map((l) => `Hào ${l}`).join(", ")}</strong>
                    {transformedHexagram ? ` chuyển hóa thành Quẻ Biến #${transformedHexagram.number} ${transformedHexagram.name}.` : "."}
                  </span>
                ) : (
                  <span> Quẻ không có hào động (Quẻ Tĩnh), thời vận giữ vững tính chất nguyên bản.</span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Banner for Mai Hoa Divination */}
        {spreadType === "maihoa" && (
          <div className="mb-5 border border-gold-800 border-l-2 border-l-gold-500 bg-lacquer-950/50 px-4 py-4 sm:px-5 flex items-start gap-4">
            <span className="royal-seal w-8 h-8 text-sm shrink-0">梅</span>
            <div className="space-y-1 flex-1">
              <h4 className="text-[11px] font-medium uppercase tracking-[0.2em] text-gold-400 flex items-center justify-between flex-wrap gap-x-3 gap-y-1">
                <span>PHÉP THỈNH QUẺ MAI HOA DỊCH SỐ (THIỆU KHANG TIẾT)</span>
                <span className="normal-case tracking-[0.04em] font-serif italic text-[12px] text-ivory-500">
                  Mai Hoa Tâm Dịch • Luận Định Thể Dụng
                </span>
              </h4>
              <p className="text-xs text-ivory-300">
                Quẻ được khởi lập theo nguyên lý Tiên Thiên Bát Quái Mai Hoa Dịch Số của Thiệu Ung (Thiệu Khang Tiết Tiên Sinh).
                {changingLines.length > 0 ? (
                  <span>
                    {" "}Hào động biến:{" "}
                    <strong className="text-amber-400">{changingLines.map((l) => `Hào ${l}`).join(", ")}</strong>
                    {transformedHexagram ? ` dẫn xuất Quẻ Biến #${transformedHexagram.number} ${transformedHexagram.name}.` : "."}
                  </span>
                ) : (
                  <span> Quẻ không có hào động (Quẻ Tĩnh), thời vận giữ vững tính chất nguyên bản.</span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Banner for Ky Mon Divination */}
        {spreadType === "kymon" && (
          <div className="mb-5 border border-gold-800 border-l-2 border-l-gold-500 bg-lacquer-950/50 px-4 py-4 sm:px-5 flex items-start gap-4">
            <span className="royal-seal w-8 h-8 text-sm shrink-0">奇</span>
            <div className="space-y-1 flex-1">
              <h4 className="text-[11px] font-medium uppercase tracking-[0.2em] text-gold-400 flex items-center justify-between flex-wrap gap-x-3 gap-y-1">
                <span>PHÉP LẬP QUẺ KỲ MÔN ĐỘN GIÁP (BÁT TRẬN ĐỒ)</span>
                <span className="normal-case tracking-[0.04em] font-serif italic text-[12px] text-ivory-500">
                  Tam Thức • Kỳ Môn Hóa Dịch • Định Vị Địa Lợi
                </span>
              </h4>
              <p className="text-xs text-ivory-300">
                Quẻ được khởi lập theo nguyên lý Kỳ Môn Độn Giáp, phối hợp giữa Cửu Cung Lạc Thư, Cửu Tinh, Bát Môn và Bát Thần.
                {changingLines.length > 0 ? (
                  <span>
                    {" "}Hào động biến:{" "}
                    <strong className="text-amber-400">{changingLines.map((l) => `Hào ${l}`).join(", ")}</strong>
                    {transformedHexagram ? ` dẫn xuất Quẻ Biến #${transformedHexagram.number} ${transformedHexagram.name}.` : "."}
                  </span>
                ) : (
                  <span> Quẻ không có hào động (Quẻ Tĩnh), thời vận giữ vững tính chất nguyên bản.</span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Banner for Thai At Divination */}
        {spreadType === "thaiat" && (
          <div className="mb-5 border border-gold-800 border-l-2 border-l-gold-500 bg-lacquer-950/50 px-4 py-4 sm:px-5 flex items-start gap-4">
            <span className="royal-seal w-8 h-8 text-sm shrink-0">乙</span>
            <div className="space-y-1 flex-1">
              <h4 className="text-[11px] font-medium uppercase tracking-[0.2em] text-gold-400 flex items-center justify-between flex-wrap gap-x-3 gap-y-1">
                <span>PHÉP LẬP QUẺ THÁI ẤT THẦN SỐ (TAM THỨC CHI THƯỢNG)</span>
                <span className="normal-case tracking-[0.04em] font-serif italic text-[12px] text-ivory-500">
                  Tam Thức • Thái Ất Hóa Dịch • Định Đoán Thiên Thời
                </span>
              </h4>
              <p className="text-xs text-ivory-300">
                Quẻ được khởi lập theo nguyên lý Thái Ất Thần Số, phối hợp Cửu Cung Thái Ất, 72 Cục Âm Dương, Chủ Toán - Khách Toán và Ngũ Phúc cát thần.
                {changingLines.length > 0 ? (
                  <span>
                    {" "}Hào động biến:{" "}
                    <strong className="text-amber-400">{changingLines.map((l) => `Hào ${l}`).join(", ")}</strong>
                    {transformedHexagram ? ` dẫn xuất Quẻ Biến #${transformedHexagram.number} ${transformedHexagram.name}.` : "."}
                  </span>
                ) : (
                  <span> Quẻ không có hào động (Quẻ Tĩnh), thời vận giữ vững tính chất nguyên bản.</span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Banner for Luc Nham Divination */}
        {spreadType === "lucnham" && (
          <div className="mb-5 border border-gold-800 border-l-2 border-l-gold-500 bg-lacquer-950/50 px-4 py-4 sm:px-5 flex items-start gap-4">
            <span className="royal-seal w-8 h-8 text-sm shrink-0">壬</span>
            <div className="space-y-1 flex-1">
              <h4 className="text-[11px] font-medium uppercase tracking-[0.2em] text-gold-400 flex items-center justify-between flex-wrap gap-x-3 gap-y-1">
                <span>PHÉP LẬP QUẺ LỤC NHÂM ĐẠI ĐỘN (TAM THỨC CHI THỦ)</span>
                <span className="normal-case tracking-[0.04em] font-serif italic text-[12px] text-ivory-500">
                  Tam Thức • Lục Nhâm Hóa Dịch • Định Đoán Nhân Sự
                </span>
              </h4>
              <p className="text-xs text-ivory-300">
                Quẻ được khởi lập theo nguyên lý Lục Nhâm Đại Độn, phối hợp Tứ Khóa, Tam Truyền (Sơ Truyền, Trung Truyền, Mạt Truyền), Thiên Địa Bàn và Hoạt Thời 12 Chi.
                {changingLines.length > 0 ? (
                  <span>
                    {" "}Hào động biến:{" "}
                    <strong className="text-amber-400">{changingLines.map((l) => `Hào ${l}`).join(", ")}</strong>
                    {transformedHexagram ? ` dẫn xuất Quẻ Biến #${transformedHexagram.number} ${transformedHexagram.name}.` : "."}
                  </span>
                ) : (
                  <span> Quẻ không có hào động (Quẻ Tĩnh), thời vận giữ vững tính chất nguyên bản.</span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Mode-specific banner for 12 Địa Chi & Tử Vi spread */}
        {drawnCards && (spreadType === "twelve_houses" || (drawnCards.length === 12 && spreadType !== "custom")) && (
          <div className="mb-5 border border-gold-800 border-l-2 border-l-gold-500 bg-lacquer-950/50 px-4 py-4 sm:px-5 flex items-start gap-4">
            <Compass className="w-5 h-5 text-gold-500 shrink-0 mt-0.5" />
            <div className="space-y-1.5 flex-1">
              <h4 className="text-[11px] font-medium uppercase tracking-[0.2em] text-gold-400 flex items-center justify-between flex-wrap gap-x-3 gap-y-1">
                <span>TRẬN PHÁP 12 ĐỊA CHI & 12 CUNG TỬ VI (12 LÁ BÀI DỊCH HỌC)</span>
                <span className="normal-case tracking-[0.04em] font-serif italic text-[12px] text-ivory-500">
                  Bàn 4 Lá Ngang x 4 Lá Dọc • La Bàn Thiên Địa
                </span>
              </h4>
              <p className="text-xs text-ivory-300">
                Bố cục 12 Địa Chi theo chiều kim đồng hồ (Dần là Tháng Giêng, Mão Tháng 2...). La Bàn Thiên Địa ở trung tâm định vị Mệnh Cung và luân chuyển 12 Cung Tử Vi (Thuận/Nghịch). Lia chuột vào bất kỳ lá bài nào để cầm lá bài lên lại gần.
              </p>
            </div>
          </div>
        )}

        {/* Mode-specific banner for custom spread */}
        {drawnCards && (spreadType === "custom" || customPositions || (drawnCards.length !== 1 && drawnCards.length !== 2 && drawnCards.length !== 3 && drawnCards.length !== 7 && drawnCards.length !== 9 && drawnCards.length !== 10 && drawnCards.length !== 11 && drawnCards.length !== 12)) && (
          <div className="mb-5 border border-gold-800 border-l-2 border-l-gold-500 bg-lacquer-950/50 px-4 py-4 sm:px-5 flex items-start gap-4">
            <Sliders className="w-5 h-5 text-gold-500 shrink-0 mt-0.5" />
            <div className="space-y-1.5 flex-1">
              <h4 className="text-[11px] font-medium uppercase tracking-[0.2em] text-gold-400 flex items-center justify-between flex-wrap gap-x-3 gap-y-1">
                <span>TRẬN PHÁP TÙY CHỈNH: {drawnCards.length} LÁ BÀI DỊCH HỌC</span>
                <span className="normal-case tracking-[0.04em] font-serif italic text-[12px] text-ivory-500">
                  {drawnCards.length} Vị Trí Thiết Lập Riêng
                </span>
              </h4>
              <p className="text-xs text-ivory-300">
                Mỗi lá bài được gán một mục đích thỉnh vấn cụ thể do bạn thiết lập. Bấm vào từng lá bài trong trận pháp để tra cứu chi tiết và nghe Dịch Tiên Sinh luận giải.
              </p>
            </div>
          </div>
        )}

        {/* Visual Hexagram Cards Grid / Traditional I Ching Hexagram Figure */}
        {isYarrowOrCoins ? (
          <div className="space-y-4">
            <TraditionalHexagramFigure
              primaryHexagram={primaryHexagram}
              changingLines={changingLines}
              transformedHexagram={transformedHexagram}
              title={
                spreadType === "yarrow"
                  ? "ĐỒ HÌNH CHIÊM BẶC CỎ THI (CHU DỊCH ĐẠI DIỄN CHI SỐ)"
                  : "ĐỒ HÌNH GIEO 3 ĐỒNG TIỀN CỔ (LỤC HÀO NẠP GIÁP)"
              }
              sourceMethodName={
                spreadType === "yarrow"
                  ? "Phương pháp Rút Cỏ Thi 50 Cọng (Đại Diễn Kinh Dịch)"
                  : "Phương pháp Gieo 3 Đồng Cổ Tiền Càn Long (Lục Hào Nạp Giáp)"
              }
            />
          </div>
        ) : drawnCards && (spreadType === "custom" || customPositions || spreadType === "seven_stars" || drawnCards.length === 7 || spreadType === "nine_palaces" || drawnCards.length === 9 || spreadType === "ten_stars" || drawnCards.length === 10 || spreadType === "ten_stars_expanded" || drawnCards.length === 11 || spreadType === "twelve_houses" || drawnCards.length === 12 || drawnCards.length > 3) ? (
          <div className="space-y-4">
            <div>
              <SpreadDiagram
                allFlipped={allCardsFlipped}
                spreadType={
                  spreadType === "twelve_houses" || (drawnCards.length === 12 && spreadType !== "custom")
                    ? "twelve_houses"
                    : drawnCards.length === 11 || spreadType === "ten_stars_expanded"
                    ? "ten_stars_expanded"
                    : drawnCards.length === 10 || spreadType === "ten_stars"
                    ? "ten_stars"
                    : drawnCards.length === 9 || spreadType === "nine_palaces"
                    ? "nine_palaces"
                    : drawnCards.length === 7 || spreadType === "seven_stars"
                    ? "seven_stars"
                    : "custom"
                }
                cards={drawnCards}
                cardImages={cardImages}
                cardVideos={cardVideos}
                cardBackUrl={cardBackImage}
                selectedCardIndex={selectedCardIdx}
                onSelectCard={(idx) => setSelectedCardIdx(idx)}
                onImageUpdated={onImageUpdated}
                onVideoUpdated={onVideoUpdated}
                interactive={true}
                isCard2Reversed={isCard2Reversed}
                onToggleCard2Reversed={onToggleCard2Reversed}
                isCard2AReversed={isCard2AReversed}
                onToggleCard2AReversed={onToggleCard2AReversed}
                isCard2BReversed={isCard2BReversed}
                onToggleCard2BReversed={onToggleCard2BReversed}
                cardsContainerRef={cardsContainerRef}
                customPositions={customPositions}
                fitMode={cardFitMode}
                menhBranchNumber={menhBranchNumber}
                diceRollResult={diceRollResult}
                onHoverCard={handleHoverCard}
                onLeaveCard={handleLeaveCard}
                enableHoverZoom={enableHoverZoom}
                onToggleHoverZoom={toggleHoverZoom}
                enableSelectionHighlight={enableSelectionHighlight}
                onToggleSelectionHighlight={toggleSelectionHighlight}
                companionCards={companionCards}
                companionCardSize={companionCardSize}
                onUpdateCompanionCardSize={handleUpdateCompanionCardSize}
                showCompanionButton={showCompanionButton}
                onToggleCompanionButton={toggleCompanionButton}
                showInterpretButton={showInterpretButton}
                onToggleInterpretButton={toggleInterpretButton}
                onDrawCompanionCard={handleDrawCompanion}
                onRemoveCompanionCard={handleRemoveCompanion}
                onNavigateToManual={onNavigateToManual}
                allowFlipOnClick={allowFlipOnClick}
                onToggleAllowFlipOnClick={toggleAllowFlipOnClick}
              />
            </div>
          </div>
        ) : (
          <XuanBaguaStage
            baguaSize="xl"
            className="p-3 sm:p-5 md:p-6 overflow-visible shadow-2xl"
          >
            {/* Header of Cards section: Cố định sẵn */}
            <div className="relative z-10 bg-[#FAF6EE]/95 border border-[#C4963E]/55 rounded-xl p-3 sm:p-4 mb-4 space-y-2.5 transition-all shadow-sm">
              <div className="flex flex-col items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="w-2 h-2 rotate-45 bg-gold-500 shrink-0" />
                    <h3 className="text-base sm:text-lg md:text-xl font-display font-semibold text-ivory-100 tracking-wide">
                      {drawnCards && drawnCards.length === 3
                        ? threeMode === "choice_abc"
                          ? "CÁC LÁ BÀI DỊCH HỌC: SO SÁNH 3 LỰA CHỌN (A — B — C)"
                          : threeMode === "ngu_che" || spreadType === "nguche"
                          ? "NGỰ CHẾ TÂN TẬP ĐOÁN DỊCH TINH TÚY: TAM TÀI (THIÊN — ĐỊA — NHÂN • LẤY LÁ CUỐI LÀM QUẺ)"
                          : threeMode === "tam_tai"
                          ? "CÁC LÁ BÀI DỊCH HỌC: TAM TÀI (THIÊN — ĐỊA — NHÂN)"
                          : "CÁC LÁ BÀI DỊCH HỌC: QUÁ KHỨ — HIỆN TẠI — TƯƠNG LAI"
                        : doubleMode === "choice_ab"
                        ? "CÁC LÁ BÀI DỊCH HỌC: SO SÁNH HAI LỰA CHỌN (A & B)"
                        : doubleMode === "present_future"
                        ? "CÁC LÁ BÀI DỊCH HỌC: TIẾN TRÌNH HIỆN TẠI & TƯƠNG LAI"
                        : "LÁ BÀI DỊCH HỌC BỐC ĐƯỢC (QUẺ CHỦ)"}
                    </h3>
                    <span className="text-[10px] font-mono text-emerald-400/90 bg-[#122416] px-2 py-0.5 rounded border border-[#234D2B] shrink-0">
                      ✓ Cố định sẵn
                    </span>
                  </div>
                  {question ? (
                    <p className="text-xs text-ivory-500 font-serif mt-0.5 italic">
                      Vấn sự: "{question}"
                    </p>
                  ) : null}
                  <p className="text-[11px] text-gold-500/90 font-serif mt-1 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-gold-500 shrink-0" />
                    {allCardsFlipped
                      ? "Đã Khai Ấn Lật Mở toàn bộ mặt quẻ Dịch (Mặt Ngửa 卦)"
                      : "Tất cả quẻ khi ra đều là mặt sấp (Úp Bát Quái ☯) • Nhấp vào từng lá bài hoặc bấm nút bên phải để Khai Ấn Lật Mở"}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap w-full justify-start">
                  {/* Nút lật 3D toàn bộ: Mặt Sấp (Bát Quái) vs Mặt Ngửa (Quẻ Dịch) */}
                  <button
                    type="button"
                    onClick={handleToggleAllCardsFlip}
                    className="no-capture flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-serif font-bold text-gold-300 hover:text-gold-200 bg-lacquer-700 hover:bg-gold-800 border border-gold-800 hover:border-gold-500 transition-all cursor-pointer shadow active:scale-95 group"
                    title="Lật 3D toàn bộ các lá bài giữa mặt Bát Quái (mặt sấp) và mặt Quẻ Dịch (mặt ngửa)"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-gold-500 group-hover:rotate-180 transition-transform duration-500" />
                    <span>{allCardsFlipped ? "Lật Úp Bát Quái (☯ Mặt Sấp)" : "Khai Ấn Lật Mở (卦 Mặt Ngửa)"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCaptureCards}
                    disabled={isCapturing}
                    className="no-capture flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-serif font-bold bg-lacquer-700 hover:bg-gold-800 text-gold-300 hover:text-gold-200 border border-gold-800 transition-all cursor-pointer shadow"
                    title="Chụp ảnh các lá bài đã bốc để lưu trữ hoặc chia sẻ"
                  >
                    {isCapturing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-gold-500" />
                        <span>Đang chụp...</span>
                      </>
                    ) : capturedSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">Đã lưu ảnh!</span>
                      </>
                    ) : (
                      <>
                        <Camera className="w-3.5 h-3.5 text-gold-500" />
                        <span>Chụp Toàn Bộ Lá Bài</span>
                      </>
                    )}
                  </button>

                  {/* Nút chụp riêng quẻ ban đầu cho Mai Hoa, Kỳ Môn, Thái Ất & Lục Nhâm */}
                  {(spreadType === "maihoa" || spreadType === "kymon" || spreadType === "thaiat" || spreadType === "lucnham" || !drawnCards) && (
                    <button
                      type="button"
                      onClick={handleCapturePrimaryCard}
                      disabled={isCapturing}
                      className="no-capture flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-serif font-bold bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20 hover:from-amber-500/30 text-gold-300 border border-[#8C6218] hover:border-gold-500 transition-all cursor-pointer shadow active:scale-95"
                      title="Chụp ảnh riêng Quẻ Hoa Mai / Kỳ Môn / Thái Ất / Lục Nhâm Ban Đầu (Quẻ Chủ / Bản Quái)"
                    >
                      <Camera className="w-3.5 h-3.5 text-gold-300" />
                      <span>Chụp Quẻ Ban Đầu</span>
                    </button>
                  )}

                  {exportedCardsUrl && (
                    <button
                      type="button"
                      onClick={() => setShowExportModal(true)}
                      className="no-capture flex items-center gap-1 px-2.5 py-1.5 rounded-sm text-xs font-serif text-gold-500 bg-lacquer-800 hover:bg-lacquer-700 border border-gold-800 transition-colors cursor-pointer"
                      title="Mở lại ảnh đã xuất để phóng to/thu nhỏ lá bài"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Phóng to ảnh xuất</span>
                    </button>
                  )}

                  {/* Nút Bật/Tắt mở rộng bảng tùy chỉnh chi tiết (Đã cố định sẵn) */}
                  <button
                    type="button"
                    onClick={toggleDetailedControls}
                    className={`no-capture flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-xs font-serif transition-all cursor-pointer border shadow ${
                      showDetailedControls
                        ? "bg-lacquer-700 text-gold-300 border-gold-500 font-bold ring-1 ring-gold-500/50"
                        : "bg-lacquer-800 text-ivory-500 border-gold-800 hover:text-gold-300 hover:border-gold-800"
                    }`}
                    title="Mở rộng / Thu gọn các nút điều khiển chi tiết (cỡ bài, xoay bài, cỡ lá bổ trợ, xem gần...)"
                  >
                    <Settings className="w-3.5 h-3.5 text-gold-500" />
                    <span>{showDetailedControls ? "Thu gọn tùy chỉnh" : "Tùy chỉnh (Cố định sẵn)"}</span>
                    {showDetailedControls ? (
                      <ChevronUp className="w-3 h-3 text-gold-500" />
                    ) : (
                      <ChevronDown className="w-3 h-3 text-ivory-500" />
                    )}
                  </button>
                </div>
              </div>

              {/* Hàng 2 (Mở rộng): Bảng điều khiển chi tiết các thiết lập đã cố định sẵn */}
              {showDetailedControls && (
                <div className="pt-2.5 border-t border-lacquer-700 flex items-center flex-wrap gap-2 animate-in fade-in duration-200">
                  {/* Nút Bật/Tắt Xoay Bài Qua Mặt Sau (Khóa Lật Mặt Trước/Sau khi nhấn) */}
                  <button
                    type="button"
                    onClick={toggleAllowFlipOnClick}
                    className={`no-capture flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-serif transition-colors cursor-pointer shadow border ${
                      allowFlipOnClick
                        ? "bg-lacquer-700 text-gold-300 border-gold-500"
                        : "bg-lacquer-800 text-ivory-500 border-gold-800 hover:text-gold-300"
                    }`}
                    title="Bật/Tắt xoay bài qua mặt sau: Khi TẮT, nhấn vào lá bài sẽ không xoay lật mặt sau hay mặt trước nữa"
                  >
                    <FlipHorizontal className={`w-3.5 h-3.5 ${allowFlipOnClick ? "text-gold-500" : "text-ivory-500"}`} />
                    <span>Xoay Mặt Sau: <strong>{allowFlipOnClick ? "BẬT" : "TẮT (Khóa)"}</strong></span>
                  </button>

                  <button
                    type="button"
                    onClick={toggleHoverZoom}
                    className={`no-capture flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-serif transition-colors cursor-pointer shadow border ${
                      enableHoverZoom
                        ? "bg-lacquer-700 text-gold-300 border-gold-500"
                        : "bg-lacquer-800 text-ivory-500 border-gold-800 hover:text-gold-500"
                    }`}
                    title="Bật/Tắt hiệu ứng cầm lá bài lên lại gần khi lia chuột vào bất kỳ lá bài nào"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Cầm lá bài lại gần: <strong>{enableHoverZoom ? "BẬT" : "TẮT"}</strong></span>
                  </button>

                  <button
                    type="button"
                    onClick={toggleSelectionHighlight}
                    className={`no-capture flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-serif transition-colors cursor-pointer shadow border ${
                      enableSelectionHighlight
                        ? "bg-lacquer-700 text-gold-300 border-gold-500"
                        : "bg-lacquer-800 text-ivory-500 border-gold-800 hover:text-ivory-500"
                    }`}
                    title="Bật/Tắt viền vòng vàng bao quanh lá bài khi nhấp chọn"
                  >
                    <CircleDot className="w-3.5 h-3.5" />
                    <span>Vòng vàng chọn: <strong>{enableSelectionHighlight ? "BẬT" : "TẮT"}</strong></span>
                  </button>

                  {/* Tắt/Mở Nút Bốc Thêm */}
                  <button
                    type="button"
                    onClick={toggleCompanionButton}
                    className={`no-capture flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-serif transition-colors cursor-pointer shadow border ${
                      showCompanionButton
                        ? "bg-lacquer-700 text-gold-300 border-gold-500"
                        : "bg-lacquer-800 text-ivory-500 border-gold-800 hover:text-ivory-500"
                    }`}
                    title="Bật/Tắt hiển thị nút 'Bốc thêm' trên các lá bài"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ô Bốc thêm: <strong>{showCompanionButton ? "BẬT" : "TẮT"}</strong></span>
                  </button>

                  {/* Tắt/Mở Nút Luận Giải */}
                  <button
                    type="button"
                    onClick={toggleInterpretButton}
                    className={`no-capture flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-serif transition-colors cursor-pointer shadow border ${
                      showInterpretButton
                        ? "bg-lacquer-700 text-gold-300 border-gold-500"
                        : "bg-lacquer-800 text-ivory-500 border-gold-800 hover:text-ivory-500"
                    }`}
                    title="Bật/Tắt hiển thị nút 'Luận giải' trên các lá bài"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ô Luận giải: <strong>{showInterpretButton ? "BẬT" : "TẮT"}</strong></span>
                  </button>

                  {/* Bộ chọn kích thước lá bài bổ trợ */}
                  <div className="no-capture flex items-center gap-1 bg-lacquer-800 border border-gold-800 rounded-sm p-0.5 flex-wrap">
                    <span className="text-[10px] text-ivory-500 px-1.5 font-mono">Bổ trợ:</span>
                    {(
                      [
                        { key: "same", label: "Bằng lá chính" },
                        { key: "large", label: "To rõ" },
                        { key: "xlarge", label: "Cực đại" },
                      ] as const
                    ).map((s) => (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => handleUpdateCompanionCardSize(s.key)}
                        className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors cursor-pointer ${
                          companionCardSize === s.key || (s.key === "same" && (companionCardSize === "third" || companionCardSize === "normal"))
                            ? "bg-gold-500 text-black font-bold shadow-xs"
                            : "text-ivory-300 hover:text-gold-300 hover:bg-lacquer-700"
                        }`}
                        title={`Đổi kích cỡ lá bốc thêm bổ trợ: ${s.label}`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setCardFitMode((prev) => (prev === "contain" ? "cover" : "contain"))}
                    className="no-capture flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-serif bg-lacquer-800 hover:bg-lacquer-700 text-gold-500 border border-gold-800 transition-colors cursor-pointer shadow"
                    title={
                      cardFitMode === "contain"
                        ? "Đang hiện toàn bộ ảnh lá bài nguyên vẹn không bị zoom mất một phần. Bấm để chuyển sang lấp đầy khung"
                        : "Đang lấp đầy khung bài. Bấm để hiển thị trọn vẹn toàn bộ ảnh lá bài không bị zoom cắt"
                    }
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>{cardFitMode === "contain" ? "Toàn Bộ Ảnh" : "Lấp Đầy Khung"}</span>
                  </button>

                  {/* Bộ chọn kích thước lá bài nhiều kích cỡ */}
                  <div className="no-capture flex items-center gap-1 bg-lacquer-800 border border-gold-800 rounded-sm p-0.5">
                    <span className="text-[10px] text-ivory-500 px-1.5 font-mono">Cỡ:</span>
                    {(
                      [
                        { key: "mini", label: "Mini" },
                        { key: "compact", label: "Nhỏ" },
                        { key: "normal", label: "Vừa" },
                        { key: "large", label: "Lớn" },
                        { key: "xlarge", label: "Rất Lớn" },
                      ] as const
                    ).map((s) => (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => handleUpdateDetailCardSize(s.key)}
                        className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors cursor-pointer ${
                          detailCardSize === s.key
                            ? "bg-gold-500 text-black font-bold shadow-xs"
                            : "text-ivory-300 hover:text-gold-300 hover:bg-lacquer-700"
                        }`}
                        title={`Đổi kích cỡ hiển thị lá bài: ${s.label}`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Cards 3 or 1/2 - KHU VỰC CHỤP CHỈ LẤY CÁC LÁ BÀI */}
            {drawnCards && drawnCards.length === 3 ? (
              (() => {
                const hasAnyThreeComp = drawnCards.some((_, i) => getCompanionList(`card_${i}`).length > 0);
                return (
                  <div
                    ref={cardsContainerRef}
                    className={`grid gap-4 sm:gap-6 items-stretch p-3 sm:p-6 bg-lacquer-900 rounded-md max-w-7xl mx-auto relative overflow-visible ${
                      hasAnyThreeComp ? "grid-cols-1" : "grid-cols-1 md:grid-cols-3"
                    }`}
                  >
                    {/* Header Banner - Xuất hiện khi xem hoặc chụp ảnh */}
                    <div className="col-span-full w-full text-center py-2 mb-2 border-b border-gold-800/80 bg-gradient-to-r from-transparent via-lacquer-800 to-transparent">
                      <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-serif font-bold text-gold-300 tracking-widest uppercase">
                        <Sparkles className="w-3.5 h-3.5 text-gold-500" />
                        <span>
                          CỬU NHỊ DỊCH HỌC • {threeMode === "tam_tai" ? "TRẬN PHÁP TAM TÀI (THIÊN - ĐỊA - NHÂN)" : threeMode === "ngu_che" ? "TRẬN PHÁP NGỰ CHẾ TINH TÚY" : threeMode === "choice_abc" ? "TRẬN PHÁP TAM PHƯƠNG ÁN" : "TRẬN PHÁP TAM THỜI (QUÁ KHỨ - HIỆN TẠI - TƯƠNG LAI)"}
                        </span>
                        <Sparkles className="w-3.5 h-3.5 text-gold-500" />
                      </div>
                      <p className="text-[10px] text-ivory-500 font-mono mt-0.5">
                        ✦ Thời khắc chiêm bốc: {new Date().toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} ✦
                      </p>
                    </div>
                {drawnCards.map((card, idx) => {
                  const slotKey = `card_${idx}`;
                  const companionList = getCompanionList(slotKey);
                  const roleTitle =
                    threeMode === "choice_abc"
                      ? idx === 0
                        ? `LÁ 1: [LỰA CHỌN A] ${choiceALabel || "Phương án A"}`
                        : idx === 1
                        ? `LÁ 2: [LỰA CHỌN B] ${choiceBLabel || "Phương án B"}`
                        : `LÁ 3: [LỰA CHỌN C] ${choiceCLabel || "Phương án C"}`
                      : threeMode === "ngu_che" || spreadType === "nguche"
                      ? idx === 0
                        ? "LÁ 1: THIÊN ĐẠO (THIÊN THỜI)"
                        : idx === 1
                        ? "LÁ 2: ĐỊA ĐẠO (ĐỊA LỢI)"
                        : "LÁ 3 (LÁ CUỐI): NHÂN ĐẠO • QUẺ CHỦ NGỰ CHẾ"
                      : threeMode === "tam_tai"
                      ? idx === 0
                        ? "LÁ 1: THIÊN ĐẠO (THIÊN THỜI & HOÀN CẢNH KHÁCH QUAN)"
                        : idx === 1
                        ? "LÁ 2: ĐỊA ĐẠO (ĐỊA LỢI & NỀN TẢNG MÔI TRƯỜNG)"
                        : "LÁ 3: NHÂN ĐẠO (NHÂN HÒA & CON NGƯỜI HÀNH ĐỘNG)"
                      : idx === 0
                      ? "LÁ 1: QUÁ KHỨ (CĂN NGUYÊN & KHỞI ĐẦU)"
                      : idx === 1
                      ? "LÁ 2: HIỆN TẠI (THỰC TRẠNG & TÌNH THẾ)"
                      : "LÁ 3: TƯƠNG LAI (TRIỂN VỌNG & KẾT QUẢ)";
                  const roleSubtitle =
                    threeMode === "choice_abc"
                      ? `Lựa chọn: ${card.name} (${card.vietnameseName})`
                      : threeMode === "ngu_che" || spreadType === "nguche"
                      ? idx === 0
                        ? `Thiên Đạo: ${card.name} (${card.vietnameseName})`
                        : idx === 1
                        ? `Địa Đạo: ${card.name} (${card.vietnameseName})`
                        : `Nhân Đạo • Lá Cuối Làm Quẻ Chủ: ${card.name} (${card.vietnameseName})`
                      : threeMode === "tam_tai"
                      ? idx === 0
                        ? `Thiên Đạo: ${card.name} (${card.vietnameseName})`
                        : idx === 1
                        ? `Địa Đạo: ${card.name} (${card.vietnameseName})`
                        : `Nhân Đạo: ${card.name} (${card.vietnameseName})`
                      : `Thời kỳ: ${card.name} (${card.vietnameseName})`;
                  const roleColor =
                    idx === 0 ? "text-gold-500" : idx === 1 ? "text-gold-300" : "text-[#E28355]";
                  const isSelected = selectedCardIdx === idx;
                  const showHighlight = isSelected && enableSelectionHighlight;

                  return (
                    <div
                      key={card.instanceId || `${card.number}_${idx}`}
                      onClick={() => setSelectedCardIdx(selectedCardIdx === idx ? null : idx)}
                      onMouseEnter={() =>
                        handleHoverCard({
                          card,
                          positionTitle: roleTitle,
                          positionSubtitle: roleSubtitle,
                          isReversed: card.isReversed ?? false,
                        })
                      }
                      onMouseLeave={handleLeaveCard}
                      className={`bg-lacquer-800 border rounded-sm p-2 sm:p-4 md:p-5 flex flex-col items-center text-center relative overflow-visible transition-all cursor-pointer shadow-lg ${
                        showHighlight || (isNguChe && idx === 2)
                          ? "border-gold-500 ring-2 ring-gold-500 bg-lacquer-800 scale-101"
                          : "border-gold-800 hover:border-gold-700"
                      }`}
                    >
                      {(showHighlight || (isNguChe && idx === 2)) && (
                        <div className="no-capture absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-gold-500 text-lacquer-900 rounded-full text-[8px] sm:text-[9px] font-bold flex items-center justify-center shadow z-20">
                          ✓
                        </div>
                      )}
                      <div className="flex items-center justify-between w-full max-w-[98%] mb-1 sm:mb-2 gap-1">
                        <div className="flex items-center gap-1 flex-wrap truncate">
                          <div className={`text-[8px] sm:text-[10px] font-mono ${roleColor} font-bold uppercase tracking-wider bg-lacquer-700 px-1 sm:px-2 py-0.5 rounded border border-gold-800 truncate`}>
                            {roleTitle}
                          </div>
                          {card.deckNumber && (
                            <span className="text-[8px] sm:text-[9px] font-mono font-bold text-gold-500 bg-lacquer-800 px-1 sm:px-1.5 py-0.5 rounded border border-gold-800">
                              Bộ #{card.deckNumber}
                            </span>
                          )}
                          {(threeMode === "tam_tai" || spreadType === "khongminh") && idx === 2 && (
                            <span className={`text-[8px] sm:text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border flex items-center gap-1 shadow-xs transition-colors ${
                              selectedCardIdx === 2
                                ? "bg-gold-500/15 text-gold-200 border-gold-500"
                                : "bg-lacquer-800 text-gold-300 border-[#5E3F21]"
                            }`}>
                              <Dices className="w-2.5 h-2.5" />
                              <span>{selectedCardIdx === 2 ? "Đang mở xúc xắc 12 mặt" : "Chạm thẻ để mở xúc xắc"}</span>
                            </span>
                          )}
                          {isNguChe && idx === 2 && (
                            <span className="text-[8px] sm:text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border flex items-center gap-1 shadow-xs bg-amber-950/90 text-amber-200 border-amber-500/70">
                              <Dices className="w-2.5 h-2.5 text-amber-400" />
                              <span>Lá Cuối Làm Quẻ Chủ • Xí Ngầu 12 Mặt</span>
                            </span>
                          )}
                        </div>

                        {/* Top-right draw additional card & interpret button */}
                        <div className="no-capture flex items-center gap-1 ml-auto shrink-0 flex-wrap justify-end">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setInspectingTwoSidedCard({
                                card,
                                positionTitle: roleTitle,
                                isReversed: card.isReversed ?? false,
                              });
                            }}
                            className="flex items-center gap-0.5 px-2 py-0.5 rounded-sm bg-[#9A1F1A] hover:bg-[#7A1C18] text-[#FFFDF8] border border-[#C4963E] text-[8.5px] sm:text-[9.5px] font-serif font-bold shadow-sm transition-all cursor-pointer shrink-0 whitespace-nowrap"
                            title="Mở cửa sổ xem song song cả 2 mặt bài (Quẻ Tượng & Thoán Từ)"
                          >
                            <ZoomIn className="w-2.5 h-2.5 text-[#E2C275]" />
                            <span>2 mặt</span>
                          </button>
                          {showCompanionButton && companionList.length === 0 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDrawCompanion(slotKey);
                              }}
                              className="flex items-center gap-0.5 px-2 py-0.5 rounded-sm bg-lacquer-800 hover:bg-gold-500 text-gold-400 hover:text-lacquer-900 border border-gold-800 hover:border-gold-400 text-[8.5px] sm:text-[9.5px] font-mono font-bold shadow-md transition-all cursor-pointer group active:scale-95 shrink-0 whitespace-nowrap"
                              title="Bốc thêm 1 lá kế bên (Lá bổ trợ giải trình)"
                            >
                              <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gold-400 group-hover:text-lacquer-900 group-hover:rotate-90 transition-transform" />
                              <span>Bốc thêm</span>
                            </button>
                          )}
                          {showInterpretButton && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onNavigateToManual?.(card.number);
                              }}
                              className="flex items-center gap-0.5 px-2 py-0.5 rounded-sm bg-lacquer-800 hover:bg-gold-500 text-gold-500 hover:text-lacquer-900 border border-gold-800 hover:border-gold-500 text-[8.5px] sm:text-[9.5px] font-serif font-bold shadow-md transition-all cursor-pointer group active:scale-95 shrink-0 whitespace-nowrap"
                              title={`Xem luận giải Quẻ #${card.number} ở Sách Thuyết Minh`}
                            >
                              <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gold-500 group-hover:text-lacquer-900 transition-colors" />
                              <span>Luận giải</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 my-2 sm:my-3 w-full">
                        {/* Main Card - Kích thước ổn định tuyệt đối không co rút khi bốc thêm */}
                        <div className="shrink-0">
                          <FlippableSpiritualCard
                            key={`${card.instanceId || card.number}_${flipSequenceKey}_${idx}`}
                            hexagram={card}
                            imageUrl={cardImages[card.number]}
                            videoUrl={cardVideos[card.number]}
                            cardBackUrl={cardBackImage}
                            size={getDetailCardSize("lg")}
                            defaultFlipped={allCardsFlipped}
                            fitMode={cardFitMode}
                            isReversed={card.isReversed ?? false}
                            allowFlipOnClick={allowFlipOnClick}
                            deckNumber={card.deckNumber}
                            onImageUpdated={onImageUpdated}
                            onVideoUpdated={onVideoUpdated}
                            enableHoverZoom={enableHoverZoom}
                          />
                        </div>

                        {/* Companion Cards placed next to it ("kế bên") - Supports multiple/recursive */}
                        {companionList.map((cCard, cIdx) => {
                          const isLast = cIdx === companionList.length - 1;
                          return (
                            <div key={`comp_${cCard.number}_${cIdx}`} className={`relative flex flex-col items-center shrink-0 animate-in fade-in zoom-in-95 duration-200 ${isLast ? "pr-8 sm:pr-10" : ""}`}>
                              <div className="flex items-center justify-between w-full px-1 mb-0.5 gap-1">
                                <span className="text-[7.5px] sm:text-[8.5px] font-mono font-bold text-gold-400 bg-lacquer-800 px-1 py-0.2 rounded border border-gold-800 truncate max-w-[62px] sm:max-w-none">
                                  + Kế Bên {companionList.length > 1 ? `#${cIdx + 1}` : ""} #{cCard.number}
                                </span>
                                <div className="flex items-center gap-0.5 no-capture">
                                  {showInterpretButton && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onNavigateToManual?.(cCard.number);
                                      }}
                                      className="text-gold-500 hover:text-gold-200 bg-lacquer-800 hover:bg-gold-800 px-1.5 py-0.5 rounded text-[8px] font-serif font-bold flex items-center gap-0.5 border border-gold-800 transition-colors cursor-pointer"
                                      title={`Xem luận giải Quẻ #${cCard.number} ở Thuyết Minh`}
                                    >
                                      <Eye className="w-2 h-2" />
                                      <span>Luận giải</span>
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const cycleMap: Record<string, "same" | "large" | "xlarge"> = {
                                        same: "large",
                                        large: "xlarge",
                                        xlarge: "same",
                                        third: "same",
                                        normal: "same",
                                      };
                                      handleUpdateCompanionCardSize(cycleMap[companionCardSize] || "same");
                                    }}
                                    className="text-[7.5px] sm:text-[8.5px] font-mono px-1.5 py-0.5 rounded bg-lacquer-800 hover:bg-gold-800 text-gold-400 border border-gold-800 transition-colors cursor-pointer"
                                    title="Bấm đổi cỡ lá bốc thêm (Bằng chính / To rõ / Cực đại)"
                                  >
                                    {companionCardSize === "xlarge"
                                      ? "Cực đại"
                                      : companionCardSize === "large"
                                      ? "To rõ"
                                      : "Bằng chính"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveCompanion(slotKey, cIdx);
                                      handleDrawCompanion(slotKey);
                                    }}
                                    className="text-ivory-500 hover:text-gold-500 p-0.5 transition-colors cursor-pointer"
                                    title="Bốc đổi sang lá khác"
                                  >
                                    <RotateCw className="w-2.5 h-2.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveCompanion(slotKey, cIdx);
                                    }}
                                    className="text-ivory-500 hover:text-rose-400 p-0.5 transition-colors cursor-pointer"
                                    title="Xóa lá bốc thêm này"
                                  >
                                    <X className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                              </div>
                              <div
                                className="relative"
                                onMouseEnter={() =>
                                  handleHoverCard({
                                    card: cCard,
                                    positionTitle: `LÁ BỔ TRỢ KẾ BÊN (${cIdx + 1}): ${roleTitle}`,
                                    positionSubtitle: `Quẻ #${cCard.number} • ${cCard.name} (${cCard.vietnameseName})`,
                                    isReversed: cCard.isReversed ?? false,
                                  })
                                }
                                onMouseLeave={handleLeaveCard}
                              >
                                <FlippableSpiritualCard
                                  hexagram={cCard}
                                  imageUrl={cardImages[cCard.number]}
                                  videoUrl={cardVideos[cCard.number]}
                                  cardBackUrl={cardBackImage}
                                  size={getDetailCardSize(getCompanionCardSize("three"))}
                                  defaultFlipped={allCardsFlipped}
                                  fitMode={cardFitMode}
                                  isReversed={cCard.isReversed ?? false}
                                  allowFlipOnClick={allowFlipOnClick}
                                  onImageUpdated={onImageUpdated}
                                  onVideoUpdated={onVideoUpdated}
                                  enableHoverZoom={enableHoverZoom}
                                />

                                {/* Ở lá bốc thêm cũng thêm được bốc thêm - Dời qua phải 1 xíu như quẻ chính */}
                                {showCompanionButton && isLast && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDrawCompanion(slotKey);
                                    }}
                                    className="no-capture absolute -top-1.5 -right-7 sm:-right-9 z-20 flex items-center gap-1 px-2 py-0.5 rounded-sm bg-lacquer-800 hover:bg-gold-500 text-gold-400 hover:text-lacquer-900 border border-gold-800 hover:border-gold-400 text-[8.5px] sm:text-[9.5px] font-mono font-bold shadow-md transition-all cursor-pointer group active:scale-95 whitespace-nowrap"
                                    title="Bốc thêm tiếp 1 lá kế bên nữa"
                                  >
                                    <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gold-400 group-hover:text-lacquer-900 group-hover:rotate-90 transition-transform" />
                                    <span>Bốc thêm</span>
                                  </button>
                                )}
                              </div>

                              {/* Thông tin lá bốc thêm */}
                              <CardInfoSummary
                                card={cCard}
                                isReversed={cCard.isReversed ?? false}
                                compact={true}
                                roleTitle={`Lá bổ trợ kế bên #${cIdx + 1}`}
                              />
                            </div>
                          );
                        })}
                      </div>

                      {/* THÔNG TIN CHI TIẾT TRỌN VẸN CỦA LÁ BÀI CHÍNH */}
                      <CardInfoSummary
                        card={card}
                        isReversed={card.isReversed ?? false}
                        deckNumber={card.deckNumber}
                        showJudgment={true}
                        showAdvice={true}
                      />
                    </div>
                  );
                })}
                  </div>
                );
              })()
            ) : (
              (() => {
                const primaryList = getCompanionList("primary");
                const transformedList = transformedHexagram ? getCompanionList("transformed") : [];
                const hasCompanion = primaryList.length > 0 || transformedList.length > 0;

                return (
                  <div
                    ref={cardsContainerRef}
                    className={`grid gap-6 sm:gap-10 items-stretch p-3 sm:p-6 bg-lacquer-900 rounded-md max-w-7xl mx-auto relative overflow-visible ${
                      hasCompanion
                        ? "grid-cols-1"
                        : transformedHexagram
                        ? "grid-cols-1 md:grid-cols-2 max-w-6xl"
                        : "grid-cols-1 max-w-3xl"
                    }`}
                  >
                    {/* Header Banner khi chụp ảnh */}
                    <div className="col-span-full w-full text-center py-2 mb-2 border-b border-gold-800/80 bg-gradient-to-r from-transparent via-lacquer-800 to-transparent">
                      <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-serif font-bold text-gold-300 tracking-widest uppercase">
                        <Sparkles className="w-3.5 h-3.5 text-gold-500" />
                        <span>
                          CỬU NHỊ DỊCH HỌC • {transformedHexagram ? (doubleMode === "choice_ab" ? "TRẬN PHÁP LỰA CHỌN A & B" : "TRẬN PHÁP HIỆN TẠI & TƯƠNG LAI (QUẺ CHỦ & QUẺ BIẾN)") : "CHIÊM BỐC ĐƠN QUẺ (QUẺ CHỦ)"}
                        </span>
                        <Sparkles className="w-3.5 h-3.5 text-gold-500" />
                      </div>
                      <p className="text-[10px] text-ivory-500 font-mono mt-0.5">
                        ✦ Thời khắc chiêm bốc: {new Date().toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} ✦
                      </p>
                    </div>
                    {/* Primary Hexagram Card */}
                    {(() => {
                      const slotKey = "primary";
                      return (
                        <div
                      onMouseEnter={() =>
                        handleHoverCard({
                          card: primaryHexagram,
                          positionTitle:
                            doubleMode === "choice_ab"
                              ? `LÁ 1: [LỰA CHỌN A] ${choiceALabel || "Phương án A"}`
                              : doubleMode === "present_future"
                              ? "LÁ 1: HIỆN TẠI (GỐC RỄ & THỰC TRẠNG)"
                              : "LÁ BÀI BỐC ĐƯỢC (QUẺ CHỦ)",
                          positionSubtitle: `Quẻ #${primaryHexagram.number} • ${primaryHexagram.vietnameseName}`,
                        })
                      }
                      onMouseLeave={handleLeaveCard}
                      onClick={() => setSelectedCardIdx(0)}
                      ref={primaryCardRef}
                      className={`bg-lacquer-800 border rounded-sm p-3 sm:p-6 flex flex-col items-center text-center relative overflow-visible transition-all shadow-xl ${
                        transformedHexagram ? "cursor-pointer" : ""
                      } ${
                        selectedCardIdx === 0 && enableSelectionHighlight && transformedHexagram
                          ? "border-gold-500 ring-2 ring-gold-500 bg-lacquer-800 scale-101"
                          : "border-gold-800 hover:border-gold-700"
                      }`}
                    >
                      {selectedCardIdx === 0 && enableSelectionHighlight && transformedHexagram && (
                        <div className="no-capture absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-gold-500 text-lacquer-900 rounded-full text-[8px] sm:text-[9px] font-bold flex items-center justify-center shadow z-20">
                          ✓
                        </div>
                      )}
                      <div className="flex items-center justify-between w-full mb-2 gap-1.5">
                        <div className="text-[8px] sm:text-[10px] font-mono text-gold-500 uppercase tracking-wider bg-lacquer-700 px-1.5 sm:px-2 py-0.5 rounded border border-gold-800 truncate">
                          {doubleMode === "choice_ab"
                            ? `LÁ 1: [LỰA CHỌN A] ${choiceALabel || "Phương án A"}`
                            : doubleMode === "present_future"
                            ? "LÁ 1: HIỆN TẠI (GỐC RỄ & THỰC TRẠNG)"
                            : "LÁ BÀI BỐC ĐƯỢC (QUẺ CHỦ)"}
                        </div>

                        {/* Top-right draw additional card & interpret button */}
                        <div className="no-capture flex items-center gap-1.5 ml-auto shrink-0 flex-wrap justify-end">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setInspectingTwoSidedCard({
                                card: primaryHexagram,
                                positionTitle:
                                  doubleMode === "choice_ab"
                                    ? `LÁ 1: [LỰA CHỌN A] ${choiceALabel || "Phương án A"}`
                                    : doubleMode === "present_future"
                                    ? "LÁ 1: HIỆN TẠI (GỐC RỄ & THỰC TRẠNG)"
                                    : "LÁ BÀI BỐC ĐƯỢC (QUẺ CHỦ)",
                                isReversed: primaryHexagram.isReversed ?? false,
                              });
                            }}
                            className="flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-sm bg-[#9A1F1A] hover:bg-[#7A1C18] text-[#FFFDF8] border border-[#C4963E] text-[10px] sm:text-xs font-serif font-bold shadow-sm transition-all cursor-pointer shrink-0 whitespace-nowrap"
                            title="Mở cửa sổ xem song song cả 2 mặt bài (Quẻ Tượng & Thoán Từ)"
                          >
                            <ZoomIn className="w-3 h-3 text-[#E2C275]" />
                            <span>2 mặt</span>
                          </button>
                          {showCompanionButton && primaryList.length === 0 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDrawCompanion(slotKey);
                              }}
                              className="flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-sm bg-lacquer-800 hover:bg-gold-500 text-gold-400 hover:text-lacquer-900 border border-gold-800 hover:border-gold-400 text-[10px] sm:text-xs font-mono font-bold shadow-md transition-all cursor-pointer group active:scale-95 shrink-0 whitespace-nowrap"
                              title="Bốc thêm 1 lá kế bên (Lá bổ trợ giải trình)"
                            >
                              <Plus className="w-3 h-3 text-gold-400 group-hover:text-lacquer-900 group-hover:rotate-90 transition-transform" />
                              <span>Bốc thêm</span>
                            </button>
                          )}
                          {showInterpretButton && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onNavigateToManual?.(primaryHexagram.number);
                              }}
                              className="flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-sm bg-lacquer-800 hover:bg-gold-500 text-gold-500 hover:text-lacquer-900 border border-gold-800 hover:border-gold-500 text-[10px] sm:text-xs font-serif font-bold shadow-md transition-all cursor-pointer group active:scale-95 shrink-0 whitespace-nowrap"
                              title={`Xem luận giải Quẻ #${primaryHexagram.number} ở Sách Thuyết Minh`}
                            >
                              <Eye className="w-3 h-3 text-gold-500 group-hover:text-lacquer-900 transition-colors" />
                              <span>Luận giải</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 my-2 sm:my-4 w-full">
                        <div className="shrink-0">
                          <FlippableSpiritualCard
                            key={`primary_${primaryHexagram.number}_${flipSequenceKey}`}
                            hexagram={primaryHexagram}
                            imageUrl={cardImages[primaryHexagram.number]}
                            videoUrl={cardVideos[primaryHexagram.number]}
                            cardBackUrl={cardBackImage}
                            size={getDetailCardSize(transformedHexagram ? "lg" : "xl")}
                            defaultFlipped={allCardsFlipped}
                            fitMode={cardFitMode}
                            isReversed={primaryHexagram.isReversed ?? false}
                            allowFlipOnClick={allowFlipOnClick}
                            deckNumber={primaryHexagram.deckNumber}
                            onImageUpdated={onImageUpdated}
                            onVideoUpdated={onVideoUpdated}
                            enableHoverZoom={enableHoverZoom}
                          />
                        </div>

                        {/* Companion Cards placed next to Primary - Supports multiple/recursive */}
                        {primaryList.map((pCard, pIdx) => {
                          const isLast = pIdx === primaryList.length - 1;
                          return (
                            <div key={`comp_primary_${pCard.number}_${pIdx}`} className={`relative flex flex-col items-center shrink-0 animate-in fade-in zoom-in-95 duration-200 ${isLast ? "pr-8 sm:pr-10" : ""}`}>
                              <div className="flex items-center justify-between w-full px-1 mb-1 gap-1">
                                <span className="text-[8.5px] sm:text-[9.5px] font-mono font-bold text-gold-400 bg-lacquer-800 px-1.5 py-0.5 rounded border border-gold-800 truncate">
                                  + Kế Bên {primaryList.length > 1 ? `#${pIdx + 1}` : ""} #{pCard.number}
                                </span>
                                <div className="flex items-center gap-0.5 no-capture">
                                  {showInterpretButton && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onNavigateToManual?.(pCard.number);
                                      }}
                                      className="text-gold-500 hover:text-gold-200 bg-lacquer-800 hover:bg-gold-800 px-1.5 py-0.5 rounded text-[8px] font-serif font-bold flex items-center gap-0.5 border border-gold-800 transition-colors cursor-pointer"
                                      title={`Xem luận giải Quẻ #${pCard.number} ở Thuyết Minh`}
                                    >
                                      <Eye className="w-2.5 h-2.5" />
                                      <span>Luận giải</span>
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const cycleMap: Record<string, "same" | "large" | "xlarge"> = {
                                        same: "large",
                                        large: "xlarge",
                                        xlarge: "same",
                                        third: "same",
                                        normal: "same",
                                      };
                                      handleUpdateCompanionCardSize(cycleMap[companionCardSize] || "same");
                                    }}
                                    className="text-[7.5px] sm:text-[8.5px] font-mono px-1.5 py-0.5 rounded bg-lacquer-800 hover:bg-gold-800 text-gold-400 border border-gold-800 transition-colors cursor-pointer"
                                    title="Bấm đổi cỡ lá bốc thêm (Bằng chính / To rõ / Cực đại)"
                                  >
                                    {companionCardSize === "xlarge"
                                      ? "Cực đại"
                                      : companionCardSize === "large"
                                      ? "To rõ"
                                      : "Bằng chính"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveCompanion(slotKey, pIdx);
                                      handleDrawCompanion(slotKey);
                                    }}
                                    className="text-ivory-500 hover:text-gold-500 p-0.5 transition-colors cursor-pointer"
                                    title="Bốc đổi sang lá khác"
                                  >
                                    <RotateCw className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveCompanion(slotKey, pIdx);
                                    }}
                                    className="text-ivory-500 hover:text-rose-400 p-0.5 transition-colors cursor-pointer"
                                    title="Xóa lá bốc thêm này"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>

                              <div
                                className="relative"
                                onMouseEnter={() =>
                                  handleHoverCard({
                                    card: pCard,
                                    positionTitle: `LÁ BỔ TRỢ KẾ BÊN QUẺ CHỦ (${pIdx + 1})`,
                                    positionSubtitle: `Quẻ #${pCard.number} • ${pCard.name} (${pCard.vietnameseName})`,
                                    isReversed: pCard.isReversed ?? false,
                                  })
                                }
                                onMouseLeave={handleLeaveCard}
                              >
                                <FlippableSpiritualCard
                                  hexagram={pCard}
                                  imageUrl={cardImages[pCard.number]}
                                  videoUrl={cardVideos[pCard.number]}
                                  cardBackUrl={cardBackImage}
                                  size={getDetailCardSize(getCompanionCardSize(transformedHexagram ? "double" : "single"))}
                                  defaultFlipped={allCardsFlipped}
                                  fitMode={cardFitMode}
                                  isReversed={pCard.isReversed ?? false}
                                  allowFlipOnClick={allowFlipOnClick}
                                  onImageUpdated={onImageUpdated}
                                  onVideoUpdated={onVideoUpdated}
                                  enableHoverZoom={enableHoverZoom}
                                />

                                {/* Ở lá bốc thêm cũng thêm được bốc thêm - Dời qua phải 1 xíu như quẻ chính */}
                                {showCompanionButton && isLast && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDrawCompanion(slotKey);
                                    }}
                                    className="no-capture absolute -top-1.5 -right-7 sm:-right-9 z-20 flex items-center gap-1 px-2 py-0.5 rounded-sm bg-lacquer-800 hover:bg-gold-500 text-gold-400 hover:text-lacquer-900 border border-gold-800 hover:border-gold-400 text-[8.5px] sm:text-[9.5px] font-mono font-bold shadow-md transition-all cursor-pointer group active:scale-95 whitespace-nowrap"
                                    title="Bốc thêm tiếp 1 lá kế bên nữa"
                                  >
                                    <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gold-400 group-hover:text-lacquer-900 group-hover:rotate-90 transition-transform" />
                                    <span>Bốc thêm</span>
                                  </button>
                                )}
                              </div>

                              {/* Thông tin lá bốc thêm kế bên quẻ chủ */}
                              <CardInfoSummary
                                card={pCard}
                                isReversed={pCard.isReversed ?? false}
                                compact={true}
                                roleTitle={`Lá bổ trợ kế bên #${pIdx + 1}`}
                              />
                            </div>
                          );
                        })}
                      </div>

                      {/* THÔNG TIN CHI TIẾT TRỌN VẸN CỦA QUẺ CHỦ */}
                      <CardInfoSummary
                        card={primaryHexagram}
                        isReversed={primaryHexagram.isReversed ?? false}
                        deckNumber={primaryHexagram.deckNumber}
                        showJudgment={true}
                        showAdvice={true}
                      />
                    </div>
                  );
                })()}

                {/* Transformed Hexagram Card (if 2 cards were drawn) */}
                {transformedHexagram && (() => {
                  const slotKey = "transformed";
                  const transformedList = getCompanionList(slotKey);
                  return (
                    <div
                      onMouseEnter={() =>
                        handleHoverCard({
                          card: transformedHexagram,
                          positionTitle:
                            doubleMode === "choice_ab"
                              ? `LÁ 2: [LỰA CHỌN B] ${choiceBLabel || "Phương án B"}`
                              : doubleMode === "present_future"
                              ? "LÁ 2: TƯƠNG LAI (XU HƯỚNG & KẾT QUẢ)"
                              : "LÁ BÀI THỨ 2 (BIẾN CHUYỂN)",
                          positionSubtitle: `Quẻ #${transformedHexagram.number} • ${transformedHexagram.vietnameseName}`,
                          isReversed: isCard2Reversed,
                        })
                      }
                      onMouseLeave={handleLeaveCard}
                      onClick={() => setSelectedCardIdx(1)}
                      className={`bg-lacquer-800 border rounded-sm p-3 sm:p-6 flex flex-col items-center text-center relative overflow-visible transition-all cursor-pointer shadow-xl ${
                        selectedCardIdx === 1 && enableSelectionHighlight
                          ? "border-gold-500 ring-2 ring-gold-500 bg-lacquer-800 scale-101"
                          : "border-gold-800 hover:border-gold-700"
                      }`}
                    >
                      {selectedCardIdx === 1 && enableSelectionHighlight && (
                        <div className="no-capture absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-gold-500 text-lacquer-900 rounded-full text-[8px] sm:text-[9px] font-bold flex items-center justify-center shadow z-20">
                          ✓
                        </div>
                      )}
                      <div className="flex items-center justify-between w-full mb-2 gap-1.5">
                        <div className="text-[8px] sm:text-[10px] font-mono text-[#E28355] uppercase tracking-wider bg-[#2A1C14] px-1.5 sm:px-2 py-0.5 rounded border border-[#4D2F20] truncate">
                          {doubleMode === "choice_ab"
                            ? `LÁ 2: [LỰA CHỌN B] ${choiceBLabel || "Phương án B"}`
                            : doubleMode === "present_future"
                            ? "LÁ 2: TƯƠNG LAI (XU HƯỚNG & KẾT QUẢ)"
                            : "LÁ BÀI THỨ 2 (BIẾN CHUYỂN)"}
                        </div>

                        {/* Top-right draw additional card & interpret button */}
                        <div className="no-capture flex items-center gap-1.5 ml-auto shrink-0 flex-wrap justify-end">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setInspectingTwoSidedCard({
                                card: transformedHexagram,
                                positionTitle:
                                  doubleMode === "choice_ab"
                                    ? `LÁ 2: [LỰA CHỌN B] ${choiceBLabel || "Phương án B"}`
                                    : doubleMode === "present_future"
                                    ? "LÁ 2: TƯƠNG LAI (XU HƯỚNG & KẾT QUẢ)"
                                    : "LÁ BÀI THỨ 2 (BIẾN CHUYỂN)",
                                isReversed: isCard2Reversed ?? transformedHexagram.isReversed ?? false,
                              });
                            }}
                            className="flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-sm bg-[#9A1F1A] hover:bg-[#7A1C18] text-[#FFFDF8] border border-[#C4963E] text-[10px] sm:text-xs font-serif font-bold shadow-sm transition-all cursor-pointer shrink-0 whitespace-nowrap"
                            title="Mở cửa sổ xem song song cả 2 mặt bài (Quẻ Tượng & Thoán Từ)"
                          >
                            <ZoomIn className="w-3 h-3 text-[#E2C275]" />
                            <span>2 mặt</span>
                          </button>
                          {showCompanionButton && transformedList.length === 0 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDrawCompanion(slotKey);
                              }}
                              className="flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-sm bg-lacquer-800 hover:bg-gold-500 text-gold-400 hover:text-lacquer-900 border border-gold-800 hover:border-gold-400 text-[10px] sm:text-xs font-mono font-bold shadow-md transition-all cursor-pointer group active:scale-95 shrink-0 whitespace-nowrap"
                              title="Bốc thêm 1 lá kế bên (Lá bổ trợ giải trình)"
                            >
                              <Plus className="w-3 h-3 text-gold-400 group-hover:text-lacquer-900 group-hover:rotate-90 transition-transform" />
                              <span>Bốc thêm</span>
                            </button>
                          )}
                          {showInterpretButton && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onNavigateToManual?.(transformedHexagram.number);
                              }}
                              className="flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-sm bg-lacquer-800 hover:bg-gold-500 text-gold-500 hover:text-lacquer-900 border border-gold-800 hover:border-gold-500 text-[10px] sm:text-xs font-serif font-bold shadow-md transition-all cursor-pointer group active:scale-95 shrink-0 whitespace-nowrap"
                              title={`Xem luận giải Quẻ #${transformedHexagram.number} ở Sách Thuyết Minh`}
                            >
                              <Eye className="w-3 h-3 text-gold-500 group-hover:text-lacquer-900 transition-colors" />
                              <span>Luận giải</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 my-2 sm:my-4 w-full">
                        <div className="shrink-0">
                          <FlippableSpiritualCard
                            key={`transformed_${transformedHexagram.number}_${flipSequenceKey}`}
                            hexagram={transformedHexagram}
                            imageUrl={cardImages[transformedHexagram.number]}
                            videoUrl={cardVideos[transformedHexagram.number]}
                            cardBackUrl={cardBackImage}
                            size={getDetailCardSize("lg")}
                            defaultFlipped={allCardsFlipped}
                            fitMode={cardFitMode}
                            isReversed={isCard2Reversed ?? transformedHexagram.isReversed ?? false}
                            allowFlipOnClick={allowFlipOnClick}
                            deckNumber={transformedHexagram.deckNumber}
                            onImageUpdated={onImageUpdated}
                            onVideoUpdated={onVideoUpdated}
                            enableHoverZoom={enableHoverZoom}
                          />
                        </div>

                        {/* Companion Cards placed next to Transformed - Supports multiple/recursive */}
                        {transformedList.map((tCard, tIdx) => {
                          const isLast = tIdx === transformedList.length - 1;
                          return (
                            <div key={`comp_trans_${tCard.number}_${tIdx}`} className={`relative flex flex-col items-center shrink-0 animate-in fade-in zoom-in-95 duration-200 ${isLast ? "pr-8 sm:pr-10" : ""}`}>
                              <div className="flex items-center justify-between w-full px-1 mb-1 gap-1">
                                <span className="text-[8.5px] sm:text-[9.5px] font-mono font-bold text-gold-400 bg-lacquer-800 px-1.5 py-0.5 rounded border border-gold-800 truncate">
                                  + Kế Bên {transformedList.length > 1 ? `#${tIdx + 1}` : ""} #{tCard.number}
                                </span>
                                <div className="flex items-center gap-0.5 no-capture">
                                  {showInterpretButton && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onNavigateToManual?.(tCard.number);
                                      }}
                                      className="text-gold-500 hover:text-gold-200 bg-lacquer-800 hover:bg-gold-800 px-1.5 py-0.5 rounded text-[8px] font-serif font-bold flex items-center gap-0.5 border border-gold-800 transition-colors cursor-pointer"
                                      title={`Xem luận giải Quẻ #${tCard.number} ở Thuyết Minh`}
                                    >
                                      <Eye className="w-2.5 h-2.5" />
                                      <span>Luận giải</span>
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const cycleMap: Record<string, "same" | "large" | "xlarge"> = {
                                        same: "large",
                                        large: "xlarge",
                                        xlarge: "same",
                                        third: "same",
                                        normal: "same",
                                      };
                                      handleUpdateCompanionCardSize(cycleMap[companionCardSize] || "same");
                                    }}
                                    className="text-[7.5px] sm:text-[8.5px] font-mono px-1.5 py-0.5 rounded bg-lacquer-800 hover:bg-gold-800 text-gold-400 border border-gold-800 transition-colors cursor-pointer"
                                    title="Bấm đổi cỡ lá bốc thêm (Bằng chính / To rõ / Cực đại)"
                                  >
                                    {companionCardSize === "xlarge"
                                      ? "Cực đại"
                                      : companionCardSize === "large"
                                      ? "To rõ"
                                      : "Bằng chính"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveCompanion(slotKey, tIdx);
                                      handleDrawCompanion(slotKey);
                                    }}
                                    className="text-ivory-500 hover:text-gold-500 p-0.5 transition-colors cursor-pointer"
                                    title="Bốc đổi sang lá khác"
                                  >
                                    <RotateCw className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveCompanion(slotKey, tIdx);
                                    }}
                                    className="text-ivory-500 hover:text-rose-400 p-0.5 transition-colors cursor-pointer"
                                    title="Xóa lá bốc thêm này"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>

                              <div
                                className="relative"
                                onMouseEnter={() =>
                                  handleHoverCard({
                                    card: tCard,
                                    positionTitle: `LÁ BỔ TRỢ KẾ BÊN QUẺ BIẾN (${tIdx + 1})`,
                                    positionSubtitle: `Quẻ #${tCard.number} • ${tCard.name} (${tCard.vietnameseName})`,
                                    isReversed: tCard.isReversed ?? false,
                                  })
                                }
                                onMouseLeave={handleLeaveCard}
                              >
                                <FlippableSpiritualCard
                                  hexagram={tCard}
                                  imageUrl={cardImages[tCard.number]}
                                  videoUrl={cardVideos[tCard.number]}
                                  cardBackUrl={cardBackImage}
                                  size={getDetailCardSize(getCompanionCardSize("double"))}
                                  defaultFlipped={allCardsFlipped}
                                  fitMode={cardFitMode}
                                  isReversed={tCard.isReversed ?? false}
                                  allowFlipOnClick={allowFlipOnClick}
                                  onImageUpdated={onImageUpdated}
                                  onVideoUpdated={onVideoUpdated}
                                  enableHoverZoom={enableHoverZoom}
                                />

                                {/* Ở lá bốc thêm cũng thêm được bốc thêm - Dời qua phải 1 xíu như quẻ chính */}
                                {showCompanionButton && isLast && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDrawCompanion(slotKey);
                                    }}
                                    className="no-capture absolute -top-1.5 -right-7 sm:-right-9 z-20 flex items-center gap-1 px-2 py-0.5 rounded-sm bg-lacquer-800 hover:bg-gold-500 text-gold-400 hover:text-lacquer-900 border border-gold-800 hover:border-gold-400 text-[8.5px] sm:text-[9.5px] font-mono font-bold shadow-md transition-all cursor-pointer group active:scale-95 whitespace-nowrap"
                                    title="Bốc thêm tiếp 1 lá kế bên nữa"
                                  >
                                    <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gold-400 group-hover:text-lacquer-900 group-hover:rotate-90 transition-transform" />
                                    <span>Bốc thêm</span>
                                  </button>
                                )}
                              </div>

                              {/* Thông tin lá bốc thêm kế bên quẻ biến */}
                              <CardInfoSummary
                                card={tCard}
                                isReversed={tCard.isReversed ?? false}
                                compact={true}
                                roleTitle={`Lá bổ trợ biến #${tIdx + 1}`}
                              />
                            </div>
                          );
                        })}
                      </div>

                      {/* THÔNG TIN CHI TIẾT TRỌN VẸN CỦA QUẺ BIẾN */}
                      <CardInfoSummary
                        card={transformedHexagram}
                        isReversed={isCard2Reversed ?? transformedHexagram.isReversed ?? false}
                        deckNumber={transformedHexagram.deckNumber}
                        showJudgment={true}
                        showAdvice={true}
                      />
                    </div>
                  );
                })()}
              </div>
            );
          })()
        )}
          </XuanBaguaStage>
        )}

        {/* Companion Cards Detailed Reading Section */}
        {Object.keys(companionCards).length > 0 && (() => {
          const allCompanionCards: { slotKey: string; card: Hexagram; index: number }[] = [];
          Object.entries(companionCards).forEach(([sKey, val]) => {
            if (Array.isArray(val)) {
              val.forEach((c, idx) => allCompanionCards.push({ slotKey: sKey, card: c, index: idx }));
            } else if (val) {
              allCompanionCards.push({ slotKey: sKey, card: val, index: 0 });
            }
          });
          if (allCompanionCards.length === 0) return null;

          return (
            <div className="border border-gold-800 bg-lacquer-950/50 p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-gold-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-gold-500" />
                  <h3 className="font-display font-semibold text-ivory-100 text-base sm:text-lg">
                    CÁC LÁ BỔ TRỢ ĐÃ BỐC THÊM KẾ BÊN ({allCompanionCards.length} Lá)
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-ivory-300 bg-lacquer-700 px-2.5 py-0.5 rounded-sm border border-gold-800">
                    Luận giải & khai mở thêm góc nhìn
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowCompanionSection((prev) => !prev)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-sm text-xs font-serif bg-lacquer-800 hover:bg-lacquer-700 text-gold-400 border border-gold-800 transition-colors cursor-pointer"
                    title={showCompanionSection ? "Thu gọn ô luận giải lá bổ trợ" : "Mở rộng ô luận giải lá bổ trợ"}
                  >
                    {showCompanionSection ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    <span>{showCompanionSection ? "Thu gọn" : "Mở rộng ô luận giải"}</span>
                  </button>
                </div>
              </div>

              {showCompanionSection && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {allCompanionCards.map(({ slotKey: sKey, card: cCard, index: cIdx }) => (
                    <div
                      key={`${sKey}_${cCard.number}_${cIdx}`}
                      className="bg-lacquer-800 border border-gold-800 hover:border-gold-700 rounded-sm p-3 sm:p-4 space-y-2.5 transition-all"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-gold-800 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rotate-45 bg-gold-500" />
                          <span className="text-xs font-mono font-bold text-gold-400 uppercase">
                            Vị trí: {sKey.replace("card_", "Lá ").replace("primary", "Quẻ Chủ").replace("transformed", "Quẻ Biến")} {cIdx > 0 ? `(#${cIdx + 1})` : ""}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveCompanion(sKey, cIdx)}
                          className="text-ivory-500 hover:text-rose-400 p-1 transition-colors cursor-pointer text-xs flex items-center gap-1"
                          title="Bỏ lá bốc thêm này"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span className="text-[10px]">Bỏ lá</span>
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-serif font-bold text-ivory-100">
                            Quẻ #{cCard.number} {cCard.name}
                          </span>
                          <span className="text-xs text-gold-500 font-serif">
                            ({cCard.vietnameseName})
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-ivory-500">
                          {cCard.upperTrigram} trên / {cCard.lowerTrigram} dưới • {cCard.element}
                        </div>
                        <p className="text-xs sm:text-sm text-ivory-300 leading-relaxed">
                          {cCard.overview || cCard.judgment}
                        </p>
                        {cCard.advice && (
                          <div className="text-xs text-gold-300 bg-lacquer-700 p-2 rounded-sm border border-gold-800 mt-1.5 leading-relaxed">
                            <strong className="text-gold-500">Lời khuyên:</strong> {cCard.advice}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* DUY NHẤT Ở RÚT 3 LÁ PHẦN TAM TÀI: GIEO XÚC XẮC 12 MẶT (12 ĐỊA CHI) & Ô LIÊN KẾT KHỔNG MINH */}
        {isTamTai && selectedCardIdx === 2 && (
          <div id="tam-tai-dice-container" className="pt-2 animate-in fade-in duration-300">
            <TamTaiDiceRollSection
              drawnCards={drawnCards}
              primaryHexagram={primaryHexagram}
              selectedCardIdx={selectedCardIdx}
              onSelectCardIdx={setSelectedCardIdx}
              activeChangingLine={tamTaiChangingLine}
              onApplyChangingLine={handleApplyTamTaiChangingLine}
              onJumpToThuyetMinh={handleJumpToThuyetMinh}
              onNavigateToManual={onNavigateToManual}
              onClose={() => setSelectedCardIdx(null)}
              onShowToast={onShowToast}
            />
          </div>
        )}

        {/* NGỰ CHẾ TÂN TẬP ĐOÁN DỊCH TINH TÚY: BỐC 3 LÁ THIÊN - ĐỊA - NHÂN, LẤY LÁ CUỐI LÀM QUẺ, LẮC XÍ NGẦU 12 MẶT, TRÍCH HÌNH & THƠ ĐOÁN CỦA QUẺ ĐÓ + HÌNH & THƠ ĐOÁN CỦA NGÀY ĐÓ CỦA QUẺ ĐÓ */}
        {isNguChe && drawnCards && (
          <div id="ngu-che-tinh-tuy-container" className="pt-2 animate-in fade-in duration-300">
            <NguCheTinhTuySection
              drawnCards={drawnCards}
              question={question}
              category={category}
              onShowToast={onShowToast}
            />
          </div>
        )}

        {/* LUẬN GIẢI CHUYÊN SÂU TOÀN QUẺ & 6 HÀO, ĐỒ THỊ NGŨ HÀNH, TƯỢNG TRUYỆN, KHỔNG MINH THẦN QUẺ (HIỆN CHO MỌI PHƯƠNG PHÁP BỐC BÀI & GIEO QUẺ) */}
        {(() => {
          const selectableCards: { label: string; card: Hexagram; idx: number }[] =
            drawnCards && drawnCards.length > 1
              ? drawnCards.map((c, idx) => ({
                  idx,
                  card: c,
                  label: `Lá ${idx + 1}: #${c.number} ${c.name}`,
                }))
              : !drawnCards && transformedHexagram
              ? [
                  { idx: 0, card: primaryHexagram, label: `Lá 1 (Quẻ Chủ): #${primaryHexagram.number} ${primaryHexagram.name}` },
                  { idx: 1, card: transformedHexagram, label: `Lá 2 (Quẻ Biến): #${transformedHexagram.number} ${transformedHexagram.name}` },
                ]
              : [];

          const activeCardIndex =
            selectedCardIdx !== null && selectableCards.some((s) => s.idx === selectedCardIdx)
              ? selectedCardIdx
              : 0;
          const activeReadingHexagram: Hexagram =
            selectableCards.find((s) => s.idx === activeCardIndex)?.card || primaryHexagram;

          return (
            <div id="thuyet-minh-section" className="space-y-6 pt-5 border-t border-gold-800">
              {/* 1. HƯỚNG DẪN HÀO ĐỘNG (CHU HY - THÁI PHÁT) — Hiện khi có hào động hoặc Cỏ Thi / Đồng Xu */}
              {(isYarrowOrCoins || changingLines.length > 0) && (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rotate-45 bg-gold-500" />
                    <h3 className="font-display font-semibold text-ivory-100 text-base sm:text-lg tracking-wide flex items-center gap-2">
                      <span>1. HƯỚNG DẪN HÀO ĐỘNG</span>
                      <span className="text-[11px] font-mono text-amber-400 bg-lacquer-700 px-2 py-0.5 rounded border border-gold-800">
                        Quy tắc Chu Hy • Thái Phát
                      </span>
                    </h3>
                  </div>
                  <ChangingLinesGuideView
                    primaryHexagram={primaryHexagram}
                    changingLines={changingLines}
                    transformedHexagram={transformedHexagram}
                    onNavigateToManual={(hexNum) => onNavigateToManual?.(hexNum ?? primaryHexagram.number)}
                    onSelectLine={(line) => setSelectedCanonicalLine(line)}
                  />
                </div>
              )}

              {/* 2. PHẦN LUẬN GIẢI KINH DỊCH LIÊN QUAN */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gold-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rotate-45 bg-gold-500" />
                    <h3 className="font-display font-semibold text-ivory-100 text-base sm:text-lg tracking-wide flex items-center gap-2 flex-wrap">
                      <span>PHẦN LUẬN GIẢI KINH DỊCH CHUYÊN SÂU (TOÀN QUẺ & 6 HÀO)</span>
                      <span className="text-[11px] font-mono text-gold-500 bg-lacquer-700 px-2 py-0.5 rounded border border-gold-800">
                        Đang soi: Quẻ #{activeReadingHexagram.number} {activeReadingHexagram.name} ({activeReadingHexagram.vietnameseName})
                      </span>
                    </h3>
                  </div>

                  {/* Tabs Switcher */}
                  <div className="flex items-center text-xs font-serif flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setDetailActiveTab("canonical")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm transition-all cursor-pointer ${
                        detailActiveTab === "canonical"
                          ? "bg-gold-500/15 text-gold-200 border border-gold-500"
                          : "text-ivory-500 hover:text-gold-200 border border-transparent"
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Toàn Quẻ & 6 Hào</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDetailActiveTab("elements")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm transition-all cursor-pointer ${
                        detailActiveTab === "elements"
                          ? "bg-gold-500/15 text-gold-200 border border-gold-500"
                          : "text-gold-300 bg-lacquer-700 border border-gold-800 hover:text-gold-200"
                      }`}
                      title="Biểu đồ phân bố ngũ hành của các hào bằng recharts"
                    >
                      <BarChart3 className="w-3.5 h-3.5 text-amber-500" />
                      <span>Đồ Thị Ngũ Hành</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDetailActiveTab("xiangzhuan")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm transition-all cursor-pointer ${
                        detailActiveTab === "xiangzhuan"
                          ? "bg-gold-500/15 text-gold-200 border border-gold-500"
                          : "text-ivory-500 hover:text-gold-200 border border-transparent"
                      }`}
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Tượng Truyện</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDetailActiveTab("khongminh")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm transition-all cursor-pointer ${
                        detailActiveTab === "khongminh"
                          ? "bg-gold-500/15 text-gold-200 border border-gold-500"
                          : "text-ivory-500 hover:text-gold-200 border border-transparent"
                      }`}
                      title="Khổng Minh Thần Quẻ (384 quẻ ứng 384 hào)"
                    >
                      <Scroll className="w-3.5 h-3.5" />
                      <span>Khổng Minh Thần Quẻ</span>
                    </button>
                  </div>
                </div>

                {/* Card Selector Bar when multiple cards were drawn */}
                {selectableCards.length > 1 && (
                  <div className="p-3 rounded-xl bg-[#FAF6EE] border border-[#C4963E]/60 flex flex-wrap items-center gap-2 shadow-sm">
                    <span className="text-[11px] font-serif font-bold text-[#7A1C18] uppercase tracking-wider mr-1">
                      ✦ Chọn lá bài để xem Toàn Quẻ & 6 Hào:
                    </span>
                    {selectableCards.map((item) => {
                      const isActive = activeCardIndex === item.idx;
                      return (
                        <button
                          key={item.idx}
                          type="button"
                          onClick={() => setSelectedCardIdx(item.idx)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-serif font-bold transition-all cursor-pointer border ${
                            isActive
                              ? "bg-[#9A1F1A] text-[#FFFDF8] border-[#C4963E] shadow-sm"
                              : "bg-[#FFFDF8] text-[#3A2E21] border-[#C4963E]/45 hover:border-[#9A1F1A]/60"
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() =>
                        setInspectingTwoSidedCard({
                          card: activeReadingHexagram,
                          positionTitle: `Lá ${activeCardIndex + 1} • Quẻ #${activeReadingHexagram.number}`,
                          isReversed: activeReadingHexagram.isReversed ?? false,
                        })
                      }
                      className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#16120D] text-[#F3E5AB] border border-[#C4963E] text-xs font-serif font-bold hover:brightness-110 transition-all cursor-pointer"
                    >
                      <ZoomIn className="w-3.5 h-3.5 text-[#E2C275]" />
                      <span>Soi 2 Mặt Lá Đang Chọn</span>
                    </button>
                  </div>
                )}

                {/* TAB 1: LUẬN GIẢI QUẺ & 6 HÀO KINH ĐIỂN */}
                {detailActiveTab === "canonical" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setInspectingTwoSidedCard({
                            card: activeReadingHexagram,
                            positionTitle: `Quẻ #${activeReadingHexagram.number} ${activeReadingHexagram.name}`,
                            isReversed: activeReadingHexagram.isReversed ?? false,
                          })
                        }
                        className="flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-serif font-bold bg-[#9A1F1A] hover:bg-[#7A1C18] text-[#FFFDF8] border border-[#C4963E] transition-all cursor-pointer shadow active:scale-95"
                      >
                        <ZoomIn className="w-3.5 h-3.5 text-[#E2C275]" />
                        <span>Soi 2 Mặt Lá Bài (Quẻ Tượng & Thoán Từ)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onNavigateToManual?.(activeReadingHexagram.number)}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-serif font-bold bg-lacquer-700 hover:bg-gold-500 text-gold-300 hover:text-lacquer-900 border border-gold-800 transition-all cursor-pointer shadow active:scale-95"
                        title="Mở toàn văn Thuyết Minh (gồm Đại Tượng Truyện & Tiểu Tượng Truyện)"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem Toàn Văn Thuyết Minh 64 Quẻ</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      {/* Quẻ Đang Xem */}
                      <div className="bg-lacquer-800 border border-gold-800 rounded-sm p-3.5 space-y-2">
                        <div className="flex items-center justify-between border-b border-gold-800 pb-1.5">
                          <span className="text-xs font-serif font-bold text-gold-500">
                            QUẺ #{activeReadingHexagram.number}: {activeReadingHexagram.name} ({activeReadingHexagram.vietnameseName})
                          </span>
                          <span className="text-[10px] font-mono text-ivory-500">
                            {activeReadingHexagram.upperTrigram} / {activeReadingHexagram.lowerTrigram} • {activeReadingHexagram.element}
                          </span>
                        </div>
                        {activeReadingHexagram.overview && (
                          <p className="text-xs text-ivory-300 leading-relaxed italic">
                            "{activeReadingHexagram.overview}"
                          </p>
                        )}
                        <div className="text-xs text-ivory-300 space-y-1">
                          <div>
                            <strong className="text-gold-500">Thoán từ:</strong> {activeReadingHexagram.judgment}
                          </div>
                          <div>
                            <strong className="text-gold-500">Đại tượng:</strong> {activeReadingHexagram.image}
                          </div>
                        </div>
                        {activeReadingHexagram.advice && (
                          <div className="text-xs text-gold-300 bg-lacquer-700 p-2.5 rounded-sm border border-gold-800 leading-relaxed">
                            <strong className="text-gold-500">Lời khuyên:</strong> {activeReadingHexagram.advice}
                          </div>
                        )}
                      </div>

                      {/* Quẻ Biến (nếu có) hoặc Đạo xử thế */}
                      {transformedHexagram && activeReadingHexagram.number === primaryHexagram.number ? (
                        <div className="bg-lacquer-800 border border-[#4D2E1F] rounded-sm p-3.5 space-y-2">
                          <div className="flex items-center justify-between border-b border-gold-800 pb-1.5">
                            <span className="text-xs font-serif font-bold text-[#E28355]">
                              QUẺ BIẾN #{transformedHexagram.number}: {transformedHexagram.name} ({transformedHexagram.vietnameseName})
                            </span>
                            <span className="text-[10px] font-mono text-ivory-500">
                              {transformedHexagram.upperTrigram} / {transformedHexagram.lowerTrigram} • {transformedHexagram.element}
                            </span>
                          </div>
                          {transformedHexagram.overview && (
                            <p className="text-xs text-ivory-300 leading-relaxed italic">
                              "{transformedHexagram.overview}"
                            </p>
                          )}
                          <div className="text-xs text-ivory-300 space-y-1">
                            <div>
                              <strong className="text-[#E28355]">Thoán từ:</strong> {transformedHexagram.judgment}
                            </div>
                            <div>
                              <strong className="text-[#E28355]">Đại tượng:</strong> {transformedHexagram.image}
                            </div>
                          </div>
                          {transformedHexagram.advice && (
                            <div className="text-xs text-gold-300 bg-[#2A1C15] p-2.5 rounded-sm border border-[#4E2F20] leading-relaxed">
                              <strong className="text-[#E28355]">Lời khuyên:</strong> {transformedHexagram.advice}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-lacquer-800 border border-gold-800 rounded-sm p-3.5 space-y-2 flex flex-col justify-between">
                          <div>
                            <div className="text-xs font-serif font-bold text-gold-500 border-b border-gold-800 pb-1.5 mb-2">
                              ĐẠO XỬ THẾ CỦA BẬC QUÂN TỬ
                            </div>
                            <p className="text-xs text-ivory-300 leading-relaxed">
                              Kinh Dịch lấy đức cương kiện, trung chính làm gốc. Khi gặp quẻ này, nên thuận theo thời vận, giữ tâm bình thản, tiến thoái có chừng mực để chuyển họa thành phúc, hanh thông đại cát.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => onNavigateToManual?.(activeReadingHexagram.number)}
                            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-sm bg-lacquer-700 hover:bg-gold-800 text-gold-500 border border-gold-800 text-xs font-serif transition-colors cursor-pointer"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Đọc Luận Giải Chi Tiết Cả 6 Hào Trong Thuyết Minh</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Quy tắc đặc biệt Dụng Cửu / Dụng Lục */}
                    {activeReadingHexagram.number === 1 && changingLines.length === 6 && (
                      <div className="mt-4 p-4 sm:p-5 bg-lacquer-950/60 border border-gold-600 border-l-2 border-l-gold-500 rounded-sm space-y-3 relative overflow-hidden">
                        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-gold-800 pb-2.5">
                          <div className="flex items-center gap-2 text-gold-300">
                            <Sparkles className="w-5 h-5 text-gold-500 animate-pulse" />
                            <span className="font-serif font-black text-sm sm:text-base uppercase tracking-wider">
                              QUY TẮC ĐẶC BIỆT KINH DỊCH: QUẺ THUẦN CÀN ĐỘNG CẢ 6 HÀO ➔ DỤNG CỬU (用九)
                            </span>
                          </div>
                          <span className="text-[11px] font-mono bg-lacquer-900 text-gold-500 px-2.5 py-0.5 rounded border border-gold-700 font-bold">
                            CÀN BIẾN THUẦN KHÔN
                          </span>
                        </div>
                        <div className="text-xs sm:text-sm font-serif text-ivory-100 leading-relaxed space-y-2.5">
                          <p>
                            Kinh Dịch quy định khi quẻ <strong className="text-gold-300">Bát Thuần Càn</strong> động cả 6 hào dương, áp dụng hào đặc biệt:
                          </p>
                          <div className="bg-lacquer-900 border-l-4 border-gold-500 p-3.5 rounded-r-xl space-y-1">
                            <div className="font-serif font-black text-base sm:text-lg text-gold-300">
                              “Dụng Cửu: Kiến quần long vô thủ, cát (用九：見群龍無首，吉)”
                            </div>
                            <div className="text-xs text-ivory-300 italic">
                              Dịch nghĩa: Dùng chín - Thấy bầy rồng không có đầu, tốt lành (Quần long vô thủ cát).
                            </div>
                          </div>
                          <p className="text-xs text-ivory-300">
                            <strong>Đạo lý cốt tủy:</strong> Bầy rồng cùng bay lượn hòa hợp mà không ai tranh giành ngôi vị thủ lĩnh; biết cương biết nhu, tùy thời biến hóa thì việc gì cũng hanh thông, đại cát đại lợi.
                          </p>
                        </div>
                      </div>
                    )}

                    {activeReadingHexagram.number === 2 && changingLines.length === 6 && (
                      <div className="mt-4 p-4 sm:p-5 bg-lacquer-950/60 border border-gold-600 border-l-2 border-l-gold-500 rounded-sm space-y-3 relative overflow-hidden">
                        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-gold-800 pb-2.5">
                          <div className="flex items-center gap-2 text-gold-300">
                            <Sparkles className="w-5 h-5 text-gold-500 animate-pulse" />
                            <span className="font-serif font-black text-sm sm:text-base uppercase tracking-wider">
                              QUY TẮC ĐẶC BIỆT KINH DỊCH: QUẺ THUẦN KHÔN ĐỘNG CẢ 6 HÀO ➔ DỤNG LỤC (用六)
                            </span>
                          </div>
                          <span className="text-[11px] font-mono bg-lacquer-900 text-gold-500 px-2.5 py-0.5 rounded border border-gold-700 font-bold">
                            KHÔN BIẾN THUẦN CÀN
                          </span>
                        </div>
                        <div className="text-xs sm:text-sm font-serif text-ivory-100 leading-relaxed space-y-2.5">
                          <p>
                            Kinh Dịch quy định khi quẻ <strong className="text-gold-300">Bát Thuần Khôn</strong> động cả 6 hào âm, áp dụng hào đặc biệt:
                          </p>
                          <div className="bg-lacquer-900 border-l-4 border-gold-500 p-3.5 rounded-r-xl space-y-1">
                            <div className="font-serif font-black text-base sm:text-lg text-gold-300">
                              “Dụng Lục: Lợi vĩnh trinh (用六：利永貞)”
                            </div>
                            <div className="text-xs text-ivory-300 italic">
                              Dịch nghĩa: Dùng sáu - Thuận lợi về việc giữ lòng chính bền vững lâu dài.
                            </div>
                          </div>
                          <p className="text-xs text-ivory-300">
                            <strong>Đạo lý cốt tủy:</strong> Đạo Khôn nhu thuận chuyển biến thành sức mạnh cương kiện của Càn, giữ vững sự thuần chính kiên định muôn đời thì phúc lộc trường cửu viên mãn.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* KHO TÀNG KINH DỊCH NGUYÊN BẢN & HÀO TỪ CỐT LÕI */}
                    <div className="mt-4">
                      <CanonicalHexagramCard
                        hexNumber={activeReadingHexagram.number}
                        initialLine={
                          (activeReadingHexagram.number === 1 || activeReadingHexagram.number === 2) && changingLines.length === 6
                            ? 7
                            : changingLines.length > 0
                            ? changingLines[0]
                            : 1
                        }
                        selectedLine={selectedCanonicalLine}
                        onSelectLine={setSelectedCanonicalLine}
                        onNavigateHex={(hexNum) => onNavigateToManual?.(hexNum)}
                      />
                    </div>
                  </div>
                )}

                {/* TAB 2: ĐỒ THỊ PHÂN BỐ NGŨ HÀNH (RECHARTS) */}
                {detailActiveTab === "elements" && (
                  <div className="space-y-4 pt-1">
                    <HexagramElementsChart
                      primaryHexagram={activeReadingHexagram}
                      changingLines={changingLines}
                      transformedHexagram={transformedHexagram}
                    />
                  </div>
                )}

                {/* TAB 3: THẬP DỰC • TƯỢNG TRUYỆN (KHỔNG TỬ) */}
                {detailActiveTab === "xiangzhuan" && (
                  <div className="space-y-4 pt-1">
                    <XiangzhuanView hexNumber={activeReadingHexagram.number} />
                  </div>
                )}

                {/* TAB 4: KHỔNG MINH THẦN QUẺ (384 HÀO) */}
                {detailActiveTab === "khongminh" && (
                  <div className="space-y-6 pt-1">
                    <KhongMinhKinhDichView
                      primaryHex={activeReadingHexagram}
                      activeLine={changingLines && changingLines.length > 0 ? changingLines[0] : 2}
                      sourceName={changingLines && changingLines.length > 0 ? "Chiêm Thời" : "Hoạt Thời"}
                      onShowToast={onShowToast}
                    />

                    <div className="border-t border-[#3A2817] pt-4">
                      <KhongMinhSingleHexView
                        kingWenNumber={activeReadingHexagram.number}
                        changingLines={changingLines}
                        defaultExpanded={false}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Google Workspace Direct Actions */}
      {onOpenWorkspace && (
        <div className="royal-card p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-gold-400 flex items-center gap-2">
              <span className="flex items-center -space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4285F4]"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#34A853]"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#EA4335]"></span>
              </span>
              <span>Đồng Bộ Google Workspace Cho Quẻ Này</span>
            </div>
            <p className="text-[11px] text-ivory-500 mt-0.5">
              Xuất bài luận giải sang Google Docs, thêm bản ghi vào Google Sheets hoặc gửi thư qua Gmail.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onOpenWorkspace("docs")}
              className="royal-btn-ghost flex-1 sm:flex-none !px-3.5 !py-2 !text-[11px]"
              title="Xuất sang Google Docs"
            >
              <FileText className="w-3.5 h-3.5 text-[#4285F4]" />
              <span>Google Docs</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenWorkspace("sheets")}
              className="royal-btn-ghost flex-1 sm:flex-none !px-3.5 !py-2 !text-[11px]"
              title="Ghi vào Google Sheets"
            >
              <Table className="w-3.5 h-3.5 text-[#34A853]" />
              <span>Google Sheets</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenWorkspace("gmail")}
              className="royal-btn-ghost flex-1 sm:flex-none !px-3.5 !py-2 !text-[11px]"
              title="Gửi kết quả qua Gmail"
            >
              <Mail className="w-3.5 h-3.5 text-[#EA4335]" />
              <span>Gmail</span>
            </button>
          </div>
        </div>
      )}

      <div className="royal-card p-5 sm:p-6">
        <h4 className="text-[11px] font-medium text-gold-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-gold-500" />
          Ghi Chú Cảm Ngộ & Nghiệm Quẻ (Lưu Trữ Lâu Dài)
        </h4>
        <textarea
          rows={3}
          value={userNote}
          onChange={(e) => setUserNote(e.target.value)}
          placeholder="Ghi chép lại cảm nhận của bạn lúc này hoặc cập nhật kết quả sau khi sự việc diễn ra để nghiệm lý đạo Dịch..."
          className="w-full bg-lacquer-950 border border-gold-800 focus:border-gold-500 rounded-sm p-3.5 text-sm font-serif text-ivory-100 placeholder:text-ivory-500/70 outline-none resize-none transition-colors"
        />
        <div className="mt-3 flex items-center justify-between">
          <button
            onClick={onNewDivination}
            className="royal-btn-ghost !px-4 !py-2 !text-[11px]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Gieo Quẻ Mới
          </button>
          <button
            onClick={handleSave}
            className="royal-btn !px-4 !py-2 !text-[11px]"
          >
            <Bookmark className="w-3.5 h-3.5" />
            {isSaved ? "Đã Lưu Xong!" : "Lưu Kết Quả & Ghi Chú"}
          </button>
        </div>
      </div>

      {/* Modal Soi Lá Bài 2 Mặt (Quẻ Tượng & Thoán Từ) */}
      <CardTwoSidedModal
        isOpen={Boolean(inspectingTwoSidedCard)}
        onClose={() => setInspectingTwoSidedCard(null)}
        hexagram={inspectingTwoSidedCard?.card || null}
        positionTitle={inspectingTwoSidedCard?.positionTitle}
        frontImageUrl={inspectingTwoSidedCard ? cardImages[inspectingTwoSidedCard.card.number] : undefined}
        backImageUrl={cardBackImage}
        isReversed={inspectingTwoSidedCard?.isReversed}
      />

      <FullScreenCardHoverModal
        data={hoveredCardData}
        cardImages={cardImages}
        cardVideos={cardVideos}
        cardBackUrl={cardBackImage}
        fitMode={cardFitMode}
        onClose={() => setHoveredCardData(null)}
        onMouseEnter={handleEnlargedMouseEnter}
        onMouseLeave={handleEnlargedMouseLeave}
      />

      <ExportImageModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        imageUrl={exportedCardsUrl}
        title="Ảnh Các Lá Bài Đã Bốc"
        filename={`la-bai-que-da-boc-${new Date().toISOString().slice(0, 10)}.png`}
      />
    </div>
  );
};
