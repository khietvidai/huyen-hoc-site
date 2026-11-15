import React, { useState, useRef, useEffect } from "react";
import {
  Scroll,
  Copy,
  Check,
  Flame,
  Sparkles,
  Lightbulb,
} from "lucide-react";
import { Hexagram } from "../types";
import { formatKhongMinhKinhDich, KhongMinhKinhDichResult } from "../utils/khongMinhKinhDichFormatter";

let lastCopyStatusMessage = "";

interface KhongMinhKinhDichViewProps {
  primaryHex: Hexagram;
  activeLine?: number;
  sourceName?: string;
  onShowToast?: (msg: string) => void;
  className?: string;
}

export const KhongMinhKinhDichView: React.FC<KhongMinhKinhDichViewProps> = ({
  primaryHex,
  activeLine = 2,
  sourceName = "Lá thứ 3",
  onShowToast,
  className = "",
}) => {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const [liveStatusText, setLiveStatusText] = useState("");
  const [viewMode, setViewMode] = useState<"card" | "raw">("card");
  const copyTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const result: KhongMinhKinhDichResult = React.useMemo(() => {
    return formatKhongMinhKinhDich(primaryHex, activeLine, sourceName);
  }, [primaryHex, activeLine, sourceName]);

  const reportCopyOutcome = (ok: boolean) => {
    if (copyTimerRef.current) {
      window.clearTimeout(copyTimerRef.current);
    }
    let msg = ok ? "Đã sao chép" : "Sao chép thất bại";
    if (msg === lastCopyStatusMessage) {
      msg += "\u00A0";
    }
    lastCopyStatusMessage = msg;
    setCopyState(ok ? "copied" : "failed");
    setLiveStatusText("");
    window.requestAnimationFrame(() => setLiveStatusText(msg));
    if (ok && onShowToast) {
      onShowToast("Đã sao chép toàn văn dữ liệu Quẻ Khổng Minh Thần Toán Gia Kinh Dịch!");
    }
    copyTimerRef.current = window.setTimeout(() => {
      setCopyState("idle");
      setLiveStatusText("");
      copyTimerRef.current = null;
    }, 2500);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.plainText);
      reportCopyOutcome(true);
    } catch {
      const field = Object.assign(document.createElement("textarea"), { value: result.plainText });
      field.setAttribute("readonly", "");
      field.style.cssText = "position:fixed;inset-block-start:0;opacity:0";
      document.body.append(field);
      field.select();
      let fallbackOk = false;
      try {
        fallbackOk = document.execCommand("copy");
      } finally {
        field.remove();
      }
      reportCopyOutcome(fallbackOk);
    }
  };

  return (
    <div
      className={`bg-gradient-to-br from-[#1A120B] via-[#140D07] to-[#0A0604] border border-[#4A341E] rounded-2xl p-4 sm:p-6 md:p-7 shadow-2xl text-[#E6D7BD] font-serif space-y-6 relative overflow-hidden ${className}`}
    >
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar: Title & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#362413] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-[#120F0C] font-black shadow-md">
              <Scroll className="w-4 h-4" aria-hidden="true" />
            </div>
            <h3 className="font-serif font-black text-base sm:text-lg md:text-xl text-[#F5EAD4] tracking-wide uppercase">
              QUẺ KHỔNG MINH THẦN TOÁN GIA KINH DỊCH
            </h3>
          </div>
          <p className="text-xs text-[#A89882] pl-10">
            Hệ Thống Tứ Quái Đồng Chiếu Cùng Hào Động (Chính — Tông — Hỗ — Thác) &amp; Thơ Xăm Khổng Minh
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
          {/* Mode Switcher */}
          <div className="bg-[#1C130B] border border-[#3E2815] rounded-xl p-0.5 flex items-center text-xs">
            <button
              type="button"
              onClick={() => setViewMode("card")}
              className={`min-w-[24px] min-h-[24px] px-3 py-1.5 rounded-lg transition-colors cursor-pointer font-serif ${
                viewMode === "card"
                  ? "bg-amber-600/30 text-amber-300 font-bold border border-amber-600/50 shadow-sm"
                  : "text-[#A89882] hover:text-[#E6D7BD]"
              }`}
            >
              Giao Diện Thẻ
            </button>
            <button
              type="button"
              onClick={() => setViewMode("raw")}
              className={`min-w-[24px] min-h-[24px] px-3 py-1.5 rounded-lg transition-colors cursor-pointer font-serif ${
                viewMode === "raw"
                  ? "bg-amber-600/30 text-amber-300 font-bold border border-amber-600/50 shadow-sm"
                  : "text-[#A89882] hover:text-[#E6D7BD]"
              }`}
            >
              Văn Bản Chuẩn Sách
            </button>
          </div>

          {/* Copy Button + External Live Region */}
          <span className="relative inline-flex items-center">
            <button
              type="button"
              onClick={handleCopy}
              data-copied={copyState === "copied" ? "" : undefined}
              data-failed={copyState === "failed" ? "" : undefined}
              className={`min-w-[24px] min-h-[24px] flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs font-serif transition-opacity shadow-md active:scale-95 cursor-pointer ${
                copyState === "failed"
                  ? "bg-rose-700 text-white border border-rose-400"
                  : "bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-[#120F0C]"
              }`}
              title="Sao chép toàn bộ dữ liệu chuẩn theo sách Khổng Minh Thần Toán Gia Kinh Dịch"
            >
              {copyState === "copied" ? (
                <Check className="w-4 h-4 text-[#120F0C]" aria-hidden="true" />
              ) : (
                <Copy className="w-4 h-4 text-current" aria-hidden="true" />
              )}
              <span>
                {copyState === "copied"
                  ? "Đã Sao Chép!"
                  : copyState === "failed"
                  ? "Sao Chép Lỗi"
                  : "Sao Chép Dữ Liệu Sách"}
              </span>
            </button>
            <span
              role="status"
              className={`pointer-events-none absolute -top-7 right-0 rounded bg-[#26190E] border border-amber-500/60 px-2 py-0.5 text-[10px] font-sans text-amber-200 whitespace-nowrap transition-opacity duration-150 ${
                liveStatusText ? "opacity-100" : "opacity-0"
              }`}
            >
              {liveStatusText}
            </span>
          </span>
        </div>
      </div>

      {/* RAW PLAIN TEXT MODE */}
      {viewMode === "raw" && (
        <div className="space-y-2">
          <div className="text-[11px] font-mono text-[#A89882] flex items-center justify-between">
            <span>Định dạng văn bản chuẩn theo sách Khổng Minh Thần Toán Gia Kinh Dịch:</span>
            <span className="text-amber-400">Ấn &lsquo;Sao Chép Dữ Liệu Sách&rsquo; để chép nhanh</span>
          </div>
          <pre className="p-4 sm:p-5 rounded-xl bg-[#0C0805] border border-[#2D1F13] text-[#E8DCBF] font-mono text-xs sm:text-[13px] leading-relaxed overflow-x-auto whitespace-pre-wrap select-all shadow-inner">
            {result.plainText}
          </pre>
        </div>
      )}

      {/* CARD GRAPHICAL VIEW */}
      {viewMode === "card" && (
        <div className="space-y-6">
          {/* 1. KHUNG 6 HÀO & CÁCH TÌM HÀO ĐỘNG & LỆNH HÀNH ĐỘNG */}
          <div className="bg-[#120B06] border border-[#3A2614] p-4 sm:p-5 rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#28180B] pb-2 flex-wrap gap-2">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" /> 6 HÀO QUẺ CHÍNH &amp; VỊ THẾ HÀO ĐỘNG
              </span>
              <span className="text-[11px] text-[#A69780] font-mono">
                Theo sách: Chỉ xét Đắc vị / Thất vị &amp; Đắc trung tại duy nhất Hào động
              </span>
            </div>

            {/* 6 Hào List */}
            <div className="space-y-2">
              {result.linesStatus.map((item) => {
                const isMoving = item.isMoving;
                const isDacVi = item.statusText.includes("Đắc vị");
                return (
                  <div
                    key={item.line}
                    className={`flex items-center justify-between p-2 sm:p-2.5 rounded-lg border transition-colors ${
                      isMoving
                        ? "bg-[#2A160C] border-amber-500/80 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                        : "bg-[#181008] border-[#2A1C10]"
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`w-5 h-5 rounded text-[10px] font-mono font-bold flex items-center justify-center ${
                          isMoving
                            ? "bg-amber-500 text-[#140D07]"
                            : "bg-[#2B1D11] text-[#C9A55A] border border-[#44301D]"
                        }`}
                      >
                        {item.line}
                      </span>
                      <span className="text-xs sm:text-sm font-serif font-bold text-[#F5EAD4]">
                        Hào {item.line} {item.polarity}
                      </span>
                      {isMoving && (
                        <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
                          <Flame className="w-3 h-3 text-red-400 animate-pulse" aria-hidden="true" /> Hào động
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${
                          !isMoving
                            ? "bg-[#1E140B] text-[#8E7D68] border-[#332213]"
                            : isDacVi
                            ? "bg-emerald-950/60 text-emerald-300 border-emerald-800/60"
                            : "bg-amber-950/60 text-amber-300 border-amber-800/60"
                        }`}
                      >
                        {item.statusText}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Finding Method Banner */}
            <div className="bg-[#1C1107] border border-[#482F17] p-3 rounded-lg text-xs font-serif text-[#F2E5C9] flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-bold">➔</span>
                <span className="font-bold">{result.findingMethodText}</span>
              </div>
            </div>

            {/* Quy Tắc Hành Động Khổng Minh — Kinh Dịch Banner */}
            <div
              className={`p-3.5 sm:p-4 rounded-xl space-y-1.5 shadow-md border ${
                result.oracleBlock.isHung
                  ? "bg-gradient-to-r from-[#2B1215] via-[#210D10] to-[#17090B] border-rose-500/70"
                  : "bg-gradient-to-r from-[#13261A] via-[#0F1E14] to-[#0A150E] border-emerald-500/70"
              }`}
            >
              <div
                className={`text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  result.oracleBlock.isHung ? "text-rose-300" : "text-emerald-300"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                <span>
                  {result.oracleBlock.isHung
                    ? "🔄 QUẺ KHỔNG MINH LÀ HUNG ➔ HÀNH ĐỘNG NGƯỢC LẠI VỚI LỜI KHUYÊN THUẬN CỦA KINH DỊCH"
                    : "✅ QUẺ KHỔNG MINH LÀ CÁT ➔ LÀM THEO LỜI KHUYÊN HÀNH ĐỘNG THUẬN CỦA KINH DỊCH"}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#FFF2D4] leading-relaxed">
                {result.actionPrincipleBannerText}
              </p>
            </div>
          </div>

          {/* 2. KHU VỰC QUẺ XĂM KHỔNG MINH THẦN SỐ (DIỆN) */}
          <div className="bg-[#120B06] border border-[#3A2614] p-4 sm:p-6 rounded-xl space-y-4">
            <div className="border-b border-[#2B1B0F] pb-2 flex items-center justify-between flex-wrap gap-2">
              <h4 className="font-serif font-black text-sm sm:text-base text-amber-400 uppercase tracking-wide flex items-center gap-2">
                <span>PHẦN I — QUẺ XĂM KHỔNG MINH THẦN SỐ (DIỆN)</span>
              </h4>
              <span className="text-xs font-mono font-bold text-amber-300 bg-[#26170B] px-3 py-1 rounded-full border border-[#4E3218]">
                Quẻ số #{result.oracleBlock.formattedNum} • {result.oracleBlock.oracleType}
              </span>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-[#DDD0BD] leading-relaxed pl-1">
              <div>
                Hào {result.activeLine} của quẻ <strong>{result.primaryBlock.pdfHexName}</strong> ứng với{" "}
                <strong>Quẻ số {result.oracleBlock.formattedNum}</strong> trong hệ thống Khổng Minh Thần Số.
              </div>
              <div>
                - Loại xăm:{" "}
                <strong className={result.oracleBlock.isHung ? "text-rose-400" : "text-emerald-400"}>
                  {result.oracleBlock.oracleType}
                </strong>{" "}
                <span
                  className={`inline-block ml-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                    result.oracleBlock.isHung
                      ? "bg-rose-950/80 text-rose-200 border-rose-500/70"
                      : "bg-emerald-950/80 text-emerald-200 border-emerald-500/70"
                  }`}
                >
                  {result.oracleBlock.isHung
                    ? "🔄 Xăm HUNG ➔ Hành động NGƯỢC LẠI lời khuyên thuận của Kinh Dịch"
                    : "✅ Xăm CÁT ➔ Làm THEO lời khuyên hành động thuận của Kinh Dịch"}
                </span>
              </div>

              {/* Kinh văn chữ Hán & Âm Hán Việt */}
              <div className="bg-[#1A1108] p-4 rounded-xl border border-[#382514] space-y-2 text-center my-2">
                <div className="font-serif font-black text-xl sm:text-2xl text-[#FFE59E] tracking-widest leading-relaxed drop-shadow">
                  &ldquo;{result.oracleBlock.poemHanzi}&rdquo;
                </div>
                <div className="text-xs sm:text-sm font-bold text-amber-300 italic">
                  Âm Hán Việt: &ldquo;{result.oracleBlock.poemHaniViet}&rdquo;
                </div>
              </div>

              <div>
                - <strong>Dịch thơ / Diễn xuôi:</strong> &ldquo;{result.oracleBlock.poemMeaning}&rdquo;
              </div>

              {result.oracleBlock.lineExplanations.length > 0 && (
                <div className="space-y-2 pt-1">
                  <strong className="text-amber-300 block">- Giải nghĩa chi tiết từng câu thơ:</strong>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {result.oracleBlock.lineExplanations.map((exp, idx) => (
                      <div
                        key={idx}
                        className="bg-[#181008] border border-[#332110] rounded-lg p-3 space-y-1 text-xs"
                      >
                        <div className="font-bold text-amber-200">
                          Câu {idx + 1}: {exp.lineTitle}
                        </div>
                        <div className="text-[#C8B9A0]">
                          <strong>Nghĩa đen:</strong> {exp.literalMeaning}
                        </div>
                        <div className="text-[#E6D7BD]">
                          <strong className="text-amber-400/90">Hàm ý:</strong> {exp.implication}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-1">
                - <strong>Luận giải chi tiết:</strong> {result.oracleBlock.detailedExplanation}
                <div className="pl-3 mt-2 space-y-1.5 bg-[#191109] p-3.5 rounded-xl border border-[#3B2613]">
                  <div className="text-amber-300 font-bold">
                    ⚡ Quy tắc phối hợp Khổng Minh &amp; Kinh Dịch: {result.oracleBlock.actionPrincipleRule}
                  </div>
                  <div className="text-emerald-300">
                    *{" "}
                    <strong>
                      Hành động áp dụng ({result.oracleBlock.isHung ? "Làm ngược lời khuyên Kinh Dịch" : "Làm theo lời khuyên Kinh Dịch"}):
                    </strong>{" "}
                    {result.oracleBlock.doList}
                  </div>
                  <div className="text-rose-300">
                    * <strong>Điều tuyệt đối tránh:</strong> {result.oracleBlock.avoidList}
                  </div>
                  <div className="text-amber-200">
                    * <strong>Thái độ cần có:</strong> {result.oracleBlock.attitude}
                  </div>
                </div>
              </div>

              <div>
                - <strong>Tượng số của xăm:</strong> {result.oracleBlock.symbolicFigure}
              </div>
            </div>
          </div>

          {/* 3. KHU VỰC QUẺ CHÍNH & HÀO ĐỘNG */}
          <div className="bg-[#120B06] border border-[#3A2614] p-4 sm:p-6 rounded-xl space-y-4">
            <div className="border-b border-[#2B1B0F] pb-2 flex items-center justify-between flex-wrap gap-2">
              <h4 className="font-serif font-black text-sm sm:text-base text-amber-400 uppercase tracking-wide flex items-center gap-2">
                <span>PHẦN II — QUẺ CHÍNH &amp; HÀO ĐỘNG {result.activeLine}</span>
              </h4>
              <span className="text-xs font-serif font-bold text-[#E6D3A3]">
                {result.primaryBlock.hexNameWithHanzi}
              </span>
            </div>

            <div className="space-y-2 text-xs sm:text-sm text-[#D8C9B0] leading-relaxed pl-1">
              <div>
                <strong className="text-amber-300">• Tên quẻ:</strong> {result.primaryBlock.hexNameWithHanzi}
              </div>
              <div>
                <strong className="text-amber-300">• Tượng &amp; Ý toàn quẻ:</strong> {result.primaryBlock.tuongYHanViet} ({result.primaryBlock.tuongYMeaning})
              </div>
              <div className="pt-1">
                <strong className="text-amber-300">• Thoán từ &amp; Tổng quan toàn quẻ:</strong>{" "}
                <span className="text-[#EADEC6]">{result.primaryBlock.trichNghiaLuanGiai}</span>
              </div>
              <div>
                <strong className="text-amber-300">• Đại tượng truyện:</strong> {result.primaryBlock.daiTuong}
              </div>
            </div>

            {/* Chi tiết Hào Động chuẩn sách */}
            <div className="mt-4 pt-4 border-t border-[#291A0E] space-y-3">
              <div className="text-xs sm:text-sm font-serif font-bold text-amber-300 flex items-center gap-2">
                <Flame className="w-4 h-4 text-red-400" aria-hidden="true" />
                <span>Hào động — {result.primaryBlock.activeLineBlock.haoVi}:</span>
              </div>

              <div className="space-y-2 text-xs sm:text-sm text-[#DDD0BD] leading-relaxed pl-3 border-l-2 border-amber-600/40">
                <div>
                  <strong className="text-[#C4B294]">- Tượng &amp; Ý hào động:</strong>{" "}
                  {result.primaryBlock.activeLineBlock.hanViet}
                </div>
                <div>
                  <strong className="text-[#C4B294]">- Phân định vị thế:</strong>{" "}
                  <span className="text-amber-300">{result.primaryBlock.activeLineBlock.phanDinhViThe}</span>
                </div>
                <div>
                  <strong className="text-[#C4B294]">- Đạo Trung Chính:</strong>{" "}
                  <span className="text-emerald-300">{result.primaryBlock.activeLineBlock.daoTrungChinh}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#1B1107] border border-[#3E2815] my-1 space-y-1">
                  <strong className="text-amber-400 block">
                    - Hào từ (Nguyên văn &amp; Dịch nghĩa theo sách):
                  </strong>
                  <div className="text-[#FFF2D4] font-medium text-xs sm:text-sm leading-relaxed">
                    {result.primaryBlock.activeLineBlock.haoTuSach}
                  </div>
                  <div className="text-xs text-[#BDAE95]">
                    Chữ Hán: {result.primaryBlock.activeLineBlock.loiHaoCotLoi}
                  </div>
                </div>

                <div className="bg-[#181108] p-3 rounded-lg border border-[#302010]">
                  <strong className="text-[#E5B552] block mb-1">
                    - Tiểu Tượng Truyện: {result.primaryBlock.activeLineBlock.tieuTuong}
                  </strong>
                  <p className="text-xs text-[#C8B9A0] italic pl-3 border-l border-[#C9A55A]/40">
                    -&gt; Nghĩa là: {result.primaryBlock.activeLineBlock.tieuTuongNghia}
                  </p>
                </div>

                <div className="bg-[#1E150A] p-3 rounded-lg border border-amber-600/40">
                  <strong className="text-amber-300 flex items-center gap-1.5 mb-1">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                    <span>Gợi ý / Nhắc nhở (Theo sách):</span>
                  </strong>
                  <p className="text-xs sm:text-sm text-[#F5EAD4] leading-relaxed">
                    {result.primaryBlock.activeLineBlock.goiYNhacNho}
                  </p>
                </div>

                <div>
                  <strong className="text-[#C4B294]">- Nghĩa lý:</strong> {result.primaryBlock.activeLineBlock.nghiaLy}
                </div>
                <div>
                  <strong className="text-[#C4B294]">- Tượng số:</strong> {result.primaryBlock.activeLineBlock.tuongSo}
                </div>
                <div>
                  <strong className="text-[#C4B294]">- Vị trí:</strong> {result.primaryBlock.activeLineBlock.viTri}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2">
                  <div
                    className={`p-3 rounded-lg border ${
                      !result.oracleBlock.isHung
                        ? "bg-[#142619] border-2 border-emerald-500 text-emerald-100 shadow-[0_0_16px_rgba(16,185,129,0.2)]"
                        : "bg-[#1C1410] border-[#3E2A1E] text-[#B8A896] opacity-85"
                    }`}
                  >
                    <strong
                      className={`font-mono text-xs uppercase tracking-wide block mb-1 ${
                        !result.oracleBlock.isHung ? "text-emerald-300" : "text-rose-300"
                      }`}
                    >
                      {!result.oracleBlock.isHung
                        ? "✅ Hành động thuận của Kinh Dịch [ÁP DỤNG VÌ XĂM LÀ CÁT]:"
                        : "🛑 Hành động thuận của Kinh Dịch [KHÔNG LÀM THEO VÌ XĂM LÀ HUNG]:"}
                    </strong>
                    {result.primaryBlock.activeLineBlock.hanhDongThuan}
                  </div>
                  <div
                    className={`p-3 rounded-lg border ${
                      result.oracleBlock.isHung
                        ? "bg-[#2B1418] border-2 border-amber-500 text-amber-100 shadow-[0_0_16px_rgba(245,158,11,0.25)]"
                        : "bg-[#261314] border-[#532628] text-rose-100"
                    }`}
                  >
                    <strong
                      className={`font-mono text-xs uppercase tracking-wide block mb-1 ${
                        result.oracleBlock.isHung ? "text-amber-300" : "text-rose-400"
                      }`}
                    >
                      {result.oracleBlock.isHung
                        ? "🔄 Chiến lược hành động ngược khi Xăm HUNG [ÁP DỤNG ĐỂ HÓA GIẢI]:"
                        : "🛑 Mặt phản diện / Sai lầm của hào [CẦN TRÁNH]:"}
                    </strong>
                    {result.oracleBlock.isHung
                      ? result.primaryBlock.activeLineBlock.hanhDongNguoc
                      : result.primaryBlock.activeLineBlock.saiLamCanTranh}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. KHU VỰC 3 QUẺ PHỤ ĐỒNG CHIẾU TẠI CÙNG HÀO ĐỘNG (TUYẾN: TÔNG - HỖ - THÁC) */}
          <div className="bg-[#120B06] border border-[#3A2614] p-4 sm:p-6 rounded-xl space-y-5">
            <div className="border-b border-[#2B1B0F] pb-2 flex items-center justify-between flex-wrap gap-2">
              <h4 className="font-serif font-black text-sm sm:text-base text-amber-400 uppercase tracking-wide flex items-center gap-2">
                <span>PHẦN III — 3 QUẺ PHỤ ĐỒNG CHIẾU TẠI HÀO {result.activeLine} (TÔNG, HỖ, THÁC)</span>
              </h4>
              <span className="text-[11px] font-mono text-[#C9A55A] bg-[#221509] px-2.5 py-0.5 rounded border border-[#3E2713]">
                Giữ nguyên Hào {result.activeLine} theo sách
              </span>
            </div>

            {[
              {
                title: "1. Quẻ Tông (綜卦 - Quẻ Phản) [Góc nhìn đối phương / Phương án dự phòng xoay chiều]:",
                data: result.auxiliaryBlocks.queTong,
              },
              {
                title: "2. Quẻ Hỗ (互卦 - Quẻ Hỗ) [Nút thắt nội tại / Diễn biến ngầm & tác động trung gian]:",
                data: result.auxiliaryBlocks.queHo,
              },
              {
                title: "3. Quẻ Thác (錯卦 - Quẻ Sai) [Mặt đối lập hoàn toàn / Nguy cơ tiềm ẩn & biến số bỏ sót]:",
                data: result.auxiliaryBlocks.queThac,
              },
            ].map((aux, idx) => (
              <div
                key={idx}
                className="bg-[#170F08] p-4 rounded-xl border border-[#352110] space-y-2 text-xs sm:text-sm"
              >
                <div className="font-bold text-amber-300 text-sm border-b border-[#28170B] pb-1.5 flex items-center justify-between flex-wrap gap-2">
                  <span>{aux.title}</span>
                </div>
                <div className="space-y-1.5 text-[#D8C9B0] pl-2">
                  <div>
                    • Tên quẻ: <strong className="text-[#F5EAD4]">{aux.data.name}</strong>
                  </div>
                  <div>
                    • Tượng &amp; Ý toàn quẻ: {aux.data.tuongYHanViet} ({aux.data.tuongYMeaning})
                  </div>
                  <div className="pt-1">
                    <strong className="text-amber-400">Tra tại {aux.data.haoVi}:</strong>
                    <div className="pl-3 border-l border-[#442E17] mt-1.5 space-y-1.5">
                      <div>* Tượng &amp; Ý hào: {aux.data.hanViet}</div>
                      <div>
                        * <strong className="text-[#EADEC6]">Hào từ (Theo sách):</strong> {aux.data.haoTuSach}
                      </div>
                      <div>* Tiểu Tượng Truyện: {aux.data.tieuTuong}</div>
                      <div className="pl-3 text-xs italic text-[#C4B39B]">
                        -&gt; Nghĩa là: {aux.data.tieuTuongNghia}
                      </div>
                      <div className="p-2 rounded bg-[#21160B] border border-amber-700/30 text-[#F2E5C9]">
                        * <strong className="text-amber-300">Gợi ý / Nhắc nhở (Theo sách):</strong>{" "}
                        {aux.data.goiYNhacNho}
                      </div>
                      <div>* Góc nhìn ứng dụng: {aux.data.apDung}</div>
                      <div>* Nghĩa lý: {aux.data.nghiaLy}</div>
                      <div>* Tượng số: {aux.data.tuongSo}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default KhongMinhKinhDichView;
