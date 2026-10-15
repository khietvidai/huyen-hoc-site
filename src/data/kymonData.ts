/**
 * Dữ liệu và thuật toán Kỳ Môn Độn Giáp (Qi Men Dun Jia - 奇門遁甲)
 * Bát Trận Đồ: Cửu Cung Lạc Thư, Cửu Tinh, Bát Môn, Bát Thần, Tam Kỳ Lục Nghi
 */

import { Hexagram } from "../types";
import { HEXAGRAMS, findHexagramByLines, getTransformedHexagram } from "./hexagrams";
import { TIEN_THIEN_BAT_QUAI, TrigramData } from "../components/MaiHoaDivination";

// 1. CỬU CUNG LẠC THƯ (9 Palaces)
export interface KyMonPalace {
  palaceNum: number; // 1..9
  baguaName: string; // Khảm, Khôn, Chấn, Tốn, Trung, Càn, Đoài, Cấn, Ly
  chineseBagua: string;
  direction: string; // Bắc, Tây Nam, Đông, Đông Nam, Trung Ương, Tây Bắc, Tây, Đông Bắc, Nam
  element: "Thủy" | "Thổ" | "Mộc" | "Kim" | "Hỏa";
  symbol: string;
  originalStar: string;
  originalGate: string;
  gridRow: number; // 0..2
  gridCol: number; // 0..2
}

export const KY_MON_PALACES: Record<number, KyMonPalace> = {
  4: {
    palaceNum: 4,
    baguaName: "Tốn",
    chineseBagua: "巽",
    direction: "Đông Nam",
    element: "Mộc",
    symbol: "☴",
    originalStar: "Thiên Phụ",
    originalGate: "Đỗ Môn",
    gridRow: 0,
    gridCol: 0,
  },
  9: {
    palaceNum: 9,
    baguaName: "Ly",
    chineseBagua: "離",
    direction: "Chính Nam",
    element: "Hỏa",
    symbol: "☲",
    originalStar: "Thiên Anh",
    originalGate: "Cảnh Môn",
    gridRow: 0,
    gridCol: 1,
  },
  2: {
    palaceNum: 2,
    baguaName: "Khôn",
    chineseBagua: "坤",
    direction: "Tây Nam",
    element: "Thổ",
    symbol: "☷",
    originalStar: "Thiên Nhuế",
    originalGate: "Tử Môn",
    gridRow: 0,
    gridCol: 2,
  },
  3: {
    palaceNum: 3,
    baguaName: "Chấn",
    chineseBagua: "震",
    direction: "Chính Đông",
    element: "Mộc",
    symbol: "☳",
    originalStar: "Thiên Xung",
    originalGate: "Thương Môn",
    gridRow: 1,
    gridCol: 0,
  },
  5: {
    palaceNum: 5,
    baguaName: "Trung Cung",
    chineseBagua: "中",
    direction: "Trung Ương",
    element: "Thổ",
    symbol: "☯",
    originalStar: "Thiên Cầm",
    originalGate: "Ký Khôn 2",
    gridRow: 1,
    gridCol: 1,
  },
  7: {
    palaceNum: 7,
    baguaName: "Đoài",
    chineseBagua: "兌",
    direction: "Chính Tây",
    element: "Kim",
    symbol: "☱",
    originalStar: "Thiên Trụ",
    originalGate: "Kinh Môn",
    gridRow: 1,
    gridCol: 2,
  },
  8: {
    palaceNum: 8,
    baguaName: "Cấn",
    chineseBagua: "艮",
    direction: "Đông Bắc",
    element: "Thổ",
    symbol: "☶",
    originalStar: "Thiên Nhậm",
    originalGate: "Sinh Môn",
    gridRow: 2,
    gridCol: 0,
  },
  1: {
    palaceNum: 1,
    baguaName: "Khảm",
    chineseBagua: "坎",
    direction: "Chính Bắc",
    element: "Thủy",
    symbol: "☵",
    originalStar: "Thiên Bồng",
    originalGate: "Hưu Môn",
    gridRow: 2,
    gridCol: 1,
  },
  6: {
    palaceNum: 6,
    baguaName: "Càn",
    chineseBagua: "乾",
    direction: "Tây Bắc",
    element: "Kim",
    symbol: "☰",
    originalStar: "Thiên Tâm",
    originalGate: "Khai Môn",
    gridRow: 2,
    gridCol: 2,
  },
};

// Thứ tự 8 Cung ngoài theo chiều kim đồng hồ (Bát Quái Bàn)
export const RING_8_PALACES = [1, 8, 3, 4, 9, 2, 7, 6];

// 2. CỬU TINH (Nine Stars)
export interface StarInfo {
  name: string;
  chinese: string;
  originalPalace: number;
  element: "Thủy" | "Thổ" | "Mộc" | "Kim" | "Hỏa";
  quality: "Đại Cát" | "Cát" | "Trung" | "Hung" | "Đại Hung";
  nature: string;
  desc: string;
}

export const KY_MON_STARS: Record<string, StarInfo> = {
  "Thiên Bồng": {
    name: "Thiên Bồng",
    chinese: "天蓬",
    originalPalace: 1,
    element: "Thủy",
    quality: "Hung",
    nature: "Đại Đạo • Mưu Trí • Thủy Thần",
    desc: "Đại diện cho mưu sâu kế hiểm, người dũng cảm xông xáo nhưng nhiều trắc trở, kỵ làm việc chính trực công khai.",
  },
  "Thiên Nhuế": {
    name: "Thiên Nhuế",
    chinese: "天芮",
    originalPalace: 2,
    element: "Thổ",
    quality: "Hung",
    nature: "Bệnh Tinh • Học Vấn • Đồ Chúng",
    desc: "Đại diện cho bệnh tật, sự chậm trễ hoặc học trò bè bạn cùng chí hướng. Trị bệnh cần giải cứu.",
  },
  "Thiên Xung": {
    name: "Thiên Xung",
    chinese: "天沖",
    originalPalace: 3,
    element: "Mộc",
    quality: "Cát",
    nature: "Lôi Thần • Tốc Chiến • Dũng Cảm",
    desc: "Hành động quyết liệt, quả quyết, lợi cho thể thao, cạnh tranh quyết đấu, mở đường tiên phong.",
  },
  "Thiên Phụ": {
    name: "Thiên Phụ",
    chinese: "天輔",
    originalPalace: 4,
    element: "Mộc",
    quality: "Đại Cát",
    nature: "Văn Xương • Giáo Dục • Quý Nhân",
    desc: "Ngôi sao học vấn, thi cử đỗ đạt, thầy giáo chỉ dạy, quý nhân phù trợ, gia phong nề nếp.",
  },
  "Thiên Cầm": {
    name: "Thiên Cầm",
    chinese: "天禽",
    originalPalace: 5,
    element: "Thổ",
    quality: "Đại Cát",
    nature: "Quân Vương • Trung Trực • Uy Quyền",
    desc: "Ngôi sao trung ương phò tá, chính khí ngút trời, mưu sự quang minh, cát lành vạn sự.",
  },
  "Thiên Tâm": {
    name: "Thiên Tâm",
    chinese: "天心",
    originalPalace: 6,
    element: "Kim",
    quality: "Đại Cát",
    nature: "Lãnh Đạo • Danh Y • Mưu Lược",
    desc: "Đại diện cho bậc lãnh tụ, y thuật thần diệu, chiến lược gia tài ba, cứu người giúp đời.",
  },
  "Thiên Trụ": {
    name: "Thiên Trụ",
    chinese: "天柱",
    originalPalace: 7,
    element: "Kim",
    quality: "Hung",
    nature: "Phá Quân • Hùng Biện • Trụ Cột",
    desc: "Đại diện cho tranh luận, hùng biện, phá vỡ cái cũ, kiện tụng hoặc hiểm họa giông gió.",
  },
  "Thiên Nhậm": {
    name: "Thiên Nhậm",
    chinese: "天任",
    originalPalace: 8,
    element: "Thổ",
    quality: "Đại Cát",
    nature: "Lương Thiện • Điền Sản • Nhẫn Nại",
    desc: "Đại diện cho người hiền từ, đức hạnh, điền sản đất đai tích lũy bền vững, làm ăn chân chính.",
  },
  "Thiên Anh": {
    name: "Thiên Anh",
    chinese: "天英",
    originalPalace: 9,
    element: "Hỏa",
    quality: "Trung",
    nature: "Văn Minh • Danh Tiếng • Nóng Nảy",
    desc: "Đại diện cho thanh danh, sự nổi tiếng, nghệ thuật, bề ngoài hào nhoáng nhưng dễ nóng nảy thị phi.",
  },
};

// 3. BÁT MÔN (Eight Gates)
export interface GateInfo {
  name: string;
  chinese: string;
  originalPalace: number;
  element: "Thủy" | "Thổ" | "Mộc" | "Kim" | "Hỏa";
  quality: "Đại Cát" | "Cát" | "Bình" | "Hung" | "Đại Hung";
  colorClass: string;
  desc: string;
}

export const KY_MON_GATES: Record<string, GateInfo> = {
  "Khai Môn": {
    name: "Khai Môn",
    chinese: "開門",
    originalPalace: 6,
    element: "Kim",
    quality: "Đại Cát",
    colorClass: "text-amber-300 bg-amber-950/70 border-amber-600/60",
    desc: "Tam Cát Môn. Khai mở, nhậm chức, khởi sự kinh doanh, xuất hành, thi cử, vạn sự hanh thông.",
  },
  "Hưu Môn": {
    name: "Hưu Môn",
    chinese: "休門",
    originalPalace: 1,
    element: "Thủy",
    quality: "Cát",
    colorClass: "text-emerald-300 bg-emerald-950/70 border-emerald-600/60",
    desc: "Tam Cát Môn. An dưỡng, nghỉ ngơi, cầu quý nhân, hôn nhân, gia đình hòa thuận, chữa bệnh lành.",
  },
  "Sinh Môn": {
    name: "Sinh Môn",
    chinese: "生門",
    originalPalace: 8,
    element: "Thổ",
    quality: "Đại Cát",
    colorClass: "text-yellow-300 bg-yellow-950/80 border-yellow-500/70",
    desc: "Tam Cát Môn. Đệ nhất cát môn cầu tài! Mua bán bất động sản, sinh tài đắc lộc, sinh khí dồi dào.",
  },
  "Thương Môn": {
    name: "Thương Môn",
    chinese: "傷門",
    originalPalace: 3,
    element: "Mộc",
    quality: "Hung",
    colorClass: "text-rose-300 bg-rose-950/70 border-rose-700/60",
    desc: "Tổn thương, tranh chấp. Chỉ lợi cho đòi nợ, bắt kẻ gian, thi đấu thể thao; kỵ xuất hành, khai trương.",
  },
  "Đỗ Môn": {
    name: "Đỗ Môn",
    chinese: "杜門",
    originalPalace: 4,
    element: "Mộc",
    quality: "Bình",
    colorClass: "text-cyan-300 bg-cyan-950/70 border-cyan-700/60",
    desc: "Bế tắc, đóng kín. Lợi cho ẩn nấp, bảo mật bí mật, tu thân tịnh dưỡng; không lợi cầu danh cầu tài.",
  },
  "Cảnh Môn": {
    name: "Cảnh Môn",
    chinese: "景門",
    originalPalace: 9,
    element: "Hỏa",
    quality: "Bình",
    colorClass: "text-orange-300 bg-orange-950/70 border-orange-700/60",
    desc: "Sáng sủa, tin tức. Lợi cho yến tiệc, giấy tờ hợp đồng, thi cử nghệ thuật; đề phòng thị phi kiện cáo.",
  },
  "Tử Môn": {
    name: "Tử Môn",
    chinese: "死門",
    originalPalace: 2,
    element: "Thổ",
    quality: "Đại Hung",
    colorClass: "text-red-400 bg-red-950/90 border-red-700/80",
    desc: "Đại hung môn. Đóng lại bế tắc, tang ma, dứt điểm chấm dứt; vạn sự chớ nên khởi động liều lĩnh.",
  },
  "Kinh Môn": {
    name: "Kinh Môn",
    chinese: "驚門",
    originalPalace: 7,
    element: "Kim",
    quality: "Hung",
    colorClass: "text-purple-300 bg-purple-950/70 border-purple-700/60",
    desc: "Kinh sợ, nghi ngờ, thị phi, kiện tụng khẩu thiệt. Lợi cho điều tra phá án, luật sư tranh tụng.",
  },
};

// 4. BÁT THẦN (Eight Deities)
export interface SpiritInfo {
  name: string;
  chinese: string;
  element: "Thủy" | "Thổ" | "Mộc" | "Kim" | "Hỏa";
  nature: string;
  desc: string;
  badgeClass: string;
}

export const KY_MON_SPIRITS: Record<string, SpiritInfo> = {
  "Trực Phù": {
    name: "Trực Phù",
    chinese: "直符",
    element: "Thổ",
    nature: "Đầu đàn • Quý nhân tôn kính",
    desc: "Bách thần chi thủ, ngôi thần tối thượng, gặp hung hóa cát, giải tai ách, bảo trợ bình an.",
    badgeClass: "text-amber-300 bg-amber-950/80 border-amber-500",
  },
  "Đằng Xà": {
    name: "Đằng Xà",
    chinese: "螣蛇",
    element: "Hỏa",
    nature: "Hư ảo • Ác mộng • Biến hóa",
    desc: "Chủ kinh sợ, quái dị, ác mộng, nghi thần ám quỷ, lời lẽ giả trá khó lường.",
    badgeClass: "text-rose-300 bg-rose-950/80 border-rose-600",
  },
  "Thái Âm": {
    name: "Thái Âm",
    chinese: "太陰",
    element: "Kim",
    nature: "Âm đức • Mưu mật • Che chở",
    desc: "Chủ âm thầm giúp đỡ, che chở kín đáo, mưu lược sâu xa, phụ nữ tương trợ đắc lực.",
    badgeClass: "text-slate-200 bg-slate-900 border-slate-600",
  },
  "Lục Hợp": {
    name: "Lục Hợp",
    chinese: "六合",
    element: "Mộc",
    nature: "Hòa hợp • Hôn nhân • Giao dịch",
    desc: "Chủ hòa hợp, môi giới, hợp đồng, hôn nhân vui vẻ, bạn bè đồng lòng tương trợ.",
    badgeClass: "text-emerald-300 bg-emerald-950/80 border-emerald-600",
  },
  "Bạch Hổ": {
    name: "Bạch Hổ",
    chinese: "白虎",
    element: "Kim",
    nature: "Dũng mãnh • Sát phạt • Huyết quang",
    desc: "Chủ uy quyền quân sự, dũng mãnh, nhưng đề phòng tai nạn, huyết quang, phẫu thuật bệnh tật.",
    badgeClass: "text-red-300 bg-red-950/80 border-red-600",
  },
  "Huyền Vũ": {
    name: "Huyền Vũ",
    chinese: "玄武",
    element: "Thủy",
    nature: "Ám muội • Đạo tặc • Khẩu thiệt",
    desc: "Chủ mập mờ, mất trộm, tiểu nhân lừa dối, nói xấu sau lưng, cần cẩn trọng đề phòng.",
    badgeClass: "text-sky-300 bg-sky-950/80 border-sky-600",
  },
  "Cửu Địa": {
    name: "Cửu Địa",
    chinese: "九地",
    element: "Thổ",
    nature: "Bản tĩnh • Phòng thủ • Dày sâu",
    desc: "Chủ an tĩnh, thủ thế kiên cường, giữ gìn tiền của gia sản, ẩn nhẫn đợi thời cơ.",
    badgeClass: "text-yellow-200 bg-yellow-950/80 border-yellow-700",
  },
  "Cửu Thiên": {
    name: "Cửu Thiên",
    chinese: "九天",
    element: "Kim",
    nature: "Chủ động • Phi thăng • Cao xa",
    desc: "Chủ tiến công dũng cảm, bay cao bay xa, xuất ngoại công du, thăng quan tiến chức.",
    badgeClass: "text-indigo-300 bg-indigo-950/80 border-indigo-600",
  },
};

// Vòng Bát Thần chuẩn
export const SPIRITS_ORDER = [
  "Trực Phù",
  "Đằng Xà",
  "Thái Âm",
  "Lục Hợp",
  "Bạch Hổ",
  "Huyền Vũ",
  "Cửu Địa",
  "Cửu Thiên",
];

// Thứ tự Lục Nghi Tam Kỳ chuẩn
export const NGHI_KY_ORDER = ["Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý", "Đinh", "Bính", "Ất"];

// Tra Tuần Thủ từ Can Chi của Giờ
export function getTuanThu(can: string, chi: string): { leader: string; canHidden: string; voidChi: [string, string] } {
  const CAN_NAMES = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
  const CHI_NAMES = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];

  const canIdx = CAN_NAMES.indexOf(can);
  const chiIdx = CHI_NAMES.indexOf(chi);
  if (canIdx === -1 || chiIdx === -1) {
    return { leader: "Giáp Tý", canHidden: "Mậu", voidChi: ["Tuất", "Hợi"] };
  }

  const offset = (chiIdx - canIdx + 12) % 12;
  switch (offset) {
    case 0:
      return { leader: "Giáp Tý", canHidden: "Mậu", voidChi: ["Tuất", "Hợi"] };
    case 10:
      return { leader: "Giáp Tuất", canHidden: "Kỷ", voidChi: ["Thân", "Dậu"] };
    case 8:
      return { leader: "Giáp Thân", canHidden: "Canh", voidChi: ["Ngọ", "Mùi"] };
    case 6:
      return { leader: "Giáp Ngọ", canHidden: "Tân", voidChi: ["Thìn", "Tỵ"] };
    case 4:
      return { leader: "Giáp Thìn", canHidden: "Nhâm", voidChi: ["Dần", "Mão"] };
    case 2:
      return { leader: "Giáp Dần", canHidden: "Quý", voidChi: ["Tý", "Sửu"] };
    default:
      return { leader: "Giáp Tý", canHidden: "Mậu", voidChi: ["Tuất", "Hợi"] };
  }
}

// Cấu trúc một Ô Cung trong Bàn Kỳ Môn hoàn chỉnh
export interface KyMonCellData {
  palaceNum: number;
  palace: KyMonPalace;
  diaCan: string;
  thienCan: string;
  star: string;
  starInfo: StarInfo;
  gate: string;
  gateInfo: GateInfo;
  spirit: string;
  spiritInfo: SpiritInfo;
  isZhifuStar: boolean; // Cung có Trực Phù Tinh
  isZhishiGate: boolean; // Cung có Trực Sử Môn
  isVoid: boolean; // Cung Tuần Không
  isHorse: boolean; // Cung Dịch Mã
  formationName?: string; // Tên Cách Cục
  formationType?: "cat" | "hung" | "binh";
  formationDesc?: string;
}

export interface KyMonChartResult {
  dunType: "Dương Độn" | "Âm Độn";
  cucNum: number; // 1..9
  tuanThu: { leader: string; canHidden: string; voidChi: [string, string] };
  zhifuStar: string;
  zhishiGate: string;
  zhifuPalace: number;
  zhishiPalace: number;
  horsePalace: number;
  voidPalaces: number[];
  cells: Record<number, KyMonCellData>;
  // Kinh Dịch đối ứng
  primaryHex: Hexagram;
  transformedHex: Hexagram;
  changingLine: number;
  upperTrigram: TrigramData;
  lowerTrigram: TrigramData;
  primarySummary: string;
  mainFormations: { name: string; type: "cat" | "hung"; desc: string }[];
  strategicAdvice: string;
  hourPillar: { can: string; chi: string };
  dayPillar: { can: string; chi: string };
  monthPillar: { can: string; chi: string };
  yearPillar: { can: string; chi: string };
}

// Hàm tính Dịch Mã Cung
function getHorsePalace(hourChi: string): number {
  if (["Dần", "Ngọ", "Tuất"].includes(hourChi)) return 2; // Khôn (Thân)
  if (["Thân", "Tý", "Thìn"].includes(hourChi)) return 8; // Cấn (Dần)
  if (["Tỵ", "Dậu", "Sửu"].includes(hourChi)) return 6; // Càn (Hợi)
  if (["Hợi", "Mão", "Mùi"].includes(hourChi)) return 4; // Tốn (Tỵ)
  return 2;
}

// Tra cứu Quái của Cung Cửu Cung
export function getTrigramForPalace(palaceNum: number): TrigramData {
  switch (palaceNum) {
    case 1:
      return TIEN_THIEN_BAT_QUAI[6]; // Khảm Thủy
    case 2:
      return TIEN_THIEN_BAT_QUAI[8]; // Khôn Thổ
    case 3:
      return TIEN_THIEN_BAT_QUAI[4]; // Chấn Mộc
    case 4:
      return TIEN_THIEN_BAT_QUAI[5]; // Tốn Mộc
    case 5:
      return TIEN_THIEN_BAT_QUAI[8]; // Trung ký Khôn
    case 6:
      return TIEN_THIEN_BAT_QUAI[1]; // Càn Kim
    case 7:
      return TIEN_THIEN_BAT_QUAI[2]; // Đoài Kim
    case 8:
      return TIEN_THIEN_BAT_QUAI[7]; // Cấn Thổ
    case 9:
      return TIEN_THIEN_BAT_QUAI[3]; // Ly Hỏa
    default:
      return TIEN_THIEN_BAT_QUAI[1];
  }
}

// Đánh giá Cách Cục Thiên Can + Địa Can
function evaluateCanFormation(thienCan: string, diaCan: string): { name: string; type: "cat" | "hung"; desc: string } | null {
  const pair = `${thienCan}+${diaCan}`;
  switch (pair) {
    case "Mậu+Bính":
      return {
        name: "Thanh Long Diệu Thừa (青龍耀明)",
        type: "cat",
        desc: "Đại Cát Cát Cách! Như rồng gặp mây sáng, mưu cầu danh lợi, cầu tài đắc tài, công danh thăng tiến.",
      };
    case "Bính+Mậu":
      return {
        name: "Phi Điểu Điệt Huyệt (飛鳥跌穴)",
        type: "cat",
        desc: "Đại Cát Cát Cách! Chim bay vào tổ ấm, an cư lạc nghiệp, không nhọc công sức mà đại hoạch thành công.",
      };
    case "Đinh+Ất":
      return {
        name: "Ngọc Nữ Thủ Môn (玉女守門)",
        type: "cat",
        desc: "Cát Cách! Hôn nhân hòa hợp, văn chương thông tuệ, được quý nhân nâng đỡ chở che.",
      };
    case "Ất+Bính":
      return {
        name: "Kỳ Thuận Cát Hướng (奇順吉向)",
        type: "cat",
        desc: "Cát Cách! Hào quang rạng rỡ, xuất hành hanh thông, công việc trôi chảy như nước xuôi dòng.",
      };
    case "Mậu+Đinh":
      return {
        name: "Thanh Long Đắc Châu (青龍得珠)",
        type: "cat",
        desc: "Cát Cách! Nhận được cơ hội quý giá, đầu tư sinh lời nhanh chóng, được cấp trên trọng dụng.",
      };
    case "Bính+Canh":
      return {
        name: "Huỳnh Hoặc Nhập Thái Bạch (熒惑入太白)",
        type: "hung",
        desc: "Hung Cách! Lửa nung kim loại, đề phòng mất mát tài sản, phản trắc, trộm cắp hoặc thị phi bất hòa.",
      };
    case "Canh+Bính":
      return {
        name: "Thái Bạch Nhập Huỳnh Hoặc (太白入熒惑)",
        type: "hung",
        desc: "Hung Cách! Tai ương bất ngờ ập tới, tranh chấp kiện tụng kịch liệt, chớ nên mạo hiểm đầu tư.",
      };
    case "Canh+Quý":
      return {
        name: "Đại Cách (大格)",
        type: "hung",
        desc: "Hung Cách! Xe cộ trục trặc, bôn ba vất vả mà không được việc, nên án binh bất động.",
      };
    case "Canh+Nhâm":
      return {
        name: "Tiểu Cách • Thượng Cách (小格)",
        type: "hung",
        desc: "Bình/Hung! Lưu lạc phương xa, dịch chuyển nhà cửa hoặc chỗ làm, tâm trí bất định.",
      };
    case "Tân+Ất":
      return {
        name: "Bạch Hổ Xương Cuồng (白虎猖狂)",
        type: "hung",
        desc: "Hung Cách! Đề phòng tai nạn thân thể, gia đạo bất an, tiểu nhân chèn ép phá hoại.",
      };
    default:
      return null;
  }
}

/**
 * THUẬT TOÁN KHỞI BÀN KỲ MÔN ĐỘN GIÁP
 */
export function calculateKyMonChart(
  dunType: "Dương Độn" | "Âm Độn",
  cucNum: number,
  hourPillar: { can: string; chi: string },
  dayPillar: { can: string; chi: string },
  monthPillar: { can: string; chi: string },
  yearPillar: { can: string; chi: string }
): KyMonChartResult {
  const isDuong = dunType === "Dương Độn";

  // 1. Phân bổ ĐỊA BÀN: Lục Nghi Tam Kỳ vào Cửu Cung
  // Dãy: Mậu, Kỷ, Canh, Tân, Nhâm, Quý, Đinh, Bính, Ất
  const diaCanMap: Record<number, string> = {};
  const canToDiaPalace: Record<string, number> = {};

  for (let i = 0; i < NGHI_KY_ORDER.length; i++) {
    const can = NGHI_KY_ORDER[i];
    let palace: number;
    if (isDuong) {
      // Dương Độn: thuận số (1..9)
      palace = ((cucNum - 1 + i) % 9) + 1;
    } else {
      // Âm Độn: nghịch số (9..1)
      palace = ((cucNum - 1 - i + 90) % 9) + 1;
    }
    diaCanMap[palace] = can;
    canToDiaPalace[can] = palace;
  }

  // 2. Xác định TUẦN THỦ & Cung Tuần Thủ
  const tuanThu = getTuanThu(hourPillar.can, hourPillar.chi);
  const rootPalace = canToDiaPalace[tuanThu.canHidden] || 1;

  // 3. Xác định TRỰC PHÙ TINH & TRỰC SỬ MÔN
  // Cung gốc có Tinh và Môn nguyên bản tương ứng
  const rootPalaceData = KY_MON_PALACES[rootPalace];
  const zhifuStar = rootPalace === 5 ? "Thiên Cầm" : rootPalaceData.originalStar;
  const zhishiGate = rootPalace === 5 ? "Tử Môn" : rootPalaceData.originalGate;

  // 4. THIÊN BÀN XOAY (Cửu Tinh & Thiên Can)
  // Can của Giờ: nếu giờ có Can Giáp thì dùng can ẩn của Tuần Thủ
  const targetHourCan = hourPillar.can === "Giáp" ? tuanThu.canHidden : hourPillar.can;
  const zhifuPalace = canToDiaPalace[targetHourCan] || 1;

  // 8 Cung ngoài theo vòng kim đồng hồ
  const ring8 = RING_8_PALACES;
  const starRing = ["Thiên Bồng", "Thiên Nhậm", "Thiên Xung", "Thiên Phụ", "Thiên Anh", "Thiên Nhuế", "Thiên Trụ", "Thiên Tâm"];

  // Vị trí Trực Phù Tinh trong vòng Tinh
  const effectiveStar = zhifuStar === "Thiên Cầm" ? "Thiên Nhuế" : zhifuStar;
  const starBaseIdx = starRing.indexOf(effectiveStar);
  const palaceTargetIdx = ring8.indexOf(zhifuPalace === 5 ? 2 : zhifuPalace);

  const starAtPalace: Record<number, string> = {};
  const thienCanMap: Record<number, string> = {};

  for (let step = 0; step < 8; step++) {
    const currentPalace = ring8[(palaceTargetIdx + step) % 8];
    const currentStar = starRing[(starBaseIdx + step) % 8];
    starAtPalace[currentPalace] = currentStar;

    // Thiên can theo Tinh bay: Can gốc của Tinh ở Địa bàn
    const origPalace = KY_MON_STARS[currentStar]?.originalPalace || 1;
    thienCanMap[currentPalace] = diaCanMap[origPalace] || "Mậu";
  }
  // Trung Cung Thiên Bàn (nếu giữ nguyên)
  starAtPalace[5] = "Thiên Cầm";
  thienCanMap[5] = diaCanMap[5];

  // 5. NHÂN BÀN XOAY (Bát Môn)
  // Trực Sử Môn bay theo bước từ Cung gốc đến Cung của Giờ
  const gateRing = ["Hưu Môn", "Sinh Môn", "Thương Môn", "Đỗ Môn", "Cảnh Môn", "Tử Môn", "Kinh Môn", "Khai Môn"];
  const gateBaseIdx = gateRing.indexOf(zhishiGate);

  // Tính số bước từ Giờ Giáp tới Giờ hiện tại
  const CAN_NAMES = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
  const hourStep = CAN_NAMES.indexOf(hourPillar.can);
  let zhishiPalace: number;
  if (isDuong) {
    const raw = rootPalace + hourStep;
    zhishiPalace = ((raw - 1) % 9) + 1;
  } else {
    const raw = rootPalace - hourStep;
    zhishiPalace = ((raw - 1 + 90) % 9) + 1;
  }
  if (zhishiPalace === 5) zhishiPalace = 2; // Ký Khôn 2

  const gateTargetIdx = ring8.indexOf(zhishiPalace);
  const gateAtPalace: Record<number, string> = {};

  for (let step = 0; step < 8; step++) {
    const currentPalace = ring8[(gateTargetIdx + step) % 8];
    const currentGate = gateRing[(gateBaseIdx + step) % 8];
    gateAtPalace[currentPalace] = currentGate;
  }
  gateAtPalace[5] = "Ký Khôn 2";

  // 6. THẦN BÀN XOAY (Bát Thần)
  // Trực Phù Thần luôn đóng tại Cung Trực Phù (zhifuPalace)
  const spiritAtPalace: Record<number, string> = {};
  const zhifuRingIdx = ring8.indexOf(zhifuPalace === 5 ? 2 : zhifuPalace);

  for (let step = 0; step < 8; step++) {
    const currentPalace = isDuong
      ? ring8[(zhifuRingIdx + step) % 8]
      : ring8[(zhifuRingIdx - step + 8) % 8];
    spiritAtPalace[currentPalace] = SPIRITS_ORDER[step];
  }
  spiritAtPalace[5] = "—";

  // 7. Tuần Không & Dịch Mã
  const horsePalace = getHorsePalace(hourPillar.chi);
  const voidPalaces: number[] = [];
  const voidChi = tuanThu.voidChi;
  if (voidChi.includes("Tuất") || voidChi.includes("Hợi")) voidPalaces.push(6);
  if (voidChi.includes("Thân") || voidChi.includes("Dậu")) {
    if (!voidPalaces.includes(7)) voidPalaces.push(7);
    if (!voidPalaces.includes(2)) voidPalaces.push(2);
  }
  if (voidChi.includes("Ngọ") || voidChi.includes("Mùi")) {
    if (!voidPalaces.includes(9)) voidPalaces.push(9);
    if (!voidPalaces.includes(2)) voidPalaces.push(2);
  }
  if (voidChi.includes("Thìn") || voidChi.includes("Tỵ")) voidPalaces.push(4);
  if (voidChi.includes("Dần") || voidChi.includes("Mão")) {
    if (!voidPalaces.includes(3)) voidPalaces.push(3);
    if (!voidPalaces.includes(8)) voidPalaces.push(8);
  }
  if (voidChi.includes("Tý") || voidChi.includes("Sửu")) {
    if (!voidPalaces.includes(1)) voidPalaces.push(1);
    if (!voidPalaces.includes(8)) voidPalaces.push(8);
  }

  // 8. TỔNG HỢP CÁC Ô TRONG 9 CUNG
  const cells: Record<number, KyMonCellData> = {};
  const mainFormations: { name: string; type: "cat" | "hung"; desc: string }[] = [];

  for (let num = 1; num <= 9; num++) {
    const palace = KY_MON_PALACES[num];
    const diaCan = diaCanMap[num] || "Mậu";
    const thienCan = thienCanMap[num] || "Mậu";
    const star = starAtPalace[num] || palace.originalStar;
    const gate = gateAtPalace[num] || palace.originalGate;
    const spirit = spiritAtPalace[num] || "Trực Phù";

    const formation = evaluateCanFormation(thienCan, diaCan);
    if (formation && (num === zhifuPalace || num === zhishiPalace || num === 8 || num === 1 || num === 6)) {
      mainFormations.push(formation);
    }

    cells[num] = {
      palaceNum: num,
      palace,
      diaCan,
      thienCan,
      star,
      starInfo: KY_MON_STARS[star] || KY_MON_STARS["Thiên Bồng"],
      gate,
      gateInfo: KY_MON_GATES[gate] || KY_MON_GATES["Hưu Môn"],
      spirit,
      spiritInfo: KY_MON_SPIRITS[spirit] || KY_MON_SPIRITS["Trực Phù"],
      isZhifuStar: num === zhifuPalace,
      isZhishiGate: num === zhishiPalace,
      isVoid: voidPalaces.includes(num),
      isHorse: num === horsePalace,
      formationName: formation?.name,
      formationType: formation?.type,
      formationDesc: formation?.desc,
    };
  }

  // 9. KỲ MÔN HÓA DỊCH (Liên kết sang 64 Quẻ Kinh Dịch)
  // Thượng Quái = Quái Cung Trực Phù
  // Hạ Quái = Quái Cung Trực Sử
  const upperTrigram = getTrigramForPalace(zhifuPalace);
  const lowerTrigram = getTrigramForPalace(zhishiPalace);

  // 6 Lines of Primary Hexagram
  const primaryLines: [number, number, number, number, number, number] = [
    lowerTrigram.lines[0],
    lowerTrigram.lines[1],
    lowerTrigram.lines[2],
    upperTrigram.lines[0],
    upperTrigram.lines[1],
    upperTrigram.lines[2],
  ];

  const primaryHex = findHexagramByLines(primaryLines) || HEXAGRAMS[0];

  // Hào động tính từ Cung Trực Sử + Cung Trực Phù % 6
  const changingLine = ((zhishiPalace + zhifuPalace - 1) % 6) + 1;
  const transformedHex = getTransformedHexagram(primaryHex, [changingLine]) || primaryHex;

  // Lời khuyên chiến lược Kỳ Môn
  const zhishiGateObj = KY_MON_GATES[zhishiGate] || KY_MON_GATES["Khai Môn"];
  const strategicAdvice =
    zhishiGateObj.quality === "Đại Cát" || zhishiGateObj.quality === "Cát"
      ? `Trực Sử ${zhishiGate} đắc thời tại Cung ${zhishiPalace} (${KY_MON_PALACES[zhishiPalace].direction}). Đây là thiên thời địa lợi rất tốt để chủ động tiến công, triển khai kế hoạch lớn, cầu tài đắc tài.`
      : `Trực Sử ${zhishiGate} tại Cung ${zhishiPalace} (${KY_MON_PALACES[zhishiPalace].direction}). Việc cần cẩn trọng chu toàn, nên xuất hành về các phương có Tam Cát Môn (Khai, Hưu, Sinh) để mượn khí cát tường che chở.`;

  return {
    dunType,
    cucNum,
    tuanThu,
    zhifuStar,
    zhishiGate,
    zhifuPalace,
    zhishiPalace,
    horsePalace,
    voidPalaces,
    cells,
    primaryHex,
    transformedHex,
    changingLine,
    upperTrigram,
    lowerTrigram,
    primarySummary: `Kỳ Môn Độn Giáp [${dunType} ${cucNum} Cục] • Giờ ${hourPillar.can} ${hourPillar.chi} (Trực Phù ${zhifuStar} tại Cung ${zhifuPalace} - Trực Sử ${zhishiGate} tại Cung ${zhishiPalace}) ➔ Quẻ #${primaryHex.number} ${primaryHex.name}`,
    mainFormations,
    strategicAdvice,
    hourPillar,
    dayPillar,
    monthPillar,
    yearPillar,
  };
}
