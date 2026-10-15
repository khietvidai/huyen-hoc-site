import React, { useState } from "react";
import {
  Layers,
  Scroll,
  BookOpen,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Compass,
  ArrowRight,
} from "lucide-react";
import { XIANGZHUAN_DATA, HexagramXiangzhuan, LineXiangzhuan } from "../data/xiangzhuanData";
import { getCanonicalHexagram } from "../data/canonical";

interface XiangzhuanViewProps {
  hexNumber: number;
  initialTab?: "all" | "daxiang" | "xiaoxiang";
  compact?: boolean;
}

export const XiangzhuanView: React.FC<XiangzhuanViewProps> = ({
  hexNumber,
  initialTab = "all",
  compact = false,
}) => {
  const [activeTab, setActiveTab] = useState<"all" | "daxiang" | "xiaoxiang">(initialTab);
  const [selectedLine, setSelectedLine] = useState<number | "all">("all");
  const [copied, setCopied] = useState(false);

  const data: HexagramXiangzhuan | undefined = XIANGZHUAN_DATA[hexNumber];

  if (!data) return null;

  const handleCopy = () => {
    let text = `=== TƯỢNG TRUYỆN QUẺ #${data.number}: ${data.name} (${data.vietnameseName}) ===\n\n`;
    text += `【ĐẠI TƯỢNG TRUYỆN】\n`;
    text += `• Nguyên văn: ${data.daxiang.original}\n`;
    text += `• Dịch nghĩa: ${data.daxiang.meaning}\n`;
    text += `• Luận giải đạo quân tử: ${data.daxiang.explanation}\n\n`;
    text += `【TIỂU TƯỢNG TRUYỆN (6 HÀO)】\n`;
    data.xiaoxiang.forEach((line) => {
      text += `[${line.lineName}]: ${line.xiangOriginal}\n`;
      text += `  -> Dịch nghĩa: ${line.xiangMeaning}\n`;
      text += `  -> Giải thích: ${line.explanation}\n`;
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-br from-[#1C1610] via-[#16120E] to-[#100D0A] border border-[#483723] rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-[#332617] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#261C12] border border-[#523E28] flex items-center justify-center text-[#D4AF37] shrink-0">
            <Scroll className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-bold text-[#D4AF37] uppercase tracking-wider bg-[#261C12] px-2 py-0.5 rounded border border-[#3E2E1D]">
                Thập Dực • Khổng Tử
              </span>
              <span className="text-[10px] font-mono text-[#A89882]">Quẻ #{data.number}</span>
            </div>
            <h4 className="text-sm sm:text-base font-serif font-bold text-[#F5EAD4]">
              Đại Tượng Truyện & Tiểu Tượng Truyện
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab Switcher */}
          <div className="flex items-center bg-[#130F0C] border border-[#332617] rounded-xl p-0.5 text-xs font-serif">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                activeTab === "all"
                  ? "bg-[#D4AF37] text-[#14100C] font-bold shadow"
                  : "text-[#8C7A65] hover:text-[#D4AF37]"
              }`}
            >
              Tất Cả
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("daxiang")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                activeTab === "daxiang"
                  ? "bg-[#D4AF37] text-[#14100C] font-bold shadow"
                  : "text-[#8C7A65] hover:text-[#D4AF37]"
              }`}
            >
              Đại Tượng
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("xiaoxiang")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                activeTab === "xiaoxiang"
                  ? "bg-[#D4AF37] text-[#14100C] font-bold shadow"
                  : "text-[#8C7A65] hover:text-[#D4AF37]"
              }`}
            >
              Tiểu Tượng (6 Hào)
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-[#201710] hover:bg-[#2F2216] border border-[#3E2E1D] text-[#C4B294] hover:text-[#FFF] transition-all cursor-pointer"
            title="Sao chép toàn bộ Tượng Truyện quẻ này"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 1. KHỐI ĐẠI TƯỢNG TRUYỆN (TOÀN QUẺ) */}
      {(activeTab === "all" || activeTab === "daxiang") && (
        <div className="bg-[#15110D] border border-[#3A2C1B] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#281D13] pb-2">
            <span className="text-xs font-serif font-bold text-[#E5C378] flex items-center gap-1.5 uppercase tracking-wide">
              <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
              🏛️ Đại Tượng Truyện (大象傳 - Toàn Quẻ)
            </span>
            <span className="text-[10px] font-mono text-[#8C7A65]">Đạo Quân Tử & Quản Trị</span>
          </div>

          {/* Nguyên văn chữ Hán Việt */}
          <div className="bg-[#1D1610] p-3 rounded-lg border-l-3 border-[#D4AF37] border-y border-r border-[#362719]">
            <span className="text-[10px] font-mono text-[#A89882] block mb-0.5 uppercase tracking-wider">
              Nguyên Văn Tượng Viết (Hán Việt):
            </span>
            <p className="text-xs sm:text-sm font-serif font-bold text-[#F5EAD4] italic">
              “{data.daxiang.original}”
            </p>
          </div>

          {/* Dịch nghĩa */}
          <div className="text-xs font-serif text-[#DCD1BC] pl-2 border-l border-[#3D2E1E]">
            <strong className="text-[#D4AF37]">Dịch nghĩa: </strong>
            <span>{data.daxiang.meaning}</span>
          </div>

          {/* Giải thích triết lý đại tượng */}
          <div className="bg-[#18130E] p-3 rounded-lg border border-[#2D2014] text-xs font-serif leading-relaxed text-[#C5B49E]">
            <strong className="text-[#E0B861] block mb-1">
              💡 Luận giải triết lý Đại Tượng & Đạo Xử Thế Bậc Quân Tử:
            </strong>
            <p>{data.daxiang.explanation}</p>
          </div>
        </div>
      )}

      {/* 2. KHỐI TIỂU TƯỢNG TRUYỆN (6 HÀO) */}
      {(activeTab === "all" || activeTab === "xiaoxiang") && (
        <div className="bg-[#15110D] border border-[#3A2C1B] rounded-xl p-4 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#281D13] pb-2">
            <span className="text-xs font-serif font-bold text-[#E5C378] flex items-center gap-1.5 uppercase tracking-wide">
              <Scroll className="w-3.5 h-3.5 text-[#D4AF37]" />
              📜 Tiểu Tượng Truyện (小象傳 - Giải Thích Từng Hào)
            </span>

            {/* Bộ lọc xem nhanh từng hào */}
            <div className="flex items-center gap-1 overflow-x-auto text-[11px] font-serif">
              <span className="text-[#8C7A65] text-[10px] mr-1 hidden sm:inline">Xem hào:</span>
              <button
                type="button"
                onClick={() => setSelectedLine("all")}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                  selectedLine === "all"
                    ? "bg-[#D4AF37] text-[#14100C] font-bold"
                    : "bg-[#201811] text-[#A89882] hover:text-[#FFF]"
                }`}
              >
                {data.xiaoxiang.length === 7 ? "Tất cả (6 hào + Dụng)" : "Cả 6 hào"}
              </button>
              {data.xiaoxiang.map((lx) => {
                const l = lx.line;
                const isSpecial = l === 7;
                return (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setSelectedLine(l)}
                    className={`px-1.5 py-0.5 rounded transition-all cursor-pointer font-mono ${
                      selectedLine === l
                        ? isSpecial
                          ? "bg-gradient-to-r from-amber-400 to-yellow-300 text-black font-black"
                          : "bg-[#D4AF37] text-[#14100C] font-bold"
                        : isSpecial
                        ? "bg-[#2F1F0E] text-[#FFD770] border border-[#D4AF37]/60"
                        : "bg-[#201811] text-[#A89882] hover:text-[#FFF]"
                    }`}
                    title={isSpecial ? lx.lineName : `Hào ${l}`}
                  >
                    {isSpecial ? "✨ Dụng" : `H.${l}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Danh sách 6 hào Tiểu Tượng */}
          <div className="space-y-3">
            {data.xiaoxiang
              .filter((line) => selectedLine === "all" || selectedLine === line.line)
              .map((line) => {
                const isYang = line.lineName.includes("Cửu");
                return (
                  <div
                    key={line.line}
                    className="bg-[#1A140F] border border-[#332617] hover:border-[#4E3923] rounded-xl p-3.5 transition-all space-y-2 relative"
                  >
                    <div className="flex items-center justify-between border-b border-[#281D13] pb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-5 h-5 rounded flex items-center justify-center font-mono text-[10px] font-bold ${
                            isYang
                              ? "bg-amber-950/80 text-amber-300 border border-amber-700/60"
                              : "bg-slate-900 text-slate-300 border border-slate-700/60"
                          }`}
                        >
                          {line.line}
                        </span>
                        <strong className="text-xs font-serif text-[#F5EAD4]">
                          {line.lineName}
                        </strong>
                        <span className="text-[10px] font-mono text-[#8C7A65]">
                          ({isYang ? "Hào Dương —" : "Hào Âm - -"})
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[#D4AF37] bg-[#22180F] px-2 py-0.5 rounded border border-[#3D2C1A]">
                        Tiểu Tượng Hào {line.line}
                      </span>
                    </div>

                    {/* Ô chữ Hán nguyên bản của Hào */}
                    {(() => {
                      const canonHex = getCanonicalHexagram(hexNumber);
                      const yaoHanzi = canonHex?.lines[line.line - 1]?.hanzi;
                      if (!yaoHanzi) return null;
                      return (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-[#2B1B0E] text-[#FDE59C] border border-[#D4AF37] px-2.5 py-0.5 rounded font-serif font-bold text-xs tracking-wider shadow-sm">
                            【 {yaoHanzi} 】
                          </span>
                          <span className="text-[10px] font-mono text-[#A89882]">Hán tự Lời Hào</span>
                        </div>
                      );
                    })()}

                    {/* Lời Tượng */}
                    <div className="text-xs font-serif text-[#F0E4CE] italic pl-2.5 border-l-2 border-[#D4AF37]">
                      {line.xiangOriginal}
                    </div>

                    {/* Dịch nghĩa */}
                    <div className="text-xs font-serif text-[#D0C2AB]">
                      <span className="text-[#C89B3C] font-semibold">Dịch nghĩa: </span>
                      {line.xiangMeaning}
                    </div>

                    {/* Giải thích chi tiết */}
                    <div className="bg-[#140F0B] p-2.5 rounded-lg border border-[#261B10] text-xs font-serif text-[#BBA993] leading-relaxed">
                      <span className="text-[#E0B861] font-semibold">Dịch lý & bài học: </span>
                      {line.explanation}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};
