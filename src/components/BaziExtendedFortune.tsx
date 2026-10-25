import React, { useState, useEffect, useMemo } from "react";
import {
  Sparkles,
  Compass,
  Clock,
  RotateCcw,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Info,
  Save,
  Bookmark,
  BookmarkCheck,
  User,
  Heart,
  Trash2,
  Share2,
  ArrowRight,
  ArrowDown,
  ArrowLeftRight,
  Shield,
  Star,
  Flame,
  Layers,
  Scale,
  ChevronRight,
  Eye,
  X,
  Briefcase,
  AlertTriangle,
  FileDown,
  FileUp,
  RotateCw,
  Plus,
  Camera,
  Download,
  Loader2,
} from "lucide-react";
import { SIXTY_JIAZI, JiaziEnrichedEntry } from "../data/jiazi";
import { BaziKetCauThien, KetCauSettings } from "./BaziKetCauThien";
import { BaziKetCauVanThien, KetCauVanSettings } from "./BaziKetCauVanThien";
import { BaziGiaCauThien, GiaCauSettings } from "./BaziGiaCauThien";
import { BaziHanhViThien, HanhViSettings } from "./BaziHanhViThien";
import { BaziThucThiThien, ThucThiSettings } from "./BaziThucThiThien";
import { captureElementToPng, downloadDataUrlAsPng } from "../utils/captureHelper";
import { ExportImageModal } from "./ExportImageModal";

export interface ThienSettings {
  giaCau?: GiaCauSettings;
  ketCau?: KetCauSettings;
  ketCauVan?: KetCauVanSettings;
  hanhVi?: HanhViSettings;
  thucThi?: ThucThiSettings;
}
import {
  CAN_LIST,
  CHI_LIST,
  CAN_MAP,
  CHI_MAP,
  DUONG_CAN_NAMES,
  AM_CAN_NAMES,
  DUONG_CHI_NAMES,
  AM_CHI_NAMES,
  PillarItem,
  PILLAR_LABELS,
} from "../data/baziConstants";
import { getCurrentBaziPillars } from "./JiaziEightPillars";
import { getKhongVongInfo } from "./JiaziD12Dice";

// ============================================================================
// ĐỊNH NGHĨA THẬP THẦN & NGŨ HÀNH
// ============================================================================

export interface TenGodInfo {
  name: string;
  chinese: string;
  code: string;
  color: string;
  badgeBg: string;
  desc: string;
  aspect: string;
}

const CAN_ELEMENT_MAP: Record<string, { element: "Mộc" | "Hỏa" | "Thổ" | "Kim" | "Thủy"; polarity: "duong" | "am" }> = {
  Giáp: { element: "Mộc", polarity: "duong" },
  Ất: { element: "Mộc", polarity: "am" },
  Bính: { element: "Hỏa", polarity: "duong" },
  Đinh: { element: "Hỏa", polarity: "am" },
  Mậu: { element: "Thổ", polarity: "duong" },
  Kỷ: { element: "Thổ", polarity: "am" },
  Canh: { element: "Kim", polarity: "duong" },
  Tân: { element: "Kim", polarity: "am" },
  Nhâm: { element: "Thủy", polarity: "duong" },
  Quý: { element: "Thủy", polarity: "am" },
};

/**
 * Tính Thập Thần của một Thiên Can so với Nhật Can (Day Master)
 */
export function getTenGod(targetCan: string, dayCan: string): TenGodInfo {
  const d = CAN_ELEMENT_MAP[dayCan];
  const t = CAN_ELEMENT_MAP[targetCan];
  if (!d || !t) {
    return {
      name: "Nhật Chủ",
      chinese: "日主",
      code: "NC",
      color: "text-[#C9A55A]",
      badgeBg: "bg-[#332211] text-[#D6B97A] border-[#5E4327]",
      desc: "Bản thân, bản mệnh trung tâm của toàn bộ lá số",
      aspect: "Bản Mệnh",
    };
  }

  const isSamePolarity = d.polarity === t.polarity;

  // 1. Cùng ngũ hành
  if (t.element === d.element) {
    if (isSamePolarity) {
      return {
        name: "Tỷ Kiên",
        chinese: "比肩",
        code: "Tỷ",
        color: "text-emerald-400",
        badgeBg: "bg-emerald-950/70 text-emerald-300 border-emerald-800/60",
        desc: "Bạn bè, anh em, đồng chí, tính độc lập, tự chủ kiên định",
        aspect: "Huynh Đệ / Tự Lập",
      };
    } else {
      return {
        name: "Kiếp Tài",
        chinese: "劫財",
        code: "Kiếp",
        color: "text-emerald-300",
        badgeBg: "bg-teal-950/70 text-teal-300 border-teal-800/60",
        desc: "Cạnh tranh, hao tán tài vật, dám nghĩ dám làm, quyết đoán mạo hiểm",
        aspect: "Cạnh Tranh / Đầu Tư",
      };
    }
  }

  // 2. Nhật Can sinh Target
  const isDayProducesTarget =
    (d.element === "Mộc" && t.element === "Hỏa") ||
    (d.element === "Hỏa" && t.element === "Thổ") ||
    (d.element === "Thổ" && t.element === "Kim") ||
    (d.element === "Kim" && t.element === "Thủy") ||
    (d.element === "Thủy" && t.element === "Mộc");

  if (isDayProducesTarget) {
    if (isSamePolarity) {
      return {
        name: "Thực Thần",
        chinese: "食神",
        code: "Thực",
        color: "text-amber-400",
        badgeBg: "bg-amber-950/70 text-amber-300 border-amber-800/60",
        desc: "Phúc lộc tự nhiên, hưởng thụ, khiếu thẩm mỹ, khoan dung đôn hậu",
        aspect: "Phúc Thọ / Nghệ Thuật",
      };
    } else {
      return {
        name: "Thương Quan",
        chinese: "傷官",
        code: "Thương",
        color: "text-orange-400",
        badgeBg: "bg-orange-950/70 text-orange-300 border-orange-800/60",
        desc: "Tài hoa xuất chúng, tư duy đột phá, bất phục quyền uy, sắc sảo",
        aspect: "Tài Năng / Đột Phá",
      };
    }
  }

  // 3. Nhật Can khắc Target
  const isDayConquersTarget =
    (d.element === "Mộc" && t.element === "Thổ") ||
    (d.element === "Hỏa" && t.element === "Kim") ||
    (d.element === "Thổ" && t.element === "Thủy") ||
    (d.element === "Kim" && t.element === "Mộc") ||
    (d.element === "Thủy" && t.element === "Hỏa");

  if (isDayConquersTarget) {
    if (isSamePolarity) {
      return {
        name: "Thiên Tài",
        chinese: "偏財",
        code: "TTài",
        color: "text-yellow-400",
        badgeBg: "bg-yellow-950/70 text-yellow-300 border-yellow-800/60",
        desc: "Tiền tài bất ngờ, cơ hội kinh doanh, nhạy bén tài chính, quảng giao",
        aspect: "Tài Lộc / Kinh Doanh",
      };
    } else {
      return {
        name: "Chính Tài",
        chinese: "正財",
        code: "CTài",
        color: "text-yellow-300",
        badgeBg: "bg-amber-900/60 text-yellow-200 border-amber-700/60",
        desc: "Tài sản ổn định, cần cù tích lũy, người vợ hiền lương, quản lý chắc chắn",
        aspect: "Tài Chính / Gia Sản",
      };
    }
  }

  // 4. Target khắc Nhật Can
  const isTargetConquersDay =
    (t.element === "Mộc" && d.element === "Thổ") ||
    (t.element === "Hỏa" && d.element === "Kim") ||
    (t.element === "Thổ" && d.element === "Thủy") ||
    (t.element === "Kim" && d.element === "Mộc") ||
    (t.element === "Thủy" && d.element === "Hỏa");

  if (isTargetConquersDay) {
    if (isSamePolarity) {
      return {
        name: "Thất Sát",
        chinese: "七殺",
        code: "Sát",
        color: "text-rose-400",
        badgeBg: "bg-rose-950/70 text-rose-300 border-rose-800/60",
        desc: "Quyền uy, kỷ luật thép, đương đầu sóng gió, bản lĩnh lãnh đạo",
        aspect: "Quyền Lực / Thử Thách",
      };
    } else {
      return {
        name: "Chính Quan",
        chinese: "正官",
        code: "Quan",
        color: "text-blue-400",
        badgeBg: "bg-blue-950/70 text-blue-300 border-blue-800/60",
        desc: "Danh tiếng, chức vị, chính trực công minh, khuôn phép mẫu mực",
        aspect: "Công Danh / Địa Vị",
      };
    }
  }

  // 5. Target sinh Nhật Can
  if (isSamePolarity) {
    return {
      name: "Thiên Ấn",
      chinese: "偏印",
      code: "TẤn",
      color: "text-purple-400",
      badgeBg: "bg-purple-950/70 text-purple-300 border-purple-800/60",
      desc: "Trực giác linh hoạt, nghiên cứu chuyên sâu, huyền học y thuật, kỳ tài",
      aspect: "Trí Tuệ / Huyền Học",
    };
  } else {
    return {
      name: "Chính Ấn",
      chinese: "正印",
      code: "CẤn",
      color: "text-indigo-400",
      badgeBg: "bg-indigo-950/70 text-indigo-300 border-indigo-800/60",
      desc: "Học thức uyên bác, quý nhân che chở, từ bi nhân hậu, danh giá gia phong",
      aspect: "Học Vấn / Quý Nhân",
    };
  }
}

// Tàng can (Hidden Stems trong 12 Địa Chi)
export const HIDDEN_STEMS_MAP: Record<string, { can: string; role: "chính" | "trung" | "dư"; percent: number }[]> = {
  Tý: [{ can: "Quý", role: "chính", percent: 100 }],
  Sửu: [
    { can: "Kỷ", role: "chính", percent: 60 },
    { can: "Quý", role: "trung", percent: 30 },
    { can: "Tân", role: "dư", percent: 10 },
  ],
  Dần: [
    { can: "Giáp", role: "chính", percent: 60 },
    { can: "Bính", role: "trung", percent: 30 },
    { can: "Mậu", role: "dư", percent: 10 },
  ],
  Mão: [{ can: "Ất", role: "chính", percent: 100 }],
  Thìn: [
    { can: "Mậu", role: "chính", percent: 60 },
    { can: "Ất", role: "trung", percent: 30 },
    { can: "Quý", role: "dư", percent: 10 },
  ],
  Tỵ: [
    { can: "Bính", role: "chính", percent: 60 },
    { can: "Mậu", role: "trung", percent: 30 },
    { can: "Canh", role: "dư", percent: 10 },
  ],
  Ngọ: [
    { can: "Đinh", role: "chính", percent: 70 },
    { can: "Kỷ", role: "trung", percent: 30 },
  ],
  Mùi: [
    { can: "Kỷ", role: "chính", percent: 60 },
    { can: "Đinh", role: "trung", percent: 30 },
    { can: "Ất", role: "dư", percent: 10 },
  ],
  Thân: [
    { can: "Canh", role: "chính", percent: 60 },
    { can: "Nhâm", role: "trung", percent: 30 },
    { can: "Mậu", role: "dư", percent: 10 },
  ],
  Dậu: [{ can: "Tân", role: "chính", percent: 100 }],
  Tuất: [
    { can: "Mậu", role: "chính", percent: 60 },
    { can: "Tân", role: "trung", percent: 30 },
    { can: "Đinh", role: "dư", percent: 10 },
  ],
  Hợi: [
    { can: "Nhâm", role: "chính", percent: 70 },
    { can: "Giáp", role: "trung", percent: 30 },
  ],
};

// Vòng 12 Cung Trường Sinh
const TRUONG_SINH_ORDER = [
  "Trường Sinh",
  "Mộc Dục",
  "Quan Đới",
  "Lâm Quan",
  "Đế Vượng",
  "Suy",
  "Bệnh",
  "Tử",
  "Mộ",
  "Tuyệt",
  "Thai",
  "Dưỡng",
];

const TRUONG_SINH_START: Record<string, { startBranch: string; isForward: boolean }> = {
  Giáp: { startBranch: "Hợi", isForward: true },
  Ất: { startBranch: "Ngọ", isForward: false },
  Bính: { startBranch: "Dần", isForward: true },
  Mậu: { startBranch: "Dần", isForward: true },
  Đinh: { startBranch: "Dậu", isForward: false },
  Kỷ: { startBranch: "Dậu", isForward: false },
  Canh: { startBranch: "Tỵ", isForward: true },
  Tân: { startBranch: "Tý", isForward: false },
  Nhâm: { startBranch: "Thân", isForward: true },
  Quý: { startBranch: "Mão", isForward: false },
};

const BRANCH_NAMES_LIST = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];

export function getTruongSinhStage(dayCan: string, targetChi: string): string {
  const rule = TRUONG_SINH_START[dayCan];
  if (!rule) return "Trường Sinh";
  const startIdx = BRANCH_NAMES_LIST.indexOf(rule.startBranch);
  const targetIdx = BRANCH_NAMES_LIST.indexOf(targetChi);
  if (startIdx === -1 || targetIdx === -1) return "Trường Sinh";

  let step = targetIdx - startIdx;
  if (!rule.isForward) {
    step = startIdx - targetIdx;
  }
  step = ((step % 12) + 12) % 12;
  return TRUONG_SINH_ORDER[step];
}

// Tương tác Địa Chi
export function checkBranchInteractions(chiA: string, chiB: string): string[] {
  const tags: string[] = [];
  const lucHopPairs: [string, string, string][] = [
    ["Tý", "Sửu", "Hợp Thổ"],
    ["Dần", "Hợi", "Hợp Mộc"],
    ["Mão", "Tuất", "Hợp Hỏa"],
    ["Thìn", "Dậu", "Hợp Kim"],
    ["Tỵ", "Thân", "Hợp Thủy"],
    ["Ngọ", "Mùi", "Hợp Nhật Nguyệt"],
  ];
  for (const [a, b, label] of lucHopPairs) {
    if ((chiA === a && chiB === b) || (chiA === b && chiB === a)) {
      tags.push(`Lục Hợp (${label})`);
    }
  }

  const lucXungPairs: [string, string][] = [
    ["Tý", "Ngọ"],
    ["Sửu", "Mùi"],
    ["Dần", "Thân"],
    ["Mão", "Dậu"],
    ["Thìn", "Tuất"],
    ["Tỵ", "Hợi"],
  ];
  for (const [a, b] of lucXungPairs) {
    if ((chiA === a && chiB === b) || (chiA === b && chiB === a)) {
      tags.push("Tương Xung");
    }
  }

  const tuongHaiPairs: [string, string][] = [
    ["Tý", "Mùi"],
    ["Sửu", "Ngọ"],
    ["Dần", "Tỵ"],
    ["Mão", "Thìn"],
    ["Thân", "Hợi"],
    ["Dậu", "Tuất"],
  ];
  for (const [a, b] of tuongHaiPairs) {
    if ((chiA === a && chiB === b) || (chiA === b && chiB === a)) {
      tags.push("Tương Hại");
    }
  }

  if (chiA === chiB && ["Thìn", "Ngọ", "Dậu", "Hợi"].includes(chiA)) {
    tags.push("Tự Hình");
  }

  return tags;
}

// Helper tính năm sinh từ Trụ Năm
function getBirthYearFromYearPillar(yearCan: string, yearChi: string, referenceYear = 2026): number {
  const canIdx = CAN_LIST.findIndex((c) => c.name === yearCan);
  const chiIdx = CHI_LIST.findIndex((c) => c.name === yearChi);
  if (canIdx === -1 || chiIdx === -1) return referenceYear - 34;

  for (let age = 0; age < 120; age++) {
    const y = referenceYear - age;
    if (((y - 4) % 10 + 10) % 10 === canIdx && ((y - 4) % 12 + 12) % 12 === chiIdx) {
      return y;
    }
  }
  return referenceYear - 34;
}

// Hồ sơ lưu trữ Bát Tự
export interface SavedBaziProfile {
  id: string;
  title: string;
  fullName?: string;
  gender: "nam" | "nu";
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number;
  birthMinute: number;
  pillars: [PillarItem, PillarItem, PillarItem, PillarItem];
  startAge: number;
  notes?: string;
  savedAt: string;
  timestamp: number;
  thienSettings?: ThienSettings;
}

const STORAGE_KEY_PROFILES = "iching_saved_bazi_profiles_v1";
const STORAGE_KEY_EXTENDED_OPEN = "iching_bazi_fortune_chart_open";

// ============================================================================
// COMPONENT CHÍNH: BaziExtendedFortune
// ============================================================================

export interface BaziExtendedFortuneProps {
  onSelectJiazi?: (id: string) => void;
  cardImages?: Record<number, string>;
  className?: string;
  defaultExpanded?: boolean;
}

export const BaziExtendedFortune: React.FC<BaziExtendedFortuneProps> = ({
  onSelectJiazi,
  cardImages = {},
  className = "",
  defaultExpanded = false,
}) => {
  // Trạng thái thu gọn / mở rộng
  const [isOpen, setIsOpen] = useState<boolean>(defaultExpanded);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_EXTENDED_OPEN, String(isOpen));
    } catch {
      // ignore
    }
  }, [isOpen]);

  // Giới tính: Nam (Càn tạo) / Nữ (Khôn tạo)
  const [gender, setGender] = useState<"nam" | "nu">(() => {
    try {
      const saved = localStorage.getItem("iching_bazi_gender");
      return (saved as "nam" | "nu") || "nam";
    } catch {
      return "nam";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("iching_bazi_gender", gender);
    } catch {
      // ignore
    }
  }, [gender]);

  // 4 Trụ Can Chi: MẶC ĐỊNH LÀ TRẠNG THÁI TRỐNG CHƯA CÓ ĐIỀN KHI VÀO PHẦN HOA GIÁP
  const [pillars, setPillars] = useState<[PillarItem, PillarItem, PillarItem, PillarItem]>(() => [
    { can: "", chi: "" },
    { can: "", chi: "" },
    { can: "", chi: "" },
    { can: "", chi: "" },
  ]);

  useEffect(() => {
    try {
      localStorage.setItem("iching_bazi_custom_pillars_v1", JSON.stringify(pillars));
    } catch {
      // ignore
    }
  }, [pillars]);

  // Lắng nghe sự kiện đồng bộ từ Bảng 8 Ô bên dưới hoặc các thao tác khác
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<[PillarItem, PillarItem, PillarItem, PillarItem]>;
      if (customEvent.detail && Array.isArray(customEvent.detail) && customEvent.detail.length === 4) {
        timer = setTimeout(() => {
          setPillars(customEvent.detail);
        }, 0);
      }
    };
    window.addEventListener("sync-bazi-pillars", handleSync);
    return () => {
      window.removeEventListener("sync-bazi-pillars", handleSync);
      clearTimeout(timer);
    };
  }, []);

  // Tuổi khởi vận (Khởi Vận: 1 - 10 tuổi, mặc định 4 tuổi)
  const [startAge, setStartAge] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("iching_bazi_start_age");
      return saved ? parseInt(saved, 10) : 4;
    } catch {
      return 4;
    }
  });

  // Năm sinh ước tính để tính khoảng năm đại vận
  const now = new Date();
  const [birthYear, setBirthYear] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("iching_bazi_birth_year");
      return saved ? parseInt(saved, 10) : 1990;
    } catch {
      return 1990;
    }
  });

  // Năm muốn xem (Mặc định năm hiện tại 2026)
  const [viewYear, setViewYear] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("iching_bazi_view_year");
      return saved ? parseInt(saved, 10) : now.getFullYear();
    } catch {
      return now.getFullYear();
    }
  });

  // Thứ tự sắp xếp Đại Vận và Lưu Niên từ trái qua phải: Mặc định ngược lại (10 ➔ 1) theo yêu cầu
  const [isReversedOrder, setIsReversedOrder] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("iching_bazi_reversed_order");
      return saved !== null ? saved === "true" : true;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("iching_bazi_start_age", String(startAge));
      localStorage.setItem("iching_bazi_birth_year", String(birthYear));
      localStorage.setItem("iching_bazi_view_year", String(viewYear));
      localStorage.setItem("iching_bazi_reversed_order", String(isReversedOrder));
    } catch {
      // ignore
    }
  }, [startAge, birthYear, viewYear, isReversedOrder]);

  // Tự động suy ra năm sinh từ Trụ Năm khi đổi Trụ Năm
  useEffect(() => {
    if (pillars[3]?.can && pillars[3]?.chi) {
      const derived = getBirthYearFromYearPillar(pillars[3].can, pillars[3].chi, viewYear);
      setBirthYear(derived);
    }
  }, [pillars[3]?.can, pillars[3]?.chi]);

  // Modal active selector cho ô Can hoặc Chi được nhấp (giống y chang bảng dưới)
  const [activeSlot, setActiveSlot] = useState<{
    colIndex: number;
    type: "can" | "chi";
  } | null>(null);

  // Thông báo quy luật âm dương khi người dùng nhấp
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!noticeMessage) return;
    const timer = setTimeout(() => setNoticeMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [noticeMessage]);

  // Đại vận được chọn làm tiêu điểm để xem 10 năm Lưu Niên
  const [selectedDaiVanIdx, setSelectedDaiVanIdx] = useState<number | null>(null);
  const currentRealYear = now.getFullYear();
  const [selectedLuuNienYear, setSelectedLuuNienYear] = useState<number>(currentRealYear);

  // Modal Lưu Bát Tự & Modal Lịch Sử Lá Số
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [saveTitle, setSaveTitle] = useState<string>("");
  const [saveFullName, setSaveFullName] = useState<string>("");
  const [saveNotes, setSaveNotes] = useState<string>("");

  // Quản lý hồ sơ hiện tại và chế độ ghi đè
  const [currentLoadedProfileId, setCurrentLoadedProfileId] = useState<string | null>(null);
  const [saveMode, setSaveMode] = useState<"create_new" | "overwrite">("create_new");
  const [overwriteTargetId, setOverwriteTargetId] = useState<string | null>(null);
  const [deletingProfileId, setDeletingProfileId] = useState<string | null>(null);
  const [overwritingProfileId, setOverwritingProfileId] = useState<string | null>(null);
  const [isClearingAllProfiles, setIsClearingAllProfiles] = useState<boolean>(false);

  // Dữ liệu thiết lập của 4 Thiên: Gia Cấu, Kết Cấu, Hành Vi, Thực Thi
  const [thienSettings, setThienSettings] = useState<ThienSettings>({});
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Refs chụp hình
  const fullBaziContainerRef = React.useRef<HTMLDivElement>(null);
  const onlyBaziContainerRef = React.useRef<HTMLDivElement>(null);
  const giaCauContainerRef = React.useRef<HTMLDivElement>(null);
  const ketCauContainerRef = React.useRef<HTMLDivElement>(null);
  const ketCauVanContainerRef = React.useRef<HTMLDivElement>(null);
  const hanhViContainerRef = React.useRef<HTMLDivElement>(null);
  const thucThiContainerRef = React.useRef<HTMLDivElement>(null);

  // Trạng thái modal xuất hình ảnh
  const [captureDropdownOpen, setCaptureDropdownOpen] = useState<boolean>(false);
  const [isCapturingTarget, setIsCapturingTarget] = useState<
    "full" | "only" | "giaCau" | "ketCau" | "ketCauVan" | "hanhVi" | "thucThi" | null
  >(null);
  const [exportedImageUrl, setExportedImageUrl] = useState<string | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState<boolean>(false);
  const [exportModalTitle, setExportModalTitle] = useState<string>("");
  const [exportModalFilename, setExportModalFilename] = useState<string>("");

  const handleCaptureElement = async (
    targetRef: React.RefObject<HTMLElement | null>,
    title: string,
    filename: string,
    targetKey: "full" | "only" | "giaCau" | "ketCau" | "ketCauVan" | "hanhVi" | "thucThi",
    isDirectDownload: boolean = false
  ) => {
    if (isCapturingTarget) return;
    try {
      setIsCapturingTarget(targetKey);

      // Đảm bảo mở rộng bảng Bát Tự trước để vùng cần chụp (khối 8 ô hoặc các Thiên) được render vào DOM
      if (!isOpen) {
        setIsOpen(true);
        await new Promise((resolve) => setTimeout(resolve, 320));
      }

      // Nếu chụp riêng một Thiên mà Thiên đó đang thu gọn thì tự động mở ra
      if (["giaCau", "ketCau", "ketCauVan", "hanhVi", "thucThi"].includes(targetKey)) {
        const key = targetKey as keyof ThienSettings;
        if (!thienSettings[key]?.isOpen) {
          setThienSettings((prev) => ({
            ...prev,
            [key]: { ...prev[key], isOpen: true },
          }));
          await new Promise((resolve) => setTimeout(resolve, 320));
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 200));
      let targetEl = targetRef.current;
      if (!targetEl) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        targetEl = targetRef.current;
      }

      if (!targetEl) {
        setNoticeMessage("Không tìm thấy vùng cần chụp ảnh. Vui lòng mở rộng trước!");
        return;
      }

      const dataUrl = await captureElementToPng(targetEl, {
        backgroundColor: "#140E08",
        pixelRatio: 2,
      });

      if (!dataUrl || dataUrl === "data:," || dataUrl.length < 100) {
        throw new Error("Dữ liệu ảnh rỗng");
      }

      setExportedImageUrl(dataUrl);
      setExportModalTitle(title);
      setExportModalFilename(filename);

      if (isDirectDownload) {
        downloadDataUrlAsPng(dataUrl, filename);
        setNoticeMessage(`Đã chụp và tải ảnh về máy thành công: ${title}!`);
      } else {
        setExportModalOpen(true);
        setNoticeMessage(`Đã chụp ảnh thành công: ${title}!`);
      }
    } catch (err) {
      console.error("Capture error:", err);
      setNoticeMessage("Không thể xuất ảnh lúc này. Vui lòng thử lại!");
    } finally {
      setIsCapturingTarget(null);
    }
  };

  const [savedProfiles, setSavedProfiles] = useState<SavedBaziProfile[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PROFILES);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return [];
  });

  const saveProfilesToStorage = (list: SavedBaziProfile[]) => {
    setSavedProfiles(list);
    try {
      localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(list));
    } catch {
      // ignore
    }
  };

  /**
   * Lấy Ngày Giờ Hiện Tại cho Bát Tự (theo đúng chuẩn thiên văn thực tế)
   */
  const handleCurrentDateTime = () => {
    const curr = getCurrentBaziPillars();
    setPillars(curr);
    const realYear = new Date().getFullYear();
    setBirthYear(realYear);
    // Đồng bộ xuống Bảng 8 Ô bên dưới
    try {
      localStorage.setItem("iching_jiazi_eight_pillars_v3", JSON.stringify(curr));
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("sync-bazi-pillars", { detail: curr }));
      }, 0);
    } catch {
      // ignore
    }
    setNoticeMessage("Đã nạp chính xác Bát Tự (Giờ • Ngày • Tháng • Năm) theo ngày giờ hiện tại!");
  };

  /**
   * Reset 8 ô Can Chi (về trạng thái trống chưa có điền)
   */
  const handleReset = () => {
    const empty: [PillarItem, PillarItem, PillarItem, PillarItem] = [
      { can: "", chi: "" },
      { can: "", chi: "" },
      { can: "", chi: "" },
      { can: "", chi: "" },
    ];
    setPillars(empty);
    try {
      localStorage.setItem("iching_bazi_custom_pillars_v1", JSON.stringify(empty));
      localStorage.setItem("iching_jiazi_eight_pillars_v3", JSON.stringify(empty));
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("sync-bazi-pillars", { detail: empty }));
      }, 0);
    } catch {
      // ignore
    }
    setNoticeMessage("Đã xóa trắng toàn bộ 8 ô Can Chi (trạng thái trống chưa điền).");
  };

  /**
   * Xử lý chọn Thiên Can cho Trụ colIndex (tuân thủ luật phối tượng âm dương y chang bảng dưới)
   */
  const handleSelectCan = (colIndex: number, newCan: string) => {
    setPillars((prev) => {
      const next = [...prev] as [PillarItem, PillarItem, PillarItem, PillarItem];
      const canData = CAN_MAP.get(newCan);
      let updatedChi = next[colIndex].chi;

      if (canData) {
        const isAm = canData.polarity === "am";
        if (updatedChi) {
          const chiData = CHI_MAP.get(updatedChi);
          if (chiData && chiData.polarity !== canData.polarity) {
            const validChis = isAm ? AM_CHI_NAMES : DUONG_CHI_NAMES;
            updatedChi = validChis[0];
            setNoticeMessage(
              `Đã chọn Can ${isAm ? "Âm" : "Dương"} [${newCan}] ➔ Địa Chi bên dưới tự động chuyển thành [${updatedChi}] (${isAm ? "Chi Âm" : "Chi Dương"}) để tuân thủ luật phối tượng!`
            );
          } else {
            setNoticeMessage(
              `Đã chọn Can ${isAm ? "Âm" : "Dương"} [${newCan}] ➔ Địa Chi bên dưới chỉ được chọn ${isAm ? "6 Địa Chi Âm (Sửu, Mão, Tỵ, Mùi, Dậu, Hợi)" : "6 Địa Chi Dương (Tý, Dần, Thìn, Ngọ, Thân, Tuất)"}.`
            );
          }
        } else {
          setNoticeMessage(
            `Đã chọn Can ${isAm ? "Âm" : "Dương"} [${newCan}] ➔ Giờ bạn có thể chọn ${isAm ? "Địa Chi Âm" : "Địa Chi Dương"} ở ô dưới.`
          );
        }
      }

      next[colIndex] = {
        can: newCan,
        chi: updatedChi,
      };

      // Tự động đồng bộ sang bảng dưới
      try {
        localStorage.setItem("iching_jiazi_eight_pillars_v3", JSON.stringify(next));
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("sync-bazi-pillars", { detail: next }));
        }, 0);
      } catch {}

      return next;
    });

    setActiveSlot(null);
  };

  /**
   * Xử lý chọn Địa Chi cho Trụ colIndex (tuân thủ luật phối tượng âm dương y chang bảng dưới)
   */
  const handleSelectChi = (colIndex: number, newChi: string) => {
    const currentCan = pillars[colIndex].can;
    const canData = CAN_MAP.get(currentCan);
    const chiData = CHI_MAP.get(newChi);

    if (canData && chiData) {
      if (canData.polarity !== chiData.polarity) {
        const isAmCan = canData.polarity === "am";
        setNoticeMessage(
          `⚠️ Không thể chọn [${newChi}] (${chiData.polarity === "am" ? "Chi Âm" : "Chi Dương"}) vì Thiên Can [${currentCan}] là Can ${isAmCan ? "Âm" : "Dương"}. Chỉ được chọn ${isAmCan ? "Địa Chi Âm" : "Địa Chi Dương"}!`
        );
        return;
      }
    }

    setPillars((prev) => {
      const next = [...prev] as [PillarItem, PillarItem, PillarItem, PillarItem];
      next[colIndex] = {
        ...next[colIndex],
        chi: newChi,
      };

      try {
        localStorage.setItem("iching_jiazi_eight_pillars_v3", JSON.stringify(next));
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("sync-bazi-pillars", { detail: next }));
        }, 0);
      } catch {}

      return next;
    });

    setActiveSlot(null);
  };

  /**
   * Tìm Hoa Giáp theo Can Chi
   */
  const getMatchedJiazi = (can: string, chi: string): JiaziEnrichedEntry | undefined => {
    if (!can || !chi) return undefined;
    return SIXTY_JIAZI.find((j) => j.can === can && j.chi === chi);
  };

  /**
   * Sao chép 4 Trụ Bát Tự
   */
  const handleCopyBazi = () => {
    const text = pillars
      .map((p, idx) => {
        const label = PILLAR_LABELS[idx].title;
        return `${label}: ${p.can || "?"} ${p.chi || "?"}`;
      })
      .join("  |  ");
    const summary = `☯ LÁ SỐ BÁT TỰ TỨ TRỤ [${gender === "nam" ? "Nam mệnh" : "Nữ mệnh"}] ☯\n${text}\nĐại vận: ${activeDaiVan?.fullName || ""} | Lưu niên ${currentRealYear}: ${activeLuuNien?.fullName || ""}`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setNoticeMessage("Đã sao chép toàn bộ thông tin Bát Tự & Vận Trình vào bộ nhớ tạm!");
    setTimeout(() => setCopied(false), 2000);
  };

  // ============================================================================
  // TÍNH TOÁN QUY LUẬT ĐẠI VẬN (10 BƯỚC ĐẠI VẬN)
  // ============================================================================

  const yearCan = pillars[3]?.can || "";
  const monthCan = pillars[2]?.can || "";
  const monthChi = pillars[2]?.chi || "";
  const dayCan = pillars[1]?.can || "";
  const dayChi = pillars[1]?.chi || "";
  const hourCan = pillars[0]?.can || "";
  const hourChi = pillars[0]?.chi || "";

  const isDuongYear = Boolean(yearCan && DUONG_CAN_NAMES.includes(yearCan));
  const isMale = gender === "nam";

  // Chiều Đại Vận:
  // - Dương Nam & Âm Nữ: Đi THUẬN (+1)
  // - Âm Nam & Dương Nữ: Đi NGHỊCH (-1)
  const isDaiVanThuan = (isMale && isDuongYear) || (!isMale && !isDuongYear);
  const daiVanDirectionText = !yearCan
    ? "Chưa xác định (cần điền Trụ Năm)"
    : isDaiVanThuan
    ? `${isMale ? "Dương Nam" : "Âm Nữ"}: Đi THUẬN (+1)`
    : `${isMale ? "Âm Nam" : "Dương Nữ"}: Đi NGHỊCH (-1)`;

  const sixtyJiaziNames = useMemo(() => SIXTY_JIAZI.map((j) => j.name), []);

  interface DaiVanItem {
    step: number;
    can: string;
    chi: string;
    fullName: string;
    chinese: string;
    napAm: string;
    ageStart: number;
    ageEnd: number;
    yearStart: number;
    yearEnd: number;
    canTenGod: TenGodInfo;
    chiTenGod: TenGodInfo;
    isCurrent: boolean;
  }

  const daiVanList: DaiVanItem[] = useMemo(() => {
    // Nếu chưa chọn Can Chi Trụ Tháng, chưa an được 10 bước Đại Vận
    if (!monthCan || !monthChi) {
      return [];
    }

    const monthFullName = `${monthCan} ${monthChi}`;
    let monthIdx = sixtyJiaziNames.indexOf(monthFullName);
    if (monthIdx === -1) {
      monthIdx = SIXTY_JIAZI.findIndex((j) => j.can === monthCan && j.chi === monthChi);
      if (monthIdx === -1) monthIdx = 0;
    }

    const currentYear = new Date().getFullYear();
    const currentAgeApprox = currentYear - birthYear + 1;

    const list: DaiVanItem[] = [];
    for (let i = 1; i <= 10; i++) {
      let targetIdx = isDaiVanThuan ? (monthIdx + i) % 60 : (monthIdx - i + 60) % 60;
      const jiaziEntry = SIXTY_JIAZI[targetIdx];
      const ageStart = startAge + (i - 1) * 10;
      const ageEnd = ageStart + 9;
      const yearStart = birthYear + ageStart;
      const yearEnd = birthYear + ageEnd;

      const canTenGod = getTenGod(jiaziEntry.can, dayCan || "Giáp");
      const mainHiddenCan = HIDDEN_STEMS_MAP[jiaziEntry.chi]?.[0]?.can || jiaziEntry.can;
      const chiTenGod = getTenGod(mainHiddenCan, dayCan || "Giáp");

      const isCurrent = currentAgeApprox >= ageStart && currentAgeApprox <= ageEnd;

      list.push({
        step: i,
        can: jiaziEntry.can,
        chi: jiaziEntry.chi,
        fullName: jiaziEntry.name,
        chinese: jiaziEntry.chinese,
        napAm: jiaziEntry.elementNapAm || jiaziEntry.soundSymbolism?.napAm || "",
        ageStart,
        ageEnd,
        yearStart,
        yearEnd,
        canTenGod,
        chiTenGod,
        isCurrent,
      });
    }
    return list;
  }, [monthCan, monthChi, dayCan, isDaiVanThuan, startAge, birthYear, sixtyJiaziNames]);

  const activeDaiVanIndex = useMemo(() => {
    if (daiVanList.length === 0) return -1;
    if (selectedDaiVanIdx !== null && selectedDaiVanIdx >= 0 && selectedDaiVanIdx < daiVanList.length) {
      return selectedDaiVanIdx;
    }
    const currentIdx = daiVanList.findIndex((dv) => dv.isCurrent);
    return currentIdx !== -1 ? currentIdx : 0;
  }, [selectedDaiVanIdx, daiVanList]);

  const activeDaiVan = activeDaiVanIndex >= 0 ? daiVanList[activeDaiVanIndex] : null;

  // ============================================================================
  // TÍNH TOÁN 10 NĂM LƯU NIÊN TRONG ĐẠI VẬN ĐANG CHỌN
  // ============================================================================

  interface LuuNienItem {
    year: number;
    age: number;
    can: string;
    chi: string;
    fullName: string;
    chinese: string;
    napAm: string;
    canTenGod: TenGodInfo;
    interactions: {
      withDayChi: string[];
      withMonthChi: string[];
      withYearChi: string[];
      withHourChi: string[];
      withDaiVanChi: string[];
    };
    isRealCurrentYear: boolean;
  }

  const luuNienList: LuuNienItem[] = useMemo(() => {
    if (!activeDaiVan) return [];
    const list: LuuNienItem[] = [];

    for (let y = activeDaiVan.yearStart; y <= activeDaiVan.yearEnd; y++) {
      const canIdx = (((y - 4) % 10) + 10) % 10;
      const chiIdx = (((y - 4) % 12) + 12) % 12;
      const cCan = CAN_LIST[canIdx].name;
      const cChi = CHI_LIST[chiIdx].name;
      const entry = SIXTY_JIAZI.find((j) => j.can === cCan && j.chi === cChi);

      const canTenGod = getTenGod(cCan, dayCan);
      const withDayChi = checkBranchInteractions(cChi, dayChi);
      const withMonthChi = checkBranchInteractions(cChi, monthChi);
      const withYearChi = checkBranchInteractions(cChi, pillars[3]?.chi || "");
      const withHourChi = checkBranchInteractions(cChi, hourChi);
      const withDaiVanChi = checkBranchInteractions(cChi, activeDaiVan.chi);

      list.push({
        year: y,
        age: y - birthYear + 1,
        can: cCan,
        chi: cChi,
        fullName: `${cCan} ${cChi}`,
        chinese: entry?.chinese || "",
        napAm: entry?.elementNapAm || "",
        canTenGod,
        interactions: {
          withDayChi,
          withMonthChi,
          withYearChi,
          withHourChi,
          withDaiVanChi,
        },
        isRealCurrentYear: y === currentRealYear,
      });
    }
    return list;
  }, [activeDaiVan, dayCan, dayChi, monthChi, hourChi, pillars, birthYear, currentRealYear]);

  const activeLuuNien = useMemo(() => {
    return luuNienList.find((ln) => ln.year === selectedLuuNienYear) || luuNienList[0] || null;
  }, [luuNienList, selectedLuuNienYear]);

  // Danh sách Đại Vận & Lưu Niên hiển thị theo thứ tự (ngược 10 ➔ 1 hoặc xuôi 1 ➔ 10)
  const displayedDaiVanList = useMemo(() => {
    return isReversedOrder ? [...daiVanList].reverse() : daiVanList;
  }, [daiVanList, isReversedOrder]);

  const displayedLuuNienList = useMemo(() => {
    return isReversedOrder ? [...luuNienList].reverse() : luuNienList;
  }, [luuNienList, isReversedOrder]);

  // Lưu lá số (có chế độ ghi đè hoặc lưu mới)
  const handleOpenSaveModal = (preferredMode?: "create_new" | "overwrite") => {
    const isCurrentlyActive = currentLoadedProfileId && savedProfiles.some((p) => p.id === currentLoadedProfileId);
    const chosenMode = preferredMode || (isCurrentlyActive ? "overwrite" : "create_new");
    setSaveMode(chosenMode);

    const targetId = isCurrentlyActive ? currentLoadedProfileId : savedProfiles.length > 0 ? savedProfiles[0].id : null;
    setOverwriteTargetId(targetId);

    const activeP = savedProfiles.find((p) => p.id === targetId);
    if (activeP && chosenMode === "overwrite") {
      setSaveTitle(activeP.title);
      setSaveFullName(activeP.fullName || "");
      setSaveNotes(activeP.notes || "");
    } else {
      setSaveTitle(`Lá số ${gender === "nam" ? "Nam" : "Nữ"} - ${dayCan} ${dayChi} (${birthYear})`);
      setSaveFullName("");
      setSaveNotes("");
    }
    setIsSaveModalOpen(true);
  };

  const handleSaveProfile = () => {
    // 1. Chế độ GHI ĐÈ lên hồ sơ đã có
    if (saveMode === "overwrite" && overwriteTargetId) {
      const nextList = savedProfiles.map((p) => {
        if (p.id === overwriteTargetId) {
          return {
            ...p,
            title: saveTitle.trim() || p.title,
            fullName: saveFullName.trim(),
            gender,
            birthYear,
            pillars: [pillars[0], pillars[1], pillars[2], pillars[3]] as [PillarItem, PillarItem, PillarItem, PillarItem],
            startAge,
            notes: saveNotes.trim(),
            savedAt: new Date().toLocaleString("vi-VN") + " (Đã ghi đè)",
            timestamp: Date.now(),
            thienSettings,
          };
        }
        return p;
      });
      saveProfilesToStorage(nextList);
      setCurrentLoadedProfileId(overwriteTargetId);
      setIsSaveModalOpen(false);
      setNoticeMessage(`Đã ghi đè thành công hồ sơ "${saveTitle}"!`);
      return;
    }

    // 2. Chế độ LƯU MỚI thành hồ sơ riêng biệt
    const newProfile: SavedBaziProfile = {
      id: "bazi_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 6),
      title: saveTitle.trim() || `Lá số Bát Tự ${gender === "nam" ? "Nam" : "Nữ"}`,
      fullName: saveFullName.trim(),
      gender,
      birthYear,
      birthMonth: 1,
      birthDay: 1,
      birthHour: 12,
      birthMinute: 0,
      pillars: [...pillars],
      startAge,
      notes: saveNotes.trim(),
      savedAt: new Date().toLocaleString("vi-VN"),
      timestamp: Date.now(),
      thienSettings,
    };

    const nextList = [newProfile, ...savedProfiles];
    saveProfilesToStorage(nextList);
    setCurrentLoadedProfileId(newProfile.id);
    setIsSaveModalOpen(false);
    setNoticeMessage(`Đã lưu lá số mới "${newProfile.title}" kèm toàn bộ thiết lập các Thiên thành công!`);
  };

  // Nạp lá số và nhảy ra luôn thiết lập các Thiên
  const handleLoadProfile = (profile: SavedBaziProfile) => {
    setCurrentLoadedProfileId(profile.id);
    setPillars(profile.pillars);
    setGender(profile.gender);
    setBirthYear(profile.birthYear);
    setStartAge(profile.startAge || 4);
    if (profile.thienSettings) {
      // Khi mở file ra thì nhảy ra luôn: mở sẵn tất cả các Thiên
      setThienSettings({
        giaCau: { ...profile.thienSettings.giaCau, isOpen: true },
        ketCau: { ...profile.thienSettings.ketCau, isOpen: true },
        ketCauVan: { ...profile.thienSettings.ketCauVan, isOpen: true },
        hanhVi: { ...profile.thienSettings.hanhVi, isOpen: true },
        thucThi: { ...profile.thienSettings.thucThi, isOpen: true },
      });
    }
    setIsHistoryModalOpen(false);
    setNoticeMessage(`Đã nạp lá số: ${profile.title} (Toàn bộ thiết lập các Thiên đã nhảy ra sẵn!)`);

    // Cuộn mượt mà xuống khu vực các Thiên ("nhảy ra luôn")
    setTimeout(() => {
      const el = document.getElementById("thien-section-anchor");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 180);
  };

  // Lưu nhanh từ nút "Lưu Vào Bát Tự" ở từng Thiên
  const handleSaveThienToBazi = (thienKey: keyof ThienSettings, data: any) => {
    const updatedThienSettings: ThienSettings = {
      ...thienSettings,
      [thienKey]: {
        ...thienSettings[thienKey],
        ...data,
        isOpen: true,
      },
    };
    setThienSettings(updatedThienSettings);

    const thienNames: Record<keyof ThienSettings, string> = {
      giaCau: "Gia Cấu Thiên",
      ketCau: "Kết Cấu Thiên",
      ketCauVan: "Kết Cấu Vận Thiên",
      hanhVi: "Hành Vi Thiên",
      thucThi: "Thực Thi Thiên",
    };

    // Nếu đang mở một hồ sơ đã lưu thì ưu tiên chế độ ghi đè
    const isCurrentlyActive = currentLoadedProfileId && savedProfiles.some((p) => p.id === currentLoadedProfileId);
    if (isCurrentlyActive) {
      setSaveMode("overwrite");
      setOverwriteTargetId(currentLoadedProfileId);
      const activeP = savedProfiles.find((p) => p.id === currentLoadedProfileId);
      if (activeP) {
        setSaveTitle(activeP.title);
        setSaveFullName(activeP.fullName || "");
        setSaveNotes(activeP.notes || "");
      }
    } else {
      setSaveMode("create_new");
      if (savedProfiles.length > 0) setOverwriteTargetId(savedProfiles[0].id);
      setSaveTitle(`Lá số ${gender === "nam" ? "Nam" : "Nữ"} - ${dayCan} ${dayChi} (${birthYear}) - [${thienNames[thienKey]}]`);
    }

    setIsSaveModalOpen(true);
    setNoticeMessage(`Đã cập nhật dữ liệu ${thienNames[thienKey]}. Hãy chọn Ghi Đè hoặc Lưu Mới!`);
  };

  // Xuất file JSON lá số kèm các Thiên
  const handleExportJson = (profileToExport?: SavedBaziProfile) => {
    const data = profileToExport || {
      id: "bazi_" + Date.now().toString(36),
      title: `Lá số ${gender === "nam" ? "Nam" : "Nữ"} - ${dayCan} ${dayChi} (${birthYear})`,
      gender,
      birthYear,
      birthMonth: 1,
      birthDay: 1,
      birthHour: 12,
      birthMinute: 0,
      pillars,
      startAge,
      thienSettings,
      savedAt: new Date().toLocaleString("vi-VN"),
      timestamp: Date.now(),
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bat-tu-${(data.title || "la-so").replace(/[/\\?%*:|"<>]/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setNoticeMessage("Đã xuất file lá số (.json) kèm đầy đủ thiết lập các Thiên!");
  };

  // Mở file JSON lá số (nhảy ra luôn)
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.pillars && Array.isArray(parsed.pillars)) {
          handleLoadProfile(parsed);
          // Lưu vào danh sách đã lưu nếu chưa có
          if (!savedProfiles.some((p) => p.id === parsed.id)) {
            const nextList = [parsed, ...savedProfiles];
            saveProfilesToStorage(nextList);
          }
          setNoticeMessage(`Đã mở file "${parsed.title || file.name}" & nhảy ra toàn bộ các Thiên!`);
        } else {
          alert("File JSON không hợp lệ định dạng lá số Bát Tự!");
        }
      } catch (err) {
        alert("Lỗi khi đọc file JSON: " + err);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleDeleteProfile = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const target = savedProfiles.find((p) => p.id === id);
    const nextList = savedProfiles.filter((p) => p.id !== id);
    saveProfilesToStorage(nextList);
    setDeletingProfileId(null);
    if (currentLoadedProfileId === id) {
      setCurrentLoadedProfileId(null);
    }
    setNoticeMessage(`Đã xóa lá số "${target?.title || "Bát Tự"}" thành công!`);
  };

  const handleClearAllProfiles = () => {
    saveProfilesToStorage([]);
    setIsClearingAllProfiles(false);
    setCurrentLoadedProfileId(null);
    setNoticeMessage("Đã xóa toàn bộ danh sách lá số Bát Tự đã lưu thành công!");
  };

  const khongVongInfo = useMemo(() => getKhongVongInfo(dayCan, dayChi), [dayCan, dayChi]);

  return (
    <div
      ref={fullBaziContainerRef}
      className={`border border-[#3D3021] bg-gradient-to-b from-[#1C1711] via-[#16120D] to-[#120F0B] rounded-2xl shadow-xl overflow-hidden transition-all duration-300 ${className}`}
    >
      {/* ========================================================
          TOP BAR HEADER: BẢNG 8 Ô BÁT TỰ CAN CHI MỞ RỘNG
          ======================================================== */}
      <div className="px-4 py-3.5 sm:px-6 sm:py-4 border-b border-[#2E2419] flex flex-wrap items-center justify-between gap-3 bg-[#1F1912]/80 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#2A1E14] border border-[#52412E] text-[#D6B97A] shadow-inner">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-bold text-[#F5EAD4] font-serif tracking-wide flex items-center gap-2">
                BẢNG 8 Ô BÁT TỰ CAN CHI
                <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-[#2E2215] text-[#C9A55A] border border-[#533F27]">
                  Giờ • Ngày • Tháng • Năm
                </span>
                <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-[#382614] text-[#D6B97A] border border-[#6B4E2B]">
                  Đại Vận • Lưu Niên
                </span>
              </h2>
            </div>
            <p className="text-[11px] sm:text-xs text-[#9E8E7A] mt-0.5 flex items-center gap-2 flex-wrap">
              <span>
                Nhật Chủ: <strong className="text-[#F5EAD4] font-serif font-bold">{dayCan}</strong>
              </span>
              <span>•</span>
              <span className="text-[#C9A55A]">{daiVanDirectionText}</span>
              <span>•</span>
              <span className="text-[#9E8E7A]">
                Can Âm (<span className="text-amber-300 font-semibold">Ất, Đinh, Kỷ, Tân, Quý</span>) chọn Chi Âm; Can Dương (<span className="text-yellow-400 font-semibold">Giáp, Bính, Mậu, Canh, Nhâm</span>) chọn Chi Dương.
              </span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap ml-auto">
          {/* 1. Chọn Nam / Nữ */}
          <div className="inline-flex p-0.5 rounded-lg bg-[#1C140C] border border-[#443220] shadow-inner">
            <button
              type="button"
              onClick={() => {
                setGender("nam");
                setNoticeMessage("Đã chuyển sang Nam mệnh (Càn tạo 乾造)!");
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                gender === "nam"
                  ? "bg-gradient-to-r from-blue-700 to-sky-700 text-white font-bold shadow-md shadow-blue-900/40"
                  : "text-[#A89882] hover:text-[#F5EAD4] hover:bg-[#2A1D11]"
              }`}
              title="Nam mệnh (Càn tạo): Niên Can Dương đi Thuận, Niên Can Âm đi Nghịch"
            >
              <User className="w-3 h-3" />
              <span>Nam (Càn tạo)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setGender("nu");
                setNoticeMessage("Đã chuyển sang Nữ mệnh (Khôn tạo 坤造)!");
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                gender === "nu"
                  ? "bg-gradient-to-r from-rose-700 to-pink-700 text-white font-bold shadow-md shadow-rose-900/40"
                  : "text-[#A89882] hover:text-[#F5EAD4] hover:bg-[#2A1D11]"
              }`}
              title="Nữ mệnh (Khôn tạo): Niên Can Âm đi Thuận, Niên Can Dương đi Nghịch"
            >
              <Heart className="w-3 h-3" />
              <span>Nữ (Khôn tạo)</span>
            </button>
          </div>

          {/* 2. Nút Lấy Ngày Giờ Hiện Tại */}
          <button
            type="button"
            onClick={handleCurrentDateTime}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-[#271E15] hover:bg-[#382B1E] text-[#D6B97A] border border-[#4F3B28] hover:border-[#C9A55A] transition-all cursor-pointer shadow-sm active:scale-95"
            title="Tự động lấy ngày giờ hiện tại để điền 4 Trụ Bát Tự theo thời gian thực tế"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Lấy Ngày Giờ Hiện Tại</span>
          </button>

          {/* 3. Nút Lưu Bát Tự */}
          <button
            type="button"
            onClick={() => handleOpenSaveModal("create_new")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-[#C9A55A] to-[#B8860B] hover:from-[#F3CE65] hover:to-[#C69214] text-[#1A1208] font-bold text-xs shadow-md shadow-[#C9A55A]/20 transition-all cursor-pointer active:scale-95"
            title="Lưu lại toàn bộ lá số Bát Tự này thành hồ sơ mới"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Lưu Bát Tự</span>
          </button>

          {/* 3B. Nút Ghi Đè (nếu có danh sách đã lưu) */}
          {savedProfiles.length > 0 && (
            <button
              type="button"
              onClick={() => handleOpenSaveModal("overwrite")}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 hover:from-amber-600 hover:to-amber-800 text-amber-100 font-bold text-xs shadow-md shadow-amber-800/30 transition-all cursor-pointer active:scale-95 border border-amber-500/60"
              title="Ghi đè cập nhật vào hồ sơ Bát Tự đã có"
            >
              <RotateCw className="w-3.5 h-3.5 text-amber-300" />
              <span>Ghi Đè</span>
            </button>
          )}

          {/* 4. Nút Đã Lưu */}
          <button
            type="button"
            onClick={() => setIsHistoryModalOpen(true)}
            className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#261B10] hover:bg-[#382717] text-[#D6B97A] border border-[#523A22] transition-all cursor-pointer active:scale-95 text-xs font-medium"
            title="Xem danh sách các lá số Bát Tự đã lưu"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Đã Lưu</span>
            {savedProfiles.length > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-[#C9A55A] text-[#1A1208] text-[10px] font-bold">
                {savedProfiles.length}
              </span>
            )}
          </button>

          {/* 5. Nút Sao Chép */}
          <button
            type="button"
            onClick={handleCopyBazi}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-[#1E1812] hover:bg-[#2C2218] text-[#DDD0BE] border border-[#3A2D1F] transition-all cursor-pointer active:scale-95"
            title="Sao chép 4 Trụ Bát Tự"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#A89882]" />}
            <span className="hidden sm:inline">{copied ? "Đã chép" : "Sao chép"}</span>
          </button>

          {/* 5B. Menu Chụp & Tải Ảnh Bát Tự (Gộp Tổng Bát Tự, Bát Tự Riêng & 5 Thiên gọn gàng trong 1 Menu) */}
          <div className="relative no-capture">
            <button
              type="button"
              onClick={() => setCaptureDropdownOpen((o) => !o)}
              disabled={isCapturingTarget !== null}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#2F2113] to-[#3D2B19] hover:from-[#3D2C1B] hover:to-[#4D3823] text-amber-200 border border-[#5E4327] hover:border-[#C9A55A] text-xs font-semibold shadow-md transition-all cursor-pointer active:scale-95 whitespace-nowrap"
              title="Chụp hoặc tải ảnh Tổng Bát Tự, Bát Tự Riêng và từng Thiên"
            >
              {isCapturingTarget !== null ? (
                <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              ) : (
                <Camera className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>Chụp & Tải Ảnh</span>
              <ChevronDown
                className={`w-3 h-3 text-[#A89882] transition-transform ${captureDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {captureDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-72 rounded-xl bg-[#1C130B] border border-[#553E26] shadow-2xl py-1.5 z-50 animate-in fade-in">
                <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-amber-300/90 font-semibold border-b border-[#352516] flex items-center justify-between">
                  <span>Toàn Bộ Lá Số & Bát Tự 8 Ô</span>
                </div>

                {/* Tổng Bát Tự */}
                <div className="px-2.5 py-1.5 hover:bg-[#2B1F13] flex items-center justify-between gap-1 text-xs text-[#E5D7BF]">
                  <span className="truncate flex-1 font-semibold text-amber-200">Tổng Bát Tự & Các Thiên</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setCaptureDropdownOpen(false);
                        handleCaptureElement(
                          fullBaziContainerRef,
                          `Tổng Bát Tự (${dayCan} ${dayChi})`,
                          `tong-bat-tu-${dayCan}-${dayChi}.png`,
                          "full"
                        );
                      }}
                      className="px-2 py-0.5 rounded bg-[#352718] hover:bg-[#483521] text-amber-300 border border-[#553E26] text-[11px] flex items-center gap-1 cursor-pointer"
                      title="Chụp & Xem ảnh Tổng Bát Tự"
                    >
                      <Camera className="w-3 h-3 text-amber-400" />
                      <span>Chụp</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCaptureDropdownOpen(false);
                        handleCaptureElement(
                          fullBaziContainerRef,
                          `Tổng Bát Tự (${dayCan} ${dayChi})`,
                          `tong-bat-tu-${dayCan}-${dayChi}.png`,
                          "full",
                          true
                        );
                      }}
                      className="px-2 py-0.5 rounded bg-amber-700 hover:bg-amber-600 text-stone-950 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                      title="Tải trực tiếp PNG Tổng Bát Tự"
                    >
                      <Download className="w-3 h-3" />
                      <span>Tải</span>
                    </button>
                  </div>
                </div>

                {/* Bát Tự Riêng */}
                <div className="px-2.5 py-1.5 hover:bg-[#2B1F13] flex items-center justify-between gap-1 text-xs text-[#E5D7BF] border-b border-[#352516]">
                  <span className="truncate flex-1 font-medium">Bát Tự Riêng (8 Ô & Vận)</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setCaptureDropdownOpen(false);
                        handleCaptureElement(
                          onlyBaziContainerRef,
                          `Bát Tự Riêng (${dayCan} ${dayChi})`,
                          `bat-tu-rieng-${dayCan}-${dayChi}.png`,
                          "only"
                        );
                      }}
                      className="px-2 py-0.5 rounded bg-[#352718] hover:bg-[#483521] text-amber-300 border border-[#553E26] text-[11px] flex items-center gap-1 cursor-pointer"
                      title="Chụp & Xem ảnh Bát Tự Riêng"
                    >
                      <Camera className="w-3 h-3 text-amber-400" />
                      <span>Chụp</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCaptureDropdownOpen(false);
                        handleCaptureElement(
                          onlyBaziContainerRef,
                          `Bát Tự Riêng (${dayCan} ${dayChi})`,
                          `bat-tu-rieng-${dayCan}-${dayChi}.png`,
                          "only",
                          true
                        );
                      }}
                      className="px-2 py-0.5 rounded bg-amber-700 hover:bg-amber-600 text-stone-950 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                      title="Tải trực tiếp PNG Bát Tự Riêng"
                    >
                      <Download className="w-3 h-3" />
                      <span>Tải</span>
                    </button>
                  </div>
                </div>

                <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-[#A89882] font-semibold border-b border-[#352516] flex items-center justify-between">
                  <span>Chụp / Tải Từng Thiên</span>
                </div>

                {/* 1. Gia Cấu */}
                <div className="px-2.5 py-1.5 hover:bg-[#2B1F13] flex items-center justify-between gap-1 text-xs text-[#E5D7BF]">
                  <span className="truncate flex-1 font-medium">1. Gia Cấu Thiên</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setCaptureDropdownOpen(false);
                        handleCaptureElement(
                          giaCauContainerRef,
                          `Gia Cấu Thiên (${dayCan} ${dayChi})`,
                          `gia-cau-thien-${dayCan}-${dayChi}.png`,
                          "giaCau"
                        );
                      }}
                      className="px-2 py-0.5 rounded bg-[#352718] hover:bg-[#483521] text-amber-300 border border-[#553E26] text-[11px] flex items-center gap-1 cursor-pointer"
                      title="Chụp & Xem ảnh"
                    >
                      <Camera className="w-3 h-3 text-amber-400" />
                      <span>Chụp</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCaptureDropdownOpen(false);
                        handleCaptureElement(
                          giaCauContainerRef,
                          `Gia Cấu Thiên (${dayCan} ${dayChi})`,
                          `gia-cau-thien-${dayCan}-${dayChi}.png`,
                          "giaCau",
                          true
                        );
                      }}
                      className="px-2 py-0.5 rounded bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 text-stone-950 font-bold border border-amber-400 text-[11px] flex items-center gap-1 cursor-pointer"
                      title="Tải ảnh về máy"
                    >
                      <Download className="w-3 h-3" />
                      <span>Tải</span>
                    </button>
                  </div>
                </div>

                {/* 2. Kết Cấu */}
                <div className="px-2.5 py-1.5 hover:bg-[#2B1F13] flex items-center justify-between gap-1 text-xs text-[#E5D7BF]">
                  <span className="truncate flex-1 font-medium">2. Kết Cấu Thiên</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setCaptureDropdownOpen(false);
                        handleCaptureElement(
                          ketCauContainerRef,
                          `Kết Cấu Thiên (${dayCan} ${dayChi})`,
                          `ket-cau-thien-${dayCan}-${dayChi}.png`,
                          "ketCau"
                        );
                      }}
                      className="px-2 py-0.5 rounded bg-[#352718] hover:bg-[#483521] text-amber-300 border border-[#553E26] text-[11px] flex items-center gap-1 cursor-pointer"
                      title="Chụp & Xem ảnh"
                    >
                      <Camera className="w-3 h-3 text-amber-400" />
                      <span>Chụp</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCaptureDropdownOpen(false);
                        handleCaptureElement(
                          ketCauContainerRef,
                          `Kết Cấu Thiên (${dayCan} ${dayChi})`,
                          `ket-cau-thien-${dayCan}-${dayChi}.png`,
                          "ketCau",
                          true
                        );
                      }}
                      className="px-2 py-0.5 rounded bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 text-stone-950 font-bold border border-amber-400 text-[11px] flex items-center gap-1 cursor-pointer"
                      title="Tải ảnh về máy"
                    >
                      <Download className="w-3 h-3" />
                      <span>Tải</span>
                    </button>
                  </div>
                </div>

                {/* 3. Kết Cấu Vận */}
                <div className="px-2.5 py-1.5 hover:bg-[#2B1F13] flex items-center justify-between gap-1 text-xs text-[#E5D7BF]">
                  <span className="truncate flex-1 font-medium">3. Kết Cấu Vận</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setCaptureDropdownOpen(false);
                        handleCaptureElement(
                          ketCauVanContainerRef,
                          `Kết Cấu Vận Thiên (${dayCan} ${dayChi} - ${activeDaiVan?.fullName || "Vận"})`,
                          `ket-cau-van-thien-${dayCan}-${dayChi}.png`,
                          "ketCauVan"
                        );
                      }}
                      className="px-2 py-0.5 rounded bg-[#352718] hover:bg-[#483521] text-purple-300 border border-[#553E26] text-[11px] flex items-center gap-1 cursor-pointer"
                      title="Chụp & Xem ảnh"
                    >
                      <Camera className="w-3 h-3 text-purple-400" />
                      <span>Chụp</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCaptureDropdownOpen(false);
                        handleCaptureElement(
                          ketCauVanContainerRef,
                          `Kết Cấu Vận Thiên (${dayCan} ${dayChi} - ${activeDaiVan?.fullName || "Vận"})`,
                          `ket-cau-van-thien-${dayCan}-${dayChi}.png`,
                          "ketCauVan",
                          true
                        );
                      }}
                      className="px-2 py-0.5 rounded bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 text-stone-950 font-bold border border-amber-400 text-[11px] flex items-center gap-1 cursor-pointer"
                      title="Tải ảnh về máy"
                    >
                      <Download className="w-3 h-3" />
                      <span>Tải</span>
                    </button>
                  </div>
                </div>

                {/* 4. Hành Vi */}
                <div className="px-2.5 py-1.5 hover:bg-[#2B1F13] flex items-center justify-between gap-1 text-xs text-[#E5D7BF]">
                  <span className="truncate flex-1 font-medium">4. Hành Vi Thiên</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setCaptureDropdownOpen(false);
                        handleCaptureElement(
                          hanhViContainerRef,
                          `Hành Vi Thiên (${dayCan} ${dayChi})`,
                          `hanh-vi-thien-${dayCan}-${dayChi}.png`,
                          "hanhVi"
                        );
                      }}
                      className="px-2 py-0.5 rounded bg-[#352718] hover:bg-[#483521] text-amber-300 border border-[#553E26] text-[11px] flex items-center gap-1 cursor-pointer"
                      title="Chụp & Xem ảnh"
                    >
                      <Camera className="w-3 h-3 text-amber-400" />
                      <span>Chụp</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCaptureDropdownOpen(false);
                        handleCaptureElement(
                          hanhViContainerRef,
                          `Hành Vi Thiên (${dayCan} ${dayChi})`,
                          `hanh-vi-thien-${dayCan}-${dayChi}.png`,
                          "hanhVi",
                          true
                        );
                      }}
                      className="px-2 py-0.5 rounded bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 text-stone-950 font-bold border border-amber-400 text-[11px] flex items-center gap-1 cursor-pointer"
                      title="Tải ảnh về máy"
                    >
                      <Download className="w-3 h-3" />
                      <span>Tải</span>
                    </button>
                  </div>
                </div>

                {/* 5. Thực Thi */}
                <div className="px-2.5 py-1.5 hover:bg-[#2B1F13] flex items-center justify-between gap-1 text-xs text-[#E5D7BF]">
                  <span className="truncate flex-1 font-medium">5. Thực Thi Thiên</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setCaptureDropdownOpen(false);
                        handleCaptureElement(
                          thucThiContainerRef,
                          `Thực Thi Thiên (${dayCan} ${dayChi})`,
                          `thuc-thi-thien-${dayCan}-${dayChi}.png`,
                          "thucThi"
                        );
                      }}
                      className="px-2 py-0.5 rounded bg-[#352718] hover:bg-[#483521] text-amber-300 border border-[#553E26] text-[11px] flex items-center gap-1 cursor-pointer"
                      title="Chụp & Xem ảnh"
                    >
                      <Camera className="w-3 h-3 text-amber-400" />
                      <span>Chụp</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCaptureDropdownOpen(false);
                        handleCaptureElement(
                          thucThiContainerRef,
                          `Thực Thi Thiên (${dayCan} ${dayChi})`,
                          `thuc-thi-thien-${dayCan}-${dayChi}.png`,
                          "thucThi",
                          true
                        );
                      }}
                      className="px-2 py-0.5 rounded bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 text-stone-950 font-bold border border-amber-400 text-[11px] flex items-center gap-1 cursor-pointer"
                      title="Tải ảnh về máy"
                    >
                      <Download className="w-3 h-3" />
                      <span>Tải</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 6. Nút Làm Mới */}
          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 text-xs font-medium rounded-lg bg-[#1E1812] hover:bg-[#2C2218] text-[#A89882] hover:text-white border border-[#3A2D1F] transition-all cursor-pointer"
            title="Làm mới (Xóa trắng 8 ô)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* 7. NÚT THU GỌN / MỞ RỘNG */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-[#261E16] text-[#C9A55A] border border-[#483724] hover:bg-[#34281D] transition-all cursor-pointer ml-1"
          >
            <span>{isOpen ? "Thu Gọn" : "Mở Rộng"}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {/* Notice Message Toast if any */}
      {noticeMessage && (
        <div className="px-4 py-2 sm:px-6 bg-[#261A10] border-b border-[#4A321E] text-xs text-[#FFE082] flex items-center justify-between gap-2 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#D6B97A] shrink-0" />
            <span>{noticeMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setNoticeMessage(null)}
            className="text-[#9E8E7A] hover:text-white shrink-0 p-0.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Thanh Tóm Tắt Nhanh Khi Thu Gọn */}
      {!isOpen && (
        <div className="px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-3 text-xs bg-[#17120C]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded bg-[#332212] text-[#C9A55A] font-semibold">
              {gender === "nam" ? "Nam mệnh (Càn tạo)" : "Nữ mệnh (Khôn tạo)"}
            </span>
            {pillars.some((p) => Boolean(p.can || p.chi)) ? (
              <>
                <span className="text-[#8C7D6A]">Tứ Trụ:</span>
                <span className="font-serif font-bold text-[#F5EAD4] tracking-wide">
                  {pillars.map((p) => `${p.can || "?"} ${p.chi || "?"}`).join("  •  ")}
                </span>
                {activeDaiVan && (
                  <>
                    <span className="text-[#A89882]">|</span>
                    <span className="text-[#A89882]">
                      Đại vận: <strong className="text-[#D6B97A] font-serif">{activeDaiVan.fullName}</strong> ({activeDaiVan.ageStart}-{activeDaiVan.ageEnd}t)
                    </span>
                  </>
                )}
                {activeLuuNien && (
                  <>
                    <span className="text-[#A89882]">|</span>
                    <span className="text-[#A89882]">
                      Lưu niên {currentRealYear}: <strong className="text-emerald-400 font-serif">{activeLuuNien.fullName}</strong>
                    </span>
                  </>
                )}
              </>
            ) : (
              <span className="text-[#8C7D6B] italic flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500/70 inline-block" />
                Trạng thái: Trống (Chưa điền Can Chi)
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="text-[#C9A55A] hover:underline flex items-center gap-1 cursor-pointer font-medium ml-auto"
          >
            <span>{pillars.some((p) => Boolean(p.can || p.chi)) ? "Mở rộng xem 8 ô, Đại Vận & Lưu Niên" : "Mở Rộng để điền Bát Tự"}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ========================================================
          BODY CHÍNH: KẾT CẤU 8 Ô BÁT TỰ GIỐNG Y CHANG BẢNG BÊN DƯỚI
          ======================================================== */}
      {isOpen && (
        <div className="p-4 sm:p-6 space-y-6">
          {/* KHỐI BÁT TỰ RIÊNG (DÙNG ĐỂ CHỤP ẢNH BÁT TỰ RIÊNG) */}
          <div ref={onlyBaziContainerRef} className="space-y-6 p-1 rounded-2xl">
            {/* Quy luật tóm tắt trực quan giống y chang bảng dưới */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-[#1C160F] border border-[#3E301F] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)]"></span>
                <span className="text-[#F3E7D0] font-semibold">5 Can Dương:</span>
                <span className="text-[#DDD0BE]">Giáp • Bính • Mậu • Canh • Nhâm</span>
              </div>
              <span className="text-[11px] text-yellow-400 font-bold px-2 py-0.5 rounded bg-yellow-950/60 border border-yellow-800/50">
                ➔ Đi với 6 Chi Dương
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#1C160F] border border-[#3E301F] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]"></span>
                <span className="text-[#F3E7D0] font-semibold">5 Can Âm:</span>
                <span className="text-[#DDD0BE]">Ất • Đinh • Kỷ • Tân • Quý</span>
              </div>
              <span className="text-[11px] text-amber-300 font-bold px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/50">
                ➔ Chỉ chọn 6 Chi Âm
              </span>
            </div>
          </div>

          {/* Thiết lập Vận Trình: Năm muốn xem & Tuổi khởi vận cho Đại Vận */}
          <div className="p-3 rounded-xl bg-[#18120B] border border-[#3D2C1C] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[#D6B97A] font-bold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" />
                <span>Thiết lập Vận Trình:</span>
              </span>
              <div className="flex items-center gap-1.5">
                <label className="text-[#8C7D6B] font-semibold">Năm muốn xem:</label>
                <input
                  type="number"
                  min="1900"
                  max="2100"
                  value={viewYear}
                  onChange={(e) => {
                    const y = parseInt(e.target.value, 10);
                    if (!isNaN(y)) {
                      setViewYear(y);
                      setSelectedLuuNienYear(y);
                      const foundIdx = daiVanList.findIndex(
                        (dv) => y >= dv.yearStart && y <= dv.yearEnd
                      );
                      if (foundIdx !== -1) {
                        setSelectedDaiVanIdx(foundIdx);
                      }
                    }
                  }}
                  className="w-20 px-2 py-1 rounded bg-[#24190F] border border-[#4A3521] text-[#F5EAD4] font-bold text-center focus:outline-none focus:border-[#C9A55A]"
                />
              </div>

              {/* Thông tin Can Chi của Năm muốn xem */}
              {(() => {
                const canIdx = (((viewYear - 4) % 10) + 10) % 10;
                const chiIdx = (((viewYear - 4) % 12) + 12) % 12;
                const cCan = CAN_LIST[canIdx]?.name || "";
                const cChi = CHI_LIST[chiIdx]?.name || "";
                const ageInViewYear = viewYear - birthYear + 1;
                return (
                  <span className="text-[#A89882] text-[11px] flex items-center gap-1">
                    <strong className="text-[#D6B97A] font-serif font-bold">({cCan} {cChi})</strong>
                    {ageInViewYear > 0 && <span>• {ageInViewYear} tuổi</span>}
                  </span>
                );
              })()}

              <div className="flex items-center gap-1.5 ml-2">
                <label className="text-[#8C7D6B]">Khởi vận:</label>
                <select
                  value={startAge}
                  onChange={(e) => setStartAge(parseInt(e.target.value, 10))}
                  className="px-2 py-1 rounded bg-[#24190F] border border-[#4A3521] text-[#D6B97A] font-bold focus:outline-none focus:border-[#C9A55A] cursor-pointer"
                >
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((a) => (
                    <option key={a} value={a}>
                      {a} tuổi khởi vận
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-[#C9A55A] text-xs flex items-center gap-1 font-medium">
              <span>Đại Vận ứng với năm {viewYear}:</span>
              <strong className="text-[#F5EAD4] font-serif">{activeDaiVan?.fullName}</strong> ({activeDaiVan?.ageStart} - {activeDaiVan?.ageEnd} tuổi)
            </div>
          </div>

          {/* =================================================================
              GRID 6 CỘT TƯƠNG ỨNG: 4 TRỤ BÁT TỰ + 2 TRỤ ĐẠI VẬN & LƯU NIÊN ĐƯỢC CHỌN
              - Trên điện thoại: Cho phép cuộn ngang mượt mà, hiển thị đầy đủ 6 cột như máy tính
              - Tên quẻ và hoa giáp có whitespace-nowrap không bị xuống hàng
              ================================================================= */}
          {/* =================================================================
              GRID 6 CỘT TƯƠNG ỨNG: 4 TRỤ BÁT TỰ + 2 TRỤ ĐẠI VẬN & LƯU NIÊN ĐƯỢC CHỌN
              - Trên điện thoại: Tinh gọn tối đa, 6 cột vừa khít 100% màn hình như máy tính
              - Tên quẻ và hoa giáp hiển thị gọn gàng, sắc nét, không bị xuống hàng
              ================================================================= */}
          <div className="w-full pb-3 -mx-1 px-1 sm:mx-0 sm:px-0 overflow-x-auto scrollbar-thin">
            <div className="grid grid-cols-6 gap-1 sm:gap-2.5 md:gap-3.5 w-full min-w-0">
              {/* 4 TRỤ BÁT TỰ GỐC: TRỤ GIỜ, TRỤ NGÀY, TRỤ THÁNG, TRỤ NĂM */}
              {PILLAR_LABELS.map((pillar) => {
                const colIdx = pillar.id;
                const { can, chi } = pillars[colIdx];
                const canData = CAN_MAP.get(can);
                const chiData = CHI_MAP.get(chi);
                const matchedJiazi = getMatchedJiazi(can, chi);
                const canTenGod = getTenGod(can, dayCan);

                return (
                  <div
                    key={colIdx}
                    className={`flex flex-col border rounded-lg sm:rounded-2xl p-1 sm:p-3 sm:p-3.5 shadow-md transition-colors relative ${
                      colIdx === 1
                        ? "bg-[#1B140D] border-[#553E26] hover:border-[#C9A55A]"
                        : "bg-[#18130E] border-[#332619] hover:border-[#4D3A26]"
                    }`}
                  >
                    {/* Header Cột: Tên Trụ */}
                    <div className="text-center pb-1 mb-1 sm:pb-2 sm:mb-2 border-b border-[#281E14]">
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-[9.5px] sm:text-sm font-bold text-[#D6B97A] font-serif whitespace-nowrap">
                          {pillar.title}
                        </span>
                      </div>
                      <div className="text-[7.5px] sm:text-[10px] text-[#8C7D6B] font-mono whitespace-nowrap truncate">{pillar.sub}</div>
                    </div>

                    {/* 4 Ô TRÊN: THIÊN CAN */}
                    <div className="mb-1 sm:mb-2">
                      <div
                        onClick={() => setActiveSlot({ colIndex: colIdx, type: "can" })}
                        className={`relative min-h-[38px] sm:min-h-[58px] sm:min-h-[66px] rounded-md sm:rounded-xl border flex flex-col items-center justify-center p-0.5 sm:p-2 text-center cursor-pointer transition-all duration-200 select-none group ${
                          canData
                            ? "bg-gradient-to-b from-[#251D14] to-[#1C160F] border-[#5A4328] hover:border-[#D6B97A] shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
                            : "bg-[#14100C]/70 border-dashed border-[#3D3021] hover:border-[#C9A55A] hover:bg-[#1A140F]"
                        }`}
                      >
                        {canData ? (
                          <div className="flex flex-col sm:flex-row items-center justify-center gap-0 sm:gap-1.5 sm:gap-2">
                            <span className="text-xs sm:text-2xl leading-none" title={canData.symbol}>
                              {canData.emoji}
                            </span>
                            <span className={`text-xs sm:text-2xl font-serif font-bold ${canData.colorText} leading-none mt-0.5 sm:mt-0`}>
                              {canData.name}
                            </span>
                            <span className="hidden md:inline text-xs sm:text-sm text-[#8C7D6B] font-serif">({canData.chinese})</span>
                          </div>
                        ) : (
                          <div className="text-center">
                            <span className="text-[8px] sm:text-xs text-[#A89882] group-hover:text-[#D6B97A] font-medium">
                              + Can
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Mũi Tên Kết Nối Âm Dương: ⇅ */}
                    <div className="flex items-center justify-center my-0 sm:my-0.5 leading-none">
                      <span className="text-[8px] sm:text-[10px] text-[#6E5A44] font-mono">⇅</span>
                    </div>

                    {/* 4 Ô DƯỚI: ĐỊA CHI */}
                    <div className="mb-1.5 sm:mb-3">
                      <div
                        onClick={() => setActiveSlot({ colIndex: colIdx, type: "chi" })}
                        className={`relative min-h-[38px] sm:min-h-[58px] sm:min-h-[66px] rounded-md sm:rounded-xl border flex flex-col items-center justify-center p-0.5 sm:p-2 text-center cursor-pointer transition-all duration-200 select-none group ${
                          chiData
                            ? "bg-gradient-to-b from-[#231A12] to-[#1A140E] border-[#5A4328] hover:border-[#D6B97A] shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
                            : "bg-[#14100C]/70 border-dashed border-[#3D3021] hover:border-[#C9A55A] hover:bg-[#1A140F]"
                        }`}
                      >
                        {chiData ? (
                          <div className="flex flex-col sm:flex-row items-center justify-center gap-0 sm:gap-1.5 sm:gap-2">
                            <span className="text-xs sm:text-2xl leading-none">{chiData.emoji}</span>
                            <span className="text-xs sm:text-2xl font-serif font-bold text-[#F5EAD4] leading-none mt-0.5 sm:mt-0">
                              {chiData.name}
                            </span>
                            <span className="hidden md:inline text-xs sm:text-sm text-[#8C7D6B] font-serif">({chiData.chinese})</span>
                          </div>
                        ) : (
                          <div className="text-center">
                            <span className="text-[8px] sm:text-xs text-[#A89882] group-hover:text-[#D6B97A] font-medium">
                              + Chi
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* HOA GIÁP KẾT QUẢ CỦA TRỤ NÀY */}
                    <div className="mt-auto pt-1 sm:pt-2 border-t border-[#251D14]">
                      {matchedJiazi ? (
                        <div className="bg-[#201810] border border-[#483724] rounded-md sm:rounded-xl p-1 sm:p-2 flex flex-col gap-0.5 sm:gap-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[8px] sm:text-[10px] text-[#C9A55A] font-bold truncate">
                              #{matchedJiazi.order} {matchedJiazi.name}
                            </span>
                            <span className="hidden sm:inline text-[9px] px-1.5 py-0.2 rounded bg-[#15110C] text-[#A89882] whitespace-nowrap">
                              {matchedJiazi.branchGroup}
                            </span>
                          </div>
                          <div className="text-[7px] sm:text-[10px] text-[#C4B49F] truncate">
                            {matchedJiazi.elementNapAm}
                          </div>
                          {matchedJiazi.hexagramLink && (
                            <div 
                              title={`Quẻ #${matchedJiazi.hexagramLink.hexagramNumber}: ${matchedJiazi.hexagramLink.hexagramName}`}
                              className="text-[7.5px] sm:text-[9px] text-[#A89882] flex items-center justify-center sm:justify-start gap-0.5 sm:gap-1 bg-[#15110B] px-0.5 sm:px-1.5 py-0.5 rounded border border-[#3E2E1D] overflow-hidden whitespace-nowrap"
                            >
                              <span className="text-[#C9A55A] shrink-0 font-bold text-[7.5px] sm:text-xs">☯</span>
                              <span className="text-[#E6D3A3] font-serif whitespace-nowrap truncate font-semibold">
                                #{matchedJiazi.hexagramLink.hexagramNumber} {matchedJiazi.hexagramLink.hexagramName}
                              </span>
                            </div>
                          )}
                          {onSelectJiazi && (
                            <button
                              type="button"
                              onClick={() => onSelectJiazi(matchedJiazi.id)}
                              className="mt-0.5 sm:mt-1 w-full flex items-center justify-center gap-0.5 py-0.5 sm:py-1 text-[7.5px] sm:text-[10px] font-semibold text-[#18130E] bg-[#C9A55A] hover:bg-[#E5C158] rounded sm:rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                            >
                              <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                              <span className="hidden sm:inline">Xem #{matchedJiazi.order}</span>
                              <span className="sm:hidden">Xem</span>
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="bg-[#19130D] border border-dashed border-[#3D2E1C] rounded-md sm:rounded-xl p-1 sm:p-2 text-center">
                          <span className="text-[7.5px] sm:text-[10px] text-[#7A6A55] italic">
                            Chưa phối
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* TRỤ THỨ 5: TRỤ ĐẠI VẬN (HIỆN VẬN ĐANG ĐƯỢC CHỌN BÊN DƯỚI) */}
              {(() => {
                const dvCan = activeDaiVan?.can || "";
                const dvChi = activeDaiVan?.chi || "";
                const canData = CAN_MAP.get(dvCan);
                const chiData = CHI_MAP.get(dvChi);
                const matchedJiazi = getMatchedJiazi(dvCan, dvChi);
                const canTenGod = activeDaiVan?.canTenGod || getTenGod(dvCan, dayCan);
                const chiTenGod = activeDaiVan?.chiTenGod || getTenGod(dvChi, dayCan);

                return (
                  <div
                    className="flex flex-col border rounded-lg sm:rounded-2xl p-1 sm:p-3 sm:p-3.5 shadow-md transition-colors relative bg-[#1D140C] border-[#5A4026] hover:border-[#C9A55A]"
                  >
                    {/* Header Cột: Trụ Đại Vận */}
                    <div className="text-center pb-1 mb-1 sm:pb-2 sm:mb-2 border-b border-[#2C1E12]">
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-[9.5px] sm:text-sm font-bold text-[#D6B97A] font-serif whitespace-nowrap">
                          Trụ Đ.Vận
                        </span>
                      </div>
                      <div className="text-[7.5px] sm:text-[10px] text-[#A89882] font-mono mt-0.5 whitespace-nowrap truncate">
                        Vận {activeDaiVan?.step} ({activeDaiVan?.ageStart}-{activeDaiVan?.ageEnd}t)
                      </div>
                    </div>

                    {/* Ô TRÊN: THIÊN CAN ĐẠI VẬN */}
                    <div className="mb-1 sm:mb-2">
                      <div
                        onClick={() => {
                          const el = document.getElementById("daivan-section-anchor");
                          if (el) el.scrollIntoView({ behavior: "smooth" });
                        }}
                        title="Nhấp để xem 10 Bước Đại Vận bên dưới"
                        className="relative min-h-[38px] sm:min-h-[58px] sm:min-h-[66px] rounded-md sm:rounded-xl border flex flex-col items-center justify-center p-0.5 sm:p-2 text-center cursor-pointer transition-all duration-200 select-none bg-gradient-to-b from-[#2A1E14] to-[#1F1710] border-[#5E472D] hover:border-[#D6B97A] shadow-[0_2px_8px_rgba(0,0,0,0.4)] group"
                      >
                        {canData ? (
                          <div className="flex flex-col sm:flex-row items-center justify-center gap-0 sm:gap-1.5 sm:gap-2">
                            <span className="text-xs sm:text-2xl leading-none" title={canData.symbol}>
                              {canData.emoji}
                            </span>
                            <span className={`text-xs sm:text-2xl font-serif font-bold ${canData.colorText} leading-none mt-0.5 sm:mt-0`}>
                              {canData.name}
                            </span>
                            <span className="hidden md:inline text-xs sm:text-sm text-[#8C7D6B] font-serif">({canData.chinese})</span>
                          </div>
                        ) : (
                          <div className="text-[8px] sm:text-xs text-[#A89882]">Chưa có</div>
                        )}
                      </div>
                    </div>

                    {/* Mũi Tên Kết Nối Âm Dương: ⇅ */}
                    <div className="flex items-center justify-center my-0 sm:my-0.5 leading-none">
                      <span className="text-[8px] sm:text-[10px] text-[#6E5A44] font-mono">⇅</span>
                    </div>

                    {/* Ô DƯỚI: ĐỊA CHI ĐẠI VẬN */}
                    <div className="mb-1.5 sm:mb-3">
                      <div
                        onClick={() => {
                          const el = document.getElementById("daivan-section-anchor");
                          if (el) el.scrollIntoView({ behavior: "smooth" });
                        }}
                        title="Nhấp để xem 10 Bước Đại Vận bên dưới"
                        className="relative min-h-[38px] sm:min-h-[58px] sm:min-h-[66px] rounded-md sm:rounded-xl border flex flex-col items-center justify-center p-0.5 sm:p-2 text-center cursor-pointer transition-all duration-200 select-none bg-gradient-to-b from-[#261B12] to-[#1C140E] border-[#5E472D] hover:border-[#D6B97A] shadow-[0_2px_8px_rgba(0,0,0,0.4)] group"
                      >
                        {chiData ? (
                          <div className="flex flex-col sm:flex-row items-center justify-center gap-0 sm:gap-1.5 sm:gap-2">
                            <span className="text-xs sm:text-2xl leading-none">{chiData.emoji}</span>
                            <span className="text-xs sm:text-2xl font-serif font-bold text-[#F5EAD4] leading-none mt-0.5 sm:mt-0">
                              {chiData.name}
                            </span>
                            <span className="hidden md:inline text-xs sm:text-sm text-[#8C7D6B] font-serif">({chiData.chinese})</span>
                          </div>
                        ) : (
                          <div className="text-[8px] sm:text-xs text-[#A89882]">Chưa có</div>
                        )}
                      </div>
                    </div>

                    {/* HOA GIÁP KẾT QUẢ ĐẠI VẬN */}
                    <div className="mt-auto pt-1 sm:pt-2 border-t border-[#251D14]">
                      {matchedJiazi ? (
                        <div className="bg-[#24190F] border border-[#523A22] rounded-md sm:rounded-xl p-1 sm:p-2 flex flex-col gap-0.5 sm:gap-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[8px] sm:text-[10px] text-[#C9A55A] font-bold truncate">
                              #{matchedJiazi.order} {matchedJiazi.name}
                            </span>
                            <span className="hidden sm:inline text-[9px] px-1.5 py-0.2 rounded bg-[#17110B] text-amber-300 font-medium border border-amber-900/60 whitespace-nowrap">
                              Đại Vận
                            </span>
                          </div>
                          <div className="text-[7px] sm:text-[10px] text-[#C4B49F] truncate">
                            {matchedJiazi.elementNapAm}
                          </div>
                          {matchedJiazi.hexagramLink ? (
                            <div 
                              title={`Quẻ #${matchedJiazi.hexagramLink.hexagramNumber}: ${matchedJiazi.hexagramLink.hexagramName}`}
                              className="text-[7.5px] sm:text-[9px] text-[#A89882] flex items-center justify-center sm:justify-start gap-0.5 sm:gap-1 bg-[#17110B] px-0.5 sm:px-1.5 py-0.5 rounded border border-amber-900/60 overflow-hidden whitespace-nowrap"
                            >
                              <span className="text-amber-400 shrink-0 font-bold text-[7.5px] sm:text-xs">☯</span>
                              <span className="text-amber-200 font-serif whitespace-nowrap truncate font-semibold">
                                #{matchedJiazi.hexagramLink.hexagramNumber} {matchedJiazi.hexagramLink.hexagramName}
                              </span>
                            </div>
                          ) : (
                            <div className="text-[7.5px] sm:text-[9px] text-[#8C7D6B] flex items-center justify-between whitespace-nowrap truncate">
                              <span className="text-amber-400 font-medium">Vận {activeDaiVan?.step}</span>
                              <span className="text-[#A89882] hidden sm:inline">{activeDaiVan?.yearStart}-{activeDaiVan?.yearEnd}</span>
                            </div>
                          )}
                          {onSelectJiazi && (
                            <button
                              type="button"
                              onClick={() => onSelectJiazi(matchedJiazi.id)}
                              className="mt-0.5 sm:mt-1 w-full flex items-center justify-center gap-0.5 py-0.5 sm:py-1 text-[7.5px] sm:text-[10px] font-semibold text-[#18130E] bg-[#C9A55A] hover:bg-[#E5C158] rounded sm:rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                            >
                              <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                              <span className="hidden sm:inline">Xem #{matchedJiazi.order}</span>
                              <span className="sm:hidden">Xem</span>
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="bg-[#19130D] border border-dashed border-[#3D2E1C] rounded-md sm:rounded-xl p-1 sm:p-2 text-center">
                          <span className="text-[7.5px] sm:text-[10px] text-[#7A6A55] italic">Chưa xác định</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* TRỤ THỨ 6: TRỤ LƯU NIÊN (HIỆN LƯU NIÊN ĐANG ĐƯỢC CHỌN BÊN DƯỚI) */}
              {(() => {
                const lnCan = activeLuuNien?.can || "";
                const lnChi = activeLuuNien?.chi || "";
                const canData = CAN_MAP.get(lnCan);
                const chiData = CHI_MAP.get(lnChi);
                const matchedJiazi = getMatchedJiazi(lnCan, lnChi);
                const canTenGod = activeLuuNien?.canTenGod || getTenGod(lnCan, dayCan);
                const chiTenGod = getTenGod(lnChi, dayCan);

                return (
                  <div
                    className="flex flex-col border rounded-lg sm:rounded-2xl p-1 sm:p-3 sm:p-3.5 shadow-md transition-colors relative bg-[#131B15] border-[#294B34] hover:border-emerald-400"
                  >
                    {/* Header Cột: Trụ Lưu Niên */}
                    <div className="text-center pb-1 mb-1 sm:pb-2 sm:mb-2 border-b border-[#1E3626]">
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-[9.5px] sm:text-sm font-bold text-emerald-300 font-serif whitespace-nowrap">
                          Trụ L.Niên
                        </span>
                      </div>
                      <div className="text-[7.5px] sm:text-[10px] text-emerald-400/80 font-mono mt-0.5 whitespace-nowrap truncate">
                        {activeLuuNien?.year} ({activeLuuNien?.age}t)
                      </div>
                    </div>

                    {/* Ô TRÊN: THIÊN CAN LƯU NIÊN */}
                    <div className="mb-1 sm:mb-2">
                      <div
                        onClick={() => {
                          const el = document.getElementById("luunien-section-anchor");
                          if (el) el.scrollIntoView({ behavior: "smooth" });
                        }}
                        title="Nhấp để xem 10 Năm Lưu Niên bên dưới"
                        className="relative min-h-[38px] sm:min-h-[58px] sm:min-h-[66px] rounded-md sm:rounded-xl border flex flex-col items-center justify-center p-0.5 sm:p-2 text-center cursor-pointer transition-all duration-200 select-none bg-gradient-to-b from-[#18261E] to-[#121E17] border-[#2E513A] hover:border-emerald-400 shadow-[0_2px_8px_rgba(0,0,0,0.4)] group"
                      >
                        {canData ? (
                          <div className="flex flex-col sm:flex-row items-center justify-center gap-0 sm:gap-1.5 sm:gap-2">
                            <span className="text-xs sm:text-2xl leading-none" title={canData.symbol}>
                              {canData.emoji}
                            </span>
                            <span className={`text-xs sm:text-2xl font-serif font-bold ${canData.colorText} leading-none mt-0.5 sm:mt-0`}>
                              {canData.name}
                            </span>
                            <span className="hidden md:inline text-xs sm:text-sm text-emerald-400/70 font-serif">({canData.chinese})</span>
                          </div>
                        ) : (
                          <div className="text-[8px] sm:text-xs text-[#A89882]">Chưa có</div>
                        )}
                      </div>
                    </div>

                    {/* Mũi Tên Kết Nối Âm Dương: ⇅ */}
                    <div className="flex items-center justify-center my-0 sm:my-0.5 leading-none">
                      <span className="text-[8px] sm:text-[10px] text-[#4E7558] font-mono">⇅</span>
                    </div>

                    {/* Ô DƯỚI: ĐỊA CHI LƯU NIÊN */}
                    <div className="mb-1.5 sm:mb-3">
                      <div
                        onClick={() => {
                          const el = document.getElementById("luunien-section-anchor");
                          if (el) el.scrollIntoView({ behavior: "smooth" });
                        }}
                        title="Nhấp để xem 10 Năm Lưu Niên bên dưới"
                        className="relative min-h-[38px] sm:min-h-[58px] sm:min-h-[66px] rounded-md sm:rounded-xl border flex flex-col items-center justify-center p-0.5 sm:p-2 text-center cursor-pointer transition-all duration-200 select-none bg-gradient-to-b from-[#16241C] to-[#101C15] border-[#2E513A] hover:border-emerald-400 shadow-[0_2px_8px_rgba(0,0,0,0.4)] group"
                      >
                        {chiData ? (
                          <div className="flex flex-col sm:flex-row items-center justify-center gap-0 sm:gap-1.5 sm:gap-2">
                            <span className="text-xs sm:text-2xl leading-none">{chiData.emoji}</span>
                            <span className="text-xs sm:text-2xl font-serif font-bold text-[#F5EAD4] leading-none mt-0.5 sm:mt-0">
                              {chiData.name}
                            </span>
                            <span className="hidden md:inline text-xs sm:text-sm text-emerald-400/70 font-serif">({chiData.chinese})</span>
                          </div>
                        ) : (
                          <div className="text-[8px] sm:text-xs text-[#A89882]">Chưa có</div>
                        )}
                      </div>
                    </div>

                    {/* HOA GIÁP KẾT QUẢ LƯU NIÊN */}
                    <div className="mt-auto pt-1 sm:pt-2 border-t border-[#1C3022]">
                      {matchedJiazi ? (
                        <div className="bg-[#142218] border border-[#274831] rounded-md sm:rounded-xl p-1 sm:p-2 flex flex-col gap-0.5 sm:gap-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[8px] sm:text-[10px] text-emerald-300 font-bold truncate">
                              #{matchedJiazi.order} {matchedJiazi.name}
                            </span>
                            <span className="hidden sm:inline text-[9px] px-1.5 py-0.2 rounded bg-[#0D1811] text-emerald-300 font-medium border border-emerald-800/60 whitespace-nowrap">
                              Lưu Niên
                            </span>
                          </div>
                          <div className="text-[7px] sm:text-[10px] text-[#A6CDB3] truncate">
                            {matchedJiazi.elementNapAm}
                          </div>
                          {matchedJiazi.hexagramLink ? (
                            <div 
                              title={`Quẻ #${matchedJiazi.hexagramLink.hexagramNumber}: ${matchedJiazi.hexagramLink.hexagramName}`}
                              className="text-[7.5px] sm:text-[9px] text-[#A89882] flex items-center justify-center sm:justify-start gap-0.5 sm:gap-1 bg-[#0D1811] px-0.5 sm:px-1.5 py-0.5 rounded border border-emerald-900/60 overflow-hidden whitespace-nowrap"
                            >
                              <span className="text-emerald-400 shrink-0 font-bold text-[7.5px] sm:text-xs">☯</span>
                              <span className="text-emerald-200 font-serif whitespace-nowrap truncate font-semibold">
                                #{matchedJiazi.hexagramLink.hexagramNumber} {matchedJiazi.hexagramLink.hexagramName}
                              </span>
                            </div>
                          ) : (
                            <div className="text-[7.5px] sm:text-[9px] text-[#86AA92] flex items-center justify-between whitespace-nowrap truncate">
                              <span className="text-emerald-300 font-medium">{activeLuuNien?.age} tuổi</span>
                              <span className="text-emerald-400 font-medium">Năm {activeLuuNien?.year}</span>
                            </div>
                          )}
                          {onSelectJiazi && (
                            <button
                              type="button"
                              onClick={() => onSelectJiazi(matchedJiazi.id)}
                              className="mt-0.5 sm:mt-1 w-full flex items-center justify-center gap-0.5 py-0.5 sm:py-1 text-[7.5px] sm:text-[10px] font-semibold text-[#0E1B12] bg-emerald-400 hover:bg-emerald-300 rounded sm:rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                            >
                              <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                              <span className="hidden sm:inline">Xem #{matchedJiazi.order}</span>
                              <span className="sm:hidden">Xem</span>
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="bg-[#19130D] border border-dashed border-[#3D2E1C] rounded-md sm:rounded-xl p-1 sm:p-2 text-center">
                          <span className="text-[7.5px] sm:text-[10px] text-[#7A6A55] italic">Chưa xác định</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          </div>

          {/* =================================================================
              KHU VỰC CÁC THIÊN (GIA CẤU, KẾT CẤU, HÀNH VI, THỰC THI)
              - Có neo scroll thien-section-anchor để khi mở file ra là nhảy ra luôn!
              ================================================================= */}
          <div id="thien-section-anchor" className="scroll-mt-20 space-y-4">
            {/* 1. MỤC GIA CẤU THIÊN (架構篇) */}
            <div ref={giaCauContainerRef}>
              <BaziGiaCauThien
                pillars={pillars}
                onFillCurrentDateTime={handleCurrentDateTime}
                savedSettings={thienSettings.giaCau}
                onSaveToBazi={(data) => handleSaveThienToBazi("giaCau", data)}
                onCapture={() =>
                  handleCaptureElement(
                    giaCauContainerRef,
                    `Gia Cấu Thiên (${dayCan} ${dayChi})`,
                    `gia-cau-thien-${dayCan}-${dayChi}.png`,
                    "giaCau"
                  )
                }
              />
            </div>

            {/* 2. MỤC KẾT CẤU THIÊN (結構篇) */}
            <div ref={ketCauContainerRef}>
              <BaziKetCauThien
                pillars={pillars}
                activeLuuNien={activeLuuNien}
                savedSettings={thienSettings.ketCau}
                onSaveToBazi={(data) => handleSaveThienToBazi("ketCau", data)}
                onCapture={() =>
                  handleCaptureElement(
                    ketCauContainerRef,
                    `Kết Cấu Thiên (${dayCan} ${dayChi})`,
                    `ket-cau-thien-${dayCan}-${dayChi}.png`,
                    "ketCau"
                  )
                }
              />
            </div>

            {/* 2B. MỤC KẾT CẤU VẬN THIÊN (結構運篇) - VẬN HIỆN CHỌN */}
            <div ref={ketCauVanContainerRef}>
              <BaziKetCauVanThien
                pillars={pillars}
                activeDaiVan={activeDaiVan}
                activeLuuNien={activeLuuNien}
                savedSettings={thienSettings.ketCauVan}
                onSaveToBazi={(data) => handleSaveThienToBazi("ketCauVan", data)}
                onCapture={() =>
                  handleCaptureElement(
                    ketCauVanContainerRef,
                    `Kết Cấu Vận Thiên (${dayCan} ${dayChi} - ${activeDaiVan?.fullName || "Vận"})`,
                    `ket-cau-van-thien-${dayCan}-${dayChi}.png`,
                    "ketCauVan"
                  )
                }
              />
            </div>

            {/* 3. MỤC HÀNH VI THIÊN (行為篇) */}
            <div ref={hanhViContainerRef}>
              <BaziHanhViThien
                pillars={pillars}
                savedSettings={thienSettings.hanhVi}
                onSaveToBazi={(data) => handleSaveThienToBazi("hanhVi", data)}
                onCapture={() =>
                  handleCaptureElement(
                    hanhViContainerRef,
                    `Hành Vi Thiên (${dayCan} ${dayChi})`,
                    `hanh-vi-thien-${dayCan}-${dayChi}.png`,
                    "hanhVi"
                  )
                }
              />
            </div>

            {/* 4. MỤC THỰC THI THIÊN (實施篇) */}
            <div ref={thucThiContainerRef}>
              <BaziThucThiThien
                pillars={pillars}
                activeDaiVan={activeDaiVan}
                activeLuuNien={activeLuuNien}
                savedSettings={thienSettings.thucThi}
                onSaveToBazi={(data) => handleSaveThienToBazi("thucThi", data)}
                onCapture={() =>
                  handleCaptureElement(
                    thucThiContainerRef,
                    `Thực Thi Thiên (${dayCan} ${dayChi})`,
                    `thuc-thi-thien-${dayCan}-${dayChi}.png`,
                    "thucThi"
                  )
                }
                onDownload={() =>
                  handleCaptureElement(
                    thucThiContainerRef,
                    `Thực Thi Thiên (${dayCan} ${dayChi})`,
                    `thuc-thi-thien-${dayCan}-${dayChi}.png`,
                    "thucThi",
                    true
                  )
                }
                downloadButtonText="Tải Thực Thi Thiên"
                onSelectJiazi={onSelectJiazi}
              />
            </div>
          </div>

          <div id="daivan-section-anchor" className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#1C130A] to-[#150E07] border border-[#443220] scroll-mt-24">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#F5EAD4] font-serif tracking-wide flex items-center gap-2">
                  <Flame className="w-4.5 h-4.5 text-[#D6B97A]" />
                  <span>10 BƯỚC ĐẠI VẬN (MỖI BƯỚC 10 NĂM)</span>
                  <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-[#2E2012] text-[#C9A55A] border border-[#523A21]">
                    Khởi Vận: {startAge} tuổi
                  </span>
                </h3>
                <p className="text-xs text-[#A89882] mt-0.5">
                  Nhấp vào một Đại Vận để kích hoạt bảng 10 năm Lưu Niên và cập nhật Trụ Đại Vận phía trên.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsReversedOrder(!isReversedOrder)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#271C10] hover:bg-[#382817] text-[#D6B97A] border border-[#523A21] text-xs font-medium cursor-pointer transition-colors"
                  title="Đảo chiều sắp xếp từ trái qua phải"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>{isReversedOrder ? "Sắp xếp: Ngược (10 ➔ 1)" : "Sắp xếp: Xuôi (1 ➔ 10)"}</span>
                </button>

                <div className="text-xs text-[#D6B97A] flex items-center gap-1.5 bg-[#261A0E] px-3 py-1.5 rounded-lg border border-[#4A341E]">
                  <Shield className="w-3.5 h-3.5 text-[#C9A55A]" />
                  <span>
                    Đang chọn: <strong>{activeDaiVan?.fullName || "Chưa có"}</strong> {activeDaiVan ? `(${activeDaiVan.ageStart} - ${activeDaiVan.ageEnd} tuổi)` : ""}
                  </span>
                </div>
              </div>
            </div>

            {/* Grid 10 Card Đại Vận - Sắp xếp theo chiều được chọn (mặc định ngược 10 ➔ 1 từ trái qua phải) */}
            {displayedDaiVanList.length === 0 ? (
              <div className="py-6 px-4 text-center rounded-xl bg-[#16110B] border border-dashed border-[#3D2E1C] text-xs text-[#8C7D6B] space-y-1">
                <p className="text-[#C9A55A] font-semibold">Chưa có thông tin 10 Bước Đại Vận</p>
                <p>Vui lòng điền Can Chi cho Trụ Tháng hoặc bấm <strong className="text-[#E6D3A3]">&quot;Lấy Ngày Giờ Hiện Tại&quot;</strong> để an 10 Bước Đại Vận.</p>
              </div>
            ) : (
              <div className="overflow-x-auto pb-2.5 -mx-1 px-1 sm:mx-0 sm:px-0 scrollbar-thin">
                <div className="grid grid-cols-10 gap-1 sm:gap-2 min-w-[580px] lg:min-w-0">
                  {displayedDaiVanList.map((dv) => {
                const originalIdx = daiVanList.findIndex((item) => item.step === dv.step);
                const isSelected = originalIdx === activeDaiVanIndex;
                const canData = CAN_MAP.get(dv.can);
                const chiData = CHI_MAP.get(dv.chi);

                return (
                  <button
                    key={dv.step}
                    type="button"
                    onClick={() => {
                      if (originalIdx !== -1) setSelectedDaiVanIdx(originalIdx);
                      setSelectedLuuNienYear(dv.yearStart);
                      setNoticeMessage(`Đã chuyển tiêu điểm sang Đại Vận ${dv.fullName} (${dv.ageStart} - ${dv.ageEnd} tuổi)`);
                    }}
                    className={`p-1 sm:p-2 rounded-lg sm:rounded-xl border text-left transition-all duration-200 relative flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? "bg-gradient-to-b from-[#332212] via-[#2A1C0E] to-[#1E140A] border-[#C9A55A] shadow-lg shadow-[#C9A55A]/25 ring-2 ring-[#C9A55A]/50 scale-[1.02]"
                        : dv.isCurrent
                        ? "bg-[#251A0E] border-[#A88235] hover:border-[#C9A55A]"
                        : "bg-[#181109] border-[#382819] hover:border-[#593F27] hover:bg-[#20160C]"
                    }`}
                  >
                    {/* Header Cột: Vận, Tuổi, Thập Thần */}
                    <div className="text-center pb-1 mb-1 border-b border-[#2C1E12] w-full">
                      <div className="flex items-center justify-between text-[8.5px] sm:text-[10px] gap-0.5">
                        <span className="font-serif font-bold text-[#D6B97A]">Vận {dv.step}</span>
                        {dv.isCurrent ? (
                          <span className="px-1 py-0.2 rounded bg-amber-500 text-[#1A1208] text-[7.5px] font-bold animate-pulse">
                            Nay
                          </span>
                        ) : (
                          <span className="text-[8px] text-[#8C7D6B] font-mono">{dv.ageStart}-{dv.ageEnd}t</span>
                        )}
                      </div>
                      <div className="text-[8px] sm:text-[9px] text-[#A89882] flex items-center justify-between mt-0.5">
                        <span className="font-mono text-[7.5px] sm:text-[9px]">{dv.yearStart}</span>
                        <span className={`px-1 py-0.2 rounded text-[7.5px] font-semibold border ${dv.canTenGod.badgeBg}`}>
                          {dv.canTenGod.code}
                        </span>
                      </div>
                    </div>

                    {/* Ô TRÊN: THIÊN CAN */}
                    <div className="w-full mb-0.5 sm:mb-1">
                      <div
                        className={`rounded-md sm:rounded-lg border flex flex-col items-center justify-center py-1 px-0.5 text-center transition-all bg-gradient-to-b from-[#251D14] to-[#1C160F] ${
                          isSelected ? "border-[#C9A55A]/80 shadow-[0_2px_6px_rgba(0,0,0,0.5)]" : "border-[#4A3723]"
                        }`}
                      >
                        <div className="flex items-center justify-center gap-0.5">
                          <span className="text-xs sm:text-base">{canData?.emoji}</span>
                          <span className={`text-xs sm:text-base font-serif font-bold ${canData?.colorText || "text-[#F5EAD4]"}`}>
                            {dv.can}
                          </span>
                        </div>
                        <div className="text-[8.5px] text-[#8C7D6B] font-serif hidden sm:block">({canData?.chinese})</div>
                      </div>
                    </div>

                    {/* Mũi Tên Kết Nối Âm Dương: ⇅ */}
                    <div className="flex items-center justify-center my-0.2 text-[8px] text-[#6E5A44] font-mono select-none">
                      ⇅
                    </div>

                    {/* Ô DƯỚI: ĐỊA CHI */}
                    <div className="w-full mb-1 sm:mb-1.5">
                      <div
                        className={`rounded-md sm:rounded-lg border flex flex-col items-center justify-center py-1 px-0.5 text-center transition-all bg-gradient-to-b from-[#231A12] to-[#1A140E] ${
                          isSelected ? "border-[#C9A55A]/80 shadow-[0_2px_6px_rgba(0,0,0,0.5)]" : "border-[#4A3723]"
                        }`}
                      >
                        <div className="flex items-center justify-center gap-0.5">
                          <span className="text-xs sm:text-base">{chiData?.emoji}</span>
                          <span className="text-xs sm:text-base font-serif font-bold text-[#F5EAD4]">
                            {dv.chi}
                          </span>
                        </div>
                        <div className="text-[8.5px] text-[#8C7D6B] font-serif hidden sm:block">({chiData?.chinese})</div>
                      </div>
                    </div>

                    {/* Footer HOA GIÁP / NẠP ÂM */}
                    <div className="w-full mt-auto pt-0.5 border-t border-[#2C1E12] text-center">
                      <div className="text-[8px] sm:text-[9.5px] text-[#C4B49F] truncate" title={dv.napAm}>
                        {dv.napAm.split("(")[0]?.trim()}
                      </div>
                      <div className="text-[7.5px] text-[#8C7D6B] flex items-center justify-center gap-0.5 mt-0.5">
                        <span className={dv.chiTenGod.color}>[{dv.chiTenGod.code}]</span>
                      </div>
                    </div>
                  </button>
                );
              })}
              </div>
            </div>
            )}
          </div>

          {/* =================================================================
              KHU VỰC LƯU NIÊN (10 NĂM TRONG ĐẠI VẬN ĐANG CHỌN)
              ================================================================= */}
          <div id="luunien-section-anchor" className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#191108] to-[#120C06] border border-[#3E2C1A] scroll-mt-24">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#F5EAD4] font-serif tracking-wide flex items-center gap-2">
                  <Star className="w-4.5 h-4.5 text-emerald-400" />
                  <span>10 NĂM LƯU NIÊN {activeDaiVan ? `(THUỘC ĐẠI VẬN ${activeDaiVan.fullName})` : ""}</span>
                </h3>
                <p className="text-xs text-[#A89882] mt-0.5">
                  Chi tiết Can Chi, Nạp Âm, Thập Thần và tương tác Hợp/Xung/Hình/Hại của từng năm.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsReversedOrder(!isReversedOrder)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#271C10] hover:bg-[#382817] text-emerald-300 border border-emerald-900/60 text-xs font-medium cursor-pointer transition-colors"
                  title="Đảo chiều sắp xếp từ trái qua phải"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>{isReversedOrder ? "Sắp xếp: Ngược (10 ➔ 1)" : "Sắp xếp: Xuôi (1 ➔ 10)"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedLuuNienYear(currentRealYear);
                    const foundIdx = daiVanList.findIndex(
                      (dv) => currentRealYear >= dv.yearStart && currentRealYear <= dv.yearEnd
                    );
                    if (foundIdx !== -1) setSelectedDaiVanIdx(foundIdx);
                    setNoticeMessage(`Đã về Năm Lưu Niên thực tế: ${currentRealYear}`);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#271C10] hover:bg-[#382817] text-emerald-300 border border-emerald-900/60 text-xs font-medium cursor-pointer"
                >
                  <span>Về Năm Nay ({currentRealYear})</span>
                </button>
              </div>
            </div>

            {/* Grid 10 Card Lưu Niên - Sắp xếp theo chiều được chọn (mặc định ngược 10 ➔ 1 từ trái qua phải) */}
            {displayedLuuNienList.length === 0 ? (
              <div className="py-6 px-4 text-center rounded-xl bg-[#16110B] border border-dashed border-[#3D2E1C] text-xs text-[#8C7D6B] space-y-1">
                <p className="text-emerald-400 font-semibold">Chưa có thông tin 10 Năm Lưu Niên</p>
                <p>Vui lòng an Đại Vận để xem chi tiết 10 năm Lưu Niên tương ứng.</p>
              </div>
            ) : (
            <div className="overflow-x-auto pb-2.5 -mx-1 px-1 sm:mx-0 sm:px-0 scrollbar-thin">
              <div className="grid grid-cols-10 gap-1 sm:gap-2 min-w-[580px] lg:min-w-0">
                {displayedLuuNienList.map((ln) => {
                const isSelected = ln.year === selectedLuuNienYear;
                const canData = CAN_MAP.get(ln.can);
                const chiData = CHI_MAP.get(ln.chi);
                const chiTenGod = getTenGod(ln.chi, dayCan);
                const hasInteractions =
                  ln.interactions.withDayChi.length > 0 || ln.interactions.withDaiVanChi.length > 0;

                return (
                  <button
                    key={ln.year}
                    type="button"
                    onClick={() => {
                      setSelectedLuuNienYear(ln.year);
                      setNoticeMessage(`Đã chọn Lưu Niên năm ${ln.year} (${ln.fullName})`);
                    }}
                    className={`p-1 sm:p-2 rounded-lg sm:rounded-xl border text-left transition-all duration-200 relative flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? "bg-gradient-to-b from-emerald-950/80 via-[#1F1910] to-[#150F08] border-emerald-400 shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-500/50 scale-[1.02]"
                        : ln.isRealCurrentYear
                        ? "bg-[#21180D] border-amber-600/70 hover:border-amber-400"
                        : "bg-[#150F09] border-[#312214] hover:border-[#4E3722] hover:bg-[#1D140C]"
                    }`}
                  >
                    {/* Header: Năm, Tuổi, Năm Nay, Thập Thần Can */}
                    <div className="text-center pb-1 mb-1 border-b border-[#2C1E12] w-full">
                      <div className="flex items-center justify-between text-[8.5px] sm:text-[10px] gap-0.5">
                        <span className="font-serif font-bold text-[#D6B97A]">{ln.year}</span>
                        {ln.isRealCurrentYear ? (
                          <span className="px-1 py-0.2 rounded bg-amber-500 text-[#1A1208] text-[7.5px] font-bold">
                            Nay
                          </span>
                        ) : (
                          <span className="text-[8px] text-[#8C7D6B] font-mono">{ln.age}t</span>
                        )}
                      </div>
                      <div className="text-[8px] sm:text-[9px] text-[#A89882] flex items-center justify-between mt-0.5">
                        <span className="text-[#8C7D6B] text-[7.5px] sm:text-[9px]">{ln.age}t</span>
                        <span className={`px-1 py-0.2 rounded text-[7.5px] font-semibold border ${ln.canTenGod.badgeBg}`}>
                          {ln.canTenGod.code}
                        </span>
                      </div>
                    </div>

                    {/* Ô TRÊN: THIÊN CAN */}
                    <div className="w-full mb-0.5 sm:mb-1">
                      <div
                        className={`rounded-md sm:rounded-lg border flex flex-col items-center justify-center py-1 px-0.5 text-center transition-all bg-gradient-to-b from-[#251D14] to-[#1C160F] ${
                          isSelected ? "border-emerald-400/80 shadow-[0_2px_6px_rgba(0,0,0,0.5)]" : "border-[#4A3723]"
                        }`}
                      >
                        <div className="flex items-center justify-center gap-0.5">
                          <span className="text-xs sm:text-base">{canData?.emoji}</span>
                          <span className={`text-xs sm:text-base font-serif font-bold ${canData?.colorText || "text-[#F5EAD4]"}`}>
                            {ln.can}
                          </span>
                        </div>
                        <div className="text-[8.5px] text-[#8C7D6B] font-serif hidden sm:block">({canData?.chinese})</div>
                      </div>
                    </div>

                    {/* Mũi Tên Kết Nối Âm Dương: ⇅ */}
                    <div className="flex items-center justify-center my-0.2 text-[8px] text-[#6E5A44] font-mono select-none">
                      ⇅
                    </div>

                    {/* Ô DƯỚI: ĐỊA CHI */}
                    <div className="w-full mb-1 sm:mb-1.5">
                      <div
                        className={`rounded-md sm:rounded-lg border flex flex-col items-center justify-center py-1 px-0.5 text-center transition-all bg-gradient-to-b from-[#231A12] to-[#1A140E] ${
                          isSelected ? "border-emerald-400/80 shadow-[0_2px_6px_rgba(0,0,0,0.5)]" : "border-[#4A3723]"
                        }`}
                      >
                        <div className="flex items-center justify-center gap-0.5">
                          <span className="text-xs sm:text-base">{chiData?.emoji}</span>
                          <span className="text-xs sm:text-base font-serif font-bold text-[#F5EAD4]">
                            {ln.chi}
                          </span>
                        </div>
                        <div className="text-[8.5px] text-[#8C7D6B] font-serif hidden sm:block">({chiData?.chinese})</div>
                      </div>
                    </div>

                    {/* Footer: TƯƠNG TÁC HOẶC NẠP ÂM */}
                    <div className="w-full mt-auto pt-0.5 border-t border-[#2C1E12] text-center">
                      {hasInteractions ? (
                        <div className="text-[8px] sm:text-[9px] text-amber-300 font-semibold truncate block" title={ln.interactions.withDayChi[0] || ln.interactions.withDaiVanChi[0]}>
                          {ln.interactions.withDayChi[0] || ln.interactions.withDaiVanChi[0]}
                        </div>
                      ) : (
                        <div className="text-[8px] sm:text-[9px] text-[#A89882] truncate block" title={ln.napAm}>
                          {ln.napAm.split("(")[0]?.trim() || "Bình hòa"}
                        </div>
                      )}
                      <div className="text-[8.5px] text-[#8C7D6B] flex items-center justify-center gap-1 mt-0.5">
                        <span className={chiTenGod.color}>[{chiTenGod.code} • {chiTenGod.name}]</span>
                      </div>
                    </div>
                  </button>
                );
              })}
              </div>
            </div>
            )}

            {/* KHUNG PHÂN TÍCH CHI TIẾT LƯU NIÊN ĐANG CHỌN */}
            {activeLuuNien && (
              <div className="mt-4 p-4 rounded-xl bg-[#1A120B] border border-[#44301D] text-xs">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-[#312213]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-bold border border-emerald-800">
                      Lưu Niên {activeLuuNien.year} • {activeLuuNien.fullName} ({activeLuuNien.age} tuổi)
                    </span>
                    <span className="text-[#A89882]">
                      Nạp Âm: <strong className="text-[#F5EAD4]">{activeLuuNien.napAm || "—"}</strong>
                    </span>
                  </div>
                  <div className="text-[#D6B97A] font-semibold">
                    Thập Thần: <span className={activeLuuNien.canTenGod.color}>{activeLuuNien.canTenGod.name}</span> ({activeLuuNien.canTenGod.aspect})
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3">
                  <div className="p-2.5 rounded-lg bg-[#20160C] border border-[#3A2716]">
                    <div className="font-semibold text-[#F5EAD4] mb-1 flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-rose-400" />
                      <span>Với Trụ Ngày (Bản thân / Hôn nhân):</span>
                    </div>
                    <div className="text-[11px] text-[#A89882]">
                      {activeLuuNien.interactions.withDayChi.length > 0 ? (
                        <span className="text-amber-400 font-medium">
                          {activeLuuNien.interactions.withDayChi.join(" • ")}
                        </span>
                      ) : (
                        <span>Khí thế tương hòa, không phạm xung khắc trực tiếp.</span>
                      )}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#20160C] border border-[#3A2716]">
                    <div className="font-semibold text-[#F5EAD4] mb-1 flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      <span>Với Đại Vận {activeDaiVan?.fullName}:</span>
                    </div>
                    <div className="text-[11px] text-[#A89882]">
                      {activeLuuNien.interactions.withDaiVanChi.length > 0 ? (
                        <span className="text-amber-400 font-medium">
                          {activeLuuNien.interactions.withDaiVanChi.join(" • ")}
                        </span>
                      ) : (
                        <span>Đồng điệu vận khí, trợ lực cho kế hoạch dài hạn.</span>
                      )}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#20160C] border border-[#3A2716]">
                    <div className="font-semibold text-[#F5EAD4] mb-1 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                      <span>Định hướng Vận Khí năm {activeLuuNien.year}:</span>
                    </div>
                    <div className="text-[11px] text-[#A89882]">
                      {activeLuuNien.canTenGod.desc}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL SELECTION CHO Ô (THIÊN CAN HOẶC ĐỊA CHI)
          GIỐNG Y CHANG BẢNG BÊN DƯỚI
          ======================================================== */}
      {activeSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#19140F] border border-[#483724] rounded-2xl p-5 sm:p-6 shadow-2xl text-[#F5EAD4] animate-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-[#2C2114] pb-3 mb-4">
              <div>
                <div className="text-xs text-[#8C7D6B] uppercase font-bold tracking-wider">
                  {PILLAR_LABELS[activeSlot.colIndex].title} ({PILLAR_LABELS[activeSlot.colIndex].sub})
                </div>
                <h3 className="text-base sm:text-lg font-serif font-bold text-[#D6B97A]">
                  {activeSlot.type === "can" ? "CHỌN THIÊN CAN (Ô TRÊN)" : "CHỌN ĐỊA CHI (Ô DƯỚI)"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveSlot(null)}
                className="p-1.5 rounded-lg bg-[#251D14] hover:bg-[#34281D] text-[#8C7D6B] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SELECTION BODY CHO THIÊN CAN */}
            {activeSlot.type === "can" && (
              <div className="space-y-4">
                <p className="text-xs text-[#B3A28C]">
                  Nhấp chọn 1 trong 10 Thiên Can. Khi chọn Can Âm (Ất, Đinh, Kỷ, Tân, Quý), ô Địa Chi tương ứng bên dưới sẽ chỉ cho phép chọn Địa Chi Âm.
                </p>

                {/* Nhóm Can Dương */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-yellow-400 mb-2">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                      5 THIÊN CAN DƯƠNG (+)
                    </span>
                    <span className="text-[10px] text-[#A89882] font-normal">Phối với Chi Dương</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {CAN_LIST.filter((c) => c.polarity === "duong").map((item) => {
                      const isSelected = pillars[activeSlot.colIndex].can === item.name;
                      return (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => handleSelectCan(activeSlot.colIndex, item.name)}
                          className={`p-2 sm:p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#C9A55A] text-[#12100E] border-[#E5C158] font-bold shadow-md scale-105"
                              : "bg-[#221A12] hover:bg-[#2F2418] text-[#F3E7D0] border-[#3E2E1C] hover:border-yellow-500/60"
                          }`}
                        >
                          <span className="text-xl sm:text-2xl mb-1">{item.emoji}</span>
                          <span className="text-base sm:text-lg font-serif font-bold">{item.name}</span>
                          <span className="text-[11px] text-[#A89882]">{item.chinese}</span>
                          <span className="text-[9px] mt-1 text-[#CDBFA8] text-center line-clamp-1">
                            {item.symbol}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Nhóm Can Âm */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-amber-400 mb-2">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      5 THIÊN CAN ÂM (-)
                    </span>
                    <span className="text-[10px] text-[#A89882] font-normal">Phối với Chi Âm</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {CAN_LIST.filter((c) => c.polarity === "am").map((item) => {
                      const isSelected = pillars[activeSlot.colIndex].can === item.name;
                      return (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => handleSelectCan(activeSlot.colIndex, item.name)}
                          className={`p-2 sm:p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#C9A55A] text-[#12100E] border-[#E5C158] font-bold shadow-md scale-105"
                              : "bg-[#221A12] hover:bg-[#2F2418] text-[#F3E7D0] border-[#3E2E1C] hover:border-amber-500/60"
                          }`}
                        >
                          <span className="text-xl sm:text-2xl mb-1">{item.emoji}</span>
                          <span className="text-base sm:text-lg font-serif font-bold">{item.name}</span>
                          <span className="text-[11px] text-[#A89882]">{item.chinese}</span>
                          <span className="text-[9px] mt-1 text-[#CDBFA8] text-center line-clamp-1">
                            {item.symbol}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* SELECTION BODY CHO ĐỊA CHI */}
            {activeSlot.type === "chi" && (() => {
              const currentCan = pillars[activeSlot.colIndex].can;
              const canData = CAN_MAP.get(currentCan);
              const allowedPolarity = canData ? canData.polarity : null;

              return (
                <div className="space-y-4">
                  <div className="text-xs bg-[#24190E] p-2.5 rounded-xl border border-[#48331E] flex items-center justify-between">
                    <span>
                      Thiên Can hiện tại: <strong className="text-[#D6B97A]">{currentCan || "(Chưa chọn)"}</strong>
                    </span>
                    {allowedPolarity && (
                      <span className="text-[11px] font-bold text-amber-300">
                        Chỉ chọn {allowedPolarity === "am" ? "6 Địa Chi Âm (-)" : "6 Địa Chi Dương (+)"}
                      </span>
                    )}
                  </div>

                  {/* Nhóm Chi Dương */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-yellow-400 mb-2">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                        6 ĐỊA CHI DƯƠNG (+)
                      </span>
                      <span className="text-[10px] text-[#A89882] font-normal">
                        Đi với Can Giáp, Bính, Mậu, Canh, Nhâm
                      </span>
                    </div>
                    <div className="grid grid-cols-6 gap-2">
                      {CHI_LIST.filter((c) => c.polarity === "duong").map((item) => {
                        const isSelected = pillars[activeSlot.colIndex].chi === item.name;
                        const isBlocked = allowedPolarity === "am";
                        return (
                          <button
                            key={item.name}
                            type="button"
                            disabled={isBlocked}
                            onClick={() => handleSelectChi(activeSlot.colIndex, item.name)}
                            className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                              isBlocked
                                ? "opacity-30 cursor-not-allowed bg-[#18130E] border-[#2A1F14] text-[#6E5A44]"
                                : isSelected
                                ? "bg-[#C9A55A] text-[#12100E] border-[#E5C158] font-bold shadow-md scale-105 cursor-pointer"
                                : "bg-[#221A12] hover:bg-[#2F2418] text-[#F3E7D0] border-[#3E2E1C] hover:border-yellow-500/60 cursor-pointer"
                            }`}
                            title={isBlocked ? "Không thể chọn do Can là Can Âm" : item.zodiac}
                          >
                            <span className="text-xl sm:text-2xl mb-1">{item.emoji}</span>
                            <span className="text-base sm:text-lg font-serif font-bold">{item.name}</span>
                            <span className="text-[11px] text-[#A89882]">{item.chinese}</span>
                            <span className="text-[9px] mt-1 text-[#CDBFA8] text-center">{item.zodiac}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Nhóm Chi Âm */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-amber-400 mb-2">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                        6 ĐỊA CHI ÂM (-)
                      </span>
                      <span className="text-[10px] text-[#A89882] font-normal">
                        Đi với Can Ất, Đinh, Kỷ, Tân, Quý
                      </span>
                    </div>
                    <div className="grid grid-cols-6 gap-2">
                      {CHI_LIST.filter((c) => c.polarity === "am").map((item) => {
                        const isSelected = pillars[activeSlot.colIndex].chi === item.name;
                        const isBlocked = allowedPolarity === "duong";
                        return (
                          <button
                            key={item.name}
                            type="button"
                            disabled={isBlocked}
                            onClick={() => handleSelectChi(activeSlot.colIndex, item.name)}
                            className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                              isBlocked
                                ? "opacity-30 cursor-not-allowed bg-[#18130E] border-[#2A1F14] text-[#6E5A44]"
                                : isSelected
                                ? "bg-[#C9A55A] text-[#12100E] border-[#E5C158] font-bold shadow-md scale-105 cursor-pointer"
                                : "bg-[#221A12] hover:bg-[#2F2418] text-[#F3E7D0] border-[#3E2E1C] hover:border-amber-500/60 cursor-pointer"
                            }`}
                            title={isBlocked ? "Không thể chọn do Can là Can Dương" : item.zodiac}
                          >
                            <span className="text-xl sm:text-2xl mb-1">{item.emoji}</span>
                            <span className="text-base sm:text-lg font-serif font-bold">{item.name}</span>
                            <span className="text-[11px] text-[#A89882]">{item.chinese}</span>
                            <span className="text-[9px] mt-1 text-[#CDBFA8] text-center">{item.zodiac}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: LƯU LÁ SỐ BÁT TỰ MỚI
          ======================================================== */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl bg-[#1A120A] border-2 border-[#C9A55A] p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#3B2917]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#332211] text-[#D6B97A] flex items-center justify-center">
                  <Save className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-[#F5EAD4] font-serif">
                    LƯU HỒ SƠ LÁ SỐ BÁT TỰ
                  </h4>
                  <p className="text-[11px] text-[#8C7D6B]">Lưu lại toàn bộ 8 ô Can Chi, Đại Vận và Lưu Niên</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSaveModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-[#2B1D10] text-[#A89882] hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* LỰA CHỌN CHẾ ĐỘ: LƯU MỚI HOẶC GHI ĐÈ */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#140E08] border border-[#3E2C1A]">
              <button
                type="button"
                onClick={() => setSaveMode("create_new")}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  saveMode === "create_new"
                    ? "bg-[#C9A55A] text-[#1A1208] shadow-md shadow-[#C9A55A]/20"
                    : "text-[#A89882] hover:text-[#F5EAD4] hover:bg-[#22160C]"
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Lưu Hồ Sơ Mới</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSaveMode("overwrite");
                  if (!overwriteTargetId && savedProfiles.length > 0) {
                    setOverwriteTargetId(savedProfiles[0].id);
                    const target = savedProfiles[0];
                    setSaveTitle(target.title);
                    setSaveFullName(target.fullName || "");
                    setSaveNotes(target.notes || "");
                  }
                }}
                disabled={savedProfiles.length === 0}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  savedProfiles.length === 0
                    ? "opacity-40 cursor-not-allowed text-[#665544]"
                    : saveMode === "overwrite"
                    ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                    : "text-[#A89882] hover:text-[#F5EAD4] hover:bg-[#22160C]"
                }`}
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Chế Độ Ghi Đè ({savedProfiles.length})</span>
              </button>
            </div>

            {/* NẾU CHỌN GHI ĐÈ: CHỌN HỒ SƠ CẦN GHI ĐÈ */}
            {saveMode === "overwrite" && (
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-600/60 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-amber-300 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Chọn hồ sơ để ghi đè dữ liệu:</span>
                  </span>
                  <span className="text-[10px] text-amber-400/90 font-mono">
                    (Cập nhật Bát Tự & 4 Thiên)
                  </span>
                </div>
                <select
                  value={overwriteTargetId || ""}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    setOverwriteTargetId(selectedId);
                    const target = savedProfiles.find((p) => p.id === selectedId);
                    if (target) {
                      setSaveTitle(target.title);
                      setSaveFullName(target.fullName || "");
                      setSaveNotes(target.notes || "");
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-[#24170E] border border-[#523A22] text-[#F5EAD4] focus:outline-none focus:border-amber-400 font-medium text-xs cursor-pointer"
                >
                  {savedProfiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} {p.fullName ? `(${p.fullName})` : ""} • {p.pillars.map((pi) => `${pi.can || "?"} ${pi.chi || "?"}`).join(" ")} [{p.savedAt}]
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#A89882] mb-1 font-medium">Tiêu đề lá số *</label>
                <input
                  type="text"
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  placeholder="Ví dụ: Lá số Bát Tự - Anh Minh (Giáp Tý)"
                  className="w-full px-3 py-2 rounded-xl bg-[#23170D] border border-[#48331E] text-[#F5EAD4] focus:outline-none focus:border-[#C9A55A]"
                />
              </div>

              <div>
                <label className="block text-[#A89882] mb-1 font-medium">Họ và tên đương số (Tùy chọn)</label>
                <input
                  type="text"
                  value={saveFullName}
                  onChange={(e) => setSaveFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="w-full px-3 py-2 rounded-xl bg-[#23170D] border border-[#48331E] text-[#F5EAD4] focus:outline-none focus:border-[#C9A55A]"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#21160C] border border-[#3E2C1A] space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between text-[#8C7D6A]">
                  <span>Giới tính & Khởi vận:</span>
                  <span className="font-semibold text-[#F5EAD4]">
                    {gender === "nam" ? "Nam mệnh (Càn tạo)" : "Nữ mệnh (Khôn tạo)"} • Khởi vận {startAge} tuổi
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#8C7D6A]">
                  <span>Bốn Trụ Bát Tự:</span>
                  <span className="font-serif font-bold text-[#C9A55A]">
                    {pillars.map((p) => `${p.can || "?"} ${p.chi || "?"}`).join("  •  ")}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[#A89882] mb-1 font-medium">Ghi chú luận giải / Chiêm đoán</label>
                <textarea
                  rows={3}
                  value={saveNotes}
                  onChange={(e) => setSaveNotes(e.target.value)}
                  placeholder="Nhập ghi chú về dụng thần, hỷ kỵ thần hoặc mục tiêu theo dõi..."
                  className="w-full px-3 py-2 rounded-xl bg-[#23170D] border border-[#48331E] text-[#F5EAD4] focus:outline-none focus:border-[#C9A55A] resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#3B2917]">
              <button
                type="button"
                onClick={() => setIsSaveModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#24190F] hover:bg-[#332315] text-[#A89882] text-xs font-medium cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                className={`px-4 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer hover:brightness-110 active:scale-95 flex items-center gap-1.5 ${
                  saveMode === "overwrite"
                    ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-amber-700/30"
                    : "bg-gradient-to-r from-[#C9A55A] to-[#B8860B] text-[#1A1208] shadow-[#C9A55A]/20"
                }`}
              >
                {saveMode === "overwrite" ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Xác Nhận Ghi Đè</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Xác Nhận Lưu Mới</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: DANH SÁCH LÁ SỐ BÁT TỰ ĐÃ LƯU
          ======================================================== */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          {/* Input file ẩn để mở file .json */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportJson}
            accept=".json"
            className="hidden"
          />

          <div className="w-full max-w-2xl max-h-[85vh] rounded-2xl bg-[#18110A] border-2 border-[#5E442B] p-5 sm:p-6 shadow-2xl flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#3B2917] gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-[#D6B97A]" />
                <h4 className="text-sm sm:text-base font-bold text-[#F5EAD4] font-serif">
                  DANH SÁCH HỒ SƠ LÁ SỐ BÁT TỰ ĐÃ LƯU ({savedProfiles.length})
                </h4>
              </div>

              <div className="flex items-center gap-2">
                {/* Nút Mở File .json từ máy tính */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#2E1F11] hover:bg-[#3D2916] text-amber-200 border border-amber-600/60 shadow-sm cursor-pointer transition-all active:scale-95"
                  title="Mở file lá số .json từ máy tính (nhảy ra luôn thiết lập các Thiên)"
                >
                  <FileUp className="w-3.5 h-3.5 text-amber-400" />
                  <span>Mở File (.json)</span>
                </button>

                {/* Nút Xuất File .json */}
                <button
                  type="button"
                  onClick={() => handleExportJson()}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#22170E] hover:bg-[#312013] text-[#A89882] hover:text-[#F5EAD4] border border-[#44301D] cursor-pointer transition-all active:scale-95"
                  title="Tải file .json lá số hiện tại kèm các Thiên về máy"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Xuất File</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsHistoryModalOpen(false)}
                  className="w-7 h-7 rounded-lg bg-[#2B1D10] text-[#A89882] hover:text-white flex items-center justify-center cursor-pointer ml-1"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="my-4 overflow-y-auto pr-1 space-y-3 grow">
              {savedProfiles.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#8C7D6A] space-y-2">
                  <Bookmark className="w-8 h-8 mx-auto text-[#4D3823] opacity-60" />
                  <p>Chưa có hồ sơ Bát Tự nào được lưu.</p>
                  <p className="text-[11px] text-[#695540]">
                    Hãy nhấp nút "Lưu Bát Tự" hoặc "Lưu Vào Bát Tự" ở từng Thiên để lưu lá số đầu tiên của bạn!
                  </p>
                </div>
              ) : (
                savedProfiles.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleLoadProfile(p)}
                    className="p-3.5 rounded-xl bg-[#21160D] border border-[#3E2B1A] hover:border-[#C9A55A] transition-all cursor-pointer group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-serif font-bold text-[#F5EAD4] group-hover:text-[#D6B97A] transition-colors">
                          {p.title}
                        </span>
                        {p.fullName && <span className="text-xs text-[#A89882]">({p.fullName})</span>}
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                            p.gender === "nam" ? "bg-blue-950 text-blue-300" : "bg-rose-950 text-rose-300"
                          }`}
                        >
                          {p.gender === "nam" ? "Nam" : "Nữ"}
                        </span>
                        {p.thienSettings && (
                          <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-700/60 font-medium">
                            ✨ Kèm 4 Thiên
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-serif text-[#C9A55A]">
                        {p.pillars.map((item) => `${item.can || "?"} ${item.chi || "?"}`).join("  •  ")}
                      </div>
                      <div className="text-[10px] text-[#8C7D6B]">
                        Năm sinh: {p.birthYear} • Lưu lúc: {p.savedAt}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLoadProfile(p);
                        }}
                        className="px-3 py-1 rounded-lg bg-[#332212] group-hover:bg-[#C9A55A] group-hover:text-[#1A1208] text-[#D6B97A] text-xs font-semibold transition-all cursor-pointer"
                        title="Nạp lá số và nhảy ra luôn thiết lập các Thiên"
                      >
                        Nạp Lá Số
                      </button>
                      {overwritingProfileId === p.id ? (
                        <div className="flex items-center gap-1.5 bg-amber-950/90 border border-amber-600 px-2 py-1 rounded-lg animate-in fade-in">
                          <span className="text-[11px] text-amber-200 font-semibold whitespace-nowrap">Ghi đè?</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const nextList = savedProfiles.map((item) => {
                                if (item.id === p.id) {
                                  return {
                                    ...item,
                                    gender,
                                    birthYear,
                                    pillars: [pillars[0], pillars[1], pillars[2], pillars[3]] as [PillarItem, PillarItem, PillarItem, PillarItem],
                                    startAge,
                                    savedAt: new Date().toLocaleString("vi-VN") + " (Đã ghi đè)",
                                    timestamp: Date.now(),
                                    thienSettings,
                                  };
                                }
                                return item;
                              });
                              saveProfilesToStorage(nextList);
                              setCurrentLoadedProfileId(p.id);
                              setOverwritingProfileId(null);
                              setNoticeMessage(`Đã ghi đè thành công vào hồ sơ "${p.title}"!`);
                            }}
                            className="px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-stone-950 text-[11px] font-bold cursor-pointer"
                          >
                            Đồng ý
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOverwritingProfileId(null);
                            }}
                            className="px-2 py-0.5 rounded bg-[#332212] hover:bg-[#44301D] text-[#D1C2A5] text-[11px] cursor-pointer"
                          >
                            Hủy
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOverwritingProfileId(p.id);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#27180D] hover:bg-amber-800 text-amber-300 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 border border-amber-700/60"
                          title="Ghi đè Bát Tự & 4 Thiên hiện tại vào hồ sơ này"
                        >
                          <RotateCw className="w-3 h-3 text-amber-400" />
                          <span>Ghi Đè</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExportJson(p);
                        }}
                        className="p-1.5 rounded-lg bg-[#2B1D10] hover:bg-[#3D2916] text-[#C9A55A] transition-all cursor-pointer"
                        title="Tải file .json của lá số này về máy"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                      </button>
                      {deletingProfileId === p.id ? (
                        <div className="flex items-center gap-1.5 bg-red-950/90 border border-red-600 px-2 py-1 rounded-lg animate-in fade-in">
                          <span className="text-[11px] text-red-200 font-semibold whitespace-nowrap">Xác nhận xóa?</span>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteProfile(p.id, e)}
                            className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold cursor-pointer flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Xóa</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingProfileId(null);
                            }}
                            className="px-2 py-0.5 rounded bg-[#332212] hover:bg-[#44301D] text-[#D1C2A5] text-[11px] cursor-pointer"
                          >
                            Hủy
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingProfileId(p.id);
                          }}
                          className="p-1.5 rounded-lg bg-[#29170E] hover:bg-rose-900 text-[#8C7D6B] hover:text-white transition-all cursor-pointer"
                          title="Xóa lá số này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-[#3B2917] flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-[#8C7D6B]">
                  Tổng cộng: {savedProfiles.length} hồ sơ Bát Tự
                </span>
                {savedProfiles.length > 0 && (
                  isClearingAllProfiles ? (
                    <div className="flex items-center gap-1.5 bg-red-950/90 border border-red-700 px-2 py-1 rounded-lg">
                      <span className="text-[11px] text-red-200 font-medium">Xóa toàn bộ hồ sơ đã lưu?</span>
                      <button
                        type="button"
                        onClick={handleClearAllProfiles}
                        className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold cursor-pointer"
                      >
                        Xác nhận xóa hết
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsClearingAllProfiles(false)}
                        className="px-2 py-0.5 rounded bg-[#332212] hover:bg-[#44301D] text-[#D1C2A5] text-[11px] cursor-pointer"
                      >
                        Hủy
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsClearingAllProfiles(true)}
                      className="text-[11px] text-red-400 hover:text-red-300 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Xóa tất cả</span>
                    </button>
                  )
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsHistoryModalOpen(false);
                  setDeletingProfileId(null);
                  setOverwritingProfileId(null);
                  setIsClearingAllProfiles(false);
                }}
                className="px-4 py-1.5 rounded-xl bg-[#281C11] hover:bg-[#382717] text-[#D1C2A5] font-medium cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XUẤT ẢNH BÁT TỰ & CÁC THIÊN */}
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
