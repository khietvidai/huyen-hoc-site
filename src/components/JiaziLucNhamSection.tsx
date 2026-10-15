import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Compass,
  Sparkles,
  ChevronDown,
  Clock,
  ChevronRight,
  Calendar,
  RotateCcw,
  X,
  Camera,
  Download,
  Loader2,
} from "lucide-react";
import { JiaziD12Dice } from "./JiaziD12Dice";
import { LucNhamHoaDichSection } from "./LucNhamHoaDichSection";
import { BaziThucThiThien } from "./BaziThucThiThien";
import { Hexagram } from "../types";
import { captureElementToPng, downloadDataUrlAsPng } from "../utils/captureHelper";
import { ExportImageModal } from "./ExportImageModal";
import {
  CAN_LIST,
  CHI_LIST,
  CAN_MAP,
  CHI_MAP,
  DUONG_CAN_NAMES,
  AM_CAN_NAMES,
  DUONG_CHI_NAMES,
  AM_CHI_NAMES,
  getCurrentBaziPillars,
  PillarItem,
} from "../data/baziConstants";
import { SIXTY_JIAZI, JiaziEnrichedEntry } from "../data/jiazi";

const STORAGE_KEY_LUCNHAM_BAZI_HOAGIAP = "iching_lucnham_bazi_hoagiap";
const STORAGE_KEY_LUCNHAM_BAZI_BOCQUE = "iching_lucnham_bazi_bocque";

interface JiaziLucNhamSectionProps {
  dayCan?: string;
  dayChi?: string;
  hourCan?: string;
  hourChi?: string;
  selectedHoatThoiBranch?: string;
  onSelectHoatThoi?: (chiName: string) => void;
  onApplyHoatThoi?: (chiName: string) => void;
  onProceedToDetails?: (
    primary: Hexagram,
    changingLines: number[],
    transformed?: Hexagram,
    summary?: string
  ) => void;
  className?: string;
  defaultExpanded?: boolean;
  showHoaDich?: boolean;
  storageKey?: string;
  storageScope?: "hoagiap" | "bocque";
  mode?: "hoagiap" | "bocque";
  boardContextLabel?: string;
  id?: string;
  showLuuNienThien?: boolean;
  onPillarsChange?: (pillars: [PillarItem, PillarItem, PillarItem, PillarItem]) => void;
  onSelectJiazi?: (jiaziId: string) => void;
}

// 4 Trụ Bát Tự Lục Nhâm: Giờ (0), Ngày (1), Tháng (2), Năm (3) - Từ Giờ tới Năm (trái qua phải)
const LUCNHAM_PILLAR_INFO = [
  {
    idx: 0,
    key: "hour",
    title: "Trụ Giờ (Chiêm Thời)",
    sub: "Chiêm Thời (時柱)",
    role: "Giờ Lập Quẻ / Chiêm Thời",
  },
  {
    idx: 1,
    key: "day",
    title: "Trụ Ngày",
    sub: "Nhật Trụ (日柱)",
    role: "Cốt Lõi Tứ Khóa (Can & Chi)",
  },
  {
    idx: 2,
    key: "month",
    title: "Trụ Tháng",
    sub: "Nguyệt Trụ (月柱)",
    role: "Nguyệt Kiến (đối ứng Nguyệt Tướng)",
  },
  {
    idx: 3,
    key: "year",
    title: "Trụ Năm",
    sub: "Niên Trụ (年柱)",
    role: "Thái Tuế (Niên Thần giám định)",
  },
];

export const JiaziLucNhamSection: React.FC<JiaziLucNhamSectionProps> = ({
  dayCan: propDayCan,
  dayChi: propDayChi,
  hourCan: propHourCan,
  hourChi: propHourChi,
  selectedHoatThoiBranch,
  onSelectHoatThoi,
  onApplyHoatThoi,
  onProceedToDetails,
  className = "",
  defaultExpanded = false,
  showHoaDich = false,
  storageKey,
  storageScope,
  mode = "hoagiap",
  boardContextLabel,
  id,
  showLuuNienThien = true,
  onPillarsChange,
  onSelectJiazi,
}) => {
  const effectiveScope: "hoagiap" | "bocque" = storageScope || (mode === "bocque" ? "bocque" : "hoagiap");
  const effectiveStorageKey =
    storageKey ||
    (effectiveScope === "bocque" ? STORAGE_KEY_LUCNHAM_BAZI_BOCQUE : STORAGE_KEY_LUCNHAM_BAZI_HOAGIAP);
  const effectiveOpenKey = `iching_lucnham_open_${effectiveScope}`;

  // Trạng thái thu gọn / mở rộng: khi truyền defaultExpanded = true thì mở sẵn
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    if (defaultExpanded) return true;
    try {
      const saved = localStorage.getItem(effectiveOpenKey);
      if (saved !== null) return saved === "true";
    } catch {}
    return false;
  });

  // BÁT TỰ CỦA BẢNG LỤC NHÂM (NĂM • THÁNG • NGÀY • GIỜ)
  // Hoàn toàn độc lập giữa Tab Hoa Giáp và Chỗ Bốc Quẻ
  const [lucNhamPillars, setLucNhamPillars] = useState<[PillarItem, PillarItem, PillarItem, PillarItem]>(() => {
    try {
      const saved = localStorage.getItem(effectiveStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 4) {
          return parsed as [PillarItem, PillarItem, PillarItem, PillarItem];
        }
      }
    } catch {
      // ignore
    }
    const curr = getCurrentBaziPillars();
    if (propDayCan && propDayChi) curr[1] = { can: propDayCan, chi: propDayChi };
    if (propHourCan && propHourChi) {
      curr[0] = { can: propHourCan, chi: propHourChi };
    }
    return curr;
  });

  // Slot Can/Chi đang mở modal chọn (giống y chang bảng Bát Tự phía trên)
  const [activeSlot, setActiveSlot] = useState<{
    colIndex: number;
    type: "can" | "chi";
  } | null>(null);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Refs phục vụ chụp ảnh Tổng Lục Nhâm, Bát Tự Lục Nhâm và Lưu Niên Thiên
  const lucNhamContainerRef = useRef<HTMLDivElement>(null);
  const lucNhamBaziRef = useRef<HTMLDivElement>(null);
  const lucNhamLuuNienRef = useRef<HTMLDivElement>(null);

  // Trạng thái modal xuất hình ảnh
  const [isCapturing, setIsCapturing] = useState<"tong" | "bazi" | "luunien" | null>(null);
  const [exportedImageUrl, setExportedImageUrl] = useState<string | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState<boolean>(false);
  const [exportModalTitle, setExportModalTitle] = useState<string>("");
  const [exportModalFilename, setExportModalFilename] = useState<string>("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  // Hàm chụp hoặc tải ảnh Bàn Lục Nhâm, Bát Tự Lục Nhâm hoặc Lưu Niên Thiên
  const handleCaptureLucNham = async (
    target: "tong" | "bazi" | "luunien",
    isDirectDownload: boolean = false
  ) => {
    if (isCapturing) return;
    try {
      setIsCapturing(target);
      // Tự động mở rộng bảng nếu đang thu gọn để lấy trọn vẹn khung hình
      if (!isOpen) {
        setIsOpen(true);
        await new Promise((r) => setTimeout(r, 320));
      } else {
        await new Promise((r) => setTimeout(r, 150));
      }

      let targetEl =
        target === "tong"
          ? lucNhamContainerRef.current
          : target === "bazi"
          ? lucNhamBaziRef.current
          : lucNhamLuuNienRef.current;

      if (!targetEl) {
        await new Promise((r) => setTimeout(r, 250));
        targetEl =
          target === "tong"
            ? lucNhamContainerRef.current
            : target === "bazi"
            ? lucNhamBaziRef.current
            : lucNhamLuuNienRef.current;
      }

      if (!targetEl) {
        showToast("Không tìm thấy vùng cần xuất ảnh. Vui lòng thử lại!");
        return;
      }

      const dataUrl = await captureElementToPng(targetEl, {
        backgroundColor: "#16120D",
        pixelRatio: 2,
      });

      if (!dataUrl || dataUrl === "data:," || dataUrl.length < 100) {
        throw new Error("Dữ liệu ảnh rỗng");
      }

      const title =
        target === "tong"
          ? `Bàn Lục Nhâm Đại Độn (Ngày ${effectiveDayCan} ${effectiveDayChi} - Giờ ${effectiveHourCan} ${effectiveHourChi})`
          : target === "bazi"
          ? `Bát Tự Bảng Lục Nhâm (${lucNhamPillars[1]?.can || ""} ${lucNhamPillars[1]?.chi || ""})`
          : `Lưu Niên Thiên (${lucNhamPillars[1]?.can || ""} ${lucNhamPillars[1]?.chi || ""})`;
      const filename =
        target === "tong"
          ? `tong-luc-nham-${effectiveDayCan}-${effectiveDayChi}.png`
          : target === "bazi"
          ? `bat-tu-luc-nham-${effectiveDayCan}-${effectiveDayChi}.png`
          : `luu-nien-thien-luc-nham-${effectiveDayCan}-${effectiveDayChi}.png`;

      setExportedImageUrl(dataUrl);
      setExportModalTitle(title);
      setExportModalFilename(filename);

      if (isDirectDownload) {
        downloadDataUrlAsPng(dataUrl, filename);
        showToast(`Đã chụp và tải ảnh về máy thành công: ${filename}!`);
      } else {
        setExportModalOpen(true);
        showToast(`Đã chụp ảnh thành công: ${title}!`);
      }
    } catch (err) {
      console.error("Lỗi khi chụp hình Lục Nhâm:", err);
      showToast("Không thể xuất ảnh lúc này. Vui lòng thử lại!");
    } finally {
      setIsCapturing(null);
    }
  };

  const updateLucNhamPillars = (
    newPillars: [PillarItem, PillarItem, PillarItem, PillarItem],
    msg?: string
  ) => {
    setLucNhamPillars(newPillars);
    try {
      localStorage.setItem(effectiveStorageKey, JSON.stringify(newPillars));
    } catch {
      // ignore
    }
    if (onPillarsChange) {
      onPillarsChange(newPillars);
    }
    if (msg) showToast(msg);
  };

  useEffect(() => {
    try {
      localStorage.setItem(effectiveOpenKey, String(isOpen));
    } catch {
      // ignore
    }
  }, [isOpen, effectiveOpenKey]);

  // Lắng nghe sự kiện chuyển đến Lục Nhâm Đại Độn từ Phương Thức Thỉnh Quẻ
  useEffect(() => {
    const handleJump = () => {
      if (effectiveScope === "hoagiap") {
        setIsOpen(true);
        setTimeout(() => {
          const el = document.getElementById("lucnham-chart-area-hoagiap") || document.getElementById("lucnham-chart-area");
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 100);
      }
    };
    window.addEventListener("jump-to-lucnham", handleJump);
    return () => window.removeEventListener("jump-to-lucnham", handleJump);
  }, [effectiveScope]);

  // Lấy Ngày Giờ Hiện Tại cho Bát Tự Lục Nhâm (hoàn toàn độc lập theo từng bảng)
  const handleSetCurrentDateTime = () => {
    const curPillars = getCurrentBaziPillars();
    updateLucNhamPillars(
      curPillars,
      `Đã nạp chính xác Bát Tự Lục Nhâm [${effectiveScope === "bocque" ? "Bốc Quẻ" : "Tab Hoa Giáp"}] theo thời gian thực!`
    );
  };

  // Đặt lại Bát Tự Lục Nhâm về mặc định
  const handleResetDefault = () => {
    const defaultPillars: [PillarItem, PillarItem, PillarItem, PillarItem] = [
      { can: "Kỷ", chi: "Tỵ" },
      { can: "Kỷ", chi: "Dậu" },
      { can: "Đinh", chi: "Dậu" },
      { can: "Bính", chi: "Ngọ" },
    ];
    updateLucNhamPillars(
      defaultPillars,
      `Đã đặt lại Bát Tự Lục Nhâm [${effectiveScope === "bocque" ? "Bốc Quẻ" : "Tab Hoa Giáp"}] về chuẩn mẫu.`
    );
  };

  // Xử lý chọn Thiên Can cho trụ colIndex (tuân thủ luật phối tượng âm dương như bảng trên)
  const handleSelectCan = (colIndex: number, newCan: string) => {
    const next = [...lucNhamPillars] as [PillarItem, PillarItem, PillarItem, PillarItem];
    const canData = CAN_MAP.get(newCan);
    let updatedChi = next[colIndex].chi;

    if (canData) {
      const isAm = canData.polarity === "am";
      if (updatedChi) {
        const chiData = CHI_MAP.get(updatedChi);
        if (chiData && chiData.polarity !== canData.polarity) {
          const validChis = isAm ? AM_CHI_NAMES : DUONG_CHI_NAMES;
          updatedChi = validChis[0];
          showToast(
            `Đã chọn Can ${isAm ? "Âm" : "Dương"} [${newCan}] ➔ Địa Chi bên dưới tự động đổi thành [${updatedChi}] để tuân thủ luật phối tượng!`
          );
        }
      }
    }

    next[colIndex] = { can: newCan, chi: updatedChi };

    // Nếu đổi Can Ngày (trụ 1): tính lại Can Giờ theo Ngũ Thử Độn nếu có Chi Giờ
    if (colIndex === 1 && next[0].chi) {
      const dayCanIdx = CAN_LIST.findIndex((c) => c.name === newCan);
      const hourChiIdx = CHI_LIST.findIndex((c) => c.name === next[0].chi);
      if (dayCanIdx >= 0 && hourChiIdx >= 0) {
        const baseHourCan = (dayCanIdx % 5) * 2;
        const newHourCan = CAN_LIST[(baseHourCan + hourChiIdx) % 10].name;
        next[0] = { ...next[0], can: newHourCan };
      }
    }

    updateLucNhamPillars(next);
    setActiveSlot(null);
  };

  // Xử lý chọn Địa Chi cho trụ colIndex
  const handleSelectChi = (colIndex: number, newChi: string) => {
    const next = [...lucNhamPillars] as [PillarItem, PillarItem, PillarItem, PillarItem];
    const currentCan = next[colIndex].can;
    const canData = CAN_MAP.get(currentCan);
    const chiData = CHI_MAP.get(newChi);

    let updatedCan = currentCan;
    if (chiData && canData && chiData.polarity !== canData.polarity) {
      const isChiAm = chiData.polarity === "am";
      const validCans = isChiAm ? AM_CAN_NAMES : DUONG_CAN_NAMES;
      updatedCan = validCans[0];
      showToast(
        `Đã chọn Chi ${isChiAm ? "Âm" : "Dương"} [${newChi}] ➔ Can bên trên tự động đổi thành [${updatedCan}] để tuân thủ luật phối tượng!`
      );
    }

    next[colIndex] = { can: updatedCan, chi: newChi };

    // Nếu đổi Chi Giờ (trụ 0): tính lại Can Giờ theo Can Ngày hiện tại (Ngũ Thử Độn)
    if (colIndex === 0 && next[1].can) {
      const dayCanIdx = CAN_LIST.findIndex((c) => c.name === next[1].can);
      const hourChiIdx = CHI_LIST.findIndex((c) => c.name === newChi);
      if (dayCanIdx >= 0 && hourChiIdx >= 0) {
        const baseHourCan = (dayCanIdx % 5) * 2;
        const newHourCan = CAN_LIST[(baseHourCan + hourChiIdx) % 10].name;
        next[0] = { can: newHourCan, chi: newChi };
      }
    }

    updateLucNhamPillars(next);
    setActiveSlot(null);
  };

  // Áp dụng Hoạt Thời (chi gieo xí ngầu 12 mặt) vào Trụ Giờ của Bát Tự Lục Nhâm
  const handleApplyHoatThoi = (newHourChi: string) => {
    const next = [...lucNhamPillars] as [PillarItem, PillarItem, PillarItem, PillarItem];
    const dayCanIdx = CAN_LIST.findIndex((c) => c.name === next[1].can);
    const hourChiIdx = CHI_LIST.findIndex((c) => c.name === newHourChi);
    let newHourCan = next[0].can;
    if (dayCanIdx >= 0 && hourChiIdx >= 0) {
      const baseHourCan = (dayCanIdx % 5) * 2;
      newHourCan = CAN_LIST[(baseHourCan + hourChiIdx) % 10].name;
    }
    next[0] = { can: newHourCan, chi: newHourChi };
    updateLucNhamPillars(next, `Đã áp dụng Hoạt Thời [${newHourCan} ${newHourChi}] vào Trụ Giờ Bát Tự Lục Nhâm!`);
    if (onApplyHoatThoi) {
      onApplyHoatThoi(newHourChi);
    }
  };

  // Tự động khởi tạo Trụ Giờ nếu có propHourChi ban đầu từ bên ngoài và chưa có cấu hình lưu
  useEffect(() => {
    if (propHourChi && !localStorage.getItem(effectiveStorageKey) && propHourChi !== lucNhamPillars[0]?.chi) {
      handleApplyHoatThoi(propHourChi);
    }
  }, [propHourChi, effectiveStorageKey]);

  // Tìm Hoa Giáp theo Can Chi
  const getMatchedJiazi = (can: string, chi: string): JiaziEnrichedEntry | undefined => {
    if (!can || !chi) return undefined;
    return SIXTY_JIAZI.find((j) => j.can === can && j.chi === chi);
  };

  // Can Chi hiệu dụng truyền vào Bàn Lục Nhâm
  const effectiveDayCan = lucNhamPillars[1]?.can || "Kỷ";
  const effectiveDayChi = lucNhamPillars[1]?.chi || "Dậu";
  const effectiveHourCan = lucNhamPillars[0]?.can || "Kỷ";
  const effectiveHourChi = lucNhamPillars[0]?.chi || "Tỵ";

  return (
    <div
      id={id || (effectiveScope === "bocque" ? "lucnham-chart-area-bocque" : "lucnham-chart-area-hoagiap")}
      ref={lucNhamContainerRef}
      className={`border border-[#3D3021] bg-gradient-to-b from-[#1C1711] via-[#16120D] to-[#120F0B] rounded-2xl shadow-xl overflow-hidden transition-all duration-300 ${className}`}
    >
      {/* Toast thông báo */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-800 text-white font-serif font-bold text-xs shadow-2xl border border-amber-400 flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-200" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================
          HEADER BAR: PHẦN LỤC NHÂM ĐẠI ĐỘN
          ======================================================== */}
      <div className="px-4 py-3.5 sm:px-6 sm:py-4 border-b border-[#2E2419] flex flex-wrap items-center justify-between gap-3 bg-[#1F1912]/80 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#2A1E14] border border-[#52412E] text-[#E2B755] shadow-inner">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-bold text-[#F5EAD4] font-serif tracking-wide flex items-center gap-2 flex-wrap">
                LỤC NHÂM ĐẠI ĐỘN
                <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-[#2E2215] text-[#D4AF37] border border-[#533F27]">
                  {effectiveScope === "bocque" ? "Bảng Bốc Quẻ (Độc Lập)" : "Bảng Tab Hoa Giáp (Độc Lập)"}
                </span>
                <span className="text-[10px] text-[#A89882] font-normal hidden sm:inline">
                  {effectiveScope === "bocque" ? "(Chiêm Đoán Sự Vụ)" : "(Tam Thức • Không Hóa Dịch)"}
                </span>
              </h2>
            </div>
            <p className="text-[11px] sm:text-xs text-[#9E8E7A] mt-0.5 line-clamp-1 sm:line-clamp-none">
              {effectiveScope === "bocque"
                ? "Thiên Địa Bàn • Tứ Khóa • Tam Truyền • 12 Thần Tướng • Thần Sát (Dành riêng cho Bốc Quẻ)"
                : "Thập Nhị Thiên Tướng • Nguyệt Tướng • Xí Ngầu Hoạt Thời 12 Mặt • Thiên Địa Bàn • Tứ Khóa • Tam Truyền (Dành riêng cho Tab Hoa Giáp)"}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap ml-auto">
          {/* Nút Chụp Tổng Lục Nhâm */}
          <button
            type="button"
            onClick={() => handleCaptureLucNham("tong")}
            disabled={isCapturing !== null}
            className="no-capture flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-[#2F2113] to-[#3D2B19] hover:from-[#3D2C1B] hover:to-[#4D3823] text-amber-200 border border-[#5E4327] hover:border-[#D4AF37] transition-all cursor-pointer shadow-sm active:scale-95 whitespace-nowrap"
            title="Chụp ảnh toàn bộ bảng Lục Nhâm Đại Độn (Bát Tự, Thiên Địa Bàn, Tứ Khóa, Tam Truyền)"
          >
            {isCapturing === "tong" ? (
              <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            ) : (
              <Camera className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>Chụp Tổng Lục Nhâm</span>
          </button>

          {/* Nút Tải Tổng Lục Nhâm Trực Tiếp */}
          <button
            type="button"
            onClick={() => handleCaptureLucNham("tong", true)}
            disabled={isCapturing !== null}
            className="no-capture flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 border border-amber-400 transition-all cursor-pointer shadow-md active:scale-95 whitespace-nowrap"
            title="Chụp và tải trực tiếp tệp ảnh PNG toàn bộ bảng Lục Nhâm về máy"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải Tổng Lục Nhâm</span>
          </button>

          {/* Nút Thu Gọn / Mở Rộng */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#261E16] text-[#D4AF37] border border-[#483724] hover:bg-[#34281D] hover:border-[#D4AF37] transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <span>{isOpen ? "Thu Gọn" : "Mở Bàn Lục Nhâm"}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* ========================================================
          THANH TÓM TẮT KHI Ở TRẠNG THÁI THU GỌN
          ======================================================== */}
      {!isOpen && (
        <div className="px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-3 text-xs bg-[#17120C]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded bg-[#2E1E12] text-[#E2B755] font-semibold border border-[#44301D] flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>Trạng thái: Thu gọn</span>
            </span>
            <span className="text-[#8C7D6B] hidden sm:inline">•</span>
            <span className="text-[#A89882] text-[11px] flex items-center gap-1.5 flex-wrap">
              <span>Bát Tự Lục Nhâm:</span>
              <strong className="text-purple-300 font-serif">
                {lucNhamPillars[3].can} {lucNhamPillars[3].chi} (Năm)
              </strong>
              <span className="text-[#6D5A46]">•</span>
              <strong className="text-emerald-300 font-serif">
                {lucNhamPillars[2].can} {lucNhamPillars[2].chi} (Tháng)
              </strong>
              <span className="text-[#6D5A46]">•</span>
              <strong className="text-amber-300 font-serif">
                {lucNhamPillars[1].can} {lucNhamPillars[1].chi} (Ngày)
              </strong>
              <span className="text-[#6D5A46]">•</span>
              <strong className="text-sky-300 font-serif">
                {lucNhamPillars[0].can} {lucNhamPillars[0].chi} (Giờ)
              </strong>
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="text-[#D4AF37] hover:underline flex items-center gap-1 cursor-pointer font-medium ml-auto"
          >
            <span>Mở Bàn Lục Nhâm</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ========================================================
          BODY NỘI DUNG KHI MỞ RỘNG
          ======================================================== */}
      {isOpen && (
        <div className="p-3 sm:p-5 space-y-4">
          {/* =================================================================
              BÁT TỰ CỦA BẢNG LỤC NHÂM (NĂM • THÁNG • NGÀY • GIỜ)
              - 2 Bảng không liên quan tới nhau
              - Hình Can Chi thiết kế GIỐNG Y CHANG BẢNG BÁT TỰ TRÊN KIA:
                + Card Thiên Can lớn với icon biểu tượng, font chữ, màu sắc ngũ hành
                + Card Địa Chi lớn với emoji linh vật 12 con giáp, chữ Hán
                + Mũi tên ⇅ kết nối âm dương
                + Thẻ Hoa Giáp Nạp Âm kết quả
                + Nhấp vào ô Can/Chi để mở modal chọn trực quan y hệt
              ================================================================= */}
          <div
            ref={lucNhamBaziRef}
            className="p-3.5 sm:p-5 rounded-2xl bg-gradient-to-b from-[#211810] via-[#1B130B] to-[#140E07] border-2 border-[#5C4226] shadow-xl space-y-4"
          >
            {/* Header của Bát Tự Lục Nhâm */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#3B2917] gap-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 text-[#F5EAD4] flex items-center justify-center shadow shrink-0">
                  <Calendar className="w-4 h-4 text-amber-200" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-bold text-[#F5EAD4] font-serif tracking-wide">
                      BÁT TỰ BẢNG LỤC NHÂM • {effectiveScope === "bocque" ? "CHỖ BỐC QUẺ" : "TAB HOA GIÁP"}
                    </h3>
                    <span className="text-[9.5px] px-2 py-0.5 rounded-full bg-amber-950/90 text-amber-300 border border-amber-600/70 font-semibold">
                      {effectiveScope === "bocque" ? "Bảng Bốc Quẻ Độc Lập" : "Bảng Hoa Giáp Độc Lập • Nhấp Ô Để Chọn"}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#A89882] mt-0.5">
                    Bát Tự riêng của bảng này ({effectiveScope === "bocque" ? "Dành cho Chỗ Bốc Quẻ" : "Dành cho Tab Hoa Giáp"}): Khởi Tứ Khóa (Nhật Can, Nhật Chi) và xác định Thời Thần (Trụ Giờ / Hoạt Thời).
                  </p>
                </div>
              </div>

              {/* Action Buttons của Bát Tự Lục Nhâm */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto flex-wrap">
                {/* Nút Chụp Riêng Bát Tự Lục Nhâm */}
                <button
                  type="button"
                  onClick={() => handleCaptureLucNham("bazi")}
                  disabled={isCapturing !== null}
                  className="no-capture flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#271E15] hover:bg-[#382B1E] text-amber-200 border border-[#523F27] hover:border-[#D4AF37] transition-all cursor-pointer shadow-sm active:scale-95 whitespace-nowrap"
                  title="Chụp ảnh riêng 4 Trụ Bát Tự Lục Nhâm (Giờ • Ngày • Tháng • Năm)"
                >
                  {isCapturing === "bazi" ? (
                    <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  ) : (
                    <Camera className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span>Chụp Bát Tự Lục Nhâm</span>
                </button>

                {/* Nút Tải Riêng Bát Tự Lục Nhâm */}
                <button
                  type="button"
                  onClick={() => handleCaptureLucNham("bazi", true)}
                  disabled={isCapturing !== null}
                  className="no-capture flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#3A2A1A] hover:bg-[#4C3622] text-[#F3D58C] border border-[#6B4F2D] hover:border-[#D4AF37] transition-all cursor-pointer shadow-sm active:scale-95 whitespace-nowrap"
                  title="Chụp và tải trực tiếp ảnh 4 Trụ Bát Tự Lục Nhâm về máy"
                >
                  <Download className="w-3.5 h-3.5 text-amber-300" />
                  <span>Tải Bát Tự Lục Nhâm</span>
                </button>

                <button
                  type="button"
                  onClick={handleSetCurrentDateTime}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#2D1F13] hover:bg-[#3D2C1B] text-[#E2B755] border border-[#52402A] hover:border-[#D4AF37] transition-all cursor-pointer shadow-sm active:scale-95"
                  title="Nạp ngày giờ thực tế hiện tại cho riêng Bát Tự Lục Nhâm"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ngày Giờ Hiện Tại</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetDefault}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-[#20160E] hover:bg-[#2F1F13] text-[#A89882] hover:text-[#E2B755] border border-[#44301D] transition-all cursor-pointer active:scale-95"
                  title="Đặt lại Bát Tự Lục Nhâm mẫu chuẩn"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Mặc Định</span>
                </button>
              </div>
            </div>

            {/* 4 TRỤ BÁT TỰ LỤC NHÂM: THIẾT KẾ GIỐNG Y CHANG BẢNG BÁT TỰ PHÍA TRÊN */}
            {/* Hiển thị từ Giờ tới Năm (Trái qua phải) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5">
              {LUCNHAM_PILLAR_INFO.map((col) => {
                const currentItem = lucNhamPillars[col.idx] || { can: "Giáp", chi: "Tý" };
                const canData = CAN_MAP.get(currentItem.can);
                const chiData = CHI_MAP.get(currentItem.chi);
                const matchedJiazi = getMatchedJiazi(currentItem.can, currentItem.chi);

                return (
                  <div
                    key={col.key}
                    className={`flex flex-col border rounded-xl sm:rounded-2xl p-2 sm:p-3 shadow-md transition-colors relative ${
                      col.idx === 1
                        ? "bg-[#1B140D] border-[#553E26] hover:border-[#D4AF37]"
                        : "bg-[#18130E] border-[#332619] hover:border-[#4D3A26]"
                    }`}
                  >
                    {/* Header Cột: Tên Trụ & Chữ Hán Subtitle */}
                    <div className="text-center pb-1.5 mb-1.5 sm:pb-2 sm:mb-2 border-b border-[#281E14]">
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-xs sm:text-sm font-bold text-[#E2B755] font-serif whitespace-nowrap">
                          {col.title}
                        </span>
                      </div>
                      <div className="text-[8.5px] sm:text-[10px] text-[#8C7D6B] font-mono whitespace-nowrap truncate">
                        {col.sub}
                      </div>
                    </div>

                    {/* Ô TRÊN: THIÊN CAN (Hình Can giống hệt Bát Tự trên kia) */}
                    <div className="mb-1 sm:mb-2">
                      <div
                        onClick={() => setActiveSlot({ colIndex: col.idx, type: "can" })}
                        className={`relative min-h-[46px] sm:min-h-[64px] rounded-xl border flex flex-col items-center justify-center p-1 sm:p-2 text-center cursor-pointer transition-all duration-200 select-none group ${
                          canData
                            ? "bg-gradient-to-b from-[#251D14] to-[#1C160F] border-[#5A4328] hover:border-[#E2B755] shadow-[0_2px_8px_rgba(0,0,0,0.4)] hover:scale-[1.02]"
                            : "bg-[#14100C]/70 border-dashed border-[#3D3021] hover:border-[#D4AF37] hover:bg-[#1A140F]"
                        }`}
                        title={`Nhấp để chọn Thiên Can cho ${col.title}`}
                      >
                        {canData ? (
                          <div className="flex flex-col sm:flex-row items-center justify-center gap-0 sm:gap-1.5 sm:gap-2">
                            <span className="text-sm sm:text-2xl leading-none" title={canData.symbol}>
                              {canData.emoji}
                            </span>
                            <span
                              className={`text-sm sm:text-2xl font-serif font-bold ${canData.colorText} leading-none mt-0.5 sm:mt-0`}
                            >
                              {canData.name}
                            </span>
                            <span className="hidden md:inline text-xs sm:text-sm text-[#8C7D6B] font-serif">
                              ({canData.chinese})
                            </span>
                          </div>
                        ) : (
                          <div className="text-center">
                            <span className="text-[9px] sm:text-xs text-[#A89882] group-hover:text-[#E2B755] font-medium">
                              + Chọn Can
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Mũi Tên Kết Nối Âm Dương: ⇅ */}
                    <div className="flex items-center justify-center my-0 sm:my-0.5 leading-none">
                      <span className="text-[9px] sm:text-[11px] text-[#6E5A44] font-mono">⇅</span>
                    </div>

                    {/* Ô DƯỚI: ĐỊA CHI (Hình Chi giống hệt Bát Tự trên kia) */}
                    <div className="mb-1.5 sm:mb-2.5">
                      <div
                        onClick={() => setActiveSlot({ colIndex: col.idx, type: "chi" })}
                        className={`relative min-h-[46px] sm:min-h-[64px] rounded-xl border flex flex-col items-center justify-center p-1 sm:p-2 text-center cursor-pointer transition-all duration-200 select-none group ${
                          chiData
                            ? "bg-gradient-to-b from-[#231A12] to-[#1A140E] border-[#5A4328] hover:border-[#E2B755] shadow-[0_2px_8px_rgba(0,0,0,0.4)] hover:scale-[1.02]"
                            : "bg-[#14100C]/70 border-dashed border-[#3D3021] hover:border-[#D4AF37] hover:bg-[#1A140F]"
                        }`}
                        title={`Nhấp để chọn Địa Chi cho ${col.title}`}
                      >
                        {chiData ? (
                          <div className="flex flex-col sm:flex-row items-center justify-center gap-0 sm:gap-1.5 sm:gap-2">
                            <span className="text-sm sm:text-2xl leading-none">
                              {chiData.emoji}
                            </span>
                            <span className="text-sm sm:text-2xl font-serif font-bold text-[#F5EAD4] leading-none mt-0.5 sm:mt-0">
                              {chiData.name}
                            </span>
                            <span className="hidden md:inline text-xs sm:text-sm text-[#8C7D6B] font-serif">
                              ({chiData.chinese})
                            </span>
                          </div>
                        ) : (
                          <div className="text-center">
                            <span className="text-[9px] sm:text-xs text-[#A89882] group-hover:text-[#E2B755] font-medium">
                              + Chọn Chi
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* HOA GIÁP & NẠP ÂM KẾT QUẢ CỦA TRỤ NÀY */}
                    <div className="mt-auto pt-1.5 sm:pt-2 border-t border-[#251D14]">
                      {matchedJiazi ? (
                        <div className="bg-[#201810] border border-[#483724] rounded-lg sm:rounded-xl p-1.5 sm:p-2 flex flex-col gap-0.5 sm:gap-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] sm:text-[10px] text-[#D4AF37] font-bold truncate">
                              #{matchedJiazi.order} {matchedJiazi.name}
                            </span>
                            <span className="hidden sm:inline text-[8.5px] px-1 py-0.2 rounded bg-[#15110C] text-[#A89882] whitespace-nowrap">
                              {matchedJiazi.branchGroup}
                            </span>
                          </div>
                          <div className="text-[8.5px] sm:text-[9.5px] text-[#C4B49F] truncate">
                            {matchedJiazi.elementNapAm}
                          </div>
                          <div className="text-[8px] sm:text-[8.5px] text-[#E2B755] font-semibold italic truncate">
                            {col.role}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-[#19130D] border border-dashed border-[#3D2E1C] rounded-lg sm:rounded-xl p-1.5 sm:p-2 text-center">
                          <span className="text-[8.5px] sm:text-[9.5px] text-[#7A6A55] italic">
                            Chưa phối Can Chi
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* =================================================================
              MODAL CHỌN CAN / CHI (GIỐNG Y CHANG BẢNG BÁT TỰ PHÍA TRÊN)
              ================================================================= */}
          {activeSlot && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
              <div className="w-full max-w-xl rounded-2xl bg-[#1A120A] border-2 border-[#D4AF37] p-5 sm:p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#3B2917]">
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-[#F5EAD4] font-serif">
                      {activeSlot.type === "can"
                        ? `CHỌN THIÊN CAN CHO ${LUCNHAM_PILLAR_INFO[activeSlot.colIndex]?.title.toUpperCase()}`
                        : `CHỌN ĐỊA CHI CHO ${LUCNHAM_PILLAR_INFO[activeSlot.colIndex]?.title.toUpperCase()}`}
                    </h4>
                    <p className="text-[11px] text-[#8C7D6B]">
                      {activeSlot.type === "can"
                        ? "Chọn 1 trong 10 Thiên Can (5 Can Dương & 5 Can Âm)"
                        : "Chọn 1 trong 12 Địa Chi (6 Chi Dương & 6 Chi Âm)"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveSlot(null)}
                    className="w-7 h-7 rounded-lg bg-[#2B1D10] text-[#A89882] hover:text-white flex items-center justify-center cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* MODAL BODY CHO THIÊN CAN */}
                {activeSlot.type === "can" && (
                  <div className="space-y-4">
                    {/* Nhóm Can Dương */}
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold text-yellow-400 mb-2">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                          5 THIÊN CAN DƯƠNG (+)
                        </span>
                        <span className="text-[10px] text-[#A89882] font-normal">Phối với Chi Dương</span>
                      </div>
                      <div className="grid grid-cols-5 gap-2">
                        {CAN_LIST.filter((c) => c.polarity === "duong").map((item) => {
                          const isSelected = lucNhamPillars[activeSlot.colIndex]?.can === item.name;
                          return (
                            <button
                              key={item.name}
                              type="button"
                              onClick={() => handleSelectCan(activeSlot.colIndex, item.name)}
                              className={`p-2 sm:p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-[#D4AF37] text-[#12100E] border-[#E5C158] font-bold shadow-md scale-105"
                                  : "bg-[#221A12] hover:bg-[#2F2418] text-[#F3E7D0] border-[#3E2E1C] hover:border-yellow-500/60"
                              }`}
                            >
                              <span className="text-xl sm:text-2xl mb-1">{item.emoji}</span>
                              <span className="text-base sm:text-lg font-serif font-bold">{item.name}</span>
                              <span className="text-[11px] text-[#A89882]">{item.chinese}</span>
                              <span className="text-[9px] mt-1 text-[#CDBFA8] text-center line-clamp-1">
                                {item.symbol}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Nhóm Can Âm */}
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold text-amber-400 mb-2">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                          5 THIÊN CAN ÂM (-)
                        </span>
                        <span className="text-[10px] text-[#A89882] font-normal">Phối với Chi Âm</span>
                      </div>
                      <div className="grid grid-cols-5 gap-2">
                        {CAN_LIST.filter((c) => c.polarity === "am").map((item) => {
                          const isSelected = lucNhamPillars[activeSlot.colIndex]?.can === item.name;
                          return (
                            <button
                              key={item.name}
                              type="button"
                              onClick={() => handleSelectCan(activeSlot.colIndex, item.name)}
                              className={`p-2 sm:p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-[#D4AF37] text-[#12100E] border-[#E5C158] font-bold shadow-md scale-105"
                                  : "bg-[#221A12] hover:bg-[#2F2418] text-[#F3E7D0] border-[#3E2E1C] hover:border-amber-500/60"
                              }`}
                            >
                              <span className="text-xl sm:text-2xl mb-1">{item.emoji}</span>
                              <span className="text-base sm:text-lg font-serif font-bold">{item.name}</span>
                              <span className="text-[11px] text-[#A89882]">{item.chinese}</span>
                              <span className="text-[9px] mt-1 text-[#CDBFA8] text-center line-clamp-1">
                                {item.symbol}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* MODAL BODY CHO ĐỊA CHI */}
                {activeSlot.type === "chi" && (() => {
                  const currentCan = lucNhamPillars[activeSlot.colIndex]?.can;
                  const canData = CAN_MAP.get(currentCan);
                  const allowedPolarity = canData ? canData.polarity : null;

                  return (
                    <div className="space-y-4">
                      <div className="text-xs bg-[#24190E] p-2.5 rounded-xl border border-[#48331E] flex items-center justify-between">
                        <span>
                          Thiên Can hiện tại: <strong className="text-[#E2B755]">{currentCan || "(Chưa chọn)"}</strong>
                        </span>
                        {allowedPolarity && (
                          <span className="text-[11px] font-bold text-amber-300">
                            Khuyến nghị chọn {allowedPolarity === "am" ? "6 Chi Âm (-)" : "6 Chi Dương (+)"}
                          </span>
                        )}
                      </div>

                      {/* Nhóm Chi Dương */}
                      <div>
                        <div className="flex items-center justify-between text-xs font-bold text-yellow-400 mb-2">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                            6 ĐỊA CHI DƯƠNG (+)
                          </span>
                          <span className="text-[10px] text-[#A89882] font-normal">
                            Đi với Can Giáp, Bính, Mậu, Canh, Nhâm
                          </span>
                        </div>
                        <div className="grid grid-cols-6 gap-2">
                          {CHI_LIST.filter((c) => c.polarity === "duong").map((item) => {
                            const isSelected = lucNhamPillars[activeSlot.colIndex]?.chi === item.name;
                            return (
                              <button
                                key={item.name}
                                type="button"
                                onClick={() => handleSelectChi(activeSlot.colIndex, item.name)}
                                className={`p-2 sm:p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                                  isSelected
                                    ? "bg-[#D4AF37] text-[#12100E] border-[#E5C158] font-bold shadow-md scale-105"
                                    : "bg-[#221A12] hover:bg-[#2F2418] text-[#F3E7D0] border-[#3E2E1C] hover:border-yellow-500/60"
                                }`}
                              >
                                <span className="text-xl sm:text-2xl mb-1">{item.emoji}</span>
                                <span className="text-sm sm:text-base font-serif font-bold">{item.name}</span>
                                <span className="text-[11px] text-[#A89882]">{item.chinese}</span>
                                <span className="text-[9px] mt-1 text-[#CDBFA8] text-center line-clamp-1">
                                  {item.zodiac}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Nhóm Chi Âm */}
                      <div>
                        <div className="flex items-center justify-between text-xs font-bold text-amber-400 mb-2">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                            6 ĐỊA CHI ÂM (-)
                          </span>
                          <span className="text-[10px] text-[#A89882] font-normal">
                            Đi với Can Ất, Đinh, Kỷ, Tân, Quý
                          </span>
                        </div>
                        <div className="grid grid-cols-6 gap-2">
                          {CHI_LIST.filter((c) => c.polarity === "am").map((item) => {
                            const isSelected = lucNhamPillars[activeSlot.colIndex]?.chi === item.name;
                            return (
                              <button
                                key={item.name}
                                type="button"
                                onClick={() => handleSelectChi(activeSlot.colIndex, item.name)}
                                className={`p-2 sm:p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                                  isSelected
                                    ? "bg-[#D4AF37] text-[#12100E] border-[#E5C158] font-bold shadow-md scale-105"
                                    : "bg-[#221A12] hover:bg-[#2F2418] text-[#F3E7D0] border-[#3E2E1C] hover:border-amber-500/60"
                                }`}
                              >
                                <span className="text-xl sm:text-2xl mb-1">{item.emoji}</span>
                                <span className="text-sm sm:text-base font-serif font-bold">{item.name}</span>
                                <span className="text-[11px] text-[#A89882]">{item.chinese}</span>
                                <span className="text-[9px] mt-1 text-[#CDBFA8] text-center line-clamp-1">
                                  {item.zodiac}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* =================================================================
              BÀN LỤC NHÂM (THIÊN ĐỊA BÀN • TỨ KHÓA • TAM TRUYỀN • XÍ NGẦU)
              - Nhận Ngày Can/Chi và Giờ Can/Chi từ Bát Tự Lục Nhâm ở trên
              ================================================================= */}
          <JiaziD12Dice
            dayCan={effectiveDayCan}
            dayChi={effectiveDayChi}
            hourCan={effectiveHourCan}
            hourChi={effectiveHourChi}
            selectedHoatThoiBranch={selectedHoatThoiBranch}
            storageScope={effectiveScope}
            boardContextLabel={boardContextLabel || (effectiveScope === "bocque" ? "Bảng Bốc Quẻ" : "Bảng Tab Hoa Giáp")}
            onSelectHoatThoi={(chi) => {
              // Khi xoay Hoạt Thời: Chiêm Thời giữ nguyên như cũ, không chuyển động
              if (onSelectHoatThoi) onSelectHoatThoi(chi);
            }}
            onApplyHoatThoi={handleApplyHoatThoi}
            onSetCurrentDateTime={handleSetCurrentDateTime}
          />

          {/* =================================================================
              PHẦN LỤC NHÂM HÓA DỊCH (DIỄN BIẾN SANG 64 QUẺ CHU DỊCH)
              - Ẩn hoàn toàn tại Tab Hoa Giáp theo yêu cầu người dùng
              ================================================================= */}
          {showHoaDich && effectiveScope !== "hoagiap" && (
            <div className="mt-5 pt-4 border-t border-[#3E2D1A]">
              <LucNhamHoaDichSection
                dayCan={effectiveDayCan}
                dayChi={effectiveDayChi}
                hourCan={effectiveHourCan}
                hourChi={effectiveHourChi}
                onProceedToDetails={onProceedToDetails}
              />
            </div>
          )}

          {/* =================================================================
              LƯU NIÊN THIÊN (流年篇) - SAO CHÉP TỪ THỰC THI THIÊN BÁT TỰ
              - Đổi tên thành Lưu Niên Thiên
              - Nằm ở dưới cùng quẻ Lục Nhâm
              - Phân tích tương tác giữa Bát Tự Lục Nhâm (Thời • Nhật • Nguyệt • Niên) và Lưu Niên
              - Lưu trữ độc lập theo bảng: iching_lucnham_luunien_${effectiveScope}
              ================================================================= */}
          {showLuuNienThien && (
            <div
              ref={lucNhamLuuNienRef}
              id={effectiveScope === "bocque" ? "luunien-thien-bocque" : "luunien-thien-hoagiap"}
              className="mt-6 pt-5 border-t border-[#3E2D1A]/90 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#E2B755] shadow-[0_0_8px_#E2B755]" />
                  <span className="text-xs font-serif font-bold text-[#E2B755] uppercase tracking-wider">
                    LƯU NIÊN THIÊN • QUẺ LỤC NHÂM ({effectiveScope === "bocque" ? "CHỖ BỐC QUẺ" : "TAB HOA GIÁP"})
                  </span>
                </div>
                <span className="text-[10px] text-[#A89882] font-mono">
                  Chiêm Thời (Trụ Giờ): {effectiveHourCan} {effectiveHourChi}
                </span>
              </div>

              <BaziThucThiThien
                title="LƯU NIÊN THIÊN (流年篇)"
                badgeLabel={`Bát Tự Lục Nhâm ⟷ Lưu Niên • ${effectiveScope === "bocque" ? "Bốc Quẻ" : "Hoa Giáp"}`}
                subTitle={`Phân tích tương tác giữa Bát Tự Lục Nhâm (Thời Trụ ${effectiveHourCan} ${effectiveHourChi}, Nhật Trụ ${effectiveDayCan} ${effectiveDayChi}, Nguyệt Trụ ${lucNhamPillars[2]?.can || ""} ${lucNhamPillars[2]?.chi || ""}, Niên Trụ ${lucNhamPillars[3]?.can || ""} ${lucNhamPillars[3]?.chi || ""}) cộng Hành Vận đối với Địa Chi Lưu Niên.`}
                saveButtonText="Lưu Lưu Niên Thiên"
                captureButtonText="Chụp Lưu Niên Thiên"
                downloadButtonText="Tải Lưu Niên Thiên"
                storageKeyPrefix={`iching_lucnham_luunien_${effectiveScope}`}
                pillars={lucNhamPillars}
                activeThoiBranch={effectiveHourChi}
                onCapture={() => handleCaptureLucNham("luunien")}
                onDownload={() => handleCaptureLucNham("luunien", true)}
                onSelectJiazi={onSelectJiazi}
              />
            </div>
          )}
        </div>
      )}

      {/* Modal Xuất Ảnh Bàn Lục Nhâm & Bát Tự Lục Nhâm */}
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
