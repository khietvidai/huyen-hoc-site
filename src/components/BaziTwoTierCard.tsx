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
    cardClasses: "min-w-[50px] min-h-[54px] sm:min-w-[56px] sm:min-h-[60px] p-1 sm:p-1.5 rounded-lg gap-0.5",
    emojiClasses: "text-sm sm:text-base font-serif font-black leading-tight",
    chiClasses: "text-[11px] sm:text-xs leading-snug font-bold",
    badgeClasses: "text-[7px] sm:text-[7.5px]",
    subNoteClasses: "text-[7.5px]",
    tamAnClasses: "text-[7.5px] leading-snug",
  },
  "1.4x": {
    label: "1.4x Vừa",
    multiplier: "1.4x",
    cardClasses: "min-w-[68px] min-h-[74px] sm:min-w-[78px] sm:min-h-[84px] p-1.5 sm:p-2 rounded-xl gap-0.5",
    emojiClasses: "text-lg sm:text-xl font-serif font-black leading-tight",
    chiClasses: "text-xs sm:text-sm leading-snug font-bold",
    badgeClasses: "text-[8px] sm:text-[8.5px]",
    subNoteClasses: "text-[8.5px]",
    tamAnClasses: "text-[8.5px] sm:text-[9px] leading-snug",
  },
  "1.7x": {
    label: "1.7x Lớn",
    multiplier: "1.7x",
    cardClasses: "min-w-[84px] min-h-[92px] sm:min-w-[98px] sm:min-h-[106px] p-2 sm:p-2.5 rounded-xl gap-0.5",
    emojiClasses: "text-xl sm:text-2xl font-serif font-black leading-tight",
    chiClasses: "text-sm sm:text-base leading-snug font-extrabold",
    badgeClasses: "text-[9px] sm:text-[9.5px]",
    subNoteClasses: "text-[9px] sm:text-[10px]",
    tamAnClasses: "text-[9px] sm:text-[10px] leading-snug",
  },
  "2x": {
    label: "2x To Gấp Đôi",
    multiplier: "2x",
    cardClasses: "min-w-[98px] min-h-[108px] sm:min-w-[116px] sm:min-h-[126px] p-2.5 sm:p-3 rounded-xl gap-1",
    emojiClasses: "text-2xl sm:text-3xl font-serif font-black leading-tight",
    chiClasses: "text-base sm:text-lg leading-snug font-extrabold",
    badgeClasses: "text-[9.5px] sm:text-[10.5px]",
    subNoteClasses: "text-[10px] sm:text-[11px]",
    tamAnClasses: "text-[9.5px] sm:text-[10.5px] leading-snug",
  },
};

export const BaziTwoTierSizeSelector: React.FC<{
  currentSize: TwoTierCardSize;
  onChangeSize: (size: TwoTierCardSize) => void;
}> = ({ currentSize, onChangeSize }) => {
  return (
    <div className="flex items-center gap-0.5 sm:gap-1 bg-[#FAF6EE] p-0.5 rounded-lg border border-[#D8C8A8] shadow-xs shrink-0">
      <span className="text-[9px] text-[#5C4D3C] font-semibold px-1 hidden xs:inline">
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
                ? "bg-[#9E2A2B] text-[#FFF9F5] shadow-xs font-black"
                : "text-[#5C4D3C] hover:text-[#1C1813] hover:bg-[#EFE6D5]"
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

  const isCung = badgeType === "cung" || currentZone === "top_cung_origin";

  // Card background styling based on zone & badgeType (Minimalist Xuan Paper)
  let cardBg = "bg-[#FFFDF8] border-[#C9A86A] shadow-xs";
  if (badgeType === "xung") {
    cardBg = "bg-[#FFF7F7] border-2 border-[#B91C1C] shadow-xs";
  } else if (badgeType === "hai") {
    cardBg = "bg-[#FDF7FA] border-2 border-[#BE185D] shadow-xs";
  } else if (badgeType === "hinh") {
    cardBg = "bg-[#FFFBF2] border-2 border-[#B45309] shadow-xs";
  } else if (isCung) {
    cardBg = "bg-[#FAF6FF] border-2 border-[#7E22CE] shadow-xs";
  } else if (badgeType === "toancuc") {
    cardBg = "bg-[#F4FBF7] border-2 border-[#15803D] shadow-xs";
  } else if (badgeType === "daivan") {
    cardBg = "bg-[#FFFDF5] border-2 border-[#B8862D] shadow-xs";
  } else if (currentZone === "bottom_left" || currentZone === "bottom_right" || currentZone === "bottom_hop") {
    cardBg = "bg-[#F4FBF7] border-2 border-[#15803D] shadow-xs";
  } else if (currentZone === "middle_same") {
    cardBg = "bg-[#FFFDF5] border-2 border-[#B8862D] shadow-xs";
  } else if (currentZone === "top_left" || currentZone === "top_right") {
    cardBg = "bg-[#FFFDF8] border border-[#C4963E] shadow-xs";
  }

  const hanziInkColor =
    badgeType === "xung"
      ? "text-[#991B1B]"
      : badgeType === "hai"
      ? "text-[#9D174D]"
      : badgeType === "hinh"
      ? "text-[#92400E]"
      : isCung
      ? "text-[#6B21A8]"
      : currentZone === "bottom_left" || currentZone === "bottom_right" || currentZone === "bottom_hop" || badgeType === "toancuc"
      ? "text-[#14532D]"
      : cData?.element === "Mộc" ? "text-[#14532D]" : cData?.element === "Hỏa" ? "text-[#9E2A2B]" : cData?.element === "Thổ" ? "text-[#78350F]" : cData?.element === "Kim" ? "text-[#44403C]" : cData?.element === "Thủy" ? "text-[#1E3A8A]" : "text-[#1C1813]";

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
          className="absolute -top-1 -left-1 opacity-60 hover:opacity-100 p-0.5 rounded-full bg-[#FAF6EE] border border-[#C4963E] text-[#5C4D3C] hover:text-[#9E2A2B] cursor-pointer z-10 shadow-xs"
          title="Chuyển vùng thẻ này"
        >
          <Move className="w-2.5 h-2.5" />
        </button>
      )}

      {/* Nhãn Trụ / Badge nhỏ ở trên cùng khi kích cỡ >= 1.4x */}
      {size !== "1x" && (
        <span
          className={`leading-snug whitespace-nowrap font-bold select-none px-2 py-0.5 rounded-full border ${sizeCfg.badgeClasses} ${
            badgeType === "xung"
              ? "bg-[#FEE2E2] text-[#991B1B] border-[#DC2626]/45"
              : badgeType === "hai"
              ? "bg-[#FCE7F3] text-[#9D174D] border-[#DB2777]/45"
              : badgeType === "hinh"
              ? "bg-[#FEF3C7] text-[#92400E] border-[#D97706]/45"
              : isCung
              ? "bg-[#F3E8FF] text-[#6B21A8] border-[#9333EA]/45"
              : currentZone === "bottom_left" || currentZone === "bottom_right" || currentZone === "bottom_hop" || badgeType === "toancuc"
              ? "bg-[#DCFCE7] text-[#14532D] border-[#16A34A]/45"
              : currentZone === "middle_same"
              ? "bg-[#FEF3C7] text-[#78350F] border-[#D97706]/45"
              : "bg-[#F5EFE2] text-[#5C4318] border-[#C9A86A]"
          }`}
        >
          {badgeType === "xung"
            ? "Đối Xung"
            : badgeType === "hai"
            ? "Đối Hại"
            : badgeType === "hinh"
            ? "Đối Hình"
            : isCung
            ? "Củng Cục"
            : badgeType === "toancuc"
            ? "Toàn Cục"
            : currentZone === "top_left"
            ? "Kế Bên"
            : currentZone === "bottom_left" || currentZone === "bottom_right" || currentZone === "bottom_hop"
            ? "Hợp Kéo"
            : currentZone === "middle_same"
            ? "Chữ Trùng"
            : badgeType === "doclap"
            ? "Độc Lập"
            : label}
        </span>
      )}

      {/* 1. Chữ Hán Địa Chi ở trên (chỉ hiện khi showEmoji = true) */}
      {showEmoji && (
        <span className={`${sizeCfg.emojiClasses} ${hanziInkColor} select-none`}>
          {cData?.emoji || chi}
        </span>
      )}

      {/* 2. Tên Chi chữ Việt serif đậm nét */}
      <span
        className={`font-serif leading-snug select-none ${
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
            ? "text-[#991B1B]"
            : badgeType === "hai"
            ? "text-[#9D174D]"
            : badgeType === "hinh"
            ? "text-[#92400E]"
            : isCung
            ? "text-[#6B21A8]"
            : currentZone === "bottom_left" || currentZone === "bottom_right" || currentZone === "bottom_hop" || badgeType === "toancuc"
            ? "text-[#14532D]"
            : "text-[#1C1813]"
        }`}
      >
        {isCung ? `(${chi})` : chi}
      </span>

      {/* Tên Gọi Tâm Ấn Phú gắn vào Địa Chi */}
      {showTamAnPhu && tamAnPhuName && (
        <span
          className={`font-serif font-bold text-[#6E4E16] bg-[#FAF4E6] px-1.5 py-0.5 rounded border border-[#D8C296] whitespace-nowrap leading-snug ${sizeCfg.tamAnClasses} select-none`}
          title={tamAnPhuFullLine ? `Tâm Ấn Phú: ${tamAnPhuFullLine}` : `Tâm Ấn Phú: 《${tamAnPhuName}》${tamAnPhuChinese ? ` (${tamAnPhuChinese})` : ""}`}
        >
          《{tamAnPhuName}》
        </span>
      )}

      {/* 3. Tên Trụ (Can Chi) ở dưới cùng */}
      {((size === "2x" || size === "1.7x") || (!showEmoji && size === "1.4x")) && pillar && (
        <span className={`text-[#5C4D3C] select-none leading-snug font-serif font-semibold whitespace-nowrap ${sizeCfg.subNoteClasses} ${!showEmoji ? "mt-0.5" : ""}`}>
          {pillar}
        </span>
      )}

      {/* Quick Move Menu Popup khi bấm vào thẻ */}
      {menuOpen && (
        <div
          className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 w-52 rounded-xl bg-[#FFFDF8] border-2 border-[#C4963E] shadow-xl py-1.5 z-50 text-left animate-in fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-2.5 py-1 text-[9px] uppercase tracking-wider text-[#5C4D3C] font-semibold border-b border-[#E5D8C1] flex items-center justify-between">
            <span>Chuyển {label} ({chi}) tới:</span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="text-[#5C4D3C] hover:text-[#9E2A2B] p-0.5 cursor-pointer"
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
                      ? "bg-[#FAF0D7] text-[#78350F] font-bold"
                      : "text-[#1C1813] hover:bg-[#FAF6EE]"
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span>{z.icon}</span>
                    <span className="truncate">{z.label}</span>
                  </div>
                  {isCurrent && <Check className="w-3 h-3 text-[#92400E] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
