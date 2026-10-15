/**
 * Thuật toán tính Lịch Âm - Dương & Can Chi Việt Nam (Múi giờ UTC+7)
 * Dựa trên thuật toán thiên văn tiêu chuẩn của Hồ Ngọc Đức và Lịch Vạn Niên
 */

// Bảng Can Chi cơ bản
export const CAN_NAMES = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
export const CAN_CHINESE = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];

export const CHI_NAMES = [
  "Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ",
  "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"
];
export const CHI_CHINESE = [
  "子", "丑", "寅", "卯", "辰", "巳",
  "午", "未", "申", "酉", "戌", "亥"
];

// 12 Giờ Địa Chi và khung giờ Dương Lịch
export const HOUR_BRANCH_RANGES = [
  { branch: "Tý", range: "23:00 - 00:59", startHour: 23, endHour: 1, desc: "Canh Ba • Giờ Tý ban đêm" },
  { branch: "Sửu", range: "01:00 - 02:59", startHour: 1, endHour: 3, desc: "Canh Bốn • Gà gáy lần đầu" },
  { branch: "Dần", range: "03:00 - 04:59", startHour: 3, endHour: 5, desc: "Canh Năm • Bình minh dần hé" },
  { branch: "Mão", range: "05:00 - 06:59", startHour: 5, endHour: 7, desc: "Mặt trời mọc • Rạng đông" },
  { branch: "Thìn", range: "07:00 - 08:59", startHour: 7, endHour: 9, desc: "Ăn sáng • Rồng vờn mây" },
  { branch: "Tỵ", range: "09:00 - 10:59", startHour: 9, endHour: 11, desc: "Gần trưa • Rắn về hang" },
  { branch: "Ngọ", range: "11:00 - 12:59", startHour: 11, endHour: 13, desc: "Chính ngọ • Dương khí cực thịnh" },
  { branch: "Mùi", range: "13:00 - 14:59", startHour: 13, endHour: 15, desc: "Đầu giờ chiều • Mặt trời chếch bóng" },
  { branch: "Thân", range: "15:00 - 16:59", startHour: 15, endHour: 17, desc: "Xế chiều • Khỉ hú rừng sâu" },
  { branch: "Dậu", range: "17:00 - 18:59", startHour: 17, endHour: 19, desc: "Hoàng hôn • Gà lên chuồng" },
  { branch: "Tuất", range: "19:00 - 20:59", startHour: 19, endHour: 21, desc: "Canh Một • Chó giữ cửa" },
  { branch: "Hợi", range: "21:00 - 22:59", startHour: 21, endHour: 23, desc: "Canh Hai • Đêm thanh vắng" },
];

// 12 Thiên Tướng Lục Nhâm (Trực Nhật Tinh)
export const TRUC_NHAT_TINH_LIST = [
  { id: 0, name: "Quý Nhân", chinese: "貴人", nature: "Đại Cát", element: "Thổ", color: "text-amber-400 bg-amber-950/80 border-amber-600/70", desc: "Chủ soái 12 Thiên Tướng, cứu khốn phù nguy, vạn sự hóa cát" },
  { id: 1, name: "Đằng Xà", chinese: "騰蛇", nature: "Hung", element: "Hỏa", color: "text-rose-400 bg-rose-950/70 border-rose-700/60", desc: "Chủ kinh sợ, quái dị, ác mộng, tráo trở, lo âu" },
  { id: 2, name: "Chu Tước", chinese: "朱雀", nature: "Thứ Cát", element: "Hỏa", color: "text-orange-400 bg-orange-950/70 border-orange-700/60", desc: "Chủ văn thư, thanh danh, tin tức; phòng khẩu thiệt thị phi" },
  { id: 3, name: "Lục Hợp", chinese: "六合", nature: "Cát", element: "Mộc", color: "text-emerald-400 bg-emerald-950/70 border-emerald-700/60", desc: "Chủ hôn nhân, giao dịch, hợp tác, quý nhân tương trợ" },
  { id: 4, name: "Câu Trần", chinese: "勾陳", nature: "Hung", element: "Thổ", color: "text-amber-500 bg-amber-950/70 border-amber-800/60", desc: "Chủ tranh chấp điền sản, kiện tụng câu lưu, giam cầm chậm trễ" },
  { id: 5, name: "Thanh Long", chinese: "青龍", nature: "Đại Cát", element: "Mộc", color: "text-teal-300 bg-teal-950/90 border-teal-600/80", desc: "Chủ tài lộc, vinh hoa, tiền của, sinh quý tử, xuất hành" },
  { id: 6, name: "Thiên Không", chinese: "天空", nature: "Hung", element: "Thổ", color: "text-zinc-400 bg-zinc-950/70 border-zinc-700/60", desc: "Chủ dối trá, lời hứa suông, hao tài, tu tâm tín ngưỡng" },
  { id: 7, name: "Bạch Hổ", chinese: "白虎", nature: "Đại Hung", element: "Kim", color: "text-rose-500 bg-rose-950/90 border-rose-600/80", desc: "Chủ hình thương, đổ máu, tang chế, bệnh hiểm, tai họa" },
  { id: 8, name: "Thái Thường", chinese: "太常", nature: "Cát", element: "Thổ", color: "text-yellow-400 bg-yellow-950/70 border-yellow-700/60", desc: "Chủ yến tiệc, y phục, lụa là, quà tặng, ân điển ban thưởng" },
  { id: 9, name: "Huyền Vũ", chinese: "玄武", nature: "Hung", element: "Thủy", color: "text-blue-400 bg-blue-950/70 border-blue-800/60", desc: "Chủ mất trộm, gian tà, tiểu nhân hãm hại, dâm ô thất thoát" },
  { id: 10, name: "Thái Âm", chinese: "太陰", nature: "Cát", element: "Kim", color: "text-slate-300 bg-slate-900/80 border-slate-600/70", desc: "Chủ mưu kín, âm đức che chở, phụ nữ đoan chính tương trợ" },
  { id: 11, name: "Thiên Hậu", chinese: "天后", nature: "Cát", element: "Thủy", color: "text-cyan-300 bg-cyan-950/80 border-cyan-700/70", desc: "Chủ ân trạch, bao dung, thê thiếp hiền lương, gia đạo an vui" },
];

// Nhị Thập Bát Tú (28 Tinh Tú)
export const NHI_THAP_BAT_TU = [
  { name: "Giác", animal: "Mộc Giao", nature: "Cát", group: "Đông Phương Thanh Long" },
  { name: "Cang", animal: "Kim Long", nature: "Hung", group: "Đông Phương Thanh Long" },
  { name: "Đê", animal: "Thổ Lạc", nature: "Hung", group: "Đông Phương Thanh Long" },
  { name: "Phòng", animal: "Nhật Thố", nature: "Cát", group: "Đông Phương Thanh Long" },
  { name: "Tâm", animal: "Nguyệt Hồ", nature: "Hung", group: "Đông Phương Thanh Long" },
  { name: "Vĩ", animal: "Hỏa Hổ", nature: "Cát", group: "Đông Phương Thanh Long" },
  { name: "Cơ", animal: "Thủy Báo", nature: "Cát", group: "Đông Phương Thanh Long" },
  { name: "Đẩu", animal: "Mộc Giải", nature: "Cát", group: "Bắc Phương Huyền Vũ" },
  { name: "Ngưu", animal: "Kim Ngưu", nature: "Hung", group: "Bắc Phương Huyền Vũ" },
  { name: "Nữ", animal: "Thổ Bức", nature: "Hung", group: "Bắc Phương Huyền Vũ" },
  { name: "Hư", animal: "Nhật Thử", nature: "Hung", group: "Bắc Phương Huyền Vũ" },
  { name: "Nguy", animal: "Nguyệt Yến", nature: "Hung", group: "Bắc Phương Huyền Vũ" },
  { name: "Thất", animal: "Hỏa Trư", nature: "Cát", group: "Bắc Phương Huyền Vũ" },
  { name: "Bích", animal: "Thủy Du", nature: "Cát", group: "Bắc Phương Huyền Vũ" },
  { name: "Khuê", animal: "Mộc Lang", nature: "Hung", group: "Tây Phương Bạch Hổ" },
  { name: "Lâu", animal: "Kim Cẩu", nature: "Cát", group: "Tây Phương Bạch Hổ" },
  { name: "Vị", animal: "Thổ Trĩ", nature: "Cát", group: "Tây Phương Bạch Hổ" },
  { name: "Mão", animal: "Nhật Kê", nature: "Hung", group: "Tây Phương Bạch Hổ" },
  { name: "Tất", animal: "Nguyệt Ô", nature: "Cát", group: "Tây Phương Bạch Hổ" },
  { name: "Chủy", animal: "Hỏa Hầu", nature: "Hung", group: "Tây Phương Bạch Hổ" },
  { name: "Sâm", animal: "Thủy Viên", nature: "Cát", group: "Tây Phương Bạch Hổ" },
  { name: "Tỉnh", animal: "Mộc Hãn", nature: "Cát", group: "Nam Phương Chu Tước" },
  { name: "Quỷ", animal: "Kim Dương", nature: "Hung", group: "Nam Phương Chu Tước" },
  { name: "Liễu", animal: "Thổ Chương", nature: "Hung", group: "Nam Phương Chu Tước" },
  { name: "Tinh", animal: "Nhật Mã", nature: "Hung", group: "Nam Phương Chu Tước" },
  { name: "Trương", animal: "Nguyệt Lộc", nature: "Cát", group: "Nam Phương Chu Tước" },
  { name: "Dực", animal: "Hỏa Xà", nature: "Hung", group: "Nam Phương Chu Tước" },
  { name: "Chẩn", animal: "Thủy Dẫn", nature: "Cát", group: "Nam Phương Chu Tước" },
];

// 12 Trực (Kiến, Trừ, Mãn, Bình, Định, Chấp, Phá, Nguy, Thành, Thâu, Khai, Bế)
export const MUOI_HAI_TRUC = [
  { name: "Kiến", nature: "Bình", desc: "Khởi đầu, xuất hành, nhận chức, giá thú" },
  { name: "Trừ", nature: "Cát", desc: "Trừ phục, tắm gội, trị bệnh, xua tà khí" },
  { name: "Mãn", nature: "Cát", desc: "Lễ tế, cầu phúc, nhập kho, no đủ sung túc" },
  { name: "Bình", nature: "Bình", desc: "Hòa giải, đắp đập, tu sửa đường xá" },
  { name: "Định", nature: "Cát", desc: "Đính hôn, ký kết, trồng trọt, định an cư" },
  { name: "Chấp", nature: "Bình", desc: "Bắt giữ đạo tặc, đào giếng, giữ nếp nhà" },
  { name: "Phá", nature: "Hung", desc: "Phá dỡ nhà cũ, chữa bệnh; tránh việc lớn" },
  { name: "Nguy", nature: "Hung", desc: "Leo trèo nguy hiểm; cẩn trọng phòng ngừa" },
  { name: "Thành", nature: "Đại Cát", desc: "Mọi việc thành tựu, khai trương, thành hôn" },
  { name: "Thâu", nature: "Cát", desc: "Thu hoạch mùa màng, thâu tiền tài của cải" },
  { name: "Khai", nature: "Đại Cát", desc: "Khai trương, nhập học, mở cửa, kết hôn" },
  { name: "Bế", nature: "Hung", desc: "Đắp đê, lấp hố, chôn cất; kiêng khai trương" },
];

/**
 * Tính số ngày Julius (JDN) chuẩn xác
 */
export function getJulianDay(year: number, month: number, day: number): number {
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
 * Tính Can Chi của Ngày từ JDN
 */
export function getDayCanChi(jdn: number): {
  can: string;
  chi: string;
  chineseCan: string;
  chineseChi: string;
  fullName: string;
  canIdx: number;
  chiIdx: number;
} {
  const canIdx = ((jdn + 9) % 10 + 10) % 10;
  const chiIdx = ((jdn + 1) % 12 + 12) % 12;
  return {
    can: CAN_NAMES[canIdx],
    chi: CHI_NAMES[chiIdx],
    chineseCan: CAN_CHINESE[canIdx],
    chineseChi: CHI_CHINESE[chiIdx],
    fullName: `${CAN_NAMES[canIdx]} ${CHI_NAMES[chiIdx]}`,
    canIdx,
    chiIdx,
  };
}

/**
 * Tính Can Chi của Giờ theo Ngũ Thử Độn (Dựa vào Can của Ngày)
 * Giáp Kỷ -> Giáp Tý (0)
 * Ất Canh -> Bính Tý (2)
 * Bính Tân -> Mậu Tý (4)
 * Đinh Nhâm -> Canh Tý (6)
 * Mậu Quý -> Nhâm Tý (8)
 */
export function getHourCanChi(dayCanIdx: number, hourChiIdx: number): {
  can: string;
  chi: string;
  fullName: string;
  canIdx: number;
  chiIdx: number;
} {
  const baseCan = (dayCanIdx % 5) * 2;
  const hourCanIdx = (baseCan + hourChiIdx) % 10;
  return {
    can: CAN_NAMES[hourCanIdx],
    chi: CHI_NAMES[hourChiIdx],
    fullName: `${CAN_NAMES[hourCanIdx]} ${CHI_NAMES[hourChiIdx]}`,
    canIdx: hourCanIdx,
    chiIdx: hourChiIdx,
  };
}

/**
 * Chuyển đổi Dương Lịch sang Âm Lịch (Thuật toán chuẩn Hồ Ngọc Đức múi giờ UTC+7)
 */
function INT(d: number): number {
  return Math.floor(d);
}

function jdFromDate(dd: number, mm: number, yy: number): number {
  return getJulianDay(yy, mm, dd);
}

function getNewMoonDay(k: number, timeZone = 7): number {
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const dr = Math.PI / 180;
  let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  Jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
  let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
  C1 -= 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(2 * dr * Mpr);
  C1 -= 0.0004 * Math.sin(3 * dr * Mpr);
  C1 += 0.0104 * Math.sin(2 * dr * F) - 0.0051 * Math.sin((M + Mpr) * dr);
  C1 -= 0.0074 * Math.sin((M - Mpr) * dr) + 0.0004 * Math.sin((2 * F + M) * dr);
  C1 -= 0.0004 * Math.sin((2 * F - M) * dr) - 0.0006 * Math.sin((2 * F + Mpr) * dr);
  C1 += 0.001 * Math.sin((2 * F - Mpr) * dr) + 0.0005 * Math.sin((2 * Mpr + M) * dr);
  const JdNew = Jd1 + C1;
  return INT(JdNew + 0.5 + timeZone / 24);
}

function getSunLongitude(jdn: number, timeZone = 7): number {
  const T = (jdn - 2451545.0 + 0.5 - timeZone / 24) / 36525;
  const T2 = T * T;
  const dr = Math.PI / 180;
  const M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  let DL = (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(M * dr);
  DL += (0.019993 - 0.000101 * T) * Math.sin(2 * M * dr) + 0.00029 * Math.sin(3 * M * dr);
  let L = (L0 + DL) % 360;
  if (L < 0) L += 360;
  return INT(L / 30);
}

export interface LunarDate {
  day: number;
  month: number;
  year: number;
  isLeap: boolean;
  canYear: string;
  chiYear: string;
  yearFullName: string;
  canMonth: string;
  chiMonth: string;
  monthFullName: string;
}

export function convertSolarToLunar(dd: number, mm: number, yy: number, timeZone = 7): LunarDate {
  const dayNumber = jdFromDate(dd, mm, yy);
  const k = INT((dayNumber - 2415021.0769986) / 29.530588853);
  let monthStart = getNewMoonDay(k + 1, timeZone);
  if (monthStart > dayNumber) {
    monthStart = getNewMoonDay(k, timeZone);
  }
  let a11 = getNewMoonDay(INT((jdFromDate(31, 12, yy) - 2415021.0769986) / 29.530588853), timeZone);
  let b11 = a11;
  if (getSunLongitude(a11, timeZone) >= 9) {
    b11 = getNewMoonDay(INT((jdFromDate(31, 12, yy) - 2415021.0769986) / 29.530588853) - 1, timeZone);
  }
  let lunarDay = dayNumber - monthStart + 1;
  let diff = INT((monthStart - b11) / 29);
  let lunarMonth = diff + 11;
  let isLeap = false;
  let lunarYear = yy;
  if (lunarMonth > 12) {
    lunarMonth -= 12;
  }
  if (lunarMonth >= 11 && diff < 4) {
    lunarYear = yy - 1;
  }

  // Tinh Can Chi Nam & Thang
  const canYearIdx = (lunarYear + 6) % 10;
  const chiYearIdx = (lunarYear + 8) % 12;
  const canYear = CAN_NAMES[canYearIdx];
  const chiYear = CHI_NAMES[chiYearIdx];

  const monthChiIdx = (lunarMonth + 1) % 12; // Tháng 1 là Dần (index 2)
  const baseMonthCan = ((canYearIdx % 5) * 2 + 2) % 10;
  const monthCanIdx = (baseMonthCan + (lunarMonth - 1)) % 10;
  const canMonth = CAN_NAMES[monthCanIdx];
  const chiMonth = CHI_NAMES[monthChiIdx];

  return {
    day: lunarDay,
    month: lunarMonth,
    year: lunarYear,
    isLeap,
    canYear,
    chiYear,
    yearFullName: `${canYear} ${chiYear}`,
    canMonth,
    chiMonth,
    monthFullName: `${canMonth} ${chiMonth}`,
  };
}

/**
 * Lấy Trực Nhật Tinh (12 Thiên Tướng Lục Nhâm) của một ngày
 * Tuần hoàn theo chu kỳ liên tục 12 ngày (khởi chuẩn mực theo JDN)
 */
export function getTrucNhatTinh(jdn: number): typeof TRUC_NHAT_TINH_LIST[0] {
  // Đồng bộ chu kỳ 12 Thiên Tướng
  const starIdx = ((jdn - 1) % 12 + 12) % 12;
  return TRUC_NHAT_TINH_LIST[starIdx];
}

/**
 * Lấy Nhị Thập Bát Tú (28 Tinh Tú) của một ngày
 */
export function getNhiThapBatTu(jdn: number): typeof NHI_THAP_BAT_TU[0] {
  const idx = ((jdn + 21) % 28 + 28) % 28;
  return NHI_THAP_BAT_TU[idx];
}

/**
 * Lấy 12 Trực (Kiến, Trừ, Mãn, Bình, Định, Chấp, Phá, Nguy, Thành, Thâu, Khai, Bế)
 * Chi của tháng trùng với Chi của ngày thì là Trực Kiến
 */
export function getTrucOfDay(lunarMonth: number, dayChiIdx: number): typeof MUOI_HAI_TRUC[0] {
  const monthChiIdx = (lunarMonth + 1) % 12; // Tháng 1 ÂL = Dần (2)
  const offset = ((dayChiIdx - monthChiIdx) % 12 + 12) % 12;
  return MUOI_HAI_TRUC[offset];
}
