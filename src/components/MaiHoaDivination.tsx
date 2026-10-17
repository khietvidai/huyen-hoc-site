import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Clock,
  Hash,
  Type,
  ArrowRight,
  RotateCw,
  CheckCircle2,
  BookOpen,
  Flower2,
  ShieldAlert,
  Flame,
  X,
  HelpCircle,
  Layers,
  Info,
  Camera,
  Loader2,
  Download,
} from "lucide-react";
import { Hexagram } from "../types";
import { findHexagramByLines, getTransformedHexagram } from "../data/hexagrams";
import { zenAudio } from "../utils/zenAudio";
import { captureElementToPng } from "../utils/captureHelper";
import { ExportImageModal } from "./ExportImageModal";

interface MaiHoaDivinationProps {
  onComplete: (primary: Hexagram, changingLines: number[], transformed?: Hexagram, summary?: string) => void;
  onReset?: () => void;
}

// Tiên Thiên Bát Quái chi số (Thiệu Khang Tiết - Mai Hoa Dịch Số)
export interface TrigramData {
  number: number; // 1 to 8
  name: string;
  hanzi: string;
  symbol: string;
  element: "Kim" | "Mộc" | "Thủy" | "Hỏa" | "Thổ";
  nature: string;
  lines: [number, number, number]; // 1 = Dương ⚊, 0 = Âm ⚋ (từ hào 1 dưới lên hào 3 trên)
}

export const TIEN_THIEN_BAT_QUAI: Record<number, TrigramData> = {
  1: { number: 1, name: "Càn", hanzi: "乾", symbol: "☰", element: "Kim", nature: "Trời (Thiên)", lines: [1, 1, 1] },
  2: { number: 2, name: "Đoài", hanzi: "兌", symbol: "☱", element: "Kim", nature: "Đầm (Trạch)", lines: [1, 1, 0] },
  3: { number: 3, name: "Ly", hanzi: "離", symbol: "☲", element: "Hỏa", nature: "Lửa (Hỏa)", lines: [1, 0, 1] },
  4: { number: 4, name: "Chấn", hanzi: "震", symbol: "☳", element: "Mộc", nature: "Sấm (Lôi)", lines: [1, 0, 0] },
  5: { number: 5, name: "Tốn", hanzi: "巽", symbol: "☴", element: "Mộc", nature: "Gió (Phong)", lines: [0, 1, 1] },
  6: { number: 6, name: "Khảm", hanzi: "坎", symbol: "☵", element: "Thủy", nature: "Nước (Thủy)", lines: [0, 1, 0] },
  7: { number: 7, name: "Cấn", hanzi: "艮", symbol: "☶", element: "Thổ", nature: "Núi (Sơn)", lines: [0, 0, 1] },
  8: { number: 8, name: "Khôn", hanzi: "坤", symbol: "☷", element: "Thổ", nature: "Đất (Địa)", lines: [0, 0, 0] },
};

// 12 Địa Chi theo giờ âm lịch
const DIA_CHI_GIO = [
  { chi: "Tý", num: 1, hourRange: "23h - 01h" },
  { chi: "Sửu", num: 2, hourRange: "01h - 03h" },
  { chi: "Dần", num: 3, hourRange: "03h - 05h" },
  { chi: "Mão", num: 4, hourRange: "05h - 07h" },
  { chi: "Thìn", num: 5, hourRange: "07h - 09h" },
  { chi: "Tỵ", num: 6, hourRange: "09h - 11h" },
  { chi: "Ngọ", num: 7, hourRange: "11h - 13h" },
  { chi: "Mùi", num: 8, hourRange: "13h - 15h" },
  { chi: "Thân", num: 9, hourRange: "15h - 17h" },
  { chi: "Dậu", num: 10, hourRange: "17h - 19h" },
  { chi: "Tuất", num: 11, hourRange: "19h - 21h" },
  { chi: "Hợi", num: 12, hourRange: "21h - 23h" },
];

export interface MaiHoaCastResult {
  primaryHex: Hexagram;
  hoHex: Hexagram;
  transformedHex: Hexagram;
  changingLine: number; // 1..6
  upperTrigram: TrigramData;
  lowerTrigram: TrigramData;
  isLowerThe: boolean; // true nếu Hạ quái là Thể, false nếu Thượng quái là Thể
  theTrigram: TrigramData;
  dungTrigram: TrigramData;
  relation: string; // Dụng sinh Thể, Thể Dụng Tỷ Hòa, etc.
  verdict: string; // Đại Cát, Cát, Thứ Cát, Hao Tổn, Hung
  meaning: string;
  badgeColor: string;
  methodLabel: string;
  methodDetail: string;
}

function analyzeTheDung(theElement: string, dungElement: string) {
  if (theElement === dungElement) {
    return {
      relation: "Thể Dụng Tỷ Hòa (比和)",
      verdict: "Cát • Hòa Hợp Vững Bền",
      meaning: "Thể và Dụng cùng ngũ hành tương đồng. Việc hỏi thuận hòa, bạn bè đồng chí cùng chung chí hướng, tự thân vững chắc, gia đạo an vui.",
      badgeColor: "bg-emerald-950/80 text-emerald-300 border-emerald-700/60",
    };
  }
  // Dụng sinh Thể
  if (
    (dungElement === "Kim" && theElement === "Thủy") ||
    (dungElement === "Thủy" && theElement === "Mộc") ||
    (dungElement === "Mộc" && theElement === "Hỏa") ||
    (dungElement === "Hỏa" && theElement === "Thổ") ||
    (dungElement === "Thổ" && theElement === "Kim")
  ) {
    return {
      relation: "Dụng Sinh Thể (用生體)",
      verdict: "Đại Cát • Được Quý Nhân & Hưởng Lợi",
      meaning: "Ngoại cảnh và sự việc sinh trợ cho bản thân. Có quý nhân phù trợ, cầu tài đắc tài, mưu sự dễ thành, như hoa gặp mưa xuân.",
      badgeColor: "bg-amber-950/80 text-[#E6D3A3] border-[#C9A55A]",
    };
  }
  // Thể khắc Dụng
  if (
    (theElement === "Kim" && dungElement === "Mộc") ||
    (theElement === "Mộc" && dungElement === "Thổ") ||
    (theElement === "Thổ" && dungElement === "Thủy") ||
    (theElement === "Thủy" && dungElement === "Hỏa") ||
    (theElement === "Hỏa" && dungElement === "Kim")
  ) {
    return {
      relation: "Thể Khắc Dụng (體剋用)",
      verdict: "Thứ Cát • Gian Nan Thành Công",
      meaning: "Bản thân có đủ thực lực và ý chí để chế ngự hoàn cảnh, khắc phục khó khăn. Lúc đầu tuy vất vả nhưng sau cùng ắt làm chủ và chiến thắng.",
      badgeColor: "bg-blue-950/80 text-sky-300 border-blue-700/60",
    };
  }
  // Thể sinh Dụng
  if (
    (theElement === "Kim" && dungElement === "Thủy") ||
    (theElement === "Thủy" && dungElement === "Mộc") ||
    (theElement === "Mộc" && dungElement === "Hỏa") ||
    (theElement === "Hỏa" && dungElement === "Thổ") ||
    (theElement === "Thổ" && dungElement === "Kim")
  ) {
    return {
      relation: "Thể Sinh Dụng (體生用)",
      verdict: "Tiết Khí • Hao Tài Tổn Lực",
      meaning: "Bản thân phải hy sinh, dốc nhiều tâm lực hoặc tiền của cho việc hỏi mà thu về ít. Nên biết điểm dừng, chớ làm việc quá sức mình.",
      badgeColor: "bg-orange-950/80 text-amber-300 border-orange-700/60",
    };
  }
  // Dụng khắc Thể
  return {
    relation: "Dụng Khắc Thể (用剋體)",
    verdict: "Hung • Gặp Trở Lực Lớn",
    meaning: "Ngoại cảnh chèn ép, hoàn cảnh khách quan bất lợi, dễ bị người khác cản trở. Nên án binh bất động, giữ tâm thanh tịnh, chớ mạo hiểm tiến tới.",
    badgeColor: "bg-rose-950/80 text-rose-300 border-rose-700/60",
  };
}

export const MaiHoaDivination: React.FC<MaiHoaDivinationProps> = ({
  onComplete,
  onReset,
}) => {
  // Method tab: "time" (Niên nguyệt nhật thời), "number" (Đoán số), "word" (Trắc tự), "blossom" (Mai hoa lạc cầm)
  const [activeTab, setActiveTab] = useState<"time" | "number" | "word" | "blossom">("time");

  // Inputs
  const [num1, setNum1] = useState<string>("");
  const [num2, setNum2] = useState<string>("");
  const [num3, setNum3] = useState<string>("");
  const [customWord, setCustomWord] = useState<string>("");

  // Result state
  const [result, setResult] = useState<MaiHoaCastResult | null>(null);
  const [isCasting, setIsCasting] = useState<boolean>(false);
  const [showTheory, setShowTheory] = useState<boolean>(false);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);

  // Chụp hình Quẻ Mai Hoa ban đầu & Toàn bộ trận quẻ
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [exportModalOpen, setExportModalOpen] = useState<boolean>(false);
  const [exportedImageUrl, setExportedImageUrl] = useState<string | null>(null);
  const [exportModalTitle, setExportModalTitle] = useState<string>("Ảnh Quẻ Hoa Mai Ban Đầu");
  const [exportModalFilename, setExportModalFilename] = useState<string>("que-hoa-mai-ban-dau.png");

  const fullResultCaptureRef = useRef<HTMLDivElement>(null);
  const primaryHexCaptureRef = useRef<HTMLDivElement>(null);

  // Close guide modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showGuideModal) {
        setShowGuideModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showGuideModal]);

  // Core Mai Hoa Hexagram calculation from upper number, lower number, and dong line number
  const computeMaiHoa = (
    upperVal: number,
    lowerVal: number,
    dongVal: number,
    methodLabel: string,
    methodDetail: string
  ) => {
    setIsCasting(true);
    zenAudio.playCardDrawSound();

    setTimeout(() => {
      // 1. Thượng quái: chia 8 lấy số dư, dư 0 là 8 (Khôn)
      const upperRem = upperVal % 8 === 0 ? 8 : upperVal % 8;
      // 2. Hạ quái: chia 8 lấy số dư, dư 0 là 8 (Khôn)
      const lowerRem = lowerVal % 8 === 0 ? 8 : lowerVal % 8;
      // 3. Hào động: chia 6 lấy số dư, dư 0 là 6 (Hào Thượng)
      const dongRem = dongVal % 6 === 0 ? 6 : dongVal % 6;

      const upperTri = TIEN_THIEN_BAT_QUAI[upperRem];
      const lowerTri = TIEN_THIEN_BAT_QUAI[lowerRem];

      // Lines of primary hexagram (from line 1 at bottom to line 6 at top)
      const primaryLines: [number, number, number, number, number, number] = [
        lowerTri.lines[0],
        lowerTri.lines[1],
        lowerTri.lines[2],
        upperTri.lines[0],
        upperTri.lines[1],
        upperTri.lines[2],
      ];

      const primaryHex = findHexagramByLines(primaryLines);
      const transformedHex = getTransformedHexagram(primaryHex, [dongRem]) || primaryHex;

      // 4. Quẻ Hổ (Hổ Quái - Tương Quái):
      // Hạ quái quẻ Hổ = hào 2, 3, 4
      // Thượng quái quẻ Hổ = hào 3, 4, 5
      const hoLines: [number, number, number, number, number, number] = [
        primaryLines[1], // Hào 2
        primaryLines[2], // Hào 3
        primaryLines[3], // Hào 4
        primaryLines[2], // Hào 3
        primaryLines[3], // Hào 4
        primaryLines[4], // Hào 5
      ];
      const hoHex = findHexagramByLines(hoLines);

      // 5. Phân định Thể - Dụng:
      // Nếu hào động 1..3: Hạ quái có hào động => Hạ quái là DỤNG, Thượng quái là THỂ
      // Nếu hào động 4..6: Thượng quái có hào động => Thượng quái là DỤNG, Hạ quái là THỂ
      const isLowerThe = dongRem >= 4;
      const theTrigram = isLowerThe ? lowerTri : upperTri;
      const dungTrigram = isLowerThe ? upperTri : lowerTri;

      // 6. Ngũ hành Thể Dụng sinh khắc
      const theDungAnalysis = analyzeTheDung(theTrigram.element, dungTrigram.element);

      const castResult: MaiHoaCastResult = {
        primaryHex,
        hoHex,
        transformedHex,
        changingLine: dongRem,
        upperTrigram: upperTri,
        lowerTrigram: lowerTri,
        isLowerThe,
        theTrigram,
        dungTrigram,
        relation: theDungAnalysis.relation,
        verdict: theDungAnalysis.verdict,
        meaning: theDungAnalysis.meaning,
        badgeColor: theDungAnalysis.badgeColor,
        methodLabel,
        methodDetail,
      };

      setResult(castResult);
      setIsCasting(false);
      zenAudio.strikeSingingBowl(324, 0.75);
    }, 450);
  };

  // 1. Khởi quẻ theo Niên Nguyệt Nhật Thời (Thời khắc hiện tại)
  const handleCastByCurrentTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const hour = now.getHours();
    const minute = now.getMinutes();

    // Địa chi năm: (Năm - 3) % 12 (ví dụ 2024 - Giáp Thìn -> Thìn = 5)
    const yearBranchIndex = ((year - 3) % 12 === 0 ? 12 : (year - 3) % 12);
    // Địa chi giờ
    const hourBranchIndex = Math.floor(((hour + 1) % 24) / 2) + 1;
    const hourName = DIA_CHI_GIO.find((g) => g.num === hourBranchIndex)?.chi || "Tý";

    // Công thức Mai Hoa:
    // Thượng quái: (Năm + Tháng + Ngày)
    const upperSum = yearBranchIndex + month + day;
    // Hạ quái: (Năm + Tháng + Ngày + Giờ)
    const lowerSum = upperSum + hourBranchIndex;
    // Hào động: (Năm + Tháng + Ngày + Giờ)
    const dongSum = lowerSum;

    computeMaiHoa(
      upperSum,
      lowerSum,
      dongSum,
      `Khởi Quẻ Theo Thời Khắc: ${day}/${month}/${year} (Giờ ${hourName})`,
      `Năm chi ${yearBranchIndex} + Tháng ${month} + Ngày ${day} = ${upperSum} (Thượng); + Giờ ${hourBranchIndex} = ${lowerSum} (Hạ & Động)`
    );
  };

  // 2. Khởi quẻ theo Số Tùy Tâm
  const handleCastByNumbers = (e: React.FormEvent) => {
    e.preventDefault();
    const v1 = parseInt(num1) || Math.floor(Math.random() * 888) + 111;
    const v2 = parseInt(num2) || Math.floor(Math.random() * 888) + 111;
    const v3 = parseInt(num3) || Math.floor(Math.random() * 888) + 111;

    computeMaiHoa(
      v1,
      v2,
      v1 + v2 + v3,
      `Khởi Quẻ Theo Số Tùy Tâm: [${v1}, ${v2}, ${v3}]`,
      `Số Thượng: ${v1} • Số Hạ: ${v2} • Tổng động (${v1} + ${v2} + ${v3}) = ${v1 + v2 + v3}`
    );
  };

  // Lắc 3 con số ngẫu nhiên
  const handleRandomizeNumbers = () => {
    const r1 = Math.floor(Math.random() * 888) + 100;
    const r2 = Math.floor(Math.random() * 888) + 100;
    const r3 = Math.floor(Math.random() * 888) + 100;
    setNum1(String(r1));
    setNum2(String(r2));
    setNum3(String(r3));
    zenAudio.playCardDrawSound();
  };

  // 3. Khởi quẻ theo Chữ (Trắc Tự)
  const handleCastByWord = (e: React.FormEvent) => {
    e.preventDefault();
    const word = customWord.trim() || "Bình An";
    const chars = Array.from(word);
    const totalChars = chars.length;

    let upperVal = 0;
    let lowerVal = 0;

    if (totalChars === 1) {
      // 1 ký tự: dùng mã ký tự
      const code = word.charCodeAt(0);
      upperVal = Math.floor(code / 10);
      lowerVal = code % 100;
    } else {
      // Chia đôi chữ
      const half = Math.ceil(totalChars / 2);
      upperVal = chars.slice(0, half).reduce((sum, c) => sum + c.charCodeAt(0), 0);
      lowerVal = chars.slice(half).reduce((sum, c) => sum + c.charCodeAt(0), 0);
    }

    const dongVal = upperVal + lowerVal;

    computeMaiHoa(
      upperVal,
      lowerVal,
      dongVal,
      `Khởi Quẻ Trắc Tự: “${word}”`,
      `Chữ gồm ${totalChars} ký tự • Nửa đầu (${upperVal}) • Nửa sau (${lowerVal})`
    );
  };

  // 4. Khởi quẻ Mai Hoa Lạc Cầm (Gieo cánh hoa mai rơi)
  const handleCastByBlossom = () => {
    const petals1 = Math.floor(Math.random() * 8) + 1; // 1..8
    const petals2 = Math.floor(Math.random() * 8) + 1; // 1..8
    const windForce = Math.floor(Math.random() * 6) + 1; // 1..6

    computeMaiHoa(
      petals1,
      petals2,
      petals1 + petals2 + windForce,
      `Mai Hoa Lạc Cầm (Cánh Hoa Rơi Trong Gió)`,
      `Bông hoa rụng ${petals1} cánh (Thượng) • ${petals2} cánh (Hạ) • Ngọn gió cấp ${windForce}`
    );
  };

  // Reset to cast new hexagram
  const handleResetInternal = () => {
    setResult(null);
    setNum1("");
    setNum2("");
    setNum3("");
    setCustomWord("");
    if (onReset) onReset();
  };

  // Proceed to full reading app interpretation
  const handleProceedToInterpretation = () => {
    if (!result) return;
    zenAudio.strikeSingingBowl(324, 0.75);

    const summary =
      `Mai Hoa Dịch Số: Quẻ Chủ #${result.primaryHex.number} ${result.primaryHex.name} ` +
      `(Hào ${result.changingLine} động) ➔ Biến Quẻ #${result.transformedHex.number} ${result.transformedHex.name} ` +
      `[Thể: ${result.theTrigram.name} (${result.theTrigram.element}) - Dụng: ${result.dungTrigram.name} (${result.dungTrigram.element}) ➔ ${result.relation}: ${result.verdict}]`;

    onComplete(result.primaryHex, [result.changingLine], result.transformedHex, summary);
  };

  // Hàm chụp hình Quẻ Hoa Mai ban đầu (Quẻ Chủ / Bản Quái) hoặc Toàn bộ trận quẻ Mai Hoa
  const handleCaptureMaiHoa = async (target: "primary" | "full" = "primary") => {
    if (isCapturing || !result) return;
    try {
      setIsCapturing(true);
      zenAudio.playCardDrawChime();

      // Đợi render ổn định
      await new Promise((resolve) => setTimeout(resolve, 160));

      const targetEl = target === "primary" ? primaryHexCaptureRef.current : fullResultCaptureRef.current;
      if (!targetEl) return;

      const dateStr = new Date().toISOString().slice(0, 10);
      const cleanHexName = result.primaryHex.name.replace(/[^a-zA-Z0-9\u00C0-\u1EF9]/g, "-").toLowerCase();

      const title =
        target === "primary"
          ? `Quẻ Hoa Mai Ban Đầu: Quẻ #${result.primaryHex.number} ${result.primaryHex.name}`
          : `Trận Quẻ Mai Hoa Dịch Số: #${result.primaryHex.number} ${result.primaryHex.name} ➔ #${result.transformedHex.number} ${result.transformedHex.name}`;

      const filename =
        target === "primary"
          ? `que-hoa-mai-ban-dau-${result.primaryHex.number}-${cleanHexName}-${dateStr}.png`
          : `mai-hoa-dich-so-toan-que-${result.primaryHex.number}-${cleanHexName}-${dateStr}.png`;

      const dataUrl = await captureElementToPng(targetEl, {
        backgroundColor: "#16120E",
        pixelRatio: 2,
      });

      setExportedImageUrl(dataUrl);
      setExportModalTitle(title);
      setExportModalFilename(filename);
      setExportModalOpen(true);
      zenAudio.strikeSingingBowl(440, 0.6);
    } catch (err) {
      console.error("Lỗi khi chụp hình quẻ Mai Hoa:", err);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#16120E] border border-[#483723] rounded-2xl p-4 sm:p-6 shadow-2xl relative">
      {/* Decorative Border Accent */}
      <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#C9A55A]/60 pointer-events-none" />
      <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#C9A55A]/60 pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#C9A55A]/60 pointer-events-none" />
      <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#C9A55A]/60 pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2F2215] pb-4 mb-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#C9A55A] bg-[#261C12] px-2 py-0.5 rounded border border-[#3E2E1D]">
              Tống Triều • Thiệu Khang Tiết (邵康節)
            </span>
            <span className="text-[10px] font-mono font-bold text-rose-300 bg-[#291316] border border-rose-800/60 px-2.5 py-0.5 rounded shadow-xs">
              🌸 Mai Hoa Tâm Dịch (梅花易數)
            </span>
            <span className="text-[10px] font-mono text-[#A89882] bg-[#1C1712] px-2 py-0.5 rounded">
              Tâm Động Sinh Quái • Vạn Vật Hữu Số
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-serif font-bold text-[#F5EAD4] mt-1 flex items-center gap-2">
            <span>🌸</span> Phép Thỉnh Quẻ Mai Hoa Dịch Số
          </h3>
          <p className="text-xs text-[#9E907D] mt-0.5 max-w-xl">
            Phương pháp chiêm quẻ huyền diệu bậc nhất Trung Hoa do Thiệu Ung (Thiệu Khang Tiết) sáng lập. Khởi quẻ tức thì bằng thời khắc, con số, chữ viết hay hoa cỏ thiên nhiên, luận định Cát Hung sâu sắc qua thuyết <strong className="text-[#E6D3A3]">Thể - Dụng Ngũ Hành</strong> sinh khắc.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap no-capture">
          <button
            type="button"
            onClick={() => setShowGuideModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs text-[#E6D3A3] hover:brightness-115 bg-gradient-to-r from-[#2A1B0E] via-[#3E2614] to-[#2A1B0E] hover:border-[#C9A55A] rounded-lg border border-[#6E4922] transition-all cursor-pointer shadow active:scale-95 font-serif font-bold"
            title="Xem cẩm nang hướng dẫn cách đặt câu hỏi và cách tính quẻ Chủ, Biến, Hỗ"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#C9A55A]" />
            <span>Hướng Dẫn & Cách Tính Quẻ</span>
          </button>
          {result && (
            <>
              <button
                type="button"
                onClick={() => handleCaptureMaiHoa("primary")}
                disabled={isCapturing}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-serif font-bold text-[#14100C] bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-110 rounded-lg border border-amber-300 shadow-md transition-all cursor-pointer active:scale-95"
                title="Chụp hình lưu lại quẻ hoa mai ban đầu (Quẻ Chủ / Bản Quái)"
              >
                {isCapturing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5 text-[#14100C]" />}
                <span>Chụp Quẻ Ban Đầu</span>
              </button>
              <button
                type="button"
                onClick={handleResetInternal}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-[#C8B89E] hover:text-[#FFF] bg-[#241D17] hover:bg-[#34271D] rounded-lg border border-[#3E2E1D] transition-colors cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Gieo quẻ mới</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL HƯỚNG DẪN ĐẶT CÂU HỎI & CÁCH TÍNH QUẺ MAI HOA DỊCH SỐ */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showGuideModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowGuideModal(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl bg-gradient-to-b from-[#1C140D] via-[#140E09] to-[#0A0705] border-2 border-[#8C6218] rounded-2xl sm:rounded-3xl shadow-[0_0_50px_rgba(212,175,55,0.4)] p-4 sm:p-7 relative my-auto max-h-[90vh] overflow-y-auto cursor-default"
            >
              {/* Top Modal Header */}
              <div className="flex items-center justify-between border-b border-[#3B2918] pb-4 mb-5 sticky top-0 bg-[#1C140D]/95 backdrop-blur-md z-20 -mt-1 pt-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#2C1C0F] border border-[#6B4B27] flex items-center justify-center text-rose-300 text-xl shadow">
                    🌸
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9A55A] block leading-none">
                      CẨM NANG MAI HOA TÂM DỊCH • THIỆU KHANG TIẾT
                    </span>
                    <h3 className="font-serif font-bold text-base sm:text-lg text-[#F5EAD4] mt-0.5">
                      Cách Đặt Câu Hỏi & Phương Pháp Tính Quẻ Mai Hoa
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowGuideModal(false)}
                  className="w-8 h-8 rounded-full bg-[#271B11] hover:bg-[#3D2919] border border-[#4E341E] text-[#BFAFA0] hover:text-[#FFF] flex items-center justify-center transition-colors cursor-pointer shadow"
                  title="Đóng cửa sổ"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="space-y-6 text-xs sm:text-sm font-serif leading-relaxed text-[#DECAB0]">
                {/* 1. NGHỆ THUẬT ĐẶT CÂU HỎI */}
                <section className="bg-[#17110B] border border-[#3E2C1A] rounded-2xl p-4 sm:p-5 space-y-3">
                  <div className="flex items-center gap-2 text-rose-300 font-bold border-b border-[#2C1F13] pb-2">
                    <span className="text-base">🌸</span>
                    <h4 className="text-sm sm:text-base font-serif">PHẦN 1: CÁCH ĐẶT CÂU HỎI TRONG MAI HOA DỊCH SỐ</h4>
                  </div>

                  <p className="text-[#BFB09A] leading-relaxed">
                    Mai Hoa Dịch Số dựa trên triết lý <strong className="text-[#E6D3A3]">“Tâm động sinh quái, vạn vật giai hữu số”</strong>. Khác với bốc bài ngẫu nhiên, Mai Hoa nắm bắt chính xác mối liên hệ giao cảm giữa tâm thức con người và biến chuyển của trời đất ngay tại thời khắc khởi niệm.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="bg-[#1D140D] p-3 rounded-xl border border-[#48331E] space-y-1.5">
                      <strong className="text-[#E6D3A3] block font-mono text-xs">
                        1. Nguyên Tắc "Một Việc Một Quẻ":
                      </strong>
                      <p className="text-[11.5px] text-[#A89882]">
                        Chỉ tập trung vào <strong>MỘT vấn đề cụ thể</strong> tại một thời điểm. Tránh gom nhiều việc không liên quan vào cùng một câu hỏi.
                      </p>
                    </div>

                    <div className="bg-[#1D140D] p-3 rounded-xl border border-[#48331E] space-y-1.5">
                      <strong className="text-[#E6D3A3] block font-mono text-xs">
                        2. Rõ Ràng Mốc Thời Gian & Chủ Thể:
                      </strong>
                      <p className="text-[11.5px] text-[#A89882]">
                        Câu hỏi cần có mốc thời gian rõ ràng (ví dụ: trong 3 tháng tới, trong năm nay, trong tuần này...) để quẻ phản ánh đúng trường năng lượng.
                      </p>
                    </div>
                  </div>

                  {/* Bảng so sánh mẫu câu hỏi */}
                  <div className="border border-[#382617] rounded-xl overflow-hidden mt-3">
                    <div className="grid grid-cols-2 bg-[#22160E] p-2 text-xs font-bold border-b border-[#382617]">
                      <span className="text-emerald-400">✅ Câu hỏi chuẩn xác (Nên đặt)</span>
                      <span className="text-rose-400">❌ Câu hỏi không nên đặt (Nên tránh)</span>
                    </div>
                    <div className="divide-y divide-[#2C1D12] text-[11.5px]">
                      <div className="grid grid-cols-2 p-2.5 bg-[#140D07]">
                        <span className="text-[#E0CEB5]">"Dự án kinh doanh A trong 3 tháng tới có thu được lợi nhuận như kỳ vọng không?"</span>
                        <span className="text-[#8C7A65]">"Tương lai tôi sau này giàu hay nghèo?" (Quá chung chung, không có mốc thời gian)</span>
                      </div>
                      <div className="grid grid-cols-2 p-2.5 bg-[#170F09]">
                        <span className="text-[#E0CEB5]">"Tôi chuẩn bị chuyển đổi vị trí công tác sang đơn vị B trong tháng tới, triển vọng ra sao?"</span>
                        <span className="text-[#8C7A65]">"Hôm nay tôi có trúng số không?" (Tâm cầu tài tham lam, trái đạo nghĩa Dịch học)</span>
                      </div>
                      <div className="grid grid-cols-2 p-2.5 bg-[#140D07]">
                        <span className="text-[#E0CEB5]">"Mối quan hệ tình cảm hiện tại nếu tiến tới hôn nhân trong năm nay có hòa hợp không?"</span>
                        <span className="text-[#8C7A65]">"Quẻ này xấu quá, tôi bấm gieo lại xem có ra quẻ tốt hơn không?" (Độc tắc bất cáo, làm mất linh ứng)</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#120B06] p-2.5 rounded-lg border border-[#3E2A16] text-[11px] text-[#CBB99E] flex items-center gap-2">
                    <span className="text-sm">⛩️</span>
                    <span>
                      <strong>Tứ Bất Bốc (4 Điều Không Xem):</strong> Bất thành bất bốc (không thành tâm), Bất nghi bất bốc (không do dự băn khoăn), Phi nghĩa bất bốc (việc trái đạo lý), Độc tắc bất cáo (một việc không xem đi xem lại nhiều lần).
                    </span>
                  </div>
                </section>

                {/* 2. BẢNG TIÊN THIÊN BÁT QUÁI CHI SỐ */}
                <section className="bg-[#17110B] border border-[#3E2C1A] rounded-2xl p-4 sm:p-5 space-y-3">
                  <div className="flex items-center gap-2 text-[#E6D3A3] font-bold border-b border-[#2C1F13] pb-2">
                    <span className="text-base">☯</span>
                    <h4 className="text-sm sm:text-base font-serif">PHẦN 2: BẢNG SỐ TIÊN THIÊN BÁT QUÁI (GỐC RỄ MAI HOA)</h4>
                  </div>

                  <p className="text-[#BFB09A] leading-relaxed text-xs">
                    Để tính quẻ Mai Hoa, bắt buộc phải thuộc số Tiên Thiên Bát Quái do Phục Hy sáng chế và Thiệu Ung truyền lại:
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    {[
                      { num: 1, name: "Càn (Kiền)", sym: "☰", ele: "Kim", nature: "Trời (Thiên)", border: "border-amber-600/60" },
                      { num: 2, name: "Đoài", sym: "☱", ele: "Kim", nature: "Đầm (Trạch)", border: "border-amber-600/60" },
                      { num: 3, name: "Ly", sym: "☲", ele: "Hỏa", nature: "Lửa (Hỏa)", border: "border-rose-600/60" },
                      { num: 4, name: "Chấn", sym: "☳", ele: "Mộc", nature: "Sấm (Lôi)", border: "border-emerald-600/60" },
                      { num: 5, name: "Tốn", sym: "☴", ele: "Mộc", nature: "Gió (Phong)", border: "border-emerald-600/60" },
                      { num: 6, name: "Khảm", sym: "☵", ele: "Thủy", nature: "Nước (Thủy)", border: "border-sky-600/60" },
                      { num: 7, name: "Cấn", sym: "☶", ele: "Thổ", nature: "Núi (Sơn)", border: "border-yellow-700/60" },
                      { num: 8, name: "Khôn", sym: "☷", ele: "Thổ", nature: "Đất (Địa)", border: "border-yellow-700/60" },
                    ].map((q) => (
                      <div key={q.num} className={`p-2.5 rounded-xl bg-[#1C140D] border ${q.border} shadow space-y-0.5`}>
                        <div className="text-xl font-serif text-[#E6D3A3]">{q.sym}</div>
                        <div className="font-bold text-white text-xs">{q.num}. {q.name}</div>
                        <div className="text-[10px] text-[#A89882]">{q.nature}</div>
                        <span className="inline-block text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#100A05] text-[#E6D3A3]">
                          Hành {q.ele}
                        </span>
                      </div>
                    ))}
                  </div>

                  <p className="text-[11px] text-[#C9A55A] italic">
                    * Quy tắc chia 8: Bất kể số lớn bao nhiêu, đem chia cho 8 lấy số dư. Số dư ứng với quẻ tương ứng. <strong>Nếu chia hết (số dư = 0), quy định lấy số 8 là quẻ Khôn ☷</strong>.
                  </p>
                </section>

                {/* 3. CÁCH LẤY QUẺ CHỦ, QUẺ BIẾN VÀ QUẺ HỖ */}
                <section className="bg-[#17110B] border border-[#3E2C1A] rounded-2xl p-4 sm:p-5 space-y-4">
                  <div className="flex items-center gap-2 text-[#E6D3A3] font-bold border-b border-[#2C1F13] pb-2">
                    <span className="text-base">📜</span>
                    <h4 className="text-sm sm:text-base font-serif">PHẦN 3: PHƯƠNG PHÁP TÍNH QUẺ CHỦ, QUẺ BIẾN & QUẺ HỖ</h4>
                  </div>

                  {/* 1. Quẻ Chủ */}
                  <div className="bg-[#1F150D] p-3.5 rounded-xl border border-[#523A21] space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-[#E6D3A3]">
                      <span>1. CÁCH LẤY QUẺ CHỦ (BẢN QUÁI - 本卦):</span>
                      <span className="text-[10px] font-mono text-emerald-400">Thực trạng ban đầu</span>
                    </div>
                    <p className="text-xs text-[#BFB09A] leading-relaxed">
                      Quẻ Chủ gồm 6 hào, chia làm 2 đơn quái: <strong>Thượng Quái</strong> (3 hào trên) và <strong>Hạ Quái</strong> (3 hào dưới):
                    </p>
                    <ul className="text-xs text-[#DECAB0] space-y-1 list-disc list-inside">
                      <li>
                        <strong>Thượng Quái:</strong> Lấy (Số thứ nhất) chia cho 8 lấy số dư. <em>(Ví dụ: 26 : 8 = 3 dư 2 ➔ Quẻ Đoài ☱).</em>
                      </li>
                      <li>
                        <strong>Hạ Quái:</strong> Lấy (Số thứ hai) chia cho 8 lấy số dư. <em>(Ví dụ: 37 : 8 = 4 dư 5 ➔ Quẻ Tốn ☴).</em>
                      </li>
                      <li>
                        <strong>Ghép Quẻ Chủ:</strong> Đặt Thượng Quái (Đoài) ở trên, Hạ Quái (Tốn) ở dưới ➔ Quẻ <strong>Trạch Phong Đại Quá</strong> (Quẻ #28).
                      </li>
                    </ul>
                  </div>

                  {/* 2. Quẻ Biến */}
                  <div className="bg-[#1F150D] p-3.5 rounded-xl border border-[#523A21] space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-rose-300">
                      <span>2. CÁCH LẤY HÀO ĐỘNG & QUẺ BIẾN (BIẾN QUÁI - 變卦):</span>
                      <span className="text-[10px] font-mono text-rose-400">Kết quả tương lai</span>
                    </div>
                    <p className="text-xs text-[#BFB09A] leading-relaxed">
                      Quẻ Biến đại diện cho xu hướng diễn dịch và kết quả cuối cùng của sự việc:
                    </p>
                    <ul className="text-xs text-[#DECAB0] space-y-1 list-disc list-inside">
                      <li>
                        <strong>Cách tính Hào Động:</strong> Lấy tổng tất cả các số chia cho 6 lấy số dư (vì quẻ có 6 hào).
                        <em> (Ví dụ: 37 : 6 = 6 dư 1 ➔ Hào 1 động - Sơ Hào động. Nếu chia hết dư 0 ➔ Hào 6 động).</em>
                      </li>
                      <li>
                        <strong>Quy tắc biến hào:</strong> Tại vị trí hào động, đổi tính chất âm dương:
                        <span className="text-[#E6D3A3]"> Hào Dương ⚊ biến thành Hào Âm ⚋; Hào Âm ⚋ biến thành Hào Dương ⚊</span>. 5 hào còn lại giữ nguyên tính chất.
                      </li>
                      <li>
                        <strong>Kết quả:</strong> Quẻ Trạch Phong Đại Quá động Hào 1 biến thành <strong>Trạch Thiên Quải</strong> (Quẻ #43).
                      </li>
                    </ul>
                  </div>

                  {/* 3. Quẻ Hỗ */}
                  <div className="bg-[#1F150D] p-3.5 rounded-xl border-2 border-[#C9A55A]/80 shadow-lg space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-[#E6D3A3]">
                      <span className="flex items-center gap-1.5">
                        <span className="text-sm">⚡</span>
                        3. CÁCH LẤY QUẺ HỖ (HỖ QUÁI / TƯƠNG QUÁI - 互卦):
                      </span>
                      <span className="text-[10px] font-mono text-[#C9A55A] bg-[#2E1D0E] px-2 py-0.5 rounded border border-[#5A3819]">
                        Diễn biến ngầm ở giữa
                      </span>
                    </div>
                    <p className="text-xs text-[#BFB09A] leading-relaxed">
                      Quẻ Hỗ biểu thị quá trình chuyển biến trung gian, những điều kiện tiềm ẩn bên trong sự việc mà mắt thường chưa thấy được. Quẻ Hỗ được rút trực tiếp từ 6 hào của Quẻ Chủ:
                    </p>

                    {/* Sơ đồ trực quan Quẻ Hỗ */}
                    <div className="bg-[#140D07] p-3 rounded-xl border border-[#3E2918] grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                      <div className="space-y-1 text-xs">
                        <div className="text-[#E6D3A3] font-bold pb-1 border-b border-[#2C1C0F]">
                          Trực Quan 6 Hào Quẻ Chủ Rút Ra Quẻ Hỗ:
                        </div>
                        <div className="font-mono text-[11px] space-y-0.5 pt-1 text-[#CBB99E]">
                          <div>• Hào 6 (Thượng): <em>(Không dùng)</em></div>
                          <div className="text-amber-300 font-bold bg-[#24170D] px-1.5 py-0.2 rounded">
                            • Hào 5 ──┐ Lấy làm Hào 3 (trên cùng) của THƯỢNG HỖ
                          </div>
                          <div className="text-amber-300 font-bold bg-[#24170D] px-1.5 py-0.2 rounded">
                            • Hào 4 ──┼──┐ Lấy làm Hào 2 THƯỢNG HỖ & Hào 3 HẠ HỖ
                          </div>
                          <div className="text-amber-300 font-bold bg-[#24170D] px-1.5 py-0.2 rounded">
                            • Hào 3 ──┘  │ Lấy làm Hào 1 THƯỢNG HỖ & Hào 2 HẠ HỖ
                          </div>
                          <div className="text-amber-300 font-bold bg-[#24170D] px-1.5 py-0.2 rounded">
                            • Hào 2 ─────┘ Lấy làm Hào 1 (dưới cùng) của HẠ HỖ
                          </div>
                          <div>• Hào 1 (Sơ): <em>(Không dùng)</em></div>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs bg-[#1A1008] p-3 rounded-lg border border-[#342212]">
                        <div>
                          <strong className="text-sky-300 block font-mono">• HẠ QUÁI QUẺ HỖ:</strong>
                          <span>Ghép từ 3 hào: <strong>Hào 2 + Hào 3 + Hào 4</strong> của Quẻ Chủ.</span>
                        </div>
                        <div>
                          <strong className="text-amber-300 block font-mono">• THƯỢNG QUÁI QUẺ HỖ:</strong>
                          <span>Ghép từ 3 hào: <strong>Hào 3 + Hào 4 + Hào 5</strong> của Quẻ Chủ.</span>
                        </div>
                        <div className="text-[11px] text-[#A69781] italic pt-1 border-t border-[#291A0E]">
                          * Như vậy, hào 1 và hào 6 không tham gia vào quẻ Hỗ. Hào 3 và hào 4 được lặp lại 2 lần vì là trung tâm cốt lõi của quẻ.
                        </div>
                      </div>
                    </div>

                    {/* Ví dụ mẫu thực tế Quẻ Hỗ */}
                    <div className="bg-[#181109] p-3 rounded-lg border border-[#4A321B] text-xs space-y-2">
                      <span className="text-[#E6D3A3] font-bold block flex items-center gap-1.5">
                        <span>💡</span>
                        <span>Ví Dụ Thực Tế Minh Họa Cách Tính Quẻ Hỗ:</span>
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11.5px]">
                        <div className="p-2 rounded bg-[#130B06] border border-[#3A2615] space-y-1">
                          <strong className="text-amber-300 block font-mono">Ví dụ 1: Quẻ Chủ là Thuần Càn ☰☰ (#1)</strong>
                          <p className="text-[#CBB99E]">
                            6 hào từ dưới lên: [1, 1, 1, 1, 1, 1] (toàn Dương).
                            <br />
                            • Hạ Hỗ (hào 2, 3, 4) là [1, 1, 1] ➔ Quẻ Càn ☰.
                            <br />
                            • Thượng Hỗ (hào 3, 4, 5) là [1, 1, 1] ➔ Quẻ Càn ☰.
                            <br />
                            ➔ Quẻ Hỗ chính là <strong>Bát Thuần Càn ☰☰ (Quẻ #1)</strong>.
                          </p>
                        </div>
                        <div className="p-2 rounded bg-[#130B06] border border-[#3A2615] space-y-1">
                          <strong className="text-sky-300 block font-mono">Ví dụ 2: Quẻ Chủ là Thủy Hỏa Ký Tế ☵☲ (#63)</strong>
                          <p className="text-[#CBB99E]">
                            6 hào từ dưới lên: [1, 0, 1, 0, 1, 0].
                            <br />
                            • Hạ Hỗ (hào 2:0, hào 3:1, hào 4:0) ➔ Quẻ Khảm ☵ (Nước).
                            <br />
                            • Thượng Hỗ (hào 3:1, hào 4:0, hào 5:1) ➔ Quẻ Ly ☲ (Lửa).
                            <br />
                            ➔ Quẻ Hỗ là <strong>Hỏa Thủy Vị Tế ☲☵ (Quẻ #64)</strong>.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 4. PHÂN ĐỊNH THỂ DỤNG & LUẬN ĐOÁN CÁT HUNG */}
                <section className="bg-[#17110B] border border-[#3E2C1A] rounded-2xl p-4 sm:p-5 space-y-3">
                  <div className="flex items-center gap-2 text-[#E6D3A3] font-bold border-b border-[#2C1F13] pb-2">
                    <span className="text-base">👑</span>
                    <h4 className="text-sm sm:text-base font-serif">PHẦN 4: PHÂN ĐỊNH THỂ - DỤNG & LUẬN ĐOÁN CÁT HUNG</h4>
                  </div>

                  <p className="text-xs text-[#BFB09A]">
                    Trong Quẻ Chủ, quái nào chứa hào động thì đó là <strong>DỤNG QUÁI</strong> (sự việc, đối phương, khách quan). Quái còn lại không có hào động là <strong>THỂ QUÁI</strong> (bản thân người hỏi, chủ thể).
                  </p>

                  <div className="space-y-2 pt-1 text-xs">
                    <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/50 text-[#E6D3A3]">
                      <strong>1. Dụng Sinh Thể (用生體) ➔ ĐẠI CÁT:</strong>
                      <p className="text-[11.5px] text-[#DECAB0] mt-0.5">
                        Hoàn cảnh sinh trợ bản thân, được quý nhân giúp đỡ, cầu tài đắc tài, việc dễ thành công mỹ mãn.
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-300">
                      <strong>2. Thể Dụng Tỷ Hòa (比和) ➔ CÁT:</strong>
                      <p className="text-[11.5px] text-[#DECAB0] mt-0.5">
                        Cùng ngũ hành, âm dương tương hợp, bạn bè đồng nghiệp cùng chí hướng, mọi sự bình an hanh thông.
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-500/50 text-sky-300">
                      <strong>3. Thể Khắc Dụng (體剋用) ➔ THỨ CÁT:</strong>
                      <p className="text-[11.5px] text-[#DECAB0] mt-0.5">
                        Bản thân làm chủ được tình thế, chế ngự được khó khăn. Lúc đầu vất vả nhưng kiên trì ắt thắng.
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-orange-950/40 border border-orange-500/50 text-amber-300">
                      <strong>4. Thể Sinh Dụng (體生用) ➔ TIẾT KHÍ / HAO TỔN:</strong>
                      <p className="text-[11.5px] text-[#DECAB0] mt-0.5">
                        Phải hao tâm tổn lực, tốn tiền của vì việc hỏi mà thu về ít. Nên biết điểm dừng, lượng sức mình.
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/50 text-rose-300">
                      <strong>5. Dụng Khắc Thể (用剋體) ➔ HUNG:</strong>
                      <p className="text-[11.5px] text-[#DECAB0] mt-0.5">
                        Hoàn cảnh khách quan chèn ép, gặp trở ngại lớn hoặc bị kẻ xấu hãm hại. Nên án binh bất động, thủ thế giữ mình.
                      </p>
                    </div>
                  </div>
                </section>
              </div>

              {/* Bottom Close / Understand Button */}
              <div className="mt-6 pt-4 border-t border-[#3B2918] flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => setShowGuideModal(false)}
                  className="px-8 py-3 bg-gradient-to-r from-[#9C7026] via-[#D6B97A] to-[#9C7026] hover:brightness-115 active:scale-95 text-[#14100C] font-bold font-serif text-sm sm:text-base rounded-2xl shadow-[0_0_25px_rgba(212,175,55,0.45)] transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#14100C]" />
                  <span>Đã Hiểu Rõ • Bắt Đầu Khởi Quẻ Mai Hoa</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* CASTING INTERFACE (IF NO RESULT YET) */}
      {/* ========================================================================= */}
      {!result ? (
        <div className="space-y-4">
          {/* Quick Guide Banner */}
          <div className="bg-gradient-to-r from-[#24170D] via-[#352112] to-[#24170D] border border-[#6B4B27] rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <span className="text-2xl shrink-0">📖</span>
              <div>
                <span className="text-xs sm:text-sm font-serif font-bold text-[#E6D3A3] block">
                  Cẩm Nang Mai Hoa: Cách Đặt Câu Hỏi & Tính Quẻ Chủ - Biến - Hỗ
                </span>
                <span className="text-[11px] text-[#A89882] block mt-0.5">
                  Nguyên tắc Một Việc Một Quẻ, Tiên Thiên Bát Quái chi số, quy tắc lấy quẻ Hỗ và Thể Dụng luận đoán.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowGuideModal(true)}
              className="shrink-0 self-end sm:self-center px-3.5 py-1.5 bg-[#4A3018] hover:bg-[#63401F] text-[#E6D3A3] border border-[#8C6218] hover:border-[#C9A55A] rounded-lg text-xs font-serif font-bold transition-all cursor-pointer shadow active:scale-95 flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#C9A55A]" />
              <span>Xem Hướng Dẫn</span>
            </button>
          </div>

          {/* Method Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#120D08] p-1.5 rounded-xl border border-[#2B1B0E]">
            <button
              type="button"
              onClick={() => setActiveTab("time")}
              className={`p-2.5 rounded-lg text-xs font-serif font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                activeTab === "time"
                  ? "bg-[#2A1D11] text-[#E6D3A3] border border-[#6B4B27] shadow"
                  : "text-[#8C7B67] hover:text-[#C9A55A]"
              }`}
            >
              <Clock className="w-4 h-4 text-[#C9A55A]" />
              <span>1. Theo Thời Khắc</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("number")}
              className={`p-2.5 rounded-lg text-xs font-serif font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                activeTab === "number"
                  ? "bg-[#2A1D11] text-[#E6D3A3] border border-[#6B4B27] shadow"
                  : "text-[#8C7B67] hover:text-[#C9A55A]"
              }`}
            >
              <Hash className="w-4 h-4 text-[#C9A55A]" />
              <span>2. Số Tùy Tâm</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("word")}
              className={`p-2.5 rounded-lg text-xs font-serif font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                activeTab === "word"
                  ? "bg-[#2A1D11] text-[#E6D3A3] border border-[#6B4B27] shadow"
                  : "text-[#8C7B67] hover:text-[#C9A55A]"
              }`}
            >
              <Type className="w-4 h-4 text-[#C9A55A]" />
              <span>3. Trắc Tự (Đoán Chữ)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("blossom")}
              className={`p-2.5 rounded-lg text-xs font-serif font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                activeTab === "blossom"
                  ? "bg-[#2A1D11] text-[#E6D3A3] border border-[#6B4B27] shadow"
                  : "text-[#8C7B67] hover:text-[#C9A55A]"
              }`}
            >
              <Flower2 className="w-4 h-4 text-rose-400" />
              <span>4. Mai Hoa Lạc Cầm</span>
            </button>
          </div>

          {/* Tab 1: Khởi Quẻ Theo Thời Khắc */}
          {activeTab === "time" && (
            <div className="bg-[#15100B] border border-[#3E2C1A] rounded-xl p-4 sm:p-5 space-y-4 animate-in fade-in duration-300">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h4 className="text-sm font-serif font-bold text-[#F3E5D0] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#C9A55A]" />
                    <span>Khởi Quẻ Theo Niên Nguyệt Nhật Thời Hiện Tại</span>
                  </h4>
                  <p className="text-xs text-[#9E8D79] mt-1 leading-relaxed">
                    Thuận theo vũ trụ thời không: Lấy Năm (Địa Chi) + Tháng + Ngày chia 8 làm <strong>Thượng Quái</strong>; cộng thêm Giờ chia 8 làm <strong>Hạ Quái</strong>; tổng số chia 6 định <strong>Hào Động</strong>.
                  </p>
                </div>
              </div>

              {/* Real-time Astronomical Clock preview */}
              <div className="p-3 bg-[#1D140C] border border-[#523A20] rounded-xl flex items-center justify-between gap-3 text-xs font-mono text-[#E6D3A3]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Thời điểm hiện tại: {new Date().toLocaleDateString("vi-VN")} {new Date().toLocaleTimeString("vi-VN")}</span>
                </div>
                <span className="text-[11px] text-[#A89882] font-serif hidden sm:inline">
                  Thiên cơ tương cảm ngay lúc này
                </span>
              </div>

              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={handleCastByCurrentTime}
                  disabled={isCasting}
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#9C7026] via-[#D6B97A] to-[#9C7026] hover:brightness-115 active:scale-95 text-[#14100C] font-bold font-serif text-sm sm:text-base rounded-2xl shadow-[0_0_25px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-[#14100C]" />
                  <span>🌸 Khởi Quẻ Mai Hoa Theo Giờ Hiện Tại</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Khởi Quẻ Theo Số Tùy Tâm */}
          {activeTab === "number" && (
            <form onSubmit={handleCastByNumbers} className="bg-[#15100B] border border-[#3E2C1A] rounded-xl p-4 sm:p-5 space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <h4 className="text-sm font-serif font-bold text-[#F3E5D0] flex items-center gap-2">
                    <Hash className="w-4 h-4 text-[#C9A55A]" />
                    <span>Khởi Quẻ Theo Ba Dãy Số Cảm Ứng</span>
                  </h4>
                  <p className="text-xs text-[#9E8D79] mt-0.5">
                    Tâm niệm câu hỏi trong lòng, điền 3 con số bạn bất chợt cảm ứng thấy (1 đến 999), hoặc bấm "Lắc số ngẫu nhiên":
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRandomizeNumbers}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-serif bg-[#241A12] text-[#E6D3A3] border border-[#523A21] hover:bg-[#342417] cursor-pointer shadow active:scale-95"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Lắc số cảm ứng</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#1B130B] p-3 rounded-xl border border-[#3D2B1B]">
                  <label className="block text-[11px] font-mono text-[#C9A55A] mb-1">
                    Số 1: Thượng Quái (chia 8)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="VD: 368"
                    value={num1}
                    onChange={(e) => setNum1(e.target.value)}
                    className="w-full bg-[#120B06] border border-[#48331E] focus:border-[#C9A55A] rounded-lg px-3 py-2 text-sm text-[#F3E5CD] font-mono outline-none"
                  />
                </div>
                <div className="bg-[#1B130B] p-3 rounded-xl border border-[#3D2B1B]">
                  <label className="block text-[11px] font-mono text-[#C9A55A] mb-1">
                    Số 2: Hạ Quái (chia 8)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="VD: 589"
                    value={num2}
                    onChange={(e) => setNum2(e.target.value)}
                    className="w-full bg-[#120B06] border border-[#48331E] focus:border-[#C9A55A] rounded-lg px-3 py-2 text-sm text-[#F3E5CD] font-mono outline-none"
                  />
                </div>
                <div className="bg-[#1B130B] p-3 rounded-xl border border-[#3D2B1B]">
                  <label className="block text-[11px] font-mono text-[#C9A55A] mb-1">
                    Số 3: Hào Động (cộng tổng)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="VD: 792"
                    value={num3}
                    onChange={(e) => setNum3(e.target.value)}
                    className="w-full bg-[#120B06] border border-[#48331E] focus:border-[#C9A55A] rounded-lg px-3 py-2 text-sm text-[#F3E5CD] font-mono outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-center">
                <button
                  type="submit"
                  disabled={isCasting}
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#9C7026] via-[#D6B97A] to-[#9C7026] hover:brightness-115 active:scale-95 text-[#14100C] font-bold font-serif text-sm sm:text-base rounded-2xl shadow-[0_0_25px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-[#14100C]" />
                  <span>🌸 Khởi Quẻ Mai Hoa Theo Số</span>
                </button>
              </div>
            </form>
          )}

          {/* Tab 3: Khởi Quẻ Trắc Tự (Đoán Chữ) */}
          {activeTab === "word" && (
            <form onSubmit={handleCastByWord} className="bg-[#15100B] border border-[#3E2C1A] rounded-xl p-4 sm:p-5 space-y-4 animate-in fade-in duration-300">
              <div>
                <h4 className="text-sm font-serif font-bold text-[#F3E5D0] flex items-center gap-2">
                  <Type className="w-4 h-4 text-[#C9A55A]" />
                  <span>Trắc Tự Chiêm Đoán (Bí Pháp Đoán Chữ Mai Hoa)</span>
                </h4>
                <p className="text-xs text-[#9E8D79] mt-0.5">
                  Nhập một chữ, một từ hoặc cụm từ bạn đang trăn trở (ví dụ: "Bình An", "Đổi Việc", "Tình Duyên", "Kinh Doanh", "Sức Khỏe"...):
                </p>
              </div>

              <div className="bg-[#1B130B] p-3 rounded-xl border border-[#3D2B1B]">
                <input
                  type="text"
                  placeholder="Nhập chữ hoặc từ cần chiêm bặc..."
                  value={customWord}
                  onChange={(e) => setCustomWord(e.target.value)}
                  className="w-full bg-[#120B06] border border-[#48331E] focus:border-[#C9A55A] rounded-lg px-3.5 py-2.5 text-base text-[#F3E5CD] font-serif outline-none placeholder:text-[#655341]"
                />
              </div>

              <div className="pt-2 flex justify-center">
                <button
                  type="submit"
                  disabled={isCasting}
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#9C7026] via-[#D6B97A] to-[#9C7026] hover:brightness-115 active:scale-95 text-[#14100C] font-bold font-serif text-sm sm:text-base rounded-2xl shadow-[0_0_25px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-[#14100C]" />
                  <span>🌸 Khởi Quẻ Trắc Tự Mai Hoa</span>
                </button>
              </div>
            </form>
          )}

          {/* Tab 4: Mai Hoa Lạc Cầm (Gieo Cánh Hoa) */}
          {activeTab === "blossom" && (
            <div className="bg-[#15100B] border border-[#3E2C1A] rounded-xl p-4 sm:p-5 space-y-4 text-center animate-in fade-in duration-300">
              <div className="max-w-md mx-auto space-y-1">
                <h4 className="text-sm font-serif font-bold text-[#F3E5D0] flex items-center justify-center gap-2">
                  <Flower2 className="w-4 h-4 text-rose-400" />
                  <span>Mai Hoa Lạc Cầm (Cánh Hoa Rơi Tự Nhiên)</span>
                </h4>
                <p className="text-xs text-[#9E8D79]">
                  Tích xưa Thiệu Khang Tiết ngắm hoa mai thấy hai con chim cắn nhau rụng cánh hoa mà đoán trước điềm báo. Hãy chạm vào nhành hoa để hoa rơi định quẻ:
                </p>
              </div>

              {/* Animated Blossom Tree Branch */}
              <div
                onClick={handleCastByBlossom}
                className="w-full max-w-sm mx-auto h-32 bg-gradient-to-b from-[#20150E] to-[#120B06] border border-[#523A21] rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-rose-400 shadow-xl transition-all group select-none"
                title="Chạm vào nhành hoa mai để gieo quẻ"
              >
                <div className="text-4xl group-hover:scale-125 transition-transform duration-300 animate-bounce">
                  🌸
                </div>
                <span className="text-xs font-serif text-[#E6D3A3] group-hover:text-rose-300 font-bold">
                  ✦ Chạm Vào Nhành Hoa Mai Gieo Quẻ ✦
                </span>
                <span className="text-[10px] text-[#A89882] font-mono">
                  Gió động hoa rơi • Tự nhiên thành tượng
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ========================================================================= */
        /* RESULT VIEW: TAM QUÁI MAI HOA & THỂ DỤNG SINH KHẮC */
        /* ========================================================================= */
        <div ref={fullResultCaptureRef} className="space-y-5 animate-in fade-in duration-500 bg-[#16120E] p-1 sm:p-2 rounded-2xl">
          {/* Top Method Callout */}
          <div className="bg-[#1C140D] border border-[#583C1F] rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs font-serif">
            <div className="flex items-center gap-2">
              <span className="text-base">🌸</span>
              <span className="font-bold text-[#E6D3A3]">{result.methodLabel}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap no-capture">
              <span className="text-[11px] font-mono text-[#A89882]">{result.methodDetail}</span>
              <button
                type="button"
                onClick={() => handleCaptureMaiHoa("primary")}
                disabled={isCapturing}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-serif font-bold text-[#E6D3A3] hover:text-white bg-[#332011] hover:bg-[#462C18] border border-[#8C6218] hover:border-[#C9A55A] rounded-md transition-all cursor-pointer shadow-xs active:scale-95"
                title="Chụp ảnh riêng Quẻ Hoa Mai Ban Đầu (Quẻ Chủ / Bản Quái)"
              >
                {isCapturing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3 text-[#C9A55A]" />}
                <span>Chụp Quẻ Ban Đầu</span>
              </button>
              <button
                type="button"
                onClick={() => handleCaptureMaiHoa("full")}
                disabled={isCapturing}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-serif font-bold text-[#C8B89E] hover:text-white bg-[#22170E] hover:bg-[#342417] border border-[#523A20] rounded-md transition-all cursor-pointer shadow-xs active:scale-95"
                title="Chụp ảnh toàn bộ Tam Quái Mai Hoa (Chủ - Hỗ - Biến & Thể Dụng)"
              >
                {isCapturing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3 text-[#C9A55A]" />}
                <span>Chụp Toàn Bộ Quẻ</span>
              </button>
              <button
                type="button"
                onClick={() => setShowGuideModal(true)}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] text-[#E6D3A3] hover:text-white bg-[#2A1D11] hover:bg-[#3E2918] border border-[#6B4B27] rounded-md transition-colors cursor-pointer"
                title="Xem hướng dẫn cách lấy quẻ Chủ, Biến, Hỗ"
              >
                <BookOpen className="w-3 h-3 text-[#C9A55A]" />
                <span>Cách Tính Quẻ</span>
              </button>
            </div>
          </div>

          {/* 1. TAM QUÁI MAI HOA: QUẺ CHỦ - QUẺ HỔ - QUẺ BIẾN */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Cột 1: QUẺ CHỦ (BẢN QUÁI) */}
            <div
              ref={primaryHexCaptureRef}
              className="bg-gradient-to-b from-[#1C140D] to-[#120D08] border-2 border-[#C9A55A] rounded-2xl p-4 shadow-xl flex flex-col justify-between space-y-3 relative overflow-hidden"
            >
              {/* Header của thẻ quẻ chủ */}
              <div className="flex items-center justify-between pb-1 border-b border-[#342213] no-capture">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#2D1B0E] border border-[#C9A55A] text-[#E6D3A3] font-bold">
                  1. BẢN QUÁI (QUẺ BAN ĐẦU)
                </span>
                <button
                  type="button"
                  onClick={() => handleCaptureMaiHoa("primary")}
                  disabled={isCapturing}
                  className="flex items-center gap-1 px-2.5 py-1 text-[10.5px] font-serif font-bold rounded-lg bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20 hover:from-amber-500/30 hover:to-amber-500/40 text-[#E6D3A3] border border-[#8C6218] hover:border-[#C9A55A] transition-all cursor-pointer shadow-xs active:scale-95"
                  title="Chụp hình lưu lại Quẻ Hoa Mai ban đầu (Quẻ Chủ / Bản Quái)"
                >
                  {isCapturing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3 text-[#C9A55A]" />}
                  <span>Chụp Quẻ</span>
                </button>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-[#A89882] block">
                  Hiện Tại & Gốc Rễ
                </span>
                <h4 className="text-base font-serif font-bold text-[#E6D3A3] mt-0.5">
                  Quẻ #{result.primaryHex.number}: {result.primaryHex.name}
                </h4>
                <span className="text-xs text-[#DECAB0] font-serif block">
                  {result.primaryHex.vietnameseName} ({result.primaryHex.hanzi})
                </span>
              </div>

              {/* 6-Lines Visual with Changing Line Highlight */}
              <div className="space-y-1.5 py-2 border-y border-[#342213]">
                {[5, 4, 3, 2, 1, 0].map((lineIdx) => {
                  const lineNum = lineIdx + 1;
                  const isYang = result.primaryHex.lines[lineIdx] === 1;
                  const isChanging = lineNum === result.changingLine;
                  const isUpper = lineNum >= 4;
                  const isTheLine = isUpper ? !result.isLowerThe : result.isLowerThe;

                  return (
                    <div key={lineIdx} className="flex items-center gap-2 text-[10px] font-mono">
                      <span className={`w-8 shrink-0 ${isChanging ? "text-rose-400 font-bold" : "text-[#7D6B57]"}`}>
                        H{lineNum} {isChanging ? "●" : ""}
                      </span>

                      <div className="flex-1">
                        {isYang ? (
                          <div
                            className={`h-2.5 rounded-xs transition-all ${
                              isChanging
                                ? "bg-gradient-to-r from-[#C9A55A] via-rose-500 to-[#C9A55A] shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse"
                                : "bg-[#C89B3C]"
                            }`}
                          />
                        ) : (
                          <div className="flex justify-between h-2.5">
                            <div
                              className={`w-[45%] rounded-xs ${
                                isChanging
                                  ? "bg-gradient-to-r from-[#C9A55A] to-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse"
                                  : "bg-[#7A6A55]"
                              }`}
                            />
                            <div
                              className={`w-[45%] rounded-xs ${
                                isChanging
                                  ? "bg-gradient-to-r from-rose-500 to-[#C9A55A] shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse"
                                  : "bg-[#7A6A55]"
                              }`}
                            />
                          </div>
                        )}
                      </div>

                      <span className={`text-[9px] w-12 text-right ${isTheLine ? "text-[#E6D3A3] font-bold" : "text-sky-300"}`}>
                        {lineNum === 6 ? (result.isLowerThe ? "DỤNG" : "THỂ") : lineNum === 1 ? (result.isLowerThe ? "THỂ" : "DỤNG") : ""}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Thể - Dụng phân định */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs font-serif">
                <div className="bg-[#140D07] p-2 rounded-lg border border-[#3E2816]">
                  <span className="text-[10px] text-[#A89882] block font-mono">
                    THỂ ({result.theTrigram.name})
                  </span>
                  <span className="font-bold text-[#E6D3A3]">{result.theTrigram.element}</span>
                </div>
                <div className="bg-[#140D07] p-2 rounded-lg border border-[#3E2816]">
                  <span className="text-[10px] text-sky-400 block font-mono">
                    DỤNG ({result.dungTrigram.name})
                  </span>
                  <span className="font-bold text-sky-200">{result.dungTrigram.element}</span>
                </div>
              </div>

              {/* Tóm lược quan hệ Thể - Dụng cho Quẻ Ban Đầu */}
              <div className="p-2 rounded-xl bg-[#140C07] border border-[#3E2816] text-center space-y-0.5 shadow-inner">
                <span className="text-[11px] font-serif font-bold text-[#E6D3A3] block">
                  {result.relation} • {result.verdict}
                </span>
                <span className="text-[9.5px] text-[#A89882] font-mono block">
                  Hào {result.changingLine} động • Thể: {result.theTrigram.element} | Dụng: {result.dungTrigram.element}
                </span>
                <span className="text-[8.5px] text-[#8C7A65] font-serif italic block pt-0.5">
                  🌸 Mai Hoa Dịch Số • Thiệu Khang Tiết
                </span>
              </div>
            </div>

            {/* Cột 2: QUẺ HỔ (HỔ QUÁI - TIỀM NĂNG TRUNG GIAN) */}
            <div className="bg-gradient-to-b from-[#18110B] to-[#0F0B06] border border-[#523A20] rounded-2xl p-4 shadow-lg flex flex-col justify-between space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 px-2 py-0.5 rounded-bl-lg bg-[#22170E] border-l border-b border-[#523A20] text-[10px] font-mono text-[#C8B89E]">
                2. HỔ QUÁI
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-[#A89882] block">
                  Diễn Biến Tiềm Ẩn
                </span>
                <h4 className="text-base font-serif font-bold text-[#F3E5CD] mt-0.5">
                  Quẻ #{result.hoHex.number}: {result.hoHex.name}
                </h4>
                <span className="text-xs text-[#A89882] font-serif block">
                  {result.hoHex.vietnameseName} ({result.hoHex.hanzi})
                </span>
              </div>

              {/* 6-Lines Visual of Ho Hexagram */}
              <div className="space-y-1.5 py-2 border-y border-[#2A1C10]">
                {[5, 4, 3, 2, 1, 0].map((lineIdx) => {
                  const lineNum = lineIdx + 1;
                  const isYang = result.hoHex.lines[lineIdx] === 1;

                  return (
                    <div key={lineIdx} className="flex items-center gap-2 text-[10px] font-mono">
                      <span className="w-8 shrink-0 text-[#6B5A49]">H{lineNum}</span>
                      <div className="flex-1">
                        {isYang ? (
                          <div className="h-2.5 rounded-xs bg-[#9E7B34]" />
                        ) : (
                          <div className="flex justify-between h-2.5">
                            <div className="w-[45%] rounded-xs bg-[#5E5142]" />
                            <div className="w-[45%] rounded-xs bg-[#5E5142]" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-[11px] text-[#A89882] font-serif italic text-center">
                “Quá trình phát triển ngầm bên trong (Hào 2, 3, 4 làm Hạ; Hào 3, 4, 5 làm Thượng)”
              </p>
            </div>

            {/* Cột 3: QUẺ BIẾN (BIẾN QUÁI - KẾT QUẢ CHUNG CUỘC) */}
            <div className="bg-gradient-to-b from-[#1C140D] to-[#120D08] border border-emerald-800/60 rounded-2xl p-4 shadow-xl flex flex-col justify-between space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 px-2 py-0.5 rounded-bl-lg bg-[#142314] border-l border-b border-emerald-700/60 text-[10px] font-mono text-emerald-300 font-bold">
                3. BIẾN QUÁI
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-[#A89882] block">
                  Kết Quả Tương Lai
                </span>
                <h4 className="text-base font-serif font-bold text-emerald-300 mt-0.5">
                  Quẻ #{result.transformedHex.number}: {result.transformedHex.name}
                </h4>
                <span className="text-xs text-[#DECAB0] font-serif block">
                  {result.transformedHex.vietnameseName} ({result.transformedHex.hanzi})
                </span>
              </div>

              {/* 6-Lines Visual of Transformed Hexagram */}
              <div className="space-y-1.5 py-2 border-y border-[#342213]">
                {[5, 4, 3, 2, 1, 0].map((lineIdx) => {
                  const lineNum = lineIdx + 1;
                  const isYang = result.transformedHex.lines[lineIdx] === 1;
                  const isChanged = lineNum === result.changingLine;

                  return (
                    <div key={lineIdx} className="flex items-center gap-2 text-[10px] font-mono">
                      <span className={`w-8 shrink-0 ${isChanged ? "text-emerald-400 font-bold" : "text-[#7D6B57]"}`}>
                        H{lineNum} {isChanged ? "★" : ""}
                      </span>

                      <div className="flex-1">
                        {isYang ? (
                          <div className={`h-2.5 rounded-xs ${isChanged ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" : "bg-[#C89B3C]"}`} />
                        ) : (
                          <div className="flex justify-between h-2.5">
                            <div className={`w-[45%] rounded-xs ${isChanged ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" : "bg-[#7A6A55]"}`} />
                            <div className={`w-[45%] rounded-xs ${isChanged ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" : "bg-[#7A6A55]"}`} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-[#111A11] p-2 rounded-lg border border-emerald-900/60 text-center text-xs font-serif text-emerald-300">
                Động Hào {result.changingLine} ➔ Biến thành Quẻ #{result.transformedHex.number}
              </div>
            </div>
          </div>

          {/* 2. BẢNG PHÂN TÍCH THỂ - DỤNG NGŨ HÀNH CHI TIẾT */}
          <div className="bg-gradient-to-r from-[#20150D] via-[#2A1C10] to-[#1D130B] border border-[#6B4B27] rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#3D2916] pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C9A55A] animate-ping" />
                <h4 className="text-sm sm:text-base font-serif font-bold text-[#E6D3A3]">
                  Luận Định Thể - Dụng: {result.relation}
                </h4>
              </div>

              <div className={`px-3 py-1 rounded-xl text-xs font-serif font-bold border ${result.badgeColor} shadow`}>
                {result.verdict}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#F3E5D0] font-serif leading-relaxed italic">
              👉 “{result.meaning}”
            </p>

            {/* Chi tiết tương tác ngũ hành */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs font-serif">
              <div className="bg-[#140D07] p-3 rounded-xl border border-[#3A2615] space-y-1">
                <span className="text-[#E6D3A3] font-bold block flex items-center gap-1.5">
                  <span>👑</span>
                  <span>THỂ QUÁI: Quẻ {result.theTrigram.name} ({result.theTrigram.nature})</span>
                </span>
                <p className="text-[11.5px] text-[#BFB09A]">
                  Hành: <strong className="text-white">{result.theTrigram.element}</strong> • Đại diện cho bản thân người chiêm bặc, chủ thể mưu cầu sự việc.
                </p>
              </div>

              <div className="bg-[#140D07] p-3 rounded-xl border border-[#3A2615] space-y-1">
                <span className="text-sky-300 font-bold block flex items-center gap-1.5">
                  <span>🎯</span>
                  <span>DỤNG QUÁI: Quẻ {result.dungTrigram.name} ({result.dungTrigram.nature})</span>
                </span>
                <p className="text-[11.5px] text-[#BFB09A]">
                  Hành: <strong className="text-white">{result.dungTrigram.element}</strong> • Đại diện cho việc cần hỏi, đối phương, hoặc hoàn cảnh khách quan bên ngoài.
                </p>
              </div>
            </div>
          </div>

          {/* Watermark khi kết xuất hình ảnh */}
          <div className="pt-2 border-t border-[#3E2C1A] flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#8C7A65] font-serif">
            <span>🌸 Mai Hoa Dịch Số • Thiệu Khang Tiết (Tống Triều)</span>
            <span>Khởi Quẻ Tiên Thiên Bát Quái • Luận Thể Dụng Sinh Khắc</span>
          </div>

          {/* 3. ACTION BUTTONS */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5 flex-wrap no-capture">
            <button
              type="button"
              onClick={handleProceedToInterpretation}
              className="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-emerald-600 via-amber-400 to-emerald-600 hover:brightness-110 active:scale-95 text-[#111] font-bold font-serif text-xs sm:text-sm rounded-2xl shadow-[0_0_20px_rgba(52,211,153,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Xem Luận Giải Chi Tiết Cả Quẻ</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => handleCaptureMaiHoa("primary")}
              disabled={isCapturing}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-serif font-bold bg-gradient-to-r from-[#8C6218] via-[#C9A55A] to-[#8C6218] hover:brightness-110 active:scale-95 text-[#14100C] border border-[#E6D3A3]/80 shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all cursor-pointer"
              title="Chụp ảnh riêng Quẻ Hoa Mai Ban Đầu (Quẻ Chủ / Bản Quái)"
            >
              {isCapturing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4 text-[#14100C]" />}
              <span>Chụp Quẻ Ban Đầu</span>
            </button>

            <button
              type="button"
              onClick={() => handleCaptureMaiHoa("full")}
              disabled={isCapturing}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-serif font-bold bg-[#2A1D11] hover:bg-[#3D2918] text-[#E6D3A3] border border-[#6B4B27] hover:border-[#C9A55A] transition-all cursor-pointer shadow active:scale-95"
              title="Chụp ảnh toàn bộ Tam Quái Mai Hoa (Chủ - Hỗ - Biến & Thể Dụng)"
            >
              {isCapturing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4 text-[#C9A55A]" />}
              <span>Chụp Toàn Bộ Quẻ</span>
            </button>

            <button
              type="button"
              onClick={handleResetInternal}
              className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-xs font-serif bg-[#241A12] hover:bg-[#342417] text-[#E6D3A3] border border-[#523A21] cursor-pointer shadow active:scale-95"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Khởi quẻ khác</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal Xem & Tải Ảnh Quẻ Mai Hoa */}
      <ExportImageModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        imageUrl={exportedImageUrl}
        title={exportModalTitle}
        filename={exportModalFilename}
      />
    </div>
  );
};
