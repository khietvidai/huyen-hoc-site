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
import { Camera, Bookmark, FolderOpen, Clock, Heart, QrCode } from "lucide-react";
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
import { downloadDataUrlAsPng } from "../utils/captureHelper";
import { ExportImageModal } from "./ExportImageModal";
import { BrandMark } from "./BrandMark";
import { NavTab } from "./Header";
import { HEXAGRAMS, getTransformedHexagram } from "../data/hexagrams";
import { AppUser } from "../services/authService";

export interface LandingPageProps {
  currentUser?: AppUser | null;
  onEnterApp: (tab?: NavTab, method?: string) => void;
  onOpenAuthModal?: (mode?: "login" | "register" | "upgrade") => void;
  onLogout?: () => void;
  onOpenDonateModal?: () => void;
}

const getHexagramsUrl = () => "/vi/hexagram";
const getBlogUrl = () => "/vi/blog/";


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

export type SpreadMode = "1_single" | "1_to_2" | "1_to_3" | "3_to_5" | "that_tinh" | "thap_tinh" | "thap_la";

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
  positionDesc?: string;
  isReversed?: boolean;
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

/* ─── Helper: Rút 1 lá ngẫu nhiên từ 64 quẻ và 384 hào ─── */
function drawRandomCard(): DynamicCardItem {
  if (!HEXAGRAMS || HEXAGRAMS.length === 0) {
    return {
      id: "1",
      type: "hexagram",
      hexNumber: 1,
      symbol: "䷀",
      hanzi: "乾",
      name: "Thuần Càn",
      sub: "Càn Vi Thiên (Trời cương kiện)",
      desc: "Khởi đầu lớn lao, hanh thông suôn sẻ, thu được lợi ích chính đáng.",
      img: "/assets/oss/1/1a.webp",
      backImg: "/assets/oss/1/1b.webp",
    };
  }

  const hex = HEXAGRAMS[Math.floor(Math.random() * HEXAGRAMS.length)];
  const isYao = Math.random() > 0.45; // ~55% rút Hào (384 hào), ~45% rút Quẻ chính (64 quẻ)

  if (isYao && hex.lineMeanings && hex.lineMeanings.length > 0) {
    const line = hex.lineMeanings[Math.floor(Math.random() * hex.lineMeanings.length)];
    return {
      id: `${hex.number}-${line.line}`,
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
    };
  }

  return {
    id: `${hex.number}`,
    type: "hexagram",
    hexNumber: hex.number,
    symbol: hex.symbol,
    hanzi: hex.upperTrigram && hex.lowerTrigram ? `${hex.upperTrigram}${hex.lowerTrigram}` : hex.name,
    name: hex.name,
    sub: hex.vietnameseName || `${hex.upperTrigram} trên ${hex.lowerTrigram}`,
    desc: hex.overview || hex.judgment || hex.image,
    img: `/assets/oss/${hex.number}/${hex.number}a.webp`,
    backImg: `/assets/oss/${hex.number}/${hex.number}b.webp`,
  };
}

/* ─── Helper: Rút danh sách bài cho từng cấu hình ─── */
function drawCardsForMode(mode: SpreadMode): DynamicCardItem[] {
  if (mode === "thap_la") {
    // 1. Quẻ Chủ (Bản Quái): Đầu tiên là bốc lá Quẻ Chủ từ 64 quẻ
    const priHex = HEXAGRAMS[Math.floor(Math.random() * HEXAGRAMS.length)];

    // 2. AI lựa chọn random động từ 0 đến 6 hào
    const numChanging = Math.floor(Math.random() * 7); // 0, 1, 2, 3, 4, 5, 6
    let changingLines: number[] = [];
    let transHex = priHex;

    if (numChanging === 0) {
      // Động 0 hào thì quẻ biến vẫn là quẻ chủ (Quẻ Tĩnh)
      changingLines = [];
      transHex = priHex;
    } else if (numChanging === 1) {
      // Động 1 hào thì sẽ chọn random từ hào 1 đến hào 6
      const randomLine = Math.floor(Math.random() * 6) + 1;
      changingLines = [randomLine];
      transHex = getTransformedHexagram(priHex, changingLines) || priHex;
    } else {
      // Các động hào khác (2..6 hào) cũng random tương tự từ hào 1 đến hào 6
      const allLines = [1, 2, 3, 4, 5, 6];
      for (let i = allLines.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allLines[i], allLines[j]] = [allLines[j], allLines[i]];
      }
      changingLines = allLines.slice(0, numChanging).sort((a, b) => a - b);
      transHex = getTransformedHexagram(priHex, changingLines) || priHex;
    }

    // Nếu Quẻ Chủ và Quẻ Biến cùng 1 quẻ thì không hiện hào động
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
    };

    // 3. Các lá hào từ (ở 384 lá bài hào từ) thay đổi theo các hào động AI đã chọn
    // Nếu Quẻ Chủ và Quẻ Biến cùng 1 quẻ thì không hiện hào động
    const changingYaoCards: DynamicCardItem[] = [];
    if (!isSameHex) {
      changingLines.forEach((lineNum) => {
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
          positionDesc: `Bước ngoặt biến dịch then chốt do AI phân định tại vị trí Hào ${lineNum}`,
        });
      });
    }

    // Thứ tự trả về: [Quẻ Chủ, Quẻ Biến, các lá hào từ thay đổi từ Sơ tới Lục]
    return [primaryCard, transformedCard, ...changingYaoCards];
  }

  if (mode === "that_tinh") {
    const list: DynamicCardItem[] = [];
    const seen = new Set<string>();
    let attempts = 0;
    while (list.length < 7 && attempts < 100) {
      attempts++;
      const c = drawRandomCard();
      if (!seen.has(c.id)) {
        seen.add(c.id);
        const pos = THAT_TINH_POSITIONS[list.length];
        list.push({
          ...c,
          positionLabel: pos ? pos.label : `Lá ${list.length + 1}`,
          positionDesc: pos ? pos.desc : "",
        });
      }
    }
    return list;
  }

  if (mode === "thap_tinh") {
    const list: DynamicCardItem[] = [];
    const seen = new Set<string>();
    let attempts = 0;
    while (list.length < 10 && attempts < 120) {
      attempts++;
      const c = drawRandomCard();
      if (!seen.has(c.id)) {
        seen.add(c.id);
        const pos = THAP_TINH_POSITIONS[list.length];
        list.push({
          ...c,
          positionLabel: pos ? pos.label : `Lá ${list.length + 1}`,
          positionDesc: pos ? pos.desc : "",
        });
      }
    }
    return list;
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

  const list: DynamicCardItem[] = [];
  const seen = new Set<string>();
  let attempts = 0;

  while (list.length < count && attempts < 50) {
    attempts++;
    const c = drawRandomCard();
    if (!seen.has(c.id)) {
      seen.add(c.id);
      const pos = positions[list.length];
      list.push({
        ...c,
        positionLabel: pos ? pos.label : `Lá ${list.length + 1}`,
        positionDesc: pos ? pos.desc : "",
      });
    }
  }
  return list;
}

export const SPREAD_MODES: SpreadMode[] = ["that_tinh", "thap_tinh", "thap_la", "3_to_5", "1_to_3", "1_to_2", "1_single"];

export const SPREAD_MODE_NAMES: Record<SpreadMode, string> = {
  "1_single": "Đơn Quẻ (1 Lá)",
  "1_to_2": "Trận Pháp Âm Dương (2 Lá)",
  "1_to_3": "Trận Pháp Tam Tài (3 Lá)",
  "3_to_5": "Trận Pháp Ngũ Hành (5 Lá)",
  "that_tinh": "Trận Pháp Thất Tinh (7 Lá)",
  "thap_tinh": "Trận Pháp Thập Tinh Celtic Cross (10 Lá)",
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
      const title = mHeading ? mHeading[1].replace(/<[^>]+>/g, '').trim() : '';

      // Bỏ qua thanh điều hướng mục lục, gợi ý liên quan hay widget gieo quẻ
      if (!title || title.includes('Khám Phá Quẻ Liên Quan') || title.includes('Gieo Một Quẻ Dịch AI') || title.includes('Sản phẩm') || title.includes('Kho tri thức') || title.includes('Hỗ trợ')) {
        continue;
      }

      const text = cleanHtmlToText(sHtml);
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
    // 2. Nếu là Lá Bài Quẻ (thuộc bộ 64 Quẻ)
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
    if (hex.lineMeanings && hex.lineMeanings.length > 0) {
      lines.push(`• Diễn biến 6 Hào của quẻ:`);
      hex.lineMeanings.forEach((lm) => {
        lines.push(`  + ${lm.name} (Hào ${lm.line}): "${lm.text}" ➔ ${lm.meaning}`);
      });
    }
  }

  // 3. Toàn bộ thông tin bài viết chuyên sâu từ Bách khoa (Tổng quan, Cửu Nhị Luận Giải, Chiêm đoán, FAQ, Các hào)
  if (articleData && articleData.sections && articleData.sections.length > 0) {
    lines.push("");
    lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`【BÁCH KHOA KINH DỊCH TOÀN THƯ (NGUỒN CHI TIẾT: ${articleData.url})】`);
    articleData.sections.forEach((sec) => {
      lines.push("");
      lines.push(`◆ ${sec.title.toUpperCase()}:`);
      lines.push(sec.text);
    });
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
  questionText?: string
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

  if (currentMode === "3_to_5") {
    const cPri = cardsList[2] || cardsList[0];
    const cRes = cardsList[4] || cardsList[cardsList.length - 1];
    const hexPri = HEXAGRAMS.find((h) => h.number === cPri?.hexNumber);
    const hexRes = HEXAGRAMS.find((h) => h.number === cRes?.hexNumber);
    const omenRes = hexRes?.omen ? `[${hexRes.omen}] ` : "";

    if (isQuestionEmpty) {
      return `Quẻ Chủ: ${cPri?.name} (${cPri?.sub}) ➔ Kết quả: ${cRes?.name} (${cRes?.sub}). Dự đoán: Vượt qua thử thách chuyển dịch để đạt lối thoát hanh thông.${EMPTY_QUESTION_REMINDER}`;
    }

    const insightPri = getHexDomainInsight(hexPri, domain);
    const insightRes = getHexDomainInsight(hexRes, domain);
    const omenOutlook = getOmenOutlookText(hexRes?.omen);

    return `🕊️ Tâm niệm / Câu hỏi: "${cleanedQuestion}"
• Ngũ Hành chuyển hóa: Quẻ Chủ: ${cPri?.name} (${cPri?.sub}) ➔ Kết quả: ${cRes?.name} ${omenRes}(${cRes?.sub}).
• Chiêm đoán theo ${domainLabel}: Trọng tâm nằm ở ${cPri?.name} (${insightPri || cPri?.desc}), sau chuỗi chuyển hóa sẽ đúc kết tại ${cRes?.name} (${insightRes || cRes?.desc}).
• Dự đoán kết quả: Về sự việc này: ${omenOutlook} Bạn sẽ vượt qua các chặng biến động để đạt lối thoát và thành quả hanh thông.
• Phương châm hành động: ${hexRes?.advice || "Giữ vững sơ tâm, biến chuyển linh hoạt theo thời cuộc."}`;
  }

  if (currentMode === "that_tinh") {
    const cur = cardsList[1];
    const adv = cardsList[3];
    const res = cardsList[4];
    const blind = cardsList[6];
    const hexCur = HEXAGRAMS.find((h) => h.number === cur?.hexNumber);
    const hexAdv = HEXAGRAMS.find((h) => h.number === adv?.hexNumber);
    const hexRes = HEXAGRAMS.find((h) => h.number === res?.hexNumber);
    const omenRes = hexRes?.omen ? `[${hexRes.omen}] ` : "";

    if (isQuestionEmpty) {
      return `Hiện tại: ${cur?.name} (${cur?.sub}). Lời khuyên gợi ý: ${adv?.name}. Dự đoán kết quả: ${res?.name} (${res?.sub}). Hành động theo minh triết ${adv?.name} để đón cát tránh hung.${EMPTY_QUESTION_REMINDER}`;
    }

    const insightCur = getHexDomainInsight(hexCur, domain);
    const omenOutlook = getOmenOutlookText(hexRes?.omen);

    return `🕊️ Tâm niệm / Câu hỏi: "${cleanedQuestion}"
• Thất Tinh Bắc Đẩu: Hiện tại: ${cur?.name} ➔ Lá Sách Lược: ${adv?.name} ➔ Kết quả: ${res?.name} ${omenRes}(${res?.sub}).
• Chiêm đoán theo ${domainLabel}:
  - Thực trạng bản thân (${cur?.name}): ${insightCur || cur?.desc}
  - Điểm mù cần khắc phục: ${blind?.name || "Chớ chủ quan nóng vội"}
• Dự đoán & Sách lược: Về tâm niệm "${cleanedQuestion}": Chìa khóa hóa giải và bứt phá nằm ở Lá Gợi Ý ${adv?.name}. Nếu hành động chuẩn xác theo minh triết "${hexAdv?.advice || adv?.sub}" thì kết quả ${res?.name} sẽ: ${omenOutlook}
• Phương châm hành động: Hành động theo minh triết ${adv?.name} để đón cát tránh hung, đạt được kết quả như ý.`;
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

    if (isQuestionEmpty) {
      return `Tâm điểm: ${s0?.name}. Lực tác động: ${s1?.name} (${card2Effect}). Dự đoán kết quả: ${s8?.name} (${s8?.sub}). Chỉ dẫn then chốt: ${s9?.name} (${s9?.sub}).${EMPTY_QUESTION_REMINDER}`;
    }

    const insightS8 = getHexDomainInsight(hexS8, domain);
    const omenOutlook = getOmenOutlookText(hexS8?.omen);

    return `🕊️ Tâm niệm / Câu hỏi: "${cleanedQuestion}"
• Cục diện Thập Tinh: Tâm điểm: ${s0?.name} | Lực tác động: ${s1?.name} (${card2Effect}) ➔ Kết quả: ${s8?.name} ${omenS8}(${s8?.sub}) | Chỉ dẫn: ${s9?.name}.
• Chiêm đoán theo ${domainLabel}: Sự việc xoay quanh tâm điểm ${s0?.name}, chịu sức ép/trợ lực từ ${s1?.name}. Đích đến sau cùng quy tụ tại ${s8?.name} (${insightS8 || s8?.desc}).
• Dự đoán viễn cảnh: Đối với vấn đề "${cleanedQuestion}": ${omenOutlook}
• Chỉ dẫn then chốt: ${hexS9?.advice || s9?.desc || "Thấu suốt bản chất biến dịch, hành xử cẩn trọng vững vàng."}`;
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
  userAnswer?: string
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
    lines.push(`Xin hãy phân tích trải bài Trận Pháp Thất Tinh theo quan hệ nhân quả tương sinh tương khắc giữa 7 vị trí (sử dụng đầy đủ dữ liệu Thoán Từ, Đại Tượng, Hào Từ, Ngũ Hành, Thời vận${includeFullBakhKhoa ? ", Cửu Nhị Luận Giải và Chiêm đoán 4 phương diện" : ""}):`);
    lines.push(`1. Nền tảng quá khứ (Lá 1) và thực trạng tâm thế bản thân hiện tại (Lá 2).`);
    lines.push(`2. Chiều hướng diễn biến sắp tới (Lá 3) và tác động từ môi trường bên ngoài (Lá 6).`);
    lines.push(`3. Nhận diện điểm mù / thiếu sót cốt lõi của bản thân (Lá 7) để khắc phục.`);
    lines.push(`4. Triển khai phương châm hành động mấu chốt theo Lá Bài Gợi Ý (Lá 4) nhằm đạt được thành tựu kết quả viên mãn (Lá 5).`);
    if (cleanedQuestion) {
      lines.push(`5. Đúc kết lời khuyên và câu trả lời cụ thể, sáng rõ cho câu hỏi tâm niệm trên.`);
    }
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
    lines.push(`Xin hãy phân tích trải bài Trận Pháp Thập Tinh một cách sâu sắc và toàn diện (sử dụng đầy đủ dữ liệu Thoán Từ, Đại Tượng, Hào Từ, Ngũ Hành, Thời vận${includeFullBakhKhoa ? ", Cửu Nhị Luận Giải và Chiêm đoán 4 phương diện" : ""}):`);
    lines.push(`1. Phân tích cốt lõi tâm điểm: Tình huống hiện tại (Lá 1) và lực tác động trực diện của Lá 2 (${isCard2ReversedState ? "TRỞ NGẠI: thử thách, chướng ngại vật cần vượt qua" : "HỖ TRỢ: trợ lực thuận lợi, yếu tố tương sinh thúc đẩy"}).`);
    lines.push(`2. Mối liên hệ đa chiều: Yếu tố bên ngoài (Lá 3), Góc khuất chưa biết (Lá 4), Nguồn gốc trước đây (Lá 5), Tương lai tiếp theo (Lá 6).`);
    lines.push(`3. Đại cục vận trình: Vận hạn năm nay (Lá 7), Góc nhìn xã hội / người ngoài (Lá 8) và Kết quả cuối cùng (Lá 9).`);
    lines.push(`4. Đúc kết minh triết từ Lá Bài Khuyên Bảo (Lá 10) để đưa ra chiến lược hành động tối ưu nhất.`);
    if (cleanedQuestion) {
      lines.push(`5. Đưa ra câu trả lời dứt khoát và kết luận sáng suốt nhất cho câu hỏi/tâm niệm của đương số.`);
    }
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

  const getSpreadName = (m: SpreadMode) => {
    switch (m) {
      case "1_single": return "1 Lá (Đơn Quẻ Chí Tôn)";
      case "1_to_2": return "2 Lá (Âm Dương Đối Đãi)";
      case "1_to_3": return "3 Lá (Tam Tài: Quá Khứ - Hiện Tại - Tương Lai)";
      case "3_to_5": return "5 Lá (Ngũ Hành Tương Sinh Tương Khắc)";
      case "that_tinh": return "Trận Pháp Thất Tinh (7 Lá Chu Dịch Bắc Đẩu)";
      case "thap_tinh": return "Trận Pháp Thập Tinh (10 Lá Celtic Cross Dịch Lý)";
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
  lines.push(`Xin hãy phân tích trải bài Kinh Dịch trên theo đúng thứ tự từ trái sang phải (dựa trên đầy đủ dữ liệu quẻ tượng, Thoán Từ, Đại Tượng, Hào Từ, Ngũ hành${includeFullBakhKhoa ? ", Cửu Nhị Luận Giải và Chiêm đoán 4 phương diện" : ""}):`);
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

export const LandingPage: React.FC<LandingPageProps> = ({
  currentUser,
  onEnterApp,
  onOpenAuthModal,
  onLogout,
  onOpenDonateModal,
}) => {
  /* Spread mode state (random initial mode from 1, 1->2, 1->3, 3->5) */
  const [mode, setMode] = useState<SpreadMode>(() => SPREAD_MODES[Math.floor(Math.random() * SPREAD_MODES.length)]);
  const [cards, setCards] = useState<DynamicCardItem[]>(() => drawCardsForMode(mode));

  /* Trạng thái chiều của Lá thứ 2 trong Thập Tinh Trận: false = Xuôi (Hỗ Trợ), true = Ngược (Trở Ngại) - tỷ lệ xuất hiện 50% */
  const [isCard2Reversed, setIsCard2Reversed] = useState<boolean>(() => Math.random() < 0.5);

  /* Trạng thái đắc pháp nghi thức: false = nhấn nhanh (trích chuẩn như cũ), true = nhấn đủ Kính Thiên - Kính Địa - Kính Nhân (trích 100% bách khoa) */
  const [isRitualCompleted, setIsRitualCompleted] = useState<boolean>(false);

  /* Trạng thái giữ nguyên các lá bài hiện tại (khóa quẻ không bị rút lại khi thực hiện Tam Kính) */
  const [isKeepCards, setIsKeepCards] = useState<boolean>(true);

  const handleToggleCard2Reversed = useCallback(() => {
    setIsCard2Reversed((prev) => !prev);
  }, []);

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

  const handleRefreshPredictionFromCards = useCallback(() => {
    const pred = generateHexagramPrediction(cards, mode, isCard2Reversed, userIntentQuestion);
    handleHexagramPredictionChange(pred);
    if (userIntentQuestion && userIntentQuestion.trim()) {
      setCopiedToast("✨ Đã tham khảo tâm niệm & điền gợi ý dự đoán từ quẻ!");
    } else {
      setCopiedToast("💡 Đã điền dự đoán từ quẻ. Nhập tâm niệm ở trên để dự đoán sát việc hơn!");
    }
    setTimeout(() => setCopiedToast(null), 3000);
  }, [cards, mode, isCard2Reversed, userIntentQuestion, handleHexagramPredictionChange]);



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
    customPrediction?: string
  ) => {
    if (!Array.isArray(targetCards) || targetCards.length === 0) return;
    const spreadTitle = SPREAD_MODE_NAMES[targetMode] || "Trận Pháp Kinh Dịch";
    const item = addTempSpreadItem({
      mode: targetMode,
      spreadTitle,
      cards: targetCards,
      isCard2Reversed: targetMode === "thap_tinh" ? targetReversed : undefined,
      question: typeof customQuestion === "string" ? customQuestion : userIntentQuestion,
      hexagramPrediction: typeof customPrediction === "string" ? customPrediction : hexagramPrediction,
      isRitualCompleted: targetRitual,
    });
    if (item) {
      currentTempSpreadIdRef.current = item.id;
      setTempSpreads(getTodayTempSpreads());
    }
  }, [userIntentQuestion, hexagramPrediction]);

  /* Tự động lưu quẻ đầu tiên mở trong ngày khi vào ứng dụng */
  const initialTempRecordedRef = useRef<boolean>(false);
  useEffect(() => {
    if (!initialTempRecordedRef.current && cards.length > 0) {
      initialTempRecordedRef.current = true;
      recordDrawnSpreadToTemp(mode, cards, isCard2Reversed, isRitualCompleted, userIntentQuestion, hexagramPrediction);
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
  }, [mode, cards, isCard2Reversed, isRitualCompleted, userIntentQuestion, hexagramPrediction, userCustomAnswer, handleQuestionChange, handleHexagramPredictionChange, handleCustomAnswerChange, reloadSavedSpreads, reloadTempSpreads]);

  const handleLoadSavedSpread = useCallback((item: SavedSpreadItem) => {
    if (item.mode && SPREAD_MODES.includes(item.mode as SpreadMode)) {
      setMode(item.mode as SpreadMode);
    }
    if (Array.isArray(item.cards) && item.cards.length > 0) {
      const loadedCards =
        item.mode === "thap_la" &&
        item.cards.length >= 2 &&
        item.cards[0]?.hexNumber !== undefined &&
        item.cards[0]?.hexNumber === item.cards[1]?.hexNumber
          ? item.cards.slice(0, 2)
          : item.cards;
      setCards(loadedCards);
    }
    if (typeof item.isCard2Reversed === "boolean") {
      setIsCard2Reversed(item.isCard2Reversed);
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
  }, [handleQuestionChange, handleHexagramPredictionChange, handleCustomAnswerChange]);

  const [showPhoneVideoMode, setShowPhoneVideoMode] = useState<boolean>(true);
  const getTodayDragonDateKey = useCallback(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }, []);
  const [dragonWakeState, setDragonWakeState] = useState<"sleeping" | "waking" | "awake">(() => {
    if (typeof window !== "undefined") {
      try {
        const now = new Date();
        const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
        if (localStorage.getItem("cuunhi_dragon_awake_date_v1") === todayKey) {
          return "awake";
        }
      } catch {}
    }
    return "sleeping";
  });
  const isDragonSleeping = dragonWakeState === "sleeping";
  const [isDragonUnlocked, setIsDragonUnlocked] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        const now = new Date();
        const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
        if (localStorage.getItem("cuunhi_dragon_awake_date_v1") === todayKey) {
          return true;
        }
      } catch {}
    }
    return false;
  });
  const isDragonLocked = !isDragonUnlocked;
  const dragonUnlockTimerRef = useRef<number | null>(null);
  const [dragonIdleAct, setDragonIdleAct] = useState<0 | 1 | 2 | 3 | 4 | 5 | 6 | 7>(0);
  const [dragonAutoFullAct, setDragonAutoFullAct] = useState<6 | 7>(6);
  const [isPlayingCopyFullClips, setIsPlayingCopyFullClips] = useState<boolean>(false);
  const [isDragonAutoCycle, setIsDragonAutoCycle] = useState<boolean>(false);
  const [isDragonSendingFinale, setIsDragonSendingFinale] = useState<boolean>(false);
  const dragonVideoRef = useRef<HTMLVideoElement | null>(null);

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
      item.userAnswer
    );
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedToast(`📋 Đã chép quẻ "${item.spreadTitle}" (kèm câu hỏi & đáp án) cho AI!`);
      setTimeout(() => setCopiedToast(null), 3000);
    }
  }, [triggerDragonFullAnimations]);

  const handleLoadTempSpread = useCallback((item: TempSpreadItem) => {
    if (item.mode && SPREAD_MODES.includes(item.mode as SpreadMode)) {
      setMode(item.mode as SpreadMode);
    }
    if (Array.isArray(item.cards) && item.cards.length > 0) {
      const loadedCards =
        item.mode === "thap_la" &&
        item.cards.length >= 2 &&
        item.cards[0]?.hexNumber !== undefined &&
        item.cards[0]?.hexNumber === item.cards[1]?.hexNumber
          ? item.cards.slice(0, 2)
          : item.cards;
      setCards(loadedCards);
    }
    if (typeof item.isCard2Reversed === "boolean") {
      setIsCard2Reversed(item.isCard2Reversed);
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
  }, [handleQuestionChange, handleHexagramPredictionChange, handleCustomAnswerChange]);

  const handleSaveTempSpreadPermanently = useCallback((item: TempSpreadItem) => {
    saveSpreadItem({
      mode: item.mode,
      spreadTitle: item.spreadTitle,
      cards: item.cards,
      isCard2Reversed: item.isCard2Reversed,
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
      item.userAnswer
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
      const midScroll = (170 + Math.max(220, s1 - 260)) / 2;
      const isHeroDominant = scrollY < midScroll;

      if (isHeroDominant) {
        tgtOpacity = heroOpacity;
        tgtX = heroStageX;
        tgtY = curHeroY;
        tgtG = 0;
        tgtF = 0; // Dáng quạt bài gọn gàng ở Hero
        tgtHero = 1;
      } else {
        tgtOpacity = spreadOpacity;
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
      } else if (cardCount === 3 || mode === "1_to_3") {
        // ── CHẾ ĐỘ: 3 LÁ (TAM TÀI) ──
        applySlotTransform(
          slots[0],
          getFanCardTransform(0, 3, w < 640, factor),
          { x: -340 * factor, y: 3, rot: -4.5, scale: 1.02, zIndex: 10 },
          f, heroF, false
        );
        applySlotTransform(
          slots[1],
          getFanCardTransform(1, 3, w < 640, factor),
          { x: 0, y: 0, rot: 0, scale: 1.08, zIndex: 14 },
          f, heroF, true
        );
        applySlotTransform(
          slots[2],
          getFanCardTransform(2, 3, w < 640, factor),
          { x: 340 * factor, y: 3, rot: 4.5, scale: 1.02, zIndex: 10 },
          f, heroF, false
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
  }, [mode, cards, isCard2Reversed]);

  useEffect(() => {
    if (requestTickRef.current) {
      requestTickRef.current();
    }
  }, [isCard2Reversed]);

  /* ── Switch Mode Handler ── */
  const handleSwitchMode = (newMode: SpreadMode, isRitual: boolean = false) => {
    if (isKeepCards && newMode === mode) {
      setIsRitualCompleted(isRitual);
      return;
    }
    setIsRitualCompleted(isRitual);
    setMode(newMode);
    let rev: boolean | undefined = undefined;
    if (newMode === "thap_tinh") {
      rev = Math.random() < 0.5;
      setIsCard2Reversed(rev);
    }
    const newCards = drawCardsForMode(newMode);
    setCards(newCards);
    recordDrawnSpreadToTemp(newMode, newCards, rev, isRitual);
    setTimeout(() => {
      requestTickRef.current();
    }, 50);
  };

  /* ── Shuffle Cards (Rút bài ngẫu nhiên mới từ 384 hào & 64 quẻ) ── */
  const handleShuffleCards = useCallback((isRitual: boolean = false) => {
    setIsRitualCompleted(isRitual);
    let rev: boolean | undefined = isCard2Reversed;
    if (mode === "thap_tinh") {
      rev = Math.random() < 0.5;
      setIsCard2Reversed(rev);
    }
    const newCards = drawCardsForMode(mode);
    setCards(newCards);
    recordDrawnSpreadToTemp(mode, newCards, rev, isRitual);
    setTimeout(() => {
      requestTickRef.current();
    }, 50);
  }, [mode, isCard2Reversed, recordDrawnSpreadToTemp]);

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
    const text = await formatSpreadForAI(cards, mode, isCard2Reversed, isRitualCompleted, userIntentQuestion, hexagramPrediction, userCustomAnswer);
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
  }, [isDragonLocked, cards, mode, isCard2Reversed, isRitualCompleted, userIntentQuestion, userCustomAnswer, triggerDragonFullAnimations]);

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
    const text = `=== THÔNG TIN 100% BÁCH KHOA TOÀN THƯ (ĐẮC PHÁP KÍNH THIÊN • ĐỊA • NHÂN) LÁ BÀI KINH DỊCH ===
${questionHeader}${cardInfoLines.join("\n")}

========================================
[YÊU CẦU LUẬN GIẢI CHO AI]:
${questionInstruction}Xin hãy phân tích chi tiết và sâu sắc lá bài Kinh Dịch trên:
1. Ý nghĩa biểu tượng quẻ tượng, tên quẻ/hào, cấu tạo Thượng Hạ quái và Ngũ hành khí số.
2. Hoàn cảnh thực tế, thuận lợi tiềm tàng và thách thức mà quẻ/hào này đang phản ánh (kết hợp dữ liệu Tổng Quan Hào Vị, Cửu Nhị Luận Giải, Chiêm Đoán Giải Quẻ 4 phương diện và Câu Hỏi Thường Gặp FAQ).
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

        // Tính khung bao hình học có tính góc xoay và nhãn phía trên lá bài (chỉ Trận 7 và Trận 10 có nhãn trên)
        const rad = Math.abs((rotDeg * Math.PI) / 180);
        const halfW = ((unscaledW * Math.cos(rad) + unscaledH * Math.sin(rad)) * sc) / 2;
        const halfH = ((unscaledW * Math.sin(rad) + unscaledH * Math.cos(rad)) * sc) / 2;
        const hasTopBadge = (mode === "that_tinh" || mode === "thap_tinh") && Boolean(card?.positionLabel);
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

            if (mode === "thap_tinh" && item.idx === 1 && isCard2Reversed) {
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

          // Lớp 2: Vẽ nhãn vị trí trận pháp phía trên từng lá bài (Chỉ áp dụng cho Trận 7 lá và Trận 10 lá)
          if (mode === "that_tinh" || mode === "thap_tinh") {
            for (const item of sortedMetas) {
              if (!item.card.positionLabel) continue;

              let topText = item.card.positionLabel;
              let pillBg = "rgba(24, 24, 27, 0.92)";
              let pillBorder = "rgba(120, 113, 108, 0.65)";
              let pillColor = "#F5F5F4";

              if (mode === "thap_tinh" && item.idx === 1) {
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

          dataUrl = await toPng(container, {
            width: cropW,
            height: cropH,
            canvasWidth: Math.round(cropW * exportRatio),
            canvasHeight: Math.round(cropH * exportRatio),
            pixelRatio: exportRatio,
            backgroundColor: "#FFFFFF",
            cacheBust: false,
            skipFonts: true,
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
        mode === "that_tinh"
          ? "that-tinh-7-la"
          : mode === "thap_tinh"
          ? "thap-tinh-10-la"
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
  }, [cards, mode, isCard2Reversed, isCapturingSnapshot]);

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
    isPlayingCopyFullClips ||
    isDragonSendingFinale ||
    isCapturingSnapshot ||
    isRecordingVoiceQ ||
    isTranscribingVoiceQ;

  const activeDragonAct: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 =
    dragonWakeState === "sleeping"
      ? 0
      : dragonWakeState === "waking"
      ? 8
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
    };
  }, []);

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
  const cardsSignature = cards.map((c) => `${c.id}:${c.hexNumber}:${c.yaoNumber || 0}`).join("|") + `|${mode}|${isCard2Reversed}`;
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
        // Đang chạy nội bộ (localhost hoặc LAN Wi-Fi): ưu tiên đường dẫn tương đối nếu cổng 5168/5173/8000
        candidates.push(cleanEndpoint);
        if (isLan && port !== "8000") {
          candidates.push(`${protocol}//${hostname}:8000${cleanEndpoint}`);
        }
        candidates.push(`http://localhost:8000${cleanEndpoint}`);
        candidates.push(`http://127.0.0.1:8000${cleanEndpoint}`);
      } else {
        // Đang mở trên tên miền công khai (ví dụ ichingtarot.com):
        // Gọi thẳng xuống máy chủ Engine Luận Trực Tiếp cục bộ (localhost:8000) trước để tránh SPA fallback trả về HTML hoặc treo port 8000 trên tên miền
        candidates.push(`http://localhost:8000${cleanEndpoint}`);
        candidates.push(`http://127.0.0.1:8000${cleanEndpoint}`);
        candidates.push(cleanEndpoint);
      }
    } else {
      candidates.push(cleanEndpoint);
      candidates.push(`http://localhost:8000${cleanEndpoint}`);
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
    throw lastError || new Error(`Không thể kết nối đến máy chủ Luận Trực Tiếp & Tạo Video (port 8000).`);
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
        mode === "thap_la" && cards.length > 2
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

          if (decodedBuffer && decodedBuffer.duration > 1) {
            finalDuration = Math.max(12, decodedBuffer.duration + 3.0);
          } else {
            finalDuration = Math.max(16, orderedCards.length * 6.5);
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
        userCustomAnswer
      );
      setDirectHomeRawAIText(aiText);
      await copyToClipboard(aiText);
      setCopiedAI(true);
      setTimeout(() => setCopiedAI(false), 2500);

      // 3. Gửi trực tiếp sang Engine Luận Trực Tiếp & Render Video 9:16 chạy ngầm
      setDirectHomePercent(32);
      setDirectHomeStage("Đã kích hoạt chạy ngầm! Đại Sư Gemini đang luận giải & thu âm...");
      setDirectHomeMessage("Đang chạy ngầm trên máy chủ: Bạn có thể tự do lướt web hoặc chuyển tab, xong sẽ tự báo chuông!");

      const effectiveQuestion =
        userIntentQuestion.trim() ||
        `Luận giải trải bài ${cards.map((c) => c.name).join(" • ")} trên trang chủ`;

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
      if (newMode === "thap_tinh") {
        rev = Math.random() < 0.5;
        setIsCard2Reversed(rev);
      }
      const newCards = drawCardsForMode(newMode);
      setCards(newCards);
      recordDrawnSpreadToTemp(newMode, newCards, rev, isRitual);
      setTimeout(() => {
        if (requestTickRef.current) requestTickRef.current();
      }, 50);
      const sec = document.getElementById("destiny-cards");
      if (sec) {
        sec.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    [isKeepCards, mode, recordDrawnSpreadToTemp]
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
    if (randomMode === "thap_tinh") {
      rev = Math.random() < 0.5;
      setIsCard2Reversed(rev);
    }
    const newDrawnCards = drawCardsForMode(randomMode);
    setCards(newDrawnCards);
    recordDrawnSpreadToTemp(randomMode, newDrawnCards, rev, isRitual);
    setTimeout(() => {
      if (requestTickRef.current) requestTickRef.current();
    }, 50);

    const sec = document.getElementById("huong-an-khoi-niem") || document.getElementById("user-intent-question-input");
    if (sec) {
      sec.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    const spreadName = SPREAD_MODE_NAMES[randomMode] || "Trận Pháp";
    if (isRitual) {
      setCopiedToast(`✨ Đắc Pháp Tam Kính: Đã bốc ngẫu nhiên ${spreadName} (Mở khóa 100% Bách Khoa cho AI)!`);
    } else {
      setCopiedToast(`🔮 Đã bốc ngẫu nhiên: ${spreadName}`);
    }
    setTimeout(() => setCopiedToast(null), 3500);
  }, [isKeepCards, mode, recordDrawnSpreadToTemp]);

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

  return (
    <div className="font-serif min-h-full flex flex-col bg-white text-zinc-900" style={{ fontFamily: "'IM Fell English','Noto Serif TC',serif" }}>
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

                {/* Hàng 2: Nút Donate Ủng Hộ Dự Án ngay dưới chỗ nút bốc quẻ */}
                <div className="mt-3 w-full max-w-xl flex items-center justify-start">
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

              {/* Hàng 2: Nút Donate Ủng Hộ Dự Án ngay dưới nút bốc quẻ */}
              <button
                type="button"
                onClick={() => {
                  if (onOpenDonateModal) onOpenDonateModal();
                  else window.dispatchEvent(new CustomEvent("open-donate-modal"));
                }}
                className="flex items-center justify-center gap-1.5 w-full rounded-2xl px-3 py-2.5 text-xs font-semibold text-amber-300 hover:text-amber-200 bg-amber-950/60 hover:bg-amber-900/80 border border-amber-600/60 hover:border-amber-400 transition cursor-pointer shadow-md active:scale-[0.98]"
                title="Quét mã QR donate ủng hộ dự án Cửu Nhị"
              >
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-500/30" />
                <span>Donate Ủng Hộ Dự Án</span>
                <QrCode className="w-3.5 h-3.5 text-amber-400" />
              </button>
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
                    : mode === "thap_tinh"
                    ? "Trận Pháp Thập Tinh Celtic Cross (10 Lá Chu Dịch)"
                    : mode === "thap_la"
                    ? "Tháp La Kinh Dịch (Bản Quái • Hào Động • Biến Quái)"
                    : mode === "1_single"
                    ? "Trận Pháp Đơn Quẻ (1 Lá - Nhất Tiễn Định Tâm)"
                    : mode === "1_to_2"
                    ? "Trận Pháp Âm Dương (2 Lá - Thể Dụng Tương Tác)"
                    : mode === "1_to_3"
                    ? "Trận Pháp Tam Tài (3 Lá - Thiên Địa Nhân)"
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
                  : mode === "thap_tinh"
                  ? "Trận Pháp Thập Tinh"
                  : mode === "thap_la"
                  ? "Tháp La Kinh Dịch"
                  : mode === "1_single"
                  ? "Trận Pháp Đơn Quẻ"
                  : mode === "1_to_2"
                  ? "Trận Pháp Âm Dương"
                  : mode === "1_to_3"
                  ? "Trận Pháp Tam Tài"
                  : mode === "3_to_5"
                  ? "Trận Pháp Ngũ Hành"
                  : "Bộ Bài I Ching Tarot Phong Cách Đông Phương"}
              </h2>
              <p className="mx-auto max-w-2xl text-base leading-relaxed text-[#5C5346] sm:text-lg font-serif">
                {mode === "that_tinh" ? (
                  <>
                    Khảo sát toàn diện 7 phương diện: Quá khứ, Bản thân hiện tại, Diễn biến, Gợi ý chiến lược, Kết quả, Ngoại cảnh và Điểm mù bản thân.
                  </>
                ) : mode === "thap_tinh" ? (
                  <>
                    Tâm điểm thập tự kết hợp 10 vị thế thời vận.
                    <span className="font-semibold text-amber-800"> Lá thứ 2: {isCard2Reversed ? "Chiều Ngược (Trở Ngại)" : "Chiều Xuôi (Hỗ Trợ)"}</span> (bấm vào lá hoặc nút để đổi chiều).
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
          <div className={`relative z-10 flex items-center justify-center pt-4 pb-4 ${mode === "that_tinh" || mode === "thap_tinh" || mode === "thap_la" ? "min-h-[680px] sm:min-h-[760px] md:min-h-[820px]" : "min-h-[540px] sm:min-h-[580px]"}`}>
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
              <span>Nhấp vào từng lá bài để soi Mặt Trước &amp; Mặt Sau, tra cứu Hào Từ &amp; Lời Giải AI</span>
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
            mode === "that_tinh" || mode === "thap_tinh" || mode === "thap_la"
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
                setSelectedCard(card);
              }}
            >
              {/* Nhãn vị trí trận pháp phía trên lá bài: Chỉ hiển thị cho Trận 7 lá (that_tinh) và Trận 10 lá (thap_tinh) */}
              {(mode === "that_tinh" || mode === "thap_tinh") && card.positionLabel && (
                <div
                  className="absolute -top-7 sm:-top-8 md:-top-9 left-1/2 -translate-x-1/2 whitespace-nowrap text-center z-40 pointer-events-auto select-none"
                >
                  {mode === "thap_tinh" && idx === 1 ? (
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
                  ) : (
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10.5px] sm:text-xs font-serif font-bold bg-zinc-900/90 text-stone-100 border border-stone-600/60 shadow-lg backdrop-blur-sm">
                      {card.positionLabel}
                    </span>
                  )}
                </div>
              )}

              <div
                className={`destiny-card-inner relative w-full h-full rounded-2xl overflow-hidden cursor-pointer bg-zinc-950/90 shadow-2xl transition-transform duration-500 ${
                  mode === "thap_tinh" && idx === 1 && isCard2Reversed ? "rotate-180" : ""
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

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Cột phải (Desktop) / Cột trên (Mobile): Văn bản tính năng, Hương Án Khởi Niệm & Cửu Nhị Command Dock */}
            <div className="order-1 lg:order-2">
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
              <div id="huong-an-khoi-niem" className="mt-6 max-w-xl scroll-mt-24">
                <div
                  className="relative rounded-2xl border border-[#C4963E]/45 p-4 sm:p-5 backdrop-blur-md transition-all duration-300 focus-within:border-[#C4963E] focus-within:shadow-[0_16px_38px_-6px_rgba(196,150,62,0.22),inset_0_0_0_3px_#FDFBF7,inset_0_0_0_4px_rgba(196,150,62,0.32)]"
                  style={{
                    background: "linear-gradient(180deg, rgba(253, 251, 247, 0.96) 0%, rgba(244, 238, 226, 0.94) 100%)",
                    boxShadow:
                      "0 12px 32px -8px rgba(110, 90, 55, 0.12), 0 2px 6px rgba(110, 90, 55, 0.06), inset 0 0 0 3px #FDFBF7, inset 0 0 0 4px rgba(196, 150, 62, 0.18)",
                  }}
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <label
                      htmlFor="user-intent-question-input"
                      className="flex items-center gap-2 text-xs font-serif font-bold uppercase tracking-[0.16em] text-[#6E4E16]"
                    >
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-[#9E2A2B] text-amber-50 text-[10px] font-serif border border-[#D4AF37]/60 shadow-2xs">
                        印
                      </span>
                      <span>Hương Án Khởi Niệm · Câu Hỏi Chiêm Bốc</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleToggleVoiceQuestion}
                        disabled={isTranscribingVoiceQ}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition cursor-pointer border ${
                          isTranscribingVoiceQ
                            ? "bg-amber-100 text-amber-900 border-amber-400 opacity-85 cursor-wait"
                            : isRecordingVoiceQ
                            ? "bg-[#9E2A2B] text-amber-50 border-[#D4AF37] animate-pulse"
                            : "bg-[#FAF3E3] hover:bg-[#EFE4CC] text-[#6E4E16] border-[#C4963E]/45"
                        }`}
                        title="Nhập câu hỏi bằng giọng nói tiếng Việt"
                      >
                        <span>{isTranscribingVoiceQ ? "⏳" : isRecordingVoiceQ ? "🔴" : "🎙️"}</span>
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
                          className="text-[11px] text-[#7D6E57] hover:text-[#9E2A2B] font-semibold transition cursor-pointer flex items-center gap-1"
                          title="Xóa nội dung câu hỏi"
                        >
                          ✕ Xóa
                        </button>
                      ) : (
                        <span className="hidden sm:inline text-[11px] italic text-[#8A7960] font-serif">
                          “Tâm tĩnh tắc linh”
                        </span>
                      )}
                    </div>
                  </div>

                  <textarea
                    id="user-intent-question-input"
                    rows={2}
                    value={userIntentQuestion}
                    onChange={(e) => handleQuestionChange(e.target.value)}
                    placeholder="Tĩnh tâm nhập câu hỏi hoặc sự việc đang trăn trở (VD: Sự nghiệp tháng tới diễn biến ra sao? Có nên ký kết hợp tác này không?...)"
                    className="w-full resize-none rounded-xl bg-[#F6F1E5]/85 focus:bg-[#FFFEFA] border border-[#C4963E]/35 px-3.5 py-2.5 text-xs sm:text-sm text-[#1E1912] placeholder:text-[#8A7960] focus:outline-none focus:border-[#C4963E] focus:ring-2 focus:ring-[#C4963E]/15 transition leading-relaxed font-serif shadow-inner"
                  />

                  <div className="mt-2.5 flex flex-wrap items-center justify-between gap-1.5 text-[11px] text-[#6E5D47]">
                    <span className="flex items-center gap-1.5">
                      <span className="text-[#B8862D] font-bold">✦</span>
                      {userIntentQuestion.trim()
                        ? "Tâm niệm đã được niêm phong vào quẻ bài để gửi cho AI luận giải."
                        : "Nhập câu hỏi để khi 'Chép Toàn Thư AI', AI luận giải đúng trọng tâm của bạn."}
                    </span>
                    {userIntentQuestion.trim() && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-900 bg-emerald-50/90 border border-emerald-500/45 px-2.5 py-0.5 rounded-full">
                        ✓ Đã ghim tâm niệm
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* MODULE 2: CỬU NHỊ COMMAND DOCK (NGỌC GIẢN KÍNH MỜ GIẤY TUYÊN THÀNH HÒA QUYỆN NÚI THỦY MẶC) */}
              <div
                className="mt-4 max-w-xl rounded-2xl border border-[#C4963E]/45 p-4 sm:p-5 backdrop-blur-xl flex flex-col gap-3.5"
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
                  </div>
                </div>

                {/* Nút Đổi Chiều Lá 2 khi đang ở Thập Tinh Trận */}
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

                {/* CỤM 2 & 3: QUẢN TRỊ BÀN QUẺ & NÚT CHÉP TOÀN THƯ AI */}
                <div className="flex flex-col gap-2.5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
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

                  {/* NÚT GỌI CỬU NHỊ TIỂU LONG DẬY */}
                  {isDragonSleeping ? (
                    <div className="relative w-full">
                      <button
                        type="button"
                        id="btn-wake-up-dragon"
                        onClick={handleWakeUpDragon}
                        className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-xs sm:text-sm font-serif font-bold text-[#1C1610] border-2 border-[#FFF8E7] transition cursor-pointer shadow-lg hover:brightness-105 active:scale-[0.99] select-none"
                        style={{
                          background: "linear-gradient(135deg, #FFF3B0 0%, #E5C158 45%, #C4963E 100%)",
                          boxShadow: "0 12px 28px -4px rgba(212, 175, 55, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
                        }}
                      >
                        <span className="tracking-wide">GỌI CỬU NHỊ TIỂU LONG DẬY</span>
                      </button>
                    </div>
                  ) : null}

                  {/* CỤM 3: HERO CTA - CHÉP TOÀN THƯ CHO AI (ĐIỂM NHẤN SƠN MÀI HỔ PHÁCH × VÀNG KIM HOÀNG GIA) */}
                  <div className="relative w-full">
                    <button
                      type="button"
                      id="btn-copy-all-for-ai"
                      disabled={isDragonLocked}
                      onClick={handleCopyCardsForAI}
                      className={`inline-flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-xs sm:text-sm font-serif font-bold transition shadow-md select-none ${
                        isDragonLocked
                          ? "opacity-55 cursor-not-allowed grayscale-[45%] text-[#A89880] border border-[#8A7960]/60"
                          : copiedAI
                          ? "bg-emerald-700 text-white border border-emerald-400 cursor-pointer active:scale-[0.99]"
                          : "text-[#F5E6C4] border border-[#D4AF37]/85 hover:brightness-110 cursor-pointer active:scale-[0.99]"
                      }`}
                      style={
                        copiedAI && !isDragonLocked
                          ? undefined
                          : {
                              background: isDragonLocked
                                ? "linear-gradient(135deg, #3A332C 0%, #26211C 100%)"
                                : "linear-gradient(135deg, #2A2118 0%, #1C1610 55%, #261D14 100%)",
                              boxShadow: "0 10px 24px -4px rgba(28, 22, 16, 0.28), inset 0 1px 0 rgba(212, 175, 55, 0.35)",
                            }
                      }
                      title={
                        isDragonLocked
                          ? "Đang khóa vì Cửu Nhị Tiểu Long còn ngủ/đang thức dậy. Sau khi gọi dậy 5 giây sẽ tự động mở khóa!"
                          : "Sao chép toàn bộ thông tin các lá bài (kèm câu hỏi & đáp án) để gửi cho AI luận giải"
                      }
                    >
                      <span className="text-base text-[#E5C158] shrink-0">
                        {isDragonLocked ? "🔒" : copiedAI ? "✓" : isRitualCompleted ? "✨" : "⚡"}
                      </span>
                      <span>
                        {copiedAI
                          ? "Đã Sao Chép Toàn Bộ Quẻ Cho AI!"
                          : isRitualCompleted
                          ? "Chép Toàn Thư Bách Khoa Cho AI (Đắc Pháp)"
                          : "Chép Toàn Bộ Quẻ Bài & Câu Hỏi Cho AI"}
                      </span>
                      {(userIntentQuestion.trim() || userCustomAnswer.trim()) && !copiedAI && !isDragonLocked && (
                        <span className="text-[10px] font-sans font-bold text-[#1C1610] bg-[#F3E5AB] px-2 py-0.5 rounded-full border border-[#D4AF37]">
                          +Kèm Tâm Niệm
                        </span>
                      )}
                    </button>
                  </div>


                </div>
              </div>

              {/* KHỐI 3: CỤM NÚT VÀO NHẬT KÝ & NGÔN NGỮ / ĐĂNG NHẬP (ĐỒNG BỘ CẶP PHÁP KHÍ LỤA TUYÊN THÀNH 44PX) */}
              <div className="mt-5 max-w-xl flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  id="btn-use-on-web"
                  onClick={() => onEnterApp("yilore")}
                  className="group inline-flex h-11 items-center gap-2.5 px-5 rounded-full text-[#231C14] font-serif text-xs sm:text-sm font-bold cursor-pointer transition-all hover:-translate-y-0.5 active:scale-[0.98]"
                  style={{
                    background: "linear-gradient(180deg, #FDFBF7 0%, #F2EAE0 100%)",
                    border: "1px solid rgba(196, 150, 62, 0.55)",
                    boxShadow: "0 6px 18px rgba(110, 90, 55, 0.10), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
                  }}
                >
                  <span className="w-6 h-6 rounded-full bg-[#1C1610] border border-[#D4AF37]/80 flex items-center justify-center text-[#E5C158] text-xs shadow-2xs">
                    ☯
                  </span>
                  <span>Vào nhật ký chiêm bốc</span>
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#996515] transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>

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

            {/* Cột trái (Desktop) / Cột dưới (Mobile): MẪU 2 — MÀN HÌNH ĐIỆN THOẠI 9:16 TINH GỌN + 3 NÚT TẢI + NÚT XEM KẾT QUẢ LUẬN GIẢI TRỰC TIẾP TỪ TRANG CHỦ */}
            <div className="order-2 lg:order-1 flex flex-col items-center lg:items-center justify-center lg:self-center mt-6 lg:mt-0 lg:pb-1">
              {/* Giữ nguyên neo vật lý ẩn để không ảnh hưởng engine cuộn bài */}
              <div
                ref={featuresAnchorRef}
                id="features-card-anchor"
                className="hidden pointer-events-none"
                aria-hidden="true"
              />

              <div className="w-full max-w-[360px] flex flex-col items-center gap-3">
                {/* KHUNG ĐIỆN THOẠI DỌC 9:16 (MẪU 2 - TINH GỌN ĐIỆN THOẠI) */}
                <div
                  id="direct-home-phone-mockup"
                  className="relative w-[308px] sm:w-[336px] rounded-[42px] p-[9px] transition-all duration-300"
                  style={{
                    background: "linear-gradient(145deg, #3A2C1E 0%, #17120D 50%, #2C2116 100%)",
                    border: "2px solid rgba(212, 175, 55, 0.85)",
                    boxShadow:
                      "0 26px 60px -12px rgba(24, 18, 12, 0.55), 0 0 28px rgba(212, 175, 55, 0.22), inset 0 1px 1px rgba(255, 248, 220, 0.35)",
                  }}
                >
                  {/* Loa thoại / Dynamic Island */}
                  <div className="absolute top-[14px] left-1/2 -translate-x-1/2 z-30 h-4 w-24 rounded-full bg-[#090705] border border-[#D4AF37]/30 flex items-center justify-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2A241D]" />
                    <span className="w-8 h-1 rounded-full bg-[#231D16]" />
                  </div>

                  {/* Màn hình 9:16 bên trong */}
                  <div
                    className="relative w-full aspect-[9/16] rounded-[33px] overflow-hidden flex flex-col justify-between text-[#F5E6C4]"
                    style={{
                      background:
                        "radial-gradient(circle at 50% 22%, rgba(158, 42, 43, 0.28) 0%, rgba(20, 15, 10, 0.96) 65%, #0D0A07 100%)",
                      border: "1px solid rgba(212, 175, 55, 0.32)",
                    }}
                  >
                    {/* Thanh trạng thái trên cùng của điện thoại */}
                    <div className="pt-6 px-3.5 pb-1.5 flex items-center justify-between text-[10px] text-[#E5C158]/90 border-b border-[#D4AF37]/20 bg-black/30 backdrop-blur-xs z-20">
                      <span className="font-mono font-bold">9:41</span>
                      <span className="font-serif font-bold tracking-[0.12em] text-[9px] uppercase text-[#F3E5AB] truncate">
                        ☯ CỬU NHỊ · LUẬN GIẢI TRỰC TIẾP
                      </span>
                      <span className="text-[9px] font-semibold text-emerald-400">● LIVE</span>
                    </div>

                    {/* Nút chuyển đổi giữa Video MP4 thực tế và Hoạt ảnh Tiểu Long */}
                    {directHomeResult?.video_url && !isDragonSendingFinale && (
                      <div className="px-3 pt-1.5 flex justify-end z-20">
                        <button
                          type="button"
                          onClick={() => setShowPhoneVideoMode((v) => !v)}
                          className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#1C1610]/90 text-[#F3E5AB] border border-[#D4AF37]/70 hover:brightness-110 cursor-pointer shadow-xs"
                        >
                          {showPhoneVideoMode ? "🐉 Xem Rồng Nhỏ" : "🎬 Xem Video MP4"}
                        </button>
                      </div>
                    )}

                    {/* NỘI DUNG CHÍNH TRONG MÀN HÌNH 9:16 */}
                    {directHomeResult?.video_url && showPhoneVideoMode && !isDragonSendingFinale ? (
                      <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden">
                        <video
                          key={resolveMediaUrl(directHomeResult.video_url)}
                          src={resolveMediaUrl(directHomeResult.video_url)}
                          controls
                          autoPlay
                          loop
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col justify-between p-2.5 overflow-hidden">
                        <style>{`
                          @keyframes cuunhiArtBob {
                            0%, 100% { transform: scale(1.03) translateY(0px); }
                            50% { transform: scale(1.06) translateY(-3px); }
                          }
                          @keyframes cuunhiFloatGlyph {
                            0% { opacity: 0; transform: translateY(8px) scale(0.7); }
                            35% { opacity: 1; }
                            100% { opacity: 0; transform: translateY(-26px) scale(1.15); }
                          }
                          @keyframes cuunhiLensSweep {
                            0%, 100% { transform: translate(-10px, 0px) scale(0.95); opacity: 0.45; }
                            50% { transform: translate(12px, -3px) scale(1.12); opacity: 0.85; }
                          }
                          @keyframes cuunhiBrushSpark {
                            0%, 100% { transform: translate(-12px, 2px) scale(0.9); opacity: 0.6; }
                            50% { transform: translate(14px, -2px) scale(1.15); opacity: 1; }
                          }
                          @keyframes cuunhiScreenGlow {
                            0%, 100% { opacity: 0.35; transform: scale(0.98); }
                            50% { opacity: 0.85; transform: scale(1.06); }
                          }
                          @keyframes cuunhiPullSendLetter {
                            0% { opacity: 0; transform: translate(-18px, 24px) scale(0.35) rotate(-8deg); }
                            25% { opacity: 1; transform: translate(-6px, 4px) scale(0.92) rotate(-4deg); }
                            55% { opacity: 1; transform: translate(8px, -12px) scale(1.08) rotate(6deg); }
                            82% { opacity: 1; transform: translate(42px, -44px) scale(1.12) rotate(16deg); }
                            100% { opacity: 0; transform: translate(78px, -74px) scale(0.45) rotate(24deg); }
                          }
                        `}</style>

                        {/* 1. SÂN KHẤU HOẠT ẢNH TIỂU LONG CỬU NHỊ */}
                        <div className="flex-1 flex flex-col items-center gap-1.5 min-h-0">
                          <div className="w-full flex-1 flex flex-col rounded-xl overflow-hidden border border-[#D4AF37]/60 bg-gradient-to-b from-[#1E160E] via-[#140F0A] to-[#0D0A07] p-1.5 shadow-inner relative">
                            {/* Khung Video Hoạt Ảnh */}
                            <div className="w-full flex-1 min-h-[214px] rounded-lg overflow-hidden relative border border-[#D4AF37]/45 bg-[#0E0A07] shadow-md">
                              <video
                                ref={dragonVideoRef}
                                key={DRAGON_VIDEO_MAP[activeDragonAct].src}
                                src={DRAGON_VIDEO_MAP[activeDragonAct].src}
                                autoPlay
                                loop={activeDragonAct === 0 || activeDragonAct === 9}
                                muted
                                playsInline
                                onEnded={(e) => {
                                  if (dragonWakeState === "waking") {
                                    setDragonWakeState("awake");
                                    setIsDragonUnlocked(true);
                                  } else if (isDirectHomeRunning || isCapturingSnapshot) {
                                    setDragonAutoFullAct((prev) => (prev === 6 ? 7 : 6));
                                  } else if (isPlayingCopyFullClips) {
                                    if (dragonAutoFullAct === 6) {
                                      setDragonAutoFullAct(7);
                                    } else {
                                      setIsPlayingCopyFullClips(false);
                                      setDragonAutoFullAct(6);
                                    }
                                  } else {
                                    const v = e.currentTarget;
                                    v.currentTime = 0;
                                    v.play().catch(() => {});
                                  }
                                }}
                                className="w-full h-full object-cover object-center"
                              />
                            </div>
                          </div>

                          {/* Tên Quẻ & Trạng thái đồng bộ từ Trang Chủ */}
                          <div className="text-center px-1">
                            <div className="text-[10.5px] font-serif font-bold text-[#F3E5AB] tracking-wide line-clamp-1">
                              {directHomeResult?.hexagram_title ||
                                cards.map((c) => c.name).slice(0, 3).join(" · ")}
                            </div>
                            <div className="text-[8.5px] text-[#C4A66A] line-clamp-1">
                              {DRAGON_VIDEO_MAP[activeDragonAct].sub}
                            </div>
                          </div>
                        </div>

                        {/* 2. Phần giữa: Hộp Phụ Đề Vàng Kim (Luận Giải Trực Tiếp) */}
                        <div
                          className="my-1 rounded-xl p-2 border border-[#D4AF37]/50 bg-[#1B140E]/90 shadow-md flex flex-col gap-0.5"
                          style={{
                            boxShadow: "inset 0 0 18px rgba(212, 175, 55, 0.10)",
                          }}
                        >
                          <div className="flex items-center justify-between text-[8.5px] font-bold uppercase tracking-wider text-[#E5C158]">
                            <span>✦ Lời Bàn Cửu Nhị Đại Sư</span>
                            <span>{isDirectHomeRunning ? `${directHomePercent}%` : "9:16 HD"}</span>
                          </div>
                          <p className="text-[10px] font-serif leading-relaxed text-[#FFF8E7] line-clamp-3 italic">
                            {isDirectHomeRunning || isDragonSendingFinale
                              ? `“${directHomeMessage}”`
                              : directHomeResult?.video_script
                              ? `“${directHomeResult.video_script.slice(0, 160)}...”`
                              : `“${DRAGON_VIDEO_MAP[activeDragonAct].quote}”`}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Thanh Home Bar dưới đáy điện thoại */}
                    <div className="py-1.5 flex justify-center bg-black/40">
                      <div className="w-24 h-1 rounded-full bg-[#D4AF37]/50" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
                      mode === "thap_tinh" && selectedCard.id === cards[1]?.id && isCard2Reversed ? "rotate-180" : ""
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
                    mode === "thap_tinh" && selectedCard.id === cards[1]?.id && isCard2Reversed ? "rotate-180" : ""
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
                <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold font-serif bg-[#C4963E]/20 text-[#F3E5AB] border border-[#C4963E]/55 tracking-wider">
                  Vị trí: {selectedCard.positionLabel}
                </span>
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
              </div>
            )}

            <div className="relative z-10 mb-2">
              <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#C4963E]/20 text-[#E5C158] border border-[#C4963E]/40 uppercase tracking-wider">
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
                  const targetUrl = getHexDetailUrl(selectedCard.hexNumber, selectedCard.yaoNumber);
                  window.open(targetUrl, "_blank", "noopener,noreferrer");
                }}
                className="flex-1 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#E5C158] via-[#D4AF37] to-[#B8862D] text-stone-950 font-serif font-bold text-xs hover:brightness-110 transition shadow-lg cursor-pointer flex items-center justify-center gap-2"
                title="Mở trang luận giải chi tiết của quẻ này trong Bách Khoa Kinh Dịch"
              >
                <span>📖</span>
                <span>
                  {selectedCard.type === "yao" && selectedCard.yaoNumber
                    ? `Luận Giải Hào ${selectedCard.yaoNumber} Quẻ ${selectedCard.name} ↗`
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
        onGeneratePrediction={(q) => generateHexagramPrediction(cards, mode, isCard2Reversed, q)}
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
