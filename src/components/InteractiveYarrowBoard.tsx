import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Layers, ArrowRight, CheckCircle2, RefreshCw, Zap } from "lucide-react";
import { BianDetail } from "./YarrowDivination";
import { zenAudio } from "../utils/zenAudio";

interface InteractiveYarrowBoardProps {
  stalksCount: number; // 49, 44, 40, 36...
  currentBianStep: 1 | 2 | 3;
  currentLineIndex: number;
  isDrawing: boolean;
  latestBian?: BianDetail;
  onDrawStalks: (userSplitLeft: number) => void;
  disabled?: boolean;
}

// Bốn Mùa (Tứ Thời) tương ứng với mỗi lần đếm 4 cọng
const SEASONS = [
  { name: "Xuân", hanzi: "春", tag: "Mùa Xuân", color: "text-emerald-400", border: "border-emerald-700/50" },
  { name: "Hạ", hanzi: "夏", tag: "Mùa Hạ", color: "text-rose-400", border: "border-rose-700/50" },
  { name: "Thu", hanzi: "秋", tag: "Mùa Thu", color: "text-amber-400", border: "border-amber-700/50" },
  { name: "Đông", hanzi: "冬", tag: "Mùa Đông", color: "text-sky-400", border: "border-sky-700/50" },
];

export const InteractiveYarrowBoard: React.FC<InteractiveYarrowBoardProps> = ({
  stalksCount,
  currentBianStep,
  currentLineIndex,
  isDrawing,
  latestBian,
  onDrawStalks,
  disabled = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const minPerSide = Math.max(4, Math.floor(stalksCount * 0.15));
  const maxPerSide = stalksCount - minPerSide;

  // Split mode: "random" (bó trái/phải chạy ngẫu nhiên liên tục) hoặc "manual" (chạm phân điểm)
  const [splitMode, setSplitMode] = useState<"random" | "manual">("random");
  const [isRandomRunning, setIsRandomRunning] = useState<boolean>(true);

  // Split index (number of stalks in Left bundle)
  const [splitIndex, setSplitIndex] = useState<number>(() => Math.round(stalksCount / 2));
  const [isHovering, setIsHovering] = useState<boolean>(false);

  // Ritual phases:
  // 1. "split": User decides where to divide Heaven & Earth (ngẫu nhiên chạy hoặc tự chạm phân điểm)
  // 2. "quai_nhat": Pull 1 stalk from Right for Trinity (Human)
  // 3. "count_left": Querent pulls 4 stalks at a time from Left bundle
  // 4. "count_right": Querent pulls 4 stalks at a time from Right bundle
  // 5. "summary": View Remainder and confirm Bian
  const [ritualPhase, setRitualPhase] = useState<
    "split" | "quai_nhat" | "count_left" | "count_right" | "summary"
  >("split");

  // Dynamic counts during the active counting
  const leftInitial = Math.max(minPerSide, Math.min(maxPerSide, splitIndex));
  const rightInitial = stalksCount - leftInitial;

  const [leftRemaining, setLeftRemaining] = useState<number>(leftInitial);
  const [leftGroupsPulled, setLeftGroupsPulled] = useState<number>(0);

  const [rightRemaining, setRightRemaining] = useState<number>(rightInitial - 1);
  const [rightGroupsPulled, setRightGroupsPulled] = useState<number>(0);

  // Exact remainders
  const expectedLeftRemainder = leftInitial % 4 === 0 ? 4 : leftInitial % 4;
  const expectedRightRemainder =
    (rightInitial - 1) % 4 === 0 ? 4 : (rightInitial - 1) % 4;
  const totalRemoved = 1 + expectedLeftRemainder + expectedRightRemainder;
  const remainingAfterBian = stalksCount - totalRemoved;

  // Reset when starting a new Bian or line
  useEffect(() => {
    setRitualPhase("split");
    const defaultSplit = Math.round(stalksCount / 2);
    setSplitIndex(defaultSplit);
    setLeftRemaining(defaultSplit);
    setLeftGroupsPulled(0);
    setRightRemaining(stalksCount - defaultSplit - 1);
    setRightGroupsPulled(0);
    setIsRandomRunning(true);
  }, [stalksCount, currentBianStep, currentLineIndex]);

  // Continuous random fluctuation in "random" mode
  useEffect(() => {
    if (
      ritualPhase !== "split" ||
      splitMode !== "random" ||
      !isRandomRunning ||
      disabled ||
      isDrawing
    ) {
      return;
    }

    let progress = 0;
    const interval = setInterval(() => {
      // Natural harmonic wave with dynamic organic fluctuations
      progress += 0.22;
      const baseWave = (Math.sin(progress) + 1) / 2; // 0 to 1
      const noise = (Math.random() - 0.5) * 0.14;
      const wave = Math.max(0, Math.min(1, baseWave + noise));
      const nextSplit = Math.round(minPerSide + wave * (maxPerSide - minPerSide));
      setSplitIndex(nextSplit);
    }, 65);

    return () => clearInterval(interval);
  }, [ritualPhase, splitMode, isRandomRunning, minPerSide, maxPerSide, disabled, isDrawing]);

  // Pointer drag on the bundle when in "manual" mode (Chạm Phân Điểm)
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || isDrawing || ritualPhase !== "split" || splitMode !== "manual" || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, relativeX / rect.width));
    const calculatedIndex = Math.round(minPerSide + ratio * (maxPerSide - minPerSide));
    setSplitIndex(calculatedIndex);
    setIsHovering(true);
  };

  // Click on the bundle container
  const handleBoardClick = () => {
    if (disabled || isDrawing || ritualPhase !== "split") return;

    if (splitMode === "random") {
      if (isRandomRunning) {
        // Seeker tapped to stop the continuous random roll!
        setIsRandomRunning(false);
        zenAudio.playCardDrawSound();
      } else {
        // Already stopped, confirm and proceed
        handleConfirmSplit();
      }
    } else {
      // Manual mode: user click confirms the position
      handleConfirmSplit();
    }
  };

  // Step 1: Confirm split point
  const handleConfirmSplit = () => {
    if (disabled || isDrawing) return;
    setLeftRemaining(leftInitial);
    setRightRemaining(rightInitial - 1);
    setLeftGroupsPulled(0);
    setRightGroupsPulled(0);
    zenAudio.playYarrowStalkRustle();
    setRitualPhase("quai_nhat");
  };

  // Step 2: Quải Nhất (Take 1 stalk from Right for Trinity/Human)
  const handleQuaiNhat = () => {
    if (disabled || isDrawing) return;
    zenAudio.playCardDrawSound();
    setRitualPhase("count_left");
  };

  // Step 3: Pull 4 stalks from Left bundle
  const handlePullFourLeft = () => {
    if (disabled || isDrawing) return;
    if (leftRemaining > 4) {
      setLeftRemaining((prev) => prev - 4);
      setLeftGroupsPulled((prev) => prev + 1);
      zenAudio.playYarrowCountClick(1.2);
    }
  };

  // Auto fast forward all remaining 4s for Left bundle
  const handleFastForwardLeft = () => {
    if (disabled || isDrawing) return;
    const numGroups = Math.floor((leftInitial - expectedLeftRemainder) / 4);
    setLeftGroupsPulled(numGroups);
    setLeftRemaining(expectedLeftRemainder);
    zenAudio.playYarrowCountClick(1.2);
  };

  // Move left remainder to Nhuận and transition to counting Right bundle
  const handleFinishLeftAndMoveToRight = () => {
    if (disabled || isDrawing) return;
    zenAudio.playCardDrawSound();
    setRitualPhase("count_right");
  };

  // Step 4: Pull 4 stalks from Right bundle
  const handlePullFourRight = () => {
    if (disabled || isDrawing) return;
    if (rightRemaining > 4) {
      setRightRemaining((prev) => prev - 4);
      setRightGroupsPulled((prev) => prev + 1);
      zenAudio.playYarrowCountClick(1.0);
    }
  };

  // Auto fast forward all remaining 4s for Right bundle
  const handleFastForwardRight = () => {
    if (disabled || isDrawing) return;
    const numGroups = Math.floor((rightInitial - 1 - expectedRightRemainder) / 4);
    setRightGroupsPulled(numGroups);
    setRightRemaining(expectedRightRemainder);
    zenAudio.playYarrowCountClick(1.0);
  };

  // Move right remainder to Nhuận and transition to summary
  const handleFinishRightAndMoveToSummary = () => {
    if (disabled || isDrawing) return;
    zenAudio.playCardDrawSound();
    setRitualPhase("summary");
  };

  // Step 5: Confirm and finish the Bian
  const handleCompleteBian = () => {
    if (disabled || isDrawing) return;
    zenAudio.strikeSingingBowl(324, 0.6);
    onDrawStalks(leftInitial);
  };

  // Reset current bian if querent wants to split again
  const handleRestartBian = () => {
    setRitualPhase("split");
    setLeftRemaining(leftInitial);
    setRightRemaining(rightInitial - 1);
    setLeftGroupsPulled(0);
    setRightGroupsPulled(0);
    setIsRandomRunning(true);
  };

  return (
    <div className="w-full bg-[#15100B] border border-[#4A3722] rounded-2xl p-3 sm:p-5 shadow-2xl relative overflow-hidden">
      {/* 1. TOP ALTAR: THÁI CỰ ĐỆ NHẤT CỌNG (CẤT RIÊNG 1 CỌNG BẤT BIẾN) */}
      <div className="mb-4 bg-[#1E160F] border border-[#523A20] rounded-xl p-2.5 sm:p-3 flex items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#2C1F13] border border-[#D4AF37] flex items-center justify-center text-sm shadow">
            ☯
          </div>
          <div>
            <div className="text-xs sm:text-sm font-serif font-bold text-[#F3E5CD] flex items-center gap-1.5">
              <span>Thái Cực Bất Biến</span>
              <span className="text-[10px] font-mono text-[#D4AF37] bg-[#291A0E] px-1.5 py-0.2 rounded border border-[#583719]">
                Cất riêng 1 cọng
              </span>
            </div>
            <p className="text-[10.5px] text-[#A69781] font-serif">
              Đại Diễn 50 cọng, cất riêng 1 cọng làm gốc sinh hóa vạn vật, dùng {stalksCount} cọng thao dịch
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#271C11] border border-[#6B4B27]">
          {/* Miniature horizontal Taiji Stalk */}
          <div className="w-12 sm:w-16 h-2 bg-gradient-to-r from-[#946F28] via-[#FFE69A] to-[#946F28] rounded-full shadow-[0_0_8px_rgba(212,175,55,0.6)]" />
          <span className="text-[10px] font-mono font-bold text-[#FFE28A]">1 Cọng</span>
        </div>
      </div>

      {/* 2. RITUAL STATUS BREADCRUMB */}
      <div className="mb-3 flex items-center justify-between gap-2 flex-wrap border-b border-[#302214] pb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]" />
          <h4 className="text-xs sm:text-sm font-serif font-bold text-[#F4E8D3]">
            BÓ CỎ THI TRONG TAY ({stalksCount} CỌNG) • HÀO {currentLineIndex} • BIẾN {currentBianStep}/3
          </h4>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#D4AF37]">
          <span className={ritualPhase === "split" ? "font-bold text-[#FFE28A]" : "text-[#7D6B57]"}>
            1. Phân Lưỡng Nghi
          </span>
          <span>➔</span>
          <span className={ritualPhase === "quai_nhat" ? "font-bold text-[#FFE28A]" : "text-[#7D6B57]"}>
            2. Quải Nhất
          </span>
          <span>➔</span>
          <span className={ritualPhase === "count_left" ? "font-bold text-[#FFE28A]" : "text-[#7D6B57]"}>
            3. Rút Bó Trái
          </span>
          <span>➔</span>
          <span className={ritualPhase === "count_right" ? "font-bold text-[#FFE28A]" : "text-[#7D6B57]"}>
            4. Rút Bó Phải
          </span>
          <span>➔</span>
          <span className={ritualPhase === "summary" ? "font-bold text-[#FFE28A]" : "text-[#7D6B57]"}>
            5. Gom Nhuận
          </span>
        </div>
      </div>

      {/* 3. STEP 1: INTERACTIVE SPLIT (PHÂN LƯỠNG NGHI - TRỜI & ĐẤT) */}
      {ritualPhase === "split" && (
        <div className="space-y-3">
          {/* MODE SELECTOR: NGẪU NHIÊN CHẠM vs CHẠM PHÂN ĐIỂM */}
          <div className="flex items-center justify-between gap-2 flex-wrap bg-[#19120B] border border-[#3E2917] p-2 rounded-xl">
            <div className="flex items-center gap-1 bg-[#120B06] p-1 rounded-lg border border-[#2D1D10]">
              <button
                type="button"
                onClick={() => {
                  setSplitMode("random");
                  setIsRandomRunning(true);
                  zenAudio.playYarrowStalkRustle();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-serif font-bold transition-all cursor-pointer ${
                  splitMode === "random"
                    ? "bg-gradient-to-r from-[#9C7026] to-[#C99833] text-[#14100C] shadow-md border border-[#FFE28A]"
                    : "text-[#A89882] hover:text-[#FFF]"
                }`}
                title="Bó Trái & Phải tự động chạy số ngẫu nhiên liên tục, người chiêm chạm để dừng bắt điểm phân"
              >
                <span>🎲</span>
                <span>Ngẫu Nhiên Chạm</span>
                {splitMode === "random" && isRandomRunning && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-0.5" />
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setSplitMode("manual");
                  setIsRandomRunning(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-serif font-bold transition-all cursor-pointer ${
                  splitMode === "manual"
                    ? "bg-gradient-to-r from-[#9C7026] to-[#C99833] text-[#14100C] shadow-md border border-[#FFE28A]"
                    : "text-[#A89882] hover:text-[#FFF]"
                }`}
                title="Tự tay vuốt hoặc chạm trực tiếp vào cọng cỏ trên đài để chọn chính xác điểm phân"
              >
                <span>🖐️</span>
                <span>Chạm Phân Điểm</span>
              </button>
            </div>

            <div className="text-[11px] font-serif text-[#CBB99E] italic">
              {splitMode === "random" ? (
                isRandomRunning ? (
                  <span className="text-[#FFE28A] flex items-center gap-1.5 animate-pulse">
                    <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                    Vận khí đang chạy ngẫu nhiên... Chạm vào đài để dừng!
                  </span>
                ) : (
                  <span className="text-emerald-300">
                    ✓ Đã dừng ngẫu nhiên! Bấm xác nhận hoặc chạm để chạy tiếp.
                  </span>
                )
              ) : (
                <span className="text-[#CBB99E]">
                  ✦ Chạm hoặc vuốt trên bó cỏ thi để tự tay định đoạt điểm phân Trời - Đất
                </span>
              )}
            </div>
          </div>

          {/* Live Stalk Split Indicator Bar */}
          <div className="grid grid-cols-2 gap-2 text-center text-xs font-serif">
            <div
              className={`p-2.5 rounded-xl border text-sky-200 shadow transition-all ${
                splitMode === "random" && isRandomRunning
                  ? "bg-[#1F1710] border-sky-400/80 ring-1 ring-sky-400/40 shadow-[0_0_15px_rgba(56,189,248,0.2)]"
                  : "bg-[#1C160F] border-sky-800/40"
              }`}
            >
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-[10px] text-sky-400 font-mono">BÓ TRÁI (TƯỢNG TRỜI - THIÊN)</span>
                {splitMode === "random" && isRandomRunning && (
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                )}
              </div>
              <span className="text-base sm:text-xl font-mono font-bold text-[#FFE28A] transition-all">
                {leftInitial} cọng
              </span>
            </div>

            <div
              className={`p-2.5 rounded-xl border text-amber-200 shadow transition-all ${
                splitMode === "random" && isRandomRunning
                  ? "bg-[#1F1710] border-amber-400/80 ring-1 ring-amber-400/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                  : "bg-[#1C160F] border-amber-800/40"
              }`}
            >
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-[10px] text-amber-400 font-mono">BÓ PHẢI (TƯỢNG ĐẤT - ĐỊA)</span>
                {splitMode === "random" && isRandomRunning && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                )}
              </div>
              <span className="text-base sm:text-xl font-mono font-bold text-[#FFE28A] transition-all">
                {rightInitial} cọng
              </span>
            </div>
          </div>

          {/* Interactive Stalks Display Fan / Bundle */}
          <div
            ref={containerRef}
            onPointerMove={handlePointerMove}
            onPointerLeave={() => setIsHovering(false)}
            onClick={handleBoardClick}
            className={`relative w-full h-36 sm:h-44 bg-gradient-to-b from-[#1E1710] to-[#120D08] border-2 rounded-2xl p-2 sm:p-4 select-none cursor-pointer transition-all overflow-hidden flex items-end justify-center shadow-xl ${
              splitMode === "random" && isRandomRunning
                ? "border-[#D4AF37] shadow-[0_0_25px_rgba(212,175,55,0.4)] animate-pulse"
                : "border-[#5A4126] hover:border-[#D4AF37]"
            }`}
            title={
              splitMode === "random"
                ? isRandomRunning
                  ? "Chạm vào đây để DỪNG ngẫu nhiên!"
                  : "Chạm để xác nhận hoặc khởi động lại"
                : "Chạm vào bất kỳ cọng cỏ thi nào để chọn điểm phân chia Thiên - Địa"
            }
          >
            {/* Stalks Array */}
            <div className="relative z-10 w-full flex items-end justify-center gap-0.5 sm:gap-1 h-28 sm:h-36 pointer-events-none">
              {Array.from({ length: stalksCount }).map((_, idx) => {
                const isLeftGroup = idx < leftInitial;
                const isSplitPoint = idx === leftInitial - 1;
                return (
                  <div
                    key={idx}
                    className={`flex-1 max-w-[8px] sm:max-w-[10px] h-full rounded-t-full transition-all duration-100 relative ${
                      isHovering && isLeftGroup
                        ? "bg-gradient-to-t from-[#6E4E20] via-sky-300 to-[#FFF0B0] -translate-y-2 shadow-[0_0_6px_rgba(56,189,248,0.5)]"
                        : isHovering
                        ? "bg-gradient-to-t from-[#6E4E20] via-amber-300 to-[#FFF0B0] -translate-y-1 shadow-[0_0_6px_rgba(245,158,11,0.5)]"
                        : isLeftGroup
                        ? "bg-gradient-to-t from-[#523814] via-[#D4AF37] to-[#FFF0B0]"
                        : "bg-gradient-to-t from-[#422D12] via-[#C59B35] to-[#FFE8A3]"
                    }`}
                    style={{
                      height: `${75 + Math.sin((idx / stalksCount) * Math.PI) * 25}%`,
                    }}
                  >
                    <div className="absolute top-1/4 left-0 right-0 h-0.5 bg-[#422B10]" />
                    <div className="absolute top-2/3 left-0 right-0 h-0.5 bg-[#422B10]" />
                    {isSplitPoint && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#FFE28A] shadow-[0_0_10px_#FFE28A] animate-ping" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Golden Cut Divider Blade */}
            <div
              className="absolute top-0 bottom-0 pointer-events-none flex flex-col items-center z-20 transition-all duration-75"
              style={{
                left: `${(leftInitial / stalksCount) * 100}%`,
                transform: "translateX(-50%)",
              }}
            >
              <div className="px-2 py-0.5 rounded-full bg-[#2A1D0E] border border-[#FFE28A] text-[#FFE28A] font-mono text-[9px] font-bold shadow-lg whitespace-nowrap -mt-1">
                {splitMode === "random" && isRandomRunning ? "⚡ Luân Chuyển..." : "Điểm Phân ➔"}
              </div>
              <div className="w-0.5 h-full bg-gradient-to-b from-[#FFE28A] via-[#D4AF37] to-transparent shadow-[0_0_12px_#FFE28A]" />
            </div>
          </div>

          {/* ACTION BUTTONS IN STEP 1 */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {splitMode === "random" ? (
              isRandomRunning ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsRandomRunning(false);
                    zenAudio.playCardDrawSound();
                  }}
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#9C7026] via-[#E2B755] to-[#9C7026] hover:brightness-115 active:scale-95 text-[#14100C] font-bold font-serif text-sm sm:text-base rounded-2xl shadow-[0_0_30px_rgba(212,175,55,0.6)] transition-all flex items-center justify-center gap-2.5 cursor-pointer animate-pulse"
                >
                  <Sparkles className="w-5 h-5 text-[#14100C] animate-spin" />
                  <span>
                    ⚡ Chạm Dừng Ngẫu Nhiên (Trời: {leftInitial} • Đất: {rightInitial} Cọng)
                  </span>
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto justify-center">
                  <button
                    type="button"
                    onClick={handleConfirmSplit}
                    className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-600 via-amber-400 to-emerald-600 hover:brightness-110 active:scale-95 text-[#111] font-bold font-serif text-sm sm:text-base rounded-2xl shadow-[0_0_25px_rgba(52,211,153,0.4)] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#111]" />
                    <span>
                      ✦ Xác Nhận Điểm Phân (Trời: {leftInitial} • Đất: {rightInitial}) ➔ Bước 2
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsRandomRunning(true);
                      zenAudio.playYarrowStalkRustle();
                    }}
                    className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-xs font-serif bg-[#241A12] hover:bg-[#342417] text-[#FFE28A] border border-[#523A21] cursor-pointer shadow active:scale-95"
                    title="Tiếp tục để số cọng chạy ngẫu nhiên"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Chạy tiếp ngẫu nhiên</span>
                  </button>
                </div>
              )
            ) : (
              <button
                type="button"
                onClick={handleConfirmSplit}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#9C7026] via-[#E2B755] to-[#9C7026] hover:brightness-115 active:scale-95 text-[#14100C] font-bold font-serif text-sm sm:text-base rounded-2xl shadow-[0_0_25px_rgba(212,175,55,0.45)] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#14100C]" />
                <span>
                  ✦ Xác Nhận Phân Điểm Đã Chọn (Trời: {leftInitial} • Đất: {rightInitial} Cọng)
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 4. STEP 2: QUẢI NHẤT (TREO 1 CỌNG TƯỢNG NHÂN) */}
      {ritualPhase === "quai_nhat" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="p-3.5 bg-[#1C150E] border border-[#523A20] rounded-xl text-xs sm:text-sm font-serif text-[#DECAB0] space-y-2">
            <div className="flex items-center gap-2 text-[#FFE28A] font-bold">
              <span className="text-base">🌾</span>
              <span>Bước 2: Quải Nhất Dĩ Tượng Tam Tài (掛一象三)</span>
            </div>
            <p className="text-[#AFA18E] text-xs leading-relaxed">
              Trời và Đất đã phân định ({leftInitial} cọng và {rightInitial} cọng). Giờ đây người chiêm quẻ tự tay rút <strong>1 cọng từ Bó Phải (Đất)</strong> kẹp riêng tượng cho <strong>Con Người (Nhân)</strong>, hòa cùng Trời Đất lập thành Tam Tài (Thiên - Địa - Nhân).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
            <div className="bg-[#15100B] border border-sky-800/40 p-3 rounded-xl">
              <span className="text-[10px] text-sky-400 block font-mono">BÓ TRÁI (THIÊN)</span>
              <span className="text-lg font-mono font-bold text-[#FFE28A]">{leftInitial} cọng</span>
            </div>
            <div className="bg-[#24170E] border border-[#D4AF37] p-3 rounded-xl shadow-lg ring-1 ring-[#D4AF37]/40">
              <span className="text-[10px] text-[#FFE28A] block font-mono">KHAY NHÂN (TAM TÀI)</span>
              <span className="text-lg font-mono font-bold text-emerald-400 animate-pulse">1 cọng</span>
            </div>
            <div className="bg-[#15100B] border border-amber-800/40 p-3 rounded-xl">
              <span className="text-[10px] text-amber-400 block font-mono">BÓ PHẢI (ĐỊA - SAU KHI BỚT 1)</span>
              <span className="text-lg font-mono font-bold text-[#FFE28A]">{rightInitial - 1} cọng</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={handleQuaiNhat}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#9C7026] via-[#E2B755] to-[#9C7026] hover:brightness-115 active:scale-95 text-[#14100C] font-bold font-serif text-sm sm:text-base rounded-2xl shadow-[0_0_25px_rgba(212,175,55,0.45)] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#14100C]" />
              <span>✦ Bước 2: Tự Tay Rút 1 Cọng Tượng Nhân (Tam Tài)</span>
            </button>
            <button
              type="button"
              onClick={handleRestartBian}
              className="px-3 py-2 text-xs text-[#A89882] hover:text-[#FFF] font-serif transition-colors cursor-pointer"
            >
              Phân chia lại
            </button>
          </div>
        </div>
      )}

      {/* 5. STEP 3: TỰ TAY RÚT TỪNG 4 CÂY CỎ BÓ TRÁI (THIÊN) */}
      {ritualPhase === "count_left" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="p-3 bg-[#17110B] border border-sky-800/40 rounded-xl flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-sky-300 font-serif font-bold text-xs sm:text-sm">
                <span>🌾</span>
                <span>Bước 3: Tự Tay Rút Từng 4 Cây Cỏ (Bó Trái - Tượng Trời)</span>
              </div>
              <p className="text-[11px] text-[#A69781] font-serif mt-0.5">
                Đới chi dĩ tứ dĩ tượng Tứ Thời (揲四象四時): Người chiêm bấm để rút từng nhóm 4 cọng (Xuân - Hạ - Thu - Đông)
              </p>
            </div>
            <div className="shrink-0 text-right font-mono">
              <span className="text-[10px] text-sky-400 block">BÓ TRÁI CÒN</span>
              <span className="text-xl font-bold text-[#FFE28A]">{leftRemaining} cọng</span>
            </div>
          </div>

          {/* Trays of 4s (Khay Tứ Thời Bó Trái) */}
          <div className="bg-[#120D08] border border-[#3E2C1A] rounded-xl p-3 min-h-[100px]">
            <div className="flex items-center justify-between text-xs font-serif text-[#A89882] mb-2">
              <span>Khay Tứ Thời (Các nhóm 4 cọng Bó Trái đã rút):</span>
              <span className="font-mono text-[#D4AF37] font-bold">
                Đã rút {leftGroupsPulled} nhóm ({leftGroupsPulled * 4} cọng)
              </span>
            </div>

            {leftGroupsPulled === 0 ? (
              <div className="h-16 flex items-center justify-center text-xs font-serif italic text-[#726250]">
                Chưa rút nhóm nào. Hãy bấm nút vàng bên dưới để tự tay rút từng 4 cọng!
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: leftGroupsPulled }).map((_, gIdx) => {
                  const season = SEASONS[gIdx % 4];
                  return (
                    <motion.div
                      key={gIdx}
                      initial={{ scale: 0.5, y: -10, opacity: 0 }}
                      animate={{ scale: 1, y: 0, opacity: 1 }}
                      className={`px-3 py-1.5 rounded-lg bg-[#20150C] border ${season.border} flex items-center gap-2 shadow`}
                    >
                      <div className="flex items-center gap-0.5">
                        {[0, 1, 2, 3].map((s) => (
                          <div
                            key={s}
                            className="w-1 h-5 bg-gradient-to-t from-[#7A501C] via-[#E2B755] to-[#FFF0B8] rounded-full"
                          />
                        ))}
                      </div>
                      <div className="text-[10px] font-mono leading-none">
                        <span className={`block font-bold ${season.color}`}>{season.tag}</span>
                        <span className="text-[9px] text-[#A89882]">4 cọng</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Interactive Pull Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {leftRemaining > 4 ? (
              <>
                <button
                  type="button"
                  onClick={handlePullFourLeft}
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#9C7026] via-[#E2B755] to-[#9C7026] hover:brightness-115 active:scale-95 text-[#14100C] font-bold font-serif text-sm sm:text-base rounded-2xl shadow-[0_0_25px_rgba(212,175,55,0.45)] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <Layers className="w-4 h-4 text-[#14100C]" />
                  <span>
                    🌾 Tự Tay Rút 4 Cây Cỏ ({SEASONS[leftGroupsPulled % 4].tag}) • Còn {leftRemaining} Cọng
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleFastForwardLeft}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-serif bg-[#241A12] hover:bg-[#342417] text-[#FFE28A] border border-[#523A21] cursor-pointer shadow active:scale-95"
                  title="Rút nhanh toàn bộ các nhóm 4 cọng của Bó Trái"
                >
                  <Zap className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Rút nhanh Bó Trái</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleFinishLeftAndMoveToRight}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-600 via-amber-400 to-emerald-600 hover:brightness-110 active:scale-95 text-[#111] font-bold font-serif text-sm sm:text-base rounded-2xl shadow-[0_0_25px_rgba(52,211,153,0.4)] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-[#111]" />
                <span>
                  ✦ Bó Trái Dư {expectedLeftRemainder} Cọng ➔ Đưa Vào Khay Nhuận & Rút Bó Phải
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 6. STEP 4: TỰ TAY RÚT TỪNG 4 CÂY CỎ BÓ PHẢI (ĐỊA) */}
      {ritualPhase === "count_right" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="p-3 bg-[#17110B] border border-amber-800/40 rounded-xl flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-amber-300 font-serif font-bold text-xs sm:text-sm">
                <span>🌾</span>
                <span>Bước 4: Tự Tay Rút Từng 4 Cây Cỏ (Bó Phải - Tượng Đất)</span>
              </div>
              <p className="text-[11px] text-[#A69781] font-serif mt-0.5">
                Đới chi dĩ tứ dĩ tượng Tứ Thời: Tiếp tục rút từng 4 cọng ở Bó Phải cho đến khi còn lại số dư
              </p>
            </div>
            <div className="shrink-0 text-right font-mono">
              <span className="text-[10px] text-amber-400 block">BÓ PHẢI CÒN</span>
              <span className="text-xl font-bold text-[#FFE28A]">{rightRemaining} cọng</span>
            </div>
          </div>

          {/* Trays of 4s (Khay Tứ Thời Bó Phải) */}
          <div className="bg-[#120D08] border border-[#3E2C1A] rounded-xl p-3 min-h-[100px]">
            <div className="flex items-center justify-between text-xs font-serif text-[#A89882] mb-2">
              <span>Khay Tứ Thời (Các nhóm 4 cọng Bó Phải đã rút):</span>
              <span className="font-mono text-[#D4AF37] font-bold">
                Đã rút {rightGroupsPulled} nhóm ({rightGroupsPulled * 4} cọng)
              </span>
            </div>

            {rightGroupsPulled === 0 ? (
              <div className="h-16 flex items-center justify-center text-xs font-serif italic text-[#726250]">
                Chưa rút nhóm nào ở Bó Phải. Bấm nút vàng để rút từng 4 cọng!
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: rightGroupsPulled }).map((_, gIdx) => {
                  const season = SEASONS[gIdx % 4];
                  return (
                    <motion.div
                      key={gIdx}
                      initial={{ scale: 0.5, y: -10, opacity: 0 }}
                      animate={{ scale: 1, y: 0, opacity: 1 }}
                      className={`px-3 py-1.5 rounded-lg bg-[#20150C] border ${season.border} flex items-center gap-2 shadow`}
                    >
                      <div className="flex items-center gap-0.5">
                        {[0, 1, 2, 3].map((s) => (
                          <div
                            key={s}
                            className="w-1 h-5 bg-gradient-to-t from-[#7A501C] via-[#E2B755] to-[#FFF0B8] rounded-full"
                          />
                        ))}
                      </div>
                      <div className="text-[10px] font-mono leading-none">
                        <span className={`block font-bold ${season.color}`}>{season.tag}</span>
                        <span className="text-[9px] text-[#A89882]">4 cọng</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Interactive Pull Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {rightRemaining > 4 ? (
              <>
                <button
                  type="button"
                  onClick={handlePullFourRight}
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#9C7026] via-[#E2B755] to-[#9C7026] hover:brightness-115 active:scale-95 text-[#14100C] font-bold font-serif text-sm sm:text-base rounded-2xl shadow-[0_0_25px_rgba(212,175,55,0.45)] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <Layers className="w-4 h-4 text-[#14100C]" />
                  <span>
                    🌾 Tự Tay Rút 4 Cây Cỏ ({SEASONS[rightGroupsPulled % 4].tag}) • Còn {rightRemaining} Cọng
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleFastForwardRight}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-serif bg-[#241A12] hover:bg-[#342417] text-[#FFE28A] border border-[#523A21] cursor-pointer shadow active:scale-95"
                  title="Rút nhanh toàn bộ các nhóm 4 cọng của Bó Phải"
                >
                  <Zap className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Rút nhanh Bó Phải</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleFinishRightAndMoveToSummary}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-600 via-amber-400 to-emerald-600 hover:brightness-110 active:scale-95 text-[#111] font-bold font-serif text-sm sm:text-base rounded-2xl shadow-[0_0_25px_rgba(52,211,153,0.4)] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-[#111]" />
                <span>
                  ✦ Bó Phải Dư {expectedRightRemainder} Cọng ➔ Đưa Vào Khay Nhuận & Xem Kết Quả
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 7. STEP 5: SUMMARY (GOM CỌNG NHUẬN & XÁC NHẬN BIẾN) */}
      {ritualPhase === "summary" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="p-3.5 bg-[#1B140D] border border-[#6A4621] rounded-xl text-xs sm:text-sm font-serif text-[#DECAB0] space-y-2">
            <div className="flex items-center justify-between text-[#FFE28A] font-bold border-b border-[#3D2916] pb-1.5">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Kết Quả Tự Tay Rút Biến {currentBianStep}/3 • Hào {currentLineIndex}
              </span>
              <span className="font-mono text-[#D4AF37]">
                Gom {totalRemoved} cọng • Còn {remainingAfterBian} cọng
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1.5 text-xs">
              <div className="bg-[#120B06] p-2.5 rounded-lg border border-sky-900/40">
                <span className="text-[10px] text-sky-400 block font-mono">BÓ TRÁI (THIÊN)</span>
                <p className="text-sky-200 mt-0.5">
                  Khởi đầu {leftInitial} cọng ➔ rút {leftGroupsPulled} nhóm 4, dư{" "}
                  <strong className="text-[#FFE28A]">{expectedLeftRemainder} cọng</strong>
                </p>
              </div>

              <div className="bg-[#120B06] p-2.5 rounded-lg border border-amber-900/40">
                <span className="text-[10px] text-amber-400 block font-mono">BÓ PHẢI (ĐỊA)</span>
                <p className="text-amber-200 mt-0.5">
                  Bớt 1 Nhân, còn {rightInitial - 1} ➔ rút {rightGroupsPulled} nhóm 4, dư{" "}
                  <strong className="text-[#FFE28A]">{expectedRightRemainder} cọng</strong>
                </p>
              </div>

              <div className="bg-[#181F10] p-2.5 rounded-lg border border-emerald-800/60">
                <span className="text-[10px] text-emerald-400 block font-mono">KHAY NHUẬN (GOM DƯ)</span>
                <p className="text-emerald-200 mt-0.5">
                  1 (Nhân) + {expectedLeftRemainder} + {expectedRightRemainder} ={" "}
                  <strong className="text-emerald-300 font-bold">{totalRemoved} cọng</strong>
                </p>
              </div>
            </div>

            <div className="pt-1 text-[11px] text-[#A69781] italic">
              ✨ Quy luật Chu Dịch: Biến 1 luôn gom 5 hoặc 9 cọng; Biến 2 & 3 luôn gom 4 hoặc 8 cọng. Số cọng còn lại ({remainingAfterBian} cọng) tiếp tục cho biến kế tiếp.
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleCompleteBian}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-600 via-amber-400 to-emerald-600 hover:brightness-110 active:scale-95 text-[#111] font-bold font-serif text-sm sm:text-base rounded-2xl shadow-[0_0_25px_rgba(52,211,153,0.4)] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <span>
                {currentBianStep < 3
                  ? `✦ Chuyển Sang Biến ${currentBianStep + 1}/3 (Còn ${remainingAfterBian} Cọng)`
                  : `✦ Hoàn Tất Hào ${currentLineIndex} (Còn ${remainingAfterBian} Cọng ➔ Chia 4)`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleRestartBian}
              className="flex items-center gap-1.5 px-3 py-2 text-xs text-[#A89882] hover:text-[#FFF] font-serif transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Rút lại biến này</span>
            </button>
          </div>
        </div>
      )}

      {/* 8. RESULT OF LATEST MANUAL DRAW COMPLETED PREVIOUSLY (IF NOT DRAWING CURRENT) */}
      {latestBian && ritualPhase === "split" && (
        <div className="mt-3 p-3 bg-[#1C140D] border border-[#583E22] rounded-xl text-xs font-serif text-[#DECAB0] space-y-1 animate-in fade-in duration-300 shadow-lg">
          <div className="flex items-center justify-between text-[#FFE28A] font-bold border-b border-[#3D2916] pb-1">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Kết Quả Biến {latestBian.bianIndex}/3 Vừa Hoàn Tất:
            </span>
            <span className="font-mono text-[#D4AF37]">
              Gom {latestBian.totalRemoved} cọng • Còn {latestBian.remainingStalks} cọng
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px] text-[#BAA993]">
            <div className="bg-[#140D07] p-2 rounded border border-[#2D1F13]">
              • <strong className="text-sky-300">Bó Trái (Thiên):</strong> {latestBian.leftStalks} cọng ➔ đếm 4 dư <strong className="text-[#FFE28A]">{latestBian.leftRemainder}</strong>
            </div>
            <div className="bg-[#140D07] p-2 rounded border border-[#2D1F13]">
              • <strong className="text-amber-300">Bó Phải (Địa):</strong> {latestBian.rightStalks} cọng ➔ bớt 1 Nhân, đếm 4 dư <strong className="text-[#FFE28A]">{latestBian.rightRemainder}</strong>
            </div>
            <div className="bg-[#140D07] p-2 rounded border border-[#2D1F13]">
              • <strong className="text-emerald-300">Khay Nhuận:</strong> 1 (Nhân) + {latestBian.leftRemainder} + {latestBian.rightRemainder} = <strong className="text-emerald-300">{latestBian.totalRemoved} cọng</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
