import React, { useState } from "react";
import {
  Scroll,
  Copy,
  Check,
  Flame,
  Scale,
  Sparkles,
  BookOpen,
  Compass,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Share2,
} from "lucide-react";
import { Hexagram } from "../types";
import { formatKhongMinhKinhDich, KhongMinhKinhDichResult } from "../utils/khongMinhKinhDichFormatter";

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
  sourceName = "Hoạt Thời",
  onShowToast,
  className = "",
}) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"card" | "raw">("card");

  const result: KhongMinhKinhDichResult = React.useMemo(() => {
    return formatKhongMinhKinhDich(primaryHex, activeLine, sourceName);
  }, [primaryHex, activeLine, sourceName]);

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(result.plainText);
      setCopied(true);
      if (onShowToast) {
        onShowToast("Đã sao chép toàn văn Luận Đoán Quẻ Khổng Minh Kinh Dịch theo đúng mẫu!");
      }
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error(err);
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
              <Scroll className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-black text-base sm:text-lg md:text-xl text-[#F5EAD4] tracking-wide uppercase">
              === QUẺ KHỔNG MINH KINH DỊCH ===
            </h3>
          </div>
          <p className="text-xs text-[#A89882] pl-10">
            Hệ Thống Luận Đoán Chiêm Bái Khổng Minh & Chu Dịch (Chính — Tông — Hỗ — Thác)
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
          {/* Mode Switcher */}
          <div className="bg-[#1C130B] border border-[#3E2815] rounded-xl p-0.5 flex items-center text-xs">
            <button
              type="button"
              onClick={() => setViewMode("card")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer font-serif ${
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
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer font-serif ${
                viewMode === "raw"
                  ? "bg-amber-600/30 text-amber-300 font-bold border border-amber-600/50 shadow-sm"
                  : "text-[#A89882] hover:text-[#E6D7BD]"
              }`}
            >
              Văn Bản Mẫu
            </button>
          </div>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-[#120F0C] font-bold text-xs font-serif transition-all shadow-md active:scale-95 cursor-pointer"
            title="Sao chép toàn bộ văn bản luận giải đúng theo mẫu vào bộ nhớ tạm"
          >
            {copied ? <Check className="w-4 h-4 text-[#120F0C]" /> : <Copy className="w-4 h-4 text-[#120F0C]" />}
            <span>{copied ? "Đã Sao Chép!" : "Sao Chép Mẫu"}</span>
          </button>
        </div>
      </div>

      {/* RAW PLAIN TEXT MODE (Exactly matches user's request line-for-line) */}
      {viewMode === "raw" && (
        <div className="space-y-2">
          <div className="text-[11px] font-mono text-[#A89882] flex items-center justify-between">
            <span>Định dạng văn bản chuẩn (100% khớp mẫu):</span>
            <span className="text-amber-400">Ấn 'Sao Chép Mẫu' để dán trực tiếp</span>
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
                <Sparkles className="w-3.5 h-3.5" /> 6 HÀO KINH DỊCH & VỊ THẾ TRUNG CHÍNH
              </span>
              <span className="text-[11px] text-[#A69780] font-mono">Thứ tự từ Hào 6 (Thượng) xuống Hào 1 (Sơ)</span>
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
                          <Flame className="w-3 h-3 text-red-400 animate-pulse" /> Hào động
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${
                          isDacVi
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
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {result.oracleBlock.isHung
                    ? "🔄 QUẺ KHỔNG MINH LÀ HUNG ➔ HÀNH ĐỘNG NGƯỢC LẠI VỚI LỜI KHUYÊN CỦA KINH DỊCH"
                    : "✅ QUẺ KHỔNG MINH LÀ CÁT ➔ LÀM THEO LỜI KHUYÊN HÀNH ĐỘNG CỦA KINH DỊCH"}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#FFF2D4] leading-relaxed">
                {result.actionPrincipleBannerText}
              </p>
            </div>
          </div>

          {/* 2. KHU VỰC QUẺ CHÍNH */}
          <div className="bg-[#120B06] border border-[#3A2614] p-4 sm:p-6 rounded-xl space-y-4">
            <div className="border-b border-[#2B1B0F] pb-2 flex items-center justify-between flex-wrap gap-2">
              <h4 className="font-serif font-black text-sm sm:text-base text-amber-400 uppercase tracking-wide flex items-center gap-2">
                <span>--- QUẺ CHÍNH ---</span>
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
                <strong className="text-amber-300">• Tượng & Ý:</strong> {result.primaryBlock.tuongYMeaning}
              </div>
              <div>
                <strong className="text-amber-300">• Tượng & Ý (Hán Việt):</strong> {result.primaryBlock.tuongYHanViet}
              </div>
              <div className="pt-1">
                <strong className="text-amber-300">• Trích nghĩa / Luận giải toàn quẻ:</strong>{" "}
                <span className="text-[#EADEC6]">{result.primaryBlock.trichNghiaLuanGiai}</span>
              </div>
              <div>
                <strong className="text-amber-300">• Đại tượng:</strong> {result.primaryBlock.daiTuong}
              </div>
              <div>
                <strong className="text-amber-300">• Vận thế:</strong> {result.primaryBlock.vanThe}
              </div>
            </div>

            {/* Chi tiết Hào Từ Hào Động */}
            <div className="mt-4 pt-4 border-t border-[#291A0E] space-y-3">
              <div className="text-xs sm:text-sm font-serif font-bold text-amber-300 flex items-center gap-2">
                <Flame className="w-4 h-4 text-red-400" />
                <span>Hào từ hào {result.activeLine}:</span>
              </div>

              <div className="space-y-2 text-xs sm:text-sm text-[#DDD0BD] leading-relaxed pl-3 border-l-2 border-amber-600/40">
                <div>
                  <strong className="text-[#C4B294]">- Hán Việt:</strong> {result.primaryBlock.activeLineBlock.hanViet}
                </div>
                <div>
                  <strong className="text-[#C4B294]">- Lời dịch:</strong> {result.primaryBlock.activeLineBlock.loiDich}
                </div>
                <div>
                  <strong className="text-[#C4B294]">- ⚖️ Phân định vị thế:</strong>{" "}
                  <span className="text-amber-300">{result.primaryBlock.activeLineBlock.phanDinhViThe}</span>
                </div>
                <div>
                  <strong className="text-[#C4B294]">- 🎯 Đạo Trung Chính:</strong>{" "}
                  <span className="text-emerald-300">{result.primaryBlock.activeLineBlock.daoTrungChinh}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#1B1107] border border-[#3E2815] my-1">
                  <strong className="text-amber-400 block mb-1">- Lời hào cốt lõi:</strong>
                  <span className="text-[#FFF2D4] font-medium text-xs sm:text-sm leading-relaxed">
                    {result.primaryBlock.activeLineBlock.loiHaoCotLoi}
                  </span>
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
                        ? "- ✅ Lời khuyên hành động của Kinh Dịch [ÁP DỤNG VÌ QUẺ KHỔNG MINH LÀ CÁT]:"
                        : "- 🛑 Lời khuyên thuận của Kinh Dịch [KHÔNG LÀM THEO VÌ QUẺ KHỔNG MINH LÀ HUNG]:"}
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
                        ? "- 🔄 Hành động ngược lại lời khuyên Kinh Dịch [ÁP DỤNG VÌ QUẺ KHỔNG MINH LÀ HUNG]:"
                        : "- 🛑 Hành động ngược lại lời khuyên Kinh Dịch [CẦN TRÁNH]:"}
                    </strong>
                    {result.primaryBlock.activeLineBlock.hanhDongNguoc}
                  </div>
                </div>

                <div className="bg-[#181108] p-3 rounded-lg border border-[#302010] mt-2">
                  <strong className="text-[#E5B552] block mb-1">
                    - Tiểu Tượng Truyện: {result.primaryBlock.activeLineBlock.tieuTuong}
                  </strong>
                  <p className="text-xs text-[#C8B9A0] italic pl-3 border-l border-[#C9A55A]/40">
                    -&gt; Nghĩa là: {result.primaryBlock.activeLineBlock.tieuTuongNghia}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 3. KHU VỰC 3 QUẺ PHỤ (TÔNG, HỖ, THÁC) */}
          <div className="bg-[#120B06] border border-[#3A2614] p-4 sm:p-6 rounded-xl space-y-5">
            <div className="border-b border-[#2B1B0F] pb-2 flex items-center justify-between flex-wrap gap-2">
              <h4 className="font-serif font-black text-sm sm:text-base text-amber-400 uppercase tracking-wide flex items-center gap-2">
                <span>--- 3 QUẺ PHỤ (TÔNG, HỖ, THÁC) ---</span>
              </h4>
              <span className="text-[11px] font-mono text-[#C9A55A] bg-[#221509] px-2.5 py-0.5 rounded border border-[#3E2713]">
                Tứ Quái Đồng Quan
              </span>
            </div>

            {/* 1. Quẻ Tông */}
            <div className="bg-[#170F08] p-4 rounded-xl border border-[#352110] space-y-2 text-xs sm:text-sm">
              <div className="font-bold text-amber-300 text-sm border-b border-[#28170B] pb-1.5 flex items-center justify-between flex-wrap gap-2">
                <span>1. Quẻ Tông (綜卦 - Quẻ Phản) [Góc nhìn từ phía đối phương hoặc quan sát sự việc ngược lại]:</span>
              </div>
              <div className="space-y-1 text-[#D8C9B0] pl-2">
                <div>• Tên quẻ: <strong className="text-[#F5EAD4]">{result.auxiliaryBlocks.queTong.name}</strong></div>
                <div>• Tượng &amp; Ý: {result.auxiliaryBlocks.queTong.tuongYMeaning}</div>
                <div>• Tượng &amp; Ý (Hán Việt): {result.auxiliaryBlocks.queTong.tuongYHanViet}</div>
                <div className="pt-1">
                  <strong className="text-amber-400">Hào từ hào {result.auxiliaryBlocks.queTong.lineNum}:</strong>
                  <div className="pl-3 border-l border-[#442E17] mt-1 space-y-1">
                    <div>* Hán Việt: {result.auxiliaryBlocks.queTong.hanViet}</div>
                    <div>* Lời dịch: {result.auxiliaryBlocks.queTong.loiDich}</div>
                    <div>* Tiểu Tượng Truyện: {result.auxiliaryBlocks.queTong.tieuTuong}</div>
                    <div className="pl-3 text-xs italic text-[#C4B39B]">-&gt; Nghĩa là: {result.auxiliaryBlocks.queTong.tieuTuongNghia}</div>
                    <div>* Áp dụng: {result.auxiliaryBlocks.queTong.apDung}</div>
                    <div>* Nghĩa lý: {result.auxiliaryBlocks.queTong.nghiaLy}</div>
                    <div>* Tượng số: {result.auxiliaryBlocks.queTong.tuongSo}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Quẻ Hỗ */}
            <div className="bg-[#170F08] p-4 rounded-xl border border-[#352110] space-y-2 text-xs sm:text-sm">
              <div className="font-bold text-amber-300 text-sm border-b border-[#28170B] pb-1.5 flex items-center justify-between flex-wrap gap-2">
                <span>2. Quẻ Hỗ (互卦 - Quẻ Hỗ) [Yếu tố nội tại, diễn biến ngầm hoặc tác động trung gian]:</span>
              </div>
              <div className="space-y-1 text-[#D8C9B0] pl-2">
                <div>• Tên quẻ: <strong className="text-[#F5EAD4]">{result.auxiliaryBlocks.queHo.name}</strong></div>
                <div>• Tượng &amp; Ý: {result.auxiliaryBlocks.queHo.tuongYMeaning}</div>
                <div>• Tượng &amp; Ý (Hán Việt): {result.auxiliaryBlocks.queHo.tuongYHanViet}</div>
                <div className="pt-1">
                  <strong className="text-amber-400">Hào từ hào {result.auxiliaryBlocks.queHo.lineNum}:</strong>
                  <div className="pl-3 border-l border-[#442E17] mt-1 space-y-1">
                    <div>* Hán Việt: {result.auxiliaryBlocks.queHo.hanViet}</div>
                    <div>* Lời dịch: {result.auxiliaryBlocks.queHo.loiDich}</div>
                    <div>* Tiểu Tượng Truyện: {result.auxiliaryBlocks.queHo.tieuTuong}</div>
                    <div className="pl-3 text-xs italic text-[#C4B39B]">-&gt; Nghĩa là: {result.auxiliaryBlocks.queHo.tieuTuongNghia}</div>
                    <div>* Áp dụng: {result.auxiliaryBlocks.queHo.apDung}</div>
                    <div>* Nghĩa lý: {result.auxiliaryBlocks.queHo.nghiaLy}</div>
                    <div>* Tượng số: {result.auxiliaryBlocks.queHo.tuongSo}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Quẻ Thác */}
            <div className="bg-[#170F08] p-4 rounded-xl border border-[#352110] space-y-2 text-xs sm:text-sm">
              <div className="font-bold text-amber-300 text-sm border-b border-[#28170B] pb-1.5 flex items-center justify-between flex-wrap gap-2">
                <span>3. Quẻ Thác (錯卦 - Quẻ Sai) [Mặt đối lập hoàn toàn, nguy cơ tiềm ẩn &amp; biến số khách quan]:</span>
              </div>
              <div className="space-y-1 text-[#D8C9B0] pl-2">
                <div>• Tên quẻ: <strong className="text-[#F5EAD4]">{result.auxiliaryBlocks.queThac.name}</strong></div>
                <div>• Tượng &amp; Ý: {result.auxiliaryBlocks.queThac.tuongYMeaning}</div>
                <div>• Tượng &amp; Ý (Hán Việt): {result.auxiliaryBlocks.queThac.tuongYHanViet}</div>
                <div className="pt-1">
                  <strong className="text-amber-400">Hào từ hào {result.auxiliaryBlocks.queThac.lineNum}:</strong>
                  <div className="pl-3 border-l border-[#442E17] mt-1 space-y-1">
                    <div>* Hán Việt: {result.auxiliaryBlocks.queThac.hanViet}</div>
                    <div>* Lời dịch: {result.auxiliaryBlocks.queThac.loiDich}</div>
                    <div>* Tiểu Tượng Truyện: {result.auxiliaryBlocks.queThac.tieuTuong}</div>
                    <div className="pl-3 text-xs italic text-[#C4B39B]">-&gt; Nghĩa là: {result.auxiliaryBlocks.queThac.tieuTuongNghia}</div>
                    <div>* Áp dụng: {result.auxiliaryBlocks.queThac.apDung}</div>
                    <div>* Nghĩa lý: {result.auxiliaryBlocks.queThac.nghiaLy}</div>
                    <div>* Tượng số: {result.auxiliaryBlocks.queThac.tuongSo}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. KHU VỰC TRÍCH QUẺ KHỔNG MINH THẦN TOÁN (QUẺ CHÍNH) */}
          <div className="bg-[#120B06] border border-[#3A2614] p-4 sm:p-6 rounded-xl space-y-4">
            <div className="border-b border-[#2B1B0F] pb-2 flex items-center justify-between flex-wrap gap-2">
              <h4 className="font-serif font-black text-sm sm:text-base text-amber-400 uppercase tracking-wide flex items-center gap-2">
                <span>--- TRÍCH QUẺ KHỔNG MINH THẦN TOÁN (QUẺ CHÍNH) ---</span>
              </h4>
              <span className="text-xs font-mono font-bold text-amber-300 bg-[#26170B] px-3 py-1 rounded-full border border-[#4E3218]">
                Quẻ Khổng Minh #{String(result.oracleBlock.oracleNum).padStart(3, "0")} • {result.oracleBlock.oracleType}
              </span>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-[#DDD0BD] leading-relaxed pl-1">
              <div>
                Hào {result.activeLine} của quẻ <strong>{result.primaryBlock.hexNameWithHanzi.split(" (")[0]}</strong> ứng với quẻ thứ <strong>{result.oracleBlock.oracleNum}</strong> trong hệ thống Khổng Minh Thần Số.
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
                    ? "🔄 Quẻ Khổng Minh là HUNG ➔ Hành động NGƯỢC LẠI với lời khuyên của Kinh Dịch"
                    : "✅ Quẻ Khổng Minh là CÁT ➔ Làm THEO lời khuyên hành động của Kinh Dịch"}
                </span>
              </div>

              {/* Kinh văn chữ Hán & Âm Hán Việt */}
              <div className="bg-[#1A1108] p-4 rounded-xl border border-[#382514] space-y-2 text-center my-2">
                <div className="font-serif font-black text-xl sm:text-2xl text-[#FFE59E] tracking-widest leading-relaxed drop-shadow">
                  "{result.oracleBlock.poemHanzi}"
                </div>
                <div className="text-xs sm:text-sm font-bold text-amber-300 italic">
                  - Âm Hán Việt: "{result.oracleBlock.poemHaniViet}"
                </div>
              </div>

              <div>
                - <strong>Dịch thơ / Diễn xuôi:</strong> "{result.oracleBlock.poemMeaning}"
              </div>

              <div className="pt-1">
                - <strong>Luận giải chi tiết:</strong> {result.oracleBlock.detailedExplanation}
                <div className="pl-3 mt-2 space-y-1.5 bg-[#191109] p-3.5 rounded-xl border border-[#3B2613]">
                  <div className="text-amber-300 font-bold">
                    ⚡ Quy tắc phối hợp Khổng Minh &amp; Kinh Dịch: {result.oracleBlock.actionPrincipleRule}
                  </div>
                  <div className="text-emerald-300">
                    * <strong>Hành động phải làm ({result.oracleBlock.isHung ? "Ngược lại lời khuyên Kinh Dịch" : "Theo lời khuyên Kinh Dịch"}):</strong>{" "}
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
                - <strong>Tượng số:</strong> {result.oracleBlock.symbolicFigure}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default KhongMinhKinhDichView;
