import React, { useState, useRef } from "react";
import {
  Compass,
  ArrowRight,
  Camera,
  Download,
  Loader2,
  Sparkles,
  BookOpen,
  Info,
  Clock,
  Layers,
  ChevronRight,
  Shield,
  Zap,
} from "lucide-react";
import { Hexagram } from "../types";
import { zenAudio } from "../utils/zenAudio";
import { captureElementToPng, downloadDataUrlAsPng } from "../utils/captureHelper";
import { ExportImageModal } from "./ExportImageModal";
import {
  calculateLucNhamHoaDich,
  LucNhamHoaDichResult,
} from "../data/lucnhamHoaDich";

interface LucNhamHoaDichSectionProps {
  dayCan: string;
  dayChi: string;
  hourCan?: string;
  hourChi: string;
  nguyetTuongBranch?: string;
  onProceedToDetails?: (
    primary: Hexagram,
    changingLines: number[],
    transformed?: Hexagram,
    summary?: string
  ) => void;
  className?: string;
}

export const LucNhamHoaDichSection: React.FC<LucNhamHoaDichSectionProps> = ({
  dayCan,
  dayChi,
  hourCan,
  hourChi,
  nguyetTuongBranch,
  onProceedToDetails,
  className = "",
}) => {
  // Tính toán quẻ đối ứng theo Lục Nhâm Hóa Dịch
  const result: LucNhamHoaDichResult = calculateLucNhamHoaDich(
    dayCan,
    dayChi,
    hourChi,
    nguyetTuongBranch
  );

  // Chụp hình thẻ quẻ
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [exportModalOpen, setExportModalOpen] = useState<boolean>(false);
  const [exportedImageUrl, setExportedImageUrl] = useState<string | null>(null);
  const [exportModalTitle, setExportModalTitle] = useState<string>("Quẻ Lục Nhâm Hóa Dịch");
  const [exportModalFilename, setExportModalFilename] = useState<string>("luc-nham-hoa-dich.png");

  const captureCardRef = useRef<HTMLDivElement>(null);

  const handleCaptureCard = async (isDirectDownload: boolean = false) => {
    if (isCapturing || !captureCardRef.current) return;
    try {
      setIsCapturing(true);
      zenAudio.playCardDrawChime();
      await new Promise((r) => setTimeout(r, 150));

      const dateStr = new Date().toISOString().slice(0, 10);
      const title = `Quẻ Lục Nhâm Ban Đầu: Quẻ #${result.primaryHex.number} ${result.primaryHex.name}`;
      const filename = `que-luc-nham-ban-dau-${result.primaryHex.number}-${dateStr}.png`;

      const dataUrl = await captureElementToPng(captureCardRef.current, {
        backgroundColor: "#16120D",
        pixelRatio: 2,
      });

      setExportedImageUrl(dataUrl);
      setExportModalTitle(title);
      setExportModalFilename(filename);

      if (isDirectDownload) {
        downloadDataUrlAsPng(dataUrl, filename);
      } else {
        setExportModalOpen(true);
      }
    } catch (err) {
      console.error("Capture Luc Nham Hoa Dich error:", err);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleProceed = () => {
    if (onProceedToDetails) {
      zenAudio.strikeSingingBowl(324, 0.75);
      onProceedToDetails(
        result.primaryHex,
        [result.changingLine],
        result.transformedHex,
        result.summary
      );
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Khung chính Lục Nhâm Hóa Dịch */}
      <div
        ref={captureCardRef}
        className="bg-gradient-to-r from-[#22180F] via-[#1B130B] to-[#22180F] border-2 border-[#8C6218] rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4 animate-in fade-in duration-300"
      >
        {/* Header banner */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#44301A] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FFE28A] via-[#D4AF37] to-[#8C6218] text-[#120F0B] flex items-center justify-center font-bold text-lg shadow-[0_0_12px_rgba(212,175,55,0.3)] shrink-0">
              ☯
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-serif font-bold text-sm sm:text-base text-[#FFE28A] tracking-wide">
                  LỤC NHÂM HÓA DỊCH (六壬化易)
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2E1F11] text-[#E2B755] border border-[#5E4221] font-semibold">
                  Quy Nạp 64 Quẻ Chu Dịch
                </span>
              </div>
              <p className="text-[11px] text-[#A89882] font-serif mt-0.5">
                Sơ Truyền [{result.soTruyenBranch}] nạp Thượng Quái ({result.upperTrigram.name}) • Mạt Truyền [{result.matTruyenBranch}] nạp Hạ Quái ({result.lowerTrigram.name}) • Động Hào {result.changingLine}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 no-capture ml-auto">
            {/* Nút chụp riêng Quẻ Lục Nhâm Ban Đầu */}
            <button
              type="button"
              onClick={() => handleCaptureCard(false)}
              disabled={isCapturing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-serif font-bold bg-[#2A1D11] hover:bg-[#3D2918] text-[#FFE28A] border border-[#6B4B27] hover:border-[#D4AF37] rounded-xl transition-all cursor-pointer shadow active:scale-95"
              title="Chụp ảnh và xem Quẻ Lục Nhâm Hóa Dịch Ban Đầu"
            >
              {isCapturing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5 text-[#D4AF37]" />}
              <span>Chụp Quẻ Ban Đầu</span>
            </button>

            {/* Nút tải ảnh Quẻ Ban Đầu trực tiếp */}
            <button
              type="button"
              onClick={() => handleCaptureCard(true)}
              disabled={isCapturing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-serif font-bold bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 text-stone-950 border border-amber-400 rounded-xl transition-all cursor-pointer shadow active:scale-95"
              title="Chụp và tải trực tiếp file ảnh Quẻ Lục Nhâm Ban Đầu về máy"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải Quẻ Ban Đầu</span>
            </button>

            {onProceedToDetails && (
              <button
                type="button"
                onClick={handleProceed}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#A87B25] hover:brightness-110 active:scale-95 text-[#14100C] text-xs font-serif font-bold shadow-md cursor-pointer transition-all"
              >
                <span>Xem Toàn Văn Luận Giải</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Cục diện Tam Truyền Nạp Bát Quái */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-serif">
          {/* Sơ Truyền */}
          <div className="bg-[#17100A] border border-[#3E2B18] rounded-xl p-2.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#A89882] font-mono font-bold">1. SƠ TRUYỀN (PHÁT ĐOAN)</span>
              <span className="text-[10px] text-amber-400 font-bold">Ngoại Quái (Thượng)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-serif font-bold text-[#FFE28A]">
                Chi [{result.soTruyenBranch}]
              </span>
              <span className="text-xs text-[#CDBFA8]">
                ➔ Quái {result.upperTrigram.symbol} {result.upperTrigram.name} ({result.upperTrigram.nature})
              </span>
            </div>
            <p className="text-[10.5px] text-[#9E8E7A] leading-tight line-clamp-2">
              {result.soTruyenAnalysis}
            </p>
          </div>

          {/* Trung Truyền */}
          <div className="bg-[#17100A] border border-[#3E2B18] rounded-xl p-2.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#A89882] font-mono font-bold">2. TRUNG TRUYỀN (DI TRUYỀN)</span>
              <span className="text-[10px] text-[#D4AF37] font-bold">Biến Cố Trung Gian</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-serif font-bold text-[#FFE28A]">
                Chi [{result.trungTruyenBranch}]
              </span>
              <span className="text-xs text-[#CDBFA8]">
                ➔ Diễn biến chuyển tiếp
              </span>
            </div>
            <p className="text-[10.5px] text-[#9E8E7A] leading-tight line-clamp-2">
              {result.trungTruyenAnalysis}
            </p>
          </div>

          {/* Mạt Truyền */}
          <div className="bg-[#17100A] border border-[#3E2B18] rounded-xl p-2.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#A89882] font-mono font-bold">3. MẠT TRUYỀN (QUY CỤC)</span>
              <span className="text-[10px] text-amber-400 font-bold">Nội Quái (Hạ)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-serif font-bold text-[#FFE28A]">
                Chi [{result.matTruyenBranch}]
              </span>
              <span className="text-xs text-[#CDBFA8]">
                ➔ Quái {result.lowerTrigram.symbol} {result.lowerTrigram.name} ({result.lowerTrigram.nature})
              </span>
            </div>
            <p className="text-[10.5px] text-[#9E8E7A] leading-tight line-clamp-2">
              {result.matTruyenAnalysis}
            </p>
          </div>
        </div>

        {/* Khối hiển thị Quẻ Chủ & Quẻ Biến */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Quẻ Chủ (Bản Quái) */}
          <div className="bg-[#18110B] border border-[#48331E] rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-serif font-bold text-[#FFE28A] flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#D4AF37]" />
                QUẺ CHỦ (BẢN QUÁI LỤC NHÂM):
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#2A1C0E] text-[#D4AF37] border border-[#50371E]">
                Quẻ #{result.primaryHex.number}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-13 h-13 rounded-xl bg-[#24170E] border border-[#5A3F24] flex flex-col items-center justify-center font-serif text-lg font-bold text-[#FFE28A] shrink-0">
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

          {/* Quẻ Biến (Biến Quái) */}
          <div className="bg-[#18110B] border border-[#48331E] rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-serif font-bold text-[#FFE28A] flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                QUẺ BIẾN (TRIỂN VỌNG HẬU VẬN):
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#2A1C0E] text-amber-300 border border-[#50371E]">
                Quẻ #{result.transformedHex.number} • Động Hào {result.changingLine}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-13 h-13 rounded-xl bg-[#24170E] border border-[#5A3F24] flex flex-col items-center justify-center font-serif text-lg font-bold text-[#FFE28A] shrink-0">
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
              <strong>Biến hào:</strong> Hào {result.changingLine} động chuyển, thể hiện sự biến dịch từ thời điểm khởi quẻ theo Hoạt Thời Giờ {hourChi}.
            </div>
          </div>
        </div>

        {/* Lời khuyên chiến lược Lục Nhâm Hóa Dịch */}
        <div className="bg-[#160E08] border border-[#422E1B] rounded-xl p-3 text-xs font-serif text-[#CDBFA8] leading-relaxed flex items-start gap-2.5">
          <span className="text-lg shrink-0">📜</span>
          <div className="flex-1">
            <strong className="text-[#FFE28A] block mb-0.5">Luận Đoán Lục Nhâm Hóa Dịch:</strong>
            {result.strategicAdvice}
          </div>
        </div>

        {/* Nút hành động xem chi tiết 64 quẻ nếu có handler */}
        {onProceedToDetails && (
          <div className="pt-1 text-center no-capture">
            <button
              type="button"
              onClick={handleProceed}
              className="w-full sm:w-auto px-7 py-2.5 rounded-xl bg-gradient-to-r from-[#8C6218] via-[#D4AF37] to-[#8C6218] hover:brightness-110 active:scale-95 text-[#14100C] text-xs font-serif font-bold shadow-lg transition-all cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <span>TIẾP TỤC ĐỌC TOÀN VĂN LUẬN GIẢI QUẺ DỊCH (HÀO TỪ & ĐẠI TƯỢNG) ➔</span>
            </button>
          </div>
        )}
      </div>

      {/* Export Image Modal */}
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
