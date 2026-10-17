import React, { useState } from "react";
import { BookOpen, Copy, Check, Sparkles, Compass, Heart, TrendingUp, Scroll } from "lucide-react";
import { CLASSIC_SOURCE_64, ClassicSourceHexagram } from "../data/classicSource64";

interface ClassicInterpretationCardProps {
  hexNumber: number;
  roleTitle?: string;
  roleDescription?: string;
  isCardReversed?: boolean;
  compact?: boolean;
}

export const ClassicInterpretationCard: React.FC<ClassicInterpretationCardProps> = ({
  hexNumber,
  roleTitle,
  roleDescription,
  isCardReversed,
  compact = false,
}) => {
  const [copied, setCopied] = useState(false);
  const data: ClassicSourceHexagram | undefined = CLASSIC_SOURCE_64[hexNumber];

  if (!data) {
    return null;
  }

  const handleCopySection = () => {
    const text =
      `**${data.number}. ${data.hanziTitle} (${data.vietnameseTitle})**\n` +
      `${data.couplet[0]}\n` +
      `${data.couplet[1]}\n` +
      `${data.meaning}\n` +
      `Đại tượng: ${data.greatSymbol}\n` +
      `Vận thế: ${data.fortune}\n` +
      `Tình yêu: ${data.love}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#181410] border border-[#3D3121] rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Decorative top pattern */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C89B3C] via-[#E5C985] to-[#8C6D27]" />

      {/* Header & Role */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#2D2317] pb-4 mb-5">
        <div>
          {roleTitle && (
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[11px] font-mono font-bold tracking-wider text-[#C9A55A] uppercase bg-[#282015] px-2.5 py-0.5 rounded border border-[#443522]">
                {roleTitle}
              </span>
              {isCardReversed !== undefined && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    isCardReversed
                      ? "bg-amber-950/80 text-amber-300 border border-amber-800"
                      : "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
                  }`}
                >
                  {isCardReversed ? "LÁ NGƯỢC (Trở ngại/Thử thách)" : "LÁ XUÔI (Thuận duyên/Hỗ trợ)"}
                </span>
              )}
              {roleDescription && (
                <span className="text-xs text-[#A89882] italic">
                  — {roleDescription}
                </span>
              )}
            </div>
          )}

          <div className="flex items-baseline gap-3 flex-wrap">
            <h3 className="font-serif font-bold text-lg sm:text-xl text-[#F7EEDC] flex items-center gap-2">
              <span className="font-mono text-[#C9A55A] text-base font-bold">
                #{data.number.toString().padStart(2, "0")}
              </span>
              <span>{data.hanziTitle}</span>
              <span className="text-[#C8B89E] font-normal text-base sm:text-lg">
                ({data.vietnameseTitle})
              </span>
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopySection}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-serif text-[#C4B49D] hover:text-[#FFF] bg-[#221C16] hover:bg-[#2F261D] rounded-lg border border-[#3D3120] transition-all cursor-pointer shrink-0"
          title="Sao chép toàn văn giải nghĩa trích nguồn quẻ này"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-bold">Đã chép</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-[#C9A55A]" />
              <span>Chép giải nghĩa</span>
            </>
          )}
        </button>
      </div>

      {/* Couplet (Khẩu quyết Hán Việt) Box */}
      <div className="bg-gradient-to-r from-[#211A12] via-[#261E14] to-[#1E1710] border-l-4 border-[#C89B3C] rounded-r-xl p-4 sm:p-5 mb-5 shadow-inner">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#C9A55A] mb-2">
          <Scroll className="w-3.5 h-3.5" />
          <span>Khẩu Quyết Cổ & Diễn Giải Tượng Ý:</span>
        </div>
        <div className="font-serif text-[#F2E5D0] text-sm sm:text-base leading-relaxed space-y-0.5">
          <p className="font-bold text-[#EAD8B1] tracking-wide">
            {data.couplet[0]}
          </p>
          <p className="font-bold text-[#EAD8B1] tracking-wide">
            {data.couplet[1]}
          </p>
        </div>
        <p className="text-xs sm:text-sm text-[#D1C2AD] italic mt-2.5 pt-2 border-t border-[#382B1C]">
          {data.meaning}
        </p>
      </div>

      {/* 3 Core Interpretation Sections: Đại Tượng, Vận Thế, Tình Yêu */}
      <div className={`grid gap-3.5 ${compact ? "grid-cols-1" : "grid-cols-1"}`}>
        {/* Đại tượng */}
        <div className="bg-[#14100C] border border-[#2F2417] rounded-xl p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#C9A55A] uppercase tracking-wider mb-1.5">
            <Compass className="w-4 h-4 text-[#C9A55A]" />
            <span>Đại Tượng:</span>
          </div>
          <p className="text-xs sm:text-sm text-[#DDD1C0] leading-relaxed pl-6">
            {data.greatSymbol}
          </p>
        </div>

        {/* Vận thế */}
        <div className="bg-[#14100C] border border-[#2F2417] rounded-xl p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#E28355] uppercase tracking-wider mb-1.5">
            <TrendingUp className="w-4 h-4 text-[#E28355]" />
            <span>Vận Thế:</span>
          </div>
          <p className="text-xs sm:text-sm text-[#DDD1C0] leading-relaxed pl-6">
            {data.fortune}
          </p>
        </div>

        {/* Tình yêu */}
        <div className="bg-[#14100C] border border-[#2F2417] rounded-xl p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#F07888] uppercase tracking-wider mb-1.5">
            <Heart className="w-4 h-4 text-[#F07888]" />
            <span>Tình Yêu:</span>
          </div>
          <p className="text-xs sm:text-sm text-[#DDD1C0] leading-relaxed pl-6">
            {data.love}
          </p>
        </div>
      </div>
    </div>
  );
};
