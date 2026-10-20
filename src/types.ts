export interface Trigram {
  id: string;
  name: string;
  hanzi: string;
  nature: string;
  element: string;
  lines: [number, number, number]; // 1 = Yang (liền), 0 = Yin (đứt) - từ dưới lên
  symbol: string;
  direction: string;
  attribute: string;
  meaning: string;
}

export interface Hexagram {
  number: number;
  name: string;
  hanzi: string;
  vietnameseName: string;
  upperTrigram: string;
  lowerTrigram: string;
  lines: [number, number, number, number, number, number]; // từ hào 1 (dưới) lên hào 6 (trên): 1=Yang, 0=Yin
  symbol: string;
  element: string;
  omen: "Đại Cát" | "Cát" | "Thứ Cát" | "Bình Hòa" | "Thứ Hung" | "Hung" | "Đại Hung";
  judgment: string; // Thoán từ
  image: string; // Đại tượng truyện
  overview: string; // Tổng quan thời vận
  career: string; // Sự nghiệp công danh
  wealth: string; // Tài lộc tiền bạc
  love: string; // Tình cảm hôn nhân
  health: string; // Sức khỏe
  advice: string; // Lời khuyên hành động
  lineMeanings?: {
    line: number;
    name: string;
    text: string;
    meaning: string;
    detailedExplanation?: string; // Giải nghĩa sâu về triết lý và ứng dụng thực tiễn cho từng hào
  }[];
  deckNumber?: number; // 1..12: Thuộc bộ bài số mấy khi sử dụng từ 1 đến 12 bộ bài
  instanceId?: string; // ID phân biệt duy nhất khi có nhiều bộ bài cùng quẻ
  isReversed?: boolean; // Có xoay ngược 180° hay không (50% cơ hội khi bốc quẻ)
}

export type DivinationMethod =
  | "coins"
  | "yarrow"
  | "cards_single"
  | "cards_double"
  | "cards_three"
  | "cards_seven"
  | "cards_nine"
  | "cards_ten"
  | "cards_ten_expanded"
  | "cards_twelve"
  | "cards_custom"
  | "cards_nguche"
  | "numbers";
export type DoubleCardMode = "present_future" | "choice_ab";
export type ThreeCardMode = "past_present_future" | "choice_abc" | "tam_tai" | "ngu_che";
export type SpreadType =
  | "single"
  | "double"
  | "three"
  | "seven_stars"
  | "nine_palaces"
  | "ten_stars"
  | "ten_stars_expanded"
  | "twelve_houses"
  | "custom"
  | "yarrow"
  | "coins"
  | "khongminh"
  | "maihoa"
  | "nguche"
  | "lucnham"
  | "kymon"
  | "thaiat";

export interface CustomCardPosition {
  index: number;
  name?: string;
  purpose: string;
}

export interface LucNhamHistoryData {
  dayCan: string;
  dayChi: string;
  hourCan: string;
  hourChi: string;
  nguyetTuong: string;
  thoiThan: string;
  quyNhan: string;
  tuanKhong: string[];
  tuanGiap?: string;
  cucName: string;
  cucDesc?: string;
  tamTruyen: {
    stage: string;
    title: string;
    can: string;
    canChinese?: string;
    branch: string;
    chinese?: string;
    lucThan: string;
    generalName: string;
    generalChinese?: string;
    isKhongVong?: boolean;
  }[];
  tuKhoa: {
    id: number;
    name: string;
    thuongChi: string;
    thuongChinese?: string;
    haName: string;
    haChinese?: string;
    relationText: string;
    lucThan: string;
  }[];
}

export interface DivinationRecord {
  id: string;
  timestamp: number;
  question: string;
  category: string;
  method?: DivinationMethod;
  spreadType?: SpreadType;
  primaryHexagram: Hexagram;
  changingLines: number[]; // Các hào động 1..6
  transformedHexagram?: Hexagram;
  notes?: string;
  isFavorite?: boolean;
  aiInterpretation?: string;
  cardsDrawSummary?: string;
  doubleMode?: DoubleCardMode;
  choiceALabel?: string;
  choiceBLabel?: string;
  threeMode?: ThreeCardMode;
  choiceCLabel?: string;
  drawnCards?: Hexagram[];
  customPositions?: CustomCardPosition[];
  isCard2Reversed?: boolean; // Dành cho Trận Pháp Thập Tinh Chuẩn: Thuận (Xuôi: Hỗ Trợ) hay Nghịch (Ngược: Trở Ngại)
  isCard2AReversed?: boolean; // Trận Thập Tinh Mở Rộng 2A: Thuận (Xuôi: Hỗ Trợ) hay Nghịch (Ngược: Trở Ngại)
  isCard2BReversed?: boolean; // Trận Thập Tinh Mở Rộng 2B: Thuận (Xuôi: Hỗ Trợ) hay Nghịch (Ngược: Trở Ngại)
  isTenStarsExpanded?: boolean; // Cờ nhận biết Thập Tinh 11 Lá (2A & 2B)
  menhBranchNumber?: number; // Vị trí Mệnh Cung (1=Tý, 2=Sửu, 3=Dần... 12=Hợi)
  diceRollResult?: number; // Kết quả gieo xúc xắc 12 mặt
  deckCount?: number; // Số lượng bộ bài sử dụng (1..12)
  multiDeckMode?: "separate" | "combined"; // "separate" (bốc từng bộ riêng lẻ) | "combined" (trộn chung nhiều bộ)
  companionCards?: Record<string, Hexagram | Hexagram[]>; // Các lá bốc thêm kế bên các vị trí trong trận pháp (hỗ trợ bốc nối tiếp nhiều lá)
  lucNhamRecord?: LucNhamHistoryData; // Bản ghi quẻ Lục Nhâm Đại Độn
}
