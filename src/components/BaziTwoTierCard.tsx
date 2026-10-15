import React, { useState, useRef, useEffect } from "react";
import {
  GripVertical,
  Move,
  Check,
  X,
  Link2,
} from "lucide-react";
import { CHI_MAP, getChiData } from "../data/baziConstants";

export type TwoTierZone =
  | "top_independent"
  | "top_left"
  | "top_oppose"
  | "top_cung_origin"
  | "top_right"
  | "middle_same"
  | "bottom_left"
  | "bottom_right"
  | "bottom_hop";

export type TwoTierCardSize = "1x" | "1.4x" | "1.7x" | "2x";

export const TWO_TIER_CARD_SIZE_CONFIG: Record<
  TwoTierCardSize,
  {
    label: string;
    multiplier: string;
    cardClasses: string;
    emojiClasses: string;
    chiClasses: string;
    badgeClasses: string;
    subNoteClasses: string;
    tamAnClasses: string;
  }
> = {
  "1x": {
    label: "1x Chuẩn",
    multiplier: "1x",
    cardClasses: "min-w-[40px] min-h-[44px] sm:min-w-[46px] sm:min-h-[50px] p-0.5 sm:p-1 rounded-lg",
    emojiClasses: "text-xs sm:text-sm leading-none",
    chiClasses: "text-[11px] sm:text-xs leading-none mt-0.5 font-bold",
    badgeClasses: "text-[6px] sm:text-[6.5px]",
    subNoteClasses: "text-[6px]",
    tamAnClasses: "text-[6.5px] leading-tight",
  },
  "1.4x": {
    label: "1.4x Vừa",
    multiplier: "1.4x",
    cardClasses: "min-w-[54px] min-h-[60px] sm:min-w-[62px] sm:min-h-[68px] p-1 sm:p-1.5 rounded-xl",
    emojiClasses: "text-base sm:text-lg leading-none",
    chiClasses: "text-xs sm:text-sm leading-none mt-1 font-bold",
    badgeClasses: "text-[7.5px] sm:text-[8px]",
    subNoteClasses: "text-[7.5px]",
    tamAnClasses: "text-[7.5px] sm:text-[8px] leading-tight",
  },
  "1.7x": {
    label: "1.7x Lớn",
    multiplier: "1.7x",
    cardClasses: "min-w-[66px] min-h-[74px] sm:min-w-[78px] sm:min-h-[86px] p-1.5 sm:p-2 rounded-xl",
    emojiClasses: "text-xl sm:text-2xl leading-none",
    chiClasses: "text-sm sm:text-base leading-none mt-1 font-extrabold",
    badgeClasses: "text-[8.5px] sm:text-[9px]",
    subNoteClasses: "text-[8px]",
    tamAnClasses: "text-[8px] sm:text-[8.5px] leading-tight",
  },
  "2x": {
    label: "2x To Gấp Đôi",
    multiplier: "2x",
    cardClasses: "min-w-[76px] min-h-[86px] sm:min-w-[94px] sm:min-h-[104px] p-2 sm:p-2.5 rounded-2xl",
    emojiClasses: "text-2xl sm:text-3xl leading-none",
    chiClasses: "text-base sm:text-xl leading-none mt-1.5 font-black",
    badgeClasses: "text-[9px] sm:text-[10px]",
    subNoteClasses: "text-[8.5px] sm:text-[9px]",
    tamAnClasses: "text-[8.5px] sm:text-[9.5px] leading-tight",
  },
};

export const BaziTwoTierSizeSelector: React.FC<{
  currentSize: TwoTierCardSize;
  onChangeSize: (size: TwoTierCardSize) => void;
}> = ({ currentSize, onChangeSize }) => {
  return (
    <div className="flex items-center gap-0.5 sm:gap-1 bg-[#1A1209] p-0.5 rounded-lg border border-[#432F1A] shadow-inner shrink-0">
      <span className="text-[9px] text-[#A89882] font-semibold px-1 hidden xs:inline">
        Cỡ ô:
      </span>
      {(["1x", "1.4x", "1.7x", "2x"] as TwoTierCardSize[]).map((sz) => {
        const isActive = currentSize === sz;
        return (
          <button
            key={sz}
            type="button"
            onClick={() => onChangeSize(sz)}
            className={`px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold rounded transition-all cursor-pointer ${
              isActive
                ? "bg-gradient-to-r from-amber-600 to-amber-500 text-stone-950 shadow-sm font-black ring-1 ring-amber-300"
                : "text-[#C4B49F] hover:text-amber-200 hover:bg-[#2A1B0E]"
            }`}
            title={`Chọn kích cỡ ô: ${TWO_TIER_CARD_SIZE_CONFIG[sz].label}`}
          >
            {sz === "2x" ? "2x (To)" : sz}
          </button>
        );
      })}
    </div>
  );
};

export const TWO_TIER_ZONE_CONFIG: {
  key: TwoTierZone;
  label: string;
  icon: string;
  shortLabel: string;
  desc: string;
}[] = [
  {
    key: "top_independent",
    label: "Hàng Độc Lập (Tầng Trên)",
    shortLabel: "Độc Lập (Trên)",
    icon: "🏠",
    desc: "Tầng Trên: Không xung hại hình & không củng",
  },
  {
    key: "top_oppose",
    label: "Đối Diện Trực Diện (Tầng Trên)",
    shortLabel: "Đối Diện (Giữa)",
    icon: "🎯",
    desc: "Tầng Trên: Hình • Xung • Hại trực diện",
  },
  {
    key: "top_left",
    label: "Cánh Tả Kế Bên (Tầng Trên)",
    shortLabel: "Kế Bên Trái (Trên)",
    icon: "⬅️",
    desc: "Tầng Trên: Hợp với chữ đối diện bên trái",
  },
  {
    key: "top_cung_origin",
    label: "Góc Phải Phía Trên (Củng Sẵn Nguyên Cục)",
    shortLabel: "Góc Phải (Củng Sẵn)",
    icon: "🏛️",
    desc: "Tầng Trên Góc Phải: Các Chi củng sẵn ở nguyên cục",
  },
  {
    key: "bottom_left",
    label: "Kéo Xuống Bên Trái (Trái Chữ Mới)",
    shortLabel: "Trái Chữ Mới",
    icon: "◀️",
    desc: "Nằm bên trái Địa Chi Mới",
  },
  {
    key: "middle_same",
    label: "Chung Ô Với Chữ Mới / Lưu Niên (Chữ Trùng)",
    shortLabel: "Chung Ô Chữ Mới",
    icon: "🤝",
    desc: "Nằm chung một ô với Địa Chi Mới / Lưu Niên",
  },
  {
    key: "bottom_right",
    label: "Kéo Xuống Bên Phải (Phải Chữ Mới)",
    shortLabel: "Phải Chữ Mới",
    icon: "▶️",
    desc: "Nằm bên phải Địa Chi Mới",
  },
];

export interface BaziTwoTierCardProps {
  pillarKey: string;
  label: string;
  pillar: string;
  chi: string;
  currentZone: TwoTierZone;
  onMoveToZone: (pillarKey: string, targetZone: TwoTierZone) => void;
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  badgeText?: string;
  badgeType?: "xung" | "hai" | "hinh" | "toancuc" | "daivan" | "doclap" | "hop" | "same" | "normal" | "cung";
  subNote?: string;
  className?: string;
  size?: TwoTierCardSize;
  isSelected?: boolean;
  selectedIndex?: number;
  onSelect?: () => void;
  innerRef?: (el: HTMLDivElement | null) => void;
  showEmoji?: boolean;
  tamAnPhuName?: string;
  tamAnPhuChinese?: string;
  tamAnPhuFullLine?: string;
  showTamAnPhu?: boolean;
}

export const BaziTwoTierCard: React.FC<BaziTwoTierCardProps> = ({
  pillarKey,
  label,
  pillar,
  chi,
  currentZone,
  onMoveToZone,
  isDragging = false,
  onDragStart,
  onDragEnd,
  badgeText,
  badgeType = "normal",
  subNote,
  className = "",
  size = "2x",
  isSelected = false,
  selectedIndex,
  onSelect,
  innerRef,
  showEmoji = true,
  tamAnPhuName,
  tamAnPhuChinese,
  tamAnPhuFullLine,
  showTamAnPhu = true,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const cData = getChiData(chi) || CHI_MAP.get(chi);
  const sizeCfg = TWO_TIER_CARD_SIZE_CONFIG[size] || TWO_TIER_CARD_SIZE_CONFIG["2x"];

  // Close menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  // Touch drag support for mobile / touch devices
  const [touchDragging, setTouchDragging] = useState(false);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartPos.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartPos.current) return;
    const t = e.touches[0];
    const dx = t.clientX - touchStartPos.current.x;
    const dy = t.clientY - touchStartPos.current.y;
    if (Math.hypot(dx, dy) > 12) {
      setTouchDragging(true);
      const elem = document.elementFromPoint(t.clientX, t.clientY);
      const zoneElem = elem?.closest("[data-zone-key]");
      document.querySelectorAll("[data-zone-key]").forEach((el) => {
        if (el === zoneElem) {
          el.classList.add("ring-2", "ring-amber-400", "scale-[1.01]");
        } else {
          el.classList.remove("ring-2", "ring-amber-400", "scale-[1.01]");
        }
      });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchDragging) {
      const t = e.changedTouches[0];
      const elem = document.elementFromPoint(t.clientX, t.clientY);
      const zoneElem = elem?.closest("[data-zone-key]");
      const targetZone = zoneElem?.getAttribute("data-zone-key") as TwoTierZone | null;
      if (targetZone) {
        onMoveToZone(pillarKey, targetZone);
      }
      document.querySelectorAll("[data-zone-key]").forEach((el) => {
        el.classList.remove("ring-2", "ring-amber-400", "scale-[1.01]");
      });
    }
    setTouchDragging(false);
    touchStartPos.current = null;
  };

  // Card background styling based on zone & badgeType
  let cardBg = "bg-[#1A120B] border-[#3E2C1A]";
  if (badgeType === "xung") {
    cardBg = "bg-gradient-to-b from-[#3E1715] via-[#2A0E0C] to-[#1C0908] border-rose-500 shadow-rose-600/30 ring-1 ring-rose-500/50";
  } else if (badgeType === "hai") {
    cardBg = "bg-gradient-to-b from-[#38182E] via-[#260E1F] to-[#180813] border-pink-500 shadow-pink-600/25 ring-1 ring-pink-500/40";
  } else if (badgeType === "hinh") {
    cardBg = "bg-gradient-to-b from-[#3A2612] via-[#26180A] to-[#180E05] border-amber-500 shadow-amber-600/25 ring-1 ring-amber-500/40";
  } else if (badgeType === "cung" || currentZone === "top_cung_origin") {
    cardBg = "bg-gradient-to-b from-[#311640] via-[#220E2C] to-[#15071D] border-purple-500 shadow-purple-900/30 ring-1 ring-purple-500/50";
  } else if (badgeType === "toancuc") {
    cardBg = "bg-gradient-to-b from-[#1F271B] to-[#121A0F] border-emerald-500/70 shadow-sm";
  } else if (badgeType === "daivan") {
    cardBg = "bg-gradient-to-b from-[#23180F] to-[#170E08] border-amber-600/70";
  } else if (currentZone === "bottom_left" || currentZone === "bottom_right" || currentZone === "bottom_hop") {
    cardBg = "bg-gradient-to-b from-[#142B1E] to-[#0D1C14] border-emerald-500/80 shadow-md ring-1 ring-emerald-500/40";
  } else if (currentZone === "middle_same") {
    cardBg = "bg-gradient-to-b from-[#2E2012] via-[#22160C] to-[#170E07] border-amber-500/80 shadow-lg ring-1 ring-amber-500/40";
  } else if (currentZone === "top_left" || currentZone === "top_right") {
    cardBg = "bg-gradient-to-b from-[#2A1E14] to-[#1C130C] border-[#6B4E28] shadow-sm";
  }

  const isCung = badgeType === "cung" || currentZone === "top_cung_origin";

  return (
    <div
      ref={(el) => {
        (menuRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
        if (innerRef) innerRef(el);
      }}
      draggable
      onClick={(e) => {
        if (onSelect) {
          onSelect();
        } else {
          setMenuOpen((prev) => !prev);
        }
      }}
      onDragStart={(e) => {
        setMenuOpen(false);
        e.dataTransfer.setData("text/plain", pillarKey);
        e.dataTransfer.effectAllowed = "move";
        if (onDragStart) onDragStart(e);
      }}
      onDragEnd={onDragEnd}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const droppedKey = e.dataTransfer.getData("text/plain");
        if (droppedKey) {
          onMoveToZone(droppedKey, currentZone);
        }
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={() => {
        setTouchDragging(false);
        touchStartPos.current = null;
        document.querySelectorAll("[data-zone-key]").forEach((el) => {
          el.classList.remove("ring-2", "ring-amber-400", "scale-[1.01]");
        });
      }}
      className={`relative shrink-0 border text-center flex flex-col items-center justify-center select-none transition-all duration-200 cursor-pointer active:cursor-grabbing hover:scale-[1.05] hover:shadow-md ${sizeCfg.cardClasses} ${cardBg} ${
        isSelected
          ? "!border-amber-400 ring-2 ring-amber-400 scale-[1.04] shadow-lg shadow-amber-500/30 z-10"
          : ""
      } ${
        isDragging || touchDragging ? "opacity-30 scale-95 border-dashed border-amber-400" : ""
      } ${className}`}
      title={subNote ? `${label} (${pillar}): ${chi} • ${subNote}` : `${label} (${pillar}): ${chi}`}
    >
      {/* Huy hiệu số thứ tự khi ô đang được chọn để nối mũi tên */}
      {isSelected && (
        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center text-[9px] font-black shadow ring-1 ring-amber-300 z-20 animate-in zoom-in-75">
          {selectedIndex != null ? selectedIndex + 1 : "✓"}
        </span>
      )}

      {/* Nút bấm mở menu chuyển vùng khi đang có onSelect */}
      {onSelect && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((prev) => !prev);
          }}
          className="absolute -top-1 -left-1 opacity-40 hover:opacity-100 p-0.5 rounded-full bg-[#1A1108] border border-[#523C26] text-[#D8C7B0] hover:text-amber-300 cursor-pointer z-10"
          title="Chuyển vùng thẻ này"
        >
          <Move className="w-2.5 h-2.5" />
        </button>
      )}

      {/* Nhãn Trụ / Badge nhỏ ở trên cùng khi kích cỡ >= 1.4x */}
      {size !== "1x" && (
        <span
          className={`leading-none truncate max-w-full font-semibold select-none mb-0.5 px-1 py-0.2 rounded-full border ${sizeCfg.badgeClasses} ${
            badgeType === "xung"
              ? "bg-rose-950/80 text-rose-300 border-rose-500/50"
              : badgeType === "hai"
              ? "bg-pink-950/80 text-pink-300 border-pink-500/50"
              : badgeType === "hinh"
              ? "bg-amber-950/80 text-amber-300 border-amber-500/50"
              : isCung
              ? "bg-purple-950/80 text-purple-300 border-purple-500/50"
              : currentZone === "bottom_left" || currentZone === "bottom_right" || currentZone === "bottom_hop"
              ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/50"
              : currentZone === "middle_same"
              ? "bg-amber-950/80 text-amber-200 border-amber-500/50"
              : "bg-[#251A0F] text-[#D8C7B0] border-[#553C24]"
          }`}
        >
          {badgeText ? badgeText.split(" ")[0] : label}
        </span>
      )}

      {/* 1. Emoji con giáp ở trên (chỉ hiện khi showEmoji = true) */}
      {showEmoji && (
        <span className={`${sizeCfg.emojiClasses} select-none`}>
          {cData?.emoji || "⭐"}
        </span>
      )}

      {/* 2. Tên Chi chữ serif đậm nét */}
      <span
        className={`font-serif leading-none select-none ${
          showEmoji
            ? sizeCfg.chiClasses
            : size === "1x"
            ? "text-xs sm:text-sm font-bold my-auto"
            : size === "1.4x"
            ? "text-sm sm:text-base font-extrabold my-auto"
            : size === "1.7x"
            ? "text-base sm:text-lg font-black my-auto"
            : "text-lg sm:text-2xl font-black my-auto"
        } ${
          badgeType === "xung"
            ? "text-rose-200"
            : badgeType === "hai"
            ? "text-pink-200"
            : badgeType === "hinh"
            ? "text-amber-200"
            : isCung
            ? "text-purple-200"
            : currentZone === "bottom_left" || currentZone === "bottom_right" || currentZone === "bottom_hop"
            ? "text-emerald-200"
            : "text-[#F5EAD4]"
        }`}
      >
        {isCung ? `(${chi})` : chi}
      </span>

      {/* Tên Gọi Tâm Ấn Phú gắn vào Địa Chi */}
      {showTamAnPhu && tamAnPhuName && (
        <span
          className={`font-serif font-bold text-[#FFE28A] bg-[#291A0E]/95 px-1 py-0.2 rounded border border-amber-600/60 truncate max-w-full leading-tight shadow-xs ${sizeCfg.tamAnClasses} select-none my-0.5`}
          title={tamAnPhuFullLine ? `Tâm Ấn Phú: ${tamAnPhuFullLine}` : `Tâm Ấn Phú: 《${tamAnPhuName}》${tamAnPhuChinese ? ` (${tamAnPhuChinese})` : ""}`}
        >
          《{tamAnPhuName}》
        </span>
      )}

      {/* 3. Tên Trụ (Can Chi) ở dưới cùng */}
      {((size === "2x" || size === "1.7x") || (!showEmoji && size === "1.4x")) && pillar && (
        <span className={`text-[#A89882] select-none leading-none font-mono font-medium truncate max-w-full ${sizeCfg.subNoteClasses} ${!showEmoji ? "mt-0.5" : ""}`}>
          {pillar}
        </span>
      )}

      {/* Quick Move Menu Popup khi bấm vào thẻ */}
      {menuOpen && (
        <div
          className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 w-52 rounded-xl bg-[#1C130B] border-2 border-[#D4AF37] shadow-2xl py-1.5 z-50 text-left animate-in fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-2.5 py-1 text-[9px] uppercase tracking-wider text-[#A89882] font-semibold border-b border-[#362516] flex items-center justify-between">
            <span>Chuyển {label} ({chi}) tới:</span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="text-[#8C7D6B] hover:text-white p-0.5 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="py-1">
            {TWO_TIER_ZONE_CONFIG.map((z) => {
              const isCurrent = currentZone === z.key;
              return (
                <button
                  key={z.key}
                  type="button"
                  onClick={() => {
                    onMoveToZone(pillarKey, z.key);
                    setMenuOpen(false);
                  }}
                  className={`w-full px-2.5 py-1 text-[11px] flex items-center justify-between transition-colors cursor-pointer ${
                    isCurrent
                      ? "bg-[#332212] text-amber-300 font-bold"
                      : "text-[#E5D7BF] hover:bg-[#2B1E12] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span>{z.icon}</span>
                    <span className="truncate">{z.label}</span>
                  </div>
                  {isCurrent && <Check className="w-3 h-3 text-amber-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
