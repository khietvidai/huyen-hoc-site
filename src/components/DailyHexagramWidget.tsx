import React, { useMemo } from "react";
import { Sun, Sparkles, ArrowRight, Calendar } from "lucide-react";
import { getDailyHexagramData } from "../utils/dailyHexagram";
import { getThongThuDayDetails } from "../utils/thongThuDungSu";

export interface DailyHexagramWidgetProps {
  onOpenModal: () => void;
  className?: string;
  cardImages?: Record<number, string>;
}

export const DailyHexagramWidget: React.FC<DailyHexagramWidgetProps> = ({
  onOpenModal,
  className = "",
  cardImages = {},
}) => {
  const today = useMemo(() => new Date(), []);
  const dailyData = useMemo(() => getDailyHexagramData(today), [today]);
  const thongThuData = useMemo(
    () => getThongThuDayDetails(today.getFullYear(), today.getMonth() + 1, today.getDate()),
    [today]
  );

  const { solarDateFormatted, hexNumber, hexagram, advice } = dailyData;
  const cardImage = cardImages[hexNumber];

  return (
    <div
      onClick={onOpenModal}
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#2B1C0E] via-[#21150A] to-[#2B1C0E] border-2 border-[#C9A55A]/80 hover:border-[#F5EAD4] shadow-lg shadow-amber-950/40 p-3 sm:p-4 cursor-pointer transition-all duration-300 hover:scale-[1.008] select-none ${className}`}
    >
      {/* Nền ánh sáng lấp lánh */}
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-amber-500/10 blur-2xl group-hover:bg-amber-400/20 transition-all pointer-events-none" />

      <div className="space-y-2.5 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Phần thông tin Quẻ Ngày */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Ảnh thu nhỏ hoặc Icon */}
            {cardImage ? (
              <div className="w-12 h-16 rounded-lg overflow-hidden border border-[#C9A55A] shadow shrink-0">
                <img
                  src={cardImage}
                  alt={hexagram.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D6B97A] to-[#75511A] flex flex-col items-center justify-center text-[#14120F] shadow-[0_0_15px_rgba(226,183,85,0.3)] border border-[#E6D3A3] shrink-0 group-hover:rotate-6 transition-transform">
                <Sun className="w-5 h-5 text-[#14120F]" />
                <span className="text-[9px] font-mono font-bold leading-none mt-0.5">
                  #{hexNumber}
                </span>
              </div>
            )}

            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-bold px-2 py-0.2 rounded-full bg-[#181109] text-amber-300 border border-amber-600/60 uppercase tracking-wider">
                  ☀️ QUẺ NGÀY &amp; LỊCH DỤNG SỰ
                </span>
                <span className="text-[11px] text-[#A89882] font-mono">
                  {solarDateFormatted}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-serif font-black text-sm sm:text-base text-[#F5EAD4] group-hover:text-amber-200 transition-colors">
                  Quẻ #{hexNumber}: {hexagram.name}
                </h3>
                <span className="text-[11px] font-serif font-bold text-[#D6B97A] px-2 py-0.2 rounded bg-amber-950/80 border border-amber-500/50">
                  {advice.headline}
                </span>
              </div>

              <p className="text-[11px] sm:text-xs text-[#C8B89E] font-serif line-clamp-1">
                {advice.summary}
              </p>
            </div>
          </div>

          {/* Nút bấm xem lời bình */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <span className="text-[11px] text-amber-300 font-serif font-bold group-hover:underline flex items-center gap-1">
              <span>Xem Quẻ &amp; Lịch Dụng Sự</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>

        {/* DÒNG HIỂN THỊ TRỰC TIẾP LỊCH DỤNG SỰ CỦA NGÀY */}
        <div className="pt-2 border-t border-[#4D361F]/70 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 flex-wrap font-serif">
            <span className="text-[#DECBB3]">
              🌙 <strong>AL:</strong> {thongThuData.lunarDate.day}/{thongThuData.lunarDate.month} ({thongThuData.lunarDate.monthFullName})
            </span>
            <span className="text-[#8C7D6B] hidden sm:inline">•</span>
            <span className="text-[#E6D3A3] font-bold">
              Ngày {thongThuData.dayCanChi.fullName}
            </span>
            <span className="text-[#8C7D6B] hidden sm:inline">•</span>
            <span className="text-emerald-300/90 text-[11.5px]">
              {thongThuData.napAm.napAm} ({thongThuData.napAm.element})
            </span>
            <span className="text-[#8C7D6B] hidden sm:inline">•</span>
            <span className="text-[#E0CEB1] text-[11.5px]">
              Trực {thongThuData.truc.name} • {thongThuData.trucNhatTinh.name} ({thongThuData.trucNhatTinh.nature})
            </span>
          </div>

          <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
            <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${thongThuData.overallAssessment.badgeClass}`}>
              {thongThuData.overallAssessment.title}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
