import React from "react";
import { motion } from "motion/react";
import {
  Sparkles,
  Flame,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { BianDetail } from "./YarrowDivination";
import {
  RealisticAltarMat,
} from "./RealisticYarrowHands";

interface YarrowRitualVisualizerProps {
  elapsedSec: number;
  isWorking: boolean;
  stageId: "taiji" | "split" | "trinity" | "count_four" | "remainder";
  stageTitle: string;
  stageHanTu: string;
  stageDesc: string;
  currentBianStep: 1 | 2 | 3;
  currentLineIndex: number;
  currentStalksInHand: number;
  latestBian?: BianDetail;
  isLargeModal?: boolean;
}

export const YarrowRitualVisualizer: React.FC<YarrowRitualVisualizerProps> = ({
  elapsedSec,
  isWorking,
  stageId,
  stageTitle,
  stageHanTu,
  stageDesc,
  currentBianStep,
  currentLineIndex,
  currentStalksInHand,
  latestBian,
}) => {
  // Stalk counts on Altar
  const leftCount = latestBian
    ? latestBian.leftStalks
    : Math.max(16, Math.round(currentStalksInHand * 0.49));
  const rightCount = latestBian
    ? latestBian.rightStalks
    : Math.max(16, currentStalksInHand - leftCount);

  // 4 Seasons cycle (Xuân, Hạ, Thu, Đông)
  const countCycle = Math.floor(elapsedSec * 1.5) % 4;
  const isCountingLeft = elapsedSec < 45.0;

  // Ritual Stage descriptions without any hand drawings
  const getRitualAltarNarrative = () => {
    if (!isWorking) {
      if (latestBian) {
        return {
          stepNum: `Biến ${latestBian.bianIndex}/3 Hoàn Tất`,
          title: "Đã Gom Cọng Nhuận Xong",
          description: `Bó Trái (${latestBian.leftStalks} cọng) đếm 4 dư ${latestBian.leftRemainder}. Bó Phải (${latestBian.rightStalks} cọng) đếm 4 dư ${latestBian.rightRemainder}. Gom đủ ${latestBian.totalRemoved} cọng vào khay Nhuận, còn lại ${latestBian.remainingStalks} cọng cỏ thi.`,
          leftDetail: `Bó Trái (Thiên): ${latestBian.leftStalks} cọng • Dư ${latestBian.leftRemainder}`,
          rightDetail: `Bó Phải (Địa): ${latestBian.rightStalks} cọng • Dư ${latestBian.rightRemainder}`,
          accent: "text-emerald-400",
        };
      }
      return {
        stepNum: "Khởi Tâm",
        title: "Tĩnh Tâm Nâng 50 Cọng Cỏ Thi",
        description: "Đại Diễn 50 cọng cỏ thi thanh tịnh đặt trên đài tế. Cất 1 cọng Thái Cực bất biến, dùng 49 cọng khởi phát vận hành tạo tác hào quẻ.",
        leftDetail: "Bó Trái tượng Trời (Thiên Đạo)",
        rightDetail: "Bó Phải tượng Đất (Địa Đạo)",
        accent: "text-amber-400",
      };
    }

    switch (stageId) {
      case "taiji":
        return {
          stepNum: "1",
          title: "Thái Cực Bất Biến (Cất Riêng 1 Cọng)",
          description: "Từ 50 cọng Đại Diễn, cất riêng 1 cọng lên giá Thái Cực làm cội nguồn vạn vật bất sinh bất diệt. Cầm 49 cọng thao diễn.",
          leftDetail: "Cất 1 cọng Thái Cực lên đài cao",
          rightDetail: "Còn lại 49 cọng chuẩn bị phân chia",
          accent: "text-[#E6D3A3]",
        };
      case "split":
        return {
          stepNum: "2",
          title: "Phân Lưỡng Nghi (Trời & Đất Giao Cảm)",
          description: `Phân chia bó cỏ thi thành hai phần: Bó Trái (${leftCount} cọng) tượng Trời, Bó Phải (${rightCount} cọng) tượng Đất.`,
          leftDetail: `Bó Trái tượng Trời (Thiên): ${leftCount} cọng`,
          rightDetail: `Bó Phải tượng Đất (Địa): ${rightCount} cọng`,
          accent: "text-sky-300",
        };
      case "trinity":
        return {
          stepNum: "3",
          title: "Quải Nhất Dĩ Tượng Tam Tài (Treo 1 Cọng)",
          description: "Rút 1 cọng từ Bó Phải kẹp riêng tượng cho Con Người (Nhân), hòa cùng Trời và Đất thành Tam Tài định vị trong cõi càn khôn.",
          leftDetail: `Bó Trái (Thiên): ${leftCount} cọng nguyên vẹn`,
          rightDetail: `Bó Phải (Địa): Rút 1 cọng Nhân ➔ Còn ${Math.max(0, rightCount - 1)} cọng`,
          accent: "text-amber-300",
        };
      case "count_four":
        return {
          stepNum: "4",
          title: `Đới Chi Dĩ Tứ (Rút Từng 4 Cây Cỏ Tượng Bốn Mùa: ${["Xuân", "Hạ", "Thu", "Đông"][countCycle]})`,
          description: isCountingLeft
            ? `Đang đếm từng 4 cọng ở Bó Trái (Thiên) theo chu kỳ bốn mùa Xuân - Hạ - Thu - Đông, tìm số cọng dư thừa...`
            : `Đang đếm từng 4 cọng ở Bó Phải (Địa) theo chu kỳ bốn mùa Xuân - Hạ - Thu - Đông, tìm số cọng dư thừa...`,
          leftDetail: `Bó Trái: Rút từng nhóm 4 cọng xếp vào khay Tứ Thời`,
          rightDetail: `Bó Phải: Rút từng nhóm 4 cọng xếp vào khay Tứ Thời`,
          accent: "text-[#E0C070]",
        };
      case "remainder":
        return {
          stepNum: "5",
          title: "Quy Kỳ Dĩ Nhuận & Xác Định Hào Quẻ",
          description: "Gom cọng Nhân kẹp riêng cùng toàn bộ cọng dư từ Bó Trái và Bó Phải vào khay Nhuận. Số cọng còn lại chuyển sang biến kế tiếp.",
          leftDetail: "Gom số dư Bó Trái vào khay Nhuận",
          rightDetail: "Gom số dư Bó Phải vào khay Nhuận",
          accent: "text-emerald-400",
        };
    }
  };

  const narrative = getRitualAltarNarrative();

  return (
    <div className="w-full bg-[#15100B] border border-[#4A3722] rounded-2xl p-3 sm:p-5 shadow-2xl relative overflow-hidden">
      {/* Background Zen Mat with Traditional Clouds and Golden Bagua */}
      <div className="absolute inset-0 opacity-15 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#C9A55A_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-[#C9A55A] border-dashed animate-[spin_120s_linear_infinite]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-[#A67C2E]/40" />
      </div>

      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-[#342416] relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#25170D] border border-[#5A381A] flex items-center justify-center text-[#C9A55A] shadow">
            <span className="text-base">🌾</span>
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9A55A] block leading-none">
              NGHI THỨC ĐẠI DIỄN • BÀN TẾ CỎ THI
            </span>
            <span className="text-xs sm:text-sm font-serif font-bold text-[#F5EAD4]">
              Toàn Cảnh Đàn Chiêm Bặc • Thiên Đạo & Địa Đạo
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-[#E0C070] bg-[#1E140C] px-2.5 py-1 rounded-lg border border-[#48301B]">
            Hào {currentLineIndex} • Biến {currentBianStep}/3
          </span>
        </div>
      </div>

      {/* Main Altar Area */}
      <div className="relative z-10 mt-3 bg-gradient-to-b from-[#18110B] via-[#140D07] to-[#0D0905] border border-[#442F1B] rounded-2xl p-3 sm:p-5 shadow-inner min-h-[300px] flex flex-col justify-between overflow-hidden">
        {/* Top Altar Stands (Lư Trầm, Thái Cực, Khay Nhuận) */}
        <div className="flex items-center justify-between gap-2 border-b border-[#2C1D10] pb-2.5 mb-2">
          {/* Lư Trầm */}
          <div className="flex items-center gap-2 bg-[#1F140B] px-2.5 py-1 rounded-lg border border-[#3C2513]">
            <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <div className="text-[10px] font-serif">
              <span className="text-[#8C7A65] block leading-none">Trầm Hương</span>
              <span className="text-[#E0C070] font-bold">Thanh Tịnh Khí</span>
            </div>
          </div>

          {/* Giá Thái Cực */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border bg-[#1B1108] border-[#382312] text-[#B0987A]">
            <div className="relative w-2 h-7 bg-gradient-to-b from-[#FFF2B2] via-[#C9A55A] to-[#8C6218] rounded-full shadow-[0_0_8px_rgba(212,175,55,0.7)] flex flex-col justify-between py-1 items-center">
              <div className="w-2.5 h-[1.5px] bg-[#61440E] rounded-full" />
              <div className="w-2.5 h-[1.5px] bg-[#61440E] rounded-full" />
            </div>
            <div>
              <span className="text-[9px] font-mono uppercase text-[#A89882] block leading-none">Thái Cực Đài</span>
              <span className="text-xs font-serif font-bold text-[#FFE699]">1 Cọng Bất Biến</span>
            </div>
          </div>

          {/* Khay Nhuận */}
          <div className="flex items-center gap-2 bg-[#1C120B] px-2.5 py-1 rounded-lg border border-[#382212] text-[#A89882]">
            <div className="w-5 h-5 rounded-full bg-[#3B110B] border border-rose-700/60 flex items-center justify-center text-[10px] text-rose-300 shadow">
              閏
            </div>
            <div className="text-right">
              <span className="text-[9px] font-mono uppercase text-[#8C7A65] block leading-none">Khay Nhuận</span>
              <span className="text-xs font-serif font-bold text-[#F0C078]">
                {latestBian ? `${latestBian.totalRemoved} cọng` : "Tích cọng lẻ"}
              </span>
            </div>
          </div>
        </div>

        {/* Central Woven Altar Mat (NO HANDS) */}
        <div className="my-2">
          <RealisticAltarMat
            leftCount={leftCount}
            rightCount={rightCount}
            isCountingLeft={isCountingLeft}
            activeCycle={countCycle}
          />
        </div>

        {/* Bottom Real-Time Narrative Banner */}
        <div className="mt-2 bg-gradient-to-r from-[#2A1A0F] via-[#352113] to-[#22150C] border border-[#5E3F21] rounded-xl p-3 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#442B17] pb-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C9A55A] animate-ping" />
              <span className="text-[11px] font-mono uppercase text-[#C9A55A] font-bold">
                BƯỚC {narrative.stepNum}:
              </span>
              <h4 className="font-serif font-bold text-xs sm:text-sm text-[#FFEAB3]">
                {narrative.title}
              </h4>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-mono text-[#A89882]">
              <span>Hào {currentLineIndex}</span>
              <span>•</span>
              <span className="text-[#E0C070] font-bold">Biến {currentBianStep}/3</span>
              {isWorking && (
                <>
                  <span>•</span>
                  <span className="text-amber-300 font-bold">⏳ {elapsedSec.toFixed(1)}s</span>
                </>
              )}
            </div>
          </div>

          <p className="text-xs sm:text-[13px] text-[#F5E6CF] font-serif leading-relaxed italic mb-2">
            👉 “{narrative.description}”
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-serif mt-2">
            {/* Cột Bên Trái: Bó Thiên */}
            <div className="bg-gradient-to-br from-[#1E130B] via-[#170E08] to-[#120B06] p-3 rounded-xl border border-[#523820] shadow-md flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#631811] to-[#45100B] text-[#E6D3A3] border border-[#C9A55A]/60 text-xs font-bold font-serif shadow-sm flex items-center gap-1.5">
                  <span className="text-[11px]">☯</span>
                  <span>Bó Trái (Thiên • Trời)</span>
                </div>
              </div>
              <span className="text-[11px] font-mono text-[#E6D3A3] font-bold">
                {leftCount} cọng
              </span>
            </div>

            {/* Cột Bên Phải: Bó Địa */}
            <div className="bg-gradient-to-br from-[#1E130B] via-[#170E08] to-[#120B06] p-3 rounded-xl border border-[#523820] shadow-md flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#1E3816] to-[#13260E] text-[#B7F4D8] border border-emerald-500/50 text-xs font-bold font-serif shadow-sm flex items-center gap-1.5">
                  <span className="text-[11px]">🌾</span>
                  <span>Bó Phải (Địa • Đất)</span>
                </div>
              </div>
              <span className="text-[11px] font-mono text-emerald-300 font-bold">
                {rightCount} cọng
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
