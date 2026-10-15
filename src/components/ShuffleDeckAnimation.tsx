import React, { useEffect, useState, useRef } from "react";
import { motion } from "motion/react";
import { Shuffle, Sparkles, Compass } from "lucide-react";

interface ShuffleDeckAnimationProps {
  cardBackUrl?: string | null;
  onShuffleComplete?: () => void;
  durationMs?: number;
}

export const ShuffleDeckAnimation: React.FC<ShuffleDeckAnimationProps> = ({
  cardBackUrl,
  onShuffleComplete,
  durationMs = 5500, // Strictly > 5s (5.5s ceremonial shuffle)
}) => {
  // Phase 0: Gom tụ thần khí (0 - 800ms)
  // Phase 1: Phân tách Lưỡng Nghi (800 - 1800ms)
  // Phase 2: Chẻ bài đan xen 3D Riffle Shuffle (1800 - 3300ms)
  // Phase 3: Thác bài uốn cong Waterfall Cascade (3300 - 4300ms)
  // Phase 4: Cắt bài & Hoán vị linh quẻ (4300 - 4900ms)
  // Phase 5: Đại thành viên mãn (4900 - 5500ms)
  const [phase, setPhase] = useState<number>(0);
  const [remainingTime, setRemainingTime] = useState<number>(durationMs);
  const startRef = useRef<number>(Date.now());

  useEffect(() => {
    startRef.current = Date.now();

    const t1 = setTimeout(() => setPhase(1), 800);
    const t2 = setTimeout(() => setPhase(2), 1800);
    const t3 = setTimeout(() => setPhase(3), 3300);
    const t4 = setTimeout(() => setPhase(4), 4300);
    const t5 = setTimeout(() => setPhase(5), 4900);
    const tEnd = setTimeout(() => {
      onShuffleComplete?.();
    }, durationMs);

    const interval = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      setRemainingTime(Math.max(0, durationMs - elapsed));
    }, 100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(tEnd);
      clearInterval(interval);
    };
  }, [durationMs, onShuffleComplete]);

  // Array of 24 interlaced cards for the 3D riffle shuffle
  const riffleCards = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    isLeft: i % 2 === 0,
    delay: (i / 24) * 1.2, // spans 1.2 seconds of fluttering
  }));

  return (
    <div className="absolute inset-0 z-100 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md rounded-3xl overflow-hidden p-4 select-none">
      {/* Background Mystical Astrolabe & Light Aura */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-88 h-88 rounded-full border border-[#D4AF37]/20 border-dashed animate-[spin_45s_linear_infinite]" />
        <div className="absolute w-64 h-64 rounded-full border border-[#D4AF37]/15 animate-[spin_30s_linear_infinite_reverse]" />
        <div className="absolute w-48 h-48 rounded-full bg-radial from-[#D4AF37]/25 via-[#D4AF37]/5 to-transparent blur-2xl" />
      </div>

      {/* 3D Shuffle Stage */}
      <div
        className="relative w-80 h-64 flex items-center justify-center"
        style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
      >
        {/* Phase 0: Gathering (0 - 800ms) */}
        {phase === 0 && (
          <motion.div
            initial={{ scale: 0.85, opacity: 0.6, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative w-26 h-38 rounded-xl border border-[#523F27] bg-[#1A140F] shadow-[0_10px_30px_rgba(0,0,0,0.9),0_0_20px_rgba(212,175,55,0.4)] overflow-hidden"
          >
            <div className="absolute -left-1 top-0 bottom-0 w-2 bg-[#2C2114] border-r border-[#45341F]" />
            <div className="absolute -right-1 top-0 bottom-0 w-2 bg-[#2C2114] border-l border-[#45341F]" />
            <CardBackGraphic cardBackUrl={cardBackUrl} />
          </motion.div>
        )}

        {/* Phase 1: Deck Splitting into Two Piles (800 - 1800ms) */}
        {phase === 1 && (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Left Deck Pile (Dương) */}
            <motion.div
              initial={{ x: 0, rotateZ: 0, rotateY: 0, scale: 0.95 }}
              animate={{ x: -75, y: -12, rotateZ: -14, rotateY: 22, scale: 1 }}
              transition={{ duration: 0.75, ease: "easeInOut" }}
              className="absolute w-24 h-36 rounded-xl border border-[#D4AF37]/60 bg-[#1A140F] shadow-[0_12px_28px_rgba(0,0,0,0.85),0_0_20px_rgba(212,175,55,0.35)] overflow-hidden"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="absolute -left-1.5 top-0 bottom-0 w-1.5 bg-[#2C2114] border-r border-[#45341F]" />
              <CardBackGraphic cardBackUrl={cardBackUrl} />
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded bg-[#16120E]/90 text-[8px] font-mono text-[#D4AF37] border border-[#503E26]">
                DƯƠNG
              </div>
            </motion.div>

            {/* Center Mystic Connection Sparks */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="absolute w-8 h-8 rounded-full border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] text-xs shadow-[0_0_15px_rgba(212,175,55,0.5)] animate-pulse"
            >
              ☯
            </motion.div>

            {/* Right Deck Pile (Âm) */}
            <motion.div
              initial={{ x: 0, rotateZ: 0, rotateY: 0, scale: 0.95 }}
              animate={{ x: 75, y: -12, rotateZ: 14, rotateY: -22, scale: 1 }}
              transition={{ duration: 0.75, ease: "easeInOut" }}
              className="absolute w-24 h-36 rounded-xl border border-[#7FB3D5]/60 bg-[#1A140F] shadow-[0_12px_28px_rgba(0,0,0,0.85),0_0_20px_rgba(127,179,213,0.35)] overflow-hidden"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="absolute -right-1.5 top-0 bottom-0 w-1.5 bg-[#2C2114] border-l border-[#45341F]" />
              <CardBackGraphic cardBackUrl={cardBackUrl} />
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded bg-[#16120E]/90 text-[8px] font-mono text-[#7FB3D5] border border-[#263D50]">
                ÂM
              </div>
            </motion.div>
          </div>
        )}

        {/* Phase 2: Riffle Interlacing (1800 - 3300ms) */}
        {phase === 2 && (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Left Base Deck */}
            <div
              className="absolute w-24 h-36 rounded-xl border border-[#483621] bg-[#18130E] shadow-xl overflow-hidden"
              style={{
                transform: "translate(-68px, 0px) rotateZ(-15deg) rotateY(26deg)",
              }}
            >
              <CardBackGraphic cardBackUrl={cardBackUrl} />
            </div>

            {/* Right Base Deck */}
            <div
              className="absolute w-24 h-36 rounded-xl border border-[#483621] bg-[#18130E] shadow-xl overflow-hidden"
              style={{
                transform: "translate(68px, 0px) rotateZ(15deg) rotateY(-26deg)",
              }}
            >
              <CardBackGraphic cardBackUrl={cardBackUrl} />
            </div>

            {/* Flying / Riffling interlaced cards with golden arc flight */}
            {riffleCards.map((card) => (
              <motion.div
                key={card.id}
                initial={{
                  x: card.isLeft ? -64 : 64,
                  y: -30,
                  rotateZ: card.isLeft ? -18 : 18,
                  rotateY: card.isLeft ? 30 : -30,
                  opacity: 0.85,
                  scale: 0.95,
                }}
                animate={{
                  x: 0,
                  y: card.id * 1.2 - 14,
                  rotateZ: (card.id % 2 === 0 ? -1 : 1) * 2,
                  rotateY: 0,
                  opacity: 1,
                  scale: 1,
                }}
                transition={{
                  duration: 0.42,
                  delay: card.delay,
                  ease: [0.2, 0.85, 0.3, 1],
                }}
                className="absolute w-24 h-36 rounded-xl border border-[#D4AF37]/70 bg-[#16120E] shadow-[0_4px_16px_rgba(0,0,0,0.85),0_0_14px_rgba(212,175,55,0.45)] overflow-hidden"
                style={{ zIndex: card.id + 10 }}
              >
                <CardBackGraphic cardBackUrl={cardBackUrl} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Phase 3: Waterfall Bridge Cascade (3300 - 4300ms) */}
        {phase === 3 && (
          <div className="relative w-full h-full flex items-center justify-center">
            <motion.div
              initial={{ scaleY: 1.3, y: -24, rotateX: 28 }}
              animate={{ scaleY: [1.3, 1.15, 1], y: [-24, -8, 0], rotateX: [28, 12, 0] }}
              transition={{ duration: 0.95, ease: "easeInOut" }}
              className="relative w-26 h-38 rounded-xl border-2 border-[#D4AF37] bg-[#18130E] shadow-[0_18px_40px_rgba(0,0,0,0.92),0_0_35px_rgba(212,175,55,0.7)] overflow-hidden flex items-center justify-center"
            >
              <CardBackGraphic cardBackUrl={cardBackUrl} />
              {/* Cascade Sweeping Sheen */}
              <motion.div
                initial={{ y: "-120%" }}
                animate={{ y: "160%" }}
                transition={{ duration: 0.85, ease: "linear", repeat: 1 }}
                className="absolute inset-x-0 h-14 bg-gradient-to-b from-transparent via-white/50 to-transparent pointer-events-none"
              />
            </motion.div>

            {/* Flowing micro cascade ghost cards */}
            {[-16, -8, 8, 16].map((offset, idx) => (
              <motion.div
                key={idx}
                initial={{ y: -36 + idx * 8, opacity: 0.7, scale: 0.94 }}
                animate={{ y: 0, opacity: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="absolute w-26 h-38 rounded-xl border border-[#D4AF37]/40 bg-[#16120E] pointer-events-none"
                style={{ transform: `translateX(${offset}px) rotate(${offset * 0.4}deg)` }}
              />
            ))}
          </div>
        )}

        {/* Phase 4: Deck Cut & Rotation (4300 - 4900ms) */}
        {phase === 4 && (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Bottom Stack */}
            <motion.div
              initial={{ x: 0, scale: 0.96 }}
              animate={{ x: [-20, 0], scale: 1 }}
              transition={{ duration: 0.55, ease: "easeInOut" }}
              className="absolute w-26 h-38 rounded-xl border border-[#523F27] bg-[#1A140F] shadow-[0_10px_25px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              <CardBackGraphic cardBackUrl={cardBackUrl} />
            </motion.div>

            {/* Top Cut Stack: slides to right, swoops under with crisp alignment */}
            <motion.div
              initial={{ x: 0, y: -6, zIndex: 30 }}
              animate={{
                x: [0, 60, 0],
                y: [-6, -18, 4],
                rotateZ: [0, 8, 0],
                zIndex: [30, 30, 5],
              }}
              transition={{ duration: 0.55, ease: "easeInOut" }}
              className="absolute w-26 h-38 rounded-xl border-2 border-[#D4AF37] bg-[#16120E] shadow-[0_12px_30px_rgba(0,0,0,0.9),0_0_20px_rgba(212,175,55,0.5)] overflow-hidden"
            >
              <CardBackGraphic cardBackUrl={cardBackUrl} />
            </motion.div>
          </div>
        )}

        {/* Phase 5: Final Golden Flourish (4900 - 5500ms) */}
        {phase >= 5 && (
          <motion.div
            initial={{ scale: 0.92, opacity: 0.8 }}
            animate={{ scale: [0.94, 1.1, 1], opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative w-28 h-42 rounded-2xl border-2 border-[#FFF] bg-[#1B1510] shadow-[0_0_50px_rgba(212,175,55,1),0_20px_40px_rgba(0,0,0,0.95)] overflow-hidden flex items-center justify-center"
          >
            <CardBackGraphic cardBackUrl={cardBackUrl} />
            <div className="absolute inset-0 bg-radial from-[#D4AF37]/50 via-transparent to-transparent animate-pulse pointer-events-none" />
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 2.2, opacity: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="absolute inset-0 border-2 border-[#FFE599] rounded-2xl pointer-events-none"
            />
          </motion.div>
        )}
      </div>

      {/* Progress & Mystical Text Info */}
      <div className="mt-4 flex flex-col items-center text-center space-y-1.5 z-10">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#18130E] border border-[#483722] text-[#D4AF37] text-xs font-serif font-bold shadow-lg">
          <Shuffle className="w-3.5 h-3.5 animate-spin text-[#D4AF37]" />
          <span>
            {phase === 0
              ? "Tâm tịnh vạn sự thông • Gom tụ 64 quẻ..."
              : phase === 1
              ? "Phân tách Lưỡng Nghi: Dương thăng - Âm giáng..."
              : phase === 2
              ? "Chẻ bài đan xen liên hoàn 64 quẻ Thiên Địa..."
              : phase === 3
              ? "Thác bài quy nhất • Khí vận tương thông..."
              : phase === 4
              ? "Cắt hoán vị quẻ số • Bát Quái định vị..."
              : "Hoàn tất xáo quẻ • Mời thí chủ thỉnh bài!"}
          </span>
        </div>

        <p className="text-[11px] text-[#A69780] font-serif italic max-w-xs">
          {phase < 5
            ? "Càn Khôn hoán vị, Bát Quái giao thoa, vạn vật chuyển động..."
            : "Linh khí đã hội tụ trọn vẹn vào 64 lá bài Kinh Dịch."}
        </p>

        {/* Mini Progress Bar with Countdown Timer */}
        <div className="flex items-center gap-2 mt-1">
          <div className="w-48 h-1.5 rounded-full bg-[#261E14] overflow-hidden border border-[#3D3021]">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: durationMs / 1000, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-[#C89B3C] via-[#F3E7CF] to-[#D4AF37] rounded-full shadow-[0_0_10px_rgba(212,175,55,0.9)]"
            />
          </div>
          <span className="text-[10px] font-mono text-[#D4AF37] font-bold min-w-[28px] text-right">
            {(remainingTime / 1000).toFixed(1)}s
          </span>
        </div>
      </div>
    </div>
  );
};

const CardBackGraphic: React.FC<{ cardBackUrl?: string | null }> = ({ cardBackUrl }) => {
  if (cardBackUrl) {
    return (
      <img
        src={cardBackUrl}
        alt="Lưng bài"
        className="w-full h-full object-cover select-none pointer-events-none"
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div className="w-full h-full bg-gradient-to-b from-[#241C15] via-[#16120E] to-[#0E0C09] flex flex-col items-center justify-between p-2 select-none">
      <div className="w-full flex justify-between items-center text-[8px] text-[#C8B89E] font-mono">
        <span>☯</span>
        <span>KINH DỊCH</span>
        <span>☯</span>
      </div>
      <div className="w-9 h-9 rounded-full border-2 border-[#D4AF37] bg-[#1A140F] flex items-center justify-center shadow-inner">
        <span className="text-lg text-[#D4AF37] animate-pulse">☯</span>
      </div>
      <div className="text-[7px] text-[#8C7A62] font-mono tracking-widest uppercase">
        64 Quẻ Bát Quái
      </div>
    </div>
  );
};
