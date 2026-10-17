import React, { useState, useMemo } from "react";
import {
  Flame,
  Snowflake,
  Sun,
  Compass,
  ShieldAlert,
  Sparkles,
  DoorOpen,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  Info,
  ArrowRight,
  HelpCircle,
  Clock,
  Heart,
  Briefcase,
  DollarSign,
  Activity,
  MessageSquare,
  User,
  ShieldCheck,
  Zap,
  BookOpen,
  Users,
  Stethoscope,
  TrendingUp,
  Award,
  Printer,
  FileText,
  Download,
  Scale
} from "lucide-react";
import {
  calculateCompleteHanNhietReading,
  CompleteHanNhietReading,
  FLYING_STARS_DATA,
  COMPASS_DIRECTIONS,
  DIRECTIONS_8,
  getCenterStar,
  getFlyingStarGrid,
  TAISUI_RULES,
  ZODIAC_LIST,
  LIUHE_MAP,
  SANHE_MAP,
  DONG_THO_CUC,
  ZODIAC_2027_VI
} from "../data/hanNhietData";
import { HOUR_BRANCH_RANGES, CHI_NAMES } from "../utils/lunarCalendar";

export const HanNhietMenhSection: React.FC = () => {
  // Main Sub-tabs
  const [activeSubTab, setActiveSubTab] = useState<"ming" | "flystar" | "taisui" | "doormat" | "dongtho" | "zodiac">("ming");

  // ========================================================
  // 1. HÀN NHIỆT MỆNH HOÀN CHỈNH (TÔ DÂN PHONG BÁT TỰ ENGINE)
  // ========================================================
  const [birthDate, setBirthDate] = useState("1995-10-15");
  const [birthHourChiIdx, setBirthHourChiIdx] = useState<number>(6); // Mặc định giờ Ngọ (11:00-12:59)
  const [gender, setGender] = useState<"Nam" | "Nữ">("Nam");
  const [targetYear, setTargetYear] = useState<number>(2027);

  // Tab con trong mục Hàn Nhiệt Mệnh ("all" = Toàn bộ báo cáo kéo dài liên tục)
  const [activeMingInnerTab, setActiveMingInnerTab] = useState<"all" | "pillars" | "five_elements" | "noble_score" | "daivan" | "crucial_years" | "six_pillars" | "remedy">("all");
  const [activeSixPillarIdx, setActiveSixPillarIdx] = useState<number>(0);

  // Xử lý xuất file PDF toàn bộ lá số và báo cáo
  const handleExportPDF = () => {
    setActiveMingInnerTab("all");
    setTimeout(() => {
      window.print();
    }, 250);
  };

  // Tính toán kết quả Bát Tự & Hàn Nhiệt Mệnh toàn diện
  const fullReading: CompleteHanNhietReading | null = useMemo(() => {
    return calculateCompleteHanNhietReading(birthDate, birthHourChiIdx, gender, targetYear);
  }, [birthDate, birthHourChiIdx, gender, targetYear]);

  // Bộ chọn mẫu nhanh (Quick Presets)
  const handleApplyPreset = (type: "han" | "nhiet" | "xuan" | "thu") => {
    if (type === "han") {
      setBirthDate("1990-12-25"); // Mùa đông giá lạnh
      setBirthHourChiIdx(0); // Giờ Tý
    } else if (type === "nhiet") {
      setBirthDate("1992-06-18"); // Mùa hè nắng nóng
      setBirthHourChiIdx(6); // Giờ Ngọ
    } else if (type === "xuan") {
      setBirthDate("1994-03-25"); // Mùa xuân
      setBirthHourChiIdx(3); // Giờ Mão
    } else {
      setBirthDate("1996-09-15"); // Mùa thu
      setBirthHourChiIdx(9); // Giờ Dậu
    }
  };

  // ========================================================
  // 2. CỬU CUNG PHI TINH STATE
  // ========================================================
  const [selectedFlyYear, setSelectedFlyYear] = useState<number>(2027);
  const centerStarNum = useMemo(() => getCenterStar(selectedFlyYear), [selectedFlyYear]);
  const flyingGrid = useMemo(() => getFlyingStarGrid(centerStarNum), [centerStarNum]);
  const [selectedPalace, setSelectedPalace] = useState<{ row: number; col: number } | null>(null);

  // ========================================================
  // 3. THÁI TUẾ STATE
  // ========================================================
  const [selectedTsYear, setSelectedTsYear] = useState<number>(2027);
  const [selectedTsZodiac, setSelectedTsZodiac] = useState<string>("Mùi");

  const tsEvaluation = useMemo(() => {
    const ts = TAISUI_RULES[selectedTsYear] || TAISUI_RULES[2027];
    const z = selectedTsZodiac;
    let type = "Bình Hòa";
    let isClashing = false;
    let detail = `Tuổi ${z} năm nay không phạm Thái Tuế, vận trình tương đối ổn định.`;

    if (z === ts.zodiac.split(" ")[0]) {
      type = "Trực Thái Tuế (Bản Mệnh)";
      isClashing = true;
      detail = `Tuổi ${z} gặp năm ${ts.zodiac} là năm tuổi, vận trình có biến động dao động lớn, tâm lý dễ chao đảo.`;
    } else if (z === ts.clash) {
      type = "Xung Thái Tuế";
      isClashing = true;
      detail = `Tuổi ${z} tương xung với Thái Tuế ${ts.zodiac}. Xung nghĩa là biến dịch (đổi chỗ ở, chuyển công tác, đi xa). Trong động sinh tài, chủ động cầu biến thì cát.`;
    } else if (ts.punish.includes(z)) {
      type = "Hình Thái Tuế";
      isClashing = true;
      detail = `Tuổi ${z} phạm Hình Thái Tuế, dễ phát sinh thị phi tranh cãi, hợp đồng giấy tờ cần rà soát kỹ lưỡng.`;
    } else if (z === ts.harm) {
      type = "Hại Thái Tuế";
      isClashing = true;
      detail = `Tuổi ${z} phạm Hại Thái Tuế, đề phòng tiểu nhân ngầm đố kỵ, cẩn trọng lời ăn tiếng nói và giữ gìn sức khỏe.`;
    } else if (z === ts.dest) {
      type = "Phá Thái Tuế";
      isClashing = true;
      detail = `Tuổi ${z} phạm Phá Thái Tuế, đề phòng hao tán tiền bạc hoặc rạn nứt quan hệ thân tín.`;
    }

    const taiZodiacBase = ts.zodiac.split(" ")[0];
    const partners = [LIUHE_MAP[taiZodiacBase], ...(SANHE_MAP[taiZodiacBase] || [])];
    const clashingSet = new Set([taiZodiacBase, ts.clash, ts.harm, ts.dest]);
    const safeAmulets = partners.filter((p) => p && !clashingSet.has(p));
    const forbiddenAmulets = partners.filter((p) => p && clashingSet.has(p));

    return {
      ts,
      type,
      isClashing,
      detail,
      safeAmulets,
      forbiddenAmulets
    };
  }, [selectedTsYear, selectedTsZodiac]);

  // ========================================================
  // 4. THẢM CỬA STATE
  // ========================================================
  const [selectedDoorYear, setSelectedDoorYear] = useState<number>(2027);
  const [selectedDoorDir, setSelectedDoorDir] = useState<string>("Đông Nam");

  const doorStarResult = useMemo(() => {
    const c = getCenterStar(selectedDoorYear);
    const grid = getFlyingStarGrid(c);
    const dirMap: Record<string, [number, number]> = {
      "Đông Nam": [0, 0],
      "Nam": [0, 1],
      "Tây Nam": [0, 2],
      "Đông": [1, 0],
      "Trung Cung": [1, 1],
      "Tây": [1, 2],
      "Đông Bắc": [2, 0],
      "Bắc": [2, 1],
      "Tây Bắc": [2, 2]
    };
    const [r, col] = dirMap[selectedDoorDir] || [0, 0];
    const starNum = grid[r][col];
    const starInfo = FLYING_STARS_DATA[starNum];
    return {
      starNum,
      starInfo
    };
  }, [selectedDoorYear, selectedDoorDir]);

  // ========================================================
  // 5. ĐỘNG THỔ CỤC STATE
  // ========================================================
  const [selectedDongThoDir, setSelectedDongThoDir] = useState<keyof typeof DONG_THO_CUC.directions>("Nam (Hỏa Sát)");

  // ========================================================
  // 6. 12 CON GIÁP STATE
  // ========================================================
  const [selectedZodiacName, setSelectedZodiacName] = useState<string>("Tý");
  const selectedZodiacData = useMemo(() => {
    return ZODIAC_2027_VI[selectedZodiacName] || ZODIAC_2027_VI["Tý"];
  }, [selectedZodiacName]);

  // Helper trả về màu sắc theo ngũ hành
  const getElementColorClass = (el: string) => {
    switch (el) {
      case "Hỏa":
        return "text-rose-400 bg-rose-950/40 border-rose-600/50";
      case "Thủy":
        return "text-blue-400 bg-blue-950/40 border-blue-600/50";
      case "Mộc":
        return "text-emerald-400 bg-emerald-950/40 border-emerald-600/50";
      case "Kim":
        return "text-amber-300 bg-amber-950/40 border-amber-600/50";
      case "Thổ":
        return "text-gold-400 bg-yellow-950/40 border-gold-700/50";
      default:
        return "text-zinc-300 bg-zinc-900 border-zinc-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner Tiêu Đề Hệ Thống */}
      <div className="royal-frame px-5 py-8 sm:px-10 sm:py-12">
        <span className="royal-corner tl" />
        <span className="royal-corner tr" />
        <span className="royal-corner bl" />
        <span className="royal-corner br" />
        <div className="relative z-10 flex flex-col gap-8">
          <div className="max-w-3xl">
            <div className="royal-eyebrow before:hidden">Tô Dân Phong · Bát Tự độc môn Hồng Kông</div>
            <h2 className="royal-title mt-3 text-4xl sm:text-5xl flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span>Hàn Nhiệt Mệnh <span className="italic text-gold-300">toàn diện</span></span>
              <span className="font-serif text-lg sm:text-xl tracking-[0.35em] text-gold-400">
                寒熱命理
              </span>
            </h2>
            <p className="mt-4 text-sm sm:text-[15px] font-serif text-ivory-300 leading-relaxed">
              Tích hợp trọn vẹn từ <b>80 bài giảng Bát Tự Master Class 2009 – 2010 – 2011</b>: Phân lập triệt để giữa <b>"VẬN"</b> (Đại vận hên xui do Hàn/Nhiệt) và <b>"SỰ"</b> (Tài vận, hôn nhân, sức khỏe, bệnh tạng phủ qua Thập Thần và tương xung tứ trụ).
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-gold-800 border border-gold-800 w-full text-center">
            <div className="bg-lacquer-950 p-3.5">
              <div className="text-[10px] uppercase tracking-[0.16em] text-ivory-500">Lưu Niên Hiện Tại</div>
              <div className="mt-1 font-display text-lg text-gold-300">2027 Đinh Mùi</div>
            </div>
            <div className="bg-lacquer-950 p-3.5">
              <div className="text-[10px] uppercase tracking-[0.16em] text-ivory-500">Khí Hậu Thời Điểm</div>
              <div className="mt-1 font-display text-lg text-cinnabar-400">Hỏa Thổ Khô Nóng</div>
            </div>
            <div className="bg-lacquer-950 p-3.5 col-span-2 sm:col-span-1">
              <div className="text-[10px] uppercase tracking-[0.16em] text-ivory-500">Dụng Thần Khẩu Quyết</div>
              <div className="mt-1 font-display text-lg text-gold-400">Hàn Mộc Hỏa · Nhiệt Kim Thủy</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar mt-10 border-b border-gold-800">
          {[
            { id: "ming", label: "Hàn Nhiệt Mệnh (Toàn Cục)", icon: Flame, badge: "Master Class" },
            { id: "flystar", label: "Cửu Cung Phi Tinh", icon: Compass, badge: "2024-2030" },
            { id: "taisui", label: "Phạm Thái Tuế", icon: ShieldAlert, badge: "Vật Phẩm" },
            { id: "doormat", label: "Thảm Cửa Vượng Trạch", icon: DoorOpen, badge: "8 Hướng" },
            { id: "dongtho", label: "Hóa Động Thổ Sát", icon: Layers, badge: "1997" },
            { id: "zodiac", label: "12 Con Giáp 2027", icon: Sparkles, badge: "12 Tháng" }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-3 -mb-px border-b-2 text-xs sm:text-sm font-serif transition-colors shrink-0 cursor-pointer ${
                  isActive
                    ? "border-gold-400 text-gold-200"
                    : "border-transparent text-ivory-500 hover:text-gold-300"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-gold-300" : "text-gold-600"}`} />
                <span>{tab.label}</span>
                <span className={`text-[10px] uppercase tracking-[0.12em] ${isActive ? "text-gold-400" : "text-gold-700"}`}>
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          SUB-TAB 1: HỆ THỐNG LUẬN MỆNH HOÀN CHỈNH TÔ DÂN PHONG
         ======================================================== */}
      {activeSubTab === "ming" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Thanh Nhập Liệu & Chọn Mẫu Nhanh */}
          <div className="border border-gold-800 border-t-gold-600 bg-lacquer-900/85 p-5 sm:p-6 space-y-5">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-gold-800 pb-4">
              <div>
                <h3 className="text-xl font-display font-semibold text-ivory-100 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-500" />
                  <span>Lập Lá Số & Khảo Sát Bát Tự Hàn Nhiệt Mệnh (1930 – 2035)</span>
                </h3>
                <p className="text-xs text-ivory-500 mt-0.5">
                  Tự động tính toán Tứ Trụ, Thập Thần, Vượng Suy, Vòng Đại Vận 10 năm và 6 Trục Luận Đoán Sự Vụ.
                </p>
              </div>

              {/* Presets Button Bar */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] text-ivory-500">Thử Mẫu:</span>
                <button
                  onClick={() => handleApplyPreset("han")}
                  className="px-2.5 py-1 rounded-sm text-xs font-serif bg-cyan-950/60 text-cyan-300 border border-cyan-700/50 hover:bg-cyan-900/60 transition-all cursor-pointer flex items-center gap-1"
                >
                  <Snowflake className="w-3 h-3 text-cyan-400" />
                  <span>Hàn Mệnh (Mùa Đông)</span>
                </button>
                <button
                  onClick={() => handleApplyPreset("nhiet")}
                  className="px-2.5 py-1 rounded-sm text-xs font-serif bg-rose-950/60 text-rose-300 border border-rose-700/50 hover:bg-rose-900/60 transition-all cursor-pointer flex items-center gap-1"
                >
                  <Flame className="w-3 h-3 text-rose-400" />
                  <span>Nhiệt Mệnh (Mùa Hè)</span>
                </button>
                <button
                  onClick={() => handleApplyPreset("xuan")}
                  className="px-2.5 py-1 rounded-sm text-xs font-serif bg-emerald-950/60 text-emerald-300 border border-emerald-700/50 hover:bg-emerald-900/60 transition-all cursor-pointer flex items-center gap-1"
                >
                  <Sun className="w-3 h-3 text-emerald-400" />
                  <span>Xuân Bình Mệnh</span>
                </button>
                <button
                  onClick={() => handleApplyPreset("thu")}
                  className="px-2.5 py-1 rounded-sm text-xs font-serif bg-amber-950/60 text-amber-300 border border-amber-700/50 hover:bg-amber-900/60 transition-all cursor-pointer flex items-center gap-1"
                >
                  <Sun className="w-3 h-3 text-amber-400" />
                  <span>Thu Bình Mệnh</span>
                </button>
              </div>
            </div>

            {/* Inputs: Ngày, Giờ, Giới tính, Năm xem */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="space-y-1">
                <label className="text-xs text-ivory-300 font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ngày Tháng Năm Sinh (Dương Lịch):</span>
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full bg-lacquer-700 border border-amber-600/40 text-ivory-100 text-xs sm:text-sm rounded-sm px-3 py-2 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-ivory-300 font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Giờ Sinh (12 Canh Giờ):</span>
                </label>
                <select
                  value={birthHourChiIdx}
                  onChange={(e) => setBirthHourChiIdx(Number(e.target.value))}
                  className="w-full bg-lacquer-700 border border-amber-600/40 text-ivory-100 text-xs sm:text-sm rounded-sm px-3 py-2 focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  {HOUR_BRANCH_RANGES.map((h: any, idx: number) => (
                    <option key={idx} value={idx}>
                      Giờ {h.branch} ({h.range})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-ivory-300 font-medium flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>Giới Tính (Khởi Đại Vận):</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGender("Nam")}
                    className={`py-2 rounded-sm text-xs font-serif font-bold transition-all cursor-pointer ${
                      gender === "Nam"
                        ? "bg-amber-500/20 text-gold-300 border border-amber-500/60 shadow"
                        : "bg-lacquer-700 text-ivory-500 border border-gold-800 hover:text-ivory-100"
                    }`}
                  >
                    Nam Mệnh
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender("Nữ")}
                    className={`py-2 rounded-sm text-xs font-serif font-bold transition-all cursor-pointer ${
                      gender === "Nữ"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/60 shadow"
                        : "bg-lacquer-700 text-ivory-500 border border-gold-800 hover:text-ivory-100"
                    }`}
                  >
                    Nữ Mệnh
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-ivory-300 font-medium flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Lưu Niên Khảo Sát:</span>
                </label>
                <select
                  value={targetYear}
                  onChange={(e) => setTargetYear(Number(e.target.value))}
                  className="w-full bg-lacquer-700 border border-amber-600/40 text-ivory-100 text-xs sm:text-sm rounded-sm px-3 py-2 focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                    <option key={y} value={y}>
                      Năm {y} ({y === 2027 ? "Đinh Mùi" : y === 2026 ? "Bính Ngọ" : y === 2028 ? "Mậu Thân" : y})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {fullReading ? (
            <div className="space-y-6">
              {/* Thẻ Nhận Diện Bản Mệnh Lớn (Hero Result) */}
              <div
                className={`p-6 sm:p-7 rounded-md border transition-all ${
                  fullReading.mingProfile.type === "Hàn Mệnh"
                    ? "bg-gradient-to-br from-cyan-950/40 via-[#181C20] to-lacquer-900 border-cyan-500/50 shadow-cyan-900/20"
                    : fullReading.mingProfile.type === "Nhiệt Mệnh"
                    ? "bg-gradient-to-br from-amber-950/40 via-lacquer-700 to-lacquer-900 border-amber-500/50 shadow-amber-900/20"
                    : "bg-gradient-to-br from-emerald-950/40 via-[#191D17] to-lacquer-900 border-emerald-500/50 shadow-emerald-900/20"
                } shadow-2xl relative overflow-hidden`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm text-xs font-serif bg-lacquer-900/70 border border-white/10 text-ivory-300">
                      {fullReading.mingProfile.type === "Hàn Mệnh" && <Snowflake className="w-3.5 h-3.5 text-cyan-400" />}
                      {fullReading.mingProfile.type === "Nhiệt Mệnh" && <Flame className="w-3.5 h-3.5 text-rose-400" />}
                      {fullReading.mingProfile.type.includes("Bình") && <Sun className="w-3.5 h-3.5 text-emerald-400" />}
                      <span>Tiết Khí Sinh: <b>{fullReading.mingProfile.solarTermAtBirth}</b></span>
                      <span>•</span>
                      <span>{fullReading.person.solarDateFormatted}</span>
                      <span>•</span>
                      <span>Giờ {fullReading.person.birthHourChi} ({fullReading.person.hourRange})</span>
                    </div>

                    <h4
                      className={`text-3xl sm:text-4xl font-serif font-extrabold tracking-wide ${
                        fullReading.mingProfile.type === "Hàn Mệnh"
                          ? "text-cyan-300"
                          : fullReading.mingProfile.type === "Nhiệt Mệnh"
                          ? "text-amber-400"
                          : "text-emerald-300"
                      }`}
                    >
                      {fullReading.mingProfile.type}
                    </h4>

                    <div className="text-xs sm:text-sm text-gold-300 font-serif font-semibold">
                      {fullReading.mingProfile.tagline}
                    </div>

                    <p className="text-xs sm:text-sm text-ivory-300 leading-relaxed max-w-2xl">
                      {fullReading.mingProfile.seasonDesc}
                    </p>
                  </div>

                  <div className="bg-lacquer-900/80 border border-amber-600/30 p-4 rounded-sm max-w-md shrink-0 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-serif font-bold text-gold-300">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>Khẩu Quyết Chân Truyền Tô Dân Phong:</span>
                    </div>
                    <p className="text-xs text-ivory-300 italic leading-relaxed">
                      "{fullReading.mingProfile.masterQuote}"
                    </p>
                  </div>
                </div>

                {/* 3 Thẻ Thông Số Ngũ Hành Cốt Lõi */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-6 pt-6 border-t border-white/10">
                  <div className="bg-lacquer-900/80 border border-gold-800 p-4 rounded-sm space-y-1">
                    <span className="text-[11px] text-ivory-500 font-serif uppercase tracking-wider">Ngũ Hành Dụng Thần (Vận)</span>
                    <div className="text-sm font-bold text-amber-300">{fullReading.mingProfile.elementNeed}</div>
                    <div className="text-[11px] text-rose-300/80">{fullReading.mingProfile.elementAvoid}</div>
                  </div>

                  <div className="bg-lacquer-900/80 border border-gold-800 p-4 rounded-sm space-y-1">
                    <span className="text-[11px] text-ivory-500 font-serif uppercase tracking-wider">Phương Vị Hỷ Dụng</span>
                    <div className="text-sm font-bold text-emerald-300">
                      {fullReading.mingProfile.favorableDirections.join(" • ")}
                    </div>
                    <p className="text-[11px] text-ivory-500">Đầu giường, bàn làm việc, phương vị lập nghiệp.</p>
                  </div>

                  <div className="bg-lacquer-900/80 border border-gold-800 p-4 rounded-sm space-y-1">
                    <span className="text-[11px] text-ivory-500 font-serif uppercase tracking-wider">Màu Sắc May Mắn</span>
                    <div className="text-xs font-semibold text-rose-300 leading-snug">
                      {fullReading.mingProfile.favorableColors.join(", ")}
                    </div>
                    <p className="text-[11px] text-ivory-500">Trang phục, xe cộ, phụ kiện, nội thất sinh sống.</p>
                  </div>
                </div>

                {/* Thẻ Quý Cách Độc Môn Tô Dân Phong (0 - 7+ Điểm) */}
                <div className="bg-lacquer-900/90 border border-amber-500/40 p-4 sm:p-5 rounded-sm mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-black/40">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-sm bg-gradient-to-br from-amber-500/20 via-amber-600/30 to-amber-900/40 border border-amber-400/60 flex flex-col items-center justify-center shrink-0 shadow-md shadow-amber-950/40">
                      <span className="text-xl font-serif font-black text-gold-300">{fullReading.nobleScore.totalScore}</span>
                      <span className="text-[9px] font-bold text-amber-200/80 -mt-0.5">/ 7.0+đ</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-serif uppercase tracking-wider text-ivory-500">Chấm Điểm Quý Cách Tô Dân Phong:</span>
                        <span
                          className="text-xs font-bold px-2.5 py-0.5 rounded-sm"
                          style={{
                            color: fullReading.nobleScore.tierBadgeColor,
                            backgroundColor: `${fullReading.nobleScore.tierBadgeColor}15`,
                            border: `1px solid ${fullReading.nobleScore.tierBadgeColor}40`,
                          }}
                        >
                          {fullReading.nobleScore.tierName}
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-ivory-100 mt-0.5">
                        Ước lượng tài sản: <b className="text-amber-400">{fullReading.nobleScore.hkdAssetRange}</b> <span className="text-ivory-500 text-xs">({fullReading.nobleScore.vndAssetRange})</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveMingInnerTab("noble_score")}
                    className="px-4 py-2 rounded-sm text-xs font-serif font-bold bg-amber-500/20 hover:bg-amber-500/30 text-gold-300 border border-amber-500/50 transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
                  >
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>Xem Bảng Điểm 7 Tiêu Chí</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Sub-Navigation Bar bên trong Hàn Nhiệt Mệnh & Nút Xuất PDF */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-b border-gold-800 pb-3 no-print">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                  {[
                    { id: "all", label: "📜 Toàn Bộ Báo Cáo (Xem Liên Tục)", icon: FileText },
                    { id: "pillars", label: "Tứ Trụ & Căn Cốt", icon: Layers },
                    { id: "five_elements", label: "Điểm Ngũ Hành & Hỷ Kỵ", icon: Scale },
                    { id: "noble_score", label: "Chấm Điểm Quý Cách (0 – 7+)", icon: Award },
                    { id: "daivan", label: "Đại Vận (80 Năm)", icon: TrendingUp },
                    { id: "crucial_years", label: "Năm Then Chốt & Bí Pháp", icon: Zap },
                    { id: "six_pillars", label: "6 Trục Luận Đoán", icon: BookOpen },
                    { id: "remedy", label: "Cẩm Nang Cải Vận", icon: Compass }
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = activeMingInnerTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveMingInnerTab(item.id as any)}
                        className={`flex items-center gap-2 px-3.5 py-2.5 rounded-sm text-xs sm:text-sm font-serif transition-all shrink-0 cursor-pointer ${
                          isActive
                            ? "bg-amber-500/25 text-gold-300 border border-amber-500/70 font-bold shadow-md shadow-amber-950/40"
                            : "bg-lacquer-800 text-ivory-500 hover:text-ivory-100 border border-gold-800"
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? "text-gold-300" : "text-amber-500/70"}`} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Nút Xuất PDF / In Báo Cáo */}
                <button
                  onClick={handleExportPDF}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-sm text-xs sm:text-sm font-serif font-bold bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-lacquer-900 hover:brightness-110 shadow-lg shadow-amber-950/50 transition-all shrink-0 cursor-pointer"
                  title="Xuất toàn bộ lá số Bát Tự & Luận giải chi tiết thành file PDF"
                >
                  <Printer className="w-4 h-4 text-lacquer-900" />
                  <span>Xuất File PDF / In Báo Cáo</span>
                </button>
              </div>

              {/* KHUNG BÁO CÁO TOÀN DIỆN (HỖ TRỢ CUỘN LIÊN TỤC & IN PDF) */}
              <div id="complete-bazi-report" className="space-y-8">
                {/* Print Header: Chỉ hiển thị khi In hoặc Lưu PDF */}
                <div className="hidden print:block border-b-2 border-amber-600/70 pb-4 mb-6 text-center">
                  <div className="text-[11px] uppercase tracking-widest text-amber-500 font-bold">
                    HỌC VIỆN PHONG THỦY & MỆNH LÝ TÔ DÂN PHONG (PETER SO MAN-FONG) • HỒNG KÔNG
                  </div>
                  <h2 className="text-3xl font-display font-semibold text-amber-400 mt-1">
                    HỒ SƠ BÁO CÁO TOÀN DIỆN: HÀN NHIỆT MỆNH & VẬN TRÌNH CUỘC ĐỜI
                  </h2>
                  <div className="text-xs text-ivory-300 mt-2 flex justify-center gap-4 flex-wrap">
                    <span><b>Đương số:</b> {fullReading.person.gender}</span>
                    <span>•</span>
                    <span><b>Ngày sinh:</b> {fullReading.person.solarDateFormatted} (Dương Lịch)</span>
                    <span>•</span>
                    <span><b>Giờ sinh:</b> Giờ {fullReading.person.birthHourChi} ({fullReading.person.hourRange})</span>
                    <span>•</span>
                    <span><b>Bản Mệnh:</b> {fullReading.mingProfile.type}</span>
                    <span>•</span>
                    <span><b>Năm khảo sát:</b> {fullReading.person.targetYear}</span>
                  </div>
                </div>

              {/* PHẦN 1: TỨ TRỤ BÁT TỰ & CĂN CỐT */}
              {(activeMingInnerTab === "all" || activeMingInnerTab === "pillars") && (
                <div className="space-y-6 animate-fadeIn page-break-avoid">
                  {activeMingInnerTab === "all" && (
                    <div className="flex items-center gap-2 text-sm font-serif font-bold text-amber-400 uppercase tracking-wider pb-2 border-b border-amber-600/30">
                      <Layers className="w-4 h-4 text-amber-400" />
                      <span>PHẦN 1: LÁ SỐ TỨ TRỤ BÁT TỰ & THẦN KHÍ NHẬT CAN</span>
                    </div>
                  )}
                  {/* Bảng 4 Cột Tứ Trụ Phong Cách Hoàng Kim */}
                  <div className="border border-gold-800 border-t-gold-600 bg-lacquer-900/85 p-5 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-gold-800 pb-3">
                      <div className="space-y-0.5">
                        <h4 className="text-base font-serif font-bold text-ivory-100 flex items-center gap-2">
                          <Layers className="w-4 h-4 text-amber-500" />
                          <span>Lá Số Tứ Trụ Bát Tự (Can Chi • Thập Thần • Tàng Can)</span>
                        </h4>
                        <p className="text-xs text-ivory-500">
                          Chiêm nghiệm 4 giai đoạn cuộc đời và mối liên kết lục thân tổ tiên, phụ mẫu, bản thân, tử tức.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        fullReading.pillars.year,
                        fullReading.pillars.month,
                        fullReading.pillars.day,
                        fullReading.pillars.hour
                      ].map((p, idx) => (
                        <div
                          key={idx}
                          className={`bg-lacquer-800 border rounded-sm p-4 flex flex-col justify-between space-y-3 ${
                            p.title.includes("Ngày")
                              ? "border-amber-500/70 shadow-lg shadow-amber-900/20 bg-gradient-to-b from-lacquer-700 to-lacquer-800"
                              : "border-gold-800"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-serif font-bold text-gold-300">{p.title}</span>
                              <span className="text-[10px] text-ivory-500">{p.lifeStage.split(" ")[1]}</span>
                            </div>
                            <div className="text-[10px] text-ivory-300 mt-0.5">{p.palaceMeaning.split("•")[0]}</div>
                          </div>

                          {/* Thiên Can */}
                          <div className="text-center py-2.5 bg-lacquer-900 rounded-sm border border-white/5 space-y-0.5">
                            <div className="text-[10px] px-2 py-0.2 rounded-sm inline-block font-medium bg-white/5 text-ivory-300">
                              {p.tenGod}
                            </div>
                            <div className="text-2xl sm:text-3xl font-extrabold text-ivory-100 tracking-wider">
                              {p.chineseCan}
                            </div>
                            <div className="text-xs font-bold text-gold-300">{p.can}</div>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded border font-semibold inline-block mt-0.5 ${getElementColorClass(p.elementCan)}`}>
                              Hành {p.elementCan}
                            </span>
                          </div>

                          {/* Địa Chi */}
                          <div className="text-center py-2.5 bg-lacquer-900 rounded-sm border border-white/5 space-y-0.5">
                            <div className="text-2xl sm:text-3xl font-extrabold text-ivory-100 tracking-wider">
                              {p.chineseChi}
                            </div>
                            <div className="text-xs font-bold text-gold-300">{p.chi}</div>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded border font-semibold inline-block mt-0.5 ${getElementColorClass(p.elementChi)}`}>
                              Hành {p.elementChi}
                            </span>
                          </div>

                          {/* Tàng Can */}
                          <div className="bg-lacquer-900 p-2 rounded-sm border border-white/5 space-y-1">
                            <div className="text-[10px] text-ivory-500 uppercase font-serif tracking-wider text-center">
                              Địa Chi Tàng Can
                            </div>
                            <div className="space-y-1 pt-0.5">
                              {p.hiddenStems.map((h, hIdx) => (
                                <div key={hIdx} className="flex items-center justify-between text-[11px] px-1.5 py-0.5 rounded bg-white/[0.02]">
                                  <span className="text-ivory-100 font-medium">{h.stem} ({h.chinese})</span>
                                  <span className="text-amber-400/90 text-[10px]">{h.tenGod}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Nạp Âm */}
                          <div className="text-center text-[10px] text-ivory-500 pt-1 border-t border-white/5">
                            Nạp Âm: <b className="text-ivory-300">{p.napAm}</b>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Khối Thần Khí Nhật Can & Quan Điểm Đột Phá Tô Dân Phong (Bỏ Chấp Niệm Vượng Nhược) */}
                  <div className="border border-gold-800 border-t-gold-600 bg-lacquer-900/85 p-5 sm:p-6 space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gold-800 pb-3">
                      <div>
                        <h4 className="text-base font-serif font-bold text-ivory-100 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          <span>Thần Khí Nhật Can & Tố Chất Thiên Phú (Bỏ Chấp Niệm Vượng Nhược)</span>
                        </h4>
                        <p className="text-xs text-ivory-500">
                          Hệ thống Tô Dân Phong không dùng Thân Vượng hay Thân Nhược để chọn Dụng Thần. Vận mệnh do Hàn Nhiệt (Điều Hậu) quyết định; Tính khí do Nhật Can chủ trì; Sự nghiệp do Thập Thần & Đại Vận dẫn lối.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-ivory-500">Bản Thể Nhật Can:</span>
                        <span className="text-xs px-3 py-1 rounded-sm font-bold bg-amber-500/20 text-gold-300 border border-amber-500/40">
                          Can {fullReading.dayMaster.name} ({fullReading.dayMaster.yinYang} {fullReading.dayMaster.element})
                        </span>
                      </div>
                    </div>

                    {/* Lời Giảng Đột Phá Chân Truyền Tô Dân Phong */}
                    <div className="bg-amber-950/20 border-l-4 border-amber-500 p-4 rounded-r-xl space-y-1">
                      <div className="text-xs font-serif font-bold text-gold-300 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-400" />
                        <span>Lời Giảng Chân Truyền Tô Dân Phong Về "Thân Vượng / Thân Nhược":</span>
                      </div>
                      <p className="text-xs sm:text-[13px] text-ivory-100 leading-relaxed italic">
                        "{fullReading.dayMaster.peterSoPhilosophy}"
                      </p>
                    </div>

                    {/* 3 Cột: Khí Tượng Nhật Can - Phong Cách Thập Thần - Kim Chỉ Nam Đại Vận */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Cột 1: Tượng Trưng & Tâm Tính Thiên Phú Can Ngày */}
                      <div className="p-4 rounded-sm bg-lacquer-800 border border-gold-800 space-y-2">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <span className="text-xs font-serif font-bold text-gold-300 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-amber-400" />
                            1. Khí Tượng Nhật Can
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-white/5 text-amber-300">
                            {fullReading.dayMaster.stemSymbol}
                          </span>
                        </div>
                        <p className="text-xs text-ivory-300 leading-relaxed">
                          {fullReading.dayMaster.psychology}
                        </p>
                      </div>

                      {/* Cột 2: Hướng Đi Sự Nghiệp Theo Thập Thần */}
                      <div className="p-4 rounded-sm bg-lacquer-800 border border-gold-800 space-y-2">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <span className="text-xs font-serif font-bold text-gold-300 flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                            2. Định Hướng Thập Thần
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-300">
                            {fullReading.sixPillarsAnalysis.careerAndWealth.roleRecommendation.includes("Làm Chủ") ? "KHỞI NGHIỆP / TỰ CHỦ" : "QUẢN TRỊ / CHUYÊN MÔN"}
                          </span>
                        </div>
                        <p className="text-xs text-ivory-300 leading-relaxed">
                          {fullReading.dayMaster.careerOrientationByGod}
                        </p>
                      </div>

                      {/* Cột 3: Kim Chỉ Nam Hành Động Theo Vòng Vận */}
                      <div className="p-4 rounded-sm bg-lacquer-800 border border-gold-800 space-y-2">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <span className="text-xs font-serif font-bold text-gold-300 flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                            3. Kim Chỉ Nam Đại Vận
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-blue-500/20 text-blue-300">
                            THUẬN DŨNG • NGHỊCH THỦ
                          </span>
                        </div>
                        <p className="text-xs text-ivory-300 leading-relaxed">
                          {fullReading.dayMaster.actionRuleByLuck}
                        </p>
                      </div>
                    </div>

                    {/* Thanh đối chiếu phụ trợ Tử Bình truyền thống */}
                    <div className="bg-lacquer-900 border border-white/5 p-3.5 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-ivory-500">
                      <div className="flex items-center gap-2">
                        <Info className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span>
                          <b>Đối chiếu phụ trợ Tử Bình cổ điển:</b> {fullReading.dayMaster.strength} ({fullReading.dayMaster.strengthScore}/100đ) • {fullReading.dayMaster.deLenh ? "Đắc lệnh tháng" : "Không đắc lệnh"} • {fullReading.dayMaster.deDia ? "Địa chi có thông căn" : "Gốc chi mỏng"}.
                        </span>
                      </div>
                      <span className="italic text-zinc-500 text-[10.5px]">
                        *Tô Dân Phong: Chỉ mang tính chất tham khảo tính khí, không dùng để bắt Dụng Thần.
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* PHẦN 1.5: BẢNG ĐIỂM NGŨ HÀNH & ĐỒNG ĐẢNG / DỊ ĐẢNG (BÁT TỰ BÚT KÝ V16 • TÔ DÂN PHONG) */}
              {(activeMingInnerTab === "all" || activeMingInnerTab === "five_elements") && (
                <div className="space-y-6 animate-fadeIn page-break-avoid">
                  {activeMingInnerTab === "all" && (
                    <div className="flex items-center gap-2 text-sm font-serif font-bold text-amber-400 uppercase tracking-wider pb-2 border-b border-amber-600/30">
                      <Scale className="w-4 h-4 text-amber-400" />
                      <span>PHẦN 1.5: ĐỊNH LƯỢNG NGŨ HÀNH • ĐỒNG ĐẢNG vs DỊ ĐẢNG & HỶ KỴ (BÚT KÝ V16)</span>
                    </div>
                  )}

                  <div className="border border-gold-800 border-t-gold-600 bg-lacquer-900/85 p-5 sm:p-6 space-y-6">
                    {/* Header Khối */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gold-800 pb-4">
                      <div>
                        <h4 className="text-base font-serif font-bold text-ivory-100 flex items-center gap-2">
                          <Scale className="w-4 h-4 text-amber-400" />
                          <span>Định Lượng Điểm Số Ngũ Hành & Cân Bằng Năng Lượng (Tô Dân Phong)</span>
                        </h4>
                        <p className="text-xs text-ivory-500">
                          Thuật toán tính điểm độc môn từ Bát Tự Bút Ký V16 (Vương Thế Đạt - Tô Dân Phong): Thiên can 5đ • Chi nguyệt lệnh 100đ, giờ 75đ, ngày 50đ, năm 25đ • Tàng can 5-20đ • Trợ sinh 1/3đ.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-ivory-500">Tổng điểm 4 trụ:</span>
                        <span className="text-xs px-3 py-1 rounded-sm font-bold bg-amber-500/20 text-gold-300 border border-amber-500/40">
                          {fullReading.fiveElementsDetail.totalScore.toFixed(1)} Điểm
                        </span>
                      </div>
                    </div>

                    {/* Lưới Điểm 5 Hành & Thanh Tiến Trình */}
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                      {(["Mộc", "Hỏa", "Thổ", "Kim", "Thủy"] as const).map((el) => {
                        const sc = fullReading.fiveElementsDetail.scores[el] || 0;
                        const pct = Math.min(100, Math.round((sc / 200) * 100));
                        const isHigh = sc >= 130;
                        const isLow = sc < 29;

                        let colorTheme = {
                          bar: "from-emerald-500 to-green-400",
                          text: "text-emerald-400",
                          border: "border-emerald-600/40",
                          bg: "bg-emerald-950/20"
                        };
                        if (el === "Hỏa") {
                          colorTheme = { bar: "from-rose-500 to-amber-500", text: "text-rose-400", border: "border-rose-600/40", bg: "bg-rose-950/20" };
                        } else if (el === "Thổ") {
                          colorTheme = { bar: "from-amber-600 to-gold-500", text: "text-gold-400", border: "border-gold-600/40", bg: "bg-yellow-950/20" };
                        } else if (el === "Kim") {
                          colorTheme = { bar: "from-zinc-400 to-amber-200", text: "text-amber-200", border: "border-zinc-500/40", bg: "bg-zinc-800/20" };
                        } else if (el === "Thủy") {
                          colorTheme = { bar: "from-blue-600 to-cyan-400", text: "text-blue-400", border: "border-blue-600/40", bg: "bg-blue-950/20" };
                        }

                        return (
                          <div
                            key={el}
                            className={`p-3.5 rounded-sm border ${colorTheme.border} ${colorTheme.bg} space-y-2 flex flex-col justify-between`}
                          >
                            <div className="flex items-center justify-between">
                              <span className={`text-sm font-serif font-bold ${colorTheme.text}`}>
                                Hành {el}
                              </span>
                              <span className="text-xs font-mono font-bold text-ivory-100">
                                {sc.toFixed(1)}đ
                              </span>
                            </div>

                            {/* Thanh Progress */}
                            <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden border border-white/5">
                              <div
                                className={`h-full bg-gradient-to-r ${colorTheme.bar} rounded-full transition-all duration-500`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>

                            {/* Badge trạng thái */}
                            <div className="pt-1 flex items-center justify-between text-[10px]">
                              {isHigh ? (
                                <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40">
                                  Quá Vượng (≥130)
                                </span>
                              ) : isLow ? (
                                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                                  Suy Kiệt (&lt;29)
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30">
                                  Cân Bằng
                                </span>
                              )}
                              <span className="text-ivory-500">
                                {((sc / fullReading.fiveElementsDetail.totalScore) * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* So Sánh Đồng Đảng vs Dị Đảng (Địch) */}
                    <div className="bg-lacquer-800 border border-gold-800 rounded-sm p-5 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                        <div className="space-y-0.5">
                          <span className="text-xs font-serif font-bold text-gold-300 flex items-center gap-1.5">
                            <Scale className="w-4 h-4 text-amber-400" />
                            Đối Trọng Cân Bằng: Đồng Đảng vs Dị Đảng (Địch)
                          </span>
                          <span className="text-[11px] text-ivory-500">
                            Đồng Đảng = Bản thân (Tỷ Kiếp) + Mẹ/Nâng đỡ (Ấn) • Dị Đảng = Tư tưởng/Xả thân (Thực Thương) + Tiền tài (Tài) + Áp lực/Công việc (Quan Sát).
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-ivory-500">Kết luận thể trạng:</span>
                          <span className={`text-xs px-3 py-1 rounded-sm font-bold border ${
                            fullReading.fiveElementsDetail.strengthVerdict.includes("Cường") || fullReading.fiveElementsDetail.strengthVerdict.includes("Vượng")
                              ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/50"
                              : fullReading.fiveElementsDetail.strengthVerdict.includes("Nhược")
                              ? "bg-amber-950/40 text-amber-300 border-amber-500/50"
                              : "bg-blue-950/40 text-blue-300 border-blue-500/50"
                          }`}>
                            {fullReading.fiveElementsDetail.strengthVerdict}
                          </span>
                        </div>
                      </div>

                      {/* Thanh so sánh trực quan Đồng Đảng vs Dị Đảng */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-serif">
                          <span className="text-emerald-400 font-bold">
                            Đồng Đảng: {fullReading.fiveElementsDetail.dongDang.toFixed(1)} Điểm ({((fullReading.fiveElementsDetail.dongDang / fullReading.fiveElementsDetail.totalScore) * 100).toFixed(1)}%)
                          </span>
                          <span className="text-amber-400 font-bold">
                            Dị Đảng (Địch): {fullReading.fiveElementsDetail.diDang.toFixed(1)} Điểm ({((fullReading.fiveElementsDetail.diDang / fullReading.fiveElementsDetail.totalScore) * 100).toFixed(1)}%)
                          </span>
                        </div>
                        <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden flex border border-white/5">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 transition-all duration-500"
                            style={{
                              width: `${(fullReading.fiveElementsDetail.dongDang / fullReading.fiveElementsDetail.totalScore) * 100}%`
                            }}
                            title="Tỷ lệ Đồng Đảng"
                          />
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-500"
                            style={{
                              width: `${(fullReading.fiveElementsDetail.diDang / fullReading.fiveElementsDetail.totalScore) * 100}%`
                            }}
                            title="Tỷ lệ Dị Đảng"
                          />
                        </div>
                        <p className="text-xs text-ivory-300 pt-1 leading-relaxed">
                          {fullReading.fiveElementsDetail.strengthExplanation}
                        </p>
                      </div>

                      <div className="bg-amber-950/20 border-l-4 border-amber-500/80 p-3 rounded-r-lg text-[11.5px] text-ivory-300 italic">
                        <b>Tô Dân Phong nhấn mạnh:</b> "Hàn Nhiệt Mệnh (mùa sinh) quyết định 100% Hỷ Dụng Thần điều hậu. Thân Vượng hay Nhược không dùng để bắt Dụng Thần như Tử Bình cổ, mà phản ánh mô hình vận hành nguyên khí, sức chịu tải áp lực và cảnh báo tạng phủ bệnh tật."
                      </div>
                    </div>

                    {/* Bảng Ngũ Hành Hỷ Kỵ & Thập Thần 5 Hành */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-serif font-bold text-gold-300 uppercase tracking-wider">
                          Phân Tích Chi Tiết 5 Ngũ Hành Theo Thập Thần & Hỷ Kỵ Tô Dân Phong
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        {fullReading.fiveElementsDetail.hyKyBreakdown.map((item) => {
                          const isFav = item.isFavorable;
                          const isAvoid = item.favorableLevel.includes("Kỵ");
                          return (
                            <div
                              key={item.element}
                              className={`p-3.5 rounded-sm border flex flex-col justify-between space-y-2.5 transition-all ${
                                isFav
                                  ? "bg-gradient-to-b from-emerald-950/30 to-lacquer-800 border-emerald-500/40 shadow-sm shadow-emerald-950/30"
                                  : isAvoid
                                  ? "bg-gradient-to-b from-rose-950/30 to-lacquer-800 border-rose-500/40"
                                  : "bg-lacquer-800 border-gold-800"
                              }`}
                            >
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className={`text-sm font-serif font-bold ${
                                    isFav ? "text-emerald-400" : isAvoid ? "text-rose-400" : "text-amber-300"
                                  }`}>
                                    Hành {item.element}
                                  </span>
                                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                                    isFav
                                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                      : isAvoid
                                      ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                                      : "bg-white/5 text-zinc-300 border-white/10"
                                  }`}>
                                    {item.favorableLevel.split(" ")[0]}
                                  </span>
                                </div>

                                <div className="text-[11px] font-bold text-gold-300">
                                  {item.tenGodCategory}
                                </div>

                                <p className="text-[10.5px] text-ivory-500 leading-snug">
                                  {item.tenGodRole}
                                </p>
                              </div>

                              <div className="pt-2 border-t border-white/5 text-[10.5px] text-ivory-300 leading-relaxed">
                                {item.description}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Cảnh Báo Sức Khỏe Tạng Phủ (Ngũ Hành Quá Vượng >= 130 hoặc Suy Kiệt < 29) */}
                    {fullReading.fiveElementsDetail.organVulnerabilities.some(o => o.status !== "Bình Thường") && (
                      <div className="bg-rose-950/20 border border-rose-500/30 rounded-sm p-4 sm:p-5 space-y-3">
                        <div className="flex items-center gap-2 text-rose-400 font-serif font-bold text-xs uppercase tracking-wider">
                          <Stethoscope className="w-4 h-4 text-rose-400 shrink-0" />
                          <span>Cảnh Báo Tạng Phủ Sức Khỏe Ngũ Hành (Bút Ký V16 • Vương Thế Đạt - Tô Dân Phong)</span>
                        </div>
                        <p className="text-xs text-ivory-300 leading-relaxed">
                          Trong hệ thống Bát Tự Bút Ký V16, ngũ hành đạt từ <b>130 điểm trở lên</b> (quá vượng tích tụ) hoặc <b>dưới 29 điểm</b> (quá suy kiệt bất túc) là nguyên nhân gây suy giảm chức năng các tạng phủ tương ứng:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                          {fullReading.fiveElementsDetail.organVulnerabilities
                            .filter(o => o.status !== "Bình Thường")
                            .map((o) => (
                              <div
                                key={o.element}
                                className="bg-lacquer-900 border border-rose-500/40 rounded-sm p-3 space-y-1.5"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-serif font-bold text-rose-300">
                                    Hành {o.element} ({o.score.toFixed(1)} Điểm)
                                  </span>
                                  <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                                    {o.status}
                                  </span>
                                </div>
                                <div className="text-[11px] text-gold-300">
                                  <b>Tạng phủ / Cơ quan chịu ảnh hưởng:</b> {o.affectedOrgans}
                                </div>
                                <div className="text-[11px] text-ivory-300 italic">
                                  {o.warning}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PHẦN 2: CHẤM ĐIỂM QUÝ CÁCH ĐỘC MÔN TÔ DÂN PHONG (0 – 7+ ĐIỂM) */}
              {(activeMingInnerTab === "all" || activeMingInnerTab === "noble_score") && (
                <div className="space-y-6 animate-fadeIn page-break-avoid">
                  {activeMingInnerTab === "all" && (
                    <div className="flex items-center gap-2 text-sm font-serif font-bold text-amber-400 uppercase tracking-wider pb-2 border-b border-amber-600/30">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>PHẦN 2: CHẤM ĐIỂM QUÝ CÁCH ĐỘC MÔN (0 – 7+ ĐIỂM) & ĐẲNG CẤP TÀI PHÚ</span>
                    </div>
                  )}
                  {/* Thẻ Điểm Tổng Quan & Quy Đổi Tài Phú */}
                  <div className="border border-gold-800 border-t-gold-600 bg-lacquer-900/85 p-6 sm:p-7 relative overflow-hidden space-y-6">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-gold-800 pb-6">
                      <div className="flex items-center gap-5">
                        <div className="w-20 h-20 rounded-md bg-gradient-to-br from-amber-500/20 via-amber-600/30 to-amber-900/40 border-2 border-amber-400 flex flex-col items-center justify-center shrink-0 shadow-lg shadow-amber-900/30">
                          <span className="text-3xl font-serif font-black text-gold-300 tracking-tight">{fullReading.nobleScore.totalScore}</span>
                          <span className="text-[11px] font-bold text-amber-200/80 -mt-1">/ 7.0+ Điểm</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-serif uppercase tracking-widest text-ivory-500">Bát Tự Quý Cách Kế Phân Pháp:</span>
                            <span
                              className="text-xs font-bold px-3 py-0.5 rounded-sm"
                              style={{
                                color: fullReading.nobleScore.tierBadgeColor,
                                backgroundColor: `${fullReading.nobleScore.tierBadgeColor}18`,
                                border: `1px solid ${fullReading.nobleScore.tierBadgeColor}50`,
                              }}
                            >
                              {fullReading.nobleScore.tierName}
                            </span>
                          </div>
                          <h3 className="text-3xl sm:text-4xl font-display font-semibold text-ivory-100">
                            Tài Sản Ước Lượng: <span className="text-amber-400">{fullReading.nobleScore.hkdAssetRange}</span>
                          </h3>
                          <p className="text-xs sm:text-sm text-ivory-300">
                            Quy đổi giá trị tương đương: <b className="text-emerald-400">{fullReading.nobleScore.vndAssetRange}</b>
                          </p>
                        </div>
                      </div>

                      <div className="bg-lacquer-900 border border-gold-800 p-4 rounded-sm max-w-sm space-y-1 shrink-0">
                        <div className="text-[11px] text-ivory-500 font-serif uppercase tracking-wider flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                          <span>Đẳng Cấp Cách Cục Xã Hội</span>
                        </div>
                        <div className="text-xs text-ivory-300 leading-relaxed font-medium">
                          {fullReading.nobleScore.careerStatusVerdict}
                        </div>
                      </div>
                    </div>

                    {/* Trích dẫn nguyên văn Tô Dân Phong */}
                    <div className="bg-amber-950/20 border-l-4 border-amber-400 p-4 rounded-r-xl space-y-1">
                      <div className="text-xs font-serif font-bold text-gold-300 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-amber-400" />
                        <span>Lời Giảng Độc Môn Của Đại Sư Tô Dân Phong (2011 Lesson 28 & 30):</span>
                      </div>
                      <p className="text-xs sm:text-sm text-ivory-100 italic leading-relaxed">
                        "{fullReading.nobleScore.masterQuote}"
                      </p>
                    </div>

                    {/* Danh Sách 7 Tiêu Chí Chấm Điểm Chi Tiết */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-serif font-bold text-gold-300 uppercase tracking-wider flex items-center gap-2">
                          <Layers className="w-4 h-4 text-amber-500" />
                          <span>Bảng Điểm Chi Tiết 7 Tiêu Chí Quý Cách (八字格局計分法)</span>
                        </h4>
                        <span className="text-[11px] text-ivory-500">Điểm tối đa: {fullReading.nobleScore.maxPossible}đ</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {fullReading.nobleScore.criteria.map((c, idx) => (
                          <div
                            key={c.id}
                            className={`p-4 rounded-sm border flex flex-col justify-between space-y-2.5 transition-all ${
                              c.status === "Đạt chuẩn xuất sắc"
                                ? "bg-lacquer-800 border-emerald-500/40 shadow-sm"
                                : c.status === "Đạt yêu cầu"
                                ? "bg-lacquer-800 border-amber-600/30"
                                : c.status === "Trung bình / Có tỳ vết"
                                ? "bg-lacquer-800 border-orange-600/30"
                                : "bg-[#18110D] border-rose-800/40"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] font-bold text-amber-400/90 font-mono">0{idx + 1}.</span>
                                  <span className="text-xs sm:text-sm font-serif font-bold text-ivory-100">{c.name}</span>
                                  <span className="text-[10px] text-ivory-500 font-mono">({c.chinese})</span>
                                </div>
                                <div className="mt-1">
                                  <span
                                    className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                                      c.status === "Đạt chuẩn xuất sắc"
                                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                        : c.status === "Đạt yêu cầu"
                                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                        : c.status === "Trung bình / Có tỳ vết"
                                        ? "bg-orange-500/20 text-orange-300 border border-orange-500/40"
                                        : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                                    }`}
                                  >
                                    {c.status}
                                  </span>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <div className="text-lg font-serif font-black text-amber-400">
                                  +{c.score}
                                  <span className="text-xs font-normal text-ivory-500">/{c.maxScore}đ</span>
                                </div>
                              </div>
                            </div>

                            <p className="text-xs text-ivory-300 leading-relaxed bg-lacquer-900/70 p-2.5 rounded-sm border border-white/5">
                              {c.explanation}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bảng Quy Chiếu 6 Bậc Phú Quý & Thang Điểm Chuẩn Tô Dân Phong */}
                    <div className="bg-lacquer-900 border border-gold-800 rounded-sm p-4 sm:p-5 space-y-4">
                      <div className="flex items-center justify-between border-b border-gold-800 pb-3">
                        <div className="space-y-0.5">
                          <h5 className="text-xs sm:text-sm font-serif font-bold text-gold-300 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-amber-400" />
                            <span>Bảng Quy Chiếu 6 Bậc Phú Quý (Khẩu Quyết Độc Môn Sư Phụ Tô Dân Phong)</span>
                          </h5>
                          <p className="text-[11px] text-ivory-500">
                            Đúc kết nguyên văn từ Bát Tự Master Class 2011: Định lượng mức tài sản và vị thế xã hội theo điểm số Bát Tự.
                          </p>
                        </div>
                      </div>

                      <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-gold-800 text-ivory-500 font-serif">
                              <th className="py-2 px-3">Thang Điểm</th>
                              <th className="py-2 px-3">Cấp Bậc Cách Cục</th>
                              <th className="py-2 px-3">Tài Sản Ước Lượng (HKD)</th>
                              <th className="py-2 px-3">Quy Đổi VND</th>
                              <th className="py-2 px-3">Địa Vị Xã Hội & Đời Sống</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-lacquer-700 text-ivory-300">
                            <tr className={fullReading.nobleScore.totalScore < 2.0 ? "bg-amber-500/10 font-bold text-amber-300" : ""}>
                              <td className="py-2.5 px-3 font-mono text-zinc-400">&lt; 2.0 Điểm</td>
                              <td className="py-2.5 px-3 font-medium">Hạ Cách / Phổ Thông</td>
                              <td className="py-2.5 px-3">&lt; 5 Triệu HKD</td>
                              <td className="py-2.5 px-3">&lt; 15 Tỷ VND</td>
                              <td className="py-2.5 px-3 text-ivory-500">Làm công ăn lương, tích lũy từ từ, đời sống bình đạm an yên.</td>
                            </tr>
                            <tr className={fullReading.nobleScore.totalScore >= 2.0 && fullReading.nobleScore.totalScore < 3.0 ? "bg-amber-500/10 font-bold text-amber-300" : ""}>
                              <td className="py-2.5 px-3 font-mono text-sky-400">2.0 – 2.95 Điểm</td>
                              <td className="py-2.5 px-3 font-medium text-sky-300">Tiểu Phú / Tiểu Quý</td>
                              <td className="py-2.5 px-3">5 – 10 Triệu HKD</td>
                              <td className="py-2.5 px-3">15 – 30 Tỷ VND</td>
                              <td className="py-2.5 px-3 text-ivory-500">Sở hữu nhà riêng, ô tô nhỏ, mở tiệm buôn bán hoặc quản lý cơ sở.</td>
                            </tr>
                            <tr className={fullReading.nobleScore.totalScore >= 3.0 && fullReading.nobleScore.totalScore < 4.0 ? "bg-amber-500/10 font-bold text-amber-300" : ""}>
                              <td className="py-2.5 px-3 font-mono text-emerald-400">3.0 – 3.95 Điểm</td>
                              <td className="py-2.5 px-3 font-medium text-emerald-300">Trung Phú / Trung Quý</td>
                              <td className="py-2.5 px-3 font-bold text-amber-400">10 – 50 Triệu HKD</td>
                              <td className="py-2.5 px-3 font-bold text-emerald-400">30 – 150 Tỷ VND</td>
                              <td className="py-2.5 px-3 text-ivory-300"><b>"Tam phân hữu xa hữu lâu, y thực vô ưu"</b>: Nhà lầu xe sang, chủ doanh nghiệp vừa.</td>
                            </tr>
                            <tr className={fullReading.nobleScore.totalScore >= 4.0 && fullReading.nobleScore.totalScore < 5.0 ? "bg-amber-500/10 font-bold text-amber-300" : ""}>
                              <td className="py-2.5 px-3 font-mono text-gold-400">4.0 – 4.95 Điểm</td>
                              <td className="py-2.5 px-3 font-medium text-gold-300">Đại Phú / Đại Quý</td>
                              <td className="py-2.5 px-3 font-bold text-amber-400">50 – 100 Triệu HKD</td>
                              <td className="py-2.5 px-3 font-bold text-emerald-400">150 – 300+ Tỷ VND</td>
                              <td className="py-2.5 px-3 text-ivory-300">Đại thương nhân, giám đốc tập đoàn lớn, quan chức địa phương, tiếng tăm lẫy lừng.</td>
                            </tr>
                            <tr className={fullReading.nobleScore.totalScore >= 5.0 && fullReading.nobleScore.totalScore < 6.0 ? "bg-amber-500/10 font-bold text-amber-300" : ""}>
                              <td className="py-2.5 px-3 font-mono text-orange-400">5.0 – 5.95 Điểm</td>
                              <td className="py-2.5 px-3 font-medium text-orange-300">Cự Phú Thượng Lưu</td>
                              <td className="py-2.5 px-3 font-bold text-amber-400">100 – 500 Triệu HKD</td>
                              <td className="py-2.5 px-3 font-bold text-emerald-400">300 – 1.500+ Tỷ VND</td>
                              <td className="py-2.5 px-3 text-ivory-300">Giới siêu giàu thượng lưu, chuỗi tập đoàn đa ngành, danh gia vọng tộc hiển hách.</td>
                            </tr>
                            <tr className={fullReading.nobleScore.totalScore >= 6.0 ? "bg-amber-500/10 font-bold text-amber-300" : ""}>
                              <td className="py-2.5 px-3 font-mono text-rose-400">≥ 6.0 – 7.0+ Điểm</td>
                              <td className="py-2.5 px-3 font-medium text-rose-300">Quốc Gia Quý Cách / Tài Phiệt</td>
                              <td className="py-2.5 px-3 font-bold text-amber-400">500M – Hàng Tỷ HKD</td>
                              <td className="py-2.5 px-3 font-bold text-emerald-400">1.500 – Vạn Tỷ VND</td>
                              <td className="py-2.5 px-3 text-gold-300">Nhân vật tầm cỡ quốc gia, cự phú tài phiệt thiên hạ, danh tiếng chấn động giang sơn. (Tô Dân Phong: "Ta có gần 7 điểm!").</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* BỔ SUNG TỪ BÁT TỰ BÚT KÝ V16 & SHEET GIỚI THIỆU */}
                      <div className="mt-5 p-4 sm:p-5 rounded-sm bg-gradient-to-r from-amber-950/20 via-lacquer-800 to-amber-950/10 border border-amber-600/30 space-y-4">
                        <div className="flex items-center gap-2 text-sm font-serif font-bold text-amber-300 border-b border-amber-600/20 pb-2">
                          <Award className="w-4 h-4 text-amber-400" />
                          <span>QUY TẮC CHIẾT GIẢM & ĐẶC TÍNH TÍCH SẢN (BÁT TỰ BÚT KÝ V16)</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          {/* Điểm Đỏ */}
                          <div className="p-3 rounded-sm bg-black/30 border border-red-500/20 space-y-1">
                            <span className="font-bold text-red-400 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-red-500"></span>
                              Quy Tắc Điểm Đỏ (Red Point Rule)
                            </span>
                            <p className="text-ivory-300 leading-relaxed">
                              {fullReading.nobleScore.redPointRule}
                            </p>
                          </div>

                          {/* Tài Khố */}
                          <div className="p-3 rounded-sm bg-black/30 border border-emerald-500/20 space-y-1">
                            <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                              Kiểm Tra Tài Khố (Kho Chứa Tiền)
                            </span>
                            <p className="text-ivory-100 font-semibold">
                              {fullReading.nobleScore.taiKhoVerdict}
                            </p>
                            <p className="text-[11px] text-ivory-500 italic">
                              {fullReading.nobleScore.taiKhoDiscountWarning}
                            </p>
                          </div>
                        </div>

                        {/* Lưu ý Nữ Mệnh */}
                        <div className="p-3 rounded-sm bg-black/20 border border-white/5 text-xs text-ivory-500 flex items-start gap-2">
                          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <span>{fullReading.nobleScore.genderDiscountNote}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PHẦN 3: DÒNG THỜI GIAN ĐẠI VẬN (80 NĂM) */}
              {(activeMingInnerTab === "all" || activeMingInnerTab === "daivan") && (
                <div className="space-y-6 animate-fadeIn page-break-avoid">
                  {activeMingInnerTab === "all" && (
                    <div className="flex items-center gap-2 text-sm font-serif font-bold text-amber-400 uppercase tracking-wider pb-2 border-b border-amber-600/30">
                      <TrendingUp className="w-4 h-4 text-amber-400" />
                      <span>PHẦN 3: DÒNG THỜI GIAN 8 ĐẠI VẬN 80 NĂM ("THUẬN DŨNG • NGHỊCH THỦ")</span>
                    </div>
                  )}
                  <div className="border border-gold-800 border-t-gold-600 bg-lacquer-900/85 p-5 sm:p-6 space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-gold-800 pb-3">
                      <div className="space-y-1">
                        <h4 className="text-base font-serif font-bold text-ivory-100 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-amber-500" />
                          <span>Dòng Thời Gian 8 Đại Vận 10 Năm (Chu Kỳ 80 Năm Cuộc Đời)</span>
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-ivory-500">
                          <span className="font-semibold text-amber-300">
                            Khởi vận: {fullReading.tuoiVaoVan.summary}
                          </span>
                          <span className="text-zinc-600">•</span>
                          <span>
                            Tiết khí mốc tính: <b className="text-zinc-300">{fullReading.tuoiVaoVan.targetTermName}</b> ({fullReading.tuoiVaoVan.targetTermDate})
                          </span>
                          <span className="text-zinc-600">•</span>
                          <span>
                            Chênh lệch: <b className="text-zinc-300">{fullReading.tuoiVaoVan.diffDaysFormatted}</b>
                          </span>
                        </div>
                        <p className="text-[11px] text-ivory-500 italic">
                          {fullReading.tuoiVaoVan.reason}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-amber-300 font-serif font-bold bg-amber-950/40 px-3 py-1 rounded-sm border border-amber-600/30">
                          {fullReading.tuoiVaoVan.direction}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {fullReading.daiVanList.map((dv, idx) => (
                        <div
                          key={idx}
                          className={`p-4 rounded-sm border transition-all ${
                            dv.isFavorable
                              ? "bg-gradient-to-r from-emerald-950/30 via-lacquer-800 to-lacquer-900 border-emerald-600/40 hover:border-emerald-500"
                              : "bg-lacquer-800 border-gold-800 hover:border-amber-600/30"
                          }`}
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <span className="w-7 h-7 rounded-full bg-lacquer-900 text-gold-300 border border-amber-600/40 flex items-center justify-center text-xs font-bold font-serif shrink-0">
                                {dv.step}
                              </span>

                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-base font-serif font-bold text-ivory-100">
                                    Đại Vận {dv.can} {dv.chi} ({dv.chinese})
                                  </span>
                                  <span className={`text-[10px] px-2 py-0.2 rounded font-bold border ${getElementColorClass(dv.element)}`}>
                                    Hành {dv.element}
                                  </span>
                                  <span
                                    className={`text-[10px] px-2 py-0.2 rounded font-bold ${
                                      dv.fortuneLevel === "Đại Cát" || dv.fortuneLevel === "Cát"
                                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                        : dv.fortuneLevel === "Bình Hòa"
                                        ? "bg-white/5 text-ivory-500 border border-white/10"
                                        : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                                    }`}
                                  >
                                    {dv.fortuneLevel}
                                  </span>
                                </div>
                                <div className="text-xs text-ivory-500">
                                  Từ <b>{dv.startAge}</b> đến <b>{dv.endAge} tuổi</b> (Khoảng năm {dv.startYear} – {dv.endYear})
                                </div>
                              </div>
                            </div>

                            <div className="text-left md:text-right">
                              <span className="text-xs font-serif font-semibold text-amber-300">
                                {dv.actionAdvice}
                              </span>
                            </div>
                          </div>

                          <p className="text-xs text-ivory-300 mt-2.5 leading-relaxed pl-10 border-l border-white/5">
                            {dv.details}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* BÍ QUYẾT ĐẠI VẬN ĐỘC MÔN TÔ DÂN PHONG (BÚT KÝ V16) */}
                    <div className="mt-6 pt-5 border-t border-lacquer-700 space-y-4">
                      <h5 className="text-sm font-serif font-bold text-amber-300 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-400" />
                        <span>BÍ QUYẾT HÀNH VẬN ĐỘC MÔN TÔ DÂN PHONG (BÁT TỰ BÚT KÝ V16)</span>
                      </h5>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="p-3.5 rounded-sm bg-gradient-to-br from-amber-950/20 to-black/30 border border-amber-600/20 space-y-1.5">
                          <span className="font-bold text-amber-400">1. Tuyệt Xứ Phùng Sinh (Quá Độ 3 - 5 Năm)</span>
                          <p className="text-ivory-300 leading-relaxed">{fullReading.daiVanSecretRules.tuyetXuPhungSinh}</p>
                        </div>

                        <div className="p-3.5 rounded-sm bg-gradient-to-br from-amber-950/20 to-black/30 border border-amber-600/20 space-y-1.5">
                          <span className="font-bold text-amber-400">2. Yếu Tố Khởi Sự Kinh Doanh</span>
                          <p className="text-ivory-300 leading-relaxed">{fullReading.daiVanSecretRules.businessImperative}</p>
                        </div>

                        <div className="p-3.5 rounded-sm bg-gradient-to-br from-amber-950/20 to-black/30 border border-amber-600/20 space-y-1.5">
                          <span className="font-bold text-amber-400">3. Bước Đệm Tuổi Trẻ (Nam &lt; 30, Nữ &lt; 25)</span>
                          <p className="text-ivory-300 leading-relaxed">{fullReading.daiVanSecretRules.youthCollapseRisk}</p>
                        </div>

                        <div className="p-3.5 rounded-sm bg-gradient-to-br from-amber-950/20 to-black/30 border border-amber-600/20 space-y-1.5">
                          <span className="font-bold text-amber-400">4. Chuyển Sang Nghịch Vận & Phòng Thủ</span>
                          <p className="text-ivory-300 leading-relaxed">{fullReading.daiVanSecretRules.transitionDefense}</p>
                        </div>

                        <div className="p-3.5 rounded-sm bg-gradient-to-br from-amber-950/20 to-black/30 border border-amber-600/20 space-y-1.5">
                          <span className="font-bold text-amber-400">5. Tỷ Kiếp Vận Làm Nhiều Hưởng Ít</span>
                          <p className="text-ivory-300 leading-relaxed">{fullReading.daiVanSecretRules.tyKiepNoLuckFix}</p>
                        </div>

                        <div className="p-3.5 rounded-sm bg-gradient-to-br from-amber-950/20 to-black/30 border border-amber-600/20 space-y-1.5">
                          <span className="font-bold text-amber-400">6. Yếu Tố Địa Lý & Không Gian Môi Trường</span>
                          <p className="text-ivory-300 leading-relaxed">{fullReading.daiVanSecretRules.geoFactor}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              
              {/* PHẦN 3B: CÁC NĂM THEN CHỐT & BÁT TỰ BÍ PHÁP (BÚT KÝ V16) */}
              {(activeMingInnerTab === "all" || activeMingInnerTab === "crucial_years") && (
                <div className="space-y-6 animate-fadeIn page-break-avoid">
                  {activeMingInnerTab === "all" && (
                    <div className="flex items-center gap-2 text-sm font-serif font-bold text-amber-400 uppercase tracking-wider pb-2 border-b border-amber-600/30">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span>PHẦN 4: CÁC NĂM THEN CHỐT, VẬN HẠN & BÁT TỰ BÍ PHÁP (BÁT TỰ BÚT KÝ V16)</span>
                    </div>
                  )}

                  <div className="border border-gold-800 border-t-gold-600 bg-lacquer-900/85 p-5 sm:p-6 space-y-6">
                    <div>
                      <h4 className="text-base font-serif font-bold text-ivory-100 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-amber-500" />
                        <span>Mốc Biến Hóa Thập Niên ("Phùng 0") & Năm Cưới Hỏi Đẹp</span>
                      </h4>
                      <p className="text-xs text-ivory-500 mt-0.5">
                        Quy luật phùng 0 đại biến hóa (Nhà ở • Sự nghiệp • Tình cảm) và các năm nhân duyên cát tường
                      </p>
                    </div>

                    {/* Mốc Phùng X */}
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="text-xs font-serif font-bold text-amber-300">
                          1. Các Mốc Giao Tiếp Đại Vận "Phùng {(fullReading.crucialYears.zeroAgeMilestones[0]?.age ?? 0) % 10}" (Đại Biến Chuyển Thập Niên):
                        </span>
                        <span className="text-[11px] text-ivory-500 italic">
                          (Tô Dân Phong: Khởi đầu chu kỳ chuyển trục 10 năm)
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
                        {fullReading.crucialYears.zeroAgeMilestones.map((m, idx) => (
                          <div key={idx} className="p-2.5 rounded-sm bg-black/40 border border-amber-600/20 text-center space-y-0.5">
                            <span className="block text-xs font-bold text-amber-400 font-mono">{m.age} Tuổi</span>
                            <span className="block text-[11px] text-ivory-500">{m.year}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Năm Nhân Duyên */}
                    <div className="p-3.5 rounded-sm bg-rose-950/20 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-serif font-bold text-rose-300 flex items-center gap-1.5">
                          <Heart className="w-3.5 h-3.5 text-rose-400" />
                          Năm Dễ Có Ý Nguyện & Nhân Duyên Cưới Hỏi (Đuôi 0 & 1):
                        </span>
                        <p className="text-xs text-ivory-300 mt-1">
                          Các năm có số đuôi 0 và 1 mang năng lượng kết nối đào hoa kết hôn mạnh mẽ nhất:
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {fullReading.crucialYears.weddingYears.map((yr, idx) => (
                          <span key={idx} className="px-2.5 py-1 rounded-sm bg-rose-950/60 text-rose-300 border border-rose-500/40 text-xs font-bold font-mono">
                            {yr}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Thiên Khắc Địa Xung 4 Trụ */}
                    <div className="space-y-3 pt-4 border-t border-lacquer-700">
                      <h5 className="text-sm font-serif font-bold text-amber-300 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-400" />
                        <span>Các Năm Thiên Khắc Địa Xung 4 Trụ (Cảnh Báo Kiếp Nạn & Vận Hạn)</span>
                      </h5>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {fullReading.crucialYears.thienKhacDiaXung.map((item, idx) => (
                          <div key={idx} className="p-3.5 rounded-sm bg-black/30 border border-orange-500/20 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-orange-300 font-serif">{item.pillar}</span>
                              <span className="text-xs font-mono font-bold text-red-400 bg-red-950/40 px-2 py-0.5 rounded border border-red-500/30">
                                Xung: {item.canChi}
                              </span>
                            </div>
                            <p className="text-xs text-ivory-300 leading-relaxed">{item.consequence}</p>
                            <div className="flex items-center gap-1.5 text-[11px] text-ivory-500 pt-1">
                              <span>Năm trùng xung:</span>
                              <b className="text-amber-400 font-mono">{item.years.join(', ')}</b>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Phục Ngâm */}
                    <div className="space-y-3 pt-4 border-t border-lacquer-700">
                      <h5 className="text-sm font-serif font-bold text-amber-300 flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                        <span>Năm Phục Ngâm / Phục Hình (Nhật Trụ & Nguyệt Trụ)</span>
                      </h5>

                      <div className="space-y-2.5">
                        {fullReading.crucialYears.phucNgamYears.map((pn, idx) => (
                          <div key={idx} className="p-3.5 rounded-sm bg-black/30 border border-rose-500/20 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-rose-300 font-serif">{pn.pillar} ({pn.canChi})</span>
                              <span className="text-xs font-mono text-amber-400 font-bold">Năm xảy ra: {pn.years.join(', ')}</span>
                            </div>
                            <p className="text-xs text-ivory-300 leading-relaxed">{pn.warning}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bát Tự Bí Pháp */}
                    <div className="space-y-3 pt-4 border-t border-lacquer-700">
                      <h5 className="text-sm font-serif font-bold text-amber-300 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-amber-400" />
                        <span>Bát Tự Bí Pháp Thực Chiến (Tổng Hợp Khẩu Quyết Bút Ký V16)</span>
                      </h5>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {fullReading.batTuBiPhap.map((bp, idx) => (
                          <div key={idx} className={`p-3.5 rounded-sm border space-y-1.5 ${
                            bp.isMatched
                              ? "bg-amber-950/20 border-amber-600/40"
                              : "bg-black/20 border-white/5 opacity-80"
                          }`}>
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 font-mono">[{bp.category}]</span>
                              <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                                bp.isMatched ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-white/5 text-ivory-500"
                              }`}>
                                {bp.isMatched ? "✓ Đã Kích Hoạt" : "Không Phạm"}
                              </span>
                            </div>
                            <span className="block text-xs font-bold text-ivory-100">{bp.rule}</span>
                            <p className="text-xs text-ivory-300 leading-relaxed">{bp.explanation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PHẦN 4: 6 TRỤC LUẬN ĐOÁN "SỰ" (TINH HOA 80 BÀI GIẢNG) */}
              {(activeMingInnerTab === "all" || activeMingInnerTab === "six_pillars") && (
                <div className="space-y-6 animate-fadeIn page-break-avoid">
                  {activeMingInnerTab === "all" && (
                    <div className="flex items-center gap-2 text-sm font-serif font-bold text-amber-400 uppercase tracking-wider pb-2 border-b border-amber-600/30">
                      <Compass className="w-4 h-4 text-amber-400" />
                      <span>PHẦN 4: 6 TRỤC LUẬN ĐOÁN "SỰ" (TINH HOA 80 BÀI GIẢNG TÔ DÂN PHONG)</span>
                    </div>
                  )}

                  {/* Selector 6 Trục */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 no-print">
                    {[
                      { idx: 0, label: "Tài Vận & Sự Nghiệp", icon: DollarSign },
                      { idx: 1, label: "Hôn Nhân & Tình Duyên", icon: Heart },
                      { idx: 2, label: "Sức Khỏe & Tạng Phủ", icon: Stethoscope },
                      { idx: 3, label: "Lục Thân Gia Đạo", icon: Users },
                      { idx: 4, label: "Lưu Niên Vận Hạn", icon: Zap },
                      { idx: 5, label: "Cải Vận Phong Thủy", icon: Compass }
                    ].map((btn) => {
                      const Icon = btn.icon;
                      const isSel = activeSixPillarIdx === btn.idx;
                      return (
                        <button
                          key={btn.idx}
                          onClick={() => {
                            if (activeMingInnerTab === "all") {
                              const el = document.getElementById(`pillar-axis-${btn.idx}`);
                              if (el) el.scrollIntoView({ behavior: "smooth" });
                            } else {
                              setActiveSixPillarIdx(btn.idx);
                            }
                          }}
                          className={`p-3 rounded-sm border text-center font-serif text-xs transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                            isSel && activeMingInnerTab !== "all"
                              ? "bg-amber-500/20 text-gold-300 border-amber-500/70 shadow-md font-bold"
                              : "bg-lacquer-800 text-ivory-500 hover:text-ivory-100 border-gold-800"
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${isSel && activeMingInnerTab !== "all" ? "text-amber-400" : "text-amber-500/60"}`} />
                          <span className="leading-tight">{btn.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Chi tiết từng trục */}
                  <div className="border border-gold-800 border-t-gold-600 bg-lacquer-900/85 p-6 space-y-6">
                    {/* TRỤC 0: TÀI VẬN & SỰ NGHIỆP */}
                    {(activeMingInnerTab === "all" || activeSixPillarIdx === 0) && (
                      <div id="pillar-axis-0" className="space-y-4 animate-fadeIn page-break-avoid border-b border-gold-800 pb-6 last:border-b-0 last:pb-0">
                        <div className="flex items-center justify-between border-b border-gold-800 pb-3">
                          <h4 className="text-base font-serif font-bold text-ivory-100 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-amber-500" />
                            <span>{fullReading.sixPillarsAnalysis.careerAndWealth.title}</span>
                          </h4>
                          <span className="text-xs px-2.5 py-1 rounded-sm font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            {fullReading.sixPillarsAnalysis.careerAndWealth.badge}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-lacquer-800 border border-gold-800 p-4 rounded-sm space-y-2">
                            <span className="text-xs text-ivory-500 font-serif uppercase tracking-wider">Cấu Trúc Tài Khố</span>
                            <div className="text-sm font-bold text-gold-300">
                              {fullReading.sixPillarsAnalysis.careerAndWealth.wealthPattern}
                            </div>
                            <p className="text-xs text-ivory-300 leading-relaxed">
                              Được đúc kết từ tỷ lệ Thập Thần (Thực Thương, Tài Tinh, Quan Sát) trong Bát Tự nguyên cục.
                            </p>
                          </div>

                          <div className="bg-lacquer-800 border border-gold-800 p-4 rounded-sm space-y-2">
                            <span className="text-xs text-ivory-500 font-serif uppercase tracking-wider">Chiến Lược Đầu Tư Khắc Cốt</span>
                            <div className="text-sm font-bold text-emerald-300">
                              {fullReading.sixPillarsAnalysis.careerAndWealth.investmentStrategy}
                            </div>
                            <p className="text-xs text-ivory-300 leading-relaxed">
                              Nguyên tắc vàng: Khi ở Thuận Vận thì dũng cảm bung sức; khi ở Nghịch Vận thì kiên quyết không vay mượn lớn.
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2 pt-2">
                          <div className="text-xs font-serif font-bold text-gold-300">Các Ngành Nghề Hợp Ngũ Hành Hỷ Dụng:</div>
                          <div className="flex flex-wrap gap-2">
                            {fullReading.sixPillarsAnalysis.careerAndWealth.favorableIndustries.map((ind, i) => (
                              <span key={i} className="text-xs px-3 py-1 rounded-sm bg-lacquer-700 text-ivory-300 border border-amber-600/30">
                                {ind}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="bg-lacquer-900 p-4 rounded-sm border border-white/5 space-y-2">
                          <div className="text-xs font-serif font-bold text-gold-300">Lời Khuyên Thực Chiến Từ 80 Bài Giảng:</div>
                          <ul className="space-y-1.5 text-xs text-ivory-300 leading-relaxed">
                            {fullReading.sixPillarsAnalysis.careerAndWealth.details.map((d, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                <span>{d}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {fullReading.sixPillarsAnalysis.careerAndWealth.peterSoPhilosophy && (
                          <div className="bg-lacquer-900 p-4 rounded-sm border border-amber-600/30 space-y-2">
                            <div className="text-xs font-serif font-bold text-gold-300 flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-amber-400" />
                              <span>Bản Chất "Sinh Ý Mệnh" vs "Đả Công Mệnh" (Tô Dân Phong 2009 - Bài 01):</span>
                            </div>
                            <p className="text-xs sm:text-sm text-ivory-300 leading-relaxed">
                              {fullReading.sixPillarsAnalysis.careerAndWealth.peterSoPhilosophy}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* TRỤC 1: HÔN NHÂN & TÌNH CẢM */}
                    {(activeMingInnerTab === "all" || activeSixPillarIdx === 1) && (
                      <div id="pillar-axis-1" className="space-y-4 animate-fadeIn page-break-avoid border-b border-gold-800 pb-6 last:border-b-0 last:pb-0">
                        <div className="flex items-center justify-between border-b border-gold-800 pb-3">
                          <h4 className="text-base font-serif font-bold text-ivory-100 flex items-center gap-2">
                            <Heart className="w-5 h-5 text-rose-400" />
                            <span>{fullReading.sixPillarsAnalysis.marriageAndLove.title}</span>
                          </h4>
                          <span
                            className={`text-xs px-2.5 py-1 rounded-sm font-bold border ${
                              fullReading.sixPillarsAnalysis.marriageAndLove.isSpousePalaceClashed
                                ? "bg-rose-950/60 text-rose-300 border-rose-600/50"
                                : "bg-emerald-950/60 text-emerald-300 border-emerald-600/50"
                            }`}
                          >
                            {fullReading.sixPillarsAnalysis.marriageAndLove.badge}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-lacquer-800 border border-gold-800 p-4 rounded-sm space-y-1.5">
                            <span className="text-xs text-ivory-500 font-serif uppercase tracking-wider">Trạng Thái Cung Phu Thê (Nhật Chi)</span>
                            <div className="text-sm font-bold text-gold-300">
                              {fullReading.sixPillarsAnalysis.marriageAndLove.palaceStatus}
                            </div>
                            {fullReading.sixPillarsAnalysis.marriageAndLove.clashDetails && (
                              <p className="text-xs text-rose-400 mt-1 leading-relaxed">
                                {fullReading.sixPillarsAnalysis.marriageAndLove.clashDetails}
                              </p>
                            )}
                          </div>

                          <div className="bg-lacquer-800 border border-gold-800 p-4 rounded-sm space-y-1.5">
                            <span className="text-xs text-ivory-500 font-serif uppercase tracking-wider">Độ Tuổi Kết Hôn Lý Tưởng</span>
                            <div className="text-sm font-bold text-emerald-300">
                              {fullReading.sixPillarsAnalysis.marriageAndLove.idealMarriageAgeRange}
                            </div>
                            <p className="text-xs text-ivory-300 leading-relaxed">
                              Người có cung phu thê bị xung hoặc phạm Tuất Mùi hình nên kết hôn muộn để hóa giải bớt sóng gió tuổi trẻ.
                            </p>
                          </div>
                        </div>

                        {fullReading.sixPillarsAnalysis.marriageAndLove.tuatMuiHinhAdvice && (
                          <div className="bg-amber-950/20 border border-amber-600/40 p-4 rounded-sm space-y-1.5">
                            <span className="text-xs text-amber-300 font-serif font-bold flex items-center gap-1.5">
                              <AlertTriangle className="w-4 h-4 text-amber-400" />
                              Tuất - Mùi Tương Hình (Tô Dân Phong 2010 Bài 06 & 26):
                            </span>
                            <p className="text-xs sm:text-sm text-ivory-100 leading-relaxed">
                              {fullReading.sixPillarsAnalysis.marriageAndLove.tuatMuiHinhAdvice}
                            </p>
                          </div>
                        )}

                        {fullReading.sixPillarsAnalysis.marriageAndLove.spouseTenGodAnalysis && (
                          <div className="bg-lacquer-800 border border-gold-800 p-4 rounded-sm space-y-1">
                            <span className="text-xs text-ivory-500 font-serif uppercase tracking-wider">Thập Thần Tọa Phu Thê Cung</span>
                            <p className="text-xs sm:text-sm text-gold-300 leading-relaxed">
                              {fullReading.sixPillarsAnalysis.marriageAndLove.spouseTenGodAnalysis}
                            </p>
                          </div>
                        )}

                        <div className="bg-lacquer-900 p-4 rounded-sm border border-amber-600/30 space-y-2">
                          <div className="text-xs font-serif font-bold text-gold-300 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-400" />
                            <span>Quy Luật Đại Vận Xung Phu Thê (Tô Dân Phong 2009 Bài 01 & 2010 Bài 26):</span>
                          </div>
                          <p className="text-xs sm:text-sm text-ivory-300 leading-relaxed">
                            {fullReading.sixPillarsAnalysis.marriageAndLove.marriageTimingRule}
                          </p>
                        </div>

                        <div className="bg-lacquer-800 border border-gold-800 p-4 rounded-sm space-y-1.5">
                          <span className="text-xs text-ivory-500 font-serif uppercase tracking-wider">Khí Chất Đào Hoa & Hóa Giải Ly Dị</span>
                          <p className="text-xs text-ivory-300 leading-relaxed">
                            {fullReading.sixPillarsAnalysis.marriageAndLove.daoHoaPhoiNgau}
                          </p>
                          <p className="text-xs text-amber-300/90 leading-relaxed italic">
                            {fullReading.sixPillarsAnalysis.marriageAndLove.divorceLuckAdvice}
                          </p>
                        </div>

                        <div className="space-y-1.5 text-xs text-ivory-300 leading-relaxed pl-2">
                          {fullReading.sixPillarsAnalysis.marriageAndLove.details.map((d, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                              <span>{d}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* TRỤC 2: SỨC KHỎE & BỆNH TẠNG PHỦ */}
                    {(activeMingInnerTab === "all" || activeSixPillarIdx === 2) && (
                      <div id="pillar-axis-2" className="space-y-4 animate-fadeIn page-break-avoid border-b border-gold-800 pb-6 last:border-b-0 last:pb-0">
                        <div className="flex items-center justify-between border-b border-gold-800 pb-3">
                          <h4 className="text-base font-serif font-bold text-ivory-100 flex items-center gap-2">
                            <Stethoscope className="w-5 h-5 text-emerald-400" />
                            <span>{fullReading.sixPillarsAnalysis.healthAndOrgans.title}</span>
                          </h4>
                          <span className="text-xs px-2.5 py-1 rounded-sm font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            {fullReading.sixPillarsAnalysis.healthAndOrgans.badge}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Dạ dày thổ khô thổ ướt */}
                          <div className="bg-lacquer-800 border border-gold-800 p-4 rounded-sm space-y-1.5">
                            <span className="text-xs text-ivory-500 font-serif uppercase tracking-wider">Hệ Tiêu Hóa (Dạ Dày & Đường Ruột)</span>
                            <div className="text-sm font-bold text-amber-300">
                              Nguy cơ: {fullReading.sixPillarsAnalysis.healthAndOrgans.stomachIntestineRisk}
                            </div>
                            <p className="text-xs text-ivory-300 leading-relaxed">
                              Tô Dân Phong giảng dạy: Thổ khô (Mùi, Tuất) tương xung với Thổ ướt (Sửu, Thìn) là mầm mống gốc rễ của viêm loét dạ dày, trào ngược và polyp đường ruột.
                            </p>
                          </div>

                          {/* Tim mạch huyết áp */}
                          <div className="bg-lacquer-800 border border-gold-800 p-4 rounded-sm space-y-1.5">
                            <span className="text-xs text-ivory-500 font-serif uppercase tracking-wider">Hệ Tim Mạch & Huyết Áp</span>
                            <div className="text-sm font-bold text-gold-300">
                              {fullReading.sixPillarsAnalysis.healthAndOrgans.cardioVascularRisk}
                            </div>
                          </div>
                        </div>

                        {/* Thận, tử cung & ngoại khoa */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-lacquer-800 border border-gold-800 p-4 rounded-sm space-y-1.5">
                            <span className="text-xs text-ivory-500 font-serif uppercase tracking-wider">Thận & Phụ Khoa (Chi Sửu)</span>
                            <p className="text-xs text-ivory-300 leading-relaxed">
                              {fullReading.sixPillarsAnalysis.healthAndOrgans.kidneyUterusRisk}
                            </p>
                          </div>

                          <div className="bg-lacquer-800 border border-gold-800 p-4 rounded-sm space-y-1.5">
                            <span className="text-xs text-ivory-500 font-serif uppercase tracking-wider">Gan Mật & Thị Lực</span>
                            <p className="text-xs text-ivory-300 leading-relaxed">
                              {fullReading.sixPillarsAnalysis.healthAndOrgans.liverEyeRisk}
                            </p>
                          </div>
                        </div>

                        {/* Cảnh báo phẫu thuật đao kiếm xung thời trụ */}
                        <div className="bg-rose-950/20 border border-rose-800/40 p-4 rounded-sm space-y-2">
                          <div className="text-xs font-serif font-bold text-rose-300 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-rose-400" />
                            <span>Cảnh Báo Xung Thời Trụ (Trụ Giờ - Khóa 2011 Bài 16):</span>
                          </div>
                          <p className="text-xs sm:text-sm text-ivory-100 leading-relaxed">
                            {fullReading.sixPillarsAnalysis.healthAndOrgans.surgeryAccidentWarning}
                          </p>
                        </div>

                        <div className="space-y-1.5 text-xs text-ivory-300 leading-relaxed pl-2">
                          {fullReading.sixPillarsAnalysis.healthAndOrgans.preventionDetails.map((d, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span>{d}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* TRỤC 3: LỤC THÂN GIA ĐẠO */}
                    {(activeMingInnerTab === "all" || activeSixPillarIdx === 3) && (
                      <div id="pillar-axis-3" className="space-y-4 animate-fadeIn page-break-avoid border-b border-gold-800 pb-6 last:border-b-0 last:pb-0">
                        <div className="flex items-center justify-between border-b border-gold-800 pb-3">
                          <h4 className="text-base font-serif font-bold text-ivory-100 flex items-center gap-2">
                            <Users className="w-5 h-5 text-amber-500" />
                            <span>{fullReading.sixPillarsAnalysis.familySixRelatives.title}</span>
                          </h4>
                          <span className="text-xs px-2.5 py-1 rounded-sm font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            {fullReading.sixPillarsAnalysis.familySixRelatives.badge}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div className="bg-lacquer-800 border border-gold-800 p-4 rounded-sm space-y-1">
                            <span className="text-xs font-serif font-bold text-gold-300">Ông Bà & Tổ Tiên (Trụ Năm)</span>
                            <p className="text-xs text-ivory-300 leading-relaxed">
                              {fullReading.sixPillarsAnalysis.familySixRelatives.ancestorConnection}
                            </p>
                          </div>

                          <div className="bg-lacquer-800 border border-gold-800 p-4 rounded-sm space-y-1">
                            <span className="text-xs font-serif font-bold text-gold-300">Phụ Mẫu & Huynh Đệ (Trụ Tháng)</span>
                            <p className="text-xs text-ivory-300 leading-relaxed">
                              {fullReading.sixPillarsAnalysis.familySixRelatives.parentsSiblingsConnection}
                            </p>
                          </div>

                          <div className="bg-lacquer-800 border border-gold-800 p-4 rounded-sm space-y-1">
                            <span className="text-xs font-serif font-bold text-gold-300">Bản Thân & Vợ Chồng (Trụ Ngày)</span>
                            <p className="text-xs text-ivory-300 leading-relaxed">
                              {fullReading.sixPillarsAnalysis.familySixRelatives.selfAndSpouseConnection}
                            </p>
                          </div>

                          <div className="bg-lacquer-800 border border-gold-800 p-4 rounded-sm space-y-1">
                            <span className="text-xs font-serif font-bold text-gold-300">Con Cái & Hậu Vận (Trụ Giờ)</span>
                            <p className="text-xs text-ivory-300 leading-relaxed">
                              {fullReading.sixPillarsAnalysis.familySixRelatives.childrenPosterityConnection}
                            </p>
                          </div>
                        </div>

                        <div className="bg-lacquer-900 p-4 rounded-sm border border-amber-600/30 space-y-2">
                          <div className="text-xs font-serif font-bold text-gold-300">Ma Trận Tương Xung 4 Trụ (Mật Mã Da Vinci):</div>
                          <ul className="space-y-1.5 text-xs text-ivory-300 leading-relaxed">
                            {fullReading.sixPillarsAnalysis.familySixRelatives.fourPillarsInteractions.map((inter, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <ArrowRight className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                <span>{inter}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* TRỤC 4: LƯU NIÊN VẬN HẠN */}
                    {(activeMingInnerTab === "all" || activeSixPillarIdx === 4) && (
                      <div id="pillar-axis-4" className="space-y-4 animate-fadeIn page-break-avoid border-b border-gold-800 pb-6 last:border-b-0 last:pb-0">
                        <div className="flex items-center justify-between border-b border-gold-800 pb-3">
                          <h4 className="text-base font-serif font-bold text-ivory-100 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-amber-400" />
                            <span>{fullReading.sixPillarsAnalysis.currentYearForecast.title}</span>
                          </h4>
                          <span className="text-xs px-2.5 py-1 rounded-sm font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            {fullReading.sixPillarsAnalysis.currentYearForecast.taiSuiRelation}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-lacquer-800 border border-gold-800 p-4 rounded-sm space-y-1.5">
                            <span className="text-xs text-ivory-500 font-serif uppercase tracking-wider">Tài Vận Lưu Niên</span>
                            <p className="text-xs sm:text-sm text-ivory-100 leading-relaxed">
                              {fullReading.sixPillarsAnalysis.currentYearForecast.wealthCurrentYear}
                            </p>
                          </div>

                          <div className="bg-lacquer-800 border border-gold-800 p-4 rounded-sm space-y-1.5">
                            <span className="text-xs text-ivory-500 font-serif uppercase tracking-wider">Sự Nghiệp & Quan Hệ</span>
                            <p className="text-xs sm:text-sm text-ivory-100 leading-relaxed">
                              {fullReading.sixPillarsAnalysis.currentYearForecast.careerCurrentYear}
                            </p>
                          </div>
                        </div>

                        {/* Bí quyết Nhất Hỷ Chắn Tam Tai */}
                        <div className="bg-gradient-to-r from-amber-950/40 to-lacquer-800 border border-amber-500/50 p-4 rounded-sm space-y-2">
                          <div className="text-xs font-serif font-bold text-gold-300 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-400" />
                            <span>Bí Quyết Hóa Giải Độc Môn Tô Dân Phong:</span>
                          </div>
                          <p className="text-xs sm:text-sm text-ivory-100 leading-relaxed font-serif">
                            {fullReading.sixPillarsAnalysis.currentYearForecast.masterRemedySecret}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* TRỤC 5: PHÁP MÔN CẢI VẬN PHONG THỦY */}
                    {(activeMingInnerTab === "all" || activeSixPillarIdx === 5) && (
                      <div id="pillar-axis-5" className="space-y-4 animate-fadeIn page-break-avoid">
                        <div className="flex items-center justify-between border-b border-gold-800 pb-3">
                          <h4 className="text-base font-serif font-bold text-ivory-100 flex items-center gap-2">
                            <Compass className="w-5 h-5 text-emerald-400" />
                            <span>{fullReading.sixPillarsAnalysis.fengshuiRemedy.title}</span>
                          </h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-lacquer-800 border border-gold-800 p-4 rounded-sm space-y-1.5">
                            <span className="text-xs text-ivory-500 font-serif uppercase tracking-wider">Phương Vị Cư Trú & Lập Nghiệp</span>
                            <p className="text-xs text-ivory-100 leading-relaxed">
                              {fullReading.sixPillarsAnalysis.fengshuiRemedy.livingDirections}
                            </p>
                          </div>

                          <div className="bg-lacquer-800 border border-gold-800 p-4 rounded-sm space-y-1.5">
                            <span className="text-xs text-ivory-500 font-serif uppercase tracking-wider">Hướng Đầu Giường Khi Ngủ</span>
                            <p className="text-xs text-ivory-100 leading-relaxed">
                              {fullReading.sixPillarsAnalysis.fengshuiRemedy.bedHeadDirection}
                            </p>
                          </div>

                          <div className="bg-lacquer-800 border border-gold-800 p-4 rounded-sm space-y-1.5">
                            <span className="text-xs text-ivory-500 font-serif uppercase tracking-wider">Trang Phục, Xe Cộ & Màu Sắc</span>
                            <p className="text-xs text-ivory-100 leading-relaxed">
                              {fullReading.sixPillarsAnalysis.fengshuiRemedy.wardrobeColors}
                            </p>
                          </div>

                          <div className="bg-lacquer-800 border border-gold-800 p-4 rounded-sm space-y-1.5">
                            <span className="text-xs text-ivory-500 font-serif uppercase tracking-wider">Cửu Cung Phi Tinh Hóa Bệnh</span>
                            <p className="text-xs text-ivory-100 leading-relaxed">
                              {fullReading.sixPillarsAnalysis.fengshuiRemedy.homeRemedy}
                            </p>
                          </div>
                        </div>

                        <div className="bg-lacquer-900 p-4 rounded-sm border border-amber-600/30 space-y-2">
                          <div className="text-xs font-serif font-bold text-gold-300">Ngũ Hành Hóa Động Thổ Cục:</div>
                          <p className="text-xs text-ivory-300 leading-relaxed">
                            {fullReading.sixPillarsAnalysis.fengshuiRemedy.dongThoRemedy}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PHẦN 5: CẨM NANG CẢI VẬN ĐỘC MÔN */}
              {(activeMingInnerTab === "all" || activeMingInnerTab === "remedy") && (
                <div className="space-y-6 animate-fadeIn page-break-avoid">
                  {activeMingInnerTab === "all" && (
                    <div className="flex items-center gap-2 text-sm font-serif font-bold text-amber-400 uppercase tracking-wider pb-2 border-b border-amber-600/30">
                      <Compass className="w-4 h-4 text-amber-400" />
                      <span>PHẦN 5: CẨM NANG PHÁP MÔN CẢI VẬN ĐỘC MÔN TÔ DÂN PHONG</span>
                    </div>
                  )}
                  <div className="border border-gold-800 border-t-gold-600 bg-lacquer-900/85 p-6 space-y-4">
                    <h4 className="text-base font-serif font-bold text-ivory-100 flex items-center gap-2 border-b border-gold-800 pb-3">
                      <Compass className="w-5 h-5 text-amber-500" />
                      <span>Tổng Hợp Pháp Môn Cải Vận Độc Môn Tô Dân Phong</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-lacquer-800 border border-gold-800 p-4 rounded-sm space-y-2">
                        <span className="text-xs font-serif font-bold text-gold-300">1. Đổi Vận Bằng Màu Sắc</span>
                        <p className="text-xs text-ivory-300 leading-relaxed">
                          Y phục là lớp khí trường tiếp xúc trực tiếp nhất với cơ thể 24/24. Người Hàn Mệnh mặc màu nóng ấm; người Nhiệt Mệnh mặc màu mát lạnh.
                        </p>
                      </div>

                      <div className="bg-lacquer-800 border border-gold-800 p-4 rounded-sm space-y-2">
                        <span className="text-xs font-serif font-bold text-gold-300">2. Giường Ngủ Nạp Khí</span>
                        <p className="text-xs text-ivory-300 leading-relaxed">
                          1/3 thời gian cuộc đời nằm trên giường ngủ. Hướng đầu giường đúng phương vị hỷ dụng giúp phục hồi chân khí và kích hoạt vận may bền vững.
                        </p>
                      </div>

                      <div className="bg-lacquer-800 border border-gold-800 p-4 rounded-sm space-y-2">
                        <span className="text-xs font-serif font-bold text-gold-300">3. Trực Xung Thái Tuế Tác Động</span>
                        <p className="text-xs text-ivory-300 leading-relaxed">
                          Chủ động biến đổi (chuyển nhà, đổi việc, du lịch, sinh con) để hóa giải trạng thái xung khắc của Thái Tuế.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Print Footer: Bản quyền & Ghi chú khi In PDF */}
              <div className="hidden print:block border-t-2 border-amber-600/50 pt-4 mt-8 text-center text-[11px] text-ivory-500 page-break-avoid">
                <div className="font-serif font-bold text-amber-400">
                  BÁO CÁO BÁT TỰ HÀN NHIỆT MỆNH • ĐÚC KẾT THEO HỆ THỐNG MASTER TÔ DÂN PHONG (PETER SO)
                </div>
                <div className="mt-1">
                  Ứng dụng Huyền Học & Dự Đoán Học Đông Phương • Xuất ngày: {new Date().toLocaleDateString("vi-VN")}
                </div>
              </div>

              {/* Embedded CSS for Print / PDF */}
              <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                  @page {
                    size: A4 portrait;
                    margin: 12mm 15mm;
                  }
                  body {
                    background-color: #ffffff !important;
                    color: #111111 !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                  }
                  header, nav, footer, button, .no-print, input, select {
                    display: none !important;
                  }
                  #complete-bazi-report {
                    display: block !important;
                    color: #111111 !important;
                    background: transparent !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    width: 100% !important;
                  }
                  #complete-bazi-report .bg-\\[\\#171310\\],
                  #complete-bazi-report .bg-\\[\\#1D1712\\],
                  #complete-bazi-report .bg-\\[\\#14100C\\],
                  #complete-bazi-report .bg-\\[\\#120F0C\\],
                  #complete-bazi-report .bg-\\[\\#18130F\\],
                  #complete-bazi-report .bg-\\[\\#1B1612\\] {
                    background-color: #fcfbf9 !important;
                    border: 1px solid #d4c7b8 !important;
                    color: #222222 !important;
                    box-shadow: none !important;
                  }
                  #complete-bazi-report .text-\\[\\#F5EDE0\\],
                  #complete-bazi-report .text-\\[\\#E6D3A3\\],
                  #complete-bazi-report .text-\\[\\#E5D7C2\\] {
                    color: #111111 !important;
                  }
                  #complete-bazi-report .text-\\[\\#C8B89E\\],
                  #complete-bazi-report .text-\\[\\#A89882\\] {
                    color: #444444 !important;
                  }
                  #complete-bazi-report .text-amber-400,
                  #complete-bazi-report .text-amber-300 {
                    color: #b45309 !important;
                  }
                  #complete-bazi-report .text-emerald-400,
                  #complete-bazi-report .text-emerald-300 {
                    color: #047857 !important;
                  }
                  #complete-bazi-report .text-rose-400,
                  #complete-bazi-report .text-rose-300 {
                    color: #be123c !important;
                  }
                  .page-break-avoid {
                    page-break-inside: avoid !important;
                    break-inside: avoid !important;
                  }
                }
              `}} />
            </div> {/* Closing #complete-bazi-report */}
            </div>
          ) : (
            <div className="p-8 text-center text-rose-400 bg-rose-950/20 border border-rose-800/30 rounded-sm text-sm">
              Năm sinh nằm ngoài cơ sở dữ liệu tính toán tiết khí (1930 - 2035). Vui lòng chọn lại năm trong khoảng trên.
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          SUB-TAB 2: CỬU CUNG PHI TINH
         ======================================================== */}
      {activeSubTab === "flystar" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="border border-gold-800 border-t-gold-600 bg-lacquer-900/85 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gold-800 pb-4">
              <div>
                <h3 className="text-xl font-display font-semibold text-ivory-100 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-amber-500" />
                  <span>Ma Trận Cửu Cung Phi Tinh (Lạc Thư: Thượng Nam Hạ Bắc)</span>
                </h3>
                <p className="text-xs text-ivory-500 mt-0.5">
                  Nhấn vào từng ô để xem chi tiết ngôi sao, bản chất ngũ hành và phương pháp hóa giải/kích hoạt độc môn.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-ivory-300">Chọn Năm:</span>
                <select
                  value={selectedFlyYear}
                  onChange={(e) => setSelectedFlyYear(Number(e.target.value))}
                  className="bg-lacquer-700 border border-amber-600/40 text-ivory-100 text-xs sm:text-sm rounded-sm px-3 py-1.5 focus:outline-none"
                >
                  {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                    <option key={y} value={y}>
                      Năm {y} ({y === 2027 ? "Đinh Mùi - Cửu Tử" : y === 2026 ? "Bính Ngọ - Nhất Bạch" : y === 2028 ? "Mậu Thân - Bát Bạch" : y})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bàn Cờ 9 Cung Lạc Thư */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5 max-w-xl mx-auto">
              {flyingGrid.map((row, rIdx) =>
                row.map((starNum, cIdx) => {
                  const star = FLYING_STARS_DATA[starNum];
                  const directionName = COMPASS_DIRECTIONS[rIdx][cIdx];
                  const isCenter = rIdx === 1 && cIdx === 1;
                  const isSelected = selectedPalace?.row === rIdx && selectedPalace?.col === cIdx;

                  return (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      onClick={() => setSelectedPalace({ row: rIdx, col: cIdx })}
                      className={`relative p-3 sm:p-4 rounded-sm border text-center cursor-pointer transition-all flex flex-col justify-between min-h-[110px] sm:min-h-[125px] ${
                        isSelected
                          ? "ring-2 ring-amber-400 scale-[1.03] z-10"
                          : "hover:scale-[1.01]"
                      } ${
                        star.type === "danger"
                          ? "bg-rose-950/25 border-rose-800/40 hover:border-rose-500/70"
                          : star.type === "inauspicious"
                          ? "bg-amber-950/25 border-amber-800/40 hover:border-amber-500/70"
                          : "bg-emerald-950/25 border-emerald-800/40 hover:border-emerald-500/70"
                      } ${isCenter ? "border-amber-400/60 shadow-lg shadow-amber-900/20" : ""}`}
                    >
                      <div className="text-[10px] sm:text-xs text-ivory-500 font-serif">{directionName}</div>
                      <div
                        className={`text-2xl sm:text-3xl font-extrabold ${
                          star.type === "danger"
                            ? "text-rose-400"
                            : star.type === "inauspicious"
                            ? "text-amber-400"
                            : "text-emerald-400"
                        }`}
                      >
                        {starNum}
                      </div>
                      <div className="text-[11px] sm:text-xs font-semibold text-ivory-100 truncate">
                        {star.name.split(" ")[0]}
                      </div>
                      <div className="text-[10px] text-ivory-300 truncate">{star.label}</div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Chi tiết cung được chọn */}
            {selectedPalace && (
              <div className="bg-lacquer-800 border border-amber-600/40 rounded-md p-5 space-y-3 animate-fadeIn">
                {(() => {
                  const starNum = flyingGrid[selectedPalace.row][selectedPalace.col];
                  const star = FLYING_STARS_DATA[starNum];
                  const dir = COMPASS_DIRECTIONS[selectedPalace.row][selectedPalace.col];
                  return (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between border-b border-gold-800 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                            Phương Vị: {dir}
                          </span>
                          <span className="text-sm font-bold text-ivory-100">{star.name} ({star.chinese})</span>
                          <span className="text-xs text-ivory-500">Hành {star.element}</span>
                        </div>
                        <span
                          className={`text-xs px-2 py-0.5 rounded font-bold ${
                            star.type === "danger"
                              ? "bg-rose-950 text-rose-300"
                              : star.type === "inauspicious"
                              ? "bg-amber-950 text-amber-300"
                              : "bg-emerald-950 text-emerald-300"
                          }`}
                        >
                          {star.label}
                        </span>
                      </div>

                      <div className="text-xs sm:text-sm text-ivory-300 leading-relaxed">
                        <b className="text-gold-300">Vận Khí Phương Vị:</b> {star.fortune}
                      </div>

                      <div className="bg-lacquer-900 border border-amber-600/30 p-3 rounded-sm text-xs sm:text-sm text-emerald-300">
                        <b className="text-amber-400">Cách Kích Hoạt / Hóa Giải Tô Dân Phong:</b> {star.remedy}
                      </div>

                      <div className="text-xs text-ivory-500">
                        <b className="text-ivory-300">Ứng dụng thảm cửa chính nếu cửa mở hướng này:</b> {star.doorTreatment}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          SUB-TAB 3: PHẠM THÁI TUẾ
         ======================================================== */}
      {activeSubTab === "taisui" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="border border-gold-800 border-t-gold-600 bg-lacquer-900/85 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gold-800 pb-4">
              <div>
                <h3 className="text-xl font-display font-semibold text-ivory-100 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                  <span>Tra Cứu Phạm Thái Tuế & Thuật Phối Trang Sức Độc Môn</span>
                </h3>
                <p className="text-xs text-ivory-500 mt-0.5">
                  Quy tắc Tô Dân Phong: Đeo con giáp Tam Hợp / Lục Hợp với Thái Tuế, LOẠI TRỪ con giáp nào chính bản thân nó cũng phạm Thái Tuế.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={selectedTsYear}
                  onChange={(e) => setSelectedTsYear(Number(e.target.value))}
                  className="bg-lacquer-700 border border-amber-600/40 text-ivory-100 text-xs sm:text-sm rounded-sm px-3 py-1.5 focus:outline-none"
                >
                  {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                    <option key={y} value={y}>
                      Năm {y} ({TAISUI_RULES[y]?.canChi})
                    </option>
                  ))}
                </select>

                <select
                  value={selectedTsZodiac}
                  onChange={(e) => setSelectedTsZodiac(e.target.value)}
                  className="bg-lacquer-700 border border-amber-600/40 text-ivory-100 text-xs sm:text-sm rounded-sm px-3 py-1.5 focus:outline-none"
                >
                  {ZODIAC_LIST.map((z) => (
                    <option key={z} value={z}>
                      Tuổi {z}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Thẻ Kết Quả Đánh Giá Thái Tuế */}
            <div
              className={`p-6 rounded-md border ${
                tsEvaluation.isClashing
                  ? "bg-rose-950/20 border-rose-800/40"
                  : "bg-emerald-950/20 border-emerald-800/40"
              } space-y-4 shadow-xl`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-sm font-bold ${
                      tsEvaluation.isClashing
                        ? "bg-rose-900/60 text-rose-300 border border-rose-600/40"
                        : "bg-emerald-900/60 text-emerald-300 border border-emerald-600/40"
                    }`}
                  >
                    {tsEvaluation.type}
                  </span>
                  <span className="text-base sm:text-lg font-serif font-bold text-ivory-100">
                    Tuổi {selectedTsZodiac} trong Năm {selectedTsYear} ({tsEvaluation.ts.canChi})
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-ivory-300 leading-relaxed">
                {tsEvaluation.detail}
              </p>

              {/* Hướng Dẫn Đeo Trang Sức Hóa Giải Độc Môn */}
              <div className="bg-lacquer-900 border border-amber-600/40 rounded-sm p-4 space-y-2">
                <div className="text-xs font-serif font-bold text-gold-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Trang Sức Hóa Giải Thái Tuế Chuẩn Tô Dân Phong:</span>
                </div>
                <div className="text-xs sm:text-sm text-ivory-300 leading-relaxed">
                  Đeo mặt dây chuyền hoặc vòng tay mang hình con giáp:{" "}
                  <b className="text-emerald-300 text-sm">{tsEvaluation.safeAmulets.join(", ")}</b>.
                  Đây là các con giáp Tam Hợp / Lục Hợp với Thái Tuế năm {selectedTsYear} ({tsEvaluation.ts.zodiac}),
                  có khả năng hòa hợp Thái Tuế, hóa giải xung sát và trợ lực nhân duyên.
                </div>
                {tsEvaluation.forbiddenAmulets.length > 0 && (
                  <div className="text-xs text-rose-400 font-medium pt-1">
                    ⚠️ Tuyệt đối không đeo hình: <b>{tsEvaluation.forbiddenAmulets.join(", ")}</b> (vì chính các con giáp này cũng đang phạm Thái Tuế trong năm {selectedTsYear}).
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SUB-TAB 4: THẢM CỬA VƯỢNG TRẠCH
         ======================================================== */}
      {activeSubTab === "doormat" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="border border-gold-800 border-t-gold-600 bg-lacquer-900/85 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gold-800 pb-4">
              <div>
                <h3 className="text-xl font-display font-semibold text-ivory-100 flex items-center gap-2">
                  <DoorOpen className="w-5 h-5 text-amber-500" />
                  <span>Đại Môn Địa Chiên (Thảm Cửa Vượng Trạch Hóa Bệnh Pháp)</span>
                </h3>
                <p className="text-xs text-ivory-500 mt-0.5">
                  Cửa chính là miệng đón khí của cả ngôi nhà. Hằng năm theo sao phi tinh bay tới cửa để trải thảm kích tài hoặc hóa giải bệnh tật.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={selectedDoorYear}
                  onChange={(e) => setSelectedDoorYear(Number(e.target.value))}
                  className="bg-lacquer-700 border border-amber-600/40 text-ivory-100 text-xs sm:text-sm rounded-sm px-3 py-1.5 focus:outline-none"
                >
                  {[2026, 2027, 2028].map((y) => (
                    <option key={y} value={y}>
                      Năm {y}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedDoorDir}
                  onChange={(e) => setSelectedDoorDir(e.target.value)}
                  className="bg-lacquer-700 border border-amber-600/40 text-ivory-100 text-xs sm:text-sm rounded-sm px-3 py-1.5 focus:outline-none"
                >
                  {DIRECTIONS_8.map((d) => (
                    <option key={d} value={d}>
                      Hướng Cửa: {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-lacquer-800 border border-amber-600/40 rounded-md p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-gold-800 pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2.5 py-1 rounded-sm bg-amber-500/20 text-amber-300 font-bold">
                    Cửa Hướng: {selectedDoorDir}
                  </span>
                  <span className="text-base font-serif font-bold text-ivory-100">
                    Sao Số {doorStarResult.starNum} bay tới ({doorStarResult.starInfo.name})
                  </span>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-sm font-bold ${
                    doorStarResult.starInfo.type === "danger"
                      ? "bg-rose-950 text-rose-300"
                      : doorStarResult.starInfo.type === "inauspicious"
                      ? "bg-amber-950 text-amber-300"
                      : "bg-emerald-950 text-emerald-300"
                  }`}
                >
                  {doorStarResult.starInfo.label}
                </span>
              </div>

              <div className="text-xs sm:text-sm text-ivory-300 leading-relaxed">
                <b className="text-gold-300">Đặc Tính Sao Bay Tới Cửa:</b> {doorStarResult.starInfo.fortune}
              </div>

              <div className="bg-lacquer-900 border border-amber-500/40 p-4 rounded-sm text-xs sm:text-sm text-amber-300 space-y-1">
                <div className="font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Cách Chọn Màu Thảm Cửa & Hóa Giải Tô Dân Phong:</span>
                </div>
                <div className="text-ivory-100 leading-relaxed pt-1">
                  {doorStarResult.starInfo.doorTreatment}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SUB-TAB 5: HÓA ĐỘNG THỔ SÁT
         ======================================================== */}
      {activeSubTab === "dongtho" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="border border-gold-800 border-t-gold-600 bg-lacquer-900/85 p-6 space-y-6">
            <div className="border-b border-gold-800 pb-4 space-y-1">
              <h3 className="text-xl font-display font-semibold text-ivory-100 flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-500" />
                <span>{DONG_THO_CUC.title} (Sáng Tạo Năm 1997)</span>
              </h3>
              <p className="text-xs text-ivory-500 leading-relaxed">
                {DONG_THO_CUC.coreRule}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-ivory-300">Phương Vị Đang Bị Động Thổ Sát:</span>
              <select
                value={selectedDongThoDir}
                onChange={(e) => setSelectedDongThoDir(e.target.value as any)}
                className="bg-lacquer-700 border border-amber-600/40 text-ivory-100 text-xs sm:text-sm rounded-sm px-3 py-1.5 focus:outline-none"
              >
                {Object.keys(DONG_THO_CUC.directions).map((d) => (
                  <option key={d} value={d}>
                    Phương {d}
                  </option>
                ))}
              </select>
            </div>

            {(() => {
              const dt = DONG_THO_CUC.directions[selectedDongThoDir];
              return (
                <div className="bg-lacquer-800 border border-amber-600/40 rounded-md p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-gold-800 pb-3">
                    <span className="text-sm font-serif font-bold text-gold-300">
                      Vật Phẩm Khởi Đầu Khắc Sát: <b className="text-rose-400">{dt.starter}</b>
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-serif font-bold text-ivory-300">
                      Trật Tự Bày Trí 5 Vật Ngũ Hành Tương Sinh Đảo Nghịch:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                      {dt.sequence.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-lacquer-900 border border-amber-600/30 p-2.5 rounded-sm text-center text-xs font-medium text-ivory-100"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-lacquer-900 p-3 rounded-sm border border-white/5 text-xs text-ivory-300 leading-relaxed">
                    <b className="text-gold-300">Nguyên Lý Học Thuật:</b> {dt.explanation}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ========================================================
          SUB-TAB 6: 12 CON GIÁP 2027
         ======================================================== */}
      {activeSubTab === "zodiac" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="border border-gold-800 border-t-gold-600 bg-lacquer-900/85 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gold-800 pb-4">
              <div>
                <h3 className="text-xl font-display font-semibold text-ivory-100 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>Vận Trình 12 Con Giáp Năm 2027 Đinh Mùi (12 Tháng Chi Tiết)</span>
                </h3>
                <p className="text-xs text-ivory-500 mt-0.5">
                  Dịch thuật trọn vẹn từ sách xuất bản tiếng Trung của Đại sư Tô Dân Phong.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-ivory-300">Chọn Con Giáp:</span>
                <select
                  value={selectedZodiacName}
                  onChange={(e) => setSelectedZodiacName(e.target.value)}
                  className="bg-lacquer-700 border border-amber-600/40 text-ivory-100 text-xs sm:text-sm rounded-sm px-3 py-1.5 focus:outline-none"
                >
                  {ZODIAC_LIST.map((z) => (
                    <option key={z} value={z}>
                      Tuổi {z}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Chi tiết con giáp được chọn */}
            <div className="bg-lacquer-800 border border-amber-600/30 rounded-md p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-gold-800 pb-3">
                <div>
                  <h4 className="text-xl font-serif font-bold text-gold-300">
                    Tuổi {selectedZodiacName} — Vận Trình Năm Đinh Mùi 2027
                  </h4>
                  <div className="text-xs text-ivory-500 mt-1">{selectedZodiacData.yearSummary}</div>
                </div>
              </div>

              {/* Accordion 12 Tháng */}
              <div className="space-y-3">
                {selectedZodiacData.months.map((m: any, mIdx: number) => (
                  <details
                    key={mIdx}
                    className="group bg-lacquer-900 border border-gold-800/70 rounded-sm p-3.5 transition-all"
                  >
                    <summary className="flex items-center justify-between cursor-pointer list-none">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-serif font-bold text-amber-400">{m.month}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-ivory-300">
                          {m.theme}
                        </span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-ivory-500 group-open:rotate-180 transition-transform" />
                    </summary>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 mt-3 border-t border-white/5 text-xs text-ivory-300 leading-relaxed">
                      <div>
                        <b className="text-gold-300">Tài Chính:</b> {m.finance}
                      </div>
                      <div>
                        <b className="text-emerald-300">Sự Nghiệp:</b> {m.career}
                      </div>
                      <div>
                        <b className="text-rose-300">Tình Cảm:</b> {m.love}
                      </div>
                      <div>
                        <b className="text-blue-300">Sức Khỏe:</b> {m.health}
                      </div>
                      <div className="md:col-span-2 text-amber-300/90">
                        <b>Thị Phi & Nhắc Nhở:</b> {m.dispute}
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
