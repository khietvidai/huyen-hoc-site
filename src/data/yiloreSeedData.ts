import {
  YILORE_HEXAGRAM_CATALOG_64,
  YILORE_TEN_GOD_DAILY_PICKS,
  YILORE_FIVE_ELEMENT_DAILY_PICKS,
  YILORE_OCCASION_CATEGORIES,
  YILORE_HOUR_STARS_12,
  YILORE_TEN_GOD_FOCUS_AFFINITIES,
  YILORE_ZIWEI_ASTROLABE,
  YILORE_HELUO_LISHU_EN,
  YILORE_HELUO_LISHU_ZH,
  YILORE_BLOG_ARTICLES,
  YILORE_SCRAPED_STATS,
} from "./yiloreScrapedCatalog";

export {
  YILORE_HEXAGRAM_CATALOG_64,
  YILORE_TEN_GOD_DAILY_PICKS,
  YILORE_FIVE_ELEMENT_DAILY_PICKS,
  YILORE_OCCASION_CATEGORIES,
  YILORE_HOUR_STARS_12,
  YILORE_TEN_GOD_FOCUS_AFFINITIES,
  YILORE_ZIWEI_ASTROLABE,
  YILORE_HELUO_LISHU_EN,
  YILORE_HELUO_LISHU_ZH,
  YILORE_BLOG_ARTICLES,
  YILORE_SCRAPED_STATS,
};

export interface YiloreUserProfile {
  id: string;
  ylId: string;
  email: string;
  userName: string;
  gender: "male" | "female";
  birthDate: string; // YYYY-MM-DD
  birthHour: number; // 0-23
  birthMinute: number;
  birthplace: string;
  birthplaceLongitude?: number;
  birthplaceLatitude?: number;
  timezone: string;
  trueSolarTime: boolean;
  lunarYear: string;
  lunarMonth: number;
  lunarDay: number;
  lunarHour: string;
  bazi: [string, string, string, string]; // Year, Month, Day, Hour
  dayun: {
    previous: { startAge: number; endAge: number; startYear: number; endYear: number; ganZhi: string };
    current: { startAge: number; endAge: number; startYear: number; endYear: number; ganZhi: string };
    next: { startAge: number; endAge: number; startYear: number; endYear: number; ganZhi: string };
    startDescription: string;
  };
  destinyHexagram: {
    hexagramNumber: number;
    binary: string;
    archetypeTitle: string;
    archetypeTitleZh?: string;
    cardTitleEn?: string;
    cardTitleZh?: string;
    hexagramNameEn: string;
    hexagramNameZh: string;
    descriptionEn: string;
    descriptionZh?: string;
    descriptionVi: string;
    traitsEn: string[];
    traitsZh?: string[];
    traitsVi: string[];
    frontImageUrl?: string;
  };
  preHeavenGua?: {
    binary: string;
    guaNameEn: string;
    guaNameZh: string;
    frontImageUrl: string;
    backImageUrl: string;
    panciZh: string;
  };
  postHeavenGua?: {
    binary: string;
    guaNameEn: string;
    guaNameZh: string;
    frontImageUrl: string;
    backImageUrl: string;
    panciZh: string;
  };
  yuanTang: {
    position: number;
    lineTextEn: string;
    lineTextVi: string;
    lineTextZh: string;
    frontImageUrl?: string;
    backImageUrl?: string;
  };
  lifeScript: {
    verseZh: string;
    verseVi: string;
    verseEn: string;
  };
  dayPillarCard: {
    ganZhi: string;
    archetypeZh: string;
    archetypeEn: string;
    archetypeVi: string;
    poeticLineZh: string;
    poeticLineVi: string;
    introZh?: string;
    tagsZh: string[];
    tagsVi: string[];
    tagsEn: string[];
    imageUrl?: string;
  };
  credits: number;
  dailyMessagesRemaining: number;
  dailyMessagesLimit: number;
}

export interface YiloreFollowupItem {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
}

export interface YiloreDailyGuidanceRecord {
  id: string;
  drawnDate: string; // YYYY-MM-DD
  hexagramNumber: number;
  guaName: string;
  guaNameEn: string;
  guaNameVi: string;
  cardTitle: string;
  cardTitleEn: string;
  guaCi: string;
  dailyGuidance: string;
  dailyGuidanceEn: string;
  dailyGuidanceVi: string;
  keywords: string[];
  dayBadge: string;
  frontImageUrl: string;
  backImageUrl: string;
  followupHistory: YiloreFollowupItem[];
}

export interface YiloreReadingRecord {
  readingId: string;
  question: string;
  createdAt: string;
  summaryBrief: string;
  summaryHighlight: string;
  baziAnalysis?: string;
  suggestedFollowups?: string[];
  benGua: {
    position: number;
    name: string;
    nameVi: string;
    title: string;
    guaCi: string;
    brief: string;
    detailExplain: string;
    frontUrl: string;
    backUrl: string;
    lines: number[]; // 6 values: 6 (old yin), 7 (young yang), 8 (young yin), 9 (old yang)
  };
  zhiGua: {
    position: number;
    name: string;
    nameVi: string;
    title: string;
    guaCi: string;
    brief: string;
    detailExplain: string;
    frontUrl: string;
    backUrl: string;
  };
  yaoList: {
    position: number;
    lineName: string;
    yaoTitle?: string;
    yaoCi: string;
    brief: string;
    detailExplain?: string;
    frontUrl?: string;
    backUrl?: string;
  }[];
}

export interface YiloreRelationshipProfile {
  id: string;
  name: string;
  relation: "Partner" | "Family" | "Friend" | "Colleague" | "Other";
  gender: "male" | "female";
  birthDate: string;
  birthTime: string;
  birthCity: string;
  bazi: string;
  dayMaster: string;
  destinyHexagramName: string;
  compatibilityScore: number;
  synastrySummary: string;
}

export interface YiloreQuickLotPayload {
  position: number;
  guaName: string;
  cardTitle: string;
  guaCi: string;
  luckTier: "上签" | "中平" | "下签";
  frontUrl: string;
  backUrl: string;
}

export interface YiloreChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  type?: "text" | "divination_prompt" | "divination_result" | "lot_card" | "auspicious_result";
  divinationRecord?: YiloreReadingRecord;
  lotHexagramNumber?: number;
  quickLot?: YiloreQuickLotPayload;
}

export interface YiloreConversation {
  id: string;
  title: string;
  updatedAt: string;
  activePersonIds: string[];
  activeReportIds: string[];
  messages: YiloreChatMessage[];
}

export interface YiloreStrategyItem {
  id: string;
  category: string;
  title: string;
  time: string;
  tenGod: string;
  score: number;
  tipEn: string;
  tipVi: string;
}

export function getYiloreCardUrl(hexagramNumber: number, side: "a" | "b" = "a", _lang: "en" | "hant" | "vi" = "vi"): string {
  const n = Math.max(1, Math.min(64, hexagramNumber || 1));
  return `/assets/oss/${n}/${n}${side}.webp`;
}

export function getYiloreRizhuCardUrl(rizhuIndex: number): string {
  const idx = Math.max(1, Math.min(60, rizhuIndex || 2));
  return `/yilore-cards/rizhu/${idx}.webp`;
}

export function getYiloreYaoCardUrl(hexagramNumber: number, yaoPosition: number, side: "a" | "b" = "a"): string {
  const n = Math.max(1, Math.min(64, hexagramNumber || 1));
  const y = Math.max(1, Math.min(6, yaoPosition || 1));
  return `/assets/oss/${n}/${n}-${y}${side}.webp`;
}

export const YILORE_STEM_COLORS: Record<string, string> = {
  // Wood (甲, 乙, 寅, 卯)
  "甲": "#15803d",
  "乙": "#15803d",
  "寅": "#15803d",
  "卯": "#15803d",
  // Fire (丙, 丁, 巳, 午)
  "丙": "#b91c1c",
  "丁": "#b91c1c",
  "巳": "#b91c1c",
  "午": "#b91c1c",
  // Earth (戊, 己, 辰, 戌, 丑, 未)
  "戊": "#92400e",
  "己": "#92400e",
  "辰": "#92400e",
  "戌": "#92400e",
  "丑": "#92400e",
  "未": "#92400e",
  // Metal (庚, 辛, 申, 酉)
  "庚": "#b45309",
  "辛": "#b45309",
  "申": "#b45309",
  "酉": "#b45309",
  // Water (壬, 癸, 亥, 子)
  "壬": "#1d4ed8",
  "癸": "#1d4ed8",
  "亥": "#1d4ed8",
  "子": "#1d4ed8",
};

export const YILORE_GANZHI_VI: Record<string, string> = {
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

export function formatGanZhiVi(gz: string): string {
  if (!gz) return "";
  return gz
    .split("")
    .map((ch) => YILORE_GANZHI_VI[ch] || ch)
    .join(" ")
    .trim();
}

export const YILORE_12_HOURS_ENERGY = [
  { branch: "Tý (子)", hour: "01", tenGodEn: "Chính Quan", tenGodVi: "Chính Quan", tenGodZh: "正官", score: 28, highlight: false },
  { branch: "Sửu (丑)", hour: "03", tenGodEn: "Chính Tài", tenGodVi: "Chính Tài", tenGodZh: "正财", score: 29, highlight: false },
  { branch: "Dần (寅)", hour: "05", tenGodEn: "Chính Quan", tenGodVi: "Chính Quan", tenGodZh: "正官", score: 86, highlight: true },
  { branch: "Mão (卯)", hour: "07", tenGodEn: "Thất Sát", tenGodVi: "Thất Sát", tenGodZh: "七杀", score: 78, highlight: true },
  { branch: "Thìn (辰)", hour: "09", tenGodEn: "Chính Ấn", tenGodVi: "Chính Ấn", tenGodZh: "正印", score: 30, highlight: false },
  { branch: "Tỵ (巳)", hour: "11", tenGodEn: "Thiên Ấn", tenGodVi: "Thiên Ấn", tenGodZh: "偏印", score: 72, highlight: true },
  { branch: "Ngọ (午)", hour: "13", tenGodEn: "Kiếp Tài", tenGodVi: "Kiếp Tài", tenGodZh: "劫财", score: 50, highlight: true },
  { branch: "Mùi (未)", hour: "15", tenGodEn: "Tỷ Kiên", tenGodVi: "Tỷ Kiên", tenGodZh: "比肩", score: 33, highlight: false },
  { branch: "Thân (申)", hour: "17", tenGodEn: "Thương Quan", tenGodVi: "Thương Quan", tenGodZh: "伤官", score: 68, highlight: true },
  { branch: "Dậu (酉)", hour: "19", tenGodEn: "Thực Thần", tenGodVi: "Thực Thần", tenGodZh: "食神", score: 64, highlight: false },
  { branch: "Tuất (戌)", hour: "21", tenGodEn: "Thiên Tài", tenGodVi: "Thiên Tài", tenGodZh: "偏财", score: 45, highlight: false },
  { branch: "Hợi (亥)", hour: "23", tenGodEn: "Thất Sát", tenGodVi: "Thất Sát", tenGodZh: "七杀", score: 35, highlight: false },
];

export const YILORE_STRATEGY_CATEGORIES = [
  "Tùy chỉnh",
  "Họp hành",
  "Phỏng vấn",
  "Tập trung",
  "Học tập",
  "Giao lưu",
  "Hẹn hò",
  "Ký hợp đồng",
  "Xuất hành",
  "Tài chính",
  "Mua sắm",
  "Chuyển nhà",
  "Sửa sang",
  "Khai trương",
  "Nghỉ ngơi",
  "Khác",
];

export const YILORE_DAILY_QUESTIONS = [
  "Vận trình sự nghiệp hôm nay của tôi thế nào?",
  "Hôm nay có thể mang đến điều bất ngờ gì?",
  "Chuyện tình cảm hôm nay của tôi ra sao?",
  "Hôm nay có phù hợp để đưa ra quyết định lớn không?",
  "Tài vận hôm nay của tôi như thế nào?",
  "Hôm nay tôi cần đặc biệt lưu ý điều gì?",
  "Các mối quan hệ xã giao hôm nay của tôi ra sao?",
  "Hôm nay có thuận lợi để đi xa / xuất hành không?",
  "Vận học tập và thi cử hôm nay thế nào?",
  "Hướng cát tường hôm nay của tôi là hướng nào?",
];

export const YILORE_INITIAL_PROFILE: YiloreUserProfile = {
  id: "c6e4506d-950b-419f-a372-01afe8dc49a5",
  ylId: "YL104062",
  email: "thedat.hk@gmail.com",
  userName: "d",
  gender: "male",
  birthDate: "1992-10-16",
  birthHour: 9,
  birthMinute: 0,
  birthplace: "Quảng Đông · Quảng Châu (广东 · 广州)",
  birthplaceLongitude: 113.2644,
  birthplaceLatitude: 23.1291,
  timezone: "Asia/Ho_Chi_Minh",
  trueSolarTime: false,
  lunarYear: "Năm Nhâm Thân (壬申年)",
  lunarMonth: 9,
  lunarDay: 21,
  lunarHour: "Giờ Tỵ (巳时)",
  bazi: ["壬申", "庚戌", "乙丑", "辛巳"],
  dayun: {
    previous: { startAge: 19, endAge: 28, startYear: 2010, endYear: 2019, ganZhi: "壬子" },
    current: { startAge: 29, endAge: 38, startYear: 2020, endYear: 2029, ganZhi: "癸丑" },
    next: { startAge: 39, endAge: 48, startYear: 2030, endYear: 2039, ganZhi: "甲寅" },
    startDescription: "Khởi vận sau 7 năm 4 tháng 10 ngày sinh",
  },
  destinyHexagram: {
    hexagramNumber: 18,
    binary: "011001",
    archetypeTitle: "Người Tái Thiết (Trùng Cấu Giả)",
    archetypeTitleZh: "重構者",
    cardTitleEn: "Tịnh Thủ Tảo Tích Trần",
    cardTitleZh: "淨手掃積塵",
    hexagramNameEn: "Sơn Phong Cổ (山風蠱)",
    hexagramNameZh: "山風蠱",
    descriptionEn:
      "Bạn không bao giờ né tránh nan đề. Với tầm nhìn xa và tinh thần trách nhiệm sâu sắc, bạn nhìn thấu tâm điểm của sự hỗn loạn để tái thiết trật tự. Bằng nhãn quan sắc bén và hành động quyết đoán, bạn chấn chỉnh những trì trệ cũ kỹ và kiến tạo giải pháp từ trong nghịch cảnh.",
    descriptionZh:
      "從不逃避問題，富有責任感和遠見，善於在混亂中洞悉本質，重構秩序，利用深刻的洞察力與堅定的行動力直面弊端，在絕境和混亂中找到解決辦法",
    descriptionVi:
      "Bạn không bao giờ né tránh nan đề. Với tầm nhìn xa và tinh thần trách nhiệm sâu sắc, bạn nhìn thấu tâm điểm của sự hỗn loạn để tái thiết trật tự. Bằng nhãn quan sắc bén và hành động quyết đoán, bạn chấn chỉnh những trì trệ cũ kỹ và kiến tạo giải pháp từ trong nghịch cảnh.",
    traitsEn: ["Trách nhiệm", "Kiên cường", "Quyết đoán"],
    traitsZh: ["擔當", "堅韌", "果決"],
    traitsVi: ["Trách nhiệm", "Kiên cường", "Quyết đoán"],
    frontImageUrl: "/assets/oss/18/18a.webp",
  },
  preHeavenGua: {
    binary: "001011",
    guaNameEn: "Phong Sơn Tiệm",
    guaNameZh: "風山漸",
    frontImageUrl: "/assets/oss/53/53a.webp",
    backImageUrl: "/assets/oss/53/53b.webp",
    panciZh: "幾度江邊釣，游魚未上鉤。瀟湘一片景，將久快心頭。",
  },
  postHeavenGua: {
    binary: "010001",
    guaNameEn: "Sơn Thủy Mông",
    guaNameZh: "山水蒙",
    frontImageUrl: "/assets/oss/4/4a.webp",
    backImageUrl: "/assets/oss/4/4b.webp",
    panciZh: "隔江驚曉不成危，木盡煙消總作灰。陽氣復來先報喜，雪含觀笑賞江梅。",
  },
  yuanTang: {
    position: 6,
    lineTextEn:
      "Thượng Cửu: Hồng tiệm vu lục, kỳ vũ khả dụng vi nghi, cát. (Chim hồng bay dần lên tầng cao, lông vũ dùng làm nghi trượng lễ nhạc, đại cát).",
    lineTextVi:
      "Thượng Cửu: Hồng tiệm vu lục, kỳ vũ khả dụng vi nghi, cát. (Chim hồng bay dần lên tầng mây cao, lông vũ của nó dùng làm nghi trượng lễ nhạc cao quý, đại cát).",
    lineTextZh: "上九，鴻漸于陸，其羽可用為儀，吉",
    frontImageUrl: "/assets/oss/53/53-6a.webp",
    backImageUrl: "/assets/oss/53/53-6b.webp",
  },
  lifeScript: {
    verseZh: "人存清远志，脱迹离尘埃。万里人扶上，端为庙廊材。",
    verseVi: "Người mang chí thanh viễn, thoát khỏi chốn bụi trần. Vạn dặm có quý nhân nâng đỡ, xứng bậc rường cột miếu đường.",
    verseEn:
      "Người mang chí thanh viễn, thoát khỏi chốn bụi trần. Vạn dặm có quý nhân nâng đỡ, xứng bậc rường cột miếu đường.",
  },
  dayPillarCard: {
    ganZhi: "Ất Sửu (乙丑)",
    archetypeZh: "雪原幽兰",
    archetypeEn: "Tuyết Nguyên U Lan (Hoa Lan Trên Cánh Đồng Tuyết)",
    archetypeVi: "Tuyết Nguyên U Lan (Hoa Lan Trên Cánh Đồng Tuyết)",
    poeticLineZh: "凌寒嫩蕊欺霜雪，冻土深根养暗金",
    poeticLineVi: "Nhụy non vượt giá lạnh coi thường sương tuyết, rễ sâu trong đất đóng băng nuôi dưỡng ánh kim ngầm.",
    introZh:
      "Như đóa u lan kiên cường nở rộ giữa vùng đất đóng băng mùa đông, đây là bản sắc tính cách giàu sức bền và tinh thần thực tế sâu sắc. Ất Mộc tuy mềm mại nhưng lại khắc chế được Sửu Thổ dưới chân, ẩn chứa sức sống và khả năng làm chủ đáng kinh ngạc.",
    tagsZh: ["#外柔内刚", "#务实隐忍", "#外圆内方"],
    tagsVi: ["#Ngoại nhu nội cương", "#Thực tế nhẫn nại", "#Ngoài tròn trong vuông"],
    tagsEn: ["#Ngoại nhu nội cương", "#Thực tế nhẫn nại", "#Ngoài tròn trong vuông"],
    imageUrl: "/yilore-cards/rizhu/2.webp",
  },
  credits: 0,
  dailyMessagesRemaining: 20,
  dailyMessagesLimit: 20,
};

export const YILORE_INITIAL_DAILY_RECORDS: YiloreDailyGuidanceRecord[] = [
  {
    id: "3c9064c8-2929-4ae0-8e94-8e624a9cbc78",
    drawnDate: "2026-10-20",
    hexagramNumber: 26,
    guaName: "Sơn Thiên Đại Súc (山天大蓄)",
    guaNameEn: "Sơn Thiên Đại Súc (Đại Súc)",
    guaNameVi: "Sơn Thiên Đại Súc",
    cardTitle: "Thần Ngưu Trấn Vân Điên (神牛鎮雲巔)",
    cardTitleEn: "Trâu Thần Trấn Đỉnh Mây",
    guaCi: "Lợi trinh, bất gia thực cát, lợi thiệp đại xuyên (利貞，不家食吉，利涉大川)",
    dailyGuidance: "Hôm nay hãy chuyên tâm vun bồi nội lực. Khi thời cơ chín muồi, nước chảy thành sông, đại sự tự thành.",
    dailyGuidanceEn: "Hôm nay hãy chuyên tâm vun bồi nội lực. Khi thời cơ chín muồi, nước chảy thành sông, đại sự tự thành.",
    dailyGuidanceVi: "Hôm nay hãy chuyên tâm vun bồi nội lực. Khi thời cơ chín muồi, nước chảy thành sông, đại sự tự khắc thành tựu.",
    keywords: ["Thu liễm phong mang", "Tĩnh đãi thời cơ"],
    dayBadge: "Ngày Tĩnh Tư",
    frontImageUrl: "/assets/oss/26/26a.webp",
    backImageUrl: "/assets/oss/26/26b.webp",
    followupHistory: [
      {
        id: "647921ea-bf4f-40b1-81a7-931aab08a2cd",
        question: "Vận trình sự nghiệp hôm nay thế nào?",
        answer:
          "Hôm nay ứng quẻ 「Sơn Thiên Đại Súc」, vận sự nghiệp tiến triển vững chắc. Lời khuyên cốt lõi là 「chuyên tâm vun bồi」: đây là thời điểm vàng để tích lũy thực lực, lắng đọng kinh nghiệm, không nên nóng vội cầu thành hay thay đổi liên tục. Hãy kiên nhẫn hoàn thiện từng việc đang làm, củng cố nền tảng thật vững, đợi thời cơ chín muồi ắt sẽ gặt hái thành quả xứng đáng.",
        createdAt: "2026-10-20 03:03",
      },
      {
        id: "b69c2229-5525-4f65-8028-0fbf63d819ae",
        question: "Xin chào",
        answer:
          "Chào bạn! Nếu bạn muốn tìm hiểu chi tiết hơn về vận trình hôm nay hoặc cần cân nhắc một quyết định quan trọng (như chuyển việc, hợp tác, đầu tư), hãy nhập câu hỏi cụ thể tại khung gieo quẻ ở **Sổ Tay Mệnh Lý** hoặc mục **Trò Chuyện** để Cửu Nhị lập quẻ Lục Hào luận giải chuyên sâu cho bạn.",
        createdAt: "2026-10-20 03:29",
      },
    ],
  },
  {
    id: "3aa94ef5-be9a-486e-94b0-2c0ee9d51d59",
    drawnDate: "2026-10-19",
    hexagramNumber: 39,
    guaName: "Thủy Sơn Kiển (水山蹇)",
    guaNameEn: "Thủy Sơn Kiển (Kiển)",
    guaNameVi: "Thủy Sơn Kiển",
    cardTitle: "Trí Giả Dừng Chân Trước Thác Băng",
    cardTitleEn: "Trí Giả Dừng Chân Trước Thác Băng",
    guaCi: "Lợi Tây Nam, bất lợi Đông Bắc. Lợi kiến đại nhân, trinh cát.",
    dailyGuidance: "Lối đi phía trước đang bị cản trở. Hãy tạm dừng, quán chiếu nội tâm, câu trả lời sẽ tự khắc hiển lộ.",
    dailyGuidanceEn: "Lối đi phía trước đang bị cản trở. Hãy tạm dừng, quán chiếu nội tâm, câu trả lời sẽ tự khắc hiển lộ.",
    dailyGuidanceVi: "Lối đi phía trước đang bị cản trở. Hãy tạm dừng, quán chiếu nội tâm, câu trả lời sẽ tự khắc hiển lộ.",
    keywords: ["Tiến thoái lưỡng nan", "Đợi thời mà động"],
    dayBadge: "Ngày Quy Phạm",
    frontImageUrl: "/assets/oss/39/39a.webp",
    backImageUrl: "/assets/oss/39/39b.webp",
    followupHistory: [],
  },
];

export const YILORE_INITIAL_HISTORY_RECORDS: YiloreReadingRecord[] = [
  {
    readingId: "16813bd0-b255-48bb-82f4-bdb5967105ec",
    question: "Trạng thái hiện tại đã ổn định chưa?",
    createdAt: "2026-10-20 03:15",
    summaryHighlight: "Bề ngoài dao động nhưng thực chất đang sát ngưỡng chuyển mình; mấu chốt là chế ngự lo âu và giữ vững nhịp độ.",
    summaryBrief:
      "**Bạn không phải đang bất ổn, mà đang ở nhịp rung chuyển ngay trước khi đột phá**\n\nBạn cảm thấy chênh vênh vì đã đi đến cuối giai đoạn cũ trong khi trạng thái mới chưa kịp định hình hoàn toàn. Giống như chú cáo nhỏ đã đặt được chân trước lên bờ nhưng đuôi vẫn còn vướng dưới dòng nước — đây không phải là thất bại, mà là khoảnh khắc lơ lửng tất yếu của sự lột xác.\n\nHai hào động hé lộ hai luồng giằng xé trong nội tâm bạn: một là Hào Lục Tam *'tiến thoái lưỡng nan'*, nhắc rằng lối mòn cũ đã khép lại, không thể dùng cách cũ để cố sức xông pha; hai là Hào Thượng Cửu *'ẩm tửu nhu thủ'*, nhắc rằng gần đây bạn vừa hoàn tất một cột mốc bước đầu nên có phần chùng xuống hoặc tự hoài nghi: *'Liệu mình có đang quá vội không?'*\n\nNhưng quẻ tượng nói rất rõ: bạn không đi sai hướng, chỉ là bạn đi nhanh hơn nhịp phản hồi của hoàn cảnh bên ngoài. Chi quái Lôi Phong Hằng — tựa hình ảnh đôi vợ chồng tóc bạc tĩnh tọa dưới gốc cây cổ thụ — nhắn nhủ rằng sự ổn định chân chính không phải là mặt hồ không gợn sóng, mà là **giữa muôn trùng biến động vẫn kiên định giữ vững phương hướng**.\n\n**Khuyến nghị hành động: Tạm ngừng thúc ép, chuyển sang quan sát và chuẩn bị**\n\nThay vì thấp thỏm chờ đợi đối phương hồi âm, hãy dành tâm sức hệ thống lại những thành quả đã có và tối ưu hóa phương án cho bước kế tiếp. Hãy xem khoảng lặng này là quãng nghỉ lấy đà, nhưng đừng buông lơi cảnh giác.\n\n**Khuyến nghị tâm thức: Định nghĩa lại 'sự bất định' thành 'giai đoạn ấp ủ'**\n\nĐiều khiến bạn bất an không phải bản thân sự thay đổi, mà là chưa nhìn thấy kết quả cuối cùng. Nhưng sau Vị Tế là Hằng, chứng tỏ đợt sóng gió này rốt cuộc sẽ dẫn tới một nền tảng bền vững lâu dài.",
    baziAnalysis:
      "Đại vận hiện tại Quý Sửu (29–38 tuổi) phục ngâm với Nhật trụ Ất Sửu, chủ về áp lực nội tâm và sự giằng co lặp đi lặp lại, cảm xúc dễ chịu tác động từ biến động bên ngoài. Quý Thủy Thiên Ấn lộ rõ khiến tư duy nhạy bén nhưng dễ suy nghĩ quá nhiều trước sự bất định. Tuy nhiên, Trụ Giờ Tân Tỵ ẩn tàng Bính Hỏa Thương Quan — nguồn sáng tạo và khả năng biểu đạt giúp phá vỡ thế bế tắc, mấu chốt nằm ở việc chuyển hóa nỗi lo âu thành chiến lược hành động rõ ràng.",
    suggestedFollowups: [
      "Làm sao phân biệt sự chậm trễ của đối phương là đang trì hoãn hay thực sự vượt quá khả năng của họ?",
      "Biến động của môi trường bên ngoài hiện tại là rủi ro hay cơ hội ẩn giấu?",
      "Nếu cần chủ động phá vỡ thế giằng co, tôi nên bắt đầu từ bước cụ thể nào?",
    ],
    benGua: {
      position: 64,
      name: "Hỏa Thủy Vị Tế (火水未济)",
      nameVi: "Hỏa Thủy Vị Tế",
      title: "Hiện trạng · Sát ngưỡng thành công",
      guaCi: "Hanh, tiểu hồ ngật tế, nhu kỳ vĩ, vô du lợi (亨，小狐汔济，濡其尾，无攸利)",
      brief:
        "Bạn hiện giống như chú cáo nhỏ sắp bước lên bờ: đích đến đã ở ngay trước mắt nhưng chiếc đuôi vẫn còn thấm nước, bị những lực cản vô hình níu giữ.\n\nTrạng thái này không phải là thất bại, mà là nhịp chấn động tất yếu trước bước nhảy cuối cùng. Kế hoạch liên tục xê dịch, lòng người cũng dễ chao đảo, nhưng hãy hiểu rằng sự hỗn độn chính là diện mạo thật của giai đoạn chuyển giao. Cơ hội chuyển mình nằm ở việc bạn có giữ được nhịp điệu riêng giữa dòng biến động hay không.",
      detailExplain:
        "Quẻ Hỏa Thủy Vị Tế có Ly ở trên, Khảm ở dưới; lửa bốc lên trên, nước chảy xuống dưới, hai khí chưa giao hòa, tượng trưng cho việc lớn chưa hoàn tất. Lời quẻ 'Tiểu hồ ngật tế, nhu kỳ vĩ' (Cáo nhỏ sắp qua sông, làm ướt đuôi) khắc họa đúng hoàn cảnh hiện tại: đã rất gần thành công nhưng dễ vì một chút sơ suất cuối cùng hoặc ngoại lực làm gián đoạn.\n\nTrong hình tượng thẻ bài Cửu Nhị, chú cáo nhỏ đã chạm chân lên bờ nhưng đuôi còn vướng nước — đó chính là tượng 'công thành thùy thành' (sắp sửa thành công). Lúc này kỵ nhất là nóng vội mạo tiến, cũng kỵ vì chờ đợi mà buông lơi. Đạo của quẻ Vị Tế quý ở chỗ biết hiểm mà cẩn trọng, lấy tĩnh chế động, thiết lập trật tự nội tâm giữa cảnh hỗn mang.",
      frontUrl: "/assets/oss/64/64a.webp",
      backUrl: "/assets/oss/64/64b.webp",
      lines: [8, 7, 6, 7, 8, 9],
    },
    zhiGua: {
      position: 32,
      name: "Lôi Phong Hằng (雷风恒)",
      nameVi: "Lôi Phong Hằng",
      title: "Xu hướng · Tĩnh thủ bền lâu",
      guaCi: "Hằng, hanh, vô cữu, lợi trinh, lợi hữu du vãng (恒，亨，无咎，利贞，利有攸往)",
      brief:
        "Quẻ Hằng tựa như cội cổ thụ rễ sâu lá bền, chẳng vì gió mưa mà lay chuyển. Quẻ nhắc bạn rằng sự ổn định thực sự không phải là không có sóng gió, mà là giữa sóng gió vẫn giữ vững giá trị cốt lõi.\n\nSự xáo trộn bạn đang trải qua cuối cùng sẽ dẫn về một trạng thái bền vững sâu sắc hơn — với điều kiện bạn kiên tâm đi qua giai đoạn chuyển tiếp này.",
      detailExplain:
        "Quẻ Lôi Phong Hằng có Chấn ở trên, Tốn ở dưới; sấm rền gió thổi, hai khí tương trợ cùng chiều nên có thể bền lâu. Lời quẻ 'Lợi hữu du vãng' chỉ rõ: chỉ cần phương hướng đúng đắn, việc kiên trì tiến bước ắt mang lại lợi ích.\n\nĐối lập với cái 'chưa thành' của Vị Tế, quẻ Hằng nhấn mạnh 'đạo có thể lâu dài'. Chi quái biến sang Hằng báo hiệu sự bất ổn hiện tại chỉ là bề nổi, xu hướng chung đang tiến dần về sự ổn định vững chắc. Hình ảnh đôi vợ chồng tóc bạc tĩnh tọa dưới gốc cây trên thẻ bài Cửu Nhị chính là biểu tượng của sự 'tĩnh thủ đãi thời' — không nóng vội vì biết thời gian sẽ chứng minh tất cả.",
      frontUrl: "/assets/oss/32/32a.webp",
      backUrl: "/assets/oss/32/32b.webp",
    },
    yaoList: [
      {
        position: 3,
        lineName: "Lục Tam (Hào 3 động): Vị tế, chinh hung, lợi siệp đại xuyên",
        yaoTitle: "Khốn cảnh · Ngã rẽ ngập ngừng",
        yaoCi: "Vị tế, chinh hung, lợi siệp đại xuyên (未濟，征凶，利涉大川)",
        brief:
          "Bạn đang mắc kẹt trên một lối đi nhìn như thông suốt nhưng thực chất đã nghẽn; nếu cứ cố lao về phía trước theo quán tính sẽ chỉ hao tổn thêm tâm lực.\n\nGiống như đoàn thương nhân gặp đá lở chắn ngang đường núi, việc tìm lối vòng hoặc tạm lùi lại không phải là nhụt chí, mà là trí tuệ. Điều cần nhất lúc này là **dứt khoát từ bỏ cách làm cũ kém hiệu quả**.",
        detailExplain:
          "Lời hào Lục Tam 'Vị tế, chinh hung, lợi siệp đại xuyên' bề ngoài tưởng như mâu thuẫn nhưng ẩn chứa thâm ý: khi thời thế chưa hội đủ, cưỡng cầu tiến đánh (chinh) ắt gặp hung hiểm; nhưng nếu nhìn thẳng vào thực tế và dám chuyển hướng sang một cuộc cải tổ căn cơ hơn (lợi siệp đại xuyên) thì lại mở ra sinh lộ.\n\nHào Lục Tam âm cư dương vị, bất trung bất chính, phản ánh phương thức hành động hiện tại chưa tương xứng với vị thế. Hãy chủ động điều chỉnh chiến lược thay vì cố chấp bám vào lối cũ.",
        frontUrl: "/assets/oss/64/64-3a.webp",
        backUrl: "/assets/oss/64/64-3b.webp",
      },
      {
        position: 6,
        lineName: "Thượng Cửu (Hào 6 động): Hữu phu vu ẩm tửu, vô cữu. Nhu kỳ thủ, hữu phu thất thị",
        yaoTitle: "Cảnh báo · Giữ chừng mực khi đắc ý",
        yaoCi: "Hữu phu vu ẩm tửu, vô cữu. Nhu kỳ thủ, hữu phu thất thị (有孚于飲酒，无咎。濡其首，有孚失是)",
        brief:
          "Gần đây bạn có thể vừa hoàn thành một phần việc quan trọng nên tâm lý có phần nhẹ nhõm hoặc chủ quan, nhưng rủi ro lại ẩn ngay trong sự buông lỏng ấy.\n\nRượu tràn ướt mũ áo tưởng như chuyện nhỏ, nhưng ám chỉ bạn có thể đang bỏ sót một chi tiết then chốt hoặc mất đi sự chuẩn mực cần thiết. Hãy tỉnh táo hoàn tất khâu cuối cùng.",
        detailExplain:
          "Lời hào Thượng Cửu khẳng định ở vế đầu: bạn có uy tín, có thành quả bước đầu nên có thể an tâm nghỉ ngơi ('hữu phu vu ẩm tửu, vô cữu'); nhưng vế sau cảnh báo: nếu vì vui mừng quá đà mà mất đi sự tỉnh táo ('nhu kỳ thủ') thì sẽ đánh mất chừng mực đúng đắn ('hữu phu thất thị').\n\nLà hào cuối cùng của quẻ Vị Tế, đây là giai đoạn nghiệm thu thành quả. Tuyệt đối tránh tự mãn, hãy giữ đầu óc sáng suốt để chuẩn bị sẵn phương án dự phòng và khép lại chu kỳ cũ một cách trọn vẹn.",
        frontUrl: "/assets/oss/64/64-6a.webp",
        backUrl: "/assets/oss/64/64-6b.webp",
      },
    ],
  },
  {
    readingId: "b72d4ac3-30ce-4125-b707-d9140c2b0722",
    question: "Hành động hiện tại của tôi có đúng đắn không?",
    createdAt: "2026-10-20 02:27",
    summaryHighlight: "Phương hướng hành động đã lệch nhịp; ngắn hạn nên tạm lùi giữ sức để tránh họa, tái lập quyền chỉ huy là chìa khóa chuyển mình.",
    summaryBrief:
      "**Hành động đã chệch khỏi quỹ đạo chuẩn, nhưng bạn đã kịp nhận ra nguy cơ** — đó là lý do quẻ tượng đồng thời xuất hiện cả *'Dư thi chi hung'* (Hào 3) và *'Tả thứ vô cữu'* (Hào 4). Bạn không sai ở nỗ lực hành động, mà lệch ở hai câu hỏi gốc rễ: *'Ai đang thực sự cầm trịch?'* và *'Chúng ta chiến đấu vì mục tiêu gì?'*. Cảm giác mệt mỏi hiện tại là lời cảnh báo rằng nguồn lực đang bị tiêu hao vô ích.\n\n**Cơ hội chuyển mình không nằm ở việc cố tiến lên, mà ở việc tái lập kỷ cương chỉ huy**. Bạn cần tạm dừng đà thúc ép, làm rõ ai mới là 'Trượng nhân' (người cầm cân nảy mực có đủ uy tín và tầm nhìn) trong cục diện này. Nếu không giải quyết triệt để bài toán phân quyền và đồng thuận, mọi nỗ lực tiếp theo chỉ lặp lại sự hao tổn.\n\n**Tầng tâm thức: Buông bỏ chấp niệm 'phải thắng ngay lập tức'**. Sứ mệnh của bạn lúc này không phải là đánh nhanh thắng nhanh, mà là giữ vững nguyên tắc và bảo toàn đội ngũ. Lùi một bước không phải là thua cuộc, mà là rút tài nguyên khỏi cuộc chiến tiêu hao.\n\n**Tầng hành động: Khởi động quy trình 'Củng cố doanh trại'**. Giống như đạo quân rút lui có trật tự trên thẻ bài Cửu Nhị, hãy thiết lập nhịp phòng thủ rõ ràng: tạm dừng các hạng mục ngoài cốt lõi, phân định lại ranh giới trách nhiệm và thống nhất lại mục tiêu tối thượng trước khi xuất quân trở lại.",
    baziAnalysis:
      "Đại vận Quý Sửu phục ngâm với Nhật trụ Ất Sửu, chủ về áp lực nội tại và những vòng lặp thử thách có tính chu kỳ; hành động dễ bị quán tính cũ trói buộc. Cần đặc biệt lưu ý tránh rơi vào lối mòn tư duy hoặc để sự phân tán quyền lực ngầm trong tập thể làm hao tổn nguyên khí.",
    suggestedFollowups: [
      "Làm thế nào để nhận diện đúng nút thắt hoặc cơ chế đang cản trở việc ra quyết định?",
      "Giới hạn an toàn và thời hạn của bước lùi chiến lược này là bao lâu?",
      "Hành động hiện tại có còn phục vụ đúng mục tiêu chính đáng ban đầu của tôi không?",
    ],
    benGua: {
      position: 7,
      name: "Địa Thủy Sư (地水師)",
      nameVi: "Địa Thủy Sư",
      title: "Hiện trạng · Hiệu lệnh phân tán",
      guaCi: "Trinh, trượng nhân cát, vô cữu (貞，丈人吉，無咎)",
      brief:
        "Bạn đang ở thời điểm then chốt đòi hỏi sự điều phối và thống lĩnh chặt chẽ, nhưng cục diện đã xuất hiện dấu hiệu lệch nhịp. Đây không phải cửa ải có thể vượt qua chỉ bằng ý chí cá nhân, mà là vấn đề cấu trúc: hiệu lệnh thiếu thống nhất khiến hành động tập thể sa lầy.\n\nHình tượng vị lão tướng quân trong quẻ Sư đại diện cho năng lực lãnh đạo chân chính: điềm tĩnh, uy vọng và đặt đại cục lên hàng đầu. Hãy kiểm tra lại xem liệu ngọn cờ chỉ huy có đang bị phân tán hay không.",
      detailExplain:
        "Quẻ Địa Thủy Sư nhấn mạnh 'Trinh, trượng nhân cát, vô cữu' — chỉ khi có bậc trưởng thượng dày dạn kinh nghiệm và giữ vững chính đạo thống lĩnh thì mới cát tường, không mắc lỗi. Quẻ này không phù hợp với chủ nghĩa anh hùng cá nhân mà đòi hỏi kỷ luật và ý chí tập thể thống nhất.\n\nHình ảnh 'Tướng quân lĩnh vạn sĩ' đối lập với lá cờ chiến bị xé lẻ trên thẻ bài Cửu Nhị nhắc nhở: bạn có tiềm năng gắn kết đội ngũ, nhưng thực tế đang tồn tại sự phân tán quyền quyết định hoặc bất đồng quan điểm. Nếu không chấn chỉnh cấu trúc này, sĩ khí mạnh đến đâu cũng dễ bị bào mòn.",
      frontUrl: "/assets/oss/7/7a.webp",
      backUrl: "/assets/oss/7/7b.webp",
      lines: [8, 7, 6, 6, 8, 8],
    },
    zhiGua: {
      position: 32,
      name: "Lôi Phong Hằng (雷風恆)",
      nameVi: "Lôi Phong Hằng",
      title: "Chung cục · Đạo bền lâu",
      guaCi: "Hằng, hanh, vô cữu, lợi trinh, lợi hữu du vãng (恆，亨，無咎，利貞，利有攸往)",
      brief:
        "Chi quái Lôi Phong Hằng hé lộ đích đến cuối cùng của bạn không phải là một chiến thắng chớp nhoáng, mà là một 'trạng thái hằng cửu' — một cấu trúc ổn định, bền bỉ và chịu được thử thách của thời gian.\n\nNhững va vấp và bước lùi chiến lược hiện tại đều nhằm phục vụ cho việc kiến tạo nền móng vững chắc lâu dài về sau.",
      detailExplain:
        "Quẻ Lôi Phong Hằng có Chấn trên Tốn dưới, sấm động gió hành, hai khí tương trợ cùng chiều nên giữ được sự bền bỉ lâu dài. Lời quẻ nhấn mạnh 'Lợi hữu du vãng' trên nền tảng 'Lợi trinh' — kiên thủ chính đạo.\n\nĐối chiếu với sự khốc liệt của chiến trường quẻ Sư, hình ảnh đôi vợ chồng tóc bạc tĩnh tọa dưới cội cổ thụ ở quẻ Hằng báo hiệu: bạn sẽ chuyển hóa từ trạng thái xung đột của 'Sư' sang sự hài hòa bền vững của 'Hằng', miễn là rút ra bài học từ Hào 3 và thực thi bước lùi chiến thuật ở Hào 4.",
      frontUrl: "/assets/oss/32/32a.webp",
      backUrl: "/assets/oss/32/32b.webp",
    },
    yaoList: [
      {
        position: 3,
        lineName: "Lục Tam (Hào 3 động): Sư hoặc dư thi, hung",
        yaoTitle: "Nguy cơ · Hiệu lệnh bất nhất",
        yaoCi: "Sư hoặc dư thi, hung (師或輿尸，凶)",
        brief:
          "Bạn đang đối mặt với nguy cơ tổn thất lớn mà nguyên nhân gốc rễ không nằm ở năng lực yếu kém, mà ở 'tướng lệnh bất nhất' — hệ thống chỉ huy bị phân mảnh khiến hành động tiêu hao tài nguyên vô ích.\n\nHãy nhìn thẳng vào thực tế: sự bế tắc này mang tính cấu trúc, cần lập tức chấm dứt các hành động làm hao mòn nội lực.",
        detailExplain:
          "Hào Lục Tam 'Sư hoặc dư thi, hung' — Tượng truyền giải thích: 'Sư hoặc dư thi, đại vô công dã' (Ra quân mà chở thây về là hoàn toàn không có công trạng). Hào này âm cư dương vị ở cực điểm nội quái, vị thế bất chính, tượng trưng cho người cầm quyền hoặc quyết sách hiện tại danh chưa chính, ngôn chưa thuận.\n\nHình ảnh hai ngọn cờ chiến quất vào nhau giữa trời giông bão trên thẻ bài Cửu Nhị cảnh báo sự đối lập nội bộ. Tiếp tục thúc ép lúc này chỉ làm sâu thêm tổn thất, cần dừng ngay các hoạt động gây nội hao.",
        frontUrl: "/assets/oss/7/7-3a.webp",
        backUrl: "/assets/oss/7/7-3b.webp",
      },
      {
        position: 4,
        lineName: "Lục Tứ (Hào 4 động): Sư tả thứ, vô cữu",
        yaoTitle: "Chuyển cơ · Lấy lùi làm tiến",
        yaoCi: "Sư tả thứ, vô cữu (師左次，無咎)",
        brief:
          "Bạn lựa chọn tạm lùi về phòng thủ — đây không phải sự yếu mềm, mà là phán đoán chiến lược vô cùng tỉnh táo. Biết rõ thế cuộc trước mắt chưa thuận, chủ động rút về củng cố trận địa sẽ giúp bảo toàn nguyên khí cho tương lai.\n\nĐội quân rút lui nhịp nhàng, đào hào đắp lũy cho thấy bạn vẫn nắm quyền chủ động và đang chuyển hóa nguồn lực từ tiền tuyến xung đột về xây dựng nền tảng cốt lõi.",
        detailExplain:
          "Hào Lục Tứ 'Sư tả thứ, vô cữu' — Tượng truyền viết: 'Tả thứ vô cữu, vị thất thường dã'. 'Tả thứ' là thuật ngữ binh pháp cổ chỉ việc đóng quân ở thế đất cao phía sau để phòng thủ theo đúng quy tắc nhà binh. Hào Lục Tứ âm cư âm vị, đắc chính ở đầu ngoại quái, tượng trưng cho sự rút lui có trật tự và tiết chế.\n\nĐặt cạnh chiến trường hỗn loạn của Hào 3, bước lùi ở Hào 4 chứng tỏ bạn đã vượt lên trên sự bốc đồng cảm xúc để quy hoạch tương lai bằng lý trí. Bước điều chỉnh này không những không có lỗi ('vô cữu') mà còn là khởi điểm xoay chuyển cục diện.",
        frontUrl: "/assets/oss/7/7-4a.webp",
        backUrl: "/assets/oss/7/7-4b.webp",
      },
    ],
  },
];

export const YILORE_INITIAL_CONVERSATIONS: YiloreConversation[] = [
  {
    id: "592076b9-e879-4835-8fa9-e74cd8a55ad7",
    title: "Lời chào & Luận giải quẻ",
    updatedAt: "10/20 04:47",
    activePersonIds: [],
    activeReportIds: ["b72d4ac3-30ce-4125-b707-d9140c2b0722", "16813bd0-b255-48bb-82f4-bdb5967105ec"],
    messages: [
      {
        id: "7fe8db63-734b-4ab9-8f74-e432bad6e2bb",
        role: "user",
        content: "Xin chào",
        timestamp: "10/20 03:17",
      },
      {
        id: "33a3e3d6-2e86-418e-97c0-762e202f5ff9",
        role: "user",
        content: "Tôi vừa rút một quẻ linh xâm Kinh Dịch",
        timestamp: "10/20 03:17",
      },
      {
        id: "7147625f-e8b3-44f5-89b3-57aefe64bba5",
        role: "assistant",
        content:
          "Xin chào, tôi là Cửu Nhị AI (玖貳).\n\nGần đây có điều gì đang khiến bạn băn khoăn trăn trở hay muốn cùng tôi luận bàn sâu hơn không?",
        timestamp: "10/20 03:17",
      },
      {
        id: "27cc2b51-387f-48f6-9271-44f0b5bf8985",
        role: "assistant",
        content: "【Linh Xâm】Sơn Thủy Mông · Ấu Đồng Quan Sơn Tuyền (Trung Bình)",
        timestamp: "10/20 03:17",
        type: "lot_card",
        lotHexagramNumber: 4,
        quickLot: {
          position: 4,
          guaName: "Sơn Thủy Mông",
          cardTitle: "Ấu Đồng Quan Sơn Tuyền",
          guaCi: "Hanh. Phỉ ngã cầu đồng mông, đồng mông cầu ngã. Sơ thệ cáo, tái tam độc, độc tắc bất cáo. Lợi trinh.",
          luckTier: "中平",
          frontUrl: "/assets/oss/4/4a.webp",
          backUrl: "/assets/oss/4/4b.webp",
        },
      },
      {
        id: "a8b70ade-91a1-46bb-a7af-cff852719ea8",
        role: "assistant",
        content:
          "Quẻ xâm **「Sơn Thủy Mông」** này thuộc bậc **Trung Bình**.\n\nNói một cách ngắn gọn, đây là giai đoạn của sự **「Khai mông」** và **「Học hỏi」**. Giống như đứa trẻ đứng dưới chân núi ngắm nhìn dòng suối nguồn: tuy làn nước trong trẻo nhưng mạch nguồn từ đâu và chảy về đâu vẫn chưa tỏ tường.\n\nCâu then chốt nhất trong Thoán từ là: *「Phỉ ngã cầu đồng mông, đồng mông cầu ngã」* — nghĩa là hiện tại bạn cần chủ động tìm kiếm tri thức và thỉnh giáo bậc thầy, người đi trước với tấm lòng chân thành. Nếu giữ tâm chí thành thì ngay lần đầu sẽ nhận được chỉ dẫn sáng rõ; ngược lại, nếu hoài nghi do dự, hỏi đi hỏi lại một cách thiếu tập trung (*tái tam độc*) thì sẽ không thể tìm thấy câu trả lời.\n\nQuẻ này thường ám chỉ bạn đang đứng trước tình trạng bất cân xứng thông tin hoặc chưa nhìn thấu toàn cục. Đừng vội vàng đưa ra quyết định lớn lúc này; hãy quan sát, lắng nghe và tìm hiểu kỹ ngọn ngành trước.\n\nGần đây bạn có đang gặp chuyện gì khiến mình cảm thấy 'chưa nhìn thấu' không?",
        timestamp: "10/20 03:17",
      },
      {
        id: "6106dde3-b00c-45b8-a1e2-8cfa37a741be",
        role: "user",
        content: "📜 Hãy giúp tôi hiểu báo cáo này #",
        timestamp: "10/20 03:17",
      },
      {
        id: "31d796c4-56e4-48da-9c3d-dc3d73390ab7",
        role: "assistant",
        content:
          "Được chứ, chúng ta cùng xem kỹ nhé.\n\nBạn muốn phân tích sâu hơn về quẻ xâm **「Sơn Thủy Mông」** vừa rút hay một báo cáo Lục Hào / Bát Tự cụ thể nào? Bạn có thể chọn báo cáo bằng nút **#Báo cáo** bên dưới hoặc cho tôi biết phần bạn quan tâm nhất (vận thế, hành động nên làm, hay ý nghĩa từng hào). Tôi sẽ bóc tách thật rõ ràng, dễ hiểu và sát thực tế cho bạn.",
        timestamp: "10/20 03:17",
      },
      {
        id: "18992201-4237-42fc-9631-0ba50db8d646",
        role: "user",
        content: "Rút cho tôi một quẻ với câu hỏi: Tôi làm vậy có đúng không?",
        timestamp: "10/20 03:25",
      },
      {
        id: "42151836-ddcc-4329-b6f1-b80fa5450e6a",
        role: "assistant",
        content:
          "Khi bạn hỏi *「Tôi làm vậy có đúng không?」*, điều đó thường cho thấy bạn đã có sẵn một quyết định hoặc hành động trong lòng nhưng vẫn cần một sự xác chứng khách quan.\n\nVì bạn thành tâm đặt câu hỏi, chúng ta hãy dùng **Lục Hào Kinh Dịch** để xem xét kỹ xu hướng và lợi hại của việc này.",
        timestamp: "10/20 03:25",
      },
      {
        id: "78ca2826-5ca4-4327-9461-218bd46d959e",
        role: "user",
        content: "Không bổ sung thêm thông tin bối cảnh, gieo quẻ trực tiếp",
        timestamp: "10/20 03:26",
      },
      {
        id: "207bf6d8-ccfe-497b-b0d2-b69e36f77f17",
        role: "assistant",
        content:
          "Kết quả gieo quẻ lần này:\nBản quái là **Địa Thủy Sư**, Chi quái là **Lôi Phong Hằng**, có 2 hào động (Hào 3 và Hào 4).",
        timestamp: "10/20 03:26",
      },
      {
        id: "6ae577e3-c0e6-4fb8-b68d-e569b0e27f2c",
        role: "assistant",
        content:
          "📊 Báo cáo Luận Giải Hiện Trạng: Phương hướng hành động đã lệch nhịp; ngắn hạn nên tạm lùi giữ sức để tránh họa, tái lập quyền chỉ huy là chìa khóa chuyển mình.",
        timestamp: "10/20 03:27",
        type: "divination_result",
        divinationRecord: YILORE_INITIAL_HISTORY_RECORDS[1],
      },
      {
        id: "74cf60a3-1c5b-4aed-883b-939d148cda7b",
        role: "assistant",
        content:
          "Báo cáo này chỉ ra rất thẳng thắn: **Hành động hiện tại của bạn đang bị lệch hướng.**\n\nQuẻ tượng là **「Địa Thủy Sư」** biến **「Lôi Phong Hằng」**. Quẻ Sư nói về việc cầm quân ra trận, nhưng hai hào động của bạn lại rơi vào Lục Tam và Lục Tứ:\n• **Lục Tam 「Sư hoặc dư thi, hung」**: Đây là lời cảnh báo rất nghiêm khắc. Trong quân ngũ, nếu hiệu lệnh bất nhất hoặc giao quyền chỉ huy cho người không phù hợp thì ắt dẫn đến thất bại nặng nề. Đối chiếu vào hoàn cảnh của bạn, có thể bạn đang cố gồng gánh hoặc dùng sai phương pháp, sai tâm thế để xử lý vấn đề, gây nội hao lớn.\n• **Lục Tứ 「Sư tả thứ, vô cữu」**: Đây chính là điểm chuyển cơ. *「Tả thứ」* nghĩa là tạm lùi quân về vị trí an toàn để chỉnh đốn đội ngũ. Quẻ nhắn nhủ rằng lùi một bước, tạm dừng lại lúc này không phải là thất bại, mà là cách duy nhất để tránh họa (*vô cữu*) và tái lập lại quyền chủ động.",
        timestamp: "10/20 03:27",
      },
      {
        id: "7e37dd09-de03-44f0-a465-18817f281933",
        role: "user",
        content: "✨ Hãy giúp tôi gieo quẻ Kinh Dịch:",
        timestamp: "10/20 03:30",
      },
      {
        id: "44016dc1-247d-4b55-bfa7-6d7095b676cf",
        role: "assistant",
        content:
          "Khi bạn chọn gieo quẻ trực tiếp, quẻ tượng sẽ phản ánh ngay trạng thái năng lượng hiện tại của bạn.\n\nKết quả quẻ:\n**Bản quái: Địa Thủy Sư**, **Chi quái: Lôi Phong Hằng**, Hào động: **Lục Tam, Lục Tứ**.\n\nThông điệp cốt lõi rất rõ ràng: hãy tạm ngưng các hoạt động gây tiêu hao vô ích (*Lục Tam*), chủ động thu quân về củng cố nền tảng và thống nhất lại quyền quyết định (*Lục Tứ*) để tiến tới sự ổn định lâu dài (*Lôi Phong Hằng*).",
        timestamp: "10/20 03:30",
      },
      {
        id: "f7aba655-81f6-4f33-9a96-dbfbc8e1ac84",
        role: "user",
        content: "Tôi vừa rút một quẻ linh xâm Kinh Dịch",
        timestamp: "10/20 03:30",
      },
      {
        id: "6c1e2ba5-4458-417e-b82a-9ea9f4e506c9",
        role: "assistant",
        content: "【Linh Xâm】Trạch Thủy Khốn · Du Long Khốn Thiển Than (Hạ Xâm)",
        timestamp: "10/20 03:30",
        type: "lot_card",
        lotHexagramNumber: 47,
        quickLot: {
          position: 47,
          guaName: "Trạch Thủy Khốn",
          cardTitle: "Du Long Khốn Thiển Than",
          guaCi: "Hanh, trinh, đại nhân cát, vô cữu, hữu ngôn bất tín.",
          luckTier: "下签",
          frontUrl: "/assets/oss/47/47a.webp",
          backUrl: "/assets/oss/47/47b.webp",
        },
      },
      {
        id: "ea36f5bf-8ab8-4037-86b8-c15ad9f83c88",
        role: "assistant",
        content:
          "Quẻ xâm **「Trạch Thủy Khốn」** này thuộc bậc **Hạ Xâm**.\n\nNói một cách ngắn gọn, đây là giai đoạn của sự **「Bị kìm hãm」** và **「Thử thách bản lĩnh」**. Giống như rồng mắc cạn nơi bãi nông: dù mang tài năng lớn nhưng nhất thời chưa có đủ nước để vẫy vùng.\n\nCâu đáng lưu ý nhất trong Thoán từ là: *「Hữu ngôn bất tín」* (Có lời nói ra cũng chẳng được tin). Nghĩa là hiện tại dù bạn có cố gắng giải thích cặn kẽ đến đâu, người khác cũng khó lòng tiếp nhận. Không phải vì bạn nói sai, mà vì hoàn cảnh hoặc tâm thế đối phương đang ở trạng thái khép kín.\n\nTuy nhiên, đây tuyệt nhiên không phải đường cùng, bởi lời quẻ khẳng định: *「Đại nhân cát, vô cữu」*. Chỉ những người giữ được sự điềm tĩnh, không sốt ruột biện bạch và kiên định với nguyên tắc (*trinh*) mới có thể vượt qua vùng trũng này để đón nhận cát tường.\n\n**Lời khuyên dành cho bạn:**\n1. **Kiệm lời, chuyên tâm hành động**: Hiện không phải thời điểm thuận lợi để tranh biện hay tìm kiếm sự công nhận. Hãy tiết kiệm lời nói và dồn tâm sức mài giũa năng lực cốt lõi.\n2. **Chấp nhận thực tế khách quan**: Đừng cố vùng vẫy cưỡng cầu khi thế cuộc đang nghẽn.\n3. **Tĩnh tâm đợi thời**: Sau quẻ Khốn là quẻ Tỉnh (Giếng nước), báo hiệu nguồn lực sẽ dần tuôn chảy trở lại. Sự nhẫn nại lúc này chính là bước tích lũy cho màn bứt phá về sau.",
        timestamp: "10/20 03:30",
      },
      {
        id: "3e2765b5-acb5-4119-8459-d4f1b1bd4738",
        role: "user",
        content: "💬 Hãy giúp tôi phân tích hợp bàn mối quan hệ @",
        timestamp: "10/20 03:43",
      },
      {
        id: "b8ce43f9-abd1-413b-9427-c0cef3fd6db0",
        role: "assistant",
        content:
          "Để phân tích hợp bàn mối quan hệ (Bát Tự & Quẻ Dịch), tôi cần thông tin của người kia.\n\nBạn hãy cho tôi biết:\n1. **Tên gọi / Biệt danh**\n2. **Giới tính**\n3. **Ngày tháng năm sinh và giờ sinh** (Dương lịch; nếu không rõ giờ sinh có thể chỉ cung cấp ngày sinh)\n\nHoặc nếu bạn đã lưu hồ sơ của người đó trong mục **Hồ Sơ Quan Hệ**, hãy nhấn nút **@Quan hệ** để chọn trực tiếp!",
        timestamp: "10/20 03:43",
      },
      {
        id: "1e68d6e5-7d9e-4379-9dea-48ac55f353aa",
        role: "user",
        content: "📜 Hãy giúp tôi luận giải báo cáo này #",
        timestamp: "10/20 03:43",
      },
      {
        id: "1d5ef5a7-6085-4cd2-ad17-13bbe1dd5a62",
        role: "assistant",
        content:
          "Sẵn sàng! Bạn hãy chọn báo cáo quẻ từ danh sách **#Báo cáo** hoặc gửi nội dung bạn muốn giải mã vào đây. Tôi sẽ phân tích thật rõ ý nghĩa cốt lõi và gợi ý các bước hành động cụ thể cho bạn.",
        timestamp: "10/20 03:43",
      },
      {
        id: "e2adc887-3e93-4e9c-aef0-434e9fd094d2",
        role: "user",
        content: "Tôi vừa rút một quẻ linh xâm Kinh Dịch",
        timestamp: "10/20 03:43",
      },
      {
        id: "2b5c95db-a5c6-4678-819d-11b523ca5a3b",
        role: "assistant",
        content: "【Linh Xâm】Thủy Lôi Truân · Nộn Nha Phá Kiên Thổ (Trung Bình)",
        timestamp: "10/20 03:43",
        type: "lot_card",
        lotHexagramNumber: 3,
        quickLot: {
          position: 3,
          guaName: "Thủy Lôi Truân",
          cardTitle: "Nộn Nha Phá Kiên Thổ",
          guaCi: "Truân. Nguyên hanh, lợi trinh. Vật dụng hữu du vãng, lợi kiến hầu.",
          luckTier: "中平",
          frontUrl: "/assets/oss/3/3a.webp",
          backUrl: "/assets/oss/3/3b.webp",
        },
      },
      {
        id: "8ca784ac-78d6-426d-b524-cae2f51c955f",
        role: "assistant",
        content:
          "Quẻ xâm **「Thủy Lôi Truân」** này thuộc bậc **Trung Bình**.\n\nĐây là hình tượng của giai đoạn **「Vạn sự khởi đầu nan」**: giống như mầm non đang vươn mình xuyên qua lớp đất cứng. Tuy tràn đầy sinh khí (*Nguyên hanh*) nhưng quá trình nảy mầm tất yếu đi kèm sức cản.\n\nCâu then chốt nhất trong lời quẻ là: *「Vật dụng hữu du vãng, lợi kiến hầu」*:\n• **Vật dụng hữu du vãng**: Hiện tại chưa thích hợp để manh động, bôn ba tứ phía hay nôn nóng cầu thành. Hoàn cảnh bên ngoài còn nhiều biến số, lao đi mù quáng sẽ chỉ làm tiêu hao nguyên khí.\n• **Lợi kiến hầu**: Việc nên làm nhất lúc này là **đắp xây nền móng, chiêu mộ đồng đội và củng cố vị thế cốt lõi**. Thay vì vội mở rộng ra ngoài, hãy cắm rễ thật sâu và tổ chức tốt nguồn lực xung quanh.\n\n**Lời khuyên dành cho bạn:**\n1. **Kiên nhẫn cắm rễ**: Đừng ngại tiến độ ban đầu chậm; mỗi bước chuẩn bị hiện tại đều đang lát đường cho tương lai.\n2. **Tìm kiếm đồng minh**: *「Kiến hầu」* nhắc rằng bạn cần người đồng hành chia sẻ áp lực, đừng ôm đồm một mình.\n3. **Giữ vững sơ tâm**: Tỉnh táo giữa lúc bộn bề, không nản lòng trước trở ngại ban đầu.",
        timestamp: "10/20 03:43",
      },
      {
        id: "3b7691be-7e5e-4917-9a94-f1d39488ce89",
        role: "user",
        content: "✨ Hãy giúp tôi gieo quẻ Kinh Dịch:",
        timestamp: "10/20 03:44",
      },
      {
        id: "15de3f4e-e364-484d-b5c0-8c737884df18",
        role: "assistant",
        content:
          "Bạn muốn gieo quẻ Kinh Dịch cho một câu hỏi cụ thể đang trăn trở, hay muốn xem vận trình tổng quan?\n\n• Nếu có **vấn đề cụ thể** (ví dụ: quyết định công việc, dự án, hay hướng đi của một mối quan hệ), hãy cho tôi biết câu hỏi để lập **quẻ Lục Hào** luận giải chi tiết.\n• Nếu chỉ muốn xem thông điệp nhanh trong ngày, bạn có thể rút một **Linh Xâm** hoặc gửi bộ 3 con số bất kỳ để khởi quẻ Mai Hoa Dịch Số.",
        timestamp: "10/20 03:44",
      },
      {
        id: "6a229045-3702-4605-8abf-9438e238e963",
        role: "user",
        content: "232",
        timestamp: "10/20 03:44",
      },
      {
        id: "51aeddce-ae22-4fd0-84e7-7c8119a1808a",
        role: "assistant",
        content:
          "Với bộ số **「232」**, chúng ta khởi quẻ theo **Mai Hoa Dịch Số** như sau:\n• **Thượng quái**: Số 2 ứng với quẻ **Đoài** (Trạch / Đầm)\n• **Hạ quái**: Số 3 ứng với quẻ **Ly** (Hỏa / Lửa)\n• **Hào động**: Số 2 ứng với **Hào 2 động**\n\nTừ đó lập được Bản quái là **Trạch Hỏa Cách**, Chi quái biến sang **Trạch Thiên Quải**.\n\n• **Bản quái Trạch Hỏa Cách**: Chủ về sự **「Cải cách, đổi mới, bỏ cũ thay mới」**. Giống như quá trình thuộc da cần lửa rèn nước rửa, tuy vất vả nhưng tất yếu để lột xác. Quẻ báo hiệu mô hình cũ đã không còn phù hợp, đòi hỏi một sự thay đổi căn cơ.\n• **Hào động Lục Nhị**: *「Kỷ nhật nãi cách chi, chinh cát, vô cữu」* — việc cải cách cần chọn đúng thời điểm chín muồi (*Kỷ nhật*), không được nóng vội. Khi đã chuẩn bị kỹ và điểm rơi tới, hành động sẽ cát tường, không có lỗi.\n• **Chi quái Trạch Thiên Quải**: Chủ về sự **「Quyết đoán」**, dứt khoát xử lý dứt điểm những tồn đọng cuối cùng.\n\n**Tổng kết**: Bộ số 232 chỉ ra bạn đang đứng trước một cuộc thay đổi lớn cần sự mạnh dạn đổi mới, nhưng hãy chuẩn bị thật kỹ rồi mới quyết đoán hành động.",
        timestamp: "10/20 03:44",
      },
      {
        id: "32dee415-ab55-4922-8f24-227aa87f2673",
        role: "user",
        content: "✨ Xin hãy giúp tôi gieo quẻ Kinh Dịch: Trạng thái hiện tại đã ổn định chưa?",
        timestamp: "10/20 04:14",
      },
      {
        id: "5cf3026f-a198-4007-b8e1-38eb11d96dda",
        role: "assistant",
        content:
          "Câu hỏi *「Đã ổn định chưa?」* cho thấy bạn đang chờ đợi một kết quả hoặc muốn xác nhận xem mọi thứ đã vào quỹ đạo an toàn hay chưa.\n\nĐể quẻ **Lục Hào** phản ánh sát nhất tình huống của bạn, hãy cho tôi biết thêm đôi chút bối cảnh nhé:",
        timestamp: "10/20 04:14",
      },
      {
        id: "dd742423-3e00-4398-a2bb-ec90311a58aa",
        role: "user",
        content:
          "Thông tin bối cảnh của câu hỏi:\n• Hỏi: Bạn hiện đang ở giai đoạn nào?\n• Đáp: Đang chờ đối phương phản hồi\n• Hỏi: Yếu tố khiến bạn thấy bất định nhất là gì?\n• Đáp: Sự thay đổi của môi trường bên ngoài",
        timestamp: "10/20 04:14",
      },
      {
        id: "89c546a8-1502-45f2-8284-65edd3847e80",
        role: "assistant",
        content:
          "Kết quả gieo quẻ lần này:\nBản quái là **Hỏa Thủy Vị Tế**, Chi quái là **Lôi Phong Hằng**, có 2 hào động (Hào 3 và Hào Thượng).",
        timestamp: "10/20 04:14",
      },
      {
        id: "baa59ca4-850f-4380-9e9d-f6dbf29fd1d6",
        role: "assistant",
        content:
          "📊 Báo cáo Luận Giải Hiện Trạng: Bề ngoài dao động nhưng thực chất đang sát ngưỡng chuyển mình; mấu chốt là chế ngự lo âu và giữ vững nhịp độ.",
        timestamp: "10/20 04:15",
        type: "divination_result",
        divinationRecord: YILORE_INITIAL_HISTORY_RECORDS[0],
      },
      {
        id: "3d673478-125a-4860-99c9-35fe2b02081c",
        role: "assistant",
        content:
          "Báo cáo này phân tích rất thấu đáo: **Bạn không phải đang bất ổn, mà đang ở nhịp rung chuyển ngay trước khi phá kén.**\n\nQuẻ tượng là **「Hỏa Thủy Vị Tế」** biến **「Lôi Phong Hằng」**:\n• **Bản quái 「Vị Tế」**: Việc lớn đang ở chặng cuối cùng trước khi hoàn tất, giống như chú cáo nhỏ qua sông mà đuôi còn ướt. Cảm giác lơ lửng hiện tại là hoàn toàn tự nhiên khi giai đoạn cũ sắp khép lại và trạng thái mới đang thành hình.\n• **Hào động Lục Tam 「Vị tế, chinh hung, lợi siệp đại xuyên」**: Cảnh báo bạn không nên vì sốt ruột chờ đối phương phản hồi mà liên tục thúc giục hay hấp tấp đổi hướng (*chinh hung*).\n• **Hào động Thượng Cửu 「Hữu phu vu ẩm tửu, vô cữu. Nhu kỳ thủ, hữu phu thất thị」**: Khuyên bạn hãy giữ tâm thế thư thái, tin tưởng vào những gì mình đã chuẩn bị, nhưng tuyệt đối không chủ quan buông lơi ở bước cuối cùng.\n• **Chi quái 「Lôi Phong Hằng」**: Định hướng chung cục là sự lâu dài, bền vững. Đợt biến động này rồi sẽ lắng lại và mở ra một giai đoạn ổn định vững chắc.\n\n**Lời khuyên của Cửu Nhị dành riêng cho bạn:**\n1. **Lấy tĩnh chế động**: Trong lúc chờ hồi âm, bất kỳ động thái thúc ép nóng vội nào cũng đều bất lợi. Giữ vững nhịp độ của riêng mình chính là bước đi khôn ngoan nhất.\n2. **Chuyển hóa lo âu thành phương án dự phòng**: Chuẩn bị sẵn kịch bản cho cả hai trường hợp khi đối phương phản hồi sẽ giúp tâm bạn hoàn toàn vững chãi.",
        timestamp: "10/20 04:15",
      },
      {
        id: "a4c4d458-7d42-46a8-89fc-e0525c328ffa",
        role: "user",
        content: "Tôi vừa rút một quẻ linh xâm Kinh Dịch",
        timestamp: "10/20 05:47",
      },
      {
        id: "1c4040d8-ea43-4484-8375-5704936c4f16",
        role: "assistant",
        content: "【Linh Xâm】Thủy Sơn Kiển · Trí Giả Dừng Chân Trước Thác Băng (Hạ Xâm)",
        timestamp: "10/20 05:47",
        type: "lot_card",
        lotHexagramNumber: 39,
        quickLot: {
          position: 39,
          guaName: "Thủy Sơn Kiển",
          cardTitle: "Trí Giả Dừng Chân Trước Thác Băng",
          guaCi: "Lợi Tây Nam, bất lợi Đông Bắc; lợi kiến đại nhân, trinh cát.",
          luckTier: "下签",
          frontUrl: "/assets/oss/39/39a.webp",
          backUrl: "/assets/oss/39/39b.webp",
        },
      },
      {
        id: "8f018fb4-d0c8-482a-9c82-793b2993cce3",
        role: "assistant",
        content:
          "Đây là quẻ xâm thuộc bậc **Hạ Xâm** (Thủy Sơn Kiển).\n\nQuẻ **Kiển (Trở Ngại)** khắc họa tình thế phía trước có thác băng hiểm trở và núi cao chắn lối. Lời khuyên *「Lợi Tây Nam, bất lợi Đông Bắc」* chỉ rõ bạn nên hướng về vùng đất bằng phẳng, nơi có đồng minh và sự trợ lực (Tây Nam) thay vì đơn độc dấn thân vào chỗ hiểm trở cô lập (Đông Bắc).\n\n**Điểm cốt lõi cần nhớ:**\n• **Tạm dừng tiến bước**: Con đường phía trước đang có lực cản lớn; dừng lại đúng lúc là biểu hiện của trí tuệ (*Kiển chi thời dụng đại hỹ tai*).\n• **Tìm kiếm quý nhân**: *「Lợi kiến đại nhân」* khuyên bạn nên tham vấn bậc trưởng thượng hoặc người giàu kinh nghiệm chuyên môn thay vì tự mình xoay xở.\n• **Giữ vững chính đạo**: Kiên trì bảo toàn nội lực (*trinh cát*), đợi băng tan đường mở rồi mới tiếp tục xuất phát.",
        timestamp: "10/20 05:47",
      },
    ],
  },
  {
    id: "604d031e-4153-4d7d-86a7-1f5e1b3b4808",
    title: "Cuộc trò chuyện mới",
    updatedAt: "10/20 02:17",
    activePersonIds: [],
    activeReportIds: [],
    messages: [],
  },
  {
    id: "bc953b1f-f17e-46e5-884d-7f8ade346eb6",
    title: "Cuộc trò chuyện mới",
    updatedAt: "10/19 15:36",
    activePersonIds: [],
    activeReportIds: [],
    messages: [],
  },
];
