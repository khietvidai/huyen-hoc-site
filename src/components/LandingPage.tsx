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
import { Camera } from "lucide-react";
import { toPng } from "html-to-image";
import { downloadDataUrlAsPng } from "../utils/captureHelper";
import { ExportImageModal } from "./ExportImageModal";
import { BrandMark } from "./BrandMark";
import { NavTab } from "./Header";
import { HEXAGRAMS } from "../data/hexagrams";
import { AppUser } from "../services/authService";

export interface LandingPageProps {
  currentUser?: AppUser | null;
  onEnterApp: (tab?: NavTab, method?: string) => void;
  onOpenAuthModal?: (mode?: "login" | "register" | "upgrade") => void;
  onLogout?: () => void;
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
    // 1. Quẻ Chủ (Bản Quái): Rút ngẫu nhiên từ 64 quẻ
    const priHex = HEXAGRAMS[Math.floor(Math.random() * HEXAGRAMS.length)];

    // 2. Quẻ Biến (Biến Quái): Rút ngẫu nhiên từ cỗ bài 64 quẻ độc lập
    let transHex = HEXAGRAMS[Math.floor(Math.random() * HEXAGRAMS.length)];
    let retries = 0;
    while (transHex.number === priHex.number && retries < 15) {
      transHex = HEXAGRAMS[Math.floor(Math.random() * HEXAGRAMS.length)];
      retries++;
    }

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
      name: `Quẻ Biến: ${transHex.name}`,
      sub: `Biến Quái • Định hướng tương lai (#${transHex.number})`,
      desc: `【Biến Quái: Định Hướng Tương Lai】Quái từ: "${transHex.judgment}" | Đại Tượng: "${transHex.image}" — ${transHex.overview || transHex.advice}`,
      img: `/assets/oss/${transHex.number}/${transHex.number}a.webp`,
      backImg: `/assets/oss/${transHex.number}/${transHex.number}b.webp`,
      positionLabel: "Quẻ Biến (Biến Quái)",
      positionDesc: "Định hướng xu thế phát triển và kết quả chuyển dịch",
    };

    // 3. Các lá hào từ (ở 384 lá bài hào từ) thay đổi để thành quẻ biến theo thứ tự từ thấp Sơ tới hào Lục
    const priLines = Array.isArray(priHex?.lines) && priHex.lines.length === 6 ? priHex.lines : [1, 1, 1, 1, 1, 1];
    const transLines = Array.isArray(transHex?.lines) && transHex.lines.length === 6 ? transHex.lines : [1, 1, 1, 1, 1, 1];
    const changingYaoCards: DynamicCardItem[] = [];
    for (let i = 0; i < 6; i++) {
      const lineNum = i + 1;
      if (priLines[i] !== transLines[i]) {
        const isYangToYin = priLines[i] === 1;
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
        });
      }
    }

    if (changingYaoCards.length === 0) {
      const defaultLine = 1;
      const lineMeaning = priHex.lineMeanings?.find((m) => m.line === defaultLine);
      changingYaoCards.push({
        id: `thapla-yao-${priHex.number}-${defaultLine}`,
        type: "yao",
        hexNumber: priHex.number,
        yaoNumber: defaultLine,
        symbol: priHex.symbol,
        hanzi: lineMeaning?.name || "Hào Sơ",
        name: `${priHex.name} · ${lineMeaning?.name || "Hào Sơ"}`,
        sub: "Quẻ Tĩnh • Kiên định không biến",
        desc: `${lineMeaning?.text || ""} — ${lineMeaning?.meaning || ""}`,
        img: `/assets/oss/${priHex.number}/${priHex.number}-${defaultLine}a.webp`,
        backImg: `/assets/oss/${priHex.number}/${priHex.number}-${defaultLine}b.webp`,
        positionLabel: "Hào Tĩnh: Hào 1",
        positionDesc: "Điểm khởi đầu vững vàng, thuận theo đạo tĩnh",
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

/* ─── Helper: Định dạng thông tin các lá bài để dán cho AI phân tích ─── */
/* Thứ tự: Trái trước phải sau. Nếu đắc pháp Kính Thiên, Địa, Nhân -> trích 100% bách khoa; nếu nhấn nhanh -> trích chuẩn như cũ */
async function formatSpreadForAI(
  cardsList: DynamicCardItem[],
  currentMode: SpreadMode,
  isCard2ReversedState: boolean = false,
  includeFullBakhKhoa: boolean = false
): Promise<string> {
  // Chỉ tải bài viết bách khoa chuyên sâu khi đã đắc pháp nghi thức (Kính Thiên, Kính Địa, Kính Nhân)
  const articles: (CardArticleData | null)[] = includeFullBakhKhoa
    ? await Promise.all(cardsList.map((c) => fetchCardArticleSections(c)))
    : cardsList.map(() => null);

  const bakhKhoaNotice = includeFullBakhKhoa ? " - ĐẮC PHÁP KÍNH THIÊN • ĐỊA • NHÂN (TOÀN THƯ BÁCH KHOA)" : " (TIÊU CHUẨN)";

  if (currentMode === "that_tinh") {
    const lines: string[] = [];
    lines.push(`=== THÔNG TIN TRẢI BÀI TRẬN PHÁP THẤT TINH (7 LÁ CHU DỊCH${bakhKhoaNotice}) ===`);
    lines.push(`Khẩu quyết: Thất Tinh Bắc Đẩu soi chiếu 7 phương diện cuộc đời: Quá khứ, Bản thân hiện tại, Diễn biến tiếp theo, Lá gợi ý, Kết quả, Môi trường khách quan và Điểm mù thiếu sót.\n`);
    cardsList.forEach((c, idx) => {
      const pos = THAT_TINH_POSITIONS[idx] || { label: `Lá ${idx + 1}`, sub: "", desc: "" };
      lines.push(`----------------------------------------`);
      const cardLines = formatCardFullInfoFromHexagram(c, `Vị trí ${pos.label} [${pos.sub}]: ${pos.desc}`, undefined, articles[idx]);
      lines.push(...cardLines);
      lines.push("");
    });
    lines.push(`========================================`);
    lines.push(`[YÊU CẦU LUẬN GIẢI CHO AI]:`);
    lines.push(`Xin hãy phân tích trải bài Trận Pháp Thất Tinh theo quan hệ nhân quả tương sinh tương khắc giữa 7 vị trí (sử dụng đầy đủ dữ liệu Thoán Từ, Đại Tượng, Hào Từ, Ngũ Hành, Thời vận${includeFullBakhKhoa ? ", Cửu Nhị Luận Giải và Chiêm đoán 4 phương diện" : ""}):`);
    lines.push(`1. Nền tảng quá khứ (Lá 1) và thực trạng tâm thế bản thân hiện tại (Lá 2).`);
    lines.push(`2. Chiều hướng diễn biến sắp tới (Lá 3) và tác động từ môi trường bên ngoài (Lá 6).`);
    lines.push(`3. Nhận diện điểm mù / thiếu sót cốt lõi của bản thân (Lá 7) để khắc phục.`);
    lines.push(`4. Triển khai phương châm hành động mấu chốt theo Lá Bài Gợi Ý (Lá 4) nhằm đạt được thành tựu kết quả viên mãn (Lá 5).`);
    return lines.join("\n");
  }

  if (currentMode === "thap_tinh") {
    const lines: string[] = [];
    lines.push(`=== THÔNG TIN TRẢI BÀI TRẬN PHÁP THẬP TINH (10 LÁ CELTIC CROSS CHU DỊCH${bakhKhoaNotice}) ===`);
    lines.push(`Khẩu quyết: Tâm điểm thập tự kết hợp chuỗi thời vận 10 vị thế nhân duyên.`);
    lines.push(`* QUY CHUẨN ĐẶC BIỆT LÁ THỨ 2: Chiều Xuôi là HỖ TRỢ (Trợ lực tương sinh), Chiều Ngược là TRỞ NGẠI (Thử thách, rào cản chắn ngang).`);
    lines.push(`* Trạng thái Lá 2 hiện thời: [${isCard2ReversedState ? "CHIỀU NGƯỢC: TRỞ NGẠI / RÀO CẢN" : "CHIỀU XUÔI: HỖ TRỢ / TRỢ LỰC TƯƠNG SINH"}]\n`);
    cardsList.forEach((c, idx) => {
      const pos = THAP_TINH_POSITIONS[idx] || { label: `Lá ${idx + 1}`, sub: "", desc: "" };
      const extraState = idx === 1 ? (isCard2ReversedState ? "[ĐANG Ở THẾ NGƯỢC: TRỞ NGẠI / RÀO CẢN]" : "[ĐANG Ở THẾ XUÔI: HỖ TRỢ / TRỢ LỰC]") : undefined;
      lines.push(`----------------------------------------`);
      const cardLines = formatCardFullInfoFromHexagram(c, `Vị trí ${pos.label} [${pos.sub}]: ${pos.desc}`, extraState, articles[idx]);
      lines.push(...cardLines);
      lines.push("");
    });
    lines.push(`========================================`);
    lines.push(`[YÊU CẦU LUẬN GIẢI CHO AI]:`);
    lines.push(`Xin hãy phân tích trải bài Trận Pháp Thập Tinh một cách sâu sắc và toàn diện (sử dụng đầy đủ dữ liệu Thoán Từ, Đại Tượng, Hào Từ, Ngũ Hành, Thời vận${includeFullBakhKhoa ? ", Cửu Nhị Luận Giải và Chiêm đoán 4 phương diện" : ""}):`);
    lines.push(`1. Phân tích cốt lõi tâm điểm: Tình huống hiện tại (Lá 1) và lực tác động trực diện của Lá 2 (${isCard2ReversedState ? "TRỞ NGẠI: thử thách, chướng ngại vật cần vượt qua" : "HỖ TRỢ: trợ lực thuận lợi, yếu tố tương sinh thúc đẩy"}).`);
    lines.push(`2. Mối liên hệ đa chiều: Yếu tố bên ngoài (Lá 3), Góc khuất chưa biết (Lá 4), Nguồn gốc trước đây (Lá 5), Tương lai tiếp theo (Lá 6).`);
    lines.push(`3. Đại cục vận trình: Vận hạn năm nay (Lá 7), Góc nhìn xã hội / người ngoài (Lá 8) và Kết quả cuối cùng (Lá 9).`);
    lines.push(`4. Đúc kết minh triết từ Lá Bài Khuyên Bảo (Lá 10) để đưa ra chiến lược hành động tối ưu nhất.`);
    return lines.join("\n");
  }

  if (currentMode === "thap_la") {
    const pri = cardsList[0];
    const trans = cardsList[1];
    const yaos = cardsList.slice(2);

    const priHex = HEXAGRAMS.find((h) => h.number === pri?.hexNumber) || HEXAGRAMS[0];
    const transHex = HEXAGRAMS.find((h) => h.number === trans?.hexNumber) || HEXAGRAMS[1];

    const lines: string[] = [];
    lines.push(`=== BẢNG LUẬN GIẢI THÁP LA KINH DỊCH (周易塔羅${bakhKhoaNotice}) ===`);
    lines.push(`Cấu trúc: Quẻ Chủ & Quẻ Biến song song Trên - Dưới • Dải Hào Động (Bộ 384 Lá) kế bên Quẻ Chủ`);
    lines.push(`Thứ tự đọc chiêm bốc: 1. Bản Quái (Quẻ Chủ) ➔ 2. Hào Động (Bước Ngoặt) ➔ 3. Biến Quái (Quẻ Biến)\n`);

    if (pri) {
      lines.push(`----------------------------------------`);
      lines.push(`【1. BẢN QUÁI (QUẺ CHỦ) — LÁ TRÊN SONG SONG】`);
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

    lines.push(`----------------------------------------`);
    lines.push(`【2. HÀO ĐỘNG (BỘ 384 LÁ BÀI HÀO TỪ) — KẾ BÊN QUẺ CHỦ】`);
    lines.push(`• Văn Bản Trọng Tâm: Hào Từ của chính hào biến động`);
    lines.push(`• Ý Nghĩa Thực Tiễn Trong Đời Sống: Lời khuyên then chốt: Trọng tâm hành động và biến số mấu chốt bạn cần lưu tâm`);
    lines.push(`• Số lượng hào biến động: ${yaos.length} hào (Sắp xếp theo thứ tự từ Hào Sơ ➔ Hào Lục)`);
    lines.push("");

    if (yaos.length === 0) {
      lines.push(`• Tình trạng: Quẻ Tĩnh (Không có hào biến). Cục diện kiên định bất biến, dĩ bất biến ứng vạn biến, bám sát Thoán Từ của Bản Quái.`);
    } else {
      yaos.forEach((y, idx) => {
        const lineNum = y.yaoNumber || (idx + 1);
        const lineMeaning = priHex.lineMeanings?.find((m) => m.line === lineNum);
        const isYangToYin = (priHex.lines?.[lineNum - 1] === 1);
        const yaoArticle = articles[idx + 2];

        lines.push(`▶ Hào Động thứ ${idx + 1}: ${y.name}`);
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
    }
    lines.push("");

    if (trans) {
      lines.push(`----------------------------------------`);
      lines.push(`【3. BIẾN QUÁI (QUẺ BIẾN) — LÁ DƯỚI SONG SONG】`);
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

    lines.push(`========================================`);
    lines.push(`[YÊU CẦU LUẬN GIẢI CHO AI (THEO PHƯƠNG PHÁP THÁP LA KINH DỊCH)]:`);
    lines.push(`Xin hãy phân tích trải bài Tháp La Kinh Dịch theo đúng 3 tầng thứ tự và ý nghĩa thực tiễn trong đời sống:`);
    lines.push(`1. BẢN QUÁI (Định vị bối cảnh): Dựa vào Thoán Từ (Quái Từ), Đại Tượng Truyện và Luận giải chuyên sâu, nhận diện bản chất loại hoàn cảnh thực tại đương số đang đối mặt. Cục diện đang ở đâu? Cơ hội và trở lực tiềm ẩn xung quanh là gì?`);
    lines.push(`2. HÀO ĐỘNG (Lời khuyên then chốt): Dựa vào Hào Từ của chính các hào biến động (phân tích tuần tự từ Hào Sơ lên Hào Lục). Đâu là trọng tâm hành động và biến số mấu chốt đương số cần lưu tâm? Chỉ rõ việc nên làm, việc cần tránh và thời điểm chuyển hóa quyết định.`);
    lines.push(`3. BIẾN QUÁI (Định hướng tương lai): Dựa vào Quái Từ của Quẻ Biến, dự báo xu thế phát triển tiếp theo sau khi sự chuyển hóa hoàn tất. Đưa ra chiến lược tổng thể và tâm thế sáng suốt nhất để đương số chủ động kiến tạo cát tường.`);

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
  lines.push(`Trải bài: ${getSpreadName(currentMode)} | Số lượng: ${cardsList.length} lá\n`);

  cardsList.forEach((c, idx) => {
    const pos = getPositionLabel(idx, cardsList.length);
    lines.push(`----------------------------------------`);
    const cardLines = formatCardFullInfoFromHexagram(c, pos, undefined, articles[idx]);
    lines.push(...cardLines);
    lines.push("");
  });

  lines.push(`========================================`);
  lines.push(`[YÊU CẦU LUẬN GIẢI CHO AI]:`);
  lines.push(`Xin hãy phân tích trải bài Kinh Dịch trên theo đúng thứ tự từ trái sang phải (dựa trên đầy đủ dữ liệu quẻ tượng, Thoán Từ, Đại Tượng, Hào Từ, Ngũ hành${includeFullBakhKhoa ? ", Cửu Nhị Luận Giải và Chiêm đoán 4 phương diện" : ""}):`);
  lines.push(`1. Luận giải ý nghĩa chi tiết từng lá bài theo vị trí tương ứng.`);
  lines.push(`2. Phân tích mối liên kết và dòng chảy chuyển dịch năng lượng từ lá bài bên trái sang lá bài bên phải.`);
  lines.push(`3. Đánh giá hoàn cảnh hiện tại, nguy cơ tiềm ẩn và cơ hội phát triển.`);
  lines.push(`4. Đưa ra lời khuyên hành động thực tế, thấu đáo và sáng suốt nhất theo triết lý Kinh Dịch.`);

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

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (_) {}

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

  const endHold = (e?: React.PointerEvent<HTMLButtonElement>) => {
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
    <div className="relative flex sm:inline-flex items-center justify-center w-full sm:w-auto">
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
        onPointerUp={endHold}
        onPointerLeave={endHold}
        onPointerCancel={endHold}
        onContextMenu={(e) => e.preventDefault()}
        className={`relative w-full sm:w-auto select-none touch-none overflow-visible transition-all duration-200 ${className} ${
          isHolding ? "scale-[0.97] brightness-110 shadow-lg ring-2 ring-amber-400/60" : ""
        } ${isFlashing ? "ring-4 ring-amber-400/80 shadow-[0_0_24px_rgba(245,158,11,0.6)]" : ""} ${
          showHint ? "animate-ritual-wiggle" : ""
        }`}
        style={{
          WebkitTouchCallout: "none",
          WebkitUserSelect: "none",
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
}) => {
  /* Spread mode state (random initial mode from 1, 1->2, 1->3, 3->5) */
  const [mode, setMode] = useState<SpreadMode>(() => SPREAD_MODES[Math.floor(Math.random() * SPREAD_MODES.length)]);
  const [cards, setCards] = useState<DynamicCardItem[]>(() => drawCardsForMode(mode));

  /* Trạng thái chiều của Lá thứ 2 trong Thập Tinh Trận: false = Xuôi (Hỗ Trợ), true = Ngược (Trở Ngại) - tỷ lệ xuất hiện 50% */
  const [isCard2Reversed, setIsCard2Reversed] = useState<boolean>(() => Math.random() < 0.5);

  /* Trạng thái đắc pháp nghi thức: false = nhấn nhanh (trích chuẩn như cũ), true = nhấn đủ Kính Thiên - Kính Địa - Kính Nhân (trích 100% bách khoa) */
  const [isRitualCompleted, setIsRitualCompleted] = useState<boolean>(false);

  const handleToggleCard2Reversed = useCallback(() => {
    setIsCard2Reversed((prev) => !prev);
  }, []);

  /* Anchors for scroll physics */
  const heroAnchorRef = useRef<HTMLDivElement>(null);
  const destinyAnchorRef = useRef<HTMLDivElement>(null);
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

  /* Trigger tick ref for recalculating physics */
  const requestTickRef = useRef<() => void>(() => {});
  const renderFullSpreadRef = useRef<() => void>(() => {});

  /* Card spread capture snapshot states */
  const [isCapturingSnapshot, setIsCapturingSnapshot] = useState(false);
  const [snapshotImageUrl, setSnapshotImageUrl] = useState<string | null>(null);
  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState(false);

  /* ══════════════════════════════════════════════════════════════════
     YILORE CARD SCROLL & TILT PHYSICS ENGINE (DYNAMIC MULTI-MODE)
     ══════════════════════════════════════════════════════════════════ */
  useEffect(() => {
    const layer = layerRef.current;
    const stage = stageRef.current;
    if (!layer || !stage) return;

    let curX = 0, curY = 0, curG = 0, curF = 0;
    let tgtX = 0, tgtY = 0, tgtG = 0, tgtF = 0;
    let isAnimating = false;
    let isInitialized = false;

    function calcTargets() {
      const scrollY = window.scrollY;
      const originX = window.innerWidth / 2;
      const originY = window.innerHeight / 2;
      const isDesktop = window.innerWidth >= 1024;

      let heroDocY = window.innerHeight * 0.45;
      let destinyDocY = window.innerHeight * 1.45;
      let featuresDocY = window.innerHeight * 2.50;

      let heroStageX = isDesktop ? window.innerWidth * 0.22 : 0;
      let destinyStageX = 0;
      let featuresStageX = isDesktop ? window.innerWidth * 0.23 : 0;

      if (heroAnchorRef.current) {
        const hr = heroAnchorRef.current.getBoundingClientRect();
        heroDocY = hr.top + scrollY + hr.height / 2;
        heroStageX = (hr.left + hr.width / 2) - originX;
      }
      if (destinyAnchorRef.current) {
        const dr = destinyAnchorRef.current.getBoundingClientRect();
        destinyDocY = dr.top + scrollY + dr.height / 2;
        destinyStageX = (dr.left + dr.width / 2) - originX;
      }
      if (featuresAnchorRef.current) {
        const fr = featuresAnchorRef.current.getBoundingClientRect();
        featuresDocY = fr.top + scrollY + fr.height / 2;
        featuresStageX = (fr.left + fr.width / 2) - originX;
      }

      const s1 = Math.max(120, destinyDocY - originY);
      const s1_hold = s1 + 400; // Vùng giữ vững vàng trong toàn bộ khu vực phần trắng
      const s2 = Math.max(s1_hold + 350, featuresDocY - originY);

      const curHeroY = (heroDocY - scrollY) - originY;
      const curDestinyY = (destinyDocY - scrollY) - originY;
      const curFeaturesY = (featuresDocY - scrollY) - originY;

      if (scrollY <= s1) {
        // GIAI ĐOẠN 1: Hero -> Destiny Cards (Xòe bài sớm 100% ngay từ 35% hành trình để khi vào phần trắng là đã tách hoàn toàn)
        const p1 = Math.min(1, Math.max(0, scrollY / s1));
        const t1 = smoothstep(p1);

        tgtX = heroStageX * (1 - t1) + destinyStageX * t1;
        tgtY = curHeroY * (1 - t1) + curDestinyY * t1;
        tgtG = smoothstep(Math.min(1, p1 / 0.50));
        tgtF = smoothstep(Math.min(1, p1 / 0.35)); // Đạt 100% tách biệt cực sớm
        if (layer) layer.style.opacity = "1";
      } else if (scrollY <= s1_hold) {
        // GIAI ĐOẠN 2: Giữ yên vị hoàn toàn tại trung tâm phần trắng (Destiny Cards)
        // Không di chuyển lệch sang phải, không co cụm, giữ 100% tách biệt rộng rãi
        tgtX = destinyStageX;
        tgtY = curDestinyY;
        tgtG = 1;
        tgtF = 1;
        if (layer) layer.style.opacity = "1";
      } else if (scrollY <= s2) {
        // GIAI ĐOẠN 3: Destiny Cards -> Features
        const p2 = Math.min(1, Math.max(0, (scrollY - s1_hold) / (s2 - s1_hold)));
        const t2 = smoothstep(p2);

        tgtX = destinyStageX * (1 - t2) + featuresStageX * t2;
        tgtY = curDestinyY * (1 - t2) + curFeaturesY * t2;
        tgtG = 1;

        // Khi kéo xuống Section Features: các lá bài gom mượt mà lại thành 1 lá duy nhất (f giảm dần từ 1 về 0)
        tgtF = 1 - smoothstep(p2);
        if (layer) layer.style.opacity = "1";
      } else {
        // GIAI ĐOẠN 4: Đã yên vị tại Features
        tgtX = featuresStageX;
        tgtY = curFeaturesY;
        tgtG = 1;
        tgtF = 0; // Gom lại hoàn toàn thành 1 lá duy nhất tại Features!

        if (featuresSecRef.current && layer) {
          const fRect = featuresSecRef.current.getBoundingClientRect();
          if (fRect.bottom < window.innerHeight * 0.55) {
            const fadeOut = Math.max(0, Math.min(1, (fRect.bottom - 40) / (window.innerHeight * 0.45)));
            layer.style.opacity = fadeOut.toFixed(3);
          } else {
            layer.style.opacity = "1";
          }
        }
      }
    }

    function renderCards(sX: number, sY: number, g: number, f: number) {
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
        // Quẻ Biến LUÔN ở DƯỚI song song tuyệt đối (rotate 0deg, trùng tọa độ X, opacity 1) với Quẻ Chủ (Quẻ Chính ở trên).
        // Kế bên Quẻ Chủ là dải các lá bài Hào Từ (ở 384 lá bài hào từ) thay đổi từ Hào Sơ đến Hào Lục.
        // TỰ ĐỘNG THU NHỎ KHI XUẤT HIỆN NHIỀU LÁ BÀI (tối đa 8 lá bài) để vừa vặn khung hình cả máy tính và điện thoại.
        const isSmallScreen = w < 860;
        const mobFactor = w < 380 ? 0.76 : w < 440 ? 0.88 : 1.0;
        const yaoCount = cardCount - 2;

        if (isSmallScreen) {
          // ── MOBILE / MÀN HÌNH NHỎ (ĐIỆN THOẠI) ──
          // Tự động thu nhỏ linh hoạt theo số lượng lá bài
          let baseScaleMob = 0.74;
          if (yaoCount >= 5) {
            baseScaleMob = 0.54; // 7-8 lá bài (nhiều lá): thu nhỏ 0.54 để trọn vẹn màn hình
          } else if (yaoCount >= 3) {
            baseScaleMob = 0.62; // 5-6 lá bài: thu nhỏ vừa vặn 0.62
          } else {
            baseScaleMob = 0.72; // 3-4 lá bài: hiển thị thoải mái 0.72
          }

          // Điều chỉnh theo độ phân giải màn hình điện thoại
          if (w < 380) baseScaleMob *= 0.88;
          else if (w < 440) baseScaleMob *= 0.94;
          if (vh < 700) baseScaleMob *= 0.90;

          const scaleHexMob = Math.max(0.46, Math.min(0.75, baseScaleMob));
          const scaleYaoMob = scaleHexMob * 0.92;

          const cardHMob = 224 * scaleHexMob;
          const cardWMob = 144 * scaleHexMob;
          const xOffsetMob = Math.min(95, cardWMob * 0.62 + 14) * mobFactor;
          const xCol0 = -xOffsetMob * f;
          const xYaoMob = xOffsetMob * f;

          // Khoảng cách trục dọc giữa Quẻ Chủ và Quẻ Biến (tự co giãn vừa vặn chiều cao)
          const distYMob = Math.max(130, cardHMob + 22);
          const y0 = (-distYMob / 2) * f;
          const y1 = (distYMob / 2) * f;

          // 1. Quẻ Chủ (Quẻ Chính) ở trên
          if (slots[0]) {
            slots[0].style.transform = `perspective(1200px) translate3d(${xCol0.toFixed(1)}px, ${y0.toFixed(1)}px, 20px) rotate(0deg) scale(${scaleHexMob.toFixed(3)})`;
            slots[0].style.opacity = "1";
            slots[0].style.pointerEvents = "auto";
            slots[0].style.zIndex = "18";
          }

          // 2. Quẻ Biến LUÔN ở dưới song song với Quẻ Chính (Cùng toạ độ X, rotate 0deg, opacity 1)
          if (slots[1]) {
            slots[1].style.transform = `perspective(1200px) translate3d(${xCol0.toFixed(1)}px, ${y1.toFixed(1)}px, 20px) rotate(0deg) scale(${scaleHexMob.toFixed(3)})`;
            slots[1].style.opacity = (f > 0.05 ? 1 : 0.85 + f * 0.15).toFixed(3);
            slots[1].style.pointerEvents = "auto";
            slots[1].style.zIndex = "17";
          }

          // 3. Các lá hào từ (ở 384 lá bài hào từ) ở cột bên phải theo thứ tự từ Sơ đến Lục
          if (yaoCount === 1) {
            // Chỉ 1 lá: đặt ngang hàng Quẻ Chủ
            if (slots[2]) {
              slots[2].style.transform = `perspective(1200px) translate3d(${xYaoMob.toFixed(1)}px, ${y0.toFixed(1)}px, 12px) rotate(0deg) scale(${scaleYaoMob.toFixed(3)})`;
              slots[2].style.opacity = (f > 0.1 ? 1 : f * 10).toFixed(3);
              slots[2].style.pointerEvents = f > 0.25 ? "auto" : "none";
              slots[2].style.zIndex = "12";
            }
          } else if (yaoCount === 2) {
            // 2 lá: lá 1 ngang hàng Quẻ Chủ, lá 2 ngang hàng Quẻ Biến
            if (slots[2]) {
              slots[2].style.transform = `perspective(1200px) translate3d(${xYaoMob.toFixed(1)}px, ${y0.toFixed(1)}px, 12px) rotate(0deg) scale(${scaleYaoMob.toFixed(3)})`;
              slots[2].style.opacity = (f > 0.1 ? 1 : f * 10).toFixed(3);
              slots[2].style.pointerEvents = f > 0.25 ? "auto" : "none";
              slots[2].style.zIndex = "12";
            }
            if (slots[3]) {
              slots[3].style.transform = `perspective(1200px) translate3d(${xYaoMob.toFixed(1)}px, ${y1.toFixed(1)}px, 12px) rotate(0deg) scale(${scaleYaoMob.toFixed(3)})`;
              slots[3].style.opacity = (f > 0.1 ? 1 : f * 10).toFixed(3);
              slots[3].style.pointerEvents = f > 0.25 ? "auto" : "none";
              slots[3].style.zIndex = "13";
            }
          } else {
            // 3 lá trở lên: trải đều theo chiều dọc từ y0 đến y1
            const stepY = ((distYMob) / Math.max(1, yaoCount - 1)) * f;
            for (let i = 0; i < yaoCount; i++) {
              const sIdx = i + 2;
              if (slots[sIdx]) {
                const yYao = (y0 + i * stepY);
                slots[sIdx].style.transform = `perspective(1200px) translate3d(${xYaoMob.toFixed(1)}px, ${yYao.toFixed(1)}px, 12px) rotate(0deg) scale(${scaleYaoMob.toFixed(3)})`;
                slots[sIdx].style.opacity = (f > 0.1 ? 1 : f * 10).toFixed(3);
                slots[sIdx].style.pointerEvents = f > 0.25 ? "auto" : "none";
                slots[sIdx].style.zIndex = (10 + i).toString();
              }
            }
          }
        } else {
          // ── DESKTOP / MÀN HÌNH LỚN (MÁY TÍNH / LAPTOP) ──
          // Tự động thu nhỏ linh hoạt theo số lượng lá bài
          let baseScaleDesk = 0.82;
          if (yaoCount >= 5) {
            baseScaleDesk = 0.63; // 7-8 lá bài (nhiều lá): tự động thu nhỏ 0.63 để vừa vặn khung màn hình
          } else if (yaoCount >= 3) {
            baseScaleDesk = 0.72; // 5-6 lá bài: thu nhỏ vừa vặn 0.72
          } else {
            baseScaleDesk = 0.82; // 3-4 lá bài: kích thước 0.82 rộng rãi
          }

          // Điều chỉnh theo độ phân giải màn hình máy tính (chiều ngang & chiều dọc)
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

          const xCol0 = startX * f;
          const distYDesk = Math.max(160, cardHDesk + 26);
          const yTop = (-distYDesk / 2) * f;
          const yBottom = (distYDesk / 2) * f;

          // 1. Quẻ Chủ (Quẻ Chính) ở trên
          if (slots[0]) {
            slots[0].style.transform = `perspective(1200px) translate3d(${xCol0.toFixed(1)}px, ${yTop.toFixed(1)}px, 25px) rotate(0deg) scale(${scaleHexDesk.toFixed(3)})`;
            slots[0].style.opacity = "1";
            slots[0].style.pointerEvents = "auto";
            slots[0].style.zIndex = "18";
          }

          // 2. Quẻ Biến LUÔN ở dưới song song với Quẻ Chính (Cùng toạ độ X, rotate 0deg, opacity 1)
          if (slots[1]) {
            slots[1].style.transform = `perspective(1200px) translate3d(${xCol0.toFixed(1)}px, ${yBottom.toFixed(1)}px, 25px) rotate(0deg) scale(${scaleHexDesk.toFixed(3)})`;
            slots[1].style.opacity = (f > 0.05 ? 1 : 0.85 + f * 0.15).toFixed(3);
            slots[1].style.pointerEvents = "auto";
            slots[1].style.zIndex = "17";
          }

          // 3. Các lá hào từ (ở 384 lá bài hào từ) xếp kế bên Quẻ Chủ theo thứ tự từ Sơ đến Lục
          for (let i = 0; i < yaoCount; i++) {
            const sIdx = i + 2;
            if (slots[sIdx]) {
              let xYao = 0;
              let yYao = 0;
              if (yaoCount <= 3) {
                // Toàn bộ các lá hào từ xếp thẳng 1 hàng trên, kế bên Quẻ Chủ
                const col = i + 1;
                xYao = (startX + col * colStep) * f;
                yYao = yTop;
              } else {
                // Dàn 2 hàng: nửa đầu ở hàng trên (kế bên Quẻ Chủ), nửa sau ở hàng dưới (kế bên Quẻ Biến)
                if (i < topYaoLimit) {
                  const col = i + 1;
                  xYao = (startX + col * colStep) * f;
                  yYao = yTop;
                } else {
                  const col = (i - topYaoLimit) + 1;
                  xYao = (startX + col * colStep) * f;
                  yYao = yBottom;
                }
              }

              slots[sIdx].style.transform = `perspective(1200px) translate3d(${xYao.toFixed(1)}px, ${yYao.toFixed(1)}px, 15px) rotate(0deg) scale(${scaleYaoDesk.toFixed(3)})`;
              slots[sIdx].style.opacity = (f > 0.1 ? 1 : f * 10).toFixed(3);
              slots[sIdx].style.pointerEvents = f > 0.25 ? "auto" : "none";
              slots[sIdx].style.zIndex = (10 + i).toString();
            }
          }
        }
      } else if (mode === "that_tinh") {
        // ── CHẾ ĐỘ: TRẬN PHÁP THẤT TINH (7 LÁ CHU DỊCH BẮC ĐẨU) ──
        // Bố cục 3 hàng x 3 cột chuẩn xác theo ảnh mẫu:
        // Hàng 1 (Trên): Lá 4 (Lá Bài Gợi Ý) ở chính giữa
        // Hàng 2 (Giữa): Lá 2 (Bản Thân Hiện Tại) [Trái] | Lá 3 (Diễn Biến Tiếp Theo) [Giữa] | Lá 5 (Kết Quả) [Phải]
        // Hàng 3 (Dưới): Lá 7 (Thiếu Sót Của Bản Thân) [Trái] | Lá 1 (Quá Khứ) [Giữa] | Lá 6 (Môi Trường Bên Ngoài) [Phải]
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
          if (slots[idx]) {
            const x = p.x * f;
            const y = p.y * f;
            slots[idx].style.transform = `perspective(1200px) translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${p.z}px) rotate(0deg) scale(${scale7.toFixed(3)})`;
            slots[idx].style.opacity = f > 0.15 ? "1" : f.toFixed(3);
            slots[idx].style.pointerEvents = f > 0.25 ? "auto" : "none";
            slots[idx].style.zIndex = p.z.toString();
          }
        });
      } else if (mode === "thap_tinh") {
        // ── CHẾ ĐỘ: TRẬN PHÁP THẬP TINH (10 LÁ DỊCH LÝ) ──
        // Bố cục 5 cột phân tách rõ ràng, Lá 1 & Lá 2 nằm cạnh nhau không bị trùng:
        // Cột 1 (Ngoài cùng bên trái): Lá 10 (Lá Bài Khuyên Bảo) - độc lập, không khung ngoài
        // Cột 2 (Bên trái): Lá 7 (Vận Hạn Năm Nay) [Trên] | Lá 8 (Cách Nhìn Người Ngoài) [Giữa] | Lá 9 (Kết Quả Cuối Cùng) [Dưới]
        // Cột 3 (Tâm điểm bên trái): Lá 2 (Xuôi: Hỗ Trợ / Ngược: Trở Ngại) [Giữa]
        // Cột 4 (Tâm điểm bên phải & trục dọc):
        //   - Lá 4 (Điều Bạn Không Biết) [Trên]
        //   - Lá 1 (Tình Huống Hiện Tại) [Giữa]
        //   - Lá 3 (Yếu Tố Bên Ngoài) [Dưới]
        // Cột 5 (Bên phải): Lá 5 (Tình Huống Trước Đây) [Trên] | Lá 6 (Tương Lai Tiếp Theo) [Dưới]
        const isSmallScreen = w < 860;
        const mobScale10 = w < 380 ? 0.35 : w < 440 ? 0.39 : 0.43;
        const deskScale10 = w < 1000 ? 0.52 : w < 1200 ? 0.58 : w < 1440 ? 0.63 : 0.68;
        const scale10 = isSmallScreen ? mobScale10 : deskScale10;

        const stepX = isSmallScreen
          ? (w < 380 ? 56 : w < 440 ? 62 : 68)
          : (w < 1000 ? 132 : w < 1200 ? 146 : w < 1440 ? 160 : 172) * factor;
        const stepY = isSmallScreen
          ? (w < 380 ? 112 : w < 440 ? 122 : 134)
          : (w < 1000 ? 190 : w < 1200 ? 212 : w < 1440 ? 228 : 242) * factor;

        // Tọa độ các cột ngang cân bằng (Lá 1 và Lá 2 tách rời nhau):
        const midAnchor = isSmallScreen ? 14 : 26;
        const col1X = midAnchor - stepX * 2.22;  // Lá 10
        const col2X = midAnchor - stepX * 1.15;  // Lá 7, 8, 9
        const card2X = midAnchor - stepX * 0.12; // Lá 2 (Tách rời về bên trái tâm)
        const card1X = midAnchor + stepX * 0.88; // Lá 1 (Tách rời về bên phải tâm, thẳng hàng với Lá 4 & 3)
        const col5X = midAnchor + stepX * 1.88;  // Lá 5, 6

        const posMap10: { x: number; y: number; z: number; rot?: number }[] = [
          { x: card1X, y: 0, z: 15, rot: 0 },                       // 0: Lá 1 (Tình Huống Hiện Tại)
          { x: card2X, y: 0, z: 16, rot: 0 },                       // 1: Lá 2 (Xuôi: Hỗ Trợ / Ngược: Trở Ngại) - đứng riêng độc lập
          { x: card1X, y: stepY, z: 14, rot: 0 },                   // 2: Lá 3 (Yếu Tố Bên Ngoài)
          { x: card1X, y: -stepY, z: 14, rot: 0 },                  // 3: Lá 4 (Điều Bạn Không Biết)
          { x: col5X, y: -stepY * 0.58, z: 13, rot: 0 },            // 4: Lá 5 (Tình Huống Trước Đây)
          { x: col5X, y: stepY * 0.58, z: 13, rot: 0 },             // 5: Lá 6 (Tương Lai Tiếp Theo)
          { x: col2X, y: -stepY, z: 13, rot: 0 },                    // 6: Lá 7 (Vận Hạn Năm Nay)
          { x: col2X, y: 0, z: 13, rot: 0 },                         // 7: Lá 8 (Cách Nhìn Của Người Ngoài)
          { x: col2X, y: stepY, z: 13, rot: 0 },                     // 8: Lá 9 (Kết Quả Cuối Cùng)
          { x: col1X, y: 0, z: 14, rot: 0 },                        // 9: Lá 10 (Lá Bài Khuyên Bảo)
        ];

        posMap10.forEach((p, idx) => {
          if (slots[idx]) {
            const x = p.x * f;
            const y = p.y * f;
            const rot = (p.rot || 0) * f;
            slots[idx].style.transform = `perspective(1200px) translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${p.z}px) rotate(${rot.toFixed(1)}deg) scale(${scale10.toFixed(3)})`;
            slots[idx].style.opacity = f > 0.15 ? "1" : f.toFixed(3);
            slots[idx].style.pointerEvents = f > 0.25 ? "auto" : "none";
            slots[idx].style.zIndex = p.z.toString();
          }
        });
      } else if (cardCount === 5 || mode === "3_to_5") {
        // ── CHẾ ĐỘ: 5 LÁ (NGŨ HÀNH) ──
        // Tùy thuộc vào kích thước màn hình mà các lá bài sắp xếp linh hoạt:
        // - Trên màn hình nhỏ/điện thoại (w < 860): Không đủ chỗ bày ngang 5 lá,
        //   nên 3 lá đầu ở hàng trên, 2 lá cuối cùng bên phải (Slot 3 & 4) nhảy xuống hàng dưới và căn giữa.
        // - Trên màn hình lớn (w >= 860): xòe đủ 5 lá thành 1 hàng ngang rộng rãi.
        // Khi kéo xuống Features (f=0): toàn bộ gôm lại thành 1 lá duy nhất tại Slot 2!

        const isSmallScreen = w < 860;
        const mobFactor = w < 380 ? 0.76 : w < 440 ? 0.88 : 1.0;
        const mobScale = w < 380 ? 0.70 : w < 440 ? 0.76 : 0.82;

        if (isSmallScreen) {
          // ── BỐ CỤC MOBILE / MÀN HÌNH NHỎ (Hàng trên 3 lá, Hàng dưới 2 lá) ──
          // Hàng 1 (Trên): Slot 0 (trái), Slot 1 (giữa), Slot 2 (phải)
          // Slot 0 (Trái trên)
          if (slots[0]) {
            const x0 = (-115 * f) * mobFactor;
            const y0 = -82 * f;
            const rot0 = -4.5 * f;
            slots[0].style.transform = `perspective(1200px) translate3d(${x0.toFixed(1)}px, ${y0.toFixed(1)}px, 0) rotate(${rot0.toFixed(1)}deg) scale(${mobScale})`;
            slots[0].style.opacity = f.toFixed(3);
            slots[0].style.pointerEvents = f > 0.25 ? "auto" : "none";
            slots[0].style.zIndex = "8";
          }
          // Slot 1 (Giữa trên): ở Hero nằm cận trái (-120px), khi xuống Destiny tiến vào giữa trên (x=0, y=-88px)
          if (slots[1]) {
            const heroX1 = -115 * (1 - g) * mobFactor;
            const x1 = heroX1;
            const y1 = -88 * f;
            const rot1 = 0;
            const sc1 = mobScale + (1.10 - mobScale) * (1 - f);
            slots[1].style.transform = `perspective(1200px) translate3d(${x1.toFixed(1)}px, ${y1.toFixed(1)}px, 0) rotate(${rot1}deg) scale(${sc1.toFixed(3)})`;
            const op1 = g < 0.5 ? 1 : f;
            slots[1].style.opacity = op1.toFixed(3);
            slots[1].style.pointerEvents = f > 0.25 ? "auto" : "none";
            slots[1].style.zIndex = "10";
          }
          // Slot 2 (Phải trên): ở Hero là lá trung tâm, khi xuống Destiny dạt sang phải trên
          if (slots[2]) {
            const destX2 = 115 * f * mobFactor;
            const y2 = -82 * f;
            const rot2 = 4.5 * f;
            const sc2 = mobScale + (1.10 - mobScale) * (1 - f); // Khi về Features phóng lên 1.10
            slots[2].style.transform = `perspective(1200px) translate3d(${destX2.toFixed(1)}px, ${y2.toFixed(1)}px, 26px) rotate(${rot2.toFixed(1)}deg) scale(${sc2.toFixed(3)})`;
            slots[2].style.opacity = "1";
            slots[2].style.pointerEvents = "auto";
            slots[2].style.zIndex = "14";
          }

          // Hàng 2 (Dưới): 2 lá cuối cùng bên phải nhảy xuống (Slot 3 & Slot 4 căn giữa bên dưới)
          // Slot 3 (Trái dưới)
          if (slots[3]) {
            const heroX3 = 115 * (1 - g) * mobFactor;
            const destX3 = -65 * f * mobFactor;
            const x3 = heroX3 + destX3;
            const y3 = 105 * f;
            const rot3 = -3 * f;
            const sc3 = mobScale;
            slots[3].style.transform = `perspective(1200px) translate3d(${x3.toFixed(1)}px, ${y3.toFixed(1)}px, 0) rotate(${rot3.toFixed(1)}deg) scale(${sc3.toFixed(3)})`;
            const op3 = g < 0.5 ? 1 : f;
            slots[3].style.opacity = op3.toFixed(3);
            slots[3].style.pointerEvents = f > 0.25 ? "auto" : "none";
            slots[3].style.zIndex = "9";
          }
          // Slot 4 (Phải dưới)
          if (slots[4]) {
            const x4 = (65 * f) * mobFactor;
            const y4 = 105 * f;
            const rot4 = 3 * f;
            slots[4].style.transform = `perspective(1200px) translate3d(${x4.toFixed(1)}px, ${y4.toFixed(1)}px, 0) rotate(${rot4.toFixed(1)}deg) scale(${mobScale})`;
            slots[4].style.opacity = f.toFixed(3);
            slots[4].style.pointerEvents = f > 0.25 ? "auto" : "none";
            slots[4].style.zIndex = "9";
          }
        } else {
          // ── BỐ CỤC DESKTOP (1 hàng ngang rộng rãi cả 5 lá, tự co giãn theo độ rộng màn hình) ──
          const scale5Desk = w < 1000 ? 0.74 : w < 1200 ? 0.82 : w < 1440 ? 0.90 : 0.98;
          const col5Step = 220 * (scale5Desk / 0.98) * factor;

          // Slot 0 (Cực Trái)
          if (slots[0]) {
            const x0 = (-col5Step * 2 * f);
            const y0 = 8 * f;
            const rot0 = -7 * f;
            slots[0].style.transform = `perspective(1200px) translate3d(${x0.toFixed(1)}px, ${y0.toFixed(1)}px, 0) rotate(${rot0.toFixed(1)}deg) scale(${scale5Desk.toFixed(3)})`;
            slots[0].style.opacity = f.toFixed(3);
            slots[0].style.pointerEvents = f > 0.25 ? "auto" : "none";
            slots[0].style.zIndex = "8";
          }
          // Slot 1 (Cận Trái): ở Hero x=-140, ở Destiny x=-col5Step, ở Features gôm về 0
          if (slots[1]) {
            const heroX1 = -140 * (1 - g);
            const spreadX1 = -col5Step * f;
            const x1 = (heroX1 + spreadX1);
            const y1 = 3 * f;
            const rot1 = -3.5 * f;
            const sc1 = scale5Desk + (1.10 - scale5Desk) * (1 - f);
            slots[1].style.transform = `perspective(1200px) translate3d(${x1.toFixed(1)}px, ${y1.toFixed(1)}px, 0) rotate(${rot1.toFixed(1)}deg) scale(${sc1.toFixed(3)})`;
            const op1 = g < 0.5 ? 1 : f;
            slots[1].style.opacity = op1.toFixed(3);
            slots[1].style.pointerEvents = f > 0.25 ? "auto" : "none";
            slots[1].style.zIndex = "10";
          }
          // Slot 2 (Trung Tâm): là lá trụ cột luôn hiển thị 1 lá uy nghi tại Features
          if (slots[2]) {
            const sc2 = scale5Desk + (1.10 - scale5Desk) * (1 - f);
            slots[2].style.transform = `perspective(1200px) translate3d(0, 0, 26px) scale(${sc2.toFixed(3)})`;
            slots[2].style.opacity = "1";
            slots[2].style.pointerEvents = "auto";
            slots[2].style.zIndex = "14";
          }
          // Slot 3 (Cận Phải): ở Hero x=140, ở Destiny x=col5Step, ở Features gôm về 0
          if (slots[3]) {
            const heroX3 = 140 * (1 - g);
            const spreadX3 = col5Step * f;
            const x3 = (heroX3 + spreadX3);
            const y3 = 3 * f;
            const rot3 = 3.5 * f;
            const sc3 = scale5Desk + (1.10 - scale5Desk) * (1 - f);
            slots[3].style.transform = `perspective(1200px) translate3d(${x3.toFixed(1)}px, ${y3.toFixed(1)}px, 0) rotate(${rot3.toFixed(1)}deg) scale(${sc3.toFixed(3)})`;
            const op3 = g < 0.5 ? 1 : f;
            slots[3].style.opacity = op3.toFixed(3);
            slots[3].style.pointerEvents = f > 0.25 ? "auto" : "none";
            slots[3].style.zIndex = "10";
          }
          // Slot 4 (Cực Phải)
          if (slots[4]) {
            const x4 = (col5Step * 2 * f);
            const y4 = 8 * f;
            const rot4 = 7 * f;
            slots[4].style.transform = `perspective(1200px) translate3d(${x4.toFixed(1)}px, ${y4.toFixed(1)}px, 0) rotate(${rot4.toFixed(1)}deg) scale(${scale5Desk.toFixed(3)})`;
            slots[4].style.opacity = f.toFixed(3);
            slots[4].style.pointerEvents = f > 0.25 ? "auto" : "none";
            slots[4].style.zIndex = "8";
          }
        }
      } else if (cardCount === 3 || mode === "1_to_3") {
        // ── CHẾ ĐỘ: 3 LÁ (TAM TÀI) ──
        // Ở Destiny (f=1): xòe 3 lá rộng rãi (-340, 0, +340)
        // Khi kéo xuống Features (f=0): gôm lại thành 1 lá duy nhất tại Slot 1!
        if (slots[0]) {
          const x0 = (-340 * f) * factor;
          const y0 = 3 * f;
          const rot0 = -4.5 * f;
          const sc0 = 1.02;
          slots[0].style.transform = `perspective(1200px) translate3d(${x0.toFixed(1)}px, ${y0.toFixed(1)}px, 0) rotate(${rot0.toFixed(1)}deg) scale(${sc0.toFixed(3)})`;
          slots[0].style.opacity = f.toFixed(3);
          slots[0].style.pointerEvents = f > 0.20 ? "auto" : "none";
          slots[0].style.zIndex = "10";
        }
        if (slots[1]) {
          slots[1].style.transform = `perspective(1200px) translate3d(0, 0, 26px) scale(1.08)`;
          slots[1].style.opacity = "1";
          slots[1].style.pointerEvents = "auto";
          slots[1].style.zIndex = "14";
        }
        if (slots[2]) {
          const x2 = (340 * f) * factor;
          const y2 = 3 * f;
          const rot2 = 4.5 * f;
          const sc2 = 1.02;
          slots[2].style.transform = `perspective(1200px) translate3d(${x2.toFixed(1)}px, ${y2.toFixed(1)}px, 0) rotate(${rot2.toFixed(1)}deg) scale(${sc2.toFixed(3)})`;
          slots[2].style.opacity = f.toFixed(3);
          slots[2].style.pointerEvents = f > 0.20 ? "auto" : "none";
          slots[2].style.zIndex = "10";
        }
      } else if (cardCount === 2 || mode === "1_to_2") {
        // ── CHẾ ĐỘ: 2 LÁ (ÂM DƯƠNG) ──
        // Ở Destiny (f=1): xòe đôi rộng rãi (-220 và +220)
        // Khi kéo xuống Features (f=0): gôm lại thành 1 lá duy nhất tại Slot 1!
        if (slots[0]) {
          const x0 = (-220 * f) * factor;
          const rot0 = -3 * f;
          const sc0 = 1.05;
          slots[0].style.transform = `perspective(1200px) translate3d(${x0.toFixed(1)}px, 0, 0) rotate(${rot0.toFixed(1)}deg) scale(${sc0.toFixed(3)})`;
          slots[0].style.opacity = f.toFixed(3);
          slots[0].style.pointerEvents = f > 0.20 ? "auto" : "none";
          slots[0].style.zIndex = "10";
        }
        if (slots[1]) {
          // Slot 1: khi f=1 ở +220px, khi kéo xuống Features f=0 gôm về chính giữa x=0 thành 1 lá duy nhất!
          const x1 = (220 * f) * factor;
          const rot1 = 3 * f;
          const sc1 = 1.05;
          slots[1].style.transform = `perspective(1200px) translate3d(${x1.toFixed(1)}px, 0, 0) rotate(${rot1.toFixed(1)}deg) scale(${sc1.toFixed(3)})`;
          slots[1].style.opacity = "1";
          slots[1].style.pointerEvents = "auto";
          slots[1].style.zIndex = "14";
        }
      } else {
        // ── CHẾ ĐỘ: 1 LÁ DUY NHẤT (ĐƠN QUẺ CHÍ TÔN) ──
        if (slots[0]) {
          const sc0 = 1.15;
          slots[0].style.transform = `perspective(1200px) translate3d(0, 0, 26px) scale(${sc0.toFixed(3)})`;
          slots[0].style.opacity = "1";
          slots[0].style.pointerEvents = "auto";
          slots[0].style.zIndex = "14";
        }
      }
    }

    function tick() {
      const dx = tgtX - curX;
      const dy = tgtY - curY;
      const dg = tgtG - curG;
      const df = tgtF - curF;

      curX += dx * 0.20;
      curY += dy * 0.20;
      curG += dg * 0.18;
      curF += df * 0.16;

      renderCards(curX, curY, curG, curF);

      if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1 || Math.abs(dg) > 0.005 || Math.abs(df) > 0.005) {
        requestAnimationFrame(tick);
      } else {
        curX = tgtX; curY = tgtY; curG = tgtG; curF = tgtF;
        renderCards(curX, curY, curG, curF);
        isAnimating = false;
      }
    }

    function requestTick() {
      calcTargets();
      if (!isInitialized) {
        isInitialized = true;
        curX = tgtX; curY = tgtY; curG = tgtG; curF = tgtF;
        renderCards(curX, curY, curG, curF);
        return;
      }
      if (!isAnimating) {
        isAnimating = true;
        requestAnimationFrame(tick);
      }
    }

    requestTickRef.current = requestTick;
    renderFullSpreadRef.current = () => {
      renderCards(0, 0, 0, 1);
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
    setIsRitualCompleted(isRitual);
    setMode(newMode);
    if (newMode === "thap_tinh") {
      setIsCard2Reversed(Math.random() < 0.5);
    }
    setCards(drawCardsForMode(newMode));
    setTimeout(() => {
      requestTickRef.current();
    }, 50);
  };

  /* ── Shuffle Cards (Rút bài ngẫu nhiên mới từ 384 hào & 64 quẻ) ── */
  const handleShuffleCards = useCallback((isRitual: boolean = false) => {
    setIsRitualCompleted(isRitual);
    if (mode === "thap_tinh") {
      setIsCard2Reversed(Math.random() < 0.5);
    }
    setCards(drawCardsForMode(mode));
    setTimeout(() => {
      requestTickRef.current();
    }, 50);
  }, [mode]);

  /* ── Sao chép toàn bộ trải bài cho AI (Đầy đủ thông tin từ Hexagram & Bách khoa) ── */
  const handleCopyCardsForAI = useCallback(async () => {
    if (isRitualCompleted) {
      setCopiedToast("✨ Đang trích xuất 100% Bách Khoa Toàn Thư Kinh Dịch (Cửu Nhị Luận Giải & FAQ) cho AI...");
    } else {
      setCopiedToast("Đang chuẩn bị dữ liệu quẻ & luận giải tiêu chuẩn cho AI...");
    }
    const text = await formatSpreadForAI(cards, mode, isCard2Reversed, isRitualCompleted);
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedAI(true);
      if (isRitualCompleted) {
        setCopiedToast("✨ Đã sao chép 100% Bách Khoa Toàn Thư cho AI (kèm Tổng quan, Luận giải, Chiêm đoán & FAQ)!");
      } else {
        setCopiedToast("Đã chép thông tin các lá bài tiêu chuẩn cho AI!");
      }
      setTimeout(() => setCopiedAI(false), 2500);
      setTimeout(() => setCopiedToast(null), 3500);
    }
  }, [cards, mode, isCard2Reversed, isRitualCompleted]);

  /* ── Sao chép 1 lá bài đơn lẻ cho AI (Lấy đầy đủ 100% dữ liệu từ Hexagram & Bách khoa khi đắc pháp) ── */
  const handleCopySingleCardForAI = useCallback(async (card: DynamicCardItem) => {
    let article: CardArticleData | null = null;
    if (isRitualCompleted) {
      setCopiedToast(`✨ Đang trích xuất 100% bách khoa toàn thư cho lá bài ${card.name}...`);
      article = await fetchCardArticleSections(card);
    } else {
      setCopiedToast(`Đang trích xuất dữ liệu tiêu chuẩn cho lá bài ${card.name}...`);
    }

    const cardInfoLines = formatCardFullInfoFromHexagram(card, `LÁ BÀI KINH DỊCH: ${card.name}`, undefined, article);
    const text = `=== THÔNG TIN ${isRitualCompleted ? "100% BÁCH KHOA TOÀN THƯ (ĐẮC PHÁP KÍNH THIÊN • ĐỊA • NHÂN)" : "TIÊU CHUẨN"} LÁ BÀI KINH DỊCH ===
${cardInfoLines.join("\n")}

========================================
[YÊU CẦU LUẬN GIẢI CHO AI]:
Xin hãy phân tích chi tiết và sâu sắc lá bài Kinh Dịch trên:
1. Ý nghĩa biểu tượng quẻ tượng, tên quẻ/hào, cấu tạo Thượng Hạ quái và Ngũ hành khí số.
2. Hoàn cảnh thực tế, thuận lợi tiềm tàng và thách thức mà quẻ/hào này đang phản ánh${isRitualCompleted ? " (kết hợp dữ liệu Tổng Quan Hào Vị, Cửu Nhị Luận Giải, Chiêm Đoán Giải Quẻ 4 phương diện và Câu Hỏi Thường Gặp FAQ)" : ""}.
3. Trọng tâm hành động và lời khuyên định hướng thấu đáo nhất theo đạo Dịch để đón cát tránh hung.`;

    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedSingle(true);
      if (isRitualCompleted) {
        setCopiedToast(`✨ Đã sao chép 100% bách khoa toàn thư lá bài ${card.name} cho AI!`);
      } else {
        setCopiedToast(`Đã sao chép thông tin lá bài ${card.name} cho AI!`);
      }
      setTimeout(() => setCopiedSingle(false), 2200);
      setTimeout(() => setCopiedToast(null), 3200);
    }
  }, [isRitualCompleted]);

  /* ── Chụp hình tự động căn trọn vẹn toàn bộ các lá bài đang trải trận ── */
  const handleCaptureCardsSnapshot = useCallback(async () => {
    if (isCapturingSnapshot) return;
    setIsCapturingSnapshot(true);

    try {
      // 1. Force các lá bài bung mở toàn phần ở chế độ xòe rộng (f = 1, sX = 0, sY = 0)
      if (renderFullSpreadRef.current) {
        renderFullSpreadRef.current();
      }

      // Đợi 1 frame để trình duyệt áp dụng styles transform lên DOM
      await new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 50)));

      const stage = stageRef.current;
      if (!stage) {
        throw new Error("Không tìm thấy khung bài để chụp");
      }

      const stageRect = stage.getBoundingClientRect();
      const activeSlots = slotRefs.current.slice(0, cards.length).filter(Boolean) as HTMLElement[];

      if (activeSlots.length === 0) {
        throw new Error("Không có lá bài nào để chụp");
      }

      // 2. Tính toán chính xác khung bao (Bounding Box) của toàn bộ lá bài đang hiển thị
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      activeSlots.forEach((slot) => {
        const r = slot.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          minX = Math.min(minX, r.left - stageRect.left);
          minY = Math.min(minY, r.top - stageRect.top);
          maxX = Math.max(maxX, r.right - stageRect.left);
          maxY = Math.max(maxY, r.bottom - stageRect.top);
        }

        // Nếu có nhãn vị trí / nút đổi thế phía trên lá bài thì bao gồm luôn vào khung
        const badge = slot.querySelector("div.absolute") as HTMLElement | null;
        if (badge) {
          const br = badge.getBoundingClientRect();
          if (br.width > 0 && br.height > 0) {
            minX = Math.min(minX, br.left - stageRect.left);
            minY = Math.min(minY, br.top - stageRect.top);
            maxX = Math.max(maxX, br.right - stageRect.left);
            maxY = Math.max(maxY, br.bottom - stageRect.top);
          }
        }
      });

      if (!isFinite(minX) || !isFinite(maxX)) {
        minX = 0;
        minY = 0;
        maxX = stageRect.width;
        maxY = stageRect.height;
      }

      // Căn lề padding thanh thoát (~42px) đúng như ảnh mẫu chuẩn
      const padX = 42;
      const padY = 42;
      const cropW = Math.max(320, Math.round(maxX - minX + padX * 2));
      const cropH = Math.max(200, Math.round(maxY - minY + padY * 2));

      // 3. Tạo khung chứa tạm thời (Offscreen container) với nền trắng kẻ ô tọa độ mờ
      const outerWrapper = document.createElement("div");
      outerWrapper.setAttribute("data-capture-root", "true");
      outerWrapper.style.position = "fixed";
      outerWrapper.style.left = "-99999px";
      outerWrapper.style.top = "0";
      outerWrapper.style.width = "0";
      outerWrapper.style.height = "0";
      outerWrapper.style.overflow = "hidden";
      outerWrapper.style.zIndex = "-9999";

      const container = document.createElement("div");
      container.style.position = "relative";
      container.style.width = `${cropW}px`;
      container.style.height = `${cropH}px`;
      container.style.overflow = "hidden";
      container.style.backgroundColor = "#FFFFFF";
      container.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.055) 1px, transparent 1px)`;
      container.style.backgroundSize = "48px 48px";
      container.style.boxSizing = "border-box";

      // 4. Clone stage chứa bài sang container và dịch chuyển sao cho khớp khung crop
      const stageClone = stage.cloneNode(true) as HTMLElement;
      stageClone.style.position = "absolute";
      stageClone.style.left = `${Math.round(-minX + padX)}px`;
      stageClone.style.top = `${Math.round(-minY + padY)}px`;
      stageClone.style.transform = "none";
      stageClone.style.width = `${stageRect.width}px`;
      stageClone.style.height = `${stageRect.height}px`;
      stageClone.style.margin = "0";
      stageClone.style.pointerEvents = "none";

      container.appendChild(stageClone);
      outerWrapper.appendChild(container);
      document.body.appendChild(outerWrapper);

      // Đảm bảo toàn bộ ảnh webp của các lá bài đã nạp xong
      const imgs = Array.from(stageClone.querySelectorAll("img"));
      await Promise.all(
        imgs.map((img) => {
          if (img.complete && img.naturalWidth > 0) return Promise.resolve(true);
          return new Promise((res) => {
            img.onload = () => res(true);
            img.onerror = () => res(false);
            setTimeout(() => res(false), 1200);
          });
        })
      );
      await new Promise((resolve) => setTimeout(resolve, 60));

      // 5. Kết xuất ảnh độ phân giải cao (Retina 2x)
      const dataUrl = await toPng(container, {
        pixelRatio: 2,
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

      // Dọn dẹp DOM tạm
      if (outerWrapper.parentNode) {
        outerWrapper.parentNode.removeChild(outerWrapper);
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

      downloadDataUrlAsPng(dataUrl, filename);
      setSnapshotImageUrl(dataUrl);
      setIsSnapshotModalOpen(true);
      setCopiedToast("Đã chụp hình toàn bộ thẻ bài thành công!");
      setTimeout(() => setCopiedToast(null), 3500);
    } catch (err) {
      console.error("Lỗi khi chụp hình thẻ bài:", err);
      setCopiedToast("Chưa thể chụp ảnh thẻ bài, vui lòng thử lại!");
      setTimeout(() => setCopiedToast(null), 3500);
    } finally {
      // 7. Khôi phục lại trạng thái vị trí cuộn ban đầu
      if (requestTickRef.current) {
        requestTickRef.current();
      }
      setIsCapturingSnapshot(false);
    }
  }, [cards, mode, isCapturingSnapshot]);

  /* ── Chuyển chế độ và cuộn mượt xuống khu vực trải bài ── */
  const handleSwitchModeAndScroll = useCallback((newMode: SpreadMode, isRitual: boolean = false) => {
    setIsRitualCompleted(isRitual);
    setMode(newMode);
    if (newMode === "thap_tinh") {
      setIsCard2Reversed(Math.random() < 0.5);
    }
    setCards(drawCardsForMode(newMode));
    setTimeout(() => {
      requestTickRef.current();
    }, 50);
    const sec = document.getElementById("destiny-cards");
    if (sec) {
      sec.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  /* ── Rút lại bài cho chế độ hiện tại và cuộn mượt xuống khu vực trải bài ── */
  const handleShuffleCardsAndScroll = useCallback((isRitual: boolean = false) => {
    setIsRitualCompleted(isRitual);
    if (mode === "thap_tinh") {
      setIsCard2Reversed(Math.random() < 0.5);
    }
    setCards(drawCardsForMode(mode));
    setTimeout(() => {
      requestTickRef.current();
    }, 50);
    const sec = document.getElementById("destiny-cards");
    if (sec) {
      sec.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [mode]);

  /* ── Nhấn Bắt đầu Bốc Quẻ: Random bốc các trận pháp khác nhau và cuộn mượt xuống khu vực trải bài ── */
  const handleStartDivinationOrShuffle = useCallback(() => {
    setIsRitualCompleted(false);
    // Luôn chọn ngẫu nhiên một trận pháp khác với trận pháp hiện tại để mỗi lần bấm luôn bốc một trận pháp mới lạ
    const availableModes = SPREAD_MODES.filter((m) => m !== mode);
    const randomMode =
      availableModes.length > 0
        ? availableModes[Math.floor(Math.random() * availableModes.length)]
        : SPREAD_MODES[Math.floor(Math.random() * SPREAD_MODES.length)];

    setMode(randomMode);
    if (randomMode === "thap_tinh") {
      setIsCard2Reversed(Math.random() < 0.5);
    }
    setCards(drawCardsForMode(randomMode));
    setTimeout(() => {
      requestTickRef.current();
    }, 50);

    const sec = document.getElementById("destiny-cards");
    if (sec) {
      sec.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    const spreadName = SPREAD_MODE_NAMES[randomMode] || "Trận Pháp";
    setCopiedToast(`🔮 Đã bốc ngẫu nhiên: ${spreadName}`);
    setTimeout(() => setCopiedToast(null), 3500);
  }, [mode]);

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
          1. STICKY HEADER – IDENTICAL TO YILORE with CỬU NHỊ LOGO
          ══════════════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-[110] flex h-16 shrink-0 items-center justify-between border-b border-stone-200 bg-white/95 px-4 backdrop-blur-sm sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <a
            className="flex min-w-0 flex-1 items-center gap-2.5 font-semibold text-stone-900 sm:gap-3 cursor-pointer no-underline"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            {/* Logo Cửu Nhị */}
            <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-2xl bg-zinc-950 flex items-center justify-center border border-[#C4963E]/40 shadow-sm">
              <BrandMark size={32} title="Cửu Nhị" />
            </span>
            <span className="min-w-0 truncate font-serif text-sm font-semibold sm:text-base sm:text-lg">
              I Ching Tarot
            </span>
          </a>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* Nút chụp hình thẻ bài: Tự động căn chỉnh & chụp trọn vẹn toàn bộ trải bài */}
          <button
            type="button"
            onClick={handleCaptureCardsSnapshot}
            disabled={isCapturingSnapshot}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-800 hover:text-amber-950 transition px-3 py-1.5 rounded-full bg-white hover:bg-amber-50 border border-stone-200/90 hover:border-amber-400/80 cursor-pointer shadow-xs active:scale-95 disabled:opacity-60"
            title="Tự động căn chụp đầy đủ toàn bộ thẻ bài đang trải"
          >
            {isCapturingSnapshot ? (
              <>
                <span className="inline-block animate-spin text-sm">⏳</span>
                <span className="hidden xs:inline sm:inline">Đang chụp...</span>
              </>
            ) : (
              <>
                <Camera className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden xs:inline sm:inline">Chụp hình thẻ bài</span>
                <span className="xs:hidden sm:hidden">Chụp hình</span>
              </>
            )}
          </button>

          {/* Ngôn ngữ & Đăng nhập / Tài khoản Cửu Nhị */}
          <div className="flex items-center gap-1 rounded-full border border-stone-200/90 bg-stone-50/95 px-1 py-1 shadow-sm backdrop-blur-sm sm:gap-1.5 sm:px-1.5">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-stone-200/80 bg-white text-stone-600 transition hover:bg-stone-50"
                aria-label="Language"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 22a10 10 0 100-20 10 10 0 000 20zM2 12h20" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M12 2a15 15 0 000 20M12 2a15 15 0 010 20" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </button>
              {isLangMenuOpen && (
                <ul className="absolute right-0 z-[120] mt-1 min-w-[10.5rem] rounded-xl border border-stone-200 bg-white py-1 shadow-lg text-left">
                  <li>
                    <a className="block px-3 py-2 text-sm bg-amber-50 text-amber-900 font-semibold" href="#">
                      🇻🇳 Tiếng Việt
                    </a>
                  </li>
                  <li>
                    <a className="block px-3 py-2 text-sm text-stone-700 hover:bg-stone-50" href="#">
                      🇬🇧 English
                    </a>
                  </li>
                  <li>
                    <a className="block px-3 py-2 text-sm text-stone-700 hover:bg-stone-50" href="#">
                      🇹🇼 繁體中文
                    </a>
                  </li>
                </ul>
              )}
            </div>

            {currentUser ? (
              <div className="flex items-center gap-1 sm:gap-1.5">
                <button
                  type="button"
                  id="btn-user-cuunhi-badge"
                  onClick={() => onEnterApp("divination")}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full bg-stone-900 px-3 text-xs font-semibold text-white transition hover:bg-stone-800 shadow-sm cursor-pointer"
                  title="Nhấn để vào đài bốc quẻ Cửu Nhị"
                >
                  <span className="text-[#C4963E]">☯</span>
                  <span className="max-w-[100px] truncate">{currentUser.name}</span>
                  {currentUser.isAdmin && (
                    <span className="text-[10px] bg-[#C4963E] text-stone-950 font-bold px-1.5 py-0.5 rounded-full">Admin</span>
                  )}
                </button>
                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="inline-flex h-9 items-center justify-center rounded-full px-2.5 text-xs font-medium text-stone-500 hover:text-stone-900 hover:bg-stone-200/60 transition cursor-pointer"
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
                className="inline-flex h-9 min-w-[4.75rem] shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-black px-3.5 text-xs font-semibold text-white transition hover:bg-zinc-800 sm:min-w-[5.25rem] sm:text-sm cursor-pointer shadow-sm"
              >
                Đăng nhập
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════════
          2. HERO SECTION – PRESERVED FROM USER SCREENSHOT with CỬU NHỊ LOGO
          ══════════════════════════════════════════════════════════════════ */}
      <div id="landing-scroll" className="relative isolate w-full">
        <section aria-label="首屏" className="relative isolate min-h-[100dvh] w-full overflow-x-visible overflow-y-hidden pt-[4.5rem]">
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
          <div className="relative z-[50] mx-auto flex min-h-[calc(100dvh-4.5rem)] w-full max-w-7xl flex-col items-stretch px-5 sm:px-8 max-lg:items-center max-lg:justify-between max-lg:gap-2 max-lg:pt-0 max-lg:pb-[max(1rem,env(safe-area-inset-bottom))] lg:grid lg:min-h-[calc(100dvh-4.5rem)] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:gap-10 lg:px-10 xl:gap-14 xl:px-14">
            {/* ── CỘT TRÁI: GIỮ NGUYÊN NỘI DUNG ẢNH TRÊN + THAY LOGO CỬU NHỊ ── */}
            <div className="order-1 flex w-full min-w-0 flex-col items-center text-center pointer-events-auto max-lg:max-w-xl max-lg:shrink-0 max-lg:pt-0 lg:items-start lg:text-left lg:justify-center">
              {/* Tiêu đề Logo Cửu Nhị + "I Ching Tarot" */}
              <h1 className="mb-2 text-3xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:mb-5 lg:text-6xl xl:text-7xl">
                <span className="mb-2 flex items-end justify-center gap-3 lg:mb-4 lg:justify-start">
                  {/* Container bo góc đậm chất skeuomorphic chứa Logo Cửu Nhị */}
                  <span
                    className="relative flex items-center justify-center h-14 w-14 shrink-0 overflow-hidden rounded-2xl sm:h-20 sm:w-20 shadow-2xl"
                    style={{
                      background: "linear-gradient(145deg, #1c1a22 0%, #0d0c11 100%)",
                      border: "1px solid rgba(196,150,62,0.45)",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.5), 0 0 24px rgba(196,150,62,0.22)",
                    }}
                  >
                    <BrandMark size={56} className="shrink-0" title="Cửu Nhị · Kinh Dịch" />
                  </span>
                  <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
                    I Ching Tarot
                  </span>
                </span>
              </h1>

              {/* Dòng chữ phụ 1 & 2 đúng nguyên bản ảnh */}
              <p className="mb-0 max-w-xl text-sm leading-relaxed sm:text-lg lg:mb-8 lg:text-xl" style={{ color: "rgba(255,255,255,0.7)" }}>
                <span className="text-lg sm:text-2xl lg:text-3xl text-white/90 font-medium block mb-1">
                  Bốc bài Kinh Dịch, Tinh hoa Phương Đông
                </span>
                <span className="text-xs sm:text-sm lg:text-base text-white/50 block">
                  64 Quẻ Chu Dịch · 12 Trận Pháp · Lục Nhâm · Kỳ Môn · Thái Ất
                </span>
              </p>

              {/* Dải nút hành động Desktop (Bắt Đầu Bốc Quẻ + 64 Quẻ Kinh Dịch + Cụm nút hình thức gieo quẻ) */}
              <div className="hidden lg:flex w-full lg:w-auto flex-col items-start relative z-[55] mt-6">
                <div className="flex w-full max-w-xl flex-row items-stretch gap-3 lg:w-auto">
                  <button
                    type="button"
                    id="btn-hero-start-divination"
                    onClick={handleStartDivinationOrShuffle}
                    className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-base md:px-8 md:py-4 md:text-lg lg:flex-none lg:w-auto text-zinc-950 font-bold cursor-pointer transition hover:scale-[1.02] active:scale-[0.98] shadow-xl"
                    style={{
                      background: "linear-gradient(135deg,rgba(255,255,255,0.98) 0%,rgba(242,242,242,0.95) 100%)",
                      border: "1px solid rgba(255,255,255,0.9)",
                    }}
                    title="Nhấn để ngẫu nhiên bốc các trận pháp khác nhau (Đơn Quẻ, Âm Dương, Tam Tài, Ngũ Hành, Thất Tinh, Thập Tinh, Tháp La)"
                  >
                    <span className="text-xl">☯</span>
                    <span className="truncate">Bắt Đầu Bốc Quẻ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.open(getHexagramsUrl(), "_blank", "noopener,noreferrer")}
                    className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-base md:px-8 md:py-4 md:text-lg lg:flex-none lg:w-auto text-white font-semibold cursor-pointer transition hover:scale-[1.02] hover:bg-white/15 active:scale-[0.98]"
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.38)",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <span className="text-xl">📖</span>
                    <span className="truncate">64 Quẻ Kinh Dịch</span>
                  </button>
                </div>


              </div>

              {/* Dải số liệu thống kê (Stats: 64 Quẻ, 384 Hào, 12 Trận Pháp, 9+ Phương Pháp) */}
              <div
                className="mt-6 flex flex-wrap gap-8 border-t border-white/15 pt-5 text-left w-full justify-center lg:justify-start"
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

            {/* ── CỘT PHẢI: HERO CARD ANCHOR (Điểm neo cho xấp bài ở Hero) ── */}
            <div className="order-2 pointer-events-none relative flex w-full min-h-0 min-w-0 flex-1 items-center justify-center max-lg:min-h-[22vh] max-lg:max-h-[28vh] lg:min-h-0 lg:max-h-none lg:flex-none lg:px-2 xl:px-4">
              <div className="flex items-center justify-center">
                <div
                  ref={heroAnchorRef}
                  id="hero-card-anchor"
                  className="pointer-events-none h-48 w-32 shrink-0 rounded-2xl sm:h-[272px] sm:w-44 md:h-72 md:w-48 opacity-0"
                  aria-hidden="true"
                />
              </div>
            </div>

            {/* Dải nút hành động Mobile (Bắt Đầu Bốc Quẻ + 64 Quẻ + Cụm nút hình thức gieo quẻ) */}
            <div id="hero-mobile-actions" className="order-3 flex w-full max-w-xl shrink-0 flex-col items-center gap-2 pointer-events-auto max-lg:pt-2 lg:hidden relative z-[55]">
              <div className="flex w-full max-w-xl flex-row items-stretch gap-2">
                <button
                  type="button"
                  id="btn-hero-mobile-start-divination"
                  onClick={handleStartDivinationOrShuffle}
                  className="flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-2xl px-3 py-3 text-sm font-semibold sm:gap-2 sm:px-6 sm:py-3.5 sm:text-base text-zinc-950 shadow-lg cursor-pointer transition active:scale-[0.98]"
                  style={{
                    background: "linear-gradient(135deg,rgba(255,255,255,0.98) 0%,rgba(242,242,242,0.95) 100%)",
                    border: "1px solid rgba(255,255,255,0.9)",
                  }}
                  title="Nhấn để ngẫu nhiên bốc các trận pháp khác nhau (Đơn Quẻ, Âm Dương, Tam Tài, Ngũ Hành, Thất Tinh, Thập Tinh, Tháp La)"
                >
                  <span className="text-base sm:text-lg">☯</span>
                  <span className="truncate">Bắt Đầu Bốc Quẻ</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.open(getHexagramsUrl(), "_blank", "noopener,noreferrer")}
                  className="flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-2xl px-3 py-3 text-sm font-semibold sm:gap-2 sm:px-6 sm:py-3.5 sm:text-base text-white cursor-pointer transition active:scale-[0.98]"
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.38)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <span className="text-base sm:text-lg">📖</span>
                  <span className="truncate">64 Quẻ</span>
                </button>
              </div>


            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            3. SECTION 2: DESTINY CARDS – 100% IDENTICAL TO YILORE
            ══════════════════════════════════════════════════════════════════ */}
        <section
          id="destiny-cards"
          aria-label="命运卡牌"
          className="relative w-full bg-white px-5 pt-12 pb-36 sm:px-8 sm:pt-20 sm:pb-52 min-h-[95vh] sm:min-h-[110vh] overflow-hidden flex flex-col justify-between"
        >
          {/* Lưới tọa độ ngầm mờ ảo */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.055]"
            style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,0.45) 1px,transparent 1px),
                                linear-gradient(90deg,rgba(0,0,0,0.45) 1px,transparent 1px)`,
              backgroundSize: "48px 48px",
            }}
          />

          {/* Tiêu đề thanh nhã, giữ vị trí tự nhiên phía trên các lá bài để không bao giờ bị lá bài che khuất */}
          <div className="relative z-[38] mx-auto max-w-4xl px-4 pt-4 pb-4 text-center sm:px-0 sm:pt-6 sm:pb-6">
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-[#C4963E] text-xs font-semibold mb-3 tracking-widest uppercase">
                <span>✦</span>
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
                <span>✦</span>
              </div>
              <h2 className="mb-3 text-3xl font-bold text-zinc-900 sm:text-5xl lg:text-6xl tracking-tight font-serif">
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
              <p className="mx-auto max-w-2xl text-base leading-relaxed text-zinc-500 sm:text-lg">
                {mode === "that_tinh" ? (
                  <>
                    Khảo sát toàn diện 7 phương diện: Quá khứ, Bản thân hiện tại, Diễn biến, Gợi ý chiến lược, Kết quả, Ngoại cảnh và Điểm mù bản thân.
                  </>
                ) : mode === "thap_tinh" ? (
                  <>
                    Tâm điểm thập tự kết hợp 10 vị thế thời vận.
                    <span className="font-semibold text-amber-700"> Lá thứ 2: {isCard2Reversed ? "Chiều Ngược (Trở Ngại)" : "Chiều Xuôi (Hỗ Trợ)"}</span> (bấm vào lá hoặc nút để đổi chiều).
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

          {/* Điểm neo cho các lá bài xòe ra ở giữa phần trắng – Khoảng trắng kéo dài rộng rãi */}
          <div className={`flex items-center justify-center pt-4 pb-4 ${mode === "that_tinh" || mode === "thap_tinh" ? "min-h-[660px] sm:min-h-[740px] md:min-h-[780px]" : "min-h-[540px] sm:min-h-[580px]"}`}>
            <div
              ref={destinyAnchorRef}
              id="destiny-card-anchor"
              className="pointer-events-none h-56 w-36 shrink-0 rounded-2xl sm:h-[272px] sm:w-44 md:h-72 md:w-48 opacity-0"
              aria-hidden="true"
            />
          </div>

          {/* Chú thích gợi ý tương tác đặt riêng biệt phía dưới xa, hoàn toàn không chạm hay che vào đáy lá bài */}
          <div className="mt-6 mb-10 text-center pointer-events-auto">
            <p className="text-xs sm:text-sm text-zinc-400 font-sans tracking-wide">
              ✦ Nhấp vào từng lá bài để tra cứu quẻ tượng, hào từ & lời giải AI ✦
            </p>
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
        style={{ opacity: 1 }}
      >
        <div
          ref={stageRef}
          id="cards-stage"
          className={`relative w-full max-w-[min(1240px,96vw)] overflow-visible will-change-transform ${
            mode === "that_tinh" || mode === "thap_tinh"
              ? "h-[min(74vh,740px)]"
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
              {/* Nhãn vị trí trận pháp phía trên lá bài */}
              {card.positionLabel && (
                <div
                  className="absolute -top-8 sm:-top-9 left-1/2 -translate-x-1/2 whitespace-nowrap text-center z-40 pointer-events-auto select-none"
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
          5. SECTION 3: FEATURES SECTION – 100% IDENTICAL TO YILORE
          ══════════════════════════════════════════════════════════════════ */}
      <section
        ref={featuresSecRef}
        id="features-section"
        className="relative py-24 sm:py-36 px-5 sm:px-8 bg-white border-t border-zinc-100 overflow-hidden"
      >
        {/* Họa tiết núi vẽ mountain.svg ở góc trái dưới */}
        <div className="pointer-events-none absolute left-0 bottom-20 z-[1] opacity-95">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Cột trái: Văn bản tính năng & 3 dấu chấm vàng */}
            <div>
              <p className="text-sm font-medium tracking-[0.25em] uppercase mb-6 text-[#C4963E]">
                AI × KINH DỊCH × HUYỀN HỌC PHƯƠNG ĐÔNG
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 leading-tight mb-6">
                Mang trí tuệ cổ nhân vào<br />
                <span style={{ color: "#C4963E" }}>cuộc sống hôm nay</span>
              </h2>
              <p className="text-base sm:text-lg leading-relaxed mb-10 text-zinc-500">
                Khi bạn cảm thấy bế tắc trong sự nghiệp, tình cảm hay những ngã rẽ cuộc đời,
                I Ching Tarot kết hợp phương pháp chiêm bốc cổ truyền và AI để chuyển hóa
                sự phức tạp thành hướng dẫn rõ ràng, có thể hành động.
              </p>

              <div className="space-y-4 mb-10">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-[rgba(196,150,62,0.15)]">
                    <div className="w-2 h-2 rounded-full" style={{ background: "#C4963E" }} />
                  </div>
                  <span className="text-base text-zinc-600">
                    Luận giải AI: hướng dẫn tập trung, sắc sảo cho từng câu hỏi cụ thể của bạn
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-[rgba(196,150,62,0.15)]">
                    <div className="w-2 h-2 rounded-full" style={{ background: "#C4963E" }} />
                  </div>
                  <span className="text-base text-zinc-600">
                    Đa dạng phương pháp: Bốc bài, Xăm Khổng Minh, Cỏ Thi, 3 Đồng Xu, Mai Hoa, Lục Nhâm
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-[rgba(196,150,62,0.15)]">
                    <div className="w-2 h-2 rounded-full" style={{ background: "#C4963E" }} />
                  </div>
                  <span className="text-base text-zinc-600">
                    12 trận pháp trải bài từ đơn giản đến chuyên sâu (Thất Tinh, Cửu Cung, Thập Nhị Cung)
                  </span>
                </div>
              </div>

              {/* Nút Use on web đen nguyên bản Yilore */}
              <button
                type="button"
                id="btn-use-on-web"
                onClick={() => onEnterApp("divination")}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-white font-semibold cursor-pointer transition hover:scale-[1.03] active:scale-[0.98] shadow-lg"
                style={{
                  background: "linear-gradient(135deg,#0B0B0D 0%,#17181C 55%,#252830 100%)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  boxShadow: "0 14px 36px rgba(0,0,0,0.35)",
                }}
              >
                <span>Bắt đầu ngay</span>
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>

              {/* Cụm nút chọn hình thức gieo quẻ & thao tác (Chuyển xuống dưới Bắt đầu ngay) */}
              <div className="mt-8 pt-6 border-t border-zinc-200/80 flex flex-col gap-2.5 max-w-xl">
                {/* Hàng 1: 1 Lá, 2 Lá, 3 Lá, 5 Lá */}
                <div className="flex flex-wrap items-center gap-2">
                  <RitualHoldButton
                    id="hero-mode-1"
                    active={mode === "1_single"}
                    onClick={(isRitual) => handleSwitchModeAndScroll("1_single", isRitual)}
                    className={`flex items-center justify-center px-4 py-2 rounded-full text-xs transition cursor-pointer shadow-sm ${
                      mode === "1_single"
                        ? "bg-zinc-950 text-[#C4963E] border-2 border-[#C4963E] font-bold shadow-md shadow-[#C4963E]/25 scale-[1.03]"
                        : "bg-white hover:bg-stone-50 text-zinc-800 hover:text-zinc-950 border border-stone-300 font-medium shadow-xs hover:scale-[1.02]"
                    }`}
                    title="Kính Thiên, Kính Địa, Kính Nhân (1 Lá - Đơn Quẻ)"
                  >
                    1 Lá (Đơn Quẻ)
                  </RitualHoldButton>

                  <RitualHoldButton
                    id="hero-mode-2"
                    active={mode === "1_to_2"}
                    onClick={(isRitual) => handleSwitchModeAndScroll("1_to_2", isRitual)}
                    className={`flex items-center justify-center px-4 py-2 rounded-full text-xs transition cursor-pointer shadow-sm ${
                      mode === "1_to_2"
                        ? "bg-zinc-950 text-[#C4963E] border-2 border-[#C4963E] font-bold shadow-md shadow-[#C4963E]/25 scale-[1.03]"
                        : "bg-white hover:bg-stone-50 text-zinc-800 hover:text-zinc-950 border border-stone-300 font-medium shadow-xs hover:scale-[1.02]"
                    }`}
                    title="Kính Thiên, Kính Địa, Kính Nhân (2 Lá - Âm Dương)"
                  >
                    2 Lá (Âm Dương)
                  </RitualHoldButton>

                  <RitualHoldButton
                    id="hero-mode-3"
                    active={mode === "1_to_3"}
                    onClick={(isRitual) => handleSwitchModeAndScroll("1_to_3", isRitual)}
                    className={`flex items-center justify-center px-4 py-2 rounded-full text-xs transition cursor-pointer shadow-sm ${
                      mode === "1_to_3"
                        ? "bg-zinc-950 text-[#C4963E] border-2 border-[#C4963E] font-bold shadow-md shadow-[#C4963E]/25 scale-[1.03]"
                        : "bg-white hover:bg-stone-50 text-zinc-800 hover:text-zinc-950 border border-stone-300 font-medium shadow-xs hover:scale-[1.02]"
                    }`}
                    title="Kính Thiên, Kính Địa, Kính Nhân (3 Lá - Tam Tài)"
                  >
                    3 Lá (Tam Tài)
                  </RitualHoldButton>

                  <RitualHoldButton
                    id="hero-mode-5"
                    active={mode === "3_to_5"}
                    onClick={(isRitual) => handleSwitchModeAndScroll("3_to_5", isRitual)}
                    className={`flex items-center justify-center px-4 py-2 rounded-full text-xs transition cursor-pointer shadow-sm ${
                      mode === "3_to_5"
                        ? "bg-zinc-950 text-[#C4963E] border-2 border-[#C4963E] font-bold shadow-md shadow-[#C4963E]/25 scale-[1.03]"
                        : "bg-white hover:bg-stone-50 text-zinc-800 hover:text-zinc-950 border border-stone-300 font-medium shadow-xs hover:scale-[1.02]"
                    }`}
                    title="Kính Thiên, Kính Địa, Kính Nhân (5 Lá - Ngũ Hành)"
                  >
                    5 Lá (Ngũ Hành)
                  </RitualHoldButton>
                </div>

                {/* Hàng 2: Thất Tinh (7 Lá), Thập Tinh (10 Lá), Tháp La Kinh Dịch */}
                <div className="flex flex-wrap items-center gap-2">
                  <RitualHoldButton
                    id="hero-mode-that-tinh"
                    active={mode === "that_tinh"}
                    onClick={(isRitual) => handleSwitchModeAndScroll("that_tinh", isRitual)}
                    className={`flex items-center justify-center px-4 py-2 rounded-full text-xs transition cursor-pointer shadow-sm ${
                      mode === "that_tinh"
                        ? "bg-zinc-950 text-[#C4963E] border-2 border-[#C4963E] font-bold shadow-md shadow-[#C4963E]/25 scale-[1.03]"
                        : "bg-white hover:bg-stone-50 text-zinc-800 hover:text-zinc-950 border border-stone-300 font-medium shadow-xs hover:scale-[1.02]"
                    }`}
                    title="Trận Pháp Thất Tinh (7 Lá): Khảo sát 7 góc độ toàn diện cuộc sống"
                  >
                    Thất Tinh Trận (7 Lá)
                  </RitualHoldButton>

                  <RitualHoldButton
                    id="hero-mode-thap-tinh"
                    active={mode === "thap_tinh"}
                    onClick={(isRitual) => handleSwitchModeAndScroll("thap_tinh", isRitual)}
                    className={`flex items-center justify-center px-4 py-2 rounded-full text-xs transition cursor-pointer shadow-sm ${
                      mode === "thap_tinh"
                        ? "bg-zinc-950 text-[#C4963E] border-2 border-[#C4963E] font-bold shadow-md shadow-[#C4963E]/25 scale-[1.03]"
                        : "bg-white hover:bg-stone-50 text-zinc-800 hover:text-zinc-950 border border-stone-300 font-medium shadow-xs hover:scale-[1.02]"
                    }`}
                    title="Trận Pháp Thập Tinh (10 Lá): Đỉnh cao Celtic Cross - Lá 2: Xuôi Hỗ Trợ / Ngược Trở Ngại"
                  >
                    Thập Tinh Trận (10 Lá)
                  </RitualHoldButton>

                  <RitualHoldButton
                    id="hero-mode-thap-la"
                    active={mode === "thap_la"}
                    onClick={(isRitual) => handleSwitchModeAndScroll("thap_la", isRitual)}
                    className={`flex items-center justify-center px-4 py-2 rounded-full text-xs transition cursor-pointer shadow-sm ${
                      mode === "thap_la"
                        ? "bg-zinc-950 text-[#C4963E] border-2 border-[#C4963E] font-bold shadow-md shadow-[#C4963E]/25 scale-[1.03]"
                        : "bg-white hover:bg-stone-50 text-zinc-800 hover:text-zinc-950 border border-stone-300 font-medium shadow-xs hover:scale-[1.02]"
                    }`}
                    title="Tháp La Kinh Dịch: Quẻ Chủ & Quẻ Biến Song Song Trên - Dưới & Dải Hào Từ Biến Dịch (384 Hào)"
                  >
                    Tháp La Kinh Dịch
                  </RitualHoldButton>
                </div>

                {/* Hàng 3: Thao tác (Rút lại, Chép cho AI & Nút đổi chiều Lá 2 khi ở Thập Tinh Trận) */}
                <div className="flex flex-wrap items-center gap-2">
                  {mode === "thap_tinh" && (
                    <button
                      type="button"
                      onClick={handleToggleCard2Reversed}
                      className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition cursor-pointer shadow-sm active:scale-95 ${
                        isCard2Reversed
                          ? "bg-rose-950 text-rose-200 border-2 border-rose-500 shadow-rose-950/40"
                          : "bg-emerald-950 text-emerald-200 border-2 border-emerald-500 shadow-emerald-950/40"
                      }`}
                      title="Bấm để đổi thế Lá thứ 2: Chiều Xuôi (Hỗ Trợ) ↔ Chiều Ngược (Trở Ngại)"
                    >
                      <span className="text-amber-300">🔄</span>
                      <span>Lá 2: {isCard2Reversed ? "Ngược (Trở Ngại)" : "Xuôi (Hỗ Trợ)"}</span>
                    </button>
                  )}

                  <RitualHoldButton
                    id="hero-action-shuffle"
                    active={false}
                    onClick={(isRitual) => handleShuffleCardsAndScroll(isRitual)}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-[#fef8ed] hover:bg-[#fcf1db] text-[#7c5516] border border-amber-300 transition cursor-pointer shadow-sm active:scale-95"
                    title="Kính Thiên, Kính Địa, Kính Nhân (Rút lại quẻ khác)"
                  >
                    <span className="text-sm">🎲</span>
                    <span>Rút lại</span>
                  </RitualHoldButton>

                  <div className="relative inline-flex items-center">
                    <button
                      type="button"
                      onClick={handleCopyCardsForAI}
                      className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition cursor-pointer shadow-sm active:scale-95 select-none ${
                        copiedAI
                          ? "bg-emerald-600 text-white border border-emerald-500 shadow-md scale-[1.02]"
                          : isRitualCompleted
                          ? "bg-gradient-to-r from-amber-500/20 via-yellow-400/25 to-amber-500/20 hover:from-amber-500/30 hover:to-amber-500/30 text-amber-950 dark:text-amber-200 border-2 border-amber-500 shadow-md shadow-amber-500/20 ring-1 ring-amber-400/50"
                          : "bg-[#fbf4e6] hover:bg-[#f6ebd1] text-[#7c5516] border border-[#c4963e]/50 shadow-sm"
                      }`}
                      title={
                        isRitualCompleted
                          ? "✨ Đã đắc pháp Kính Thiên, Kính Địa, Kính Nhân: Bấm để sao chép 100% bách khoa toàn thư (Cửu Nhị Luận Giải, Chiêm đoán 4 phương diện & FAQ)"
                          : "Sao chép thông tin các lá bài tiêu chuẩn cho AI (Nhấn & giữ 3 lần Kính Thiên, Địa, Nhân để mở khóa trích dẫn 100% bách khoa toàn thư)"
                      }
                    >
                      <span className="text-sm">
                        {copiedAI ? "✓" : isRitualCompleted ? "✨" : "📋"}
                      </span>
                      <span>
                        {copiedAI
                          ? "Đã chép cho AI!"
                          : isRitualCompleted
                          ? "Chép Toàn Thư cho AI"
                          : "Chép cho AI"}
                      </span>
                    </button>
                    {isRitualCompleted && (
                      <span className="absolute -top-3 -right-2 bg-gradient-to-r from-amber-600 to-yellow-600 text-[9px] font-bold text-white px-2 py-0.5 rounded-full shadow-md pointer-events-none animate-pulse">
                        ✦ Đắc Pháp
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Cột phải: ĐIỂM NEO LÁ BÀI (Xấp bài sẽ gom lại và trượt xuống yên vị tại đây) */}
            <div className="flex justify-center lg:justify-end items-center">
              <div className="relative flex items-center justify-center w-full min-h-[380px] sm:min-h-[460px] lg:min-h-[520px] max-w-[540px]">
                <div
                  ref={featuresAnchorRef}
                  id="features-card-anchor"
                  className="pointer-events-none h-56 w-36 shrink-0 rounded-2xl sm:h-[272px] sm:w-44 md:h-72 md:w-48 opacity-0"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
        </div>
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
          <button type="button" onClick={() => setIsOracleOpen(true)} className="hover:text-white transition cursor-pointer">
            🪙 Tung 3 Đồng Xu
          </button>
          <button type="button" onClick={() => setIsLifeConfigOpen(true)} className="hover:text-white transition cursor-pointer">
            🖨️ Phiếu Nhân Sinh
          </button>
          <button type="button" onClick={() => onEnterApp("pricing")} className="hover:text-white transition cursor-pointer">
            Báo Giá
          </button>
        </div>

        <p className="text-[11px] text-stone-500 m-0">
          Kinh Dịch Chiêm Bốc · 周易塔羅 · Trí Tuệ Cổ Nhân 5.000 Năm
        </p>
      </footer>

      {/* ══════════════════════════════════════════════════════════════════
          7. MODAL: CHI TIẾT THẺ BÀI (MẶT TRƯỚC & MẶT SAU)
          ══════════════════════════════════════════════════════════════════ */}
      {selectedCard && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
          onClick={() => setSelectedCard(null)}
        >
          <div
            className="relative w-full max-w-lg sm:max-w-xl my-auto rounded-3xl bg-[#16171B] border border-[#C4963E]/40 shadow-2xl p-5 sm:p-6 text-center text-stone-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedCard(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-stone-300 hover:text-white transition cursor-pointer z-10"
              title="Đóng bảng chi tiết"
            >
              ✕
            </button>

            {/* Bộ chuyển đổi góc nhìn: Cả 2 mặt / Mặt trước / Mặt sau */}
            <div className="flex items-center justify-center gap-1.5 mb-4">
              <button
                type="button"
                onClick={() => setModalCardView("both")}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                  modalCardView === "both"
                    ? "bg-[#C4963E] text-stone-950 font-bold shadow-md"
                    : "bg-white/10 text-stone-300 hover:bg-white/15"
                }`}
              >
                ✦ Cả 2 mặt
              </button>
              <button
                type="button"
                onClick={() => setModalCardView("front")}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                  modalCardView === "front"
                    ? "bg-[#C4963E] text-stone-950 font-bold shadow-md"
                    : "bg-white/10 text-stone-300 hover:bg-white/15"
                }`}
              >
                Mặt trước
              </button>
              <button
                type="button"
                onClick={() => setModalCardView("back")}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                  modalCardView === "back"
                    ? "bg-[#C4963E] text-stone-950 font-bold shadow-md"
                    : "bg-white/10 text-stone-300 hover:bg-white/15"
                }`}
              >
                Mặt sau
              </button>
            </div>

            {/* Khung hiển thị các lá bài (Full hình 100% không bị crop xén) */}
            {modalCardView === "both" ? (
              <div className="flex items-center justify-center gap-3 sm:gap-6 mb-4">
                {/* Khung Mặt Trước */}
                <div className="flex flex-col items-center">
                  <span className="text-[11px] font-semibold text-amber-300/80 mb-1.5 flex items-center gap-1">
                    <span className="text-amber-400">✦</span> Mặt Trước
                  </span>
                  <div
                    className={`relative rounded-2xl overflow-hidden shadow-2xl border border-[#C4963E]/50 bg-black/80 flex items-center justify-center p-1 group hover:border-amber-400 transition-transform duration-500 ${
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
                  <span className="text-[11px] font-semibold text-amber-300/80 mb-1.5 flex items-center gap-1">
                    <span className="text-amber-400">✦</span> Mặt Sau
                  </span>
                  <div
                    className="relative rounded-2xl overflow-hidden shadow-2xl border border-[#C4963E]/50 bg-black/80 flex items-center justify-center p-1 group hover:border-amber-400 transition"
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
              <div className="mx-auto flex flex-col items-center justify-center mb-4">
                <span className="text-[11px] font-semibold text-amber-300/80 mb-1.5 flex items-center gap-1">
                  <span className="text-amber-400">✦</span> {modalCardView === "front" ? "Mặt Trước" : "Mặt Sau"}
                </span>
                <div
                  className={`relative rounded-2xl overflow-hidden shadow-2xl border border-[#C4963E]/50 bg-black/80 flex items-center justify-center p-1 group hover:border-amber-400 transition-transform duration-500 ${
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
              <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold font-serif bg-amber-500/20 text-amber-300 border border-amber-500/40 tracking-wider">
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

            <div className="mb-2">
              <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#C4963E]/20 text-[#C4963E] border border-[#C4963E]/30 uppercase tracking-wider">
                {selectedCard.type === "yao" ? "384 Hào Từ Chu Dịch" : "64 Quẻ Chu Dịch"}
              </span>
            </div>

            <span className="text-4xl text-[#C4963E] font-bold block mb-1">{selectedCard.symbol}</span>
            <h3 className="text-xl font-bold text-white mb-1">{selectedCard.name}</h3>
            <p className="text-xs text-stone-400 mb-3">{selectedCard.sub}</p>
            <p className="text-xs leading-relaxed text-stone-300 bg-white/5 rounded-xl p-3 text-left">
              {selectedCard.desc}
            </p>

            <div className="mt-5 flex flex-col sm:flex-row gap-2.5 justify-center">
              <button
                type="button"
                onClick={() => handleCopySingleCardForAI(selectedCard)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-semibold border transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md active:scale-95 ${
                  copiedSingle
                    ? "bg-emerald-600 text-white border-emerald-500"
                    : isRitualCompleted
                    ? "bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/60 ring-1 ring-amber-400/40"
                    : "bg-white/10 hover:bg-white/15 text-stone-200 hover:text-white border-white/20"
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
                className="flex-1 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#C4963E] to-[#E5B558] text-stone-950 font-bold text-xs hover:brightness-110 transition shadow-lg cursor-pointer flex items-center justify-center gap-2"
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
            className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#17181C] border border-[#C4963E]/40 shadow-2xl p-6 text-stone-200"
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
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#C4963E]/20 text-[#C4963E] mb-2 uppercase tracking-widest">
                I Ching Tarot Divination
              </span>
              <h2 className="text-2xl font-bold text-white mb-1">Phòng Gieo Quẻ Kinh Dịch AI</h2>
              <p className="text-xs text-stone-400">Tĩnh tâm nghĩ về câu hỏi và tung 3 đồng xu 6 lần để tạo quẻ.</p>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-stone-400 mb-1.5">Câu hỏi trong tâm:</label>
              <input
                type="text"
                value={oracleQuestion}
                onChange={(e) => setOracleQuestion(e.target.value)}
                placeholder="Ví dụ: Vận thế sự nghiệp tháng tới của tôi ra sao?..."
                className="w-full rounded-xl bg-white/5 border border-white/15 px-4 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-[#C4963E]"
              />
            </div>

            {/* Sân tung 3 đồng xu */}
            <div className="rounded-2xl bg-black/40 border border-white/10 p-5 mb-5 text-center">
              <div className="flex justify-center items-center gap-6 my-3">
                {["乾", "通", "寶"].map((txt, i) => (
                  <div
                    key={i}
                    className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-amber-900 border-2 border-amber-600 shadow-xl text-lg select-none ${isFlipping ? "flipping" : ""}`}
                    style={{ background: "radial-gradient(circle, #f6d365 0%, #fda085 100%)" }}
                  >
                    {txt}
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
                  className="px-8 py-3 rounded-full font-bold text-zinc-950 transition-transform active:scale-95 shadow-xl cursor-pointer"
                  style={{ background: "linear-gradient(135deg, #FAD961 0%, #F76B1C 100%)" }}
                >
                  🪙 Tung Đồng Xu (Hào {coinsTossStep + 1}/6)
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
          9. MODAL: PHIẾU KIỂM ĐỊNH NHÂN SINH (LIFE CONFIG THERMAL RECEIPT)
          ══════════════════════════════════════════════════════════════════ */}
      {isLifeConfigOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
          onClick={() => setIsLifeConfigOpen(false)}
        >
          <div
            className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl bg-[#17181C] border border-[#C4963E]/40 shadow-2xl p-6 text-stone-200"
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
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#C4963E]/20 text-[#C4963E] mb-2 uppercase tracking-widest">
                Life Factory Config
              </span>
              <h2 className="text-2xl font-bold text-white mb-1">Hóa Đơn Cấu Hình Cuộc Đời</h2>
              <p className="text-xs text-stone-400">Xuất bản phiếu kiểm định phần cứng nguyên bản theo Tứ Trụ & Dịch Học.</p>
            </div>

            <div className="space-y-3 mb-5 text-xs">
              <div>
                <label className="block text-stone-400 mb-1">Ngày Xuất Xưởng (Dương Lịch):</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-white focus:outline-none focus:border-[#C4963E]"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1">Giờ Xuất Xưởng:</label>
                <select
                  value={birthHour}
                  onChange={(e) => setBirthHour(e.target.value)}
                  className="w-full rounded-xl bg-[#23252b] border border-white/15 px-3 py-2 text-white focus:outline-none focus:border-[#C4963E]"
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
                <label className="block text-stone-400 mb-1">Mẫu Hình / Giới Tính:</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="cfg-gender"
                      value="Nam"
                      checked={gender === "Nam"}
                      onChange={() => setGender("Nam")}
                      className="accent-[#C4963E]"
                    />
                    Nam (Yang Model)
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="cfg-gender"
                      value="Nữ"
                      checked={gender === "Nữ"}
                      onChange={() => setGender("Nữ")}
                      className="accent-[#C4963E]"
                    />
                    Nữ (Yin Model)
                  </label>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setReceiptGenerated(true)}
              className="w-full py-3 rounded-full font-bold text-zinc-950 transition-transform active:scale-95 shadow-xl mb-4 cursor-pointer"
              style={{ background: "linear-gradient(135deg, #FAD961 0%, #F76B1C 100%)" }}
            >
              🖨️ In Phiếu Kiểm Định Nhân Sinh
            </button>

            {receiptGenerated && (
              <div className="rounded-xl bg-[#fffef7] text-stone-900 p-5 font-mono text-xs shadow-2xl border-dashed border-2 border-stone-300">
                <div className="text-center border-b-2 border-stone-300 pb-2 mb-3">
                  <p className="font-bold text-xs tracking-widest uppercase">CỬU NHỊ LIFE FACTORY</p>
                  <p className="text-[10px] text-stone-600">CHỨNG NHẬN KIỂM ĐỊNH PHẦN CỨNG BẢN THỂ</p>
                  <p className="text-[9px] text-stone-400 mt-0.5">SN: CN-2026-8888</p>
                </div>
                <div className="space-y-1 mb-3 text-[11px]">
                  <div className="flex justify-between"><span>Model:</span><span className="font-bold">{gender === "Nam" ? "Nam (Càn Vi Thiên)" : "Nữ (Khôn Vi Địa)"}</span></div>
                  <div className="flex justify-between"><span>Ngày Sản Xuất:</span><span>{birthDate}</span></div>
                  <div className="flex justify-between"><span>Giờ Xuất Xưởng:</span><span>{birthHour}</span></div>
                  <div className="flex justify-between"><span>Bản Mệnh Ngũ Hành:</span><span className="font-bold text-amber-800">Bạch Lạp Kim (Vàng trong sáp)</span></div>
                  <div className="flex justify-between"><span>Hiệu Năng Vận Hành:</span><span className="font-bold text-emerald-700">98.5% (Tối Ưu)</span></div>
                </div>
                <div className="border-t border-stone-300 pt-2 mb-2 text-[10px] text-stone-700">
                  <p className="font-bold mb-0.5">※ Hướng Dẫn Vận Hành Phần Cứng:</p>
                  <p>Thiên bẩm có trực giác bén nhạy và tư duy chiến lược. Cần bảo dưỡng bằng giấc ngủ sâu, thiền định và giữ cho tâm trí không bị xao động bởi ngoại cảnh.</p>
                </div>
                <div className="text-center border-t-2 border-stone-300 pt-2 text-[8px] text-stone-500">
                  HÀNG XUẤT XƯỞNG MIỄN ĐỔI TRẢ · CẢM ƠN QUÝ KHÁCH
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal xem trước & tải ảnh chụp toàn bộ thẻ bài */}
      <ExportImageModal
        isOpen={isSnapshotModalOpen}
        onClose={() => setIsSnapshotModalOpen(false)}
        imageUrl={snapshotImageUrl}
        title="Ảnh Toàn Bộ Thẻ Bài Trải Trận"
        filename={`trai-bai-iching-tarot-${new Date().toISOString().slice(0, 10)}.png`}
      />

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
