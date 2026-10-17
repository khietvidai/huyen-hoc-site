import React, { useState } from "react";
import { Search, BookOpen, Filter, ArrowRight, Sparkles } from "lucide-react";
import { Hexagram } from "../types";
import { HEXAGRAMS } from "../data/hexagrams";
import { CardVisual } from "./CardVisual";

interface HexagramLibraryProps {
  cardImages?: Record<number, string>;
  onSelectHexagram: (hex: Hexagram) => void;
  onImageUpdated?: (num: number, url: string) => void;
}

export const HexagramLibrary: React.FC<HexagramLibraryProps> = ({
  cardImages = {},
  onSelectHexagram,
  onImageUpdated,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTrigram, setSelectedTrigram] = useState<string>("Tất cả");
  const [cungFilterMode, setCungFilterMode] = useState<"contains" | "palace">("contains");

  const trigramsList = [
    { id: "Tất cả", name: "Tất cả", symbol: "✦" },
    { id: "Càn", name: "Càn", symbol: "☰" },
    { id: "Khôn", name: "Khôn", symbol: "☷" },
    { id: "Khảm", name: "Khảm", symbol: "☵" },
    { id: "Ly", name: "Ly", symbol: "☲" },
    { id: "Chấn", name: "Chấn", symbol: "☳" },
    { id: "Tốn", name: "Tốn", symbol: "☴" },
    { id: "Cấn", name: "Cấn", symbol: "☶" },
    { id: "Đoài", name: "Đoài", symbol: "☱" },
  ];

  // 8 Cung Kinh Phòng chính thống
  const CUNG_PALACE_IDS: Record<string, number[]> = {
    "Càn": [1, 44, 33, 12, 20, 23, 35, 14],
    "Khảm": [29, 60, 3, 63, 49, 55, 36, 7],
    "Cấn": [52, 22, 26, 41, 38, 10, 61, 53],
    "Chấn": [51, 16, 40, 32, 46, 48, 28, 17],
    "Tốn": [57, 9, 37, 42, 25, 21, 27, 18],
    "Ly": [30, 56, 50, 64, 4, 59, 6, 13],
    "Khôn": [2, 24, 19, 11, 34, 43, 5, 8],
    "Đoài": [58, 47, 45, 31, 39, 15, 62, 54],
  };

  const filteredHexagrams = HEXAGRAMS.filter((hex) => {
    const matchesSearch =
      hex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hex.vietnameseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hex.hanzi.includes(searchTerm) ||
      hex.number.toString() === searchTerm.trim() ||
      hex.judgment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hex.upperTrigram.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hex.lowerTrigram.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedTrigram !== "Tất cả") {
      if (cungFilterMode === "palace") {
        const palaceHexes = CUNG_PALACE_IDS[selectedTrigram] || [];
        if (!palaceHexes.includes(hex.number)) return false;
      } else {
        if (hex.upperTrigram !== selectedTrigram && hex.lowerTrigram !== selectedTrigram) {
          return false;
        }
      }
    }

    return true;
  });

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Top filter bar */}
      <div className="bg-[#171512] border border-[#3A3225] rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C7D69]" />
            <input
              type="text"
              placeholder="Tra cứu tên quẻ (Càn, Khôn, Thái...), số quẻ (1..64) hoặc từ khóa ý nghĩa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#12100E] border border-[#382F22] focus:border-[#C89B3C] rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-[#F0E4D0] outline-none"
            />
          </div>

          <div className="text-xs text-[#9E907D] flex items-center gap-1">
            <span>Hiển thị:</span>
            <strong className="text-[#EAD8B1] font-mono">{filteredHexagrams.length}</strong> / 64 Quẻ
          </div>
        </div>

        {/* Trigram / Cung Filter */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#292219]">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-[#8C7D69] flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5 text-[#C9A55A]" /> Cung / Bát quái:
            </span>
            {trigramsList.map((tri) => (
              <button
                key={tri.id}
                onClick={() => setSelectedTrigram(tri.id)}
                className={`px-2.5 py-1 text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                  selectedTrigram === tri.id
                    ? "bg-[#C89B3C] text-[#121110] font-bold shadow-md"
                    : "bg-[#201B15] text-[#9E907D] hover:text-white border border-[#2F271E]"
                }`}
              >
                <span className="font-mono text-xs">{tri.symbol}</span>
                <span>{tri.id === "Tất cả" ? "Tất cả" : `Cung ${tri.name}`}</span>
              </button>
            ))}
          </div>

          {selectedTrigram !== "Tất cả" && (
            <div className="flex items-center gap-1 text-[10px] bg-[#14100C] border border-[#332617] rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setCungFilterMode("contains")}
                className={`px-2 py-0.5 rounded text-[10px] transition-all cursor-pointer ${
                  cungFilterMode === "contains"
                    ? "bg-[#C89B3C] text-[#120F0C] font-bold"
                    : "text-[#9E8E79] hover:text-white"
                }`}
              >
                Chứa quái
              </button>
              <button
                type="button"
                onClick={() => setCungFilterMode("palace")}
                className={`px-2 py-0.5 rounded text-[10px] transition-all cursor-pointer ${
                  cungFilterMode === "palace"
                    ? "bg-[#C89B3C] text-[#120F0C] font-bold"
                    : "text-[#9E8E79] hover:text-white"
                }`}
              >
                8 Cung Kinh Phòng
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Grid of Hexagrams */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredHexagrams.map((hex) => {
          const customImage = cardImages[hex.number];
          return (
            <div
              key={hex.number}
              onClick={() => onSelectHexagram(hex)}
              className="group bg-[#171512] border border-[#332A1F] hover:border-[#C9A55A] rounded-xl p-4 shadow-lg hover:shadow-2xl transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="font-mono text-[#C9A55A] font-bold">
                    #{hex.number.toString().padStart(2, "0")}
                  </span>
                  <span className="text-[11px] text-[#A89882] font-serif">
                    {hex.element}
                  </span>
                </div>

                {/* Card Visual + Name */}
                <div className="flex items-center gap-3.5 mb-3">
                  <div className="flex-shrink-0">
                    <CardVisual
                      hexagram={hex}
                      imageUrl={customImage}
                      size="sm"
                      showUploadTrigger={false}
                      onImageUpdated={onImageUpdated}
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-serif font-bold text-base text-[#F5EAD4] group-hover:text-[#C9A55A] transition-colors truncate">
                      {hex.name}
                    </h4>
                    <p className="text-xs text-[#A89882] font-serif truncate">
                      {hex.hanzi} • {hex.vietnameseName}
                    </p>
                    <div className="text-[11px] text-[#7A6D5B] mt-1">
                      {hex.upperTrigram} / {hex.lowerTrigram} • {hex.element}
                    </div>
                    {customImage && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-amber-300/90 font-mono mt-1">
                        <Sparkles className="w-2.5 h-2.5" /> Ảnh riêng
                      </span>
                    )}
                  </div>
                </div>

                {/* Snippet */}
                <p className="text-xs text-[#8C7D6A] line-clamp-2 italic mb-3">
                  "{hex.judgment}"
                </p>
              </div>

              <div className="pt-2 border-t border-[#241D16] flex items-center justify-between text-[11px] text-[#C9A55A] font-medium group-hover:translate-x-0.5 transition-transform">
                <span>Xem chi tiết quẻ</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
