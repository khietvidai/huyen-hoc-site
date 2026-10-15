export interface SpreadPositionInfo {
  index: number;
  id: string;
  name: string;
  subtitle: string;
  description: string;
  tagColor?: string;
}

export const SEVEN_STARS_POSITIONS: SpreadPositionInfo[] = [
  {
    index: 0,
    id: "past",
    name: "1. Quá Khứ",
    subtitle: "Căn nguyên & Nền tảng",
    description: "Cội nguồn phát sinh vấn đề, nhân duyên khởi đầu và bài học kinh nghiệm tiền đề.",
    tagColor: "#D4AF37",
  },
  {
    index: 1,
    id: "self_present",
    name: "2. Bản Thân Hiện Tại",
    subtitle: "Tâm thái & Thực lực",
    description: "Vị thế nội tại, tâm lý, năng lực và cách ứng phó của chính bạn lúc này.",
    tagColor: "#EAD8B1",
  },
  {
    index: 2,
    id: "next_development",
    name: "3. Diễn Biến Tiếp Theo",
    subtitle: "Xu thế chuyển dịch",
    description: "Chiều hướng vận động, bước ngoặt tiếp nối và các biến động chuẩn bị xảy ra.",
    tagColor: "#D8C4A0",
  },
  {
    index: 3,
    id: "advice",
    name: "4. Lá Bài Gợi Ý",
    subtitle: "Minh triết & Sách lược",
    description: "Lời chỉ dẫn then chốt từ Dịch lý, phương châm hành động tối ưu để hóa giải khó khăn.",
    tagColor: "#F5D061",
  },
  {
    index: 4,
    id: "result",
    name: "5. Kết Quả",
    subtitle: "Thành tựu & Triển vọng",
    description: "Kết quả khả dĩ của sự việc theo đà phát triển hiện tại.",
    tagColor: "#E28355",
  },
  {
    index: 5,
    id: "environment",
    name: "6. Môi Trường Bên Ngoài",
    subtitle: "Ngoại duyên & Khách quan",
    description: "Các yếu tố ngoại cảnh, sự hỗ trợ hay cản trở từ xã hội, thị trường, đối tác xung quanh.",
    tagColor: "#7AA2F7",
  },
  {
    index: 6,
    id: "shortcoming",
    name: "7. Thiếu Sót Của Bản Thân",
    subtitle: "Điểm mù & Khuyết điểm",
    description: "Sơ hở nội tại, thói quen sai lầm, ảo tưởng hoặc điều bạn còn thiếu sót cần tu sửa.",
    tagColor: "#F7768E",
  },
];

export const NINE_PALACES_POSITIONS: SpreadPositionInfo[] = [
  {
    index: 0,
    id: "palace_5",
    name: "Lá 1: Cung 5 • Trung Cung",
    subtitle: "Ngũ Hoàng Thổ • Bản Thể & Trọng Tâm",
    description: "Khí tụ Trung Cung (ở giữa), đại diện cho bản thể, trung tâm tình thế, năng lượng cốt lõi và khởi điểm vận hành.",
    tagColor: "#D4AF37",
  },
  {
    index: 1,
    id: "palace_6",
    name: "Lá 2: Cung 6 • Càn Tây Bắc",
    subtitle: "Lục Bạch Kim • Quý Nhân & Quyền Uy",
    description: "Phương Tây Bắc (Trời/Càn). Đại diện cho quý nhân phù trợ, cấp trên, lãnh đạo, quyền lực và sự chở che vững chãi.",
    tagColor: "#E0E0E0",
  },
  {
    index: 2,
    id: "palace_7",
    name: "Lá 3: Cung 7 • Đoài Chính Tây",
    subtitle: "Thất Xích Kim • Giao Đạo & Khẩu Tài",
    description: "Phương Chính Tây (Đầm/Đoài). Đại diện cho giao thiệp đàm phán, tài ăn nói, niềm vui hỷ lạc và nguồn tài lộc lưu chuyển.",
    tagColor: "#D4A574",
  },
  {
    index: 3,
    id: "palace_8",
    name: "Lá 4: Cung 8 • Cấn Đông Bắc",
    subtitle: "Bát Bạch Thổ • Điểm Dừng & Điền Trạch",
    description: "Phương Đông Bắc (Núi/Cấn). Đại diện cho sự tích lũy, điền sản đất đai, điểm dừng cần thiết để củng cố nền tảng bền vững.",
    tagColor: "#DDAA55",
  },
  {
    index: 4,
    id: "palace_9",
    name: "Lá 5: Cung 9 • Ly Chính Nam",
    subtitle: "Cửu Tử Hỏa • Danh Tiếng & Trí Tuệ",
    description: "Phương Chính Nam (Lửa/Ly). Đại diện cho danh vọng, ánh sáng tỏ tường, sự nhận biết sáng suốt và tương lai xán lạn.",
    tagColor: "#FF6B6B",
  },
  {
    index: 5,
    id: "palace_1",
    name: "Lá 6: Cung 1 • Khảm Chính Bắc",
    subtitle: "Nhất Bạch Thủy • Chiều Sâu & Tiềm Năng",
    description: "Phương Chính Bắc (Nước/Khảm). Đại diện cho trí tuệ sâu sắc, tiềm năng ẩn tàng, cơ hội dưới bề mặt và thử thách cần vượt qua.",
    tagColor: "#5B9BFF",
  },
  {
    index: 6,
    id: "palace_2",
    name: "Lá 7: Cung 2 • Khôn Tây Nam",
    subtitle: "Nhị Hắc Thổ • Hậu Phương & Nhu Thuận",
    description: "Phương Tây Nam (Đất/Khôn). Đại diện cho sự bao dung dung nạp, hậu phương gia đạo, sự hỗ trợ âm thầm và sức khỏe sinh lực.",
    tagColor: "#B5885C",
  },
  {
    index: 7,
    id: "palace_3",
    name: "Lá 8: Cung 3 • Chấn Chính Đông",
    subtitle: "Tam Bích Mộc • Sức Bật & Đột Phá",
    description: "Phương Chính Đông (Sấm/Chấn). Đại diện cho năng lượng khởi phát, sức bật mãnh liệt, hành động quyết liệt và cơ hội vươn lên.",
    tagColor: "#48BB78",
  },
  {
    index: 8,
    id: "palace_4",
    name: "Lá 9: Cung 4 • Tốn Đông Nam",
    subtitle: "Tứ Lục Mộc • Văn Xương & Hòa Hợp",
    description: "Phương Đông Nam (Gió/Tốn). Đại diện cho học vấn tài hoa, giao thương hanh thông, danh tiếng lan tỏa và sự mềm dẻo uyển chuyển.",
    tagColor: "#38B2AC",
  },
];

// ==========================================
// 12 ĐỊA CHI & 12 CUNG TỬ VI (12 LÁ BÀI)
// ==========================================

export interface EarthlyBranchInfo {
  number: number; // 1 = Tý, 2 = Sửu, 3 = Dần... 12 = Hợi
  id: string;
  name: string;
  lunarMonth: string;
  monthNumber: number; // 1 = Dần, 2 = Mão, ... 11 = Tý, 12 = Sửu
  direction: string;
  element: string;
  gridRow: number; // 1..4
  gridCol: number; // 1..4
  tagColor: string;
}

export const TWELVE_BRANCHES_DATA: EarthlyBranchInfo[] = [
  {
    number: 1,
    id: "ty",
    name: "Tý",
    lunarMonth: "Tháng 11 (Tý)",
    monthNumber: 11,
    direction: "Chính Bắc (Khảm)",
    element: "Thủy (Dương Thủy)",
    gridRow: 4,
    gridCol: 3,
    tagColor: "#4A90E2",
  },
  {
    number: 2,
    id: "suu",
    name: "Sửu",
    lunarMonth: "Tháng Chạp / 12 (Sửu)",
    monthNumber: 12,
    direction: "Đông Bắc (Cấn)",
    element: "Thổ (Âm Thổ)",
    gridRow: 4,
    gridCol: 2,
    tagColor: "#C59B63",
  },
  {
    number: 3,
    id: "dan",
    name: "Dần",
    lunarMonth: "Tháng Giêng / 1 (Dần)",
    monthNumber: 1,
    direction: "Đông Bắc (Cấn)",
    element: "Mộc (Dương Mộc)",
    gridRow: 4,
    gridCol: 1,
    tagColor: "#48BB78",
  },
  {
    number: 4,
    id: "mao",
    name: "Mão",
    lunarMonth: "Tháng 2 (Mão)",
    monthNumber: 2,
    direction: "Chính Đông (Chấn)",
    element: "Mộc (Âm Mộc)",
    gridRow: 3,
    gridCol: 1,
    tagColor: "#38A169",
  },
  {
    number: 5,
    id: "thin",
    name: "Thìn",
    lunarMonth: "Tháng 3 (Thìn)",
    monthNumber: 3,
    direction: "Đông Nam (Tốn)",
    element: "Thổ (Dương Thổ)",
    gridRow: 2,
    gridCol: 1,
    tagColor: "#D69E2E",
  },
  {
    number: 6,
    id: "ti",
    name: "Tị",
    lunarMonth: "Tháng 4 (Tị)",
    monthNumber: 4,
    direction: "Đông Nam (Tốn)",
    element: "Hỏa (Âm Hỏa)",
    gridRow: 1,
    gridCol: 1,
    tagColor: "#E53E3E",
  },
  {
    number: 7,
    id: "ngo",
    name: "Ngọ",
    lunarMonth: "Tháng 5 (Ngọ)",
    monthNumber: 5,
    direction: "Chính Nam (Ly)",
    element: "Hỏa (Dương Hỏa)",
    gridRow: 1,
    gridCol: 2,
    tagColor: "#FF6B6B",
  },
  {
    number: 8,
    id: "mui",
    name: "Mùi",
    lunarMonth: "Tháng 6 (Mùi)",
    monthNumber: 6,
    direction: "Tây Nam (Khôn)",
    element: "Thổ (Âm Thổ)",
    gridRow: 1,
    gridCol: 3,
    tagColor: "#DD6B20",
  },
  {
    number: 9,
    id: "than",
    name: "Thân",
    lunarMonth: "Tháng 7 (Thân)",
    monthNumber: 7,
    direction: "Tây Nam (Khôn)",
    element: "Kim (Dương Kim)",
    gridRow: 1,
    gridCol: 4,
    tagColor: "#CBD5E0",
  },
  {
    number: 10,
    id: "dau",
    name: "Dậu",
    lunarMonth: "Tháng 8 (Dậu)",
    monthNumber: 8,
    direction: "Chính Tây (Đoài)",
    element: "Kim (Âm Kim)",
    gridRow: 2,
    gridCol: 4,
    tagColor: "#E2E8F0",
  },
  {
    number: 11,
    id: "tuat",
    name: "Tuất",
    lunarMonth: "Tháng 9 (Tuất)",
    monthNumber: 9,
    direction: "Tây Bắc (Càn)",
    element: "Thổ (Dương Thổ)",
    gridRow: 3,
    gridCol: 4,
    tagColor: "#B7791F",
  },
  {
    number: 12,
    id: "hoi",
    name: "Hợi",
    lunarMonth: "Tháng 10 (Hợi)",
    monthNumber: 10,
    direction: "Tây Bắc (Càn)",
    element: "Thủy (Âm Thủy)",
    gridRow: 4,
    gridCol: 4,
    tagColor: "#3182CE",
  },
];

export const TWELVE_HOUSES_INFO = [
  {
    houseIndex: 0,
    name: "Cung Mệnh",
    alias: "Bản Mệnh",
    description: "Điểm khởi đầu, thể hiện bản ngã, tính cách, ngoại hình và vận mệnh tổng quan.",
    tagColor: "#D4AF37",
  },
  {
    houseIndex: 1,
    name: "Cung Phụ Mẫu",
    alias: "Phụ Mẫu",
    description: "Đại diện cho cha mẹ, đấng sinh thành và sự giáo dục từ gia đình.",
    tagColor: "#ED8936",
  },
  {
    houseIndex: 2,
    name: "Cung Phúc Đức",
    alias: "Phúc Đức",
    description: "Thể hiện phúc báu, tổ tiên, họ hàng và thế giới tinh thần của bản thân.",
    tagColor: "#9F7AEA",
  },
  {
    houseIndex: 3,
    name: "Cung Điền Trạch",
    alias: "Điền Trạch",
    description: "Phản ánh bất động sản, nhà cửa, đất đai và không gian sống.",
    tagColor: "#ECC94B",
  },
  {
    houseIndex: 4,
    name: "Cung Quan Lộc",
    alias: "Quan Lộc",
    description: "Nói về con đường công danh, sự nghiệp, học hành và công việc.",
    tagColor: "#48BB78",
  },
  {
    houseIndex: 5,
    name: "Cung Nô Bộc",
    alias: "Nô Bộc",
    description: "Đại diện cho bạn bè, đồng nghiệp, cấp dưới và các mối quan hệ xã hội rộng rãi.",
    tagColor: "#4FD1C5",
  },
  {
    houseIndex: 6,
    name: "Cung Thiên Di",
    alias: "Thiên Di",
    description: "Phản ánh việc đi lại, xuất ngoại, giao tiếp và môi trường khi ra ngoài xã hội.",
    tagColor: "#4299E1",
  },
  {
    houseIndex: 7,
    name: "Cung Tật Ách",
    alias: "Tật Ách",
    description: "Cho biết tình hình sức khỏe, tai ách, bệnh tật và tai họa có thể gặp phải.",
    tagColor: "#F56565",
  },
  {
    houseIndex: 8,
    name: "Cung Tài Bạch",
    alias: "Tài Bạch",
    description: "Thể hiện tiền tài, khả năng kiếm tiền và cách quản lý tài chính.",
    tagColor: "#F6E05E",
  },
  {
    houseIndex: 9,
    name: "Cung Tử Tức",
    alias: "Tử Tức",
    description: "Nói về đường con cái, số lượng và mối quan hệ giữa cha mẹ với con cái.",
    tagColor: "#FC8181",
  },
  {
    houseIndex: 10,
    name: "Cung Phu Thê",
    alias: "Phu Thê",
    description: "Phản ánh chuyện hôn nhân, tình duyên và người phối ngẫu (vợ hoặc chồng).",
    tagColor: "#F687B3",
  },
  {
    houseIndex: 11,
    name: "Cung Huynh Đệ",
    alias: "Huynh Đệ",
    description: "Thể hiện mối quan hệ với anh chị em ruột trong gia đình.",
    tagColor: "#68D391",
  },
];

/**
 * Tính Cung Tử Vi ứng với Địa Chi khi Mệnh Cung an tại menhBranchNumber (1..12)
 * - Mặc định (isReverse = false): Xoay theo vòng 12 Địa Chi (Dần ➔ Mão ➔ Thìn ➔ Tị...):
 *   - Cung Mệnh (index 0) = menhBranchNumber
 *   - Cung Phụ Mẫu (index 1) = menhBranchNumber + 1 (tiếp theo theo chiều kim đồng hồ)
 *   - Cung Phúc Đức (index 2) = menhBranchNumber + 2...
 *   Công thức: diff = (branchNumber - menhBranchNumber + 12) % 12
 * - Khi isReverse = true: Xoay nghịch lùi lại (Dần ➔ Sửu ➔ Tý ➔ Hợi...):
 *   Công thức: diff = (menhBranchNumber - branchNumber + 12) % 12
 */
export function getHouseForBranch(
  branchNumber: number,
  menhBranchNumber: number = 3,
  isReverse: boolean = false
) {
  const diff = isReverse
    ? (menhBranchNumber - branchNumber + 12) % 12
    : (branchNumber - menhBranchNumber + 12) % 12;
  return TWELVE_HOUSES_INFO[diff];
}

export const TWELVE_BRANCHES_POSITIONS: SpreadPositionInfo[] = TWELVE_BRANCHES_DATA.map((branch, idx) => ({
  index: idx,
  id: `branch_${branch.number}`,
  name: `Lá ${branch.number}: Địa Chi ${branch.name}`,
  subtitle: `${branch.lunarMonth} • ${branch.direction}`,
  description: `Tương ứng với ${branch.lunarMonth}, phương ${branch.direction}, ngũ hành ${branch.element}. Khi gieo xúc xắc 12 mặt được số ${branch.number}, Mệnh Cung sẽ an tại đây.`,
  tagColor: branch.tagColor,
}));

export const TEN_STARS_POSITIONS: SpreadPositionInfo[] = [
  {
    index: 0,
    id: "current_situation",
    name: "1. Tình Huống Hiện Tại",
    subtitle: "Tâm điểm vấn đề",
    description: "Thực trạng cốt lõi đang diễn ra, bản chất năng lượng của sự việc tại thời điểm này.",
    tagColor: "#D4AF37",
  },
  {
    index: 1,
    id: "cross_force",
    name: "2. Xuôi: Hỗ Trợ / Ngược: Trở Ngại",
    subtitle: "Lực chắn ngang tâm điểm",
    description: "Trợ lực đẩy nhanh tiến trình hoặc chướng ngại vật trực tiếp chắn ngang tình huống hiện tại.",
    tagColor: "#E28355",
  },
  {
    index: 2,
    id: "external_factors",
    name: "3. Yếu Tố Bên Ngoài",
    subtitle: "Nền tảng khách quan",
    description: "Cơ sở ngoại cảnh, các yếu tố môi trường hoặc hoàn cảnh bên ngoài tác động vào gốc rễ.",
    tagColor: "#7AA2F7",
  },
  {
    index: 3,
    id: "unknown_subconscious",
    name: "4. Điều Bạn Không Biết",
    subtitle: "Góc khuất tiềm thức",
    description: "Những sự việc ẩn giấu dưới mặt nước, động cơ tiềm thức hoặc sự việc bạn chưa nhìn thấy.",
    tagColor: "#BB9AF7",
  },
  {
    index: 4,
    id: "past_context",
    name: "5. Tình Huống Trước Đây",
    subtitle: "Gốc rễ quá khứ",
    description: "Bối cảnh và nguyên nhân vừa mới trôi qua dẫn tới tình huống hiện nay.",
    tagColor: "#C4B69E",
  },
  {
    index: 5,
    id: "near_future",
    name: "6. Tương Lai Tiếp Theo",
    subtitle: "Diễn biến ngắn hạn",
    description: "Sự chuyển dịch sắp tới trong tương lai gần nhất.",
    tagColor: "#73DAC6",
  },
  {
    index: 6,
    id: "year_fortune",
    name: "7. Vận Hạn Năm Nay",
    subtitle: "Chu kỳ vận khí",
    description: "Xu hướng vận trình, cơ hội hay thách thức lớn trong chu kỳ năm / giai đoạn này.",
    tagColor: "#E0AF68",
  },
  {
    index: 7,
    id: "others_perspective",
    name: "8. Cách Nhìn Của Người Ngoài",
    subtitle: "Nhãn quan xã hội",
    description: "Đánh giá, nhận thức và thái độ của người khác (gia đình, đối tác, xã hội) đối với bạn.",
    tagColor: "#9ECE6A",
  },
  {
    index: 8,
    id: "final_outcome",
    name: "9. Kết Quả Cuối Cùng",
    subtitle: "Hồi kết đại định",
    description: "Đích đến chung cuộc của toàn bộ tiến trình nếu mọi việc duy trì theo quỹ đạo hiện thời.",
    tagColor: "#F7768E",
  },
  {
    index: 9,
    id: "advice_counsel",
    name: "10. Lá Bài Khuyên Bảo",
    subtitle: "Tâm pháp tối hậu",
    description: "Lời huấn thị tinh hoa của Dịch lý, phương thức điều chỉnh tâm thế để thuận đạo trời đất.",
    tagColor: "#F5D061",
  },
];

export const TEN_STARS_EXPANDED_POSITIONS: SpreadPositionInfo[] = [
  {
    index: 0,
    id: "current_situation",
    name: "1. Tình Huống Hiện Tại",
    subtitle: "Tâm điểm vấn đề",
    description: "Thực trạng cốt lõi đang diễn ra, bản chất năng lượng của sự việc tại thời điểm này.",
    tagColor: "#D4AF37",
  },
  {
    index: 1,
    id: "cross_force_2a",
    name: "2A. Hỗ Trợ / Trở Ngại (Nhánh A)",
    subtitle: "Lực chắn tâm điểm 2A (Xuôi: Hỗ Trợ • Ngược: Trở Ngại)",
    description: "Tác nhân thứ nhất tác động trực tiếp vào tâm điểm. Ra quẻ có thể là Thuận (Hỗ Trợ) hoặc Nghịch (Trở Ngại).",
    tagColor: "#E28355",
  },
  {
    index: 2,
    id: "cross_force_2b",
    name: "2B. Hỗ Trợ / Trở Ngại (Nhánh B)",
    subtitle: "Lực chắn tâm điểm 2B (Xuôi: Hỗ Trợ • Ngược: Trở Ngại)",
    description: "Tác nhân thứ hai song hành. Kết hợp cùng 2A tạo thành 4 thế trận: Cùng Thuận, Cùng Nghịch, Thuận - Nghịch, hoặc Nghịch - Thuận.",
    tagColor: "#FF7B54",
  },
  {
    index: 3,
    id: "external_factors",
    name: "3. Yếu Tố Bên Ngoài",
    subtitle: "Nền tảng khách quan",
    description: "Cơ sở ngoại cảnh, các yếu tố môi trường hoặc hoàn cảnh bên ngoài tác động vào gốc rễ.",
    tagColor: "#7AA2F7",
  },
  {
    index: 4,
    id: "unknown_subconscious",
    name: "4. Điều Bạn Không Biết",
    subtitle: "Góc khuất tiềm thức",
    description: "Những sự việc ẩn giấu dưới mặt nước, động cơ tiềm thức hoặc sự việc bạn chưa nhìn thấy.",
    tagColor: "#BB9AF7",
  },
  {
    index: 5,
    id: "past_context",
    name: "5. Tình Huống Trước Đây",
    subtitle: "Gốc rễ quá khứ",
    description: "Bối cảnh và nguyên nhân vừa mới trôi qua dẫn tới tình huống hiện nay.",
    tagColor: "#C4B69E",
  },
  {
    index: 6,
    id: "near_future",
    name: "6. Tương Lai Tiếp Theo",
    subtitle: "Diễn biến ngắn hạn",
    description: "Sự chuyển dịch sắp tới trong tương lai gần nhất.",
    tagColor: "#73DAC6",
  },
  {
    index: 7,
    id: "year_fortune",
    name: "7. Vận Hạn Năm Nay",
    subtitle: "Chu kỳ vận khí",
    description: "Xu hướng vận trình, cơ hội hay thách thức lớn trong chu kỳ năm / giai đoạn này.",
    tagColor: "#E0AF68",
  },
  {
    index: 8,
    id: "others_perspective",
    name: "8. Cách Nhìn Của Người Ngoài",
    subtitle: "Nhãn quan xã hội",
    description: "Đánh giá, nhận thức và thái độ của người khác (gia đình, đối tác, xã hội) đối với bạn.",
    tagColor: "#9ECE6A",
  },
  {
    index: 9,
    id: "final_outcome",
    name: "9. Kết Quả Cuối Cùng",
    subtitle: "Hồi kết đại định",
    description: "Đích đến chung cuộc của toàn bộ tiến trình nếu mọi việc duy trì theo quỹ đạo hiện thời.",
    tagColor: "#F7768E",
  },
  {
    index: 10,
    id: "advice_counsel",
    name: "10. Lá Bài Khuyên Bảo",
    subtitle: "Tâm pháp tối hậu",
    description: "Lời huấn thị tinh hoa của Dịch lý, phương thức điều chỉnh tâm thế để thuận đạo trời đất.",
    tagColor: "#F5D061",
  },
];

export const CUSTOM_PURPOSE_SUGGESTIONS: string[] = [
  "Căn nguyên gốc rễ",
  "Tâm thái hiện tại",
  "Thuận lợi / Quý nhân",
  "Trở ngại / Lực cản",
  "Tài chính / Tiền bạc",
  "Sự nghiệp / Công danh",
  "Tình cảm / Mối quan hệ",
  "Gia đạo & Người thân",
  "Sức khỏe & Năng lượng",
  "Cơ hội tiềm ẩn",
  "Điểm mù / Cảnh báo",
  "Hành động tức thời",
  "Diễn biến ngắn hạn",
  "Kết quả chung cuộc",
  "Lời khuyên then chốt",
  "Ý niệm của đối phương",
  "Tác động ngoại cảnh",
  "Tương lai dài hạn",
];

export interface CustomSpreadTemplate {
  id: string;
  name: string;
  count: number;
  description: string;
  purposes: string[];
}

export const CUSTOM_SPREAD_TEMPLATES: CustomSpreadTemplate[] = [
  {
    id: "six_steps",
    name: "6 Lá: Lục Hào Tiến Trình (6 Bước Phát Triển)",
    count: 6,
    description: "Phân tích trọn vẹn 6 tầng nấc từ sơ hào đến thượng hào, từ khởi đầu đến viên mãn.",
    purposes: [
      "Lá 1: Căn nguyên & Khởi phát ban đầu (Sơ hào)",
      "Lá 2: Thực trạng & Nguồn lực nội tại (Nhị hào)",
      "Lá 3: Biến số & Thử thách chuyển tiếp (Tam hào)",
      "Lá 4: Trợ lực & Thời cơ ngoại cảnh (Tứ hào)",
      "Lá 5: Sách lược then chốt & Bước đột phá (Ngũ hào)",
      "Lá 6: Kết quả viên mãn & Bài học rút ra (Thượng hào)",
    ],
  },
  {
    id: "six_domains",
    name: "6 Lá: 6 Khía Cạnh Đời Sống",
    count: 6,
    description: "Tổng quát về 6 phương diện quan trọng nhất trong cuộc sống hiện tại.",
    purposes: [
      "Lá 1: Bản thân & Tâm thái nội tại",
      "Lá 2: Sự nghiệp & Đường công danh",
      "Lá 3: Tài chính & Vận may tiền tài",
      "Lá 4: Tình cảm & Nhân duyên",
      "Lá 5: Sức khỏe & Bình an gia đạo",
      "Lá 6: Lời khuyên Dịch đạo & Xu thế sắp tới",
    ],
  },
  {
    id: "twelve_months",
    name: "12 Lá: Vận Trình 12 Tháng Trong Năm",
    count: 12,
    description: "Dự báo khí vận, cơ hội và biến động của từng tháng từ Tháng 1 đến Tháng 12.",
    purposes: [
      "Lá 1: Tháng 1 (Tháng Giêng - Khởi động & Xu hướng xuân)",
      "Lá 2: Tháng 2 (Vận khí tháng Hai - Tăng tốc)",
      "Lá 3: Tháng 3 (Vận khí tháng Ba - Chuyển mình)",
      "Lá 4: Tháng 4 (Vận khí tháng Tư - Hè sang)",
      "Lá 5: Tháng 5 (Vận khí tháng Năm - Cao điểm)",
      "Lá 6: Tháng 6 (Vận khí tháng Sáu - Đánh giá nửa năm)",
      "Lá 7: Tháng 7 (Vận khí tháng Bảy - Chậm lại & Giữ vững)",
      "Lá 8: Tháng 8 (Vận khí tháng Tám - Thu về)",
      "Lá 9: Tháng 9 (Vận khí tháng Chín - Gặt hái)",
      "Lá 10: Tháng 10 (Vận khí tháng Mười - Chuẩn bị kết thúc)",
      "Lá 11: Tháng 11 (Vận khí tháng Mười Một - Tổng kết)",
      "Lá 12: Tháng 12 (Tháng Chạp - Thu hoạch & Tích lũy)",
    ],
  },
  {
    id: "twelve_palaces",
    name: "12 Lá: 12 Cung Số Mệnh Đời Người",
    count: 12,
    description: "Soi chiếu toàn diện qua 12 cung số mệnh tương tự học thuyết phương Đông.",
    purposes: [
      "Lá 1: Cung Mệnh (Tố chất & Khí chất cá nhân)",
      "Lá 2: Cung Huynh Đệ (Anh em & Bạn bè thân thiết)",
      "Lá 3: Cung Phu Thê (Tình cảm hôn nhân & Bạn đời)",
      "Lá 4: Cung Tử Tức (Con cái & Dự án tương lai)",
      "Lá 5: Cung Tài Bạch (Tài vận & Đường tiền bạc)",
      "Lá 6: Cung Tật Ách (Sức khỏe & Điều cần phòng tránh)",
      "Lá 7: Cung Thiên Di (Xuất hành, đối ngoại & Môi trường xa)",
      "Lá 8: Cung Nô Bộc (Cộng sự, đồng nghiệp & Trợ tá)",
      "Lá 9: Cung Quan Lộc (Sự nghiệp & Vị thế xã hội)",
      "Lá 10: Cung Điền Trạch (Chỗ ở, đất đai & Nơi chốn)",
      "Lá 11: Cung Phúc Đức (Phước duyên & Đời sống tinh thần)",
      "Lá 12: Cung Phụ Mẫu (Cha mẹ & Quý nhân cấp trên)",
    ],
  },
  {
    id: "four_pillars",
    name: "4 Lá: Tứ Trụ Cột (Tứ Tượng Toàn Diện)",
    count: 4,
    description: "Bốn góc trụ xác định phương hướng cho bất kỳ kế hoạch hoặc câu hỏi nào.",
    purposes: [
      "Lá 1: Nền tảng & Căn nguyên sự việc",
      "Lá 2: Trợ lực thuận lợi & Đòn bẩy",
      "Lá 3: Lực cản, thử thách & Rủi ro",
      "Lá 4: Kết quả khả dĩ & Lời khuyên",
    ],
  },
  {
    id: "five_elements",
    name: "5 Lá: Ngũ Hành Tương Sinh Tương Khắc",
    count: 5,
    description: "5 chiều không gian năng lượng bao quát sự việc.",
    purposes: [
      "Lá 1: Bản Mệnh - Tâm thế & Nội lực cá nhân",
      "Lá 2: Tài Lộc - Cơ hội vật chất & Tiền bạc",
      "Lá 3: Nhân Duyên - Mối quan hệ & Giao thiệp",
      "Lá 4: Quý Nhân - Sự tương trợ bất ngờ",
      "Lá 5: Nguy Cơ - Điều cần cảnh giác & Tiết chế",
    ],
  },
  {
    id: "eight_directions",
    name: "8 Lá: Bát Quái Phương Hướng & Biến Dịch",
    count: 8,
    description: "Bát quái 8 hướng luận giải đa chiều về các khía cạnh cuộc sống.",
    purposes: [
      "Lá 1: Phương Bắc (Khảm) - Khó khăn tiềm ẩn & Sự kiên nhẫn",
      "Lá 2: Phương Đông Bắc (Cấn) - Điểm dừng & Giữ tâm an định",
      "Lá 3: Phương Đông (Chấn) - Khởi đầu mới & Sức bật hành động",
      "Lá 4: Phương Đông Nam (Tốn) - Sự hòa nhập & Mềm mỏng uyển chuyển",
      "Lá 5: Phương Nam (Ly) - Danh tiếng, sáng suốt & Sự tỏ tường",
      "Lá 6: Phương Tây Nam (Khôn) - Nhu thuận & Lòng bao dung",
      "Lá 7: Phương Tây (Đoài) - Niềm vui, kết nối & Đàm phán",
      "Lá 8: Phương Tây Bắc (Càn) - Ý chí quyết đoán & Quyền chủ động",
    ],
  },
  {
    id: "nine_palaces_fengshui",
    name: "9 Lá: Trận Pháp Cửu Cung Phong Thủy (Phi Tinh Lạc Thư)",
    count: 9,
    description: "Mỗi dòng 3 lá xếp theo ma trận Cửu Cung Lạc Thư và quỹ đạo Phi Tinh thuận từ Trung Cung.",
    purposes: [
      "Lá 1: Cung 5 (Trung Cung) - Bản Thể, Trọng Tâm & Năng Lượng Cốt Lõi",
      "Lá 2: Cung 6 (Tây Bắc/Càn) - Quý Nhân, Lãnh Đạo & Quyền Uy",
      "Lá 3: Cung 7 (Chính Tây/Đoài) - Giao Đạo, Đàm Phán & Khẩu Tài",
      "Lá 4: Cung 8 (Đông Bắc/Cấn) - Điểm Dừng, Tích Lũy & Điền Trạch",
      "Lá 5: Cung 9 (Chính Nam/Ly) - Danh Tiếng, Trí Tuệ & Tương Lai",
      "Lá 6: Cung 1 (Chính Bắc/Khảm) - Chiều Sâu, Tiềm Năng & Thử Thách",
      "Lá 7: Cung 2 (Tây Nam/Khôn) - Hậu Phương, Nhu Thuận & Gia Đạo",
      "Lá 8: Cung 3 (Chính Đông/Chấn) - Sức Bật, Đột Phá & Hành Động",
      "Lá 9: Cung 4 (Đông Nam/Tốn) - Văn Xương, Hòa Hợp & Tài Lộc",
    ],
  },
];

/**
 * Trả về danh sách mục đích gợi ý thông minh dựa trên số lượng lá bài người dùng nhập
 */
export function getDefaultCustomPurposes(count: number, templateId?: string): string[] {
  if (templateId) {
    const found = CUSTOM_SPREAD_TEMPLATES.find((t) => t.id === templateId);
    if (found && found.purposes.length === count) {
      return [...found.purposes];
    }
  }

  // Tự động khớp theo số lượng lá bài
  const exactTemplate = CUSTOM_SPREAD_TEMPLATES.find((t) => t.count === count);
  if (exactTemplate) {
    return [...exactTemplate.purposes];
  }

  // Nếu số lá tùy ý (ví dụ 3, 7, 9, 11, 15...), tạo chuỗi tiến trình logic
  const generated: string[] = [];
  for (let i = 0; i < count; i++) {
    if (i === 0) {
      generated.push("Lá 1: Căn nguyên khởi điểm & Thực trạng");
    } else if (i === count - 1) {
      generated.push(`Lá ${count}: Kết quả chung cuộc & Lời khuyên tổng kết`);
    } else if (i === count - 2 && count > 3) {
      generated.push(`Lá ${count - 1}: Lời chỉ dẫn / Phương sách hóa giải`);
    } else if (i === 1) {
      generated.push(`Lá 2: Trợ lực & Yếu tố thuận lợi`);
    } else if (i === 2) {
      generated.push(`Lá 3: Trở ngại & Điểm cần lưu ý`);
    } else {
      const genericSuggestions = [
        "Biến số ngoại cảnh tác động",
        "Tâm lý và ý thức tiềm ẩn",
        "Cơ hội sắp tới",
        "Mối quan hệ liên quan",
        "Yếu tố tài lộc / công việc",
        "Bước chuyển dịch trung gian",
        "Lời cảnh báo phòng ngừa",
      ];
      const suggestion = genericSuggestions[(i - 3) % genericSuggestions.length];
      generated.push(`Lá ${i + 1}: ${suggestion}`);
    }
  }
  return generated;
}
