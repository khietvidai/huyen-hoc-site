import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Compass,
  Sparkles,
  Clock,
  RotateCw,
  Camera,
  Loader2,
  ArrowRight,
  BookOpen,
  Info,
  Calendar,
  Layers,
  CheckCircle2,
  HelpCircle,
  ShieldAlert,
  Flame,
  Award,
  Zap,
} from "lucide-react";
import { Hexagram } from "../types";
import { zenAudio } from "../utils/zenAudio";
import { captureElementToPng } from "../utils/captureHelper";
import { ExportImageModal } from "./ExportImageModal";
import {
  KY_MON_PALACES,
  KY_MON_STARS,
  KY_MON_GATES,
  KY_MON_SPIRITS,
  calculateKyMonChart,
  KyMonChartResult,
  KyMonCellData,
} from "../data/kymonData";
import {
  CAN_LIST,
  CHI_LIST,
  getCurrentBaziPillars,
} from "../data/baziConstants";

interface KyMonDivinationProps {
  onComplete: (
    primary: Hexagram,
    changingLines: number[],
    transformed?: Hexagram,
    summary?: string
  ) => void;
  onReset?: () => void;
}

export const KyMonDivination: React.FC<KyMonDivinationProps> = ({
  onComplete,
  onReset,
}) => {
  // Phương thức lập quẻ:
  // "realtime": Theo giờ hiện tại
  // "custom": Tự chọn Can Chi & Cục số
  // "mind": Động tâm chiêm đoạt (Bát Trận Đồ)
  // "number": Bấm số Cửu Cung
  const [activeTab, setActiveTab] = useState<"realtime" | "custom" | "mind" | "number">("realtime");

  // Inputs cho Custom
  const [customDun, setCustomDun] = useState<"Dương Độn" | "Âm Độn">("Dương Độn");
  const [customCuc, setCustomCuc] = useState<number>(1);
  const [hourCan, setHourCan] = useState<string>("Giáp");
  const [hourChi, setHourChi] = useState<string>("Tý");
  const [dayCan, setDayCan] = useState<string>("Giáp");
  const [dayChi, setDayChi] = useState<string>("Tý");
  const [monthCan, setMonthCan] = useState<string>("Bính");
  const [monthChi, setMonthChi] = useState<string>("Dần");
  const [yearCan, setYearCan] = useState<string>("Giáp");
  const [yearChi, setYearChi] = useState<string>("Thìn");

  // Input cho Number
  const [mindNumber, setMindNumber] = useState<string>("");

  // Result state
  const [result, setResult] = useState<KyMonChartResult | null>(null);
  const [isCasting, setIsCasting] = useState<boolean>(false);
  const [selectedCellNum, setSelectedCellNum] = useState<number | null>(null);
  const [showTheoryModal, setShowTheoryModal] = useState<boolean>(false);

  // Chụp hình
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [exportModalOpen, setExportModalOpen] = useState<boolean>(false);
  const [exportedImageUrl, setExportedImageUrl] = useState<string | null>(null);
  const [exportModalTitle, setExportModalTitle] = useState<string>("Bàn Kỳ Môn Độn Giáp");
  const [exportModalFilename, setExportModalFilename] = useState<string>("ky-mon-don-giap.png");

  const fullChartCaptureRef = useRef<HTMLDivElement>(null);
  const primaryHexCaptureRef = useRef<HTMLDivElement>(null);

  // Tự động khởi tạo theo giờ hiện tại khi người dùng bấm hoặc mở
  const executeRealtimeCast = () => {
    setIsCasting(true);
    zenAudio.playCardDrawSound();

    setTimeout(() => {
      const pillars = getCurrentBaziPillars();
      // pillars: [0: Hour, 1: Day, 2: Month, 3: Year]
      const hPillar = pillars[0];
      const dPillar = pillars[1];
      const mPillar = pillars[2];
      const yPillar = pillars[3];

      // Xác định Dương / Âm Độn theo tháng & tiết khí:
      // Tháng Dần (1) tới Ngọ (5): Dương Độn
      // Tháng Mùi (6) tới Tý (11): Âm Độn
      const now = new Date();
      const month = now.getMonth() + 1;
      const isDuong = month >= 1 && month <= 6;
      const dunType = isDuong ? "Dương Độn" : "Âm Độn";

      // Cục số theo ngày tháng
      const cucNum = (Math.abs(now.getDate() + month) % 9) + 1;

      const chart = calculateKyMonChart(
        dunType,
        cucNum,
        hPillar,
        dPillar,
        mPillar,
        yPillar
      );

      setResult(chart);
      setIsCasting(false);
      zenAudio.strikeSingingBowl(324, 0.75);
    }, 400);
  };

  // Khởi quẻ Custom
  const executeCustomCast = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsCasting(true);
    zenAudio.playCardDrawSound();

    setTimeout(() => {
      const chart = calculateKyMonChart(
        customDun,
        customCuc,
        { can: hourCan, chi: hourChi },
        { can: dayCan, chi: dayChi },
        { can: monthCan, chi: monthChi },
        { can: yearCan, chi: yearChi }
      );
      setResult(chart);
      setIsCasting(false);
      zenAudio.strikeSingingBowl(324, 0.75);
    }, 400);
  };

  // Khởi quẻ Động Tâm (Bát Trận Đồ quay ngẫu nhiên)
  const executeMindCast = () => {
    setIsCasting(true);
    zenAudio.playCardDrawSound();

    setTimeout(() => {
      const pillars = getCurrentBaziPillars();
      const randomDun = Math.random() > 0.5 ? "Dương Độn" : "Âm Độn";
      const randomCuc = Math.floor(Math.random() * 9) + 1;

      const chart = calculateKyMonChart(
        randomDun,
        randomCuc,
        pillars[0],
        pillars[1],
        pillars[2],
        pillars[3]
      );
      setResult(chart);
      setIsCasting(false);
      zenAudio.strikeSingingBowl(324, 0.75);
    }, 400);
  };

  // Khởi quẻ Bấm Số Cửu Cung
  const executeNumberCast = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCasting(true);
    zenAudio.playCardDrawSound();

    const val = parseInt(mindNumber, 10) || Math.floor(Math.random() * 999) + 1;
    const cucNum = (val % 9 === 0 ? 9 : val % 9);
    const dunType = val % 2 === 0 ? "Âm Độn" : "Dương Độn";

    setTimeout(() => {
      const pillars = getCurrentBaziPillars();
      const chart = calculateKyMonChart(
        dunType,
        cucNum,
        pillars[0],
        pillars[1],
        pillars[2],
        pillars[3]
      );
      setResult(chart);
      setIsCasting(false);
      zenAudio.strikeSingingBowl(324, 0.75);
    }, 400);
  };

  const handleReset = () => {
    setResult(null);
    setSelectedCellNum(null);
    if (onReset) onReset();
  };

  // Tiếp tục xem Luận Giải Chi Tiết Cả Quẻ
  const handleProceedToDetails = () => {
    if (!result) return;
    zenAudio.strikeSingingBowl(324, 0.75);
    onComplete(
      result.primaryHex,
      [result.changingLine],
      result.transformedHex,
      result.primarySummary
    );
  };

  // Chụp hình Bàn Kỳ Môn hoặc Quẻ Ban Đầu
  const handleCapture = async (target: "chart" | "primary" = "chart") => {
    if (isCapturing || !result) return;
    try {
      setIsCapturing(true);
      zenAudio.playCardDrawChime();
      await new Promise((r) => setTimeout(r, 150));

      const targetEl = target === "primary" ? primaryHexCaptureRef.current : fullChartCaptureRef.current;
      if (!targetEl) return;

      const dateStr = new Date().toISOString().slice(0, 10);
      const title =
        target === "primary"
          ? `Quẻ Kỳ Môn Ban Đầu: Quẻ #${result.primaryHex.number} ${result.primaryHex.name}`
          : `Bàn Kỳ Môn Độn Giáp [${result.dunType} ${result.cucNum} Cục] - Giờ ${result.hourPillar.can} ${result.hourPillar.chi}`;

      const filename =
        target === "primary"
          ? `que-ky-mon-ban-dau-${result.primaryHex.number}-${dateStr}.png`
          : `ban-ky-mon-don-giap-${result.cucNum}-cuc-${dateStr}.png`;

      const dataUrl = await captureElementToPng(targetEl, {
        backgroundColor: "#16120E",
        pixelRatio: 2,
      });

      setExportedImageUrl(dataUrl);
      setExportModalTitle(title);
      setExportModalFilename(filename);
      setExportModalOpen(true);
      zenAudio.strikeSingingBowl(440, 0.6);
    } catch (err) {
      console.error("Lỗi khi chụp ảnh Kỳ Môn:", err);
    } finally {
      setIsCapturing(false);
    }
  };

  // Lưới 3x3 Cửu Cung Lạc Thư chuẩn cổ truyền
  const gridRows = [
    [4, 9, 2], // Tốn, Ly, Khôn
    [3, 5, 7], // Chấn, Trung, Đoài
    [8, 1, 6], // Cấn, Khảm, Càn
  ];

  return (
    <div className="w-full max-w-5xl mx-auto bg-[#16120E] border border-[#483723] rounded-2xl p-4 sm:p-6 shadow-2xl relative">
      {/* Decorative Border Accent */}
      <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#D4AF37]/60 pointer-events-none" />
      <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#D4AF37]/60 pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#D4AF37]/60 pointer-events-none" />
      <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#D4AF37]/60 pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2F2215] pb-4 mb-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#D4AF37] bg-[#261C12] px-2 py-0.5 rounded border border-[#3E2E1D]">
              Tam Thức Chi Đạo • Đệ Nhất Binh Thư
            </span>
            <span className="text-[10px] font-mono font-bold text-amber-300 bg-[#2B1B0E] border border-[#D4AF37]/60 px-2.5 py-0.5 rounded shadow-xs flex items-center gap-1">
              <span>⛩️</span> Kỳ Môn Độn Giáp (奇門遁甲)
            </span>
            <span className="text-[10px] font-mono text-[#A89882] bg-[#1C1712] px-2 py-0.5 rounded">
              Bát Trận Đồ • Cửu Tinh • Bát Môn • Bát Thần
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-serif font-bold text-[#F5EAD4] mt-1 flex items-center gap-2">
            <span>PHƯƠNG THỨC LẬP QUẺ KỲ MÔN ĐỘN GIÁP</span>
          </h3>
          <p className="text-xs text-[#A89882] font-serif mt-0.5">
            Khởi trận Cửu Cung Lạc Thư, định Trực Phù & Trực Sử, phối quẻ Kinh Dịch tìm cơ biến hanh thông cát tường.
          </p>
        </div>

        <div className="flex items-center gap-2 no-capture">
          <button
            type="button"
            onClick={() => setShowTheoryModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-serif bg-[#241A12] hover:bg-[#342417] text-[#FFE28A] border border-[#523A21] cursor-pointer shadow active:scale-95 transition-all"
            title="Xem Thuyết Minh Bát Trận Đồ & Nguyên Lý Kỳ Môn"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Thuyết Minh Kỳ Môn</span>
          </button>
          {result && (
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-serif bg-[#22160E] hover:bg-[#311E13] text-[#DECAB0] border border-[#442E1B] cursor-pointer shadow active:scale-95"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Lập Bàn Khác</span>
            </button>
          )}
        </div>
      </div>

      {!result ? (
        /* ========================================================================= */
        /* CHỌN PHƯƠNG THỨC KHỞI QUẺ */
        /* ========================================================================= */
        <div className="space-y-6">
          {/* 4 Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#120D08] p-1.5 rounded-2xl border border-[#3E2B19]">
            <button
              type="button"
              onClick={() => setActiveTab("realtime")}
              className={`p-2.5 rounded-xl text-xs font-serif font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                activeTab === "realtime"
                  ? "bg-[#2E1F12] text-[#FFE28A] border border-[#D4AF37] shadow-md"
                  : "text-[#A89882] hover:text-[#DECAB0] hover:bg-[#1E150D]"
              }`}
            >
              <Clock className="w-4 h-4 text-[#D4AF37]" />
              <span>1. Thời Khắc Hiện Tại</span>
              <span className="text-[9.5px] font-normal text-[#8A7966]">Thời Gia Kỳ Môn</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("custom")}
              className={`p-2.5 rounded-xl text-xs font-serif font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                activeTab === "custom"
                  ? "bg-[#2E1F12] text-[#FFE28A] border border-[#D4AF37] shadow-md"
                  : "text-[#A89882] hover:text-[#DECAB0] hover:bg-[#1E150D]"
              }`}
            >
              <Calendar className="w-4 h-4 text-[#D4AF37]" />
              <span>2. Tùy Chọn 4 Trụ</span>
              <span className="text-[9.5px] font-normal text-[#8A7966]">Chọn Can Chi & Cục</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("mind")}
              className={`p-2.5 rounded-xl text-xs font-serif font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                activeTab === "mind"
                  ? "bg-[#2E1F12] text-[#FFE28A] border border-[#D4AF37] shadow-md"
                  : "text-[#A89882] hover:text-[#DECAB0] hover:bg-[#1E150D]"
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>3. Động Tâm Chiêm</span>
              <span className="text-[9.5px] font-normal text-[#8A7966]">Bát Trận Động Ý</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("number")}
              className={`p-2.5 rounded-xl text-xs font-serif font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                activeTab === "number"
                  ? "bg-[#2E1F12] text-[#FFE28A] border border-[#D4AF37] shadow-md"
                  : "text-[#A89882] hover:text-[#DECAB0] hover:bg-[#1E150D]"
              }`}
            >
              <Compass className="w-4 h-4 text-[#D4AF37]" />
              <span>4. Bấm Số Cửu Cung</span>
              <span className="text-[9.5px] font-normal text-[#8A7966]">Trắc Số Định Cục</span>
            </button>
          </div>

          {/* TAB 1: THỜI KHẮC HIỆN TẠI */}
          {activeTab === "realtime" && (
            <div className="bg-[#1C140D] border border-[#4E351D] rounded-2xl p-6 text-center space-y-4 max-w-xl mx-auto shadow-inner">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#2A1C10] border border-[#D4AF37]/50 flex items-center justify-center text-3xl shadow-lg">
                ⏳
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-serif font-bold text-[#FFE28A]">
                  LẬP BÀN THEO THỜI KHẮC HIỆN TẠI (THỜI GIA KỲ MÔN)
                </h4>
                <p className="text-xs text-[#A89882] font-serif leading-relaxed px-4">
                  Hệ thống tự động đồng bộ Bát Tự 4 Trụ (Năm, Tháng, Ngày, Giờ) theo lịch Can Chi & Tiết Khí thiên văn, xác định Dương Độn hoặc Âm Độn và Cục Số chuẩn xác để an 9 Cung.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={executeRealtimeCast}
                  disabled={isCasting}
                  className="px-8 py-3 bg-gradient-to-r from-[#8C6218] via-[#D4AF37] to-[#8C6218] hover:brightness-110 active:scale-95 text-[#14100C] font-serif font-bold text-sm rounded-2xl shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2 mx-auto"
                >
                  {isCasting ? <Loader2 className="w-4 h-4 animate-spin text-[#14100C]" /> : <Zap className="w-4 h-4 text-[#14100C]" />}
                  <span>Khởi Trận Kỳ Môn Hiện Tại</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: TÙY CHỌN 4 TRỤ */}
          {activeTab === "custom" && (
            <form onSubmit={executeCustomCast} className="bg-[#1C140D] border border-[#4E351D] rounded-2xl p-5 space-y-4 max-w-2xl mx-auto">
              <div className="text-center space-y-1 border-b border-[#342213] pb-3">
                <h4 className="text-sm font-serif font-bold text-[#FFE28A]">
                  TÙY BIẾN 4 TRỤ CAN CHI & CỤC SỐ
                </h4>
                <p className="text-[11px] text-[#A89882] font-serif">
                  Tra cứu bất kỳ thời điểm nào trong quá khứ hoặc tương lai để phân tích thế trận Kỳ Môn.
                </p>
              </div>

              {/* Âm / Dương Độn & Cục Số */}
              <div className="grid grid-cols-2 gap-3 bg-[#140E08] p-3 rounded-xl border border-[#3A2615]">
                <div>
                  <label className="block text-[11px] font-serif text-[#C8B89E] mb-1">
                    Loại Độn (Dương / Âm):
                  </label>
                  <select
                    value={customDun}
                    onChange={(e) => setCustomDun(e.target.value as any)}
                    className="w-full bg-[#20160E] border border-[#523A21] rounded-lg px-2.5 py-1.5 text-xs text-[#FFE28A] font-serif focus:border-[#D4AF37] outline-hidden"
                  >
                    <option value="Dương Độn">Dương Độn (Đông Chí ➔ Hạ Chí)</option>
                    <option value="Âm Độn">Âm Độn (Hạ Chí ➔ Đông Chí)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-serif text-[#C8B89E] mb-1">
                    Cục Số (1 đến 9 Cục):
                  </label>
                  <select
                    value={customCuc}
                    onChange={(e) => setCustomCuc(parseInt(e.target.value, 10))}
                    className="w-full bg-[#20160E] border border-[#523A21] rounded-lg px-2.5 py-1.5 text-xs text-[#FFE28A] font-serif focus:border-[#D4AF37] outline-hidden"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                      <option key={n} value={n}>
                        {customDun} {n} Cục
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 4 Trụ Can Chi */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* Trụ Giờ */}
                <div className="bg-[#140E08] p-2.5 rounded-xl border border-[#3A2615] space-y-1">
                  <span className="text-[10px] font-mono text-[#D4AF37] font-bold block">1. TRỤ GIỜ</span>
                  <div className="flex gap-1">
                    <select
                      value={hourCan}
                      onChange={(e) => setHourCan(e.target.value)}
                      className="w-1/2 bg-[#20160E] border border-[#442E1B] rounded px-1.5 py-1 text-xs text-[#DECAB0]"
                    >
                      {CAN_LIST.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                    <select
                      value={hourChi}
                      onChange={(e) => setHourChi(e.target.value)}
                      className="w-1/2 bg-[#20160E] border border-[#442E1B] rounded px-1.5 py-1 text-xs text-[#DECAB0]"
                    >
                      {CHI_LIST.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Trụ Ngày */}
                <div className="bg-[#140E08] p-2.5 rounded-xl border border-[#3A2615] space-y-1">
                  <span className="text-[10px] font-mono text-[#A89882] font-bold block">2. TRỤ NGÀY</span>
                  <div className="flex gap-1">
                    <select
                      value={dayCan}
                      onChange={(e) => setDayCan(e.target.value)}
                      className="w-1/2 bg-[#20160E] border border-[#442E1B] rounded px-1.5 py-1 text-xs text-[#DECAB0]"
                    >
                      {CAN_LIST.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                    <select
                      value={dayChi}
                      onChange={(e) => setDayChi(e.target.value)}
                      className="w-1/2 bg-[#20160E] border border-[#442E1B] rounded px-1.5 py-1 text-xs text-[#DECAB0]"
                    >
                      {CHI_LIST.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Trụ Tháng */}
                <div className="bg-[#140E08] p-2.5 rounded-xl border border-[#3A2615] space-y-1">
                  <span className="text-[10px] font-mono text-[#A89882] font-bold block">3. TRỤ THÁNG</span>
                  <div className="flex gap-1">
                    <select
                      value={monthCan}
                      onChange={(e) => setMonthCan(e.target.value)}
                      className="w-1/2 bg-[#20160E] border border-[#442E1B] rounded px-1.5 py-1 text-xs text-[#DECAB0]"
                    >
                      {CAN_LIST.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                    <select
                      value={monthChi}
                      onChange={(e) => setMonthChi(e.target.value)}
                      className="w-1/2 bg-[#20160E] border border-[#442E1B] rounded px-1.5 py-1 text-xs text-[#DECAB0]"
                    >
                      {CHI_LIST.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Trụ Năm */}
                <div className="bg-[#140E08] p-2.5 rounded-xl border border-[#3A2615] space-y-1">
                  <span className="text-[10px] font-mono text-[#A89882] font-bold block">4. TRỤ NĂM</span>
                  <div className="flex gap-1">
                    <select
                      value={yearCan}
                      onChange={(e) => setYearCan(e.target.value)}
                      className="w-1/2 bg-[#20160E] border border-[#442E1B] rounded px-1.5 py-1 text-xs text-[#DECAB0]"
                    >
                      {CAN_LIST.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                    <select
                      value={yearChi}
                      onChange={(e) => setYearChi(e.target.value)}
                      className="w-1/2 bg-[#20160E] border border-[#442E1B] rounded px-1.5 py-1 text-xs text-[#DECAB0]"
                    >
                      {CHI_LIST.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isCasting}
                className="w-full py-2.5 bg-gradient-to-r from-[#8C6218] via-[#D4AF37] to-[#8C6218] hover:brightness-110 active:scale-95 text-[#14100C] font-serif font-bold text-xs rounded-xl shadow transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isCasting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Compass className="w-3.5 h-3.5" />}
                <span>Lập Bàn Kỳ Môn Tùy Chỉnh</span>
              </button>
            </form>
          )}

          {/* TAB 3: ĐỘNG TÂM CHIÊM */}
          {activeTab === "mind" && (
            <div className="bg-[#1C140D] border border-[#4E351D] rounded-2xl p-6 text-center space-y-4 max-w-xl mx-auto shadow-inner">
              <div
                onClick={executeMindCast}
                className="w-24 h-24 mx-auto rounded-full bg-gradient-to-b from-[#2E1E12] to-[#140D07] border-2 border-[#D4AF37] flex flex-col items-center justify-center cursor-pointer hover:scale-105 active:scale-95 shadow-[0_0_25px_rgba(212,175,55,0.3)] transition-all select-none group"
              >
                <span className="text-3xl group-hover:rotate-180 transition-transform duration-700">☯️</span>
                <span className="text-[10px] font-serif text-[#FFE28A] font-bold mt-1">Động Ý</span>
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-serif font-bold text-[#FFE28A]">
                  ĐỘNG TÂM KHỞI TRẬN (BÁT TRẬN ĐỒ)
                </h4>
                <p className="text-xs text-[#A89882] font-serif leading-relaxed px-4">
                  Khi lòng có điều băn khoăn, chắp tay thành kính, tập trung ý niệm vào việc cần hỏi rồi chạm vào Thái Cực Đồ để vạn sự tùy duyên lập quẻ.
                </p>
              </div>

              <button
                type="button"
                onClick={executeMindCast}
                disabled={isCasting}
                className="px-7 py-2.5 bg-[#2E1E12] hover:bg-[#3D2918] text-[#FFE28A] border border-[#D4AF37]/70 font-serif font-bold text-xs rounded-xl transition-all cursor-pointer shadow active:scale-95 inline-flex items-center gap-2"
              >
                {isCasting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />}
                <span>Khởi Bàn Kỳ Môn Động Tâm</span>
              </button>
            </div>
          )}

          {/* TAB 4: BẤM SỐ CỬU CUNG */}
          {activeTab === "number" && (
            <form onSubmit={executeNumberCast} className="bg-[#1C140D] border border-[#4E351D] rounded-2xl p-6 text-center space-y-4 max-w-md mx-auto shadow-inner">
              <div className="space-y-1">
                <h4 className="text-base font-serif font-bold text-[#FFE28A]">
                  BẤM SỐ ĐỊNH CỤC KỲ MÔN
                </h4>
                <p className="text-xs text-[#A89882] font-serif">
                  Nhập một con số bất kỳ bạn thoáng nghĩ trong đầu (từ 1 đến 999) để định Cung vị và khởi phát thế trận.
                </p>
              </div>

              <div className="max-w-xs mx-auto">
                <input
                  type="number"
                  value={mindNumber}
                  onChange={(e) => setMindNumber(e.target.value)}
                  placeholder="Ví dụ: 9, 36, 168, 888..."
                  className="w-full bg-[#120B06] border border-[#5A3F23] rounded-xl px-4 py-2.5 text-center text-lg font-mono font-bold text-[#FFE28A] placeholder-[#6E5943] focus:border-[#D4AF37] outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={isCasting}
                className="px-7 py-2.5 bg-gradient-to-r from-[#8C6218] via-[#D4AF37] to-[#8C6218] hover:brightness-110 active:scale-95 text-[#14100C] font-serif font-bold text-xs rounded-xl shadow transition-all cursor-pointer inline-flex items-center gap-2"
              >
                {isCasting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Compass className="w-3.5 h-3.5" />}
                <span>An Bàn Kỳ Môn Theo Số</span>
              </button>
            </form>
          )}
        </div>
      ) : (
        /* ========================================================================= */
        /* HIỂN THỊ KẾT QUẢ: BÀN KỲ MÔN & ĐỐI ỨNG KINH DỊCH */
        /* ========================================================================= */
        <div ref={fullChartCaptureRef} className="space-y-5 animate-in fade-in duration-500 bg-[#16120E] p-1 sm:p-2 rounded-2xl">
          {/* Top Banner: Thông tin Tổng Quát & Cục Số */}
          <div className="bg-[#1C140D] border border-[#583C1F] rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs font-serif">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xl">⛩️</span>
              <div>
                <span className="font-bold text-[#FFE28A] text-sm block">
                  {result.dunType.toUpperCase()} {result.cucNum} CỤC
                </span>
                <span className="text-[11px] font-mono text-[#A89882]">
                  Giờ: {result.hourPillar.can} {result.hourPillar.chi} • Ngày: {result.dayPillar.can} {result.dayPillar.chi} • Tuần Thủ: {result.tuanThu.leader} ({result.tuanThu.canHidden})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap no-capture">
              {/* Nút Chụp Bàn Kỳ Môn */}
              <button
                type="button"
                onClick={() => handleCapture("chart")}
                disabled={isCapturing}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-serif font-bold bg-[#2A1D11] hover:bg-[#3E2918] text-[#FFE28A] border border-[#6B4B27] hover:border-[#D4AF37] rounded-xl transition-all cursor-pointer shadow active:scale-95"
                title="Chụp ảnh toàn bộ Bàn Kỳ Môn Độn Giáp 9 Cung"
              >
                {isCapturing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5 text-[#D4AF37]" />}
                <span>Chụp Bàn Kỳ Môn</span>
              </button>

              {/* Nút Chụp Quẻ Kỳ Môn Ban Đầu */}
              <button
                type="button"
                onClick={() => handleCapture("primary")}
                disabled={isCapturing}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-serif font-bold bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20 hover:from-amber-500/30 text-[#FFE28A] border border-[#8C6218] hover:border-[#D4AF37] rounded-xl transition-all cursor-pointer shadow active:scale-95"
                title="Chụp ảnh riêng Quẻ Kỳ Môn Ban Đầu (Quẻ Chủ / Bản Quái)"
              >
                {isCapturing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5 text-[#FFE28A]" />}
                <span>Chụp Quẻ Ban Đầu</span>
              </button>

              {/* Nút Xem Chi Tiết Luận Giải Cả Quẻ */}
              <button
                type="button"
                onClick={handleProceedToDetails}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-serif font-bold bg-gradient-to-r from-emerald-600 to-amber-500 text-[#111] hover:brightness-110 rounded-xl transition-all cursor-pointer shadow active:scale-95"
              >
                <span>Xem Luận Giải Chi Tiết</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Badges: Trực Phù, Trực Sử, Không Vong, Mã Tinh */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
            <div className="bg-[#1A120B] p-2 rounded-xl border border-[#3E2816] flex items-center justify-between">
              <span className="text-[#A89882]">Trực Phù Tinh:</span>
              <span className="font-bold text-amber-300">⭐ {result.zhifuStar} (Cung {result.zhifuPalace})</span>
            </div>
            <div className="bg-[#1A120B] p-2 rounded-xl border border-[#3E2816] flex items-center justify-between">
              <span className="text-[#A89882]">Trực Sử Môn:</span>
              <span className="font-bold text-yellow-300">⚡ {result.zhishiGate} (Cung {result.zhishiPalace})</span>
            </div>
            <div className="bg-[#1A120B] p-2 rounded-xl border border-[#3E2816] flex items-center justify-between">
              <span className="text-[#A89882]">Dịch Mã Tinh:</span>
              <span className="font-bold text-sky-300">🐎 Cung {result.horsePalace} ({KY_MON_PALACES[result.horsePalace].direction})</span>
            </div>
            <div className="bg-[#1A120B] p-2 rounded-xl border border-[#3E2816] flex items-center justify-between">
              <span className="text-[#A89882]">Tuần Không:</span>
              <span className="font-bold text-rose-300">⭕ Cung {result.voidPalaces.join(", ")}</span>
            </div>
          </div>

          {/* ========================================================================= */}
          /* BÁT TRẬN ĐỒ: MA TRẬN 3x3 CỬU CUNG LẠC THƯ */
          /* ========================================================================= */
          <div className="bg-[#120D08] border-2 border-[#D4AF37]/50 rounded-2xl p-2 sm:p-4 shadow-2xl">
            <div className="text-center pb-2.5 mb-2.5 border-b border-[#2C1C0F] flex items-center justify-between px-2">
              <span className="text-[10px] font-mono text-[#A89882] uppercase">
                ✦ BÁT TRẬN ĐỒ KỲ MÔN • CỬU CUNG LẠC THƯ ✦
              </span>
              <span className="text-[10px] font-mono text-[#D4AF37]">
                Nhấp vào từng Cung để xem bình giải chi tiết
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
              {gridRows.map((row, rIdx) =>
                row.map((palaceNum) => {
                  const cell = result.cells[palaceNum];
                  const isSelected = selectedCellNum === palaceNum;

                  return (
                    <div
                      key={palaceNum}
                      onClick={() => setSelectedCellNum(isSelected ? null : palaceNum)}
                      className={`relative rounded-xl p-2 sm:p-3 border transition-all cursor-pointer flex flex-col justify-between min-h-[140px] sm:min-h-[160px] select-none ${
                        isSelected
                          ? "bg-[#2A1C10] border-[#D4AF37] ring-2 ring-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.3)] scale-[1.01]"
                          : cell.isZhifuStar
                          ? "bg-gradient-to-b from-[#24170E] to-[#160E08] border-[#D4AF37]/80 hover:border-[#D4AF37]"
                          : "bg-[#18110B] border-[#382616] hover:border-[#5C3E22]"
                      }`}
                    >
                      {/* Top Badges: Thần Bàn & Cung Info */}
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-[9px] sm:text-[10px] font-serif font-bold px-1.5 py-0.5 rounded border ${cell.spiritInfo.badgeClass}`}>
                          {cell.spirit}
                        </span>
                        <div className="flex items-center gap-1">
                          {cell.isZhifuStar && (
                            <span className="text-[9px] font-bold text-amber-300 bg-amber-950/80 px-1 rounded border border-amber-600/70" title="Cung Trực Phù Tinh">
                              ⭐ Phù
                            </span>
                          )}
                          {cell.isZhishiGate && (
                            <span className="text-[9px] font-bold text-yellow-300 bg-yellow-950/80 px-1 rounded border border-yellow-600/70" title="Cung Trực Sử Môn">
                              ⚡ Sử
                            </span>
                          )}
                          {cell.isHorse && (
                            <span className="text-[9px] font-bold text-sky-300 bg-sky-950/80 px-1 rounded border border-sky-600/70" title="Dịch Mã Tinh">
                              🐎
                            </span>
                          )}
                          {cell.isVoid && (
                            <span className="text-[9px] font-bold text-rose-300 bg-rose-950/80 px-1 rounded border border-rose-600/70" title="Tuần Không Vong">
                              ⭕
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Middle: Thiên Bàn Tinh & Thiên Can / Địa Can */}
                      <div className="my-1.5 sm:my-2 text-center space-y-1">
                        <span className="text-[11px] sm:text-xs font-serif font-bold text-[#EAD8B1] block">
                          {cell.star}
                        </span>

                        {/* Thiên Can trên, Địa Can dưới */}
                        <div className="inline-flex items-center justify-center gap-2 bg-[#120B06] px-2.5 py-1 rounded-lg border border-[#322011]">
                          <div className="text-center">
                            <span className="text-[9px] text-[#A89882] block leading-none font-mono">Thiên</span>
                            <span className="text-xs sm:text-sm font-bold font-mono text-[#FFE28A]">{cell.thienCan}</span>
                          </div>
                          <span className="text-xs text-[#5E4832]">/</span>
                          <div className="text-center">
                            <span className="text-[9px] text-[#A89882] block leading-none font-mono">Địa</span>
                            <span className="text-xs sm:text-sm font-bold font-mono text-[#D4AF37]">{cell.diaCan}</span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom: Bát Môn & Cung Number */}
                      <div className="flex items-center justify-between gap-1 pt-1 border-t border-[#291B0F]">
                        <span className={`text-[9.5px] sm:text-[11px] font-serif font-bold px-1.5 py-0.5 rounded border ${cell.gateInfo.colorClass}`}>
                          {cell.gate}
                        </span>
                        <div className="text-right">
                          <span className="text-[9px] font-mono text-[#A89882] block leading-none">
                            {cell.palace.chineseBagua} • {cell.palace.palaceNum}
                          </span>
                          <span className="text-[8.5px] font-serif text-[#786551] block leading-none mt-0.5">
                            {cell.palace.direction}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Chi tiết Ô Cung được chọn (khi người dùng click vào cung) */}
          {selectedCellNum && (
            <div className="bg-[#1C140D] border border-[#D4AF37]/60 rounded-xl p-4 animate-in fade-in space-y-2">
              <div className="flex items-center justify-between border-b border-[#3E2917] pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base font-serif font-bold text-[#FFE28A]">
                    CHI TIẾT CUNG {selectedCellNum}: {result.cells[selectedCellNum].palace.baguaName} ({result.cells[selectedCellNum].palace.direction}) • Ngũ Hành {result.cells[selectedCellNum].palace.element}
                  </span>
                  <span className="text-xs font-mono text-[#A89882]">
                    Bản Cung: {result.cells[selectedCellNum].palace.originalStar} • {result.cells[selectedCellNum].palace.originalGate}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCellNum(null)}
                  className="text-xs text-[#A89882] hover:text-white px-2 py-0.5 rounded bg-[#2A1C10]"
                >
                  ✕ Đóng
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-serif pt-1">
                <div className="bg-[#140D07] p-2.5 rounded-lg border border-[#3A2414]">
                  <span className="text-[10px] font-mono text-[#D4AF37] block font-bold">1. THIÊN BÀN & CỬU TINH</span>
                  <span className="text-sm font-bold text-[#FFE28A]">{result.cells[selectedCellNum].star}</span>
                  <p className="text-[11px] text-[#C8B89E] mt-1">{result.cells[selectedCellNum].starInfo.desc}</p>
                </div>

                <div className="bg-[#140D07] p-2.5 rounded-lg border border-[#3A2414]">
                  <span className="text-[10px] font-mono text-yellow-400 block font-bold">2. NHÂN BÀN & BÁT MÔN</span>
                  <span className="text-sm font-bold text-yellow-200">{result.cells[selectedCellNum].gate} ({result.cells[selectedCellNum].gateInfo.quality})</span>
                  <p className="text-[11px] text-[#C8B89E] mt-1">{result.cells[selectedCellNum].gateInfo.desc}</p>
                </div>

                <div className="bg-[#140D07] p-2.5 rounded-lg border border-[#3A2414]">
                  <span className="text-[10px] font-mono text-rose-300 block font-bold">3. THẦN BÀN & BÁT THẦN</span>
                  <span className="text-sm font-bold text-rose-200">{result.cells[selectedCellNum].spirit}</span>
                  <p className="text-[11px] text-[#C8B89E] mt-1">{result.cells[selectedCellNum].spiritInfo.desc}</p>
                </div>
              </div>

              {result.cells[selectedCellNum].formationName && (
                <div className="bg-[#24170E] p-2.5 rounded-lg border border-[#5A381A] flex items-center gap-2 text-xs font-serif">
                  <span className="text-base">✨</span>
                  <div>
                    <span className="font-bold text-[#FFE28A]">{result.cells[selectedCellNum].formationName}</span>
                    <p className="text-[11px] text-[#DECAB0]">{result.cells[selectedCellNum].formationDesc}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          /* KỲ MÔN HÓA DỊCH: QUẺ KINH DỊCH BAN ĐẦU & BIẾN QUÁI */
          /* ========================================================================= */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* THẺ 1: QUẺ KỲ MÔN BAN ĐẦU (BẢN QUÁI) */}
            <div
              ref={primaryHexCaptureRef}
              className="bg-gradient-to-b from-[#1C140D] to-[#120D08] border-2 border-[#D4AF37] rounded-2xl p-4 shadow-xl flex flex-col justify-between space-y-3 relative overflow-hidden"
            >
              <div className="flex items-center justify-between pb-1 border-b border-[#342213] no-capture">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#2D1B0E] border border-[#D4AF37] text-[#FFE28A] font-bold">
                  QUẺ KỲ MÔN BAN ĐẦU (BẢN QUÁI)
                </span>
                <button
                  type="button"
                  onClick={() => handleCapture("primary")}
                  disabled={isCapturing}
                  className="flex items-center gap-1 px-2.5 py-1 text-[10.5px] font-serif font-bold rounded-lg bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20 text-[#FFE28A] border border-[#8C6218] hover:border-[#D4AF37] transition-all cursor-pointer shadow-xs active:scale-95"
                  title="Chụp hình Quẻ Kỳ Môn Ban Đầu"
                >
                  {isCapturing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3 text-[#FFE28A]" />}
                  <span>Chụp Quẻ</span>
                </button>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-[#A89882] block">
                  Cơ Duyên Thời Khắc • Gốc Rễ Hiện Tại
                </span>
                <h4 className="text-base font-serif font-bold text-[#FFE28A] mt-0.5">
                  Quẻ #{result.primaryHex.number}: {result.primaryHex.name}
                </h4>
                <span className="text-xs text-[#DECAB0] font-serif block">
                  {result.primaryHex.vietnameseName} ({result.primaryHex.hanzi})
                </span>
              </div>

              {/* 6 Hào Bản Quái với hào động nổi bật */}
              <div className="space-y-1.5 py-2 border-y border-[#342213]">
                {[5, 4, 3, 2, 1, 0].map((lineIdx) => {
                  const lineNum = lineIdx + 1;
                  const isYang = result.primaryHex.lines[lineIdx] === 1;
                  const isChanging = lineNum === result.changingLine;

                  return (
                    <div key={lineIdx} className="flex items-center gap-2 text-[10px] font-mono">
                      <span className={`w-8 shrink-0 ${isChanging ? "text-rose-400 font-bold" : "text-[#7D6B57]"}`}>
                        H{lineNum} {isChanging ? "●" : ""}
                      </span>

                      <div className="flex-1">
                        {isYang ? (
                          <div
                            className={`h-2.5 rounded-xs transition-all ${
                              isChanging
                                ? "bg-gradient-to-r from-[#D4AF37] via-rose-500 to-[#D4AF37] shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse"
                                : "bg-[#C89B3C]"
                            }`}
                          />
                        ) : (
                          <div className="flex justify-between h-2.5">
                            <div
                              className={`w-[45%] rounded-xs ${
                                isChanging
                                  ? "bg-gradient-to-r from-[#D4AF37] to-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse"
                                  : "bg-[#7A6A55]"
                              }`}
                            />
                            <div
                              className={`w-[45%] rounded-xs ${
                                isChanging
                                  ? "bg-gradient-to-r from-rose-500 to-[#D4AF37] shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse"
                                  : "bg-[#7A6A55]"
                              }`}
                            />
                          </div>
                        )}
                      </div>

                      <span className="text-[9px] w-14 text-right text-[#A89882]">
                        {lineNum >= 4 ? `Thượng (${result.upperTrigram.name})` : `Hạ (${result.lowerTrigram.name})`}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Phối Quái Kỳ Môn */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs font-serif">
                <div className="bg-[#140D07] p-2 rounded-lg border border-[#3E2816]">
                  <span className="text-[10px] text-amber-300 block font-mono">
                    THƯỢNG QUÁI (TRỰC PHÙ)
                  </span>
                  <span className="font-bold text-[#FFE28A]">{result.upperTrigram.name} ({result.upperTrigram.nature})</span>
                </div>
                <div className="bg-[#140D07] p-2 rounded-lg border border-[#3E2816]">
                  <span className="text-[10px] text-yellow-300 block font-mono">
                    HẠ QUÁI (TRỰC SỬ)
                  </span>
                  <span className="font-bold text-yellow-200">{result.lowerTrigram.name} ({result.lowerTrigram.nature})</span>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-[#140C07] border border-[#3E2816] text-center space-y-0.5">
                <span className="text-[11px] font-serif font-bold text-[#FFE28A] block">
                  Hào {result.changingLine} Động Biến Dẫn Tới Quẻ Biến
                </span>
                <span className="text-[10px] text-[#A89882] font-serif block">
                  Thời thế chuyển động, quẻ ban đầu là cội nguồn của vạn sự
                </span>
              </div>
            </div>

            {/* THẺ 2: CHIẾN LƯỢC KỲ MÔN & QUẺ BIẾN */}
            <div className="bg-gradient-to-b from-[#19130D] to-[#120B06] border border-[#523A21] rounded-2xl p-4 shadow-xl flex flex-col justify-between space-y-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#A89882] block">
                  Tương Lai & Biến Hóa
                </span>
                <h4 className="text-base font-serif font-bold text-rose-300 mt-0.5">
                  Biến Quẻ #{result.transformedHex.number}: {result.transformedHex.name}
                </h4>
                <span className="text-xs text-[#DECAB0] font-serif block">
                  {result.transformedHex.vietnameseName} ({result.transformedHex.hanzi})
                </span>
              </div>

              {/* Lời khuyên chiến lược & Phương vị cát tường */}
              <div className="space-y-2 bg-[#140D07] p-3 rounded-xl border border-[#3E2918] text-xs font-serif">
                <span className="text-[11px] font-bold text-[#FFE28A] block flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>PHƯƠNG VỊ CÁT TƯỜNG (TAM CÁT MÔN):</span>
                </span>
                <div className="grid grid-cols-3 gap-1.5 text-center text-[10.5px]">
                  <div className="bg-[#1C140D] p-1.5 rounded border border-amber-600/50">
                    <span className="font-bold text-amber-300 block">Khai Môn</span>
                    <span className="text-[#A89882]">Cung 6 (Tây Bắc)</span>
                  </div>
                  <div className="bg-[#1C140D] p-1.5 rounded border border-emerald-600/50">
                    <span className="font-bold text-emerald-300 block">Hưu Môn</span>
                    <span className="text-[#A89882]">Cung 1 (Chính Bắc)</span>
                  </div>
                  <div className="bg-[#1C140D] p-1.5 rounded border border-yellow-600/50">
                    <span className="font-bold text-yellow-300 block">Sinh Môn</span>
                    <span className="text-[#A89882]">Cung 8 (Đông Bắc)</span>
                  </div>
                </div>
                <p className="text-[11px] text-[#DECAB0] leading-relaxed pt-1">
                  {result.strategicAdvice}
                </p>
              </div>

              {/* Cách cục đặc thù */}
              {result.mainFormations.length > 0 && (
                <div className="space-y-1 bg-[#140E08] p-2.5 rounded-xl border border-[#3E2816] text-xs font-serif">
                  <span className="text-[10.5px] font-bold text-[#FFE28A] block">
                    CÁCH CỤC THIÊN ĐỊA CAN:
                  </span>
                  {result.mainFormations.map((f, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-400 mt-0.5">•</span>
                      <p className="text-[11px] text-[#DECAB0]">
                        <strong className={f.type === "cat" ? "text-amber-300" : "text-rose-300"}>
                          {f.name}:
                        </strong>{" "}
                        {f.desc}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Nút hành động xem luận giải chi tiết */}
              <button
                type="button"
                onClick={handleProceedToDetails}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-600 via-amber-400 to-emerald-600 hover:brightness-110 active:scale-95 text-[#111] font-bold font-serif text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Xem Luận Giải Chi Tiết Cả Quẻ</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Thuyết Minh Kỳ Môn Độn Giáp */}
      {showTheoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-[#16120E] border-2 border-[#D4AF37] rounded-2xl max-w-2xl w-full p-5 sm:p-6 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowTheoryModal(false)}
              className="absolute top-4 right-4 text-[#A89882] hover:text-white p-1 rounded-lg bg-[#2A1D11] cursor-pointer"
            >
              ✕
            </button>
            <div className="border-b border-[#3E2B19] pb-3">
              <span className="text-[10px] font-mono text-[#D4AF37] uppercase">Kỳ Môn Cổ Thư</span>
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#FFE28A] mt-0.5">
                NGUYÊN LÝ & BỐ TRẬN KỲ MÔN ĐỘN GIÁP
              </h3>
            </div>
            <div className="space-y-3 text-xs sm:text-sm font-serif text-[#DECAB0] leading-relaxed">
              <p>
                <strong className="text-[#FFE28A]">Kỳ Môn Độn Giáp (奇門遁甲)</strong> cùng với <strong className="text-[#FFE28A]">Thái Ất Thần Số</strong> và <strong className="text-[#FFE28A]">Lục Nhâm Đại Độn</strong> hợp thành Tam Thức trứ danh của cổ nhân: <em>"Thái Ất tri thiên thời, Kỳ Môn tri địa lợi, Lục Nhâm tri nhân sự"</em>.
              </p>
              <div className="space-y-1.5 bg-[#1C140D] p-3 rounded-xl border border-[#442F1C]">
                <h5 className="font-bold text-[#FFE28A]">Cấu Trúc Tứ Bàn Kỳ Môn:</h5>
                <ul className="list-disc list-inside space-y-1 text-xs text-[#C8B89E]">
                  <li><strong className="text-amber-300">Địa Bàn:</strong> Lục Nghi (Mậu, Kỷ, Canh, Tân, Nhâm, Quý) & Tam Kỳ (Ất, Bính, Đinh). Giáp là chủ soái nên ẩn ("độn") dưới Lục Nghi.</li>
                  <li><strong className="text-amber-300">Thiên Bàn (Cửu Tinh):</strong> Thiên Bồng, Thiên Nhuế, Thiên Xung, Thiên Phụ, Thiên Cầm, Thiên Tâm, Thiên Trụ, Thiên Nhậm, Thiên Anh.</li>
                  <li><strong className="text-amber-300">Nhân Bàn (Bát Môn):</strong> Khai, Hưu, Sinh (Tam Cát Môn); Thương, Đỗ, Cảnh, Tử, Kinh (Hung/Bình Môn).</li>
                  <li><strong className="text-amber-300">Thần Bàn (Bát Thần):</strong> Trực Phù, Đằng Xà, Thái Âm, Lục Hợp, Bạch Hổ, Huyền Vũ, Cửu Địa, Cửu Thiên.</li>
                </ul>
              </div>
              <p>
                Bằng cách kết hợp giữa Kỳ Môn Độn Giáp và 64 quẻ Chu Dịch, người chiêm đoán không những thấy được vị trí tương quan trong không gian thời gian (Địa Lợi) mà còn nắm bắt được quy luật chuyển dịch cát hung thông qua Thể Dụng Thoán Hào Kinh Dịch.
              </p>
            </div>
            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setShowTheoryModal(false)}
                className="px-5 py-2 bg-[#2E1E12] hover:bg-[#3E2918] text-[#FFE28A] border border-[#5A3F23] rounded-xl text-xs font-serif font-bold cursor-pointer"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xuất & Tải Ảnh */}
      <ExportImageModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        imageUrl={exportedImageUrl}
        title={exportModalTitle}
        filename={exportModalFilename}
      />
    </div>
  );
};
