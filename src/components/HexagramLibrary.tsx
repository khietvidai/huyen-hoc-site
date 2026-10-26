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
      {/* Top filter bar (Sớ Điệp Giấy Tuyên Thành Hoàng Gia) */}
      <div
        className="rounded-3xl p-5 sm:p-6 relative overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #FDFBF7 0%, #F5EFE2 100%)",
          border: "1px solid rgba(196, 150, 62, 0.52)",
          boxShadow:
            "0 14px 36px -8px rgba(92, 74, 44, 0.12), 0 2px 6px rgba(92, 74, 44, 0.05), inset 0 0 0 3px #FDFBF7, inset 0 0 0 4px rgba(196, 150, 62, 0.22)",
        }}
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C6D3B]" />
            <input
              type="text"
              placeholder="Tra cứu tên quẻ (Càn, Khôn, Thái...), số quẻ (1..64) hoặc từ khóa ý nghĩa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#F4EEE2] border border-[#C4963E]/50 focus:bg-[#FFFDF9] focus:border-[#C4963E] rounded-xl pl-9 pr-4 py-2.5 text-xs sm:text-sm text-[#1C1610] placeholder-[#7D6B55] shadow-inner outline-none transition"
            />
          </div>

          <div className="text-xs text-[#6B5B47] flex items-center gap-1">
            <span>Hiển thị:</span>
            <strong className="text-[#7A5416] font-mono font-bold">{filteredHexagrams.length}</strong> / 64 Quẻ
          </div>
        </div>

        {/* Trigram / Cung Filter */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#C4963E]/25">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-[#6B5B47] font-semibold flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5 text-[#9E7326]" /> Cung / Bát quái:
            </span>
            {trigramsList.map((tri) => (
              <button
                key={tri.id}
                onClick={() => setSelectedTrigram(tri.id)}
                className={`px-3 py-1 text-xs rounded-full transition-all cursor-pointer flex items-center gap-1 ${
                  selectedTrigram === tri.id
                    ? "bg-[#1C1610] text-[#F5E6C4] border border-[#D4AF37] font-bold shadow-md"
                    : "bg-[#FDFBF7] text-[#4A3B28] hover:text-[#1C1610] hover:border-[#C4963E] border border-[#C4963E]/40 shadow-2xs"
                }`}
              >
                <span className="font-mono text-xs">{tri.symbol}</span>
                <span>{tri.id === "Tất cả" ? "Tất cả" : `Cung ${tri.name}`}</span>
              </button>
            ))}
          </div>

          {selectedTrigram !== "Tất cả" && (
            <div className="flex items-center gap-1 text-[10px] bg-[#F4EEE2] border border-[#C4963E]/40 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setCungFilterMode("contains")}
                className={`px-2 py-0.5 rounded text-[10px] transition-all cursor-pointer ${
                  cungFilterMode === "contains"
                    ? "bg-[#1C1610] text-[#F5E6C4] font-bold"
                    : "text-[#6B5B47] hover:text-[#1C1610]"
                }`}
              >
                Chứa quái
              </button>
              <button
                type="button"
                onClick={() => setCungFilterMode("palace")}
                className={`px-2 py-0.5 rounded text-[10px] transition-all cursor-pointer ${
                  cungFilterMode === "palace"
                    ? "bg-[#1C1610] text-[#F5E6C4] font-bold"
                    : "text-[#6B5B47] hover:text-[#1C1610]"
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
              className="group rounded-2xl p-4 transition-all cursor-pointer flex flex-col justify-between hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(180deg, #FDFBF7 0%, #F5EFE2 100%)",
                border: "1px solid rgba(196, 150, 62, 0.44)",
                boxShadow: "0 8px 24px -8px rgba(92, 74, 44, 0.12), inset 0 0 0 2px #FDFBF7",
              }}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="font-mono text-[#8A611C] font-bold">
                    #{hex.number.toString().padStart(2, "0")}
                  </span>
                  <span className="text-[11px] text-[#6B5B47] font-serif">
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
                    <h4 className="font-serif font-bold text-base text-[#1C1610] group-hover:text-[#8A611C] transition-colors truncate">
                      {hex.name}
                    </h4>
                    <p className="text-xs text-[#514536] font-serif truncate">
                      {hex.hanzi} • {hex.vietnameseName}
                    </p>
                    <div className="text-[11px] text-[#7D6B55] mt-1">
                      {hex.upperTrigram} / {hex.lowerTrigram} • {hex.element}
                    </div>
                    {customImage && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-amber-800 font-mono mt-1">
                        <Sparkles className="w-2.5 h-2.5" /> Ảnh riêng
                      </span>
                    )}
                  </div>
                </div>

                {/* Snippet */}
                <p className="text-xs text-[#514536] line-clamp-2 italic mb-3">
                  "{hex.judgment}"
                </p>
              </div>

              <div className="pt-2 border-t border-[#C4963E]/25 flex items-center justify-between text-[11px] text-[#8A611C] font-semibold group-hover:translate-x-0.5 transition-transform">
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
