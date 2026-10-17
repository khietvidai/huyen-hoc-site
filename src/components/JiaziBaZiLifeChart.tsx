import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Sparkles,
  Compass,
  Calendar,
  Clock,
  User,
  Bookmark,
  BookmarkCheck,
  History,
  Save,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Trash2,
  Search,
  FileDown,
  X,
  ArrowRight,
  ArrowDown,
  Layers,
  Star,
  Sun,
  Moon,
  Crown,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Info,
  ShieldCheck,
  FileText,
  Flame,
} from "lucide-react";
import {
  CAN_LIST,
  CHI_LIST,
  PillarItem,
} from "../data/baziConstants";
import { SIXTY_JIAZI, JiaziEnrichedEntry } from "../data/jiazi";

export interface SavedBaZiChart {
  id: string;
  title: string;
  gender: "nam" | "nu";
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number;
  startLuckAge: number;
  pillars: {
    year: { can: string; chi: string };
    month: { can: string; chi: string };
    day: { can: string; chi: string };
    hour: { can: string; chi: string };
  };
  notes?: string;
  timestamp: number;
  formattedDate: string;
}

export interface JiaziBaZiLifeChartProps {
  onSyncToEightPillars?: (pillars: [PillarItem, PillarItem, PillarItem, PillarItem]) => void;
  className?: string;
}

const CAN_NAMES = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
const CHI_NAMES = [
  "Tý",
  "Sửu",
  "Dần",
  "Mão",
  "Thìn",
  "Tỵ",
  "Ngọ",
  "Mùi",
  "Thân",
  "Dậu",
  "Tuất",
  "Hợi",
];

// Chi tiết Ngũ Hành & Âm Dương của Thiên Can
const CAN_DETAILS: Record<string, { el: "Mộc" | "Hỏa" | "Thổ" | "Kim" | "Thủy"; pol: "Dương" | "Âm"; chinese: string; color: string; bg: string }> = {
  Giáp: { el: "Mộc", pol: "Dương", chinese: "甲", color: "text-emerald-400", bg: "bg-emerald-950/80 border-emerald-700/60" },
  Ất: { el: "Mộc", pol: "Âm", chinese: "乙", color: "text-green-400", bg: "bg-green-950/80 border-green-700/60" },
  Bính: { el: "Hỏa", pol: "Dương", chinese: "丙", color: "text-red-400", bg: "bg-red-950/80 border-red-700/60" },
  Đinh: { el: "Hỏa", pol: "Âm", chinese: "丁", color: "text-rose-400", bg: "bg-rose-950/80 border-rose-700/60" },
  Mậu: { el: "Thổ", pol: "Dương", chinese: "戊", color: "text-amber-400", bg: "bg-amber-950/80 border-amber-700/60" },
  Kỷ: { el: "Thổ", pol: "Âm", chinese: "己", color: "text-yellow-400", bg: "bg-yellow-950/80 border-yellow-700/60" },
  Canh: { el: "Kim", pol: "Dương", chinese: "庚", color: "text-slate-200", bg: "bg-slate-900/80 border-slate-600/60" },
  Tân: { el: "Kim", pol: "Âm", chinese: "辛", color: "text-gray-300", bg: "bg-gray-900/80 border-gray-600/60" },
  Nhâm: { el: "Thủy", pol: "Dương", chinese: "壬", color: "text-sky-400", bg: "bg-sky-950/80 border-sky-700/60" },
  Quý: { el: "Thủy", pol: "Âm", chinese: "癸", color: "text-blue-400", bg: "bg-blue-950/80 border-blue-700/60" },
};

// Chi tiết Địa Chi
const CHI_DETAILS: Record<string, { el: "Mộc" | "Hỏa" | "Thổ" | "Kim" | "Thủy"; chinese: string; zodiac: string; color: string }> = {
  Tý: { el: "Thủy", chinese: "子", zodiac: "Chuột", color: "text-sky-400" },
  Sửu: { el: "Thổ", chinese: "丑", zodiac: "Trâu", color: "text-amber-400" },
  Dần: { el: "Mộc", chinese: "寅", zodiac: "Hổ", color: "text-emerald-400" },
  Mão: { el: "Mộc", chinese: "卯", zodiac: "Mèo", color: "text-green-400" },
  Thìn: { el: "Thổ", chinese: "辰", zodiac: "Rồng", color: "text-amber-400" },
  Tỵ: { el: "Hỏa", chinese: "巳", zodiac: "Rắn", color: "text-rose-400" },
  Ngọ: { el: "Hỏa", chinese: "午", zodiac: "Ngựa", color: "text-red-400" },
  Mùi: { el: "Thổ", chinese: "未", zodiac: "Dê", color: "text-yellow-400" },
  Thân: { el: "Kim", chinese: "申", zodiac: "Khỉ", color: "text-slate-300" },
  Dậu: { el: "Kim", chinese: "酉", zodiac: "Gà", color: "text-gray-300" },
  Tuất: { el: "Thổ", chinese: "戌", zodiac: "Chó", color: "text-amber-400" },
  Hợi: { el: "Thủy", chinese: "亥", zodiac: "Lợn", color: "text-blue-400" },
};

// Địa Chi Tàng Can (Ẩn Can)
export interface HiddenStem {
  can: string;
  percentage: number;
  type: "Bản khí" | "Trung khí" | "Dư khí";
}

export const HIDDEN_STEMS: Record<string, HiddenStem[]> = {
  Tý: [{ can: "Quý", percentage: 100, type: "Bản khí" }],
  Sửu: [
    { can: "Kỷ", percentage: 60, type: "Bản khí" },
    { can: "Quý", percentage: 30, type: "Trung khí" },
    { can: "Tân", percentage: 10, type: "Dư khí" },
  ],
  Dần: [
    { can: "Giáp", percentage: 60, type: "Bản khí" },
    { can: "Bính", percentage: 30, type: "Trung khí" },
    { can: "Mậu", percentage: 10, type: "Dư khí" },
  ],
  Mão: [{ can: "Ất", percentage: 100, type: "Bản khí" }],
  Thìn: [
    { can: "Mậu", percentage: 60, type: "Bản khí" },
    { can: "Ất", percentage: 30, type: "Trung khí" },
    { can: "Quý", percentage: 10, type: "Dư khí" },
  ],
  Tỵ: [
    { can: "Bính", percentage: 60, type: "Bản khí" },
    { can: "Mậu", percentage: 30, type: "Trung khí" },
    { can: "Canh", percentage: 10, type: "Dư khí" },
  ],
  Ngọ: [
    { can: "Đinh", percentage: 70, type: "Bản khí" },
    { can: "Kỷ", percentage: 30, type: "Trung khí" },
  ],
  Mùi: [
    { can: "Kỷ", percentage: 60, type: "Bản khí" },
    { can: "Đinh", percentage: 30, type: "Trung khí" },
    { can: "Ất", percentage: 10, type: "Dư khí" },
  ],
  Thân: [
    { can: "Canh", percentage: 60, type: "Bản khí" },
    { can: "Nhâm", percentage: 30, type: "Trung khí" },
    { can: "Mậu", percentage: 10, type: "Dư khí" },
  ],
  Dậu: [{ can: "Tân", percentage: 100, type: "Bản khí" }],
  Tuất: [
    { can: "Mậu", percentage: 60, type: "Bản khí" },
    { can: "Tân", percentage: 30, type: "Trung khí" },
    { can: "Đinh", percentage: 10, type: "Dư khí" },
  ],
  Hợi: [
    { can: "Nhâm", percentage: 70, type: "Bản khí" },
    { can: "Giáp", percentage: 30, type: "Trung khí" },
  ],
};

// Vòng Tràng Sinh (12 giai đoạn)
export const TRANG_SINH_ORDER = [
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
] as const;

export const TRANG_SINH_START: Record<string, { startChiIdx: number; direction: 1 | -1 }> = {
  Giáp: { startChiIdx: 11, direction: 1 }, // Hợi thuận
  Ất: { startChiIdx: 6, direction: -1 },   // Ngọ nghịch
  Bính: { startChiIdx: 2, direction: 1 },  // Dần thuận
  Đinh: { startChiIdx: 9, direction: -1 }, // Dậu nghịch
  Mậu: { startChiIdx: 2, direction: 1 },   // Dần thuận (Thổ sinh cùng Hỏa)
  Kỷ: { startChiIdx: 9, direction: -1 },   // Dậu nghịch
  Canh: { startChiIdx: 5, direction: 1 },  // Tỵ thuận
  Tân: { startChiIdx: 0, direction: -1 },  // Tý nghịch
  Nhâm: { startChiIdx: 8, direction: 1 },  // Thân thuận
  Quý: { startChiIdx: 3, direction: -1 },  // Mão nghịch
};

export function getTrangSinh(dayCan: string, chiName: string): string {
  const cfg = TRANG_SINH_START[dayCan] || TRANG_SINH_START["Giáp"];
  const chiIdx = CHI_NAMES.indexOf(chiName);
  if (chiIdx === -1) return "";
  const step = (((cfg.direction * (chiIdx - cfg.startChiIdx)) % 12) + 12) % 12;
  return TRANG_SINH_ORDER[step];
}

// Tính Thập Thần
export type TenGod =
  | "Tỷ Kiên"
  | "Kiếp Tài"
  | "Thực Thần"
  | "Thương Quan"
  | "Thiên Tài"
  | "Chính Tài"
  | "Thất Sát"
  | "Chính Quan"
  | "Thiên Ấn"
  | "Chính Ấn";

export function getTenGod(dayCan: string, targetCan: string): { name: TenGod; short: string; color: string; badge: string } {
  const d = CAN_DETAILS[dayCan] || CAN_DETAILS["Giáp"];
  const t = CAN_DETAILS[targetCan] || CAN_DETAILS["Giáp"];
  const samePol = d.pol === t.pol;

  const ELEMENTS = ["Mộc", "Hỏa", "Thổ", "Kim", "Thủy"] as const;
  const dIdx = ELEMENTS.indexOf(d.el);
  const tIdx = ELEMENTS.indexOf(t.el);
  const diff = (tIdx - dIdx + 5) % 5;

  if (diff === 0) {
    return samePol
      ? { name: "Tỷ Kiên", short: "Tỷ", color: "text-emerald-300", badge: "bg-emerald-950/70 border-emerald-700/60 text-emerald-300" }
      : { name: "Kiếp Tài", short: "Kiếp", color: "text-green-300", badge: "bg-green-950/70 border-green-700/60 text-green-300" };
  } else if (diff === 1) {
    return samePol
      ? { name: "Thực Thần", short: "Thực", color: "text-amber-300", badge: "bg-amber-950/70 border-amber-700/60 text-amber-300" }
      : { name: "Thương Quan", short: "Thương", color: "text-yellow-300", badge: "bg-yellow-950/70 border-yellow-700/60 text-yellow-300" };
  } else if (diff === 2) {
    return samePol
      ? { name: "Thiên Tài", short: "T.Tài", color: "text-amber-200", badge: "bg-amber-900/80 border-amber-500/70 text-amber-200" }
      : { name: "Chính Tài", short: "C.Tài", color: "text-yellow-200", badge: "bg-amber-800/80 border-amber-400/70 text-yellow-200" };
  } else if (diff === 3) {
    return samePol
      ? { name: "Thất Sát", short: "Sát", color: "text-rose-400", badge: "bg-rose-950/80 border-rose-700/70 text-rose-300" }
      : { name: "Chính Quan", short: "Quan", color: "text-red-300", badge: "bg-red-950/80 border-red-700/70 text-red-300" };
  } else {
    return samePol
      ? { name: "Thiên Ấn", short: "Kiêu", color: "text-sky-300", badge: "bg-sky-950/80 border-sky-700/70 text-sky-300" }
      : { name: "Chính Ấn", short: "Ấn", color: "text-blue-300", badge: "bg-blue-950/80 border-blue-700/70 text-blue-300" };
  }
}

// Nạp Âm Hoa Giáp
export function getNapAm(can: string, chi: string): string {
  const item = SIXTY_JIAZI.find((j) => j.can === can && j.chi === chi);
  return item?.soundSymbolism?.napAm || item?.elementNapAm || "";
}

// Tuần Không
export function getKhongVong(can: string, chi: string): { branches: string[]; tuanGiap: string } {
  const canIdx = CAN_NAMES.indexOf(can);
  const chiIdx = CHI_NAMES.indexOf(chi);
  if (canIdx === -1 || chiIdx === -1) return { branches: [], tuanGiap: "" };
  const diff = (chiIdx - canIdx + 12) % 12;
  const kv1 = CHI_NAMES[(diff + 10) % 12];
  const kv2 = CHI_NAMES[(diff + 11) % 12];
  const tuanChiIdx = diff;
  const tuanGiap = `Tuần Giáp ${CHI_NAMES[tuanChiIdx]}`;
  return { branches: [kv1, kv2], tuanGiap };
}

// Tính Bát Tự theo ngày giờ sinh
export function calculateBaziFromDateTime(
  year: number,
  month: number,
  day: number,
  hour: number
) {
  const isBeforeLapXuan = month === 1 || (month === 2 && day < 4);
  const baziYear = isBeforeLapXuan ? year - 1 : year;
  const yearCanIdx = (((baziYear - 4) % 10) + 10) % 10;
  const yearChiIdx = (((baziYear - 4) % 12) + 12) % 12;

  // JDN
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  const jdn =
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045;
  const dayCanIdx = (((jdn + 9) % 10) + 10) % 10;
  const dayChiIdx = (((jdn + 1) % 12) + 12) % 12;

  // Month
  const cutoffs = [0, 5, 4, 5, 4, 5, 5, 6, 7, 7, 8, 7, 6];
  let monthOffset: number;
  if (month === 1) {
    monthOffset = day < cutoffs[1] ? 10 : 11;
  } else if (month === 2) {
    monthOffset = day < cutoffs[2] ? 11 : 0;
  } else {
    monthOffset = day < cutoffs[month] ? month - 3 : month - 2;
  }
  monthOffset = (monthOffset + 12) % 12;
  const monthChiIdx = (2 + monthOffset) % 12;
  const baseMonthCan = ((yearCanIdx % 5) * 2 + 2) % 10;
  const monthCanIdx = (baseMonthCan + monthOffset) % 10;

  // Hour
  const hourChiIdx = Math.floor(((hour + 1) % 24) / 2);
  const baseHourCan = (dayCanIdx % 5) * 2;
  const hourCanIdx = (baseHourCan + hourChiIdx) % 10;

  return {
    year: { can: CAN_NAMES[yearCanIdx], chi: CHI_NAMES[yearChiIdx] },
    month: { can: CAN_NAMES[monthCanIdx], chi: CHI_NAMES[monthChiIdx] },
    day: { can: CAN_NAMES[dayCanIdx], chi: CHI_NAMES[dayChiIdx] },
    hour: { can: CAN_NAMES[hourCanIdx], chi: CHI_NAMES[hourChiIdx] },
  };
}

export const JiaziBaZiLifeChart: React.FC<JiaziBaZiLifeChartProps> = ({
  onSyncToEightPillars,
  className = "",
}) => {
  // Trạng thái thu gọn/mở rộng bảng Bát Tự
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("bazi_life_chart_open");
      return saved !== null ? saved === "true" : true;
    } catch {
      return true;
    }
  });

  const handleToggleOpen = () => {
    setIsOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("bazi_life_chart_open", String(next));
      } catch {}
      return next;
    });
  };

  // Giới tính: Nam hoặc Nữ
  const [gender, setGender] = useState<"nam" | "nu">(() => {
    try {
      const saved = localStorage.getItem("bazi_gender");
      return saved === "nu" ? "nu" : "nam";
    } catch {
      return "nam";
    }
  });

  const handleSelectGender = (val: "nam" | "nu") => {
    setGender(val);
    try {
      localStorage.setItem("bazi_gender", val);
    } catch {}
  };

  // Ngày giờ sinh
  const now = new Date();
  const [birthYear, setBirthYear] = useState<number>(() => {
    try {
      const s = localStorage.getItem("bazi_birth_year");
      return s ? parseInt(s, 10) : now.getFullYear();
    } catch {
      return now.getFullYear();
    }
  });

  const [birthMonth, setBirthMonth] = useState<number>(() => {
    try {
      const s = localStorage.getItem("bazi_birth_month");
      return s ? parseInt(s, 10) : now.getMonth() + 1;
    } catch {
      return now.getMonth() + 1;
    }
  });

  const [birthDay, setBirthDay] = useState<number>(() => {
    try {
      const s = localStorage.getItem("bazi_birth_day");
      return s ? parseInt(s, 10) : now.getDate();
    } catch {
      return now.getDate();
    }
  });

  const [birthHour, setBirthHour] = useState<number>(() => {
    try {
      const s = localStorage.getItem("bazi_birth_hour");
      return s ? parseInt(s, 10) : now.getHours();
    } catch {
      return now.getHours();
    }
  });

  // Tuổi khởi vận (mặc định 6 hoặc 3 tuổi)
  const [startLuckAge, setStartLuckAge] = useState<number>(() => {
    try {
      const s = localStorage.getItem("bazi_start_luck_age");
      return s ? parseInt(s, 10) : 3;
    } catch {
      return 3;
    }
  });

  // 4 Trụ Can Chi (Năm, Tháng, Ngày, Giờ)
  const [pillars, setPillars] = useState<{
    year: { can: string; chi: string };
    month: { can: string; chi: string };
    day: { can: string; chi: string };
    hour: { can: string; chi: string };
  }>(() => {
    try {
      const saved = localStorage.getItem("bazi_life_pillars_v1");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.year && parsed.month && parsed.day && parsed.hour) return parsed;
      }
    } catch {}
    return calculateBaziFromDateTime(birthYear, birthMonth, birthDay, birthHour);
  });

  // Tự động tính Bát Tự khi đổi ngày giờ sinh
  const handleApplyBirthDateTime = () => {
    const calc = calculateBaziFromDateTime(birthYear, birthMonth, birthDay, birthHour);
    setPillars(calc);
    try {
      localStorage.setItem("bazi_birth_year", String(birthYear));
      localStorage.setItem("bazi_birth_month", String(birthMonth));
      localStorage.setItem("bazi_birth_day", String(birthDay));
      localStorage.setItem("bazi_birth_hour", String(birthHour));
      localStorage.setItem("bazi_life_pillars_v1", JSON.stringify(calc));
    } catch {}
    setToastMsg(`Đã cập nhật Bát Tự theo ngày ${birthDay}/${birthMonth}/${birthYear} lúc ${birthHour}h!`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Cập nhật từng trụ thủ công
  const handleUpdatePillar = (
    pillarKey: "year" | "month" | "day" | "hour",
    part: "can" | "chi",
    value: string
  ) => {
    setPillars((prev) => {
      const next = {
        ...prev,
        [pillarKey]: {
          ...prev[pillarKey],
          [part]: value,
        },
      };
      try {
        localStorage.setItem("bazi_life_pillars_v1", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Đại Vận đang được chọn xem (0..9)
  const [selectedDaiVanIdx, setSelectedDaiVanIdx] = useState<number>(0);

  // Năm Lưu Niên đang được chọn xem (mặc định năm hiện tại 2026)
  const [selectedLuuNienYear, setSelectedLuuNienYear] = useState<number>(2026);

  // Danh sách các lá số Bát Tự đã lưu
  const [savedCharts, setSavedCharts] = useState<SavedBaZiChart[]>(() => {
    try {
      const saved = localStorage.getItem("bazi_saved_charts_v1");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [isSavedModalOpen, setIsSavedModalOpen] = useState<boolean>(false);
  const [chartNameInput, setChartNameInput] = useState<string>("");
  const [chartNotesInput, setChartNotesInput] = useState<string>("");
  const [isSavePromptOpen, setIsSavePromptOpen] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [searchSavedQuery, setSearchSavedQuery] = useState<string>("");
  const [confirmDeleteChartId, setConfirmDeleteChartId] = useState<string | null>(null);
  const [isConfirmClearAllCharts, setIsConfirmClearAllCharts] = useState<boolean>(false);

  // Lưu lá số Bát Tự
  const handleSaveChart = () => {
    const title = chartNameInput.trim() || `Lá số ${gender === "nam" ? "Nam" : "Nữ"} Mệnh (${pillars.year.can} ${pillars.year.chi})`;
    const now = new Date();
    const formattedDate = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")} - ${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1).toString().padStart(2, "0")}/${now.getFullYear()}`;

    const newChart: SavedBaZiChart = {
      id: `bazi_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      title,
      gender,
      birthYear,
      birthMonth,
      birthDay,
      birthHour,
      startLuckAge,
      pillars,
      notes: chartNotesInput.trim(),
      timestamp: Date.now(),
      formattedDate,
    };

    const updated = [newChart, ...savedCharts];
    setSavedCharts(updated);
    try {
      localStorage.setItem("bazi_saved_charts_v1", JSON.stringify(updated));
    } catch {}

    setIsSavePromptOpen(false);
    setChartNameInput("");
    setChartNotesInput("");
    setToastMsg(`Đã lưu lá số Bát Tự: "${title}" thành công!`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Nạp lại lá số từ lịch sử
  const handleLoadSavedChart = (chart: SavedBaZiChart) => {
    setGender(chart.gender);
    setBirthYear(chart.birthYear);
    setBirthMonth(chart.birthMonth);
    setBirthDay(chart.birthDay);
    setBirthHour(chart.birthHour);
    setStartLuckAge(chart.startLuckAge);
    setPillars(chart.pillars);

    try {
      localStorage.setItem("bazi_gender", chart.gender);
      localStorage.setItem("bazi_birth_year", String(chart.birthYear));
      localStorage.setItem("bazi_birth_month", String(chart.birthMonth));
      localStorage.setItem("bazi_birth_day", String(chart.birthDay));
      localStorage.setItem("bazi_birth_hour", String(chart.birthHour));
      localStorage.setItem("bazi_start_luck_age", String(chart.startLuckAge));
      localStorage.setItem("bazi_life_pillars_v1", JSON.stringify(chart.pillars));
    } catch {}

    setIsSavedModalOpen(false);
    setToastMsg(`Đã nạp lá số: "${chart.title}"!`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Xóa lá số
  const handleDeleteChart = (id: string) => {
    const target = savedCharts.find((c) => c.id === id);
    const updated = savedCharts.filter((c) => c.id !== id);
    setSavedCharts(updated);
    setConfirmDeleteChartId(null);
    try {
      localStorage.setItem("bazi_saved_charts_v1", JSON.stringify(updated));
    } catch {}
    setToastMsg(`Đã xóa lá số: "${target?.title || "Bát Tự"}" thành công!`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Sao chép tóm tắt lá số
  const handleCopyChartSummary = (chart?: SavedBaZiChart) => {
    const p = chart ? chart.pillars : pillars;
    const g = chart ? chart.gender : gender;
    const by = chart ? chart.birthYear : birthYear;
    const sla = chart ? chart.startLuckAge : startLuckAge;

    const text = `☯ LÁ SỐ BÁT TỰ TỬ BÌNH
• Giới tính: ${g === "nam" ? "Nam Mệnh ♂" : "Nữ Mệnh ♀"}
• Sinh năm: ${by} (Khởi vận: ${sla} tuổi)
• TỨ TRỤ BÁT TỰ:
  - Trụ Năm: ${p.year.can} ${p.year.chi} (${getNapAm(p.year.can, p.year.chi)})
  - Trụ Tháng: ${p.month.can} ${p.month.chi} (${getNapAm(p.month.can, p.month.chi)})
  - Trụ Ngày (Nhật Chủ): ${p.day.can} ${p.day.chi} (${getNapAm(p.day.can, p.day.chi)})
  - Trụ Giờ: ${p.hour.can} ${p.hour.chi} (${getNapAm(p.hour.can, p.hour.chi)})
• Nhật Can (Bản Mệnh): ${p.day.can} (${CAN_DETAILS[p.day.can]?.el} ${CAN_DETAILS[p.day.can]?.pol})
• Tuần Không: ${getKhongVong(p.day.can, p.day.chi).branches.join(", ")}
`;
    navigator.clipboard.writeText(text);
    setToastMsg("Đã sao chép tóm tắt lá số Bát Tự vào bộ nhớ tạm!");
    setTimeout(() => setToastMsg(null), 2500);
  };

  // Đồng bộ xuống Bát Tự 8 Ô phía dưới
  const handleSyncToBelow = () => {
    const eightPillarsFormat: [PillarItem, PillarItem, PillarItem, PillarItem] = [
      { can: pillars.hour.can, chi: pillars.hour.chi },
      { can: pillars.day.can, chi: pillars.day.chi },
      { can: pillars.month.can, chi: pillars.month.chi },
      { can: pillars.year.can, chi: pillars.year.chi },
    ];
    if (onSyncToEightPillars) {
      onSyncToEightPillars(eightPillarsFormat);
    } else {
      try {
        localStorage.setItem("iching_jiazi_eight_pillars_v3", JSON.stringify(eightPillarsFormat));
        window.dispatchEvent(new CustomEvent("sync-bazi-pillars", { detail: eightPillarsFormat }));
      } catch {}
    }
    setToastMsg("Đã đồng bộ 4 trụ sang bảng Bát Tự 8 Ô & Lục Nhâm phía dưới!");
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Đồng bộ từ Bát Tự 8 Ô phía dưới lên bảng này
  const handleSyncFromBelow = () => {
    try {
      const saved = localStorage.getItem("iching_jiazi_eight_pillars_v3");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 4) {
          const next = {
            hour: { can: parsed[0].can, chi: parsed[0].chi },
            day: { can: parsed[1].can, chi: parsed[1].chi },
            month: { can: parsed[2].can, chi: parsed[2].chi },
            year: { can: parsed[3].can, chi: parsed[3].chi },
          };
          setPillars(next);
          localStorage.setItem("bazi_life_pillars_v1", JSON.stringify(next));
          setToastMsg("Đã nạp 4 trụ từ bảng Bát Tự 8 Ô bên dưới lên bảng này!");
          setTimeout(() => setToastMsg(null), 3000);
          return;
        }
      }
    } catch {}
    setToastMsg("Chưa tìm thấy dữ liệu từ bảng Bát Tự bên dưới.");
    setTimeout(() => setToastMsg(null), 2000);
  };

  // =========================================================================
  // TÍNH TOÁN ĐẠI VẬN (10 ĐẠI VẬN TỬ BÌNH)
  // =========================================================================
  const yearCanPol = CAN_DETAILS[pillars.year.can]?.pol || "Dương";
  const isDuongNamAmNu = (gender === "nam" && yearCanPol === "Dương") || (gender === "nu" && yearCanPol === "Âm");
  const luckDirection: 1 | -1 = isDuongNamAmNu ? 1 : -1;

  const daiVanList = useMemo(() => {
    const monthJiaziIdx = SIXTY_JIAZI.findIndex(
      (j) => j.can === pillars.month.can && j.chi === pillars.month.chi
    );
    const baseIdx = monthJiaziIdx !== -1 ? monthJiaziIdx : 0;

    const list = [];
    for (let i = 1; i <= 10; i++) {
      const targetIdx = (((baseIdx + luckDirection * i) % 60) + 60) % 60;
      const jiazi = SIXTY_JIAZI[targetIdx];
      const fromAge = startLuckAge + (i - 1) * 10;
      const toAge = fromAge + 9;
      const fromYear = birthYear + fromAge;
      const toYear = birthYear + toAge;

      const canTenGod = getTenGod(pillars.day.can, jiazi.can);
      const chiHidden = HIDDEN_STEMS[jiazi.chi]?.[0]?.can || "Giáp";
      const chiTenGod = getTenGod(pillars.day.can, chiHidden);
      const napAm = getNapAm(jiazi.can, jiazi.chi);
      const trangSinh = getTrangSinh(pillars.day.can, jiazi.chi);

      list.push({
        index: i,
        can: jiazi.can,
        chi: jiazi.chi,
        chinese: jiazi.chinese,
        fromAge,
        toAge,
        fromYear,
        toYear,
        canTenGod,
        chiTenGod,
        napAm,
        trangSinh,
      });
    }
    return list;
  }, [pillars.month.can, pillars.month.chi, pillars.day.can, luckDirection, startLuckAge, birthYear]);

  // =========================================================================
  // TÍNH TOÁN 10 NĂM LƯU NIÊN CỦA ĐẠI VẬN ĐANG CHỌN
  // =========================================================================
  const activeDaiVan = daiVanList[selectedDaiVanIdx] || daiVanList[0];

  const luuNienListOfDaiVan = useMemo(() => {
    if (!activeDaiVan) return [];
    const list = [];
    for (let y = 0; y < 10; y++) {
      const yearNum = activeDaiVan.fromYear + y;
      const canIdx = (((yearNum - 4) % 10) + 10) % 10;
      const chiIdx = (((yearNum - 4) % 12) + 12) % 12;
      const canName = CAN_NAMES[canIdx];
      const chiName = CHI_NAMES[chiIdx];
      const canTenGod = getTenGod(pillars.day.can, canName);
      const napAm = getNapAm(canName, chiName);

      // Tương tác với Nhật Trụ
      let interaction = "Bình hòa";
      let interColor = "text-[#A89882]";

      // Xung chi với Nhật Chi
      const LUC_XUNG: Record<string, string> = {
        Tý: "Ngọ", Ngọ: "Tý", Sửu: "Mùi", Mùi: "Sửu",
        Dần: "Thân", Thân: "Dần", Mão: "Dậu", Dậu: "Mão",
        Thìn: "Tuất", Tuất: "Thìn", Tỵ: "Hợi", Hợi: "Tỵ",
      };
      const LUC_HOP: Record<string, string> = {
        Tý: "Sửu", Sửu: "Tý", Dần: "Hợi", Hợi: "Dần",
        Mão: "Tuất", Tuất: "Mão", Thìn: "Dậu", Dậu: "Thìn",
        Tỵ: "Thân", Thân: "Tỵ", Ngọ: "Mùi", Mùi: "Ngọ",
      };

      if (LUC_XUNG[chiName] === pillars.day.chi) {
        interaction = "Xung Nhật Chi";
        interColor = "text-rose-400 font-bold";
      } else if (LUC_HOP[chiName] === pillars.day.chi) {
        interaction = "Lục Hợp Nhật Chi";
        interColor = "text-emerald-400 font-bold";
      } else if (LUC_XUNG[chiName] === pillars.year.chi) {
        interaction = "Xung Thái Tuế";
        interColor = "text-amber-400";
      }

      list.push({
        yearNum,
        age: activeDaiVan.fromAge + y,
        can: canName,
        chi: chiName,
        canTenGod,
        napAm,
        interaction,
        interColor,
      });
    }
    return list;
  }, [activeDaiVan, pillars.day.can, pillars.day.chi, pillars.year.chi]);

  // Phân tích năm Lưu Niên được chọn cụ thể
  const selectedLuuNienAnalysis = useMemo(() => {
    const canIdx = (((selectedLuuNienYear - 4) % 10) + 10) % 10;
    const chiIdx = (((selectedLuuNienYear - 4) % 12) + 12) % 12;
    const canName = CAN_NAMES[canIdx];
    const chiName = CHI_NAMES[chiIdx];
    const canTenGod = getTenGod(pillars.day.can, canName);
    const napAm = getNapAm(canName, chiName);

    return {
      year: selectedLuuNienYear,
      can: canName,
      chi: chiName,
      canTenGod,
      napAm,
    };
  }, [selectedLuuNienYear, pillars.day.can]);

  return (
    <div
      className={`rounded-2xl bg-[#16110B] border border-[#483724] shadow-2xl overflow-hidden transition-all text-[#F5EAD4] ${className}`}
    >
      {/* =========================================================================
          THANH TIÊU ĐỀ BẢNG BÁT TỰ TỬ BÌNH
          ========================================================================= */}
      <div className="bg-gradient-to-r from-[#21170F] via-[#2A1D13] to-[#1C130B] border-b border-[#3D2C1C] p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C9A55A] to-[#8C6218] flex items-center justify-center text-[#120F0B] font-bold shadow-[0_0_12px_rgba(212,175,55,0.3)] shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-serif font-bold text-base sm:text-lg text-[#F5EAD4] tracking-wide flex items-center gap-2">
                BẢNG BÁT TỰ TỬ BÌNH (TỨ TRỤ • ĐẠI VẬN • LƯU NIÊN)
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-600/70 font-sans font-semibold">
                Mệnh Lý Kinh Điển
              </span>
            </div>
            <p className="text-[11px] text-[#A89882] font-serif mt-0.5">
              Tra cứu 4 Trụ, Thập Thần, Tàng Can, 10 Đại Vận & Tương Tác Lưu Niên Cát Hung
            </p>
          </div>
        </div>

        {/* Nút hành động trên Header */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Nút Chọn Nam / Nữ */}
          <div className="inline-flex rounded-xl bg-[#1A120A] border border-[#3E2D1C] p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => handleSelectGender("nam")}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all ${
                gender === "nam"
                  ? "bg-gradient-to-r from-blue-700 to-indigo-800 text-white font-bold shadow"
                  : "text-[#8C7D6B] hover:text-[#DDD0BE]"
              }`}
            >
              <span>Nam ♂</span>
              <span className="text-[10px] opacity-80">({isDuongNamAmNu ? "Thuận" : "Nghịch"})</span>
            </button>
            <button
              type="button"
              onClick={() => handleSelectGender("nu")}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all ${
                gender === "nu"
                  ? "bg-gradient-to-r from-rose-700 to-pink-800 text-white font-bold shadow"
                  : "text-[#8C7D6B] hover:text-[#DDD0BE]"
              }`}
            >
              <span>Nữ ♀</span>
              <span className="text-[10px] opacity-80">({gender === "nu" && yearCanPol === "Dương" ? "Nghịch" : "Thuận"})</span>
            </button>
          </div>

          {/* Nút Lưu Bát Tự */}
          <button
            type="button"
            onClick={() => setIsSavePromptOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#C89B3C] via-[#E2C37A] to-[#A87B25] hover:brightness-110 active:scale-95 text-[#14100C] text-xs font-serif font-bold shadow-md cursor-pointer transition-all"
            title="Lưu lá số Bát Tự này vào lịch sử"
          >
            <BookmarkCheck className="w-3.5 h-3.5" />
            <span>Lưu Bát Tự</span>
          </button>

          {/* Nút Danh Sách Lá Số Đã Lưu */}
          <button
            type="button"
            onClick={() => setIsSavedModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#241B12] hover:bg-[#342618] border border-[#4D3823] hover:border-[#C9A55A] text-xs text-[#D6B97A] font-semibold cursor-pointer transition-all shadow-sm active:scale-95"
            title="Xem danh sách các lá số Bát Tự đã lưu"
          >
            <History className="w-3.5 h-3.5 text-amber-400" />
            <span>Lá Số Đã Lưu ({savedCharts.length})</span>
          </button>

          {/* Nút Thu Gọn / Mở Rộng */}
          <button
            type="button"
            onClick={handleToggleOpen}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#22180F] hover:bg-[#302215] border border-[#3E2D1C] text-xs text-[#CDBFA8] hover:text-[#FFF] font-semibold cursor-pointer transition-all"
            title={isOpen ? "Thu gọn bảng Bát Tự" : "Mở rộng bảng Bát Tự"}
          >
            <span>{isOpen ? "Thu gọn" : "Mở rộng"}</span>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Thông báo Toast nếu có */}
      {toastMsg && (
        <div className="bg-amber-950/90 border-b border-amber-600/80 px-4 py-2 text-xs text-[#E6D3A3] font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* =========================================================================
          NỘI DUNG CHI TIẾT BẢNG BÁT TỰ (KHI MỞ RỘNG)
          ========================================================================= */}
      {isOpen ? (
        <div className="p-4 sm:p-5 space-y-5 animate-in fade-in duration-300">
          {/* ================= KHUNG ĐIỀU KHIỂN & NHẬP NGÀY GIỜ SINH ================= */}
          <div className="p-3.5 rounded-xl bg-[#1C140C] border border-[#3A2A1A] flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Nhập ngày tháng năm giờ sinh */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[#8C7D6B] font-semibold flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#C9A55A]" /> Ngày sinh Dương lịch:
              </span>
              <div className="flex items-center gap-1.5 bg-[#140E09] border border-[#382818] px-2.5 py-1 rounded-lg">
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={birthDay}
                  onChange={(e) => setBirthDay(parseInt(e.target.value, 10) || 1)}
                  className="w-10 bg-transparent text-center text-[#F5EAD4] font-bold outline-none border-b border-[#523A23] focus:border-[#C9A55A]"
                  title="Ngày sinh"
                />
                <span>/</span>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={birthMonth}
                  onChange={(e) => setBirthMonth(parseInt(e.target.value, 10) || 1)}
                  className="w-10 bg-transparent text-center text-[#F5EAD4] font-bold outline-none border-b border-[#523A23] focus:border-[#C9A55A]"
                  title="Tháng sinh"
                />
                <span>/</span>
                <input
                  type="number"
                  min={1920}
                  max={2050}
                  value={birthYear}
                  onChange={(e) => setBirthYear(parseInt(e.target.value, 10) || 2026)}
                  className="w-14 bg-transparent text-center text-[#F5EAD4] font-bold outline-none border-b border-[#523A23] focus:border-[#C9A55A]"
                  title="Năm sinh"
                />
              </div>

              <span className="text-[#8C7D6B] font-semibold flex items-center gap-1 ml-1">
                <Clock className="w-3.5 h-3.5 text-[#C9A55A]" /> Giờ sinh:
              </span>
              <div className="flex items-center gap-1 bg-[#140E09] border border-[#382818] px-2.5 py-1 rounded-lg">
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={birthHour}
                  onChange={(e) => setBirthHour(parseInt(e.target.value, 10) || 0)}
                  className="w-10 bg-transparent text-center text-[#F5EAD4] font-bold outline-none border-b border-[#523A23] focus:border-[#C9A55A]"
                  title="Giờ sinh (0 - 23h)"
                />
                <span>h</span>
              </div>

              <button
                type="button"
                onClick={handleApplyBirthDateTime}
                className="px-3 py-1 rounded-lg bg-[#2D1F13] hover:bg-[#3D2C1B] text-[#E6D3A3] border border-[#52402A] text-xs font-semibold cursor-pointer transition-all active:scale-95 shadow-sm"
              >
                Quy Đổi Bát Tự
              </button>
            </div>

            {/* Tuổi khởi vận & nút đồng bộ */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs text-[#8C7D6B]">
                <span>Khởi Vận:</span>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={startLuckAge}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10) || 1;
                    setStartLuckAge(val);
                    try {
                      localStorage.setItem("bazi_start_luck_age", String(val));
                    } catch {}
                  }}
                  className="w-10 bg-[#140E09] border border-[#382818] rounded px-1.5 py-0.5 text-center text-[#D6B97A] font-bold outline-none"
                  title="Tuổi bắt đầu Đại Vận (1 - 10)"
                />
                <span>tuổi</span>
              </div>

              <button
                type="button"
                onClick={handleSyncToBelow}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#22180F] hover:bg-[#302215] text-[#CDBFA8] hover:text-[#E6D3A3] border border-[#3E2D1C] text-xs font-medium cursor-pointer transition-all"
                title="Đồng bộ 4 trụ này sang Bát Tự 8 Ô và Lục Nhâm phía dưới"
              >
                <ArrowDown className="w-3.5 h-3.5 text-amber-400" />
                <span>Đồng bộ xuống</span>
              </button>

              <button
                type="button"
                onClick={handleSyncFromBelow}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#22180F] hover:bg-[#302215] text-[#CDBFA8] hover:text-[#E6D3A3] border border-[#3E2D1C] text-xs font-medium cursor-pointer transition-all"
                title="Lấy 4 trụ đang chọn từ Bát Tự 8 Ô bên dưới lên đây"
              >
                <RefreshCw className="w-3 h-3 text-amber-400" />
                <span>Lấy từ dưới</span>
              </button>
            </div>
          </div>

          {/* ================= PHẦN 1: BẢNG 4 TRỤ BÁT TỰ ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {[
              {
                key: "year" as const,
                title: "TRỤ NĂM",
                sub: "Niên Trụ (年柱)",
                role: "Tổ tiên, gốc rễ, hồng ân tiền nhân",
                pillar: pillars.year,
              },
              {
                key: "month" as const,
                title: "TRỤ THÁNG",
                sub: "Nguyệt Trụ (月柱)",
                role: "Cha mẹ, huynh đệ, môi trường trưởng thành",
                pillar: pillars.month,
              },
              {
                key: "day" as const,
                title: "TRỤ NGÀY",
                sub: "Nhật Trụ (日柱)",
                role: "Bản thân (Nhật Chủ) & Bạn đời (Cung Phu Thê)",
                pillar: pillars.day,
                isDayMaster: true,
              },
              {
                key: "hour" as const,
                title: "TRỤ GIỜ",
                sub: "Thời Trụ (時柱)",
                role: "Con cái, hậu vận, công việc sự nghiệp cuối đời",
                pillar: pillars.hour,
              },
            ].map(({ key, title, sub, role, pillar, isDayMaster }) => {
              const canDetail = CAN_DETAILS[pillar.can] || CAN_DETAILS["Giáp"];
              const chiDetail = CHI_DETAILS[pillar.chi] || CHI_DETAILS["Tý"];
              const tenGod = isDayMaster
                ? { name: "NHẬT CHỦ" as const, short: "Bản Thân", color: "text-amber-300", badge: "bg-amber-900/90 border-amber-500 text-amber-200" }
                : getTenGod(pillars.day.can, pillar.can);
              const hidden = HIDDEN_STEMS[pillar.chi] || [];
              const napAm = getNapAm(pillar.can, pillar.chi);
              const trangSinh = getTrangSinh(pillars.day.can, pillar.chi);
              const kv = getKhongVong(pillars.day.can, pillars.day.chi);
              const isKv = kv.branches.includes(pillar.chi);

              return (
                <div
                  key={key}
                  className={`rounded-2xl p-4 border flex flex-col justify-between transition-all ${
                    isDayMaster
                      ? "bg-gradient-to-b from-[#2E2013] via-[#22180F] to-[#17110B] border-[#C9A55A] shadow-[0_0_15px_rgba(212,175,55,0.22)] ring-1 ring-[#D6B97A]/50"
                      : "bg-[#1A130C] border-[#3D2C1C]"
                  }`}
                >
                  {/* Header Trụ */}
                  <div>
                    <div className="flex items-center justify-between border-b border-[#2E2114] pb-2 mb-2.5">
                      <div>
                        <div className="text-[10px] text-[#8C7D6B] font-bold uppercase tracking-wider">
                          {sub}
                        </div>
                        <h4 className="font-serif font-bold text-sm text-[#F5EAD4] flex items-center gap-1.5">
                          <span>{title}</span>
                          {isDayMaster && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-900/80 text-amber-200 border border-amber-500 font-sans font-bold">
                              NGUYÊN THẦN
                            </span>
                          )}
                        </h4>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-serif font-bold border ${tenGod.badge}`}>
                        {tenGod.name}
                      </span>
                    </div>

                    {/* Thiên Can (Ô Trên) */}
                    <div className="bg-[#120D08] border border-[#2F2113] rounded-xl p-2.5 mb-2 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[#8C7D6B] block">Thiên Can:</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-xl font-serif font-extrabold ${canDetail.color}`}>
                            {canDetail.chinese}
                          </span>
                          <span className="text-sm font-serif font-bold text-[#F5EAD4]">
                            {pillar.can}
                          </span>
                        </div>
                      </div>
                      <div className="text-right text-[10px]">
                        <span className={`px-2 py-0.5 rounded border font-semibold ${canDetail.bg}`}>
                          {canDetail.pol} {canDetail.el}
                        </span>
                      </div>
                    </div>

                    {/* Địa Chi (Ô Dưới) */}
                    <div className="bg-[#120D08] border border-[#2F2113] rounded-xl p-2.5 mb-2.5 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[#8C7D6B] block">Địa Chi:</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-xl font-serif font-extrabold ${chiDetail.color}`}>
                            {chiDetail.chinese}
                          </span>
                          <span className="text-sm font-serif font-bold text-[#F5EAD4]">
                            {pillar.chi}
                          </span>
                          <span className="text-xs text-[#8C7D6B]">({chiDetail.zodiac})</span>
                        </div>
                      </div>
                      <div className="text-right text-[10px] space-y-1">
                        <span className="px-2 py-0.5 rounded border border-[#3E2D1C] bg-[#1C140C] text-[#CDBFA8] font-semibold block">
                          Hành {chiDetail.el}
                        </span>
                        {isKv && (
                          <span className="px-1.5 py-0.2 rounded bg-purple-900/90 text-purple-200 border border-purple-500 text-[9px] font-bold animate-pulse block">
                            ⭕ Tuần Không
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Địa Chi Tàng Can (Ẩn Can) */}
                    <div className="bg-[#16100B] border border-[#291C10] rounded-xl p-2 mb-2 space-y-1 text-[10.5px]">
                      <div className="text-[10px] text-[#8C7D6B] font-semibold flex items-center justify-between">
                        <span>Tàng Can (Ẩn Thần):</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {hidden.map((h) => {
                          const hGod = getTenGod(pillars.day.can, h.can);
                          return (
                            <span
                              key={h.can}
                              className="px-1.5 py-0.5 rounded bg-[#20160D] border border-[#3D2C1C] text-[10px] flex items-center gap-1"
                              title={`${h.can} (${h.type} ${h.percentage}%) - ${hGod.name}`}
                            >
                              <strong className={CAN_DETAILS[h.can]?.color}>{h.can}</strong>
                              <span className="text-[9px] text-[#A89882]">{hGod.short}</span>
                              <span className="text-[8px] opacity-60">({h.percentage}%)</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Footer Trụ: Nạp Âm & Vòng Tràng Sinh */}
                  <div className="pt-2 border-t border-[#261A0F] text-[10.5px] space-y-1">
                    <div className="flex items-center justify-between text-[#CDBFA8]">
                      <span className="text-[#8C7D6B]">Nạp Âm:</span>
                      <strong className="text-amber-200 font-serif">{napAm}</strong>
                    </div>
                    <div className="flex items-center justify-between text-[#CDBFA8]">
                      <span className="text-[#8C7D6B]">Tràng Sinh:</span>
                      <span className="text-[#D6B97A] font-semibold font-serif">{trangSinh}</span>
                    </div>
                    <p className="text-[9px] text-[#736350] line-clamp-1 mt-1 pt-1 border-t border-[#20150B]">
                      {role}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ================= PHẦN 2: 10 ĐẠI VẬN TỬ BÌNH ================= */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#18120B] border border-[#3D2C1C] shadow-inner space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-[#2C2014] pb-2.5">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400" />
                <h4 className="font-serif font-bold text-sm sm:text-base text-[#F5EAD4] tracking-wide">
                  10 ĐẠI VẬN TỬ BÌNH (Khởi từ Trụ Tháng [{pillars.month.can} {pillars.month.chi}])
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2C1F13] text-[#E6D3A3] border border-[#4D3823] font-medium">
                  {luckDirection === 1 ? "Thuận Hành (+)" : "Nghịch Hành (-)"} • Khởi vận lúc {startLuckAge} tuổi
                </span>
              </div>
              <span className="text-[11px] text-[#A89882]">
                (Bấm chọn 1 Đại Vận bên dưới để kích hoạt xem 10 năm Lưu Niên chi tiết)
              </span>
            </div>

            {/* Dải 10 Thẻ Đại Vận */}
            <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
              {daiVanList.map((dv, idx) => {
                const isSelected = selectedDaiVanIdx === idx;
                const canDet = CAN_DETAILS[dv.can] || CAN_DETAILS["Giáp"];
                const chiDet = CHI_DETAILS[dv.chi] || CHI_DETAILS["Tý"];

                return (
                  <button
                    key={dv.index}
                    type="button"
                    onClick={() => setSelectedDaiVanIdx(idx)}
                    className={`shrink-0 w-28 sm:w-32 p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "bg-gradient-to-b from-[#2E2012] via-[#22180F] to-[#18110B] border-[#C9A55A] shadow-[0_0_12px_rgba(212,175,55,0.25)] ring-1 ring-[#C9A55A]/50"
                        : "bg-[#140E08] border-[#302113] hover:border-[#4B3722] opacity-85 hover:opacity-100"
                    }`}
                  >
                    <div>
                      {/* Số tuổi & Năm */}
                      <div className="text-[10px] text-amber-300 font-bold border-b border-[#261B0F] pb-1 mb-1.5 flex items-center justify-between">
                        <span>Vận {dv.index}</span>
                        <span>{dv.fromAge} - {dv.toAge}t</span>
                      </div>

                      {/* Năm Dương Lịch */}
                      <div className="text-[9px] text-[#8C7D6B] mb-1">
                        {dv.fromYear} - {dv.toYear}
                      </div>

                      {/* Can Chi Đại Vận */}
                      <div className="py-1">
                        <div className="text-base font-serif font-extrabold flex items-center justify-center gap-1">
                          <span className={canDet.color}>{dv.can}</span>
                          <span className={chiDet.color}>{dv.chi}</span>
                        </div>
                        <div className="text-[10px] text-[#A89882]">{dv.chinese}</div>
                      </div>

                      {/* Thập Thần */}
                      <div className="text-[9.5px] font-semibold text-[#D6B97A] mt-1">
                        {dv.canTenGod.short} • {dv.chiTenGod.short}
                      </div>
                    </div>

                    {/* Nạp Âm & Tràng Sinh */}
                    <div className="mt-2 pt-1 border-t border-[#261B0F] text-[8.5px] text-[#8C7D6B] truncate">
                      {dv.napAm}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ================= PHẦN 3: LƯU NIÊN (CÁC NĂM CỦA ĐẠI VẬN ĐANG XEM) ================= */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#18120B] border border-[#3D2C1C] shadow-inner space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-[#2C2014] pb-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                <Calendar className="w-4 h-4 text-amber-400" />
                <h4 className="font-serif font-bold text-sm sm:text-base text-[#F5EAD4]">
                  LƯU NIÊN CÁC NĂM CỦA ĐẠI VẬN [{activeDaiVan.can} {activeDaiVan.chi}] ({activeDaiVan.fromAge} - {activeDaiVan.toAge} tuổi • Năm {activeDaiVan.fromYear} - {activeDaiVan.toYear})
                </h4>
              </div>

              {/* Bộ chọn nhanh năm Lưu Niên */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#8C7D6B]">Khảo sát năm:</span>
                <select
                  value={selectedLuuNienYear}
                  onChange={(e) => setSelectedLuuNienYear(parseInt(e.target.value, 10))}
                  className="bg-[#140E09] border border-[#3D2D1B] rounded-lg px-2.5 py-1 text-xs text-[#E6D3A3] font-bold outline-none cursor-pointer"
                >
                  {Array.from({ length: 100 }, (_, idx) => 1950 + idx).map((y) => {
                    const cIdx = (((y - 4) % 10) + 10) % 10;
                    const chIdx = (((y - 4) % 12) + 12) % 12;
                    return (
                      <option key={y} value={y}>
                        {y} ({CAN_NAMES[cIdx]} {CHI_NAMES[chIdx]})
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Bảng 10 năm Lưu Niên trong Đại Vận */}
            <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
              {luuNienListOfDaiVan.map((ln) => {
                const isCurrentYear = ln.yearNum === now.getFullYear();
                const isSelectedYear = ln.yearNum === selectedLuuNienYear;

                return (
                  <button
                    key={ln.yearNum}
                    type="button"
                    onClick={() => setSelectedLuuNienYear(ln.yearNum)}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col justify-between ${
                      isSelectedYear
                        ? "bg-[#2A1D11] border-[#C9A55A] ring-1 ring-[#C9A55A]/50 shadow"
                        : isCurrentYear
                        ? "bg-[#20170F] border-amber-600/70"
                        : "bg-[#130E08] border-[#2C1F13] hover:border-[#4B3722]"
                    }`}
                  >
                    <div>
                      <div className="text-[10px] text-[#A89882] font-semibold">
                        {ln.yearNum} ({ln.age}t)
                      </div>
                      <div className="font-serif font-bold text-xs text-[#F5EAD4] mt-0.5">
                        {ln.can} {ln.chi}
                      </div>
                      <div className="text-[9px] text-[#D6B97A] mt-0.5">
                        {ln.canTenGod.short}
                      </div>
                    </div>
                    <div className={`text-[8.5px] mt-1 pt-1 border-t border-[#23170B] truncate ${ln.interColor}`}>
                      {ln.interaction}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Phân tích năm Lưu Niên đã chọn */}
            <div className="p-3 rounded-xl bg-[#130E08] border border-[#332517] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[#8C7D6B] font-semibold">Chi Tiết Năm Lưu Niên {selectedLuuNienAnalysis.year}:</span>
                <span className="px-2 py-0.5 rounded bg-[#251B10] text-[#E6D3A3] border border-[#483724] font-serif font-bold">
                  {selectedLuuNienAnalysis.can} {selectedLuuNienAnalysis.chi}
                </span>
                <span className="text-[11px] text-[#CDBFA8]">
                  • Nạp Âm: <strong>{selectedLuuNienAnalysis.napAm}</strong>
                </span>
                <span className="text-[11px] text-[#CDBFA8]">
                  • Thập Thần: <strong className="text-amber-300">{selectedLuuNienAnalysis.canTenGod.name}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopyChartSummary()}
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[#241B12] hover:bg-[#332517] text-[#D6B97A] border border-[#4D3823] text-xs font-semibold cursor-pointer transition-all active:scale-95 ml-auto"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Sao Chép Tóm Tắt Lá Số</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Thanh tóm tắt khi thu gọn */
        <div className="px-4 py-3 bg-[#150F0A] flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-serif font-bold text-[#D6B97A]">
              {gender === "nam" ? "Nam Mệnh ♂" : "Nữ Mệnh ♀"}
            </span>
            <span className="text-[#5E4833]">•</span>
            <span className="text-[#CDBFA8]">
              Năm: <strong className="text-[#F5EAD4]">{pillars.year.can} {pillars.year.chi}</strong>
            </span>
            <span className="text-[#CDBFA8]">
              Tháng: <strong className="text-[#F5EAD4]">{pillars.month.can} {pillars.month.chi}</strong>
            </span>
            <span className="text-[#CDBFA8]">
              Ngày: <strong className="text-amber-300 font-bold">{pillars.day.can} {pillars.day.chi}</strong>
            </span>
            <span className="text-[#CDBFA8]">
              Giờ: <strong className="text-[#F5EAD4]">{pillars.hour.can} {pillars.hour.chi}</strong>
            </span>
            <span className="text-[#5E4833]">•</span>
            <span className="text-amber-300">
              Đại Vận: <strong>{activeDaiVan.can} {activeDaiVan.chi}</strong> ({activeDaiVan.fromAge} - {activeDaiVan.toAge}t)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSavePromptOpen(true)}
              className="text-xs text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <BookmarkCheck className="w-3.5 h-3.5" />
              <span>Lưu lá số</span>
            </button>
            <button
              type="button"
              onClick={handleToggleOpen}
              className="text-xs text-[#C9A55A] hover:underline flex items-center gap-1 cursor-pointer font-semibold"
            >
              <span>Mở rộng chi tiết ▼</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: LƯU LÁ SỐ BÁT TỰ (PROMPT NHẬP TÊN)
          ========================================================================= */}
      {isSavePromptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#19130D] border border-[#483724] rounded-2xl p-5 shadow-2xl text-[#F5EAD4] space-y-3.5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#2C2114] pb-2.5">
              <h3 className="font-serif font-bold text-base text-[#D6B97A] flex items-center gap-2">
                <BookmarkCheck className="w-4 h-4" />
                LƯU LÁ SỐ BÁT TỰ
              </h3>
              <button
                type="button"
                onClick={() => setIsSavePromptOpen(false)}
                className="p-1 text-[#8C7D6B] hover:text-[#F5EAD4] rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block text-[#A89882] mb-1 font-semibold">Tên lá số hoặc Họ tên gia chủ:</label>
                <input
                  type="text"
                  value={chartNameInput}
                  onChange={(e) => setChartNameInput(e.target.value)}
                  placeholder={`Ví dụ: Lá số ${gender === "nam" ? "Nam" : "Nữ"} Mệnh (${pillars.year.can} ${pillars.year.chi})...`}
                  className="w-full bg-[#120D08] border border-[#3E2E1D] focus:border-[#C9A55A] rounded-xl px-3 py-2 text-xs text-[#F5EAD4] outline-none"
                />
              </div>

              <div>
                <label className="block text-[#A89882] mb-1 font-semibold">Ghi chú luận giải (nếu có):</label>
                <textarea
                  rows={2}
                  value={chartNotesInput}
                  onChange={(e) => setChartNotesInput(e.target.value)}
                  placeholder="Ghi chú về sự nghiệp, tài vận, hôn nhân, vận hạn..."
                  className="w-full bg-[#120D08] border border-[#3E2E1D] focus:border-[#C9A55A] rounded-xl px-3 py-2 text-xs text-[#F5EAD4] outline-none resize-none"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-[#140E09] border border-[#2D1F13] text-[11px] text-[#CDBFA8] space-y-0.5">
                <div>Giới tính: <strong>{gender === "nam" ? "Nam Mệnh ♂" : "Nữ Mệnh ♀"}</strong></div>
                <div>Bát Tự: <strong>{pillars.year.can} {pillars.year.chi} • {pillars.month.can} {pillars.month.chi} • {pillars.day.can} {pillars.day.chi} • {pillars.hour.can} {pillars.hour.chi}</strong></div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2C2114]">
              <button
                type="button"
                onClick={() => setIsSavePromptOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-[#241B12] hover:bg-[#302215] text-xs text-[#8C7D6B] hover:text-[#CDBFA8] cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveChart}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#C89B3C] via-[#E2C37A] to-[#A87B25] text-xs font-bold font-serif text-[#14100C] cursor-pointer shadow hover:brightness-110 active:scale-95"
              >
                Lưu Lá Số
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: DANH SÁCH LÁ SỐ BÁT TỰ ĐÃ LƯU
          ========================================================================= */}
      {isSavedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-[#19130D] border border-[#483724] rounded-2xl shadow-2xl text-[#F5EAD4] animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#2C2114] px-5 py-3.5 bg-[#140F0A]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C9A55A] to-[#8C6218] flex items-center justify-center text-[#120F0B] font-bold shadow">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-[#D6B97A]">
                    LÁ SỐ BÁT TỰ ĐÃ LƯU
                  </h3>
                  <p className="text-[11px] text-[#8C7D6B]">
                    {savedCharts.length} hồ sơ lá số được lưu trong bộ nhớ
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSavedModalOpen(false)}
                className="p-1.5 text-[#8C7D6B] hover:text-[#F5EAD4] hover:bg-[#2C2114] rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tìm kiếm */}
            {savedCharts.length > 0 && (
              <div className="px-5 py-2.5 bg-[#17110B] border-b border-[#2C2114] flex items-center gap-2">
                <Search className="w-4 h-4 text-[#8C7D6B] shrink-0" />
                <input
                  type="text"
                  value={searchSavedQuery}
                  onChange={(e) => setSearchSavedQuery(e.target.value)}
                  placeholder="Tìm kiếm theo tên lá số, Can Chi, năm sinh..."
                  className="w-full bg-transparent text-xs text-[#F5EAD4] placeholder-[#6E5D4B] outline-none"
                />
                {searchSavedQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchSavedQuery("")}
                    className="text-[#8C7D6B] hover:text-[#F5EAD4] text-xs p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}

            {/* Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1 scrollbar-thin">
              {savedCharts.length === 0 ? (
                <div className="py-12 text-center text-[#8C7D6B] space-y-2">
                  <Sparkles className="w-10 h-10 mx-auto opacity-40 text-amber-400" />
                  <p className="text-sm font-serif font-bold text-[#DDD0BE]">Chưa có lá số Bát Tự nào được lưu</p>
                  <p className="text-xs max-w-sm mx-auto">
                    Hãy bấm nút <strong>"Lưu Bát Tự"</strong> trên thanh công cụ để lưu giữ hồ sơ lá số của bạn.
                  </p>
                </div>
              ) : (
                (() => {
                  const filtered = savedCharts.filter((c) => {
                    if (!searchSavedQuery.trim()) return true;
                    const q = searchSavedQuery.toLowerCase();
                    return (
                      c.title.toLowerCase().includes(q) ||
                      c.pillars.year.can.toLowerCase().includes(q) ||
                      c.pillars.year.chi.toLowerCase().includes(q) ||
                      String(c.birthYear).includes(q) ||
                      (c.notes && c.notes.toLowerCase().includes(q))
                    );
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="py-8 text-center text-xs text-[#8C7D6B]">
                        Không tìm thấy lá số nào khớp với từ khóa "{searchSavedQuery}".
                      </div>
                    );
                  }

                  return filtered.map((c) => (
                    <div
                      key={c.id}
                      className="p-3.5 rounded-xl bg-[#1D1610] border border-[#3A2B1C] hover:border-[#523E28] transition-all space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2C2114] pb-2 text-[11px]">
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-sm text-[#E6D3A3]">
                            {c.title}
                          </span>
                          <span className={`px-2 py-0.2 rounded font-semibold text-[10px] ${c.gender === "nam" ? "bg-blue-950 text-blue-300 border border-blue-700/60" : "bg-rose-950 text-rose-300 border border-rose-700/60"}`}>
                            {c.gender === "nam" ? "Nam ♂" : "Nữ ♀"}
                          </span>
                          <span className="text-[#8C7D6B] font-mono text-[10px]">
                            {c.formattedDate}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleLoadSavedChart(c)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#2E2013] hover:bg-[#3D2C1B] text-[#E6D3A3] border border-[#52402A] text-xs font-semibold cursor-pointer active:scale-95"
                          >
                            <RotateCcw className="w-3 h-3 text-amber-400" />
                            <span>Nạp lá số</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopyChartSummary(c)}
                            className="p-1 text-[#CDBFA8] hover:text-[#E6D3A3] bg-[#241B12] hover:bg-[#2F2317] rounded-lg border border-[#3E2D1C] cursor-pointer"
                            title="Sao chép tóm tắt"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          {confirmDeleteChartId === c.id ? (
                            <div className="flex items-center gap-1 bg-red-950/90 border border-red-600 px-1.5 py-0.5 rounded-lg animate-in fade-in">
                              <span className="text-[10px] text-red-200 font-semibold whitespace-nowrap">Xóa?</span>
                              <button
                                type="button"
                                onClick={() => handleDeleteChart(c.id)}
                                className="px-1.5 py-0.5 rounded bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold cursor-pointer"
                              >
                                Xác nhận
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteChartId(null)}
                                className="px-1.5 py-0.5 rounded bg-[#2E2013] hover:bg-[#3D2C1B] text-[#D1C2A5] text-[10px] cursor-pointer"
                              >
                                Hủy
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteChartId(c.id)}
                              className="p-1 text-[#8C7D6B] hover:text-red-400 bg-[#241B12] hover:bg-red-950/50 rounded-lg border border-[#3E2D1C] hover:border-red-800/80 cursor-pointer"
                              title="Xóa lá số"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* 4 Trụ hiển thị */}
                      <div className="grid grid-cols-4 gap-2 text-center text-xs bg-[#130E08] p-2 rounded-lg border border-[#261B0F]">
                        <div>
                          <div className="text-[9.5px] text-[#8C7D6B]">NĂM</div>
                          <div className="font-serif font-bold text-[#F5EAD4]">{c.pillars.year.can} {c.pillars.year.chi}</div>
                        </div>
                        <div>
                          <div className="text-[9.5px] text-[#8C7D6B]">THÁNG</div>
                          <div className="font-serif font-bold text-[#F5EAD4]">{c.pillars.month.can} {c.pillars.month.chi}</div>
                        </div>
                        <div>
                          <div className="text-[9.5px] text-[#8C7D6B]">NGÀY (CHỦ)</div>
                          <div className="font-serif font-bold text-amber-300">{c.pillars.day.can} {c.pillars.day.chi}</div>
                        </div>
                        <div>
                          <div className="text-[9.5px] text-[#8C7D6B]">GIỜ</div>
                          <div className="font-serif font-bold text-[#F5EAD4]">{c.pillars.hour.can} {c.pillars.hour.chi}</div>
                        </div>
                      </div>

                      {c.notes && (
                        <p className="text-[11px] text-[#A89882] italic">
                          "{c.notes}"
                        </p>
                      )}
                    </div>
                  ));
                })()
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-[#2C2114] px-5 py-3 bg-[#140F0A] flex flex-wrap items-center justify-between gap-2">
              {savedCharts.length > 0 && (
                isConfirmClearAllCharts ? (
                  <div className="flex items-center gap-1.5 bg-red-950/90 border border-red-700 px-2 py-1 rounded-lg">
                    <span className="text-[11px] text-red-200 font-medium">Xóa toàn bộ lá số đã lưu?</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSavedCharts([]);
                        try {
                          localStorage.removeItem("bazi_saved_charts_v1");
                        } catch {}
                        setIsConfirmClearAllCharts(false);
                        setToastMsg("Đã xóa toàn bộ danh sách lá số Bát Tự đã lưu!");
                        setTimeout(() => setToastMsg(null), 3000);
                      }}
                      className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold cursor-pointer"
                    >
                      Xác nhận xóa hết
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsConfirmClearAllCharts(false)}
                      className="px-2 py-0.5 rounded bg-[#2B1D10] text-[#D1C2A5] text-[11px] cursor-pointer"
                    >
                      Hủy
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsConfirmClearAllCharts(true)}
                    className="text-xs text-red-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa tất cả</span>
                  </button>
                )
              )}
              <button
                type="button"
                onClick={() => setIsSavedModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-[#2C2014] hover:bg-[#3D2D1D] border border-[#4D3824] text-xs text-[#F5EAD4] font-semibold cursor-pointer ml-auto"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
