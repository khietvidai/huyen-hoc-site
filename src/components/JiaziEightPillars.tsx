import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Compass,
  Clock,
  RotateCcw,
  Copy,
  Check,
  Lock,
  Unlock,
  ChevronDown,
  Info,
  ChevronRight,
  Eye,
  X,
  Layers,
} from "lucide-react";
import { SIXTY_JIAZI, JiaziEnrichedEntry } from "../data/jiazi";
import { JiaziD12Dice, getKhongVongInfo } from "./JiaziD12Dice";
export type { CanData, ChiData, PillarItem } from "../data/baziConstants";
import {
  FieldPaddyIcon,
  CAN_LIST,
  CHI_LIST,
  CAN_MAP,
  CHI_MAP,
  DUONG_CAN_NAMES,
  AM_CAN_NAMES,
  DUONG_CHI_NAMES,
  AM_CHI_NAMES,
  PILLAR_LABELS,
  getCurrentBaziPillars,
  getVietnamDateTime,
  getJulianDayNumber,
} from "../data/baziConstants";
export {
  FieldPaddyIcon,
  CAN_LIST,
  CHI_LIST,
  CAN_MAP,
  CHI_MAP,
  DUONG_CAN_NAMES,
  AM_CAN_NAMES,
  DUONG_CHI_NAMES,
  AM_CHI_NAMES,
  PILLAR_LABELS,
  getCurrentBaziPillars,
  getVietnamDateTime,
  getJulianDayNumber,
};
import type { PillarItem } from "../data/baziConstants";

interface JiaziEightPillarsProps {
  onSelectJiazi: (id: string) => void;
  cardImages?: Record<string, string>;
  className?: string;
}

export const JiaziEightPillars: React.FC<JiaziEightPillarsProps> = ({
  onSelectJiazi,
  cardImages = {},
  className = "",
}) => {
  // State 4 pillars: Mặc định trống chưa có điền khi vào
  const [pillars, setPillars] = useState<[PillarItem, PillarItem, PillarItem, PillarItem]>(() => [
    { can: "", chi: "" },
    { can: "", chi: "" },
    { can: "", chi: "" },
    { can: "", chi: "" },
  ]);

  // State đóng/mở panel: Mặc định thu gọn (false)
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // State active modal selector cho ô được nhấp
  const [activeSlot, setActiveSlot] = useState<{
    colIndex: number;
    type: "can" | "chi";
  } | null>(null);

  // State thông báo quy luật âm dương khi người dùng nhấp
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Lưu localStorage mỗi khi thay đổi pillars
  useEffect(() => {
    try {
      localStorage.setItem("iching_jiazi_eight_pillars_v3", JSON.stringify(pillars));
    } catch {
      // ignore
    }
  }, [pillars]);

  // Lưu trạng thái isOpen
  useEffect(() => {
    try {
      localStorage.setItem("iching_jiazi_eight_pillars_open", String(isOpen));
    } catch {
      // ignore
    }
  }, [isOpen]);

  // Tự động tắt notice sau 4s
  useEffect(() => {
    if (!noticeMessage) return;
    const timer = setTimeout(() => setNoticeMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [noticeMessage]);

  // Lắng nghe sự kiện chuyển đến Lục Nhâm Đại Độn từ Phương Thức Thỉnh Quẻ
  useEffect(() => {
    const handleJump = () => {
      setIsOpen(true);
      setTimeout(() => {
        const el = document.getElementById("lucnham-chart-area");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    };
    window.addEventListener("jump-to-lucnham", handleJump);
    return () => window.removeEventListener("jump-to-lucnham", handleJump);
  }, []);

  // Lắng nghe sự kiện đồng bộ từ Bảng Bát Tự Mở Rộng phía trên
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const handleSyncPillars = (e: Event) => {
      const customEvent = e as CustomEvent<[PillarItem, PillarItem, PillarItem, PillarItem]>;
      if (customEvent.detail && Array.isArray(customEvent.detail) && customEvent.detail.length === 4) {
        timer = setTimeout(() => {
          setPillars(customEvent.detail);
          setNoticeMessage("Đã đồng bộ 4 Trụ từ Bảng Bát Tự phía trên xuống 8 Ô Can Chi!");
        }, 0);
      }
    };
    window.addEventListener("sync-bazi-pillars", handleSyncPillars);
    return () => {
      window.removeEventListener("sync-bazi-pillars", handleSyncPillars);
      clearTimeout(timer);
    };
  }, []);

  /**
   * Xử lý chọn Thiên Can cho Trụ colIndex
   * Quy luật: Nếu Can Âm (Ất, Đinh, Kỷ, Tân, Quý) -> Địa Chi bên dưới chỉ được chọn Chi Âm.
   *           Nếu Can Dương (Giáp, Bính, Mậu, Canh, Nhâm) -> Địa Chi bên dưới chỉ được chọn Chi Dương.
   */
  const handleSelectCan = (colIndex: number, newCan: string) => {
    setPillars((prev) => {
      const next = [...prev] as [PillarItem, PillarItem, PillarItem, PillarItem];
      const canData = CAN_MAP.get(newCan);
      let updatedChi = next[colIndex].chi;

      if (canData) {
        const isAm = canData.polarity === "am";
        // Kiểm tra chi hiện tại xem có cùng cực tính không
        if (updatedChi) {
          const chiData = CHI_MAP.get(updatedChi);
          if (chiData && chiData.polarity !== canData.polarity) {
            // Chi hiện tại không khớp cực tính -> Tự động chuyển sang Chi đầu tiên của cùng cực tính hoặc reset
            const validChis = isAm ? AM_CHI_NAMES : DUONG_CHI_NAMES;
            updatedChi = validChis[0]; // Chuyển sang chi hợp lệ tương ứng
            setNoticeMessage(
              `Đã chọn Can ${isAm ? "Âm" : "Dương"} [${newCan}] ➔ Địa Chi bên dưới tự động chuyển thành [${updatedChi}] (${isAm ? "Chi Âm" : "Chi Dương"}) để tuân thủ luật phối tượng!`
            );
          } else {
            setNoticeMessage(
              `Đã chọn Can ${isAm ? "Âm" : "Dương"} [${newCan}] ➔ Địa Chi bên dưới chỉ được chọn ${isAm ? "6 Địa Chi Âm (Sửu, Mão, Tỵ, Mùi, Dậu, Hợi)" : "6 Địa Chi Dương (Tý, Dần, Thìn, Ngọ, Thân, Tuất)"}.`
            );
          }
        } else {
          setNoticeMessage(
            `Đã chọn Can ${isAm ? "Âm" : "Dương"} [${newCan}] ➔ Giờ bạn có thể chọn ${isAm ? "Địa Chi Âm" : "Địa Chi Dương"} ở ô dưới.`
          );
        }
      }

      next[colIndex] = {
        can: newCan,
        chi: updatedChi,
      };
      return next;
    });

    // Đóng modal can
    setActiveSlot(null);
  };

  /**
   * Xử lý chọn Địa Chi cho Trụ colIndex
   * Chỉ cho phép chọn nếu cùng cực tính với Can tương ứng
   */
  const handleSelectChi = (colIndex: number, newChi: string) => {
    const currentCan = pillars[colIndex].can;
    const canData = CAN_MAP.get(currentCan);
    const chiData = CHI_MAP.get(newChi);

    if (canData && chiData) {
      if (canData.polarity !== chiData.polarity) {
        // Cực tính không khớp! Chặn lại và cảnh báo
        const isAmCan = canData.polarity === "am";
        setNoticeMessage(
          `⚠️ Không thể chọn [${newChi}] (${chiData.polarity === "am" ? "Chi Âm" : "Chi Dương"}) vì Thiên Can [${currentCan}] là Can ${isAmCan ? "Âm" : "Dương"}. Chỉ được chọn ${isAmCan ? "Địa Chi Âm" : "Địa Chi Dương"}!`
        );
        return;
      }
    }

    setPillars((prev) => {
      const next = [...prev] as [PillarItem, PillarItem, PillarItem, PillarItem];
      next[colIndex] = {
        ...next[colIndex],
        chi: newChi,
      };
      return next;
    });

    setActiveSlot(null);
  };

  /**
   * Reset 8 ô
   */
  const handleReset = () => {
    setPillars([
      { can: "", chi: "" },
      { can: "", chi: "" },
      { can: "", chi: "" },
      { can: "", chi: "" },
    ]);
    setNoticeMessage("Đã làm mới toàn bộ 8 ô Can Chi.");
  };

  /**
   * Điền Bát Tự hiện tại
   */
  const handleCurrentBazi = () => {
    const curr = getCurrentBaziPillars();
    setPillars(curr);
    setNoticeMessage("Đã nạp chính xác Bát Tự (Giờ • Ngày • Tháng • Năm) thời gian thực tế!");
  };

  /**
   * Áp dụng Hoạt Thời (được gieo bằng xí ngầu 12 mặt) vào Trụ Giờ của Bát Tự
   */
  const handleApplyHoatThoi = (chiName: string) => {
    // Trụ Giờ là cột index 0 (thứ tự: Giờ • Ngày • Tháng • Năm)
    const dayCan = pillars[1]?.can || "Kỷ";
    const CAN_NAMES = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
    const dayCanIdx = Math.max(0, CAN_NAMES.indexOf(dayCan));
    const chiIdx = CHI_LIST.findIndex((c) => c.name === chiName);
    const baseHourCan = (dayCanIdx % 5) * 2;
    const hourCanName = CAN_NAMES[(baseHourCan + (chiIdx >= 0 ? chiIdx : 0)) % 10];

    setPillars((prev) => {
      const next = [...prev] as [PillarItem, PillarItem, PillarItem, PillarItem];
      next[0] = {
        can: hourCanName,
        chi: chiName,
      };
      return next;
    });

    setNoticeMessage(`Đã đưa Hoạt Thời [${hourCanName} ${chiName}] vào Trụ Giờ của Bát Tự!`);
  };

  /**
   * Sao chép Bát Tự
   */
  const handleCopyBazi = () => {
    const text = pillars
      .map((p, idx) => {
        const label = PILLAR_LABELS[idx].title;
        return `${label}: ${p.can || "---"} ${p.chi || "---"}`;
      })
      .join(" | ");

    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /**
   * Tìm Hoa Giáp theo Can Chi
   */
  const getMatchedJiazi = (can: string, chi: string): JiaziEnrichedEntry | undefined => {
    if (!can || !chi) return undefined;
    return SIXTY_JIAZI.find((j) => j.can === can && j.chi === chi);
  };

  return (
    <div
      className={`border border-[#3D3021] bg-gradient-to-b from-[#1C1711] via-[#16120D] to-[#120F0B] rounded-2xl shadow-xl overflow-hidden transition-all duration-300 ${className}`}
    >
      {/* Top Bar Header */}
      <div className="px-4 py-3.5 sm:px-6 sm:py-4 border-b border-[#2E2419] flex flex-wrap items-center justify-between gap-3 bg-[#1F1912]/80 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#2A1E14] border border-[#52412E] text-[#E2B755] shadow-inner">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-[#F5EAD4] font-serif tracking-wide flex items-center gap-2">
                BẢNG 8 Ô BÁT TỰ CAN CHI
                <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-[#2E2215] text-[#D4AF37] border border-[#533F27]">
                  Giờ • Ngày • Tháng • Năm
                </span>
              </h2>
            </div>
            <p className="text-[11px] sm:text-xs text-[#9E8E7A] mt-0.5 line-clamp-1 sm:line-clamp-none">
              Quy luật đồng bộ: Can Âm (<span className="text-amber-300 font-semibold">Ất, Đinh, Kỷ, Tân, Quý</span>) chỉ chọn Địa Chi Âm; Can Dương (<span className="text-yellow-400 font-semibold">Giáp, Bính, Mậu, Canh, Nhâm</span>) chỉ chọn Địa Chi Dương.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap ml-auto">
          <button
            type="button"
            onClick={handleCurrentBazi}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-[#271E15] hover:bg-[#382B1E] text-[#E2B755] border border-[#4F3B28] hover:border-[#D4AF37] transition-all cursor-pointer shadow-sm active:scale-95"
            title="Tự động lấy ngày giờ hiện tại để điền 4 Trụ Bát Tự theo thời gian thực tế"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Lấy Ngày Giờ Hiện Tại</span>
          </button>

          <button
            type="button"
            onClick={handleCopyBazi}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-[#1E1812] hover:bg-[#2C2218] text-[#DDD0BE] border border-[#3A2D1F] transition-all cursor-pointer active:scale-95"
            title="Sao chép 4 Trụ Bát Tự"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#A89882]" />}
            <span className="hidden sm:inline">{copied ? "Đã chép" : "Sao chép"}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 text-xs font-medium rounded-lg bg-[#1E1812] hover:bg-[#2C2218] text-[#A89882] hover:text-white border border-[#3A2D1F] transition-all cursor-pointer"
            title="Làm mới (Xóa trắng 8 ô)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-[#261E16] text-[#D4AF37] border border-[#483724] hover:bg-[#34281D] transition-all cursor-pointer ml-1"
          >
            <span>{isOpen ? "Thu Gọn" : "Mở 8 Ô"}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {/* Notice Message Toast if any */}
      {noticeMessage && (
        <div className="px-4 py-2 sm:px-6 bg-[#261A10] border-b border-[#4A321E] text-xs text-[#FFE082] flex items-center justify-between gap-2 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#E2B755] shrink-0" />
            <span>{noticeMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setNoticeMessage(null)}
            className="text-[#9E8E7A] hover:text-white shrink-0 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main 8-Box Body */}
      {isOpen && (
        <div className="p-4 sm:p-6 space-y-6">
          {/* Quy luật tóm tắt trực quan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-[#1C160F] border border-[#3E301F] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)]"></span>
                <span className="text-[#F3E7D0] font-semibold">5 Can Dương:</span>
                <span className="text-[#DDD0BE]">Giáp • Bính • Mậu • Canh • Nhâm</span>
              </div>
              <span className="text-[11px] text-yellow-400 font-bold px-2 py-0.5 rounded bg-yellow-950/60 border border-yellow-800/50">
                ➔ Đi với 6 Chi Dương
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#1C160F] border border-[#3E301F] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]"></span>
                <span className="text-[#F3E7D0] font-semibold">5 Can Âm:</span>
                <span className="text-[#DDD0BE]">Ất • Đinh • Kỷ • Tân • Quý</span>
              </div>
              <span className="text-[11px] text-amber-300 font-bold px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/50">
                ➔ Chỉ chọn 6 Chi Âm
              </span>
            </div>
          </div>

          {/* GRID 4 CỘT TƯƠNG ỨNG 8 Ô (4 Ô TRÊN LÀ THIÊN CAN, 4 Ô DƯỚI LÀ ĐỊA CHI) */}
          {(() => {
            const dayCan = pillars[1]?.can || "Kỷ";
            const dayChi = pillars[1]?.chi || "Dậu";
            const khongVongInfo = getKhongVongInfo(dayCan, dayChi);

            return (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {PILLAR_LABELS.map((pillar) => {
                  const colIdx = pillar.id;
                  const { can, chi } = pillars[colIdx];
                  const canData = CAN_MAP.get(can);
                  const chiData = CHI_MAP.get(chi);
                  const matchedJiazi = getMatchedJiazi(can, chi);
                  const isPillarKhongVong = Boolean(chi && khongVongInfo.branches.includes(chi));

                  return (
                    <div
                      key={colIdx}
                      className={`flex flex-col border rounded-2xl p-3 sm:p-3.5 shadow-md transition-colors relative ${
                        colIdx === 1
                          ? "bg-[#1B140D] border-[#553E26] hover:border-[#D4AF37]"
                          : "bg-[#18130E] border-[#332619] hover:border-[#4D3A26]"
                      }`}
                    >
                      {/* Header Cột: Tên Trụ & Nhật Chủ */}
                      <div className="text-center pb-2 mb-2 border-b border-[#281E14]">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          <span className="text-xs sm:text-sm font-bold text-[#E2B755] font-serif">
                            {pillar.title}
                          </span>
                          {colIdx === 1 && (
                            <span className="px-1.5 py-0.2 rounded text-[8.5px] font-bold bg-amber-950/90 text-amber-300 border border-amber-600/70 shadow-sm">
                              Nhật Chủ
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-[#8C7D6B] font-mono">{pillar.sub}</div>
                      </div>

                      {/* 4 Ô TRÊN: THIÊN CAN */}
                      <div className="mb-2">
                        {/* Ô Box Thiên Can */}
                        <div
                          onClick={() => setActiveSlot({ colIndex: colIdx, type: "can" })}
                          className={`relative min-h-[58px] sm:min-h-[66px] rounded-xl border flex flex-col items-center justify-center p-2 text-center cursor-pointer transition-all duration-200 select-none group ${
                            canData
                              ? "bg-gradient-to-b from-[#251D14] to-[#1C160F] border-[#5A4328] hover:border-[#E2B755] shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
                              : "bg-[#14100C]/70 border-dashed border-[#3D3021] hover:border-[#D4AF37] hover:bg-[#1A140F]"
                          }`}
                        >
                          {canData ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xl sm:text-2xl" title={canData.symbol}>
                                {canData.emoji}
                              </span>
                              <span className={`text-2xl sm:text-3xl font-serif font-bold ${canData.colorText}`}>
                                {canData.name}
                              </span>
                              <span className="text-xs sm:text-sm text-[#8C7D6B] font-serif">({canData.chinese})</span>
                            </div>
                          ) : (
                            <div className="text-center">
                              <span className="text-xs text-[#A89882] group-hover:text-[#E2B755] font-medium">
                                + Chọn Can
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Mũi Tên Kết Nối Âm Dương */}
                      <div className="flex items-center justify-center my-0.5">
                        <span className="text-[10px] text-[#6E5A44] font-mono">⇅</span>
                      </div>

                      {/* 4 Ô DƯỚI: ĐỊA CHI */}
                      <div className="mb-3">
                        {/* Ô Box Địa Chi */}
                        <div
                          onClick={() => setActiveSlot({ colIndex: colIdx, type: "chi" })}
                          className={`relative min-h-[58px] sm:min-h-[66px] rounded-xl border flex flex-col items-center justify-center p-2 text-center cursor-pointer transition-all duration-200 select-none group ${
                            chiData
                              ? "bg-gradient-to-b from-[#231A12] to-[#1A140E] border-[#5A4328] hover:border-[#E2B755] shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
                              : "bg-[#14100C]/70 border-dashed border-[#3D3021] hover:border-[#D4AF37] hover:bg-[#1A140F]"
                          }`}
                        >
                          {chiData ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xl sm:text-2xl">{chiData.emoji}</span>
                              <span className="text-2xl sm:text-3xl font-serif font-bold text-[#F5EAD4]">
                                {chiData.name}
                              </span>
                              <span className="text-xs sm:text-sm text-[#8C7D6B] font-serif">({chiData.chinese})</span>
                            </div>
                          ) : (
                            <div className="text-center">
                              <span className="text-xs text-[#A89882] group-hover:text-[#E2B755] font-medium">
                                + Chọn Chi
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* HOA GIÁP KẾT QUẢ CỦA TRỤ NÀY */}
                      <div className="mt-auto pt-2 border-t border-[#251D14]">
                        {matchedJiazi ? (
                          <div className="bg-[#201810] border border-[#483724] rounded-xl p-2 flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-[#D4AF37] font-bold">
                                #{matchedJiazi.order} {matchedJiazi.name}
                              </span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#15110C] text-[#A89882]">
                                {matchedJiazi.branchGroup}
                              </span>
                            </div>
                            <div className="text-[10px] text-[#C4B49F] line-clamp-1">
                              {matchedJiazi.elementNapAm}
                            </div>
                            {matchedJiazi.hexagramLink && (
                              <div className="text-[9px] text-[#8C7D6B] flex items-center gap-1">
                                <span className="text-[#D4AF37]">☯</span>
                                <span>
                                  #{matchedJiazi.hexagramLink.hexagramNumber} {matchedJiazi.hexagramLink.hexagramName}
                                </span>
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => onSelectJiazi(matchedJiazi.id)}
                              className="mt-1 w-full flex items-center justify-center gap-1 py-1 text-[10px] font-semibold text-[#18130E] bg-[#D4AF37] hover:bg-[#E5C158] rounded-lg transition-colors cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Xem Hoa Giáp #{matchedJiazi.order}</span>
                            </button>
                          </div>
                        ) : (
                          <div className="py-2 text-center text-[10px] text-[#6B5C4B] italic">
                            {can && !chi
                              ? "Chọn thêm Địa Chi ở dưới..."
                              : !can && chi
                              ? "Chọn thêm Thiên Can ở trên..."
                              : "Chưa chọn Can Chi"}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* Quick Summary of 4 Pillars */}
          {pillars.some((p) => p.can && p.chi) && (
            <div className="p-3 sm:p-4 rounded-xl bg-[#17120C] border border-[#332619] flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <Sparkles className="w-4 h-4 text-[#E2B755]" />
                <span className="text-[#8C7D6B]">TỔNG THỂ BÁT TỰ:</span>
                <span className="font-serif font-bold text-[#F5EAD4] tracking-wider">
                  {pillars.map((p) => `${p.can || "?"} ${p.chi || "?"}`).join("  •  ")}
                </span>
                {(() => {
                  const dayKv = getKhongVongInfo(pillars[1]?.can || "Kỷ", pillars[1]?.chi || "Dậu");
                  const kvPillars = pillars.filter((p) => p.chi && dayKv.branches.includes(p.chi));
                  return (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-purple-300 font-bold bg-purple-950/80 px-2 py-0.5 rounded-full border border-purple-700/80 text-[10.5px] flex items-center gap-1">
                        <span>Tuần Không:</span>
                        <strong className="text-purple-200">{dayKv.branches.join(" • ")}</strong>
                        <span className="text-purple-400 text-[9.5px]">({dayKv.tuanGiap})</span>
                      </span>
                      {kvPillars.length > 0 && (
                        <span className="text-purple-300 bg-purple-900/60 px-1.5 py-0.2 rounded border border-purple-600 text-[9.5px] font-semibold animate-pulse">
                          {kvPillars.length} Trụ phạm Tuần Không
                        </span>
                      )}
                    </div>
                  );
                })()}
              </div>
              <div className="text-[11px] text-[#A89882] flex items-center gap-3">
                <span>
                  Đã phối thành công:{" "}
                  <strong className="text-[#E2B755]">
                    {pillars.filter((p) => getMatchedJiazi(p.can, p.chi)).length} / 4
                  </strong>{" "}
                  Hoa Giáp
                </span>
              </div>
            </div>
          )}

          {/* KHUNG NGUYỆT TƯỚNG & HOẠT THỜI (XÍ NGẦU 12 MẶT) */}
          <div id="lucnham-chart-area" className="scroll-mt-24">
            <JiaziD12Dice
              dayCan={pillars[1]?.can || "Kỷ"}
              dayChi={pillars[1]?.chi || "Dậu"}
              hourCan={pillars[0]?.can || "Kỷ"}
              hourChi={pillars[0]?.chi || "Tỵ"}
              onApplyHoatThoi={handleApplyHoatThoi}
              onSetCurrentDateTime={handleCurrentBazi}
            />
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL SELECTION CHO Ô (THIÊN CAN HOẶC ĐỊA CHI)
          ======================================================== */}
      {activeSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#19140F] border border-[#483724] rounded-2xl p-5 sm:p-6 shadow-2xl text-[#F5EAD4] animate-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-[#2C2114] pb-3 mb-4">
              <div>
                <div className="text-xs text-[#8C7D6B] uppercase font-bold tracking-wider">
                  {PILLAR_LABELS[activeSlot.colIndex].title} ({PILLAR_LABELS[activeSlot.colIndex].sub})
                </div>
                <h3 className="text-base sm:text-lg font-serif font-bold text-[#E2B755]">
                  {activeSlot.type === "can"
                    ? "CHỌN THIÊN CAN (Ô TRÊN)"
                    : "CHỌN ĐỊA CHI (Ô DƯỚI)"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveSlot(null)}
                className="p-1.5 rounded-lg bg-[#251D14] hover:bg-[#34281D] text-[#8C7D6B] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SELECTION BODY CHO THIÊN CAN */}
            {activeSlot.type === "can" && (
              <div className="space-y-4">
                <p className="text-xs text-[#B3A28C]">
                  Nhấp chọn 1 trong 10 Thiên Can. Khi chọn Can Âm (Ất, Đinh, Kỷ, Tân, Quý), ô Địa Chi tương ứng bên dưới sẽ chỉ cho phép chọn Địa Chi Âm.
                </p>

                {/* Nhóm Can Dương */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-yellow-400 mb-2">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                      5 THIÊN CAN DƯƠNG (+)
                    </span>
                    <span className="text-[10px] text-[#A89882] font-normal">
                      Phối với Chi Dương
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {CAN_LIST.filter((c) => c.polarity === "duong").map((item) => {
                      const isSelected = pillars[activeSlot.colIndex].can === item.name;
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
                          <span className="text-base sm:text-lg font-serif font-bold">
                            {item.name}
                          </span>
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
                    <span className="text-[10px] text-[#A89882] font-normal">
                      Phối với Chi Âm
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {CAN_LIST.filter((c) => c.polarity === "am").map((item) => {
                      const isSelected = pillars[activeSlot.colIndex].can === item.name;
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
                          <span className="text-base sm:text-lg font-serif font-bold">
                            {item.name}
                          </span>
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

            {/* SELECTION BODY CHO ĐỊA CHI */}
            {activeSlot.type === "chi" && (() => {
              const currentCan = pillars[activeSlot.colIndex].can;
              const canData = CAN_MAP.get(currentCan);
              const isCanAm = canData?.polarity === "am";
              const isCanDuong = canData?.polarity === "duong";

              return (
                <div className="space-y-4">
                  {/* Trạng thái quy luật hiện tại */}
                  <div className="p-3 rounded-xl bg-[#221A12] border border-[#443320] text-xs">
                    {currentCan ? (
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            isCanAm ? "bg-amber-400" : "bg-yellow-400"
                          }`}
                        ></span>
                        <span className="text-[#DDD0BE]">
                          Thiên Can ở trên:{" "}
                          <strong className={isCanAm ? "text-amber-300" : "text-yellow-400"}>
                            {currentCan} ({isCanAm ? "Can Âm" : "Can Dương"})
                          </strong>
                          {" ➔ "}
                          <span className="text-[#F5EAD4] font-semibold">
                            {isCanAm
                              ? "Ở dưới CHỈ LỰA CHỌN ĐƯỢC ĐỊA CHI ÂM"
                              : "Ở dưới CHỈ LỰA CHỌN ĐƯỢC ĐỊA CHI DƯƠNG"}
                          </span>
                        </span>
                      </div>
                    ) : (
                      <div className="text-amber-300">
                        Chưa chọn Thiên Can ở trên. Bạn có thể chọn Địa Chi bên dưới và hệ thống sẽ hỗ trợ bạn ghép cặp chuẩn xác.
                      </div>
                    )}
                  </div>

                  {/* 6 ĐỊA CHI DƯƠNG */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-yellow-400 mb-2">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                        6 ĐỊA CHI DƯƠNG (+) {isCanAm && <span className="text-rose-400 text-[10px]">(BỊ KHÓA)</span>}
                      </span>
                      <span className="text-[10px] text-[#8C7D6B] font-normal">
                        Tý • Dần • Thìn • Ngọ • Thân • Tuất
                      </span>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {CHI_LIST.filter((c) => c.polarity === "duong").map((item) => {
                        const isSelected = pillars[activeSlot.colIndex].chi === item.name;
                        const isLocked = isCanAm; // Nếu Can là Âm thì Chi Dương bị khóa!

                        return (
                          <button
                            key={item.name}
                            type="button"
                            disabled={isLocked}
                            onClick={() => handleSelectChi(activeSlot.colIndex, item.name)}
                            className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                              isLocked
                                ? "opacity-35 bg-[#15110D] border-[#251C14] text-[#6B5C4B] cursor-not-allowed"
                                : isSelected
                                ? "bg-[#D4AF37] text-[#12100E] border-[#E5C158] font-bold shadow-md scale-105 cursor-pointer"
                                : "bg-[#221A12] hover:bg-[#2F2418] text-[#F3E7D0] border-[#3E2E1C] hover:border-yellow-500/60 cursor-pointer"
                            }`}
                            title={
                              isLocked
                                ? `Bị khóa: Thiên Can [${currentCan}] là Can Âm nên không thể chọn Chi Dương!`
                                : `Chọn Chi ${item.name}`
                            }
                          >
                            <span className="text-lg">{item.emoji}</span>
                            <span className="text-sm sm:text-base font-serif font-bold">
                              {item.name}
                            </span>
                            <span className="text-[10px] text-[#A89882]">{item.chinese}</span>
                            {isLocked ? (
                              <span className="text-[9px] text-rose-400 mt-1 flex items-center gap-0.5">
                                <Lock className="w-2.5 h-2.5" /> Khóa
                              </span>
                            ) : (
                              <span className="text-[9px] text-[#CDBFA8] mt-1">
                                {item.element}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 6 ĐỊA CHI ÂM */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-amber-400 mb-2">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                        6 ĐỊA CHI ÂM (-) {isCanDuong && <span className="text-rose-400 text-[10px]">(BỊ KHÓA)</span>}
                      </span>
                      <span className="text-[10px] text-[#8C7D6B] font-normal">
                        Sửu • Mão • Tỵ • Mùi • Dậu • Hợi
                      </span>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {CHI_LIST.filter((c) => c.polarity === "am").map((item) => {
                        const isSelected = pillars[activeSlot.colIndex].chi === item.name;
                        const isLocked = isCanDuong; // Nếu Can là Dương thì Chi Âm bị khóa!

                        return (
                          <button
                            key={item.name}
                            type="button"
                            disabled={isLocked}
                            onClick={() => handleSelectChi(activeSlot.colIndex, item.name)}
                            className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                              isLocked
                                ? "opacity-35 bg-[#15110D] border-[#251C14] text-[#6B5C4B] cursor-not-allowed"
                                : isSelected
                                ? "bg-[#D4AF37] text-[#12100E] border-[#E5C158] font-bold shadow-md scale-105 cursor-pointer"
                                : "bg-[#221A12] hover:bg-[#2F2418] text-[#F3E7D0] border-[#3E2E1C] hover:border-amber-500/60 cursor-pointer"
                            }`}
                            title={
                              isLocked
                                ? `Bị khóa: Thiên Can [${currentCan}] là Can Dương nên không thể chọn Chi Âm!`
                                : `Chọn Chi ${item.name}`
                            }
                          >
                            <span className="text-lg">{item.emoji}</span>
                            <span className="text-sm sm:text-base font-serif font-bold">
                              {item.name}
                            </span>
                            <span className="text-[10px] text-[#A89882]">{item.chinese}</span>
                            {isLocked ? (
                              <span className="text-[9px] text-rose-400 mt-1 flex items-center gap-0.5">
                                <Lock className="w-2.5 h-2.5" /> Khóa
                              </span>
                            ) : (
                              <span className="text-[9px] text-[#CDBFA8] mt-1">
                                {item.element}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Footer Modal */}
            <div className="mt-5 pt-3 border-t border-[#2C2114] flex items-center justify-between text-xs">
              <span className="text-[#8C7D6B]">
                Mẹo: Bấm phím Esc hoặc nhấp ra ngoài để đóng
              </span>
              <button
                type="button"
                onClick={() => setActiveSlot(null)}
                className="px-4 py-1.5 rounded-xl bg-[#281F15] hover:bg-[#382B1E] text-[#DDD0BE] border border-[#443524] transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
