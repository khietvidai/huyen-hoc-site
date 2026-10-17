import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Scale,
  RotateCw,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  ArrowRightLeft,
  Compass,
  Zap,
  Info,
} from "lucide-react";
import { Hexagram } from "../types";
import { CardVisual } from "./CardVisual";
import { zenAudio } from "../utils/zenAudio";

interface TenStarsSlot2VisualProps {
  card1?: Hexagram; // Quẻ Lá 1 (Tình huống hiện tại)
  card2A: Hexagram; // Quẻ Lá 2A (hoặc Lá 2 trong Thập Tinh Chuẩn)
  card2B?: Hexagram; // Quẻ Lá 2B (trong Thập Tinh Mở Rộng)
  isCard2AReversed: boolean; // true = Nghịch (Trở Ngại), false = Thuận (Hỗ Trợ)
  isCard2BReversed?: boolean;
  onToggleCard2A?: () => void;
  onToggleCard2B?: () => void;
  onSetCard2AState?: (reversed: boolean) => void;
  onSetCard2BState?: (reversed: boolean) => void;
  cardImages?: Record<number, string>;
  cardVideos?: Record<number, string>;
  isExpandedSpread?: boolean; // true nếu có cả 2A và 2B (11 lá)
  defaultCollapsed?: boolean;
  className?: string;
  onImageUpdated?: (num: number, url: string) => void;
}

// Hàm phân tích ý nghĩa trợ lực / trở ngại theo quẻ và trạng thái
function getOrientationInterpretation(hex: Hexagram, isReversed: boolean, isSlot2A: boolean = true) {
  const roleName = isSlot2A ? "Ngoại duyên / Tác nhân ban đầu" : "Nội tại / Tác nhân chiều sâu";

  if (!isReversed) {
    // THUẬN: HỖ TRỢ
    return {
      statusLabel: "HỖ TRỢ (THUẬN • XUÔI)",
      statusType: "support" as const,
      roleDescription: `${roleName}: Đóng vai trò trợ lực đắc lực, xúc tác thuận lợi và mở đường cát tường.`,
      energyTone: `Năng lượng thuần chính của quẻ #${hex.number} ${hex.name} (${hex.vietnameseName}) đang cộng hưởng mạnh mẽ giúp bạn vượt qua bế tắc, củng cố thực lực và thăng tiến.`,
      actionAdvice: hex.advice
        ? `Phát huy tinh thần '${hex.name}': ${hex.advice}`
        : "Chớp lấy thời cơ, tận dụng nguồn năng lượng tích cực này để đẩy nhanh tiến độ công việc.",
    };
  } else {
    // NGHỊCH: TRỞ NGẠI
    return {
      statusLabel: "TRỞ NGẠI (NGHỊCH • NGƯỢC)",
      statusType: "obstacle" as const,
      roleDescription: `${roleName}: Đóng vai trò điểm nghẽn, lực cản chắn ngang hoặc thử thách ngầm cần cẩn trọng.`,
      energyTone: `Năng lượng phản trắc hoặc mặt đối nghịch của quẻ #${hex.number} ${hex.name} (${hex.vietnameseName}) đang tạo ra rào cản, mâu thuẫn hoặc sự chậm trễ ngoài dự kiến.`,
      actionAdvice: `Thận trọng với cạm bẫy của '${hex.name}': Cần nhận diện rõ điểm yếu, kiên nhẫn thủ tín, không nên đối đầu trực diện mà hãy tìm giải pháp hòa hoãn, hóa giải từng bước.`,
    };
  }
}

export const TenStarsSlot2Visual: React.FC<TenStarsSlot2VisualProps> = ({
  card1,
  card2A,
  card2B,
  isCard2AReversed,
  isCard2BReversed = false,
  onToggleCard2A,
  onToggleCard2B,
  onSetCard2AState,
  onSetCard2BState,
  cardImages = {},
  cardVideos = {},
  isExpandedSpread = false,
  defaultCollapsed = false,
  className = "",
  onImageUpdated,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(defaultCollapsed);

  // Phân tích trạng thái kết hợp của 2A và 2B
  const isBothSupport = !isCard2AReversed && !isCard2BReversed;
  const isBothObstacle = isCard2AReversed && isCard2BReversed;
  const is2ASupport2BObstacle = !isCard2AReversed && isCard2BReversed;
  const is2AObstacle2BSupport = isCard2AReversed && !isCard2BReversed;

  // Xử lý chuyển nhanh kịch bản (Scenario switch)
  const applyScenario = (aReversed: boolean, bReversed: boolean) => {
    try {
      zenAudio.playCardFlipSound();
    } catch {
      // ignore
    }
    if (onSetCard2AState) {
      onSetCard2AState(aReversed);
    } else if (onToggleCard2A && isCard2AReversed !== aReversed) {
      onToggleCard2A();
    }

    if (onSetCard2BState) {
      onSetCard2BState(bReversed);
    } else if (onToggleCard2B && isCard2BReversed !== bReversed) {
      onToggleCard2B();
    }
  };

  const interp2A = getOrientationInterpretation(card2A, isCard2AReversed, true);
  const interp2B = card2B ? getOrientationInterpretation(card2B, isCard2BReversed, false) : null;

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 overflow-hidden shadow-2xl ${
        isExpandedSpread
          ? isBothSupport
            ? "border-emerald-600/70 bg-gradient-to-b from-[#102417] via-[#151b16] to-[#0d120f] shadow-[0_0_25px_rgba(16,185,129,0.15)]"
            : isBothObstacle
            ? "border-red-600/70 bg-gradient-to-b from-[#2a1111] via-[#1c1212] to-[#120c0c] shadow-[0_0_25px_rgba(239,68,68,0.2)]"
            : "border-amber-600/70 bg-gradient-to-b from-[#241a0f] via-[#1a1510] to-[#100d0a] shadow-[0_0_25px_rgba(217,119,6,0.15)]"
          : isCard2AReversed
          ? "border-red-600/70 bg-gradient-to-b from-[#2a1111] via-[#1c1212] to-[#120c0c] shadow-[0_0_25px_rgba(239,68,68,0.2)]"
          : "border-emerald-600/70 bg-gradient-to-b from-[#102417] via-[#151b16] to-[#0d120f] shadow-[0_0_25px_rgba(16,185,129,0.15)]"
      } ${className}`}
    >
      {/* HEADER: TIÊU ĐỀ & TRẠNG THÁI TỔNG QUAN */}
      <div className="p-3.5 sm:p-5 border-b border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`w-3 h-3 rounded-full animate-pulse shadow-sm ${
                isExpandedSpread
                  ? isBothSupport
                    ? "bg-emerald-400 shadow-[0_0_8px_#34d399]"
                    : isBothObstacle
                    ? "bg-red-400 shadow-[0_0_8px_#f87171]"
                    : "bg-amber-400 shadow-[0_0_8px_#fbbf24]"
                  : isCard2AReversed
                  ? "bg-red-400 shadow-[0_0_8px_#f87171]"
                  : "bg-emerald-400 shadow-[0_0_8px_#34d399]"
              }`}
            />
            <h3 className="font-serif font-bold text-base sm:text-lg text-[#F5EAD4] tracking-wide flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#C9A55A]" />
              {isExpandedSpread
                ? "TRỰC QUAN QUẺ THỨ 2 (2A & 2B): ĐỐI CHIẾU HỖ TRỢ ⇄ TRỞ NGẠI"
                : "TRỰC QUAN QUẺ THỨ 2: LỰC CHẮN TÂM ĐIỂM (HỖ TRỢ / TRỞ NGẠI)"}
            </h3>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full border bg-black/40 text-[#C9A55A] border-[#554028]">
              {isExpandedSpread ? "11 Lá • Nhánh Đôi 2A & 2B" : "10 Lá • Trận Pháp Chuẩn"}
            </span>
          </div>

          <p className="text-xs text-[#BFAFA0] font-serif">
            {isExpandedSpread
              ? "Vị trí then chốt quyết định chiều hướng: Hai lực chắn 2A & 2B đan xen, hé lộ trợ lực thúc đẩy hay chướng ngại vật cản trở tình thế."
              : "Lực chắn ngang tâm điểm quẻ hiện tại: Trạng thái Xuôi mang lại Trợ Lực hanh thông, trạng thái Ngược tạo nên Trở Ngại thử thách."}
          </p>
        </div>

        {/* Nút Thu Gọn & Preset Kịch Bản */}
        <div className="flex items-center gap-2 self-end md:self-auto flex-wrap">
          {isExpandedSpread && (
            <div className="hidden sm:flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 text-[11px]">
              <span className="text-[10px] text-[#A89882] px-1 font-serif">Thế:</span>
              <button
                type="button"
                onClick={() => applyScenario(false, false)}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                  isBothSupport
                    ? "bg-emerald-600 text-white font-bold shadow"
                    : "text-[#BFAFA0] hover:text-white"
                }`}
                title="Cả 2A và 2B đều Xuôi (Hỗ Trợ)"
              >
                Cùng Thuận
              </button>
              <button
                type="button"
                onClick={() => applyScenario(false, true)}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                  is2ASupport2BObstacle
                    ? "bg-amber-600 text-white font-bold shadow"
                    : "text-[#BFAFA0] hover:text-white"
                }`}
                title="2A Xuôi (Hỗ Trợ) • 2B Ngược (Trở Ngại)"
              >
                Thuận - Nghịch
              </button>
              <button
                type="button"
                onClick={() => applyScenario(true, false)}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                  is2AObstacle2BSupport
                    ? "bg-amber-600 text-white font-bold shadow"
                    : "text-[#BFAFA0] hover:text-white"
                }`}
                title="2A Ngược (Trở Ngại) • 2B Xuôi (Hỗ Trợ)"
              >
                Nghịch - Thuận
              </button>
              <button
                type="button"
                onClick={() => applyScenario(true, true)}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                  isBothObstacle
                    ? "bg-red-700 text-white font-bold shadow"
                    : "text-[#BFAFA0] hover:text-white"
                }`}
                title="Cả 2A và 2B đều Ngược (Trở Ngại)"
              >
                Cùng Nghịch
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 hover:bg-black/60 border border-white/15 text-[#EAD8B1] hover:text-white text-xs font-serif transition-colors cursor-pointer"
          >
            <span>{isCollapsed ? "Mở Rộng Chi Tiết" : "Thu Gọn"}</span>
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* BANNER TỔNG QUAN NĂNG LƯỢNG */}
      <div className="px-3.5 sm:px-5 py-3 bg-black/25 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 flex-wrap">
          {isExpandedSpread ? (
            <>
              {/* Badge Tổng Hợp */}
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif font-bold border shadow-md ${
                  isBothSupport
                    ? "bg-emerald-950/90 text-emerald-200 border-emerald-500/80 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                    : isBothObstacle
                    ? "bg-red-950/90 text-red-200 border-red-500/80 shadow-[0_0_12px_rgba(239,68,68,0.3)]"
                    : is2ASupport2BObstacle
                    ? "bg-amber-950/90 text-amber-200 border-amber-500/80 shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                    : "bg-indigo-950/90 text-indigo-200 border-indigo-500/80 shadow-[0_0_12px_rgba(99,102,241,0.3)]"
                }`}
              >
                {isBothSupport && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                {isBothObstacle && <ShieldAlert className="w-4 h-4 text-red-400" />}
                {!isBothSupport && !isBothObstacle && <Scale className="w-4 h-4 text-amber-400" />}
                <span>
                  {isBothSupport && "CÙNG THUẬN: SONG TRỢ ĐẮC LỰC (ĐẠI CÁT)"}
                  {isBothObstacle && "CÙNG NGHỊCH: TRÙNG ĐIỆP TRỞ NGẠI (CẦN PHÒNG THỦ)"}
                  {is2ASupport2BObstacle && "THUẬN - NGHỊCH: TRƯỚC TRỢ LỰC, SAU CẢN TRỞ"}
                  {is2AObstacle2BSupport && "NGHỊCH - THUẬN: TIỀN NAN HẬU DỊ (VƯỢT KHÓ KHAI HOA)"}
                </span>
              </div>

              {/* Tag mini riêng từng lá */}
              <div className="flex items-center gap-1.5 text-xs font-mono">
                <span
                  className={`px-2 py-0.5 rounded border ${
                    isCard2AReversed
                      ? "bg-red-950/80 text-red-300 border-red-700"
                      : "bg-emerald-950/80 text-emerald-300 border-emerald-700"
                  }`}
                >
                  2A: {isCard2AReversed ? "Nghịch (Trở Ngại)" : "Thuận (Hỗ Trợ)"}
                </span>
                <span
                  className={`px-2 py-0.5 rounded border ${
                    isCard2BReversed
                      ? "bg-red-950/80 text-red-300 border-red-700"
                      : "bg-emerald-950/80 text-emerald-300 border-emerald-700"
                  }`}
                >
                  2B: {isCard2BReversed ? "Nghịch (Trở Ngại)" : "Thuận (Hỗ Trợ)"}
                </span>
              </div>
            </>
          ) : (
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif font-bold border shadow-md ${
                isCard2AReversed
                  ? "bg-red-950/90 text-red-200 border-red-500/80 shadow-[0_0_12px_rgba(239,68,68,0.3)]"
                  : "bg-emerald-950/90 text-emerald-200 border-emerald-500/80 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
              }`}
            >
              {isCard2AReversed ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span>LÁ 2 Ở THẾ NGHỊCH: TRỞ NGẠI • CHƯỚNG CẢN TÂM ĐIỂM</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>LÁ 2 Ở THẾ THUẬN: HỖ TRỢ • TRỢ LỰC TÂM ĐIỂM</span>
                </>
              )}
            </div>
          )}
        </div>

        {card1 && (
          <div className="text-xs text-[#D8C7B0] flex items-center gap-1.5">
            <span className="text-[#A89882] font-serif">Đang tác động lên Lá 1:</span>
            <span className="font-bold text-[#C9A55A] font-serif">
              Quẻ #{card1.number} {card1.name} ({card1.vietnameseName})
            </span>
          </div>
        )}
      </div>

      {/* NỘI DUNG CHI TIẾT (COLLAPSIBLE) */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="p-3.5 sm:p-5 space-y-4"
          >
            {/* LƯỚI SO SÁNH 2 LÁ (HOẶC 1 LÁ ĐƠN) */}
            <div
              className={`grid gap-4 ${
                isExpandedSpread && card2B
                  ? "grid-cols-1 lg:grid-cols-2"
                  : "grid-cols-1 max-w-2xl mx-auto"
              }`}
            >
              {/* ========================================================= */}
              {/* LÁ 2A (Hoặc Lá 2 trong Thập Tinh Chuẩn)                     */}
              {/* ========================================================= */}
              <div
                className={`p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between ${
                  isCard2AReversed
                    ? "bg-gradient-to-br from-[#241212]/90 to-[#180e0e]/90 border-red-600/70 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                    : "bg-gradient-to-br from-[#122216]/90 to-[#0e1711]/90 border-emerald-600/70 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                }`}
              >
                <div>
                  {/* Nhãn Vị Trí & Nút Đổi Chiều */}
                  <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-[#2D2114] text-[#C9A55A] text-xs font-mono font-bold flex items-center justify-center border border-[#554028]">
                        {isExpandedSpread ? "2A" : "2"}
                      </span>
                      <div>
                        <h4 className="text-xs sm:text-sm font-serif font-bold text-[#F5EAD4]">
                          {isExpandedSpread ? "QUẺ 2A • NGOẠI LỰC / BỀ NỔI" : "QUẺ THỨ 2 • LỰC CHẮN TÂM ĐIỂM"}
                        </h4>
                        <p className="text-[10px] text-[#A89882] font-mono">
                          {isExpandedSpread ? "Lực chắn thứ nhất (Nhánh A)" : "Trợ Lực / Trở Ngại trực diện"}
                        </p>
                      </div>
                    </div>

                    {/* Trạng Thái Badge */}
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-xs font-serif font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 ${
                          isCard2AReversed
                            ? "bg-red-950 text-red-200 border-red-500 shadow-sm"
                            : "bg-emerald-950 text-emerald-200 border-emerald-500 shadow-sm"
                        }`}
                      >
                        {isCard2AReversed ? (
                          <>
                            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                            <span>TRỞ NGẠI (NGƯỢC)</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>HỖ TRỢ (XUÔI)</span>
                          </>
                        )}
                      </span>

                      {onToggleCard2A && (
                        <button
                          type="button"
                          onClick={() => {
                            try {
                              zenAudio.playCardFlipSound();
                            } catch {
                              // ignore
                            }
                            onToggleCard2A();
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-serif bg-black/40 hover:bg-black/70 border border-white/20 text-[#EAD8B1] hover:text-white transition-all cursor-pointer active:scale-95"
                          title="Đảo chiều Thuận ⇄ Nghịch để chiêm nghiệm thế ngược lại"
                        >
                          <RotateCw className="w-3 h-3 text-[#C9A55A]" />
                          <span>Đảo Chiều</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Chi Tiết Quẻ & Hình Ảnh */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-3">
                    {/* Visual Card */}
                    <div className="relative shrink-0 flex flex-col items-center">
                      <div
                        className={`p-1.5 rounded-xl border ${
                          isCard2AReversed
                            ? "bg-red-950/40 border-red-700/60 shadow-[0_0_10px_rgba(239,68,68,0.25)]"
                            : "bg-emerald-950/40 border-emerald-700/60 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                        }`}
                      >
                        <CardVisual
                          hexagram={card2A}
                          imageUrl={cardImages[card2A.number]}
                          videoUrl={cardVideos[card2A.number]}
                          size="sm"
                          isReversed={isCard2AReversed}
                          onImageUpdated={onImageUpdated}
                          showName={false}
                          enableZoomModal={true}
                        />
                      </div>
                      <span
                        className={`mt-1.5 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          isCard2AReversed
                            ? "bg-red-950 text-red-300 border border-red-800"
                            : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                        }`}
                      >
                        {isCard2AReversed ? "↷ Xoay Ngược 180°" : "✓ Chiều Thuận"}
                      </span>
                    </div>

                    {/* Văn Bản Luận Giải */}
                    <div className="space-y-2 min-w-0 flex-1">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#C9A55A]">
                            Quẻ #{card2A.number}
                          </span>
                          <span className="text-xs text-[#A89882]">• {card2A.omen}</span>
                        </div>
                        <h5 className="text-base sm:text-lg font-serif font-bold text-[#F5EAD4]">
                          {card2A.name} ({card2A.vietnameseName})
                        </h5>
                        <p className="text-xs text-[#C8B89E] font-serif italic">
                          "{card2A.judgment}"
                        </p>
                      </div>

                      {/* Phân Tích Ý Nghĩa Theo Chiều */}
                      <div
                        className={`p-2.5 rounded-lg border text-xs space-y-1 ${
                          isCard2AReversed
                            ? "bg-red-950/30 border-red-900/50 text-red-100"
                            : "bg-emerald-950/30 border-emerald-900/50 text-emerald-100"
                        }`}
                      >
                        <div className="font-bold flex items-center gap-1.5 text-[11px]">
                          <Zap className="w-3.5 h-3.5" />
                          <span>{interp2A.roleDescription}</span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-[#DDD0BE]">
                          {interp2A.energyTone}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Khuyên Giải Hành Động Cho 2A */}
                <div className="pt-2 border-t border-white/10 text-xs">
                  <div className="text-[10px] font-mono text-[#C9A55A] uppercase font-bold mb-0.5">
                    {isCard2AReversed ? "Phương Pháp Hóa Giải Trở Ngại:" : "Bí Quyết Phát Huy Trợ Lực:"}
                  </div>
                  <p className="text-[11px] text-[#CBBBA8] leading-relaxed italic">
                    {interp2A.actionAdvice}
                  </p>
                </div>
              </div>

              {/* ========================================================= */}
              {/* LÁ 2B (Nếu là Thập Tinh Mở Rộng 11 Lá)                     */}
              {/* ========================================================= */}
              {isExpandedSpread && card2B && interp2B && (
                <div
                  className={`p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between ${
                    isCard2BReversed
                      ? "bg-gradient-to-br from-[#241212]/90 to-[#180e0e]/90 border-red-600/70 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                      : "bg-gradient-to-br from-[#122216]/90 to-[#0e1711]/90 border-emerald-600/70 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                  }`}
                >
                  <div>
                    {/* Nhãn Vị Trí & Nút Đổi Chiều */}
                    <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-[#2D2114] text-[#FF7B54] text-xs font-mono font-bold flex items-center justify-center border border-[#663825]">
                          2B
                        </span>
                        <div>
                          <h4 className="text-xs sm:text-sm font-serif font-bold text-[#F5EAD4]">
                            QUẺ 2B • NỘI LỰC / CHIỀU SÂU
                          </h4>
                          <p className="text-[10px] text-[#A89882] font-mono">
                            Lực chắn thứ hai (Nhánh B song hành)
                          </p>
                        </div>
                      </div>

                      {/* Trạng Thái Badge */}
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-xs font-serif font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 ${
                            isCard2BReversed
                              ? "bg-red-950 text-red-200 border-red-500 shadow-sm"
                              : "bg-emerald-950 text-emerald-200 border-emerald-500 shadow-sm"
                          }`}
                        >
                          {isCard2BReversed ? (
                            <>
                              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                              <span>TRỞ NGẠI (NGƯỢC)</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>HỖ TRỢ (XUÔI)</span>
                            </>
                          )}
                        </span>

                        {onToggleCard2B && (
                          <button
                            type="button"
                            onClick={() => {
                              try {
                                zenAudio.playCardFlipSound();
                              } catch {
                                // ignore
                              }
                              onToggleCard2B();
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-serif bg-black/40 hover:bg-black/70 border border-white/20 text-[#EAD8B1] hover:text-white transition-all cursor-pointer active:scale-95"
                            title="Đảo chiều Thuận ⇄ Nghịch để chiêm nghiệm thế ngược lại"
                          >
                            <RotateCw className="w-3 h-3 text-[#C9A55A]" />
                            <span>Đảo Chiều</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Chi Tiết Quẻ & Hình Ảnh */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-3">
                      {/* Visual Card */}
                      <div className="relative shrink-0 flex flex-col items-center">
                        <div
                          className={`p-1.5 rounded-xl border ${
                            isCard2BReversed
                              ? "bg-red-950/40 border-red-700/60 shadow-[0_0_10px_rgba(239,68,68,0.25)]"
                              : "bg-emerald-950/40 border-emerald-700/60 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                          }`}
                        >
                          <CardVisual
                            hexagram={card2B}
                            imageUrl={cardImages[card2B.number]}
                            videoUrl={cardVideos[card2B.number]}
                            size="sm"
                            isReversed={isCard2BReversed}
                            onImageUpdated={onImageUpdated}
                            showName={false}
                            enableZoomModal={true}
                          />
                        </div>
                        <span
                          className={`mt-1.5 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                            isCard2BReversed
                              ? "bg-red-950 text-red-300 border border-red-800"
                              : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          }`}
                        >
                          {isCard2BReversed ? "↷ Xoay Ngược 180°" : "✓ Chiều Thuận"}
                        </span>
                      </div>

                      {/* Văn Bản Luận Giải */}
                      <div className="space-y-2 min-w-0 flex-1">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#FF7B54]">
                              Quẻ #{card2B.number}
                            </span>
                            <span className="text-xs text-[#A89882]">• {card2B.omen}</span>
                          </div>
                          <h5 className="text-base sm:text-lg font-serif font-bold text-[#F5EAD4]">
                            {card2B.name} ({card2B.vietnameseName})
                          </h5>
                          <p className="text-xs text-[#C8B89E] font-serif italic">
                            "{card2B.judgment}"
                          </p>
                        </div>

                        {/* Phân Tích Ý Nghĩa Theo Chiều */}
                        <div
                          className={`p-2.5 rounded-lg border text-xs space-y-1 ${
                            isCard2BReversed
                              ? "bg-red-950/30 border-red-900/50 text-red-100"
                              : "bg-emerald-950/30 border-emerald-900/50 text-emerald-100"
                          }`}
                        >
                          <div className="font-bold flex items-center gap-1.5 text-[11px]">
                            <Zap className="w-3.5 h-3.5" />
                            <span>{interp2B.roleDescription}</span>
                          </div>
                          <p className="text-[11px] leading-relaxed text-[#DDD0BE]">
                            {interp2B.energyTone}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Khuyên Giải Hành Động Cho 2B */}
                  <div className="pt-2 border-t border-white/10 text-xs">
                    <div className="text-[10px] font-mono text-[#C9A55A] uppercase font-bold mb-0.5">
                      {isCard2BReversed ? "Phương Pháp Hóa Giải Trở Ngại:" : "Bí Quyết Phát Huy Trợ Lực:"}
                    </div>
                    <p className="text-[11px] text-[#CBBBA8] leading-relaxed italic">
                      {interp2B.actionAdvice}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* PHÂN TÍCH TỔNG HỢP NĂNG LƯỢNG GIAO THOA (SYNTHESIS BOX) */}
            {isExpandedSpread && card2B && (
              <div className="p-3.5 rounded-xl bg-black/40 border border-[#443322] space-y-2">
                <div className="flex items-center gap-2 text-xs font-serif font-bold text-[#F5D061]">
                  <ArrowRightLeft className="w-4 h-4 text-[#C9A55A]" />
                  <span>TỔNG LUẬN TƯƠNG QUAN 2A & 2B VỚI TÌNH HUỐNG HIỆN TẠI (LÁ 1)</span>
                </div>

                <div className="text-xs text-[#EAD8B1] leading-relaxed space-y-1.5 font-serif">
                  {isBothSupport && (
                    <p>
                      🌟 <strong className="text-emerald-300">Cùng Thuận (Hỗ Trợ Nhân Đôi):</strong> Quẻ 2A (#{card2A.number} {card2A.name}) và Quẻ 2B (#{card2B.number} {card2B.name}) đều thuận lý cát tường. Ngoại cảnh đang ủng hộ bạn, đồng thời nội lực và đồng minh sẵn sàng chung sức. Tình huống của Lá 1 ({card1 ? `Quẻ #${card1.number} ${card1.name}` : "Hiện Tại"}) sẽ được khai mở vô cùng mạnh mẽ, gặp dữ hóa lành, việc định làm nên quả quyết dấn bước!
                    </p>
                  )}
                  {isBothObstacle && (
                    <p>
                      ⚠️ <strong className="text-red-300">Cùng Nghịch (Trùng Điệp Trở Ngại):</strong> Cả 2A và 2B đều ở thế Nghịch, mang năng lượng cản trở kép. Ngoại cảnh xuất hiện rào cản từ quẻ #{card2A.number}, bên trong lại vướng mắc điểm nghẽn từ quẻ #{card2B.number}. Đối với Lá 1, đây là giai đoạn thử thách cao độ: Tuyệt đối không manh động, tránh quyết định vội vàng hay mở rộng quy mô. Hãy áp dụng triết lý "Thủ Chính Ứng Biến" để bảo toàn nguyên khí.
                    </p>
                  )}
                  {is2ASupport2BObstacle && (
                    <p>
                      ⚖️ <strong className="text-amber-300">Thuận - Nghịch (Trước Trợ Lực, Sau Trở Ngại):</strong> Quẻ 2A thuận lợi bề ngoài tạo đà khởi động rất trôi chảy, nhưng Quẻ 2B ở thế nghịch ẩn tàng rủi ro chiều sâu. Lời khuyên Dịch học: Đừng để vẻ thuận lợi ban đầu làm lơ là cảnh giác. Hãy tận dụng tối đa trợ lực của 2A (#{card2A.name}) để sớm xây dựng hàng rào phòng ngự hóa giải điểm nghẽn từ 2B (#{card2B.name}).
                    </p>
                  )}
                  {is2AObstacle2BSupport && (
                    <p>
                      ❖ <strong className="text-indigo-300">Nghịch - Thuận (Tiền Nan Hậu Dị • Vượt Trở Ngại Đón Thành Công):</strong> Quẻ 2A nghịch mang lại khó khăn bước đầu, đòi hỏi sự kiên nhẫn và sức chịu đựng. Tuy nhiên, Quẻ 2B ở thế thuận chính là phúc khí và giải pháp cứu vớt ở tầng sâu. "Khổ tận cam lai", chỉ cần bạn vững tâm vượt qua khúc quanh ban đầu của 2A, năng lượng trợ duyên của 2B (#{card2B.name}) sẽ bùng phát dẫn lối thắng lợi!
                    </p>
                  )}
                </div>

                {/* Hướng Dẫn Chiêm Nghiệm Nhanh */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-[#A89882] flex-wrap gap-2">
                  <span className="flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-[#C9A55A]" />
                    Mẹo: Bấm các nút "Đảo Chiều" hoặc "Thế" phía trên để khám phá các kịch bản đối nghịch.
                  </span>
                  <span className="text-[#C9A55A] font-mono">
                    Hỗ Trợ: Xanh Lục • Trở Ngại: Đỏ Son
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
