import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Sparkles,
  Dices,
  RotateCcw,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Info,
  Clock,
  ArrowRight,
  Sun,
  Flame,
  Star,
  ShieldCheck,
  Moon,
  Layers,
  BookOpen,
  Compass,
  Crown,
  Zap,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  X,
  Eye,
  Bookmark,
  BookmarkCheck,
  History,
  Save,
  Copy,
  Trash2,
  HelpCircle,
  Search,
  Share2,
  FileDown,
  FileUp,
  MessageSquare,
} from "lucide-react";
import { CHI_LIST, ChiData, CAN_LIST, CanData, FieldPaddyIcon, getCurrentBaziPillars, getElementBoxStyle } from "../data/baziConstants";
import { XuanBaguaStage } from "./XuanBaguaStage";
import {
  LUC_NHAM_THIEN_TUONG_12_CUNG_DATA,
  LucNhamThienTuongDetail,
  LucNhamThienTuongCungVi,
  getThienTuongCungViInfo,
  TAM_AN_PHU_CHAPTER_DATA,
} from "../data/lucnhamThienTuong12Cung";
import { getTamAnPhuExactEntry } from "../data/lucnhamTamAnPhuExact";

/**
 * BẢN GHI LƯU QUẺ LỤC NHÂM ĐẠI ĐỘN
 */
export interface SavedLucNhamRecord {
  id: string;
  timestamp: number;
  formattedDate: string;
  question: string;
  notes?: string;
  dayCan: string;
  dayChi: string;
  hourCan: string;
  hourChi: string;
  timePlateSource: "hoatthoi" | "trugio";
  hoatThoiIndex: number;
  activeThoiBranch: string;
  nguyetTuong: {
    name: string;
    branch: string;
    solarTerm: string;
  };
  nobleRuleId: NobleRuleId;
  nobleRuleTitle: string;
  isEffectiveDaytimeNoble: boolean;
  activeNobleBranch: string;
  isShunXing: boolean;
  tuKhoa: Array<{
    name: string;
    thuong: string;
    ha: string;
    general: string;
  }>;
  tamTruyen: {
    patternName: string;
    patternType?: string;
    soTruyen: { branch: string; general: string };
    trungTruyen: { branch: string; general: string };
    matTruyen: { branch: string; general: string };
  };
  khongVong: {
    branches: string[];
    tuanGiap: string;
  };
}

/**
 * THÔNG TIN NGUYỆT TƯỚNG (12 Nguyệt Tướng Lục Nhâm / Thái Dương cung vị)
 */
export interface NguyetTuongInfo {
  branch: string;
  name: string;
  chinese: string;
  element: "Mộc" | "Hỏa" | "Thổ" | "Kim" | "Thủy";
  term: string;
  desc: string;
  color: string;
}

/**
 * THÔNG TIN THẬP NHỊ THIÊN TƯỚNG (12 QUÝ THẦN / SAO TRỰC NHẬT LỤC NHÂM ĐẠI ĐỘN)
 */
export interface LucNhamThienTuongInfo {
  index: number;
  name: string;
  chinese: string;
  element: "Mộc" | "Hỏa" | "Thổ" | "Kim" | "Thủy";
  nature: "Đại Cát" | "Cát" | "Thứ Cát" | "Tiểu Hung" | "Hung" | "Đại Hung";
  natureColor: string;
  symbol: string;
  role: string;
  desc: string;
  color: string;
  overview?: string;
  numbers?: string;
  specialNotes?: string;
}

/**
 * THÔNG TIN LỤC DIỆU TRỰC TINH (KHỔNG MINH LỤC NHÂM ĐẠI ĐỘN)
 */
export interface LucDieuTrucNhatInfo {
  id: number;
  name: string;
  chinese: string;
  star: string;
  element: "Mộc" | "Hỏa" | "Thổ" | "Kim" | "Thủy";
  nature: "Đại Cát" | "Cát" | "Tiểu Hung" | "Hung";
  natureColor: string;
  poem: string;
  desc: string;
  color: string;
}

export const CHI_NAMES = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
export const CHI_CHINESE: Record<string, string> = {
  "Tý": "子", "Sửu": "丑", "Dần": "寅", "Mão": "卯", "Thìn": "辰", "Tỵ": "巳",
  "Ngọ": "午", "Mùi": "未", "Thân": "申", "Dậu": "酉", "Tuất": "戌", "Hợi": "亥"
};

export const CAN_NAMES = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
export const CAN_CHINESE: Record<string, string> = {
  "Giáp": "甲", "Ất": "乙", "Bính": "丙", "Đinh": "丁", "Mậu": "戊",
  "Kỷ": "己", "Canh": "庚", "Tân": "辛", "Nhâm": "壬", "Quý": "癸"
};

export const CAN_KY_CUNG_MAP: Record<string, number> = {
  "Giáp": 2,  // Dần
  "Ất": 4,   // Thìn
  "Bính": 5,  // Tỵ
  "Đinh": 7,  // Mùi
  "Mậu": 5,   // Tỵ
  "Kỷ": 7,    // Mùi
  "Canh": 8,  // Thân
  "Tân": 10,  // Tuất
  "Nhâm": 11, // Hợi
  "Quý": 1,   // Sửu
};

export const CHI_ELEMENT_MAP: Record<string, "Mộc" | "Hỏa" | "Thổ" | "Kim" | "Thủy"> = {
  "Tý": "Thủy", "Sửu": "Thổ", "Dần": "Mộc", "Mão": "Mộc", "Thìn": "Thổ", "Tỵ": "Hỏa",
  "Ngọ": "Hỏa", "Mùi": "Thổ", "Thân": "Kim", "Dậu": "Kim", "Tuất": "Thổ", "Hợi": "Thủy"
};

export const CAN_ELEMENT_MAP: Record<string, "Mộc" | "Hỏa" | "Thổ" | "Kim" | "Thủy"> = {
  "Giáp": "Mộc", "Ất": "Mộc", "Bính": "Hỏa", "Đinh": "Hỏa", "Mậu": "Thổ",
  "Kỷ": "Thổ", "Canh": "Kim", "Tân": "Kim", "Nhâm": "Thủy", "Quý": "Thủy"
};

export const CAN_POLARITY_MAP: Record<string, "duong" | "am"> = {
  "Giáp": "duong", "Ất": "am", "Bính": "duong", "Đinh": "am", "Mậu": "duong",
  "Kỷ": "am", "Canh": "duong", "Tân": "am", "Nhâm": "duong", "Quý": "am"
};

export const CHI_POLARITY_MAP: Record<string, "duong" | "am"> = {
  "Tý": "duong", "Sửu": "am", "Dần": "duong", "Mão": "am", "Thìn": "duong", "Tỵ": "am",
  "Ngọ": "duong", "Mùi": "am", "Thân": "duong", "Dậu": "am", "Tuất": "duong", "Hợi": "am"
};

/**
 * Kiểm tra một Chi thuộc Ban Ngày (Trú) hay Ban Đêm (Dạ)
 * Ngày (Trú): Mão (05-07), Thìn (07-09), Tỵ (09-11), Ngọ (11-13), Mùi (13-15), Thân (15-17)
 * Đêm (Dạ): Dậu (17-19), Tuất (19-21), Hợi (21-23), Tý (23-01), Sửu (01-03), Dần (03-05)
 */
export function isDaytimeBranch(branchName: string): boolean {
  return ["Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân"].includes(branchName);
}

/**
 * DANH SÁCH 12 THIÊN TƯỚNG (QUÝ THẦN) LỤC NHÂM ĐẠI ĐỘN
 */
export const LUC_NHAM_THIEN_TUONG_LIST: LucNhamThienTuongInfo[] = [
  {
    index: 0,
    name: "Quý Nhân",
    chinese: "貴人",
    element: "Thổ",
    nature: "Đại Cát",
    natureColor: "text-[#78350F] bg-[#FEF3C7] border-amber-600/70",
    symbol: "Ngọc Hoàng Đại Đế • Quan Nhân Cấp Cao",
    role: "Chủ soái 12 Thiên Tướng, cứu khốn phù nguy, vạn sự hóa cát",
    desc: "Đứng đầu Thập Nhị Thiên Tướng, giải trừ hung sát, thăng tiến công danh, quý nhân phù trợ, văn quan xuất thế, thi cử đỗ đạt, phúc thọ diên trường.",
    overview: "Ngọc hoàng đại đế, quan nhân cấp cao, sử lý công đạo",
    numbers: "Số 05, 08",
    color: "text-[#92400E]",
  },
  {
    index: 1,
    name: "Đằng Xà",
    chinese: "騰蛇",
    element: "Hỏa",
    nature: "Hung",
    natureColor: "text-[#991B1B] bg-[#FEE2E2] border-rose-700/60",
    symbol: "Hư Hỏa Kinh Hoảng • Địa Hộ Gia Trạch",
    role: "Chủ kinh sợ, quái dị, ác mộng, tráo trở, lo âu",
    desc: "Thần hư hỏa hung bạo, chủ kinh hoàng khiếp đảm, ác mộng quái đản, việc tráo trở khó lường, hỏa tai lo âu, bệnh hoạn bất an, nghi ngờ hoang tưởng.",
    overview: "Kinh hoảng, địa hộ, nhân khẩu, gia trạch, khu đèn đỏ chớp nhoáng.",
    numbers: "Số 02, 07",
    color: "text-red-400",
  },
  {
    index: 2,
    name: "Chu Tước",
    chinese: "朱雀",
    element: "Hỏa",
    nature: "Thứ Cát",
    natureColor: "text-[#9A3412] bg-[#FFEDD5] border-orange-700/60",
    symbol: "Văn Thư Văn Xương • Khẩu Thiệt Thanh Danh",
    role: "Chủ văn thư, thanh danh, tin tức; phòng khẩu thiệt thị phi",
    desc: "Thần văn chương khẩu thiệt, chủ văn thư bằng khen, tin tức phương xa, học vấn thi cử; nhưng động thì sinh cãi vã, quan tụng khẩu thiệt, truyền thông rùm beng.",
    overview: "Văn thư, văn chương, văn xương, phô trương, làm đẹp, rực rỡ, khoe khoang, khẩu thiệt. Số 9",
    numbers: "Số 9",
    color: "text-[#9A3412]",
  },
  {
    index: 3,
    name: "Lục Hợp",
    chinese: "六合",
    element: "Mộc",
    nature: "Cát",
    natureColor: "text-[#15803D] bg-[#DCFCE7] border-[#16A34A]/45",
    symbol: "Hôn Nhân Hợp Đồng • Mai Mối Giao Dịch",
    role: "Chủ hôn nhân, giao dịch, hợp tác, âm mưu êm đẹp",
    desc: "Thần hòa hợp cát khánh, chủ mai mối hôn nhân, kết tóc xe duyên, hợp đồng ký kết thuận buồm xuôi gió, hội ngộ bằng hữu, việc thầm kín có người giúp đỡ.",
    overview: "Hợp đồng, khế ước, mai mối, nữ gặp thanh long hoặc quan quỷ, nam gặp tài hoặc quan quỷ là kết hôn. Số 04",
    numbers: "Số 04",
    specialNotes: "Nữ gặp thanh long hoặc quan quỷ, nam gặp tài hoặc quan quỷ là kết hôn.",
    color: "text-[#15803D]",
  },
  {
    index: 4,
    name: "Câu Trần",
    chinese: "勾陳",
    element: "Thổ",
    nature: "Hung",
    natureColor: "text-amber-500 bg-[#FEF3C7] border-[#D97706]/45",
    symbol: "Nha Sai Chấp Pháp • Ngưu Đầu Mã Diện",
    role: "Chủ tranh chấp điền sản, kiện tụng câu lưu, giam cầm chậm trễ",
    desc: "Thần đồn trú chậm trễ, chủ kiện cáo, tranh đoạt đất đai nhà cửa, giằng co nan giải, chướng ngại tiến thoái, dây dưa trói buộc khó thoát.",
    overview: "Nha sai, người chấp pháp, ngưu đầu mã diện. Khi đồng thời câu trần cùng ra với huyền vũ thì có quan phi. Số 05,10, 09",
    numbers: "Số 05, 10, 09",
    specialNotes: "Khi đồng thời câu trần cùng ra với huyền vũ thì có quan phi.",
    color: "text-amber-500",
  },
  {
    index: 5,
    name: "Thanh Long",
    chinese: "青龍",
    element: "Mộc",
    nature: "Đại Cát",
    natureColor: "text-[#14532D] bg-[#DCFCE7]/90 border-emerald-600/80",
    symbol: "Tài Lộc Vinh Hoa • Hỷ Khánh Quý Tướng",
    role: "Chủ tài lộc, vinh hoa, tiền của, sinh quý tử, xuất hành",
    desc: "Đại cát thần bậc nhất về tài lộc, chủ tiền của dồi dào, thăng quan tiến chức, sinh con quý tử, cưới hỏi hoan hỷ, mở tiệm kinh doanh xuất hành đại lợi.",
    overview: "Số 03, đắc lực, công tào, người giúp đỡ. Đối với nữ thanh long là chồng.",
    numbers: "Số 03",
    specialNotes: "Đối với nữ thanh long là chồng.",
    color: "text-teal-400",
  },
  {
    index: 6,
    name: "Thiên Không",
    chinese: "天空",
    element: "Thổ",
    nature: "Hung",
    natureColor: "text-zinc-400 bg-zinc-950/70 border-zinc-700/60",
    symbol: "Hư Không Tôn Giáo • Vô Hình Bất Trắc",
    role: "Chủ dối trá, trò đùa, mất trộm, lời hứa suông, hao tài",
    desc: "Thần hư vô không thực, chủ lời hứa suông, lừa dối, trộm cắp tài sản, thất ước, kết quả hư ảo, trò đùa tai hại, việc tốn công mà rỗng tuếch.",
    overview: "Đang sử dụng mà không biết như không khí, bất tri bất giác. Thiên không vào không vong là niềm tin tôn giáo. Tín ngưỡng thứ không có, tôn giáo tín niệm, dù giả cũng xem đồ thiệt mà dùng.",
    numbers: "Số 05, 10",
    specialNotes: "Chiêm thời là thiên không, mà lại không vong thì mặt trời (nguyệt tướng) là chiêm thời (hoạt). Tuy không tồn tại nhưng vẫn ảnh hưởng người chiêm, nguyệt tướng là mặt trời.",
    color: "text-zinc-400",
  },
  {
    index: 7,
    name: "Bạch Hổ",
    chinese: "白虎",
    element: "Kim",
    nature: "Đại Hung",
    natureColor: "text-rose-500 bg-[#FEE2E2]/90 border-rose-600/80",
    symbol: "Binh Hình Sát Phạt • Huyết Quang Uy Dũng",
    role: "Chủ hình thương, đổ máu, tang chế, bệnh hiểm, tai họa",
    desc: "Đại hung thần mang sát khí nặng nề, chủ hình thương đổ máu, tang chế tai nạn, tai ương hung bạo cấp bách, tật bệnh trầm trọng, xuất hành hung hiểm.",
    overview: "Kim sát, binh hình sát phạt, huyết quang, tai ách, tang chế, bệnh hiểm, uy quyền quân sự. Số 07",
    numbers: "Số 07",
    color: "text-[#991B1B]",
  },
  {
    index: 8,
    name: "Thái Thường",
    chinese: "太常",
    element: "Thổ",
    nature: "Cát",
    natureColor: "text-[#854D0E] bg-[#FEF9C3] border-yellow-700/60",
    symbol: "Yến Tiệc Y Phục • Ân Điển Ban Thưởng",
    role: "Chủ yến tiệc, y phục, lụa là, quà tặng, ân điển",
    desc: "Thần yến tiệc ẩm thực, chủ tiệc tùng sum vầy, được ban tặng áo mão lụa là, sắc phong bổng lộc, hôn lễ khánh hạ, bằng hữu hội ngộ an khang.",
    overview: "Thổ cát thần, yến tiệc, y phục lụa là, ân điển ban tặng, sắc phong bổng lộc, hỷ sự sum vầy. Số 08, 05",
    numbers: "Số 08, 05",
    color: "text-[#854D0E]",
  },
  {
    index: 9,
    name: "Huyền Vũ",
    chinese: "玄武",
    element: "Thủy",
    nature: "Hung",
    natureColor: "text-[#1D4ED8] bg-[#DBEAFE] border-[#2563EB]/45",
    symbol: "Đạo Tặc Thất Thoát • Ám Muội Gian Tà",
    role: "Chủ mất trộm, gian tà, tiểu nhân hãm hại, dâm ô",
    desc: "Thần âm tà đạo tặc, chủ mất cắp thất thoát, mưu mô ám muội lừa lọc, tiểu nhân ngầm hãm hại sau lưng, hoang dâm tư thông, trắc trở đường nước.",
    overview: "Thủy thần, trộm cắp đạo tặc, ám muội mưu gian, tiểu nhân hãm hại sau lưng, thất thoát tiền tài, dâm ô. Số 01, 06",
    numbers: "Số 01, 06",
    color: "text-[#1D4ED8]",
  },
  {
    index: 10,
    name: "Thái Âm",
    chinese: "太陰",
    element: "Kim",
    nature: "Cát",
    natureColor: "text-[#3F3F46] bg-[#F4F4F5] border-slate-600/70",
    symbol: "Âm Đức Mật Mưu • Trinh Khiết Thanh Cao",
    role: "Chủ mưu kín, âm đức che chở, phụ nữ tương trợ, thanh cao",
    desc: "Thần âm đức trinh bạch, chủ mưu kế kín đáo êm thắm, phụ nữ đoan chính tương trợ, việc mưu thầm thành công, danh dự thanh cao, phúc lộc tích tụ âm thầm.",
    overview: "Kim cát thần, phụ nữ tôn quý, âm đức che chở, mưu kín thâm trầm, trang sức vàng bạc, trinh khiết. Số 04, 09",
    numbers: "Số 04, 09",
    color: "text-[#3F3F46]",
  },
  {
    index: 11,
    name: "Thiên Hậu",
    chinese: "天后",
    element: "Thủy",
    nature: "Cát",
    natureColor: "text-cyan-300 bg-cyan-950/80 border-cyan-700/70",
    symbol: "Mẫu Nghi Thiên Hạ • Ân Trạch Gia Đạo",
    role: "Chủ ân trạch, bao dung, phụ nữ hiền thục, sinh nở bình an",
    desc: "Thần mẫu nghi ân huệ, biểu tượng đức mẹ bao dung che chở, thê thiếp hiền lương giúp đỡ, gia đạo hưng thịnh ấm êm, duyên lành mỹ mãn, sinh nở an lành.",
    overview: "Thủy cát thần, mẫu nghi thiên hạ, mẹ hiền vợ thảo, ân trạch bao dung, bảo hộ sinh nở, phúc hậu gia đạo. Số 02, 06",
    numbers: "Số 02, 06",
    color: "text-cyan-300",
  },
];

/**
 * DANH SÁCH LỤC DIỆU TRỰC TINH (KHỔNG MINH LỤC NHÂM ĐẠI ĐỘN)
 */
export const LUC_DIEU_TRUC_NHAT_LIST: LucDieuTrucNhatInfo[] = [
  {
    id: 0,
    name: "Đại An",
    chinese: "大安",
    star: "Sao Thanh Long",
    element: "Mộc",
    nature: "Đại Cát",
    natureColor: "text-[#14532D] bg-[#DCFCE7]/90 border-emerald-600/80",
    poem: "Đại An sự sự nghênh tường phúc, Cầu tài tác sự bách ban như. Thất vật tầm lai y cựu tại, Bình an xuất ngoại hoạch giai cư.",
    desc: "Chủ bình an, vững chắc, sự nghiệp trường cửu. Đi xa gặp may, cầu tài đắc lợi, thân tâm thanh thản.",
    color: "text-[#15803D]",
  },
  {
    id: 1,
    name: "Lưu Niên",
    chinese: "流年",
    star: "Sao Huyền Vũ",
    element: "Thủy",
    nature: "Tiểu Hung",
    natureColor: "text-[#1D4ED8] bg-[#DBEAFE] border-[#2563EB]/45",
    poem: "Lưu Niên mưu sự nan trù định, Dục tấn dục thoái lưỡng nan nghi. Quan sự trì diên nan giải thoát, Cầu tài bất toại vọng hoài nghi.",
    desc: "Chủ dây dưa trì trệ, công việc chậm trễ kéo dài. Nên nhẫn nại phòng thủ, tránh khởi sự liều lĩnh hoặc tranh chấp kiện tụng.",
    color: "text-[#1D4ED8]",
  },
  {
    id: 2,
    name: "Tốc Hỷ",
    chinese: "速喜",
    star: "Sao Chu Tước",
    element: "Hỏa",
    nature: "Cát",
    natureColor: "text-[#9A3412] bg-[#FFEDD5] border-orange-700/60",
    poem: "Tốc Hỷ hỷ sự lai thần tốc, Cầu tài hoạch lợi bội hoan gia. Thất vật ngọ thì hoàn tự kiến, Hành nhân tương kiến hỷ nghênh hoa.",
    desc: "Chủ niềm vui bất ngờ tới nhanh, tin mừng phương xa. Việc tốt tiến hành vào buổi sáng hoặc giờ Ngọ sẽ hanh thông rực rỡ.",
    color: "text-[#9A3412]",
  },
  {
    id: 3,
    name: "Xích Khẩu",
    chinese: "赤口",
    star: "Sao Bạch Hổ",
    element: "Kim",
    nature: "Hung",
    natureColor: "text-[#991B1B] bg-[#FEE2E2] border-rose-700/60",
    poem: "Xích Khẩu quan phi cập khẩu thiệt, Đề phòng tiểu nhân khởi họa đoan. Hành nhân thất lạc đa trù trướng, Thất vật cựu xứ tốc tầm hoàn.",
    desc: "Chủ khẩu thiệt thị phi, bất đồng mâu thuẫn, tai bay vạ gió. Cần cẩn trọng lời ăn tiếng nói, kiêng cãi vã kiện cáo.",
    color: "text-[#991B1B]",
  },
  {
    id: 4,
    name: "Tiểu Cát",
    chinese: "小吉",
    star: "Sao Lục Hợp",
    element: "Mộc",
    nature: "Cát",
    natureColor: "text-teal-400 bg-[#CCFBF1] border-teal-700/60",
    poem: "Tiểu Cát tối vi cát khánh thần, Hành nhân tiện chí sự hoà tân. Cầu tài vạn sự câu hoà hợp, Giao dịch âm thầm đắc quý nhân.",
    desc: "Chủ thuận hòa tốt đẹp, quý nhân tương trợ, giao dịch buôn bán thu lợi. Mọi sự bình an, tình cảm êm ấm gắn kết.",
    color: "text-teal-400",
  },
  {
    id: 5,
    name: "Không Vong",
    chinese: "空亡",
    star: "Sao Câu Trận",
    element: "Thổ",
    nature: "Hung",
    natureColor: "text-amber-500 bg-[#FEF3C7] border-[#D97706]/45",
    poem: "Không Vong sự sự hư hoa cảnh, Cầu tài vô ích mạc vọng cầu. Quan sự hữu tai tu phòng bị, Bệnh hoạn trầm trọng khủng nan lưu.",
    desc: "Chủ hư không bất thành, tiền của hao tán, việc dở dang không kết quả. Thích hợp tu tâm tích đức, tránh đầu tư mạo hiểm.",
    color: "text-amber-500",
  },
];

/**
 * DANH SÁCH 12 NGUYỆT TƯỚNG (THÁI DƯƠNG CUNG VỊ LỤC NHÂM)
 */
export const NGUYET_TUONG_LIST: NguyetTuongInfo[] = [
  { branch: "Hợi", name: "Đăng Minh", chinese: "登明", element: "Thủy", term: "Vũ Thủy (Tháng 1)", desc: "Trí tuệ cơ mật, căn nguyên thủy mạch, giải trừ tai ương, tàng tụ phúc khí", color: "text-[#1D4ED8]" },
  { branch: "Tuất", name: "Hà Khôi", chinese: "河魁", element: "Thổ", term: "Xuân Phân (Tháng 2)", desc: "Võ tướng uy vệ, thu vén nhà kho, kỷ cương nghiêm cẩn, kết thúc việc cũ", color: "text-[#78350F]" },
  { branch: "Dậu", name: "Tòng Khôi", chinese: "從魁", element: "Kim", term: "Cốc Vũ (Tháng 3)", desc: "Quý nhân phù trợ, ngọc ngà tài bảo, phụ nữ đoan trang, tâm tính thanh tịnh", color: "text-[#3F3F46]" },
  { branch: "Thân", name: "Truyền Tống", chinese: "傳送", element: "Kim", term: "Tiểu Mãn (Tháng 4)", desc: "Sứ giả thông tin, giao dịch đường xa, biến thông tài tình, cầu tài cầu việc", color: "text-[#3F3F46]" },
  { branch: "Mùi", name: "Tiểu Cát", chinese: "小吉", element: "Thổ", term: "Hạ Chí (Tháng 5)", desc: "Hỷ sự tương phùng, yến tiệc ẩm thực, gia đạo hòa hợp, tình cảm êm ấm", color: "text-[#854D0E]" },
  { branch: "Ngọ", name: "Thắng Quang", chinese: "勝光", element: "Hỏa", term: "Đại Thử (Tháng 6)", desc: "Quang minh chính đại, thắng lợi hiển hách, quan lộc phát đạt, rực rỡ danh tiếng", color: "text-[#92400E]" },
  { branch: "Tỵ", name: "Thái Ất", chinese: "太乙", element: "Hỏa", term: "Xử Thử (Tháng 7)", desc: "Trí mưu biến hóa, thông đạt kinh tế, xuất ngoại hanh thông, học vấn uyên bác", color: "text-red-400" },
  { branch: "Thìn", name: "Thiên Cương", chinese: "天罡", element: "Thổ", term: "Thu Phân (Tháng 8)", desc: "Chí cương chí dũng, thống lĩnh bách thần, quyết đoán mưu sự, dẹp yên chấn nhiễu", color: "text-amber-500" },
  { branch: "Mão", name: "Thái Xung", chinese: "太衝", element: "Mộc", term: "Sương Giáng (Tháng 9)", desc: "Xung phong xuất trận, xe cộ di chuyển, canh tân sáng tạo, sinh sôi nảy nở", color: "text-[#15803D]" },
  { branch: "Dần", name: "Công Tào", chinese: "功曹", element: "Mộc", term: "Tiểu Tuyết (Tháng 10)", desc: "Kiến công lập nghiệp, quan văn bổ chức, tài liệu văn án, ban thưởng vinh phong", color: "text-[#14532D]" },
  { branch: "Sửu", name: "Đại Cát", chinese: "大吉", element: "Thổ", term: "Đông Chí (Tháng 11)", desc: "Đại cát đại lợi, ruộng đồng kho bãi, tích lũy điền sản, gia nghiệp hưng thịnh", color: "text-yellow-500" },
  { branch: "Tý", name: "Thần Hậu", chinese: "神后", element: "Thủy", term: "Đại Hàn (Tháng 12)", desc: "Căn nguyên trời đất, huyền bí tàng ẩn, phúc đức tổ tiên, tịnh niệm tâm linh", color: "text-[#1E3A8A]" },
];

export type NobleRuleId =
  | "jia_yang_wu_geng_niu"       // Lựa chọn 1: 甲羊戊庚牛(壬兔癸蛇) - Chuẩn Đại Lục Nhâm kinh điển
  | "jia_wu_geng_niu_yang_tu_she" // Lựa chọn 2: 甲戊庚牛羊(壬癸兔蛇) - Tử Bình / Bát Tự phổ thông
  | "jia_wu_geng_niu_yang_she_tu"; // Lựa chọn 3: 甲戊庚牛羊(壬癸蛇兔) - Cổ pháp Thông Thư

export interface NobleRuleOption {
  id: NobleRuleId;
  choiceNum: number;
  label: string;
  shortLabel: string;
  badge: string;
  chinese: string;
  vietnamese: string;
  source: string;
  desc: string;
}

export const NOBLE_RULE_OPTIONS: NobleRuleOption[] = [
  {
    id: "jia_yang_wu_geng_niu",
    choiceNum: 1,
    label: "Lựa chọn 1: Giáp Dương Mậu Canh Ngưu (Chuẩn Lục Nhâm kinh điển)",
    shortLabel: "Lựa chọn 1 (Kinh điển Lục Nhâm)",
    badge: "Chuẩn Lục Nhâm",
    chinese: "甲羊戊庚牛 (壬兔癸蛇)",
    vietnamese: "Giáp dương Mậu Canh ngưu, Ất hầu Kỷ thử hương...",
    source: "Đại Lục Nhâm kinh điển (Lục Nhâm Đại Toàn, Viên Thụ Sơn, Vi Thiên Lý)",
    desc: "Quy tắc chính tông Lục Nhâm: Giáp ngày Mùi đêm Sửu • Mậu Canh ngày Sửu đêm Mùi • Ất ngày Thân đêm Tý • Kỷ ngày Tý đêm Thân • Bính ngày Dậu đêm Hợi • Đinh ngày Hợi đêm Dậu • Nhâm ngày Mão đêm Tỵ • Quý ngày Tỵ đêm Mão • Tân ngày Dần đêm Ngọ.",
  },
  {
    id: "jia_wu_geng_niu_yang_tu_she",
    choiceNum: 2,
    label: "Lựa chọn 2: Giáp Mậu Canh Ngưu Dương - Thố Xà (Tử Bình Bát Tự)",
    shortLabel: "Lựa chọn 2 (Thố Xà • Tử Bình)",
    badge: "Tử Bình Bát Tự",
    chinese: "甲戊庚牛羊 (壬癸兔蛇)",
    vietnamese: "Giáp Mậu Canh ngưu dương, Ất Kỷ thử hầu hương, Nhâm Quý thố xà...",
    source: "Phổ thông Tử Bình (Uyên Hải Tử Bình, Tam Mệnh Thông Hội)",
    desc: "Phổ thông Bát Tự: Giáp Mậu Canh ngày Sửu đêm Mùi • Ất Kỷ ngày Tý đêm Thân • Bính Đinh ngày Hợi đêm Dậu • Nhâm Quý ngày Mão đêm Tỵ • Lục Tân ngày Ngọ đêm Dần.",
  },
  {
    id: "jia_wu_geng_niu_yang_she_tu",
    choiceNum: 3,
    label: "Lựa chọn 3: Giáp Mậu Canh Ngưu Dương - Xà Thố (Cổ pháp Thông Thư)",
    shortLabel: "Lựa chọn 3 (Xà Thố • Cổ pháp)",
    badge: "Cổ pháp Thông Thư",
    chinese: "甲戊庚牛羊 (壬癸蛇兔)",
    vietnamese: "Giáp Mậu Canh ngưu dương, Ất Kỷ thử hầu hương, Nhâm Quý xà thố...",
    source: "Cổ tịch Trạch Cát (Hiệp Kỷ Biện Phương Thư, Thần Phong Thông Khảo)",
    desc: "Cổ pháp kinh điển: Giáp Mậu Canh ngày Sửu đêm Mùi • Ất Kỷ ngày Tý đêm Thân • Bính Đinh ngày Hợi đêm Dậu • Nhâm Quý ngày Tỵ đêm Mão • Lục Tân ngày Ngọ đêm Dần.",
  },
];

/**
 * Khởi Quý Nhân theo Can Ngày (Hỗ trợ 3 phái khởi pháp theo cổ tịch)
 */
export function getLucNhamNobleBranches(
  dayCan: string,
  rule: NobleRuleId = "jia_yang_wu_geng_niu"
): {
  truQuy: string;
  daQuy: string;
  poem: string;
  ruleTitle: string;
  ruleShort: string;
} {
  if (rule === "jia_yang_wu_geng_niu") {
    // 甲羊戊庚牛(壬兔癸蛇) - Lựa chọn 1 (Chuẩn Đại Lục Nhâm kinh điển)
    const ruleTitle = "Lựa chọn 1: Giáp Dương Mậu Canh Ngưu (Chuẩn Lục Nhâm)";
    const ruleShort = "LC 1: Giáp Dương (Kinh điển)";
    switch (dayCan) {
      case "Giáp":
        return { truQuy: "Mùi", daQuy: "Sửu", poem: "Giáp Dương Mậu Canh Ngưu (Trú Mùi • Dạ Sửu)", ruleTitle, ruleShort };
      case "Ất":
        return { truQuy: "Thân", daQuy: "Tý", poem: "Ất Hầu Kỷ Thử hương (Trú Thân • Dạ Tý)", ruleTitle, ruleShort };
      case "Bính":
        return { truQuy: "Dậu", daQuy: "Hợi", poem: "Bính Kê Đinh Trư vị (Trú Dậu • Dạ Hợi)", ruleTitle, ruleShort };
      case "Đinh":
        return { truQuy: "Hợi", daQuy: "Dậu", poem: "Đinh Trư Bính Kê vị (Trú Hợi • Dạ Dậu)", ruleTitle, ruleShort };
      case "Mậu":
      case "Canh":
        return { truQuy: "Sửu", daQuy: "Mùi", poem: "Mậu Canh Ngưu Dương vị (Trú Sửu • Dạ Mùi)", ruleTitle, ruleShort };
      case "Kỷ":
        return { truQuy: "Tý", daQuy: "Thân", poem: "Kỷ Thử Ất Hầu hương (Trú Tý • Dạ Thân)", ruleTitle, ruleShort };
      case "Tân":
        return { truQuy: "Dần", daQuy: "Ngọ", poem: "Lục Tân phùng Hổ Mã (Trú Dần • Dạ Ngọ)", ruleTitle, ruleShort };
      case "Nhâm":
        return { truQuy: "Mão", daQuy: "Tỵ", poem: "Nhâm Thố Quý Xà du (Trú Mão • Dạ Tỵ)", ruleTitle, ruleShort };
      case "Quý":
        return { truQuy: "Tỵ", daQuy: "Mão", poem: "Quý Xà Nhâm Thố du (Trú Tỵ • Dạ Mão)", ruleTitle, ruleShort };
      default:
        return { truQuy: "Tý", daQuy: "Thân", poem: "Kỷ Thử Ất Hầu hương (Trú Tý • Dạ Thân)", ruleTitle, ruleShort };
    }
  }

  if (rule === "jia_wu_geng_niu_yang_tu_she") {
    // 甲戊庚牛羊(壬癸兔蛇) - Lựa chọn 2 (Tử Bình)
    const ruleTitle = "Lựa chọn 2: Giáp Mậu Canh Ngưu Dương (Nhâm Quý Thố Xà)";
    const ruleShort = "LC 2: Thố Xà (Tử Bình)";
    switch (dayCan) {
      case "Giáp":
      case "Mậu":
      case "Canh":
        return { truQuy: "Sửu", daQuy: "Mùi", poem: "Giáp Mậu Canh Ngưu Dương (Trú Sửu • Dạ Mùi)", ruleTitle, ruleShort };
      case "Ất":
      case "Kỷ":
        return { truQuy: "Tý", daQuy: "Thân", poem: "Ất Kỷ Thử Hầu hương (Trú Tý • Dạ Thân)", ruleTitle, ruleShort };
      case "Bính":
      case "Đinh":
        return { truQuy: "Hợi", daQuy: "Dậu", poem: "Bính Đinh Trư Kê vị (Trú Hợi • Dạ Dậu)", ruleTitle, ruleShort };
      case "Nhâm":
      case "Quý":
        return { truQuy: "Mão", daQuy: "Tỵ", poem: "Nhâm Quý Thố Xà tàng (Trú Mão • Dạ Tỵ)", ruleTitle, ruleShort };
      case "Tân":
        return { truQuy: "Ngọ", daQuy: "Dần", poem: "Lục Tân phùng Mã Hổ (Trú Ngọ • Dạ Dần)", ruleTitle, ruleShort };
      default:
        return { truQuy: "Tý", daQuy: "Thân", poem: "Ất Kỷ Thử Hầu hương (Trú Tý • Dạ Thân)", ruleTitle, ruleShort };
    }
  }

  // Lựa chọn 3: 甲戊庚牛羊(壬癸蛇兔) - Cổ pháp Thông Thư
  const ruleTitle = "Lựa chọn 3: Giáp Mậu Canh Ngưu Dương (Nhâm Quý Xà Thố)";
  const ruleShort = "LC 3: Xà Thố (Cổ pháp)";
  switch (dayCan) {
    case "Giáp":
    case "Mậu":
    case "Canh":
      return { truQuy: "Sửu", daQuy: "Mùi", poem: "Giáp Mậu Canh Ngưu Dương (Trú Sửu • Dạ Mùi)", ruleTitle, ruleShort };
    case "Ất":
    case "Kỷ":
      return { truQuy: "Tý", daQuy: "Thân", poem: "Ất Kỷ Thử Hầu hương (Trú Tý • Dạ Thân)", ruleTitle, ruleShort };
    case "Bính":
    case "Đinh":
      return { truQuy: "Hợi", daQuy: "Dậu", poem: "Bính Đinh Trư Kê vị (Trú Hợi • Dạ Dậu)", ruleTitle, ruleShort };
    case "Nhâm":
    case "Quý":
      return { truQuy: "Tỵ", daQuy: "Mão", poem: "Nhâm Quý Xà Thố tàng (Trú Tỵ • Dạ Mão)", ruleTitle, ruleShort };
    case "Tân":
      return { truQuy: "Ngọ", daQuy: "Dần", poem: "Lục Tân phùng Mã Hổ (Trú Ngọ • Dạ Dần)", ruleTitle, ruleShort };
    default:
      return { truQuy: "Tý", daQuy: "Thân", poem: "Ất Kỷ Thử Hầu hương (Trú Tý • Dạ Thân)", ruleTitle, ruleShort };
  }
}

/**
 * Tính Nguyệt Tướng mặc định theo Tiết Khí thực tế
 */
export function getDefaultNguyetTuong(date = new Date()): NguyetTuongInfo {
  let m = date.getMonth() + 1;
  let d = date.getDate();
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Ho_Chi_Minh",
      month: "numeric",
      day: "numeric",
    }).formatToParts(date);
    m = parseInt(parts.find((p) => p.type === "month")?.value || `${m}`, 10);
    d = parseInt(parts.find((p) => p.type === "day")?.value || `${d}`, 10);
  } catch {
    // fallback
  }

  if (m === 1 && d >= 20) return NGUYET_TUONG_LIST[11];
  if (m === 2 && d < 19) return NGUYET_TUONG_LIST[11];
  if (m === 2 && d >= 19) return NGUYET_TUONG_LIST[0];
  if (m === 3 && d < 21) return NGUYET_TUONG_LIST[0];
  if (m === 3 && d >= 21) return NGUYET_TUONG_LIST[1];
  if (m === 4 && d < 20) return NGUYET_TUONG_LIST[1];
  if (m === 4 && d >= 20) return NGUYET_TUONG_LIST[2];
  if (m === 5 && d < 21) return NGUYET_TUONG_LIST[2];
  if (m === 5 && d >= 21) return NGUYET_TUONG_LIST[3];
  if (m === 6 && d < 21) return NGUYET_TUONG_LIST[3];
  if (m === 6 && d >= 21) return NGUYET_TUONG_LIST[4];
  if (m === 7 && d < 23) return NGUYET_TUONG_LIST[4];
  if (m === 7 && d >= 23) return NGUYET_TUONG_LIST[5];
  if (m === 8 && d < 23) return NGUYET_TUONG_LIST[5];
  if (m === 8 && d >= 23) return NGUYET_TUONG_LIST[6];
  if (m === 9 && d < 23) return NGUYET_TUONG_LIST[6];
  if (m === 9 && d >= 23) return NGUYET_TUONG_LIST[7];
  if (m === 10 && d < 23) return NGUYET_TUONG_LIST[7];
  if (m === 10 && d >= 23) return NGUYET_TUONG_LIST[8];
  if (m === 11 && d < 22) return NGUYET_TUONG_LIST[8];
  if (m === 11 && d >= 22) return NGUYET_TUONG_LIST[9];
  if (m === 12 && d < 22) return NGUYET_TUONG_LIST[9];
  if (m === 12 && d >= 22) return NGUYET_TUONG_LIST[10];
  if (m === 1 && d < 20) return NGUYET_TUONG_LIST[10];
  return NGUYET_TUONG_LIST[11];
}

/**
 * Tính Cung Lục Diệu Trực Tinh Khổng Minh Lục Nhâm Đại Độn
 */
export function getDefaultLucDieu(date = new Date()): {
  info: LucDieuTrucNhatInfo;
  lunarMonth: number;
  lunarDay: number;
} {
  let y = date.getFullYear();
  let m = date.getMonth() + 1;
  let d = date.getDate();

  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "numeric",
      day: "numeric",
    }).formatToParts(date);
    y = parseInt(parts.find((p) => p.type === "year")?.value || `${y}`, 10);
    m = parseInt(parts.find((p) => p.type === "month")?.value || `${m}`, 10);
    d = parseInt(parts.find((p) => p.type === "day")?.value || `${d}`, 10);
  } catch {
    // fallback
  }

  const a = Math.floor((14 - m) / 12);
  const y1 = y + 4800 - a;
  const m1 = m + 12 * a - 3;
  const jdn =
    d +
    Math.floor((153 * m1 + 2) / 5) +
    365 * y1 +
    Math.floor(y1 / 4) -
    Math.floor(y1 / 100) +
    Math.floor(y1 / 400) -
    32045;

  const baseJDN = 2461316;
  const daysDiff = jdn - baseJDN;
  let lunarDay = ((22 + daysDiff - 1) % 30) + 1;
  if (lunarDay <= 0) lunarDay += 30;
  let lunarMonth = 8 + Math.floor((22 + daysDiff - 1) / 30);
  while (lunarMonth > 12) lunarMonth -= 12;
  while (lunarMonth < 1) lunarMonth += 12;

  const monthStart = (lunarMonth - 1) % 6;
  const dayIndex = (monthStart + (lunarDay - 1)) % 6;

  return {
    info: LUC_DIEU_TRUC_NHAT_LIST[dayIndex],
    lunarMonth,
    lunarDay,
  };
}

/**
 * Định Lục Thân so với Can Ngày
 */
export function getLucThan(dayCan: string, targetEl: "Mộc" | "Hỏa" | "Thổ" | "Kim" | "Thủy"): string {
  const myEl = CAN_ELEMENT_MAP[dayCan] || "Thổ";
  if (myEl === targetEl) return "Huynh Đệ";
  if (
    (targetEl === "Thủy" && myEl === "Mộc") ||
    (targetEl === "Mộc" && myEl === "Hỏa") ||
    (targetEl === "Hỏa" && myEl === "Thổ") ||
    (targetEl === "Thổ" && myEl === "Kim") ||
    (targetEl === "Kim" && myEl === "Thủy")
  ) {
    return "Phụ Mẫu";
  }
  if (
    (myEl === "Thủy" && targetEl === "Mộc") ||
    (myEl === "Mộc" && targetEl === "Hỏa") ||
    (myEl === "Hỏa" && targetEl === "Thổ") ||
    (myEl === "Thổ" && targetEl === "Kim") ||
    (myEl === "Kim" && targetEl === "Thủy")
  ) {
    return "Tử Tôn";
  }
  if (
    (myEl === "Thủy" && targetEl === "Hỏa") ||
    (myEl === "Hỏa" && targetEl === "Kim") ||
    (myEl === "Kim" && targetEl === "Mộc") ||
    (myEl === "Mộc" && targetEl === "Thổ") ||
    (myEl === "Thổ" && targetEl === "Thủy")
  ) {
    return "Thê Tài";
  }
  return "Quan Quỷ";
}

/**
 * Quan hệ Sinh Khắc Ngũ Hành giữa Hạ Thần và Thượng Thần
 */
export function getKeRelation(haEl: string, thuongEl: string): {
  type: "HA_TAC" | "THUONG_KHAC" | "TUONG_SINH" | "BI_HOA";
  text: string;
  badgeColor: string;
} {
  const isHaTac =
    (haEl === "Mộc" && thuongEl === "Thổ") ||
    (haEl === "Thổ" && thuongEl === "Thủy") ||
    (haEl === "Thủy" && thuongEl === "Hỏa") ||
    (haEl === "Hỏa" && thuongEl === "Kim") ||
    (haEl === "Kim" && thuongEl === "Mộc");

  if (isHaTac) {
    return {
      type: "HA_TAC",
      text: "Hạ Tặc Thượng (Tặc)",
      badgeColor: "bg-[#FEE2E2] text-[#991B1B] border-rose-600/70",
    };
  }

  const isThuongKhac =
    (thuongEl === "Mộc" && haEl === "Thổ") ||
    (thuongEl === "Thổ" && haEl === "Thủy") ||
    (thuongEl === "Thủy" && haEl === "Hỏa") ||
    (thuongEl === "Hỏa" && haEl === "Kim") ||
    (thuongEl === "Kim" && haEl === "Mộc");

  if (isThuongKhac) {
    return {
      type: "THUONG_KHAC",
      text: "Thượng Khắc Hạ (Khắc)",
      badgeColor: "bg-[#FEF3C7] text-[#78350F] border-amber-600/70",
    };
  }

  if (haEl === thuongEl) {
    return {
      type: "BI_HOA",
      text: "Bỉ Hòa",
      badgeColor: "bg-zinc-800/80 text-zinc-300 border-zinc-600/70",
    };
  }

  return {
    type: "TUONG_SINH",
    text: "Tương Sinh",
    badgeColor: "bg-[#DCFCE7] text-[#14532D] border-emerald-600/70",
  };
}

/**
 * Tính Thiên Can của Địa Chi theo Ngũ Thử Độn của Can Ngày
 */
export function getDonCan(dayCan: string, branchName: string): {
  can: string;
  chinese: string;
  element: "Mộc" | "Hỏa" | "Thổ" | "Kim" | "Thủy";
} {
  const dayCanIdx = Math.max(0, CAN_NAMES.indexOf(dayCan));
  const baseHourCan = (dayCanIdx % 5) * 2;
  const branchIdx = Math.max(0, CHI_NAMES.indexOf(branchName));
  const canIdx = (baseHourCan + branchIdx) % 10;
  const canName = CAN_NAMES[canIdx];
  return {
    can: canName,
    chinese: CAN_CHINESE[canName] || canName,
    element: CAN_ELEMENT_MAP[canName] || "Thổ",
  };
}

/**
 * Tính Thiên Can của Địa Chi theo Tuần Độn (Kinh Điển Lục Nhâm Đại Độn)
 */
export function getTuanDonCan(dayCan: string, dayChi: string, branchName: string): {
  can: string;
  chinese: string;
  element: "Mộc" | "Hỏa" | "Thổ" | "Kim" | "Thủy";
  isKhongVong: boolean;
} {
  const canIdx = Math.max(0, CAN_NAMES.indexOf(dayCan));
  const chiIdx = Math.max(0, CHI_NAMES.indexOf(dayChi));
  const diff = (chiIdx - canIdx + 120) % 12;
  const kv1 = (diff + 10) % 12;
  const kv2 = (diff + 11) % 12;
  const branchIdx = Math.max(0, CHI_NAMES.indexOf(branchName));

  if (branchIdx === kv1 || branchIdx === kv2) {
    return {
      can: "Không",
      chinese: "空",
      element: "Thổ",
      isKhongVong: true,
    };
  }

  const offset = (branchIdx - diff + 120) % 12;
  const canName = CAN_NAMES[offset % 10];
  return {
    can: canName,
    chinese: CAN_CHINESE[canName] || canName,
    element: CAN_ELEMENT_MAP[canName] || "Thổ",
    isKhongVong: false,
  };
}

/**
 * Tính Tuần Không (Không Vong) theo Can Chi của Ngày
 */
export function getKhongVongInfo(dayCan: string, dayChi: string): {
  branches: [string, string];
  tuanGiap: string;
  tuanThu: string;
  desc: string;
} {
  const canIdx = Math.max(0, CAN_NAMES.indexOf(dayCan));
  const chiIdx = Math.max(0, CHI_NAMES.indexOf(dayChi));
  const diff = (chiIdx - canIdx + 120) % 12;

  const kv1 = (diff + 10) % 12;
  const kv2 = (diff + 11) % 12;

  const tuanThuChi = CHI_NAMES[diff];
  const tuanThu = `Giáp ${tuanThuChi}`;
  const tuanGiap = `Tuần ${tuanThu}`;

  return {
    branches: [CHI_NAMES[kv1], CHI_NAMES[kv2]],
    tuanGiap,
    tuanThu,
    desc: `Ngày ${dayCan} ${dayChi} thuộc ${tuanGiap} (${tuanThu}), hai cung ${CHI_NAMES[kv1]} và ${CHI_NAMES[kv2]} lâm Tuần Không (Không Vong).`,
  };
}

/**
 * Chi tiết ý nghĩa và màu sắc của Lục Thân
 */
export function getLucThanDetails(lucThan: string): {
  badgeColor: string;
  meaning: string;
  role: string;
} {
  switch (lucThan) {
    case "Phụ Mẫu":
      return {
        badgeColor: "bg-[#E0F2FE]/90 text-[#1E3A8A] border-sky-600/70",
        meaning: "Sinh ta • Chủ văn thư, hợp đồng, xe cộ, nhà cửa, ân nhân bề trên che chở.",
        role: "Chủ quý nhân sinh dưỡng, cha mẹ, thầy dạy, trợ lực vững chắc.",
      };
    case "Huynh Đệ":
      return {
        badgeColor: "bg-[#DCFCE7]/90 text-[#14532D] border-emerald-600/70",
        meaning: "Đồng ta • Chủ bằng hữu, đồng môn, anh em tương trợ; kiêng phân tranh tài vật.",
        role: "Chủ ngang hàng, chia sẻ công việc, cẩn trọng tranh chấp tài vật.",
      };
    case "Tử Tôn":
      return {
        badgeColor: "bg-[#FEF3C7] text-[#78350F] border-amber-600/70",
        meaning: "Ta sinh • Phúc Thần giải ách, sinh tài vượng lộc, tiêu trừ lo âu, niềm vui hoan hỷ.",
        role: "Chủ niềm vui, thư thái, dập tắt Quan Quỷ sát khí, an lành vô sự.",
      };
    case "Thê Tài":
      return {
        badgeColor: "bg-yellow-950/90 text-[#854D0E] border-yellow-500/80",
        meaning: "Ta khắc • Chủ tiền bạc, tài lộc dồi dào, doanh thu, của cải và người phối ngẫu.",
        role: "Chủ vật chất dưỡng mệnh, kinh doanh buôn bán đắc lợi, ẩm thực hoan hỷ.",
      };
    case "Quan Quỷ":
    default:
      return {
        badgeColor: "bg-[#FEE2E2]/90 text-[#991B1B] border-rose-600/80",
        meaning: "Khắc ta • Chủ chức vị, quyền lực, quan tụng; đề phòng áp lực, bệnh tật hoặc tranh chấp.",
        role: "Chủ khảo nghiệm, kỷ luật, công quyền thăng tiến nhưng nhiều trắc trở.",
      };
  }
}

export interface TuKhoaItem {
  id: number;
  name: string;
  sub: string;
  role: string;
  thuongChi: string;
  thuongChinese: string;
  thuongEl: "Mộc" | "Hỏa" | "Thổ" | "Kim" | "Thủy";
  haChi: string;
  haName: string;
  haChinese: string;
  haEl: "Mộc" | "Hỏa" | "Thổ" | "Kim" | "Thủy";
  general: LucNhamThienTuongInfo;
  relation: {
    type: "HA_TAC" | "THUONG_KHAC" | "TUONG_SINH" | "BI_HOA";
    text: string;
    badgeColor: string;
  };
  lucThan: string;
  isThuongKhongVong: boolean;
  isHaKhongVong: boolean;
  tuongCungVi?: LucNhamThienTuongCungVi;
  tamAnPhu?: {
    tuongName: string;
    tuongChinese: string;
    originalPoem?: string;
    sinoVietPoem?: string;
    meaning?: string;
    fullLine?: string;
  };
}

export interface TamAnPhuModalPayload {
  title: string;
  subTitle: string;
  generalName: string;
  generalChinese?: string;
  tuongName: string;
  tuongChinese?: string;
  originalPoem?: string;
  sinoVietPoem?: string;
  fullLine?: string;
  meaning?: string;
  roleNote?: string;
  badgeText?: string;
}

export interface TamTruyenItem {
  stage: "Sơ Truyền" | "Trung Truyền" | "Mạt Truyền";
  title: string;
  desc: string;
  can: string;
  canChinese: string;
  canElement: "Mộc" | "Hỏa" | "Thổ" | "Kim" | "Thủy";
  canPolarity: "duong" | "am";
  canSymbol: string;
  canEmoji: React.ReactNode;
  canColorText: string;
  canBadgeBg: string;
  canLucThan: string;
  canLucThanColor: string;
  canLucThanMeaning: string;
  branch: string;
  chinese: string;
  element: "Mộc" | "Hỏa" | "Thổ" | "Kim" | "Thủy";
  branchPolarity: "duong" | "am";
  zodiac: string;
  chiEmoji: string;
  general: LucNhamThienTuongInfo;
  tuongCungVi?: LucNhamThienTuongCungVi;
  lucThan: string;
  lucThanMeaning: string;
  lucThanColor: string;
  lucThanRole: string;
  relationSummary: string;
  groundBranch: string;
  isKhongVong: boolean;
  khongVongNote: string;
  tuanDonCan: string;
  nguThuDonCan: string;
}

/**
 * Âm thanh lắc xí ngầu tổng hợp qua Web Audio API
 */
function playDiceSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    for (let i = 0; i < 5; i++) {
      const time = now + i * 0.1 + Math.random() * 0.04;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(350 + Math.random() * 300, time);
      osc.frequency.exponentialRampToValueAtTime(160, time + 0.07);
      gain.gain.setValueAtTime(0.12, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.07);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + 0.07);
    }
  } catch {
    // ignore
  }
}

interface JiaziD12DiceProps {
  dayCan?: string;
  dayChi?: string;
  hourCan?: string;
  hourChi?: string;
  selectedHoatThoiBranch?: string;
  onSelectHoatThoi?: (chiName: string) => void;
  onApplyHoatThoi?: (chiName: string) => void;
  onSetCurrentDateTime?: () => void;
  className?: string;
  storageScope?: string;
  boardContextLabel?: string;
}

export const JiaziD12Dice: React.FC<JiaziD12DiceProps> = ({
  dayCan = "Kỷ",
  dayChi = "Dậu",
  hourCan = "Kỷ",
  hourChi = "Tỵ",
  selectedHoatThoiBranch,
  onSelectHoatThoi,
  onApplyHoatThoi,
  onSetCurrentDateTime,
  className = "",
  storageScope = "hoagiap",
  boardContextLabel,
}) => {
  // Bộ khóa localStorage riêng biệt theo từng scope (bocque vs hoagiap)
  const scopeSuffix = storageScope ? `_${storageScope}` : "";
  const keyTimeSource = `lucnham_time_source${scopeSuffix}`;
  const keyTuong = `lucnham_nguyet_tuong${scopeSuffix}`;
  const keyHoatThoi = `lucnham_hoat_thoi${scopeSuffix}`;
  const keyNobleRule = `lucnham_noble_rule${scopeSuffix}`;
  const keyQuestion = `lucnham_current_question${scopeSuffix}`;
  const keyRecords = `lucnham_saved_records${scopeSuffix || "_v1"}`;

  // Xác định Trú/Dạ Quý Nhân theo Trụ Giờ (pillars[0]?.chi)
  const isHourDaytime = isDaytimeBranch(hourChi);
  const [nobleMode, setNobleMode] = useState<"auto_hour" | "manual_day" | "manual_night">("auto_hour");
  const [manualNobleIsDay, setManualNobleIsDay] = useState<boolean>(isHourDaytime);

  // Trạng thái Trú/Dạ đang áp dụng
  const isEffectiveDaytimeNoble = nobleMode === "auto_hour" ? isHourDaytime : manualNobleIsDay;

  // Lựa chọn nguồn Thời Thần: "hoatthoi" (Xí ngầu) hoặc "trugio" (Trụ Giờ Bát Tự)
  const [timePlateSource, setTimePlateSource] = useState<"hoatthoi" | "trugio">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(keyTimeSource);
      if (saved === "hoatthoi" || saved === "trugio") return saved;
    }
    return "hoatthoi";
  });

  const handleSetTimePlateSource = (source: "hoatthoi" | "trugio") => {
    setTimePlateSource(source);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(keyTimeSource, source);
      } catch {}
    }
  };

  // Tab xem: "12tướng" (Thập Nhị Thiên Tướng) hay "lụcdiệu" (Lục Diệu Trực Tinh)
  const [starViewMode, setStarViewMode] = useState<"tuong12" | "lucdieu">("tuong12");

  // 12 Thiên Tướng Lục Nhâm đã chọn
  const [selectedTuongThan, setSelectedTuongThan] = useState<LucNhamThienTuongInfo>(
    LUC_NHAM_THIEN_TUONG_LIST[0]
  );
  const [isTuongThanSelectOpen, setIsTuongThanSelectOpen] = useState<boolean>(false);

  // Lục Diệu Khổng Minh Trực Nhật Tinh
  const [lucDieuData] = useState(() => getDefaultLucDieu());

  // Nguyệt Tướng đã chọn (lưu độc lập theo scope)
  const [selectedTuong, setSelectedTuong] = useState<NguyetTuongInfo>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(keyTuong);
      if (saved) {
        const found = NGUYET_TUONG_LIST.find((t) => t.branch === saved || t.name === saved);
        if (found) return found;
      }
    }
    return getDefaultNguyetTuong();
  });
  const [isTuongSelectOpen, setIsTuongSelectOpen] = useState<boolean>(false);

  const handleSelectTuong = (tuong: NguyetTuongInfo) => {
    setSelectedTuong(tuong);
    setIsTuongSelectOpen(false);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(keyTuong, tuong.branch);
      } catch {}
    }
  };

  // Hoạt Thời (Địa Chi được gieo bằng xí ngầu 12 mặt hoặc lựa chọn trực tiếp - lưu độc lập theo scope)
  const [hoatThoiIndex, setHoatThoiIndex] = useState<number>(() => {
    if (selectedHoatThoiBranch) {
      const idx = CHI_NAMES.indexOf(selectedHoatThoiBranch);
      if (idx >= 0) return idx;
    }
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(keyHoatThoi);
      if (saved) {
        const idx = CHI_NAMES.indexOf(saved);
        if (idx >= 0) return idx;
      }
    }
    return 6; // Mặc định Giờ Ngọ
  });
  const [isHoatThoiSelectOpen, setIsHoatThoiSelectOpen] = useState<boolean>(false);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [rollingDisplayIndex, setRollingDisplayIndex] = useState<number>(6);
  const [justApplied, setJustApplied] = useState<boolean>(false);

  // Đồng bộ Hoạt Thời khi nhận prop bên ngoài
  useEffect(() => {
    if (selectedHoatThoiBranch) {
      const idx = CHI_NAMES.indexOf(selectedHoatThoiBranch);
      if (idx >= 0 && idx !== hoatThoiIndex) {
        setHoatThoiIndex(idx);
        setRollingDisplayIndex(idx);
        handleSetTimePlateSource("hoatthoi");
      }
    }
  }, [selectedHoatThoiBranch]);

  // Mở rộng toàn bộ Bàn Lục Nhâm (Thiên Địa Bàn, Tứ Khóa, Tam Truyền)
  const [isLucNhamChartOpen, setIsLucNhamChartOpen] = useState<boolean>(true);

  const rollIntervalRef = useRef<any>(null);

  // Chi Hoạt Thời hiện tại
  const currentHoatThoi = CHI_LIST[isRolling ? rollingDisplayIndex : hoatThoiIndex];

  // Tính Thiên Can của Hoạt Thời theo Can Ngày (Ngũ Thử Độn)
  const dayCanIndex = Math.max(0, CAN_NAMES.indexOf(dayCan));
  const baseHourCan = (dayCanIndex % 5) * 2;
  const hoatThoiCanName = CAN_NAMES[(baseHourCan + hoatThoiIndex) % 10];

  // Thời Thần áp dụng cho Thiên Bàn (Hoạt Thời hoặc Trụ Giờ)
  const activeThoiBranchName = timePlateSource === "hoatthoi" ? currentHoatThoi.name : hourChi;
  const activeThoiBranchIndex = Math.max(0, CHI_NAMES.indexOf(activeThoiBranchName));

  // 3 Lựa Chọn Khởi Quý Nhân theo cổ tịch (lưu độc lập theo scope)
  const [selectedNobleRule, setSelectedNobleRule] = useState<NobleRuleId>(() => {
    if (typeof window !== "undefined") {
      const saved = (localStorage.getItem(keyNobleRule) || localStorage.getItem("lucnham_noble_rule")) as NobleRuleId;
      if (
        saved &&
        (saved === "jia_yang_wu_geng_niu" ||
          saved === "jia_wu_geng_niu_yang_tu_she" ||
          saved === "jia_wu_geng_niu_yang_she_tu")
      ) {
        return saved;
      }
    }
    return "jia_yang_wu_geng_niu";
  });
  const [isNobleRuleModalOpen, setIsNobleRuleModalOpen] = useState<boolean>(false);
  const [is12GeneralModalOpen, setIs12GeneralModalOpen] = useState<boolean>(false);
  const [generalModalActiveId, setGeneralModalActiveId] = useState<number>(1);
  const [generalModalTab, setGeneralModalTab] = useState<"cungvi" | "tamanphu">("cungvi");
  const [selectedPalaceDetailIndex, setSelectedPalaceDetailIndex] = useState<number | null>(null);
  const [selectedTamAnPhuKhoa, setSelectedTamAnPhuKhoa] = useState<TuKhoaItem | null>(null);
  const [activeTamAnModal, setActiveTamAnModal] = useState<TamAnPhuModalPayload | null>(null);

  const handleSelectNobleRule = (ruleId: NobleRuleId) => {
    setSelectedNobleRule(ruleId);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(keyNobleRule, ruleId);
      } catch {}
    }
  };

  // Khẩu quyết Quý Nhân của Can Ngày theo Lựa Chọn quy tắc
  const nobleInfo = getLucNhamNobleBranches(dayCan, selectedNobleRule);
  const activeNobleBranchName = isEffectiveDaytimeNoble ? nobleInfo.truQuy : nobleInfo.daQuy;
  const activeNobleBranchIndex = Math.max(0, CHI_NAMES.indexOf(activeNobleBranchName));

  // Nguyệt Tướng Index (0..11)
  const nguyetTuongBranchIndex = Math.max(0, CHI_NAMES.indexOf(selectedTuong.branch));

  // =========================================================================
  // TÍNH TOÁN TOÀN BỘ THIÊN BÀN • TỨ KHÓA • TAM TRUYỀN
  // =========================================================================
  const lucNhamData = useMemo(() => {
    const T = nguyetTuongBranchIndex; // Nguyệt Tướng
    const H = activeThoiBranchIndex;   // Thời Thần (Hoạt Thời hoặc Trụ Giờ)

    // skyBranch(g): Thiên Bàn Chi ngự trên Địa Bàn g
    const skyBranch = (g: number) => (T + (g - H + 12)) % 12;

    // groundBranch(s): Địa Bàn Chi mà Thiên Bàn s ngự lên
    const groundBranch = (s: number) => (H + (s - T + 12)) % 12;

    // Vị trí Quý Nhân ngự trên Địa Bàn:
    const nobleGroundIndex = groundBranch(activeNobleBranchIndex);
    const nobleGroundName = CHI_NAMES[nobleGroundIndex];

    // Chiều an Thiên Tướng:
    // Hợi(11), Tý(0), Sửu(1), Dần(2), Mão(3), Thìn(4) => Thuận
    // Tỵ(5), Ngọ(6), Mùi(7), Thân(8), Dậu(9), Tuất(10) => Nghịch
    const isShunXing = [11, 0, 1, 2, 3, 4].includes(nobleGroundIndex);

    // Map 12 Thiên Tướng lên từng cung Địa Bàn
    const generalMap: Record<number, LucNhamThienTuongInfo> = {};
    for (let k = 0; k < 12; k++) {
      const gIndex = isShunXing
        ? (nobleGroundIndex + k) % 12
        : (nobleGroundIndex - k + 12) % 12;
      generalMap[gIndex] = LUC_NHAM_THIEN_TUONG_LIST[k];
    }

    // 12 Cung Thiên Địa Bàn
    const canKyIndex = CAN_KY_CUNG_MAP[dayCan] ?? 7;
    const dayChiIndex = Math.max(0, CHI_NAMES.indexOf(dayChi));
    const khongVong = getKhongVongInfo(dayCan, dayChi);

    const chiemThoiIndex = Math.max(0, CHI_NAMES.indexOf(hourChi));
    const hoatThoiGroundIndex = Math.max(0, CHI_NAMES.indexOf(currentHoatThoi.name));

    const palaces = CHI_NAMES.map((gName, gIdx) => {
      const sIdx = skyBranch(gIdx);
      const sName = CHI_NAMES[sIdx];
      const gEl = CHI_ELEMENT_MAP[gName];
      const sEl = CHI_ELEMENT_MAP[sName];
      const general = generalMap[gIdx] || LUC_NHAM_THIEN_TUONG_LIST[0];
      const relation = getKeRelation(gEl, sEl);
      // Cẩm nang 12 thần lâm 12 cung là tính THIÊN BÀN (sName)
      const tuongCungInfo = getThienTuongCungViInfo(general.name, sName);

      return {
        groundIndex: gIdx,
        groundName: gName,
        groundChinese: CHI_CHINESE[gName] || gName,
        groundEl: gEl,
        skyIndex: sIdx,
        skyName: sName,
        skyChinese: CHI_CHINESE[sName] || sName,
        skyEl: sEl,
        general,
        tuongCungVi: tuongCungInfo?.cungInfo,
        tuongDetail: tuongCungInfo?.general,
        isNoble: gIdx === nobleGroundIndex,
        isNguyetTuong: sIdx === T,
        isThoiThan: gIdx === H,
        isChiemThoi: gIdx === chiemThoiIndex,
        isHoatThoi: timePlateSource === "hoatthoi" && gIdx === hoatThoiGroundIndex,
        isCanKy: gIdx === canKyIndex,
        isDayChi: gIdx === dayChiIndex,
        isGroundKhongVong: khongVong.branches.includes(gName),
        isSkyKhongVong: khongVong.branches.includes(sName),
        relation,
      };
    });

    // ----------------- TỨ KHÓA -----------------
    // Khóa 1 (Can Thượng)
    const k1_ha = canKyIndex;
    const k1_th = skyBranch(k1_ha);
    const k1_gen = generalMap[k1_ha];
    const k1_rel = getKeRelation(CHI_ELEMENT_MAP[CHI_NAMES[k1_ha]], CHI_ELEMENT_MAP[CHI_NAMES[k1_th]]);

    // Khóa 2 (Can Thần)
    const k2_ha = k1_th;
    const k2_th = skyBranch(k2_ha);
    const k2_gen = generalMap[k2_ha];
    const k2_rel = getKeRelation(CHI_ELEMENT_MAP[CHI_NAMES[k2_ha]], CHI_ELEMENT_MAP[CHI_NAMES[k2_th]]);

    // Khóa 3 (Chi Thượng)
    const k3_ha = dayChiIndex;
    const k3_th = skyBranch(k3_ha);
    const k3_gen = generalMap[k3_ha];
    const k3_rel = getKeRelation(CHI_ELEMENT_MAP[CHI_NAMES[k3_ha]], CHI_ELEMENT_MAP[CHI_NAMES[k3_th]]);

    // Khóa 4 (Chi Thần)
    const k4_ha = k3_th;
    const k4_th = skyBranch(k4_ha);
    const k4_gen = generalMap[k4_ha];
    const k4_rel = getKeRelation(CHI_ELEMENT_MAP[CHI_NAMES[k4_ha]], CHI_ELEMENT_MAP[CHI_NAMES[k4_th]]);

    const getKhoaTamAnInfo = (genName: string, thuongBranch: string) => {
      const tuongInfo = getThienTuongCungViInfo(genName, thuongBranch);
      const exactLookup = getTamAnPhuExactEntry(genName, thuongBranch);

      const isCauTranTy = (genName === "Câu Trần" || genName === "Câu Trận") && (thuongBranch === "Tỵ" || thuongBranch === "Tị");

      const tuongName = isCauTranTy
        ? "Thụ cống"
        : (exactLookup?.entry?.tuongName || tuongInfo?.cungInfo?.tuongName || `${genName} cư ${thuongBranch}`);
      const tuongChinese = isCauTranTy
        ? "受贡"
        : (exactLookup?.entry?.tuongChinese || tuongInfo?.cungInfo?.tuongChinese || "");
      const originalPoem = isCauTranTy
        ? "勾陳居巳曰受貢，受貢兮納禮求安。"
        : (tuongInfo?.cungInfo?.tamAnPhuOriginal || "");
      const sinoVietPoem = isCauTranTy
        ? "Câu Trần cư Tỵ viết Thụ Cống"
        : (tuongInfo?.cungInfo?.tamAnPhu || "");
      const meaning = isCauTranTy
        ? "Cống nạp, dâng hiến tiền bạc, vật phẩm cho quan sai, miếu mạo để giải hạn, mong cầu bình an nhưng cũng dễ bị lợi dụng."
        : (exactLookup?.entry?.meaning || tuongInfo?.cungInfo?.meaning || "");
      const fullLine = isCauTranTy
        ? "Cư Tỵ— Thụ cống (受贡): cống nạp, dâng hiến tiền bạc, vật phẩm cho quan sai, miếu mạo để giải hạn, mong cầu bình an nhưng cũng dễ bị lợi dụng."
        : (exactLookup?.entry?.fullLine || (sinoVietPoem ? `${sinoVietPoem}: ${meaning}` : `Cư ${thuongBranch}— ${tuongName}: ${meaning}`));

      return {
        tuongCungVi: tuongInfo?.cungInfo,
        tamAnPhu: {
          tuongName,
          tuongChinese,
          originalPoem,
          sinoVietPoem,
          meaning,
          fullLine,
        },
      };
    };

    const tuKhoa: TuKhoaItem[] = [
      {
        id: 1,
        name: "Đệ Nhất Khóa",
        sub: "Can Thượng Khóa",
        role: "Bản thân, chủ sự khởi tâm",
        thuongChi: CHI_NAMES[k1_th],
        thuongChinese: CHI_CHINESE[CHI_NAMES[k1_th]],
        thuongEl: CHI_ELEMENT_MAP[CHI_NAMES[k1_th]],
        haChi: CHI_NAMES[k1_ha],
        haName: `${dayCan} (kí ${CHI_NAMES[k1_ha]})`,
        haChinese: `${CAN_CHINESE[dayCan] || dayCan}`,
        haEl: CAN_ELEMENT_MAP[dayCan] || "Thổ",
        general: k1_gen,
        relation: k1_rel,
        lucThan: getLucThan(dayCan, CHI_ELEMENT_MAP[CHI_NAMES[k1_th]]),
        isThuongKhongVong: khongVong.branches.includes(CHI_NAMES[k1_th]),
        isHaKhongVong: khongVong.branches.includes(CHI_NAMES[k1_ha]),
        ...getKhoaTamAnInfo(k1_gen.name, CHI_NAMES[k1_th]),
      },
      {
        id: 2,
        name: "Đệ Nhị Khóa",
        sub: "Can Thần Khóa",
        role: "Tiến triển, biến hóa của Can",
        thuongChi: CHI_NAMES[k2_th],
        thuongChinese: CHI_CHINESE[CHI_NAMES[k2_th]],
        thuongEl: CHI_ELEMENT_MAP[CHI_NAMES[k2_th]],
        haChi: CHI_NAMES[k2_ha],
        haName: CHI_NAMES[k2_ha],
        haChinese: CHI_CHINESE[CHI_NAMES[k2_ha]],
        haEl: CHI_ELEMENT_MAP[CHI_NAMES[k2_ha]],
        general: k2_gen,
        relation: k2_rel,
        lucThan: getLucThan(dayCan, CHI_ELEMENT_MAP[CHI_NAMES[k2_th]]),
        isThuongKhongVong: khongVong.branches.includes(CHI_NAMES[k2_th]),
        isHaKhongVong: khongVong.branches.includes(CHI_NAMES[k2_ha]),
        ...getKhoaTamAnInfo(k2_gen.name, CHI_NAMES[k2_th]),
      },
      {
        id: 3,
        name: "Đệ Tam Khóa",
        sub: "Chi Thượng Khóa",
        role: "Gia đạo, hoàn cảnh, việc bên ngoài",
        thuongChi: CHI_NAMES[k3_th],
        thuongChinese: CHI_CHINESE[CHI_NAMES[k3_th]],
        thuongEl: CHI_ELEMENT_MAP[CHI_NAMES[k3_th]],
        haChi: CHI_NAMES[k3_ha],
        haName: CHI_NAMES[k3_ha],
        haChinese: CHI_CHINESE[CHI_NAMES[k3_ha]],
        haEl: CHI_ELEMENT_MAP[CHI_NAMES[k3_ha]],
        general: k3_gen,
        relation: k3_rel,
        lucThan: getLucThan(dayCan, CHI_ELEMENT_MAP[CHI_NAMES[k3_th]]),
        isThuongKhongVong: khongVong.branches.includes(CHI_NAMES[k3_th]),
        isHaKhongVong: khongVong.branches.includes(CHI_NAMES[k3_ha]),
        ...getKhoaTamAnInfo(k3_gen.name, CHI_NAMES[k3_th]),
      },
      {
        id: 4,
        name: "Đệ Tứ Khóa",
        sub: "Chi Thần Khóa",
        role: "Hậu quả, kết cục của Chi",
        thuongChi: CHI_NAMES[k4_th],
        thuongChinese: CHI_CHINESE[CHI_NAMES[k4_th]],
        thuongEl: CHI_ELEMENT_MAP[CHI_NAMES[k4_th]],
        haChi: CHI_NAMES[k4_ha],
        haName: CHI_NAMES[k4_ha],
        haChinese: CHI_CHINESE[CHI_NAMES[k4_ha]],
        haEl: CHI_ELEMENT_MAP[CHI_NAMES[k4_ha]],
        general: k4_gen,
        relation: k4_rel,
        lucThan: getLucThan(dayCan, CHI_ELEMENT_MAP[CHI_NAMES[k4_th]]),
        isThuongKhongVong: khongVong.branches.includes(CHI_NAMES[k4_th]),
        isHaKhongVong: khongVong.branches.includes(CHI_NAMES[k4_ha]),
        ...getKhoaTamAnInfo(k4_gen.name, CHI_NAMES[k4_th]),
      },
    ];

    // ----------------- TAM TRUYỀN (CỬU TÔNG MÔN) -----------------
    const dayCanPolarity = CAN_POLARITY_MAP[dayCan] || "am";

    let phatDoanIndex = 0; // 0..3 tương ứng Khóa 1..4
    let cucName = "Trọng Thẩm Cục (Hạ Tặc Thượng)";
    let cucDesc = "Hạ thần dâng tặc khắc lên Thượng thần, sự việc nội bộ phát khởi, mưu sự trước nan sau dị, giải tỏa uẩn khúc.";

    // 1. Kiểm tra Hạ Tặc Thượng
    const haTacList = tuKhoa
      .map((k, idx) => ({ k, idx }))
      .filter((x) => x.k.relation.type === "HA_TAC");

    if (haTacList.length === 1) {
      phatDoanIndex = haTacList[0].idx;
      cucName = "Trọng Thẩm Cục (Hạ Tặc Thượng)";
      cucDesc = "Hạ thần dâng tặc khắc lên Thượng thần, sự việc nội bộ phát khởi, mưu sự trước nan sau dị.";
    } else if (haTacList.length > 1) {
      // Tỉ Dụng: So sánh cùng tính Âm/Dương với Can Ngày
      const matched = haTacList.find((x) => CHI_POLARITY_MAP[x.k.thuongChi] === dayCanPolarity);
      phatDoanIndex = matched ? matched.idx : haTacList[0].idx;
      cucName = "Tỉ Dụng Cục (Tri Nhất Pháp)";
      cucDesc = "Nhiều mối tương tặc, chọn Thần tương hòa đồng tính Âm/Dương với Nhật Can để khai đoan phát sự.";
    } else {
      // 2. Kiểm tra Thượng Khắc Hạ
      const thuongKhacList = tuKhoa
        .map((k, idx) => ({ k, idx }))
        .filter((x) => x.k.relation.type === "THUONG_KHAC");

      if (thuongKhacList.length === 1) {
        phatDoanIndex = thuongKhacList[0].idx;
        cucName = "Nguyên Thủ Cục (Thượng Khắc Hạ)";
        cucDesc = "Thượng thần từ trên giáng khắc Hạ thần, chính nghĩa thắng tà khí, người trên chỉ thị, thuận lý hành sự.";
      } else if (thuongKhacList.length > 1) {
        const matched = thuongKhacList.find((x) => CHI_POLARITY_MAP[x.k.thuongChi] === dayCanPolarity);
        phatDoanIndex = matched ? matched.idx : thuongKhacList[0].idx;
        cucName = "Tỉ Dụng Cục (Thượng Khắc)";
        cucDesc = "Nhiều mối thượng khắc, chọn Thần đồng khí với Nhật Can phát đoan.";
      } else {
        // 3. Dao Khắc / Mão Tinh / Phục Ngâm
        if (T === H) {
          cucName = "Phục Ngâm Cục (Thiên Địa Đồng Vị)";
          cucDesc = "Thiên bàn trùng Địa bàn, sự việc ngưng trệ, nên giữ nguyên hiện trạng, tĩnh dĩ đãi động.";
          phatDoanIndex = dayCanPolarity === "duong" ? 0 : 2;
        } else if (Math.abs(T - H) === 6) {
          cucName = "Phản Ngâm Cục (Thiên Địa Đối Xung)";
          cucDesc = "Thiên bàn đối xung Địa bàn, biến động tráo trở mau lẹ, động tĩnh bất an, cần cẩn trọng.";
          phatDoanIndex = 0;
        } else {
          // Mão Tinh Cục
          cucName = "Mão Tinh Cục (Hổ Xuất Sơn Lâm)";
          cucDesc = "Tứ khóa vô khắc, khí vận quy tàng về cung Mão / Dậu, tĩnh cực sinh động, cơ duyên bất ngờ khai mở.";
          phatDoanIndex = dayCanPolarity === "duong" ? 0 : 2;
        }
      }
    }

    // Sơ Truyền
    let soBranchName = tuKhoa[phatDoanIndex].thuongChi;
    if (cucName.includes("Mão Tinh")) {
      soBranchName = dayCanPolarity === "duong" ? CHI_NAMES[skyBranch(9)] : CHI_NAMES[skyBranch(3)];
    }

    const soBranchIdx = Math.max(0, CHI_NAMES.indexOf(soBranchName));
    const trungBranchIdx = skyBranch(soBranchIdx);
    const matBranchIdx = skyBranch(trungBranchIdx);

    const soGroundIdx = groundBranch(soBranchIdx);
    const trungGroundIdx = groundBranch(trungBranchIdx);
    const matGroundIdx = groundBranch(matBranchIdx);

    const soBranch = CHI_NAMES[soBranchIdx];
    const trungBranch = CHI_NAMES[trungBranchIdx];
    const matBranch = CHI_NAMES[matBranchIdx];

    // Tạo chi tiết cho 1 truyền
    const createTruyenItem = (
      stage: "Sơ Truyền" | "Trung Truyền" | "Mạt Truyền",
      title: string,
      desc: string,
      branchName: string,
      groundIdx: number,
      defaultKvWarning: string
    ): TamTruyenItem => {
      const tuanDon = getTuanDonCan(dayCan, dayChi, branchName);
      const nguThuDon = getDonCan(dayCan, branchName);
      const activeCanName = tuanDon.can !== "Không" ? tuanDon.can : nguThuDon.can;
      const canData = CAN_LIST.find((c) => c.name === activeCanName) || CAN_LIST[0];
      const chiData = CHI_LIST.find((c) => c.name === branchName) || CHI_LIST[0];

      const chiLucThan = getLucThan(dayCan, chiData.element);
      const chiLucThanDetails = getLucThanDetails(chiLucThan);

      const canLucThan = getLucThan(dayCan, canData.element);
      const canLucThanDetails = getLucThanDetails(canLucThan);

      const isKv = khongVong.branches.includes(branchName);
      const dayEl = CAN_ELEMENT_MAP[dayCan] || "Thổ";

      let relVerb = "đồng hành ngũ hành";
      if (dayEl === chiData.element) relVerb = "đồng ngũ hành (Tỷ Hòa)";
      else if (
        (dayEl === "Thủy" && chiData.element === "Mộc") ||
        (dayEl === "Mộc" && chiData.element === "Hỏa") ||
        (dayEl === "Hỏa" && chiData.element === "Thổ") ||
        (dayEl === "Thổ" && chiData.element === "Kim") ||
        (dayEl === "Kim" && chiData.element === "Thủy")
      ) relVerb = "sinh xuất";
      else if (
        (chiData.element === "Thủy" && dayEl === "Mộc") ||
        (chiData.element === "Mộc" && dayEl === "Hỏa") ||
        (chiData.element === "Hỏa" && dayEl === "Thổ") ||
        (chiData.element === "Thổ" && dayEl === "Kim") ||
        (chiData.element === "Kim" && dayEl === "Thủy")
      ) relVerb = "sinh nhập (được sinh)";
      else if (
        (dayEl === "Thủy" && chiData.element === "Hỏa") ||
        (dayEl === "Hỏa" && chiData.element === "Kim") ||
        (dayEl === "Kim" && chiData.element === "Mộc") ||
        (dayEl === "Mộc" && chiData.element === "Thổ") ||
        (dayEl === "Thổ" && chiData.element === "Thủy")
      ) relVerb = "khắc xuất";
      else relVerb = "bị khắc (khắc nhập)";

      const relationSummary = `Nhật Can [${dayCan}] ${relVerb} Chi [${branchName}] ➔ Lục Thân là ${chiLucThan.toUpperCase()}`;

      return {
        stage,
        title,
        desc,
        can: activeCanName,
        canChinese: canData.chinese,
        canElement: canData.element,
        canPolarity: canData.polarity,
        canSymbol: canData.symbol,
        canEmoji: canData.emoji,
        canColorText: canData.colorText,
        canBadgeBg: canData.badgeBg,
        canLucThan,
        canLucThanColor: canLucThanDetails.badgeColor,
        canLucThanMeaning: canLucThanDetails.meaning,
        branch: branchName,
        chinese: chiData.chinese,
        element: chiData.element,
        branchPolarity: chiData.polarity,
        zodiac: chiData.zodiac,
        chiEmoji: chiData.emoji,
        general: generalMap[groundIdx] || LUC_NHAM_THIEN_TUONG_LIST[0],
        // Cẩm nang 12 thần lâm 12 cung là tính THIÊN BÀN (branchName của Truyền Chi)
        tuongCungVi: getThienTuongCungViInfo((generalMap[groundIdx] || LUC_NHAM_THIEN_TUONG_LIST[0]).name, branchName)?.cungInfo,
        lucThan: chiLucThan,
        lucThanMeaning: chiLucThanDetails.meaning,
        lucThanColor: chiLucThanDetails.badgeColor,
        lucThanRole: chiLucThanDetails.role,
        relationSummary,
        groundBranch: CHI_NAMES[groundIdx],
        isKhongVong: isKv,
        khongVongNote: isKv ? defaultKvWarning : "",
        tuanDonCan: tuanDon.can,
        nguThuDonCan: nguThuDon.can,
      };
    };

    const tamTruyen: TamTruyenItem[] = [
      createTruyenItem(
        "Sơ Truyền",
        "Phát Đoan",
        "Khởi đầu sự việc, mầm mống bắt đầu phát sinh",
        soBranch,
        soGroundIdx,
        `Sơ Truyền lâm Không Vong (${khongVong.branches.join(", ")}): Mầm mống ban đầu hư vô, sự việc khởi đầu hữu danh vô thực, đề phòng lừa gạt, lời hứa suông hoặc xuất tiền vô ích.`
      ),
      createTruyenItem(
        "Trung Truyền",
        "Di Truyền",
        "Tiến trình diễn biến, quá trình biến chuyển giữa chừng",
        trungBranch,
        trungGroundIdx,
        `Trung Truyền lâm Không Vong (${khongVong.branches.join(", ")}): Diễn biến giữa chừng đứt gãy, biến thiên đổi hướng bất ngờ, tiến thoái lưỡng nan, người hợp tác dễ đổi ý.`
      ),
      createTruyenItem(
        "Mạt Truyền",
        "Quy Cục",
        "Kết quả chung cuộc, nơi quy túc và an định cuối cùng",
        matBranch,
        matGroundIdx,
        `Mạt Truyền lâm Không Vong (${khongVong.branches.join(", ")}): Kết quả chung cuộc quy về hư không, công dã tràng khó toại ý, nên buông xả không cưỡng cầu, vạn sự tùy duyên.`
      ),
    ];

    // ----------------- TÂM ẤN PHÚ NGUYỆT TƯỚNG (THÁI DƯƠNG) -----------------
    const ntPalace = palaces.find((p) => p.skyName === selectedTuong.branch) || palaces[0];
    const nguyetTuongTamAn = {
      generalName: ntPalace.general.name,
      generalChinese: ntPalace.general.chinese,
      branch: selectedTuong.branch,
      term: selectedTuong.term,
      tuongName: selectedTuong.name,
      groundBranch: ntPalace.groundName,
      ...getKhoaTamAnInfo(ntPalace.general.name, selectedTuong.branch),
    };

    // ----------------- TÂM ẤN PHÚ HOẠT THỜI (THỜI THẦN) -----------------
    const htPalace = palaces.find((p) => p.groundName === activeThoiBranchName) || palaces[H];
    const hoatThoiTamAn = {
      generalName: htPalace.general.name,
      generalChinese: htPalace.general.chinese,
      groundBranch: activeThoiBranchName,
      skyBranch: htPalace.skyName, // Nguyệt Tướng gia lâm lên Thời Thần
      ...getKhoaTamAnInfo(htPalace.general.name, htPalace.skyName),
    };

    // ----------------- TÂM ẤN PHÚ NHẬT CHIÊM (CAN CHI NGÀY) -----------------
    const nhatTrucGeneral = selectedTuongThan?.name || "Quý Nhân";
    const nhatTrucTamAn = {
      generalName: nhatTrucGeneral,
      dayCan,
      dayChi,
      canThuongTamAn: tuKhoa[0].tamAnPhu,
      chiThuongTamAn: tuKhoa[2].tamAnPhu,
      trucNhatTamAn: getKhoaTamAnInfo(nhatTrucGeneral, dayChi).tamAnPhu,
    };

    return {
      palaces,
      nobleBranchName: activeNobleBranchName,
      nobleGroundIndex,
      nobleGroundName,
      isShunXing,
      isEffectiveDaytimeNoble,
      nobleRuleText: nobleInfo.poem,
      nobleRuleId: selectedNobleRule,
      nobleRuleTitle: nobleInfo.ruleTitle,
      nobleRuleShort: nobleInfo.ruleShort,
      khongVong,
      tuKhoa,
      phatDoanIndex,
      tamTruyen,
      cucName,
      cucDesc,
      nguyetTuongTamAn,
      hoatThoiTamAn,
      nhatTrucTamAn,
    };
  }, [
    nguyetTuongBranchIndex,
    activeThoiBranchIndex,
    dayCan,
    dayChi,
    activeNobleBranchIndex,
    activeNobleBranchName,
    isEffectiveDaytimeNoble,
    nobleInfo.poem,
    nobleInfo.ruleTitle,
    nobleInfo.ruleShort,
    selectedNobleRule,
    selectedTuong.branch,
    selectedTuong.term,
    selectedTuong.name,
    activeThoiBranchName,
    selectedTuongThan?.name,
  ]);

  // Xuất trạng thái Thiên Bàn • 12 Thiên Tướng để Thực Thi Thiên bên trên sao chép trực tiếp 100%
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const skyGeneralMap: Record<string, { generalName: string; groundName: string }> = {};
      lucNhamData.palaces.forEach((p) => {
        skyGeneralMap[p.skyName] = {
          generalName: p.general.name,
          groundName: p.groundName,
        };
      });

      const payload = {
        storageScope,
        skyGeneralMap,
        dayCan,
        dayChi,
        hourChi,
        nguyetTuong: selectedTuong.branch,
        nguyetTuongName: selectedTuong.name,
        nguyetTuongTerm: selectedTuong.term,
        hoatThoi: activeThoiBranchName,
        nobleRule: selectedNobleRule,
        nguyetTuongTamAn: lucNhamData.nguyetTuongTamAn,
        hoatThoiTamAn: lucNhamData.hoatThoiTamAn,
        nhatTrucTamAn: lucNhamData.nhatTrucTamAn,
        updatedAt: Date.now(),
      };

      localStorage.setItem(`lucnham_thien_ban_map_${storageScope}`, JSON.stringify(payload));
      window.dispatchEvent(new CustomEvent("lucnham-chart-updated", { detail: payload }));
    } catch {}
  }, [
    lucNhamData,
    storageScope,
    dayCan,
    dayChi,
    hourChi,
    selectedTuong.branch,
    activeThoiBranchName,
    selectedNobleRule,
  ]);

  // Xoay xí ngầu 12 mặt
  const handleRollDice = () => {
    if (isRolling) return;
    setIsRolling(true);
    setJustApplied(false);
    playDiceSound();

    let step = 0;
    const totalSteps = 16 + Math.floor(Math.random() * 8);
    const finalTarget = Math.floor(Math.random() * 12);

    if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);

    rollIntervalRef.current = setInterval(() => {
      step++;
      setRollingDisplayIndex((prev) => (prev + 1 + Math.floor(Math.random() * 3)) % 12);

      if (step >= totalSteps) {
        clearInterval(rollIntervalRef.current);
        setHoatThoiIndex(finalTarget);
        setRollingDisplayIndex(finalTarget);
        setIsRolling(false);
        handleSetTimePlateSource("hoatthoi");
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(keyHoatThoi, CHI_NAMES[finalTarget]);
          } catch {}
        }
        if (onSelectHoatThoi) {
          onSelectHoatThoi(CHI_LIST[finalTarget].name);
        }
      }
    }, 55);
  };

  useEffect(() => {
    return () => {
      if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);
    };
  }, []);

  // Lựa chọn Hoạt Thời trực tiếp từ danh sách 12 Địa Chi
  const handleSelectHoatThoi = (idx: number) => {
    if (isRolling) return;
    setHoatThoiIndex(idx);
    setRollingDisplayIndex(idx);
    handleSetTimePlateSource("hoatthoi");
    setIsHoatThoiSelectOpen(false);
    setJustApplied(false);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(keyHoatThoi, CHI_NAMES[idx]);
      } catch {}
    }
    if (onSelectHoatThoi) {
      onSelectHoatThoi(CHI_LIST[idx].name);
    }
  };

  const handleApplyToHourPillar = () => {
    if (onApplyHoatThoi) {
      onApplyHoatThoi(currentHoatThoi.name);
      setJustApplied(true);
      setTimeout(() => setJustApplied(false), 2500);
    }
  };

  /**
   * Chọn Ngày Giờ Hiện Tại cho Bát Tự Lục Nhâm (Ngày • Giờ • Nguyệt Tướng thời gian thực)
   */
  const handleSelectCurrentDateTime = () => {
    if (onSetCurrentDateTime) {
      onSetCurrentDateTime();
    }
    // Cập nhật Nguyệt Tướng theo Tiết Khí thực tế hiện tại
    const realTuong = getDefaultNguyetTuong(new Date());
    handleSelectTuong(realTuong);

    // Chuyển nguồn Thời Thần sang Trụ Giờ Bát Tự để bàn quẻ phản ánh đúng giờ hiện tại
    handleSetTimePlateSource("trugio");

    setSaveToastMsg("Đã nạp chính xác Bát Tự Lục Nhâm & Nguyệt Tướng thời gian thực tế!");
    setTimeout(() => setSaveToastMsg(null), 3500);
  };

  // =========================================================================
  // CÂU HỎI CHIÊM ĐOÁN & LƯU QUẺ LỤC NHÂM (ĐỘC LẬP THEO TỪNG BẢNG)
  // =========================================================================
  const [question, setQuestion] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(keyQuestion) || "";
    }
    return "";
  });

  const handleQuestionChange = (newVal: string) => {
    setQuestion(newVal);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(keyQuestion, newVal);
      } catch {}
    }
  };

  const [savedRecords, setSavedRecords] = useState<SavedLucNhamRecord[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(keyRecords);
        if (saved) return JSON.parse(saved);
        if (storageScope === "hoagiap") {
          const legacy = localStorage.getItem("lucnham_saved_records_v1");
          if (legacy) return JSON.parse(legacy);
        }
      } catch (e) {
        console.error("Failed to parse saved lucnham records:", e);
      }
    }
    return [];
  });

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [saveToastMsg, setSaveToastMsg] = useState<string | null>(null);
  const [historySearchQuery, setHistorySearchQuery] = useState<string>("");
  const [copiedRecordId, setCopiedRecordId] = useState<string | null>(null);
  const [confirmDeleteRecordId, setConfirmDeleteRecordId] = useState<string | null>(null);
  const [isConfirmClearAllRecords, setIsConfirmClearAllRecords] = useState<boolean>(false);

  const QUICK_QUESTION_TOPICS = [
    "Công việc sự nghiệp",
    "Tài lộc buôn bán",
    "Xuất hành di chuyển",
    "Tình cảm gia đạo",
    "Sức khỏe an khang",
    "Kiện tụng tranh chấp",
    "Cầu danh thi cử",
    "Mưu sự hợp tác",
  ];

  const handleSaveLucNhamRecord = () => {
    const q = question.trim() || `Chiêm việc Lục Nhâm ngày ${dayCan} ${dayChi} giờ ${activeThoiBranchName}`;
    const now = new Date();
    const formattedDate = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")} - ${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1).toString().padStart(2, "0")}/${now.getFullYear()}`;

    const newRecord: SavedLucNhamRecord = {
      id: `lucnham_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: Date.now(),
      formattedDate,
      question: q,
      dayCan,
      dayChi,
      hourCan,
      hourChi,
      timePlateSource,
      hoatThoiIndex,
      activeThoiBranch: activeThoiBranchName,
      nguyetTuong: {
        name: selectedTuong.name,
        branch: selectedTuong.branch,
        solarTerm: selectedTuong.term,
      },
      nobleRuleId: selectedNobleRule,
      nobleRuleTitle: nobleInfo.ruleTitle,
      isEffectiveDaytimeNoble,
      activeNobleBranch: activeNobleBranchName,
      isShunXing: lucNhamData.isShunXing,
      tuKhoa: lucNhamData.tuKhoa.map((k) => ({
        name: k.name,
        thuong: k.thuongChi,
        ha: k.haName || k.haChi,
        general: k.general.name,
      })),
      tamTruyen: {
        patternName: lucNhamData.cucName,
        soTruyen: {
          branch: lucNhamData.tamTruyen[0]?.branch || "",
          general: lucNhamData.tamTruyen[0]?.general?.name || "",
        },
        trungTruyen: {
          branch: lucNhamData.tamTruyen[1]?.branch || "",
          general: lucNhamData.tamTruyen[1]?.general?.name || "",
        },
        matTruyen: {
          branch: lucNhamData.tamTruyen[2]?.branch || "",
          general: lucNhamData.tamTruyen[2]?.general?.name || "",
        },
      },
      khongVong: {
        branches: lucNhamData.khongVong.branches,
        tuanGiap: lucNhamData.khongVong.tuanGiap,
      },
    };

    const updated = [newRecord, ...savedRecords];
    setSavedRecords(updated);
    try {
      localStorage.setItem(keyRecords, JSON.stringify(updated));
    } catch (err) {
      console.error("Failed to save lucnham record:", err);
    }

    setSaveToastMsg(`Đã lưu quẻ: "${q.slice(0, 28)}${q.length > 28 ? "..." : ""}"!`);
    setTimeout(() => setSaveToastMsg(null), 3500);
  };

  const handleLoadRecord = (record: SavedLucNhamRecord) => {
    handleQuestionChange(record.question);
    handleSetTimePlateSource(record.timePlateSource);
    if (record.hoatThoiIndex !== undefined) {
      setHoatThoiIndex(record.hoatThoiIndex);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(keyHoatThoi, CHI_NAMES[record.hoatThoiIndex]);
        } catch {}
      }
    }
    const nt = NGUYET_TUONG_LIST.find((t) => t.branch === record.nguyetTuong.branch);
    if (nt) {
      handleSelectTuong(nt);
    }
    if (record.nobleRuleId) {
      handleSelectNobleRule(record.nobleRuleId);
    }
    setNobleMode(record.isEffectiveDaytimeNoble ? "manual_day" : "manual_night");
    setManualNobleIsDay(record.isEffectiveDaytimeNoble);
    setIsHistoryModalOpen(false);
    setIsLucNhamChartOpen(true);
    setSaveToastMsg(`Đã nạp quẻ: "${record.question.slice(0, 28)}..." vào bàn quẻ!`);
    setTimeout(() => setSaveToastMsg(null), 3000);
  };

  const handleDeleteRecord = (id: string) => {
    const updated = savedRecords.filter((r) => r.id !== id);
    setSavedRecords(updated);
    setConfirmDeleteRecordId(null);
    try {
      localStorage.setItem(keyRecords, JSON.stringify(updated));
    } catch (err) {}
    setSaveToastMsg("Đã xóa quẻ Lục Nhâm đã lưu!");
    setTimeout(() => setSaveToastMsg(null), 2500);
  };

  const handleClearAllRecords = () => {
    setSavedRecords([]);
    setIsConfirmClearAllRecords(false);
    try {
      localStorage.removeItem(keyRecords);
    } catch {}
    setSaveToastMsg("Đã xóa toàn bộ lịch sử quẻ Lục Nhâm!");
    setTimeout(() => setSaveToastMsg(null), 2500);
  };

  const handleCopyCurrentSummary = () => {
    const q = question.trim() || `Chiêm việc Lục Nhâm ngày ${dayCan} ${dayChi} giờ ${activeThoiBranchName}`;
    const now = new Date();
    const formattedDate = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")} - ${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1).toString().padStart(2, "0")}/${now.getFullYear()}`;

    const text = `☯ BÀN QUẺ LỤC NHÂM ĐẠI ĐỘN
• Việc chiêm: ${q}
• Thời điểm: ${formattedDate}
• Can Chi: Ngày ${dayCan} ${dayChi} • Giờ ${hourCan} ${hourChi}
• Nhật Chiêm: Can ${dayCan} kí ${lucNhamData.tuKhoa[0].haName || ""} • Chi ${dayChi} [Can Thượng: 《${lucNhamData.tuKhoa[0].tamAnPhu?.tuongName || ""}》 • Chi Thượng: 《${lucNhamData.tuKhoa[2].tamAnPhu?.tuongName || ""}》]
• Nguyệt Tướng: ${selectedTuong.name} (${selectedTuong.branch} - ${selectedTuong.term}) [Tâm Ấn: 《${lucNhamData.nguyetTuongTamAn.tamAnPhu.tuongName}》]
• Thời Thần: ${activeThoiBranchName} (${timePlateSource === "hoatthoi" ? "Hoạt Thời Xí Ngầu" : "Trụ Giờ Bát Tự"}) [Tâm Ấn: 《${lucNhamData.hoatThoiTamAn.tamAnPhu.tuongName}》]
• Tuần Không: ${lucNhamData.khongVong.branches.join(", ")} (${lucNhamData.khongVong.tuanGiap})
• Quý Nhân: ${activeNobleBranchName} (${isEffectiveDaytimeNoble ? "Trú Quý" : "Dạ Quý"} • ${lucNhamData.isShunXing ? "Thuận Hành" : "Nghịch Hành"} • ${nobleInfo.ruleShort})
• Tam Truyền: [${lucNhamData.cucName}]
  - Sơ Truyền: ${lucNhamData.tamTruyen[0]?.branch} (${lucNhamData.tamTruyen[0]?.general?.name})
  - Trung Truyền: ${lucNhamData.tamTruyen[1]?.branch} (${lucNhamData.tamTruyen[1]?.general?.name})
  - Mạt Truyền: ${lucNhamData.tamTruyen[2]?.branch} (${lucNhamData.tamTruyen[2]?.general?.name})
• Tứ Khóa:
  ${lucNhamData.tuKhoa.map((k, i) => `- Khóa ${i + 1} (${k.name}): ${k.thuongChi} trên ${k.haName || k.haChi} [${k.general.name}${k.tamAnPhu?.tuongName ? ` • Tâm Ấn: 《${k.tamAnPhu.tuongName}》` : ""}]`).join("\n  ")}
`;
    navigator.clipboard.writeText(text);
    setSaveToastMsg("Đã sao chép tóm tắt bàn quẻ vào bộ nhớ tạm!");
    setTimeout(() => setSaveToastMsg(null), 2500);
  };

  const handleCopyRecordSummary = (rec: SavedLucNhamRecord) => {
    const text = `☯ BÀN QUẺ LỤC NHÂM ĐẠI ĐỘN (ĐÃ LƯU)
• Việc chiêm: ${rec.question}
• Thời điểm: ${rec.formattedDate}
• Can Chi: Ngày ${rec.dayCan} ${rec.dayChi} • Giờ ${rec.hourCan} ${rec.hourChi}
• Nguyệt Tướng: ${rec.nguyetTuong.name} (${rec.nguyetTuong.branch})
• Thời Thần: ${rec.activeThoiBranch} (${rec.timePlateSource === "hoatthoi" ? "Hoạt Thời" : "Trụ Giờ"})
• Tuần Không: ${rec.khongVong.branches.join(", ")} (${rec.khongVong.tuanGiap})
• Quý Nhân: ${rec.activeNobleBranch} (${rec.isEffectiveDaytimeNoble ? "Trú Quý" : "Dạ Quý"} • ${rec.isShunXing ? "Thuận Hành" : "Nghịch Hành"})
• Tam Truyền: [${rec.tamTruyen.patternName}]
  - Sơ Truyền: ${rec.tamTruyen.soTruyen.branch} (${rec.tamTruyen.soTruyen.general})
  - Trung Truyền: ${rec.tamTruyen.trungTruyen.branch} (${rec.tamTruyen.trungTruyen.general})
  - Mạt Truyền: ${rec.tamTruyen.matTruyen.branch} (${rec.tamTruyen.matTruyen.general})
• Tứ Khóa:
  ${rec.tuKhoa.map((k, i) => `- Khóa ${i + 1} (${k.name}): ${k.thuong} trên ${k.ha} [${k.general}]`).join("\n  ")}
`;
    navigator.clipboard.writeText(text);
    setCopiedRecordId(rec.id);
    setTimeout(() => setCopiedRecordId(null), 2000);
  };

  const handleExportBackup = () => {
    const jsonStr = JSON.stringify(savedRecords, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lucnham_saved_records_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Map 12 cung lên lưới 4x4 truyền thống:
  // Tỵ(5)[0,0], Ngọ(6)[0,1], Mùi(7)[0,2], Thân(8)[0,3]
  // Dậu(9)[1,3], Tuất(10)[2,3], Hợi(11)[3,3]
  // Tý(0)[3,2], Sửu(1)[3,1], Dần(2)[3,0]
  // Mão(3)[2,0], Thìn(4)[1,0]
  const GRID_COORDS: Record<number, { row: number; col: number }> = {
    5: { row: 0, col: 0 },
    6: { row: 0, col: 1 },
    7: { row: 0, col: 2 },
    8: { row: 0, col: 3 },
    9: { row: 1, col: 3 },
    10: { row: 2, col: 3 },
    11: { row: 3, col: 3 },
    0: { row: 3, col: 2 },
    1: { row: 3, col: 1 },
    2: { row: 3, col: 0 },
    3: { row: 2, col: 0 },
    4: { row: 1, col: 0 },
  };

  return (
    <div
      className={`border border-[#C4963E]/45 bg-gradient-to-b from-[#FFFDF8] via-[#FFFDF8] to-[#FFFDF8] rounded-2xl p-4 sm:p-5 shadow-lg space-y-4 ${className}`}
    >
      {/* Header Panel */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#C4963E]/45 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#FFFDF8] border border-[#C4963E]/45 text-[#6E4E16] shadow-inner">
            <Sparkles className="w-5 h-5 text-[#92400E]" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-serif font-bold text-[#1C1813] flex items-center gap-2 flex-wrap">
              <span>TRỰC NHẬT TINH (LỤC NHÂM ĐẠI ĐỘN) • NGUYỆT TƯỚNG • HOẠT THỜI</span>
              {boardContextLabel && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF6EE] text-[#6E4E16] border border-amber-600/70">
                  {boardContextLabel}
                </span>
              )}
              <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-[#FAF6EE] text-[#6E4E16] border border-[#C4963E]/45">
                Tam Thức Chi Thủ
              </span>
            </h3>
            <p className="text-[11px] text-[#5C4D3C] mt-0.5">
              Thập Nhị Thiên Tướng trực ngày • Thái Dương cung vị của tháng • Xí ngầu 12 mặt gieo Hoạt Thời
            </p>
          </div>
        </div>

        {/* Nút Xoay Xí Ngầu Nhanh */}
        <button
          type="button"
          disabled={isRolling}
          onClick={handleRollDice}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-medium text-xs border transition-all cursor-pointer shadow-md active:scale-95 ${
            isRolling
              ? "bg-[#FAF6EE] text-[#6E4E16] border-[#B8862D] animate-pulse"
              : "bg-gradient-to-r from-[#C9A55A] to-[#C59B27] hover:from-[#E5C158] hover:to-[#C9A55A] text-[#120F0B] font-bold border-[#B8862D] shadow-[0_0_12px_rgba(212,175,55,0.25)]"
          }`}
          title="Lắc xí ngầu 12 mặt để lấy Hoạt Thời ngẫu nhiên"
        >
          <Dices className={`w-4 h-4 ${isRolling ? "animate-spin" : ""}`} />
          <span>{isRolling ? "Đang Xoay..." : "Lắc Xí Ngầu Hoạt Thời"}</span>
        </button>
      </div>

      {/* Grid 3 Khung: TRỰC NHẬT TINH - NGUYỆT TƯỚNG - HOẠT THỜI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        {/* ================= KHUNG 1: TRỰC NHẬT TINH ================= */}
        <div className="bg-[#FFFDF8] border border-[#C4963E]/45 rounded-xl p-3.5 flex flex-col justify-between relative">
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-[#5C4D3C] font-semibold flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-[#92400E] fill-amber-400" />
                TRỰC NHẬT TINH (Lục Nhâm)
              </span>

              <div className="flex items-center gap-1 bg-[#FFFDF8] p-0.5 rounded-lg border border-[#C4963E]/45">
                <button
                  type="button"
                  onClick={() => setStarViewMode("tuong12")}
                  className={`px-1.5 py-0.5 text-[10px] rounded cursor-pointer transition-all ${
                    starViewMode === "tuong12"
                      ? "bg-[#C9A55A] text-[#120F0B] font-bold shadow"
                      : "text-[#5C4D3C] hover:text-[#1C1813]"
                  }`}
                  title="Thập Nhị Thiên Tướng (12 Quý Thần Lục Nhâm Đại Độn)"
                >
                  12 Tướng
                </button>
                <button
                  type="button"
                  onClick={() => setStarViewMode("lucdieu")}
                  className={`px-1.5 py-0.5 text-[10px] rounded cursor-pointer transition-all ${
                    starViewMode === "lucdieu"
                      ? "bg-[#C9A55A] text-[#120F0B] font-bold shadow"
                      : "text-[#5C4D3C] hover:text-[#1C1813]"
                  }`}
                  title="Lục Diệu Trực Tinh Khổng Minh Lục Nhâm Đại Độn"
                >
                  Lục Diệu
                </button>
              </div>
            </div>

            {/* Thông tin Can Ngày & Quý Nhân theo Trụ Giờ */}
            <div className="flex items-center justify-between bg-[#FFFDF8] border border-[#C4963E]/45 rounded-lg px-2.5 py-1.5 mb-2.5 text-[11px] gap-1 flex-wrap">
              <div className="text-[#1C1813]">
                Nhật Can <strong className="text-[#6E4E16] font-serif">{dayCan}</strong> (Chi{" "}
                <strong className="text-[#6E4E16] font-serif">{dayChi}</strong>)
              </div>
              <div className="flex items-center gap-1.5">
                {/* 3 Lựa Chọn Khởi Quý Selector nhanh */}
                <button
                  type="button"
                  onClick={() => setIsNobleRuleModalOpen(true)}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] border border-[#C4963E]/45 bg-[#FFFDF8] hover:bg-[#FAF6EE] text-[#6E4E16] cursor-pointer transition-all"
                  title="3 Lựa Chọn Khởi Quý Nhân (bấm để xem & đổi quy tắc)"
                >
                  <Crown className="w-2.5 h-2.5 text-[#92400E]" />
                  <span>{selectedNobleRule === "jia_yang_wu_geng_niu" ? "LC 1" : selectedNobleRule === "jia_wu_geng_niu_yang_tu_she" ? "LC 2" : "LC 3"}</span>
                  <ChevronDown className="w-2.5 h-2.5 opacity-70" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (nobleMode === "auto_hour") {
                      setNobleMode("manual_day");
                      setManualNobleIsDay(!isHourDaytime);
                    } else {
                      setManualNobleIsDay(!manualNobleIsDay);
                    }
                  }}
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] border cursor-pointer transition-all ${
                    isEffectiveDaytimeNoble
                      ? "bg-[#FEF3C7] border-amber-600/80 text-[#78350F]"
                      : "bg-[#E0E7FF] border-indigo-700/80 text-indigo-200"
                  }`}
                  title="Định Quý Nhân theo Trụ Giờ (bấm để đổi thủ công Trú/Dạ)"
                >
                  {isEffectiveDaytimeNoble ? (
                    <>
                      <Sun className="w-2.5 h-2.5 text-[#92400E]" />
                      <span>Trú Quý: <strong>{nobleInfo.truQuy}</strong></span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-2.5 h-2.5 text-[#3730A3]" />
                      <span>Dạ Quý: <strong>{nobleInfo.daQuy}</strong></span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Chế độ 1: 12 Thiên Tướng */}
            {starViewMode === "tuong12" ? (() => {
              const currentPalaceForGeneral = lucNhamData.palaces.find(
                (p) => p.general.name === selectedTuongThan.name
              );
              const tuongDetail = LUC_NHAM_THIEN_TUONG_12_CUNG_DATA.find(
                (g) => g.name === selectedTuongThan.name
              );

              return (
                <div className="space-y-2.5">
                  <div className="flex items-start gap-3 bg-[#FFFDF8] border border-[#C4963E]/45 rounded-xl p-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FAF6EE] to-[#FFFDF8] border border-[#C4963E]/45 flex flex-col items-center justify-center shrink-0 shadow-inner mt-0.5">
                      <span className={`text-base font-serif font-bold ${selectedTuongThan.color}`}>
                        {selectedTuongThan.name}
                      </span>
                      <span className="text-[10px] text-[#5C4D3C]">{selectedTuongThan.chinese}</span>
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-sm font-bold text-[#1C1813]">
                          Thiên Tướng {selectedTuongThan.name}
                        </h4>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold border ${selectedTuongThan.natureColor}`}>
                          {selectedTuongThan.nature}
                        </span>
                        {selectedTuongThan.numbers && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-[#FEF3C7] border border-amber-700/60 text-[#78350F]">
                            {selectedTuongThan.numbers}
                          </span>
                        )}
                      </div>

                      {/* Ý nghĩa thực tế cốt lõi */}
                      {selectedTuongThan.overview && (
                        <div className="text-[11px] text-[#6E4E16] font-serif font-medium leading-relaxed bg-[#FFFDF8] p-1.5 rounded-lg border border-[#C4963E]/45">
                          "{selectedTuongThan.overview}"
                        </div>
                      )}

                      {/* Vị trí đang ngự trên bàn hiện tại (Tính Thiên Bàn) */}
                      {currentPalaceForGeneral && currentPalaceForGeneral.tuongCungVi && (
                        <div className="text-[10.5px] bg-[#FFFDF8] border border-amber-600/70 p-2 rounded-lg text-[#78350F] space-y-1">
                          <div className="flex items-center justify-between gap-1 flex-wrap">
                            <span className="font-bold text-[#6E4E16]">
                              ⚡ Hiện Cư Thiên Bàn [{currentPalaceForGeneral.skyName}] (lâm Địa {currentPalaceForGeneral.groundName}):
                            </span>
                            <span className="font-serif font-bold text-[#78350F]">
                              {currentPalaceForGeneral.tuongCungVi.tuongName} ({currentPalaceForGeneral.tuongCungVi.tuongChinese})
                            </span>
                          </div>
                          {currentPalaceForGeneral.tuongCungVi.tamAnPhuOriginal && (
                            <div className="text-[#78350F] font-serif italic text-[10px] bg-[#FFFDF8] px-2 py-0.5 rounded border border-[#D97706]/45">
                              📜 Tâm Ấn Phú: {currentPalaceForGeneral.tuongCungVi.tamAnPhuOriginal} — {currentPalaceForGeneral.tuongCungVi.tamAnPhu}
                            </div>
                          )}
                          <div className="text-[#1C1813]">
                            {currentPalaceForGeneral.tuongCungVi.meaning}
                          </div>
                        </div>
                      )}

                      {selectedTuongThan.specialNotes && (
                        <div className="text-[10px] text-[#78350F] italic">
                          💡 {selectedTuongThan.specialNotes}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        if (tuongDetail) setGeneralModalActiveId(tuongDetail.id);
                        setIs12GeneralModalOpen(true);
                      }}
                      className="text-[11px] text-[#6E4E16] hover:text-white flex items-center gap-1.5 cursor-pointer bg-gradient-to-r from-[#FAF6EE] to-[#FFFDF8] hover:from-[#FAF6EE] hover:to-[#FAF6EE] px-2.5 py-1 rounded-lg border border-[#C4963E]/45 shadow-sm transition-all"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-[#92400E]" />
                      <span>Xem 12 Cung Thần Lâm (Cư Tý → Cư Hợi)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsTuongThanSelectOpen(!isTuongThanSelectOpen)}
                      className="text-[11px] text-[#6E4E16] hover:underline flex items-center gap-1 cursor-pointer bg-[#FFFDF8] px-2 py-0.5 rounded border border-[#C4963E]/45"
                    >
                      <span>Chọn trong 12 Thiên Tướng</span>
                      <ChevronDown className={`w-3 h-3 transition-transform ${isTuongThanSelectOpen ? "rotate-180" : ""}`} />
                    </button>
                  </div>

                  {isTuongThanSelectOpen && (
                    <div className="p-2 bg-[#FFFDF8] border border-[#C4963E]/45 rounded-xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 max-h-56 overflow-y-auto scrollbar-thin animate-in fade-in">
                      {LUC_NHAM_THIEN_TUONG_LIST.map((item) => (
                        <button
                          key={item.index}
                          type="button"
                          onClick={() => {
                            setSelectedTuongThan(item);
                            setIsTuongThanSelectOpen(false);
                          }}
                          className={`p-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                            selectedTuongThan.index === item.index
                              ? "bg-[#C9A55A] text-[#120F0B] font-bold border-[#B8862D] shadow-md"
                              : "bg-[#FFFDF8] hover:bg-[#FAF6EE] text-[#1C1813] border-[#C4963E]/45"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[11px] font-serif font-bold">{item.name}</span>
                            <span className="text-[9px] text-[#5C4D3C]">{item.chinese}</span>
                          </div>
                          <div className="text-[9px] text-[#5C4D3C] truncate">
                            {item.numbers || item.element}
                          </div>
                          <div className={`text-[8.5px] font-semibold mt-0.5 ${item.color}`}>{item.nature}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })() : (
              <div className="space-y-2">
                <div className="flex items-center gap-3 bg-[#FFFDF8] border border-[#C4963E]/45 rounded-xl p-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FAF6EE] to-[#FFFDF8] border border-[#C4963E]/45 flex flex-col items-center justify-center shrink-0 shadow-inner">
                    <span className={`text-base font-serif font-bold ${lucDieuData.info.color}`}>
                      {lucDieuData.info.name}
                    </span>
                    <span className="text-[10px] text-[#5C4D3C]">{lucDieuData.info.chinese}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-sm font-bold text-[#1C1813]">
                        {lucDieuData.info.name} • {lucDieuData.info.star}
                      </h4>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold border ${lucDieuData.info.natureColor}`}>
                        {lucDieuData.info.nature}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#6E4E16] mt-0.5">
                      Âm lịch: Tháng {lucDieuData.lunarMonth} • Ngày {lucDieuData.lunarDay}
                    </div>
                    <p className="text-[10px] text-[#5C4D3C] mt-0.5 italic line-clamp-1">
                      "{lucDieuData.info.poem}"
                    </p>
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-[#FFFDF8] border border-[#C4963E]/45 text-[10px] text-[#5C4D3C]">
                  {lucDieuData.info.desc}
                </div>
              </div>
            )}

            {/* TÂM ẤN PHÚ NHẬT CHIÊM (CAN THƯỢNG & CHI THƯỢNG & TRỰC NGÀY) */}
            <div className="mt-2.5 p-2.5 rounded-xl bg-gradient-to-b from-[#FFFDF8] to-[#FFFDF8] border border-[#C4963E]/45 space-y-2 shadow-inner">
              <div className="flex items-center justify-between border-b border-[#C4963E]/45 pb-1.5">
                <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-[#78350F]">
                  <BookOpen className="w-3.5 h-3.5 text-[#92400E]" />
                  <span>TÂM ẤN PHÚ NHẬT CHIÊM (日占心印)</span>
                </div>
                <span className="text-[9.5px] text-[#5C4D3C] font-mono">
                  {dayCan} ({dayChi})
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* 1. Can Thượng (Chủ sự / Bản thân) */}
                {lucNhamData.tuKhoa[0]?.tamAnPhu && (
                  <div
                    onClick={() => {
                      const k = lucNhamData.tuKhoa[0];
                      setActiveTamAnModal({
                        title: `Nhật Chiêm • Can Thượng Khóa (${dayCan} kí ${k.haName})`,
                        subTitle: `Thượng Thần ${k.thuongChi} ─ Hạ Thần ${k.haName}`,
                        generalName: k.general.name,
                        generalChinese: k.general.chinese,
                        tuongName: k.tamAnPhu?.tuongName || "",
                        tuongChinese: k.tamAnPhu?.tuongChinese || "",
                        originalPoem: k.tamAnPhu?.originalPoem,
                        sinoVietPoem: k.tamAnPhu?.sinoVietPoem,
                        fullLine: k.tamAnPhu?.fullLine,
                        meaning: k.tamAnPhu?.meaning,
                        roleNote: "Đại diện chủ sự, bản thân người hỏi, khởi tâm sự vụ.",
                        badgeText: "Can Thượng Tâm Ấn",
                      });
                    }}
                    className="p-2 rounded-lg bg-[#FFFDF8] hover:bg-[#FAF6EE] border border-[#C4963E]/45 hover:border-[#B8862D] transition-all cursor-pointer space-y-1 group"
                    title="Bấm xem chi tiết Tâm Ấn Phú Can Thượng"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-[#6E4E16] font-semibold flex items-center gap-1">
                        <span>Can Thượng:</span>
                        <strong className="text-white font-serif">{lucNhamData.tuKhoa[0].thuongChi}</strong>
                      </span>
                      <span className="font-serif font-black text-[#6E4E16] group-hover:text-[#78350F] truncate">
                        《{lucNhamData.tuKhoa[0].tamAnPhu.tuongName}》
                        {lucNhamData.tuKhoa[0].tamAnPhu.tuongChinese ? ` (${lucNhamData.tuKhoa[0].tamAnPhu.tuongChinese})` : ""}
                      </span>
                    </div>
                    <div className="text-[9px] text-[#5C4D3C] flex items-center justify-between">
                      <span className={lucNhamData.tuKhoa[0].general.color}>
                        Tướng {lucNhamData.tuKhoa[0].general.name}
                      </span>
                      <span className="text-[#78350F]/80 group-hover:text-[#78350F] flex items-center gap-0.5">
                        <Eye className="w-2.5 h-2.5" /> Khẩu quyết
                      </span>
                    </div>
                    {lucNhamData.tuKhoa[0].tamAnPhu.meaning && (
                      <div className="text-[9px] text-[#1C1813] leading-tight line-clamp-1 italic">
                        {lucNhamData.tuKhoa[0].tamAnPhu.meaning}
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Chi Thượng (Sự vụ / Hoàn cảnh) */}
                {lucNhamData.tuKhoa[2]?.tamAnPhu && (
                  <div
                    onClick={() => {
                      const k = lucNhamData.tuKhoa[2];
                      setActiveTamAnModal({
                        title: `Nhật Chiêm • Chi Thượng Khóa (Ngày ${dayChi})`,
                        subTitle: `Thượng Thần ${k.thuongChi} ─ Hạ Thần ${k.haName}`,
                        generalName: k.general.name,
                        generalChinese: k.general.chinese,
                        tuongName: k.tamAnPhu?.tuongName || "",
                        tuongChinese: k.tamAnPhu?.tuongChinese || "",
                        originalPoem: k.tamAnPhu?.originalPoem,
                        sinoVietPoem: k.tamAnPhu?.sinoVietPoem,
                        fullLine: k.tamAnPhu?.fullLine,
                        meaning: k.tamAnPhu?.meaning,
                        roleNote: "Đại diện sự việc bên ngoài, gia trạch, đối tác, hoàn cảnh thực tại.",
                        badgeText: "Chi Thượng Tâm Ấn",
                      });
                    }}
                    className="p-2 rounded-lg bg-[#FFFDF8] hover:bg-[#FAF6EE] border border-[#C4963E]/45 hover:border-[#B8862D] transition-all cursor-pointer space-y-1 group"
                    title="Bấm xem chi tiết Tâm Ấn Phú Chi Thượng"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-[#6E4E16] font-semibold flex items-center gap-1">
                        <span>Chi Thượng:</span>
                        <strong className="text-white font-serif">{lucNhamData.tuKhoa[2].thuongChi}</strong>
                      </span>
                      <span className="font-serif font-black text-[#6E4E16] group-hover:text-[#78350F] truncate">
                        《{lucNhamData.tuKhoa[2].tamAnPhu.tuongName}》
                        {lucNhamData.tuKhoa[2].tamAnPhu.tuongChinese ? ` (${lucNhamData.tuKhoa[2].tamAnPhu.tuongChinese})` : ""}
                      </span>
                    </div>
                    <div className="text-[9px] text-[#5C4D3C] flex items-center justify-between">
                      <span className={lucNhamData.tuKhoa[2].general.color}>
                        Tướng {lucNhamData.tuKhoa[2].general.name}
                      </span>
                      <span className="text-[#78350F]/80 group-hover:text-[#78350F] flex items-center gap-0.5">
                        <Eye className="w-2.5 h-2.5" /> Khẩu quyết
                      </span>
                    </div>
                    {lucNhamData.tuKhoa[2].tamAnPhu.meaning && (
                      <div className="text-[9px] text-[#1C1813] leading-tight line-clamp-1 italic">
                        {lucNhamData.tuKhoa[2].tamAnPhu.meaning}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 3. Tướng Trực Ngày lâm Chi Ngày */}
              {lucNhamData.nhatTrucTamAn?.trucNhatTamAn && (
                <div
                  onClick={() => {
                    const ta = lucNhamData.nhatTrucTamAn.trucNhatTamAn;
                    setActiveTamAnModal({
                      title: `Nhật Chiêm • Trực Ngày ${selectedTuongThan.name} Cư ${dayChi}`,
                      subTitle: `Thiên Tướng Trực Ngày lâm Cung Chi của Ngày [${dayChi}]`,
                      generalName: selectedTuongThan.name,
                      generalChinese: selectedTuongThan.chinese,
                      tuongName: ta?.tuongName || "",
                      tuongChinese: ta?.tuongChinese || "",
                      originalPoem: ta?.originalPoem,
                      sinoVietPoem: ta?.sinoVietPoem,
                      fullLine: ta?.fullLine,
                      meaning: ta?.meaning,
                      roleNote: `Khí vận của Thiên Tướng trực ngày tọa cung ${dayChi}.`,
                      badgeText: "Trực Nhật Tâm Ấn",
                    });
                  }}
                  className="p-1.5 rounded-lg bg-[#FFFDF8] hover:bg-[#FFFDF8] border border-[#C4963E]/45 hover:border-[#B8862D] transition-all cursor-pointer flex items-center justify-between text-[10px] group"
                >
                  <span className="text-[#5C4D3C] flex items-center gap-1">
                    <span>Trực Ngày <strong className={selectedTuongThan.color}>{selectedTuongThan.name}</strong> cư <strong>{dayChi}</strong>:</span>
                  </span>
                  <span className="font-serif font-black text-[#6E4E16] group-hover:text-[#78350F] flex items-center gap-1">
                    《{lucNhamData.nhatTrucTamAn.trucNhatTamAn.tuongName}》
                    <Eye className="w-2.5 h-2.5 text-[#92400E]" />
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-[#C4963E]/45 text-[10px] text-[#5C4D3C] flex items-center justify-between gap-1 flex-wrap">
            <span className="truncate max-w-[240px] sm:max-w-none">
              Khẩu quyết ({selectedNobleRule === "jia_yang_wu_geng_niu" ? "LC 1" : selectedNobleRule === "jia_wu_geng_niu_yang_tu_she" ? "LC 2" : "LC 3"}): <strong className="text-[#6E4E16]">{nobleInfo.poem}</strong>
            </span>
            <button
              type="button"
              onClick={() => setIsNobleRuleModalOpen(true)}
              className="text-[#6E4E16] hover:underline cursor-pointer font-medium shrink-0 flex items-center gap-0.5"
            >
              <span>3 Lựa Chọn Khởi Quý</span>
              <ChevronDown className="w-3 h-3 opacity-80" />
            </button>
          </div>
        </div>

        {/* ================= KHUNG 2: NGUYỆT TƯỚNG ================= */}
        <div className="bg-[#FFFDF8] border border-[#C4963E]/45 rounded-xl p-3.5 flex flex-col justify-between relative">
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-[#5C4D3C] font-semibold flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-[#92400E]" />
                NGUYỆT TƯỚNG (Thái Dương)
              </span>
              <button
                type="button"
                onClick={() => setIsTuongSelectOpen(!isTuongSelectOpen)}
                className="text-[11px] text-[#6E4E16] hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>Đổi Tướng</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            <div className="flex items-center gap-3 bg-[#FFFDF8] border border-[#C4963E]/45 rounded-xl p-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FAF6EE] to-[#FFFDF8] border border-[#C4963E]/45 flex flex-col items-center justify-center shrink-0 shadow-inner">
                <span className={`text-base font-serif font-bold ${selectedTuong.color}`}>
                  {selectedTuong.branch}
                </span>
                <span className="text-[10px] text-[#5C4D3C]">{selectedTuong.name}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-[#1C1813]">
                    Tướng {selectedTuong.name} ({selectedTuong.chinese})
                  </h4>
                </div>
                <div className="text-[11px] text-[#5C4D3C] mt-0.5">
                  {selectedTuong.term} • Cung vị {selectedTuong.branch}
                </div>
                <p className="text-[10px] text-[#5C4D3C] mt-1 line-clamp-1">
                  {selectedTuong.desc}
                </p>
              </div>
            </div>

            {isTuongSelectOpen && (
              <div className="mt-3 p-2 bg-[#FFFDF8] border border-[#C4963E]/45 rounded-xl grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-48 overflow-y-auto scrollbar-thin animate-in fade-in">
                {NGUYET_TUONG_LIST.map((item) => (
                  <button
                    key={item.branch}
                    type="button"
                    onClick={() => {
                      setSelectedTuong(item);
                      setIsTuongSelectOpen(false);
                    }}
                    className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                      selectedTuong.branch === item.branch
                        ? "bg-[#C9A55A] text-[#120F0B] font-bold border-[#B8862D]"
                        : "bg-[#FFFDF8] hover:bg-[#FAF6EE] text-[#1C1813] border-[#C4963E]/45"
                    }`}
                  >
                    <div className="text-xs font-serif font-bold">
                      {item.branch} - {item.name}
                    </div>
                    <div className="text-[9px] text-[#5C4D3C]">{item.term.split(" ")[0]}</div>
                  </button>
                ))}
              </div>
            )}

            {/* TÂM ẤN PHÚ NGUYỆT TƯỚNG (THÁI DƯƠNG) */}
            {lucNhamData.nguyetTuongTamAn?.tamAnPhu && (
              <div
                onClick={() => {
                  const nta = lucNhamData.nguyetTuongTamAn;
                  setActiveTamAnModal({
                    title: `Nguyệt Tướng Tâm Ấn Phú • ${selectedTuong.name} (${selectedTuong.branch})`,
                    subTitle: `Thái Dương cung vị ${selectedTuong.term} ─ Thiên Bàn ${selectedTuong.branch}`,
                    generalName: nta.generalName,
                    generalChinese: nta.generalChinese,
                    tuongName: nta.tamAnPhu.tuongName,
                    tuongChinese: nta.tamAnPhu.tuongChinese,
                    originalPoem: nta.tamAnPhu.originalPoem,
                    sinoVietPoem: nta.tamAnPhu.sinoVietPoem,
                    fullLine: nta.tamAnPhu.fullLine,
                    meaning: nta.tamAnPhu.meaning,
                    roleNote: `Thiên Tướng ${nta.generalName} ngự trên Cung Nguyệt Tướng [${selectedTuong.branch}], gia lâm Thời Thần [${activeThoiBranchName}].`,
                    badgeText: "Nguyệt Tướng Tâm Ấn",
                  });
                }}
                className="mt-2.5 p-2.5 rounded-xl bg-gradient-to-b from-[#FFFDF8] to-[#FFFDF8] border border-[#C4963E]/45 hover:border-[#B8862D] transition-all cursor-pointer space-y-1.5 shadow-sm group"
                title="Bấm xem toàn văn khẩu quyết Tâm Ấn Phú Nguyệt Tướng"
              >
                <div className="flex items-center justify-between gap-1 text-[10.5px]">
                  <span className="font-serif font-bold text-[#78350F] flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#92400E] shrink-0" />
                    <span>TÂM ẤN NGUYỆT TƯỚNG:</span>
                  </span>
                  <span className="font-serif font-black text-[#6E4E16] group-hover:text-[#78350F]">
                    《{lucNhamData.nguyetTuongTamAn.tamAnPhu.tuongName}》
                    {lucNhamData.nguyetTuongTamAn.tamAnPhu.tuongChinese ? ` (${lucNhamData.nguyetTuongTamAn.tamAnPhu.tuongChinese})` : ""}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#5C4D3C]">
                  <span>Thiên Tướng ngự cung: <strong className="text-[#78350F]">{lucNhamData.nguyetTuongTamAn.generalName}</strong></span>
                  <span className="text-[#78350F]/80 group-hover:text-[#78350F] flex items-center gap-0.5">
                    <Eye className="w-2.5 h-2.5" /> Khẩu quyết
                  </span>
                </div>

                {lucNhamData.nguyetTuongTamAn.tamAnPhu.originalPoem ? (
                  <div className="text-[9.5px] font-serif text-[#78350F] italic bg-[#FFFDF8] px-2 py-0.5 rounded border border-[#D97706]/40 truncate">
                    📜 {lucNhamData.nguyetTuongTamAn.tamAnPhu.originalPoem}
                  </div>
                ) : lucNhamData.nguyetTuongTamAn.tamAnPhu.sinoVietPoem ? (
                  <div className="text-[9.5px] font-serif text-[#78350F] italic bg-[#FFFDF8] px-2 py-0.5 rounded border border-[#D97706]/40 truncate">
                    📜 {lucNhamData.nguyetTuongTamAn.tamAnPhu.sinoVietPoem}
                  </div>
                ) : null}

                {lucNhamData.nguyetTuongTamAn.tamAnPhu.meaning && (
                  <div className="text-[9.5px] text-[#1C1813] leading-relaxed line-clamp-2">
                    {lucNhamData.nguyetTuongTamAn.tamAnPhu.meaning}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-2.5 pt-2 border-t border-[#C4963E]/45 text-[10px] text-[#5C4D3C]">
            Nguyệt Tướng là vị trí thực tế của Thái Dương theo 24 tiết khí trong phép Độn Lục Nhâm.
          </div>
        </div>

        {/* ================= KHUNG 3: HOẠT THỜI ================= */}
        <div className="bg-[#FFFDF8] border border-[#C4963E]/45 rounded-xl p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-[#5C4D3C] font-semibold flex items-center gap-1.5">
                <Dices className="w-3.5 h-3.5 text-[#92400E]" />
                HOẠT THỜI (Tùy Chọn / Xí Ngầu)
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsHoatThoiSelectOpen(!isHoatThoiSelectOpen)}
                  className="px-2 py-0.5 rounded text-[10px] border border-[#C4963E]/45 bg-[#FFFDF8] hover:bg-[#FAF6EE] text-[#6E4E16] cursor-pointer transition-all flex items-center gap-1 font-medium shadow-xs"
                  title="Bấm để lựa chọn 1 trong 12 Địa Chi làm Hoạt Thời"
                >
                  <Clock className="w-2.5 h-2.5 text-[#92400E]" />
                  <span>{isHoatThoiSelectOpen ? "Đóng Chọn" : "Chọn Chi"}</span>
                  <ChevronDown className={`w-2.5 h-2.5 transition-transform ${isHoatThoiSelectOpen ? "rotate-180" : ""}`} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-[#FFFDF8] border border-[#C4963E]/45 rounded-xl p-3">
              <button
                type="button"
                onClick={() => setIsHoatThoiSelectOpen(!isHoatThoiSelectOpen)}
                disabled={isRolling}
                className={`w-12 h-12 rounded-xl border flex flex-col items-center justify-center shrink-0 cursor-pointer transition-all shadow-inner group relative ${
                  isRolling
                    ? "bg-[#FAF6EE] border-[#B8862D] rotate-12 scale-105"
                    : isHoatThoiSelectOpen
                    ? "bg-gradient-to-br from-[#FAF6EE] to-[#FFFDF8] border-[#B8862D] ring-1 ring-[#C9A55A]"
                    : "bg-gradient-to-br from-[#FAF6EE] to-[#FFFDF8] border-[#C4963E]/45 hover:border-[#B8862D]"
                }`}
                title="Bấm vào để chọn Hoạt Thời trong 12 Địa Chi hoặc mở danh sách chọn"
              >
                <span
                  className={`text-lg font-serif font-bold transition-transform ${
                    isRolling ? "animate-spin text-[#6E4E16]" : "text-[#1C1813] group-hover:scale-110"
                  }`}
                >
                  {currentHoatThoi.chinese}
                </span>
                <span className="text-[9px] text-[#5C4D3C]">{currentHoatThoi.name}</span>
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-[#1C1813]">
                    Giờ {currentHoatThoi.name}
                  </h4>
                  <span className="text-xs font-serif font-bold text-[#6E4E16] bg-[#FAF6EE] px-2 py-0.5 rounded border border-[#C4963E]/45">
                    {hoatThoiCanName} {currentHoatThoi.name}
                  </span>
                </div>
                <div className="text-[11px] text-[#5C4D3C] mt-0.5">
                  Con Giáp: {currentHoatThoi.zodiac} ({currentHoatThoi.polarity === "duong" ? "Dương Chi" : "Âm Chi"})
                </div>
                <div className="text-[10px] text-[#5C4D3C] mt-0.5">
                  Khung giờ: {currentHoatThoi.name === "Tý" ? "23:00 - 01:00" : currentHoatThoi.name === "Sửu" ? "01:00 - 03:00" : currentHoatThoi.name === "Dần" ? "03:00 - 05:00" : currentHoatThoi.name === "Mão" ? "05:00 - 07:00" : currentHoatThoi.name === "Thìn" ? "07:00 - 09:00" : currentHoatThoi.name === "Tỵ" ? "09:00 - 11:00" : currentHoatThoi.name === "Ngọ" ? "11:00 - 13:00" : currentHoatThoi.name === "Mùi" ? "13:00 - 15:00" : currentHoatThoi.name === "Thân" ? "15:00 - 17:00" : currentHoatThoi.name === "Dậu" ? "17:00 - 19:00" : currentHoatThoi.name === "Tuất" ? "19:00 - 21:00" : "21:00 - 23:00"}
                </div>
              </div>
            </div>

            {/* BẢNG LỰA CHỌN 12 ĐỊA CHI HOẠT THỜI */}
            {isHoatThoiSelectOpen && (
              <div className="mt-2.5 p-2 bg-[#FFFDF8] border border-[#C4963E]/45 rounded-xl animate-in fade-in">
                <div className="text-[10.5px] font-serif font-bold text-[#6E4E16] mb-1.5 flex items-center justify-between">
                  <span>CHỌN 1 TRONG 12 ĐỊA CHI LÀM HOẠT THỜI:</span>
                  <span className="text-[9.5px] text-[#5C4D3C] font-sans font-normal">Bấm để áp dụng ngay</span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 max-h-56 overflow-y-auto scrollbar-thin">
                  {CHI_LIST.map((item, idx) => {
                    const isSelected = hoatThoiIndex === idx && timePlateSource === "hoatthoi";
                    const calculatedCan = CAN_NAMES[(baseHourCan + idx) % 10];
                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => handleSelectHoatThoi(idx)}
                        className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                          isSelected
                            ? "bg-[#C9A55A] text-[#120F0B] font-bold border-[#B8862D] shadow-md scale-105"
                            : "bg-[#FFFDF8] hover:bg-[#FAF6EE] text-[#1C1813] border-[#C4963E]/45 hover:border-amber-500/50"
                        }`}
                        title={`Chọn Hoạt Thời: Giờ ${item.name} (${calculatedCan} ${item.name})`}
                      >
                        <span className="text-sm leading-none mb-0.5">{item.emoji}</span>
                        <span className="text-xs font-serif font-bold leading-tight">
                          {item.name}
                        </span>
                        <span className="text-[9px] opacity-75">{item.chinese}</span>
                        <span className={`text-[8.5px] font-mono mt-0.5 ${isSelected ? "text-[#120F0B] font-bold" : "text-[#6E4E16]"}`}>
                          {calculatedCan}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-2.5 flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <button
                type="button"
                disabled={isRolling}
                onClick={handleRollDice}
                className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#FFFDF8] hover:bg-[#FAF6EE] text-[#1C1813] hover:text-[#1C1813] text-xs font-semibold border border-[#C4963E]/45 transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Dices className={`w-3.5 h-3.5 ${isRolling ? "animate-spin text-[#92400E]" : ""}`} />
                <span>{isRolling ? "Đang lắc..." : "Lắc Xí Ngầu"}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsHoatThoiSelectOpen(!isHoatThoiSelectOpen)}
                className={`py-1.5 px-2.5 rounded-lg text-xs font-semibold border transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                  isHoatThoiSelectOpen
                    ? "bg-[#C9A55A] text-[#120F0B] border-[#B8862D]"
                    : "bg-[#FFFDF8] hover:bg-[#FAF6EE] text-[#6E4E16] border-[#C4963E]/45"
                }`}
                title="Bấm để mở danh sách 12 Địa Chi lựa chọn Hoạt Thời"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{isHoatThoiSelectOpen ? "Đóng Chọn" : "Chọn Chi (12)"}</span>
              </button>

              {onApplyHoatThoi && (
                <button
                  type="button"
                  onClick={handleApplyToHourPillar}
                  className={`py-1.5 px-2.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                    justApplied
                      ? "bg-[#DCFCE7] text-[#14532D] border-emerald-600"
                      : "bg-[#FAF6EE] hover:bg-[#FAF6EE] text-[#6E4E16] border-[#C4963E]/45"
                  }`}
                  title="Áp dụng chi này vào Trụ Giờ của bảng 8 ô Bát Tự"
                >
                  {justApplied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#14532D]" />
                      <span>Đã Nạp!</span>
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>Nạp Trụ Giờ</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* TÂM ẤN PHÚ HOẠT THỜI (THỜI THẦN CHIÊM ĐOÁN) */}
            {lucNhamData.hoatThoiTamAn?.tamAnPhu && (
              <div
                onClick={() => {
                  const hta = lucNhamData.hoatThoiTamAn;
                  setActiveTamAnModal({
                    title: `Hoạt Thời Tâm Ấn Phú • Giờ ${currentHoatThoi.name} (${hoatThoiCanName} ${currentHoatThoi.name})`,
                    subTitle: `Thời Thần ${currentHoatThoi.name} ─ Thiên Bàn ${hta.skyBranch}`,
                    generalName: hta.generalName,
                    generalChinese: hta.generalChinese,
                    tuongName: hta.tamAnPhu.tuongName,
                    tuongChinese: hta.tamAnPhu.tuongChinese,
                    originalPoem: hta.tamAnPhu.originalPoem,
                    sinoVietPoem: hta.tamAnPhu.sinoVietPoem,
                    fullLine: hta.tamAnPhu.fullLine,
                    meaning: hta.tamAnPhu.meaning,
                    roleNote: `Thiên Tướng ${hta.generalName} lâm cung Thời Thần [${currentHoatThoi.name}], tương ứng Thiên Bàn [${hta.skyBranch}]. Thời Thần là then chốt, thời cơ phát khởi sự việc của quẻ Lục Nhâm.`,
                    badgeText: "Hoạt Thời Tâm Ấn",
                  });
                }}
                className="mt-2.5 p-2.5 rounded-xl bg-gradient-to-b from-[#FFFDF8] to-[#FFFDF8] border border-[#C4963E]/45 hover:border-[#B8862D] transition-all cursor-pointer space-y-1.5 shadow-sm group"
                title="Bấm xem toàn văn khẩu quyết Tâm Ấn Phú Hoạt Thời"
              >
                <div className="flex items-center justify-between gap-1 text-[10.5px]">
                  <span className="font-serif font-bold text-[#78350F] flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#92400E] shrink-0" />
                    <span>TÂM ẤN HOẠT THỜI:</span>
                  </span>
                  <span className="font-serif font-black text-[#6E4E16] group-hover:text-[#78350F]">
                    《{lucNhamData.hoatThoiTamAn.tamAnPhu.tuongName}》
                    {lucNhamData.hoatThoiTamAn.tamAnPhu.tuongChinese ? ` (${lucNhamData.hoatThoiTamAn.tamAnPhu.tuongChinese})` : ""}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#5C4D3C]">
                  <span>Thiên Tướng ngự cung: <strong className="text-[#78350F]">{lucNhamData.hoatThoiTamAn.generalName}</strong> (Tọa {currentHoatThoi.name})</span>
                  <span className="text-[#78350F]/80 group-hover:text-[#78350F] flex items-center gap-0.5">
                    <Eye className="w-2.5 h-2.5" /> Khẩu quyết
                  </span>
                </div>

                {lucNhamData.hoatThoiTamAn.tamAnPhu.originalPoem ? (
                  <div className="text-[9.5px] font-serif text-[#78350F] italic bg-[#FFFDF8] px-2 py-0.5 rounded border border-[#D97706]/40 truncate">
                    📜 {lucNhamData.hoatThoiTamAn.tamAnPhu.originalPoem}
                  </div>
                ) : lucNhamData.hoatThoiTamAn.tamAnPhu.sinoVietPoem ? (
                  <div className="text-[9.5px] font-serif text-[#78350F] italic bg-[#FFFDF8] px-2 py-0.5 rounded border border-[#D97706]/40 truncate">
                    📜 {lucNhamData.hoatThoiTamAn.tamAnPhu.sinoVietPoem}
                  </div>
                ) : null}

                {lucNhamData.hoatThoiTamAn.tamAnPhu.meaning && (
                  <div className="text-[9.5px] text-[#1C1813] leading-relaxed line-clamp-2">
                    {lucNhamData.hoatThoiTamAn.tamAnPhu.meaning}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-2.5 pt-2 border-t border-[#C4963E]/45 text-[10px] text-[#5C4D3C]">
            Hoạt Thời có thể tùy chọn trong 12 Địa Chi hoặc dùng xí ngầu 12 mặt bắt cơ duyên.
          </div>
        </div>
      </div>

      {/* ================= KHUNG TỔNG HỢP: TAM KHÍ TƯƠNG HỢP ================= */}
      <div className="p-3 sm:p-3.5 rounded-xl bg-[#FFFDF8] border border-[#C4963E]/45 flex flex-col space-y-2.5 text-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Sparkles className="w-4 h-4 text-[#6E4E16] shrink-0" />
            <span className="text-[#5C4D3C] font-semibold">LỤC NHÂM ĐẠI ĐỘN PHỐI KHÍ:</span>
            <span className="font-serif text-[#1C1813] font-bold">
              Trực Nhật [
              {starViewMode === "tuong12"
                ? `${selectedTuongThan.name} • ${selectedTuongThan.nature}`
                : `${lucDieuData.info.name} • ${lucDieuData.info.star}`}
              ]
            </span>
            <span className="text-[#6E4E16] font-bold">➔</span>
            <span className="font-serif text-[#1C1813] font-bold">
              Nguyệt Tướng [{selectedTuong.branch} • {selectedTuong.name}]
            </span>
            <span className="text-[#6E4E16] font-bold">加</span>
            <span className="font-serif text-[#1C1813] font-bold">
              {timePlateSource === "hoatthoi"
                ? `Hoạt Thời [${currentHoatThoi.name} - ${hoatThoiCanName} ${currentHoatThoi.name}] • Chiêm Thời: ${hourChi} (Cố định)`
                : `Trụ Giờ [${hourChi} - ${hourCan} ${hourChi}]`}
            </span>
            <span className="text-[#6B21A8] font-bold bg-[#F3E8FF] px-2.5 py-0.5 rounded-full border border-purple-700/80 text-[11px] flex items-center gap-1 shadow-sm">
              <span>Tuần Không:</span>
              <strong className="text-[#6B21A8]">{lucNhamData.khongVong.branches.join(" • ")}</strong>
              <span className="text-[#7E22CE] text-[10px]">({lucNhamData.khongVong.tuanGiap})</span>
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto">
            {/* Nút Chọn Ngày Giờ Hiện Tại cho Bát Tự Lục Nhâm */}
            <button
              type="button"
              onClick={handleSelectCurrentDateTime}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFFDF8] hover:bg-[#FAF6EE] text-[#6E4E16] hover:text-[#6E4E16] border border-[#C4963E]/45 hover:border-[#B8862D] text-xs font-semibold cursor-pointer transition-all shadow active:scale-95"
              title="Tự động nạp Bát Tự Ngày Giờ và Nguyệt Tướng theo thời gian thực tế hiện tại"
            >
              <Clock className="w-3.5 h-3.5 text-[#6E4E16]" />
              <span>Ngày Giờ Hiện Tại</span>
            </button>

            {/* Nút Lưu Quẻ Lục Nhâm ngay thanh đầu đề */}
            <button
              type="button"
              onClick={handleSaveLucNhamRecord}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#C89B3C] via-[#E2C37A] to-[#A87B25] text-[#14100C] text-xs font-serif font-bold shadow hover:brightness-110 active:scale-95 cursor-pointer transition-all"
              title="Lưu bàn quẻ Lục Nhâm hiện tại vào lịch sử"
            >
              <BookmarkCheck className="w-3.5 h-3.5" />
              <span>Lưu Quẻ Lục Nhâm</span>
            </button>

            <button
              type="button"
              onClick={() => setIsHistoryModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#FFFDF8] hover:bg-[#FAF6EE] text-[#6E4E16] border border-[#C4963E]/45 text-xs font-semibold cursor-pointer transition-all shadow"
              title="Xem danh sách các quẻ Lục Nhâm đã lưu"
            >
              <History className="w-3.5 h-3.5 text-[#92400E]" />
              <span>Quẻ Đã Lưu ({savedRecords.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setIsLucNhamChartOpen(!isLucNhamChartOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF6EE] hover:bg-[#FAF6EE] text-[#6E4E16] border border-[#C4963E]/45 text-xs font-semibold cursor-pointer transition-all shadow"
            >
              <Compass className="w-3.5 h-3.5 text-[#92400E]" />
              <span>{isLucNhamChartOpen ? "Thu gọn Bàn Lục Nhâm" : "Mở Bàn Lục Nhâm • Tứ Khóa • Tam Truyền"}</span>
              {isLucNhamChartOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

      </div>

      {/* =========================================================================
          KHU VỰC BÀN LỤC NHÂM: THIÊN ĐỊA BÀN • TỨ KHÓA • TAM TRUYỀN
          ========================================================================= */}
      {isLucNhamChartOpen && (
        <div className="space-y-4 pt-2 border-t border-[#C4963E]/45 animate-in fade-in duration-300">
          {/* ================= KHU VỰC CÂU HỎI CHIÊM ĐOÁN & LƯU QUẺ LỤC NHÂM ================= */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#FFFDF8] via-[#FFFDF8] to-[#FFFDF8] border border-[#C4963E]/45 shadow-2xl space-y-3 relative overflow-hidden">
            {/* Background ambient glow */}
            <div className="absolute top-0 right-0 w-64 h-32 bg-[#C9A55A]/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[#C4963E]/45 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C9A55A] to-[#8C6218] flex items-center justify-center text-[#120F0B] font-bold shadow shrink-0">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm sm:text-base text-[#1C1813] flex items-center gap-2 flex-wrap">
                    <span>CÂU HỎI CHIÊM ĐOÁN & LƯU QUẺ</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#FEF3C7] text-[#78350F] border border-amber-600/70 font-sans font-medium">
                      Lục Nhâm Đại Độn
                    </span>
                  </h3>
                  <p className="text-[11px] text-[#5C4D3C] font-serif">
                    Nhập sự việc cần chiêm đoán để kết nối tâm niệm với bàn quẻ • Lưu giữ lịch sử để đối chiếu sự việc
                  </p>
                </div>
              </div>

              {/* Action buttons on header: Saved history modal button */}
              <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsHistoryModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFFDF8] hover:bg-[#FAF6EE] border border-[#C4963E]/45 hover:border-[#B8862D] text-xs text-[#6E4E16] font-semibold cursor-pointer transition-all shadow-sm active:scale-95"
                  title="Xem danh sách các quẻ Lục Nhâm đã lưu"
                >
                  <History className="w-3.5 h-3.5 text-[#92400E]" />
                  <span>Quẻ Đã Lưu ({savedRecords.length})</span>
                </button>
              </div>
            </div>

            {/* Question Input Field */}
            <div className="space-y-2">
              <div className="relative">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => handleQuestionChange(e.target.value)}
                  placeholder="Nhập nội dung sự việc cần chiêm đoán (ví dụ: Công việc thăng tiến, Xuất hành bình an, Hợp tác làm ăn, Tài lộc tháng này...)..."
                  className="w-full bg-[#FFFDF8] border border-[#C4963E]/45 focus:border-[#B8862D] focus:ring-1 focus:ring-[#C9A55A]/50 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1C1813] placeholder-[#736350] transition-colors outline-none pr-10"
                />
                {question && (
                  <button
                    type="button"
                    onClick={() => handleQuestionChange("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5C4D3C] hover:text-[#1C1813] p-1 cursor-pointer"
                    title="Xóa câu hỏi"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Quick Topic Chips */}
              <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                <span className="text-[#5C4D3C] text-[10.5px] flex items-center gap-1 shrink-0">
                  <Sparkles className="w-3 h-3 text-[#6E4E16]" /> Gợi ý sự vụ:
                </span>
                {QUICK_QUESTION_TOPICS.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => handleQuestionChange(question ? `${question} • ${topic}` : `Chiêm việc ${topic}`)}
                    className="px-2.5 py-1 rounded-lg bg-[#FFFDF8] hover:bg-[#FAF6EE] border border-[#C4963E]/45 hover:border-[#B8862D] text-[#5C4D3C] hover:text-[#6E4E16] text-[10.5px] transition-colors cursor-pointer"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Actions Row: Save Button, Copy Summary, Toast */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-[#C4963E]/45">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleSaveLucNhamRecord}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#C89B3C] via-[#E2C37A] to-[#A87B25] hover:brightness-110 active:scale-95 text-[#14100C] text-xs font-bold font-serif shadow-lg cursor-pointer transition-all"
                >
                  <BookmarkCheck className="w-4 h-4" />
                  <span>Lưu Quẻ Lục Nhâm Này</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyCurrentSummary}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FFFDF8] hover:bg-[#FAF6EE] border border-[#C4963E]/45 hover:border-[#B8862D] text-xs text-[#1C1813] hover:text-[#6E4E16] font-semibold cursor-pointer transition-all active:scale-95"
                  title="Sao chép tóm tắt quẻ chiêm đoán hiện tại"
                >
                  <Copy className="w-3.5 h-3.5 text-[#92400E]" />
                  <span>Sao Chép Tóm Tắt</span>
                </button>

                <button
                  type="button"
                  onClick={handleSelectCurrentDateTime}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FFFDF8] hover:bg-[#FAF6EE] border border-[#C4963E]/45 hover:border-[#B8862D] text-xs text-[#6E4E16] hover:text-[#6E4E16] font-semibold cursor-pointer transition-all active:scale-95"
                  title="Lấy chính xác Bát Tự Ngày Giờ và Nguyệt Tướng theo thời gian thực"
                >
                  <Clock className="w-3.5 h-3.5 text-[#6E4E16]" />
                  <span>Lấy Giờ Hiện Tại</span>
                </button>
              </div>

              {/* Toast Feedback Message */}
              {saveToastMsg && (
                <div className="flex items-center gap-1.5 text-xs text-[#6E4E16] bg-[#FEF3C7] border border-amber-600/80 px-3 py-1.5 rounded-xl shadow-lg animate-in fade-in slide-in-from-right duration-200">
                  <CheckCircle2 className="w-4 h-4 text-[#92400E] shrink-0" />
                  <span className="font-semibold">{saveToastMsg}</span>
                </div>
              )}
            </div>
          </div>

          {/* Thanh công cụ điều khiển Lục Nhâm */}
          <div className="p-3 rounded-xl bg-[#FFFDF8] border border-[#C4963E]/45 flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Lựa chọn Thời Thần xoay bàn */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[#5C4D3C] font-semibold">Thời Thần an theo:</span>
              <div className="inline-flex rounded-lg bg-[#FFFDF8] border border-[#C4963E]/45 p-0.5">
                <button
                  type="button"
                  onClick={() => setTimePlateSource("hoatthoi")}
                  className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-all flex items-center gap-1.5 ${
                    timePlateSource === "hoatthoi"
                      ? "bg-[#C9A55A] text-[#120F0B] font-bold shadow"
                      : "text-[#5C4D3C] hover:text-[#1C1813]"
                  }`}
                >
                  <Dices className="w-3 h-3" />
                  <span>Hoạt Thời ({currentHoatThoi.name})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTimePlateSource("trugio")}
                  className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-all flex items-center gap-1.5 ${
                    timePlateSource === "trugio"
                      ? "bg-[#C9A55A] text-[#120F0B] font-bold shadow"
                      : "text-[#5C4D3C] hover:text-[#1C1813]"
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  <span>Trụ Giờ Bát Tự ({hourChi})</span>
                </button>
              </div>

              {/* Nút Chọn Ngày Giờ Hiện Tại */}
              <button
                type="button"
                onClick={handleSelectCurrentDateTime}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FFFDF8] hover:bg-[#FAF6EE] text-[#6E4E16] hover:text-[#6E4E16] border border-[#C4963E]/45 hover:border-[#B8862D] text-xs font-semibold cursor-pointer transition-all shadow-sm active:scale-95"
                title="Lấy Ngày Giờ Bát Tự và Tiết Khí Nguyệt Tướng theo thời gian thực tế"
              >
                <Clock className="w-3 h-3 text-[#6E4E16]" />
                <span>Chọn Ngày Giờ Hiện Tại</span>
              </button>
            </div>

            {/* Trú Quý / Dạ Quý theo Trụ Giờ */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[#5C4D3C] font-semibold">Nhật Dạ Quý Nhân:</span>
              <div className="flex items-center gap-1.5 bg-[#FFFDF8] border border-[#C4963E]/45 px-2.5 py-1 rounded-lg">
                <span className="text-[#5C4D3C]">Trụ Giờ <strong>{hourChi}</strong>:</span>
                <span className="text-[#6E4E16] font-semibold">
                  {isHourDaytime ? "Ban Ngày (Trú)" : "Ban Đêm (Dạ)"}
                </span>
                <span className="text-[#5E4833]">•</span>
                <button
                  type="button"
                  onClick={() => {
                    setNobleMode(nobleMode === "auto_hour" ? "manual_day" : nobleMode === "manual_day" ? "manual_night" : "auto_hour");
                    if (nobleMode === "manual_day") setManualNobleIsDay(false);
                    if (nobleMode === "manual_night") setManualNobleIsDay(true);
                  }}
                  className="text-[11px] text-[#78350F] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                  title="Bấm để đổi thủ công giữa Trú Quý và Dạ Quý"
                >
                  {isEffectiveDaytimeNoble ? (
                    <>
                      <Sun className="w-3 h-3 text-[#92400E]" />
                      <span>Trú Quý [{nobleInfo.truQuy}]</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-3 h-3 text-[#3730A3]" />
                      <span>Dạ Quý [{nobleInfo.daQuy}]</span>
                    </>
                  )}
                </button>
              </div>

              {/* Huy hiệu chiều an Quý Nhân */}
              <span className="px-2 py-0.5 rounded bg-[#FFFDF8] border border-[#C4963E]/45 text-[11px] text-[#6E4E16]">
                {lucNhamData.isShunXing ? "Quý Nhân Thuận Hành (↻)" : "Quý Nhân Nghịch Hành (↺)"}
              </span>
            </div>

            {/* Hàng 2: Khởi Quý Nhân (3 Lựa Chọn) */}
            <div className="w-full flex flex-wrap items-center justify-between gap-2.5 pt-2.5 border-t border-[#C4963E]/45">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[#5C4D3C] font-semibold flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-[#92400E]" />
                  Khởi Quý Nhân (3 Lựa Chọn):
                </span>

                {/* 3 Lựa chọn button group */}
                <div className="inline-flex rounded-lg bg-[#FFFDF8] border border-[#C4963E]/45 p-0.5">
                  {NOBLE_RULE_OPTIONS.map((opt) => {
                    const isSelected = selectedNobleRule === opt.id;
                    const optResult = getLucNhamNobleBranches(dayCan, opt.id);
                    const activeBranch = isEffectiveDaytimeNoble ? optResult.truQuy : optResult.daQuy;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectNobleRule(opt.id)}
                        className={`px-2.5 py-1 rounded text-xs cursor-pointer transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-[#C9A55A] text-[#120F0B] font-bold shadow-md"
                            : "text-[#5C4D3C] hover:text-[#1C1813] hover:bg-[#FAF6EE]"
                        }`}
                        title={`${opt.label} • ${opt.desc}`}
                      >
                        <span>Lựa chọn {opt.choiceNum}</span>
                        <span className="text-[10px] opacity-75 hidden sm:inline">
                          ({opt.chinese.split("(")[0].trim()})
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                            isSelected
                              ? "bg-[#FFFDF8]/25 text-[#120F0B]"
                              : "bg-[#FFFDF8] text-[#78350F] border border-[#C4963E]/45"
                          }`}
                        >
                          {activeBranch}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Nút Cẩm nang 12 Thần Lâm 12 Cung (Tính Thiên Bàn) */}
                <button
                  type="button"
                  onClick={() => {
                    setGeneralModalTab("cungvi");
                    setIs12GeneralModalOpen(true);
                  }}
                  className="text-xs text-[#6E4E16] hover:text-white flex items-center gap-1.5 cursor-pointer bg-[#FFFDF8] hover:bg-[#FAF6EE] px-2.5 py-1 rounded-lg border border-[#C4963E]/45 hover:border-amber-500/80 transition-all shadow-sm"
                  title="Cẩm nang Thập Nhị Thiên Tướng lâm 12 Cung Thiên Bàn (144 Tượng Thần Bí Quyết)"
                >
                  <Sparkles className="w-3 h-3 text-[#92400E]" />
                  <span>12 Thần Lâm 12 Cung (Thiên Bàn)</span>
                </button>

                {/* Nút Tâm Ấn Phú (Lục Nhâm Chỉ Nam) */}
                <button
                  type="button"
                  onClick={() => {
                    setGeneralModalTab("tamanphu");
                    setIs12GeneralModalOpen(true);
                  }}
                  className="text-xs text-[#6E4E16] hover:text-[#6E4E16] flex items-center gap-1.5 cursor-pointer bg-gradient-to-r from-[#FAF6EE] to-[#FFFDF8] hover:from-[#FAF6EE] hover:to-[#FFFDF8] px-2.5 py-1 rounded-lg border border-amber-600/70 hover:border-amber-400 transition-all shadow-sm"
                  title="Toàn văn thiên cổ 《Lục Nhâm Thần Khóa • Tâm Ấn Phú》 (心印賦) - 12 Thần lâm 12 Cung Thiên Bàn"
                >
                  <BookOpen className="w-3 h-3 text-[#92400E]" />
                  <span>Tâm Ấn Phú (心印賦)</span>
                </button>

                {/* Nút xem chi tiết & so sánh 3 lựa chọn */}
                <button
                  type="button"
                  onClick={() => setIsNobleRuleModalOpen(!isNobleRuleModalOpen)}
                  className="text-xs text-[#78350F] hover:text-[#78350F] flex items-center gap-1 cursor-pointer bg-[#FFFDF8] hover:bg-[#FAF6EE] px-2.5 py-1 rounded-lg border border-[#C4963E]/45 transition-all"
                >
                  <BookOpen className="w-3 h-3 text-[#92400E]" />
                  <span>So sánh 3 cách Khởi Quý</span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-200 ${
                      isNobleRuleModalOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Nút Lưu Quẻ Lục Nhâm trên thanh công cụ */}
                <button
                  type="button"
                  onClick={handleSaveLucNhamRecord}
                  className="text-xs font-serif font-bold text-[#14100C] bg-gradient-to-r from-[#C89B3C] via-[#E2C37A] to-[#A87B25] hover:brightness-110 active:scale-95 px-3 py-1 rounded-lg flex items-center gap-1.5 shadow transition-all cursor-pointer"
                  title="Lưu quẻ Lục Nhâm vào lịch sử"
                >
                  <BookmarkCheck className="w-3.5 h-3.5" />
                  <span>Lưu Quẻ</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bảng so sánh chi tiết 3 Lựa Chọn Khởi Quý Nhân */}
          {isNobleRuleModalOpen && (
            <div className="p-3.5 rounded-xl bg-[#FFFDF8] border border-[#C4963E]/45 shadow-xl space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-[#C4963E]/45 pb-2">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-[#92400E]" />
                  <h4 className="text-xs font-serif font-bold text-[#1C1813] uppercase tracking-wide">
                    3 Lựa Chọn Khởi Thiên Ất Quý Nhân (Can Ngày: {dayCan})
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNobleRuleModalOpen(false)}
                  className="text-[#5C4D3C] hover:text-[#1C1813] p-1 rounded hover:bg-[#FFFDF8] cursor-pointer"
                  title="Đóng bảng so sánh"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {NOBLE_RULE_OPTIONS.map((opt) => {
                  const isSelected = selectedNobleRule === opt.id;
                  const res = getLucNhamNobleBranches(dayCan, opt.id);
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectNobleRule(opt.id)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? "bg-gradient-to-br from-[#FAF6EE] to-[#FFFDF8] border-amber-500 shadow-md ring-1 ring-amber-500/50"
                          : "bg-[#FFFDF8] hover:bg-[#FFFDF8] border-[#C4963E]/45 hover:border-[#C4963E]/45"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                            isSelected
                              ? "bg-amber-400 text-[#120F0B] border-amber-300 shadow-sm"
                              : "bg-[#FAF6EE] text-[#5C4D3C] border-[#C4963E]/45"
                          }`}>
                            Lựa chọn {opt.choiceNum}
                          </span>
                          <span className="text-[10px] text-[#92400E]/90 font-serif font-semibold">
                            {opt.badge}
                          </span>
                        </div>

                        <div className="text-xs font-bold text-[#1C1813] font-serif">
                          {opt.chinese}
                        </div>
                        <div className="text-[11px] text-[#5C4D3C] italic mt-0.5 line-clamp-1">
                          "{opt.vietnamese}"
                        </div>

                        <div className="my-2 p-2 rounded-lg bg-[#FFFDF8] border border-[#C4963E]/45 text-[11px] space-y-1">
                          <div className="text-[#5C4D3C] flex items-center justify-between">
                            <span>Can Ngày:</span>
                            <strong className="text-[#6E4E16] font-serif">{dayCan} ({dayChi})</strong>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[#78350F] flex items-center gap-1">
                              <Sun className="w-2.5 h-2.5 text-[#92400E]" /> Trú Quý:
                            </span>
                            <strong className="text-[#78350F] font-bold">{res.truQuy}</strong>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[#3730A3] flex items-center gap-1">
                              <Moon className="w-2.5 h-2.5 text-[#3730A3]" /> Dạ Quý:
                            </span>
                            <strong className="text-[#3730A3] font-bold">{res.daQuy}</strong>
                          </div>
                          <div className="pt-1 border-t border-[#C4963E]/45 flex items-center justify-between text-[10px]">
                            <span className="text-[#5C4D3C]">Hiện tại ({isEffectiveDaytimeNoble ? "Trú" : "Dạ"}):</span>
                            <span className="font-bold text-[#92400E]">
                              {isEffectiveDaytimeNoble ? res.truQuy : res.daQuy}
                            </span>
                          </div>
                        </div>

                        <div className="text-[10px] text-[#5C4D3C] line-clamp-2">
                          <strong className="text-[#5C4D3C]">Xuất xứ:</strong> {opt.source}
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-[#C4963E]/45 flex items-center justify-between">
                        {isSelected ? (
                          <span className="text-[10px] text-[#15803D] font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-[#15803D]" /> Đang áp dụng
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#5C4D3C] hover:text-[#1C1813] flex items-center gap-1">
                            Bấm để chọn lựa chọn này →
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* =========================================================
              PHẦN 1: TAM TRUYỀN (SƠ • TRUNG • MẠT TRUYỀN)
              ========================================================= */}
          <div className="p-4 rounded-xl bg-[#FFFDF8] border border-[#C4963E]/45 shadow-inner space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#C4963E]/45 pb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Crown className="w-4 h-4 text-[#92400E]" />
                <h4 className="text-sm font-serif font-bold text-[#1C1813] tracking-wide">
                  TAM TRUYỀN (三傳)
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAF6EE] text-[#6E4E16] border border-[#C4963E]/45 font-serif font-bold">
                  {lucNhamData.cucName}
                </span>

                {/* Huy hiệu Không Vong toàn cục */}
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#F3E8FF] text-[#6B21A8] border border-[#9333EA]/50 font-medium flex items-center gap-1 shadow-sm">
                  <span>Tuần Không:</span>
                  <strong className="text-[#6B21A8]">
                    {lucNhamData.khongVong.branches.join(" • ")}
                  </strong>
                  <span className="text-[#7E22CE] text-[9px]">({lucNhamData.khongVong.tuanGiap})</span>
                </span>
              </div>
              <p className="text-[11px] text-[#5C4D3C] italic">
                {lucNhamData.cucDesc}
              </p>
            </div>

            {/* Grid 3 Truyền Tối Giản (Không hộp lồng hộp) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {lucNhamData.tamTruyen.map((item, idx) => (
                <div
                  key={item.stage}
                  className={`p-4 rounded-xl border relative overflow-hidden transition-all flex flex-col justify-between ${
                    item.isKhongVong
                      ? "bg-[#FCF9FF] border-[#C4B5FD]"
                      : idx === 0
                      ? "bg-[#FFFDF6] border-[1.5px] border-[#9E2A2B]/80 shadow-[0_8px_22px_rgba(158,42,43,0.10)]"
                      : "bg-[#FFFDF8] border-[#D8C8A8]"
                  }`}
                >
                  <div>
                    {/* Hàng 1: Stage & Lục Thân */}
                    <div className="flex items-center justify-between gap-1.5 pb-2.5 border-b border-[#EAE2D0]">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold font-serif px-2 py-0.5 rounded-full ${
                          idx === 0 ? "bg-[#9E2A2B] text-white" : "bg-[#F5EFE2] text-[#5C4318] border border-[#D5C39C]"
                        }`}>
                          {item.stage}
                        </span>
                        <span className="text-xs font-serif font-bold text-[#1C1813]">
                          {item.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {item.isKhongVong && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#F3E8FF] text-[#6B21A8] font-serif font-semibold">
                            Tuần Không
                          </span>
                        )}
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-serif font-bold bg-[#F5EFE2] text-[#5C4318] border border-[#D5C39C]">
                          {item.lucThan}
                        </span>
                      </div>
                    </div>

                    {/* Hàng 2: Độn Can & Địa Chi Tối Giản (Chia cột bằng vạch mảnh, không hộp lồng hộp) */}
                    <div className="grid grid-cols-2 divide-x divide-[#EAE2D0] py-3 border-b border-[#EAE2D0]">
                      <div className="pr-2 text-center">
                        <div className="text-[9px] text-[#7A6B56] font-serif mb-1">Thiên Can (Độn)</div>
                        <div className={`text-lg font-serif font-bold ${item.canColorText}`}>
                          {item.canEmoji} {item.can}
                        </div>
                        <div className="text-[9px] text-[#6E5D47] font-serif mt-0.5">
                          {item.canLucThan}
                        </div>
                      </div>

                      <div className="pl-2 text-center">
                        <div className="text-[9px] text-[#7A6B56] font-serif mb-1">Địa Chi (Thần)</div>
                        <div className="text-lg font-serif font-bold text-[#1C1813]">
                          {item.chiEmoji} {item.branch}
                        </div>
                        <div className="text-[9px] text-[#6E5D47] font-serif mt-0.5">
                          Tọa {item.groundBranch}
                        </div>
                      </div>
                    </div>

                    {/* Hàng 3: Thiên Tướng & Tượng Quẻ */}
                    <div className="py-2.5 border-b border-[#EAE2D0] space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[10px] text-[#7A6B56] font-serif">Thiên Tướng</span>
                        <span className={`font-serif font-bold ${item.general.color}`}>
                          {item.general.name} ({item.general.chinese})
                        </span>
                      </div>
                      {item.tuongCungVi && (
                        <div className="text-[10px] text-[#5C4318] font-serif flex items-center justify-between">
                          <span>Tượng: 《{item.tuongCungVi.tuongName}》</span>
                          <span className="text-[9px] text-[#7A6B56]">{item.tuongCungVi.nature}</span>
                        </div>
                      )}
                    </div>

                    {/* Hàng 4: Luận giải */}
                    <div className="pt-2 space-y-1 text-[10px]">
                      <div className="text-[#5C4318] font-serif font-semibold">
                        {item.relationSummary}
                      </div>
                      <div className="text-[#5C4D3C] leading-relaxed">
                        {item.lucThanMeaning}
                      </div>
                      {item.isKhongVong && (
                        <div className="text-[#6B21A8] font-serif italic pt-0.5">
                          • {item.khongVongNote}
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-[9.5px] text-[#7A6B56] mt-2.5 pt-2 border-t border-[#EAE2D0] italic">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* =========================================================
              PHẦN 2: TỨ KHÓA (CAN THƯỢNG • CAN THẦN • CHI THƯỢNG • CHI THẦN)
              ========================================================= */}
          <div className="p-4 rounded-xl bg-[#FFFDF8] border border-[#C4963E]/45 shadow-inner space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#C4963E]/45 pb-2">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#92400E]" />
                <h4 className="text-sm font-serif font-bold text-[#1C1813] tracking-wide">
                  TỨ KHÓA (四課)
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAF6EE] text-[#6E4E16] border border-[#C4963E]/45">
                  Hạ Thần ➔ Thượng Thần ➔ Thiên Tướng
                </span>
              </div>
              <span className="text-[11px] text-[#5C4D3C]">
                (Sắp xếp theo thứ tự cổ pháp: Đệ Tứ ➔ Đệ Tam ➔ Đệ Nhị ➔ Đệ Nhất Khóa)
              </span>
            </div>

            {/* 4 Cột Tứ Khóa (từ Đệ Tứ Khóa đến Đệ Nhất Khóa) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
              {[...lucNhamData.tuKhoa].reverse().map((khoa) => {
                const isPhatDoan = khoa.id - 1 === lucNhamData.phatDoanIndex;
                return (
                  <div
                    key={khoa.id}
                    className={`rounded-xl p-3 border flex flex-col justify-between transition-all ${
                      isPhatDoan
                        ? "bg-gradient-to-b from-[#FFFDF5] to-[#FBF0D9] border-2 border-[#9E2A2B] shadow-[0_10px_24px_rgba(158,42,43,0.14)]"
                        : "bg-[#FFFDF8] border-[#C4963E]/45 shadow-xs"
                    }`}
                  >
                    <div>
                      {/* Tiêu đề Khóa */}
                      <div className="flex items-center justify-between border-b border-[#C4963E]/45 pb-1.5 mb-2">
                        <div>
                          <div className={`text-[11px] font-serif font-extrabold ${isPhatDoan ? "text-[#9E2A2B]" : "text-[#1C1813]"}`}>
                            {khoa.name}
                          </div>
                          <div className="text-[9px] text-[#5C4D3C]">{khoa.sub}</div>
                        </div>
                        {isPhatDoan && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#9E2A2B] text-white border border-[#D4AF37] font-extrabold flex items-center gap-0.5 shadow-xs">
                            <Zap className="w-2.5 h-2.5" />
                            Phát Đoan
                          </span>
                        )}
                      </div>

                      {/* 3 Tầng Tối Giản: Thiên Tướng • Thượng Thần • Hạ Thần (Không hộp lồng hộp) */}
                      <div className="divide-y divide-[#EAE2D0] my-1">
                        {/* Tầng 1: Thiên Tướng */}
                        <div className="py-1.5 flex items-center justify-between text-xs">
                          <span className="text-[10px] text-[#7A6B56]">Thiên Tướng</span>
                          <span className={`font-serif font-bold ${khoa.general.color}`}>
                            {khoa.general.name} ({khoa.general.chinese})
                          </span>
                        </div>

                        {/* Tầng 2: Thượng Thần (Thiên Bàn) */}
                        <div className="py-2 flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-[#6E4E16] font-medium">Thượng Thần</span>
                            {khoa.isThuongKhongVong && (
                              <span className="text-[8.5px] px-1.5 py-0.2 rounded bg-[#F5F0FF] text-[#6B21A8] border border-[#C4B5FD] font-semibold">
                                Tuần Không
                              </span>
                            )}
                          </div>
                          <div className="text-base font-serif font-bold text-[#1C1813]">
                            {khoa.thuongChinese} <span className="text-xs font-semibold text-[#5C4D3C]">({khoa.thuongChi})</span>
                          </div>
                        </div>

                        {/* Tầng 3: Hạ Thần (Địa Bàn / Ký cung) */}
                        <div className="py-2 flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-[#7A6B56]">Hạ Thần</span>
                            {khoa.isHaKhongVong && (
                              <span className="text-[8.5px] px-1.5 py-0.2 rounded bg-[#F5F0FF] text-[#6B21A8] border border-[#C4B5FD] font-semibold">
                                Tuần Không
                              </span>
                            )}
                          </div>
                          <div className="text-sm font-serif font-bold text-[#4A3B28]">
                            {khoa.haChinese} <span className="text-xs font-normal text-[#6E5D47]">({khoa.haName})</span>
                          </div>
                        </div>

                        {/* TẦNG TRÍCH TÂM ẤN PHÚ TỐI GIẢN (KHÔNG ĐÓNG HỘP LỒNG HỘP) */}
                        {khoa.tamAnPhu && khoa.tamAnPhu.tuongName && (
                          <div
                            onClick={() => setSelectedTamAnPhuKhoa(khoa)}
                            className="py-2 cursor-pointer group space-y-0.5"
                            title={`Bấm xem chi tiết khẩu quyết Tâm Ấn Phú: 《${khoa.tamAnPhu.tuongName}》`}
                          >
                            <div className="flex items-center justify-between gap-1 text-[10px]">
                              <span className="text-[#7A6B56] font-serif">Tâm Ấn Phú</span>
                              <span className="font-serif font-bold text-[#6E4E16] group-hover:text-[#9E2A2B] truncate">
                                《{khoa.tamAnPhu.tuongName}》 ↗
                              </span>
                            </div>
                            {khoa.tamAnPhu.meaning && (
                              <div className="text-[9px] text-[#5C4D3C] leading-snug line-clamp-1">
                                {khoa.tamAnPhu.meaning}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Nhãn Quan Hệ Sinh Khắc Tối Giản */}
                    <div className="mt-2 pt-2 border-t border-[#EAE2D0] flex items-center justify-between text-[10px] font-serif">
                      <span className="text-[#6E5D47] font-medium">{khoa.relation.text}</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#F5EFE2] text-[#5C4318] border border-[#D5C39C] font-bold">
                        {khoa.lucThan}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* =========================================================
              PHẦN 3: BÀN LỤC NHÂM (THIÊN ĐỊA BÀN 12 CUNG)
              ========================================================= */}
          <XuanBaguaStage
            baguaSize="xl"
            badgeText="ĐẠI LỤC NHÂM THẦN KHÓA • THIÊN ĐỊA BÀN 12 CUNG"
            title="Bàn Lục Nhâm 12 Cung — Thiên Địa Bàn Đại Độn (4×4)"
            sealText="六壬神課"
            className="p-4 sm:p-5 space-y-3.5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-[#C4963E]/45 pb-2.5">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#9E2A2B]" />
                <h4 className="text-base sm:text-lg font-serif font-bold text-[#1C1813] tracking-wide">
                  BÀN LỤC NHÂM (六壬盤)
                </h4>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FAF6EE] text-[#6E4E16] border border-[#C4963E]/45 font-medium">
                  12 Cung Bát Quái Phương Vị
                </span>
              </div>
              <div className="text-xs sm:text-sm text-[#5C4D3C] flex items-center gap-3.5 flex-wrap">
                <span>Nguyệt Tướng: <strong className="text-[#9E2A2B] font-serif">{selectedTuong.branch} ({selectedTuong.name})</strong></span>
                <span>Thời Thần: <strong className="text-[#78350F] font-serif">{activeThoiBranchName}</strong></span>
                <span>Quý Nhân: <strong className="text-[#78350F] font-serif">{activeNobleBranchName}</strong> ({lucNhamData.isEffectiveDaytimeNoble ? "Trú Quý" : "Dạ Quý"} • {nobleInfo.ruleShort})</span>
              </div>
            </div>

            {/* Bố cục lưới 4x4 truyền thống */}
            <div className="grid grid-cols-4 gap-2 sm:gap-2.5 max-w-4xl mx-auto my-3">
              {/* Vòng ngoài 12 cung + Trung cung */}
              {Array.from({ length: 4 }).map((_, rIdx) =>
                Array.from({ length: 4 }).map((_, cIdx) => {
                  // Kiểm tra xem ô này là 1 trong 12 cung Địa Bàn hay thuộc Trung Cung (r:1,2 & c:1,2)
                  const branchEntry = Object.entries(GRID_COORDS).find(
                    ([_, coord]) => coord.row === rIdx && coord.col === cIdx
                  );

                  // Nếu là Trung Cung (4 ô ở giữa: r1-2, c1-2)
                  if (!branchEntry) {
                    // Chỉ render Trung Cung 1 lần ở ô [1,1] với col-span-2 row-span-2
                    if (rIdx === 1 && cIdx === 1) {
                      return (
                        <div
                          key="trung-cung"
                          className="col-span-2 row-span-2 bg-gradient-to-b from-[#FFFDF5] via-[#FAF3E3] to-[#F3E6C8] border-2 border-[#B8862D] rounded-xl p-3.5 sm:p-4 flex flex-col items-center justify-center text-center shadow-[inset_0_0_24px_rgba(196,150,62,0.16)] relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.16)_0%,transparent_70%)] pointer-events-none" />

                          <span className="px-3 py-1 rounded-md bg-[#9E2A2B] text-white border border-[#D4AF37] text-[10px] sm:text-[11px] font-serif font-extrabold tracking-widest mb-2 shadow-sm">
                            六壬神課 • TRUNG CUNG THÁI CỰC
                          </span>

                          <div className="text-sm sm:text-base font-serif font-extrabold text-[#1C1813] tracking-wider">
                            {lucNhamData.cucName}
                          </div>
                          <div className="text-[11px] sm:text-xs text-[#6E4E16] font-serif font-semibold mt-0.5 max-w-xs line-clamp-1">
                            {lucNhamData.cucDesc}
                          </div>

                          <div className="text-[11px] sm:text-xs text-[#5C4D3C] mt-2 space-y-1 bg-[#FFFDF8]/90 px-3 py-2 rounded-lg border border-[#C4963E]/40">
                            <div>Nhật Can: <strong className="text-[#9E2A2B] font-serif">{dayCan} ({dayChi})</strong> • Nguyệt Tướng: <strong className="text-[#78350F] font-serif">{selectedTuong.branch}</strong> gia <strong className="text-[#78350F] font-serif">{activeThoiBranchName}</strong></div>
                            <div>Quý Nhân: <strong className="text-[#78350F] font-serif">{activeNobleBranchName}</strong> ({lucNhamData.isShunXing ? "Thuận hành" : "Nghịch hành"} • {nobleInfo.ruleShort})</div>
                            <div>Tuần Không: <strong className="text-[#6B21A8] font-serif">{lucNhamData.khongVong.branches.join(" • ")}</strong> ({lucNhamData.khongVong.tuanGiap})</div>
                          </div>

                          {/* Nút Lưu Quẻ Lục Nhâm ở Trung Cung */}
                          <button
                            type="button"
                            onClick={handleSaveLucNhamRecord}
                            className="mt-2.5 flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#B91C1C] via-[#9E2A2B] to-[#7F1D1D] hover:brightness-110 active:scale-95 text-white border border-[#D4AF37] text-[11px] sm:text-xs font-serif font-bold shadow-md cursor-pointer transition-all"
                            title="Lưu quẻ Lục Nhâm này vào lịch sử"
                          >
                            <BookmarkCheck className="w-3.5 h-3.5 text-[#FDE68A]" />
                            <span>Lưu Quẻ Lục Nhâm</span>
                          </button>
                        </div>
                      );
                    }
                    return null; // Ô [1,2], [2,1], [2,2] đã được span
                  }

                  const groundIdx = parseInt(branchEntry[0], 10);
                  const palace = lucNhamData.palaces[groundIdx];
                  const palaceDonCan = getTuanDonCan(dayCan, dayChi, palace.groundName);

                  return (
                    <div
                      key={palace.groundName}
                      onClick={() => setSelectedPalaceDetailIndex(groundIdx)}
                      className={`p-3 sm:p-3.5 rounded-xl border flex flex-col justify-between transition-all cursor-pointer group hover:border-[#9E2A2B]/60 hover:shadow-md ${
                        palace.isGroundKhongVong || palace.isSkyKhongVong
                          ? "bg-[#FCF9FF] border-[#C4B5FD]"
                          : palace.isNoble
                          ? "bg-[#FFFDF6] border-[#B8862D]"
                          : "bg-[#FFFDF8] border-[#D8C8A8]"
                      }`}
                      title={`Bấm để xem chi tiết Cung ${palace.groundName} & Tượng Thần ${palace.general.name}`}
                    >
                      {/* Tầng 1: Thiên Tướng & Ký hiệu */}
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-[11px] sm:text-xs font-serif font-bold ${palace.general.color} truncate`}>
                          {palace.general.name}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          {(palace.isGroundKhongVong || palace.isSkyKhongVong) && (
                            <span className="text-[#6B21A8] font-serif text-[9px] px-1.5 py-0.2 rounded bg-[#F3E8FF]">
                              Tuần Không
                            </span>
                          )}
                          {palace.isNoble && <Crown className="w-3.5 h-3.5 text-[#9E2A2B]" />}
                          {palace.isNguyetTuong && <Sun className="w-3.5 h-3.5 text-[#B45309]" />}
                          {(palace.isHoatThoi || palace.isChiemThoi || palace.isThoiThan) && (
                            <Clock className="w-3.5 h-3.5 text-[#7A5D28]" />
                          )}
                        </div>
                      </div>

                      {/* Tầng 2: Thiên Bàn Chi (Không đóng hộp lồng hộp) */}
                      <div className="my-2.5 text-center">
                        <div className="text-xl sm:text-2xl font-serif font-bold text-[#1C1813] tracking-wide">
                          {palace.skyChinese} <span className="text-base sm:text-lg font-semibold text-[#4A3B28]">{palace.skyName}</span>
                        </div>
                        {palace.tuongCungVi && (
                          <div className="text-[9.5px] sm:text-[10px] text-[#7A5D28] font-serif mt-0.5 truncate">
                            《{palace.tuongCungVi.tuongName}》
                          </div>
                        )}
                      </div>

                      {/* Tầng 3: Địa Bàn Chi & Độn Can */}
                      <div className="pt-1.5 border-t border-[#EAE2D0] flex items-center justify-between text-[11px] sm:text-xs">
                        <span className="text-[#8A6A2F] font-serif">
                          {palaceDonCan.isKhongVong ? "Không" : palaceDonCan.can}
                        </span>
                        <span className="font-serif font-semibold text-[#5C4D3C]">
                          Địa bàn: {palace.groundName}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Chú giải bàn Lục Nhâm */}
            <div className="text-xs text-[#5C4D3C] flex items-center justify-between flex-wrap gap-2 pt-2.5 border-t border-[#C4963E]/45">
              <div className="flex items-center gap-3.5 flex-wrap">
                <span className="flex items-center gap-1.5 text-[#6B21A8]">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" /> Tuần Không [{lucNhamData.khongVong.branches.join(", ")}]
                </span>
                <span className="flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-[#92400E]" /> Cung Quý Nhân
                </span>
                <span className="flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-[#1D4ED8]" /> Nguyệt Tướng
                </span>
                <span className="flex items-center gap-1.5">
                  <Dices className="w-3.5 h-3.5 text-[#92400E]" /> Thời Thần (Hoạt Thời)
                </span>
              </div>
              <span className="text-[#6E4E16] font-serif font-semibold">
                Đại Lục Nhâm Thần Khóa
              </span>
            </div>

            {/* Thanh thao tác dưới cùng: Nút Lưu Quẻ Lục Nhâm, Quẻ Đã Lưu & Sao Chép */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-[#C4963E]/45 bg-[#FFFDF8] -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 p-3.5 sm:p-4 rounded-b-xl">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleSaveLucNhamRecord}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#C89B3C] via-[#E2C37A] to-[#A87B25] text-[#14100C] text-xs font-serif font-bold shadow-lg hover:brightness-110 active:scale-95 cursor-pointer transition-all"
                  title="Lưu toàn bộ bàn quẻ Lục Nhâm này vào lịch sử"
                >
                  <BookmarkCheck className="w-4 h-4" />
                  <span>Lưu Quẻ Lục Nhâm</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsHistoryModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FFFDF8] hover:bg-[#FAF6EE] border border-[#C4963E]/45 hover:border-[#B8862D] text-xs text-[#6E4E16] font-semibold cursor-pointer transition-all shadow-sm active:scale-95"
                >
                  <History className="w-3.5 h-3.5 text-[#92400E]" />
                  <span>Quẻ Đã Lưu ({savedRecords.length})</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyCurrentSummary}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FFFDF8] hover:bg-[#FAF6EE] border border-[#C4963E]/45 hover:border-[#B8862D] text-xs text-[#1C1813] hover:text-[#6E4E16] font-semibold cursor-pointer transition-all active:scale-95"
                  title="Sao chép toàn bộ tóm tắt quẻ chiêm đoán"
                >
                  <Copy className="w-3.5 h-3.5 text-[#92400E]" />
                  <span>Sao Chép Tóm Tắt Quẻ</span>
                </button>
              </div>

              {saveToastMsg && (
                <div className="flex items-center gap-1.5 text-xs text-[#6E4E16] bg-[#FEF3C7] border border-amber-600/80 px-3 py-1.5 rounded-xl shadow-lg animate-in fade-in duration-200">
                  <CheckCircle2 className="w-4 h-4 text-[#92400E] shrink-0" />
                  <span className="font-semibold">{saveToastMsg}</span>
                </div>
              )}
            </div>
          </XuanBaguaStage>
        </div>
      )}

      {/* =========================================================================
          MODAL: LỊCH SỬ QUẺ LỤC NHÂM ĐÃ LƯU
          ========================================================================= */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl max-h-[85vh] flex flex-col bg-[#FFFDF8] border border-[#C4963E]/45 rounded-2xl shadow-2xl text-[#1C1813] animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#C4963E]/45 px-5 py-3.5 bg-[#FFFDF8]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C9A55A] to-[#8C6218] flex items-center justify-center text-[#120F0B] font-bold shadow">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-[#6E4E16]">
                    LỊCH SỬ QUẺ LỤC NHÂM ĐÃ LƯU
                  </h3>
                  <p className="text-[11px] text-[#5C4D3C]">
                    {savedRecords.length} quẻ đã lưu trong bộ nhớ
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {savedRecords.length > 0 && (
                  <button
                    type="button"
                    onClick={handleExportBackup}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs text-[#1C1813] bg-[#FFFDF8] hover:bg-[#FAF6EE] border border-[#C4963E]/45 rounded-lg cursor-pointer transition-all"
                    title="Xuất file JSON sao lưu"
                  >
                    <FileDown className="w-3.5 h-3.5 text-[#92400E]" />
                    <span className="hidden sm:inline">Xuất JSON</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsHistoryModalOpen(false)}
                  className="p-1.5 text-[#5C4D3C] hover:text-[#1C1813] hover:bg-[#FAF6EE] rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Search Filter */}
            {savedRecords.length > 0 && (
              <div className="px-5 py-2.5 bg-[#FFFDF8] border-b border-[#C4963E]/45 flex items-center gap-2">
                <Search className="w-4 h-4 text-[#5C4D3C] shrink-0" />
                <input
                  type="text"
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  placeholder="Tìm kiếm theo câu hỏi, Can Chi, Nguyệt Tướng..."
                  className="w-full bg-transparent text-xs text-[#1C1813] placeholder-[#6E5D4B] outline-none"
                />
                {historySearchQuery && (
                  <button
                    type="button"
                    onClick={() => setHistorySearchQuery("")}
                    className="text-[#5C4D3C] hover:text-[#1C1813] text-xs p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}

            {/* Modal Body: List of Records */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1 scrollbar-thin">
              {savedRecords.length === 0 ? (
                <div className="py-12 text-center text-[#5C4D3C] space-y-2">
                  <Compass className="w-10 h-10 mx-auto opacity-40 text-[#92400E]" />
                  <p className="text-sm font-serif font-bold text-[#1C1813]">Chưa có quẻ Lục Nhâm nào được lưu</p>
                  <p className="text-xs max-w-sm mx-auto">
                    Sau khi an bàn quẻ hoặc gieo Hoạt Thời, hãy nhập câu hỏi và nhấn nút <strong>"Lưu Quẻ Lục Nhâm Này"</strong> để lưu lại.
                  </p>
                </div>
              ) : (
                (() => {
                  const filtered = savedRecords.filter((r) => {
                    if (!historySearchQuery.trim()) return true;
                    const q = historySearchQuery.toLowerCase();
                    return (
                      r.question.toLowerCase().includes(q) ||
                      r.dayCan.toLowerCase().includes(q) ||
                      r.dayChi.toLowerCase().includes(q) ||
                      r.nguyetTuong.name.toLowerCase().includes(q) ||
                      r.tamTruyen.patternName.toLowerCase().includes(q)
                    );
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="py-8 text-center text-xs text-[#5C4D3C]">
                        Không tìm thấy quẻ nào khớp với từ khóa "{historySearchQuery}".
                      </div>
                    );
                  }

                  return filtered.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-3.5 rounded-xl bg-[#FFFDF8] border border-[#C4963E]/45 hover:border-[#C4963E]/45 transition-all space-y-2.5 relative"
                    >
                      {/* Top Header of Record */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#C4963E]/45 pb-2 text-[11px]">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[#92400E] font-mono font-semibold">
                            🕒 {rec.formattedDate}
                          </span>
                          <span className="text-[#5E4833]">•</span>
                          <span className="px-2 py-0.2 rounded bg-[#FFFDF8] text-[#1C1813] border border-[#C4963E]/45 font-medium">
                            Ngày {rec.dayCan} {rec.dayChi} • Giờ {rec.hourCan} {rec.hourChi}
                          </span>
                          <span className="px-2 py-0.2 rounded bg-[#FEF3C7] text-[#78350F] border border-amber-700/60 font-medium">
                            Nguyệt Tướng [{rec.nguyetTuong.branch} - {rec.nguyetTuong.name}]
                          </span>
                          <span className="px-2 py-0.2 rounded bg-[#E0E7FF] text-indigo-200 border border-indigo-700/60 font-medium">
                            {rec.timePlateSource === "hoatthoi" ? `Hoạt Thời [${rec.activeThoiBranch}]` : `Trụ Giờ [${rec.activeThoiBranch}]`}
                          </span>
                        </div>

                        {/* Action buttons on card */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleLoadRecord(rec)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF6EE] hover:bg-[#FAF6EE] text-[#6E4E16] border border-[#C4963E]/45 text-xs font-semibold cursor-pointer transition-all active:scale-95"
                            title="Tải lại toàn bộ thông số quẻ này vào bàn Lục Nhâm"
                          >
                            <RotateCcw className="w-3 h-3 text-[#92400E]" />
                            <span>Nạp vào bàn</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopyRecordSummary(rec)}
                            className="p-1 text-[#5C4D3C] hover:text-[#6E4E16] bg-[#FFFDF8] hover:bg-[#FAF6EE] rounded-lg border border-[#C4963E]/45 cursor-pointer transition-all"
                            title="Sao chép tóm tắt quẻ"
                          >
                            {copiedRecordId === rec.id ? (
                              <Check className="w-3.5 h-3.5 text-[#15803D]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          {confirmDeleteRecordId === rec.id ? (
                            <div className="flex items-center gap-1 bg-red-950/90 border border-red-600 px-1.5 py-0.5 rounded-lg animate-in fade-in">
                              <span className="text-[10px] text-red-200 whitespace-nowrap">Xóa?</span>
                              <button
                                type="button"
                                onClick={() => handleDeleteRecord(rec.id)}
                                className="px-1.5 py-0.5 rounded bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold cursor-pointer"
                              >
                                Xác nhận
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteRecordId(null)}
                                className="px-1.5 py-0.5 rounded bg-[#FFFDF8] text-[#5C4D3C] text-[10px] cursor-pointer"
                              >
                                Hủy
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteRecordId(rec.id)}
                              className="p-1 text-[#5C4D3C] hover:text-red-400 bg-[#FFFDF8] hover:bg-red-950/50 rounded-lg border border-[#C4963E]/45 hover:border-red-800/80 cursor-pointer transition-all"
                              title="Xóa quẻ này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Question Content */}
                      <div className="text-xs sm:text-sm font-serif font-bold text-[#1C1813] flex items-start gap-2">
                        <span className="text-[#6E4E16] text-base leading-none">❓</span>
                        <span className="leading-snug">{rec.question}</span>
                      </div>

                      {/* Details: Tam Truyền & Quý Nhân */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1 border-t border-[#C4963E]/45">
                        {/* Tam Truyền */}
                        <div className="bg-[#FFFDF8] border border-[#C4963E]/45 rounded-lg p-2 flex flex-col justify-between">
                          <div className="text-[10px] text-[#5C4D3C] font-semibold mb-1 flex items-center justify-between">
                            <span>TAM TRUYỀN ({rec.tamTruyen.patternName}):</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-[#6E4E16] flex-wrap">
                            <span className="px-1.5 py-0.5 rounded bg-[#FFFDF8] border border-[#C4963E]/45">
                              Sơ: {rec.tamTruyen.soTruyen.branch} ({rec.tamTruyen.soTruyen.general})
                            </span>
                            <span>➔</span>
                            <span className="px-1.5 py-0.5 rounded bg-[#FFFDF8] border border-[#C4963E]/45">
                              Trung: {rec.tamTruyen.trungTruyen.branch} ({rec.tamTruyen.trungTruyen.general})
                            </span>
                            <span>➔</span>
                            <span className="px-1.5 py-0.5 rounded bg-[#FFFDF8] border border-[#C4963E]/45">
                              Mạt: {rec.tamTruyen.matTruyen.branch} ({rec.tamTruyen.matTruyen.general})
                            </span>
                          </div>
                        </div>

                        {/* Quý Nhân & Tuần Không */}
                        <div className="bg-[#FFFDF8] border border-[#C4963E]/45 rounded-lg p-2 space-y-1">
                          <div className="flex items-center justify-between text-[10.5px]">
                            <span className="text-[#5C4D3C]">Quý Nhân:</span>
                            <strong className="text-[#78350F]">
                              {rec.activeNobleBranch} ({rec.isEffectiveDaytimeNoble ? "Trú Quý" : "Dạ Quý"} • {rec.isShunXing ? "Thuận" : "Nghịch"})
                            </strong>
                          </div>
                          <div className="flex items-center justify-between text-[10.5px]">
                            <span className="text-[#5C4D3C]">Tuần Không:</span>
                            <strong className="text-[#6B21A8]">{rec.khongVong.branches.join(" • ")} ({rec.khongVong.tuanGiap})</strong>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-[#5C4D3C] flex-wrap gap-1">
                            <span>Tứ Khóa:</span>
                            <span>
                              {rec.tuKhoa.map((k) => `${k.name}: ${k.thuong}/${k.ha}`).join(" • ")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ));
                })()
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-[#C4963E]/45 px-5 py-3 bg-[#FFFDF8] flex items-center justify-between gap-3 flex-wrap">
              {savedRecords.length > 0 ? (
                isConfirmClearAllRecords ? (
                  <div className="flex items-center gap-1.5 bg-red-950/90 border border-red-700 px-2 py-1 rounded-lg">
                    <span className="text-[11px] text-red-200 font-medium">Xóa toàn bộ lịch sử?</span>
                    <button
                      type="button"
                      onClick={handleClearAllRecords}
                      className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold cursor-pointer"
                    >
                      Xác nhận xóa
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsConfirmClearAllRecords(false)}
                      className="px-2 py-0.5 rounded bg-[#FFFDF8] text-[#5C4D3C] text-[11px] cursor-pointer"
                    >
                      Hủy
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsConfirmClearAllRecords(true)}
                    className="text-xs text-red-400 hover:text-red-300 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa toàn bộ lịch sử</span>
                  </button>
                )
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-[#FAF6EE] hover:bg-[#FAF6EE] border border-[#C4963E]/45 text-xs text-[#1C1813] font-semibold cursor-pointer transition-all ml-auto"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CẨM NANG 12 THIÊN TƯỚNG LÂM 12 CUNG ĐỊA BÀN (144 TƯỢNG THẦN)
          ========================================================================= */}
      {is12GeneralModalOpen && (() => {
        const activeGeneral = LUC_NHAM_THIEN_TUONG_12_CUNG_DATA.find(
          (g) => g.id === generalModalActiveId
        ) || LUC_NHAM_THIEN_TUONG_12_CUNG_DATA[0];

        // Tìm xem Thần này đang ngồi ở Cung Địa Bàn nào trên Bàn hiện tại
        const sittingPalaceOnBoard = lucNhamData.palaces.find(
          (p) => p.general.name === activeGeneral.name
        );

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#FFFDF8] border border-[#C4963E]/45 rounded-2xl shadow-2xl text-[#1C1813] animate-in zoom-in-95 duration-200 overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-[#C4963E]/45 px-4 sm:px-5 py-3 bg-[#FFFDF8] shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#FAF6EE] border border-[#C4963E]/45 flex items-center justify-center text-[#92400E]">
                    <Crown className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-serif font-bold text-[#1C1813] flex items-center gap-2 flex-wrap">
                      <span>CẨM NANG 12 THIÊN TƯỚNG LÂM 12 CUNG</span>
                      <span className="text-[10px] text-[#78350F] font-mono font-normal px-2 py-0.5 rounded bg-[#FEF3C7] border border-amber-700/60">
                        TÍNH THIÊN BÀN • 144 TƯỢNG THẦN
                      </span>
                    </h3>
                    <p className="text-[10.5px] text-[#5C4D3C] hidden sm:block">
                      Tượng thần, con số & ý nghĩa chiêm đoán khi 12 Quý Thần Lục Nhâm ngự 12 Chi Thiên Bàn và khẩu quyết 《Tâm Ấn Phú》
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIs12GeneralModalOpen(false)}
                  className="p-1.5 rounded-lg text-[#5C4D3C] hover:text-[#1C1813] hover:bg-[#FFFDF8] transition-all cursor-pointer"
                  title="Đóng cẩm nang"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tab Switcher: 144 Tượng Thần (Thiên Bàn) vs Tâm Ấn Phú */}
              <div className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-[#FFFDF8] border-b border-[#C4963E]/45 flex-wrap">
                <button
                  type="button"
                  onClick={() => setGeneralModalTab("cungvi")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                    generalModalTab === "cungvi"
                      ? "bg-gradient-to-r from-[#C9A55A] to-[#B8861B] text-[#120F0B] border-[#B8862D] shadow-md"
                      : "bg-[#FFFDF8] hover:bg-[#FAF6EE] text-[#1C1813] border-[#C4963E]/45"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>144 Tượng Thần Bí Quyết (Tính Thiên Bàn)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGeneralModalTab("tamanphu")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                    generalModalTab === "tamanphu"
                      ? "bg-gradient-to-r from-[#C9A55A] to-[#B8861B] text-[#120F0B] border-[#B8862D] shadow-md"
                      : "bg-[#FFFDF8] hover:bg-[#FAF6EE] text-[#1C1813] border-[#C4963E]/45"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Toàn Văn 《Tâm Ấn Phú》 (心印賦)</span>
                </button>

                <span className="text-[11px] text-[#5C4D3C] ml-auto hidden md:inline">
                  {generalModalTab === "cungvi" ? "Tính theo Thiên Bàn Chi" : "Trích Lục Nhâm Chỉ Nam"}
                </span>
              </div>

              {/* 12 Tab Nút Chọn Thiên Tướng */}
              <div className="p-2 sm:p-3 bg-[#FFFDF8] border-b border-[#C4963E]/45 overflow-x-auto scrollbar-thin shrink-0">
                <div className="flex items-center gap-1.5 min-w-max">
                  {LUC_NHAM_THIEN_TUONG_12_CUNG_DATA.map((gen) => {
                    const isSelected = gen.id === generalModalActiveId;
                    const sittingPalace = lucNhamData.palaces.find((p) => p.general.name === gen.name);
                    const isSitting = !!sittingPalace;

                    return (
                      <button
                        key={gen.id}
                        type="button"
                        onClick={() => setGeneralModalActiveId(gen.id)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-serif transition-all cursor-pointer flex items-center gap-1.5 border ${
                          isSelected
                            ? "bg-gradient-to-r from-[#C9A55A] to-[#C29729] text-[#120F0B] font-bold border-[#B8862D] shadow-md scale-105"
                            : "bg-[#FFFDF8] hover:bg-[#FAF6EE] text-[#1C1813] border-[#C4963E]/45"
                        }`}
                      >
                        <span className={`text-[10px] font-mono font-bold ${isSelected ? "text-[#120F0B]" : "text-[#92400E]/80"}`}>
                          {String(gen.id).padStart(2, "0")}
                        </span>
                        <span>{gen.name}</span>
                        <span className={`text-[9.5px] ${isSelected ? "text-[#120F0B]/80" : "text-[#5C4D3C]"}`}>
                          ({gen.chinese})
                        </span>
                        {isSitting && sittingPalace && (
                          <span
                            className="text-[9px] px-1 rounded font-sans font-bold bg-[#FEF3C7] text-[#78350F] border border-amber-500"
                            title={`Đang ngự Thiên Bàn Cung ${sittingPalace.skyName} (trên Địa Bàn ${sittingPalace.groundName})`}
                          >
                            📍 Cư {sittingPalace.skyName}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-4 scrollbar-thin">
                {generalModalTab === "cungvi" ? (
                  <>
                    {/* Header Thẻ Thần */}
                    <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-br from-[#FFFDF8] via-[#FFFDF8] to-[#FFFDF8] border border-[#C4963E]/45 space-y-2.5 shadow-md">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-[#FAF6EE] border border-[#C4963E]/45 flex flex-col items-center justify-center shrink-0 shadow-inner">
                            <span className={`text-base font-serif font-bold ${activeGeneral.color}`}>
                              {activeGeneral.name}
                            </span>
                            <span className="text-[10px] text-[#5C4D3C]">{activeGeneral.chinese}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-base sm:text-lg font-serif font-bold text-[#1C1813]">
                                {String(activeGeneral.id).padStart(2, "0")} {activeGeneral.name} ({activeGeneral.chinese})
                              </h4>
                              <span className={`text-[9.5px] px-2 py-0.5 rounded-full font-bold border ${activeGeneral.natureColor}`}>
                                {activeGeneral.nature}
                              </span>
                              <span className="text-[10px] text-[#5C4D3C] bg-[#FFFDF8] border border-[#C4963E]/45 px-2 py-0.5 rounded">
                                Hành {activeGeneral.element}
                              </span>
                              {activeGeneral.numbers && (
                                <span className="text-[10px] font-mono font-bold text-[#78350F] bg-[#FEF3C7] border border-amber-600/70 px-2 py-0.5 rounded">
                                  {activeGeneral.numbers}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-[#5C4D3C] mt-0.5">
                              {activeGeneral.symbol}
                            </div>
                          </div>
                        </div>

                        {sittingPalaceOnBoard && sittingPalaceOnBoard.tuongCungVi && (
                          <div className="p-2 sm:px-3 rounded-xl bg-gradient-to-r from-[#FAF6EE] to-[#FFFDF8] border border-amber-500/80 shadow text-right">
                            <div className="text-[10px] text-[#5C4D3C] flex items-center justify-end gap-1">
                              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
                              <span>TRÊN BÀN HIỆN TẠI (THIÊN BÀN):</span>
                            </div>
                            <div className="text-xs font-serif font-bold text-[#78350F] mt-0.5">
                              Cư {sittingPalaceOnBoard.skyName} — {sittingPalaceOnBoard.tuongCungVi.tuongName} ({sittingPalaceOnBoard.tuongCungVi.tuongChinese})
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Tổng quan ý nghĩa cốt lõi */}
                      <div className="p-2.5 rounded-lg bg-[#FFFDF8] border border-[#C4963E]/45 space-y-1">
                        <div className="text-xs sm:text-[13px] font-serif text-[#6E4E16] font-semibold leading-relaxed">
                          "{activeGeneral.overview}"
                        </div>
                        {activeGeneral.specialNotes && (
                          <div className="text-[11px] text-[#5C4D3C] pt-1 border-t border-[#C4963E]/45 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#92400E] shrink-0" />
                            <span><strong>Bí quyết đặc biệt:</strong> {activeGeneral.specialNotes}</span>
                          </div>
                        )}
                      </div>

                      {/* Khẩu Quyết Tâm Ấn Phú Của Thần Này */}
                      {activeGeneral.tamAnPhuPoem && (
                        <div className="p-2.5 rounded-lg bg-[#FFFDF8] border border-[#C4963E]/45 space-y-1 text-xs">
                          <div className="text-[#6E4E16] font-serif font-bold flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-[#92400E]" />
                            <span>Khẩu Quyết Tâm Ấn Phú:</span>
                          </div>
                          <div className="text-[#78350F] font-serif leading-relaxed">
                            {activeGeneral.tamAnPhuPoem}
                          </div>
                          {activeGeneral.tamAnPhuSinoViet && (
                            <div className="text-[#5C4D3C] text-[11px] italic pt-1 border-t border-[#C4963E]/45">
                              {activeGeneral.tamAnPhuSinoViet}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Tiêu đề mục 12 Cung */}
                    <div className="flex items-center justify-between gap-2 border-b border-[#C4963E]/45 pb-2">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-[#92400E]" />
                        <h4 className="text-xs sm:text-sm font-serif font-bold text-[#1C1813] uppercase tracking-wide">
                          Ý Nghĩa Khi {activeGeneral.name} Lâm Cung (Tính Theo Thiên Bàn: Cư Tý → Cư Hợi)
                        </h4>
                      </div>
                      <span className="text-[11px] text-[#5C4D3C]">
                        12 Cung Thiên Bàn Cát Hung
                      </span>
                    </div>

                    {/* Lưới 12 Cung */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {CHI_NAMES.map((branchName) => {
                        const cung = activeGeneral.cungVi[branchName];
                        if (!cung) return null;

                        const isSittingHere = sittingPalaceOnBoard?.skyName === branchName;

                        return (
                          <div
                            key={branchName}
                            className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
                              isSittingHere
                                ? "bg-gradient-to-br from-[#FAF6EE] via-[#FFFDF8] to-[#FFFDF8] border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.25)] ring-1 ring-amber-500/60 scale-[1.01]"
                                : "bg-[#FFFDF8] hover:bg-[#FFFDF8] border-[#C4963E]/45 hover:border-[#C4963E]/45"
                            }`}
                          >
                            <div>
                              {/* Hàng Header Cung */}
                              <div className="flex items-center justify-between gap-1 mb-1.5 flex-wrap">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs sm:text-sm font-serif font-extrabold text-[#1C1813]">
                                    Cư {cung.branch} <span className="text-[10px] text-[#5C4D3C]">({cung.chineseBranch})</span>
                                  </span>
                                  <span className="text-[#5C4D3C]">•</span>
                                  <span className="text-xs sm:text-sm font-serif font-bold text-[#78350F]">
                                    {cung.tuongName}
                                  </span>
                                  <span className="text-[10px] text-[#5C4D3C]">
                                    ({cung.tuongChinese})
                                  </span>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  {cung.nature && (
                                    <span className={`text-[8.5px] px-1.5 py-0.2 rounded font-bold border ${
                                      cung.nature.includes("Cát")
                                        ? "bg-[#DCFCE7] text-[#14532D] border-[#16A34A]/45"
                                        : cung.nature.includes("Hung")
                                        ? "bg-[#FEE2E2] text-[#991B1B] border-rose-700/60"
                                        : "bg-zinc-900 text-zinc-300 border-zinc-700"
                                    }`}>
                                      {cung.nature}
                                    </span>
                                  )}
                                  {isSittingHere && (
                                    <span className="text-[8.5px] px-1.5 py-0.2 rounded font-bold bg-amber-400 text-[#120F0B] shadow-sm flex items-center gap-0.5">
                                      <span>📍 Hiện Cư</span>
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Câu khẩu quyết Tâm Ấn Phú */}
                              {cung.tamAnPhuOriginal && (
                                <div className="text-[10.5px] text-[#78350F] font-serif italic bg-[#FFFDF8] px-2 py-1 rounded border border-[#D97706]/45 my-1.5">
                                  📜 <strong>{cung.tamAnPhuOriginal}</strong>
                                </div>
                              )}

                              {/* Lời giải thích ý nghĩa (theo đúng bản dịch người dùng đưa) */}
                              <p className="text-[11px] sm:text-xs text-[#1C1813] leading-relaxed mt-1">
                                {cung.meaning}
                              </p>
                            </div>

                            {isSittingHere && (
                              <div className="mt-2 pt-1.5 border-t border-amber-600/40 text-[9.5px] text-[#78350F] flex items-center gap-1 font-semibold">
                                <Sparkles className="w-3 h-3 text-[#92400E] shrink-0" />
                                <span>Thần đang ngự tại Cung Thiên Bàn này trong quẻ</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  /* =========================================================
                     TAB 2: TOÀN VĂN 《TÂM ẤN PHÚ》 (心印賦)
                     ========================================================= */
                  <div className="space-y-4">
                    {/* Banner Tâm Ấn Phú */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FFFDF8] via-[#FFFDF8] to-[#FFFDF8] border border-amber-500/60 shadow-lg space-y-2">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-[#92400E]" />
                        <h4 className="text-base sm:text-lg font-serif font-bold text-[#6E4E16]">
                          {TAM_AN_PHU_CHAPTER_DATA.chineseTitle} ({TAM_AN_PHU_CHAPTER_DATA.title})
                        </h4>
                      </div>
                      <div className="text-xs text-[#5C4D3C]">
                        <strong>Xuất xứ:</strong> {TAM_AN_PHU_CHAPTER_DATA.source}
                      </div>
                      <p className="text-xs text-[#1C1813] leading-relaxed bg-[#FFFDF8] p-2.5 rounded-xl border border-[#C4963E]/45">
                        {TAM_AN_PHU_CHAPTER_DATA.intro}
                      </p>
                    </div>

                    {/* Danh sách 12 Thiên Tướng trong Tâm Ấn Phú */}
                    <div className="space-y-3">
                      {TAM_AN_PHU_CHAPTER_DATA.generals.map((genItem) => {
                        const isCur = genItem.id === activeGeneral.id;
                        return (
                          <div
                            key={genItem.id}
                            className={`p-3.5 rounded-xl border transition-all ${
                              isCur
                                ? "bg-[#FFFDF8] border-amber-500/80 shadow-md ring-1 ring-amber-500/40"
                                : "bg-[#FFFDF8] border-[#C4963E]/45 hover:border-[#C4963E]/45"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-[#92400E] px-1.5 py-0.5 rounded bg-[#FEF3C7] border border-amber-700/60">
                                  {String(genItem.id).padStart(2, "0")}
                                </span>
                                <h5 className="font-serif font-bold text-sm text-[#1C1813]">
                                  {genItem.name} ({genItem.chinese})
                                </h5>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setGeneralModalActiveId(genItem.id);
                                  setGeneralModalTab("cungvi");
                                }}
                                className="text-[11px] text-[#78350F] hover:text-white px-2 py-0.5 rounded bg-[#FAF6EE] border border-[#C4963E]/45 hover:bg-[#FAF6EE] transition-all cursor-pointer flex items-center gap-1"
                              >
                                <span>Xem 12 Cung Thiên Bàn</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Bài thơ chữ Hán */}
                            <div className="p-2.5 rounded-lg bg-[#FFFDF8] border border-[#C4963E]/45 text-xs font-serif text-[#78350F] leading-relaxed tracking-wide">
                              {genItem.poem}
                            </div>

                            {/* Phiên âm Hán Việt */}
                            <div className="mt-1.5 text-[11px] text-[#1C1813] italic">
                              <span className="text-[#5C4D3C] not-italic font-semibold">Âm Hán Việt:</span> {genItem.sinoViet}
                            </div>

                            {/* Yếu lĩnh cốt lõi */}
                            <div className="mt-1.5 text-[11px] text-[#5C4D3C] bg-[#FFFDF8] p-2 rounded border border-[#C4963E]/45">
                              <span className="text-[#6E4E16] font-semibold">Yếu Lĩnh Chiêm Đoán:</span> {genItem.meaning}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="border-t border-[#C4963E]/45 px-5 py-3 bg-[#FFFDF8] flex items-center justify-between gap-3 shrink-0 flex-wrap">
                <div className="text-[11px] text-[#5C4D3C]">
                  Lục Nhâm Thần Khóa • 144 Tượng Thần Bí Truyền • Tính Theo Thiên Bàn
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setGeneralModalTab(generalModalTab === "cungvi" ? "tamanphu" : "cungvi")}
                    className="px-3 py-1.5 rounded-xl bg-[#FFFDF8] hover:bg-[#FAF6EE] border border-[#C4963E]/45 text-xs text-[#78350F] font-semibold cursor-pointer transition-all"
                  >
                    {generalModalTab === "cungvi" ? "Xem Toàn Văn Tâm Ấn Phú" : "Quay Lại 144 Tượng Thần"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIs12GeneralModalOpen(false)}
                    className="px-4 py-1.5 rounded-xl bg-[#FFFDF8] hover:bg-[#FAF6EE] border border-[#C4963E]/45 text-xs text-[#1C1813] font-semibold cursor-pointer transition-all"
                  >
                    Đóng Cẩm Nang
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* =========================================================================
          MODAL: CHI TIẾT CUNG ĐỊA BÀN & THIÊN TƯỚNG TỌA LÂM
          ========================================================================= */}
      {selectedPalaceDetailIndex !== null && (() => {
        const palace = lucNhamData.palaces[selectedPalaceDetailIndex];
        if (!palace) return null;
        const palaceDonCan = getTuanDonCan(dayCan, dayChi, palace.groundName);
        const generalDetail = LUC_NHAM_THIEN_TUONG_12_CUNG_DATA.find(
          (g) => g.name === palace.general.name
        );

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg flex flex-col bg-[#FFFDF8] border border-[#C4963E]/45 rounded-2xl shadow-2xl text-[#1C1813] animate-in zoom-in-95 duration-200 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#C4963E]/45 px-5 py-3.5 bg-[#FFFDF8]">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#92400E]" />
                  <h3 className="text-sm sm:text-base font-serif font-bold text-[#1C1813]">
                    CHI TIẾT CUNG {palace.groundName.toUpperCase()} ({palace.groundChinese})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPalaceDetailIndex(null)}
                  className="p-1 rounded text-[#5C4D3C] hover:text-[#1C1813] hover:bg-[#FFFDF8] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto max-h-[75vh] scrollbar-thin text-xs">
                {/* Khối Tam Tầng Cung */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  {/* Thiên Tướng */}
                  <div className="p-2.5 rounded-xl bg-[#FFFDF8] border border-[#C4963E]/45">
                    <div className="text-[10px] text-[#5C4D3C] mb-0.5">THIÊN TƯỚNG</div>
                    <div className={`font-serif font-bold text-sm ${palace.general.color}`}>
                      {palace.general.name}
                    </div>
                    <div className="text-[10px] text-[#5C4D3C]">{palace.general.chinese}</div>
                  </div>

                  {/* Thiên Bàn */}
                  <div className="p-2.5 rounded-xl bg-[#FFFDF8] border border-[#C4963E]/45">
                    <div className="text-[10px] text-[#5C4D3C] mb-0.5">THIÊN BÀN (THƯỢNG)</div>
                    <div className="font-serif font-bold text-base text-[#1C1813]">
                      {palace.skyName} ({palace.skyChinese})
                    </div>
                    <div className="text-[10px] text-[#5C4D3C]">Hành {palace.skyEl}</div>
                  </div>

                  {/* Địa Bàn */}
                  <div className="p-2.5 rounded-xl bg-[#FFFDF8] border border-[#C4963E]/45">
                    <div className="text-[10px] text-[#5C4D3C] mb-0.5">ĐỊA BÀN (HẠ)</div>
                    <div className="font-serif font-bold text-base text-[#1C1813]">
                      {palace.groundName} ({palace.groundChinese})
                    </div>
                    <div className="text-[10px] text-[#5C4D3C]">Hành {palace.groundEl}</div>
                  </div>
                </div>

                {/* Huy hiệu đặc tính */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#FFFDF8] border border-[#C4963E]/45 text-[#5C4D3C]">
                    Độn Can: <strong className="text-[#78350F] font-mono">[{palaceDonCan.isKhongVong ? "Không" : palaceDonCan.can}]</strong>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#FFFDF8] border border-[#C4963E]/45 text-[#5C4D3C]">
                    Tương tác: <strong className="text-[#78350F]">{palace.relation.text}</strong>
                  </span>
                  {palace.isNoble && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#FEF3C7] border border-amber-600/70 text-[#78350F] font-bold">
                      👑 Cung Quý Nhân
                    </span>
                  )}
                  {palace.isNguyetTuong && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#E0F2FE]/80 border border-sky-600/70 text-[#1E3A8A] font-bold">
                      ☀️ Nguyệt Tướng
                    </span>
                  )}
                  {palace.isChiemThoi && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#FEF3C7] border border-amber-600/70 text-[#78350F] font-bold">
                      ⏳ Chiêm Thời ({hourChi} • Cố định)
                    </span>
                  )}
                  {palace.isHoatThoi && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-950/80 border border-yellow-600/70 text-[#854D0E] font-bold">
                      🎲 Hoạt Thời ({currentHoatThoi.name} • Xí ngầu)
                    </span>
                  )}
                  {!palace.isHoatThoi && !palace.isChiemThoi && palace.isThoiThan && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#FEF3C7] border border-amber-600/70 text-[#78350F] font-bold">
                      🎲 Thời Thần
                    </span>
                  )}
                  {palace.isGroundKhongVong && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#F3E8FF] border border-purple-600/70 text-[#6B21A8] font-bold animate-pulse">
                      ⭕ Địa Bàn Không Vong
                    </span>
                  )}
                </div>

                {/* TƯỢNG THẦN LÂM CUNG (Tính Thiên Bàn) */}
                {palace.tuongCungVi ? (
                  <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#FFFDF8] to-[#FFFDF8] border border-amber-500/80 shadow-md space-y-2">
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-[#6E4E16]">
                        <Sparkles className="w-3.5 h-3.5 text-[#92400E]" />
                        <span>TƯỢNG {palace.general.name.toUpperCase()} CƯ {palace.skyName.toUpperCase()} (THIÊN BÀN):</span>
                        <span className="text-[#78350F] underline underline-offset-2">
                          {palace.tuongCungVi.tuongName} ({palace.tuongCungVi.tuongChinese})
                        </span>
                      </div>
                      {palace.tuongCungVi.nature && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-bold border bg-[#FFFDF8] text-[#78350F] border-amber-600/60">
                          {palace.tuongCungVi.nature}
                        </span>
                      )}
                    </div>
                    {palace.tuongCungVi.tamAnPhuOriginal && (
                      <div className="text-[11px] text-[#78350F] font-serif italic bg-[#FFFDF8] px-2.5 py-1 rounded border border-[#D97706]/45">
                        📜 Tâm Ấn Phú: <strong>{palace.tuongCungVi.tamAnPhuOriginal}</strong> — {palace.tuongCungVi.tamAnPhu}
                      </div>
                    )}
                    <div className="text-xs text-[#1C1813] leading-relaxed pt-1 border-t border-[#C4963E]/45">
                      {palace.tuongCungVi.meaning}
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-[#FFFDF8] border border-[#C4963E]/45 text-[#5C4D3C] italic">
                    Chưa có thông tin tượng thần cho vị trí này.
                  </div>
                )}

                {/* KHỐI NGUYỆT TƯỚNG TÂM ẤN PHÚ NẾU CUNG NÀY LÀ NGUYỆT TƯỚNG */}
                {palace.isNguyetTuong && lucNhamData.nguyetTuongTamAn?.tamAnPhu && (
                  <div className="p-3 rounded-xl bg-gradient-to-r from-[#EFF6FF] via-[#FFFDF8] to-[#FFFDF8] border border-sky-600/70 space-y-1.5 shadow-sm">
                    <div className="flex items-center justify-between text-xs font-serif font-bold text-[#1E3A8A]">
                      <span className="flex items-center gap-1.5">
                        <Sun className="w-3.5 h-3.5 text-[#1D4ED8]" />
                        <span>TÂM ẤN PHÚ NGUYỆT TƯỚNG (THÁI DƯƠNG):</span>
                      </span>
                      <span className="text-[#78350F]">
                        《{lucNhamData.nguyetTuongTamAn.tamAnPhu.tuongName}》
                        {lucNhamData.nguyetTuongTamAn.tamAnPhu.tuongChinese ? ` (${lucNhamData.nguyetTuongTamAn.tamAnPhu.tuongChinese})` : ""}
                      </span>
                    </div>
                    {lucNhamData.nguyetTuongTamAn.tamAnPhu.originalPoem && (
                      <div className="text-[11px] font-serif text-[#1E3A8A]/90 italic bg-[#FFFDF8] p-2 rounded border border-sky-800/40">
                        📜 {lucNhamData.nguyetTuongTamAn.tamAnPhu.originalPoem}
                      </div>
                    )}
                    <div className="text-xs text-[#1C1813] leading-relaxed">
                      {lucNhamData.nguyetTuongTamAn.tamAnPhu.meaning}
                    </div>
                  </div>
                )}

                {/* KHỐI HOẠT THỜI TÂM ẤN PHÚ NẾU CUNG NÀY LÀ THỜI THẦN / HOẠT THỜI */}
                {(palace.isHoatThoi || palace.isThoiThan || palace.isChiemThoi) && lucNhamData.hoatThoiTamAn?.tamAnPhu && (
                  <div className="p-3 rounded-xl bg-gradient-to-r from-yellow-950/80 via-[#FFFDF8] to-[#FFFDF8] border border-yellow-600/70 space-y-1.5 shadow-sm">
                    <div className="flex items-center justify-between text-xs font-serif font-bold text-[#78350F]">
                      <span className="flex items-center gap-1.5">
                        <Dices className="w-3.5 h-3.5 text-[#92400E]" />
                        <span>TÂM ẤN PHÚ HOẠT THỜI (THỜI THẦN):</span>
                      </span>
                      <span className="text-[#6E4E16]">
                        《{lucNhamData.hoatThoiTamAn.tamAnPhu.tuongName}》
                        {lucNhamData.hoatThoiTamAn.tamAnPhu.tuongChinese ? ` (${lucNhamData.hoatThoiTamAn.tamAnPhu.tuongChinese})` : ""}
                      </span>
                    </div>
                    {lucNhamData.hoatThoiTamAn.tamAnPhu.originalPoem && (
                      <div className="text-[11px] font-serif text-[#78350F] italic bg-[#FFFDF8] p-2 rounded border border-amber-800/40">
                        📜 {lucNhamData.hoatThoiTamAn.tamAnPhu.originalPoem}
                      </div>
                    )}
                    <div className="text-xs text-[#1C1813] leading-relaxed">
                      {lucNhamData.hoatThoiTamAn.tamAnPhu.meaning}
                    </div>
                  </div>
                )}

                {/* KHỐI NHẬT CHIÊM TÂM ẤN PHÚ NẾU CUNG NÀY LÀ CUNG NGÀY (NHẬT CHI / CAN KÝ) */}
                {(palace.isDayChi || palace.isCanKy) && (lucNhamData.tuKhoa[0]?.tamAnPhu || lucNhamData.tuKhoa[2]?.tamAnPhu) && (
                  <div className="p-3 rounded-xl bg-gradient-to-r from-[#ECFDF5] via-[#FFFDF8] to-[#FFFDF8] border border-emerald-600/70 space-y-1.5 shadow-sm">
                    <div className="flex items-center justify-between text-xs font-serif font-bold text-[#14532D]">
                      <span className="flex items-center gap-1.5">
                        <Crown className="w-3.5 h-3.5 text-[#92400E]" />
                        <span>TÂM ẤN PHÚ NHẬT CHIÊM ({palace.isDayChi ? "CHI NGÀY" : "CAN KÝ"}):</span>
                      </span>
                      <span className="text-[#6E4E16]">
                        {palace.isDayChi
                          ? `《${lucNhamData.tuKhoa[2]?.tamAnPhu?.tuongName || ""}》`
                          : `《${lucNhamData.tuKhoa[0]?.tamAnPhu?.tuongName || ""}》`}
                      </span>
                    </div>
                    {palace.isDayChi && lucNhamData.tuKhoa[2]?.tamAnPhu?.originalPoem && (
                      <div className="text-[11px] font-serif text-[#14532D]/90 italic bg-[#FFFDF8] p-2 rounded border border-emerald-800/40">
                        📜 {lucNhamData.tuKhoa[2].tamAnPhu.originalPoem}
                      </div>
                    )}
                    {!palace.isDayChi && lucNhamData.tuKhoa[0]?.tamAnPhu?.originalPoem && (
                      <div className="text-[11px] font-serif text-[#14532D]/90 italic bg-[#FFFDF8] p-2 rounded border border-emerald-800/40">
                        📜 {lucNhamData.tuKhoa[0].tamAnPhu.originalPoem}
                      </div>
                    )}
                    <div className="text-xs text-[#1C1813] leading-relaxed">
                      {palace.isDayChi
                        ? lucNhamData.tuKhoa[2]?.tamAnPhu?.meaning
                        : lucNhamData.tuKhoa[0]?.tamAnPhu?.meaning}
                    </div>
                  </div>
                )}

                {/* Tổng quan Thiên Tướng */}
                <div className="p-3 rounded-xl bg-[#FFFDF8] border border-[#C4963E]/45 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#5C4D3C]">Tổng Quan {palace.general.name}:</span>
                    {palace.general.numbers && (
                      <span className="font-mono text-[#78350F] font-bold">{palace.general.numbers}</span>
                    )}
                  </div>
                  <div className="text-xs text-[#1C1813]">
                    {palace.general.overview || palace.general.desc}
                  </div>
                  {palace.general.specialNotes && (
                    <div className="text-[10.5px] text-[#78350F] pt-1 border-t border-[#C4963E]/45">
                      💡 {palace.general.specialNotes}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-[#C4963E]/45 px-5 py-3 bg-[#FFFDF8] flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPalaceDetailIndex(null);
                    if (generalDetail) setGeneralModalActiveId(generalDetail.id);
                    setIs12GeneralModalOpen(true);
                  }}
                  className="text-xs text-[#78350F] hover:text-[#78350F] hover:underline flex items-center gap-1 cursor-pointer font-serif"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#92400E]" />
                  <span>Mở Cẩm Nang 12 Cung của {palace.general.name}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPalaceDetailIndex(null)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#FFFDF8] hover:bg-[#FAF6EE] border border-[#C4963E]/45 text-xs text-[#1C1813] font-semibold cursor-pointer transition-all"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL CHI TIẾT TÂM ẤN PHÚ CHO TỪNG KHÓA CỦA TỨ KHÓA */}
      {selectedTamAnPhuKhoa && selectedTamAnPhuKhoa.tamAnPhu && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          onClick={() => setSelectedTamAnPhuKhoa(null)}
        >
          <div
            className="relative w-full max-w-lg bg-gradient-to-b from-[#FFFDF8] via-[#FFFDF8] to-[#FFFDF8] border-2 border-[#B8862D] rounded-2xl shadow-[0_0_35px_rgba(212,175,55,0.3)] p-4 sm:p-6 text-[#1C1813] space-y-4 max-h-[92vh] overflow-y-auto scrollbar-thin"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Nút đóng */}
            <button
              type="button"
              onClick={() => setSelectedTamAnPhuKhoa(null)}
              className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-[#FAF6EE] hover:bg-[#FAF6EE] text-[#5C4D3C] hover:text-white flex items-center justify-center border border-[#C4963E]/45 transition-colors cursor-pointer z-10"
              title="Đóng cửa sổ"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="text-center pb-3 border-b border-[#C4963E]/45">
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-[#78350F] border border-amber-600/50 font-bold font-mono">
                  {selectedTamAnPhuKhoa.name} ({selectedTamAnPhuKhoa.sub})
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FFFDF8] text-[#5C4D3C] border border-[#C4963E]/45 font-medium">
                  Thượng {selectedTamAnPhuKhoa.thuongChi} ─ Hạ {selectedTamAnPhuKhoa.haChi}
                </span>
              </div>
              <h3 className="text-2xl font-serif font-black text-[#1C1813] mt-2 tracking-wide">
                Thiên Tướng {selectedTamAnPhuKhoa.general.name}{" "}
                <span className="text-base text-[#92400E] font-normal font-serif">
                  ({selectedTamAnPhuKhoa.general.chinese})
                </span>
              </h3>
              <p className="text-xs text-[#6E4E16] font-semibold mt-1">
                Tượng Thần Tâm Ấn Phú: 《{selectedTamAnPhuKhoa.tamAnPhu.tuongName}》
                {selectedTamAnPhuKhoa.tamAnPhu.tuongChinese ? ` (${selectedTamAnPhuKhoa.tamAnPhu.tuongChinese})` : ""}
              </p>
            </div>

            {/* Trích dẫn Khẩu Quyết Tâm Ấn Phú */}
            <div className="p-3.5 rounded-xl bg-[#FFFDF8] border border-[#C4963E]/45 space-y-2">
              <div className="text-xs font-bold text-[#78350F] flex items-center gap-1.5 uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5 text-[#92400E]" />
                <span>Khẩu Quyết 《Tâm Ấn Phú》:</span>
              </div>
              {selectedTamAnPhuKhoa.tamAnPhu.originalPoem && (
                <div className="text-sm font-serif font-bold text-[#1C1813] bg-[#FFFDF8] p-2.5 rounded-lg border border-amber-700/60 leading-relaxed shadow-inner">
                  {selectedTamAnPhuKhoa.tamAnPhu.originalPoem}
                </div>
              )}
              {selectedTamAnPhuKhoa.tamAnPhu.fullLine && (
                <div className="text-xs font-serif text-[#5C4D3C] bg-[#FFFDF8] p-2.5 rounded-lg border border-[#C4963E]/45 leading-relaxed">
                  {selectedTamAnPhuKhoa.tamAnPhu.fullLine}
                </div>
              )}
            </div>

            {/* Diễn Giải Ý Nghĩa Chiêm Đoán */}
            {selectedTamAnPhuKhoa.tamAnPhu.meaning && (
              <div className="p-3 rounded-xl bg-[#FFFDF8] border border-[#C4963E]/45 text-xs text-[#5C4D3C] leading-relaxed space-y-1">
                <div className="text-[10px] font-bold text-[#92400E] uppercase tracking-wider">
                  Ý nghĩa chiêm đoán:
                </div>
                <div className="text-[#1C1813] leading-relaxed">{selectedTamAnPhuKhoa.tamAnPhu.meaning}</div>
              </div>
            )}

            {/* Vai trò của Khóa */}
            <div className="p-2.5 rounded-xl bg-[#FFFDF8] border border-[#C4963E]/45 text-[11px] text-[#5C4D3C] flex items-center justify-between">
              <span>Vai trò trong quẻ: <strong className="text-[#1C1813]">{selectedTamAnPhuKhoa.role}</strong></span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${selectedTamAnPhuKhoa.relation.badgeColor}`}>
                {selectedTamAnPhuKhoa.relation.text}
              </span>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-[#C4963E]/45">
              <button
                type="button"
                onClick={() => {
                  const genDetail = LUC_NHAM_THIEN_TUONG_12_CUNG_DATA.find(
                    (g) => g.name === selectedTamAnPhuKhoa.general.name
                  );
                  if (genDetail) {
                    setGeneralModalActiveId(genDetail.id);
                    setGeneralModalTab("cungvi");
                    setIs12GeneralModalOpen(true);
                  }
                  setSelectedTamAnPhuKhoa(null);
                }}
                className="text-xs text-[#78350F] hover:text-[#78350F] hover:underline flex items-center gap-1 cursor-pointer font-serif"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#92400E]" />
                <span>Xem cẩm nang {selectedTamAnPhuKhoa.general.name}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTamAnPhuKhoa(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5C4D3C] hover:text-white bg-[#FFFDF8] hover:bg-[#FAF6EE] border border-[#C4963E]/45 transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
