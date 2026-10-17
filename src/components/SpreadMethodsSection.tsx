import React, { useState } from "react";
import {
  Sparkles,
  Eye,
  ArrowRight,
  HelpCircle,
  Compass,
  Lightbulb,
  CheckCircle2,
  Layers,
  Scroll,
} from "lucide-react";
import { HEXAGRAMS } from "../data/hexagrams";
import {
  SPREAD_METHODS_SUMMARY,
  SPREAD_EXAMPLES,
} from "../data/manualSpreadExamples";
import { CardVisual } from "./CardVisual";

interface SpreadMethodsSectionProps {
  cardImages?: Record<number, string>;
  cardVideos?: Record<number, string>;
  onSelectHexagram?: (hexNumber: number) => void;
  onNavigateToLookup?: (hexNumber: number) => void;
}

type FilterType = "all" | "1_card" | "2_card" | "3_card";

export const SpreadMethodsSection: React.FC<SpreadMethodsSectionProps> = ({
  cardImages = {},
  cardVideos = {},
  onSelectHexagram,
  onNavigateToLookup,
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const filteredExamples = SPREAD_EXAMPLES.filter((ex) => {
    if (activeFilter === "all") return true;
    return ex.spreadType === activeFilter;
  });

  const handleInspectHex = (hexNum: number) => {
    if (onNavigateToLookup) {
      onNavigateToLookup(hexNum);
    } else if (onSelectHexagram) {
      onSelectHexagram(hexNum);
    }
  };

  return (
    <div className="space-y-8 text-xs sm:text-sm font-serif text-[#E2D6C2]">
      {/* 1. TỔNG QUAN 3 PHƯƠNG PHÁP TRẢI BÀI */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#332617] pb-2.5">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#C9A55A]" />
            <h3 className="text-sm sm:text-base font-serif font-bold text-[#F5EAD4] tracking-wide uppercase">
              Quy Chuẩn 3 Phương Pháp Trải Bài Tarot Kinh Dịch
            </h3>
          </div>
          <span className="text-[11px] font-mono text-[#A89882]">3 Cấu Trúc Trải</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {SPREAD_METHODS_SUMMARY.map((m) => {
            const isFilterActive = activeFilter === m.type;
            return (
              <div
                key={m.type}
                onClick={() => setActiveFilter(activeFilter === m.type ? "all" : (m.type as FilterType))}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isFilterActive
                    ? "bg-[#251C13] border-[#C9A55A] shadow-[0_0_15px_rgba(212,175,55,0.25)] ring-1 ring-[#C9A55A]/50"
                    : "bg-[#16120E] border-[#2C2115] hover:border-[#523E26] hover:bg-[#1C1611]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#261E14] text-[#E0B861] border border-[#483723]">
                      {m.type === "1_card" ? "1 Lá" : m.type === "2_card" ? "2 Lá" : "3 Lá"}
                    </span>
                    <span className="text-[10px] text-[#A69780] font-sans">Nhấn để lọc ví dụ</span>
                  </div>

                  <h4 className="text-sm font-bold text-[#F4E8D0] mb-0.5">{m.name}</h4>
                  <p className="text-[11px] text-[#C9A55A] font-sans font-semibold mb-2">{m.subName}</p>
                  <p className="text-xs text-[#A89882] leading-relaxed mb-3">{m.desc}</p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-[#2A2015] text-[11px] text-[#C9BAA2]">
                  {m.steps.map((st, sIdx) => (
                    <div key={sIdx} className="flex items-start gap-1.5">
                      <span className="text-[#C9A55A] font-mono font-bold shrink-0">{sIdx + 1}.</span>
                      <span className="leading-snug">{st}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. THANH LỌC DANH SÁCH 5 VÍ DỤ THỰC TẾ */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#332617] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Scroll className="w-4 h-4 text-[#C9A55A]" />
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#F5EAD4]">
                5 Ví Dụ Thực Tế Minh Họa & Hình Bài Trực Quan
              </h3>
            </div>
            <p className="text-xs text-[#A89882] mt-0.5 italic">
              Chứng khoán, nhà hàng ẩm thực, chuyển nguy thành an 3 tháng, chọn việc và kinh tế vĩ mô
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1.5 bg-[#14100C] p-1 rounded-xl border border-[#2D2216] shrink-0">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-serif font-semibold transition-all cursor-pointer ${
                activeFilter === "all"
                  ? "bg-[#C9A55A] text-[#120F0C] shadow font-bold"
                  : "text-[#A89882] hover:text-[#FFF]"
              }`}
            >
              Tất cả (5 ví dụ)
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("1_card")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-serif font-semibold transition-all cursor-pointer ${
                activeFilter === "1_card"
                  ? "bg-[#C9A55A] text-[#120F0C] shadow font-bold"
                  : "text-[#A89882] hover:text-[#FFF]"
              }`}
            >
              Trải 1 Lá (A, B)
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("2_card")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-serif font-semibold transition-all cursor-pointer ${
                activeFilter === "2_card"
                  ? "bg-[#C9A55A] text-[#120F0C] shadow font-bold"
                  : "text-[#A89882] hover:text-[#FFF]"
              }`}
            >
              Trải 2 Lá (C, D)
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("3_card")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-serif font-semibold transition-all cursor-pointer ${
                activeFilter === "3_card"
                  ? "bg-[#C9A55A] text-[#120F0C] shadow font-bold"
                  : "text-[#A89882] hover:text-[#FFF]"
              }`}
            >
              Trải 3 Lá (E)
            </button>
          </div>
        </div>

        {/* 3. DANH SÁCH CÁC VÍ DỤ TRÌNH BÀY DỄ HIỂU KÈM HÌNH LÁ BÀI */}
        <div className="space-y-7">
          {filteredExamples.map((example) => {
            return (
              <div
                key={example.id}
                id={example.id}
                className="bg-gradient-to-b from-[#1C1610] via-[#16120D] to-[#120F0C] border-2 border-[#3E301F] hover:border-[#634E32] rounded-3xl p-4 sm:p-6 shadow-xl relative overflow-hidden transition-all space-y-5"
              >
                {/* Header of Example Card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[#2C2115] pb-3.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-[#C9A55A] text-[#14110C] shadow-sm tracking-wider">
                      {example.code}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-mono bg-[#281F15] text-[#D8C7AA] border border-[#443423]">
                      {example.spreadTypeName}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-serif border ${example.categoryColor}`}>
                      {example.category}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-[#8C7A64] hidden sm:inline-block">
                    {example.cards.length} Lá Bài Liên Quan
                  </span>
                </div>

                <h4 className="text-base sm:text-xl font-bold text-[#F7EEDC] tracking-wide">
                  {example.title}
                </h4>

                {/* VISUAL SHOWCASE: HÌNH LÁ BÀI LIÊN QUAN TRONG VÍ DỤ */}
                <div className="bg-[#0E0C09] border border-[#2B2014] rounded-2xl p-4 sm:p-5 shadow-inner">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#221A11]">
                    <span className="text-xs font-serif font-bold text-[#C9A55A] flex items-center gap-1.5 uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5" /> Hình Quẻ Bài Đã Rút Trong Ví Dụ Này
                    </span>
                    <span className="text-[11px] text-[#A69780] font-sans">
                      Nhấn vào quẻ để xem cẩm nang luận giải chi tiết
                    </span>
                  </div>

                  {/* Responsive Flex / Grid layout for cards */}
                  <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-7">
                    {example.cards.map((c, cIdx) => {
                      const hex = HEXAGRAMS.find((h) => h.number === c.hexNumber) || HEXAGRAMS[0];
                      const img = cardImages[c.hexNumber] || null;
                      const vid = cardVideos[c.hexNumber] || null;

                      return (
                        <React.Fragment key={c.hexNumber}>
                          {/* Card Item Wrapper */}
                          <div className="flex flex-col items-center max-w-[210px] w-full text-center group">
                            {/* Role / Position Tag */}
                            <div className="mb-2 px-2.5 py-0.5 rounded-full text-[11px] font-serif font-semibold bg-[#241B12] text-[#E5C378] border border-[#483723] shadow-xs">
                              {c.label}
                            </div>

                            {/* Card Visual with 3D and Hover */}
                            <div
                              onClick={() => handleInspectHex(c.hexNumber)}
                              className="cursor-pointer transition-transform duration-300 group-hover:scale-105 group-hover:drop-shadow-[0_0_20px_rgba(212,175,55,0.35)]"
                              title={`Xem chi tiết Quẻ ${c.hexNumber}: ${hex.name}`}
                            >
                              <CardVisual
                                hexagram={hex}
                                imageUrl={img}
                                videoUrl={vid}
                                size="sm"
                                fitMode="cover"
                                enableParallax={true}
                                className="shadow-2xl border border-[#C9A55A]/30 rounded-xl"
                              />
                            </div>

                            {/* Hexagram Name & Trigram summary */}
                            <div className="mt-2.5 space-y-0.5 w-full">
                              <div className="flex items-center justify-center gap-1.5">
                                <span className="font-mono text-xs font-bold text-[#C9A55A]">
                                  #{hex.number}
                                </span>
                                <h5 className="font-serif font-bold text-xs sm:text-sm text-[#F4E8D0] truncate">
                                  {hex.name}
                                </h5>
                                <span className="text-[11px] text-[#C89B3C] font-mono">
                                  ({hex.hanzi})
                                </span>
                              </div>

                              <p className="text-[10px] text-[#A69780] font-serif">
                                Thượng: <strong className="text-[#D8C7AA]">{hex.upperTrigram}</strong> • Hạ: <strong className="text-[#D8C7AA]">{hex.lowerTrigram}</strong>
                              </p>

                              <p className="text-[11px] text-[#E0B861] font-serif italic line-clamp-2 px-1 pt-0.5">
                                “{c.keyMeaning}”
                              </p>

                              <button
                                type="button"
                                onClick={() => handleInspectHex(c.hexNumber)}
                                className="mt-2 text-[10px] font-sans font-semibold text-[#C9A55A] hover:text-[#FFF] hover:underline inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3 h-3" /> Xem cẩm nang quẻ này
                              </button>
                            </div>
                          </div>

                          {/* Arrow Connector between cards if 2 or 3 cards */}
                          {cIdx < example.cards.length - 1 && (
                            <div className="hidden sm:flex flex-col items-center justify-center text-[#C9A55A]/60 px-1">
                              {example.id === "example_d" ? (
                                <div className="flex flex-col items-center gap-1">
                                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#2A2016] text-[#E0B861] border border-[#483723]">
                                    VS
                                  </span>
                                  <span className="text-[9px] text-[#8C7A64] font-sans">Đối Chiếu</span>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center gap-1">
                                  <ArrowRight className="w-5 h-5 text-[#C9A55A]" />
                                  <span className="text-[9px] font-mono text-[#A89882]">Chuyển hóa</span>
                                </div>
                              )}
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>

                {/* 4 CLEAR STRUCTURED CONTENT PANELS: EASY TO READ & SCANNABLE */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {/* Panel 1: Tình Huống / Bối Cảnh Thực Tế */}
                  <div className="bg-[#15110D] border border-[#2B2014] rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider font-sans border-b border-[#251A10] pb-1.5">
                      <HelpCircle className="w-4 h-4 text-amber-400" />
                      <span>1. Tình Huống & Vấn Đề Cần Hỏi</span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#D6C7AE] leading-relaxed">
                      {example.context}
                    </p>
                  </div>

                  {/* Panel 2: Phân Tích Ý Tượng Quẻ */}
                  <div className="bg-[#15110D] border border-[#2B2014] rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-[#C9A55A] text-xs font-bold uppercase tracking-wider font-sans border-b border-[#251A10] pb-1.5">
                      <Compass className="w-4 h-4 text-[#C9A55A]" />
                      <span>2. Phân Tích Ý Tượng Dịch Học</span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#D6C7AE] leading-relaxed whitespace-pre-line">
                      {example.analysis}
                    </p>
                  </div>

                  {/* Panel 3: Diễn Biến & Ứng Nghiệm Thực Tế */}
                  <div className="bg-[#15110D] border border-[#2B2014] rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider font-sans border-b border-[#251A10] pb-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>3. Diễn Biến & Ứng Nghiệm Thực Tế</span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#D6C7AE] leading-relaxed">
                      {example.outcome}
                    </p>
                  </div>

                  {/* Panel 4: Bài Học Dịch Lý Ứng Dụng */}
                  <div className="bg-[#15110D] border border-[#3A2D1A] rounded-2xl p-4 space-y-2 bg-gradient-to-br from-[#1C160F] to-[#14100C]">
                    <div className="flex items-center gap-2 text-[#F0C969] text-xs font-bold uppercase tracking-wider font-sans border-b border-[#2B2014] pb-1.5">
                      <Lightbulb className="w-4 h-4 text-[#F0C969]" />
                      <span>4. Bài Học Dịch Lý & Sách Lược Ứng Dụng</span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#E6D7BE] leading-relaxed italic">
                      “{example.takeaway}”
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
