import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Star,
  Camera,
  Download,
  Check,
  Info,
  Shield,
  Layers,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Compass,
  Flame,
  BookOpen,
  Calculator,
  ArrowRight,
  ArrowRightLeft,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Heart,
} from "lucide-react";
import { getThongThuDayDetails, ThongThuDayResult } from "../utils/thongThuDungSu";
import { getDailyHexagramData } from "../utils/dailyHexagram";
import {
  getJulianDay,
  getDayCanChi,
  getHourCanChi,
  convertSolarToLunar,
  getTrucNhatTinh,
  getNhiThapBatTu,
  getTrucOfDay,
  HOUR_BRANCH_RANGES,
  CAN_NAMES,
  CHI_NAMES,
} from "../utils/lunarCalendar";
import {
  TRUC_NHAT_TINH_12_LIST,
  TRUC_NHAT_TINH_INFO_MAP,
  getMonthGroupIndex,
  getTrucNhatTinhByBranchAndMonth,
  TrucNhatTinhDetail,
} from "../data/trucNhatTinhMatrix";
import {
  getTamAnPhuForTrucNhatTinh,
  TrucNhatTinhTamAnResult,
  TRUC_NHAT_TINH_TO_THIEN_TUONG_MAP,
} from "../data/tamAnPhuExtended";
import {
  getBaziForDate,
  getNguyetTuongForDate,
  getThreeMonthsSolarTerms,
  calculateTuoiVaoVan,
  calculateTuoiVaoVanBetween,
  convertDaysFloatToTuoiVaoVan,
  TransitionSolarTerm,
  DayBaziDetail,
  NguyetTuongDetail,
  BaziTuoiVaoVanResult,
} from "../utils/solarTerms";
import { captureElementToPng, downloadDataUrlAsPng } from "../utils/captureHelper";
import { ExportImageModal } from "./ExportImageModal";

interface LichDungSuSectionProps {
  onSelectHourPillar?: (can: string, chi: string) => void;
  onOpenDailyHexagram?: () => void;
  cardImages?: Record<number, string>;
  className?: string;
}

export const LichDungSuSection: React.FC<LichDungSuSectionProps> = ({
  onSelectHourPillar,
  onOpenDailyHexagram,
  cardImages = {},
  className = "",
}) => {
  // Thời điểm hiện tại
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentDay = now.getDate();
  const currentHour = now.getHours();

  // Xác định chi giờ hiện tại
  const currentHourChiIdx = Math.floor(((currentHour + 1) % 24) / 2);

  // State chọn năm, tháng, ngày, giờ
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedDay, setSelectedDay] = useState<number>(currentDay);
  const [selectedHourChiIdx, setSelectedHourChiIdx] = useState<number>(currentHourChiIdx);

  // Input tạm thời cho Năm, Tháng, Ngày để người dùng có thể gõ trực tiếp (điền vào)
  const [yearInput, setYearInput] = useState<string>(String(currentYear));
  const [monthInput, setMonthInput] = useState<string>(String(currentMonth));
  const [dayInput, setDayInput] = useState<string>(String(currentDay));

  // Đồng bộ khi selectedYear, selectedMonth, selectedDay thay đổi
  useEffect(() => {
    setYearInput(String(selectedYear));
  }, [selectedYear]);

  useEffect(() => {
    setMonthInput(String(selectedMonth));
  }, [selectedMonth]);

  useEffect(() => {
    setDayInput(String(selectedDay));
  }, [selectedDay]);

  // State thu gọn / mở rộng bảng 12 giờ Địa Chi (luôn thu gọn mặc định)
  const [isHourSectionCollapsed, setIsHourSectionCollapsed] = useState<boolean>(true);

  // Giờ và phút sinh cụ thể để bù trừ chính xác khi tính Tuổi Vào Vận
  const [customBirthHour, setCustomBirthHour] = useState<number>(currentHour);
  const [customBirthMinute, setCustomBirthMinute] = useState<number>(now.getMinutes());
  // Giới tính (Nam / Nữ) để xác định chiều khởi vận (Dương Nam / Âm Nữ thuận; Âm Nam / Dương Nữ nghịch)
  const [gender, setGender] = useState<"male" | "female">("male");
  // Mục tiêu so sánh khởi vận: "prev" (Tháng trước / Tiết trước) | "next" (Tháng sau / Tiết sau)
  const [comparisonTarget, setComparisonTarget] = useState<"prev" | "next">("prev");
  // Tiết khí tùy chọn trong 3 tháng nếu người dùng muốn nhấn vào một tiết cụ thể
  const [selectedCustomTerm, setSelectedCustomTerm] = useState<TransitionSolarTerm | null>(null);

  // State Trực Nhật Tinh (Mặc định tự động theo ngày, hoặc cho phép người dùng đổi thủ công để đối chiếu 12 Tướng)
  const [manualStarName, setManualStarName] = useState<string | null>(null);

  // State chụp ảnh xuất file
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [exportedImageUrl, setExportedImageUrl] = useState<string | null>(null);
  const [exportModalTitle, setExportModalTitle] = useState<string>("");
  const [exportModalFilename, setExportModalFilename] = useState<string>("");
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  // Mở rộng xem chi tiết toàn văn lời bình Quẻ Kinh Dịch của ngày
  const [isDailyHexExpanded, setIsDailyHexExpanded] = useState<boolean>(false);

  // Modal xem chi tiết một Tượng Tâm Ấn Phú
  const [selectedEntryDetail, setSelectedEntryDetail] = useState<{
    branch: string;
    hourCanChi: string;
    hourRange: string;
    entry: {
      tuongName: string;
      tuongChinese: string;
      fullLine: string;
      meaning: string;
    };
    general: {
      name: string;
      mappedGeneralName: string;
      overview: string;
      notes?: string;
    };
  } | null>(null);

  // Ref container cần chụp ảnh
  const captureBoardRef = useRef<HTMLDivElement>(null);
  const calendarGridRef = useRef<HTMLDivElement>(null);

  // Tab lọc hiển thị Thông Thư Hỷ Kỵ: "all" (Toàn bộ) | "hy" (Việc Hỷ) | "ky" (Việc Kỵ) | "sao" (Sao Cát / Hung) | "xuatHanh" (Xuất hành & Giờ lành)
  const [thongThuTab, setThongThuTab] = useState<"all" | "hy" | "ky" | "sao" | "xuatHanh">("all");
  // Thu gọn / mở rộng bảng Thông Thư Hỷ Kỵ (mặc định mở để hiển thị ngay sau bản đồ lịch)
  const [isThongThuCollapsed, setIsThongThuCollapsed] = useState<boolean>(false);

  // Tính số ngày trong tháng được chọn
  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth, 0).getDate();
  }, [selectedYear, selectedMonth]);

  // Xác định ngày bắt đầu tháng là thứ mấy (0: CN, 1: T2, ..., 6: T7)
  const firstDayWeekday = useMemo(() => {
    const day = new Date(selectedYear, selectedMonth - 1, 1).getDay();
    // Chuyển về T2 là 0, CN là 6
    return day === 0 ? 6 : day - 1;
  }, [selectedYear, selectedMonth]);

  // Danh sách các ngày trong map 1 tháng
  const monthDaysList = useMemo(() => {
    const list = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const jdn = getJulianDay(selectedYear, selectedMonth, d);
      const canChi = getDayCanChi(jdn);
      const lunar = convertSolarToLunar(d, selectedMonth, selectedYear);
      // Tính Trực Nhật Tinh theo Chi của tháng (theo Tiết Khí Bát Tự thực tế)
      const baziDay = getBaziForDate(selectedYear, selectedMonth, d, 12);
      const monthGroup = getMonthGroupIndex(baziDay.monthPillar.chi);
      const star = getTrucNhatTinhByBranchAndMonth(canChi.chiIdx, monthGroup);
      const tu28 = getNhiThapBatTu(jdn);
      const truc = getTrucOfDay(lunar.month, canChi.chiIdx);
      const isToday =
        selectedYear === currentYear &&
        selectedMonth === currentMonth &&
        d === currentDay;
      const isSelected = d === selectedDay;

      list.push({
        day: d,
        jdn,
        canChi,
        lunar,
        monthBranch: baziDay.monthPillar.chi,
        monthGroup,
        star,
        tu28,
        truc,
        isToday,
        isSelected,
      });
    }
    return list;
  }, [selectedYear, selectedMonth, daysInMonth, selectedDay, currentYear, currentMonth, currentDay]);

  // Thông tin ngày đang chọn
  const selectedDayInfo = useMemo(() => {
    const jdn = getJulianDay(selectedYear, selectedMonth, selectedDay);
    const canChi = getDayCanChi(jdn);
    const lunar = convertSolarToLunar(selectedDay, selectedMonth, selectedYear);
    // Tính theo Chi của tháng (tháng Tiết Khí Bát Tự)
    const baziSelected = getBaziForDate(selectedYear, selectedMonth, selectedDay, 12);
    const monthBranch = baziSelected.monthPillar.chi;
    const monthGroup = getMonthGroupIndex(monthBranch);
    // Trực Nhật Tinh chuẩn theo bảng cập nhật (hoặc cho phép chọn thủ công để tra cứu đối chiếu)
    const defaultStar = getTrucNhatTinhByBranchAndMonth(canChi.chiIdx, monthGroup);
    const activeStarName = manualStarName || defaultStar.name;
    const activeStar =
      TRUC_NHAT_TINH_INFO_MAP[activeStarName] || defaultStar;
    const tu28 = getNhiThapBatTu(jdn);
    const truc = getTrucOfDay(lunar.month, canChi.chiIdx);

    return {
      day: selectedDay,
      jdn,
      canChi,
      lunar,
      monthBranch,
      monthGroup,
      defaultStar,
      activeStar,
      tu28,
      truc,
    };
  }, [selectedYear, selectedMonth, selectedDay, manualStarName]);

  // Quẻ Kinh Dịch tương ứng với ngày đang chọn (Quẻ Ngày theo Lịch Dương)
  const dailyHexData = useMemo(() => {
    const d = new Date(selectedYear, selectedMonth - 1, selectedDay);
    return getDailyHexagramData(d);
  }, [selectedYear, selectedMonth, selectedDay]);

  // Bảng 12 Địa Chi ứng 12 Giờ so với Trực Nhật Tinh ra tên Tâm Ấn Phú
  const tamAnPhuHourTable = useMemo(() => {
    const starName = selectedDayInfo.activeStar.name;
    const dayCanIdx = selectedDayInfo.canChi.canIdx;

    return HOUR_BRANCH_RANGES.map((hourBranch, idx) => {
      const hourCanChi = getHourCanChi(dayCanIdx, idx);
      const entryResult = getTamAnPhuForTrucNhatTinh(starName, hourBranch.branch);
      const isSelectedHour = idx === selectedHourChiIdx;

      return {
        index: idx,
        branch: hourBranch.branch,
        chineseBranch: CHI_NAMES[idx],
        hourRange: hourBranch.range,
        hourDesc: hourBranch.desc,
        hourCanChi: hourCanChi.fullName,
        hourCan: hourCanChi.can,
        hourChi: hourCanChi.chi,
        entry: entryResult
          ? {
              tuongName: entryResult.tuongName,
              tuongChinese: entryResult.tuongChinese,
              fullLine: entryResult.fullLine,
              meaning: entryResult.meaning,
            }
          : undefined,
        general: entryResult
          ? {
              name: entryResult.starName,
              mappedGeneralName: entryResult.mappedGeneralName,
              overview: entryResult.generalOverview,
              notes: entryResult.generalNotes,
            }
          : undefined,
        isSelectedHour,
      };
    });
  }, [selectedDayInfo.activeStar.name, selectedDayInfo.canChi.canIdx, selectedHourChiIdx]);

  // Thông tin Bát Tự ngày hôm đó (Tứ Trụ: Năm • Tháng • Ngày • Giờ)
  const baziInfo = useMemo(() => {
    return getBaziForDate(selectedYear, selectedMonth, selectedDay, selectedHourChiIdx);
  }, [selectedYear, selectedMonth, selectedDay, selectedHourChiIdx]);

  // Thông tin Nguyệt Tướng Lục Nhâm (Thái Dương cung vị theo Tiết Khí)
  const nguyetTuongInfo = useMemo(() => {
    return getNguyetTuongForDate(selectedYear, selectedMonth, selectedDay, 12);
  }, [selectedYear, selectedMonth, selectedDay]);

  // Thông tin chuyển đổi Tiết Khí 3 tháng: Tháng Trước • Tháng Đang Chọn • Tháng Sau
  const threeMonthsSolarTerms = useMemo(() => {
    return getThreeMonthsSolarTerms(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth]);

  // Giờ đang chọn trong bảng Tâm Ấn Phú
  const selectedHourData = useMemo(() => {
    return tamAnPhuHourTable[selectedHourChiIdx] || tamAnPhuHourTable[0];
  }, [tamAnPhuHourTable, selectedHourChiIdx]);

  // Thông tin Thông Thư Dụng Sự ngày hôm đó (Hỷ Kỵ, Cát Hung, Xuất Hành, Giờ Hoàng Đạo)
  const thongThuData = useMemo(() => {
    return getThongThuDayDetails(selectedYear, selectedMonth, selectedDay);
  }, [selectedYear, selectedMonth, selectedDay]);

  // Tính Tuổi Vào Vận theo Bát Tự Tử Bình (mốc thời điểm chọn + bù trừ giờ phút)
  const tuoiVaoVanData = useMemo(() => {
    const hourFloat = customBirthHour + customBirthMinute / 60;
    return calculateTuoiVaoVan(selectedYear, selectedMonth, selectedDay, hourFloat, gender);
  }, [selectedYear, selectedMonth, selectedDay, customBirthHour, customBirthMinute, gender]);

  // Kết quả đối chiếu với tiết khí tháng trước hoặc sau (hoặc tiết tùy chọn được click)
  const activeComparisonDetail = useMemo(() => {
    const hourFloat = customBirthHour + customBirthMinute / 60;
    const birthJD = getJulianDay(selectedYear, selectedMonth, selectedDay) - 0.5 + (hourFloat - 7) / 24;

    if (selectedCustomTerm) {
      const isForward = selectedCustomTerm.jd >= birthJD;
      return {
        ...calculateTuoiVaoVanBetween(birthJD, selectedCustomTerm.jd, selectedCustomTerm.record.name, isForward),
        term: selectedCustomTerm,
      };
    }

    if (comparisonTarget === "prev") {
      // Tiết khí tháng trước: ưu tiên Chính Tiết tháng trước
      const prevTerm =
        threeMonthsSolarTerms.prevMonth.terms.find((t) => t.record.isMajor) ||
        threeMonthsSolarTerms.prevMonth.terms[0];
      return {
        ...calculateTuoiVaoVanBetween(birthJD, prevTerm.jd, prevTerm.record.name, false),
        term: prevTerm,
      };
    } else {
      // Tiết khí tháng sau: ưu tiên Chính Tiết tháng sau
      const nextTerm =
        threeMonthsSolarTerms.nextMonth.terms.find((t) => t.record.isMajor) ||
        threeMonthsSolarTerms.nextMonth.terms[0];
      return {
        ...calculateTuoiVaoVanBetween(birthJD, nextTerm.jd, nextTerm.record.name, true),
        term: nextTerm,
      };
    }
  }, [
    selectedCustomTerm,
    comparisonTarget,
    threeMonthsSolarTerms,
    selectedYear,
    selectedMonth,
    selectedDay,
    customBirthHour,
    customBirthMinute,
  ]);

  // Chuyển tháng trước / sau (luôn thu gọn 12 giờ và tự động tính tiết trước / sau trừ tháng hiện tại)
  const handlePrevMonth = () => {
    let newYear = selectedYear;
    let newMonth = selectedMonth;
    if (selectedMonth === 1) {
      newYear = selectedYear - 1;
      newMonth = 12;
      setSelectedYear(newYear);
      setSelectedMonth(12);
    } else {
      newMonth = selectedMonth - 1;
      setSelectedMonth(newMonth);
    }
    const maxDays = new Date(newYear, newMonth, 0).getDate();
    if (selectedDay > maxDays) {
      setSelectedDay(maxDays);
    }
    setManualStarName(null);
    setIsHourSectionCollapsed(true);
    setComparisonTarget("prev");
    setSelectedCustomTerm(null);
  };

  const handleNextMonth = () => {
    let newYear = selectedYear;
    let newMonth = selectedMonth;
    if (selectedMonth === 12) {
      newYear = selectedYear + 1;
      newMonth = 1;
      setSelectedYear(newYear);
      setSelectedMonth(1);
    } else {
      newMonth = selectedMonth + 1;
      setSelectedMonth(newMonth);
    }
    const maxDays = new Date(newYear, newMonth, 0).getDate();
    if (selectedDay > maxDays) {
      setSelectedDay(maxDays);
    }
    setManualStarName(null);
    setIsHourSectionCollapsed(true);
    setComparisonTarget("next");
    setSelectedCustomTerm(null);
  };

  // Trở về hôm nay
  const handleResetToToday = () => {
    setSelectedYear(currentYear);
    setSelectedMonth(currentMonth);
    setSelectedDay(currentDay);
    setSelectedHourChiIdx(currentHourChiIdx);
    setCustomBirthHour(currentHour);
    setCustomBirthMinute(now.getMinutes());
    setManualStarName(null);
    setIsHourSectionCollapsed(true);
    setSelectedCustomTerm(null);
  };

  // Xác nhận giá trị Năm khi người dùng điền vào (onBlur hoặc Enter)
  const commitYear = (valStr: string) => {
    const val = parseInt(valStr, 10);
    if (!isNaN(val) && val >= 1800 && val <= 2200) {
      setSelectedYear(val);
      const maxDays = new Date(val, selectedMonth, 0).getDate();
      if (selectedDay > maxDays) {
        setSelectedDay(maxDays);
      }
    } else {
      setYearInput(String(selectedYear));
    }
    setManualStarName(null);
    setIsHourSectionCollapsed(true);
  };

  // Xác nhận giá trị Tháng khi người dùng điền vào (onBlur hoặc Enter)
  const commitMonth = (valStr: string) => {
    const val = parseInt(valStr, 10);
    if (!isNaN(val) && val >= 1 && val <= 12) {
      setSelectedMonth(val);
      const maxDays = new Date(selectedYear, val, 0).getDate();
      if (selectedDay > maxDays) {
        setSelectedDay(maxDays);
      }
    } else {
      setMonthInput(String(selectedMonth));
    }
    setManualStarName(null);
    setIsHourSectionCollapsed(true);
  };

  // Xác nhận giá trị Ngày khi người dùng điền vào (onBlur hoặc Enter)
  const commitDay = (valStr: string) => {
    const val = parseInt(valStr, 10);
    const maxDays = new Date(selectedYear, selectedMonth, 0).getDate();
    if (!isNaN(val) && val >= 1) {
      const clamped = Math.min(Math.max(1, val), maxDays);
      setSelectedDay(clamped);
      setDayInput(String(clamped));
    } else {
      setDayInput(String(selectedDay));
    }
    setManualStarName(null);
    setIsHourSectionCollapsed(true);
  };

  // Nút lùi 1 ngày
  const handlePrevDay = () => {
    if (selectedDay > 1) {
      setSelectedDay((prev) => prev - 1);
    } else {
      // Về ngày cuối tháng trước
      if (selectedMonth === 1) {
        setSelectedYear((prev) => prev - 1);
        setSelectedMonth(12);
        setSelectedDay(31);
      } else {
        const prevMonth = selectedMonth - 1;
        const prevMaxDays = new Date(selectedYear, prevMonth, 0).getDate();
        setSelectedMonth(prevMonth);
        setSelectedDay(prevMaxDays);
      }
    }
    setManualStarName(null);
    setIsHourSectionCollapsed(true);
  };

  // Nút tiến 1 ngày
  const handleNextDay = () => {
    if (selectedDay < daysInMonth) {
      setSelectedDay((prev) => prev + 1);
    } else {
      // Sang ngày 1 tháng sau
      if (selectedMonth === 12) {
        setSelectedYear((prev) => prev + 1);
        setSelectedMonth(1);
        setSelectedDay(1);
      } else {
        setSelectedMonth((prev) => prev + 1);
        setSelectedDay(1);
      }
    }
    setManualStarName(null);
    setIsHourSectionCollapsed(true);
  };

  // Thay đổi từ native date picker (hoặc chọn nhanh lịch)
  const handleNativeDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;
    const parts = val.split("-");
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      const d = parseInt(parts[2], 10);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        setSelectedYear(y);
        setSelectedMonth(m);
        setSelectedDay(d);
        setManualStarName(null);
        setIsHourSectionCollapsed(true);
      }
    }
  };

  // Chụp ảnh bảng Dụng Sự & Tâm Ấn Phú
  const handleCaptureBoard = async (isDirectDownload: boolean = false) => {
    if (!captureBoardRef.current) return;
    setIsCapturing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 150));
      const targetEl = captureBoardRef.current;
      const dataUrl = await captureElementToPng(targetEl, {
        backgroundColor: "#120E0A",
        pixelRatio: 2,
      });

      if (!dataUrl || dataUrl.length < 100) {
        throw new Error("Không thể trích xuất ảnh");
      }

      const filename = `LichDungSu_Ngay_${selectedDay}_Thang_${selectedMonth}_Nam_${selectedYear}_TamAnPhu.png`;
      const title = `Lịch Dụng Sự & Bảng Tâm Ấn Phú Ngày ${selectedDay}/${selectedMonth}/${selectedYear} (${selectedDayInfo.canChi.fullName})`;

      setExportedImageUrl(dataUrl);
      setExportModalTitle(title);
      setExportModalFilename(filename);

      if (isDirectDownload) {
        downloadDataUrlAsPng(dataUrl, filename);
        setNoticeMessage("Đã chụp và tải ảnh Bảng Lịch Dụng Sự về máy thành công!");
      } else {
        setIsExportModalOpen(true);
      }
    } catch (err) {
      console.error("Capture error:", err);
      setNoticeMessage("Có lỗi khi xuất ảnh, vui lòng thử lại!");
    } finally {
      setIsCapturing(false);
      setTimeout(() => setNoticeMessage(null), 4000);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Top Banner & Control Bar */}
      <div className="royal-frame px-5 py-8 sm:px-10 sm:py-10">
        <span className="royal-corner tl" />
        <span className="royal-corner tr" />
        <span className="royal-corner bl" />
        <span className="royal-corner br" />

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <span className="royal-seal w-12 h-12 text-xl shrink-0 mt-1">曆</span>
            <div>
              <div className="royal-eyebrow before:hidden">Tam thức khởi thời · 協紀辨方</div>
              <h2 className="royal-title mt-2 text-3xl sm:text-4xl">
                Lịch dụng sự
                <span className="italic text-gold-300"> &amp; Tâm Ấn Phú</span>
              </h2>
              <p className="text-[13px] font-serif text-ivory-500 mt-2">
                Map 1 tháng Lịch Dương, Ngày Can Chi, Trực Nhật Tinh • Tra cứu 12 Giờ Tâm Ấn Phú ứng Địa Chi
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleResetToToday}
              className="royal-btn-ghost !px-3.5 !py-2 !text-[11px]"
              title="Về ngày giờ hiện tại"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Hôm Nay</span>
            </button>

            {/* Nút Chọn Lịch Dương (Native Date Picker nhanh) */}
            <label
              className="royal-btn-ghost !px-3.5 !py-2 !text-[11px] relative"
              title="Chọn nhanh từ hộp thoại Lịch Dương"
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Chọn Lịch</span>
              <input
                type="date"
                value={`${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`}
                onChange={handleNativeDateChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </label>

            <button
              type="button"
              disabled={isCapturing}
              onClick={() => handleCaptureBoard(false)}
              className="royal-btn !px-3.5 !py-2 !text-[11px]"
              title="Chụp toàn bộ bảng lịch và 12 giờ Tâm Ấn Phú"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{isCapturing ? "Đang chụp..." : "Chụp Bảng Dụng Sự"}</span>
            </button>

            <button
              type="button"
              disabled={isCapturing}
              onClick={() => handleCaptureBoard(true)}
              className="royal-btn-ghost !px-3.5 !py-2 !text-[11px]"
              title="Tải ảnh PNG về máy tính"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tải Về Máy</span>
            </button>
          </div>
        </div>

        {/* Bộ chọn Năm, Tháng, Ngày, Giờ (ĐIỀN VÀO TRỰC TIẾP HOẶC TĂNG GIẢM) */}
        <div className="mt-8 pt-6 border-t border-gold-800 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* 1. Bộ điền Năm */}
          <div className="bg-lacquer-900 border border-gold-800 rounded-sm p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-ivory-500 font-mono">NĂM (ĐIỀN VÀO)</span>
              <span className="text-[9px] text-amber-500/80 font-mono">1800-2200</span>
            </div>
            <div className="flex items-center justify-between gap-1 mt-1.5">
              <button
                type="button"
                onClick={() => {
                  setSelectedYear((prev) => {
                    const next = prev - 1;
                    setYearInput(String(next));
                    const maxDays = new Date(next, selectedMonth, 0).getDate();
                    if (selectedDay > maxDays) setSelectedDay(maxDays);
                    return next;
                  });
                  setManualStarName(null);
                  setIsHourSectionCollapsed(true);
                }}
                className="p-1.5 hover:bg-lacquer-700 text-ivory-500 hover:text-amber-200 rounded-sm cursor-pointer transition-colors shrink-0"
                title="Năm trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex-1 flex justify-center">
                <input
                  type="number"
                  min={1800}
                  max={2200}
                  value={yearInput}
                  onChange={(e) => {
                    setYearInput(e.target.value);
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val >= 1800 && val <= 2200) {
                      setSelectedYear(val);
                      const maxDays = new Date(val, selectedMonth, 0).getDate();
                      if (selectedDay > maxDays) setSelectedDay(maxDays);
                      setManualStarName(null);
                      setIsHourSectionCollapsed(true);
                    }
                  }}
                  onBlur={() => commitYear(yearInput)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      commitYear(yearInput);
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                  className="w-full max-w-[105px] text-center bg-lacquer-800 border border-amber-800/60 hover:border-amber-500/80 focus:border-amber-400 rounded-sm py-1 px-1 text-amber-300 font-bold font-serif text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-amber-400/50 shadow-inner"
                  placeholder="Năm"
                  title="Nhấp để điền năm trực tiếp"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedYear((prev) => {
                    const next = prev + 1;
                    setYearInput(String(next));
                    const maxDays = new Date(next, selectedMonth, 0).getDate();
                    if (selectedDay > maxDays) setSelectedDay(maxDays);
                    return next;
                  });
                  setManualStarName(null);
                  setIsHourSectionCollapsed(true);
                }}
                className="p-1.5 hover:bg-lacquer-700 text-ivory-500 hover:text-amber-200 rounded-sm cursor-pointer transition-colors shrink-0"
                title="Năm sau"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 2. Bộ điền Tháng */}
          <div className="bg-lacquer-900 border border-gold-800 rounded-sm p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-ivory-500 font-mono">THÁNG (ĐIỀN VÀO)</span>
              <span className="text-[9px] text-amber-500/80 font-mono">1-12</span>
            </div>
            <div className="flex items-center justify-between gap-1 mt-1.5">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 hover:bg-lacquer-700 text-ivory-500 hover:text-amber-200 rounded-sm cursor-pointer transition-colors shrink-0"
                title="Tháng trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex-1 flex justify-center">
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={monthInput}
                  onChange={(e) => {
                    setMonthInput(e.target.value);
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val >= 1 && val <= 12) {
                      setSelectedMonth(val);
                      const maxDays = new Date(selectedYear, val, 0).getDate();
                      if (selectedDay > maxDays) setSelectedDay(maxDays);
                      setManualStarName(null);
                      setIsHourSectionCollapsed(true);
                    }
                  }}
                  onBlur={() => commitMonth(monthInput)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      commitMonth(monthInput);
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                  className="w-full max-w-[85px] text-center bg-lacquer-800 border border-amber-800/60 hover:border-amber-500/80 focus:border-amber-400 rounded-sm py-1 px-1 text-amber-300 font-bold font-serif text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-amber-400/50 shadow-inner"
                  placeholder="Tháng"
                  title="Nhấp để điền tháng trực tiếp (1-12)"
                />
              </div>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-lacquer-700 text-ivory-500 hover:text-amber-200 rounded-sm cursor-pointer transition-colors shrink-0"
                title="Tháng sau"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 3. Bộ điền Ngày */}
          <div className="bg-lacquer-900 border border-gold-800 rounded-sm p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-ivory-500 font-mono">NGÀY (ĐIỀN VÀO)</span>
              <span className="text-[9px] text-amber-500/80 font-mono">1-{daysInMonth}</span>
            </div>
            <div className="flex items-center justify-between gap-1 mt-1.5">
              <button
                type="button"
                onClick={handlePrevDay}
                className="p-1.5 hover:bg-lacquer-700 text-ivory-500 hover:text-amber-200 rounded-sm cursor-pointer transition-colors shrink-0"
                title="Ngày trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex-1 flex justify-center">
                <input
                  type="number"
                  min={1}
                  max={daysInMonth}
                  value={dayInput}
                  onChange={(e) => {
                    setDayInput(e.target.value);
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val >= 1 && val <= daysInMonth) {
                      setSelectedDay(val);
                      setManualStarName(null);
                      setIsHourSectionCollapsed(true);
                    }
                  }}
                  onBlur={() => commitDay(dayInput)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      commitDay(dayInput);
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                  className="w-full max-w-[85px] text-center bg-lacquer-800 border border-amber-800/60 hover:border-amber-500/80 focus:border-amber-400 rounded-sm py-1 px-1 text-amber-300 font-bold font-serif text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-amber-400/50 shadow-inner"
                  placeholder="Ngày"
                  title={`Nhấp để điền ngày trực tiếp (1-${daysInMonth})`}
                />
              </div>
              <button
                type="button"
                onClick={handleNextDay}
                className="p-1.5 hover:bg-lacquer-700 text-ivory-500 hover:text-amber-200 rounded-sm cursor-pointer transition-colors shrink-0"
                title="Ngày sau"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between text-[10px] text-ivory-500 pt-1 mt-1 border-t border-lacquer-700">
              <span className="text-amber-400 font-serif font-bold truncate max-w-[90px]">{selectedDayInfo.canChi.fullName}</span>
              <span className="font-mono text-amber-300/70">AL: {selectedDayInfo.lunar.day}/{selectedDayInfo.lunar.month}</span>
            </div>
          </div>

          {/* 4. Bộ chọn Giờ (12 Địa Chi) */}
          <div className="bg-lacquer-900 border border-gold-800 rounded-sm p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-ivory-500 font-mono">GIỜ DỤNG SỰ</span>
              <Clock className="w-3.5 h-3.5 text-amber-400 opacity-80" />
            </div>
            <div className="mt-1.5">
              <select
                value={selectedHourChiIdx}
                onChange={(e) => {
                  const idx = parseInt(e.target.value, 10);
                  setSelectedHourChiIdx(idx);
                  if (onSelectHourPillar) {
                    const h = getHourCanChi(selectedDayInfo.canChi.canIdx, idx);
                    onSelectHourPillar(h.can, h.chi);
                  }
                }}
                className="w-full bg-lacquer-800 border border-amber-800/60 hover:border-amber-500/80 rounded-sm py-1 px-2 text-amber-300 font-bold font-serif text-xs sm:text-sm cursor-pointer focus:outline-none focus:border-amber-400"
              >
                {HOUR_BRANCH_RANGES.map((h, idx) => (
                  <option key={h.branch} value={idx} className="bg-lacquer-800 text-amber-200">
                    Giờ {h.branch} ({h.range})
                  </option>
                ))}
              </select>
            </div>
            <div className="text-[10px] text-amber-300/70 font-mono pt-1 mt-1 border-t border-lacquer-700 truncate">
              {HOUR_BRANCH_RANGES[selectedHourChiIdx]?.range}
            </div>
          </div>
        </div>
      </div>

      {noticeMessage && (
        <div className="bg-emerald-950/80 border border-emerald-600/70 text-emerald-200 text-xs px-4 py-2.5 rounded-sm flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{noticeMessage}</span>
        </div>
      )}

      {/* ================= KHU VỰC CHỤP HÌNH TOÀN BỘ (LỊCH + TÂM ẤN PHÚ) ================= */}
      <div ref={captureBoardRef} className="space-y-6 bg-lacquer-950 p-2 sm:p-4 rounded-sm border border-gold-800">
        {/* ================= PHẦN 1: MAP 1 THÁNG (MONTHLY CALENDAR GRID) ================= */}
        <div ref={calendarGridRef} className="border border-gold-800 border-t-gold-600 bg-lacquer-900/85 p-4 sm:p-6">
          {/* Header Tháng */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gold-800 pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rotate-45 bg-gold-500" />
              <h3 className="text-lg sm:text-xl font-display font-semibold text-ivory-100">
                BẢN ĐỒ LỊCH THÁNG {selectedMonth} NĂM {selectedYear}
              </h3>
              <span className="text-[12px] text-gold-300 font-serif px-2 py-0.5 rounded-sm border border-gold-700">
                Tháng {selectedDayInfo.lunar.monthFullName} • Năm {selectedDayInfo.lunar.yearFullName}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-ivory-500">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-amber-500/20 border border-amber-500 inline-block" />
                <span>Ngày chọn</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-gold-500 inline-block" />
                <span>Hôm nay</span>
              </span>
            </div>
          </div>

          {/* Hàng Tiêu Đề 7 Ngày Trong Tuần (T2 -> CN) */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center text-xs font-serif font-bold">
            {["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"].map(
              (name, i) => (
                <div
                  key={name}
                  className={`py-1.5 rounded-sm ${
                    i >= 5
                      ? "text-rose-400 bg-rose-950/20 border border-rose-900/30"
                      : "text-ivory-300 bg-lacquer-800 border border-lacquer-700"
                  }`}
                >
                  <span className="hidden sm:inline">{name}</span>
                  <span className="sm:hidden">{i === 6 ? "CN" : `T${i + 2}`}</span>
                </div>
              )
            )}
          </div>

          {/* Lưới các ngày trong tháng */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {/* Các ô trống trước ngày 1 */}
            {Array.from({ length: firstDayWeekday }).map((_, idx) => (
              <div
                key={`empty-${idx}`}
                className="h-20 sm:h-24 bg-lacquer-900/40 border border-lacquer-700/50 rounded-sm opacity-30 pointer-events-none"
              />
            ))}

            {/* Các ô ngày thực tế */}
            {monthDaysList.map((item) => {
              const isSelected = item.isSelected;
              const isToday = item.isToday;

              return (
                <div
                  key={item.day}
                  onClick={() => {
                    setSelectedDay(item.day);
                    setManualStarName(null);
                    setIsHourSectionCollapsed(true);
                  }}
                  className={`min-h-[86px] sm:min-h-[105px] p-1.5 sm:p-2 rounded-sm border flex flex-col justify-between transition-all cursor-pointer relative group ${
                    isSelected
                      ? "bg-gradient-to-b from-gold-800 to-lacquer-800 border-gold-500 ring-1 ring-amber-400/50 scale-[1.01] z-10"
                      : isToday
                      ? "bg-lacquer-700 border-amber-600/70 hover:border-amber-500 shadow-sm"
                      : "bg-lacquer-900 border-lacquer-700 hover:bg-lacquer-800 hover:border-gold-800"
                  }`}
                >
                  {/* Dòng đỉnh: Ngày Dương + Ngày Âm */}
                  <div className="flex items-start justify-between">
                    <span
                      className={`font-serif font-black text-sm sm:text-base leading-none ${
                        isSelected
                          ? "text-gold-300"
                          : isToday
                          ? "text-amber-300 font-extrabold"
                          : "text-ivory-100"
                      }`}
                    >
                      {item.day}
                    </span>

                    {/* Ngày Âm Lịch */}
                    <span
                      className={`text-[9px] sm:text-[10px] font-mono px-1 py-0.2 rounded ${
                        item.lunar.day === 1 || item.lunar.day === 15
                          ? "bg-rose-950/80 text-rose-300 font-bold border border-rose-800/60"
                          : "text-ivory-500 bg-lacquer-800"
                      }`}
                      title={`Âm lịch: Ngày ${item.lunar.day} tháng ${item.lunar.month}`}
                    >
                      {item.lunar.day === 1
                        ? `1/${item.lunar.month} AL`
                        : `${item.lunar.day} AL`}
                    </span>
                  </div>

                  {/* Can Chi Ngày */}
                  <div className="my-1">
                    <span className="text-[10px] sm:text-[11px] font-serif font-bold text-gold-400 block truncate">
                      {item.canChi.fullName}
                    </span>
                  </div>

                  {/* Trực Nhật Tinh (12 Thiên Tướng Lục Nhâm) */}
                  <div className="space-y-0.5">
                    <div
                      className={`text-[9px] sm:text-[10px] px-1 py-0.5 rounded font-bold border flex items-center justify-between truncate ${item.star.color}`}
                      title={`Trực Nhật Tinh: ${item.star.name} (${item.star.nature}) - ${item.star.desc}`}
                    >
                      <span className="truncate flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-current shrink-0" />
                        <span>{item.star.name}</span>
                      </span>
                      <span className="text-[8px] font-normal opacity-85 hidden sm:inline">
                        {item.star.nature}
                      </span>
                    </div>

                    {/* Trực + Tú phụ trợ */}
                    <div className="text-[8.5px] text-gold-700 hidden sm:flex items-center justify-between font-mono px-0.5">
                      <span>{item.truc.name}</span>
                      <span>{item.tu28.name}</span>
                    </div>
                  </div>

                  {/* Huy hiệu Hôm Nay */}
                  {isToday && (
                    <span className="absolute -top-1.5 -right-1 text-[8px] font-bold px-1.5 py-0.2 rounded-sm bg-amber-500 text-stone-950 shadow">
                      Nay
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= BANNER QUẺ KINH DỊCH CỦA NGÀY (QUẺ NGÀY TƯƠNG HỢP VỚI LỊCH DỤNG SỰ) ================= */}
        <div className="royal-card p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {cardImages[dailyHexData.hexNumber] ? (
                <div className="w-12 h-16 rounded-sm overflow-hidden border border-gold-500 shadow shrink-0">
                  <img
                    src={cardImages[dailyHexData.hexNumber]}
                    alt={dailyHexData.hexagram.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-12 h-14 shrink-0 border border-gold-600 bg-lacquer-950 flex flex-col items-center justify-center">
                  <span className="font-serif text-lg text-gold-400 leading-none">卦</span>
                  <span className="text-[10px] font-mono text-gold-600 leading-none mt-1.5">#{dailyHexData.hexNumber}</span>
                </div>
              )}
              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="w-full text-[10.5px] font-medium uppercase tracking-[0.22em] text-gold-500">
                    Quẻ Kinh Dịch của ngày {selectedDay}/{selectedMonth}/{selectedYear}
                  </span>
                  <span className="font-display text-xl sm:text-2xl text-ivory-100 leading-tight">
                    Quẻ #{dailyHexData.hexNumber}: {dailyHexData.hexagram.name} ({dailyHexData.hexagram.vietnameseName})
                  </span>
                  <span className="text-[12px] font-serif italic text-gold-400 border-l border-gold-700 pl-3">
                    {dailyHexData.advice.headline}
                  </span>
                  <span className="text-[10px] px-2 py-0.2 rounded-sm bg-purple-950 text-purple-200 border border-purple-600 font-mono">
                    Hào {dailyHexData.changingLine} Động
                  </span>
                </div>
                <p className="text-xs text-ivory-300 font-serif line-clamp-2">
                  {dailyHexData.advice.summary}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              {/* Nút xem nhanh lời bình ngay tại đây */}
              <button
                type="button"
                onClick={() => setIsDailyHexExpanded(!isDailyHexExpanded)}
                className="royal-btn-ghost !px-3 !py-1.5 !text-[11px]"
              >
                <span>{isDailyHexExpanded ? "▲ Thu Gọn Lời Bình" : "▼ Chi Tiết Lời Bình"}</span>
              </button>

              {/* Nút mở Modal xem toàn văn Quẻ Ngày & Lịch Dụng Sự */}
              {onOpenDailyHexagram && (
                <button
                  type="button"
                  onClick={onOpenDailyHexagram}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-gradient-to-r from-gold-500 to-gold-600 hover:brightness-110 text-lacquer-900 text-xs font-serif font-bold shadow cursor-pointer transition-all active:scale-95"
                  title="Bấm để mở cửa sổ xem toàn văn lời bình Quẻ Ngày & Lịch Dụng Sự"
                >
                  <span>Mở Cửa Sổ Quẻ Ngày</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* KHỐI NỘI DUNG MỞ RỘNG TOÀN VĂN LỜI BÌNH NGAY TRONG LỊCH DỤNG SỰ */}
          {isDailyHexExpanded && (
            <div className="mt-3 pt-3 border-t border-amber-900/60 space-y-3 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* VIỆC NÊN LÀM */}
                <div className="p-2.5 rounded-sm bg-[#0F2417]/80 border border-emerald-700/60 space-y-1">
                  <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Việc Nên Làm (Theo Quẻ Dịch Khuyên):</span>
                  </div>
                  <ul className="space-y-1 text-xs text-emerald-100/90 font-serif pl-1">
                    {dailyHexData.advice.favorable.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* VIỆC CẦN TRÁNH */}
                <div className="p-2.5 rounded-sm bg-[#261012]/80 border border-rose-700/60 space-y-1">
                  <div className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Việc Cần Tránh (Quẻ Dịch Cảnh Báo):</span>
                  </div>
                  <ul className="space-y-1 text-xs text-rose-100/90 font-serif pl-1">
                    {dailyHexData.advice.unfavorable.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-rose-400 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* LỜI DẶN CỐT LÕI & TÂM THẾ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-serif">
                <div className="p-2.5 rounded-sm bg-lacquer-800 border border-gold-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-amber-400 font-mono">
                    📜 Lời Dặn Cốt Lõi:
                  </span>
                  <p className="text-ivory-100 italic pl-2 border-l-2 border-gold-500">
                    "{dailyHexData.advice.motto}"
                  </p>
                </div>
                <div className="p-2.5 rounded-sm bg-lacquer-800 border border-gold-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-ivory-500 font-mono">
                    🧘 Tâm Thế Cần Giữ:
                  </span>
                  <p className="text-ivory-300">
                    {dailyHexData.advice.mindset}
                  </p>
                </div>
              </div>

              {/* HÀO ĐỘNG */}
              {dailyHexData.changingLineMeaning && (
                <div className="p-2.5 rounded-sm bg-purple-950/40 border border-purple-600/50 text-xs font-serif space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-300">
                      ✨ Hào Động Ngày: {dailyHexData.changingLineMeaning.name}
                    </span>
                    <span className="text-[10px] px-2 py-0.2 rounded-sm bg-purple-900 text-purple-200 border border-purple-500 font-mono">
                      Hào #{dailyHexData.changingLine}
                    </span>
                  </div>
                  <div className="italic text-[#E9DCF5] pl-2 border-l border-purple-400/50">
                    "{dailyHexData.changingLineMeaning.text}"
                  </div>
                  <p className="text-[11px] text-[#CDB9E4]">
                    {dailyHexData.changingLineMeaning.meaning}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ================= PHẦN: THÔNG THƯ HỶ KỴ NGÀY HÔM ĐÓ (CÁT SỰ NÊN LÀM & HUNG SỰ CẤM KỴ) ================= */}
        <div className="border border-gold-800 border-t-gold-600 bg-lacquer-900/85 p-4 sm:p-6 relative">
          {/* Header Thông Thư */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-gold-800 pb-4 mb-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="w-2 h-2 rotate-45 bg-gold-500" />
                <h3 className="text-lg sm:text-2xl font-display font-semibold text-ivory-100 flex items-center gap-2 flex-wrap">
                  <span>THÔNG THƯ NGÀY {selectedDay}/{selectedMonth}/{selectedYear} • HỶ KỴ DỤNG SỰ</span>
                </h3>
                <span className="text-[12px] px-2 py-0.5 rounded-sm text-gold-300 border border-gold-700 font-serif">
                  Ngày {selectedDayInfo.canChi.fullName} • AL: {thongThuData.lunarDate.day}/{thongThuData.lunarDate.month} ({thongThuData.lunarDate.monthFullName})
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-sm font-bold border ${thongThuData.overallAssessment.badgeClass}`}>
                  {thongThuData.overallAssessment.title}
                </span>
              </div>
              <p className="text-xs text-ivory-500 mt-1">
                Trích lục tri thức 《Hiệp Kỷ Biện Phương Thư》 &amp; 《Thông Thư Vạn Sự》 • Luận giải Việc Cát Nên Làm (Hỷ) &amp; Việc Hung Cần Tránh (Kỵ) của ngày đang chọn.
              </p>
            </div>

            {/* Thanh công cụ / Nút thu gọn mở rộng */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Nút lọc Tab */}
              <div className="flex items-center gap-1 bg-lacquer-800 p-1 rounded-sm border border-gold-800 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setThongThuTab("all");
                    setIsThongThuCollapsed(false);
                  }}
                  className={`px-2.5 py-1 text-xs rounded-sm font-serif font-bold cursor-pointer transition-all ${
                    thongThuTab === "all"
                      ? "bg-gradient-to-r from-gold-500 to-gold-600 text-lacquer-900 shadow"
                      : "text-amber-200/80 hover:text-amber-100 hover:bg-lacquer-700"
                  }`}
                >
                  Tất Cả ({thongThuData.hyList.length + thongThuData.kyList.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setThongThuTab("hy");
                    setIsThongThuCollapsed(false);
                  }}
                  className={`px-2.5 py-1 text-xs rounded-sm font-serif font-bold cursor-pointer transition-all flex items-center gap-1 ${
                    thongThuTab === "hy"
                      ? "bg-emerald-700 text-white shadow"
                      : "text-emerald-300/80 hover:text-emerald-200 hover:bg-emerald-950/40"
                  }`}
                >
                  <span>🌿 Việc Hỷ</span>
                  <span className="text-[10px] opacity-80">({thongThuData.hyList.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setThongThuTab("ky");
                    setIsThongThuCollapsed(false);
                  }}
                  className={`px-2.5 py-1 text-xs rounded-sm font-serif font-bold cursor-pointer transition-all flex items-center gap-1 ${
                    thongThuTab === "ky"
                      ? "bg-rose-800 text-white shadow"
                      : "text-rose-300/80 hover:text-rose-200 hover:bg-rose-950/40"
                  }`}
                >
                  <span>🚫 Việc Kỵ</span>
                  <span className="text-[10px] opacity-80">({thongThuData.kyList.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setThongThuTab("sao");
                    setIsThongThuCollapsed(false);
                  }}
                  className={`px-2.5 py-1 text-xs rounded-sm font-serif font-bold cursor-pointer transition-all flex items-center gap-1 ${
                    thongThuTab === "sao"
                      ? "bg-amber-600 text-lacquer-900 shadow font-bold"
                      : "text-amber-300/80 hover:text-amber-200 hover:bg-amber-950/40"
                  }`}
                >
                  <span>⭐ Cát / Hung Thần</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setThongThuTab("xuatHanh");
                    setIsThongThuCollapsed(false);
                  }}
                  className={`px-2.5 py-1 text-xs rounded-sm font-serif font-bold cursor-pointer transition-all flex items-center gap-1 ${
                    thongThuTab === "xuatHanh"
                      ? "bg-gold-700 text-amber-100 shadow"
                      : "text-amber-200/80 hover:text-amber-100 hover:bg-lacquer-700"
                  }`}
                >
                  <span>🧭 Xuất Hành &amp; Giờ</span>
                </button>
              </div>

              {/* Nút Thu Gọn / Mở Rộng */}
              <button
                type="button"
                onClick={() => setIsThongThuCollapsed(!isThongThuCollapsed)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-lacquer-800 hover:bg-lacquer-700 text-amber-300 border border-amber-600/60 text-xs font-bold transition-all cursor-pointer shadow active:scale-95 shrink-0"
                title={isThongThuCollapsed ? "Mở rộng bảng Thông Thư Hỷ Kỵ" : "Thu gọn bảng Thông Thư"}
              >
                {isThongThuCollapsed ? (
                  <>
                    <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
                    <span>Mở Thông Thư</span>
                  </>
                ) : (
                  <>
                    <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
                    <span>Thu Gọn</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Dòng Thẻ Tóm Tắt Nhanh Các Yếu Tố Lịch Số Của Ngày */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-4 text-xs">
            <div className="bg-lacquer-800 border border-gold-800 rounded-sm p-2.5">
              <span className="text-[10px] text-ivory-500 block font-mono">DƯƠNG LỊCH</span>
              <span className="text-amber-300 font-bold font-serif text-sm">
                {selectedDay}/{selectedMonth}/{selectedYear}
              </span>
            </div>
            <div className="bg-lacquer-800 border border-gold-800 rounded-sm p-2.5">
              <span className="text-[10px] text-ivory-500 block font-mono">ÂM LỊCH</span>
              <span className="text-amber-300 font-bold font-serif text-sm">
                {thongThuData.lunarDate.day}/{thongThuData.lunarDate.month} ({thongThuData.lunarDate.yearFullName})
              </span>
            </div>
            <div className="bg-lacquer-800 border border-gold-800 rounded-sm p-2.5">
              <span className="text-[10px] text-ivory-500 block font-mono">NẠP ÂM NGŨ HÀNH</span>
              <span className="text-amber-200 font-bold font-serif text-xs truncate block" title={thongThuData.napAm.desc}>
                {thongThuData.napAm.napAm}
              </span>
              <span className="text-[10px] text-amber-500/80">({thongThuData.napAm.element})</span>
            </div>
            <div className="bg-lacquer-800 border border-gold-800 rounded-sm p-2.5">
              <span className="text-[10px] text-ivory-500 block font-mono">12 TRỰC</span>
              <span className="text-amber-300 font-bold font-serif text-sm">
                Trực {thongThuData.truc.name}
              </span>
              <span className="text-[10px] text-ivory-500 block truncate">({thongThuData.truc.nature})</span>
            </div>
            <div className="bg-lacquer-800 border border-gold-800 rounded-sm p-2.5">
              <span className="text-[10px] text-ivory-500 block font-mono">NHỊ THẬP BÁT TÚ</span>
              <span className="text-amber-300 font-bold font-serif text-sm">
                Sao {thongThuData.tu28.name}
              </span>
              <span className="text-[10px] text-ivory-500 block truncate">({thongThuData.tu28.animal})</span>
            </div>
            <div className="bg-lacquer-800 border border-gold-800 rounded-sm p-2.5">
              <span className="text-[10px] text-ivory-500 block font-mono">TRỰC NHẬT TINH</span>
              <span className="text-amber-300 font-bold font-serif text-sm truncate block">
                {thongThuData.trucNhatTinh.name}
              </span>
              <span className="text-[10px] text-amber-400/80 block">
                {thongThuData.trucNhatTinh.nature} ({thongThuData.trucNhatTinh.mappedGeneral})
              </span>
            </div>
          </div>

          {/* Banner Luận Giải Tổng Thể & Khẩu Quyết Thông Thư */}
          <div className="bg-gradient-to-r from-lacquer-800 via-lacquer-700 to-lacquer-800 border border-gold-800 rounded-sm p-3.5 mb-4 shadow-inner flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-amber-400 font-serif">ĐÁNH GIÁ TỔNG QUAN:</span>
                <span className={`text-xs font-serif font-black px-2 py-0.5 rounded border ${thongThuData.overallAssessment.badgeClass}`}>
                  {thongThuData.overallAssessment.title}
                </span>
                <span className="text-xs text-amber-200/90 font-serif">
                  — {thongThuData.overallAssessment.verdict}
                </span>
              </div>
              <p className="text-xs text-ivory-300 italic font-serif leading-relaxed">
                « {thongThuData.overallAssessment.poemOrQuote} »
              </p>
            </div>
          </div>

          {/* Cảnh Báo Hung Sát Trọng Đại (Tam Nương, Nguyệt Kỵ, Nguyệt Phá, Sát Chủ, Thọ Tử) */}
          {thongThuData.specialTaboos.activeWarnings.length > 0 && (
            <div className="bg-rose-950/40 border border-rose-700/60 rounded-sm p-3 mb-4 text-xs text-rose-200 space-y-1.5 shadow">
              <div className="flex items-center gap-2 text-rose-300 font-serif font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>CẢNH BÁO HUNG SÁT ĐẶC BIỆT TRONG THÁNG CỦA NGÀY NÀY:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 pl-1 text-rose-200/90">
                {thongThuData.specialTaboos.activeWarnings.map((warn, wIdx) => (
                  <li key={wIdx} className="leading-relaxed">
                    <strong className="text-rose-300">{warn}</strong>
                  </li>
                ))}
              </ul>
              <p className="text-[11px] text-rose-300/80 italic pt-1 border-t border-rose-900/50">
                * Cổ nhân dạy: Phàm ngày phạm hung sát trọng đại, việc lớn (cưới gả, khởi công, khai trương, xuất hành) nên hoãn hoặc chọn ngày cát khác. Nếu tình thế bất khả kháng thì bắt buộc phải chọn đúng Giờ Hoàng Đạo và phương vị cát tường để hóa giải.
              </p>
            </div>
          )}

          {/* Nội dung chi tiết Hỷ Kỵ (Thu gọn / Mở rộng) */}
          {!isThongThuCollapsed && (
            <div className="space-y-4">
              {/* PHẦN 1: HAI CỘT VIỆC HỶ (NÊN LÀM) & VIỆC KỴ (CẦN TRÁNH) */}
              {(thongThuTab === "all" || thongThuTab === "hy" || thongThuTab === "ky") && (
                <div className={`grid gap-4 ${thongThuTab === "all" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
                  {/* CỘT VIỆC HỶ (CÁT SỰ • NÊN LÀM) */}
                  {(thongThuTab === "all" || thongThuTab === "hy") && (
                    <div className="bg-[#121912] border border-emerald-800/60 rounded-sm p-3.5 sm:p-4 shadow-xl flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between border-b border-emerald-900/60 pb-2.5 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                            <h4 className="text-sm sm:text-base font-serif font-bold text-emerald-200 flex items-center gap-1.5">
                              <span>VIỆC HỶ (CÁT SỰ • NÊN LÀM)</span>
                            </h4>
                          </div>
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded-sm bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-bold">
                            {thongThuData.hyList.length} Việc Lành
                          </span>
                        </div>

                        {thongThuData.hyList.length === 0 ? (
                          <div className="py-6 text-center text-xs text-stone-400 italic">
                            Ngày này nhiều hung sát chiếu mệnh, Thông Thư không ghi nhận việc hỷ sự nào đặc biệt thuận lợi. Nên an tĩnh giữ mình.
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            {thongThuData.hyList.map((item) => (
                              <div
                                key={item.id}
                                className="bg-[#182318] hover:bg-[#1E2C1E] border border-emerald-800/40 hover:border-emerald-600/70 rounded-sm p-2.5 sm:p-3 transition-colors shadow-sm"
                              >
                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                  <div className="flex items-center gap-2">
                                    <span className="text-base">{item.iconTag}</span>
                                    <span className="text-xs font-serif font-bold text-emerald-300">
                                      {item.category}
                                    </span>
                                  </div>
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-sm border ${
                                      item.level === "Đại Cát"
                                        ? "bg-amber-950 text-amber-300 border-amber-600"
                                        : item.level === "Cát"
                                        ? "bg-emerald-950 text-emerald-300 border-emerald-600"
                                        : "bg-stone-900 text-stone-300 border-stone-700"
                                    }`}
                                  >
                                    {item.level}
                                  </span>
                                </div>
                                <p className="text-xs font-serif font-semibold text-emerald-100 leading-snug">
                                  {item.action}
                                </p>
                                <p className="text-[11px] text-emerald-300/80 mt-1 pl-2 border-l-2 border-emerald-600/60 font-serif italic leading-relaxed">
                                  Căn cứ cát tường: {item.reason}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-emerald-950 text-[11px] text-emerald-400/80 font-serif italic text-right">
                        * Khởi sự việc lành vào đúng giờ Hoàng Đạo để tăng gấp bội cát khí.
                      </div>
                    </div>
                  )}

                  {/* CỘT VIỆC KỴ (HUNG SỰ • CẦN TRÁNH) */}
                  {(thongThuTab === "all" || thongThuTab === "ky") && (
                    <div className="bg-[#1C1214] border border-rose-800/60 rounded-sm p-3.5 sm:p-4 shadow-xl flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between border-b border-rose-900/60 pb-2.5 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                            <h4 className="text-sm sm:text-base font-serif font-bold text-rose-200 flex items-center gap-1.5">
                              <span>VIỆC KỴ (HUNG SỰ • CẦN TRÁNH)</span>
                            </h4>
                          </div>
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded-sm bg-rose-950 text-rose-300 border border-rose-700/60 font-bold">
                            {thongThuData.kyList.length} Việc Kiêng Cữ
                          </span>
                        </div>

                        {thongThuData.kyList.length === 0 ? (
                          <div className="py-6 text-center text-xs text-stone-400 italic">
                            Ngày đại cát thuần hòa, không có hung sát đặc biệt cấm kỵ. Tuy nhiên vẫn nên giữ lòng cẩn trọng.
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            {thongThuData.kyList.map((item) => (
                              <div
                                key={item.id}
                                className="bg-[#24171A] hover:bg-[#2B1B1F] border border-rose-800/40 hover:border-rose-600/70 rounded-sm p-2.5 sm:p-3 transition-colors shadow-sm"
                              >
                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                  <div className="flex items-center gap-2">
                                    <span className="text-base">{item.iconTag}</span>
                                    <span className="text-xs font-serif font-bold text-rose-300">
                                      {item.category}
                                    </span>
                                  </div>
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-sm border ${
                                      item.level === "Đại Hung"
                                        ? "bg-rose-950 text-rose-200 border-rose-500 animate-pulse"
                                        : item.level === "Hung"
                                        ? "bg-rose-950/80 text-rose-300 border-rose-700"
                                        : "bg-stone-900 text-stone-300 border-stone-700"
                                    }`}
                                  >
                                    {item.level}
                                  </span>
                                </div>
                                <p className="text-xs font-serif font-semibold text-rose-100 leading-snug">
                                  {item.action}
                                </p>
                                <p className="text-[11px] text-rose-300/80 mt-1 pl-2 border-l-2 border-rose-600/60 font-serif italic leading-relaxed">
                                  Căn cứ hung sát: {item.reason}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-rose-950 text-[11px] text-rose-400/80 font-serif italic text-right">
                        * Kiêng kỵ những việc trên để tránh tiêu hao tài lộc, hình thương và thị phi.
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* PHẦN 2: BẢNG CÁT THẦN & HUNG THẦN LÂM CHIẾU */}
              {(thongThuTab === "all" || thongThuTab === "sao") && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
                  {/* Bảng Sao Tốt (Cát Thần) */}
                  <div className="bg-lacquer-900 border border-amber-800/40 rounded-sm p-3.5 shadow-md">
                    <div className="flex items-center gap-2 border-b border-gold-800 pb-2 mb-3">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <h4 className="text-sm font-serif font-bold text-amber-200">
                        CÁT THẦN HỘI TỤ (SAO TỐT LÂM CHIẾU)
                      </h4>
                      <span className="text-[10px] font-mono px-2 py-0.2 rounded-sm bg-amber-950 text-amber-300 border border-amber-700/60">
                        {thongThuData.catThanList.length} Sao
                      </span>
                    </div>

                    <div className="space-y-2">
                      {thongThuData.catThanList.map((star, idx) => (
                        <div
                          key={idx}
                          className="bg-lacquer-800 border border-gold-800 rounded-sm p-2.5 flex items-start justify-between gap-2"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-serif font-bold text-amber-300">
                                {star.name}
                              </span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-700/60 font-mono">
                                {star.quality}
                              </span>
                            </div>
                            <p className="text-[11px] text-ivory-300 mt-0.5 leading-snug">
                              {star.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bảng Sao Xấu (Hung Thần) */}
                  <div className="bg-lacquer-900 border border-stone-800/60 rounded-sm p-3.5 shadow-md">
                    <div className="flex items-center gap-2 border-b border-gold-800 pb-2 mb-3">
                      <Shield className="w-4 h-4 text-rose-400" />
                      <h4 className="text-sm font-serif font-bold text-rose-300">
                        HUNG THẦN CHIẾU PHƯƠNG (SAO XẤU CẦN ĐỀ PHÒNG)
                      </h4>
                      <span className="text-[10px] font-mono px-2 py-0.2 rounded-sm bg-rose-950 text-rose-300 border border-rose-700/60">
                        {thongThuData.hungThanList.length} Sát
                      </span>
                    </div>

                    <div className="space-y-2">
                      {thongThuData.hungThanList.map((star, idx) => (
                        <div
                          key={idx}
                          className="bg-[#201516] border border-rose-950 rounded-sm p-2.5 flex items-start justify-between gap-2"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-serif font-bold text-rose-300">
                                {star.name}
                              </span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800 font-mono">
                                {star.quality}
                              </span>
                            </div>
                            <p className="text-[11px] text-rose-200/80 mt-0.5 leading-snug">
                              {star.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* PHẦN 3: PHƯƠNG VỊ XUẤT HÀNH (HỶ THẦN & TÀI THẦN), 12 GIỜ HOÀNG ĐẠO & TUỔI XUNG KHẮC */}
              {(thongThuTab === "all" || thongThuTab === "xuatHanh") && (
                <div className="space-y-3.5 pt-2">
                  {/* Grid 3 Card Hướng Xuất Hành & Tuổi Xung */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Hướng Hỷ Thần */}
                    <div className="bg-lacquer-800 border border-amber-800/50 rounded-sm p-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-amber-400 font-serif font-bold flex items-center gap-1.5">
                            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                            <span>HƯỚNG HỶ THẦN</span>
                          </span>
                          <span className="text-[10px] font-mono text-amber-300/80 bg-lacquer-800 px-1.5 py-0.5 rounded border border-gold-800">
                            {thongThuData.xuatHanh.hyThan.palace}
                          </span>
                        </div>
                        <div className="text-base font-serif font-black text-gold-300">
                          Hướng {thongThuData.xuatHanh.hyThan.direction}
                        </div>
                        <p className="text-[11px] text-ivory-300 mt-1 leading-relaxed">
                          {thongThuData.xuatHanh.hyThan.desc}. Xuất hành theo hướng này đem lại hỷ khí, hôn nhân hòa thuận, vạn sự thuận lòng.
                        </p>
                      </div>
                    </div>

                    {/* Hướng Tài Thần */}
                    <div className="bg-lacquer-800 border border-amber-800/50 rounded-sm p-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-amber-400 font-serif font-bold flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span>HƯỚNG TÀI THẦN</span>
                          </span>
                          <span className="text-[10px] font-mono text-amber-300/80 bg-lacquer-800 px-1.5 py-0.5 rounded border border-gold-800">
                            {thongThuData.xuatHanh.taiThan.palace}
                          </span>
                        </div>
                        <div className="text-base font-serif font-black text-gold-300">
                          Hướng {thongThuData.xuatHanh.taiThan.direction}
                        </div>
                        <p className="text-[11px] text-ivory-300 mt-1 leading-relaxed">
                          {thongThuData.xuatHanh.taiThan.desc}. Lên đường kinh doanh, đàm phán hợp đồng, cầu tài lộc nên nghênh hướng này.
                        </p>
                      </div>
                    </div>

                    {/* Hướng Hạc Thần (Xấu) & Tuổi Xung Khắc */}
                    <div className="bg-lacquer-800 border border-gold-800 rounded-sm p-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-rose-400 font-serif font-bold flex items-center gap-1.5">
                            <Compass className="w-3.5 h-3.5 text-rose-400" />
                            <span>HƯỚNG HẠC THẦN (KỴ)</span>
                          </span>
                          <span className="text-[10px] font-mono text-rose-300 bg-rose-950 px-1.5 py-0.5 rounded border border-rose-800">
                            Tránh Đi Thẳng
                          </span>
                        </div>
                        <div className="text-base font-serif font-bold text-rose-200">
                          Hướng {thongThuData.xuatHanh.hacThanDirection}
                        </div>
                        <p className="text-[11px] text-ivory-500 mt-1 leading-relaxed">
                          Hạc thần ngự tại hướng {thongThuData.xuatHanh.hacThanDirection}. Khởi hành đầu tiên chớ đi thẳng về hướng này để tránh gặp trắc trở.
                        </p>
                      </div>

                      <div className="mt-2 pt-2 border-t border-lacquer-700 text-[11px]">
                        <span className="text-amber-400 font-serif font-bold">Tuổi xung với ngày: </span>
                        <span className="text-rose-300 font-semibold">{thongThuData.tuoiXung.examples.join(", ")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bảng 12 Giờ Hoàng Đạo & Hắc Đạo Trong Ngày */}
                  <div className="bg-lacquer-800 border border-gold-800 rounded-sm p-3 sm:p-4 shadow-md">
                    <div className="flex items-center justify-between border-b border-gold-800 pb-2 mb-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <h4 className="text-sm font-serif font-bold text-amber-200">
                          BẢNG 12 GIỜ HOÀNG ĐẠO &amp; HẮC ĐẠO TRONG NGÀY
                        </h4>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1 text-amber-300">
                          <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block" />
                          <span>Hoàng Đạo (Cát)</span>
                        </span>
                        <span className="flex items-center gap-1 text-ivory-500">
                          <span className="w-2.5 h-2.5 rounded bg-lacquer-700 border border-gold-800 inline-block" />
                          <span>Hắc Đạo</span>
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
                      {thongThuData.gioHoangDao.map((h) => (
                        <div
                          key={h.branchIdx}
                          onClick={() => {
                            setSelectedHourChiIdx(h.branchIdx);
                            if (onSelectHourPillar) {
                              const canChiHour = getHourCanChi(selectedDayInfo.canChi.canIdx, h.branchIdx);
                              onSelectHourPillar(canChiHour.can, canChiHour.chi);
                            }
                          }}
                          className={`p-2 rounded-sm border transition-all cursor-pointer ${
                            h.isHoangDao
                              ? "bg-gradient-to-b from-lacquer-700 to-lacquer-800 border-amber-600/70 hover:border-amber-400 shadow-sm hover:scale-[1.02]"
                              : "bg-lacquer-900 border-lacquer-700 text-ivory-500 hover:bg-lacquer-800"
                          } ${selectedHourChiIdx === h.branchIdx ? "ring-2 ring-amber-400" : ""}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`font-serif font-bold text-sm ${h.isHoangDao ? "text-amber-300" : "text-ivory-500"}`}>
                              Giờ {h.branchName}
                            </span>
                            {h.isHoangDao && (
                              <span className="text-[10px] font-bold text-amber-400 bg-amber-950/80 px-1 py-0.2 rounded border border-amber-700/60">
                                ⭐ Cát
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-mono text-ivory-500 block mt-0.5">
                            {h.range}
                          </span>
                          <span className={`text-[10px] font-serif block mt-1 truncate ${h.isHoangDao ? "text-amber-200/90 font-medium" : "text-gold-700"}`}>
                            {h.starName.split(" ")[0]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ================= PHẦN 2: BẢNG 12 ĐỊA CHI ỨNG 12 GIỜ SO VỚI TRỰC NHẬT TINH RA TÊN TÂM ẤN PHÚ ================= */}
        <div className="border border-gold-800 border-t-gold-600 bg-lacquer-900/85 p-4 sm:p-6 relative">
          {/* Header Phần Tâm Ấn Phú */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-gold-800 pb-4 mb-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="w-2 h-2 rotate-45 bg-gold-500" />
                <h3 className="text-lg sm:text-2xl font-display font-semibold text-ivory-100 flex items-center gap-2 flex-wrap">
                  <span>BẢNG 12 ĐỊA CHI ỨNG 12 GIỜ • TÂM ẤN PHÚ</span>
                </h3>
                <span className="text-[12px] px-2 py-0.5 rounded-sm text-gold-300 border border-gold-700 font-serif">
                  Ngày {selectedDayInfo.day}/{selectedMonth}/{selectedYear} ({selectedDayInfo.canChi.fullName})
                </span>
              </div>
              <p className="text-xs text-ivory-500 mt-1">
                Chiếu 12 Giờ Địa Chi so với Trực Nhật Tinh 《<strong>{selectedDayInfo.activeStar.name}</strong>》 (ngầm hiểu: <em>{TRUC_NHAT_TINH_TO_THIEN_TUONG_MAP[selectedDayInfo.activeStar.name] || selectedDayInfo.activeStar.name}</em>) ra tên tượng thần, khẩu quyết và ý nghĩa cát hung theo thiên cổ 《Lục Nhâm Thần Khóa • Tâm Ấn Phú》.
              </p>
            </div>

            {/* Selector Nhanh 12 Trực Nhật Tinh (Hoàng Đạo / Hắc Đạo) & Nút Thu Gọn */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 bg-lacquer-800 p-1.5 rounded-sm border border-gold-800 flex-wrap">
                <span className="text-[11px] text-ivory-500 font-serif font-bold px-1.5">
                  Trực Nhật Tinh:
                </span>
                <div className="flex items-center gap-1 flex-wrap">
                  {manualStarName && (
                    <button
                      type="button"
                      onClick={() => setManualStarName(null)}
                      className="px-2 py-1 text-[11px] rounded-sm font-mono text-amber-400 bg-lacquer-700 hover:bg-gold-800 border border-amber-600/50 cursor-pointer transition-all"
                      title="Trở về Trực Nhật Tinh tự động theo ngày và tháng"
                    >
                      ↺ Theo Ngày ({selectedDayInfo.defaultStar.name})
                    </button>
                  )}
                  {TRUC_NHAT_TINH_12_LIST.map((star) => {
                    const isActive = selectedDayInfo.activeStar.name === star.name;
                    return (
                      <button
                        key={star.name}
                        type="button"
                        onClick={() => setManualStarName(star.name)}
                        className={`px-2 py-1 text-xs rounded-sm font-serif font-bold cursor-pointer transition-all ${
                          isActive
                            ? "bg-gradient-to-r from-gold-500 to-gold-600 text-lacquer-900 shadow-md scale-105"
                            : star.nature === "Hoàng Đạo"
                            ? "text-amber-200/90 hover:text-gold-200 hover:bg-lacquer-700"
                            : "text-rose-300/80 hover:text-gold-200 hover:bg-[#2C1814]"
                        }`}
                        title={`${star.name} (${star.nature} • ${star.quality}) - ${star.desc}`}
                      >
                        {star.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Nút Thu Gọn / Mở Rộng Bảng 12 Giờ */}
              <button
                type="button"
                onClick={() => setIsHourSectionCollapsed(!isHourSectionCollapsed)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-sm bg-lacquer-700 hover:bg-gold-800 text-amber-300 border border-amber-600/70 text-xs font-bold transition-all cursor-pointer shadow hover:border-amber-400 active:scale-95 shrink-0"
                title={isHourSectionCollapsed ? "Mở rộng xem toàn bộ 12 giờ Địa Chi" : "Thu gọn bảng 12 giờ Địa Chi"}
              >
                {isHourSectionCollapsed ? (
                  <>
                    <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
                    <span>Mở Rộng Bảng 12 Giờ</span>
                  </>
                ) : (
                  <>
                    <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
                    <span>Thu Gọn Bảng 12 Giờ</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Banner Thông Tin Trực Nhật Tinh Đang Chiếu */}
          <div className="bg-lacquer-800 border border-amber-800/40 rounded-sm p-3 mb-4 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-gold-800 to-lacquer-800 border border-amber-600/70 flex items-center justify-center text-amber-300 font-serif font-bold text-base shadow-inner">
                {selectedDayInfo.activeStar.name.slice(0, 1)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-serif font-bold text-amber-200">
                    Trực Nhật Tinh: {selectedDayInfo.activeStar.name} ({selectedDayInfo.activeStar.chinese})
                  </h4>
                  <span className={`text-[10px] font-bold px-2 py-0.2 rounded border ${selectedDayInfo.activeStar.color}`}>
                    {selectedDayInfo.activeStar.nature}
                  </span>
                  <span className="text-[10px] font-mono text-amber-400/80 bg-lacquer-900 px-1.5 py-0.2 rounded border border-gold-800">
                    Hành {selectedDayInfo.activeStar.element}
                  </span>
                </div>
                <p className="text-xs text-ivory-300 mt-0.5">
                  {selectedDayInfo.activeStar.desc}
                </p>
              </div>
            </div>

            <div className="text-right text-xs text-ivory-500 font-mono">
              <div>Tháng Tiết Khí: <strong className="text-amber-300 font-serif">Tháng {selectedDayInfo.monthBranch}</strong> • Âm Lịch: {selectedDayInfo.lunar.day}/{selectedDayInfo.lunar.month}</div>
              <div className="text-amber-300/80">Trực: {selectedDayInfo.truc.name} • Sao: {selectedDayInfo.tu28.name}</div>
            </div>
          </div>

          {/* ================= NỘI DUNG PHẦN 2: THU GỌN HOẶC MỞ RỘNG BẢNG 12 GIỜ ================= */}
          {isHourSectionCollapsed ? (
            /* Chế độ Thu Gọn: Hiển thị thanh tóm lược tinh gọn & bộ chuyển 12 giờ nhanh */
            <div className="bg-lacquer-900 border border-amber-700/50 rounded-md p-3.5 sm:p-4 space-y-3.5 shadow-lg">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-sm bg-gradient-to-br from-gold-500 to-gold-700 p-0.5 flex items-center justify-center shrink-0 shadow-md">
                    <div className="w-full h-full bg-lacquer-900 rounded-[10px] flex items-center justify-center font-serif font-black text-amber-300 text-base">
                      {selectedHourData.branch}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-serif font-bold text-base text-ivory-100">
                        Giờ {selectedHourData.branch} ({selectedHourData.hourCanChi})
                      </h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-lacquer-700 text-amber-300 border border-amber-800/60">
                        {selectedHourData.hourRange}
                      </span>
                      {selectedHourData.entry && (
                        <span className="text-xs font-serif font-bold text-amber-300 bg-lacquer-700 px-2.5 py-0.5 rounded-sm border border-amber-600/70">
                          Tượng: 《{selectedHourData.entry.tuongName}》 ({selectedHourData.entry.tuongChinese})
                        </span>
                      )}
                    </div>
                    {selectedHourData.entry && (
                      <p className="text-xs font-serif italic text-amber-100/90 mt-1">
                        📜 {selectedHourData.entry.fullLine}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                  {selectedHourData.entry && selectedHourData.general && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedEntryDetail({
                          branch: selectedHourData.branch,
                          hourCanChi: selectedHourData.hourCanChi,
                          hourRange: selectedHourData.hourRange,
                          entry: selectedHourData.entry!,
                          general: selectedHourData.general!,
                        });
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-lacquer-700 hover:bg-gold-800 text-amber-300 border border-gold-800 text-xs font-semibold cursor-pointer transition-colors shadow-sm"
                    >
                      <Info className="w-3.5 h-3.5 text-amber-400" />
                      <span>Xem Diễn Giải</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsHourSectionCollapsed(false)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-sm bg-gradient-to-r from-gold-500 to-gold-600 text-lacquer-900 font-bold text-xs cursor-pointer shadow hover:brightness-110 active:scale-95"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                    <span>Mở Rộng 12 Giờ</span>
                  </button>
                </div>
              </div>

              {/* Thanh 12 nút chuyển nhanh Giờ Địa Chi */}
              <div className="pt-2 border-t border-lacquer-700 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                <span className="text-[11px] text-ivory-500 font-serif font-bold shrink-0 pr-1">
                  Chọn giờ nhanh:
                </span>
                {tamAnPhuHourTable.map((h) => {
                  const isActive = h.index === selectedHourChiIdx;
                  return (
                    <button
                      key={h.branch}
                      type="button"
                      onClick={() => {
                        setSelectedHourChiIdx(h.index);
                        if (onSelectHourPillar) {
                          onSelectHourPillar(h.hourCan, h.hourChi);
                        }
                      }}
                      className={`px-2.5 py-1 text-xs rounded-sm font-serif font-bold transition-all shrink-0 cursor-pointer ${
                        isActive
                          ? "bg-gradient-to-r from-gold-500 to-gold-600 text-stone-950 shadow scale-105"
                          : "bg-lacquer-800 text-ivory-500 hover:text-amber-200 hover:bg-lacquer-700 border border-gold-800"
                      }`}
                      title={`${h.branch} (${h.hourCanChi} • ${h.hourRange})`}
                    >
                      {h.branch}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Chế độ Mở Rộng: Grid 12 Giờ Địa Chi Ứng Tâm Ấn Phú */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {tamAnPhuHourTable.map((item) => {
                const isSelectedHour = item.isSelectedHour;
                const entry = item.entry;

                return (
                  <div
                    key={item.branch}
                    onClick={() => {
                      setSelectedHourChiIdx(item.index);
                      if (entry && item.general) {
                        setSelectedEntryDetail({
                          branch: item.branch,
                          hourCanChi: item.hourCanChi,
                          hourRange: item.hourRange,
                          entry,
                          general: item.general,
                        });
                      }
                    }}
                    className={`p-3.5 rounded-sm border transition-all cursor-pointer relative group flex flex-col justify-between ${
                      isSelectedHour
                        ? "bg-gradient-to-br from-lacquer-700 to-lacquer-800 border-gold-500 ring-1 ring-amber-400/60"
                        : "bg-lacquer-800 border-lacquer-700 hover:bg-lacquer-800 hover:border-gold-800"
                    }`}
                  >
                    {/* Dòng Tiêu Đề: Giờ Địa Chi + Khung Giờ + Can Chi Giờ */}
                    <div>
                      <div className="flex items-center justify-between border-b border-gold-800 pb-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-sm bg-lacquer-700 border border-gold-800 flex items-center justify-center font-serif font-bold text-amber-300 text-xs">
                            {item.branch}
                          </div>
                          <div>
                            <span className="font-serif font-bold text-sm text-ivory-100 block leading-none">
                              Giờ {item.branch}
                            </span>
                            <span className="text-[10px] text-amber-400 font-mono font-semibold">
                              {item.hourCanChi}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] font-mono text-ivory-500 bg-lacquer-900 px-2 py-0.5 rounded border border-lacquer-700 block">
                            {item.hourRange}
                          </span>
                          <span className="text-[9px] text-gold-700 italic block mt-0.5">
                            {item.hourDesc.split("•")[0]}
                          </span>
                        </div>
                      </div>

                      {/* TÊN TÂM ẤN PHÚ (Điểm Nhấn Trọng Tâm) */}
                      <div className="bg-lacquer-900 border border-amber-900/50 rounded-sm p-2.5 mb-2">
                        <div className="flex items-center justify-between gap-1 flex-wrap">
                          <div className="text-[10px] text-ivory-500 font-mono flex items-center gap-1">
                            <span>Tượng Thần Tâm Ấn:</span>
                          </div>
                          {entry && (
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-serif font-black text-amber-300">
                                《{entry.tuongName}》
                              </span>
                              <span className="text-[11px] font-serif text-amber-400/80">
                                ({entry.tuongChinese})
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Khẩu quyết nguyên văn */}
                        {entry && (
                          <div className="text-[11px] font-serif italic text-amber-100/90 mt-1 bg-lacquer-800 p-1.5 rounded border border-gold-800">
                            📜 {entry.fullLine}
                          </div>
                        )}
                      </div>

                      {/* Diễn giải ý nghĩa Tâm Ấn Phú */}
                      {entry && (
                        <p className="text-[11.5px] text-ivory-300 leading-relaxed line-clamp-3">
                          {entry.meaning}
                        </p>
                      )}
                    </div>

                    {/* Dưới cùng: Nút Xem Chi Tiết */}
                    <div className="mt-3 pt-2 border-t border-lacquer-700 flex items-center justify-between text-[10px]">
                      <span className="text-ivory-500">
                        {selectedDayInfo.activeStar.name}
                        {item.general && item.general.mappedGeneralName !== item.general.name && (
                          <span className="text-amber-400/80"> ({item.general.mappedGeneralName})</span>
                        )}
                        {" "}lâm {item.branch}
                      </span>
                      <span className="text-amber-400 group-hover:text-amber-300 font-medium flex items-center gap-0.5">
                        <span>Xem chi tiết</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    </div>

                    {isSelectedHour && (
                      <div className="absolute top-2 right-2">
                        <span className="w-2 h-2 rotate-45 bg-gold-500 animate-ping inline-block" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ================= PHẦN 3: BẢNG BÁT TỰ NGÀY • NGUYỆT TƯỚNG • THỜI GIAN ĐỔI TIẾT KHÍ (3 THÁNG) ================= */}
        <div className="space-y-6">
          {/* ----- MỤC 1: BÁT TỰ TỨ TRỤ NGÀY HÔM ĐÓ ----- */}
          <div className="border border-gold-800 border-t-gold-600 bg-lacquer-900/85 p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gold-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rotate-45 bg-gold-500" />
                <div>
                  <h3 className="text-lg sm:text-xl font-display font-semibold text-ivory-100 flex items-center gap-2 flex-wrap">
                    <span>BÁT TỰ TỨ TRỤ NGÀY {selectedDay}/{selectedMonth}/{selectedYear}</span>
                    <span className="text-[11px] font-serif px-2 py-0.5 rounded-sm text-gold-300 border border-gold-700">
                      Giờ {selectedHourData.branch}
                    </span>
                  </h3>
                  <p className="text-xs text-ivory-500 mt-0.5">
                    Tứ Trụ Can Chi, Nạp Âm Ngũ Hành, Thiên Ất Quý Nhân và Tuần Không của ngày được chọn
                  </p>
                </div>
              </div>

              {/* Badge Tổng Quan */}
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="px-2.5 py-1 rounded-sm bg-lacquer-800 text-amber-300 border border-gold-800">
                  Quý Nhân: {baziInfo.nobles.truQuy} (Trú) • {baziInfo.nobles.daQuy} (Dạ)
                </span>
                <span className="px-2.5 py-1 rounded-sm bg-lacquer-800 text-rose-300 border border-rose-900/40">
                  Tuần Không: {baziInfo.emptyBranches[0]}, {baziInfo.emptyBranches[1]}
                </span>
              </div>
            </div>

            {/* 4 Cột Tứ Trụ (Giờ • Ngày • Tháng • Năm) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Trụ Giờ */}
              <div className="bg-lacquer-800 border border-gold-800 hover:border-amber-600/60 rounded-sm p-3.5 space-y-2 transition-all">
                <div className="flex items-center justify-between border-b border-gold-800 pb-1.5">
                  <span className="text-[11px] font-mono font-bold text-ivory-500">THỜI TRỤ (GIỜ)</span>
                  <span className="text-[10px] text-amber-400/80 font-mono">{selectedHourData.hourRange}</span>
                </div>
                <div className="text-center py-1">
                  <span className="text-lg sm:text-xl font-serif font-black text-ivory-100 block leading-tight">
                    {baziInfo.hourPillar.fullName}
                  </span>
                  <span className="text-xs font-serif text-amber-400 font-bold block mt-0.5">
                    {baziInfo.hourPillar.chineseCan} {baziInfo.hourPillar.chineseChi}
                  </span>
                </div>
                <div className="bg-lacquer-900 p-2 rounded-sm border border-lacquer-700 text-[11px] space-y-0.5">
                  <div className="flex items-center justify-between font-serif">
                    <span className="text-ivory-500">Nạp Âm:</span>
                    <span className="font-bold text-amber-300">{baziInfo.hourPillar.napAm}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-ivory-500">
                    <span>Ngũ Hành:</span>
                    <span className="text-amber-400">Hành {baziInfo.hourPillar.element}</span>
                  </div>
                  <p className="text-[10px] text-ivory-500 italic pt-1 border-t border-lacquer-700 line-clamp-1">
                    {baziInfo.hourPillar.napAmDesc}
                  </p>
                </div>
              </div>

              {/* Trụ Ngày (Nhật Chủ) */}
              <div className="bg-gradient-to-b from-lacquer-700 to-lacquer-800 border border-amber-600/70 rounded-sm p-3.5 space-y-2 transition-all relative">
                <span className="absolute top-2 right-2 text-[8px] font-bold px-1.5 py-0.2 rounded bg-amber-500 text-stone-950">
                  Nhật Chủ
                </span>
                <div className="flex items-center justify-between border-b border-gold-800 pb-1.5">
                  <span className="text-[11px] font-mono font-bold text-amber-300">NHẬT TRỤ (NGÀY)</span>
                </div>
                <div className="text-center py-1">
                  <span className="text-lg sm:text-xl font-serif font-black text-gold-300 block leading-tight">
                    {baziInfo.dayPillar.fullName}
                  </span>
                  <span className="text-xs font-serif text-amber-300 font-bold block mt-0.5">
                    {baziInfo.dayPillar.chineseCan} {baziInfo.dayPillar.chineseChi}
                  </span>
                </div>
                <div className="bg-lacquer-900 p-2 rounded-sm border border-amber-900/60 text-[11px] space-y-0.5">
                  <div className="flex items-center justify-between font-serif">
                    <span className="text-ivory-500">Nạp Âm:</span>
                    <span className="font-bold text-amber-300">{baziInfo.dayPillar.napAm}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-ivory-500">
                    <span>Ngũ Hành:</span>
                    <span className="text-amber-400">Hành {baziInfo.dayPillar.element}</span>
                  </div>
                  <p className="text-[10px] text-ivory-500 italic pt-1 border-t border-lacquer-700 line-clamp-1">
                    {baziInfo.dayPillar.napAmDesc}
                  </p>
                </div>
              </div>

              {/* Trụ Tháng */}
              <div className="bg-lacquer-800 border border-gold-800 hover:border-amber-600/60 rounded-sm p-3.5 space-y-2 transition-all">
                <div className="flex items-center justify-between border-b border-gold-800 pb-1.5">
                  <span className="text-[11px] font-mono font-bold text-ivory-500">NGUYỆT TRỤ (THÁNG)</span>
                  <span className="text-[10px] text-amber-400/80 font-mono">Tiết {baziInfo.activeSolarTerm.name}</span>
                </div>
                <div className="text-center py-1">
                  <span className="text-lg sm:text-xl font-serif font-black text-ivory-100 block leading-tight">
                    {baziInfo.monthPillar.fullName}
                  </span>
                  <span className="text-xs font-serif text-amber-400 font-bold block mt-0.5">
                    {baziInfo.monthPillar.chineseCan} {baziInfo.monthPillar.chineseChi}
                  </span>
                </div>
                <div className="bg-lacquer-900 p-2 rounded-sm border border-lacquer-700 text-[11px] space-y-0.5">
                  <div className="flex items-center justify-between font-serif">
                    <span className="text-ivory-500">Nạp Âm:</span>
                    <span className="font-bold text-amber-300">{baziInfo.monthPillar.napAm}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-ivory-500">
                    <span>Ngũ Hành:</span>
                    <span className="text-amber-400">Hành {baziInfo.monthPillar.element}</span>
                  </div>
                  <p className="text-[10px] text-ivory-500 italic pt-1 border-t border-lacquer-700 line-clamp-1">
                    {baziInfo.monthPillar.napAmDesc}
                  </p>
                </div>
              </div>

              {/* Trụ Năm */}
              <div className="bg-lacquer-800 border border-gold-800 hover:border-amber-600/60 rounded-sm p-3.5 space-y-2 transition-all">
                <div className="flex items-center justify-between border-b border-gold-800 pb-1.5">
                  <span className="text-[11px] font-mono font-bold text-ivory-500">NIÊN TRỤ (NĂM)</span>
                  <span className="text-[10px] text-amber-400/80 font-mono">Năm {selectedYear}</span>
                </div>
                <div className="text-center py-1">
                  <span className="text-lg sm:text-xl font-serif font-black text-ivory-100 block leading-tight">
                    {baziInfo.yearPillar.fullName}
                  </span>
                  <span className="text-xs font-serif text-amber-400 font-bold block mt-0.5">
                    {baziInfo.yearPillar.chineseCan} {baziInfo.yearPillar.chineseChi}
                  </span>
                </div>
                <div className="bg-lacquer-900 p-2 rounded-sm border border-lacquer-700 text-[11px] space-y-0.5">
                  <div className="flex items-center justify-between font-serif">
                    <span className="text-ivory-500">Nạp Âm:</span>
                    <span className="font-bold text-amber-300">{baziInfo.yearPillar.napAm}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-ivory-500">
                    <span>Ngũ Hành:</span>
                    <span className="text-amber-400">Hành {baziInfo.yearPillar.element}</span>
                  </div>
                  <p className="text-[10px] text-ivory-500 italic pt-1 border-t border-lacquer-700 line-clamp-1">
                    {baziInfo.yearPillar.napAmDesc}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ----- MỤC 2: NGUYỆT TƯỚNG (THÁI DƯƠNG CUNG VỊ LỤC NHÂM) ----- */}
          <div className="bg-lacquer-900 border border-gold-800 rounded-md p-4 sm:p-5 shadow-2xl relative overflow-hidden">

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 relative z-10">
              <div className="flex items-start gap-3.5">
                <div className="w-14 h-14 rounded-md bg-gradient-to-br from-gold-500 to-gold-700 p-0.5 shadow-xl flex items-center justify-center shrink-0">
                  <div className="w-full h-full bg-lacquer-900 rounded-[14px] flex flex-col items-center justify-center text-amber-300">
                    <Sun className="w-5 h-5 text-amber-400 animate-spin-slow" />
                    <span className="text-[10px] font-serif font-black">{nguyetTuongInfo.branch}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm bg-amber-950 text-amber-300 border border-amber-700/60 uppercase">
                      Thái Dương Cung Vị Lục Nhâm
                    </span>
                    <h3 className="text-lg sm:text-xl font-display font-semibold text-ivory-100">
                      NGUYỆT TƯỚNG: <span className="text-amber-300">《{nguyetTuongInfo.name}》</span> ({nguyetTuongInfo.chinese})
                    </h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${nguyetTuongInfo.color}`}>
                      Cung {nguyetTuongInfo.branch} • Hành {nguyetTuongInfo.element}
                    </span>
                  </div>

                  <p className="text-xs text-ivory-300 font-serif leading-relaxed">
                    {nguyetTuongInfo.meaning}
                  </p>

                  <div className="text-[11px] text-ivory-500 font-mono flex items-center gap-3 pt-1 flex-wrap">
                    <span>Quản trị: <strong className="text-amber-300/90">{nguyetTuongInfo.solarTerm}</strong></span>
                    <span>Kinh độ Mặt Trời thực: <strong className="text-amber-400">{nguyetTuongInfo.sunLongitude.toFixed(2)}°</strong></span>
                  </div>
                </div>
              </div>

              {/* Hướng Dẫn Ứng Dụng Trong Bấm Độn */}
              <div className="bg-lacquer-900 border border-gold-800 rounded-sm p-3 text-xs text-ivory-500 max-w-sm shrink-0 space-y-1">
                <span className="text-amber-400 font-serif font-bold block flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Ứng Dụng Đại Lục Nhâm:</span>
                </span>
                <p className="text-[11px] leading-relaxed">
                  Nguyệt Tướng là linh hồn của Lục Nhâm Đại Độn. Lấy Nguyệt Tướng <strong className="text-amber-200">[{nguyetTuongInfo.branch}]</strong> gia lâm lên Giờ chiêm <strong className="text-amber-200">[{selectedHourData.branch}]</strong> để an Thiên Bàn, khởi Thập Nhị Thiên Tướng, tìm Tứ Khóa và phát Tam Truyền định đoán cát hung.
                </p>
              </div>
            </div>
          </div>

          {/* ----- MỤC 3: THỜI GIAN ĐỔI TIẾT KHÍ (3 THÁNG: THÁNG TRƯỚC • THÁNG HIỆN TẠI • THÁNG SAU) ----- */}
          <div className="border border-gold-800 border-t-gold-600 bg-lacquer-900/85 p-4 sm:p-6 space-y-4">
            {/* Header Tiết Khí 3 Tháng */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gold-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rotate-45 bg-gold-500" />
                <div>
                  <h3 className="text-lg sm:text-xl font-display font-semibold text-ivory-100">
                    THỜI GIAN CHUYỂN ĐỔI TIẾT KHÍ (3 THÁNG LIÊN TIẾP)
                  </h3>
                  <p className="text-xs text-ivory-500 mt-0.5">
                    Thời điểm chính xác theo phút (UTC+7) chuyển đổi Chính Tiết (tháng Bát Tự) và Trung Khí (đổi Nguyệt Tướng)
                  </p>
                </div>
              </div>

              <div className="text-xs text-amber-300/80 font-mono bg-lacquer-800 px-3 py-1 rounded-sm border border-gold-800">
                Tiết Khí hiện tại: <strong>{baziInfo.activeSolarTerm.name}</strong>
              </div>
            </div>

            {/* 3 Cột Tiết Khí (Tháng Trước - Tháng Này - Tháng Sau) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* CỘT 1: THÁNG TRƯỚC */}
              <div className={`bg-lacquer-900 border rounded-sm p-3.5 space-y-3 transition-all ${
                comparisonTarget === "prev" ? "border-amber-600/80 shadow-md ring-1 ring-amber-500/40" : "border-lacquer-700"
              }`}>
                <div className="flex items-center justify-between border-b border-gold-800 pb-2">
                  <span className="text-xs font-serif font-bold text-ivory-500">
                    THÁNG TRƯỚC: {threeMonthsSolarTerms.prevMonth.month}/{threeMonthsSolarTerms.prevMonth.year}
                  </span>
                  <span className="text-[10px] font-mono text-[#7A6C5B]">Tháng {threeMonthsSolarTerms.prevMonth.month}</span>
                </div>

                <div className="space-y-2.5">
                  {threeMonthsSolarTerms.prevMonth.terms.map((t) => {
                    const isTargetTerm = activeComparisonDetail.term.record.name === t.record.name;
                    return (
                      <div
                        key={t.record.name}
                        onClick={() => {
                          setSelectedCustomTerm(t);
                          setComparisonTarget("prev");
                        }}
                        className={`p-2.5 rounded-sm border space-y-1 cursor-pointer transition-all ${
                          isTargetTerm
                            ? "bg-lacquer-700 border-amber-500/90 shadow ring-1 ring-amber-400/50"
                            : "bg-lacquer-900 border-lacquer-700 hover:border-amber-800/60 hover:bg-lacquer-800"
                        }`}
                        title="Nhấn để chọn tiết này làm mốc tính Tuổi Vào Vận"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-serif font-bold text-sm text-ivory-100 flex items-center gap-1.5">
                            <span>{t.record.name} ({t.record.chinese})</span>
                            {isTargetTerm && (
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                            )}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                            t.record.isMajor ? "bg-amber-950/80 text-amber-300 border border-amber-800/60" : "bg-sky-950/80 text-sky-300 border border-sky-800/60"
                          }`}>
                            {t.record.isMajor ? "Chính Tiết" : "Trung Khí"}
                          </span>
                        </div>
                        <div className="text-xs font-mono text-amber-400 font-semibold">
                          ⏱ {t.time.timeString} ngày {t.time.day}/{t.time.month}/{t.time.year}
                        </div>
                        <p className="text-[10px] text-ivory-500 leading-tight">
                          {t.record.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Nút hành động tính tuổi vào vận theo tháng trước */}
                <button
                  type="button"
                  onClick={() => {
                    setComparisonTarget("prev");
                    const major =
                      threeMonthsSolarTerms.prevMonth.terms.find((t) => t.record.isMajor) ||
                      threeMonthsSolarTerms.prevMonth.terms[0];
                    setSelectedCustomTerm(major);
                  }}
                  className={`w-full py-2 px-2.5 rounded-sm text-xs font-serif font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border shadow-sm ${
                    comparisonTarget === "prev"
                      ? "bg-gradient-to-r from-gold-500 to-gold-600 text-lacquer-900 border-amber-400 shadow-md font-extrabold"
                      : "bg-lacquer-800 hover:bg-lacquer-700 text-amber-300 border-amber-800/60"
                  }`}
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Trừ Tiết Tháng Trước (Khởi Vận)</span>
                </button>
              </div>

              {/* CỘT 2: THÁNG HIỆN TẠI (HIGHLIGHT VÀNG HOÀNG KIM) */}
              <div className="bg-gradient-to-b from-lacquer-700 to-lacquer-900 border-2 border-amber-500/80 rounded-sm p-3.5 space-y-3 relative">
                <div className="flex items-center justify-between border-b border-amber-700/50 pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rotate-45 bg-gold-500 animate-pulse" />
                    <span className="text-xs font-serif font-black text-amber-300">
                      THÁNG ĐANG CHỌN: {selectedMonth}/{selectedYear}
                    </span>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-sm bg-amber-500 text-stone-950 shadow">
                    Hiện Tại
                  </span>
                </div>

                <div className="space-y-2.5">
                  {threeMonthsSolarTerms.currentMonth.terms.map((t) => {
                    const isTermPassed = selectedDay >= t.time.day;
                    const isTargetTerm = activeComparisonDetail.term.record.name === t.record.name;
                    return (
                      <div
                        key={t.record.name}
                        onClick={() => setSelectedCustomTerm(t)}
                        className={`p-2.5 rounded-sm border space-y-1 transition-all cursor-pointer ${
                          isTargetTerm
                            ? "bg-lacquer-700 border-amber-400 shadow ring-1 ring-amber-300/60"
                            : isTermPassed
                            ? "bg-lacquer-700 border-amber-500/70 shadow-sm hover:border-amber-400"
                            : "bg-lacquer-900 border-gold-800 hover:border-amber-700/60"
                        }`}
                        title="Nhấn để chọn tiết này làm mốc so sánh"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-serif font-bold text-sm text-gold-300 flex items-center gap-1.5">
                            <span>{t.record.name} ({t.record.chinese})</span>
                            {isTargetTerm && (
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                            )}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                            t.record.isMajor ? "bg-amber-950 text-amber-300 border border-amber-700/70" : "bg-sky-950 text-sky-300 border border-sky-700/70"
                          }`}>
                            {t.record.isMajor ? "Chính Tiết (Đổi Tháng)" : "Trung Khí (Đổi Tướng)"}
                          </span>
                        </div>
                        <div className="text-xs font-mono text-amber-300 font-bold">
                          ⏱ {t.time.timeString} ngày {t.time.day}/{t.time.month}/{t.time.year}
                        </div>
                        <p className="text-[10px] text-ivory-300 leading-tight">
                          {t.record.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Thông báo phân đoạn ngày đang chọn */}
                <div className="bg-lacquer-900 p-2 rounded-sm border border-amber-800/40 text-[10.5px] text-amber-200/90 font-serif leading-snug">
                  📌 Ngày <strong>{selectedDay}/{selectedMonth}</strong> đang trực tiếp chịu ảnh hưởng của Tiết <strong>{baziInfo.activeSolarTerm.name}</strong> • Nguyệt Tướng <strong>{nguyetTuongInfo.name} ({nguyetTuongInfo.branch})</strong>.
                </div>
              </div>

              {/* CỘT 3: THÁNG SAU */}
              <div className={`bg-lacquer-900 border rounded-sm p-3.5 space-y-3 transition-all ${
                comparisonTarget === "next" ? "border-amber-600/80 shadow-md ring-1 ring-amber-500/40" : "border-lacquer-700"
              }`}>
                <div className="flex items-center justify-between border-b border-gold-800 pb-2">
                  <span className="text-xs font-serif font-bold text-ivory-500">
                    THÁNG SAU: {threeMonthsSolarTerms.nextMonth.month}/{threeMonthsSolarTerms.nextMonth.year}
                  </span>
                  <span className="text-[10px] font-mono text-[#7A6C5B]">Tháng {threeMonthsSolarTerms.nextMonth.month}</span>
                </div>

                <div className="space-y-2.5">
                  {threeMonthsSolarTerms.nextMonth.terms.map((t) => {
                    const isTargetTerm = activeComparisonDetail.term.record.name === t.record.name;
                    return (
                      <div
                        key={t.record.name}
                        onClick={() => {
                          setSelectedCustomTerm(t);
                          setComparisonTarget("next");
                        }}
                        className={`p-2.5 rounded-sm border space-y-1 cursor-pointer transition-all ${
                          isTargetTerm
                            ? "bg-lacquer-700 border-amber-500/90 shadow ring-1 ring-amber-400/50"
                            : "bg-lacquer-900 border-lacquer-700 hover:border-amber-800/60 hover:bg-lacquer-800"
                        }`}
                        title="Nhấn để chọn tiết này làm mốc tính Tuổi Vào Vận"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-serif font-bold text-sm text-ivory-100 flex items-center gap-1.5">
                            <span>{t.record.name} ({t.record.chinese})</span>
                            {isTargetTerm && (
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                            )}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                            t.record.isMajor ? "bg-amber-950/80 text-amber-300 border border-amber-800/60" : "bg-sky-950/80 text-sky-300 border border-sky-800/60"
                          }`}>
                            {t.record.isMajor ? "Chính Tiết" : "Trung Khí"}
                          </span>
                        </div>
                        <div className="text-xs font-mono text-amber-400 font-semibold">
                          ⏱ {t.time.timeString} ngày {t.time.day}/{t.time.month}/{t.time.year}
                        </div>
                        <p className="text-[10px] text-ivory-500 leading-tight">
                          {t.record.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Nút hành động tính tuổi vào vận theo tháng sau */}
                <button
                  type="button"
                  onClick={() => {
                    setComparisonTarget("next");
                    const major =
                      threeMonthsSolarTerms.nextMonth.terms.find((t) => t.record.isMajor) ||
                      threeMonthsSolarTerms.nextMonth.terms[0];
                    setSelectedCustomTerm(major);
                  }}
                  className={`w-full py-2 px-2.5 rounded-sm text-xs font-serif font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border shadow-sm ${
                    comparisonTarget === "next"
                      ? "bg-gradient-to-r from-gold-500 to-gold-600 text-lacquer-900 border-amber-400 shadow-md font-extrabold"
                      : "bg-lacquer-800 hover:bg-lacquer-700 text-amber-300 border-amber-800/60"
                  }`}
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Trừ Tiết Tháng Sau (Khởi Vận)</span>
                </button>
              </div>
            </div>

            {/* ================= KHUNG TÍNH TOÁN TUỔI VÀO VẬN (BÙ TRỪ GIỜ PHÚT CHI TIẾT) ================= */}
            <div className="bg-lacquer-900 border-2 border-amber-600/70 rounded-md p-4 sm:p-5 shadow-2xl space-y-4">
              {/* Header Khung Tính Tuổi Vào Vận */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gold-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-sm bg-gradient-to-br from-gold-500 to-gold-700 p-0.5 flex items-center justify-center text-stone-950 shadow">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-serif font-bold text-amber-200 flex items-center gap-2 flex-wrap">
                      <span>TÍNH TUỔI VÀO VẬN (BÙ TRỪ GIỜ PHÚT THIÊN VĂN)</span>
                      <span className="text-[10px] font-mono px-2 py-0.2 rounded-sm bg-lacquer-700 text-amber-300 border border-amber-700/60 font-normal">
                        Tử Bình Bát Tự
                      </span>
                    </h4>
                    <p className="text-xs text-ivory-500 mt-0.5">
                      Lấy thời điểm sinh bù trừ giờ phút đối chiếu Tiết Khí trước hoặc sau: <strong>3 ngày = 1 tuổi</strong>, <strong>1 ngày = 4 tháng</strong>, <strong>1 giờ = 5 ngày</strong>, <strong>12 phút = 1 ngày</strong>.
                    </p>
                  </div>
                </div>

                {/* Chọn Chiều So Sánh */}
                <div className="flex items-center gap-1.5 bg-lacquer-800 p-1 rounded-sm border border-gold-800 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setComparisonTarget("prev");
                      const major =
                        threeMonthsSolarTerms.prevMonth.terms.find((t) => t.record.isMajor) ||
                        threeMonthsSolarTerms.prevMonth.terms[0];
                      setSelectedCustomTerm(major);
                    }}
                    className={`px-3 py-1.5 rounded-sm text-xs font-serif font-bold cursor-pointer transition-all ${
                      comparisonTarget === "prev"
                        ? "bg-amber-500 text-stone-950 shadow"
                        : "text-ivory-500 hover:text-amber-200 hover:bg-lacquer-700"
                    }`}
                  >
                    ⏪ Tiết Tháng Trước
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setComparisonTarget("next");
                      const major =
                        threeMonthsSolarTerms.nextMonth.terms.find((t) => t.record.isMajor) ||
                        threeMonthsSolarTerms.nextMonth.terms[0];
                      setSelectedCustomTerm(major);
                    }}
                    className={`px-3 py-1.5 rounded-sm text-xs font-serif font-bold cursor-pointer transition-all ${
                      comparisonTarget === "next"
                        ? "bg-amber-500 text-stone-950 shadow"
                        : "text-ivory-500 hover:text-amber-200 hover:bg-lacquer-700"
                    }`}
                  >
                    ⏩ Tiết Tháng Sau
                  </button>
                </div>
              </div>

              {/* Hàng Điều Khiển: Bù trừ giờ, phút và Giới tính */}
              <div className="bg-lacquer-800 border border-gold-800 rounded-sm p-3.5 grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-center">
                {/* 1. Bộ bù trừ Giờ */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-ivory-500 font-mono flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>BÙ TRỪ GIỜ SINH:</span>
                    </span>
                    <span className="font-serif font-bold text-amber-300">
                      {customBirthHour.toString().padStart(2, "0")} Giờ
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCustomBirthHour((prev) => (prev > 0 ? prev - 1 : 23))}
                      className="w-8 h-8 rounded-sm bg-lacquer-700 hover:bg-gold-800 text-amber-300 border border-gold-800 font-bold text-sm cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={0}
                      max={23}
                      value={customBirthHour}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val) && val >= 0 && val <= 23) {
                          setCustomBirthHour(val);
                        }
                      }}
                      className="w-full text-center bg-lacquer-900 border border-gold-800 rounded-sm py-1 text-amber-200 font-mono font-bold text-sm focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={() => setCustomBirthHour((prev) => (prev < 23 ? prev + 1 : 0))}
                      className="w-8 h-8 rounded-sm bg-lacquer-700 hover:bg-gold-800 text-amber-300 border border-gold-800 font-bold text-sm cursor-pointer"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomBirthHour(12)}
                      className="px-2 py-1 text-[10px] rounded bg-lacquer-800 text-ivory-500 hover:text-amber-200 border border-gold-800 shrink-0"
                      title="Gán giờ ngọ 12h"
                    >
                      12h
                    </button>
                  </div>
                </div>

                {/* 2. Bộ bù trừ Phút */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-ivory-500 font-mono flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>BÙ TRỪ PHÚT SINH:</span>
                    </span>
                    <span className="font-serif font-bold text-amber-300">
                      {customBirthMinute.toString().padStart(2, "0")} Phút
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCustomBirthMinute((prev) => (prev >= 5 ? prev - 5 : (prev > 0 ? 0 : 55)))}
                      className="w-8 h-8 rounded-sm bg-lacquer-700 hover:bg-gold-800 text-amber-300 border border-gold-800 font-bold text-sm cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={0}
                      max={59}
                      value={customBirthMinute}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val) && val >= 0 && val <= 59) {
                          setCustomBirthMinute(val);
                        }
                      }}
                      className="w-full text-center bg-lacquer-900 border border-gold-800 rounded-sm py-1 text-amber-200 font-mono font-bold text-sm focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={() => setCustomBirthMinute((prev) => (prev <= 54 ? prev + 5 : 0))}
                      className="w-8 h-8 rounded-sm bg-lacquer-700 hover:bg-gold-800 text-amber-300 border border-gold-800 font-bold text-sm cursor-pointer"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomBirthMinute(0)}
                      className="px-2 py-1 text-[10px] rounded bg-lacquer-800 text-ivory-500 hover:text-amber-200 border border-gold-800 shrink-0"
                      title="Gán 00 phút"
                    >
                      :00
                    </button>
                  </div>
                </div>

                {/* 3. Giới tính & Hướng dẫn chiều khởi vận */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-ivory-500 font-mono">GIỚI TÍNH KHỞI VẬN:</span>
                    <span className="text-[10px] text-amber-400 font-mono">
                      {tuoiVaoVanData.isYearYang ? "Năm Dương" : "Năm Âm"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setGender("male")}
                      className={`flex-1 py-1.5 rounded-sm text-xs font-serif font-bold cursor-pointer transition-all border ${
                        gender === "male"
                          ? "bg-amber-500 text-stone-950 border-amber-400 shadow font-extrabold"
                          : "bg-lacquer-900 text-ivory-500 border-gold-800 hover:text-gold-200"
                      }`}
                    >
                      ♂ Nam ({tuoiVaoVanData.isYearYang ? "Thuận" : "Nghịch"})
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender("female")}
                      className={`flex-1 py-1.5 rounded-sm text-xs font-serif font-bold cursor-pointer transition-all border ${
                        gender === "female"
                          ? "bg-amber-500 text-stone-950 border-amber-400 shadow font-extrabold"
                          : "bg-lacquer-900 text-ivory-500 border-gold-800 hover:text-gold-200"
                      }`}
                    >
                      ♀ Nữ ({tuoiVaoVanData.isYearYang ? "Nghịch" : "Thuận"})
                    </button>
                  </div>
                </div>
              </div>

              {/* Bảng Chi Tiết Đối Chiếu và Kết Quả Quy Đổi Khởi Vận */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
                {/* Cột Trái (7 phần): Chi tiết 2 mốc thời gian & hiệu số */}
                <div className="lg:col-span-7 bg-lacquer-900 border border-gold-800 rounded-sm p-3.5 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between border-b border-gold-800 pb-1.5">
                    <span className="text-amber-400 font-mono font-bold">CHI TIẾT PHÉP TRỪ THIÊN VĂN</span>
                    <span className="text-[10px] text-ivory-500 font-mono">
                      Chiều: {activeComparisonDetail.isForward ? "Thuận hành (Tiết sau - Sinh)" : "Nghịch hành (Sinh - Tiết trước)"}
                    </span>
                  </div>

                  {/* 2 Mốc thời gian */}
                  <div className="space-y-1.5 font-mono text-[11px]">
                    <div className="flex items-center justify-between bg-lacquer-950 p-2 rounded-sm border border-lacquer-700">
                      <span className="text-ivory-500">① Thời điểm sinh / hiện tại:</span>
                      <strong className="text-amber-200">
                        {customBirthHour.toString().padStart(2, "0")}:{customBirthMinute.toString().padStart(2, "0")} ngày {selectedDay}/{selectedMonth}/{selectedYear}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between bg-lacquer-950 p-2 rounded-sm border border-lacquer-700">
                      <span className="text-ivory-500">② Tiết Khí đối chiếu ({activeComparisonDetail.term.record.name}):</span>
                      <strong className="text-amber-300">
                        {activeComparisonDetail.term.time.timeString} ngày {activeComparisonDetail.term.time.day}/{activeComparisonDetail.term.time.month}/{activeComparisonDetail.term.time.year}
                      </strong>
                    </div>
                  </div>

                  {/* Hiệu số chênh lệch */}
                  <div className="bg-lacquer-800 p-2.5 rounded-sm border border-amber-700/60 flex items-center justify-between text-xs">
                    <span className="text-amber-300 font-serif font-bold">
                      Hiệu số chênh lệch (Δ):
                    </span>
                    <span className="font-mono font-black text-amber-200 text-sm">
                      {activeComparisonDetail.diffDays} ngày {activeComparisonDetail.diffHours} giờ {activeComparisonDetail.diffMinutes} phút
                    </span>
                  </div>

                  {/* Chú thích cách quy đổi */}
                  <div className="text-[10.5px] text-ivory-500 font-serif leading-relaxed pt-1 border-t border-lacquer-700">
                    • <strong>{Math.floor(activeComparisonDetail.diffDays / 3) * 3} ngày</strong> quy đổi thành: <strong>{activeComparisonDetail.years} tuổi</strong> (3 ngày = 1 tuổi).<br />
                    • Dư <strong>{activeComparisonDetail.diffDays % 3} ngày</strong> quy đổi thành: <strong>{activeComparisonDetail.months} tháng</strong> (1 ngày = 4 tháng).<br />
                    • Bù trừ <strong>{activeComparisonDetail.diffHours} giờ {activeComparisonDetail.diffMinutes} phút</strong> quy đổi thành: <strong>{activeComparisonDetail.days} ngày</strong> (1 giờ = 5 ngày, 12 phút = 1 ngày).
                  </div>
                </div>

                {/* Cột Phải (5 phần): HỘP KẾT QUẢ KHỞI VẬN LỘNG LẪY */}
                <div className="lg:col-span-5 bg-gradient-to-br from-lacquer-700 via-lacquer-800 to-lacquer-900 border-2 border-gold-500 rounded-sm p-4 flex flex-col justify-between relative overflow-hidden">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-lacquer-900 px-2 py-0.5 rounded border border-amber-800/60">
                        KẾT QUẢ KHỞI ĐẠI VẬN
                      </span>
                      <span className="text-[10px] font-mono text-amber-300/80">
                        ~{activeComparisonDetail.totalApproxYears} Tuổi
                      </span>
                    </div>

                    <div className="py-2 text-center">
                      <span className="text-xs text-ivory-300 block font-serif">Tuổi Vào Vận Bát Tự:</span>
                      <span className="text-xl sm:text-2xl font-serif font-black text-gold-300 block mt-1 tracking-wide text-shadow">
                        {activeComparisonDetail.summary}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-amber-700/50 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-amber-200 font-serif">
                      <span>Bắt đầu Đại Vận 1 vào năm:</span>
                      <strong className="text-amber-400 font-mono text-sm">
                        Năm {selectedYear + activeComparisonDetail.years}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-ivory-500 font-mono">
                      <span>Dự kiến thời điểm:</span>
                      <span>
                        Tháng {(selectedMonth + activeComparisonDetail.months - 1) % 12 + 1}/{selectedYear + activeComparisonDetail.years + Math.floor((selectedMonth + activeComparisonDetail.months - 1) / 12)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chú giải quy luật chuyển tiết thiên văn */}
            <div className="pt-2 border-t border-lacquer-700 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10.5px] text-ivory-500 font-serif">
              <div className="flex items-start gap-1.5">
                <span className="text-amber-400 font-bold">1. Chính Tiết:</span>
                <span>Là thời điểm kinh độ mặt trời bội số 15° lẻ (Lập Xuân, Kinh Trập, Thanh Minh...), khởi đầu tháng Can Chi trong Tử Bình Bát Tự.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-sky-400 font-bold">2. Trung Khí:</span>
                <span>Là thời điểm mặt trời nhập sâu vào trung tâm cung Hoàng Đạo (Vũ Thủy, Xuân Phân, Cốc Vũ...), là căn cứ duy nhất để chuyển đổi Nguyệt Tướng Lục Nhâm.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODAL CHI TIẾT TÂM ẤN PHÚ KHI NHẤP VÀO GIỜ ================= */}
      {selectedEntryDetail && (
        <div
          onClick={() => setSelectedEntryDetail(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-lacquer-900 border border-gold-800 rounded-md p-5 shadow-2xl space-y-4 text-ivory-100 relative"
          >
            {/* Header Modal */}
            <div className="flex items-start justify-between border-b border-gold-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-sm bg-gradient-to-br from-gold-500 to-gold-700 p-0.5 flex items-center justify-center shadow-lg">
                  <div className="w-full h-full bg-lacquer-900 rounded-[10px] flex items-center justify-center text-amber-300 font-serif font-black text-lg">
                    {selectedEntryDetail.branch}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-display font-semibold text-amber-200">
                    Giờ {selectedEntryDetail.branch} ({selectedEntryDetail.hourCanChi})
                  </h3>
                  <p className="text-xs text-ivory-500">
                    Khung giờ: {selectedEntryDetail.hourRange} • Trực Nhật Tinh: <strong>{selectedEntryDetail.general.name}</strong>
                    {selectedEntryDetail.general.mappedGeneralName && selectedEntryDetail.general.mappedGeneralName !== selectedEntryDetail.general.name && (
                      <span className="text-amber-300 font-semibold ml-1">
                        (ngầm hiểu là {selectedEntryDetail.general.mappedGeneralName})
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEntryDetail(null)}
                className="p-1 rounded-sm hover:bg-lacquer-700 text-ivory-500 hover:text-gold-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Tên Tâm Ấn Phú */}
            <div className="bg-lacquer-900 border border-amber-600/60 rounded-sm p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-amber-400 font-mono font-bold">
                  DANH XƯNG TÂM ẤN PHÚ
                </span>
                <span className="text-base font-serif font-black text-amber-300">
                  《{selectedEntryDetail.entry.tuongName}》 ({selectedEntryDetail.entry.tuongChinese})
                </span>
              </div>

              <div className="text-xs font-serif italic text-amber-100 bg-lacquer-800 p-2 rounded-sm border border-gold-800">
                📜 {selectedEntryDetail.entry.fullLine}
              </div>
            </div>

            {/* Chi Tiết Ý Nghĩa Cốt Lõi */}
            <div className="space-y-1.5">
              <span className="text-xs text-ivory-500 font-bold font-mono">
                DIỄN GIẢI CHUẨN XÁC NGUYÊN VĂN:
              </span>
              <div className="text-sm font-serif leading-relaxed text-ivory-100 bg-lacquer-800 p-3 rounded-sm border border-gold-800">
                {selectedEntryDetail.entry.meaning}
              </div>
            </div>

            {/* Khái Lược Bản Chất Thiên Tướng */}
            <div className="bg-lacquer-900 p-3 rounded-sm border border-lacquer-700 text-xs space-y-1">
              <span className="text-amber-400/90 font-bold block">
                Bản Chất Thiên Tướng: {selectedEntryDetail.general.mappedGeneralName} (ứng Trực Nhật Tinh {selectedEntryDetail.general.name})
              </span>
              <p className="text-ivory-500">{selectedEntryDetail.general.overview}</p>
              {selectedEntryDetail.general.notes && (
                <p className="text-amber-300/80 italic mt-1">
                  💡 {selectedEntryDetail.general.notes}
                </p>
              )}
            </div>

            {/* Nút Đóng */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setSelectedEntryDetail(null)}
                className="px-5 py-2 rounded-sm bg-gradient-to-r from-gold-500 to-gold-600 text-stone-950 font-bold text-xs cursor-pointer hover:brightness-110 shadow"
              >
                Đã Hiểu & Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xuất Ảnh PNG */}
      <ExportImageModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        imageUrl={exportedImageUrl}
        title={exportModalTitle}
        filename={exportModalFilename}
      />
    </div>
  );
};
