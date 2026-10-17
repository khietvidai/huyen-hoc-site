import React, { useState } from "react";
import {
  Compass,
  Table as TableIcon,
  Layers,
  Sparkles,
  ArrowRight,
  BookOpen,
  Flame,
  CheckCircle2,
  HelpCircle,
  Eye,
  Info,
} from "lucide-react";
import { CHU_HY_THAI_PHAT_RULES } from "../data/changingLinesRulesData";

interface ChapterChangingLinesRulesProps {
  onNavigateToSection?: (sectionId: string) => void;
  onNavigateToHex?: (hexNumber: number) => void;
}

export const ChapterChangingLinesRules: React.FC<ChapterChangingLinesRulesProps> = ({
  onNavigateToSection,
  onNavigateToHex,
}) => {
  const [selectedCaseCount, setSelectedCaseCount] = useState<number>(1);
  const selectedRule =
    CHU_HY_THAI_PHAT_RULES.find((r) => r.count === selectedCaseCount) ||
    CHU_HY_THAI_PHAT_RULES[1];

  return (
    <div className="space-y-6 text-xs sm:text-sm font-serif text-[#DDD0BE]">
      {/* Hero Header */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#24170E] via-[#2F1F13] to-[#1A120B] border-2 border-[#523A22] shadow-xl space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-black font-black text-lg shadow-md">
            <Compass className="w-5 h-5 text-black" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-[#C9A55A] uppercase tracking-wider block font-bold">
              CHU DỊCH BẢN NGHĨA • KHẢO CHỨNG DỊCH HỌC
            </span>
            <h2 className="text-base sm:text-xl font-serif font-black text-[#FFE2A4]">
              QUY TẮC XEM HÀO ĐỘNG (CHU HY - THÁI PHÁT)
            </h2>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#F0E2CE] leading-relaxed">
          Khi chiêm bặc Lục Hào, mấu chốt quyết định sự chuẩn xác nằm ở việc xác định:{" "}
          <strong className="text-[#FFD770]">khi nào xem Thoán từ Quẻ gốc, khi nào xem Hào từ của hào động, khi nào xem Quẻ biến, và khi nào xem các hào không động?</strong>{" "}
          Hai bậc đại Nho thời Tống là <strong>Chu Hi (Chu Hy)</strong> và <strong>Thái Nguyên Định (Thái Phát)</strong> đã khảo cứu toàn bộ các điển bói cổ thư trong Tả Truyện và Quốc Ngữ để đúc kết thành <strong>hệ thống 7 quy tắc chuẩn mực</strong> dưới đây.
        </p>
      </div>

      {/* Interactive Case Simulator */}
      <div className="bg-[#17110C] border border-[#3E2D1D] rounded-2xl p-4 sm:p-5 space-y-4 shadow-lg">
        <div className="flex items-center justify-between border-b border-[#2C1F14] pb-2.5 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C9A55A]" />
            <h3 className="font-serif font-bold text-xs sm:text-sm text-[#F4ECD8] uppercase tracking-wide">
              Mô Phỏng Trực Quan Từng Trường Hợp (Chọn số hào động):
            </h3>
          </div>
          <span className="text-[11px] font-mono text-[#A89882]">
            Bấm chọn để xem giải nghĩa ngay
          </span>
        </div>

        {/* Buttons for 0 to 6 changing lines */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1.5 sm:gap-2">
          {CHU_HY_THAI_PHAT_RULES.map((rule) => {
            const isSelected = rule.count === selectedCaseCount;
            return (
              <button
                key={rule.count}
                type="button"
                onClick={() => setSelectedCaseCount(rule.count)}
                className={`py-2 px-2 rounded-xl text-center font-serif transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-gradient-to-b from-amber-500 to-yellow-500 text-black font-black border-amber-300 shadow-md ring-1 ring-amber-300 scale-[1.02]"
                    : "bg-[#20150D] text-[#CBB99E] border-[#3E2B1A] hover:bg-[#2C1E13] hover:text-white"
                }`}
              >
                <div className="font-mono text-xs sm:text-sm font-bold">
                  {rule.count} Hào Động
                </div>
                <div className="text-[10px] opacity-80 truncate">
                  {rule.count === 0 ? "Quẻ Tĩnh" : rule.count === 6 ? "Đại Động" : `Trường hợp ${rule.count}`}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Case Detail Card */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-[#24170E] to-[#150F0A] border border-[#523A22] space-y-3">
          <div className="flex items-center justify-between border-b border-[#3E2A18] pb-2 flex-wrap gap-2">
            <h4 className="font-serif font-bold text-sm sm:text-base text-[#E6D3A3] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>{selectedRule.name}</span>
            </h4>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#110B07] text-[#C9A55A] border border-[#442E18] font-bold">
              Quy tắc #{selectedRule.count}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-mono font-bold text-[#C9A55A] uppercase block">
              • HIỆN TƯỢNG XUẤT HIỆN:
            </span>
            <p className="text-xs sm:text-sm text-[#DDD0BE] leading-relaxed pl-3 border-l-2 border-[#4D351F]">
              {selectedRule.phenomenon}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase block">
              • CÁCH CHỌN LỜI HÀO / LỜI QUẺ ĐỂ LUẬN GIẢI:
            </span>
            <div className="text-xs sm:text-sm text-[#F7ECDA] leading-relaxed pl-3 border-l-2 border-emerald-500/50 bg-[#160E08]/60 p-2.5 rounded-r-lg whitespace-pre-line font-medium">
              {selectedRule.readingInstruction}
            </div>
          </div>

          <div className="text-[11px] sm:text-xs text-[#A89882] bg-[#110B07] p-2.5 rounded-lg border border-[#2B1D12]">
            <strong className="text-[#CBB99E]">Ý nghĩa triết học dịch cơ:</strong> {selectedRule.principle}
          </div>
        </div>
      </div>

      {/* Image 2: Bảng Tổng Hợp Quy Tắc Chu Hy - Thái Phát */}
      <div className="bg-[#140F0A] border border-[#3E2D1D] rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-lg">
        <div className="flex items-center justify-between border-b border-[#2C1F14] pb-2 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">📊</span>
            <h3 className="font-serif font-bold text-xs sm:text-sm text-[#F4ECD8] uppercase tracking-wide">
              BẢNG TỔNG HỢP QUY TẮC CHU HY - THÁI PHÁT
            </h3>
          </div>
          <span className="text-[11px] font-mono text-[#A89882]">
            Chu Hi (Chu Dịch Bản Nghĩa) & Thái Nguyên Định (Thái Phát)
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#44301D] bg-[#100C08]">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#241A12] border-b border-[#44301D] text-[#E0CEB3]">
                <th className="py-3 px-3 sm:px-4 font-serif font-bold w-28 sm:w-36 text-amber-400">
                  Số hào động
                </th>
                <th className="py-3 px-3 sm:px-4 font-serif font-bold">
                  Cách chọn lời hào / lời quẻ để luận giải
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2B1D12]">
              {CHU_HY_THAI_PHAT_RULES.map((rule) => {
                const isSelected = rule.count === selectedCaseCount;
                return (
                  <tr
                    key={rule.count}
                    onClick={() => setSelectedCaseCount(rule.count)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-[#2E1F11] font-semibold text-[#FFF]"
                        : "hover:bg-[#1A130C] text-[#DDD0BE]"
                    }`}
                  >
                    <td className="py-3 px-3 sm:px-4 font-mono font-bold align-top">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#C9A55A]">{rule.count} hào động</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 sm:px-4 font-serif leading-relaxed">
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

      {/* Image 1: Hướng Dẫn Chi Tiết Toàn Bộ 7 Trường Hợp */}
      <div className="bg-[#140F0A] border border-[#3E2D1D] rounded-2xl p-4 sm:p-5 space-y-4 shadow-lg">
        <div className="flex items-center justify-between border-b border-[#2C1F14] pb-2 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">📑</span>
            <h3 className="font-serif font-bold text-xs sm:text-sm text-[#F4ECD8] uppercase tracking-wide">
              HƯỚNG DẪN CHI TIẾT TỪNG TRƯỜNG HỢP
            </h3>
          </div>
          <span className="text-[11px] font-mono text-[#A89882]">
            Toàn văn hướng dẫn chiêm đoán
          </span>
        </div>

        <div className="space-y-3">
          {CHU_HY_THAI_PHAT_RULES.map((rule, idx) => (
            <div
              key={rule.count}
              className="p-3.5 sm:p-4 rounded-xl bg-[#18120B] border border-[#342416] hover:border-[#4E3722] space-y-2 transition-all"
            >
              <div className="flex items-center justify-between gap-2 border-b border-[#261B0F] pb-1.5 flex-wrap">
                <h4 className="font-serif font-bold text-xs sm:text-sm text-[#F5ECD8] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#2A1E14] text-[#C9A55A] border border-[#483321] flex items-center justify-center font-mono text-xs font-bold">
                    {idx + 1}
                  </span>
                  <span>{rule.name}</span>
                </h4>
              </div>

              <div className="space-y-0.5 text-xs text-[#DDD0BE]">
                <span className="text-[10px] font-mono uppercase font-bold text-[#C9A55A] block">
                  • Hiện tượng:
                </span>
                <p className="leading-relaxed pl-2.5 border-l-2 border-[#4A321E]">
                  {rule.phenomenon}
                </p>
              </div>

              <div className="space-y-0.5 text-xs text-[#F2E5D0]">
                <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 block">
                  • Cách đọc:
                </span>
                <p className="leading-relaxed pl-2.5 border-l-2 border-emerald-600/40 whitespace-pre-line">
                  {rule.readingInstruction}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Philosophical Foundations */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#1C140E] to-[#120E0A] border border-[#422F1D] space-y-3 shadow-md">
        <div className="flex items-center gap-2 text-[#FFE394] font-bold text-xs sm:text-sm border-b border-[#2C1F14] pb-2">
          <Flame className="w-4 h-4 text-amber-500" />
          <span>TRIẾT LÝ SÂU XA: NGUYÊN LÝ "DĨ THIỂU VI QUÝ" VÀ "ĐỘC TĨNH VI TÔNG"</span>
        </div>

        <p className="text-xs sm:text-sm leading-relaxed text-[#DDD0BE]">
          Người học Kinh Dịch thường băn khoăn: <em>Tại sao khi có 4 hoặc 5 hào động, ta không đọc hào động mà lại quay về đọc các hào tĩnh ở Quẻ Biến?</em>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-[#22170E] border border-[#3E2A18] space-y-1">
            <span className="text-[#FFD770] font-bold block">
              1. Thế năng "Dĩ thiểu vi quý" (Lấy số ít làm quý):
            </span>
            <p className="text-[#CBB99E] leading-relaxed">
              Khi 1-2 hào động, hào động là thiểu số giữa đa số hào tĩnh, do đó hào động làm chủ tể dẫn dắt vận thế. Ngược lại, khi có 4-5 hào động, biến động đã thành thế đa số, quẻ biến đã thành hình; lúc này 1 hoặc 2 hào tĩnh còn lại trở thành thiểu số quý giá, giữ vai trò điểm tựa cân bằng then chốt.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-[#22170E] border border-[#3E2A18] space-y-1">
            <span className="text-[#FFD770] font-bold block">
              2. Độc tĩnh vi tông (Một điểm tĩnh định hình kết quả):
            </span>
            <p className="text-[#CBB99E] leading-relaxed">
              Trường hợp 5 hào động, sự việc gần như đảo lộn hoàn toàn. Hào tĩnh duy nhất ở Quẻ Biến ví như chiếc mỏ neo vững chắc giữa phong ba bão táp, quyết định sự thành bại và phương hướng sau cùng mà sự việc sẽ hội tụ về.
            </p>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#140D07] border border-[#523A20] text-xs text-[#EAD8B1] space-y-1">
          <strong className="text-amber-400">✨ Cảnh giới Dụng Cửu & Dụng Lục của Quẻ Càn và Khôn:</strong>
          <p className="leading-relaxed">
            Thuần Càn là khởi nguyên của Dương, Thuần Khôn là khởi nguyên của Âm. Khi cả 6 hào cùng động, toàn thể vũ trụ dịch chuyển. Càn động cả 6 hào hóa Khôn không dùng Thoán từ Khôn mà có riêng hào <strong>Dụng Cửu</strong> (Kiến quần long vô thủ, cát). Khôn động cả 6 hào hóa Càn không dùng Thoán từ Càn mà có riêng hào <strong>Dụng Lục</strong> (Lợi vĩnh trinh). Đây là biểu hiện cao nhất của sự dung hòa cương nhu, tùy thời ứng biến viên dung vô ngại.
          </p>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-[#2C1F14] flex-wrap gap-2 text-xs">
        <button
          type="button"
          onClick={() => onNavigateToSection?.("spread_methods")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1C150E] hover:bg-[#2B2015] text-[#CBB99E] hover:text-white border border-[#3D2C1C] transition-all cursor-pointer"
        >
          <span>← Chương 5: Phương Pháp Trải Bài</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateToSection?.("lookup_matrix")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2C1F13] hover:bg-[#C9A55A] text-[#E6D3A3] hover:text-black border border-[#523C22] font-bold transition-all cursor-pointer shadow"
        >
          <span>Chương 7: Bảng Tra Ma Trận 64 Quẻ →</span>
        </button>
      </div>
    </div>
  );
};
