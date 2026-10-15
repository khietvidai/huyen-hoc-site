import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Hexagram } from "../types";
import { HexagramVisual } from "./HexagramVisual";
import { RotateCw, Compass, Sparkles } from "lucide-react";

export interface HoverCardData {
  card: Hexagram;
  positionTitle?: string;
  positionSubtitle?: string;
  isReversed?: boolean;
}

interface FullScreenCardHoverModalProps {
  data: HoverCardData | null;
  cardImages?: Record<number, string>;
  cardVideos?: Record<number, string>;
  cardBackUrl?: string | null;
  fitMode?: "contain" | "cover";
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onOpenDetailedZoom?: (card: Hexagram) => void;
}

export const FullScreenCardHoverModal: React.FC<FullScreenCardHoverModalProps> = ({
  data,
  cardImages = {},
  cardVideos = {},
  cardBackUrl = null,
  fitMode = "contain",
  onClose,
  onMouseEnter,
  onMouseLeave,
}) => {
  const [tilt, setTilt] = useState({
    rotateX: 0,
    rotateY: 0,
    glareX: 50,
    glareY: 50,
  });

  const [isFlipped, setIsFlipped] = useState(false);

  // Reset tilt and flip state on new card
  useEffect(() => {
    setTilt({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 });
    setIsFlipped(false);
  }, [data?.card?.number]);

  // Keyboard shortcuts: Escape to close, 'F' or Space to 3D Flip
  useEffect(() => {
    if (!data) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key.toLowerCase() === "f" || e.key === " ") {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [data, onClose]);

  // Close on scroll
  useEffect(() => {
    if (!data) return;
    const handleScroll = () => {
      onClose();
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [data, onClose]);

  if (!data) return null;

  const { card, positionTitle, isReversed } = data;
  const imageUrl = cardImages[card.number];
  const videoUrl = cardVideos[card.number];

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rotX = (0.5 - py) * 20; // -10 to +10 deg
    const rotY = (px - 0.5) * 22; // -11 to +11 deg
    setTilt({
      rotateX: Math.round(rotX * 10) / 10,
      rotateY: Math.round(rotY * 10) / 10,
      glareX: Math.round(px * 100),
      glareY: Math.round(py * 100),
    });
  };

  const handlePointerLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 });
    if (onMouseLeave) onMouseLeave();
  };

  const handleToggleFlip = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsFlipped((prev) => !prev);
  };

  return (
    <AnimatePresence>
      {/* 
        NO dark background overlay! 
        Transparent floating layer allowing full view of the spread table underneath.
      */}
      <div
        className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center p-4 select-none"
        style={{ perspective: "1400px" }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.52, y: 55, rotateX: 28, rotateY: -70 }}
          animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0, rotateY: 0 }}
          exit={{ opacity: 0, scale: 0.62, y: 30, rotateY: 45, transition: { duration: 0.18 } }}
          transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={handlePointerLeave}
          onPointerMove={handlePointerMove}
          className="pointer-events-auto relative flex flex-col items-center cursor-pointer"
          style={{
            transform: `perspective(1200px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) translateZ(40px)`,
            transformStyle: "preserve-3d",
            transition: "transform 0.08s ease-out",
            willChange: "transform",
          }}
        >
          {/* Position Title Ribbon floating just above the card (strictly NO Cát/Hung) */}
          {positionTitle && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-2 px-3.5 py-1 rounded-full text-xs font-serif font-bold text-[#FFE28A] bg-[#22170D]/95 border border-[#624726] shadow-[0_4px_16px_rgba(0,0,0,0.85)] backdrop-blur-sm truncate max-w-[300px] text-center"
              style={{ transform: "translateZ(35px)" }}
            >
              {positionTitle}
            </motion.div>
          )}

          {/* 
            3D Card Flipper Box
            Handles the 180° rotation between Front (Mặt Quẻ) and Back (Lưng Bài)
          */}
          <div
            onClick={handleToggleFlip}
            className="relative w-[265px] sm:w-[285px] h-[395px] sm:h-[425px] select-none"
            style={{
              transformStyle: "preserve-3d",
              transform: `rotateY(${isFlipped ? 180 : 0}deg)`,
              transition: "transform 0.65s cubic-bezier(0.34, 1.4, 0.64, 1)",
            }}
            title="Nhấp vào lá bài để lật mặt trước / mặt sau 3D"
          >
            {/* ============================================================== */}
            {/* FRONT FACE (MẶT TRƯỚC / HÌNH QUẺ CHI TIẾT)                     */}
            {/* ============================================================== */}
            <div
              className="absolute inset-0 rounded-2xl overflow-hidden border-2 border-[#D4AF37] bg-gradient-to-b from-[#201811] via-[#140F0A] to-[#0D0906] flex flex-col justify-between p-3 sm:p-4 shadow-2xl"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                boxShadow: `
                  ${-tilt.rotateY * 1.5}px ${tilt.rotateX * 1.5 + 28}px 45px -8px rgba(0, 0, 0, 0.95),
                  0 0 35px rgba(212, 175, 55, 0.38),
                  inset 0 0 20px rgba(0, 0, 0, 0.7)
                `,
              }}
            >
              {/* Inner Gold Inset Foil Border */}
              <div className="absolute inset-1 rounded-xl border border-[#FFE28A]/35 pointer-events-none z-20" />

              {/* Specular Glare / Light reflection on Front Face */}
              <div
                className="absolute inset-0 pointer-events-none rounded-2xl transition-opacity duration-150 z-30"
                style={{
                  background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 245, 220, 0.38) 0%, rgba(212, 175, 55, 0.16) 35%, transparent 65%)`,
                  mixBlendMode: "screen",
                }}
              />

              {videoUrl ? (
                /* Custom Video Card Visual */
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-xl bg-black">
                  <video
                    src={videoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className={`w-full h-full ${
                      fitMode === "cover" ? "object-cover" : "object-contain"
                    } select-none ${isReversed ? "rotate-180" : ""}`}
                  />
                </div>
              ) : imageUrl ? (
                /* Custom Artwork Image Card Visual */
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-xl bg-black">
                  <img
                    src={imageUrl}
                    alt={card.name}
                    referrerPolicy="no-referrer"
                    className={`w-full h-full ${
                      fitMode === "cover" ? "object-cover" : "object-contain"
                    } select-none pointer-events-none transition-transform duration-300 ${
                      isReversed ? "rotate-180" : ""
                    }`}
                  />
                </div>
              ) : (
                /* Mystic Classical Face of the Hexagram Card */
                <div className="w-full h-full flex flex-col justify-between items-center text-center p-2 relative z-10">
                  {/* Top Card Info (Quẻ #, Hanzi, Ngũ Hành - strictly NO Cát/Hung) */}
                  <div className="w-full flex items-center justify-between text-[#8E7E69] pb-2 border-b border-[#2D2115]">
                    <span className="font-mono text-xs font-bold text-[#D4AF37]">
                      QUẺ #{card.number.toString().padStart(2, "0")}
                    </span>
                    <span className="font-serif text-lg text-[#F5EAD4] font-bold">
                      {card.hanzi}
                    </span>
                    <span className="text-[11px] text-[#A89882] font-serif">
                      Hành {card.element}
                    </span>
                  </div>

                  {/* Center Hexagram 6 Yin/Yang Lines */}
                  <div className={`my-auto flex flex-col items-center ${isReversed ? "rotate-180" : ""}`}>
                    <div className="w-24 my-2 drop-shadow-[0_0_12px_rgba(212,175,55,0.35)]">
                      <HexagramVisual hexagram={card} size="md" showLabels={false} />
                    </div>
                    <div className="text-xs text-[#D4AF37] font-serif font-medium mt-1">
                      {card.upperTrigram} (Thượng) / {card.lowerTrigram} (Hạ)
                    </div>
                  </div>

                  {/* Bottom Card Title */}
                  <div className="w-full pt-2 border-t border-[#2D2115] space-y-0.5">
                    <h4 className="font-serif font-bold text-base text-[#F5EAD4]">
                      {card.name}
                    </h4>
                    <div className="text-xs text-[#C5B59C] font-serif">
                      {card.vietnameseName}
                    </div>
                  </div>
                </div>
              )}

              {/* Reversed Seal Badge (if card is reversed) */}
              {isReversed && (
                <div className="absolute top-2.5 right-2.5 pointer-events-none z-30">
                  <span className="px-2 py-0.5 rounded-md bg-amber-950/95 font-serif font-bold text-[10px] text-[#FFE28A] border border-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.4)]">
                    VỊ TRÍ NGƯỢC
                  </span>
                </div>
              )}
            </div>

            {/* ============================================================== */}
            {/* BACK FACE (MẶT SAU / LƯNG BÀI THỰC TẾ 3D)                       */}
            {/* ============================================================== */}
            <div
              className="absolute inset-0 rounded-2xl overflow-hidden border-2 border-[#D4AF37] bg-gradient-to-b from-[#1E1610] via-[#120D08] to-[#0A0704] flex flex-col justify-between p-3 sm:p-4 shadow-2xl"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
                boxShadow: `
                  ${tilt.rotateY * 1.5}px ${tilt.rotateX * 1.5 + 28}px 45px -8px rgba(0, 0, 0, 0.95),
                  0 0 35px rgba(212, 175, 55, 0.38),
                  inset 0 0 20px rgba(0, 0, 0, 0.7)
                `,
              }}
            >
              {/* Inner Gold Inset Foil Border */}
              <div className="absolute inset-1 rounded-xl border border-[#FFE28A]/35 pointer-events-none z-20" />

              {/* Dynamic Glare Reflection on Back Face */}
              <div
                className="absolute inset-0 pointer-events-none rounded-2xl transition-opacity duration-150 z-30"
                style={{
                  background: `radial-gradient(circle at ${100 - tilt.glareX}% ${tilt.glareY}%, rgba(255, 245, 220, 0.38) 0%, rgba(212, 175, 55, 0.16) 35%, transparent 65%)`,
                  mixBlendMode: "screen",
                }}
              />

              {cardBackUrl ? (
                /* Custom Deck Back Image */
                <div className="w-full h-full flex items-center justify-center bg-black overflow-hidden rounded-xl">
                  <img
                    src={cardBackUrl}
                    alt="Lưng bài Kinh Dịch"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover select-none pointer-events-none"
                  />
                </div>
              ) : (
                /* Classical I Ching Card Back Graphic */
                <div className="w-full h-full flex flex-col items-center justify-between p-2 sm:p-3 text-center relative z-10 select-none">
                  {/* Top Seal */}
                  <div className="w-full flex justify-between items-center text-[#D4AF37] font-serif text-xs font-bold tracking-wider opacity-90 border-b border-[#3B2C1A] pb-2">
                    <span>周易</span>
                    <span className="text-[10px] tracking-widest text-[#E6C98A] flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-[#D4AF37]" />
                      KINH DỊCH
                    </span>
                    <span>神卦</span>
                  </div>

                  {/* Center Mystic Taiji Emblem with Spinning Trigram Ring */}
                  <div className="relative my-auto flex items-center justify-center py-4">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-[#D4AF37]/50 border-dashed animate-[spin_50s_linear_infinite]" />
                    <div className="absolute w-20 h-20 sm:w-22 sm:h-22 rounded-full border border-[#FFE28A]/40" />
                    <div className="absolute w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#241A10] border-2 border-[#D4AF37] flex items-center justify-center shadow-[0_0_25px_rgba(212,175,55,0.45)]">
                      <span className="text-2xl sm:text-3xl text-[#FFE28A] font-bold">☯</span>
                    </div>
                  </div>

                  {/* Bottom Emblem */}
                  <div className="w-full border-t border-[#3B2C1A] pt-2 flex flex-col items-center gap-0.5">
                    <span className="font-serif text-[11px] font-bold text-[#D4AF37] tracking-widest uppercase">
                      Bát Quái • Lục Thập Tứ Quái
                    </span>
                    <span className="text-[9px] text-[#8C7A62] font-mono">
                      64 HEXAGRAMS WISDOM DECK
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Realistic Detached Floating Floor Shadow Below the Held Card */}
          <div
            className="w-[220px] sm:w-[240px] h-6 rounded-[100%] bg-black/60 blur-md mt-1 pointer-events-none transition-all duration-100"
            style={{
              transform: `translate(${tilt.rotateY * 1.8}px, ${20 - tilt.rotateX * 0.8}px) scale(${1 - Math.abs(tilt.rotateX) * 0.01})`,
            }}
          />

          {/* Interactive 3D Flip Action Button */}
          <div
            className="mt-3 flex flex-col items-center gap-1.5"
            style={{ transform: "translateZ(35px)" }}
          >
            <button
              type="button"
              onClick={handleToggleFlip}
              className="px-3.5 py-1.5 rounded-full text-xs font-serif font-bold text-[#FFE28A] bg-[#22170D]/95 hover:bg-[#342416] border border-[#D4AF37] shadow-[0_4px_16px_rgba(0,0,0,0.85)] backdrop-blur-sm flex items-center gap-1.5 transition-all cursor-pointer group hover:scale-105 active:scale-95"
            >
              <RotateCw
                className={`w-3.5 h-3.5 text-[#D4AF37] transition-transform duration-500 ${
                  isFlipped ? "rotate-180" : "group-hover:rotate-90"
                }`}
              />
              <span>{isFlipped ? "Lật Xem Mặt Trước (Quẻ)" : "Lật Xem Mặt Sau (Lưng Bài)"}</span>
            </button>

            <span className="text-[10px] text-[#B8AA96] font-serif bg-black/60 px-2.5 py-0.5 rounded-full border border-[#3E2E1D] backdrop-blur-xs">
              Nhấp vào lá bài hoặc phím cách để lật 3D • Rê chuột để nghiêng
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
