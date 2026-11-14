/**
 * LandingPage – 100% Pixel-Perfect Replica of http://localhost:3000/ (Yilore)
 * - Dynamic spread modes: 1 lá, 1 ra 2 lá, 1 lên 3 lá, hoặc 3 lên 5 lá
 * - Random cards drawn from all 64 hexagrams & 384 yaos (hào)
 * - Preserved hero banner content from user screenshot ("I Ching Tarot", "Bốc bài Kinh Dịch, Tinh hoa Phương Đông", stats & buttons)
 * - Replaced Yilore logo with official Cửu Nhị BrandMark logo (header & hero)
 * - Full 3-phase scroll physics card stack layer (Hero -> Destiny -> Features)
 * - White Destiny Cards section + White Features section with mountain.svg decoration
 * - Interactive modals: Card Detail Inspector, Coin Toss Divination Studio, Life Config Thermal Receipt
 */
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Camera, Bookmark, FolderOpen, Clock, Heart, QrCode, Compass } from "lucide-react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { SaveSpreadDialog } from "./SaveSpreadDialog";
import { SavedSpreadsModal } from "./SavedSpreadsModal";
import { TempSpreadsModal } from "./TempSpreadsModal";
import {
  getSavedSpreads,
  saveSpreadItem,
  SavedSpreadItem,
  getTodayTempSpreads,
  addTempSpreadItem,
  updateTempSpreadItem,
  markTempSpreadAsSaved,
  deleteTempSpreadItem,
  clearTodayTempSpreads,
  TempSpreadItem,
} from "../services/savedSpreadsService";
import { toPng } from "html-to-image";
import { downloadDataUrlAsPng, getCaptureFontEmbedCSS } from "../utils/captureHelper";
import { ExportImageModal } from "./ExportImageModal";
import { BrandMark } from "./BrandMark";
import { NavTab } from "./Header";
import { HEXAGRAMS, getTransformedHexagram } from "../data/hexagrams";
import { BOOK_HEXAGRAMS } from "../data/bookHexagrams";
import { getKhongMinhForHexagram } from "../data/khongMinhBridgeData";
import { formatKhongMinhKinhDich } from "../utils/khongMinhKinhDichFormatter";
import {
  NINE_PALACES_POSITIONS,
  TEN_STARS_EXPANDED_POSITIONS,
  TWELVE_BRANCHES_DATA,
  getHouseForBranch,
} from "../data/spreads";
import { AppUser } from "../services/authService";
import {
  InkWashRenderer,
  decomposeCardToInkLayers,
  DecomposedCardInk,
  InkWashFilmPlan,
  stripHanziAndCleanVi,
} from "../utils/inkWashEngine";

export interface LandingPageProps {
  currentUser?: AppUser | null;
  onEnterApp: (tab?: NavTab, method?: string) => void;
  onOpenAuthModal?: (mode?: "login" | "register" | "upgrade") => void;
  onLogout?: () => void;
  onOpenDonateModal?: () => void;
}

const getHexagramsUrl = () => "/vi/hexagram";
const getBlogUrl = () => "/vi/blog/";

export interface HomeBlogMonograph {
  slug: string;
  url: string;
  title: string;
  shortTitle: string;
  category: string;
  cover: string;
  relatedHexagrams: Array<{ num: number; label: string }>;
  summary: string;
  promptQuestion: string;
}

export const HOME_BLOG_ITEMS: HomeBlogMonograph[] = [
  {
    slug: "dream-teeth-falling-iching",
    url: "/vi/blog/dream-teeth-falling-iching/",
    title: "Mơ thấy rụng răng là điềm báo gì? — Cuộc đối thoại với tiềm thức về sự mất mát, trật tự lung lay và lúc cần dừng lại tĩnh dưỡng",
    shortTitle: "Giải mã giấc mơ rụng răng & Quẻ Bác (#23)",
    category: "Tâm Lý Tiềm Thức & Dịch Lý",
    cover: "/assets/dream-teeth-falling-cover.webp",
    relatedHexagrams: [
      { num: 23, label: "#23 Sơn Địa Bác" },
      { num: 24, label: "#24 Địa Lôi Phục" },
      { num: 52, label: "#52 Thuần Cấn" },
    ],
    summary:
      "Răng tượng trưng cho cấu trúc nâng đỡ và sự tự tin. Dưới góc nhìn Quẻ Sơn Địa Bác (#23), giấc mơ rụng răng không phải điềm gở định mệnh mà là tín hiệu tiềm thức báo hiệu bạn đang gồng gánh quá tải, một cấu trúc cũ đang bong tróc ('Bác cực tất Phục'). Lời khuyên cốt tủy là 'Thuận nhi chỉ' — thuận thế dừng lại tĩnh dưỡng, củng cố nền tảng để đón chu kỳ tái sinh.",
    promptQuestion:
      "Xin Tiểu Long chia sẻ sâu hơn về chuyên khảo Blog 'Giải mã giấc mơ rụng răng & Quẻ Sơn Địa Bác (#23)' và liên hệ với quẻ đang trải trên trang chủ?",
  },
  {
    slug: "iching-workplace-anxiety",
    url: "/vi/blog/iching-workplace-anxiety/",
    title: "Kinh Dịch giúp gì khi lo âu nơi công sở? Ba bài học tiến thoái từ Quẻ Khốn, Quẻ Nhu và Quẻ Minh Di",
    shortTitle: "Hóa giải lo âu công sở: Khốn • Nhu • Minh Di",
    category: "Sự Nghiệp & Đạo Tiến Thoái",
    cover: "/assets/iching-workplace-anxiety-cover.webp",
    relatedHexagrams: [
      { num: 47, label: "#47 Trạch Thủy Khốn" },
      { num: 5, label: "#5 Thủy Thiên Nhu" },
      { num: 36, label: "#36 Địa Hỏa Minh Di" },
    ],
    summary:
      "Ba chiến lược vượt áp lực công sở từ Chu Dịch: (1) Quẻ Khốn (#47): Khi kiệt sức và 'Hữu ngôn bất tín', đừng biện minh suông mà hãy quay về dưỡng nội lực. (2) Quẻ Nhu (#5): Nghệ thuật chờ đợi chủ động — bảo toàn thể lực, mài sắc kỹ năng đợi thời. (3) Quẻ Minh Di (#36): 'Dụng hối nhi minh' — thu giấu sự sắc sảo bên ngoài, giữ sáng ngọn lửa trí tuệ bên trong.",
    promptQuestion:
      "Xin Tiểu Long phân tích 3 bài học tiến thoái nơi công sở từ Blog (Quẻ Khốn #47, Quẻ Nhu #5, Quẻ Minh Di #36) và soi chiếu vào công việc của tôi theo trận pháp hiện tại?",
  },
  {
    slug: "shuini-yijing",
    url: "/vi/blog/shuini-yijing/",
    title: "Điện thoại vỡ màn hình, tin nhắn người cũ 'đã xem không trả lời': Ngoài đổ lỗi cho Sao Thủy nghịch hành, Kinh Dịch nhìn nhận chuỗi ngày 'mọi việc bất thuận' như thế nào?",
    shortTitle: "Hóa giải vận xui, tắc nghẽn & Thủy nghịch",
    category: "Chuyển Hóa Nghịch Cảnh",
    cover: "/assets/shuini-yijing-cover.webp",
    relatedHexagrams: [
      { num: 39, label: "#39 Thủy Sơn Kiển" },
      { num: 12, label: "#12 Thiên Địa Bĩ" },
      { num: 40, label: "#40 Lôi Thủy Giải" },
    ],
    summary:
      "Chuỗi ngày 'mọi việc bất thuận' tương ứng với trạng thái Quẻ Thủy Sơn Kiển (#39 - trước mặt là vực sâu, sau lưng là núi cao) và Quẻ Thiên Địa Bĩ (#12 - giao tiếp đứt gãy). Thay vì đổ lỗi ngoại cảnh, Dịch lý dạy chữ 'Phản thân tu đức' — dừng lại chỉnh đốn tâm thế, tìm về nơi bằng phẳng và người tri kỷ ('Kiển lợi tây nam') để tháo gỡ sang Quẻ Lôi Thủy Giải (#40).",
    promptQuestion:
      "Xin Tiểu Long giảng giải góc nhìn Blog về chuỗi ngày bất thuận / Thủy nghịch (Quẻ Kiển #39 & Quẻ Bĩ #12) và cách hóa giải bế tắc dựa trên quẻ đang trải?",
  },
  {
    slug: "iching-beginners-guide",
    url: "/vi/blog/iching-beginners-guide/",
    title: "Nhập môn Kinh Dịch từ con số 0: Hiểu rõ nguyên lý xác suất, cách gieo và đọc quẻ 'Kim Tiền Quái' bằng 3 đồng xu",
    shortTitle: "Nhập môn Kim Tiền Quái (Gieo 3 đồng xu)",
    category: "Cẩm Nang Nhập Môn",
    cover: "/assets/iching-beginners-guide-cover.webp",
    relatedHexagrams: [
      { num: 1, label: "#1 Thuần Càn" },
      { num: 2, label: "#2 Thuần Khôn" },
      { num: 5, label: "#5 Thủy Thiên Nhu" },
    ],
    summary:
      "Giải thích khoa học về phương pháp gieo quẻ 3 đồng xu (Kim Tiền Quái) qua 6 lần tung từ Sơ hào đến Thượng hào: Thiếu Dương (3/8) & Thiếu Âm (3/8) là hào tĩnh; Lão Dương (1/8) & Lão Âm (1/8) là hào động ('Vật cực tất phản' — phát triển đến cực điểm ắt biến đổi sang Biến Quái).",
    promptQuestion:
      "Xin Tiểu Long hướng dẫn nguyên lý Kim Tiền Quái, Hào động 'Vật cực tất phản' trong Blog Nhập môn và giải thích cách đọc trận pháp đang trải trên trang chủ?",
  },
  {
    slug: "iching-history-guide",
    url: "/vi/blog/iching-history-guide/",
    title: "Ba ngàn năm Kinh Dịch: Từ biểu tượng âm dương, quẻ hào đến tâm lý học và thuật toán hiện đại",
    shortTitle: "3.000 năm Kinh Dịch & Tâm lý học Carl Jung",
    category: "Lịch Sử & Triết Học Đông Tây",
    cover: "/assets/iching-history-guide-cover.webp",
    relatedHexagrams: [
      { num: 11, label: "#11 Địa Thiên Thái" },
      { num: 63, label: "#63 Thủy Hỏa Ký Tế" },
      { num: 64, label: "#64 Hỏa Thủy Vị Tế" },
    ],
    summary:
      "Hành trình 3.000 năm của Chu Dịch ('Quần kinh chi thủ' qua Nhân canh Tam Thánh: Phục Hy, Chu Văn Vương, Khổng Tử) kết nối với hệ nhị phân (0 và 1) của Leibniz và nguyên lý Tính Đồng Thời (Synchronicity) của Carl Jung: quẻ bài không phải ngẫu nhiên vô nghĩa mà phản chiếu trường tâm thức tại đúng thời khắc khởi niệm.",
    promptQuestion:
      "Xin Tiểu Long đàm đạo về nguyên lý Tính Đồng Thời (Synchronicity) trong Blog Lịch sử 3000 năm Kinh Dịch và lý giải vì sao tôi lại hữu duyên gặp các lá bài đang trải hôm nay?",
  },
  {
    slug: "tarot-vs-iching",
    url: "/vi/blog/tarot-vs-iching/",
    title: "Tarot và Kinh Dịch khác nhau ở đâu? Hoàn cảnh nào nên chọn công cụ nào?",
    shortTitle: "So sánh Tarot Phương Tây & Kinh Dịch",
    category: "Phương Pháp Luận",
    cover: "/assets/tarot-vs-iching-cover.webp",
    relatedHexagrams: [
      { num: 61, label: "#61 Phong Trạch Trung Phu" },
      { num: 14, label: "#14 Hỏa Thiên Đại Hữu" },
    ],
    summary:
      "Tarot mạnh về hình ảnh nguyên mẫu (Archetypes) giúp phóng chiếu cảm xúc và góc khuất nội tâm; trong khi Kinh Dịch mạnh về cấu trúc Thời - Vị - Trung - Chính (64 Quẻ & 384 Hào), chỉ dẫn chiến lược tiến thoái cụ thể. Bộ bài I Ching Tarot dung hòa trọn vẹn cả trực giác hình ảnh lẫn minh triết Thời - Vị của Chu Dịch.",
    promptQuestion:
      "Xin Tiểu Long phân tích sự kết hợp giữa hình ảnh trực giác và đạo Thời - Vị của bộ bài I Ching Tarot trên các lá bài đang trải hiện tại?",
  },
];


const HEX_SLUGS: Record<number, string> = {
  1: "qiangua1", 2: "kungua2", 3: "zhungua3", 4: "menggua4", 5: "xugua5",
  6: "songgua6", 7: "shigua7", 8: "bigua8", 9: "xiaochu9", 10: "lvgua10",
  11: "taigua11", 12: "pigua12", 13: "tongrengua13", 14: "dayougua14", 15: "qiangua15",
  16: "yugua16", 17: "suigua17", 18: "gugua18", 19: "lingua19", 20: "guangua20",
  21: "shikegua21", 22: "bigua22", 23: "bogua23", 24: "fugua24", 25: "wuwanggua25",
  26: "dachugua26", 27: "yigua27", 28: "daguogua28", 29: "kangua29", 30: "ligua30",
  31: "xiangua31", 32: "henggua32", 33: "dungua33", 34: "dazhuanggua34", 35: "jingua35",
  36: "mingyigua36", 37: "jiarengua37", 38: "kuigua38", 39: "jiangua39", 40: "jiegua40",
  41: "sungua41", 42: "yigua42", 43: "guaigua43", 44: "gougua44", 45: "cuigua45",
  46: "shenggua46", 47: "kungua47", 48: "jinggua48", 49: "gegua49", 50: "dinggua50",
  51: "zhengua51", 52: "gengua52", 53: "jiangua53", 54: "guimeigua54", 55: "fenggua55",
  56: "lvgua56", 57: "xungua57", 58: "duigua58", 59: "huangua59", 60: "jiegua60",
  61: "zhongfugua61", 62: "xiaoguogua62", 63: "jijigua63", 64: "weijigua64"
};

const getHexDetailUrl = (hexNumber: number, yaoNumber?: number) => {
  const slug = HEX_SLUGS[hexNumber] || `qiangua${hexNumber}`;
  if (yaoNumber && yaoNumber >= 1 && yaoNumber <= 6) {
    return `/vi/hexagram/${slug}/yao-${yaoNumber}`;
  }
  return `/vi/hexagram/${slug}`;
};

export type SpreadMode =
  | "1_single"
  | "1_to_2"
  | "1_to_3"
  | "khong_minh"
  | "3_to_5"
  | "that_tinh"
  | "cuu_cung"
  | "thap_tinh"
  | "thap_nhat"
  | "thap_nhi"
  | "thap_la";

export interface DynamicCardItem {
  id: string;
  type: "hexagram" | "yao";
  hexNumber: number;
  yaoNumber?: number;
  symbol: string;
  hanzi: string;
  name: string;
  sub: string;
  desc: string;
  img: string;
  backImg: string;
  positionLabel?: string;
  shortBadgeLabel?: string;
  positionDesc?: string;
  isReversed?: boolean;
  deckNumber?: number;
  slotIndex?: number;
  branchNumber?: number;
  branchName?: string;
  isMenhCung?: boolean;
  khongMinhLine?: number;
  khongMinhOracleNum?: number;
  khongMinhFromMain64?: boolean;
}

export const SINGLE_POSITIONS = [
  { index: 0, label: "Tâm Điểm (Nhất Tiễn Định Tâm)", sub: "Cốt lõi vấn đề", desc: "Quẻ duy nhất nắm giữ thông điệp then chốt, tháo gỡ điểm nghẽn và chỉ dẫn hành động." },
];

export const AM_DUONG_POSITIONS = [
  { index: 0, label: "1. Thể: Bản Thể (Nội Tại)", sub: "Chủ thể & Nội tâm", desc: "Thực lực hiện tại, tâm thái bên trong và góc nhìn chủ quan của bạn." },
  { index: 1, label: "2. Dụng: Ứng Dụng (Ngoại Cảnh)", sub: "Khách quan & Tác động", desc: "Môi trường bên ngoài, đối tượng tương tác và cách thức ứng biến thực tế." },
];

export const TAM_TAI_POSITIONS = [
  { index: 0, label: "1. Thiên Thời (Thời Vận)", sub: "Cơ duyên & Thời thế", desc: "Xu thế vũ trụ, cơ hội khách quan và nhịp điệu của thời điểm hiện tại." },
  { index: 1, label: "2. Địa Lợi (Môi Trường)", sub: "Nền tảng & Không gian", desc: "Điều kiện vật chất, nguồn lực sẵn có, nơi chốn và môi trường hoạt động." },
  { index: 2, label: "3. Nhân Hòa (Con Người)", sub: "Tâm thế & Hành động", desc: "Mối quan hệ nhân sự, sự đoàn kết và quyết định chủ động từ chính bạn." },
];

export const KHONG_MINH_POSITIONS = [
  {
    index: 0,
    label: "",
    sub: "",
    desc: "",
  },
  {
    index: 1,
    label: "",
    sub: "",
    desc: "",
  },
  {
    index: 2,
    label: "★ 3. Quẻ Khổng Minh",
    sub: "Quẻ Chủ Khổng Minh Thần Toán (384 Xăm)",
    desc: "Lá cuối cùng định vị Quẻ Khổng Minh Thần Toán. Nếu bốc trúng 384 lá Hào Từ thì lấy chính hào đó; nếu bốc trúng 64 lá Quẻ Chính thì tự động random động 1 hào bất kỳ (1–6) để ứng chiếu 384 quẻ xăm Gia Cát Khổng Minh.",
  },
];

export const NGU_HANH_POSITIONS = [
  { index: 0, label: "1. Kim (Quyết Đoán)", sub: "Thu liễm & Kỷ luật", desc: "Sức mạnh cắt bỏ điều thừa thãi, ranh giới rõ ràng và sự kiên định." },
  { index: 1, label: "2. Mộc (Sinh Khí)", sub: "Phát triển & Khởi sắc", desc: "Năng lượng vươn lên, sức sáng tạo mới và tiềm năng mở rộng." },
  { index: 2, label: "3. Thủy (Trí Tuệ)", sub: "Uyển chuyển & Chiều sâu", desc: "Sự linh hoạt vượt qua chướng ngại, khả năng thấu cảm và trực giác." },
  { index: 3, label: "4. Hỏa (Nhiệt Huyết)", sub: "Tỏa sáng & Lan tỏa", desc: "Đam mê bùng cháy, danh tiếng lan xa và khả năng truyền cảm hứng." },
  { index: 4, label: "5. Thổ (Vững Vàng)", sub: "Bền chặt & Nuôi dưỡng", desc: "Nền móng ổn định, sự kiên nhẫn tích lũy và khả năng gánh vác trọng trách." },
];

export const THAT_TINH_POSITIONS = [
  { index: 0, label: "1. Quá Khứ", sub: "Căn nguyên & Nền tảng", desc: "Cội nguồn phát sinh vấn đề, nhân duyên khởi đầu và bài học kinh nghiệm tiền đề." },
  { index: 1, label: "2. Bản Thân Hiện Tại", sub: "Tâm thế & Thực lực", desc: "Vị thế nội tại, tâm lý, năng lực và cách ứng phó của chính bạn lúc này." },
  { index: 2, label: "3. Diễn Biến Tiếp Theo", sub: "Xu thế chuyển dịch", desc: "Chiều hướng vận động, bước ngoặt tiếp nối và các biến động chuẩn bị xảy ra." },
  { index: 3, label: "4. Lá Bài Gợi Ý", sub: "Minh triết & Sách lược", desc: "Lời chỉ dẫn then chốt từ Dịch lý, phương châm hành động tối ưu để hóa giải khó khăn." },
  { index: 4, label: "5. Kết Quả", sub: "Thành tựu & Triển vọng", desc: "Kết quả khả dĩ của sự việc theo đà phát triển hiện tại." },
  { index: 5, label: "6. Môi Trường Bên Ngoài", sub: "Ngoại duyên & Khách quan", desc: "Các yếu tố ngoại cảnh, sự hỗ trợ hay cản trở từ xã hội, thị trường, đối tác xung quanh." },
  { index: 6, label: "7. Thiếu Sót Của Bản Thân", sub: "Điểm mù & Khuyết điểm", desc: "Sơ hở nội tại, thói quen sai lầm, ảo tưởng hoặc điều bạn còn thiếu sót cần tu sửa." },
];

export const CUU_CUNG_SHORT_BADGES: string[] = [
  "★ Lá 1: Trung Cung (5)",
  "Lá 2: Tây Bắc (Càn 6)",
  "Lá 3: Chính Tây (Đoài 7)",
  "Lá 4: Đông Bắc (Cấn 8)",
  "Lá 5: Chính Nam (Ly 9)",
  "Lá 6: Chính Bắc (Khảm 1)",
  "Lá 7: Tây Nam (Khôn 2)",
  "Lá 8: Chính Đông (Chấn 3)",
  "Lá 9: Đông Nam (Tốn 4)",
];

export const THAP_TINH_POSITIONS = [
  { index: 0, label: "1. Tình Huống Hiện Tại", sub: "Tâm điểm vấn đề", desc: "Thực trạng cốt lõi đang diễn ra, bản chất năng lượng của sự việc tại thời điểm này." },
  { index: 1, label: "2. Xuôi: Hỗ Trợ / Ngược: Trở Ngại", sub: "Lực chắn ngang tâm điểm", desc: "Trợ lực tương sinh đẩy nhanh tiến trình hoặc chướng ngại vật trực tiếp chắn ngang tình huống hiện tại." },
  { index: 2, label: "3. Yếu Tố Bên Ngoài", sub: "Nền tảng khách quan", desc: "Cơ sở ngoại cảnh, các yếu tố môi trường hoặc hoàn cảnh bên ngoài tác động vào gốc rễ." },
  { index: 3, label: "4. Điều Bạn Không Biết", sub: "Góc khuất tiềm thức", desc: "Những sự việc ẩn giấu dưới mặt nước, động cơ tiềm thức hoặc sự việc bạn chưa nhận thấy." },
  { index: 4, label: "5. Tình Huống Trước Đây", sub: "Gốc rễ quá khứ", desc: "Bối cảnh và nguyên nhân vừa mới trải qua dẫn tới tình huống hiện nay." },
  { index: 5, label: "6. Tương Lai Tiếp Theo", sub: "Diễn biến ngắn hạn", desc: "Sự chuyển dịch sắp tới trong tương lai gần nhất." },
  { index: 6, label: "7. Vận Hạn Năm Nay", sub: "Chu kỳ vận khí", desc: "Xu hướng vận trình, cơ hội hay thách thức lớn trong chu kỳ năm / giai đoạn này." },
  { index: 7, label: "8. Cách Nhìn Của Người Ngoài", sub: "Nhãn quan xã hội", desc: "Đánh giá, nhận thức và thái độ của người khác (gia đình, đối tác, xã hội) đối với bạn." },
  { index: 8, label: "9. Kết Quả Cuối Cùng", sub: "Hồi kết đại định", desc: "Đích đến chung cuộc của toàn bộ tiến trình nếu mọi việc duy trì theo quỹ đạo hiện thời." },
  { index: 9, label: "10. Lá Bài Khuyên Bảo", sub: "Minh triết tối hậu", desc: "Lời chỉ dẫn thấu đáo nhất từ Kinh Dịch giúp bạn định hình vận mệnh và làm chủ tương lai." },
];

export function rollRandomMenhBranch(): number {
  return Math.floor(Math.random() * 12) + 1;
}

export function applyTwelveHousesToCards(
  rawCards: DynamicCardItem[],
  menhBranchNumber: number
): DynamicCardItem[] {
  const validMenh = menhBranchNumber >= 1 && menhBranchNumber <= 12 ? menhBranchNumber : 3;
  return rawCards.map((card, idx) => {
    const branch = TWELVE_BRANCHES_DATA[idx] || TWELVE_BRANCHES_DATA[0];
    const house = getHouseForBranch(branch.number, validMenh, false);
    const isMenh = branch.number === validMenh;
    return {
      ...card,
      slotIndex: idx,
      deckNumber: card.deckNumber || idx + 1,
      branchNumber: branch.number,
      branchName: branch.name,
      isMenhCung: isMenh,
      shortBadgeLabel: isMenh ? `★ Cung Mệnh · ${branch.name}` : `${house.alias} · ${branch.name}`,
      positionLabel: isMenh
        ? `★ Cung Mệnh · Địa Chi ${branch.name}`
        : `${house.name} · Địa Chi ${branch.name}`,
      positionDesc: `${branch.lunarMonth} • Phương ${branch.direction} (${branch.element}) — ${house.description}`,
    };
  });
}

export function applyKhongMinhToThreeCards(
  rawCards: DynamicCardItem[],
  forceRandomLineOnLast?: number
): DynamicCardItem[] {
  return rawCards.slice(0, 3).map((card, idx) => {
    const pos = KHONG_MINH_POSITIONS[idx] || KHONG_MINH_POSITIONS[0];
    if (idx < 2) {
      return {
        ...card,
        slotIndex: idx,
        deckNumber: card.deckNumber || idx + 1,
        shortBadgeLabel: "",
        positionLabel: "",
        positionDesc: "",
        sub: "",
        desc: "",
      };
    }

    // Lá thứ 3 (idx === 2): Lá cuối cùng là Quẻ Khổng Minh Thần Toán
    // Nếu bốc trúng 64 lá chính (type === "hexagram") -> tự động random động 1 hào bất kỳ (1..6)
    const isFromMain64 = card.type === "hexagram";
    const activeLine =
      forceRandomLineOnLast && forceRandomLineOnLast >= 1 && forceRandomLineOnLast <= 6
        ? forceRandomLineOnLast
        : isFromMain64
        ? card.khongMinhLine && card.khongMinhLine >= 1 && card.khongMinhLine <= 6
          ? card.khongMinhLine
          : Math.floor(Math.random() * 6) + 1
        : card.yaoNumber && card.yaoNumber >= 1 && card.yaoNumber <= 6
        ? card.yaoNumber
        : card.khongMinhLine && card.khongMinhLine >= 1 && card.khongMinhLine <= 6
        ? card.khongMinhLine
        : Math.floor(Math.random() * 6) + 1;

    const hex = HEXAGRAMS.find((h) => h.number === card.hexNumber) || HEXAGRAMS[0];
    const kmBridge = getKhongMinhForHexagram(hex.number);
    const kmLine = kmBridge?.lines?.[activeLine - 1];
    const oracleNum = kmLine?.oracleNum || (hex.number - 1) * 6 + activeLine;
    const lineMeaning = hex.lineMeanings?.find((m) => m.line === activeLine);
    const lineName = lineMeaning?.name || kmLine?.lineName || `Hào ${activeLine}`;
    const kmFull = formatKhongMinhKinhDich(hex, activeLine);
    const isHung = kmFull.oracleBlock.isHung;
    const actionTag = isHung
      ? "Xăm HUNG ➔ Hành động NGƯỢC LẠI lời khuyên Kinh Dịch"
      : "Xăm CÁT ➔ Làm THEO lời khuyên Kinh Dịch";

    return {
      ...card,
      slotIndex: idx,
      deckNumber: card.deckNumber || idx + 1,
      khongMinhLine: activeLine,
      khongMinhOracleNum: oracleNum,
      khongMinhFromMain64: isFromMain64,
      shortBadgeLabel: isFromMain64
        ? `★ Quẻ Khổng Minh #${oracleNum} (${isHung ? "Hung" : "Cát"}) · Động Hào ${activeLine} (Random)`
        : `★ Quẻ Khổng Minh #${oracleNum} (${isHung ? "Hung" : "Cát"}) · Hào ${activeLine}`,
      positionLabel: isFromMain64
        ? `★ Lá 3 (Quẻ Khổng Minh #${oracleNum} · ${kmFull.oracleBlock.oracleType}): Nhân Đạo · Động Hào ${activeLine} (${lineName}) [64 Lá Chính ➔ Random Hào Động]`
        : `★ Lá 3 (Quẻ Khổng Minh #${oracleNum} · ${kmFull.oracleBlock.oracleType}): Nhân Đạo · Hào ${activeLine} (${lineName}) [Bộ 384 Lá Hào]`,
      positionDesc: pos.desc,
      sub: isFromMain64
        ? `${hex.vietnameseName || hex.name} · 64 Lá Chính (Random động Hào ${activeLine} · ${lineName}) · [${actionTag}]`
        : `${hex.vietnameseName || hex.name} · Hào ${activeLine}/6 (${lineName}) · [${actionTag}]`,
      desc: `【Quẻ Khổng Minh Thần Toán #${oracleNum} (${kmFull.oracleBlock.oracleType}) · Động Hào ${activeLine} (${lineName})】Xăm từ: "${kmLine?.oracleText || ""}" — ${kmFull.oracleBlock.poemMeaning} | ⚡ Chỉ dẫn hành động (${actionTag}): ${kmFull.oracleBlock.appliedKinhDichAction}`,
    };
  });
}

interface CombinedDeckBlueprint {
  type: "hexagram" | "yao";
  hexIndex: number;
  lineIndex?: number;
}

let cachedCombined448DeckPool: CombinedDeckBlueprint[] | null = null;

function getCombined448DeckPool(): CombinedDeckBlueprint[] {
  if (cachedCombined448DeckPool && cachedCombined448DeckPool.length > 0) {
    return cachedCombined448DeckPool;
  }
  const pool: CombinedDeckBlueprint[] = [];
  HEXAGRAMS.forEach((hex, hexIndex) => {
    // 1 lá thuộc 64 Quẻ Chính
    pool.push({ type: "hexagram", hexIndex });
    // 6 lá thuộc 384 Hào Từ
    if (hex.lineMeanings && hex.lineMeanings.length > 0) {
      hex.lineMeanings.forEach((_, lineIndex) => {
        pool.push({ type: "yao", hexIndex, lineIndex });
      });
    }
  });
  cachedCombined448DeckPool = pool;
  return pool;
}

/* ─── Helper: Rút 1 lá độc lập từ 1 bộ bài riêng 448 lá (384 Hào Từ + 64 Quẻ Chính chia đều tỷ lệ 1/448 cho từng lá) tại vị trí slotIndex ─── */
function drawRandomCardFromSeparateDeck(slotIndex: number = 0): DynamicCardItem {
  const deckNumber = slotIndex + 1;
  const pool = getCombined448DeckPool();
  if (!HEXAGRAMS || HEXAGRAMS.length === 0 || pool.length === 0) {
    return {
      id: `deck${deckNumber}-1`,
      type: "hexagram",
      hexNumber: 1,
      symbol: "䷀",
      hanzi: "乾",
      name: "Thuần Càn",
      sub: "Càn Vi Thiên (Trời cương kiện)",
      desc: "Khởi đầu lớn lao, hanh thông suôn sẻ, thu được lợi ích chính đáng.",
      img: "/assets/oss/1/1a.webp",
      backImg: "/assets/oss/1/1b.webp",
      deckNumber,
      slotIndex,
    };
  }

  // Rút ngẫu nhiên đồng nhất trên tổng 448 lá (64 Quẻ + 384 Hào = 448 lá, mỗi lá đúng 1/448 xác suất)
  const picked = pool[Math.floor(Math.random() * pool.length)];
  const hex = HEXAGRAMS[picked.hexIndex] || HEXAGRAMS[0];

  if (
    picked.type === "yao" &&
    typeof picked.lineIndex === "number" &&
    hex.lineMeanings &&
    hex.lineMeanings[picked.lineIndex]
  ) {
    const line = hex.lineMeanings[picked.lineIndex];
    return {
      id: `deck${deckNumber}-${hex.number}-${line.line}`,
      type: "yao",
      hexNumber: hex.number,
      yaoNumber: line.line,
      symbol: hex.symbol,
      hanzi: line.name,
      name: `${hex.name} · ${line.name}`,
      sub: `${hex.vietnameseName || hex.name} · Hào ${line.line}/6`,
      desc: `${line.text} — ${line.meaning}`,
      img: `/assets/oss/${hex.number}/${hex.number}-${line.line}a.webp`,
      backImg: `/assets/oss/${hex.number}/${hex.number}-${line.line}b.webp`,
      deckNumber,
      slotIndex,
    };
  }

  return {
    id: `deck${deckNumber}-${hex.number}`,
    type: "hexagram",
    hexNumber: hex.number,
    symbol: hex.symbol,
    hanzi: hex.upperTrigram && hex.lowerTrigram ? `${hex.upperTrigram}${hex.lowerTrigram}` : hex.name,
    name: hex.name,
    sub: hex.vietnameseName || `${hex.upperTrigram} trên ${hex.lowerTrigram}`,
    desc: hex.overview || hex.judgment || hex.image,
    img: `/assets/oss/${hex.number}/${hex.number}a.webp`,
    backImg: `/assets/oss/${hex.number}/${hex.number}b.webp`,
    deckNumber,
    slotIndex,
  };
}

/* ─── Helper: Rút danh sách bài cho từng cấu hình (Mỗi vị trí là 1 bộ bài riêng độc lập) ─── */
function drawCardsForMode(mode: SpreadMode, customMenhBranch?: number): DynamicCardItem[] {
  if (mode === "thap_la") {
    // 1. Quẻ Chủ (Bản Quái): Đầu tiên là bốc lá Quẻ Chủ từ 64 quẻ
    const priHex = HEXAGRAMS[Math.floor(Math.random() * HEXAGRAMS.length)];

    // 2. Lựa chọn random động từ 0 đến 6 hào
    const numChanging = Math.floor(Math.random() * 7); // 0, 1, 2, 3, 4, 5, 6
    let changingLines: number[] = [];
    let transHex = priHex;

    if (numChanging === 0) {
      changingLines = [];
      transHex = priHex;
    } else if (numChanging === 1) {
      const randomLine = Math.floor(Math.random() * 6) + 1;
      changingLines = [randomLine];
      transHex = getTransformedHexagram(priHex, changingLines) || priHex;
    } else {
      const allLines = [1, 2, 3, 4, 5, 6];
      for (let i = allLines.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allLines[i], allLines[j]] = [allLines[j], allLines[i]];
      }
      changingLines = allLines.slice(0, numChanging).sort((a, b) => a - b);
      transHex = getTransformedHexagram(priHex, changingLines) || priHex;
    }

    if (priHex.number === transHex.number) {
      changingLines = [];
    }

    const isSameHex = priHex.number === transHex.number || changingLines.length === 0;

    const primaryCard: DynamicCardItem = {
      id: `thapla-primary-${priHex.number}`,
      type: "hexagram",
      hexNumber: priHex.number,
      symbol: priHex.symbol,
      hanzi: priHex.hanzi || priHex.name,
      name: `Quẻ Chủ: ${priHex.name}`,
      sub: `Bản Quái • Định vị bối cảnh (#${priHex.number})`,
      desc: `【Bản Quái: Định Vị Bối Cảnh】Thoán từ: "${priHex.judgment}" | Đại Tượng: "${priHex.image}" — ${priHex.overview || priHex.advice}`,
      img: `/assets/oss/${priHex.number}/${priHex.number}a.webp`,
      backImg: `/assets/oss/${priHex.number}/${priHex.number}b.webp`,
      positionLabel: "Quẻ Chủ (Bản Quái)",
      positionDesc: "Định vị hiện trạng và bức tranh nền tảng tổng quan",
      deckNumber: 1,
      slotIndex: 0,
    };

    const transformedCard: DynamicCardItem = {
      id: `thapla-transformed-${transHex.number}`,
      type: "hexagram",
      hexNumber: transHex.number,
      symbol: transHex.symbol,
      hanzi: transHex.hanzi || transHex.name,
      name: isSameHex ? `Quẻ Biến (Đồng Quẻ Chủ): ${transHex.name}` : `Quẻ Biến: ${transHex.name}`,
      sub: isSameHex ? `Biến Quái • Đồng Bản Quái (#${transHex.number})` : `Biến Quái • Định hướng tương lai (#${transHex.number})`,
      desc: `【Biến Quái: Định Hướng Tương Lai】Quái từ: "${transHex.judgment}" | Đại Tượng: "${transHex.image}" — ${transHex.overview || transHex.advice}`,
      img: `/assets/oss/${transHex.number}/${transHex.number}a.webp`,
      backImg: `/assets/oss/${transHex.number}/${transHex.number}b.webp`,
      positionLabel: isSameHex ? "Quẻ Biến (Đồng Quẻ Chủ)" : "Quẻ Biến (Biến Quái)",
      positionDesc: isSameHex ? "Quẻ Tĩnh: Quẻ biến giữ nguyên quẻ chủ, lấy tĩnh chế động" : "Định hướng xu thế phát triển và kết quả chuyển dịch",
      deckNumber: 2,
      slotIndex: 1,
    };

    const changingYaoCards: DynamicCardItem[] = [];
    if (!isSameHex) {
      changingLines.forEach((lineNum, cIdx) => {
        const isYangToYin = priHex.lines?.[lineNum - 1] === 1;
        const lineMeaning = priHex.lineMeanings?.find((m) => m.line === lineNum);
        const yaoName = lineMeaning?.name || `Hào ${lineNum}`;
        changingYaoCards.push({
          id: `thapla-yao-${priHex.number}-${lineNum}`,
          type: "yao",
          hexNumber: priHex.number,
          yaoNumber: lineNum,
          symbol: priHex.symbol,
          hanzi: yaoName,
          name: `Hào ${lineNum}: ${priHex.name} · ${yaoName}`,
          sub: `Hào Động • Lời khuyên then chốt (${isYangToYin ? "⚊ Dương ➔ ⚏ Âm" : "⚏ Âm ➔ ⚊ Dương"})`,
          desc: `【Hào Động: Lời Khuyên Then Chốt】Hào từ: "${lineMeaning?.text || ""}" — ${lineMeaning?.meaning || ""}${lineMeaning?.detailedExplanation ? ` | Biến số mấu chốt: ${lineMeaning.detailedExplanation}` : ""}`,
          img: `/assets/oss/${priHex.number}/${priHex.number}-${lineNum}a.webp`,
          backImg: `/assets/oss/${priHex.number}/${priHex.number}-${lineNum}b.webp`,
          positionLabel: `Hào Động: Hào ${lineNum}`,
          positionDesc: `Bước ngoặt biến dịch then chốt tại vị trí Hào ${lineNum}`,
          deckNumber: 3 + cIdx,
          slotIndex: 2 + cIdx,
        });
      });
    }

    return [primaryCard, transformedCard, ...changingYaoCards];
  }

  if (mode === "that_tinh") {
    return Array.from({ length: 7 }, (_, idx) => {
      const c = drawRandomCardFromSeparateDeck(idx);
      const pos = THAT_TINH_POSITIONS[idx];
      return {
        ...c,
        positionLabel: pos ? pos.label : `Lá ${idx + 1}`,
        positionDesc: pos ? pos.desc : "",
      };
    });
  }

  if (mode === "cuu_cung") {
    return Array.from({ length: 9 }, (_, idx) => {
      const c = drawRandomCardFromSeparateDeck(idx);
      const pos = NINE_PALACES_POSITIONS[idx];
      return {
        ...c,
        shortBadgeLabel: CUU_CUNG_SHORT_BADGES[idx] || (pos ? pos.name : `Lá ${idx + 1}`),
        positionLabel: pos ? `${pos.name} (${pos.subtitle})` : `Lá ${idx + 1}`,
        positionDesc: pos ? pos.description : "",
      };
    });
  }

  if (mode === "thap_tinh") {
    return Array.from({ length: 10 }, (_, idx) => {
      const c = drawRandomCardFromSeparateDeck(idx);
      const pos = THAP_TINH_POSITIONS[idx];
      return {
        ...c,
        positionLabel: pos ? pos.label : `Lá ${idx + 1}`,
        positionDesc: pos ? pos.desc : "",
      };
    });
  }

  if (mode === "thap_nhat") {
    return Array.from({ length: 11 }, (_, idx) => {
      const c = drawRandomCardFromSeparateDeck(idx);
      const pos = TEN_STARS_EXPANDED_POSITIONS[idx];
      return {
        ...c,
        positionLabel: pos ? pos.name : `Lá ${idx + 1}`,
        positionDesc: pos ? pos.description : "",
      };
    });
  }

  if (mode === "thap_nhi") {
    const menhBranch =
      customMenhBranch && customMenhBranch >= 1 && customMenhBranch <= 12
        ? customMenhBranch
        : rollRandomMenhBranch();
    const rawTwelve = Array.from({ length: 12 }, (_, idx) => drawRandomCardFromSeparateDeck(idx));
    return applyTwelveHousesToCards(rawTwelve, menhBranch);
  }

  if (mode === "khong_minh") {
    const rawThree = Array.from({ length: 3 }, (_, idx) => drawRandomCardFromSeparateDeck(idx));
    return applyKhongMinhToThreeCards(rawThree);
  }

  const count = mode === "1_single" ? 1 : mode === "1_to_2" ? 2 : mode === "1_to_3" ? 3 : 5;
  const positions =
    mode === "1_single"
      ? SINGLE_POSITIONS
      : mode === "1_to_2"
      ? AM_DUONG_POSITIONS
      : mode === "1_to_3"
      ? TAM_TAI_POSITIONS
      : NGU_HANH_POSITIONS;

  return Array.from({ length: count }, (_, idx) => {
    const c = drawRandomCardFromSeparateDeck(idx);
    const pos = positions[idx];
    return {
      ...c,
      positionLabel: pos ? pos.label : `Lá ${idx + 1}`,
      positionDesc: pos ? pos.desc : "",
    };
  });
}

export const SPREAD_MODES: SpreadMode[] = [
  "that_tinh",
  "cuu_cung",
  "thap_tinh",
  "thap_nhat",
  "thap_nhi",
  "thap_la",
  "3_to_5",
  "khong_minh",
  "1_to_3",
  "1_to_2",
  "1_single",
];

export const SPREAD_MODE_NAMES: Record<SpreadMode, string> = {
  "1_single": "Đơn Quẻ (1 Lá)",
  "1_to_2": "Trận Pháp Âm Dương (2 Lá)",
  "1_to_3": "Trận Pháp Tam Tài (3 Lá)",
  "khong_minh": "Quẻ Khổng Minh (3 Lá · Gia Cát Thần Toán)",
  "3_to_5": "Trận Pháp Ngũ Hành (5 Lá)",
  "that_tinh": "Trận Pháp Thất Tinh (7 Lá)",
  "cuu_cung": "Trận Pháp Cửu Cung (9 Lá · Phi Tinh Lạc Thư)",
  "thap_tinh": "Trận Pháp Thập Tinh Celtic Cross (10 Lá)",
  "thap_nhat": "Trận Pháp Thập Tinh Mở Rộng (11 Lá)",
  "thap_nhi": "Trận Pháp Thập Nhị Cung (12 Lá · 12 Địa Chi)",
  "thap_la": "Tháp La Kinh Dịch (Bản Quái & Biến Quái)",
};

/* ─── Helper: Sao chép nội dung văn bản vào clipboard an toàn ─── */
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.warn("navigator.clipboard.writeText failed:", err);
  }
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "-9999px";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error("Fallback execCommand failed:", err);
    return false;
  }
}

/* ─── Cache chứa dữ liệu bài viết chuyên sâu của các quẻ & hào đã tải ─── */
interface ExtractedArticleSection {
  title: string;
  text: string;
}

interface CardArticleData {
  url: string;
  sections: ExtractedArticleSection[];
}

const hexArticleCache = new Map<string, CardArticleData>();

function cleanHtmlToText(s: string): string {
  if (!s) return "";
  return s
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<br\s*[\/]?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s+\n/g, "\n\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function fetchCardArticleSections(card: DynamicCardItem): Promise<CardArticleData | null> {
  const slug = HEX_SLUGS[card.hexNumber] || `qiangua${card.hexNumber}`;
  const isYao = card.type === "yao" && card.yaoNumber && card.yaoNumber >= 1 && card.yaoNumber <= 6;
  const path = isYao ? `/vi/hexagram/${slug}/yao-${card.yaoNumber}/index.html` : `/vi/hexagram/${slug}/index.html`;

  if (hexArticleCache.has(path)) {
    return hexArticleCache.get(path)!;
  }

  try {
    let res = await fetch(path);
    if (!res.ok) {
      const altPath = isYao ? `/vi/hexagram/${slug}/yao-${card.yaoNumber}/` : `/vi/hexagram/${slug}/`;
      res = await fetch(altPath);
    }
    if (!res.ok) return null;
    const html = await res.text();

    const mCol = html.match(/class=\"[^\"]*yilore-main-col[^\"]*\"/i);
    if (!mCol || mCol.index === undefined) return null;
    const start = mCol.index;
    const end = html.indexOf('<footer', start);
    const mainHtml = html.substring(start, end !== -1 ? end : undefined);

    const rawSections = [...mainHtml.matchAll(/<section[\s\S]*?<\/section>/gi)];
    const extracted: ExtractedArticleSection[] = [];

    for (const s of rawSections) {
      const sHtml = s[0];
      const mHeading = sHtml.match(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/i);
      let title = mHeading ? mHeading[1].replace(/<[^>]+>/g, '').trim() : '';

      // Bỏ qua thanh điều hướng mục lục, gợi ý liên quan hay widget gieo quẻ
      if (!title || title.includes('Khám Phá Quẻ Liên Quan') || title.includes('Gieo Một Quẻ Dịch AI') || title.includes('Sản phẩm') || title.includes('Kho tri thức') || title.includes('Hỗ trợ')) {
        continue;
      }

      // Đối với 64 lá bài chính (Quẻ chính, không phải lá Hào động): bỏ phần nội dung 6 hào động
      if (!isYao && (sHtml.includes('id="yao-ci"') || title.includes('Giải Nghĩa Chi Tiết 6 Hào') || title.includes('Bộ Thẻ Bài Hào') || title.includes('Chi Tiết 6 Hào'))) {
        continue;
      }

      let text = cleanHtmlToText(sHtml);
      if (!isYao) {
        title = title.replace(/,\s*Hào Từ/gi, '');
        text = text
          .replace(/,\s*Hào Từ/gi, '')
          .replace(/,\s*trọn bộ ý nghĩa 6 hào\s*\([^)]*\)/gi, '');
      }
      if (text.length > 50) {
        extracted.push({ title, text });
      }
    }

    const canonicalUrl = `https://ichingtarot.com${isYao ? `/vi/hexagram/${slug}/yao-${card.yaoNumber}/` : `/vi/hexagram/${slug}/`}`;
    const result: CardArticleData = {
      url: canonicalUrl,
      sections: extracted,
    };

    hexArticleCache.set(path, result);
    return result;
  } catch (err) {
    console.warn("Could not fetch article sections for card:", path, err);
    return null;
  }
}

/* ─── Helper: Lấy toàn bộ thông tin chi tiết đầy đủ từ Hexagram cho lá bài (Quẻ hoặc Hào) ─── */
function formatCardFullInfoFromHexagram(
  c: DynamicCardItem,
  posHeader?: string,
  extraBadge?: string,
  articleData?: CardArticleData | null
): string[] {
  const lines: string[] = [];
  const hex = HEXAGRAMS.find((h) => h.number === c.hexNumber);

  if (posHeader) {
    lines.push(`▶ 【${posHeader}】${extraBadge ? ` ${extraBadge}` : ""}`);
  }

  if (!hex) {
    lines.push(`• Quẻ tượng: ${c.symbol} - ${c.name}`);
    lines.push(`• Ý nghĩa: ${c.sub}`);
    lines.push(`• Lời giải: ${c.desc}`);
    return lines;
  }

  // 1. Nếu là Lá Bài Hào (thuộc bộ 384 Hào Từ)
  if (c.type === "yao" && c.yaoNumber) {
    const lineNum = c.yaoNumber;
    const lineMeaning = hex.lineMeanings?.find((m) => m.line === lineNum);
    const isYang = hex.lines?.[lineNum - 1] === 1;
    const lineTypeStr = isYang ? "⚊ Hào Dương" : "⚏ Hào Âm";

    lines.push(`• Lá bài hào: ${c.name}`);
    lines.push(`• Vị trí: Hào thứ ${lineNum}/6 (${lineMeaning?.name || `Hào ${lineNum}`}) • Khí chất: ${lineTypeStr}`);
    if (lineMeaning?.text) {
      lines.push(`• Hào Từ (Lời Kinh): "${lineMeaning.text}"`);
    }
    if (lineMeaning?.meaning) {
      lines.push(`• Ý nghĩa cốt lõi: ${lineMeaning.meaning}`);
    }
    if (lineMeaning?.detailedExplanation) {
      lines.push(`• Luận giải chuyên sâu & Trọng tâm hành động: ${lineMeaning.detailedExplanation}`);
    }

    lines.push(`• Thuộc Quẻ gốc: #${hex.number} ${hex.name} (${hex.hanzi || hex.name}) [${hex.symbol}] - ${hex.vietnameseName || ""}`);
    lines.push(`• Cấu tạo quẻ gốc: Thượng quái [${hex.upperTrigram}] vi Thượng • Hạ quái [${hex.lowerTrigram}] vi Hạ | Ngũ hành: ${hex.element} | Khí số: ${hex.omen}`);
    lines.push(`• Cấu trúc 6 hào quẻ gốc (từ Hào 1 lên Hào 6): ${hex.lines.map((v, i) => `Hào ${i + 1}: ${v === 1 ? "⚊ Dương" : "⚏ Âm"}`).join(" | ")}`);
    lines.push(`• Thoán Từ (Quái Từ) quẻ gốc: "${hex.judgment}"`);
    lines.push(`• Đại Tượng Truyện quẻ gốc: "${hex.image}"`);
    if (hex.overview) lines.push(`• Tổng quan thời vận quẻ: ${hex.overview}`);
    if (hex.career) lines.push(`• Vận trình sự nghiệp: ${hex.career}`);
    if (hex.wealth) lines.push(`• Vận trình tài lộc: ${hex.wealth}`);
    if (hex.love) lines.push(`• Tình cảm nhân duyên: ${hex.love}`);
    if (hex.health) lines.push(`• Sức khỏe thể chất: ${hex.health}`);
    if (hex.advice) lines.push(`• Lời khuyên hành đạo: ${hex.advice}`);
  } else {
    // 2. Nếu là Lá Bài Quẻ (thuộc bộ 64 Quẻ chính — không kèm nội dung 6 hào động)
    lines.push(`• Lá bài quẻ: #${hex.number} - ${hex.name} (${hex.hanzi || hex.name}) [${hex.symbol}]`);
    if (hex.vietnameseName) lines.push(`• Tên thuần Việt: ${hex.vietnameseName}`);
    lines.push(`• Cấu tạo: Thượng quái [${hex.upperTrigram}] vi Thượng • Hạ quái [${hex.lowerTrigram}] vi Hạ | Ngũ hành: ${hex.element} | Khí số cát hung: ${hex.omen}`);
    lines.push(`• Cấu trúc 6 vạch âm dương (từ Hào 1 dưới lên Hào 6 trên): ${hex.lines.map((v, i) => `Hào ${i + 1}: ${v === 1 ? "⚊ Dương" : "⚏ Âm"}`).join(" | ")}`);
    lines.push(`• Thoán Từ (Quái Từ): "${hex.judgment}"`);
    lines.push(`• Đại Tượng Truyện: "${hex.image}"`);
    if (hex.overview) lines.push(`• Tổng quan thời vận: ${hex.overview}`);
    if (hex.career) lines.push(`• Vận trình sự nghiệp: ${hex.career}`);
    if (hex.wealth) lines.push(`• Vận trình tài lộc: ${hex.wealth}`);
    if (hex.love) lines.push(`• Tình cảm nhân duyên: ${hex.love}`);
    if (hex.health) lines.push(`• Sức khỏe thể chất: ${hex.health}`);
    if (hex.advice) lines.push(`• Lời khuyên hành vi cốt lõi: ${hex.advice}`);
  }

  // 3. Toàn bộ thông tin bài viết chuyên sâu từ Bách khoa (Tổng quan, Cửu Nhị Luận Giải, Chiêm đoán, FAQ)
  if (articleData && articleData.sections && articleData.sections.length > 0) {
    const isYaoCard = c.type === "yao" && Boolean(c.yaoNumber);
    const filteredSections = isYaoCard
      ? articleData.sections
      : articleData.sections.filter(
          (sec) =>
            !sec.title.includes("Giải Nghĩa Chi Tiết 6 Hào") &&
            !sec.title.includes("Bộ Thẻ Bài Hào") &&
            !sec.title.includes("Chi Tiết 6 Hào")
        );
    if (filteredSections.length > 0) {
      lines.push("");
      lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      lines.push(`【BÁCH KHOA KINH DỊCH TOÀN THƯ (NGUỒN CHI TIẾT: ${articleData.url})】`);
      filteredSections.forEach((sec) => {
        lines.push("");
        lines.push(`◆ ${sec.title.toUpperCase()}:`);
        lines.push(sec.text);
      });
    }
  }

  return lines;
}

/* ─── Helper: Phân tích tâm niệm & câu hỏi của người dùng theo Dịch lý ─── */
type QuestionDomain = "career" | "wealth" | "love" | "health" | "general";

interface QuestionAnalysisResult {
  domain: QuestionDomain;
  domainLabel: string;
  cleanedQuestion: string;
  isQuestionEmpty: boolean;
}

function analyzeQuestionIntent(questionText?: string): QuestionAnalysisResult {
  const cleaned = (questionText || "").trim();
  if (!cleaned) {
    return {
      domain: "general",
      domainLabel: "Chiêm nghiệm tổng quan",
      cleanedQuestion: "",
      isQuestionEmpty: true,
    };
  }

  const qLower = cleaned.toLowerCase();

  const careerKeywords = [
    "việc", "công việc", "sự nghiệp", "công danh", "xin việc", "chuyển việc", "đổi việc", "nhảy việc",
    "phỏng vấn", "thăng chức", "thăng tiến", "sếp", "đồng nghiệp", "hợp tác", "dự án", "kinh doanh",
    "mở quán", "khởi nghiệp", "làm ăn", "công ty", "hợp đồng", "học", "thi", "thi cử", "đỗ", "trúng tuyển",
    "du học", "bằng cấp", "nghề", "nghỉ việc", "deal lương", "vị trí", "bổ nhiệm", "thăng quan", "tiến chức",
    "buôn bán", "đối tác", "khách hàng", "dự án mới", "thương vụ", "nghề nghiệp"
  ];

  const wealthKeywords = [
    "tiền", "tài chính", "tài lộc", "đầu tư", "chứng khoán", "cổ phiếu", "crypto", "coin", "bất động sản",
    "đất", "nhà đất", "mua nhà", "bán nhà", "mua đất", "bán đất", "nợ", "đòi nợ", "vay", "mượn", "lỗ", "lãi",
    "lợi nhuận", "thu nhập", "giàu", "tiết kiệm", "vốn", "kinh phí", "tiền bạc", "lương", "tài sản", "mua xe",
    "bán xe", "tiền nong", "phát tài", "chi tiêu", "doanh thu", "tiền về"
  ];

  const loveKeywords = [
    "tình", "yêu", "tình cảm", "tình duyên", "người yêu", "bạn gái", "bạn trai", "crush", "người ấy",
    "hôn nhân", "kết hôn", "cưới", "ly hôn", "chia tay", "quay lại", "tỏ tình", "thích", "gia đình", "vợ",
    "chồng", "con cái", "bố mẹ", "mẹ chồng", "nàng dâu", "mối quan hệ", "người thứ 3", "người thứ ba",
    "hẹn hò", "độc thân", "bồ", "bén duyên", "duyên số", "lấy vợ", "lấy chồng", "tình ái"
  ];

  const healthKeywords = [
    "sức khỏe", "bệnh", "khám", "mổ", "phẫu thuật", "thuốc", "tai nạn", "bình an", "thân thể", "ốm",
    "mệt mỏi", "stress", "tâm lý", "chữa bệnh", "hồi phục", "sống thọ", "tinh thần", "mất ngủ", "đau",
    "viện", "khỏe mạnh", "tai ương", "bệnh tật", "nguy kịch", "sinh con", "mang thai"
  ];

  let careerScore = 0;
  for (const kw of careerKeywords) {
    if (qLower.includes(kw)) careerScore += kw.length > 5 ? 2 : 1;
  }

  let wealthScore = 0;
  for (const kw of wealthKeywords) {
    if (qLower.includes(kw)) wealthScore += kw.length > 5 ? 2 : 1;
  }

  let loveScore = 0;
  for (const kw of loveKeywords) {
    if (qLower.includes(kw)) loveScore += kw.length > 5 ? 2 : 1;
  }

  let healthScore = 0;
  for (const kw of healthKeywords) {
    if (qLower.includes(kw)) healthScore += kw.length > 5 ? 2 : 1;
  }

  const maxScore = Math.max(careerScore, wealthScore, loveScore, healthScore);

  if (maxScore > 0) {
    if (maxScore === careerScore) return { domain: "career", domainLabel: "Sự nghiệp & Công việc", cleanedQuestion: cleaned, isQuestionEmpty: false };
    if (maxScore === wealthScore) return { domain: "wealth", domainLabel: "Tài chính & Tiền bạc", cleanedQuestion: cleaned, isQuestionEmpty: false };
    if (maxScore === loveScore) return { domain: "love", domainLabel: "Tình duyên & Gia đạo", cleanedQuestion: cleaned, isQuestionEmpty: false };
    if (maxScore === healthScore) return { domain: "health", domainLabel: "Sức khỏe & Thân tâm", cleanedQuestion: cleaned, isQuestionEmpty: false };
  }

  return { domain: "general", domainLabel: "Chiêm nghiệm tổng quan", cleanedQuestion: cleaned, isQuestionEmpty: false };
}

function getHexDomainInsight(hex: typeof HEXAGRAMS[0] | undefined, domain: QuestionDomain): string {
  if (!hex) return "";
  if (domain === "career" && hex.career) return hex.career;
  if (domain === "wealth" && hex.wealth) return hex.wealth;
  if (domain === "love" && hex.love) return hex.love;
  if (domain === "health" && hex.health) return hex.health;
  return hex.overview || "";
}

function getOmenOutlookText(omen?: string): string {
  if (!omen) return "Cục diện đang trong tiến trình biến dịch, cần tùy thời ứng biến.";
  if (omen.includes("Đại Cát")) return "Khí vận đại cát, thế sự hanh thông đón nhận cát lợi và thành quả lớn.";
  if (omen.includes("Cát") || omen.includes("Thứ Cát")) return "Khí vận cát tường, thuận buồm xuôi gió nếu hành sự đúng đạo.";
  if (omen.includes("Bình Hòa")) return "Khí vận bình hòa, cần giữ tâm định tĩnh, tích lũy nội lực chờ thời cơ chín muồi.";
  if (omen.includes("Đại Hung")) return "Khí vận gặp trở ngại lớn, hiểm nguy rình rập, tuyệt đối chớ nóng vội mạo hiểm.";
  if (omen.includes("Hung") || omen.includes("Thứ Hung")) return "Khí vận có phần trắc trở, cần cẩn trọng từng bước để hóa giải hung hại.";
  return "Cục diện đang biến dịch, cần tĩnh tâm quan sát thời cuộc.";
}

const EMPTY_QUESTION_REMINDER = "\n💡 Lời dặn: Hãy nhập câu hỏi/việc cần xem vào ô 'Nội dung tâm niệm / Câu hỏi' ở trên rồi nhấn lại '✨ Gợi ý từ quẻ' để nhận dự đoán luận giải trực diện cho việc cụ thể của bạn.";

/* ─── Helper: Sinh lời dự đoán tự động từ các lá bài trong trải trận (Tham khảo tâm niệm & câu hỏi) ─── */
function generateHexagramPrediction(
  cardsList: DynamicCardItem[],
  currentMode: SpreadMode,
  isCard2ReversedState: boolean = false,
  questionText?: string,
  extraOpts?: {
    isCard2AReversed?: boolean;
    isCard2BReversed?: boolean;
    menhBranchNumber?: number;
  }
): string {
  if (!cardsList || cardsList.length === 0) return "";

  const analysis = analyzeQuestionIntent(questionText);
  const { domain, domainLabel, cleanedQuestion, isQuestionEmpty } = analysis;

  if (currentMode === "1_single") {
    const c = cardsList[0];
    if (!c) return "";
    const hex = HEXAGRAMS.find((h) => h.number === c.hexNumber);
    const omen = hex?.omen ? `[${hex.omen}] ` : "";

    if (isQuestionEmpty) {
      return `${c.symbol} ${c.name} ${omen}- ${c.sub}. Điềm báo: ${hex?.overview || c.desc}. Lời khuyên: ${hex?.advice || "Hành động thuận theo đạo Dịch để đón cát tránh hung."}${EMPTY_QUESTION_REMINDER}`;
    }

    const domainInsight = getHexDomainInsight(hex, domain);
    const omenOutlook = getOmenOutlookText(hex?.omen);

    return `🕊️ Tâm niệm / Câu hỏi: "${cleanedQuestion}"
• Tượng quẻ: ${c.symbol} ${c.name} ${omen}- ${c.sub}.
• Chiêm đoán theo ${domainLabel}: ${domainInsight || hex?.overview || c.desc}
• Dự đoán viễn cảnh: Đối với việc bạn đang tâm niệm: ${omenOutlook}
• Phương châm hành động: ${hex?.advice || "Hành động thuận theo đạo Dịch, giữ vững chính đạo để đón cát tránh hung."}`;
  }

  if (currentMode === "1_to_2") {
    const c0 = cardsList[0];
    const c1 = cardsList[1];
    const hex0 = HEXAGRAMS.find((h) => h.number === c0?.hexNumber);
    const hex1 = HEXAGRAMS.find((h) => h.number === c1?.hexNumber);
    const omen0 = hex0?.omen ? `[${hex0.omen}] ` : "";
    const omen1 = hex1?.omen ? `[${hex1.omen}] ` : "";

    if (isQuestionEmpty) {
      return `Bản Thể: ${c0?.name} (${c0?.sub}) ➔ Ứng Dụng: ${c1?.name} (${c1?.sub}). Dự đoán: Cần lấy nội lực vững vàng từ ${c0?.name} để linh hoạt ứng biến thích hợp với ngoại cảnh ${c1?.name}. Lời khuyên: ${hex1?.advice || "Tùy thời tiến thoái."}${EMPTY_QUESTION_REMINDER}`;
    }

    const insight0 = getHexDomainInsight(hex0, domain);
    const insight1 = getHexDomainInsight(hex1, domain);
    const omenOutlook = getOmenOutlookText(hex1?.omen);

    return `🕊️ Tâm niệm / Câu hỏi: "${cleanedQuestion}"
• Chuyển biến Dịch lý: Bản Thể: ${c0?.name} ${omen0}(${c0?.sub}) ➔ Ứng Dụng: ${c1?.name} ${omen1}(${c1?.sub}).
• Chiêm đoán theo ${domainLabel}:
  - Khởi điểm (${c0?.name}): ${insight0 || c0?.desc}
  - Chuyển biến (${c1?.name}): ${insight1 || c1?.desc}
• Dự đoán kết quả: Về việc bạn đang hỏi, cục diện chuyển dịch từ ${c0?.name} sang ${c1?.name}. ${omenOutlook} Cần lấy nội lực vững vàng từ ${c0?.name} để linh hoạt thích ứng với bối cảnh mới ${c1?.name}.
• Phương châm hành động: ${hex1?.advice || hex0?.advice || "Thuận theo lẽ biến dịch, tùy thời tiến thoái hợp lý."}`;
  }

  if (currentMode === "1_to_3") {
    const c0 = cardsList[0];
    const c1 = cardsList[1];
    const c2 = cardsList[2];
    const hex0 = HEXAGRAMS.find((h) => h.number === c0?.hexNumber);
    const hex1 = HEXAGRAMS.find((h) => h.number === c1?.hexNumber);
    const hex2 = HEXAGRAMS.find((h) => h.number === c2?.hexNumber);
    const omen2 = hex2?.omen ? `[${hex2.omen}] ` : "";

    if (isQuestionEmpty) {
      return `Thiên thời: ${c0?.name} | Hiện tại: ${c1?.name} ➔ Tương lai: ${c2?.name} (${c2?.sub}). Dự đoán: ${c2?.desc || "Cần chủ động nắm bắt cơ hội để kiến tạo thành tựu."}${EMPTY_QUESTION_REMINDER}`;
    }

    const insight1 = getHexDomainInsight(hex1, domain);
    const insight2 = getHexDomainInsight(hex2, domain);
    const omenOutlook = getOmenOutlookText(hex2?.omen);

    return `🕊️ Tâm niệm / Câu hỏi: "${cleanedQuestion}"
• Tiến trình thời gian: Quá khứ / Thiên thời: ${c0?.name} ➔ Hiện tại: ${c1?.name} ➔ Tương lai: ${c2?.name} ${omen2}(${c2?.sub}).
• Chiêm đoán theo ${domainLabel}:
  - Hiện trạng (${c1?.name}): ${insight1 || c1?.desc}
  - Tương lai (${c2?.name}): ${insight2 || c2?.desc}
• Dự đoán viễn cảnh: Chiêm nghiệm việc "${cleanedQuestion}", diễn biến sắp tới định hình theo thế ${c2?.name}. ${omenOutlook}
• Phương châm hành động: ${hex2?.advice || hex1?.advice || "Chủ động nắm bắt thời cơ để kiến tạo thành tựu như ý."}`;
  }

  if (currentMode === "khong_minh") {
    const c2 = cardsList[2] || cardsList[cardsList.length - 1];
    const hex2 = HEXAGRAMS.find((h) => h.number === c2?.hexNumber) || HEXAGRAMS[0];
    const activeLine = c2?.khongMinhLine || c2?.yaoNumber || 2;
    const isFromMain64 = c2?.khongMinhFromMain64 ?? (c2?.type === "hexagram");
    const kmBridge = getKhongMinhForHexagram(hex2.number);
    const kmLine = kmBridge?.lines?.[activeLine - 1];
    const oracleNum = c2?.khongMinhOracleNum || kmLine?.oracleNum || (hex2.number - 1) * 6 + activeLine;
    const lineMeaning = hex2.lineMeanings?.find((m) => m.line === activeLine);
    const lineName = lineMeaning?.name || kmLine?.lineName || `Hào ${activeLine}`;
    const sourceTag = isFromMain64
      ? `Bốc trúng 64 Lá Chính ➔ Random động Hào ${activeLine} (${lineName})`
      : `Bộ 384 Lá Hào ➔ Hào ${activeLine} (${lineName})`;
    const kmFull = formatKhongMinhKinhDich(hex2, activeLine, sourceTag);
    const isHung = kmFull.oracleBlock.isHung;
    const actionRuleSummary = isHung
      ? `Quẻ Khổng Minh #${oracleNum} là HUNG (${kmFull.oracleBlock.oracleType}) ➔ Hành động NGƯỢC LẠI với lời khuyên của Kinh Dịch: ${kmFull.oracleBlock.doList} (Tuyệt đối KHÔNG làm theo lời khuyên thuận: "${kmFull.oracleBlock.avoidList}")`
      : `Quẻ Khổng Minh #${oracleNum} là CÁT (${kmFull.oracleBlock.oracleType}) ➔ Làm THEO lời khuyên hành động của Kinh Dịch: ${kmFull.oracleBlock.doList} (Tránh: "${kmFull.oracleBlock.avoidList}")`;

    if (isQuestionEmpty) {
      return `★ Quẻ Khổng Minh #${oracleNum} (${kmFull.oracleBlock.oracleType} · Lá 3): ${hex2.name} · Động Hào ${activeLine} (${sourceTag}). Xăm từ: "${kmLine?.oracleText || ""}". ⚡ Chỉ dẫn: ${actionRuleSummary}.${EMPTY_QUESTION_REMINDER}`;
    }

    const insight2 = getHexDomainInsight(hex2, domain);
    const omenOutlook = getOmenOutlookText(hex2.omen);

    return `🕊️ Tâm niệm / Câu hỏi: "${cleanedQuestion}"
• ★ Quẻ Khổng Minh #${oracleNum} (${kmFull.oracleBlock.oracleType} · Lá 3): ${hex2.name} · Động Hào ${activeLine} (${lineName}) [${sourceTag}].
• Xăm Khổng Minh Thần Toán #${oracleNum}: "${kmLine?.oracleText || ""}" — ${kmFull.oracleBlock.poemMeaning}
• Chiêm đoán theo ${domainLabel}: ${insight2 || lineMeaning?.meaning || c2?.desc}
• Dự đoán viễn cảnh: ${omenOutlook}
• ⚡ Phương châm hành động (Khi Quẻ Khổng Minh Cát thì làm theo lời khuyên Kinh Dịch, khi Hung thì làm ngược lại lời khuyên Kinh Dịch): ${actionRuleSummary}`;
  }

  if (currentMode === "3_to_5") {
    const cPri = cardsList[2] || cardsList[0];
    const cRes = cardsList[4] || cardsList[cardsList.length - 1];
    const hexPri = HEXAGRAMS.find((h) => h.number === cPri?.hexNumber);
    const hexRes = HEXAGRAMS.find((h) => h.number === cRes?.hexNumber);
    const omenRes = hexRes?.omen ? `[${hexRes.omen}] ` : "";
    const allFiveLines = cardsList
      .map((c, idx) => {
        const pos = NGU_HANH_POSITIONS[idx]?.label || c.positionLabel || `Lá ${idx + 1}`;
        const h = HEXAGRAMS.find((x) => x.number === c?.hexNumber);
        const brief = getHexDomainInsight(h, domain) || c?.desc || c?.sub || "";
        return `  - Lá ${idx + 1} (${pos} · ${c?.name}): ${brief}`;
      })
      .join("\n");

    if (isQuestionEmpty) {
      return `Ngũ Hành 5 Lá: ${cardsList.map((c, i) => `Lá ${i + 1}: ${c?.name}`).join(" ➔ ")}. Dự đoán: Vượt qua thử thách chuyển dịch để đạt lối thoát hanh thông.\n${allFiveLines}${EMPTY_QUESTION_REMINDER}`;
    }

    const insightPri = getHexDomainInsight(hexPri, domain);
    const insightRes = getHexDomainInsight(hexRes, domain);
    const omenOutlook = getOmenOutlookText(hexRes?.omen);

    return `🕊️ Tâm niệm / Câu hỏi: "${cleanedQuestion}"
• Ngũ Hành chuyển hóa (Đủ 5 lá): ${cardsList.map((c, i) => `Lá ${i + 1}: ${c?.name}`).join(" ➔ ")} ${omenRes}.
• Luận giải chi tiết đủ 5 lá theo ${domainLabel}:
${allFiveLines}
• Trọng tâm chuyển hóa: Khởi từ ${cPri?.name} (${insightPri || cPri?.desc}), hội tụ tại ${cRes?.name} (${insightRes || cRes?.desc}).
• Dự đoán kết quả: Về sự việc này: ${omenOutlook}
• Phương châm hành động: ${hexRes?.advice || "Giữ vững sơ tâm, biến chuyển linh hoạt theo thời cuộc."}`;
  }

  if (currentMode === "that_tinh") {
    const cur = cardsList[1];
    const adv = cardsList[3];
    const res = cardsList[4];
    const hexAdv = HEXAGRAMS.find((h) => h.number === adv?.hexNumber);
    const hexRes = HEXAGRAMS.find((h) => h.number === res?.hexNumber);
    const omenRes = hexRes?.omen ? `[${hexRes.omen}] ` : "";
    const allSevenLines = cardsList
      .map((c, idx) => {
        const pos = THAT_TINH_POSITIONS[idx]?.label || c.positionLabel || `Lá ${idx + 1}`;
        const h = HEXAGRAMS.find((x) => x.number === c?.hexNumber);
        const brief = getHexDomainInsight(h, domain) || c?.desc || c?.sub || "";
        return `  - Lá ${idx + 1} (${pos} · ${c?.name}): ${brief}`;
      })
      .join("\n");

    if (isQuestionEmpty) {
      return `Thất Tinh 7 Lá: Hiện tại: ${cur?.name} | Lời khuyên: ${adv?.name} | Kết quả: ${res?.name}.\n${allSevenLines}${EMPTY_QUESTION_REMINDER}`;
    }

    const omenOutlook = getOmenOutlookText(hexRes?.omen);

    return `🕊️ Tâm niệm / Câu hỏi: "${cleanedQuestion}"
• Thất Tinh Bắc Đẩu (Đủ 7 lá): Hiện tại: ${cur?.name} ➔ Lá Sách Lược: ${adv?.name} ➔ Kết quả: ${res?.name} ${omenRes}(${res?.sub}).
• Luận giải chi tiết đủ 7 lá theo ${domainLabel}:
${allSevenLines}
• Dự đoán & Sách lược: Về tâm niệm "${cleanedQuestion}": Chìa khóa hóa giải và bứt phá nằm ở Lá Gợi Ý ${adv?.name}. Nếu hành động chuẩn xác theo minh triết "${hexAdv?.advice || adv?.sub}" thì kết quả ${res?.name} sẽ: ${omenOutlook}
• Phương châm hành động: Hành động theo minh triết ${adv?.name} để đón cát tránh hung, đạt được kết quả như ý.`;
  }

  if (currentMode === "cuu_cung") {
    const trungCung = cardsList[0];
    const canTayBac = cardsList[1];
    const lyChinhNam = cardsList[4];
    const khamChinhBac = cardsList[5];
    const tonDongNam = cardsList[8];
    const hexTrung = HEXAGRAMS.find((h) => h.number === trungCung?.hexNumber);
    const omenTrung = hexTrung?.omen ? `[${hexTrung.omen}] ` : "";
    const allNineLines = cardsList
      .map((c, idx) => {
        const pos = NINE_PALACES_POSITIONS[idx];
        const posTitle = pos ? `${pos.name} · ${pos.subtitle}` : c?.positionLabel || `Lá ${idx + 1}`;
        const h = HEXAGRAMS.find((x) => x.number === c?.hexNumber);
        const brief = getHexDomainInsight(h, domain) || c?.desc || c?.sub || "";
        return `  - ${posTitle} (${c?.name}): ${brief}`;
      })
      .join("\n");

    if (isQuestionEmpty) {
      return `Trận Cửu Cung 9 Lá (Phi Tinh Lạc Thư): ★ Trung Cung (Cung 5): ${trungCung?.name} | Quý Nhân Càn 6: ${canTayBac?.name} | Danh Trí Ly 9: ${lyChinhNam?.name} | Tiềm Năng Khảm 1: ${khamChinhBac?.name} | Hòa Hợp Tốn 4: ${tonDongNam?.name}.\n${allNineLines}${EMPTY_QUESTION_REMINDER}`;
    }

    const omenOutlook = getOmenOutlookText(hexTrung?.omen);
    return `🕊️ Tâm niệm / Câu hỏi: "${cleanedQuestion}"
• Cửu Cung Phi Tinh Lạc Thư (Đủ 9 lá · ★ Trung Cung làm Trục Tâm thống lĩnh 8 phương Bát Quái):
  ★ Trung Cung (Cung 5): ${trungCung?.name} ${omenTrung}| Quý Nhân (Càn 6): ${canTayBac?.name} | Danh Trí (Ly 9): ${lyChinhNam?.name} | Tiềm Năng (Khảm 1): ${khamChinhBac?.name} | Văn Xương Hòa Hợp (Tốn 4): ${tonDongNam?.name}.
• Luận giải chi tiết 9 Cung Lạc Thư theo ${domainLabel}:
${allNineLines}
• Dự đoán viễn cảnh: Soi chiếu từ ★ Trung Cung (${trungCung?.name}) lan tỏa 8 phương Hậu Thiên Bát Quái: ${omenOutlook}
• Phương châm hành động: ${hexTrung?.advice || "Giữ vững trục tâm Trung Cung, thuận theo vận khí Cửu Cung Phi Tinh để đón lành tránh dữ."}`;
  }

  if (currentMode === "thap_tinh") {
    const s0 = cardsList[0];
    const s1 = cardsList[1];
    const s8 = cardsList[8] || cardsList[cardsList.length - 2];
    const s9 = cardsList[9] || cardsList[cardsList.length - 1];
    const card2Effect = isCard2ReversedState ? "Trở ngại rào cản" : "Trợ lực tương sinh";
    const hexS8 = HEXAGRAMS.find((h) => h.number === s8?.hexNumber);
    const hexS9 = HEXAGRAMS.find((h) => h.number === s9?.hexNumber);
    const omenS8 = hexS8?.omen ? `[${hexS8.omen}] ` : "";
    const allTenLines = cardsList
      .map((c, idx) => {
        const basePos = THAP_TINH_POSITIONS[idx]?.label || c.positionLabel || `Lá ${idx + 1}`;
        const pos = idx === 1 ? `2. ${card2Effect}` : basePos;
        const h = HEXAGRAMS.find((x) => x.number === c?.hexNumber);
        const brief = getHexDomainInsight(h, domain) || c?.desc || c?.sub || "";
        return `  - Lá ${idx + 1} (${pos} · ${c?.name}): ${brief}`;
      })
      .join("\n");

    if (isQuestionEmpty) {
      return `Thập Tinh 10 Lá: Tâm điểm: ${s0?.name} | Lực tác động: ${s1?.name} (${card2Effect}) | Kết quả: ${s8?.name} | Chỉ dẫn: ${s9?.name}.\n${allTenLines}${EMPTY_QUESTION_REMINDER}`;
    }

    const omenOutlook = getOmenOutlookText(hexS8?.omen);

    return `🕊️ Tâm niệm / Câu hỏi: "${cleanedQuestion}"
• Cục diện Thập Tinh (Đủ 10 lá): Tâm điểm: ${s0?.name} | Lực tác động: ${s1?.name} (${card2Effect}) ➔ Kết quả: ${s8?.name} ${omenS8}(${s8?.sub}) | Chỉ dẫn: ${s9?.name}.
• Luận giải chi tiết đủ 10 lá theo ${domainLabel}:
${allTenLines}
• Dự đoán viễn cảnh: Đối với vấn đề "${cleanedQuestion}": ${omenOutlook}
• Chỉ dẫn then chốt: ${hexS9?.advice || s9?.desc || "Thấu suốt bản chất biến dịch, hành xử cẩn trọng vững vàng."}`;
  }

  if (currentMode === "thap_nhat") {
    const s0 = cardsList[0];
    const s2A = cardsList[1];
    const s2B = cardsList[2];
    const s9 = cardsList[9] || cardsList[cardsList.length - 2];
    const s10 = cardsList[10] || cardsList[cardsList.length - 1];
    const rev2A = Boolean(extraOpts?.isCard2AReversed);
    const rev2B = Boolean(extraOpts?.isCard2BReversed);
    const eff2A = rev2A ? "Trở ngại 2A" : "Hỗ trợ 2A";
    const eff2B = rev2B ? "Trở ngại 2B" : "Hỗ trợ 2B";
    const hexS9 = HEXAGRAMS.find((h) => h.number === s9?.hexNumber);
    const hexS10 = HEXAGRAMS.find((h) => h.number === s10?.hexNumber);
    const omenS9 = hexS9?.omen ? `[${hexS9.omen}] ` : "";
    const allElevenLines = cardsList
      .map((c, idx) => {
        const basePos = TEN_STARS_EXPANDED_POSITIONS[idx]?.name || c.positionLabel || `Lá ${idx + 1}`;
        const pos = idx === 1 ? `2A. ${eff2A}` : idx === 2 ? `2B. ${eff2B}` : basePos;
        const h = HEXAGRAMS.find((x) => x.number === c?.hexNumber);
        const brief = getHexDomainInsight(h, domain) || c?.desc || c?.sub || "";
        return `  - Lá ${idx + 1} (${pos} · ${c?.name}): ${brief}`;
      })
      .join("\n");

    if (isQuestionEmpty) {
      return `Thập Tinh Mở Rộng 11 Lá: Tâm điểm: ${s0?.name} | 2A: ${s2A?.name} (${eff2A}) & 2B: ${s2B?.name} (${eff2B}) | Kết quả: ${s9?.name} | Khuyên bảo: ${s10?.name}.\n${allElevenLines}${EMPTY_QUESTION_REMINDER}`;
    }

    const omenOutlook = getOmenOutlookText(hexS9?.omen);
    return `🕊️ Tâm niệm / Câu hỏi: "${cleanedQuestion}"
• Cục diện Thập Tinh Mở Rộng (Đủ 11 lá): Tâm điểm: ${s0?.name} | Tác nhân kép: 2A ${s2A?.name} (${eff2A}) & 2B ${s2B?.name} (${eff2B}) ➔ Kết quả: ${s9?.name} ${omenS9}(${s9?.sub}) | Khuyên bảo: ${s10?.name}.
• Luận giải chi tiết đủ 11 lá theo ${domainLabel}:
${allElevenLines}
• Dự đoán viễn cảnh: Đối với vấn đề "${cleanedQuestion}": ${omenOutlook}
• Chỉ dẫn then chốt: ${hexS10?.advice || s10?.desc || "Hài hòa hai nhánh lực 2A & 2B, giữ tâm trung chính."}`;
  }

  if (currentMode === "thap_nhi") {
    const detectedMenhCard = cardsList.find((c) => c.isMenhCung);
    const menhBranchNum =
      extraOpts?.menhBranchNumber ||
      detectedMenhCard?.branchNumber ||
      3;
    const menhBranchObj =
      TWELVE_BRANCHES_DATA.find((b) => b.number === menhBranchNum) || TWELVE_BRANCHES_DATA[2];
    const menhCard = cardsList[menhBranchObj.number - 1] || cardsList[0];
    const quanLocIdx = ((menhBranchObj.number - 1 + 4) % 12);
    const taiBachIdx = ((menhBranchObj.number - 1 + 8) % 12);
    const phuTheIdx = ((menhBranchObj.number - 1 + 10) % 12);
    const quanCard = cardsList[quanLocIdx];
    const taiCard = cardsList[taiBachIdx];
    const phuTheCard = cardsList[phuTheIdx];
    const hexMenh = HEXAGRAMS.find((h) => h.number === menhCard?.hexNumber);
    const omenMenh = hexMenh?.omen ? `[${hexMenh.omen}] ` : "";

    const allTwelveLines = cardsList
      .map((c, idx) => {
        const branch = TWELVE_BRANCHES_DATA[idx] || TWELVE_BRANCHES_DATA[0];
        const house = getHouseForBranch(branch.number, menhBranchObj.number, false);
        const h = HEXAGRAMS.find((x) => x.number === c?.hexNumber);
        const brief = getHexDomainInsight(h, domain) || c?.desc || c?.sub || "";
        const prefix = branch.number === menhBranchObj.number ? "★ " : "";
        return `  - Chi ${branch.name} (${prefix}${house.name} · ${c?.name}): ${brief}`;
      })
      .join("\n");

    if (isQuestionEmpty) {
      return `Thập Nhị Cung 12 Lá (★ Cung Mệnh an ngẫu nhiên tại Chi ${menhBranchObj.name}): Bản Mệnh: ${menhCard?.name} | Quan Lộc: ${quanCard?.name} | Tài Bạch: ${taiCard?.name} | Phu Thê: ${phuTheCard?.name}.\n${allTwelveLines}${EMPTY_QUESTION_REMINDER}`;
    }

    const omenOutlook = getOmenOutlookText(hexMenh?.omen);
    return `🕊️ Tâm niệm / Câu hỏi: "${cleanedQuestion}"
• Thập Nhị Cung Tử Vi × Chu Dịch (Đủ 12 lá · ★ Cung Mệnh tự động an tại Địa Chi ${menhBranchObj.name}):
  Bản Mệnh: ${menhCard?.name} ${omenMenh}| Quan Lộc: ${quanCard?.name} | Tài Bạch: ${taiCard?.name} | Phu Thê: ${phuTheCard?.name}.
• Luận giải chi tiết 12 Cung theo ${domainLabel}:
${allTwelveLines}
• Dự đoán viễn cảnh: Soi chiếu từ ★ Cung Mệnh tại Chi ${menhBranchObj.name} (${menhCard?.name}): ${omenOutlook}
• Phương châm hành động: ${hexMenh?.advice || "Thuận theo khí vận 12 cung Địa Chi, giữ tâm sáng suốt để chuyển hóa cát tường."}`;
  }

  if (currentMode === "thap_la") {
    const pri = cardsList[0];
    const trans = cardsList[1];
    const isSameHex = pri?.hexNumber !== undefined && trans?.hexNumber !== undefined && pri.hexNumber === trans.hexNumber;
    const yaos = isSameHex ? [] : cardsList.slice(2).filter((c) => !c.id.endsWith("-tinh"));
    const transHex = HEXAGRAMS.find((h) => h.number === trans?.hexNumber);
    const priHex = HEXAGRAMS.find((h) => h.number === pri?.hexNumber);
    const omenTrans = transHex?.omen ? `[${transHex.omen}] ` : "";
    const yaoText = yaos.length > 0 ? yaos.map((y) => y.name).join(", ") : "";

    if (isQuestionEmpty) {
      if (yaos.length === 0) {
        return `Bản Quái: ${pri?.name} ➔ Biến Quái: ${trans?.name} (Quẻ Tĩnh • Không có hào động). Dự đoán: Quẻ Chủ và Quẻ Biến cùng 1 quẻ, cục diện kiên định bất biến (${transHex?.overview || trans?.sub}).${EMPTY_QUESTION_REMINDER}`;
      }
      return `Bản Quái: ${pri?.name} ➔ Hào Động: ${yaoText} ➔ Biến Quái: ${trans?.name}. Dự đoán: Khởi đầu từ bối cảnh ${pri?.name}, sau khi chuyển biến tại các hào động, tương lai chuyển hóa viên mãn về ${trans?.name} (${transHex?.overview || trans?.sub}).${EMPTY_QUESTION_REMINDER}`;
    }

    const insightTrans = getHexDomainInsight(transHex, domain);
    const omenOutlook = getOmenOutlookText(transHex?.omen);

    if (yaos.length === 0) {
      return `🕊️ Tâm niệm / Câu hỏi: "${cleanedQuestion}"
• Mai Hoa Dịch Số: Bản Quái: ${pri?.name} ➔ Biến Quái: ${trans?.name} ${omenTrans}(Quẻ Tĩnh • Không có hào động).
• Chiêm đoán theo ${domainLabel}: Quẻ Chủ và Quẻ Biến cùng 1 quẻ (${pri?.name}), không phát sinh hào động (${insightTrans || trans?.sub}).
• Dự đoán viễn cảnh: Về việc bạn đang tâm niệm: ${omenOutlook}
• Phương châm hành động: ${transHex?.advice || priHex?.advice || "Giữ vững tâm tĩnh, dĩ bất biến ứng vạn biến để đón nhận thành quả viên mãn."}`;
    }

    return `🕊️ Tâm niệm / Câu hỏi: "${cleanedQuestion}"
• Mai Hoa Dịch Số: Bản Quái: ${pri?.name} ➔ Hào Động: ${yaoText} ➔ Biến Quái: ${trans?.name} ${omenTrans}.
• Chiêm đoán theo ${domainLabel}: Khởi phát từ bối cảnh ${pri?.name}. Điểm mấu chốt nằm ở sự chuyển động của các hào [${yaoText}], định hình chuyển hóa về ${trans?.name} (${insightTrans || trans?.sub}).
• Dự đoán viễn cảnh: Về việc bạn đang tâm niệm: ${omenOutlook}
• Phương châm hành động: ${transHex?.advice || priHex?.advice || "Thuận theo hào động, tùy thời ứng biến để đón nhận thành quả viên mãn."}`;
  }

  const cFirst = cardsList[0];
  const cLast = cardsList[cardsList.length - 1];
  const hexLast = HEXAGRAMS.find((h) => h.number === cLast?.hexNumber);
  const omenLast = hexLast?.omen ? `[${hexLast.omen}] ` : "";

  if (isQuestionEmpty) {
    return `Khởi đầu: ${cFirst?.name} (${cFirst?.sub}) ➔ Kết quả: ${cLast?.name} (${cLast?.sub}). Lời khuyên: Giữ vững chính đạo để thành tựu như ý.${EMPTY_QUESTION_REMINDER}`;
  }

  const insightLast = getHexDomainInsight(hexLast, domain);
  const omenOutlook = getOmenOutlookText(hexLast?.omen);

  return `🕊️ Tâm niệm / Câu hỏi: "${cleanedQuestion}"
• Diễn biến trải bài: Khởi đầu: ${cFirst?.name} (${cFirst?.sub}) ➔ Kết quả: ${cLast?.name} ${omenLast}(${cLast?.sub}).
• Chiêm đoán theo ${domainLabel}: Đích đến của tiến trình thể hiện tại ${cLast?.name} (${insightLast || cLast?.desc}).
• Dự đoán kết quả: Đối với việc "${cleanedQuestion}": ${omenOutlook}
• Phương châm hành động: ${hexLast?.advice || "Giữ vững chính đạo, kiên tâm hành sự để vạn sự hanh thông."}`;
}


/* ─── Helper: Định dạng thông tin các lá bài để dán cho AI phân tích ─── */
/* Nếu nhấn nhẹ / bốc quẻ thông thường -> trích thông tin cơ bản (Quẻ tượng, Tên, Ý nghĩa, Lời giải)
   Nếu đắc pháp Kính Thiên, Kính Địa, Kính Nhân -> trích toàn bộ 100% bách khoa toàn thư */
async function formatSpreadForAI(
  cardsList: DynamicCardItem[],
  currentMode: SpreadMode,
  isCard2ReversedState: boolean = false,
  includeFullBakhKhoa: boolean = false,
  userQuestion?: string,
  userPrediction?: string,
  userAnswer?: string,
  extraOpts?: {
    isCard2AReversed?: boolean;
    isCard2BReversed?: boolean;
    menhBranchNumber?: number;
  }
): Promise<string> {
  const cleanedQuestion = userQuestion?.trim();
  const cleanedPrediction = userPrediction?.trim();
  const cleanedAnswer = userAnswer?.trim();
  // Chỉ tải bài viết bách khoa chuyên sâu khi đã đắc pháp nghi thức (Kính Thiên, Kính Địa, Kính Nhân)
  const articles: (CardArticleData | null)[] = includeFullBakhKhoa
    ? await Promise.all(cardsList.map((c) => fetchCardArticleSections(c)))
    : cardsList.map(() => null);

  const bakhKhoaNotice = includeFullBakhKhoa ? " - ĐẮC PHÁP KÍNH THIÊN • ĐỊA • NHÂN (TOÀN THƯ BÁCH KHOA)" : "";

  if (currentMode === "that_tinh") {
    const lines: string[] = [];
    lines.push(`=== THÔNG TIN TRẢI BÀI TRẬN PHÁP THẤT TINH (7 LÁ CHU DỊCH${bakhKhoaNotice}) ===`);
    if (cleanedQuestion) {
      lines.push(`【NỘI DUNG TÂM NIỆM / CÂU HỎI CỦA ĐƯƠNG SỐ】:`);
      lines.push(`"${cleanedQuestion}"\n`);
    }
    if (cleanedPrediction) {
      lines.push(`【DỰ ĐOÁN CỦA QUẺ / ĐIỀM BÁO DỊCH LÝ】:`);
      lines.push(`"${cleanedPrediction}"\n`);
    }
    if (cleanedAnswer) {
      lines.push(`【ĐÁP ÁN / CHIÊM NGHIỆM TỰ ĐIỀN】:`);
      lines.push(`"${cleanedAnswer}"\n`);
    }
    lines.push(`Khẩu quyết: Thất Tinh Bắc Đẩu soi chiếu 7 phương diện cuộc đời: Quá khứ, Bản thân hiện tại, Diễn biến tiếp theo, Lá gợi ý, Kết quả, Môi trường khách quan và Điểm mù thiếu sót.\n`);
    cardsList.forEach((c, idx) => {
      const pos = THAT_TINH_POSITIONS[idx] || { label: `Lá ${idx + 1}`, sub: "", desc: "" };
      lines.push(`----------------------------------------`);
      if (!includeFullBakhKhoa) {
        lines.push(`▶ Vị trí ${pos.label} [${pos.sub}]: ${pos.desc}`);
        lines.push(`• Quẻ tượng: ${c.symbol}`);
        lines.push(`• Tên: ${c.name}`);
        lines.push(`• Ý nghĩa: ${c.sub}`);
        lines.push(`• Lời giải: ${c.desc}`);
      } else {
        const cardLines = formatCardFullInfoFromHexagram(c, `Vị trí ${pos.label} [${pos.sub}]: ${pos.desc}`, undefined, articles[idx]);
        lines.push(...cardLines);
      }
      lines.push("");
    });
    lines.push(`========================================`);
    lines.push(`[YÊU CẦU LUẬN GIẢI CHO AI]:`);
    if (cleanedQuestion) {
      lines.push(`▶ Trọng tâm giải đáp: Tập trung luận giải và tháo gỡ trực diện câu hỏi/tâm niệm: "${cleanedQuestion}"`);
    }
    const hasYaoInThatTinh = cardsList.some((c) => c.type === "yao" && Boolean(c.yaoNumber));
    lines.push(`Xin hãy phân tích trải bài Trận Pháp Thất Tinh theo quan hệ nhân quả tương sinh tương khắc giữa 7 vị trí (sử dụng đầy đủ dữ liệu Thoán Từ, Đại Tượng${hasYaoInThatTinh ? ", Hào Từ" : ""}, Ngũ Hành, Thời vận${includeFullBakhKhoa ? ", Cửu Nhị Luận Giải và Chiêm đoán 4 phương diện" : ""}):`);
    lines.push(`1. Nền tảng quá khứ (Lá 1) và thực trạng tâm thế bản thân hiện tại (Lá 2).`);
    lines.push(`2. Chiều hướng diễn biến sắp tới (Lá 3) và tác động từ môi trường bên ngoài (Lá 6).`);
    lines.push(`3. Nhận diện điểm mù / thiếu sót cốt lõi của bản thân (Lá 7) để khắc phục.`);
    lines.push(`4. Triển khai phương châm hành động mấu chốt theo Lá Bài Gợi Ý (Lá 4) nhằm đạt được thành tựu kết quả viên mãn (Lá 5).`);
    if (cleanedQuestion) {
      lines.push(`5. Đúc kết lời khuyên và câu trả lời cụ thể, sáng rõ cho câu hỏi tâm niệm trên.`);
    }
    return lines.join("\n");
  }

  if (currentMode === "cuu_cung") {
    const lines: string[] = [];
    lines.push(`=== THÔNG TIN TRẢI BÀI TRẬN PHÁP CỬU CUNG (9 LÁ · PHI TINH LẠC THƯ & BÁT QUÁI HẬU THIÊN${bakhKhoaNotice}) ===`);
    if (cleanedQuestion) {
      lines.push(`【NỘI DUNG TÂM NIỆM / CÂU HỎI CỦA ĐƯƠNG SỐ】:`);
      lines.push(`"${cleanedQuestion}"\n`);
    }
    if (cleanedPrediction) {
      lines.push(`【DỰ ĐOÁN CỦA QUẺ / ĐIỀM BÁO DỊCH LÝ】:`);
      lines.push(`"${cleanedPrediction}"\n`);
    }
    if (cleanedAnswer) {
      lines.push(`【ĐÁP ÁN / CHIÊM NGHIỆM TỰ ĐIỀN】:`);
      lines.push(`"${cleanedAnswer}"\n`);
    }
    lines.push(`Khẩu quyết: Lạc Thư Cửu Cung Phi Tinh — Lá 1 tọa ★ Trung Cung (Cung 5 · Ngũ Hoàng Thổ) làm trục tâm bản thể, 8 lá còn lại bay thuận chiều Phi Tinh Lạc Thư (5 ➔ 6 Càn Tây Bắc ➔ 7 Đoài Chính Tây ➔ 8 Cấn Đông Bắc ➔ 9 Ly Chính Nam ➔ 1 Khảm Chính Bắc ➔ 2 Khôn Tây Nam ➔ 3 Chấn Chính Đông ➔ 4 Tốn Đông Nam), mỗi cung rút từ 1 bộ bài 448 lá riêng biệt.\n`);
    cardsList.forEach((c, idx) => {
      const pos = NINE_PALACES_POSITIONS[idx] || {
        name: `Lá ${idx + 1}`,
        subtitle: "",
        description: "",
      };
      const extraBadge = idx === 0 ? "[★ TRUNG CUNG TRỌNG TÂM · BẢN THỂ]" : undefined;
      lines.push(`----------------------------------------`);
      if (!includeFullBakhKhoa) {
        lines.push(`▶ Vị trí ${pos.name} [${pos.subtitle}]: ${pos.description}${extraBadge ? ` ${extraBadge}` : ""}`);
        lines.push(`• Quẻ tượng: ${c.symbol}`);
        lines.push(`• Tên: ${c.name}`);
        lines.push(`• Ý nghĩa: ${c.sub}`);
        lines.push(`• Lời giải: ${c.desc}`);
      } else {
        const cardLines = formatCardFullInfoFromHexagram(
          c,
          `Vị trí ${pos.name} [${pos.subtitle}]: ${pos.description}`,
          extraBadge,
          articles[idx]
        );
        lines.push(...cardLines);
      }
      lines.push("");
    });
    lines.push(`========================================`);
    lines.push(`[YÊU CẦU LUẬN GIẢI CHO AI]:`);
    if (cleanedQuestion) {
      lines.push(`▶ Trọng tâm giải đáp: Tập trung luận giải và tháo gỡ trực diện câu hỏi/tâm niệm: "${cleanedQuestion}"`);
    }
    const hasYaoInCuuCung = cardsList.some((c) => c.type === "yao" && Boolean(c.yaoNumber));
    lines.push(`Xin hãy phân tích trải bài Trận Pháp Cửu Cung (9 Lá Phi Tinh Lạc Thư) theo ma trận không gian Hậu Thiên Bát Quái và tương sinh tương khắc Ngũ Hành giữa 9 cung (sử dụng đầy đủ dữ liệu Thoán Từ, Đại Tượng${hasYaoInCuuCung ? ", Hào Từ" : ""}, Ngũ Hành, Thời vận${includeFullBakhKhoa ? ", Cửu Nhị Luận Giải và Chiêm đoán 4 phương diện" : ""}):`);
    lines.push(`1. Phân tích ★ Trung Cung (Lá 1 - Cung 5 Ngũ Hoàng Thổ): Trục tâm bản thể, cốt lõi tình thế và nội lực chủ đạo của đương số.`);
    lines.push(`2. Soi chiếu trục Tứ Chính: Chính Nam Ly Hỏa (Lá 5 - Danh tiếng & Trí tuệ), Chính Bắc Khảm Thủy (Lá 6 - Chiều sâu & Tiềm năng), Chính Đông Chấn Mộc (Lá 8 - Sức bật & Đột phá), Chính Tây Đoài Kim (Lá 3 - Giao đạo & Khẩu tài).`);
    lines.push(`3. Soi chiếu trục Tứ Duy: Tây Bắc Càn Kim (Lá 2 - Quý nhân & Quyền uy), Đông Bắc Cấn Thổ (Lá 4 - Điểm dừng & Điền trạch), Tây Nam Khôn Thổ (Lá 7 - Hậu phương & Nhu thuận), Đông Nam Tốn Mộc (Lá 9 - Văn xương & Hòa hợp).`);
    lines.push(`4. Đúc kết phương vị cát lợi cần kích hoạt, phương vị cần hóa giải và chiến lược hành động sáng rõ nhất cho câu hỏi của đương số.`);
    return lines.join("\n");
  }

  if (currentMode === "thap_tinh") {
    const lines: string[] = [];
    lines.push(`=== THÔNG TIN TRẢI BÀI TRẬN PHÁP THẬP TINH (10 LÁ CELTIC CROSS CHU DỊCH${bakhKhoaNotice}) ===`);
    if (cleanedQuestion) {
      lines.push(`【NỘI DUNG TÂM NIỆM / CÂU HỎI CỦA ĐƯƠNG SỐ】:`);
      lines.push(`"${cleanedQuestion}"\n`);
    }
    if (cleanedPrediction) {
      lines.push(`【DỰ ĐOÁN CỦA QUẺ / ĐIỀM BÁO DỊCH LÝ】:`);
      lines.push(`"${cleanedPrediction}"\n`);
    }
    if (cleanedAnswer) {
      lines.push(`【ĐÁP ÁN / CHIÊM NGHIỆM TỰ ĐIỀN】:`);
      lines.push(`"${cleanedAnswer}"\n`);
    }
    lines.push(`Khẩu quyết: Tâm điểm thập tự kết hợp chuỗi thời vận 10 vị thế nhân duyên.`);
    lines.push(`* QUY CHUẨN ĐẶC BIỆT LÁ THỨ 2: Chiều Xuôi là HỖ TRỢ (Trợ lực tương sinh), Chiều Ngược là TRỞ NGẠI (Thử thách, rào cản chắn ngang).`);
    lines.push(`* Trạng thái Lá 2 hiện thời: [${isCard2ReversedState ? "CHIỀU NGƯỢC: TRỞ NGẠI / RÀO CẢN" : "CHIỀU XUÔI: HỖ TRỢ / TRỢ LỰC TƯƠNG SINH"}]\n`);
    cardsList.forEach((c, idx) => {
      const pos = THAP_TINH_POSITIONS[idx] || { label: `Lá ${idx + 1}`, sub: "", desc: "" };
      const extraState = idx === 1 ? (isCard2ReversedState ? " [ĐANG Ở THẾ NGƯỢC: TRỞ NGẠI / RÀO CẢN]" : " [ĐANG Ở THẾ XUÔI: HỖ TRỢ / TRỢ LỰC]") : "";
      lines.push(`----------------------------------------`);
      if (!includeFullBakhKhoa) {
        lines.push(`▶ Vị trí ${pos.label} [${pos.sub}]: ${pos.desc}${extraState}`);
        lines.push(`• Quẻ tượng: ${c.symbol}`);
        lines.push(`• Tên: ${c.name}`);
        lines.push(`• Ý nghĩa: ${c.sub}`);
        lines.push(`• Lời giải: ${c.desc}`);
      } else {
        const extraBadge = idx === 1 ? (isCard2ReversedState ? "[ĐANG Ở THẾ NGƯỢC: TRỞ NGẠI / RÀO CẢN]" : "[ĐANG Ở THẾ XUÔI: HỖ TRỢ / TRỢ LỰC]") : undefined;
        const cardLines = formatCardFullInfoFromHexagram(c, `Vị trí ${pos.label} [${pos.sub}]: ${pos.desc}`, extraBadge, articles[idx]);
        lines.push(...cardLines);
      }
      lines.push("");
    });
    lines.push(`========================================`);
    lines.push(`[YÊU CẦU LUẬN GIẢI CHO AI]:`);
    if (cleanedQuestion) {
      lines.push(`▶ Trọng tâm giải đáp: Tập trung luận giải và tháo gỡ trực diện câu hỏi/tâm niệm: "${cleanedQuestion}"`);
    }
    const hasYaoInThapTinh = cardsList.some((c) => c.type === "yao" && Boolean(c.yaoNumber));
    lines.push(`Xin hãy phân tích trải bài Trận Pháp Thập Tinh một cách sâu sắc và toàn diện (sử dụng đầy đủ dữ liệu Thoán Từ, Đại Tượng${hasYaoInThapTinh ? ", Hào Từ" : ""}, Ngũ Hành, Thời vận${includeFullBakhKhoa ? ", Cửu Nhị Luận Giải và Chiêm đoán 4 phương diện" : ""}):`);
    lines.push(`1. Phân tích cốt lõi tâm điểm: Tình huống hiện tại (Lá 1) và lực tác động trực diện của Lá 2 (${isCard2ReversedState ? "TRỞ NGẠI: thử thách, chướng ngại vật cần vượt qua" : "HỖ TRỢ: trợ lực thuận lợi, yếu tố tương sinh thúc đẩy"}).`);
    lines.push(`2. Mối liên hệ đa chiều: Yếu tố bên ngoài (Lá 3), Góc khuất chưa biết (Lá 4), Nguồn gốc trước đây (Lá 5), Tương lai tiếp theo (Lá 6).`);
    lines.push(`3. Đại cục vận trình: Vận hạn năm nay (Lá 7), Góc nhìn xã hội / người ngoài (Lá 8) và Kết quả cuối cùng (Lá 9).`);
    lines.push(`4. Đúc kết minh triết từ Lá Bài Khuyên Bảo (Lá 10) để đưa ra chiến lược hành động tối ưu nhất.`);
    if (cleanedQuestion) {
      lines.push(`5. Đưa ra câu trả lời dứt khoát và kết luận sáng suốt nhất cho câu hỏi/tâm niệm của đương số.`);
    }
    return lines.join("\n");
  }

  if (currentMode === "thap_nhat") {
    const rev2A = Boolean(extraOpts?.isCard2AReversed);
    const rev2B = Boolean(extraOpts?.isCard2BReversed);
    const lines: string[] = [];
    lines.push(`=== THÔNG TIN TRẢI BÀI TRẬN PHÁP THẬP TINH MỞ RỘNG (11 LÁ · TÁC NHÂN KÉP 2A & 2B${bakhKhoaNotice}) ===`);
    if (cleanedQuestion) {
      lines.push(`【NỘI DUNG TÂM NIỆM / CÂU HỎI CỦA ĐƯƠNG SỐ】:`);
      lines.push(`"${cleanedQuestion}"\n`);
    }
    if (cleanedPrediction) {
      lines.push(`【DỰ ĐOÁN CỦA QUẺ / ĐIỀM BÁO DỊCH LÝ】:`);
      lines.push(`"${cleanedPrediction}"\n`);
    }
    if (cleanedAnswer) {
      lines.push(`【ĐÁP ÁN / CHIÊM NGHIỆM TỰ ĐIỀN】:`);
      lines.push(`"${cleanedAnswer}"\n`);
    }
    lines.push(`Khẩu quyết: Tâm điểm thập tự mở rộng 11 lá, tách lực tác động ngang thành 2 nhánh 2A & 2B độc lập (mỗi vị trí rút từ 1 bộ bài riêng).`);
    lines.push(`* Trạng thái Lá 2A hiện thời: [${rev2A ? "CHIỀU NGƯỢC: TRỞ NGẠI / RÀO CẢN (NHÁNH A)" : "CHIỀU XUÔI: HỖ TRỢ / TRỢ LỰC (NHÁNH A)"}]`);
    lines.push(`* Trạng thái Lá 2B hiện thời: [${rev2B ? "CHIỀU NGƯỢC: TRỞ NGẠI / RÀO CẢN (NHÁNH B)" : "CHIỀU XUÔI: HỖ TRỢ / TRỢ LỰC (NHÁNH B)"}]\n`);
    cardsList.forEach((c, idx) => {
      const pos = TEN_STARS_EXPANDED_POSITIONS[idx] || {
        name: `Lá ${idx + 1}`,
        subtitle: "",
        description: "",
      };
      const extraBadge =
        idx === 1
          ? rev2A
            ? "[2A ĐANG Ở THẾ NGƯỢC: TRỞ NGẠI]"
            : "[2A ĐANG Ở THẾ XUÔI: HỖ TRỢ]"
          : idx === 2
          ? rev2B
            ? "[2B ĐANG Ở THẾ NGƯỢC: TRỞ NGẠI]"
            : "[2B ĐANG Ở THẾ XUÔI: HỖ TRỢ]"
          : undefined;
      lines.push(`----------------------------------------`);
      if (!includeFullBakhKhoa) {
        lines.push(`▶ Vị trí ${pos.name} [${pos.subtitle}]: ${pos.description}${extraBadge ? ` ${extraBadge}` : ""}`);
        lines.push(`• Quẻ tượng: ${c.symbol}`);
        lines.push(`• Tên: ${c.name}`);
        lines.push(`• Ý nghĩa: ${c.sub}`);
        lines.push(`• Lời giải: ${c.desc}`);
      } else {
        const cardLines = formatCardFullInfoFromHexagram(
          c,
          `Vị trí ${pos.name} [${pos.subtitle}]: ${pos.description}`,
          extraBadge,
          articles[idx]
        );
        lines.push(...cardLines);
      }
      lines.push("");
    });
    lines.push(`========================================`);
    lines.push(`[YÊU CẦU LUẬN GIẢI CHO AI]:`);
    if (cleanedQuestion) {
      lines.push(`▶ Trọng tâm giải đáp: Tập trung luận giải và tháo gỡ trực diện câu hỏi/tâm niệm: "${cleanedQuestion}"`);
    }
    const hasYaoInThapNhat = cardsList.some((c) => c.type === "yao" && Boolean(c.yaoNumber));
    lines.push(`Xin hãy phân tích trải bài Trận Pháp Thập Tinh Mở Rộng 11 Lá thật thấu đáo (sử dụng đầy đủ dữ liệu Thoán Từ, Đại Tượng${hasYaoInThapNhat ? ", Hào Từ" : ""}, Ngũ Hành, Thời vận${includeFullBakhKhoa ? ", Cửu Nhị Luận Giải và Chiêm đoán 4 phương diện" : ""}):`);
    lines.push(`1. Tâm điểm hiện tại (Lá 1) và thế song hành của hai nhánh 2A (${rev2A ? "Trở Ngại" : "Hỗ Trợ"}) & 2B (${rev2B ? "Trở Ngại" : "Hỗ Trợ"}).`);
    lines.push(`2. Mối liên hệ ngoại cảnh (Lá 3), góc khuất chưa biết (Lá 4), quá khứ (Lá 5) và tương lai gần (Lá 6).`);
    lines.push(`3. Đại cục vận hạn năm nay (Lá 7), góc nhìn người ngoài (Lá 8) và Kết quả cuối cùng (Lá 9).`);
    lines.push(`4. Đúc kết sách lược từ Lá Bài Khuyên Bảo (Lá 10) và trả lời trực diện câu hỏi của đương số.`);
    return lines.join("\n");
  }

  if (currentMode === "thap_nhi") {
    const detectedMenhCard = cardsList.find((c) => c.isMenhCung);
    const menhBranchNum =
      extraOpts?.menhBranchNumber ||
      detectedMenhCard?.branchNumber ||
      3;
    const menhBranchObj =
      TWELVE_BRANCHES_DATA.find((b) => b.number === menhBranchNum) || TWELVE_BRANCHES_DATA[2];
    const lines: string[] = [];
    lines.push(`=== THÔNG TIN TRẢI BÀI TRẬN PHÁP THẬP NHỊ CUNG (12 LÁ ĐỊA CHI & 12 CUNG TỬ VI${bakhKhoaNotice}) ===`);
    if (cleanedQuestion) {
      lines.push(`【NỘI DUNG TÂM NIỆM / CÂU HỎI CỦA ĐƯƠNG SỐ】:`);
      lines.push(`"${cleanedQuestion}"\n`);
    }
    if (cleanedPrediction) {
      lines.push(`【DỰ ĐOÁN CỦA QUẺ / ĐIỀM BÁO DỊCH LÝ】:`);
      lines.push(`"${cleanedPrediction}"\n`);
    }
    if (cleanedAnswer) {
      lines.push(`【ĐÁP ÁN / CHIÊM NGHIỆM TỰ ĐIỀN】:`);
      lines.push(`"${cleanedAnswer}"\n`);
    }
    lines.push(`Khẩu quyết: Vòng thiên bàn 12 Địa Chi (Tý ➔ Hợi) kết hợp 12 Cung Tử Vi, mỗi cung là 1 bộ bài độc lập.`);
    lines.push(`* ★ VỊ TRÍ CUNG MỆNH (ĐƯỢC GIEO TỰ ĐỘNG NGẪU NHIÊN): An tại 【Địa Chi ${menhBranchObj.name}】 (${menhBranchObj.lunarMonth} • Phương ${menhBranchObj.direction} • Hành ${menhBranchObj.element}).`);
    lines.push(`* Quy tắc an 12 Cung thuận chiều Địa Chi khởi từ Cung Mệnh tại Chi ${menhBranchObj.name}: Mệnh ➔ Phụ Mẫu ➔ Phúc Đức ➔ Điền Trạch ➔ Quan Lộc ➔ Nô Bộc ➔ Thiên Di ➔ Tật Ách ➔ Tài Bạch ➔ Tử Tức ➔ Phu Thê ➔ Huynh Đệ.\n`);

    cardsList.forEach((c, idx) => {
      const branch = TWELVE_BRANCHES_DATA[idx] || TWELVE_BRANCHES_DATA[0];
      const house = getHouseForBranch(branch.number, menhBranchObj.number, false);
      const isMenh = branch.number === menhBranchObj.number;
      const posTitle = `${isMenh ? "★ " : ""}${house.name} — Địa Chi ${branch.name} (${branch.lunarMonth} • ${branch.direction})`;
      const extraBadge = isMenh ? "[★ BẢN MỆNH TRUNG TÂM]" : undefined;
      lines.push(`----------------------------------------`);
      if (!includeFullBakhKhoa) {
        lines.push(`▶ Cung thứ ${idx + 1}/12 [${posTitle}]: ${house.description}`);
        lines.push(`• Quẻ tượng: ${c.symbol}`);
        lines.push(`• Tên: ${c.name}`);
        lines.push(`• Ý nghĩa: ${c.sub}`);
        lines.push(`• Lời giải: ${c.desc}`);
      } else {
        const cardLines = formatCardFullInfoFromHexagram(
          c,
          `Cung thứ ${idx + 1}/12 [${posTitle}]: ${house.description}`,
          extraBadge,
          articles[idx]
        );
        lines.push(...cardLines);
      }
      lines.push("");
    });

    lines.push(`========================================`);
    lines.push(`[YÊU CẦU LUẬN GIẢI CHO AI]:`);
    if (cleanedQuestion) {
      lines.push(`▶ Trọng tâm giải đáp: Tập trung luận giải và tháo gỡ trực diện câu hỏi/tâm niệm: "${cleanedQuestion}"`);
    }
    const hasYaoInThapNhi = cardsList.some((c) => c.type === "yao" && Boolean(c.yaoNumber));
    lines.push(`Xin hãy luận giải toàn diện Trận Pháp Thập Nhị Cung 12 Lá (sử dụng đầy đủ dữ liệu Thoán Từ, Đại Tượng${hasYaoInThapNhi ? ", Hào Từ" : ""}, Ngũ Hành 12 Địa Chi & 12 Cung Tử Vi${includeFullBakhKhoa ? ", Cửu Nhị Luận Giải và Chiêm đoán 4 phương diện" : ""}):`);
    lines.push(`1. Phân tích ★ Cung Mệnh an tại Địa Chi ${menhBranchObj.name} và tam hợp Mệnh – Tài Bạch – Quan Lộc cùng cung xung chiếu Thiên Di.`);
    lines.push(`2. Soi chiếu các cung trọng điểm liên quan trực tiếp tới câu hỏi (Phu Thê, Phúc Đức, Điền Trạch, Phụ Mẫu, Tử Tức, Nô Bộc, Tật Ách, Huynh Đệ).`);
    lines.push(`3. Nhận diện thời điểm ứng kỳ theo các tháng Âm lịch tương ứng trên vòng 12 Địa Chi.`);
    lines.push(`4. Đúc kết chiến lược hành động cát tường và lời đáp rõ ràng nhất cho đương số.`);
    return lines.join("\n");
  }

  if (currentMode === "thap_la") {
    const pri = cardsList[0];
    const trans = cardsList[1];
    const isSameHex = pri?.hexNumber !== undefined && trans?.hexNumber !== undefined && pri.hexNumber === trans.hexNumber;
    const yaos = isSameHex ? [] : cardsList.slice(2).filter((c) => !c.id.endsWith("-tinh"));
    const totalThapLaCards = yaos.length > 0 ? 2 + yaos.length : 2;

    const priHex = HEXAGRAMS.find((h) => h.number === pri?.hexNumber) || HEXAGRAMS[0];
    const transHex = HEXAGRAMS.find((h) => h.number === trans?.hexNumber) || HEXAGRAMS[1];

    const lines: string[] = [];
    lines.push(`=== BẢNG LUẬN GIẢI THÁP LA KINH DỊCH (${totalThapLaCards} LÁ · 周易塔羅${bakhKhoaNotice}) ===`);
    if (cleanedQuestion) {
      lines.push(`【NỘI DUNG TÂM NIỆM / CÂU HỎI CỦA ĐƯƠNG SỐ】:`);
      lines.push(`"${cleanedQuestion}"\n`);
    }
    if (cleanedPrediction) {
      lines.push(`【DỰ ĐOÁN CỦA QUẺ / ĐIỀM BÁO DỊCH LÝ】:`);
      lines.push(`"${cleanedPrediction}"\n`);
    }
    if (cleanedAnswer) {
      lines.push(`【ĐÁP ÁN / CHIÊM NGHIỆM TỰ ĐIỀN】:`);
      lines.push(`"${cleanedAnswer}"\n`);
    }
    if (yaos.length > 0) {
      lines.push(`Cấu trúc (${totalThapLaCards} lá bài): Quẻ Chủ & Quẻ Biến song song Trên - Dưới • ${yaos.length} lá Hào Động (Bộ 384 Lá) kế bên Quẻ Chủ`);
      lines.push(`Thứ tự đọc & đồng bộ từng lá bài (từ Lá 1 đến Lá ${totalThapLaCards}): Lá 1: Bản Quái (Quẻ Chủ) ➔ Lá 2..Lá ${1 + yaos.length}: Lần lượt ${yaos.length} lá Hào Động (từ Hào Sơ lên Hào Lục) ➔ Lá ${totalThapLaCards}: Biến Quái (Quẻ Biến)\n`);
    } else {
      lines.push(`Cấu trúc (2 lá bài): Quẻ Chủ & Quẻ Biến cùng 1 quẻ (Quẻ Tĩnh • Không có hào động)`);
      lines.push(`Thứ tự đọc & đồng bộ từng lá bài: Lá 1: Bản Quái (Quẻ Chủ) ➔ Lá 2: Biến Quái (Đồng Quẻ Chủ)\n`);
    }

    if (!includeFullBakhKhoa) {
      // ── THÔNG TIN CƠ BẢN (KHI NHẤN NHẸ / BỐC QUẺ BÌNH THƯỜNG) ──
      if (pri) {
        lines.push(`----------------------------------------`);
        lines.push(`【Lá 1 / ${totalThapLaCards} · BẢN QUÁI (QUẺ CHỦ) — LÁ TRÊN SONG SONG】`);
        lines.push(`▶ Vị trí Lá 1 [Quẻ Chủ (Bản Quái)]: Định vị hiện trạng và bức tranh nền tảng tổng quan`);
        lines.push(`• Quẻ tượng: ${pri.symbol}`);
        lines.push(`• Tên: ${pri.name}`);
        lines.push(`• Ý nghĩa: ${pri.sub}`);
        lines.push(`• Lời giải: ${pri.desc}`);
        lines.push("");
      }

      if (yaos.length > 0) {
        lines.push(`----------------------------------------`);
        lines.push(`【CÁC LÁ HÀO ĐỘNG (LÁ 2 ĐẾN LÁ ${1 + yaos.length}) — BỘ 384 LÁ BÀI HÀO TỪ KẾ BÊN QUẺ CHỦ】`);
        yaos.forEach((y, idx) => {
          const cardNum = idx + 2;
          lines.push(`▶ Vị trí Lá ${cardNum} [Hào Động thứ ${idx + 1}]: ${y.name}`);
          lines.push(`• Quẻ tượng: ${y.symbol}`);
          lines.push(`• Tên: ${y.name}`);
          lines.push(`• Ý nghĩa: ${y.sub}`);
          lines.push(`• Lời giải: ${y.desc}`);
        });
        lines.push("");
      }

      if (trans) {
        lines.push(`----------------------------------------`);
        lines.push(`【Lá ${totalThapLaCards} / ${totalThapLaCards} · BIẾN QUÁI (QUẺ BIẾN) — LÁ DƯỚI SONG SONG】`);
        lines.push(`▶ Vị trí Lá ${totalThapLaCards} [Quẻ Biến (Biến Quái)]: Định hướng xu thế phát triển và kết quả chuyển dịch`);
        lines.push(`• Quẻ tượng: ${trans.symbol}`);
        lines.push(`• Tên: ${trans.name}`);
        lines.push(`• Ý nghĩa: ${trans.sub}`);
        lines.push(`• Lời giải: ${trans.desc}`);
        lines.push("");
      }
    } else {
      // ── TOÀN BỘ BÁCH KHOA CHUYÊN SÂU (KHI ĐẮC PHÁP KÍNH THIÊN • ĐỊA • NHÂN) ──
      if (pri) {
        lines.push(`----------------------------------------`);
        lines.push(`【Lá 1 / ${totalThapLaCards} · BẢN QUÁI (QUẺ CHỦ) — LÁ TRÊN SONG SONG】`);
        lines.push(`▶ Vị trí Lá 1 [Quẻ Chủ (Bản Quái)]: Định vị hiện trạng và bức tranh nền tảng tổng quan`);
        lines.push(`• Văn Bản Trọng Tâm: Thoán Từ (Quái Từ), Đại Tượng Truyện`);
        lines.push(`• Ý Nghĩa Thực Tiễn Trong Đời Sống: Định vị bối cảnh: Nhận diện bản chất loại hoàn cảnh thực tại bạn đang đối mặt`);
        lines.push(`• Quẻ số: #${priHex.number} - ${priHex.name} (${priHex.hanzi || priHex.name}) [${priHex.symbol}]`);
        if (priHex.vietnameseName) lines.push(`• Tên thuần Việt: ${priHex.vietnameseName}`);
        lines.push(`• Cấu tạo: Thượng [${priHex.upperTrigram}] vi Thượng • Hạ [${priHex.lowerTrigram}] vi Hạ | Ngũ hành: ${priHex.element} | Khí số: ${priHex.omen}`);
        lines.push(`• Cấu trúc 6 hào (từ hào 1 lên hào 6): ${priHex.lines.map((v, i) => `Hào ${i + 1}: ${v === 1 ? "⚊ Dương" : "⚏ Âm"}`).join(" | ")}`);
        lines.push(`• Thoán Từ (Quái Từ): "${priHex.judgment}"`);
        lines.push(`• Đại Tượng Truyện: "${priHex.image}"`);
        if (priHex.overview) lines.push(`• Bối cảnh thực tại & Thời vận: ${priHex.overview}`);
        if (priHex.career) lines.push(`• Vận trình sự nghiệp: ${priHex.career}`);
        if (priHex.wealth) lines.push(`• Vận trình tài lộc: ${priHex.wealth}`);
        if (priHex.love) lines.push(`• Tình cảm nhân duyên: ${priHex.love}`);
        if (priHex.health) lines.push(`• Sức khỏe thể chất: ${priHex.health}`);
        if (priHex.advice) lines.push(`• Lời khuyên nền tảng: ${priHex.advice}`);

        if (articles[0] && articles[0].sections && articles[0].sections.length > 0) {
          lines.push("");
          lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
          lines.push(`【BẢN QUÁI: TOÀN BỘ BÁCH KHOA CHUYÊN SÂU (${articles[0].url})】`);
          articles[0].sections.forEach((sec) => {
            lines.push("");
            lines.push(`◆ ${sec.title.toUpperCase()}:`);
            lines.push(sec.text);
          });
        }
        lines.push("");
      }

      if (yaos.length > 0) {
        lines.push(`----------------------------------------`);
        lines.push(`【CÁC LÁ HÀO ĐỘNG (LÁ 2 ĐẾN LÁ ${1 + yaos.length}) — BỘ 384 LÁ BÀI HÀO TỪ KẾ BÊN QUẺ CHỦ】`);
        lines.push(`• Văn Bản Trọng Tâm: Hào Từ của chính hào biến động`);
        lines.push(`• Ý Nghĩa Thực Tiễn Trong Đời Sống: Lời khuyên then chốt: Trọng tâm hành động và biến số mấu chốt bạn cần lưu tâm`);
        lines.push(`• Số lượng hào biến động: ${yaos.length} hào (Sắp xếp theo thứ tự từ Hào Sơ ➔ Hào Lục, tương ứng từ Lá 2 đến Lá ${1 + yaos.length})`);
        lines.push("");

        yaos.forEach((y, idx) => {
          const cardNum = idx + 2;
          const lineNum = y.yaoNumber || (idx + 1);
          const lineMeaning = priHex.lineMeanings?.find((m) => m.line === lineNum);
          const isYangToYin = (priHex.lines?.[lineNum - 1] === 1);
          const yaoArticle = articles[idx + 2];

          lines.push(`▶ Vị trí Lá ${cardNum} [Hào Động thứ ${idx + 1}]: ${y.name}`);
          lines.push(`  - Biến chuyển: ${isYangToYin ? "⚊ Dương biến sang ⚏ Âm" : "⚏ Âm biến sang ⚊ Dương"}`);
          lines.push(`  - Hào Từ: "${lineMeaning?.text || y.desc}"`);
          lines.push(`  - Lời khuyên then chốt: ${lineMeaning?.meaning || y.sub}`);
          if (lineMeaning?.detailedExplanation) {
            lines.push(`  - Trọng tâm hành động & Biến số mấu chốt: ${lineMeaning.detailedExplanation}`);
          }

          if (yaoArticle && yaoArticle.sections && yaoArticle.sections.length > 0) {
            lines.push("");
            lines.push(`  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
            lines.push(`  【HÀO ĐỘNG: TOÀN BỘ BÁCH KHOA CHUYÊN SÂU (${yaoArticle.url})】`);
            yaoArticle.sections.forEach((sec) => {
              lines.push("");
              lines.push(`  ◆ ${sec.title.toUpperCase()}:`);
              lines.push(sec.text);
            });
          }
        });
        lines.push("");
      }

      if (trans) {
        lines.push(`----------------------------------------`);
        lines.push(`【Lá ${totalThapLaCards} / ${totalThapLaCards} · BIẾN QUÁI (QUẺ BIẾN) — LÁ DƯỚI SONG SONG】`);
        lines.push(`▶ Vị trí Lá ${totalThapLaCards} [Quẻ Biến (Biến Quái)]: Định hướng xu thế phát triển và kết quả chuyển dịch`);
        lines.push(`• Văn Bản Trọng Tâm: Quái Từ của Quẻ Biến (Thoán Từ, Đại Tượng Truyện)`);
        lines.push(`• Ý Nghĩa Thực Tiễn Trong Đời Sống: Định hướng tương lai: Xu thế phát triển tiếp theo sau khi sự chuyển hóa hoàn tất`);
        lines.push(`• Quẻ số: #${transHex.number} - ${transHex.name} (${transHex.hanzi || transHex.name}) [${transHex.symbol}]`);
        if (transHex.vietnameseName) lines.push(`• Tên thuần Việt: ${transHex.vietnameseName}`);
        lines.push(`• Cấu tạo: Thượng [${transHex.upperTrigram}] vi Thượng • Hạ [${transHex.lowerTrigram}] vi Hạ | Ngũ hành: ${transHex.element} | Khí số: ${transHex.omen}`);
        lines.push(`• Cấu trúc 6 hào (từ hào 1 lên hào 6): ${transHex.lines.map((v, i) => `Hào ${i + 1}: ${v === 1 ? "⚊ Dương" : "⚏ Âm"}`).join(" | ")}`);
        lines.push(`• Quái Từ (Thoán Từ Quẻ Biến): "${transHex.judgment}"`);
        lines.push(`• Đại Tượng Truyện: "${transHex.image}"`);
        if (transHex.overview) lines.push(`• Định hướng xu thế tương lai & Thời vận: ${transHex.overview}`);
        if (transHex.career) lines.push(`• Vận trình sự nghiệp: ${transHex.career}`);
        if (transHex.wealth) lines.push(`• Vận trình tài lộc: ${transHex.wealth}`);
        if (transHex.love) lines.push(`• Tình cảm nhân duyên: ${transHex.love}`);
        if (transHex.health) lines.push(`• Sức khỏe thể chất: ${transHex.health}`);
        if (transHex.advice) lines.push(`• Phương châm hành động sáng suốt: ${transHex.advice}`);

        if (articles[1] && articles[1].sections && articles[1].sections.length > 0) {
          lines.push("");
          lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
          lines.push(`【BIẾN QUÁI: TOÀN BỘ BÁCH KHOA CHUYÊN SÂU (${articles[1].url})】`);
          articles[1].sections.forEach((sec) => {
            lines.push("");
            lines.push(`◆ ${sec.title.toUpperCase()}:`);
            lines.push(sec.text);
          });
        }
        lines.push("");
      }
    }

    lines.push(`========================================`);
    lines.push(`[YÊU CẦU LUẬN GIẢI CHO AI (THEO PHƯƠNG PHÁP THÁP LA KINH DỊCH · ĐỦ ${totalThapLaCards} LÁ BÀI)]:`);
    if (cleanedQuestion) {
      lines.push(`▶ Trọng tâm giải đáp: Tập trung luận giải và tháo gỡ dứt khoát câu hỏi/tâm niệm: "${cleanedQuestion}"`);
    }
    if (yaos.length > 0) {
      lines.push(`Xin hãy phân tích trải bài Tháp La Kinh Dịch (${totalThapLaCards} lá bài) theo đúng thứ tự từng lá bài từ Lá 1 đến Lá ${totalThapLaCards}:`);
      lines.push(`1. Lá 1 - BẢN QUÁI (Quẻ Chủ · Định vị bối cảnh): Dựa vào Thoán Từ (Quái Từ), Đại Tượng Truyện và Luận giải chuyên sâu, nhận diện bản chất loại hoàn cảnh thực tại đương số đang đối mặt.`);
      lines.push(`2. Lá 2 đến Lá ${1 + yaos.length} - TỪNG LÁ HÀO ĐỘNG (Lời khuyên then chốt): Phân tích TÁCH BIỆT TỪNG LÁ HÀO ĐỘNG theo đúng thứ tự từ Hào Sơ lên Hào Lục (Lá 2, ${yaos.length > 1 ? `Lá 3, ..., Lá ${1 + yaos.length}` : "Hào Động 1"}). Tuyệt đối không gộp chung các hào động!`);
      lines.push(`3. Lá ${totalThapLaCards} - BIẾN QUÁI (Quẻ Biến · Định hướng tương lai): Dựa vào Quái Từ của Quẻ Biến, dự báo xu thế phát triển tiếp theo sau khi sự chuyển hóa hoàn tất.`);
      if (cleanedQuestion) {
        lines.push(`4. Đúc kết lời đáp trực tiếp cho việc đương số đang tâm niệm hỏi.`);
      }
    } else {
      lines.push(`Xin hãy phân tích trải bài Tháp La Kinh Dịch (2 lá bài · Quẻ Tĩnh - Quẻ Chủ và Quẻ Biến cùng 1 quẻ, không có hào động):`);
      lines.push(`1. Lá 1 (Bản Quái) & Lá 2 (Biến Quái đồng nhất): Dựa vào Thoán Từ (Quái Từ) và Đại Tượng Truyện, phân tích sâu sắc bản chất cục diện hiện tại và phương châm dĩ bất biến ứng vạn biến.`);
      if (cleanedQuestion) {
        lines.push(`2. Đúc kết lời đáp trực tiếp cho việc đương số đang tâm niệm hỏi.`);
      }
    }

    return lines.join("\n");
  }

  if (currentMode === "khong_minh") {
    const c2 = cardsList[2] || cardsList[cardsList.length - 1];
    const hex2 = HEXAGRAMS.find((h) => h.number === c2?.hexNumber) || HEXAGRAMS[0];
    const activeLine = c2?.khongMinhLine || c2?.yaoNumber || 2;
    const isFromMain64 = c2?.khongMinhFromMain64 ?? (c2?.type === "hexagram");
    const sourceMethod = isFromMain64
      ? `Bốc trúng 64 Lá Chính ➔ Tự động random động Hào ${activeLine}`
      : `Bốc trúng trực tiếp Lá Hào ${activeLine} (Bộ 384 Hào Từ)`;
    const kmFull = formatKhongMinhKinhDich(hex2, activeLine, sourceMethod);

    const lines: string[] = [];
    lines.push(
      `=== THÔNG TIN TRẢI BÀI QUẺ KHỔNG MINH THẦN TOÁN (LÁ CUỐI CÙNG LÀ QUẺ KHỔNG MINH #${kmFull.oracleBlock.oracleNum}${bakhKhoaNotice}) ===`
    );
    if (cleanedQuestion) {
      lines.push(`【NỘI DUNG TÂM NIỆM / CÂU HỎI CỦA ĐƯƠNG SỐ】:`);
      lines.push(`"${cleanedQuestion}"\n`);
    }
    if (cleanedPrediction) {
      lines.push(`【DỰ ĐOÁN CỦA QUẺ / ĐIỀM BÁO DỊCH LÝ】:`);
      lines.push(`"${cleanedPrediction}"\n`);
    }
    if (cleanedAnswer) {
      lines.push(`【ĐÁP ÁN / CHIÊM NGHIỆM TỰ ĐIỀN】:`);
      lines.push(`"${cleanedAnswer}"\n`);
    }
    lines.push(
      `Khẩu quyết: Trận Pháp Quẻ Khổng Minh (Bốc 3 lá bài, lấy duy nhất Lá cuối cùng — Lá 3 làm ★ QUẺ KHỔNG MINH THẦN TOÁN; không dùng thông tin của Lá 1 và Lá 2). Nếu bốc trúng 384 lá Hào Từ thì lấy chính hào đó làm hào động; nếu bốc trúng 64 lá Quẻ Chính thì tự động random động 1 hào bất kỳ (1–6) để ứng chiếu 384 quẻ xăm Gia Cát Khổng Minh.`
    );
    lines.push(
      `* ⚡ QUY TẮC HÀNH ĐỘNG CỐT TỦY: Khi Quẻ Khổng Minh là CÁT thì LÀM THEO lời khuyên hành động của Kinh Dịch; khi Quẻ Khổng Minh là HUNG thì HÀNH ĐỘNG NGƯỢC LẠI với lời khuyên của Kinh Dịch!\n`
    );

    if (c2) {
      const pos = KHONG_MINH_POSITIONS[2];
      const extraBadge = `[★ LÁ CUỐI: QUẺ KHỔNG MINH #${kmFull.oracleBlock.oracleNum} · ĐỘNG HÀO ${activeLine} (${sourceMethod})]`;
      lines.push(`----------------------------------------`);
      if (!includeFullBakhKhoa) {
        lines.push(`▶ Vị trí ${pos.label} [${pos.sub}]: ${pos.desc} ${extraBadge}`);
        lines.push(`• Quẻ tượng: ${c2.symbol}`);
        lines.push(`• Tên: ${c2.name}`);
        lines.push(`• Ý nghĩa: ${c2.sub}`);
        lines.push(`• Lời giải: ${c2.desc}`);
      } else {
        const cardLines = formatCardFullInfoFromHexagram(
          c2,
          `Vị trí ${pos.label} [${pos.sub}]: ${pos.desc}`,
          extraBadge,
          articles[2]
        );
        lines.push(...cardLines);
      }
      lines.push("");
    }

    lines.push(`========================================`);
    lines.push(`【TOÀN VĂN LUẬN ĐOÁN LÁ CUỐI (LÁ 3) — QUẺ KHỔNG MINH KINH DỊCH #${kmFull.oracleBlock.oracleNum}】:`);
    lines.push(kmFull.plainText);
    lines.push("");
    lines.push(`========================================`);
    lines.push(`[YÊU CẦU LUẬN GIẢI CHO AI]:`);
    if (cleanedQuestion) {
      lines.push(`▶ Trọng tâm giải đáp: Tập trung luận giải và tháo gỡ trực diện câu hỏi/tâm niệm: "${cleanedQuestion}"`);
    }
    lines.push(`Xin hãy luận giải sâu sắc Quẻ Khổng Minh Thần Toán (dựa duy nhất vào Lá 3 — Quẻ Khổng Minh #${kmFull.oracleBlock.oracleNum}):`);
    lines.push(`1. Trọng tâm ★ Lá 3 (Quẻ Khổng Minh Thần Toán #${kmFull.oracleBlock.oracleNum} · ${hex2.name} động Hào ${activeLine}): Phân tích Quẻ Chính, Hào Động ${activeLine}, 3 Quẻ Phụ (Tông - Hỗ - Thác) và Thơ Xăm Khổng Minh Thần Toán #${kmFull.oracleBlock.oracleNum} (${kmFull.oracleBlock.oracleType}).`);
    lines.push(
      `2. ⚡ ÁP DỤNG QUY TẮC HÀNH ĐỘNG KHỔNG MINH — KINH DỊCH: Vì Quẻ Khổng Minh #${kmFull.oracleBlock.oracleNum} hiện tại là ${kmFull.oracleBlock.isHung ? `HUNG (${kmFull.oracleBlock.oracleType}), bắt buộc phải khuyên đương số HÀNH ĐỘNG NGƯỢC LẠI với lời khuyên của Kinh Dịch (Thực hiện: "${kmFull.oracleBlock.doList}" — Tuyệt đối KHÔNG làm theo lời khuyên thuận của Kinh Dịch: "${kmFull.oracleBlock.avoidList}")` : `CÁT (${kmFull.oracleBlock.oracleType}), bắt buộc phải khuyên đương số LÀM THEO lời khuyên hành động của Kinh Dịch (Thực hiện: "${kmFull.oracleBlock.doList}" — Tránh: "${kmFull.oracleBlock.avoidList}")`}.`
    );
    return lines.join("\n");
  }

  const getSpreadName = (m: SpreadMode) => {
    switch (m) {
      case "1_single": return "1 Lá (Đơn Quẻ Chí Tôn)";
      case "1_to_2": return "2 Lá (Âm Dương Đối Đãi)";
      case "1_to_3": return "3 Lá (Tam Tài: Quá Khứ - Hiện Tại - Tương Lai)";
      case "khong_minh": return "Quẻ Khổng Minh (3 Lá · Gia Cát Thần Toán)";
      case "3_to_5": return "5 Lá (Ngũ Hành Tương Sinh Tương Khắc)";
      case "that_tinh": return "Trận Pháp Thất Tinh (7 Lá Chu Dịch Bắc Đẩu)";
      case "cuu_cung": return "Trận Pháp Cửu Cung (9 Lá · Phi Tinh Lạc Thư)";
      case "thap_tinh": return "Trận Pháp Thập Tinh (10 Lá Celtic Cross Dịch Lý)";
      case "thap_nhat": return "Trận Pháp Thập Tinh Mở Rộng (11 Lá · Tác Nhân Kép 2A & 2B)";
      case "thap_nhi": return "Trận Pháp Thập Nhị Cung (12 Lá · 12 Địa Chi & 12 Cung Tử Vi)";
      case "thap_la": return "Tháp La Kinh Dịch (Bản Quái • Hào Động • Biến Quái)";
      default: return `${cardsList.length} Lá`;
    }
  };

  const getPositionLabel = (idx: number, total: number) => {
    if (total === 1) return "Lá Bài Trung Tâm";
    if (total === 2) {
      return idx === 0 ? "Lá 1 (Bên Trái)" : "Lá 2 (Bên Phải)";
    }
    if (total === 3) {
      if (idx === 0) return "Lá 1 (Bên Trái - Khởi Nguyên / Quá Khứ)";
      if (idx === 1) return "Lá 2 (Ở Giữa - Trọng Tâm / Hiện Tại)";
      return "Lá 3 (Bên Phải - Kết Quả / Tương Lai)";
    }
    if (total === 5) {
      const labels = [
        "Lá 1 (Cực Trái - Căn Nguyên Vấn Đề)",
        "Lá 2 (Cận Trái - Bối Cảnh / Môi Trường)",
        "Lá 3 (Chính Giữa - Quẻ Chủ / Bản Mệnh)",
        "Lá 4 (Cận Phải - Biến Chuyển / Thử Thách)",
        "Lá 5 (Cực Phải - Kết Quả / Lối Thoát)",
      ];
      return labels[idx] || `Lá ${idx + 1} (Từ trái sang phải)`;
    }
    return `Lá ${idx + 1} (Từ trái sang phải)`;
  };

  const lines: string[] = [];
  lines.push(`=== THÔNG TIN TRẢI BÀI KINH DỊCH (THỨ TỰ TỪ TRÁI SANG PHẢI${bakhKhoaNotice}) ===`);
  lines.push(`Trải bài: ${getSpreadName(currentMode)} | Số lượng: ${cardsList.length} lá`);
  if (cleanedQuestion) {
    lines.push(`【NỘI DUNG TÂM NIỆM / CÂU HỎI CỦA ĐƯƠNG SỐ】:`);
    lines.push(`"${cleanedQuestion}"\n`);
  } else {
    lines.push("");
  }

  cardsList.forEach((c, idx) => {
    const pos = getPositionLabel(idx, cardsList.length);
    lines.push(`----------------------------------------`);
    lines.push(`【${pos}】`);
    if (!includeFullBakhKhoa) {
      lines.push(`• Quẻ tượng: ${c.symbol}`);
      lines.push(`• Tên: ${c.name}`);
      lines.push(`• Ý nghĩa: ${c.sub}`);
      lines.push(`• Lời giải: ${c.desc}`);
    } else {
      const cardLines = formatCardFullInfoFromHexagram(c, undefined, undefined, articles[idx]);
      lines.push(...cardLines);
    }
    lines.push("");
  });

  lines.push(`========================================`);
  lines.push(`[YÊU CẦU LUẬN GIẢI CHO AI]:`);
  if (cleanedQuestion) {
    lines.push(`▶ Trọng tâm giải đáp: Tập trung luận giải và tháo gỡ trực diện câu hỏi/tâm niệm: "${cleanedQuestion}"`);
  }
  const hasYaoInSpread = cardsList.some((c) => c.type === "yao" && Boolean(c.yaoNumber));
  lines.push(`Xin hãy phân tích trải bài Kinh Dịch trên theo đúng thứ tự từ trái sang phải (dựa trên đầy đủ dữ liệu quẻ tượng, Thoán Từ, Đại Tượng${hasYaoInSpread ? ", Hào Từ" : ""}, Ngũ hành${includeFullBakhKhoa ? ", Cửu Nhị Luận Giải và Chiêm đoán 4 phương diện" : ""}):`);
  lines.push(`1. Luận giải ý nghĩa chi tiết từng lá bài theo vị trí tương ứng.`);
  lines.push(`2. Phân tích mối liên kết và dòng chảy chuyển dịch năng lượng từ lá bài bên trái sang lá bài bên phải.`);
  lines.push(`3. Đánh giá hoàn cảnh hiện tại, nguy cơ tiềm ẩn và cơ hội phát triển.`);
  lines.push(`4. Đưa ra lời khuyên hành động thực tế, thấu đáo và sáng suốt nhất theo triết lý Kinh Dịch.`);
  if (cleanedQuestion) {
    lines.push(`5. Đưa ra lời khuyên và câu trả lời cụ thể, sáng rõ cho câu hỏi tâm niệm trên.`);
  }

  return lines.join("\n");
}

/* ─── 15 drifting particles in hero ─── */
const PARTICLES = [
  { left: "5%",  top: "12%", size: 4, dur: 9,  delay: 0 },
  { left: "22%", top: "35%", size: 6, dur: 11, delay: 0.8 },
  { left: "39%", top: "58%", size: 8, dur: 8,  delay: 1.6 },
  { left: "56%", top: "21%", size: 5, dur: 12, delay: 2.4 },
  { left: "73%", top: "74%", size: 10,dur: 10, delay: 3.2 },
  { left: "90%", top: "47%", size: 6, dur: 9,  delay: 4.0 },
  { left: "14%", top: "82%", size: 7, dur: 11, delay: 4.8 },
  { left: "48%", top: "8%",  size: 5, dur: 13, delay: 5.6 },
  { left: "65%", top: "90%", size: 8, dur: 8,  delay: 6.4 },
  { left: "82%", top: "15%", size: 4, dur: 10, delay: 7.2 },
  { left: "31%", top: "45%", size: 9, dur: 12, delay: 8.0 },
  { left: "8%",  top: "62%", size: 6, dur: 9,  delay: 8.8 },
  { left: "76%", top: "38%", size: 5, dur: 11, delay: 9.6 },
  { left: "52%", top: "70%", size: 7, dur: 10, delay: 10.4 },
  { left: "18%", top: "25%", size: 8, dur: 13, delay: 11.2 },
];

function smoothstep(t: number) {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
}

/* ══════════════════════════════════════════════════════════════════
   RITUAL HOLD BUTTON COMPONENT
   - Yêu cầu: Đè giữ ~3 giây và thực hiện 3 lần liên tục mới kích hoạt
   - Hiệu ứng: Vòng sáng xung quanh viền lan hết 1 vòng (100%) mỗi lần đè
   - Hỗ trợ: Đè liên tục 3 vòng (3 x 3s = 9s) HOẶC nhả ra đè 3 lần riêng biệt
   ══════════════════════════════════════════════════════════════════ */
interface RitualHoldButtonProps {
  id: string;
  onClick: (isRitual?: boolean) => void;
  active?: boolean;
  className?: string;
  wrapperClassName?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  title?: string;
  holdDuration?: number; // 3000ms
  requiredCount?: number; // 3 lần
}

const RitualHoldButton: React.FC<RitualHoldButtonProps> = ({
  id,
  onClick,
  active = false,
  className = "",
  wrapperClassName = "",
  style,
  children,
  title,
  holdDuration = 3000,
  requiredCount = 3,
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dimensions, setDimensions] = useState({ width: 120, height: 36 });
  const [holdProgress, setHoldProgress] = useState(0); // 0 đến 1
  const [isHolding, setIsHolding] = useState(false);
  const [revealedStep, setRevealedStep] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);

  const holdStartRef = useRef<number | null>(null);
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentCountRef = useRef(0);
  const hasFinishedCycleRef = useRef(false);

  const RITUAL_STEPS = ["Kính Thiên", "Kính Địa", "Kính Nhân"];

  // Đo kích thước thực tế của nút để vẽ đường viền SVG khít hoàn hảo
  useEffect(() => {
    if (!buttonRef.current) return;
    const updateSize = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setDimensions({ width: rect.width, height: rect.height });
        }
      }
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(buttonRef.current);
    return () => ro.disconnect();
  }, []);

  const clearHold = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    holdStartRef.current = null;
    setIsHolding(false);
    setHoldProgress(0);
  };

  const startHold = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;

    touchStartPosRef.current = { x: e.clientX, y: e.clientY };

    // Chỉ gọi setPointerCapture với chuột để không chặn cử chỉ cuộn dọc trên màn hình cảm ứng:
    if (e.pointerType === "mouse") {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch (_) {}
    }

    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }

    setIsHolding(true);
    setRevealedStep(null); // Đang chạy thì không hiện chữ
    setShowHint(false); // Đang giữ thì tắt tooltip nhắc nhở
    hasFinishedCycleRef.current = false;
    holdStartRef.current = performance.now();

    const loop = (now: number) => {
      if (!holdStartRef.current) return;
      const elapsed = now - holdStartRef.current;
      const progress = Math.min(1, elapsed / holdDuration);
      setHoldProgress(progress);

      if (progress >= 1) {
        // ĐÃ CHẠY XONG 1 VÒNG TRỌN VẸN (3 GIÂY) -> BÂY GIỜ MỚI HIỆN CHỮ!
        hasFinishedCycleRef.current = true;
        setHoldProgress(1);

        // Hiện chữ thiêng liêng tương ứng ngay khi chạy xong 1 vòng
        const stepName = RITUAL_STEPS[currentCountRef.current] || "Kính Thiên";
        setRevealedStep(stepName);

        // Chớp sáng báo hiệu vòng sáng đã lan đủ 1 vòng
        setIsFlashing(true);
        setTimeout(() => setIsFlashing(false), 380);

        if (typeof navigator !== "undefined" && navigator.vibrate) {
          try { navigator.vibrate(60); } catch (_) {}
        }

        // BẮT BUỘC BUÔNG TAY RA MỚI TÍNH LẦN TIẾP THEO:
        return;
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isHolding || !touchStartPosRef.current) return;
    const dx = e.clientX - touchStartPosRef.current.x;
    const dy = e.clientY - touchStartPosRef.current.y;
    // Nếu ngón tay di chuyển quá 10px (người dùng đang vuốt để kéo cuộn màn hình trên điện thoại):
    if (Math.hypot(dx, dy) > 10) {
      clearHold();
      touchStartPosRef.current = null;
    }
  };

  const endHold = (e?: React.PointerEvent<HTMLButtonElement>) => {
    touchStartPosRef.current = null;
    if (e && e.currentTarget && e.pointerId !== undefined) {
      try {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      } catch (_) {}
    }

    if (!isHolding && !holdStartRef.current) return;

    const finished = hasFinishedCycleRef.current;
    clearHold();

    if (finished) {
      // Đã đè đủ 3s và bây giờ buông tay ra -> Chính thức tính 1 lần!
      const nextCount = currentCountRef.current + 1;
      currentCountRef.current = nextCount;

      if (nextCount >= requiredCount) {
        // Đã hoàn thành đủ 3 lần: Kính Thiên -> Kính Địa -> Kính Nhân!
        currentCountRef.current = 0;
        setRevealedStep("Kính Nhân ➔ Khai mở quẻ!");
        setTimeout(() => setRevealedStep(null), 2500);

        if (typeof navigator !== "undefined" && navigator.vibrate) {
          try { navigator.vibrate([60, 40, 100]); } catch (_) {}
        }
        onClick(true);
        return;
      }

      // Giữ chữ vừa hoàn thành trong 2.5 giây để người dùng chiêm ngưỡng
      setTimeout(() => {
        setRevealedStep(null);
      }, 2500);

      // Giữ số lần tích lũy trong 8 giây; quá 8s không đè tiếp thì reset về 0
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        currentCountRef.current = 0;
      }, 8000);
    } else {
      // Buông tay sớm khi vòng sáng chưa hoàn thành 1 vòng -> Không hiện chữ
      setHoldProgress(0);
      setRevealedStep(null);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // Nếu người dùng click chuột bình thường (nhấn nhanh 1 cái), lập tức gọi onClick(false) để ra trận pháp với dữ liệu tiêu chuẩn
    if (!hasFinishedCycleRef.current) {
      onClick(false);
    }
  };

  // Tính chu vi chính xác của hình viên thuốc (pill shape)
  const rx = Math.max(12, (dimensions.height - 2) / 2);
  const straightEdge = Math.max(0, dimensions.width - 2 * rx);
  const perimeter = 2 * straightEdge + 2 * Math.PI * rx;
  const strokeOffset = perimeter * (1 - holdProgress);

  return (
    <div className={`relative inline-flex items-center justify-center ${wrapperClassName || "w-full sm:w-auto"}`}>
      {/* Chỉ hiện chữ khi ĐÃ CHẠY XONG 1 VÒNG */}
      {revealedStep && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-50 pointer-events-none whitespace-nowrap px-3.5 py-1.5 rounded-full bg-zinc-950/95 border border-[#C4963E] shadow-2xl text-xs sm:text-[11px] font-serif font-bold text-amber-300 flex items-center gap-1.5 animate-bounce">
          <span className="text-amber-400">✦</span>
          <span>{revealedStep}</span>
          <span className="text-amber-400">✦</span>
        </div>
      )}

      {/* Nhắc nhở người dùng khi bấm nhẹ thay vì giữ */}
      {showHint && !revealedStep && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-50 pointer-events-none whitespace-nowrap px-3 py-1 rounded-full bg-zinc-950/95 border border-amber-400/80 shadow-2xl text-[11px] font-sans font-semibold text-amber-300 flex items-center gap-1 animate-fadeIn">
          <span>✦ Nhấn & giữ 3 giây ✦</span>
        </div>
      )}

      <button
        id={id}
        ref={buttonRef}
        type="button"
        title={title || "Kính Thiên, Kính Địa, Kính Nhân"}
        onClick={handleClick}
        onPointerDown={startHold}
        onPointerMove={handlePointerMove}
        onPointerUp={endHold}
        onPointerLeave={endHold}
        onPointerCancel={endHold}
        onContextMenu={(e) => e.preventDefault()}
        className={`relative w-full sm:w-auto select-none touch-pan-y overflow-visible transition-all duration-200 ${className} ${
          isHolding ? "scale-[0.97] brightness-110 shadow-lg ring-2 ring-amber-400/60" : ""
        } ${isFlashing ? "ring-4 ring-amber-400/80 shadow-[0_0_24px_rgba(245,158,11,0.6)]" : ""} ${
          showHint ? "animate-ritual-wiggle" : ""
        }`}
        style={{
          WebkitTouchCallout: "none",
          WebkitUserSelect: "none",
          ...style,
        }}
      >
        {/* SVG viền sáng lan tỏa 1 vòng xung quanh viền ngoài nút */}
        <svg
          className="absolute -inset-[2px] pointer-events-none overflow-visible rounded-full"
          style={{
            width: "calc(100% + 4px)",
            height: "calc(100% + 4px)",
            zIndex: 20,
          }}
        >
          <defs>
            <linearGradient id={`glowGrad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="35%" stopColor="#FFFBEB" />
              <stop offset="70%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
            <filter id={`glowFilter-${id}`} x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Vòng nền mờ khi đang giữ */}
          {isHolding && (
            <rect
              x="2"
              y="2"
              width={Math.max(1, dimensions.width)}
              height={Math.max(1, dimensions.height)}
              rx={rx}
              fill="none"
              stroke="rgba(245, 158, 11, 0.25)"
              strokeWidth="2.5"
            />
          )}

          {/* Vòng tia sáng vàng lan tỏa chính xác 1 vòng theo tiến độ */}
          {isHolding && (
            <rect
              x="2"
              y="2"
              width={Math.max(1, dimensions.width)}
              height={Math.max(1, dimensions.height)}
              rx={rx}
              fill="none"
              stroke={`url(#glowGrad-${id})`}
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeDasharray={perimeter}
              strokeDashoffset={strokeOffset}
              filter={`url(#glowFilter-${id})`}
            />
          )}
        </svg>

        {/* Nội dung nút sạch sẽ 100%, không hiện 3 dấu chấm, giữ nguyên thiết kế ban đầu */}
        <span className="relative z-10 flex items-center justify-center gap-1.5 pointer-events-none">
          {children}
        </span>
      </button>
    </div>
  );
};

const DAILY_ACTIVE_SPREAD_STORAGE_KEY = "cuunhi_daily_active_spread_v1";

interface PersistedDailySpreadState {
  dateKey: string;
  mode: SpreadMode;
  cards: DynamicCardItem[];
  isCard2Reversed: boolean;
  isCard2AReversed: boolean;
  isCard2BReversed: boolean;
  menhBranchNumber: number;
  isRitualCompleted: boolean;
}

/** Lấy ngày lịch địa phương chuẩn ISO (YYYY-MM-DD) ưu tiên Temporal.PlainDate khi khả dụng */
function getLocalCalendarDateKey(): string {
  const TemporalApi = (globalThis as Record<string, any>).Temporal;
  if (TemporalApi?.Now?.plainDateISO) {
    return TemporalApi.Now.plainDateISO().toString();
  }
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** So sánh hai ngày lịch địa phương bằng Temporal.PlainDate.equals() (kèm fallback an toàn cho Safari) */
function isSameLocalCalendarDay(savedDateKey?: string): boolean {
  if (!savedDateKey || !/^\d{4}-\d{2}-\d{2}$/.test(savedDateKey)) return false;
  const TemporalApi = (globalThis as Record<string, any>).Temporal;
  if (TemporalApi?.PlainDate?.from && TemporalApi?.Now?.plainDateISO) {
    try {
      const savedPlain = TemporalApi.PlainDate.from(savedDateKey);
      const todayPlain = TemporalApi.Now.plainDateISO();
      return Boolean(todayPlain.equals(savedPlain));
    } catch {
      return savedDateKey === getLocalCalendarDateKey();
    }
  }
  return savedDateKey === getLocalCalendarDateKey();
}

function persistDailySpreadState(state: PersistedDailySpreadState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DAILY_ACTIVE_SPREAD_STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

function loadOrCreateDailySpreadState(): PersistedDailySpreadState {
  const todayKey = getLocalCalendarDateKey();
  let previousMode: SpreadMode | null = null;

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(DAILY_ACTIVE_SPREAD_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PersistedDailySpreadState>;
        if (parsed.mode && SPREAD_MODES.includes(parsed.mode)) {
          previousMode = parsed.mode;
        }
        if (
          parsed.mode &&
          SPREAD_MODES.includes(parsed.mode) &&
          Array.isArray(parsed.cards) &&
          parsed.cards.length > 0 &&
          isSameLocalCalendarDay(parsed.dateKey)
        ) {
          const restoredMenhBranch =
            typeof parsed.menhBranchNumber === "number" &&
            parsed.menhBranchNumber >= 1 &&
            parsed.menhBranchNumber <= 12
              ? parsed.menhBranchNumber
              : parsed.cards.find((c) => c.isMenhCung)?.branchNumber || rollRandomMenhBranch();
          const restoredCards =
            parsed.mode === "thap_nhi"
              ? applyTwelveHousesToCards(parsed.cards, restoredMenhBranch)
              : parsed.mode === "khong_minh"
              ? applyKhongMinhToThreeCards(parsed.cards)
              : parsed.cards;
          return {
            dateKey: todayKey,
            mode: parsed.mode,
            cards: restoredCards,
            isCard2Reversed: typeof parsed.isCard2Reversed === "boolean" ? parsed.isCard2Reversed : false,
            isCard2AReversed: typeof parsed.isCard2AReversed === "boolean" ? parsed.isCard2AReversed : false,
            isCard2BReversed: typeof parsed.isCard2BReversed === "boolean" ? parsed.isCard2BReversed : false,
            menhBranchNumber: restoredMenhBranch,
            isRitualCompleted: Boolean(parsed.isRitualCompleted),
          };
        }
      }
    } catch {}
  }

  // Sang ngày mới (hoặc lần đầu tiên mở web): Chọn trận bài khác với ngày hôm trước
  const candidateModes = previousMode ? SPREAD_MODES.filter((m) => m !== previousMode) : SPREAD_MODES;
  const nextMode =
    candidateModes.length > 0
      ? candidateModes[Math.floor(Math.random() * candidateModes.length)]
      : SPREAD_MODES[Math.floor(Math.random() * SPREAD_MODES.length)];
  const nextMenhBranch = rollRandomMenhBranch();
  const nextCards = drawCardsForMode(nextMode, nextMenhBranch);
  const nextReversed = Math.random() < 0.5;
  const nextReversed2A = Math.random() < 0.5;
  const nextReversed2B = Math.random() < 0.5;

  const freshDailyState: PersistedDailySpreadState = {
    dateKey: todayKey,
    mode: nextMode,
    cards: nextCards,
    isCard2Reversed: nextReversed,
    isCard2AReversed: nextReversed2A,
    isCard2BReversed: nextReversed2B,
    menhBranchNumber: nextMenhBranch,
    isRitualCompleted: false,
  };
  persistDailySpreadState(freshDailyState);
  return freshDailyState;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  currentUser,
  onEnterApp,
  onOpenAuthModal,
  onLogout,
  onOpenDonateModal,
}) => {
  /* Giữ nguyên trận bài trong suốt cả ngày dù F5 / reset web; chỉ sang ngày hôm sau mới đổi sang trận bài khác */
  const [initialDailySpread] = useState<PersistedDailySpreadState>(() => loadOrCreateDailySpreadState());
  const activeSpreadDateRef = useRef<string>(initialDailySpread.dateKey);

  const [mode, setMode] = useState<SpreadMode>(initialDailySpread.mode);
  const [cards, setCards] = useState<DynamicCardItem[]>(initialDailySpread.cards);

  /* Trạng thái chiều của Lá thứ 2 trong Thập Tinh Trận: false = Xuôi (Hỗ Trợ), true = Ngược (Trở Ngại) */
  const [isCard2Reversed, setIsCard2Reversed] = useState<boolean>(initialDailySpread.isCard2Reversed);
  /* Trạng thái chiều của Lá 2A & 2B trong Thập Tinh Mở Rộng (11 Lá) */
  const [isCard2AReversed, setIsCard2AReversed] = useState<boolean>(initialDailySpread.isCard2AReversed);
  const [isCard2BReversed, setIsCard2BReversed] = useState<boolean>(initialDailySpread.isCard2BReversed);
  /* Vị trí Địa Chi (1..12: Tý..Hợi) an ★ Cung Mệnh tự động ngẫu nhiên trong Trận Thập Nhị Cung (12 Lá) */
  const [menhBranchNumber, setMenhBranchNumber] = useState<number>(initialDailySpread.menhBranchNumber);

  /* Trạng thái đắc pháp nghi thức: false = nhấn nhanh (trích chuẩn như cũ), true = nhấn đủ Kính Thiên - Kính Địa - Kính Nhân (trích 100% bách khoa) */
  const [isRitualCompleted, setIsRitualCompleted] = useState<boolean>(initialDailySpread.isRitualCompleted);

  /* Trạng thái giữ nguyên các lá bài hiện tại (khóa quẻ không bị rút lại khi thực hiện Tam Kính) */
  const [isKeepCards, setIsKeepCards] = useState<boolean>(true);

  /* Đồng bộ trận bài hiện tại vào bộ nhớ theo ngày để khi reset / F5 web trong ngày không bị đổi bài */
  useEffect(() => {
    if (!Array.isArray(cards) || cards.length === 0) return;
    const todayKey = getLocalCalendarDateKey();
    activeSpreadDateRef.current = todayKey;
    persistDailySpreadState({
      dateKey: todayKey,
      mode,
      cards,
      isCard2Reversed,
      isCard2AReversed,
      isCard2BReversed,
      menhBranchNumber,
      isRitualCompleted,
    });
  }, [mode, cards, isCard2Reversed, isCard2AReversed, isCard2BReversed, menhBranchNumber, isRitualCompleted]);

  /* Nếu người dùng treo tab qua 00:00 sang ngày hôm sau và quay lại xem, tự động khởi mở trận bài khác cho ngày mới */
  useEffect(() => {
    const checkNextDayRollover = () => {
      if (document.visibilityState === "hidden") return;
      if (!isSameLocalCalendarDay(activeSpreadDateRef.current)) {
        const nextDaySpread = loadOrCreateDailySpreadState();
        activeSpreadDateRef.current = nextDaySpread.dateKey;
        setMode(nextDaySpread.mode);
        setCards(nextDaySpread.cards);
        setIsCard2Reversed(nextDaySpread.isCard2Reversed);
        setIsCard2AReversed(nextDaySpread.isCard2AReversed);
        setIsCard2BReversed(nextDaySpread.isCard2BReversed);
        setMenhBranchNumber(nextDaySpread.menhBranchNumber);
        setIsRitualCompleted(false);
        setIsKeepCards(true);
      }
    };
    window.addEventListener("focus", checkNextDayRollover);
    document.addEventListener("visibilitychange", checkNextDayRollover);
    return () => {
      window.removeEventListener("focus", checkNextDayRollover);
      document.removeEventListener("visibilitychange", checkNextDayRollover);
    };
  }, []);

  const handleToggleCard2Reversed = useCallback(() => {
    setIsCard2Reversed((prev) => !prev);
  }, []);

  const handleToggleCard2AReversed = useCallback(() => {
    setIsCard2AReversed((prev) => !prev);
  }, []);

  const handleToggleCard2BReversed = useCallback(() => {
    setIsCard2BReversed((prev) => !prev);
  }, []);

  const handleRerollMenhBranch = useCallback(() => {
    let nextMenh = rollRandomMenhBranch();
    if (TWELVE_BRANCHES_DATA.length > 1) {
      let guard = 0;
      while (nextMenh === menhBranchNumber && guard < 12) {
        nextMenh = rollRandomMenhBranch();
        guard++;
      }
    }
    setMenhBranchNumber(nextMenh);
    setCards((prev) => (mode === "thap_nhi" ? applyTwelveHousesToCards(prev, nextMenh) : prev));
    const branchInfo = TWELVE_BRANCHES_DATA.find((b) => b.number === nextMenh);
    setCopiedToast(
      `🎲 Đã tự động an ngẫu nhiên ★ Cung Mệnh sang Địa Chi ${branchInfo?.name || nextMenh} (${branchInfo?.lunarMonth || ""})!`
    );
    setTimeout(() => setCopiedToast(null), 3200);
  }, [menhBranchNumber, mode]);

  const handleRerollKhongMinhLine = useCallback(() => {
    if (mode !== "khong_minh") return;
    const currentLast = cards[2];
    if (!currentLast) return;
    const prevLine = currentLast.khongMinhLine || currentLast.yaoNumber || 1;
    let nextLine = Math.floor(Math.random() * 6) + 1;
    let guard = 0;
    while (nextLine === prevLine && guard < 12) {
      nextLine = Math.floor(Math.random() * 6) + 1;
      guard++;
    }
    const updated = applyKhongMinhToThreeCards(cards, nextLine);
    setCards(updated);
    const updatedLast = updated[2];
    if (updatedLast) {
      setSelectedCard((prev) => (prev && prev.slotIndex === 2 ? updatedLast : prev));
    }
    setCopiedToast(
      `🎲 Lá 3 (${currentLast.name}): Đã random động sang Hào ${nextLine} ➔ Quẻ Khổng Minh #${updatedLast?.khongMinhOracleNum || ""}!`
    );
    setTimeout(() => setCopiedToast(null), 3200);
  }, [mode, cards]);

  /* Anchors for scroll physics */
  const heroAnchorRef = useRef<HTMLDivElement>(null);
  const destinyAnchorRef = useRef<HTMLDivElement>(null);
  const bridgeRef = useRef<HTMLDivElement>(null);
  const destinyTitleRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const featuresAnchorRef = useRef<HTMLDivElement>(null);
  const featuresSecRef = useRef<HTMLElement>(null);

  /* Layer & stage refs */
  const layerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);

  /* Modals state */
  const [selectedCard, setSelectedCard] = useState<DynamicCardItem | null>(null);
  const [modalCardView, setModalCardView] = useState<"both" | "front" | "back">("both");
  const [isOracleOpen, setIsOracleOpen] = useState(false);
  const [isLifeConfigOpen, setIsLifeConfigOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  /* Oracle mini-game state */
  const [oracleQuestion, setOracleQuestion] = useState("");
  const [coinsTossStep, setCoinsTossStep] = useState(0);
  const [lines, setLines] = useState<number[]>([]);
  const [isFlipping, setIsFlipping] = useState(false);
  const [oracleResult, setOracleResult] = useState<{ name: string; symbol: string; text: string; ai: string } | null>(null);

  /* Life config receipt state */
  const [birthDate, setBirthDate] = useState("2000-01-01");
  const [birthHour, setBirthHour] = useState("7-9");
  const [gender, setGender] = useState("Nam");
  const [receiptGenerated, setReceiptGenerated] = useState(false);

  /* Copy to AI states */
  const [copiedAI, setCopiedAI] = useState(false);
  const [copiedSingle, setCopiedSingle] = useState(false);
  const [copiedToast, setCopiedToast] = useState<string | null>(null);

  /* Ref lưu ID quẻ tạm hiện tại đang mở trên màn hình */
  const currentTempSpreadIdRef = useRef<string | null>(null);

  /* Nội dung tâm niệm / Câu hỏi cho AI (Mặc định mỗi lần vào web sẽ luôn reset về chưa điền chữ) */
  const [userIntentQuestion, setUserIntentQuestion] = useState<string>("");
  /* Câu trả lời tại Hương Án Khởi Niệm · Câu Hỏi Chiêm Bốc (Căn cứ bắt buộc để mở khóa Chat và để Tiểu Long Cửu Nhị dựa vào khuyên bảo) */
  const [huongAnAnswer, setHuongAnAnswer] = useState<string>("");
  const [isHuongAnHighlighted, setIsHuongAnHighlighted] = useState<boolean>(false);
  /* Trạng thái đã nhấn nút "Chép Toàn Bộ Quẻ Bài & Câu Hỏi Cho AI" khi đã có câu hỏi */
  const [hasCopiedWithQuestion, setHasCopiedWithQuestion] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.removeItem("cuunhi_user_intent_question");
    } catch {}
  }, []);

  const handleQuestionChange = useCallback((val: string) => {
    setUserIntentQuestion(val);
    if (!val.trim()) {
      setHasCopiedWithQuestion(false);
      setHuongAnAnswer("");
    }
    if (currentTempSpreadIdRef.current) {
      updateTempSpreadItem(currentTempSpreadIdRef.current, { question: val });
    }
  }, []);

  /* Dự đoán của quẻ / Điềm báo dịch lý (Nằm ở giữa câu hỏi và đáp án) */
  const [hexagramPrediction, setHexagramPrediction] = useState<string>(() => {
    try {
      const saved = localStorage.getItem("cuunhi_hexagram_prediction");
      if (saved) return saved;
    } catch {}
    return "";
  });

  const handleHexagramPredictionChange = useCallback((val: string) => {
    setHexagramPrediction(val);
    try {
      localStorage.setItem("cuunhi_hexagram_prediction", val);
    } catch {}
    if (currentTempSpreadIdRef.current) {
      updateTempSpreadItem(currentTempSpreadIdRef.current, { hexagramPrediction: val });
    }
  }, []);

  /* Đáp án tự điền / Chiêm nghiệm thực tế của người dùng */
  const [userCustomAnswer, setUserCustomAnswer] = useState(() => {
    try {
      return localStorage.getItem("cuunhi_user_custom_answer") || "";
    } catch {
      return "";
    }
  });

  const handleCustomAnswerChange = useCallback((val: string) => {
    setUserCustomAnswer(val);
    try {
      localStorage.setItem("cuunhi_user_custom_answer", val);
    } catch {}
    if (currentTempSpreadIdRef.current) {
      updateTempSpreadItem(currentTempSpreadIdRef.current, { userAnswer: val });
    }
  }, []);

  /* Cửu Long tự động tổng hợp câu trả lời Hương Án ngầm phía sau dựa trên câu hỏi & quẻ đang trải (không hiển thị ra giao diện) */
  const getAutoHuongAnAnswer = useCallback(() => {
    const qClean = userIntentQuestion.trim();
    if (!qClean) return "";
    const pred = generateHexagramPrediction(cards, mode, isCard2Reversed, qClean, {
      isCard2AReversed,
      isCard2BReversed,
      menhBranchNumber,
    });
    const firstCard = cards[0];
    const book0 = BOOK_HEXAGRAMS.find((b) => b.number === firstCard?.hexNumber) || BOOK_HEXAGRAMS[0];
    return [
      `📕 Tôn chỉ Sách Thuyết Minh (Quẻ #${book0.number} ${book0.name}): "${book0.redHeadline}" — ${book0.destiny}`,
      pred,
    ]
      .filter(Boolean)
      .join("\n");
  }, [userIntentQuestion, cards, mode, isCard2Reversed, isCard2AReversed, isCard2BReversed, menhBranchNumber]);

  useEffect(() => {
    const autoAns = getAutoHuongAnAnswer();
    setHuongAnAnswer(autoAns);
  }, [getAutoHuongAnAnswer]);

  const isHuongAnReadyForChat = Boolean(userIntentQuestion.trim());

  const scrollToHuongAnForChat = useCallback(() => {
    setIsPhoneChatModalExpanded(false);
    setIsHuongAnHighlighted(true);
    setTimeout(() => setIsHuongAnHighlighted(false), 3200);
    const huongAnEl = document.getElementById("huong-an-khoi-niem");
    if (huongAnEl) {
      huongAnEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    setTimeout(() => {
      const qInput = document.getElementById("user-intent-question-input") as HTMLTextAreaElement | null;
      if (qInput) qInput.focus();
    }, 350);
  }, []);

  const handleRefreshPredictionFromCards = useCallback(() => {
    const pred = generateHexagramPrediction(cards, mode, isCard2Reversed, userIntentQuestion, {
      isCard2AReversed,
      isCard2BReversed,
      menhBranchNumber,
    });
    handleHexagramPredictionChange(pred);
    if (userIntentQuestion && userIntentQuestion.trim()) {
      setCopiedToast("✨ Đã tham khảo tâm niệm & điền gợi ý dự đoán từ quẻ!");
    } else {
      setCopiedToast("💡 Đã điền dự đoán từ quẻ. Nhập tâm niệm ở trên để dự đoán sát việc hơn!");
    }
    setTimeout(() => setCopiedToast(null), 3000);
  }, [cards, mode, isCard2Reversed, isCard2AReversed, isCard2BReversed, menhBranchNumber, userIntentQuestion, handleHexagramPredictionChange]);

  /* Quản lý danh sách quẻ đã lưu & Popups */
  const [savedSpreads, setSavedSpreads] = useState<SavedSpreadItem[]>(() => {
    return typeof window !== "undefined" ? getSavedSpreads() : [];
  });
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState<boolean>(false);
  const [isSavedSpreadsModalOpen, setIsSavedSpreadsModalOpen] = useState<boolean>(false);

  /* Quản lý danh sách quẻ tạm thời trong ngày (chưa nhấn lưu) */
  const [tempSpreads, setTempSpreads] = useState<TempSpreadItem[]>(() => {
    return typeof window !== "undefined" ? getTodayTempSpreads() : [];
  });
  const [isTempSpreadsModalOpen, setIsTempSpreadsModalOpen] = useState<boolean>(false);

  const reloadSavedSpreads = useCallback(() => {
    setSavedSpreads(getSavedSpreads());
  }, []);

  const reloadTempSpreads = useCallback(() => {
    setTempSpreads(getTodayTempSpreads());
  }, []);

  /* Hàm ghi nhận một quẻ vừa mở vào danh sách quẻ tạm thời trong ngày */
  const recordDrawnSpreadToTemp = useCallback((
    targetMode: SpreadMode,
    targetCards: DynamicCardItem[],
    targetReversed?: boolean,
    targetRitual?: boolean,
    customQuestion?: string,
    customPrediction?: string,
    extraOpts?: {
      isCard2AReversed?: boolean;
      isCard2BReversed?: boolean;
      menhBranchNumber?: number;
    }
  ) => {
    if (!Array.isArray(targetCards) || targetCards.length === 0) return;
    const spreadTitle = SPREAD_MODE_NAMES[targetMode] || "Trận Pháp Kinh Dịch";
    const item = addTempSpreadItem({
      mode: targetMode,
      spreadTitle,
      cards: targetCards,
      isCard2Reversed: targetMode === "thap_tinh" ? targetReversed : undefined,
      isCard2AReversed: targetMode === "thap_nhat" ? extraOpts?.isCard2AReversed : undefined,
      isCard2BReversed: targetMode === "thap_nhat" ? extraOpts?.isCard2BReversed : undefined,
      menhBranchNumber: targetMode === "thap_nhi" ? extraOpts?.menhBranchNumber : undefined,
      question: typeof customQuestion === "string" ? customQuestion : userIntentQuestion,
      hexagramPrediction: typeof customPrediction === "string" ? customPrediction : hexagramPrediction,
      isRitualCompleted: targetRitual,
    });
    if (item) {
      currentTempSpreadIdRef.current = item.id;
      setTempSpreads(getTodayTempSpreads());
    }
  }, [userIntentQuestion, hexagramPrediction]);

  /* Tự động ghi nhận quẻ của ngày khi mở ứng dụng (không tạo bản trùng khi F5 / reset web) */
  const initialTempRecordedRef = useRef<boolean>(false);
  useEffect(() => {
    if (!initialTempRecordedRef.current && cards.length > 0) {
      initialTempRecordedRef.current = true;
      const existingToday = getTodayTempSpreads().find(
        (t) =>
          t.mode === mode &&
          Array.isArray(t.cards) &&
          t.cards.length === cards.length &&
          t.cards.every((c: any, idx: number) => c?.id === cards[idx]?.id)
      );
      if (existingToday) {
        currentTempSpreadIdRef.current = existingToday.id;
      } else {
        recordDrawnSpreadToTemp(mode, cards, isCard2Reversed, isRitualCompleted, userIntentQuestion, hexagramPrediction, {
          isCard2AReversed,
          isCard2BReversed,
          menhBranchNumber,
        });
      }
    }
  }, []);

  const handleConfirmSaveSpread = useCallback((data: { question: string; prediction: string; answer: string }) => {
    if (data.question !== userIntentQuestion) {
      handleQuestionChange(data.question);
    }
    if (data.prediction !== hexagramPrediction) {
      handleHexagramPredictionChange(data.prediction);
    }
    if (data.answer !== userCustomAnswer) {
      handleCustomAnswerChange(data.answer);
    }

    const spreadTitle = SPREAD_MODE_NAMES[mode] || "Trận Pháp Kinh Dịch";
    saveSpreadItem({
      mode,
      spreadTitle,
      cards,
      isCard2Reversed: mode === "thap_tinh" ? isCard2Reversed : undefined,
      isCard2AReversed: mode === "thap_nhat" ? isCard2AReversed : undefined,
      isCard2BReversed: mode === "thap_nhat" ? isCard2BReversed : undefined,
      menhBranchNumber: mode === "thap_nhi" ? menhBranchNumber : undefined,
      question: data.question,
      hexagramPrediction: data.prediction,
      userAnswer: data.answer,
      isRitualCompleted,
    });

    // Quẻ này đã được nhấn lưu chính thức, gỡ khỏi danh sách quẻ tạm chưa lưu
    if (currentTempSpreadIdRef.current) {
      markTempSpreadAsSaved(currentTempSpreadIdRef.current);
    } else {
      markTempSpreadAsSaved(cards);
    }

    reloadSavedSpreads();
    reloadTempSpreads();
    setIsSaveDialogOpen(false);
    setCopiedToast("💾 Đã lưu quẻ (kèm câu hỏi, dự đoán & đáp án) thành công!");
    setTimeout(() => setCopiedToast(null), 3000);
  }, [mode, cards, isCard2Reversed, isCard2AReversed, isCard2BReversed, menhBranchNumber, isRitualCompleted, userIntentQuestion, hexagramPrediction, userCustomAnswer, handleQuestionChange, handleHexagramPredictionChange, handleCustomAnswerChange, reloadSavedSpreads, reloadTempSpreads]);

  const handleLoadSavedSpread = useCallback((item: SavedSpreadItem) => {
    const loadedMode = item.mode && SPREAD_MODES.includes(item.mode as SpreadMode) ? (item.mode as SpreadMode) : mode;
    setMode(loadedMode);
    const loadedMenh =
      typeof item.menhBranchNumber === "number" && item.menhBranchNumber >= 1 && item.menhBranchNumber <= 12
        ? item.menhBranchNumber
        : item.cards?.find((c: any) => c?.isMenhCung)?.branchNumber || menhBranchNumber;
    if (loadedMode === "thap_nhi") {
      setMenhBranchNumber(loadedMenh);
    }
    if (Array.isArray(item.cards) && item.cards.length > 0) {
      let loadedCards: DynamicCardItem[] =
        loadedMode === "thap_la" &&
        item.cards.length >= 2 &&
        item.cards[0]?.hexNumber !== undefined &&
        item.cards[0]?.hexNumber === item.cards[1]?.hexNumber
          ? item.cards.slice(0, 2)
          : item.cards;
      if (loadedMode === "thap_nhi") {
        loadedCards = applyTwelveHousesToCards(loadedCards, loadedMenh);
      } else if (loadedMode === "khong_minh") {
        loadedCards = applyKhongMinhToThreeCards(loadedCards);
      }
      setCards(loadedCards);
    }
    if (typeof item.isCard2Reversed === "boolean") {
      setIsCard2Reversed(item.isCard2Reversed);
    }
    if (typeof item.isCard2AReversed === "boolean") {
      setIsCard2AReversed(item.isCard2AReversed);
    }
    if (typeof item.isCard2BReversed === "boolean") {
      setIsCard2BReversed(item.isCard2BReversed);
    }
    if (typeof item.isRitualCompleted === "boolean") {
      setIsRitualCompleted(item.isRitualCompleted);
    }
    if (typeof item.question === "string") {
      handleQuestionChange(item.question);
    }
    if (typeof item.hexagramPrediction === "string") {
      handleHexagramPredictionChange(item.hexagramPrediction);
    }
    if (typeof item.userAnswer === "string") {
      handleCustomAnswerChange(item.userAnswer);
    }

    setIsKeepCards(true);
    setIsSavedSpreadsModalOpen(false);
    setCopiedToast(`📂 Đã mở quẻ: ${item.spreadTitle} (Đã giữ nguyên quẻ)`);
    setTimeout(() => setCopiedToast(null), 3500);

    setTimeout(() => {
      if (requestTickRef.current) requestTickRef.current();
      const sec = document.getElementById("destiny-cards");
      if (sec) {
        sec.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  }, [mode, menhBranchNumber, handleQuestionChange, handleHexagramPredictionChange, handleCustomAnswerChange]);

  const [showPhoneVideoMode, setShowPhoneVideoMode] = useState<boolean>(true);
  const getTodayDragonDateKey = useCallback(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }, []);
  const [dragonWakeState, setDragonWakeState] = useState<"sleeping" | "waking" | "awake">("awake");
  const isDragonSleeping = false;
  const [isDragonUnlocked, setIsDragonUnlocked] = useState<boolean>(true);
  const isDragonLocked = false;
  const dragonUnlockTimerRef = useRef<number | null>(null);
  const [dragonIdleAct, setDragonIdleAct] = useState<0 | 1 | 2 | 3 | 4 | 5 | 6 | 7>(0);
  const [dragonAutoFullAct, setDragonAutoFullAct] = useState<6 | 7>(6);
  const [isPlayingCopyFullClips, setIsPlayingCopyFullClips] = useState<boolean>(false);
  const [isDragonAutoCycle, setIsDragonAutoCycle] = useState<boolean>(false);
  const [isDragonSendingFinale, setIsDragonSendingFinale] = useState<boolean>(false);
  const dragonVideoRef = useRef<HTMLVideoElement | null>(null);

  /* ── Trạng thái Khung Chatbox, Bách Khoa 64 Quẻ, Blog Dịch Học & Video Thủy Mặc trong màn hình điện thoại Cửu Nhị Tiểu Long ── */
  const [phoneDisplayTab, setPhoneDisplayTab] = useState<"chat" | "bakh_khoa" | "blog" | "thuy_mac" | "stage">("chat");
  const [isExportingInkWashClip, setIsExportingInkWashClip] = useState<boolean>(false);
  const [inkWashWorkingAct, setInkWashWorkingAct] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [inkWashExportPercent, setInkWashExportPercent] = useState<number>(0);
  const [inkWashExportStage, setInkWashExportStage] = useState<string>(
    "Tiểu Long Cửu Nhị sẵn sàng xuất Video Thủy Mặc ngắn gọn trả lời trực tiếp câu hỏi từ quẻ"
  );
  const [conciseInkWashResult, setConciseInkWashResult] = useState<{
    question: string;
    hexagram_title: string;
    direct_answer: string;
    card_analyses: Array<{
      card_number: number;
      card_title: string;
      position_label: string;
      concise_analysis: string;
    }>;
    key_turning_point: string;
    final_verdict: string;
    seal_chars: string;
    video_url: string;
    video_ext: string;
    audio_url?: string;
    duration: number;
  } | null>(null);
  const [selectedPhoneHexNum, setSelectedPhoneHexNum] = useState<number>(() =>
    (mode === "khong_minh" ? cards[2]?.hexNumber : cards[0]?.hexNumber) || 1
  );
  const [selectedPhoneYaoNum, setSelectedPhoneYaoNum] = useState<number | null>(() =>
    mode === "khong_minh"
      ? cards[2]?.khongMinhLine || cards[2]?.yaoNumber || null
      : cards[0]?.yaoNumber || null
  );
  useEffect(() => {
    const primaryCard = mode === "khong_minh" ? cards[2] || cards[0] : cards[0];
    if (primaryCard?.hexNumber) {
      setSelectedPhoneHexNum(primaryCard.hexNumber);
      setSelectedPhoneYaoNum(primaryCard.khongMinhLine || primaryCard.yaoNumber || null);
    }
  }, [cards, mode]);
  const [isPhoneChatModalExpanded, setIsPhoneChatModalExpanded] = useState<boolean>(false);
  const [isPhoneMockupHighlighted, setIsPhoneMockupHighlighted] = useState<boolean>(false);
  const [phoneChatMessages, setPhoneChatMessages] = useState<
    Array<{
      id: string;
      role: "user" | "assistant";
      content: string;
      timestamp: string;
      poseBadge?: string;
      hexagramFocus?: string;
    }>
  >([]);
  const [phoneChatInput, setPhoneChatInput] = useState<string>("");
  const [isPhoneChatLoading, setIsPhoneChatLoading] = useState<boolean>(false);
  const [phoneChatAct, setPhoneChatAct] = useState<1 | 2 | 3 | 5 | null>(null);
  const [copiedChatMsgId, setCopiedChatMsgId] = useState<string | null>(null);
  const [phoneQuickQuestions, setPhoneQuickQuestions] = useState<string[]>([
    "✨ Luận giải quẻ đang trải",
    "📚 Phân tích sâu theo Bách Khoa 64 Quẻ & 384 Hào",
    "📕 Dòng chữ đỏ & Đại tượng khuyên gì?",
    "📰 Góc nhìn Blog Dịch Học & Tâm Lý Học?",
    "💼 Công việc & Tài lộc theo quẻ?",
    "❤️ Tình cảm & Nhân duyên?",
  ]);
  const phoneChatScrollRef = useRef<HTMLDivElement | null>(null);
  const phoneModalChatScrollRef = useRef<HTMLDivElement | null>(null);
  const phoneChatActTimerRef = useRef<number | null>(null);

  const triggerDragonFullAnimations = useCallback(() => {
    if (!isDragonUnlocked) return;
    setDragonWakeState("awake");
    setShowPhoneVideoMode(false);
    setDragonAutoFullAct(6);
    setIsPlayingCopyFullClips(true);
    if (dragonVideoRef.current) {
      dragonVideoRef.current.currentTime = 0;
      dragonVideoRef.current.play().catch(() => {});
    }
  }, [isDragonUnlocked]);

  const handleCopySavedSpreadForAI = useCallback(async (item: SavedSpreadItem) => {
    triggerDragonFullAnimations();
    const text = await formatSpreadForAI(
      item.cards,
      item.mode as SpreadMode,
      item.isCard2Reversed,
      item.isRitualCompleted,
      item.question,
      item.hexagramPrediction,
      item.userAnswer,
      {
        isCard2AReversed: item.isCard2AReversed,
        isCard2BReversed: item.isCard2BReversed,
        menhBranchNumber: item.menhBranchNumber,
      }
    );
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedToast(`📋 Đã chép quẻ "${item.spreadTitle}" (kèm câu hỏi & đáp án) cho AI!`);
      setTimeout(() => setCopiedToast(null), 3000);
    }
  }, [triggerDragonFullAnimations]);

  const handleLoadTempSpread = useCallback((item: TempSpreadItem) => {
    const loadedMode = item.mode && SPREAD_MODES.includes(item.mode as SpreadMode) ? (item.mode as SpreadMode) : mode;
    setMode(loadedMode);
    const loadedMenh =
      typeof item.menhBranchNumber === "number" && item.menhBranchNumber >= 1 && item.menhBranchNumber <= 12
        ? item.menhBranchNumber
        : item.cards?.find((c: any) => c?.isMenhCung)?.branchNumber || menhBranchNumber;
    if (loadedMode === "thap_nhi") {
      setMenhBranchNumber(loadedMenh);
    }
    if (Array.isArray(item.cards) && item.cards.length > 0) {
      let loadedCards: DynamicCardItem[] =
        loadedMode === "thap_la" &&
        item.cards.length >= 2 &&
        item.cards[0]?.hexNumber !== undefined &&
        item.cards[0]?.hexNumber === item.cards[1]?.hexNumber
          ? item.cards.slice(0, 2)
          : item.cards;
      if (loadedMode === "thap_nhi") {
        loadedCards = applyTwelveHousesToCards(loadedCards, loadedMenh);
      } else if (loadedMode === "khong_minh") {
        loadedCards = applyKhongMinhToThreeCards(loadedCards);
      }
      setCards(loadedCards);
    }
    if (typeof item.isCard2Reversed === "boolean") {
      setIsCard2Reversed(item.isCard2Reversed);
    }
    if (typeof item.isCard2AReversed === "boolean") {
      setIsCard2AReversed(item.isCard2AReversed);
    }
    if (typeof item.isCard2BReversed === "boolean") {
      setIsCard2BReversed(item.isCard2BReversed);
    }
    if (typeof item.isRitualCompleted === "boolean") {
      setIsRitualCompleted(item.isRitualCompleted);
    }
    if (typeof item.question === "string") {
      handleQuestionChange(item.question);
    }
    if (typeof item.hexagramPrediction === "string") {
      handleHexagramPredictionChange(item.hexagramPrediction);
    }
    if (typeof item.userAnswer === "string") {
      handleCustomAnswerChange(item.userAnswer);
    }

    currentTempSpreadIdRef.current = item.id;
    setIsKeepCards(true);
    setIsTempSpreadsModalOpen(false);
    setCopiedToast(`📂 Đã nạp quẻ tạm: ${item.spreadTitle} (Đã giữ nguyên quẻ)`);
    setTimeout(() => setCopiedToast(null), 3500);

    setTimeout(() => {
      if (requestTickRef.current) requestTickRef.current();
      const sec = document.getElementById("destiny-cards");
      if (sec) {
        sec.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  }, [mode, menhBranchNumber, handleQuestionChange, handleHexagramPredictionChange, handleCustomAnswerChange]);

  const handleSaveTempSpreadPermanently = useCallback((item: TempSpreadItem) => {
    saveSpreadItem({
      mode: item.mode,
      spreadTitle: item.spreadTitle,
      cards: item.cards,
      isCard2Reversed: item.isCard2Reversed,
      isCard2AReversed: item.isCard2AReversed,
      isCard2BReversed: item.isCard2BReversed,
      menhBranchNumber: item.menhBranchNumber,
      question: item.question,
      hexagramPrediction: item.hexagramPrediction,
      userAnswer: item.userAnswer,
      isRitualCompleted: item.isRitualCompleted,
    });
    markTempSpreadAsSaved(item.id);
    reloadSavedSpreads();
    reloadTempSpreads();
    setCopiedToast(`💾 Đã chuyển quẻ "${item.spreadTitle}" vào danh sách quẻ đã lưu chính thức!`);
    setTimeout(() => setCopiedToast(null), 3500);
  }, [reloadSavedSpreads, reloadTempSpreads]);

  const handleCopyTempSpreadForAI = useCallback(async (item: TempSpreadItem) => {
    triggerDragonFullAnimations();
    const text = await formatSpreadForAI(
      item.cards,
      item.mode as SpreadMode,
      item.isCard2Reversed,
      item.isRitualCompleted,
      item.question,
      item.hexagramPrediction,
      item.userAnswer,
      {
        isCard2AReversed: item.isCard2AReversed,
        isCard2BReversed: item.isCard2BReversed,
        menhBranchNumber: item.menhBranchNumber,
      }
    );
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedToast(`📋 Đã chép quẻ tạm "${item.spreadTitle}" cho AI!`);
      setTimeout(() => setCopiedToast(null), 3000);
    }
  }, [triggerDragonFullAnimations]);

  /* Trigger tick ref for recalculating physics */
  const requestTickRef = useRef<() => void>(() => {});
  const renderFullSpreadRef = useRef<() => void>(() => {});

  /* Card spread capture snapshot states */
  const [isCapturingSnapshot, setIsCapturingSnapshot] = useState(false);
  const [snapshotImageUrl, setSnapshotImageUrl] = useState<string | null>(null);
  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState(false);
  const directHomeCardImgsRef = useRef<string[]>([]);

  /* ══════════════════════════════════════════════════════════════════
     YILORE CARD SCROLL & TILT PHYSICS ENGINE (DYNAMIC MULTI-MODE)
     ══════════════════════════════════════════════════════════════════ */
  useEffect(() => {
    const layer = layerRef.current;
    const stage = stageRef.current;
    if (!layer || !stage) return;

    let curX = 0, curY = 0, curG = 0, curF = 0, curHero = 0, curOpacity = 1;
    let tgtX = 0, tgtY = 0, tgtG = 0, tgtF = 0, tgtHero = 0, tgtOpacity = 1;
    let isAnimating = false;
    let isInitialized = false;

    function calcTargets() {
      const scrollY = window.scrollY;
      const originX = window.innerWidth / 2;
      const originY = window.innerHeight / 2;
      const isDesktop = window.innerWidth >= 1024;

      let heroDocY = isDesktop ? window.innerHeight * 0.35 : window.innerHeight * 0.40;
      let destinyDocY = window.innerHeight * 1.45;
      let featuresDocY = window.innerHeight * 2.50;

      let heroStageX = isDesktop ? window.innerWidth * 0.25 : 0;
      let destinyStageX = 0;
      let featuresStageX = isDesktop ? window.innerWidth * 0.23 : 0;

      const hr = heroAnchorRef.current?.getBoundingClientRect();
      const dr = destinyAnchorRef.current?.getBoundingClientRect();
      const tr = destinyTitleRef.current?.getBoundingClientRect();
      const br = bridgeRef.current?.getBoundingClientRect();
      const cr = captionRef.current?.getBoundingClientRect();

      if (hr) {
        heroDocY = hr.top + scrollY + hr.height / 2;
        heroStageX = (hr.left + hr.width / 2) - originX;
        // Chệch bên góc phải trên desktop để các lá bài xòe quạt gọn gàng thông thoáng, hoàn toàn không che các nút bấm bên trái
        if (isDesktop) {
          heroStageX += Math.max(28, window.innerWidth * 0.03);
          // Nâng vị trí các lá bài ở Hero lên cao hơn để nhìn rõ trọn vẹn toàn bộ thân bài, không bị chìm hay cắt ở đáy màn hình
          const heroUpwardOffset = Math.min(150, Math.max(90, window.innerHeight * 0.16));
          heroDocY = Math.max(270, heroDocY - heroUpwardOffset);
        } else {
          // Trên mobile cũng nâng nhẹ lên cao hơn một chút để thấy rõ bài
          const mobileUpwardOffset = Math.min(65, Math.max(30, window.innerHeight * 0.08));
          heroDocY = Math.max(200, heroDocY - mobileUpwardOffset);
        }
      }
      if (dr) {
        destinyDocY = dr.top + scrollY + dr.height / 2;
        destinyStageX = (dr.left + dr.width / 2) - originX;
      }
      if (featuresAnchorRef.current) {
        const fr = featuresAnchorRef.current.getBoundingClientRect();
        featuresDocY = fr.top + scrollY + fr.height / 2;
        featuresStageX = (fr.left + fr.width / 2) - originX;
      }

      const s1 = Math.max(120, destinyDocY - originY);
      // Giữ cố định trên bàn trải bài cho đến khi cuộn qua dòng chú thích
      let s1_hold = s1 + 340;
      if (cr) {
        s1_hold = Math.max(s1 + 80, cr.top + scrollY - originY + 40);
      }

      const curHeroY = (heroDocY - scrollY) - originY;
      const curDestinyY = (destinyDocY - scrollY) - originY;

      // ── XÁC ĐỊNH VÙNG CHỮ ĐỂ TẠM ẨN BÀI ("bài đụng tới chỗ có chữ sẽ tạm ẩn") ──
      // 1. Độ trong suốt Hero:
      // Ở đầu trang (Hero), các lá bài hiển thị ở dáng quạt bên phải/dưới.
      // Khi người dùng bắt đầu cuộn xuống, bài đụng tới chỗ có chữ (cầu thủy mặc & tiêu đề): tạm ẩn bài đi.
      const cardHalfH = isDesktop ? 140 : 110;
      const heroCardBottomScreen = (heroDocY - scrollY) + cardHalfH;
      const textTopScreen = br ? br.top : (tr ? tr.top - 100 : window.innerHeight * 0.85);
      const distToText = textTopScreen - heroCardBottomScreen;

      let heroOpacity = 0;
      if (scrollY <= 30) {
        heroOpacity = 1;
      } else if (distToText > 140) {
        heroOpacity = 1;
      } else if (distToText > -20) {
        heroOpacity = Math.max(0, Math.min(1, (distToText + 20) / 160));
      } else {
        heroOpacity = 0;
      }

      if (scrollY >= 170) {
        heroOpacity = 0;
      }

      // 2. Độ trong suốt Trận Pháp ("xuống tới chỗ trống bên dưới đặt trận pháp full mới hiện ra lại"):
      // Khi cuộn qua hết khối chữ tiêu đề, tới khu vực vòng tròn Bát Quái / khoảng trống Bàn Trải Bài:
      const textBottomScreen = tr ? tr.bottom : (destinyDocY - scrollY - 260);
      const spreadCardTopScreen = curDestinyY + originY - cardHalfH;
      const spaceCleared = spreadCardTopScreen - textBottomScreen;

      let spreadOpacity = 0;
      if (scrollY > s1_hold) {
        // Cuộn qua dòng chú thích xuống dưới: mờ dần và ẩn
        const fadeOut = Math.max(0, Math.min(1, 1 - (scrollY - s1_hold) / 180));
        spreadOpacity = smoothstep(fadeOut);
      } else if (textBottomScreen <= window.innerHeight * 0.28 || spaceCleared >= 40 || scrollY >= s1 - 80) {
        // Đã vào trọn vẹn khoảng trống bên dưới đặt trận pháp
        spreadOpacity = 1;
      } else if (textBottomScreen <= window.innerHeight * 0.65 || spaceCleared >= -80 || scrollY >= s1 - 260) {
        // Đang tiến dần vào khoảng trống: hiện dần ra mượt mà
        const p1 = tr
          ? Math.max(0, Math.min(1, (window.innerHeight * 0.65 - textBottomScreen) / (window.innerHeight * 0.37)))
          : Math.max(0, Math.min(1, (scrollY - (s1 - 260)) / 180));
        spreadOpacity = smoothstep(p1);
      } else {
        // Đang ở đúng ngay chỗ có chữ: hoàn toàn tạm ẩn!
        spreadOpacity = 0;
      }

      // 3. Phân vùng điều khiển:
      const isTourCardsStep =
        typeof document !== "undefined" && document.body.classList.contains("cuunhi-tour-step-cards");
      const midScroll = (170 + Math.max(220, s1 - 260)) / 2;
      const isHeroDominant = !isTourCardsStep && scrollY < midScroll;

      if (isHeroDominant) {
        tgtOpacity = heroOpacity;
        tgtX = heroStageX;
        tgtY = curHeroY;
        tgtG = 0;
        tgtF = 0; // Dáng quạt bài gọn gàng ở Hero
        tgtHero = 1;
      } else {
        tgtOpacity = isTourCardsStep ? 1 : spreadOpacity;
        tgtX = destinyStageX;
        tgtY = curDestinyY;
        tgtG = 1;
        tgtF = 1; // Bung mở 100% TRẬN PHÁP FULL tại khoảng trống bên dưới
        tgtHero = 0;
      }
    }

    // Hàm tính tọa độ Dáng Quạt Bài (Fan) ở phần màu đen Hero
    function getFanCardTransform(idx: number, total: number, isMobile: boolean, factor: number) {
      if (total <= 1) {
        return { x: 0, y: 0, rot: 0, scale: isMobile ? 0.85 : 1.05, zIndex: 14 };
      }

      const m = (total - 1) / 2;
      const delta = idx - m;

      if (total === 2) {
        const stepX = (isMobile ? 24 : 36) * factor;
        return {
          x: delta * stepX,
          y: 4,
          rot: delta * 6,
          scale: isMobile ? 0.72 : 0.98,
          zIndex: 10 + idx,
        };
      }

      if (total === 3) {
        // 3 lá (Tam Tài: Thiên Thời, Địa Lợi, Nhân Hòa)
        // Dáng quạt thanh thoát, góc mở vừa vặn, lá giữa nhô cao trang nhã
        const stepX = (isMobile ? 32 : 46) * factor;
        const rotStep = 8.5; // -8.5° cho lá trái, 0° cho lá giữa, +8.5° cho lá phải
        const yArc = Math.abs(delta) * 8;
        const zIdx = idx === 1 ? 12 : idx === 2 ? 11 : 10;
        return {
          x: delta * stepX,
          y: yArc,
          rot: delta * rotStep,
          scale: isMobile ? 0.68 : 0.96,
          zIndex: zIdx,
        };
      }

      if (total <= 5) {
        // 4 hoặc 5 lá (Ngũ Hành)
        const stepX = (isMobile ? 24 : 34) * factor;
        const rotStep = 5.5;
        const yArc = Math.abs(delta) ** 1.5 * 3;
        const zIdx = 10 + Math.round(m - Math.abs(delta));
        return {
          x: delta * stepX,
          y: yArc,
          rot: delta * rotStep,
          scale: isMobile ? 0.58 : 0.90,
          zIndex: zIdx,
        };
      }

      // 6 lá trở lên (Thất Tinh, Thập Tinh, Tháp La)
      const maxHalfWidth = (isMobile ? 80 : 130) * factor;
      const stepX = maxHalfWidth / m;
      const maxHalfRot = 14;
      const rotStep = maxHalfRot / m;
      const yArc = (Math.abs(delta) / m) ** 1.8 * 14;
      const zIdx = 10 + idx;

      const baseScale = isMobile
        ? Math.max(0.44, 0.60 - total * 0.015)
        : Math.max(0.66, 0.88 - total * 0.018);

      return {
        x: delta * stepX,
        y: yArc,
        rot: delta * rotStep,
        scale: baseScale,
        zIndex: zIdx,
      };
    }

    // Hàm áp dụng transform kết hợp giữa Dáng Quạt (Hero) và Trận Pháp Trải Rộng (Destiny)
    function applySlotTransform(
      slot: HTMLDivElement | null,
      fan: { x: number; y: number; rot: number; scale: number; zIndex: number },
      dest: { x: number; y: number; rot: number; scale: number; zIndex: number },
      f: number,
      _heroF: number,
      _isPrimary: boolean
    ) {
      if (!slot) return;

      // Nội suy mượt mà giữa Dáng Quạt (Fan ở Hero) và Thế Bài Trải Rộng (Destiny Cards)
      const x = fan.x * (1 - f) + dest.x * f;
      const y = fan.y * (1 - f) + dest.y * f;
      const rot = fan.rot * (1 - f) + dest.rot * f;
      const sc = fan.scale * (1 - f) + dest.scale * f;
      const z = f > 0.5 ? dest.zIndex : fan.zIndex;
      const isHidden = layer?.style.visibility === "hidden" || parseFloat(layer?.style.opacity || "1") < 0.15 || f < 0.05;

      slot.style.pointerEvents = isHidden ? "none" : "auto";
      slot.style.transform = `perspective(1200px) translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z}px) rotate(${rot.toFixed(1)}deg) scale(${sc.toFixed(3)})`;
      slot.style.opacity = "1";
      slot.style.zIndex = z.toString();
    }

    function renderCards(sX: number, sY: number, g: number, f: number, heroF: number = 0) {
      if (stage) stage.style.transform = `translate3d(${sX.toFixed(2)}px, ${sY.toFixed(2)}px, 0)`;

      const w = window.innerWidth;
      const vh = window.innerHeight;
      const factor = w < 380 ? 0.52 : w < 480 ? 0.60 : w < 640 ? 0.72 : w < 900 ? 0.85 : w < 1200 ? 0.95 : 1.05;
      const slots = slotRefs.current;
      const cardCount = cards.length;

      // 0. Đảm bảo an toàn: Ẩn mọi slot thừa vượt quá số lượng lá bài hiện hành
      for (let i = cardCount; i < slots.length; i++) {
        const sl = slots[i];
        if (sl) {
          sl.style.opacity = "0";
          sl.style.pointerEvents = "none";
        }
      }

      if (mode === "thap_la") {
        // ── CHẾ ĐỘ: THÁP LA KINH DỊCH ──
        const yaoCount = cardCount - 2;

        if (w < 640) {
          // ── 1. ĐIỆN THOẠI THÔNG MINH (MOBILE: w < 640px) ──
          const scaleMob = yaoCount >= 5 ? 0.44 : yaoCount >= 3 ? 0.48 : 0.54;
          const scaleYaoMob = scaleMob * 0.96;

          // Hàng 1: Quẻ Chủ & Quẻ Biến
          const yTopMob = yaoCount === 0 ? 0 : yaoCount <= 2 ? -75 : -110;
          applySlotTransform(
            slots[0],
            getFanCardTransform(0, cardCount, true, factor),
            { x: -70, y: yTopMob, rot: 0, scale: scaleMob, zIndex: 22 },
            f, heroF, true
          );
          applySlotTransform(
            slots[1],
            getFanCardTransform(1, cardCount, true, factor),
            { x: 70, y: yTopMob, rot: 0, scale: scaleMob, zIndex: 21 },
            f, heroF, false
          );

          // Dải Hào Động bên dưới:
          if (yaoCount === 1) {
            applySlotTransform(
              slots[2],
              getFanCardTransform(2, cardCount, true, factor),
              { x: 0, y: 75, rot: 0, scale: scaleYaoMob, zIndex: 18 },
              f, heroF, false
            );
          } else if (yaoCount === 2) {
            applySlotTransform(
              slots[2],
              getFanCardTransform(2, cardCount, true, factor),
              { x: -70, y: 75, rot: 0, scale: scaleYaoMob, zIndex: 17 },
              f, heroF, false
            );
            applySlotTransform(
              slots[3],
              getFanCardTransform(3, cardCount, true, factor),
              { x: 70, y: 75, rot: 0, scale: scaleYaoMob, zIndex: 18 },
              f, heroF, false
            );
          } else if (yaoCount === 3) {
            const yYao = 65;
            const xStep3 = 96;
            for (let i = 0; i < 3; i++) {
              const sIdx = i + 2;
              const xPos = -xStep3 + i * xStep3;
              applySlotTransform(
                slots[sIdx],
                getFanCardTransform(sIdx, cardCount, true, factor),
                { x: xPos, y: yYao, rot: 0, scale: scaleYaoMob, zIndex: 15 + i },
                f, heroF, false
              );
            }
          } else if (yaoCount === 4) {
            const coords = [
              { x: -70, y: 15 },
              { x: 70, y: 15 },
              { x: -70, y: 135 },
              { x: 70, y: 135 }
            ];
            coords.forEach((pt, i) => {
              const sIdx = i + 2;
              applySlotTransform(
                slots[sIdx],
                getFanCardTransform(sIdx, cardCount, true, factor),
                { x: pt.x, y: pt.y, rot: 0, scale: scaleYaoMob, zIndex: 15 + i },
                f, heroF, false
              );
            });
          } else if (yaoCount === 5) {
            const xStep3 = 96;
            const coords = [
              { x: -xStep3, y: 10 },
              { x: 0, y: 10 },
              { x: xStep3, y: 10 },
              { x: -55, y: 125 },
              { x: 55, y: 125 }
            ];
            coords.forEach((pt, i) => {
              const sIdx = i + 2;
              applySlotTransform(
                slots[sIdx],
                getFanCardTransform(sIdx, cardCount, true, factor),
                { x: pt.x, y: pt.y, rot: 0, scale: scaleYaoMob, zIndex: 14 + i },
                f, heroF, false
              );
            });
          } else if (yaoCount === 6) {
            const xStep3 = 98;
            const coords = [
              { x: -xStep3, y: 5 },
              { x: 0, y: 5 },
              { x: xStep3, y: 5 },
              { x: -xStep3, y: 120 },
              { x: 0, y: 120 },
              { x: xStep3, y: 120 }
            ];
            coords.forEach((pt, i) => {
              const sIdx = i + 2;
              applySlotTransform(
                slots[sIdx],
                getFanCardTransform(sIdx, cardCount, true, factor),
                { x: pt.x, y: pt.y, rot: 0, scale: scaleYaoMob, zIndex: 14 + i },
                f, heroF, false
              );
            });
          }
        } else if (w < 1024) {
          // ── 2. MÁY TÍNH BẢNG (TABLET: 640px <= w < 1024px) ──
          const scaleTab = yaoCount >= 5 ? 0.58 : 0.65;
          const scaleYaoTab = scaleTab * 0.95;
          const cardWTab = 180 * scaleTab;
          const colStepTab = (cardWTab + 18);
          const topCols = 1 + (yaoCount <= 3 ? yaoCount : Math.min(3, Math.ceil(yaoCount / 2)));
          const startXTab = -((topCols - 1) * colStepTab) / 2;

          const cardHTab = (w >= 768 ? 288 : 272) * scaleTab;
          const distYTab = cardHTab + 52;
          const yTopTab = -distYTab / 2;
          const yBottomTab = distYTab / 2;
          const xCol0Tab = startXTab;

          // 1. Quẻ Chủ ở trên bên trái
          applySlotTransform(
            slots[0],
            getFanCardTransform(0, cardCount, false, factor),
            { x: xCol0Tab, y: yTopTab, rot: 0, scale: scaleTab, zIndex: 22 },
            f, heroF, true
          );
          // 2. Quẻ Biến ở dưới bên trái song song
          applySlotTransform(
            slots[1],
            getFanCardTransform(1, cardCount, false, factor),
            { x: xCol0Tab, y: yBottomTab, rot: 0, scale: scaleTab, zIndex: 21 },
            f, heroF, false
          );
          // 3. Các lá hào
          for (let i = 0; i < yaoCount; i++) {
            const sIdx = i + 2;
            let xYao = 0;
            let yYao = 0;
            if (yaoCount <= 3) {
              const col = i + 1;
              xYao = startXTab + col * colStepTab;
              yYao = yTopTab;
            } else {
              if (i < 3) {
                const col = i + 1;
                xYao = startXTab + col * colStepTab;
                yYao = yTopTab;
              } else {
                const col = (i - 3) + 1;
                xYao = startXTab + col * colStepTab;
                yYao = yBottomTab;
              }
            }
            applySlotTransform(
              slots[sIdx],
              getFanCardTransform(sIdx, cardCount, false, factor),
              { x: xYao, y: yYao, rot: 0, scale: scaleYaoTab, zIndex: 12 + i },
              f, heroF, false
            );
          }
        } else {
          // ── 3. MÁY TÍNH ĐỂ BÀN (DESKTOP: w >= 1024px) ──
          let baseScaleDesk = 0.82;
          if (yaoCount >= 5) {
            baseScaleDesk = 0.63;
          } else if (yaoCount >= 3) {
            baseScaleDesk = 0.72;
          } else {
            baseScaleDesk = 0.82;
          }

          if (w < 1050) baseScaleDesk *= 0.88;
          else if (w < 1250) baseScaleDesk *= 0.94;
          if (vh < 780) baseScaleDesk *= 0.88;

          const scaleHexDesk = Math.max(0.50, Math.min(0.85, baseScaleDesk));
          const scaleYaoDesk = scaleHexDesk * 0.95;

          const topYaoLimit = yaoCount <= 3 ? yaoCount : Math.ceil(yaoCount / 2);
          const totalCols = 1 + topYaoLimit;
          const cardWDesk = 192 * scaleHexDesk;
          const cardHDesk = 288 * scaleHexDesk;
          const colStep = (cardWDesk + 22) * factor;
          const startX = -((totalCols - 1) * colStep) / 2;

          const xCol0 = startX;
          const distYDesk = cardHDesk + 60;
          const yTop = -distYDesk / 2;
          const yBottom = distYDesk / 2;

          // 1. Quẻ Chủ ở trên
          applySlotTransform(
            slots[0],
            getFanCardTransform(0, cardCount, false, factor),
            { x: xCol0, y: yTop, rot: 0, scale: scaleHexDesk, zIndex: 22 },
            f, heroF, true
          );
          // 2. Quẻ Biến ở dưới song song
          applySlotTransform(
            slots[1],
            getFanCardTransform(1, cardCount, false, factor),
            { x: xCol0, y: yBottom, rot: 0, scale: scaleHexDesk, zIndex: 21 },
            f, heroF, false
          );
          // 3. Các lá hào
          for (let i = 0; i < yaoCount; i++) {
            const sIdx = i + 2;
            let xYao = 0;
            let yYao = 0;
            if (yaoCount <= 3) {
              const col = i + 1;
              xYao = startX + col * colStep;
              yYao = yTop;
            } else {
              if (i < topYaoLimit) {
                const col = i + 1;
                xYao = startX + col * colStep;
                yYao = yTop;
              } else {
                const col = (i - topYaoLimit) + 1;
                xYao = startX + col * colStep;
                yYao = yBottom;
              }
            }
            applySlotTransform(
              slots[sIdx],
              getFanCardTransform(sIdx, cardCount, false, factor),
              { x: xYao, y: yYao, rot: 0, scale: scaleYaoDesk, zIndex: 10 + i },
              f, heroF, false
            );
          }
        }
      } else if (mode === "that_tinh") {
        // ── CHẾ ĐỘ: TRẬN PHÁP THẤT TINH (7 LÁ CHU DỊCH BẮC ĐẨU) ──
        const isSmallScreen = w < 860;
        const mobScale7 = w < 380 ? 0.44 : w < 440 ? 0.48 : 0.54;
        const deskScale7 = w < 1000 ? 0.60 : w < 1200 ? 0.68 : w < 1440 ? 0.74 : 0.80;
        const scale7 = isSmallScreen ? mobScale7 : deskScale7;

        const stepX = isSmallScreen ? 102 * (scale7 / 0.50) : 185 * (scale7 / 0.74) * factor;
        const stepY = isSmallScreen ? 148 * (scale7 / 0.50) : 230 * (scale7 / 0.74) * factor;

        const posMap7: { x: number; y: number; z: number }[] = [
          { x: 0, y: stepY, z: 12 },          // 0: Lá 1 (Quá Khứ)
          { x: -stepX, y: 0, z: 14 },         // 1: Lá 2 (Bản Thân Hiện Tại)
          { x: 0, y: 0, z: 16 },              // 2: Lá 3 (Diễn Biến Tiếp Theo)
          { x: 0, y: -stepY, z: 15 },         // 3: Lá 4 (Lá Bài Gợi Ý)
          { x: stepX, y: 0, z: 14 },          // 4: Lá 5 (Kết Quả)
          { x: stepX, y: stepY, z: 12 },      // 5: Lá 6 (Môi Trường Bên Ngoài)
          { x: -stepX, y: stepY, z: 12 },     // 6: Lá 7 (Thiếu Sót Của Bản Thân)
        ];

        posMap7.forEach((p, idx) => {
          applySlotTransform(
            slots[idx],
            getFanCardTransform(idx, cardCount, isSmallScreen, factor),
            { x: p.x, y: p.y, rot: 0, scale: scale7, zIndex: p.z },
            f, heroF, idx === 2
          );
        });
      } else if (mode === "cuu_cung") {
        // ── CHẾ ĐỘ: TRẬN PHÁP CỬU CUNG (9 LÁ · PHI TINH LẠC THƯ 3×3: NAM TRÊN - BẮC DƯỚI - TRUNG CUNG Ở GIỮA) ──
        const isSmallScreen = w < 860;
        const mobScale9 = w < 380 ? 0.42 : w < 440 ? 0.46 : 0.52;
        const deskScale9 = w < 1000 ? 0.58 : w < 1200 ? 0.65 : w < 1440 ? 0.71 : 0.76;
        const scale9 = isSmallScreen ? mobScale9 : deskScale9;

        const stepX = isSmallScreen ? 102 * (scale9 / 0.50) : 185 * (scale9 / 0.72) * factor;
        const stepY = isSmallScreen ? 150 * (scale9 / 0.50) : 232 * (scale9 / 0.72) * factor;

        // Tọa độ Lạc Thư 3×3 theo đúng thứ tự rút 9 lá của NINE_PALACES_POSITIONS (Cung 5 -> 6 -> 7 -> 8 -> 9 -> 1 -> 2 -> 3 -> 4):
        // Hàng 1 (Phía Nam, y = -stepY): Đông Nam Tốn 4 (idx 8, x = -stepX) | Chính Nam Ly 9 (idx 4, x = 0) | Tây Nam Khôn 2 (idx 6, x = +stepX)
        // Hàng 2 (Trục Ngang, y = 0):    Chính Đông Chấn 3 (idx 7, x = -stepX) | ★ Trung Cung 5 (idx 0, x = 0) | Chính Tây Đoài 7 (idx 2, x = +stepX)
        // Hàng 3 (Phía Bắc, y = +stepY): Đông Bắc Cấn 8 (idx 3, x = -stepX) | Chính Bắc Khảm 1 (idx 5, x = 0) | Tây Bắc Càn 6 (idx 1, x = +stepX)
        const posMap9: { x: number; y: number; z: number }[] = [
          { x: 0, y: 0, z: 18 },              // 0: Lá 1 (★ Cung 5 • Trung Cung - Trọng Tâm)
          { x: stepX, y: stepY, z: 12 },      // 1: Lá 2 (Cung 6 • Càn Tây Bắc)
          { x: stepX, y: 0, z: 14 },          // 2: Lá 3 (Cung 7 • Đoài Chính Tây)
          { x: -stepX, y: stepY, z: 12 },     // 3: Lá 4 (Cung 8 • Cấn Đông Bắc)
          { x: 0, y: -stepY, z: 15 },         // 4: Lá 5 (Cung 9 • Ly Chính Nam)
          { x: 0, y: stepY, z: 13 },          // 5: Lá 6 (Cung 1 • Khảm Chính Bắc)
          { x: stepX, y: -stepY, z: 14 },     // 6: Lá 7 (Cung 2 • Khôn Tây Nam)
          { x: -stepX, y: 0, z: 14 },         // 7: Lá 8 (Cung 3 • Chấn Chính Đông)
          { x: -stepX, y: -stepY, z: 14 },    // 8: Lá 9 (Cung 4 • Tốn Đông Nam)
        ];

        posMap9.forEach((p, idx) => {
          applySlotTransform(
            slots[idx],
            getFanCardTransform(idx, cardCount, isSmallScreen, factor),
            { x: p.x, y: p.y, rot: 0, scale: scale9, zIndex: p.z },
            f, heroF, idx === 0
          );
        });
      } else if (mode === "thap_tinh") {
        // ── CHẾ ĐỘ: TRẬN PHÁP THẬP TINH (10 LÁ DỊCH LÝ) ──
        const isSmallScreen = w < 860;
        const mobScale10 = w < 380 ? 0.35 : w < 440 ? 0.39 : 0.43;
        const deskScale10 = w < 1000 ? 0.52 : w < 1200 ? 0.58 : w < 1440 ? 0.63 : 0.68;
        const scale10 = isSmallScreen ? mobScale10 : deskScale10;

        const stepX = isSmallScreen
          ? (w < 380 ? 56 : w < 440 ? 62 : 68) : (w < 1000 ? 132 : w < 1200 ? 146 : w < 1440 ? 160 : 172) * factor;
        const stepY = isSmallScreen
          ? (w < 380 ? 112 : w < 440 ? 122 : 134) : (w < 1000 ? 190 : w < 1200 ? 212 : w < 1440 ? 228 : 242) * factor;

        const midAnchor = isSmallScreen ? 14 : 26;
        const col1X = midAnchor - stepX * 2.22;  // Lá 10
        const col2X = midAnchor - stepX * 1.15;  // Lá 7, 8, 9
        const card2X = midAnchor - stepX * 0.12; // Lá 2
        const card1X = midAnchor + stepX * 0.88; // Lá 1
        const col5X = midAnchor + stepX * 1.88;  // Lá 5, 6

        const posMap10: { x: number; y: number; z: number; rot?: number }[] = [
          { x: card1X, y: 0, z: 15, rot: 0 },                       // 0: Lá 1
          { x: card2X, y: 0, z: 16, rot: 0 },                       // 1: Lá 2
          { x: card1X, y: stepY, z: 14, rot: 0 },                   // 2: Lá 3
          { x: card1X, y: -stepY, z: 14, rot: 0 },                  // 3: Lá 4
          { x: col5X, y: -stepY * 0.58, z: 13, rot: 0 },            // 4: Lá 5
          { x: col5X, y: stepY * 0.58, z: 13, rot: 0 },             // 5: Lá 6
          { x: col2X, y: -stepY, z: 13, rot: 0 },                    // 6: Lá 7
          { x: col2X, y: 0, z: 13, rot: 0 },                         // 7: Lá 8
          { x: col2X, y: stepY, z: 13, rot: 0 },                     // 8: Lá 9
          { x: col1X, y: 0, z: 14, rot: 0 },                        // 9: Lá 10
        ];

        posMap10.forEach((p, idx) => {
          applySlotTransform(
            slots[idx],
            getFanCardTransform(idx, cardCount, isSmallScreen, factor),
            { x: p.x, y: p.y, rot: p.rot || 0, scale: scale10, zIndex: p.z },
            f, heroF, idx === 0
          );
        });
      } else if (mode === "thap_nhat") {
        // ── CHẾ ĐỘ: TRẬN PHÁP THẬP TINH MỞ RỘNG (11 LÁ DỊCH LÝ: LÁ 2 TÁCH THÀNH 2A BỔ TRỢ & 2B THÁCH THỨC) ──
        const isSmallScreen = w < 860;
        const mobScale11 = w < 380 ? 0.34 : w < 440 ? 0.38 : w < 640 ? 0.42 : 0.46;
        const deskScale11 = w < 1000 ? 0.50 : w < 1200 ? 0.56 : w < 1440 ? 0.61 : 0.66;
        const scale11 = isSmallScreen ? mobScale11 : deskScale11;

        const stepX = isSmallScreen
          ? (w < 380 ? 56 : w < 440 ? 62 : w < 640 ? 70 : 104)
          : (w < 1000 ? 132 : w < 1200 ? 146 : w < 1440 ? 160 : 172) * factor;
        const stepY = isSmallScreen
          ? (w < 380 ? 114 : w < 440 ? 124 : w < 640 ? 136 : 168)
          : (w < 1000 ? 192 : w < 1200 ? 214 : w < 1440 ? 230 : 246) * factor;

        const midAnchor = isSmallScreen ? 14 : 26;
        const col1X = midAnchor - stepX * 2.22;  // Lá 10 (idx 10)
        const col2X = midAnchor - stepX * 1.15;  // Lá 7, 8, 9 (idx 7, 8, 9)
        const card2X = midAnchor - stepX * 0.12; // Cột Lá 2A & 2B (idx 1, 2)
        const card1X = midAnchor + stepX * 0.88; // Lá 1, 3, 4 (idx 0, 3, 4)
        const col5X = midAnchor + stepX * 1.88;  // Lá 5, 6 (idx 5, 6)

        const posMap11: { x: number; y: number; z: number; rot?: number }[] = [
          { x: card1X, y: 0, z: 15, rot: 0 },                       // 0: Lá 1 (Tình Huống Hiện Tại)
          { x: card2X, y: -stepY * 0.58, z: 16, rot: 0 },           // 1: Lá 2A (Bổ Trợ Tích Cực)
          { x: card2X, y: stepY * 0.58, z: 16, rot: 0 },            // 2: Lá 2B (Thách Thức Trở Ngại)
          { x: card1X, y: stepY, z: 14, rot: 0 },                   // 3: Lá 3 (Nền Tảng Tiềm Thức)
          { x: card1X, y: -stepY, z: 14, rot: 0 },                  // 4: Lá 4 (Mục Tiêu Ý Thức)
          { x: col5X, y: -stepY * 0.58, z: 13, rot: 0 },            // 5: Lá 5 (Quá Khứ Gần)
          { x: col5X, y: stepY * 0.58, z: 13, rot: 0 },             // 6: Lá 6 (Tương Lai Gần)
          { x: col2X, y: -stepY, z: 13, rot: 0 },                   // 7: Lá 7 (Thái Độ Bản Thân)
          { x: col2X, y: 0, z: 13, rot: 0 },                        // 8: Lá 8 (Môi Trường Bên Ngoài)
          { x: col2X, y: stepY, z: 13, rot: 0 },                    // 9: Lá 9 (Hy Vọng & Nỗi Sợ)
          { x: col1X, y: 0, z: 14, rot: 0 },                        // 10: Lá 10 (Lá Bài Khuyên Bảo)
        ];

        posMap11.forEach((p, idx) => {
          applySlotTransform(
            slots[idx],
            getFanCardTransform(idx, cardCount, isSmallScreen, factor),
            { x: p.x, y: p.y, rot: p.rot || 0, scale: scale11, zIndex: p.z },
            f, heroF, idx === 0
          );
        });
      } else if (mode === "thap_nhi") {
        // ── CHẾ ĐỘ: TRẬN PHÁP THẬP NHỊ CUNG (12 LÁ THIÊN BÀN TỬ VI 4×4 QUANH TÂM BÁT QUÁI) ──
        const isSmallScreen = w < 860;
        const scale12 =
          w < 380
            ? 0.34
            : w < 440
            ? 0.38
            : w < 640
            ? 0.42
            : w < 860
            ? 0.43
            : w < 1000
            ? 0.46
            : w < 1200
            ? 0.50
            : w < 1440
            ? 0.54
            : 0.58;

        const stepX12 =
          w < 380
            ? 78
            : w < 440
            ? 88
            : w < 640
            ? 104
            : w < 860
            ? 142
            : w < 1000
            ? 162
            : w < 1200
            ? 182
            : w < 1440
            ? 198
            : 214;

        const stepY12 =
          w < 380
            ? 112
            : w < 440
            ? 124
            : w < 640
            ? 136
            : w < 860
            ? 154
            : w < 1000
            ? 168
            : w < 1200
            ? 180
            : w < 1440
            ? 192
            : 204;

        TWELVE_BRANCHES_DATA.forEach((branch, idx) => {
          const x = (branch.gridCol - 2.5) * stepX12;
          const y = (branch.gridRow - 2.5) * stepY12;
          const isMenh = cards[idx]?.isMenhCung || branch.number === menhBranchNumber;
          applySlotTransform(
            slots[idx],
            getFanCardTransform(idx, cardCount, isSmallScreen, factor),
            { x, y, rot: 0, scale: scale12, zIndex: isMenh ? 20 : 12 + branch.gridRow },
            f,
            heroF,
            Boolean(isMenh)
          );
        });
      } else if (cardCount === 5 || mode === "3_to_5") {
        // ── CHẾ ĐỘ: 5 LÁ (NGŨ HÀNH) ──
        const isSmallScreen = w < 860;
        const mobFactor = w < 380 ? 0.76 : w < 440 ? 0.88 : 1.0;
        const mobScale = w < 380 ? 0.70 : w < 440 ? 0.76 : 0.82;

        if (isSmallScreen) {
          applySlotTransform(
            slots[0],
            getFanCardTransform(0, cardCount, true, factor),
            { x: -115 * mobFactor, y: -82, rot: -4.5, scale: mobScale, zIndex: 8 },
            f, heroF, false
          );
          applySlotTransform(
            slots[1],
            getFanCardTransform(1, cardCount, true, factor),
            { x: 0, y: -88, rot: 0, scale: mobScale, zIndex: 10 },
            f, heroF, false
          );
          applySlotTransform(
            slots[2],
            getFanCardTransform(2, cardCount, true, factor),
            { x: 115 * mobFactor, y: -82, rot: 4.5, scale: mobScale, zIndex: 14 },
            f, heroF, true
          );
          applySlotTransform(
            slots[3],
            getFanCardTransform(3, cardCount, true, factor),
            { x: -65 * mobFactor, y: 105, rot: -3, scale: mobScale, zIndex: 9 },
            f, heroF, false
          );
          applySlotTransform(
            slots[4],
            getFanCardTransform(4, cardCount, true, factor),
            { x: 65 * mobFactor, y: 105, rot: 3, scale: mobScale, zIndex: 9 },
            f, heroF, false
          );
        } else {
          const scale5Desk = w < 1000 ? 0.74 : w < 1200 ? 0.82 : w < 1440 ? 0.90 : 0.98;
          const col5Step = 220 * (scale5Desk / 0.98) * factor;

          applySlotTransform(
            slots[0],
            getFanCardTransform(0, cardCount, false, factor),
            { x: -col5Step * 2, y: 8, rot: -7, scale: scale5Desk, zIndex: 8 },
            f, heroF, false
          );
          applySlotTransform(
            slots[1],
            getFanCardTransform(1, cardCount, false, factor),
            { x: -col5Step, y: 3, rot: -3.5, scale: scale5Desk, zIndex: 10 },
            f, heroF, false
          );
          applySlotTransform(
            slots[2],
            getFanCardTransform(2, cardCount, false, factor),
            { x: 0, y: 0, rot: 0, scale: scale5Desk, zIndex: 14 },
            f, heroF, true
          );
          applySlotTransform(
            slots[3],
            getFanCardTransform(3, cardCount, false, factor),
            { x: col5Step, y: 3, rot: 3.5, scale: scale5Desk, zIndex: 10 },
            f, heroF, false
          );
          applySlotTransform(
            slots[4],
            getFanCardTransform(4, cardCount, false, factor),
            { x: col5Step * 2, y: 8, rot: 7, scale: scale5Desk, zIndex: 8 },
            f, heroF, false
          );
        }
      } else if (cardCount === 3 || mode === "1_to_3" || mode === "khong_minh") {
        // ── CHẾ ĐỘ: 3 LÁ (TAM TÀI / QUẺ KHỔNG MINH) ──
        const isKM = mode === "khong_minh";
        applySlotTransform(
          slots[0],
          getFanCardTransform(0, 3, w < 640, factor),
          { x: -340 * factor, y: 3, rot: -4.5, scale: 1.02, zIndex: 10 },
          f, heroF, false
        );
        applySlotTransform(
          slots[1],
          getFanCardTransform(1, 3, w < 640, factor),
          { x: 0, y: 0, rot: 0, scale: isKM ? 1.04 : 1.08, zIndex: isKM ? 12 : 14 },
          f, heroF, !isKM
        );
        applySlotTransform(
          slots[2],
          getFanCardTransform(2, 3, w < 640, factor),
          { x: 340 * factor, y: isKM ? -4 : 3, rot: isKM ? 0 : 4.5, scale: isKM ? 1.08 : 1.02, zIndex: isKM ? 16 : 10 },
          f, heroF, isKM
        );
      } else if (cardCount === 2 || mode === "1_to_2") {
        // ── CHẾ ĐỘ: 2 LÁ (ÂM DƯƠNG) ──
        applySlotTransform(
          slots[0],
          getFanCardTransform(0, 2, w < 640, factor),
          { x: -220 * factor, y: 0, rot: -3, scale: 1.05, zIndex: 10 },
          f, heroF, false
        );
        applySlotTransform(
          slots[1],
          getFanCardTransform(1, 2, w < 640, factor),
          { x: 220 * factor, y: 0, rot: 3, scale: 1.05, zIndex: 14 },
          f, heroF, true
        );
      } else {
        // ── CHẾ ĐỘ: 1 LÁ DUY NHẤT (ĐƠN QUẺ CHÍ TÔN) ──
        applySlotTransform(
          slots[0],
          getFanCardTransform(0, 1, w < 640, factor),
          { x: 0, y: 0, rot: 0, scale: 1.15, zIndex: 14 },
          f, heroF, true
        );
      }
    }

    function tick() {
      const dx = tgtX - curX;
      const dy = tgtY - curY;
      const dg = tgtG - curG;
      const df = tgtF - curF;
      const dh = tgtHero - curHero;
      const dop = tgtOpacity - curOpacity;

      curX += dx * 0.20;
      curY += dy * 0.20;
      curG += dg * 0.18;
      curF += df * 0.16;
      curHero += dh * 0.16;
      curOpacity += dop * 0.22;

      renderCards(curX, curY, curG, curF, curHero);
      if (layer) {
        layer.style.opacity = curOpacity.toFixed(3);
        layer.style.visibility = curOpacity <= 0.01 ? "hidden" : "visible";
        layer.style.pointerEvents = "none";
      }

      if (
        Math.abs(dx) > 0.1 ||
        Math.abs(dy) > 0.1 ||
        Math.abs(dg) > 0.005 ||
        Math.abs(df) > 0.005 ||
        Math.abs(dh) > 0.005 ||
        Math.abs(dop) > 0.005
      ) {
        requestAnimationFrame(tick);
      } else {
        curX = tgtX;
        curY = tgtY;
        curG = tgtG;
        curF = tgtF;
        curHero = tgtHero;
        curOpacity = tgtOpacity;
        renderCards(curX, curY, curG, curF, curHero);
        if (layer) {
          layer.style.opacity = curOpacity.toFixed(3);
          layer.style.visibility = curOpacity <= 0.01 ? "hidden" : "visible";
          layer.style.pointerEvents = "none";
        }
        isAnimating = false;
      }
    }

    function requestTick() {
      calcTargets();
      if (!isInitialized) {
        isInitialized = true;
        curX = tgtX;
        curY = tgtY;
        curG = tgtG;
        curF = tgtF;
        curHero = tgtHero;
        curOpacity = tgtOpacity;
        renderCards(curX, curY, curG, curF, curHero);
        if (layer) {
          layer.style.opacity = curOpacity.toFixed(3);
          layer.style.visibility = curOpacity <= 0.01 ? "hidden" : "visible";
          layer.style.pointerEvents = "none";
        }
        return;
      }
      if (!isAnimating) {
        isAnimating = true;
        requestAnimationFrame(tick);
      }
    }

    requestTickRef.current = requestTick;
    renderFullSpreadRef.current = () => {
      curOpacity = 1;
      tgtOpacity = 1;
      curF = 1;
      tgtF = 1;
      curHero = 0;
      tgtHero = 0;
      if (layer) {
        layer.style.opacity = "1";
        layer.style.visibility = "visible";
        layer.style.pointerEvents = "none";
      }
      renderCards(0, 0, 0, 1, 0);
    };
    window.addEventListener("scroll", requestTick, { passive: true });
    window.addEventListener("resize", requestTick, { passive: true });
    requestTick();

    return () => {
      window.removeEventListener("scroll", requestTick);
      window.removeEventListener("resize", requestTick);
    };
  }, [mode, cards, isCard2Reversed, isCard2AReversed, isCard2BReversed, menhBranchNumber]);

  useEffect(() => {
    if (requestTickRef.current) {
      requestTickRef.current();
    }
  }, [isCard2Reversed, isCard2AReversed, isCard2BReversed, menhBranchNumber]);

  /* Đồng bộ thẻ bài đang mở trong Modal nếu danh sách cards được cập nhật (ví dụ khi gieo lại Cung Mệnh) */
  useEffect(() => {
    if (!selectedCard) return;
    const updated = cards.find((c) => c.id === selectedCard.id);
    if (updated && updated !== selectedCard) {
      setSelectedCard(updated);
    }
  }, [cards, selectedCard]);

  /* ── Switch Mode Handler ── */
  const handleSwitchMode = (newMode: SpreadMode, isRitual: boolean = false) => {
    if (isKeepCards && newMode === mode) {
      setIsRitualCompleted(isRitual);
      return;
    }
    setIsRitualCompleted(isRitual);
    setMode(newMode);
    let rev: boolean | undefined = undefined;
    let rev2A: boolean | undefined = isCard2AReversed;
    let rev2B: boolean | undefined = isCard2BReversed;
    let nextMenh: number = menhBranchNumber;
    if (newMode === "thap_tinh") {
      rev = Math.random() < 0.5;
      setIsCard2Reversed(rev);
    } else if (newMode === "thap_nhat") {
      rev2A = Math.random() < 0.5;
      rev2B = Math.random() < 0.5;
      setIsCard2AReversed(rev2A);
      setIsCard2BReversed(rev2B);
    } else if (newMode === "thap_nhi") {
      nextMenh = rollRandomMenhBranch();
      setMenhBranchNumber(nextMenh);
    }
    const newCards = drawCardsForMode(newMode, nextMenh);
    setCards(newCards);
    recordDrawnSpreadToTemp(newMode, newCards, rev, isRitual, undefined, undefined, {
      isCard2AReversed: rev2A,
      isCard2BReversed: rev2B,
      menhBranchNumber: nextMenh,
    });
    setTimeout(() => {
      requestTickRef.current();
    }, 50);
  };

  /* ── Shuffle Cards (Rút bài ngẫu nhiên mới từ 384 hào & 64 quẻ) ── */
  const handleShuffleCards = useCallback((isRitual: boolean = false) => {
    setIsRitualCompleted(isRitual);
    let rev: boolean | undefined = isCard2Reversed;
    let rev2A: boolean | undefined = isCard2AReversed;
    let rev2B: boolean | undefined = isCard2BReversed;
    let nextMenh: number = menhBranchNumber;
    if (mode === "thap_tinh") {
      rev = Math.random() < 0.5;
      setIsCard2Reversed(rev);
    } else if (mode === "thap_nhat") {
      rev2A = Math.random() < 0.5;
      rev2B = Math.random() < 0.5;
      setIsCard2AReversed(rev2A);
      setIsCard2BReversed(rev2B);
    } else if (mode === "thap_nhi") {
      nextMenh = rollRandomMenhBranch();
      setMenhBranchNumber(nextMenh);
    }
    const newCards = drawCardsForMode(mode, nextMenh);
    setCards(newCards);
    recordDrawnSpreadToTemp(mode, newCards, rev, isRitual, undefined, undefined, {
      isCard2AReversed: rev2A,
      isCard2BReversed: rev2B,
      menhBranchNumber: nextMenh,
    });
    setTimeout(() => {
      requestTickRef.current();
    }, 50);
  }, [mode, isCard2Reversed, isCard2AReversed, isCard2BReversed, menhBranchNumber, recordDrawnSpreadToTemp]);

  const handleShuffleCardsAndScroll = useCallback((isRitual: boolean = false) => {
    handleShuffleCards(isRitual);
  }, [handleShuffleCards]);

  /* ── Sao chép toàn bộ trải bài cho AI (Đầy đủ thông tin từ Hexagram & Bách khoa) ── */
  const handleCopyCardsForAI = useCallback(async () => {
    if (isDragonLocked) {
      setCopiedToast("🔒 Cửu Nhị Tiểu Long còn đang ngủ! Hãy bấm nút “Gọi Cửu Nhị Tiểu Long Dậy” và chờ 5 giây để mở khóa.");
      setTimeout(() => setCopiedToast(null), 3500);
      return;
    }
    triggerDragonFullAnimations();
    const hasQuestion = !!userIntentQuestion.trim();
    const hasPrediction = !!hexagramPrediction.trim();
    const hasAnswer = !!userCustomAnswer.trim();
    if (isRitualCompleted) {
      setCopiedToast("✨ Đang trích xuất 100% Bách Khoa Toàn Thư Kinh Dịch (Cửu Nhị Luận Giải & FAQ) cho AI...");
    } else {
      setCopiedToast("Đang chuẩn bị dữ liệu quẻ & luận giải tiêu chuẩn cho AI...");
    }
    const text = await formatSpreadForAI(
      cards,
      mode,
      isCard2Reversed,
      isRitualCompleted,
      userIntentQuestion,
      hexagramPrediction,
      userCustomAnswer,
      { isCard2AReversed, isCard2BReversed, menhBranchNumber }
    );
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedAI(true);
      if (hasQuestion) {
        setHasCopiedWithQuestion(true);
      }
      const suffix = (hasQuestion && hasAnswer)
        ? " (kèm Câu hỏi & Đáp án)"
        : hasQuestion
        ? " (kèm Câu hỏi)"
        : hasAnswer
        ? " (kèm Đáp án)"
        : "";
      if (isRitualCompleted) {
        setCopiedToast(
          `✨ Đã sao chép 100% Bách Khoa Toàn Thư${suffix} cho AI!`
        );
      } else {
        setCopiedToast(
          `Đã chép thông tin các lá bài${suffix} cho AI!`
        );
      }
      setTimeout(() => setCopiedAI(false), 2500);
      setTimeout(() => setCopiedToast(null), 3500);
    }
  }, [isDragonLocked, cards, mode, isCard2Reversed, isCard2AReversed, isCard2BReversed, menhBranchNumber, isRitualCompleted, userIntentQuestion, hexagramPrediction, userCustomAnswer, triggerDragonFullAnimations]);

  /* ── Sao chép 1 lá bài đơn lẻ cho AI (Thông tin cơ bản hoặc 100% bách khoa khi đắc pháp) ── */
  const handleCopySingleCardForAI = useCallback(async (card: DynamicCardItem) => {
    triggerDragonFullAnimations();
    const cleanedQuestion = userIntentQuestion.trim();
    const questionHeader = cleanedQuestion
      ? `【NỘI DUNG TÂM NIỆM / CÂU HỎI CỦA ĐƯƠNG SỐ】:\n"${cleanedQuestion}"\n\n`
      : "";
    const questionInstruction = cleanedQuestion
      ? `▶ Trọng tâm giải đáp: Soi chiếu và trả lời trực diện câu hỏi/tâm niệm: "${cleanedQuestion}"\n`
      : "";

    if (!isRitualCompleted) {
      const text = `【THÔNG TIN LÁ BÀI KINH DỊCH】
${questionHeader}• Quẻ tượng: ${card.symbol}
• Tên: ${card.name}
• Ý nghĩa: ${card.sub}
• Lời giải: ${card.desc}

========================================
[YÊU CẦU LUẬN GIẢI CHO AI]:
${questionInstruction}Xin hãy phân tích chi tiết lá bài Kinh Dịch trên:
1. Ý nghĩa biểu tượng quẻ tượng và tên quẻ/hào.
2. Hoàn cảnh thực tế mà quẻ/hào này đang phản ánh.
3. Lời khuyên định hướng và hành động thấu đáo nhất.${cleanedQuestion ? `\n4. Đưa ra câu trả lời trực tiếp cho câu hỏi tâm niệm trên.` : ""}`;

      const ok = await copyToClipboard(text);
      if (ok) {
        setCopiedSingle(true);
        setCopiedToast(
          cleanedQuestion
            ? `Đã sao chép lá bài ${card.name} (kèm Câu hỏi tâm niệm) cho AI!`
            : `Đã sao chép thông tin lá bài ${card.name} cho AI!`
        );
        setTimeout(() => setCopiedSingle(false), 2200);
        setTimeout(() => setCopiedToast(null), 3200);
      }
      return;
    }

    setCopiedToast(`✨ Đang trích xuất 100% bách khoa toàn thư cho lá bài ${card.name}...`);
    const article = await fetchCardArticleSections(card);
    const cardInfoLines = formatCardFullInfoFromHexagram(card, `LÁ BÀI KINH DỊCH: ${card.name}`, undefined, article);
    const isSingleYao = card.type === "yao" && Boolean(card.yaoNumber);
    const text = `=== THÔNG TIN 100% BÁCH KHOA TOÀN THƯ (ĐẮC PHÁP KÍNH THIÊN • ĐỊA • NHÂN) LÁ BÀI KINH DỊCH ===
${questionHeader}${cardInfoLines.join("\n")}

========================================
[YÊU CẦU LUẬN GIẢI CHO AI]:
${questionInstruction}Xin hãy phân tích chi tiết và sâu sắc lá bài Kinh Dịch trên:
1. Ý nghĩa biểu tượng quẻ tượng, tên ${isSingleYao ? "quẻ/hào" : "quẻ"}, cấu tạo Thượng Hạ quái và Ngũ hành khí số.
2. Hoàn cảnh thực tế, thuận lợi tiềm tàng và thách thức mà ${isSingleYao ? "quẻ/hào" : "quẻ"} này đang phản ánh (kết hợp dữ liệu ${isSingleYao ? "Tổng Quan Hào Vị" : "Tổng Quan Quẻ Tượng"}, Cửu Nhị Luận Giải, Chiêm Đoán Giải Quẻ 4 phương diện và Câu Hỏi Thường Gặp FAQ).
3. Trọng tâm hành động và lời khuyên định hướng thấu đáo nhất theo đạo Dịch để đón cát tránh hung.${cleanedQuestion ? `\n4. Đúc kết lời giải đáp sáng suốt nhất cho câu hỏi tâm niệm trên.` : ""}`;

    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedSingle(true);
      setCopiedToast(
        cleanedQuestion
          ? `✨ Đã sao chép 100% Bách Khoa lá ${card.name} (kèm Câu hỏi tâm niệm) cho AI!`
          : `✨ Đã sao chép 100% bách khoa toàn thư lá bài ${card.name} cho AI!`
      );
      setTimeout(() => setCopiedSingle(false), 2200);
      setTimeout(() => setCopiedToast(null), 3200);
    }
  }, [isRitualCompleted, userIntentQuestion, triggerDragonFullAnimations]);

  /* ── Chụp hình tự động căn trọn vẹn toàn bộ các lá bài đang trải trận ── */
  const handleCaptureCardsSnapshot = useCallback(async (opts?: { silent?: boolean } | React.MouseEvent): Promise<string | null> => {
    const isSilent = Boolean(opts && typeof opts === "object" && "silent" in opts && opts.silent);
    if (isCapturingSnapshot && !isSilent) return null;
    if (!isSilent) {
      setIsCapturingSnapshot(true);
    }

    try {
      // 1. Force các lá bài bung mở toàn phần ở chế độ xòe rộng (f = 1, sX = 0, sY = 0)
      if (renderFullSpreadRef.current) {
        renderFullSpreadRef.current();
      }

      // Đợi 1 frame để trình duyệt áp dụng styles transform lên DOM
      await new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 60)));

      const stage = stageRef.current;
      if (!stage) {
        throw new Error("Không tìm thấy khung bài để chụp");
      }

      const stageRect = stage.getBoundingClientRect();
      const stageW = stageRect.width || stage.offsetWidth || 1000;
      const stageH = stageRect.height || stage.offsetHeight || 600;
      const activeSlots = slotRefs.current.slice(0, cards.length).filter(Boolean) as HTMLElement[];

      if (activeSlots.length === 0) {
        throw new Error("Không có lá bài nào để chụp");
      }

      // 2. Phân tích tọa độ transform thực tế & tính toán khung bao (Bounding Box) chuẩn xác
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      interface SlotDrawMeta {
        idx: number;
        card: DynamicCardItem;
        slot: HTMLElement;
        cx: number;
        cy: number;
        unscaledW: number;
        unscaledH: number;
        rotDeg: number;
        sc: number;
        zIndex: number;
      }

      const slotMetas: SlotDrawMeta[] = activeSlots.map((slot, idx) => {
        const card = cards[idx];
        const tf = slot.style.transform || "";
        const t3d = tf.match(/translate3d\(\s*([-\d.]+)px\s*,\s*([-\d.]+)px/i);
        const rotM = tf.match(/rotate\(\s*([-\d.]+)deg\)/i);
        const scaleM = tf.match(/scale\(\s*([-\d.]+)\)/i);
        const tx = t3d ? parseFloat(t3d[1]) : 0;
        const ty = t3d ? parseFloat(t3d[2]) : 0;
        const rotDeg = rotM ? parseFloat(rotM[1]) : 0;
        const sc = scaleM ? parseFloat(scaleM[1]) : 1;
        const zIndex = parseFloat(slot.style.zIndex || String(10 + idx)) || 10 + idx;

        const unscaledW = slot.offsetWidth || (card?.type === "yao" ? 208 : 176);
        const unscaledH = slot.offsetHeight || (card?.type === "yao" ? 240 : 272);
        const cx = stageW / 2 + tx;
        const cy = stageH / 2 + ty;

        // Tính khung bao hình học có tính góc xoay và nhãn phía trên lá bài (Trận 7, 10, 11 và 12 lá có nhãn trên)
        const rad = Math.abs((rotDeg * Math.PI) / 180);
        const halfW = ((unscaledW * Math.cos(rad) + unscaledH * Math.sin(rad)) * sc) / 2;
        const halfH = ((unscaledW * Math.sin(rad) + unscaledH * Math.cos(rad)) * sc) / 2;
        const hasTopBadge =
          (mode === "khong_minh" || mode === "that_tinh" || mode === "cuu_cung" || mode === "thap_tinh" || mode === "thap_nhat" || mode === "thap_nhi") &&
          Boolean(card?.positionLabel);
        const topBadgeExtra = hasTopBadge ? 42 : 12;

        minX = Math.min(minX, cx - halfW - 14);
        maxX = Math.max(maxX, cx + halfW + 14);
        minY = Math.min(minY, cy - halfH - topBadgeExtra);
        maxY = Math.max(maxY, cy + halfH + 14);

        const r = slot.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && stageRect.width > 0) {
          minX = Math.min(minX, r.left - stageRect.left);
          minY = Math.min(minY, r.top - stageRect.top);
          maxX = Math.max(maxX, r.right - stageRect.left);
          maxY = Math.max(maxY, r.bottom - stageRect.top);
        }

        const badge = hasTopBadge ? (slot.querySelector("div.absolute") as HTMLElement | null) : null;
        if (badge && stageRect.width > 0) {
          const br = badge.getBoundingClientRect();
          if (br.width > 0 && br.height > 0) {
            minX = Math.min(minX, br.left - stageRect.left);
            minY = Math.min(minY, br.top - stageRect.top);
            maxX = Math.max(maxX, br.right - stageRect.left);
            maxY = Math.max(maxY, br.bottom - stageRect.top);
          }
        }

        return { idx, card, slot, cx, cy, unscaledW, unscaledH, rotDeg, sc, zIndex };
      });

      if (!isFinite(minX) || !isFinite(maxX)) {
        minX = 0;
        minY = 0;
        maxX = stageW;
        maxY = stageH;
      }

      // Căn lề padding thanh thoát (~44px) đúng như ảnh mẫu chuẩn
      const padX = 44;
      const padY = 44;
      const cropW = Math.max(320, Math.round(maxX - minX + padX * 2));
      const cropH = Math.max(220, Math.round(maxY - minY + padY * 2));
      const maxCanvasDim = 3840;
      const idealRatio = Math.min(3, Math.max(2, Math.ceil(1600 / cropW)));
      const exportRatio = Math.min(idealRatio, maxCanvasDim / cropW, maxCanvasDim / cropH);

      let dataUrl = "";

      // 3. Phương thức chính: Kết xuất trực tiếp lên HTML5 Canvas 2D (Sắc nét tuyệt đối, không bị lỗi SVG/CSS/Brave)
      try {
        const loadCardImg = async (card: DynamicCardItem, slotEl: HTMLElement): Promise<HTMLImageElement | null> => {
          const domImg = slotEl.querySelector("img") as HTMLImageElement | null;
          if (domImg && domImg.complete && domImg.naturalWidth > 0) {
            return domImg;
          }
          const fallbackSrc =
            card.type === "yao"
              ? `/assets/oss/${card.hexNumber}/${card.hexNumber}-${card.yaoNumber}a.webp`
              : `/assets/oss/${card.hexNumber}/${card.hexNumber}a.webp`;

          const tryLoad = (src: string) =>
            new Promise<HTMLImageElement | null>((resolve) => {
              const img = new Image();
              img.crossOrigin = "anonymous";
              const timer = setTimeout(() => resolve(null), 3500);
              img.onload = async () => {
                clearTimeout(timer);
                if (typeof img.decode === "function") {
                  await img.decode().catch(() => {});
                }
                resolve(img.naturalWidth > 0 ? img : null);
              };
              img.onerror = () => {
                clearTimeout(timer);
                resolve(null);
              };
              img.src = src;
            });

          const primary = await tryLoad(card.img);
          if (primary) return primary;
          if (fallbackSrc !== card.img) {
            return await tryLoad(fallbackSrc);
          }
          return null;
        };

        const loadedImages = await Promise.all(
          slotMetas.map((m) => loadCardImg(m.card, m.slot))
        );

        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(cropW * exportRatio));
        canvas.height = Math.max(1, Math.round(cropH * exportRatio));
        const ctx = canvas.getContext("2d");

        if (ctx) {
          ctx.scale(exportRatio, exportRatio);

          // Vẽ nền Giấy Tuyên Thành (#F6F3EB) và lưới tọa độ Tơ Đồng Cổ 48x48px giống hệt #destiny-cards
          ctx.fillStyle = "#F6F3EB";
          ctx.fillRect(0, 0, cropW, cropH);

          ctx.strokeStyle = "rgba(180, 145, 70, 0.14)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          for (let gx = 0; gx <= cropW; gx += 48) {
            ctx.moveTo(gx + 0.5, 0);
            ctx.lineTo(gx + 0.5, cropH);
          }
          for (let gy = 0; gy <= cropH; gy += 48) {
            ctx.moveTo(0, gy + 0.5);
            ctx.lineTo(cropW, gy + 0.5);
          }
          ctx.stroke();

          const drawRoundRect = (
            c: CanvasRenderingContext2D,
            x: number,
            y: number,
            w: number,
            h: number,
            r: number
          ) => {
            const radius = Math.min(r, w / 2, h / 2);
            c.beginPath();
            c.moveTo(x + radius, y);
            c.lineTo(x + w - radius, y);
            c.quadraticCurveTo(x + w, y, x + w, y + radius);
            c.lineTo(x + w, y + h - radius);
            c.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
            c.lineTo(x + radius, y + h);
            c.quadraticCurveTo(x, y + h, x, y + h - radius);
            c.lineTo(x, y + radius);
            c.quadraticCurveTo(x, y, x + radius, y);
            c.closePath();
          };

          const sortedMetas = [...slotMetas].sort(
            (a, b) => a.zIndex - b.zIndex || a.idx - b.idx
          );

          // Lớp 1: Vẽ thân thẻ bài, hình ảnh quẻ/hào, viền vàng & nhãn chân bài
          for (const item of sortedMetas) {
            const img = loadedImages[item.idx];
            const cw = item.unscaledW;
            const ch = item.unscaledH;
            const rx = -cw / 2;
            const ry = -ch / 2;
            const cardRadius = 16;

            ctx.save();
            ctx.translate(item.cx - minX + padX, item.cy - minY + padY);
            ctx.rotate((item.rotDeg * Math.PI) / 180);
            ctx.scale(item.sc, item.sc);

            // Bóng đổ thẻ bài
            ctx.save();
            ctx.shadowColor = "rgba(0, 0, 0, 0.28)";
            ctx.shadowBlur = 24;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 10;
            drawRoundRect(ctx, rx, ry, cw, ch, cardRadius);
            const bgGrad = ctx.createLinearGradient(rx, ry, rx + cw, ry + ch);
            bgGrad.addColorStop(0, "#2D2820");
            bgGrad.addColorStop(1, "#1C1A15");
            ctx.fillStyle = bgGrad;
            ctx.fill();
            ctx.restore();

            // Vẽ ảnh thẻ bài bên trong khung bo góc
            ctx.save();
            drawRoundRect(ctx, rx, ry, cw, ch, cardRadius);
            ctx.clip();

            if (
              (mode === "thap_tinh" && item.idx === 1 && isCard2Reversed) ||
              (mode === "thap_nhat" && ((item.idx === 1 && isCard2AReversed) || (item.idx === 2 && isCard2BReversed)))
            ) {
              ctx.rotate(Math.PI);
            }

            if (img && img.naturalWidth > 0 && img.naturalHeight > 0) {
              const imgRatio = img.naturalWidth / img.naturalHeight;
              const boxRatio = cw / ch;
              if (item.card.type === "yao") {
                ctx.fillStyle = "#09090B";
                ctx.fillRect(rx, ry, cw, ch);
                let dw = cw;
                let dh = ch;
                if (imgRatio > boxRatio) {
                  dh = cw / imgRatio;
                } else {
                  dw = ch * imgRatio;
                }
                ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
              } else {
                let dw = cw;
                let dh = ch;
                if (imgRatio > boxRatio) {
                  dw = ch * imgRatio;
                } else {
                  dh = cw / imgRatio;
                }
                ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
              }
            } else {
              // Dự phòng nếu ảnh chưa tải kịp
              ctx.fillStyle = "rgba(255,255,255,0.65)";
              ctx.font = "32px serif";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText(item.card.symbol || "☯", 0, -14);
              ctx.fillStyle = "#FFFFFF";
              ctx.font = "bold 13px 'Lora', Georgia, serif";
              ctx.fillText(item.card.name, 0, 18);
            }
            ctx.restore();

            // Viền chỉ vàng quanh lá bài
            drawRoundRect(ctx, rx + 0.5, ry + 0.5, cw - 1, ch - 1, cardRadius);
            ctx.strokeStyle = "rgba(196, 150, 62, 0.42)";
            ctx.lineWidth = 1.2;
            ctx.stroke();

            ctx.restore();
          }

          // Lớp 2: Vẽ nhãn vị trí trận pháp phía trên từng lá bài (Quẻ Khổng Minh 3 lá, Trận 7, 9, 10, 11 và 12 lá)
          if (mode === "khong_minh" || mode === "that_tinh" || mode === "cuu_cung" || mode === "thap_tinh" || mode === "thap_nhat" || mode === "thap_nhi") {
            for (const item of sortedMetas) {
              if (!item.card.positionLabel) continue;

              let topText = item.card.shortBadgeLabel || item.card.positionLabel;
              let pillBg = "rgba(24, 24, 27, 0.92)";
              let pillBorder = "rgba(120, 113, 108, 0.65)";
              let pillColor = "#F5F5F4";

              if (mode === "khong_minh" && item.idx === 2) {
                topText = item.card.shortBadgeLabel || "★ 3. Quẻ Khổng Minh";
                pillBg = "rgba(69, 26, 3, 0.96)";
                pillBorder = "#F59E0B";
                pillColor = "#FEF08A";
              } else if (mode === "cuu_cung" && item.idx === 0) {
                topText = item.card.shortBadgeLabel || "★ Lá 1: Trung Cung (5)";
                pillBg = "rgba(69, 26, 3, 0.96)";
                pillBorder = "#F59E0B";
                pillColor = "#FEF08A";
              } else if (mode === "thap_tinh" && item.idx === 1) {
                topText = isCard2Reversed ? "2. Ngược: Trở Ngại 🔄" : "2. Xuôi: Hỗ Trợ 🔄";
                pillBg = isCard2Reversed ? "#4C0519" : "#022C22";
                pillBorder = isCard2Reversed ? "#F43F5E" : "#10B981";
                pillColor = isCard2Reversed ? "#FECDD3" : "#A7F3D0";
              } else if (mode === "thap_tinh" && item.idx === 0) {
                topText = "1. Tình Huống Hiện Tại";
                pillBg = "rgba(24, 24, 27, 0.95)";
                pillBorder = "rgba(217, 119, 6, 0.7)";
                pillColor = "#FDE68A";
              } else if (mode === "thap_tinh" && item.idx === 9) {
                topText = "10. Lá Bài Khuyên Bảo";
                pillBg = "rgba(69, 26, 3, 0.95)";
                pillBorder = "rgba(245, 158, 11, 0.85)";
                pillColor = "#FDE68A";
              } else if (mode === "thap_nhat" && item.idx === 0) {
                topText = "1. Tình Huống Hiện Tại";
                pillBg = "rgba(24, 24, 27, 0.95)";
                pillBorder = "rgba(217, 119, 6, 0.7)";
                pillColor = "#FDE68A";
              } else if (mode === "thap_nhat" && item.idx === 1) {
                topText = isCard2AReversed ? "2A. Ngược: Bổ Trợ Suy 🔄" : "2A. Xuôi: Bổ Trợ 🔄";
                pillBg = isCard2AReversed ? "#4C0519" : "#022C22";
                pillBorder = isCard2AReversed ? "#F43F5E" : "#10B981";
                pillColor = isCard2AReversed ? "#FECDD3" : "#A7F3D0";
              } else if (mode === "thap_nhat" && item.idx === 2) {
                topText = isCard2BReversed ? "2B. Ngược: Áp Lực Giảm 🔄" : "2B. Xuôi: Thách Thức 🔄";
                pillBg = isCard2BReversed ? "#022C22" : "#4C0519";
                pillBorder = isCard2BReversed ? "#10B981" : "#F43F5E";
                pillColor = isCard2BReversed ? "#A7F3D0" : "#FECDD3";
              } else if (mode === "thap_nhat" && item.idx === 10) {
                topText = "10. Lá Bài Khuyên Bảo";
                pillBg = "rgba(69, 26, 3, 0.95)";
                pillBorder = "rgba(245, 158, 11, 0.85)";
                pillColor = "#FDE68A";
              } else if (mode === "thap_nhi" && item.card.isMenhCung) {
                topText = item.card.shortBadgeLabel || `★ Cung Mệnh · ${item.card.branchName || ""}`;
                pillBg = "rgba(69, 26, 3, 0.96)";
                pillBorder = "#F59E0B";
                pillColor = "#FEF08A";
              }

              ctx.save();
              ctx.translate(item.cx - minX + padX, item.cy - minY + padY);
              ctx.rotate((item.rotDeg * Math.PI) / 180);
              ctx.scale(item.sc, item.sc);

              ctx.font = "bold 11.5px 'Lora', Georgia, serif";
              const tMetrics = ctx.measureText(topText);
              const pW = tMetrics.width + 22;
              const pH = 24;
              const pX = -pW / 2;
              const pY = -item.unscaledH / 2 - pH - 8;

              ctx.save();
              ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
              ctx.shadowBlur = 8;
              ctx.shadowOffsetY = 3;
              drawRoundRect(ctx, pX, pY, pW, pH, 12);
              ctx.fillStyle = pillBg;
              ctx.fill();
              ctx.restore();

              drawRoundRect(ctx, pX, pY, pW, pH, 12);
              ctx.strokeStyle = pillBorder;
              ctx.lineWidth = 1.2;
              ctx.stroke();

              ctx.fillStyle = pillColor;
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText(topText, 0, pY + pH / 2 + 0.5);

              ctx.restore();
            }
          }

          dataUrl = canvas.toDataURL("image/png");
          if (!dataUrl || dataUrl === "data:," || dataUrl.length < 200) {
            dataUrl = canvas.toDataURL("image/jpeg", 0.92);
          }

          // Kết xuất riêng từng lá bài theo đúng thứ tự đọc 1 -> N (riêng Tháp La: Quẻ Chủ -> các Hào Động -> Quẻ Biến) để Video 9:16 đồng bộ 100%
          try {
            const orderedByIdx = [...slotMetas].sort((a, b) => {
              if (mode === "thap_la" && slotMetas.length > 2) {
                const rank = (idx: number) => (idx === 0 ? 0 : idx === 1 ? 999 : idx);
                return rank(a.idx) - rank(b.idx);
              }
              return a.idx - b.idx;
            });
            const perCardUrls: string[] = [];
            for (let seqIdx = 0; seqIdx < orderedByIdx.length; seqIdx++) {
              const item = orderedByIdx[seqIdx];
              const img = loadedImages[item.idx];
              const cw = Math.max(240, Math.round(item.unscaledW * 1.45));
              const ch = Math.max(368, Math.round(item.unscaledH * 1.45));
              const padC = 28;
              const badgeSpace = 44;
              const singleW = cw + padC * 2;
              const singleH = ch + padC * 2 + badgeSpace;

              const cCanvas = document.createElement("canvas");
              cCanvas.width = singleW;
              cCanvas.height = singleH;
              const cCtx = cCanvas.getContext("2d");
              if (!cCtx) continue;

              cCtx.fillStyle = "#F6F3EB";
              cCtx.fillRect(0, 0, singleW, singleH);
              cCtx.strokeStyle = "rgba(180, 145, 70, 0.14)";
              cCtx.lineWidth = 1;
              cCtx.beginPath();
              for (let gx = 0; gx <= singleW; gx += 48) {
                cCtx.moveTo(gx + 0.5, 0);
                cCtx.lineTo(gx + 0.5, singleH);
              }
              for (let gy = 0; gy <= singleH; gy += 48) {
                cCtx.moveTo(0, gy + 0.5);
                cCtx.lineTo(singleW, gy + 0.5);
              }
              cCtx.stroke();

              // Nhãn vị trí cung vị phía trên lá bài
              const posTitle =
                mode === "thap_la"
                  ? `Lá ${seqIdx + 1} · ${item.card.positionLabel || item.card.name}`
                  : item.card.positionLabel ||
                    `Lá ${item.idx + 1} · ${item.card.name}`;
              cCtx.save();
              cCtx.font = "bold 15px 'Lora', Georgia, serif";
              const mText = cCtx.measureText(posTitle);
              const bW = Math.min(singleW - 16, mText.width + 28);
              const bH = 30;
              const bX = (singleW - bW) / 2;
              const bY = 14;
              drawRoundRect(cCtx, bX, bY, bW, bH, 15);
              cCtx.fillStyle = "rgba(24, 24, 27, 0.94)";
              cCtx.fill();
              cCtx.strokeStyle = "rgba(212, 175, 55, 0.75)";
              cCtx.lineWidth = 1.4;
              cCtx.stroke();
              cCtx.fillStyle = "#FDE68A";
              cCtx.textAlign = "center";
              cCtx.textBaseline = "middle";
              cCtx.fillText(posTitle, singleW / 2, bY + bH / 2 + 0.5);
              cCtx.restore();

              // Vẽ thân lá bài
              const cardX = padC;
              const cardY = badgeSpace + 12;
              cCtx.save();
              cCtx.shadowColor = "rgba(0, 0, 0, 0.28)";
              cCtx.shadowBlur = 20;
              cCtx.shadowOffsetY = 8;
              drawRoundRect(cCtx, cardX, cardY, cw, ch, 18);
              cCtx.fillStyle = "#1E1B16";
              cCtx.fill();
              cCtx.restore();

              cCtx.save();
              drawRoundRect(cCtx, cardX, cardY, cw, ch, 18);
              cCtx.clip();
              if (img && img.naturalWidth > 0 && img.naturalHeight > 0) {
                const iRatio = img.naturalWidth / img.naturalHeight;
                const bRatio = cw / ch;
                let dw = cw;
                let dh = ch;
                if (item.card.type === "yao") {
                  cCtx.fillStyle = "#09090B";
                  cCtx.fillRect(cardX, cardY, cw, ch);
                  if (iRatio > bRatio) dh = cw / iRatio;
                  else dw = ch * iRatio;
                } else {
                  if (iRatio > bRatio) dw = ch * iRatio;
                  else dh = cw / iRatio;
                }
                cCtx.drawImage(
                  img,
                  cardX + (cw - dw) / 2,
                  cardY + (ch - dh) / 2,
                  dw,
                  dh
                );
              }
              cCtx.restore();

              drawRoundRect(cCtx, cardX + 0.5, cardY + 0.5, cw - 1, ch - 1, 18);
              cCtx.strokeStyle = "rgba(212, 175, 55, 0.65)";
              cCtx.lineWidth = 1.6;
              cCtx.stroke();

              const cUrl = cCanvas.toDataURL("image/png");
              if (cUrl && cUrl.length > 200) {
                perCardUrls.push(cUrl);
              }
            }
            if (perCardUrls.length === cards.length) {
              directHomeCardImgsRef.current = perCardUrls;
            }
          } catch (perCardErr) {
            console.warn("Không thể tạo ảnh rời từng lá:", perCardErr);
          }
        }
      } catch (canvasErr) {
        console.warn("Canvas 2D snapshot fallback sang html-to-image:", canvasErr);
      }

      // 4. Phương thức dự phòng: Sử dụng html-to-image nếu Canvas 2D chưa tạo được ảnh
      if (!dataUrl || dataUrl === "data:," || dataUrl.length < 200) {
        const outerWrapper = document.createElement("div");
        outerWrapper.setAttribute("data-capture-root", "true");
        outerWrapper.setAttribute("data-capture-fixed-size", "true");
        outerWrapper.style.position = "fixed";
        outerWrapper.style.left = "-99999px";
        outerWrapper.style.top = "0";
        outerWrapper.style.width = `${cropW}px`;
        outerWrapper.style.height = `${cropH}px`;
        outerWrapper.style.overflow = "hidden";
        outerWrapper.style.zIndex = "-9999";

        const container = document.createElement("div");
        container.setAttribute("data-capture-fixed-size", "true");
        container.style.position = "relative";
        container.style.width = `${cropW}px`;
        container.style.height = `${cropH}px`;
        container.style.overflow = "hidden";
        container.style.backgroundColor = "#FFFFFF";
        container.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.055) 1px, transparent 1px)`;
        container.style.backgroundSize = "48px 48px";
        container.style.boxSizing = "border-box";

        const stageClone = stage.cloneNode(true) as HTMLElement;
        stageClone.setAttribute("data-capture-fixed-size", "true");
        stageClone.style.position = "absolute";
        stageClone.style.left = `${Math.round(-minX + padX)}px`;
        stageClone.style.top = `${Math.round(-minY + padY)}px`;
        stageClone.style.transform = "none";
        stageClone.style.width = `${stageW}px`;
        stageClone.style.height = `${stageH}px`;
        stageClone.style.margin = "0";
        stageClone.style.pointerEvents = "none";

        container.appendChild(stageClone);
        outerWrapper.appendChild(container);
        document.body.appendChild(outerWrapper);

        try {
          const imgs = Array.from(stageClone.querySelectorAll("img"));
          await Promise.all(
            imgs.map(async (img) => {
              img.loading = "eager";
              img.removeAttribute("loading");
              if (img.complete && img.naturalWidth > 0) {
                if (typeof img.decode === "function") await img.decode().catch(() => {});
                return true;
              }
              return new Promise((res) => {
                img.onload = async () => {
                  if (typeof img.decode === "function") await img.decode().catch(() => {});
                  res(true);
                };
                img.onerror = () => res(false);
                setTimeout(() => res(false), 2000);
              });
            })
          );
          await new Promise((resolve) => setTimeout(resolve, 80));

          const fontEmbedCSS = await getCaptureFontEmbedCSS();
          dataUrl = await toPng(container, {
            width: cropW,
            height: cropH,
            canvasWidth: Math.round(cropW * exportRatio),
            canvasHeight: Math.round(cropH * exportRatio),
            pixelRatio: exportRatio,
            backgroundColor: "#FFFFFF",
            cacheBust: false,
            skipFonts: true,
            fontEmbedCSS,
            filter: (node: Node) => {
              if (node instanceof HTMLElement) {
                if (node.classList.contains("no-capture")) return false;
                const tag = node.tagName.toLowerCase();
                if (tag === "script" || tag === "noscript" || tag === "iframe") return false;
              }
              return true;
            },
          });
        } finally {
          if (outerWrapper.parentNode) {
            outerWrapper.parentNode.removeChild(outerWrapper);
          }
        }
      }

      if (!dataUrl || dataUrl === "data:," || dataUrl.length < 200) {
        throw new Error("Dữ liệu ảnh xuất ra không hợp lệ");
      }

      // 6. Đặt tên tệp theo loại trải bài & ngày tháng rồi tự động tải về
      const modeSlug =
        mode === "khong_minh"
          ? "que-khong-minh-3-la"
          : mode === "that_tinh"
          ? "that-tinh-7-la"
          : mode === "cuu_cung"
          ? "cuu-cung-9-la"
          : mode === "thap_tinh"
          ? "thap-tinh-10-la"
          : mode === "thap_nhat"
          ? "thap-tinh-mo-rong-11-la"
          : mode === "thap_nhi"
          ? "thap-nhi-cung-12-la"
          : mode === "thap_la"
          ? "thap-la"
          : `${cards.length}-la-bai`;
      const dateStr = new Date().toISOString().slice(0, 10);
      const filename = `trai-bai-iching-tarot-${modeSlug}-${dateStr}.png`;

      setSnapshotImageUrl(dataUrl);
      if (!isSilent) {
        downloadDataUrlAsPng(dataUrl, filename);
        setIsSnapshotModalOpen(true);
        setCopiedToast("Đã chụp hình toàn bộ thẻ bài thành công!");
        setTimeout(() => setCopiedToast(null), 3500);
      }
      return dataUrl;
    } catch (err) {
      console.error("Lỗi khi chụp hình thẻ bài:", err);
      if (!isSilent) {
        setCopiedToast("Chưa thể chụp ảnh thẻ bài, vui lòng thử lại!");
        setTimeout(() => setCopiedToast(null), 3500);
      }
      return null;
    } finally {
      // 7. Khôi phục lại trạng thái vị trí cuộn ban đầu
      if (requestTickRef.current) {
        requestTickRef.current();
      }
      if (!isSilent) {
        setIsCapturingSnapshot(false);
      }
    }
  }, [cards, mode, isCard2Reversed, isCard2AReversed, isCard2BReversed, menhBranchNumber, isCapturingSnapshot]);

  /* ── TÍCH HỢP MẪU 2: LUẬN TRỰC TIẾP & VIDEO 9:16 NGAY TẠI TRANG CHỦ (CHẠY NGẦM + DỰ BÁO ETA + THÔNG BÁO ĐA KÊNH) ── */
  const [directHomeVoice, setDirectHomeVoice] = useState<string>("nam_tram_am");
  const [isDirectHomeRunning, setIsDirectHomeRunning] = useState<boolean>(false);
  const [directHomePercent, setDirectHomePercent] = useState<number>(0);
  const [directHomeStage, setDirectHomeStage] = useState<string>("");
  const [directHomeMessage, setDirectHomeMessage] = useState<string>(
    "Sẵn sàng tự chụp thẻ bài & luận giải trực tiếp ngay trên trang chủ"
  );
  const [directHomeElapsed, setDirectHomeElapsed] = useState<number>(0);
  const [directHomeEtaRemaining, setDirectHomeEtaRemaining] = useState<number>(0);
  const [directHomeEtaText, setDirectHomeEtaText] = useState<string>("");
  const [directHomeEstimatedTotal, setDirectHomeEstimatedTotal] = useState<number>(65);
  const [directHomeReadyBanner, setDirectHomeReadyBanner] = useState<{
    hexagramTitle: string;
    duration?: number;
    videoUrl?: string;
    totalTime?: number;
  } | null>(null);
  const [isBgPillMinimized, setIsBgPillMinimized] = useState<boolean>(false);
  const [directHomeCapturedImg, setDirectHomeCapturedImg] = useState<string>("");
  const [directHomeRawAIText, setDirectHomeRawAIText] = useState<string>("");
  const [directHomeResult, setDirectHomeResult] = useState<{
    question?: string;
    hexagram_title?: string;
    hook?: string;
    summary_advice?: string;
    full_interpretation?: string;
    video_script?: string;
    video_url?: string;
    audio_url?: string;
    image_url?: string;
    duration?: number;
    total_time?: number;
  } | null>(null);
  const [isDirectResultModalOpen, setIsDirectResultModalOpen] = useState<boolean>(false);
  const [directResultActiveTab, setDirectResultActiveTab] = useState<"interp" | "script" | "raw">("interp");
  const [isRecordingVoiceQ, setIsRecordingVoiceQ] = useState<boolean>(false);
  const [isTranscribingVoiceQ, setIsTranscribingVoiceQ] = useState<boolean>(false);
  const [voiceRecordSec, setVoiceRecordSec] = useState<number>(0);
  const speechRecRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const voiceStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const voiceTimerRef = useRef<number | null>(null);
  const webSpeechBrokenRef = useRef<boolean>(false);
  const liveSpeechTextRef = useRef<string>("");
  const voiceBaseTextRef = useRef<string>("");
  const directHomePollRef = useRef<number | null>(null);
  const directHomeWorkerRef = useRef<Worker | null>(null);
  const titleBlinkRef = useRef<number | null>(null);
  const lastNotifiedJobIdRef = useRef<string>(
    typeof window !== "undefined" ? localStorage.getItem("cuunhi_home_notified_job_id") || "" : ""
  );

  const formatSecondsMMSS = useCallback((sec?: number) => {
    const s = Math.max(0, Math.round(sec || 0));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m < 10 ? "0" : ""}${m}:${r < 10 ? "0" : ""}${r}`;
  }, []);

  const playGoldenChime432Hz = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      [432, 648, 864].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0.001, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.18 / (idx + 1), now + idx * 0.12 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 2.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 2.5);
      });
    } catch {}
  }, []);

  const stopDirectHomePolling = useCallback(() => {
    if (directHomePollRef.current) {
      window.clearInterval(directHomePollRef.current);
      directHomePollRef.current = null;
    }
    if (directHomeWorkerRef.current) {
      try {
        directHomeWorkerRef.current.terminate();
      } catch {}
      directHomeWorkerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const origTitle = "Cửu Nhị · Mệnh Lý, Phong Thủy & Kinh Dịch";
    const clearTitleBlink = () => {
      if (titleBlinkRef.current) {
        window.clearInterval(titleBlinkRef.current);
        titleBlinkRef.current = null;
      }
      document.title = origTitle;
    };
    window.addEventListener("focus", clearTitleBlink);
    return () => {
      window.removeEventListener("focus", clearTitleBlink);
    };
  }, []);

  const isDragonWorking =
    isDirectHomeRunning ||
    isExportingInkWashClip ||
    isPlayingCopyFullClips ||
    isDragonSendingFinale ||
    isCapturingSnapshot ||
    isRecordingVoiceQ ||
    isTranscribingVoiceQ ||
    isPhoneChatLoading;

  const activeDragonAct: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 =
    dragonWakeState === "sleeping"
      ? 0
      : dragonWakeState === "waking"
      ? 8
      : isExportingInkWashClip
      ? inkWashWorkingAct
      : phoneChatAct !== null
      ? phoneChatAct
      : isDirectHomeRunning || isCapturingSnapshot || isPlayingCopyFullClips
      ? dragonAutoFullAct
      : 9;

  const handleWakeUpDragon = useCallback(() => {
    if (dragonWakeState !== "sleeping") return;
    try {
      localStorage.setItem("cuunhi_dragon_awake_date_v1", getTodayDragonDateKey());
    } catch {}
    setShowPhoneVideoMode(false);
    setDragonWakeState("waking");
    if (dragonUnlockTimerRef.current) {
      window.clearTimeout(dragonUnlockTimerRef.current);
    }
    dragonUnlockTimerRef.current = window.setTimeout(() => {
      setIsDragonUnlocked(true);
      dragonUnlockTimerRef.current = null;
    }, 5000);
  }, [dragonWakeState, getTodayDragonDateKey]);

  useEffect(() => {
    return () => {
      if (dragonUnlockTimerRef.current) {
        window.clearTimeout(dragonUnlockTimerRef.current);
      }
      if (phoneChatActTimerRef.current) {
        window.clearTimeout(phoneChatActTimerRef.current);
      }
    };
  }, []);

  /* ── Tự động cuộn khung chatbox trong màn hình điện thoại Cửu Nhị Tiểu Long xuống tin nhắn mới nhất ── */
  useEffect(() => {
    if (phoneChatScrollRef.current) {
      phoneChatScrollRef.current.scrollTop = phoneChatScrollRef.current.scrollHeight;
    }
    if (phoneModalChatScrollRef.current) {
      phoneModalChatScrollRef.current.scrollTop = phoneModalChatScrollRef.current.scrollHeight;
    }
  }, [phoneChatMessages, isPhoneChatLoading, isPhoneChatModalExpanded, phoneDisplayTab]);

  /* ── Hàm gửi câu hỏi đàm đạo & luận giải quẻ trực tiếp cùng Tiểu Long Cửu Nhị trong màn hình điện thoại ── */
  const handleSendPhoneChatMessage = useCallback(
    async (customQuestion?: string) => {
      if (isPhoneChatLoading) return;

      // Bắt buộc phải có Câu hỏi tại "Hương Án Khởi Niệm · Câu Hỏi Chiêm Bốc" trước khi mở Chat (Cửu Long sẽ tự động tổng hợp lời giải Hương Án ngầm phía sau)
      if (!userIntentQuestion.trim()) {
        setCopiedToast(
          "🕯️ Vui lòng nhập Câu hỏi tại 「Hương Án Khởi Niệm · Câu Hỏi Chiêm Bốc」 trước để Tiểu Long Cửu Nhị dựa vào đó khuyên bảo!"
        );
        setTimeout(() => setCopiedToast(null), 4000);
        scrollToHuongAnForChat();
        return;
      }

      const autoHuongAn = huongAnAnswer.trim() || getAutoHuongAnAnswer();
      const spreadName = SPREAD_MODE_NAMES[mode] || "Trận Pháp Kinh Dịch";
      const activeChatCards = mode === "khong_minh" && cards[2] ? [cards[2]] : cards;
      const cardNamesList = activeChatCards
        .map((c) => c.name.replace(/^Quẻ (Chủ|Biến):\s*/i, "").trim())
        .join(" • ");
      const rawInput = typeof customQuestion === "string" ? customQuestion.trim() : phoneChatInput.trim();
      const effectiveUserMsg =
        rawInput ||
        `Xin Tiểu Long Cửu Nhị dựa trực tiếp vào Câu hỏi ("${userIntentQuestion.trim()}") và quẻ đang trải để khuyên bảo thấu đáo cho tôi?`;

      // Nếu Tiểu Long đang ngủ thì tự động đánh thức ngay khi người dùng bắt đầu đàm đạo
      if (dragonWakeState === "sleeping" || !isDragonUnlocked) {
        try {
          localStorage.setItem("cuunhi_dragon_awake_date_v1", getTodayDragonDateKey());
        } catch {}
        setDragonWakeState("awake");
        setIsDragonUnlocked(true);
      }

      setShowPhoneVideoMode(false);
      setPhoneDisplayTab("chat");

      const nowStr = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
      const userMsgObj = {
        id: `usr_${Date.now()}`,
        role: "user" as const,
        content: effectiveUserMsg,
        timestamp: nowStr,
      };

      const updatedHistory = [...phoneChatMessages, userMsgObj];
      setPhoneChatMessages(updatedHistory);
      if (typeof customQuestion !== "string") {
        setPhoneChatInput("");
      }
      setIsPhoneChatLoading(true);
      setPhoneChatAct(1);

      if (phoneChatActTimerRef.current) {
        window.clearTimeout(phoneChatActTimerRef.current);
      }
      phoneChatActTimerRef.current = window.setTimeout(() => {
        setPhoneChatAct(3);
      }, 2800);

      try {
        const aiText = await formatSpreadForAI(
          cards,
          mode,
          isCard2Reversed,
          true,
          userIntentQuestion,
          hexagramPrediction,
          autoHuongAn || userCustomAnswer,
          { isCard2AReversed, isCard2BReversed, menhBranchNumber }
        );

        const res = await fetch("/api/dragon_agent/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_message: effectiveUserMsg,
            main_question: userIntentQuestion.trim(),
            huong_an_answer: autoHuongAn,
            spread_mode: mode,
            spread_title: spreadName,
            is_card2_reversed: mode === "thap_tinh" ? isCard2Reversed : false,
            is_ritual_completed: isRitualCompleted,
            cards: activeChatCards.map((c, idx) => ({
              id: c.id,
              hexNumber: c.hexNumber,
              yaoNumber: c.yaoNumber || c.khongMinhLine,
              name: c.name,
              sub: c.sub,
              desc: c.desc,
              positionLabel: c.positionLabel || `Lá thứ ${idx + 1}`,
            })),
            hexagram_text: aiText,
            messages: updatedHistory.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        const data = await res.json();
        const replyText =
          (data && data.reply && String(data.reply).trim()) ||
          `Kính chào quý bạn! **Tiểu Long Cửu Nhị** đã dựa trên Câu hỏi tại **Hương Án Khởi Niệm** cùng trận pháp **${spreadName}** (${cardNamesList}) để khuyên bảo: quý bạn hãy giữ tâm chính định, lấy chữ Tín và sự chuẩn bị chu đáo làm gốc, thuận thời mà hành động ắt gặt hái cát tường.`;

        const botMsgObj = {
          id: `bot_${Date.now()}`,
          role: "assistant" as const,
          content: replyText,
          timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
          poseBadge: data?.pose_badge || "📜 Chiếu Soi Sách Thuyết Minh",
          hexagramFocus: data?.hexagram_focus || `${spreadName} · ${cardNamesList}`,
        };

        setPhoneChatMessages((prev) => [...prev, botMsgObj]);
        if (Array.isArray(data?.quick_questions) && data.quick_questions.length > 0) {
          setPhoneQuickQuestions(data.quick_questions);
        }

        if (phoneChatActTimerRef.current) {
          window.clearTimeout(phoneChatActTimerRef.current);
        }
        setPhoneChatAct(5);
        phoneChatActTimerRef.current = window.setTimeout(() => {
          setPhoneChatAct(null);
        }, 3800);
      } catch {
        const fallbackMsg = {
          id: `bot_${Date.now()}`,
          role: "assistant" as const,
          content: `Kính thưa quý bạn! **Tiểu Long Cửu Nhị** vừa đối chiếu Câu hỏi tại **Hương Án Khởi Niệm** của trận pháp **${spreadName}** (${cardNamesList}) cùng **Sách Thuyết Minh 64 Quẻ Đi Kèm Bộ Bài**. Trong thế cục hiện tại, điều cốt yếu nhất là giữ vững nội lực, quan sát kỹ thời thế và tiến từng bước trung chính thì mưu sự ắt hanh thông.`,
          timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
          poseBadge: "📜 Chiếu Soi Sách Thuyết Minh",
          hexagramFocus: `${spreadName} · ${cardNamesList}`,
        };
        setPhoneChatMessages((prev) => [...prev, fallbackMsg]);
        setPhoneChatAct(null);
      } finally {
        setIsPhoneChatLoading(false);
      }
    },
    [
      isPhoneChatLoading,
      mode,
      cards,
      phoneChatInput,
      userIntentQuestion,
      huongAnAnswer,
      getAutoHuongAnAnswer,
      scrollToHuongAnForChat,
      dragonWakeState,
      isDragonUnlocked,
      getTodayDragonDateKey,
      phoneChatMessages,
      isCard2Reversed,
      isCard2AReversed,
      isCard2BReversed,
      menhBranchNumber,
      isRitualCompleted,
      hexagramPrediction,
      userCustomAnswer,
    ]
  );

  const handleResetPhoneChat = useCallback(() => {
    setPhoneChatMessages([]);
    setPhoneChatInput("");
    setPhoneChatAct(null);
    setCopiedToast("✨ Đã làm mới cuộc đàm đạo cùng Tiểu Long Cửu Nhị!");
    setTimeout(() => setCopiedToast(null), 2500);
  }, []);

  const handleCopyPhoneChatMsg = useCallback(async (id: string, content: string) => {
    const ok = await copyToClipboard(content);
    if (ok) {
      setCopiedChatMsgId(id);
      setCopiedToast("📋 Đã sao chép lời luận giải của Tiểu Long Cửu Nhị!");
      setTimeout(() => {
        setCopiedChatMsgId(null);
        setCopiedToast(null);
      }, 2200);
    }
  }, []);

  /* ── Bộ hiển thị Markdown tinh gọn trong màn hình điện thoại Cửu Nhị Tiểu Long ── */
  const renderPhoneChatMarkdown = useCallback((rawText: string) => {
    const renderInline = (lineText: string) => {
      const parts = lineText.split(/(\*\*[^*]+\*\*)/g);
      return parts.map((part, idx) => {
        if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
          return (
            <strong key={idx} className="font-bold text-[#F3E5AB]">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <React.Fragment key={idx}>{part}</React.Fragment>;
      });
    };

    const lines = (rawText || "").split(/\r?\n/);
    return (
      <div className="space-y-1.5 text-[11.5px] sm:text-[12px] leading-relaxed text-[#FFF8E7]">
        {lines.map((ln, idx) => {
          const trimmed = ln.trim();
          if (!trimmed) return <div key={idx} className="h-0.5" />;
          if (/^#{1,4}\s+/.test(trimmed)) {
            const headingText = trimmed.replace(/^#{1,4}\s+/, "");
            return (
              <div
                key={idx}
                className="font-serif font-bold text-[#E5C158] text-[12px] sm:text-[12.5px] pt-1 border-b border-[#D4AF37]/25 pb-0.5"
              >
                {renderInline(headingText)}
              </div>
            );
          }
          if (/^[-•*✦]\s+/.test(trimmed)) {
            const bulletText = trimmed.replace(/^[-•*✦]\s+/, "");
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-0.5">
                <span className="text-[#E5C158] font-bold shrink-0 mt-0.5">•</span>
                <div className="flex-1">{renderInline(bulletText)}</div>
              </div>
            );
          }
          if (trimmed.startsWith(">")) {
            const quoteText = trimmed.replace(/^>\s*/, "");
            return (
              <div
                key={idx}
                className="pl-2.5 py-1 border-l-2 border-[#D4AF37] bg-[#281E14]/80 rounded-r-lg italic text-[#F3E5AB]"
              >
                {renderInline(quoteText)}
              </div>
            );
          }
          return (
            <p key={idx} className="leading-relaxed">
              {renderInline(trimmed)}
            </p>
          );
        })}
      </div>
    );
  }, []);

  /* ── Bộ hiển thị Bách Khoa 64 Quẻ Kinh Dịch & 384 Hào trực tiếp trong Màn hình điện thoại Cửu Nhị Tiểu Long ── */
  const renderPhoneBakhKhoaView = useCallback(
    (isExpandedModal = false) => {
      const targetHexNum = selectedPhoneHexNum || cards[0]?.hexNumber || 1;
      const encHex = HEXAGRAMS.find((h) => h.number === targetHexNum) || HEXAGRAMS[0];
      const bookHex = BOOK_HEXAGRAMS.find((b) => b.number === targetHexNum) || BOOK_HEXAGRAMS[0];
      const detailUrl = getHexDetailUrl(targetHexNum, selectedPhoneYaoNum || undefined);

      return (
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden p-2 gap-1.5">
          {/* 1. Thanh chọn nhanh các lá đang trải trên trang chủ + Dropdown tra cứu trọn bộ 64 Quẻ */}
          <div className="rounded-xl p-2 bg-[#1A130C] border border-[#D4AF37]/45 space-y-1.5 shrink-0">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[9.5px] font-serif font-bold uppercase tracking-wider text-[#E5C158]">
                📚 Bách Khoa 64 Quẻ & 384 Hào
              </span>
              <a
                href={getHexagramsUrl()}
                className="text-[9px] font-semibold text-[#F3E5AB] hover:underline"
              >
                Toàn thư 64 Quẻ ↗
              </a>
            </div>

            {/* Các lá bài đang trải trên trang chủ (Quẻ Khổng Minh chỉ hiện duy nhất Lá 3) */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
              {cards.map((c, idx) => {
                if (mode === "khong_minh" && idx < 2) return null;
                const yaoVal = c.khongMinhLine || c.yaoNumber || null;
                const isSelected = c.hexNumber === targetHexNum && yaoVal === selectedPhoneYaoNum;
                return (
                  <button
                    key={c.id + idx}
                    type="button"
                    onClick={() => {
                      setSelectedPhoneHexNum(c.hexNumber);
                      setSelectedPhoneYaoNum(yaoVal);
                    }}
                    className={`whitespace-nowrap px-2 py-0.5 rounded-full text-[9px] font-serif font-bold border transition cursor-pointer shrink-0 ${
                      isSelected
                        ? "bg-gradient-to-r from-[#D4AF37] to-[#B8862D] text-[#1C1610] border-[#FFF8E7]"
                        : "bg-[#110C08] text-[#D8C5A0] border-[#D4AF37]/35 hover:text-[#FFF8E7]"
                    }`}
                  >
                    {mode === "khong_minh"
                      ? `★ Lá 3 (Quẻ Khổng Minh #${c.khongMinhOracleNum || ""}): #${c.hexNumber} (Hào ${yaoVal || 1})`
                      : `Lá ${idx + 1}: #${c.hexNumber} ${c.yaoNumber ? `(Hào ${c.yaoNumber})` : ""}`}
                  </button>
                );
              })}
            </div>

            {/* Dropdown tra cứu bất kỳ quẻ nào trong 64 Quẻ Kinh Dịch */}
            <div className="flex items-center gap-1.5">
              <select
                value={targetHexNum}
                onChange={(e) => {
                  setSelectedPhoneHexNum(Number(e.target.value));
                  setSelectedPhoneYaoNum(null);
                }}
                aria-label="Chọn quẻ trong Bách Khoa 64 Quẻ Kinh Dịch"
                className="flex-1 min-w-0 h-7 px-2 rounded-lg text-[10px] font-serif font-semibold bg-[#0F0B07] text-[#F3E5AB] border border-[#D4AF37]/50 focus:outline-none focus:border-[#F3E5AB]"
              >
                {BOOK_HEXAGRAMS.map((b) => (
                  <option key={b.number} value={b.number} className="bg-[#140F0A] text-[#FFF8E7]">
                    Quẻ #{b.number}: {b.name} ({b.hanzi}) — {b.redHeadline}
                  </option>
                ))}
              </select>
              <a
                href={detailUrl}
                className="h-7 px-2.5 rounded-lg text-[9.5px] font-serif font-bold bg-[#2A1F14] hover:bg-[#3A2B1C] text-[#F3E5AB] border border-[#D4AF37]/45 flex items-center justify-center shrink-0"
                title="Mở trang Bách Khoa chi tiết của quẻ này"
              >
                Chi tiết ↗
              </a>
            </div>
          </div>

          {/* 2. Nội dung Bách Khoa chi tiết của Quẻ đang chọn */}
          <div
            className="flex-1 min-h-0 overflow-y-auto rounded-2xl border border-[#D4AF37]/35 bg-[#110C08]/95 p-2.5 space-y-2.5 shadow-inner text-[#FFF8E7]"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(212,175,55,0.4) transparent",
            }}
          >
            {/* Header Quẻ & Dòng chữ đỏ Sách Thuyết Minh */}
            <div className="rounded-xl p-2.5 border border-[#D4AF37]/50 bg-gradient-to-b from-[#231910] to-[#150F0A] space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-[12px] sm:text-[13px] font-serif font-bold text-[#F3E5AB]">
                    Quẻ #{bookHex.number}: {bookHex.name} ({bookHex.hanzi})
                  </div>
                  <div className="text-[9.5px] text-[#C4A66A]">
                    {bookHex.structure} · {encHex.vietnameseName} (Hành {encHex.element})
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[8.5px] font-bold bg-[#8B1E22] text-[#FFF8E7] border border-[#D4AF37]/60 shrink-0">
                  Quẻ #{bookHex.number}/64
                </span>
              </div>

              <div className="px-2.5 py-1.5 rounded-lg bg-[#6E1418]/90 border border-[#D4AF37]/60 text-[10.5px] font-serif font-bold text-[#FFF8E7] tracking-wide">
                📕 Dòng chữ đỏ: “{bookHex.redHeadline}”
              </div>

              <div className="text-[10.5px] leading-relaxed text-[#E5D3B3]">
                <strong className="text-[#E5C158]">• Thoán Từ (Bách Khoa):</strong> “{encHex.judgment}”
              </div>
              <div className="text-[10.5px] leading-relaxed text-[#E5D3B3]">
                <strong className="text-[#E5C158]">• Đại Tượng Truyện:</strong> “{encHex.image}”
              </div>
            </div>

            {/* Tổng quan Bách Khoa & Đại Tượng Sách Thuyết Minh */}
            <div className="rounded-xl p-2.5 border border-[#D4AF37]/30 bg-[#18120C] space-y-1.5 text-[10.5px] leading-relaxed">
              <div className="font-serif font-bold text-[#E5C158] text-[11px] border-b border-[#D4AF37]/20 pb-0.5">
                ✦ Tổng Quan Bách Khoa & Đại Tượng
              </div>
              <p className="text-[#F5E6C4]">{encHex.overview}</p>
              <p className="text-[#D8C5A0] italic">
                <strong className="text-[#F3E5AB] not-italic">Sách Thuyết Minh bàn:</strong> {bookHex.bigImage}
              </p>
              <div className="p-2 rounded-lg bg-[#110C08] border border-[#D4AF37]/25 text-[10px] text-[#E5C158]">
                <div className="font-semibold">{bookHex.poemHan.replace(/\n/g, " / ")}</div>
                <div className="text-[#D8C5A0] mt-0.5">→ {bookHex.poemMeaning}</div>
              </div>
            </div>

            {/* Luận giải 4 phương diện Bách Khoa */}
            <div className="rounded-xl p-2.5 border border-[#D4AF37]/30 bg-[#18120C] space-y-1.5 text-[10.5px] leading-relaxed">
              <div className="font-serif font-bold text-[#E5C158] text-[11px] border-b border-[#D4AF37]/20 pb-0.5">
                ✦ Chiêm Đoán 4 Phương Diện (Bách Khoa & Sách Thuyết Minh)
              </div>
              <div>
                <strong className="text-[#F3E5AB]">💼 Sự nghiệp & Vận thế:</strong> {encHex.career} ({bookHex.destiny})
              </div>
              <div>
                <strong className="text-[#F3E5AB]">💰 Tài lộc & Mưu sự:</strong> {encHex.wealth}
              </div>
              <div>
                <strong className="text-[#F3E5AB]">❤️ Tình cảm & Gia đạo:</strong> {encHex.love} ({bookHex.love})
              </div>
              <div>
                <strong className="text-[#F3E5AB]">🌿 Sức khỏe:</strong> {encHex.health}
              </div>
              <div className="p-2 rounded-lg bg-[#241A10] border border-[#D4AF37]/40 text-[#F3E5AB]">
                <strong>💡 Lời khuyên cốt tủy:</strong> {encHex.advice}
              </div>
            </div>

            {/* 384 Hào Từ: Tra cứu chi tiết 6 Hào của Quẻ */}
            <div className="rounded-xl p-2.5 border border-[#D4AF37]/35 bg-[#18120C] space-y-2 text-[10.5px] leading-relaxed">
              <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-1">
                <span className="font-serif font-bold text-[#E5C158] text-[11px]">
                  ✦ Tinh Hoa 6 Hào Từ ({bookHex.name})
                </span>
                {selectedPhoneYaoNum && (
                  <button
                    type="button"
                    onClick={() => setSelectedPhoneYaoNum(null)}
                    className="text-[9px] text-[#E5C158] underline cursor-pointer"
                  >
                    Xem cả 6 hào
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1 flex-wrap">
                {[1, 2, 3, 4, 5, 6].map((yn) => (
                  <button
                    key={yn}
                    type="button"
                    onClick={() => setSelectedPhoneYaoNum((prev) => (prev === yn ? null : yn))}
                    className={`px-2 py-0.5 rounded-md text-[9px] font-serif font-bold border transition cursor-pointer ${
                      selectedPhoneYaoNum === yn
                        ? "bg-[#D4AF37] text-[#1C1610] border-[#FFF8E7]"
                        : "bg-[#110C08] text-[#D8C5A0] border-[#D4AF37]/35 hover:text-[#FFF8E7]"
                    }`}
                  >
                    Hào {yn}
                  </button>
                ))}
              </div>

              <div className="space-y-1.5">
                {(encHex.lineMeanings || [])
                  .slice(0, 6)
                  .filter((lm) => !selectedPhoneYaoNum || lm.line === selectedPhoneYaoNum)
                  .map((lm) => (
                    <div
                      key={lm.line}
                      className={`p-2 rounded-lg border ${
                        selectedPhoneYaoNum === lm.line
                          ? "bg-[#261B11] border-[#D4AF37]/70"
                          : "bg-[#120D09] border-[#D4AF37]/25"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-serif font-bold text-[#F3E5AB] text-[10.5px]">
                          Hào {lm.line}: {lm.text}
                        </span>
                        <a
                          href={getHexDetailUrl(bookHex.number, lm.line)}
                          className="text-[8.5px] text-[#E5C158] hover:underline shrink-0"
                        >
                          Bách khoa Hào {lm.line} ↗
                        </a>
                      </div>
                      <div className="text-[#E5D3B3] mt-0.5">{lm.meaning}</div>
                      {lm.detailedExplanation && (
                        <div className="text-[9.5px] text-[#BFA882] mt-0.5 italic">{lm.detailedExplanation}</div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* 3. Nút 1 chạm hỏi trực tiếp Tiểu Long Cửu Nhị về Quẻ Bách Khoa này */}
          <button
            type="button"
            disabled={isPhoneChatLoading}
            onClick={() =>
              handleSendPhoneChatMessage(
                `Xin Tiểu Long luận giải chuyên sâu Quẻ #${bookHex.number} ${bookHex.name}${
                  selectedPhoneYaoNum ? ` (Hào ${selectedPhoneYaoNum})` : ""
                } theo Bách Khoa 64 Quẻ Kinh Dịch & Sách Thuyết Minh ("${bookHex.redHeadline}") ứng với hoàn cảnh của tôi?`
              )
            }
            className={`${
              isExpandedModal ? "py-2.5 text-xs" : "py-1.5 text-[10px]"
            } w-full px-3 rounded-xl font-serif font-bold text-[#1C1610] border border-[#FFF8E7] cursor-pointer transition hover:brightness-105 shadow-sm shrink-0 flex items-center justify-center gap-1.5`}
            style={{
              background: "linear-gradient(135deg, #FFF3B0 0%, #E5C158 50%, #C4963E 100%)",
            }}
          >
            <span>🐉</span>
            <span>
              Hỏi Tiểu Long Về Quẻ #{bookHex.number} {bookHex.name}
              {selectedPhoneYaoNum ? ` · Hào ${selectedPhoneYaoNum}` : ""}
            </span>
          </button>
        </div>
      );
    },
    [selectedPhoneHexNum, selectedPhoneYaoNum, cards, isPhoneChatLoading, handleSendPhoneChatMessage]
  );

  /* ── Bộ hiển thị 6 Chuyên Khảo Blog Dịch Học & Tâm Lý Học Ứng Dụng trực tiếp trong Màn hình điện thoại ── */
  const renderPhoneBlogView = useCallback(
    (isExpandedModal = false) => {
      return (
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden p-2 gap-1.5">
          {/* Header Blog */}
          <div className="rounded-xl px-2.5 py-2 bg-[#1A130C] border border-[#D4AF37]/45 flex items-center justify-between shrink-0">
            <div>
              <div className="text-[10px] font-serif font-bold uppercase tracking-wider text-[#E5C158]">
                📰 Chuyên Khảo Blog Dịch Học & Tâm Lý Học
              </div>
              <div className="text-[9px] text-[#C4A66A]">
                6 chuyên khảo ứng dụng Chu Dịch vào đời sống hiện đại
              </div>
            </div>
            <a
              href={getBlogUrl()}
              className="px-2 py-1 rounded-lg text-[9px] font-serif font-bold bg-[#2A1F14] hover:bg-[#3A2B1C] text-[#F3E5AB] border border-[#D4AF37]/45 shrink-0"
            >
              Trang Blog ↗
            </a>
          </div>

          {/* Danh sách 6 chuyên khảo Blog */}
          <div
            className="flex-1 min-h-0 overflow-y-auto rounded-2xl border border-[#D4AF37]/35 bg-[#110C08]/95 p-2.5 space-y-2.5 shadow-inner"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(212,175,55,0.4) transparent",
            }}
          >
            {HOME_BLOG_ITEMS.map((blog) => (
              <div
                key={blog.slug}
                className="rounded-xl p-2.5 border border-[#D4AF37]/40 bg-gradient-to-b from-[#1E160E] to-[#140E09] space-y-2 shadow-sm"
              >
                <div className="flex items-start gap-2.5">
                  <img
                    src={blog.cover}
                    alt={blog.shortTitle}
                    loading="lazy"
                    className="w-16 h-16 rounded-lg object-cover border border-[#D4AF37]/45 shrink-0 bg-[#0D0A07]"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="inline-block px-1.5 py-0.2 rounded text-[8px] font-bold uppercase tracking-wider bg-[#8B1E22]/85 text-[#F3E5AB] border border-[#D4AF37]/40">
                      {blog.category}
                    </span>
                    <a
                      href={blog.url}
                      className="block font-serif font-bold text-[11px] sm:text-[12px] text-[#F3E5AB] hover:underline leading-snug mt-0.5"
                    >
                      {blog.title}
                    </a>
                  </div>
                </div>

                <p className="text-[10.5px] leading-relaxed text-[#E5D3B3]">{blog.summary}</p>

                {/* Các quẻ Bách Khoa liên quan trong bài Blog */}
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-[8.5px] text-[#C4A66A] font-semibold">Quẻ liên hệ:</span>
                  {blog.relatedHexagrams.map((rh) => (
                    <button
                      key={rh.num}
                      type="button"
                      onClick={() => {
                        setSelectedPhoneHexNum(rh.num);
                        setSelectedPhoneYaoNum(null);
                        setPhoneDisplayTab("bakh_khoa");
                      }}
                      className="px-2 py-0.5 rounded-full text-[8.5px] font-serif font-semibold bg-[#241A10] hover:bg-[#332517] text-[#E5C158] border border-[#D4AF37]/35 cursor-pointer"
                      title="Xem quẻ này trong thẻ Bách Khoa 64 Quẻ"
                    >
                      📚 {rh.label}
                    </button>
                  ))}
                </div>

                {/* Nút Đàm đạo cùng Tiểu Long & Đọc toàn văn */}
                <div className="flex items-center gap-1.5 pt-0.5">
                  <button
                    type="button"
                    disabled={isPhoneChatLoading}
                    onClick={() => handleSendPhoneChatMessage(blog.promptQuestion)}
                    className="flex-1 py-1.5 px-2.5 rounded-lg text-[9.5px] font-serif font-bold text-[#1C1610] bg-gradient-to-r from-[#F3E5AB] via-[#E5C158] to-[#C4963E] border border-[#FFF8E7]/80 cursor-pointer hover:brightness-105 truncate"
                  >
                    🐉 Đàm Đạo Cùng Tiểu Long
                  </button>
                  <a
                    href={blog.url}
                    className="py-1.5 px-2.5 rounded-lg text-[9.5px] font-serif font-bold text-[#F3E5AB] bg-[#261C12] hover:bg-[#36281A] border border-[#D4AF37]/45 shrink-0"
                  >
                    Đọc bài ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    },
    [isPhoneChatLoading, handleSendPhoneChatMessage]
  );

  useEffect(() => {
    if (dragonVideoRef.current) {
      dragonVideoRef.current.play().catch(() => {});
    }
  }, [activeDragonAct, dragonWakeState]);

  const DRAGON_VIDEO_MAP: Record<
    0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9,
    { src: string; badge: string; shortLabel: string; fileLabel: string; sub: string; quote: string }
  > = {
    0: {
      src: "/videos/canh_ngu_1_lien_tiep.mp4",
      badge: "💤 Cảnh Đang Ngủ: Cửu Nhị Tiểu Long Đang Ngủ",
      shortLabel: "💤 Cảnh Đang Ngủ",
      fileLabel: "cảnh ngủ 1 liên tiếp.mp4 (10s)",
      sub: "💤 Cửu Nhị Tiểu Long đang ngủ say (Lần đầu mở trong ngày)...",
      quote: "Khò khò... Cửu Nhị Tiểu Long còn đang ngủ say bên thư án. Hãy bấm nút “Gọi Cửu Nhị Tiểu Long Dậy” để đánh thức Rồng con và mở khóa 2 nút Chép Toàn Bộ Cho AI & Tự Động Hóa!",
    },
    1: {
      src: "/videos/canh_1.mp4",
      badge: "📖 Cảnh 1/7: Mò Đọc Sách",
      shortLabel: "1.📖 Cảnh 1",
      fileLabel: "cảnh 1.mp4 (10s)",
      sub: "Tiểu Long cầm kính lúp vàng mò đọc từng dòng sách cổ Chu Dịch...",
      quote: "Tiểu Long Cửu Nhị đang cầm kính lúp mò đọc từng dòng sách cổ Kinh Dịch. Bấm Tự Động Hóa Toàn Bộ để bắt đầu!",
    },
    2: {
      src: "/videos/canh_2.mp4",
      badge: "✍️ Cảnh 2/7: Ghi Chép Sớ",
      shortLabel: "2.✍️ Cảnh 2",
      fileLabel: "cảnh 2.mp4 (10s)",
      sub: "Tiểu Long cầm bút lông chấm mực hí hoáy ghi chép Thoán Từ...",
      quote: "Đọc sách xong, Tiểu Long cầm bút lông hí hoáy ghi chép Thoán Từ và lời bàn thiên cơ lên trang giấy...",
    },
    3: {
      src: "/videos/canh_3.mp4",
      badge: "🔍 Cảnh 3/7: Soi Quẻ & Luận",
      shortLabel: "3.🔍 Cảnh 3",
      fileLabel: "cảnh 3.mp4 (20s)",
      sub: "Tiểu Long đeo kính tròn soi quẻ Bát Quái phát sáng rực rỡ...",
      quote: "Tiểu Long đeo kính tròn học giả, reo vui khi tìm ra thông điệp huyền cơ từ các quái tượng Bát Quái!",
    },
    4: {
      src: "/videos/canh_4.mp4",
      badge: "💻 Cảnh 4/7: Chép & Đánh Máy",
      shortLabel: "4.💻 Cảnh 4",
      fileLabel: "cảnh 4.mp4 (30s)",
      sub: "Tiểu Long hoàn tất bản chép & gõ máy tính dựng Video 9:16...",
      quote: "Tiểu Long chuyển từ bàn viết sang chiếc Laptop Bát Quái, hai tay gõ phím lạch cạch để dựng Video 9:16...",
    },
    5: {
      src: "/videos/canh_cuoi.mp4",
      badge: "✉️ Cảnh Cuối: Rút Thư Gửi!",
      shortLabel: "5.✉️ Cuối",
      fileLabel: "cảnh cuối.mp4 (10s)",
      sub: "Ở máy tính cuối cùng, Tiểu Long rút lá thư Ấn Chu Sa đưa đi gửi!",
      quote: "Ở máy tính cuối cùng, phong thư vàng kim đóng Ấn Chu Sa bay ra từ laptop để Tiểu Long gửi tới tay bạn!",
    },
    6: {
      src: "/videos/full.mp4",
      badge: "🎬 Full 1: Trọn Bộ (40s)",
      shortLabel: "6.🎬 Full 1",
      fileLabel: "full.mp4 (40s)",
      sub: "Phát trọn bộ hoạt ảnh Tiểu Long Cửu Nhị (Bản Full 1 · 40s)...",
      quote: "Trọn bộ hành trình Tiểu Long Cửu Nhị (Full 1): Đọc sách cổ → Ghi chép Thoán Từ → Gõ máy tính → Gửi thư!",
    },
    7: {
      src: "/videos/full_2.mp4",
      badge: "🌟 Full 2: Trọn Bộ 2 (40s)",
      shortLabel: "7.🌟 Full 2",
      fileLabel: "full 2.mp4 (40s)",
      sub: "Phát trọn bộ hoạt ảnh Tiểu Long Cửu Nhị (Bản Full 2 · 40s)...",
      quote: "Trọn bộ hành trình Tiểu Long Cửu Nhị (Full 2): Mở Laptop Bát Quái → Soi cổ thư → Chép sớ → Gõ máy & Gửi thư!",
    },
    8: {
      src: "/videos/canh_thuc.mp4",
      badge: "🌅 Cảnh Thức: Cửu Nhị Tiểu Long Đang Thức Dậy",
      shortLabel: "🌅 Cảnh Thức",
      fileLabel: "Cảnh thức.mp4 (20s)",
      sub: "🌅 Cửu Nhị Tiểu Long đang thức giấc (Chạy Cảnh Thức ➔ Cảnh Ngồi Không)...",
      quote: "Oáp... Cửu Nhị Tiểu Long đã nghe tiếng gọi của bạn và đang vươn vai thức dậy chuẩn bị bút nghiên luận giải quẻ Dịch!",
    },
    9: {
      src: "/videos/canh_ngoi_khong.mp4",
      badge: "🐉 Cảnh Ngồi Không: Cửu Nhị Tiểu Long Đã Thức",
      shortLabel: "🐉 Cảnh Ngồi Không",
      fileLabel: "cảnh ngồi không.mp4 (10s)",
      sub: "🐉 Cửu Nhị Tiểu Long đang ở trạng thái Cảnh Ngồi Không, sẵn sàng làm việc...",
      quote: "Cửu Nhị Tiểu Long đang ngồi tĩnh tọa bên thư án (Cảnh Ngồi Không). Hai nút Chép Toàn Bộ Cho AI và Tự Động Hóa đã mở khóa sẵn sàng!",
    },
  };

  /* ── Hàm Xuất & Chiếu Video Thủy Mặc (Phiên bản ngắn gọn súc tích · Trả lời trực tiếp câu hỏi dựa vào quẻ · Chạy hoạt ảnh Cửu Long làm việc khi đang dựng clip) ── */
  const handleExportDragonInkWashVideo = useCallback(async () => {
    if (isExportingInkWashClip) {
      setShowPhoneVideoMode(false);
      setPhoneDisplayTab("thuy_mac");
      return;
    }

    // BẮT BUỘC PHẢI CÓ CÂU HỎI CHIÊM BỐC TRƯỚC KHI NHẤN XUẤT & CHIẾU VIDEO THỦY MẶC
    if (!userIntentQuestion.trim()) {
      setShowPhoneVideoMode(false);
      setPhoneDisplayTab("thuy_mac");
      setCopiedToast(
        "🕯️ Vui lòng nhập Câu hỏi tại 「Hương Án Khởi Niệm · Câu Hỏi Chiêm Bốc」 trước khi xuất & chiếu Video Thủy Mặc trả lời trực tiếp câu hỏi!"
      );
      window.setTimeout(() => setCopiedToast(null), 4000);
      scrollToHuongAnForChat();
      return;
    }

    // Tự động đánh thức Tiểu Long Cửu Nhị nếu đang ngủ
    if (dragonWakeState === "sleeping" || !isDragonUnlocked) {
      try {
        localStorage.setItem("cuunhi_dragon_awake_date_v1", getTodayDragonDateKey());
      } catch {}
      setDragonWakeState("awake");
      setIsDragonUnlocked(true);
    }

    setShowPhoneVideoMode(false);
    setPhoneDisplayTab("thuy_mac");
    setIsExportingInkWashClip(true);
    setInkWashWorkingAct(1);
    setInkWashExportPercent(12);
    setInkWashExportStage(
      "📖 Bước 1/4: Tiểu Long Cửu Nhị đang đọc Sách Thuyết Minh & bóc tách nét mực Tuyên Thành..."
    );

    const spreadName = SPREAD_MODE_NAMES[mode] || "Trận Pháp Kinh Dịch";
    const effectiveQuestion = userIntentQuestion.trim();

    try {
      // BƯỚC 1: Bóc tách các lá bài thành 3 lớp mực Thủy Mặc (Ướt - Khô - Chu Sa) trong lúc Cửu Long chạy Cảnh 1 (Mò Đọc Sách)
      const orderedCards =
        mode === "khong_minh" && cards[2]
          ? [cards[2]]
          : mode === "thap_la" && cards.length > 2
          ? [cards[0], ...cards.slice(2), cards[1]]
          : [...cards];

      const decomposedMap = new Map<string, DecomposedCardInk>();
      await Promise.all([
        new Promise((r) => setTimeout(r, 950)),
        ...orderedCards.map(async (c) => {
          if (!c.img) return;
          const decomp = await decomposeCardToInkLayers(c.img);
          if (decomp) {
            decomposedMap.set(c.img, decomp);
          }
        }),
      ]);

      // BƯỚC 2: Cửu Long chuyển sang Cảnh 3 (Soi Kính Lúp Bát Quái) — Gọi AI đúc kết lời giải ngắn gọn súc tích trả lời trực tiếp câu hỏi
      setInkWashWorkingAct(3);
      setInkWashExportPercent(36);
      setInkWashExportStage(
        "🔍 Bước 2/4: Tiểu Long đang soi quẻ đúc kết lời đáp ngắn gọn, trả lời trực tiếp câu hỏi..."
      );

      const firstCard = orderedCards[0];
      const lastCard = orderedCards[orderedCards.length - 1] || firstCard;
      const bookFirst = BOOK_HEXAGRAMS.find((b) => b.number === firstCard?.hexNumber) || BOOK_HEXAGRAMS[0];
      const bookLast = BOOK_HEXAGRAMS.find((b) => b.number === lastCard?.hexNumber) || bookFirst;
      const encFirst = HEXAGRAMS.find((h) => h.number === firstCard?.hexNumber) || HEXAGRAMS[0];
      const encLast = HEXAGRAMS.find((h) => h.number === lastCard?.hexNumber) || encFirst;

      let hexTitle =
        orderedCards.length > 1
          ? `Quẻ #${bookFirst.number} ${bookFirst.name} · Đủ ${orderedCards.length} Lá Bài`
          : `Quẻ #${bookFirst.number} ${bookFirst.name}`;
      let directAnswer = stripHanziAndCleanVi(
        `Trả lời trực tiếp câu hỏi của bạn: Quẻ ${bookFirst.name} báo "${bookFirst.redHeadline}", ${bookFirst.destiny}`
      );
      let cardAnalyses: Array<{
        card_number: number;
        card_title: string;
        position_label: string;
        concise_analysis: string;
      }> = orderedCards.map((c, idx) => {
        const b = BOOK_HEXAGRAMS.find((x) => x.number === c.hexNumber) || bookFirst;
        const e = HEXAGRAMS.find((x) => x.number === c.hexNumber) || encFirst;
        const posLabel = c.positionLabel || `Lá ${idx + 1}`;
        const cTitle = stripHanziAndCleanVi(c.name || b.name);
        const yaoInfo =
          c.type === "yao" && c.yaoNumber
            ? e.lineMeanings?.find((l) => l.line === c.yaoNumber)
            : undefined;
        const detail = yaoInfo
          ? `${yaoInfo.name} (${yaoInfo.text}): ${yaoInfo.meaning}`
          : `${b.redHeadline}, ${b.destiny}`;
        return {
          card_number: idx + 1,
          card_title: cTitle,
          position_label: posLabel,
          concise_analysis: stripHanziAndCleanVi(
            `Lá ${idx + 1} (${posLabel} - ${cTitle}): ${detail}`
          ),
        };
      });
      let keyTurningPoint = stripHanziAndCleanVi(
        orderedCards.length > 1
          ? `Mạch biến thiên qua đủ ${orderedCards.length} lá bài chuyển về Quẻ ${bookLast.name}: ${encLast.advice || bookLast.destiny}`
          : `Điểm mấu chốt cần nắm giữ: ${encFirst.advice || bookFirst.bigImage}`
      );
      let finalVerdict = stripHanziAndCleanVi(
        huongAnAnswer.trim()
          ? `Châu Ấn Cửu Nhị quyết đoán: Hãy thuận theo lời đáp Hương Án, giữ tâm trung chính và hành động đúng thời cơ ắt thành công.`
          : `Châu Ấn Cửu Nhị quyết đoán: Giữ chữ Tín, làm chắc từng bước theo đạo lý Quẻ ${bookFirst.name} thì mưu sự ắt viên mãn.`
      );
      let sealChars = bookLast.redHeadline.includes("Cát")
        ? "大吉"
        : bookLast.redHeadline.includes("Hung")
        ? "慎行"
        : "玖貳";

      try {
        const aiRes = await fetch("/api/ink_wash/ai_interpret", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            concise_direct: true,
            question: effectiveQuestion,
            huong_an_answer: huongAnAnswer.trim(),
            spread_title: spreadName,
            cards: orderedCards.map((c, idx) => ({
              id: c.id,
              hexNumber: c.hexNumber,
              yaoNumber: c.yaoNumber,
              name: c.name,
              positionLabel: c.positionLabel || `Lá ${idx + 1}`,
            })),
          }),
        });
        if (aiRes.ok) {
          const aiJson = await aiRes.json();
          if (aiJson && aiJson.success) {
            if (aiJson.hexagram_title) hexTitle = stripHanziAndCleanVi(aiJson.hexagram_title);
            if (aiJson.direct_answer) directAnswer = stripHanziAndCleanVi(aiJson.direct_answer);
            if (Array.isArray(aiJson.card_analyses) && aiJson.card_analyses.length > 0) {
              cardAnalyses = cardAnalyses.map((fb, idx) => {
                const matched =
                  aiJson.card_analyses.find((item: any) => Number(item?.card_number) === idx + 1) ||
                  aiJson.card_analyses[idx];
                const aiText = matched?.concise_analysis
                  ? stripHanziAndCleanVi(String(matched.concise_analysis))
                  : "";
                return {
                  card_number: idx + 1,
                  card_title: matched?.card_title
                    ? stripHanziAndCleanVi(String(matched.card_title))
                    : fb.card_title,
                  position_label: matched?.position_label
                    ? stripHanziAndCleanVi(String(matched.position_label))
                    : fb.position_label,
                  concise_analysis: aiText || fb.concise_analysis,
                };
              });
            }
            if (aiJson.key_turning_point) keyTurningPoint = stripHanziAndCleanVi(aiJson.key_turning_point);
            if (aiJson.final_verdict) finalVerdict = stripHanziAndCleanVi(aiJson.final_verdict);
            if (aiJson.seal_chars) sealChars = String(aiJson.seal_chars).slice(0, 4);
          }
        }
      } catch {}

      // BƯỚC 3: Cửu Long chuyển sang Cảnh 2 (Cầm Bút Lông Chấm Mực Tàu Ghi Chép Sớ) — Thu âm giọng đọc tiếng Việt ngắn gọn súc tích phân tích đủ tất cả lá bài
      setInkWashWorkingAct(2);
      setInkWashExportPercent(58);
      setInkWashExportStage(
        `✍️ Bước 3/4: Tiểu Long cầm bút lông họa cảnh Thủy Mặc cho đủ ${orderedCards.length} lá bài & thu âm lời đáp...`
      );

      // Mỗi phân cảnh lá bài đọc lời phân tích của lá bài đó (Lá 1 mở đầu kèm câu trả lời trực tiếp), phân cảnh cuối đọc Châu Ấn quyết đoán
      const shotSegmentsText: string[] = orderedCards.map((_, idx) => {
        const cardLine = cardAnalyses[idx]?.concise_analysis || "";
        return idx === 0 ? `${directAnswer} ${cardLine}`.trim() : cardLine.trim();
      });
      const finalSegmentText = `${keyTurningPoint ? keyTurningPoint + " " : ""}${finalVerdict}`.trim();
      const allSegmentsText = [...shotSegmentsText, finalSegmentText];

      const conciseSpokenScript = allSegmentsText
        .map((s) => s.trim())
        .filter(Boolean)
        .join(" ");

      let ttsAudioBlob: Blob | null = null;
      try {
        const ttsRes = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: conciseSpokenScript, voice: directHomeVoice }),
        });
        if (ttsRes.ok) {
          const ab = await ttsRes.arrayBuffer();
          if (ab.byteLength > 200) {
            ttsAudioBlob = new Blob([ab], { type: "audio/mpeg" });
          }
        }
      } catch {}

      // BƯỚC 4: Cửu Long chuyển sang Cảnh 4 (Gõ Máy Tính Dựng Video) ➔ Cảnh 5 (Đóng Ấn Chu Sa Xuất Bản)
      setInkWashWorkingAct(4);
      setInkWashExportPercent(74);
      setInkWashExportStage(
        `💻 Bước 4/4: Tiểu Long đang dựng Video Thủy Mặc 9:16 phân tích đủ ${orderedCards.length} lá bài & đóng Ấn Chu Sa...`
      );

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      const dest = audioCtx.createMediaStreamDestination();

      let decodedVoice: AudioBuffer | null = null;
      if (ttsAudioBlob) {
        try {
          const arrBuf = await ttsAudioBlob.arrayBuffer();
          decodedVoice = await audioCtx.decodeAudioData(arrBuf.slice(0));
        } catch {}
      }

      // Đảm bảo thời lượng đủ cho TẤT CẢ các lá bài (kể cả trận 7 lá, 10 lá) — tuyệt đối không cắt ở 38s hay kẹp cứng khiến chỉ hiện 1-2 lá đầu
      const minRequiredDuration = Math.max(12, orderedCards.length * 3.8 + 4.5);
      const rawTotalDuration =
        decodedVoice && decodedVoice.duration >= orderedCards.length * 2.2
          ? Math.max(minRequiredDuration, Math.min(130, decodedVoice.duration + 1.8))
          : Math.max(
              minRequiredDuration,
              decodedVoice && decodedVoice.duration > 2 ? decodedVoice.duration + 2.0 : minRequiredDuration
            );

      // Xây dựng Kịch bản Thủy Mặc Ngắn Gọn Nhưng Hiển Thị & Phân Tích ĐẦY ĐỦ TẤT CẢ CÁC LÁ BÀI (Lá 1 ... Lá N) + Cảnh Cuối Châu Ấn Cửu Nhị
      const cardWeights = shotSegmentsText.map((txt) => Math.max(28, txt.length));
      const cardsTotalWeight = cardWeights.reduce((acc, w) => acc + w, 0) || 1;
      const finalWeight = Math.max(28, finalSegmentText.length);
      const totalAllWeight = cardsTotalWeight + finalWeight;

      const finalShotDuration = Math.max(
        2.8,
        Math.min(5.2, Number((rawTotalDuration * (finalWeight / totalAllWeight)).toFixed(2)))
      );
      const targetCardsBudget = Math.max(orderedCards.length * 3.0, rawTotalDuration - finalShotDuration);
      const perCardDurations = cardWeights.map((w) =>
        Number(Math.max(2.6, (targetCardsBudget * w) / cardsTotalWeight).toFixed(2))
      );

      const dynamicShots: InkWashFilmPlan["shots"] = [];
      const dynamicCues: InkWashFilmPlan["narrationCues"] = [];
      let cursorSec = 0;

      orderedCards.forEach((c, idx) => {
        const b = BOOK_HEXAGRAMS.find((x) => x.number === c.hexNumber) || bookFirst;
        const dur = perCardDurations[idx];
        const startSec = Number(cursorSec.toFixed(2));
        const endSec = Number((startSec + dur).toFixed(2));
        cursorSec = endSec;

        const posLabel = c.positionLabel || `Lá ${idx + 1}`;
        const cueText = shotSegmentsText[idx] || cardAnalyses[idx]?.concise_analysis || directAnswer;

        dynamicShots.push({
          index: idx,
          title: `Lá ${idx + 1}/${orderedCards.length} (${posLabel}) · ${c.name || b.name}`,
          subtitle: `${b.redHeadline} · Phân Tích Trực Tiếp`,
          startSec,
          endSec,
          cardIndex: idx,
        });

        dynamicCues.push({
          id: `concise_card_${idx + 1}`,
          shotIndex: idx,
          startSec: Number((startSec + 0.08).toFixed(2)),
          endSec: Number(Math.max(startSec + 0.5, endSec - 0.06).toFixed(2)),
          text: cueText,
          speakText: cueText,
        });
      });

      const finalShotIdx = orderedCards.length;
      const finalStartSec = Number(cursorSec.toFixed(2));
      const finalEndSec = Number((finalStartSec + finalShotDuration).toFixed(2));
      const totalDuration = finalEndSec;
      dynamicShots.push({
        index: finalShotIdx,
        title: `Châu Ấn Cửu Nhị Quyết Đoán`,
        subtitle: `Tổng Kết Đủ ${orderedCards.length} Lá Bài & Chốt Hướng Hành Động`,
        startSec: finalStartSec,
        endSec: finalEndSec,
      });
      dynamicCues.push({
        id: `concise_final`,
        shotIndex: finalShotIdx,
        startSec: Number((finalStartSec + 0.08).toFixed(2)),
        endSec: Number((finalEndSec - 0.1).toFixed(2)),
        text: finalSegmentText,
        speakText: finalSegmentText,
      });

      const changingYaoList = orderedCards
        .filter((c) => c.type === "yao" && c.yaoNumber)
        .map((c) => c.yaoNumber!);

      const concisePlan: InkWashFilmPlan = {
        totalDurationSec: totalDuration,
        shots: dynamicShots,
        narrationCues: dynamicCues,
        sealTimeSec: Number((finalStartSec + 0.4).toFixed(2)),
        sealChars,
        orderedCards: orderedCards.map((c) => ({
          id: c.id,
          type: c.type,
          hexNumber: c.hexNumber,
          yaoNumber: c.yaoNumber,
          symbol: c.symbol,
          hanzi: c.hanzi,
          name: c.name,
          sub: c.sub,
          desc: c.desc,
          img: c.img,
          positionLabel: c.positionLabel,
        })),
        primaryLines: [...(encFirst.lines || [1, 1, 1, 1, 1, 1])],
        transformedLines: [...(encLast.lines || [1, 1, 1, 1, 1, 1])],
        changingLines: changingYaoList,
        question: effectiveQuestion,
        conclusionText: finalVerdict,
      };

      const offCanvas = document.createElement("canvas");
      offCanvas.width = 540;
      offCanvas.height = 960;
      const inkRenderer = new InkWashRenderer(offCanvas);
      inkRenderer.resize(540, 960);
      const outCtx = offCanvas.getContext("2d");

      let recordedVideoUrl = "";
      let recordedExt = "webm";

      if (typeof MediaRecorder !== "undefined" && typeof (offCanvas as any).captureStream === "function") {
        const stream: MediaStream = (offCanvas as any).captureStream(24);
        dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t));

        let chosenMime = "";
        for (const mt of [
          "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
          "video/mp4",
          "video/webm;codecs=vp9,opus",
          "video/webm;codecs=vp8,opus",
          "video/webm",
        ]) {
          try {
            if (MediaRecorder.isTypeSupported(mt)) {
              chosenMime = mt;
              break;
            }
          } catch {}
        }
        if (chosenMime.includes("mp4")) recordedExt = "mp4";

        const recorder = chosenMime
          ? new MediaRecorder(stream, { mimeType: chosenMime, videoBitsPerSecond: 3200000 })
          : new MediaRecorder(stream);

        const chunks: BlobPart[] = [];
        recorder.ondataavailable = (ev) => {
          if (ev.data && ev.data.size > 0) chunks.push(ev.data);
        };

        const renderCustomInkFrame = (sec: number) => {
          inkRenderer.renderFrame(sec, concisePlan, decomposedMap);
          if (!outCtx) return;

          // Vẽ thêm khung câu hỏi & dấu hiệu Thủy Mặc Cửu Nhị ngắn gọn trực tiếp trên giấy Tuyên Thành
          outCtx.save();
          outCtx.fillStyle = "rgba(26, 20, 14, 0.88)";
          outCtx.fillRect(24, 14, 492, 34);
          outCtx.strokeStyle = "rgba(176, 46, 34, 0.75)";
          outCtx.lineWidth = 1.2;
          outCtx.strokeRect(24, 14, 492, 34);

          outCtx.fillStyle = "#F3E5AB";
          outCtx.font = '700 12px "Be Vietnam Pro", "Segoe UI", Arial, sans-serif';
          outCtx.textAlign = "center";
          outCtx.textBaseline = "middle";
          const qShort =
            effectiveQuestion.length > 52
              ? `Câu hỏi: “${effectiveQuestion.slice(0, 50)}...”`
              : `Câu hỏi: “${effectiveQuestion}”`;
          outCtx.fillText(qShort, 270, 31);
          outCtx.restore();
        };

        await new Promise<void>((resolve) => {
          recorder.onstop = () => {
            const finalMime = recorder.mimeType || chosenMime || "video/webm";
            const vBlob = new Blob(chunks, { type: finalMime });
            if (vBlob.size > 400) {
              recordedVideoUrl = URL.createObjectURL(vBlob);
            }
            try {
              audioCtx.close();
            } catch {}
            resolve();
          };

          renderCustomInkFrame(0);
          recorder.start(200);

          // Phát giọng đọc tiếng Việt + tiếng đàn Cổ Cầm (Guqin) ngũ cung dịu nhẹ vào luồng thu video
          if (decodedVoice) {
            const vNode = audioCtx.createBufferSource();
            vNode.buffer = decodedVoice;
            const vGain = audioCtx.createGain();
            vGain.gain.value = 1.1;
            vNode.connect(vGain);
            vGain.connect(dest);
            vNode.start(0);
          }

          // Âm hưởng Cổ Cầm ngũ cung nền nhẹ trong video Thủy Mặc
          [146.83, 220.0, 293.66, 432.0].forEach((freq, idx) => {
            try {
              const osc = audioCtx.createOscillator();
              const g = audioCtx.createGain();
              osc.type = "sine";
              osc.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 2.2);
              g.gain.setValueAtTime(0.001, audioCtx.currentTime + idx * 2.2);
              g.gain.exponentialRampToValueAtTime(0.035, audioCtx.currentTime + idx * 2.2 + 0.3);
              g.gain.exponentialRampToValueAtTime(0.0005, audioCtx.currentTime + totalDuration);
              osc.connect(g);
              g.connect(dest);
              osc.start(audioCtx.currentTime + idx * 2.2);
              osc.stop(audioCtx.currentTime + totalDuration);
            } catch {}
          });

          const startMs = Date.now();
          const totalMs = totalDuration * 1000;
          let switchedToAct5 = false;

          const timer = window.setInterval(() => {
            const elapsedMs = Date.now() - startMs;
            const prog = Math.min(1, elapsedMs / totalMs);
            const curSec = Math.min(totalDuration, elapsedMs / 1000);

            renderCustomInkFrame(curSec);
            const pct = Math.min(99, Math.round(74 + prog * 25));
            setInkWashExportPercent(pct);

            if (prog >= 0.72 && !switchedToAct5) {
              switchedToAct5 = true;
              setInkWashWorkingAct(5);
              setInkWashExportStage(
                "✉️ Bước cuối: Tiểu Long đóng Châu Ấn Cửu Nhị & xuất bản Video Thủy Mặc..."
              );
            }

            if (elapsedMs >= totalMs) {
              window.clearInterval(timer);
              try {
                if (recorder.state !== "inactive") recorder.stop();
              } catch {
                resolve();
              }
            }
          }, 42);
        });
      }

      const audioUrl = ttsAudioBlob ? URL.createObjectURL(ttsAudioBlob) : undefined;
      playGoldenChime432Hz();
      setInkWashExportPercent(100);
      setInkWashExportStage(
        `✓ Đã xuất xong Video Thủy Mặc ngắn gọn phân tích đủ ${orderedCards.length} lá bài!`
      );
      setConciseInkWashResult({
        question: effectiveQuestion,
        hexagram_title: hexTitle,
        direct_answer: directAnswer,
        card_analyses: cardAnalyses,
        key_turning_point: keyTurningPoint,
        final_verdict: finalVerdict,
        seal_chars: sealChars,
        video_url: recordedVideoUrl,
        video_ext: recordedExt,
        audio_url: audioUrl,
        duration: Math.round(totalDuration),
      });
      setIsExportingInkWashClip(false);
      setCopiedToast(
        `🎬 Tiểu Long Cửu Nhị đã xuất xong Video Thủy Mặc phân tích đầy đủ ${orderedCards.length} lá bài hiện ra!`
      );
      window.setTimeout(() => setCopiedToast(null), 4200);
    } catch (err: any) {
      console.error("InkWashExport Error:", err);
      setIsExportingInkWashClip(false);
      setCopiedToast("⚠️ Không thể xuất Video Thủy Mặc lúc này, vui lòng thử lại!");
      window.setTimeout(() => setCopiedToast(null), 3500);
    }
  }, [
    isExportingInkWashClip,
    dragonWakeState,
    isDragonUnlocked,
    getTodayDragonDateKey,
    mode,
    cards,
    userIntentQuestion,
    huongAnAnswer,
    directHomeVoice,
    playGoldenChime432Hz,
    scrollToHuongAnForChat,
  ]);

  /* ── Bộ hiển thị Màn Chiếu Video Thủy Mặc (Ngắn gọn súc tích · Phân tích đủ mọi lá bài · Trả lời trực tiếp câu hỏi · Hoạt ảnh Cửu Long làm việc) ── */
  const renderPhoneThuyMacView = useCallback(
    (isExpandedModal = false) => {
      const hasDivinationQuestion = Boolean(userIntentQuestion.trim());
      return (
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden p-2 gap-1.5">
          {/* Header Thủy Mặc */}
          <div className="rounded-xl px-2.5 py-1.5 bg-[#1A130C] border border-[#D4AF37]/45 flex items-center justify-between gap-2 shrink-0">
            <div className="min-w-0">
              <div className="text-[10px] font-serif font-bold uppercase tracking-wider text-[#E5C158] truncate">
                墨 Video Thủy Mặc · Phân Tích Đủ {cards.length} Lá Bài
              </div>
              <div className="text-[8.5px] text-[#C4A66A] truncate">
                {hasDivinationQuestion
                  ? `✓ Câu hỏi: “${userIntentQuestion.trim()}”`
                  : "🔒 Cần có Câu hỏi chiêm bốc để xuất & chiếu Video Thủy Mặc"}
              </div>
            </div>
            {!isExportingInkWashClip && (
              <button
                type="button"
                onClick={handleExportDragonInkWashVideo}
                className={`px-2.5 py-1 rounded-lg text-[9px] font-serif font-bold cursor-pointer transition shrink-0 ${
                  hasDivinationQuestion
                    ? "text-[#1C1610] bg-gradient-to-r from-[#FFF3B0] via-[#E5C158] to-[#C4963E] border border-[#FFF8E7] hover:brightness-105"
                    : "text-[#F3E5AB] bg-[#2D2115] hover:bg-[#3B2B1C] border border-[#D4AF37]/65"
                }`}
              >
                {!hasDivinationQuestion
                  ? "🔒 Nhập Câu Hỏi ↑"
                  : conciseInkWashResult
                  ? "↻ Xuất Lại Clip"
                  : "🎬 Xuất Video Ngay"}
              </button>
            )}
          </div>

          {!hasDivinationQuestion ? (
            /* KHI CHƯA CÓ CÂU HỎI CHIÊM BỐC: YÊU CẦU NHẬP CÂU HỎI TẠI HƯƠNG ÁN KHỞI NIỆM TRƯỚC KHI XUẤT CHIẾU THỦY MẶC */
            <div className="flex-1 min-h-0 overflow-y-auto rounded-2xl border border-[#D4AF37]/60 bg-gradient-to-b from-[#231910] via-[#18110B] to-[#120D08] p-3 text-[#FFF8E7] space-y-2.5 shadow-md">
              <div className="flex items-center justify-between text-[9.5px] text-[#E5C158] font-bold border-b border-[#D4AF37]/25 pb-1.5">
                <span className="flex items-center gap-1">
                  <span>🔒</span>
                  <span>Cần Câu Hỏi Chiêm Bốc Để Xuất Video Thủy Mặc</span>
                </span>
                <span className="px-1.5 py-0.5 rounded-full bg-[#3A2818] text-[#F3E5AB] text-[8px] border border-[#D4AF37]/45">
                  Bắt buộc
                </span>
              </div>

              <p className="text-[10.5px] leading-relaxed text-[#F5E6C4]">
                Kính thưa quý bạn! Để nhấn xuất & chiếu{" "}
                <strong className="text-[#E5C158]">
                  Video Thủy Mặc (Phiên bản ngắn gọn · Phân tích đầy đủ tất cả {cards.length} lá bài hiện ra)
                </strong>
                , quý bạn cần nhập <strong className="text-[#FFF3B0]">Câu hỏi chiêm bốc</strong> tại mục{" "}
                <strong className="text-[#F3E5AB]">「印 Hương Án Khởi Niệm · Câu Hỏi Chiêm Bốc」</strong> trước. Khi có câu hỏi,{" "}
                <strong className="text-[#F3E5AB]">Tiểu Long Cửu Nhị</strong> mới chạy hoạt ảnh làm việc và dựng clip Thủy Mặc trả lời thẳng vào vấn đề của quý bạn!
              </p>

              {/* Ô nhập nhanh câu hỏi chiêm bốc đồng bộ trực tiếp với Hương Án Khởi Niệm */}
              <div className="rounded-xl p-2.5 bg-[#140E09] border border-[#D4AF37]/40 space-y-1.5">
                <label className="block text-[9.5px] font-serif font-bold text-[#E5C158]">
                  🕯️ Nhập nhanh Câu hỏi chiêm bốc (Đồng bộ Hương Án Khởi Niệm):
                </label>
                <input
                  type="text"
                  value={userIntentQuestion}
                  onChange={(e) => setUserIntentQuestion(e.target.value)}
                  placeholder="Ví dụ: Tháng tới tôi có nên mở rộng kinh doanh không?..."
                  className="w-full h-8 px-2.5 rounded-lg text-[10.5px] bg-[#0D0906] text-[#FFF8E7] placeholder-[#8E7B60] border border-[#D4AF37]/50 focus:outline-none focus:border-[#F3E5AB]"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (isExpandedModal) setIsPhoneChatModalExpanded(false);
                  scrollToHuongAnForChat();
                }}
                className="w-full py-2 px-3 rounded-xl text-[10px] font-serif font-bold text-[#FFF8E7] border border-[#D4AF37]/80 cursor-pointer transition hover:brightness-110 flex items-center justify-center gap-1.5 shadow-sm"
                style={{
                  background: "linear-gradient(135deg, #8B1E22 0%, #5A1215 100%)",
                }}
              >
                <span>印</span>
                <span>Đi Tới Hương Án Khởi Niệm · Nhập Câu Hỏi Chiêm Bốc ↑</span>
              </button>
            </div>
          ) : isExportingInkWashClip ? (
            /* KHI ĐANG LÀM CLIP: CHẠY HOẠT ẢNH CỬU LONG LÀM VIỆC (ĐỌC SÁCH -> SOI QUẺ -> CHẤM MỰC HỌA THỦY MẶC -> GÕ MÁY -> ĐÓNG ẤN) */
            <div className="flex-1 min-h-0 flex flex-col justify-between rounded-2xl border border-[#D4AF37]/55 bg-gradient-to-b from-[#1E160E] via-[#130E09] to-[#0B0805] p-2.5 overflow-hidden shadow-inner">
              <div className="flex items-center justify-between text-[9.5px] font-serif font-bold text-[#F3E5AB] border-b border-[#D4AF37]/25 pb-1.5 shrink-0">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block animate-spin">⏳</span>
                  <span>Tiểu Long Cửu Nhị Đang Làm Clip Thủy Mặc ({cards.length} lá bài)...</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#8B1E22] text-[#FFF8E7] border border-[#D4AF37]/60 text-[8.5px]">
                  {inkWashExportPercent}%
                </span>
              </div>

              {/* Khung video hoạt ảnh Cửu Long đang làm việc */}
              <div className="my-1.5 flex-1 min-h-[210px] rounded-xl overflow-hidden border-2 border-[#D4AF37]/65 bg-[#090705] relative shadow-lg flex items-center justify-center">
                <video
                  key={DRAGON_VIDEO_MAP[inkWashWorkingAct].src}
                  src={DRAGON_VIDEO_MAP[inkWashWorkingAct].src}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/75 border border-[#D4AF37]/55 text-[8.5px] font-serif font-bold text-[#F3E5AB]">
                  {DRAGON_VIDEO_MAP[inkWashWorkingAct].badge}
                </div>
                <div className="absolute bottom-2 inset-x-2 px-2.5 py-1.5 rounded-xl bg-black/80 backdrop-blur-xs border border-[#D4AF37]/45 text-[9.5px] text-[#FFF8E7] font-serif">
                  {inkWashExportStage}
                </div>
              </div>

              {/* Thanh tiến độ 4 bước làm việc của Tiểu Long Cửu Nhị */}
              <div className="space-y-1.5 shrink-0">
                <div className="w-full h-2 rounded-full bg-[#241A10] border border-[#D4AF37]/35 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#8B1E22] via-[#D4AF37] to-[#FFF3B0] transition-all duration-300"
                    style={{ width: `${inkWashExportPercent}%` }}
                  />
                </div>
                <div className="grid grid-cols-4 gap-1 text-[8px] font-serif text-center">
                  <span
                    className={`py-0.5 rounded border ${
                      inkWashExportPercent >= 10
                        ? "bg-[#2C2014] text-[#F3E5AB] border-[#D4AF37]/60 font-bold"
                        : "bg-[#140E09] text-[#8E7B60] border-[#D4AF37]/20"
                    }`}
                  >
                    1.📖 Đọc Sách
                  </span>
                  <span
                    className={`py-0.5 rounded border ${
                      inkWashExportPercent >= 34
                        ? "bg-[#2C2014] text-[#F3E5AB] border-[#D4AF37]/60 font-bold"
                        : "bg-[#140E09] text-[#8E7B60] border-[#D4AF37]/20"
                    }`}
                  >
                    2.🔍 Soi Quẻ
                  </span>
                  <span
                    className={`py-0.5 rounded border ${
                      inkWashExportPercent >= 56
                        ? "bg-[#2C2014] text-[#F3E5AB] border-[#D4AF37]/60 font-bold"
                        : "bg-[#140E09] text-[#8E7B60] border-[#D4AF37]/20"
                    }`}
                  >
                    3.✍️ Họa Mực
                  </span>
                  <span
                    className={`py-0.5 rounded border ${
                      inkWashExportPercent >= 74
                        ? "bg-[#2C2014] text-[#F3E5AB] border-[#D4AF37]/60 font-bold"
                        : "bg-[#140E09] text-[#8E7B60] border-[#D4AF37]/20"
                    }`}
                  >
                    4.💻 Xuất Clip
                  </span>
                </div>
              </div>
            </div>
          ) : conciseInkWashResult ? (
            /* KHI ĐÃ LÀM XONG CLIP: CHIẾU VIDEO THỦY MẶC NGẮN GỌN SÚC TÍCH NHƯNG PHÂN TÍCH ĐẦY ĐỦ TẤT CẢ LÁ BÀI HIỆN RA */
            <div
              className="flex-1 min-h-0 overflow-y-auto rounded-2xl border border-[#D4AF37]/45 bg-[#110C08]/95 p-2 space-y-2 shadow-inner"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(212,175,55,0.4) transparent",
              }}
            >
              {/* Màn chiếu Video Thủy Mặc 9:16 */}
              {conciseInkWashResult.video_url && (
                <div className="relative w-full rounded-xl overflow-hidden border-2 border-[#D4AF37]/75 bg-[#EAE3D2] shadow-lg">
                  <video
                    key={conciseInkWashResult.video_url}
                    src={conciseInkWashResult.video_url}
                    controls
                    autoPlay
                    loop
                    playsInline
                    className={`w-full ${isExpandedModal ? "max-h-[420px]" : "max-h-[285px]"} object-contain bg-[#EAE3D2]`}
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#1C1610]/85 border border-[#D4AF37]/70 text-[8.5px] font-serif font-bold text-[#F3E5AB] pointer-events-none">
                    墨 Thủy Mặc · Đủ {conciseInkWashResult.card_analyses?.length || cards.length} Lá · {conciseInkWashResult.duration}s
                  </span>
                </div>
              )}

              {/* Nút Tải Video Thủy Mặc & Xuất Lại */}
              <div className="flex items-center gap-1.5">
                {conciseInkWashResult.video_url && (
                  <a
                    href={conciseInkWashResult.video_url}
                    download={`video-thuy-mac-cuu-nhi-${Date.now()}.${conciseInkWashResult.video_ext}`}
                    className="flex-1 py-1.5 px-3 rounded-xl text-[10px] font-serif font-bold text-[#1C1610] bg-gradient-to-r from-[#FFF3B0] via-[#E5C158] to-[#C4963E] border border-[#FFF8E7] shadow-sm text-center cursor-pointer hover:brightness-105"
                  >
                    ⬇ Tải Video Thủy Mặc (.{conciseInkWashResult.video_ext})
                  </a>
                )}
                <button
                  type="button"
                  onClick={handleExportDragonInkWashVideo}
                  className="py-1.5 px-2.5 rounded-xl text-[9.5px] font-serif font-bold text-[#FFF8E7] bg-[#261C12] hover:bg-[#36281A] border border-[#D4AF37]/50 cursor-pointer shrink-0"
                >
                  🎬 Dựng Lại
                </button>
              </div>

              {/* Thẻ tóm tắt Lời Đáp Trực Tiếp & Phân Tích Đầy Đủ Tất Cả Lá Bài Hiện Ra */}
              <div className="rounded-xl p-2.5 border border-[#D4AF37]/40 bg-gradient-to-b from-[#1E160E] to-[#140E09] space-y-1.5 text-[10px] leading-relaxed">
                <div className="flex items-center justify-between border-b border-[#D4AF37]/25 pb-1">
                  <span className="font-serif font-bold text-[#E5C158] text-[10.5px]">
                    ✦ {conciseInkWashResult.hexagram_title}
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-[#8B1E22] text-[#FFF8E7] font-serif font-bold text-[8.5px] border border-[#D4AF37]/50">
                    Ấn: {conciseInkWashResult.seal_chars}
                  </span>
                </div>
                <div className="text-[#F3E5AB]">
                  <strong className="text-[#E5C158]">• Câu hỏi:</strong> “{conciseInkWashResult.question}”
                </div>
                <div className="text-[#FFF8E7]">
                  <strong className="text-emerald-300">1. Trả lời trực tiếp:</strong> {conciseInkWashResult.direct_answer}
                </div>

                {/* Danh sách phân tích ngắn gọn đầy đủ tất cả các lá bài hiện ra */}
                {Array.isArray(conciseInkWashResult.card_analyses) &&
                  conciseInkWashResult.card_analyses.length > 0 && (
                    <div className="space-y-1 pt-0.5">
                      <div className="font-bold text-[#E5C158]">
                        2. Phân tích đầy đủ {conciseInkWashResult.card_analyses.length} lá bài hiện ra:
                      </div>
                      <div className="space-y-1 pl-1">
                        {conciseInkWashResult.card_analyses.map((ca) => (
                          <div
                            key={ca.card_number}
                            className="p-1.5 rounded-lg bg-[#18110B] border border-[#D4AF37]/25 text-[#E5D3B3]"
                          >
                            <span className="font-serif font-bold text-[#FFF3B0]">
                              • Lá {ca.card_number} ({ca.position_label} · {ca.card_title}):
                            </span>{" "}
                            <span>{ca.concise_analysis}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                <div className="p-2 rounded-lg bg-[#241A10] border border-[#D4AF37]/45 text-[#FFF3B0]">
                  <strong>3. Châu Ấn quyết đoán:</strong> {conciseInkWashResult.final_verdict}
                </div>
              </div>
            </div>
          ) : (
            /* MÀN HÌNH CHỜ KHI ĐÃ CÓ CÂU HỎI CHIÊM BỐC NHƯNG CHƯA NHẤN NÚT XUẤT VIDEO THỦY MẶC */
            <div className="flex-1 min-h-0 flex flex-col justify-between rounded-2xl border border-[#D4AF37]/40 bg-[#130E09] p-3 text-[#FFF8E7]">
              <div className="space-y-2">
                <div className="text-[11px] font-serif font-bold text-[#E5C158]">
                  🎬 Xuất Video Thủy Mặc Ngắn Gọn · Phân Tích Đủ {cards.length} Lá Bài
                </div>
                <div className="rounded-lg p-2 bg-[#1B140C] border border-emerald-500/40 text-[9.5px] text-[#F3E5AB]">
                  <span className="text-emerald-300 font-bold">✓ Câu hỏi chiêm bốc:</span> “{userIntentQuestion.trim()}”
                </div>
                <p className="text-[10.5px] leading-relaxed text-[#E5D3B3]">
                  Khi nhấn nút bên dưới, <strong className="text-[#F3E5AB]">Tiểu Long Cửu Nhị</strong> sẽ chạy hoạt ảnh làm việc (Đọc sách cổ ➔ Soi kính lúp ➔ Chấm mực họa Thủy Mặc ➔ Gõ máy dựng clip ➔ Đóng Ấn Chu Sa) và chiếu ngay{" "}
                  <strong className="text-[#E5C158]">Video Thủy Mặc (水墨周易)</strong> phiên bản ngắn gọn súc tích nhưng phân tích đầy đủ tất cả{" "}
                  <strong className="text-[#FFF3B0]">{cards.length} lá bài</strong> đang hiện ra!
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportDragonInkWashVideo}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-serif font-bold text-[#1C1610] bg-gradient-to-r from-[#FFF3B0] via-[#E5C158] to-[#C4963E] border border-[#FFF8E7] shadow-md cursor-pointer hover:brightness-105 flex items-center justify-center gap-2"
              >
                <span>🎬</span>
                <span>Xuất & Chiếu Video Thủy Mặc Ngay</span>
              </button>
            </div>
          )}
        </div>
      );
    },
    [
      userIntentQuestion,
      isExportingInkWashClip,
      inkWashWorkingAct,
      inkWashExportPercent,
      inkWashExportStage,
      conciseInkWashResult,
      handleExportDragonInkWashVideo,
      scrollToHuongAnForChat,
    ]
  );

  const startDirectHomeBackgroundPolling = useCallback(() => {
    stopDirectHomePolling();

    const pollOnce = async () => {
      try {
        const stRes = await fetchDirectHomeApi("/api/direct_home/status").catch(() => null);
        if (!stRes || !stRes.ok) return;
        const stData = await stRes.json();

        if (stData.status === "running") {
          setIsDirectHomeRunning(true);
          if (typeof stData.percent === "number" && stData.percent > 0) {
            setDirectHomePercent((prev) => Math.max(prev > 40 ? 40 : prev, stData.percent));
          }
          if (typeof stData.elapsed_seconds === "number") {
            setDirectHomeElapsed(stData.elapsed_seconds);
          }
          if (typeof stData.eta_remaining_seconds === "number") {
            setDirectHomeEtaRemaining(stData.eta_remaining_seconds);
          }
          if (stData.eta_text) {
            setDirectHomeEtaText(stData.eta_text);
          }
          if (typeof stData.estimated_total_seconds === "number") {
            setDirectHomeEstimatedTotal(stData.estimated_total_seconds);
          }
          if (stData.message) {
            setDirectHomeStage(stData.message);
            setDirectHomeMessage(stData.message);
          }
          if (typeof document !== "undefined") {
            const remLabel = stData.eta_text || `~${stData.eta_remaining_seconds || 30}s`;
            document.title = `⏳ ${stData.percent || 50}% (${remLabel}) · Đang tạo Video Kinh Dịch...`;
          }
        } else if (stData.status === "completed" && stData.result) {
          stopDirectHomePolling();
          const cacheBuster = Date.now();
          const syncedResult = {
            ...stData.result,
            video_url: stData.result.video_url ? `${stData.result.video_url}?t=${cacheBuster}` : undefined,
            audio_url: stData.result.audio_url ? `${stData.result.audio_url}?t=${cacheBuster}` : undefined,
            image_url: stData.result.image_url ? `${stData.result.image_url}?t=${cacheBuster}` : undefined,
          };
          setDirectHomePercent(100);
          setDirectHomeEtaRemaining(0);
          setDirectHomeEtaText("Đã hoàn tất");
          if (typeof stData.elapsed_seconds === "number") {
            setDirectHomeElapsed(stData.elapsed_seconds);
          }

          const jobId = stData.job_id || `${stData.result.video_url || ""}`;
          const isNewCompletion = !jobId || jobId !== lastNotifiedJobIdRef.current;

          if (isNewCompletion) {
            if (jobId) {
              lastNotifiedJobIdRef.current = jobId;
              try {
                localStorage.setItem("cuunhi_home_notified_job_id", jobId);
              } catch {}
            }
            playGoldenChime432Hz();
            const hexTitle = stData.result.hexagram_title || "Quẻ Kinh Dịch";
            const dur = stData.result.duration;
            setDirectHomeReadyBanner({
              hexagramTitle: hexTitle,
              duration: dur,
              videoUrl: syncedResult.video_url,
              totalTime: stData.elapsed_seconds || stData.result.total_time,
            });

            if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
              try {
                const notif = new Notification("🎬 Video Kinh Dịch 9:16 đã hoàn tất!", {
                  body: `${hexTitle} (${dur ? `${dur}s` : "Full HD"}) đã dựng xong. Bấm để xem & tải ngay!`,
                  tag: "cuunhi-home-video-done",
                });
                notif.onclick = () => {
                  window.focus();
                  notif.close();
                  const el = document.getElementById("direct-home-phone-mockup");
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                };
              } catch {}
            }

            if (typeof document !== "undefined" && document.hidden) {
              if (titleBlinkRef.current) window.clearInterval(titleBlinkRef.current);
              let toggle = false;
              titleBlinkRef.current = window.setInterval(() => {
                document.title = toggle
                  ? `🔔 (1) VIDEO ĐÃ XONG! · ${hexTitle}`
                  : "Cửu Nhị · Mệnh Lý, Phong Thủy & Kinh Dịch";
                toggle = !toggle;
              }, 1000);
            } else if (typeof document !== "undefined") {
              document.title = "Cửu Nhị · Mệnh Lý, Phong Thủy & Kinh Dịch";
            }

            setIsDragonSendingFinale(false);
            setIsDirectHomeRunning(false);
            setDirectHomeResult(syncedResult);
            setDirectHomeStage("Hoàn tất 100%! Video 9:16 đã đồng bộ chuẩn xác với từng lá bài trong quẻ.");
            setDirectHomeMessage("Hoàn tất 100%! Video 9:16 đã đồng bộ chuẩn xác với từng lá bài trong quẻ.");
            setShowPhoneVideoMode(true);
            setCopiedToast("✨ Tự động hóa hoàn tất! Video 9:16 đã sẵn sàng phát & tải xuống!");
            window.setTimeout(() => setCopiedToast(null), 5000);
          } else {
            setIsDirectHomeRunning(false);
            setDirectHomeResult(syncedResult);
            setShowPhoneVideoMode(true);
          }
        } else if (stData.status === "error") {
          stopDirectHomePolling();
          if (typeof document !== "undefined") {
            document.title = "Cửu Nhị · Mệnh Lý, Phong Thủy & Kinh Dịch";
          }
          setIsDirectHomeRunning(false);
          setDirectHomeStage(stData.error || "Lỗi khi xử lý tự động hóa.");
          setCopiedToast("⚠️ " + (stData.error || "Có lỗi khi xử lý tự động hóa"));
          setTimeout(() => setCopiedToast(null), 4000);
        }
      } catch {}
    };

    pollOnce();
    try {
      const blob = new Blob(["setInterval(function(){ postMessage('tick'); }, 1000);"], {
        type: "application/javascript",
      });
      const worker = new Worker(URL.createObjectURL(blob));
      worker.onmessage = () => {
        pollOnce();
      };
      worker.onerror = () => {
        if (!directHomePollRef.current) {
          directHomePollRef.current = window.setInterval(pollOnce, 1200);
        }
      };
      directHomeWorkerRef.current = worker;
      // Dự phòng bổ sung thêm timer 2s cho trình duyệt di động khi worker bị hạn chế
      if (!directHomePollRef.current) {
        directHomePollRef.current = window.setInterval(pollOnce, 2000);
      }
    } catch {
      directHomePollRef.current = window.setInterval(pollOnce, 1000);
    }
  }, [stopDirectHomePolling, playGoldenChime432Hz]);

  useEffect(() => {
    return () => {
      stopDirectHomePolling();
    };
  }, [stopDirectHomePolling]);

  // Khi người dùng bốc quẻ mới hoặc đổi trận pháp trên trang chủ, tự động đồng bộ lại màn hình điện thoại theo quẻ mới
  const cardsSignature =
    cards.map((c) => `${c.id}:${c.hexNumber}:${c.yaoNumber || 0}:${c.positionLabel || ""}`).join("|") +
    `|${mode}|${isCard2Reversed}|${isCard2AReversed}|${isCard2BReversed}|${menhBranchNumber}`;
  const prevCardsSigRef = useRef<string>(cardsSignature);
  useEffect(() => {
    if (prevCardsSigRef.current !== cardsSignature) {
      prevCardsSigRef.current = cardsSignature;
      if (!isDirectHomeRunning) {
        setDirectHomeCapturedImg("");
        setDirectHomeResult(null);
        setShowPhoneVideoMode(false);
        setDirectHomePercent(0);
        setDirectHomeMessage("Đã cập nhật quẻ mới trên Trang Chủ · Nhấn Tự Động Hóa Toàn Bộ để luận giải & dựng Video 9:16");
      }
    }
  }, [cardsSignature, isDirectHomeRunning]);

  const stopVoiceQuestionRecording = useCallback(() => {
    setIsRecordingVoiceQ(false);
    if (voiceTimerRef.current) {
      window.clearInterval(voiceTimerRef.current);
      voiceTimerRef.current = null;
    }
    if (speechRecRef.current) {
      const rec = speechRecRef.current;
      speechRecRef.current = null;
      try {
        rec.stop();
      } catch {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    } else if (voiceStreamRef.current) {
      try {
        voiceStreamRef.current.getTracks().forEach((t) => t.stop());
      } catch {}
      voiceStreamRef.current = null;
    }
  }, []);

  const handleToggleVoiceQuestion = useCallback(async () => {
    if (typeof window === "undefined" || isTranscribingVoiceQ) return;

    if (isRecordingVoiceQ) {
      stopVoiceQuestionRecording();
      return;
    }

    const baseText = userIntentQuestion.trim() ? userIntentQuestion.trim() + " " : "";
    voiceBaseTextRef.current = baseText;
    liveSpeechTextRef.current = "";
    setVoiceRecordSec(0);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCopiedToast("⚠️ Trình duyệt không hỗ trợ truy cập Microphone.");
      setTimeout(() => setCopiedToast(null), 3500);
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      voiceStreamRef.current = stream;
    } catch {
      setCopiedToast("⚠️ Không thể truy cập Microphone. Vui lòng cấp quyền micro cho trình duyệt.");
      setTimeout(() => setCopiedToast(null), 3500);
      return;
    }

    try {
      audioChunksRef.current = [];
      let chosenMime = "";
      if (typeof MediaRecorder !== "undefined") {
        for (const mt of ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"]) {
          try {
            if (MediaRecorder.isTypeSupported(mt)) {
              chosenMime = mt;
              break;
            }
          } catch {}
        }
      }

      const recorder = chosenMime
        ? new MediaRecorder(stream, { mimeType: chosenMime })
        : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.onstart = () => {
        setIsRecordingVoiceQ(true);
        setVoiceRecordSec(0);
        setCopiedToast("🎙️ Đang thu âm câu hỏi tiếng Việt... Nói xong hãy bấm lại nút mic");
        if (voiceTimerRef.current) window.clearInterval(voiceTimerRef.current);
        voiceTimerRef.current = window.setInterval(() => {
          setVoiceRecordSec((prev) => {
            if (prev + 1 >= 60) {
              stopVoiceQuestionRecording();
            }
            return prev + 1;
          });
        }, 1000);
      };

      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        if (voiceTimerRef.current) {
          window.clearInterval(voiceTimerRef.current);
          voiceTimerRef.current = null;
        }
        if (voiceStreamRef.current) {
          try {
            voiceStreamRef.current.getTracks().forEach((t) => t.stop());
          } catch {}
          voiceStreamRef.current = null;
        }

        const blobType = recorder.mimeType || chosenMime || "audio/webm";
        const audioBlob = new Blob(audioChunksRef.current, { type: blobType });
        if (audioBlob.size < 300) {
          setIsRecordingVoiceQ(false);
          setIsTranscribingVoiceQ(false);
          return;
        }

        setIsRecordingVoiceQ(false);
        setIsTranscribingVoiceQ(true);
        setCopiedToast("⚡ Đang nhận diện giọng nói thành văn bản tiếng Việt...");

        try {
          const res = await fetchDirectHomeApi("/api/transcribe", {
            method: "POST",
            headers: { "Content-Type": blobType },
            body: audioBlob,
          });

          const data = await res.json();
          if (data && data.success && data.text && data.text.trim()) {
            const finalQuestion = voiceBaseTextRef.current + data.text.trim();
            handleQuestionChange(finalQuestion);
            setCopiedToast("✓ Đã điền câu hỏi bằng giọng nói!");
            setTimeout(() => setCopiedToast(null), 2500);
          } else if (liveSpeechTextRef.current.trim()) {
            handleQuestionChange(voiceBaseTextRef.current + liveSpeechTextRef.current.trim());
            setCopiedToast("✓ Đã điền câu hỏi bằng giọng nói!");
            setTimeout(() => setCopiedToast(null), 2500);
          } else {
            setCopiedToast("⚠️ " + (data?.error || "Không nghe rõ câu hỏi. Vui lòng nói to, rõ hơn vào micro."));
            setTimeout(() => setCopiedToast(null), 3800);
          }
        } catch {
          if (liveSpeechTextRef.current.trim()) {
            handleQuestionChange(voiceBaseTextRef.current + liveSpeechTextRef.current.trim());
            setCopiedToast("✓ Đã điền câu hỏi bằng giọng nói!");
            setTimeout(() => setCopiedToast(null), 2500);
          } else {
            setCopiedToast("⚠️ Lỗi kết nối dịch vụ nhận diện giọng nói.");
            setTimeout(() => setCopiedToast(null), 3500);
          }
        } finally {
          setIsTranscribingVoiceQ(false);
        }
      };

      recorder.start(250);
    } catch {
      try {
        stream.getTracks().forEach((t) => t.stop());
      } catch {}
      voiceStreamRef.current = null;
      setIsRecordingVoiceQ(false);
      return;
    }

    // Optional live interim preview via Web Speech API (isolated so its errors never interrupt MediaRecorder)
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec && !webSpeechBrokenRef.current) {
      try {
        const rec = new SpeechRec();
        rec.lang = "vi-VN";
        rec.continuous = true;
        rec.interimResults = true;
        let finalTranscript = "";

        rec.onresult = (ev: any) => {
          let interimTranscript = "";
          for (let i = ev.resultIndex; i < ev.results.length; i++) {
            const r = ev.results[i];
            if (r.isFinal) {
              finalTranscript += r[0].transcript + " ";
            } else {
              interimTranscript += r[0].transcript;
            }
          }
          const combined = (finalTranscript + interimTranscript).trim();
          liveSpeechTextRef.current = combined;
          if (combined) {
            handleQuestionChange(voiceBaseTextRef.current + combined);
          }
        };

        rec.onerror = (ev: any) => {
          if (ev?.error === "network" || ev?.error === "service-not-allowed" || ev?.error === "not-allowed") {
            webSpeechBrokenRef.current = true;
          }
          try {
            rec.stop();
          } catch {}
          if (speechRecRef.current === rec) {
            speechRecRef.current = null;
          }
        };

        rec.onend = () => {
          if (speechRecRef.current === rec) {
            speechRecRef.current = null;
          }
        };

        speechRecRef.current = rec;
        rec.start();
      } catch {
        speechRecRef.current = null;
      }
    }
  }, [isRecordingVoiceQ, isTranscribingVoiceQ, userIntentQuestion, handleQuestionChange, stopVoiceQuestionRecording]);

  // Helper kiểm tra IP nội bộ LAN (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
  const isPrivateLanIp = useCallback((host: string) => {
    return /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(host);
  }, []);

  // Helper kết nối an toàn cho cả PC, điện thoại di động (qua LAN IP) và tên miền thật (ichingtarot.com)
  const fetchDirectHomeApi = useCallback(async (endpoint: string, options?: RequestInit): Promise<Response> => {
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const candidates: string[] = [];

    if (typeof window !== "undefined" && window.location) {
      const { protocol, hostname, port } = window.location;
      const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
      const isLan = isPrivateLanIp(hostname);

      if (isLocalhost || isLan) {
        // Đang chạy nội bộ (localhost hoặc LAN Wi-Fi): ưu tiên đường dẫn tương đối
        candidates.push(cleanEndpoint);
        if (isLan && port !== "8000") {
          candidates.push(`${protocol}//${hostname}:8000${cleanEndpoint}`);
        }
        candidates.push(`http://localhost:8000${cleanEndpoint}`);
        candidates.push(`http://127.0.0.1:8000${cleanEndpoint}`);
      } else {
        // Đang mở trên tên miền công khai (ví dụ ichingtarot.com):
        // Chỉ gọi đường dẫn tương đối trên cùng tên miền để tránh lỗi CORS / Private Network Access
        candidates.push(cleanEndpoint);
      }
    } else {
      candidates.push(cleanEndpoint);
    }

    const uniqueCandidates = Array.from(new Set(candidates));
    let lastError: any = null;
    let lastResponse: Response | null = null;

    for (let i = 0; i < uniqueCandidates.length; i++) {
      const url = uniqueCandidates[i];
      try {
        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), 3200);
        const res = await fetch(url, { ...options, signal: controller.signal });
        window.clearTimeout(timeoutId);
        lastResponse = res;
        const contentType = (res.headers.get("content-type") || "").toLowerCase();

        // Nếu máy chủ tĩnh (Cloudflare SPA / Vite) trả về text/html cho API endpoint, bỏ qua để thử ứng viên tiếp theo
        if (contentType.includes("text/html")) {
          continue;
        }

        if (res.ok) {
          return res;
        }

        // Nếu gặp lỗi định tuyến / proxy (404, 405, 502, 503, 504) thì thử tiếp ứng viên sau
        if ([404, 405, 502, 503, 504].includes(res.status) && i < uniqueCandidates.length - 1) {
          continue;
        }

        return res;
      } catch (err) {
        lastError = err;
      }
    }

    if (lastResponse && !(lastResponse.headers.get("content-type") || "").toLowerCase().includes("text/html")) {
      return lastResponse;
    }
    throw lastError || new Error(`Không thể kết nối dịch vụ Luận Giải & Tạo Video Thủy Mặc.`);
  }, [isPrivateLanIp]);

  // Tự động kiểm tra trạng thái chạy ngầm khi vừa mở hoặc tải lại trang
  useEffect(() => {
    let mounted = true;
    fetchDirectHomeApi("/api/direct_home/status")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!mounted || !data) return;
        if (data.status === "running") {
          setIsDirectHomeRunning(true);
          setDirectHomePercent(data.percent || 15);
          setDirectHomeStage(data.stage || "Đang xử lý ngầm...");
          setDirectHomeMessage(data.message || "Đang luận giải & tạo video 9:16...");
          if (typeof data.elapsed_seconds === "number") setDirectHomeElapsed(data.elapsed_seconds);
          if (typeof data.estimated_total_seconds === "number") setDirectHomeEstimatedTotal(data.estimated_total_seconds);
          if (typeof data.eta_remaining_seconds === "number") setDirectHomeEtaRemaining(data.eta_remaining_seconds);
          if (data.eta_text) setDirectHomeEtaText(data.eta_text);
          startDirectHomeBackgroundPolling();
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [fetchDirectHomeApi, startDirectHomeBackgroundPolling]);

  const resolveMediaUrl = useCallback((relOrAbs?: string) => {
    if (!relOrAbs) return "";
    if (
      relOrAbs.startsWith("http://") ||
      relOrAbs.startsWith("https://") ||
      relOrAbs.startsWith("data:") ||
      relOrAbs.startsWith("blob:")
    ) {
      if (typeof window !== "undefined" && window.location && isPrivateLanIp(window.location.hostname)) {
        if (relOrAbs.includes("localhost:8000") || relOrAbs.includes("127.0.0.1:8000")) {
          return relOrAbs.replace(/(?:localhost|127\.0\.0\.1):8000/, `${window.location.hostname}:8000`);
        }
      }
      return relOrAbs;
    }
    const clean = relOrAbs.startsWith("/") ? relOrAbs : `/${relOrAbs}`;
    if (typeof window !== "undefined" && window.location) {
      const { protocol, hostname, port } = window.location;
      if (port === "5168" || port === "5173" || port === "8000") {
        return clean;
      }
      if (isPrivateLanIp(hostname)) {
        return `${protocol}//${hostname}:8000${clean}`;
      }
      return `http://localhost:8000${clean}`;
    }
    return clean;
  }, [isPrivateLanIp]);

  // Engine Luận Trực Tiếp & Dựng Video 9:16 ngay trên trình duyệt (chạy tự động trên ichingtarot.com / điện thoại khi không qua port 8000)
  const runBrowserDirectHomeEngine = useCallback(
    async (
      effectiveQuestion: string,
      capturedPng: string,
      cardImgsBase64: string[],
      aiText: string
    ) => {
      const startedAt = Date.now();
      const spreadTitle = SPREAD_MODE_NAMES[mode] || "Trải Bài Kinh Dịch";
      const orderedCards =
        mode === "khong_minh" && cards[2]
          ? [cards[2]]
          : mode === "thap_la" && cards.length > 2
          ? [cards[0], ...cards.slice(2), cards[1]]
          : [...cards];

      const cleanCardNames = orderedCards.map((c) =>
        c.name.replace(/^Quẻ (Chủ|Biến):\s*/i, "").trim()
      );
      const hexagramTitle = `${spreadTitle} · ${cleanCardNames.slice(0, 3).join(" • ")}`;

      setDirectHomePercent(42);
      setDirectHomeStage("Đại Sư Cửu Nhị đang luận giải chi tiết từng lá bài trong quẻ...");
      setDirectHomeMessage("Bước 3/4: Đang tổng hợp lời bàn Kinh Dịch & biên soạn kịch bản thuyết minh 9:16...");

      const cardNarrations = orderedCards.map((c, idx) => {
        const posName =
          c.positionLabel ||
          (mode === "thap_la"
            ? idx === 0
              ? "Quẻ Chủ"
              : idx === orderedCards.length - 1
              ? "Quẻ Biến"
              : `Hào Động ${idx}`
            : `Lá thứ ${idx + 1}`);
        const shortDesc = (c.desc || "")
          .replace(/【[^】]*】/g, "").replace(/[\u2E80-\u2EFF\u3000-\u303F\u3400-\u4DBF\u4DC0-\u4DFF\u4E00-\u9FFF\uF900-\uFAFF\uFF00-\uFFEF]+/g, " ").replace(/\(\s*[-·•,;:]*\s*\)/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 130);
        return `${posName} ứng vào ${c.name}: ${shortDesc}.`;
      });

      const hookText = userIntentQuestion.trim()
        ? `Ứng với tâm niệm “${userIntentQuestion.trim()}”, quẻ ${cleanCardNames[0] || "Kinh Dịch"} đã hiển lộ thông điệp quan trọng.`
        : `Trải bài ${spreadTitle} vừa khởi phát với chủ quẻ ${cleanCardNames[0] || "Cát Tường"}, soi sáng vận trình hiện tại của bạn.`;

      const summaryAdvice =
        userCustomAnswer.trim() ||
        hexagramPrediction.trim() ||
        `Giữ tâm chính định, thuận theo đạo lý của ${cleanCardNames[0] || "quẻ Dịch"}, làm chắc từng bước trước mắt và trọng chữ Tín thì mưu sự ắt hanh thông.`;

      const videoScript = [
        hookText,
        ...cardNarrations,
        `Lời khuyên cốt lõi từ Cửu Nhị Đại Sư: ${summaryAdvice}`,
      ]
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      const fullInterpretation = [
        `## ☯ ${hexagramTitle}`,
        `**Câu hỏi / Tâm niệm:** ${effectiveQuestion}`,
        "",
        `### 1. Điểm Nhấn Thiên Cơ (Hook)`,
        `> ${hookText}`,
        "",
        `### 2. Luận Giải Chi Tiết Từng Lá Bài Trong Trận Pháp`,
        ...orderedCards.map((c, idx) => {
          const posLabel = c.positionLabel || `Vị trí ${idx + 1}`;
          return `- **Lá ${idx + 1} (${posLabel}) — ${c.name} (${c.sub || ""}):**\n  ${c.desc || ""}`;
        }),
        "",
        `### 3. Lời Khuyên & Định Hướng Hành Động Từ Cửu Nhị Đại Sư`,
        `${summaryAdvice}`,
        "",
        `---`,
        `### 4. Kịch Bản Thuyết Minh Video 9:16`,
        `_${videoScript}_`,
      ].join("\n");

      // Bước thu âm giọng đọc tiếng Việt (/api/tts)
      setDirectHomePercent(58);
      setDirectHomeStage("Đang tổng hợp giọng đọc thuyết minh tiếng Việt...");
      setDirectHomeMessage("Đang thu âm giọng đọc thuyết minh cho từng lá bài trong quẻ...");

      let audioBlob: Blob | null = null;
      try {
        const ttsRes = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: videoScript, voice: directHomeVoice }),
        });
        if (ttsRes.ok) {
          const ab = await ttsRes.arrayBuffer();
          if (ab.byteLength > 200) {
            audioBlob = new Blob([ab], { type: "audio/mpeg" });
          }
        }
      } catch {}

      // Dự phòng tạo file WAV âm thanh thiền định 432Hz nếu đang ngoại tuyến
      const createFallbackWavBlob = (durationSec = 14): Blob => {
        const sampleRate = 22050;
        const numSamples = sampleRate * durationSec;
        const buffer = new ArrayBuffer(44 + numSamples * 2);
        const view = new DataView(buffer);
        const writeStr = (offset: number, str: string) => {
          for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
        };
        writeStr(0, "RIFF");
        view.setUint32(4, 36 + numSamples * 2, true);
        writeStr(8, "WAVE");
        writeStr(12, "fmt ");
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeStr(36, "data");
        view.setUint32(40, numSamples * 2, true);
        for (let i = 0; i < numSamples; i++) {
          const t = i / sampleRate;
          const env = Math.min(1, t / 0.8) * Math.min(1, (durationSec - t) / 1.2);
          const bell = Math.exp(-(t % 3.5) * 1.6) * Math.sin(2 * Math.PI * 432 * t);
          const harmonic = 0.4 * Math.sin(2 * Math.PI * 216 * t) + 0.25 * Math.sin(2 * Math.PI * 648 * t);
          const sample = Math.max(-1, Math.min(1, (bell * 0.55 + harmonic * 0.35) * env * 0.35));
          view.setInt16(44 + i * 2, sample * 32767, true);
        }
        return new Blob([buffer], { type: "audio/wav" });
      };

      if (!audioBlob) {
        audioBlob = createFallbackWavBlob(Math.max(12, orderedCards.length * 4));
      }

      const audioUrl = URL.createObjectURL(audioBlob);

      // Bước dựng Video MP4/WebM 9:16 trực tiếp trên Canvas 540x960
      setDirectHomePercent(74);
      setDirectHomeStage("Đang dựng Video dọc 9:16 đồng bộ từng lá bài & phụ đề...");
      setDirectHomeMessage("Bước 4/4: Đang xuất bản Video 9:16 HD đồng bộ lá bài & giọng đọc...");

      const loadImg = (src: string): Promise<HTMLImageElement | null> =>
        new Promise((resolve) => {
          if (!src) return resolve(null);
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = () => resolve(null);
          img.src = src;
        });

      const cardImages: (HTMLImageElement | null)[] = [];
      for (let i = 0; i < orderedCards.length; i++) {
        const srcCandidate = cardImgsBase64[i] || orderedCards[i].img || capturedPng;
        cardImages.push(await loadImg(srcCandidate));
      }
      const fallbackBoardImg = capturedPng ? await loadImg(capturedPng) : null;

      let videoUrl = "";
      let finalDuration = Math.max(12, orderedCards.length * 4.5);

      try {
        const canvas = document.createElement("canvas");
        canvas.width = 540;
        canvas.height = 960;
        const ctx = canvas.getContext("2d");

        if (ctx && typeof MediaRecorder !== "undefined" && typeof (canvas as any).captureStream === "function") {
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          const audioCtx = new AudioCtx();
          const dest = audioCtx.createMediaStreamDestination();

          let decodedBuffer: AudioBuffer | null = null;
          try {
            const arrBuf = await audioBlob.arrayBuffer();
            decodedBuffer = await audioCtx.decodeAudioData(arrBuf.slice(0));
          } catch {}

          const minBrowserDur = Math.max(16, orderedCards.length * 4.2);
          if (decodedBuffer && decodedBuffer.duration > 1) {
            finalDuration = Math.max(minBrowserDur, decodedBuffer.duration + 3.0);
          } else {
            finalDuration = Math.max(minBrowserDur, orderedCards.length * 6.5);
          }

          const stream: MediaStream = (canvas as any).captureStream(24);
          dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t));

          let chosenMime = "";
          for (const mt of [
            "video/mp4;codecs=avc1,mp4a.40.2",
            "video/mp4",
            "video/webm;codecs=vp9,opus",
            "video/webm;codecs=vp8,opus",
            "video/webm",
          ]) {
            try {
              if (MediaRecorder.isTypeSupported(mt)) {
                chosenMime = mt;
                break;
              }
            } catch {}
          }

          const recorder = chosenMime
            ? new MediaRecorder(stream, { mimeType: chosenMime, videoBitsPerSecond: 2200000 })
            : new MediaRecorder(stream);

          const chunks: BlobPart[] = [];
          recorder.ondataavailable = (ev) => {
            if (ev.data && ev.data.size > 0) chunks.push(ev.data);
          };

          const sentences = [hookText, ...cardNarrations, `Lời khuyên: ${summaryAdvice}`];

          const drawFrame = (progress: number, secElapsed: number) => {
            // Nền cổ phong huyền kim
            const grad = ctx.createLinearGradient(0, 0, 0, 960);
            grad.addColorStop(0, "#1A130C");
            grad.addColorStop(0.5, "#110C08");
            grad.addColorStop(1, "#090604");
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 540, 960);

            // Khung viền hoàng kim
            ctx.strokeStyle = "rgba(212, 175, 55, 0.75)";
            ctx.lineWidth = 3;
            ctx.strokeRect(16, 16, 508, 928);
            ctx.strokeStyle = "rgba(212, 175, 55, 0.28)";
            ctx.lineWidth = 1;
            ctx.strokeRect(22, 22, 496, 916);

            // Tiêu đề trên cùng
            ctx.fillStyle = "#E5C158";
            ctx.font = '700 16px "Be Vietnam Pro", "Segoe UI", Arial, sans-serif';
            ctx.textAlign = "center";
            ctx.fillText("☯ CỬU NHỊ · LUẬN GIẢI KINH DỊCH 9:16", 270, 56);

            ctx.fillStyle = "#FFF8E7";
            ctx.font = '700 19px "Lora", "Be Vietnam Pro", "Segoe UI", serif';
            const titleShort = hexagramTitle.length > 36 ? hexagramTitle.slice(0, 34) + "..." : hexagramTitle;
            ctx.fillText(titleShort, 270, 88);

            // Xác định lá bài hiện tại theo tiến trình đọc
            const cardIdx = Math.min(
              orderedCards.length - 1,
              Math.floor(progress * orderedCards.length)
            );
            const activeCard = orderedCards[cardIdx];
            const activeImg = cardImages[cardIdx] || fallbackBoardImg;

            // Nhãn vị trí lá bài
            ctx.fillStyle = "rgba(212, 175, 55, 0.18)";
            ctx.fillRect(48, 108, 444, 38);
            ctx.strokeStyle = "rgba(212, 175, 55, 0.65)";
            ctx.strokeRect(48, 108, 444, 38);
            ctx.fillStyle = "#F3E5AB";
            ctx.font = '700 15px "Be Vietnam Pro", "Segoe UI", Arial, sans-serif';
            const badgeText = `Lá ${cardIdx + 1}/${orderedCards.length}: ${activeCard?.name || "Quẻ Kinh Dịch"}`;
            ctx.fillText(badgeText.slice(0, 42), 270, 133);

            // Vẽ hình lá bài ở trung tâm với hiệu ứng Ken Burns nhẹ
            if (activeImg) {
              const zoom = 1 + 0.04 * Math.sin(progress * Math.PI);
              const boxW = 340 * zoom;
              const boxH = 470 * zoom;
              const imgRatio = activeImg.width / Math.max(1, activeImg.height);
              let drawW = boxW;
              let drawH = boxW / imgRatio;
              if (drawH > boxH) {
                drawH = boxH;
                drawW = boxH * imgRatio;
              }
              const dx = 270 - drawW / 2;
              const dy = 398 - drawH / 2;

              ctx.save();
              ctx.shadowColor = "rgba(212, 175, 55, 0.35)";
              ctx.shadowBlur = 24;
              ctx.drawImage(activeImg, dx, dy, drawW, drawH);
              ctx.strokeStyle = "#D4AF37";
              ctx.lineWidth = 2;
              ctx.strokeRect(dx, dy, drawW, drawH);
              ctx.restore();
            }

            // Sóng âm hoàng kim
            const barCount = 24;
            const barWidth = 8;
            const barGap = 6;
            const totalWaveW = barCount * (barWidth + barGap);
            const startX = 270 - totalWaveW / 2;
            for (let b = 0; b < barCount; b++) {
              const wave =
                0.35 +
                0.65 *
                  Math.abs(
                    Math.sin(secElapsed * 6.5 + b * 0.45) *
                      Math.cos(secElapsed * 3.2 - b * 0.25)
                  );
              const bh = Math.max(6, Math.round(wave * 34));
              ctx.fillStyle = b % 2 === 0 ? "#E5C158" : "#D4AF37";
              ctx.fillRect(startX + b * (barWidth + barGap), 678 - bh / 2, barWidth, bh);
            }

            // Hộp phụ đề vàng kim ở phần dưới
            ctx.fillStyle = "rgba(24, 18, 12, 0.92)";
            ctx.fillRect(34, 712, 472, 198);
            ctx.strokeStyle = "rgba(212, 175, 55, 0.7)";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(34, 712, 472, 198);

            ctx.fillStyle = "#E5C158";
            ctx.font = '700 14px "Be Vietnam Pro", "Segoe UI", Arial, sans-serif';
            ctx.fillText("✦ LỜI BÀN CỬU NHỊ ĐẠI SƯ ✦", 270, 740);

            const sentIdx = Math.min(
              sentences.length - 1,
              Math.floor(progress * sentences.length)
            );
            const currentSentence = sentences[sentIdx] || videoScript;

            // Wrap text
            ctx.fillStyle = "#FFF8E7";
            ctx.font = '500 16px "Be Vietnam Pro", "Segoe UI", Arial, sans-serif';
            const words = currentSentence.split(/\s+/);
            const lines: string[] = [];
            let curLine = "";
            for (const w of words) {
              const test = (curLine + " " + w).trim();
              if (ctx.measureText(test).width > 432) {
                if (curLine) lines.push(curLine);
                curLine = w;
              } else {
                curLine = test;
              }
            }
            if (curLine) lines.push(curLine);

            lines.slice(0, 5).forEach((ln, lIdx) => {
              ctx.fillText(ln, 270, 774 + lIdx * 26);
            });
          };

          await new Promise<void>((resolve) => {
            recorder.onstop = () => {
              const finalMime = recorder.mimeType || chosenMime || "video/webm";
              const vBlob = new Blob(chunks, { type: finalMime });
              if (vBlob.size > 500) {
                videoUrl = URL.createObjectURL(vBlob);
              }
              try {
                audioCtx.close();
              } catch {}
              resolve();
            };

            drawFrame(0, 0);
            recorder.start(250);

            if (decodedBuffer) {
              const srcNode = audioCtx.createBufferSource();
              srcNode.buffer = decodedBuffer;
              srcNode.connect(dest);
              srcNode.start(0);
            } else {
              // Tạo âm nền nhẹ trong stream để đảm bảo có track âm thanh
              const osc = audioCtx.createOscillator();
              const gain = audioCtx.createGain();
              osc.frequency.value = 432;
              gain.gain.value = 0.02;
              osc.connect(gain);
              gain.connect(dest);
              osc.start(0);
            }

            const renderStart = Date.now();
            const totalMs = finalDuration * 1000;
            const timer = window.setInterval(() => {
              const elapsedMs = Date.now() - renderStart;
              const prog = Math.min(1, elapsedMs / totalMs);
              const totalElapsedSec = (Date.now() - startedAt) / 1000;
              const remSec = Math.max(1, Math.ceil((totalMs - elapsedMs) / 1000));

              drawFrame(prog, elapsedMs / 1000);
              setDirectHomeElapsed(totalElapsedSec);
              setDirectHomeEtaRemaining(remSec);
              setDirectHomeEtaText(`~${remSec} giây`);
              setDirectHomePercent(Math.min(98, Math.round(74 + prog * 24)));

              if (elapsedMs >= totalMs) {
                window.clearInterval(timer);
                try {
                  if (recorder.state !== "inactive") recorder.stop();
                } catch {
                  resolve();
                }
              }
            }, 42);
          });
        }
      } catch (vErr) {
        console.warn("Browser 9:16 canvas recorder fallback:", vErr);
      }

      const totalSec = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
      const finalResult = {
        question: effectiveQuestion,
        hexagram_title: hexagramTitle,
        hook: hookText,
        summary_advice: summaryAdvice,
        hexagram_raw_ai_text: aiText,
        full_interpretation: fullInterpretation,
        video_script: videoScript,
        video_url: videoUrl || undefined,
        audio_url: audioUrl,
        image_url: capturedPng || orderedCards[0]?.img || "",
        duration: Math.round(finalDuration),
        total_time: totalSec,
      };

      playGoldenChime432Hz();
      setIsDragonSendingFinale(false);
      setIsDirectHomeRunning(false);
      setDirectHomePercent(100);
      setDirectHomeEtaRemaining(0);
      setDirectHomeEtaText("Đã hoàn tất");
      setDirectHomeElapsed(totalSec);
      setDirectHomeResult(finalResult);
      setDirectHomeReadyBanner({
        hexagramTitle,
        duration: Math.round(finalDuration),
        videoUrl: finalResult.video_url,
        totalTime: totalSec,
      });
      setDirectHomeStage("Hoàn tất 100%! Video 9:16 đã đồng bộ chuẩn xác với từng lá bài trong quẻ.");
      setDirectHomeMessage("Hoàn tất 100%! Video 9:16 đã đồng bộ chuẩn xác với từng lá bài trong quẻ.");
      if (finalResult.video_url) {
        setShowPhoneVideoMode(true);
      }
      setCopiedToast("✨ Tự động hóa hoàn tất! Video 9:16 & Bản luận đã sẵn sàng phát & tải xuống!");
      window.setTimeout(() => setCopiedToast(null), 5000);
    },
    [
      mode,
      cards,
      userIntentQuestion,
      userCustomAnswer,
      hexagramPrediction,
      directHomeVoice,
      playGoldenChime432Hz,
    ]
  );

  const handleStartDirectHomeAutomation = useCallback(async () => {
    if (isDirectHomeRunning) return;
    if (isDragonLocked) {
      setCopiedToast("🔒 Cửu Nhị Tiểu Long còn đang ngủ! Hãy bấm nút “Gọi Cửu Nhị Tiểu Long Dậy” và chờ 5 giây để mở khóa.");
      setTimeout(() => setCopiedToast(null), 3500);
      return;
    }

    if (dragonWakeState === "waking") {
      setDragonWakeState("awake");
    }

    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      try {
        Notification.requestPermission();
      } catch {}
    }

    const initEstSec = Math.round(1.5 + (14 + 2 * cards.length) + (13 + 2.5 * cards.length) + (22 + 5.5 * cards.length));
    setDragonAutoFullAct(6);
    setIsDirectHomeRunning(true);
    setIsBgPillMinimized(false);
    setDirectHomeReadyBanner(null);
    setDirectHomeResult(null);
    setShowPhoneVideoMode(false);
    setDirectHomePercent(12);
    setDirectHomeElapsed(0);
    setDirectHomeEstimatedTotal(initEstSec);
    setDirectHomeEtaRemaining(initEstSec);
    setDirectHomeEtaText(`~${Math.floor(initEstSec / 60)} phút ${initEstSec % 60} giây`);
    setDirectHomeStage("Đang tự động chụp hình thẻ bài từ Trang Chủ...");
    setDirectHomeMessage("Bước 1/4: Tự động chụp hình trải bài đang hiển thị trên Trang Chủ...");

    try {
      // 1. Tự động lấy hình chụp trực tiếp từ trang chủ đang hiển thị (kèm từng lá bài 1 -> N)
      directHomeCardImgsRef.current = [];
      let capturedPng: string | null = null;
      try {
        capturedPng = await handleCaptureCardsSnapshot({ silent: true });
        if (capturedPng) {
          setDirectHomeCapturedImg(capturedPng);
        }
      } catch (snapErr) {
        console.warn("Snapshot capture warning (mobile fallback):", snapErr);
      }

      // 2. Tự động lấy nội dung "Chép cho AI" trực tiếp từ trang chủ đang hiển thị
      setDirectHomePercent(24);
      setDirectHomeStage("Đang trích xuất 'Chép Cho AI' từ Trang Chủ...");
      setDirectHomeMessage("Bước 2/4: Đã chụp xong thẻ bài! Đang gửi tiến trình xuống chạy ngầm...");

      const aiText = await formatSpreadForAI(
        cards,
        mode,
        isCard2Reversed,
        isRitualCompleted,
        userIntentQuestion,
        hexagramPrediction,
        userCustomAnswer,
        { isCard2AReversed, isCard2BReversed, menhBranchNumber }
      );
      setDirectHomeRawAIText(aiText);
      await copyToClipboard(aiText);
      setCopiedAI(true);
      setTimeout(() => setCopiedAI(false), 2500);

      // 3. Gửi trực tiếp sang Engine Luận Trực Tiếp & Render Video 9:16 chạy ngầm
      setDirectHomePercent(32);
      setDirectHomeStage("Đã kích hoạt chạy ngầm! Tiểu Long Cửu Nhị đang luận giải & thu âm...");
      setDirectHomeMessage("Đang chạy ngầm: Bạn có thể tự do lướt web hoặc chuyển tab, xong sẽ tự báo chuông!");

      const effectiveQuestion =
        userIntentQuestion.trim() ||
        `Luận giải trải bài ${(mode === "khong_minh" && cards[2] ? [cards[2]] : cards).map((c) => c.name).join(" • ")} trên trang chủ`;

      const payload = {
        question: effectiveQuestion,
        voice: directHomeVoice,
        image_base64: capturedPng || snapshotImageUrl || "",
        card_images_base64: directHomeCardImgsRef.current,
        hexagram_text: aiText,
        cards_order_version: 2,
      };

      let res: Response | null = null;
      try {
        res = await fetchDirectHomeApi("/api/direct_home/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch {
        res = null;
      }

      // Nếu máy chủ Python cục bộ (port 8000) không phản hồi hoặc đang truy cập trên tên miền đám mây (ichingtarot.com / điện thoại),
      // tự động chuyển sang Engine Luận Trực Tiếp & Dựng Video 9:16 ngay trên trình duyệt để luôn thành công 100%!
      if (!res || !res.ok) {
        await runBrowserDirectHomeEngine(
          effectiveQuestion,
          capturedPng || snapshotImageUrl || "",
          directHomeCardImgsRef.current,
          aiText
        );
        return;
      }

      const startData = await res.json().catch(() => ({}));
      if (startData.eta_text) {
        setDirectHomeEtaText(startData.eta_text);
      }
      if (typeof startData.estimated_total_seconds === "number") {
        setDirectHomeEstimatedTotal(startData.estimated_total_seconds);
        setDirectHomeEtaRemaining(Math.round(startData.estimated_total_seconds));
      }

      setCopiedToast(
        `🟢 Đã chụp thẻ bài & chuyển sang chạy ngầm! Dự báo hoàn tất: ${startData.eta_text || "~1 phút 15 giây"}`
      );
      window.setTimeout(() => setCopiedToast(null), 4000);

      // 4. Theo dõi tiến trình bằng Web Worker không bị khóa khi chuyển tab
      startDirectHomeBackgroundPolling();
    } catch (err: any) {
      console.error("DirectHomeAutomation Error:", err);
      setIsDirectHomeRunning(false);
      setDirectHomeStage(err?.message || "Lỗi kết nối máy chủ Luận Trực Tiếp.");
      setCopiedToast("⚠️ " + (err?.message || "Lỗi khi chạy Tự Động Hóa Toàn Bộ"));
      setTimeout(() => setCopiedToast(null), 4000);
    }
  }, [
    isDirectHomeRunning,
    isDragonLocked,
    isDragonUnlocked,
    dragonWakeState,
    handleCaptureCardsSnapshot,
    cards,
    mode,
    isCard2Reversed,
    isCard2AReversed,
    isCard2BReversed,
    menhBranchNumber,
    isRitualCompleted,
    userIntentQuestion,
    hexagramPrediction,
    userCustomAnswer,
    directHomeVoice,
    snapshotImageUrl,
    fetchDirectHomeApi,
    runBrowserDirectHomeEngine,
    startDirectHomeBackgroundPolling,
  ]);

  /* ── Chuyển chế độ và cuộn mượt xuống khu vực trải bài ── */
  const handleSwitchModeAndScroll = useCallback(
    (newMode: SpreadMode, isRitual: boolean = false) => {
      // Nếu đang bật giữ nguyên và thao tác trên cùng một chế độ quẻ (ví dụ 3 lá lỡ bấm nhanh mà muốn tam kính):
      // Giữ nguyên 100% các lá bài hiện tại, chỉ cập nhật trạng thái tâm linh (Tam Kính / Đắc Pháp) và cuộn xuống!
      if (isKeepCards && newMode === mode) {
        setIsRitualCompleted(isRitual);
        if (isRitual) {
          setCopiedToast("✨ Tam Kính thành công! Đã đắc pháp & giữ nguyên các lá bài hiện tại.");
          setTimeout(() => setCopiedToast(null), 3500);
        } else {
          setCopiedToast("🔒 Đang bật Giữ nguyên: Tắt ô “✓ Giữ nguyên” nếu muốn rút bộ bài mới cho trận này.");
          setTimeout(() => setCopiedToast(null), 3000);
        }
        setTimeout(() => {
          if (requestTickRef.current) requestTickRef.current();
        }, 50);
        const sec = document.getElementById("destiny-cards");
        if (sec) {
          sec.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        return;
      }

      setIsRitualCompleted(isRitual);
      setMode(newMode);
      let rev: boolean | undefined = undefined;
      let rev2A: boolean | undefined = isCard2AReversed;
      let rev2B: boolean | undefined = isCard2BReversed;
      let nextMenh: number = menhBranchNumber;
      if (newMode === "thap_tinh") {
        rev = Math.random() < 0.5;
        setIsCard2Reversed(rev);
      } else if (newMode === "thap_nhat") {
        rev2A = Math.random() < 0.5;
        rev2B = Math.random() < 0.5;
        setIsCard2AReversed(rev2A);
        setIsCard2BReversed(rev2B);
      } else if (newMode === "thap_nhi") {
        nextMenh = rollRandomMenhBranch();
        setMenhBranchNumber(nextMenh);
      }
      const newCards = drawCardsForMode(newMode, nextMenh);
      setCards(newCards);
      recordDrawnSpreadToTemp(newMode, newCards, rev, isRitual, undefined, undefined, {
        isCard2AReversed: rev2A,
        isCard2BReversed: rev2B,
        menhBranchNumber: nextMenh,
      });
      const spreadName = SPREAD_MODE_NAMES[newMode] || "Trận Pháp";
      const menhSuffix =
        newMode === "thap_nhi"
          ? ` · ★ Cung Mệnh tự động tại Địa Chi ${TWELVE_BRANCHES_DATA.find((b) => b.number === nextMenh)?.name || nextMenh}`
          : newMode === "khong_minh" && newCards[2]
          ? ` · ★ Lá 3 Quẻ Khổng Minh #${newCards[2].khongMinhOracleNum || ""} (Động Hào ${newCards[2].khongMinhLine || 1}${newCards[2].khongMinhFromMain64 ? " · Random từ 64 Lá Chính" : ""})`
          : "";
      setCopiedToast(
        isRitual
          ? `✨ Đắc Pháp Tam Kính: ${spreadName}${menhSuffix}!`
          : `🔮 Đã trải bài: ${spreadName}${menhSuffix}`
      );
      setTimeout(() => setCopiedToast(null), 3500);
      setTimeout(() => {
        if (requestTickRef.current) requestTickRef.current();
      }, 50);
      const sec = document.getElementById("destiny-cards");
      if (sec) {
        sec.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    [isKeepCards, mode, isCard2AReversed, isCard2BReversed, menhBranchNumber, recordDrawnSpreadToTemp]
  );

  /* ── Bật/Tắt giữ nguyên các lá bài hiện tại (Khóa quẻ khi Tam Kính) ── */
  const handleToggleKeepCards = useCallback((isRitual: boolean = false) => {
    if (isRitual) {
      // Nếu hoàn thành Tam Kính (Kính Thiên -> Kính Địa -> Kính Nhân) ngay trên nút Giữ nguyên:
      // Tự động bật giữ nguyên và kích hoạt Đắc Pháp trực tiếp cho bộ quẻ hiện tại
      setIsKeepCards(true);
      setIsRitualCompleted(true);
      setCopiedToast("✨ Tam Kính thành công! Đã đắc pháp & giữ nguyên các lá bài hiện tại.");
      setTimeout(() => setCopiedToast(null), 3500);
      setTimeout(() => {
        if (requestTickRef.current) requestTickRef.current();
      }, 50);
      const sec = document.getElementById("destiny-cards");
      if (sec) {
        sec.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    }

    // Nhấn nhanh: Chuyển đổi trạng thái giữ nguyên (Bật/Tắt)
    setIsKeepCards((prev) => {
      const next = !prev;
      if (next) {
        setCopiedToast("🔒 Đã bật giữ nguyên: Bạn có thể Tam Kính mà không bị đổi các lá bài!");
      } else {
        setCopiedToast("🔓 Đã tắt giữ nguyên: Khi bốc quẻ sẽ rút lá bài mới.");
      }
      setTimeout(() => setCopiedToast(null), 3000);
      return next;
    });
  }, []);

  /* ── Nhấn Bắt đầu Bốc Quẻ: Random bốc các trận pháp khác nhau và cuộn mượt xuống ô Hương Án Khởi Niệm · Câu Hỏi Chiêm Bốc ── */
  const handleStartDivinationOrShuffle = useCallback((isRitual: boolean = false) => {
    // Nếu đang bật giữ nguyên bài: Giữ nguyên các lá bài, chỉ cập nhật trạng thái đắc pháp Tam Kính và cuộn xuống
    if (isKeepCards) {
      setIsRitualCompleted(isRitual);
      if (isRitual) {
        setCopiedToast("✨ Tam Kính thành công! Đã đắc pháp & giữ nguyên các lá bài hiện tại.");
      } else {
        setCopiedToast("🔒 Đang giữ bài: Giữ nguyên các lá bài hiện tại.");
      }
      setTimeout(() => setCopiedToast(null), 3500);
      const sec = document.getElementById("huong-an-khoi-niem") || document.getElementById("user-intent-question-input");
      if (sec) {
        sec.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    }

    setIsRitualCompleted(isRitual);
    setIsKeepCards(false);
    // Luôn chọn ngẫu nhiên một trận pháp khác với trận pháp hiện tại để mỗi lần bấm luôn bốc một trận pháp mới lạ
    const availableModes = SPREAD_MODES.filter((m) => m !== mode);
    const randomMode =
      availableModes.length > 0
        ? availableModes[Math.floor(Math.random() * availableModes.length)]
        : SPREAD_MODES[Math.floor(Math.random() * SPREAD_MODES.length)];

    setMode(randomMode);
    let rev: boolean | undefined = undefined;
    let rev2A: boolean | undefined = isCard2AReversed;
    let rev2B: boolean | undefined = isCard2BReversed;
    let nextMenh: number = menhBranchNumber;
    if (randomMode === "thap_tinh") {
      rev = Math.random() < 0.5;
      setIsCard2Reversed(rev);
    } else if (randomMode === "thap_nhat") {
      rev2A = Math.random() < 0.5;
      rev2B = Math.random() < 0.5;
      setIsCard2AReversed(rev2A);
      setIsCard2BReversed(rev2B);
    } else if (randomMode === "thap_nhi") {
      nextMenh = rollRandomMenhBranch();
      setMenhBranchNumber(nextMenh);
    }
    const newDrawnCards = drawCardsForMode(randomMode, nextMenh);
    setCards(newDrawnCards);
    recordDrawnSpreadToTemp(randomMode, newDrawnCards, rev, isRitual, undefined, undefined, {
      isCard2AReversed: rev2A,
      isCard2BReversed: rev2B,
      menhBranchNumber: nextMenh,
    });
    setTimeout(() => {
      if (requestTickRef.current) requestTickRef.current();
    }, 50);

    const sec = document.getElementById("huong-an-khoi-niem") || document.getElementById("user-intent-question-input");
    if (sec) {
      sec.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    const spreadName = SPREAD_MODE_NAMES[randomMode] || "Trận Pháp";
    const menhSuffix =
      randomMode === "thap_nhi"
        ? ` · ★ Cung Mệnh tự động tại Chi ${TWELVE_BRANCHES_DATA.find((b) => b.number === nextMenh)?.name || nextMenh}`
        : randomMode === "khong_minh" && newDrawnCards[2]
        ? ` · ★ Lá 3 Quẻ Khổng Minh #${newDrawnCards[2].khongMinhOracleNum || ""} (Động Hào ${newDrawnCards[2].khongMinhLine || 1}${newDrawnCards[2].khongMinhFromMain64 ? " · Random từ 64 Lá Chính" : ""})`
        : "";
    if (isRitual) {
      setCopiedToast(`✨ Đắc Pháp Tam Kính: Đã bốc ngẫu nhiên ${spreadName}${menhSuffix} (Mở khóa 100% Bách Khoa cho AI)!`);
    } else {
      setCopiedToast(`🔮 Đã bốc ngẫu nhiên: ${spreadName}${menhSuffix}`);
    }
    setTimeout(() => setCopiedToast(null), 3500);
  }, [isKeepCards, mode, isCard2AReversed, isCard2BReversed, menhBranchNumber, recordDrawnSpreadToTemp]);

  /* ── Coin Toss Handler ── */
  const handleTossCoin = () => {
    if (coinsTossStep >= 6) return;
    setIsFlipping(true);
    setTimeout(() => {
      const c1 = Math.random() > 0.5 ? 1 : 0;
      const c2 = Math.random() > 0.5 ? 1 : 0;
      const c3 = Math.random() > 0.5 ? 1 : 0;
      const sum = c1 + c2 + c3;
      const isYang = sum >= 2 ? 1 : 0;

      const newLines = [...lines, isYang];
      setLines(newLines);
      const nextStep = coinsTossStep + 1;
      setCoinsTossStep(nextStep);
      setIsFlipping(false);

      if (nextStep === 6) {
        setOracleResult({
          name: "Thuần Càn (乾為天)",
          symbol: "☰☰",
          text: "Nguyên hanh lợi trinh. Thiên hành kiện, quân tử dĩ tự cường bất tức.",
          ai: "Thời cơ đại cát đang mở ra thuận lợi. Hãy chủ động tiến bước, hành động chính trực, kiên trì theo đuổi mục tiêu lớn lao và tuyệt đối không được tự mãn.",
        });
      }
    }, 750);
  };

  const handleResetOracle = () => {
    setCoinsTossStep(0);
    setLines([]);
    setOracleResult(null);
  };

  /* ── Hướng Dẫn Sử Dụng Tương Tác Trang Chủ (Driver.js Product Tour 7 Bước · Tự Động Chạy Lần Đầu) ── */
  const activeDriverRef = useRef<ReturnType<typeof driver> | null>(null);

  const handleStartUserGuideTour = useCallback(() => {
    const FIRST_VISIT_GUIDE_KEY = "cuunhi_user_guide_first_visit_v2";
    try {
      localStorage.setItem(FIRST_VISIT_GUIDE_KEY, "1");
    } catch {}

    if (activeDriverRef.current?.isActive()) {
      activeDriverRef.current.destroy();
    }

    const getStartDivinationElement = (): Element => {
      const isDesktopView = typeof window !== "undefined" && window.innerWidth >= 1024;
      const primaryId = isDesktopView ? "btn-hero-start-divination" : "btn-hero-mobile-start-divination";
      return (
        document.getElementById(primaryId) ||
        document.getElementById("btn-hero-start-divination") ||
        document.getElementById("btn-hero-mobile-start-divination") ||
        document.body
      );
    };

    const driverObj = driver({
      showProgress: true,
      animate: true,
      smoothScroll: true,
      allowClose: true,
      overlayColor: "#0A0806",
      overlayOpacity: 0.22,
      stagePadding: 8,
      stageRadius: 16,
      popoverOffset: 12,
      popoverClass: "cuunhi-driver-popover",
      progressText: "{{current}} / {{total}}",
      nextBtnText: "Tiếp →",
      prevBtnText: "← Trước",
      doneBtnText: "Xong ✦",
      onDestroyed: () => {
        document.body.classList.remove("cuunhi-tour-step-cards", "cuunhi-tour-step-1");
        activeDriverRef.current = null;
      },
      steps: [
        {
          element: getStartDivinationElement,
          onHighlightStarted: () => {
            document.body.classList.remove("cuunhi-tour-step-cards");
            document.body.classList.add("cuunhi-tour-step-1");
            if (typeof window !== "undefined" && window.scrollY > 40) {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
            window.setTimeout(() => {
              requestTickRef.current?.();
              driverObj.refresh();
            }, 80);
            window.setTimeout(() => {
              requestTickRef.current?.();
              driverObj.refresh();
            }, 240);
            window.setTimeout(() => {
              requestTickRef.current?.();
              driverObj.refresh();
            }, 450);
          },
          onDeselected: () => {
            document.body.classList.remove("cuunhi-tour-step-1");
          },
          popover: {
            title: "☯ Bước 1 · Nút Bốc Quẻ & Luật Bộ Riêng",
            description: `
              <div class="cuunhi-guide-body">
                <div class="cuunhi-guide-loc">
                  <span class="cuunhi-guide-loc-badge">VỊ TRÍ</span>
                  <span>Nút <strong>“☯ Bắt Đầu Bốc Quẻ”</strong> đang sáng viền vàng ngay đầu trang chủ.</span>
                </div>
                <div class="cuunhi-guide-card">
                  <div class="cuunhi-guide-row">
                    <span class="cuunhi-guide-pill">👆 Bấm 1 lần</span>
                    <span><strong>Bốc nhanh:</strong> Rút ngẫu nhiên 1 trong <strong>10 trận pháp</strong> <em>(tắt <strong>✓ Giữ nguyên</strong> nếu muốn đổi bài trong ngày)</em>.</span>
                  </div>
                  <div class="cuunhi-guide-divider"></div>
                  <div class="cuunhi-guide-row">
                    <span class="cuunhi-guide-pill cuunhi-guide-pill-gold">✨ Đè giữ 3s × 3</span>
                    <span><strong>Tam Kính:</strong> Đè giữ 3 giây qua <span class="cuunhi-gold-tag">Kính Thiên</span> ➔ <span class="cuunhi-gold-tag">Kính Địa</span> ➔ <span class="cuunhi-gold-tag">Kính Nhân</span> để mở khóa <strong>100% Bách Khoa 64 Quẻ</strong>.</span>
                  </div>
                  <div class="cuunhi-guide-divider"></div>
                  <div class="cuunhi-guide-row">
                    <span class="cuunhi-guide-pill">🎴 448 Lá</span>
                    <span>Mỗi vị trí là <strong>1 bộ bài riêng</strong> gộp <strong>384 Hào Từ + 64 Quẻ Chính</strong> (448 lá chia đều tỷ lệ).</span>
                  </div>
                </div>
                <button type="button" id="cuunhi-tour-try-draw-btn" class="cuunhi-guide-action-btn">
                  🎲 Bốc Thử Quẻ Mới Ngay →
                </button>
              </div>
            `,
            side: "bottom",
            align: "start",
            onPopoverRender: (popover) => {
              const tryBtn = popover.wrapper.querySelector("#cuunhi-tour-try-draw-btn");
              if (tryBtn) {
                tryBtn.addEventListener("click", () => {
                  setIsKeepCards(false);
                  setIsRitualCompleted(false);
                  const availableModes = SPREAD_MODES.filter((m) => m !== mode);
                  const randomMode =
                    availableModes.length > 0
                      ? availableModes[Math.floor(Math.random() * availableModes.length)]
                      : SPREAD_MODES[Math.floor(Math.random() * SPREAD_MODES.length)];
                  setMode(randomMode);
                  let rev: boolean | undefined = undefined;
                  let rev2A: boolean | undefined = isCard2AReversed;
                  let rev2B: boolean | undefined = isCard2BReversed;
                  let nextMenh: number = menhBranchNumber;
                  if (randomMode === "thap_tinh") {
                    rev = Math.random() < 0.5;
                    setIsCard2Reversed(rev);
                  } else if (randomMode === "thap_nhat") {
                    rev2A = Math.random() < 0.5;
                    rev2B = Math.random() < 0.5;
                    setIsCard2AReversed(rev2A);
                    setIsCard2BReversed(rev2B);
                  } else if (randomMode === "thap_nhi") {
                    nextMenh = rollRandomMenhBranch();
                    setMenhBranchNumber(nextMenh);
                  }
                  const newDrawnCards = drawCardsForMode(randomMode, nextMenh);
                  setCards(newDrawnCards);
                  recordDrawnSpreadToTemp(randomMode, newDrawnCards, rev, false, undefined, undefined, {
                    isCard2AReversed: rev2A,
                    isCard2BReversed: rev2B,
                    menhBranchNumber: nextMenh,
                  });
                  const spreadName = SPREAD_MODE_NAMES[randomMode] || "Trận Pháp";
                  const menhSuffix =
                    randomMode === "thap_nhi"
                      ? ` (★ Cung Mệnh tại Chi ${TWELVE_BRANCHES_DATA.find((b) => b.number === nextMenh)?.name || nextMenh})`
                      : "";
                  setCopiedToast(`🔮 Đã bốc mới: ${spreadName}${menhSuffix} — Mời bạn xem bài ở Bước 2!`);
                  setTimeout(() => setCopiedToast(null), 3500);
                  setTimeout(() => {
                    requestTickRef.current?.();
                    driverObj.moveNext();
                  }, 60);
                });
              }
            },
          },
        },
        {
          element: "#destiny-tour-frame",
          onHighlightStarted: () => {
            document.body.classList.remove("cuunhi-tour-step-1");
            document.body.classList.add("cuunhi-tour-step-cards");
            const frameEl = document.getElementById("destiny-tour-frame") || document.getElementById("destiny-cards");
            if (frameEl) {
              frameEl.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            window.setTimeout(() => {
              requestTickRef.current?.();
              driverObj.refresh();
            }, 150);
            window.setTimeout(() => {
              requestTickRef.current?.();
              driverObj.refresh();
            }, 380);
          },
          onDeselected: () => {
            document.body.classList.remove("cuunhi-tour-step-cards");
          },
          popover: {
            title: "🃏 Bước 2 · Soi Thẻ 2 Mặt · Đổi Chiều & Cung Mệnh",
            description: `
              <div class="cuunhi-guide-body">
                <div class="cuunhi-guide-card">
                  <div class="cuunhi-guide-card-desc">
                    • <strong>Nhấp vào lá bài bất kỳ</strong> để mở <strong>Hộp Gấm 2 Mặt</strong> (Quẻ Tượng, Thoán/Hào Từ, <strong>Bộ Riêng #N</strong> &amp; Bách Khoa).<br/>
                    • <strong>Trận 10 &amp; 11 Lá:</strong> Bấm nhãn <span class="cuunhi-gold-tag">🔄</span> trên đầu <strong>Lá 2 / 2A / 2B</strong> để lật chiều Xuôi ↔ Ngược.<br/>
                    • <strong>Trận 12 Lá:</strong> <span class="cuunhi-gold-tag">★ Cung Mệnh</span> tự động random viền vàng trên 12 Địa Chi.
                  </div>
                </div>
              </div>
            `,
            side: "bottom",
            align: "end",
          },
        },
        {
          element: "#huong-an-khoi-niem",
          onHighlightStarted: () => {
            document.body.classList.remove("cuunhi-tour-step-cards", "cuunhi-tour-step-1");
          },
          popover: {
            title: "印 Bước 3 · Hương Án Khởi Niệm",
            description: `
              <div class="cuunhi-guide-body">
                <div class="cuunhi-guide-card">
                  <div class="cuunhi-guide-card-desc">
                    • <strong>Gõ câu hỏi</strong> sự việc đang trăn trở hoặc bấm <strong>🎙️ Nói câu hỏi</strong> bằng tiếng Việt.<br/>
                    • Tâm niệm sẽ tự động đính kèm vào toàn bộ trận bài khi sao chép luận giải cùng <strong>Tiểu Long Cửu Nhị</strong>.
                  </div>
                </div>
              </div>
            `,
            side: "top",
            align: "center",
          },
        },
        {
          element: "#cuunhi-spread-selector-grid",
          onHighlightStarted: () => {
            document.body.classList.remove("cuunhi-tour-step-cards", "cuunhi-tour-step-1");
          },
          popover: {
            title: "✦ Bước 4 · Chọn Nhanh 10 Trận Pháp",
            description: `
              <div class="cuunhi-guide-body">
                <div class="cuunhi-guide-card">
                  <div class="cuunhi-guide-row">
                    <span class="cuunhi-guide-pill">1 → 12 Lá</span>
                    <span>Chọn nhanh Đơn Quẻ, Âm Dương, Tam Tài, Ngũ Hành, Thất Tinh, Cửu Cung, Thập Tinh, Mở Rộng, 12 Cung hoặc Tháp La Dịch.</span>
                  </div>
                </div>
              </div>
            `,
            side: "top",
            align: "center",
          },
        },
        {
          element: "#cuunhi-command-dock-controls",
          popover: {
            title: "🔒 Bước 5 · Giữ Bài Theo Ngày · Lưu & Mở Quẻ",
            description: `
              <div class="cuunhi-guide-body">
                <div class="cuunhi-guide-card">
                  <div class="cuunhi-guide-row">
                    <span class="cuunhi-guide-pill cuunhi-guide-pill-gold">✓ Giữ nguyên</span>
                    <span>Trận bài hiện tại được <strong>giữ cố định suốt cả ngày</strong> dù tải lại trang; qua ngày mới mới tự đổi trận khác. <strong>Tắt đi</strong> khi muốn bốc lại bài mới.</span>
                  </div>
                  <div class="cuunhi-guide-divider"></div>
                  <div class="cuunhi-guide-row">
                    <span class="cuunhi-guide-pill">💾 Lưu · Quẻ Tạm</span>
                    <span>Lưu/Mở trải bài cá nhân hoặc tra lại danh sách các quẻ đã rút tạm trong ngày.</span>
                  </div>
                </div>
              </div>
            `,
            side: "top",
            align: "center",
          },
        },
        {
          element: "#btn-copy-all-for-ai",
          popover: {
            title: "⚡ Bước 6 · Chép Toàn Bộ Quẻ Bài & Câu Hỏi",
            description: `
              <div class="cuunhi-guide-body">
                <div class="cuunhi-guide-card">
                  <div class="cuunhi-guide-card-desc">
                    Sao chép <strong>1 chạm</strong> toàn bộ các lá bài đang trải <em>(kèm thế 2A/2B hoặc 12 Cung &amp; ★ Cung Mệnh)</em> cùng câu hỏi Hương Án để luận giải cùng <strong>Tiểu Long Cửu Nhị</strong> <em>(trích 100% Bách Khoa khi đạt Tam Kính)</em>.
                  </div>
                </div>
              </div>
            `,
            side: "top",
            align: "center",
          },
        },
        {
          element: "#btn-capture-cards-snapshot",
          popover: {
            title: "📸 Bước 7 · Chụp Hình Trọn Bộ Thẻ Bài",
            description: `
              <div class="cuunhi-guide-body">
                <div class="cuunhi-guide-card">
                  <div class="cuunhi-guide-card-desc">
                    Nút ở góc phải thanh trên cùng giúp xuất ảnh <strong>PNG sắc nét</strong> trọn bộ trận pháp <em>(1 đến 12 lá kèm nhãn vị trí &amp; ★ Cung Mệnh)</em> để tải về máy hoặc chia sẻ.
                  </div>
                </div>
              </div>
            `,
            side: "bottom",
            align: "end",
          },
        },
      ],
    });

    activeDriverRef.current = driverObj;
    driverObj.drive();
  }, [mode, isCard2AReversed, isCard2BReversed, menhBranchNumber, recordDrawnSpreadToTemp]);

  const startTourRef = useRef(handleStartUserGuideTour);
  startTourRef.current = handleStartUserGuideTour;

  /* Tự động khởi chạy Hướng Dẫn Sử Dụng khi người dùng lần đầu tiên truy cập web */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const FIRST_VISIT_GUIDE_KEY = "cuunhi_user_guide_first_visit_v2";
    let hasSeenGuide = false;
    try {
      hasSeenGuide = Boolean(localStorage.getItem(FIRST_VISIT_GUIDE_KEY));
    } catch {
      hasSeenGuide = false;
    }
    if (hasSeenGuide) return;

    const launchFirstVisitGuide = () => {
      try {
        if (localStorage.getItem(FIRST_VISIT_GUIDE_KEY)) return;
      } catch {}
      if (document.querySelector(".driver-active")) return;
      startTourRef.current();
    };

    let timerId: number | undefined;
    const scheduleLaunch = () => {
      timerId = window.setTimeout(launchFirstVisitGuide, 650);
    };

    if (document.readyState === "complete") {
      scheduleLaunch();
    } else {
      window.addEventListener("load", scheduleLaunch, { once: true });
    }

    return () => {
      window.removeEventListener("load", scheduleLaunch);
      if (timerId !== undefined) {
        window.clearTimeout(timerId);
      }
      if (activeDriverRef.current?.isActive()) {
        activeDriverRef.current.destroy();
      }
      document.body.classList.remove("cuunhi-tour-step-cards", "cuunhi-tour-step-1");
    };
  }, []);

  return (
    <div className="font-serif min-h-full flex flex-col bg-white text-zinc-900" style={{ fontFamily: "'IM Fell English','Lora',Georgia,'Times New Roman','Noto Serif TC',serif" }}>
      {/* ── CSS Animations & Hover Rules identical to Yilore ── */}
      <style>{`
        @keyframes particle-drift {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.55; }
          33% { transform: translate(10px, -15px) scale(1.1); opacity: 0.85; }
          66% { transform: translate(-8px, 10px) scale(0.9); opacity: 0.6; }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
        @keyframes coin-flip {
          0% { transform: translateY(0) rotateY(0); }
          50% { transform: translateY(-70px) rotateY(900deg) scale(1.15); }
          100% { transform: translateY(0) rotateY(1800deg); }
        }
        .flipping {
          animation: coin-flip 0.75s ease-out forwards;
        }
        .destiny-card-item {
          will-change: transform, opacity;
          user-select: none;
          -webkit-user-select: none;
        }
        .destiny-card-inner {
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease, filter 0.3s ease;
          transform-origin: center bottom;
          box-shadow: 0 26px 65px rgba(0,0,0,0.28), 0 10px 24px rgba(0,0,0,0.22), 0 0 0 1px rgba(255,255,255,0.12), 0 0 28px rgba(196,150,62,0.16);
        }
        .destiny-card-item:hover .destiny-card-inner {
          transform: translateY(-12px) scale(1.04);
          box-shadow: 0 34px 80px rgba(0,0,0,0.38), 0 14px 34px rgba(0,0,0,0.28), 0 0 0 1px rgba(255,255,255,0.22), 0 0 38px rgba(196,150,62,0.38);
          filter: brightness(1.05);
        }
        .destiny-card-item:active .destiny-card-inner {
          transform: translateY(-6px) scale(1.02);
          transition-duration: 0.1s;
        }
        @keyframes ritual-wiggle {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-ritual-wiggle {
          animation: ritual-wiggle 0.3s ease-in-out;
        }
        /* ── Cửu Nhị Driver.js Custom Theme (Kính Mờ Thủy Tinh Hoàng Kim · Đồng Bộ Trang Chủ) ── */
        body.cuunhi-tour-step-cards #cards-stack-layer {
          z-index: 10001 !important;
        }
        body.cuunhi-tour-step-cards .driver-popover.cuunhi-driver-popover {
          top: auto !important;
          bottom: 18px !important;
          right: 18px !important;
          left: auto !important;
          transform: none !important;
        }
        body.cuunhi-tour-step-cards .driver-popover.cuunhi-driver-popover .driver-popover-arrow {
          display: none !important;
        }
        @media (max-width: 640px) {
          body.cuunhi-tour-step-cards .driver-popover.cuunhi-driver-popover {
            left: 50% !important;
            right: auto !important;
            bottom: 14px !important;
            transform: translateX(-50%) !important;
          }
        }
        @keyframes cuunhi-target-pulse {
          0%, 100% {
            box-shadow: 0 0 0 1.5px rgba(243, 229, 171, 0.85), 0 0 18px rgba(212, 175, 55, 0.55), inset 0 0 10px rgba(212, 175, 55, 0.25);
          }
          50% {
            box-shadow: 0 0 0 3px #FFF4CC, 0 0 28px rgba(243, 229, 171, 0.85), inset 0 0 14px rgba(212, 175, 55, 0.42);
          }
        }
        body.cuunhi-tour-step-1 #btn-hero-start-divination,
        body.cuunhi-tour-step-1 #btn-hero-mobile-start-divination {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.18) 0%, rgba(212, 175, 55, 0.28) 100%) !important;
          border: 1.5px solid #F3E5AB !important;
          backdrop-filter: blur(12px) !important;
          -webkit-backdrop-filter: blur(12px) !important;
          animation: cuunhi-target-pulse 1.8s ease-in-out infinite !important;
        }
        body.cuunhi-tour-step-1 #btn-hero-start-divination::after,
        body.cuunhi-tour-step-1 #btn-hero-mobile-start-divination::after {
          content: "👆 Nút Bốc Quẻ ở đây";
          position: absolute;
          top: -28px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(22, 18, 13, 0.72);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(243, 229, 171, 0.65);
          color: #FFF4CC;
          font-family: ui-sans-serif, system-ui, sans-serif;
          font-size: 10.5px;
          font-weight: 700;
          padding: 2px 9px;
          border-radius: 999px;
          white-space: nowrap;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
          pointer-events: none;
          z-index: 60;
        }
        .driver-popover.cuunhi-driver-popover {
          background: linear-gradient(145deg, rgba(22, 19, 15, 0.46) 0%, rgba(14, 12, 9, 0.56) 100%) !important;
          backdrop-filter: blur(20px) saturate(175%) !important;
          -webkit-backdrop-filter: blur(20px) saturate(175%) !important;
          color: #FAF6EE !important;
          border: 1px solid rgba(243, 229, 171, 0.42) !important;
          border-radius: 18px !important;
          padding: 12px 14px !important;
          max-width: min(342px, 90vw) !important;
          max-height: min(78vh, 480px) !important;
          overflow-y: auto !important;
          box-shadow: 0 14px 36px rgba(0, 0, 0, 0.28), 0 0 22px rgba(212, 175, 55, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.28), inset 0 -1px 0 rgba(255, 255, 255, 0.06) !important;
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        }
        @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
          .driver-popover.cuunhi-driver-popover {
            background: rgba(20, 17, 13, 0.88) !important;
          }
        }
        @media (prefers-reduced-transparency: reduce) {
          .driver-popover.cuunhi-driver-popover {
            background: rgba(20, 17, 13, 0.92) !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
          }
        }
        .driver-popover.cuunhi-driver-popover .driver-popover-title {
          font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif !important;
          font-size: 14px !important;
          font-weight: 700 !important;
          line-height: 1.3 !important;
          color: #F3E5AB !important;
          padding-right: 22px !important;
          margin-bottom: 8px !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.14) !important;
          padding-bottom: 6px !important;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35) !important;
        }
        .driver-popover.cuunhi-driver-popover .driver-popover-description {
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          font-size: 12px !important;
          line-height: 1.48 !important;
          color: #F5EFE3 !important;
          margin-bottom: 2px !important;
        }
        .cuunhi-guide-body {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .cuunhi-guide-loc {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 8px;
          border-radius: 9px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(243, 229, 171, 0.32);
          font-size: 11.5px;
          line-height: 1.38;
          color: #FFF8E6;
        }
        .cuunhi-guide-loc-badge {
          flex-shrink: 0;
          background: rgba(212, 175, 55, 0.28);
          border: 1px solid rgba(243, 229, 171, 0.6);
          color: #FFF4CC;
          font-size: 9.5px;
          font-weight: 800;
          padding: 1.5px 5.5px;
          border-radius: 999px;
          letter-spacing: 0.04em;
        }
        .cuunhi-guide-card {
          background: rgba(255, 255, 255, 0.065);
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 11px;
          padding: 7px 9px;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .cuunhi-guide-row {
          display: flex;
          align-items: flex-start;
          gap: 6px;
          font-size: 11.6px;
          line-height: 1.42;
          color: #F4EDE0;
        }
        .cuunhi-guide-pill {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          padding: 1.5px 6.5px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.28);
          color: #FFFFFF;
          font-size: 10.5px;
          font-weight: 700;
          white-space: nowrap;
          margin-top: 1px;
        }
        .cuunhi-guide-pill-gold {
          background: rgba(212, 175, 55, 0.22);
          border-color: rgba(243, 229, 171, 0.55);
          color: #FFF2C2;
        }
        .cuunhi-guide-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.12);
          margin: 1px 0;
        }
        .cuunhi-guide-card-desc {
          font-size: 11.8px;
          line-height: 1.46;
          color: #F4EDE0;
        }
        .cuunhi-gold-tag {
          display: inline-block;
          padding: 0px 5px;
          border-radius: 999px;
          background: rgba(212, 175, 55, 0.22);
          border: 1px solid rgba(243, 229, 171, 0.5);
          color: #FFF2C2;
          font-weight: 700;
          font-size: 10.5px;
        }
        .cuunhi-guide-action-btn {
          margin-top: 1px;
          width: 100%;
          padding: 6.5px 10px;
          border-radius: 10px;
          background: linear-gradient(135deg, rgba(243, 229, 171, 0.92) 0%, rgba(212, 175, 55, 0.92) 100%);
          color: #16110B;
          font-weight: 800;
          font-size: 11.8px;
          border: 1px solid rgba(255, 255, 255, 0.65);
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(212, 175, 55, 0.25);
          transition: all 0.15s ease;
          text-align: center;
        }
        .cuunhi-guide-action-btn:hover {
          filter: brightness(1.06);
          transform: translateY(-1px);
        }
        .driver-popover.cuunhi-driver-popover .driver-popover-progress-text {
          font-size: 11px !important;
          font-weight: 700 !important;
          letter-spacing: 0.04em !important;
          color: #F3E5AB !important;
          opacity: 0.85 !important;
        }
        .driver-popover.cuunhi-driver-popover .driver-popover-close-btn {
          color: rgba(243, 229, 171, 0.75) !important;
          font-size: 18px !important;
          top: 9px !important;
          right: 10px !important;
          transition: color 0.15s ease !important;
        }
        .driver-popover.cuunhi-driver-popover .driver-popover-close-btn:hover {
          color: #FFFFFF !important;
        }
        .driver-popover.cuunhi-driver-popover .driver-popover-footer {
          margin-top: 9px !important;
          padding-top: 7px !important;
          border-top: 1px solid rgba(255, 255, 255, 0.14) !important;
        }
        .driver-popover.cuunhi-driver-popover .driver-popover-prev-btn {
          background: rgba(255, 255, 255, 0.1) !important;
          backdrop-filter: blur(8px) !important;
          color: #F5EFE3 !important;
          border: 1px solid rgba(255, 255, 255, 0.28) !important;
          border-radius: 999px !important;
          padding: 4.5px 11px !important;
          font-size: 11.5px !important;
          font-weight: 600 !important;
          text-shadow: none !important;
          transition: all 0.15s ease !important;
        }
        .driver-popover.cuunhi-driver-popover .driver-popover-prev-btn:hover {
          background: rgba(255, 255, 255, 0.18) !important;
          color: #FFFFFF !important;
        }
        .driver-popover.cuunhi-driver-popover .driver-popover-next-btn {
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.88) 0%, rgba(170, 124, 17, 0.92) 100%) !important;
          color: #16110B !important;
          border: 1px solid #F3E5AB !important;
          border-radius: 999px !important;
          padding: 4.5px 13px !important;
          font-size: 11.5px !important;
          font-weight: 700 !important;
          text-shadow: none !important;
          box-shadow: 0 3px 10px rgba(212, 175, 55, 0.28) !important;
          transition: all 0.15s ease !important;
        }
        .driver-popover.cuunhi-driver-popover .driver-popover-next-btn:hover {
          filter: brightness(1.08) !important;
          transform: translateY(-1px) !important;
        }
        .driver-popover.cuunhi-driver-popover .driver-popover-arrow-side-left.driver-popover-arrow {
          border-left-color: rgba(22, 19, 15, 0.56) !important;
        }
        .driver-popover.cuunhi-driver-popover .driver-popover-arrow-side-right.driver-popover-arrow {
          border-right-color: rgba(22, 19, 15, 0.56) !important;
        }
        .driver-popover.cuunhi-driver-popover .driver-popover-arrow-side-top.driver-popover-arrow {
          border-top-color: rgba(22, 19, 15, 0.56) !important;
        }
        .driver-popover.cuunhi-driver-popover .driver-popover-arrow-side-bottom.driver-popover-arrow {
          border-bottom-color: rgba(22, 19, 15, 0.56) !important;
        }
      `}</style>

      {/* ══════════════════════════════════════════════════════════════════
          1. STICKY HEADER – IDENTICAL TO YILORE with CỬU NHỊ LOGO & UNIFIED NAV
          ══════════════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-[110] flex h-16 shrink-0 items-center justify-between border-b border-[#C4963E]/35 bg-[#FAF7F0]/95 px-4 backdrop-blur-md shadow-[0_4px_18px_rgba(28,22,14,0.06)] sm:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3 shrink-0">
          <a
            className="flex min-w-0 items-center gap-2.5 font-semibold text-[#1C1813] sm:gap-3 cursor-pointer no-underline"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            {/* Logo Cửu Nhị */}
            <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-2xl bg-zinc-950 flex items-center justify-center border border-[#C4963E]/50 shadow-sm">
              <BrandMark size={32} title="Cửu Nhị" />
            </span>
            <span className="min-w-0 truncate font-serif text-sm font-bold text-[#1C1813] sm:text-base lg:text-lg">
              I Ching Tarot · Cửu Nhị
            </span>
          </a>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {/* Nút chụp hình thẻ bài: Tự động căn chỉnh & chụp trọn vẹn toàn bộ trải bài */}
          <button
            type="button"
            id="btn-capture-cards-snapshot"
            onClick={handleCaptureCardsSnapshot}
            disabled={isCapturingSnapshot}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1C1813] hover:text-amber-950 transition px-3 py-1.5 rounded-full bg-[#FDFBF7] hover:bg-amber-50 border border-[#C4963E]/55 hover:border-amber-500 cursor-pointer shadow-xs active:scale-95 disabled:opacity-60"
            title="Tự động căn chụp đầy đủ toàn bộ thẻ bài đang trải"
          >
            {isCapturingSnapshot ? (
              <>
                <span className="inline-block animate-spin text-sm">⏳</span>
                <span className="hidden xs:inline sm:inline">Đang chụp...</span>
              </>
            ) : (
              <>
                <Camera className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden xs:inline sm:inline">Chụp hình thẻ bài</span>
                <span className="xs:hidden sm:hidden">Chụp hình</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════════
          2. HERO SECTION – PRESERVED FROM USER SCREENSHOT with CỬU NHỊ LOGO
          ══════════════════════════════════════════════════════════════════ */}
      <div id="landing-scroll" className="relative isolate z-10 w-full">
        <section aria-label="首屏" className="relative isolate z-20 min-h-[100dvh] w-full overflow-x-visible overflow-y-hidden pt-[4.5rem]">
          {/* Nền ảnh hero-frame */}
          <div className="pointer-events-none absolute inset-0 z-0">
            <img
              alt=""
              aria-hidden="true"
              decoding="async"
              className="object-cover w-full h-full"
              style={{ position: "absolute", height: "100%", width: "100%", left: 0, top: 0, right: 0, bottom: 0 }}
              src="/assets/hero-frame.webp"
            />
          </div>

          {/* Lớp gradient overlay huyền bí */}
          <div
            className="pointer-events-none absolute inset-0 z-[1]"
            style={{ background: "linear-gradient(180deg,rgba(18,19,23,0.74) 0%,rgba(18,19,23,0.68) 55%,rgba(18,19,23,0.78) 100%)" }}
            aria-hidden="true"
          />

          {/* 15 hạt bụi sao trôi dạt (particles) + quầng sáng vàng trung tâm */}
          <div className="pointer-events-none absolute inset-0 z-[5]">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              {PARTICLES.map((p, idx) => (
                <span
                  key={idx}
                  className="absolute rounded-full bg-white"
                  style={{
                    left: p.left,
                    top: p.top,
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    filter: "blur(1px)",
                    animation: `particle-drift ${p.dur}s ${p.delay}s ease-in-out infinite`,
                  }}
                />
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="h-[min(600px,90vw)] w-[min(600px,90vw)] rounded-full"
                style={{
                  background: "radial-gradient(circle,rgba(196,150,62,0.2),transparent 68%)",
                  animation: "glow-pulse 5s ease-in-out infinite",
                }}
              />
            </div>
          </div>

          {/* Grid Hero: Cột trái nội dung, Cột phải điểm neo lá bài */}
          <div className="relative z-[50] mx-auto flex min-h-[calc(100dvh-4.5rem)] w-full max-w-7xl flex-col items-stretch px-4 sm:px-8 max-lg:items-center max-lg:justify-start max-lg:gap-3 max-lg:pt-1 max-lg:pb-12 lg:grid lg:min-h-[calc(100dvh-4.5rem)] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:gap-10 lg:px-10 xl:gap-14 xl:px-14">
            {/* ── CỘT TRÁI: GIỮ NGUYÊN NỘI DUNG ẢNH TRÊN + THAY LOGO CỬU NHỊ ── */}
            <div className="order-1 flex w-full min-w-0 flex-col items-center text-center pointer-events-auto max-lg:max-w-xl max-lg:shrink-0 max-lg:pt-0 lg:items-start lg:text-left lg:justify-center">
              {/* Tiêu đề Logo Cửu Nhị + "I Ching Tarot" */}
              <h1 className="mb-1 text-2xl font-bold leading-[1.08] tracking-tight text-white sm:mb-2 sm:text-5xl lg:mb-5 lg:text-6xl xl:text-7xl">
                <span className="mb-1 flex items-end justify-center gap-2.5 sm:mb-2 sm:gap-3 lg:mb-4 lg:justify-start">
                  {/* Container bo góc đậm chất skeuomorphic chứa Logo Cửu Nhị */}
                  <span
                    className="relative flex items-center justify-center h-11 w-11 shrink-0 overflow-hidden rounded-xl sm:h-20 sm:w-20 sm:rounded-2xl shadow-2xl"
                    style={{
                      background: "linear-gradient(145deg, #1c1a22 0%, #0d0c11 100%)",
                      border: "1px solid rgba(196,150,62,0.45)",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.5), 0 0 24px rgba(196,150,62,0.22)",
                    }}
                  >
                    <BrandMark size={56} className="shrink-0" title="Cửu Nhị · Kinh Dịch" />
                  </span>
                  <span className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
                    I Ching Tarot
                  </span>
                </span>
              </h1>

              {/* Dòng chữ phụ 1 & 2 đúng nguyên bản ảnh */}
              <p className="mb-1 max-w-xl text-xs leading-relaxed sm:text-lg lg:mb-8 lg:text-xl" style={{ color: "rgba(255,255,255,0.7)" }}>
                <span className="text-sm sm:text-2xl lg:text-3xl text-white/90 font-medium block mb-0.5">
                  Bốc bài Kinh Dịch, Tinh hoa Phương Đông
                </span>
                <span className="text-[11px] sm:text-sm lg:text-base text-white/50 block">
                  64 Quẻ Chu Dịch · 12 Trận Pháp · Lục Nhâm · Kỳ Môn · Thái Ất
                </span>
              </p>

              {/* Dải nút hành động Desktop: Đồng bộ 100% chung 1 phong cách Glassmorphism sang trọng */}
              <div className="hidden lg:flex w-full lg:w-auto flex-col items-start relative z-[70] mt-2 pointer-events-auto">
                {/* Hàng 1: Bắt Đầu Bốc Quẻ + Liên Hệ Zalo (Kính mờ cao cấp, chữ trắng sáng đồng bộ) */}
                <div className="flex w-full max-w-xl flex-row items-stretch gap-3 lg:w-auto">
                  {/* Nút Bắt Đầu Bốc Quẻ */}
                  <RitualHoldButton
                    id="btn-hero-start-divination"
                    active={false}
                    onClick={(isRitual) => handleStartDivinationOrShuffle(!!isRitual)}
                    wrapperClassName="flex min-w-0 flex-1 lg:flex-none lg:w-auto"
                    className="flex min-w-0 w-full items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-base md:px-7 md:py-4 md:text-lg text-white font-semibold cursor-pointer transition hover:scale-[1.02] hover:bg-white/15 active:scale-[0.98] shadow-xl"
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.38)",
                      backdropFilter: "blur(8px)",
                    }}
                    title="Bấm để bốc quẻ • Nhấn & giữ 3 lần Kính Thiên, Kính Địa, Kính Nhân để Bốc Tam Kính"
                  >
                    <span className="text-xl">☯</span>
                    <span className="truncate">Bắt Đầu Bốc Quẻ</span>
                  </RitualHoldButton>

                  {/* Nút Liên Hệ Zalo */}
                  <a
                    href="https://zalo.me/0902853305"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-base md:px-7 md:py-4 md:text-lg lg:flex-none lg:w-auto text-white font-semibold cursor-pointer transition hover:scale-[1.02] hover:bg-white/15 active:scale-[0.98] shadow-xl no-underline"
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.38)",
                      backdropFilter: "blur(8px)",
                    }}
                    title="Liên hệ Zalo tư vấn trực tiếp: 090 285 3305"
                  >
                    <span className="text-xl">💬</span>
                    <span className="truncate">Liên Hệ Zalo</span>
                  </a>
                </div>

                {/* Hàng 2: Nút Donate Ủng Hộ Dự Án & Hướng Dẫn Sử Dụng ngay dưới chỗ nút bốc quẻ */}
                <div className="mt-3 w-full max-w-xl flex flex-wrap items-center justify-start gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenDonateModal) onOpenDonateModal();
                      else window.dispatchEvent(new CustomEvent("open-donate-modal"));
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-serif font-bold text-amber-300 hover:text-amber-200 bg-amber-950/60 hover:bg-amber-900/80 border border-amber-600/60 hover:border-amber-400 rounded-full transition-all cursor-pointer shadow-lg hover:shadow-amber-900/30 active:scale-95 group"
                    title="Quét mã QR donate ủng hộ dự án Cửu Nhị"
                  >
                    <Heart className="w-4 h-4 text-rose-400 fill-rose-500/30 group-hover:scale-110 transition-transform" />
                    <span>Donate Ủng Hộ Dự Án</span>
                    <QrCode className="w-3.5 h-3.5 text-amber-400 group-hover:text-amber-200" />
                  </button>

                  <button
                    type="button"
                    onClick={handleStartUserGuideTour}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-serif font-bold text-[#F3E5AB] hover:text-white bg-white/10 hover:bg-white/20 border border-[#D4AF37]/65 hover:border-[#F3E5AB] rounded-full transition-all cursor-pointer shadow-lg backdrop-blur-md active:scale-95 group"
                    title="Khởi chạy hướng dẫn sử dụng tương tác 7 bước"
                  >
                    <Compass className="w-4 h-4 text-[#D4AF37] group-hover:rotate-45 transition-transform" />
                    <span>Hướng Dẫn Sử Dụng</span>
                  </button>
                </div>
              </div>

              {/* Dải số liệu thống kê (Stats: 64 Quẻ, 384 Hào, 12 Trận Pháp, 9+ Phương Pháp) */}
              <div
                className="mt-6 hidden lg:flex flex-wrap gap-8 border-t border-white/15 pt-5 text-left w-full justify-start"
              >
                <div>
                  <div className="text-2xl font-bold tracking-tight text-[#C4963E] sm:text-3xl font-serif">64</div>
                  <div className="text-[10px] sm:text-xs font-medium uppercase tracking-widest text-white/50">Quẻ Chu Dịch</div>
                </div>
                <div>
                  <div className="text-2xl font-bold tracking-tight text-[#C4963E] sm:text-3xl font-serif">384</div>
                  <div className="text-[10px] sm:text-xs font-medium uppercase tracking-widest text-white/50">Hào Tượng</div>
                </div>
                <div>
                  <div className="text-2xl font-bold tracking-tight text-[#C4963E] sm:text-3xl font-serif">12</div>
                  <div className="text-[10px] sm:text-xs font-medium uppercase tracking-widest text-white/50">Trận Pháp</div>
                </div>
                <div>
                  <div className="text-2xl font-bold tracking-tight text-[#C4963E] sm:text-3xl font-serif">9+</div>
                  <div className="text-[10px] sm:text-xs font-medium uppercase tracking-widest text-white/50">Phương Pháp</div>
                </div>
              </div>
            </div>

            {/* Dải nút hành động Mobile (Khung tâm niệm ở trên + Bắt Đầu Bốc Quẻ Tam Kính + Giữ nguyên & Chép cho AI ở dưới) */}
            <div id="hero-mobile-actions" className="flex w-full max-w-xl shrink-0 flex-col items-center gap-2 pointer-events-auto max-lg:pt-1 lg:hidden relative z-[70]">
              {/* Hàng 1: Bắt Đầu Bốc Quẻ + Liên Hệ Zalo (Đồng bộ Glassmorphism trên mobile) */}
              <div className="flex w-full max-w-xl flex-row items-stretch gap-2">
                <RitualHoldButton
                  id="btn-hero-mobile-start-divination"
                  active={false}
                  onClick={(isRitual) => handleStartDivinationOrShuffle(!!isRitual)}
                  wrapperClassName="flex min-w-0 flex-1"
                  className="flex min-w-0 w-full items-center justify-center gap-1.5 rounded-2xl px-3 py-3 text-sm font-semibold sm:gap-2 sm:px-6 sm:py-3.5 sm:text-base text-white shadow-lg cursor-pointer transition hover:bg-white/15 active:scale-[0.98]"
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.38)",
                    backdropFilter: "blur(8px)",
                  }}
                  title="Nhấn để bốc quẻ • Nhấn & giữ 3 lần để bốc Tam Kính"
                >
                  <span className="text-base sm:text-lg">☯</span>
                  <span className="truncate">Bắt Đầu Bốc Quẻ</span>
                </RitualHoldButton>

                <a
                  href="https://zalo.me/0902853305"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-2xl px-3 py-3 text-sm font-semibold sm:gap-2 sm:px-6 sm:py-3.5 sm:text-base text-white cursor-pointer transition hover:bg-white/15 active:scale-[0.98] no-underline"
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.38)",
                    backdropFilter: "blur(8px)",
                  }}
                  title="Liên hệ Zalo tư vấn trực tiếp: 090 285 3305"
                >
                  <span className="text-base sm:text-lg">💬</span>
                  <span className="truncate">Liên Hệ Zalo</span>
                </a>
              </div>

              {/* Hàng 2: Nút Donate Ủng Hộ Dự Án & Hướng Dẫn Sử Dụng ngay dưới nút bốc quẻ */}
              <div className="flex w-full max-w-xl flex-row items-stretch gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenDonateModal) onOpenDonateModal();
                    else window.dispatchEvent(new CustomEvent("open-donate-modal"));
                  }}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl px-3 py-2.5 text-xs font-semibold text-amber-300 hover:text-amber-200 bg-amber-950/60 hover:bg-amber-900/80 border border-amber-600/60 hover:border-amber-400 transition cursor-pointer shadow-md active:scale-[0.98]"
                  title="Quét mã QR donate ủng hộ dự án Cửu Nhị"
                >
                  <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-500/30 shrink-0" />
                  <span className="truncate">Donate Ủng Hộ</span>
                  <QrCode className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={handleStartUserGuideTour}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl px-3 py-2.5 text-xs font-semibold text-[#F3E5AB] hover:text-white bg-white/10 hover:bg-white/20 border border-[#D4AF37]/65 hover:border-[#F3E5AB] transition cursor-pointer shadow-md backdrop-blur-md active:scale-[0.98]"
                  title="Khởi chạy hướng dẫn sử dụng tương tác 7 bước"
                >
                  <Compass className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                  <span className="truncate">Hướng Dẫn Sử Dụng</span>
                </button>
              </div>
            </div>

            {/* ── CỘT PHẢI: HERO CARD ANCHOR (Điểm neo cho xấp bài ở Hero - Sắp ở dưới trên mobile) ── */}
            <div className="pointer-events-none relative flex w-full min-h-0 min-w-0 flex-1 items-center justify-center max-lg:min-h-[240px] max-lg:py-2 lg:min-h-0 lg:max-h-none lg:flex-none lg:px-2 xl:px-4">
              <div className="flex items-center justify-center">
                <div
                  ref={heroAnchorRef}
                  id="hero-card-anchor"
                  className="pointer-events-none h-48 w-32 shrink-0 rounded-2xl sm:h-[272px] sm:w-44 md:h-72 md:w-48 opacity-0"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            2.5. CẦU CHUYỂN SẮC THỦY MẶC (INK-WASH TRANSITION BRIDGE)
            Chuyển cảnh mượt mà từ Bầu Trời Đêm Huyền Mặc sang Giấy Tuyên Thành
            ══════════════════════════════════════════════════════════════════ */}
        <div
          ref={bridgeRef}
          aria-hidden="true"
          className="relative w-full h-28 sm:h-36 overflow-hidden pointer-events-none select-none flex items-center justify-center"
          style={{
            background: "linear-gradient(180deg, #07080D 0%, #171410 36%, #DDD4C3 82%, #F6F3EB 100%)",
          }}
        >
          {/* Hào quang 2800K lan tỏa ở đường chân trời */}
          <div
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-24 opacity-60"
            style={{
              background: "radial-gradient(ellipse 55% 60% at 50% 50%, rgba(212, 175, 55, 0.24) 0%, transparent 75%)",
            }}
          />
          {/* Đường chỉ vàng lưỡng nghi & Ấn Cửu Nhị ở trung tâm cầu chuyển */}
          <div className="relative z-10 flex items-center gap-3 px-5 py-1.5 rounded-full bg-[#120F0B]/90 border border-[#C4963E]/60 shadow-[0_6px_24px_rgba(196,150,62,0.28)] backdrop-blur-md">
            <span className="h-[1px] w-8 sm:w-14 bg-gradient-to-r from-transparent to-[#D4AF37]" />
            <span className="text-[#D4AF37] text-sm leading-none">☯</span>
            <span className="font-serif text-[10px] sm:text-xs font-semibold tracking-[0.26em] uppercase text-[#F3E5AB]">
              Cửu Nhị Huyền Đàn · 64 Quẻ Chu Dịch
            </span>
            <span className="text-[#D4AF37] text-sm leading-none">✦</span>
            <span className="h-[1px] w-8 sm:w-14 bg-gradient-to-l from-transparent to-[#D4AF37]" />
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            3. SECTION 2: DESTINY CARDS – BÀN TRẢI BÀI GIẤY TUYÊN THÀNH & LA BÀN BÁT QUÁI
            ══════════════════════════════════════════════════════════════════ */}
        <section
          id="destiny-cards"
          aria-label="命运卡牌"
          className="relative w-full bg-[#F6F3EB] px-5 pt-10 pb-36 sm:px-8 sm:pt-16 sm:pb-52 min-h-[95vh] sm:min-h-[110vh] overflow-hidden flex flex-col justify-between"
          style={{
            backgroundImage: "radial-gradient(ellipse 85% 75% at 50% 50%, #FAF8F2 0%, #F4EFE4 65%, #EAE2D3 100%)",
          }}
        >
          {/* Lưới tọa độ Tơ Đồng Cổ 48x48px với mặt nạ tỏa tròn (Radial Vignette) */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(rgba(180,145,70,0.13) 1px,transparent 1px),
                                linear-gradient(90deg,rgba(180,145,70,0.13) 1px,transparent 1px)`,
              backgroundSize: "48px 48px",
              maskImage: "radial-gradient(ellipse 80% 75% at 50% 52%, black 45%, transparent 95%)",
              WebkitMaskImage: "radial-gradient(ellipse 80% 75% at 50% 52%, black 45%, transparent 95%)",
            }}
          />

          {/* La Bàn Bát Quái Chìm (Celestial Bagua Astrolabe SVG Watermark) xoay chậm dưới tâm bàn bài */}
          <div
            aria-hidden="true"
            className="pointer-events-none select-none absolute left-1/2 top-[56%] -translate-x-1/2 -translate-y-1/2 z-[1] flex items-center justify-center"
          >
            <svg
              viewBox="0 0 600 600"
              className="w-[460px] h-[460px] sm:w-[640px] sm:h-[640px] md:w-[740px] md:h-[740px] opacity-[0.16] animate-[spin_180s_linear_infinite]"
            >
              <defs>
                <radialGradient id="baguaGoldGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.25" />
                  <stop offset="65%" stopColor="#C4963E" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#C4963E" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle cx="300" cy="300" r="285" fill="url(#baguaGoldGlow)" />
              <circle cx="300" cy="300" r="280" fill="none" stroke="#B8892E" strokeWidth="1.5" strokeDasharray="6 6" />
              <circle cx="300" cy="300" r="256" fill="none" stroke="#B8892E" strokeWidth="1.2" />
              <circle cx="300" cy="300" r="215" fill="none" stroke="#B8892E" strokeWidth="1" strokeDasharray="3 5" />
              <circle cx="300" cy="300" r="168" fill="none" stroke="#B8892E" strokeWidth="1.2" />
              <circle cx="300" cy="300" r="108" fill="none" stroke="#B8892E" strokeWidth="1" />
              <polygon
                points="300,32 490,110 568,300 490,490 300,568 110,490 32,300 110,110"
                fill="none"
                stroke="#B8892E"
                strokeWidth="1.2"
              />
              {/* 8 Đường trục Bát Quái */}
              <line x1="300" y1="20" x2="300" y2="580" stroke="#B8892E" strokeWidth="0.9" strokeOpacity="0.6" />
              <line x1="20" y1="300" x2="580" y2="300" stroke="#B8892E" strokeWidth="0.9" strokeOpacity="0.6" />
              <line x1="102" y1="102" x2="498" y2="498" stroke="#B8892E" strokeWidth="0.9" strokeOpacity="0.6" />
              <line x1="498" y1="102" x2="102" y2="498" stroke="#B8892E" strokeWidth="0.9" strokeOpacity="0.6" />
              {/* Bát Quái Tiên Thiên Ký Hiệu */}
              <g fill="#9A6F1A" fontSize="24" fontFamily="serif" textAnchor="middle" dominantBaseline="central">
                <text x="300" y="64">☰ 乾</text>
                <text x="466" y="134">☱ 兌</text>
                <text x="536" y="300">☲ 離</text>
                <text x="466" y="466">☳ 震</text>
                <text x="300" y="536">☷ 坤</text>
                <text x="134" y="466">☶ 艮</text>
                <text x="64" y="300">☵ 坎</text>
                <text x="134" y="134">☴ 巽</text>
              </g>
            </svg>
          </div>

          {/* Tiêu đề thanh nhã, giữ vị trí tự nhiên phía trên các lá bài để không bao giờ bị lá bài che khuất */}
          <div ref={destinyTitleRef} className="relative z-[38] mx-auto max-w-4xl px-4 pt-2 pb-4 text-center sm:px-0 sm:pt-4 sm:pb-6">
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#16130F] border border-[#C4963E]/70 text-[#F3E5AB] text-xs font-semibold mb-3.5 tracking-widest uppercase shadow-[0_4px_18px_rgba(20,16,10,0.16)]">
                <span className="text-[#D4AF37]">✦</span>
                <span>
                  {mode === "that_tinh"
                    ? "Trận Pháp Thất Tinh Bắc Đẩu (7 Lá Chu Dịch)"
                    : mode === "cuu_cung"
                    ? "Trận Pháp Cửu Cung Phi Tinh (9 Lá · Lạc Thư Bát Quái)"
                    : mode === "thap_tinh"
                    ? "Trận Pháp Thập Tinh Celtic Cross (10 Lá Chu Dịch)"
                    : mode === "thap_nhat"
                    ? "Trận Pháp Thập Tinh Mở Rộng (11 Lá · Tách Đôi 2A & 2B)"
                    : mode === "thap_nhi"
                    ? "Trận Pháp Thập Nhị Cung Tử Vi (12 Lá · 12 Địa Chi)"
                    : mode === "thap_la"
                    ? "Tháp La Kinh Dịch (Bản Quái • Hào Động • Biến Quái)"
                    : mode === "1_single"
                    ? "Trận Pháp Đơn Quẻ (1 Lá - Nhất Tiễn Định Tâm)"
                    : mode === "1_to_2"
                    ? "Trận Pháp Âm Dương (2 Lá - Thể Dụng Tương Tác)"
                    : mode === "1_to_3"
                    ? "Trận Pháp Tam Tài (3 Lá - Thiên Địa Nhân)"
                    : mode === "khong_minh"
                    ? "Quẻ Khổng Minh Thần Toán (3 Lá · Lấy Lá Cuối Làm Quẻ)"
                    : mode === "3_to_5"
                    ? "Trận Pháp Ngũ Hành (5 Lá - Kim Mộc Thủy Hỏa Thổ)"
                    : "Hệ Thống 64 Quẻ & 384 Hào Chu Dịch"}
                </span>
                {isRitualCompleted && (
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-[#C4963E]/25 text-[#F3E5AB] text-[10px] font-bold border border-[#D4AF37]">
                    ✦ Đắc Pháp Tam Kính
                  </span>
                )}
                {isKeepCards && (
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-amber-950 text-amber-200 text-[10px] font-bold border border-[#C4963E]/80 shadow-xs">
                    🔒 Giữ nguyên
                  </span>
                )}
                <span className="text-[#D4AF37]">✦</span>
              </div>
              <h2 className="mb-3 text-3xl font-bold text-[#1C1813] sm:text-5xl lg:text-6xl tracking-tight font-serif drop-shadow-[0_1px_0_rgba(255,255,255,0.8)]">
                {mode === "that_tinh"
                  ? "Trận Pháp Thất Tinh"
                  : mode === "cuu_cung"
                  ? "Trận Pháp Cửu Cung"
                  : mode === "thap_tinh"
                  ? "Trận Pháp Thập Tinh"
                  : mode === "thap_nhat"
                  ? "Trận Pháp Thập Tinh Mở Rộng"
                  : mode === "thap_nhi"
                  ? "Trận Pháp Thập Nhị Cung"
                  : mode === "thap_la"
                  ? "Tháp La Kinh Dịch"
                  : mode === "1_single"
                  ? "Trận Pháp Đơn Quẻ"
                  : mode === "1_to_2"
                  ? "Trận Pháp Âm Dương"
                  : mode === "1_to_3"
                  ? "Trận Pháp Tam Tài"
                  : mode === "khong_minh"
                  ? "Quẻ Khổng Minh Thần Toán"
                  : mode === "3_to_5"
                  ? "Trận Pháp Ngũ Hành"
                  : "Bộ Bài I Ching Tarot Phong Cách Đông Phương"}
              </h2>
              <p className="mx-auto max-w-2xl text-base leading-relaxed text-[#5C5346] sm:text-lg font-serif">
                {mode === "that_tinh" ? (
                  <>
                    Khảo sát toàn diện 7 phương diện: Quá khứ, Bản thân hiện tại, Diễn biến, Gợi ý chiến lược, Kết quả, Ngoại cảnh và Điểm mù bản thân.
                  </>
                ) : mode === "cuu_cung" ? (
                  <>
                    Ma trận Lạc Thư Cửu Cung Phi Tinh 3×3: lấy{" "}
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-950 text-[#FDE68A] text-xs sm:text-sm font-bold border border-amber-500/80 shadow-xs">
                      ★ Lá 1: Trung Cung (Cung 5 · Ngũ Hoàng Thổ)
                    </span>{" "}
                    làm trục tâm bản thể, thống lĩnh 8 phương vị Hậu Thiên Bát Quái (Càn 6 · Đoài 7 · Cấn 8 · Ly 9 · Khảm 1 · Khôn 2 · Chấn 3 · Tốn 4).
                  </>
                ) : mode === "khong_minh" ? (
                  <>
                    Bốc 3 lá Tam Tài (Thiên · Địa · Nhân), lấy{" "}
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-950 text-[#FDE68A] text-xs sm:text-sm font-bold border border-amber-500/80 shadow-xs">
                      ★ Lá 3 (Cuối): Quẻ Khổng Minh #{cards[2]?.khongMinhOracleNum || 1} · {cards[2]?.name || "Thuần Càn"} (Động Hào {cards[2]?.khongMinhLine || 1})
                    </span>{" "}
                    {cards[2]?.khongMinhFromMain64 ? (
                      <>
                        <span className="text-xs sm:text-sm font-semibold text-amber-900">
                          [Bốc trúng 64 Lá Chính ➔ Random động Hào {cards[2]?.khongMinhLine || 1}]
                        </span>{" "}
                        <button
                          type="button"
                          onClick={handleRerollKhongMinhLine}
                          className="inline-flex items-center gap-1 ml-1 px-2.5 py-0.5 rounded-full bg-[#FAF0D7] hover:bg-[#F3E5AB] text-[#6E4E16] text-xs font-bold border border-[#C4963E]/70 transition cursor-pointer active:scale-95"
                          title="Gieo ngẫu nhiên lại 1 hào động khác (1–6) cho lá Quẻ Chính thứ 3"
                        >
                          🎲 Random Hào Động
                        </button>
                      </>
                    ) : (
                      <span className="text-xs sm:text-sm font-semibold text-emerald-900">
                        [Bốc trúng Bộ 384 Hào ➔ Động ngay Hào {cards[2]?.khongMinhLine || 1}]
                      </span>
                    )}
                  </>
                ) : mode === "thap_tinh" ? (
                  <>
                    Tâm điểm thập tự kết hợp 10 vị thế thời vận.
                    <span className="font-semibold text-amber-800"> Lá thứ 2: {isCard2Reversed ? "Chiều Ngược (Trở Ngại)" : "Chiều Xuôi (Hỗ Trợ)"}</span> (bấm vào lá hoặc nút để đổi chiều).
                  </>
                ) : mode === "thap_nhat" ? (
                  <>
                    Mở rộng Thập Tinh thành 11 lá độc lập: tách rõ hai nguồn lực song hành{" "}
                    <span className="font-semibold text-emerald-800">
                      Lá 2A ({isCard2AReversed ? "Ngược: Bổ Trợ Suy" : "Xuôi: Bổ Trợ"})
                    </span>{" "}
                    &amp;{" "}
                    <span className="font-semibold text-rose-800">
                      Lá 2B ({isCard2BReversed ? "Ngược: Áp Lực Giảm" : "Xuôi: Thách Thức"})
                    </span>
                    .
                  </>
                ) : mode === "thap_nhi" ? (
                  <>
                    Bày 12 bộ bài riêng biệt trên Thiên Bàn 12 Địa Chi (Tý → Hợi), tự động an ngẫu nhiên{" "}
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-950 text-[#FDE68A] text-xs sm:text-sm font-bold border border-amber-500/80 shadow-xs">
                      ★ Cung Mệnh tại Địa Chi {TWELVE_BRANCHES_DATA.find((b) => b.number === menhBranchNumber)?.name || "Dần"} (
                      {TWELVE_BRANCHES_DATA.find((b) => b.number === menhBranchNumber)?.lunarMonth || "Tháng Giêng"})
                    </span>{" "}
                    <button
                      type="button"
                      onClick={handleRerollMenhBranch}
                      className="inline-flex items-center gap-1 ml-1 px-2.5 py-0.5 rounded-full bg-[#FAF0D7] hover:bg-[#F3E5AB] text-[#6E4E16] text-xs font-bold border border-[#C4963E]/70 transition cursor-pointer active:scale-95"
                      title="Gieo ngẫu nhiên lại vị trí ★ Cung Mệnh sang Địa Chi khác"
                    >
                      🎲 Đổi Cung Mệnh
                    </button>
                  </>
                ) : mode === "thap_la" ? (
                  <>
                    Bản Quái nhìn nhận cục diện, dải Hào Động nhận diện bước ngoặt và Biến Quái thấu suốt tương lai.
                  </>
                ) : mode === "1_single" ? (
                  <>
                    Tập trung năng lượng vào một vấn đề cốt lõi duy nhất. Một quẻ duy nhất chỉ ra phương hướng hành động trực tiếp và minh bạch.
                  </>
                ) : mode === "1_to_2" ? (
                  <>
                    Khảo sát cặp lưỡng nghi Âm - Dương: Thể (bản chất nội tại) và Dụng (tác động bên ngoài), Trong và Ngoài, Tiến và Thoái.
                  </>
                ) : mode === "1_to_3" ? (
                  <>
                    Khảo sát toàn diện ba cõi Tam Tài: Thiên thời (thời thế cơ hội) - Địa lợi (hoàn cảnh môi trường) - Nhân hòa (nội lực con người).
                  </>
                ) : mode === "3_to_5" ? (
                  <>
                    Khảo sát 5 vị trí theo Ngũ Hành tương sinh tương khắc: Kim - Mộc - Thủy - Hỏa - Thổ, cân bằng tổng thể vận trình đời sống.
                  </>
                ) : (
                  <>
                    Ngàn năm tinh hoa Kinh Dịch, tái hiện qua ngôn ngữ trực quan hiện đại<br />
                    Khám phá con đường vận mệnh và định hướng cuộc đời với sự sáng suốt
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Điểm neo cho các lá bài xòe ra ở giữa phần Giấy Tuyên Thành */}
          <div
            id="destiny-tour-frame"
            className={`relative z-10 flex items-center justify-center pt-4 pb-4 ${
              mode === "thap_nhat" || mode === "thap_nhi"
                ? "min-h-[760px] sm:min-h-[840px] md:min-h-[910px]"
                : mode === "that_tinh" || mode === "cuu_cung" || mode === "thap_tinh" || mode === "thap_la"
                ? "min-h-[680px] sm:min-h-[760px] md:min-h-[820px]"
                : "min-h-[540px] sm:min-h-[580px]"
            }`}
          >
            <div
              ref={destinyAnchorRef}
              id="destiny-card-anchor"
              className="pointer-events-none h-56 w-36 shrink-0 rounded-2xl sm:h-[272px] sm:w-44 md:h-72 md:w-48 opacity-0"
              aria-hidden="true"
            />
          </div>

          {/* Chú thích gợi ý tương tác đặt riêng biệt phía dưới xa, hoàn toàn không chạm hay che vào đáy lá bài */}
          <div ref={captionRef} className="relative z-10 mt-6 mb-10 text-center pointer-events-auto">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EFE9DA]/90 border border-[#C4963E]/35 text-xs sm:text-sm text-[#6E5626] font-serif tracking-wide shadow-2xs">
              <span className="text-[#C4963E]">✦</span>
              <span>Nhấp vào từng lá bài để soi Mặt Trước &amp; Mặt Sau, tra cứu Hào Từ &amp; Luận Giải Cửu Nhị</span>
              <span className="text-[#C4963E]">✦</span>
            </span>
          </div>
        </section>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          4. CARDS STACK LAYER (Lớp cố định chứa các lá bài bay theo cuộn)
          ══════════════════════════════════════════════════════════════════ */}
      <div
        ref={layerRef}
        id="cards-stack-layer"
        className="pointer-events-none fixed inset-0 z-[42] flex items-center justify-center overflow-visible"
        style={{ opacity: 1, pointerEvents: "none" }}
      >
        <div
          ref={stageRef}
          id="cards-stage"
          className={`relative w-full max-w-[min(1240px,96vw)] overflow-visible will-change-transform ${
            mode === "thap_nhat" || mode === "thap_nhi"
              ? "h-[min(85vh,880px)]"
              : mode === "that_tinh" || mode === "cuu_cung" || mode === "thap_tinh" || mode === "thap_la"
              ? "h-[min(76vh,780px)]"
              : "h-[min(56vh,500px)]"
          }`}
          style={{ pointerEvents: "none" }}
        >
          {cards.map((card, idx) => (
            <div
              key={card.id + "-" + idx}
              ref={(el) => { slotRefs.current[idx] = el; }}
              className={`destiny-card-item absolute left-1/2 top-1/2 ${
                card.type === "yao"
                  ? "w-44 h-52 sm:w-52 sm:h-60 md:w-56 md:h-66"
                  : "w-36 h-56 sm:w-44 sm:h-[272px] md:w-48 md:h-72"
              } -translate-x-1/2 -translate-y-1/2 will-change-transform`}
              style={{
                zIndex: 10 + idx,
                opacity: 1,
                pointerEvents: "auto",
              }}
              onClick={() => {
                setModalCardView("both");
                setSelectedCard(mode === "khong_minh" && cards[2] ? cards[2] : card);
              }}
            >
              {/* Nhãn vị trí trận pháp phía trên lá bài: Quẻ Khổng Minh 3 lá, Trận 7 lá, 9 lá, 10 lá, 11 lá và 12 lá */}
              {(mode === "khong_minh" || mode === "that_tinh" || mode === "cuu_cung" || mode === "thap_tinh" || mode === "thap_nhat" || mode === "thap_nhi") &&
                card.positionLabel && (
                  <div className="absolute -top-7 sm:-top-8 md:-top-9 left-1/2 -translate-x-1/2 whitespace-nowrap text-center z-40 pointer-events-auto select-none">
                    {mode === "khong_minh" && idx === 2 ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] sm:text-xs font-serif font-bold bg-amber-950 text-[#FEF08A] border-2 border-[#F59E0B] shadow-[0_0_18px_rgba(245,158,11,0.55)] backdrop-blur-sm">
                        <span>{card.shortBadgeLabel || "★ 3. Quẻ Khổng Minh"}</span>
                      </span>
                    ) : mode === "cuu_cung" && idx === 0 ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] sm:text-xs font-serif font-bold bg-amber-950 text-[#FEF08A] border-2 border-[#F59E0B] shadow-[0_0_18px_rgba(245,158,11,0.55)] backdrop-blur-sm">
                        <span>{card.shortBadgeLabel || "★ Lá 1: Trung Cung (5)"}</span>
                      </span>
                    ) : mode === "thap_tinh" && idx === 1 ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleCard2Reversed();
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-serif font-bold shadow-xl transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                          isCard2Reversed
                            ? "bg-rose-950 text-rose-200 border-2 border-rose-500 shadow-rose-950/60"
                            : "bg-emerald-950 text-emerald-200 border-2 border-emerald-500 shadow-emerald-950/60"
                        }`}
                        title="Bấm vào đây để đổi chiều Lá 2: Xuôi (Hỗ Trợ) ↔ Ngược (Trở Ngại)"
                      >
                        <span>{isCard2Reversed ? "2. Ngược: Trở Ngại" : "2. Xuôi: Hỗ Trợ"}</span>
                        <span className="text-[10px] text-amber-300">🔄</span>
                      </button>
                    ) : mode === "thap_tinh" && idx === 0 ? (
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-serif font-bold bg-zinc-900/95 text-amber-200 border border-amber-600/60 shadow-lg backdrop-blur-sm">
                        1. Tình Huống Hiện Tại
                      </span>
                    ) : mode === "thap_tinh" && idx === 9 ? (
                      <span className="inline-block px-3 py-1 rounded-full text-[11px] sm:text-xs font-serif font-bold bg-amber-950/95 text-amber-200 border border-amber-500/80 shadow-lg backdrop-blur-sm">
                        10. Lá Bài Khuyên Bảo
                      </span>
                    ) : mode === "thap_nhat" && idx === 0 ? (
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-serif font-bold bg-zinc-900/95 text-amber-200 border border-amber-600/60 shadow-lg backdrop-blur-sm">
                        1. Tình Huống Hiện Tại
                      </span>
                    ) : mode === "thap_nhat" && idx === 1 ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleCard2AReversed();
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-serif font-bold shadow-xl transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                          isCard2AReversed
                            ? "bg-rose-950 text-rose-200 border-2 border-rose-500 shadow-rose-950/60"
                            : "bg-emerald-950 text-emerald-200 border-2 border-emerald-500 shadow-emerald-950/60"
                        }`}
                        title="Bấm để đổi chiều Lá 2A: Xuôi (Bổ Trợ Tích Cực) ↔ Ngược (Bổ Trợ Suy Yếu)"
                      >
                        <span>{isCard2AReversed ? "2A. Ngược: Bổ Trợ Suy" : "2A. Xuôi: Bổ Trợ"}</span>
                        <span className="text-[10px] text-amber-300">🔄</span>
                      </button>
                    ) : mode === "thap_nhat" && idx === 2 ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleCard2BReversed();
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-serif font-bold shadow-xl transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                          isCard2BReversed
                            ? "bg-emerald-950 text-emerald-200 border-2 border-emerald-500 shadow-emerald-950/60"
                            : "bg-rose-950 text-rose-200 border-2 border-rose-500 shadow-rose-950/60"
                        }`}
                        title="Bấm để đổi chiều Lá 2B: Xuôi (Thách Thức Trở Ngại) ↔ Ngược (Áp Lực Giảm Nhẹ)"
                      >
                        <span>{isCard2BReversed ? "2B. Ngược: Áp Lực Giảm" : "2B. Xuôi: Thách Thức"}</span>
                        <span className="text-[10px] text-amber-300">🔄</span>
                      </button>
                    ) : mode === "thap_nhat" && idx === 10 ? (
                      <span className="inline-block px-3 py-1 rounded-full text-[11px] sm:text-xs font-serif font-bold bg-amber-950/95 text-amber-200 border border-amber-500/80 shadow-lg backdrop-blur-sm">
                        10. Lá Bài Khuyên Bảo
                      </span>
                    ) : mode === "thap_nhi" && card.isMenhCung ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] sm:text-xs font-serif font-bold bg-amber-950 text-[#FEF08A] border-2 border-[#F59E0B] shadow-[0_0_18px_rgba(245,158,11,0.55)] backdrop-blur-sm">
                        <span>{card.shortBadgeLabel || `★ Cung Mệnh · ${card.branchName || ""}`}</span>
                      </span>
                    ) : (
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10.5px] sm:text-xs font-serif font-bold bg-zinc-900/90 text-stone-100 border border-stone-600/60 shadow-lg backdrop-blur-sm">
                        {card.shortBadgeLabel || card.positionLabel}
                      </span>
                    )}
                  </div>
                )}

              <div
                className={`destiny-card-inner relative w-full h-full rounded-2xl overflow-hidden cursor-pointer bg-zinc-950/90 shadow-2xl transition-transform duration-500 ${
                  (mode === "thap_tinh" && idx === 1 && isCard2Reversed) ||
                  (mode === "thap_nhat" && ((idx === 1 && isCard2AReversed) || (idx === 2 && isCard2BReversed)))
                    ? "rotate-180"
                    : ""
                } ${
                  (mode === "thap_nhi" && card.isMenhCung) || (mode === "cuu_cung" && idx === 0) || (mode === "khong_minh" && idx === 2)
                    ? "ring-2 ring-[#F59E0B] shadow-[0_0_28px_rgba(245,158,11,0.45)]"
                    : ""
                }`}
                style={{ transformStyle: "preserve-3d", transformOrigin: "center center" }}
              >
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Nền tối dự phòng */}
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 p-3 text-center"
                    style={{ background: "linear-gradient(160deg,#2D2820 0%,#1C1A15 100%)" }}
                  >
                    <span className="card-symbol text-3xl sm:text-4xl opacity-65 z-10">{card.symbol}</span>
                    <div className="z-10 text-center">
                      <span className="card-name text-white font-semibold text-xs sm:text-sm tracking-wider block">
                        {card.name}
                      </span>
                      <span className="text-[10px] text-[#C4963E] block mt-0.5 opacity-80">
                        {card.type === "yao" ? "Hào Từ Chu Dịch" : "64 Quẻ Chu Dịch"}
                      </span>
                    </div>
                  </div>

                  {/* Ảnh thẻ bài chuẩn từ assets/oss (quẻ hoặc hào) - Full hình 100% */}
                  <img
                    alt={card.name}
                    loading={idx === Math.floor(cards.length / 2) ? "eager" : "lazy"}
                    decoding="async"
                    className={`relative z-10 w-full h-full pointer-events-none select-none rounded-2xl ${
                      card.type === "yao" ? "object-contain bg-zinc-950/90 drop-shadow-md" : "object-cover"
                    }`}
                    src={card.img}
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.onerror = null;
                      const fallback = card.type === "yao"
                        ? `/assets/oss/${card.hexNumber}/${card.hexNumber}-${card.yaoNumber}a.webp`
                        : `/assets/oss/${card.hexNumber}/${card.hexNumber}a.webp`;
                      if (target.src !== fallback && !target.src.endsWith(fallback)) {
                        target.src = fallback;
                      }
                    }}
                  />

                  {/* Viền chỉ vàng */}
                  <div
                    className="absolute inset-0 pointer-events-none rounded-2xl z-20"
                    style={{ border: "1px solid rgba(196,150,62,0.32)" }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          5. SECTION 3: FEATURES SECTION – HƯƠNG ÁN KHỞI NIỆM & CỬU NHỊ COMMAND DOCK
          ══════════════════════════════════════════════════════════════════ */}
      <section
        ref={featuresSecRef}
        id="features-section"
        className="relative py-20 sm:py-32 px-5 sm:px-8 bg-gradient-to-b from-[#F6F3EB] via-[#FAF7F0] to-[#EFE8D8] border-t border-[#C4963E]/25 overflow-hidden"
      >
        {/* Họa tiết núi vẽ mountain.svg ở góc trái dưới */}
        <div className="pointer-events-none absolute left-0 bottom-20 z-[1] opacity-90">
          <img
            alt="mountain decoration"
            loading="lazy"
            width={1200}
            height={720}
            decoding="async"
            className="w-96 sm:w-[34rem] md:w-[46rem] h-auto"
            src="/assets/mountain.svg"
          />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto">
          <div>
            {/* Văn bản tính năng, Hương Án Khởi Niệm & Cửu Nhị Command Dock */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#16130F]/90 border border-[#C4963E]/50 mb-5 shadow-xs">
                <span className="text-[#D4AF37] text-xs">☯</span>
                <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[#F3E5AB]">
                  AI × KINH DỊCH × HUYỀN HỌC PHƯƠNG ĐÔNG
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1C1813] font-serif leading-tight mb-5">
                Mang trí tuệ cổ nhân vào<br />
                <span className="text-[#B8862D]">cuộc sống hôm nay</span>
              </h2>
              <p className="text-base sm:text-lg leading-relaxed mb-7 text-[#5A5043] font-serif">
                Khi bạn cảm thấy bế tắc trong sự nghiệp, tình cảm hay những ngã rẽ cuộc đời,
                I Ching Tarot kết hợp phương pháp chiêm bốc cổ truyền và AI để chuyển hóa
                sự phức tạp thành hướng dẫn rõ ràng, có thể hành động.
              </p>

              <div className="space-y-3.5 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-[rgba(196,150,62,0.18)] border border-[#C4963E]/40">
                    <div className="w-2 h-2 rounded-full bg-[#C4963E]" />
                  </div>
                  <span className="text-sm sm:text-base text-[#3D352B]">
                    Luận giải AI: hướng dẫn tập trung, sắc sảo cho từng câu hỏi cụ thể của bạn
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-[rgba(196,150,62,0.18)] border border-[#C4963E]/40">
                    <div className="w-2 h-2 rounded-full bg-[#C4963E]" />
                  </div>
                  <span className="text-sm sm:text-base text-[#3D352B]">
                    Đa dạng phương pháp: Bốc bài, Xăm Khổng Minh, Cỏ Thi, 3 Đồng Xu, Mai Hoa, Lục Nhâm
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-[rgba(196,150,62,0.18)] border border-[#C4963E]/40">
                    <div className="w-2 h-2 rounded-full bg-[#C4963E]" />
                  </div>
                  <span className="text-sm sm:text-base text-[#3D352B]">
                    12 trận pháp trải bài từ đơn giản đến chuyên sâu (Thất Tinh, Cửu Cung, Thập Nhị Cung)
                  </span>
                </div>
              </div>

              {/* MODULE 1: HƯƠNG ÁN KHỞI NIỆM (TRỤC LỤA GIẤY TUYÊN THÀNH VIỀN KÉP CHỈ VÀNG ĐỒNG BỘ TRANG CHỦ) */}
              <div id="huong-an-khoi-niem" className="mt-6 w-full scroll-mt-24">
                <div
                  className={`relative overflow-hidden rounded-2xl border-[1.5px] p-4 sm:p-5 backdrop-blur-md transition-all duration-300 focus-within:border-[#9E2A2B] focus-within:shadow-[0_18px_42px_-6px_rgba(158,42,43,0.18),0_4px_14px_rgba(150,108,35,0.16),inset_0_0_0_2.5px_#FFFDF8,inset_0_0_0_3.5px_rgba(158,42,43,0.38)] ${
                    isHuongAnHighlighted
                      ? "border-[#9E2A2B] ring-4 ring-[#D4AF37]/55 shadow-[0_0_36px_rgba(212,175,55,0.5),inset_0_0_0_2.5px_#FFFDF8,inset_0_0_0_3.5px_rgba(158,42,43,0.45)]"
                      : "border-[#966C23] shadow-[0_16px_36px_-8px_rgba(62,42,14,0.20),0_4px_12px_rgba(62,42,14,0.09),inset_0_0_0_2.5px_#FFFDF8,inset_0_0_0_3.5px_rgba(150,108,35,0.36)]"
                  }`}
                  style={{
                    background: "linear-gradient(180deg, #FBF4E4 0%, #EFE1C2 100%)",
                  }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <label
                      htmlFor="user-intent-question-input"
                      className="flex items-center gap-2 text-xs sm:text-[13px] font-serif font-bold uppercase tracking-[0.15em] text-[#4A320A]"
                    >
                      <span
                        aria-hidden="true"
                        className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-[#9E2A2B] text-[#FFF8E7] text-[11px] font-serif border border-[#E5C158]/80 shadow-xs"
                      >
                        印
                      </span>
                      <span>Hương Án Khởi Niệm · Câu Hỏi Chiêm Bốc</span>
                    </label>
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={handleToggleVoiceQuestion}
                        disabled={isTranscribingVoiceQ}
                        className={`inline-flex min-h-7 items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition cursor-pointer border shadow-2xs ${
                          isTranscribingVoiceQ
                            ? "bg-amber-100 text-amber-950 border-amber-600 opacity-90 cursor-wait"
                            : isRecordingVoiceQ
                            ? "bg-[#9E2A2B] text-amber-50 border-[#D4AF37] animate-pulse"
                            : "bg-[#FFFDF8] hover:bg-[#FAF0D7] text-[#4A320A] border-[#8A6220]/80"
                        }`}
                        title="Nhập câu hỏi bằng giọng nói tiếng Việt"
                      >
                        <span aria-hidden="true">
                          {isTranscribingVoiceQ ? "⏳" : isRecordingVoiceQ ? "🔴" : "🎙️"}
                        </span>
                        <span>
                          {isTranscribingVoiceQ
                            ? "Đang dịch..."
                            : isRecordingVoiceQ
                            ? `Đang nghe (${formatSecondsMMSS(voiceRecordSec)}) · Bấm để xong`
                            : "Nói câu hỏi"}
                        </span>
                      </button>
                      {userIntentQuestion.trim() ? (
                        <button
                          type="button"
                          onClick={() => handleQuestionChange("")}
                          className="min-h-7 px-2 py-1 rounded-md text-[11px] text-[#5C3D0E] hover:text-[#9E2A2B] hover:bg-[#FFFDF8]/70 font-semibold transition cursor-pointer flex items-center gap-1"
                          title="Xóa nội dung câu hỏi & câu trả lời Hương Án"
                        >
                          <span aria-hidden="true">✕</span>
                          <span>Xóa</span>
                        </button>
                      ) : (
                        <span className="hidden sm:inline text-xs italic text-[#6B532E] font-serif">
                          “Tâm tĩnh tắc linh”
                        </span>
                      )}
                    </div>
                  </div>

                  <textarea
                    id="user-intent-question-input"
                    name="divinationQuestion"
                    rows={2}
                    value={userIntentQuestion}
                    onChange={(e) => handleQuestionChange(e.target.value)}
                    placeholder="Nhập câu hỏi hoặc sự việc đang trăn trở (VD: Sự nghiệp tháng tới diễn biến ra sao? Có nên ký kết hợp tác này không?...)"
                    className="w-full h-auto min-h-[5.25rem] max-h-56 [field-sizing:content] resize-y rounded-xl bg-[#FFFFFF] border-[1.5px] border-[#8A6220] hover:border-[#6B4A14] px-4 py-3 text-base text-[#18120B] font-medium placeholder:text-[#6B5638] placeholder:font-normal focus-visible:border-[#9E2A2B] focus-visible:outline-2! focus-visible:outline-offset-2! focus-visible:outline-[#9E2A2B]! transition leading-relaxed font-serif shadow-[0_2px_10px_rgba(62,42,14,0.08),inset_0_1px_0_rgba(255,255,255,1)]"
                  />
                </div>
              </div>

              {/* MODULE 2: CỬU NHỊ COMMAND DOCK (NGỌC GIẢN KÍNH MỜ GIẤY TUYÊN THÀNH HÒA QUYỆN NÚI THỦY MẶC) */}
              <div
                className="mt-4 w-full rounded-2xl border border-[#C4963E]/45 p-4 sm:p-5 backdrop-blur-xl flex flex-col gap-3.5"
                style={{
                  background: "linear-gradient(180deg, rgba(253, 251, 247, 0.92) 0%, rgba(243, 236, 224, 0.88) 100%)",
                  boxShadow:
                    "0 16px 38px -10px rgba(92, 74, 44, 0.14), 0 2px 8px rgba(92, 74, 44, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
                }}
              >
                {/* Header Thanh Pháp Khí */}
                <div className="flex items-center justify-between border-b border-[#C4963E]/25 pb-2.5">
                  <span className="text-[11px] font-serif font-bold uppercase tracking-[0.18em] text-[#6E4E16] flex items-center gap-1.5">
                    <span className="text-[#B8862D] text-xs">☯</span>
                    <span>Cửu Nhị Command Dock · Chọn Trận Pháp</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    {isRitualCompleted && (
                      <span className="text-[10px] font-bold text-[#F3E5AB] bg-[#1C1610] border border-[#D4AF37] px-2.5 py-0.5 rounded-full shadow-2xs">
                        ✦ Đắc Pháp
                      </span>
                    )}
                    {isKeepCards && (
                      <span className="text-[10px] font-semibold text-[#7A5518] bg-[#FAF0D7] border border-[#C4963E]/55 px-2.5 py-0.5 rounded-full">
                        🔒 Đang khóa bài
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={handleStartUserGuideTour}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-serif font-bold text-[#6E4E16] hover:text-[#1C1610] bg-[#FAF0D7]/90 hover:bg-[#F3E5AB] border border-[#C4963E]/60 transition cursor-pointer shadow-2xs active:scale-95"
                      title="Mở hướng dẫn sử dụng tương tác 7 bước"
                    >
                      <Compass className="w-3 h-3 text-[#B8862D]" />
                      <span>Hướng dẫn</span>
                    </button>
                  </div>
                </div>

                {/* CỤM 1: BẢNG CHỌN NHANH 11 TRẬN PHÁP TRANG CHỦ (GỒM QUẺ KHỔNG MINH 3 LÁ, TRẬN CỬU CUNG 9 LÁ, 11 LÁ & 12 LÁ) */}
                <div id="cuunhi-spread-selector-grid" className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-1.5">
                  {(
                    [
                      { id: "1_single" as SpreadMode, short: "1 Lá · Đơn Quẻ" },
                      { id: "1_to_2" as SpreadMode, short: "2 Lá · Âm Dương" },
                      { id: "1_to_3" as SpreadMode, short: "3 Lá · Tam Tài" },
                      { id: "khong_minh" as SpreadMode, short: "3 Lá · Khổng Minh" },
                      { id: "3_to_5" as SpreadMode, short: "5 Lá · Ngũ Hành" },
                      { id: "that_tinh" as SpreadMode, short: "7 Lá · Thất Tinh" },
                      { id: "cuu_cung" as SpreadMode, short: "9 Lá · Cửu Cung" },
                      { id: "thap_tinh" as SpreadMode, short: "10 Lá · Thập Tinh" },
                      { id: "thap_nhat" as SpreadMode, short: "11 Lá · Mở Rộng" },
                      { id: "thap_nhi" as SpreadMode, short: "12 Lá · 12 Cung" },
                      { id: "thap_la" as SpreadMode, short: "Tháp La Dịch" },
                    ] as const
                  ).map((sp) => {
                    const isActive = mode === sp.id;
                    return (
                      <RitualHoldButton
                        key={sp.id}
                        id={`cmd-dock-mode-${sp.id}`}
                        active={isActive}
                        onClick={(isRitual) => handleSwitchModeAndScroll(sp.id, isRitual)}
                        className={`inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-xl text-[11px] font-serif font-bold transition cursor-pointer select-none ${
                          isActive
                            ? "bg-gradient-to-b from-[#2A2118] to-[#1C1610] text-[#F3E5AB] border border-[#D4AF37] shadow-sm"
                            : "bg-[#FAF6EE]/90 hover:bg-[#EFE6D5] text-[#4A3B28] border border-[#C4963E]/35"
                        }`}
                        title={`Chuyển sang ${SPREAD_MODE_NAMES[sp.id]} (mỗi vị trí là 1 bộ 448 lá riêng: 384 Hào Từ + 64 Quẻ Chính chia đều tỷ lệ)`}
                      >
                        <span className="truncate">{sp.short}</span>
                      </RitualHoldButton>
                    );
                  })}
                </div>

                {/* Nút Đổi Chiều Lá 2 khi đang ở Thập Tinh Trận (10 Lá) */}
                {mode === "thap_tinh" && (
                  <button
                    type="button"
                    onClick={handleToggleCard2Reversed}
                    className={`inline-flex items-center justify-center gap-1.5 w-full px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs active:scale-95 ${
                      isCard2Reversed
                        ? "bg-rose-50/95 text-rose-900 border border-rose-400/70"
                        : "bg-emerald-50/95 text-emerald-900 border border-emerald-400/70"
                    }`}
                    title="Bấm để đổi thế Lá thứ 2: Chiều Xuôi (Hỗ Trợ) ↔ Chiều Ngược (Trở Ngại)"
                  >
                    <span>🔄</span>
                    <span>Thế Lá Thứ 2: {isCard2Reversed ? "Chiều Ngược (Trở Ngại)" : "Chiều Xuôi (Hỗ Trợ)"}</span>
                  </button>
                )}

                {/* Cụm Đổi Chiều Lá 2A & 2B khi đang ở Thập Tinh Mở Rộng (11 Lá) */}
                {mode === "thap_nhat" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={handleToggleCard2AReversed}
                      className={`inline-flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs active:scale-95 ${
                        isCard2AReversed
                          ? "bg-rose-50/95 text-rose-900 border border-rose-400/70"
                          : "bg-emerald-50/95 text-emerald-900 border border-emerald-400/70"
                      }`}
                      title="Đổi chiều Lá 2A: Chiều Xuôi (Bổ Trợ Tích Cực) ↔ Chiều Ngược (Bổ Trợ Suy Yếu)"
                    >
                      <span>🔄</span>
                      <span>Lá 2A: {isCard2AReversed ? "Ngược (Bổ Trợ Suy)" : "Xuôi (Bổ Trợ)"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleToggleCard2BReversed}
                      className={`inline-flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs active:scale-95 ${
                        isCard2BReversed
                          ? "bg-emerald-50/95 text-emerald-900 border border-emerald-400/70"
                          : "bg-rose-50/95 text-rose-900 border border-rose-400/70"
                      }`}
                      title="Đổi chiều Lá 2B: Chiều Xuôi (Thách Thức Trở Ngại) ↔ Chiều Ngược (Áp Lực Giảm Nhẹ)"
                    >
                      <span>🔄</span>
                      <span>Lá 2B: {isCard2BReversed ? "Ngược (Áp Lực Giảm)" : "Xuôi (Thách Thức)"}</span>
                    </button>
                  </div>
                )}

                {/* Thanh hiển thị ★ Lá 3 Quẻ Khổng Minh & Gieo lại Hào Động khi đang ở Quẻ Khổng Minh (3 Lá) */}
                {mode === "khong_minh" && cards[2] && (
                  <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-[#FAF0D7]/95 border border-[#C4963E]/70 text-xs font-serif text-[#5C3D0E] shadow-2xs">
                    <span className="font-bold flex flex-wrap items-center gap-1.5">
                      <span className="text-[#B8862D]">★</span>
                      <span>
                        Lá 3 (Quẻ Khổng Minh #{cards[2].khongMinhOracleNum || 1}): {cards[2].name} · Động Hào {cards[2].khongMinhLine || 1}{" "}
                        <span className="font-normal text-[#7A5518]">
                          ({cards[2].khongMinhFromMain64 ? "64 Lá Chính ➔ Random Hào" : "Bộ 384 Hào"})
                        </span>
                      </span>
                    </span>
                    {cards[2].khongMinhFromMain64 && (
                      <button
                        type="button"
                        onClick={handleRerollKhongMinhLine}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1C1610] hover:brightness-125 text-[#F3E5AB] text-[11px] font-bold border border-[#D4AF37]/80 transition cursor-pointer active:scale-95"
                        title="Random sang 1 hào động khác (1–6) cho lá Quẻ Chính thứ 3"
                      >
                        <span>🎲</span>
                        <span>Random Hào Động</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Thanh hiển thị & Gieo lại ★ Cung Mệnh ngẫu nhiên khi đang ở Thập Nhị Cung (12 Lá) */}
                {mode === "thap_nhi" && (
                  <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-[#FAF0D7]/95 border border-[#C4963E]/70 text-xs font-serif text-[#5C3D0E] shadow-2xs">
                    <span className="font-bold flex items-center gap-1.5">
                      <span className="text-[#B8862D]">★</span>
                      <span>
                        Cung Mệnh tự động: Địa Chi{" "}
                        {TWELVE_BRANCHES_DATA.find((b) => b.number === menhBranchNumber)?.name || "Dần"} (
                        {TWELVE_BRANCHES_DATA.find((b) => b.number === menhBranchNumber)?.lunarMonth || "Tháng Giêng"})
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={handleRerollMenhBranch}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1C1610] hover:brightness-125 text-[#F3E5AB] text-[11px] font-bold border border-[#D4AF37]/80 transition cursor-pointer active:scale-95"
                      title="Random sang vị trí Địa Chi khác làm ★ Cung Mệnh"
                    >
                      <span>🎲</span>
                      <span>Random Cung Mệnh</span>
                    </button>
                  </div>
                )}

                {/* CỤM 2 & 3: QUẢN TRỊ BÀN QUẺ & NÚT CHÉP TOÀN THƯ AI */}
                <div className="flex flex-col gap-2.5">
                  <div id="cuunhi-command-dock-controls" className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
                    {/* Nút Khóa / Giữ nguyên */}
                    <RitualHoldButton
                      id="hero-action-keep-cards"
                      active={isKeepCards}
                      onClick={(isRitual) => handleToggleKeepCards(isRitual)}
                      className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer select-none ${
                        isKeepCards
                          ? "bg-[#F5E8C7] text-[#5C3D0E] border border-[#C4963E] font-bold shadow-2xs"
                          : "bg-[#FAF6EE]/90 hover:bg-[#EFE6D5] text-[#4A3B28] border border-[#C4963E]/30"
                      }`}
                      title="Ô giữ nguyên: Bật/Tắt giữ nguyên các lá bài hiện tại khi đổi trận pháp"
                    >
                      <span
                        className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          isKeepCards
                            ? "bg-[#B8862D] text-white"
                            : "border border-[#9E8A68] bg-white/80 text-transparent"
                        }`}
                      >
                        ✓
                      </span>
                      <span className="truncate">Giữ nguyên</span>
                    </RitualHoldButton>

                    {/* Nút Lưu Quẻ */}
                    <button
                      type="button"
                      onClick={() => setIsSaveDialogOpen(true)}
                      className="inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold bg-[#FAF6EE]/90 hover:bg-[#EFE6D5] text-[#4A3B28] hover:text-[#1C1610] border border-[#C4963E]/35 transition cursor-pointer active:scale-95 select-none shadow-2xs"
                      title="Lưu trải bài hiện tại kèm Câu hỏi AI và Đáp án tự điền"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-[#B8862D]" />
                      <span>Lưu Quẻ</span>
                    </button>

                    {/* Nút Mở Quẻ */}
                    <button
                      type="button"
                      onClick={() => {
                        reloadSavedSpreads();
                        setIsSavedSpreadsModalOpen(true);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold bg-[#FAF6EE]/90 hover:bg-[#EFE6D5] text-[#4A3B28] hover:text-[#1C1610] border border-[#C4963E]/35 transition cursor-pointer active:scale-95 select-none shadow-2xs"
                      title="Mở danh sách các quẻ đã lưu"
                    >
                      <FolderOpen className="w-3.5 h-3.5 text-[#B8862D]" />
                      <span>Mở Quẻ</span>
                      {savedSpreads.length > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#1C1610] text-[#F3E5AB]">
                          {savedSpreads.length}
                        </span>
                      )}
                    </button>

                    {/* Nút Quẻ Tạm Thời */}
                    <button
                      type="button"
                      onClick={() => {
                        reloadTempSpreads();
                        setIsTempSpreadsModalOpen(true);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold bg-[#FAF6EE]/90 hover:bg-[#EFE6D5] text-[#4A3B28] hover:text-[#1C1610] border border-[#C4963E]/35 transition cursor-pointer active:scale-95 select-none shadow-2xs"
                      title="Mở danh sách các quẻ tạm thời mới mở hôm nay chưa nhấn lưu"
                    >
                      <Clock className="w-3.5 h-3.5 text-[#B8862D]" />
                      <span className="truncate">Quẻ Tạm</span>
                      {tempSpreads.length > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#F3E5AB] text-[#5C3D0E] border border-[#C4963E]/60">
                          {tempSpreads.length}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* CỤM 3: HERO CTA - CHÉP TOÀN THƯ CHO AI (ĐIỂM NHẤN SƠN MÀI HỔ PHÁCH × VÀNG KIM HOÀNG GIA) */}
                  <div className="relative w-full">
                    <button
                      type="button"
                      id="btn-copy-all-for-ai"
                      onClick={handleCopyCardsForAI}
                      className={`inline-flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-xs sm:text-sm font-serif font-bold transition shadow-md select-none ${
                        copiedAI
                          ? "bg-emerald-700 text-white border border-emerald-400 cursor-pointer active:scale-[0.99]"
                          : "text-[#F5E6C4] border border-[#D4AF37]/85 hover:brightness-110 cursor-pointer active:scale-[0.99]"
                      }`}
                      style={
                        copiedAI
                          ? undefined
                          : {
                              background: "linear-gradient(135deg, #2A2118 0%, #1C1610 55%, #261D14 100%)",
                              boxShadow: "0 10px 24px -4px rgba(28, 22, 16, 0.28), inset 0 1px 0 rgba(212, 175, 55, 0.35)",
                            }
                      }
                      title="Sao chép toàn bộ thông tin các lá bài (kèm câu hỏi & đáp án) để gửi cho AI luận giải"
                    >
                      <span className="text-base text-[#E5C158] shrink-0">
                        {copiedAI ? "✓" : isRitualCompleted ? "✨" : "⚡"}
                      </span>
                      <span>
                        {copiedAI
                          ? "Đã Sao Chép Toàn Bộ Quẻ Cho AI!"
                          : isRitualCompleted
                          ? "Chép Toàn Thư Bách Khoa Cho AI (Đắc Pháp)"
                          : "Chép Toàn Bộ Quẻ Bài & Câu Hỏi Cho AI"}
                      </span>
                      {(userIntentQuestion.trim() || userCustomAnswer.trim()) && !copiedAI && (
                        <span className="text-[10px] font-sans font-bold text-[#1C1610] bg-[#F3E5AB] px-2 py-0.5 rounded-full border border-[#D4AF37]">
                          +Kèm Tâm Niệm
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* KHỐI 3: CỤM NÚT DONATE & NGÔN NGỮ / ĐĂNG NHẬP */}
              <div className="mt-5 w-full flex flex-wrap items-center justify-between gap-3">
                {/* Nút Donate Ủng Hộ Dự Án */}
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenDonateModal) onOpenDonateModal();
                    else window.dispatchEvent(new CustomEvent("open-donate-modal"));
                  }}
                  className="group inline-flex h-11 items-center gap-2 px-4 rounded-full text-amber-900 font-serif text-xs sm:text-sm font-bold cursor-pointer transition-all hover:-translate-y-0.5 active:scale-[0.98]"
                  style={{
                    background: "linear-gradient(180deg, #FFFDF8 0%, #F9F0DF 100%)",
                    border: "1px solid rgba(212, 175, 55, 0.75)",
                    boxShadow: "0 6px 18px rgba(184, 134, 45, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
                  }}
                  title="Quét mã QR donate ủng hộ dự án Cửu Nhị"
                >
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20 group-hover:scale-110 transition-transform" />
                  <span>Donate Ủng Hộ</span>
                  <QrCode className="w-3.5 h-3.5 text-amber-600" />
                </button>

                {/* Ngôn ngữ & Đăng nhập / Tài khoản Cửu Nhị (Đồng bộ vỏ Lụa Tuyên Thành + nút Sơn Mài Hổ Phách, xóa bỏ bg-stone-50 & bg-black) */}
                <div
                  className="inline-flex h-11 items-center gap-2 rounded-full px-1.5 pl-3 backdrop-blur-md"
                  style={{
                    background: "linear-gradient(180deg, #FDFBF7 0%, #F2EAE0 100%)",
                    border: "1px solid rgba(196, 150, 62, 0.55)",
                    boxShadow: "0 6px 18px rgba(110, 90, 55, 0.10), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
                  }}
                >
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                      className="flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-2 text-xs font-serif font-bold text-[#4A3B28] transition hover:text-[#1C1610]"
                      aria-label="Language"
                      title="Chuyển đổi ngôn ngữ"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-[#996515]">
                        <path d="M12 22a10 10 0 100-20 10 10 0 000 20zM2 12h20" stroke="currentColor" strokeWidth="1.6" />
                        <path d="M12 2a15 15 0 000 20M12 2a15 15 0 010 20" stroke="currentColor" strokeWidth="1.6" />
                      </svg>
                      <span className="uppercase tracking-wider text-[11px]">VI</span>
                    </button>
                    {isLangMenuOpen && (
                      <ul className="absolute bottom-full left-0 z-[120] mb-2 min-w-[10.5rem] rounded-xl border border-[#C4963E]/45 bg-[#FDFBF7] py-1 shadow-xl text-left">
                        <li>
                          <a className="block px-3 py-2 text-sm bg-[#F5E8C7]/70 text-[#5C3D0E] font-semibold" href="#">
                            🇻🇳 Tiếng Việt
                          </a>
                        </li>
                        <li>
                          <a className="block px-3 py-2 text-sm text-[#4A3B28] hover:bg-[#FAF3E3]" href="#">
                            🇬🇧 English
                          </a>
                        </li>
                        <li>
                          <a className="block px-3 py-2 text-sm text-[#4A3B28] hover:bg-[#FAF3E3]" href="#">
                            🇹🇼 繁體中文
                          </a>
                        </li>
                      </ul>
                    )}
                  </div>

                  {/* Vạch ngăn cách Chỉ Vàng 2800K */}
                  <span className="h-4 w-[1px] bg-[#C4963E]/35" />

                  {currentUser ? (
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <button
                        type="button"
                        id="btn-user-cuunhi-badge"
                        onClick={() => onEnterApp("yilore")}
                        className="inline-flex h-8 items-center gap-1.5 rounded-full bg-gradient-to-b from-[#2A2118] to-[#1C1610] border border-[#D4AF37]/75 px-3.5 text-xs font-serif font-bold text-[#F3E5AB] transition hover:brightness-110 shadow-2xs cursor-pointer"
                        title="Nhấn để vào ứng dụng Cửu Nhị (/en/app)"
                      >
                        <span className="text-[#D4AF37]">☯</span>
                        <span className="max-w-[100px] truncate">{currentUser.name}</span>
                        {currentUser.isAdmin && (
                          <span className="text-[10px] bg-[#D4AF37] text-[#1C1610] font-bold px-1.5 py-0.5 rounded-full">Admin</span>
                        )}
                      </button>
                      {onLogout && (
                        <button
                          type="button"
                          onClick={onLogout}
                          className="inline-flex h-8 items-center justify-center rounded-full px-2.5 text-xs font-semibold text-[#6E5D47] hover:text-[#9E2A2B] hover:bg-[#EFE6D5] transition cursor-pointer"
                          title="Đăng xuất tài khoản Cửu Nhị"
                        >
                          Thoát
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      id="btn-web-signin"
                      onClick={() => onOpenAuthModal?.("login")}
                      className="inline-flex h-8 min-w-[5rem] shrink-0 items-center justify-center whitespace-nowrap rounded-full px-4 text-xs font-serif font-bold text-[#F3E5AB] transition hover:brightness-110 cursor-pointer"
                      style={{
                        background: "linear-gradient(135deg, #2A2118 0%, #1C1610 100%)",
                        border: "1px solid rgba(212, 175, 55, 0.72)",
                        boxShadow: "0 4px 10px rgba(28, 22, 16, 0.22)",
                      }}
                    >
                      Đăng nhập
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Giữ nguyên neo vật lý ẩn để không ảnh hưởng engine cuộn bài */}
            <div
              ref={featuresAnchorRef}
              id="features-card-anchor"
              className="hidden pointer-events-none"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* MODAL XEM CHI TIẾT KẾT QUẢ LUẬN GIẢI TRỰC TIẾP TỪ TRANG CHỦ */}
        {isDirectResultModalOpen && (
          <div className="fixed inset-0 z-[260] flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
            <div className="relative w-full max-w-3xl max-h-[88vh] rounded-2xl border-2 border-[#D4AF37] bg-[#FDFBF7] text-[#231C14] shadow-2xl flex flex-col overflow-hidden">
              <div
                className="px-5 py-3.5 flex items-center justify-between border-b border-[#C4963E]/40"
                style={{
                  background: "linear-gradient(135deg, #2A2118 0%, #1C1610 100%)",
                }}
              >
                <div className="flex items-center gap-2 text-[#F3E5AB] font-serif font-bold text-sm sm:text-base">
                  <span>☯</span>
                  <span>Bản Luận Giải Trực Tiếp Từ Trang Chủ · Cửu Nhị Đại Sư</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDirectResultModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#F3E5AB] flex items-center justify-center font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-2 px-5 pt-3 pb-2 bg-[#F6EFE2] border-b border-[#C4963E]/30 text-xs font-serif font-bold">
                <button
                  type="button"
                  onClick={() => setDirectResultActiveTab("interp")}
                  className={`px-3.5 py-1.5 rounded-lg cursor-pointer transition ${
                    directResultActiveTab === "interp"
                      ? "bg-[#8B1E22] text-[#FFF8E7] shadow-xs"
                      : "bg-white/80 text-[#5C3D0E] hover:bg-white"
                  }`}
                >
                  📜 Luận Giải Chi Tiết (4 Phần)
                </button>
                <button
                  type="button"
                  onClick={() => setDirectResultActiveTab("script")}
                  className={`px-3.5 py-1.5 rounded-lg cursor-pointer transition ${
                    directResultActiveTab === "script"
                      ? "bg-[#8B1E22] text-[#FFF8E7] shadow-xs"
                      : "bg-white/80 text-[#5C3D0E] hover:bg-white"
                  }`}
                >
                  🎙️ Kịch Bản Thuyết Minh Video 9:16
                </button>
                <button
                  type="button"
                  onClick={() => setDirectResultActiveTab("raw")}
                  className={`px-3.5 py-1.5 rounded-lg cursor-pointer transition ${
                    directResultActiveTab === "raw"
                      ? "bg-[#8B1E22] text-[#FFF8E7] shadow-xs"
                      : "bg-white/80 text-[#5C3D0E] hover:bg-white"
                  }`}
                >
                  ⚡ Nội Dung “Chép Cho AI” Từ Trang Chủ
                </button>
              </div>

              {/* Body */}
              <div className="p-5 overflow-y-auto flex-1 font-serif text-sm leading-relaxed whitespace-pre-wrap text-[#231C14]">
                {directResultActiveTab === "interp" &&
                  (directHomeResult?.full_interpretation ||
                    "Chưa có bản luận giải. Hãy nhấn nút “🚀 BẮT ĐẦU TỰ ĐỘNG HÓA TOÀN BỘ” để hệ thống tự chụp hình thẻ bài và luận giải trực tiếp từ trang chủ.")}
                {directResultActiveTab === "script" &&
                  (directHomeResult?.video_script ||
                    "Chưa có kịch bản giọng đọc. Hãy nhấn nút “🚀 BẮT ĐẦU TỰ ĐỘNG HÓA TOÀN BỘ” để tạo kịch bản và video 9:16.")}
                {directResultActiveTab === "raw" &&
                  (directHomeRawAIText ||
                    "Nhấn “🚀 BẮT ĐẦU TỰ ĐỘNG HÓA TOÀN BỘ” để tự động trích xuất toàn bộ nội dung Chép cho AI từ trang chủ.")}
              </div>

              <div className="px-5 py-3 bg-[#F6EFE2] border-t border-[#C4963E]/30 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-[#6E5D47]">
                  {directHomeResult?.hexagram_title
                    ? `Quẻ đã luận: ${directHomeResult.hexagram_title}`
                    : "Nguồn dữ liệu: Trực tiếp từ bàn bài đang hiển thị trên Trang Chủ"}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleStartDirectHomeAutomation}
                    disabled={isDirectHomeRunning}
                    className="px-4 py-1.5 rounded-lg bg-[#8B1E22] text-[#FFF8E7] text-xs font-serif font-bold hover:brightness-110 cursor-pointer"
                  >
                    {isDirectHomeRunning ? `Đang chạy (${directHomePercent}%)...` : "🚀 Luận Giải & Dựng Video Mới"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDirectResultModalOpen(false)}
                    className="px-4 py-1.5 rounded-lg bg-[#2A2118] text-[#F3E5AB] text-xs font-serif font-bold hover:brightness-110 cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          6. FOOTER
          ══════════════════════════════════════════════════════════════════ */}
      <footer className="bg-[#080810] py-10 px-6 text-center border-t border-white/10 text-stone-300">
        <div className="flex items-center justify-center gap-2.5 mb-4">
          <span className="h-8 w-8 rounded-xl bg-zinc-900 border border-[#C4963E]/40 flex items-center justify-center overflow-hidden">
            <BrandMark size={24} title="Cửu Nhị" />
          </span>
          <span className="font-serif text-lg font-bold text-white tracking-wide">
            I Ching Tarot · Cửu Nhị
          </span>
        </div>

        <div className="flex items-center justify-center gap-6 mb-6 flex-wrap text-xs text-stone-400">
          <button type="button" onClick={() => onEnterApp("divination")} className="hover:text-white transition cursor-pointer">
            ☯ Bốc Quẻ
          </button>
          <button type="button" onClick={() => window.open(getHexagramsUrl(), "_blank", "noopener,noreferrer")} className="text-[#C4963E] hover:underline font-semibold cursor-pointer">
            📖 Bách Khoa 64 Quẻ Kinh Dịch ↗
          </button>
          <button type="button" onClick={() => window.open(getBlogUrl(), "_blank", "noopener,noreferrer")} className="text-[#C4963E] hover:underline font-semibold cursor-pointer">
            📝 Blog Dịch Học ↗
          </button>
          <button type="button" onClick={() => onEnterApp("pricing")} className="hover:text-white transition cursor-pointer">
            Báo Giá
          </button>
          <button
            type="button"
            onClick={() => {
              if (onOpenDonateModal) onOpenDonateModal();
              else window.dispatchEvent(new CustomEvent("open-donate-modal"));
            }}
            className="hover:text-amber-300 text-amber-400/90 font-semibold transition cursor-pointer flex items-center gap-1.5"
            title="Quét mã QR donate ủng hộ dự án Cửu Nhị"
          >
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-500/30" />
            <span>Donate Ủng Hộ</span>
            <QrCode className="w-3.5 h-3.5 text-amber-400" />
          </button>
        </div>

        <p className="text-[11px] text-stone-500 m-0">
          Kinh Dịch Chiêm Bốc · 周易塔羅 · Trí Tuệ Cổ Nhân 5.000 Năm
        </p>
      </footer>

      {/* ══════════════════════════════════════════════════════════════════
          7. MODAL: CHI TIẾT THẺ BÀI (HỘP GẤM BẢO VẬT 2 MẶT)
          ══════════════════════════════════════════════════════════════════ */}
      {selectedCard && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 bg-black/88 backdrop-blur-md overflow-y-auto"
          onClick={() => setSelectedCard(null)}
        >
          <div
            className="relative w-full max-w-lg sm:max-w-xl my-auto rounded-3xl bg-gradient-to-b from-[#1A1612] via-[#13100C] to-[#0E0B08] border-2 border-[#C4963E]/60 shadow-[0_0_70px_rgba(196,150,62,0.22)] p-5 sm:p-6 text-center text-stone-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Hào quang 2800K rọi từ đỉnh hộp gấm */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-56 opacity-45"
              style={{
                background: "radial-gradient(ellipse at center, rgba(212, 175, 55, 0.35) 0%, transparent 70%)",
              }}
            />

            <button
              type="button"
              onClick={() => setSelectedCard(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-[#C4963E]/30 border border-[#C4963E]/30 flex items-center justify-center text-stone-300 hover:text-white transition cursor-pointer z-10"
              title="Đóng bảng chi tiết"
            >
              ✕
            </button>

            {/* Bộ chuyển đổi góc nhìn: Cả 2 mặt / Mặt trước / Mặt sau */}
            <div className="relative z-10 inline-flex items-center justify-center gap-1 p-1 rounded-full bg-[#0B0907]/90 border border-[#C4963E]/40 mb-4">
              <button
                type="button"
                onClick={() => setModalCardView("both")}
                className={`px-3.5 py-1 rounded-full text-xs font-serif font-semibold transition cursor-pointer ${
                  modalCardView === "both"
                    ? "bg-gradient-to-r from-[#E5C158] to-[#C4963E] text-stone-950 font-bold shadow-md"
                    : "text-[#D8C8A8] hover:text-white"
                }`}
              >
                ✦ Cả 2 Mặt
              </button>
              <button
                type="button"
                onClick={() => setModalCardView("front")}
                className={`px-3.5 py-1 rounded-full text-xs font-serif font-semibold transition cursor-pointer ${
                  modalCardView === "front"
                    ? "bg-gradient-to-r from-[#E5C158] to-[#C4963E] text-stone-950 font-bold shadow-md"
                    : "text-[#D8C8A8] hover:text-white"
                }`}
              >
                Mặt Trước
              </button>
              <button
                type="button"
                onClick={() => setModalCardView("back")}
                className={`px-3.5 py-1 rounded-full text-xs font-serif font-semibold transition cursor-pointer ${
                  modalCardView === "back"
                    ? "bg-gradient-to-r from-[#E5C158] to-[#C4963E] text-stone-950 font-bold shadow-md"
                    : "text-[#D8C8A8] hover:text-white"
                }`}
              >
                Mặt Sau
              </button>
            </div>

            {/* Khung hiển thị các lá bài (Full hình 100% không bị crop xén) */}
            {modalCardView === "both" ? (
              <div className="relative z-10 flex items-center justify-center gap-3 sm:gap-6 mb-4">
                {/* Khung Mặt Trước */}
                <div className="flex flex-col items-center">
                  <span className="text-[11px] font-serif font-semibold text-[#F3E5AB] mb-1.5 flex items-center gap-1">
                    <span className="text-[#D4AF37]">✦</span> Mặt Trước (Quẻ Tượng)
                  </span>
                  <div
                    className={`relative rounded-2xl overflow-hidden shadow-[0_12px_36px_rgba(0,0,0,0.65)] border-2 border-[#C4963E]/65 bg-[#0A0806] flex items-center justify-center p-1 group hover:border-[#F3E5AB] transition-transform duration-500 ${
                      (mode === "thap_tinh" && selectedCard.id === cards[1]?.id && isCard2Reversed) ||
                      (mode === "thap_nhat" &&
                        ((selectedCard.id === cards[1]?.id && isCard2AReversed) ||
                          (selectedCard.id === cards[2]?.id && isCard2BReversed)))
                        ? "rotate-180"
                        : ""
                    }`}
                    style={{
                      width: selectedCard.type === "yao" ? "150px" : "140px",
                      height: selectedCard.type === "yao" ? "200px" : "205px",
                      maxWidth: "42vw",
                      maxHeight: "36vh",
                    }}
                  >
                    <img
                      src={selectedCard.img}
                      alt={`${selectedCard.name} - Mặt trước`}
                      className="w-full h-full object-contain rounded-xl drop-shadow-md transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.onerror = null;
                        const fallback = selectedCard.type === "yao"
                          ? `/assets/oss/${selectedCard.hexNumber}/${selectedCard.hexNumber}-${selectedCard.yaoNumber}a.webp`
                          : `/assets/oss/${selectedCard.hexNumber}/${selectedCard.hexNumber}a.webp`;
                        if (target.src !== fallback && !target.src.endsWith(fallback)) {
                          target.src = fallback;
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Khung Mặt Sau */}
                <div className="flex flex-col items-center">
                  <span className="text-[11px] font-serif font-semibold text-[#F3E5AB] mb-1.5 flex items-center gap-1">
                    <span className="text-[#D4AF37]">✦</span> Mặt Sau (Thoán Từ)
                  </span>
                  <div
                    className="relative rounded-2xl overflow-hidden shadow-[0_12px_36px_rgba(0,0,0,0.65)] border-2 border-[#C4963E]/65 bg-[#0A0806] flex items-center justify-center p-1 group hover:border-[#F3E5AB] transition"
                    style={{
                      width: selectedCard.type === "yao" ? "150px" : "140px",
                      height: selectedCard.type === "yao" ? "200px" : "205px",
                      maxWidth: "42vw",
                      maxHeight: "36vh",
                    }}
                  >
                    <img
                      src={
                        selectedCard.backImg ||
                        (selectedCard.type === "yao"
                          ? `/assets/oss/${selectedCard.hexNumber}/${selectedCard.hexNumber}-${selectedCard.yaoNumber}b.webp`
                          : `/assets/oss/${selectedCard.hexNumber}/${selectedCard.hexNumber}b.webp`)
                      }
                      alt={`${selectedCard.name} - Mặt sau`}
                      className="w-full h-full object-contain rounded-xl drop-shadow-md transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.onerror = null;
                        const fallback = selectedCard.type === "yao"
                          ? `/assets/oss/${selectedCard.hexNumber}/${selectedCard.hexNumber}-${selectedCard.yaoNumber}b.webp`
                          : `/assets/oss/${selectedCard.hexNumber}/${selectedCard.hexNumber}b.webp`;
                        if (target.src !== fallback && !target.src.endsWith(fallback)) {
                          target.src = fallback;
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative z-10 mx-auto flex flex-col items-center justify-center mb-4">
                <span className="text-[11px] font-serif font-semibold text-[#F3E5AB] mb-1.5 flex items-center gap-1">
                  <span className="text-[#D4AF37]">✦</span> {modalCardView === "front" ? "Mặt Trước (Quẻ Tượng)" : "Mặt Sau (Thoán Từ)"}
                </span>
                <div
                  className={`relative rounded-2xl overflow-hidden shadow-[0_12px_36px_rgba(0,0,0,0.65)] border-2 border-[#C4963E]/65 bg-[#0A0806] flex items-center justify-center p-1 group hover:border-[#F3E5AB] transition-transform duration-500 ${
                    (mode === "thap_tinh" && selectedCard.id === cards[1]?.id && isCard2Reversed) ||
                    (mode === "thap_nhat" &&
                      ((selectedCard.id === cards[1]?.id && isCard2AReversed) ||
                        (selectedCard.id === cards[2]?.id && isCard2BReversed)))
                      ? "rotate-180"
                      : ""
                  }`}
                  style={{
                    width: selectedCard.type === "yao" ? "220px" : "180px",
                    height: selectedCard.type === "yao" ? "290px" : "265px",
                    maxWidth: "80vw",
                    maxHeight: "40vh",
                  }}
                >
                  <img
                    src={
                      modalCardView === "front"
                        ? selectedCard.img
                        : selectedCard.backImg ||
                          (selectedCard.type === "yao"
                            ? `/assets/oss/${selectedCard.hexNumber}/${selectedCard.hexNumber}-${selectedCard.yaoNumber}b.webp`
                            : `/assets/oss/${selectedCard.hexNumber}/${selectedCard.hexNumber}b.webp`)
                    }
                    alt={`${selectedCard.name} - ${modalCardView === "front" ? "Mặt trước" : "Mặt sau"}`}
                    className="w-full h-full object-contain rounded-xl drop-shadow-md transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.onerror = null;
                      const isBack = modalCardView === "back";
                      const suffix = isBack ? "b.webp" : "a.webp";
                      const fallback = selectedCard.type === "yao"
                        ? `/assets/oss/${selectedCard.hexNumber}/${selectedCard.hexNumber}-${selectedCard.yaoNumber}${suffix}`
                        : `/assets/oss/${selectedCard.hexNumber}/${selectedCard.hexNumber}${suffix}`;
                      if (target.src !== fallback && !target.src.endsWith(fallback)) {
                        target.src = fallback;
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {selectedCard.positionLabel && (
              <div className="relative z-10 mb-3 flex flex-wrap items-center justify-center gap-2">
                <span
                  className={`inline-block px-3.5 py-1 rounded-full text-xs font-bold font-serif tracking-wider ${
                    (mode === "thap_nhi" && selectedCard.isMenhCung) ||
                    (mode === "cuu_cung" && selectedCard.id === cards[0]?.id) ||
                    (mode === "khong_minh" && selectedCard.slotIndex === 2)
                      ? "bg-amber-950 text-[#FEF08A] border-2 border-[#F59E0B] shadow-[0_0_16px_rgba(245,158,11,0.45)]"
                      : "bg-[#C4963E]/20 text-[#F3E5AB] border border-[#C4963E]/55"
                  }`}
                >
                  Vị trí: {selectedCard.positionLabel}
                </span>
                {mode === "khong_minh" && selectedCard.slotIndex === 2 && selectedCard.khongMinhFromMain64 && (
                  <button
                    type="button"
                    onClick={handleRerollKhongMinhLine}
                    className="px-3 py-1 rounded-full text-xs font-bold bg-[#1C1610] hover:bg-[#2A2118] text-[#F3E5AB] border border-[#D4AF37]/80 transition cursor-pointer flex items-center gap-1 shadow-md"
                    title="Gieo ngẫu nhiên lại hào động (1–6) cho lá Quẻ Chính thứ 3"
                  >
                    <span>🎲 Đổi Hào Động (Hào {selectedCard.khongMinhLine || 1})</span>
                  </button>
                )}
                {mode === "thap_tinh" && selectedCard.id === cards[1]?.id && (
                  <button
                    type="button"
                    onClick={() => handleToggleCard2Reversed()}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-md ${
                      isCard2Reversed
                        ? "bg-rose-950 text-rose-200 border border-rose-500 hover:bg-rose-900"
                        : "bg-emerald-950 text-emerald-200 border border-emerald-500 hover:bg-emerald-900"
                    }`}
                    title="Bấm để đổi thế: Chiều Xuôi (Hỗ Trợ) ↔ Chiều Ngược (Trở Ngại)"
                  >
                    <span>🔄 Đổi thế: {isCard2Reversed ? "Ngược (Trở Ngại)" : "Xuôi (Hỗ Trợ)"}</span>
                  </button>
                )}
                {mode === "thap_nhat" && selectedCard.id === cards[1]?.id && (
                  <button
                    type="button"
                    onClick={() => handleToggleCard2AReversed()}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-md ${
                      isCard2AReversed
                        ? "bg-rose-950 text-rose-200 border border-rose-500 hover:bg-rose-900"
                        : "bg-emerald-950 text-emerald-200 border border-emerald-500 hover:bg-emerald-900"
                    }`}
                    title="Đổi thế Lá 2A: Chiều Xuôi (Bổ Trợ) ↔ Chiều Ngược (Bổ Trợ Suy)"
                  >
                    <span>🔄 Đổi thế 2A: {isCard2AReversed ? "Ngược (Bổ Trợ Suy)" : "Xuôi (Bổ Trợ)"}</span>
                  </button>
                )}
                {mode === "thap_nhat" && selectedCard.id === cards[2]?.id && (
                  <button
                    type="button"
                    onClick={() => handleToggleCard2BReversed()}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-md ${
                      isCard2BReversed
                        ? "bg-emerald-950 text-emerald-200 border border-emerald-500 hover:bg-emerald-900"
                        : "bg-rose-950 text-rose-200 border border-rose-500 hover:bg-rose-900"
                    }`}
                    title="Đổi thế Lá 2B: Chiều Xuôi (Thách Thức) ↔ Chiều Ngược (Áp Lực Giảm)"
                  >
                    <span>🔄 Đổi thế 2B: {isCard2BReversed ? "Ngược (Áp Lực Giảm)" : "Xuôi (Thách Thức)"}</span>
                  </button>
                )}
                {mode === "thap_nhi" && (
                  <button
                    type="button"
                    onClick={handleRerollMenhBranch}
                    className="px-3 py-1 rounded-full text-xs font-bold bg-[#1C1610] hover:bg-[#2A2118] text-[#F3E5AB] border border-[#D4AF37]/80 transition cursor-pointer flex items-center gap-1 shadow-md"
                    title="Gieo ngẫu nhiên lại vị trí ★ Cung Mệnh"
                  >
                    <span>🎲 Đổi Cung Mệnh</span>
                  </button>
                )}
              </div>
            )}

            <div className="relative z-10 mb-2">
              <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#C4963E]/20 text-[#E5C158] border border-[#C4963E]/40 uppercase tracking-wider">
                {selectedCard.deckNumber ? `Bộ Riêng #${selectedCard.deckNumber} · ` : ""}
                {selectedCard.type === "yao" ? "384 Hào Từ Chu Dịch" : "64 Quẻ Chu Dịch"}
              </span>
            </div>

            <span className="relative z-10 text-4xl text-[#D4AF37] font-bold block mb-1 drop-shadow">{selectedCard.symbol}</span>
            <h3 className="relative z-10 text-xl font-serif font-bold text-[#FAF0D7] mb-1">{selectedCard.name}</h3>
            <p className="relative z-10 text-xs text-[#B8A88A] mb-3 font-serif">{selectedCard.sub}</p>
            <p className="relative z-10 text-xs leading-relaxed text-[#E6D7B8] bg-[#0B0907]/85 border border-[#C4963E]/25 rounded-xl p-3.5 text-left font-serif">
              {selectedCard.desc}
            </p>

            <div className="relative z-10 mt-5 flex flex-col sm:flex-row gap-2.5 justify-center">
              <button
                type="button"
                onClick={() => handleCopySingleCardForAI(selectedCard)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-semibold border transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md active:scale-95 ${
                  copiedSingle
                    ? "bg-emerald-600 text-white border-emerald-500"
                    : isRitualCompleted
                    ? "bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/60 ring-1 ring-amber-400/40"
                    : "bg-[#221D17] hover:bg-[#2C251D] text-[#F3E5AB] border-[#C4963E]/45"
                }`}
                title={
                  isRitualCompleted
                    ? "✨ Đã đắc pháp: Sao chép 100% bách khoa toàn thư của lá bài này cho AI (bao gồm Cửu Nhị Luận Giải, Chiêm Đoán 4 Phương Diện & FAQ)"
                    : "Sao chép nội dung tiêu chuẩn của lá bài này (quẻ tượng -> tên -> ý nghĩa -> lời giải) để gửi cho AI"
                }
              >
                <span>{copiedSingle ? "✓" : isRitualCompleted ? "✨" : "📋"}</span>
                <span>
                  {copiedSingle
                    ? "Đã chép cho AI!"
                    : isRitualCompleted
                    ? "Chép Toàn Thư cho AI"
                    : "Chép lá này cho AI"}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetUrl = getHexDetailUrl(
                    selectedCard.hexNumber,
                    selectedCard.yaoNumber || selectedCard.khongMinhLine
                  );
                  window.open(targetUrl, "_blank", "noopener,noreferrer");
                }}
                className="flex-1 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#E5C158] via-[#D4AF37] to-[#B8862D] text-stone-950 font-serif font-bold text-xs hover:brightness-110 transition shadow-lg cursor-pointer flex items-center justify-center gap-2"
                title="Mở trang luận giải chi tiết của quẻ này trong Bách Khoa Kinh Dịch"
              >
                <span>📖</span>
                <span>
                  {selectedCard.type === "yao" && selectedCard.yaoNumber
                    ? `Luận Giải Hào ${selectedCard.yaoNumber} Quẻ ${selectedCard.name} ↗`
                    : selectedCard.khongMinhLine
                    ? `Luận Giải Quẻ Khổng Minh #${selectedCard.khongMinhOracleNum || ""} (Hào ${selectedCard.khongMinhLine} ${selectedCard.name}) ↗`
                    : `Luận Giải Toàn Quẻ ${selectedCard.name} ↗`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          8. MODAL: PHÒNG GIEO QUẺ TUNG 3 ĐỒNG XU (DIVINATION STUDIO)
          ══════════════════════════════════════════════════════════════════ */}
      {isOracleOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
          onClick={() => setIsOracleOpen(false)}
        >
          <div
            className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl bg-gradient-to-b from-[#1A1612] to-[#0F0C09] border-2 border-[#C4963E]/55 shadow-[0_0_60px_rgba(196,150,62,0.2)] p-6 text-stone-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsOracleOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-stone-300 hover:text-white transition cursor-pointer"
            >
              ✕
            </button>

            <div className="text-center mb-5">
              <span className="inline-block px-3.5 py-1 rounded-full text-xs font-serif font-semibold bg-[#C4963E]/20 text-[#F3E5AB] border border-[#C4963E]/40 mb-2 uppercase tracking-widest">
                ☯ Cửu Nhị Lục Hào · Càn Long Thông Bảo
              </span>
              <h2 className="text-2xl font-serif font-bold text-[#FAF0D7] mb-1">Phòng Gieo Quẻ Kinh Dịch AI</h2>
              <p className="text-xs text-[#B8A88A]">Tĩnh tâm nghĩ về câu hỏi và tung 3 đồng xu cổ 6 lần để lập quẻ Lục Hào.</p>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-serif font-medium text-[#D8C8A8] mb-1.5">Câu hỏi trong tâm:</label>
              <input
                type="text"
                value={oracleQuestion}
                onChange={(e) => setOracleQuestion(e.target.value)}
                placeholder="Ví dụ: Vận thế sự nghiệp tháng tới của tôi ra sao?..."
                className="w-full rounded-xl bg-[#0B0907]/90 border border-[#C4963E]/35 px-4 py-2.5 text-sm text-[#FAF0D7] placeholder-[#7D6F5B] focus:outline-none focus:border-[#E5C158] font-serif"
              />
            </div>

            {/* Sân tung 3 đồng xu */}
            <div className="rounded-2xl bg-[#0B0907]/85 border border-[#C4963E]/30 p-5 mb-5 text-center shadow-inner">
              <div className="flex justify-center items-center gap-6 my-3">
                {["乾", "通", "寶"].map((txt, i) => (
                  <div
                    key={i}
                    className={`relative w-16 h-16 rounded-full flex items-center justify-center font-serif font-bold text-[#2B1B06] border-2 border-[#FFF0C2]/80 shadow-[0_6px_20px_rgba(212,175,55,0.35)] text-xl select-none ${isFlipping ? "flipping" : ""}`}
                    style={{
                      background: "radial-gradient(circle at 35% 35%, #F8E39B 0%, #D4AF37 55%, #8F6516 100%)",
                    }}
                  >
                    <span className="absolute w-3.5 h-3.5 border border-[#5E400A]/70 bg-[#120E0A]/25 pointer-events-none" />
                    <span className="relative z-10 drop-shadow-[0_1px_0_rgba(255,255,255,0.6)]">{txt}</span>
                  </div>
                ))}
              </div>

              {/* 6 Hào hiển thị */}
              <div className="space-y-1.5 max-w-xs mx-auto my-4 font-mono text-xs">
                {[6, 5, 4, 3, 2, 1].map((num) => {
                  const lineVal = lines[num - 1];
                  return (
                    <div key={num} className="flex items-center justify-between text-stone-400 py-0.5 border-b border-white/5">
                      <span className="w-12 text-left">Hào {num}</span>
                      <div className="flex-1 flex justify-center px-4">
                        {lineVal === undefined ? (
                          <span className="w-full h-2 rounded bg-white/10" />
                        ) : lineVal === 1 ? (
                          <span className="w-full h-2 rounded bg-[#C4963E]" title="Hào Dương" />
                        ) : (
                          <div className="w-full flex gap-2">
                            <span className="flex-1 h-2 rounded bg-cyan-400" />
                            <span className="flex-1 h-2 rounded bg-cyan-400" />
                          </div>
                        )}
                      </div>
                      <span className="w-16 text-right">
                        {lineVal === undefined ? "--" : lineVal === 1 ? "Dương ⚊" : "Âm ⚋"}
                      </span>
                    </div>
                  );
                })}
              </div>

              {coinsTossStep < 6 ? (
                <button
                  type="button"
                  onClick={handleTossCoin}
                  disabled={isFlipping}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full font-serif font-bold text-[#14100B] border border-[#FFF2C6] transition-transform active:scale-95 shadow-[0_8px_26px_rgba(212,175,55,0.35)] cursor-pointer"
                  style={{ background: "linear-gradient(135deg, #F3E5AB 0%, #D4AF37 55%, #B8862D 100%)" }}
                >
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#1C140A] text-[#F3E5AB] text-[10px] font-serif font-bold border border-[#D4AF37] leading-none">
                    寶
                  </span>
                  <span>Tung Đồng Xu (Hào {coinsTossStep + 1}/6)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleResetOracle}
                  className="px-6 py-2.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                >
                  ↻ Gieo Quẻ Mới
                </button>
              )}
            </div>

            {/* Kết quả quẻ */}
            {oracleResult && (
              <div className="rounded-2xl bg-white/5 border border-[#C4963E]/40 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div>
                    <span className="text-[10px] text-[#C4963E] font-bold uppercase">Quẻ Thỉnh Được</span>
                    <h3 className="text-lg font-bold text-white">{oracleResult.name}</h3>
                  </div>
                  <div className="text-2xl font-bold text-[#C4963E]">{oracleResult.symbol}</div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-stone-300">Thoán Từ:</h4>
                  <p className="text-xs text-stone-300 italic">{oracleResult.text}</p>
                </div>
                <div className="bg-black/40 rounded-xl p-3 border border-white/5">
                  <h4 className="text-[11px] font-bold text-[#C4963E] uppercase mb-1">Lời Khuyên Cửu Nhị AI:</h4>
                  <p className="text-xs leading-relaxed text-stone-200">{oracleResult.ai}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsOracleOpen(false);
                    onEnterApp("divination");
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#C4963E] text-stone-950 font-bold text-xs hover:bg-[#d4a344] transition shadow cursor-pointer"
                >
                  Vào Bàn Bốc Quẻ Chuyên Sâu 12 Trận Pháp →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          9. MODAL: PHIẾU KIỂM ĐỊNH NHÂN SINH (SỚ ĐIỆP THIÊN MỆNH & ẤN CHU SA)
          ══════════════════════════════════════════════════════════════════ */}
      {isLifeConfigOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/88 backdrop-blur-md overflow-y-auto"
          onClick={() => setIsLifeConfigOpen(false)}
        >
          <div
            className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl bg-gradient-to-b from-[#1A1612] to-[#0E0B08] border-2 border-[#C4963E]/55 shadow-[0_0_65px_rgba(196,150,62,0.22)] p-6 text-stone-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsLifeConfigOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-stone-300 hover:text-white transition cursor-pointer"
            >
              ✕
            </button>

            <div className="text-center mb-5">
              <span className="inline-block px-3.5 py-1 rounded-full text-xs font-serif font-semibold bg-[#C4963E]/20 text-[#F3E5AB] border border-[#C4963E]/45 mb-2 uppercase tracking-widest">
                ☯ Cửu Nhị Thiên Mệnh Tạo Hóa Cục
              </span>
              <h2 className="text-2xl font-serif font-bold text-[#FAF0D7] mb-1">Sớ Điệp Cấu Hình Nhân Sinh</h2>
              <p className="text-xs text-[#B8A88A]">Xuất bản phiếu kiểm định bản mệnh nguyên bản theo Tứ Trụ Bát Tự &amp; Chu Dịch.</p>
            </div>

            <div className="space-y-3.5 mb-5 text-xs font-serif">
              <div>
                <label className="block text-[#D8C8A8] mb-1">Ngày Xuất Xưởng (Dương Lịch):</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full rounded-xl bg-[#0B0907]/90 border border-[#C4963E]/35 px-3.5 py-2.5 text-[#FAF0D7] focus:outline-none focus:border-[#E5C158]"
                />
              </div>

              <div>
                <label className="block text-[#D8C8A8] mb-1">Giờ Xuất Xưởng (Thời Thần):</label>
                <select
                  value={birthHour}
                  onChange={(e) => setBirthHour(e.target.value)}
                  className="w-full rounded-xl bg-[#14100C] border border-[#C4963E]/35 px-3.5 py-2.5 text-[#FAF0D7] focus:outline-none focus:border-[#E5C158]"
                >
                  <option value="23-1">Giờ Tý (23:00 - 00:59)</option>
                  <option value="1-3">Giờ Sửu (01:00 - 02:59)</option>
                  <option value="3-5">Giờ Dần (03:00 - 04:59)</option>
                  <option value="5-7">Giờ Mão (05:00 - 06:59)</option>
                  <option value="7-9">Giờ Thìn (07:00 - 08:59)</option>
                  <option value="9-11">Giờ Tỵ (09:00 - 10:59)</option>
                  <option value="11-13">Giờ Ngọ (11:00 - 12:59)</option>
                  <option value="13-15">Giờ Mùi (13:00 - 14:59)</option>
                  <option value="15-17">Giờ Thân (15:00 - 16:59)</option>
                  <option value="17-19">Giờ Dậu (17:00 - 18:59)</option>
                  <option value="19-21">Giờ Tuất (19:00 - 20:59)</option>
                  <option value="21-23">Giờ Hợi (21:00 - 22:59)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#D8C8A8] mb-1">Mẫu Hình Âm Dương:</label>
                <div className="flex gap-5">
                  <label className="flex items-center gap-2 cursor-pointer text-[#FAF0D7]">
                    <input
                      type="radio"
                      name="cfg-gender"
                      value="Nam"
                      checked={gender === "Nam"}
                      onChange={() => setGender("Nam")}
                      className="accent-[#D4AF37]"
                    />
                    Nam (Càn Dương ☰)
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-[#FAF0D7]">
                    <input
                      type="radio"
                      name="cfg-gender"
                      value="Nữ"
                      checked={gender === "Nữ"}
                      onChange={() => setGender("Nữ")}
                      className="accent-[#D4AF37]"
                    />
                    Nữ (Khôn Âm ☷)
                  </label>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setReceiptGenerated(true)}
              className="w-full py-3 rounded-full font-serif font-bold text-[#14100B] border border-[#FFF2C6] transition-transform active:scale-95 shadow-[0_8px_28px_rgba(212,175,55,0.32)] mb-4 cursor-pointer"
              style={{ background: "linear-gradient(135deg, #F3E5AB 0%, #D4AF37 55%, #B8862D 100%)" }}
            >
              🖨️ Khai Ấn &amp; In Sớ Điệp Kiểm Định Nhân Sinh
            </button>

            {receiptGenerated && (
              <div className="relative rounded-2xl bg-[#FAF6EC] text-[#1E1912] p-5 font-serif text-xs shadow-2xl border-2 border-[#C4963E]/65 overflow-hidden">
                {/* Dấu Triện Chu Sa Cửu Nhị đóng nghiêng ở góc phải dưới */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none select-none absolute bottom-3 right-4 w-20 h-20 rounded-xl border-2 border-[#A62626]/75 flex flex-col items-center justify-center text-[#A62626] font-serif font-bold leading-tight rotate-[-12deg] opacity-85 bg-[#A62626]/[0.04]"
                >
                  <span className="text-[10px] tracking-widest">九二</span>
                  <span className="text-xs tracking-wider border-y border-[#A62626]/60 px-1 my-0.5">天命印</span>
                  <span className="text-[8px] uppercase">Giám Định</span>
                </div>

                <div className="text-center border-b-2 border-[#C4963E]/45 pb-2.5 mb-3">
                  <p className="font-bold text-xs tracking-[0.22em] uppercase text-[#7C5516]">☯ CỬU NHỊ THIÊN MỆNH TẠO HÓA CỤC ☯</p>
                  <p className="text-[11px] font-semibold text-[#2E251A] mt-0.5">CHỨNG NHẬN KIỂM ĐỊNH CẤU HÌNH NGUYÊN BẢN</p>
                  <p className="text-[9.5px] font-mono text-[#7D6E57] mt-0.5">Mã Sớ Điệp: CN-2026-8888 · Chuẩn Văn Vương</p>
                </div>
                <div className="space-y-1.5 mb-3 text-[11.5px]">
                  <div className="flex justify-between border-b border-[#E5DEC9] pb-1"><span>Nguyên Mẫu Bản Thể:</span><span className="font-bold text-[#1C1610]">{gender === "Nam" ? "Nam · Càn Vi Thiên (☰)" : "Nữ · Khôn Vi Địa (☷)"}</span></div>
                  <div className="flex justify-between border-b border-[#E5DEC9] pb-1"><span>Niên Nhật Xuất Xưởng:</span><span className="font-mono font-semibold">{birthDate}</span></div>
                  <div className="flex justify-between border-b border-[#E5DEC9] pb-1"><span>Thời Thần Khởi Khí:</span><span className="font-semibold">Khung Giờ {birthHour}</span></div>
                  <div className="flex justify-between border-b border-[#E5DEC9] pb-1"><span>Bản Mệnh Ngũ Hành:</span><span className="font-bold text-[#8C5E14]">Bạch Lạp Kim (Chân Kim Luyện Lửa)</span></div>
                  <div className="flex justify-between"><span>Độ Tương Thích Thiên Đạo:</span><span className="font-bold text-emerald-800">98.5% (Đắc Thời · Tối Ưu)</span></div>
                </div>
                <div className="border-t border-[#C4963E]/40 pt-2.5 mb-2.5 text-[11px] text-[#3B3123] leading-relaxed pr-16">
                  <p className="font-bold text-[#7C5516] mb-0.5">※ Cẩm Nang Bảo Dưỡng &amp; Vận Hành:</p>
                  <p>Thiên bẩm có trực giác bén nhạy và tư duy chiến lược sâu sắc. Cần bảo dưỡng định kỳ bằng giấc ngủ sâu, tĩnh tâm quán chiếu và giữ tâm bất động trước biến động ngoại cảnh.</p>
                </div>
                <div className="text-center border-t-2 border-[#C4963E]/45 pt-2 text-[9px] font-semibold tracking-wider text-[#7D6E57]">
                  ✦ NGUYÊN BẢN ĐỘC NHẤT VÔ NHỊ · TÂM TĨNH VẠN SỰ THÔNG ✦
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dialog xác nhận lưu quẻ */}
      <SaveSpreadDialog
        isOpen={isSaveDialogOpen}
        onClose={() => setIsSaveDialogOpen(false)}
        spreadTitle={SPREAD_MODE_NAMES[mode] || "Trận Pháp Kinh Dịch"}
        cardsCount={cards.length}
        question={userIntentQuestion}
        prediction={hexagramPrediction}
        initialAnswer={userCustomAnswer}
        onConfirmSave={handleConfirmSaveSpread}
        onGeneratePrediction={(q) =>
          generateHexagramPrediction(cards, mode, isCard2Reversed, q, {
            isCard2AReversed,
            isCard2BReversed,
            menhBranchNumber,
          })
        }
      />

      {/* Modal danh sách quẻ đã lưu */}
      <SavedSpreadsModal
        isOpen={isSavedSpreadsModalOpen}
        onClose={() => setIsSavedSpreadsModalOpen(false)}
        savedSpreads={savedSpreads}
        onReloadList={reloadSavedSpreads}
        onLoadSpread={handleLoadSavedSpread}
        onCopySpreadForAI={handleCopySavedSpreadForAI}
        onOpenTempSpreadsModal={() => {
          reloadTempSpreads();
          setIsTempSpreadsModalOpen(true);
        }}
        tempSpreadsCount={tempSpreads.length}
      />

      {/* Modal danh sách quẻ tạm thời trong ngày */}
      <TempSpreadsModal
        isOpen={isTempSpreadsModalOpen}
        onClose={() => setIsTempSpreadsModalOpen(false)}
        tempSpreads={tempSpreads}
        onReloadList={reloadTempSpreads}
        onLoadSpread={handleLoadTempSpread}
        onSaveSpreadPermanently={handleSaveTempSpreadPermanently}
        onCopySpreadForAI={handleCopyTempSpreadForAI}
        onOpenSavedSpreadsModal={() => {
          reloadSavedSpreads();
          setIsSavedSpreadsModalOpen(true);
        }}
        savedSpreadsCount={savedSpreads.length}
      />

      {/* Modal xem trước & tải ảnh chụp toàn bộ thẻ bài */}
      <ExportImageModal
        isOpen={isSnapshotModalOpen}
        onClose={() => setIsSnapshotModalOpen(false)}
        imageUrl={snapshotImageUrl}
        title="Ảnh Toàn Bộ Thẻ Bài Trải Trận"
        filename={`trai-bai-iching-tarot-${new Date().toISOString().slice(0, 10)}.png`}
      />



      {/* Floating Background Video Progress Pill & Completion Notification Card */}
      {isDirectHomeRunning && (
        <div
          className="fixed bottom-5 right-5 z-[295] max-w-xs sm:max-w-sm rounded-2xl border border-[#D4AF37]/70 bg-[#16120D]/95 text-[#F3E5AB] shadow-2xl backdrop-blur-md p-3.5 transition-all"
          style={{
            boxShadow: "0 16px 40px rgba(0,0,0,0.75), 0 0 20px rgba(212, 175, 55, 0.22)",
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-xs animate-spin">
                ☯
              </span>
              <div className="text-xs font-serif font-bold text-[#F5E3A9]">
                Đang Tạo Video Ngầm ({directHomePercent}%)
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsBgPillMinimized((v) => !v)}
              className="text-[10px] px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[#E5C158] cursor-pointer"
              title={isBgPillMinimized ? "Mở rộng chi tiết" : "Thu gọn"}
            >
              {isBgPillMinimized ? "Mở rộng ▲" : "Thu gọn ▼"}
            </button>
          </div>

          <div className="mt-2 h-2 w-full rounded-full bg-black/60 overflow-hidden border border-[#D4AF37]/35">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.max(5, directHomePercent)}%`,
                background: "linear-gradient(90deg, #D4AF37 0%, #34D399 100%)",
              }}
            />
          </div>

          <div className="mt-1.5 flex items-center justify-between text-[11px]">
            <span className="text-[#C4A66A]">⏱ Đã chạy: {formatSecondsMMSS(directHomeElapsed)}</span>
            <span className="font-bold text-emerald-400">
              ⏳ Còn: {directHomeEtaText || `~${directHomeEtaRemaining || 40} giây`}
            </span>
          </div>

          {!isBgPillMinimized && (
            <>
              <div className="mt-1.5 text-[10.5px] text-[#E8E2D5]/90 line-clamp-2">
                {directHomeStage || directHomeMessage}
              </div>
              <div className="mt-1.5 pt-1.5 border-t border-[#D4AF37]/20 flex items-center justify-between text-[9.5px] text-[#C4A66A]">
                <span>🔔 Xong sẽ đổ chuông & báo hiệu</span>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("direct-home-phone-mockup");
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                  className="text-[#F5E3A9] underline font-semibold hover:text-white cursor-pointer"
                >
                  Tới khung Video ↑
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {!isDirectHomeRunning && directHomeReadyBanner && (
        <div
          className="fixed bottom-5 right-5 z-[295] max-w-xs sm:max-w-sm rounded-2xl border-2 border-[#D4AF37] bg-[#19130D]/95 text-[#FFF8E7] shadow-2xl backdrop-blur-md p-4 transition-all"
          style={{
            boxShadow: "0 18px 45px rgba(0,0,0,0.85), 0 0 28px rgba(212, 175, 55, 0.38)",
          }}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎬</span>
              <div>
                <div className="text-xs font-serif font-bold text-[#F5E3A9] uppercase tracking-wider">
                  Video 9:16 Đã Hoàn Tất!
                </div>
                <div className="text-[11px] text-emerald-300 font-semibold">
                  {directHomeReadyBanner.hexagramTitle}
                  {directHomeReadyBanner.duration ? ` · ${directHomeReadyBanner.duration}s` : ""}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setDirectHomeReadyBanner(null)}
              className="text-xs text-[#C4A66A] hover:text-white px-1.5 py-0.5 cursor-pointer"
              title="Đóng thông báo"
            >
              ✕
            </button>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setShowPhoneVideoMode(true);
                const el = document.getElementById("direct-home-phone-mockup");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                setDirectHomeReadyBanner(null);
              }}
              className="flex-1 py-1.5 px-3 rounded-xl text-xs font-serif font-bold text-[#1C1610] bg-[#D4AF37] hover:brightness-110 transition cursor-pointer text-center"
            >
              ▶ Xem Video Ngay
            </button>
            {directHomeReadyBanner.videoUrl && (
              <a
                href={resolveMediaUrl(directHomeReadyBanner.videoUrl)}
                download="iching_tarot_9_16.mp4"
                className="py-1.5 px-3 rounded-xl text-xs font-serif font-bold text-[#F5E3A9] border border-[#D4AF37]/70 bg-white/5 hover:bg-white/15 transition text-center"
              >
                ⬇ Tải MP4
              </a>
            )}
          </div>
        </div>
      )}

      {/* Toast thông báo đã sao chép cho AI */}
      {copiedToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-2 px-5 py-3 rounded-full bg-zinc-950/95 text-amber-300 border border-[#C4963E]/60 shadow-2xl backdrop-blur-md text-xs sm:text-sm font-sans tracking-wide pointer-events-none transition-all"
        >
          <span className="text-emerald-400 font-bold text-base">✓</span>
          <span>{copiedToast}</span>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
