import React, { useState, useCallback, useRef } from "react";
import { X, ZoomIn, ZoomOut, RotateCcw, RotateCw, Download, Move, Sparkles } from "lucide-react";
import { Hexagram } from "../types";
import { HexagramVisual } from "./HexagramVisual";
import { zenAudio } from "../utils/zenAudio";
import { downloadDataUrlAsPng } from "../utils/captureHelper";

interface CardVisualProps {
  hexagram?: Hexagram;
  imageUrl?: string | null;
  videoUrl?: string | null;
  cardBackUrl?: string | null;
  isBack?: boolean;
  slotNumber?: number;
  size?: "tiny" | "xs" | "sm" | "md" | "lg" | "xl" | "draw-2" | "draw-3";
  showName?: boolean;
  showUploadTrigger?: boolean;
  isReversed?: boolean;
  onImageUpdated?: (cardNumber: number, newUrl: string) => void;
  onVideoUpdated?: (cardNumber: number, newVideoUrl: string) => void;
  onClick?: () => void;
  className?: string;
  enableParallax?: boolean;
  fitMode?: "contain" | "cover";
  enableZoomModal?: boolean;
}

export const CardVisual: React.FC<CardVisualProps> = ({
  hexagram,
  imageUrl,
  videoUrl,
  cardBackUrl,
  isBack = false,
  slotNumber,
  size = "md",
  showName = true,
  isReversed = false,
  onClick,
  className = "",
  enableParallax = true,
  fitMode = "contain",
  enableZoomModal = false,
  onVideoUpdated,
}) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [isZoomFlipped, setIsZoomFlipped] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // 3D Parallax Tilt State
  const cardElementRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({
    rotateX: 0,
    rotateY: 0,
    glareX: 50,
    glareY: 50,
    active: false,
  });

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!enableParallax || !cardElementRef.current) return;
    const rect = cardElementRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    const maxTilt = size === "xs" ? 18 : size === "sm" ? 22 : 26;
    const rotX = -((py - 0.5) * maxTilt);
    const rotY = (px - 0.5) * maxTilt;

    setTilt({
      rotateX: Math.round(rotX * 10) / 10,
      rotateY: Math.round(rotY * 10) / 10,
      glareX: Math.round(px * 100),
      glareY: Math.round(py * 100),
      active: true,
    });
  };

  const handlePointerLeave = () => {
    if (!enableParallax) return;
    setTilt((prev) => ({
      ...prev,
      rotateX: 0,
      rotateY: 0,
      active: false,
    }));
  };

  const handleOpenZoom = () => {
    setZoomScale(1);
    setPan({ x: 0, y: 0 });
    setIsZoomFlipped(false);
    setIsZoomed(true);
  };

  const handleZoomIn = () => {
    setZoomScale((prev) => Math.min(4, Math.round((prev + 0.25) * 100) / 100));
  };

  const handleZoomOut = () => {
    setZoomScale((prev) => Math.max(0.5, Math.round((prev - 0.25) * 100) / 100));
  };

  const handleResetZoom = () => {
    setZoomScale(1);
    setPan({ x: 0, y: 0 });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const factor = e.deltaY < 0 ? 1.15 : 0.87;
    setZoomScale((prev) => {
      const next = Math.round(prev * factor * 100) / 100;
      return Math.min(4, Math.max(0.5, next));
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1) {
      setPan({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleDoubleClick = () => {
    if (zoomScale === 1) {
      setZoomScale(2);
    } else {
      setZoomScale(1);
      setPan({ x: 0, y: 0 });
    }
  };

  const handleDownloadCard = () => {
    if (!imageUrl) return;
    downloadDataUrlAsPng(imageUrl, `la-bai-${hexagram ? hexagram.number : "iching"}.png`);
  };

  // Size configurations
  const sizeClasses = {
    tiny: "w-32 h-48 sm:w-36 sm:h-54 text-[10px]",
    xs: "w-36 h-54 sm:w-44 sm:h-66 text-[11px]",
    sm: "w-44 h-66 sm:w-52 sm:h-[312px] text-xs",
    md: "w-52 h-[312px] sm:w-60 sm:h-[360px] text-sm",
    lg: "w-64 h-[384px] sm:w-72 sm:h-[432px] text-base",
    xl: "w-72 h-[432px] sm:w-84 sm:h-[504px] text-lg",
    "draw-2": "w-56 h-[336px] sm:w-64 sm:h-[384px] md:w-72 md:h-[432px] text-xs sm:text-sm",
    "draw-3": "w-48 h-[288px] sm:w-56 sm:h-[336px] md:w-56 md:h-[336px] lg:w-64 lg:h-[384px] text-xs sm:text-sm",
  };

  const isTiny = size === "tiny" || size === "xs";
  const isSmall = size === "sm";

  // Render Card Back
  if (isBack) {
    return (
      <div
        ref={cardElementRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onClick={onClick}
        style={{
          transform: enableParallax && tilt.active
            ? `perspective(550px) rotateX(${tilt.rotateX * 0.4}deg) rotateY(${tilt.rotateY * 0.4}deg) translateZ(0px) scale3d(1, 1, 1)`
            : "perspective(550px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale3d(1, 1, 1)",
          transition: tilt.active
            ? "transform 0.06s ease-out"
            : "transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.4s ease-out",
          boxShadow: enableParallax && tilt.active
            ? `${-tilt.rotateY * 0.8}px ${tilt.rotateX * 0.8 + 10}px 18px rgba(0, 0, 0, 0.8), 0 0 14px rgba(212, 175, 55, 0.3)`
            : undefined,
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
        className={`relative select-none rounded-xl sm:rounded-2xl overflow-hidden border-2 border-[#524433] shadow-xl transition-colors cursor-pointer ${sizeClasses[size]} ${className} bg-gradient-to-br from-[#251D16] via-[#1A140F] to-[#100C09]`}
      >
        {slotNumber !== undefined && (
          <div
            style={{ transform: "translateZ(12px)" }}
            className="absolute top-1 left-1 z-20 text-[9px] font-mono font-bold text-[#C9A55A] bg-[#120F0C]/85 px-1 py-0.2 rounded border border-[#3E3224] shadow"
          >
            #{slotNumber.toString().padStart(2, "0")}
          </div>
        )}

        {/* 3D Dynamic Parallax Glare / Light Reflection */}
        {enableParallax && (
          <div
            className="absolute inset-0 pointer-events-none rounded-xl sm:rounded-2xl transition-opacity duration-200 z-30"
            style={{
              opacity: tilt.active ? 1 : 0,
              background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 245, 215, 0.4) 0%, rgba(212, 175, 55, 0.18) 25%, transparent 65%)`,
              mixBlendMode: "screen",
            }}
          />
        )}

        {cardBackUrl ? (
          <div className="w-full h-full flex items-center justify-center bg-[#100C09] p-0.5">
            <img
              src={cardBackUrl}
              alt="Mặt sau lá bài"
              referrerPolicy="no-referrer"
              className={`w-full h-full ${
                fitMode === "cover" ? "object-cover" : "object-contain"
              }`}
            />
          </div>
        ) : (
          <div
            style={{ transform: "translateZ(8px)" }}
            className={`w-full h-full ${isTiny ? "p-1" : isSmall ? "p-1.5" : "p-2 sm:p-3"} flex flex-col items-center justify-between border border-[#3A2F22] rounded-lg sm:rounded-xl m-0.5`}
          >
            <div className={`w-full flex justify-between items-center text-[#8C7652] opacity-80 ${isTiny ? "text-[7px]" : "text-[9px] sm:text-[10px]"} font-serif`}>
              <span>周易</span>
              <span>神卦</span>
            </div>

            {/* Mystic Center Symbol */}
            <div className="relative flex items-center justify-center">
              <div
                className={`${
                  isTiny
                    ? "w-7 h-7 border"
                    : isSmall
                    ? "w-10 h-10 border"
                    : "w-12 h-12 sm:w-16 sm:h-16 border-2"
                } rounded-full border-[#A88B58]/40 border-dashed animate-[spin_40s_linear_infinite]`}
              />
              <div
                className={`absolute ${
                  isTiny
                    ? "w-5 h-5"
                    : isSmall
                    ? "w-7 h-7"
                    : "w-8 h-8 sm:w-12 sm:h-12"
                } rounded-full bg-[#241B13] border border-[#C89B3C] flex items-center justify-center shadow-[0_0_15px_rgba(200,155,60,0.3)]`}
              >
                <span className={`text-[#D6B97A] ${isTiny ? "text-[10px]" : isSmall ? "text-xs" : "text-sm sm:text-xl"} font-bold`}>
                  ☯
                </span>
              </div>
            </div>

            <div className={`w-full flex justify-between items-center text-[#8C7652] opacity-80 ${isTiny ? "text-[7px]" : "text-[9px] sm:text-[10px]"} font-serif`}>
              <span>KINH</span>
              <span>DỊCH</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // If no hexagram is passed
  if (!hexagram) return null;

  return (
    <>
      {/* Main Card Container */}
      <div
        ref={cardElementRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onClick={(e) => {
          if (onClick) {
            e.stopPropagation();
            onClick();
          } else if (enableZoomModal) {
            e.stopPropagation();
            handleOpenZoom();
          }
        }}
        title={hexagram ? `Quẻ #${hexagram.number}: ${hexagram.name}` : undefined}
        style={{
          transform: enableParallax && tilt.active
            ? `perspective(550px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) translateZ(24px) scale3d(1.08, 1.08, 1.08)`
            : "perspective(550px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale3d(1, 1, 1)",
          transition: tilt.active
            ? "transform 0.06s ease-out"
            : "transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.4s ease-out",
          boxShadow: enableParallax && tilt.active
            ? `${-tilt.rotateY * 1.2}px ${tilt.rotateX * 1.2 + 20}px 32px rgba(0, 0, 0, 0.9), 0 0 28px rgba(212, 175, 55, 0.65), 0 10px 22px rgba(0, 0, 0, 0.65)`
            : undefined,
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
        className={`group relative select-none rounded-xl sm:rounded-2xl overflow-hidden border-2 transition-colors duration-300 shadow-xl cursor-pointer ${
          imageUrl
            ? "border-[#C9A55A]/60 hover:border-[#F3E6C8] shadow-[0_4px_16px_rgba(0,0,0,0.6)]"
            : "border-[#4A3E2D] hover:border-[#C9A55A] bg-gradient-to-b from-[#241E17] via-[#181410] to-[#120F0C]"
        } ${sizeClasses[size]} ${className}`}
      >
        {/* 3D Dynamic Parallax Glare / Light Reflection */}
        {enableParallax && (
          <div
            className="absolute inset-0 pointer-events-none rounded-xl sm:rounded-2xl transition-opacity duration-200 z-30"
            style={{
              opacity: tilt.active ? 1 : 0,
              background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 245, 215, 0.42) 0%, rgba(212, 175, 55, 0.2) 28%, transparent 65%)`,
              mixBlendMode: "screen",
            }}
          />
        )}

        {videoUrl ? (
          /* Animated card visual */
          <div
            style={{ transform: "translateZ(8px)" }}
            className="relative w-full h-full bg-[#100D0B] overflow-hidden flex items-center justify-center p-0.5 sm:p-1"
          >
            <video
              src={videoUrl}
              autoPlay
              loop
              muted
              playsInline
              className={`w-full h-full ${
                fitMode === "cover" ? "object-cover group-hover:scale-105" : "object-contain"
              } select-none transition-transform duration-500 ${
                isReversed ? "rotate-180" : ""
              }`}
            />



            {/* Only subtle reversed badge if card is in reversed position */}
            {isReversed && (
              <div
                style={{ transform: "translateZ(14px)" }}
                className="absolute top-1 right-1 pointer-events-none z-10"
              >
                <span className="px-1.5 py-0.5 rounded bg-red-950/90 backdrop-blur-xs font-serif font-bold text-[8px] sm:text-[9px] text-red-300 border border-red-700/80 shadow">
                  NGƯỢC
                </span>
              </div>
            )}
          </div>
        ) : imageUrl ? (
          /* USER LOADED CARD ART - PURE & CLEAN (No text overlays or dark gradients) */
          <div
            style={{ transform: "translateZ(8px)" }}
            className="relative w-full h-full bg-[#100D0B] overflow-hidden flex items-center justify-center p-0.5 sm:p-1"
          >
            <img
              src={imageUrl}
              alt={hexagram.name}
              referrerPolicy="no-referrer"
              className={`w-full h-full ${
                fitMode === "cover" ? "object-cover group-hover:scale-105" : "object-contain"
              } select-none pointer-events-none transition-transform duration-500 ${
                isReversed ? "rotate-180" : ""
              }`}
            />

            {/* Only subtle reversed badge if card is in reversed position */}
            {isReversed && (
              <div
                style={{ transform: "translateZ(14px)" }}
                className="absolute top-1 right-1 pointer-events-none z-10"
              >
                <span className="px-1.5 py-0.5 rounded bg-red-950/90 backdrop-blur-xs font-serif font-bold text-[8px] sm:text-[9px] text-red-300 border border-red-700/80 shadow">
                  NGƯỢC
                </span>
              </div>
            )}
          </div>
        ) : (
          /* DEFAULT MYSTIC CARD ART (when user has not uploaded image yet) */
          <div
            style={{ transform: "translateZ(8px)" }}
            className="w-full h-full p-2 sm:p-2.5 flex flex-col justify-between items-center text-center relative"
          >
            {/* Top Bar */}
            <div className="w-full flex items-center justify-between text-[#8E7E69]">
              <div className="flex items-center gap-1">
                <span className="font-mono text-[9px] sm:text-[10px] font-bold text-[#C9A55A]">
                  #{hexagram.number.toString().padStart(2, "0")}
                </span>
                {isReversed && (
                  <span className="px-1 py-0.2 rounded bg-red-950/80 font-serif font-bold text-[7px] sm:text-[8px] text-red-300 border border-red-700/60">
                    NGƯỢC
                  </span>
                )}
              </div>
              <span className="font-serif text-[10px] sm:text-xs text-[#C8B89E]">{hexagram.hanzi}</span>
            </div>

            {/* Hexagram Trigrams & Line Graphic */}
            <div className={`my-auto flex flex-col items-center ${isReversed ? "rotate-180" : ""}`}>
              <div className="w-12 sm:w-16 my-1">
                <HexagramVisual hexagram={hexagram} size="sm" showLabels={false} />
              </div>
              <div className="mt-0.5 text-[9px] sm:text-[10px] text-[#A6957E] font-serif">
                {hexagram.upperTrigram} / {hexagram.lowerTrigram}
              </div>
            </div>

            {/* Bottom Title */}
            {showName && (
              <div className="w-full space-y-0.5">
                <h5 className="font-serif font-bold text-[10px] sm:text-xs text-[#F3E6C8] line-clamp-1">
                  {hexagram.name}
                </h5>
                <div className="text-[8px] sm:text-[9px] text-[#8C7D6A] line-clamp-1">
                  {hexagram.vietnameseName}
                </div>
              </div>
            )}
          </div>
        )}


      </div>

      {/* Lightbox / Fullscreen Modal (Phóng To & Thu Nhỏ Lá Bài Tương Tác) */}
      {enableZoomModal && isZoomed && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setIsZoomed(false);
          }}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-2 sm:p-4 select-none animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl h-[90vh] bg-[#14100C] border border-[#4D3F2C] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Top Toolbar */}
            <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 bg-[#1B1612] border-b border-[#30251A] gap-2 flex-wrap z-20">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-[#C9A55A] shadow-[0_0_6px_#C9A55A]" />
                <h4 className="font-serif font-bold text-sm sm:text-base text-[#F5EBD6] truncate">
                  Quẻ #{hexagram.number} {hexagram.name}
                  <span className="text-[#A89882] font-normal text-xs ml-1.5 hidden sm:inline">
                    ({hexagram.vietnameseName})
                  </span>
                </h4>
                {isReversed && (
                  <span className="px-1.5 py-0.2 rounded bg-red-950 font-serif font-bold text-[9px] text-red-300 border border-red-700">
                    NGƯỢC
                  </span>
                )}
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  disabled={zoomScale <= 0.5}
                  className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-[#251E17] hover:bg-[#34291E] disabled:opacity-40 text-[#DCD0BC] border border-[#3E3122] flex items-center gap-1 text-xs font-medium cursor-pointer transition-colors"
                  title="Thu nhỏ (-)"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Thu nhỏ</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetZoom}
                  className="px-2.5 py-1.5 rounded-lg bg-[#2B2219] hover:bg-[#392D20] text-[#C9A55A] border border-[#4E3D28] text-xs font-mono font-bold cursor-pointer transition-colors min-w-[52px] text-center"
                  title="Đặt lại tỷ lệ 100%"
                >
                  {Math.round(zoomScale * 100)}%
                </button>

                <button
                  type="button"
                  onClick={handleZoomIn}
                  disabled={zoomScale >= 4}
                  className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-[#251E17] hover:bg-[#34291E] disabled:opacity-40 text-[#DCD0BC] border border-[#3E3122] flex items-center gap-1 text-xs font-medium cursor-pointer transition-colors"
                  title="Phóng to (+)"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Phóng to</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetZoom}
                  className="p-1.5 sm:p-2 rounded-lg bg-[#251E17] hover:bg-[#34291E] text-[#B8A892] hover:text-[#FFF] border border-[#3E3122] cursor-pointer transition-colors"
                  title="Đặt lại vị trí ban đầu"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                {/* 3D Flip Card Button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsZoomFlipped((prev) => !prev);
                    zenAudio.playCardFlipSound();
                  }}
                  className={`p-1.5 sm:px-3 sm:py-1.5 rounded-lg border flex items-center gap-1.5 text-xs font-serif cursor-pointer transition-all shadow ${
                    isZoomFlipped
                      ? "bg-[#3D2C1B] text-[#E6D3A3] border-[#C9A55A]"
                      : "bg-[#251E17] hover:bg-[#34291E] text-[#DCD0BC] border-[#3E3122]"
                  }`}
                  title="Lật 3D để xem mặt lưng / mặt trước lá bài"
                >
                  <RotateCw className={`w-3.5 h-3.5 transition-transform duration-500 ${isZoomFlipped ? "rotate-180 text-[#C9A55A]" : ""}`} />
                  <span className="hidden sm:inline">{isZoomFlipped ? "Xem Mặt Trước" : "Lật 3D (Lưng Bài)"}</span>
                </button>

                {imageUrl && (
                  <button
                    type="button"
                    onClick={handleDownloadCard}
                    className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-[#251E17] hover:bg-[#34291E] text-[#EAD8B1] border border-[#3E3122] flex items-center gap-1 text-xs font-medium cursor-pointer transition-colors"
                    title="Tải ảnh lá bài về máy"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Tải về</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsZoomed(false)}
                  className="p-1.5 sm:p-2 rounded-lg bg-[#251E17] hover:bg-red-950/80 text-[#B8A892] hover:text-red-300 border border-[#3E3122] hover:border-red-800 cursor-pointer transition-colors"
                  title="Đóng (hoặc nhấp ra ngoài)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Interactive Image Viewport with 3D Flip Perspective */}
            <div
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onDoubleClick={handleDoubleClick}
              className={`flex-1 w-full h-full overflow-hidden flex items-center justify-center bg-[#0D0A08] relative select-none ${
                isDragging ? "cursor-grabbing" : zoomScale > 1 ? "cursor-grab" : "cursor-default"
              }`}
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(60, 48, 33, 0.15) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
                perspective: "1400px",
              }}
            >
              {/* Pan & Zoom Canvas */}
              <div
                className="transition-transform duration-75 ease-out select-none flex items-center justify-center"
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomScale})`,
                  transformOrigin: "center center",
                  transformStyle: "preserve-3d",
                }}
              >
                {/* 3D Flipping Card Body */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsZoomFlipped((prev) => !prev);
                  }}
                  className="relative cursor-pointer transition-all duration-700"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: `rotateY(${isZoomFlipped ? 180 : 0}deg)`,
                    transition: isDragging ? "none" : "transform 0.65s cubic-bezier(0.34, 1.4, 0.64, 1)",
                  }}
                  title="Nhấp vào lá bài để lật mặt trước / mặt sau 3D"
                >
                  {/* FRONT FACE (MẶT TRƯỚC / HÌNH QUẺ) */}
                  <div
                    style={{
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                    }}
                    className="relative flex items-center justify-center"
                  >
                    {videoUrl ? (
                      <video
                        src={videoUrl}
                        autoPlay
                        loop
                        muted
                        controls
                        playsInline
                        className={`max-w-[85vw] max-h-[72vh] object-contain rounded-xl shadow-[0_0_35px_rgba(0,0,0,0.85)] border border-[#3E3224]/50 ${
                          isReversed ? "rotate-180" : ""
                        }`}
                      />
                    ) : imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={hexagram.name}
                        referrerPolicy="no-referrer"
                        draggable={false}
                        className={`max-w-[85vw] max-h-[72vh] object-contain rounded-xl shadow-[0_0_35px_rgba(0,0,0,0.85)] border border-[#3E3224]/50 pointer-events-none ${
                          isReversed ? "rotate-180" : ""
                        }`}
                      />
                    ) : (
                      <div
                        className={`p-8 sm:p-12 flex flex-col items-center justify-center bg-[#1A1510] rounded-2xl border border-[#483B29] shadow-2xl ${
                          isReversed ? "rotate-180" : ""
                        }`}
                      >
                        <div className="w-36 sm:w-48 my-3">
                          <HexagramVisual hexagram={hexagram} size="lg" showLabels={true} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* BACK FACE (MẶT SAU / LƯNG BÀI 3D THẬT) */}
                  <div
                    style={{
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                    className="absolute inset-0 w-full h-full flex items-center justify-center rounded-xl overflow-hidden border-2 border-[#C9A55A]/80 shadow-[0_0_35px_rgba(0,0,0,0.9)] bg-gradient-to-b from-[#1C150E] via-[#120D08] to-[#0A0704]"
                  >
                    {cardBackUrl ? (
                      <img
                        src={cardBackUrl}
                        alt="Lưng bài Kinh Dịch"
                        referrerPolicy="no-referrer"
                        draggable={false}
                        className="w-full h-full max-w-[85vw] max-h-[72vh] object-contain pointer-events-none"
                      />
                    ) : (
                      <div className="w-full h-full min-w-[280px] min-h-[400px] p-6 flex flex-col items-center justify-between text-center select-none">
                        <div className="w-full flex justify-between items-center text-[#C9A55A] font-serif text-sm font-bold tracking-wider opacity-90 border-b border-[#3B2C1A] pb-2">
                          <span>周易</span>
                          <span className="text-xs tracking-widest text-[#E6C98A] flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-[#C9A55A]" />
                            KINH DỊCH
                          </span>
                          <span>神卦</span>
                        </div>

                        <div className="relative my-auto flex items-center justify-center py-6">
                          <div className="w-32 h-32 rounded-full border-2 border-[#C9A55A]/50 border-dashed animate-[spin_45s_linear_infinite]" />
                          <div className="absolute w-24 h-24 rounded-full border border-[#E6D3A3]/40" />
                          <div className="absolute w-16 h-16 rounded-full bg-[#241A10] border-2 border-[#C9A55A] flex items-center justify-center shadow-[0_0_25px_rgba(212,175,55,0.45)]">
                            <span className="text-3xl text-[#E6D3A3] font-bold">☯</span>
                          </div>
                        </div>

                        <div className="w-full border-t border-[#3B2C1A] pt-3 flex flex-col items-center gap-1">
                          <span className="font-serif text-xs font-bold text-[#C9A55A] tracking-widest uppercase">
                            Bát Quái • Lục Thập Tứ Quái
                          </span>
                          <span className="text-[10px] text-[#8C7A62] font-mono">
                            64 HEXAGRAMS WISDOM DECK
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Hint */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none bg-[#17130F]/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#3E3124] text-[11px] text-[#A69780] shadow-lg flex items-center gap-2 whitespace-nowrap">
                <Move className="w-3 h-3 text-[#C9A55A]" />
                <span>Bấm nút [Lật 3D] hoặc bấm vào lá bài để lật mặt trước/sau • Cuộn chuột để phóng to/thu nhỏ • Kéo để di chuyển</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
