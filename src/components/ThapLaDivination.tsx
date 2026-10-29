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
import { HEXAGRAMS, getTransformedHexagram } from "../data/hexagrams";
import { CardVisual } from "./CardVisual";
import { captureElementToPng } from "../utils/captureHelper";
import { ExportImageModal } from "./ExportImageModal";
import { InkWashFilmModal } from "./InkWashFilmModal";
import { InkWashCardInput } from "../utils/inkWashEngine";
import { XuanBaguaStage, JadeCommandPanel, CardTwoSidedModal } from "./XuanBaguaStage";
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

  // Input câu hỏi & chuyên mục (Mặc định mỗi lần vào web sẽ luôn reset về chưa điền chữ)
  const [question, setQuestion] = useState<string>("");
  const [category, setCategory] = useState("Tổng quát");

  const handleQuestionChange = (val: string) => {
    setQuestion(val);
  };

  // Kết quả bốc bài
  const [primaryHex, setPrimaryHex] = useState<Hexagram | null>(null);
  const [transformedHex, setTransformedHex] = useState<Hexagram | null>(null);
  const [changingLines, setChangingLines] = useState<number[]>([]);

  // Sao chép trải bài cho AI
  const [copiedAI, setCopiedAI] = useState(false);

  // Thẻ hào đang được chọn xem sâu
  const [selectedYaoLine, setSelectedYaoLine] = useState<number | null>(null);

  // Soi lá bài 2 mặt
  const [inspectingTwoSidedCard, setInspectingTwoSidedCard] = useState<{
    card: Hexagram;
    positionTitle?: string;
  } | null>(null);

  // Export ảnh modal
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isInkWashModalOpen, setIsInkWashModalOpen] = useState(false);
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

  /**
   * Cơ chế bốc quẻ trận Tháp La Kinh Dịch:
   * 1. Đầu tiên là bốc lá Quẻ Chủ (Bản Quái) từ 64 quẻ.
   * 2. Sau đó AI lựa chọn random động từ 0 đến 6 hào:
   *    - Động 0 hào: Quẻ Biến vẫn là Quẻ Chủ (Quẻ Tĩnh).
   *    - Động 1 hào: Random chọn 1 hào từ Hào 1 đến Hào 6 (Hào Sơ ➔ Hào Lục).
   *    - Các động hào khác (2..6 hào): Random tương tự (chọn ngẫu nhiên các hào không trùng nhau từ 1 đến 6).
   * 3. Tính toán Quẻ Biến tương ứng từ Quẻ Chủ và các hào động.
   */
  const drawThapLaHexagrams = () => {
    // Bước 1: Bốc ngẫu nhiên lá Quẻ Chủ từ 64 quẻ
    const randIdx = Math.floor(Math.random() * HEXAGRAMS.length);
    const pri = HEXAGRAMS[randIdx];

    // Bước 2: AI ngẫu nhiên chọn số lượng hào động từ 0 đến 6 hào
    const numChanging = Math.floor(Math.random() * 7); // 0, 1, 2, 3, 4, 5, 6

    let changes: number[] = [];
    let trans: Hexagram = pri;

    if (numChanging === 0) {
      // Động 0 hào thì Quẻ Biến vẫn là Quẻ Chủ
      changes = [];
      trans = pri;
    } else if (numChanging === 1) {
      // Động 1 hào thì sẽ chọn random từ hào 1 đến hào 6
      const randomLine = Math.floor(Math.random() * 6) + 1; // 1..6
      changes = [randomLine];
      trans = getTransformedHexagram(pri, changes) || pri;
    } else {
      // Các động hào khác (2..6 hào) cũng random tương tự từ hào 1 đến hào 6
      const allLines = [1, 2, 3, 4, 5, 6];
      for (let i = allLines.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allLines[i], allLines[j]] = [allLines[j], allLines[i]];
      }
      changes = allLines.slice(0, numChanging).sort((a, b) => a - b);
      trans = getTransformedHexagram(pri, changes) || pri;
    }

    // Nếu Quẻ Chủ và Quẻ Biến cùng 1 quẻ thì không hiện hào động
    if (pri.number === trans.number) {
      changes = [];
    }

    return { pri, trans, changes, numChanging: changes.length };
  };

  // Khởi quẻ Tháp La Kinh Dịch
  const handleDrawThapLa = () => {
    if (step === "shuffling") return;
    setStep("shuffling");
    zenAudio.playCardShuffleSound();

    setTimeout(() => {
      const { pri, trans, changes, numChanging } = drawThapLaHexagrams();

      setPrimaryHex(pri);
      setTransformedHex(trans);
      setChangingLines(changes);
      setSelectedYaoLine(changes.length > 0 ? changes[0] : null);

      setStep("drawn");
      zenAudio.playCardDrawSound();

      const summaryText = `Tháp La Kinh Dịch: Quẻ Chủ #${pri.number} ${pri.name} → ${
        changes.length === 0
          ? `Quẻ Tĩnh (Không có hào động) ➔ Quẻ Biến giống Quẻ Chủ #${trans.number} ${trans.name}`
          : `AI phân định động ${changes.length} hào (${changes.map((c) => `Hào ${c}`).join(", ")}) ➔ Quẻ Biến #${trans.number} ${trans.name}`
      }`;

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
          numChangingLines: numChanging,
        }
      );

      if (onShowToast) {
        if (changes.length === 0) {
          onShowToast(`Khởi quẻ Tháp La thành công! Quẻ Chủ và Quẻ Biến cùng 1 quẻ #${pri.number} ${pri.name} (Quẻ Tĩnh • Không có hào động).`);
        } else {
          onShowToast(`Khởi quẻ Tháp La thành công! AI chọn động ${changes.length} hào (${changes.map((c) => `Hào ${c}`).join(", ")}).`);
        }
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
      spreadAreaRef.current.setAttribute("data-capturing", "true");
      await new Promise((r) => setTimeout(r, 120));
      const dataUrl = await captureElementToPng(spreadAreaRef.current, {
        backgroundColor: "#120E0A",
        pixelRatio: 2,
        minWidth: 1080,
      });
      setExportDataUrl(dataUrl);
      setIsExportModalOpen(true);
    } catch (err) {
      console.error(err);
      if (onShowToast) onShowToast("Không thể tạo ảnh, vui lòng thử lại!");
    } finally {
      if (spreadAreaRef.current) {
        spreadAreaRef.current.removeAttribute("data-capturing");
      }
      setIsCapturing(false);
    }
  };

  // Sao chép trải bài cho AI theo đúng chuẩn 3 ngôi
  const handleCopyForAI = async () => {
    if (!primaryHex || !transformedHex) return;

    const hasChanging = changingLines.length > 0 && primaryHex.number !== transformedHex.number;
    const cleanedQuestion = question.trim();
    const lines: string[] = [];
    lines.push(`=== BẢNG LUẬN GIẢI THÁP LA KINH DỊCH (周易塔羅) ===`);
    if (cleanedQuestion) {
      lines.push(`【NỘI DUNG TÂM NIỆM / CÂU HỎI CỦA ĐƯƠNG SỐ】:`);
      lines.push(`"${cleanedQuestion}"\n`);
    }
    if (hasChanging) {
      lines.push(`Cấu trúc: Quẻ Chủ & Quẻ Biến song song Trên - Dưới • Dải Hào Động (Bộ 384 Lá) kế bên Quẻ Chủ`);
      lines.push(`Thứ tự đọc chiêm bốc: 1. Bản Quái (Quẻ Chủ) ➔ 2. Hào Động (Bước Ngoặt) ➔ 3. Biến Quái (Quẻ Biến)\n`);
    } else {
      lines.push(`Cấu trúc: Quẻ Chủ & Quẻ Biến cùng 1 quẻ (Quẻ Tĩnh • Không có hào động)`);
      lines.push(`Thứ tự đọc chiêm bốc: 1. Bản Quái (Quẻ Chủ) ➔ 2. Biến Quái (Đồng Quẻ Chủ)\n`);
    }

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

    if (hasChanging) {
      lines.push(`----------------------------------------`);
      lines.push(`【2. HÀO ĐỘNG (BỘ 384 LÁ BÀI HÀO TỪ) — KẾ BÊN QUẺ CHỦ】`);
      lines.push(`• Văn Bản Trọng Tâm: Hào Từ của chính hào biến động`);
      lines.push(`• Ý Nghĩa Thực Tiễn Trong Đời Sống: Lời khuyên then chốt: Trọng tâm hành động và biến số mấu chốt bạn cần lưu tâm`);
      lines.push(`• Số lượng hào biến động: ${changingLines.length} hào (${changingLines.map((c) => `Hào ${c}`).join(", ")})`);
      lines.push("");

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
      lines.push("");
    }

    lines.push(`----------------------------------------`);
    lines.push(`【${hasChanging ? "3" : "2"}. BIẾN QUÁI (QUẺ BIẾN) — LÁ DƯỚI SONG SONG】`);
    if (!hasChanging) {
      lines.push(`• Ghi chú: Quẻ Tĩnh không có hào động, Quẻ Biến giữ nguyên là Quẻ Chủ (#${transformedHex.number} - ${transformedHex.name}).`);
    }
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
    if (cleanedQuestion) {
      lines.push(`▶ Trọng tâm giải đáp: Tập trung luận giải và tháo gỡ dứt khoát câu hỏi/tâm niệm: "${cleanedQuestion}"`);
    }
    if (hasChanging) {
      lines.push(`Xin hãy phân tích trải bài Tháp La Kinh Dịch theo đúng 3 tầng thứ tự và ý nghĩa thực tiễn trong đời sống:`);
      lines.push(`1. BẢN QUÁI (Định vị bối cảnh): Dựa vào Thoán Từ (Quái Từ) và Đại Tượng Truyện, nhận diện bản chất loại hoàn cảnh thực tại đương số đang đối mặt. Cục diện đang ở đâu? Cơ hội và trở lực tiềm ẩn xung quanh là gì?`);
      lines.push(`2. HÀO ĐỘNG (Lời khuyên then chốt): Dựa vào Hào Từ của chính các hào biến động (phân tích tuần tự từ Hào Sơ lên Hào Lục). Đâu là trọng tâm hành động và biến số mấu chốt đương số cần lưu tâm? Chỉ rõ việc nên làm, việc cần tránh và thời điểm chuyển hóa quyết định.`);
      lines.push(`3. BIẾN QUÁI (Định hướng tương lai): Dựa vào Quái Từ của Quẻ Biến, dự báo xu thế phát triển tiếp theo sau khi sự chuyển hóa hoàn tất. Đưa ra chiến lược tổng thể và tâm thế sáng suốt nhất để đương số chủ động kiến tạo cát tường.`);
      if (cleanedQuestion) {
        lines.push(`4. Đúc kết lời đáp trực tiếp cho câu hỏi/tâm niệm của đương số.`);
      }
    } else {
      lines.push(`Xin hãy phân tích trải bài Tháp La Kinh Dịch (Quẻ Tĩnh - Quẻ Chủ và Quẻ Biến cùng 1 quẻ, không có hào động):`);
      lines.push(`1. BẢN QUÁI & BIẾN QUÁI ĐỒNG NHẤT (Định vị bối cảnh & Định hướng tương lai): Dựa vào Thoán Từ (Quái Từ) và Đại Tượng Truyện, phân tích bản chất hoàn cảnh hiện tại và phương châm dĩ bất biến ứng vạn biến.`);
      if (cleanedQuestion) {
        lines.push(`2. Đúc kết lời đáp trực tiếp cho câu hỏi/tâm niệm của đương số.`);
      }
    }

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
      if (onShowToast) {
        onShowToast(
          cleanedQuestion
            ? "Đã sao chép trải bài Tháp La (kèm câu hỏi tâm niệm) cho AI!"
            : "Đã sao chép nội dung trải bài Tháp La chuẩn 3 ngôi cho AI!"
        );
      }
      setTimeout(() => setCopiedAI(false), 2500);
    } catch (err) {
      console.error(err);
      if (onShowToast) onShowToast("Không thể sao chép vào clipboard, vui lòng thử lại!");
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Giới Thiệu Hình Thức Tháp La Kinh Dịch — Ngọc Giản Kính Mờ */}
      <JadeCommandPanel
        title="THÁP LA KINH DỊCH • CHỦ QUÁI, HÀO BIẾN & CHI QUÁI"
        subtitle="Bốc ngẫu nhiên lá Quẻ Chủ (Bản Quái) từ 64 quẻ, sau đó AI phân định từ 0 đến 6 hào động để xác lập Quẻ Biến và dải bài Hào Từ biến dịch"
        badge="塔羅周易"
        rightSlot={
          <div className="flex items-center gap-2 shrink-0">
            {step === "drawn" && (
              <button
                type="button"
                onClick={handleReset}
                className="px-3.5 py-2 rounded-xl text-xs font-serif font-bold bg-[#FFFDF8] text-[#3A2E21] border border-[#C4963E]/55 hover:border-[#9A1F1A] flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#9A1F1A]" />
                <span>Gieo Quẻ Mới</span>
              </button>
            )}
            {step === "drawn" && (
              <button
                type="button"
                onClick={handleExportPng}
                disabled={isCapturing}
                className="px-3.5 py-2 rounded-xl text-xs font-serif font-bold bg-[#9A1F1A] text-[#FFFDF8] border border-[#C4963E] flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Camera className="w-3.5 h-3.5 text-[#E2C275]" />
                <span>{isCapturing ? "Đang chụp..." : "Xuất Ảnh (PNG)"}</span>
              </button>
            )}
            {step === "drawn" && (
              <button
                type="button"
                onClick={() => setIsInkWashModalOpen(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-serif font-bold bg-[#1C1610] text-[#F3E5AB] border border-[#D4AF37] hover:brightness-110 flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span>🖌️</span>
                <span>Phim Thủy Mặc</span>
              </button>
            )}
          </div>
        }
      >
        {/* Khẩu Quyết 3 Ngôi */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#FFFDF8] border border-[#C4963E]/50 flex items-center gap-2.5 shadow-sm">
            <span className="w-7 h-7 rounded-lg bg-[#9A1F1A] text-[#FFFDF8] font-bold flex items-center justify-center shrink-0 border border-[#C4963E]">
              Chủ
            </span>
            <div>
              <div className="font-bold text-[#221A13]">Bản Quái (Quẻ Chủ)</div>
              <div className="text-[11px] text-[#6E5C47] font-sans">Nhìn nhận cục diện thực tại</div>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[#FFFDF8] border border-[#C4963E]/50 flex items-center gap-2.5 shadow-sm">
            <span className="w-7 h-7 rounded-lg bg-[#1C1610] text-[#F3E5AB] font-bold flex items-center justify-center shrink-0 border border-[#C4963E]">
              Động
            </span>
            <div>
              <div className="font-bold text-[#221A13]">Hào Động (Hào Biến)</div>
              <div className="text-[11px] text-[#6E5C47] font-sans">Nhận diện bước ngoặt (Sơ ➔ Lục)</div>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[#FFFDF8] border border-[#C4963E]/50 flex items-center gap-2.5 shadow-sm">
            <span className="w-7 h-7 rounded-lg bg-emerald-800 text-[#FFFDF8] font-bold flex items-center justify-center shrink-0 border border-emerald-600">
              Biến
            </span>
            <div>
              <div className="font-bold text-[#221A13]">Biến Quái (Quẻ Biến)</div>
              <div className="text-[11px] text-[#6E5C47] font-sans">Thấu suốt xu thế tương lai</div>
            </div>
          </div>
        </div>
      </JadeCommandPanel>

      {/* 2. KHU VỰC BỐC BÀI KHI CHƯA RÚT (READY STATE) — Sân Khấu Giấy Tuyên Thành & Tinh Bàn Bát Quái */}
      {step !== "drawn" && (
        <XuanBaguaStage baguaSize="lg" className="text-center space-y-8 max-w-4xl mx-auto">
          {/* Nhập câu hỏi nghi vấn */}
          <div className="relative z-10 max-w-xl mx-auto text-left space-y-2">
            <label className="text-xs font-serif font-bold text-[#7A1C18] tracking-wide uppercase flex items-center gap-1.5">
              <span>Nghi Vấn / Câu Hỏi Cần Chiêm Đoán:</span>
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => handleQuestionChange(e.target.value)}
              placeholder="Ví dụ: Kế hoạch kinh doanh mới trong 3 tháng tới sẽ phát triển ra sao?..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#FFFDF8] border-2 border-[#C4963E]/60 text-sm text-[#221A13] placeholder-[#8C7A64] focus:outline-none focus:border-[#9A1F1A] shadow-sm"
            />
          </div>

          {/* Mô phỏng 2 bước: Bốc Quẻ Chủ & AI Khởi Hào Động */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg mx-auto">
            {/* Bước 1: Quẻ Chủ */}
            <div className="p-5 rounded-2xl bg-[#FAF6EE]/95 border-2 border-[#C4963E]/60 flex flex-col items-center text-center space-y-3 shadow-lg hover:border-[#9A1F1A] transition-colors">
              <span className="px-3 py-0.5 rounded-full bg-[#16120D] border border-[#C4963E]/70 text-[10px] font-serif font-bold text-[#F3E5AB] uppercase tracking-wider">
                Bước 1 • Bốc Quẻ Chủ
              </span>
              <div
                className="w-28 h-42 sm:w-32 sm:h-48 rounded-xl border-2 border-[#C4963E] bg-[#0D0B09] flex items-center justify-center shadow-xl relative overflow-hidden group cursor-pointer"
                onClick={handleDrawThapLa}
              >
                <img
                  src="/assets/cuunhi/13_card_back_huyen_mon.webp"
                  alt="Bản Quái"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0D0B09] via-[#0D0B09]/80 to-transparent py-2 px-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#F3D99B] font-serif">
                    ☯ Bản Quái
                  </span>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-serif font-bold text-[#221A13]">Bốc Lá Quẻ Chủ</h4>
                <p className="text-[11px] text-[#5C4D3C]">Định vị bối cảnh thực tại (64 quẻ)</p>
              </div>
            </div>

            {/* Bước 2: AI Khởi Hào Động */}
            <div className="p-5 rounded-2xl bg-[#FAF6EE]/95 border-2 border-[#C4963E]/60 flex flex-col items-center text-center space-y-3 shadow-lg hover:border-[#9A1F1A] transition-colors">
              <span className="px-3 py-0.5 rounded-full bg-[#9A1F1A] border border-[#C4963E] text-[10px] font-serif font-bold text-[#FFFDF8] uppercase tracking-wider">
                Bước 2 • AI Khởi Hào Động
              </span>
              <div
                className="w-28 h-42 sm:w-32 sm:h-48 rounded-xl border-2 border-[#C4963E] bg-[#0D0B09] flex items-center justify-center shadow-xl relative overflow-hidden group cursor-pointer"
                onClick={handleDrawThapLa}
              >
                <img
                  src="/assets/cuunhi/13_card_back_huyen_mon.webp"
                  alt="0..6 Hào Động"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-emerald-950/20 mix-blend-color pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#08120C] via-[#08120C]/85 to-transparent py-2 px-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 font-serif">
                    ☵ 0..6 Hào Động
                  </span>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-serif font-bold text-[#221A13]">AI Phân Định Hào Biến</h4>
                <p className="text-[11px] text-[#5C4D3C]">Random 0-6 hào để sinh Quẻ Biến</p>
              </div>
            </div>
          </div>

          {/* Nút bấm Khởi Quẻ Tháp La */}
          <div className="relative z-10 pt-2">
            <button
              type="button"
              disabled={step === "shuffling"}
              onClick={handleDrawThapLa}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#9A1F1A] via-[#B3261E] to-[#8C1D18] text-[#FFFDF8] border-2 border-[#E2C275] text-sm sm:text-base font-serif font-bold shadow-[0_6px_22px_rgba(154,31,26,0.35)] cursor-pointer inline-flex items-center gap-2 group transition-all transform hover:scale-[1.02]"
            >
              {step === "shuffling" ? (
                <>
                  <Shuffle className="w-5 h-5 animate-spin text-[#E2C275]" />
                  <span>Đang bốc Quẻ Chủ & AI tính toán hào biến (0 - 6 hào)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-[#E2C275]" />
                  <span>Khởi Quẻ Tháp La (Bốc Quẻ Chủ & AI Khởi Hào Động)</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-[#5C4D3C] mt-2 font-serif">
              Đầu tiên bốc lá Quẻ Chủ, sau đó AI ngẫu nhiên chọn từ 0 đến 6 hào động để xác lập Quẻ Biến.
            </p>
          </div>
        </XuanBaguaStage>
      )}

      {/* 3. KHU VỰC KẾT QUẢ TRẢI BÀI (DRAWN STATE) — Sân Khấu Giấy Tuyên Thành & Tinh Bàn Bát Quái */}
      {step === "drawn" && primaryHex && transformedHex && (
        <div ref={spreadAreaRef} className="space-y-6">
          {/* A. SƠ ĐỒ TRẢI BÀI THÁP LA (SPREAD DIAGRAM) */}
          <XuanBaguaStage baguaSize="xl" className="space-y-6">
            <div className="border-b border-[#C4963E]/40 pb-3 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#9A1F1A]" />
                <h3 className="font-serif font-bold text-sm sm:text-base text-[#7A1C18] uppercase tracking-wide">
                  Sơ Đồ Trải Bài Tháp La Kinh Dịch (Chủ Quái • Hào Biến • Chi Quái)
                </h3>
              </div>
              <span className="text-xs font-serif font-bold text-[#F3E5AB] bg-[#16120D] px-3 py-1 rounded-full border border-[#C4963E]">
                {changingLines.length === 0 || primaryHex.number === transformedHex.number
                  ? "Quẻ Tĩnh • Không Có Hào Động (Quẻ Biến = Quẻ Chủ)"
                  : `AI Động ${changingLines.length} Hào (${changingLines.map((c) => `Hào ${c}`).join(", ")})`}
              </span>
            </div>

            {/* BỐ CỤC CHÍNH: 2 LÁ BÀI SONG SONG TRÊN DƯỚI & KẾ BÊN LÀ DẢI HÀO TỪ THAY ĐỔI */}
            <div className={changingLines.length > 0 && primaryHex.number !== transformedHex.number ? "grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" : "max-w-3xl mx-auto"}>
              {/* CỘT QUẺ CHỦ & QUẺ BIẾN */}
              <div className={`${changingLines.length > 0 && primaryHex.number !== transformedHex.number ? "lg:col-span-4 xl:col-span-4 flex flex-col sm:flex-row lg:flex-col" : "flex flex-col sm:flex-row"} items-center justify-around gap-4 bg-[#FAF6EE]/95 p-4 sm:p-5 rounded-2xl border-2 border-[#C4963E]/60 shadow-lg`}>
                {/* 1. LÁ TRÊN: QUẺ CHỦ (BẢN QUÁI) */}
                <div className="w-full flex flex-col items-center text-center space-y-1.5 sm:space-y-2">
                  <div className="px-3 py-1 rounded-full bg-[#16120D] border border-[#C4963E]/70 shadow-sm">
                    <span className="text-[11px] font-bold text-[#F3E5AB] uppercase font-serif">
                      Lá 1 • Quẻ Chủ (Bản Quái)
                    </span>
                  </div>
                  <span className="text-[11px] text-[#5C4D3C] font-serif italic">
                    "Nhìn nhận cục diện thực tại"
                  </span>

                  <div className="pt-1">
                    <CardVisual
                      hexagram={primaryHex}
                      imageUrl={`/assets/oss/${primaryHex.number}/${primaryHex.number}a.webp`}
                      videoUrl={cardVideos[primaryHex.number]}
                      cardBackUrl={`/assets/oss/${primaryHex.number}/${primaryHex.number}b.webp`}
                      size="md"
                      enableZoomModal={true}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setInspectingTwoSidedCard({
                        card: primaryHex,
                        positionTitle: "Lá 1 • Quẻ Chủ (Bản Quái)",
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9A1F1A] hover:bg-[#7A1C18] text-[#FFFDF8] border border-[#C4963E] text-[10px] font-serif font-bold shadow-sm transition-all cursor-pointer"
                  >
                    <span>Soi 2 Mặt (Quẻ Tượng & Thoán Từ)</span>
                  </button>

                  <div className="pt-1">
                    <div className="text-sm font-bold text-[#221A13] font-serif">
                      #{primaryHex.number} {primaryHex.name} ({primaryHex.hanzi})
                    </div>
                    <div className="text-[11px] text-[#7A1C18] font-serif font-semibold">
                      {primaryHex.upperTrigram} vi Thượng • {primaryHex.lowerTrigram} vi Hạ
                    </div>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#16120D] text-[#F3E5AB] border border-[#C4963E]">
                      {primaryHex.omen}
                    </span>
                  </div>
                </div>

                {/* DÂY CHUYỀN CHUYỂN HÓA SONG SONG TRÊN DƯỚI */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-center gap-1.5 text-xs text-[#7A1C18] py-1 shrink-0">
                  <div className="h-px w-10 sm:h-10 sm:w-px lg:h-px lg:w-10 bg-[#C4963E]" />
                  <div className="flex items-center gap-1 font-serif font-bold text-[11px] text-[#9A1F1A]">
                    <ArrowDown className="sm:hidden lg:inline w-3.5 h-3.5 animate-bounce" />
                    <ArrowRight className="hidden sm:inline lg:hidden w-3.5 h-3.5" />
                    <span>Dịch Chuyển</span>
                  </div>
                  <div className="h-px w-10 sm:h-10 sm:w-px lg:h-px lg:w-10 bg-[#C4963E]" />
                </div>

                {/* 2. LÁ DƯỚI: QUẺ BIẾN (BIẾN QUÁI) */}
                <div className="w-full flex flex-col items-center text-center space-y-1.5 sm:space-y-2">
                  <div className="px-3 py-1 rounded-full bg-[#16120D] border border-emerald-600/70 shadow-sm">
                    <span className="text-[11px] font-bold text-emerald-300 uppercase font-serif">
                      {changingLines.length === 0 || primaryHex.number === transformedHex.number ? "Lá 2 • Quẻ Biến (Đồng Quẻ Chủ)" : "Lá 2 • Quẻ Biến (Biến Quái)"}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#5C4D3C] font-serif italic">
                    {changingLines.length === 0 || primaryHex.number === transformedHex.number ? '"Quẻ Tĩnh — Quẻ biến vẫn là quẻ chủ"' : '"Thấu suốt xu thế tương lai"'}
                  </span>

                  <div className="pt-1">
                    <CardVisual
                      hexagram={transformedHex}
                      imageUrl={`/assets/oss/${transformedHex.number}/${transformedHex.number}a.webp`}
                      videoUrl={cardVideos[transformedHex.number]}
                      cardBackUrl={`/assets/oss/${transformedHex.number}/${transformedHex.number}b.webp`}
                      size="md"
                      enableZoomModal={true}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setInspectingTwoSidedCard({
                        card: transformedHex,
                        positionTitle: "Lá 2 • Quẻ Biến (Biến Quái)",
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9A1F1A] hover:bg-[#7A1C18] text-[#FFFDF8] border border-[#C4963E] text-[10px] font-serif font-bold shadow-sm transition-all cursor-pointer"
                  >
                    <span>Soi 2 Mặt (Quẻ Tượng & Thoán Từ)</span>
                  </button>

                  <div className="pt-1">
                    <div className="text-sm font-bold text-[#221A13] font-serif">
                      #{transformedHex.number} {transformedHex.name} ({transformedHex.hanzi})
                    </div>
                    <div className="text-[11px] text-emerald-800 font-serif font-semibold">
                      {transformedHex.upperTrigram} vi Thượng • {transformedHex.lowerTrigram} vi Hạ
                    </div>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-900 text-emerald-100 border border-emerald-600">
                      {transformedHex.omen}
                    </span>
                  </div>
                </div>
              </div>

              {/* CỘT PHẢI (Lg: 8/12): CHỈ HIỆN KHI CÓ HÀO ĐỘNG VÀ QUẺ CHỦ KHÁC QUẺ BIẾN */}
              {changingLines.length > 0 && primaryHex.number !== transformedHex.number && (
                <div className="lg:col-span-8 xl:col-span-8 space-y-4 bg-[#15110C]/95 p-4 sm:p-5 rounded-2xl border border-[#C4963E]/50 shadow-xl">
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

                  {/* Danh sách các Thẻ Bài Hào Từ Biến Động */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {changingLines.map((lineNum) => {
                      const isYangToYin = primaryHex.lines[lineNum - 1] === 1;
                      const yaoMeta = YAO_POSITION_NAMES[lineNum];
                      const meaningObj = primaryHex.lineMeanings?.find((m) => m.line === lineNum);
                      const isSelected = selectedYaoLine === lineNum;

                      return (
                        <div
                          key={lineNum}
                          onClick={() => setSelectedYaoLine(lineNum)}
                          className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? "bg-[#251B11] border-[#C4963E] shadow-[0_0_15px_rgba(196,150,62,0.25)] ring-1 ring-[#C4963E]/60"
                              : "bg-[#18130D] border-[#302315] hover:border-[#523B23] hover:bg-[#1E1710]"
                          }`}
                        >
                          <div>
                            {/* Header của thẻ hào: Tên Quẻ & Vị Trí Hào */}
                            <div className="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
                              <div className="flex items-center gap-1.5">
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#2C1F12] text-[#E0B861] border border-[#483420]">
                                  {yaoMeta?.title}
                                </span>
                                <span className="text-[10px] font-serif text-[#C4963E] font-medium hidden sm:inline">
                                  #{primaryHex.number} {primaryHex.name}
                                </span>
                              </div>
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

                            {/* Khối Nội Dung Thẻ Bài: Lá Bài Ảnh Bên Trái + Chi Tiết Bên Phải */}
                            <div className="flex gap-3 sm:gap-3.5 items-start">
                              {/* Hình lá bài Hào Từ Chu Dịch chuẩn 384 hào */}
                              <div className="w-16 sm:w-20 md:w-22 shrink-0 rounded-xl overflow-hidden border border-[#C4963E]/40 shadow-md bg-stone-950 aspect-[5/8] relative group">
                                <img
                                  src={`/assets/oss/${primaryHex.number}/${primaryHex.number}-${lineNum}a.webp`}
                                  alt={`Quẻ ${primaryHex.name} Hào ${lineNum}`}
                                  className="w-full h-full object-cover select-none"
                                  loading="lazy"
                                  onError={(e) => {
                                    const target = e.currentTarget;
                                    target.onerror = null;
                                    target.src = `/assets/oss/${primaryHex.number}/${primaryHex.number}a.webp`;
                                  }}
                                />
                                <div className="absolute inset-0 border border-[#C4963E]/20 pointer-events-none rounded-xl" />
                                <div className="absolute bottom-0 inset-x-0 bg-black/85 px-1 py-0.5 text-center">
                                  <span className="text-[9px] font-serif font-bold text-amber-200">
                                    Hào {lineNum}
                                  </span>
                                </div>
                              </div>

                              {/* Thông tin Hào & Hào Từ */}
                              <div className="flex-1 min-w-0 space-y-1">
                                <h5 className="text-xs sm:text-sm font-bold text-[#F5EAD4] font-serif leading-snug">
                                  {meaningObj?.name || `Hào ${lineNum}`}: {meaningObj?.text || "Chuyển hóa"}
                                </h5>

                                <p className="text-[10.5px] sm:text-[11px] text-[#C4963E] font-medium font-serif">
                                  {yaoMeta?.subtitle}
                                </p>

                                <p className="text-[11px] sm:text-xs text-[#C2B299] font-serif leading-relaxed line-clamp-3">
                                  {meaningObj?.meaning || yaoMeta?.essence}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Footer thẻ */}
                          <div className="mt-3 pt-2 border-t border-[#2A1E12] flex items-center justify-between text-[10.5px] sm:text-[11px]">
                            <span className="text-[#8C7D6A] font-sans truncate mr-2">
                              {isYangToYin ? "Lão Dương Động Hóa Âm" : "Lão Âm Động Hóa Dương"}
                            </span>
                            <span className="text-[#C4963E] font-semibold flex items-center gap-1 shrink-0">
                              <span>Xem chi tiết</span>
                              <ChevronRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Chi Tiết Hào Động Được Chọn (Detail Box) */}
                  {selectedYaoLine && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#1F1710] border border-[#C4963E]/50 space-y-3 mt-4 shadow-lg">
                      <div className="flex items-center justify-between border-b border-[#302316] pb-2">
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

                      <div className="flex flex-col sm:flex-row gap-4 items-start pt-1">
                        {/* Ảnh thẻ bài Hào Từ lớn trong kho Bách Khoa Hexagram */}
                        <div className="w-20 sm:w-24 shrink-0 rounded-xl overflow-hidden border border-[#C4963E]/50 shadow-lg bg-black aspect-[5/8] mx-auto sm:mx-0">
                          <img
                            src={`/assets/oss/${primaryHex.number}/${primaryHex.number}-${selectedYaoLine}a.webp`}
                            alt={`Hào ${selectedYaoLine} Quẻ ${primaryHex.name}`}
                            className="w-full h-full object-contain select-none"
                            loading="lazy"
                            onError={(e) => {
                              const target = e.currentTarget;
                              target.onerror = null;
                              target.src = `/assets/oss/${primaryHex.number}/${primaryHex.number}a.webp`;
                            }}
                          />
                        </div>

                        <div className="flex-1 space-y-2">
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
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </XuanBaguaStage>

          {/* B. BỘ BA LUẬN GIẢI TRIẾT LÝ (ẨN HÀO ĐỘNG KHI QUẺ CHỦ = QUẺ BIẾN) */}
          <div className={`grid grid-cols-1 ${changingLines.length > 0 && primaryHex.number !== transformedHex.number ? "md:grid-cols-3" : "md:grid-cols-2"} gap-4`}>
            {/* 1. BẢN QUÁI: NHÌN NHẬN CỤC DIỆN */}
            <div className="p-5 rounded-2xl bg-[#FAF6EE] border-2 border-[#C4963E]/55 space-y-3 flex flex-col justify-between shadow-lg">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-[#9A1F1A] text-[#FFFDF8] font-bold text-xs flex items-center justify-center border border-[#C4963E]">
                    1
                  </span>
                  <h4 className="font-bold text-sm text-[#221A13] uppercase font-serif">
                    Bản Quái: Nhìn Nhận Cục Diện
                  </h4>
                </div>
                <div className="text-xs text-[#7A1C18] font-serif font-bold">
                  Quẻ #{primaryHex.number} {primaryHex.name} ({primaryHex.hanzi})
                </div>
                <div className="text-xs text-[#5C4D3C] font-serif italic">
                  Thoán từ: "{primaryHex.judgment}"
                </div>
                <p className="text-xs text-[#3A2E21] font-serif leading-relaxed">
                  {primaryHex.overview || primaryHex.advice}
                </p>
              </div>
              <div className="pt-2 text-[11px] text-[#6E5C47] font-sans border-t border-[#C4963E]/35">
                <strong>Bối cảnh thực tại:</strong> Giúp bạn thấu hiểu toàn bộ các lực lượng đang vận hành xung quanh vấn đề hiện tại.
              </div>
            </div>

            {/* 2. HÀO ĐỘNG: NHẬN DIỆN BƯỚC NGOẶT (CHỈ HIỆN KHI CÓ HÀO ĐỘNG VÀ QUẺ CHỦ KHÁC QUẺ BIẾN) */}
            {changingLines.length > 0 && primaryHex.number !== transformedHex.number && (
              <div className="p-5 rounded-2xl bg-[#FAF6EE] border-2 border-[#C4963E]/55 space-y-3 flex flex-col justify-between shadow-lg">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-[#16120D] text-[#F3E5AB] font-bold text-xs flex items-center justify-center border border-[#C4963E]">
                      2
                    </span>
                    <h4 className="font-bold text-sm text-[#221A13] uppercase font-serif">
                      Hào Động: Nhận Diện Bước Ngoặt
                    </h4>
                  </div>
                  <div className="text-xs text-[#9A1F1A] font-serif font-bold">
                    {`Dịch chuyển qua ${changingLines.length} hào: ${changingLines.map((c) => `Hào ${c}`).join(", ")}`}
                  </div>
                  <p className="text-xs text-[#3A2E21] font-serif leading-relaxed">
                    Các hào biến động theo thứ tự từ thấp (Sơ hào) lên cao (Lục hào) đóng vai trò là những điểm rơi quyết định. Nắm bắt đúng thời điểm biến chuyển ở từng hào sẽ giúp bạn xoay chuyển tình thế từ bế tắc sang thông suốt.
                  </p>
                </div>
                <div className="pt-2 text-[11px] text-[#6E5C47] font-sans border-t border-[#C4963E]/35">
                  <strong>Trọng tâm hành động:</strong> Chú ý kỹ lời khuyên của các hào động để không phạm sai lầm đáng tiếc.
                </div>
              </div>
            )}

            {/* 3. BIẾN QUÁI: THẤU SUỐT TƯƠNG LAI */}
            <div className="p-5 rounded-2xl bg-[#FAF6EE] border-2 border-[#C4963E]/55 space-y-3 flex flex-col justify-between shadow-lg">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-emerald-800 text-[#FFFDF8] font-bold text-xs flex items-center justify-center border border-emerald-600">
                    {changingLines.length > 0 && primaryHex.number !== transformedHex.number ? "3" : "2"}
                  </span>
                  <h4 className="font-bold text-sm text-[#221A13] uppercase font-serif">
                    {changingLines.length === 0 || primaryHex.number === transformedHex.number ? "Biến Quái: Đồng Quẻ Chủ (Tĩnh)" : "Biến Quái: Thấu Suốt Tương Lai"}
                  </h4>
                </div>
                <div className="text-xs text-emerald-800 font-serif font-bold">
                  Quẻ #{transformedHex.number} {transformedHex.name} ({transformedHex.hanzi})
                </div>
                <div className="text-xs text-[#5C4D3C] font-serif italic">
                  Thoán từ: "{transformedHex.judgment}"
                </div>
                <p className="text-xs text-[#3A2E21] font-serif leading-relaxed">
                  {transformedHex.overview || transformedHex.advice}
                </p>
              </div>
              <div className="pt-2 text-[11px] text-[#6E5C47] font-sans border-t border-[#C4963E]/35">
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
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#9A1F1A] via-[#B3261E] to-[#8C1D18] text-[#FFFDF8] border-2 border-[#E2C275] text-xs font-serif font-bold flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-[#E2C275]" />
                <span>☯ Vào Xem Thuyết Minh Chi Tiết Quẻ & 6 Hào</span>
                <ArrowRight className="w-4 h-4 text-[#E2C275]" />
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

      {/* Modal Soi Lá Bài 2 Mặt */}
      <CardTwoSidedModal
        isOpen={Boolean(inspectingTwoSidedCard)}
        onClose={() => setInspectingTwoSidedCard(null)}
        hexagram={inspectingTwoSidedCard?.card || null}
        positionTitle={inspectingTwoSidedCard?.positionTitle}
        onOpenFullDetail={onNavigateToDetail}
      />

      {/* Modal Xưởng Phim Thủy Mặc Chu Dịch */}
      {primaryHex && transformedHex && (
        <InkWashFilmModal
          isOpen={isInkWashModalOpen}
          onClose={() => setIsInkWashModalOpen(false)}
          spreadMode="thap_la"
          question={question}
          onTriggerCopyAllForAI={async () => {
            await handleCopyForAI();
          }}
          cards={([
            {
              id: `thapla-pri-${primaryHex.number}`,
              type: "hexagram",
              hexNumber: primaryHex.number,
              symbol: primaryHex.symbol,
              hanzi: primaryHex.hanzi,
              name: `Quẻ Chủ: ${primaryHex.name}`,
              sub: `Bản Quái (#${primaryHex.number})`,
              desc: primaryHex.overview || primaryHex.judgment,
              img: `/assets/oss/${primaryHex.number}/${primaryHex.number}a.webp`,
              positionLabel: "Quẻ Chủ (Bản Quái)",
            },
            {
              id: `thapla-trans-${transformedHex.number}`,
              type: "hexagram",
              hexNumber: transformedHex.number,
              symbol: transformedHex.symbol,
              hanzi: transformedHex.hanzi,
              name: `Quẻ Biến: ${transformedHex.name}`,
              sub: `Biến Quái (#${transformedHex.number})`,
              desc: transformedHex.overview || transformedHex.judgment,
              img: `/assets/oss/${transformedHex.number}/${transformedHex.number}a.webp`,
              positionLabel: "Quẻ Biến (Biến Quái)",
            },
            ...changingLines.map((ln) => {
              const lm = primaryHex.lineMeanings?.find((m) => m.line === ln);
              return {
                id: `thapla-yao-${primaryHex.number}-${ln}`,
                type: "yao" as const,
                hexNumber: primaryHex.number,
                yaoNumber: ln,
                symbol: primaryHex.symbol,
                hanzi: lm?.name || `Hào ${ln}`,
                name: `Hào ${ln}: ${primaryHex.name} · ${lm?.name || ""}`,
                sub: `Hào Động ${ln}`,
                desc: lm?.meaning || lm?.text || "",
                img: `/assets/oss/${primaryHex.number}/${primaryHex.number}-${ln}a.webp`,
                positionLabel: `Hào Động ${ln}`,
              };
            }),
          ]) as InkWashCardInput[]}
        />
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
