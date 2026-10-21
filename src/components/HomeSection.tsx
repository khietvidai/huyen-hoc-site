import React, { useState } from "react";
import {
  Layers,
  Sparkles,
  ArrowRight,
  ArrowDown,
  HelpCircle,
  Compass,
  Lightbulb,
  CheckCircle2,
  Scroll,
  RotateCw,
  Phone,
  MessageSquare,
  Copy,
  Check,
  Shield,
  Clock,
  Eye,
  Users,
  Sun,
  BookOpen,
  CalendarDays,
  Flame,
  Award,
  Share2,
  Crown,
} from "lucide-react";
import { NavTab } from "./Header";
import { BrandMark, LuopanRing } from "./BrandMark";
import { HEXAGRAMS } from "../data/hexagrams";
import {
  SPREAD_METHODS_SUMMARY,
  SPREAD_EXAMPLES,
} from "../data/manualSpreadExamples";
import { CardVisual } from "./CardVisual";
import { AppUser } from "../services/authService";

export interface HomeSectionProps {
  onNavigateTab: (tab: NavTab) => void;
  onSelectDrawMode?: (mode: "single" | "double" | "three" | "seven" | "nine" | "ten" | "twelve" | "custom") => void;
  cardImages?: Record<number, string>;
  cardVideos?: Record<number, string>;
  onSelectHexagram?: (hexNumber: number) => void;
  currentUser?: AppUser | null;
  onOpenAuthModal?: (mode?: "login" | "register" | "upgrade") => void;
}

type SpreadCategory = "summary" | "1_card" | "2_card" | "3_card" | "advanced" | "examples";

export const HomeSection: React.FC<HomeSectionProps> = ({
  onNavigateTab,
  onSelectDrawMode,
  cardImages = {},
  cardVideos = {},
  onSelectHexagram,
  currentUser = null,
  onOpenAuthModal,
}) => {
  const isRegistered = Boolean(currentUser);
  const isVip = Boolean(currentUser?.isMember || currentUser?.isAdmin);
  const [activeSpreadTab, setActiveSpreadTab] = useState<SpreadCategory>("summary");
  const [highlight123, setHighlight123] = useState(false);
  const [highlightRitual, setHighlightRitual] = useState(false);
  const [exampleFilter, setExampleFilter] = useState<
    "all" | "1_card" | "2_card" | "3_card" | "that_tinh" | "thap_tinh"
  >("all");
  const [copiedPhone, setCopiedPhone] = useState(false);

  const handleScrollToRitual = () => {
    setHighlightRitual(true);
    const el = document.getElementById("nghi-thuc-thinh-que");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setTimeout(() => {
      setHighlightRitual(false);
    }, 2400);
  };

  const handleScrollTo123 = () => {
    setActiveSpreadTab("summary");
    setHighlight123(true);
    const el = document.getElementById("khu-vuc-boc-que-123");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setTimeout(() => {
      setHighlight123(false);
    }, 2400);
  };

  const ZALO_PHONE = "090 285 3305";
  const ZALO_LINK = "https://zalo.me/0902853305";
  const ZALO_GROUP_LINK = "https://zalo.me/g/vwzsqvnh3gdbzst2psyh";

  const handleCopyPhone = () => {
    try {
      navigator.clipboard.writeText("0902853305");
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    } catch {
      // ignore
    }
  };

  const filteredExamples = SPREAD_EXAMPLES.filter((ex) => {
    if (exampleFilter === "all") return true;
    return ex.spreadType === exampleFilter;
  });

  return (
    <div className="space-y-14 sm:space-y-20 animate-in fade-in duration-300">
      {/* ================= HERO SECTION ================= */}
      <section className="royal-frame relative px-6 pt-12 pb-10 sm:px-12 sm:pt-20 sm:pb-16 text-center overflow-hidden">
        <span className="royal-corner tl" />
        <span className="royal-corner tr" />
        <span className="royal-corner bl" />
        <span className="royal-corner br" />

        {/* Luopan background subtle ring */}
        <LuopanRing className="pointer-events-none absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2 w-[550px] sm:w-[720px] max-w-none opacity-[0.08]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_45%,rgba(11,10,8,0.85),transparent_75%)]" />

        <div className="relative max-w-3xl mx-auto">
          <div className="royal-reveal" style={{ animationDelay: "0ms" }}>
            <BrandMark size={56} className="mx-auto" />
          </div>

          <div className="royal-reveal mt-6" style={{ animationDelay: "60ms" }}>
            <div className="royal-eyebrow">Kinh Dịch Chiêm Bốc · 周易塔羅 · Trí Tuệ Cổ Nhân</div>
          </div>

          <h1
            className="royal-reveal royal-title mt-4 [text-wrap:balance] text-[2.4rem] sm:text-5xl md:text-[4.2rem] !leading-[1.08]"
            style={{ animationDelay: "120ms" }}
          >
            Phương pháp bốc bài
            <span className="block italic royal-gold-text">I Ching Tarot</span>
          </h1>

          <div className="royal-reveal mt-7 flex items-center justify-center gap-4" style={{ animationDelay: "180ms" }}>
            <span className="h-px w-10 sm:w-20 bg-gradient-to-r from-transparent to-gold-700" />
            <span className="font-serif text-sm sm:text-lg tracking-[0.35em] text-gold-400 pl-[0.35em]">周易塔羅起卦法</span>
            <span className="h-px w-10 sm:w-20 bg-gradient-to-l from-transparent to-gold-700" />
          </div>

          <p
            className="royal-reveal mt-7 text-[15px] sm:text-[17px] leading-[1.8] text-ivory-300 font-serif max-w-2xl mx-auto"
            style={{ animationDelay: "240ms" }}
          >
            Sự kết hợp tinh hoa giữa <strong className="text-gold-300 font-medium">64 quẻ Chu Dịch</strong> cổ truyền 5.000 năm và hình thức trải bài trực quan phương Tây. Thấu tỏ thời vận, nhận diện cội nguồn vấn đề, nắm bắt chiều hướng chuyển biến và tìm ra sách lược hành động tối ưu.
          </p>

          <div
            className="royal-reveal mt-9 flex items-center justify-center"
            style={{ animationDelay: "300ms" }}
          >
            <button
              type="button"
              onClick={handleScrollToRitual}
              className="royal-btn px-8 py-3 text-sm sm:text-base cursor-pointer group shadow-lg shadow-gold-950/40"
            >
              <Layers className="w-4 h-4 text-gold-300" />
              <span>Bắt Đầu Bốc Quẻ Ngay</span>
              <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform text-gold-300" />
            </button>
          </div>


        </div>

        {/* 4 Trụ cột Dịch học */}
        <dl
          className="royal-reveal relative mt-12 pt-7 border-t border-gold-800 grid grid-cols-2 md:grid-cols-4 gap-y-6 max-w-4xl mx-auto"
          style={{ animationDelay: "420ms" }}
        >
          {[
            { value: "64", label: "Quẻ Chu Dịch", chinese: "六十四卦" },
            { value: "384", label: "Hào Tượng Tinh Vi", chinese: "三百八十四爻" },
            { value: "12", label: "Trận Pháp Trải Bài", chinese: "十二陣法" },
            { value: "100%", label: "Nguyên Bản Cổ Thư", chinese: "周易正統" },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className={`px-3 ${index % 2 === 1 ? "border-l border-gold-800" : ""} ${
                index === 2 ? "md:border-l md:border-gold-800" : ""
              }`}
            >
              <dt className="sr-only">{stat.label}</dt>
              <dd className="font-display text-3xl sm:text-4xl text-gold-300 leading-none tabular-nums">{stat.value}</dd>
              <dd className="mt-2 text-[10px] sm:text-[11px] font-sans uppercase tracking-[0.14em] text-ivory-300 whitespace-nowrap">
                {stat.label}
              </dd>
              <dd className="mt-0.5 text-[10px] font-serif tracking-[0.25em] text-gold-700">{stat.chinese}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ================= PHẦN 1: NGHI THỨC & NGUYÊN TẮC BỐC BÀI ================= */}
      <section
        id="nghi-thuc-thinh-que"
        className={`scroll-mt-24 space-y-6 rounded-2xl p-2 transition-all duration-700 ${
          highlightRitual
            ? "ring-2 ring-gold-400 bg-gold-500/10 shadow-[0_0_35px_rgba(200,155,60,0.3)]"
            : ""
        }`}
      >
        <div className="text-center max-w-2xl mx-auto">
          <div className="royal-eyebrow">Thành tâm tất ứng · Tâm động quẻ sinh</div>
          <h2 className="royal-title mt-3 text-2xl sm:text-4xl">
            Nghi thức thỉnh quẻ &amp; Tứ Bất Bốc
          </h2>
          <p className="mt-3 text-sm text-ivory-500 font-serif leading-relaxed">
            Kinh Dịch không phải trò bói toán may rủi, mà là chiếc cầu nối giữa trường ý thức con người và quy luật biến dịch của Trời Đất.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Mộc Dục & Trai Giới */}
          <div className="royal-card p-6 sm:p-7 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold-900/60 border border-gold-600/50 flex items-center justify-center text-gold-300 font-display text-lg shrink-0">
                壹
              </div>
              <div>
                <h3 className="font-display text-xl text-ivory-100">Trai Giới Mộc Dục · 齋戒沐浴</h3>
                <span className="text-[11px] font-serif text-gold-600 tracking-wider">Thanh Tịnh Thân Thể &amp; Ý Niệm</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-ivory-300 font-serif leading-relaxed">
              Trước khi gieo quẻ, cổ nhân luôn cẩn trọng rửa sạch đôi bàn tay dưới dòng nước mát (<strong className="text-gold-300 font-medium">Mộc Dục</strong>). Đôi tay là kênh phát xuất trường điện từ sinh học; tay sạch thì trường năng lượng tương tác cùng bộ bài mới tinh khiết.
            </p>

            <p className="text-xs sm:text-sm text-ivory-300 font-serif leading-relaxed">
              Đồng thời, giữ tâm ý tĩnh lặng, dứt bỏ mọi toan tính vị kỷ, tham sân si hay lo âu vụn vặt (<strong className="text-gold-300 font-medium">Trai Giới</strong>) để đạt tới trạng thái <em>Hư Tĩnh</em> như mặt gương sáng.
            </p>

            <div className="p-3.5 rounded-xl bg-[#140E08] border border-gold-800/80 text-[12px] font-serif text-gold-300/90 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
              <span>“Tịch nhiên bất động, cảm nhi toại thông thiên hạ chi cố” — Khi tâm tịch tĩnh bất động, linh cảm sẽ thông tỏ mọi sự biến thiên trong thiên hạ.</span>
            </div>
          </div>

          {/* Tứ Bất Bốc */}
          <div className="royal-card p-6 sm:p-7 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold-900/60 border border-gold-600/50 flex items-center justify-center text-gold-300 font-display text-lg shrink-0">
                貳
              </div>
              <div>
                <h3 className="font-display text-xl text-ivory-100">Khẩu Quyết Tứ Bất Bốc · 四不占</h3>
                <span className="text-[11px] font-serif text-gold-600 tracking-wider">Bốn Điều Cổ Nhân Tuyệt Đối Không Bốc</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {[
                {
                  num: "1",
                  title: "Bất thành bất bốc",
                  desc: "Lòng không chí thành, bốc bài thử nghiệm chơi đùa hoặc đố kỵ thì không bao giờ ứng.",
                },
                {
                  num: "2",
                  title: "Bất nghi bất bốc",
                  desc: "Khi trong lòng không có điều băn khoăn thực sự hệ trọng thì không được tùy tiện bốc.",
                },
                {
                  num: "3",
                  title: "Phi nghĩa bất bốc",
                  desc: "Hỏi việc phi pháp, thất đức, mưu hại người khác hay mưu lợi bất chính thì quẻ không chỉ dạy.",
                },
                {
                  num: "4",
                  title: "Độc tắc bất cáo",
                  desc: "Cùng một sự việc nếu bốc đi bốc lại để mong ra quẻ tốt theo ý mình thì khí trường ắt đại loạn.",
                },
              ].map((item) => (
                <div key={item.num} className="p-3 rounded-lg bg-[#140E08]/80 border border-gold-800/60 space-y-1">
                  <div className="text-xs font-serif font-bold text-gold-300">
                    {item.num}. {item.title}
                  </div>
                  <p className="text-[11px] text-ivory-500 font-serif leading-snug">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= PHẦN 2: QUY TRÌNH 4 BƯỚC BỐC BÀI ================= */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <div className="royal-eyebrow">Hành trình thỉnh vấn dịch lý</div>
          <h2 className="royal-title mt-3 text-2xl sm:text-4xl">
            Quy trình 4 bước bốc bài I Ching Tarot
          </h2>
          <p className="mt-3 text-sm text-ivory-500 font-serif leading-relaxed">
            Các bước chuẩn hóa từ lúc khởi ý cho đến khi giải mã hành động thực tiễn.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              step: "Bước 01",
              title: "Khởi Ý Đặt Câu Hỏi",
              chinese: "立心設問",
              desc: "Tĩnh tâm xác định rõ một câu hỏi cụ thể, tránh câu hỏi mơ hồ hoặc đa nghĩa hai ý. Ví dụ: 'Định hướng công việc 6 tháng tới' thay vì 'Tôi sẽ ra sao'.",
              icon: HelpCircle,
            },
            {
              step: "Bước 02",
              title: "Xào Bài & Kết Nối",
              chinese: "洗牌通靈",
              desc: "Xáo bài đều tay, tâm thức tập trung trọn vẹn vào câu hỏi. Cảm nhận sự giao hòa giữa dòng năng lượng ý thức và 64 lá bài Kinh Dịch.",
              icon: RotateCw,
            },
            {
              step: "Bước 03",
              title: "Chọn Trận & Rút Bài",
              chinese: "布陣抽籤",
              desc: "Lựa chọn phương pháp trải bài phù hợp (1 lá, 2 lá, 3 lá hoặc các trận pháp chuyên sâu). Rút các lá bài theo đúng thứ tự vị trí đã định.",
              icon: Layers,
            },
            {
              step: "Bước 04",
              title: "Giải Mã & Ứng Biến",
              chinese: "解卦應變",
              desc: "Quan sát Quẻ Chủ, Quẻ Biến, Hào Động, Thoán Từ và Tượng Truyện. Rút ra bài học triết lý và sách lược hành động thực tiễn nghênh cát tị hung.",
              icon: Compass,
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="royal-card p-5 sm:p-6 flex flex-col justify-between space-y-3 relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-gold-950 text-gold-300 border border-gold-700/60">
                      {item.step}
                    </span>
                    <Icon className="w-4 h-4 text-gold-500" />
                  </div>
                  <h3 className="font-display text-lg text-ivory-100 mt-3 leading-tight">{item.title}</h3>
                  <div className="text-[10px] font-serif tracking-[0.25em] text-gold-600 mt-0.5">{item.chinese}</div>
                  <p className="mt-3 text-xs text-ivory-500 font-serif leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= PHẦN 3: CÁC PHƯƠNG PHÁP & TRẬN PHÁP TRẢI BÀI ================= */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <div className="royal-eyebrow">Trận pháp I Ching Tarot chuyên sâu</div>
          <h2 className="royal-title mt-3 text-2xl sm:text-4xl">
            Các phương pháp trải bài I Ching Tarot
          </h2>
          <p className="mt-3 text-sm text-ivory-500 font-serif leading-relaxed">
            Từ đơn quẻ định tâm cho tới các trận pháp đa chiều khảo sát toàn cảnh cuộc đời.
          </p>
        </div>

        {/* Bảng phân cấp quyền truy cập theo 3 cấp tài khoản */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#1E150D] via-[#140E08] to-[#1E150D] border border-gold-800 text-xs font-serif space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-gold-400 font-bold uppercase tracking-wider text-xs">
              <Shield className="w-4 h-4 text-gold-500" />
              <span>Phân Cấp Quyền Hạn Chiêm Bốc Cửu Nhị</span>
            </div>
            {!isRegistered ? (
              <button
                type="button"
                onClick={() => onOpenAuthModal && onOpenAuthModal("register")}
                className="royal-btn !py-1 !px-2.5 !text-[11px] whitespace-nowrap cursor-pointer"
              >
                Đăng Ký Miễn Phí
              </button>
            ) : !isVip ? (
              <button
                type="button"
                onClick={() => onOpenAuthModal && onOpenAuthModal("upgrade")}
                className="royal-btn !py-1 !px-2.5 !text-[11px] whitespace-nowrap cursor-pointer flex items-center gap-1"
              >
                <Crown className="w-3.5 h-3.5 text-lacquer-950" />
                <span>Nâng Cấp VIP</span>
              </button>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-600/60 font-mono font-bold">
                Tài Khoản Hội Viên VIP
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-[#140E08] border border-gold-800/80 space-y-1">
              <span className="text-gold-300 font-bold block">1. Khách Chưa Đăng Ký</span>
              <p className="text-ivory-400 text-[11px] leading-relaxed">
                Được sử dụng miễn phí hình thức <strong>Bốc bài Kinh Dịch 1, 2 và 3 Lá</strong> (Đơn quẻ, Song quẻ, Dòng thời gian).
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#140E08] border border-gold-800/80 space-y-1">
              <span className="text-emerald-300 font-bold block">2. Tài Khoản Đã Đăng Ký</span>
              <p className="text-ivory-400 text-[11px] leading-relaxed">
                Được sử dụng <strong>TẤT CẢ các trận pháp</strong> của Bốc bài Kinh Dịch (1 đến 12 lá bài và Tùy ý số lá).
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#140E08] border border-gold-800/80 space-y-1">
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>3. Tài Khoản Hội Viên VIP</span>
              </span>
              <p className="text-ivory-400 text-[11px] leading-relaxed">
                Được sử dụng <strong>TẤT CẢ các phương pháp chiêm bốc</strong>: Bốc bài, Xăm Khổng Minh, Cỏ Thi, 3 Đồng Xu, Mai Hoa và Tam Thức (Lục Nhâm, Kỳ Môn, Thái Ất).
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div id="khu-vuc-boc-que-123" className="scroll-mt-28 flex flex-wrap items-center justify-center gap-1.5 pb-2 border-b border-gold-800">
          {[
            { id: "summary", label: "Quy Chuẩn 3 Phương Pháp (1-2-3 Lá • Miễn Phí)" },
            { id: "advanced", label: "Các Trận Pháp Nâng Cao (7-9-10-12 Lá • Cần Đăng Ký)" },
            { id: "examples", label: "Ví Dụ Thực Tế & Minh Họa Quẻ" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSpreadTab(tab.id as SpreadCategory)}
              className={`px-3.5 py-2 rounded-lg text-xs font-serif font-semibold transition-all cursor-pointer ${
                activeSpreadTab === tab.id
                  ? "bg-gold-500 text-lacquer-950 font-bold shadow-md"
                  : "text-ivory-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: 3 PHƯƠNG PHÁP CƠ BẢN */}
        {activeSpreadTab === "summary" && (
          <div
            className={`grid grid-cols-1 md:grid-cols-3 gap-5 animate-in fade-in duration-200 rounded-2xl p-2 transition-all duration-700 ${
              highlight123
                ? "ring-2 ring-gold-400 bg-gold-500/10 shadow-[0_0_35px_rgba(200,155,60,0.35)] scale-[1.01]"
                : ""
            }`}
          >
            {SPREAD_METHODS_SUMMARY.map((m) => (
              <div
                key={m.type}
                className="royal-card p-6 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#261E14] text-[#E0B861] border border-[#483723]">
                      {m.type === "1_card" ? "1 Lá Bài" : m.type === "2_card" ? "2 Lá Bài" : "3 Lá Bài"}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-600/40">
                      Miễn Phí (Chưa cần đăng ký)
                    </span>
                  </div>

                  <h3 className="font-display text-xl text-ivory-100 mt-3">{m.name}</h3>
                  <p className="text-xs text-gold-400 font-serif font-semibold mt-0.5">{m.subName}</p>
                  <p className="text-xs text-ivory-500 font-serif leading-relaxed mt-3">{m.desc}</p>
                </div>

                <div className="space-y-2 pt-3 border-t border-gold-800/80 text-xs text-ivory-300 font-serif">
                  <div className="text-[11px] font-sans uppercase tracking-wider text-gold-500 font-semibold">
                    Trình tự thực hành:
                  </div>
                  {m.steps.map((st, sIdx) => (
                    <div key={sIdx} className="flex items-start gap-2">
                      <span className="text-gold-400 font-mono font-bold shrink-0">{sIdx + 1}.</span>
                      <span className="leading-snug">{st}</span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const modeMap: Record<string, "single" | "double" | "three"> = {
                      "1_card": "single",
                      "2_card": "double",
                      "3_card": "three",
                    };
                    const targetMode = modeMap[m.type] || "single";
                    if (onSelectDrawMode) {
                      onSelectDrawMode(targetMode);
                    } else {
                      onNavigateTab("divination");
                    }
                  }}
                  className="royal-btn-ghost w-full !py-2 !text-xs text-center cursor-pointer group"
                >
                  <span>Bốc quẻ {m.type === "1_card" ? "1 lá" : m.type === "2_card" ? "2 lá" : "3 lá"} ngay</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: CÁC TRẬN PHÁP NÂNG CAO */}
        {activeSpreadTab === "advanced" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-in fade-in duration-200">
            {[
              {
                title: "Trận Thất Tinh (7 Lá)",
                chinese: "七星北斗陣",
                desc: "Soi chiếu toàn diện 7 góc độ: Quá khứ, Bản thân hiện tại, Xu thế tiếp theo, Lời khuyên, Kết quả, Môi trường khách quan và Điểm mù thiếu sót.",
                suit: "Khảo sát cục diện lớn",
              },
              {
                title: "Trận Cửu Cung Phi Tinh (9 Lá)",
                chinese: "九宮飛星陣",
                desc: "Nạp 9 quẻ vào 9 cung Bát Quái theo Lạc Thư: Trung Cung (bản thể), Càn Tây Bắc (quý nhân), Khảm Chính Bắc (sự nghiệp), Cấn Đông Bắc (tích lũy)...",
                suit: "Định vị phong thủy & sự nghiệp",
              },
              {
                title: "Trận Thập Tinh Chuẩn (10 Lá)",
                chinese: "十星十全陣",
                desc: "Đỉnh cao tương đương Celtic Cross: Bản chất, Hỗ trợ / Trở ngại, Cội nguồn, Quá khứ gần, Xu thế, Tương lai gần, Thái độ, Ngoại cảnh, Hy vọng & Kết cuộc.",
                suit: "Đại sự mang tính bước ngoặt",
              },
              {
                title: "Trận Thập Nhị Cung (12 Lá)",
                chinese: "十二宮歲限陣",
                desc: "Ứng dụng 12 Địa Chi (Tý đến Hợi): Bói vận trình xuyên suốt 12 tháng lưu niên hoặc khảo sát 12 cung chức Mệnh, Tài, Quan, Điền, Phu Thê...",
                suit: "Vận hạn cả năm & 12 cung số",
              },
            ].map((adv, aIdx) => (
              <div key={aIdx} className="royal-card p-6 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-gold-500 font-semibold">
                      {adv.suit}
                    </span>
                    {!isRegistered ? (
                      <span className="text-[9px] font-mono text-amber-300 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-600/40">
                        Cần Đăng Ký
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono text-emerald-300 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-600/40">
                        ✓ Đã Mở Khóa
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-xl text-ivory-100 mt-2">{adv.title}</h3>
                  <div className="text-[11px] font-serif text-gold-600 tracking-wider mt-0.5">{adv.chinese}</div>
                  <p className="text-xs text-ivory-500 font-serif leading-relaxed mt-3">{adv.desc}</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const advMap: ("seven" | "nine" | "ten" | "twelve")[] = ["seven", "nine", "ten", "twelve"];
                    const target = advMap[aIdx] || "seven";
                    if (onSelectDrawMode) {
                      onSelectDrawMode(target);
                    } else {
                      onNavigateTab("divination");
                    }
                  }}
                  className="royal-btn-ghost w-full !py-2 !text-xs text-center cursor-pointer mt-4 group"
                >
                  <span>Thực hành trận này</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: VÍ DỤ THỰC TẾ & MINH HỌA QUẺ */}
        {activeSpreadTab === "examples" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Filter */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gold-800 pb-3">
              <span className="text-xs font-serif text-ivory-400">
                {SPREAD_EXAMPLES.length} Ví dụ thực tế có hình ảnh lá bài minh họa sinh động:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: "all", label: `Tất cả (${SPREAD_EXAMPLES.length})` },
                  { id: "1_card", label: "Trải 1 Lá" },
                  { id: "2_card", label: "Trải 2 Lá" },
                  { id: "3_card", label: "Trải 3 Lá" },
                  { id: "that_tinh", label: "Thất Tinh (7 Lá)" },
                  { id: "thap_tinh", label: "Thập Tinh (10 Lá)" },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setExampleFilter(f.id as any)}
                    className={`px-2.5 py-1 rounded text-xs font-serif cursor-pointer ${
                      exampleFilter === f.id
                        ? "bg-gold-500 text-lacquer-950 font-bold"
                        : "text-ivory-400 hover:text-white"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List of examples */}
            <div className="space-y-6">
              {filteredExamples.map((example) => (
                <div
                  key={example.id}
                  className="royal-card p-5 sm:p-7 space-y-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-gold-800 pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-gold-500 text-lacquer-950">
                        {example.code}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#281F15] text-[#D8C7AA] border border-[#443423]">
                        {example.spreadTypeName}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-serif border ${example.categoryColor}`}>
                        {example.category}
                      </span>
                    </div>
                    <span className="text-xs text-gold-500 font-serif">
                      {example.cards.length} Lá Bài Liên Quan
                    </span>
                  </div>

                  <h3 className="font-display text-xl sm:text-2xl text-ivory-100">
                    {example.title}
                  </h3>

                  {/* Cards visual display */}
                  <div className="bg-[#0E0C09] border border-gold-800/80 rounded-2xl p-4 sm:p-5">
                    <div className="flex flex-wrap items-center justify-center gap-6">
                      {example.cards.map((c, cIdx) => {
                        const hex = HEXAGRAMS.find((h) => h.number === c.hexNumber) || HEXAGRAMS[0];
                        const img = cardImages[c.hexNumber] || null;
                        const vid = cardVideos[c.hexNumber] || null;

                        return (
                          <div key={c.hexNumber} className="flex flex-col items-center max-w-[190px] w-full text-center">
                            <div className="mb-2 px-2.5 py-0.5 rounded-full text-[11px] font-serif font-semibold bg-[#241B12] text-[#E5C378] border border-[#483723]">
                              {c.label}
                            </div>
                            <div className="shadow-lg border border-gold-700/50 rounded-xl overflow-hidden">
                              <CardVisual
                                hexagram={hex}
                                imageUrl={img}
                                videoUrl={vid}
                                size="sm"
                                fitMode="cover"
                              />
                            </div>
                            <div className="mt-2 font-display text-sm text-ivory-100">
                              #{hex.number} {hex.name} ({hex.hanzi})
                            </div>
                            <p className="text-[11px] text-gold-400 font-serif italic mt-0.5">
                              “{c.keyMeaning}”
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 4 Panels */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm font-serif">
                    <div className="p-4 rounded-xl bg-[#140E08] border border-gold-800/70 space-y-1.5">
                      <strong className="text-amber-400 block font-sans uppercase tracking-wider text-xs">
                        1. Tình huống &amp; Câu hỏi
                      </strong>
                      <p className="text-ivory-300 leading-relaxed">{example.context}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-[#140E08] border border-gold-800/70 space-y-1.5">
                      <strong className="text-gold-400 block font-sans uppercase tracking-wider text-xs">
                        2. Phân tích Dịch lý
                      </strong>
                      <p className="text-ivory-300 leading-relaxed whitespace-pre-line">{example.analysis}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-[#140E08] border border-gold-800/70 space-y-1.5">
                      <strong className="text-emerald-400 block font-sans uppercase tracking-wider text-xs">
                        3. Diễn biến thực tế
                      </strong>
                      <p className="text-ivory-300 leading-relaxed">{example.outcome}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-[#140E08] border border-gold-800/70 space-y-1.5 bg-gradient-to-br from-[#1C160F] to-[#14100C]">
                      <strong className="text-amber-300 block font-sans uppercase tracking-wider text-xs">
                        4. Bài học &amp; Sách lược
                      </strong>
                      <p className="text-ivory-200 leading-relaxed italic">“{example.takeaway}”</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ================= PHẦN 4: CTA BỐC QUẺ NGAY ================= */}
      <section className="royal-frame p-6 sm:p-10 text-center relative overflow-hidden">
        <span className="royal-corner tl" />
        <span className="royal-corner tr" />
        <span className="royal-corner bl" />
        <span className="royal-corner br" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <div className="royal-eyebrow">Trực tiếp thực hành chiêm bốc</div>
          <h2 className="royal-title text-2xl sm:text-4xl">
            Bạn đã sẵn sàng tĩnh tâm thỉnh quẻ?
          </h2>
          <p className="text-xs sm:text-sm text-ivory-400 font-serif leading-relaxed">
            Hãy rửa sạch đôi tay, thả lỏng tâm trí và bước vào phòng bốc bài I Ching Tarot để nhận lấy lời chỉ dẫn quý báu từ trí tuệ cổ nhân.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onNavigateTab("divination")}
              className="royal-btn w-full sm:w-auto cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>Vào Bàn Bốc Quẻ I Ching Tarot</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab("pricing")}
              className="royal-btn-ghost w-full sm:w-auto cursor-pointer"
            >
              <span>Xem Báo Giá Dịch Vụ</span>
            </button>
          </div>
        </div>
      </section>

      {/* ================= PHẦN 5: THÔNG TIN LIÊN LẠC ================= */}
      <section id="thong-tin-lien-lac" className="scroll-mt-24 space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <div className="royal-eyebrow">Đồng hành &amp; Tư vấn Dịch học · 聯繫諮詢</div>
          <h2 className="royal-title mt-3 text-3xl sm:text-4xl">
            Thông tin liên lạc Cửu Nhị
          </h2>
          <p className="mt-3 text-sm text-ivory-500 font-serif leading-relaxed">
            Nếu quý bạn có bất kỳ thắc mắc nào về phương pháp bốc bài, kết quả quẻ thỉnh được hoặc cần luận giải chuyên sâu về công việc, gia đạo và cơ nghiệp.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: Hotline & Zalo Trực Tiếp */}
          <div className="royal-card p-6 sm:p-7 flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-gold-600/50 flex items-center justify-center text-gold-300">
                <Phone className="w-6 h-6" />
              </div>

              <div>
                <span className="text-[11px] font-sans uppercase tracking-[0.2em] text-gold-500 block">
                  Hotline / Zalo Riêng
                </span>
                <h3 className="font-display text-2xl text-gold-300 mt-1 tabular-nums">
                  {ZALO_PHONE}
                </h3>
                <span className="text-xs text-ivory-500 font-serif block mt-1">
                  Cửu Nhị Phong Thủy Mệnh Lý &amp; Kinh Dịch
                </span>
              </div>

              <p className="text-xs text-ivory-400 font-serif leading-relaxed">
                Hỗ trợ giải đáp thắc mắc phương pháp bốc bài, tiếp nhận hình ảnh quẻ bốc trên web để luận giải trực tiếp qua Zalo.
              </p>
            </div>

            <div className="space-y-2 pt-3 border-t border-gold-800">
              <a
                href={ZALO_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="royal-btn w-full !py-2.5 !text-xs text-center flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Nhắn Tin Zalo Ngay</span>
              </a>

              <div className="flex items-center gap-2">
                <a
                  href="tel:0902853305"
                  className="flex-1 royal-btn-ghost !py-2 !text-xs text-center flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-gold-500" />
                  <span>Gọi Điện</span>
                </a>

                <button
                  type="button"
                  onClick={handleCopyPhone}
                  className="px-3 py-2 rounded-[2px] border border-gold-700/60 hover:border-gold-400 text-xs text-gold-300 flex items-center gap-1 cursor-pointer transition-colors"
                  title="Sao chép số điện thoại"
                >
                  {copiedPhone ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPhone ? "Đã chép" : "Copy"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Nhóm Zalo Cộng Đồng Dịch Lý */}
          <div className="royal-card p-6 sm:p-7 flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-gold-600/50 flex items-center justify-center text-gold-300">
                <Users className="w-6 h-6" />
              </div>

              <div>
                <span className="text-[11px] font-sans uppercase tracking-[0.2em] text-gold-500 block">
                  Cộng Đồng Giao Lưu
                </span>
                <h3 className="font-display text-2xl text-ivory-100 mt-1">
                  Nhóm Zalo Cửu Nhị
                </h3>
                <span className="text-xs text-ivory-500 font-serif block mt-1">
                  Không gian trao đổi Dịch học &amp; Chia sẻ quẻ bốc
                </span>
              </div>

              <p className="text-xs text-ivory-400 font-serif leading-relaxed">
                Tham gia cộng đồng những người hữu duyên nghiên cứu Kinh Dịch, bốc bài I Ching Tarot, cùng nhau đàm đạo các ca quẻ thực tiễn và nhận các bài viết chuyên sâu.
              </p>
            </div>

            <div className="space-y-2 pt-3 border-t border-gold-800">
              <a
                href={ZALO_GROUP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="royal-btn w-full !py-2.5 !text-xs text-center flex items-center justify-center gap-2"
              >
                <Users className="w-4 h-4" />
                <span>Tham Gia Nhóm Zalo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>

              <p className="text-[11px] text-ivory-500 font-serif text-center pt-1">
                Giao lưu văn minh, tôn trọng học thuật cổ truyền.
              </p>
            </div>
          </div>

          {/* Card 3: Khung Giờ & Cam Kết */}
          <div className="royal-card p-6 sm:p-7 flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-gold-600/50 flex items-center justify-center text-gold-300">
                <Shield className="w-6 h-6" />
              </div>

              <div>
                <span className="text-[11px] font-sans uppercase tracking-[0.2em] text-gold-500 block">
                  Thời Gian &amp; Bảo Mật
                </span>
                <h3 className="font-display text-2xl text-ivory-100 mt-1">
                  08:00 — 22:00
                </h3>
                <span className="text-xs text-ivory-500 font-serif block mt-1">
                  Tất cả các ngày trong tuần (Cả T7 &amp; Chủ Nhật)
                </span>
              </div>

              <ul className="space-y-2 text-xs text-ivory-300 font-serif">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Bảo mật tuyệt đối mọi thông tin và nội dung câu hỏi.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Luận giải trung thực theo đúng đạo lý cổ nhân Chu Dịch.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Sẵn sàng hỗ trợ bạn thấu tỏ căn nguyên vấn đề.</span>
                </li>
              </ul>
            </div>

            <div className="pt-3 border-t border-gold-800">
              <button
                type="button"
                onClick={() => onNavigateTab("pricing")}
                className="royal-btn-ghost w-full !py-2.5 !text-xs text-center cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Xem Báo Giá Dịch Vụ Chuyên Sâu</span>
                <span className="text-gold-500">→</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
