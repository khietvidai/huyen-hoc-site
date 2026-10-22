import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Shuffle,
  Layers,
  ArrowRight,
  ArrowDown,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  Camera,
  Info,
  Clock,
  Flame,
  Crown,
  BookOpen,
  Compass,
  Check,
  ChevronRight,
  Eye,
  Sliders,
  Copy,
} from "lucide-react";
import { Hexagram } from "../types";
import { HEXAGRAMS } from "../data/hexagrams";
import { CardVisual } from "./CardVisual";
import { captureElementToPng } from "../utils/captureHelper";
import { ExportImageModal } from "./ExportImageModal";
import { zenAudio } from "../utils/zenAudio";

interface ThapLaDivinationProps {
  cardImages?: Record<number, string>;
  cardVideos?: Record<number, string>;
  cardBackImage?: string | null;
  onComplete: (
    primary: Hexagram,
    changingLines: number[],
    transformed?: Hexagram,
    summary?: string,
    drawnCards?: Hexagram[],
    meta?: any
  ) => void;
  onShowToast?: (msg: string) => void;
  onNavigateToDetail?: () => void;
}

export const ThapLaDivination: React.FC<ThapLaDivinationProps> = ({
  cardImages = {},
  cardVideos = {},
  cardBackImage = null,
  onComplete,
  onShowToast,
  onNavigateToDetail,
}) => {
  // Step: 'ready' (chưa rút), 'shuffling' (đang xáo bài), 'drawn' (đã có kết quả)
  const [step, setStep] = useState<"ready" | "shuffling" | "drawn">("ready");

  // Input câu hỏi & chuyên mục
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState("Tổng quát");

  // Kết quả bốc bài
  const [primaryHex, setPrimaryHex] = useState<Hexagram | null>(null);
  const [transformedHex, setTransformedHex] = useState<Hexagram | null>(null);
  const [changingLines, setChangingLines] = useState<number[]>([]);

  // Sao chép trải bài cho AI
  const [copiedAI, setCopiedAI] = useState(false);

  // Thẻ hào đang được chọn xem sâu
  const [selectedYaoLine, setSelectedYaoLine] = useState<number | null>(null);

  // Export ảnh modal
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportDataUrl, setExportDataUrl] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const spreadAreaRef = useRef<HTMLDivElement>(null);

  // Tên vị trí 6 hào cổ truyền
  const YAO_POSITION_NAMES: Record<number, { title: string; subtitle: string; essence: string }> = {
    1: {
      title: "Hào Sơ (Hào 1)",
      subtitle: "Gốc Rễ Khởi Sự • Mới Bắt Đầu",
      essence: "Mầm mống sự việc, nền tảng vi tế. Thời cơ chưa lộ rõ, cần ẩn nhẫn tích lũy nội lực.",
    },
    2: {
      title: "Hào Nhị (Hào 2)",
      subtitle: "Nội Cương Trắc Ẩn • Đắc Trung",
      essence: "Vị trí trung chính trong nội quái, hòa hợp nhân tâm, giải quyết êm đẹp chuyện nội bộ.",
    },
    3: {
      title: "Hào Tam (Hào 3)",
      subtitle: "Giao Thời Bất Ổn • Thử Thách",
      essence: "Ranh giới chuyển giao giữa quẻ dưới và quẻ trên. Dễ gặp chao đảo, cần cẩn trọng tối đa.",
    },
    4: {
      title: "Hào Tứ (Hào 4)",
      subtitle: "Cận Kề Quyền Lực • Tiến Thoái",
      essence: "Bước vào thượng quái, gần kề vị trí lãnh đạo. Thời khắc nhạy cảm, đòi hỏi ứng xử khôn khéo.",
    },
    5: {
      title: "Hào Ngũ (Hào 5)",
      subtitle: "Chí Tôn Đại Định • Trung Chính",
      essence: "Vị trí đẹp nhất của quẻ, thời vận hanh thông, quyền năng nắm trong tay, hành sự tất thành.",
    },
    6: {
      title: "Hào Lục / Thượng (Hào 6)",
      subtitle: "Cực Điểm Biến Hóa • Chuyển Hóa",
      essence: "Đỉnh cao của thời vận sắp sửa thoái trào hoặc chuyển hóa sang chu kỳ mới. Vật cực tất phản.",
    },
  };

  // Tính toán hào biến khi có 2 quẻ
  const calculateChangingLines = (pri: Hexagram, trans: Hexagram) => {
    const changes: number[] = [];
    for (let i = 0; i < 6; i++) {
      if (pri.lines[i] !== trans.lines[i]) {
        changes.push(i + 1); // 1-indexed từ Hào Sơ (1) tới Hào Lục (6)
      }
    }
    return changes; // Tự động sắp xếp từ thấp lên cao (Sơ -> Lục)
  };

  // Bốc ngẫu nhiên 2 quẻ từ 2 bộ 64 quẻ độc lập
  const handleDrawThapLa = () => {
    if (step === "shuffling") return;
    setStep("shuffling");
    zenAudio.playCardShuffleSound();

    setTimeout(() => {
      // Rút ngẫu nhiên lá 1 (Quẻ Chủ) từ Bộ Bài 1
      const randIdx1 = Math.floor(Math.random() * HEXAGRAMS.length);
      const pri = HEXAGRAMS[randIdx1];

      // Rút ngẫu nhiên lá 2 (Quẻ Biến) từ Bộ Bài 2 độc lập
      const randIdx2 = Math.floor(Math.random() * HEXAGRAMS.length);
      const trans = HEXAGRAMS[randIdx2];

      // Tính các hào thay đổi theo thứ tự từ Sơ tới Lục
      const changes = calculateChangingLines(pri, trans);

      setPrimaryHex(pri);
      setTransformedHex(trans);
      setChangingLines(changes);
      setSelectedYaoLine(changes.length > 0 ? changes[0] : null);

      setStep("drawn");
      zenAudio.playCardDrawSound();

      const summaryText = `Tháp La Kinh Dịch: Quẻ Chủ #${pri.number} ${pri.name} → Quẻ Biến #${trans.number} ${trans.name} (${
        changes.length > 0
          ? `Biến ${changes.length} hào: ${changes.map((c) => `Hào ${c}`).join(", ")}`
          : "Quẻ Tĩnh không biến"
      })`;

      // Gọi onComplete lưu lịch sử
      onComplete(
        pri,
        changes,
        trans,
        summaryText,
        [pri, trans],
        {
          spreadType: "thapla",
          doubleMode: "present_future",
        }
      );

      if (onShowToast) {
        onShowToast(`Khởi quẻ Tháp La thành công! ${changes.length > 0 ? `Nhận diện ${changes.length} hào bước ngoặt.` : "Thuần quái kiên định."}`);
      }
    }, 1100);
  };

  // Reset gieo mới
  const handleReset = () => {
    setStep("ready");
    setPrimaryHex(null);
    setTransformedHex(null);
    setChangingLines([]);
    setSelectedYaoLine(null);
  };

  // Xuất ảnh PNG
  const handleExportPng = async () => {
    if (!spreadAreaRef.current) return;
    setIsCapturing(true);
    try {
      const dataUrl = await captureElementToPng(spreadAreaRef.current);
      setExportDataUrl(dataUrl);
      setIsExportModalOpen(true);
    } catch (err) {
      console.error(err);
      if (onShowToast) onShowToast("Không thể tạo ảnh, vui lòng thử lại!");
    } finally {
      setIsCapturing(false);
    }
  };

  // Sao chép trải bài cho AI theo đúng chuẩn 3 ngôi
  const handleCopyForAI = async () => {
    if (!primaryHex || !transformedHex) return;

    const lines: string[] = [];
    lines.push(`=== BẢNG LUẬN GIẢI THÁP LA KINH DỊCH (周易塔羅) ===`);
    lines.push(`Cấu trúc: Quẻ Chủ & Quẻ Biến song song Trên - Dưới • Dải Hào Động (Bộ 384 Lá) kế bên Quẻ Chủ`);
    lines.push(`Thứ tự đọc chiêm bốc: 1. Bản Quái (Quẻ Chủ) ➔ 2. Hào Động (Bước Ngoặt) ➔ 3. Biến Quái (Quẻ Biến)\n`);

    lines.push(`----------------------------------------`);
    lines.push(`【1. BẢN QUÁI (QUẺ CHỦ) — LÁ TRÊN SONG SONG】`);
    lines.push(`• Văn Bản Trọng Tâm: Thoán Từ (Quái Từ), Đại Tượng Truyện`);
    lines.push(`• Ý Nghĩa Thực Tiễn Trong Đời Sống: Định vị bối cảnh: Nhận diện bản chất loại hoàn cảnh thực tại bạn đang đối mặt`);
    lines.push(`• Quẻ số: #${primaryHex.number} - ${primaryHex.name} (${primaryHex.hanzi || primaryHex.name}) [${primaryHex.symbol}]`);
    if (primaryHex.vietnameseName) lines.push(`• Tên thuần Việt: ${primaryHex.vietnameseName}`);
    lines.push(`• Cấu tạo: Thượng [${primaryHex.upperTrigram}] vi Thượng • Hạ [${primaryHex.lowerTrigram}] vi Hạ | Ngũ hành: ${primaryHex.element} | Khí số: ${primaryHex.omen}`);
    lines.push(`• Cấu trúc 6 hào (từ hào 1 lên hào 6): ${primaryHex.lines.map((v, i) => `Hào ${i + 1}: ${v === 1 ? "⚊ Dương" : "⚏ Âm"}`).join(" | ")}`);
    lines.push(`• Thoán Từ (Quái Từ): "${primaryHex.judgment}"`);
    lines.push(`• Đại Tượng Truyện: "${primaryHex.image}"`);
    if (primaryHex.overview) lines.push(`• Bối cảnh thực tại & Thời vận: ${primaryHex.overview}`);
    if (primaryHex.career) lines.push(`• Vận trình sự nghiệp: ${primaryHex.career}`);
    if (primaryHex.wealth) lines.push(`• Vận trình tài lộc: ${primaryHex.wealth}`);
    if (primaryHex.love) lines.push(`• Tình cảm nhân duyên: ${primaryHex.love}`);
    if (primaryHex.health) lines.push(`• Sức khỏe thể chất: ${primaryHex.health}`);
    if (primaryHex.advice) lines.push(`• Lời khuyên nền tảng: ${primaryHex.advice}`);
    lines.push("");

    lines.push(`----------------------------------------`);
    lines.push(`【2. HÀO ĐỘNG (BỘ 384 LÁ BÀI HÀO TỪ) — KẾ BÊN QUẺ CHỦ】`);
    lines.push(`• Văn Bản Trọng Tâm: Hào Từ của chính hào biến động`);
    lines.push(`• Ý Nghĩa Thực Tiễn Trong Đời Sống: Lời khuyên then chốt: Trọng tâm hành động và biến số mấu chốt bạn cần lưu tâm`);
    lines.push(`• Số lượng hào biến động: ${changingLines.length} hào (Sắp xếp theo thứ tự từ Hào Sơ ➔ Hào Lục)`);
    lines.push("");

    if (changingLines.length === 0) {
      lines.push(`• Tình trạng: Quẻ Tĩnh (Không có hào biến). Cục diện kiên định bất biến, dĩ bất biến ứng vạn biến, bám sát Thoán Từ của Bản Quái.`);
    } else {
      changingLines.forEach((lineNum, idx) => {
        const lineMeaning = primaryHex.lineMeanings?.find((m) => m.line === lineNum);
        const isYangToYin = (primaryHex.lines?.[lineNum - 1] === 1);
        lines.push(`▶ Hào Động thứ ${idx + 1} (Hào ${lineNum} - ${lineMeaning?.name || `Hào ${lineNum}`}):`);
        lines.push(`  - Biến chuyển: ${isYangToYin ? "⚊ Dương biến sang ⚏ Âm" : "⚏ Âm biến sang ⚊ Dương"}`);
        lines.push(`  - Hào Từ: "${lineMeaning?.text || ""}"`);
        lines.push(`  - Lời khuyên then chốt: ${lineMeaning?.meaning || ""}`);
        if (lineMeaning?.detailedExplanation) {
          lines.push(`  - Trọng tâm hành động & Biến số mấu chốt: ${lineMeaning.detailedExplanation}`);
        }
      });
    }
    lines.push("");

    lines.push(`----------------------------------------`);
    lines.push(`【3. BIẾN QUÁI (QUẺ BIẾN) — LÁ DƯỚI SONG SONG】`);
    lines.push(`• Văn Bản Trọng Tâm: Quái Từ của Quẻ Biến (Thoán Từ, Đại Tượng Truyện)`);
    lines.push(`• Ý Nghĩa Thực Tiễn Trong Đời Sống: Định hướng tương lai: Xu thế phát triển tiếp theo sau khi sự chuyển hóa hoàn tất`);
    lines.push(`• Quẻ số: #${transformedHex.number} - ${transformedHex.name} (${transformedHex.hanzi || transformedHex.name}) [${transformedHex.symbol}]`);
    if (transformedHex.vietnameseName) lines.push(`• Tên thuần Việt: ${transformedHex.vietnameseName}`);
    lines.push(`• Cấu tạo: Thượng [${transformedHex.upperTrigram}] vi Thượng • Hạ [${transformedHex.lowerTrigram}] vi Hạ | Ngũ hành: ${transformedHex.element} | Khí số: ${transformedHex.omen}`);
    lines.push(`• Cấu trúc 6 hào (từ hào 1 lên hào 6): ${transformedHex.lines.map((v, i) => `Hào ${i + 1}: ${v === 1 ? "⚊ Dương" : "⚏ Âm"}`).join(" | ")}`);
    lines.push(`• Quái Từ (Thoán Từ Quẻ Biến): "${transformedHex.judgment}"`);
    lines.push(`• Đại Tượng Truyện: "${transformedHex.image}"`);
    if (transformedHex.overview) lines.push(`• Định hướng xu thế tương lai & Thời vận: ${transformedHex.overview}`);
    if (transformedHex.career) lines.push(`• Vận trình sự nghiệp: ${transformedHex.career}`);
    if (transformedHex.wealth) lines.push(`• Vận trình tài lộc: ${transformedHex.wealth}`);
    if (transformedHex.love) lines.push(`• Tình cảm nhân duyên: ${transformedHex.love}`);
    if (transformedHex.health) lines.push(`• Sức khỏe thể chất: ${transformedHex.health}`);
    if (transformedHex.advice) lines.push(`• Phương châm hành động sáng suốt: ${transformedHex.advice}`);
    lines.push("");

    lines.push(`========================================`);
    lines.push(`[YÊU CẦU LUẬN GIẢI CHO AI (THEO PHƯƠNG PHÁP THÁP LA KINH DỊCH)]:`);
    lines.push(`Xin hãy phân tích trải bài Tháp La Kinh Dịch theo đúng 3 tầng thứ tự và ý nghĩa thực tiễn trong đời sống:`);
    lines.push(`1. BẢN QUÁI (Định vị bối cảnh): Dựa vào Thoán Từ (Quái Từ) và Đại Tượng Truyện, nhận diện bản chất loại hoàn cảnh thực tại đương số đang đối mặt. Cục diện đang ở đâu? Cơ hội và trở lực tiềm ẩn xung quanh là gì?`);
    lines.push(`2. HÀO ĐỘNG (Lời khuyên then chốt): Dựa vào Hào Từ của chính các hào biến động (phân tích tuần tự từ Hào Sơ lên Hào Lục). Đâu là trọng tâm hành động và biến số mấu chốt đương số cần lưu tâm? Chỉ rõ việc nên làm, việc cần tránh và thời điểm chuyển hóa quyết định.`);
    lines.push(`3. BIẾN QUÁI (Định hướng tương lai): Dựa vào Quái Từ của Quẻ Biến, dự báo xu thế phát triển tiếp theo sau khi sự chuyển hóa hoàn tất. Đưa ra chiến lược tổng thể và tâm thế sáng suốt nhất để đương số chủ động kiến tạo cát tường.`);

    const text = lines.join("\n");
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopiedAI(true);
      if (onShowToast) onShowToast("Đã sao chép nội dung trải bài Tháp La chuẩn 3 ngôi cho AI!");
      setTimeout(() => setCopiedAI(false), 2500);
    } catch (err) {
      console.error(err);
      if (onShowToast) onShowToast("Không thể sao chép vào clipboard, vui lòng thử lại!");
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Giới Thiệu Hình Thức Tháp La Kinh Dịch */}
      <div className="royal-frame p-6 sm:p-8 bg-gradient-to-b from-[#18130E] via-[#120E0A] to-[#0A0806] border border-[#C4963E]/40 rounded-3xl shadow-2xl relative overflow-hidden">
        <span className="royal-corner tl" />
        <span className="royal-corner tr" />
        <span className="royal-corner bl" />
        <span className="royal-corner br" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#C4963E]/20 text-[#E0B861] border border-[#C4963E]/40">
                Phương Pháp Bốc Bài Mới
              </span>
              <span className="text-[11px] font-serif tracking-[0.25em] text-[#C4963E]/80">
                塔羅周易
              </span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl text-[#FAF5EB] font-bold tracking-wide">
              Tháp La Kinh Dịch
            </h2>
            <p className="text-xs sm:text-sm text-[#D1C2A5] font-serif max-w-2xl leading-relaxed">
              Bốc ngẫu nhiên 2 lá từ 2 cỗ bài 64 quẻ độc lập: <strong className="text-[#F3D99B]">Quẻ Chủ</strong> và <strong className="text-[#F3D99B]">Quẻ Biến</strong> đặt song song trên - dưới. Kế bên là dải các lá bài <strong className="text-[#F3D99B]">Hào Từ thay đổi</strong> từ hào Sơ đến hào Lục.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {step === "drawn" && (
              <button
                type="button"
                onClick={handleReset}
                className="royal-btn-ghost !px-4 !py-2 text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Gieo Quẻ Mới</span>
              </button>
            )}
            {step === "drawn" && (
              <button
                type="button"
                onClick={handleExportPng}
                disabled={isCapturing}
                className="royal-btn-gold !px-4 !py-2 text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{isCapturing ? "Đang chụp..." : "Xuất Ảnh (PNG)"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Khẩu Quyết 3 Ngôi */}
        <div className="mt-5 pt-4 border-t border-[#332617] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#221A12]/70 border border-[#3D2D1B] flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-[#C4963E]/20 text-[#E0B861] font-bold flex items-center justify-center shrink-0 border border-[#C4963E]/40">
              Chủ
            </span>
            <div>
              <div className="font-bold text-[#F5EAD4]">Bản Quái (Quẻ Chủ)</div>
              <div className="text-[11px] text-[#A69780] font-sans">Nhìn nhận cục diện thực tại</div>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[#221A12]/70 border border-[#3D2D1B] flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center shrink-0 border border-amber-500/40">
              Động
            </span>
            <div>
              <div className="font-bold text-[#F5EAD4]">Hào Động (Hào Biến)</div>
              <div className="text-[11px] text-[#A69780] font-sans">Nhận diện bước ngoặt (Sơ ➔ Lục)</div>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[#221A12]/70 border border-[#3D2D1B] flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0 border border-emerald-500/40">
              Biến
            </span>
            <div>
              <div className="font-bold text-[#F5EAD4]">Biến Quái (Quẻ Biến)</div>
              <div className="text-[11px] text-[#A69780] font-sans">Thấu suốt xu thế tương lai</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. KHU VỰC BỐC BÀI KHI CHƯA RÚT (READY STATE) */}
      {step !== "drawn" && (
        <div className="royal-card p-6 sm:p-10 text-center space-y-8 max-w-3xl mx-auto">
          {/* Nhập câu hỏi nghi vấn */}
          <div className="max-w-xl mx-auto text-left space-y-2">
            <label className="text-xs font-bold text-[#D1C2A5] tracking-wide uppercase flex items-center gap-1.5">
              <span>Nghi Vấn / Câu Hỏi Cần Chiêm Đoán:</span>
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ví dụ: Kế hoạch kinh doanh mới trong 3 tháng tới sẽ phát triển ra sao?..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#17120C] border border-[#3E2F1D] text-sm text-[#F5EAD4] placeholder-[#73634E] focus:outline-none focus:border-[#C4963E]"
            />
          </div>

          {/* Mô phỏng 2 cỗ bài Tarot 64 lá độc lập */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg mx-auto">
            {/* Bộ 1: Quẻ Chủ */}
            <div className="p-5 rounded-2xl bg-[#19130D] border border-[#3B2C1B] flex flex-col items-center text-center space-y-3 shadow-lg hover:border-[#C4963E]/60 transition-colors">
              <span className="text-[11px] font-mono font-bold text-[#C4963E] uppercase tracking-wider">
                Bộ Bài I • 64 Quẻ
              </span>
              <div className="w-28 h-40 sm:w-32 sm:h-44 rounded-xl border border-[#C4963E]/50 bg-gradient-to-b from-[#251B10] via-[#1A130B] to-[#100C06] p-2 flex items-center justify-center shadow-xl relative overflow-hidden group cursor-pointer"
                onClick={handleDrawThapLa}>
                <div className="absolute inset-1 border border-dashed border-[#C4963E]/30 rounded-lg flex flex-col items-center justify-center">
                  <span className="text-3xl text-[#C4963E]/60 select-none">☯</span>
                  <span className="text-[10px] text-[#A69780] font-serif mt-1">Quẻ Chủ</span>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#FAF5EB]">Bộ Quẻ Chủ</h4>
                <p className="text-[11px] text-[#A89882]">Định vị bối cảnh thực tại</p>
              </div>
            </div>

            {/* Bộ 2: Quẻ Biến */}
            <div className="p-5 rounded-2xl bg-[#19130D] border border-[#3B2C1B] flex flex-col items-center text-center space-y-3 shadow-lg hover:border-[#C4963E]/60 transition-colors">
              <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                Bộ Bài II • 64 Quẻ
              </span>
              <div className="w-28 h-40 sm:w-32 sm:h-44 rounded-xl border border-emerald-500/40 bg-gradient-to-b from-[#132219] via-[#0E1812] to-[#080E0A] p-2 flex items-center justify-center shadow-xl relative overflow-hidden group cursor-pointer"
                onClick={handleDrawThapLa}>
                <div className="absolute inset-1 border border-dashed border-emerald-500/30 rounded-lg flex flex-col items-center justify-center">
                  <span className="text-3xl text-emerald-500/60 select-none">☵</span>
                  <span className="text-[10px] text-emerald-300/80 font-serif mt-1">Quẻ Biến</span>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#FAF5EB]">Bộ Quẻ Biến</h4>
                <p className="text-[11px] text-[#A89882]">Thấu suốt tương lai phía trước</p>
              </div>
            </div>
          </div>

          {/* Nút bấm Khởi Quẻ Tháp La */}
          <div className="pt-2">
            <button
              type="button"
              disabled={step === "shuffling"}
              onClick={handleDrawThapLa}
              className="royal-btn-gold !px-8 !py-3.5 text-sm sm:text-base font-bold shadow-xl cursor-pointer inline-flex items-center gap-2 group transition-all transform hover:scale-[1.02]"
            >
              {step === "shuffling" ? (
                <>
                  <Shuffle className="w-5 h-5 animate-spin text-[#14120F]" />
                  <span>Đang xáo 2 bộ bài 64 quẻ...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-[#14120F]" />
                  <span>Khởi Quẻ Tháp La (Rút Cả 2 Bộ Bài)</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-[#8C7D6A] mt-2 font-serif">
              Hệ thống sẽ bốc ngẫu nhiên 1 lá Quẻ Chủ từ Bộ I, 1 lá Quẻ Biến từ Bộ II và tự động định vị các lá hào từ thay đổi.
            </p>
          </div>
        </div>
      )}

      {/* 3. KHU VỰC KẾT QUẢ TRẢI BÀI (DRAWN STATE) */}
      {step === "drawn" && primaryHex && transformedHex && (
        <div ref={spreadAreaRef} className="space-y-6">
          {/* A. SƠ ĐỒ TRẢI BÀI THÁP LA (SPREAD DIAGRAM) */}
          <div className="royal-frame p-6 sm:p-8 bg-[#120E0A] border border-[#3E2E1B] rounded-3xl space-y-6 shadow-2xl">
            <div className="border-b border-[#302316] pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#C4963E]" />
                <h3 className="font-bold text-sm sm:text-base text-[#F5EAD4] uppercase tracking-wide">
                  Sơ Đồ Trải Bài Tháp La Kinh Dịch
                </h3>
              </div>
              <span className="text-xs font-mono text-[#C4963E] bg-[#22180F] px-2.5 py-0.5 rounded-full border border-[#44321D]">
                {changingLines.length > 0 ? `${changingLines.length} Hào Biến Động` : "Quẻ Tĩnh Không Biến"}
              </span>
            </div>

            {/* BỐ CỤC CHÍNH: 2 LÁ BÀI SONG SONG TRÊN DƯỚI & KẾ BÊN LÀ DẢI HÀO TỪ THAY ĐỔI */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* CỘT TRÁI (Lg: 4/12 hoặc 5/12): 2 LÁ BÀI SONG SONG TRÊN - DƯỚI */}
              <div className="lg:col-span-4 xl:col-span-4 flex flex-col items-center space-y-4 bg-[#18120B] p-5 rounded-2xl border border-[#362717] shadow-inner">
                {/* 1. LÁ TRÊN: QUẺ CHỦ (BẢN QUÁI) */}
                <div className="w-full flex flex-col items-center text-center space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#C4963E] text-stone-950 font-sans">
                      Lá Trên
                    </span>
                    <span className="text-xs font-bold text-[#F3D99B] uppercase font-serif">
                      Quẻ Chủ • Bản Quái
                    </span>
                  </div>
                  <span className="text-[11px] text-[#A69780] font-serif italic">
                    "Nhìn nhận cục diện thực tại"
                  </span>

                  <div className="pt-1">
                    <CardVisual
                      hexagram={primaryHex}
                      imageUrl={cardImages[primaryHex.number]}
                      videoUrl={cardVideos[primaryHex.number]}
                      cardBackUrl={cardBackImage}
                      size="md"
                      enableZoomModal={true}
                    />
                  </div>

                  <div className="pt-1">
                    <div className="text-sm font-bold text-[#FAF5EB] font-serif">
                      #{primaryHex.number} {primaryHex.name} ({primaryHex.hanzi})
                    </div>
                    <div className="text-[11px] text-[#C4963E] font-serif">
                      {primaryHex.upperTrigram} vi Thượng • {primaryHex.lowerTrigram} vi Hạ
                    </div>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#2B1F13] text-[#E0B861] border border-[#483521]">
                      {primaryHex.omen}
                    </span>
                  </div>
                </div>

                {/* DÂY CHUYỀN CHUYỂN HÓA SONG SONG TRÊN DƯỚI */}
                <div className="flex items-center gap-2 text-xs text-[#A89882] py-1">
                  <div className="h-px w-10 bg-[#3D2C1B]" />
                  <div className="flex items-center gap-1 font-mono text-[11px] text-[#C4963E]">
                    <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
                    <span>Dịch Chuyển</span>
                  </div>
                  <div className="h-px w-10 bg-[#3D2C1B]" />
                </div>

                {/* 2. LÁ DƯỚI: QUẺ BIẾN (BIẾN QUÁI) */}
                <div className="w-full flex flex-col items-center text-center space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-stone-950 font-sans">
                      Lá Dưới
                    </span>
                    <span className="text-xs font-bold text-emerald-300 uppercase font-serif">
                      Quẻ Biến • Biến Quái
                    </span>
                  </div>
                  <span className="text-[11px] text-[#A69780] font-serif italic">
                    "Thấu suốt xu thế tương lai"
                  </span>

                  <div className="pt-1">
                    <CardVisual
                      hexagram={transformedHex}
                      imageUrl={cardImages[transformedHex.number]}
                      videoUrl={cardVideos[transformedHex.number]}
                      cardBackUrl={cardBackImage}
                      size="md"
                      enableZoomModal={true}
                    />
                  </div>

                  <div className="pt-1">
                    <div className="text-sm font-bold text-[#FAF5EB] font-serif">
                      #{transformedHex.number} {transformedHex.name} ({transformedHex.hanzi})
                    </div>
                    <div className="text-[11px] text-emerald-400 font-serif">
                      {transformedHex.upperTrigram} vi Thượng • {transformedHex.lowerTrigram} vi Hạ
                    </div>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#122419] text-emerald-300 border border-[#1E3E2B]">
                      {transformedHex.omen}
                    </span>
                  </div>
                </div>
              </div>

              {/* CỘT PHẢI (Lg: 8/12): KẾ BÊN QUẺ CHỦ LÀ CÁC LÁ HÀO TỪ THAY ĐỔI THEO THỨ TỰ TỪ SƠ TỚI LỤC */}
              <div className="lg:col-span-8 xl:col-span-8 space-y-4">
                <div className="flex items-center justify-between border-b border-[#302316] pb-2">
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-[#F5EAD4] font-serif flex items-center gap-2">
                      <span>Dải Lá Hào Từ Thay Đổi</span>
                      <span className="text-xs text-[#C4963E] font-normal">
                        (Thứ tự từ Hào Sơ ➔ Hào Lục)
                      </span>
                    </h4>
                    <p className="text-[11px] text-[#A69780] font-serif">
                      "Hào động nhận diện bước ngoặt" — Các mắt xích chuyển hóa Quẻ Chủ thành Quẻ Biến.
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-[#D4AF37]">
                    {changingLines.length} / 6 Hào
                  </span>
                </div>

                {/* Trường hợp 0 hào động (Quẻ Tĩnh) */}
                {changingLines.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-[#1C1610] border border-[#3E2F1E] text-center space-y-3">
                    <span className="text-2xl text-[#C4963E]">☯</span>
                    <h5 className="font-bold text-[#F5EAD4] text-sm">
                      Quẻ Tĩnh — Cục Diện Kiên Định Bất Biến
                    </h5>
                    <p className="text-xs text-[#A89882] max-w-md mx-auto leading-relaxed">
                      Cả 2 cỗ bài đều bốc được cùng Quẻ #{primaryHex.number} {primaryHex.name}. Không có hào nào thay đổi. Điều này ứng với đạo lý "Tâm tĩnh tắc an, dĩ bất biến ứng vạn biến". Bạn cần bám sát Thoán Từ và Đại Tượng của Quẻ Chủ, kiên trì đường lối hiện tại mà không cần vội vã cải biến.
                    </p>
                  </div>
                ) : (
                  /* Danh sách các Thẻ Bài Hào Từ Biến Động */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {changingLines.map((lineNum) => {
                      const isYangToYin = primaryHex.lines[lineNum - 1] === 1;
                      const yaoMeta = YAO_POSITION_NAMES[lineNum];
                      const meaningObj = primaryHex.lineMeanings?.find((m) => m.line === lineNum);
                      const isSelected = selectedYaoLine === lineNum;

                      return (
                        <div
                          key={lineNum}
                          onClick={() => setSelectedYaoLine(lineNum)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? "bg-[#251B11] border-[#C4963E] shadow-[0_0_15px_rgba(196,150,62,0.25)] ring-1 ring-[#C4963E]/60"
                              : "bg-[#18130D] border-[#302315] hover:border-[#523B23] hover:bg-[#1E1710]"
                          }`}
                        >
                          <div>
                            {/* Header của thẻ hào */}
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#2C1F12] text-[#E0B861] border border-[#483420]">
                                {yaoMeta?.title}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                  isYangToYin
                                    ? "bg-amber-950/60 text-amber-300 border-amber-600/40"
                                    : "bg-indigo-950/60 text-indigo-300 border-indigo-600/40"
                                }`}
                              >
                                {isYangToYin ? "⚊ Dương ➔ ⚏ Âm" : "⚏ Âm ➔ ⚊ Dương"}
                              </span>
                            </div>

                            {/* Tên Hào & Hào Từ */}
                            <h5 className="text-sm font-bold text-[#F5EAD4] font-serif mb-1">
                              {meaningObj?.name || `Hào ${lineNum}`}: {meaningObj?.text || "Chuyển hóa"}
                            </h5>

                            {/* Vị trí triết lý */}
                            <p className="text-[11px] text-[#C4963E] font-medium mb-2 font-serif">
                              {yaoMeta?.subtitle}
                            </p>

                            {/* Ý nghĩa bước ngoặt */}
                            <p className="text-xs text-[#C2B299] font-serif leading-relaxed line-clamp-3">
                              {meaningObj?.meaning || yaoMeta?.essence}
                            </p>
                          </div>

                          {/* Footer thẻ */}
                          <div className="mt-3 pt-2.5 border-t border-[#2A1E12] flex items-center justify-between text-[11px]">
                            <span className="text-[#8C7D6A] font-sans">
                              {isYangToYin ? "Lão Dương Động Hóa Âm" : "Lão Âm Động Hóa Dương"}
                            </span>
                            <span className="text-[#C4963E] font-semibold flex items-center gap-1">
                              <span>Xem chi tiết</span>
                              <ChevronRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Chi Tiết Hào Động Được Chọn (Detail Box) */}
                {selectedYaoLine && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#1F1710] border border-[#C4963E]/50 space-y-2 mt-4 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-[#C4963E]" />
                        <span className="text-xs font-bold text-[#F5EAD4] font-serif uppercase tracking-wide">
                          Khảo Cứu Bước Ngoặt: {YAO_POSITION_NAMES[selectedYaoLine]?.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#A69780] font-mono">
                        Quẻ #{primaryHex.number} {primaryHex.name}
                      </span>
                    </div>

                    <div className="text-xs sm:text-sm font-bold text-[#F3D99B] font-serif">
                      "{primaryHex.lineMeanings?.find((m) => m.line === selectedYaoLine)?.text || ""}"
                    </div>

                    <p className="text-xs text-[#D8C9B0] font-serif leading-relaxed">
                      {primaryHex.lineMeanings?.find((m) => m.line === selectedYaoLine)?.meaning ||
                        YAO_POSITION_NAMES[selectedYaoLine]?.essence}
                    </p>

                    <div className="pt-2 text-[11px] text-[#A89882] italic font-serif border-t border-[#312316]">
                      💡 <strong>Bài học bước ngoặt:</strong> Tại vị trí này, hành động của bạn sẽ quyết định việc đưa cục diện từ {primaryHex.name} tiến hóa sang {transformedHex.name}. Hãy hành xử thận trọng đúng tinh thần trung chính của Kinh Dịch.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* B. BỘ BA LUẬN GIẢI TRIẾT LÝ 3 NGÔI (BẢN QUÁI - HÀO ĐỘNG - BIẾN QUÁI) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. BẢN QUÁI: NHÌN NHẬN CỤC DIỆN */}
            <div className="p-5 rounded-2xl bg-[#15100B] border border-[#3E2E1B] space-y-3 flex flex-col justify-between shadow-lg">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-[#C4963E]/20 text-[#E0B861] font-bold text-xs flex items-center justify-center border border-[#C4963E]/40">
                    1
                  </span>
                  <h4 className="font-bold text-sm text-[#F5EAD4] uppercase font-serif">
                    Bản Quái: Nhìn Nhận Cục Diện
                  </h4>
                </div>
                <div className="text-xs text-[#C4963E] font-serif font-semibold">
                  Quẻ #{primaryHex.number} {primaryHex.name} ({primaryHex.hanzi})
                </div>
                <div className="text-xs text-[#BFAFA0] font-serif italic">
                  Thoán từ: "{primaryHex.judgment}"
                </div>
                <p className="text-xs text-[#D4C5AE] font-serif leading-relaxed">
                  {primaryHex.overview || primaryHex.advice}
                </p>
              </div>
              <div className="pt-2 text-[11px] text-[#A69780] font-sans border-t border-[#291F14]">
                <strong>Bối cảnh thực tại:</strong> Giúp bạn thấu hiểu toàn bộ các lực lượng đang vận hành xung quanh vấn đề hiện tại.
              </div>
            </div>

            {/* 2. HÀO ĐỘNG: NHẬN DIỆN BƯỚC NGOẶT */}
            <div className="p-5 rounded-2xl bg-[#15100B] border border-amber-600/30 space-y-3 flex flex-col justify-between shadow-lg">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-amber-500/20 text-amber-300 font-bold text-xs flex items-center justify-center border border-amber-500/40">
                    2
                  </span>
                  <h4 className="font-bold text-sm text-[#F5EAD4] uppercase font-serif">
                    Hào Động: Nhận Diện Bước Ngoặt
                  </h4>
                </div>
                <div className="text-xs text-amber-400 font-serif font-semibold">
                  {changingLines.length > 0
                    ? `Dịch chuyển qua ${changingLines.length} hào: ${changingLines.map((c) => `Hào ${c}`).join(", ")}`
                    : "Quẻ Tĩnh không có hào động"}
                </div>
                <p className="text-xs text-[#D4C5AE] font-serif leading-relaxed">
                  {changingLines.length > 0
                    ? `Các hào biến động theo thứ tự từ thấp (Sơ hào) lên cao (Lục hào) đóng vai trò là những điểm rơi quyết định. Nắm bắt đúng thời điểm biến chuyển ở từng hào sẽ giúp bạn xoay chuyển tình thế từ bế tắc sang thông suốt.`
                    : `Trường hợp Quẻ Tĩnh biểu thị sự việc đang ở trạng thái ổn định lâu dài. Không nên cưỡng cầu thay đổi mà hãy tập trung hoàn thiện phẩm chất bên trong.`}
                </p>
              </div>
              <div className="pt-2 text-[11px] text-[#A69780] font-sans border-t border-[#291F14]">
                <strong>Trọng tâm hành động:</strong> Chú ý kỹ lời khuyên của các hào động để không phạm sai lầm đáng tiếc.
              </div>
            </div>

            {/* 3. BIẾN QUÁI: THẤU SUỐT TƯƠNG LAI */}
            <div className="p-5 rounded-2xl bg-[#15100B] border border-emerald-600/30 space-y-3 flex flex-col justify-between shadow-lg">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-300 font-bold text-xs flex items-center justify-center border border-emerald-500/40">
                    3
                  </span>
                  <h4 className="font-bold text-sm text-[#F5EAD4] uppercase font-serif">
                    Biến Quái: Thấu Suốt Tương Lai
                  </h4>
                </div>
                <div className="text-xs text-emerald-400 font-serif font-semibold">
                  Quẻ #{transformedHex.number} {transformedHex.name} ({transformedHex.hanzi})
                </div>
                <div className="text-xs text-[#BFAFA0] font-serif italic">
                  Thoán từ: "{transformedHex.judgment}"
                </div>
                <p className="text-xs text-[#D4C5AE] font-serif leading-relaxed">
                  {transformedHex.overview || transformedHex.advice}
                </p>
              </div>
              <div className="pt-2 text-[11px] text-[#A69780] font-sans border-t border-[#291F14]">
                <strong>Kết quả tương lai:</strong> Xu thế phát triển tất yếu sau khi các bước ngoặt được hóa giải thành công.
              </div>
            </div>
          </div>

          {/* C. NÚT ĐIỀU HƯỚNG SANG XEM CHI TIẾT ĐẦY ĐỦ & SAO CHÉP AI */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleCopyForAI}
              className={`!px-5 !py-2.5 text-xs font-bold flex items-center gap-2 shadow-lg cursor-pointer rounded-xl transition ${
                copiedAI
                  ? "bg-emerald-600 text-white border border-emerald-500 scale-[1.02]"
                  : "royal-btn-gold"
              }`}
              title="Sao chép toàn bộ thông tin 3 ngôi (Bản Quái • Hào Động • Biến Quái) gửi AI phân tích"
            >
              {copiedAI ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
              <span>{copiedAI ? "Đã Sao Chép Cho AI!" : "Sao Chép Cho AI"}</span>
            </button>

            {onNavigateToDetail && (
              <button
                type="button"
                onClick={onNavigateToDetail}
                className="royal-btn-gold !px-6 !py-2.5 text-xs font-bold flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>Xem Thuyết Minh Chi Tiết Quẻ & AI Cửu Nhị</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={handleReset}
              className="royal-btn-ghost !px-5 !py-2.5 text-xs flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Gieo Lại Lượt Mới</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal xuất ảnh PNG */}
      {isExportModalOpen && exportDataUrl && (
        <ExportImageModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          imageUrl={exportDataUrl}
          filename={`ThapLaKinhDich_${primaryHex?.number || 0}_${transformedHex?.number || 0}.png`}
        />
      )}
    </div>
  );
};
