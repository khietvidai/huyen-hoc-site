import React, { useState, useEffect } from "react";
import {
  Layers,
  ChevronDown,
  Scale,
  Shield,
  Save,
  Camera,
  Sparkles,
} from "lucide-react";
import { PillarItem, CHI_MAP } from "../data/baziConstants";

export type { PillarItem };

export interface GiaCauSettings {
  giaCauToHop?: "nien_nguyet_nhat_thoi" | "nien_thoi_nguyet_nhat" | null;
  giaCauLuan?: "chan_doai" | "kham_ly" | null;
  khamLyOption?: "thuy_hoa_ky_te" | "hoa_thuy_vi_te" | null;
  chanDoaiOption?: "kim_moc_giao_chien" | "moc_muoi_kim_huynh" | null;
  coChePhongVeList?: string[];
  // Bước 4: Bản chất (Tiên Thiên Tứ Thái)
  thaiDich?: "kim_thuy" | "moc_hoa" | null;
  thaiSo?: "kim" | "moc" | null;
  thaiThuy?: "ty" | "hoi" | null;
  thaiTo?: "than" | "dan" | null;
  isOpen?: boolean;
}

export interface BaziGiaCauThienProps {
  pillars?: [PillarItem, PillarItem, PillarItem, PillarItem]; // [0]: Giờ, [1]: Ngày, [2]: Tháng, [3]: Năm
  className?: string;
  onFillCurrentDateTime?: () => void;
  savedSettings?: GiaCauSettings;
  onSaveToBazi?: (settings: GiaCauSettings) => void;
  onCapture?: () => void;
}

export const BaziGiaCauThien: React.FC<BaziGiaCauThienProps> = ({
  pillars,
  className = "",
  savedSettings,
  onSaveToBazi,
  onCapture,
}) => {
  // Lựa chọn tổ hợp địa chi: 'nien_nguyet_nhat_thoi' hoặc 'nien_thoi_nguyet_nhat'
  const [giaCauToHop, setGiaCauToHop] = useState<
    "nien_nguyet_nhat_thoi" | "nien_thoi_nguyet_nhat" | null
  >(null);

  // Lựa chọn trục luận giải: 'chan_doai' hoặc 'kham_ly' (không chọn sẵn)
  const [giaCauLuan, setGiaCauLuan] = useState<"chan_doai" | "kham_ly" | null>(null);

  // 2 lựa chọn ở Khảm Ly luận: Thủy Hỏa Ký Tế & Hỏa Thủy Vị Tế
  const [khamLyOption, setKhamLyOption] = useState<"thuy_hoa_ky_te" | "hoa_thuy_vi_te" | null>(
    null
  );

  // 2 lựa chọn ở Chấn Đoài luận: Kim Mộc Giao Chiến & Mộc Muội Kim Huynh
  const [chanDoaiOption, setChanDoaiOption] = useState<
    "kim_moc_giao_chien" | "moc_muoi_kim_huynh" | null
  >(null);

  // Bước 3: Cơ chế phòng vệ (cho phép chọn nhiều hơn 1 địa chi ở 4 trụ)
  const [coChePhongVeList, setCoChePhongVeList] = useState<string[]>([]);

  // Bước 4: Bản chất (Thái Dịch, Thái Sơ, Thái Thủy, Thái Tố)
  const [thaiDich, setThaiDich] = useState<"kim_thuy" | "moc_hoa" | null>(null);
  const [thaiSo, setThaiSo] = useState<"kim" | "moc" | null>(null);
  const [thaiThuy, setThaiThuy] = useState<"ty" | "hoi" | null>(null);
  const [thaiTo, setThaiTo] = useState<"than" | "dan" | null>(null);

  // Trạng thái thu gọn / mở rộng
  const [isOpen, setIsOpen] = useState<boolean>(true);

  // Khi mở file hoặc nạp hồ sơ: nhảy ra luôn thiết lập đã lưu
  useEffect(() => {
    if (!savedSettings) return;
    if (savedSettings.giaCauToHop !== undefined) setGiaCauToHop(savedSettings.giaCauToHop);
    if (savedSettings.giaCauLuan !== undefined) setGiaCauLuan(savedSettings.giaCauLuan);
    if (savedSettings.khamLyOption !== undefined) setKhamLyOption(savedSettings.khamLyOption);
    if (savedSettings.chanDoaiOption !== undefined) setChanDoaiOption(savedSettings.chanDoaiOption);
    if (savedSettings.coChePhongVeList !== undefined) setCoChePhongVeList(savedSettings.coChePhongVeList);
    if (savedSettings.thaiDich !== undefined) setThaiDich(savedSettings.thaiDich);
    if (savedSettings.thaiSo !== undefined) setThaiSo(savedSettings.thaiSo);
    if (savedSettings.thaiThuy !== undefined) setThaiThuy(savedSettings.thaiThuy);
    if (savedSettings.thaiTo !== undefined) setThaiTo(savedSettings.thaiTo);
    if (savedSettings.isOpen !== undefined) setIsOpen(savedSettings.isOpen);
  }, [savedSettings]);

  // 4 Địa Chi ở 4 trụ
  const nienChi = pillars?.[3]?.chi || "Dậu";
  const nguyetChi = pillars?.[2]?.chi || "Dậu";
  const nhatChi = pillars?.[1]?.chi || "Dậu";
  const thoiChi = pillars?.[0]?.chi || "Tỵ";

  const branches = [
    { key: "thoi", label: "Chi Giờ", chi: thoiChi, pillar: "Thời Trụ" },
    { key: "nhat", label: "Chi Ngày", chi: nhatChi, pillar: "Nhật Trụ" },
    { key: "nguyet", label: "Chi Tháng", chi: nguyetChi, pillar: "Nguyệt Trụ" },
    { key: "nien", label: "Chi Năm", chi: nienChi, pillar: "Niên Trụ" },
  ];

  // Helper toggle chọn nhiều
  const togglePhongVe = (key: string) => {
    setCoChePhongVeList((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  return (
    <div
      className={`p-3 sm:p-5 rounded-2xl bg-gradient-to-b from-[#FFFDF8] via-[#FFFDF8] to-[#FFFDF8] border border-[#C4963E]/45 shadow-xl ${className}`}
    >
      {/* Header Gia Cấu Thiên */}
      <div className="flex flex-row items-center justify-between gap-2 pb-2.5 sm:pb-3 border-b border-[#C4963E]/45">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#9E2A2B] text-[#FFF9F5] flex items-center justify-center shadow-md shrink-0">
            <Layers className="w-4 h-4 text-[#78350F]" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-base font-bold text-[#1C1813] font-serif tracking-wide truncate">
              GIA CẤU THIÊN (架構篇)
            </h3>
            <p className="text-[10px] sm:text-xs text-[#5C4D3C] mt-0.5 line-clamp-1">
              Phân tích tổ hợp Địa Chi và trục Chấn Đoài & Khảm Ly.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {onSaveToBazi && (
            <button
              type="button"
              onClick={() =>
                onSaveToBazi({
                  giaCauToHop,
                  giaCauLuan,
                  khamLyOption,
                  chanDoaiOption,
                  coChePhongVeList,
                  thaiDich,
                  thaiSo,
                  thaiThuy,
                  thaiTo,
                  isOpen,
                })
              }
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] sm:text-xs font-bold rounded-lg bg-gradient-to-r from-[#C9A55A] to-[#B8860B] hover:from-[#F3CE65] hover:to-[#C69214] text-[#1A1208] shadow-sm shadow-[#C9A55A]/20 transition-all cursor-pointer active:scale-95 whitespace-nowrap"
              title="Lưu thiết lập Gia Cấu Thiên vào lá số Bát Tự"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Lưu Vào Bát Tự</span>
            </button>
          )}

          {onCapture && (
            <button
              type="button"
              onClick={onCapture}
              className="no-capture flex items-center gap-1 px-2.5 py-1 text-[11px] sm:text-xs font-semibold rounded-lg bg-[#FFFDF8] hover:bg-[#FAF6EE] text-[#78350F] border border-[#C4963E]/45 hover:border-[#B8862D] transition-all cursor-pointer shadow-sm active:scale-95 whitespace-nowrap"
              title="Chụp ảnh riêng Gia Cấu Thiên"
            >
              <Camera className="w-3.5 h-3.5 text-[#92400E]" />
              <span>Chụp Gia Cấu</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 px-2 py-1 text-[11px] sm:text-xs font-medium rounded-lg bg-[#FFFDF8] text-[#6E4E16] border border-[#C4963E]/45 hover:bg-[#FAF6EE] transition-all cursor-pointer whitespace-nowrap"
          >
            <span>{isOpen ? "Thu Gọn" : "Mở Rộng"}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="mt-3 sm:mt-4 text-xs">
          <div className="space-y-2.5 sm:space-y-3 p-2.5 sm:p-3 rounded-xl bg-[#FFFDF8] border border-[#C4963E]/45">
            {/* HÀNG 1: BƯỚC 1 & BƯỚC 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
              {/* BƯỚC 1: LỰA CHỌN TỔ HỢP ĐỊA CHI */}
              <div className="space-y-1.5">
                <div className="text-[10.5px] sm:text-[11px] font-bold text-[#6E4E16] flex items-center gap-1.5 uppercase tracking-wider">
                  <span className="w-4 h-4 rounded-full bg-amber-500/20 text-[#78350F] flex items-center justify-center text-[10px] font-mono shrink-0">
                    1
                  </span>
                  <span>Bước 1: Xem tổ hợp địa chi</span>
                </div>
                <div className="text-[9.5px] sm:text-[10px] text-[#5C4D3C] font-semibold flex items-center gap-1">
                  <span>Phân tổ hợp:</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => setGiaCauToHop(prev => prev === "nien_nguyet_nhat_thoi" ? null : "nien_nguyet_nhat_thoi")}
                    className={`p-2 sm:p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      giaCauToHop === "nien_nguyet_nhat_thoi"
                        ? "bg-gradient-to-r from-[#FAF6EE] to-[#FFFDF8] border-[#B8862D] text-[#1C1813] font-bold shadow-md shadow-[#C9A55A]/15 ring-1 ring-[#C9A55A]/50"
                        : "bg-[#FFFDF8] hover:bg-[#FFFDF8] border-[#C4963E]/45 text-[#5C4D3C]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-serif text-[11px] sm:text-xs text-[#6E4E16] leading-tight font-bold">Niên Nguyệt - Nhật Thời</span>
                      {giaCauToHop === "nien_nguyet_nhat_thoi" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C9A55A] shrink-0" />
                      )}
                    </div>
                    <div className="text-[9px] sm:text-[10px] text-[#5C4D3C] mt-0.5 leading-tight">Khách (Ngoại) ⟷ Chủ (Nội)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGiaCauToHop(prev => prev === "nien_thoi_nguyet_nhat" ? null : "nien_thoi_nguyet_nhat")}
                    className={`p-2 sm:p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      giaCauToHop === "nien_thoi_nguyet_nhat"
                        ? "bg-gradient-to-r from-[#FAF6EE] to-[#FFFDF8] border-[#B8862D] text-[#1C1813] font-bold shadow-md shadow-[#C9A55A]/15 ring-1 ring-[#C9A55A]/50"
                        : "bg-[#FFFDF8] hover:bg-[#FFFDF8] border-[#C4963E]/45 text-[#5C4D3C]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-serif text-[11px] sm:text-xs text-[#6E4E16] leading-tight font-bold">Niên Thời - Nguyệt Nhật</span>
                      {giaCauToHop === "nien_thoi_nguyet_nhat" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C9A55A] shrink-0" />
                      )}
                    </div>
                    <div className="text-[9px] sm:text-[10px] text-[#5C4D3C] mt-0.5 leading-tight">Khung Viền ⟷ Cốt Lõi</div>
                  </button>
                </div>
              </div>

              {/* BƯỚC 2: TRỤC LUẬN GIẢI: CHẤN ĐOÀI vs KHẢM LY */}
              <div className="space-y-1.5">
                <div className="text-[10.5px] sm:text-[11px] font-bold text-[#6E4E16] flex items-center gap-1.5 uppercase tracking-wider">
                  <Scale className="w-3.5 h-3.5 text-[#92400E] shrink-0" />
                  <span>Bước 2: Trục luận giải:</span>
                </div>
                <div className="text-[9.5px] sm:text-[10px] text-[#5C4D3C] font-semibold flex items-center gap-1">
                  <span>Phương pháp:</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => setGiaCauLuan(prev => prev === "chan_doai" ? null : "chan_doai")}
                    className={`p-2 sm:p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      giaCauLuan === "chan_doai"
                        ? "bg-gradient-to-r from-[#ECFDF5] to-[#FFFDF8] border-emerald-400 text-[#14532D] font-bold shadow-md shadow-emerald-500/15 ring-1 ring-emerald-500/40"
                        : "bg-[#FFFDF8] hover:bg-[#FFFDF8] border-[#C4963E]/45 text-[#5C4D3C]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-serif text-[11px] sm:text-xs text-[#14532D] leading-tight font-bold">Chấn Đoài (震兌)</span>
                      {giaCauLuan === "chan_doai" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      )}
                    </div>
                    <div className="text-[9px] sm:text-[10px] text-[#5C4D3C] mt-0.5 leading-tight">Trục Mộc Kim</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGiaCauLuan(prev => prev === "kham_ly" ? null : "kham_ly")}
                    className={`p-2 sm:p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      giaCauLuan === "kham_ly"
                        ? "bg-gradient-to-r from-[#EFF6FF] to-[#FFFDF8] border-sky-400 text-[#1E3A8A] font-bold shadow-md shadow-sky-500/15 ring-1 ring-sky-500/40"
                        : "bg-[#FFFDF8] hover:bg-[#FFFDF8] border-[#C4963E]/45 text-[#5C4D3C]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-serif text-[11px] sm:text-xs text-[#1E3A8A] leading-tight font-bold">Khảm Ly (坎離)</span>
                      {giaCauLuan === "kham_ly" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                      )}
                    </div>
                    <div className="text-[9px] sm:text-[10px] text-[#5C4D3C] mt-0.5 leading-tight">Trục Thủy Hỏa</div>
                  </button>
                </div>

                {/* 2 LỰA CHỌN CỦA CHẤN ĐOÀI LUẬN */}
                {giaCauLuan === "chan_doai" && (
                  <div className="pt-2 border-t border-[#C4963E]/45 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-[#15803D] font-bold">2 Lựa chọn Chấn Đoài luận:</span>
                      <span className="text-[#5C4D3C] font-mono text-[9px] sm:text-[10px]">
                        {chanDoaiOption === "kim_moc_giao_chien"
                          ? "Kim Mộc Giao Chiến"
                          : chanDoaiOption === "moc_muoi_kim_huynh"
                          ? "Mộc Muội Kim Huynh"
                          : "(Chưa chọn)"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                      <button
                        type="button"
                        onClick={() => setChanDoaiOption(prev => prev === "kim_moc_giao_chien" ? null : "kim_moc_giao_chien")}
                        className={`p-1.5 sm:p-2 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          chanDoaiOption === "kim_moc_giao_chien"
                            ? "bg-gradient-to-r from-[#ECFDF5] to-[#FFFDF8] border-emerald-400 text-[#14532D] font-bold ring-1 ring-emerald-500/50 shadow-sm"
                            : "bg-[#FFFDF8] hover:bg-[#FFFDF8] border-[#C4963E]/45 text-[#5C4D3C]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[11px] sm:text-xs font-serif text-[#14532D] font-semibold leading-tight">
                            Kim Mộc Giao Chiến
                          </span>
                          {chanDoaiOption === "kim_moc_giao_chien" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                          )}
                        </div>
                        <div className="text-[8.5px] sm:text-[9px] text-[#5C4D3C] mt-0.5 leading-tight">
                          Xung khắc trực diện
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setChanDoaiOption(prev => prev === "moc_muoi_kim_huynh" ? null : "moc_muoi_kim_huynh")}
                        className={`p-1.5 sm:p-2 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          chanDoaiOption === "moc_muoi_kim_huynh"
                            ? "bg-gradient-to-r from-[#ECFDF5] to-[#FFFDF8] border-emerald-400 text-[#14532D] font-bold ring-1 ring-emerald-500/50 shadow-sm"
                            : "bg-[#FFFDF8] hover:bg-[#FFFDF8] border-[#C4963E]/45 text-[#5C4D3C]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[11px] sm:text-xs font-serif text-[#14532D] font-semibold leading-tight">
                            Mộc Muội Kim Huynh
                          </span>
                          {chanDoaiOption === "moc_muoi_kim_huynh" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                          )}
                        </div>
                        <div className="text-[8.5px] sm:text-[9px] text-[#5C4D3C] mt-0.5 leading-tight">
                          Hòa hợp nương tựa
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* 2 LỰA CHỌN CỦA KHẢM LY LUẬN */}
                {giaCauLuan === "kham_ly" && (
                  <div className="pt-2 border-t border-[#C4963E]/45 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-[#1D4ED8] font-bold">2 Lựa chọn Khảm Ly luận:</span>
                      <span className="text-[#5C4D3C] font-mono text-[9px] sm:text-[10px]">
                        {khamLyOption === "thuy_hoa_ky_te"
                          ? "Thủy Hỏa Ký Tế"
                          : khamLyOption === "hoa_thuy_vi_te"
                          ? "Hỏa Thủy Vị Tế"
                          : "(Chưa chọn)"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                      <button
                        type="button"
                        onClick={() => setKhamLyOption(prev => prev === "thuy_hoa_ky_te" ? null : "thuy_hoa_ky_te")}
                        className={`p-1.5 sm:p-2 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          khamLyOption === "thuy_hoa_ky_te"
                            ? "bg-gradient-to-r from-[#EFF6FF] to-[#FFFDF8] border-sky-400 text-[#1E3A8A] font-bold ring-1 ring-sky-500/50 shadow-sm"
                            : "bg-[#FFFDF8] hover:bg-[#FFFDF8] border-[#C4963E]/45 text-[#5C4D3C]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[11px] sm:text-xs font-serif text-[#1E3A8A] font-semibold leading-tight">
                            Thủy Hỏa Ký Tế
                          </span>
                          {khamLyOption === "thuy_hoa_ky_te" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                          )}
                        </div>
                        <div className="text-[8.5px] sm:text-[9px] text-[#5C4D3C] mt-0.5 leading-tight">
                          Giao hòa tương tể
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setKhamLyOption(prev => prev === "hoa_thuy_vi_te" ? null : "hoa_thuy_vi_te")}
                        className={`p-1.5 sm:p-2 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          khamLyOption === "hoa_thuy_vi_te"
                            ? "bg-gradient-to-r from-[#EFF6FF] to-[#FFFDF8] border-sky-400 text-[#1E3A8A] font-bold ring-1 ring-sky-500/50 shadow-sm"
                            : "bg-[#FFFDF8] hover:bg-[#FFFDF8] border-[#C4963E]/45 text-[#5C4D3C]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[11px] sm:text-xs font-serif text-[#1E3A8A] font-semibold leading-tight">
                            Hỏa Thủy Vị Tế
                          </span>
                          {khamLyOption === "hoa_thuy_vi_te" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                          )}
                        </div>
                        <div className="text-[8.5px] sm:text-[9px] text-[#5C4D3C] mt-0.5 leading-tight">
                          Bất tương giao
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* BƯỚC 3: CƠ CHẾ PHÒNG VỆ (CHỌN ĐƯỢC NHIỀU HƠN 1, 4 CHI THẲNG HÀNG GỌN GÀNG NHƯ Ô ĐỊA CHI BÁT TỰ) */}
            <div className="pt-2 sm:pt-2.5 border-t border-[#C4963E]/45 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="text-[10.5px] sm:text-[11px] font-bold text-[#6E4E16] flex items-center gap-1.5 uppercase tracking-wider">
                  <Shield className="w-3.5 h-3.5 text-[#92400E] shrink-0" />
                  <span>Bước 3: Cơ chế phòng vệ</span>
                </div>
                <div className="text-[9px] sm:text-[10px] text-[#5C4D3C] font-mono">
                  {coChePhongVeList.length > 0
                    ? `Đã chọn (${coChePhongVeList.length}): ${coChePhongVeList
                        .map((k) => branches.find((b) => b.key === k)?.chi)
                        .join(", ")}`
                    : "(Chưa chọn)"}
                </div>
              </div>
              <div className="text-[9.5px] sm:text-[10px] text-[#5C4D3C] font-semibold flex items-center gap-1">
                <span>Chọn địa chi ở 4 trụ (có thể chọn nhiều):</span>
              </div>

              {/* 4 CHI THẲNG HÀNG GỌN GÀNG BÊ Ô ĐỊA CHI TRÊN BÁT TỰ */}
              <div className="grid grid-cols-4 gap-1 sm:gap-2">
                {branches.map((b) => {
                  const isSelected = coChePhongVeList.includes(b.key);
                  const chiData = CHI_MAP.get(b.chi);

                  return (
                    <button
                      key={b.key}
                      type="button"
                      onClick={() => togglePhongVe(b.key)}
                      className={`relative p-1 sm:p-2 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-between min-h-[56px] sm:min-h-[64px] ${
                        isSelected
                          ? "bg-gradient-to-b from-[#FAF6EE] to-[#FFFDF8] border-[#B8862D] text-[#1C1813] font-bold shadow-md shadow-[#C9A55A]/20 ring-1 ring-[#C9A55A]/60"
                          : "bg-gradient-to-b from-[#FFFDF8] to-[#FFFDF8] hover:bg-[#FFFDF8] border-[#C4963E]/45 text-[#5C4D3C]"
                      }`}
                    >
                      {/* Tên Trụ trên cùng */}
                      <div className="flex items-center justify-between w-full px-0.5 pb-0.5 border-b border-[#C4963E]/45">
                        <span className="text-[8.5px] sm:text-[10px] font-bold text-[#6E4E16] truncate">
                          {b.label}
                        </span>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C9A55A] shrink-0" />
                        )}
                      </div>

                      {/* Emoji & Tên Chi chuẩn Bát Tự */}
                      <div className="flex items-center justify-center gap-0.5 sm:gap-1 my-0.5 sm:my-1">
                        <span className="text-xs sm:text-base leading-none">
                          {chiData?.emoji || "⭐"}
                        </span>
                        <span className="text-xs sm:text-sm font-serif font-bold text-[#1C1813] leading-none">
                          {b.chi}
                        </span>
                        <span className="text-[8px] sm:text-[9.5px] text-[#5C4D3C] font-serif">
                          ({chiData?.chinese || ""})
                        </span>
                      </div>

                      {/* Nhãn Niên/Nguyệt/Nhật/Thời */}
                      <div className="text-[7.5px] sm:text-[8.5px] text-[#5C4D3C] font-mono leading-none">
                        {b.pillar}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* BƯỚC 4: BẢN CHẤT (THÁI DỊCH, THÁI SƠ, THÁI THỦY, THÁI TỐ) */}
            <div className="pt-2 sm:pt-2.5 border-t border-[#C4963E]/45 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-[10.5px] sm:text-[11px] font-bold text-[#6E4E16] flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-[#92400E] shrink-0" />
                  <span>Bước 4: Bản chất</span>
                </div>
                <div className="text-[9px] sm:text-[10px] text-[#5C4D3C] font-mono truncate max-w-[55%] text-right">
                  {[
                    thaiDich ? (thaiDich === "kim_thuy" ? "Kim Thủy" : "Mộc Hỏa") : null,
                    thaiSo ? (thaiSo === "kim" ? "Kim" : "Mộc") : null,
                    thaiThuy ? (thaiThuy === "ty" ? "Tỵ" : "Hợi") : null,
                    thaiTo ? (thaiTo === "than" ? "Thân" : "Dần") : null,
                  ]
                    .filter(Boolean)
                    .join(" • ") || "(Chưa chọn)"}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {/* 1. THÁI DỊCH */}
                <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-b from-[#FFFDF8] to-[#FFFDF8] border border-[#C4963E]/45 space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10.5px] sm:text-[11.5px] font-serif font-bold text-[#78350F]">
                        Thái Dịch (太易)
                      </span>
                      <span className="text-[8.5px] sm:text-[9.5px] text-[#5C4D3C] font-mono">
                        {thaiDich === "kim_thuy" ? "Kim Thủy" : thaiDich === "moc_hoa" ? "Mộc Hỏa" : "Chưa chọn"}
                      </span>
                    </div>
                    <div className="text-[8.5px] sm:text-[9px] text-[#5C4D3C] leading-tight mt-0.5">
                      Khí chưa sinh (Chân nguyên)
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setThaiDich((prev) => (prev === "kim_thuy" ? null : "kim_thuy"))}
                      className={`p-1.5 sm:p-2 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                        thaiDich === "kim_thuy"
                          ? "bg-gradient-to-b from-cyan-950/90 to-[#FAF6EE] border-cyan-400 text-cyan-200 font-bold ring-1 ring-cyan-500/50 shadow-sm"
                          : "bg-[#FFFDF8] hover:bg-[#FFFDF8] border-[#C4963E]/45 text-[#5C4D3C]"
                      }`}
                    >
                      <span className="text-[10.5px] sm:text-[11.5px] font-bold font-serif leading-tight">
                        Kim Thủy
                      </span>
                      <span className="text-[8px] sm:text-[8.5px] text-[#5C4D3C] leading-none mt-0.5 font-serif">金水</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setThaiDich((prev) => (prev === "moc_hoa" ? null : "moc_hoa"))}
                      className={`p-1.5 sm:p-2 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                        thaiDich === "moc_hoa"
                          ? "bg-gradient-to-b from-[#FFF1F2] to-[#FFFDF8] border-rose-400 text-[#991B1B] font-bold ring-1 ring-rose-500/50 shadow-sm"
                          : "bg-[#FFFDF8] hover:bg-[#FFFDF8] border-[#C4963E]/45 text-[#5C4D3C]"
                      }`}
                    >
                      <span className="text-[10.5px] sm:text-[11.5px] font-bold font-serif leading-tight">
                        Mộc Hỏa
                      </span>
                      <span className="text-[8px] sm:text-[8.5px] text-[#5C4D3C] leading-none mt-0.5 font-serif">木火</span>
                    </button>
                  </div>
                </div>

                {/* 2. THÁI SƠ */}
                <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-b from-[#FFFDF8] to-[#FFFDF8] border border-[#C4963E]/45 space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10.5px] sm:text-[11.5px] font-serif font-bold text-[#78350F]">
                        Thái Sơ (太初)
                      </span>
                      <span className="text-[8.5px] sm:text-[9.5px] text-[#5C4D3C] font-mono">
                        {thaiSo === "kim" ? "Kim" : thaiSo === "moc" ? "Mộc" : "Chưa chọn"}
                      </span>
                    </div>
                    <div className="text-[8.5px] sm:text-[9px] text-[#5C4D3C] leading-tight mt-0.5">
                      Khí bắt đầu sinh
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setThaiSo((prev) => (prev === "kim" ? null : "kim"))}
                      className={`p-1.5 sm:p-2 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                        thaiSo === "kim"
                          ? "bg-gradient-to-b from-[#FEF3C7] to-[#FAF6EE] border-amber-400 text-[#78350F] font-bold ring-1 ring-amber-500/50 shadow-sm"
                          : "bg-[#FFFDF8] hover:bg-[#FFFDF8] border-[#C4963E]/45 text-[#5C4D3C]"
                      }`}
                    >
                      <span className="text-[10.5px] sm:text-[11.5px] font-bold font-serif leading-tight">
                        Kim
                      </span>
                      <span className="text-[8px] sm:text-[8.5px] text-[#5C4D3C] leading-none mt-0.5 font-serif">金</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setThaiSo((prev) => (prev === "moc" ? null : "moc"))}
                      className={`p-1.5 sm:p-2 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                        thaiSo === "moc"
                          ? "bg-gradient-to-b from-[#ECFDF5] to-[#FAF6EE] border-emerald-400 text-[#14532D] font-bold ring-1 ring-emerald-500/50 shadow-sm"
                          : "bg-[#FFFDF8] hover:bg-[#FFFDF8] border-[#C4963E]/45 text-[#5C4D3C]"
                      }`}
                    >
                      <span className="text-[10.5px] sm:text-[11.5px] font-bold font-serif leading-tight">
                        Mộc
                      </span>
                      <span className="text-[8px] sm:text-[8.5px] text-[#5C4D3C] leading-none mt-0.5 font-serif">木</span>
                    </button>
                  </div>
                </div>

                {/* 3. THÁI THỦY */}
                <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-b from-[#FFFDF8] to-[#FFFDF8] border border-[#C4963E]/45 space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10.5px] sm:text-[11.5px] font-serif font-bold text-[#78350F]">
                        Thái Thủy (太始)
                      </span>
                      <span className="text-[8.5px] sm:text-[9.5px] text-[#5C4D3C] font-mono">
                        {thaiThuy === "ty" ? "Tỵ" : thaiThuy === "hoi" ? "Hợi" : "Chưa chọn"}
                      </span>
                    </div>
                    <div className="text-[8.5px] sm:text-[9px] text-[#5C4D3C] leading-tight mt-0.5">
                      Hình bắt đầu sinh
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setThaiThuy((prev) => (prev === "ty" ? null : "ty"))}
                      className={`p-1.5 sm:p-2 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                        thaiThuy === "ty"
                          ? "bg-gradient-to-b from-[#FFF1F2] to-[#FFFDF8] border-rose-400 text-[#991B1B] font-bold ring-1 ring-rose-500/50 shadow-sm"
                          : "bg-[#FFFDF8] hover:bg-[#FFFDF8] border-[#C4963E]/45 text-[#5C4D3C]"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-xs sm:text-sm leading-none">🐍</span>
                        <span className="text-[10.5px] sm:text-[11.5px] font-bold font-serif leading-tight">
                          Tỵ
                        </span>
                      </div>
                      <span className="text-[8px] sm:text-[8.5px] text-[#5C4D3C] leading-none mt-0.5 font-serif">巳 (Hỏa)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setThaiThuy((prev) => (prev === "hoi" ? null : "hoi"))}
                      className={`p-1.5 sm:p-2 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                        thaiThuy === "hoi"
                          ? "bg-gradient-to-b from-[#EFF6FF] to-[#FFFDF8] border-sky-400 text-[#1E3A8A] font-bold ring-1 ring-sky-500/50 shadow-sm"
                          : "bg-[#FFFDF8] hover:bg-[#FFFDF8] border-[#C4963E]/45 text-[#5C4D3C]"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-xs sm:text-sm leading-none">🐷</span>
                        <span className="text-[10.5px] sm:text-[11.5px] font-bold font-serif leading-tight">
                          Hợi
                        </span>
                      </div>
                      <span className="text-[8px] sm:text-[8.5px] text-[#5C4D3C] leading-none mt-0.5 font-serif">亥 (Thủy)</span>
                    </button>
                  </div>
                </div>

                {/* 4. THÁI TỐ */}
                <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-b from-[#FFFDF8] to-[#FFFDF8] border border-[#C4963E]/45 space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10.5px] sm:text-[11.5px] font-serif font-bold text-[#78350F]">
                        Thái Tố (太素)
                      </span>
                      <span className="text-[8.5px] sm:text-[9.5px] text-[#5C4D3C] font-mono">
                        {thaiTo === "than" ? "Thân" : thaiTo === "dan" ? "Dần" : "Chưa chọn"}
                      </span>
                    </div>
                    <div className="text-[8.5px] sm:text-[9px] text-[#5C4D3C] leading-tight mt-0.5">
                      Chất bắt đầu sinh
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setThaiTo((prev) => (prev === "than" ? null : "than"))}
                      className={`p-1.5 sm:p-2 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                        thaiTo === "than"
                          ? "bg-gradient-to-b from-[#FEF3C7] to-[#FAF6EE] border-amber-400 text-[#78350F] font-bold ring-1 ring-amber-500/50 shadow-sm"
                          : "bg-[#FFFDF8] hover:bg-[#FFFDF8] border-[#C4963E]/45 text-[#5C4D3C]"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-xs sm:text-sm leading-none">🐒</span>
                        <span className="text-[10.5px] sm:text-[11.5px] font-bold font-serif leading-tight">
                          Thân
                        </span>
                      </div>
                      <span className="text-[8px] sm:text-[8.5px] text-[#5C4D3C] leading-none mt-0.5 font-serif">申 (Kim)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setThaiTo((prev) => (prev === "dan" ? null : "dan"))}
                      className={`p-1.5 sm:p-2 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                        thaiTo === "dan"
                          ? "bg-gradient-to-b from-[#ECFDF5] to-[#FAF6EE] border-emerald-400 text-[#14532D] font-bold ring-1 ring-emerald-500/50 shadow-sm"
                          : "bg-[#FFFDF8] hover:bg-[#FFFDF8] border-[#C4963E]/45 text-[#5C4D3C]"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-xs sm:text-sm leading-none">🐯</span>
                        <span className="text-[10.5px] sm:text-[11.5px] font-bold font-serif leading-tight">
                          Dần
                        </span>
                      </div>
                      <span className="text-[8px] sm:text-[8.5px] text-[#5C4D3C] leading-none mt-0.5 font-serif">寅 (Mộc)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
