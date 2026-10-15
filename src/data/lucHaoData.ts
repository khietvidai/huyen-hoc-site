/**
 * Module Dữ liệu và Thuật toán Lục Hào Nạp Giáp (京房纳甲 - Kinh Phòng Nạp Giáp)
 * Chuẩn xác theo Dã Hạc Lão Nhân (Tăng San Bốc Dịch) & Bốc Phệ Chính Tông.
 * 
 * Cung cấp:
 * 1. Phân định 64 Quẻ vào 8 Cung (Càn, Khảm, Cấn, Chấn, Tốn, Ly, Khôn, Đoài) & Ngũ Hành Cung.
 * 2. Xác định Hào Thế (世) và Hào Ứng (應).
 * 3. Nạp Can Chi cho 6 hào theo Nội Quái & Ngoại Quái.
 * 4. Định Lục Thân (Phụ Mẫu, Huynh Đệ, Tử Tôn, Thê Tài, Quan Quỷ).
 * 5. An Lục Thú (Thanh Long, Chu Tước, Câu Trận, Đằng Xà, Bạch Hổ, Huyền Vũ) theo Thiên Can ngày.
 * 6. Tìm Phi Thần & Phục Thần (Phi Phục Hào) khi quẻ khuyết Lục Thân từ Quẻ Bát Thuần của Cung.
 */

import { Hexagram } from "../types";

export type WuXing = "Kim" | "Mộc" | "Thủy" | "Hỏa" | "Thổ";

export type LucThan = "Phụ Mẫu" | "Huynh Đệ" | "Tử Tôn" | "Thê Tài" | "Quan Quỷ";

export type LucThu =
  | "Thanh Long"
  | "Chu Tước"
  | "Câu Trận"
  | "Đằng Xà"
  | "Bạch Hổ"
  | "Huyền Vũ";

export type ThienCan =
  | "Giáp"
  | "Ất"
  | "Bính"
  | "Đinh"
  | "Mậu"
  | "Kỷ"
  | "Canh"
  | "Tân"
  | "Nhâm"
  | "Quý";

export type DiaChi =
  | "Tý"
  | "Sửu"
  | "Dần"
  | "Mão"
  | "Thìn"
  | "Tỵ"
  | "Ngọ"
  | "Mùi"
  | "Thân"
  | "Dậu"
  | "Tuất"
  | "Hợi";

// Ngũ hành của 12 Địa Chi
export const CHI_ELEMENT: Record<DiaChi, WuXing> = {
  "Hợi": "Thủy",
  "Tý": "Thủy",
  "Dần": "Mộc",
  "Mão": "Mộc",
  "Tỵ": "Hỏa",
  "Ngọ": "Hỏa",
  "Thân": "Kim",
  "Dậu": "Kim",
  "Thìn": "Thổ",
  "Tuất": "Thổ",
  "Sửu": "Thổ",
  "Mùi": "Thổ",
};

// Đơn quái nạp can chi (Kinh Phòng nạp giáp)
interface TrigramNapGiap {
  innerCan: ThienCan;
  innerChis: [DiaChi, DiaChi, DiaChi]; // Hào 1, 2, 3
  outerCan: ThienCan;
  outerChis: [DiaChi, DiaChi, DiaChi]; // Hào 4, 5, 6
}

// 8 đơn quái nạp can chi:
// Càn: Tý Dần Thìn / Ngọ Thân Tuất
// Khôn: Mùi Tỵ Mão / Sửu Hợi Dậu
// Cấn: Thìn Ngọ Thân / Tuất Tý Dần
// Đoài: Tỵ Mão Sửu / Hợi Dậu Mùi
// Khảm: Dần Thìn Ngọ / Thân Tuất Tý
// Ly: Mão Sửu Hợi / Dậu Mùi Tỵ
// Chấn: Tý Dần Thìn / Ngọ Thân Tuất
// Tốn: Sửu Hợi Dậu / Mùi Tỵ Mão
export const TRIGRAM_NAP_GIAP: Record<string, TrigramNapGiap> = {
  "Càn": {
    innerCan: "Giáp",
    innerChis: ["Tý", "Dần", "Thìn"],
    outerCan: "Nhâm",
    outerChis: ["Ngọ", "Thân", "Tuất"],
  },
  "Khôn": {
    innerCan: "Ất",
    innerChis: ["Mùi", "Tỵ", "Mão"],
    outerCan: "Quý",
    outerChis: ["Sửu", "Hợi", "Dậu"],
  },
  "Cấn": {
    innerCan: "Bính",
    innerChis: ["Thìn", "Ngọ", "Thân"],
    outerCan: "Bính",
    outerChis: ["Tuất", "Tý", "Dần"],
  },
  "Đoài": {
    innerCan: "Đinh",
    innerChis: ["Tỵ", "Mão", "Sửu"],
    outerCan: "Đinh",
    outerChis: ["Hợi", "Dậu", "Mùi"],
  },
  "Khảm": {
    innerCan: "Mậu",
    innerChis: ["Dần", "Thìn", "Ngọ"],
    outerCan: "Mậu",
    outerChis: ["Thân", "Tuất", "Tý"],
  },
  "Ly": {
    innerCan: "Kỷ",
    innerChis: ["Mão", "Sửu", "Hợi"],
    outerCan: "Kỷ",
    outerChis: ["Dậu", "Mùi", "Tỵ"],
  },
  "Chấn": {
    innerCan: "Canh",
    innerChis: ["Tý", "Dần", "Thìn"],
    outerCan: "Canh",
    outerChis: ["Ngọ", "Thân", "Tuất"],
  },
  "Tốn": {
    innerCan: "Tân",
    innerChis: ["Sửu", "Hợi", "Dậu"],
    outerCan: "Tân",
    outerChis: ["Mùi", "Tỵ", "Mão"],
  },
};

export interface PalaceInfo {
  palaceName: "Càn" | "Khảm" | "Cấn" | "Chấn" | "Tốn" | "Ly" | "Khôn" | "Đoài";
  palaceElement: WuXing;
  pureHexNumber: number; // Số thứ tự quẻ Bát Thuần trong Cung
  rankName: "Bát Thuần" | "Nhất Thế" | "Nhị Thế" | "Tam Thế" | "Tứ Thế" | "Ngũ Thế" | "Du Hồn" | "Quy Hồn";
  theLine: number; // 1 to 6
  ungLine: number; // 1 to 6
}

// Bảng 64 quẻ thuộc Bát Cung chuẩn xác theo Dã Hạc Lão Nhân:
export const HEXAGRAM_PALACE_MAP: Record<number, PalaceInfo> = {
  // --- 1. CUNG CÀN (KIM) ---
  1: { palaceName: "Càn", palaceElement: "Kim", pureHexNumber: 1, rankName: "Bát Thuần", theLine: 6, ungLine: 3 },
  44: { palaceName: "Càn", palaceElement: "Kim", pureHexNumber: 1, rankName: "Nhất Thế", theLine: 1, ungLine: 4 }, // Thiên Phong Cấu
  33: { palaceName: "Càn", palaceElement: "Kim", pureHexNumber: 1, rankName: "Nhị Thế", theLine: 2, ungLine: 5 }, // Thiên Sơn Độn
  12: { palaceName: "Càn", palaceElement: "Kim", pureHexNumber: 1, rankName: "Tam Thế", theLine: 3, ungLine: 6 }, // Thiên Địa Bĩ
  20: { palaceName: "Càn", palaceElement: "Kim", pureHexNumber: 1, rankName: "Tứ Thế", theLine: 4, ungLine: 1 }, // Phong Địa Quan
  23: { palaceName: "Càn", palaceElement: "Kim", pureHexNumber: 1, rankName: "Ngũ Thế", theLine: 5, ungLine: 2 }, // Sơn Địa Bác
  35: { palaceName: "Càn", palaceElement: "Kim", pureHexNumber: 1, rankName: "Du Hồn", theLine: 4, ungLine: 1 }, // Hỏa Địa Tấn
  14: { palaceName: "Càn", palaceElement: "Kim", pureHexNumber: 1, rankName: "Quy Hồn", theLine: 3, ungLine: 6 }, // Hỏa Thiên Đại Hữu

  // --- 2. CUNG KHẢM (THỦY) ---
  29: { palaceName: "Khảm", palaceElement: "Thủy", pureHexNumber: 29, rankName: "Bát Thuần", theLine: 6, ungLine: 3 }, // Thuần Khảm
  60: { palaceName: "Khảm", palaceElement: "Thủy", pureHexNumber: 29, rankName: "Nhất Thế", theLine: 1, ungLine: 4 }, // Thủy Trạch Tiết
  3: { palaceName: "Khảm", palaceElement: "Thủy", pureHexNumber: 29, rankName: "Nhị Thế", theLine: 2, ungLine: 5 }, // Thủy Lôi Truân
  63: { palaceName: "Khảm", palaceElement: "Thủy", pureHexNumber: 29, rankName: "Tam Thế", theLine: 3, ungLine: 6 }, // Thủy Hỏa Ký Tế
  49: { palaceName: "Khảm", palaceElement: "Thủy", pureHexNumber: 29, rankName: "Tứ Thế", theLine: 4, ungLine: 1 }, // Trạch Hỏa Cách
  55: { palaceName: "Khảm", palaceElement: "Thủy", pureHexNumber: 29, rankName: "Ngũ Thế", theLine: 5, ungLine: 2 }, // Lôi Hỏa Phong
  36: { palaceName: "Khảm", palaceElement: "Thủy", pureHexNumber: 29, rankName: "Du Hồn", theLine: 4, ungLine: 1 }, // Địa Hỏa Minh Di
  7: { palaceName: "Khảm", palaceElement: "Thủy", pureHexNumber: 29, rankName: "Quy Hồn", theLine: 3, ungLine: 6 }, // Địa Thủy Sư

  // --- 3. CUNG CẤN (THỔ) ---
  52: { palaceName: "Cấn", palaceElement: "Thổ", pureHexNumber: 52, rankName: "Bát Thuần", theLine: 6, ungLine: 3 }, // Thuần Cấn
  22: { palaceName: "Cấn", palaceElement: "Thổ", pureHexNumber: 52, rankName: "Nhất Thế", theLine: 1, ungLine: 4 }, // Sơn Hỏa Bí
  26: { palaceName: "Cấn", palaceElement: "Thổ", pureHexNumber: 52, rankName: "Nhị Thế", theLine: 2, ungLine: 5 }, // Sơn Thiên Đại Súc
  41: { palaceName: "Cấn", palaceElement: "Thổ", pureHexNumber: 52, rankName: "Tam Thế", theLine: 3, ungLine: 6 }, // Sơn Trạch Tổn
  38: { palaceName: "Cấn", palaceElement: "Thổ", pureHexNumber: 52, rankName: "Tứ Thế", theLine: 4, ungLine: 1 }, // Hỏa Trạch Khuê
  10: { palaceName: "Cấn", palaceElement: "Thổ", pureHexNumber: 52, rankName: "Ngũ Thế", theLine: 5, ungLine: 2 }, // Thiên Trạch Lý
  61: { palaceName: "Cấn", palaceElement: "Thổ", pureHexNumber: 52, rankName: "Du Hồn", theLine: 4, ungLine: 1 }, // Phong Trạch Trung Phu
  53: { palaceName: "Cấn", palaceElement: "Thổ", pureHexNumber: 52, rankName: "Quy Hồn", theLine: 3, ungLine: 6 }, // Phong Sơn Tiệm

  // --- 4. CUNG CHẤN (MỘC) ---
  51: { palaceName: "Chấn", palaceElement: "Mộc", pureHexNumber: 51, rankName: "Bát Thuần", theLine: 6, ungLine: 3 }, // Thuần Chấn
  16: { palaceName: "Chấn", palaceElement: "Mộc", pureHexNumber: 51, rankName: "Nhất Thế", theLine: 1, ungLine: 4 }, // Lôi Địa Dự
  40: { palaceName: "Chấn", palaceElement: "Mộc", pureHexNumber: 51, rankName: "Nhị Thế", theLine: 2, ungLine: 5 }, // Lôi Thủy Giải
  32: { palaceName: "Chấn", palaceElement: "Mộc", pureHexNumber: 51, rankName: "Tam Thế", theLine: 3, ungLine: 6 }, // Lôi Phong Hằng
  46: { palaceName: "Chấn", palaceElement: "Mộc", pureHexNumber: 51, rankName: "Tứ Thế", theLine: 4, ungLine: 1 }, // Địa Phong Thăng
  48: { palaceName: "Chấn", palaceElement: "Mộc", pureHexNumber: 51, rankName: "Ngũ Thế", theLine: 5, ungLine: 2 }, // Thủy Phong Tỉnh
  28: { palaceName: "Chấn", palaceElement: "Mộc", pureHexNumber: 51, rankName: "Du Hồn", theLine: 4, ungLine: 1 }, // Trạch Phong Đại Quá
  17: { palaceName: "Chấn", palaceElement: "Mộc", pureHexNumber: 51, rankName: "Quy Hồn", theLine: 3, ungLine: 6 }, // Trạch Lôi Tùy

  // --- 5. CUNG TỐN (MỘC) ---
  57: { palaceName: "Tốn", palaceElement: "Mộc", pureHexNumber: 57, rankName: "Bát Thuần", theLine: 6, ungLine: 3 }, // Thuần Tốn
  9: { palaceName: "Tốn", palaceElement: "Mộc", pureHexNumber: 57, rankName: "Nhất Thế", theLine: 1, ungLine: 4 }, // Phong Thiên Tiểu Súc
  37: { palaceName: "Tốn", palaceElement: "Mộc", pureHexNumber: 57, rankName: "Nhị Thế", theLine: 2, ungLine: 5 }, // Phong Hỏa Gia Nhân
  42: { palaceName: "Tốn", palaceElement: "Mộc", pureHexNumber: 57, rankName: "Tam Thế", theLine: 3, ungLine: 6 }, // Phong Lôi Ích
  25: { palaceName: "Tốn", palaceElement: "Mộc", pureHexNumber: 57, rankName: "Tứ Thế", theLine: 4, ungLine: 1 }, // Thiên Lôi Vô Vọng
  21: { palaceName: "Tốn", palaceElement: "Mộc", pureHexNumber: 57, rankName: "Ngũ Thế", theLine: 5, ungLine: 2 }, // Hỏa Lôi Phệ Hạp
  27: { palaceName: "Tốn", palaceElement: "Mộc", pureHexNumber: 57, rankName: "Du Hồn", theLine: 4, ungLine: 1 }, // Sơn Lôi Di
  18: { palaceName: "Tốn", palaceElement: "Mộc", pureHexNumber: 57, rankName: "Quy Hồn", theLine: 3, ungLine: 6 }, // Sơn Phong Cổ

  // --- 6. CUNG LY (HỎA) ---
  30: { palaceName: "Ly", palaceElement: "Hỏa", pureHexNumber: 30, rankName: "Bát Thuần", theLine: 6, ungLine: 3 }, // Thuần Ly
  56: { palaceName: "Ly", palaceElement: "Hỏa", pureHexNumber: 30, rankName: "Nhất Thế", theLine: 1, ungLine: 4 }, // Hỏa Sơn Lữ
  50: { palaceName: "Ly", palaceElement: "Hỏa", pureHexNumber: 30, rankName: "Nhị Thế", theLine: 2, ungLine: 5 }, // Hỏa Phong Đỉnh
  64: { palaceName: "Ly", palaceElement: "Hỏa", pureHexNumber: 30, rankName: "Tam Thế", theLine: 3, ungLine: 6 }, // Hỏa Thủy Vị Tế
  4: { palaceName: "Ly", palaceElement: "Hỏa", pureHexNumber: 30, rankName: "Tứ Thế", theLine: 4, ungLine: 1 }, // Sơn Thủy Mông
  59: { palaceName: "Ly", palaceElement: "Hỏa", pureHexNumber: 30, rankName: "Ngũ Thế", theLine: 5, ungLine: 2 }, // Phong Thủy Hoán
  6: { palaceName: "Ly", palaceElement: "Hỏa", pureHexNumber: 30, rankName: "Du Hồn", theLine: 4, ungLine: 1 }, // Thiên Thủy Tụng
  13: { palaceName: "Ly", palaceElement: "Hỏa", pureHexNumber: 30, rankName: "Quy Hồn", theLine: 3, ungLine: 6 }, // Thiên Hỏa Đồng Nhân

  // --- 7. CUNG KHÔN (THỔ) ---
  2: { palaceName: "Khôn", palaceElement: "Thổ", pureHexNumber: 2, rankName: "Bát Thuần", theLine: 6, ungLine: 3 }, // Thuần Khôn
  24: { palaceName: "Khôn", palaceElement: "Thổ", pureHexNumber: 2, rankName: "Nhất Thế", theLine: 1, ungLine: 4 }, // Địa Lôi Phục
  19: { palaceName: "Khôn", palaceElement: "Thổ", pureHexNumber: 2, rankName: "Nhị Thế", theLine: 2, ungLine: 5 }, // Địa Trạch Lâm
  11: { palaceName: "Khôn", palaceElement: "Thổ", pureHexNumber: 2, rankName: "Tam Thế", theLine: 3, ungLine: 6 }, // Địa Thiên Thái
  34: { palaceName: "Khôn", palaceElement: "Thổ", pureHexNumber: 2, rankName: "Tứ Thế", theLine: 4, ungLine: 1 }, // Lôi Thiên Đại Tráng
  43: { palaceName: "Khôn", palaceElement: "Thổ", pureHexNumber: 2, rankName: "Ngũ Thế", theLine: 5, ungLine: 2 }, // Trạch Thiên Quải
  5: { palaceName: "Khôn", palaceElement: "Thổ", pureHexNumber: 2, rankName: "Du Hồn", theLine: 4, ungLine: 1 }, // Thủy Thiên Nhu
  8: { palaceName: "Khôn", palaceElement: "Thổ", pureHexNumber: 2, rankName: "Quy Hồn", theLine: 3, ungLine: 6 }, // Thủy Địa Tỷ

  // --- 8. CUNG ĐOÀI (KIM) ---
  58: { palaceName: "Đoài", palaceElement: "Kim", pureHexNumber: 58, rankName: "Bát Thuần", theLine: 6, ungLine: 3 }, // Thuần Đoài
  31: { palaceName: "Đoài", palaceElement: "Kim", pureHexNumber: 58, rankName: "Nhất Thế", theLine: 1, ungLine: 4 }, // Trạch Sơn Hàm
  45: { palaceName: "Đoài", palaceElement: "Kim", pureHexNumber: 58, rankName: "Nhị Thế", theLine: 2, ungLine: 5 }, // Trạch Địa Tụy
  47: { palaceName: "Đoài", palaceElement: "Kim", pureHexNumber: 58, rankName: "Tam Thế", theLine: 3, ungLine: 6 }, // Trạch Thủy Khốn
  15: { palaceName: "Đoài", palaceElement: "Kim", pureHexNumber: 58, rankName: "Tứ Thế", theLine: 4, ungLine: 1 }, // Địa Sơn Khiêm
  62: { palaceName: "Đoài", palaceElement: "Kim", pureHexNumber: 58, rankName: "Ngũ Thế", theLine: 5, ungLine: 2 }, // Lôi Sơn Tiểu Quá
  54: { palaceName: "Đoài", palaceElement: "Kim", pureHexNumber: 58, rankName: "Du Hồn", theLine: 4, ungLine: 1 }, // Lôi Trạch Quy Muội
  39: { palaceName: "Đoài", palaceElement: "Kim", pureHexNumber: 58, rankName: "Quy Hồn", theLine: 3, ungLine: 6 }, // Thủy Sơn Kiển
};

// Hàm xác định Lục Thân từ Ngũ Hành Cung so với Ngũ Hành Chi của Hào
export function getLucThan(palaceElem: WuXing, lineElem: WuXing): LucThan {
  if (palaceElem === lineElem) return "Huynh Đệ";

  // Sinh và Khắc:
  const generates: Record<WuXing, WuXing> = {
    "Kim": "Thủy",
    "Thủy": "Mộc",
    "Mộc": "Hỏa",
    "Hỏa": "Thổ",
    "Thổ": "Kim",
  };

  // Cung sinh Hào ➔ Tử Tôn
  if (generates[palaceElem] === lineElem) return "Tử Tôn";

  // Hào sinh Cung ➔ Phụ Mẫu
  if (generates[lineElem] === palaceElem) return "Phụ Mẫu";

  const overcomes: Record<WuXing, WuXing> = {
    "Kim": "Mộc",
    "Mộc": "Thổ",
    "Thổ": "Thủy",
    "Thủy": "Hỏa",
    "Hỏa": "Kim",
  };

  // Cung khắc Hào ➔ Thê Tài
  if (overcomes[palaceElem] === lineElem) return "Thê Tài";

  // Hào khắc Cung ➔ Quan Quỷ
  return "Quan Quỷ";
}

// An Lục Thú khởi từ Hào 1 theo Thiên Can ngày
export function getLucThuArray(dayStem: ThienCan = "Giáp"): LucThu[] {
  const allBeasts: LucThu[] = [
    "Thanh Long",
    "Chu Tước",
    "Câu Trận",
    "Đằng Xà",
    "Bạch Hổ",
    "Huyền Vũ",
  ];

  let startIndex = 0;
  if (dayStem === "Giáp" || dayStem === "Ất") {
    startIndex = 0; // Thanh Long
  } else if (dayStem === "Bính" || dayStem === "Đinh") {
    startIndex = 1; // Chu Tước
  } else if (dayStem === "Mậu") {
    startIndex = 2; // Câu Trận
  } else if (dayStem === "Kỷ") {
    startIndex = 3; // Đằng Xà
  } else if (dayStem === "Canh" || dayStem === "Tân") {
    startIndex = 4; // Bạch Hổ
  } else if (dayStem === "Nhâm" || dayStem === "Quý") {
    startIndex = 5; // Huyền Vũ
  }

  const result: LucThu[] = [];
  for (let i = 0; i < 6; i++) {
    result.push(allBeasts[(startIndex + i) % 6]);
  }
  return result; // Index 0 là Hào 1, Index 5 là Hào 6
}

export interface LucHaoLineData {
  lineIndex: number; // 1 to 6 (1 = Sơ hào, 6 = Thượng hào)
  isYang: boolean;
  isChanging: boolean;
  traditionalName: string; // "Sơ Cửu", "Lục Nhị"...
  can: ThienCan;
  chi: DiaChi;
  canChi: string; // "Mậu Tý"
  element: WuXing; // "Thủy"
  lucThan: LucThan; // "Phụ Mẫu"
  isThe: boolean; // Hào Thế
  isUng: boolean; // Hào Ứng
  lucThu: LucThu; // "Thanh Long"
  phucThan?: {
    canChi: string;
    element: WuXing;
    lucThan: LucThan;
  };
}

export interface LucHaoHexagramDetail {
  hexagram: Hexagram;
  palace: PalaceInfo;
  lines: LucHaoLineData[]; // Hào 1 đến Hào 6
  missingLucThan: LucThan[]; // Danh sách các Lục Thân bị khuyết
  transformedHexagram?: Hexagram;
  transformedLines?: LucHaoLineData[];
  dayStem: ThienCan;
}

/**
 * Trích xuất 6 hào Nạp Giáp cho một Quẻ Kinh Dịch
 */
export function calculateLucHaoDetail(
  hex: Hexagram,
  changingLines: number[] = [],
  dayStem: ThienCan = "Giáp",
  transformedHex?: Hexagram
): LucHaoHexagramDetail {
  const palace = HEXAGRAM_PALACE_MAP[hex.number] || {
    palaceName: "Càn",
    palaceElement: "Kim",
    pureHexNumber: 1,
    rankName: "Bát Thuần",
    theLine: 6,
    ungLine: 3,
  };

  const lowerTrigramName = hex.lowerTrigram; // Nội quái
  const upperTrigramName = hex.upperTrigram; // Ngoại quái

  const lowerNap = TRIGRAM_NAP_GIAP[lowerTrigramName] || TRIGRAM_NAP_GIAP["Càn"];
  const upperNap = TRIGRAM_NAP_GIAP[upperTrigramName] || TRIGRAM_NAP_GIAP["Càn"];

  const lucThuList = getLucThuArray(dayStem);

  // Tính 6 hào hiện tại
  const presentLucThanSet = new Set<LucThan>();
  const lines: LucHaoLineData[] = [];

  for (let idx = 1; idx <= 6; idx++) {
    const isYang = hex.lines[idx - 1] === 1;
    const isChanging = changingLines.includes(idx);

    let can: ThienCan;
    let chi: DiaChi;

    if (idx <= 3) {
      can = lowerNap.innerCan;
      chi = lowerNap.innerChis[idx - 1];
    } else {
      can = upperNap.outerCan;
      chi = upperNap.outerChis[idx - 4];
    }

    const element = CHI_ELEMENT[chi];
    const lucThan = getLucThan(palace.palaceElement, element);
    presentLucThanSet.add(lucThan);

    // Tên gọi hào truyền thống:
    let rankPrefix = "";
    if (idx === 1) rankPrefix = "Sơ";
    else if (idx === 2) rankPrefix = "Nhị";
    else if (idx === 3) rankPrefix = "Tam";
    else if (idx === 4) rankPrefix = "Tứ";
    else if (idx === 5) rankPrefix = "Ngũ";
    else rankPrefix = "Thượng";

    const traditionalName =
      idx === 1
        ? isYang ? "Sơ Cửu" : "Sơ Lục"
        : idx === 6
        ? isYang ? "Thượng Cửu" : "Thượng Lục"
        : isYang ? `Cửu ${rankPrefix}` : `Lục ${rankPrefix}`;

    lines.push({
      lineIndex: idx,
      isYang,
      isChanging,
      traditionalName,
      can,
      chi,
      canChi: `${can} ${chi}`,
      element,
      lucThan,
      isThe: palace.theLine === idx,
      isUng: palace.ungLine === idx,
      lucThu: lucThuList[idx - 1],
    });
  }

  // Tìm các Lục Thân bị khuyết
  const all5LucThan: LucThan[] = ["Phụ Mẫu", "Huynh Đệ", "Tử Tôn", "Thê Tài", "Quan Quỷ"];
  const missingLucThan = all5LucThan.filter((lt) => !presentLucThanSet.has(lt));

  // Nếu có Lục Thân bị khuyết: Tra hào Phục Thần từ Quẻ Bát Thuần của Cung
  if (missingLucThan.length > 0) {
    const pureTrigramNap = TRIGRAM_NAP_GIAP[palace.palaceName] || TRIGRAM_NAP_GIAP["Càn"];

    for (let idx = 1; idx <= 6; idx++) {
      let pCan: ThienCan;
      let pChi: DiaChi;
      if (idx <= 3) {
        pCan = pureTrigramNap.innerCan;
        pChi = pureTrigramNap.innerChis[idx - 1];
      } else {
        pCan = pureTrigramNap.outerCan;
        pChi = pureTrigramNap.outerChis[idx - 4];
      }
      const pElem = CHI_ELEMENT[pChi];
      const pLucThan = getLucThan(palace.palaceElement, pElem);

      if (missingLucThan.includes(pLucThan)) {
        // Gán Phục Thần vào đúng hào tương ứng của quẻ hiện tại
        lines[idx - 1].phucThan = {
          canChi: `${pCan} ${pChi}`,
          element: pElem,
          lucThan: pLucThan,
        };
      }
    }
  }

  // Quẻ biến (nếu có)
  let transformedLines: LucHaoLineData[] | undefined;
  if (transformedHex) {
    const transPalace = HEXAGRAM_PALACE_MAP[transformedHex.number] || palace;
    const tLowerNap = TRIGRAM_NAP_GIAP[transformedHex.lowerTrigram] || TRIGRAM_NAP_GIAP["Càn"];
    const tUpperNap = TRIGRAM_NAP_GIAP[transformedHex.upperTrigram] || TRIGRAM_NAP_GIAP["Càn"];

    transformedLines = [];
    for (let idx = 1; idx <= 6; idx++) {
      const isYang = transformedHex.lines[idx - 1] === 1;
      const isOriginalChanging = changingLines.includes(idx);

      let can: ThienCan;
      let chi: DiaChi;
      if (idx <= 3) {
        can = tLowerNap.innerCan;
        chi = tLowerNap.innerChis[idx - 1];
      } else {
        can = tUpperNap.outerCan;
        chi = tUpperNap.outerChis[idx - 4];
      }

      const element = CHI_ELEMENT[chi];
      // Theo phép Dã Hạc: Hào biến lấy lục thân theo bản cung của Quẻ Chủ hoặc Quẻ Biến (thường theo Quẻ Chủ để xét hồi đầu sinh khắc)
      const lucThan = getLucThan(palace.palaceElement, element);

      let rankPrefix = "";
      if (idx === 1) rankPrefix = "Sơ";
      else if (idx === 2) rankPrefix = "Nhị";
      else if (idx === 3) rankPrefix = "Tam";
      else if (idx === 4) rankPrefix = "Tứ";
      else if (idx === 5) rankPrefix = "Ngũ";
      else rankPrefix = "Thượng";

      const traditionalName =
        idx === 1
          ? isYang ? "Sơ Cửu" : "Sơ Lục"
          : idx === 6
          ? isYang ? "Thượng Cửu" : "Thượng Lục"
          : isYang ? `Cửu ${rankPrefix}` : `Lục ${rankPrefix}`;

      transformedLines.push({
        lineIndex: idx,
        isYang,
        isChanging: isOriginalChanging,
        traditionalName,
        can,
        chi,
        canChi: `${can} ${chi}`,
        element,
        lucThan,
        isThe: transPalace.theLine === idx,
        isUng: transPalace.ungLine === idx,
        lucThu: lucThuList[idx - 1],
      });
    }
  }

  return {
    hexagram: hex,
    palace,
    lines,
    missingLucThan,
    transformedHexagram: transformedHex,
    transformedLines,
    dayStem,
  };
}

/**
 * Tính số ngày Julius (Julian Day Number) chuẩn xác thiên văn
 */
function getJDN(year: number, month: number, day: number): number {
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
 * Tính Thiên Can của ngày hiện tại theo lịch vạn niên Can Chi chuẩn xác thiên văn
 */
export function getCurrentDayStem(): ThienCan {
  const stems: ThienCan[] = [
    "Giáp",
    "Ất",
    "Bính",
    "Đinh",
    "Mậu",
    "Kỷ",
    "Canh",
    "Tân",
    "Nhâm",
    "Quý",
  ];
  let y = new Date().getFullYear();
  let m = new Date().getMonth() + 1;
  let d = new Date().getDate();
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "numeric",
      day: "numeric",
    }).formatToParts(new Date());
    y = parseInt(parts.find((p) => p.type === "year")?.value || `${y}`, 10);
    m = parseInt(parts.find((p) => p.type === "month")?.value || `${m}`, 10);
    d = parseInt(parts.find((p) => p.type === "day")?.value || `${d}`, 10);
  } catch {
    // fallback
  }
  const jdn = getJDN(y, m, d);
  const stemIdx = ((jdn + 9) % 10 + 10) % 10;
  return stems[stemIdx];
}
