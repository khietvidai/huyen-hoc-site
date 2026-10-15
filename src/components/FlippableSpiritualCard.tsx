import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Sparkles, RotateCw } from "lucide-react";
import { Hexagram } from "../types";
import { CardVisual } from "./CardVisual";
import { zenAudio } from "../utils/zenAudio";

interface FlippableSpiritualCardProps {
  hexagram?: Hexagram;
  imageUrl?: string | null;
  videoUrl?: string | null;
  cardBackUrl?: string | null;
  defaultFlipped?: boolean; // true = showing front (hexagram), false = showing back (Bát Quái)
  isReversed?: boolean;
  size?: "tiny" | "xs" | "sm" | "md" | "lg" | "xl" | "draw-2" | "draw-3";
  slotNumber?: number;
  deckNumber?: number;
  autoFlipDelayMs?: number; // If set, automatically flips from back to front after this delay
  onFlipped?: (isFront: boolean) => void;
  onRotate?: () => void;
  onImageUpdated?: (num: number, url: string) => void;
  onVideoUpdated?: (num: number, url: string) => void;
  onClick?: () => void;
  className?: string;
  allowFlipOnClick?: boolean;
  subTitle?: string;
  fitMode?: "contain" | "cover";
  draggable?: boolean;
  dragKey?: number | string;
  enableHoverZoom?: boolean;
  hoverScale?: number;
}

export const FlippableSpiritualCard: React.FC<FlippableSpiritualCardProps> = ({
  hexagram,
  imageUrl,
  videoUrl,
  cardBackUrl,
  defaultFlipped = true,
  isReversed = false,
  size = "md",
  slotNumber,
  deckNumber,
  autoFlipDelayMs,
  onFlipped,
  onRotate,
  onImageUpdated,
  onVideoUpdated,
  onClick,
  className = "",
  allowFlipOnClick = true,
  subTitle,
  fitMode = "contain",
  draggable = false,
  dragKey,
  enableHoverZoom = true,
  hoverScale,
}) => {
  const [isFront, setIsFront] = useState<boolean>(defaultFlipped);
  const [isSweeping, setIsSweeping] = useState<boolean>(false);
  const isDraggingRef = useRef<boolean>(false);

  const getHoverScale = () => {
    if (hoverScale !== undefined) return hoverScale;
    switch (size) {
      case "tiny":
        return 1.85;
      case "xs":
        return 1.65;
      case "draw-3":
        return 1.5;
      case "sm":
        return 1.45;
      case "draw-2":
        return 1.35;
      case "md":
        return 1.3;
      case "lg":
      case "xl":
        return 1.18;
      default:
        return 1.4;
    }
  };

  // Synchronize flip state when defaultFlipped changes
  useEffect(() => {
    setIsFront(defaultFlipped);
  }, [defaultFlipped]);

  // Auto flip effect if autoFlipDelayMs is specified
  useEffect(() => {
    if (autoFlipDelayMs !== undefined && autoFlipDelayMs >= 0 && !defaultFlipped) {
      const timer = setTimeout(() => {
        setIsFront(true);
        setIsSweeping(true);
        zenAudio.playCardFlipSound();
        if (onFlipped) onFlipped(true);
        setTimeout(() => setIsSweeping(false), 1200);
      }, autoFlipDelayMs);
      return () => clearTimeout(timer);
    }
  }, [autoFlipDelayMs, defaultFlipped, onFlipped]);

  const handleToggleFlip = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (!allowFlipOnClick) return;
    const nextState = !isFront;
    setIsFront(nextState);
    if (nextState) {
      setIsSweeping(true);
      setTimeout(() => setIsSweeping(false), 1200);
    }
    zenAudio.playCardFlipSound();
    if (onFlipped) onFlipped(nextState);
  };

  const handleCardClick = () => {
    if (isDraggingRef.current) return;
    const wasFront = isFront;
    if (allowFlipOnClick) {
      handleToggleFlip();
    }
    // Chỉ kích hoạt onClick (hiệu ứng phóng to/xem chi tiết) khi lá bài đã ở mặt ngửa, không phóng to khi ở mặt sấp
    if (wasFront && onClick) {
      onClick();
    }
  };

  return (
    <motion.div
      key={dragKey}
      drag={draggable}
      dragMomentum={false}
      dragElastic={0.06}
      whileDrag={{
        scale: 1.05,
        zIndex: 90,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.75)",
        cursor: "grabbing",
      }}
      whileHover={
        enableHoverZoom
          ? {
              scale: getHoverScale(),
              y: -14,
              zIndex: 80,
              filter: "drop-shadow(0 20px 32px rgba(0,0,0,0.92)) drop-shadow(0 0 25px rgba(212,175,55,0.65))",
              transition: {
                type: "spring",
                stiffness: 380,
                damping: 24,
                mass: 0.6,
              },
            }
          : undefined
      }
      onDragStart={() => {
        isDraggingRef.current = true;
      }}
      onDragEnd={() => {
        setTimeout(() => {
          isDraggingRef.current = false;
        }, 120);
      }}
      className={`relative flex flex-col items-center select-none group ${draggable ? "cursor-grab active:cursor-grabbing" : ""} ${className}`}
    >
      {/* Card 3D Flip Container with Perspective */}
      <div
        style={{ perspective: 1000 }}
        className="relative inline-block cursor-pointer"
        onClick={handleCardClick}
      >
        <motion.div
          animate={{ rotateY: isFront ? 0 : 180 }}
          transition={{ duration: 0.65, ease: [0.23, 1, 0.32, 1] }}
          style={{ transformStyle: "preserve-3d" }}
          className="relative flip-card-3d-inner"
        >
          {/* FRONT FACE (Hexagram & Image/Video) */}
          <div
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
            className="relative flip-card-front-face"
          >
            <CardVisual
              hexagram={hexagram}
              imageUrl={imageUrl}
              videoUrl={videoUrl}
              cardBackUrl={cardBackUrl}
              isBack={false}
              size={size}
              slotNumber={slotNumber}
              isReversed={isReversed}
              onImageUpdated={onImageUpdated}
              onVideoUpdated={onVideoUpdated}
              fitMode={fitMode}
            />

            {/* Spiritual Light Sweep Shine upon opening */}
            {isSweeping && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-xl sm:rounded-2xl z-30">
                <div className="w-full h-full bg-gradient-to-r from-transparent via-[#FFF4D0]/60 to-transparent animate-card-sweep" />
              </div>
            )}
          </div>

          {/* BACK FACE (Sacred Bát Quái ☯) */}
          <div
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
            className="absolute inset-0 flip-card-back-face"
          >
            <CardVisual
              cardBackUrl={cardBackUrl}
              isBack={true}
              size={size}
              slotNumber={slotNumber}
              isReversed={isReversed}
              onImageUpdated={onImageUpdated}
              onVideoUpdated={onVideoUpdated}
              fitMode={fitMode}
            />
          </div>
        </motion.div>

        {/* Quick Rotate Button on Hover (Top-Right) */}
        {onRotate && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRotate();
            }}
            className="no-capture absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#18120C]/95 hover:bg-[#2B2014] border border-[#53402A] hover:border-[#D4AF37] text-[#D4AF37] hover:text-[#FFF] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md z-30 cursor-pointer active:scale-90"
            title="Bấm để xoay chiều lá bài 180° (Thuận / Ngược)"
          >
            <RotateCw className="w-3 h-3 transition-transform duration-300 hover:rotate-180" />
          </button>
        )}

        {/* Deck badge if multi-deck */}
        {deckNumber && deckNumber > 0 && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-[#16120D] border border-[#D4AF37]/60 text-[9.5px] font-mono font-bold text-[#D4AF37] shadow-lg z-20 pointer-events-none">
            Bộ #{deckNumber}
          </div>
        )}
      </div>

      {subTitle && (
        <div className="mt-1 text-[11px] text-[#A69780] font-serif text-center pointer-events-none">
          {subTitle}
        </div>
      )}
    </motion.div>
  );
};
