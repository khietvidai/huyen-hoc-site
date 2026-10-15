/**
 * Dữ liệu và Thuật toán Lục Nhâm Hóa Dịch (Da Liuren Hexagram Transformation - 六壬化易)
 * Chuyển đổi Bàn Lục Nhâm Đại Độn (Bát Tự, Tứ Khóa, Tam Truyền, Hoạt Thời) sang 64 Quẻ Chu Dịch
 * Thượng Quái ứng Sơ Truyền (Phát Đoan), Hạ Quái ứng Mạt Truyền (Quy Cục), Hào Động theo cơ biến Hoạt Thời.
 */

import { Hexagram } from "../types";
import { HEXAGRAMS, findHexagramByLines, getTransformedHexagram } from "./hexagrams";
import { TIEN_THIEN_BAT_QUAI, TrigramData } from "../components/MaiHoaDivination";

// Mapping 12 Địa Chi sang Bát Quái theo Hậu Thiên Bát Quái truyền thống
// Tý (Khảm), Sửu & Dần (Cấn), Mão (Chấn), Thìn & Tỵ (Tốn), Ngọ (Ly), Mùi & Thân (Khôn), Dậu (Đoài), Tuất & Hợi (Càn)
export const CHI_TO_TRIGRAM_MAP: Record<string, number> = {
  "Tý": 6,   // Khảm (Thủy - Nước, số 6 Tiên Thiên)
  "Sửu": 7,  // Cấn (Thổ - Núi, số 7 Tiên Thiên)
  "Dần": 7,  // Cấn (Thổ - Núi, số 7 Tiên Thiên)
  "Mão": 4,  // Chấn (Mộc - Sấm, số 4 Tiên Thiên)
  "Thìn": 5, // Tốn (Mộc - Gió, số 5 Tiên Thiên)
  "Tỵ": 5,   // Tốn (Mộc - Gió, số 5 Tiên Thiên)
  "Ngọ": 3,  // Ly (Hỏa - Lửa, số 3 Tiên Thiên)
  "Mùi": 8,  // Khôn (Thổ - Đất, số 8 Tiên Thiên)
  "Thân": 8, // Khôn (Thổ - Đất, số 8 Tiên Thiên)
  "Dậu": 2,  // Đoài (Kim - Đầm, số 2 Tiên Thiên)
  "Tuất": 1, // Càn (Kim - Trời, số 1 Tiên Thiên)
  "Hợi": 1,  // Càn (Kim - Trời, số 1 Tiên Thiên)
};

const CHI_NAMES = [
  "Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ",
  "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"
];

const CAN_NAMES = [
  "Giáp", "Ất", "Bính", "Đinh", "Mậu",
  "Kỷ", "Canh", "Tân", "Nhâm", "Quý"
];

// Ngũ hành của 12 Chi
const CHI_ELEMENTS: Record<string, "Thủy" | "Thổ" | "Mộc" | "Hỏa" | "Kim"> = {
  "Tý": "Thủy", "Sửu": "Thổ", "Dần": "Mộc", "Mão": "Mộc",
  "Thìn": "Thổ", "Tỵ": "Hỏa", "Ngọ": "Hỏa", "Mùi": "Thổ",
  "Thân": "Kim", "Dậu": "Kim", "Tuất": "Thổ", "Hợi": "Thủy",
};

// Cung Ký Can của 10 Thiên Can
const CAN_JI_PALACE: Record<string, string> = {
  "Giáp": "Dần",
  "Ất": "Thìn",
  "Bính": "Tỵ",
  "Đinh": "Mùi",
  "Mậu": "Tỵ",
  "Kỷ": "Mùi",
  "Canh": "Thân",
  "Tân": "Tuất",
  "Nhâm": "Hợi",
  "Quý": "Sửu",
};

export interface LucNhamHoaDichResult {
  primaryHex: Hexagram;
  transformedHex: Hexagram;
  changingLine: number; // 1..6
  upperTrigram: TrigramData;
  lowerTrigram: TrigramData;
  soTruyenBranch: string;
  trungTruyenBranch: string;
  matTruyenBranch: string;
  cucName: string;
  cucDesc: string;
  dayCan: string;
  dayChi: string;
  hourChi: string;
  summary: string;
  soTruyenAnalysis: string;
  trungTruyenAnalysis: string;
  matTruyenAnalysis: string;
  strategicAdvice: string;
}

/**
 * Tính toán Lục Nhâm Hóa Dịch sang 64 Quẻ Chu Dịch
 */
export function calculateLucNhamHoaDich(
  dayCan: string,
  dayChi: string,
  hourChi: string, // Hoạt Thời hoặc Trụ Giờ
  nguyetTuongBranch: string = "Hợi"
): LucNhamHoaDichResult {
  const dCan = dayCan || "Giáp";
  const dChi = dayChi || "Tý";
  const hChi = hourChi || "Ngọ";
  const ntBranch = nguyetTuongBranch || "Hợi";

  // 1. TÍNH THIÊN BÀN & ĐỊA BÀN
  // Nguyệt Tướng gia lên Thời Thần (Giờ Chi)
  const nguyetTuongIdx = Math.max(0, CHI_NAMES.indexOf(ntBranch));
  const thoiThanIdx = Math.max(0, CHI_NAMES.indexOf(hChi));

  // Offset Thiên Bàn
  const offset = (nguyetTuongIdx - thoiThanIdx + 12) % 12;

  // Lấy Thiên Thần lâm lên 1 Địa Chi mặt đất
  const getSkyBranchOfGround = (groundBranchName: string): string => {
    const gIdx = Math.max(0, CHI_NAMES.indexOf(groundBranchName));
    const skyIdx = (gIdx + offset) % 12;
    return CHI_NAMES[skyIdx];
  };

  // 2. TÍNH TỨ KHÓA
  // Khóa 1: Can Thượng Thần (Can Ký Chi -> Thiên Thần)
  const canJi = CAN_JI_PALACE[dCan] || "Dần";
  const k1Thuong = getSkyBranchOfGround(canJi);
  const k1Ha = canJi;

  // Khóa 2: Thần Thượng Thần (Lấy Thiên Thần Khóa 1 làm Địa Thần -> tìm Thiên Thần)
  const k2Thuong = getSkyBranchOfGround(k1Thuong);
  const k2Ha = k1Thuong;

  // Khóa 3: Chi Thượng Thần
  const k3Thuong = getSkyBranchOfGround(dChi);
  const k3Ha = dChi;

  // Khóa 4: Chi Thần Thượng Thần
  const k4Thuong = getSkyBranchOfGround(k3Thuong);
  const k4Ha = k3Thuong;

  // 3. TÍNH TAM TRUYỀN (SƠ TRUYỀN, TRUNG TRUYỀN, MẠT TRUYỀN)
  // Quy ước Cửu Tông Môn Lục Nhâm:
  // Sơ Truyền khởi từ Khóa có sinh khắc nổi trội hoặc Mão Tinh / Tặc Khắc
  let soTruyenBranch = k1Thuong;
  let cucName = "Trọng Thẩm Cục (Hạ Tặc Thượng)";
  let cucDesc = "Sự việc nội tại phát đoan, trước khó sau dễ, chuyển hóa bất ngờ.";

  // Xác định tương khắc trong Tứ Khóa
  const checkTacKhac = (th: string, ha: string): "HA_TAC" | "THUONG_KHAC" | "HOA" => {
    const elTh = CHI_ELEMENTS[th];
    const elHa = CHI_ELEMENTS[ha];
    if (
      (elHa === "Thủy" && elTh === "Hỏa") ||
      (elHa === "Hỏa" && elTh === "Kim") ||
      (elHa === "Kim" && elTh === "Mộc") ||
      (elHa === "Mộc" && elTh === "Thổ") ||
      (elHa === "Thổ" && elTh === "Thủy")
    ) return "HA_TAC";
    if (
      (elTh === "Thủy" && elHa === "Hỏa") ||
      (elTh === "Hỏa" && elHa === "Kim") ||
      (elTh === "Kim" && elHa === "Mộc") ||
      (elTh === "Mộc" && elHa === "Thổ") ||
      (elTh === "Thổ" && elHa === "Thủy")
    ) return "THUONG_KHAC";
    return "HOA";
  };

  const rel1 = checkTacKhac(k1Thuong, k1Ha);
  const rel2 = checkTacKhac(k2Thuong, k2Ha);
  const rel3 = checkTacKhac(k3Thuong, k3Ha);
  const rel4 = checkTacKhac(k4Thuong, k4Ha);

  if (rel1 === "HA_TAC") {
    soTruyenBranch = k1Thuong;
    cucName = "Trọng Thẩm Cục (Hạ Tặc Thượng)";
    cucDesc = "Hạ thần dâng tặc khắc lên Thượng thần, chính sự nội bộ phát sinh.";
  } else if (rel3 === "HA_TAC") {
    soTruyenBranch = k3Thuong;
    cucName = "Trọng Thẩm Cục (Chi Khóa Phát Đoan)";
    cucDesc = "Mầm mống từ gia đạo, tài chính hoặc biến động bên ngoài dấy lên.";
  } else if (rel1 === "THUONG_KHAC") {
    soTruyenBranch = k1Thuong;
    cucName = "Nguyên Thủ Cục (Thượng Khắc Hạ)";
    cucDesc = "Thượng thần từ trên giáng khắc, thuận theo lý lẽ lẽ trời, người trên giúp sức.";
  } else if (rel3 === "THUONG_KHAC") {
    soTruyenBranch = k3Thuong;
    cucName = "Nguyên Thủ Cục (Chi Thần Phát Khởi)";
    cucDesc = "Hoàn cảnh bên ngoài tác động mạnh mẽ đến kế hoạch bản thân.";
  } else {
    // Tỉ Dụng hoặc Mão Tinh
    soTruyenBranch = k1Thuong;
    cucName = "Tỉ Dụng Cục (Thiệp Hại Tri Nhất)";
    cucDesc = "Nhiều yếu tố đan xen, chọn Thần tương hòa để định hướng hành sự.";
  }

  // Trung Truyền = Thiên Thần của Sơ Truyền
  const trungTruyenBranch = getSkyBranchOfGround(soTruyenBranch);

  // Mạt Truyền = Thiên Thần của Trung Truyền
  const matTruyenBranch = getSkyBranchOfGround(trungTruyenBranch);

  // 4. QUY NẠP SANG CHU DỊCH (LỤC NHÂM HÓA DỊCH)
  // Thượng Quái (Ngoại Quái) nạp từ Sơ Truyền
  const upperTrigNum = CHI_TO_TRIGRAM_MAP[soTruyenBranch] || 1;
  const upperTrigram = TIEN_THIEN_BAT_QUAI[upperTrigNum] || TIEN_THIEN_BAT_QUAI[1];

  // Hạ Quái (Nội Quái) nạp từ Mạt Truyền (nếu trùng Sơ Truyền thì dùng k3Thuong hoặc dChi)
  let lowerBranch = matTruyenBranch;
  if (lowerBranch === soTruyenBranch) {
    lowerBranch = k3Thuong !== soTruyenBranch ? k3Thuong : dChi;
  }
  const lowerTrigNum = CHI_TO_TRIGRAM_MAP[lowerBranch] || 8;
  const lowerTrigram = TIEN_THIEN_BAT_QUAI[lowerTrigNum] || TIEN_THIEN_BAT_QUAI[8];

  // 6 Hào của Quẻ Chủ
  const primaryLines: [number, number, number, number, number, number] = [
    lowerTrigram.lines[0],
    lowerTrigram.lines[1],
    lowerTrigram.lines[2],
    upperTrigram.lines[0],
    upperTrigram.lines[1],
    upperTrigram.lines[2],
  ];

  const primaryHex = findHexagramByLines(primaryLines) || HEXAGRAMS[0];

  // 5. HÀO ĐỘNG (HÀO BIẾN)
  // Tính theo tổng biến hóa của Tam Truyền + Hoạt Thời Chi + Can Ngày
  const soIdx = CHI_NAMES.indexOf(soTruyenBranch) + 1;
  const trungIdx = CHI_NAMES.indexOf(trungTruyenBranch) + 1;
  const matIdx = CHI_NAMES.indexOf(matTruyenBranch) + 1;
  const hoatThoiIdx = CHI_NAMES.indexOf(hChi) + 1;
  const canIdx = CAN_NAMES.indexOf(dCan) + 1;

  const changingLine = ((soIdx + trungIdx + matIdx + hoatThoiIdx + canIdx - 1) % 6) + 1;
  const transformedHex = getTransformedHexagram(primaryHex, [changingLine]) || primaryHex;

  // 6. PHÂN TÍCH TAM TRUYỀN & ĐỐI CHIẾU DỊCH QUẺ
  const soTruyenAnalysis = `Sơ Truyền là [${soTruyenBranch}] (${CHI_ELEMENTS[soTruyenBranch]}) nạp Thượng Quái ${upperTrigram.name} (${upperTrigram.nature}). Đây là Phát Đoan thần, biểu thị nguồn cơn mầm mống ban đầu của việc cần hỏi. Khí của quái ${upperTrigram.name} đang chấn động ngoại cảnh.`;

  const trungTruyenAnalysis = `Trung Truyền là [${trungTruyenBranch}] (${CHI_ELEMENTS[trungTruyenBranch]}). Đây là Di Truyền thần, chủ về quá trình diễn biến trung gian, những trắc trở hoặc cơ duyên gặp gỡ dọc đường. Tương ứng với biến động tại các hào giữa của quẻ.`;

  const matTruyenAnalysis = `Mạt Truyền là [${matTruyenBranch}] (${CHI_ELEMENTS[matTruyenBranch]}) nạp Hạ Quái ${lowerTrigram.name} (${lowerTrigram.nature}). Đây là Quy Cục thần, biểu thị điểm an định, kết quả chung cuộc của sự việc. Khí của quái ${lowerTrigram.name} là nền tảng nâng đỡ hoặc dung dưỡng kết quả.`;

  const strategicAdvice = `Theo Lục Nhâm Hóa Dịch: Thế cục thuộc ${cucName}. Quẻ Chủ #${primaryHex.number} ${primaryHex.name} khuyên bạn nên nắm bắt đúng nhịp độ từ Sơ Truyền [${soTruyenBranch}] đến Mạt Truyền [${matTruyenBranch}]. Động tại Hào ${changingLine} chuyển sang Quẻ Biến #${transformedHex.number} ${transformedHex.name}, cho thấy tương lai sẽ chuyển biến tích cực nếu bạn hành xử thuận theo đức sáng của quẻ.`;

  const summary = `Lục Nhâm Hóa Dịch [${cucName}] • Giờ ${hChi} • Sơ Truyền ${soTruyenBranch} (${upperTrigram.name}) - Mạt Truyền ${matTruyenBranch} (${lowerTrigram.name}) • Động Hào ${changingLine} ➔ Quẻ #${primaryHex.number} ${primaryHex.name}`;

  return {
    primaryHex,
    transformedHex,
    changingLine,
    upperTrigram,
    lowerTrigram,
    soTruyenBranch,
    trungTruyenBranch,
    matTruyenBranch,
    cucName,
    cucDesc,
    dayCan: dCan,
    dayChi: dChi,
    hourChi: hChi,
    summary,
    soTruyenAnalysis,
    trungTruyenAnalysis,
    matTruyenAnalysis,
    strategicAdvice,
  };
}
