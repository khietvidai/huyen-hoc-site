import React, { useState, useMemo } from "react";
import {
  Search,
  BookOpen,
  ArrowUpDown,
  Compass,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Filter,
  Layers,
  Eye,
} from "lucide-react";
import { JIAZI_HEXAGRAM_LINKS } from "../data/jiazi/jiaziHexagramMap";
import { JiaziHexagramLink } from "../data/jiazi/types";
import { HEXAGRAMS } from "../data/hexagrams";
import { CardVisual } from "./CardVisual";

interface JiaziHexagramTableProps {
  onSelectJiazi?: (jiaziId: string) => void;
  onSelectHexagram?: (hexNumber: number) => void;
  cardImages?: Record<number, string>;
}

const LOWER_TRIGRAM_GROUPS = [
  { id: "all", label: "Tất cả 60 Hoa Giáp" },
  { id: "Chấn", label: "Hạ Quái Chấn (Sấm) • #01-#08" },
  { id: "Ly", label: "Hạ Quái Ly (Lửa) • #09-#15" },
  { id: "Đoài", label: "Hạ Quái Đoài (Đầm) • #16-#23" },
  { id: "Càn", label: "Hạ Quái Càn (Trời) • #24-#30" },
  { id: "Tốn", label: "Hạ Quái Tốn (Gió) • #31-#38" },
  { id: "Khảm", label: "Hạ Quái Khảm (Nước) • #39-#45" },
  { id: "Cấn", label: "Hạ Quái Cấn (Núi) • #46-#53" },
  { id: "Khôn", label: "Hạ Quái Khôn (Đất) • #54-#60" },
];

export const JiaziHexagramTable: React.FC<JiaziHexagramTableProps> = ({
  onSelectJiazi,
  onSelectHexagram,
  cardImages = {},
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrigram, setSelectedTrigram] = useState("all");
  const [selectedDetail, setSelectedDetail] = useState<JiaziHexagramLink | null>(
    JIAZI_HEXAGRAM_LINKS[0]
  );

  const filteredLinks = useMemo(() => {
    return JIAZI_HEXAGRAM_LINKS.filter((item) => {
      if (selectedTrigram !== "all" && item.lowerTrigram !== selectedTrigram) {
        return false;
      }
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      return (
        item.jiaziName.toLowerCase().includes(q) ||
        item.hexagramName.toLowerCase().includes(q) ||
        item.hexagramHanzi.includes(q) ||
        item.order.toString() === q ||
        item.hexagramNumber.toString() === q ||
        item.upperTrigram.toLowerCase().includes(q) ||
        item.lowerTrigram.toLowerCase().includes(q) ||
        item.natureMeaning.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, selectedTrigram]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1C1712] via-[#241D16] to-[#1C1712] border border-[#423424] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-6 -right-6 text-9xl font-serif font-bold text-[#D4AF37]/5 select-none pointer-events-none">
          易
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-[#2E2419] border border-[#54402A] text-xs font-bold text-[#E2B755] flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#E2B755]" />
              BẢNG ĐỐI ỨNG CHÍNH THỐNG
            </span>
            <span className="text-xs text-[#A89882]">60 Hoa Giáp ↔ 60 Quẻ Dịch Chu Kỳ Tiêu Trưởng</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#F5EAD4]">
            Liên Kết 60 Hoa Giáp & Quẻ Kinh Dịch
          </h2>
          <p className="mt-2 text-sm text-[#C4B39B] max-w-3xl leading-relaxed">
            Hệ thống đối ứng giữa <strong>Lục Thập Hoa Giáp</strong> và <strong>60 Quẻ Dịch</strong> theo quy luật Tiên Thiên Chu Kỳ Vận Khí. Mỗi Can Chi tương ứng với một quẻ tượng chỉ định trạng thái âm dương tiêu trưởng, phản ánh sự biến dịch tinh vi của càn khôn vũ trụ.
          </p>

          {/* Quick Filters */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C7D6B]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm Can Chi (Giáp Tý, Nhâm Tuất...), quẻ (Phục, Truân, Tỷ...)"
                className="w-full pl-10 pr-4 py-2 text-sm bg-[#120F0C] border border-[#3E3022] rounded-xl text-[#F5EAD4] placeholder-[#766552] focus:outline-none focus:border-[#E2B755] transition-colors"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {LOWER_TRIGRAM_GROUPS.map((group) => {
                const isActive = selectedTrigram === group.id;
                return (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => setSelectedTrigram(group.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer font-medium border ${
                      isActive
                        ? "bg-[#D4AF37] text-[#12100E] border-[#F5EAD4] font-bold shadow-md"
                        : "bg-[#1A1510] text-[#A89882] border-[#362A1D] hover:text-[#F5EAD4] hover:bg-[#251D15]"
                    }`}
                  >
                    {group.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Table (7 cols) + Right Detail Inspector (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Table Area (lg:col-span-7) */}
        <div className="lg:col-span-7 bg-[#17130F] border border-[#382B1D] rounded-3xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-[#2C2115] flex items-center justify-between bg-[#1C1712]">
            <div className="text-xs font-bold text-[#E2B755] flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              <span>DANH SÁCH ĐỐI ỨNG ({filteredLinks.length} / 60)</span>
            </div>
            <span className="text-[11px] text-[#8C7D6B]">
              Nhấp vào dòng để xem tường giải & liên kết
            </span>
          </div>

          <div className="overflow-x-auto max-h-[640px] overflow-y-auto">
            <table className="w-full text-left text-xs text-[#DDD0BE]">
              <thead className="bg-[#14100D] text-[#A89882] uppercase text-[10px] tracking-wider sticky top-0 z-10 border-b border-[#2C2115]">
                <tr>
                  <th className="py-3 px-3 text-center w-10">STT</th>
                  <th className="py-3 px-3">Hoa Giáp</th>
                  <th className="py-3 px-3 text-center">Hình Quẻ</th>
                  <th className="py-3 px-3">Quẻ Kinh Dịch</th>
                  <th className="py-3 px-3 text-center">Vạch Quẻ</th>
                  <th className="py-3 px-3">Thượng / Hạ</th>
                  <th className="py-3 px-3 text-right">Chi Tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#241B12]">
                {filteredLinks.map((item) => {
                  const isSelected = selectedDetail?.order === item.order;
                  const hexImage = cardImages?.[item.hexagramNumber];
                  return (
                    <tr
                      key={item.order}
                      onClick={() => setSelectedDetail(item)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-[#2D2216] text-[#FFF8EB]"
                          : "hover:bg-[#1E1812]"
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center font-mono text-[#8C7D6B]">
                        #{item.order.toString().padStart(2, "0")}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-serif font-bold text-[#F5EAD4]">
                          {item.jiaziName}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="inline-flex items-center justify-center">
                          {hexImage ? (
                            <div className="w-8 h-12 rounded-md overflow-hidden border border-[#6B5438] shadow-sm bg-[#18130E] hover:scale-110 transition-transform">
                              <img
                                src={hexImage}
                                alt={item.hexagramName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-8 h-12 rounded-md border border-[#483724] bg-gradient-to-b from-[#261E15] to-[#14100C] flex flex-col items-center justify-center shadow-inner hover:border-[#D4AF37] transition-colors">
                              <span className="text-sm font-serif text-[#E2B755] leading-none select-none">
                                {item.symbol}
                              </span>
                              <span className="text-[8px] font-mono text-[#8C7D6B] mt-0.5 leading-none">
                                #{item.hexagramNumber}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-serif font-bold text-[#E2B755]">
                            {item.hexagramName}
                          </span>
                          <span className="text-[10px] text-[#A89882] font-serif">
                            ({item.hexagramHanzi})
                          </span>
                        </div>
                        <div className="text-[10px] text-[#786958] font-mono">
                          Quẻ #{item.hexagramNumber}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="text-xl font-serif text-[#E2B755] select-none">
                          {item.symbol}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-[#A89882]">
                        <span className="text-[#DDD0BE]">{item.upperTrigram}</span> /{" "}
                        <span className="text-[#C89B3C] font-semibold">{item.lowerTrigram}</span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <ChevronRight className="w-4 h-4 text-[#8C7D6B] inline-block" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Detail Inspector (lg:col-span-5) */}
        {selectedDetail && (() => {
          const selectedHexagram = HEXAGRAMS.find((h) => h.number === selectedDetail.hexagramNumber);
          const hexImage = cardImages?.[selectedDetail.hexagramNumber];

          return (
            <div className="lg:col-span-5 space-y-4 sticky top-6">
              <div className="bg-[#1C1712] border-2 border-[#54402A] rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 text-8xl font-serif text-[#E2B755]/10 select-none pointer-events-none">
                  {selectedDetail.symbol}
                </div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between gap-2 border-b border-[#2C2115] pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-[#2E2419] border border-[#52402B] text-xs font-mono font-bold text-[#E2B755]">
                        #{selectedDetail.order.toString().padStart(2, "0")} / 60
                      </span>
                      <span className="text-sm font-serif font-bold text-[#F5EAD4]">
                        {selectedDetail.jiaziName}
                      </span>
                    </div>
                    <span className="text-xs text-[#E2B755] font-mono bg-[#291F14] px-2.5 py-0.5 rounded-full border border-[#483724]">
                      Quẻ Dịch #{selectedDetail.hexagramNumber}
                    </span>
                  </div>

                  {/* Hexagram Hero with Card Art */}
                  <div className="bg-[#14100D] border border-[#3A2D1F] p-4 rounded-2xl mb-4 flex flex-col sm:flex-row items-center gap-4">
                    <div className="shrink-0 flex flex-col items-center">
                      {selectedHexagram ? (
                        <CardVisual
                          hexagram={selectedHexagram}
                          imageUrl={hexImage}
                          size="sm"
                          showName={false}
                          enableZoomModal={true}
                        />
                      ) : (
                        <div className="w-20 h-28 rounded-xl bg-[#281F15] border border-[#503E2A] flex items-center justify-center text-4xl text-[#E2B755] shadow-inner">
                          {selectedDetail.symbol}
                        </div>
                      )}
                      <div className="mt-1.5 text-center">
                        {hexImage ? (
                          <span className="text-[10px] text-amber-300 font-mono flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" /> Hình quẻ riêng
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#8C7D6B] font-serif">
                            Tượng vạch quẻ Dịch
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 text-center sm:text-left">
                      <div className="text-[11px] font-mono text-[#D4AF37] font-semibold">
                        QUẺ KINH DỊCH #{selectedDetail.hexagramNumber}
                      </div>
                      <h3 className="text-lg font-serif font-bold text-[#F5EAD4] flex items-center justify-center sm:justify-start gap-2 mt-0.5">
                        <span>{selectedDetail.hexagramName}</span>
                        <span className="text-sm text-[#C89B3C] font-normal font-serif">
                          {selectedDetail.hexagramHanzi}
                        </span>
                      </h3>
                      <div className="text-xs text-[#A89882] mt-1.5 flex items-center justify-center sm:justify-start gap-2">
                        <span>Thượng: <strong className="text-[#DDD0BE]">{selectedDetail.upperTrigram}</strong></span>
                        <span>•</span>
                        <span>Hạ: <strong className="text-[#E2B755]">{selectedDetail.lowerTrigram}</strong></span>
                      </div>
                      <div className="mt-2.5 text-xs text-[#C4B39B] italic bg-[#1A140F] p-2.5 rounded-xl border border-[#2E2217] leading-relaxed">
                        "{selectedDetail.natureMeaning}"
                      </div>
                    </div>
                  </div>

                {/* Nature & Essence */}
                <div className="space-y-3 text-xs">
                  <div className="bg-[#17130E] border border-[#332618] p-3.5 rounded-xl">
                    <div className="font-bold text-[#E2B755] mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>TƯỢNG QUẺ & KHÍ VẬN:</span>
                    </div>
                    <p className="text-[#DDD0BE] leading-relaxed">
                      {selectedDetail.natureMeaning}
                    </p>
                  </div>

                  <div className="bg-[#17130E] border border-[#332618] p-3.5 rounded-xl">
                    <div className="font-bold text-[#C89B3C] mb-1 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5" />
                      <span>LUẬN GIẢI MỐI TƯƠNG LIÊN CAN CHI & QUẺ DỊCH:</span>
                    </div>
                    <p className="text-[#C4B39B] leading-relaxed">
                      {selectedDetail.linkAnalysis}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-5 pt-4 border-t border-[#2C2115] flex items-center gap-2 flex-wrap">
                  {onSelectJiazi && (
                    <button
                      type="button"
                      onClick={() => {
                        const id = selectedDetail.jiaziName
                          .toLowerCase()
                          .normalize("NFD")
                          .replace(/[\u0300-\u036f]/g, "")
                          .replace(/đ/g, "d")
                          .replace(/\s+/g, "_");
                        onSelectJiazi(id);
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-[#291F14] hover:bg-[#382B1D] text-[#FFE394] border border-[#52412B] rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
                    >
                      <Layers className="w-3.5 h-3.5 text-[#E2B755]" />
                      <span>Xem Can Chi {selectedDetail.jiaziName}</span>
                    </button>
                  )}

                  {onSelectHexagram && (
                    <button
                      type="button"
                      onClick={() => onSelectHexagram(selectedDetail.hexagramNumber)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-[#D4AF37] hover:bg-[#F3C966] text-[#12100E] rounded-xl transition-all cursor-pointer shadow-md active:scale-95"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Tra Cứu Quẻ Này</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
      </div>
    </div>
  );
};
