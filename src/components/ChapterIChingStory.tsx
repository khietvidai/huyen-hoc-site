import React, { useState, useMemo } from "react";
import {
  BookOpen,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Search,
  Filter,
  Layers,
  Compass,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import { ICHING_STORIES, HexagramStory } from "../data/ichingStoryData";
import { HEXAGRAMS } from "../data/hexagrams";

interface ChapterIChingStoryProps {
  onNavigateToHex?: (hexNum: number) => void;
  onNavigateToSection?: (sectionId: string) => void;
}

export const ChapterIChingStory: React.FC<ChapterIChingStoryProps> = ({
  onNavigateToHex,
  onNavigateToSection,
}) => {
  const [filterPart, setFilterPart] = useState<"all" | "upper" | "lower">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedHex, setExpandedHex] = useState<number | null>(null);
  const [readingMode, setReadingMode] = useState<"cards" | "continuous">("cards");

  const storyList = useMemo(() => {
    return Object.values(ICHING_STORIES).sort((a, b) => a.number - b.number);
  }, []);

  const filteredStories = useMemo(() => {
    return storyList.filter((item) => {
      if (filterPart !== "all" && item.part !== filterPart) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        item.number.toString() === q ||
        item.name.toLowerCase().includes(q) ||
        item.vietnameseName.toLowerCase().includes(q) ||
        item.storyTitle.toLowerCase().includes(q) ||
        item.story.toLowerCase().includes(q) ||
        item.moral.toLowerCase().includes(q)
      );
    });
  }, [storyList, filterPart, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Sách Bìa & Dẫn Nhập Chương Câu Chuyện Kinh Dịch */}
      <div className="bg-gradient-to-br from-[#201811] via-[#17120D] to-[#0E0B08] border border-[#483723] rounded-2xl p-5 sm:p-7 shadow-xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#C9A55A]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#332616] pb-3 mb-4">
          <div className="flex items-center gap-2 text-xs font-serif font-bold text-[#C9A55A] uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Kinh Điển Dịch Học • Tự Quái Truyện (序卦傳)</span>
          </div>
          <span className="text-[11px] font-mono text-[#C9A55A] px-2.5 py-0.5 rounded-full bg-[#241A12] border border-[#4E3924]">
            Trọn Bộ 64 Quẻ Nhân Sinh
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-[#F5EBD7] leading-snug">
          Câu Chuyện Kinh Dịch
        </h2>
        <p className="text-xs sm:text-sm text-[#C9A55A] font-serif font-semibold mt-1">
          Tiến Trình 64 Quẻ: Dòng Chảy Vũ Trụ, Xã Hội & Đời Người Vô Tận
        </p>

        <p className="text-xs sm:text-sm text-[#D1C3AB] font-serif leading-relaxed mt-3">
          Trong Kinh Dịch, 64 quẻ không hề đứng riêng lẻ rời rạc mà kết nối thành một thiên tiểu thuyết triết học vĩ đại về sự tiến hóa của tự nhiên và con người: từ thuở hỗn mang Càn Khôn khai mở, đến hạt mầm xé đất gian nan (Truân), được khai sáng trí tuệ (Mông), biết dưỡng sức đợi thời (Nhu), vượt qua tranh tụng (Tụng) và chiến loạn (Sư), mở ra thái bình (Thái), nếm trải bế tắc (Bĩ) để rồi kết thúc bằng việc đã thành (Ký Tế) và chưa xong (Vị Tế) — mở ra vòng tuần hoàn bất tận của tạo hóa!
        </p>
      </div>

      {/* Thanh Điều Khiển: Bộ Lọc Quyển & Tìm Kiếm */}
      <div className="bg-[#14100C] border border-[#332517] rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Lọc Thượng Kinh / Hạ Kinh / Tất cả */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#1A130E] border border-[#362719] rounded-xl text-xs font-serif">
            <button
              type="button"
              onClick={() => setFilterPart("all")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
                filterPart === "all"
                  ? "bg-[#C9A55A] text-[#14100C] shadow"
                  : "text-[#BBA891] hover:text-[#FFF] hover:bg-[#251B12]"
              }`}
            >
              Tất cả (64 Quẻ)
            </button>
            <button
              type="button"
              onClick={() => setFilterPart("upper")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
                filterPart === "upper"
                  ? "bg-[#C9A55A] text-[#14100C] shadow"
                  : "text-[#BBA891] hover:text-[#FFF] hover:bg-[#251B12]"
              }`}
            >
              Thượng Kinh (Quẻ 1 – 30: Đạo Trời Đất)
            </button>
            <button
              type="button"
              onClick={() => setFilterPart("lower")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
                filterPart === "lower"
                  ? "bg-[#C9A55A] text-[#14100C] shadow"
                  : "text-[#BBA891] hover:text-[#FFF] hover:bg-[#251B12]"
              }`}
            >
              Hạ Kinh (Quẻ 31 – 64: Đạo Nhân Sinh)
            </button>
          </div>

          {/* Chế độ hiển thị: Dạng Thẻ hay Dạng Đọc Liền Mạch */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#8C7A65] font-serif hidden sm:inline">Chế độ đọc:</span>
            <div className="flex items-center bg-[#1A130E] border border-[#362719] rounded-xl p-0.5 text-xs font-serif">
              <button
                type="button"
                onClick={() => setReadingMode("cards")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  readingMode === "cards"
                    ? "bg-[#38281A] text-[#F5EBD7] font-bold"
                    : "text-[#8C7A65] hover:text-[#C5B49D]"
                }`}
              >
                Dạng Thẻ Chi Tiết
              </button>
              <button
                type="button"
                onClick={() => setReadingMode("continuous")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  readingMode === "continuous"
                    ? "bg-[#38281A] text-[#F5EBD7] font-bold"
                    : "text-[#8C7A65] hover:text-[#C5B49D]"
                }`}
              >
                Đọc Liền Mạch
              </button>
            </div>
          </div>
        </div>

        {/* Ô Tìm Kiếm */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#8C7A65] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo số quẻ (1-64), tên quẻ (Càn, Khôn, Truân...), chủ đề câu chuyện..."
            className="w-full bg-[#100C09] border border-[#3A2B1D] focus:border-[#C9A55A] rounded-xl pl-9 pr-4 py-2.5 text-xs sm:text-sm text-[#F5EBD7] placeholder-[#6E5F4E] outline-none font-serif transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8C7A65] hover:text-[#C9A55A] cursor-pointer"
            >
              Xóa
            </button>
          )}
        </div>
      </div>

      {/* Hiển thị số lượng kết quả */}
      <div className="flex items-center justify-between text-xs font-serif text-[#A6957E] px-1">
        <span>
          Đang hiển thị <strong>{filteredStories.length}</strong> / 64 câu chuyện quẻ Dịch
        </span>
        {searchQuery && (
          <span className="text-[#C9A55A]">
            Kết quả lọc theo từ khóa: “{searchQuery}”
          </span>
        )}
      </div>

      {/* ========================================================
          CHẾ ĐỘ 1: DẠNG THẺ CHI TIẾT (CARDS MODE)
         ======================================================== */}
      {readingMode === "cards" && (
        <div className="space-y-4">
          {filteredStories.map((item) => {
            const isExpanded = expandedHex === item.number;
            const hexInfo = HEXAGRAMS.find((h) => h.number === item.number);

            return (
              <div
                key={item.number}
                id={`story-card-${item.number}`}
                className="bg-[#14100C] border border-[#352719] hover:border-[#523E28] rounded-2xl p-5 sm:p-6 transition-all shadow-md group relative scroll-mt-24"
              >
                {/* Header thẻ câu chuyện */}
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#2C1F14] pb-3.5 mb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#201811] border border-[#483723] flex items-center justify-center font-mono font-bold text-sm text-[#C9A55A] shrink-0 shadow-inner">
                      #{item.number}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#A89882] px-2 py-0.5 rounded bg-[#1C150E] border border-[#2F2115]">
                          {item.part === "upper" ? "Thượng Kinh (Đạo Trời Đất)" : "Hạ Kinh (Đạo Nhân Sinh)"}
                        </span>
                        {hexInfo?.symbol && (
                          <span className="font-mono text-base text-[#C9A55A] font-bold">
                            {hexInfo.symbol}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base sm:text-lg font-serif font-bold text-[#F5EAD4]">
                        Quẻ #{item.number}: {item.name} ({item.vietnameseName})
                      </h3>
                      <h4 className="text-xs sm:text-sm font-serif font-semibold text-[#E0B861] mt-0.5">
                        “{item.storyTitle}”
                      </h4>
                    </div>
                  </div>

                  {/* Nút hành động */}
                  <div className="flex items-center gap-2 self-start">
                    <button
                      type="button"
                      onClick={() => onNavigateToHex?.(item.number)}
                      className="px-3 py-1.5 rounded-lg bg-[#241A12] hover:bg-[#C9A55A] text-[#C9A55A] hover:text-[#14100C] border border-[#453320] hover:border-[#C9A55A] text-xs font-serif font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                      title="Mở toàn bộ trang Thuyết Minh của quẻ này"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Xem Thuyết Minh Quẻ</span>
                    </button>
                  </div>
                </div>

                {/* Vị trí Tự Quái Truyện */}
                <div className="text-xs font-serif text-[#A6957E] italic mb-3 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#C9A55A] shrink-0" />
                  <span>{item.context}</span>
                </div>

                {/* Nội Dung Câu Chuyện */}
                <div className="bg-[#18120D] border border-[#2E2114] p-4 rounded-xl text-xs sm:text-sm font-serif leading-relaxed text-[#DCD1BC] relative">
                  <p className="first-letter:text-2xl first-letter:font-bold first-letter:text-[#C9A55A] first-letter:mr-1">
                    {item.story}
                  </p>
                </div>

                {/* Mạch Truyện: Quẻ Trước -> Quẻ Này -> Quẻ Kế Tiếp - Nhấn để chuyển quẻ */}
                {(() => {
                  const prevNum = item.number > 1 ? item.number - 1 : 64;
                  const nextNum = item.number < 64 ? item.number + 1 : 1;
                  const prevStoryObj = ICHING_STORIES[prevNum];
                  const nextStoryObj = ICHING_STORIES[nextNum];

                  const handleJump = (targetNum: number) => {
                    const el = document.getElementById(`story-card-${targetNum}`);
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth", block: "start" });
                      el.classList.add("ring-2", "ring-[#C9A55A]");
                      setTimeout(() => el.classList.remove("ring-2", "ring-[#C9A55A]"), 2000);
                    } else if (onNavigateToHex) {
                      onNavigateToHex(targetNum);
                    }
                  };

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mt-3 text-xs font-serif">
                      <button
                        type="button"
                        onClick={() => handleJump(prevNum)}
                        className="bg-[#120E0A] hover:bg-[#1E1710] p-3 rounded-xl border border-[#2A1E13] hover:border-[#C9A55A] text-left transition-all cursor-pointer group/prev flex flex-col justify-between"
                        title={`Nhấn để chuyển đến Câu chuyện Quẻ trước #${prevNum}`}
                      >
                        <div>
                          <div className="text-[10px] font-mono uppercase tracking-wider text-[#C89B3C] group-hover/prev:text-[#F3E5C8] mb-1.5 pb-1 border-b border-[#22160C] flex items-center justify-between font-bold">
                            <span className="flex items-center gap-1">
                              <ArrowLeft className="w-3 h-3 text-[#C9A55A] group-hover/prev:-translate-x-1 transition-transform" />
                              Nguồn Gốc Nối Tiếp Quẻ Trước
                            </span>
                            <span className="text-[10px] font-mono text-[#C9A55A] bg-[#201811] px-2 py-0.5 rounded border border-[#3E2B18] group-hover/prev:bg-[#C9A55A] group-hover/prev:text-[#100D09] transition-all">
                              Quẻ #{prevNum}
                            </span>
                          </div>
                          <p className="text-[#C8BBA5] group-hover/prev:text-[#F5EAD4] transition-colors leading-relaxed">
                            {item.connectionPrev}
                          </p>
                        </div>
                        <div className="mt-2 pt-1 border-t border-[#1F150C] flex items-center gap-1 text-[10px] text-[#8C7A65] group-hover/prev:text-[#C9A55A] font-sans">
                          <span>👈 Nhấn để chuyển đến Quẻ #{prevNum} ({prevStoryObj?.name})</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleJump(nextNum)}
                        className="bg-[#120E0A] hover:bg-[#1E1710] p-3 rounded-xl border border-[#2A1E13] hover:border-[#C9A55A] text-left transition-all cursor-pointer group/next flex flex-col justify-between"
                        title={`Nhấn để chuyển sang Câu chuyện Quẻ tiếp theo #${nextNum}`}
                      >
                        <div>
                          <div className="text-[10px] font-mono uppercase tracking-wider text-[#C89B3C] group-hover/next:text-[#F3E5C8] mb-1.5 pb-1 border-b border-[#22160C] flex items-center justify-between font-bold">
                            <span className="flex items-center gap-1">
                              <ArrowRight className="w-3 h-3 text-[#C9A55A] group-hover/next:translate-x-1 transition-transform order-last sm:order-first" />
                              Cầu Nối Dẫn Sang Quẻ Sau
                            </span>
                            <span className="text-[10px] font-mono text-[#C9A55A] bg-[#201811] px-2 py-0.5 rounded border border-[#3E2B18] group-hover/next:bg-[#C9A55A] group-hover/next:text-[#100D09] transition-all">
                              Quẻ #{nextNum}
                            </span>
                          </div>
                          <p className="text-[#C8BBA5] group-hover/next:text-[#F5EAD4] transition-colors leading-relaxed">
                            {item.connectionNext}
                          </p>
                        </div>
                        <div className="mt-2 pt-1 border-t border-[#1F150C] flex items-center justify-end gap-1 text-[10px] text-[#8C7A65] group-hover/next:text-[#C9A55A] font-sans">
                          <span>Nhấn để qua Quẻ #{nextNum} ({nextStoryObj?.name}) 👉</span>
                        </div>
                      </button>
                    </div>
                  );
                })()}

                {/* Đạo Lý Nhân Sinh & Lời Khuyên Ứng Dụng */}
                <div className="mt-3 bg-gradient-to-r from-[#24170E] to-[#1A120B] p-3 rounded-xl border border-[#48341F] flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#C9A55A] shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm font-serif text-[#F0DFBF]">
                    <strong className="text-[#C9A55A]">Bài học nhân sinh: </strong>
                    {item.moral}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================
          CHẾ ĐỘ 2: ĐỌC LIỀN MẠCH NHƯ TIỂU THUYẾT (CONTINUOUS MODE)
         ======================================================== */}
      {readingMode === "continuous" && (
        <div className="bg-[#14100C] border border-[#352719] rounded-2xl p-6 sm:p-8 space-y-8 shadow-lg">
          <div className="text-center max-w-2xl mx-auto border-b border-[#2C1F14] pb-6">
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#F5EAD4]">
              Thiên Sử Thi 64 Quẻ Kinh Dịch
            </h3>
            <p className="text-xs text-[#A6957E] font-serif italic mt-1">
              Đọc liền mạch dòng chảy biến hóa của tạo hóa và nhân sinh từ quẻ số 1 đến quẻ số 64
            </p>
          </div>

          <div className="space-y-8 divide-y divide-[#261B11]">
            {filteredStories.map((item) => (
              <div key={item.number} className="pt-6 first:pt-0 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#C9A55A] px-2 py-0.5 rounded bg-[#22180F] border border-[#422F1D]">
                      #{item.number}
                    </span>
                    <h4 className="text-base sm:text-lg font-serif font-bold text-[#F5EAD4]">
                      {item.name} ({item.vietnameseName}) — “{item.storyTitle}”
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigateToHex?.(item.number)}
                    className="text-xs font-serif text-[#C9A55A] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>Xem thuyết minh quẻ</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <p className="text-xs sm:text-sm font-serif leading-relaxed text-[#DCD1BC] pl-3 border-l-2 border-[#C9A55A]/60">
                  {item.story}
                </p>

                <div className="bg-[#19130D] p-2.5 rounded-lg border border-[#2D2014] text-xs font-serif text-[#C4B49E]">
                  <strong className="text-[#C9A55A]">Tiến trình: </strong>
                  {item.connectionPrev} → {item.connectionNext}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="pt-5 border-t border-[#2C2114] flex flex-wrap items-center justify-between gap-3 text-xs font-serif">
        <button
          type="button"
          onClick={() => onNavigateToSection?.("spread_methods")}
          className="px-4 py-2.5 rounded-xl bg-[#18130E] hover:bg-[#251C13] border border-[#352718] hover:border-[#C9A55A] text-[#E5D7BF] hover:text-[#FFF] flex items-center gap-2 cursor-pointer transition-all shadow"
          title="Nhấn vào đây để trở về phần trước"
        >
          <ArrowLeft className="w-4 h-4 text-[#C9A55A]" />
          <div>
            <span className="text-[10px] text-[#C9A55A] block font-mono font-bold">👈 NHẤN VÀO ĐÂY ĐỂ TRỞ VỀ PHẦN TRƯỚC</span>
            <span className="font-bold text-xs">Phương Pháp Trải Bài</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigateToSection?.("hexagram_interpretations")}
          className="px-4 py-2.5 rounded-xl bg-[#22180F] hover:bg-[#342417] border border-[#4E3924] hover:border-[#C9A55A] text-[#E5D7BF] hover:text-[#FFF] font-bold flex items-center gap-2 cursor-pointer transition-all shadow ml-auto text-right"
          title="Nhấn vào đây để qua phần tiếp theo"
        >
          <div>
            <span className="text-[10px] text-[#C9A55A] block font-mono font-bold">NHẤN VÀO ĐÂY ĐỂ QUA PHẦN TIẾP THEO 👉</span>
            <span className="font-bold text-xs">Cẩm Nang 64 Quẻ Thuyết Minh</span>
          </div>
          <ArrowRight className="w-4 h-4 text-[#C9A55A]" />
        </button>
      </div>
    </div>
  );
};
