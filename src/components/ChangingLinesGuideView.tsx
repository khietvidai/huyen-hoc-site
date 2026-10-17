import React, { useState } from "react";
import {
  Compass,
  Table as TableIcon,
  BookOpen,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ExternalLink,
  ArrowRight,
  Flame,
  CheckCircle2,
  HelpCircle,
  Layers,
} from "lucide-react";
import { Hexagram } from "../types";
import {
  CHU_HY_THAI_PHAT_RULES,
  getCurrentChangingLinesGuidance,
} from "../data/changingLinesRulesData";

interface ChangingLinesGuideViewProps {
  primaryHexagram: Hexagram;
  changingLines: number[];
  transformedHexagram?: Hexagram;
  onNavigateToManual?: (hexNumber?: number) => void;
  onSelectLine?: (line: number) => void;
  compactMode?: boolean;
}

export const ChangingLinesGuideView: React.FC<ChangingLinesGuideViewProps> = ({
  primaryHexagram,
  changingLines,
  transformedHexagram,
  onNavigateToManual,
  onSelectLine,
  compactMode = false,
}) => {
  const [activeTab, setActiveTab] = useState<"current" | "table" | "detail" | "philosophy">("current");
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const guidance = getCurrentChangingLinesGuidance(
    changingLines,
    primaryHexagram.number,
    transformedHexagram?.number
  );

  const count = changingLines.length;

  return (
    <div className="bg-gradient-to-b from-[#1C140E] to-[#120E0A] border-2 border-[#523A22] rounded-2xl p-4 sm:p-5 shadow-xl space-y-4 text-xs font-serif transition-all">
      {/* Top Header Bar */}
      <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap border-b border-[#3E2D1D] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-600 to-yellow-700 flex items-center justify-center text-black font-bold shadow-md">
            <Compass className="w-4 h-4 text-amber-100" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-serif font-bold text-sm sm:text-base text-[#F4ECD8] tracking-wide">
                HƯỚNG DẪN XEM HÀO ĐỘNG (CHU HY - THÁI PHÁT)
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                {count === 0
                  ? "Quẻ Tĩnh (0 hào động)"
                  : count === 6
                  ? "Lục Hào Đại Động (6 hào)"
                  : `${count} Hào Động`}
              </span>
            </div>
            <p className="text-[11px] text-[#A89882] mt-0.5">
              Quy tắc dịch học chính tông xác định trọng tâm luận giải giữa Quẻ Gốc, Quẻ Biến và Hào Từ
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {onNavigateToManual && (
            <button
              type="button"
              onClick={() => onNavigateToManual(primaryHexagram.number)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-serif font-semibold bg-[#2B1F14] hover:bg-[#C9A55A] text-[#E0CEB3] hover:text-black border border-[#4D361F] transition-all cursor-pointer shadow-sm"
              title="Mở Thuyết Minh chuyên sâu trong Cẩm Nang"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Xem Thuyết Minh</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-[#241A11] hover:bg-[#38281A] text-[#C5B39B] hover:text-white border border-[#423120] transition-colors cursor-pointer"
            title={isExpanded ? "Thu gọn hướng dẫn" : "Mở rộng hướng dẫn"}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-1.5 bg-[#140F0A] p-1 rounded-xl border border-[#3A2818] overflow-x-auto text-[11px] sm:text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("current")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-serif transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "current"
                  ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black shadow-md"
                  : "text-[#CBB99E] hover:text-white hover:bg-[#251A10]"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Chỉ Dẫn Quẻ Vừa Gieo</span>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse ml-0.5" />
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-serif transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "table"
                  ? "bg-[#C9A55A] text-black font-black shadow-md"
                  : "text-[#CBB99E] hover:text-white hover:bg-[#251A10]"
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Bảng Tổng Hợp Quy Tắc</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("detail")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-serif transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "detail"
                  ? "bg-[#C9A55A] text-black font-black shadow-md"
                  : "text-[#CBB99E] hover:text-white hover:bg-[#251A10]"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Chi Tiết 7 Trường Hợp (0-6 Hào)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("philosophy")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-serif transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "philosophy"
                  ? "bg-[#C9A55A] text-black font-black shadow-md"
                  : "text-[#CBB99E] hover:text-white hover:bg-[#251A10]"
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Đạo Lý "Dĩ Thiểu Vi Quý"</span>
            </button>
          </div>

          {/* TAB 1: CHỈ DẪN QUẺ VỪA GIEO (DYNAMIC FOR CURRENT RESULT) */}
          {activeTab === "current" && (
            <div className="space-y-3 animate-fadeIn">
              {/* Highlight Card for Current Hexagram */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-br from-[#2D1F12] via-[#24170E] to-[#1A120B] border-2 border-[#C9A55A]/80 shadow-lg space-y-2.5">
                <div className="flex items-center justify-between gap-2 flex-wrap border-b border-[#4D361F] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#FFD770]">
                      TRỌNG TÂM LUẬN ĐOÁN CHO QUẺ VỪA GIEO:
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-black/40 text-amber-300 border border-amber-500/30">
                    Trường hợp #{count} ({count} hào động)
                  </span>
                </div>

                <div className="text-sm font-serif font-black text-[#FFEEC4] leading-snug">
                  {guidance.headline}
                </div>

                <p className="text-xs font-serif text-[#F2E3CE] leading-relaxed bg-[#170E08]/70 p-3 rounded-lg border border-[#3E2816]">
                  {guidance.mainAction}
                </p>

                {/* Specific Line Recommendations */}
                {guidance.recommendedLines.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-mono text-[#C9A55A] uppercase tracking-wider block font-bold">
                      🎯 HÀO CẦN TẬP TRUNG NGHIÊN CỨU:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {guidance.recommendedLines.map((rec) => (
                        <div
                          key={`${rec.hexType}-${rec.line}`}
                          className="flex items-start justify-between gap-2 p-2.5 rounded-lg bg-[#20150D] border border-[#523A22] hover:border-[#C9A55A] transition-all"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 font-bold">
                              <span className="text-[#E6D3A3]">
                                {rec.line === 7 ? "✨ HÀO DỤNG ĐẶC BIỆT" : `Hào ${rec.line}`}
                              </span>
                              <span
                                className={`px-1.5 py-0.2 rounded text-[9px] font-mono uppercase ${
                                  rec.role === "chính"
                                    ? "bg-amber-500 text-black font-black"
                                    : rec.role === "trục chốt"
                                    ? "bg-rose-500 text-white font-bold"
                                    : rec.role === "đặc biệt"
                                    ? "bg-purple-600 text-purple-100 font-bold"
                                    : "bg-stone-700 text-stone-200"
                                }`}
                              >
                                {rec.role}
                              </span>
                              <span className="text-[10px] font-mono text-[#A89882]">
                                ({rec.hexType === "primary" ? "Quẻ Gốc" : "Quẻ Biến"})
                              </span>
                            </div>
                            <p className="text-[11px] text-[#DDD0BD] leading-tight">
                              {rec.note}
                            </p>
                          </div>

                          {onSelectLine && (
                            <button
                              type="button"
                              onClick={() => onSelectLine(rec.line)}
                              className="px-2 py-1 rounded bg-[#332214] hover:bg-[#C9A55A] hover:text-black text-[#E6D3A3] text-[10px] font-mono font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 border border-[#5C3E20]"
                              title={`Xem chi tiết Hào ${rec.line}`}
                            >
                              Xem Hào ➔
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Focus Judgement / Thoán Từ */}
                {guidance.focusJudgement && (
                  <div className="p-2.5 rounded-lg bg-[#1D140D] border border-[#442E1B] text-[11px] text-[#EDE0CD] space-y-1">
                    <span className="font-bold text-[#FFD770] flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-[#C9A55A]" />
                      <span>Ý chỉ Thoán Từ:</span>
                    </span>
                    <p>{guidance.focusJudgement.note}</p>
                  </div>
                )}

                {/* Quick note on Yin-Yang extremes */}
                <div className="flex items-center justify-between text-[11px] text-[#A68875] pt-1">
                  <span>
                    Nguyên tắc: Âm cực sinh Dương, Dương cực sinh Âm chuyển hóa thành Quẻ Biến.
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab("table")}
                    className="text-[#C9A55A] hover:underline flex items-center gap-1 cursor-pointer font-bold"
                  >
                    <span>Xem bảng quy tắc</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BẢNG TỔNG HỢP QUY TẮC CHU HY - THÁI PHÁT (IMAGE 2) */}
          {activeTab === "table" && (
            <div className="space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h4 className="text-xs sm:text-sm font-serif font-bold text-[#F3E5AB] flex items-center gap-1.5">
                  <span className="text-base">📊</span>
                  <span>BẢNG TỔNG HỢP QUY TẮC CHU HY - THÁI PHÁT</span>
                </h4>
                <span className="text-[10px] font-mono text-[#A89882]">
                  Chu Hi (Chu Dịch Bản Nghĩa) & Thái Phát (Thái Nguyên Định)
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-[#44301D] bg-[#140F0A] shadow-inner">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#241A12] border-b border-[#44301D] text-[#E0CEB3]">
                      <th className="py-2.5 px-3 sm:px-4 font-serif font-bold w-28 sm:w-36 text-amber-400">
                        Số hào động
                      </th>
                      <th className="py-2.5 px-3 sm:px-4 font-serif font-bold">
                        Cách chọn lời hào / lời quẻ để luận giải
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2B1D12]">
                    {CHU_HY_THAI_PHAT_RULES.map((rule) => {
                      const isCurrent = rule.count === count;
                      return (
                        <tr
                          key={rule.count}
                          className={`transition-colors ${
                            isCurrent
                              ? "bg-gradient-to-r from-[#3C2814] via-[#2F1F10] to-[#1F150B] font-semibold text-[#FFF]"
                              : "hover:bg-[#1A130C] text-[#DDD0BE]"
                          }`}
                        >
                          <td className="py-2.5 px-3 sm:px-4 font-mono font-bold align-top">
                            <div className="flex items-center gap-1.5">
                              {isCurrent && (
                                <span className="text-amber-400 text-xs animate-bounce">👉</span>
                              )}
                              <span className={isCurrent ? "text-amber-300 font-black" : "text-[#C9A55A]"}>
                                {rule.count} hào động
                              </span>
                            </div>
                            {isCurrent && (
                              <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-500 text-black font-black">
                                QUẺ HIỆN TẠI
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 sm:px-4 font-serif leading-relaxed">
                            {rule.count === 0 && (
                              <span>
                                Xem <strong>Thoán từ (lời kinh của quẻ gốc)</strong> làm chính; xem thêm Thoán truyện để hiểu bối cảnh.
                              </span>
                            )}
                            {rule.count === 1 && (
                              <span>
                                Xem duy nhất <strong>Hào từ của hào động</strong> đó ở quẻ gốc.
                              </span>
                            )}
                            {rule.count === 2 && (
                              <span>
                                Xem <strong>Hào từ của cả 2 hào động</strong> ở quẻ gốc; lấy hào <strong>trên</strong> làm chính, hào <strong>dưới</strong> làm phụ.
                              </span>
                            )}
                            {rule.count === 3 && (
                              <span>
                                Xem <strong>Thoán từ của cả Quẻ gốc và Quẻ biến</strong>; lấy Quẻ gốc làm quá khứ/hiện tại, Quẻ biến làm tương lai.
                              </span>
                            )}
                            {rule.count === 4 && (
                              <span>
                                Xem <strong>Hào từ của 2 hào KHÔNG động</strong> ở quẻ biến; lấy hào <strong>dưới</strong> làm chính, hào <strong>trên</strong> làm phụ.
                              </span>
                            )}
                            {rule.count === 5 && (
                              <span>
                                Xem duy nhất <strong>Hào từ của 1 hào KHÔNG động</strong> ở quẻ biến.
                              </span>
                            )}
                            {rule.count === 6 && (
                              <span>
                                Xem <strong>Thoán từ của Quẻ biến</strong>.{" "}
                                <em className="text-amber-300">
                                  (Ngoại lệ: Nếu là quẻ Càn/Khôn thì xem lời hào Dụng Cửu / Dụng Lục).
                                </em>
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: HƯỚNG DẪN CHI TIẾT TỪNG TRƯỜNG HỢP (IMAGE 1) */}
          {activeTab === "detail" && (
            <div className="space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h4 className="text-xs sm:text-sm font-serif font-bold text-[#F3E5AB] flex items-center gap-1.5">
                  <span className="text-base">📑</span>
                  <span>HƯỚNG DẪN CHI TIẾT TỪNG TRƯỜNG HỢP (0 ĐẾN 6 HÀO)</span>
                </h4>
                <span className="text-[10px] font-mono text-[#A89882]">
                  Cẩm nang chiêm bặc Lục Hào
                </span>
              </div>

              <div className="space-y-2.5">
                {CHU_HY_THAI_PHAT_RULES.map((rule, idx) => {
                  const isCurrent = rule.count === count;
                  return (
                    <div
                      key={rule.count}
                      className={`p-3 sm:p-4 rounded-xl border transition-all text-xs font-serif space-y-2 ${
                        isCurrent
                          ? "bg-gradient-to-r from-[#2B1B10] to-[#1C120B] border-[#C9A55A] ring-1 ring-[#C9A55A]/50 shadow-md"
                          : "bg-[#16110B] border-[#3E2D1D] hover:border-[#574029]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-[#2C1F14] pb-1.5 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                              isCurrent
                                ? "bg-amber-400 text-black shadow"
                                : "bg-[#2A1E14] text-[#C9A55A] border border-[#483321]"
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <h5 className="font-serif font-bold text-[#F5ECD8] text-xs sm:text-sm">
                            {rule.name}
                          </h5>
                        </div>

                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase bg-amber-400 text-black shadow-sm">
                            Đang Áp Dụng Cho Quẻ Này
                          </span>
                        )}
                      </div>

                      {/* Hiện tượng */}
                      <div className="space-y-0.5 text-[#DDD0BE]">
                        <span className="text-[10px] font-mono uppercase font-bold text-[#C9A55A] block">
                          • HIỆN TƯỢNG:
                        </span>
                        <p className="leading-relaxed pl-2.5 border-l-2 border-[#4A321E]">
                          {rule.phenomenon}
                        </p>
                      </div>

                      {/* Cách đọc */}
                      <div className="space-y-0.5 text-[#F2E5D0]">
                        <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 block">
                          • CÁCH ĐỌC:
                        </span>
                        <p className="leading-relaxed pl-2.5 border-l-2 border-emerald-600/40 whitespace-pre-line">
                          {rule.readingInstruction}
                        </p>
                      </div>

                      {/* Đạo lý cốt lõi */}
                      <div className="text-[11px] text-[#A68F7A] bg-[#120C07] p-2 rounded-lg border border-[#2B1B10]">
                        <strong className="text-[#CBB99E]">Triết lý dịch cơ:</strong> {rule.principle}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: ĐẠO LÝ DỊCH HỌC "DĨ THIỂU VI QUÝ" */}
          {activeTab === "philosophy" && (
            <div className="space-y-3 animate-fadeIn text-xs font-serif leading-relaxed text-[#DDD0BE]">
              <div className="p-4 rounded-xl bg-[#17110B] border border-[#3E2D1D] space-y-3">
                <div className="flex items-center gap-2 text-[#F4ECD8] font-bold text-sm border-b border-[#2C1F14] pb-2">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>CƠ CHẾ TRIẾT LÝ: VÌ SAO CHU HY & THÁI PHÁT ĐẶT RA QUY TẮC NÀY?</span>
                </div>

                <p>
                  Trong tác phẩm kinh điển <em>"Chu Dịch Bản Nghĩa"</em>, hai bậc đại Nho thời Tống là <strong>Chu Hi</strong> và <strong>Thái Nguyên Định (Thái Phát)</strong> đã dày công khảo chứng các trường hợp bói Dịch ghi trong Tả Truyện và Quốc Ngữ để đúc kết nên hệ thống 7 quy tắc mẫu mực này.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-lg bg-[#22170E] border border-[#442E1A] space-y-1.5">
                    <span className="text-[#E6D3A3] font-bold block text-xs">
                      1. Nguyên lý "Dĩ thiểu vi quý" (Lấy số ít làm quý):
                    </span>
                    <p className="text-[11px] text-[#CBB99E]">
                      Khi trong quẻ chỉ có 1 hoặc 2 hào động, hào động là thiểu số giữa đa số hào tĩnh, nên hào động nắm quyền chủ vận. Nhưng khi có tới 4 hoặc 5 hào động, lúc này sự biến động đã tràn ngập; 1 hoặc 2 hào tĩnh còn lại lại trở thành <strong>thiểu số quý giá</strong>, đóng vai trò điểm tựa và trục chốt ("Độc tĩnh vi tông") giữ cho cục diện không vỡ nát.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-[#22170E] border border-[#442E1A] space-y-1.5">
                    <span className="text-[#E6D3A3] font-bold block text-xs">
                      2. Sự dịch chuyển năng lượng từ Quẻ Gốc sang Quẻ Biến:
                    </span>
                    <p className="text-[11px] text-[#CBB99E]">
                      Từ 0-2 hào động, trọng tâm vẫn nằm ở Quẻ Gốc (thế cuộc hiện tại). Đến 3 hào động (tỷ lệ 50/50), năng lượng chuyển sang thế giao thời giữa Gốc và Biến. Từ 4 hào động trở lên, trọng tâm đã dịch chuyển hoàn toàn sang Quẻ Biến (thế cuộc mới đã thành hình).
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#1F150C] border border-[#4D361F] text-[11px] text-[#EDE0CC]">
                  <strong className="text-amber-400">✨ Ngoại lệ độc nhất vô nhị của Quẻ Càn và Quẻ Khôn:</strong>
                  <p className="mt-1">
                    Càn là thuần Dương, Khôn là thuần Âm. Khi cả 6 hào cùng động, toàn thể vũ trụ dịch vị. Càn biến thành Khôn không dùng Thoán từ Khôn mà dùng hào thứ 7 <strong>Dụng Cửu</strong> (Kiến quần long vô thủ, cát). Khôn biến thành Càn không dùng Thoán từ Càn mà dùng hào thứ 7 <strong>Dụng Lục</strong> (Lợi vĩnh trinh). Đây là cảnh giới viên mãn tuyệt đối của Đạo Dịch!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
