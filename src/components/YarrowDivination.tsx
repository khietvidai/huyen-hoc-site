import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  RefreshCw,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Maximize2,
  Minimize2,
  Flame,
  Play,
  Clock,
  AlertCircle,
  X
} from "lucide-react";
import { Hexagram } from "../types";
import { findHexagramByLines, getTransformedHexagram } from "../data/hexagrams";
import { zenAudio } from "../utils/zenAudio";
import { YarrowRitualVisualizer } from "./YarrowRitualVisualizer";
import { InteractiveYarrowBoard } from "./InteractiveYarrowBoard";

interface YarrowDivinationProps {
  onComplete: (primary: Hexagram, changingLines: number[], transformed?: Hexagram, summary?: string) => void;
  onReset: () => void;
}

export interface BianDetail {
  bianIndex: 1 | 2 | 3;
  initialStalks: number;
  leftStalks: number;
  rightStalks: number;
  suspended: 1;
  leftRemainder: number;
  rightRemainder: number;
  totalRemoved: number; // 5 or 9 for biến 1; 4 or 8 for biến 2 & 3
  remainingStalks: number;
}

export interface YarrowLineResult {
  lineIndex: number; // 1 to 6
  bians: [BianDetail, BianDetail, BianDetail];
  finalStalks: number; // 24, 28, 32, 36
  groupsOfFour: number; // 6, 7, 8, 9
  isYang: boolean; // 7, 9
  isChanging: boolean; // 6, 9
  name: string; // Lão Âm, Thiếu Dương, Thiếu Âm, Lão Dương
}

// Classical Yarrow single change calculation - directly split by the querent's own hands
export function calculateUserBian(
  initialStalks: number,
  bianIndex: 1 | 2 | 3,
  userSplitLeft?: number
): BianDetail {
  const minPerSide = Math.max(4, Math.floor(initialStalks * 0.15));
  const maxPerSide = initialStalks - minPerSide;
  const clampedLeft =
    userSplitLeft !== undefined && userSplitLeft >= minPerSide && userSplitLeft <= maxPerSide
      ? userSplitLeft
      : Math.max(minPerSide, Math.min(maxPerSide, Math.round(initialStalks / 2)));
  const leftStalks = clampedLeft;
  const rightStalks = initialStalks - leftStalks;

  const rightWithoutSuspended = rightStalks - 1;

  const leftRemainder = leftStalks % 4 === 0 ? 4 : leftStalks % 4;
  const rightRemainder = rightWithoutSuspended % 4 === 0 ? 4 : rightWithoutSuspended % 4;

  const totalRemoved = 1 + leftRemainder + rightRemainder;
  const remainingStalks = initialStalks - totalRemoved;

  return {
    bianIndex,
    initialStalks,
    leftStalks,
    rightStalks,
    suspended: 1,
    leftRemainder,
    rightRemainder,
    totalRemoved,
    remainingStalks,
  };
}

export const simulateSingleBian = calculateUserBian;

export interface YarrowStage {
  id: "taiji" | "split" | "trinity" | "count_four" | "remainder";
  stageRatio: number;
  title: string;
  hanTu: string;
  description: string;
}

export const YARROW_STAGES_BASE: YarrowStage[] = [
  {
    id: "taiji",
    stageRatio: 0.2,
    title: "Cất 1 Cọng Thái Cực",
    hanTu: "掛一歸大衍",
    description: "Đại Diễn 50 cọng, cất riêng 1 cọng Thái Cực bất biến. Cầm 49 cọng định tâm khởi phát...",
  },
  {
    id: "split",
    stageRatio: 0.4,
    title: "Phân Làm Hai (Lưỡng Nghi)",
    hanTu: "分二象兩",
    description: "Chính tay người chiêm phân thành 2 bó Trái & Phải tượng Trời và Đất (Thiên - Địa) giao cảm...",
  },
  {
    id: "trinity",
    stageRatio: 0.6,
    title: "Treo 1 Cọng (Tam Tài)",
    hanTu: "掛一象三",
    description: "Rút 1 cọng từ bó Phải kẹp vào kẽ ngón út tượng cho Con Người, hợp cùng Trời Đất thành Tam Tài...",
  },
  {
    id: "count_four",
    stageRatio: 0.8,
    title: "Đếm Từng Bốn (Tứ Thời)",
    hanTu: "揲四象四時",
    description: "Lần lượt đếm từng 4 cọng tượng cho bốn mùa Xuân Hạ Thu Đông, tìm số cọng dư thừa...",
  },
  {
    id: "remainder",
    stageRatio: 1.0,
    title: "Gom Dư Tượng Nhuận & Định Hào",
    hanTu: "歸奇於扐象閏",
    description: "Gom cọng kẹp ngón út cùng các cọng dư tượng tháng Nhuận. Số cọng còn lại chuyển sang biến kế tiếp...",
  },
];

export const YarrowDivination: React.FC<YarrowDivinationProps> = ({
  onComplete,
  onReset,
}) => {
  const [history, setHistory] = useState<YarrowLineResult[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState<number>(1);
  const [currentBianStep, setCurrentBianStep] = useState<1 | 2 | 3>(1);
  const [currentStalksInHand, setCurrentStalksInHand] = useState<number>(49);
  const [activeBiansInCurrentLine, setActiveBiansInCurrentLine] = useState<BianDetail[]>([]);
  const [isWorking, setIsWorking] = useState<boolean>(false);
  const [showTheoryModal, setShowTheoryModal] = useState<boolean>(false);

  // Dedicated full immersion animation modal state
  const [isDedicatedModalOpen, setIsDedicatedModalOpen] = useState(false);
  const [autoOpenModal, setAutoOpenModal] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("iching_auto_open_yarrow_modal");
      return saved !== null ? saved === "true" : true;
    } catch {
      return true;
    }
  });

  // Ritual duration speed: "fast" (4.5s) for smooth personal drawing, "full" (60s) for traditional deep meditation
  const [ritualSpeed, setRitualSpeed] = useState<"fast" | "full">("fast");
  const totalRitualDuration = ritualSpeed === "fast" ? 4.5 : 60.0;

  // Ritual timers & pending state
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const timerRef = useRef<any>(null);
  const soundTimerRef = useRef<any>(null);
  const pendingActionRef = useRef<(() => void) | null>(null);

  const isFinished = history.length === 6;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (soundTimerRef.current) clearInterval(soundTimerRef.current);
    };
  }, []);

  const toggleAutoOpenModal = () => {
    setAutoOpenModal((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("iching_auto_open_yarrow_modal", String(next));
      } catch {}
      return next;
    });
  };

  const currentStageIndex = (() => {
    if (!isWorking) return 0;
    const ratio = Math.min(0.999, Math.max(0, elapsedSec / totalRitualDuration));
    return Math.min(4, Math.floor(ratio * 5));
  })();
  const currentStage = YARROW_STAGES_BASE[currentStageIndex];

  // Complete whole hexagram resolution
  const handleProceedToInterpretation = () => {
    if (history.length !== 6) return;

    const rawLines = history.map((h) => (h.isYang ? 1 : 0)) as [
      number,
      number,
      number,
      number,
      number,
      number
    ];
    const changingLines = history
      .filter((h) => h.isChanging)
      .map((h) => h.lineIndex);

    const primaryHex = findHexagramByLines(rawLines);
    const transformedHex = getTransformedHexagram(primaryHex, changingLines);

    let summary =
      `Chiêm Bặc Bằng 50 Cọng Cỏ Thi (Đại Diễn): Quẻ #${primaryHex.number} ${primaryHex.name}` +
      (transformedHex
        ? ` ➔ Biến Quẻ #${transformedHex.number} ${transformedHex.name}`
        : "");
    if (primaryHex.number === 1 && changingLines.length === 6) {
      summary += ` (Động cả 6 hào ➔ Dụng Cửu: Kiến quần long vô thủ, cát)`;
    } else if (primaryHex.number === 2 && changingLines.length === 6) {
      summary += ` (Động cả 6 hào ➔ Dụng Lục: Lợi vĩnh trinh)`;
    }

    zenAudio.strikeSingingBowl(324, 0.75);
    setIsDedicatedModalOpen(false);
    onComplete(primaryHex, changingLines, transformedHex, summary);
  };

  // Skip wait and finish current ritual stage immediately
  const finishRitualImmediately = () => {
    if (!isWorking || !pendingActionRef.current) return;
    if (timerRef.current) clearInterval(timerRef.current);
    if (soundTimerRef.current) clearInterval(soundTimerRef.current);
    setIsWorking(false);
    setElapsedSec(0);
    const action = pendingActionRef.current;
    pendingActionRef.current = null;
    action();
  };

  // Helper to start the sacred ritual countdown
  const startRitualCountdown = (onFinish: () => void) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (soundTimerRef.current) clearInterval(soundTimerRef.current);

    pendingActionRef.current = onFinish;
    setIsWorking(true);
    setElapsedSec(0);

    if (autoOpenModal) {
      setIsDedicatedModalOpen(true);
    }

    // Sacred singing bowl chime & bamboo stalk rustle
    zenAudio.strikeSingingBowl(216, 0.5);
    zenAudio.playYarrowStalkRustle();

    const duration = totalRitualDuration;
    const startTime = Date.now();
    let lastSoundStage = -1;

    timerRef.current = setInterval(() => {
      const now = Date.now();
      const diffSec = (now - startTime) / 1000;
      setElapsedSec(diffSec);

      const ratio = Math.min(1, diffSec / duration);
      const stageIdx = Math.floor(ratio * 5);
      if (stageIdx !== lastSoundStage) {
        lastSoundStage = stageIdx;
        if (stageIdx === 1) zenAudio.playCardDrawSound();
        if (stageIdx === 2) zenAudio.playYarrowCountClick(1.2);
        if (stageIdx === 3) zenAudio.playYarrowCountClick(1.0);
        if (stageIdx === 4) zenAudio.strikeSingingBowl(432, 0.6);
      }

      if (diffSec >= duration) {
        clearInterval(timerRef.current);
        if (soundTimerRef.current) clearInterval(soundTimerRef.current);
        setIsWorking(false);
        setElapsedSec(0);
        pendingActionRef.current = null;
        onFinish();
      }
    }, 50);
  };

  // User personally draws stalks by deciding where to split Heaven & Earth and drawing 4-by-4
  const handleUserDrawStalks = (userSplitLeft: number) => {
    if (isWorking || isFinished) return;

    const step = currentBianStep;
    const bian = calculateUserBian(currentStalksInHand, step, userSplitLeft);

    const updatedBians = [...activeBiansInCurrentLine, bian];
    setActiveBiansInCurrentLine(updatedBians);

    if (step < 3) {
      setCurrentBianStep((step + 1) as 2 | 3);
      setCurrentStalksInHand(bian.remainingStalks);
      zenAudio.strikeSingingBowl(324, 0.5);
    } else {
      const finalStalks = bian.remainingStalks;
      const groupsOfFour = finalStalks / 4;
      const isYang = groupsOfFour === 7 || groupsOfFour === 9;
      const isChanging = groupsOfFour === 6 || groupsOfFour === 9;
      const name =
        groupsOfFour === 6
          ? "Lão Âm (Động)"
          : groupsOfFour === 7
          ? "Thiếu Dương (Tĩnh)"
          : groupsOfFour === 8
          ? "Thiếu Âm (Tĩnh)"
          : "Lão Dương (Động)";

      const completedLine: YarrowLineResult = {
        lineIndex: currentLineIndex,
        bians: updatedBians as [BianDetail, BianDetail, BianDetail],
        finalStalks,
        groupsOfFour,
        isYang,
        isChanging,
        name,
      };

      const newHistory = [...history, completedLine];
      setHistory(newHistory);

      if (newHistory.length === 6) {
        zenAudio.strikeSingingBowl(324, 0.75);
      } else {
        setCurrentLineIndex((prev) => prev + 1);
        setCurrentBianStep(1);
        setCurrentStalksInHand(49);
        setActiveBiansInCurrentLine([]);
        zenAudio.strikeSingingBowl(432, 0.6);
      }
    }
  };

  // Fallback next bian method
  const handleNextBian = () => {
    handleUserDrawStalks(Math.round(currentStalksInHand / 2));
  };

  const handleResetInternal = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (soundTimerRef.current) clearInterval(soundTimerRef.current);
    setHistory([]);
    setCurrentLineIndex(1);
    setCurrentBianStep(1);
    setCurrentStalksInHand(49);
    setActiveBiansInCurrentLine([]);
    setIsWorking(false);
    setElapsedSec(0);
    setIsDedicatedModalOpen(false);
    onReset();
  };

  const latestBian = activeBiansInCurrentLine[activeBiansInCurrentLine.length - 1];
  const lastCompletedLine = history.length > 0 ? history[history.length - 1] : null;

  const progressPercent = Math.min(
    100,
    (elapsedSec / totalRitualDuration) * 100
  );
  const remainingSeconds = Math.max(
    0,
    totalRitualDuration - elapsedSec
  ).toFixed(1);

  return (
    <div className="w-full max-w-3xl mx-auto bg-[#16120E] border border-[#483723] rounded-2xl p-4 sm:p-6 shadow-2xl relative">
      {/* Decorative Traditional Border Accent */}
      <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#C9A55A]/60 pointer-events-none" />
      <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#C9A55A]/60 pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#C9A55A]/60 pointer-events-none" />
      <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#C9A55A]/60 pointer-events-none" />

      {/* ========================================================================= */}
      {/* DEDICATED FULL-SCREEN IMMERSION RITUAL OVERLAY MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isDedicatedModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full max-w-4xl bg-gradient-to-b from-[#1C140D] via-[#130E09] to-[#0A0705] border-2 border-[#6D4F28] rounded-2xl sm:rounded-3xl shadow-[0_0_50px_rgba(212,175,55,0.35)] p-4 sm:p-8 relative overflow-hidden my-auto"
            >
              {/* Sacred Temple Background Glow */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[540px] rounded-full border border-[#C9A55A] border-dashed animate-[spin_90s_linear_infinite]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full border border-[#8C6218]" />
              </div>

              {/* Modal Top Control Bar */}
              <div className="flex items-center justify-between border-b border-[#3B2B1B] pb-4 mb-4 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#2B1B0E] border border-[#58391C] flex items-center justify-center text-[#C9A55A] shadow">
                    <span className="text-base">🌾</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9A55A] block">
                      ĐÀI THAO DỊCH • HOẠT ẢNH RIÊNG
                    </span>
                    <h3 className="font-serif font-bold text-base sm:text-lg text-[#F5EAD4]">
                      Đại Diễn Chi Số (50 Cọng Cỏ Thi • 18 Biến Đổi)
                    </h3>
                    <p className="text-[11px] text-[#E6D3A3] font-serif">
                      ⏱ Thời gian gieo quẻ là trên 15 phút • Cần tâm tập trung tuyệt đối
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsDedicatedModalOpen(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-serif bg-[#241A12] hover:bg-[#382618] text-[#A89882] hover:text-[#FFF] border border-[#402C1D] transition-all cursor-pointer shadow active:scale-95"
                    title="Thu nhỏ để xem dạng thẻ thông thường"
                  >
                    <Minimize2 className="w-3.5 h-3.5" />
                    <span>Thu nhỏ</span>
                  </button>
                </div>
              </div>

              {/* Dedicated Altar Stage */}
              <div className="relative z-10 space-y-4">
                {/* 60s Live Countdown Banner */}
                <div className="bg-gradient-to-r from-[#28180B] via-[#331E0D] to-[#201308] border border-[#68411D] rounded-2xl p-4 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-3">
                      <span className={`w-3 h-3 rounded-full ${isWorking ? "bg-[#C9A55A] animate-ping" : "bg-emerald-400"}`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm sm:text-base font-serif font-bold text-[#FFE69A]">
                            {isWorking ? `Giai đoạn: ${currentStage.title}` : (isFinished ? "Đã Hoàn Tất 18 Biến!" : `Sẵn Sàng Phân Cỏ Biến ${currentBianStep}/3 • Hào ${currentLineIndex}`)}
                          </span>
                          {isWorking && (
                            <span className="text-xs font-mono text-[#C9A55A] bg-[#160E07] px-2 py-0.5 rounded border border-[#4A3116]">
                              {currentStage.hanTu}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#CBB89D] font-serif italic mt-0.5">
                          {isWorking
                            ? `“${currentStage.description}”`
                            : isFinished
                            ? "Toàn bộ 18 biến đổi Đại Diễn đã kết thúc. Bấm nút bên dưới để giải nghĩa quẻ!"
                            : latestBian
                            ? `Vừa hoàn tất Biến ${latestBian.bianIndex}: Gom ${latestBian.totalRemoved} cọng, còn lại ${latestBian.remainingStalks} cọng. Bấm 'Gieo Tiếp Tục' để sang bước tiếp theo.`
                            : "Cầm 49 cọng cỏ thi thanh tịnh trong tay, bấm 'Gieo Tiếp Tục' để bắt đầu..."}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <div className="bg-[#140D07] px-3.5 py-1.5 rounded-xl border border-[#4E3217] shadow-inner text-center">
                        <span className="text-[10px] font-mono text-[#A89882] block leading-none">
                          THỜI GIAN
                        </span>
                        <span className="text-base sm:text-lg font-mono font-bold text-[#E6D3A3]">
                          {isWorking ? `⏳ ${remainingSeconds}s` : `${totalRitualDuration}s/biến`}
                        </span>
                      </div>
                      {isWorking && (
                        <button
                          type="button"
                          onClick={finishRitualImmediately}
                          className="px-3 py-1.5 rounded-xl bg-[#3A2210] hover:bg-[#523016] text-[#E6D3A3] text-xs font-serif border border-[#6D421C] cursor-pointer shadow flex items-center gap-1 active:scale-95"
                          title="Bỏ qua chờ đợi, xem kết quả ngay"
                        >
                          <span>Xem ngay</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-[#110A05] rounded-full h-2.5 border border-[#4A3118] overflow-hidden p-0.5">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#8C5D14] via-[#D6B97A] to-[#FFF0B8] rounded-full shadow-[0_0_12px_rgba(226,183,85,0.8)]"
                      style={{ width: isWorking ? `${progressPercent}%` : "100%" }}
                      transition={{ ease: "linear", duration: 0.05 }}
                    />
                  </div>

                  {/* 5 Stages Tracker */}
                  <div className="grid grid-cols-5 gap-1.5 mt-2.5 text-center">
                    {YARROW_STAGES_BASE.map((stg, idx) => {
                      const isPast = isWorking ? currentStageIndex > idx : false;
                      const isCurrent = isWorking && currentStageIndex === idx;
                      return (
                        <div
                          key={stg.id}
                          className={`p-1 rounded text-[10px] font-mono truncate transition-all ${
                            isCurrent
                              ? "bg-[#3D250F] text-[#FFE494] font-bold border border-[#6A431F]"
                              : isPast
                              ? "text-[#8C7A65]"
                              : "text-[#4A3D2F]"
                          }`}
                        >
                          <span>{idx + 1}. {stg.title.split(" ")[0]}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Stalks Division Area in Dedicated Modal */}
                {!isWorking && !isFinished ? (
                  <InteractiveYarrowBoard
                    stalksCount={currentStalksInHand}
                    currentBianStep={currentBianStep}
                    currentLineIndex={currentLineIndex}
                    isDrawing={isWorking}
                    latestBian={latestBian}
                    onDrawStalks={handleUserDrawStalks}
                  />
                ) : (
                  <YarrowRitualVisualizer
                    elapsedSec={elapsedSec}
                    isWorking={isWorking}
                    stageId={currentStage.id}
                    stageTitle={currentStage.title}
                    stageHanTu={currentStage.hanTu}
                    stageDesc={currentStage.description}
                    currentBianStep={currentBianStep}
                    currentLineIndex={currentLineIndex}
                    currentStalksInHand={currentStalksInHand}
                    latestBian={latestBian}
                    isLargeModal={true}
                  />
                )}

                {/* Bottom Actions if finished */}
                {isFinished && (
                  <div className="bg-[#120D08] border border-[#3A2818] rounded-2xl p-4 sm:p-5 shadow-inner text-center">
                    <div className="space-y-3">
                      <div className="bg-[#1C2613] border border-emerald-700/60 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-serif text-emerald-300 inline-flex items-center gap-2 shadow-lg">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Đã hoàn tất 18 biến đổi Đại Diễn!</span>
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={handleProceedToInterpretation}
                          className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-600 via-amber-400 to-emerald-600 hover:brightness-110 active:scale-95 text-[#111] font-bold font-serif text-sm sm:text-base rounded-2xl shadow-[0_0_25px_rgba(52,211,153,0.4)] transition-all flex items-center justify-center gap-2.5 cursor-pointer mx-auto"
                        >
                          <span>Xem Quẻ Đã Bốc</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bottom Hexagram Forging Status */}
                <div className="bg-[#120D08] border border-[#2B1C10] rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-serif text-[#A89882]">Tiến trình quẻ:</span>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5, 6].map((lNum) => {
                        const done = history.find((h) => h.lineIndex === lNum);
                        const isCur = lNum === currentLineIndex && !isFinished;
                        return (
                          <div
                            key={lNum}
                            className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono font-bold transition-all ${
                              done
                                ? "bg-[#382210] text-[#E6D3A3] border border-[#6B421E]"
                                : isCur
                                ? "bg-[#C9A55A] text-[#120F0C] animate-pulse"
                                : "bg-[#18110A] text-[#554231] border border-[#271A0E]"
                            }`}
                            title={`Hào ${lNum}`}
                          >
                            {lNum}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="text-xs font-serif text-[#C9A55A] font-medium">
                    {history.length === 6
                      ? "Đã nạp đủ 6 hào (18 biến) ➔ Sẵn sàng xem quẻ đã bốc!"
                      : `Hào ${currentLineIndex} • Biến ${currentBianStep}/3`}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* STANDARD INLINE CARD VIEW */}
      {/* ========================================================================= */}
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2F2215] pb-4 mb-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#C9A55A] bg-[#261C12] px-2 py-0.5 rounded border border-[#3E2E1D]">
              Chu Dịch Cổ Truyền • Đại Diễn Chi Số
            </span>
            <span className="text-[10px] font-mono font-bold text-[#E6D3A3] bg-[#2B1B0E] border border-[#5A3819] px-2.5 py-0.5 rounded shadow-xs">
              ⏱ Thời gian gieo quẻ là trên 15 phút • Cần tâm tập trung tuyệt đối
            </span>
            <span className="text-[10px] font-mono text-[#A89882] bg-[#1C1712] px-2 py-0.5 rounded">
              60 Giây/Lần Rút Cỏ (18 Biến)
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-serif font-bold text-[#F5EAD4] mt-1 flex items-center gap-2">
            <span>🌾</span> Phép Chiêm Bặc Cỏ Thi (Thao Dịch)
          </h3>
          <p className="text-xs text-[#9E907D] mt-0.5 max-w-xl">
            Phương pháp bốc quẻ nguyên bản thời Chu Văn Vương và Khổng Tử. Dùng 50 cọng cỏ thi, cất 1 cọng Thái Cực, trải qua 18 lần biến đổi (Tam Biến thành 1 hào, Lục hào thành quẻ). <strong className="text-[#E6D3A3]">Thời gian gieo quẻ là trên 15 phút, cần tâm tập trung tuyệt đối</strong>. Hoạt ảnh hành động 60 giây theo từng biến, không rút nhanh.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Button to open dedicated immersion modal */}
          <button
            type="button"
            onClick={() => setIsDedicatedModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#E6D3A3] bg-[#2A1B0E] hover:bg-[#3E2715] rounded-lg border border-[#5C3B1E] transition-all cursor-pointer shadow active:scale-95"
            title="Mở hoạt ảnh riêng toàn màn hình với đài chiêm bặc trang nghiêm"
          >
            <Maximize2 className="w-3.5 h-3.5 text-[#C9A55A]" />
            <span>Mở Hoạt Ảnh Riêng</span>
          </button>

          <button
            type="button"
            onClick={() => setShowTheoryModal(!showTheoryModal)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-[#C9A55A] hover:text-[#FFF] bg-[#22170E] hover:bg-[#302114] rounded-lg border border-[#48341F] transition-all cursor-pointer"
            title="Tìm hiểu triết lý Đại Diễn Chi Số"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Điển tịch</span>
          </button>
          {history.length > 0 && !isWorking && (
            <button
              type="button"
              onClick={handleResetInternal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-[#C8B89E] hover:text-[#FFF] bg-[#241D17] hover:bg-[#34271D] rounded-lg border border-[#3E2E1D] transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Làm lại
            </button>
          )}
        </div>
      </div>

      {/* Divination Ritual Settings Bar */}
      <div className="mb-4 flex items-center justify-between flex-wrap gap-2 bg-[#15100B] border border-[#2E2013] px-3.5 py-2 rounded-xl text-xs font-serif text-[#A89882]">
        <div className="flex items-center gap-2">
          <span>Thời lượng diễn xướng:</span>
          <div className="inline-flex rounded-lg border border-[#3E2C1B] bg-[#110D09] p-0.5">
            <button
              type="button"
              onClick={() => setRitualSpeed("fast")}
              className={`px-2.5 py-0.5 rounded text-[11px] font-serif font-bold transition-all cursor-pointer ${
                ritualSpeed === "fast"
                  ? "bg-[#2E1A0C] text-[#E6D3A3] shadow border border-[#52381A]"
                  : "text-[#756552] hover:text-[#C5B49D]"
              }`}
            >
              Nhanh (4.5s)
            </button>
            <button
              type="button"
              onClick={() => setRitualSpeed("full")}
              className={`px-2.5 py-0.5 rounded text-[11px] font-serif font-bold transition-all cursor-pointer ${
                ritualSpeed === "full"
                  ? "bg-[#2E1A0C] text-[#E6D3A3] shadow border border-[#52381A]"
                  : "text-[#756552] hover:text-[#C5B49D]"
              }`}
            >
              Trầm mặc (60s)
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span>Mở hoạt ảnh riêng:</span>
          <button
            type="button"
            onClick={toggleAutoOpenModal}
            className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold transition-all cursor-pointer border ${
              autoOpenModal
                ? "bg-[#2E1A0C] text-[#E6D3A3] border-[#5A381A]"
                : "bg-[#1C140E] text-[#6E5A47] border-[#312013]"
            }`}
          >
            {autoOpenModal ? "ĐANG BẬT" : "ĐANG TẮT"}
          </button>
        </div>
      </div>

      {/* Expandable Theory Modal / Section */}
      <AnimatePresence>
        {showTheoryModal && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-5 overflow-hidden"
          >
            <div className="bg-[#120E0A] border border-[#3A2A1A] p-4 rounded-xl text-xs font-serif leading-relaxed text-[#D2C3AB] space-y-2.5 shadow-inner">
              <div className="flex items-center justify-between border-b border-[#2B1E12] pb-1.5 text-[#C9A55A] font-bold">
                <span>📖 KHỔNG TỬ • HỆ TỪ THƯỢNG (CHƯƠNG 9):</span>
                <button
                  type="button"
                  onClick={() => setShowTheoryModal(false)}
                  className="text-[#8C7A65] hover:text-[#C9A55A] cursor-pointer"
                >
                  Đóng ✕
                </button>
              </div>
              <p className="italic text-[#E5D2B3]">
                “Đại Diễn chi số ngũ thập, kỳ dụng tứ thập hữu cửu. Phân nhi vi nhị dĩ tượng lưỡng, quái nhất dĩ tượng tam, điệp chi dĩ tứ dĩ tượng tứ thời, quy kỳ vu lặc dĩ tượng nhuận, cố tái lặc nhi hậu quái...”
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] text-[#BFB09A]">
                <div className="bg-[#19130D] p-2 rounded border border-[#2E2013]">
                  <strong className="text-[#C9A55A]">1. Số Đại Diễn 50: </strong>
                  Bỏ riêng 1 cọng tượng trưng cho <strong>Thái Cực</strong> (gốc cội bất biến của vũ trụ). Còn lại 49 cọng để sử dụng vận hành biến hóa.
                </div>
                <div className="bg-[#19130D] p-2 rounded border border-[#2E2013]">
                  <strong className="text-[#C9A55A]">2. Phân làm Hai: </strong>
                  Chia 49 cọng thành bó Trái & Phải tượng trưng cho <strong>Lưỡng Nghi (Trời & Đất)</strong>. Treo 1 cọng tượng cho <strong>Con Người</strong> (Tam Tài: Thiên - Địa - Nhân).
                </div>
                <div className="bg-[#19130D] p-2 rounded border border-[#2E2013]">
                  <strong className="text-[#C9A55A]">3. Đếm từng Bốn: </strong>
                  Đếm từng 4 cọng tượng cho <strong>Tứ Thời (Bốn Mùa)</strong>. Dồn cọng dư kẹp vào kẽ ngón tay tượng cho tháng Nhuận.
                </div>
                <div className="bg-[#19130D] p-2 rounded border border-[#2E2013]">
                  <strong className="text-[#C9A55A]">4. Tam Biến Định Hào: </strong>
                  Sau 3 lần biến đổi, số cọng còn lại chia 4 sẽ ra: <strong>6 (Lão Âm), 7 (Thiếu Dương), 8 (Thiếu Âm), 9 (Lão Dương)</strong>.
                </div>
              </div>

              {/* Trai Giới Mộc Dục Explanation in Yarrow Divination */}
              <div className="border-t border-[#342213] pt-2.5 mt-2.5 space-y-2">
                <span className="text-[#E6D3A3] font-bold block flex items-center gap-1.5 text-[12px]">
                  <span>⛩️</span> PHÁP MÔN TỐI THƯỢNG: TRAI GIỚI MỘC DỤC (齋戒沐浴)
                </span>
                <p className="text-[11px] text-[#CBB99E] leading-relaxed">
                  Cỏ thi là loài linh thảo ngàn năm của Chu triều, hấp thu tinh hoa nhật nguyệt. Phép Đại Diễn 50 cọng cỏ thi với 18 lần biến đổi đòi hỏi trạng thái thân tâm hoàn toàn thanh khiết:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-[#1C140D] p-2.5 rounded-lg border border-[#3E2816]">
                    <strong className="text-[#E6D3A3] block mb-0.5">1. Mộc Dục (沐浴 - Thân Thể Thanh Khiết):</strong>
                    Tắm gội sạch sẽ, rửa sạch đôi bàn tay dưới làn nước mát, súc miệng, mặc y phục tề chỉnh trước khi chạm vào bó cỏ thi. Giữ đôi bàn tay sạch bụi trần để phân chia Thiên - Địa - Nhân.
                  </div>
                  <div className="bg-[#1C140D] p-2.5 rounded-lg border border-[#3E2816]">
                    <strong className="text-[#E6D3A3] block mb-0.5">2. Trai Giới (齋戒 - Tâm Ý Hư Tĩnh):</strong>
                    Kiêng rượu thịt cay nồng, rũ sạch tạp niệm lo toan hay tham vọng vị kỷ. Giữ tâm tĩnh lặng như gương trong để cảm ứng trọn vẹn sự biến chuyển âm dương ("Tịch nhiên bất động, cảm nhi toại thông").
                  </div>
                </div>
                <div className="bg-[#170E08] p-2 rounded-lg border border-[#3B2615] text-[10.5px] text-[#E0CEAF] flex items-center gap-1.5">
                  <span>📜</span>
                  <span><strong>Tứ Bất Bốc:</strong> Bất thành bất bốc (không thành kính không bốc), Bất nghi bất bốc (không băn khoăn không bốc), Phi nghĩa bất bốc (không hỏi việc trái đạo), Độc tắc bất cáo (không bốc đi bốc lại một việc).</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RITUAL LIVE STATUS BANNER (When Working) */}
      {isWorking && (
        <div className="mb-4 bg-gradient-to-r from-[#22180D] via-[#2A1D0E] to-[#1C140B] border border-[#5A4021] rounded-xl p-3.5 shadow-lg animate-energy-ripple">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C9A55A] animate-ping" />
              <span className="text-xs font-serif font-bold text-[#E6D3A3]">
                {currentStage.title}
              </span>
              <span className="text-[10px] font-mono text-[#C8A252] bg-[#160E07] px-1.5 py-0.2 rounded border border-[#3E2A15]">
                {currentStage.hanTu}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-serif text-[#E6D3A3] bg-[#2A1D0E] border border-[#6D4F28] animate-pulse">
                ✨ 50 cọng Đại Diễn cảm ứng
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#F3E2B5]">
                ⏳ {remainingSeconds}s
              </span>
              <button
                type="button"
                onClick={finishRitualImmediately}
                className="px-2.5 py-1 rounded-lg bg-[#3A2210] hover:bg-[#523016] text-[#E6D3A3] text-xs font-serif border border-[#6D421C] cursor-pointer shadow flex items-center gap-1 active:scale-95"
                title="Bỏ qua chờ đợi, xem kết quả ngay"
              >
                <span>Xem ngay</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          <p className="text-[11px] text-[#D8C7B0] font-serif italic mb-2 leading-relaxed">
            “{currentStage.description}”
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-[#140F0A] rounded-full h-2 border border-[#3E2E1D] overflow-hidden p-0.5">
            <motion.div
              className="h-full bg-gradient-to-r from-[#8C6218] via-[#C9A55A] to-[#FFF0A8] rounded-full shadow-[0_0_8px_rgba(212,175,55,0.7)]"
              style={{ width: `${progressPercent}%` }}
              transition={{ ease: "linear", duration: 0.05 }}
            />
          </div>

          {/* 5-Stage Stepper Dots */}
          <div className="grid grid-cols-5 gap-1 mt-2 text-center">
            {YARROW_STAGES_BASE.map((stage, idx) => {
              const isPast = currentStageIndex > idx;
              const isCurrent = currentStageIndex === idx;
              return (
                <div
                  key={stage.id}
                  className={`text-[9px] font-mono truncate transition-colors ${
                    isCurrent
                      ? "text-[#E6D3A3] font-bold"
                      : isPast
                      ? "text-[#8C7A65]"
                      : "text-[#4A3D2F]"
                  }`}
                >
                  <span className="block truncate">{idx + 1}. {stage.title.split(" ")[0]}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Altar / Stalks Division Area */}
      <div className="space-y-4">
        {/* Interactive Stalks Board when ready to draw, or Ritual Visualizer when drawing */}
        {!isWorking && !isFinished ? (
          <InteractiveYarrowBoard
            stalksCount={currentStalksInHand}
            currentBianStep={currentBianStep}
            currentLineIndex={currentLineIndex}
            isDrawing={isWorking}
            latestBian={latestBian}
            onDrawStalks={handleUserDrawStalks}
          />
        ) : (
          <YarrowRitualVisualizer
            elapsedSec={elapsedSec}
            isWorking={isWorking}
            stageId={currentStage.id}
            stageTitle={currentStage.title}
            stageHanTu={currentStage.hanTu}
            stageDesc={currentStage.description}
            currentBianStep={currentBianStep}
            currentLineIndex={currentLineIndex}
            currentStalksInHand={currentStalksInHand}
            latestBian={latestBian}
            isLargeModal={false}
          />
        )}

        {/* Current Line's 3 Bians Progress Bar */}
        <div className="bg-[#110D09] border border-[#261B0F] rounded-xl p-3">
          <div className="flex items-center justify-between text-xs font-serif mb-2">
            <span className="text-[#A89882]">Tiến trình Tam Biến của Hào {currentLineIndex}:</span>
            <span className="font-mono text-[#C9A55A] font-bold">
              {activeBiansInCurrentLine.length}/3 Biến
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((step) => {
              const b = activeBiansInCurrentLine.find((x) => x.bianIndex === step);
              const isCurrent = currentBianStep === step && !isFinished;
              return (
                <div
                  key={step}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    b
                      ? "bg-[#20160D] border-[#523A21] text-[#E5C378]"
                      : isCurrent
                      ? "bg-[#1B130B] border-[#C9A55A] border-dashed text-[#C9A55A] animate-pulse"
                      : "bg-[#140F0A] border-[#24170D] text-[#6A5A48] opacity-50"
                  }`}
                >
                  <div className="text-[10px] font-mono font-bold uppercase">
                    Biến {step}
                  </div>
                  <div className="text-xs font-serif font-medium mt-0.5">
                    {b ? `Gom: ${b.totalRemoved} cọng` : isCurrent ? (isWorking ? `Đang diễn xướng (${remainingSeconds}s)...` : "Chờ bạn rút...") : "Chưa tới"}
                  </div>
                  {b && (
                    <div className="text-[9px] font-mono text-[#A89882] mt-0.5">
                      Còn lại: {b.remainingStalks} cọng
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hexagram 6-Lines Progress Display (From Line 6 down to Line 1) */}
      <div className="mt-5 bg-[#140F0B] border border-[#332415] rounded-xl p-4">
        <div className="flex items-center justify-between mb-3 text-xs text-[#9E907D]">
          <span className="font-serif">Tiến trình lập quẻ (Xếp từ Sơ Hào lên Thượng Hào):</span>
          <span className="font-mono text-[#C9A55A] font-bold">{history.length}/6 Hào</span>
        </div>

        <div className="space-y-2">
          {[6, 5, 4, 3, 2, 1].map((lineNum) => {
            const result = history.find((h) => h.lineIndex === lineNum);
            const isCurrent = lineNum === currentLineIndex && !isFinished;

            return (
              <div
                key={lineNum}
                className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                  result
                    ? "bg-[#1F1710] border-[#44301D]"
                    : isCurrent
                    ? "bg-[#1C140D] border-[#C9A55A]/50 border-dashed"
                    : "bg-[#120E0A] border-transparent opacity-40"
                }`}
              >
                {/* Line title & value */}
                <div className="flex items-center gap-2 w-32 shrink-0">
                  <span className="text-xs font-mono font-bold text-[#C8B89E]">
                    {lineNum === 1 ? "Sơ Hào" : lineNum === 6 ? "Thượng Hào" : `Hào ${lineNum}`}
                  </span>
                  {result && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                        result.isChanging
                          ? "bg-red-950/80 text-rose-300 border border-red-700/60"
                          : "bg-[#291C11] text-[#E0B861] border border-[#3D2B19]"
                      }`}
                    >
                      {result.groupsOfFour} ({result.finalStalks} cọng)
                    </span>
                  )}
                </div>

                {/* Classical Line Graphic Representation */}
                <div className="flex-1 mx-3 max-w-[220px]">
                  {result ? (
                    result.isYang ? (
                      /* Hào Dương: Liền */
                      <div
                        className={`h-3 rounded-xs transition-all ${
                          result.isChanging
                            ? "bg-gradient-to-r from-[#C9A55A] via-rose-500 to-[#C9A55A] shadow-[0_0_8px_rgba(244,63,94,0.4)]"
                            : "bg-[#C89B3C]"
                        }`}
                      />
                    ) : (
                      /* Hào Âm: Đứt */
                      <div className="flex justify-between h-3">
                        <div
                          className={`w-[44%] rounded-xs ${
                            result.isChanging
                              ? "bg-gradient-to-r from-[#C9A55A] to-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]"
                              : "bg-[#8C7A63]"
                          }`}
                        />
                        <div
                          className={`w-[44%] rounded-xs ${
                            result.isChanging
                              ? "bg-gradient-to-r from-rose-500 to-[#C9A55A] shadow-[0_0_8px_rgba(244,63,94,0.4)]"
                              : "bg-[#8C7A63]"
                          }`}
                        />
                      </div>
                    )
                  ) : (
                    <div className="h-3 bg-[#1C150E] rounded-xs border border-dashed border-[#3D2C1B]" />
                  )}
                </div>

                {/* Line Status & Name */}
                <div className="text-right text-xs w-36 shrink-0">
                  {result ? (
                    <span
                      className={`font-serif ${
                        result.isChanging
                          ? "text-rose-400 font-bold"
                          : "text-[#D2C3AB]"
                      }`}
                    >
                      {result.name}
                    </span>
                  ) : isCurrent ? (
                    <span className="text-xs text-[#C9A55A] font-serif animate-pulse">
                      {isWorking ? `Đang diễn xướng (${remainingSeconds}s)...` : "Chờ bạn phân cỏ..."}
                    </span>
                  ) : (
                    <span className="text-xs text-[#5C4D3B] font-serif">Chưa gieo</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Area when Finished or Working */}
      {isWorking && (
        <div className="mt-4 flex items-center justify-center">
          <button
            type="button"
            onClick={finishRitualImmediately}
            className="px-5 py-2.5 rounded-xl bg-[#2A1B0E] hover:bg-[#3D2615] text-[#E6D3A3] text-xs font-serif font-bold border border-[#6B4723] cursor-pointer shadow-lg flex items-center gap-2 active:scale-95"
          >
            <span>Bỏ qua chờ đợi • Xem kết quả ngay</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {isFinished && (
        <div className="mt-5 p-4 bg-[#1B2213] border border-emerald-800/60 rounded-xl text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-emerald-400 font-serif font-bold text-sm sm:text-base">
            <CheckCircle2 className="w-4 h-4" />
            <span>Đã hoàn tất đủ 18 biến đổi Đại Diễn!</span>
          </div>
          <button
            type="button"
            onClick={handleProceedToInterpretation}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 via-amber-400 to-emerald-600 text-[#111] font-serif font-bold rounded-xl shadow-lg transition-all cursor-pointer hover:brightness-110"
          >
            Xem Quẻ Đã Bốc ➔
          </button>
        </div>
      )}
    </div>
  );
};
