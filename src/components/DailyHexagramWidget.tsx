import React, { useMemo } from "react";
import { Sun, ArrowRight } from "lucide-react";
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
      className={`royal-card group p-4 sm:p-5 cursor-pointer select-none ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Phần thông tin Quẻ Ngày */}
        <div className="flex items-center gap-4 min-w-0">
          {/* Ảnh thu nhỏ hoặc ấn quẻ */}
          {cardImage ? (
            <div className="w-12 h-16 rounded-sm overflow-hidden border border-gold-600 shrink-0">
              <img
                src={cardImage}
                alt={hexagram.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
          ) : (
            <div className="w-12 h-14 shrink-0 border border-gold-600 bg-lacquer-950 flex flex-col items-center justify-center">
              <span className="font-serif text-lg text-gold-400 leading-none">卦</span>
              <span className="text-[10px] font-mono text-gold-600 leading-none mt-1.5">#{hexNumber}</span>
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-x-3 gap-y-1 flex-wrap text-[10.5px] uppercase tracking-[0.22em]">
              <span className="text-gold-500 font-medium flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5" />
                Quẻ ngày &amp; Lịch dụng sự
              </span>
              <span className="text-ivory-500 tracking-[0.12em] tabular-nums">{solarDateFormatted}</span>
            </div>

            <div className="flex items-baseline gap-x-3 gap-y-1 flex-wrap mt-1.5">
              <h3 className="font-display text-xl sm:text-2xl text-ivory-100 group-hover:text-gold-200 transition-colors leading-tight">
                Quẻ #{hexNumber}: {hexagram.name}
              </h3>
              <span className="text-[12px] font-serif italic text-gold-400 border-l border-gold-700 pl-3">
                {advice.headline}
              </span>
            </div>

            <p className="mt-1 text-[12.5px] text-ivory-500 font-serif line-clamp-1">
              {advice.summary}
            </p>
          </div>
        </div>

        {/* Lời mời xem lời bình */}
        <span className="shrink-0 self-end sm:self-center flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-gold-500 group-hover:text-gold-300 transition-colors">
          Xem quẻ &amp; lịch
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </span>
      </div>

      {/* DÒNG HIỂN THỊ TRỰC TIẾP LỊCH DỤNG SỰ CỦA NGÀY */}
      <div className="mt-4 pt-3 border-t border-gold-800 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs font-serif">
        <div className="flex items-center gap-x-3 gap-y-1 flex-wrap text-ivory-300">
          <span>
            <span className="text-ivory-500">Âm lịch</span> {thongThuData.lunarDate.day}/{thongThuData.lunarDate.month} ({thongThuData.lunarDate.monthFullName})
          </span>
          <span className="text-gold-700 hidden sm:inline">◆</span>
          <span className="text-gold-300">
            Ngày {thongThuData.dayCanChi.fullName}
          </span>
          <span className="text-gold-700 hidden sm:inline">◆</span>
          <span className="text-emerald-300/80">
            {thongThuData.napAm.napAm} ({thongThuData.napAm.element})
          </span>
          <span className="text-gold-700 hidden sm:inline">◆</span>
          <span>
            Trực {thongThuData.truc.name} · {thongThuData.trucNhatTinh.name} ({thongThuData.trucNhatTinh.nature})
          </span>
        </div>

        <span className={`text-[10px] px-2 py-0.5 rounded-sm font-bold border ${thongThuData.overallAssessment.badgeClass}`}>
          {thongThuData.overallAssessment.title}
        </span>
      </div>
    </div>
  );
};
