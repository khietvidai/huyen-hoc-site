import React, { useState, useEffect, useRef } from "react";
import {
  Dices,
  RotateCw,
  Sparkles,
  Scroll,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Flame,
  BookOpen,
  Compass,
  Layers,
  HelpCircle,
  FileText,
  ShieldAlert,
  Award,
  ArrowRight,
  CheckCircle2,
  Bookmark,
  Scale,
  AlertTriangle,
  X,
} from "lucide-react";
import { Hexagram } from "../types";
import { HexagramVisual } from "./HexagramVisual";
import { getTransformedHexagram } from "../data/hexagrams";
import { getKhongMinhForHexagram, KhongMinhLineItem } from "../data/khongMinhBridgeData";
import { getCanonicalHexagram, CanonicalHexagram, CanonicalYao } from "../data/canonical";
import { BOOK_HEXAGRAMS, RED_HEADLINES_DATA } from "../data/bookHexagrams";
import { getKhongMinhComprehensive } from "../data/khongMinhOracleDetails";
import {
  getMovingLineComprehensiveAnalysis,
  KhongMinhTuongYAnalysis,
} from "../data/ichingAuxiliaryAnalysis";
import { zenAudio } from "../utils/zenAudio";
import { KhongMinhKinhDichView } from "./KhongMinhKinhDichView";

export interface EarthlyBranchDiceItem {
  number: number; // 1 to 12
  code: string; // "01", "02", ..., "12"
  branchName: string; // "Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"
  hanzi: string; // "子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"
  line: number; // 1 to 6
  element: string; // "Dương Thủy", etc.
  note: string;
}

export const EARTHLY_BRANCHES_DICE: EarthlyBranchDiceItem[] = [
  { number: 1, code: "01", branchName: "Tý", hanzi: "子", line: 1, element: "Dương Thủy", note: "Động Sơ Hào (Hào 1)" },
  { number: 2, code: "02", branchName: "Sửu", hanzi: "丑", line: 2, element: "Âm Thổ", note: "Động Nhị Hào (Hào 2)" },
  { number: 3, code: "03", branchName: "Dần", hanzi: "寅", line: 3, element: "Dương Mộc", note: "Động Tam Hào (Hào 3)" },
  { number: 4, code: "04", branchName: "Mão", hanzi: "卯", line: 4, element: "Âm Mộc", note: "Động Tứ Hào (Hào 4)" },
  { number: 5, code: "05", branchName: "Thìn", hanzi: "辰", line: 5, element: "Dương Thổ", note: "Động Ngũ Hào (Hào 5)" },
  { number: 6, code: "06", branchName: "Tỵ", hanzi: "巳", line: 6, element: "Âm Hỏa", note: "Động Thượng Hào (Hào 6)" },
  { number: 7, code: "07", branchName: "Ngọ", hanzi: "午", line: 1, element: "Dương Hỏa", note: "Số 7 là Ngọ trở lại Hào 1" },
  { number: 8, code: "08", branchName: "Mùi", hanzi: "未", line: 2, element: "Âm Thổ", note: "Tương ứng Nhị Hào (Hào 2)" },
  { number: 9, code: "09", branchName: "Thân", hanzi: "申", line: 3, element: "Dương Kim", note: "Tương ứng Tam Hào (Hào 3)" },
  { number: 10, code: "10", branchName: "Dậu", hanzi: "酉", line: 4, element: "Âm Kim", note: "Tương ứng Tứ Hào (Hào 4)" },
  { number: 11, code: "11", branchName: "Tuất", hanzi: "戌", line: 5, element: "Dương Thổ", note: "Tương ứng Ngũ Hào (Hào 5)" },
  { number: 12, code: "12", branchName: "Hợi", hanzi: "亥", line: 6, element: "Âm Thủy", note: "Tương ứng Thượng Hào (Hào 6)" },
];

interface TamTaiDiceRollSectionProps {
  drawnCards?: Hexagram[];
  primaryHexagram: Hexagram;
  selectedCardIdx?: number | null;
  onSelectCardIdx?: (idx: number | null) => void;
  activeChangingLine: number | null;
  onApplyChangingLine: (line: number, diceItem: EarthlyBranchDiceItem, targetHex: Hexagram, transformedHex?: Hexagram) => void;
  onJumpToThuyetMinh?: (line: number, targetTab?: "canonical" | "khongminh") => void;
  onNavigateToManual?: (hexNum: number) => void;
  onClose?: () => void;
  onShowToast?: (msg: string) => void;
}

// Component hiển thị Tượng Ý Kinh Dịch (Trích Thuyết Minh Quẻ Khổng Minh) cho Quẻ Chính, Tông, Hỗ, Thác
const TuongYKhongMinhBox: React.FC<{
  tuongY: KhongMinhTuongYAnalysis | undefined;
  hexTitle: string;
  lineTitle: string;
  defaultExpanded?: boolean;
}> = ({ tuongY, hexTitle, lineTitle, defaultExpanded = true }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (!tuongY) return null;

  return (
    <div className="bg-[#150F0A] border border-[#3E2917] hover:border-[#5A3B20] rounded-xl p-3.5 sm:p-4 space-y-3 mt-3 shadow-inner transition-colors">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between border-b border-[#2C1D10] pb-2 flex-wrap gap-2 cursor-pointer select-none group"
        title={isExpanded ? "Bấm để thu gọn Tượng Ý" : "Bấm để xem chi tiết Tượng Ý"}
      >
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#C9A55A] uppercase tracking-wider group-hover:text-amber-300 transition-colors">
          <BookOpen className="w-3.5 h-3.5 text-[#C9A55A] group-hover:scale-110 transition-transform" />
          <span>TƯỢNG Ý KINH DỊCH • TRÍCH THUYẾT MINH QUẺ KHỔNG MINH</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-[#C9A55A] bg-[#22150A] px-2 py-0.5 rounded border border-[#482E16]">
            {hexTitle} • {lineTitle}
          </span>
          <span className="text-[11px] font-mono text-amber-400/90 flex items-center gap-1 bg-[#25170E] px-2 py-0.5 rounded border border-[#523318] group-hover:bg-[#341F12] transition-colors">
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            <span className="text-[10px]">{isExpanded ? "Thu gọn" : "Xem chi tiết"}</span>
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-3">
          {/* 1. Tượng Quẻ & Ý Quẻ (Toàn Quái) */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-mono text-[#E28355] font-bold uppercase tracking-wide">
              ❖ TƯỢNG QUẺ & Ý QUẺ (TOÀN QUÁI):
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {/* Tượng Quẻ */}
              <div className="bg-[#1C140C] p-2.5 rounded-lg border border-[#362413] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[#E6D3A3] font-bold">Tượng Quẻ (象卦):</span>
                  {tuongY.tuongQueHanzi && (
                    <span className="text-[#C9A55A] font-serif text-xs">{tuongY.tuongQueHanzi}</span>
                  )}
                </div>
                <div className="text-[#F5EAD4] font-medium">{tuongY.tuongQue}</div>
                {tuongY.tuongQueMeaning && (
                  <p className="text-[11px] text-[#A89882] italic leading-tight">
                    {tuongY.tuongQueMeaning}
                  </p>
                )}
              </div>

              {/* Ý Quẻ */}
              <div className="bg-[#1C140C] p-2.5 rounded-lg border border-[#362413] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[#E28355] font-bold">Ý Quẻ (意卦):</span>
                  {tuongY.yQueHanzi && (
                    <span className="text-[#E28355] font-serif text-xs">{tuongY.yQueHanzi}</span>
                  )}
                </div>
                <div className="text-[#F5EAD4] font-medium">{tuongY.yQue}</div>
                {tuongY.yQueMeaning && (
                  <p className="text-[11px] text-[#A89882] italic leading-tight">
                    {tuongY.yQueMeaning}
                  </p>
                )}
              </div>
            </div>

            {/* Đại Tượng Truyện */}
            {tuongY.daiTuong && (
              <div className="bg-[#181109] px-3 py-2 rounded-lg border border-[#2D1B0D] text-[11.5px] text-[#CBB99E] space-y-0.5">
                <strong className="text-[#E6D3A3] font-mono text-[10.5px] uppercase block">
                  🏛️ Đại Tượng Truyện (Khổng Tử):
                </strong>
                <p className="italic text-[#EAE0D0]">"{tuongY.daiTuong}"</p>
                {tuongY.daiTuongMeaning && (
                  <p className="text-[#A89882]">➔ {tuongY.daiTuongMeaning}</p>
                )}
              </div>
            )}
          </div>

          {/* 2. Tượng Hào & Ý Hào (Hào Biến) */}
          <div className="space-y-1.5 pt-1 border-t border-[#26180E]">
            <div className="text-[11px] font-mono text-[#C9A55A] font-bold uppercase tracking-wide">
              ❖ TƯỢNG HÀO & Ý HÀO (HÀO BIẾN):
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {/* Tượng Hào */}
              <div className="bg-[#1C140C] p-2.5 rounded-lg border border-[#362413] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[#E6D3A3] font-bold">Tượng Hào (象爻):</span>
                  {tuongY.tuongHaoHanzi && (
                    <span className="text-[#C9A55A] font-serif text-xs">{tuongY.tuongHaoHanzi}</span>
                  )}
                </div>
                <div className="text-[#F5EAD4] font-medium">{tuongY.tuongHao}</div>
                {tuongY.tuongHaoMeaning && (
                  <p className="text-[11px] text-[#A89882] italic leading-tight">
                    {tuongY.tuongHaoMeaning}
                  </p>
                )}
              </div>

              {/* Ý Hào */}
              <div className="bg-[#1C140C] p-2.5 rounded-lg border border-[#362413] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[#E28355] font-bold">Ý Hào (意爻):</span>
                  {tuongY.yHaoHanzi && (
                    <span className="text-[#E28355] font-serif text-xs">{tuongY.yHaoHanzi}</span>
                  )}
                </div>
                <div className="text-[#F5EAD4] font-medium">{tuongY.yHao}</div>
                {tuongY.yHaoMeaning && (
                  <p className="text-[11px] text-[#A89882] italic leading-tight">
                    {tuongY.yHaoMeaning}
                  </p>
                )}
              </div>
            </div>

            {/* Tiểu Tượng Truyện */}
            {tuongY.tieuTuong && (
              <div className="bg-[#181109] px-3 py-2 rounded-lg border border-[#2D1B0D] text-[11.5px] text-[#CBB99E] space-y-0.5">
                <strong className="text-[#E28355] font-mono text-[10.5px] uppercase block">
                  📜 Tiểu Tượng Truyện (Khổng Tử):
                </strong>
                <p className="italic text-[#EAE0D0]">"{tuongY.tieuTuong}"</p>
                {tuongY.tieuTuongMeaning && (
                  <p className="text-[#A89882]">➔ {tuongY.tieuTuongMeaning}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const renderTuongYKhongMinh = (
  tuongY: KhongMinhTuongYAnalysis | undefined,
  hexTitle: string,
  lineTitle: string
) => {
  return (
    <TuongYKhongMinhBox
      tuongY={tuongY}
      hexTitle={hexTitle}
      lineTitle={lineTitle}
      defaultExpanded={true}
    />
  );
};

export const TamTaiDiceRollSection: React.FC<TamTaiDiceRollSectionProps> = ({
  drawnCards,
  primaryHexagram,
  selectedCardIdx: _selectedCardIdx,
  onSelectCardIdx,
  activeChangingLine,
  onApplyChangingLine,
  onJumpToThuyetMinh,
  onNavigateToManual,
  onClose,
  onShowToast,
}) => {
  // Duy nhất lá bài Nhân Đạo (Lá 3 - index 2) mới hiện xúc xắc 12 mặt
  const targetCardIdx = 2;
  const nhanHex = drawnCards && drawnCards[2] ? drawnCards[2] : (drawnCards && drawnCards[0] ? drawnCards[0] : primaryHexagram);
  const currentHex = nhanHex;
  const targetHex = nhanHex;

  // Dice rolling state per card index (exclusively for Card 2: Nhân)
  const [rolledDiceMap, setRolledDiceMap] = useState<Record<number, number>>({});
  const [diceNumber, setDiceNumber] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [cyclingNumber, setCyclingNumber] = useState(1);
  const [showInterpretationBox, setShowInterpretationBox] = useState(true);
  const [showAllBranchesGrid, setShowAllBranchesGrid] = useState(false);
  const [showLegacyDeepAnalysis, setShowLegacyDeepAnalysis] = useState(false);
  const [showLegacyTuQuaiAnalysis, setShowLegacyTuQuaiAnalysis] = useState(false);

  const rollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);
    };
  }, []);

  // Determine if Nhân card has been rolled:
  const currentCardDice =
    rolledDiceMap[2] ??
    (activeChangingLine
      ? EARTHLY_BRANCHES_DICE.find((b) => b.line === activeChangingLine)?.number ?? null
      : null);
  const hasRolled = currentCardDice !== null;

  // Determine current active branch: if rolled use currentCardDice, otherwise fallback for calculations
  const currentBranchItem: EarthlyBranchDiceItem = currentCardDice
    ? EARTHLY_BRANCHES_DICE.find((b) => b.number === currentCardDice) || EARTHLY_BRANCHES_DICE[0]
    : EARTHLY_BRANCHES_DICE[0];

  const activeLine = currentBranchItem.line;

  // Calculate transformed hexagram for Nhân Đạo
  const calculatedTransformedHex: Hexagram | undefined = getTransformedHexagram(nhanHex, [activeLine]);

  // Canonical I Ching data (Thoán từ, Tượng ý toàn quẻ, Hào từ cốt lõi) for Nhân Đạo
  const canonicalHex: CanonicalHexagram | undefined = getCanonicalHexagram(nhanHex.number);
  const canonicalYao: CanonicalYao | undefined = canonicalHex?.lines?.[activeLine - 1];

  // Canonical data for currently viewed card (if Thiên 0 or Địa 1)
  const currentCanonicalHex: CanonicalHexagram | undefined = getCanonicalHexagram(currentHex.number);
  const currentRedHeadline = RED_HEADLINES_DATA[currentHex.number];
  const currentBookHex = BOOK_HEXAGRAMS.find((b) => b.number === currentHex.number);

  // Khổng Minh oracle bridge data for Nhân Đạo hexagram and line
  const khongMinhBridge = getKhongMinhForHexagram(nhanHex.number);
  const khongMinhLineItem: KhongMinhLineItem | undefined = khongMinhBridge?.lines?.find(
    (l) => l.line === activeLine
  );

  // Book summary data for Nhân Đạo
  const bookHex = BOOK_HEXAGRAMS.find((b) => b.number === nhanHex.number);
  const redHeadlineDetail = RED_HEADLINES_DATA[nhanHex.number];

  // Extract clean translation of Khổng Minh poem
  const poemMatch = khongMinhLineItem?.oracleMeaning?.match(/Dịch nghĩa thơ:\s*(".*?"|'.*?'|[^.]+\.)/);
  const poemTranslation = poemMatch
    ? poemMatch[1].replace(/^["']|["']$/g, "")
    : khongMinhLineItem?.poemSegments && khongMinhLineItem.poemSegments.length > 0
    ? khongMinhLineItem.poemSegments.map((s) => s.meaning).join(", ") + "."
    : khongMinhLineItem?.oracleMeaning?.split("Điển tích")[0].replace(/^Dịch nghĩa thơ:\s*["']?/, "").replace(/["']?\s*\.?$/, "") || "";

  const histText =
    khongMinhLineItem?.historicalAllusion ||
    khongMinhLineItem?.oracleMeaning
      ?.match(/Điển tích & Lịch sử:\s*(.*?)(?=\s*Triết học & Đạo giáo:|$)/)?.[1]
      ?.trim();
  const philText =
    khongMinhLineItem?.philosophicalMeaning ||
    khongMinhLineItem?.oracleMeaning?.match(/Triết học & Đạo giáo:\s*(.+)$/)?.[1]?.trim();

  // Roll dice action - always rolls for Card 2 (Nhân Đạo)
  const handleRollDice = (explicitNum?: number) => {
    if (isRolling) return;

    // Ensure we are selecting Card 2 (Nhân Đạo)
    if (targetCardIdx !== 2) {
      onSelectCardIdx?.(2);
    }

    setIsRolling(true);
    zenAudio.strikeSingingBowl(440, 0.35);

    let counter = 0;
    const totalTicks = 16;
    const finalVal = explicitNum !== undefined ? explicitNum : Math.floor(Math.random() * 12) + 1;

    rollIntervalRef.current = setInterval(() => {
      counter++;
      const randomDisplay = Math.floor(Math.random() * 12) + 1;
      setCyclingNumber(randomDisplay);

      if (counter >= totalTicks) {
        if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);
        setDiceNumber(finalVal);
        setRolledDiceMap((prev) => ({ ...prev, [2]: finalVal }));
        setIsRolling(false);

        const chosenBranch = EARTHLY_BRANCHES_DICE.find((b) => b.number === finalVal)!;
        const transHex = getTransformedHexagram(nhanHex, [chosenBranch.line]);

        // Sound flourish on result
        zenAudio.strikeSingingBowl(580, 0.45);

        // Notify parent
        onApplyChangingLine(chosenBranch.line, chosenBranch, nhanHex, transHex);
      }
    }, 65);
  };

  const activeDisplayNumber = isRolling ? cyclingNumber : hasRolled ? currentBranchItem.number : 1;
  const activeBranchDisplay = EARTHLY_BRANCHES_DICE.find((b) => b.number === activeDisplayNumber)!;

  const tamTaiRealms = [
    {
      name: "Thiên Đạo",
      hanzi: "天",
      sub: "Thiên Thời & Khách Quan",
      desc: "Phản ánh vận hội vũ trụ, thời cơ khách quan, bối cảnh vĩ mô và các biến số bên ngoài chi phối.",
      guide: "Định hướng: Vận Thế & Đại Tượng",
      color: "text-[#C9A55A]",
      borderColor: "border-[#C9A55A]",
      bgBadge: "bg-[#2D2114]",
      activeBg: "bg-[#271C11]",
      label: "Thiên Đạo (Thiên Thời & Khách Quan)",
    },
    {
      name: "Địa Đạo",
      hanzi: "地",
      sub: "Địa Lợi & Môi Trường",
      desc: "Phản ánh môi trường thực địa, nền tảng cơ sở vật chất, tài nguyên sẵn có và vị thế chỗ đứng.",
      guide: "Định hướng: Cấu Trúc Quẻ & Nền Móng",
      color: "text-[#EAD8B1]",
      borderColor: "border-[#EAD8B1]",
      bgBadge: "bg-[#251F19]",
      activeBg: "bg-[#221A13]",
      label: "Địa Đạo (Địa Lợi & Môi Trường)",
    },
    {
      name: "Nhân Đạo",
      hanzi: "人",
      sub: "Nhân Hòa & Con Người",
      desc: "Phản ánh tâm thế nỗ lực chủ quan, đạo đối nhân xử thế, sự tương tác và ý chí quyết định hành động.",
      guide: "Định hướng: Kim Chỉ Nam & Lời Khuyên",
      color: "text-[#E28355]",
      borderColor: "border-[#E28355]",
      bgBadge: "bg-[#2A1A12]",
      activeBg: "bg-[#26160F]",
      label: "Nhân Đạo (Nhân Hòa & Con Người)",
    },
  ];

  const cardRoleLabels = tamTaiRealms;

  return (
    <div
      id="tam-tai-dice-section"
      className="bg-gradient-to-br from-[#1C150E] via-[#140F0A] to-[#0D0906] p-4 sm:p-6 rounded-2xl border border-[#523C23] shadow-2xl relative overflow-hidden space-y-6"
    >
      {/* Decorative Background Aura */}
      <div className="absolute -top-12 -right-12 w-56 h-56 bg-[#C9A55A]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-52 h-52 bg-[#EF4444]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#342415] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C9A55A] to-[#8C6218] flex items-center justify-center text-[#120F0C] font-black shadow-lg shrink-0">
            <Dices className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#C9A55A] bg-[#291B10] px-2 py-0.5 rounded border border-[#4D351E]">
                Duy Nhất Lá Bài Nhân Đạo
              </span>
              <span className="text-[10px] text-[#A69780] font-serif">
                • 12 Địa Chi Khởi Hào Động (Tý 01 ➔ Hợi 12)
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-serif font-bold text-[#F8EBD4] mt-0.5 flex items-center gap-2">
              <span>Gieo Xúc Xắc 12 Mặt Lá Nhân Đạo (#{nhanHex.number} {nhanHex.name})</span>
              <Sparkles className="w-3.5 h-3.5 text-[#C9A55A] animate-pulse" />
            </h3>
          </div>
        </div>

        {/* Controls: Toggle Interpretation Box + Close Button */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto flex-wrap">
          <label className="flex items-center gap-2.5 cursor-pointer select-none bg-[#20160D] hover:bg-[#2C1E12] px-3 py-1.5 rounded-xl border border-[#4D3620] hover:border-[#C9A55A]/60 transition-all shadow-md group">
            <input
              type="checkbox"
              checked={showInterpretationBox}
              onChange={(e) => setShowInterpretationBox(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 ${
                showInterpretationBox ? "bg-[#C9A55A]" : "bg-[#332517]"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-[#120F0C] shadow-md transition-transform duration-200 transform ${
                  showInterpretationBox ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-serif font-bold text-[#F3EAD7]">
                Ô Luận Giải Hào Động
              </span>
              <span
                className={`text-[9.5px] font-mono px-1.5 py-0.2 rounded font-black tracking-wider ${
                  showInterpretationBox
                    ? "bg-[#C9A55A] text-[#120F0C]"
                    : "bg-[#291F14] text-[#8C7A65] border border-[#3E2D1B]"
                }`}
              >
                {showInterpretationBox ? "BẬT" : "TẮT"}
              </span>
            </div>
          </label>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#261A10] hover:bg-[#382516] text-[#E0D0B8] hover:text-[#FFF] border border-[#523A21] hover:border-[#C9A55A] text-xs font-serif font-bold transition-all cursor-pointer shadow active:scale-95"
              title="Đóng bàn xúc xắc để trở về xem 3 lá bài bình thường"
            >
              <X className="w-3.5 h-3.5 text-[#C9A55A]" />
              <span>Thu Gọn</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Interactive Dice Rolling Stage (Duy nhất tại Lá bài Nhân) */}
      <div className="bg-[#120D08] p-4 sm:p-5 rounded-xl border border-[#3E2B19] flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: 12-Sided Dodecahedron Visual & Roll Button */}
        <div className="flex flex-col items-center gap-3 w-full md:w-auto">
          {/* 3D D12 Graphic */}
          <div
            onClick={() => handleRollDice()}
            className={`w-28 h-28 sm:w-32 sm:h-32 rounded-2xl relative flex items-center justify-center cursor-pointer select-none transition-transform duration-300 group ${
              isRolling ? "animate-bounce scale-105" : "hover:scale-105 active:scale-95"
            }`}
            title="Bấm vào đây hoặc nút Gieo Xúc Xắc để lắc xúc xắc 12 mặt"
          >
            {/* Outer Glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#C9A55A]/30 via-transparent to-[#EF4444]/20 blur-md group-hover:blur-lg transition-all" />

            {/* D12 SVG Facet */}
            <svg
              viewBox="0 0 120 120"
              className={`w-full h-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] ${
                isRolling ? "animate-spin duration-700" : ""
              }`}
            >
              <defs>
                <linearGradient id="diceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2E1F11" />
                  <stop offset="50%" stopColor="#1E140B" />
                  <stop offset="100%" stopColor="#110A05" />
                </linearGradient>
                <linearGradient id="goldEdge" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFE082" />
                  <stop offset="50%" stopColor="#C9A55A" />
                  <stop offset="100%" stopColor="#8C6218" />
                </linearGradient>
              </defs>

              {/* Dodecahedron Pentagon Outline */}
              <polygon
                points="60,6 112,43 93,103 27,103 8,43"
                fill="url(#diceGrad)"
                stroke="url(#goldEdge)"
                strokeWidth="3.5"
                strokeLinejoin="round"
              />

              {/* Inner facet lines for 3D feel */}
              <line x1="60" y1="6" x2="60" y2="48" stroke="#C9A55A" strokeWidth="1.2" opacity="0.6" />
              <line x1="112" y1="43" x2="60" y2="48" stroke="#C9A55A" strokeWidth="1.2" opacity="0.6" />
              <line x1="8" y1="43" x2="60" y2="48" stroke="#C9A55A" strokeWidth="1.2" opacity="0.6" />
              <line x1="93" y1="103" x2="60" y2="78" stroke="#C9A55A" strokeWidth="1.2" opacity="0.6" />
              <line x1="27" y1="103" x2="60" y2="78" stroke="#C9A55A" strokeWidth="1.2" opacity="0.6" />
              <line x1="60" y1="48" x2="60" y2="78" stroke="#C9A55A" strokeWidth="1.2" opacity="0.6" />

              {/* Inner Center Pentagonal Facet */}
              <polygon
                points="60,35 84,52 75,80 45,80 36,52"
                fill="#24170C"
                stroke="#C9A55A"
                strokeWidth="1.5"
                opacity="0.85"
              />
            </svg>

            {/* Central Dice Face Content: Hanzi & Numeral */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none z-10 pt-1">
              {hasRolled || isRolling ? (
                <>
                  <span className="font-serif font-black text-2xl sm:text-3xl text-[#E6D3A3] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    {activeBranchDisplay.hanzi}
                  </span>
                  <div className="flex items-center gap-1 font-mono font-bold text-xs text-[#C9A55A] bg-[#160E07]/90 px-1.5 py-0.5 rounded border border-[#48331E] shadow">
                    <span>{activeBranchDisplay.code}</span>
                    <span className="font-serif">{activeBranchDisplay.branchName}</span>
                  </div>
                </>
              ) : (
                <>
                  <Dices className="w-8 h-8 text-[#E6D3A3] drop-shadow animate-pulse mb-1" />
                  <div className="font-mono font-bold text-[10px] text-[#C9A55A] bg-[#160E07]/90 px-2 py-0.5 rounded border border-[#48331E] shadow">
                    GIEO NGAY
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Roll Button */}
          <button
            type="button"
            onClick={() => handleRollDice()}
            disabled={isRolling}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-serif font-bold text-xs sm:text-sm bg-gradient-to-r from-[#C9A55A] via-[#D6B97A] to-[#B38728] hover:from-[#F2C965] hover:to-[#C9A55A] text-[#120F0C] shadow-lg hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <RotateCw className={`w-4 h-4 ${isRolling ? "animate-spin" : ""}`} />
            <span>{isRolling ? "Đang Lắc Xúc Xắc 12 Mặt..." : "Gieo Xúc Xắc 12 Mặt (Thập Nhị Chi)"}</span>
          </button>
        </div>

        {/* Right: Detailed Result & Changing Line Interpretation */}
        <div className="flex-1 w-full space-y-3 bg-[#17100A] p-4 rounded-xl border border-[#342213]">
          <div className="flex items-center justify-between border-b border-[#2C1D10] pb-2 flex-wrap gap-2">
            <span className="text-xs font-serif font-bold text-[#EAD8B1] flex items-center gap-1.5">
              <span>Quy Luật Địa Chi ➔ Hào Động:</span>
            </span>
            <button
              type="button"
              onClick={() => setShowAllBranchesGrid(!showAllBranchesGrid)}
              className="text-[10px] font-mono text-[#C9A55A] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{showAllBranchesGrid ? "Ẩn bảng 12 Chi" : "Xem bảng đối chiếu 12 Chi"}</span>
              {showAllBranchesGrid ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {/* Result Card */}
          {hasRolled ? (
            <div className="space-y-2.5 animate-in fade-in duration-300">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 bg-[#281A0F] px-3 py-1.5 rounded-lg border border-[#523A20] shadow">
                  <span className="text-xs font-mono font-bold text-[#C9A55A]">
                    Mặt số: {currentBranchItem.code}
                  </span>
                  <span className="text-sm font-serif font-black text-[#E6D3A3]">
                    • Chi {currentBranchItem.branchName} ({currentBranchItem.hanzi})
                  </span>
                  <span className="text-[10.5px] text-[#A69780] font-serif">
                    • {currentBranchItem.element}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 bg-gradient-to-r from-red-600/30 via-red-600/20 to-transparent px-3 py-1.5 rounded-lg border border-red-500/60 text-red-300 font-bold text-xs sm:text-sm shadow-[0_0_12px_rgba(239,68,68,0.25)]">
                  <Flame className="w-4 h-4 text-red-400 shrink-0 animate-pulse" />
                  <span>➔ ĐỘNG HÀO {currentBranchItem.line}</span>
                </div>
              </div>

              <div className="text-xs font-serif text-[#DFCBB2] leading-relaxed bg-[#100A06] p-2.5 rounded-lg border border-[#26170B]">
                <strong className="text-[#C9A55A]">Luận biến Chu Dịch: </strong>
                Quẻ gốc <strong className="text-[#FFE082]">#{targetHex.number} {targetHex.name}</strong> động <strong>Hào {currentBranchItem.line}</strong> ({currentBranchItem.note}).
              </div>
            </div>
          ) : (
            <div className="space-y-2.5 bg-[#100A06] p-3 rounded-lg border border-[#26170B] animate-in fade-in duration-300">
              <div className="flex items-center gap-2 text-xs font-serif font-bold text-[#EAD8B1]">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span>Chưa gieo xúc xắc cho {cardRoleLabels[targetCardIdx]?.label.split(" (")[0]}</span>
              </div>
              <p className="text-xs font-serif text-[#A89882] leading-relaxed">
                Quẻ <strong className="text-[#FFE082]">#{targetHex.number} {targetHex.name}</strong> chưa xác định hào động. Bấm nút vàng <strong className="text-[#E6D3A3]">"Gieo Xúc Xắc 12 Mặt"</strong> bên trái để bốc ngẫu nhiên một trong 12 Địa Chi (Tý ➔ Hợi) và mở phần luận giải chi tiết.
              </p>
            </div>
          )}

          {/* Quick branch click buttons if expanded */}
          {showAllBranchesGrid && (
            <div className="pt-2 border-t border-[#2B1B0F] space-y-1.5">
              <div className="text-[10.5px] font-serif text-[#A69780]">
                Bấm vào một Chi bất kỳ để thử nghiệm kết quả tương ứng:
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5">
                {EARTHLY_BRANCHES_DICE.map((b) => {
                  const isCurrent = hasRolled && currentBranchItem.number === b.number;
                  return (
                    <button
                      key={b.number}
                      type="button"
                      onClick={() => handleRollDice(b.number)}
                      className={`p-1.5 rounded-lg text-center font-serif text-[10.5px] border transition-all cursor-pointer ${
                        isCurrent
                          ? "bg-red-600 text-white font-bold border-red-400 shadow-[0_0_8px_#ef4444]"
                          : "bg-[#1E140C] text-[#C4B49C] border-[#362313] hover:border-[#C9A55A]"
                      }`}
                    >
                      <div className="font-mono text-[9px] font-bold opacity-80">{b.code}</div>
                      <div className="font-bold">{b.branchName} ({b.hanzi})</div>
                      <div className="text-[9px] text-amber-300/90 font-mono">Hào {b.line}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Ô THÔNG TIN TOÀN DIỆN HÀO ĐỘNG TAM TÀI & KHỔNG MINH THẦN QUẺ             */}
      {/* 1. Hiện hình quẻ Kinh Dịch và hào động màu đỏ phát sáng                 */}
      {/* 2. Phần tượng ý chính của quẻ chính                                     */}
      {/* 3. Phần tượng ý của hào động                                            */}
      {/* 4. Thơ Khổng Minh chữ Hán, phiên âm và dịch nghĩa                       */}
      {/* 5. Phân tích thơ Khổng Minh                                             */}
      {/* ========================================================================= */}
      {!hasRolled ? (
        <div className="bg-[#140E09] border border-[#3E2B19] border-dashed rounded-2xl p-6 sm:p-8 text-center space-y-3.5 animate-in fade-in duration-300">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2D1F12] to-[#1A120B] border border-[#523A20] flex items-center justify-center mx-auto text-[#C9A55A] shadow-inner">
            <Dices className="w-7 h-7 animate-pulse text-[#FFE082]" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base sm:text-lg font-serif font-bold text-[#F3E5AB]">
              Chưa Gieo Xúc Xắc Xác Định Hào Động Tam Tài
            </h4>
            <p className="text-xs sm:text-sm font-serif text-[#A89882] max-w-lg mx-auto leading-relaxed">
              Phần đại luận giải chi tiết (<strong className="text-[#E6C673]">Đồ hình Quẻ Chính phát sáng hào biến, Quẻ Xăm Khổng Minh, Quẻ Tông, Quẻ Hỗ, Quẻ Thác</strong>) sẽ hiển thị ngay khi bạn gieo xúc xắc 12 mặt để bắt quẻ Địa Chi cho lá bài <strong className="text-[#FFE082]">{cardRoleLabels[targetCardIdx]?.label.split(" (")[0]}</strong>.
            </p>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => handleRollDice()}
              disabled={isRolling}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-serif font-bold text-xs sm:text-sm bg-gradient-to-r from-[#C9A55A] via-[#D6B97A] to-[#B38728] hover:from-[#F2C965] hover:to-[#C9A55A] text-[#120F0C] shadow-lg hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] cursor-pointer active:scale-95 transition-all disabled:opacity-50"
            >
              <RotateCw className={`w-4 h-4 ${isRolling ? "animate-spin" : ""}`} />
              <span>{isRolling ? "Đang Gieo Xúc Xắc..." : "Gieo Xúc Xắc 12 Mặt Ngay"}</span>
            </button>
          </div>
        </div>
      ) : showInterpretationBox ? (
        <div
          id="tam-tai-comprehensive-interpretation-box"
          className="bg-gradient-to-br from-[#1F150C] via-[#160E07] to-[#0D0804] p-4 sm:p-6 rounded-2xl border-2 border-[#C9A55A]/70 shadow-2xl space-y-6 relative overflow-hidden animate-in fade-in duration-300"
        >
          {/* Header of the box */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#3E2B18] pb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded-full bg-red-500 shadow-[0_0_12px_#EF4444] animate-pulse shrink-0" />
              <div>
                <h3 className="text-base sm:text-lg font-serif font-black text-[#E6D3A3] tracking-wide flex items-center gap-2 flex-wrap">
                  <span>LUẬN GIẢI HÀO ĐỘNG TAM TÀI & KHỔNG MINH THẦN QUẺ</span>
                  <span className="text-[11px] font-mono font-bold bg-red-600/90 text-white px-2.5 py-0.5 rounded-full border border-red-400 shadow">
                    🔥 ĐỘNG HÀO {activeLine} ({currentBranchItem.branchName})
                  </span>
                </h3>
                <div className="text-xs text-[#C4B49C] font-serif mt-0.5">
                  Ứng với: <strong>Quẻ #{targetHex.number} {targetHex.name}</strong> • Vị trí: <strong>{cardRoleLabels[targetCardIdx]?.label.split(" (")[0]}</strong>
                </div>
              </div>
            </div>

            {khongMinhLineItem && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11.5px] font-mono font-bold bg-gradient-to-r from-[#C9A55A] to-[#F59E0B] text-[#120F0C] px-3 py-1 rounded-lg shadow flex items-center gap-1.5">
                  <Scroll className="w-3.5 h-3.5 text-[#120F0C]" />
                  <span>KHỔNG MINH SỐ #{khongMinhLineItem.oracleNum}</span>
                </span>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* MỤC 1: HIỆN HÌNH QUẺ KINH DỊCH & HÀO ĐỘNG SẼ CÓ MÀU ĐỎ PHÁT SÁNG        */}
          {/* ========================================================================= */}
          <div className="space-y-3 bg-[#130D08] p-4 sm:p-5 rounded-xl border border-[#3A2817]">
            <div className="flex items-center gap-2 border-b border-[#2D1F12] pb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
              <h4 className="font-serif font-bold text-sm sm:text-base text-[#E6D3A3] flex items-center gap-2">
                <span>1. HÌNH QUẺ KINH DỊCH & HÀO ĐỘNG PHÁT SÁNG</span>
                <span className="text-[10px] font-mono text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-500/50">
                  Hào {activeLine} Đỏ Phát Sáng
                </span>
              </h4>
            </div>

            <div className="flex flex-col items-center justify-center py-2">
              <div className="w-full max-w-xs sm:max-w-sm flex flex-col items-center">
                <div className="text-xs font-serif font-bold text-[#E6D3A3] mb-2.5 flex items-center gap-2">
                  <span>Quẻ #{targetHex.number}: {targetHex.name} ({targetHex.vietnameseName})</span>
                  <span className="text-[10px] font-mono text-red-400 bg-red-950/70 px-2 py-0.5 rounded border border-red-500/60 shadow">
                    🔥 Hào {activeLine} Động
                  </span>
                </div>
                {/* Standard classic I Ching hexagram visual with glowing red moving line */}
                <HexagramVisual
                  hexagram={targetHex}
                  changingLines={[activeLine]}
                  size="lg"
                  showLabels={true}
                />
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* MỤC 2: GIẢI THÍCH QUẺ THEO SÁCH THUYẾT MINH                              */}
          {/* ========================================================================= */}
          <div className="space-y-4 bg-[#130D08] p-4 sm:p-5 rounded-xl border border-[#3A2817]">
            {/* Tiêu đề mục 2 */}
            <div className="flex items-center justify-between border-b border-[#2D1F12] pb-2">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#C9A55A]" />
                <h4 className="font-serif font-bold text-sm sm:text-base text-[#E6D3A3] flex items-center gap-2">
                  <span>2. GIẢI THÍCH QUẺ THEO SÁCH THUYẾT MINH</span>
                  <span className="text-[10px] font-mono text-[#C9A55A] bg-[#2E2013] px-2 py-0.5 rounded border border-[#523A20]">
                    Trang {targetHex.number + 33} Sách Thuyết Minh
                  </span>
                </h4>
              </div>
              {onNavigateToManual && (
                <button
                  type="button"
                  onClick={() => onNavigateToManual(targetHex.number)}
                  className="text-[11px] font-mono text-[#C9A55A] hover:underline cursor-pointer flex items-center gap-1"
                  title="Mở toàn văn Thuyết Minh của quẻ này"
                >
                  <span>Xem toàn văn sách</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Top row: Quẻ Info (Left) & Dòng Chữ Đỏ Trên Lá Bài (Right) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="px-2 py-0.5 rounded-lg bg-[#2A1D11] border border-[#543D25] text-xs font-mono font-bold text-[#E5C378]">
                    Quẻ #{targetHex.number}
                  </span>
                  <span className="text-xs text-[#A89882] font-serif">
                    Cấu trúc: <strong className="text-[#E6C673]">{bookHex?.structure || `${targetHex.upperTrigram} trên, ${targetHex.lowerTrigram} dưới`}</strong>
                  </span>
                </div>
                <h4 className="text-xl md:text-2xl font-serif font-bold text-[#F3E5AB]">
                  {bookHex?.name || targetHex.name}
                </h4>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xs font-mono text-[#A89882] uppercase tracking-wider">Hán tự:</span>
                  <span className="text-xl sm:text-2xl font-serif font-black text-[#E6D3A3] tracking-widest drop-shadow-sm">
                    {bookHex?.hanzi || targetHex.hanzi}
                  </span>
                </div>
              </div>

              {/* DÒNG CHỮ ĐỎ TRÊN LÁ BÀI (KIM CHỈ NAM) */}
              {bookHex?.redHeadline && (
                <div className="bg-[#2A1012] border border-rose-900/70 rounded-xl px-4 py-3 text-center shadow-inner max-w-md w-full md:w-auto space-y-1.5">
                  <div className="text-[10px] uppercase font-mono tracking-wider text-rose-300/80 mb-0.5 flex items-center justify-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    DÒNG CHỮ ĐỎ TRÊN LÁ BÀI (KIM CHỈ NAM)
                  </div>
                  {/* Chữ Hán của dòng chữ đỏ */}
                  {redHeadlineDetail?.hanzi && (
                    <div className="text-xl sm:text-2xl font-serif font-black text-[#FFE494] tracking-widest drop-shadow">
                      {redHeadlineDetail.hanzi}
                    </div>
                  )}
                  {/* Phiên âm Hán Việt in hoa màu đỏ */}
                  <div className="text-base sm:text-lg font-bold text-rose-400 tracking-wide uppercase font-serif drop-shadow">
                    “{bookHex.redHeadline}”
                  </div>
                  {/* Dịch nghĩa của dòng chữ đỏ */}
                  {redHeadlineDetail?.meaning && (
                    <div className="text-xs font-serif text-rose-200/90 leading-snug italic pt-1 border-t border-rose-950/80 max-w-sm mx-auto">
                      {redHeadlineDetail.meaning}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* THƠ TƯỢNG & DỊCH NGHĨA */}
            <div className="bg-[#17120D] border border-[#3A2D1F] p-3.5 sm:p-4 rounded-xl space-y-2.5">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#C9A55A] font-bold">
                THƠ TƯỢNG & DỊCH NGHĨA
              </div>

              {/* Couplet with golden left border */}
              <div className="pl-3 border-l-2 border-[#C89B3C] space-y-1.5">
                {/* 1. Chữ Hán */}
                {(khongMinhBridge?.tuongQueHanzi || khongMinhBridge?.yQueHanzi) && (
                  <div className="font-serif text-sm sm:text-base text-[#E6D3A3] tracking-widest leading-relaxed whitespace-pre-line">
                    {khongMinhBridge.tuongQueHanzi ? `${khongMinhBridge.tuongQueHanzi}，\n` : ""}
                    {khongMinhBridge.yQueHanzi ? `${khongMinhBridge.yQueHanzi}。` : ""}
                  </div>
                )}

                {/* 2. Hán Việt */}
                {bookHex?.poemHan && (
                  <div className="whitespace-pre-line font-medium text-[#F0E6D2] italic text-xs sm:text-sm leading-relaxed">
                    {bookHex.poemHan}
                  </div>
                )}
              </div>

              {/* 3. Dịch nghĩa */}
              {bookHex?.poemMeaning && (
                <div className="text-[#BFAFA0] pl-3 text-xs sm:text-sm font-serif leading-relaxed pt-1">
                  {bookHex.poemMeaning}
                </div>
              )}
            </div>

            {/* ĐẠI TƯỢNG (SÁCH THUYẾT MINH) */}
            {bookHex?.bigImage && (
              <div className="bg-[#17120D]/80 p-3.5 rounded-xl border border-[#2B2116] space-y-1">
                <div className="text-[11px] font-mono uppercase tracking-wider text-[#C9A55A] font-bold flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#C9A55A]" />
                  <span>Đại Tượng (Sách Thuyết Minh)</span>
                </div>
                <p className="text-[#C8BBA5] text-xs sm:text-sm leading-relaxed pl-1">
                  {bookHex.bigImage}
                </p>
              </div>
            )}

            {/* VẬN THẾ & TÌNH YÊU (SÁCH THUYẾT MINH) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {bookHex?.destiny && (
                <div className="bg-[#1C150E] p-3.5 sm:p-4 rounded-xl border border-[#362819] space-y-1">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-[#C89B3C] font-bold flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5" />
                    <span>Vận Thế • Thời Vận (Sách Thuyết Minh)</span>
                  </div>
                  <p className="text-[#D8CDBC] text-xs sm:text-sm leading-relaxed">
                    {bookHex.destiny}
                  </p>
                </div>
              )}

              {bookHex?.love && (
                <div className="bg-[#1C150E] p-3.5 sm:p-4 rounded-xl border border-[#362819] space-y-1">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-rose-400 font-bold flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5" />
                    <span>Tình Yêu • Gia Đạo (Sách Thuyết Minh)</span>
                  </div>
                  <p className="text-[#D8CDBC] text-xs sm:text-sm leading-relaxed">
                    {bookHex.love}
                  </p>
                </div>
              )}
            </div>

            {/* ĐỊNH HƯỚNG VỊ TRÍ TRẬN PHÁP TAM TÀI THEO SÁCH THUYẾT MINH */}
            <div className="bg-gradient-to-r from-[#241A10] to-[#1A130C] p-4 rounded-xl border border-[#523C22] space-y-2">
              <div className="flex items-center justify-between gap-2 border-b border-[#3E2B18] pb-2">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#C9A55A]" />
                  <span className="text-xs sm:text-sm font-serif font-bold text-[#E6D3A3]">
                    Luận Giải Vị Trí: {cardRoleLabels[targetCardIdx]?.label}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#C9A55A] bg-[#2E2013] px-2 py-0.5 rounded border border-[#5A3F24]">
                  Chuẩn Sách Thuyết Minh
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#DDD0BD] leading-relaxed">
                <strong className="text-[#E28355]">Về Nhân Hòa (Con người): </strong>
                Quẻ <em>{targetHex.name}</em> đứng ở ngôi Nhân Đạo đại diện cho tâm thế chủ quan, cách đối nhân xử thế và ý chí hành động. Theo Sách Thuyết Minh: Dòng chữ đỏ kim chỉ nam là <strong className="text-rose-400">“{bookHex?.redHeadline}”</strong> ({redHeadlineDetail?.meaning || targetHex.advice}).
              </p>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* QUẺ KHỔNG MINH KINH DỊCH (CHUẨN FORM MẪU ĐOÁN QUẺ TOÀN DIỆN)             */}
          {/* ========================================================================= */}
          <KhongMinhKinhDichView
            primaryHex={targetHex}
            activeLine={activeLine}
            sourceName={currentCardDice ? "Hoạt Thời" : "Chiêm Thời"}
            onShowToast={onShowToast}
          />

          {/* MỤC MỞ RỘNG: BÌNH GIẢNG & ĐIỂN TÍCH TỪNG CÂU THƠ (SÁCH THUYẾT MINH) */}
          {khongMinhLineItem && (
            <div className="bg-[#120C07] border border-[#352314] hover:border-[#523720] rounded-xl overflow-hidden transition-colors">
              <button
                type="button"
                onClick={() => setShowLegacyDeepAnalysis(!showLegacyDeepAnalysis)}
                className="w-full p-3.5 sm:p-4 flex items-center justify-between text-left hover:bg-[#1A120B] transition-colors cursor-pointer select-none group"
              >
                <div className="flex items-center gap-2 text-xs sm:text-sm font-serif font-bold text-[#E6D3A3] group-hover:text-amber-300 transition-colors">
                  <BookOpen className="w-4 h-4 text-[#C9A55A]" />
                  <span>Chi Tiết Điển Cố & Bình Giảng Từng Câu Thơ (Mở Rộng Từ Sách Thuyết Minh)</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#A89882] font-mono bg-[#1E140C] px-2.5 py-1 rounded border border-[#3E2917]">
                  <span>{showLegacyDeepAnalysis ? "Thu gọn" : "Xem thêm"}</span>
                  {showLegacyDeepAnalysis ? <ChevronUp className="w-3.5 h-3.5 text-amber-400" /> : <ChevronDown className="w-3.5 h-3.5 text-amber-400" />}
                </div>
              </button>

              {showLegacyDeepAnalysis && (() => {
                const oracleDetail = getKhongMinhComprehensive(
                  khongMinhLineItem.oracleNum,
                  khongMinhLineItem,
                  canonicalYao,
                  targetHex.name
                );

                const hasSegments = khongMinhLineItem.poemSegments && khongMinhLineItem.poemSegments.length > 0;

                return (
                  <div className="bg-[#140D07] border-t border-[#3A2817] p-5 sm:p-7 rounded-b-xl space-y-6 shadow-xl text-xs sm:text-sm font-serif">
                {/* 1. Tiêu đề mục & Đối chiếu Thuyết Minh */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2E2013] pb-3.5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <BookOpen className="w-5 h-5 text-[#C9A55A]" />
                      <h4 className="font-serif font-black text-sm sm:text-base text-[#E6D3A3] uppercase tracking-wide flex items-center gap-2">
                        <span>3. PHÂN TÍCH QUẺ XĂM KHỔNG MINH (TRÍCH SÁCH THUYẾT MINH)</span>
                      </h4>
                    </div>
                    <div className="text-[11px] text-[#A69780] font-serif flex items-center gap-2 flex-wrap pl-7">
                      <span>• Cầu nối 384 Hào Thần Quẻ (Chương 10)</span>
                      <span>• Soi chiếu ngôi vị: <strong className={tamTaiRealms[targetCardIdx]?.color}>{tamTaiRealms[targetCardIdx]?.name}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="bg-[#24170C] border border-[#4E341C] px-3 py-1 rounded-full text-xs font-mono font-bold text-amber-300 shadow-sm flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span>Quẻ xăm #{oracleDetail.formattedNum}</span>
                    </div>
                    <div className="bg-[#2B1B10] border border-[#5A3922] px-3 py-1 rounded-full text-xs font-mono font-bold text-[#E5B552] shadow-sm flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#C9A55A]" />
                      <span>{oracleDetail.oracleType}</span>
                    </div>
                    {onNavigateToManual && (
                      <button
                        type="button"
                        onClick={() => onNavigateToManual(targetHex.number)}
                        className="text-[11px] font-mono text-[#C9A55A] hover:underline flex items-center gap-1 cursor-pointer bg-[#1C130B] border border-[#422B16] px-2.5 py-1 rounded-lg hover:border-[#C9A55A]"
                        title="Xem toàn văn Thuyết Minh Dịch Học"
                      >
                        <BookOpen className="w-3 h-3 text-[#C9A55A]" />
                        <span>Xem Sách Thuyết Minh</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. TƯỢNG HÀO & Ý HÀO (Trích Nguyên Văn Sách Thuyết Minh) */}
                <div className="space-y-2">
                  <div className="text-xs font-mono text-[#E5C378] uppercase tracking-wider font-bold flex items-center gap-2">
                    <Scroll className="w-4 h-4 text-[#C9A55A]" />
                    <span>Tượng Hào & Ý Hào Khổng Minh (Trích Sách Thuyết Minh):</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Tượng Hào */}
                    <div className="bg-[#1C140C] p-3.5 sm:p-4 rounded-xl border border-[#3E2B19] space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-mono text-[#C9A55A] font-bold">
                        <span className="flex items-center gap-1.5">
                          <Compass className="w-3.5 h-3.5 text-[#C9A55A]" />
                          <span>TƯỢNG HÀO (象爻) — TRÍCH THUYẾT MINH</span>
                        </span>
                        {khongMinhLineItem.tuongHaoHanzi && (
                          <span className="text-[#E6D3A3] text-xs font-serif">{khongMinhLineItem.tuongHaoHanzi}</span>
                        )}
                      </div>
                      <div className="font-serif font-bold text-sm text-[#F5EAD4]">
                        {khongMinhLineItem.tuongHao}
                      </div>
                      {khongMinhLineItem.tuongHaoMeaning && (
                        <p className="text-xs text-[#C8BBA5] font-serif leading-relaxed pt-0.5">
                          {khongMinhLineItem.tuongHaoMeaning}
                        </p>
                      )}
                    </div>

                    {/* Ý Hào */}
                    <div className="bg-[#1C140C] p-3.5 sm:p-4 rounded-xl border border-[#3E2B19] space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-mono text-[#E28355] font-bold">
                        <span className="flex items-center gap-1.5">
                          <Scroll className="w-3.5 h-3.5 text-[#E28355]" />
                          <span>Ý HÀO (意爻) — TRÍCH THUYẾT MINH</span>
                        </span>
                        {khongMinhLineItem.yHaoHanzi && (
                          <span className="text-[#E6D3A3] text-xs font-serif">{khongMinhLineItem.yHaoHanzi}</span>
                        )}
                      </div>
                      <div className="font-serif font-bold text-sm text-[#F5EAD4]">
                        {khongMinhLineItem.yHao}
                      </div>
                      {khongMinhLineItem.yHaoMeaning && (
                        <p className="text-xs text-[#C8BBA5] font-serif leading-relaxed pt-0.5">
                          {khongMinhLineItem.yHaoMeaning}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. Bài thơ quẻ xăm (Trích Nguyên Bản Sách Thuyết Minh) */}
                <div className="bg-[#19110B] p-4 sm:p-6 rounded-xl border border-[#3A2817] space-y-3.5 text-center shadow-inner">
                  <div className="text-[11px] font-mono text-[#C9A55A] uppercase tracking-wider font-bold flex items-center justify-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-[#C9A55A]" />
                    <span>Bài Thơ Quẻ Xăm (Trích Nguyên Tác Sách Thuyết Minh):</span>
                  </div>
                  <div className="font-serif font-black text-xl sm:text-2xl md:text-3xl text-[#FFE494] tracking-widest leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    {khongMinhLineItem.oracleHanzi || oracleDetail.poemHanzi}
                  </div>
                  <div className="border-t border-[#2D1F13] w-2/3 mx-auto pt-2 space-y-1">
                    <div className="text-[11px] font-mono text-[#E28355] uppercase tracking-wider font-bold">
                      Âm Hán Việt:
                    </div>
                    <div className="font-bold text-sm sm:text-base text-[#F5EAD4] tracking-wide italic">
                      {khongMinhLineItem.oracleText || oracleDetail.poemHaniViet}
                    </div>
                  </div>
                  <div className="bg-[#120B06] p-3.5 rounded-lg border border-[#2B1B0F] text-[#DDD0BD] leading-relaxed text-xs sm:text-sm text-left">
                    <span className="font-bold text-emerald-400 font-mono text-xs uppercase tracking-wider block mb-1">
                      (Dịch Nghĩa Thơ — Trích Sách Thuyết Minh):
                    </span>
                    {poemTranslation || oracleDetail.poemMeaning}
                  </div>
                </div>

                {/* 4. Giải nghĩa chi tiết từng câu thơ (Trích Sách Thuyết Minh) */}
                <div className="space-y-3">
                  <div className="text-xs font-mono text-[#E6D3A3] uppercase tracking-wider font-bold flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#C9A55A]" />
                    <span>Giải Nghĩa & Điển Cố Từng Câu Thơ (Trích Sách Thuyết Minh):</span>
                  </div>
                  <div className="space-y-2.5">
                    {hasSegments ? (
                      khongMinhLineItem.poemSegments!.map((seg, idx) => (
                        <div
                          key={idx}
                          className="bg-[#19110B] p-3 sm:p-3.5 rounded-xl border border-[#352516] space-y-1.5"
                        >
                          <div className="font-serif font-bold text-sm text-amber-300 flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-mono text-amber-500 bg-[#291A0E] px-2 py-0.5 rounded border border-[#482F19]">
                                Câu {idx + 1}
                              </span>
                              <span className="text-base text-[#E6D3A3]">{seg.hanzi}</span>
                              <span className="italic text-[#E5B552] text-xs font-normal">({seg.transcription})</span>
                            </div>
                            <span className="text-[10px] font-mono text-[#8C7A65] bg-[#120D09] px-2 py-0.5 rounded">
                              Trích Thuyết Minh
                            </span>
                          </div>
                          <div className="pl-3 border-l-2 border-[#4A3420] space-y-1 text-xs sm:text-sm text-[#DDD0BD]">
                            <div>
                              <strong className="text-[#C4B294]">Dịch nghĩa câu: </strong>
                              {seg.meaning}
                            </div>
                            {seg.analysis && (
                              <div>
                                <strong className="text-[#E28355]">Điển tích & Hàm ý sâu sắc: </strong>
                                {seg.analysis}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      oracleDetail.lineExplanations.map((exp, idx) => (
                        <div
                          key={idx}
                          className="bg-[#19110B] p-3 sm:p-3.5 rounded-xl border border-[#352516] space-y-1.5"
                        >
                          <div className="font-serif font-bold text-sm text-amber-300 flex items-center gap-2">
                            <span className="text-[11px] font-mono text-amber-500 bg-[#291A0E] px-2 py-0.5 rounded border border-[#482F19]">
                              Câu {idx + 1}
                            </span>
                            <span>{exp.lineTitle}</span>
                          </div>
                          <div className="pl-3 border-l-2 border-[#4A3420] space-y-1 text-xs sm:text-sm text-[#DDD0BD]">
                            <div>
                              <strong className="text-[#C4B294]">Nghĩa đen: </strong>
                              {exp.literalMeaning}
                            </div>
                            <div>
                              <strong className="text-[#E28355]">Hàm ý: </strong>
                              {exp.implication}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 5. Luận giải ứng nghiệm vị trí Tam Tài (Trích Sách Thuyết Minh) */}
                <div className="bg-gradient-to-r from-[#2A180E] via-[#1E120A] to-[#140D07] p-4 sm:p-5 rounded-xl border border-[#5E3B1C] space-y-2.5 shadow-md">
                  <div className="flex items-center justify-between border-b border-[#3D2513] pb-2">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-[#C9A55A]" />
                      <span className="text-xs sm:text-sm font-serif font-bold text-[#E6D3A3]">
                        Ứng Nghiệm Cho Ngôi Vị {tamTaiRealms[targetCardIdx]?.name} (Trích Sách Thuyết Minh)
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-[#C9A55A] bg-[#2E1B0D] px-2 py-0.5 rounded border border-[#523318]">
                      Trận Pháp Tam Tài
                    </span>
                  </div>

                  <div className="text-xs sm:text-sm text-[#DFCBB2] leading-relaxed space-y-1.5">
                    <p>
                      <strong className="text-[#E28355]">Soi chiếu Nhân Hòa & Tâm Thế Con Người Hành Động: </strong>
                      Theo Sách Thuyết Minh, quẻ xăm Khổng Minh số <strong>{oracleDetail.formattedNum}</strong> khi ngự tại ngôi <em>Nhân Đạo</em> phản ánh nội tâm, đạo đối nhân xử thế và ý chí quyết định. Bài thơ khuyên lấy đức độ cảm hóa nhân tâm, hành xử theo kim chỉ nam trung chính, không để lòng tham hay sự nông nổi làm lu mờ lương tri. {oracleDetail.overallMeaning.detailedExplanation}
                    </p>
                  </div>
                </div>

                {/* 6. Ý nghĩa quẻ xăm (籤義) — Trích Thuyết Minh */}
                <div className="bg-[#19110B] p-4 sm:p-5 rounded-xl border border-[#3A2817] space-y-3">
                  <div className="text-xs font-mono text-amber-400 uppercase tracking-wider font-bold flex items-center gap-2">
                    <Bookmark className="w-4 h-4 text-amber-400" />
                    <span>Ý Nghĩa Quẻ Xăm (籤義) — Trích Sách Thuyết Minh:</span>
                  </div>
                  <div className="space-y-2 text-[#DDD0BD] leading-relaxed">
                    <p>
                      <strong className="text-[#E6D3A3]">Luận giải tổng quan: </strong>
                      {oracleDetail.overallMeaning.detailedExplanation}
                    </p>
                    <p className="border-t border-[#2B1B0F] pt-2">
                      <strong className="text-[#C9A55A]">Tượng số quy nạp: </strong>
                      {oracleDetail.overallMeaning.symbolicFigure}
                    </p>
                  </div>
                </div>

                {/* 7. Lời khuyên cụ thể về cách hành xử (Trích Sách Thuyết Minh & Kết Nối 3 Quẻ Phụ) */}
                <div className="bg-[#19110B] p-4 sm:p-5 rounded-xl border border-[#3A2817] space-y-3">
                  <div className="flex items-center justify-between border-b border-[#2C1E12] pb-2 flex-wrap gap-2">
                    <div className="text-xs font-mono text-amber-400 uppercase tracking-wider font-bold flex items-center gap-2">
                      <Scale className="w-4 h-4 text-amber-400" />
                      <span>Lời Khuyên Hành Xử Cụ Thể (Trích Thuyết Minh & Định Hướng 3 Quẻ Phụ):</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#E5B552] bg-[#281A0E] px-2 py-0.5 rounded border border-[#482F19]">
                      Thuận Nghịch Tứ Quái
                    </span>
                  </div>
                  <div className="space-y-2 text-[#DDD0BD] leading-relaxed">
                    <p>
                      <strong className="text-emerald-400">✅ Nên làm (Hành động thuận theo 3 quẻ phụ): </strong>
                      {oracleDetail.actionGuidance.doList}
                    </p>
                    <p>
                      <strong className="text-rose-400">🛑 Tránh làm (Hành động nghịch theo 3 quẻ phụ): </strong>
                      {oracleDetail.actionGuidance.avoidList}
                    </p>
                    <p className="border-t border-[#2B1B0F] pt-2">
                      <strong className="text-amber-300">☯️ Thái độ & Tâm thế ứng biến: </strong>
                      {oracleDetail.actionGuidance.attitude}
                    </p>
                  </div>
                </div>

                {/* 8. Điển tích Lịch sử & Triết lý Đạo học (Trích Sách Thuyết Minh) */}
                {(histText || philText) && (
                  <div className="bg-[#19110B] p-4 sm:p-5 rounded-xl border border-[#3A2817] space-y-3">
                    <div className="text-xs font-mono text-[#C9A55A] uppercase tracking-wider font-bold flex items-center gap-2">
                      <Scroll className="w-4 h-4 text-[#C9A55A]" />
                      <span>Điển Tích Lịch Sử & Triết Lý Tu Thân (Trích Sách Thuyết Minh):</span>
                    </div>
                    {histText && (
                      <div className="space-y-1 text-xs sm:text-sm text-[#DDD0BD] leading-relaxed">
                        <strong className="text-[#E6D3A3]">🏛️ Điển tích & Cổ thư: </strong>
                        <span>{histText}</span>
                      </div>
                    )}
                    {philText && (
                      <div className="space-y-1 text-xs sm:text-sm text-[#DDD0BD] leading-relaxed border-t border-[#2B1B0F] pt-2">
                        <strong className="text-[#E28355]">☯️ Triết lý Đạo học & Tu thân: </strong>
                        <span>{philText}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* 9. 🛑 Phiên bản đảo ngược 180 độ (Cảnh Báo Từ Sách Thuyết Minh) */}
                {oracleDetail.invertedVersion && (
                  <div className="bg-gradient-to-b from-[#241012] to-[#160B0D] border-2 border-rose-900/80 p-4 sm:p-6 rounded-xl space-y-3.5 shadow-lg">
                    <div className="flex items-center gap-2 text-rose-300 font-mono text-xs sm:text-sm font-bold uppercase tracking-wider border-b border-rose-950/80 pb-2.5">
                      <span className="text-base">🛑</span>
                      <span>Phiên Bản Đảo Ngược 180 Độ (Cảnh Báo Nghịch Vận — Trích Thuyết Minh):</span>
                    </div>

                    <div className="space-y-2 text-center py-1">
                      <div className="text-[10.5px] font-mono text-rose-400 uppercase tracking-wider font-bold">
                        Bài thơ quẻ xăm nghịch đối:
                      </div>
                      <div className="font-serif font-black text-lg sm:text-xl text-rose-200 tracking-widest leading-relaxed">
                        {oracleDetail.invertedVersion.poemHanzi}
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-rose-300/90 italic">
                        Âm Hán Việt: {oracleDetail.invertedVersion.poemHaniViet}
                      </div>
                    </div>

                    <div className="bg-[#1B0A0C] p-3 rounded-lg border border-rose-950 text-rose-100/90 text-xs sm:text-sm leading-relaxed">
                      <span className="font-bold text-rose-400 font-mono text-[11px] uppercase tracking-wider block mb-0.5">
                        (Dịch thơ / Diễn xuôi):
                      </span>
                      {oracleDetail.invertedVersion.poemMeaning}
                    </div>

                    <div className="space-y-2 text-xs sm:text-sm text-rose-200/90 leading-relaxed pt-1">
                      <p>
                        <strong className="text-rose-300">Luận giải chi tiết: </strong>
                        {oracleDetail.invertedVersion.detailedExplanation}
                      </p>
                      <p className="border-t border-rose-950/80 pt-2">
                        <strong className="text-rose-400">Lời khuyên cụ thể: </strong>
                        {oracleDetail.invertedVersion.actionAdvice}
                      </p>
                      <p className="border-t border-rose-950/80 pt-2">
                        <strong className="text-rose-300">Tượng số cảnh báo: </strong>
                        {oracleDetail.invertedVersion.symbolicFigure}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MỤC MỞ RỘNG: TỔNG HỢP HÀNH ĐỘNG TỨ QUÁI (BẢN CHI TIẾT CŨ)                 */}
      {/* ========================================================================= */}
      <div className="bg-[#120C07] border border-[#352314] hover:border-[#523720] rounded-xl overflow-hidden transition-colors">
        <button
          type="button"
          onClick={() => setShowLegacyTuQuaiAnalysis(!showLegacyTuQuaiAnalysis)}
          className="w-full p-3.5 sm:p-4 flex items-center justify-between text-left hover:bg-[#1A120B] transition-colors cursor-pointer select-none group"
        >
          <div className="flex items-center gap-2 text-xs sm:text-sm font-serif font-bold text-[#E6D3A3] group-hover:text-amber-300 transition-colors">
            <Scale className="w-4 h-4 text-[#C9A55A]" />
            <span>Xem Tổng Hợp Hành Động Tứ Quái (Bản Chi Tiết Cũ)</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#A89882] font-mono bg-[#1E140C] px-2.5 py-1 rounded border border-[#3E2917]">
            <span>{showLegacyTuQuaiAnalysis ? "Thu gọn" : "Xem thêm"}</span>
            {showLegacyTuQuaiAnalysis ? <ChevronUp className="w-3.5 h-3.5 text-amber-400" /> : <ChevronDown className="w-3.5 h-3.5 text-amber-400" />}
          </div>
        </button>

        {showLegacyTuQuaiAnalysis && (() => {
          const movingAnalysis = getMovingLineComprehensiveAnalysis(targetHex, activeLine);

          return (
            <div className="bg-[#140D07] border-t border-[#3A2817] p-5 sm:p-7 rounded-b-xl space-y-6 shadow-xl text-xs sm:text-sm font-serif">
                {/* Tiêu đề & Thông tin quẻ chính + Hào động */}
                <div className="border-b border-[#2E2013] pb-3.5 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-bold text-base sm:text-lg">◎</span>
                    <h3 className="font-serif font-black text-base sm:text-lg md:text-xl text-[#E6D3A3] tracking-wide">
                      QUẺ CHÍNH: {movingAnalysis.hexName} ({movingAnalysis.hexHanzi})
                    </h3>
                  </div>
                  <div className="font-mono text-xs sm:text-sm text-red-400 font-bold pl-5">
                    HÀO {movingAnalysis.activeLine}: {movingAnalysis.lineName}
                  </div>
                </div>

                {/* 1. KINH DỊCH HÀO TỪ CỐT LÕI */}
                <div className="bg-[#19110B] p-4 sm:p-5 rounded-xl border border-[#3A2817] space-y-3.5">
                  <div className="text-xs font-mono text-amber-400 uppercase tracking-wider font-bold flex items-center gap-2 border-b border-[#2C1E12] pb-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>KINH DỊCH HÀO TỪ CỐT LÕI:</span>
                  </div>

                  <div className="space-y-2.5 text-[#DDD0BD] leading-relaxed">
                    <p>
                      <strong className="text-[#E6D3A3]">Lời hào: </strong>
                      <span className="text-[#FFF4DD] font-medium">{movingAnalysis.coreLine.loiHao}</span>
                    </p>
                    <p>
                      <strong className="text-[#E6D3A3]">Nghĩa lý: </strong>
                      {movingAnalysis.coreLine.nghiaLy}
                    </p>
                    <p>
                      <strong className="text-[#E6D3A3]">Tượng số: </strong>
                      {movingAnalysis.coreLine.tuongSo}
                    </p>
                    <p>
                      <strong className="text-[#E6D3A3]">Vị trí: </strong>
                      {movingAnalysis.coreLine.viTri}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2 border-t border-[#291B0F]">
                      <div className="bg-[#142318] border border-[#274E31] p-3 rounded-lg text-emerald-100">
                        <strong className="text-emerald-400 font-mono text-xs uppercase tracking-wide block mb-1">
                          ✅ Hành động thuận:
                        </strong>
                        {movingAnalysis.coreLine.hanhDongThuan}
                      </div>
                      <div className="bg-[#261314] border border-[#532628] p-3 rounded-lg text-rose-100">
                        <strong className="text-rose-400 font-mono text-xs uppercase tracking-wide block mb-1">
                          🛑 Hành động ngược:
                        </strong>
                        {movingAnalysis.coreLine.hanhDongNguoc}
                      </div>
                    </div>

                    {/* TƯỢNG Ý KINH DỊCH TRÍCH THUYẾT MINH KHỔNG MINH (QUẺ CHÍNH) */}
                    {renderTuongYKhongMinh(
                      movingAnalysis.coreLine.tuongY,
                      `Quẻ Chính: ${movingAnalysis.hexName}`,
                      `Hào ${movingAnalysis.activeLine} (${movingAnalysis.lineName})`
                    )}
                  </div>
                </div>

                {/* 2. GÓC NHÌN ỨNG DỤNG THEO QUẺ PHỤ */}
                <div className="space-y-4 pt-1">
                  <div className="text-xs sm:text-sm font-mono text-[#C9A55A] uppercase tracking-wider font-bold flex items-center gap-2 border-b border-[#2E2013] pb-2">
                    <Scale className="w-4 h-4 text-[#C9A55A]" />
                    <span>GÓC NHÌN ỨNG DỤNG THEO QUẺ PHỤ:</span>
                  </div>

                  {/* ◎ QUẺ TÔNG */}
                  <div className="bg-[#19110B] p-4 sm:p-5 rounded-xl border border-[#3A2817] space-y-3">
                    <div className="flex items-center justify-between border-b border-[#2C1E12] pb-2 flex-wrap gap-2">
                      <div className="flex items-center gap-2 text-amber-300 font-serif font-bold text-sm sm:text-base">
                        <span className="text-amber-400">◎</span>
                        <span>QUẺ TÔNG: {movingAnalysis.queTong.name}</span>
                      </div>
                      <span className="text-xs font-mono text-amber-400 font-bold bg-[#26170D] px-2.5 py-0.5 rounded border border-[#53371D]">
                        Hào {movingAnalysis.queTong.line} động (cùng hào quẻ chính)
                      </span>
                    </div>

                    <div className="space-y-2 text-[#DDD0BD] leading-relaxed text-xs sm:text-sm">
                      <p>
                        <strong className="text-[#E6D3A3]">Lời hào: </strong>
                        <span className="text-[#FFF4DD] font-medium">{movingAnalysis.queTong.lineHanziText}</span>
                      </p>
                      <p>
                        <strong className="text-[#E6D3A3]">Áp dụng: </strong>
                        {movingAnalysis.queTong.apDung}
                      </p>
                      <p>
                        <strong className="text-[#E6D3A3]">Nghĩa lý: </strong>
                        {movingAnalysis.queTong.nghiaLy}
                      </p>
                      <p>
                        <strong className="text-[#E6D3A3]">Tượng số: </strong>
                        {movingAnalysis.queTong.tuongSo}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2 border-t border-[#291B0F]">
                        <div className="bg-[#142318] border border-[#274E31] p-3 rounded-lg text-emerald-100">
                          <strong className="text-emerald-400 font-mono text-xs uppercase tracking-wide block mb-1">
                            ✅ Hành động thuận:
                          </strong>
                          {movingAnalysis.queTong.hanhDongThuan}
                        </div>
                        <div className="bg-[#261314] border border-[#532628] p-3 rounded-lg text-rose-100">
                          <strong className="text-rose-400 font-mono text-xs uppercase tracking-wide block mb-1">
                            🛑 Hành động nghịch:
                          </strong>
                          {movingAnalysis.queTong.hanhDongNguoc}
                        </div>
                      </div>

                      {/* TƯỢNG Ý KINH DỊCH TRÍCH THUYẾT MINH KHỔNG MINH (QUẺ TÔNG) */}
                      {renderTuongYKhongMinh(
                        movingAnalysis.queTong.tuongY,
                        `Quẻ Tông: ${movingAnalysis.queTong.name}`,
                        `Hào ${movingAnalysis.queTong.line} (${movingAnalysis.queTong.lineName})`
                      )}
                    </div>
                  </div>

                  {/* ◎ QUẺ HỖ */}
                  <div className="bg-[#19110B] p-4 sm:p-5 rounded-xl border border-[#3A2817] space-y-3">
                    <div className="flex items-center gap-2 text-amber-300 font-serif font-bold text-sm sm:text-base border-b border-[#2C1E12] pb-2">
                      <span className="text-amber-400">◎</span>
                      <span>QUẺ HỖ: {movingAnalysis.queHo.name}</span>
                    </div>

                    <div className="space-y-2 text-[#DDD0BD] leading-relaxed text-xs sm:text-sm">
                      <p>
                        <strong className="text-[#E6D3A3]">Lời hào: </strong>
                        <span className="text-[#FFF4DD] font-medium">{movingAnalysis.queHo.lineHanziText}</span>
                      </p>
                      <p>
                        <strong className="text-[#E6D3A3]">Áp dụng: </strong>
                        {movingAnalysis.queHo.apDung}
                      </p>
                      <p>
                        <strong className="text-[#E6D3A3]">Nghĩa lý: </strong>
                        {movingAnalysis.queHo.nghiaLy}
                      </p>
                      <p>
                        <strong className="text-[#E6D3A3]">Tượng số: </strong>
                        {movingAnalysis.queHo.tuongSo}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2 border-t border-[#291B0F]">
                        <div className="bg-[#142318] border border-[#274E31] p-3 rounded-lg text-emerald-100">
                          <strong className="text-emerald-400 font-mono text-xs uppercase tracking-wide block mb-1">
                            ✅ Hành động thuận:
                          </strong>
                          {movingAnalysis.queHo.hanhDongThuan}
                        </div>
                        <div className="bg-[#261314] border border-[#532628] p-3 rounded-lg text-rose-100">
                          <strong className="text-rose-400 font-mono text-xs uppercase tracking-wide block mb-1">
                            🛑 Hành động nghịch:
                          </strong>
                          {movingAnalysis.queHo.hanhDongNguoc}
                        </div>
                      </div>

                      {/* TƯỢNG Ý KINH DỊCH TRÍCH THUYẾT MINH KHỔNG MINH (QUẺ HỖ) */}
                      {renderTuongYKhongMinh(
                        movingAnalysis.queHo.tuongY,
                        `Quẻ Hỗ: ${movingAnalysis.queHo.name}`,
                        `Hào ${movingAnalysis.queHo.line} (${movingAnalysis.queHo.lineName})`
                      )}
                    </div>
                  </div>

                  {/* ◎ QUẺ THÁC */}
                  <div className="bg-[#19110B] p-4 sm:p-5 rounded-xl border border-[#3A2817] space-y-3">
                    <div className="flex items-center gap-2 text-amber-300 font-serif font-bold text-sm sm:text-base border-b border-[#2C1E12] pb-2">
                      <span className="text-amber-400">◎</span>
                      <span>QUẺ THÁC: {movingAnalysis.queThac.name}</span>
                    </div>

                    <div className="space-y-2 text-[#DDD0BD] leading-relaxed text-xs sm:text-sm">
                      <p>
                        <strong className="text-[#E6D3A3]">Lời hào: </strong>
                        <span className="text-[#FFF4DD] font-medium">{movingAnalysis.queThac.lineHanziText}</span>
                      </p>
                      <p>
                        <strong className="text-[#E6D3A3]">Áp dụng: </strong>
                        {movingAnalysis.queThac.apDung}
                      </p>
                      <p>
                        <strong className="text-[#E6D3A3]">Nghĩa lý: </strong>
                        {movingAnalysis.queThac.nghiaLy}
                      </p>
                      <p>
                        <strong className="text-[#E6D3A3]">Tượng số: </strong>
                        {movingAnalysis.queThac.tuongSo}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2 border-t border-[#291B0F]">
                        <div className="bg-[#142318] border border-[#274E31] p-3 rounded-lg text-emerald-100">
                          <strong className="text-emerald-400 font-mono text-xs uppercase tracking-wide block mb-1">
                            ✅ Hành động thuận:
                          </strong>
                          {movingAnalysis.queThac.hanhDongThuan}
                        </div>
                        <div className="bg-[#261314] border border-[#532628] p-3 rounded-lg text-rose-100">
                          <strong className="text-rose-400 font-mono text-xs uppercase tracking-wide block mb-1">
                            🛑 Hành động nghịch:
                          </strong>
                          {movingAnalysis.queThac.hanhDongNguoc}
                        </div>
                      </div>

                      {/* TƯỢNG Ý KINH DỊCH TRÍCH THUYẾT MINH KHỔNG MINH (QUẺ THÁC) */}
                      {renderTuongYKhongMinh(
                        movingAnalysis.queThac.tuongY,
                        `Quẻ Thác: ${movingAnalysis.queThac.name}`,
                        `Hào ${movingAnalysis.queThac.line} (${movingAnalysis.queThac.lineName})`
                      )}
                    </div>
                  </div>

                  {/* 3. TỔNG HỢP HÀNH ĐỘNG THUẬN NGHỊCH ĐÚC KẾT THEO 3 QUẺ PHỤ (TỨ QUÁI ĐỒNG QUAN) */}
                  <div className="space-y-4 pt-4 border-t border-[#3E2B19]">
                    <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[#2E2013] pb-2.5">
                      <div className="flex items-center gap-2">
                        <Scale className="w-5 h-5 text-[#C9A55A]" />
                        <h4 className="font-serif font-black text-sm sm:text-base text-[#E6D3A3] uppercase tracking-wide">
                          3. TỔNG HỢP HÀNH ĐỘNG THUẬN NGHỊCH ĐÚC KẾT THEO 3 QUẺ PHỤ
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono text-[#C9A55A] bg-[#2E1E12] px-2.5 py-0.5 rounded border border-[#533920]">
                        Tứ Quái Đồng Quan (Chính — Tông — Hỗ — Thác)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Cột 1: HÀNH ĐỘNG THUẬN */}
                      <div className="bg-gradient-to-b from-[#132317] via-[#0E1B12] to-[#0A130D] border-2 border-emerald-800/80 p-4 sm:p-5 rounded-xl space-y-3.5 shadow-xl">
                        <div className="flex items-center gap-2 text-emerald-300 font-mono text-xs sm:text-sm font-bold uppercase tracking-wider border-b border-emerald-900/80 pb-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>{movingAnalysis.tongHopHanhDong.thuan.tieuDe}</span>
                        </div>

                        <div className="space-y-2.5 text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-serif">
                          <div className="bg-[#0D1A10] p-2.5 rounded-lg border border-emerald-900/60 space-y-0.5">
                            <strong className="text-emerald-400 font-mono text-[11px] uppercase tracking-wider block">
                              1. Trọng tâm Quẻ Chính ({movingAnalysis.hexName}):
                            </strong>
                            <p className="text-[#D3ECD7]">{movingAnalysis.tongHopHanhDong.thuan.chinh}</p>
                          </div>

                          <div className="bg-[#0D1A10] p-2.5 rounded-lg border border-emerald-900/60 space-y-0.5">
                            <strong className="text-emerald-400 font-mono text-[11px] uppercase tracking-wider block">
                              2. Nương theo Quẻ Tông ({movingAnalysis.queTong.name} - Đối phương):
                            </strong>
                            <p className="text-[#D3ECD7]">{movingAnalysis.tongHopHanhDong.thuan.tong}</p>
                          </div>

                          <div className="bg-[#0D1A10] p-2.5 rounded-lg border border-emerald-900/60 space-y-0.5">
                            <strong className="text-emerald-400 font-mono text-[11px] uppercase tracking-wider block">
                              3. Kiểm soát Quẻ Hỗ ({movingAnalysis.queHo.name} - Động lực ngầm):
                            </strong>
                            <p className="text-[#D3ECD7]">{movingAnalysis.tongHopHanhDong.thuan.ho}</p>
                          </div>

                          <div className="bg-[#0D1A10] p-2.5 rounded-lg border border-emerald-900/60 space-y-0.5">
                            <strong className="text-emerald-400 font-mono text-[11px] uppercase tracking-wider block">
                              4. Phòng thủ Quẻ Thác ({movingAnalysis.queThac.name} - Lằn ranh đỏ):
                            </strong>
                            <p className="text-[#D3ECD7]">{movingAnalysis.tongHopHanhDong.thuan.thac}</p>
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-emerald-800/80 text-emerald-200">
                            <strong className="text-[#E6D3A3] font-mono text-xs uppercase tracking-wide block mb-1">
                              ➔ Kim Chỉ Nam Hành Động Thuận:
                            </strong>
                            <p className="italic text-[#E8F5E9] font-medium leading-relaxed">
                              {movingAnalysis.tongHopHanhDong.thuan.loiKhuyenCotLoi}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Cột 2: HÀNH ĐỘNG NGHỊCH */}
                      <div className="bg-gradient-to-b from-[#251012] via-[#1D0C0E] to-[#14080A] border-2 border-rose-900/80 p-4 sm:p-5 rounded-xl space-y-3.5 shadow-xl">
                        <div className="flex items-center gap-2 text-rose-300 font-mono text-xs sm:text-sm font-bold uppercase tracking-wider border-b border-rose-950/80 pb-2">
                          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                          <span>{movingAnalysis.tongHopHanhDong.nghich.tieuDe}</span>
                        </div>

                        <div className="space-y-2.5 text-xs sm:text-sm text-rose-100/90 leading-relaxed font-serif">
                          <div className="bg-[#1C090B] p-2.5 rounded-lg border border-rose-950/70 space-y-0.5">
                            <strong className="text-rose-400 font-mono text-[11px] uppercase tracking-wider block">
                              1. Bốc đồng Quẻ Chính ({movingAnalysis.hexName}):
                            </strong>
                            <p className="text-[#FAD4D8]">{movingAnalysis.tongHopHanhDong.nghich.chinh}</p>
                          </div>

                          <div className="bg-[#1C090B] p-2.5 rounded-lg border border-rose-950/70 space-y-0.5">
                            <strong className="text-rose-400 font-mono text-[11px] uppercase tracking-wider block">
                              2. Xung đột Quẻ Tông ({movingAnalysis.queTong.name} - Ngoại cảnh):
                            </strong>
                            <p className="text-[#FAD4D8]">{movingAnalysis.tongHopHanhDong.nghich.tong}</p>
                          </div>

                          <div className="bg-[#1C090B] p-2.5 rounded-lg border border-rose-950/70 space-y-0.5">
                            <strong className="text-rose-400 font-mono text-[11px] uppercase tracking-wider block">
                              3. Cạm bẫy Quẻ Hỗ ({movingAnalysis.queHo.name} - Nội tâm):
                            </strong>
                            <p className="text-[#FAD4D8]">{movingAnalysis.tongHopHanhDong.nghich.ho}</p>
                          </div>

                          <div className="bg-[#1C090B] p-2.5 rounded-lg border border-rose-950/70 space-y-0.5">
                            <strong className="text-rose-400 font-mono text-[11px] uppercase tracking-wider block">
                              4. Đổ vỡ Quẻ Thác ({movingAnalysis.queThac.name} - Nghịch biến):
                            </strong>
                            <p className="text-[#FAD4D8]">{movingAnalysis.tongHopHanhDong.nghich.thac}</p>
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-rose-900/80 text-rose-200">
                            <strong className="text-rose-300 font-mono text-xs uppercase tracking-wide block mb-1">
                              ➔ Lời Răn Tuyệt Đối Phải Tránh:
                            </strong>
                            <p className="italic text-[#FFEBEE] font-medium leading-relaxed">
                              {movingAnalysis.tongHopHanhDong.nghich.canhBaoCotLoi}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
      ) : (
        /* Notice when toggle is OFF */
        <div className="bg-[#130E09] p-3.5 rounded-xl border border-[#2D1E12] flex items-center justify-between text-xs font-serif text-[#8C7A65]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#48331F]" />
            <span>Ô Luận Giải Hào Động Tam Tài & Khổng Minh đang TẮT. Bấm công tắc [BẬT] ở góc trên bên phải nếu bạn muốn mở ô luận giải này.</span>
          </div>
          <button
            type="button"
            onClick={() => setShowInterpretationBox(true)}
            className="text-[11px] font-mono text-[#C9A55A] hover:underline cursor-pointer ml-2 shrink-0 font-bold"
          >
            Bật Lên
          </button>
        </div>
      )}
    </div>
  );
};
