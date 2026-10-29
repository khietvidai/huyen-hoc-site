import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  RotateCcw,
  RotateCw,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  Layers,
  Compass,
  Check,
  HelpCircle,
  Shuffle,
  Heart,
  QrCode,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Hexagram } from "../types";
import { zenAudio } from "../utils/zenAudio";
import { ShuffleDeckAnimation } from "./ShuffleDeckAnimation";

interface Fan360DeckProps {
  deck: (Hexagram | number)[]; // 64 items
  selectedIndices: number[];
  onSelectCard: (index: number) => void;
  cardBackUrl?: string | null;
  targetCount: number;
  onQuickDraw?: () => void;
  onShuffle?: () => void;
  isShuffling?: boolean;
  quickDrawStep?: number;
}

export type TierLayoutType = "tam_tai" | "am_duong" | "tu_tuong" | "don_vong";

interface TierConfig {
  id: string;
  name: string;
  shortName: string;
  startIndex: number;
  count: number;
  radius: number; // Base radius in px
  cardWidth: number;
  cardHeight: number;
  color: string;
  bgBadge: string;
}

export const Fan360Deck: React.FC<Fan360DeckProps> = ({
  deck,
  selectedIndices,
  onSelectCard,
  cardBackUrl,
  targetCount,
  onQuickDraw,
  onShuffle,
  isShuffling,
  quickDrawStep = 0,
}) => {
  // Layout mode for tiers
  const [tierLayout, setTierLayout] = useState<TierLayoutType>("tam_tai");
  // Active filtered tier: "all" or tier ID
  const [activeFilter, setActiveFilter] = useState<string>("all");

  // Rotation and zoom state
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [isAutoSpinning, setIsAutoSpinning] = useState<boolean>(false);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(720);

  // 3D Parallax Tilt for hovered cards
  const [cardTilt, setCardTilt] = useState<{
    cardIdx: number;
    rotateX: number;
    rotateY: number;
    glareX: number;
    glareY: number;
  } | null>(null);

  // Suspense Hold State: Vibrating / shaking anticipation before drawing
  const [holdingIndex, setHoldingIndex] = useState<number | null>(null);
  const [holdProgress, setHoldProgress] = useState<number>(0); // 0 to 100
  const holdStartTimestampRef = useRef<number>(0);
  const holdAnimFrameRef = useRef<number | null>(null);
  const hasTriggeredSelectRef = useRef<boolean>(false);

  // Drag interaction
  const containerRef = useRef<HTMLDivElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartAngleRef = useRef(0);
  const currentAngleRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  // Responsive container width tracking
  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateSize();

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Hold / suspense handlers
  const cancelHoldCard = useCallback(() => {
    if (holdAnimFrameRef.current) {
      cancelAnimationFrame(holdAnimFrameRef.current);
      holdAnimFrameRef.current = null;
    }
    setHoldingIndex(null);
    setHoldProgress(0);
  }, []);

  const startHoldCard = useCallback(
    (cardIdx: number) => {
      if (selectedIndices.includes(cardIdx) || selectedIndices.length >= targetCount || isShuffling) {
        return;
      }
      setHoldingIndex(cardIdx);
      setHoldProgress(0);
      hasTriggeredSelectRef.current = false;
      holdStartTimestampRef.current = Date.now();

      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(15);
      }
      zenAudio.playCardHoldTremble(0.8);

      const updateHoldProgress = () => {
        const elapsed = Date.now() - holdStartTimestampRef.current;
        const duration = 650; // ms to reach full hold threshold
        const progress = Math.min(100, (elapsed / duration) * 100);
        setHoldProgress(progress);

        // Haptic & heartbeat audio pulse while holding
        if (elapsed > 200 && Math.floor(elapsed / 160) % 2 === 0) {
          zenAudio.playCardHoldTremble(1.2);
        }

        if (progress >= 100 && !hasTriggeredSelectRef.current) {
          hasTriggeredSelectRef.current = true;
          if (typeof navigator !== "undefined" && navigator.vibrate) {
            navigator.vibrate([20, 30, 40]);
          }
          zenAudio.playCardDrawChime();
          onSelectCard(cardIdx);
          cancelHoldCard();
          return;
        }

        if (progress < 100) {
          holdAnimFrameRef.current = requestAnimationFrame(updateHoldProgress);
        }
      };

      holdAnimFrameRef.current = requestAnimationFrame(updateHoldProgress);
    },
    [selectedIndices, targetCount, isShuffling, onSelectCard, cancelHoldCard]
  );

  const endHoldCard = useCallback(
    (cardIdx: number) => {
      if (holdingIndex !== cardIdx) return;
      if (!hasTriggeredSelectRef.current) {
        hasTriggeredSelectRef.current = true;
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate(25);
        }
        zenAudio.playCardDrawChime();
        onSelectCard(cardIdx);
      }
      cancelHoldCard();
    },
    [holdingIndex, onSelectCard, cancelHoldCard]
  );

  // Define tier groupings according to chosen layout with compact radii & overlapping cards
  const getTiers = useCallback((): TierConfig[] => {
    if (tierLayout === "am_duong") {
      // 2 Tầng: Dương (Ngoài 32 lá) & Âm (Trong 32 lá)
      return [
        {
          id: "tier_duong",
          name: "Tầng Dương (Ngoài)",
          shortName: "Dương",
          startIndex: 0,
          count: 32,
          radius: 192,
          cardWidth: 40,
          cardHeight: 62,
          color: "#C9A55A",
          bgBadge: "bg-[#2A2012] text-[#C9A55A] border-[#534024]",
        },
        {
          id: "tier_am",
          name: "Tầng Âm (Trong)",
          shortName: "Âm",
          startIndex: 32,
          count: 32,
          radius: 122,
          cardWidth: 36,
          cardHeight: 56,
          color: "#7FB3D5",
          bgBadge: "bg-[#101D28] text-[#7FB3D5] border-[#22394E]",
        },
      ];
    }

    if (tierLayout === "tu_tuong") {
      // 4 Tầng: Thái Dương (16) - Thiếu Dương (16) - Thiếu Âm (16) - Thái Âm (16)
      return [
        {
          id: "tier_thai_duong",
          name: "Tầng 1: Thái Dương",
          shortName: "Thái Dương",
          startIndex: 0,
          count: 16,
          radius: 202,
          cardWidth: 40,
          cardHeight: 62,
          color: "#E28355",
          bgBadge: "bg-[#291A11] text-[#E28355] border-[#4F2D1A]",
        },
        {
          id: "tier_thieu_duong",
          name: "Tầng 2: Thiếu Dương",
          shortName: "Thiếu Dương",
          startIndex: 16,
          count: 16,
          radius: 156,
          cardWidth: 37,
          cardHeight: 56,
          color: "#C9A55A",
          bgBadge: "bg-[#261E11] text-[#C9A55A] border-[#4D3A1E]",
        },
        {
          id: "tier_thieu_am",
          name: "Tầng 3: Thiếu Âm",
          shortName: "Thiếu Âm",
          startIndex: 32,
          count: 16,
          radius: 112,
          cardWidth: 34,
          cardHeight: 52,
          color: "#52BE80",
          bgBadge: "bg-[#112419] text-[#52BE80] border-[#1E452E]",
        },
        {
          id: "tier_thai_am",
          name: "Tầng 4: Thái Âm",
          shortName: "Thái Âm",
          startIndex: 48,
          count: 16,
          radius: 68,
          cardWidth: 30,
          cardHeight: 46,
          color: "#5DADE2",
          bgBadge: "bg-[#0F1E29] text-[#5DADE2] border-[#1D3C52]",
        },
      ];
    }

    if (tierLayout === "don_vong") {
      // 1 Tầng 360° Đơn (64 lá lồng đan xen nhau)
      return [
        {
          id: "tier_don",
          name: "Vòng Đơn 64 Quẻ",
          shortName: "64 Quẻ",
          startIndex: 0,
          count: 64,
          radius: 184,
          cardWidth: 38,
          cardHeight: 62,
          color: "#C9A55A",
          bgBadge: "bg-[#261E11] text-[#C9A55A] border-[#4D3A1E]",
        },
      ];
    }

    // Default: Tam Tài (3 Tầng: Thiên 28 lá - Nhân 24 lá - Địa 12 lá = 64 lá)
    // Các lá bài chồng nhẹ lên nhau tạo cảm giác bộ bài dày dặn, sang trọng và giảm kích cỡ khung ngoài
    return [
      {
        id: "tier_thien",
        name: "Tầng Thiên (Ngoài • 28 lá)",
        shortName: "Thiên (28)",
        startIndex: 0,
        count: 28,
        radius: 196,
        cardWidth: 42,
        cardHeight: 64,
        color: "#E2C37A",
        bgBadge: "bg-[#2A2314] text-[#E2C37A] border-[#534321]",
      },
      {
        id: "tier_nhan",
        name: "Tầng Nhân (Giữa • 24 lá)",
        shortName: "Nhân (24)",
        startIndex: 28,
        count: 24,
        radius: 136,
        cardWidth: 38,
        cardHeight: 58,
        color: "#C9A55A",
        bgBadge: "bg-[#241C11] text-[#C9A55A] border-[#4A371F]",
      },
      {
        id: "tier_dia",
        name: "Tầng Địa (Trong • 12 lá)",
        shortName: "Địa (12)",
        startIndex: 52,
        count: 12,
        radius: 80,
        cardWidth: 34,
        cardHeight: 52,
        color: "#E59866",
        bgBadge: "bg-[#281810] text-[#E59866] border-[#4E2B1A]",
      },
    ];
  }, [tierLayout]);

  const tiers = getTiers();

  // Auto-spinning animation loop
  useEffect(() => {
    if (!isAutoSpinning) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    let lastTime = performance.now();
    const spinSpeed = 0.035; // degrees per ms (~21 deg/sec)

    const animate = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;
      setRotationAngle((prev) => (prev + delta * spinSpeed) % 360);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isAutoSpinning]);

  // Pointer drag to rotate
  const getPointerAngle = (clientX: number, clientY: number) => {
    if (!wheelRef.current) return 0;
    const rect = wheelRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const rad = Math.atan2(clientY - centerY, clientX - centerX);
    return (rad * 180) / Math.PI;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest(".card-touchable")) {
      return; // Do not drag when clicking a card
    }
    isDraggingRef.current = true;
    dragStartAngleRef.current = getPointerAngle(e.clientX, e.clientY);
    currentAngleRef.current = rotationAngle;
    setIsAutoSpinning(false);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const newAngle = getPointerAngle(e.clientX, e.clientY);
    const delta = newAngle - dragStartAngleRef.current;
    setRotationAngle((currentAngleRef.current + delta) % 360);
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const rotateStep = (deg: number) => {
    setIsAutoSpinning(false);
    setRotationAngle((prev) => (prev + deg) % 360);
  };

  const resetAngle = () => {
    setIsAutoSpinning(false);
    setRotationAngle(0);
  };

  const baseScale = Math.min(1, Math.max(0.55, (containerWidth - 12) / 510));
  const totalScale = baseScale * zoomScale;

  return (
    <div className="relative flex flex-col items-center w-full select-none">
      {/* Top Controls Toolbar: Tier presets, Filters & Zoom (Đồng bộ Ngọc Giản Giấy Tuyên Thành) */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2.5 mb-3 px-3 py-2.5 rounded-2xl bg-[#FAF6EE]/95 border border-[#C4963E]/40 text-xs text-[#5C4D3B] shadow-xs">
        {/* Tier Layout Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-serif font-bold text-[#6E4E16] flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-[#B8862D]" />
            Cấu Trúc Tầng:
          </span>
          <div className="inline-flex p-0.5 bg-[#EFE7D6] border border-[#C4963E]/35 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setTierLayout("tam_tai");
                setActiveFilter("all");
              }}
              className={`px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                tierLayout === "tam_tai"
                  ? "bg-gradient-to-b from-[#261E16] to-[#18130E] text-[#F3E5AB] border border-[#D4AF37] font-bold shadow"
                  : "text-[#5C4D3B] hover:text-[#1C1610]"
              }`}
              title="3 Tầng: Thiên (28 lá), Nhân (24 lá), Địa (12 lá)"
            >
              Tam Tài (3 Tầng)
            </button>
            <button
              type="button"
              onClick={() => {
                setTierLayout("am_duong");
                setActiveFilter("all");
              }}
              className={`px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                tierLayout === "am_duong"
                  ? "bg-gradient-to-b from-[#261E16] to-[#18130E] text-[#F3E5AB] border border-[#D4AF37] font-bold shadow"
                  : "text-[#5C4D3B] hover:text-[#1C1610]"
              }`}
              title="2 Tầng: Dương (32 lá) & Âm (32 lá)"
            >
              Âm Dương (2 Tầng)
            </button>
            <button
              type="button"
              onClick={() => {
                setTierLayout("tu_tuong");
                setActiveFilter("all");
              }}
              className={`px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                tierLayout === "tu_tuong"
                  ? "bg-gradient-to-b from-[#261E16] to-[#18130E] text-[#F3E5AB] border border-[#D4AF37] font-bold shadow"
                  : "text-[#5C4D3B] hover:text-[#1C1610]"
              }`}
              title="4 Tầng: 16 lá mỗi tầng (Thái Dương, Thiếu Dương, Thiếu Âm, Thái Âm)"
            >
              Tứ Tượng (4 Tầng)
            </button>
            <button
              type="button"
              onClick={() => {
                setTierLayout("don_vong");
                setActiveFilter("all");
              }}
              className={`px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                tierLayout === "don_vong"
                  ? "bg-gradient-to-b from-[#261E16] to-[#18130E] text-[#F3E5AB] border border-[#D4AF37] font-bold shadow"
                  : "text-[#5C4D3B] hover:text-[#1C1610]"
              }`}
              title="1 Vòng Tròn 360° gồm 64 lá"
            >
              Vòng Đơn (64 Lá)
            </button>
          </div>
        </div>

        {/* View Mode Filters: Show All or Single Tier */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-[#6E4E16]">Lọc hiển thị:</span>
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`px-2.5 py-0.5 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
              activeFilter === "all"
                ? "bg-[#261E16] text-[#F3E5AB] border-[#D4AF37] font-bold"
                : "bg-[#FDFBF7] text-[#5C4D3B] border-[#C4963E]/35 hover:border-[#C4963E]"
            }`}
          >
            Tất cả các tầng (64 lá)
          </button>
          {tiers.map((tier) => (
            <button
              key={tier.id}
              type="button"
              onClick={() => setActiveFilter(tier.id)}
              className={`px-2.5 py-0.5 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                activeFilter === tier.id
                  ? "bg-[#261E16] text-[#F3E5AB] border-[#D4AF37] font-bold"
                  : "bg-[#FDFBF7] text-[#5C4D3B] border-[#C4963E]/35 hover:border-[#C4963E]"
              }`}
            >
              {tier.shortName}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Action Bar docked right next to the cards */}
      <div className="flex items-center justify-center gap-3 my-2.5 z-20">
        <button
          type="button"
          onClick={onShuffle}
          disabled={isShuffling}
          className="flex items-center gap-2 px-4 py-2 text-xs font-serif font-bold text-[#EAD8B1] hover:text-[#FFF] bg-[#221B14] hover:bg-[#2F241A] border border-[#53412B] hover:border-[#C9A55A] rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50 active:scale-95 group"
          title="Xáo lại 64 lá bài theo nghi thức cổ truyền (5.5 giây)"
        >
          <Shuffle className={`w-3.5 h-3.5 text-[#C9A55A] ${isShuffling ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
          <span>Xáo Lại 64 Lá</span>
        </button>

        <button
          type="button"
          onClick={onQuickDraw}
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
              ? `Lần 3: Kính Nhân • Bốc Quẻ${targetCount ? ` (${targetCount} Lá)` : ""}`
              : `Bốc Ngẫu Nhiên: Lần 1 • Kính Thiên${targetCount ? ` (${targetCount} Lá)` : ""}`}
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

      {/* Main 360 Fan Wheel Stage Container (Đồng bộ Sân Khấu Giấy Tuyên Thành & Tinh Bàn Bát Quái Vàng Kim) */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="relative w-full max-w-[540px] sm:max-w-[560px] aspect-square rounded-3xl bg-radial from-[#FAF8F2] via-[#F3ECE0] to-[#E6DEC8] border-2 border-[#C4963E]/65 shadow-[inset_0_0_60px_rgba(196,150,62,0.18),0_18px_42px_rgba(62,48,26,0.18)] overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing p-2"
      >
        {/* Shuffle Deck 3D Animation Overlay */}
        <AnimatePresence>
          {isShuffling && (
            <ShuffleDeckAnimation
              cardBackUrl={cardBackUrl || "/assets/cuunhi/13_card_back_huyen_mon.webp"}
              durationMs={5500}
            />
          )}
        </AnimatePresence>

        {/* Mystical Background Astrolabe / Bagua Ring Graphics */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-[88%] h-[88%] rounded-full border-[1.5px] border-[#B8892E]/45 border-dashed animate-[spin_180s_linear_infinite]" />
          <div className="absolute w-[68%] h-[68%] rounded-full border border-[#B8892E]/35 animate-[spin_120s_linear_infinite_reverse]" />
          <div className="absolute w-[44%] h-[44%] rounded-full border border-[#B8892E]/45 border-dotted animate-[spin_80s_linear_infinite]" />
          {/* Radial Axis Rays */}
          <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-[#B8892E]/35 to-transparent" />
          <div className="absolute h-full w-[1px] bg-gradient-to-b from-transparent via-[#B8892E]/35 to-transparent" />
        </div>

        {/* Scaled Rotating Wheel Area */}
        <div
          ref={wheelRef}
          style={{
            transform: `scale(${totalScale})`,
            transition: isDraggingRef.current ? "none" : "transform 0.2s ease-out",
          }}
          className="relative w-full h-full flex items-center justify-center transform-gpu"
        >
          {/* Concentric Tiers Orbit Guides */}
          {tiers.map((tier) => {
            const isDimmed = activeFilter !== "all" && activeFilter !== tier.id;
            return (
              <div
                key={tier.id}
                style={{
                  width: `${tier.radius * 2}px`,
                  height: `${tier.radius * 2}px`,
                  borderColor: `${tier.color}33`,
                }}
                className={`absolute rounded-full border border-dashed transition-opacity duration-300 pointer-events-none ${
                  isDimmed ? "opacity-15" : "opacity-60"
                }`}
              />
            );
          })}

          {/* Cards for all tiers (Chồng nhẹ lên nhau, xếp tầng tinh tế) */}
          {tiers.map((tier, tierIdx) => {
            const isVisible = activeFilter === "all" || activeFilter === tier.id;
            if (!isVisible) return null;

            const cardsInTier = Array.from({ length: tier.count }, (_, i) => tier.startIndex + i);
            const stepDeg = 360 / tier.count;

            return (
              <div key={tier.id} className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {cardsInTier.map((cardIdx, localIdx) => {
                  const isSelected = selectedIndices.includes(cardIdx);
                  const selectionOrder = selectedIndices.indexOf(cardIdx) + 1;
                  const isHovered = hoveredIndex === cardIdx;
                  const isHolding = holdingIndex === cardIdx;

                  // Compute absolute rotation around center
                  const angleDeg = (localIdx * stepDeg + rotationAngle) % 360;
                  const angleRad = (angleDeg * Math.PI) / 180;

                  // Radiate outwards: x = r * cos, y = r * sin
                  // When hovered or held, push outward to cleanly clear overlapping neighbor cards
                  const activeRadius = tier.radius + (isSelected ? 14 : isHolding ? 16 : isHovered ? 13 : 0);
                  const x = activeRadius * Math.cos(angleRad);
                  const y = activeRadius * Math.sin(angleRad);

                  // Card rotation: perpendicular to radius ray, facing outward
                  const cardRotateDeg = angleDeg + 90;

                  // Dynamic shaking classes when user holds down on the card
                  const isShaking = isHolding && holdProgress > 15;
                  const shakeClass = isShaking
                    ? holdProgress > 50
                      ? "animate-suspense-shake-fierce"
                      : "animate-suspense-shake"
                    : "";

                  return (
                    <div
                      key={cardIdx}
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        width: `${tier.cardWidth}px`,
                        height: `${tier.cardHeight}px`,
                        transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${cardRotateDeg}deg) scale(${
                          isHolding ? 1.35 : isSelected ? 1.25 : isHovered ? 1.28 : 1
                        })`,
                        zIndex: isHolding ? 999 : isSelected ? 80 : isHovered ? 900 : (10 + tierIdx * 100 + localIdx),
                        transition: isDraggingRef.current
                          ? "none"
                          : "transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.2s",
                      }}
                      onMouseEnter={() => setHoveredIndex(cardIdx)}
                      onPointerMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        if (rect.width === 0 || rect.height === 0) return;
                        const px = (e.clientX - rect.left) / rect.width;
                        const py = (e.clientY - rect.top) / rect.height;
                        const rotX = -((py - 0.5) * 26);
                        const rotY = (px - 0.5) * 26;
                        setCardTilt({
                          cardIdx,
                          rotateX: Math.round(rotX * 10) / 10,
                          rotateY: Math.round(rotY * 10) / 10,
                          glareX: Math.round(px * 100),
                          glareY: Math.round(py * 100),
                        });
                      }}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        startHoldCard(cardIdx);
                      }}
                      onPointerUp={(e) => {
                        e.stopPropagation();
                        endHoldCard(cardIdx);
                      }}
                      onPointerLeave={() => {
                        if (holdingIndex === cardIdx) cancelHoldCard();
                        setHoveredIndex((prev) => (prev === cardIdx ? null : prev));
                        setCardTilt((prev) => (prev?.cardIdx === cardIdx ? null : prev));
                      }}
                      onPointerCancel={() => {
                        if (holdingIndex === cardIdx) cancelHoldCard();
                      }}
                      className="card-touchable cursor-pointer group pointer-events-auto"
                      title={`Lá số ${cardIdx + 1} (${tier.name}) - Giữ lâu để cảm nhận linh ứng, buông để thỉnh`}
                    >
                      {/* Suspense Floating Golden Aura while holding */}
                      {isHolding && holdProgress > 25 && (
                        <div
                          className="absolute -inset-3 rounded-xl pointer-events-none animate-aura-glow"
                          style={{
                            background: "radial-gradient(circle, rgba(212,175,55,0.45) 0%, rgba(212,175,55,0.1) 60%, transparent 80%)",
                            zIndex: -2,
                          }}
                        />
                      )}

                      {/* Floating Contact Shadow on wheel surface */}
                      {(isHovered || isHolding) && (
                        <div
                          className="absolute inset-0 pointer-events-none rounded-md sm:rounded-lg"
                          style={{
                            transform: `translate(${-(cardTilt?.rotateY || 0) * 0.9}px, ${(cardTilt?.rotateX || 0) * 0.9 + 18}px) scale(0.92)`,
                            background: "radial-gradient(ellipse at center, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 45%, transparent 75%)",
                            filter: "blur(6px)",
                            zIndex: -1,
                          }}
                        />
                      )}

                      {/* Card Body with 3D Parallax Tilt & Suspense Shake Animation */}
                      <div
                        style={{
                          transform:
                            isHovered && cardTilt?.cardIdx === cardIdx
                              ? `perspective(400px) rotateX(${cardTilt.rotateX}deg) rotateY(${cardTilt.rotateY}deg) translateZ(30px) scale(1.12)`
                              : "perspective(400px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)",
                          transformStyle: "preserve-3d",
                          transition: isHovered
                            ? "transform 0.06s ease-out"
                            : "transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.35s ease-out",
                          boxShadow:
                            isHolding
                              ? `0 0 28px rgba(212, 175, 55, ${0.4 + (holdProgress / 100) * 0.6}), 0 12px 24px rgba(0,0,0,0.8)`
                              : isHovered && cardTilt?.cardIdx === cardIdx
                              ? `${-cardTilt.rotateY * 1.2}px ${cardTilt.rotateX * 1.2 + 20}px 32px rgba(0, 0, 0, 0.92), 0 0 28px rgba(212, 175, 55, 0.85), 0 12px 24px rgba(0, 0, 0, 0.7)`
                              : undefined,
                          willChange: "transform",
                        }}
                          className={`relative w-full h-full rounded-md sm:rounded-lg overflow-hidden border transition-colors duration-200 shadow-md ${shakeClass} ${
                          isHolding
                            ? "border-[#FFE599] ring-2 ring-[#C9A55A]"
                            : isSelected
                            ? "border-[#C9A55A] ring-2 ring-[#C9A55A] shadow-[0_0_25px_rgba(212,175,55,0.95)] animate-card-draw-float"
                            : isHovered
                            ? "border-[#F5EAD4] ring-1 ring-[#C9A55A]"
                            : "border-[#453624] hover:border-[#C9A55A]/80 bg-[#17130F]"
                        }`}
                      >
                        {/* 3D Dynamic Parallax Glare Sheen */}
                        {isHovered && cardTilt?.cardIdx === cardIdx && (
                          <div
                            className="absolute inset-0 pointer-events-none z-30 transition-opacity duration-150"
                            style={{
                              background: `radial-gradient(circle at ${cardTilt.glareX}% ${cardTilt.glareY}%, rgba(255, 248, 220, 0.55) 0%, rgba(212, 175, 55, 0.25) 30%, transparent 68%)`,
                              mixBlendMode: "screen",
                            }}
                          />
                        )}

                        {/* Custom Card Back Image or Default Yin-Yang Pattern */}
                        {cardBackUrl ? (
                          <img
                            src={cardBackUrl}
                            alt="Card Back"
                            className="w-full h-full object-cover select-none pointer-events-none"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-b from-[#241C15] via-[#16120E] to-[#0E0C09] flex flex-col items-center justify-between p-1">
                            <div className="w-full flex justify-between items-center text-[7px] text-[#A6957E] font-mono opacity-80">
                              <span>☯</span>
                              <span>#{cardIdx + 1}</span>
                            </div>
                            <div className="w-4 h-4 rounded-full border border-[#C9A55A]/50 flex items-center justify-center bg-[#1B1611] shadow-inner">
                              <span className="text-[8px] text-[#C9A55A]">☯</span>
                            </div>
                            <div className="w-full text-center text-[6px] text-[#8C7B65] font-mono tracking-tighter truncate">
                              DỊCH
                            </div>
                          </div>
                        )}

                        {/* Selected Order Badge & Spiritual Burst Aura */}
                        {isSelected && (
                          <>
                            <div className="absolute -inset-2 rounded-lg border border-[#C9A55A]/80 animate-burst-aura pointer-events-none" />
                            <div className="absolute inset-0 bg-[#C9A55A]/30 backdrop-blur-[0.5px] flex items-center justify-center">
                              <span className="w-5 h-5 rounded-full bg-[#120F0C] border border-[#C9A55A] text-[#C9A55A] text-[10px] font-mono font-bold flex items-center justify-center shadow-lg animate-pulse">
                                {selectionOrder}
                              </span>
                            </div>
                          </>
                        )}

                        {/* Hover Outline Shine */}
                        {isHovered && !isSelected && !isHolding && (
                          <div className="absolute inset-0 bg-white/10 pointer-events-none" />
                        )}
                      </div>

                      {/* Floating Suspense Status Pill when user holds down */}
                      {isHolding && (
                        <div
                          style={{
                            transform: `rotate(-${cardRotateDeg}deg)`,
                          }}
                          className="absolute -top-9 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-[#16110B] border border-[#C9A55A] text-[#EAD8B1] text-[9px] font-serif font-bold whitespace-nowrap shadow-[0_0_12px_rgba(212,175,55,0.7)] z-50 pointer-events-none flex items-center gap-1.5"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Linh cảm... {Math.round(holdProgress)}%</span>
                        </div>
                      )}

                      {/* Floating Card Number Pill on Hover (when not holding) */}
                      {isHovered && !isHolding && (
                        <div
                          style={{
                            transform: `rotate(-${cardRotateDeg}deg)`,
                          }}
                          className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-[#120F0C] border border-[#C9A55A] text-[#C9A55A] text-[10px] font-mono font-bold whitespace-nowrap shadow-xl z-50 pointer-events-none"
                        >
                          Lá #{cardIdx + 1}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* Central Taiji / Altar Core Medallion (gọn gàng, vừa vặn với kích thước mới) */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              if (onQuickDraw && !isShuffling) onQuickDraw();
            }}
            className={`relative z-50 w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-gradient-to-b from-[#251E16] via-[#17130F] to-[#0D0B08] border-2 transition-all cursor-pointer hover:scale-105 group flex flex-col items-center justify-center text-center p-1 ${
              quickDrawStep === 1
                ? "border-[#E6D3A3] shadow-[0_0_35px_rgba(255,226,148,0.5)] ring-2 ring-[#E6D3A3]/50"
                : quickDrawStep === 2
                ? "border-[#FFD700] shadow-[0_0_40px_rgba(255,215,0,0.7)] ring-2 ring-[#FFD700] animate-pulse"
                : "border-[#C9A55A] shadow-[0_0_30px_rgba(212,175,55,0.4)]"
            }`}
            title={
              quickDrawStep === 0
                ? "Tâm điểm Thái Cực • Bấm lần 1 để Kính Thiên"
                : quickDrawStep === 1
                ? "Tâm điểm Thái Cực • Bấm lần 2 để Kính Địa"
                : "Tâm điểm Thái Cực • Bấm lần 3 để Kính Nhân & Bốc Quẻ Thần"
            }
          >
            {/* Spinning Outer Ring */}
            <div className="absolute -inset-1 rounded-full border border-[#C9A55A]/40 border-dashed animate-[spin_40s_linear_infinite] pointer-events-none" />

            {/* Taiji Symbol */}
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#120F0C] border border-[#C9A55A] flex items-center justify-center shadow mb-0.5 group-hover:rotate-180 transition-transform duration-700">
              <span className="text-xs sm:text-sm text-[#C9A55A]">☯</span>
            </div>

            <div className="text-[9px] font-serif font-bold text-[#F3E7CF] leading-tight">
              {quickDrawStep === 1 ? (
                <span className="text-[#E6D3A3]">KÍNH ĐỊA</span>
              ) : quickDrawStep === 2 ? (
                <span className="text-[#FFD700] animate-pulse">KÍNH NHÂN</span>
              ) : (
                "ĐÃ CHỌN"
              )}
            </div>
            <div className="text-[11px] font-mono font-bold text-[#C9A55A] leading-none my-0.5">
              {quickDrawStep === 1 ? (
                "2 / 3"
              ) : quickDrawStep === 2 ? (
                "3 / 3"
              ) : (
                `${selectedIndices.length} / ${targetCount}`
              )}
            </div>
            <div className="text-[7.5px] text-[#A69782] font-serif flex items-center gap-0.5 group-hover:text-[#FFF] transition-colors">
              <Sparkles className="w-2 h-2 text-[#C9A55A]" />
              {quickDrawStep === 1
                ? "Bấm lần 2"
                : quickDrawStep === 2
                ? "Bấm lần 3"
                : "Lần 1: Thiên"}
            </div>
          </div>
        </div>

        {/* Overlay Navigation & Interactive Rotation Helper Hints */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none text-xs text-[#9E8E77]">
          <div className="flex items-center gap-1.5 pointer-events-auto bg-[#120F0C]/85 backdrop-blur-xs px-2.5 py-1 rounded-xl border border-[#34271A]">
            <button
              type="button"
              onClick={() => rotateStep(-45)}
              className="p-1 hover:text-[#FFF] hover:bg-[#251D14] rounded cursor-pointer"
              title="Xoay trái 45°"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#C9A55A]" />
            </button>
            <button
              type="button"
              onClick={() => setIsAutoSpinning((prev) => !prev)}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                isAutoSpinning
                  ? "bg-[#C9A55A] text-[#120F0C] font-bold"
                  : "hover:text-[#FFF] hover:bg-[#251D14]"
              }`}
              title="Tự động xoay vòng 360° chậm"
            >
              {isAutoSpinning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span className="text-[10px] font-serif">
                {isAutoSpinning ? "Dừng Xoay" : "Tự Xoay"}
              </span>
            </button>
            <button
              type="button"
              onClick={() => rotateStep(45)}
              className="p-1 hover:text-[#FFF] hover:bg-[#251D14] rounded cursor-pointer"
              title="Xoay phải 45°"
            >
              <RotateCw className="w-3.5 h-3.5 text-[#C9A55A]" />
            </button>
            <span className="text-[#413222] font-mono">|</span>
            <button
              type="button"
              onClick={resetAngle}
              className="px-1.5 py-0.5 rounded text-[10px] font-mono hover:text-[#FFF] hover:bg-[#251D14] cursor-pointer"
              title="Đặt lại góc xoay 0°"
            >
              0°
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 pointer-events-auto bg-[#120F0C]/85 backdrop-blur-xs px-2 py-1 rounded-xl border border-[#34271A]">
            <button
              type="button"
              onClick={() => setZoomScale((prev) => Math.max(0.7, Math.round((prev - 0.1) * 10) / 10))}
              className="p-1 hover:text-[#FFF] hover:bg-[#251D14] rounded cursor-pointer"
              title="Thu nhỏ"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="text-[10px] font-mono px-1 text-[#C9A55A]">
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoomScale((prev) => Math.min(1.4, Math.round((prev + 0.1) * 10) / 10))}
              className="p-1 hover:text-[#FFF] hover:bg-[#251D14] rounded cursor-pointer"
              title="Phóng to"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => setZoomScale(1)}
              className="p-1 hover:text-[#FFF] hover:bg-[#251D14] rounded cursor-pointer"
              title="Tỉ lệ chuẩn 100%"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Hover / Selected Info Strip at Top Center */}
        <div className="absolute top-3 inset-x-4 flex justify-center pointer-events-none">
          <div className="bg-[#14100D]/90 backdrop-blur-xs border border-[#3D3020] rounded-full px-3 py-1 flex items-center gap-2 text-xs shadow-lg">
            <span className="w-2 h-2 rounded-full bg-[#C9A55A] animate-pulse" />
            <span className="text-[#C4B49C] text-[11px] font-serif">
              {hoveredIndex !== null ? (
                <>
                  Đang rà chuột:{" "}
                  <strong className="text-[#C9A55A] font-mono">
                    Lá #{hoveredIndex + 1}
                  </strong>{" "}
                  • Nhấp để chọn thỉnh
                </>
              ) : (
                <>
                  Kéo chuột hoặc ngón tay để xoay vòng • Nhấp vào lá bài bạn cảm ứng
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Under-wheel Legends & Quick Selection Summary */}
      <div className="w-full max-w-[760px] flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 text-xs text-[#5C4D3B]">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-serif font-bold text-[#6E4E16]">Ý nghĩa các tầng:</span>
          {tiers.map((tier) => (
            <span
              key={tier.id}
              className={`text-[10px] font-serif px-2.5 py-0.5 rounded-full border shadow-2xs ${tier.bgBadge}`}
            >
              ● {tier.name}
            </span>
          ))}
        </div>

        <div className="text-[11px] text-[#6E4E16] font-mono font-semibold">
          Tổng cộng: 64 lá bài Kinh Dịch
        </div>
      </div>
    </div>
  );
};
