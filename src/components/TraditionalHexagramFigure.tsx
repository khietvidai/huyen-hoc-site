import React, { useState } from "react";
import { Hexagram } from "../types";
import {
  calculateLucHaoDetail,
  getCurrentDayStem,
  ThienCan,
  LucHaoLineData,
  WuXing,
  LucThu,
} from "../data/lucHaoData";
import { Sparkles, Calendar, HelpCircle, Shield, ArrowRight } from "lucide-react";

interface TraditionalHexagramFigureProps {
  primaryHexagram: Hexagram;
  changingLines?: number[];
  transformedHexagram?: Hexagram;
  title?: string;
  sourceMethodName?: string; // "Rút Cỏ Thi 50 Cọng (Đại Diễn)" hoặc "Gieo 3 Đồng Cổ Tiền (Lục Hào)"
}

// Màu sắc đại diện cho Ngũ Hành
const WUXING_STYLES: Record<WuXing, { text: string; bg: string; border: string }> = {
  "Kim": { text: "text-[#FFE28A]", bg: "bg-[#2E2413]", border: "border-[#D4AF37]/50" },
  "Mộc": { text: "text-emerald-300", bg: "bg-[#0F281E]", border: "border-emerald-600/50" },
  "Thủy": { text: "text-sky-300", bg: "bg-[#112433]", border: "border-sky-600/50" },
  "Hỏa": { text: "text-rose-400", bg: "bg-[#2D1313]", border: "border-rose-600/50" },
  "Thổ": { text: "text-amber-500", bg: "bg-[#291F11]", border: "border-amber-700/50" },
};

// Biểu tượng linh thú cho Lục Thú
const LUC_THU_ICONS: Record<LucThu, { icon: string; desc: string; color: string }> = {
  "Thanh Long": { icon: "🐉", desc: "Cát thần • Hỷ sự, quý nhân, quang minh chính đại", color: "text-emerald-400" },
  "Chu Tước": { icon: "🦚", desc: "Văn thư, tin tức, khẩu thiệt thị phi, tranh biện", color: "text-rose-400" },
  "Câu Trận": { icon: "🦁", desc: "Đất đai, trì trệ, kiện tụng, cố thủ", color: "text-amber-300" },
  "Đằng Xà": { icon: "🐍", desc: "Kinh quái, ác mộng, hoài nghi, quỷ thần ám muội", color: "text-purple-300" },
  "Bạch Hổ": { icon: "🐅", desc: "Hung sát, huyết quang, tang sự, tính khí cương liệt", color: "text-slate-200" },
  "Huyền Vũ": { icon: "🐢", desc: "Mờ ám, trộm cắp, mưu mẹo, việc kín đáo ngầm", color: "text-sky-300" },
};

const ALL_STEMS: ThienCan[] = [
  "Giáp",
  "Ất",
  "Bính",
  "Đinh",
  "Mậu",
  "Kỷ",
  "Canh",
  "Tân",
  "Nhâm",
  "Quý",
];

export const TraditionalHexagramFigure: React.FC<TraditionalHexagramFigureProps> = ({
  primaryHexagram,
  changingLines = [],
  transformedHexagram,
  title,
  sourceMethodName,
}) => {
  const [dayStem, setDayStem] = useState<ThienCan>(() => getCurrentDayStem());
  const [showHelperModal, setShowHelperModal] = useState<boolean>(false);

  // Tính toán chi tiết Lục Hào Nạp Giáp
  const lucHaoDetail = calculateLucHaoDetail(
    primaryHexagram,
    changingLines,
    dayStem,
    transformedHexagram
  );

  const { palace, lines, transformedLines } = lucHaoDetail;

  // Lật ngược thứ tự để hiển thị Hào 6 (Thượng hào) ở trên cùng, Hào 1 (Sơ hào) ở dưới cùng
  const displayLines = [...lines].reverse();
  const displayTransformedLines = transformedLines ? [...transformedLines].reverse() : [];

  return (
    <div className="bg-gradient-to-b from-[#18130E] via-[#14100C] to-[#18130E] border-2 border-[#D4AF37]/70 rounded-2xl p-4 sm:p-6 shadow-[0_10px_35px_rgba(0,0,0,0.85)] relative overflow-hidden">
      {/* Decorative Traditional Corner Motifs */}
      <div className="absolute top-2 left-2 text-[#D4AF37]/30 text-xs font-mono select-none">
        ❖ ☯ ❖
      </div>
      <div className="absolute top-2 right-2 text-[#D4AF37]/30 text-xs font-mono select-none">
        ❖ ☯ ❖
      </div>

      {/* HEADER: TIÊU ĐỀ & CHỌN CAN NGÀY */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#3D3020] pb-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl">☯</span>
            <h2 className="text-base sm:text-xl font-serif font-bold text-[#F5EAD4] tracking-wide uppercase">
              {title || "ĐỒ HÌNH QUẺ KINH DỊCH & LỤC HÀO NẠP GIÁP"}
            </h2>
          </div>
          <p className="text-xs text-[#D4AF37] font-serif mt-0.5">
            {sourceMethodName || "Phép Chiêm Cổ: Cỏ Thi Đại Diễn / Gieo 3 Cổ Tiền"} • Chuẩn Phép Dã Hạc Lão Nhân (Tăng San Bốc Dịch)
          </p>
        </div>

        {/* Can Ngày Selector (Để an Lục Thú) */}
        <div className="flex items-center gap-2 bg-[#201810] border border-[#483724] rounded-xl px-3 py-1.5 self-start md:self-auto flex-wrap">
          <span className="text-[11px] font-serif text-[#C4B299] flex items-center gap-1 font-semibold">
            <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" /> Can Ngày:
          </span>
          <div className="flex items-center gap-1 flex-wrap">
            {ALL_STEMS.map((stem) => (
              <button
                key={stem}
                type="button"
                onClick={() => setDayStem(stem)}
                className={`px-1.5 py-0.5 rounded text-[10.5px] font-serif font-bold transition-all cursor-pointer ${
                  dayStem === stem
                    ? "bg-[#D4AF37] text-[#14100C] shadow-sm scale-105"
                    : "text-[#A89882] hover:text-[#FFE28A] hover:bg-[#2C2115]"
                }`}
                title={`Chọn ngày ${stem} để an Lục Thú`}
              >
                {stem}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowHelperModal(!showHelperModal)}
            className="text-[11px] text-[#D4AF37] hover:underline flex items-center gap-0.5 ml-1 cursor-pointer font-serif"
            title="Xem giải thích quy tắc Thế Ứng, Lục Thân, Lục Thú, Phi Phục"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ý nghĩa</span>
          </button>
        </div>
      </div>

      {/* MODAL Ý NGHĨA QUY TẮC LỤC HÀO */}
      {showHelperModal && (
        <div className="mb-6 p-4 rounded-xl bg-[#1C150E] border border-[#584128] text-xs font-serif text-[#DECAB0] space-y-2 animate-in fade-in duration-200 shadow-xl">
          <div className="flex items-center justify-between font-bold text-sm text-[#FFE28A] border-b border-[#3E2D1B] pb-1.5">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" /> CẨM NANG TRA CỨU ĐỒ HÌNH LỤC HÀO KINH DỊCH
            </span>
            <button
              type="button"
              onClick={() => setShowHelperModal(false)}
              className="text-[#9C8A74] hover:text-[#FFF] text-xs px-2 py-0.5 rounded cursor-pointer"
            >
              Đóng ✕
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
            <div className="bg-[#140F0A] p-2.5 rounded-lg border border-[#332415]">
              <strong className="text-[#D4AF37] block mb-1">1. Hào Thế (世) & Ứng (應):</strong>
              <p className="text-[11px] leading-relaxed text-[#BAAA93]">
                • <strong className="text-[#FFE28A]">Thế (世):</strong> Đại diện cho bản thân người gieo quẻ, chủ thể sự việc.<br/>
                • <strong className="text-[#7DD3FC]">Ứng (應):</strong> Đại diện cho người khác, đối tác, đối thủ hoặc hoàn cảnh khách quan.
              </p>
            </div>
            <div className="bg-[#140F0A] p-2.5 rounded-lg border border-[#332415]">
              <strong className="text-[#D4AF37] block mb-1">2. Lục Thân (六親):</strong>
              <p className="text-[11px] leading-relaxed text-[#BAAA93]">
                Dựa vào Ngũ Hành Cung so với Địa Chi hào:<br/>
                • <strong className="text-[#FFE28A]">Phụ Mẫu:</strong> Cha mẹ, công văn, nhà cửa, xe cộ.<br/>
                • <strong className="text-[#F87171]">Quan Quỷ:</strong> Chức vụ, công danh, bệnh tật, thị phi.<br/>
                • <strong className="text-[#FBBF24]">Thê Tài:</strong> Tiền bạc, của cải, vợ, tài sản.<br/>
                • <strong className="text-[#34D399]">Tử Tôn:</strong> Con cái, phúc lộc, niềm vui, thuốc trị bệnh.<br/>
                • <strong className="text-[#A78BFA]">Huynh Đệ:</strong> Anh em, đồng nghiệp, bạn bè, sự tranh đoạt.
              </p>
            </div>
            <div className="bg-[#140F0A] p-2.5 rounded-lg border border-[#332415]">
              <strong className="text-[#D4AF37] block mb-1">3. Phi Thần & Phục Thần:</strong>
              <p className="text-[11px] leading-relaxed text-[#BAAA93]">
                Khi một quẻ bị <strong className="text-[#F59E0B]">khuyết Lục Thân</strong> (ví dụ không có hào Thê Tài), Lục Thân đó gọi là <strong className="text-[#F59E0B]">Phục Thần (伏神)</strong> ẩn náu sau hào tương ứng của quẻ Bát Thuần trong Cung. Hào ở quẻ hiện tại che giấu nó gọi là <strong className="text-[#E2D6C2]">Phi Thần (飛神)</strong>.
              </p>
            </div>
            <div className="bg-[#140F0A] p-2.5 rounded-lg border border-[#332415]">
              <strong className="text-[#D4AF37] block mb-1">4. Lục Thú (六獸):</strong>
              <p className="text-[11px] leading-relaxed text-[#BAAA93]">
                An từ Hào 1 lên Hào 6 dựa theo Can của ngày gieo quẻ:<br/>
                Thanh Long (Hỷ), Chu Tước (Khẩu thiệt), Câu Trận (Trì trệ), Đằng Xà (Quái dị), Bạch Hổ (Sát khí), Huyền Vũ (Mờ ám).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* KHU VỰC CHÍNH: QUẺ CHỦ & QUẺ BIẾN ĐẶT CẠNH NHAU */}
      <div className={`grid gap-4 sm:gap-6 ${transformedHexagram ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 max-w-3xl mx-auto"}`}>
        
        {/* ===================== CỘT 1: QUẺ CHỦ (BẢN QUÁI) ===================== */}
        <div className="bg-[#17120D] border border-[#483724] rounded-2xl p-3 sm:p-5 shadow-xl flex flex-col justify-between">
          <div>
            {/* Header Quẻ Chủ */}
            <div className="border-b border-[#332517] pb-3 mb-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#2D1F13] text-[#FFE28A] border border-[#583F25] text-xs font-mono font-bold whitespace-nowrap">
                    Quẻ Chủ (Gốc)
                  </span>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-[#F5EAD4]">
                    #{primaryHexagram.number} {primaryHexagram.name}
                  </h3>
                </div>
                <span className="text-xl sm:text-2xl font-serif text-[#D4AF37]">
                  {primaryHexagram.hanzi}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-1.5 flex-wrap text-xs font-serif text-[#C4B29A]">
                <span>Tên Việt: <strong className="text-[#EAD8B1]">{primaryHexagram.vietnameseName}</strong></span>
                <span>•</span>
                <span>Thuộc Cung: <strong className="text-[#FFE28A]">{palace.palaceName} ({palace.palaceElement})</strong></span>
                <span>•</span>
                <span className="px-1.5 py-0.2 rounded bg-[#241A10] text-[#D4AF37] border border-[#44331E] font-mono text-[11px]">
                  {palace.rankName}
                </span>
              </div>
            </div>

            {/* BẢNG 6 HÀO CỦA QUẺ CHỦ (TỪ HÀO 6 XUỐNG HÀO 1) */}
            <div className="overflow-x-auto pb-1 scrollbar-thin">
              <div className="space-y-1 sm:space-y-2 w-full min-w-0">
                {displayLines.map((lineData) => {
                const wuxingStyle = WUXING_STYLES[lineData.element];
                const beast = LUC_THU_ICONS[lineData.lucThu];

                return (
                  <div
                    key={`line_${lineData.lineIndex}`}
                    className={`flex items-center justify-between p-1 sm:p-2 rounded-lg sm:rounded-xl border transition-all text-[10px] sm:text-xs font-serif ${
                      lineData.isChanging
                        ? "bg-[#2E1C14] border-red-500/80 shadow-[0_0_12px_rgba(239,68,68,0.3)] ring-1 ring-red-500/50"
                        : "bg-[#1E1711] border-[#382A1C] hover:border-[#523E28]"
                    }`}
                  >
                    {/* 1. Lục Thú (Can ngày) */}
                    <div className="flex items-center gap-1 w-14 sm:w-24 shrink-0" title={`${lineData.lucThu}: ${beast.desc}`}>
                      <span className="text-xs sm:text-base">{beast.icon}</span>
                      <span className={`text-[9.5px] sm:text-[11px] font-bold ${beast.color} truncate`}>
                        {lineData.lucThu}
                      </span>
                    </div>

                    {/* 2. Hào Phục Thần (nếu có hào này che giấu Phục Thần) */}
                    <div className="w-14 sm:w-24 shrink-0 text-center">
                      {lineData.phucThan ? (
                        <div
                          className="px-1 py-0.2 rounded bg-[#2A1D0E] border border-amber-600/70 text-[8px] sm:text-[9.5px] font-mono text-amber-300 font-bold leading-tight"
                          title={`Phục Thần: ${lineData.phucThan.lucThan} ${lineData.phucThan.canChi} (${lineData.phucThan.element}) ẩn dưới Phi Thần hào ${lineData.lineIndex}`}
                        >
                          <span className="text-[#8C7A65] hidden sm:block text-[8px]">Phục Thần:</span>
                          <span>{lineData.phucThan.lucThan.slice(0, 4)} {lineData.phucThan.canChi.split(" ")[1]}</span>
                        </div>
                      ) : (
                        <span className="text-[9px] sm:text-[10px] text-[#584936] font-mono">—</span>
                      )}
                    </div>

                    {/* 3. Lục Thân + Can Chi + Ngũ Hành */}
                    <div className="flex items-center gap-1 w-20 sm:w-32 shrink-0">
                      <span
                        className={`px-1 py-0.2 sm:px-1.5 sm:py-0.5 rounded text-[9.5px] sm:text-[11px] font-bold border ${wuxingStyle.bg} ${wuxingStyle.text} ${wuxingStyle.border} whitespace-nowrap`}
                      >
                        {lineData.lucThan}
                      </span>
                      <span className="text-[#DECAB0] font-mono text-[10px] sm:text-xs font-semibold whitespace-nowrap">
                        {lineData.canChi}
                      </span>
                    </div>

                    {/* 4. Thế / Ứng */}
                    <div className="w-6 sm:w-8 shrink-0 text-center font-bold font-serif text-[10px] sm:text-xs">
                      {lineData.isThe ? (
                        <span className="px-1 py-0.2 rounded bg-[#3D2C13] text-[#FFE28A] border border-[#D4AF37] shadow-sm">
                          Thế
                        </span>
                      ) : lineData.isUng ? (
                        <span className="px-1 py-0.2 rounded bg-[#102738] text-sky-300 border border-sky-500 shadow-sm">
                          Ứng
                        </span>
                      ) : null}
                    </div>

                    {/* 5. Đồ Hình Hào (Liền/Đứt) & Trạng thái Động */}
                    <div className="flex-1 max-w-[85px] sm:max-w-[130px] mx-0.5 sm:mx-2">
                      <div className="flex items-center gap-1 justify-center">
                        {lineData.isYang ? (
                          /* Hào Dương: Thanh liền */
                          <div
                            className={`h-2 sm:h-3 w-full rounded-xs transition-all ${
                              lineData.isChanging
                                ? "bg-gradient-to-r from-red-500 via-amber-400 to-red-500 shadow-[0_0_10px_rgba(239,68,68,0.7)]"
                                : "bg-gradient-to-r from-[#C29E4D] via-[#FFE28A] to-[#C29E4D]"
                            }`}
                          />
                        ) : (
                          /* Hào Âm: Thanh đứt 2 khúc */
                          <div className="flex items-center justify-between w-full gap-1.5">
                            <div
                              className={`h-2 sm:h-3 w-[44%] rounded-xs transition-all ${
                                lineData.isChanging
                                  ? "bg-gradient-to-r from-red-500 to-amber-400 shadow-[0_0_8px_rgba(239,68,68,0.7)]"
                                  : "bg-gradient-to-r from-[#9C7F45] to-[#CBB170]"
                              }`}
                            />
                            <div
                              className={`h-2 sm:h-3 w-[44%] rounded-xs transition-all ${
                                lineData.isChanging
                                  ? "bg-gradient-to-r from-amber-400 to-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]"
                                  : "bg-gradient-to-r from-[#CBB170] to-[#9C7F45]"
                              }`}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 6. Tên Hào Cổ Điển & Ký hiệu Hào Động */}
                    <div className="w-12 sm:w-16 shrink-0 text-right">
                      {lineData.isChanging ? (
                        <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded bg-red-950/80 text-rose-300 font-mono text-[9px] sm:text-[10px] font-bold border border-red-500/60 animate-pulse">
                          <span>{lineData.isYang ? "○" : "✕"}</span>
                          <span>ĐỘNG</span>
                        </span>
                      ) : (
                        <span className="text-[#8E7E6B] font-serif text-[10px] sm:text-xs">
                          {lineData.traditionalName}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          </div>

          {/* Footer Quẻ Chủ */}
          <div className="mt-4 pt-3 border-t border-[#332517] flex items-center justify-between text-[11px] text-[#A69780] font-serif">
            <span>Hào Thế: <strong className="text-[#FFE28A]">Hào {palace.theLine}</strong> • Hào Ứng: <strong className="text-sky-300">Hào {palace.ungLine}</strong></span>
            {changingLines.length > 0 ? (
              <span className="text-rose-400 font-semibold font-mono">
                ⚡ Có {changingLines.length} Hào Động biến hóa
              </span>
            ) : (
              <span className="text-emerald-400 font-semibold">Quẻ Tĩnh (Không động)</span>
            )}
          </div>
        </div>

        {/* ===================== CỘT 2: QUẺ BIẾN (CHIÊM TƯỢNG - NẾU CÓ) ===================== */}
        {transformedHexagram && displayTransformedLines.length > 0 && (
          <div className="bg-[#17120D] border border-[#483724] rounded-2xl p-3 sm:p-5 shadow-xl flex flex-col justify-between">
            <div>
              {/* Header Quẻ Biến */}
              <div className="border-b border-[#332517] pb-3 mb-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#2D1F13] text-[#F97316] border border-[#583F25] text-xs font-mono font-bold flex items-center gap-1">
                      <span>➔</span> Quẻ Biến (Chiêm Tượng)
                    </span>
                    <h3 className="text-base sm:text-lg font-serif font-bold text-[#F5EAD4]">
                      #{transformedHexagram.number} {transformedHexagram.name}
                    </h3>
                  </div>
                  <span className="text-xl sm:text-2xl font-serif text-[#F97316]">
                    {transformedHexagram.hanzi}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-1.5 flex-wrap text-xs font-serif text-[#C4B29A]">
                  <span>Tên Việt: <strong className="text-[#EAD8B1]">{transformedHexagram.vietnameseName}</strong></span>
                  <span>•</span>
                  <span>Xu hướng biến chuyển từ các hào động</span>
                </div>
              </div>

              {/* BẢNG 6 HÀO CỦA QUẺ BIẾN */}
              <div className="overflow-x-auto pb-1 scrollbar-thin">
                <div className="space-y-1 sm:space-y-2 w-full min-w-0">
                  {displayTransformedLines.map((tLineData) => {
                  const wuxingStyle = WUXING_STYLES[tLineData.element];

                  return (
                    <div
                      key={`trans_line_${tLineData.lineIndex}`}
                      className={`flex items-center justify-between p-1 sm:p-2 rounded-lg sm:rounded-xl border transition-all text-[10px] sm:text-xs font-serif ${
                        tLineData.isChanging
                          ? "bg-[#251A10] border-amber-500/80 shadow-[0_0_10px_rgba(245,158,11,0.25)] ring-1 ring-amber-500/40"
                          : "bg-[#1E1711] border-[#382A1C] opacity-80"
                      }`}
                    >
                      {/* 1. Hào số & Hào Đổi */}
                      <div className="w-12 sm:w-16 shrink-0">
                        {tLineData.isChanging ? (
                          <span className="px-1 py-0.2 rounded bg-amber-950/80 text-amber-300 font-mono text-[9px] sm:text-[10px] font-bold border border-amber-600/60">
                            Biến {tLineData.lineIndex}
                          </span>
                        ) : (
                          <span className="text-[#7A6C5B] font-serif text-[10px] sm:text-[11px]">
                            Hào {tLineData.lineIndex}
                          </span>
                        )}
                      </div>

                      {/* 2. Lục Thân + Can Chi + Ngũ Hành của Hào Biến */}
                      <div className="flex items-center gap-1 w-24 sm:w-36 shrink-0">
                        <span
                          className={`px-1 py-0.2 sm:px-1.5 sm:py-0.5 rounded text-[9.5px] sm:text-[11px] font-bold border ${wuxingStyle.bg} ${wuxingStyle.text} ${wuxingStyle.border} whitespace-nowrap`}
                        >
                          {tLineData.lucThan}
                        </span>
                        <span className="text-[#DECAB0] font-mono text-[10px] sm:text-xs font-semibold whitespace-nowrap">
                          {tLineData.canChi}
                        </span>
                      </div>

                      {/* 3. Đồ Hình Hào Biến */}
                      <div className="flex-1 max-w-[85px] sm:max-w-[130px] mx-0.5 sm:mx-2">
                        <div className="flex items-center gap-1 justify-center">
                          {tLineData.isYang ? (
                            <div
                              className={`h-2 sm:h-3 w-full rounded-xs transition-all ${
                                tLineData.isChanging
                                  ? "bg-gradient-to-r from-amber-500 via-[#FFE28A] to-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"
                                  : "bg-[#8E7642]"
                              }`}
                            />
                          ) : (
                            <div className="flex items-center justify-between w-full gap-1.5">
                              <div
                                className={`h-2 sm:h-3 w-[44%] rounded-xs transition-all ${
                                  tLineData.isChanging
                                    ? "bg-gradient-to-r from-amber-500 to-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.6)]"
                                    : "bg-[#7A6335]"
                                }`}
                              />
                              <div
                                className={`h-2 sm:h-3 w-[44%] rounded-xs transition-all ${
                                  tLineData.isChanging
                                    ? "bg-gradient-to-r from-amber-300 to-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"
                                    : "bg-[#7A6335]"
                                }`}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 4. Tên Hào Cổ Điển Quẻ Biến */}
                      <div className="w-12 sm:w-16 shrink-0 text-right">
                        <span className="text-[#A89882] font-serif text-[10px] sm:text-[11px]">
                          {tLineData.traditionalName}
                        </span>
                      </div>
                    </div>
                  );
                })}
                </div>
              </div>
            </div>

            {/* Footer Quẻ Biến */}
            <div className="mt-4 pt-3 border-t border-[#332517] flex items-center justify-between text-[11px] text-[#A69780] font-serif">
              <span>Hồi Đầu Sinh/Khắc theo ngũ hành chi hào động</span>
              <span className="text-[#D4AF37] font-semibold">Tương lai & Kết quả</span>
            </div>
          </div>
        )}
      </div>

      {/* Ghi chú luận giải Lục Hào ngắn gọn dưới đồ hình */}
      <div className="mt-5 p-3 rounded-xl bg-[#1B140E] border border-[#3E2D1B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-serif text-[#C4B29A]">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#D4AF37] shrink-0" />
          <span>
            Đồ hình Lục Hào phản ánh trường khí vi mô của vạn vật: Hào Thế (Bản thân) • Hào Ứng (Đối phương/Sự việc) • Phục Thần (Nguyên nhân chìm).
          </span>
        </div>
        <span className="text-[11px] text-[#8C7A65] font-mono shrink-0">
          Dã Hạc Lão Nhân • Tăng San Bốc Dịch
        </span>
      </div>
    </div>
  );
};
