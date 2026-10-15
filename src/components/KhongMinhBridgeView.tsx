import React, { useState } from "react";
import {
  Scroll,
  Search,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Flame,
  BookOpen,
  Sparkles,
  Compass,
} from "lucide-react";
import {
  KHONG_MINH_HEXAGRAMS,
  getKhongMinhForHexagram,
  KhongMinhHexagramBridge,
  KhongMinhLineItem,
  PoemSegment,
} from "../data/khongMinhBridgeData";

interface KhongMinhSingleHexViewProps {
  kingWenNumber: number;
  changingLines?: number[];
  className?: string;
  defaultExpanded?: boolean;
}

/**
 * Hiển thị chi tiết toàn diện bài thơ Khổng Minh:
 * 1. Dịch nghĩa thơ thuần Việt
 * 2. Phân tích từng đoạn câu thơ (Chữ Hán, Phiên âm, Dịch nghĩa, Điển tích & Hàm ý từng câu)
 * 3. Điển tích & Lịch sử cổ đại Á Đông
 * 4. Triết học Đạo giáo, Dịch học & Nho gia tu thân
 */
export const OraclePoemDetailView: React.FC<{ lineItem: KhongMinhLineItem }> = ({ lineItem }) => {
  const [showSegments, setShowSegments] = useState(true);

  const {
    oracleMeaning,
    poemSegments = [],
    historicalAllusion,
    philosophicalMeaning,
  } = lineItem;

  // Extract from oracleMeaning if dedicated fields are empty
  const poemMatch = oracleMeaning?.match(/Dịch nghĩa thơ:\s*(".*?"|'.*?'|[^.]+\.)/);
  const poemTranslation = poemMatch
    ? poemMatch[1].replace(/^["']|["']$/g, "")
    : (poemSegments.length > 0 ? poemSegments.map(s => s.meaning).join(", ") + "." : "");

  const histText = historicalAllusion || oracleMeaning?.match(/Điển tích & Lịch sử:\s*(.*?)(?=\s*Triết học & Đạo giáo:|$)/)?.[1]?.trim();
  const philText = philosophicalMeaning || oracleMeaning?.match(/Triết học & Đạo giáo:\s*(.+)$/)?.[1]?.trim();

  return (
    <div className="space-y-3 text-[11px] font-serif leading-relaxed pt-2.5 border-t border-[#251B12]">
      {/* 1. Dịch nghĩa thơ thuần Việt */}
      {poemTranslation && (
        <div className="text-[#FFE294] italic bg-[#18110A] p-3 rounded-lg border border-[#2D2115] shadow-inner">
          <span className="text-[#D4AF37] font-semibold not-italic">📜 Dịch nghĩa toàn bài: </span>
          "{poemTranslation}"
        </div>
      )}

      {/* 2. Phân tích từng đoạn câu thơ */}
      {poemSegments.length > 0 && (
        <div className="bg-[#120D09] rounded-lg border border-[#2E2013] overflow-hidden">
          <button
            type="button"
            onClick={() => setShowSegments(!showSegments)}
            className="w-full flex items-center justify-between px-3 py-2 bg-[#1A120B] hover:bg-[#241A10] text-[#E5B552] font-semibold text-[11px] transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <span>✍️ Phân tích từng đoạn câu thơ ({poemSegments.length} đoạn)</span>
            </span>
            <span className="text-[#D4AF37] flex items-center gap-1 text-[10px]">
              {showSegments ? "Thu gọn phân tích" : "Xem chi tiết từng đoạn"}
              {showSegments ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </span>
          </button>

          {showSegments && (
            <div className="p-3 space-y-2.5 border-t border-[#2B1D11] bg-[#0E0A07]">
              {poemSegments.map((seg, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-[#16100B] border border-[#2B1E12] space-y-1.5 hover:border-[#3D2C1A] transition-colors"
                >
                  {/* Segment header: Hanzi & Transcription */}
                  <div className="flex items-center justify-between gap-2 flex-wrap pb-1 border-b border-[#24170D]">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded text-[9px] font-mono font-bold bg-[#291B10] text-[#D4AF37] flex items-center justify-center border border-[#483520]">
                        {idx + 1}
                      </span>
                      <span className="font-serif font-bold text-sm text-[#FFE294] tracking-wide">
                        {seg.hanzi}
                      </span>
                      <span className="text-[#D4AF37] font-medium italic text-[11.5px]">
                        ({seg.transcription})
                      </span>
                    </div>
                  </div>

                  {/* Segment meaning */}
                  <div className="text-[#EADECB] text-[11px] leading-relaxed">
                    <strong className="text-[#C89B3C]">📖 Dịch nghĩa:</strong> {seg.meaning}
                  </div>

                  {/* Segment analysis */}
                  {seg.analysis && (
                    <div className="text-[#D5C6AF] text-[10.5px] pl-2.5 border-l-2 border-[#D4AF37]/60 leading-relaxed bg-[#100A06]/60 p-2 rounded-r">
                      <strong className="text-[#E5B552] not-italic">💡 Phân tích & Đạo lý: </strong>
                      {seg.analysis}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Điển tích & Lịch sử */}
      {histText && (
        <div className="text-[#D8CCA8] bg-[#140F0A] p-3 rounded-lg border border-[#2B1F13] space-y-1 shadow-sm">
          <span className="text-[#E5B552] font-semibold flex items-center gap-1.5">
            <span>🏛️ Điển tích & Lịch sử:</span>
          </span>
          <p className="leading-relaxed text-[10.5px] sm:text-[11px] text-[#DDD0BD]">
            {histText}
          </p>
        </div>
      )}

      {/* 4. Triết học & Đạo giáo */}
      {philText && (
        <div className="text-[#D1C3AB] bg-[#140F0A] p-3 rounded-lg border border-[#2B1F13] space-y-1 shadow-sm">
          <span className="text-[#38BDF8] font-semibold flex items-center gap-1.5">
            <span>☯️ Đạo giáo & Triết học:</span>
          </span>
          <p className="leading-relaxed text-[10.5px] sm:text-[11px] text-[#DDD0BD]">
            {philText}
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * Hiển thị khối liên kết Khổng Minh Thần Quẻ cho một Quẻ Kinh Dịch cụ thể (dùng trong Thuyết Minh từng quẻ & Kết quả Gieo Quẻ)
 */
export const KhongMinhSingleHexView: React.FC<KhongMinhSingleHexViewProps> = ({
  kingWenNumber,
  changingLines = [],
  className = "",
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const bridgeData = getKhongMinhForHexagram(kingWenNumber);

  if (!bridgeData) return null;

  return (
    <div
      className={`bg-gradient-to-br from-[#1C1610] via-[#15110C] to-[#0D0A08] p-4 sm:p-5 rounded-2xl border border-[#483723] space-y-4 shadow-xl relative overflow-hidden ${className}`}
    >
      {/* Decorative Traditional Accent */}
      <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#D4AF37]/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2C1F14] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#8C6D23] flex items-center justify-center text-[#120F0C] font-bold shadow">
            <Scroll className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D4AF37] bg-[#261B10] px-2 py-0.5 rounded border border-[#42311D]">
                Khổng Minh Thần Quẻ (384 Quẻ)
              </span>
              <span className="text-[10px] text-[#A69780] hidden sm:inline-block">
                • Bát Cung Thứ #{bridgeData.orderIndex}
              </span>
            </div>
            <h4 className="text-sm sm:text-base font-serif font-bold text-[#F5EAD4] mt-0.5 flex items-center gap-2 flex-wrap">
              <span>{bridgeData.name}</span>
              {bridgeData.hanzi && (
                <span className="text-xs font-serif font-bold text-[#FFE294] bg-[#24180E] px-2 py-0.5 rounded border border-[#48341E]">
                  {bridgeData.hanzi}
                </span>
              )}
              <span className="text-xs text-[#D4AF37] font-normal">
                (Quẻ #{kingWenNumber} Chu Dịch {bridgeData.vietnameseName ? `• ${bridgeData.vietnameseName}` : ""})
              </span>
            </h4>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#22170E] hover:bg-[#2F2115] border border-[#3E2D1B] hover:border-[#D4AF37] text-xs font-serif font-bold text-[#D4AF37] transition-all cursor-pointer shadow-sm"
        >
          <span>{isExpanded ? "Thu gọn 6 hào Khổng Minh" : "Xem 6 quẻ Khổng Minh (Phân Tích Từng Đoạn, Điển Tích & Triết Lý)"}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Overview Tượng quẻ & Ý quẻ (Chữ Hán, Phiên âm, Dịch nghĩa) */}
      <div className="bg-[#120E0A]/95 p-3.5 sm:p-4 rounded-xl border border-[#2D2115] grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="space-y-1 bg-[#1A130C] p-2.5 rounded-lg border border-[#3A2A1A]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[#D4AF37] font-serif font-bold">Tượng Quẻ:</span>
            {bridgeData.tuongQueHanzi && (
              <span className="text-sm font-serif font-bold text-[#FFE294]">
                {bridgeData.tuongQueHanzi}
              </span>
            )}
            <span className="text-[#E8DCB8] italic">({bridgeData.tuongQue})</span>
          </div>
          {bridgeData.tuongQueMeaning && (
            <div className="text-[11px] text-[#D8CCA8] pl-2 border-l-2 border-[#D4AF37]/50 font-serif leading-relaxed">
              ➔ <strong>Dịch nghĩa:</strong> {bridgeData.tuongQueMeaning}
            </div>
          )}
        </div>

        <div className="space-y-1 bg-[#1A130C] p-2.5 rounded-lg border border-[#3A2A1A]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[#C89B3C] font-serif font-bold">Ý Quẻ:</span>
            {bridgeData.yQueHanzi && (
              <span className="text-sm font-serif font-bold text-[#FFE294]">
                {bridgeData.yQueHanzi}
              </span>
            )}
            <span className="text-[#E8DCB8] italic">({bridgeData.yQue})</span>
          </div>
          {bridgeData.yQueMeaning && (
            <div className="text-[11px] text-[#D8CCA8] pl-2 border-l-2 border-[#C89B3C]/50 font-serif leading-relaxed">
              ➔ <strong>Dịch nghĩa:</strong> {bridgeData.yQueMeaning}
            </div>
          )}
        </div>
      </div>

      {/* 6 Lines & Corresponding Khong Minh Oracles */}
      {isExpanded && (
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between text-[11px] text-[#A69780] font-serif pb-1">
            <span>Chi tiết 6 Hào ứng với 6 Quẻ Khổng Minh Thần Toán (kèm Phân Tích Từng Đoạn Thơ, Điển Tích & Triết Lý Đạo Học):</span>
            {changingLines.length > 0 && (
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" /> Hào Động: {changingLines.map((l) => `Hào ${l}`).join(", ")}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {bridgeData.lines.map((item) => {
              const isChanging = changingLines.includes(item.line);
              return (
                <div
                  key={item.line}
                  id={`khongminh-line-${item.line}`}
                  className={`p-3.5 rounded-xl border transition-all relative space-y-2.5 ${
                    isChanging
                      ? "bg-[#251A10] border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.25)] ring-1 ring-amber-500/40"
                      : "bg-[#14100C] border-[#2E2215] hover:border-[#4B3925]"
                  }`}
                >
                  {/* Line title & Oracle number badge */}
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#251B12]">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`w-5 h-5 rounded-full text-[10px] font-mono font-bold flex items-center justify-center ${
                          isChanging
                            ? "bg-amber-500 text-[#14100C]"
                            : "bg-[#261C12] text-[#D4AF37] border border-[#3E2E1D]"
                        }`}
                      >
                        {item.line}
                      </span>
                      <span
                        className={`text-xs font-serif font-bold ${
                          isChanging ? "text-amber-300" : "text-[#E6D7BD]"
                        }`}
                      >
                        {item.lineName}
                      </span>
                      {item.lineHanzi && (
                        <span className="text-[11px] font-serif font-bold text-[#FFE294] bg-[#22160C] px-1.5 py-0.5 rounded border border-[#3E2E1D]">
                          {item.lineHanzi}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isChanging && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40">
                          Hào Động
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full bg-[#1C140D] border border-[#42311D] text-[#D4AF37] font-mono text-[10px] font-bold">
                        Quẻ Khổng Minh #{String(item.oracleNum).padStart(3, "0")}
                      </span>
                    </div>
                  </div>

                  {/* Tuong Hào & Ý Hào kèm Chữ Hán & Dịch nghĩa */}
                  <div className="text-[11px] font-serif space-y-1.5 bg-[#0F0C08] p-2.5 rounded-lg border border-[#241A10]">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <strong className="text-[#D4AF37]">Tượng:</strong>
                        {item.tuongHaoHanzi && (
                          <span className="font-serif font-bold text-[#FFE294]">{item.tuongHaoHanzi}</span>
                        )}
                        <span className="text-[#C4B49C] italic">({item.tuongHao})</span>
                      </div>
                      {item.tuongHaoMeaning && (
                        <div className="text-[10px] text-[#A69780] pl-2 border-l border-[#D4AF37]/30 mt-0.5">
                          ➔ {item.tuongHaoMeaning}
                        </div>
                      )}
                    </div>

                    <div className="pt-1 border-t border-[#1C140D]">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <strong className="text-[#C89B3C]">Ý nghĩa:</strong>
                        {item.yHaoHanzi && (
                          <span className="font-serif font-bold text-[#FFE294]">{item.yHaoHanzi}</span>
                        )}
                        <span className="text-[#C4B49C] italic">({item.yHao})</span>
                      </div>
                      {item.yHaoMeaning && (
                        <div className="text-[10px] text-[#A69780] pl-2 border-l border-[#C89B3C]/30 mt-0.5">
                          ➔ {item.yHaoMeaning}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Khổng Minh Oracle Poem (Chữ Hán, Phiên Âm & Dịch Nghĩa) */}
                  <div className="bg-[#0A0806] p-3 rounded-lg border border-[#281D13] space-y-2 border-l-2 border-l-[#D4AF37]">
                    {/* Chữ Hán */}
                    {item.oracleHanzi && (
                      <div className="text-xs font-serif font-bold text-[#FFE294] tracking-wide leading-relaxed">
                        {item.oracleHanzi}
                      </div>
                    )}
                    {/* Phiên âm Hán-Việt */}
                    <div className="text-[11px] font-serif text-[#D4AF37] italic leading-relaxed">
                      "{item.oracleText}"
                    </div>
                    {/* Dịch nghĩa, Phân tích từng đoạn, Điển tích & Triết lý */}
                    <OraclePoemDetailView lineItem={item} />
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

/**
 * Trình duyệt Toàn Bộ 64 Quẻ & 384 Hào Khổng Minh Thần Quẻ (dùng trong Mục Lục Thuyết Minh)
 */
export const KhongMinhFullBrowser: React.FC<{
  onNavigateToHex?: (hexNum: number) => void;
}> = ({ onNavigateToHex }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPalace, setSelectedPalace] = useState<string>("all");
  const [expandedHexNum, setExpandedHexNum] = useState<number | null>(1);

  // Palaces list
  const palaces = [
    { id: "all", name: "Tất Cả 64 Quẻ (384 Hào)" },
    { id: "can", name: "Cung Càn (Quẻ 1–8 • Khổng Minh 001–048)" },
    { id: "doai", name: "Cung Đoài (Quẻ 9–16 • Khổng Minh 049–096)" },
    { id: "ly", name: "Cung Ly (Quẻ 17–24 • Khổng Minh 097–144)" },
    { id: "chan", name: "Cung Chấn (Quẻ 25–32 • Khổng Minh 145–192)" },
    { id: "ton", name: "Cung Tốn (Quẻ 33–40 • Khổng Minh 193–240)" },
    { id: "kham", name: "Cung Khảm (Quẻ 41–48 • Khổng Minh 241–288)" },
    { id: "can_mountain", name: "Cung Cấn (Quẻ 49–56 • Khổng Minh 289–336)" },
    { id: "khon", name: "Cung Khôn (Quẻ 57–64 • Khổng Minh 337–384)" },
  ];

  const getPalaceRange = (palaceId: string): [number, number] => {
    switch (palaceId) {
      case "can": return [1, 8];
      case "doai": return [9, 16];
      case "ly": return [17, 24];
      case "chan": return [25, 32];
      case "ton": return [33, 40];
      case "kham": return [41, 48];
      case "can_mountain": return [49, 56];
      case "khon": return [57, 64];
      default: return [1, 64];
    }
  };

  const filteredHexagrams = KHONG_MINH_HEXAGRAMS.filter((hex) => {
    // Palace filter
    if (selectedPalace !== "all") {
      const [start, end] = getPalaceRange(selectedPalace);
      if (hex.orderIndex < start || hex.orderIndex > end) return false;
    }

    // Search filter
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();

    // Check hex name or number
    if (
      hex.name.toLowerCase().includes(term) ||
      (hex.hanzi && hex.hanzi.toLowerCase().includes(term)) ||
      (hex.vietnameseName && hex.vietnameseName.toLowerCase().includes(term)) ||
      String(hex.kingWenNumber) === term ||
      String(hex.orderIndex) === term ||
      hex.tuongQue.toLowerCase().includes(term) ||
      (hex.tuongQueHanzi && hex.tuongQueHanzi.toLowerCase().includes(term)) ||
      (hex.tuongQueMeaning && hex.tuongQueMeaning.toLowerCase().includes(term)) ||
      hex.yQue.toLowerCase().includes(term) ||
      (hex.yQueHanzi && hex.yQueHanzi.toLowerCase().includes(term)) ||
      (hex.yQueMeaning && hex.yQueMeaning.toLowerCase().includes(term))
    ) {
      return true;
    }

    // Check lines, oracle numbers, texts, hanzi, meanings, segments, and allusions
    return hex.lines.some(
      (l) =>
        String(l.oracleNum) === term ||
        String(l.oracleNum).padStart(3, "0").includes(term) ||
        (l.lineHanzi && l.lineHanzi.toLowerCase().includes(term)) ||
        l.oracleText.toLowerCase().includes(term) ||
        (l.oracleHanzi && l.oracleHanzi.toLowerCase().includes(term)) ||
        (l.oracleMeaning && l.oracleMeaning.toLowerCase().includes(term)) ||
        (l.historicalAllusion && l.historicalAllusion.toLowerCase().includes(term)) ||
        (l.philosophicalMeaning && l.philosophicalMeaning.toLowerCase().includes(term)) ||
        (l.poemSegments && l.poemSegments.some(
          (s) =>
            s.hanzi.toLowerCase().includes(term) ||
            s.transcription.toLowerCase().includes(term) ||
            s.meaning.toLowerCase().includes(term) ||
            (s.analysis && s.analysis.toLowerCase().includes(term))
        )) ||
        l.tuongHao.toLowerCase().includes(term) ||
        (l.tuongHaoHanzi && l.tuongHaoHanzi.toLowerCase().includes(term)) ||
        (l.tuongHaoMeaning && l.tuongHaoMeaning.toLowerCase().includes(term)) ||
        l.yHao.toLowerCase().includes(term) ||
        (l.yHaoHanzi && l.yHaoHanzi.toLowerCase().includes(term)) ||
        (l.yHaoMeaning && l.yHaoMeaning.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Intro Box */}
      <div className="bg-gradient-to-br from-[#1C1610] via-[#16120D] to-[#0E0B08] p-5 sm:p-7 rounded-2xl border border-[#483723] space-y-4 shadow-xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2D2014] pb-3">
          <div className="flex items-center gap-2 text-xs font-serif font-bold text-[#D4AF37] uppercase tracking-wider">
            <Scroll className="w-4 h-4" />
            <span>Mối Liên Kết Vi Diệu: Chu Dịch 64 Quẻ & Khổng Minh Thần Toán 384 Quẻ</span>
          </div>
          <span className="text-[11px] font-mono text-[#D4AF37] bg-[#22170D] px-2.5 py-0.5 rounded-full border border-[#42311D]">
            64 Quẻ × 6 Hào = 384 Hào
          </span>
        </div>

        <h3 className="text-lg sm:text-2xl font-serif font-bold text-[#F5EAD4]">
          Liên Kết Kinh Dịch & Khổng Minh Thần Quẻ
        </h3>

        <div className="text-xs sm:text-sm font-serif leading-relaxed text-[#D8CEBA] space-y-2.5">
          <p>
            Trong lịch sử dịch học và thuật toán số Á Đông, <strong>Kinh Dịch 64 Quẻ</strong> và <strong>Khổng Minh Thần Quẻ (384 Quẻ)</strong> có mối tương liên cốt lõi: 64 quẻ Kinh Dịch, mỗi quẻ gồm 6 hào, tổng cộng đúng bằng <strong>384 hào</strong>.
          </p>
          <p>
            Mỗi hào trong 384 hào tương ứng với chính xác <strong>1 Quẻ Khổng Minh Thần Toán (từ Quẻ số 001 đến Quẻ số 384)</strong>. Không chỉ có bài thơ nguyên tác Chữ Hán cổ và phiên âm Hán-Việt, mỗi bài thơ còn được <em>phân tích chi tiết từng đoạn câu thơ</em>, giải thích sâu sắc theo <em>điển tích lịch sử, đạo giáo và triết học phương Đông</em>, giúp người học Dịch thấu triệt đạo lý nhân sinh và đạo xử thế của bậc trí giả.
          </p>
        </div>

        {/* Quick Highlights Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-center text-xs">
          <div className="bg-[#120E0A] p-2.5 rounded-xl border border-[#2D2115]">
            <span className="block text-[#D4AF37] font-mono font-bold text-sm">64 Quẻ</span>
            <span className="text-[10px] text-[#A69780]">Bát Cung Dịch Lý</span>
          </div>
          <div className="bg-[#120E0A] p-2.5 rounded-xl border border-[#2D2115]">
            <span className="block text-[#D4AF37] font-mono font-bold text-sm">384 Hào</span>
            <span className="text-[10px] text-[#A69780]">384 Thời Thế Nhân Sinh</span>
          </div>
          <div className="bg-[#120E0A] p-2.5 rounded-xl border border-[#2D2115]">
            <span className="block text-[#D4AF37] font-mono font-bold text-sm">Phân Tích Đoạn Thơ</span>
            <span className="text-[10px] text-[#A69780]">Từng Câu • Chữ Hán • Hàm Ý</span>
          </div>
          <div className="bg-[#120E0A] p-2.5 rounded-xl border border-[#2D2115]">
            <span className="block text-[#D4AF37] font-mono font-bold text-sm">Điển Tích & Triết Lý</span>
            <span className="text-[10px] text-[#A69780]">Đạo Gia • Nho Gia • Dịch Lý</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#18130E] p-4 rounded-2xl border border-[#382B1C] space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C7A65]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên quẻ, số quẻ (1-64), số Khổng Minh (1-384), câu thơ, điển tích hoặc triết lý..."
              className="w-full bg-[#100D09] border border-[#352718] focus:border-[#D4AF37] text-xs text-[#E8DCB8] rounded-xl pl-9 pr-3 py-2.5 outline-none placeholder-[#6E5E4C]"
            />
          </div>

          {/* Palace Dropdown */}
          <div className="w-full sm:w-72">
            <select
              value={selectedPalace}
              onChange={(e) => setSelectedPalace(e.target.value)}
              className="w-full bg-[#100D09] border border-[#352718] focus:border-[#D4AF37] text-xs text-[#E8DCB8] rounded-xl px-3 py-2.5 outline-none cursor-pointer"
            >
              {palaces.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#A69780]">
          <span>
            Đang hiển thị: <strong className="text-[#D4AF37]">{filteredHexagrams.length}</strong> / 64 quẻ
          </span>
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="text-[#D4AF37] hover:underline"
            >
              Xóa tìm kiếm
            </button>
          )}
        </div>
      </div>

      {/* Hexagram List */}
      <div className="space-y-4">
        {filteredHexagrams.map((hex) => {
          const isOpened = expandedHexNum === hex.orderIndex;
          return (
            <div
              key={hex.orderIndex}
              className="bg-[#16120D] border border-[#352819] rounded-2xl overflow-hidden transition-all shadow-md"
            >
              {/* Accordion Header */}
              <div
                onClick={() => setExpandedHexNum(isOpened ? null : hex.orderIndex)}
                className="p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-[#1E1710] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-8 h-8 rounded-xl bg-[#241A11] border border-[#3E2D1B] text-[#D4AF37] font-mono text-xs font-bold flex items-center justify-center shrink-0">
                    #{hex.orderIndex}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-serif font-bold text-sm sm:text-base text-[#F5EAD4] truncate">
                        {hex.name}
                      </h4>
                      {hex.hanzi && (
                        <span className="text-xs font-serif font-bold text-[#FFE294] bg-[#24180E] px-2 py-0.5 rounded border border-[#48341E]">
                          {hex.hanzi}
                        </span>
                      )}
                      <span className="text-[10px] text-[#C89B3C] font-mono bg-[#241A11] px-2 py-0.5 rounded border border-[#3A2A1A]">
                        Chu Dịch #{hex.kingWenNumber}
                      </span>
                      <span className="text-[10px] text-[#9E8E79] font-mono">
                        (Khổng Minh #{String(hex.lines[0]?.oracleNum || 0).padStart(3, "0")} – #
                        {String(hex.lines[5]?.oracleNum || 0).padStart(3, "0")})
                      </span>
                    </div>
                    <div className="text-[11px] text-[#A69780] font-serif truncate mt-0.5">
                      <span className="text-[#FFE294] font-medium">{hex.tuongQueHanzi}</span>{" "}
                      <em>({hex.tuongQue})</em> •{" "}
                      <span className="text-[#FFE294] font-medium">{hex.yQueHanzi}</span>{" "}
                      <em>({hex.yQue})</em>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {onNavigateToHex && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateToHex(hex.kingWenNumber);
                      }}
                      className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#251A10] hover:bg-[#D4AF37] text-[#D4AF37] hover:text-[#120F0C] text-[11px] font-serif font-bold transition-all border border-[#3E2D1B]"
                      title="Xem toàn văn Thuyết Minh quẻ này"
                    >
                      <span>Xem Quẻ #{hex.kingWenNumber}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                  <span className="text-[#D4AF37] p-1">
                    {isOpened ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </span>
                </div>
              </div>

              {/* Accordion Body */}
              {isOpened && (
                <div className="p-3.5 sm:p-5 pt-0 border-t border-[#261C12] space-y-3 bg-[#110D09]">
                  {/* Tượng Quẻ & Ý Quẻ Dịch Nghĩa */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-3 text-xs">
                    <div className="bg-[#18130D] p-2.5 rounded-xl border border-[#2D2115] space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <strong className="text-[#D4AF37] font-serif">Tượng Quẻ:</strong>
                        <span className="font-serif font-bold text-[#FFE294]">{hex.tuongQueHanzi}</span>
                        <span className="text-[#C4B49C] italic">({hex.tuongQue})</span>
                      </div>
                      {hex.tuongQueMeaning && (
                        <div className="text-[11px] text-[#D8CCA8] pl-2 border-l border-[#D4AF37]/40 leading-relaxed font-serif">
                          ➔ {hex.tuongQueMeaning}
                        </div>
                      )}
                    </div>

                    <div className="bg-[#18130D] p-2.5 rounded-xl border border-[#2D2115] space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <strong className="text-[#C89B3C] font-serif">Ý Quẻ:</strong>
                        <span className="font-serif font-bold text-[#FFE294]">{hex.yQueHanzi}</span>
                        <span className="text-[#C4B49C] italic">({hex.yQue})</span>
                      </div>
                      {hex.yQueMeaning && (
                        <div className="text-[11px] text-[#D8CCA8] pl-2 border-l border-[#C89B3C]/40 leading-relaxed font-serif">
                          ➔ {hex.yQueMeaning}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 6 Lines Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                    {hex.lines.map((line) => (
                      <div
                        key={line.line}
                        className="p-3 rounded-xl bg-[#17120D] border border-[#2D2115] hover:border-[#4B3925] space-y-2 transition-all text-xs"
                      >
                        <div className="flex items-center justify-between pb-1.5 border-b border-[#251A11]">
                          <div className="flex items-center gap-1.5">
                            <span className="font-serif font-bold text-[#EAD8B1]">
                              {line.lineName}
                            </span>
                            {line.lineHanzi && (
                              <span className="text-[10px] font-serif font-bold text-[#FFE294] bg-[#22160C] px-1 py-0.2 rounded border border-[#3E2D1B]">
                                {line.lineHanzi}
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-[10px] font-bold text-[#D4AF37] bg-[#22170D] px-1.5 py-0.5 rounded border border-[#3E2D1B]">
                            Quẻ #{String(line.oracleNum).padStart(3, "0")}
                          </span>
                        </div>

                        <div className="text-[11px] text-[#A69780] font-serif space-y-1">
                          <div>
                            <strong className="text-[#D4AF37]">Tượng:</strong>{" "}
                            {line.tuongHaoHanzi && (
                              <span className="font-serif font-bold text-[#FFE294]">{line.tuongHaoHanzi} </span>
                            )}
                            <em>({line.tuongHao})</em>
                            {line.tuongHaoMeaning && (
                              <div className="text-[10px] text-[#9E8E79] pl-1.5 border-l border-[#D4AF37]/30 mt-0.5">
                                ➔ {line.tuongHaoMeaning}
                              </div>
                            )}
                          </div>
                          <div>
                            <strong className="text-[#C89B3C]">Ý nghĩa:</strong>{" "}
                            {line.yHaoHanzi && (
                              <span className="font-serif font-bold text-[#FFE294]">{line.yHaoHanzi} </span>
                            )}
                            <em>({line.yHao})</em>
                            {line.yHaoMeaning && (
                              <div className="text-[10px] text-[#9E8E79] pl-1.5 border-l border-[#C89B3C]/30 mt-0.5">
                                ➔ {line.yHaoMeaning}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Oracle Poem */}
                        <div className="bg-[#0C0907] p-2.5 rounded-lg border border-[#22170E] space-y-1.5 text-[11px] font-serif border-l-2 border-l-[#D4AF37]">
                          {line.oracleHanzi && (
                            <div className="text-xs font-serif font-bold text-[#FFE294] tracking-wide">
                              {line.oracleHanzi}
                            </div>
                          )}
                          <div className="text-[#DCD0BB] italic leading-relaxed">
                            "{line.oracleText}"
                          </div>
                          {/* Dịch nghĩa & Lời giải */}
                          <OraclePoemDetailView lineItem={line} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
