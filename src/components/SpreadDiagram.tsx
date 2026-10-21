import React, { useEffect, useRef, useState } from "react";
import { Hexagram, SpreadType, CustomCardPosition } from "../types";
import {
  SEVEN_STARS_POSITIONS,
  TEN_STARS_POSITIONS,
  TEN_STARS_EXPANDED_POSITIONS,
  NINE_PALACES_POSITIONS,
  TWELVE_BRANCHES_DATA,
  TWELVE_HOUSES_INFO,
  getHouseForBranch,
  SpreadPositionInfo,
} from "../data/spreads";
import { CardVisual } from "./CardVisual";
import { FlippableSpiritualCard } from "./FlippableSpiritualCard";
import { zenAudio } from "../utils/zenAudio";
import { Camera, Check, Loader2, Sparkles, ZoomIn, Compass, Grid3X3, Calendar, RotateCw, Plus, X, Eye, CircleDot, FlipHorizontal, Settings, ChevronDown, ChevronUp } from "lucide-react";
import { captureElementToPng } from "../utils/captureHelper";
import { ExportImageModal } from "./ExportImageModal";
import { FullScreenCardHoverModal, HoverCardData } from "./FullScreenCardHoverModal";

interface SpreadContextType {
  cardImages: Record<number, string>;
  cardVideos: Record<number, string>;
  cardBackUrl?: string | null;
  fitMode: "contain" | "cover";
  onImageUpdated?: (num: number, url: string) => void;
  onVideoUpdated?: (num: number, url: string) => void;
  onHoverCard?: (data: HoverCardData) => void;
  onLeaveCard?: () => void;
  allFlipped?: boolean;
  flipKey?: number;
  companionCards?: Record<string, Hexagram | Hexagram[]>;
  onDrawCompanionCard?: (slotKey: string) => void;
  onRemoveCompanionCard?: (slotKey: string, cardIndex?: number) => void;
  companionCardSize?: "third" | "normal" | "large" | "same" | "xlarge";
  onToggleCompanionCardSize?: () => void;
  showCompanionButton?: boolean;
  showInterpretButton?: boolean;
  enableCardDrag?: boolean;
  dragResetKey?: number;
  enableHoverZoom?: boolean;
  enableSelectionHighlight?: boolean;
  onNavigateToManual?: (hexNumber: number) => void;
  isAllRotated?: boolean;
  slotRotations?: Record<number, boolean>;
  onToggleSlotRotation?: (slotIndex: number) => void;
  allowFlipOnClick?: boolean;
}

const SpreadContext = React.createContext<SpreadContextType>({
  cardImages: {},
  cardVideos: {},
  cardBackUrl: null,
  fitMode: "contain",
  allFlipped: false,
  enableCardDrag: false,
  dragResetKey: 0,
  enableHoverZoom: true,
  enableSelectionHighlight: true,
  isAllRotated: false,
  slotRotations: {},
  allowFlipOnClick: true,
});

interface SpreadDiagramProps {
  spreadType: SpreadType;
  cards: Hexagram[];
  cardImages?: Record<number, string>;
  cardVideos?: Record<number, string>;
  cardBackUrl?: string | null;
  selectedCardIndex?: number | null;
  onSelectCard?: (index: number) => void;
  onImageUpdated?: (num: number, url: string) => void;
  onVideoUpdated?: (num: number, url: string) => void;
  interactive?: boolean;
  isCard2Reversed?: boolean;
  onToggleCard2Reversed?: () => void;
  onSetCard2Reversed?: (val: boolean) => void;
  isCard2AReversed?: boolean;
  onToggleCard2AReversed?: () => void;
  onSetCard2AReversed?: (val: boolean) => void;
  isCard2BReversed?: boolean;
  onToggleCard2BReversed?: () => void;
  onSetCard2BReversed?: (val: boolean) => void;
  cardsContainerRef?: React.RefObject<HTMLDivElement | null>;
  customPositions?: CustomCardPosition[];
  fitMode?: "contain" | "cover";
  menhBranchNumber?: number;
  diceRollResult?: number;
  onUpdateMenhBranchNumber?: (branchNumber: number) => void;
  onHoverCard?: (data: HoverCardData) => void;
  onLeaveCard?: () => void;
  allFlipped?: boolean;
  companionCards?: Record<string, Hexagram | Hexagram[]>;
  onDrawCompanionCard?: (slotKey: string) => void;
  onRemoveCompanionCard?: (slotKey: string, cardIndex?: number) => void;
  enableHoverZoom?: boolean;
  onToggleHoverZoom?: () => void;
  companionCardSize?: "third" | "normal" | "large" | "same" | "xlarge";
  onUpdateCompanionCardSize?: (size: "third" | "normal" | "large" | "same" | "xlarge") => void;
  showCompanionButton?: boolean;
  onToggleCompanionButton?: () => void;
  showInterpretButton?: boolean;
  onToggleInterpretButton?: () => void;
  enableCardDrag?: boolean;
  onToggleCardDrag?: () => void;
  dragResetKey?: number;
  onResetCardPositions?: () => void;
  enableSelectionHighlight?: boolean;
  onToggleSelectionHighlight?: () => void;
  onNavigateToManual?: (hexNumber: number) => void;
  isAllCardsRotated?: boolean;
  onToggleCardsRotated?: () => void;
  cardRotationMap?: Record<number, boolean>;
  onToggleSlotRotation?: (slotIndex: number) => void;
  allowFlipOnClick?: boolean;
  onToggleAllowFlipOnClick?: () => void;
}

export const SpreadDiagram: React.FC<SpreadDiagramProps> = ({
  spreadType,
  cards,
  cardImages = {},
  cardVideos = {},
  cardBackUrl = null,
  selectedCardIndex,
  onSelectCard,
  onImageUpdated,
  onVideoUpdated,
  interactive = true,
  isCard2Reversed = false,
  onToggleCard2Reversed,
  isCard2AReversed = false,
  onToggleCard2AReversed,
  isCard2BReversed = false,
  onToggleCard2BReversed,
  cardsContainerRef,
  customPositions,
  fitMode = "contain",
  menhBranchNumber = 3,
  diceRollResult,
  onUpdateMenhBranchNumber,
  onHoverCard,
  onLeaveCard,
  allFlipped,
  companionCards,
  onDrawCompanionCard,
  onRemoveCompanionCard,
  enableHoverZoom,
  onToggleHoverZoom,
  companionCardSize,
  onUpdateCompanionCardSize,
  showCompanionButton,
  onToggleCompanionButton,
  showInterpretButton,
  onToggleInterpretButton,
  enableCardDrag,
  onToggleCardDrag,
  dragResetKey,
  onResetCardPositions,
  enableSelectionHighlight,
  onToggleSelectionHighlight,
  onNavigateToManual,
  isAllCardsRotated,
  onToggleCardsRotated,
  cardRotationMap,
  onToggleSlotRotation: propOnToggleSlotRotation,
  allowFlipOnClick: propAllowFlipOnClick,
  onToggleAllowFlipOnClick: propOnToggleAllowFlipOnClick,
}) => {
  const [internalMenhBranch, setInternalMenhBranch] = useState<number>(
    diceRollResult || menhBranchNumber || 3
  );

  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [internalAllFlipped, setInternalAllFlipped] = useState<boolean>(() => {
    if (typeof allFlipped === "boolean") return allFlipped;
    try {
      const saved = localStorage.getItem("iching_default_card_face_open");
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });
  const [flipKey, setFlipKey] = useState<number>(0);

  const [internalHoverZoom, setInternalHoverZoom] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("iching_enable_hover_zoom");
      return saved !== null ? saved === "true" : false;
    } catch {
      return false;
    }
  });

  const effectiveHoverZoom =
    typeof enableHoverZoom === "boolean" ? enableHoverZoom : internalHoverZoom;

  const handleToggleHoverZoom = () => {
    if (onToggleHoverZoom) {
      onToggleHoverZoom();
      return;
    }
    const next = !effectiveHoverZoom;
    setInternalHoverZoom(next);
    try {
      localStorage.setItem("iching_enable_hover_zoom", String(next));
    } catch {}
    if (!next) {
      setInternalHoveredCardData(null);
    }
  };

  const [internalCompanionCardSize, setInternalCompanionCardSize] = useState<"third" | "normal" | "large" | "same" | "xlarge">(() => {
    try {
      const saved = localStorage.getItem("iching_companion_card_size");
      if (saved === "large" || saved === "same" || saved === "xlarge") return saved;
      try {
        localStorage.setItem("iching_companion_card_size", "same");
      } catch {}
      return "same";
    } catch {
      return "same";
    }
  });

  const effectiveCompanionCardSize =
    companionCardSize || internalCompanionCardSize;

  const handleUpdateCompanionCardSize = (size: "third" | "normal" | "large" | "same" | "xlarge") => {
    if (onUpdateCompanionCardSize) {
      onUpdateCompanionCardSize(size);
      return;
    }
    setInternalCompanionCardSize(size);
    try {
      localStorage.setItem("iching_companion_card_size", size);
    } catch {}
  };

  const [internalShowCompanionButton, setInternalShowCompanionButton] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("iching_show_companion_btn");
      return saved !== null ? saved === "true" : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (typeof showCompanionButton === "boolean") {
      setInternalShowCompanionButton(showCompanionButton);
    }
  }, [showCompanionButton]);

  const effectiveShowCompanionButton =
    typeof showCompanionButton === "boolean" ? showCompanionButton : internalShowCompanionButton;

  const handleToggleCompanionButton = () => {
    if (onToggleCompanionButton) {
      onToggleCompanionButton();
    }
    setInternalShowCompanionButton((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("iching_show_companion_btn", String(next));
      } catch {}
      return next;
    });
  };

  const [internalShowInterpretButton, setInternalShowInterpretButton] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("iching_show_interpret_btn");
      return saved !== null ? saved === "true" : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (typeof showInterpretButton === "boolean") {
      setInternalShowInterpretButton(showInterpretButton);
    }
  }, [showInterpretButton]);

  const effectiveShowInterpretButton =
    typeof showInterpretButton === "boolean" ? showInterpretButton : internalShowInterpretButton;

  const handleToggleInterpretButton = () => {
    if (onToggleInterpretButton) {
      onToggleInterpretButton();
    }
    setInternalShowInterpretButton((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("iching_show_interpret_btn", String(next));
      } catch {}
      return next;
    });
  };

  const [internalHoveredCardData, setInternalHoveredCardData] = useState<HoverCardData | null>(null);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleCardHoverInternal = (data: HoverCardData) => {
    if (!effectiveHoverZoom) return;
    if (onHoverCard) {
      onHoverCard(data);
      return;
    }
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
    hoverTimerRef.current = setTimeout(() => {
      setInternalHoveredCardData(data);
    }, 50);
  };

  const handleCardLeaveInternal = () => {
    if (onLeaveCard) {
      onLeaveCard();
      return;
    }
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    closeTimerRef.current = setTimeout(() => {
      setInternalHoveredCardData(null);
    }, 160);
  };

  const [internalCardDrag, setInternalCardDrag] = useState<boolean>(false);
  const effectiveCardDrag = typeof enableCardDrag === "boolean" ? enableCardDrag : internalCardDrag;
  const [internalDragResetKey, setInternalDragResetKey] = useState<number>(0);
  const effectiveDragResetKey = dragResetKey !== undefined ? dragResetKey : internalDragResetKey;

  // Kéo bài luôn tắt khi mở quẻ mới / đổi trải bài
  useEffect(() => {
    setInternalCardDrag(false);
  }, [cards, spreadType]);

  const [internalSelectionHighlight, setInternalSelectionHighlight] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("iching_enable_selection_ring");
      return saved !== null ? saved === "true" : false;
    } catch {
      return false;
    }
  });

  const effectiveSelectionHighlight =
    enableSelectionHighlight !== undefined ? enableSelectionHighlight : internalSelectionHighlight;

  const handleToggleSelectionHighlight = () => {
    if (onToggleSelectionHighlight) {
      onToggleSelectionHighlight();
      return;
    }
    setInternalSelectionHighlight((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("iching_enable_selection_ring", String(next));
      } catch {}
      return next;
    });
  };

  const handleToggleCardDrag = () => {
    if (onToggleCardDrag) {
      onToggleCardDrag();
      return;
    }
    setInternalCardDrag((prev) => !prev);
  };

  const handleResetCardPositions = () => {
    if (onResetCardPositions) {
      onResetCardPositions();
      return;
    }
    setInternalDragResetKey((k) => k + 1);
    zenAudio.playCardFlipSound();
  };

  useEffect(() => {
    if (typeof allFlipped === "boolean") {
      setInternalAllFlipped(allFlipped);
      setFlipKey((k) => k + 1);
    } else {
      try {
        const saved = localStorage.getItem("iching_default_card_face_open");
        if (saved !== null) {
          setInternalAllFlipped(JSON.parse(saved));
          setFlipKey((k) => k + 1);
        }
      } catch {}
    }
  }, [allFlipped, cards]);

  const [internalAllRotated, setInternalAllRotated] = useState<boolean>(false);
  const effectiveAllRotated =
    typeof isAllCardsRotated === "boolean" ? isAllCardsRotated : internalAllRotated;

  useEffect(() => {
    if (typeof isAllCardsRotated === "boolean") {
      setInternalAllRotated(isAllCardsRotated);
    }
  }, [isAllCardsRotated]);

  const [slotRotations, setSlotRotations] = useState<Record<number, boolean>>({});

  // Sync cardRotationMap from props if provided
  useEffect(() => {
    if (cardRotationMap && Object.keys(cardRotationMap).length > 0) {
      setSlotRotations((prev) => ({
        ...prev,
        ...cardRotationMap,
      }));
    }
  }, [cardRotationMap]);

  const [internalAllowFlipOnClick, setInternalAllowFlipOnClick] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("iching_allow_flip_on_click");
      return saved !== null ? saved === "true" : false;
    } catch {
      return false;
    }
  });

  const effectiveAllowFlipOnClick =
    typeof propAllowFlipOnClick === "boolean" ? propAllowFlipOnClick : internalAllowFlipOnClick;

  const handleToggleAllowFlipOnClick = () => {
    if (propOnToggleAllowFlipOnClick) {
      propOnToggleAllowFlipOnClick();
      return;
    }
    const next = !effectiveAllowFlipOnClick;
    setInternalAllowFlipOnClick(next);
    try {
      localStorage.setItem("iching_allow_flip_on_click", String(next));
    } catch {}
    zenAudio.playCardFlipSound();
  };

  const handleToggleRotateAll = () => {
    if (onToggleCardsRotated) {
      onToggleCardsRotated();
      return;
    }
    const next = !effectiveAllRotated;
    setInternalAllRotated(next);
    const updated: Record<number, boolean> = {};
    cards.forEach((_, idx) => {
      updated[idx] = next;
    });
    setSlotRotations(updated);
    zenAudio.playCardFlipSound();
  };

  const handleToggleSlotRotation = (slotIndex: number) => {
    if (propOnToggleSlotRotation) {
      propOnToggleSlotRotation(slotIndex);
      return;
    }
    setSlotRotations((prev) => {
      const cur = prev[slotIndex] ?? effectiveAllRotated;
      return {
        ...prev,
        [slotIndex]: !cur,
      };
    });
    zenAudio.playCardFlipSound();
  };

  const spreadContextValue: SpreadContextType = React.useMemo(
    () => ({
      cardImages,
      cardVideos,
      cardBackUrl,
      fitMode,
      onImageUpdated,
      onVideoUpdated,
      onHoverCard: handleCardHoverInternal,
      onLeaveCard: handleCardLeaveInternal,
      allFlipped: internalAllFlipped,
      flipKey,
      companionCards,
      onDrawCompanionCard,
      onRemoveCompanionCard,
      companionCardSize: effectiveCompanionCardSize,
      onToggleCompanionCardSize: () => {
        const cycleMap: Record<string, "same" | "large" | "xlarge"> = {
          same: "large",
          large: "xlarge",
          xlarge: "same",
          third: "same",
          normal: "same",
        };
        const next = cycleMap[effectiveCompanionCardSize] || "same";
        handleUpdateCompanionCardSize(next);
      },
      showCompanionButton: effectiveShowCompanionButton,
      showInterpretButton: effectiveShowInterpretButton,
      enableCardDrag: effectiveCardDrag,
      dragResetKey: effectiveDragResetKey,
      enableHoverZoom: effectiveHoverZoom,
      enableSelectionHighlight: effectiveSelectionHighlight,
      onNavigateToManual,
      isAllRotated: effectiveAllRotated,
      slotRotations,
      onToggleSlotRotation: handleToggleSlotRotation,
      allowFlipOnClick: effectiveAllowFlipOnClick,
    }),
    [
      cardImages,
      cardVideos,
      cardBackUrl,
      fitMode,
      onImageUpdated,
      onVideoUpdated,
      handleCardHoverInternal,
      handleCardLeaveInternal,
      internalAllFlipped,
      flipKey,
      companionCards,
      onDrawCompanionCard,
      onRemoveCompanionCard,
      effectiveCompanionCardSize,
      effectiveShowCompanionButton,
      effectiveShowInterpretButton,
      effectiveCardDrag,
      effectiveDragResetKey,
      effectiveHoverZoom,
      effectiveSelectionHighlight,
      onNavigateToManual,
      effectiveAllRotated,
      slotRotations,
      effectiveAllowFlipOnClick,
    ]
  );

  const renderFlipAllButton = () => (
    <button
      type="button"
      onClick={() => {
        setInternalAllFlipped((prev) => {
          const next = !prev;
          try {
            localStorage.setItem("iching_default_card_face_open", JSON.stringify(next));
          } catch {}
          return next;
        });
        setFlipKey((k) => k + 1);
        zenAudio.playCardFlipSound();
      }}
      className={`no-capture flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-serif font-bold transition-all cursor-pointer shadow active:scale-95 group border ${
        internalAllFlipped
          ? "bg-[#281E13] text-[#E6D3A3] border-[#C9A55A] ring-1 ring-[#C9A55A]/50"
          : "bg-[#221A12] text-[#EAD8B1] hover:text-[#FFF] border-[#52412B] hover:border-[#C9A55A]"
      }`}
      title="Bật/Tắt trạng thái hiển thị lá bài: Mở Luôn (Mặt Ngửa) hoặc Úp Bài (Mặt Bát Quái)"
    >
      <span className="text-xs font-mono">{internalAllFlipped ? "📖" : "🎴"}</span>
      <span>{internalAllFlipped ? "Mở Luôn (Mặt Ngửa)" : "Úp Bài (Mặt Sấp)"}</span>
    </button>
  );

  const renderRotateAllButton = () => (
    <button
      type="button"
      onClick={handleToggleRotateAll}
      className={`no-capture flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-serif font-bold transition-all cursor-pointer shadow active:scale-95 group border ${
        effectiveAllRotated
          ? "bg-[#281E13] text-[#E6D3A3] border-[#C9A55A] ring-1 ring-[#C9A55A]/40"
          : "bg-[#221A12] text-[#EAD8B1] hover:text-[#FFF] border-[#52412B] hover:border-[#C9A55A]"
      }`}
      title="Bật/Tắt xoay bài (180° Ngược / Xuôi) cho toàn bộ các lá bài trong trận pháp"
    >
      <RotateCw className={`w-3.5 h-3.5 text-[#C9A55A] transition-transform duration-500 ${effectiveAllRotated ? "rotate-180 text-[#E6D3A3]" : "group-hover:rotate-180"}`} />
      <span>{effectiveAllRotated ? "Xoay Bài: 180° (Ngược)" : "Xoay Bài: 0° (Thuận)"}</span>
    </button>
  );

  const renderAllowFlipOnClickButton = () => (
    <button
      type="button"
      onClick={handleToggleAllowFlipOnClick}
      className={`no-capture flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-serif font-bold transition-all cursor-pointer shadow active:scale-95 group border ${
        effectiveAllowFlipOnClick
          ? "bg-[#281E13] text-[#E6D3A3] border-[#C9A55A] ring-1 ring-[#C9A55A]/40"
          : "bg-[#221A12] text-[#A89882] hover:text-[#FFF] border-[#52412B] hover:border-[#C9A55A]"
      }`}
      title="Bật/Tắt xoay bài qua mặt sau: Khi TẮT, nhấn vào lá bài sẽ không xoay lật mặt sau hay mặt trước nữa"
    >
      <FlipHorizontal className={`w-3.5 h-3.5 ${effectiveAllowFlipOnClick ? "text-[#C9A55A]" : "text-[#8C7D6A]"}`} />
      <span>{effectiveAllowFlipOnClick ? "Xoay Mặt Sau: BẬT" : "Xoay Mặt Sau: TẮT (Khóa)"}</span>
    </button>
  );

  const renderHoverZoomButton = () => (
    <button
      type="button"
      onClick={handleToggleHoverZoom}
      className={`no-capture flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-serif transition-colors cursor-pointer shadow border ${
        effectiveHoverZoom
          ? "bg-[#281E13] text-[#E6D3A3] border-[#C9A55A]"
          : "bg-[#1C1712] text-[#8C7D6A] border-[#382B1D] hover:text-[#C9A55A]"
      }`}
      title="Bật/Tắt hiệu ứng cầm lá bài lên lại gần khi lia chuột vào bất kỳ lá bài nào trong trận pháp"
    >
      <Eye className="w-3.5 h-3.5" />
      <span>Cầm bài lại gần: <strong>{effectiveHoverZoom ? "BẬT" : "TẮT"}</strong></span>
    </button>
  );

  const renderSelectionHighlightButton = () => (
    <button
      type="button"
      onClick={handleToggleSelectionHighlight}
      className={`no-capture flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-serif transition-colors cursor-pointer shadow border ${
        effectiveSelectionHighlight
          ? "bg-[#281E13] text-[#E6D3A3] border-[#C9A55A]"
          : "bg-[#1C1712] text-[#8C7D6A] border-[#382B1D] hover:text-[#8C7D6A]"
      }`}
      title="Bật/Tắt viền vòng vàng bao quanh lá bài khi nhấp chọn trong trận pháp"
    >
      <CircleDot className="w-3.5 h-3.5" />
      <span>Vòng vàng chọn: <strong>{effectiveSelectionHighlight ? "BẬT" : "TẮT"}</strong></span>
    </button>
  );

  const renderCompanionSizeControls = () => (
    <div className="no-capture flex items-center gap-1.5 flex-wrap">
      {/* Tắt/Mở Nút Bốc Thêm */}
      <button
        type="button"
        onClick={handleToggleCompanionButton}
        className={`px-2 py-1 rounded-lg text-[10px] font-serif transition-colors cursor-pointer border flex items-center gap-1 ${
          effectiveShowCompanionButton
            ? "bg-[#281E13] text-[#E6D3A3] border-[#C9A55A]"
            : "bg-[#1C1712] text-[#8C7D6A] border-[#382B1D] hover:text-[#B5A48F]"
        }`}
        title="Bật/Tắt hiển thị nút 'Bốc thêm' trên các lá bài"
      >
        <Plus className="w-2.5 h-2.5" />
        <span>Ô Bốc thêm: <strong>{effectiveShowCompanionButton ? "BẬT" : "TẮT"}</strong></span>
      </button>

      {/* Tắt/Mở Nút Luận Giải */}
      <button
        type="button"
        onClick={handleToggleInterpretButton}
        className={`px-2 py-1 rounded-lg text-[10px] font-serif transition-colors cursor-pointer border flex items-center gap-1 ${
          effectiveShowInterpretButton
            ? "bg-[#281E13] text-[#E6D3A3] border-[#C9A55A]"
            : "bg-[#1C1712] text-[#8C7D6A] border-[#382B1D] hover:text-[#B5A48F]"
        }`}
        title="Bật/Tắt hiển thị nút 'Luận giải' trên các lá bài"
      >
        <Eye className="w-2.5 h-2.5" />
        <span>Ô Luận giải: <strong>{effectiveShowInterpretButton ? "BẬT" : "TẮT"}</strong></span>
      </button>

      {/* Chọn cỡ lá bổ trợ */}
      <div className="flex items-center gap-1 bg-[#201811] px-2 py-1 rounded-lg border border-[#3A2D1F] flex-wrap">
        <span className="text-[10px] text-[#A89882] hidden md:inline font-serif">Lá bổ trợ:</span>
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
            className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
              effectiveCompanionCardSize === s.key || (s.key === "same" && (effectiveCompanionCardSize === "third" || effectiveCompanionCardSize === "normal"))
                ? "bg-[#C9A55A] text-black font-bold shadow"
                : "text-[#C4B49D] hover:text-white"
            }`}
            title={`Lá bổ trợ: ${s.label}`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );

  const renderDragControls = () => (
    <div className="no-capture flex items-center gap-1 bg-[#201811] px-2 py-1 rounded-lg border border-[#3A2D1F]">
      <button
        type="button"
        onClick={handleToggleCardDrag}
        className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${
          effectiveCardDrag
            ? "bg-[#281E13] text-[#E6D3A3] border border-[#C9A55A]"
            : "text-[#C4B49D] hover:text-white"
        }`}
        title="Bật/Tắt chế độ nhấp chuột và kéo di chuyển lá bài tự do trên màn hình"
      >
        <span className="font-serif">Kéo bài: <strong>{effectiveCardDrag ? "BẬT" : "TẮT"}</strong></span>
      </button>
      <button
        type="button"
        onClick={handleResetCardPositions}
        className="px-1.5 py-0.5 rounded text-[10px] text-[#C4B49D] hover:text-[#E6D3A3] transition-colors cursor-pointer"
        title="Đặt lại vị trí tất cả các lá bài về đúng ô ban đầu"
      >
        Đặt lại vị trí
      </button>
    </div>
  );

  // Trạng thái mở rộng bảng tùy chỉnh chi tiết (mặc định mở sẵn như hình người dùng yêu cầu, người dùng đóng/mở thì lưu nhớ theo ý người dùng)
  const [showDetailedControls, setShowDetailedControls] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("iching_show_detailed_controls");
      return saved !== null ? saved === "true" : true;
    } catch {
      return true;
    }
  });

  const toggleDetailedControls = () => {
    setShowDetailedControls((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("iching_show_detailed_controls", String(next));
      } catch {}
      return next;
    });
  };

  const renderSpreadTopHeader = (
    title: React.ReactNode,
    subtitle: React.ReactNode,
    extraControls?: React.ReactNode,
    badgeText?: string
  ) => {
    return (
      <div className="relative z-10 bg-[#15120E] border border-[#3D3121] rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 shadow-xl space-y-2.5 transition-all">
        {/* Hàng 1: Tiêu đề + Thông tin bố cục cố định sẵn (Full-width, không bao giờ bị chèn ép) */}
        <div className="w-full">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C9A55A] shadow-[0_0_8px_#C9A55A] shrink-0" />
            <h3 className="text-sm sm:text-base md:text-lg font-serif font-bold text-[#F5EAD4] tracking-wide">
              {title}
            </h3>
            {badgeText && (
              <span className="text-[10px] font-mono text-[#C9A55A] bg-[#241D14] px-2 py-0.5 rounded border border-[#483723] shrink-0">
                {badgeText}
              </span>
            )}
            <span className="text-[10px] font-mono text-emerald-400/90 bg-[#122416] px-2 py-0.5 rounded border border-[#234D2B] shrink-0">
              ✓ Cố định sẵn
            </span>
          </div>
          {subtitle && (
            <p className="text-xs text-[#A89882] font-serif mt-1 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {/* Hàng 2: Thanh công cụ thao tác nhanh (Chế độ xem, Lật bài, Chụp ảnh, Tùy chỉnh) */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-[#2C2115] w-full">
          {/* Nhóm điều khiển đặc thù trận pháp */}
          {extraControls ? (
            <div className="flex items-center flex-wrap gap-2">
              {extraControls}
            </div>
          ) : <div />}

          {/* Quick Primary Actions: View Mode, Flip, Capture, Toggle detailed toolbar */}
          <div className="flex items-center flex-wrap gap-2 sm:ml-auto">
            {renderFlipAllButton()}

            {/* Chụp màn hình nhanh */}
            <button
              type="button"
              onClick={handleCaptureScreenshot}
              disabled={isCapturing}
              className="no-capture flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-serif font-bold bg-[#2A2117] hover:bg-[#382B1E] text-[#EAD8B1] hover:text-[#FFF] border border-[#4A3925] transition-all cursor-pointer shadow"
              title="Chụp ảnh toàn bộ lá bài trong trận pháp để lưu trữ hoặc chia sẻ"
            >
              {isCapturing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C9A55A]" />
                  <span>Đang chụp...</span>
                </>
              ) : capturedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Đã lưu ảnh!</span>
                </>
              ) : (
                <>
                  <Camera className="w-3.5 h-3.5 text-[#C9A55A]" />
                  <span>Chụp Toàn Bộ Lá Bài</span>
                </>
              )}
            </button>

            {exportedImageUrl && (
              <button
                type="button"
                onClick={() => setShowExportModal(true)}
                className="no-capture flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-serif text-[#C9A55A] bg-[#221A12] hover:bg-[#302418] border border-[#443522] transition-colors cursor-pointer"
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
              className={`no-capture flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-serif transition-all cursor-pointer border shadow ${
                showDetailedControls
                  ? "bg-[#2E2013] text-[#E6D3A3] border-[#C9A55A] font-bold ring-1 ring-[#C9A55A]/50"
                  : "bg-[#1C1712] text-[#A89882] border-[#382B1D] hover:text-[#E6D3A3] hover:border-[#523E28]"
              }`}
              title="Mở rộng / Thu gọn các nút điều khiển chi tiết (cỡ bài, xoay bài, cỡ lá bổ trợ, kéo bài, xem gần...)"
            >
              <Settings className="w-3.5 h-3.5 text-[#C9A55A]" />
              <span>{showDetailedControls ? "Thu gọn tùy chỉnh" : "Tùy chỉnh (Cố định sẵn)"}</span>
              {showDetailedControls ? (
                <ChevronUp className="w-3 h-3 text-[#C9A55A]" />
              ) : (
                <ChevronDown className="w-3 h-3 text-[#A89882]" />
              )}
            </button>
          </div>
        </div>

        {/* Hàng 2 (Mở rộng): Bảng điều khiển chi tiết các thiết lập đã cố định sẵn */}
        {showDetailedControls && (
          <div className="pt-2.5 border-t border-[#2C2317] flex items-center flex-wrap gap-2 animate-in fade-in duration-200">
            {renderCardSizeControls()}
            {renderCompanionSizeControls()}
            {renderRotateAllButton()}
            {renderAllowFlipOnClickButton()}
            {renderHoverZoomButton()}
            {renderSelectionHighlightButton()}
            {renderDragControls()}
          </div>
        )}
      </div>
    );
  };

  const renderHoverModal = () => {
    if (onHoverCard || !internalHoveredCardData) return null;
    return (
      <FullScreenCardHoverModal
        data={internalHoveredCardData}
        cardImages={cardImages}
        cardVideos={cardVideos}
        cardBackUrl={cardBackUrl}
        onClose={() => setInternalHoveredCardData(null)}
        onMouseEnter={() => {
          if (closeTimerRef.current) {
            clearTimeout(closeTimerRef.current);
            closeTimerRef.current = null;
          }
        }}
        onMouseLeave={() => {
          closeTimerRef.current = setTimeout(() => {
            setInternalHoveredCardData(null);
          }, 140);
        }}
      />
    );
  };

  useEffect(() => {
    if (diceRollResult) {
      setInternalMenhBranch(diceRollResult);
    } else if (menhBranchNumber) {
      setInternalMenhBranch(menhBranchNumber);
    }
  }, [diceRollResult, menhBranchNumber]);

  const activeMenh = diceRollResult || menhBranchNumber || internalMenhBranch;

  const [tenStarView, setTenStarView] = useState<"cross" | "grid">("cross");
  const [ninePalacesView, setNinePalacesView] = useState<"grid" | "flight">("grid");
  const [twelveBranchesView, setTwelveBranchesView] = useState<"grid" | "list">("grid");
  const [isReverseHouses, setIsReverseHouses] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedSuccess, setCapturedSuccess] = useState(false);
  const [exportedImageUrl, setExportedImageUrl] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [cardSizeScale, setCardSizeScale] = useState<"mini" | "compact" | "normal" | "large" | "xlarge">(() => {
    try {
      const isInit = localStorage.getItem("iching_spread_card_size_v2_init");
      if (!isInit) {
        localStorage.setItem("iching_spread_card_size_v2_init", "true");
        localStorage.setItem("iching_spread_card_size_scale", "mini");
        return "mini";
      }
      const saved = localStorage.getItem("iching_spread_card_size_scale");
      if (saved === "mini" || saved === "compact" || saved === "normal" || saved === "large" || saved === "xlarge") return saved;
      return "mini";
    } catch {
      return "mini";
    }
  });
  const localCardsRef = useRef<HTMLDivElement>(null);
  const targetCardsRef = cardsContainerRef || localCardsRef;

  const handleUpdateCardSizeScale = (size: "mini" | "compact" | "normal" | "large" | "xlarge") => {
    setCardSizeScale(size);
    try {
      localStorage.setItem("iching_spread_card_size_scale", size);
      localStorage.setItem("iching_spread_card_size_v2_init", "true");
    } catch {}
  };

  const handleCaptureScreenshot = async () => {
    if (!targetCardsRef.current || isCapturing) return;
    const previousFlipped = internalAllFlipped;
    try {
      setIsCapturing(true);

      // Programmatically set internalAllFlipped to true (face-up) if not already
      if (!previousFlipped) {
        setInternalAllFlipped(true);
        setFlipKey((k) => k + 1);
      }

      // Mark container with data-capturing="true" for instant CSS face-up override
      targetCardsRef.current.setAttribute("data-capturing", "true");

      // Brief tick to ensure UI state is settled and rotated
      await new Promise((resolve) => setTimeout(resolve, 150));

      const dataUrl = await captureElementToPng(targetCardsRef.current, {
        backgroundColor: "#15120E",
        pixelRatio: 2,
      });

      const timestamp = new Date().toISOString().slice(0, 10);
      setExportedImageUrl(dataUrl);
      setShowExportModal(true);
      setCapturedSuccess(true);
      setTimeout(() => setCapturedSuccess(false), 3000);
    } catch (err) {
      console.error("Lỗi khi chụp màn hình trải bài:", err);
    } finally {
      if (targetCardsRef.current) {
        targetCardsRef.current.removeAttribute("data-capturing");
      }
      if (!previousFlipped) {
        setInternalAllFlipped(false);
        setFlipKey((k) => k + 1);
      }
      setIsCapturing(false);
    }
  };

  const getCardSize = (defaultSize: "xs" | "sm"): "tiny" | "xs" | "sm" | "md" | "lg" | "xl" => {
    if (cardSizeScale === "mini") return "tiny";
    if (cardSizeScale === "compact") return "xs";
    if (cardSizeScale === "normal") return defaultSize;
    if (cardSizeScale === "large") return defaultSize === "xs" ? "md" : "lg";
    if (cardSizeScale === "xlarge") return defaultSize === "xs" ? "lg" : "xl";
    return defaultSize;
  };

  const renderCardSizeControls = () => (
    <div className="no-capture flex items-center gap-1 bg-[#201811] px-2 py-1 rounded-lg border border-[#3A2D1F]">
      <span className="text-[10px] text-[#A89882] hidden md:inline font-serif">Cỡ lá:</span>
      <button
        type="button"
        onClick={() => handleUpdateCardSizeScale("mini")}
        className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
          cardSizeScale === "mini"
            ? "bg-[#C9A55A] text-black font-bold"
            : "text-[#C4B49D] hover:text-white"
        }`}
        title="Mini (Rất nhỏ)"
      >
        Mini
      </button>
      <button
        type="button"
        onClick={() => handleUpdateCardSizeScale("compact")}
        className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
          cardSizeScale === "compact"
            ? "bg-[#C9A55A] text-black font-bold"
            : "text-[#C4B49D] hover:text-white"
        }`}
        title="Nhỏ"
      >
        Nhỏ
      </button>
      <button
        type="button"
        onClick={() => handleUpdateCardSizeScale("normal")}
        className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
          cardSizeScale === "normal"
            ? "bg-[#C9A55A] text-black font-bold"
            : "text-[#C4B49D] hover:text-white"
        }`}
        title="Vừa (Tiêu chuẩn)"
      >
        Vừa
      </button>
      <button
        type="button"
        onClick={() => handleUpdateCardSizeScale("large")}
        className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
          cardSizeScale === "large"
            ? "bg-[#C9A55A] text-black font-bold"
            : "text-[#C4B49D] hover:text-white"
        }`}
        title="Lớn"
      >
        Lớn
      </button>
      <button
        type="button"
        onClick={() => handleUpdateCardSizeScale("xlarge")}
        className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
          cardSizeScale === "xlarge"
            ? "bg-[#C9A55A] text-black font-bold"
            : "text-[#C4B49D] hover:text-white"
        }`}
        title="Rất lớn (Cực đại)"
      >
        Rất lớn
      </button>
    </div>
  );

  const renderExportModal = () => (
    <ExportImageModal
      isOpen={showExportModal}
      onClose={() => setShowExportModal(false)}
      imageUrl={exportedImageUrl}
      title={
        spreadType === "twelve_houses"
          ? "Ảnh Trận Pháp 12 Địa Chi & Tử Vi (12 Lá)"
          : spreadType === "nine_palaces"
          ? "Ảnh Trận Pháp Cửu Cung Phong Thủy (9 Lá)"
          : spreadType === "ten_stars_expanded"
          ? "Ảnh Trận Pháp Thập Tinh Mở Rộng (11 Lá: 2A & 2B)"
          : spreadType === "ten_stars"
          ? "Ảnh Trận Pháp Thập Tinh (10 Lá)"
          : spreadType === "seven_stars"
          ? "Ảnh Trận Pháp Thất Tinh (7 Lá)"
          : `Ảnh Trận Pháp Tùy Chỉnh (${cards.length} Lá)`
      }
      filename={`tran-phap-${
        spreadType === "twelve_houses"
          ? "12-dia-chi-tu-vi-12-la"
          : spreadType === "nine_palaces"
          ? "cuu-cung-phong-thuy-9-la"
          : spreadType === "ten_stars_expanded"
          ? "thap-tinh-mo-rong-11-la"
          : spreadType === "ten_stars"
          ? "thap-tinh-10-la"
          : spreadType === "seven_stars"
          ? "that-tinh-7-la"
          : `tuy-chinh-${cards.length}-la`
      }-${new Date().toISOString().slice(0, 10)}.png`}
    />
  );

  if (spreadType === "seven_stars" && cards.length >= 7) {
    return (
      <SpreadContext.Provider value={spreadContextValue}>
        <div
          className="bg-[#15120E] border border-[#3D3121] rounded-2xl p-3 sm:p-5 md:p-6 shadow-2xl"
        >
          {renderSpreadTopHeader(
            "TRẬN PHÁP THẤT TINH (7 LÁ BÀI DỊCH HỌC)",
            "Đồ hình Thất Tinh Bắc Đẩu: Cân bằng Tam Giác Bản Thân • Ngoại Cảnh • Dòng Thời Gian • Minh Triết Khuyên Nhủ",
            undefined,
            "7 Quẻ Thất Tinh"
          )}

          {/* 7-Star Layout: CHÍNH XÁC KHU VỰC CÁC LÁ BÀI ĐƯỢC CHỤP */}
          <div
            ref={targetCardsRef}
            className="max-w-4xl mx-auto space-y-4 sm:space-y-6 md:space-y-8 py-3 px-2 sm:px-4 bg-[#15120E] rounded-xl"
          >
            {/* Row 1: Top Center - 4. Lá Bài Gợi Ý */}
            <div className="flex justify-center">
              <SpreadCardSlot
                position={SEVEN_STARS_POSITIONS[3]}
                card={cards[3]}
                cardImage={cardImages[cards[3]?.number]}
                isSelected={selectedCardIndex === 3}
                onSelect={() => onSelectCard && onSelectCard(3)}
                onImageUpdated={onImageUpdated}
                interactive={interactive}
                size={getCardSize("xs")}
              />
            </div>

            {/* Row 2: Middle Row - 2. Bản Thân Hiện Tại | 3. Diễn Biến Tiếp Theo | 5. Kết Quả */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 justify-items-center items-start">
              <SpreadCardSlot
                position={SEVEN_STARS_POSITIONS[1]}
                card={cards[1]}
                cardImage={cardImages[cards[1]?.number]}
                isSelected={selectedCardIndex === 1}
                onSelect={() => onSelectCard && onSelectCard(1)}
                onImageUpdated={onImageUpdated}
                interactive={interactive}
                size={getCardSize("xs")}
              />
              <SpreadCardSlot
                position={SEVEN_STARS_POSITIONS[2]}
                card={cards[2]}
                cardImage={cardImages[cards[2]?.number]}
                isSelected={selectedCardIndex === 2}
                onSelect={() => onSelectCard && onSelectCard(2)}
                onImageUpdated={onImageUpdated}
                interactive={interactive}
                size={getCardSize("xs")}
              />
              <SpreadCardSlot
                position={SEVEN_STARS_POSITIONS[4]}
                card={cards[4]}
                cardImage={cardImages[cards[4]?.number]}
                isSelected={selectedCardIndex === 4}
                onSelect={() => onSelectCard && onSelectCard(4)}
                onImageUpdated={onImageUpdated}
                interactive={interactive}
                size={getCardSize("xs")}
              />
            </div>

            {/* Row 3: Bottom Row - 7. Thiếu Sót Của Bản Thân | 1. Quá Khứ | 6. Môi Trường Bên Ngoài */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 justify-items-center items-start">
              <SpreadCardSlot
                position={SEVEN_STARS_POSITIONS[6]}
                card={cards[6]}
                cardImage={cardImages[cards[6]?.number]}
                isSelected={selectedCardIndex === 6}
                onSelect={() => onSelectCard && onSelectCard(6)}
                onImageUpdated={onImageUpdated}
                interactive={interactive}
                size={getCardSize("xs")}
              />
              <SpreadCardSlot
                position={SEVEN_STARS_POSITIONS[0]}
                card={cards[0]}
                cardImage={cardImages[cards[0]?.number]}
                isSelected={selectedCardIndex === 0}
                onSelect={() => onSelectCard && onSelectCard(0)}
                onImageUpdated={onImageUpdated}
                interactive={interactive}
                size={getCardSize("xs")}
              />
              <SpreadCardSlot
                position={SEVEN_STARS_POSITIONS[5]}
                card={cards[5]}
                cardImage={cardImages[cards[5]?.number]}
                isSelected={selectedCardIndex === 5}
                onSelect={() => onSelectCard && onSelectCard(5)}
                onImageUpdated={onImageUpdated}
                interactive={interactive}
                size={getCardSize("xs")}
              />
            </div>
          </div>
        </div>
        {renderHoverModal()}
        {renderExportModal()}
      </SpreadContext.Provider>
    );
  }

  if (spreadType === "nine_palaces" && cards.length >= 9) {
    return (
      <SpreadContext.Provider value={spreadContextValue}>
        <div className="bg-[#15120E] border border-[#3D3121] rounded-2xl p-3 sm:p-5 md:p-6 shadow-2xl">
          {renderSpreadTopHeader(
            "TRẬN PHÁP CỬU CUNG PHONG THỦY (9 LÁ BÀI - PHI TINH LẠC THƯ)",
            "Đồ hình 3x3 Lạc Thư: Hàng 1 (Đông Nam • Chính Nam • Tây Nam) — Hàng 2 (Chính Đông • Trung Cung • Chính Tây) — Hàng 3 (Đông Bắc • Chính Bắc • Tây Bắc)",
            <div className="no-capture flex items-center bg-[#201811] p-1 rounded-lg border border-[#3A2D1F] text-xs">
              <button
                type="button"
                onClick={() => setNinePalacesView("grid")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition-colors ${
                  ninePalacesView === "grid"
                    ? "bg-[#C9A55A] text-black font-bold shadow"
                    : "text-[#C4B49D] hover:text-white"
                }`}
                title="Xem dạng Lưới Phong Thủy 3x3 (mỗi dòng 3 lá)"
              >
                <Grid3X3 className="w-3.5 h-3.5" />
                <span>Lưới 3x3 Cửu Cung</span>
              </button>
              <button
                type="button"
                onClick={() => setNinePalacesView("flight")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition-colors ${
                  ninePalacesView === "flight"
                    ? "bg-[#C9A55A] text-black font-bold shadow"
                    : "text-[#C4B49D] hover:text-white"
                }`}
                title="Xem theo thứ tự bay Phi Tinh (5 ở giữa ➔ 6 Tây Bắc ➔ 7 Chính Tây...)"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Quỹ Đạo Phi Tinh</span>
              </button>
            </div>,
            "9 Quẻ Cửu Cung"
          )}

          {/* Capture Area */}
          <div
            ref={targetCardsRef}
            className="p-3 sm:p-5 rounded-2xl bg-gradient-to-b from-[#191510] via-[#14110D] to-[#100D0A] border border-[#382B1B] shadow-inner"
          >
            {ninePalacesView === "grid" ? (
              <div className="space-y-3 sm:space-y-4 max-w-4xl mx-auto">
                {/* North/South Header Orientation */}
                <div className="text-center">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#2A160F] border border-[#5A2C18] text-[#FF8E66] text-[11px] font-serif font-bold uppercase tracking-wider shadow">
                    ▲ PHÍA NAM (HỎA • TIỀN CHU TƯỚC • LY 9)
                  </span>
                </div>

                {/* 3x3 Grid: Mỗi dòng 3 lá */}
                <div className="relative border border-[#382C1E] rounded-2xl p-2 sm:p-4 bg-[#16120E]/90 shadow-2xl backdrop-blur-sm">
                  {/* Cardinal Side Indicators */}
                  <div className="hidden lg:flex absolute -left-7 top-1/2 -translate-y-1/2 flex-col items-center">
                    <span className="[writing-mode:vertical-lr] rotate-180 text-[10px] font-serif font-bold text-[#6CB578] tracking-widest px-1 py-2 bg-[#101A12] border border-[#23432A] rounded-md shadow">
                      ◄ PHÍA ĐÔNG (MỘC)
                    </span>
                  </div>
                  <div className="hidden lg:flex absolute -right-7 top-1/2 -translate-y-1/2 flex-col items-center">
                    <span className="[writing-mode:vertical-lr] text-[10px] font-serif font-bold text-[#E2D5B5] tracking-widest px-1 py-2 bg-[#1D1B16] border border-[#433B2B] rounded-md shadow">
                      ► PHÍA TÂY (KIM)
                    </span>
                  </div>

                  {/* DÒNG 1: 3 LÁ (Đông Nam • Chính Nam • Tây Nam) */}
                  <div className="mb-2 sm:mb-4">
                    <div className="text-[10px] font-serif font-semibold text-[#A89882] mb-1 px-1 flex items-center justify-between">
                      <span className="text-[#FF9D78]">✦ Dòng 1 (Phía Nam)</span>
                      <span className="text-[9px] text-[#7A6D5C]">Đông Nam (Tốn 4) • Chính Nam (Ly 9) • Tây Nam (Khôn 2)</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-3 md:gap-4 justify-items-center items-start">
                      {/* Đông Nam (Cung 4 - Lá 9) */}
                      <SpreadCardSlot
                        position={NINE_PALACES_POSITIONS[8]}
                        card={cards[8]}
                        cardImage={cardImages[cards[8]?.number]}
                        isSelected={selectedCardIndex === 8}
                        onSelect={() => onSelectCard && onSelectCard(8)}
                        onImageUpdated={onImageUpdated}
                        interactive={interactive}
                        size={getCardSize("xs")}
                      />
                      {/* Chính Nam (Cung 9 - Lá 5) */}
                      <SpreadCardSlot
                        position={NINE_PALACES_POSITIONS[4]}
                        card={cards[4]}
                        cardImage={cardImages[cards[4]?.number]}
                        isSelected={selectedCardIndex === 4}
                        onSelect={() => onSelectCard && onSelectCard(4)}
                        onImageUpdated={onImageUpdated}
                        interactive={interactive}
                        size={getCardSize("xs")}
                      />
                      {/* Tây Nam (Cung 2 - Lá 7) */}
                      <SpreadCardSlot
                        position={NINE_PALACES_POSITIONS[6]}
                        card={cards[6]}
                        cardImage={cardImages[cards[6]?.number]}
                        isSelected={selectedCardIndex === 6}
                        onSelect={() => onSelectCard && onSelectCard(6)}
                        onImageUpdated={onImageUpdated}
                        interactive={interactive}
                        size={getCardSize("xs")}
                      />
                    </div>
                  </div>

                  {/* DÒNG 2: 3 LÁ (Chính Đông • TRUNG CUNG • Chính Tây) */}
                  <div className="mb-2 sm:mb-4 bg-[#1D1711]/60 p-1.5 sm:p-2.5 rounded-xl border border-[#443321]">
                    <div className="text-[10px] font-serif font-semibold text-[#A89882] mb-1 px-1 flex items-center justify-between">
                      <span className="text-[#E6D3A3]">✦ Dòng 2 (Hàng Giữa - Trục Ngang)</span>
                      <span className="text-[9px] text-[#C9A55A]">Chính Đông (Chấn 3) • <strong>Trung Cung (Ở Giữa 5)</strong> • Chính Tây (Đoài 7)</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-3 md:gap-4 justify-items-center items-start">
                      {/* Chính Đông (Cung 3 - Lá 8) */}
                      <SpreadCardSlot
                        position={NINE_PALACES_POSITIONS[7]}
                        card={cards[7]}
                        cardImage={cardImages[cards[7]?.number]}
                        isSelected={selectedCardIndex === 7}
                        onSelect={() => onSelectCard && onSelectCard(7)}
                        onImageUpdated={onImageUpdated}
                        interactive={interactive}
                        size={getCardSize("xs")}
                      />
                      {/* Trung Cung (Cung 5 - Ở Giữa - Lá 1) */}
                      <div className="w-full flex flex-col items-center relative">
                        <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-[#C9A55A]/20 via-[#E6D3A3]/30 to-[#C9A55A]/20 blur-xs -z-0 pointer-events-none" />
                        <SpreadCardSlot
                          position={NINE_PALACES_POSITIONS[0]}
                          card={cards[0]}
                          cardImage={cardImages[cards[0]?.number]}
                          isSelected={selectedCardIndex === 0}
                          onSelect={() => onSelectCard && onSelectCard(0)}
                          onImageUpdated={onImageUpdated}
                          interactive={interactive}
                          size={getCardSize("xs")}
                        />
                      </div>
                      {/* Chính Tây (Cung 7 - Lá 3) */}
                      <SpreadCardSlot
                        position={NINE_PALACES_POSITIONS[2]}
                        card={cards[2]}
                        cardImage={cardImages[cards[2]?.number]}
                        isSelected={selectedCardIndex === 2}
                        onSelect={() => onSelectCard && onSelectCard(2)}
                        onImageUpdated={onImageUpdated}
                        interactive={interactive}
                        size={getCardSize("xs")}
                      />
                    </div>
                  </div>

                  {/* DÒNG 3: 3 LÁ (Đông Bắc • Chính Bắc • Tây Bắc) */}
                  <div>
                    <div className="text-[10px] font-serif font-semibold text-[#A89882] mb-1 px-1 flex items-center justify-between">
                      <span className="text-[#6CB5D9]">✦ Dòng 3 (Phía Bắc)</span>
                      <span className="text-[9px] text-[#7A6D5C]">Đông Bắc (Cấn 8) • Chính Bắc (Khảm 1) • Tây Bắc (Càn 6)</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-3 md:gap-4 justify-items-center items-start">
                      {/* Đông Bắc (Cung 8 - Lá 4) */}
                      <SpreadCardSlot
                        position={NINE_PALACES_POSITIONS[3]}
                        card={cards[3]}
                        cardImage={cardImages[cards[3]?.number]}
                        isSelected={selectedCardIndex === 3}
                        onSelect={() => onSelectCard && onSelectCard(3)}
                        onImageUpdated={onImageUpdated}
                        interactive={interactive}
                        size={getCardSize("xs")}
                      />
                      {/* Chính Bắc (Cung 1 - Lá 6) */}
                      <SpreadCardSlot
                        position={NINE_PALACES_POSITIONS[5]}
                        card={cards[5]}
                        cardImage={cardImages[cards[5]?.number]}
                        isSelected={selectedCardIndex === 5}
                        onSelect={() => onSelectCard && onSelectCard(5)}
                        onImageUpdated={onImageUpdated}
                        interactive={interactive}
                        size={getCardSize("xs")}
                      />
                      {/* Tây Bắc (Cung 6 - Lá 2) */}
                      <SpreadCardSlot
                        position={NINE_PALACES_POSITIONS[1]}
                        card={cards[1]}
                        cardImage={cardImages[cards[1]?.number]}
                        isSelected={selectedCardIndex === 1}
                        onSelect={() => onSelectCard && onSelectCard(1)}
                        onImageUpdated={onImageUpdated}
                        interactive={interactive}
                        size={getCardSize("xs")}
                      />
                    </div>
                  </div>
                </div>

                {/* North Bottom Indicator */}
                <div className="text-center">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#101826] border border-[#213552] text-[#8AC1FF] text-[11px] font-serif font-bold uppercase tracking-wider shadow">
                    ▼ PHÍA BẮC (THỦY • HẬU HUYỀN VŨ • KHẢM 1)
                  </span>
                </div>
              </div>
            ) : (
              /* Quỹ Đạo Phi Tinh: Chiều bay từ 5 ở giữa -> 6 -> 7... */
              <div className="space-y-4 max-w-4xl mx-auto">
                <div className="p-3 bg-[#1B1611] rounded-xl border border-[#3E301F] text-xs text-[#C4B49D]">
                  <p className="font-serif font-bold text-[#C9A55A] mb-1">
                    ✦ Đường Bay Lượng Thiên Xích (Thứ Tự Phi Tinh 9 Cung):
                  </p>
                  <p className="leading-relaxed text-[11px]">
                    1. Ở giữa là 5 (Trung Cung) ➔ 2. Tây Bắc là 6 (Càn) ➔ 3. Chính Tây là 7 (Đoài) ➔ 4. Đông Bắc là 8 (Cấn) ➔ 5. Chính Nam là 9 (Ly) ➔ 6. Chính Bắc là 1 (Khảm) ➔ 7. Tây Nam là 2 (Khôn) ➔ 8. Chính Đông là 3 (Chấn) ➔ 9. Đông Nam là 4 (Tốn).
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {NINE_PALACES_POSITIONS.map((pos, idx) => (
                    <div
                      key={pos.id}
                      onClick={() => onSelectCard && onSelectCard(idx)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        selectedCardIndex === idx && effectiveSelectionHighlight
                          ? "bg-[#251D14] border-[#C9A55A] shadow-[0_0_12px_rgba(212,175,55,0.3)]"
                          : "bg-[#16120E] border-[#312519] hover:border-[#4B3B28] hover:bg-[#1C1712]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-[#2C2116]">
                        <span className="text-xs font-serif font-bold text-[#EAD8B1] flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-[#2A1F14] text-[#C9A55A] flex items-center justify-center text-[11px] font-mono font-bold">
                            {idx + 1}
                          </span>
                          <span>{pos.name}</span>
                        </span>
                        <span className="text-[10px] font-serif text-[#C9A55A] bg-[#221911] px-1.5 py-0.5 rounded border border-[#3E2E1D]">
                          Bước {idx + 1}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-16 shrink-0">
                          {cards[idx] && (
                            <CardVisual
                              hexagram={cards[idx]}
                              imageUrl={cardImages[cards[idx].number]}
                              size="xs"
                              fitMode={fitMode}
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-serif font-bold text-[#FFF] truncate">
                            Quẻ #{cards[idx]?.number}: {cards[idx]?.name}
                          </div>
                          <div className="text-[11px] text-[#C9A55A] mt-0.5">
                            {cards[idx]?.vietnameseName}
                          </div>
                          <p className="text-[10px] text-[#A89882] mt-1 line-clamp-2 leading-tight">
                            {pos.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* PALACE EXPLANATION LIST */}
          <div className="mt-5 pt-4 border-t border-[#2C2317]">
            <h4 className="text-xs sm:text-sm font-serif font-bold text-[#EAD8B1] uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C9A55A]" />
              Chi Tiết 9 Cung Phong Thủy Ứng Với Quẻ Đã Bốc
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {NINE_PALACES_POSITIONS.map((pos, idx) => {
                const card = cards[idx];
                const isSelected = selectedCardIndex === idx;
                return (
                  <div
                    key={pos.id}
                    onClick={() => onSelectCard && onSelectCard(idx)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "bg-[#251D14] border-[#C9A55A] shadow-md"
                        : "bg-[#16120E] border-[#2E2317] hover:border-[#463624] hover:bg-[#1D1712]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1.5 mb-1.5">
                        <span className="text-xs font-serif font-bold text-[#EAD8B1] flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded bg-[#2D2114] text-[#C9A55A] text-[10px] flex items-center justify-center font-mono font-bold">
                            {idx + 1}
                          </span>
                          <span className="truncate">{pos.name}</span>
                        </span>
                        <span className="text-[10px] text-[#A89882] font-mono">
                          Lá {idx + 1}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-[#E6D3A3] mb-1">
                        Quẻ #{card?.number}: {card?.name}
                      </div>
                      <p className="text-[11px] text-[#A89882] leading-relaxed">
                        {pos.description}
                      </p>
                    </div>

                    <div className="mt-2 pt-2 border-t border-[#261C12] flex items-center justify-between text-[10px]">
                      <span className="text-[#8C7D6A] italic">
                        {pos.subtitle}
                      </span>
                      <span className="text-[#C9A55A] font-serif font-bold">
                        {isSelected ? "Đang chọn xem ✦" : "Nhấp để xem chi tiết →"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {renderHoverModal()}
        {renderExportModal()}
      </SpreadContext.Provider>
    );
  }

  if (spreadType === "twelve_houses" && cards.length >= 12) {
    const menhBranchInfo = TWELVE_BRANCHES_DATA.find((b) => b.number === activeMenh) || TWELVE_BRANCHES_DATA[2];
    const menhCard = cards[activeMenh - 1] || cards[0];

    // Map 12 positions in 4x4 perimeter
    // Row 1 (top): Tị (6), Ngọ (7), Mùi (8), Thân (9)
    // Row 2: Thìn (5), [Center 2x2], Dậu (10)
    // Row 3: Mão (4), [Center 2x2], Tuất (11)
    // Row 4 (bottom): Dần (3), Sửu (2), Tý (1), Hợi (12)
    const renderBranchSlot = (branchNum: number) => {
      const branch = TWELVE_BRANCHES_DATA.find((b) => b.number === branchNum);
      if (!branch) return null;
      const cardIdx = branch.number - 1;
      const card = cards[cardIdx];
      const house = getHouseForBranch(branch.number, activeMenh, isReverseHouses);
      const isMenh = branch.number === activeMenh;
      const isSelected = selectedCardIndex === cardIdx;
      const slotKey = `branch_${branch.number}`;

      return (
        <div
          key={branch.id}
          className={`relative p-1.5 sm:p-2 rounded-xl sm:rounded-2xl transition-all duration-300 flex flex-col items-center justify-between border text-center ${
            isMenh
              ? "bg-gradient-to-b from-[#342412] via-[#22170D] to-[#160F09] border-[#E6D3A3] shadow-[0_0_20px_rgba(212,175,55,0.4)] ring-2 ring-[#C9A55A]"
              : isSelected
              ? "bg-[#251D14] border-[#C9A55A] ring-1 ring-[#C9A55A] shadow-lg"
              : "bg-[#16120E] border-[#302417] hover:border-[#523E28] hover:bg-[#1D1610]"
          }`}
        >
          {/* Top Branch & Month Header */}
          <div className="w-full flex items-center justify-between gap-1 mb-1 px-1">
            <span
              className={`text-[9px] sm:text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                isMenh
                  ? "bg-[#C9A55A] text-black"
                  : "bg-[#241A12] text-[#EAD8B1] border border-[#3E2E1E]"
              }`}
            >
              #{branch.number} {branch.name}
            </span>
            <span className="text-[9px] text-[#A89882] font-serif truncate max-w-[80px]">
              {branch.lunarMonth}
            </span>
          </div>

          {/* Tử Vi House Badge */}
          <div
            className={`w-full py-0.5 px-1 rounded-md text-[10px] sm:text-[11px] font-serif font-bold uppercase mb-1.5 truncate border ${
              isMenh
                ? "bg-[#C9A55A]/25 text-[#E6D3A3] border-[#C9A55A] shadow-xs"
                : "bg-[#1E1710] text-[#E0D1B8] border-[#382A1B]"
            }`}
          >
            {isMenh && <span className="mr-1">★</span>}
            {house.name}
          </div>

          {/* SpreadCardSlot with 3D flip and companion card support */}
          <div className="relative my-0.5 w-full flex justify-center">
            <SpreadCardSlot
              position={{
                id: branch.id,
                name: `Cung ${house.name} • Chi ${branch.name}`,
                description: `Chi #${branch.number} • ${branch.lunarMonth} • Phương ${branch.direction}`,
              }}
              slotKey={slotKey}
              card={card}
              cardImage={cardImages[card.number]}
              cardVideo={cardVideos[card.number]}
              isSelected={isSelected}
              onSelect={() => onSelectCard && onSelectCard(cardIdx)}
              onImageUpdated={onImageUpdated}
              onVideoUpdated={onVideoUpdated}
              interactive={interactive}
              hideTitle={true}
              size={getCardSize("xs")}
            />
          </div>

          {/* Footer Card Name & Direction */}
          <div className="w-full mt-1 pt-1 border-t border-[#291F15] text-[9px] sm:text-[10px]">
            <div className="font-serif font-bold text-[#F3E7CF] truncate">
              Quẻ #{card.number} {card.name}
            </div>
            <div className="text-[#8C7D6A] text-[9px] truncate">
              {branch.direction}
            </div>
          </div>
        </div>
      );
    };

    return (
      <SpreadContext.Provider value={spreadContextValue}>
        <div className="bg-[#15120E] border border-[#3D3121] rounded-2xl p-3 sm:p-5 md:p-6 shadow-2xl space-y-6">
          {renderSpreadTopHeader(
            "TRẬN PHÁP 12 ĐỊA CHI & 12 CUNG TỬ VI (12 LÁ BÀI)",
            <>
              Bàn Tử Vi chu vi 4 lá ngang x 4 lá dọc (Dần là Tháng Giêng, Mão Tháng 2...). La Bàn Thiên Địa định vị <strong>Mệnh Cung tại Chi #{activeMenh} ({menhBranchInfo.name})</strong> • Lia chuột vào bất kỳ lá bài nào để cầm lá bài lên lại gần.
            </>,
            <>
              {/* View Switcher: Bàn Tử Vi vs Danh Sách 12 Cung */}
              <div className="no-capture flex items-center gap-1 bg-[#201811] p-1 rounded-xl border border-[#3A2D1F]">
                <button
                  type="button"
                  onClick={() => setTwelveBranchesView("grid")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-serif font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    twelveBranchesView === "grid"
                      ? "bg-[#C9A55A] text-black shadow"
                      : "text-[#C4B49D] hover:text-white"
                  }`}
                >
                  <Grid3X3 className="w-3.5 h-3.5" />
                  <span>Bàn Tử Vi 4x4</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTwelveBranchesView("list")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-serif font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    twelveBranchesView === "list"
                      ? "bg-[#C9A55A] text-black shadow"
                      : "text-[#C4B49D] hover:text-white"
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Chi Tiết 12 Cung</span>
                </button>
              </div>

              {/* Direction Switcher: Thuận vs Nghịch */}
              <button
                type="button"
                onClick={() => setIsReverseHouses(!isReverseHouses)}
                className={`no-capture px-2.5 py-1.5 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer flex items-center gap-1.5 border shadow ${
                  isReverseHouses
                    ? "bg-[#2D1B13] text-[#FFA07A] border-[#653620] hover:bg-[#382319]"
                    : "bg-[#201811] text-[#E6D3A3] border-[#4A3824] hover:bg-[#2C2116]"
                }`}
                title="Bấm để đảo chiều xoay 12 Cung Tử Vi (Thuận hành Dần-Mão vs Nghịch hành Dần-Sửu)"
              >
                <RotateCw className={`w-3.5 h-3.5 transition-transform duration-300 ${isReverseHouses ? "rotate-180 text-[#FFA07A]" : "text-[#C9A55A]"}`} />
                <span>{isReverseHouses ? "Xoay Nghịch" : "Xoay Thuận"}</span>
              </button>
            </>,
            "12 Quẻ Địa Chi"
          )}

          {/* MAIN SPREAD VIEW */}
          {twelveBranchesView === "grid" ? (
            <div
              ref={targetCardsRef}
              className="max-w-5xl mx-auto p-2 sm:p-4 bg-[#14100C] rounded-2xl border border-[#352719] shadow-2xl"
            >
              {/* 4x4 Grid Container */}
              <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4 items-stretch">
                {/* ROW 1: Tị (6), Ngọ (7), Mùi (8), Thân (9) */}
                {renderBranchSlot(6)}
                {renderBranchSlot(7)}
                {renderBranchSlot(8)}
                {renderBranchSlot(9)}

                {/* ROW 2: Thìn (5) on Col 1 | CENTER 2x2 "Thiên Bàn" on Col 2-3 | Dậu (10) on Col 4 */}
                {renderBranchSlot(5)}

                {/* CENTER "THIÊN BÀN" (Cols 2-3, Rows 2-3) */}
                <div className="col-span-2 row-span-2 bg-gradient-to-b from-[#1C150E] via-[#16100A] to-[#120D08] border-2 border-[#4C3822] rounded-2xl p-3 sm:p-5 flex flex-col items-center justify-center text-center relative shadow-inner overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#C9A55A]/10 via-transparent to-transparent pointer-events-none" />

                  {/* Celestial Centerpiece */}
                  <div className="relative z-10 flex flex-col items-center justify-center space-y-2.5 max-w-sm w-full">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-[#2D2115] to-[#140F0A] border-2 border-[#C9A55A]/70 shadow-[0_0_18px_rgba(212,175,55,0.25)] flex items-center justify-center relative">
                      <Compass className="w-6 h-6 sm:w-7 sm:h-7 text-[#E6D3A3]" />
                      <span className="absolute -bottom-1 px-1.5 py-0.2 bg-[#382816] border border-[#C9A55A]/60 rounded-full text-[9px] font-mono text-[#E6D3A3] font-bold">
                        CHI {menhBranchInfo.number}
                      </span>
                    </div>

                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-[#A89882] font-serif">
                        Trận Pháp 12 Địa Chi
                      </div>
                      <h4 className="text-sm sm:text-base font-serif font-bold text-[#F5EAD4] tracking-wide">
                        THIÊN BÀN TỬ VI
                      </h4>
                    </div>

                    {/* Mệnh Cung Info Badge */}
                    <div className="bg-[#241A11] border border-[#523C26] rounded-xl px-3 py-2 w-full shadow-md">
                      <div className="text-xs sm:text-sm font-serif font-bold text-[#E6D3A3] flex items-center justify-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#C9A55A]" />
                        <span>Mệnh Cung an tại: <strong>Chi {menhBranchInfo.name}</strong></span>
                      </div>
                      <div className="text-[11px] text-[#C4B49D] mt-0.5 flex items-center justify-center gap-2">
                        <span>{menhBranchInfo.lunarMonth}</span>
                        <span>•</span>
                        <span>Phương {menhBranchInfo.direction}</span>
                      </div>
                    </div>

                    {/* Quẻ Chủ Mệnh */}
                    <div className="text-[11px] font-serif text-[#D6C7B2] bg-[#1A130C] px-3 py-1.5 rounded-lg border border-[#3A2B1C] w-full">
                      Quẻ Chủ Mệnh: <strong className="text-[#E6D3A3]">#{menhCard.number} {menhCard.name}</strong> ({menhCard.vietnameseName})
                    </div>

                    {/* Rotation Direction Switcher */}
                    <button
                      type="button"
                      onClick={() => setIsReverseHouses(!isReverseHouses)}
                      className="inline-flex items-center gap-1.5 text-[11px] font-serif text-[#C9A55A] hover:text-white bg-[#261B12] hover:bg-[#342518] px-3 py-1.5 rounded-full border border-[#4C3723] transition-colors cursor-pointer shadow"
                      title="Bấm để chuyển đổi chiều an 12 Cung"
                    >
                      <RotateCw className={`w-3.5 h-3.5 transition-transform duration-300 ${isReverseHouses ? "rotate-180 text-[#FFA07A]" : "text-[#C9A55A]"}`} />
                      <span>An 12 Cung: <strong>{isReverseHouses ? "Nghịch (Dần ➔ Sửu)" : "Thuận (Dần ➔ Mão)"}</strong></span>
                    </button>
                  </div>
                </div>

                {renderBranchSlot(10)}

                {/* ROW 3: Mão (4) on Col 1 | (Center continues) | Tuất (11) on Col 4 */}
                {renderBranchSlot(4)}
                {renderBranchSlot(11)}

                {/* ROW 4: Dần (3), Sửu (2), Tý (1), Hợi (12) */}
                {renderBranchSlot(3)}
                {renderBranchSlot(2)}
                {renderBranchSlot(1)}
                {renderBranchSlot(12)}
              </div>
            </div>
          ) : (
            /* LIST VIEW: 12 Cung Tử Vi từ Cung Mệnh */
            <div className="space-y-4 max-w-5xl mx-auto">
              <div className="p-3 bg-[#1B1611] rounded-xl border border-[#3E301F] text-xs text-[#C4B49D] flex items-center justify-between flex-wrap gap-2">
                <div>
                  <span className="font-serif font-bold text-[#C9A55A]">
                    ✦ An Vị 12 Cung Tử Vi (Mệnh Cung an tại Chi {menhBranchInfo.name} - Số {activeMenh}):
                  </span>
                  <p className="text-[11px] text-[#A89882] mt-0.5">
                    12 Cung luân chuyển {isReverseHouses ? "nghịch chiều (Dần ➔ Sửu ➔ Tý...)" : "thuận chiều (Dần ➔ Mão ➔ Thìn...)"} từ Cung Mệnh: Mệnh ➔ Phụ Mẫu ➔ Phúc Đức ➔ Điền Trạch ➔ Quan Lộc ➔ Nô Bộc ➔ Thiên Di ➔ Tật Ách ➔ Tài Bạch ➔ Tử Tức ➔ Phu Thê ➔ Huynh Đệ.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-2.5 py-1 rounded-lg bg-[#221A12] text-[#E6D3A3] border border-[#483725] font-serif text-[11px]">
                    Mệnh Cung: <strong>Chi {menhBranchInfo.name}</strong> (#{activeMenh})
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsReverseHouses(!isReverseHouses)}
                    className="flex items-center gap-1 text-[11px] font-serif font-bold px-2.5 py-1 rounded-lg bg-[#241A12] hover:bg-[#322318] text-[#E6D3A3] border border-[#4E3924] transition-colors cursor-pointer"
                  >
                    <RotateCw className={`w-3 h-3 transition-transform duration-300 ${isReverseHouses ? "rotate-180 text-[#FFA07A]" : "text-[#C9A55A]"}`} />
                    <span>{isReverseHouses ? "Đảo sang Thuận" : "Đảo sang Nghịch"}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {TWELVE_HOUSES_INFO.map((house, offset) => {
                  const branchNum = isReverseHouses
                    ? ((activeMenh - 1 - offset + 120) % 12) + 1
                    : ((activeMenh - 1 + offset) % 12) + 1;
                  const branch = TWELVE_BRANCHES_DATA.find((b) => b.number === branchNum)!;
                  const cardIdx = branch.number - 1;
                  const card = cards[cardIdx];
                  const isMenh = offset === 0;
                  const isSelected = selectedCardIndex === cardIdx;

                  return (
                    <div
                      key={branch.id}
                      onClick={() => onSelectCard && onSelectCard(cardIdx)}
                      onMouseEnter={() => {
                        if (onHoverCard && card) {
                          onHoverCard({
                            card,
                            positionTitle: `Cung ${house.name} • Chi ${branch.name}`,
                            positionSubtitle: house.description,
                          });
                        }
                      }}
                      onMouseLeave={() => {
                        if (onLeaveCard) onLeaveCard();
                      }}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isMenh
                          ? "bg-gradient-to-r from-[#2F2113] to-[#1E160F] border-[#E6D3A3] shadow-md ring-1 ring-[#C9A55A]"
                          : isSelected && effectiveSelectionHighlight
                          ? "bg-[#251D14] border-[#C9A55A]"
                          : "bg-[#16120E] border-[#2D2216] hover:border-[#4B3B28] hover:bg-[#1D1712]"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1.5 mb-2 pb-1.5 border-b border-[#291F15]">
                          <span className="text-xs font-serif font-bold text-[#F3E7CF] flex items-center gap-1.5">
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                                isMenh ? "bg-[#C9A55A] text-black" : "bg-[#2A1F14] text-[#C9A55A]"
                              }`}
                            >
                              {offset + 1}
                            </span>
                            <span>{house.name}</span>
                          </span>
                          <span className="text-[10px] text-[#A89882] font-mono bg-[#221810] px-1.5 py-0.5 rounded border border-[#39291A]">
                            Chi {branch.name} ({branch.lunarMonth})
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="shrink-0">
                            <SpreadCardSlot
                              position={{
                                id: branch.id,
                                name: `Cung ${house.name} • Chi ${branch.name}`,
                                description: house.description,
                              }}
                              slotKey={`branch_${branch.number}`}
                              card={card}
                              cardImage={cardImages[card.number]}
                              cardVideo={cardVideos[card.number]}
                              isSelected={isSelected}
                              onSelect={() => onSelectCard && onSelectCard(cardIdx)}
                              onImageUpdated={onImageUpdated}
                              onVideoUpdated={onVideoUpdated}
                              interactive={interactive}
                              hideTitle={true}
                              size={getCardSize("xs")}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-serif font-bold text-[#E6D3A3] truncate">
                              Quẻ #{card.number}: {card.name}
                            </div>
                            <div className="text-[11px] text-[#C9A55A] mt-0.5">
                              {card.vietnameseName}
                            </div>
                            <p className="text-[10px] text-[#A89882] mt-1 line-clamp-2 leading-tight">
                              {house.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-[#261C12] flex items-center justify-between text-[10px]">
                        <span className="text-[#8C7D6A] italic">
                          {branch.direction} • {branch.element}
                        </span>
                        <span className="text-[#C9A55A] font-serif font-bold">
                          {isSelected ? "Đang xem ✦" : "Xem chi tiết →"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PALACE EXPLANATION ACCORDION/GRID AT BOTTOM */}
          <div className="pt-4 border-t border-[#2C2317]">
            <h4 className="text-xs sm:text-sm font-serif font-bold text-[#EAD8B1] uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C9A55A]" />
              Ý Nghĩa 12 Cung Tử Vi & 12 Địa Chi Trong Trận Pháp
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {TWELVE_HOUSES_INFO.map((house, idx) => {
                const branchNum = ((activeMenh - 1 + idx) % 12) + 1;
                const branch = TWELVE_BRANCHES_DATA.find((b) => b.number === branchNum)!;
                const cardIdx = branch.number - 1;
                const card = cards[cardIdx];
                const isSelected = selectedCardIndex === cardIdx;
                const isMenh = idx === 0;

                return (
                  <div
                    key={house.name}
                    onClick={() => onSelectCard && onSelectCard(cardIdx)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isMenh
                        ? "bg-[#281C10] border-[#C9A55A] shadow-sm"
                        : isSelected
                        ? "bg-[#221A12] border-[#C9A55A]"
                        : "bg-[#15110E] border-[#2A2016] hover:border-[#423222]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-serif font-bold text-[#EAD8B1] truncate">
                          {house.name}
                        </span>
                        <span className="text-[10px] text-[#A89882] font-mono shrink-0">
                          {branch.name}
                        </span>
                      </div>
                      <div className="text-[11px] font-medium text-[#E6D3A3] mb-1 truncate">
                        Quẻ #{card.number}: {card.name}
                      </div>
                      <p className="text-[10px] text-[#8C7D6A] leading-tight line-clamp-2">
                        {house.description}
                      </p>
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-[#231A11] flex items-center justify-between text-[9px] text-[#716353]">
                      <span>{branch.lunarMonth}</span>
                      <span className="text-[#C9A55A]">{isSelected ? "Đang chọn" : "Nhấp xem"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {renderHoverModal()}
        {renderExportModal()}
      </SpreadContext.Provider>
    );
  }

  if (
    (spreadType === "ten_stars" || spreadType === "ten_stars_expanded") &&
    cards.length >= 10
  ) {
    const isExpanded = spreadType === "ten_stars_expanded" || cards.length >= 11;
    const positions = isExpanded ? TEN_STARS_EXPANDED_POSITIONS : TEN_STARS_POSITIONS;

    return (
      <SpreadContext.Provider value={spreadContextValue}>
        <div
          className="bg-[#15120E] border border-[#3D3121] rounded-2xl p-3 sm:p-5 md:p-6 shadow-2xl"
        >
          {/* Header using renderSpreadTopHeader */}
          {renderSpreadTopHeader(
            isExpanded
              ? "TRẬN PHÁP THẬP TINH MỞ RỘNG (11 LÁ • QUẺ 2 GỒM 2A & 2B)"
              : "TRẬN PHÁP THẬP TINH (10 LÁ BÀI DỊCH HỌC)",
            isExpanded
              ? "Bố cục Thập Tinh Mở Rộng: Đỉnh trên cùng là Lá Khuyên Bảo (Lá 10) • 9 vị trí bên dưới xếp lưới 3x3 với Quẻ thứ 2 (gồm 2A và 2B) ở chính tâm"
              : "Bố cục Thập Tinh: Đỉnh trên cùng là Lá Khuyên Bảo (Lá 10) • 9 lá bên dưới xếp lưới 3x3 với Lá 2 ở chính tâm",
            <div className="flex items-center gap-2 flex-wrap">
              {/* View Mode Switcher */}
              <div className="flex items-center bg-[#1E1812] rounded-lg p-0.5 border border-[#3A2E1F]">
                <button
                  type="button"
                  onClick={() => setTenStarView("cross")}
                  className={`px-2.5 py-1 text-xs font-serif rounded transition-all cursor-pointer ${
                    tenStarView === "cross"
                      ? "bg-[#C9A55A] text-black font-bold shadow"
                      : "text-[#C4B49D] hover:text-[#F3E7CF]"
                  }`}
                >
                  ☸ Trận Đồ ({isExpanded ? "Đỉnh + 2A/2B" : "1 Đỉnh + 3x3"})
                </button>
                <button
                  type="button"
                  onClick={() => setTenStarView("grid")}
                  className={`px-2.5 py-1 text-xs font-serif rounded transition-all cursor-pointer ${
                    tenStarView === "grid"
                      ? "bg-[#C9A55A] text-black font-bold shadow"
                      : "text-[#C4B49D] hover:text-[#F3E7CF]"
                  }`}
                >
                  ⊞ Tuần Tự ({isExpanded ? "11 Lá" : "10 Lá"})
                </button>
              </div>

              {/* Orientation Badges */}
              {isExpanded ? (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Lá 2A Badge */}
                  <div
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-serif font-bold border transition-all ${
                      isCard2AReversed
                        ? "bg-red-950/80 text-red-300 border-red-700/80"
                        : "bg-emerald-950/80 text-emerald-300 border-emerald-700/80"
                    }`}
                  >
                    <span>2A: {isCard2AReversed ? "NGHỊCH" : "THUẬN"}</span>
                    {onToggleCard2AReversed && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleCard2AReversed();
                        }}
                        className="text-[10px] underline hover:text-white cursor-pointer ml-0.5"
                      >
                        [Đổi]
                      </button>
                    )}
                  </div>

                  {/* Lá 2B Badge */}
                  <div
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-serif font-bold border transition-all ${
                      isCard2BReversed
                        ? "bg-red-950/80 text-red-300 border-red-700/80"
                        : "bg-emerald-950/80 text-emerald-300 border-emerald-700/80"
                    }`}
                  >
                    <span>2B: {isCard2BReversed ? "NGHỊCH" : "THUẬN"}</span>
                    {onToggleCard2BReversed && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleCard2BReversed();
                        }}
                        className="text-[10px] underline hover:text-white cursor-pointer ml-0.5"
                      >
                        [Đổi]
                      </button>
                    )}
                  </div>

                  {/* Combo indicator */}
                  <span className="text-[10px] font-mono font-bold text-[#F3D389] bg-[#221A12] px-2 py-0.5 rounded-full border border-[#423220]">
                    {!isCard2AReversed && !isCard2BReversed && "✦ Cùng Thuận"}
                    {isCard2AReversed && isCard2BReversed && "⚠ Cùng Nghịch"}
                    {!isCard2AReversed && isCard2BReversed && "⚖ Thuận - Nghịch"}
                    {isCard2AReversed && !isCard2BReversed && "❖ Nghịch - Thuận"}
                  </span>
                </div>
              ) : (
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-serif font-bold border transition-all ${
                    isCard2Reversed
                      ? "bg-red-950/80 text-red-300 border-red-700/80 shadow-[0_0_12px_rgba(239,68,68,0.2)]"
                      : "bg-amber-950/80 text-amber-300 border-amber-600/80 shadow-[0_0_12px_rgba(217,119,6,0.2)]"
                  }`}
                >
                  <span>{isCard2Reversed ? "⚠ Lá 2: NGHỊCH" : "✓ Lá 2: THUẬN"}</span>
                  {onToggleCard2Reversed && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleCard2Reversed();
                      }}
                      title="Bấm để đổi Thuận ⇄ Nghịch để chiêm nghiệm thế đối nghịch"
                      className="ml-1 text-[10px] underline hover:text-white cursor-pointer opacity-90 hover:opacity-100"
                    >
                      [Đổi]
                    </button>
                  )}
                </div>
              )}
            </div>,
            isExpanded ? "11 Quẻ Thập Tinh" : "10 Quẻ Thập Tinh"
          )}

        {/* 10-Star / 11-Star Layout: CHÍNH XÁC KHU VỰC CÁC LÁ BÀI ĐƯỢC CHỤP */}
        <div ref={targetCardsRef} className="w-full bg-[#15120E] py-2 px-1 sm:px-3 rounded-xl">
          {tenStarView === "cross" ? (
            <div className="w-full max-w-3xl mx-auto flex flex-col items-center gap-3 sm:gap-4 py-2">
              {/* ============================================================== */}
              {/* PHẦN 1: ĐỈNH TRẬN PHÁP - 1 LÁ Ở CHÍNH GIỮA: LÁ KHUYÊN BẢO      */}
              {/* ============================================================== */}
              <div className="w-full flex flex-col items-center">
                <div className="text-center mb-1.5">
                  <span className="text-[10px] sm:text-[11px] font-mono font-bold text-[#F5D061] uppercase tracking-wider bg-[#261E14] px-3 py-0.5 rounded-full border border-[#4A3A25] inline-flex items-center gap-1.5 shadow">
                    <Sparkles className="w-3 h-3 text-[#F5D061]" />
                    Đỉnh Trận Pháp: Lời Khuyên Bảo
                  </span>
                </div>
                <div className="flex justify-center">
                  <SpreadCardSlot
                    position={isExpanded ? TEN_STARS_EXPANDED_POSITIONS[10] : TEN_STARS_POSITIONS[9]}
                    card={isExpanded ? cards[10] : cards[9]}
                    cardImage={cardImages[(isExpanded ? cards[10] : cards[9])?.number]}
                    isSelected={selectedCardIndex === (isExpanded ? 10 : 9)}
                    onSelect={() => onSelectCard && onSelectCard(isExpanded ? 10 : 9)}
                    onImageUpdated={onImageUpdated}
                    interactive={interactive}
                    size={getCardSize("sm")}
                  />
                </div>
              </div>

              {/* Vạch chia nhẹ nối từ lá khuyên bảo xuống 9 vị trí còn lại */}
              <div className="w-24 sm:w-36 h-px bg-gradient-to-r from-transparent via-[#5A452C] to-transparent" />

              {/* ============================================================== */}
              {/* PHẦN 2: LƯỚI 3x3 GỒM CÁC VỊ TRÍ CÒN LẠI (VỊ TRÍ 2 Ở CHÍNH TÂM) */}
              {/* ============================================================== */}
              <div className="w-full bg-[#17130F]/80 p-2 sm:p-4 rounded-2xl border border-[#34291B] shadow-xl">
                {/* Hàng 1 (3 ô): Trước Đây | Tiềm Thức | Vận Hạn */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 justify-items-center items-start mb-3 sm:mb-5">
                  <SpreadCardSlot
                    position={isExpanded ? TEN_STARS_EXPANDED_POSITIONS[5] : TEN_STARS_POSITIONS[4]}
                    card={isExpanded ? cards[5] : cards[4]}
                    cardImage={cardImages[(isExpanded ? cards[5] : cards[4])?.number]}
                    isSelected={selectedCardIndex === (isExpanded ? 5 : 4)}
                    onSelect={() => onSelectCard && onSelectCard(isExpanded ? 5 : 4)}
                    onImageUpdated={onImageUpdated}
                    interactive={interactive}
                    size={getCardSize("xs")}
                  />
                  <SpreadCardSlot
                    position={isExpanded ? TEN_STARS_EXPANDED_POSITIONS[4] : TEN_STARS_POSITIONS[3]}
                    card={isExpanded ? cards[4] : cards[3]}
                    cardImage={cardImages[(isExpanded ? cards[4] : cards[3])?.number]}
                    isSelected={selectedCardIndex === (isExpanded ? 4 : 3)}
                    onSelect={() => onSelectCard && onSelectCard(isExpanded ? 4 : 3)}
                    onImageUpdated={onImageUpdated}
                    interactive={interactive}
                    size={getCardSize("xs")}
                  />
                  <SpreadCardSlot
                    position={isExpanded ? TEN_STARS_EXPANDED_POSITIONS[7] : TEN_STARS_POSITIONS[6]}
                    card={isExpanded ? cards[7] : cards[6]}
                    cardImage={cardImages[(isExpanded ? cards[7] : cards[6])?.number]}
                    isSelected={selectedCardIndex === (isExpanded ? 7 : 6)}
                    onSelect={() => onSelectCard && onSelectCard(isExpanded ? 7 : 6)}
                    onImageUpdated={onImageUpdated}
                    interactive={interactive}
                    size={getCardSize("xs")}
                  />
                </div>

                {/* Hàng 2 (3 ô): Hiện Tại | VỊ TRÍ 2 Ở CHÍNH GIỮA | Tương Lai */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 justify-items-center items-start mb-3 sm:mb-5">
                  <SpreadCardSlot
                    position={isExpanded ? TEN_STARS_EXPANDED_POSITIONS[0] : TEN_STARS_POSITIONS[0]}
                    card={cards[0]}
                    cardImage={cardImages[cards[0]?.number]}
                    isSelected={selectedCardIndex === 0}
                    onSelect={() => onSelectCard && onSelectCard(0)}
                    onImageUpdated={onImageUpdated}
                    interactive={interactive}
                    size={getCardSize("xs")}
                  />

                  {/* Vị trí 2 ở CHÍNH TÂM */}
                  {isExpanded ? (
                    <div className="flex flex-col items-center relative w-full bg-[#18130E] p-1.5 sm:p-2 rounded-xl border border-[#443322] shadow-inner">
                      <div className="text-center mb-1">
                        <span className="text-[9px] sm:text-[10px] font-mono font-bold text-[#F3D389] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#2A1F14] border border-[#4E3922] inline-block">
                          Quẻ 2: Hỗ Trợ / Trở Ngại (2A & 2B)
                        </span>
                      </div>
                      <div className="flex items-center justify-center gap-1 sm:gap-2 w-full">
                        {/* Lá 2A */}
                        <div className="flex flex-col items-center">
                          <SpreadCardSlot
                            position={TEN_STARS_EXPANDED_POSITIONS[1]}
                            card={cards[1]}
                            cardImage={cardImages[cards[1]?.number]}
                            isSelected={selectedCardIndex === 1}
                            onSelect={() => onSelectCard && onSelectCard(1)}
                            onImageUpdated={onImageUpdated}
                            interactive={interactive}
                            isReversed={isCard2AReversed}
                            customTitle={isCard2AReversed ? "2A. Trở Ngại (Ngược)" : "2A. Hỗ Trợ (Xuôi)"}
                            size={getCardSize("xs")}
                          />
                          {onToggleCard2AReversed && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleCard2AReversed();
                              }}
                              className="mt-1 text-[9px] text-[#C9A55A] hover:underline cursor-pointer"
                            >
                              [Đổi 2A]
                            </button>
                          )}
                        </div>

                        {/* Lá 2B */}
                        <div className="flex flex-col items-center">
                          <SpreadCardSlot
                            position={TEN_STARS_EXPANDED_POSITIONS[2]}
                            card={cards[2]}
                            cardImage={cardImages[cards[2]?.number]}
                            isSelected={selectedCardIndex === 2}
                            onSelect={() => onSelectCard && onSelectCard(2)}
                            onImageUpdated={onImageUpdated}
                            interactive={interactive}
                            isReversed={isCard2BReversed}
                            customTitle={isCard2BReversed ? "2B. Trở Ngại (Ngược)" : "2B. Hỗ Trợ (Xuôi)"}
                            size={getCardSize("xs")}
                          />
                          {onToggleCard2BReversed && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleCard2BReversed();
                              }}
                              className="mt-1 text-[9px] text-[#C9A55A] hover:underline cursor-pointer"
                            >
                              [Đổi 2B]
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="mt-1 text-center">
                        <span className="text-[9px] font-mono text-[#CBB597]">
                          {!isCard2AReversed && !isCard2BReversed && "Thế: Cùng Thuận (Trợ Lực)"}
                          {isCard2AReversed && isCard2BReversed && "Thế: Cùng Nghịch (Cản Trở)"}
                          {!isCard2AReversed && isCard2BReversed && "Thế: Thuận - Nghịch (Đan Xen)"}
                          {isCard2AReversed && !isCard2BReversed && "Thế: Nghịch - Thuận (Vượt Khó)"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center relative w-full">
                      <SpreadCardSlot
                        position={TEN_STARS_POSITIONS[1]}
                        card={cards[1]}
                        cardImage={cardImages[cards[1]?.number]}
                        isSelected={selectedCardIndex === 1}
                        onSelect={() => onSelectCard && onSelectCard(1)}
                        onImageUpdated={onImageUpdated}
                        interactive={interactive}
                        isReversed={isCard2Reversed}
                        customTitle={isCard2Reversed ? "2. Trở Ngại (Ngược)" : "2. Hỗ Trợ (Xuôi)"}
                        size={getCardSize("xs")}
                      />
                    </div>
                  )}

                  <SpreadCardSlot
                    position={isExpanded ? TEN_STARS_EXPANDED_POSITIONS[6] : TEN_STARS_POSITIONS[5]}
                    card={isExpanded ? cards[6] : cards[5]}
                    cardImage={cardImages[(isExpanded ? cards[6] : cards[5])?.number]}
                    isSelected={selectedCardIndex === (isExpanded ? 6 : 5)}
                    onSelect={() => onSelectCard && onSelectCard(isExpanded ? 6 : 5)}
                    onImageUpdated={onImageUpdated}
                    interactive={interactive}
                    size={getCardSize("xs")}
                  />
                </div>

                {/* Hàng 3 (3 ô): Bên Ngoài | Kết Quả Cuối Cùng | Người Ngoài */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 justify-items-center items-start">
                  <SpreadCardSlot
                    position={isExpanded ? TEN_STARS_EXPANDED_POSITIONS[3] : TEN_STARS_POSITIONS[2]}
                    card={isExpanded ? cards[3] : cards[2]}
                    cardImage={cardImages[(isExpanded ? cards[3] : cards[2])?.number]}
                    isSelected={selectedCardIndex === (isExpanded ? 3 : 2)}
                    onSelect={() => onSelectCard && onSelectCard(isExpanded ? 3 : 2)}
                    onImageUpdated={onImageUpdated}
                    interactive={interactive}
                    size={getCardSize("xs")}
                  />
                  <SpreadCardSlot
                    position={isExpanded ? TEN_STARS_EXPANDED_POSITIONS[9] : TEN_STARS_POSITIONS[8]}
                    card={isExpanded ? cards[9] : cards[8]}
                    cardImage={cardImages[(isExpanded ? cards[9] : cards[8])?.number]}
                    isSelected={selectedCardIndex === (isExpanded ? 9 : 8)}
                    onSelect={() => onSelectCard && onSelectCard(isExpanded ? 9 : 8)}
                    onImageUpdated={onImageUpdated}
                    interactive={interactive}
                    size={getCardSize("xs")}
                  />
                  <SpreadCardSlot
                    position={isExpanded ? TEN_STARS_EXPANDED_POSITIONS[8] : TEN_STARS_POSITIONS[7]}
                    card={isExpanded ? cards[8] : cards[7]}
                    cardImage={cardImages[(isExpanded ? cards[8] : cards[7])?.number]}
                    isSelected={selectedCardIndex === (isExpanded ? 8 : 7)}
                    onSelect={() => onSelectCard && onSelectCard(isExpanded ? 8 : 7)}
                    onImageUpdated={onImageUpdated}
                    interactive={interactive}
                    size={getCardSize("xs")}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* View Mode 2: Toàn Cảnh Tuần Tự (Từ Lá 1 đến Hết) */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 py-2 max-w-4xl mx-auto">
              {positions.map((pos, idx) => {
                const is2A = isExpanded && idx === 1;
                const is2B = isExpanded && idx === 2;
                const isStandard2 = !isExpanded && idx === 1;

                const cardReversed = is2A
                  ? isCard2AReversed
                  : is2B
                  ? isCard2BReversed
                  : isStandard2
                  ? isCard2Reversed
                  : undefined;

                const cardTitle = is2A
                  ? isCard2AReversed
                    ? "2A. Trở Ngại (Ngược)"
                    : "2A. Hỗ Trợ (Xuôi)"
                  : is2B
                  ? isCard2BReversed
                    ? "2B. Trở Ngại (Ngược)"
                    : "2B. Hỗ Trợ (Xuôi)"
                  : isStandard2
                  ? isCard2Reversed
                    ? "2. Trở Ngại (Ngược)"
                    : "2. Hỗ Trợ (Xuôi)"
                  : undefined;

                return (
                  <div
                    key={pos.id}
                    className="flex flex-col items-center bg-[#17130F] p-1.5 sm:p-2 rounded-xl border border-[#2B2116]"
                  >
                    <SpreadCardSlot
                      position={pos}
                      card={cards[idx]}
                      cardImage={cardImages[cards[idx]?.number]}
                      isSelected={selectedCardIndex === idx}
                      onSelect={() => onSelectCard && onSelectCard(idx)}
                      onImageUpdated={onImageUpdated}
                      interactive={interactive}
                      isReversed={cardReversed}
                      customTitle={cardTitle}
                      size={getCardSize("xs")}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Legend / Guide at bottom of diagram */}
        <div className="mt-3 pt-3 border-t border-[#2C2317] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#A69780] font-serif gap-2">
          <span>
            {isExpanded ? (
              <>
                ✦ <strong>Bố cục Thập Tinh Mở Rộng:</strong> Lá 10 (Khuyên Bảo) trên cùng ở giữa • Quẻ thứ 2 gồm 2 lá 2A & 2B ở chính giữa tâm điểm • 8 lá còn lại bao quanh.
              </>
            ) : (
              <>
                ✦ <strong>Bố cục Thập Tinh:</strong> Lá 10 (Khuyên Bảo) trên cùng ở giữa • 9 lá xếp dạng lưới 3x3 với Lá 2 ở chính giữa tâm điểm.
              </>
            )}
          </span>
          <span className="text-[#C9A55A]">
            {isExpanded ? (
              <>
                Quẻ 2: 2A ({isCard2AReversed ? "Nghịch" : "Thuận"}) & 2B ({isCard2BReversed ? "Nghịch" : "Thuận"}) →{" "}
                <strong>
                  {!isCard2AReversed && !isCard2BReversed && "Cùng Thuận (Đại Cát)"}
                  {isCard2AReversed && isCard2BReversed && "Cùng Nghịch (Trở Ngại Kép)"}
                  {!isCard2AReversed && isCard2BReversed && "Thuận - Nghịch (Đan Xen)"}
                  {isCard2AReversed && !isCard2BReversed && "Nghịch - Thuận (Vượt Khó)"}
                </strong>
              </>
            ) : (
              <>
                Lá 2 đang ở vị thế: <strong>{isCard2Reversed ? "NGƯỢC (Trở Ngại - Thử thách chắn ngang)" : "XUÔI (Hỗ Trợ - Trợ lực tương sinh)"}</strong>
              </>
            )}
          </span>
        </div>
      </div>
      {renderHoverModal()}
      {renderExportModal()}
    </SpreadContext.Provider>
    );
  }

    // Custom Spread Layout (Cho phép số lượng lá bài bất kỳ như 4, 6, 8, 12 lá...)
  if (spreadType === "custom" || (cards && cards.length > 0)) {
    const cardCount = cards.length;
    let gridColsClass = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3";
    if (cardCount <= 1) {
      gridColsClass = "grid grid-cols-1 max-w-xs mx-auto";
    } else if (cardCount === 2) {
      gridColsClass = "grid grid-cols-2 gap-3 sm:gap-4 max-w-xl mx-auto";
    } else if (cardCount === 3) {
      gridColsClass = "grid grid-cols-3 gap-2 sm:gap-3 max-w-3xl mx-auto";
    } else if (cardCount === 4) {
      gridColsClass = "grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto";
    } else if (cardCount === 5) {
      // 5 Lá: Trên màn hình nhỏ/điện thoại: 3 lá ở hàng trên, 2 lá cuối cùng bên phải (lá 4 & 5) nhảy xuống hàng dưới và căn giữa
      // Trên màn hình lớn (md: trở lên): dàn đủ 5 lá thành 1 hàng ngang
      gridColsClass = "grid grid-cols-6 md:grid-cols-5 gap-2.5 sm:gap-3 max-w-5xl mx-auto";
    } else if (cardCount <= 6) {
      gridColsClass = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 max-w-6xl mx-auto";
    } else if (cardCount <= 8) {
      gridColsClass = "grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3";
    } else if (cardCount <= 12) {
      gridColsClass = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3";
    } else {
      gridColsClass = "grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5";
    }

    return (
      <SpreadContext.Provider value={spreadContextValue}>
        <div className="bg-[#15120E] border border-[#3D3121] rounded-2xl p-3 sm:p-5 md:p-6 shadow-2xl">
          {/* Header of Custom Spread */}
          {renderSpreadTopHeader(
            `TRẬN PHÁP TÙY CHỈNH (${cardCount} LÁ BÀI DỊCH HỌC)`,
            `Toàn bộ ${cardCount} lá bài được soi chiếu theo từng mục đích thỉnh vấn riêng biệt được ghi rõ bên dưới mỗi lá.`,
            undefined,
            `${cardCount} Lá Tự Chọn`
          )}

          {/* Custom Cards Area */}
          <div
            ref={targetCardsRef}
            className="p-3 sm:p-4 bg-[#14100D] rounded-xl border border-[#2A2117]"
          >
            <div className={gridColsClass}>
              {cards.map((card, idx) => {
                const isSelected = selectedCardIndex === idx;
                const positionPurpose =
                  customPositions?.[idx]?.purpose ||
                  customPositions?.[idx]?.name ||
                  `Lá ${idx + 1}: Mục đích xem số ${idx + 1}`;

                // Định vị cột linh hoạt theo kích thước màn hình
                // Khi 5 lá: trên mobile/màn hình nhỏ (< md), 3 lá đầu chiếm 2/6 cột (đủ hàng 1), 2 lá sau nhảy xuống hàng 2 và căn giữa
                // Trên md trở lên: mỗi lá chiếm 1/5 cột (thành 1 hàng ngang hoàn chỉnh)
                let cardColSpanClass = "";
                if (cardCount === 5) {
                  if (idx === 0 || idx === 1 || idx === 2) {
                    cardColSpanClass = "col-span-2 md:col-span-1";
                  } else if (idx === 3) {
                    cardColSpanClass = "col-start-2 col-span-2 md:col-start-auto md:col-span-1";
                  } else if (idx === 4) {
                    cardColSpanClass = "col-span-2 md:col-span-1";
                  }
                }

                return (
                  <div
                    key={`${card.number}-${idx}`}
                    onClick={() => interactive && onSelectCard && onSelectCard(idx)}
                    onMouseEnter={() => {
                      if (onHoverCard && card) {
                        onHoverCard({
                          card,
                          positionTitle: `Lá #${idx + 1}`,
                          positionSubtitle: card.vietnameseName,
                        });
                      }
                    }}
                    onMouseLeave={() => {
                      if (onLeaveCard) onLeaveCard();
                    }}
                    className={`flex flex-col items-center bg-[#181410] rounded-xl p-2.5 border transition-all ${cardColSpanClass} ${
                      interactive ? "cursor-pointer group" : ""
                    } ${
                      isSelected
                        ? "border-[#C9A55A] ring-2 ring-[#C9A55A]/50 shadow-[0_0_15px_rgba(212,175,55,0.25)] bg-[#1F1913]"
                        : "border-[#2D2318] hover:border-[#4E3C29] hover:bg-[#1A1511]"
                    }`}
                  >
                    {/* Top card index header */}
                    <div className="flex items-center justify-between w-full mb-2 px-1">
                      <span className="text-[10px] font-mono font-bold text-[#C9A55A] bg-[#271E14] px-2 py-0.5 rounded border border-[#443522]">
                        Lá #{idx + 1}
                      </span>
                      {isSelected && (
                        <span className="no-capture w-4 h-4 rounded-full bg-[#C9A55A] text-[#120F0C] text-[9px] font-bold flex items-center justify-center shadow">
                          ✓
                        </span>
                      )}
                    </div>

                    {/* Card Visual Image / Trigram */}
                    <div className="relative my-1">
                      <SpreadCardSlot
                        position={{
                          id: String(idx),
                          name: `Lá #${idx + 1}`,
                          description: card.vietnameseName,
                        }}
                        slotKey={`custom_${idx}`}
                        card={card}
                        cardImage={cardImages[card.number]}
                        cardVideo={cardVideos[card.number]}
                        isSelected={isSelected}
                        onSelect={() => onSelectCard && onSelectCard(idx)}
                        onImageUpdated={onImageUpdated}
                        onVideoUpdated={onVideoUpdated}
                        interactive={interactive}
                        hideTitle={true}
                        size={cardCount === 5 ? (isMobileScreen ? "tiny" : getCardSize("sm")) : cardCount > 8 ? getCardSize("xs") : getCardSize("sm")}
                      />
                    </div>

                  {/* Hexagram Name & Omen */}
                  <div className="w-full text-center mt-2 px-1">
                    <div className="text-xs font-serif font-bold text-[#EAD8B1] truncate">
                      Quẻ #{card.number} {card.name}
                    </div>
                    <div className="text-[10px] text-[#A69780] truncate">
                      {card.vietnameseName}
                    </div>
                  </div>

                  {/* Phần DƯỚI TRẬN PHÁP: Mục đích của lá bài */}
                  <div className="w-full mt-2.5 pt-2 border-t border-[#2C2216] text-left">
                    <div className="text-[9px] uppercase tracking-wider font-mono text-[#C89B3C] font-semibold mb-0.5 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      Mục đích xem:
                    </div>
                    <div
                      className={`text-[11px] font-serif leading-snug rounded p-1.5 border transition-colors ${
                        isSelected
                          ? "bg-[#2A2016] text-[#FFF] border-[#C9A55A]/60 font-semibold"
                          : "bg-[#13100D] text-[#D8C4A0] border-[#2A2016]"
                      }`}
                      title={positionPurpose}
                    >
                      {positionPurpose}
                    </div>
                  </div>

                  {/* Select button for desktop/mobile accessibility */}
                  {interactive && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCard && onSelectCard(idx);
                      }}
                      className={`no-capture mt-2.5 w-full text-[10px] font-bold py-1 px-1.5 rounded-lg border transition-all ${
                        isSelected
                          ? "bg-[#C9A55A] text-[#120F0C] border-[#C9A55A]"
                          : "bg-[#221B14] text-[#A89882] border-[#362B1D] hover:text-[#FFF] hover:bg-[#2C231A]"
                      }`}
                    >
                      {isSelected ? "Đang xem chi tiết" : "Xem luận giải"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer guide */}
        <div className="mt-3 pt-3 border-t border-[#2C2317] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#A69780] font-serif gap-2">
          <span>
            ✦ <strong>Trận pháp tự do:</strong> Bấm vào bất kỳ lá bài nào bên trên để xem chi tiết quẻ ứng với mục đích đã điền.
          </span>
          <span className="text-[#C9A55A]">
            Tổng số: <strong>{cardCount} lá bài</strong>
          </span>
        </div>
      </div>
      {renderHoverModal()}
      {renderExportModal()}
    </SpreadContext.Provider>
    );
  }

  return null;
};

interface SpreadCardSlotProps {
  position: SpreadPositionInfo | { id?: string; name: string; description?: string; index?: number; subtitle?: string };
  card?: Hexagram;
  cardImage?: string;
  cardVideo?: string;
  cardVideos?: Record<number, string>;
  isSelected?: boolean;
  onSelect?: () => void;
  onImageUpdated?: (num: number, url: string) => void;
  onVideoUpdated?: (num: number, url: string) => void;
  interactive?: boolean;
  hideTitle?: boolean;
  isReversed?: boolean;
  customTitle?: string;
  size?: "xs" | "sm" | "md" | "lg" | "tiny" | "xl";
  fitMode?: "contain" | "cover";
  slotKey?: string;
}

const SpreadCardSlot: React.FC<SpreadCardSlotProps> = ({
  position,
  card,
  cardImage: directCardImage,
  cardVideo: directCardVideo,
  cardVideos: directCardVideos,
  isSelected,
  onSelect,
  onImageUpdated: directOnImageUpdated,
  onVideoUpdated: directOnVideoUpdated,
  interactive,
  hideTitle = false,
  isReversed,
  customTitle,
  size = "xs",
  fitMode: directFitMode,
  slotKey: directSlotKey,
}) => {
  if (!card) return null;

  const ctx = React.useContext(SpreadContext);
  const slotKey = directSlotKey || String(position?.id ?? position?.index ?? "slot");
  const companionVal = ctx.companionCards ? ctx.companionCards[slotKey] : undefined;
  const companionList: Hexagram[] = Array.isArray(companionVal)
    ? companionVal
    : companionVal
    ? [companionVal]
    : [];
  const cardImage = directCardImage || ctx.cardImages[card.number];
  const cardVideo =
    directCardVideo ||
    (directCardVideos ? directCardVideos[card.number] : undefined) ||
    ctx.cardVideos[card.number];
  const fitMode = directFitMode || ctx.fitMode;
  const onImageUpdated = directOnImageUpdated || ctx.onImageUpdated;
  const onVideoUpdated = directOnVideoUpdated || ctx.onVideoUpdated;
  const [isFront, setIsFront] = useState<boolean>(ctx.allFlipped ?? false);

  const slotIdx = typeof position.index === "number" ? position.index : 0;
  const effectiveReversed =
    typeof isReversed === "boolean"
      ? isReversed
      : (card.isReversed ?? false) ||
        (ctx.slotRotations && ctx.slotRotations[slotIdx] !== undefined
          ? ctx.slotRotations[slotIdx]
          : (ctx.isAllRotated ?? false));

  useEffect(() => {
    if (typeof ctx.allFlipped === "boolean") {
      setIsFront(ctx.allFlipped);
    }
  }, [ctx.allFlipped, ctx.flipKey]);

  const handleToggleCardFlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (ctx.allowFlipOnClick === false) return;
    setIsFront((prev) => !prev);
    zenAudio.playCardFlipSound();
  };

  const handleSlotClick = () => {
    if (!isFront) {
      // Khi ở mặt sấp: Nếu cho phép xoay mặt sau thì lật mở sang mặt ngửa, nếu tắt xoay mặt sau thì không lật
      if (ctx.allowFlipOnClick !== false) {
        setIsFront(true);
        zenAudio.playCardFlipSound();
      }
      return;
    }
    if (interactive && onSelect) {
      onSelect();
    }
  };

  return (
    <div
      onClick={handleSlotClick}
      onMouseEnter={() => {
        if (ctx.onHoverCard && card) {
          ctx.onHoverCard({
            card,
            positionTitle: customTitle || position.name,
            positionSubtitle: position.description,
            isReversed: effectiveReversed,
          });
        }
      }}
      onMouseLeave={() => {
        if (ctx.onLeaveCard) {
          ctx.onLeaveCard();
        }
      }}
      className={`flex flex-col items-center text-center p-1 sm:p-2 rounded-xl transition-all relative z-10 hover:z-40 w-auto max-w-none min-w-0 ${
        interactive ? "cursor-pointer group" : ""
      } ${
        isSelected && ctx.enableSelectionHighlight !== false
          ? "bg-[#251D14] ring-2 ring-[#C9A55A] shadow-[0_0_15px_rgba(212,175,55,0.3)] scale-102"
          : "hover:bg-[#1C1712]"
      }`}
    >
      {!hideTitle && (
        <div className="text-[10px] sm:text-[11px] font-serif font-bold text-[#EAD8B1] mb-1.5 w-full text-center px-0.5 break-words line-clamp-2 min-h-[2.2em] flex items-center justify-center leading-tight pointer-events-none">
          {customTitle || position.name}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 my-1 w-full">
        {/* Main Card */}
        <div className="relative shrink-0 hover:z-50">
          <FlippableSpiritualCard
            hexagram={card}
            imageUrl={cardImage}
            videoUrl={cardVideo}
            cardBackUrl={ctx.cardBackUrl}
            size={size}
            isReversed={effectiveReversed}
            defaultFlipped={isFront}
            onRotate={() => {
              if (ctx.onToggleSlotRotation) {
                ctx.onToggleSlotRotation(slotIdx);
              }
            }}
            allowFlipOnClick={ctx.allowFlipOnClick}
            onClick={interactive ? handleSlotClick : undefined}
            onVideoUpdated={onVideoUpdated}
            draggable={Boolean(ctx.enableCardDrag)}
            dragKey={ctx.dragResetKey}
            enableHoverZoom={ctx.enableHoverZoom !== false}
          />
          {/* Subtle quick flip button on hover */}
          {ctx.allowFlipOnClick !== false && (
            <button
              type="button"
              onClick={handleToggleCardFlip}
              className="no-capture absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-[#18120C]/90 hover:bg-[#2B2014] border border-[#523E27] hover:border-[#C9A55A] text-[#C9A55A] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow z-20 cursor-pointer"
              title="Lật 3D xem mặt sau Bát Quái ☯ / mặt Quẻ"
            >
              <RotateCw className="w-2.5 h-2.5" />
            </button>
          )}

          {isSelected && ctx.enableSelectionHighlight !== false && (
            <div className="no-capture absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-[#C9A55A] text-[#120F0C] rounded-full text-[8px] sm:text-[9px] font-bold flex items-center justify-center shadow z-20">
              ✓
            </div>
          )}

          {/* Button to draw additional card on the right side of this card & Luận giải */}
          {(ctx.showCompanionButton !== false || ctx.showInterpretButton !== false) && (
            <div className="no-capture absolute -top-2.5 right-0 sm:-right-2 z-20 flex items-center gap-1 flex-wrap justify-end max-w-[140px]">
              {ctx.showCompanionButton !== false && companionList.length === 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    ctx.onDrawCompanionCard?.(slotKey);
                  }}
                  className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-[#241A10] hover:bg-[#C9A55A] text-[#D6B97A] hover:text-[#120F0C] border border-[#583E24] hover:border-[#F2C965] text-[8px] sm:text-[9px] font-mono font-bold shadow-md transition-all cursor-pointer group active:scale-95 whitespace-nowrap"
                  title="Bốc thêm 1 lá kế bên (Lá bổ trợ giải trình)"
                >
                  <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#D6B97A] group-hover:text-[#120F0C] group-hover:rotate-90 transition-transform" />
                  <span>Bốc thêm</span>
                </button>
              )}
              {ctx.showInterpretButton !== false && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (card) ctx.onNavigateToManual?.(card.number);
                  }}
                  className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-[#1C1610] hover:bg-[#C9A55A] text-[#C9A55A] hover:text-[#120F0C] border border-[#523E28] hover:border-[#C9A55A] text-[8px] sm:text-[9px] font-serif font-bold shadow-md transition-all cursor-pointer group active:scale-95 whitespace-nowrap"
                  title={`Xem luận giải Quẻ #${card?.number} ở Thuyết Minh`}
                >
                  <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#C9A55A] group-hover:text-[#120F0C] transition-colors" />
                  <span>Luận giải</span>
                </button>
              )}
            </div>
          )}

          {card?.deckNumber && (
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded bg-[#18120C] border border-[#523E27] text-[#C9A55A] text-[8.5px] font-mono font-bold whitespace-nowrap shadow z-10 pointer-events-none">
              Bộ #{card.deckNumber}
            </div>
          )}
        </div>

        {/* Companion Cards placed next to it ("kế bên") - Supports multiple/recursive */}
        {companionList.map((compCard, compIdx) => {
          const isLast = compIdx === companionList.length - 1;
          const compSize: "tiny" | "xs" | "sm" | "md" | "lg" | "xl" =
            ctx.companionCardSize === "xlarge"
              ? "xl"
              : ctx.companionCardSize === "large"
              ? (size === "tiny" ? "md" : size === "xs" ? "md" : "lg")
              : size; // "same" / mặc định: Bằng 100% kích cỡ lá chính
          return (
            <div
              key={`comp_${compCard.number}_${compIdx}`}
              className={`relative flex flex-col items-center shrink-0 animate-in fade-in zoom-in-95 duration-200 ${isLast ? "pr-8 sm:pr-10" : ""}`}
            >
              <div className="flex items-center justify-between w-full px-1 mb-0.5 gap-1">
                <span className="text-[7.5px] sm:text-[8.5px] font-mono font-bold text-[#D6B97A] bg-[#22170E] px-1 py-0.2 rounded border border-[#483421] truncate max-w-[62px] sm:max-w-none">
                  + Kế Bên {companionList.length > 1 ? `#${compIdx + 1}` : ""} #{compCard.number}
                </span>
                <div className="flex items-center gap-0.5 no-capture">
                  {ctx.showInterpretButton !== false && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        ctx.onNavigateToManual?.(compCard.number);
                      }}
                      className="flex items-center gap-0.5 px-1 py-0.2 rounded-full bg-[#1A140E] hover:bg-[#C9A55A] text-[#C9A55A] hover:text-[#120F0C] border border-[#483421] text-[7.5px] font-serif font-bold transition-colors cursor-pointer"
                      title={`Xem luận giải Quẻ #${compCard.number} ở Thuyết Minh`}
                    >
                      <Eye className="w-2 h-2" />
                      <span>Luận giải</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      ctx.onToggleCompanionCardSize?.();
                    }}
                    className="text-[7.5px] font-mono px-1.5 py-0.5 rounded bg-[#251A10] hover:bg-[#382618] text-[#D6B97A] border border-[#523A22] transition-colors cursor-pointer"
                    title="Bấm đổi cỡ lá bốc thêm (Bằng chính / To rõ / Cực đại)"
                  >
                    {ctx.companionCardSize === "xlarge"
                      ? "Cực đại"
                      : ctx.companionCardSize === "large"
                      ? "To rõ"
                      : "Bằng chính"}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      ctx.onRemoveCompanionCard?.(slotKey, compIdx);
                      ctx.onDrawCompanionCard?.(slotKey);
                    }}
                    className="text-[#A89882] hover:text-[#C9A55A] p-0.5 transition-colors cursor-pointer"
                    title="Bốc đổi sang lá khác"
                  >
                    <RotateCw className="w-2.5 h-2.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      ctx.onRemoveCompanionCard?.(slotKey, compIdx);
                    }}
                    className="text-[#A89882] hover:text-rose-400 p-0.5 transition-colors cursor-pointer"
                    title="Xóa lá bốc thêm này"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>

              <div
                className="relative hover:z-50"
                onMouseEnter={() => {
                  if (ctx.onHoverCard) {
                    ctx.onHoverCard({
                      card: compCard,
                      positionTitle: `LÁ BỔ TRỢ KẾ BÊN (${compIdx + 1}): ${customTitle || position.name}`,
                      positionSubtitle: `Quẻ #${compCard.number} • ${compCard.name} (${compCard.vietnameseName})`,
                    });
                  }
                }}
                onMouseLeave={ctx.onLeaveCard}
              >
                <FlippableSpiritualCard
                  hexagram={compCard}
                  imageUrl={ctx.cardImages[compCard.number]}
                  videoUrl={ctx.cardVideos[compCard.number]}
                  cardBackUrl={ctx.cardBackUrl}
                  size={compSize}
                  isReversed={compCard.isReversed}
                  defaultFlipped={isFront}
                  fitMode={fitMode}
                  allowFlipOnClick={ctx.allowFlipOnClick}
                  onImageUpdated={directOnImageUpdated || ctx.onImageUpdated}
                  onVideoUpdated={directOnVideoUpdated || ctx.onVideoUpdated}
                  draggable={Boolean(ctx.enableCardDrag)}
                  dragKey={ctx.dragResetKey}
                  enableHoverZoom={ctx.enableHoverZoom !== false}
                />

                {/* Ở lá bốc thêm cũng thêm được bốc thêm: Nút bốc thêm lá kế tiếp */}
                {ctx.showCompanionButton !== false && isLast && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      ctx.onDrawCompanionCard?.(slotKey);
                    }}
                    className="no-capture absolute -top-1.5 -right-7 sm:-right-9 z-20 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#241A10] hover:bg-[#C9A55A] text-[#D6B97A] hover:text-[#120F0C] border border-[#583E24] hover:border-[#F2C965] text-[8.5px] sm:text-[9.5px] font-mono font-bold shadow-md transition-all cursor-pointer group active:scale-95 whitespace-nowrap"
                    title="Bốc thêm tiếp 1 lá kế bên nữa"
                  >
                    <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#D6B97A] group-hover:text-[#120F0C] group-hover:rotate-90 transition-transform" />
                    <span>Bốc thêm</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

