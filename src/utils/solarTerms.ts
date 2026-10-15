/**
 * Thuật toán Thiên văn Tính toán 24 Tiết Khí, Nguyệt Tướng Lục Nhâm & Bát Tự Tứ Trụ
 * Múi giờ chuẩn Việt Nam (UTC+7, Kinh độ 105°E)
 * Dựa trên thuật toán kinh độ hoàng đạo mặt trời chính xác cao
 */

import { CAN_NAMES, CHI_NAMES, CAN_CHINESE, CHI_CHINESE, getJulianDay, getDayCanChi, getHourCanChi } from "./lunarCalendar";

export interface SolarTermRecord {
  id: number;
  name: string;
  chinese: string;
  deg: number; // Kinh độ hoàng đạo (0..360)
  solarMonth: number; // Tháng dương lịch thông thường (1..12)
  approxDay: number; // Ngày xấp xỉ ban đầu để dò nhị phân
  isMajor: boolean; // true: Tiết khí chính (bắt đầu tháng Can Chi), false: Trung khí (chuyển Nguyệt Tướng)
  nguyetTuongBranch?: string; // Cung chi Nguyệt Tướng (đối với Trung Khí)
  nguyetTuongName?: string; // Tên Nguyệt Tướng Lục Nhâm (đối với Trung Khí)
  startMonthBranch?: string; // Chi tháng khởi đầu (đối với Tiết khí chính)
  desc: string;
}

export const SOLAR_TERMS_24: SolarTermRecord[] = [
  { id: 0, name: "Xuân Phân", chinese: "春分", deg: 0, solarMonth: 3, approxDay: 20, isMajor: false, nguyetTuongBranch: "Tuất", nguyetTuongName: "Hà Khôi", desc: "Mặt trời qua xích đạo, ngày đêm bằng nhau • Đổi Nguyệt Tướng Tuất (Hà Khôi)" },
  { id: 1, name: "Thanh Minh", chinese: "清明", deg: 15, solarMonth: 4, approxDay: 4, isMajor: true, startMonthBranch: "Thìn", desc: "Khí trời trong sáng thanh khiết • Bắt đầu tháng Bát Tự Thìn" },
  { id: 2, name: "Cốc Vũ", chinese: "穀雨", deg: 30, solarMonth: 4, approxDay: 20, isMajor: false, nguyetTuongBranch: "Dậu", nguyetTuongName: "Tòng Khôi", desc: "Mưa rào sinh ngũ cốc • Đổi Nguyệt Tướng Dậu (Tòng Khôi)" },
  { id: 3, name: "Lập Hạ", chinese: "立夏", deg: 45, solarMonth: 5, approxDay: 5, isMajor: true, startMonthBranch: "Tỵ", desc: "Bắt đầu mùa hè, vạn vật tươi tốt • Bắt đầu tháng Bát Tự Tỵ" },
  { id: 4, name: "Tiểu Mãn", chinese: "小滿", deg: 60, solarMonth: 5, approxDay: 21, isMajor: false, nguyetTuongBranch: "Thân", nguyetTuongName: "Truyền Tống", desc: "Hạt lúa bắt đầu chắc mẩy • Đổi Nguyệt Tướng Thân (Truyền Tống)" },
  { id: 5, name: "Mang Chủng", chinese: "芒種", deg: 75, solarMonth: 6, approxDay: 5, isMajor: true, startMonthBranch: "Ngọ", desc: "Gieo trồng ngũ cốc có râu • Bắt đầu tháng Bát Tự Ngọ" },
  { id: 6, name: "Hạ Chí", chinese: "夏至", deg: 90, solarMonth: 6, approxDay: 21, isMajor: false, nguyetTuongBranch: "Mùi", nguyetTuongName: "Tiểu Cát", desc: "Ngày dài nhất năm, dương khí cực thịnh • Đổi Nguyệt Tướng Mùi (Tiểu Cát)" },
  { id: 7, name: "Tiểu Thử", chinese: "小暑", deg: 105, solarMonth: 7, approxDay: 7, isMajor: true, startMonthBranch: "Mùi", desc: "Nắng nóng oi ả bắt đầu • Bắt đầu tháng Bát Tự Mùi" },
  { id: 8, name: "Đại Thử", chinese: "大暑", deg: 120, solarMonth: 7, approxDay: 22, isMajor: false, nguyetTuongBranch: "Ngọ", nguyetTuongName: "Thắng Quang", desc: "Nắng nóng đỉnh điểm trong năm • Đổi Nguyệt Tướng Ngọ (Thắng Quang)" },
  { id: 9, name: "Lập Thu", chinese: "立秋", deg: 135, solarMonth: 8, approxDay: 7, isMajor: true, startMonthBranch: "Thân", desc: "Bắt đầu mùa thu mát mẻ • Bắt đầu tháng Bát Tự Thân" },
  { id: 10, name: "Xử Thử", chinese: "處暑", deg: 150, solarMonth: 8, approxDay: 23, isMajor: false, nguyetTuongBranch: "Tỵ", nguyetTuongName: "Thái Ất", desc: "Nắng nóng lui dần, hơi thu lan tỏa • Đổi Nguyệt Tướng Tỵ (Thái Ất)" },
  { id: 11, name: "Bạch Lộ", chinese: "白露", deg: 165, solarMonth: 9, approxDay: 7, isMajor: true, startMonthBranch: "Dậu", desc: "Sương trắng đọng sáng sớm • Bắt đầu tháng Bát Tự Dậu" },
  { id: 12, name: "Thu Phân", chinese: "秋分", deg: 180, solarMonth: 9, approxDay: 23, isMajor: false, nguyetTuongBranch: "Thìn", nguyetTuongName: "Thiên Cương", desc: "Ngày đêm bằng nhau giữa thu • Đổi Nguyệt Tướng Thìn (Thiên Cương)" },
  { id: 13, name: "Hàn Lộ", chinese: "寒露", deg: 195, solarMonth: 10, approxDay: 8, isMajor: true, startMonthBranch: "Tuất", desc: "Sương bắt đầu lạnh giá buốt • Bắt đầu tháng Bát Tự Tuất" },
  { id: 14, name: "Sương Giáng", chinese: "霜降", deg: 210, solarMonth: 10, approxDay: 23, isMajor: false, nguyetTuongBranch: "Mão", nguyetTuongName: "Thái Xung", desc: "Sương muối bắt đầu rơi đọng • Đổi Nguyệt Tướng Mão (Thái Xung)" },
  { id: 15, name: "Lập Đông", chinese: "立冬", deg: 225, solarMonth: 11, approxDay: 7, isMajor: true, startMonthBranch: "Hợi", desc: "Bắt đầu mùa đông giá lạnh • Bắt đầu tháng Bát Tự Hợi" },
  { id: 16, name: "Tiểu Tuyết", chinese: "小雪", deg: 240, solarMonth: 11, approxDay: 22, isMajor: false, nguyetTuongBranch: "Dần", nguyetTuongName: "Công Tào", desc: "Tuyết nhỏ chớm rơi vùng cao • Đổi Nguyệt Tướng Dần (Công Tào)" },
  { id: 17, name: "Đại Tuyết", chinese: "大雪", deg: 255, solarMonth: 12, approxDay: 7, isMajor: true, startMonthBranch: "Tý", desc: "Tuyết rơi nhiều tích tụ • Bắt đầu tháng Bát Tự Tý" },
  { id: 18, name: "Đông Chí", chinese: "冬至", deg: 270, solarMonth: 12, approxDay: 21, isMajor: false, nguyetTuongBranch: "Sửu", nguyetTuongName: "Đại Cát", desc: "Đêm dài nhất năm, nhất dương phục sinh • Đổi Nguyệt Tướng Sửu (Đại Cát)" },
  { id: 19, name: "Tiểu Hàn", chinese: "小寒", deg: 285, solarMonth: 1, approxDay: 5, isMajor: true, startMonthBranch: "Sửu", desc: "Rét nhẹ chớm mùa đông giá • Bắt đầu tháng Bát Tự Sửu" },
  { id: 20, name: "Đại Hàn", chinese: "大寒", deg: 300, solarMonth: 1, approxDay: 20, isMajor: false, nguyetTuongBranch: "Tý", nguyetTuongName: "Thần Hậu", desc: "Rét buốt khắc nghiệt nhất đông • Đổi Nguyệt Tướng Tý (Thần Hậu)" },
  { id: 21, name: "Lập Xuân", chinese: "立春", deg: 315, solarMonth: 2, approxDay: 4, isMajor: true, startMonthBranch: "Dần", desc: "Khởi đầu mùa xuân & năm mới Can Chi • Bắt đầu tháng Bát Tự Dần" },
  { id: 22, name: "Vũ Thủy", chinese: "雨水", deg: 330, solarMonth: 2, approxDay: 19, isMajor: false, nguyetTuongBranch: "Hợi", nguyetTuongName: "Đăng Minh", desc: "Mưa xuân ấm áp thấm nhuần vạn vật • Đổi Nguyệt Tướng Hợi (Đăng Minh)" },
  { id: 23, name: "Kinh Trập", chinese: "驚蟄", deg: 345, solarMonth: 3, approxDay: 5, isMajor: true, startMonthBranch: "Mão", desc: "Sấm mùa xuân đánh thức vạn vật • Bắt đầu tháng Bát Tự Mão" },
];

/**
 * Tính kinh độ hoàng đạo thực của mặt trời tại Julian Date (UTC)
 */
export function getExactSunLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const T2 = T * T;
  const dr = Math.PI / 180;
  const M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  let DL = (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(M * dr);
  DL += (0.019993 - 0.000101 * T) * Math.sin(2 * M * dr) + 0.00029 * Math.sin(3 * M * dr);
  let L = (L0 + DL) % 360;
  if (L < 0) L += 360;
  return L;
}

/**
 * Chuyển đổi JD sang ngày giờ phút theo múi giờ Việt Nam (UTC+7)
 */
export function jdToVietnamDate(jd: number): {
  year: number;
  month: number;
  day: number;
  hours: number;
  minutes: number;
  formatted: string;
  timeString: string;
} {
  const z = Math.floor(jd + 0.5 + 7 / 24);
  const f = jd + 0.5 + 7 / 24 - z;
  let alpha = Math.floor((z - 1867216.25) / 36524.25);
  let a = z + 1 + alpha - Math.floor(alpha / 4);
  let b = a + 1524;
  let c = Math.floor((b - 122.1) / 365.25);
  let d = Math.floor(365.25 * c);
  let e = Math.floor((b - d) / 30.6001);
  let day = b - d - Math.floor(30.6001 * e);
  let month = e < 14 ? e - 1 : e - 13;
  let year = month > 2 ? c - 4716 : c - 4715;
  let totalHours = f * 24;
  let hours = Math.floor(totalHours);
  let minutes = Math.floor((totalHours - hours) * 60);

  const hhStr = hours.toString().padStart(2, "0");
  const mmStr = minutes.toString().padStart(2, "0");
  const timeString = `${hhStr}:${mmStr}`;
  const formatted = `${timeString} ngày ${day}/${month}/${year}`;

  return { year, month, day, hours, minutes, formatted, timeString };
}

/**
 * Tìm JD chính xác khi kinh độ mặt trời đạt targetDeg
 */
export function findSolarTermJD(year: number, month: number, approxDay: number, targetDeg: number): number {
  const approxJD = getJulianDay(year, month, approxDay) - 0.5 + 5 / 24; // 12h trưa UTC+7
  let low = approxJD - 2.5;
  let high = approxJD + 2.5;
  for (let i = 0; i < 40; i++) {
    let mid = (low + high) / 2;
    let l = getExactSunLongitude(mid);
    let diff = ((l - targetDeg + 540) % 360) - 180;
    if (diff > 0) high = mid;
    else low = mid;
  }
  return (low + high) / 2;
}

export interface TransitionSolarTerm {
  record: SolarTermRecord;
  jd: number;
  time: {
    year: number;
    month: number;
    day: number;
    hours: number;
    minutes: number;
    formatted: string;
    timeString: string;
  };
}

export interface MonthSolarTermsInfo {
  year: number;
  month: number;
  terms: TransitionSolarTerm[];
}

/**
 * Lấy 2 tiết khí trong 1 tháng Dương lịch cụ thể
 */
export function getSolarTermsForMonth(year: number, month: number): MonthSolarTermsInfo {
  // Tìm các tiết khí tương ứng với tháng dương lịch
  const monthTerms = SOLAR_TERMS_24.filter((t) => t.solarMonth === month);
  const terms: TransitionSolarTerm[] = monthTerms.map((term) => {
    const jd = findSolarTermJD(year, month, term.approxDay, term.deg);
    const time = jdToVietnamDate(jd);
    return { record: term, jd, time };
  });

  // Sắp xếp theo thứ tự thời gian xảy ra trong tháng
  terms.sort((a, b) => a.jd - b.jd);

  return { year, month, terms };
}

/**
 * Lấy Tiết Khí 3 Tháng liên tiếp: Tháng Trước, Tháng Hiện Tại, Tháng Sau
 */
export function getThreeMonthsSolarTerms(year: number, month: number): {
  prevMonth: MonthSolarTermsInfo;
  currentMonth: MonthSolarTermsInfo;
  nextMonth: MonthSolarTermsInfo;
} {
  const prevYear = month === 1 ? year - 1 : year;
  const prevMonth = month === 1 ? 12 : month - 1;

  const nextYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;

  return {
    prevMonth: getSolarTermsForMonth(prevYear, prevMonth),
    currentMonth: getSolarTermsForMonth(year, month),
    nextMonth: getSolarTermsForMonth(nextYear, nextMonth),
  };
}

/**
 * Bảng 60 Hoa Giáp Nạp Âm Ngũ Hành
 */
export const SIXTY_JIAZI_NAP_AM: Record<string, { napAm: string; element: string; desc: string }> = {
  "Giáp Tý": { napAm: "Hải Trung Kim", element: "Kim", desc: "Vàng trong lòng biển sâu, khí tàng ẩn chưa gặp hỏa luyện" },
  "Ất Sửu": { napAm: "Hải Trung Kim", element: "Kim", desc: "Vàng trong lòng biển sâu, khí tàng ẩn chưa gặp hỏa luyện" },
  "Bính Dần": { napAm: "Lư Trung Hỏa", element: "Hỏa", desc: "Lửa trong lò rực sáng, dung hòa vạn vật sinh khí dồi dào" },
  "Đinh Mão": { napAm: "Lư Trung Hỏa", element: "Hỏa", desc: "Lửa trong lò rực sáng, dung hòa vạn vật sinh khí dồi dào" },
  "Mậu Thìn": { napAm: "Đại Lâm Mộc", element: "Mộc", desc: "Cây rừng rậm rạp vươn cao, che chở muôn loài um tùm xanh tốt" },
  "Kỷ Tỵ": { napAm: "Đại Lâm Mộc", element: "Mộc", desc: "Cây rừng rậm rạp vươn cao, che chở muôn loài um tùm xanh tốt" },
  "Canh Ngọ": { napAm: "Lộ Bàng Thổ", element: "Thổ", desc: "Đất ven đường đi, tải nạp vạn vật trải rộng bao la" },
  "Tân Mùi": { napAm: "Lộ Bàng Thổ", element: "Thổ", desc: "Đất ven đường đi, tải nạp vạn vật trải rộng bao la" },
  "Nhâm Thân": { napAm: "Kiếm Phong Kim", element: "Kim", desc: "Vàng mũi kiếm sắc bén rèn từ sương tuyết, khí phách phi phàm" },
  "Quý Dậu": { napAm: "Kiếm Phong Kim", element: "Kim", desc: "Vàng mũi kiếm sắc bén rèn từ sương tuyết, khí phách phi phàm" },
  "Giáp Tuất": { napAm: "Sơn Đầu Hỏa", element: "Hỏa", desc: "Lửa trên đỉnh núi cao, ánh sáng rực rỡ chiếu rọi bầu trời" },
  "Ất Hợi": { napAm: "Sơn Đầu Hỏa", element: "Hỏa", desc: "Lửa trên đỉnh núi cao, ánh sáng rực rỡ chiếu rọi bầu trời" },
  "Bính Tý": { napAm: "Giản Hạ Thủy", element: "Thủy", desc: "Nước khe suối trong lành, len lỏi mát rượi tàng tụ linh khí" },
  "Đinh Sửu": { napAm: "Giản Hạ Thủy", element: "Thủy", desc: "Nước khe suối trong lành, len lỏi mát rượi tàng tụ linh khí" },
  "Mậu Dần": { napAm: "Thành Đầu Thổ", element: "Thổ", desc: "Đất bờ thành vững chãi, che chắn đắp lũy bình yên cương vực" },
  "Kỷ Mão": { napAm: "Thành Đầu Thổ", element: "Thổ", desc: "Đất bờ thành vững chãi, che chắn đắp lũy bình yên cương vực" },
  "Canh Thìn": { napAm: "Bạch Chá Kim", element: "Kim", desc: "Vàng sáp trắng thanh nhã, ngọc ngà mỹ nghệ quý phái" },
  "Tân Tỵ": { napAm: "Bạch Chá Kim", element: "Kim", desc: "Vàng sáp trắng thanh nhã, ngọc ngà mỹ nghệ quý phái" },
  "Nhâm Ngọ": { napAm: "Dương Liễu Mộc", element: "Mộc", desc: "Cây dương liễu mềm mại thướt tha, uyển chuyển thích ứng" },
  "Quý Mùi": { napAm: "Dương Liễu Mộc", element: "Mộc", desc: "Cây dương liễu mềm mại thướt tha, uyển chuyển thích ứng" },
  "Giáp Thân": { napAm: "Tuyền Trung Thủy", element: "Thủy", desc: "Nước trong giếng sâu ngọt lành, bất tận không bao giờ cạn" },
  "Ất Dậu": { napAm: "Tuyền Trung Thủy", element: "Thủy", desc: "Nước trong giếng sâu ngọt lành, bất tận không bao giờ cạn" },
  "Bính Tuất": { napAm: "Ốc Thượng Thổ", element: "Thổ", desc: "Đất ngói trên nóc nhà, che mưa chắn gió tạo phúc mái ấm" },
  "Đinh Hợi": { napAm: "Ốc Thượng Thổ", element: "Thổ", desc: "Đất ngói trên nóc nhà, che mưa chắn gió tạo phúc mái ấm" },
  "Mậu Tý": { napAm: "Tích Lịch Hỏa", element: "Hỏa", desc: "Lửa sấm sét chớp giật kinh thiên động địa, dũng mãnh thần tốc" },
  "Kỷ Sửu": { napAm: "Tích Lịch Hỏa", element: "Hỏa", desc: "Lửa sấm sét chớp giật kinh thiên động địa, dũng mãnh thần tốc" },
  "Canh Dần": { napAm: "Tùng Bách Mộc", element: "Mộc", desc: "Cây tùng bách xanh tươi bốn mùa, kiên cường qua sương gió" },
  "Tân Mão": { napAm: "Tùng Bách Mộc", element: "Mộc", desc: "Cây tùng bách xanh tươi bốn mùa, kiên cường qua sương gió" },
  "Nhâm Thìn": { napAm: "Trường Lưu Thủy", element: "Thủy", desc: "Nước sông dài chảy mãi về biển lớn, miên viễn không ngừng" },
  "Quý Tỵ": { napAm: "Trường Lưu Thủy", element: "Thủy", desc: "Nước sông dài chảy mãi về biển lớn, miên viễn không ngừng" },
  "Giáp Ngọ": { napAm: "Sa Trung Kim", element: "Kim", desc: "Vàng lẫn trong cát quặng, cần gạn lọc đãi cát tìm vàng quý giá" },
  "Ất Mùi": { napAm: "Sa Trung Kim", element: "Kim", desc: "Vàng lẫn trong cát quặng, cần gạn lọc đãi cát tìm vàng quý giá" },
  "Bính Thân": { napAm: "Sơn Hạ Hỏa", element: "Hỏa", desc: "Lửa dưới chân núi bình dị, ánh lửa ấm cúng gia đình sum vầy" },
  "Đinh Dậu": { napAm: "Sơn Hạ Hỏa", element: "Hỏa", desc: "Lửa dưới chân núi bình dị, ánh lửa ấm cúng gia đình sum vầy" },
  "Mậu Tuất": { napAm: "Bình Địa Mộc", element: "Mộc", desc: "Cây trên đồng bằng đón nắng ấm, cành lá sum suê đâm chồi" },
  "Kỷ Hợi": { napAm: "Bình Địa Mộc", element: "Mộc", desc: "Cây trên đồng bằng đón nắng ấm, cành lá sum suê đâm chồi" },
  "Canh Tý": { napAm: "Bích Thượng Thổ", element: "Thổ", desc: "Đất tường vách che chắn tổ ấm, giữ gìn phong thủy bình yên" },
  "Tân Sửu": { napAm: "Bích Thượng Thổ", element: "Thổ", desc: "Đất tường vách che chắn tổ ấm, giữ gìn phong thủy bình yên" },
  "Nhâm Dần": { napAm: "Kim Bạc Kim", element: "Kim", desc: "Vàng lá dát mỏng quý phái, trang hoàng tượng thần lộng lẫy" },
  "Quý Mão": { napAm: "Kim Bạc Kim", element: "Kim", desc: "Vàng lá dát mỏng quý phái, trang hoàng tượng thần lộng lẫy" },
  "Giáp Thìn": { napAm: "Phúc Đăng Hỏa", element: "Hỏa", desc: "Lửa đèn dầu ấm áp tỏa sáng thư phòng, dẫn lối trong đêm tối" },
  "Ất Tỵ": { napAm: "Phúc Đăng Hỏa", element: "Hỏa", desc: "Lửa đèn dầu ấm áp tỏa sáng thư phòng, dẫn lối trong đêm tối" },
  "Bính Ngọ": { napAm: "Thiên Hà Thủy", element: "Thủy", desc: "Nước mưa từ trời cao giáng xuống, tưới nhuần muôn vật hồi sinh" },
  "Đinh Mùi": { napAm: "Thiên Hà Thủy", element: "Thủy", desc: "Nước mưa từ trời cao giáng xuống, tưới nhuần muôn vật hồi sinh" },
  "Mậu Thân": { napAm: "Đại Dịch Thổ", element: "Thổ", desc: "Đất trạm dịch phẳng lặng nâng bước lữ khách, nuôi dưỡng muôn phương" },
  "Kỷ Dậu": { napAm: "Đại Dịch Thổ", element: "Thổ", desc: "Đất trạm dịch phẳng lặng nâng bước lữ khách, nuôi dưỡng muôn phương" },
  "Canh Tuất": { napAm: "Thoa Xuyến Kim", element: "Kim", desc: "Vàng trang sức trâm cài hoa mỹ, bảo ngọc đoan trang lộng lẫy" },
  "Tân Hợi": { napAm: "Thoa Xuyến Kim", element: "Kim", desc: "Vàng trang sức trâm cài hoa mỹ, bảo ngọc đoan trang lộng lẫy" },
  "Nhâm Tý": { napAm: "Tang Đố Mộc", element: "Mộc", desc: "Gỗ cây dâu tằm hữu dụng, kéo tơ dệt lụa nuôi người ấm no" },
  "Quý Sửu": { napAm: "Tang Đố Mộc", element: "Mộc", desc: "Gỗ cây dâu tằm hữu dụng, kéo tơ dệt lụa nuôi người ấm no" },
  "Giáp Dần": { napAm: "Đại Khê Thủy", element: "Thủy", desc: "Nước khe suối lớn cuồn cuộn trôi xuôi, mãnh liệt thông đạt" },
  "Ất Mão": { napAm: "Đại Khê Thủy", element: "Thủy", desc: "Nước khe suối lớn cuồn cuộn trôi xuôi, mãnh liệt thông đạt" },
  "Bính Thìn": { napAm: "Sa Trung Thổ", element: "Thổ", desc: "Đất pha cát màu mỡ phù sa, lắng đọng tinh hoa nuôi dưỡng mùa màng" },
  "Đinh Tỵ": { napAm: "Sa Trung Thổ", element: "Thổ", desc: "Đất pha cát màu mỡ phù sa, lắng đọng tinh hoa nuôi dưỡng mùa màng" },
  "Mậu Ngọ": { napAm: "Thiên Thượng Hỏa", element: "Hỏa", desc: "Lửa mặt trời rực rỡ giữa trời trưa, quang minh chính đại phổ chiếu" },
  "Kỷ Mùi": { napAm: "Thiên Thượng Hỏa", element: "Hỏa", desc: "Lửa mặt trời rực rỡ giữa trời trưa, quang minh chính đại phổ chiếu" },
  "Canh Thân": { napAm: "Thạch Lựu Mộc", element: "Mộc", desc: "Gỗ cây lựu đá quả đỏ trĩu cành, kết tinh bền bỉ đón nắng thu" },
  "Tân Dậu": { napAm: "Thạch Lựu Mộc", element: "Mộc", desc: "Gỗ cây lựu đá quả đỏ trĩu cành, kết tinh bền bỉ đón nắng thu" },
  "Nhâm Tuất": { napAm: "Đại Hải Thủy", element: "Thủy", desc: "Nước biển lớn bao la vạn dặm, dung nạp trăm sông khí phách vô lượng" },
  "Quý Hợi": { napAm: "Đại Hải Thủy", element: "Thủy", desc: "Nước biển lớn bao la vạn dặm, dung nạp trăm sông khí phách vô lượng" },
};

/**
 * Lấy Nạp Âm của Can Chi bất kỳ
 */
export function getNapAmForCanChi(fullName: string) {
  return (
    SIXTY_JIAZI_NAP_AM[fullName] || {
      napAm: "Ngũ Hành Khí",
      element: "Hòa",
      desc: "Âm ba vũ trụ biến chuyển tuần hoàn",
    }
  );
}

/**
 * Tính Quý Nhân Trú & Dạ theo Can của Ngày (Chuẩn Tử Bình / Lục Nhâm)
 */
export function getDayNoble(dayCan: string): { truQuy: string; daQuy: string } {
  switch (dayCan) {
    case "Giáp":
    case "Mậu":
    case "Canh":
      return { truQuy: "Sửu", daQuy: "Mùi" };
    case "Ất":
    case "Kỷ":
      return { truQuy: "Tý", daQuy: "Thân" };
    case "Bính":
    case "Đinh":
      return { truQuy: "Hợi", daQuy: "Dậu" };
    case "Nhâm":
    case "Quý":
      return { truQuy: "Mão", daQuy: "Tỵ" };
    case "Tân":
      return { truQuy: "Ngọ", daQuy: "Dần" };
    default:
      return { truQuy: "Sửu", daQuy: "Mùi" };
  }
}

/**
 * Tính Tuần Không (Không Vong) theo Trụ Ngày
 */
export function getDayEmptyBranches(dayCanIdx: number, dayChiIdx: number): [string, string] {
  const diff = ((dayChiIdx - dayCanIdx) % 12 + 12) % 12;
  const empty1Idx = (diff + 10) % 12;
  const empty2Idx = (diff + 11) % 12;
  return [CHI_NAMES[empty1Idx], CHI_NAMES[empty2Idx]];
}

export interface PillarDetail {
  title: string;
  can: string;
  chi: string;
  chineseCan: string;
  chineseChi: string;
  fullName: string;
  napAm: string;
  element: string;
  napAmDesc: string;
}

export interface DayBaziDetail {
  yearPillar: PillarDetail;
  monthPillar: PillarDetail;
  dayPillar: PillarDetail;
  hourPillar: PillarDetail;
  nobles: { truQuy: string; daQuy: string };
  emptyBranches: [string, string];
  activeSolarTerm: SolarTermRecord;
  sunLongitude: number;
}

export interface NguyetTuongDetail {
  branch: string;
  chineseBranch: string;
  name: string;
  chinese: string;
  element: string;
  solarTerm: string;
  chineseTerm: string;
  desc: string;
  meaning: string;
  color: string;
  sunLongitude: number;
}

export const NGUYET_TUONG_MAP: Record<string, NguyetTuongDetail> = {
  Hợi: {
    branch: "Hợi",
    chineseBranch: "亥",
    name: "Đăng Minh",
    chinese: "登明",
    element: "Thủy",
    solarTerm: "Vũ Thủy (Tháng 1)",
    chineseTerm: "雨水",
    desc: "Trí tuệ cơ mật, căn nguyên thủy mạch, giải trừ tai ương, tàng tụ phúc khí",
    meaning: "Thái Dương đóng tại cung Hợi sau Tiết Vũ Thủy. Khởi từ căn nguyên Thủy khí sinh Mộc, tượng trưng cho hạt mầm trí tuệ âm thầm chuyển hóa, quang minh soi tỏ những chỗ tối tăm u ám.",
    color: "text-sky-400 bg-sky-950/70 border-sky-600/60",
    sunLongitude: 330,
  },
  Tuất: {
    branch: "Tuất",
    chineseBranch: "戌",
    name: "Hà Khôi",
    chinese: "河魁",
    element: "Thổ",
    solarTerm: "Xuân Phân (Tháng 2)",
    chineseTerm: "春分",
    desc: "Võ tướng uy vệ, thu vén nhà kho, kỷ cương nghiêm cẩn, kết thúc việc cũ",
    meaning: "Thái Dương vào cung Tuất sau Tiết Xuân Phân. Cung Tuất là Thiên Môn, đại diện cho kỷ cương, thu vén việc cũ để dọn đường cho việc mới bắt đầu, uy nghi dũng lược.",
    color: "text-amber-300 bg-amber-950/70 border-amber-600/60",
    sunLongitude: 0,
  },
  Dậu: {
    branch: "Dậu",
    chineseBranch: "酉",
    name: "Tòng Khôi",
    chinese: "從魁",
    element: "Kim",
    solarTerm: "Cốc Vũ (Tháng 3)",
    chineseTerm: "穀雨",
    desc: "Quý nhân phù trợ, ngọc ngà tài bảo, phụ nữ đoan trang, tâm tính thanh tịnh",
    meaning: "Thái Dương vào cung Dậu sau Tiết Cốc Vũ. Dậu là chính Kim tây phương, chủ về bảo vật châu ngọc, phụ nữ thanh quý đoan chính, tâm tư mẫn tuệ thông sáng.",
    color: "text-slate-300 bg-slate-900/80 border-slate-600/60",
    sunLongitude: 30,
  },
  Thân: {
    branch: "Thân",
    chineseBranch: "申",
    name: "Truyền Tống",
    chinese: "傳送",
    element: "Kim",
    solarTerm: "Tiểu Mãn (Tháng 4)",
    chineseTerm: "小滿",
    desc: "Sứ giả thông tin, giao dịch đường xa, biến thông tài tình, cầu tài cầu việc",
    meaning: "Thái Dương vào cung Thân sau Tiết Tiểu Mãn. Cung Thân là dịch mã bôn ba, sứ thần đem tin tức tốt lành, cầu mưu xuất ngoại buôn bán đều rất thuận lợi.",
    color: "text-zinc-200 bg-zinc-900/80 border-zinc-500/60",
    sunLongitude: 60,
  },
  Mùi: {
    branch: "Mùi",
    chineseBranch: "未",
    name: "Tiểu Cát",
    chinese: "小吉",
    element: "Thổ",
    solarTerm: "Hạ Chí (Tháng 5)",
    chineseTerm: "夏至",
    desc: "Hỷ sự tương phùng, yến tiệc ẩm thực, gia đạo hòa hợp, tình cảm êm ấm",
    meaning: "Thái Dương vào cung Mùi sau Tiết Hạ Chí. Mùi là Thổ ẩm nuôi dưỡng vạn vật, mang lại hỷ khí đoàn viên, tiệc tùng gặp gỡ người thân yêu, việc lành êm ấm.",
    color: "text-yellow-400 bg-yellow-950/70 border-yellow-600/60",
    sunLongitude: 90,
  },
  Ngọ: {
    branch: "Ngọ",
    chineseBranch: "午",
    name: "Thắng Quang",
    chinese: "勝光",
    element: "Hỏa",
    solarTerm: "Đại Thử (Tháng 6)",
    chineseTerm: "大暑",
    desc: "Quang minh chính đại, thắng lợi hiển hách, quan lộc phát đạt, rực rỡ danh tiếng",
    meaning: "Thái Dương vào cung Ngọ sau Tiết Đại Thử. Ngọ là cung ly vị hỏa vượng nhất trời đất, tượng trưng cho chiến thắng rạng rỡ, văn thư chiếu chỉ vẻ vang, thăng quan tiến chức.",
    color: "text-amber-400 bg-amber-950/80 border-amber-500/60",
    sunLongitude: 120,
  },
  Tỵ: {
    branch: "Tỵ",
    chineseBranch: "巳",
    name: "Thái Ất",
    chinese: "太乙",
    element: "Hỏa",
    solarTerm: "Xử Thử (Tháng 7)",
    chineseTerm: "處暑",
    desc: "Trí mưu biến hóa, thông đạt kinh tế, xuất ngoại hanh thông, học vấn uyên bác",
    meaning: "Thái Dương vào cung Tỵ sau Tiết Xử Thử. Tỵ là lò đúc rèn luyện, chủ về mưu trí sâu sắc, thông tuệ kinh bang tế thế, học hành thi cử đỗ đạt cao.",
    color: "text-rose-400 bg-rose-950/70 border-rose-600/60",
    sunLongitude: 150,
  },
  Thìn: {
    branch: "Thìn",
    chineseBranch: "辰",
    name: "Thiên Cương",
    chinese: "天罡",
    element: "Thổ",
    solarTerm: "Thu Phân (Tháng 8)",
    chineseTerm: "秋分",
    desc: "Chí cương chí dũng, thống lĩnh bách thần, quyết đoán mưu sự, dẹp yên chấn nhiễu",
    meaning: "Thái Dương vào cung Thìn sau Tiết Thu Phân. Thìn là long thần biến hóa, biểu trưng cho quyền uy thống soái, sự kiên quyết trừ gian diệt bạo, khai sơn phá thạch.",
    color: "text-orange-400 bg-orange-950/70 border-orange-600/60",
    sunLongitude: 180,
  },
  Mão: {
    branch: "Mão",
    chineseBranch: "卯",
    name: "Thái Xung",
    chinese: "太衝",
    element: "Mộc",
    solarTerm: "Sương Giáng (Tháng 9)",
    chineseTerm: "霜降",
    desc: "Xung phong xuất trận, xe cộ di chuyển, canh tân sáng tạo, sinh sôi nảy nở",
    meaning: "Thái Dương vào cung Mão sau Tiết Sương Giáng. Mão là chấn vị sấm động mùa thu, chủ về xung phá trở ngại, đổi mới canh tân, xe cộ xuất hành thần tốc.",
    color: "text-emerald-400 bg-emerald-950/70 border-emerald-600/60",
    sunLongitude: 210,
  },
  Dần: {
    branch: "Dần",
    chineseBranch: "寅",
    name: "Công Tào",
    chinese: "功曹",
    element: "Mộc",
    solarTerm: "Tiểu Tuyết (Tháng 10)",
    chineseTerm: "小雪",
    desc: "Kiến công lập nghiệp, quan văn bổ chức, tài liệu văn án, ban thưởng vinh phong",
    meaning: "Thái Dương vào cung Dần sau Tiết Tiểu Tuyết. Dần là cấn vị lập xuân hướng, tượng trưng cho công trạng hiển hách, văn chương phong sắc, lãnh đạo bổ nhiệm.",
    color: "text-teal-300 bg-teal-950/70 border-teal-600/60",
    sunLongitude: 240,
  },
  Sửu: {
    branch: "Sửu",
    chineseBranch: "丑",
    name: "Đại Cát",
    chinese: "大吉",
    element: "Thổ",
    solarTerm: "Đông Chí (Tháng 11)",
    chineseTerm: "冬至",
    desc: "Đại cát đại lợi, ruộng đồng kho bãi, tích lũy điền sản, gia nghiệp hưng thịnh",
    meaning: "Thái Dương vào cung Sửu sau Tiết Đông Chí. Sửu là kho báu kim thổ, tượng trưng cho sự tích lũy của cải bền vững, mở mang điền sản, vạn sự cát lành đại lợi.",
    color: "text-yellow-500 bg-yellow-950/80 border-yellow-700/60",
    sunLongitude: 270,
  },
  Tý: {
    branch: "Tý",
    chineseBranch: "子",
    name: "Thần Hậu",
    chinese: "神后",
    element: "Thủy",
    solarTerm: "Đại Hàn (Tháng 12)",
    chineseTerm: "大寒",
    desc: "Căn nguyên trời đất, huyền bí tàng ẩn, phúc đức tổ tiên, tịnh niệm tâm linh",
    meaning: "Thái Dương vào cung Tý sau Tiết Đại Hàn. Tý là cung cực bắc cực âm sinh dương, tượng trưng cho tâm linh sâu thẳm, phúc trạch tổ tiên che chở, âm thầm tích phúc.",
    color: "text-sky-300 bg-sky-950/80 border-sky-600/60",
    sunLongitude: 300,
  },
};

/**
 * Tính Nguyệt Tướng chuẩn xác theo kinh độ mặt trời tại một thời điểm
 */
export function getNguyetTuongForDate(year: number, month: number, day: number, hour: number = 12): NguyetTuongDetail {
  const jd = getJulianDay(year, month, day) - 0.5 + (hour - 7) / 24;
  const sunDeg = getExactSunLongitude(jd);

  // Ánh xạ khoảng kinh độ hoàng đạo sang Nguyệt Tướng Lục Nhâm:
  // [330, 360) -> Hợi (Đăng Minh)
  // [0, 30) -> Tuất (Hà Khôi)
  // [30, 60) -> Dậu (Tòng Khôi)
  // [60, 90) -> Thân (Truyền Tống)
  // [90, 120) -> Mùi (Tiểu Cát)
  // [120, 150) -> Ngọ (Thắng Quang)
  // [150, 180) -> Tỵ (Thái Ất)
  // [180, 210) -> Thìn (Thiên Cương)
  // [210, 240) -> Mão (Thái Xung)
  // [240, 270) -> Dần (Công Tào)
  // [270, 300) -> Sửu (Đại Cát)
  // [300, 330) -> Tý (Thần Hậu)

  let branchKey = "Tý";
  if (sunDeg >= 330 || sunDeg < 0) branchKey = "Hợi";
  else if (sunDeg >= 0 && sunDeg < 30) branchKey = "Tuất";
  else if (sunDeg >= 30 && sunDeg < 60) branchKey = "Dậu";
  else if (sunDeg >= 60 && sunDeg < 90) branchKey = "Thân";
  else if (sunDeg >= 90 && sunDeg < 120) branchKey = "Mùi";
  else if (sunDeg >= 120 && sunDeg < 150) branchKey = "Ngọ";
  else if (sunDeg >= 150 && sunDeg < 180) branchKey = "Tỵ";
  else if (sunDeg >= 180 && sunDeg < 210) branchKey = "Thìn";
  else if (sunDeg >= 210 && sunDeg < 240) branchKey = "Mão";
  else if (sunDeg >= 240 && sunDeg < 270) branchKey = "Dần";
  else if (sunDeg >= 270 && sunDeg < 300) branchKey = "Sửu";
  else branchKey = "Tý";

  const res = { ...NGUYET_TUONG_MAP[branchKey], sunLongitude: sunDeg };
  return res;
}

/**
 * Tính Bát Tự Tứ Trụ chuẩn xác cho một ngày giờ nhất định
 */
export function getBaziForDate(
  year: number,
  month: number,
  day: number,
  hourChiIdx: number
): DayBaziDetail {
  const jdn = getJulianDay(year, month, day);
  const jd = jdn - 0.5 + 5 / 24; // 12h trưa UTC+7
  const sunDeg = getExactSunLongitude(jd);

  // 1. Trụ Năm (Xét Tiết Lập Xuân 315°)
  // Nếu kinh độ mặt trời chưa tới 315° và đang ở tháng 1 hoặc đầu tháng 2 -> năm cũ
  let baziYear = year;
  if (month <= 2 && sunDeg < 315 && sunDeg > 270) {
    baziYear = year - 1;
  }
  const yearCanIdx = ((baziYear - 4) % 10 + 10) % 10;
  const yearChiIdx = ((baziYear - 4) % 12 + 12) % 12;
  const yearCan = CAN_NAMES[yearCanIdx];
  const yearChi = CHI_NAMES[yearChiIdx];
  const yearFullName = `${yearCan} ${yearChi}`;
  const yearNapAm = getNapAmForCanChi(yearFullName);

  // 2. Trụ Tháng (Xét theo 12 Tiết Khí chính bắt đầu tháng & Ngũ Hổ Độn)
  let monthOffset = 0; // Tháng Dần = 0
  if (sunDeg >= 315 && sunDeg < 345) monthOffset = 0; // Dần
  else if (sunDeg >= 345 || sunDeg < 15) monthOffset = 1; // Mão
  else if (sunDeg >= 15 && sunDeg < 45) monthOffset = 2; // Thìn
  else if (sunDeg >= 45 && sunDeg < 75) monthOffset = 3; // Tỵ
  else if (sunDeg >= 75 && sunDeg < 105) monthOffset = 4; // Ngọ
  else if (sunDeg >= 105 && sunDeg < 135) monthOffset = 5; // Mùi
  else if (sunDeg >= 135 && sunDeg < 165) monthOffset = 6; // Thân
  else if (sunDeg >= 165 && sunDeg < 195) monthOffset = 7; // Dậu
  else if (sunDeg >= 195 && sunDeg < 225) monthOffset = 8; // Tuất
  else if (sunDeg >= 225 && sunDeg < 255) monthOffset = 9; // Hợi
  else if (sunDeg >= 255 && sunDeg < 285) monthOffset = 10; // Tý
  else monthOffset = 11; // Sửu (285 -> 315)

  const monthChiIdx = (2 + monthOffset) % 12; // Dần là index 2
  const baseMonthCan = ((yearCanIdx % 5) * 2 + 2) % 10; // Ngũ Hổ Độn
  const monthCanIdx = (baseMonthCan + monthOffset) % 10;
  const monthCan = CAN_NAMES[monthCanIdx];
  const monthChi = CHI_NAMES[monthChiIdx];
  const monthFullName = `${monthCan} ${monthChi}`;
  const monthNapAm = getNapAmForCanChi(monthFullName);

  // 3. Trụ Ngày (JDN thiên văn)
  const dayCanChi = getDayCanChi(jdn);
  const dayFullName = dayCanChi.fullName;
  const dayNapAm = getNapAmForCanChi(dayFullName);

  // 4. Trụ Giờ (Ngũ Thử Độn)
  const hourCanChi = getHourCanChi(dayCanChi.canIdx, hourChiIdx);
  const hourFullName = hourCanChi.fullName;
  const hourNapAm = getNapAmForCanChi(hourFullName);

  // 5. Tiết Khí đang cai quản ngày hôm đó
  // Tìm tiết khí có deg gần nhất <= sunDeg
  let activeTerm = SOLAR_TERMS_24[0];
  // Chuẩn hóa deg theo vòng tròn từ Xuân Phân (0°)
  for (const term of SOLAR_TERMS_24) {
    if (term.deg <= sunDeg) {
      activeTerm = term;
    }
  }

  // 6. Quý Nhân & Tuần Không của ngày
  const nobles = getDayNoble(dayCanChi.can);
  const emptyBranches = getDayEmptyBranches(dayCanChi.canIdx, dayCanChi.chiIdx);

  return {
    yearPillar: {
      title: "Trụ Năm",
      can: yearCan,
      chi: yearChi,
      chineseCan: CAN_CHINESE[yearCanIdx],
      chineseChi: CHI_CHINESE[yearChiIdx],
      fullName: yearFullName,
      napAm: yearNapAm.napAm,
      element: yearNapAm.element,
      napAmDesc: yearNapAm.desc,
    },
    monthPillar: {
      title: "Trụ Tháng",
      can: monthCan,
      chi: monthChi,
      chineseCan: CAN_CHINESE[monthCanIdx],
      chineseChi: CHI_CHINESE[monthChiIdx],
      fullName: monthFullName,
      napAm: monthNapAm.napAm,
      element: monthNapAm.element,
      napAmDesc: monthNapAm.desc,
    },
    dayPillar: {
      title: "Trụ Ngày",
      can: dayCanChi.can,
      chi: dayCanChi.chi,
      chineseCan: dayCanChi.chineseCan,
      chineseChi: dayCanChi.chineseChi,
      fullName: dayFullName,
      napAm: dayNapAm.napAm,
      element: dayNapAm.element,
      napAmDesc: dayNapAm.desc,
    },
    hourPillar: {
      title: "Trụ Giờ",
      can: hourCanChi.can,
      chi: hourCanChi.chi,
      chineseCan: CAN_CHINESE[hourCanChi.canIdx],
      chineseChi: CHI_CHINESE[hourCanChi.chiIdx],
      fullName: hourFullName,
      napAm: hourNapAm.napAm,
      element: hourNapAm.element,
      napAmDesc: hourNapAm.desc,
    },
    nobles,
    emptyBranches,
    activeSolarTerm: activeTerm,
    sunLongitude: sunDeg,
  };
}

/**
 * Cấu trúc kết quả tính Tuổi Vào Vận (Khởi Đại Vận) theo Bát Tự Tử Bình
 */
export interface BaziTuoiVaoVanResult {
  birthJD: number;
  birthFormatted: string;
  // Tiết Khí trước (Nghịch hành)
  prevMajorTerm: TransitionSolarTerm;
  diffPrevDays: number;
  diffPrevFormatted: string; // "X ngày Y giờ Z phút"
  prevVaoVan: {
    years: number;
    months: number;
    days: number;
    summary: string; // "X tuổi Y tháng Z ngày"
    totalApproxYears: number; // Tuổi thập phân
  };
  // Tiết Khí sau (Thuận hành)
  nextMajorTerm: TransitionSolarTerm;
  diffNextDays: number;
  diffNextFormatted: string; // "X ngày Y giờ Z phút"
  nextVaoVan: {
    years: number;
    months: number;
    days: number;
    summary: string; // "X tuổi Y tháng Z ngày"
    totalApproxYears: number; // Tuổi thập phân
  };
  // Chiều khởi vận mặc định theo Giới tính & Âm/Dương năm sinh
  isYearYang: boolean; // Năm Dương hay Âm
  defaultDirection: "forward" | "backward"; // Nam Dương / Nữ Âm -> forward (tiết sau). Nam Âm / Nữ Dương -> backward (tiết trước)
}

/**
 * Hàm quy đổi khoảng chênh lệch ngày giờ thiên văn sang Tuổi Vào Vận Bát Tự:
 * Quy ước thiên cổ Tử Bình:
 * - 3 ngày = 1 năm (12 tháng = 360 ngày).
 * - 1 ngày = 4 tháng (120 ngày).
 * - 1 giờ = 5 ngày.
 * - 12 phút = 1 ngày.
 */
export function convertDaysFloatToTuoiVaoVan(diffDaysFloat: number): {
  diffString: string;
  diffDays: number;
  diffHours: number;
  diffMinutes: number;
  years: number;
  months: number;
  days: number;
  summary: string;
  totalApproxYears: number;
} {
  const totalDays = Math.max(0, diffDaysFloat);
  const intDays = Math.floor(totalDays);
  const fracDay = totalDays - intDays;
  const totalHours = fracDay * 24;
  const intHours = Math.floor(totalHours);
  const intMinutes = Math.round((totalHours - intHours) * 60);

  const diffString = `${intDays} ngày ${intHours} giờ ${intMinutes} phút`;

  // 3 ngày = 1 năm
  const years = Math.floor(totalDays / 3);
  const remDays = totalDays - years * 3;
  // 1 ngày = 4 tháng
  const months = Math.floor(remDays * 4);
  const remDaysForDays = remDays - months / 4;
  // Phần dư quy đổi ra ngày (1/4 ngày = 30 ngày)
  const days = Math.round(remDaysForDays * 120);

  const totalApproxYears = Number((totalDays / 3).toFixed(2));
  const summary = `${years} tuổi ${months} tháng ${days} ngày`;

  return {
    diffString,
    diffDays: intDays,
    diffHours: intHours,
    diffMinutes: intMinutes,
    years,
    months,
    days,
    summary,
    totalApproxYears,
  };
}

/**
 * Tính tuổi vào vận giữa mốc thời điểm sinh và một tiết khí cụ thể (kèm bù trừ giờ phút)
 */
export function calculateTuoiVaoVanBetween(
  birthJD: number,
  termJD: number,
  termName: string,
  isForward: boolean
) {
  const diffDays = Math.abs(birthJD - termJD);
  const conv = convertDaysFloatToTuoiVaoVan(diffDays);
  return {
    diffDaysFloat: diffDays,
    ...conv,
    termName,
    isForward,
  };
}

/**
 * Tính tuổi vào vận (Khởi Vận) theo thời điểm sinh và khoảng cách tới Chính Tiết trước hoặc sau
 * Bù trừ chính xác tới từng ngày, giờ và phút!
 */
export function calculateTuoiVaoVan(
  year: number,
  month: number,
  day: number,
  hourFloat: number = 12,
  gender: "male" | "female" = "male"
): BaziTuoiVaoVanResult {
  // 1. Julian Date thời điểm sinh (UTC)
  // hourFloat tính theo giờ địa phương UTC+7
  const birthJD = getJulianDay(year, month, day) - 0.5 + (hourFloat - 7) / 24;

  const hh = Math.floor(hourFloat);
  const mm = Math.round((hourFloat - hh) * 60);
  const birthFormatted = `${hh.toString().padStart(2, "0")}:${mm
    .toString()
    .padStart(2, "0")} ngày ${day}/${month}/${year}`;

  // 2. Lấy danh sách tiết khí 3 tháng xung quanh (Tháng trước, tháng hiện tại, tháng sau)
  const three = getThreeMonthsSolarTerms(year, month);
  const allMajorTerms: TransitionSolarTerm[] = [
    ...three.prevMonth.terms.filter((t) => t.record.isMajor),
    ...three.currentMonth.terms.filter((t) => t.record.isMajor),
    ...three.nextMonth.terms.filter((t) => t.record.isMajor),
  ].sort((a, b) => a.jd - b.jd);

  // 3. Tìm Chính Tiết liền trước (<= birthJD) và Chính Tiết liền sau (> birthJD)
  let prevMajor = allMajorTerms[0];
  let nextMajor = allMajorTerms[allMajorTerms.length - 1];

  for (let i = 0; i < allMajorTerms.length; i++) {
    if (allMajorTerms[i].jd <= birthJD) {
      prevMajor = allMajorTerms[i];
    }
  }

  for (let i = allMajorTerms.length - 1; i >= 0; i--) {
    if (allMajorTerms[i].jd > birthJD) {
      nextMajor = allMajorTerms[i];
    }
  }

  // 4. Chênh lệch thời gian thiên văn (ngày thập phân)
  const diffPrevDays = Math.max(0, birthJD - prevMajor.jd);
  const diffNextDays = Math.max(0, nextMajor.jd - birthJD);

  const prevConv = convertDaysFloatToTuoiVaoVan(diffPrevDays);
  const nextConv = convertDaysFloatToTuoiVaoVan(diffNextDays);

  // 5. Xác định Chiều khởi vận mặc định (Dương Nam / Âm Nữ thuận hành -> tiết sau; Âm Nam / Dương Nữ nghịch hành -> tiết trước)
  const baziYear = year;
  const yearCanIdx = ((baziYear - 4) % 10 + 10) % 10;
  // Can Dương: Giáp(0), Bính(2), Mậu(4), Canh(6), Nhâm(8)
  const isYearYang = yearCanIdx % 2 === 0;

  let defaultDirection: "forward" | "backward" = "forward";
  if (gender === "male") {
    defaultDirection = isYearYang ? "forward" : "backward";
  } else {
    defaultDirection = isYearYang ? "backward" : "forward";
  }

  return {
    birthJD,
    birthFormatted,
    prevMajorTerm: prevMajor,
    diffPrevDays,
    diffPrevFormatted: prevConv.diffString,
    prevVaoVan: {
      years: prevConv.years,
      months: prevConv.months,
      days: prevConv.days,
      summary: prevConv.summary,
      totalApproxYears: prevConv.totalApproxYears,
    },
    nextMajorTerm: nextMajor,
    diffNextDays,
    diffNextFormatted: nextConv.diffString,
    nextVaoVan: {
      years: nextConv.years,
      months: nextConv.months,
      days: nextConv.days,
      summary: nextConv.summary,
      totalApproxYears: nextConv.totalApproxYears,
    },
    isYearYang,
    defaultDirection,
  };
}
