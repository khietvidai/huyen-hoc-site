import React, { useState } from "react";
import { Hexagram } from "../types";

export interface XuanBaguaStageProps {
  id?: string;
  badgeText?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  baguaSize?: "md" | "lg" | "xl";
  showSeal?: boolean;
  sealText?: string;
}

/**
 * Sân Khấu Giấy Tuyên Thành (#F6F3EB) + Lưới Đồng Cổ 48×48px + Tinh Bàn Bát Quái Vàng Kim xoay chậm
 * Chuẩn hóa 100% theo khu vực #destiny-cards của Trang Chủ (LandingPage.tsx)
 */
export const XuanBaguaStage: React.FC<XuanBaguaStageProps> = ({
  id,
  badgeText,
  title,
  subtitle,
  headerRight,
  children,
  className = "",
  baguaSize = "lg",
  showSeal = true,
  sealText = "九二玄壇",
}) => {
  const svgDimClass =
    baguaSize === "xl"
      ? "w-[480px] h-[480px] sm:w-[660px] sm:h-[660px] md:w-[760px] md:h-[760px]"
      : baguaSize === "md"
      ? "w-[360px] h-[360px] sm:w-[480px] sm:h-[480px] md:w-[560px] md:h-[560px]"
      : "w-[420px] h-[420px] sm:w-[580px] sm:h-[580px] md:w-[680px] md:h-[680px]";

  return (
    <div
      id={id}
      className={`relative w-full rounded-[28px] border-[1.5px] border-[#C4963E]/55 bg-[#F6F3EB] px-4 py-6 sm:px-7 sm:py-8 overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.38),inset_0_0_0_4px_#FAF8F2,inset_0_0_0_5px_rgba(196,150,62,0.28)] ${className}`}
      style={{
        backgroundImage:
          "radial-gradient(ellipse 85% 75% at 50% 50%, #FAF8F2 0%, #F4EFE4 65%, #EAE2D3 100%)",
      }}
    >
      {/* Lưới tọa độ Tơ Đồng Cổ 48x48px với mặt nạ tỏa tròn (Radial Vignette) */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(rgba(180,145,70,0.13) 1px,transparent 1px),
                            linear-gradient(90deg,rgba(180,145,70,0.13) 1px,transparent 1px)`,
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 82% 78% at 50% 52%, black 45%, transparent 96%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 82% 78% at 50% 52%, black 45%, transparent 96%)",
        }}
      />

      {/* 4 Góc Hoa Văn Đồng Cổ Hoàng Cung */}
      <div className="pointer-events-none absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#B8892E]/65 rounded-tl-md" />
      <div className="pointer-events-none absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[#B8892E]/65 rounded-tr-md" />
      <div className="pointer-events-none absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-[#B8892E]/65 rounded-bl-md" />
      <div className="pointer-events-none absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[#B8892E]/65 rounded-br-md" />

      {/* La Bàn Bát Quái Chìm (Celestial Bagua Astrolabe SVG Watermark) xoay chậm dưới tâm bàn bài */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none absolute left-1/2 top-[54%] -translate-x-1/2 -translate-y-1/2 z-[1] flex items-center justify-center"
      >
        <svg
          viewBox="0 0 600 600"
          className={`${svgDimClass} opacity-[0.17] animate-[spin_180s_linear_infinite]`}
        >
          <defs>
            <radialGradient id="xuanBaguaGoldGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.26" />
              <stop offset="65%" stopColor="#C4963E" stopOpacity="0.09" />
              <stop offset="100%" stopColor="#C4963E" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="300" cy="300" r="285" fill="url(#xuanBaguaGoldGlow)" />
          <circle
            cx="300"
            cy="300"
            r="280"
            fill="none"
            stroke="#B8892E"
            strokeWidth="1.5"
            strokeDasharray="6 6"
          />
          <circle cx="300" cy="300" r="256" fill="none" stroke="#B8892E" strokeWidth="1.2" />
          <circle
            cx="300"
            cy="300"
            r="215"
            fill="none"
            stroke="#B8892E"
            strokeWidth="1"
            strokeDasharray="3 5"
          />
          <circle cx="300" cy="300" r="168" fill="none" stroke="#B8892E" strokeWidth="1.2" />
          <circle cx="300" cy="300" r="108" fill="none" stroke="#B8892E" strokeWidth="1" />
          <polygon
            points="300,32 490,110 568,300 490,490 300,568 110,490 32,300 110,110"
            fill="none"
            stroke="#B8892E"
            strokeWidth="1.2"
          />
          {/* 8 Đường trục Bát Quái */}
          <line
            x1="300"
            y1="20"
            x2="300"
            y2="580"
            stroke="#B8892E"
            strokeWidth="0.9"
            strokeOpacity="0.6"
          />
          <line
            x1="20"
            y1="300"
            x2="580"
            y2="300"
            stroke="#B8892E"
            strokeWidth="0.9"
            strokeOpacity="0.6"
          />
          <line
            x1="102"
            y1="102"
            x2="498"
            y2="498"
            stroke="#B8892E"
            strokeWidth="0.9"
            strokeOpacity="0.6"
          />
          <line
            x1="498"
            y1="102"
            x2="102"
            y2="498"
            stroke="#B8892E"
            strokeWidth="0.9"
            strokeOpacity="0.6"
          />
          {/* Bát Quái Tiên Thiên Ký Hiệu */}
          <g
            fill="#9A6F1A"
            fontSize="24"
            fontFamily="serif"
            textAnchor="middle"
            dominantBaseline="central"
          >
            <text x="300" y="64">
              ☰ 乾
            </text>
            <text x="466" y="134">
              ☱ 兌
            </text>
            <text x="536" y="300">
              ☲ 離
            </text>
            <text x="466" y="466">
              ☳ 震
            </text>
            <text x="300" y="536">
              ☷ 坤
            </text>
            <text x="134" y="466">
              ☶ 艮
            </text>
            <text x="64" y="300">
              ☵ 坎
            </text>
            <text x="134" y="134">
              ☴ 巽
            </text>
          </g>
        </svg>
      </div>

      {/* Tiêu đề thanh nhã chuẩn Trang Chủ */}
      {(badgeText || title || subtitle || headerRight) && (
        <div className="relative z-[10] mb-5 flex flex-col items-center text-center">
          {badgeText && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#16130F] border border-[#C4963E]/75 text-[#F3E5AB] text-[11px] sm:text-xs font-semibold mb-2.5 tracking-[0.18em] uppercase shadow-[0_4px_18px_rgba(20,16,10,0.16)]">
              <span className="text-[#D4AF37]">✦</span>
              <span>{badgeText}</span>
              <span className="text-[#D4AF37]">✦</span>
            </div>
          )}
          {title && (
            <h3 className="text-xl sm:text-3xl font-bold text-[#1C1813] tracking-tight font-serif drop-shadow-[0_1px_0_rgba(255,255,255,0.85)]">
              {title}
            </h3>
          )}
          {subtitle && (
            <div className="mt-1.5 max-w-2xl text-xs sm:text-sm leading-relaxed text-[#5C5346] font-serif">
              {subtitle}
            </div>
          )}
          {headerRight && <div className="mt-3 w-full flex justify-center">{headerRight}</div>}
        </div>
      )}

      {/* Nội dung chính trên bàn trải bài */}
      <div className="relative z-[10]">{children}</div>

      {/* Triện son Cửu Nhị góc phải dưới */}
      {showSeal && (
        <div className="pointer-events-none select-none absolute bottom-3.5 right-4 z-[5] hidden sm:flex items-center justify-center w-10 h-10 rounded-md border-[1.5px] border-[#9E2A2B]/65 bg-[#9E2A2B]/8 text-[#9E2A2B] text-[10px] font-serif font-bold leading-tight text-center p-0.5 rotate-[-4deg]">
          {sealText}
        </div>
      )}
    </div>
  );
};

/**
 * Khung Ngọc Giản Kính Mờ Giấy Tuyên Thành (Jade Command Dock / Scroll Panel)
 * Chuẩn hóa theo Cửu Nhị Command Dock & Hương Án Khởi Niệm của Trang Chủ
 */
export const JadeCommandPanel: React.FC<{
  badgeIcon?: React.ReactNode;
  badge?: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  rightSlot?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({ badgeIcon = "☯", badge, title, subtitle, rightSlot, children, className = "" }) => {
  return (
    <div
      className={`relative rounded-2xl border border-[#C4963E]/50 p-4 sm:p-5 backdrop-blur-xl transition-all duration-300 ${className}`}
      style={{
        background:
          "linear-gradient(180deg, rgba(253, 251, 247, 0.96) 0%, rgba(243, 236, 224, 0.93) 100%)",
        boxShadow:
          "0 16px 38px -10px rgba(20, 15, 8, 0.28), 0 2px 8px rgba(92, 74, 44, 0.08), inset 0 0 0 3px #FDFBF7, inset 0 0 0 4px rgba(196, 150, 62, 0.22)",
      }}
    >
      {(title || subtitle || rightSlot || badge) && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#C4963E]/25 pb-2.5 mb-3.5">
          <div className="space-y-0.5">
            {title && (
              <div className="text-xs font-serif font-bold uppercase tracking-[0.16em] text-[#6E4E16] flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-[#9E2A2B] text-amber-50 text-[11px] font-serif border border-[#D4AF37]/60 shadow-2xs">
                  {badgeIcon}
                </span>
                <span>{title}</span>
                {badge && (
                  <span className="px-2 py-0.5 rounded-full bg-[#1C1610] text-[#F3E5AB] border border-[#C4963E] text-[10px] font-serif tracking-widest">
                    {badge}
                  </span>
                )}
              </div>
            )}
            {subtitle && (
              <p className="text-[11px] text-[#5C4D3C] font-serif">{subtitle}</p>
            )}
          </div>
          {rightSlot && <div className="flex items-center gap-2 flex-wrap">{rightSlot}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export interface CardTwoSidedModalProps {
  isOpen?: boolean;
  hexagram?: Hexagram | null;
  card?: Hexagram | null;
  positionLabel?: string;
  positionTitle?: string;
  positionMeaning?: string;
  frontImageUrl?: string;
  backImageUrl?: string | null;
  changingLines?: number[];
  isReversed?: boolean;
  onClose: () => void;
  onViewFullDetail?: () => void;
  onOpenFullDetail?: () => void;
}

/**
 * Modal Soi Lá Bài 2 Mặt (Cả 2 Mặt / Mặt Trước Quẻ Tượng / Mặt Sau Thoán Từ)
 * Đồng bộ 100% với Lightbox Soi Lá Bài trên Trang Chủ (LandingPage.tsx)
 */
export const CardTwoSidedModal: React.FC<CardTwoSidedModalProps> = ({
  isOpen = true,
  hexagram: propHexagram,
  card: propCard,
  positionLabel,
  positionTitle,
  positionMeaning,
  frontImageUrl,
  backImageUrl,
  changingLines = [],
  isReversed = false,
  onClose,
  onViewFullDetail,
  onOpenFullDetail,
}) => {
  const [modalCardView, setModalCardView] = useState<"both" | "front" | "back">("both");
  const [copiedSingle, setCopiedSingle] = useState(false);

  const hexagram = propHexagram || propCard || null;
  if (!isOpen || !hexagram) return null;

  const effectivePositionLabel = positionLabel || positionTitle;
  const effectiveOpenDetail = onViewFullDetail || onOpenFullDetail;
  const frontImg = frontImageUrl || `/assets/oss/${hexagram.number}/${hexagram.number}a.webp`;
  const backImg = `/assets/oss/${hexagram.number}/${hexagram.number}b.webp`;

  const handleCopyCardForAI = () => {
    const linesText = changingLines.length
      ? `Hào động: Hào ${changingLines.join(", ")}`
      : "Quẻ Tĩnh (Không có hào động)";
    const prompt = [
      `【LÁ BÀI CHU DỊCH ĐỊNH MỆNH】`,
      effectivePositionLabel ? `• Vị trí trong trận pháp: ${effectivePositionLabel}` : "",
      positionMeaning ? `• Ý nghĩa cung vị: ${positionMeaning}` : "",
      `• Quẻ số ${hexagram.number}: ${hexagram.name} (${hexagram.hanzi || hexagram.name})`,
      `• Thượng Quái: ${hexagram.upperTrigram} | Hạ Quái: ${hexagram.lowerTrigram} • Ngũ hành: ${hexagram.element}`,
      `• Trạng thái hào: ${linesText}${isReversed ? " • Thế bài: Chiều Ngược (Trở Ngại/Nội Ẩn)" : ""}`,
      `• Thoán Từ (Lời Quẻ): ${hexagram.judgment}`,
      `• Đại Tượng Truyện: ${hexagram.image}`,
      `Hãy luận giải sâu sắc lá bài này theo đúng vị trí trong trận pháp và đưa ra lời khuyên hành động cụ thể.`,
    ]
      .filter(Boolean)
      .join("\n");

    navigator.clipboard.writeText(prompt);
    setCopiedSingle(true);
    setTimeout(() => setCopiedSingle(false), 2200);
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#16130E] border-2 border-[#C4963E]/65 p-5 sm:p-6 text-center shadow-[0_24px_80px_rgba(0,0,0,0.9)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hào quang vàng kim phía sau */}
        <div
          className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-44 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(212, 175, 55, 0.38) 0%, transparent 70%)",
          }}
        />

        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-[#C4963E]/30 border border-[#C4963E]/35 flex items-center justify-center text-stone-300 hover:text-white transition cursor-pointer z-10"
          title="Đóng bảng chi tiết"
        >
          ✕
        </button>

        {/* Bộ chuyển đổi góc nhìn: Cả 2 mặt / Mặt trước / Mặt sau */}
        <div className="relative z-10 inline-flex items-center justify-center gap-1 p-1 rounded-full bg-[#0B0907]/90 border border-[#C4963E]/40 mb-4">
          <button
            type="button"
            onClick={() => setModalCardView("both")}
            className={`px-3.5 py-1 rounded-full text-xs font-serif font-semibold transition cursor-pointer ${
              modalCardView === "both"
                ? "bg-gradient-to-r from-[#E5C158] to-[#C4963E] text-stone-950 font-bold shadow-md"
                : "text-[#D8C8A8] hover:text-white"
            }`}
          >
            ✦ Cả 2 Mặt
          </button>
          <button
            type="button"
            onClick={() => setModalCardView("front")}
            className={`px-3.5 py-1 rounded-full text-xs font-serif font-semibold transition cursor-pointer ${
              modalCardView === "front"
                ? "bg-gradient-to-r from-[#E5C158] to-[#C4963E] text-stone-950 font-bold shadow-md"
                : "text-[#D8C8A8] hover:text-white"
            }`}
          >
            Mặt Trước (Quẻ Tượng)
          </button>
          <button
            type="button"
            onClick={() => setModalCardView("back")}
            className={`px-3.5 py-1 rounded-full text-xs font-serif font-semibold transition cursor-pointer ${
              modalCardView === "back"
                ? "bg-gradient-to-r from-[#E5C158] to-[#C4963E] text-stone-950 font-bold shadow-md"
                : "text-[#D8C8A8] hover:text-white"
            }`}
          >
            Mặt Sau (Thoán Từ)
          </button>
        </div>

        {/* Khung hiển thị lá bài 2 mặt giống hệt Trang Chủ */}
        {modalCardView === "both" ? (
          <div className="relative z-10 flex items-center justify-center gap-3 sm:gap-6 mb-4">
            {/* Mặt Trước */}
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-serif font-semibold text-[#F3E5AB] mb-1.5 flex items-center gap-1">
                <span className="text-[#D4AF37]">✦</span> Mặt Trước (Quẻ Tượng)
              </span>
              <div
                className={`relative rounded-2xl overflow-hidden shadow-[0_12px_36px_rgba(0,0,0,0.65)] border-2 border-[#C4963E]/65 bg-[#0A0806] flex items-center justify-center p-1 group hover:border-[#F3E5AB] transition-transform duration-500 ${
                  isReversed ? "rotate-180" : ""
                }`}
                style={{ width: "152px", height: "224px", maxWidth: "42vw" }}
              >
                <img
                  src={frontImg}
                  alt={`${hexagram.name} - Mặt trước`}
                  className="w-full h-full object-contain rounded-xl drop-shadow-md transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </div>

            {/* Mặt Sau */}
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-serif font-semibold text-[#F3E5AB] mb-1.5 flex items-center gap-1">
                <span className="text-[#D4AF37]">✦</span> Mặt Sau (Thoán Từ)
              </span>
              <div
                className="relative rounded-2xl overflow-hidden shadow-[0_12px_36px_rgba(0,0,0,0.65)] border-2 border-[#C4963E]/65 bg-[#0A0806] flex items-center justify-center p-1 group hover:border-[#F3E5AB] transition"
                style={{ width: "152px", height: "224px", maxWidth: "42vw" }}
              >
                <img
                  src={backImg}
                  alt={`${hexagram.name} - Mặt sau`}
                  className="w-full h-full object-contain rounded-xl drop-shadow-md transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="relative z-10 mx-auto flex flex-col items-center justify-center mb-4">
            <span className="text-[11px] font-serif font-semibold text-[#F3E5AB] mb-1.5 flex items-center gap-1">
              <span className="text-[#D4AF37]">✦</span>{" "}
              {modalCardView === "front" ? "Mặt Trước (Quẻ Tượng)" : "Mặt Sau (Thoán Từ)"}
            </span>
            <div
              className={`relative rounded-2xl overflow-hidden shadow-[0_12px_36px_rgba(0,0,0,0.65)] border-2 border-[#C4963E]/65 bg-[#0A0806] flex items-center justify-center p-1 group hover:border-[#F3E5AB] transition-transform duration-500 ${
                modalCardView === "front" && isReversed ? "rotate-180" : ""
              }`}
              style={{ width: "190px", height: "278px", maxWidth: "80vw" }}
            >
              <img
                src={modalCardView === "front" ? frontImg : backImg}
                alt={hexagram.name}
                className="w-full h-full object-contain rounded-xl drop-shadow-md transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </div>
        )}

        {effectivePositionLabel && (
          <div className="relative z-10 mb-2 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold font-serif bg-[#C4963E]/20 text-[#F3E5AB] border border-[#C4963E]/55 tracking-wider">
              Vị trí: {effectivePositionLabel}
            </span>
            {changingLines.length > 0 && (
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold font-serif bg-red-950/80 text-red-200 border border-red-500/60">
                ⚡ Hào động: {changingLines.join(", ")}
              </span>
            )}
          </div>
        )}

        <h3 className="relative z-10 text-xl font-serif font-bold text-[#FAF0D7] mb-1">
          Quẻ số {hexagram.number}: {hexagram.name} ({hexagram.hanzi || hexagram.name})
        </h3>
        <p className="relative z-10 text-xs text-[#C9A55A] mb-3 font-serif">
          Thượng {hexagram.upperTrigram} • Hạ {hexagram.lowerTrigram} • Ngũ hành: {hexagram.element}
        </p>

        {/* Lời Quẻ & Đại Tượng */}
        <div className="relative z-10 text-left space-y-2.5 bg-[#0B0907]/90 border border-[#C4963E]/30 rounded-2xl p-3.5 font-serif">
          {positionMeaning && (
            <div className="text-xs text-[#E8D5A7] border-b border-[#C4963E]/20 pb-2">
              <span className="font-bold text-[#D4AF37]">✦ Ý nghĩa cung vị: </span>
              {positionMeaning}
            </div>
          )}
          <div className="text-xs leading-relaxed text-[#E6D7B8]">
            <span className="font-bold text-[#D4AF37]">✦ Thoán Từ (Lời Quẻ): </span>
            {hexagram.judgment}
          </div>
          <div className="text-xs leading-relaxed text-[#CFC0A2]">
            <span className="font-bold text-[#C9A55A]">✦ Đại Tượng Truyện: </span>
            {hexagram.image}
          </div>
        </div>

        <div className="relative z-10 mt-4 flex flex-col sm:flex-row gap-2.5 justify-center">
          <button
            type="button"
            onClick={handleCopyCardForAI}
            className={`px-4 py-2.5 rounded-2xl text-xs font-semibold border transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md active:scale-95 ${
              copiedSingle
                ? "bg-emerald-600 text-white border-emerald-500"
                : "bg-[#221D17] hover:bg-[#2C251D] text-[#F3E5AB] border-[#C4963E]/55"
            }`}
          >
            <span>{copiedSingle ? "✓" : "✦"}</span>
            <span>{copiedSingle ? "Đã chép cho AI!" : "Chép lá này cho AI"}</span>
          </button>

          {effectiveOpenDetail && (
            <button
              type="button"
              onClick={() => {
                onClose();
                effectiveOpenDetail();
              }}
              className="px-5 py-2.5 rounded-2xl text-xs font-bold font-serif bg-gradient-to-r from-[#E5C158] to-[#C4963E] text-[#1A130A] border border-[#FFF3C4]/50 shadow-lg hover:brightness-105 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>📖</span>
              <span>Vào Xem Luận Giải Toàn Quẻ & 6 Hào</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
