import React, { useState, useEffect } from "react";
import { Dices, Sparkles, RefreshCw, CheckCircle2 } from "lucide-react";
import { TWELVE_BRANCHES_DATA, EarthlyBranchInfo } from "../data/spreads";

interface TwelveSidedDiceProps {
  value?: number; // 1..12
  onRoll: (result: number) => void;
  disabled?: boolean;
  compact?: boolean;
  className?: string;
}

export const TwelveSidedDice: React.FC<TwelveSidedDiceProps> = ({
  value = 3, // default at Dần (tháng giêng)
  onRoll,
  disabled = false,
  compact = false,
  className = "",
}) => {
  const [isRolling, setIsRolling] = useState(false);
  const [displayNumber, setDisplayNumber] = useState<number>(value);
  const [hasRolledOnce, setHasRolledOnce] = useState(false);

  useEffect(() => {
    setDisplayNumber(value);
  }, [value]);

  const handleRoll = () => {
    if (disabled || isRolling) return;

    setIsRolling(true);
    let counter = 0;
    const totalTicks = 16;
    const intervalMs = 60;

    const interval = setInterval(() => {
      counter++;
      const randNum = Math.floor(Math.random() * 12) + 1;
      setDisplayNumber(randNum);

      if (counter >= totalTicks) {
        clearInterval(interval);
        const finalNum = Math.floor(Math.random() * 12) + 1;
        setDisplayNumber(finalNum);
        setIsRolling(false);
        setHasRolledOnce(true);
        onRoll(finalNum);
      }
    }, intervalMs);
  };

  const currentBranch: EarthlyBranchInfo =
    TWELVE_BRANCHES_DATA.find((b) => b.number === displayNumber) || TWELVE_BRANCHES_DATA[2];

  if (compact) {
    return (
      <div className={`flex items-center gap-2 bg-[#1C1610] p-2 rounded-xl border border-[#3E3020] ${className}`}>
        <button
          type="button"
          onClick={handleRoll}
          disabled={disabled || isRolling}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-serif font-bold transition-all shadow ${
            isRolling
              ? "bg-[#3A2D1F] text-[#A89882] cursor-not-allowed"
              : "bg-[#D4AF37] hover:bg-[#FFE28A] text-black cursor-pointer active:scale-95"
          }`}
          title="Gieo xúc xắc 12 mặt để định Mệnh Cung ngẫu nhiên"
        >
          <Dices className={`w-4 h-4 ${isRolling ? "animate-spin text-[#D4AF37]" : ""}`} />
          <span>{isRolling ? "Đang gieo..." : "Gieo Xúc Xắc 12 Mặt"}</span>
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-[#352718]">
          <div className="w-7 h-7 rounded-lg bg-[#2A1E13] border border-[#523E28] flex items-center justify-center font-mono font-bold text-sm text-[#FFE28A] shadow-inner">
            {displayNumber}
          </div>
          <div className="text-[11px] leading-tight font-serif">
            <span className="text-[#EAD8B1] font-bold">Chi {currentBranch.name}</span>
            <span className="text-[#8C7D6A] block text-[10px]">({currentBranch.lunarMonth})</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-3 sm:p-4 rounded-2xl bg-gradient-to-b from-[#241A12] via-[#1B140E] to-[#140E0A] border border-[#483623] shadow-xl text-center relative overflow-hidden ${className}`}
    >
      {/* Background soft glow */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#17110B] border border-[#3A2A1A] text-[11px] font-serif font-semibold text-[#D4AF37] mb-2">
          <Sparkles className="w-3 h-3 text-[#D4AF37]" />
          <span>XÚC XẮC 12 MẶT • ĐỊNH VỊ MỆNH CUNG</span>
        </div>

        {/* 12-Sided D12 Visual Simulation */}
        <div className="my-2 relative group cursor-pointer" onClick={handleRoll}>
          <div
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#3B2B1B] via-[#241B12] to-[#17100B] border-2 ${
              isRolling
                ? "border-[#FFE28A] animate-spin shadow-[0_0_24px_rgba(255,226,138,0.5)]"
                : "border-[#D4AF37] shadow-[0_0_16px_rgba(212,175,55,0.25)] hover:scale-105"
            } transition-all duration-300 flex flex-col items-center justify-center p-2 relative select-none`}
            style={{
              clipPath: "polygon(50% 0%, 90% 20%, 100% 60%, 75% 100%, 25% 100%, 0% 60%, 10% 20%)",
            }}
          >
            <span className="text-[10px] uppercase font-serif text-[#A89882] tracking-wider -mt-1">
              D12
            </span>
            <span
              className={`text-2xl sm:text-3xl font-mono font-black text-[#FFE28A] transition-transform ${
                isRolling ? "scale-110 blur-[0.5px]" : "scale-100"
              }`}
            >
              {displayNumber}
            </span>
            <span className="text-[10px] font-serif font-bold text-[#EAD8B1]">
              {currentBranch.name}
            </span>
          </div>

          <div className="absolute -bottom-1 -right-1 bg-[#D4AF37] text-black w-6 h-6 rounded-full flex items-center justify-center shadow-md">
            <Dices className={`w-3.5 h-3.5 ${isRolling ? "animate-spin" : ""}`} />
          </div>
        </div>

        {/* Result description */}
        <div className="mt-2 text-center">
          <div className="text-xs sm:text-sm font-serif font-bold text-[#FFF] flex items-center justify-center gap-1.5">
            <span>Mệnh Cung An Tại:</span>
            <span className="text-[#FFE28A] bg-[#2E2014] px-2 py-0.5 rounded border border-[#543C25]">
              Cung {currentBranch.name} ({currentBranch.lunarMonth})
            </span>
          </div>
          <p className="text-[11px] text-[#A89882] mt-1 max-w-md mx-auto">
            Số <strong>{displayNumber}</strong> ứng với Địa Chi <strong>{currentBranch.name}</strong>.
            Từ Cung Mệnh, 11 Cung Tử Vi còn lại (Phụ Mẫu, Phúc Đức, Điền Trạch, Quan Lộc, Nô Bộc, Thiên Di, Tật Ách, Tài Bạch, Tử Tức, Phu Thê, Huynh Đệ) được an chuyển tuần hoàn quanh 12 Địa Chi (có thể tùy chọn xoay thuận hoặc nghịch).
          </p>
        </div>

        {/* Roll action button */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={handleRoll}
            disabled={disabled || isRolling}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-serif font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95 ${
              isRolling
                ? "bg-[#382B1E] text-[#8C7D6A] cursor-not-allowed border border-[#4D3B29]"
                : "bg-gradient-to-r from-[#D4AF37] via-[#F3D787] to-[#C29826] text-black hover:brightness-110 border border-[#FFE28A]"
            }`}
          >
            {isRolling ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-[#D4AF37]" />
                <span>Đang Gieo Xúc Xắc 12 Mặt...</span>
              </>
            ) : (
              <>
                <Dices className="w-4 h-4" />
                <span>{hasRolledOnce ? "Gieo Lại Xúc Xắc 12 Mặt" : "Gieo Xúc Xắc 12 Mặt (Định Mệnh Cung)"}</span>
              </>
            )}
          </button>
        </div>

        {/* Quick select selector (1..12) */}
        <div className="mt-3 pt-3 border-t border-[#312519] w-full">
          <div className="text-[10px] font-serif text-[#8C7D6A] mb-1.5 flex items-center justify-center gap-1">
            <span>Hoặc chọn trực tiếp số 1-12 để an Mệnh Cung thủ công:</span>
          </div>
          <div className="grid grid-cols-6 sm:grid-cols-12 gap-1 max-w-lg mx-auto">
            {TWELVE_BRANCHES_DATA.map((branch) => {
              const isSelected = displayNumber === branch.number;
              return (
                <button
                  key={branch.number}
                  type="button"
                  onClick={() => {
                    if (disabled || isRolling) return;
                    setDisplayNumber(branch.number);
                    setHasRolledOnce(true);
                    onRoll(branch.number);
                  }}
                  disabled={disabled || isRolling}
                  className={`py-1 px-1 rounded-lg text-[10px] font-serif font-bold transition-all border ${
                    isSelected
                      ? "bg-[#D4AF37] text-black border-[#FFE28A] shadow-[0_0_8px_rgba(212,175,55,0.4)]"
                      : "bg-[#1B140E] text-[#A89882] border-[#312519] hover:bg-[#2A1F16] hover:text-[#FFF]"
                  }`}
                  title={`Số ${branch.number} - Chi ${branch.name} (${branch.lunarMonth})`}
                >
                  <div className="font-mono text-[11px]">{branch.number}</div>
                  <div className="text-[9px] truncate">{branch.name}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
