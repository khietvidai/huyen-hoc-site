import React, { useState, useEffect } from "react";
import {
  X,
  Heart,
  QrCode,
  Copy,
  Check,
  Download,
  Sparkles,
  Phone,
  ShieldCheck,
} from "lucide-react";

export interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DonateModal: React.FC<DonateModalProps> = ({ isOpen, onClose }) => {
  const [copiedPhone, setCopiedPhone] = useState(false);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const PHONE_NUMBER = "0902853305";
  const FORMATTED_PHONE = "0902.853.305";
  const ACCOUNT_HOLDER = "VƯƠNG THẾ ĐẠT";
  
  const baseUrl = import.meta.env.BASE_URL || "./";
  const cleanBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const QR_IMAGE_URL = `${cleanBase}images/donate-qr.png`;
  const FALLBACK_QR_URL = `${cleanBase}donate-qr.png`;

  const handleCopyPhone = () => {
    try {
      navigator.clipboard.writeText(PHONE_NUMBER);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2200);
    } catch {
      // Fallback
    }
  };

  const handleDownloadQr = () => {
    const link = document.createElement("a");
    link.href = QR_IMAGE_URL;
    link.download = "QR-Donate-VuongTheDat.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="fixed inset-0 z-[260] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="royal-frame w-full max-w-lg my-auto text-ivory-100 relative shadow-2xl shadow-gold-950/60"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="royal-corner tl" />
        <span className="royal-corner tr" />
        <span className="royal-corner bl" />
        <span className="royal-corner br" />

        {/* HEADER */}
        <div className="px-5 py-5 sm:px-7 sm:py-6 border-b border-gold-800 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5">
            <span className="royal-seal w-11 h-11 text-base shrink-0 mt-0.5 flex items-center justify-center text-gold-300">
              德
            </span>
            <div>
              <div className="text-[10.5px] font-medium uppercase tracking-[0.24em] text-gold-500 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-500/30" />
                <span>Tùy Hỷ Công Đức · 隨喜功德</span>
              </div>
              <h2 className="royal-title mt-1 text-2xl sm:text-3xl text-gold-200">
                Donate Ủng Hộ Dự Án
              </h2>
              <p className="mt-1 text-[12px] text-ivory-400 font-serif leading-snug">
                Chung tay duy trì máy chủ &amp; phát triển nền tảng Chu Dịch I Ching Tarot
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-ivory-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            title="Đóng (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-5 sm:p-7 space-y-5">
          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative group p-2.5 rounded-2xl bg-gradient-to-b from-[#261B12] via-[#18110B] to-[#120D08] border-2 border-gold-600/70 shadow-[0_0_35px_rgba(212,175,55,0.22)] max-w-[280px] sm:max-w-[300px]">
              <div className="rounded-xl overflow-hidden bg-white shadow-inner">
                <img
                  src={QR_IMAGE_URL}
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.dataset.triedFallback) {
                      target.dataset.triedFallback = "true";
                      target.src = FALLBACK_QR_URL;
                    }
                  }}
                  alt={`Mã QR Donate - ${ACCOUNT_HOLDER}`}
                  className="w-full h-auto block select-none"
                  loading="eager"
                />
              </div>

              {/* Decorative Subtle Corner Accents */}
              <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-gold-400 pointer-events-none" />
              <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-gold-400 pointer-events-none" />
              <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-gold-400 pointer-events-none" />
              <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-gold-400 pointer-events-none" />
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs font-serif text-gold-400">
              <QrCode className="w-4 h-4 text-gold-400" />
              <span>Quét mã qua mọi ứng dụng Ngân hàng (VietQR) / MoMo</span>
            </div>
          </div>

          {/* Account Details Box */}
          <div className="p-4 rounded-xl bg-[#140E08]/90 border border-gold-800/80 space-y-2.5 font-serif text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-gold-900/80">
              <span className="text-ivory-400">Chủ tài khoản:</span>
              <span className="font-sans font-bold text-gold-300 tracking-wider text-sm">
                {ACCOUNT_HOLDER}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-ivory-400">
                <Phone className="w-3.5 h-3.5 text-gold-500" />
                <span>Số Booking / Hotline:</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-amber-300 text-sm">
                  {FORMATTED_PHONE}
                </span>
                <button
                  type="button"
                  onClick={handleCopyPhone}
                  className={`px-2 py-0.5 rounded text-[11px] font-sans font-medium flex items-center gap-1 transition-all cursor-pointer ${
                    copiedPhone
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-600/50"
                      : "bg-gold-950/70 hover:bg-gold-900 text-gold-300 border border-gold-700/60"
                  }`}
                  title="Sao chép số điện thoại"
                >
                  {copiedPhone ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-gold-400" />
                      <span>Chép số</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Thank You Note */}
          <div className="p-3.5 rounded-xl bg-gold-950/25 border border-gold-700/40 text-[12px] font-serif text-ivory-300 leading-relaxed flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
            <p>
              Mọi sự phát tâm ủng hộ của quý đạo hữu là trợ duyên quý báu giúp dự án duy trì hạ tầng máy chủ, không ngừng nghiên cứu và hoàn thiện thêm các tính năng Dịch học phụng sự cộng đồng. Kính chúc quý bạn thân tâm an lạc, vạn sự hanh thông!
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-5 py-4 sm:px-7 border-t border-gold-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-[11px] font-serif text-ivory-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Thanh toán an toàn • Trực tiếp chính chủ</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleDownloadQr}
              className="royal-btn-ghost flex-1 sm:flex-initial !py-2 !px-4 !text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-gold-400" />
              <span>Tải mã QR</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="royal-btn flex-1 sm:flex-initial !py-2 !px-6 !text-xs cursor-pointer"
            >
              <span>Đóng</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
