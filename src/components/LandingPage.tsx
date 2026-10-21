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
import { BrandMark } from "./BrandMark";
import { NavTab } from "./Header";
import { HEXAGRAMS } from "../data/hexagrams";
import { AppUser } from "../services/authService";

export interface LandingPageProps {
  currentUser?: AppUser | null;
  onEnterApp: (tab?: NavTab) => void;
  onOpenAuthModal?: (mode?: "login" | "register" | "upgrade") => void;
  onLogout?: () => void;
}

const getHexagramsUrl = () => "/vi/hexagram";
const getBlogUrl = () => "/vi/blog";


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

export type SpreadMode = "1_single" | "1_to_2" | "1_to_3" | "3_to_5";

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
}

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
  const count = mode === "1_single" ? 1 : mode === "1_to_2" ? 2 : mode === "1_to_3" ? 3 : 5;
  const list: DynamicCardItem[] = [];
  const seen = new Set<string>();
  let attempts = 0;

  while (list.length < count && attempts < 50) {
    attempts++;
    const c = drawRandomCard();
    if (!seen.has(c.id)) {
      seen.add(c.id);
      list.push(c);
    }
  }
  return list;
}

const SPREAD_MODES: SpreadMode[] = ["3_to_5", "1_to_3", "1_to_2", "1_single"];

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

/* ─── Helper: Định dạng thông tin các lá bài để dán cho AI phân tích ─── */
/* Thứ tự: Trái trước phải sau (theo danh sách card), Trên trước dưới sau (Quẻ tượng -> Tên -> Ý nghĩa -> Lời giải) */
function formatSpreadForAI(cardsList: DynamicCardItem[], currentMode: SpreadMode): string {
  const getSpreadName = (m: SpreadMode) => {
    switch (m) {
      case "1_single": return "1 Lá (Đơn Quẻ Chí Tôn)";
      case "1_to_2": return "2 Lá (Âm Dương Đối Đãi)";
      case "1_to_3": return "3 Lá (Tam Tài: Quá Khứ - Hiện Tại - Tương Lai)";
      case "3_to_5": return "5 Lá (Ngũ Hành Tương Sinh Tương Khắc)";
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
  lines.push(`=== THÔNG TIN TRẢI BÀI KINH DỊCH (THỨ TỰ TỪ TRÁI SANG PHẢI) ===`);
  lines.push(`Trải bài: ${getSpreadName(currentMode)} | Số lượng: ${cardsList.length} lá\n`);

  cardsList.forEach((c, idx) => {
    const pos = getPositionLabel(idx, cardsList.length);
    lines.push(`----------------------------------------`);
    lines.push(`【${pos}】`);
    // Thứ tự thông tin: trên trước dưới sau (Quẻ tượng -> Tên -> Ý nghĩa -> Lời giải)
    lines.push(`• Quẻ tượng: ${c.symbol}`);
    lines.push(`• Tên: ${c.name}`);
    lines.push(`• Ý nghĩa: ${c.sub}`);
    lines.push(`• Lời giải: ${c.desc}`);
    lines.push("");
  });

  lines.push(`========================================`);
  lines.push(`[YÊU CẦU LUẬN GIẢI CHO AI]:`);
  lines.push(`Xin hãy phân tích trải bài Kinh Dịch trên theo đúng thứ tự từ trái sang phải:`);
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
  onClick: () => void;
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
        onClick();
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
    e.preventDefault();
    setShowHint(true);
    setTimeout(() => setShowHint(false), 1200);
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
      const factor = w < 380 ? 0.52 : w < 480 ? 0.60 : w < 640 ? 0.72 : w < 900 ? 0.85 : w < 1200 ? 0.95 : 1.05;
      const slots = slotRefs.current;
      const cardCount = cards.length;

      if (cardCount === 5 || mode === "3_to_5") {
        // ── CHẾ ĐỘ: 5 LÁ (NGŨ HÀNH) ──
        // Tùy thuộc vào kích thước màn hình mà các lá bài sắp xếp linh hoạt:
        // - Trên màn hình nhỏ/điện thoại (w < 860): Không đủ chỗ bày ngang 5 lá,
        //   nên 3 lá đầu ở hàng trên, 2 lá cuối cùng bên phải (Slot 3 & 4) nhảy xuống hàng dưới và căn giữa.
        // - Trên màn hình lớn (w >= 860): xòe đủ 5 lá thành 1 hàng ngang rộng rãi.
        // Khi kéo xuống Features (f=0): toàn bộ gôm lại thành 1 lá duy nhất tại Slot 2!

        const isSmallScreen = w < 860;
        const mobFactor = w < 380 ? 0.76 : w < 440 ? 0.88 : 1.0;
        const mobScale = w < 380 ? 0.82 : w < 440 ? 0.88 : 0.92;

        if (isSmallScreen) {
          // ── BỐ CỤC MOBILE / MÀN HÌNH NHỎ (Hàng trên 3 lá, Hàng dưới 2 lá) ──
          // Hàng 1 (Trên): Slot 0 (trái), Slot 1 (giữa), Slot 2 (phải)
          // Slot 0 (Trái trên)
          if (slots[0]) {
            const x0 = (-120 * f) * mobFactor;
            const y0 = -82 * f;
            const rot0 = -4.5 * f;
            slots[0].style.transform = `perspective(1200px) translate3d(${x0.toFixed(1)}px, ${y0.toFixed(1)}px, 0) rotate(${rot0.toFixed(1)}deg) scale(${mobScale})`;
            slots[0].style.opacity = f.toFixed(3);
            slots[0].style.pointerEvents = f > 0.25 ? "auto" : "none";
            slots[0].style.zIndex = "8";
          }
          // Slot 1 (Giữa trên): ở Hero nằm cận trái (-120px), khi xuống Destiny tiến vào giữa trên (x=0, y=-88px)
          if (slots[1]) {
            const heroX1 = -120 * (1 - g) * mobFactor;
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
            const destX2 = 120 * f * mobFactor;
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
            const heroX3 = 120 * (1 - g) * mobFactor;
            const destX3 = -68 * f * mobFactor;
            const x3 = heroX3 + destX3;
            const y3 = 108 * f;
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
            const x4 = (68 * f) * mobFactor;
            const y4 = 108 * f;
            const rot4 = 3 * f;
            slots[4].style.transform = `perspective(1200px) translate3d(${x4.toFixed(1)}px, ${y4.toFixed(1)}px, 0) rotate(${rot4.toFixed(1)}deg) scale(${mobScale})`;
            slots[4].style.opacity = f.toFixed(3);
            slots[4].style.pointerEvents = f > 0.25 ? "auto" : "none";
            slots[4].style.zIndex = "9";
          }
        } else {
          // ── BỐ CỤC DESKTOP (1 hàng ngang rộng rãi cả 5 lá) ──
          // Slot 0 (Cực Trái)
          if (slots[0]) {
            const x0 = (-460 * f) * factor;
            const y0 = 8 * f;
            const rot0 = -7 * f;
            slots[0].style.transform = `perspective(1200px) translate3d(${x0.toFixed(1)}px, ${y0.toFixed(1)}px, 0) rotate(${rot0.toFixed(1)}deg) scale(0.98)`;
            slots[0].style.opacity = f.toFixed(3);
            slots[0].style.pointerEvents = f > 0.25 ? "auto" : "none";
            slots[0].style.zIndex = "8";
          }
          // Slot 1 (Cận Trái): ở Hero x=-140, ở Destiny x=-230, ở Features gôm về 0
          if (slots[1]) {
            const heroX1 = -140 * (1 - g);
            const spreadX1 = -230 * f;
            const x1 = (heroX1 + spreadX1) * factor;
            const y1 = 3 * f;
            const rot1 = -3.5 * f;
            const sc1 = 1.02 + 0.02 * f;
            slots[1].style.transform = `perspective(1200px) translate3d(${x1.toFixed(1)}px, ${y1.toFixed(1)}px, 0) rotate(${rot1.toFixed(1)}deg) scale(${sc1.toFixed(3)})`;
            const op1 = g < 0.5 ? 1 : f;
            slots[1].style.opacity = op1.toFixed(3);
            slots[1].style.pointerEvents = f > 0.25 ? "auto" : "none";
            slots[1].style.zIndex = "10";
          }
          // Slot 2 (Trung Tâm): là lá trụ cột luôn hiển thị 1 lá uy nghi tại Features
          if (slots[2]) {
            slots[2].style.transform = `perspective(1200px) translate3d(0, 0, 26px) scale(1.10)`;
            slots[2].style.opacity = "1";
            slots[2].style.pointerEvents = "auto";
            slots[2].style.zIndex = "14";
          }
          // Slot 3 (Cận Phải): ở Hero x=140, ở Destiny x=230, ở Features gôm về 0
          if (slots[3]) {
            const heroX3 = 140 * (1 - g);
            const spreadX3 = 230 * f;
            const x3 = (heroX3 + spreadX3) * factor;
            const y3 = 3 * f;
            const rot3 = 3.5 * f;
            const sc3 = 1.02 + 0.02 * f;
            slots[3].style.transform = `perspective(1200px) translate3d(${x3.toFixed(1)}px, ${y3.toFixed(1)}px, 0) rotate(${rot3.toFixed(1)}deg) scale(${sc3.toFixed(3)})`;
            const op3 = g < 0.5 ? 1 : f;
            slots[3].style.opacity = op3.toFixed(3);
            slots[3].style.pointerEvents = f > 0.25 ? "auto" : "none";
            slots[3].style.zIndex = "10";
          }
          // Slot 4 (Cực Phải)
          if (slots[4]) {
            const x4 = (460 * f) * factor;
            const y4 = 8 * f;
            const rot4 = 7 * f;
            slots[4].style.transform = `perspective(1200px) translate3d(${x4.toFixed(1)}px, ${y4.toFixed(1)}px, 0) rotate(${rot4.toFixed(1)}deg) scale(0.98)`;
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
    window.addEventListener("scroll", requestTick, { passive: true });
    window.addEventListener("resize", requestTick, { passive: true });
    requestTick();

    return () => {
      window.removeEventListener("scroll", requestTick);
      window.removeEventListener("resize", requestTick);
    };
  }, [mode, cards]);

  /* ── Switch Mode Handler ── */
  const handleSwitchMode = (newMode: SpreadMode) => {
    setMode(newMode);
    setCards(drawCardsForMode(newMode));
    setTimeout(() => {
      requestTickRef.current();
    }, 50);
  };

  /* ── Shuffle Cards (Rút bài ngẫu nhiên mới từ 384 hào & 64 quẻ) ── */
  const handleShuffleCards = useCallback(() => {
    setCards(drawCardsForMode(mode));
    setTimeout(() => {
      requestTickRef.current();
    }, 50);
  }, [mode]);

  /* ── Sao chép toàn bộ trải bài cho AI (Thứ tự: Trái trước phải sau, Trên trước dưới sau) ── */
  const handleCopyCardsForAI = useCallback(async () => {
    const text = formatSpreadForAI(cards, mode);
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedAI(true);
      setCopiedToast("Đã chép thông tin các lá bài cho AI (trái sang phải, trên xuống dưới)!");
      setTimeout(() => setCopiedAI(false), 2500);
      setTimeout(() => setCopiedToast(null), 3200);
    }
  }, [cards, mode]);

  /* ── Sao chép 1 lá bài đơn lẻ cho AI (Quẻ tượng -> Tên -> Ý nghĩa -> Lời giải) ── */
  const handleCopySingleCardForAI = useCallback(async (card: DynamicCardItem) => {
    const text = `【THÔNG TIN LÁ BÀI KINH DỊCH】
• Quẻ tượng: ${card.symbol}
• Tên: ${card.name}
• Ý nghĩa: ${card.sub}
• Lời giải: ${card.desc}

[YÊU CẦU LUẬN GIẢI CHO AI]:
Xin hãy phân tích chi tiết lá bài Kinh Dịch trên:
1. Ý nghĩa biểu tượng quẻ tượng và tên quẻ/hào.
2. Hoàn cảnh thực tế mà quẻ/hào này đang phản ánh.
3. Lời khuyên định hướng và hành động thấu đáo nhất.`;

    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedSingle(true);
      setCopiedToast(`Đã sao chép lá bài ${card.name} cho AI!`);
      setTimeout(() => setCopiedSingle(false), 2200);
      setTimeout(() => setCopiedToast(null), 2800);
    }
  }, []);

  /* ── Nhấn Bắt đầu Bốc Quẻ: Rút ngẫu nhiên bài mới và cuộn mượt xuống khu vực trải bài ── */
  const handleStartDivinationOrShuffle = useCallback(() => {
    const modes: SpreadMode[] = ["1_single", "1_to_2", "1_to_3", "3_to_5"];
    const randomMode = modes[Math.floor(Math.random() * modes.length)];
    setMode(randomMode);
    setCards(drawCardsForMode(randomMode));
    setTimeout(() => {
      requestTickRef.current();
    }, 50);

    const sec = document.getElementById("destiny-cards");
    if (sec) {
      sec.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

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
          <button
            type="button"
            onClick={() => window.open(getBlogUrl(), "_blank", "noopener,noreferrer")}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-stone-700 hover:text-amber-900 transition px-3 py-1.5 rounded-full hover:bg-stone-100 border border-stone-200/80 cursor-pointer shadow-xs"
          >
            <span>📝</span>
            <span>Blog</span>
          </button>
          <button
            type="button"
            onClick={() => window.open(getHexagramsUrl(), "_blank", "noopener,noreferrer")}
            className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold text-[#9E7326] hover:text-amber-900 transition px-3 py-1.5 rounded-full hover:bg-amber-50/80 border border-amber-200/80 cursor-pointer shadow-xs"
          >
            <span>📖</span>
            <span>64 Quẻ</span>
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

              {/* Dải nút hành động Desktop (Bắt Đầu Bốc Quẻ + 64 Quẻ Kinh Dịch) */}
              <div className="hidden lg:flex w-full lg:w-auto lg:items-start relative z-[55] mt-6">
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
                    title="Nhấn để rút bài mới từ 384 hào và 64 quẻ Kinh Dịch"
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

            {/* Dải nút hành động Mobile */}
            <div id="hero-mobile-actions" className="order-3 flex w-full max-w-xl shrink-0 flex-col items-center gap-2.5 pointer-events-auto max-lg:pt-2 lg:hidden relative z-[55]">
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
                  title="Nhấn để rút bài mới từ 384 hào và 64 quẻ Kinh Dịch"
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
                <span>Hệ Thống 64 Quẻ & 384 Hào Chu Dịch</span>
                <span>✦</span>
              </div>
              <h2 className="mb-3 text-3xl font-bold text-zinc-900 sm:text-5xl lg:text-6xl tracking-tight font-serif">
                Bộ Bài I Ching Tarot Phong Cách Đông Phương
              </h2>
              <p className="mx-auto max-w-2xl text-base leading-relaxed text-zinc-500 sm:text-lg">
                Ngàn năm tinh hoa Kinh Dịch, tái hiện qua ngôn ngữ trực quan hiện đại<br />
                Khám phá con đường vận mệnh và định hướng cuộc đời với sự sáng suốt
              </p>

              {/* Bộ nút chuyển đổi số lượng lá trực tiếp trên khoảng trắng */}
              <div className="mt-5 grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-2.5 sm:gap-2.5 max-w-2xl mx-auto px-3 sm:px-2">
                <RitualHoldButton
                  id="mode-1"
                  active={mode === "1_single"}
                  onClick={() => handleSwitchMode("1_single")}
                  className={`w-full sm:w-auto flex items-center justify-center px-4 sm:px-5 py-3 sm:py-2.5 rounded-full text-[13.5px] sm:text-xs font-bold sm:font-semibold min-h-[50px] sm:min-h-[40px] transition cursor-pointer shadow-sm ${
                    mode === "1_single"
                      ? "bg-zinc-900 text-[#C4963E] border border-[#C4963E]/60 shadow-md scale-[1.02] sm:scale-105"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border border-zinc-200 hover:text-zinc-900"
                  }`}
                  title="Kính Thiên, Kính Địa, Kính Nhân (1 Lá - Đơn Quẻ)"
                >
                  1 Lá (Đơn Quẻ)
                </RitualHoldButton>

                <RitualHoldButton
                  id="mode-2"
                  active={mode === "1_to_2"}
                  onClick={() => handleSwitchMode("1_to_2")}
                  className={`w-full sm:w-auto flex items-center justify-center px-4 sm:px-5 py-3 sm:py-2.5 rounded-full text-[13.5px] sm:text-xs font-bold sm:font-semibold min-h-[50px] sm:min-h-[40px] transition cursor-pointer shadow-sm ${
                    mode === "1_to_2"
                      ? "bg-zinc-900 text-[#C4963E] border border-[#C4963E]/60 shadow-md scale-[1.02] sm:scale-105"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border border-zinc-200 hover:text-zinc-900"
                  }`}
                  title="Kính Thiên, Kính Địa, Kính Nhân (2 Lá - Âm Dương)"
                >
                  2 Lá (Âm Dương)
                </RitualHoldButton>

                <RitualHoldButton
                  id="mode-3"
                  active={mode === "1_to_3"}
                  onClick={() => handleSwitchMode("1_to_3")}
                  className={`w-full sm:w-auto flex items-center justify-center px-4 sm:px-5 py-3 sm:py-2.5 rounded-full text-[13.5px] sm:text-xs font-bold sm:font-semibold min-h-[50px] sm:min-h-[40px] transition cursor-pointer shadow-sm ${
                    mode === "1_to_3"
                      ? "bg-zinc-900 text-[#C4963E] border border-[#C4963E]/60 shadow-md scale-[1.02] sm:scale-105"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border border-zinc-200 hover:text-zinc-900"
                  }`}
                  title="Kính Thiên, Kính Địa, Kính Nhân (3 Lá - Tam Tài)"
                >
                  3 Lá (Tam Tài)
                </RitualHoldButton>

                <RitualHoldButton
                  id="mode-5"
                  active={mode === "3_to_5"}
                  onClick={() => handleSwitchMode("3_to_5")}
                  className={`w-full sm:w-auto flex items-center justify-center px-4 sm:px-5 py-3 sm:py-2.5 rounded-full text-[13.5px] sm:text-xs font-bold sm:font-semibold min-h-[50px] sm:min-h-[40px] transition cursor-pointer shadow-sm ${
                    mode === "3_to_5"
                      ? "bg-zinc-900 text-[#C4963E] border border-[#C4963E]/60 shadow-md scale-[1.02] sm:scale-105"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border border-zinc-200 hover:text-zinc-900"
                  }`}
                  title="Kính Thiên, Kính Địa, Kính Nhân (5 Lá - Ngũ Hành)"
                >
                  5 Lá (Ngũ Hành)
                </RitualHoldButton>

                <RitualHoldButton
                  id="action-shuffle"
                  active={false}
                  onClick={handleShuffleCards}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-3 sm:py-2.5 rounded-full text-[13.5px] sm:text-xs font-bold sm:font-semibold min-h-[50px] sm:min-h-[40px] bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300 transition cursor-pointer shadow-sm"
                  title="Kính Thiên, Kính Địa, Kính Nhân (Rút lại quẻ khác)"
                >
                  <span className="text-lg sm:text-sm">🎲</span>
                  <span>Rút lại</span>
                </RitualHoldButton>

                <button
                  type="button"
                  onClick={handleCopyCardsForAI}
                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-3 sm:py-2.5 rounded-full text-[13.5px] sm:text-xs font-bold sm:font-semibold min-h-[50px] sm:min-h-[40px] transition cursor-pointer shadow-sm active:scale-95 select-none touch-manipulation ${
                    copiedAI
                      ? "bg-emerald-600 text-white border border-emerald-600 shadow-md scale-[1.02] sm:scale-105"
                      : "bg-[#C4963E]/15 hover:bg-[#C4963E]/25 text-[#7C5516] hover:text-[#5E400F] border border-[#C4963E]/50 shadow-sm"
                  }`}
                  title="Sao chép toàn bộ thông tin các lá bài theo thứ tự (trái qua phải, trên xuống dưới) để gửi cho AI phân tích"
                >
                  <span className="text-lg sm:text-sm">{copiedAI ? "✓" : "📋"}</span>
                  <span className="truncate">{copiedAI ? "Đã chép cho AI!" : "Chép cho AI"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Điểm neo cho các lá bài xòe ra ở giữa phần trắng – Khoảng trắng kéo dài rộng rãi */}
          <div className="flex min-h-[540px] sm:min-h-[580px] items-center justify-center pt-4 pb-4">
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
          className="relative h-[min(56vh,500px)] w-full max-w-[min(1240px,96vw)] overflow-visible will-change-transform"
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
              <div
                className="destiny-card-inner relative w-full h-full rounded-2xl overflow-hidden cursor-pointer bg-zinc-950/90 shadow-2xl"
                style={{ transformStyle: "preserve-3d" }}
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
                      if (card.type === "yao") {
                        target.src = `/assets/oss/${card.hexNumber}/${card.hexNumber}-${card.yaoNumber}a.webp`;
                      } else {
                        target.src = `/assets/oss/${card.hexNumber}/${card.hexNumber}a.webp`;
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
                    className="relative rounded-2xl overflow-hidden shadow-2xl border border-[#C4963E]/50 bg-black/80 flex items-center justify-center p-1 group hover:border-amber-400 transition"
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
                        if (selectedCard.type === "yao") {
                          target.src = `/assets/oss/${selectedCard.hexNumber}/${selectedCard.hexNumber}-${selectedCard.yaoNumber}a.webp`;
                        } else {
                          target.src = `/assets/oss/${selectedCard.hexNumber}/${selectedCard.hexNumber}a.webp`;
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
                        if (selectedCard.type === "yao") {
                          target.src = `/assets/oss/${selectedCard.hexNumber}/${selectedCard.hexNumber}-${selectedCard.yaoNumber}b.webp`;
                        } else {
                          target.src = `/assets/oss/${selectedCard.hexNumber}/${selectedCard.hexNumber}b.webp`;
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
                  className="relative rounded-2xl overflow-hidden shadow-2xl border border-[#C4963E]/50 bg-black/80 flex items-center justify-center p-1 group hover:border-amber-400 transition"
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
                      const isBack = modalCardView === "back";
                      const suffix = isBack ? "b.webp" : "a.webp";
                      if (selectedCard.type === "yao") {
                        target.src = `/assets/oss/${selectedCard.hexNumber}/${selectedCard.hexNumber}-${selectedCard.yaoNumber}${suffix}`;
                      } else {
                        target.src = `/assets/oss/${selectedCard.hexNumber}/${selectedCard.hexNumber}${suffix}`;
                      }
                    }}
                  />
                </div>
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
                    : "bg-white/10 hover:bg-white/15 text-stone-200 hover:text-white border-white/20"
                }`}
                title="Sao chép nội dung lá bài này (quẻ tượng -> tên -> ý nghĩa -> lời giải) để gửi cho AI"
              >
                <span>{copiedSingle ? "✓" : "📋"}</span>
                <span>{copiedSingle ? "Đã chép cho AI!" : "Chép lá này cho AI"}</span>
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
