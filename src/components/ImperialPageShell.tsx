import React from "react";
import { BrandMark } from "./BrandMark";
import { NavTab } from "./Header";

export interface ImperialMethodPill {
  id: string;
  numeral: string;
  title: string;
  chinese: string;
}

interface ImperialPageShellProps {
  currentTab: NavTab;
  manualSubTab?: "book" | "decks";
  onSelectTab: (tab: NavTab) => void;
  onSelectManualSubTab?: (sub: "book" | "decks") => void;
  hasActiveReading?: boolean;
  historyCount?: number;
  divinationMethod?: string | null;
  divinationMethods?: ImperialMethodPill[];
  onSelectDivinationMethod?: (id: any) => void;
  children: React.ReactNode;
}

const TAB_HERO_META: Record<
  string,
  {
    badge: string;
    title: string;
    highlight: string;
    chinese: string;
    subtitle: string;
    bridgeLabel: string;
  }
> = {
  divination: {
    badge: "CỬU NHỊ HUYỀN ĐÀN · SẢNH KHỞI QUẺ CHÍNH ĐIỆN",
    title: "Bốc Quẻ Kinh Dịch &",
    highlight: "10 Đại Pháp Khí Cổ Truyền",
    chinese: "周易起卦 · 十法器玄壇",
    subtitle:
      "Tĩnh tâm khởi niệm trên nền Giấy Tuyên Thành Hoàng Kim · Kết hợp 64 Quẻ Chu Dịch, 12 Trận Pháp, Tháp La, Cỏ Thi, Đồng Xu, Mai Hoa & Tam Thức.",
    bridgeLabel: "Cửu Nhị Huyền Đàn · Sảnh Khởi Quẻ & 10 Pháp Khí",
  },
  detail: {
    badge: "SỚ ĐIỆP CỬU NHỊ · LUẬN GIẢI QUẺ ĐÃ BỐC",
    title: "Sớ Điệp Luận Giải &",
    highlight: "Chiêm Đoán Bản Quái · Biến Quái",
    chinese: "周易斷卦 · 本卦變卦詳解",
    subtitle:
      "Đối chiếu Bản Quái, Hào Động Chu Sa, Hỗ Quái và Biến Quái trên trang giấy lụa Tuyên Thành sáng rõ, kết hợp luận giải AI chuyên sâu.",
    bridgeLabel: "Cửu Nhị Huyền Đàn · Sớ Điệp Luận Giải Quẻ Đã Bốc",
  },
  manual: {
    badge: "THƯ VIỆN CỔ HỌC · THUYẾT MINH 64 QUẺ CHU DỊCH",
    title: "Sách Thuyết Minh &",
    highlight: "Bách Khoa 64 Quẻ · Bát Cung",
    chinese: "周易說卦 · 六十四卦全書",
    subtitle:
      "Khảo cứu toàn văn 9 chương Dịch Lý, Kinh Phòng Bát Cung, Đại Tượng Truyện, Thơ Tượng và Điển Tích Lịch Sử trên nền Sách Cổ Tuyên Thành.",
    bridgeLabel: "Cửu Nhị Huyền Đàn · Thư Viện Sách Cổ 64 Quẻ",
  },
  decks: {
    badge: "BẢO TÀNG NGHỆ THUẬT · BỘ HÌNH 64 QUẺ TAROT",
    title: "Thư Viện Bộ Hình &",
    highlight: "64 Lá Bài Sơn Mài · Thủy Mặc",
    chinese: "周易牌陣 · 六十四卦圖鑑",
    subtitle:
      "Chiêm ngưỡng và chuyển đổi giữa Bộ Quân Tử, Bộ Có Chữ, Bộ Không Chữ và tùy biến hình ảnh 64 lá bài Kinh Dịch.",
    bridgeLabel: "Cửu Nhị Huyền Đàn · Bảo Tàng Bộ Hình 64 Quẻ",
  },
  jiazi: {
    badge: "TAM THỨC CỬU NHỊ · LỤC THẬP HOA GIÁP",
    title: "Lục Thập Hoa Giáp &",
    highlight: "60 Can Chi Nạp Âm · Lục Nhâm",
    chinese: "六十花甲 · 納音大六壬",
    subtitle:
      "Tra cứu 60 trụ Can Chi, Ngũ Hành Nạp Âm, Quẻ Dịch phối Hoa Giáp và bàn Lục Nhâm Đại Độn theo đúng chuẩn Sớ Điệp Hoàng Gia.",
    bridgeLabel: "Cửu Nhị Huyền Đàn · 60 Hoa Giáp & Đại Lục Nhâm",
  },
  calendar: {
    badge: "KHÂM THIÊN GIÁM · LỊCH DỤNG SỰ & TRẠCH NHẬT",
    title: "Lịch Dụng Sự &",
    highlight: "12 Giờ Tâm Ấn Phú Gia Truyền",
    chinese: "擇日用事曆 · 十二時辰心印賦",
    subtitle:
      "Khảo sát Can Chi Năm Tháng Ngày Giờ, Nhị Thập Bát Tú, Trực Nhật Tinh Quân và Giờ Hoàng Đạo trên Ngọc Giản Tuyên Thành.",
    bridgeLabel: "Cửu Nhị Huyền Đàn · Lịch Dụng Sự & 12 Giờ Tâm Ấn Phú",
  },
  hannhiet: {
    badge: "TẠO HÓA NGUYÊN NHƯỢC · HÀN NHIỆT MỆNH LÝ",
    title: "Bát Tự Hàn Nhiệt Mệnh &",
    highlight: "Cửu Cung Phi Tinh · Tô Phái",
    chinese: "寒熱命理 · 九宮飛星風水",
    subtitle:
      "Cân bằng Âm Dương Hàn Nhiệt theo mùa sinh (Hàn Mệnh · Nhiệt Mệnh · Bình Mệnh), định chuẩn Dụng Thần Điều Hầu và vận trình phong thủy.",
    bridgeLabel: "Cửu Nhị Huyền Đàn · Bát Tự Hàn Nhiệt Mệnh & Phi Tinh",
  },
  pricing: {
    badge: "KIM BẢNG YẾT THỊ · BÁO GIÁ & ĐẶC QUYỀN HỘI VIÊN",
    title: "Biểu Phí Dịch Vụ &",
    highlight: "Đặc Quyền Hội Viên VIP Cửu Nhị",
    chinese: "玖貳命理 · 皇家會員特權",
    subtitle:
      "Phong thủy Dương Trạch, Đặt Tên Cát Tường, Bát Tự Đa Trường Phái, Trạch Nhật và Thẻ Ngọc Giản Hội Viên VIP ưu đãi toàn diện.",
    bridgeLabel: "Cửu Nhị Huyền Đàn · Bảng Báo Giá & Đặc Quyền Hội Viên",
  },
  history: {
    badge: "TÀNG THƯ CÁC · NHẬT KÝ & HỒ SƠ LỊCH SỬ BÓI",
    title: "Hồ Sơ Chiêm Bốc &",
    highlight: "Nhật Ký Nghiệm Lý Quẻ Đã Lưu",
    chinese: "占卜檔案 · 歷史卦象記錄",
    subtitle:
      "Lưu trữ, đối chiếu và nghiệm lý toàn bộ các quẻ bài, câu hỏi tâm niệm và lời giải AI trên sổ tay Tuyên Thành.",
    bridgeLabel: "Cửu Nhị Huyền Đàn · Tàng Thư Hồ Sơ Lịch Sử Bói",
  },
  library: {
    badge: "BÁCH KHOA TOÀN THƯ · 64 QUẺ KINH DỊCH",
    title: "Bách Khoa 64 Quẻ &",
    highlight: "384 Hào Tượng Chu Dịch",
    chinese: "周易百科 · 六十四卦三百八十四爻",
    subtitle:
      "Tra cứu nhanh toàn bộ 64 quẻ kép và 384 hào từ Kinh Dịch trên nền Giấy Tuyên Thành Hoàng Kim.",
    bridgeLabel: "Cửu Nhị Huyền Đàn · Bách Khoa 64 Quẻ Chu Dịch",
  },
};

export const ImperialPageShell: React.FC<ImperialPageShellProps> = ({
  currentTab,
  manualSubTab = "book",
  onSelectTab,
  onSelectManualSubTab,
  hasActiveReading = false,
  historyCount = 0,
  divinationMethod,
  divinationMethods = [],
  onSelectDivinationMethod,
  children,
}) => {
  const effectiveKey =
    currentTab === "manual" && manualSubTab === "decks" ? "decks" : currentTab;
  const meta = TAB_HERO_META[effectiveKey] || TAB_HERO_META.divination;

  const navItems: {
    id: NavTab;
    sub?: "book" | "decks";
    icon: string;
    label: string;
    badge?: string | number;
  }[] = [
    { id: "home", icon: "🏠", label: "Trang Chủ" },
    { id: "divination", icon: "☯", label: "Bốc Quẻ" },
    ...(hasActiveReading
      ? [{ id: "detail" as NavTab, icon: "📜", label: "Quẻ Đã Bốc", badge: "Mới" }]
      : []),
    { id: "manual", sub: "book", icon: "📖", label: "Thuyết Minh 64 Quẻ" },
    { id: "manual", sub: "decks", icon: "🎨", label: "Bộ Hình 64 Quẻ" },
    { id: "jiazi", icon: "🧭", label: "60 Hoa Giáp" },
    { id: "calendar", icon: "📅", label: "Lịch Dụng Sự" },
    { id: "hannhiet", icon: "🔥", label: "Hàn Nhiệt Mệnh" },
    { id: "yilore", icon: "📓", label: "Nhật Ký Yilore" },
    { id: "pricing", icon: "👑", label: "Báo Giá VIP" },
    {
      id: "history",
      icon: "🕰️",
      label: "Lịch Sử Bói",
      badge: historyCount > 0 ? historyCount : undefined,
    },
  ];

  return (
    <div className="relative isolate w-full flex-1 flex flex-col">
      {/* ══════════════════════════════════════════════════════════════════
          TẦNG 1: ĐÀI QUAN TINH ĐÊM (COMPACT HERO OBSERVATORY)
          Đồng bộ 100% chất liệu bầu trời đêm & hào quang vàng với Trang Chủ
          ══════════════════════════════════════════════════════════════════ */}
      <section
        aria-label="Đài Quan Tinh Cửu Nhị"
        className="relative isolate w-full overflow-hidden py-3.5 sm:py-4.5 px-4 sm:px-8"
      >
        {/* Nền ảnh hero-frame giống hệt Trang Chủ */}
        <div className="pointer-events-none absolute inset-0 z-0">
          <img
            alt=""
            aria-hidden="true"
            decoding="async"
            className="object-cover w-full h-full opacity-90"
            src="/assets/hero-frame.webp"
          />
        </div>

        {/* Lớp phủ Sơn Mài Đen Huyền */}
        <div
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background:
              "linear-gradient(180deg, rgba(14,13,11,0.82) 0%, rgba(18,16,13,0.74) 55%, rgba(11,10,8,0.92) 100%)",
          }}
          aria-hidden="true"
        />

        {/* Quầng sáng Hoàng Kim 2800K ở trung tâm */}
        <div
          className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center"
          aria-hidden="true"
        >
          <div
            className="h-[340px] w-[680px] rounded-full"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(196,150,62,0.22) 0%, transparent 70%)",
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Cột Trái: Logo Cửu Nhị + Tiêu đề Phân Hệ Gọn Gàng */}
          <div className="flex items-center gap-3">
            <span
              className="relative flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 shrink-0 overflow-hidden rounded-xl shadow-xl"
              style={{
                background: "linear-gradient(145deg, #1c1a22 0%, #0d0c11 100%)",
                border: "1px solid rgba(196,150,62,0.55)",
              }}
            >
              <BrandMark size={32} title="Cửu Nhị · Kinh Dịch" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-serif tracking-[0.22em] text-[#D4AF37] uppercase">
                  {meta.chinese}
                </span>
                <span className="hidden sm:inline text-white/30">•</span>
                <span className="hidden sm:inline text-[10px] font-serif tracking-[0.15em] text-[#F3E5AB]/80 uppercase">
                  {meta.badge}
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl font-bold text-white font-serif tracking-tight leading-snug">
                {meta.title}{" "}
                <span className="text-[#F3E5AB] italic">{meta.highlight}</span>
              </h1>
            </div>
          </div>

          {/* Cột Phải: Cặp nút Kính Mờ Gọn Gàng */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onSelectTab("home")}
              className="inline-flex h-8.5 items-center gap-1.5 rounded-full px-3.5 text-xs font-serif font-semibold text-white transition hover:bg-white/15 cursor-pointer"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.3)",
                backdropFilter: "blur(8px)",
              }}
            >
              <span>🏠</span>
              <span>Về Trang Chủ</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab("yilore")}
              className="inline-flex h-8.5 items-center gap-1.5 rounded-full px-3.5 text-xs font-serif font-semibold text-[#F3E5AB] transition hover:brightness-110 cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #2A2118 0%, #18130E 100%)",
                border: "1px solid rgba(212,175,55,0.65)",
              }}
            >
              <span className="text-[#D4AF37]">☯</span>
              <span>Sổ Tay Yilore</span>
            </button>

            <a
              href="/vi/hexagram"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8.5 items-center gap-1.5 rounded-full px-3.5 text-xs font-serif font-semibold text-white transition hover:bg-white/15 cursor-pointer no-underline"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.3)",
                backdropFilter: "blur(8px)",
              }}
            >
              <span>📖</span>
              <span>64 Quẻ ↗</span>
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          TẦNG 2: CẦU CHUYỂN SẮC THỦY MẶC (INK-WASH TRANSITION BRIDGE)
          Giống hệt 100% cấu trúc & mã màu của Trang Chủ (LandingPage.tsx)
          ══════════════════════════════════════════════════════════════════ */}
      <div
        aria-hidden="true"
        className="relative w-full h-11 sm:h-12 overflow-hidden pointer-events-none select-none flex items-center justify-center"
        style={{
          background:
            "linear-gradient(180deg, #07080D 0%, #171410 36%, #DDD4C3 82%, #F6F3EB 100%)",
        }}
      >
        <div
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-20 opacity-60"
          style={{
            background:
              "radial-gradient(ellipse 55% 60% at 50% 50%, rgba(212, 175, 55, 0.24) 0%, transparent 75%)",
          }}
        />
        <div className="relative z-10 flex items-center gap-3 px-5 py-1.5 rounded-full bg-[#120F0B]/92 border border-[#C4963E]/65 shadow-[0_6px_24px_rgba(196,150,62,0.28)] backdrop-blur-md">
          <span className="h-[1px] w-6 sm:w-12 bg-gradient-to-r from-transparent to-[#D4AF37]" />
          <span className="text-[#D4AF37] text-sm leading-none">☯</span>
          <span className="font-serif text-[10px] sm:text-xs font-semibold tracking-[0.22em] uppercase text-[#F3E5AB]">
            {meta.bridgeLabel}
          </span>
          <span className="text-[#D4AF37] text-sm leading-none">✦</span>
          <span className="h-[1px] w-6 sm:w-12 bg-gradient-to-l from-transparent to-[#D4AF37]" />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          TẦNG 3: SẢNH CHÍNH GIẤY TUYÊN THÀNH HOÀNG KIM (XUAN PARCHMENT CANVAS)
          Có Lưới Tơ Đồng Cổ 48x48px + La Bàn Bát Quái Xoay Chậm + Núi Thủy Mặc
          ══════════════════════════════════════════════════════════════════ */}
      <div
        className="xuan-imperial-canvas relative flex-1 w-full bg-[#F6F3EB] text-[#1C1813] pb-16 sm:pb-24 overflow-hidden"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 85% 75% at 50% 35%, #FAF8F2 0%, #F4EFE4 65%, #EAE2D3 100%)",
        }}
      >
        {/* Lưới tọa độ Tơ Đồng Cổ 48x48px giống hệt #destiny-cards */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            backgroundImage: `linear-gradient(rgba(180,145,70,0.13) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(180,145,70,0.13) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />

        {/* La Bàn Bát Quái Chìm (Celestial Bagua Watermark) giống hệt Trang Chủ */}
        <div
          aria-hidden="true"
          className="pointer-events-none select-none fixed left-1/2 top-[55%] -translate-x-1/2 -translate-y-1/2 z-0 flex items-center justify-center"
        >
          <svg
            viewBox="0 0 600 600"
            className="w-[460px] h-[460px] sm:w-[640px] sm:h-[640px] md:w-[740px] md:h-[740px] opacity-[0.11] animate-[spin_180s_linear_infinite]"
          >
            <defs>
              <radialGradient id="shellBaguaGoldGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.25" />
                <stop offset="65%" stopColor="#C4963E" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#C4963E" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="300" cy="300" r="285" fill="url(#shellBaguaGoldGlow)" />
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
            <line x1="300" y1="20" x2="300" y2="580" stroke="#B8892E" strokeWidth="0.9" strokeOpacity="0.6" />
            <line x1="20" y1="300" x2="580" y2="300" stroke="#B8892E" strokeWidth="0.9" strokeOpacity="0.6" />
            <line x1="102" y1="102" x2="498" y2="498" stroke="#B8892E" strokeWidth="0.9" strokeOpacity="0.6" />
            <line x1="498" y1="102" x2="102" y2="498" stroke="#B8892E" strokeWidth="0.9" strokeOpacity="0.6" />
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

        {/* Họa tiết núi Thủy Mặc mountain.svg ở góc trái dưới giống hệt #features-section */}
        <div className="pointer-events-none absolute left-0 bottom-0 z-0 opacity-75">
          <img
            alt=""
            aria-hidden="true"
            loading="lazy"
            width={1000}
            height={600}
            decoding="async"
            className="w-80 sm:w-[30rem] md:w-[42rem] h-auto"
            src="/assets/mountain.svg"
          />
        </div>

        {/* ── CỬU NHỊ COMMAND DOCK (CHỈ HIỆN Ở TAB BỐC QUẺ ĐỂ CHỌN 10 PHÁP KHÍ, TRÁNH TRÙNG LẶP VỚI THANH MENU TRÊN CÙNG) ── */}
        {currentTab === "divination" && (
        <div className="relative z-20 mx-auto max-w-6xl px-3 sm:px-4 pt-3 pb-2">
          <div
            className="rounded-2xl border border-[#C4963E]/50 p-3.5 sm:p-4 backdrop-blur-xl flex flex-col gap-3"
            style={{
              background:
                "linear-gradient(180deg, rgba(253, 251, 247, 0.96) 0%, rgba(244, 238, 226, 0.94) 100%)",
              boxShadow:
                "0 14px 36px -10px rgba(92, 74, 44, 0.16), 0 2px 8px rgba(92, 74, 44, 0.06), inset 0 0 0 3px #FDFBF7, inset 0 0 0 4px rgba(196, 150, 62, 0.2)",
            }}
          >
            {/* Dòng tiêu đề Thanh Pháp Khí + Ấn Chu Sa */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#C4963E]/25 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-[#9E2A2B] text-amber-50 text-[10px] font-serif font-bold border border-[#D4AF37]/60 shadow-2xs">
                  印
                </span>
                <span className="text-[11px] sm:text-xs font-serif font-bold uppercase tracking-[0.16em] text-[#6E4E16]">
                  Cửu Nhị Command Dock · Điều Hướng Nhanh Toàn Trang
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-serif font-semibold text-[#7A5518] bg-[#FAF0D7] border border-[#C4963E]/55 px-2.5 py-0.5 rounded-full">
                  ✦ Đồng bộ chuẩn Trang Chủ
                </span>
              </div>
            </div>

            {/* Hàng 1: Các phân hệ chính */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {navItems.map((item, idx) => {
                const tabVal = currentTab as string;
                const isActive =
                  item.id === "manual" && item.sub
                    ? (tabVal === "manual" || tabVal === "decks") &&
                      (tabVal === "decks"
                        ? item.sub === "decks"
                        : manualSubTab === item.sub)
                    : tabVal === item.id;

                return (
                  <button
                    key={`${item.id}-${item.sub || idx}`}
                    type="button"
                    onClick={() => {
                      if (item.id === "manual" && item.sub && onSelectManualSubTab) {
                        onSelectManualSubTab(item.sub);
                        onSelectTab("manual");
                      } else {
                        onSelectTab(item.id);
                      }
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-serif transition-all cursor-pointer select-none ${
                      isActive
                        ? "imperial-dark-preserve bg-gradient-to-b from-[#261E16] to-[#18130E] text-[#F3E5AB] border border-[#D4AF37] font-bold shadow-[0_6px_16px_rgba(28,22,16,0.24),inset_0_1px_0_rgba(212,175,55,0.35)] scale-[1.02]"
                        : "bg-[#FAF6EE]/95 hover:bg-[#EFE6D5] text-[#4A3B28] hover:text-[#1C1610] border border-[#C4963E]/35 hover:border-[#C4963E]/70 font-semibold shadow-2xs"
                    }`}
                  >
                    <span className="text-xs leading-none">{item.icon}</span>
                    <span>{item.label}</span>
                    {item.badge !== undefined && (
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[9.5px] font-sans font-bold ${
                          isActive
                            ? "bg-[#D4AF37] text-[#18130E]"
                            : "bg-[#9E2A2B] text-white"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Hàng 2 (Chỉ hiện ở Tab Bốc Quẻ): Chọn nhanh 10 Pháp Khí Khởi Quẻ */}
            {currentTab === "divination" &&
              divinationMethods.length > 0 &&
              onSelectDivinationMethod && (
                <div className="pt-2.5 border-t border-[#C4963E]/25 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[11px] font-serif text-[#6E4E16]">
                    <span className="font-bold uppercase tracking-[0.14em] flex items-center gap-1.5">
                      <span className="text-[#9E2A2B]">✦</span>
                      <span>Chọn Nhanh 10 Đại Pháp Khí Khởi Quẻ:</span>
                    </span>
                    <span className="hidden sm:inline text-[#8A7960] italic">
                      Nhấn chọn pháp khí để mở bàn gieo quẻ tương ứng ngay bên dưới
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                    {divinationMethods.map((m) => {
                      const isMethodActive = divinationMethod === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => onSelectDivinationMethod(m.id)}
                          className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-[11px] sm:text-xs font-serif transition-all cursor-pointer text-left ${
                            isMethodActive
                              ? "imperial-dark-preserve bg-gradient-to-b from-[#261E16] to-[#18130E] text-[#F3E5AB] border border-[#D4AF37] font-bold shadow-[0_6px_14px_rgba(28,22,16,0.22)]"
                              : "bg-[#FDFBF7] hover:bg-[#EFE6D5] text-[#3D2E1E] border border-[#C4963E]/35 hover:border-[#C4963E]/70 font-medium"
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                              isMethodActive
                                ? "bg-[#9E2A2B] text-amber-50 border border-[#D4AF37]/70"
                                : "bg-[#EFE6D5] text-[#7A5518] border border-[#C4963E]/40"
                            }`}
                          >
                            {m.numeral}
                          </span>
                          <span className="truncate">{m.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
          </div>
        </div>

        )}

        {/* Nội dung chính của từng trang con */}
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
};
