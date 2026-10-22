import React from "react";
import { Hexagram } from "../types";

export interface CardInfoSummaryProps {
  card?: Hexagram | null;
  roleTitle?: string;
  isReversed?: boolean;
  deckNumber?: number;
  compact?: boolean;
  className?: string;
  showJudgment?: boolean;
  showAdvice?: boolean;
}

export const CardInfoSummary: React.FC<CardInfoSummaryProps> = ({
  card,
  roleTitle,
  isReversed = false,
  deckNumber,
  compact = false,
  className = "",
  showJudgment = true,
  showAdvice = false,
}) => {
  if (!card) return null;

  const reversed = isReversed ?? card.isReversed ?? false;

  // Điềm quẻ Cát / Hung styling
  const getOmenBadgeClass = (omen?: string) => {
    switch (omen) {
      case "Đại Cát":
        return "bg-emerald-950/95 text-emerald-200 border-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.3)]";
      case "Cát":
      case "Thứ Cát":
        return "bg-teal-950/95 text-teal-200 border-teal-500/80 shadow-[0_0_8px_rgba(20,184,166,0.25)]";
      case "Hung":
      case "Đại Hung":
        return "bg-rose-950/95 text-rose-200 border-rose-500/80 shadow-[0_0_8px_rgba(244,63,94,0.3)]";
      case "Thứ Hung":
        return "bg-orange-950/95 text-orange-200 border-orange-500/80 shadow-[0_0_8px_rgba(249,115,22,0.25)]";
      case "Bình Hòa":
      default:
        return "bg-amber-950/95 text-amber-200 border-amber-500/80 shadow-[0_0_8px_rgba(217,119,6,0.25)]";
    }
  };

  // Ngũ hành khí số màu sắc
  const getElementColorClass = (element?: string) => {
    switch (element) {
      case "Kim":
        return "text-[#F5E6C8] border-amber-400/50 bg-amber-950/40";
      case "Mộc":
        return "text-emerald-300 border-emerald-500/50 bg-emerald-950/40";
      case "Thủy":
        return "text-sky-300 border-sky-500/50 bg-sky-950/40";
      case "Hỏa":
        return "text-rose-300 border-rose-500/50 bg-rose-950/40";
      case "Thổ":
        return "text-amber-300 border-amber-600/50 bg-amber-950/40";
      default:
        return "text-gold-300 border-gold-600/50 bg-lacquer-800";
    }
  };

  if (compact) {
    return (
      <div
        className={`w-full max-w-[260px] mx-auto mt-1.5 p-1.5 rounded-lg bg-[#14100C]/95 border border-[#3E2F1F] text-center space-y-1 shadow-md card-full-info-block ${className}`}
      >
        {/* Số quẻ & Tên quẻ */}
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          <span className="font-mono text-[10px] font-bold text-[#C9A55A] bg-[#22170E] px-1.5 py-0.2 rounded border border-[#48331E]">
            #{card.number.toString().padStart(2, "0")}
          </span>
          <span className="font-serif font-bold text-[11px] sm:text-xs text-[#F5EAD4] tracking-wide">
            {card.name}
          </span>
          <span className="font-serif text-[10px] sm:text-[11px] text-[#C9A55A]">
            ({card.hanzi})
          </span>
        </div>

        {/* Âm Hán Việt & Thượng/Hạ quái */}
        <div className="text-[9.5px] sm:text-[10px] text-[#B8A690] font-serif flex items-center justify-center gap-1 flex-wrap">
          <span>{card.vietnameseName}</span>
          <span>•</span>
          <span>
            {card.upperTrigram}/{card.lowerTrigram}
          </span>
          {card.element && (
            <>
              <span>•</span>
              <span className={`px-1 rounded text-[8.5px] font-mono border ${getElementColorClass(card.element)}`}>
                Hành {card.element}
              </span>
            </>
          )}
        </div>

        {/* Badges Omen & Chiều lá bài */}
        <div className="flex items-center justify-center gap-1 flex-wrap pt-0.5">
          {card.omen && (
            <span
              className={`px-1.5 py-0.2 rounded text-[8.5px] font-serif font-bold border ${getOmenBadgeClass(
                card.omen
              )}`}
            >
              {card.omen}
            </span>
          )}

          {reversed ? (
            <span className="px-1.5 py-0.2 rounded text-[8.5px] font-serif font-bold bg-rose-950/95 text-rose-200 border border-rose-600/80 shadow">
              Chiều Ngược
            </span>
          ) : (
            <span className="px-1.5 py-0.2 rounded text-[8.5px] font-serif font-bold bg-[#1C160F] text-[#D6B97A] border border-[#523E25]">
              Chiều Xuôi
            </span>
          )}

          {deckNumber && deckNumber > 1 && (
            <span className="px-1 py-0.2 rounded text-[8.5px] font-mono text-[#C9A55A] bg-[#1A120B] border border-[#422F1B]">
              Bộ #{deckNumber}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Chế độ đầy đủ tiêu chuẩn (Dùng cho CardDraw, HexagramDetail, Tháp La, v.v.)
  return (
    <div
      className={`w-full max-w-[340px] sm:max-w-[420px] mx-auto mt-2 p-2.5 sm:p-3.5 rounded-xl bg-gradient-to-b from-[#1C150E] to-[#120D08] border-2 border-[#523E26] text-center space-y-1.5 shadow-xl card-full-info-block relative z-20 ${className}`}
    >
      {/* Role / Vị trí nếu có */}
      {roleTitle && (
        <div className="text-[9.5px] sm:text-[11px] font-mono font-bold text-[#E6C98A] uppercase tracking-wider bg-[#261B10] px-2 py-0.5 rounded-md border border-[#4E3720] inline-block max-w-full">
          {roleTitle}
        </div>
      )}

      {/* Dòng 1: Số quẻ, Biểu tượng quẻ, Tên Quẻ, Chữ Hán */}
      <div className="flex items-center justify-center gap-2 flex-wrap pt-0.5">
        <span className="font-mono text-xs sm:text-sm font-bold text-[#C9A55A] bg-[#2A1D11] px-2 py-0.5 rounded border border-[#5A3F23] shadow-xs">
          Quẻ #{card.number.toString().padStart(2, "0")}
        </span>
        {card.symbol && (
          <span className="text-base sm:text-lg text-[#E6C98A] opacity-90">
            {card.symbol}
          </span>
        )}
        <h4 className="font-serif font-bold text-sm sm:text-base md:text-lg text-[#F5EAD4] tracking-wide card-title-text">
          {card.name}
        </h4>
        <span className="font-serif text-xs sm:text-sm text-[#C9A55A] font-semibold">
          ({card.hanzi})
        </span>
      </div>

      {/* Dòng 2: Âm Hán Việt • Cấu trúc Thượng Quái / Hạ Quái • Ngũ Hành */}
      <div className="text-[11px] sm:text-xs text-[#C5B49E] font-serif flex items-center justify-center gap-1.5 flex-wrap">
        <span className="font-medium text-[#EAD8B1]">{card.vietnameseName}</span>
        <span className="text-[#6E5738]">•</span>
        <span>
          Thượng: <strong className="text-[#F3E6C8]">{card.upperTrigram}</strong> • Hạ:{" "}
          <strong className="text-[#F3E6C8]">{card.lowerTrigram}</strong>
        </span>
        {card.element && (
          <>
            <span className="text-[#6E5738]">•</span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold border ${getElementColorClass(card.element)}`}>
              Hành {card.element}
            </span>
          </>
        )}
      </div>

      {/* Dòng 3: Badges Điềm Báo, Chiều Lá Bài, Số Bộ */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap pt-1">
        {card.omen && (
          <span
            className={`px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-serif font-bold border ${getOmenBadgeClass(
              card.omen
            )}`}
          >
            Điềm: {card.omen}
          </span>
        )}

        {reversed ? (
          <span className="px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-serif font-bold bg-rose-950/95 text-rose-200 border border-rose-600/80 shadow">
            Chiều Ngược (Trở Ngại / Cần Cẩn Trọng)
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-serif font-bold bg-[#1C160F] text-[#D6B97A] border border-[#523E25]">
            Chiều Xuôi (Thuận Khí Đắc Thời)
          </span>
        )}

        {deckNumber && deckNumber > 1 && (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-[#C9A55A] bg-[#1A120B] border border-[#422F1B]">
            Bộ Bài #{deckNumber}
          </span>
        )}
      </div>

      {/* Dòng 4: Thoán từ kinh văn / Ý nghĩa cốt tủy (Hiển thị trọn vẹn, không line-clamp) */}
      {showJudgment && card.judgment && (
        <div className="mt-2 pt-2 border-t border-[#3B2B1B] text-left sm:text-center">
          <p className="text-[11px] sm:text-xs text-[#D8C7B0] italic font-serif leading-relaxed card-info-text">
            <span className="text-[#C9A55A] font-bold not-italic font-mono mr-1">
              [Thoán Từ]:
            </span>
            "{card.judgment}"
          </p>
        </div>
      )}

      {/* Dòng 5: Lời khuyên Đạo Dịch (nếu yêu cầu) */}
      {showAdvice && card.advice && (
        <div className="pt-1.5 text-left sm:text-center">
          <p className="text-[10.5px] sm:text-[11.5px] text-[#B8A78F] font-serif leading-relaxed">
            <span className="text-[#C9A55A] font-bold font-mono mr-1">
              [Lời Khuyên]:
            </span>
            {card.advice}
          </p>
        </div>
      )}
    </div>
  );
};
