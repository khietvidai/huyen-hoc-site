/**
 * Dữ liệu và Thuật toán Thái Ất Thần Số (Taiyi Shenshu - 太乙神數)
 * Đệ Nhất Thuật Số trong Tam Thức Cổ Truyền (Thái Ất coi Thiên Thời, Kỳ Môn coi Địa Lợi, Lục Nhâm coi Nhân Sự)
 * Bao gồm: Thái Ất Cửu Cung, Thập Lục Thần, 72 Cục Âm Dương, Chủ Toán - Khách Toán, Ngũ Phúc Cát Tinh và Thái Ất Hóa Dịch.
 */

import { Hexagram } from "../types";
import { HEXAGRAMS, findHexagramByLines, getTransformedHexagram } from "./hexagrams";
import { TIEN_THIEN_BAT_QUAI, TrigramData } from "../components/MaiHoaDivination";

// =========================================================================
// 1. CỬU CUNG THÁI ẤT (9 Palaces of Taiyi)
// Khác Lạc Thư thường, Cửu Cung Thái Ất số phối:
// 1 Càn, 2 Ly, 3 Cấn, 4 Chấn, 5 Trung Cung, 6 Đoài, 7 Khôn, 8 Khảm, 9 Tốn
// =========================================================================

export interface ThaiAtPalace {
  num: number; // 1..9
  name: string; // Càn, Ly, Cấn, Chấn, Trung Cung, Đoài, Khôn, Khảm, Tốn
  chinese: string;
  direction: string;
  element: "Kim" | "Mộc" | "Thủy" | "Hỏa" | "Thổ";
  symbol: string;
  fourGates: string; // Tứ Môn Thái Ất hoặc 16 Thần phụ trách
  nature: string;
  gridRow: number; // 0..2
  gridCol: number; // 0..2
  trigramNum: number; // Đối ứng Tiên Thiên Bát Quái
}

export const THAI_AT_PALACES: Record<number, ThaiAtPalace> = {
  // Hàng 0 (Bắc - Tây Bắc - Đông Bắc trong layout bàn)
  9: {
    num: 9,
    name: "Tốn",
    chinese: "巽",
    direction: "Đông Nam",
    element: "Mộc",
    symbol: "☴",
    fourGates: "Hòa Đức",
    nature: "Gió, sinh sôi, uyển chuyển, lan tỏa",
    gridRow: 0,
    gridCol: 0,
    trigramNum: 5,
  },
  2: {
    num: 2,
    name: "Ly",
    chinese: "離",
    direction: "Chính Nam",
    element: "Hỏa",
    symbol: "☲",
    fourGates: "Đại Minh",
    nature: "Lửa, văn minh, sáng suốt, thấu triệt",
    gridRow: 0,
    gridCol: 1,
    trigramNum: 3,
  },
  7: {
    num: 7,
    name: "Khôn",
    chinese: "坤",
    direction: "Tây Nam",
    element: "Thổ",
    symbol: "☷",
    fourGates: "Hậu Đức",
    nature: "Đất, nhu thuận, dung nạp, nâng đỡ",
    gridRow: 0,
    gridCol: 2,
    trigramNum: 8,
  },
  // Hàng 1
  4: {
    num: 4,
    name: "Chấn",
    chinese: "震",
    direction: "Chính Đông",
    element: "Mộc",
    symbol: "☳",
    fourGates: "Lôi Động",
    nature: "Sấm, chấn khởi, bộc phát, hành động mạnh mẽ",
    gridRow: 1,
    gridCol: 0,
    trigramNum: 4,
  },
  5: {
    num: 5,
    name: "Trung Cung",
    chinese: "中",
    direction: "Trung Ương (Thiên Cực)",
    element: "Thổ",
    symbol: "☯",
    fourGates: "Thiên Đình",
    nature: "Cực điểm, tĩnh tại, thống nhiếp bát phương",
    gridRow: 1,
    gridCol: 1,
    trigramNum: 1, // Ký Càn/Khôn
  },
  6: {
    num: 6,
    name: "Đoài",
    chinese: "兌",
    direction: "Chính Tây",
    element: "Kim",
    symbol: "☱",
    fourGates: "Thuyết Trạch",
    nature: "Đầm, vui tươi, tài lộc, giao thương",
    gridRow: 1,
    gridCol: 2,
    trigramNum: 2,
  },
  // Hàng 2
  3: {
    num: 3,
    name: "Cấn",
    chinese: "艮",
    direction: "Đông Bắc",
    element: "Thổ",
    symbol: "☶",
    fourGates: "Quỷ Môn / Chỉ Đức",
    nature: "Núi, dừng lại, trầm tĩnh, kiên định",
    gridRow: 2,
    gridCol: 0,
    trigramNum: 7,
  },
  8: {
    num: 8,
    name: "Khảm",
    chinese: "坎",
    direction: "Chính Bắc",
    element: "Thủy",
    symbol: "☵",
    fourGates: "U Hiểm",
    nature: "Nước, hiểm trở, trí tuệ, mưu lược thâm sâu",
    gridRow: 2,
    gridCol: 1,
    trigramNum: 6,
  },
  1: {
    num: 1,
    name: "Càn",
    chinese: "乾",
    direction: "Tây Bắc",
    element: "Kim",
    symbol: "☰",
    fourGates: "Thiên Môn",
    nature: "Trời, cương kiện, chí tôn, khởi đầu vĩ đại",
    gridRow: 2,
    gridCol: 2,
    trigramNum: 1,
  },
};

// =========================================================================
// 2. THẦN TINH THÁI ẤT (Taiyi Spirits & Deities)
// =========================================================================

export interface ThaiAtSpirit {
  name: string;
  chinese: string;
  type: "chủ_tinh" | "chủ_tướng" | "khách_tướng" | "cát_thần" | "hung_thần" | "cơ_thần";
  quality: "Chí Tôn" | "Đại Cát" | "Cát" | "Trung Tính" | "Hung" | "Đại Hung";
  description: string;
  role: string;
}

export const THAI_AT_SPIRITS: Record<string, ThaiAtSpirit> = {
  "Thái Ất": {
    name: "Thái Ất",
    chinese: "太乙",
    type: "chủ_tinh",
    quality: "Chí Tôn",
    description: "Thiên Hoàng Đại Đế tinh, chủ tể vạn vật, thống lĩnh thiên thời và vận khí càn khôn.",
    role: "Chủ quản thời đại, quốc vận, đại thế biến dịch và cơ trời mầu nhiệm.",
  },
  "Văn Xương": {
    name: "Văn Xương",
    chinese: "文昌",
    type: "chủ_tướng",
    quality: "Đại Cát",
    description: "Chủ Đại Tướng (Thiên Mục thần), đại diện cho bên ta, chủ nhân, người chiêm đoán, nội bộ.",
    role: "Chủ lực, thế trận nội tại, trí tuệ, văn hóa, sách lược phát triển vững chắc.",
  },
  "Thủy Kích": {
    name: "Thủy Kích",
    chinese: "始擊",
    type: "khách_tướng",
    quality: "Trung Tính",
    description: "Khách Đại Tướng (Địa Mục thần), đại diện cho khách phương, đối phương, biến động ngoại lai.",
    role: "Đối thủ cạnh tranh, môi trường bên ngoài, sự việc mới xuất hiện, lực lượng ngoại giới.",
  },
  "Ngũ Phúc": {
    name: "Ngũ Phúc",
    chinese: "五福",
    type: "cát_thần",
    quality: "Đại Cát",
    description: "Thần phúc thọ chí thượng, ngự cung nào thì tiêu trừ tai ương, tăng phúc diên thọ, bách sự đại cát.",
    role: "Cát thần đệ nhất Thái Ất, hóa nguy thành an, đem lại may mắn tột đỉnh và quý nhân phù trợ.",
  },
  "Quân Cơ": {
    name: "Quân Cơ",
    chinese: "君基",
    type: "cơ_thần",
    quality: "Cát",
    description: "Đại diện cho Người đứng đầu, Quân vương, Lãnh đạo tối cao, Chính sách vĩ mô.",
    role: "Định hướng chiến lược, ý chí của cấp trên, pháp luật và cơ chế vận hành.",
  },
  "Thần Cơ": {
    name: "Thần Cơ",
    chinese: "臣基",
    type: "cơ_thần",
    quality: "Cát",
    description: "Đại diện cho Bậc bề tôi, Tướng soái, Tham mưu, Cố vấn và chuyên gia hoạch định.",
    role: "Kế hoạch hành động, năng lực điều hành thực tế, sự phối hợp giữa các cộng sự.",
  },
  "Dân Cơ": {
    name: "Dân Cơ",
    chinese: "民基",
    type: "cơ_thần",
    quality: "Trung Tính",
    description: "Đại diện cho Quần chúng, Bách tính, Thị trường tiêu thụ, Khách hàng, Cổ đông.",
    role: "Lòng dân, xu hướng xã hội, nhu cầu người dùng và nền tảng thị trường cơ sở.",
  },
  "Đại Du": {
    name: "Đại Du",
    chinese: "大游",
    type: "cơ_thần",
    quality: "Trung Tính",
    description: "Chủ về sự biến chuyển lớn, dịch chuyển nơi ở, thay đổi cơ cấu, mở rộng quy mô viễn xứ.",
    role: "Xuất ngoại, đổi mới toàn diện, rời bỏ vùng an toàn để khai mở chân trời mới.",
  },
  "Tiểu Du": {
    name: "Tiểu Du",
    chinese: "小游",
    type: "cơ_thần",
    quality: "Trung Tính",
    description: "Chủ về chuyến đi ngắn hạn, cải cách cục bộ, điều chỉnh linh hoạt hàng ngày.",
    role: "Thay đổi quy trình nhỏ, ứng biến trước tình huống phát sinh tức thời.",
  },
  "Phi Phù": {
    name: "Phi Phù",
    chinese: "飛符",
    type: "hung_thần",
    quality: "Hung",
    description: "Hung tinh chủ về sự bất trắc, khẩu thiệt thị phi, giấy tờ rắc rối, tin đồn thất thiệt.",
    role: "Cần rà soát hợp đồng, cảnh giác tiểu nhân gièm pha, không nên tin lời đồn vô căn cứ.",
  },
  "Kế Thần": {
    name: "Kế Thần",
    chinese: "計神",
    type: "cơ_thần",
    quality: "Trung Tính",
    description: "Thần túc kế toán thời vận, chủ về thời cơ chín muồi hay chưa, quy luật chu kỳ.",
    role: "Kiểm soát tiến độ, đánh giá đúng lúc đúng chỗ, không nên nóng vội đốt cháy giai đoạn.",
  },
};

// =========================================================================
// 3. TOÁN SỐ THÁI ẤT (Taiyi Calculation Numbers)
// =========================================================================

export interface ThaiAtToanInfo {
  number: number; // 1..39
  toanType: "Toán Thuần" | "Toán Hòa" | "Toán Trùng" | "Toán Đơn" | "Toán Tạp";
  lengthType: "Trường Toán" | "Trung Toán" | "Đoản Toán";
  quality: "Đại Cát" | "Cát" | "Bình" | "Hung";
  description: string;
}

export function evaluateThaiAtToan(num: number): ThaiAtToanInfo {
  const n = ((num - 1) % 39) + 1;

  // Xác định trường / đoản
  let lengthType: "Trường Toán" | "Trung Toán" | "Đoản Toán" = "Trung Toán";
  if (n >= 30) lengthType = "Trường Toán";
  else if (n <= 12) lengthType = "Đoản Toán";

  // Xác định tính chất Toán
  let toanType: "Toán Thuần" | "Toán Hòa" | "Toán Trùng" | "Toán Đơn" | "Toán Tạp" = "Toán Hòa";
  let quality: "Đại Cát" | "Cát" | "Bình" | "Hung" = "Cát";
  let description = "";

  if (n === 1 || n === 3 || n === 5 || n === 7 || n === 9 || n === 11 || n === 13 || n === 25 || n === 35) {
    if (n === 1 || n === 5 || n === 25) {
      toanType = "Toán Thuần";
      quality = "Đại Cát";
      description = `Toán số ${n} là Thuần Dương thanh khiết, chính khí dồi dào. Mưu sự có trời đất trợ duyên, đại nghiệp quang minh chính đại.`;
    } else {
      toanType = "Toán Đơn";
      quality = "Bình";
      description = `Toán số ${n} là Đơn toán, ít lực chi viện bên ngoài. Cần tự lực cánh sinh, thận trọng từng bước chớ nên quá mạo hiểm.`;
    }
  } else if (n % 10 === 0 || n === 20 || n === 30) {
    toanType = "Toán Trùng";
    quality = "Hung";
    description = `Toán số ${n} là Trùng toán, khí bị ngưng trệ, tiến thoái lưỡng nan. Cần kiên nhẫn chờ thời, không nên phát động tranh chấp.`;
  } else if (n % 2 === 0 && (n === 8 || n === 16 || n === 24 || n === 32)) {
    toanType = "Toán Hòa";
    quality = "Đại Cát";
    description = `Toán số ${n} là Hòa toán, âm dương tương tề, chủ khách thuận hòa. Rất có lợi cho hợp tác, đàm phán, hôn nhân và ký kết hợp đồng.`;
  } else {
    toanType = "Toán Tạp";
    quality = "Bình";
    description = `Toán số ${n} là Tạp toán, đa sự đa lo, nhiều luồng ý kiến đan xen. Cần giữ vững lập trường, minh bạch rõ ràng trong thu chi và giao tiếp.`;
  }

  return {
    number: n,
    toanType,
    lengthType,
    quality,
    description,
  };
}

// =========================================================================
// 4. KẾT QUẢ QUẺ THÁI ẤT THẦN SỐ (Chart Result Model)
// =========================================================================

export interface ThaiAtCellData {
  palaceNum: number;
  palace: ThaiAtPalace;
  spirits: string[];
  isTaiYi: boolean;
  isVanXuong: boolean;
  isThuyKich: boolean;
  isNguPhuc: boolean;
  isDinhToan: boolean;
  elementStatus: "Vượng" | "Tướng" | "Hưu" | "Tù" | "Tử";
  summaryText: string;
}

export interface ThaiAtChartResult {
  dunType: "Dương Độn" | "Âm Độn";
  cucNum: number; // 1..36
  kyNumber: number; // Kỷ số (1..6)
  epochName: string; // Vận kỷ

  // Vị trí các Thần Cốt Lõi
  taiYiPalace: number;
  vanXuongPalace: number; // Chủ Đại Tướng
  thuyKichPalace: number; // Khách Đại Tướng
  nguPhucPalace: number; // Cát thần tối thượng
  quanCoPalace: number;
  thanCoPalace: number;
  danCoPalace: number;
  phiPhuPalace: number;
  dinhToanPalace: number;

  // Toán Số
  chuToan: ThaiAtToanInfo; // Chủ Toán
  khachToan: ThaiAtToanInfo; // Khách Toán
  dinhToan: ThaiAtToanInfo; // Định Toán

  // Cục Diện Chủ - Khách
  chuKhachBattle: {
    winner: "Chủ Thắng (Bên Ta Lợi)" | "Khách Thắng (Bên Ngoài Lợi)" | "Chủ Khách Tương Hòa";
    advise: string;
    nature: string;
  };

  // Cửu Cung
  cells: Record<number, ThaiAtCellData>;

  // Thái Ất Hóa Dịch (Liên kết 64 Quẻ Chu Dịch)
  primaryHex: Hexagram;
  transformedHex: Hexagram;
  changingLine: number; // 1..6
  upperTrigram: TrigramData;
  lowerTrigram: TrigramData;
  primarySummary: string;

  // Luận Giải Tứ Đại Lĩnh Vực
  luanThienThoi: string;
  luanSuNghiep: string;
  luanTaiLoc: string;
  luanGiaDao: string;
  loiKhuyenTongQuat: string;

  // 4 Trụ Can Chi
  hourPillar: { can: string; chi: string };
  dayPillar: { can: string; chi: string };
  monthPillar: { can: string; chi: string };
  yearPillar: { can: string; chi: string };
}

// =========================================================================
// 5. THUẬT TOÁN KHỞI BÀN THÁI ẤT THẦN SỐ (Algorithm)
// =========================================================================

// Mapping Chi sang số 1..12
const CHI_NUM_MAP: Record<string, number> = {
  "Tý": 1, "Sửu": 2, "Dần": 3, "Mão": 4, "Thìn": 5, "Tỵ": 6,
  "Ngọ": 7, "Mùi": 8, "Thân": 9, "Dậu": 10, "Tuất": 11, "Hợi": 12,
};

// Mapping Can sang số 1..10
const CAN_NUM_MAP: Record<string, number> = {
  "Giáp": 1, "Ất": 2, "Bính": 3, "Đinh": 4, "Mậu": 5,
  "Kỷ": 6, "Canh": 7, "Tân": 8, "Nhâm": 9, "Quý": 10,
};

// Vòng tuần hoàn Cung Cửu Cung Thái Ất (bỏ Trung Cung 5 khi chu lưu)
const THAI_AT_PALACES_RING = [1, 2, 3, 4, 6, 7, 8, 9];

export function calculateThaiAtChart(
  dunType: "Dương Độn" | "Âm Độn",
  cucNum: number,
  hourPillar: { can: string; chi: string },
  dayPillar: { can: string; chi: string },
  monthPillar: { can: string; chi: string },
  yearPillar: { can: string; chi: string }
): ThaiAtChartResult {
  const normCuc = ((cucNum - 1) % 36) + 1;
  const kyNumber = ((Math.floor((normCuc - 1) / 6)) % 6) + 1;
  const epochName = `Đệ ${kyNumber} Kỷ • ${dunType} ${normCuc} Cục`;

  const hourChiVal = CHI_NUM_MAP[hourPillar.chi] || 7;
  const dayCanVal = CAN_NUM_MAP[dayPillar.can] || 1;
  const dayChiVal = CHI_NUM_MAP[dayPillar.chi] || 1;
  const monthChiVal = CHI_NUM_MAP[monthPillar.chi] || 3;
  const yearChiVal = CHI_NUM_MAP[yearPillar.chi] || 5;

  // 1. TÍNH CUNG THÁI ẤT
  // Trong Dương Độn: Thái Ất thuận hành theo các cung số
  // Trong Âm Độn: Thái Ất nghịch hành
  let taiYiPalace: number;
  if (dunType === "Dương Độn") {
    const ringIdx = (normCuc + hourChiVal - 2) % 8;
    taiYiPalace = THAI_AT_PALACES_RING[ringIdx];
  } else {
    const ringIdx = (36 - normCuc + hourChiVal) % 8;
    taiYiPalace = THAI_AT_PALACES_RING[ringIdx];
  }

  // 2. TÍNH CUNG VĂN XƯƠNG (Chủ Đại Tướng / Thiên Mục)
  // Văn Xương khởi cung theo Thần Kế và Can Ngày
  const vanXuongIdx = (taiYiPalace + dayCanVal * 2 + normCuc) % 9;
  const vanXuongPalace = vanXuongIdx === 0 ? 9 : vanXuongIdx;

  // 3. TÍNH CUNG THỦY KÍCH (Khách Đại Tướng / Địa Mục)
  // Thủy Kích xung hoặc khắc với vị trí thời chi
  const thuyKichIdx = (vanXuongPalace + hourChiVal + 4) % 9;
  const thuyKichPalace = thuyKichIdx === 0 ? 9 : thuyKichIdx;

  // 4. TÍNH CHỦ TOÁN & KHÁCH TOÁN
  // Chủ Toán = khoảng cách từ Văn Xương đến Thái Ất cộng bội số thời thần
  let chuToanRaw = Math.abs(taiYiPalace - vanXuongPalace) * 4 + hourChiVal + normCuc;
  if (chuToanRaw <= 0) chuToanRaw = 16;
  const chuToan = evaluateThaiAtToan(chuToanRaw);

  // Khách Toán = khoảng cách từ Thủy Kích đến Thái Ất
  let khachToanRaw = Math.abs(taiYiPalace - thuyKichPalace) * 4 + dayChiVal + normCuc;
  if (khachToanRaw <= 0) khachToanRaw = 18;
  const khachToan = evaluateThaiAtToan(khachToanRaw);

  // Định Toán
  const dinhToanRaw = (chuToan.number + khachToan.number) % 39 || 1;
  const dinhToan = evaluateThaiAtToan(dinhToanRaw);
  const dinhToanPalace = (dinhToan.number % 9) || 5;

  // 5. TÍNH VỊ TRÍ CÁC THẦN KHÁC
  // Ngũ Phúc: Cát thần tối cao chu lưu qua các cung đại cát
  const nguPhucIdx = (normCuc * 3 + dayCanVal) % 8;
  const nguPhucPalace = THAI_AT_PALACES_RING[nguPhucIdx];

  // Quân Cơ, Thần Cơ, Dân Cơ
  const quanCoPalace = (taiYiPalace + 2) % 9 || 9;
  const thanCoPalace = (vanXuongPalace + 3) % 9 || 9;
  const danCoPalace = (thuyKichPalace + 3) % 9 || 9;

  // Phi Phù (Hung tinh)
  const phiPhuPalace = (thuyKichPalace + hourChiVal) % 9 || 9;

  // 6. PHÂN TÍCH CHỦ KHÁCH CHIẾN LƯỢC
  const chuElement = THAI_AT_PALACES[vanXuongPalace].element;
  const khachElement = THAI_AT_PALACES[thuyKichPalace].element;

  let winner: "Chủ Thắng (Bên Ta Lợi)" | "Khách Thắng (Bên Ngoài Lợi)" | "Chủ Khách Tương Hòa";
  let advise = "";
  let battleNature = "";

  if (chuToan.number > khachToan.number && chuToan.quality !== "Hung") {
    winner = "Chủ Thắng (Bên Ta Lợi)";
    battleNature = `Chủ Toán [${chuToan.number}] mạnh hơn Khách Toán [${khachToan.number}]. Cung Văn Xương [${THAI_AT_PALACES[vanXuongPalace].name} - ${chuElement}] nắm giữ quyền chủ động.`;
    advise = "Nên kiên trì chiến lược đã định, củng cố nội lực, bảo vệ thành quả. Phù hợp cho việc thi cử, bảo toàn vốn, xây dựng quy trình nội bộ, phòng thủ phản công.";
  } else if (khachToan.number > chuToan.number && khachToan.quality !== "Hung") {
    winner = "Khách Thắng (Bên Ngoài Lợi)";
    battleNature = `Khách Toán [${khachToan.number}] áp đảo Chủ Toán [${chuToan.number}]. Cung Thủy Kích [${THAI_AT_PALACES[thuyKichPalace].name} - ${khachElement}] chiếm ưu thế ngoại vi.`;
    advise = "Nên chủ động xuất hành, vươn ra thị trường mới, đàm phán cởi mở, không nên cố chấp bảo thủ. Phù hợp mở rộng kinh doanh, đón nhận cơ hội từ bên ngoài.";
  } else {
    winner = "Chủ Khách Tương Hòa";
    battleNature = `Chủ Toán [${chuToan.number}] và Khách Toán [${khachToan.number}] tương dung điều hòa. Thế trận cân bằng đôi bên cùng có lợi.`;
    advise = "Rất thuận lợi cho liên minh hợp tác, ký kết hợp đồng, hòa giải mâu thuẫn, tổ chức hôn lễ và tìm tiếng nói chung.";
  }

  // 7. BỐ TRÍ DỮ LIỆU TỪNG Ô TRONG CỬU CUNG
  const cells: Record<number, ThaiAtCellData> = {};

  for (let num = 1; num <= 9; num++) {
    const palace = THAI_AT_PALACES[num];
    const spirits: string[] = [];

    const isTaiYi = num === taiYiPalace;
    const isVanXuong = num === vanXuongPalace;
    const isThuyKich = num === thuyKichPalace;
    const isNguPhuc = num === nguPhucPalace;
    const isDinhToan = num === dinhToanPalace;

    if (isTaiYi) spirits.push("Thái Ất");
    if (isVanXuong) spirits.push("Văn Xương");
    if (isThuyKich) spirits.push("Thủy Kích");
    if (isNguPhuc) spirits.push("Ngũ Phúc");
    if (num === quanCoPalace) spirits.push("Quân Cơ");
    if (num === thanCoPalace) spirits.push("Thần Cơ");
    if (num === danCoPalace) spirits.push("Dân Cơ");
    if (num === phiPhuPalace) spirits.push("Phi Phù");

    // Xác định vượng suy
    let elementStatus: "Vượng" | "Tướng" | "Hưu" | "Tù" | "Tử" = "Tướng";
    if (isTaiYi || isNguPhuc) elementStatus = "Vượng";
    else if (spirits.includes("Phi Phù")) elementStatus = "Tù";
    else if (isVanXuong || isThuyKich) elementStatus = "Tướng";

    let summaryText = `Cung ${palace.name} (${palace.direction}) • Hành ${palace.element}.`;
    if (spirits.length > 0) {
      summaryText += ` Quy tụ: ${spirits.join(", ")}.`;
    }

    cells[num] = {
      palaceNum: num,
      palace,
      spirits,
      isTaiYi,
      isVanXuong,
      isThuyKich,
      isNguPhuc,
      isDinhToan,
      elementStatus,
      summaryText,
    };
  }

  // 8. THÁI ẤT HÓA DỊCH (Quy đổi sang 64 Quẻ Kinh Dịch)
  // Thượng Quái (Ngoại Quái) = Cung Thái Ất (hoặc Cung Văn Xương nếu Thái Ất ngự Trung Cung)
  // Hạ Quái (Nội Quái) = Cung Thủy Kích
  const upperTrigNum = THAI_AT_PALACES[taiYiPalace].trigramNum;
  const lowerTrigNum = THAI_AT_PALACES[thuyKichPalace].trigramNum;

  const upperTrigram = TIEN_THIEN_BAT_QUAI[upperTrigNum] || TIEN_THIEN_BAT_QUAI[1];
  const lowerTrigram = TIEN_THIEN_BAT_QUAI[lowerTrigNum] || TIEN_THIEN_BAT_QUAI[8];

  const primaryLines: [number, number, number, number, number, number] = [
    lowerTrigram.lines[0],
    lowerTrigram.lines[1],
    lowerTrigram.lines[2],
    upperTrigram.lines[0],
    upperTrigram.lines[1],
    upperTrigram.lines[2],
  ];

  const primaryHex = findHexagramByLines(primaryLines) || HEXAGRAMS[0];

  // Hào Động tính từ (Chủ Toán + Khách Toán + Giờ Chi) % 6 + 1
  const changingLine = ((chuToan.number + khachToan.number + hourChiVal - 1) % 6) + 1;
  const transformedHex = getTransformedHexagram(primaryHex, [changingLine]) || primaryHex;

  // 9. SOẠN THẢO LUẬN GIẢI TỨ ĐẠI LĨNH VỰC
  const nguPhucPalaceObj = THAI_AT_PALACES[nguPhucPalace];
  const luanThienThoi = `Thời vận đang chịu ảnh hưởng bởi Thái Ất ngự Cung ${THAI_AT_PALACES[taiYiPalace].name} (${THAI_AT_PALACES[taiYiPalace].direction}). Khí ${THAI_AT_PALACES[taiYiPalace].element} đắc lệnh, thiên cơ mở lối cho những ai biết thuận thời tùy biến. Phúc thần Ngũ Phúc đang giáng hạ tại Cung ${nguPhucPalaceObj.name} (${nguPhucPalaceObj.direction}), phương vị này chan chứa vượng khí cát lành, nên hướng tâm hoặc cầu nguyện về phương này.`;

  const luanSuNghiep = `Trong sự nghiệp, ${winner}. ${chuToan.description} ${
    winner.includes("Chủ")
      ? "Nội bộ đang có nền móng vững vàng, thích hợp hoàn thiện kế hoạch kinh doanh và thăng tiến theo bậc thang vững chắc."
      : "Thời cơ mở rộng đối ngoại đang rất sáng, nên tăng cường kết nối đối tác, mở chi nhánh hoặc thử nghiệm ý tưởng mới."
  }`;

  const luanTaiLoc = `Tài lộc có dấu hiệu hanh thông nếu hành sự quang minh, minh bạch sổ sách. Tránh cung vị Phi Phù (${THAI_AT_PALACES[phiPhuPalace].name} - phương ${THAI_AT_PALACES[phiPhuPalace].direction}) trong việc vay mượn hoặc đầu tư chớp nhoáng có tính rủi ro cao.`;

  const luanGiaDao = `Gia đạo và các mối quan hệ: Thế trận ${battleNature}. Nếu có hiểu lầm cần thẳng thắn chia sẻ, lấy sự chân thành làm gốc thì mọi nút thắt đều được cởi bỏ, bình an hạnh phúc.`;

  const loiKhuyenTongQuat = `Thái Ất Thần Số chiêm đoán: ${advise} Nên nắm bắt năng lượng cát tường từ Cung Ngũ Phúc (${nguPhucPalaceObj.direction}) và noi theo lời răn dạy của Quẻ #${primaryHex.number} ${primaryHex.name} để hành xử trọn vẹn đức nhân nghĩa.`;

  return {
    dunType,
    cucNum: normCuc,
    kyNumber,
    epochName,
    taiYiPalace,
    vanXuongPalace,
    thuyKichPalace,
    nguPhucPalace,
    quanCoPalace,
    thanCoPalace,
    danCoPalace,
    phiPhuPalace,
    dinhToanPalace,
    chuToan,
    khachToan,
    dinhToan,
    chuKhachBattle: {
      winner,
      advise,
      nature: battleNature,
    },
    cells,
    primaryHex,
    transformedHex,
    changingLine,
    upperTrigram,
    lowerTrigram,
    primarySummary: `Thái Ất Thần Số [${epochName}] • Giờ ${hourPillar.can} ${hourPillar.chi} (Thái Ất Cung ${taiYiPalace} - Chủ ${chuToan.number} vs Khách ${khachToan.number}) ➔ Quẻ #${primaryHex.number} ${primaryHex.name}`,
    luanThienThoi,
    luanSuNghiep,
    luanTaiLoc,
    luanGiaDao,
    loiKhuyenTongQuat,
    hourPillar,
    dayPillar,
    monthPillar,
    yearPillar,
  };
}
