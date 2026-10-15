/**
 * Bảng 12 Trực Nhật Tinh (12 Thần Hoàng Đạo / Hắc Đạo theo tháng và ngày/giờ)
 * Cập nhật chuẩn xác theo yêu cầu người dùng:
 * 
 * Tý (số 01, 23h00-00h59)
 * - Tháng Dần, Thân: Thanh Long
 * - Tháng Mão, Dậu: Tư Mệnh
 * - Tháng Thìn, Tuất: Thiên Lao
 * - Tháng Tị, Hợi: Bạch Hổ
 * - Tháng Ngọ, Tý: Kim Quỹ
 * - Tháng Mùi, Sửu: Thiên Hình
 * 
 * Sửu (số 02, 1h00-2h59)
 * - Tháng Dần, Thân: Minh Đường
 * - Tháng Mão, Dậu: Câu Trận
 * - Tháng Thìn, Tuất: Huyền Vũ
 * - Tháng Tị, Hợi: Ngọc Đường
 * - Tháng Ngọ, Tý: Thiên Đức Hợp
 * - Tháng Mùi, Sửu: Chu Tước
 * 
 * Dần (số 03, 3h00-4h59)
 * - Tháng Dần, Thân: Thiên Hình
 * - Tháng Mão, Dậu: Thanh Long
 * - Tháng Thìn, Tuất: Tư Mệnh
 * - Tháng Tị, Hợi: Thiên Lao
 * - Tháng Ngọ, Tý: Bạch Hổ
 * - Tháng Mùi, Sửu: Kim Quỹ
 * 
 * Mão (số 04, 5h00-6h59)
 * - Tháng Dần, Thân: Chu Tước
 * - Tháng Mão, Dậu: Minh Đường
 * - Tháng Thìn, Tuất: Câu Trận
 * - Tháng Tị, Hợi: Huyền Vũ
 * - Tháng Ngọ, Tý: Ngọc Đường
 * - Tháng Mùi, Sửu: Thiên Đức Hợp
 * 
 * Thìn (số 05, 7h00-8h59)
 * - Tháng Dần, Thân: Kim Quỹ
 * - Tháng Mão, Dậu: Thiên Hình
 * - Tháng Thìn, Tuất: Thanh Long
 * - Tháng Tị, Hợi: Tư Mệnh
 * - Tháng Ngọ, Tý: Thiên Lao
 * - Tháng Mùi, Sửu: Bạch Hổ
 * 
 * Tị (số 06, 9h00-10h59)
 * - Tháng Dần, Thân: Thiên Đức Hợp
 * - Tháng Mão, Dậu: Chu Tước
 * - Tháng Thìn, Tuất: Minh Đường
 * - Tháng Tị, Hợi: Câu Trận
 * - Tháng Ngọ, Tý: Huyền Vũ
 * - Tháng Mùi, Sửu: Ngọc Đường
 * 
 * Ngọ (số 07, 11h00-12h59)
 * - Tháng Dần, Thân: Bạch Hổ
 * - Tháng Mão, Dậu: Kim Quỹ
 * - Tháng Thìn, Tuất: Thiên Hình
 * - Tháng Tị, Hợi: Thanh Long
 * - Tháng Ngọ, Tý: Tư Mệnh
 * - Tháng Mùi, Sửu: Thiên Lao
 * 
 * Mùi (số 08, 13h00-14h59)
 * - Tháng Dần, Thân: Ngọc Đường
 * - Tháng Mão, Dậu: Thiên Đức Hợp
 * - Tháng Thìn, Tuất: Chu Tước
 * - Tháng Tị, Hợi: Minh Đường
 * - Tháng Ngọ, Tý: Câu Trận
 * - Tháng Mùi, Sửu: Huyền Vũ
 * 
 * Thân (số 09, 15h00-16h59)
 * - Tháng Dần, Thân: Thiên Lao
 * - Tháng Mão, Dậu: Bạch Hổ
 * - Tháng Thìn, Tuất: Kim Quỹ
 * - Tháng Tị, Hợi: Thiên Hình
 * - Tháng Ngọ, Tý: Thanh Long
 * - Tháng Mùi, Sửu: Tư Mệnh
 * 
 * Dậu (số 10, 17h00-18h59)
 * - Tháng Dần, Thân: Huyền Vũ
 * - Tháng Mão, Dậu: Ngọc Đường
 * - Tháng Thìn, Tuất: Thiên Đức Hợp
 * - Tháng Tị, Hợi: Chu Tước
 * - Tháng Ngọ, Tý: Minh Đường
 * - Tháng Mùi, Sửu: Câu Trận
 * 
 * Tuất (số 11, 19h00-20h59)
 * - Tháng Dần, Thân: Tư Mệnh
 * - Tháng Mão, Dậu: Thiên Lao
 * - Tháng Thìn, Tuất: Bạch Hổ
 * - Tháng Tị, Hợi: Kim Quỹ
 * - Tháng Ngọ, Tý: Thiên Hình
 * - Tháng Mùi, Sửu: Thanh Long
 * 
 * Hợi (số 12, 21h00-22h59)
 * - Tháng Dần, Thân: Chu Tước
 * - Tháng Mão, Dậu: Minh Đường
 * - Tháng Thìn, Tuất: Câu Trận
 * - Tháng Tị, Hợi: Huyền Vũ
 * - Tháng Ngọ, Tý: Ngọc Đường
 * - Tháng Mùi, Sửu: Thiên Đức Hợp
 */

export interface TrucNhatTinhDetail {
  name: string;
  chinese: string;
  mappedGeneral: string; // Tên Thiên Tướng ngầm hiểu theo quy ước Lục Nhâm Tâm Ấn Phú
  nature: "Hoàng Đạo" | "Hắc Đạo";
  quality: "Đại Cát" | "Cát" | "Thứ Cát" | "Hung" | "Đại Hung";
  color: string;
  textColor: string;
  badgeBg: string;
  element: string;
  desc: string;
}

// 12 Sao Hoàng Đạo / Hắc Đạo
// Ngầm hiểu:
// - Minh Đường ngầm hiểu là Quý Nhân
// - Thiên Hình ngầm hiểu là Đằng Xà
// - Chu Tước ngầm hiểu là Chu Tước
// - Thiên Đức Hợp ngầm hiểu là Lục Hợp
// - Câu Trận ngầm hiểu là Câu Trần
// - Thanh Long ngầm hiểu là Thanh Long
// - Thiên Lao ngầm hiểu là Thiên Không
// - Bạch Hổ ngầm hiểu là Bạch Hổ
// - Ngọc Đường ngầm hiểu là Thái Thường
// - Huyền Vũ ngầm hiểu là Huyền Vũ
// - Kim Quỹ ngầm hiểu là Thái Âm
// - Tư Mệnh ngầm hiểu là Thiên Hậu
export const TRUC_NHAT_TINH_INFO_MAP: Record<string, TrucNhatTinhDetail> = {
  "Thanh Long": {
    name: "Thanh Long",
    chinese: "青龍",
    mappedGeneral: "Thanh Long",
    nature: "Hoàng Đạo",
    quality: "Đại Cát",
    color: "from-teal-600 to-emerald-600",
    textColor: "text-emerald-300",
    badgeBg: "bg-emerald-950/80 text-emerald-300 border-emerald-600/70",
    element: "Mộc",
    desc: "Hoàng Đạo cát tinh. Ngầm hiểu là Thanh Long: Chủ tài lộc, vinh hoa, tiền của, sinh quý tử, xuất hành trăm việc cát tường.",
  },
  "Minh Đường": {
    name: "Minh Đường",
    chinese: "明堂",
    mappedGeneral: "Quý Nhân",
    nature: "Hoàng Đạo",
    quality: "Đại Cát",
    color: "from-amber-600 to-yellow-600",
    textColor: "text-amber-300",
    badgeBg: "bg-amber-950/80 text-amber-300 border-amber-600/70",
    element: "Thổ",
    desc: "Hoàng Đạo cát tinh. Ngầm hiểu là Quý Nhân: Chủ soái 12 tướng, quý nhân tương trợ, công đạo trang nghiêm, cứu khốn phù nguy.",
  },
  "Thiên Hình": {
    name: "Thiên Hình",
    chinese: "天刑",
    mappedGeneral: "Đằng Xà",
    nature: "Hắc Đạo",
    quality: "Hung",
    color: "from-rose-800 to-red-900",
    textColor: "text-rose-400",
    badgeBg: "bg-rose-950/80 text-rose-400 border-rose-700/60",
    element: "Kim",
    desc: "Hắc Đạo hung tinh. Ngầm hiểu là Đằng Xà: Chủ kinh sợ, quái dị, ác mộng, tráo trở; kỵ tranh chấp hình phạt thị phi.",
  },
  "Chu Tước": {
    name: "Chu Tước",
    chinese: "朱雀",
    mappedGeneral: "Chu Tước",
    nature: "Hắc Đạo",
    quality: "Hung",
    color: "from-orange-700 to-rose-700",
    textColor: "text-orange-400",
    badgeBg: "bg-orange-950/80 text-orange-400 border-orange-700/60",
    element: "Hỏa",
    desc: "Hắc Đạo hung tinh. Ngầm hiểu là Chu Tước: Chủ văn thư, tin tức; phòng khẩu thiệt thị phi, tranh cãi bất hòa.",
  },
  "Kim Quỹ": {
    name: "Kim Quỹ",
    chinese: "金匱",
    mappedGeneral: "Thái Âm",
    nature: "Hoàng Đạo",
    quality: "Đại Cát",
    color: "from-yellow-600 to-amber-500",
    textColor: "text-yellow-300",
    badgeBg: "bg-yellow-950/80 text-yellow-300 border-yellow-600/70",
    element: "Kim",
    desc: "Hoàng Đạo cát tinh. Ngầm hiểu là Thái Âm: Chủ mưu kín, âm đức che chở, phụ nữ tương trợ, tích lũy kho tàng của cải.",
  },
  "Thiên Đức Hợp": {
    name: "Thiên Đức Hợp",
    chinese: "天德合",
    mappedGeneral: "Lục Hợp",
    nature: "Hoàng Đạo",
    quality: "Đại Cát",
    color: "from-purple-600 to-indigo-600",
    textColor: "text-purple-300",
    badgeBg: "bg-purple-950/80 text-purple-300 border-purple-600/70",
    element: "Thổ",
    desc: "Hoàng Đạo cát tinh. Ngầm hiểu là Lục Hợp: Chủ hòa hợp, giao kết, liên minh hôn nhân, quý nhân tương trợ trăm việc hanh thông.",
  },
  "Bạch Hổ": {
    name: "Bạch Hổ",
    chinese: "白虎",
    mappedGeneral: "Bạch Hổ",
    nature: "Hắc Đạo",
    quality: "Đại Hung",
    color: "from-red-900 to-stone-900",
    textColor: "text-red-400",
    badgeBg: "bg-red-950/90 text-red-400 border-red-700/80",
    element: "Kim",
    desc: "Hắc Đạo đại hung tinh. Ngầm hiểu là Bạch Hổ: Chủ hình thương, đổ máu, tang chế, bệnh hiểm; kỵ động thổ, khai trương, xuất hành.",
  },
  "Ngọc Đường": {
    name: "Ngọc Đường",
    chinese: "玉堂",
    mappedGeneral: "Thái Thường",
    nature: "Hoàng Đạo",
    quality: "Đại Cát",
    color: "from-cyan-600 to-teal-600",
    textColor: "text-cyan-300",
    badgeBg: "bg-cyan-950/80 text-cyan-300 border-cyan-600/70",
    element: "Thủy",
    desc: "Hoàng Đạo cát tinh. Ngầm hiểu là Thái Thường: Chủ yến tiệc, áo mão lụa là, quà tặng, ân điển ban thưởng, công danh đỗ đạt.",
  },
  "Thiên Lao": {
    name: "Thiên Lao",
    chinese: "天牢",
    mappedGeneral: "Thiên Không",
    nature: "Hắc Đạo",
    quality: "Hung",
    color: "from-stone-700 to-zinc-900",
    textColor: "text-zinc-400",
    badgeBg: "bg-zinc-950/80 text-zinc-400 border-zinc-700/60",
    element: "Thủy",
    desc: "Hắc Đạo hung tinh. Ngầm hiểu là Thiên Không: Chủ dối trá, lời hứa suông, hao tài, ngưng trệ bế tắc; kỵ mưu việc lớn.",
  },
  "Huyền Vũ": {
    name: "Huyền Vũ",
    chinese: "玄武",
    mappedGeneral: "Huyền Vũ",
    nature: "Hắc Đạo",
    quality: "Hung",
    color: "from-blue-900 to-slate-900",
    textColor: "text-blue-400",
    badgeBg: "bg-blue-950/80 text-blue-400 border-blue-700/60",
    element: "Thủy",
    desc: "Hắc Đạo hung tinh. Ngầm hiểu là Huyền Vũ: Chủ mất trộm, gian tà, tiểu nhân hãm hại, tổn thất; cẩn trọng cất giữ tài sản.",
  },
  "Tư Mệnh": {
    name: "Tư Mệnh",
    chinese: "司命",
    mappedGeneral: "Thiên Hậu",
    nature: "Hoàng Đạo",
    quality: "Cát",
    color: "from-emerald-700 to-teal-800",
    textColor: "text-emerald-300",
    badgeBg: "bg-emerald-950/80 text-emerald-300 border-emerald-600/70",
    element: "Hỏa",
    desc: "Hoàng Đạo cát tinh. Ngầm hiểu là Thiên Hậu: Chủ ân trạch, bao dung, bếp núc an khang, gia đạo yên vui vững bền.",
  },
  "Câu Trận": {
    name: "Câu Trận",
    chinese: "勾陳",
    mappedGeneral: "Câu Trần",
    nature: "Hắc Đạo",
    quality: "Hung",
    color: "from-amber-900 to-stone-900",
    textColor: "text-amber-500",
    badgeBg: "bg-amber-950/80 text-amber-500 border-amber-800/60",
    element: "Thổ",
    desc: "Hắc Đạo hung tinh. Ngầm hiểu là Câu Trần: Chủ chấp pháp, câu lưu chậm trễ, tranh chấp đất đai ruộng vườn kiện tụng.",
  },
};

// Nhóm tháng theo Địa Chi (Tháng Âm Lịch hoặc Chi của Tháng)
// 6 nhóm tháng:
// 0: Tháng Dần, Thân (tháng 1, 7)
// 1: Tháng Mão, Dậu (tháng 2, 8)
// 2: Tháng Thìn, Tuất (tháng 3, 9)
// 3: Tháng Tị, Hợi (tháng 4, 10)
// 4: Tháng Ngọ, Tý (tháng 5, 11)
// 5: Tháng Mùi, Sửu (tháng 6, 12)

export type MonthGroupIndex = 0 | 1 | 2 | 3 | 4 | 5;

export const TRUC_NHAT_TINH_12_LIST: TrucNhatTinhDetail[] = [
  TRUC_NHAT_TINH_INFO_MAP["Thanh Long"],
  TRUC_NHAT_TINH_INFO_MAP["Minh Đường"],
  TRUC_NHAT_TINH_INFO_MAP["Thiên Hình"],
  TRUC_NHAT_TINH_INFO_MAP["Chu Tước"],
  TRUC_NHAT_TINH_INFO_MAP["Kim Quỹ"],
  TRUC_NHAT_TINH_INFO_MAP["Thiên Đức Hợp"],
  TRUC_NHAT_TINH_INFO_MAP["Bạch Hổ"],
  TRUC_NHAT_TINH_INFO_MAP["Ngọc Đường"],
  TRUC_NHAT_TINH_INFO_MAP["Thiên Lao"],
  TRUC_NHAT_TINH_INFO_MAP["Huyền Vũ"],
  TRUC_NHAT_TINH_INFO_MAP["Tư Mệnh"],
  TRUC_NHAT_TINH_INFO_MAP["Câu Trận"],
];

export const MONTH_GROUP_NAMES: Record<MonthGroupIndex, string> = {
  0: "Tháng Dần, Thân",
  1: "Tháng Mão, Dậu",
  2: "Tháng Thìn, Tuất",
  3: "Tháng Tị, Hợi",
  4: "Tháng Ngọ, Tý",
  5: "Tháng Mùi, Sửu",
};

/**
 * Ma trận 12 Chi ứng 6 nhóm Tháng -> Trực Nhật Tinh chính xác theo nội dung cập nhật
 * Chi index: 0=Tý, 1=Sửu, 2=Dần, 3=Mão, 4=Thìn, 5=Tị, 6=Ngọ, 7=Mùi, 8=Thân, 9=Dậu, 10=Tuất, 11=Hợi
 */
export const TRUC_NHAT_TINH_MATRIX: Record<number, Record<MonthGroupIndex, string>> = {
  // 0: Tý (số 01 giờ 23h00-00h59)
  0: {
    0: "Thanh Long",
    1: "Tư Mệnh",
    2: "Thiên Lao",
    3: "Bạch Hổ",
    4: "Kim Quỹ",
    5: "Thiên Hình",
  },
  // 1: Sửu (số 02 giờ 1h00-2h59)
  1: {
    0: "Minh Đường",
    1: "Câu Trận",
    2: "Huyền Vũ",
    3: "Ngọc Đường",
    4: "Thiên Đức Hợp",
    5: "Chu Tước",
  },
  // 2: Dần (số 03 giờ 3h00-4h59)
  2: {
    0: "Thiên Hình",
    1: "Thanh Long",
    2: "Tư Mệnh",
    3: "Thiên Lao",
    4: "Bạch Hổ",
    5: "Kim Quỹ",
  },
  // 3: Mão (số 04 giờ 5h00-6h59)
  3: {
    0: "Chu Tước",
    1: "Minh Đường",
    2: "Câu Trận",
    3: "Huyền Vũ",
    4: "Ngọc Đường",
    5: "Thiên Đức Hợp",
  },
  // 4: Thìn (số 05 giờ 7h00-8h59)
  4: {
    0: "Kim Quỹ",
    1: "Thiên Hình",
    2: "Thanh Long",
    3: "Tư Mệnh",
    4: "Thiên Lao",
    5: "Bạch Hổ",
  },
  // 5: Tị (số 06 giờ 9h00-10h59)
  5: {
    0: "Thiên Đức Hợp",
    1: "Chu Tước",
    2: "Minh Đường",
    3: "Câu Trận",
    4: "Huyền Vũ",
    5: "Ngọc Đường",
  },
  // 6: Ngọ (số 07 giờ 11h00-12h59)
  6: {
    0: "Bạch Hổ",
    1: "Kim Quỹ",
    2: "Thiên Hình",
    3: "Thanh Long",
    4: "Tư Mệnh",
    5: "Thiên Lao",
  },
  // 7: Mùi (số 08 giờ 13h00-14h59)
  7: {
    0: "Ngọc Đường",
    1: "Thiên Đức Hợp",
    2: "Chu Tước",
    3: "Minh Đường",
    4: "Câu Trận",
    5: "Huyền Vũ",
  },
  // 8: Thân (số 09 giờ 15h00-16h59)
  8: {
    0: "Thiên Lao",
    1: "Bạch Hổ",
    2: "Kim Quỹ",
    3: "Thiên Hình",
    4: "Thanh Long",
    5: "Tư Mệnh",
  },
  // 9: Dậu (số 10 giờ 17h00-18h59)
  9: {
    0: "Huyền Vũ",
    1: "Ngọc Đường",
    2: "Thiên Đức Hợp",
    3: "Chu Tước",
    4: "Minh Đường",
    5: "Câu Trận",
  },
  // 10: Tuất (số 11 giờ 19h00-20h59)
  10: {
    0: "Tư Mệnh",
    1: "Thiên Lao",
    2: "Bạch Hổ",
    3: "Kim Quỹ",
    4: "Thiên Hình",
    5: "Thanh Long",
  },
  // 11: Hợi (số 12 giờ 21h00-22h59)
  11: {
    0: "Chu Tước",
    1: "Minh Đường",
    2: "Câu Trận",
    3: "Huyền Vũ",
    4: "Ngọc Đường",
    5: "Thiên Đức Hợp",
  },
};

/**
 * Chuyển chi của tháng (hoặc tháng Âm lịch 1-12) sang nhóm tháng:
 * Tháng 1, 7 (Dần, Thân) -> 0
 * Tháng 2, 8 (Mão, Dậu) -> 1
 * Tháng 3, 9 (Thìn, Tuất) -> 2
 * Tháng 4, 10 (Tị, Hợi) -> 3
 * Tháng 5, 11 (Ngọ, Tý) -> 4
 * Tháng 6, 12 (Mùi, Sửu) -> 5
 */
export function getMonthGroupIndex(monthChiOrLunarMonth: string | number): MonthGroupIndex {
  if (typeof monthChiOrLunarMonth === "number") {
    // Tháng âm lịch 1..12
    const m = ((monthChiOrLunarMonth - 1) % 12 + 12) % 12 + 1; // 1-12
    if (m === 1 || m === 7) return 0; // Dần, Thân
    if (m === 2 || m === 8) return 1; // Mão, Dậu
    if (m === 3 || m === 9) return 2; // Thìn, Tuất
    if (m === 4 || m === 10) return 3; // Tị, Hợi
    if (m === 5 || m === 11) return 4; // Ngọ, Tý
    return 5; // 6, 12: Mùi, Sửu
  }

  const chiStr = monthChiOrLunarMonth.trim();
  if (chiStr.includes("Dần") || chiStr.includes("Thân")) return 0;
  if (chiStr.includes("Mão") || chiStr.includes("Dậu")) return 1;
  if (chiStr.includes("Thìn") || chiStr.includes("Tuất")) return 2;
  if (chiStr.includes("Tỵ") || chiStr.includes("Tị") || chiStr.includes("Hợi")) return 3;
  if (chiStr.includes("Ngọ") || chiStr.includes("Tý")) return 4;
  return 5; // Mùi, Sửu
}

/**
 * Tra cứu Trực Nhật Tinh theo Chi (của ngày hoặc giờ) và Nhóm Tháng
 */
export function getTrucNhatTinhByBranchAndMonth(
  branchIdx: number,
  monthGroup: MonthGroupIndex
): TrucNhatTinhDetail {
  const normBranchIdx = ((branchIdx % 12) + 12) % 12;
  const starName = TRUC_NHAT_TINH_MATRIX[normBranchIdx]?.[monthGroup] || "Thanh Long";
  return (
    TRUC_NHAT_TINH_INFO_MAP[starName] || {
      name: starName,
      chinese: "",
      mappedGeneral: starName,
      nature: "Hoàng Đạo",
      quality: "Cát",
      color: "from-amber-600 to-yellow-600",
      textColor: "text-amber-300",
      badgeBg: "bg-amber-950/80 text-amber-300 border-amber-600/70",
      element: "Thổ",
      desc: "Trực Nhật Tinh",
    }
  );
}
