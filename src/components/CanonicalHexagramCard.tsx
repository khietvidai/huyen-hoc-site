import React, { useState } from "react";
import {
  BookOpen,
  ArrowLeft,
  ArrowRight,
  Copy,
  Check,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  Compass,
  Scroll,
  Layers,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  getCanonicalHexagram,
  formatCanonicalCopyText,
  CanonicalHexagram,
  CanonicalYao,
} from "../data/canonical";
import { HEXAGRAMS } from "../data/hexagrams";

interface CanonicalHexagramCardProps {
  hexNumber: number;
  onNavigateHex?: (hexNum: number) => void;
  initialLine?: number; // 1..7 or undefined for line 1 default
  selectedLine?: number | "all";
  onSelectLine?: (line: number | "all") => void;
  compact?: boolean;
}

export const CanonicalHexagramCard: React.FC<CanonicalHexagramCardProps> = ({
  hexNumber,
  onNavigateHex,
  initialLine,
  selectedLine: controlledSelectedLine,
  onSelectLine,
  compact = false,
}) => {
  const [internalSelectedLine, setInternalSelectedLine] = useState<number | "all">(initialLine || 1);
  const selectedLine = controlledSelectedLine !== undefined ? controlledSelectedLine : internalSelectedLine;

  const setSelectedLine = (line: number | "all") => {
    setInternalSelectedLine(line);
    onSelectLine?.(line);
  };

  React.useEffect(() => {
    if (initialLine !== undefined && controlledSelectedLine === undefined) {
      setInternalSelectedLine(initialLine);
    }
  }, [initialLine, hexNumber, controlledSelectedLine]);

  const [copied, setCopied] = useState(false);
  const [copiedLine, setCopiedLine] = useState<number | null>(null);

  const hexData: CanonicalHexagram | undefined = getCanonicalHexagram(hexNumber);
  const currentHexMeta = HEXAGRAMS.find((h) => h.number === hexNumber);

  if (!hexData) return null;

  const prevHexNum = hexNumber > 1 ? hexNumber - 1 : 64;
  const nextHexNum = hexNumber < 64 ? hexNumber + 1 : 1;
  const prevHexMeta = HEXAGRAMS.find((h) => h.number === prevHexNum);
  const nextHexMeta = HEXAGRAMS.find((h) => h.number === nextHexNum);

  const handleCopyFull = () => {
    const text = formatCanonicalCopyText(hexData);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopySingleLine = (lineIdx: number) => {
    const text = formatCanonicalCopyText(hexData, lineIdx);
    navigator.clipboard.writeText(text);
    setCopiedLine(lineIdx + 1);
    setTimeout(() => setCopiedLine(null), 2000);
  };

  const maxLines = hexData.lines.length;

  const handlePrevLine = () => {
    if (selectedLine === "all") {
      setSelectedLine(1);
    } else {
      setSelectedLine(selectedLine > 1 ? selectedLine - 1 : maxLines);
    }
  };

  const handleNextLine = () => {
    if (selectedLine === "all") {
      setSelectedLine(1);
    } else {
      setSelectedLine(selectedLine < maxLines ? selectedLine + 1 : 1);
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#1C1610] via-[#16120E] to-[#0E0B08] border-2 border-[#523E26] rounded-2xl p-4 sm:p-6 shadow-2xl space-y-5 text-left relative overflow-hidden">
      {/* Decorative golden bar at top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D4AF37] via-[#FFF0B8] to-[#997A24]" />

      {/* Top Header & Hexagram Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-[#382A1B] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-[#2B1D12] text-[#E5C378] font-mono text-xs font-bold border border-[#4E3722] flex items-center gap-1.5">
              <Scroll className="w-3.5 h-3.5 text-[#D4AF37]" />
              KHO TÀNG KINH DỊCH NGUYÊN BẢN • HÀO TỪ CỐT LÕI
            </span>
            <span className="text-[11px] font-mono text-[#A89882]">Quẻ #{hexData.number}/64</span>
          </div>

          <h3 className="text-lg sm:text-2xl font-serif font-black text-[#F8EED9] tracking-wide">
            {hexData.title}
          </h3>
        </div>

        {/* Global Action & Navigation */}
        <div className="flex items-center gap-2 flex-wrap">
          {onNavigateHex && (
            <div className="flex items-center bg-[#14100C] border border-[#3E2E1D] rounded-xl p-0.5 text-xs font-serif">
              <button
                type="button"
                onClick={() => onNavigateHex(prevHexNum)}
                className="px-2.5 py-1 rounded-lg text-[#C8B89E] hover:text-[#FFF] hover:bg-[#251B12] flex items-center gap-1 transition-all cursor-pointer"
                title={`Nhấn vào đây để trở về phần trước (Quẻ #${prevHexNum})`}
              >
                <ChevronLeft className="w-4 h-4 text-[#D4AF37]" />
                <span className="hidden sm:inline">Trở về: Quẻ #{prevHexNum}</span>
                <span className="sm:hidden">#{prevHexNum}</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateHex(nextHexNum)}
                className="px-2.5 py-1 rounded-lg text-[#C8B89E] hover:text-[#FFF] hover:bg-[#251B12] flex items-center gap-1 transition-all cursor-pointer"
                title={`Nhấn vào đây để qua phần tiếp theo (Quẻ #${nextHexNum})`}
              >
                <span className="hidden sm:inline">Tiếp: Quẻ #{nextHexNum}</span>
                <span className="sm:hidden">#{nextHexNum}</span>
                <ChevronRight className="w-4 h-4 text-[#D4AF37]" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleCopyFull}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#241A12] hover:bg-[#342417] text-[#E5C378] hover:text-[#FFF] border border-[#483420] text-xs font-serif transition-all cursor-pointer shadow active:scale-95"
            title="Sao chép toàn bộ nội dung quẻ & 6 hào theo mẫu chuẩn"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Đã sao chép</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Sao chép mẫu chuẩn</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 1. TƯỢNG VÀ Ý CỦA TOÀN QUẺ */}
      <div className="bg-[#15110D] border border-[#3E2E1D] rounded-xl p-4 sm:p-5 space-y-3 shadow-inner">
        <div className="flex items-center justify-between border-b border-[#2B1F14] pb-2">
          <span className="text-xs font-serif font-bold text-[#E5C378] uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#D4AF37]" />
            Tượng và Ý của toàn quẻ
          </span>
          <span className="text-[10px] font-mono text-[#8C7A65]">Đạo Lý Cốt Tủy & Thoán Từ</span>
        </div>

        {(() => {
          const match = hexData.symbolAndMeaning.match(/^([^\(（]+?)\s*[\(（]([^\)）]+)[\)）]\.\s*(.*)$/s);
          if (match) {
            const [, hanziThoan, vietThoan, expl] = match;
            return (
              <div className="space-y-2.5">
                <div className="bg-gradient-to-r from-[#24190F] via-[#2F2013] to-[#1A120A] border border-[#4D361F] rounded-lg p-3 flex flex-wrap items-center justify-between gap-2 shadow-sm">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#D4AF37] bg-[#140E08] px-2 py-0.5 rounded border border-[#4A341C] font-bold">
                      Thoán Từ Chữ Hán:
                    </span>
                    <span className="text-base sm:text-lg font-serif font-black text-[#FFE8A3] tracking-widest">
                      {hanziThoan.trim()}
                    </span>
                  </div>
                  <div className="text-xs font-serif text-[#DFCDB5] italic">
                    ({vietThoan.trim()})
                  </div>
                </div>
                <p className="text-xs sm:text-sm font-serif leading-relaxed text-[#EDE3D0]">
                  {expl.trim()}
                </p>
              </div>
            );
          }
          return (
            <p className="text-xs sm:text-sm font-serif leading-relaxed text-[#EDE3D0] first-letter:text-xl first-letter:font-bold first-letter:text-[#D4AF37] first-letter:mr-0.5">
              {hexData.symbolAndMeaning}
            </p>
          );
        })()}
      </div>

      {/* 2. THANH ĐIỀU HƯỚNG VÀ BỘ CHỌN HÀO */}
      <div className="bg-[#14100C] border border-[#342617] rounded-xl p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-serif font-bold text-[#D4AF37] mr-1 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            Chọn hào:
          </span>
          <button
            type="button"
            onClick={() => setSelectedLine("all")}
            className={`px-2.5 py-1 rounded-lg text-xs font-serif transition-all cursor-pointer ${
              selectedLine === "all"
                ? "bg-[#D4AF37] text-[#120F0C] font-bold shadow-md"
                : "bg-[#201811] text-[#A6957E] hover:text-[#FFF]"
            }`}
          >
            {hexData.lines.length === 7 ? "Tất cả (6 hào + Dụng)" : "Tất cả (6 hào)"}
          </button>
          {hexData.lines.map((yao) => {
            const lineNum = yao.line;
            const isSpecial = lineNum === 7;
            const isActive = selectedLine === lineNum;
            return (
              <button
                key={lineNum}
                type="button"
                onClick={() => setSelectedLine(lineNum)}
                className={`px-2.5 py-1 rounded-lg text-xs font-serif transition-all cursor-pointer flex items-center gap-1 ${
                  isActive
                    ? isSpecial
                      ? "bg-gradient-to-r from-amber-400 to-yellow-300 text-black font-black shadow-lg scale-105 ring-2 ring-amber-300"
                      : "bg-[#D4AF37] text-[#120F0C] font-bold shadow-md scale-105"
                    : isSpecial
                    ? "bg-[#33200D] border border-[#D4AF37] text-[#FFD770] hover:text-[#FFF] hover:bg-[#482E15]"
                    : "bg-[#201811] text-[#A6957E] hover:text-[#FFF] hover:bg-[#2C1F15]"
                }`}
                title={isSpecial ? `Hào đặc biệt khi động cả 6 hào: ${yao.name}` : `Hào ${lineNum}: ${yao.name}`}
              >
                <span className="font-mono">{isSpecial ? "✨" : `H.${lineNum}`}</span>
                <span className={`text-[10px] ${isSpecial ? "font-bold" : "hidden md:inline"}`}>
                  {isSpecial ? yao.name : `(${yao.name})`}
                </span>
              </button>
            );
          })}
        </div>

        {/* Nút lật hào Trước / Sau */}
        <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={handlePrevLine}
            className="px-3 py-1.5 rounded-lg bg-[#201710] hover:bg-[#2F2116] border border-[#3D2C1C] hover:border-[#D4AF37] text-xs font-serif text-[#CBB99E] hover:text-[#FFF] flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
            title="Nhấn vào đây để trở về phần trước"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="font-medium">Nhấn vào đây để trở về phần trước</span>
          </button>
          <button
            type="button"
            onClick={handleNextLine}
            className="px-3 py-1.5 rounded-lg bg-[#201710] hover:bg-[#2F2116] border border-[#3D2C1C] hover:border-[#D4AF37] text-xs font-serif text-[#CBB99E] hover:text-[#FFF] flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
            title="Nhấn vào đây để qua phần tiếp theo"
          >
            <span className="font-medium">Nhấn vào đây để qua phần tiếp theo</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37]" />
          </button>
        </div>
      </div>

      {/* 3. KHỐI KINH DỊCH HÀO TỪ CỐT LÕI (DANH SÁCH HÀO THEO MẪU CHUẨN) */}
      <div className="space-y-4">
        {hexData.lines
          .filter((yao) => selectedLine === "all" || selectedLine === yao.line)
          .map((yao, idx) => {
            const lineIdx = yao.line - 1;
            const isYang = yao.name.includes("Cửu");
            const isSpecial = yao.line === 7;

            return (
              <div
                key={yao.line}
                id={`canonical-line-${yao.line}`}
                className={`${
                  isSpecial
                    ? "bg-gradient-to-b from-[#23180E] via-[#1A120A] to-[#120D08] border-2 border-[#D4AF37] ring-1 ring-[#D4AF37]/50 shadow-[0_0_25px_rgba(212,175,55,0.18)]"
                    : "bg-[#16120E] border-2 border-[#3E2E1D] hover:border-[#6B502C] shadow-lg"
                } rounded-2xl p-4 sm:p-5 transition-all space-y-4 relative`}
              >
                {/* Header của từng Hào */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2C2014] pb-2.5">
                  <div className="flex items-center gap-2.5">
                    {isSpecial ? (
                      <span className="px-2.5 h-6 rounded-lg flex items-center justify-center font-mono text-[11px] font-black shadow bg-gradient-to-r from-amber-400 to-yellow-300 text-black border border-yellow-200">
                        ĐẶC BIỆT
                      </span>
                    ) : (
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono text-xs font-black shadow ${
                          isYang
                            ? "bg-amber-950 text-amber-300 border border-amber-600/70"
                            : "bg-slate-900 text-slate-300 border border-slate-600/70"
                        }`}
                      >
                        {yao.line}
                      </span>
                    )}
                    <div>
                      <h4 className="text-sm sm:text-base font-serif font-black text-[#F3E5AB] flex items-center gap-1.5">
                        {isSpecial && <Sparkles className="w-4 h-4 text-[#D4AF37] animate-pulse shrink-0" />}
                        {isSpecial ? yao.name : `HÀO ${yao.line}: ${yao.name}`}
                      </h4>
                      <span className={`text-[10px] font-mono ${isSpecial ? "text-[#E5C378] font-bold" : "text-[#9E8B75]"}`}>
                        {isSpecial
                          ? yao.name.includes("Cửu")
                            ? "HÀO THỨ 7: ĐẶC BIỆT KHI CÀN ĐỘNG CẢ 6 HÀO (CÀN BIẾN KHÔN)"
                            : "HÀO THỨ 7: ĐẶC BIỆT KHI KHÔN ĐỘNG CẢ 6 HÀO (KHÔN BIẾN CÀN)"
                          : isYang ? "Dương Cương (—)" : "Âm Nhu (- -)"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${
                      isSpecial
                        ? "text-black bg-[#D4AF37] font-black border-[#FFE082]"
                        : "text-[#D4AF37] bg-[#23180F] border-[#3E2B18]"
                    }`}>
                      {isSpecial ? "QUY TẮC ĐỘNG 6 HÀO" : "KINH DỊCH HÀO TỪ CỐT LÕI"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopySingleLine(lineIdx)}
                      className="p-1 rounded bg-[#201710] hover:bg-[#312215] border border-[#3E2C1B] text-[#C4B294] hover:text-[#FFF] transition-all cursor-pointer"
                      title={`Sao chép nội dung ${yao.name}`}
                    >
                      {copiedLine === yao.line ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Ô CHỮ HÁN NGUYÊN BẢN CỦA LỜI HÀO */}
                <div className="bg-gradient-to-r from-[#2A1D11] via-[#382615] to-[#1E140B] border-2 border-[#D4AF37] rounded-xl p-3 shadow-md flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#D4AF37] bg-[#16100A] px-2.5 py-1 rounded border border-[#523A1E] font-bold flex items-center gap-1.5">
                      <Scroll className="w-3 h-3 text-[#D4AF37]" />
                      Ô CHỮ HÁN NGUYÊN BẢN:
                    </span>
                    <span className="text-[11px] font-serif text-[#C5B39B] hidden sm:inline">
                      Hào Từ Kinh Dịch:
                    </span>
                  </div>
                  <div className="text-base sm:text-xl font-serif font-black text-[#FFE8A3] tracking-widest bg-[#140F0A] px-3.5 py-1.5 rounded-lg border border-[#583E20] shadow-inner">
                    {yao.hanzi}
                  </div>
                </div>

                {/* 1. Lời hào (Chỉ để chữ Hán Việt vs dịch nghĩa, không để chữ Hán) */}
                <div className="bg-[#1C1610] p-3 rounded-xl border-l-4 border-[#D4AF37] border-y border-r border-[#382819] text-xs font-serif space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <strong className="text-[#E6C673] uppercase font-mono text-[10px] tracking-wider flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                      Lời hào (Hán Việt & Dịch nghĩa):
                    </strong>
                  </div>
                  <p className="text-xs sm:text-sm font-serif font-bold text-[#FDF6E3] italic pl-1 leading-relaxed">
                    {yao.coreText}
                  </p>
                </div>

                {/* 2. Nghĩa lý */}
                <div className="bg-[#120E0A] p-3 rounded-xl border border-[#2B1E13] text-xs font-serif leading-relaxed text-[#DDD2BF] pl-3.5 border-l-2 border-[#A87B2C]">
                  <strong className="text-[#D4AF37] block mb-0.5 font-bold">
                    Nghĩa lý:
                  </strong>
                  <p>{yao.meaning}</p>
                </div>

                {/* 3. Tượng số */}
                <div className="bg-[#120E0A] p-3 rounded-xl border border-[#2B1E13] text-xs font-serif leading-relaxed text-[#C8BBA5]">
                  <strong className="text-[#C89B3C] block mb-0.5 font-bold">
                    Tượng số:
                  </strong>
                  <p>{yao.symbolism}</p>
                </div>

                {/* 4. Vị trí */}
                <div className="bg-[#19130D] p-3 rounded-xl border border-[#362618] text-xs font-serif leading-relaxed text-[#BFB09A]">
                  <strong className="text-[#C89B3C] block mb-0.5 font-bold">
                    Vị trí:
                  </strong>
                  <p>{yao.position}</p>
                </div>

                {/* 5. Cặp đôi: Hành động thuận & Hành động ngược */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {/* Hành động thuận */}
                  <div className="bg-[#0F1E13] border border-emerald-900/60 rounded-xl p-3 text-xs font-serif text-[#D3EED8] space-y-1 shadow-sm">
                    <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5 uppercase font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      ✅ Hành động thuận:
                    </div>
                    <p className="leading-relaxed pl-1">{yao.favorableAction}</p>
                  </div>

                  {/* Hành động ngược */}
                  <div className="bg-[#241012] border border-rose-900/60 rounded-xl p-3 text-xs font-serif text-[#F3D5D7] space-y-1 shadow-sm">
                    <div className="text-[11px] font-bold text-rose-400 flex items-center gap-1.5 uppercase font-mono">
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                      🛑 Hành động ngược:
                    </div>
                    <p className="leading-relaxed pl-1">{yao.unfavorableAction}</p>
                  </div>
                </div>

                {/* 6. Luận giải triết lý & ứng dụng thực tiễn chuyên sâu */}
                {(() => {
                  const metaLine = currentHexMeta?.lineMeanings?.find((lm) => lm.line === yao.line);
                  if (!metaLine?.detailedExplanation) return null;
                  return (
                    <div className="bg-gradient-to-r from-[#1C140C] to-[#120E09] p-3.5 rounded-xl border border-[#4D361F] text-xs font-serif space-y-1.5 shadow-sm">
                      <div className="text-[10px] font-mono text-[#D4AF37] uppercase font-bold tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                        <span>Luận Giải Triết Lý & Ứng Dụng Thực Tiễn:</span>
                      </div>
                      <p className="text-xs text-[#EADAC5] leading-relaxed pl-1">
                        {metaLine.detailedExplanation}
                      </p>
                    </div>
                  );
                })()}
              </div>
            );
          })}
      </div>

      {/* 4. THANH CHUYỂN TIẾP RÕ RÀNG: NHẤN VÀO ĐÂY ĐỂ QUA PHẦN TIẾP THEO HOẶC TRỞ VỀ PHẦN TRƯỚC */}
      <div className="mt-6 pt-5 border-t-2 border-[#38291B] space-y-3">
        <div className="text-center">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#A89882]">
            Điều hướng đọc tiếp • Kinh Dịch Chu Kỳ 64 Quẻ
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-serif">
          {/* Nút Trở Về Phần Trước */}
          <button
            type="button"
            onClick={() => {
              if (selectedLine !== "all" && typeof selectedLine === "number" && selectedLine > 1) {
                setSelectedLine(selectedLine - 1);
              } else if (onNavigateHex) {
                onNavigateHex(prevHexNum);
                setSelectedLine(1);
              }
            }}
            className="bg-[#14100C] hover:bg-[#201811] p-3.5 rounded-xl border border-[#3A2A19] hover:border-[#D4AF37] text-left transition-all cursor-pointer group shadow-md hover:shadow-xl active:scale-[0.99] flex flex-col justify-between"
            title="Nhấn vào đây để trở về phần trước"
          >
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-[#C89B3C] uppercase tracking-wider block font-bold flex items-center gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5 text-[#D4AF37] group-hover:-translate-x-1 transition-transform" />
                👈 TRỞ VỀ PHẦN TRƯỚC:
              </span>
              <p className="text-[#EDE3CF] font-bold text-xs sm:text-sm">
                {selectedLine !== "all" && typeof selectedLine === "number" && selectedLine > 1
                  ? `Hào ${selectedLine - 1}: ${hexData.lines[selectedLine - 2].name}`
                  : `Quẻ #${prevHexNum}: ${prevHexMeta?.name || ""}`}
              </p>
            </div>
            <div className="mt-2 pt-1 border-t border-[#251A10] text-[10px] text-[#A6957E] group-hover:text-[#D4AF37]">
              👉 <strong>Nhấn vào đây để trở về phần trước</strong>
            </div>
          </button>

          {/* Nút Qua Phần Tiếp Theo */}
          <button
            type="button"
            onClick={() => {
              if (selectedLine !== "all" && typeof selectedLine === "number" && selectedLine < maxLines) {
                setSelectedLine(selectedLine + 1);
              } else if (onNavigateHex) {
                onNavigateHex(nextHexNum);
                setSelectedLine(1);
              }
            }}
            className="bg-[#14100C] hover:bg-[#201811] p-3.5 rounded-xl border border-[#3A2A19] hover:border-[#D4AF37] text-left sm:text-right transition-all cursor-pointer group shadow-md hover:shadow-xl active:scale-[0.99] flex flex-col justify-between"
            title="Nhấn vào đây để qua phần tiếp theo"
          >
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-[#C89B3C] uppercase tracking-wider block font-bold flex items-center justify-start sm:justify-end gap-1.5">
                👉 QUA PHẦN TIẾP THEO:
                <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37] group-hover:translate-x-1 transition-transform" />
              </span>
              <p className="text-[#EDE3CF] font-bold text-xs sm:text-sm">
                {selectedLine !== "all" && typeof selectedLine === "number" && selectedLine < maxLines
                  ? `Hào ${selectedLine + 1}: ${hexData.lines[selectedLine].name}`
                  : `Quẻ #${nextHexNum}: ${nextHexMeta?.name || ""}`}
              </p>
            </div>
            <div className="mt-2 pt-1 border-t border-[#251A10] text-[10px] text-[#A6957E] group-hover:text-[#D4AF37]">
              <strong>Nhấn vào đây để qua phần tiếp theo</strong> 👈
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
