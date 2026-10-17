import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Coins,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Maximize2,
  Minimize2,
  Flame,
  ArrowRight,
  Play,
  Clock,
  AlertCircle,
  X
} from "lucide-react";
import { Hexagram } from "../types";
import { findHexagramByLines, getTransformedHexagram } from "../data/hexagrams";
import { zenAudio } from "../utils/zenAudio";

interface CoinTossProps {
  onComplete: (primary: Hexagram, changingLines: number[], transformed?: Hexagram, summary?: string) => void;
  onReset: () => void;
}

interface TossResult {
  lineIndex: number; // 1 to 6
  coins: [number, number, number]; // 2 (Âm - chữ) or 3 (Dương - hình)
  total: number; // 6, 7, 8, 9
  isYang: boolean;
  isChanging: boolean;
  name: string;
}

// Duration of the sacred coin toss ritual animation in seconds (15.5 seconds)
const TOTAL_RITUAL_SECONDS = 15.5;

interface RitualStage {
  id: "mindfulness" | "shaking" | "casting" | "settling" | "revealing";
  startSec: number;
  endSec: number;
  title: string;
  hanTu: string;
  description: string;
}

const RITUAL_STAGES: RitualStage[] = [
  {
    id: "mindfulness",
    startSec: 0,
    endSec: 3.0,
    title: "Tĩnh Tâm Khởi Niệm",
    hanTu: "靜心起念",
    description: "Giữ tâm thanh tịnh, tập trung tâm niệm vào quẻ hỏi để giao hòa cùng Thiên Cơ...",
  },
  {
    id: "shaking",
    startSec: 3.0,
    endSec: 7.5,
    title: "Nạp Khí & Lắc Cổ Tiền",
    hanTu: "納氣搖錢",
    description: "Lắc đều 3 đồng Càn Long Thông Bảo trong mai rùa/bát sứ, khí vận chuyển động hỗn nguyên...",
  },
  {
    id: "casting",
    startSec: 7.5,
    endSec: 11.5,
    title: "Gieo Xu Xuống Đĩa Đồng",
    hanTu: "擲錢落盤",
    description: "3 đồng tiền bay lượn và xoay vòng trên mặt đĩa, tìm kiếm điểm cân bằng Âm - Dương...",
  },
  {
    id: "settling",
    startSec: 11.5,
    endSec: 14.2,
    title: "Lắng Dịu Định Thế",
    hanTu: "定勢顯相",
    description: "Đồng tiền ngưng chuyển động, từng mặt Dương (+3) hoặc Âm (+2) dần định vị rõ nét...",
  },
  {
    id: "revealing",
    startSec: 14.2,
    endSec: TOTAL_RITUAL_SECONDS,
    title: "Thiên Cơ Hiển Lộ",
    hanTu: "天機顯露",
    description: "Khí tượng đã định! Xác lập hào và nạp vào đồ hình Lục Hào...",
  },
];

export const CoinToss: React.FC<CoinTossProps> = ({ onComplete, onReset }) => {
  const [history, setHistory] = useState<TossResult[]>([]);
  const [isTossing, setIsTossing] = useState(false);
  const [currentCoins, setCurrentCoins] = useState<[number, number, number]>([3, 2, 3]);

  // Dedicated full immersion animation modal state
  const [isDedicatedModalOpen, setIsDedicatedModalOpen] = useState(false);
  const [showCoinPurificationGuide, setShowCoinPurificationGuide] = useState(false);
  const [autoOpenModal, setAutoOpenModal] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("iching_auto_open_ritual_modal");
      return saved !== null ? saved === "true" : true;
    } catch {
      return true;
    }
  });

  // Ritual countdown state
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const timerRef = useRef<any>(null);
  const soundTimerRef = useRef<any>(null);
  const pendingTossRef = useRef<TossResult | null>(null);

  // Current line to toss (1 to 6)
  const currentLine = history.length + 1;
  const isFinished = history.length === 6;

  // Last toss result for feedback
  const lastToss = history.length > 0 ? history[history.length - 1] : null;

  // 10-second countdown for next toss, auto-cancel if not clicked
  const [nextCountdown, setNextCountdown] = useState<number | null>(null);
  const nextCountdownTimerRef = useRef<any>(null);
  const [cancelNotification, setCancelNotification] = useState<string | null>(null);

  // Determine current ritual stage
  const currentStage = RITUAL_STAGES.find(
    (s) => elapsedSec >= s.startSec && elapsedSec < s.endSec
  ) || RITUAL_STAGES[RITUAL_STAGES.length - 1];

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (soundTimerRef.current) clearInterval(soundTimerRef.current);
      if (nextCountdownTimerRef.current) clearInterval(nextCountdownTimerRef.current);
    };
  }, []);

  const startNextTossCountdown = () => {
    if (nextCountdownTimerRef.current) clearInterval(nextCountdownTimerRef.current);
    setNextCountdown(10);
    const startWaitTime = Date.now();
    nextCountdownTimerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startWaitTime) / 1000);
      const remaining = 10 - elapsed;
      if (remaining <= 0) {
        clearInterval(nextCountdownTimerRef.current);
        setNextCountdown(null);
        handleAutoCancelToss();
      } else {
        setNextCountdown(remaining);
      }
    }, 200);
  };

  const handleAutoCancelToss = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (soundTimerRef.current) clearInterval(soundTimerRef.current);
    if (nextCountdownTimerRef.current) clearInterval(nextCountdownTimerRef.current);
    zenAudio.strikeSingingBowl(180, 0.4);
    setHistory([]);
    setIsTossing(false);
    setElapsedSec(0);
    setIsDedicatedModalOpen(false);
    setNextCountdown(null);
    setCancelNotification("Đã quá 10 giây không nhấn gieo tiếp, buổi gieo 3 xu đã tự động hủy bỏ.");
    onReset();
    setTimeout(() => {
      setCancelNotification(null);
    }, 7000);
  };

  const toggleAutoOpenModal = () => {
    setAutoOpenModal((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("iching_auto_open_ritual_modal", String(next));
      } catch {}
      return next;
    });
  };

  // Helper to trigger navigation to hexagram detail when 6 lines are done
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
      `Gieo 3 Đồng Tiền Cổ (Lục Hào): Quẻ #${primaryHex.number} ${primaryHex.name}` +
      (transformedHex
        ? ` ➔ Biến Quẻ #${transformedHex.number} ${transformedHex.name}`
        : "");
    if (primaryHex.number === 1 && changingLines.length === 6) {
      summary += ` (Động cả 6 hào ➔ Dụng Cửu: Kiến quần long vô thủ, cát)`;
    } else if (primaryHex.number === 2 && changingLines.length === 6) {
      summary += ` (Động cả 6 hào ➔ Dụng Lục: Lợi vĩnh trinh)`;
    }

    zenAudio.strikeSingingBowl(324, 0.7);
    setIsDedicatedModalOpen(false);
    onComplete(primaryHex, changingLines, transformedHex, summary);
  };

  // Complete a toss when ritual finishes (keeps modal open for user to continue)
  const finalizeToss = (toss: TossResult) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (soundTimerRef.current) clearInterval(soundTimerRef.current);

    setCurrentCoins(toss.coins);
    setHistory((prev) => {
      const newHistory = [...prev, toss];
      setIsTossing(false);
      setElapsedSec(0);

      // Sound chime on line completion
      if (newHistory.length === 6) {
        zenAudio.strikeSingingBowl(324, 0.75);
        if (nextCountdownTimerRef.current) clearInterval(nextCountdownTimerRef.current);
        setNextCountdown(null);
      } else {
        zenAudio.playCoinPlateLanding();
        startNextTossCountdown();
      }

      return newHistory;
    });
  };

  // Toss a single line with 15.5+ seconds animation (NO quick draw / batch skip)
  const handleTossLine = () => {
    if (isTossing || isFinished) return;
    if (nextCountdownTimerRef.current) clearInterval(nextCountdownTimerRef.current);
    setNextCountdown(null);
    setCancelNotification(null);

    // Randomize 3 coins: 2 (Yin) or 3 (Yang)
    const c1 = Math.random() < 0.5 ? 2 : 3;
    const c2 = Math.random() < 0.5 ? 2 : 3;
    const c3 = Math.random() < 0.5 ? 2 : 3;
    const total = c1 + c2 + c3;

    let isYang = false;
    let isChanging = false;
    let name = "";

    if (total === 6) {
      isYang = false;
      isChanging = true;
      name = "Lão Âm (Động)";
    } else if (total === 7) {
      isYang = true;
      isChanging = false;
      name = "Thiếu Dương (Tĩnh)";
    } else if (total === 8) {
      isYang = false;
      isChanging = false;
      name = "Thiếu Âm (Tĩnh)";
    } else if (total === 9) {
      isYang = true;
      isChanging = true;
      name = "Lão Dương (Động)";
    }

    const newToss: TossResult = {
      lineIndex: currentLine,
      coins: [c1, c2, c3],
      total,
      isYang,
      isChanging,
      name,
    };

    pendingTossRef.current = newToss;
    setIsTossing(true);
    setElapsedSec(0);

    // Auto open dedicated ritual modal if enabled
    if (autoOpenModal) {
      setIsDedicatedModalOpen(true);
    }

    // Initial mindfulness chime
    zenAudio.strikeSingingBowl(216, 0.5);

    // Audio cue scheduling during the 15.5 seconds
    let soundStep = 0;
    soundTimerRef.current = setInterval(() => {
      soundStep += 0.5;
      // In shaking phase (3s - 7.5s): periodic coin shakes & clinks
      if (soundStep >= 3.0 && soundStep <= 7.2) {
        if (Math.random() < 0.6) {
          zenAudio.playCoinShake();
        } else {
          zenAudio.playCoinClink(0.9 + Math.random() * 0.3);
        }
      }
      // At casting phase transition (~7.5s - 8.5s): coin landing on plate
      if (soundStep >= 7.5 && soundStep <= 8.0) {
        zenAudio.playCoinPlateLanding();
      }
      // At settling phase (~11.5s - 13.5s): subtle coin settle clicks
      if (soundStep >= 11.5 && soundStep <= 13.5) {
        if (Math.random() < 0.35) {
          zenAudio.playCoinClink(1.2);
        }
      }
      // At revealing phase (~14.2s): sacred bell
      if (soundStep >= 14.2 && soundStep <= 14.6) {
        zenAudio.strikeSingingBowl(432, 0.45);
      }
    }, 500);

    // 15.5-second tick interval (updates every 50ms)
    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      const now = Date.now();
      const diffSec = (now - startTime) / 1000;
      setElapsedSec(diffSec);

      if (diffSec >= TOTAL_RITUAL_SECONDS) {
        clearInterval(timerRef.current);
        if (soundTimerRef.current) clearInterval(soundTimerRef.current);
        finalizeToss(newToss);
      }
    }, 50);
  };

  const handleResetInternal = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (soundTimerRef.current) clearInterval(soundTimerRef.current);
    if (nextCountdownTimerRef.current) clearInterval(nextCountdownTimerRef.current);
    setNextCountdown(null);
    setCancelNotification(null);
    setHistory([]);
    setIsTossing(false);
    setElapsedSec(0);
    setIsDedicatedModalOpen(false);
    onReset();
  };

  // Progress percentage (0 to 100%)
  const progressPercent = Math.min(
    100,
    (elapsedSec / TOTAL_RITUAL_SECONDS) * 100
  );
  const remainingSeconds = Math.max(
    0,
    TOTAL_RITUAL_SECONDS - elapsedSec
  ).toFixed(1);

  // Reusable 3-Coin Animation Display
  const renderCoinAnimation = (isLarge: boolean = false) => {
    const coinSizeClass = isLarge
      ? "w-20 h-20 sm:w-28 sm:h-28"
      : "w-16 h-16 sm:w-20 sm:h-20";
    const holeSizeClass = isLarge
      ? "w-7 h-7 sm:w-9 sm:h-9"
      : "w-5 h-5 sm:w-6 sm:h-6";
    const fontSizeClass = isLarge
      ? "text-xs sm:text-base"
      : "text-[10px] sm:text-xs";

    return (
      <div
        className="flex items-center justify-center gap-5 sm:gap-10 relative z-10 py-4"
        style={{ perspective: "1000px" }}
      >
        {currentCoins.map((coinVal, i) => {
          let animateConfig: any = {};
          let transitionConfig: any = {};

          if (isTossing) {
            if (currentStage.id === "mindfulness") {
              // Phase 1: Floating softly in air with golden breath
              animateConfig = {
                y: [-6, 6, -6],
                scale: [1, 1.12, 1],
                rotateZ: [0, (i - 1) * 8, 0],
                boxShadow: [
                  "0 8px 16px rgba(0,0,0,0.6)",
                  "0 16px 36px rgba(212,175,55,0.5)",
                  "0 8px 16px rgba(0,0,0,0.6)",
                ],
              };
              transitionConfig = {
                duration: 2.4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.2,
              };
            } else if (currentStage.id === "shaking") {
              // Phase 2: Rapid tumbling in cup/tortoise shell
              animateConfig = {
                rotateX: [0, 720, 1440, 2160],
                rotateY: [0, 1080, 2160, 3240],
                rotateZ: [0, 360, 720],
                y: [-15, -55, -12, -60, -20],
                x: [(i - 1) * 15, (i - 1) * -22, (i - 1) * 16],
                scale: [1, 1.3, 0.95, 1.25, 1],
              };
              transitionConfig = {
                duration: 1.1,
                repeat: Infinity,
                ease: "easeInOut",
              };
            } else if (currentStage.id === "casting") {
              // Phase 3: Rolling across dish, spinning and bouncing
              animateConfig = {
                rotateX: [0, 360, 720],
                rotateY: [0, 720, 1440],
                y: [-35, 0, -18, 0, -8, 0],
                x: [(i - 1) * 26, (i - 1) * -15, (i - 1) * 6],
                scale: [1.2, 1, 1.08, 1],
              };
              transitionConfig = {
                duration: 2.0,
                ease: "easeOut",
              };
            } else if (currentStage.id === "settling") {
              // Phase 4: Wobbling to rest on plate
              animateConfig = {
                rotateX: [15, -10, 6, -3, 0],
                rotateY: [10, -8, 4, -2, 0],
                y: [-4, 0, -2, 0],
                scale: [1.04, 1, 1.01, 1],
              };
              transitionConfig = {
                duration: 2.5,
                ease: "easeOut",
              };
            } else {
              // Phase 5: Settled with divine aura
              animateConfig = {
                scale: [1, 1.15, 1],
                boxShadow: [
                  "0 8px 16px rgba(0,0,0,0.6)",
                  "0 0 32px rgba(212,175,55,0.9)",
                  "0 8px 16px rgba(0,0,0,0.6)",
                ],
              };
              transitionConfig = {
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
              };
            }
          }

          return (
            <motion.div
              key={i}
              animate={animateConfig}
              transition={transitionConfig}
              className={`relative ${coinSizeClass} rounded-full bg-gradient-to-br from-[#FCE59F] via-[#B8872E] to-[#4A3408] border-2 sm:border-3 border-[#FFE89E] shadow-[0_12px_28px_rgba(0,0,0,0.8)] flex items-center justify-center text-center select-none transition-all duration-200 ${
                isTossing && (currentStage.id === "shaking" || currentStage.id === "casting")
                  ? "animate-coin-tumble-shake"
                  : isTossing && currentStage.id === "mindfulness"
                  ? "animate-ethereal-blur-pulse"
                  : isTossing && currentStage.id === "settling"
                  ? "animate-spiritual-shake"
                  : ""
              }`}
              style={{
                filter:
                  isTossing && currentStage.id === "shaking"
                    ? "blur(0.5px)"
                    : isTossing && currentStage.id === "mindfulness"
                    ? "blur(0.3px)"
                    : "none",
              }}
            >
              {/* Antique Coin Square Center */}
              <div className={`${holeSizeClass} bg-[#14100C] border border-[#C9A55A] rounded-xs shadow-inner flex items-center justify-center`} />

              {/* Coin Inscription */}
              <div className={`absolute inset-0 flex items-center justify-center font-serif ${fontSizeClass} font-bold text-[#FFF8E6] tracking-wider drop-shadow-md`}>
                {coinVal === 3 ? (
                  <span className="opacity-95 text-[#FFF]">乾 隆</span>
                ) : (
                  <span className="opacity-95 text-[#FFF]">通 寶</span>
                )}
              </div>

              {/* Face Point Tag */}
              <span className="absolute -bottom-7 sm:-bottom-8 text-xs sm:text-sm font-mono text-[#F4DA8A] font-bold drop-shadow">
                {coinVal === 3 ? "Dương (+3)" : "Âm (+2)"}
              </span>

              {/* Active Glowing Ring when Settled */}
              {isTossing && currentStage.id === "revealing" && (
                <div className="absolute -inset-2 rounded-full border-2 border-[#E6D3A3] animate-ping pointer-events-none" />
              )}
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-[#171513] border border-[#3A332A] rounded-2xl p-4 sm:p-6 shadow-2xl relative">
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
              className="w-full max-w-3xl bg-gradient-to-b from-[#1E1711] via-[#14100D] to-[#0A0806] border-2 border-[#6D4F28] rounded-2xl sm:rounded-3xl shadow-[0_0_50px_rgba(212,175,55,0.35)] p-4 sm:p-8 relative overflow-hidden my-auto"
            >
              {/* Atmospheric Background Sacred Patterns */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full border border-[#C9A55A] border-dashed animate-[spin_80s_linear_infinite]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] rounded-full border border-[#8C6218]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] rounded-full border border-[#C9A55A]/50" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-64 bg-radial from-[#C9A55A]/15 to-transparent blur-2xl" />
              </div>

              {/* Modal Top Control Bar */}
              <div className="flex items-center justify-between border-b border-[#3B2C1C] pb-4 mb-4 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#2B1D12] border border-[#5A3F23] flex items-center justify-center text-[#C9A55A] shadow">
                    <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9A55A] block">
                      ĐÀN CHIÊM LỤC HÀO • HOẠT ẢNH RIÊNG
                    </span>
                    <h3 className="font-serif font-bold text-base sm:text-lg text-[#F4E8D1]">
                      Nghi Thức Gieo Ba Đồng Tiền Cổ (Lục Hào)
                    </h3>
                    <p className="text-[11px] text-[#E6D3A3] font-serif">
                      ⏱ Thời gian gieo quẻ trên 90 giây • Cần tập trung
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsDedicatedModalOpen(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-serif bg-[#241C15] hover:bg-[#382B20] text-[#A89882] hover:text-[#FFF] border border-[#423223] transition-all cursor-pointer shadow active:scale-95"
                    title="Thu nhỏ để xem dạng thẻ thông thường"
                  >
                    <Minimize2 className="w-3.5 h-3.5" />
                    <span>Thu nhỏ</span>
                  </button>
                </div>
              </div>

              {/* Dedicated Altar Stage */}
              <div className="relative z-10 space-y-4">
                {/* 15.5s Live Countdown Banner */}
                <div className="bg-gradient-to-r from-[#281A0E] via-[#332212] to-[#21150A] border border-[#684622] rounded-2xl p-4 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-3">
                      <span className={`w-3 h-3 rounded-full ${isTossing ? "bg-[#C9A55A] animate-ping" : "bg-emerald-400"}`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm sm:text-base font-serif font-bold text-[#FFE69A]">
                            {isTossing ? `Giai đoạn: ${currentStage.title}` : (isFinished ? "Đã Hoàn Tất 6 Hào!" : `Sẵn Sàng Gieo Hào ${currentLine}`)}
                          </span>
                          {isTossing && (
                            <span className="text-xs font-mono text-[#C9A55A] bg-[#160E07] px-2 py-0.5 rounded border border-[#4A3319]">
                              {currentStage.hanTu}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#CBB9A0] font-serif italic mt-0.5">
                          {isTossing
                            ? `“${currentStage.description}”`
                            : isFinished
                            ? "6 hào Lục Hào đã được nạp đủ! Bấm nút bên dưới để xem toàn văn giải nghĩa quẻ."
                            : lastToss
                            ? `Vừa hoàn tất Hào ${lastToss.lineIndex}: ${lastToss.name} (${lastToss.total} điểm). Bấm 'Gieo Tiếp Tục' để tiến hành hào tiếp theo.`
                            : "Giữ tâm thanh tịnh, bấm 'Gieo Tiếp Tục' để khởi sự..."}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <div className="bg-[#140D07] px-3.5 py-1.5 rounded-xl border border-[#4E351A] shadow-inner text-center">
                        <span className="text-[10px] font-mono text-[#A89882] block leading-none">
                          THỜI GIAN
                        </span>
                        <span className="text-base sm:text-lg font-mono font-bold text-[#E6D3A3]">
                          {isTossing ? `⏳ ${remainingSeconds}s` : "✓ 15.5s/hào"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-[#110B06] rounded-full h-2.5 border border-[#4A341D] overflow-hidden p-0.5">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#8C6218] via-[#D6B97A] to-[#FFF0B8] rounded-full shadow-[0_0_12px_rgba(226,183,85,0.8)]"
                      style={{ width: isTossing ? `${progressPercent}%` : "100%" }}
                      transition={{ ease: "linear", duration: 0.05 }}
                    />
                  </div>

                  {/* 5 Stages Tracker */}
                  <div className="grid grid-cols-5 gap-1.5 mt-2.5 text-center">
                    {RITUAL_STAGES.map((stg, idx) => {
                      const isPast = isTossing ? elapsedSec >= stg.endSec : false;
                      const isCurrent = isTossing && elapsedSec >= stg.startSec && elapsedSec < stg.endSec;
                      return (
                        <div
                          key={stg.id}
                          className={`p-1 rounded text-[10px] font-mono truncate transition-all ${
                            isCurrent
                              ? "bg-[#3D2814] text-[#FFE494] font-bold border border-[#6A4723]"
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

                {/* Main Large Coin Arena in Modal */}
                <div className={`relative min-h-[260px] sm:min-h-[300px] flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#18120D] to-[#0D0A07] border rounded-2xl shadow-inner overflow-hidden transition-all duration-300 ${
                  isTossing
                    ? currentStage.id === "shaking"
                      ? "border-[#C9A55A] animate-coin-tumble-shake shadow-[0_0_35px_rgba(212,175,55,0.4)]"
                      : currentStage.id === "casting"
                      ? "border-[#D6B97A] animate-spiritual-shake"
                      : currentStage.id === "mindfulness"
                      ? "border-[#5A4021] animate-ethereal-blur-pulse"
                      : "border-[#C9A55A] animate-energy-ripple"
                    : "border-[#3E2D1D]"
                }`}>
                  {/* Spiritual Incense Mist Overlay during ritual */}
                  {isTossing && (
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 pointer-events-none z-15 bg-gradient-to-t from-[#C9A55A]/5 via-transparent to-[#C9A55A]/5 animate-misty-blur"
                    />
                  )}

                  {/* Glowing Lotus / Bagua Disk */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
                    <div className="w-72 h-72 sm:w-96 sm:h-96 rounded-full border-2 border-dashed border-[#C9A55A] animate-[spin_60s_linear_infinite]" />
                    <div className="absolute w-56 h-56 sm:w-72 sm:h-72 rounded-full border border-[#C9A55A]" />
                  </div>

                  {/* 3 Large Animated Coins */}
                  {renderCoinAnimation(true)}

                  {/* Action or Prompt inside Modal */}
                  <div className="mt-8 text-center relative z-10 w-full max-w-md mx-auto">
                    {isTossing ? (
                      <div className="space-y-1">
                        <p className="text-sm sm:text-base font-serif text-[#E6D3A3] flex items-center justify-center gap-2">
                          <Sparkles className="w-4 h-4 animate-spin text-[#C9A55A]" />
                          <span>
                            Đang diễn xướng nghi thức gieo Hào {currentLine}/6 ({remainingSeconds}s)...
                          </span>
                        </p>
                        <p className="text-xs text-[#B5A48F] font-serif">
                          Giữ lòng thanh tịnh, giao cảm cùng linh khí quẻ dịch
                        </p>
                      </div>
                    ) : !isFinished ? (
                      /* NÚT GIEO TIẾP TỤC TRONG HOẠT ẢNH */
                      <div className="space-y-3">
                        {lastToss && (
                          <div className="bg-[#22180F] border border-[#523A21] px-4 py-2 rounded-xl text-xs font-serif text-[#E0C070] inline-block shadow">
                            ✨ Hào {lastToss.lineIndex} vừa định: <strong>{lastToss.name}</strong> ({lastToss.total} điểm)
                          </div>
                        )}

                        {/* 10-Second Auto-cancel Countdown Warning */}
                        {nextCountdown !== null && (
                          <div className="flex flex-col items-center gap-1.5 py-1">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-rose-950 via-amber-950 to-rose-950 border border-amber-500/60 text-amber-200 text-xs font-serif font-bold shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse">
                              <Clock className="w-3.5 h-3.5 text-rose-400 animate-spin" />
                              <span>Tự động hủy bỏ sau: <strong className="text-white font-mono text-sm px-1.5 py-0.5 rounded bg-rose-900/60 border border-rose-500/40">{nextCountdown}s</strong></span>
                            </div>
                            <div className="w-56 h-1.5 bg-[#20140D] rounded-full overflow-hidden border border-[#482E1C]">
                              <div
                                className="h-full bg-gradient-to-r from-amber-400 via-rose-500 to-amber-400 transition-all duration-200 ease-linear rounded-full"
                                style={{ width: `${(nextCountdown / 10) * 100}%` }}
                              />
                            </div>
                            <p className="text-[11px] text-[#A89882] font-serif italic">
                              Nhấn nút bên dưới trong 10 giây để gieo tiếp, nếu không sẽ tự động hủy bỏ
                            </p>
                          </div>
                        )}

                        {history.length === 0 && !isTossing && (
                          <div className="mb-2 px-3.5 py-1.5 rounded-lg bg-[#24170E] border border-[#58391C] text-center">
                            <p className="text-xs text-[#E6D3A3] font-serif flex items-center justify-center gap-1.5 font-semibold">
                              <span>⏱</span>
                              <span>Thời gian gieo quẻ trên 90 giây, cần tập trung.</span>
                            </p>
                          </div>
                        )}

                        <div>
                          <button
                            type="button"
                            onClick={handleTossLine}
                            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#B8872E] via-[#F5D076] to-[#B8872E] hover:brightness-110 active:scale-95 text-[#16120C] font-bold font-serif text-sm sm:text-base rounded-2xl shadow-[0_0_25px_rgba(212,175,55,0.45)] transition-all flex items-center justify-center gap-2.5 cursor-pointer mx-auto"
                          >
                            <Play className="w-4 h-4 fill-current" />
                            <span>Gieo Tiếp Tục Hào {currentLine} (Nghi Thức 15s)</span>
                            {nextCountdown !== null && (
                              <span className="ml-1 px-2 py-0.5 rounded-full bg-black/40 text-amber-200 text-xs font-mono font-black border border-black/30">
                                ⏳ {nextCountdown}s
                              </span>
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* HOÀN TẤT 6 HÀO */
                      <div className="space-y-3">
                        <div className="bg-[#1C2613] border border-emerald-700/60 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-serif text-emerald-300 inline-flex items-center gap-2 shadow-lg">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Đã hoàn tất đủ 6 hào Lục Hào!</span>
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
                    )}
                  </div>
                </div>

                {/* Side/Bottom Hexagram Forging Status */}
                <div className="bg-[#120E0A] border border-[#2B1F14] rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-serif text-[#A89882]">Tiến trình quẻ:</span>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5, 6].map((lNum) => {
                        const done = history.find((h) => h.lineIndex === lNum);
                        const isCur = lNum === currentLine && !isFinished;
                        return (
                          <div
                            key={lNum}
                            className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono font-bold transition-all ${
                              done
                                ? "bg-[#382615] text-[#E6D3A3] border border-[#6B4B27]"
                                : isCur
                                ? "bg-[#C9A55A] text-[#120F0C] animate-pulse"
                                : "bg-[#18130E] text-[#554637] border border-[#271E15]"
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
                      ? "Đã nạp đủ 6 hào ➔ Sẵn sàng xem quẻ đã bốc!"
                      : `Đang lập Hào ${currentLine}: ${
                          currentLine === 1
                            ? "Sơ Hào (Khởi sinh)"
                            : currentLine === 6
                            ? "Thượng Hào (Cực điểm)"
                            : `Hào ${currentLine}`
                        }`}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification banner when auto-cancelled */}
      {cancelNotification && (
        <div className="mb-4 p-3.5 rounded-xl bg-[#261010] border border-rose-600/60 text-rose-200 text-xs font-serif flex items-center justify-between gap-3 shadow-xl animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{cancelNotification}</span>
          </div>
          <button
            type="button"
            onClick={() => setCancelNotification(null)}
            className="text-rose-400 hover:text-white p-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STANDARD INLINE CARD VIEW */}
      {/* ========================================================================= */}
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#2C261F] pb-4 mb-5 gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#C9A55A] bg-[#241B12] px-2 py-0.5 rounded border border-[#3E2E1D]">
              Nghi Thức Cổ Truyền • Văn Vương Bặc Phệ
            </span>
            <span className="text-[10px] font-mono font-bold text-[#E6D3A3] bg-[#2B1B0E] border border-[#5A3819] px-2.5 py-0.5 rounded shadow-xs">
              ⏱ Thời gian gieo quẻ trên 90 giây • Cần tập trung
            </span>
            <span className="text-[10px] font-mono text-[#A89882] bg-[#1C1712] px-2 py-0.5 rounded">
              15.5s/Hào (6 Lần Gieo)
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-serif font-bold text-[#EAD8B1] flex items-center gap-2 mt-1">
            <Coins className="w-5 h-5 text-[#C9A55A]" />
            Gieo Ba Đồng Tiền Cổ (Lục Hào)
          </h3>
          <p className="text-xs text-[#9E907D] mt-0.5">
            Gieo 6 lần từ Hào 1 (Sơ Hào) lên Hào 6 (Thượng Hào). Mặt Chữ = Âm (2đ), Mặt Rồng/Hình = Dương (3đ). <strong className="text-[#E6D3A3]">Thời gian gieo quẻ trên 90 giây, cần trai giới mộc dục (rửa sạch đôi tay, thanh tịnh tâm ý) và tập trung tuyệt đối</strong>. Hoạt ảnh hành động 15 giây theo từng hào, không rút nhanh.
          </p>

          {/* Nút Trai Giới Mộc Dục */}
          <div className="pt-1.5">
            <button
              type="button"
              onClick={() => setShowCoinPurificationGuide(!showCoinPurificationGuide)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-serif text-[#E0C070] bg-[#1E1711] hover:bg-[#2A1F16] border border-[#48331E] hover:border-[#C9A55A] transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <span>⛩️</span>
              <span className="font-semibold underline decoration-dotted">
                Trai Giới Mộc Dục: Vì sao cần rửa tay & tịnh tâm trước khi gieo tiền?
              </span>
              <span className="text-[10px] font-mono text-[#A89882]">
                {showCoinPurificationGuide ? "▲ Ẩn" : "▼ Chi tiết"}
              </span>
            </button>
          </div>

          {showCoinPurificationGuide && (
            <div className="mt-2.5 text-left bg-[#140F0B] border border-[#4D351E] rounded-xl p-3.5 sm:p-4 shadow-xl text-xs font-serif text-[#DECAB2] space-y-2.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-[#302113] pb-1.5 text-[#E6D3A3] font-bold text-xs">
                <span className="flex items-center gap-1.5">
                  <span>📜</span> TRAI GIỚI MỘC DỤC KHI GIEO ĐỒNG TIỀN CỔ VĂN VƯƠNG
                </span>
                <button
                  type="button"
                  onClick={() => setShowCoinPurificationGuide(false)}
                  className="text-[#8C7A65] hover:text-[#E6D3A3] text-[11px] font-sans px-1.5 py-0.5 rounded cursor-pointer"
                >
                  Đóng ✕
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
                <div className="bg-[#1C140D] p-2.5 rounded-lg border border-[#3E2917] space-y-1">
                  <strong className="text-[#C9A55A] font-bold block text-xs">
                    1. Mộc Dục (沐浴 - Rửa Sạch Đôi Tay Cầm Tiền):
                  </strong>
                  <p className="leading-relaxed text-[#BFB09A]">
                    • Ba đồng tiền cổ bằng đồng nguyên chất là vật dẫn truyền điện từ sinh học. Hãy rửa sạch đôi bàn tay dưới vòi nước trong, lau khô trước khi cầm nẹp đồng tiền và khấn nguyện.<br/>
                    • Giữ y phục tề chỉnh, tư thế ngồi thẳng thắn, trang nghiêm.
                  </p>
                </div>

                <div className="bg-[#1C140D] p-2.5 rounded-lg border border-[#3E2917] space-y-1">
                  <strong className="text-[#C9A55A] font-bold block text-xs">
                    2. Trai Giới (齋戒 - Tĩnh Tâm & Hư Tĩnh):
                  </strong>
                  <p className="leading-relaxed text-[#BFB09A]">
                    • Gạt bỏ phiền não, dục vọng vị kỷ hay lo âu hoảng hốt.<br/>
                    • Chắp hai tay ôm 3 đồng tiền trong lòng bàn tay, nhắm mắt tĩnh tâm 10-15 giây, hòa nhịp thở đều đặn và tâm niệm rõ ràng về sự việc muốn cầu hỏi.
                  </p>
                </div>
              </div>

              <div className="p-2 rounded-lg bg-[#23170D] border border-[#482E18] text-[10.5px] leading-relaxed text-[#EAD8B5] flex items-center gap-1.5">
                <span>💡</span>
                <span>
                  <strong>Khẩu quyết:</strong> "Chí thành thông thần". Ba đồng tiền rơi xuống đĩa là sự chuyển hóa từ trường ý thức thành quẻ dịch 6 hào. Tâm tịnh thì hào ứng, quẻ Dịch sẽ chỉ rõ đường lối hanh thông!
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Button to open dedicated immersion modal */}
          <button
            type="button"
            onClick={() => setIsDedicatedModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#E6D3A3] bg-[#2A1D11] hover:bg-[#3E2B1A] rounded-lg border border-[#5C4023] transition-all cursor-pointer shadow active:scale-95"
            title="Mở hoạt ảnh riêng toàn màn hình với đài chiêm bặc trang nghiêm"
          >
            <Maximize2 className="w-3.5 h-3.5 text-[#C9A55A]" />
            <span>Mở Hoạt Ảnh Riêng</span>
          </button>

          {history.length > 0 && !isTossing && (
            <button
              type="button"
              onClick={handleResetInternal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#C8B89E] hover:text-[#FFF] bg-[#24201A] hover:bg-[#342D23] rounded-lg border border-[#3E3529] transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Làm lại
            </button>
          )}
        </div>
      </div>

      {/* Auto Open Toggle Bar */}
      <div className="mb-4 flex items-center justify-between bg-[#15120E] border border-[#2E251B] px-3.5 py-2 rounded-xl text-xs font-serif text-[#A89882]">
        <span>Tự động mở hoạt ảnh riêng khi bấm gieo:</span>
        <button
          type="button"
          onClick={toggleAutoOpenModal}
          className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold transition-all cursor-pointer border ${
            autoOpenModal
              ? "bg-[#2E1E10] text-[#E6D3A3] border-[#5A3F21]"
              : "bg-[#1C1712] text-[#6E6050] border-[#312519]"
          }`}
        >
          {autoOpenModal ? "ĐANG BẬT" : "ĐANG TẮT"}
        </button>
      </div>

      {/* RITUAL LIVE STATUS BANNER (When Tossing) */}
      {isTossing && (
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
                ✨ Khí vận chấn động • Đồng tiền quy vị
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#F3E2B5]">
                ⏳ {remainingSeconds}s
              </span>
            </div>
          </div>

          <p className="text-[11px] text-[#D8C7B0] font-serif italic mb-2 leading-relaxed">
            “{currentStage.description}”
          </p>

          {/* 15.5s Progress Bar */}
          <div className="w-full bg-[#140F0A] rounded-full h-2 border border-[#3E2E1D] overflow-hidden p-0.5">
            <motion.div
              className="h-full bg-gradient-to-r from-[#8C6218] via-[#C9A55A] to-[#FFF0A8] rounded-full shadow-[0_0_8px_rgba(212,175,55,0.7)]"
              style={{ width: `${progressPercent}%` }}
              transition={{ ease: "linear", duration: 0.05 }}
            />
          </div>

          {/* 5-Stage Stepper Dots */}
          <div className="grid grid-cols-5 gap-1 mt-2 text-center">
            {RITUAL_STAGES.map((stage, idx) => {
              const isPast = elapsedSec >= stage.endSec;
              const isCurrent = elapsedSec >= stage.startSec && elapsedSec < stage.endSec;
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

      {/* Plate & Coins Area */}
      <div className={`relative flex flex-col items-center justify-center p-6 sm:p-8 bg-gradient-to-b from-[#211C16] to-[#12100E] border rounded-xl shadow-inner min-h-[220px] overflow-hidden transition-all duration-300 ${
        isTossing
          ? currentStage.id === "shaking"
            ? "border-[#C9A55A] animate-coin-tumble-shake shadow-[0_0_30px_rgba(212,175,55,0.35)]"
            : currentStage.id === "casting"
            ? "border-[#D6B97A] animate-spiritual-shake"
            : currentStage.id === "mindfulness"
            ? "border-[#5A4021] animate-ethereal-blur-pulse"
            : "border-[#C9A55A] animate-energy-ripple"
          : "border-[#3A3225]"
      }`}>
        {/* Spiritual Incense Mist Overlay during ritual */}
        {isTossing && (
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none z-15 bg-gradient-to-t from-[#C9A55A]/5 via-transparent to-[#C9A55A]/5 animate-misty-blur"
          />
        )}

        {/* Ancient Coin Plate Graphic */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-full border-2 border-dashed border-[#C9A55A] animate-[spin_60s_linear_infinite]" />
          <div className="absolute w-48 h-48 rounded-full border border-[#C9A55A]" />
          <div className="absolute w-32 h-32 rounded-full border border-[#8C6218]" />
        </div>

        {/* 3 Coins in Dynamic 3D Action */}
        {renderCoinAnimation(false)}

        {/* Status Prompt Below Coins */}
        <div className="mt-8 text-center relative z-10">
          {isTossing ? (
            <div className="space-y-1">
              <p className="text-sm font-medium text-[#E6D3A3] flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin text-[#C9A55A]" />
                <span>
                  Đang diễn xướng nghi thức gieo Hào {currentLine}... ({remainingSeconds}s)
                </span>
              </p>
              <p className="text-xs text-[#A89882] font-serif">
                Hòa cùng nhịp thở, giữ vững định tâm để lắng nghe thông điệp của quẻ dịch
              </p>
            </div>
          ) : !isFinished ? (
            <p className="text-sm text-[#C8BAA3]">
              Lần gieo tiếp theo:{" "}
              <span className="font-bold text-[#EAD8B1]">
                Hào {currentLine}{" "}
                {currentLine === 1
                  ? "(Sơ Hào - Nền móng & Khởi đầu)"
                  : currentLine === 6
                  ? "(Thượng Hào - Đỉnh cao & Chuyển giao)"
                  : ""}
              </span>
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Đã hoàn tất 6 hào Lục Hào!
              </p>
              <button
                type="button"
                onClick={handleProceedToInterpretation}
                className="px-6 py-2.5 bg-gradient-to-r from-[#B8872E] via-[#F5D076] to-[#B8872E] text-[#120F0C] font-serif font-bold rounded-xl shadow-lg transition-all cursor-pointer hover:brightness-110"
              >
                Xem Luận Giải Quẻ Chi Tiết ➔
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Progressive Line Builder Display */}
      <div className="mt-5 bg-[#1B1814] border border-[#2F2922] rounded-xl p-4">
        <div className="flex items-center justify-between mb-3 text-xs text-[#9E907D]">
          <span>Tiến trình quẻ (Xếp từ Sơ Hào lên Thượng Hào):</span>
          <span className="font-mono text-[#C9A55A] font-bold">{history.length}/6 Hào</span>
        </div>

        {/* Hexagram Lines (Rendered 6 down to 1) */}
        <div className="space-y-2">
          {[6, 5, 4, 3, 2, 1].map((lineNum) => {
            const toss = history.find((h) => h.lineIndex === lineNum);
            const isCurrent = lineNum === currentLine && !isFinished;

            return (
              <div
                key={lineNum}
                className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                  toss
                    ? "bg-[#221D17] border-[#3E3426]"
                    : isCurrent
                    ? "bg-[#1F1C16] border-[#C9A55A]/50 border-dashed"
                    : "bg-[#141210] border-transparent opacity-40"
                }`}
              >
                <div className="flex items-center gap-2 w-32 shrink-0">
                  <span className="text-xs font-mono font-bold text-[#C8B89E]">
                    {lineNum === 1 ? "Sơ Hào" : lineNum === 6 ? "Thượng Hào" : `Hào ${lineNum}`}
                  </span>
                  {toss && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                        toss.isChanging
                          ? "bg-red-950 text-red-300 border border-red-800"
                          : "bg-[#2E281F] text-[#E0B861] border border-[#483421]"
                      }`}
                    >
                      {toss.total}đ
                    </span>
                  )}
                </div>

                {/* Line Visual in List */}
                <div className="flex-1 mx-3 max-w-[200px]">
                  {toss ? (
                    toss.isYang ? (
                      <div
                        className={`h-2.5 rounded-xs ${
                          toss.isChanging
                            ? "bg-gradient-to-r from-[#C9A55A] via-red-500 to-[#C9A55A] shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                            : "bg-[#C89B3C]"
                        }`}
                      />
                    ) : (
                      <div className="flex justify-between h-2.5">
                        <div
                          className={`w-[44%] rounded-xs ${
                            toss.isChanging
                              ? "bg-gradient-to-r from-[#C9A55A] to-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                              : "bg-[#8C7A63]"
                          }`}
                        />
                        <div
                          className={`w-[44%] rounded-xs ${
                            toss.isChanging
                              ? "bg-gradient-to-r from-red-500 to-[#C9A55A] shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                              : "bg-[#8C7A63]"
                          }`}
                        />
                      </div>
                    )
                  ) : (
                    <div className="h-2.5 bg-[#25201A] rounded-xs border border-dashed border-[#3D3327]" />
                  )}
                </div>

                <div className="text-right text-xs w-36 shrink-0">
                  {toss ? (
                    <span
                      className={`font-serif ${
                        toss.isChanging ? "text-amber-400 font-bold" : "text-[#BDB09B]"
                      }`}
                    >
                      {toss.name}
                    </span>
                  ) : isCurrent ? (
                    <span className="text-xs text-[#C9A55A] animate-pulse font-serif">
                      {isTossing ? `Đang gieo (${remainingSeconds}s)...` : "Chờ gieo..."}
                    </span>
                  ) : (
                    <span className="text-xs text-[#5C5244] font-serif">Chưa gieo</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons: ONLY Step-by-Step Casting (No quick draw / No gieo nhanh) */}
      {!isFinished && (
        <div className="mt-5 flex flex-col items-center justify-center gap-2.5">
          {nextCountdown !== null && (
            <div className="flex flex-col items-center gap-1 animate-pulse">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-mono font-bold shadow">
                <Clock className="w-3.5 h-3.5 text-rose-400 animate-spin" />
                <span>Tự động hủy gieo sau: <strong className="text-white text-sm">{nextCountdown}s</strong></span>
              </div>
              <div className="w-48 h-1.5 bg-[#2B1B14] rounded-full overflow-hidden border border-[#523A25]">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-rose-500 transition-all duration-200 ease-linear rounded-full"
                  style={{ width: `${(nextCountdown / 10) * 100}%` }}
                />
              </div>
            </div>
          )}

          {history.length === 0 && !isTossing && (
            <div className="mb-1 px-4 py-2 rounded-xl bg-[#24170E] border border-[#58391C] text-center shadow-md">
              <p className="text-xs text-[#E6D3A3] font-serif flex items-center justify-center gap-1.5 font-semibold">
                <span>⏱</span>
                <span>Thời gian gieo quẻ trên 90 giây, cần tập trung.</span>
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handleTossLine}
            disabled={isTossing}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#9E782F] via-[#C89B3C] to-[#9E782F] hover:brightness-110 active:scale-95 text-[#14120F] font-bold font-serif rounded-xl shadow-[0_4px_16px_rgba(200,155,60,0.3)] transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 text-sm"
          >
            <Coins className="w-4 h-4" />
            <span>Gieo Hào {currentLine} (Nghi Thức 15s)</span>
            {nextCountdown !== null && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-black/40 text-amber-200 text-xs font-mono font-black border border-black/30">
                ⏳ {nextCountdown}s
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
