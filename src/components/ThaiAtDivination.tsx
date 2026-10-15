import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Crown,
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
  Compass,
  Star,
  Swords,
  Shield,
  Sun,
  Eye,
} from "lucide-react";
import { Hexagram } from "../types";
import { zenAudio } from "../utils/zenAudio";
import { captureElementToPng } from "../utils/captureHelper";
import { ExportImageModal } from "./ExportImageModal";
import {
  THAI_AT_PALACES,
  THAI_AT_SPIRITS,
  calculateThaiAtChart,
  ThaiAtChartResult,
  ThaiAtCellData,
} from "../data/thaiatData";
import {
  CAN_LIST,
  CHI_LIST,
  getCurrentBaziPillars,
} from "../data/baziConstants";

interface ThaiAtDivinationProps {
  onComplete: (
    primary: Hexagram,
    changingLines: number[],
    transformed?: Hexagram,
    summary?: string
  ) => void;
  onReset?: () => void;
}

export const ThaiAtDivination: React.FC<ThaiAtDivinationProps> = ({
  onComplete,
  onReset,
}) => {
  // Phương thức lập quẻ:
  // "realtime": Theo giờ hiện tại
  // "custom": Tự chọn Can Chi & Cục số
  // "mind": Động tâm chiêm đoạt
  // "number": Bấm số Thiên Cơ
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
  const [result, setResult] = useState<ThaiAtChartResult | null>(null);
  const [isCasting, setIsCasting] = useState<boolean>(false);
  const [selectedCellNum, setSelectedCellNum] = useState<number | null>(null);
  const [showTheoryModal, setShowTheoryModal] = useState<boolean>(false);

  // Chụp hình
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [exportModalOpen, setExportModalOpen] = useState<boolean>(false);
  const [exportedImageUrl, setExportedImageUrl] = useState<string | null>(null);
  const [exportModalTitle, setExportModalTitle] = useState<string>("Bàn Thái Ất Thần Số");
  const [exportModalFilename, setExportModalFilename] = useState<string>("thai-at-than-so.png");

  const fullChartCaptureRef = useRef<HTMLDivElement>(null);
  const primaryHexCaptureRef = useRef<HTMLDivElement>(null);

  // Khởi quẻ theo giờ hiện tại
  const executeRealtimeCast = () => {
    setIsCasting(true);
    zenAudio.playCardDrawSound();

    setTimeout(() => {
      const pillars = getCurrentBaziPillars();
      const now = new Date();
      const month = now.getMonth() + 1;
      const isDuong = month >= 1 && month <= 6;
      const dunType = isDuong ? "Dương Độn" : "Âm Độn";

      // Cục số theo chu kỳ Thái Ất
      const cucNum = (Math.abs(now.getDate() * 2 + month + now.getHours()) % 36) + 1;

      const chart = calculateThaiAtChart(
        dunType,
        cucNum,
        pillars[0], // Giờ
        pillars[1], // Ngày
        pillars[2], // Tháng
        pillars[3]  // Năm
      );

      setResult(chart);
      setIsCasting(false);
      zenAudio.strikeSingingBowl(324, 0.75);
    }, 400);
  };

  // Khởi quẻ Tùy biến
  const executeCustomCast = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsCasting(true);
    zenAudio.playCardDrawSound();

    setTimeout(() => {
      const chart = calculateThaiAtChart(
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

  // Khởi quẻ Động Tâm
  const executeMindCast = () => {
    setIsCasting(true);
    zenAudio.playCardDrawSound();

    setTimeout(() => {
      const pillars = getCurrentBaziPillars();
      const randomDun = Math.random() > 0.5 ? "Dương Độn" : "Âm Độn";
      const randomCuc = Math.floor(Math.random() * 36) + 1;

      const chart = calculateThaiAtChart(
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

  // Khởi quẻ Bấm Số Thiên Cơ
  const executeNumberCast = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCasting(true);
    zenAudio.playCardDrawSound();

    const val = parseInt(mindNumber, 10) || Math.floor(Math.random() * 999) + 1;
    const cucNum = (val % 36 === 0 ? 36 : val % 36);
    const dunType = val % 2 === 0 ? "Âm Độn" : "Dương Độn";

    setTimeout(() => {
      const pillars = getCurrentBaziPillars();
      const chart = calculateThaiAtChart(
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

  // Chụp hình
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
          ? `Quẻ Thái Ất Ban Đầu: Quẻ #${result.primaryHex.number} ${result.primaryHex.name}`
          : `Bàn Thái Ất Thần Số [${result.epochName}] - Giờ ${result.hourPillar.can} ${result.hourPillar.chi}`;

      const filename =
        target === "primary"
          ? `que-thai-at-ban-dau-${result.primaryHex.number}-${dateStr}.png`
          : `ban-thai-at-than-so-${result.cucNum}-cuc-${dateStr}.png`;

      const dataUrl = await captureElementToPng(targetEl, {
        backgroundColor: "#16120E",
        pixelRatio: 2,
      });

      setExportedImageUrl(dataUrl);
      setExportModalTitle(title);
      setExportModalFilename(filename);
      setExportModalOpen(true);
    } catch (err) {
      console.error("Capture Thai At error:", err);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-[#24170F] via-[#1B110B] to-[#24170F] border border-[#5A3F24] rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FFE28A] via-[#D4AF37] to-[#8C6218] flex items-center justify-center text-[#120F0B] shadow-[0_0_15px_rgba(212,175,55,0.4)]">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-serif font-bold text-base sm:text-lg text-[#F5EAD4] tracking-wide">
                  THÁI ẤT THẦN SỐ (太乙神數)
                </h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-950 to-amber-900 text-amber-200 border border-amber-600/70 font-semibold shadow">
                  Tam Thức Chi Thượng • Coi Thiên Thời & Vận Thế
                </span>
              </div>
              <p className="text-xs text-[#A89882] font-serif mt-0.5">
                Chí tôn thuật số phương Đông: Thái Ất Cửu Cung • 72 Cục Âm Dương • Chủ Toán & Khách Toán • Ngũ Phúc Cát Tinh • Thái Ất Hóa Dịch
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowTheoryModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2A1C10] hover:bg-[#3B2818] border border-[#5C4023] text-xs font-serif text-[#FFE28A] transition-all cursor-pointer shadow active:scale-95"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Điển Tích Thái Ất</span>
            </button>

            {result && (
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#22170E] hover:bg-[#302115] border border-[#48331E] text-xs font-serif text-[#CDBFA8] hover:text-[#FFE28A] transition-all cursor-pointer shadow active:scale-95"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Khởi Lại</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CHỌN PHƯƠNG THỨC KHỞI QUẺ */}
      {!result ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("realtime")}
              className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                activeTab === "realtime"
                  ? "bg-gradient-to-b from-[#2E1E12] to-[#1C120A] border-[#D4AF37] text-[#FFE28A] shadow-[0_0_12px_rgba(212,175,55,0.3)] ring-1 ring-[#D4AF37]/50 font-bold"
                  : "bg-[#160E08] border-[#382414] text-[#A89882] hover:bg-[#20150D]"
              }`}
            >
              <Clock className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-xs font-serif">Thời Khắc Hiện Tại</span>
              <span className="text-[9.5px] font-normal text-[#8A7966]">Đồng bộ 4 Trụ</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("custom")}
              className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                activeTab === "custom"
                  ? "bg-gradient-to-b from-[#2E1E12] to-[#1C120A] border-[#D4AF37] text-[#FFE28A] shadow-[0_0_12px_rgba(212,175,55,0.3)] ring-1 ring-[#D4AF37]/50 font-bold"
                  : "bg-[#160E08] border-[#382414] text-[#A89882] hover:bg-[#20150D]"
              }`}
            >
              <Calendar className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-xs font-serif">Tùy Chọn 4 Trụ</span>
              <span className="text-[9.5px] font-normal text-[#8A7966]">Tự chọn Can Chi & Cục</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("mind")}
              className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                activeTab === "mind"
                  ? "bg-gradient-to-b from-[#2E1E12] to-[#1C120A] border-[#D4AF37] text-[#FFE28A] shadow-[0_0_12px_rgba(212,175,55,0.3)] ring-1 ring-[#D4AF37]/50 font-bold"
                  : "bg-[#160E08] border-[#382414] text-[#A89882] hover:bg-[#20150D]"
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-xs font-serif">Động Tâm Chiêm</span>
              <span className="text-[9.5px] font-normal text-[#8A7966]">Ý niệm khởi quẻ</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("number")}
              className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                activeTab === "number"
                  ? "bg-gradient-to-b from-[#2E1E12] to-[#1C120A] border-[#D4AF37] text-[#FFE28A] shadow-[0_0_12px_rgba(212,175,55,0.3)] ring-1 ring-[#D4AF37]/50 font-bold"
                  : "bg-[#160E08] border-[#382414] text-[#A89882] hover:bg-[#20150D]"
              }`}
            >
              <Compass className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-xs font-serif">Bấm Số Thiên Cơ</span>
              <span className="text-[9.5px] font-normal text-[#8A7966]">Trắc số định cục</span>
            </button>
          </div>

          {/* TAB 1: THỜI KHẮC HIỆN TẠI */}
          {activeTab === "realtime" && (
            <div className="bg-[#1C140D] border border-[#4E351D] rounded-2xl p-6 text-center space-y-4 max-w-xl mx-auto shadow-inner">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#2A1C10] border border-[#D4AF37]/50 flex items-center justify-center text-3xl shadow-lg">
                👑
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-serif font-bold text-[#FFE28A]">
                  LẬP BÀN THÁI ẤT THEO THỜI KHẮC HIỆN TẠI
                </h4>
                <p className="text-xs text-[#A89882] font-serif leading-relaxed px-4">
                  Hệ thống tính toán thời khắc Can Chi thiên văn, xác định Dương Độn (từ Đông Chí đến Hạ Chí) hoặc Âm Độn (từ Hạ Chí đến Đông Chí) cùng Cục số Thái Ất để an vị Cửu Cung, Thần Tinh và xuất Quẻ.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={executeRealtimeCast}
                  disabled={isCasting}
                  className="px-8 py-3 bg-gradient-to-r from-[#8C6218] via-[#D4AF37] to-[#8C6218] hover:brightness-110 active:scale-95 text-[#14100C] font-serif font-bold text-sm rounded-2xl shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2 mx-auto"
                >
                  {isCasting ? <Loader2 className="w-4 h-4 animate-spin text-[#14100C]" /> : <Crown className="w-4 h-4 text-[#14100C]" />}
                  <span>Khởi Trận Thái Ất Thần Số</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: TÙY CHỌN 4 TRỤ */}
          {activeTab === "custom" && (
            <form onSubmit={executeCustomCast} className="bg-[#1C140D] border border-[#4E351D] rounded-2xl p-5 space-y-4 max-w-2xl mx-auto">
              <div className="text-center space-y-1 border-b border-[#342213] pb-3">
                <h4 className="text-sm font-serif font-bold text-[#FFE28A]">
                  TÙY BIẾN 4 TRỤ CAN CHI & CỤC SỐ THÁI ẤT
                </h4>
                <p className="text-[11px] text-[#A89882] font-serif">
                  Tra cứu bất kỳ thời điểm lịch sử hay tương lai theo 72 Cục Thái Ất Cổ Truyền.
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
                    Cục Số (1 đến 36 Cục):
                  </label>
                  <select
                    value={customCuc}
                    onChange={(e) => setCustomCuc(parseInt(e.target.value, 10))}
                    className="w-full bg-[#20160E] border border-[#523A21] rounded-lg px-2.5 py-1.5 text-xs text-[#FFE28A] font-serif focus:border-[#D4AF37] outline-hidden"
                  >
                    {Array.from({ length: 36 }, (_, i) => i + 1).map((n) => (
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
                className="w-full py-2.5 bg-gradient-to-r from-[#8C6218] via-[#D4AF37] to-[#8C6218] hover:brightness-110 active:scale-95 text-[#14100C] font-serif font-bold text-xs rounded-xl shadow transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isCasting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Crown className="w-3.5 h-3.5" />}
                <span>Lập Bàn Thái Ất Tùy Chỉnh</span>
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
                <Crown className="w-10 h-10 text-[#FFE28A] group-hover:rotate-12 transition-transform duration-500" />
                <span className="text-[10px] font-serif text-[#FFE28A] font-bold mt-1">Động Ý</span>
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-serif font-bold text-[#FFE28A]">
                  ĐỘNG TÂM KHỞI QUẺ THÁI ẤT
                </h4>
                <p className="text-xs text-[#A89882] font-serif leading-relaxed px-4">
                  Khi đứng trước quyết định trọng đại hoặc băn khoăn về đại cuộc, định tâm thanh tịnh, hướng về Thái Cực chí tôn rồi chạm vào Vương Miện Thái Ất để khởi quẻ.
                </p>
              </div>

              <button
                type="button"
                onClick={executeMindCast}
                disabled={isCasting}
                className="px-7 py-2.5 bg-[#2E1E12] hover:bg-[#3D2918] text-[#FFE28A] border border-[#D4AF37]/70 font-serif font-bold text-xs rounded-xl transition-all cursor-pointer shadow active:scale-95 inline-flex items-center gap-2"
              >
                {isCasting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />}
                <span>Khởi Bàn Thái Ất Động Tâm</span>
              </button>
            </div>
          )}

          {/* TAB 4: BẤM SỐ THIÊN CƠ */}
          {activeTab === "number" && (
            <form onSubmit={executeNumberCast} className="bg-[#1C140D] border border-[#4E351D] rounded-2xl p-6 text-center space-y-4 max-w-md mx-auto shadow-inner">
              <div className="space-y-1">
                <h4 className="text-base font-serif font-bold text-[#FFE28A]">
                  BẤM SỐ ĐỊNH CỤC THÁI ẤT
                </h4>
                <p className="text-xs text-[#A89882] font-serif">
                  Nhập một con số bất kỳ bạn thoáng nghĩ trong tâm (từ 1 đến 999) để định Cục số Thái Ất.
                </p>
              </div>

              <div className="max-w-xs mx-auto">
                <input
                  type="number"
                  value={mindNumber}
                  onChange={(e) => setMindNumber(e.target.value)}
                  placeholder="Ví dụ: 7, 36, 108, 999..."
                  className="w-full bg-[#120B06] border border-[#5A3F23] rounded-xl px-4 py-2.5 text-center text-lg font-mono font-bold text-[#FFE28A] placeholder-[#6E5943] focus:border-[#D4AF37] outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={isCasting}
                className="px-7 py-2.5 bg-gradient-to-r from-[#8C6218] via-[#D4AF37] to-[#8C6218] hover:brightness-110 active:scale-95 text-[#14100C] font-serif font-bold text-xs rounded-xl shadow transition-all cursor-pointer inline-flex items-center gap-2"
              >
                {isCasting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Compass className="w-3.5 h-3.5" />}
                <span>An Bàn Thái Ất Theo Số</span>
              </button>
            </form>
          )}
        </div>
      ) : (
        /* ========================================================================= */
        /* HIỂN THỊ KẾT QUẢ BÀN THÁI ẤT THẦN SỐ */
        /* ========================================================================= */
        <div ref={fullChartCaptureRef} className="space-y-5 animate-in fade-in duration-500 bg-[#16120E] p-1 sm:p-2 rounded-2xl">
          {/* Top Banner: Thông tin Tổng Quát & Cục Số */}
          <div className="bg-[#1C140D] border border-[#583C1F] rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs font-serif">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xl">👑</span>
              <div>
                <span className="font-bold text-[#FFE28A] text-sm block">
                  {result.epochName.toUpperCase()}
                </span>
                <span className="text-[11px] font-mono text-[#A89882]">
                  Giờ: {result.hourPillar.can} {result.hourPillar.chi} • Ngày: {result.dayPillar.can} {result.dayPillar.chi} • Tháng: {result.monthPillar.can} {result.monthPillar.chi} • Năm: {result.yearPillar.can} {result.yearPillar.chi}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap no-capture">
              <button
                type="button"
                onClick={() => handleCapture("chart")}
                disabled={isCapturing}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-serif font-bold bg-[#2A1D11] hover:bg-[#3E2918] text-[#FFE28A] border border-[#6B4B27] hover:border-[#D4AF37] rounded-xl transition-all cursor-pointer shadow active:scale-95"
                title="Chụp ảnh toàn bộ Bàn Thái Ất Thần Số Cửu Cung"
              >
                {isCapturing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5 text-[#D4AF37]" />}
                <span>Chụp Bàn Thái Ất</span>
              </button>

              <button
                type="button"
                onClick={() => handleCapture("primary")}
                disabled={isCapturing}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-serif font-bold bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20 hover:from-amber-500/30 text-[#FFE28A] border border-[#8C6218] hover:border-[#D4AF37] rounded-xl transition-all cursor-pointer shadow active:scale-95"
                title="Chụp ảnh riêng Quẻ Thái Ất Ban Đầu (Quẻ Chủ)"
              >
                {isCapturing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5 text-[#FFE28A]" />}
                <span>Chụp Quẻ Ban Đầu</span>
              </button>
            </div>
          </div>

          {/* BANNER ĐỐI CHIẾU CHỦ TOÁN - KHÁCH TOÁN */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Thẻ Chủ Toán */}
            <div className="bg-[#1A120B] border border-[#4A331B] rounded-xl p-3.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-serif font-bold text-[#E2B755] flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-amber-400" />
                  CHỦ TOÁN (VĂN XƯƠNG):
                </span>
                <span className="text-xs font-mono font-bold text-[#FFE28A] bg-[#2E1E10] px-2 py-0.5 rounded border border-[#5E3E1E]">
                  Số {result.chuToan.number}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] px-2 py-0.5 rounded bg-amber-950/80 text-amber-200 border border-amber-600/70 font-medium">
                  {result.chuToan.toanType}
                </span>
                <span className="text-[10px] text-[#A89882] font-mono">
                  {result.chuToan.lengthType}
                </span>
              </div>
              <p className="text-[11px] text-[#CDBFA8] font-serif leading-relaxed">
                {result.chuToan.description}
              </p>
            </div>

            {/* Thẻ Cục Diện Chiến Lược Chủ - Khách */}
            <div className="bg-gradient-to-br from-[#26170C] via-[#1B1108] to-[#26170C] border-2 border-[#D4AF37] rounded-xl p-3.5 flex flex-col justify-between space-y-2 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#A89882] tracking-wider block">
                  CỤC DIỆN THỜI THẾ THÁI ẤT
                </span>
                <h4 className="text-base font-serif font-bold text-[#FFE28A] flex items-center gap-1.5 mt-0.5">
                  <Swords className="w-4 h-4 text-[#D4AF37]" />
                  <span>{result.chuKhachBattle.winner}</span>
                </h4>
              </div>
              <p className="text-xs text-[#E8DCC8] font-serif italic leading-snug">
                "{result.chuKhachBattle.advise}"
              </p>
              <div className="text-[10.5px] font-mono text-[#A89882] border-t border-[#46301A] pt-1.5">
                {result.chuKhachBattle.nature}
              </div>
            </div>

            {/* Thẻ Khách Toán */}
            <div className="bg-[#1A120B] border border-[#4A331B] rounded-xl p-3.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-serif font-bold text-[#E2B755] flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-400" />
                  KHÁCH TOÁN (THỦY KÍCH):
                </span>
                <span className="text-xs font-mono font-bold text-[#FFE28A] bg-[#2E1E10] px-2 py-0.5 rounded border border-[#5E3E1E]">
                  Số {result.khachToan.number}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] px-2 py-0.5 rounded bg-amber-950/80 text-amber-200 border border-amber-600/70 font-medium">
                  {result.khachToan.toanType}
                </span>
                <span className="text-[10px] text-[#A89882] font-mono">
                  {result.khachToan.lengthType}
                </span>
              </div>
              <p className="text-[11px] text-[#CDBFA8] font-serif leading-relaxed">
                {result.khachToan.description}
              </p>
            </div>
          </div>

          {/* CỬU CUNG THÁI ẤT (3x3 Grid) */}
          <div className="bg-[#140D07] border border-[#422C16] rounded-2xl p-3 sm:p-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#302010] mb-3">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-[#D4AF37]" />
                <h4 className="font-serif font-bold text-sm text-[#F5EAD4]">
                  BÀN THÁI ẤT CỬU CUNG • THẬP LỤC THẦN AN VỊ
                </h4>
              </div>
              <span className="text-[11px] text-[#A89882] font-serif">
                Bấm vào từng Cung để xem tường tận Thần Tinh & Khí Sắc
              </span>
            </div>

            {/* Layout 3x3 */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                [9, 2, 7], // Hàng 0: Tốn 9 (Đông Nam), Ly 2 (Nam), Khôn 7 (Tây Nam)
                [4, 5, 6], // Hàng 1: Chấn 4 (Đông), Trung Cung 5, Đoài 6 (Tây)
                [3, 8, 1], // Hàng 2: Cấn 3 (Đông Bắc), Khảm 8 (Bắc), Càn 1 (Tây Bắc)
              ].map((row, rIdx) => (
                <React.Fragment key={rIdx}>
                  {row.map((num) => {
                    const cell = result.cells[num];
                    const palace = cell.palace;
                    const isSelected = selectedCellNum === num;

                    return (
                      <div
                        key={num}
                        onClick={() => setSelectedCellNum(isSelected ? null : num)}
                        className={`p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between min-h-[110px] sm:min-h-[130px] ${
                          isSelected
                            ? "bg-[#2E1E12] border-[#FFE28A] ring-2 ring-[#D4AF37]/80 shadow-[0_0_15px_rgba(212,175,55,0.4)] scale-[1.02] z-10"
                            : cell.isTaiYi
                            ? "bg-gradient-to-br from-[#2E1E10] to-[#1E130A] border-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.25)]"
                            : cell.isNguPhuc
                            ? "bg-gradient-to-br from-[#1C261A] to-[#111A10] border-[#4E8C44] shadow-[0_0_10px_rgba(78,140,68,0.25)]"
                            : "bg-[#18100A] border-[#362414] hover:border-[#6B4B27] hover:bg-[#20150D]"
                        }`}
                      >
                        {/* Header ô: Cung số + Tên Bát Quái + Ký hiệu */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-mono font-bold text-[#D4AF37]">
                              {palace.num}
                            </span>
                            <span className="text-xs font-serif font-bold text-[#F5EAD4]">
                              {palace.name} ({palace.chinese})
                            </span>
                          </div>
                          <span className="text-sm text-[#A89882] font-mono">
                            {palace.symbol}
                          </span>
                        </div>

                        {/* Thần Tinh ngự tại cung */}
                        <div className="my-1.5 space-y-1">
                          {cell.spirits.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {cell.spirits.map((sp) => {
                                const isChief = sp === "Thái Ất";
                                const isGood = sp === "Ngũ Phúc" || sp === "Văn Xương";
                                const isBad = sp === "Phi Phù";
                                return (
                                  <span
                                    key={sp}
                                    className={`text-[9.5px] sm:text-[10.5px] px-1.5 py-0.5 rounded font-serif font-bold flex items-center gap-0.5 ${
                                      isChief
                                        ? "bg-gradient-to-r from-[#D4AF37] to-[#A87B25] text-[#120F0B] shadow"
                                        : isGood
                                        ? "bg-emerald-950 text-emerald-300 border border-emerald-600/50"
                                        : isBad
                                        ? "bg-red-950 text-red-300 border border-red-600/50"
                                        : "bg-[#281B10] text-[#E8DCC8] border border-[#4A331E]"
                                    }`}
                                  >
                                    {isChief && "👑 "}
                                    {sp === "Ngũ Phúc" && "🌟 "}
                                    {sp === "Phi Phù" && "⚠️ "}
                                    {sp}
                                  </span>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="text-[10px] text-[#6E5943] font-serif italic">
                              Hư cung tĩnh lặng
                            </span>
                          )}
                        </div>

                        {/* Footer ô: Phương vị & Ngũ hành */}
                        <div className="flex items-center justify-between text-[10px] text-[#A89882] border-t border-[#2D1B0E] pt-1">
                          <span>{palace.direction}</span>
                          <span className="font-mono text-[#D4AF37]">Hành {palace.element}</span>
                        </div>
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>

            {/* Chi tiết ô được chọn */}
            {selectedCellNum !== null && (
              <div className="mt-3 bg-[#1A120A] border border-[#523A21] rounded-xl p-3.5 space-y-2 animate-in fade-in">
                {(() => {
                  const selCell = result.cells[selectedCellNum];
                  const selPalace = selCell.palace;
                  return (
                    <div>
                      <div className="flex items-center justify-between border-b border-[#3E2916] pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base text-[#FFE28A]">{selPalace.symbol}</span>
                          <h5 className="font-serif font-bold text-sm text-[#FFE28A]">
                            CUNG {selPalace.num}: {selPalace.name} ({selPalace.chinese}) • PHƯƠNG {selPalace.direction.toUpperCase()}
                          </h5>
                          <span className="text-[11px] px-2 py-0.5 rounded bg-[#2D1D10] text-[#D4AF37] border border-[#523A21]">
                            Hành {selPalace.element} • Tứ Môn: {selPalace.fourGates}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedCellNum(null)}
                          className="text-xs text-[#A89882] hover:text-[#FFE28A] cursor-pointer"
                        >
                          ✕ Đóng
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 text-xs text-[#CDBFA8] font-serif">
                        <div>
                          <span className="text-[#E2B755] font-bold block mb-1">Tính Chất Cung Vị:</span>
                          <p>{selPalace.nature}</p>
                        </div>
                        <div>
                          <span className="text-[#E2B755] font-bold block mb-1">Thần Tinh Quy Tụ:</span>
                          {selCell.spirits.length > 0 ? (
                            <ul className="space-y-1">
                              {selCell.spirits.map((sp) => {
                                const spObj = THAI_AT_SPIRITS[sp];
                                return (
                                  <li key={sp} className="flex items-start gap-1.5">
                                    <span className="text-[#D4AF37] font-bold">• {sp}:</span>
                                    <span>{spObj?.description || "Thần tinh Thái Ất"}</span>
                                  </li>
                                );
                              })}
                            </ul>
                          ) : (
                            <p>Không có Thần tinh chủ quản, ảnh hưởng gián tiếp qua xung chiếu.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* THÁI ẤT HÓA DỊCH: QUẺ CHỦ & QUẺ BIẾN KINH DỊCH */}
          <div ref={primaryHexCaptureRef} className="bg-gradient-to-r from-[#22170D] via-[#1A1108] to-[#22170D] border-2 border-[#8C6218] rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#442E18] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#D4AF37] text-[#120F0B] flex items-center justify-center font-bold text-base shadow">
                  ☯
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm sm:text-base text-[#FFE28A]">
                    THÁI ẤT HÓA DỊCH • LIÊN KẾT 64 QUẺ KINH DỊCH
                  </h4>
                  <p className="text-[11px] text-[#A89882] font-serif">
                    Thượng Quái từ Cung Thái Ất ({result.upperTrigram.name}) • Hạ Quái từ Cung Thủy Kích ({result.lowerTrigram.name}) • Động Hào {result.changingLine}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleProceedToDetails}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#A87B25] hover:brightness-110 active:scale-95 text-[#14100C] text-xs font-serif font-bold shadow-md cursor-pointer transition-all ml-auto"
              >
                <span>Xem Toàn Văn Luận Đoán 64 Quẻ</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Hiển thị Quẻ Chủ & Quẻ Biến */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Quẻ Ban Đầu */}
              <div className="bg-[#18100A] border border-[#48331E] rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-serif font-bold text-[#FFE28A]">
                    QUẺ CHỦ (BẢN QUÁI):
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#2A1C0E] text-[#D4AF37] border border-[#50371E]">
                    Quẻ #{result.primaryHex.number}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-[#24170E] border border-[#5A3F24] flex flex-col items-center justify-center font-serif text-lg font-bold text-[#FFE28A] shrink-0">
                    {result.primaryHex.hanzi || result.primaryHex.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-serif font-bold text-sm text-[#F5EAD4]">
                      {result.primaryHex.name} ({result.primaryHex.hanzi})
                    </h5>
                    <p className="text-[11px] text-[#CDBFA8] font-serif line-clamp-2 mt-0.5">
                      {result.primaryHex.judgment}
                    </p>
                  </div>
                </div>

                <div className="text-[11px] font-serif text-[#A89882] bg-[#120B06] p-2 rounded border border-[#322010]">
                  <strong>Tượng quẻ:</strong> {result.primaryHex.image}
                </div>
              </div>

              {/* Quẻ Biến */}
              <div className="bg-[#18100A] border border-[#48331E] rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-serif font-bold text-[#FFE28A]">
                    QUẺ BIẾN (TRIỂN VỌNG HẬU VẬN):
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#2A1C0E] text-amber-300 border border-[#50371E]">
                    Quẻ #{result.transformedHex.number} • Động Hào {result.changingLine}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-[#24170E] border border-[#5A3F24] flex flex-col items-center justify-center font-serif text-lg font-bold text-[#FFE28A] shrink-0">
                    {result.transformedHex.hanzi || result.transformedHex.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-serif font-bold text-sm text-[#F5EAD4]">
                      {result.transformedHex.name} ({result.transformedHex.hanzi})
                    </h5>
                    <p className="text-[11px] text-[#CDBFA8] font-serif line-clamp-2 mt-0.5">
                      {result.transformedHex.judgment}
                    </p>
                  </div>
                </div>

                <div className="text-[11px] font-serif text-[#A89882] bg-[#120B06] p-2 rounded border border-[#322010]">
                  <strong>Biến hóa:</strong> Hào {result.changingLine} biến chuyển, dự báo sự việc chuyển biến từ tĩnh sang động, theo chiều hướng {result.chuKhachBattle.winner}.
                </div>
              </div>
            </div>
          </div>

          {/* LUẬN GIẢI TỨ ĐẠI LĨNH VỰC THÁI ẤT */}
          <div className="bg-[#1A120B] border border-[#46301A] rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-[#362413] pb-2.5">
              <Sun className="w-4 h-4 text-[#D4AF37]" />
              <h4 className="font-serif font-bold text-sm text-[#FFE28A]">
                LUẬN GIẢI TỨ TRỤ CỘT THỜI THẾ THEO THÁI ẤT
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs font-serif leading-relaxed">
              {/* 1. Thiên Thời & Vận Thế */}
              <div className="bg-[#140D07] p-3 rounded-xl border border-[#3A2613] space-y-1">
                <span className="text-[#D4AF37] font-bold flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5" />
                  1. THIÊN THỜI & VẬN THẾ:
                </span>
                <p className="text-[#CDBFA8]">{result.luanThienThoi}</p>
              </div>

              {/* 2. Sự Nghiệp & Chiến Lược */}
              <div className="bg-[#140D07] p-3 rounded-xl border border-[#3A2613] space-y-1">
                <span className="text-[#D4AF37] font-bold flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  2. SỰ NGHIỆP & CHIẾN LƯỢC:
                </span>
                <p className="text-[#CDBFA8]">{result.luanSuNghiep}</p>
              </div>

              {/* 3. Tài Lộc & Đầu Tư */}
              <div className="bg-[#140D07] p-3 rounded-xl border border-[#3A2613] space-y-1">
                <span className="text-[#D4AF37] font-bold flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  3. TÀI LỘC & ĐẦU TƯ:
                </span>
                <p className="text-[#CDBFA8]">{result.luanTaiLoc}</p>
              </div>

              {/* 4. Gia Đạo & Nhân Duyên */}
              <div className="bg-[#140D07] p-3 rounded-xl border border-[#3A2613] space-y-1">
                <span className="text-[#D4AF37] font-bold flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5" />
                  4. GIA ĐẠO & NHÂN DUYÊN:
                </span>
                <p className="text-[#CDBFA8]">{result.luanGiaDao}</p>
              </div>
            </div>

            {/* Lời Khuyên Hành Động */}
            <div className="bg-gradient-to-r from-[#2B1B0E] to-[#1C1209] p-3.5 rounded-xl border border-[#6B4B27] flex items-start gap-3">
              <span className="text-xl">📜</span>
              <div className="text-xs font-serif text-[#FFE28A] leading-relaxed">
                <strong className="block text-sm text-[#F5EAD4] mb-0.5">Lời Khuyên Thái Ất:</strong>
                {result.loiKhuyenTongQuat}
              </div>
            </div>

            {/* Nút Xem Chi Tiết Toàn Bộ Quẻ */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleProceedToDetails}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-[#8C6218] via-[#D4AF37] to-[#8C6218] hover:brightness-110 active:scale-95 text-[#14100C] text-xs sm:text-sm font-serif font-bold shadow-lg transition-all cursor-pointer inline-flex items-center justify-center gap-2"
              >
                <span>TIẾP TỤC ĐỌC TOÀN VĂN LUẬN GIẢI QUẺ DỊCH ➔</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ĐIỂN TÍCH & LÝ THUYẾT THÁI ẤT THẦN SỐ */}
      <AnimatePresence>
        {showTheoryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1C140D] border border-[#5A3F24] rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-5 sm:p-6 space-y-4 shadow-2xl text-xs font-serif"
            >
              <div className="flex items-center justify-between border-b border-[#3D2916] pb-3">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-[#D4AF37]" />
                  <h3 className="font-serif font-bold text-base text-[#FFE28A]">
                    TỔNG LUẬN THÁI ẤT THẦN SỐ (太乙神數)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTheoryModal(false)}
                  className="text-[#A89882] hover:text-[#FFE28A] text-lg font-mono cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-[#CDBFA8] leading-relaxed">
                <p>
                  <strong>Thái Ất Thần Số</strong> đứng đầu trong <strong>Tam Thức</strong> (Thái Ất, Kỳ Môn, Lục Nhâm). Cổ nhân có câu: <em>"Thái Ất coi Thiên Thời, Kỳ Môn coi Địa Lợi, Lục Nhâm coi Nhân Sự"</em>. Thái Ất chuyên dùng để chiêm đoán quốc vận, đại vận, thời thế biến động, sự nghiệp tầm cỡ và việc hoạch định chiến lược dài lâu.
                </p>

                <div className="bg-[#140D07] p-3 rounded-xl border border-[#3A2613] space-y-2">
                  <h4 className="text-[#FFE28A] font-bold">1. Thái Ất Cửu Cung</h4>
                  <p>
                    Thái Ất phân bố theo 9 Cung (1 Càn, 2 Ly, 3 Cấn, 4 Chấn, 5 Trung Cung, 6 Đoài, 7 Khôn, 8 Khảm, 9 Tốn). Thần Thái Ất (Thiên Hoàng tinh) chu lưu qua các cung theo chu kỳ âm dương độn.
                  </p>
                </div>

                <div className="bg-[#140D07] p-3 rounded-xl border border-[#3A2613] space-y-2">
                  <h4 className="text-[#FFE28A] font-bold">2. Chủ Đại Tướng & Khách Đại Tướng</h4>
                  <p>
                    <strong>Văn Xương</strong> đại diện cho Chủ Đại Tướng (bên ta, nội bộ, quân vương). <strong>Thủy Kích</strong> đại diện cho Khách Đại Tướng (ngoại bang, đối thủ, biến cố bên ngoài).
                  </p>
                </div>

                <div className="bg-[#140D07] p-3 rounded-xl border border-[#3A2613] space-y-2">
                  <h4 className="text-[#FFE28A] font-bold">3. Chủ Toán - Khách Toán</h4>
                  <p>
                    Toán số đo lường thế lực của hai bên. Có các loại: <strong>Toán Thuần</strong> (đại cát quang minh), <strong>Toán Hòa</strong> (hòa hợp liên minh), <strong>Toán Đơn</strong> (độc lực tự cường), <strong>Toán Trùng</strong> (ngưng trệ bất an), <strong>Toán Tạp</strong> (đa sự cần minh bạch).
                  </p>
                </div>

                <div className="bg-[#140D07] p-3 rounded-xl border border-[#3A2613] space-y-2">
                  <h4 className="text-[#FFE28A] font-bold">4. Ngũ Phúc & Cát Thần</h4>
                  <p>
                    <strong>Ngũ Phúc</strong> là đệ nhất cát thần trong Thái Ất, ngự cung nào thì mang lại vượng khí, hóa hung thành cát, vạn sự hanh thông.
                  </p>
                </div>
              </div>

              <div className="pt-2 text-right border-t border-[#3D2916]">
                <button
                  type="button"
                  onClick={() => setShowTheoryModal(false)}
                  className="px-5 py-2 bg-[#2E1E12] hover:bg-[#3D2918] text-[#FFE28A] border border-[#5A3F24] rounded-xl font-bold transition-all cursor-pointer"
                >
                  Đã Hiểu
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EXPORT MODAL CHỤP ẢNH */}
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
