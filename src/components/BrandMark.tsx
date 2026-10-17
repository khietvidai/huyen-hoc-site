import React from "react";

/**
 * Logo Cửu Nhị (玖貳).
 * Ý nghĩa: hào Cửu Nhị (九二) là vạch dương thứ hai của quẻ Càn —
 * "Hiện long tại điền, lợi kiến đại nhân". Khung bát giác tượng trưng Bát Quái,
 * sáu vạch dương là quẻ Càn, vạch thứ hai từ dưới lên được điểm son chu sa.
 */

const GOLD = "#C9A55A";
const GOLD_SOFT = "#A8843F";
const CINNABAR = "#B8452F";

// Đỉnh bát giác đều, cạnh trên nằm ngang
const octagonPoints = (cx: number, cy: number, r: number): string =>
  Array.from({ length: 8 }, (_, i) => {
    const angle = ((22.5 + i * 45) * Math.PI) / 180;
    return `${(cx + r * Math.cos(angle)).toFixed(2)},${(cy + r * Math.sin(angle)).toFixed(2)}`;
  }).join(" ");

const HEXAGRAM_LINE_Y = [17.6, 22.8, 28, 33.2, 38.4, 43.6]; // trên → dưới
const CUU_NHI_INDEX = 4; // vạch thứ hai tính từ dưới lên

interface BrandMarkProps {
  size?: number;
  className?: string;
  title?: string;
}

export const BrandMark: React.FC<BrandMarkProps> = ({ size = 40, className = "", title = "Cửu Nhị" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    className={className}
    role="img"
    aria-label={title}
    xmlns="http://www.w3.org/2000/svg"
  >
    <polygon points={octagonPoints(32, 32, 30.5)} fill="#0E0C0A" stroke={GOLD} strokeWidth="1.1" />
    <polygon points={octagonPoints(32, 32, 27)} fill="none" stroke={GOLD_SOFT} strokeWidth="0.5" strokeOpacity="0.7" />
    {HEXAGRAM_LINE_Y.map((y, index) => (
      <rect
        key={y}
        x={index === CUU_NHI_INDEX ? 17 : 19}
        y={y}
        width={index === CUU_NHI_INDEX ? 30 : 26}
        height="2.6"
        rx="0.4"
        fill={index === CUU_NHI_INDEX ? CINNABAR : GOLD}
      />
    ))}
  </svg>
);

interface BrandLockupProps {
  markSize?: number;
  showTagline?: boolean;
  className?: string;
}

/** Logo đầy đủ: biểu tượng + chữ CỬU NHỊ + dòng phụ */
export const BrandLockup: React.FC<BrandLockupProps> = ({ markSize = 40, showTagline = true, className = "" }) => (
  <span className={`flex items-center gap-3 ${className}`}>
    <BrandMark size={markSize} className="shrink-0" />
    <span className="min-w-0 text-left leading-none">
      <span className="flex items-baseline gap-2">
        <span className="font-display text-lg sm:text-[26px] font-semibold tracking-[0.14em] sm:tracking-[0.2em] text-ivory-100 whitespace-nowrap">
          CỬU NHỊ
        </span>
        <span className="hidden sm:inline font-serif text-[11px] tracking-[0.2em] text-gold-600">玖貳</span>
      </span>
      {showTagline && (
        <span className="hidden sm:block mt-1.5 text-[9px] font-sans uppercase tracking-[0.36em] text-gold-600 whitespace-nowrap">
          Mệnh Lý · Phong Thủy · Kinh Dịch
        </span>
      )}
    </span>
  </span>
);

// Bát Quái Tiên Thiên theo chiều kim đồng hồ từ trên (Nam ở trên):
// Càn, Tốn, Khảm, Cấn, Khôn, Chấn, Ly, Đoài. Bit theo thứ tự hào sơ → hào ba.
const EARLIER_HEAVEN_TRIGRAMS: ReadonlyArray<readonly [number, number, number]> = [
  [1, 1, 1],
  [0, 1, 1],
  [0, 1, 0],
  [0, 0, 1],
  [0, 0, 0],
  [1, 0, 0],
  [1, 0, 1],
  [1, 1, 0],
];

/** La bàn Bát Quái mảnh làm nền trang trí cho hero */
export const LuopanRing: React.FC<{ className?: string }> = ({ className = "" }) => {
  const c = 200;
  return (
    <svg viewBox="0 0 400 400" className={className} aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke={GOLD}>
        <circle cx={c} cy={c} r="197" strokeWidth="0.6" />
        <circle cx={c} cy={c} r="189" strokeWidth="1" />
        <circle cx={c} cy={c} r="166" strokeWidth="0.5" />
        <circle cx={c} cy={c} r="128" strokeWidth="0.8" />
        <circle cx={c} cy={c} r="122" strokeWidth="0.4" />
        <circle cx={c} cy={c} r="70" strokeWidth="0.5" strokeDasharray="2 4" />
      </g>
      {/* Vạch chia độ */}
      <g className="royal-spin-slow" style={{ transformOrigin: "200px 200px" }}>
        {Array.from({ length: 120 }, (_, i) => {
          const isMajor = i % 5 === 0;
          return (
            <line
              key={i}
              x1={c}
              y1={c - 189}
              x2={c}
              y2={c - (isMajor ? 178 : 184)}
              stroke={GOLD}
              strokeWidth={isMajor ? 0.9 : 0.45}
              transform={`rotate(${i * 3} ${c} ${c})`}
            />
          );
        })}
      </g>
      {/* Tám quẻ đơn */}
      {EARLIER_HEAVEN_TRIGRAMS.map((lines, t) => (
        <g key={t} transform={`rotate(${t * 45} ${c} ${c})`} fill={GOLD}>
          {lines.map((isYang, lineIndex) => {
            const y = c - 136 - lineIndex * 9;
            return isYang ? (
              <rect key={lineIndex} x={c - 17} y={y} width="34" height="3.2" />
            ) : (
              <React.Fragment key={lineIndex}>
                <rect x={c - 17} y={y} width="14" height="3.2" />
                <rect x={c + 3} y={y} width="14" height="3.2" />
              </React.Fragment>
            );
          })}
        </g>
      ))}
    </svg>
  );
};
