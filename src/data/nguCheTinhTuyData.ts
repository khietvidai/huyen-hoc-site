/**
 * Dữ liệu & Cấu hình cho 《NGỰ CHẾ TÂN TẬP ĐOÁN DỊCH TINH TÚY》 (御製新集斷易精粹 — 1482)
 * Bảo tàng Cố Cung Đài Bắc (55 tập gốc + 9 tập bổ khuyết = 64 quyển, 1.734 trang, 1.408 tranh màu cung đình nhà Minh)
 */

export interface NguCheSeg {
  han?: string;
  hv?: string;
  vi?: string;
}

export interface NguCheBlock {
  viTri?: string;
  loai?: "chu" | "tranh";
  moTa?: string;
  doan?: NguCheSeg[];
  dichTho?: string;
  ghiChu?: string[];
}

export interface NguCheSection {
  mucIdx: number;
  pageNum: number;
  label: string;
  title: string;
  type: "bia" | "que-tuong" | "tho-tranh" | "van-xuoi" | "gieo-tien" | string;
  painting: string;
  moTaTranh: string;
  blocks: NguCheBlock[];
  notes: string[];
}

export interface NguCheHaoRow {
  hao: number;
  isYang: boolean;
  canChi: string;
  lucThan: string;
  isThe: boolean;
  isUng: boolean;
}

export interface NguCheQuyenMeta {
  quyenSo: number;
  cungSo: number;
  cungTen: string;
  cungHan: string;
  thuTuTrongCung: number;
  thuTuHan: string;
  theQuai: string;
  tenQue: string;
  chuHan: string;
  quaiTuong: string;
  loaiNguon: "goc" | "bo_khuyet";
  tapGoc?: number;
  queBoKhuyet?: number;
  trangGocTu?: number;
  trangGocDen?: number;
  trangMoiTu: number;
  trangMoiDen: number;
  soTrang: number;
}

export interface NguCheHexagramData {
  hexNumber: number;
  quyenSo: number;
  quyen: NguCheQuyenMeta;
  cungElem: string;
  theHao: number;
  ungHao: number;
  haoRows: NguCheHaoRow[];
  sections: Record<number, NguCheSection>;
}

export interface NguCheIntroPage {
  pageNum: number;
  title: string;
  type: string;
  painting: string;
  paintingLeft?: string;
  moTaTranh: string;
  blocks: NguCheBlock[];
  notes: string[];
}

export interface NguCheIntroData {
  danhSach8Cung: Array<{
    cungSo: number;
    tenCung: string;
    cungHan: string;
    nguHanh: string;
    quaiTuong: string;
    quyenTu: number;
    quyenDen: number;
    trangMoiTu: number;
    trangMoiDen: number;
    soTrang: number;
    soQuyenGoc: number;
    soQuyenBoKhuyet: number;
  }>;
  mucLuc64Quyen: NguCheQuyenMeta[];
  introPages: NguCheIntroPage[];
}

export interface NguCheDiceItem {
  diceNumber: number; // 1..12
  shortLabel: string;
  titleVi: string;
  titleHan: string;
  mucIdx: number; // 3..14 in sections
  badgeColor: string;
  description: string;
  redDotHao?: number; // Từ hào 7..12: chấm đỏ tại hào 1..6 (diceNumber - 6)
}

/**
 * Quy ước Xí Ngầu 12 Mặt Ngự Chế Tân Tập Đoán Dịch Tinh Túy:
 * - 1 tới 6: Đại diện cho Hào 1 đến Hào 6
 * - 7: Không động hào (Toàn tĩnh đoán) — 1 chấm đỏ chỗ Hào 1
 * - 8: Thế (Thế động đoán) — 1 chấm đỏ chỗ Hào 2
 * - 9: Thoán Dương (彖陽) — 1 chấm đỏ chỗ Hào 3
 * - 10: Tượng Âm (象陰) — 1 chấm đỏ chỗ Hào 4
 * - 11: Ứng (Ứng động đoán) — 1 chấm đỏ chỗ Hào 5
 * - 12: Động 6 hào (Toàn động đoán) — 1 chấm đỏ chỗ Hào 6
 */
export const NGU_CHE_DICE_ITEMS: NguCheDiceItem[] = [
  {
    diceNumber: 1,
    shortLabel: "Hào 1 (Sơ)",
    titleVi: "Hào 1 Động (Sơ Hào Đoán)",
    titleHan: "初爻斷",
    mucIdx: 5,
    badgeColor: "from-amber-600 to-yellow-600 text-amber-100 border-amber-400/60",
    description: "Hào Sơ (Hào 1 dưới cùng) phát động — Khởi đầu sự việc, căn cơ ban sơ.",
  },
  {
    diceNumber: 2,
    shortLabel: "Hào 2 (Nhị)",
    titleVi: "Hào 2 Động (Nhị Hào Đoán)",
    titleHan: "二爻斷",
    mucIdx: 6,
    badgeColor: "from-amber-600 to-yellow-600 text-amber-100 border-amber-400/60",
    description: "Hào Nhị (Hào 2 trung vị nội quái) phát động — Nội tình, gia trạch, bước tiến thứ hai.",
  },
  {
    diceNumber: 3,
    shortLabel: "Hào 3 (Tam)",
    titleVi: "Hào 3 Động (Tam Hào Đoán)",
    titleHan: "三爻斷",
    mucIdx: 7,
    badgeColor: "from-amber-600 to-yellow-600 text-amber-100 border-amber-400/60",
    description: "Hào Tam (Hào 3 đỉnh nội quái) phát động — Giao thời nội ngoại, bước ngoặt chuyển tiếp.",
  },
  {
    diceNumber: 4,
    shortLabel: "Hào 4 (Tứ)",
    titleVi: "Hào 4 Động (Tứ Hào Đoán)",
    titleHan: "四爻斷",
    mucIdx: 8,
    badgeColor: "from-amber-600 to-yellow-600 text-amber-100 border-amber-400/60",
    description: "Hào Tứ (Hào 4 khởi ngoại quái) phát động — Bước ra ngoại cảnh, cận thần, cơ hội mới.",
  },
  {
    diceNumber: 5,
    shortLabel: "Hào 5 (Ngũ)",
    titleVi: "Hào 5 Động (Ngũ Hào Đoán)",
    titleHan: "五爻斷",
    mucIdx: 9,
    badgeColor: "from-amber-600 to-yellow-600 text-amber-100 border-amber-400/60",
    description: "Hào Ngũ (Hào 5 ngôi Chí Tôn) phát động — Đỉnh cao quyền lực, quý nhân, trung chính.",
  },
  {
    diceNumber: 6,
    shortLabel: "Hào 6 (Thượng)",
    titleVi: "Hào 6 Động (Thượng Hào Đoán)",
    titleHan: "上爻斷",
    mucIdx: 10,
    badgeColor: "from-amber-600 to-yellow-600 text-amber-100 border-amber-400/60",
    description: "Hào Thượng (Hào 6 trên cùng) phát động — Cực điểm sự việc, vật cực tất phản, kết cục.",
  },
  {
    diceNumber: 7,
    shortLabel: "Không Động Hào",
    titleVi: "Không Động Hào (Toàn Tĩnh Đoán)",
    titleHan: "全靜斷",
    mucIdx: 12,
    badgeColor: "from-teal-700 to-emerald-700 text-teal-100 border-teal-400/60",
    description: "Lục hào toàn tĩnh (không hào nào động) — Giữ nguyên bản quẻ, lấy tĩnh chế động.",
  },
  {
    diceNumber: 8,
    shortLabel: "Thế Động",
    titleVi: "Hào Thế Động (Thế Động Đoán)",
    titleHan: "世動斷",
    mucIdx: 13,
    badgeColor: "from-rose-700 to-red-700 text-rose-100 border-rose-400/60",
    description: "Hào Thế phát động — Đại diện bản thân người hỏi quẻ chủ động biến chuyển.",
  },
  {
    diceNumber: 9,
    shortLabel: "Thoán Dương",
    titleVi: "Thoán Dương (Lời Thoán Toàn Quẻ)",
    titleHan: "彖　陽",
    mucIdx: 3,
    badgeColor: "from-orange-600 to-red-600 text-orange-100 border-orange-400/60",
    description: "Thoán từ (Dương) — Đại cương khí vận Dương của toàn quẻ theo Đoán Dịch Thần Giám.",
  },
  {
    diceNumber: 10,
    shortLabel: "Tượng Âm",
    titleVi: "Tượng Âm (Hình Tượng Toàn Quẻ)",
    titleHan: "象　陰",
    mucIdx: 4,
    badgeColor: "from-indigo-700 to-purple-700 text-indigo-100 border-indigo-400/60",
    description: "Tượng từ (Âm) — Ẩn ý hình tượng Âm của toàn quẻ theo Đoán Dịch Thần Giám.",
  },
  {
    diceNumber: 11,
    shortLabel: "Ứng Động",
    titleVi: "Hào Ứng Động (Ứng Động Đoán)",
    titleHan: "應動斷",
    mucIdx: 14,
    badgeColor: "from-cyan-700 to-blue-700 text-cyan-100 border-cyan-400/60",
    description: "Hào Ứng phát động — Đại diện đối phương, khách thể, mục tiêu cầu mưu chuyển động.",
  },
  {
    diceNumber: 12,
    shortLabel: "Động 6 Hào",
    titleVi: "Động Cả 6 Hào (Toàn Động Đoán)",
    titleHan: "全動斷",
    mucIdx: 11,
    badgeColor: "from-fuchsia-700 to-purple-800 text-fuchsia-100 border-fuchsia-400/60",
    description: "Lục hào toàn động (cả 6 hào cùng biến) — Đại biến cục, xoay chuyển toàn diện.",
  },
];

export interface NguCheDayStemItem {
  canIdx: number; // 0..9
  canVi: string;
  canHan: string;
  nguHanh: string;
  amDuong: string;
  mucIdx: number; // 15..24
  titleVi: string;
  titleHan: string;
}

export const NGU_CHE_DAY_STEMS: NguCheDayStemItem[] = [
  { canIdx: 0, canVi: "Giáp", canHan: "甲", nguHanh: "Mộc", amDuong: "Dương", mucIdx: 15, titleVi: "Giáp Nhật Đoán (Ngày Giáp)", titleHan: "甲日斷" },
  { canIdx: 1, canVi: "Ất", canHan: "乙", nguHanh: "Mộc", amDuong: "Âm", mucIdx: 16, titleVi: "Ất Nhật Đoán (Ngày Ất)", titleHan: "乙日斷" },
  { canIdx: 2, canVi: "Bính", canHan: "丙", nguHanh: "Hỏa", amDuong: "Dương", mucIdx: 17, titleVi: "Bính Nhật Đoán (Ngày Bính)", titleHan: "丙日斷" },
  { canIdx: 3, canVi: "Đinh", canHan: "丁", nguHanh: "Hỏa", amDuong: "Âm", mucIdx: 18, titleVi: "Đinh Nhật Đoán (Ngày Đinh)", titleHan: "丁日斷" },
  { canIdx: 4, canVi: "Mậu", canHan: "戊", nguHanh: "Thổ", amDuong: "Dương", mucIdx: 19, titleVi: "Mậu Nhật Đoán (Ngày Mậu)", titleHan: "戊日斷" },
  { canIdx: 5, canVi: "Kỷ", canHan: "己", nguHanh: "Thổ", amDuong: "Âm", mucIdx: 20, titleVi: "Kỷ Nhật Đoán (Ngày Kỷ)", titleHan: "己日斷" },
  { canIdx: 6, canVi: "Canh", canHan: "庚", nguHanh: "Kim", amDuong: "Dương", mucIdx: 21, titleVi: "Canh Nhật Đoán (Ngày Canh)", titleHan: "庚日斷" },
  { canIdx: 7, canVi: "Tân", canHan: "辛", nguHanh: "Kim", amDuong: "Âm", mucIdx: 22, titleVi: "Tân Nhật Đoán (Ngày Tân)", titleHan: "辛日斷" },
  { canIdx: 8, canVi: "Nhâm", canHan: "壬", nguHanh: "Thủy", amDuong: "Dương", mucIdx: 23, titleVi: "Nhâm Nhật Đoán (Ngày Nhâm)", titleHan: "壬日斷" },
  { canIdx: 9, canVi: "Quý", canHan: "癸", nguHanh: "Thủy", amDuong: "Âm", mucIdx: 24, titleVi: "Quý Nhật Đoán (Ngày Quý)", titleHan: "癸日斷" },
];

export const LUC_THAN_VI_MAP: Record<string, string> = {
  "父母": "Phụ Mẫu",
  "兄弟": "Huynh Đệ",
  "子孫": "Tử Tôn",
  "妻財": "Thê Tài",
  "官鬼": "Quan Quỷ",
};

export const CUNG_HAN_VI_MAP: Record<string, string> = {
  "乾宮": "Càn Cung",
  "兌宮": "Đoài Cung",
  "離宮": "Ly Cung",
  "震宮": "Chấn Cung",
  "巽宮": "Tốn Cung",
  "坎宮": "Khảm Cung",
  "艮宮": "Cấn Cung",
  "坤宮": "Khôn Cung",
};

export const NGU_HANH_VI_MAP: Record<string, string> = {
  "金": "Kim",
  "木": "Mộc",
  "水": "Thủy",
  "火": "Hỏa",
  "土": "Thổ",
};

export const CAN_HAN_VI_MAP: Record<string, string> = {
  "甲": "Giáp",
  "乙": "Ất",
  "丙": "Bính",
  "丁": "Đinh",
  "戊": "Mậu",
  "己": "Kỷ",
  "庚": "Canh",
  "辛": "Tân",
  "壬": "Nhâm",
  "癸": "Quý",
};

export const CHI_HAN_VI_MAP: Record<string, string> = {
  "子": "Tý",
  "丑": "Sửu",
  "寅": "Dần",
  "卯": "Mão",
  "辰": "Thìn",
  "巳": "Tỵ",
  "午": "Ngọ",
  "未": "Mùi",
  "申": "Thân",
  "酉": "Dậu",
  "戌": "Tuất",
  "亥": "Hợi",
};

export function translateCanChiNguHanh(canChiHan: string): string {
  if (!canChiHan) return "";
  const chars = Array.from(canChiHan.trim());
  const parts: string[] = [];
  for (const ch of chars) {
    if (CAN_HAN_VI_MAP[ch]) parts.push(CAN_HAN_VI_MAP[ch]);
    else if (CHI_HAN_VI_MAP[ch]) parts.push(CHI_HAN_VI_MAP[ch]);
  }
  return parts.join(" ");
}

export function stripNguHanhFromCanChiHan(canChiHan: string): string {
  if (!canChiHan) return "";
  return canChiHan.replace(/[金木水火土]/g, "").trim();
}

const NGU_CHE_DATA_VERSION = "20261025_gemini_ultra_100pct_v9";
const hexCache = new Map<number, NguCheHexagramData>();
let introCache: NguCheIntroData | null = null;

export function updateNguCheHexCache(hexNumber: number, data: NguCheHexagramData) {
  hexCache.set(hexNumber, data);
}

export async function loadNguCheHexagram(hexNumber: number): Promise<NguCheHexagramData> {
  const num = Math.max(1, Math.min(64, Math.floor(hexNumber) || 1));
  const cached = hexCache.get(num);
  if (cached) return cached;

  const baseUrl = import.meta.env.BASE_URL || "/";
  const cleanBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const res = await fetch(`${cleanBase}ngu-che/hex_${num}.json?v=${NGU_CHE_DATA_VERSION}`);
  if (!res.ok) {
    throw new Error(`Không thể tải dữ liệu Ngự Chế cho quẻ số ${num} (HTTP ${res.status})`);
  }
  const data = (await res.json()) as NguCheHexagramData;
  hexCache.set(num, data);
  return data;
}

export async function loadNguCheIntro(): Promise<NguCheIntroData> {
  if (introCache) return introCache;
  const baseUrl = import.meta.env.BASE_URL || "/";
  const cleanBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const res = await fetch(`${cleanBase}ngu-che/intro.json?v=${NGU_CHE_DATA_VERSION}`);
  if (!res.ok) {
    throw new Error(`Không thể tải dữ liệu Lời Tựa Ngự Chế (HTTP ${res.status})`);
  }
  const data = (await res.json()) as NguCheIntroData;
  introCache = data;
  return data;
}

