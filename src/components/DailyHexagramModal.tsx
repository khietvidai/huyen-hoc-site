import React, { useState, useMemo, useEffect } from "react";
import {
  X,
  Calendar,
  Sparkles,
  Sun,
  Dices,
  Copy,
  Check,
  BookOpen,
  ArrowRight,
  FileText,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  CheckCircle2,
  Compass,
  Clock,
  Flame,
  AlertTriangle,
  Star,
  Layers,
  ExternalLink,
} from "lucide-react";
import { getDailyHexagramData, DailyHexagramResult } from "../utils/dailyHexagram";
import { getThongThuDayDetails, ThongThuDayResult } from "../utils/thongThuDungSu";
import { Hexagram } from "../types";

export interface DailyHexagramModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardImages?: Record<number, string>;
  onNavigateToDetail?: (hexNumber: number) => void;
  onNavigateToManual?: (hexNumber: number) => void;
  onNavigateToCalendar?: (date?: Date) => void;
  onOpenWorkspace?: (tab?: "docs" | "sheets" | "gmail" | "picker") => void;
}

export const DailyHexagramModal: React.FC<DailyHexagramModalProps> = ({
  isOpen,
  onClose,
  cardImages = {},
  onNavigateToDetail,
  onNavigateToManual,
  onNavigateToCalendar,
  onOpenWorkspace,
}) => {
  // Ngày dương lịch đang chọn (mặc định hôm nay)
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  // Phân tab hiển thị: "all" (Xem Song Song Cả Hai), "hexagram" (Chỉ Quẻ Kinh Dịch), "calendar" (Chỉ Lịch Dụng Sự)
  const [activeTab, setActiveTab] = useState<"all" | "hexagram" | "calendar">("all");
  // Số quẻ ghi đè nếu người dùng tự bấm rút quẻ ngẫu nhiên cho bản thân hôm nay
  const [customHexNumber, setCustomHexNumber] = useState<number | undefined>(undefined);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Đóng bằng phím Esc
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Reset khi mở lại modal
  useEffect(() => {
    if (isOpen) {
      setCopied(false);
    }
  }, [isOpen]);

  // Dữ liệu quẻ ngày tính toán dựa trên ngày dương lịch
  const dailyData: DailyHexagramResult = useMemo(() => {
    return getDailyHexagramData(selectedDate, customHexNumber);
  }, [selectedDate, customHexNumber]);

  // Dữ liệu Lịch Dụng Sự tính toán cho ngày dương lịch đã chọn
  const thongThuData: ThongThuDayResult = useMemo(() => {
    return getThongThuDayDetails(
      selectedDate.getFullYear(),
      selectedDate.getMonth() + 1,
      selectedDate.getDate()
    );
  }, [selectedDate]);

  if (!isOpen) return null;

  const {
    solarDateFormatted,
    dayOfWeekVi,
    hexNumber,
    hexagram,
    advice,
    changingLine,
    changingLineMeaning,
    isCustomRandom,
  } = dailyData;

  const cardImage = cardImages[hexNumber];

  // Chuyển ngày trước / ngày sau
  const handleShiftDay = (offset: number) => {
    setCustomHexNumber(undefined);
    const nextDate = new Date(selectedDate.getTime());
    nextDate.setDate(nextDate.getDate() + offset);
    setSelectedDate(nextDate);
  };

  // Chọn ngày hôm nay
  const handleResetToday = () => {
    setCustomHexNumber(undefined);
    setSelectedDate(new Date());
  };

  // Người dùng chọn ngày từ ô date input (lịch dương)
  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;
    const [y, m, d] = val.split("-").map(Number);
    if (y && m && d) {
      setCustomHexNumber(undefined);
      setSelectedDate(new Date(y, m - 1, d));
    }
  };

  // Lắc / Rút ngẫu nhiên riêng cho bản thân hôm nay
  const handleRollPersonalRandom = () => {
    setIsRolling(true);
    let count = 0;
    const timer = setInterval(() => {
      const rnd = Math.floor(Math.random() * 64) + 1;
      setCustomHexNumber(rnd);
      count++;
      if (count > 8) {
        clearInterval(timer);
        setIsRolling(false);
      }
    }, 80);
  };

  // Sao chép toàn bộ lời bình Quẻ Ngày & Lịch Dụng Sự vào bộ nhớ tạm
  const handleCopyAdvice = async () => {
    const text = `☯️ QUẺ NGÀY KINH DỊCH & LỊCH DỤNG SỰ
📅 Dương Lịch: ${solarDateFormatted}
🌙 Âm Lịch: Ngày ${thongThuData.lunarDate.day} tháng ${thongThuData.lunarDate.month} (${thongThuData.lunarDate.monthFullName} - Năm ${thongThuData.lunarDate.yearFullName})
⭐ Can Chi: Ngày ${thongThuData.dayCanChi.fullName} • Nạp Âm: ${thongThuData.napAm.napAm} (${thongThuData.napAm.element})
🌟 Trực & Tú: Trực ${thongThuData.truc.name} (${thongThuData.truc.nature}) • Sao ${thongThuData.tu28.name} (${thongThuData.tu28.nature})
✨ Trực Nhật Tinh: ${thongThuData.trucNhatTinh.name} (${thongThuData.trucNhatTinh.nature}) • Ứng ${thongThuData.trucNhatTinh.mappedGeneral}
🏆 Đánh Giá Dụng Sự: ${thongThuData.overallAssessment.title} (${thongThuData.overallAssessment.verdict})

========================================
☯️ QUẺ KINH DỊCH HÔM NAY: #${hexNumber} ${hexagram.name} (${hexagram.vietnameseName})
⭐ Chủ Đề: ${advice.headline}
📖 Lời Bình: ${advice.summary}

✅ VIỆC NÊN LÀM (KINH DỊCH):
${advice.favorable.map((f) => `• ${f}`).join("\n")}

⚠️ VIỆC NÊN TRÁNH (KINH DỊCH):
${advice.unfavorable.map((u) => `• ${u}`).join("\n")}

📜 LỜI DẶN MINH TRIẾT:
"${advice.motto}"

🧘 TÂM THẾ CẦN GIỮ:
${advice.mindset}

⚡ HÀO ĐỘNG CỦA NGÀY: Hào ${changingLine} ${changingLineMeaning ? `(${changingLineMeaning.name})` : ""}
${changingLineMeaning ? `• Thoán: ${changingLineMeaning.text}\n• Nghĩa: ${changingLineMeaning.meaning}` : ""}

========================================
🏛️ THÔNG THƯ HỶ KỴ DỤNG SỰ:
🌿 VIỆC HỶ (NÊN LÀM):
${thongThuData.hyList.slice(0, 5).map((h) => `• [${h.category}] ${h.action} (${h.level}) - ${h.reason}`).join("\n")}

⚔️ VIỆC KỴ (KIÊNG LÀM):
${thongThuData.kyList.slice(0, 5).map((k) => `• [${k.category}] ${k.action} (${k.level}) - ${k.reason}`).join("\n")}

🧭 HƯỚNG XUẤT HÀNH:
• Hỷ Thần: Hướng ${thongThuData.xuatHanh.hyThan.direction} (${thongThuData.xuatHanh.hyThan.palace})
• Tài Thần: Hướng ${thongThuData.xuatHanh.taiThan.direction} (${thongThuData.xuatHanh.taiThan.palace})
• Hạc Thần: Hướng ${thongThuData.xuatHanh.hacThanDirection}

⏰ GIỜ HOÀNG ĐẠO CÁT LỢI:
${thongThuData.gioHoangDao.filter((g) => g.isHoangDao).map((g) => `• Giờ ${g.branchName} (${g.range}): ${g.starName}`).join("\n")}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback
    }
  };

  // Format date for <input type="date" />
  const dateInputVal = (() => {
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const d = String(selectedDate.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  })();

  const isToday = (() => {
    const today = new Date();
    return (
      selectedDate.getFullYear() === today.getFullYear() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getDate() === today.getDate()
    );
  })();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl my-auto bg-gradient-to-b from-[#1F1710] via-[#16110B] to-[#100C08] border-2 border-[#C9A55A] rounded-2xl shadow-[0_0_50px_rgba(212,175,55,0.35)] text-[#EAE0D0] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER MODAL */}
        <div className="px-4 py-3.5 sm:px-6 sm:py-4 bg-gradient-to-r from-[#2C1E10] via-[#382613] to-[#24170B] border-b border-[#5C3F1E] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D6B97A] to-[#75511A] flex items-center justify-center text-[#14120F] shadow-[0_0_15px_rgba(226,183,85,0.4)] border border-[#E6D3A3] shrink-0">
              <Sun className="w-5 h-5 text-[#14120F]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-serif font-black text-base sm:text-lg text-[#F5EAD4] tracking-wide flex items-center gap-2">
                  <span>QUẺ NGÀY KINH DỊCH & LỊCH DỤNG SỰ</span>
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#120F0C] text-[#D6B97A] border border-[#6E4F23]">
                  {isCustomRandom ? "🎲 Quẻ Rút Cá Nhân" : "☀️ Tương Hợp Lịch Dương"}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#C8B89E] font-serif">
                Hợp nhất Minh triết 64 Quẻ Chu Dịch &amp; Thông Thư Hiệp Kỷ Dụng Sự hàng ngày
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#1C140C] hover:bg-[#2F2113] text-[#A89882] hover:text-white border border-[#4D3620] transition-colors cursor-pointer"
            title="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TOOLBAR ĐIỀU KHIỂN LỊCH DƯƠNG & CHỌN TAB XEM */}
        <div className="px-4 py-2.5 sm:px-6 bg-[#17110A] border-b border-[#3B2917] flex flex-wrap items-center justify-between gap-2.5 text-xs">
          {/* Điều hướng ngày dương lịch */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => handleShiftDay(-1)}
              className="p-1 rounded-lg bg-[#241A10] hover:bg-[#342415] text-[#D8C7B0] border border-[#4D3620] cursor-pointer transition-colors"
              title="Xem ngày hôm trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleResetToday}
              className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                isToday && !isCustomRandom
                  ? "bg-amber-950/90 text-amber-300 border-amber-500 shadow-sm"
                  : "bg-[#241A10] hover:bg-[#342415] text-[#D8C7B0] border-[#4D3620]"
              }`}
            >
              Hôm Nay
            </button>

            <button
              type="button"
              onClick={() => handleShiftDay(1)}
              className="p-1 rounded-lg bg-[#241A10] hover:bg-[#342415] text-[#D8C7B0] border border-[#4D3620] cursor-pointer transition-colors"
              title="Xem ngày hôm sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Ô chọn lịch dương trực tiếp */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#241A10] border border-[#4D3620] text-[#D8C7B0]">
              <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <input
                type="date"
                value={dateInputVal}
                onChange={handleDateInputChange}
                className="bg-transparent text-[#F5EAD4] text-xs font-mono focus:outline-none cursor-pointer"
                title="Bấm chọn ngày dương lịch bất kỳ để xem Quẻ Ngày & Lịch Dụng Sự"
              />
            </div>
          </div>

          {/* Bộ chọn Chế Độ Xem: Song Song / Quẻ Dịch / Lịch Dụng Sự */}
          <div className="flex items-center gap-1 bg-[#1E150D] p-0.5 rounded-xl border border-[#432F1B]">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-2.5 py-1 rounded-lg text-xs font-serif font-bold transition-all cursor-pointer ${
                activeTab === "all"
                  ? "bg-gradient-to-r from-[#C9A55A] to-[#B38728] text-[#120F0C] shadow-sm"
                  : "text-[#C2B29B] hover:text-white"
              }`}
            >
              Song Song Cả Hai
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("hexagram")}
              className={`px-2.5 py-1 rounded-lg text-xs font-serif font-bold transition-all cursor-pointer ${
                activeTab === "hexagram"
                  ? "bg-gradient-to-r from-[#C9A55A] to-[#B38728] text-[#120F0C] shadow-sm"
                  : "text-[#C2B29B] hover:text-white"
              }`}
            >
              Quẻ Dịch
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("calendar")}
              className={`px-2.5 py-1 rounded-lg text-xs font-serif font-bold transition-all cursor-pointer ${
                activeTab === "calendar"
                  ? "bg-gradient-to-r from-[#C9A55A] to-[#B38728] text-[#120F0C] shadow-sm"
                  : "text-[#C2B29B] hover:text-white"
              }`}
            >
              Lịch Dụng Sự
            </button>
          </div>

          {/* Nút rút ngẫu nhiên cá nhân */}
          <div className="flex items-center gap-2 ml-auto">
            {isCustomRandom && (
              <button
                type="button"
                onClick={handleResetToday}
                className="text-[11px] text-[#A89882] hover:text-amber-300 underline cursor-pointer"
              >
                Trở về Quẻ Lịch Dương
              </button>
            )}
            <button
              type="button"
              onClick={handleRollPersonalRandom}
              disabled={isRolling}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-[#4A3219] to-[#61421E] hover:from-[#5C3F1E] hover:to-[#785226] text-[#E6D3A3] border border-[#9A7036] shadow text-xs font-semibold cursor-pointer active:scale-95 transition-all disabled:opacity-50"
              title="Bốc ngẫu nhiên một quẻ Kinh Dịch cho riêng bạn trong ngày hôm nay"
            >
              <Dices className={`w-3.5 h-3.5 text-amber-300 ${isRolling ? "animate-spin" : ""}`} />
              <span>{isRolling ? "Đang Gieo..." : "Gieo Quẻ Riêng Hôm Nay"}</span>
            </button>
          </div>
        </div>

        {/* NỘI DUNG CHÍNH CUỘN TRONG MODAL */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[76vh] overflow-y-auto">
          {/* BANNER TỔNG HỢP: DƯƠNG LỊCH ⟷ ÂM LỊCH ⟷ CAN CHI & TRỰC NHẬT TINH */}
          <div className="p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-[#2E1F11] via-[#22160C] to-[#2E1F11] border border-[#5E4223] shadow-md flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-serif font-black text-[#F5EAD4]">
                  📅 {solarDateFormatted}
                </span>
                <span className="text-[11px] px-2 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-600/60 font-mono">
                  {dayOfWeekVi}
                </span>
              </div>
              <div className="text-xs text-[#DECBB3] font-serif flex items-center gap-2 flex-wrap">
                <span>
                  🌙 <strong>Âm Lịch:</strong> Ngày {thongThuData.lunarDate.day}/{thongThuData.lunarDate.month} ({thongThuData.lunarDate.monthFullName}) - Năm {thongThuData.lunarDate.yearFullName}
                </span>
                <span className="text-[#8C7D6B] hidden sm:inline">•</span>
                <span className="text-[#E6D3A3] font-bold">
                  Ngày {thongThuData.dayCanChi.fullName}
                </span>
                <span className="text-[#8C7D6B] hidden sm:inline">•</span>
                <span className="text-emerald-300">
                  {thongThuData.napAm.napAm} ({thongThuData.napAm.element})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs px-2.5 py-1 rounded-lg font-bold border ${thongThuData.overallAssessment.badgeClass}`}>
                {thongThuData.overallAssessment.title}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-[#1C130B] border border-[#543C22] text-amber-300 font-mono">
                {thongThuData.trucNhatTinh.name} ({thongThuData.trucNhatTinh.nature})
              </span>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-[#1C130B] border border-[#543C22] text-purple-300 font-mono">
                Hào {changingLine} Động
              </span>
            </div>
          </div>

          {/* CẢNH BÁO NGÀY HUNG SÁT (NẾU CÓ TRONG THÔNG THƯ) */}
          {thongThuData.specialTaboos.activeWarnings.length > 0 && (
            <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-rose-950/70 via-[#260E12] to-rose-950/70 border border-rose-600/70 text-rose-200 text-xs flex items-center gap-2.5 shadow-sm">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 animate-pulse" />
              <div className="space-y-0.5 min-w-0">
                <span className="font-bold text-rose-300">CẢNH BÁO NGÀY KIÊNG KỴ ĐẶC BIỆT:</span>
                <div className="flex items-center gap-2 flex-wrap font-serif">
                  {thongThuData.specialTaboos.activeWarnings.map((msg: string, idx: number) => (
                    <span key={idx} className="px-2 py-0.2 rounded bg-rose-900/60 border border-rose-500/50 text-[11px] font-bold">
                      ⚠️ {msg}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* KHỐI NỘI DUNG 1: QUẺ KINH DỊCH HÔM NAY (HIỆN KHI activeTab !== 'calendar') */}
          {(activeTab === "all" || activeTab === "hexagram") && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between pb-1 border-b border-[#3E2D1B]">
                <span className="font-serif font-black text-sm sm:text-base text-[#E6D3A3] flex items-center gap-1.5 uppercase tracking-wide">
                  <span>☯️ MINH TRIẾT CHU DỊCH: QUẺ #{hexNumber} {hexagram.name}</span>
                </span>
                <span className="text-xs text-[#A89882] font-serif italic">
                  {hexagram.vietnameseName} ({hexagram.hanzi})
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                {/* CỘT TRÁI: HÌNH ẢNH / TƯỢNG HÀO (4 CỘT) */}
                <div className="md:col-span-4 flex flex-col items-center justify-center p-3.5 rounded-xl bg-[#18120B] border border-[#3E2D1A] space-y-3">
                  {cardImage ? (
                    <div className="relative group w-36 sm:w-44 aspect-[2/3] rounded-xl overflow-hidden border-2 border-[#C9A55A] shadow-xl">
                      <img
                        src={cardImage}
                        alt={hexagram.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-black/80 backdrop-blur-xs text-[#E6D3A3] font-mono font-bold text-xs border border-amber-600/70">
                        #{hexNumber}
                      </div>
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/80 to-transparent p-2 text-center">
                        <div className="font-serif font-bold text-xs text-[#F5EAD4] truncate">
                          {hexagram.name}
                        </div>
                        <div className="text-[10px] text-amber-200/80 font-mono">{hexagram.hanzi}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-36 sm:w-44 aspect-[2/3] rounded-xl bg-gradient-to-b from-[#2E2012] via-[#20150B] to-[#140E06] border-2 border-[#C9A55A] p-3 flex flex-col items-center justify-between shadow-xl">
                      <div className="w-full flex items-center justify-between text-[11px] font-mono text-[#C9A55A]">
                        <span>#{hexNumber}</span>
                        <span>{hexagram.element}</span>
                      </div>

                      {/* 6 Hào Chu Dịch */}
                      <div className="w-full space-y-1.5 my-auto px-2">
                        {[5, 4, 3, 2, 1, 0].map((idx) => {
                          const lineVal = hexagram.lines[idx];
                          const lineNum = idx + 1;
                          const isChanging = lineNum === changingLine;
                          return (
                            <div
                              key={idx}
                              className={`relative flex items-center justify-center gap-1.5 py-0.5 transition-all ${
                                isChanging ? "scale-105" : ""
                              }`}
                              title={`Hào ${lineNum}: ${lineVal === 1 ? "Dương" : "Âm"}${isChanging ? " (HÀO ĐỘNG CỦA NGÀY)" : ""}`}
                            >
                              {isChanging && (
                                <span className="absolute -left-2 text-[8px] text-amber-400 animate-pulse font-mono font-bold">
                                  ▶
                                </span>
                              )}
                              {lineVal === 1 ? (
                                <div
                                  className={`h-2.5 w-full rounded-sm ${
                                    isChanging
                                      ? "bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"
                                      : "bg-[#C9A55A]"
                                  }`}
                                />
                              ) : (
                                <div className="w-full flex gap-1.5">
                                  <div
                                    className={`h-2.5 w-1/2 rounded-sm ${
                                      isChanging
                                        ? "bg-gradient-to-r from-amber-400 to-yellow-300 shadow-[0_0_8px_rgba(251,191,36,0.8)]"
                                        : "bg-[#C9A55A]"
                                    }`}
                                  />
                                  <div
                                    className={`h-2.5 w-1/2 rounded-sm ${
                                      isChanging
                                        ? "bg-gradient-to-r from-yellow-300 to-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"
                                        : "bg-[#C9A55A]"
                                    }`}
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="text-center w-full">
                        <div className="font-serif font-bold text-xs text-[#E6D3A3] truncate">
                          {hexagram.name}
                        </div>
                        <div className="text-[10px] text-[#A89882] font-serif">{hexagram.vietnameseName}</div>
                      </div>
                    </div>
                  )}

                  {/* Tên Quẻ & Quái Tượng */}
                  <div className="text-center space-y-1 w-full">
                    <div className="font-serif font-black text-base text-[#E6D3A3] leading-tight">
                      #{hexNumber}: {hexagram.name}
                    </div>
                    <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#A89882] flex-wrap pt-0.5">
                      <span className="px-1.5 py-0.2 rounded bg-[#271C11] border border-[#4D3620]">
                        Thượng: {hexagram.upperTrigram}
                      </span>
                      <span>•</span>
                      <span className="px-1.5 py-0.2 rounded bg-[#271C11] border border-[#4D3620]">
                        Hạ: {hexagram.lowerTrigram}
                      </span>
                      <span>•</span>
                      <span className="px-1.5 py-0.2 rounded bg-[#271C11] border border-[#4D3620] text-amber-300">
                        {hexagram.omen}
                      </span>
                    </div>
                  </div>
                </div>

                {/* CỘT PHẢI: LỜI BÌNH NGẮN GỌN & MINH TRIẾT CỦA NGÀY (8 CỘT) */}
                <div className="md:col-span-8 space-y-3">
                  {/* CHỦ ĐỀ CHÍNH TRONG NGÀY */}
                  <div className="p-3 rounded-xl bg-gradient-to-r from-[#382613] via-[#2A1D0E] to-[#1C1309] border border-[#6B4D26] shadow-sm">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold mb-0.5">
                      ⭐ CHỦ ĐỀ MINH TRIẾT HÔM NAY
                    </div>
                    <div className="font-serif font-black text-base sm:text-lg text-[#FFF4DA] tracking-wide">
                      {advice.headline}
                    </div>
                  </div>

                  {/* LỜI BÌNH TỔNG THỂ CỦA NGÀY */}
                  <div className="p-3.5 rounded-xl bg-[#1C140C] border border-[#432F1A] space-y-1">
                    <div className="text-[11px] font-serif font-bold text-[#D6B97A] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Lời Bình Dẫn Đường Hôm Nay:</span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#EAE0D0] leading-relaxed font-serif">
                      {advice.summary}
                    </p>
                  </div>

                  {/* HAI CỘT VIỆC NÊN LÀM & VIỆC NÊN TRÁNH (THEO QUẺ) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="p-2.5 sm:p-3 rounded-xl bg-[#0F2218] border border-emerald-700/60 space-y-1">
                      <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Nên Làm (Quẻ Dịch Khuyên):</span>
                      </div>
                      <ul className="space-y-1 text-xs text-emerald-100/90 font-serif">
                        {advice.favorable.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-emerald-400 font-bold mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-2.5 sm:p-3 rounded-xl bg-[#261012] border border-rose-700/60 space-y-1">
                      <div className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>Nên Tránh (Quẻ Dịch Cảnh Báo):</span>
                      </div>
                      <ul className="space-y-1 text-xs text-rose-100/90 font-serif">
                        {advice.unfavorable.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-rose-400 font-bold mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* LỜI DẶN MINH TRIẾT & TÂM THẾ CẦN GIỮ */}
                  <div className="p-3 rounded-xl bg-[#21170F] border border-[#4D3620] space-y-1.5">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-amber-400/90 font-bold block mb-0.5">
                        📜 Lời Dặn Cốt Lõi:
                      </span>
                      <p className="text-xs text-[#F5EAD4] font-serif italic border-l-2 border-[#C9A55A] pl-2.5 py-0.5">
                        "{advice.motto}"
                      </p>
                    </div>
                    <div className="pt-1 border-t border-[#382614]">
                      <span className="text-[10px] uppercase tracking-wider text-[#A89882] font-semibold block mb-0.5">
                        🧘 Tâm Thế Cần Giữ:
                      </span>
                      <p className="text-xs text-[#DDD0BE] font-serif">
                        {advice.mindset}
                      </p>
                    </div>
                  </div>

                  {/* HÀO ĐỘNG CỦA NGÀY */}
                  {changingLineMeaning && (
                    <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-[#20142A] via-[#1A1024] to-[#20142A] border border-purple-500/50 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-purple-300 font-serif flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                          <span>Hào Động Ngày: {changingLineMeaning.name}</span>
                        </span>
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-purple-950 text-purple-200 border border-purple-600 font-mono">
                          Hào #{changingLine}
                        </span>
                      </div>
                      <div className="text-xs text-[#E9DCF5] font-serif italic pl-2 border-l border-purple-400/60">
                        "{changingLineMeaning.text}"
                      </div>
                      <p className="text-[11px] text-[#CDB9E4] font-serif">
                        {changingLineMeaning.meaning}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* KHỐI NỘI DUNG 2: THÔNG THƯ LỊCH DỤNG SỰ (HIỆN KHI activeTab !== 'hexagram') */}
          {(activeTab === "all" || activeTab === "calendar") && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between pb-1 border-b border-[#3E2D1B]">
                <span className="font-serif font-black text-sm sm:text-base text-[#D6B97A] flex items-center gap-1.5 uppercase tracking-wide">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>🏛️ THÔNG THƯ HIỆP KỶ DỤNG SỰ NGÀY {selectedDate.getDate()}/{selectedDate.getMonth() + 1}/{selectedDate.getFullYear()}</span>
                </span>
                <span className="text-xs text-amber-300 font-serif font-bold">
                  {thongThuData.overallAssessment.title}
                </span>
              </div>

              {/* THÔNG TIN CHI TIẾT LỊCH DỤNG SỰ */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {/* 1. Trực Nhật Tinh & Thiên Tướng */}
                <div className="p-2.5 rounded-xl bg-[#1B140D] border border-[#48341E] space-y-1">
                  <span className="text-[10px] text-[#A89882] block font-mono uppercase">
                    Trực Nhật Tinh
                  </span>
                  <div className="font-serif font-bold text-amber-300 text-sm">
                    {thongThuData.trucNhatTinh.name}
                  </div>
                  <div className="text-[10.5px] text-[#D4C3AC] flex items-center justify-between">
                    <span>{thongThuData.trucNhatTinh.nature}</span>
                    <span className="text-[#E6D3A3] font-serif font-bold">
                      Ứng {thongThuData.trucNhatTinh.mappedGeneral}
                    </span>
                  </div>
                </div>

                {/* 2. Trực & Nhị Thập Bát Tú */}
                <div className="p-2.5 rounded-xl bg-[#1B140D] border border-[#48341E] space-y-1">
                  <span className="text-[10px] text-[#A89882] block font-mono uppercase">
                    Kiến Trừ &amp; Bát Tú
                  </span>
                  <div className="font-serif font-bold text-amber-300 text-sm">
                    Trực {thongThuData.truc.name}
                  </div>
                  <div className="text-[10.5px] text-[#D4C3AC] truncate">
                    Sao {thongThuData.tu28.name} ({thongThuData.tu28.nature})
                  </div>
                </div>

                {/* 3. Nạp Âm Ngũ Hành */}
                <div className="p-2.5 rounded-xl bg-[#1B140D] border border-[#48341E] space-y-1">
                  <span className="text-[10px] text-[#A89882] block font-mono uppercase">
                    Hoa Giáp Nạp Âm
                  </span>
                  <div className="font-serif font-bold text-amber-300 text-sm truncate">
                    {thongThuData.napAm.napAm}
                  </div>
                  <div className="text-[10.5px] text-[#D4C3AC] truncate">
                    Hành {thongThuData.napAm.element} • {thongThuData.dayCanChi.fullName}
                  </div>
                </div>

                {/* 4. Hướng Xuất Hành */}
                <div className="p-2.5 rounded-xl bg-[#1B140D] border border-[#48341E] space-y-1">
                  <span className="text-[10px] text-[#A89882] block font-mono uppercase">
                    Xuất Hành Đón Thần
                  </span>
                  <div className="text-[11px] text-[#D4C3AC] space-y-0.5">
                    <div>
                      <strong className="text-amber-400">Hỷ Thần:</strong> Hướng {thongThuData.xuatHanh.hyThan.direction} ({thongThuData.xuatHanh.hyThan.palace})
                    </div>
                    <div>
                      <strong className="text-emerald-400">Tài Thần:</strong> Hướng {thongThuData.xuatHanh.taiThan.direction} ({thongThuData.xuatHanh.taiThan.palace})
                    </div>
                  </div>
                </div>
              </div>

              {/* LỜI BÌNH TỔNG QUAN DỤNG SỰ */}
              <div className="p-3 rounded-xl bg-[#1A130B] border border-[#4D361F] space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-serif font-bold text-[#D6B97A] flex items-center gap-1.5">
                    <span>📜 Luận Giải Dụng Sự Cổ Truyền:</span>
                  </span>
                  <span className="text-[11px] text-[#C2B19A] italic">
                    "{thongThuData.overallAssessment.poemOrQuote}"
                  </span>
                </div>
                <p className="text-xs text-[#EAE0D0] leading-relaxed font-serif">
                  {thongThuData.overallAssessment.verdict}
                </p>
              </div>

              {/* HAI CỘT VIỆC HỶ (CÁT SỰ) & VIỆC KỴ (HUNG SỰ) THEO THÔNG THƯ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* VIỆC HỶ */}
                <div className="p-3 rounded-xl bg-[#0D2015] border border-emerald-700/60 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
                    <span className="flex items-center gap-1.5">
                      <span>🌿</span>
                      <span>Việc Hỷ (Lịch Dụng Sự Khuyên Làm):</span>
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-200 border border-emerald-600 font-mono">
                      {thongThuData.hyList.length} việc
                    </span>
                  </div>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {thongThuData.hyList.slice(0, 6).map((item) => (
                      <div key={item.id} className="text-xs text-emerald-100/90 font-serif bg-emerald-950/40 p-1.5 rounded-lg border border-emerald-800/40">
                        <div className="font-bold text-emerald-200 flex items-center justify-between">
                          <span>{item.iconTag} {item.action}</span>
                          <span className="text-[9.5px] text-emerald-400 font-mono font-normal">
                            {item.level}
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-300/80 mt-0.5">
                          {item.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* VIỆC KỴ */}
                <div className="p-3 rounded-xl bg-[#250F12] border border-rose-700/60 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-rose-300">
                    <span className="flex items-center gap-1.5">
                      <span>⚔️</span>
                      <span>Việc Kỵ (Lịch Dụng Sự Kiêng Làm):</span>
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-950 text-rose-200 border border-rose-600 font-mono">
                      {thongThuData.kyList.length} việc
                    </span>
                  </div>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {thongThuData.kyList.slice(0, 6).map((item) => (
                      <div key={item.id} className="text-xs text-rose-100/90 font-serif bg-rose-950/40 p-1.5 rounded-lg border border-rose-800/40">
                        <div className="font-bold text-rose-200 flex items-center justify-between">
                          <span>{item.iconTag} {item.action}</span>
                          <span className="text-[9.5px] text-rose-400 font-mono font-normal">
                            {item.level}
                          </span>
                        </div>
                        <p className="text-[11px] text-rose-300/80 mt-0.5">
                          {item.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 6 GIỜ HOÀNG ĐẠO TRONG NGÀY */}
              <div className="p-3 rounded-xl bg-[#181109] border border-[#4A351D] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-serif font-bold text-amber-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>6 Giờ Hoàng Đạo Cát Lành Trong Ngày:</span>
                  </span>
                  <span className="text-[10px] text-[#A89882] font-mono">
                    Khởi sự • Ký kết • Xuất hành
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5">
                  {thongThuData.gioHoangDao.filter((g) => g.isHoangDao).map((g) => (
                    <div
                      key={g.branchName}
                      className="p-1.5 rounded-lg bg-[#24180E] border border-amber-600/40 text-center space-y-0.5"
                    >
                      <div className="font-serif font-bold text-amber-200 text-xs">
                        Giờ {g.branchName}
                      </div>
                      <div className="text-[10px] text-[#A89882] font-mono">
                        {g.range}
                      </div>
                      <div className="text-[9.5px] text-amber-400/90 font-mono truncate">
                        {g.starName}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="px-4 py-3 sm:px-6 bg-[#140E08] border-t border-[#3B2917] flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Nút Sao Chép */}
            <button
              type="button"
              onClick={handleCopyAdvice}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#24190F] hover:bg-[#342415] text-[#D8C7B0] hover:text-white border border-[#4D3620] text-xs font-semibold cursor-pointer transition-all active:scale-95"
              title="Sao chép toàn bộ lời bình Quẻ Ngày & Lịch Dụng Sự vào bộ nhớ tạm"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
              <span>{copied ? "Đã Sao Chép Đầy Đủ!" : "Sao Chép Quẻ & Lịch"}</span>
            </button>

            {/* Lưu vào Google Workspace nếu có */}
            {onOpenWorkspace && (
              <button
                type="button"
                onClick={() => onOpenWorkspace("docs")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#24190F] hover:bg-[#342415] text-[#D8C7B0] hover:text-white border border-[#4D3620] text-xs font-semibold cursor-pointer transition-all active:scale-95"
                title="Lưu hoặc chia sẻ lời bình qua Google Workspace (Docs/Sheets)"
              >
                <FileText className="w-3.5 h-3.5 text-sky-400" />
                <span>Lưu Vào Docs</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Chuyển sang Tab Lịch Dụng Sự */}
            {onNavigateToCalendar && (
              <button
                type="button"
                onClick={() => {
                  onNavigateToCalendar(selectedDate);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2E2012] hover:bg-[#3D2B18] text-[#D6B97A] hover:text-white border border-[#6B4D26] text-xs font-serif font-bold cursor-pointer transition-all"
                title="Mở toàn bộ Bảng Lịch Dụng Sự và 12 Giờ Tâm Ấn Phú"
              >
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Xem Bảng Lịch Dụng Sự</span>
              </button>
            )}

            {/* Đọc Thuyết Minh Chi Tiết */}
            {onNavigateToManual && (
              <button
                type="button"
                onClick={() => {
                  onNavigateToManual(hexNumber);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2E2012] hover:bg-[#3D2B18] text-[#D6B97A] hover:text-white border border-[#6B4D26] text-xs font-serif font-bold cursor-pointer transition-all"
                title="Mở Thuyết Minh 64 Quẻ để đọc sâu toàn văn"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Thuyết Minh Quẻ #{hexNumber}</span>
              </button>
            )}

            {/* Xem Luận Giải Quẻ */}
            {onNavigateToDetail && (
              <button
                type="button"
                onClick={() => {
                  onNavigateToDetail(hexNumber);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#C9A55A] to-[#B38728] hover:brightness-110 text-[#120F0C] text-xs font-serif font-bold shadow-md cursor-pointer transition-all"
                title="Mở sang trang Giải Nghĩa Quẻ đầy đủ"
              >
                <span>Xem Giải Nghĩa</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#120F0C]" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
