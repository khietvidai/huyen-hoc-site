import React from "react";

export interface CanData {
  name: string;
  chinese: string;
  polarity: "duong" | "am";
  element: "Mộc" | "Hỏa" | "Thổ" | "Kim" | "Thủy";
  colorText: string;
  badgeBg: string;
  emoji: React.ReactNode;
  symbol: string;
}

export interface ChiData {
  name: string;
  chinese: string;
  polarity: "duong" | "am";
  element: "Mộc" | "Hỏa" | "Thổ" | "Kim" | "Thủy";
  zodiac: string;
  emoji: string;
}

export interface PillarItem {
  can: string;
  chi: string;
}

export const PILLAR_LABELS = [
  { id: 0, title: "Trụ Giờ", sub: "Thời Trụ (時柱)", desc: "Hậu vận, con cái, tương lai" },
  { id: 1, title: "Trụ Ngày", sub: "Nhật Trụ (日柱)", desc: "Bản thân, hôn nhân, cốt lõi" },
  { id: 2, title: "Trụ Tháng", sub: "Nguyệt Trụ (月柱)", desc: "Gia đình, môi trường, thanh niên" },
  { id: 3, title: "Trụ Năm", sub: "Niên Trụ (年柱)", desc: "Gốc rễ, tổ tiên, xã hội" },
];

export const FieldPaddyIcon: React.FC<{ className?: string }> = ({
  className = "w-5 h-5 inline-block",
}) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Kỷ Thổ Điền Viên"
  >
    <path
      d="M3 16C3 16 8 13.5 16 13.5C24 13.5 29 16 29 16V27C29 27.55 28.55 28 28 28H4C3.45 28 3 27.55 3 27V16Z"
      fill="#451A03"
      opacity="0.85"
    />
    <path
      d="M3 19.5C7.5 17.5 12 17 16 17C20 17 24.5 17.5 29 19.5"
      stroke="#B45309"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <path
      d="M3 23.5C7.5 21.5 12 21 16 21C20 21 24.5 21.5 29 23.5"
      stroke="#92400E"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <path d="M9.5 15V27.5" stroke="#78350F" strokeWidth="1" strokeDasharray="1.5 1.5" />
    <path d="M16 14V28" stroke="#78350F" strokeWidth="1.2" />
    <path d="M22.5 15V27.5" stroke="#78350F" strokeWidth="1" strokeDasharray="1.5 1.5" />
    <path
      d="M9.5 13.5V11C9.5 9.5 8.5 8 7 8C6 8 5.5 8.5 5.5 9.5C5.5 11 8 12.5 9.5 13.5Z"
      fill="#84CC16"
    />
    <path
      d="M9.5 12.5C11 11.5 13.5 10 13.5 8.5C13.5 7.5 13 7 12 7C10.5 7 9.5 8.5 9.5 10V12.5Z"
      fill="#65A30D"
    />
    <circle cx="9.5" cy="8" r="0.8" fill="#FACC15" />
    <path
      d="M22.5 13.5V11C22.5 9.5 21.5 8 20 8C19 8 18.5 8.5 18.5 9.5C18.5 11 21 12.5 22.5 13.5Z"
      fill="#84CC16"
    />
    <path
      d="M22.5 12.5C24 11.5 26.5 10 26.5 8.5C26.5 7.5 26 7 25 7C23.5 7 22.5 8.5 22.5 10V12.5Z"
      fill="#65A30D"
    />
    <circle cx="22.5" cy="8" r="0.8" fill="#FACC15" />
    <line x1="6.5" y1="21" x2="12.5" y2="21" stroke="#D9F99D" strokeWidth="1" strokeLinecap="round" />
    <line x1="6.5" y1="24" x2="12.5" y2="24" stroke="#D9F99D" strokeWidth="1" strokeLinecap="round" />
    <line x1="19.5" y1="21" x2="25.5" y2="21" stroke="#D9F99D" strokeWidth="1" strokeLinecap="round" />
    <line x1="19.5" y1="24" x2="25.5" y2="24" stroke="#D9F99D" strokeWidth="1" strokeLinecap="round" />
  </svg>
);

export function getElementBoxStyle(element?: string): string {
  switch (element) {
    case "Mộc":
      return "bg-[#FDFBF7] border-[#D8C8A8]/70 text-[#1E5631]";
    case "Hỏa":
      return "bg-[#FDFBF7] border-[#D8C8A8]/70 text-[#9E2A2B]";
    case "Thổ":
      return "bg-[#FDFBF7] border-[#D8C8A8]/70 text-[#7A4B13]";
    case "Kim":
      return "bg-[#FDFBF7] border-[#D8C8A8]/70 text-[#3F4756]";
    case "Thủy":
      return "bg-[#FDFBF7] border-[#D8C8A8]/70 text-[#1E467A]";
    default:
      return "bg-[#FDFBF7] border-[#D8C8A8]/70 text-[#1C1813]";
  }
}

export const CAN_LIST: CanData[] = [
  {
    name: "Giáp",
    chinese: "甲",
    polarity: "duong",
    element: "Mộc",
    colorText: "text-[#14532D]",
    badgeBg: "bg-[#DCFCE7] border-[#16A34A]/50 text-[#14532D]",
    emoji: "甲",
    symbol: "Dương Mộc",
  },
  {
    name: "Ất",
    chinese: "乙",
    polarity: "am",
    element: "Mộc",
    colorText: "text-[#15803D]",
    badgeBg: "bg-[#DCFCE7] border-[#16A34A]/50 text-[#14532D]",
    emoji: "乙",
    symbol: "Âm Mộc",
  },
  {
    name: "Bính",
    chinese: "丙",
    polarity: "duong",
    element: "Hỏa",
    colorText: "text-[#991B1B]",
    badgeBg: "bg-[#FEE2E2] border-[#DC2626]/50 text-[#991B1B]",
    emoji: "丙",
    symbol: "Dương Hỏa",
  },
  {
    name: "Đinh",
    chinese: "丁",
    polarity: "am",
    element: "Hỏa",
    colorText: "text-[#B91C1C]",
    badgeBg: "bg-[#FEE2E2] border-[#DC2626]/50 text-[#991B1B]",
    emoji: "丁",
    symbol: "Âm Hỏa",
  },
  {
    name: "Mậu",
    chinese: "戊",
    polarity: "duong",
    element: "Thổ",
    colorText: "text-[#78350F]",
    badgeBg: "bg-[#FEF3C7] border-[#D97706]/55 text-[#78350F]",
    emoji: "戊",
    symbol: "Dương Thổ",
  },
  {
    name: "Kỷ",
    chinese: "己",
    polarity: "am",
    element: "Thổ",
    colorText: "text-[#92400E]",
    badgeBg: "bg-[#FEF3C7] border-[#D97706]/55 text-[#78350F]",
    emoji: "己",
    symbol: "Âm Thổ",
  },
  {
    name: "Canh",
    chinese: "庚",
    polarity: "duong",
    element: "Kim",
    colorText: "text-[#3F3F46]",
    badgeBg: "bg-[#F4F4F5] border-[#A1A1AA]/65 text-[#3F3F46]",
    emoji: "庚",
    symbol: "Dương Kim",
  },
  {
    name: "Tân",
    chinese: "辛",
    polarity: "am",
    element: "Kim",
    colorText: "text-[#52525B]",
    badgeBg: "bg-[#F4F4F5] border-[#A1A1AA]/65 text-[#3F3F46]",
    emoji: "辛",
    symbol: "Âm Kim",
  },
  {
    name: "Nhâm",
    chinese: "壬",
    polarity: "duong",
    element: "Thủy",
    colorText: "text-[#1E3A8A]",
    badgeBg: "bg-[#DBEAFE] border-[#2563EB]/50 text-[#1E3A8A]",
    emoji: "壬",
    symbol: "Dương Thủy",
  },
  {
    name: "Quý",
    chinese: "癸",
    polarity: "am",
    element: "Thủy",
    colorText: "text-[#1D4ED8]",
    badgeBg: "bg-[#DBEAFE] border-[#2563EB]/50 text-[#1E3A8A]",
    emoji: "癸",
    symbol: "Âm Thủy",
  },
];

export const CHI_LIST: ChiData[] = [
  {
    name: "Tý",
    chinese: "子",
    polarity: "duong",
    element: "Thủy",
    zodiac: "Dương Thủy",
    emoji: "子",
  },
  {
    name: "Sửu",
    chinese: "丑",
    polarity: "am",
    element: "Thổ",
    zodiac: "Âm Thổ",
    emoji: "丑",
  },
  {
    name: "Dần",
    chinese: "寅",
    polarity: "duong",
    element: "Mộc",
    zodiac: "Dương Mộc",
    emoji: "寅",
  },
  {
    name: "Mão",
    chinese: "卯",
    polarity: "am",
    element: "Mộc",
    zodiac: "Âm Mộc",
    emoji: "卯",
  },
  {
    name: "Thìn",
    chinese: "辰",
    polarity: "duong",
    element: "Thổ",
    zodiac: "Dương Thổ",
    emoji: "辰",
  },
  {
    name: "Tỵ",
    chinese: "巳",
    polarity: "am",
    element: "Hỏa",
    zodiac: "Âm Hỏa",
    emoji: "巳",
  },
  {
    name: "Ngọ",
    chinese: "午",
    polarity: "duong",
    element: "Hỏa",
    zodiac: "Dương Hỏa",
    emoji: "午",
  },
  {
    name: "Mùi",
    chinese: "未",
    polarity: "am",
    element: "Thổ",
    zodiac: "Âm Thổ",
    emoji: "未",
  },
  {
    name: "Thân",
    chinese: "申",
    polarity: "duong",
    element: "Kim",
    zodiac: "Dương Kim",
    emoji: "申",
  },
  {
    name: "Dậu",
    chinese: "酉",
    polarity: "am",
    element: "Kim",
    zodiac: "Âm Kim",
    emoji: "酉",
  },
  {
    name: "Tuất",
    chinese: "戌",
    polarity: "duong",
    element: "Thổ",
    zodiac: "Dương Thổ",
    emoji: "戌",
  },
  {
    name: "Hợi",
    chinese: "亥",
    polarity: "am",
    element: "Thủy",
    zodiac: "Âm Thủy",
    emoji: "亥",
  },
];

export const CAN_MAP = new Map<string, CanData>(CAN_LIST.map((c) => [c.name, c]));

export const CHI_MAP = new Map<string, ChiData>();
CHI_LIST.forEach((c) => {
  CHI_MAP.set(c.name, c);
  CHI_MAP.set(c.chinese, c);
  CHI_MAP.set(`(${c.name})`, c);
  CHI_MAP.set(`[${c.name}]`, c);
  CHI_MAP.set(c.name.toLowerCase(), c);
  CHI_MAP.set(c.name.toUpperCase(), c);
});

// Common orthographic and typographical aliases for Vietnamese branches:
const tyData = CHI_MAP.get("Tỵ");
if (tyData) {
  CHI_MAP.set("Tị", tyData);
  CHI_MAP.set("(Tị)", tyData);
  CHI_MAP.set("[Tị]", tyData);
  CHI_MAP.set("tị", tyData);
  CHI_MAP.set("TỊ", tyData);
}
const ty1Data = CHI_MAP.get("Tý");
if (ty1Data) {
  CHI_MAP.set("Tí", ty1Data);
  CHI_MAP.set("(Tí)", ty1Data);
  CHI_MAP.set("[Tí]", ty1Data);
  CHI_MAP.set("tí", ty1Data);
  CHI_MAP.set("TÍ", ty1Data);
}
const maoData = CHI_MAP.get("Mão");
if (maoData) {
  CHI_MAP.set("Mẹo", maoData);
  CHI_MAP.set("(Mẹo)", maoData);
  CHI_MAP.set("[Mẹo]", maoData);
  CHI_MAP.set("mẹo", maoData);
  CHI_MAP.set("MẸO", maoData);
}

/**
 * Trích xuất và tra cứu dữ liệu Chi chuẩn xác từ bất kỳ chuỗi tên/nhãn Chi nào
 */
export function getChiData(name?: string): ChiData | undefined {
  if (!name) return undefined;
  const raw = String(name).trim();
  if (CHI_MAP.has(raw)) return CHI_MAP.get(raw);
  const clean = raw.replace(/[()\[\]{}:,.\s]/g, "").trim();
  if (CHI_MAP.has(clean)) return CHI_MAP.get(clean);
  for (const c of CHI_LIST) {
    if (clean.endsWith(c.name) || clean.endsWith(c.chinese)) {
      return c;
    }
  }
  if (clean.endsWith("Tị")) return CHI_MAP.get("Tỵ");
  if (clean.endsWith("Tí")) return CHI_MAP.get("Tý");
  if (clean.endsWith("Mẹo")) return CHI_MAP.get("Mão");
  return undefined;
}

export const DUONG_CAN_NAMES = ["Giáp", "Bính", "Mậu", "Canh", "Nhâm"];
export const AM_CAN_NAMES = ["Ất", "Đinh", "Kỷ", "Tân", "Quý"];

export const DUONG_CHI_NAMES = ["Tý", "Dần", "Thìn", "Ngọ", "Thân", "Tuất"];
export const AM_CHI_NAMES = ["Sửu", "Mão", "Tỵ", "Mùi", "Dậu", "Hợi"];

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

/**
 * Tính số ngày Julius (Julian Day Number) chuẩn xác thiên văn
 */
export function getJulianDayNumber(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

/**
 * Lấy các thành phần thời gian theo múi giờ Việt Nam (Asia/Ho_Chi_Minh - UTC+7)
 */
export function getVietnamDateTime(date = new Date()): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
} {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    }).formatToParts(date);
    const getPart = (type: string) =>
      parseInt(parts.find((p) => p.type === type)?.value || "0", 10);
    return {
      year: getPart("year"),
      month: getPart("month"),
      day: getPart("day"),
      hour: getPart("hour"),
      minute: getPart("minute"),
    };
  } catch {
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes(),
    };
  }
}

/**
 * Tính toán Bát Tự theo thời gian thực hiện tại (theo chuẩn thiên văn Lịch Can Chi & Tiết Khí)
 * Thứ tự: Giờ • Ngày • Tháng • Năm
 */
export function getCurrentBaziPillars(): [PillarItem, PillarItem, PillarItem, PillarItem] {
  const { year, month, day, hour } = getVietnamDateTime();

  // 1. Trụ Năm (Xét Tiết Lập Xuân ~ ngày 4/2)
  const isBeforeLapXuan = month === 1 || (month === 2 && day < 4);
  const baziYear = isBeforeLapXuan ? year - 1 : year;
  const yearCanIdx = ((baziYear - 4) % 10 + 10) % 10;
  const yearChiIdx = ((baziYear - 4) % 12 + 12) % 12;

  // 2. Trụ Ngày (Tính chuẩn theo số ngày Julius - JDN thiên văn)
  const jdn = getJulianDayNumber(year, month, day);
  const dayCanIdx = ((jdn + 9) % 10 + 10) % 10;
  const dayChiIdx = ((jdn + 1) % 12 + 12) % 12;

  // 3. Trụ Tháng (Xét tiết khí chuyển tháng & Ngũ Hổ Độn)
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

  // 4. Trụ Giờ (Ngũ Thử Độn từ Can của Ngày)
  const hourChiIdx = Math.floor(((hour + 1) % 24) / 2);
  const baseHourCan = (dayCanIdx % 5) * 2;
  const hourCanIdx = (baseHourCan + hourChiIdx) % 10;

  // Trả về thứ tự: Giờ • Ngày • Tháng • Năm
  return [
    { can: CAN_LIST[hourCanIdx].name, chi: CHI_LIST[hourChiIdx].name },
    { can: CAN_LIST[dayCanIdx].name, chi: CHI_LIST[dayChiIdx].name },
    { can: CAN_LIST[monthCanIdx].name, chi: CHI_LIST[monthChiIdx].name },
    { can: CAN_LIST[yearCanIdx].name, chi: CHI_LIST[yearChiIdx].name },
  ];
}
