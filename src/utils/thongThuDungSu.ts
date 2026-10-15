/**
 * THÔNG THƯ DỤNG SỰ & HIỆP KỶ BIỆN PHƯƠNG THƯ
 * 
 * Bộ giải mã tri thức lịch số cổ truyền chuyên sâu:
 * - Thông Thư Nhật Khoa: Phân định Việc Hỷ (Cát sự nên làm) & Việc Kỵ (Hung sự kiêng làm)
 * - Tra cứu Cát Thần (Sao tốt) & Hung Thần (Sao xấu) lâm chiếu
 * - Các ngày hung sát trọng đại: Tam Nương, Nguyệt Kỵ, Dương Công Kỵ Nhật, Nguyệt Phá, Sát Chủ, Thọ Tử
 * - Xuất hành Thông Thư: Phương vị Hỷ Thần, Tài Thần, Hạc Thần
 * - 6 Giờ Hoàng Đạo & 6 Giờ Hắc Đạo trong ngày
 * - 60 Hoa Giáp Nạp Âm Ngũ Hành & Tuổi Xung Khắc
 */

import {
  convertSolarToLunar,
  getDayCanChi,
  getJulianDay,
  getTrucOfDay,
  getNhiThapBatTu,
  CAN_NAMES,
  CHI_NAMES,
} from "./lunarCalendar";
import {
  getTrucNhatTinhByBranchAndMonth,
  TRUC_NHAT_TINH_INFO_MAP,
  getMonthGroupIndex,
} from "../data/trucNhatTinhMatrix";
import { TRUC_NHAT_TINH_TO_THIEN_TUONG_MAP } from "../data/tamAnPhuExtended";

// 60 Hoa Giáp Nạp Âm Ngũ Hành chính xác 100%
export const HOA_GIAP_NAP_AM_MAP: Record<string, { napAm: string; element: string; desc: string }> = {
  "Giáp Tý": { napAm: "Hải Trung Kim", element: "Kim", desc: "Vàng trong đáy biển, tiềm tàng thanh quý" },
  "Ất Sửu": { napAm: "Hải Trung Kim", element: "Kim", desc: "Vàng trong biển cả, tích lũy nội lực bền bỉ" },
  "Bính Dần": { napAm: "Lư Trung Hỏa", element: "Hỏa", desc: "Lửa trong lò, bừng sáng mạnh mẽ nhiệt huyết" },
  "Đinh Mão": { napAm: "Lư Trung Hỏa", element: "Hỏa", desc: "Lửa trong lò lửa, âm ỉ nồng nàn bền bỉ" },
  "Mậu Thìn": { napAm: "Đại Lâm Mộc", element: "Mộc", desc: "Gỗ rừng già ngút ngàn, chở che muôn vật" },
  "Kỷ Tị": { napAm: "Đại Lâm Mộc", element: "Mộc", desc: "Cây cổ thụ vươn cao, phong thái hiên ngang" },
  "Canh Ngọ": { napAm: "Lộ Bàng Thổ", element: "Thổ", desc: "Đất ven đường đi, vững chãi tiếp bước" },
  "Tân Mùi": { napAm: "Lộ Bàng Thổ", element: "Thổ", desc: "Đất ven đường cái, gánh vác mọi phương" },
  "Nhâm Thân": { napAm: "Kiếm Phong Kim", element: "Kim", desc: "Vàng mũi kiếm bén, sắc bén quyết đoán" },
  "Quý Dậu": { napAm: "Kiếm Phong Kim", element: "Kim", desc: "Vàng lưỡi kiếm tôi luyện, sắc sảo tinh anh" },
  "Giáp Tuất": { napAm: "Sơn Đầu Hỏa", element: "Hỏa", desc: "Lửa trên đỉnh núi, tỏa rạng phương xa" },
  "Ất Hợi": { napAm: "Sơn Đầu Hỏa", element: "Hỏa", desc: "Lửa đỉnh non ngàn, sáng rực lúc hoàng hôn" },
  "Bính Tý": { napAm: "Giản Hạ Thủy", element: "Thủy", desc: "Nước dưới khe suối, trong vắt nhu nhuận" },
  "Đinh Sửu": { napAm: "Giản Hạ Thủy", element: "Thủy", desc: "Nước khe lách đá, tiềm ẩn trí tuệ sâu sắc" },
  "Mậu Dần": { napAm: "Thành Đầu Thổ", element: "Thổ", desc: "Đất trên đầu thành, kiên cố phòng hộ" },
  "Kỷ Mão": { napAm: "Thành Đầu Thổ", element: "Thổ", desc: "Đất bờ thành lũy, bảo hộ bình yên" },
  "Canh Thìn": { napAm: "Bạch Lạp Kim", element: "Kim", desc: "Vàng trong sáp ong, tinh khiết dễ uốn nắn" },
  "Tân Tị": { napAm: "Bạch Lạp Kim", element: "Kim", desc: "Vàng đúc ngọn đèn, thanh nhã sáng trong" },
  "Nhâm Ngọ": { napAm: "Dương Liễu Mộc", element: "Mộc", desc: "Gỗ cây dương liễu, mềm mại uyển chuyển" },
  "Quý Mùi": { napAm: "Dương Liễu Mộc", element: "Mộc", desc: "Gỗ cành dương liễu, ứng biến linh hoạt" },
  "Giáp Thân": { napAm: "Tuyền Trung Thủy", element: "Thủy", desc: "Nước trong dòng suối mát, ngọt lành mát mẻ" },
  "Ất Dậu": { napAm: "Tuyền Trung Thủy", element: "Thủy", desc: "Nước suối nguồn tinh khiết, tuôn chảy vô tận" },
  "Bính Tuất": { napAm: "Ốc Thượng Thổ", element: "Thổ", desc: "Đất trên mái ngói, che mưa chắn gió cho đời" },
  "Đinh Hợi": { napAm: "Ốc Thượng Thổ", element: "Thổ", desc: "Đất ngói lợp nhà, tạo dựng mái ấm vững chãi" },
  "Mậu Tý": { napAm: "Tích Lịch Hỏa", element: "Hỏa", desc: "Lửa sấm sét vang trời, chấn động thần tốc" },
  "Kỷ Sửu": { napAm: "Tích Lịch Hỏa", element: "Hỏa", desc: "Lửa chớp sấm chớp, uy nghiêm phá tan tăm tối" },
  "Canh Dần": { napAm: "Tùng Bách Mộc", element: "Mộc", desc: "Gỗ tùng bách ngạo nghễ, hiên ngang trước gió sương" },
  "Tân Mão": { napAm: "Tùng Bách Mộc", element: "Mộc", desc: "Cây tùng xanh tốt, kiên cường bất khuất" },
  "Nhâm Thìn": { napAm: "Trường Lưu Thủy", element: "Thủy", desc: "Nước chảy dài vô tận, hướng về đại dương" },
  "Quý Tị": { napAm: "Trường Lưu Thủy", element: "Thủy", desc: "Dòng nước cuồn cuộn trường lưu, dạt dào năng lượng" },
  "Giáp Ngọ": { napAm: "Sa Trung Kim", element: "Kim", desc: "Vàng lẫn trong cát hạt, cần đãi lọc thành ngọc" },
  "Ất Mùi": { napAm: "Sa Trung Kim", element: "Kim", desc: "Vàng trong cát vàng, tiềm ẩn giá trị quý hiếm" },
  "Bính Thân": { napAm: "Sơn Hạ Hỏa", element: "Hỏa", desc: "Lửa dưới chân núi, ấm áp gom tụ" },
  "Đinh Dậu": { napAm: "Sơn Hạ Hỏa", element: "Hỏa", desc: "Lửa chốn thôn trang chân núi, bình an dung dị" },
  "Mậu Tuất": { napAm: "Bình Địa Mộc", element: "Mộc", desc: "Cây mọc đất bằng phẳng, sinh sôi tươi tốt" },
  "Kỷ Hợi": { napAm: "Bình Địa Mộc", element: "Mộc", desc: "Gỗ xanh đồng bằng, hòa hợp nhân gian" },
  "Canh Tý": { napAm: "Bích Thượng Thổ", element: "Thổ", desc: "Đất trên tường vách, che chở ngôi nhà" },
  "Tân Sửu": { napAm: "Bích Thượng Thổ", element: "Thổ", desc: "Đất đắp tường vách, tạo dựng ngăn nắp" },
  "Nhâm Dần": { napAm: "Kim Bạch Kim", element: "Kim", desc: "Vàng bạc kim trang sức, lung linh quý phái" },
  "Quý Mão": { napAm: "Kim Bạch Kim", element: "Kim", desc: "Vàng khối lấp lánh, tôn quý sang trọng" },
  "Giáp Thìn": { napAm: "Phúc Đăng Hỏa", element: "Hỏa", desc: "Lửa ngọn đèn hoa đăng, soi sáng bóng đêm" },
  "Ất Tị": { napAm: "Phúc Đăng Hỏa", element: "Hỏa", desc: "Lửa đèn thắp lễ, mang lại phúc lành may mắn" },
  "Bính Ngọ": { napAm: "Thiên Hà Thủy", element: "Thủy", desc: "Nước sông Ngân Hà trên trời, mưa lành tưới mát" },
  "Đinh Mùi": { napAm: "Thiên Hà Thủy", element: "Thủy", desc: "Nước mưa trời tuôn rơi, đem sinh khí tới nhân gian" },
  "Mậu Thân": { napAm: "Đại Trạch Thổ", element: "Thổ", desc: "Đất cồn bãi lớn rộng, bao la dung nạp vạn vật" },
  "Kỷ Dậu": { napAm: "Đại Trạch Thổ", element: "Thổ", desc: "Đất vùng đầm trạch lớn, phì nhiêu màu mỡ" },
  "Canh Tuất": { napAm: "Thoa Xuyến Kim", element: "Kim", desc: "Vàng xuyến trâm cài, tinh xảo tuyệt mỹ" },
  "Tân Hợi": { napAm: "Thoa Xuyến Kim", element: "Kim", desc: "Trang sức trâm vàng, trang nhã đài các" },
  "Nhâm Tý": { napAm: "Tang Đố Mộc", element: "Mộc", desc: "Gỗ cây dâu tằm, nuôi dưỡng tằm dệt lụa" },
  "Quý Sửu": { napAm: "Tang Đố Mộc", element: "Mộc", desc: "Cây dâu bến bãi, công năng thực tế hữu ích" },
  "Giáp Dần": { napAm: "Đại Khê Thủy", element: "Thủy", desc: "Nước khe suối lớn cuồn cuộn, thao thiết dồi dào" },
  "Ất Mão": { napAm: "Đại Khê Thủy", element: "Thủy", desc: "Dòng suối nguồn đại khê, tràn đầy sức sống" },
  "Bính Thìn": { napAm: "Sa Trung Thổ", element: "Thổ", desc: "Đất pha cát phù sa, dung hòa mềm mại" },
  "Đinh Tị": { napAm: "Sa Trung Thổ", element: "Thổ", desc: "Đất bãi cát ven sông, thích ứng mọi hoàn cảnh" },
  "Mậu Ngọ": { napAm: "Thiên Thượng Hỏa", element: "Hỏa", desc: "Lửa vầng thái dương trên trời, chiếu rọi rực rỡ" },
  "Kỷ Mùi": { napAm: "Thiên Thượng Hỏa", element: "Hỏa", desc: "Lửa mặt trời chói lọi, sưởi ấm muôn cõi" },
  "Canh Thân": { napAm: "Thạch Lựu Mộc", element: "Mộc", desc: "Gỗ cây thạch lựu, hoa trái sum sê kết tinh" },
  "Tân Dậu": { napAm: "Thạch Lựu Mộc", element: "Mộc", desc: "Cây lựu đỏ rực quả ngon, đong đầy phúc lộc" },
  "Nhâm Tuất": { napAm: "Đại Hải Thủy", element: "Thủy", desc: "Nước biển lớn mênh mông, khoáng đạt vô bờ" },
  "Quý Hợi": { napAm: "Đại Hải Thủy", element: "Thủy", desc: "Nước đại dương bao la, dung nạp trăm sông nghìn suối" },
};

// 6 Cặp Lục Xung
const LUC_XUNG_MAP: Record<string, string> = {
  "Tý": "Ngọ",
  "Sửu": "Mùi",
  "Dần": "Thân",
  "Mão": "Dậu",
  "Thìn": "Tuất",
  "Tị": "Hợi",
  "Ngọ": "Tý",
  "Mùi": "Sửu",
  "Thân": "Dần",
  "Dậu": "Mão",
  "Tuất": "Thìn",
  "Hợi": "Tị",
};

// 6 Cặp Lục Hợp
const LUC_HOP_MAP: Record<string, string> = {
  "Tý": "Sửu",
  "Sửu": "Tý",
  "Dần": "Hợi",
  "Hợi": "Dần",
  "Mão": "Tuất",
  "Tuất": "Mão",
  "Thìn": "Dậu",
  "Dậu": "Thìn",
  "Tị": "Thân",
  "Thân": "Tị",
  "Ngọ": "Mùi",
  "Mùi": "Ngọ",
};

// Tam Hợp Cục
const TAM_HOP_GROUPS: Record<string, string[]> = {
  "Thân": ["Tý", "Thìn"],
  "Tý": ["Thân", "Thìn"],
  "Thìn": ["Thân", "Tý"],
  "Hợi": ["Mão", "Mùi"],
  "Mão": ["Hợi", "Mùi"],
  "Mùi": ["Hợi", "Mão"],
  "Dần": ["Ngọ", "Tuất"],
  "Ngọ": ["Dần", "Tuất"],
  "Tuất": ["Dần", "Ngọ"],
  "Tị": ["Dậu", "Sửu"],
  "Dậu": ["Tị", "Sửu"],
  "Sửu": ["Tị", "Dậu"],
};

// Dương Công Kỵ Nhật (Ngày Âm lịch cố định trong năm)
const DUONG_CONG_KY_DAYS: Record<number, number[]> = {
  1: [13],
  2: [11],
  3: [9],
  4: [7],
  5: [5],
  6: [3],
  7: [1, 29],
  8: [27],
  9: [25],
  10: [23],
  11: [21],
  12: [19],
};

// Ngày Sát Chủ (theo tháng Âm lịch -> Chi ngày)
const SAT_CHU_CHI_MAP: Record<number, string> = {
  1: "Tị",
  2: "Tý",
  3: "Mùi",
  4: "Mão",
  5: "Thân",
  6: "Tuất",
  7: "Sửu",
  8: "Hợi",
  9: "Ngọ",
  10: "Dậu",
  11: "Dần",
  12: "Thìn",
};

// Ngày Thọ Tử (theo tháng Âm lịch -> Tên Can Chi ngày)
const THO_TU_MAP: Record<number, string> = {
  1: "Bính Tuất",
  2: "Nhâm Thìn",
  3: "Tân Hợi",
  4: "Đinh Tị",
  5: "Mậu Tý",
  6: "Bính Ngọ",
  7: "Ất Sửu",
  8: "Quý Mùi",
  9: "Giáp Dần",
  10: "Canh Thân",
  11: "Tân Mão",
  12: "Tân Dậu",
};

// Ngày Vãng Vong (theo tháng Âm lịch -> Chi ngày)
const VANG_VONG_CHI_MAP: Record<number, string> = {
  1: "Dần",
  2: "Tị",
  3: "Thân",
  4: "Hợi",
  5: "Mão",
  6: "Ngọ",
  7: "Dậu",
  8: "Tý",
  9: "Thìn",
  10: "Mùi",
  11: "Tuất",
  12: "Sửu",
};

// Hướng Hỷ Thần theo Thiên Can Ngày
const HY_THAN_DIRECTION_MAP: Record<string, { direction: string; palace: string; desc: string }> = {
  "Giáp": { direction: "Đông Bắc", palace: "Cung Cấn", desc: "Hỷ thần tọa Cấn, đón hỷ sự tài hoa hôn nhân thuận ý" },
  "Ất": { direction: "Tây Bắc", palace: "Cung Càn", desc: "Hỷ thần tọa Càn, khởi hành gặp quý nhân tương trợ" },
  "Bính": { direction: "Tây Nam", palace: "Cung Khôn", desc: "Hỷ thần tọa Khôn, đón điềm lành sinh sôi gia đạo êm ấm" },
  "Đinh": { direction: "Chính Nam", palace: "Cung Ly", desc: "Hỷ thần tọa Ly, danh vọng hanh thông tươi sáng" },
  "Mậu": { direction: "Đông Nam", palace: "Cung Tốn", desc: "Hỷ thần tọa Tốn, hòa khí sinh tài kết giao bền chặt" },
  "Kỷ": { direction: "Đông Bắc", palace: "Cung Cấn", desc: "Hỷ thần tọa Cấn, đón tài đắc lộc mọi bề hòa thuận" },
  "Canh": { direction: "Tây Bắc", palace: "Cung Càn", desc: "Hỷ thần tọa Càn, đón may mắn công danh rộng mở" },
  "Tân": { direction: "Tây Nam", palace: "Cung Khôn", desc: "Hỷ thần tọa Khôn, phước lành êm dịu, vạn sự giai hảo" },
  "Nhâm": { direction: "Chính Nam", palace: "Cung Ly", desc: "Hỷ thần tọa Ly, hân hoan rạng rỡ, gia đạo an vui" },
  "Quý": { direction: "Đông Nam", palace: "Cung Tốn", desc: "Hỷ thần tọa Tốn, thuận buồm xuôi gió, tâm tưởng sự thành" },
};

// Hướng Tài Thần theo Thiên Can Ngày
const TAI_THAN_DIRECTION_MAP: Record<string, { direction: string; palace: string; desc: string }> = {
  "Giáp": { direction: "Đông Nam", palace: "Cung Tốn", desc: "Tài thần tại Tốn, cầu tiền tài, ký hợp đồng thu lợi lớn" },
  "Ất": { direction: "Đông Nam", palace: "Cung Tốn", desc: "Tài thần tại Tốn, kinh doanh đắc lợi, tiền tài dồi dào" },
  "Bính": { direction: "Chính Đông", palace: "Cung Chấn", desc: "Tài thần tại Chấn, khai thương đắc tài, buôn may bán đắt" },
  "Đinh": { direction: "Chính Đông", palace: "Cung Chấn", desc: "Tài thần tại Chấn, khởi sắc tài chính, đón lộc bất ngờ" },
  "Mậu": { direction: "Chính Bắc", palace: "Cung Khảm", desc: "Tài thần tại Khảm, tài nguyên hội tụ, tích lũy kho tàng" },
  "Kỷ": { direction: "Chính Nam", palace: "Cung Ly", desc: "Tài thần tại Ly, vinh hoa đắc lộ, danh lợi song thu" },
  "Canh": { direction: "Tây Nam", palace: "Cung Khôn", desc: "Tài thần tại Khôn, mở rộng cơ nghiệp, đầu tư sinh sôi" },
  "Tân": { direction: "Tây Nam", palace: "Cung Khôn", desc: "Tài thần tại Khôn, quý nhân ban của, làm ăn tấn tới" },
  "Nhâm": { direction: "Chính Tây", palace: "Cung Đoài", desc: "Tài thần tại Đoài, thu hoạch vàng ngọc, giao dịch hanh thông" },
  "Quý": { direction: "Chính Bắc", palace: "Cung Khảm", desc: "Tài thần tại Khảm, tích cốc phòng cơ, tiền bạc vững vàng" },
};

// Hướng Hạc Thần (Hướng xấu kỵ xuất hành) theo Can Chi Ngày
const HAC_THAN_MAP: Record<string, string> = {
  "Tý": "Tây Nam",
  "Sửu": "Tây Nam",
  "Dần": "Chính Nam",
  "Mão": "Chính Nam",
  "Thìn": "Đông Nam",
  "Tị": "Đông Nam",
  "Ngọ": "Chính Đông",
  "Mùi": "Chính Đông",
  "Thân": "Đông Bắc",
  "Dậu": "Đông Bắc",
  "Tuất": "Chính Bắc",
  "Hợi": "Chính Bắc",
};

// Giờ Hoàng Đạo trong ngày dựa theo Chi Ngày
const GIO_HOANG_DAO_MAP: Record<string, number[]> = {
  "Tý": [0, 1, 3, 6, 8, 9],       // Tý, Sửu, Mão, Ngọ, Thân, Dậu
  "Ngọ": [0, 1, 3, 6, 8, 9],
  "Sửu": [2, 3, 5, 8, 10, 11],    // Dần, Mão, Tị, Thân, Tuất, Hợi
  "Mùi": [2, 3, 5, 8, 10, 11],
  "Dần": [0, 1, 4, 5, 7, 10],     // Tý, Sửu, Thìn, Tị, Mùi, Tuất
  "Thân": [0, 1, 4, 5, 7, 10],
  "Mão": [0, 2, 3, 6, 7, 9],      // Tý, Dần, Mão, Ngọ, Mùi, Dậu
  "Dậu": [0, 2, 3, 6, 7, 9],
  "Thìn": [2, 4, 5, 8, 9, 11],    // Dần, Thìn, Tị, Thân, Dậu, Hợi
  "Tuất": [2, 4, 5, 8, 9, 11],
  "Tị": [1, 4, 6, 7, 10, 11],     // Sửu, Thìn, Ngọ, Mùi, Tuất, Hợi
  "Hợi": [1, 4, 6, 7, 10, 11],
};

// Tên 12 Thần Giờ ứng 12 giờ
const GIO_THAN_NAMES = [
  "Thanh Long (Hoàng Đạo)",
  "Minh Đường (Hoàng Đạo)",
  "Thiên Hình (Hắc Đạo)",
  "Chu Tước (Hắc Đạo)",
  "Kim Quỹ (Hoàng Đạo)",
  "Thiên Đức (Hoàng Đạo)",
  "Bạch Hổ (Hắc Đạo)",
  "Ngọc Đường (Hoàng Đạo)",
  "Thiên Lao (Hắc Đạo)",
  "Huyền Vũ (Hắc Đạo)",
  "Tư Mệnh (Hoàng Đạo)",
  "Câu Trận (Hắc Đạo)",
];

export interface ThongThuActionItem {
  id: string;
  category: string;
  action: string;
  level: "Đại Cát" | "Cát" | "Thứ Cát" | "Đại Hung" | "Hung" | "Thứ Hung";
  reason: string;
  isHy: boolean; // true = Hỷ (Nên làm), false = Kỵ (Kiêng làm)
  iconTag: string;
}

export interface ThongThuStarItem {
  name: string;
  nature: "Cát Thần" | "Hung Thần";
  quality: "Đại Cát" | "Cát" | "Hung" | "Đại Hung";
  desc: string;
}

export interface ThongThuDayResult {
  solarDate: { day: number; month: number; year: number };
  lunarDate: { day: number; month: number; year: number; isLeap: boolean; monthFullName: string; yearFullName: string };
  dayCanChi: { can: string; chi: string; fullName: string; chineseCan: string; chineseChi: string };
  napAm: { napAm: string; element: string; desc: string };
  
  // Trực và Tú
  truc: { name: string; nature: string; desc: string };
  tu28: { name: string; animal: string; nature: string; group: string };
  
  // Trực Nhật Tinh
  trucNhatTinh: {
    name: string;
    nature: "Hoàng Đạo" | "Hắc Đạo";
    mappedGeneral: string;
    desc: string;
  };
  
  // Đánh giá tổng quan ngày
  overallAssessment: {
    title: string;
    grade: "Đại Cát" | "Cát" | "Bình Thường" | "Hung" | "Đại Hung";
    badgeClass: string;
    verdict: string;
    poemOrQuote: string;
  };
  
  // Bộ ngày Kỵ đặc biệt
  specialTaboos: {
    isTamNuong: boolean;
    isNguyetKy: boolean;
    isDuongCongKy: boolean;
    isNguyetPha: boolean;
    isSatChu: boolean;
    isThoTu: boolean;
    isVangVong: boolean;
    activeWarnings: string[];
  };

  // Việc HỶ (Cát sự - Nên làm)
  hyList: ThongThuActionItem[];
  
  // Việc KỴ (Hung sự - Kiêng cữ)
  kyList: ThongThuActionItem[];

  // Danh sách Cát Thần (Sao tốt) & Hung Thần (Sao xấu)
  catThanList: ThongThuStarItem[];
  hungThanList: ThongThuStarItem[];

  // Xuất hành Thông Thư
  xuatHanh: {
    hyThan: { direction: string; palace: string; desc: string };
    taiThan: { direction: string; palace: string; desc: string };
    hacThanDirection: string;
  };

  // Giờ Hoàng Đạo & Hắc Đạo
  gioHoangDao: {
    branchIdx: number;
    branchName: string;
    range: string;
    isHoangDao: boolean;
    starName: string;
  }[];

  // Tuổi xung khắc trong ngày
  tuoiXung: {
    chiXung: string;
    canKhac: string;
    examples: string[];
    warningNote: string;
  };
}

/**
 * Hàm phân tích chuyên sâu Thông Thư Dụng Sự cho một ngày Dương Lịch cụ thể
 */
export function getThongThuDayDetails(year: number, month: number, day: number): ThongThuDayResult {
  const jdn = getJulianDay(year, month, day);
  const lunar = convertSolarToLunar(day, month, year);
  const dayCanChi = getDayCanChi(jdn);
  
  // Can Chi ngày
  const dayName = dayCanChi.fullName;
  const napAmInfo = HOA_GIAP_NAP_AM_MAP[dayName] || {
    napAm: "Ngũ Hành Khí",
    element: "Trung",
    desc: "Khí vận điều hòa, tương sinh tương hỗ",
  };

  // Trực của ngày (12 Trực)
  const truc = getTrucOfDay(lunar.month, dayCanChi.chiIdx);
  // Nhị Thập Bát Tú
  const tu28 = getNhiThapBatTu(jdn);

  // Trực Nhật Tinh (12 Thần Hoàng Đạo / Hắc Đạo theo tháng và chi ngày)
  const monthGroupIdx = getMonthGroupIndex(lunar.chiMonth);
  const trucNhatTinhData = getTrucNhatTinhByBranchAndMonth(dayCanChi.chiIdx, monthGroupIdx);
  const mappedGeneral = TRUC_NHAT_TINH_TO_THIEN_TUONG_MAP[trucNhatTinhData.name] || trucNhatTinhData.name;

  // 1. Kiểm tra các Ngày Kỵ Đặc Biệt
  const isTamNuong = [3, 7, 13, 18, 22, 27].includes(lunar.day);
  const isNguyetKy = [5, 14, 23].includes(lunar.day);
  const duongCongDaysForMonth = DUONG_CONG_KY_DAYS[lunar.month] || [];
  const isDuongCongKy = duongCongDaysForMonth.includes(lunar.day);
  const monthXungBranch = LUC_XUNG_MAP[lunar.chiMonth] || "";
  const isNguyetPha = dayCanChi.chi === monthXungBranch;
  const satChuBranch = SAT_CHU_CHI_MAP[lunar.month] || "";
  const isSatChu = dayCanChi.chi === satChuBranch;
  const thoTuFull = THO_TU_MAP[lunar.month] || "";
  const isThoTu = dayCanChi.fullName === thoTuFull || dayCanChi.chi === thoTuFull.split(" ")[1];
  const vangVongBranch = VANG_VONG_CHI_MAP[lunar.month] || "";
  const isVangVong = dayCanChi.chi === vangVongBranch;

  const activeWarnings: string[] = [];
  if (isTamNuong) activeWarnings.push(`Tam Nương Sát (Mùng ${lunar.day} ÂL: Khởi sự hôn nhân, xuất hành trăm việc trắc trở)`);
  if (isNguyetKy) activeWarnings.push(`Nguyệt Kỵ Nhật (Mùng ${lunar.day} ÂL: Đi chơi cũng thiệt nữa là đi buôn)`);
  if (isDuongCongKy) activeWarnings.push(`Dương Công Kỵ Nhật (Ngày trăm sự bất lợi, chớ làm việc trọng đại)`);
  if (isNguyetPha) activeWarnings.push(`Nguyệt Phá Đại Hao (Chi ngày ${dayCanChi.chi} xung Chi tháng ${lunar.chiMonth}: Đại kỵ động thổ, phá tài)`);
  if (isSatChu) activeWarnings.push(`Sát Chủ Nhật (Kỵ cất nhà, cưới hỏi, nhập trạch, an táng)`);
  if (isThoTu) activeWarnings.push(`Thọ Tử Nhật (Ngày cùng táng khí, tuyệt đối không động thổ, khởi công)`);
  if (isVangVong) activeWarnings.push(`Vãng Vong Nhật (Lục Hao sát: Kiêng xuất hành xa, nhận chức, giá thú)`);

  // 2. Tổng hợp Cát Thần & Hung Thần
  const catThanList: ThongThuStarItem[] = [];
  const hungThanList: ThongThuStarItem[] = [];

  // Thần theo Trực Nhật Tinh
  if (trucNhatTinhData.nature === "Hoàng Đạo") {
    catThanList.push({
      name: `${trucNhatTinhData.name} Hoàng Đạo`,
      nature: "Cát Thần",
      quality: "Đại Cát",
      desc: trucNhatTinhData.desc,
    });
  } else {
    hungThanList.push({
      name: `${trucNhatTinhData.name} Hắc Đạo`,
      nature: "Hung Thần",
      quality: trucNhatTinhData.name === "Bạch Hổ" ? "Đại Hung" : "Hung",
      desc: trucNhatTinhData.desc,
    });
  }

  // Thần theo Trực
  if (["Thành", "Khai", "Mãn", "Định", "Trừ"].includes(truc.name)) {
    catThanList.push({
      name: `Trực ${truc.name}`,
      nature: "Cát Thần",
      quality: truc.nature === "Đại Cát" ? "Đại Cát" : "Cát",
      desc: truc.desc,
    });
  } else if (["Phá", "Bế", "Nguy"].includes(truc.name)) {
    hungThanList.push({
      name: `Trực ${truc.name}`,
      nature: "Hung Thần",
      quality: truc.name === "Phá" ? "Đại Hung" : "Hung",
      desc: truc.desc,
    });
  }

  // Thần theo Nhị Thập Bát Tú
  if (tu28.nature === "Cát" || tu28.nature === "Đại Cát") {
    catThanList.push({
      name: `Sao ${tu28.name} (${tu28.animal})`,
      nature: "Cát Thần",
      quality: "Cát",
      desc: `Tinh tú ${tu28.group} chiếu mệnh, cát khí phù trợ công việc vinh xương`,
    });
  } else {
    hungThanList.push({
      name: `Sao ${tu28.name} (${tu28.animal})`,
      nature: "Hung Thần",
      quality: "Hung",
      desc: `Tinh tú ${tu28.group} xung chiếu, cần cẩn trọng dè chừng các sự việc mạo hiểm`,
    });
  }

  // Bổ sung Thần Sát kinh điển Thông Thư dựa theo Can Chi Tháng & Ngày
  // Thiên Đức / Nguyệt Đức
  if (["Bính", "Đinh", "Giáp", "Ất", "Canh", "Nhâm"].includes(dayCanChi.can)) {
    catThanList.push({
      name: "Nguyệt Ân / Thiên Đức Hợp",
      nature: "Cát Thần",
      quality: "Đại Cát",
      desc: "Ân trạch trời đất che chở, hóa giải hung sát, vạn sự cát lành",
    });
  }
  // Lục Hợp / Tam Hợp
  if (LUC_HOP_MAP[dayCanChi.chi] === lunar.chiMonth) {
    catThanList.push({
      name: `Lục Hợp (${dayCanChi.chi} hợp ${lunar.chiMonth})`,
      nature: "Cát Thần",
      quality: "Đại Cát",
      desc: "Ngày hợp khí với Chi tháng, đại lợi cho việc giao dịch liên kết, hòa hợp gia đạo, thành hôn",
    });
  } else if (TAM_HOP_GROUPS[dayCanChi.chi]?.includes(lunar.chiMonth)) {
    catThanList.push({
      name: `Tam Hợp Cục (${dayCanChi.chi} - ${lunar.chiMonth})`,
      nature: "Cát Thần",
      quality: "Cát",
      desc: "Khí mạch tương sinh đồng tụ, trăm việc tiến hành đều hanh thông thuận buồm",
    });
  }

  // Thần sát Cát: Mẫu Thương, Sinh Khí, Thiên Hỷ
  if (["Dần", "Mão", "Thìn", "Tị", "Hợi"].includes(dayCanChi.chi)) {
    catThanList.push({
      name: "Mẫu Thương / Sinh Khí",
      nature: "Cát Thần",
      quality: "Cát",
      desc: "Nuôi dưỡng mầm sống, tốt cho khởi sự kinh doanh, nạp tài sản và kết hôn",
    });
  }
  if (["Tý", "Ngọ", "Mão", "Dậu"].includes(dayCanChi.chi)) {
    catThanList.push({
      name: "Thiên Hỷ / Đào Hoa Thần",
      nature: "Cát Thần",
      quality: "Cát",
      desc: "Vui vẻ phấn khởi, hỷ khí ngập tràn, đại lợi cho cầu duyên và tiệc mừng",
    });
  }

  // Hung thần bổ sung
  if (isNguyetPha) {
    hungThanList.push({
      name: "Nguyệt Phá • Đại Hao",
      nature: "Hung Thần",
      quality: "Đại Hung",
      desc: "Chi ngày xung thẳng Chi tháng, tiền tài hao tán, công trình dễ sụp đổ rạn nứt",
    });
  }
  if (isSatChu) {
    hungThanList.push({
      name: "Sát Chủ Chi Tinh",
      nature: "Hung Thần",
      quality: "Đại Hung",
      desc: "Sát khí chủ sự gia trạch, kỵ khởi công, động thổ, cưới hỏi, nhập trạch",
    });
  }
  if (isTamNuong) {
    hungThanList.push({
      name: "Tam Nương Cổ Sát",
      nature: "Hung Thần",
      quality: "Hung",
      desc: "Ngày ba cô gái trần gian, ngăn trở việc xuất hành, cưới xin và lập nghiệp",
    });
  }
  if (["Câu Trận", "Bạch Hổ", "Thiên Hình"].includes(trucNhatTinhData.name)) {
    hungThanList.push({
      name: "Hình Ngục / Thị Phi Sát",
      nature: "Hung Thần",
      quality: "Hung",
      desc: "Dễ phát sinh tranh chấp miệng lưỡi, giấy tờ pháp lý, cần khiêm nhường giữ mình",
    });
  }

  // 3. Phân định Việc HỶ (Cát Sự) & Việc KỴ (Hung Sự)
  const hyList: ThongThuActionItem[] = [];
  const kyList: ThongThuActionItem[] = [];

  const isDayGoodOverall =
    trucNhatTinhData.nature === "Hoàng Đạo" &&
    !isNguyetPha &&
    !isSatChu &&
    !isThoTu &&
    !isDuongCongKy;

  // Nhóm 1: Cúng tế, Cầu phúc, Cầu tự
  if (!isThoTu && !isSatChu) {
    hyList.push({
      id: "hy-te-tu",
      category: "Cúng tế & Cầu phúc",
      action: "Tế tự tổ tiên, cầu an gia đạo, lễ bái thần linh, tạ ơn phúc đức",
      level: isDayGoodOverall ? "Đại Cát" : "Cát",
      reason: `Được ${catThanList[0]?.name || "Trời đất che chở"}, tâm thành ắt sở đắc, giải tỏa tai ách`,
      isHy: true,
      iconTag: "🕊️",
    });
  }

  // Nhóm 2: Khai trương, Giao dịch, Cầu tài
  if (!isNguyetPha && !isTamNuong && !isNguyetKy && ["Thành", "Khai", "Mãn", "Định"].includes(truc.name)) {
    hyList.push({
      id: "hy-khai-truong",
      category: "Khai trương & Giao dịch",
      action: "Khai trương cửa hiệu, mở chi nhánh mới, ký kết hợp đồng buôn bán, cầu tài nạp ngân",
      level: trucNhatTinhData.nature === "Hoàng Đạo" ? "Đại Cát" : "Cát",
      reason: `Đắc Trực ${truc.name} vạn vật sinh sôi nở rộ, đắc tài đắc lộc, nguồn lợi hanh thông`,
      isHy: true,
      iconTag: "💰",
    });
  } else {
    kyList.push({
      id: "ky-khai-truong",
      category: "Khai trương & Giao dịch",
      action: "Khai trương quy mô lớn, ký giao kèo cam kết tài chính rủi ro cao",
      level: isNguyetPha || isTamNuong ? "Đại Hung" : "Hung",
      reason: isNguyetPha ? "Ngày Nguyệt Phá chủ hao tổn tài ngân lớn" : isTamNuong ? "Tam Nương sát cản trở mở hàng" : "Trực ngày và hung tinh không tụ tài",
      isHy: false,
      iconTag: "⚠️",
    });
  }

  // Nhóm 3: Hôn nhân, Đính hôn, Giá thú
  if (!isTamNuong && !isNguyetKy && !isNguyetPha && !isSatChu && ["Thành", "Định", "Khai"].includes(truc.name) && ["Thanh Long", "Kim Quỹ", "Minh Đường", "Thiên Đức Hợp"].includes(trucNhatTinhData.name)) {
    hyList.push({
      id: "hy-gia-thu",
      category: "Hôn thú & Tình duyên",
      action: "Đính hôn, ăn hỏi, dạm ngõ, đón dâu rước rể, kết duyên trăm năm",
      level: "Đại Cát",
      reason: `Đắc Hoàng Đạo ${trucNhatTinhData.name} và Trực ${truc.name}, phu thê hòa hợp loan phụng sum vầy`,
      isHy: true,
      iconTag: "💍",
    });
  } else {
    kyList.push({
      id: "ky-gia-thu",
      category: "Hôn thú & Tình duyên",
      action: "Tổ chức hôn lễ, rước dâu đón rể, quyết định lễ dạm ngõ cưới hỏi",
      level: isTamNuong || isNguyetPha ? "Đại Hung" : "Hung",
      reason: isTamNuong ? "Phạm Tam Nương chủ khắc phu thê, duyên phận long đong" : isNguyetKy ? "Nguyệt Kỵ nhật ngăn trở việc hỷ sự" : isNguyetPha ? "Nguyệt Phá xung động, bất lợi cho hòa khí lứa đôi" : "Không có cát tinh hôn nhân chiếu mệnh",
      isHy: false,
      iconTag: "💔",
    });
  }

  // Nhóm 4: Động thổ, Khởi công, Xây dựng
  if (!isSatChu && !isThoTu && !isNguyetPha && !isTamNuong && ["Kiến", "Mãn", "Bình", "Định", "Thành", "Khai"].includes(truc.name) && trucNhatTinhData.nature === "Hoàng Đạo") {
    hyList.push({
      id: "hy-dong-tho",
      category: "Động thổ & Khởi công",
      action: "Đặt móng động thổ, cất nóc, phạt mộc, sửa chữa gia trạch, khởi công công trình",
      level: "Cát",
      reason: `Được địa khí an ổn, Trực ${truc.name} trợ lực, thổ địa dung dưỡng không phạm sát`,
      isHy: true,
      iconTag: "🏛️",
    });
  } else {
    kyList.push({
      id: "ky-dong-tho",
      category: "Động thổ & Khởi công",
      action: "Động thổ đào móng, đổ trần cất nóc, phá vách đập tường làm nhà",
      level: isSatChu || isThoTu || isNguyetPha ? "Đại Hung" : "Hung",
      reason: isSatChu ? "Phạm Sát Chủ ngày: Đại kỵ đụng chạm thổ nhưỡng" : isNguyetPha ? "Nguyệt Phá: Công trình dễ rạn nứt trắc trở" : isThoTu ? "Thọ Tử sát khí nặng nề" : "Phạm ngày kỵ xây cất",
      isHy: false,
      iconTag: "🚫",
    });
  }

  // Nhóm 5: Xuất hành, Đi xa, Tiếp nhận chức vụ
  if (!isTamNuong && !isNguyetKy && !isVangVong && trucNhatTinhData.nature === "Hoàng Đạo") {
    hyList.push({
      id: "hy-xuat-hanh",
      category: "Xuất hành & Giao thiệp",
      action: "Lên đường công tác xa, đi du lịch, nhận nhiệm vụ mới, hội họp mở rộng quan hệ",
      level: "Cát",
      reason: `Xuất hành đắc lộ, phương vị hanh thông, đón ${HY_THAN_DIRECTION_MAP[dayCanChi.can]?.direction || "Cát khí"} che chở`,
      isHy: true,
      iconTag: "🚗",
    });
  } else {
    kyList.push({
      id: "ky-xuat-hanh",
      category: "Xuất hành & Giao thiệp",
      action: "Xuất hành đường xa, đi tàu xe sông nước mạo hiểm, đi xa ký hợp đồng đơn phương",
      level: isNguyetKy || isVangVong ? "Đại Hung" : "Hung",
      reason: isNguyetKy ? "Nguyệt Kỵ: Đi chơi cũng thiệt nữa là đi buôn" : isVangVong ? "Vãng Vong sát: Dễ bị nhầm lẫn lạc đường trễ hẹn" : "Khí vận xuất hành bất lợi",
      isHy: false,
      iconTag: "🛑",
    });
  }

  // Nhóm 6: Nhập trạch, Dọn nhà mới, An sàng
  if (!isSatChu && !isNguyetPha && !isTamNuong && ["Thành", "Khai", "Mãn"].includes(truc.name) && trucNhatTinhData.nature === "Hoàng Đạo") {
    hyList.push({
      id: "hy-nhap-trach",
      category: "Nhập trạch & An cư",
      action: "Nhập trạch vào nhà mới, kê giường (an sàng), dọn chuyển chỗ ở an cư lạc nghiệp",
      level: "Đại Cát",
      reason: `Khí mạch hưng vượng, tụ tài tụ phúc, gia trạch an khang vững như bàn thạch`,
      isHy: true,
      iconTag: "🏡",
    });
  } else {
    kyList.push({
      id: "ky-nhap-trach",
      category: "Nhập trạch & An cư",
      action: "Dọn vào nhà mới, chuyển đổi chỗ ở lớn, đặt bếp dời bàn thờ gia tiên",
      level: isSatChu || isNguyetPha ? "Đại Hung" : "Hung",
      reason: isSatChu ? "Phạm Sát Chủ trạch: Dễ sinh lục đục bất an" : "Khí trường nhà cửa xáo trộn chưa định vị",
      isHy: false,
      iconTag: "🔒",
    });
  }

  // Nhóm 7: Khai bút, Nhập học, Đỗ đạt
  if (["Thành", "Khai", "Kiến"].includes(truc.name) && !isNguyetPha) {
    hyList.push({
      id: "hy-khai-but",
      category: "Cầu danh & Học vấn",
      action: "Khai bút đầu xuân/đầu khóa, nhập học, nộp hồ sơ thi cử, bắt đầu dự án nghiên cứu",
      level: "Cát",
      reason: "Trí tuệ thông suốt, văn tinh chiếu rọi, khởi đầu sáng tỏ thuận buồm xuôi gió",
      isHy: true,
      iconTag: "📚",
    });
  }

  // Nhóm 8: Trị bệnh, Dưỡng sinh, Hòa giải
  if (["Trừ", "Bình", "Định"].includes(truc.name) || trucNhatTinhData.name === "Minh Đường") {
    hyList.push({
      id: "hy-tri-benh",
      category: "Trị bệnh & Hòa giải",
      action: "Khám chữa bệnh, giải trừ khúc mắc, hóa giải tranh chấp thị phi, phóng sinh tích đức",
      level: "Cát",
      reason: `Đắc Trực ${truc.name} chủ xua tan uế khí tà khí, quý nhân điều hòa mọi bất trắc`,
      isHy: true,
      iconTag: "🌿",
    });
  }

  // Nhóm 9: Tranh chấp, Kiện tụng, Cho vay mượn
  kyList.push({
    id: "ky-kien-tung",
    category: "Tranh chấp & Tài chính",
    action: "Tranh cãi to tiếng, đâm đơn kiện tụng, cho vay mượn của cải không có giấy tờ vững chắc",
    level: ["Câu Trận", "Bạch Hổ", "Thiên Hình"].includes(trucNhatTinhData.name) ? "Đại Hung" : "Hung",
    reason: `Sao ${trucNhatTinhData.name} ngầm chứa họa thị phi, chủ tranh đoạt hao tài tổn đức`,
    isHy: false,
    iconTag: "⚖️",
  });

  // Nhóm 10: An táng, Cải táng
  if (isThoTu || isSatChu || isNguyetPha) {
    kyList.push({
      id: "ky-an-tang",
      category: "Mai táng & Cải táng",
      action: "Hạ huyệt an táng, cải táng bốc mộ, xây đắp phần mộ tổ tiên",
      level: "Đại Hung",
      reason: isThoTu ? "Phạm Thọ Tử: Tối kỵ việc táng lễ" : "Phạm hung sát ngày nặng nề",
      isHy: false,
      iconTag: "⚰️",
    });
  } else if (["Bế", "Thành", "Định"].includes(truc.name)) {
    hyList.push({
      id: "hy-an-tang",
      category: "Mai táng & An táng",
      action: "An táng, xây cất tôn tạo lăng mộ gia tộc (chọn giờ Hoàng Đạo)",
      level: "Thứ Cát",
      reason: `Đắc Trực ${truc.name} âm phần an định, tổ tiên ngậm cười độ trì con cháu`,
      isHy: true,
      iconTag: "🪦",
    });
  }

  // 4. Đánh giá Tổng Quan Ngày
  let overallTitle = "HOÀNG ĐẠO CÁT NHẬT";
  let overallGrade: "Đại Cát" | "Cát" | "Bình Thường" | "Hung" | "Đại Hung" = "Cát";
  let overallBadgeClass = "bg-emerald-950 text-emerald-300 border-emerald-600/70";
  let overallVerdict = "Ngày có nhiều cát tinh trợ lực, rất thuận lợi cho các công việc lớn nhỏ.";
  let poemOrQuote = "Thiên thời địa lợi nhân hòa hội tụ, dụng sự đắc thời trăm sự cát tường.";

  if (isTamNuong || isNguyetKy || isDuongCongKy || isNguyetPha || isSatChu || isThoTu) {
    if (isThoTu || isSatChu || isNguyetPha) {
      overallTitle = isNguyetPha ? "NGÀY NGUYỆT PHÁ • ĐẠI HAO" : isSatChu ? "NGÀY SÁT CHỦ • ĐẠI HUNG" : "NGÀY THỌ TỬ • ĐẠI KỴ";
      overallGrade = "Đại Hung";
      overallBadgeClass = "bg-rose-950 text-rose-300 border-rose-600/80 shadow-[0_0_12px_rgba(225,29,72,0.3)]";
      overallVerdict = "Ngày hung sát nghiêm trọng, kiêng kỵ toàn bộ đại sự trọng đại (cưới hỏi, động thổ, xuất hành, khai trương).";
      poemOrQuote = "Nhật phùng hung sát mạc khinh khinh / Đại sự chớ tham khởi lộ trình / Thủ cựu dưỡng thần an bổn phận / Đợi ngày cát nhật hãy thi hành.";
    } else if (isTamNuong) {
      overallTitle = "NGÀY TAM NƯƠNG • THỨ HUNG";
      overallGrade = "Hung";
      overallBadgeClass = "bg-amber-950/90 text-amber-300 border-amber-600/80";
      overallVerdict = "Tam Nương sát cản trở hôn nhân và xuất hành. Chỉ nên làm việc nội bộ thường nhật.";
      poemOrQuote = "Tam Nương sát giáng hạ trần gian / Khởi sự mười phần chín dở dang / Cưới gả đi xa đều bất lợi / An cư bảo mệnh được chu toàn.";
    } else if (isNguyetKy) {
      overallTitle = "NGÀY NGUYỆT KỴ • CẨN TRỌNG";
      overallGrade = "Hung";
      overallBadgeClass = "bg-amber-950/90 text-amber-300 border-amber-600/80";
      overallVerdict = "Mùng năm mười bốn hai ba, kiêng xuất hành xa, khởi sự lớn hay đi buôn.";
      poemOrQuote = "Mùng năm, mười bốn, hai ba / Đi chơi cũng thiệt nữa là đi buôn / Dụng sự chớ tham điều mạo hiểm / Tĩnh tâm chờ đợi phúc trường tồn.";
    } else {
      overallTitle = "DƯƠNG CÔNG KỴ NHẬT";
      overallGrade = "Hung";
      overallBadgeClass = "bg-rose-950 text-rose-300 border-rose-600/70";
      overallVerdict = "Ngày trăm sự bất nghi theo cổ huấn Dương Công, nên tĩnh dưỡng thủ thế.";
      poemOrQuote = "Dương Công kỵ nhật thế nhân tri / Bách sự phùng chi tất hữu nguy / Tạo tác hôn nhân câu bất lợi / Tĩnh tại tu thân bảo cát uy.";
    }
  } else if (trucNhatTinhData.nature === "Hoàng Đạo") {
    if (["Thanh Long", "Minh Đường", "Kim Quỹ", "Ngọc Đường"].includes(trucNhatTinhData.name) && ["Thành", "Khai", "Mãn"].includes(truc.name)) {
      overallTitle = `ĐẠI CÁT HOÀNG ĐẠO • ${trucNhatTinhData.name.toUpperCase()}`;
      overallGrade = "Đại Cát";
      overallBadgeClass = "bg-amber-950 text-[#FFE58F] border-amber-500 shadow-[0_0_15px_rgba(212,175,55,0.4)]";
      overallVerdict = `Đắc Trực Nhật Tinh ${trucNhatTinhData.name} và Trực ${truc.name}, trăm sự đều thành tựu rực rỡ!`;
      poemOrQuote = "Thanh Long giáng thế rạng hào quang / Mở lối tài nguyên khắp bốn phương / Cưới gả khai trương đều đắc lợi / Gia môn hưng vượng phúc miên trường.";
    } else {
      overallTitle = `HOÀNG ĐẠO CÁT NHẬT • ${trucNhatTinhData.name.toUpperCase()}`;
      overallGrade = "Cát";
      overallBadgeClass = "bg-emerald-950 text-emerald-300 border-emerald-600/80";
      overallVerdict = "Khí trường trong lành cát lợi, thích hợp tiến hành kế hoạch, xuất hành, giao dịch.";
      poemOrQuote = "Hoàng Đạo lâm môn vạn sự an / Quý nhân tương trợ dẹp gian nan / Khởi tâm chính đại mưu cơ nghiệp / Phúc lộc sinh sôi tự cõi ngàn.";
    }
  } else {
    overallTitle = `HẮC ĐẠO NHẬT • ${trucNhatTinhData.name.toUpperCase()}`;
    overallGrade = trucNhatTinhData.name === "Bạch Hổ" ? "Đại Hung" : "Bình Thường";
    overallBadgeClass = trucNhatTinhData.name === "Bạch Hổ" ? "bg-rose-950 text-rose-300 border-rose-600/80" : "bg-[#2A1D13] text-[#D8C7B0] border-[#553C28]";
    overallVerdict = `Trực Nhật Tinh ${trucNhatTinhData.name} thuộc Hắc Đạo. Cần thận trọng, nếu làm việc lớn phải chọn đúng giờ Hoàng Đạo để hóa giải.`;
    poemOrQuote = "Hắc Đạo lâm triều phải liệu lo / Việc công giữ chặt chớ so đo / Chọn giờ Hoàng Đạo mượn linh khí / Biến nguy thành an vững chuyến đò.";
  }

  // 5. Tính 12 Giờ Hoàng Đạo / Hắc Đạo trong ngày
  const hoangDaoIndices = GIO_HOANG_DAO_MAP[dayCanChi.chi] || [0, 1, 4, 5, 7, 10];
  const gioHoangDao = Array.from({ length: 12 }).map((_, branchIdx) => {
    const branchName = CHI_NAMES[branchIdx];
    const isHoangDao = hoangDaoIndices.includes(branchIdx);
    const starName = GIO_THAN_NAMES[branchIdx % 12];
    const startHour = (branchIdx * 2 + 23) % 24;
    const endHour = (branchIdx * 2 + 1) % 24;
    const range = `${String(startHour).padStart(2, "0")}:00 - ${String(endHour).padStart(2, "0")}:59`;
    return {
      branchIdx,
      branchName,
      range,
      isHoangDao,
      starName,
    };
  });

  // 6. Phương vị Xuất hành Thông Thư
  const hyThan = HY_THAN_DIRECTION_MAP[dayCanChi.can] || {
    direction: "Đông Bắc",
    palace: "Cung Cấn",
    desc: "Hỷ thần ban phước lành",
  };
  const taiThan = TAI_THAN_DIRECTION_MAP[dayCanChi.can] || {
    direction: "Đông Nam",
    palace: "Cung Tốn",
    desc: "Tài thần chiêu tài tấn bảo",
  };
  const hacThanDirection = HAC_THAN_MAP[dayCanChi.chi] || "Tây Nam";

  // 7. Tuổi xung khắc trong ngày
  const chiXung = LUC_XUNG_MAP[dayCanChi.chi] || "";
  const canKhac = dayCanChi.can === "Giáp" ? "Canh" : dayCanChi.can === "Ất" ? "Tân" : dayCanChi.can === "Bính" ? "Nhâm" : dayCanChi.can === "Đinh" ? "Quý" : dayCanChi.can === "Mậu" ? "Giáp" : dayCanChi.can === "Kỷ" ? "Ất" : dayCanChi.can === "Canh" ? "Bính" : dayCanChi.can === "Tân" ? "Đinh" : dayCanChi.can === "Nhâm" ? "Mậu" : "Kỷ";
  
  const xungExamples = [
    `${canKhac} ${chiXung}`,
    `Bính ${chiXung}`,
    `Mậu ${chiXung}`,
    `Canh ${chiXung}`,
  ];

  return {
    solarDate: { day, month, year },
    lunarDate: {
      day: lunar.day,
      month: lunar.month,
      year: lunar.year,
      isLeap: lunar.isLeap,
      monthFullName: lunar.monthFullName,
      yearFullName: lunar.yearFullName,
    },
    dayCanChi,
    napAm: napAmInfo,
    truc,
    tu28,
    trucNhatTinh: {
      name: trucNhatTinhData.name,
      nature: trucNhatTinhData.nature,
      mappedGeneral,
      desc: trucNhatTinhData.desc,
    },
    overallAssessment: {
      title: overallTitle,
      grade: overallGrade,
      badgeClass: overallBadgeClass,
      verdict: overallVerdict,
      poemOrQuote,
    },
    specialTaboos: {
      isTamNuong,
      isNguyetKy,
      isDuongCongKy,
      isNguyetPha,
      isSatChu,
      isThoTu,
      isVangVong,
      activeWarnings,
    },
    hyList,
    kyList,
    catThanList,
    hungThanList,
    xuatHanh: {
      hyThan,
      taiThan,
      hacThanDirection,
    },
    gioHoangDao,
    tuoiXung: {
      chiXung,
      canKhac,
      examples: xungExamples,
      warningNote: `Người có tuổi ${chiXung} (đặc biệt là tuổi ${canKhac} ${chiXung}) xung đột trực diện với nhật can chi, nên nhường người khác đứng đầu các nghi thức tế lễ, động thổ, ký kết.`,
    },
  };
}
