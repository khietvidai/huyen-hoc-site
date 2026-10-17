import React, { useState } from "react";
import { Clock, Hash, Sparkles, ArrowRight } from "lucide-react";
import { Hexagram } from "../types";
import { findHexagramByTrigrams, getTransformedHexagram } from "../data/hexagrams";

interface NumberDivinationProps {
  onComplete: (primary: Hexagram, changingLines: number[], transformed?: Hexagram, summary?: string) => void;
}

// Bát Quái map by remainder (1 to 8)
const TRIGRAM_BY_NUMBER: Record<number, string> = {
  1: "Càn",
  2: "Đoài",
  3: "Ly",
  4: "Chấn",
  5: "Tốn",
  6: "Khảm",
  7: "Cấn",
  8: "Khôn",
};

export const NumberDivination: React.FC<NumberDivinationProps> = ({ onComplete }) => {
  const [num1, setNum1] = useState<string>("");
  const [num2, setNum2] = useState<string>("");
  const [num3, setNum3] = useState<string>("");

  // Calculate using Mai Hoa formula
  const handleCalculate = (n1: number, n2: number, n3: number, customNote?: string) => {
    // Upper trigram = n1 % 8 (remainder 0 => 8)
    const upperRem = n1 % 8 === 0 ? 8 : n1 % 8;
    // Lower trigram = n2 % 8 (remainder 0 => 8)
    const lowerRem = n2 % 8 === 0 ? 8 : n2 % 8;
    // Changing line = (n1 + n2 + n3) % 6 (remainder 0 => 6)
    const lineRem = (n1 + n2 + n3) % 6 === 0 ? 6 : (n1 + n2 + n3) % 6;

    const upperTrigram = TRIGRAM_BY_NUMBER[upperRem] || "Càn";
    const lowerTrigram = TRIGRAM_BY_NUMBER[lowerRem] || "Khôn";

    const primary = findHexagramByTrigrams(upperTrigram, lowerTrigram);
    const changingLines = [lineRem];
    const transformed = getTransformedHexagram(primary, changingLines);

    onComplete(
      primary,
      changingLines,
      transformed,
      customNote || `Mai Hoa Dịch Số: Số (${n1}, ${n2}, ${n3}) -> Hào động ${lineRem}`
    );
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v1 = parseInt(num1) || Math.floor(Math.random() * 900) + 100;
    const v2 = parseInt(num2) || Math.floor(Math.random() * 900) + 100;
    const v3 = parseInt(num3) || Math.floor(Math.random() * 900) + 100;
    handleCalculate(v1, v2, v3, `Mai Hoa Số Tùy Tâm: [${v1}, ${v2}, ${v3}]`);
  };

  // Divination by Current Astronomical / Clock Time
  const handleDivinationByCurrentTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const hour = now.getHours();
    const minute = now.getMinutes();

    // Ancient lunar time hour index: Tý = 1, Sửu = 2, Dần = 3...
    const chiHour = Math.floor(((hour + 1) % 24) / 2) + 1;

    // Upper trigram sum = (Năm + Tháng + Ngày)
    const upperSum = year + month + day;
    // Lower trigram sum = (Năm + Tháng + Ngày + Giờ)
    const lowerSum = upperSum + chiHour + minute;

    handleCalculate(
      upperSum,
      lowerSum,
      minute + chiHour,
      `Khởi quẻ theo Thời Khắc: ${day}/${month}/${year} ${hour}h${minute}p`
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-[#171513] border border-[#3A332A] rounded-2xl p-6 shadow-2xl">
      <div className="border-b border-[#2C261F] pb-4 mb-6">
        <h3 className="text-xl font-serif font-bold text-[#EAD8B1] flex items-center gap-2">
          <Hash className="w-5 h-5 text-[#C9A55A]" />
          Mai Hoa Dịch Số (Khởi Quẻ Theo Số & Thời Khắc)
        </h3>
        <p className="text-xs text-[#9E907D] mt-1">
          Thiệu Khang Tiết Tiên Sinh truyền dạy: "Tâm động sinh quái, vạn vật giai hữu số".
        </p>
      </div>

      {/* Option 1: Current Clock Time */}
      <div className="bg-gradient-to-r from-[#221C15] to-[#181512] border border-[#3E3426] rounded-xl p-5 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-sm font-bold text-[#F0E2C8] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#C9A55A]" />
              Khởi Quẻ Theo Niên Nguyệt Nhật Thời Hiện Tại
            </h4>
            <p className="text-xs text-[#9C8F7C] mt-1.5 leading-relaxed">
              Lấy chính xác tọa độ thời gian thiên cơ ngay tại khoảnh khắc tâm bạn khởi niệm để xác định Thượng Quái, Hạ Quái và Hào Động.
            </p>
          </div>
          <button
            onClick={handleDivinationByCurrentTime}
            className="flex-shrink-0 px-4 py-2 bg-gradient-to-r from-[#C89B3C] to-[#E2C37A] hover:brightness-110 text-[#14120F] font-bold text-xs rounded-xl shadow cursor-pointer transition-all"
          >
            Lấy Giờ Hiện Tại
          </button>
        </div>
      </div>

      {/* Option 2: Custom Numbers Form */}
      <form onSubmit={handleManualSubmit} className="bg-[#1C1814] border border-[#2F281F] rounded-xl p-5">
        <h4 className="text-sm font-bold text-[#EAD8B1] mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#C89B3C]" />
          Nhập Ba Dãy Số Tâm Tình (Hoặc Chọn Ngẫu Nhiên)
        </h4>
        <p className="text-xs text-[#8A7D6B] mb-4">
          Nghĩ về câu hỏi trong lòng và điền 3 con số bạn bất chợt thấy hoặc thích (1 đến 999):
        </p>

        <div className="grid grid-cols-3 gap-3 mb-5">
          <div>
            <label className="block text-[11px] font-medium text-[#B8AA94] mb-1.5">
              Số Thượng Quái:
            </label>
            <input
              type="number"
              placeholder="VD: 368"
              value={num1}
              onChange={(e) => setNum1(e.target.value)}
              className="w-full bg-[#12100E] border border-[#3F362A] focus:border-[#C89B3C] rounded-lg px-3 py-2 text-sm text-[#F0E4CE] outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-[#B8AA94] mb-1.5">
              Số Hạ Quái:
            </label>
            <input
              type="number"
              placeholder="VD: 589"
              value={num2}
              onChange={(e) => setNum2(e.target.value)}
              className="w-full bg-[#12100E] border border-[#3F362A] focus:border-[#C89B3C] rounded-lg px-3 py-2 text-sm text-[#F0E4CE] outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-[#B8AA94] mb-1.5">
              Số Hào Động:
            </label>
            <input
              type="number"
              placeholder="VD: 792"
              value={num3}
              onChange={(e) => setNum3(e.target.value)}
              className="w-full bg-[#12100E] border border-[#3F362A] focus:border-[#C89B3C] rounded-lg px-3 py-2 text-sm text-[#F0E4CE] outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-[#9E782F] via-[#C89B3C] to-[#9E782F] hover:brightness-110 active:scale-98 text-[#14120F] font-bold rounded-xl shadow-[0_4px_16px_rgba(200,155,60,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          Tính Quẻ Mai Hoa
        </button>
      </form>
    </div>
  );
};
