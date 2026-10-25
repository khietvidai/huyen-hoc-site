import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Compass,
  Layers,
  Sparkles,
  Scroll,
  Hash,
  Flame,
  Info,
  ChevronDown,
  ChevronUp,
  Bookmark,
  ExternalLink,
  HelpCircle,
  Eye,
  CheckCircle2,
  Search,
  ArrowLeft,
  ArrowRight,
  ListFilter,
  Grid,
  LayoutList,
  Volume2,
  VolumeX,
  Pause,
  Play,
  Square,
  Palette,
  Lock,
  Crown,
} from "lucide-react";
import { AppUser } from "../services/authService";
import {
  MANUAL_SECTIONS,
  TRIGRAM_DETAILS,
  HEXAGRAM_LOOKUP_MATRIX,
  TrigramDetail,
} from "../data/manualContent";
import { HEXAGRAMS } from "../data/hexagrams";
import { BOOK_HEXAGRAMS, BookHexagramSummary } from "../data/bookHexagrams";
import { CardVisual } from "./CardVisual";
import { HexagramVisual } from "./HexagramVisual";
import { SpreadMethodsSection } from "./SpreadMethodsSection";
import {
  Chapter1Intro,
  Chapter2History,
  Chapter4DivinationPrinciples,
  Chapter8BadOmens,
  Chapter9Colophon,
} from "./ManualChapterViews";
import { ChapterIChingStory } from "./ChapterIChingStory";
import { ChapterChangingLinesRules } from "./ChapterChangingLinesRules";
import { ICHING_STORIES } from "../data/ichingStoryData";
import { XiangzhuanView } from "./XiangzhuanView";
import { CanonicalHexagramCard } from "./CanonicalHexagramCard";
import { KhongMinhSingleHexView, KhongMinhFullBrowser } from "./KhongMinhBridgeView";

interface ManualBookSectionProps {
  cardImages?: Record<number, string>;
  cardVideos?: Record<number, string>;
  onImageUpdated?: (cardNumber: number, newUrl: string) => void;
  onVideoUpdated?: (cardNumber: number, newVideoUrl: string) => void;
  onSelectHexagram?: (hexNumber: number) => void;
  onOpenDetailTab?: (hexNumber: number) => void;
  onOpenJiazi?: () => void;
  onOpenDecks?: () => void;
  defaultExpanded?: boolean;
  selectedHexNumber?: number;
  currentUser?: AppUser | null;
  onOpenAuthModal?: (mode?: "login" | "register" | "upgrade") => void;
}

type HexRangeFilter =
  | "all"
  | "upper"
  | "lower"
  | "can"
  | "khon"
  | "kham"
  | "ly"
  | "chan"
  | "ton"
  | "can_mt"
  | "doai";

// 8 Cung Bát Quái Kinh Dịch (Kinh Phòng 8 Cung - 64 quẻ chia đều mỗi cung 8 quẻ)
const CUNG_PALACE_MEMBERS: Record<string, number[]> = {
  can: [1, 44, 33, 12, 20, 23, 35, 14], // Cung Càn (Kim)
  kham: [29, 60, 3, 63, 49, 55, 36, 7], // Cung Khảm (Thủy)
  can_mt: [52, 22, 26, 41, 38, 10, 61, 53], // Cung Cấn (Thổ)
  chan: [51, 16, 40, 32, 46, 48, 28, 17], // Cung Chấn (Mộc)
  ton: [57, 9, 37, 42, 25, 21, 27, 18], // Cung Tốn (Mộc)
  ly: [30, 56, 50, 64, 4, 59, 6, 13], // Cung Ly (Hỏa)
  khon: [2, 24, 19, 11, 34, 43, 5, 8], // Cung Khôn (Thổ)
  doai: [58, 47, 45, 31, 39, 15, 62, 54], // Cung Đoài (Kim)
};

const CUNG_INFO_LIST = [
  { id: "can", name: "Càn", symbol: "☰", nature: "Trời", element: "Kim", desc: "Cung Càn (Trời)" },
  { id: "kham", name: "Khảm", symbol: "☵", nature: "Nước", element: "Thủy", desc: "Cung Khảm (Nước)" },
  { id: "can_mt", name: "Cấn", symbol: "☶", nature: "Núi", element: "Thổ", desc: "Cung Cấn (Núi)" },
  { id: "chan", name: "Chấn", symbol: "☳", nature: "Sấm", element: "Mộc", desc: "Cung Chấn (Sấm)" },
  { id: "ton", name: "Tốn", symbol: "☴", nature: "Gió", element: "Mộc", desc: "Cung Tốn (Gió)" },
  { id: "ly", name: "Ly", symbol: "☲", nature: "Lửa", element: "Hỏa", desc: "Cung Ly (Lửa)" },
  { id: "khon", name: "Khôn", symbol: "☷", nature: "Đất", element: "Thổ", desc: "Cung Khôn (Đất)" },
  { id: "doai", name: "Đoài", symbol: "☱", nature: "Đầm", element: "Kim", desc: "Cung Đoài (Đầm)" },
];

// Bản đồ ánh xạ từng quẻ sang Cung Kinh Phòng chính thống
const HEX_PALACE_NAME_MAP: Record<number, string> = {
  1: "Càn", 44: "Càn", 33: "Càn", 12: "Càn", 20: "Càn", 23: "Càn", 35: "Càn", 14: "Càn",
  29: "Khảm", 60: "Khảm", 3: "Khảm", 63: "Khảm", 49: "Khảm", 55: "Khảm", 36: "Khảm", 7: "Khảm",
  52: "Cấn", 22: "Cấn", 26: "Cấn", 41: "Cấn", 38: "Cấn", 10: "Cấn", 61: "Cấn", 53: "Cấn",
  51: "Chấn", 16: "Chấn", 40: "Chấn", 32: "Chấn", 46: "Chấn", 48: "Chấn", 28: "Chấn", 17: "Chấn",
  57: "Tốn", 9: "Tốn", 37: "Tốn", 42: "Tốn", 25: "Tốn", 21: "Tốn", 27: "Tốn", 18: "Tốn",
  30: "Ly", 56: "Ly", 50: "Ly", 64: "Ly", 4: "Ly", 59: "Ly", 6: "Ly", 13: "Ly",
  2: "Khôn", 24: "Khôn", 19: "Khôn", 11: "Khôn", 34: "Khôn", 43: "Khôn", 5: "Khôn", 8: "Khôn",
  58: "Đoài", 47: "Đoài", 45: "Đoài", 31: "Đoài", 39: "Đoài", 15: "Đoài", 62: "Đoài", 54: "Đoài",
};

export const ManualBookSection: React.FC<ManualBookSectionProps> = ({
  cardImages = {},
  cardVideos = {},
  onImageUpdated,
  onVideoUpdated,
  onSelectHexagram,
  onOpenDetailTab,
  onOpenJiazi,
  onOpenDecks,
  defaultExpanded = true,
  selectedHexNumber,
  currentUser,
  onOpenAuthModal,
}) => {
  const isVip: boolean = true;
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [activeSectionId, setActiveSectionId] = useState<string>("hexagram_interpretations");
  const [showChaptersMenu, setShowChaptersMenu] = useState<boolean>(true);
  const [chapterNavMode, setChapterNavMode] = useState<"compact" | "grid">("compact");
  const [selectedTrigram, setSelectedTrigram] = useState<TrigramDetail>(TRIGRAM_DETAILS[0]);
  const [highlightedHex, setHighlightedHex] = useState<number | null>(null);
  const [bookHexSearch, setBookHexSearch] = useState<string>("");
  const [selectedBookHexNum, setSelectedBookHexNum] = useState<number>(selectedHexNumber || 1);
  const [rangeFilter, setRangeFilter] = useState<HexRangeFilter>("all");
  const [cungMatchMode, setCungMatchMode] = useState<"contains" | "palace">("contains");

  // Speech Synthesis (TTS Voiceover Thuyết Minh) states
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speechTitle, setSpeechTitle] = useState<string>("");

  // Synchronize when selectedHexNumber prop changes from outside (e.g. from JiaziSection)
  useEffect(() => {
    if (selectedHexNumber && selectedHexNumber >= 1 && selectedHexNumber <= 64) {
      setSelectedBookHexNum(selectedHexNumber);
      setActiveSectionId("hexagram_interpretations");
      setTimeout(() => {
        const el = document.getElementById("selected-hex-card");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  }, [selectedHexNumber]);

  // Filtering 64 hexagrams based on search and range filter
  const filteredBookHexagrams = BOOK_HEXAGRAMS.filter((h) => {
    const hexObj = HEXAGRAMS.find((item) => item.number === h.number);
    const upper = hexObj?.upperTrigram || "";
    const lower = hexObj?.lowerTrigram || "";
    const structureLower = h.structure.toLowerCase();

    // Range / Group filter
    if (rangeFilter === "upper" && (h.number < 1 || h.number > 30)) return false;
    if (rangeFilter === "lower" && (h.number < 31 || h.number > 64)) return false;

    // Cung filters
    if (rangeFilter !== "all" && rangeFilter !== "upper" && rangeFilter !== "lower") {
      if (cungMatchMode === "palace") {
        // Khớp theo 8 Cung Kinh Phòng chính thống (mỗi cung 8 quẻ)
        const palaceHexes = CUNG_PALACE_MEMBERS[rangeFilter] || [];
        if (!palaceHexes.includes(h.number)) return false;
      } else {
        // Khớp theo Ngoại quái / Nội quái chứa Cung này
        if (rangeFilter === "can") {
          const match = upper === "Càn" || lower === "Càn" || structureLower.includes("càn") || structureLower.includes("trời");
          if (!match) return false;
        } else if (rangeFilter === "khon") {
          const match = upper === "Khôn" || lower === "Khôn" || structureLower.includes("khôn") || structureLower.includes("đất");
          if (!match) return false;
        } else if (rangeFilter === "kham") {
          const match = upper === "Khảm" || lower === "Khảm" || structureLower.includes("khảm") || structureLower.includes("nước");
          if (!match) return false;
        } else if (rangeFilter === "ly") {
          const match = upper === "Ly" || lower === "Ly" || structureLower.includes("ly") || structureLower.includes("lửa");
          if (!match) return false;
        } else if (rangeFilter === "chan") {
          const match = upper === "Chấn" || lower === "Chấn" || structureLower.includes("chấn") || structureLower.includes("sấm");
          if (!match) return false;
        } else if (rangeFilter === "ton") {
          const match = upper === "Tốn" || lower === "Tốn" || structureLower.includes("tốn") || structureLower.includes("gió");
          if (!match) return false;
        } else if (rangeFilter === "can_mt") {
          const match = upper === "Cấn" || lower === "Cấn" || structureLower.includes("cấn") || structureLower.includes("núi");
          if (!match) return false;
        } else if (rangeFilter === "doai") {
          const match = upper === "Đoài" || lower === "Đoài" || structureLower.includes("đoài") || structureLower.includes("đầm") || structureLower.includes("hồ");
          if (!match) return false;
        }
      }
    }

    // Search query: hỗ trợ tìm theo số quẻ, tên, chữ đỏ, chữ Hán, cấu trúc và tên Cung (Càn, Khảm, Cấn...)
    const q = bookHexSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      h.number.toString() === q ||
      h.name.toLowerCase().includes(q) ||
      h.redHeadline.toLowerCase().includes(q) ||
      h.hanzi.toLowerCase().includes(q) ||
      h.structure.toLowerCase().includes(q) ||
      upper.toLowerCase().includes(q) ||
      lower.toLowerCase().includes(q)
    );
  });

  const selectedBookHex =
    BOOK_HEXAGRAMS.find((h) => h.number === selectedBookHexNum) || BOOK_HEXAGRAMS[0];

  const activeSection =
    MANUAL_SECTIONS.find((s) => s.id === activeSectionId) || MANUAL_SECTIONS[0];

  const currentSectionIndex = MANUAL_SECTIONS.findIndex((s) => s.id === activeSectionId);
  const prevSection = currentSectionIndex > 0 ? MANUAL_SECTIONS[currentSectionIndex - 1] : null;
  const nextSection = currentSectionIndex < MANUAL_SECTIONS.length - 1 ? MANUAL_SECTIONS[currentSectionIndex + 1] : null;

  const handleNavigateSection = (secId: string) => {
    setActiveSectionId(secId);
    if (secId === "hexagram_interpretations") {
      scrollToCard();
    }
  };

  const handlePrevSection = () => {
    if (prevSection) {
      handleNavigateSection(prevSection.id);
    }
  };

  const handleNextSection = () => {
    if (nextSection) {
      handleNavigateSection(nextSection.id);
    }
  };

  const handlePrevHex = () => {
    const prev = selectedBookHexNum > 1 ? selectedBookHexNum - 1 : 64;
    setSelectedBookHexNum(prev);
    scrollToCard();
  };

  const handleNextHex = () => {
    const next = selectedBookHexNum < 64 ? selectedBookHexNum + 1 : 1;
    setSelectedBookHexNum(next);
    scrollToCard();
  };

  const scrollToCard = () => {
    setTimeout(() => {
      const el = document.getElementById("selected-hex-card");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }, 50);
  };

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakUtterance = (title: string, rawText: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();

    // Clean formatting and unwanted symbols
    const cleanText = rawText
      .replace(/[*#_~`>]/g, " ")
      .replace(/[-•]/g, ", ")
      .replace(/\s+/g, " ")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "vi-VN";
    utterance.rate = 0.92;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find(
      (v) => v.lang.startsWith("vi") || v.lang.includes("VN")
    );
    if (viVoice) {
      utterance.voice = viVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      setSpeechTitle(title);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setSpeechTitle("");
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setSpeechTitle("");
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleStopSpeech = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
      setSpeechTitle("");
    }
  };

  const handlePauseResumeSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const handleToggleSpeakHexagram = (hex: BookHexagramSummary) => {
    if (!isVip) {
      if (onOpenAuthModal) onOpenAuthModal("register");
      return;
    }
    if (isSpeaking && speechTitle.includes(`Quẻ #${hex.number}`)) {
      handleStopSpeech();
      return;
    }
    const story = ICHING_STORIES[hex.number];
    const speechContent = `Thuyết minh Quẻ số ${hex.number}: ${hex.name}. Hán tự: ${hex.hanzi}. Cấu trúc quẻ: ${hex.structure}. Dòng chữ đỏ kim chỉ nam: ${hex.redHeadline}. Thơ tượng và dịch nghĩa: ${hex.poemMeaning || hex.poemHan}. Đại tượng truyện: ${hex.bigImage}. Vận thế thời vận: ${hex.destiny}. Tình yêu và hôn nhân: ${hex.love}. ${story ? `Câu chuyện Kinh Dịch: ${story.storyTitle}. ${story.story}. Bài học nhân sinh: ${story.moral}` : ""}`;
    speakUtterance(`Quẻ #${hex.number} ${hex.name}`, speechContent);
  };

  const handleToggleSpeakChapter = (section: (typeof MANUAL_SECTIONS)[0]) => {
    if (isSpeaking && speechTitle === section.title) {
      handleStopSpeech();
      return;
    }
    speakUtterance(section.title, `${section.title}. ${section.summary}. ${section.content}`);
  };

  const handleNavigateToHex = (hexNum: number) => {
    setSelectedBookHexNum(hexNum);
    setActiveSectionId("hexagram_interpretations");
    onSelectHexagram?.(hexNum);
    scrollToCard();
  };

  const getSectionIcon = (iconName: string) => {
    switch (iconName) {
      case "BookOpen":
        return <BookOpen className="w-4 h-4" />;
      case "Compass":
        return <Compass className="w-4 h-4" />;
      case "Layers":
        return <Layers className="w-4 h-4" />;
      case "Sparkles":
        return <Sparkles className="w-4 h-4" />;
      case "Scroll":
        return <Scroll className="w-4 h-4" />;
      case "Hash":
        return <Hash className="w-4 h-4" />;
      case "Flame":
        return <Flame className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  return (
    <div
      id="thuyet-minh"
      className="royal-frame px-5 py-8 sm:px-10 sm:py-10 transition-all duration-300"
    >
      <span className="royal-corner tl" />
      <span className="royal-corner tr" />
      <span className="royal-corner bl" />
      <span className="royal-corner br" />

      {/* Main Header / Title Bar */}
      <div className="flex flex-col gap-6 pb-6 border-b border-gold-800">
        <div className="flex items-start gap-4">
          <span className="royal-seal w-12 h-12 text-xl shrink-0 mt-1">說</span>
          <div>
            <div className="royal-eyebrow before:hidden">Sách đi kèm bộ bài 64 quẻ · 說卦</div>
            <h2 className="royal-title mt-2 text-3xl sm:text-4xl">
              Thuyết minh
              <span className="italic text-gold-300"> bài Tarot Kinh Dịch</span>
            </h2>
          </div>
        </div>

        {/* Action Toggle Button */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {onOpenDecks && (
            <button
              type="button"
              onClick={() => {
                if (!isVip) {
                  if (onOpenAuthModal) {
                    onOpenAuthModal(currentUser ? "upgrade" : "login");
                  }
                  return;
                }
                onOpenDecks();
              }}
              className="royal-btn-ghost !px-3.5 !py-2 !text-[11px] flex items-center gap-1.5"
              title={isVip ? "Xem và quản lý các bộ ảnh 64 Quẻ bài Tarot" : "Đặc quyền Hội Viên VIP: Xem và quản lý các bộ ảnh 64 Quẻ bài Tarot"}
            >
              <Palette className="w-3.5 h-3.5 text-gold-500" />
              <span>Bộ Hình 64 Quẻ</span>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9.5px] font-sans font-bold bg-gold-950 text-gold-400 border border-gold-700/60">
                <Crown className="w-2.5 h-2.5 text-amber-400" />
                VIP
              </span>
            </button>
          )}

          {onOpenJiazi && (
            <button
              type="button"
              onClick={onOpenJiazi}
              className="royal-btn-ghost !px-3.5 !py-2 !text-[11px]"
              title="Xem Lục Thập Hoa Giáp & Nạp hình"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Lục Thập Hoa Giáp</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="royal-btn !px-4 !py-2 !text-[11px]"
            title={isExpanded ? "Thu gọn Thuyết minh" : "Mở rộng Thuyết minh"}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{isExpanded ? "Thu Gọn Thuyết Minh" : "Mở Xem Thuyết Minh"}</span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Collapsed Preview Teaser */}
      {!isExpanded && (
        <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-ivory-500">
          <p className="font-display italic text-lg sm:text-xl text-ivory-300 leading-snug">
            “Kinh Dịch không định đoạt số phận. Nó phản chiếu tình thế hiện tại và gợi mở hướng đi — phần còn lại thuộc về người đọc quẻ.”
          </p>
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="royal-link shrink-0 cursor-pointer"
          >
            Đọc toàn bộ nội dung sách <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Expanded Interactive Book Body */}
      {isExpanded && (
        <div className="mt-5 space-y-6">
          {/* MỤC LỤC CHƯƠNG HỒI SÁCH THUYẾT MINH (9 CHƯƠNG) */}
          <div className="border border-gold-800 bg-lacquer-950/50 p-4 sm:p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gold-800 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-gold-500" />
                <h3 className="text-sm sm:text-base font-display font-semibold text-ivory-100 uppercase tracking-wider">
                  Mục Lục Sách Thuyết Minh ({MANUAL_SECTIONS.length} Chương)
                </h3>
                <span className="px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold bg-lacquer-700 text-gold-500 border border-gold-800">
                  Chương {currentSectionIndex + 1}/{MANUAL_SECTIONS.length}
                </span>
              </div>

              {/* View mode controls */}
              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                <div className="flex items-center border border-gold-800 rounded-sm p-0.5 text-xs font-serif">
                  <button
                    type="button"
                    onClick={() => setChapterNavMode("compact")}
                    className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                      chapterNavMode === "compact"
                        ? "bg-gold-500/15 text-gold-200 font-semibold ring-1 ring-inset ring-gold-500/70"
                        : "text-ivory-500 hover:text-gold-200"
                    }`}
                    title="Chế độ thanh ngang gọn gàng"
                  >
                    <LayoutList className="w-3 h-3" />
                    <span className="text-[11px]">Thanh Gọn</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setChapterNavMode("grid")}
                    className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                      chapterNavMode === "grid"
                        ? "bg-gold-500/15 text-gold-200 font-semibold ring-1 ring-inset ring-gold-500/70"
                        : "text-ivory-500 hover:text-gold-200"
                    }`}
                    title="Chế độ lưới chi tiết 9 chương"
                  >
                    <Grid className="w-3 h-3" />
                    <span className="text-[11px]">Lưới 9 Chương</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowChaptersMenu(!showChaptersMenu)}
                  className="px-2 py-1 rounded-sm text-xs text-gold-500 hover:text-gold-200 hover:bg-lacquer-800 font-serif flex items-center gap-1 cursor-pointer"
                  title={showChaptersMenu ? "Thu gọn menu chương" : "Mở rộng menu chương"}
                >
                  {showChaptersMenu ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Render Navigation Bar: Compact Horizontal Pills vs Full Grid */}
            {showChaptersMenu && (
              <>
                {chapterNavMode === "compact" ? (
                  /* COMPACT HORIZONTAL PILL NAVIGATOR */
                  <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-thin">
                    {MANUAL_SECTIONS.map((sec, idx) => {
                      const isActive = activeSectionId === sec.id;
                      const shortTitle = sec.title.replace(/^\d+\.\s*/, "").split(":")[0];
                      return (
                        <button
                          key={sec.id}
                          type="button"
                          onClick={() => handleNavigateSection(sec.id)}
                          className={`px-3 py-1.5 rounded-sm text-xs font-serif font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 border ${
                            isActive
                              ? "bg-gold-500/10 text-gold-200 border-gold-500"
                              : "bg-lacquer-800 text-ivory-300 border-lacquer-700 hover:border-gold-500/60 hover:text-gold-200 hover:bg-lacquer-800"
                          }`}
                        >
                          <span className={`w-4 h-4 rounded-sm flex items-center justify-center text-[10px] font-mono ${
                            isActive ? "bg-gold-500 text-lacquer-950" : "border border-gold-800 text-gold-500"
                          }`}>
                            {idx + 1}
                          </span>
                          <span>{shortTitle}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  /* FULL GRID OF 9 CHAPTERS */
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                    {MANUAL_SECTIONS.map((sec, idx) => {
                      const isActive = activeSectionId === sec.id;
                      return (
                        <button
                          key={sec.id}
                          type="button"
                          onClick={() => handleNavigateSection(sec.id)}
                          className={`flex items-start gap-2.5 p-3 rounded-sm border text-left transition-all cursor-pointer ${
                            isActive
                              ? "bg-gold-500/[0.06] border-gold-500"
                              : "bg-lacquer-800 border-lacquer-700 text-ivory-500 hover:text-gold-200 hover:bg-lacquer-800 hover:border-gold-800"
                          }`}
                        >
                          <div className={`p-2 rounded-sm shrink-0 mt-0.5 ${
                            isActive ? "border border-gold-500 text-gold-300" : "border border-gold-800 text-gold-600"
                          }`}>
                            {getSectionIcon(sec.icon)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <span className={`text-xs font-serif font-bold truncate ${
                                isActive ? "text-ivory-100" : "text-ivory-300"
                              }`}>
                                {sec.title}
                              </span>
                              {isActive && (
                                <span className="w-2 h-2 rotate-45 bg-gold-500 shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-ivory-500 line-clamp-1 leading-snug">
                              {sec.summary}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Active Chapter Container */}
          <div className="border border-gold-800 bg-lacquer-950/40 p-5 sm:p-8 space-y-6">
            {/* Chapter Header Banner with Fast Flipping Buttons & Audio Speak */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-gold-800 pb-5">
              <div>
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-gold-500">
                  {getSectionIcon(activeSection.icon)}
                  <span>Chương {currentSectionIndex + 1} / {MANUAL_SECTIONS.length}</span>
                </div>
                <h3 className="royal-title mt-2 text-2xl sm:text-3xl">{activeSection.title}</h3>
                <p className="text-sm text-ivory-500 mt-1.5 font-serif italic">
                  {activeSection.summary}
                </p>
              </div>

              {/* Quick Prev / Next Chapter Buttons & Voice Narration */}
              <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto flex-wrap">
                {/* Audio Speak Chapter Button */}
                <button
                  type="button"
                  onClick={() => handleToggleSpeakChapter(activeSection)}
                  className={`px-2.5 py-1.5 rounded-sm text-xs font-serif border flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                    isSpeaking && speechTitle === activeSection.title
                      ? "bg-[#3D1414] border-rose-600 text-rose-300 animate-pulse"
                      : "bg-lacquer-800 hover:bg-lacquer-700 text-gold-300 border-gold-800 hover:border-gold-500"
                  }`}
                  title={isSpeaking && speechTitle === activeSection.title ? "Dừng đọc chương" : "Nghe thuyết minh giọng đọc chương này"}
                >
                  {isSpeaking && speechTitle === activeSection.title ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                      <span className="hidden sm:inline">Dừng Đọc</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-gold-500" />
                      <span className="hidden sm:inline">Nghe Đọc Chương</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handlePrevSection}
                  disabled={!prevSection}
                  className={`px-2.5 py-1.5 rounded-sm text-xs font-serif border flex items-center gap-1.5 transition-all ${
                    prevSection
                      ? "bg-lacquer-800 text-gold-300 hover:text-gold-200 border-gold-800 hover:border-gold-500 cursor-pointer"
                      : "opacity-40 bg-lacquer-900 text-gold-700 border-transparent cursor-not-allowed"
                  }`}
                  title={prevSection ? `Chương trước: ${prevSection.title}` : undefined}
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-gold-500" />
                  <span className="hidden md:inline">Chương trước</span>
                </button>

                <div className="text-[11px] font-mono text-gold-500 font-bold px-2 py-1 bg-lacquer-800 border border-gold-800 rounded-sm">
                  {currentSectionIndex + 1} / {MANUAL_SECTIONS.length}
                </div>

                <button
                  type="button"
                  onClick={handleNextSection}
                  disabled={!nextSection}
                  className={`px-2.5 py-1.5 rounded-sm text-xs font-serif border flex items-center gap-1.5 transition-all ${
                    nextSection
                      ? "bg-lacquer-800 text-gold-300 hover:text-gold-200 border-gold-800 hover:border-gold-500 cursor-pointer"
                      : "opacity-40 bg-lacquer-900 text-gold-700 border-transparent cursor-not-allowed"
                  }`}
                  title={nextSection ? `Chương tiếp: ${nextSection.title}` : undefined}
                >
                  <span className="hidden md:inline">Chương tiếp</span>
                  <ArrowRight className="w-3.5 h-3.5 text-gold-500" />
                </button>
              </div>
            </div>

            {/* FLOATING / STICKY VOICE NARRATION AUDIO BAR */}
            {isSpeaking && (
              <div className="bg-lacquer-950/70 border border-gold-700 border-l-2 border-l-gold-500 rounded-sm p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-sm bg-gold-500 text-lacquer-900 flex items-center justify-center font-bold shadow animate-pulse">
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-gold-500 font-bold">
                        Đang Thuyết Minh Giọng Đọc
                      </span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    </div>
                    <span className="text-sm font-serif font-bold text-ivory-100 line-clamp-1">
                      {speechTitle}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePauseResumeSpeech}
                    className="px-3 py-1.5 rounded-sm bg-lacquer-900 hover:bg-lacquer-800 border border-gold-800 text-ivory-100 font-serif flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-gold-300" />}
                    <span>{isPaused ? "Tiếp Tục" : "Tạm Dừng"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleStopSpeech}
                    className="px-3 py-1.5 rounded-sm bg-[#3A1414] hover:bg-[#4E1B1B] border border-rose-700/80 text-rose-200 font-serif font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Square className="w-3 h-3 text-rose-400" />
                    <span>Dừng Đọc</span>
                  </button>
                </div>
              </div>
            )}

            {/* CHAPTER 1: LỜI NÓI ĐẦU & GIỚI THIỆU */}
            {(activeSection.id === "preface" || activeSection.id === "intro_tarot_iching") && (
              <Chapter1Intro onNavigateToSection={handleNavigateSection} />
            )}

            {/* CHAPTER 2: NGUỒN GỐC & NGUYÊN LÝ ÂM DƯƠNG */}
            {activeSection.id === "history_yinyang" && (
              <Chapter2History onNavigateToSection={handleNavigateSection} />
            )}

            {/* CHAPTER 3: ĐẶC TÍNH BÁT QUÁI (BÁT QUÁI ĐỒ & TƯƠNG TÁC) */}
            {activeSection.id === "eight_trigrams" && (
              <div className="space-y-6">
                {/* Chapter 3 Banner */}
                <div className="bg-lacquer-900 border border-lacquer-700 rounded-md p-5 sm:p-6 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-serif font-bold text-gold-500 uppercase tracking-wider">
                    <Layers className="w-4 h-4" />
                    <span>Căn Bản Dịch Học</span>
                  </div>
                  <h3 className="text-lg sm:text-2xl font-display font-semibold text-ivory-100">
                    Tiên Thiên Bát Quái Đồ & Ý Tượng Tự Nhiên
                  </h3>
                  <p className="text-xs sm:text-sm text-ivory-300 font-serif leading-relaxed">
                    64 quẻ trong Kinh Dịch được tạo thành từ việc xếp chồng Bát quái (8 đơn quái) lên nhau. Vị đế vương thời cổ đại là <strong className="text-ivory-100">Phục Hy</strong>, qua việc ngẩng lên quan sát thiên văn, cúi xuống khảo sát địa lý và mô phỏng vạn vật, đã vẽ nên <em>“Tiên thiên Bát quái đồ”</em>.
                  </p>
                  <p className="text-xs sm:text-sm text-ivory-300 font-serif leading-relaxed">
                    Nắm vững các đặc tính Bát quái (Lục thân, Bộ phận cơ thể, Phương vị, Ngũ hành, Tượng quẻ) là điều kiện cốt lõi để thấu suốt bản chất từng lá bài Tarot Kinh Dịch.
                  </p>
                </div>

                {/* Interactive 8 Trigram Browser */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-serif font-bold text-ivory-100 flex items-center gap-2">
                      <span className="text-gold-500">☯</span> Bát Đơn Quái Tương Tác: Khảo Sát Lục Thân, Cơ Thể, Phương Vị & Ngũ Hành
                    </h4>
                    <span className="text-[11px] font-mono text-ivory-500">8 Đơn Quái</span>
                  </div>

                  {/* 8 Trigram Selectors */}
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {TRIGRAM_DETAILS.map((tri) => {
                      const isSelected = selectedTrigram.id === tri.id;
                      return (
                        <button
                          key={tri.id}
                          type="button"
                          onClick={() => setSelectedTrigram(tri)}
                          className={`flex flex-col items-center justify-center p-2.5 rounded-sm border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-lacquer-700 border-gold-500 scale-105"
                              : "bg-lacquer-800 border-gold-800 text-ivory-500 hover:border-gold-600 hover:text-gold-200"
                          }`}
                        >
                          <span className="text-2xl leading-none font-mono text-gold-500 mb-1">
                            {tri.symbol}
                          </span>
                          <span className="text-xs font-serif font-bold text-ivory-100">
                            {tri.name} ({tri.hanzi})
                          </span>
                          <span className="text-[9px] font-mono text-ivory-500">{tri.nature}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Detailed Display of Selected Trigram */}
                  <div className="bg-lacquer-800 border border-gold-800 rounded-md p-5 grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
                    <div className="flex flex-col items-center text-center p-4 bg-lacquer-900 rounded-sm border border-lacquer-700">
                      <span className="text-4xl text-gold-500 font-mono mb-2">
                        {selectedTrigram.symbol}
                      </span>
                      <h5 className="text-lg font-serif font-bold text-ivory-100">
                        Quẻ {selectedTrigram.name} • {selectedTrigram.hanzi}
                      </h5>
                      <span className="text-xs text-gold-500 font-mono mt-0.5">
                        Lấy tượng: {selectedTrigram.nature}
                      </span>
                      <span className="text-[11px] text-ivory-500 font-serif italic mt-1">
                        {selectedTrigram.lines}
                      </span>
                      <div className="mt-3 px-2.5 py-0.5 rounded-sm text-[10px] font-mono font-bold bg-lacquer-700 text-gold-400 border border-gold-800">
                        {selectedTrigram.order}
                      </div>
                    </div>

                    <div className="md:col-span-2 space-y-3">
                      <p className="text-xs sm:text-sm text-ivory-300 font-serif leading-relaxed italic border-l-2 border-gold-500 pl-3">
                        “{selectedTrigram.attribute}”
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                        <div className="bg-lacquer-900 border border-lacquer-700 p-2.5 rounded-sm">
                          <span className="text-[10px] text-ivory-500 uppercase font-mono block">
                            LỤC THÂN
                          </span>
                          <span className="text-xs font-serif font-bold text-ivory-100">
                            {selectedTrigram.familyRole}
                          </span>
                        </div>

                        <div className="bg-lacquer-900 border border-lacquer-700 p-2.5 rounded-sm">
                          <span className="text-[10px] text-ivory-500 uppercase font-mono block">
                            NGŨ HÀNH
                          </span>
                          <span className="text-xs font-serif font-bold text-gold-500">
                            Hành {selectedTrigram.element}
                          </span>
                        </div>

                        <div className="bg-lacquer-900 border border-lacquer-700 p-2.5 rounded-sm">
                          <span className="text-[10px] text-ivory-500 uppercase font-mono block">
                            PHƯƠNG VỊ
                          </span>
                          <span className="text-xs font-serif font-bold text-ivory-100">
                            Hướng {selectedTrigram.direction}
                          </span>
                        </div>

                        <div className="bg-lacquer-900 border border-lacquer-700 p-2.5 rounded-sm">
                          <span className="text-[10px] text-ivory-500 uppercase font-mono block">
                            BỘ PHẬN CƠ THỂ
                          </span>
                          <span className="text-xs font-serif font-bold text-[#E89C7E]">
                            {selectedTrigram.bodyParts.join(", ")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CHAPTER 4: NGUYÊN TẮC GIẢI QUẺ & TƯ DUY KHOA HỌC */}
            {activeSection.id === "divination_principles" && (
              <Chapter4DivinationPrinciples onNavigateToSection={handleNavigateSection} />
            )}

            {/* CHAPTER 5: CÁC PHƯƠNG PHÁP TRẢI BÀI VÀ 5 VÍ DỤ MINH HỌA */}
            {activeSection.id === "spread_methods" && (
              <SpreadMethodsSection
                cardImages={cardImages}
                cardVideos={cardVideos}
                onSelectHexagram={onSelectHexagram}
                onNavigateToLookup={handleNavigateToHex}
              />
            )}

            {/* CHAPTER 6: QUY TẮC XEM HÀO ĐỘNG (CHU HY - THÁI PHÁT) */}
            {activeSection.id === "changing_lines_rules" && (
              <ChapterChangingLinesRules
                onNavigateToSection={handleNavigateSection}
                onNavigateToHex={handleNavigateToHex}
              />
            )}

            {/* CHAPTER 7: CÂU CHUYỆN KINH DỊCH (TIẾN TRÌNH 64 QUẺ) */}
            {activeSection.id === "iching_story" && (
              <ChapterIChingStory
                onNavigateToHex={handleNavigateToHex}
                onNavigateToSection={handleNavigateSection}
              />
            )}

            {/* CHAPTER: LIÊN KẾT KINH DỊCH & KHỔNG MINH THẦN QUẺ (384 HÀO) */}
            {activeSection.id === "khong_minh_bridge" && (
              <div className="mt-4">
                <KhongMinhFullBrowser onNavigateToHex={handleNavigateToHex} />
              </div>
            )}

            {/* CHAPTER 8: BÀI HỌC TÂM LINH & ĐỐI DIỆN ĐIỀM XẤU */}
            {activeSection.id === "dealing_with_bad_omens" && (
              <Chapter8BadOmens onNavigateToSection={handleNavigateSection} />
            )}

            {/* CHAPTER 9: LỜI BẠT & THÔNG TIN ẤN HÀNH */}
            {activeSection.id === "colophon" && (
              <Chapter9Colophon onNavigateToSection={handleNavigateSection} />
            )}

            {/* SPECIAL INTERACTIVE MODULE: CHAPTER 7 - BẢNG TRA MA TRẬN 64 QUẺ */}
            {activeSection.id === "lookup_matrix" && (
              <div className="space-y-4">
                <div className="bg-lacquer-900 border border-lacquer-700 rounded-md p-4 sm:p-5 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-serif font-bold text-gold-500 uppercase tracking-wider">
                    <Hash className="w-4 h-4" />
                    <span>Ma Trận 8 Cung Bát Quái 8x8</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-display font-semibold text-ivory-100">
                    Bảng Tra Cứu Phối Quái 64 Quẻ Kinh Dịch
                  </h3>
                  <p className="text-xs sm:text-sm text-ivory-300 font-serif leading-relaxed">
                    Tra cứu số quẻ tương ứng bằng cách phối hợp: Hàng ngang là quái <strong>NỘI</strong> (quẻ ở dưới), Cột dọc là quái <strong>NGOẠI</strong> (quẻ ở trên). Nhấp vào bất kỳ ô nào để xem toàn văn trang Thuyết Minh của quẻ đó!
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="text-xs text-ivory-300 font-serif">
                    <span className="font-bold text-gold-500">Hướng dẫn:</span> Hàng ngang là quái
                    NỘI (quẻ dưới), Cột dọc là quái NGOẠI (quẻ trên). Nhấp vào bất kỳ ô nào để tra cứu quẻ!
                  </div>
                  {highlightedHex && (
                    <div className="text-xs font-serif text-gold-500 flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>
                        Quẻ #{highlightedHex}: {HEXAGRAMS.find((h) => h.number === highlightedHex)?.name}
                      </span>
                    </div>
                  )}
                </div>

                <div className="overflow-x-auto border border-gold-800 rounded-md bg-lacquer-900">
                  <table className="w-full text-center text-xs font-serif border-collapse">
                    <thead>
                      <tr className="bg-lacquer-800 border-b border-gold-800 text-gold-500">
                        <th className="p-2 border-r border-gold-800 font-mono text-[10px]">
                          Nội \ Ngoại
                        </th>
                        <th className="p-2 border-r border-gold-800">Càn☰</th>
                        <th className="p-2 border-r border-gold-800">Đoài☱</th>
                        <th className="p-2 border-r border-gold-800">Ly☲</th>
                        <th className="p-2 border-r border-gold-800">Chấn☳</th>
                        <th className="p-2 border-r border-gold-800">Tốn☴</th>
                        <th className="p-2 border-r border-gold-800">Khảm☵</th>
                        <th className="p-2 border-r border-gold-800">Cấn☶</th>
                        <th className="p-2">Khôn☷</th>
                      </tr>
                    </thead>
                    <tbody>
                      {HEXAGRAM_LOOKUP_MATRIX.map((row, rIdx) => (
                        <tr
                          key={rIdx}
                          className="border-b border-gold-800 hover:bg-lacquer-800 transition-colors"
                        >
                          <td className="p-2 bg-lacquer-800 font-bold text-ivory-300 border-r border-gold-800 whitespace-nowrap">
                            {row.inner.name}
                          </td>
                          {row.outers.map((hexNum, cIdx) => {
                            const hex = HEXAGRAMS.find((h) => h.number === hexNum);
                            const isSelected = highlightedHex === hexNum;
                            return (
                              <td
                                key={cIdx}
                                onClick={() => {
                                  setHighlightedHex(hexNum);
                                  setSelectedBookHexNum(hexNum);
                                  setActiveSectionId("hexagram_interpretations");
                                  onSelectHexagram?.(hexNum);
                                  scrollToCard();
                                }}
                                className={`p-2 border-r border-lacquer-700 last:border-r-0 cursor-pointer transition-all ${
                                  isSelected
                                    ? "bg-gold-500/15 text-gold-200 font-semibold ring-1 ring-inset ring-gold-500/70"
                                    : "text-ivory-300 hover:bg-gold-800 hover:text-gold-200"
                                }`}
                                title={`${hexNum}. ${hex?.name || ""}`}
                              >
                                <div className="font-mono text-[11px] font-bold">
                                  {hexNum}.
                                </div>
                                <div className="text-[10px] truncate max-w-[70px] mx-auto">
                                  {hex?.vietnameseName.replace(/^Thuần\s+/, "") || ""}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SPECIAL INTERACTIVE MODULE: CẨM NANG 64 QUẺ CHUẨN SÁCH - PHƠI ĐẦY ĐỦ TOÀN BỘ 64 QUẺ */}
            {activeSection.id === "hexagram_interpretations" && (
              <div className="mt-6 pt-6 border-t border-gold-800 space-y-5">
                {/* Search & Quick Filter Bar */}
                <div className="bg-lacquer-950/50 p-4 rounded-sm border border-gold-800 space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <BookOpen className="w-4 h-4 text-gold-500" />
                      <span className="text-xs sm:text-sm font-serif font-bold text-ivory-100">
                        Mục Lục 64 Quẻ Thuyết Minh (Đầy Đủ Cả Bộ)
                      </span>
                      <span className="px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold bg-lacquer-700 text-gold-500 border border-gold-800">
                        {filteredBookHexagrams.length}/64 quẻ
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 flex-1 sm:max-w-lg justify-start sm:justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveSectionId("iching_story");
                          const el = document.getElementById("thuyet-minh");
                          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                        }}
                        className="px-3 py-1.5 rounded-sm bg-lacquer-700 hover:bg-gold-500 text-gold-500 hover:text-lacquer-900 border border-gold-800 hover:border-gold-500 text-xs font-serif font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer"
                        title="Đọc thiên sử thi toàn bộ 64 câu chuyện Kinh Dịch"
                      >
                        <Scroll className="w-3.5 h-3.5" />
                        <span>Đọc Câu Chuyện Kinh Dịch</span>
                      </button>

                      {/* Search input */}
                      <div className="relative flex-1 min-w-[180px]">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ivory-500" />
                        <input
                          type="text"
                          value={bookHexSearch}
                          onChange={(e) => setBookHexSearch(e.target.value)}
                          placeholder="Tìm số (1-64), tên quẻ, chữ đỏ..."
                          className="w-full bg-lacquer-900 border border-gold-800 text-xs text-gold-300 rounded-sm pl-8 pr-3 py-2 focus:outline-none focus:border-gold-500 placeholder-gold-700"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Filter Categories: Thượng/Hạ Kinh & BÁT CUNG (8 CUNG) */}
                  <div className="space-y-2.5 pt-2 border-t border-lacquer-700">
                    {/* Hàng 1: Tổng Quát (Tất cả, Thượng Kinh, Hạ Kinh) + Chế độ lọc Cung */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] text-ivory-500 font-serif flex items-center gap-1 mr-1">
                          <ListFilter className="w-3 h-3 text-gold-500" /> Phân loại:
                        </span>
                        {[
                          { id: "all", label: "Tất cả (64 Quẻ)" },
                          { id: "upper", label: "Thượng Kinh (1-30)" },
                          { id: "lower", label: "Hạ Kinh (31-64)" },
                        ].map((btn) => (
                          <button
                            key={btn.id}
                            type="button"
                            onClick={() => setRangeFilter(btn.id as HexRangeFilter)}
                            className={`px-2.5 py-1 rounded-sm text-[11px] font-serif transition-all cursor-pointer ${
                              rangeFilter === btn.id
                                ? "bg-gold-500/15 text-gold-200 font-semibold ring-1 ring-inset ring-gold-500/70"
                                : "bg-lacquer-900 text-ivory-500 hover:text-gold-200 hover:bg-lacquer-800 border border-lacquer-700"
                            }`}
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>

                      {/* Chế độ tra cứu Cung */}
                      {rangeFilter !== "all" && rangeFilter !== "upper" && rangeFilter !== "lower" && (
                        <div className="flex items-center gap-1 text-[10px] bg-lacquer-900 border border-lacquer-700 rounded-sm p-0.5">
                          <span className="text-ivory-500 font-serif px-1.5">Cách lọc:</span>
                          <button
                            type="button"
                            onClick={() => setCungMatchMode("contains")}
                            className={`px-2 py-0.5 rounded text-[10px] font-serif transition-all cursor-pointer ${
                              cungMatchMode === "contains"
                                ? "bg-gold-500/15 text-gold-200 font-semibold ring-1 ring-inset ring-gold-500/70"
                                : "text-ivory-500 hover:text-gold-200"
                            }`}
                            title="Quẻ có Ngoại quái hoặc Nội quái thuộc cung này"
                          >
                            Chứa quái Cung (15 quẻ)
                          </button>
                          <button
                            type="button"
                            onClick={() => setCungMatchMode("palace")}
                            className={`px-2 py-0.5 rounded text-[10px] font-serif transition-all cursor-pointer ${
                              cungMatchMode === "palace"
                                ? "bg-gold-500/15 text-gold-200 font-semibold ring-1 ring-inset ring-gold-500/70"
                                : "text-ivory-500 hover:text-gold-200"
                            }`}
                            title="Họ quẻ chính thống Bát Cung Kinh Phòng (Chu kỳ 8 quẻ/cung)"
                          >
                            8 Cung Kinh Phòng (8 quẻ)
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Hàng 2: THANH LỌC 8 CUNG BÁT QUÁI (CÀN, KHẢM, CẤN, CHẤN, TỐN, LY, KHÔN, ĐOÀI) */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] text-gold-500 font-serif font-bold flex items-center gap-1 mr-1">
                        <Compass className="w-3 h-3 text-gold-500" /> Lọc theo Cung:
                      </span>
                      {CUNG_INFO_LIST.map((cung) => {
                        const isSelected = rangeFilter === cung.id;
                        return (
                          <button
                            key={cung.id}
                            type="button"
                            onClick={() => setRangeFilter(isSelected ? "all" : (cung.id as HexRangeFilter))}
                            className={`px-2.5 py-1 rounded-sm text-xs font-serif transition-all cursor-pointer flex items-center gap-1.5 border ${
                              isSelected
                                ? "bg-gold-500/15 text-gold-200 font-semibold border-gold-500"
                                : "bg-lacquer-900 text-ivory-300 hover:text-gold-200 hover:bg-lacquer-700 border-lacquer-700 hover:border-gold-500/50"
                            }`}
                            title={`${cung.desc} - Hành ${cung.element}`}
                          >
                            <span className="font-mono text-sm leading-none opacity-90">{cung.symbol}</span>
                            <span>Cung {cung.name}</span>
                            <span className={`text-[10px] ${isSelected ? "text-[#3D2C0C]" : "text-[#85735D]"}`}>
                              ({cung.nature})
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* MỤC LỤC TRỌN BỘ 64 LÁ BÀI - PHƠI ĐẦY ĐỦ TRÊN GRID */}
                <div className="bg-lacquer-900 border border-gold-800 rounded-md p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs text-ivory-500 font-serif">
                    <span>Chọn bất kỳ quẻ nào dưới đây để xem toàn bộ trang thuyết minh:</span>
                    <span className="text-gold-500 font-bold font-mono">Đang xem Quẻ #{selectedBookHex.number}</span>
                  </div>

                  {/* Responsive Complete Grid: 2 cols on mobile, 4 on tablet, 8 on desktop */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
                    {filteredBookHexagrams.map((bHex) => {
                      const isSelected = selectedBookHexNum === bHex.number;
                      const hexObj = HEXAGRAMS.find((h) => h.number === bHex.number);
                      const customImg = cardImages[bHex.number];

                      return (
                        <button
                          key={bHex.number}
                          type="button"
                          onClick={() => {
                            setSelectedBookHexNum(bHex.number);
                            scrollToCard();
                          }}
                          className={`flex flex-col p-2 rounded-sm border text-left transition-all cursor-pointer relative group ${
                            isSelected
                              ? "bg-gradient-to-b from-lacquer-700 to-lacquer-800 border-gold-500 ring-1 ring-gold-500"
                              : "bg-lacquer-800 border-lacquer-700 text-ivory-300 hover:text-gold-200 hover:bg-lacquer-700 hover:border-gold-800"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1.5">
                            <span className={`font-mono text-[11px] font-bold px-1.5 py-0.5 rounded ${
                              isSelected ? "bg-gold-500 text-lacquer-900" : "bg-lacquer-700 text-gold-500"
                            }`}>
                              #{bHex.number}
                            </span>
                            <span className="text-xs font-serif text-ivory-300 opacity-70 group-hover:opacity-100">
                              {bHex.hanzi}
                            </span>
                          </div>

                          {/* Hình thu nhỏ quẻ Kinh Dịch (Card Artwork / Hexagram graphic) */}
                          <div className="w-full aspect-[2/3] max-h-24 rounded-sm overflow-hidden bg-lacquer-950 border border-lacquer-700 mb-1.5 flex items-center justify-center relative shadow-inner">
                            {customImg ? (
                              <img
                                src={customImg}
                                alt={bHex.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="flex flex-col items-center justify-center p-1 w-full h-full text-center bg-gradient-to-b from-lacquer-800 to-lacquer-900">
                                <span className="text-2xl text-gold-500 font-serif leading-none select-none group-hover:scale-110 transition-transform">
                                  {hexObj?.symbol || "䷀"}
                                </span>
                                <span className="text-[8px] text-ivory-500 font-serif mt-1">
                                  {hexObj?.upperTrigram}/{hexObj?.lowerTrigram}
                                </span>
                              </div>
                            )}
                          </div>

                          <span className={`text-xs font-serif font-bold truncate ${
                            isSelected ? "text-ivory-100" : "text-ivory-100"
                          }`}>
                            {bHex.name}
                          </span>
                          <div className="flex items-center justify-between text-[10px] text-ivory-500 mt-0.5 gap-1">
                            <span className="truncate">{bHex.structure}</span>
                            <span className="shrink-0 px-1 py-0.2 rounded text-[9px] font-serif bg-lacquer-800 text-gold-500 border border-gold-800">
                              {HEX_PALACE_NAME_MAP[bHex.number]}
                            </span>
                          </div>
                          {/* Dòng chữ đỏ tooltip / subtle mark */}
                          <div className="mt-1 pt-1 border-t border-lacquer-700 text-[9px] text-[#D97777] truncate font-medium">
                            {bHex.redHeadline}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {filteredBookHexagrams.length === 0 && (
                    <div className="text-center py-8 text-xs text-ivory-500 font-serif">
                      Không tìm thấy quẻ nào khớp với từ khóa "{bookHexSearch}".
                    </div>
                  )}
                </div>

                {/* Selected Hexagram Card Display - With Card Visual & 6 Lines Graphic */}
                {(() => {
                  const selectedHex = HEXAGRAMS.find((h) => h.number === selectedBookHex.number) || HEXAGRAMS[0];
                  const cardImage = cardImages[selectedBookHex.number];
                  const cardVideo = cardVideos[selectedBookHex.number];

                  return (
                    <div
                      id="selected-hex-card"
                      className="border border-gold-800 bg-lacquer-950/40 p-4 sm:p-6 relative overflow-hidden transition-all"
                    >

                      {/* Top Bar with Prev / Next Fast Flipping Buttons */}
                      <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-gold-800 text-xs text-ivory-500 font-serif">
                        <button
                          type="button"
                          onClick={handlePrevHex}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-lacquer-800 hover:bg-lacquer-700 border border-gold-800 hover:border-gold-500 text-gold-300 hover:text-gold-200 transition-all cursor-pointer"
                        >
                          <ArrowLeft className="w-3.5 h-3.5 text-gold-500" />
                          <span>Quẻ Trước (#{selectedBookHexNum > 1 ? selectedBookHexNum - 1 : 64})</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rotate-45 bg-gold-500" />
                          <span className="font-mono text-xs text-gold-500 font-bold">
                            Quẻ {selectedBookHex.number} / 64
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={handleNextHex}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-lacquer-800 hover:bg-lacquer-700 border border-gold-800 hover:border-gold-500 text-gold-300 hover:text-gold-200 transition-all cursor-pointer"
                        >
                          <span>Quẻ Tiếp (#{selectedBookHexNum < 64 ? selectedBookHexNum + 1 : 1})</span>
                          <ArrowRight className="w-3.5 h-3.5 text-gold-500" />
                        </button>
                      </div>

                      {/* 2-Column Responsive Showcase: Hình quẻ bên trái, Thuyết minh bên phải */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* CỘT TRÁI: HÌNH LÁ BÀI KINH DỊCH & TƯỢNG QUẺ 6 HÀO */}
                        <div className="lg:col-span-5 xl:col-span-4 flex flex-col items-center gap-4 bg-lacquer-900 border border-gold-800 p-4 rounded-md shadow-inner">
                          {/* Card Visual với 3D Parallax & Click-to-Zoom */}
                          <div className="flex flex-col items-center w-full">
                            <CardVisual
                              hexagram={selectedHex}
                              imageUrl={cardImage}
                              videoUrl={cardVideo}
                              size="md"
                              enableParallax={true}
                              fitMode="cover"
                              onImageUpdated={onImageUpdated}
                              onVideoUpdated={onVideoUpdated}
                              className="shadow-2xl"
                            />
                            <div className="flex items-center justify-center gap-1.5 text-[11px] text-ivory-500 font-serif text-center mt-2.5">
                              <Sparkles className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                              <span>
                                {cardImage
                                  ? "Lá bài Kinh Dịch (Bấm vào hình để phóng to)"
                                  : "Hình đồ quẻ Kinh Dịch (Bấm vào hình để phóng to)"}
                              </span>
                            </div>
                          </div>

                          {/* Khối Tượng Quẻ 6 Hào (Hexagram Lines Diagram) */}
                          <div className="w-full bg-lacquer-800 border border-gold-800 rounded-sm p-3.5 space-y-2.5">
                            <div className="flex items-center justify-between text-xs border-b border-gold-800 pb-2">
                              <span className="font-serif font-bold text-gold-300 flex items-center gap-1.5">
                                <Layers className="w-3.5 h-3.5 text-gold-500" />
                                Tượng Quẻ 6 Hào
                              </span>
                              <span className="font-mono text-base text-gold-500 font-bold" title="Ký hiệu quẻ Dịch">
                                {selectedHex.symbol}
                              </span>
                            </div>

                            {/* Vẽ 6 hào Âm / Dương */}
                            <div className="py-1">
                              <HexagramVisual hexagram={selectedHex} size="sm" showLabels={true} />
                            </div>

                            {/* Ngoại quái / Nội quái */}
                            <div className="grid grid-cols-2 gap-2 text-[11px] font-serif pt-1.5 border-t border-lacquer-700">
                              <div className="bg-lacquer-800 p-1.5 rounded border border-gold-800 text-center">
                                <span className="text-ivory-500 block text-[9px] uppercase tracking-wider">
                                  Ngoại Quái (Thượng)
                                </span>
                                <span className="font-bold text-ivory-100">
                                  {selectedHex.upperTrigram}
                                </span>
                              </div>
                              <div className="bg-lacquer-800 p-1.5 rounded border border-gold-800 text-center">
                                <span className="text-ivory-500 block text-[9px] uppercase tracking-wider">
                                  Nội Quái (Hạ)
                                </span>
                                <span className="font-bold text-ivory-100">
                                  {selectedHex.lowerTrigram}
                                </span>
                              </div>
                            </div>

                            {/* Ngũ Hành */}
                            <div className="text-center text-[11px] font-serif px-1 pt-1 border-t border-lacquer-700 text-ivory-500">
                              Ngũ Hành: <strong className="text-gold-400">{selectedHex.element}</strong>
                            </div>
                          </div>
                        </div>

                        {/* CỘT PHẢI: NỘI DUNG SÁCH THUYẾT MINH CHUẨN */}
                        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
                          {/* Header info */}
                          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gold-800 pb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="px-2 py-0.5 rounded bg-lacquer-700 text-gold-500 font-mono text-xs font-bold border border-gold-800">
                                  Quẻ #{selectedBookHex.number}
                                </span>
                                <span className="px-2 py-0.5 rounded bg-lacquer-700 text-gold-400 font-serif text-xs font-bold border border-gold-800 flex items-center gap-1">
                                  <Compass className="w-3 h-3 text-gold-500" /> Cung {HEX_PALACE_NAME_MAP[selectedBookHex.number]}
                                </span>
                                <span className="text-xs text-ivory-500 font-serif">
                                  Cấu trúc: <strong className="text-gold-400">{selectedBookHex.structure}</strong>
                                </span>
                              </div>
                              <h4 className="text-xl md:text-2xl font-serif font-bold text-gold-200">
                                {selectedBookHex.name}
                              </h4>
                              <p className="text-xs font-serif text-gold-400 italic mt-0.5">
                                Hán tự: {selectedBookHex.hanzi}
                              </p>

                              {/* Audio Speak button for hexagram */}
                              <div className="mt-2">
                                <button
                                  type="button"
                                  onClick={() => handleToggleSpeakHexagram(selectedBookHex)}
                                  className={`px-3 py-1.5 rounded-sm border text-xs font-serif font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                                    isSpeaking && speechTitle.includes(`Quẻ #${selectedBookHex.number}`)
                                      ? "bg-[#3D1414] border-rose-600 text-rose-300 animate-pulse"
                                      : "bg-lacquer-700 hover:bg-lacquer-700 text-gold-300 border-gold-800 hover:border-gold-500"
                                  }`}
                                  title={isSpeaking && speechTitle.includes(`Quẻ #${selectedBookHex.number}`) ? "Dừng nghe thuyết minh" : "Nghe đọc toàn bộ thuyết minh quẻ này"}
                                >
                                  {isSpeaking && speechTitle.includes(`Quẻ #${selectedBookHex.number}`) ? (
                                    <>
                                      <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                                      <span>Dừng Nghe Thuyết Minh</span>
                                    </>
                                  ) : (
                                    <>
                                      <Volume2 className="w-3.5 h-3.5 text-gold-500" />
                                      <span>🔊 Nghe Thuyết Minh Quẻ #{selectedBookHex.number}</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* DÒNG CHỮ ĐỎ IN HOA TRÊN LÁ BÀI */}
                            <div className="bg-[#2A1012] border border-rose-900/60 rounded-sm px-4 py-2.5 text-center shadow-inner max-w-md">
                              <div className="text-[10px] uppercase font-mono tracking-wider text-rose-300/80 mb-0.5 flex items-center justify-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                Dòng chữ đỏ trên lá bài (Kim chỉ nam)
                              </div>
                              <div className="text-sm md:text-base font-bold text-rose-400 tracking-wide uppercase font-serif">
                                “{selectedBookHex.redHeadline}”
                              </div>
                            </div>
                          </div>

                          {/* Body Content from book */}
                          <div className="space-y-4 text-xs font-serif leading-relaxed text-ivory-300">
                            {/* Thơ Hán & Dịch thơ */}
                            <div className="bg-lacquer-900 border border-gold-800 p-3.5 rounded-sm">
                              <div className="text-[11px] font-mono uppercase tracking-wider text-gold-500 mb-1 font-bold">
                                Thơ Tượng & Dịch Nghĩa
                              </div>
                              <div className="whitespace-pre-line font-medium text-ivory-100 italic pl-2 border-l-2 border-gold-500">
                                {selectedBookHex.poemHan}
                              </div>
                              <div className="mt-2 text-ivory-300 pl-2">
                                {selectedBookHex.poemMeaning}
                              </div>
                            </div>

                            {!isVip ? (
                              <div className="royal-card p-5 sm:p-6 text-center space-y-3.5 overflow-hidden mt-2">
                                <div className="w-12 h-12 mx-auto rounded-md bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center text-lacquer-900 shadow-lg border border-gold-300">
                                  <Lock className="w-6 h-6 text-amber-950" />
                                </div>

                                <div className="space-y-1">
                                  <h5 className="text-base sm:text-lg font-serif font-bold text-gold-300">
                                    TOÀN VĂN THUYẾT MINH DÀNH CHO THÀNH VIÊN
                                  </h5>
                                  <p className="text-xs sm:text-sm text-ivory-300 font-serif max-w-lg mx-auto leading-relaxed">
                                    Chỉ <strong className="text-amber-300">Thành viên Cửu Nhị</strong> mới được quyền đọc toàn văn Thuyết Minh 64 Quẻ (Đại Tượng, Thời Vận, Tình Duyên, Thoán Từ, 6 Hào Từ Chu Dịch, Tượng Truyện Khổng Tử, Thần Quẻ Khổng Minh & nghe Audio Thuyết Minh).
                                  </p>
                                </div>

                                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                                  <button
                                    type="button"
                                    onClick={() => onOpenAuthModal && onOpenAuthModal("login")}
                                    className="px-4 py-2 rounded-sm bg-lacquer-700 hover:bg-gold-800 text-gold-300 font-serif font-bold text-xs border border-gold-800 transition-colors cursor-pointer"
                                  >
                                    Đăng Nhập
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => onOpenAuthModal && onOpenAuthModal("register")}
                                    className="royal-btn"
                                  >
                                    <Crown className="w-4 h-4 text-amber-950" />
                                    <span>ĐĂNG KÝ THÀNH VIÊN ĐỂ ĐỌC TOÀN VĂN ➔</span>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                {/* Đại tượng */}
                                <div className="bg-lacquer-900/60 p-3 rounded-sm border border-lacquer-700">
                              <div className="text-[11px] font-mono uppercase tracking-wider text-gold-500 mb-1 font-bold">
                                Đại Tượng
                              </div>
                              <p className="text-ivory-300">{selectedBookHex.bigImage}</p>
                            </div>

                            {/* Vận thế & Tình yêu */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                              <div className="bg-lacquer-800 p-3.5 rounded-sm border border-gold-800">
                                <div className="text-[11px] font-mono uppercase tracking-wider text-gold-500 mb-1 font-bold flex items-center gap-1.5">
                                  <Compass className="w-3.5 h-3.5" />
                                  Vận Thế (Thời Vận)
                                </div>
                                <p className="text-ivory-300">{selectedBookHex.destiny}</p>
                              </div>

                              <div className="bg-lacquer-800 p-3.5 rounded-sm border border-gold-800">
                                <div className="text-[11px] font-mono uppercase tracking-wider text-rose-400 mb-1 font-bold flex items-center gap-1.5">
                                  <Flame className="w-3.5 h-3.5" />
                                  Tình Yêu & Hôn Nhân
                                </div>
                                <p className="text-ivory-300">{selectedBookHex.love}</p>
                              </div>
                            </div>

                            {/* KINH DỊCH NGUYÊN BẢN & HÀO TỪ CỐT LÕI (MẪU CHUẨN TOÀN QUẺ & 6 HÀO) */}
                            <CanonicalHexagramCard
                              hexNumber={selectedBookHex.number}
                              onNavigateHex={(hexNum) => {
                                setSelectedBookHexNum(hexNum);
                                const el = document.getElementById("selected-hex-card");
                                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                              }}
                            />

                            {/* ĐẠI TƯỢNG TRUYỆN & TIỂU TƯỢNG TRUYỆN (KHỔNG TỬ - THẬP DỰC) */}
                            <XiangzhuanView hexNumber={selectedBookHex.number} />

                            {/* KHỔNG MINH THẦN QUẺ LIÊN KẾT 6 HÀO */}
                            <KhongMinhSingleHexView
                              kingWenNumber={selectedBookHex.number}
                              defaultExpanded={true}
                            />

                            {/* CÂU CHUYỆN KINH DỊCH CỦA QUẺ NÀY (TỰ QUÁI TRUYỆN) */}
                            {(() => {
                              const story = ICHING_STORIES[selectedBookHex.number];
                              if (!story) return null;
                              return (
                                <div className="bg-gradient-to-br from-lacquer-800 via-lacquer-900 to-lacquer-950 p-4 sm:p-5 rounded-md border border-gold-800 space-y-3.5 shadow-lg relative overflow-hidden">
                                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gold-800 pb-2.5">
                                    <div className="flex items-center gap-2 text-xs font-serif font-bold text-gold-400">
                                      <BookOpen className="w-4 h-4 text-gold-500" />
                                      <span>📖 Câu Chuyện Kinh Dịch Quẻ #{story.number}</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveSectionId("iching_story");
                                        const el = document.getElementById("thuyet-minh");
                                        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                                      }}
                                      className="text-[11px] font-serif text-gold-500 hover:underline flex items-center gap-1 cursor-pointer bg-lacquer-800 px-2.5 py-1 rounded-sm border border-gold-800"
                                    >
                                      <span>Đọc toàn bộ 64 câu chuyện</span>
                                      <ArrowRight className="w-3 h-3" />
                                    </button>
                                  </div>

                                  <div>
                                    <div className="text-[10px] font-mono text-gold-500 uppercase tracking-wider mb-0.5">
                                      {story.part === "upper" ? "Thượng Kinh (Đạo Trời Đất)" : "Hạ Kinh (Đạo Nhân Sinh)"} • Tự Quái Truyện
                                    </div>
                                    <h5 className="text-sm sm:text-base font-serif font-bold text-ivory-100">
                                      “{story.storyTitle}”
                                    </h5>
                                    <p className="text-[11px] font-serif text-ivory-500 italic mt-0.5">
                                      {story.context}
                                    </p>
                                  </div>

                                  <div className="bg-lacquer-900/90 p-3.5 rounded-sm border border-lacquer-700 text-xs font-serif leading-relaxed text-ivory-300 pl-3 border-l-2 border-gold-500">
                                    <p className="first-letter:text-xl first-letter:font-bold first-letter:text-gold-500 first-letter:mr-0.5">
                                      {story.story}
                                    </p>
                                  </div>

                                  {/* Mạch nối quẻ trước & quẻ sau - Nhấn vào đây để qua phần tiếp theo hoặc trở về phần trước */}
                                  {(() => {
                                    const prevNum = selectedBookHexNum > 1 ? selectedBookHexNum - 1 : 64;
                                    const nextNum = selectedBookHexNum < 64 ? selectedBookHexNum + 1 : 1;
                                    const prevHexObj = BOOK_HEXAGRAMS.find((h) => h.number === prevNum);
                                    const nextHexObj = BOOK_HEXAGRAMS.find((h) => h.number === nextNum);

                                    return (
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-[11px] font-serif">
                                        {/* Box Quẻ Trước */}
                                        <button
                                          type="button"
                                          onClick={handlePrevHex}
                                          className="bg-lacquer-900 hover:bg-lacquer-800 p-3 rounded-sm border border-lacquer-700 hover:border-gold-500 text-left transition-all cursor-pointer group shadow-md hover:shadow-xl active:scale-[0.99] flex flex-col justify-between relative overflow-hidden"
                                          title={`Nhấn vào đây để trở về Quẻ trước #${prevNum}: ${prevHexObj?.name || ""}`}
                                        >
                                          <div className="space-y-1.5 w-full">
                                            <div className="flex items-center justify-between gap-1 pb-1.5 border-b border-gold-800 group-hover:border-gold-800">
                                              <span className="text-gold-500 group-hover:text-ivory-100 font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                                                <ArrowLeft className="w-3.5 h-3.5 text-gold-500 group-hover:-translate-x-1 transition-transform" />
                                                ← TIỀN ĐỀ TỪ QUẺ TRƯỚC:
                                              </span>
                                              <span className="text-[10px] font-mono text-gold-500 bg-lacquer-800 px-2 py-0.5 rounded border border-gold-800 group-hover:bg-gold-500 group-hover:text-lacquer-950 font-bold transition-all shrink-0">
                                                ← Quẻ #{prevNum}
                                              </span>
                                            </div>
                                            <p className="text-ivory-300 group-hover:text-ivory-100 transition-colors leading-relaxed">
                                              {story.connectionPrev}
                                            </p>
                                          </div>
                                          <div className="mt-2.5 pt-1.5 border-t border-lacquer-700 group-hover:border-gold-800 flex items-center justify-between text-[10px] text-ivory-500 group-hover:text-gold-500 font-sans">
                                            <span className="flex items-center gap-1">
                                              <span className="text-gold-500">👈</span> <strong>Nhấn vào đây để trở về phần trước</strong> (#{prevNum}: {prevHexObj?.name})
                                            </span>
                                            <span className="font-mono text-[9px] text-ivory-500 group-hover:text-gold-500 underline decoration-dotted">Quẻ trước</span>
                                          </div>
                                        </button>

                                        {/* Box Quẻ Sau */}
                                        <button
                                          type="button"
                                          onClick={handleNextHex}
                                          className="bg-lacquer-900 hover:bg-lacquer-800 p-3 rounded-sm border border-lacquer-700 hover:border-gold-500 text-left transition-all cursor-pointer group shadow-md hover:shadow-xl active:scale-[0.99] flex flex-col justify-between relative overflow-hidden"
                                          title={`Nhấn vào đây để qua Quẻ tiếp theo #${nextNum}: ${nextHexObj?.name || ""}`}
                                        >
                                          <div className="space-y-1.5 w-full">
                                            <div className="flex items-center justify-between gap-1 pb-1.5 border-b border-gold-800 group-hover:border-gold-800">
                                              <span className="text-gold-500 group-hover:text-ivory-100 font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                                                <ArrowRight className="w-3.5 h-3.5 text-gold-500 group-hover:translate-x-1 transition-transform order-last sm:order-first" />
                                                → CẦU NỐI SANG QUẺ SAU:
                                              </span>
                                              <span className="text-[10px] font-mono text-gold-500 bg-lacquer-800 px-2 py-0.5 rounded border border-gold-800 group-hover:bg-gold-500 group-hover:text-lacquer-950 font-bold transition-all shrink-0">
                                                Quẻ #{nextNum} →
                                              </span>
                                            </div>
                                            <p className="text-ivory-300 group-hover:text-ivory-100 transition-colors leading-relaxed">
                                              {story.connectionNext}
                                            </p>
                                          </div>
                                          <div className="mt-2.5 pt-1.5 border-t border-lacquer-700 group-hover:border-gold-800 flex items-center justify-between text-[10px] text-ivory-500 group-hover:text-gold-500 font-sans">
                                            <span className="font-mono text-[9px] text-ivory-500 group-hover:text-gold-500 underline decoration-dotted">Quẻ tiếp</span>
                                            <span className="flex items-center gap-1">
                                              <strong>Nhấn vào đây để qua phần tiếp theo</strong> (#{nextNum}: {nextHexObj?.name}) <span className="text-gold-500">👉</span>
                                            </span>
                                          </div>
                                        </button>
                                      </div>
                                    );
                                  })()}

                                  {/* Bài học nhân sinh */}
                                  <div className="bg-gradient-to-r from-lacquer-800 to-lacquer-900 p-3 rounded-sm border border-gold-800 flex items-start gap-2.5">
                                    <Sparkles className="w-4 h-4 text-gold-500" />
                                    <div className="text-xs font-serif text-ivory-100">
                                      <strong className="text-gold-500">Bài học nhân sinh: </strong>
                                      {story.moral}
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}
                          </>
                        )}
                      </div>

                          {/* Actions */}
                          <div className="mt-5 pt-4 border-t border-gold-800 flex flex-wrap items-center justify-between gap-3">
                            <span className="text-[11px] text-ivory-500 italic">
                              Trích từ trang {selectedBookHex.number + 33} của Sách Thuyết Minh Tarot Kinh Dịch
                            </span>

                            <div className="flex flex-wrap items-center gap-2">
                              {/* Audio Speak button */}
                              <button
                                type="button"
                                onClick={() => handleToggleSpeakHexagram(selectedBookHex)}
                                className={`px-3 py-1.5 rounded-sm border text-xs font-serif font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                                  isSpeaking && speechTitle.includes(`Quẻ #${selectedBookHex.number}`)
                                    ? "bg-[#3D1414] border-rose-600 text-rose-300 animate-pulse"
                                    : "bg-lacquer-800 hover:bg-lacquer-700 border-gold-800 text-gold-300"
                                }`}
                              >
                                {isSpeaking && speechTitle.includes(`Quẻ #${selectedBookHex.number}`) ? (
                                  <>
                                    <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                                    <span>Dừng Nghe Thuyết Minh</span>
                                  </>
                                ) : (
                                  <>
                                    <Volume2 className="w-3.5 h-3.5 text-gold-500" />
                                    <span>Nghe Thuyết Minh Quẻ</span>
                                  </>
                                )}
                              </button>

                              {/* Button to open Detailed Interpretation tab */}
                              {onOpenDetailTab && (
                                <button
                                  type="button"
                                  onClick={() => onOpenDetailTab(selectedBookHex.number)}
                                  className="royal-btn !px-3.5 !py-1.5 !text-[11px]"
                                  title="Xem hào động, hào từ và quẻ biến trong tab Luận Giải Chi Tiết"
                                >
                                  <Sparkles className="w-3.5 h-3.5" />
                                  <span>Xem Luận Giải Chi Tiết (6 Hào & Quẻ Biến) →</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Bottom Chapter Flip Navigation Footer */}
            <div className="mt-8 pt-5 border-t border-lacquer-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-serif">
              {prevSection ? (
                <button
                  type="button"
                  onClick={handlePrevSection}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-sm bg-lacquer-800 hover:bg-lacquer-700 border border-gold-800 hover:border-gold-500 text-ivory-300 hover:text-gold-200 flex items-center justify-center sm:justify-start gap-2.5 transition-all cursor-pointer shadow-sm group"
                  title="Nhấn vào đây để trở về phần trước"
                >
                  <ArrowLeft className="w-4 h-4 text-gold-500 shrink-0 group-hover:-translate-x-0.5 transition-transform" />
                  <div className="text-left">
                    <span className="text-[10px] text-gold-500 block font-mono font-bold">👈 NHẤN VÀO ĐÂY ĐỂ TRỞ VỀ PHẦN TRƯỚC</span>
                    <span className="font-bold text-xs truncate max-w-[240px] block text-ivory-300">{prevSection.title}</span>
                  </div>
                </button>
              ) : (
                <div />
              )}

              {nextSection && (
                <button
                  type="button"
                  onClick={handleNextSection}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-sm bg-lacquer-800 hover:bg-lacquer-700 border border-gold-800 hover:border-gold-500 text-ivory-300 hover:text-gold-200 flex items-center justify-center sm:justify-end gap-2.5 transition-all cursor-pointer shadow-sm group ml-auto"
                  title="Nhấn vào đây để qua phần tiếp theo"
                >
                  <div className="text-right">
                    <span className="text-[10px] text-gold-500 block font-mono font-bold">NHẤN VÀO ĐÂY ĐỂ QUA PHẦN TIẾP THEO 👉</span>
                    <span className="font-bold text-xs truncate max-w-[240px] block text-ivory-300">{nextSection.title}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gold-500 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper to render bold markdown (**text**) and italics (*text*) safely
function formatTextInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="text-ivory-100 font-bold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={i} className="text-ivory-300 italic">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="px-1 py-0.5 rounded bg-lacquer-700 text-gold-500 font-mono text-[11px]">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

