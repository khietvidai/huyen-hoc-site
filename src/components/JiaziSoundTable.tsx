import React, { useState, useMemo } from "react";
import {
  Volume2,
  VolumeX,
  Play,
  Square,
  Sparkles,
  Flame,
  Droplets,
  Trees,
  Mountain,
  Compass,
  Search,
  ExternalLink,
  Waves,
} from "lucide-react";
import { NAP_AM_SOUND_RECORDS, NapAmSoundRecord } from "../data/jiazi/soundSymbolism";
import { SIXTY_JIAZI } from "../data/jiazi";

interface JiaziSoundTableProps {
  onSelectCanChi: (id: string) => void;
  activeSoundType: string | null;
  onTogglePlay: (soundType: string) => void;
}

export const JiaziSoundTable: React.FC<JiaziSoundTableProps> = ({
  onSelectCanChi,
  activeSoundType,
  onTogglePlay,
}) => {
  const [selectedElement, setSelectedElement] = useState<string>("all");
  const [tableSearch, setTableSearch] = useState<string>("");

  const elementIcons: Record<string, React.ReactNode> = {
    Kim: <Sparkles className="w-4 h-4 text-[#D6B97A]" />,
    Mộc: <Trees className="w-4 h-4 text-emerald-400" />,
    Thủy: <Droplets className="w-4 h-4 text-sky-400" />,
    Hỏa: <Flame className="w-4 h-4 text-rose-400" />,
    Thổ: <Mountain className="w-4 h-4 text-amber-400" />,
  };

  const elementColors: Record<string, { badge: string; border: string; glow: string }> = {
    Kim: {
      badge: "bg-[#2A2016] text-[#D6B97A] border-[#52412E]",
      border: "border-[#4A3B2A] hover:border-[#C9A55A]",
      glow: "shadow-[0_0_20px_rgba(212,175,55,0.15)]",
    },
    Mộc: {
      badge: "bg-[#142319] text-emerald-300 border-[#1E402B]",
      border: "border-[#213F2C] hover:border-emerald-500",
      glow: "shadow-[0_0_20px_rgba(52,211,153,0.15)]",
    },
    Thủy: {
      badge: "bg-[#12222E] text-sky-300 border-[#1C3B52]",
      border: "border-[#1E3E56] hover:border-sky-500",
      glow: "shadow-[0_0_20px_rgba(56,189,248,0.15)]",
    },
    Hỏa: {
      badge: "bg-[#291716] text-rose-300 border-[#4D2322]",
      border: "border-[#462322] hover:border-rose-500",
      glow: "shadow-[0_0_20px_rgba(244,63,94,0.15)]",
    },
    Thổ: {
      badge: "bg-[#271E14] text-amber-300 border-[#4D3A24]",
      border: "border-[#473420] hover:border-amber-500",
      glow: "shadow-[0_0_20px_rgba(245,158,11,0.15)]",
    },
  };

  const filteredRecords = useMemo(() => {
    return NAP_AM_SOUND_RECORDS.filter((rec) => {
      if (selectedElement !== "all" && rec.element !== selectedElement) {
        return false;
      }
      if (!tableSearch.trim()) return true;
      const q = tableSearch.toLowerCase().trim();
      const matchNapAm = rec.napAm.toLowerCase().includes(q);
      const matchCanChi = rec.canChiList.some((c) => c.toLowerCase().includes(q));
      const matchState = rec.qiState.toLowerCase().includes(q);
      const matchSound = rec.soundName.toLowerCase().includes(q);
      return matchNapAm || matchCanChi || matchState || matchSound;
    });
  }, [selectedElement, tableSearch]);

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Intro Header */}
      <div className="bg-[#181410] border border-[#3E3022] rounded-3xl p-6 sm:p-7 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#271E15] border border-[#52412E] text-xs font-semibold text-[#D6B97A] mb-2">
              <Waves className="w-3.5 h-3.5 text-[#D6B97A]" />
              <span>30 CẶP TƯỢNG ÂM THANH HOA GIÁP</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#F5EAD4]">
              Bảng Tra Tượng Khí & Âm Thanh Tượng Trưng
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#A89882] max-w-2xl leading-relaxed">
              Mỗi Nạp Âm đại diện cho một trạng thái khí tượng đặc thù trong vũ trụ và phát ra âm thanh biểu
              trưng tinh tế. Bấm nút loa để thưởng thức âm tượng tổng hợp sống động.
            </p>
          </div>

          {/* Quick Filter by Element */}
          <div className="flex flex-wrap items-center gap-1.5 self-stretch sm:self-auto">
            {["all", "Kim", "Mộc", "Thủy", "Hỏa", "Thổ"].map((elm) => (
              <button
                key={elm}
                type="button"
                onClick={() => setSelectedElement(elm)}
                className={`px-3 py-1.5 text-xs rounded-xl font-medium transition-all cursor-pointer flex items-center gap-1 ${
                  selectedElement === elm
                    ? "bg-[#C9A55A] text-[#12100E] font-bold shadow-md"
                    : "bg-[#13100D] border border-[#302418] text-[#A89882] hover:text-white"
                }`}
              >
                {elm !== "all" && elementIcons[elm]}
                <span>{elm === "all" ? "Tất cả (30)" : elm}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Local Search input within sound table */}
        <div className="mt-4 pt-4 border-t border-[#292016] relative max-w-md">
          <Search className="w-4 h-4 text-[#8C7D6B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={tableSearch}
            onChange={(e) => setTableSearch(e.target.value)}
            placeholder="Tìm theo âm thanh (tiếng búa, suối ngầm, sấm sét...), trạng thái..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-[#110E0B] border border-[#382B1E] focus:border-[#C9A55A] rounded-xl text-[#F3E7D0] outline-none placeholder-[#6B5C4B]"
          />
        </div>
      </div>

      {/* Grid of 30 Sound Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRecords.map((rec) => {
          const isPlaying = activeSoundType === rec.soundType;
          const styling = elementColors[rec.element] || elementColors.Kim;

          return (
            <div
              key={rec.napAm}
              className={`relative bg-[#17130F] border rounded-2xl p-5 transition-all duration-200 ${styling.border} ${
                isPlaying ? `${styling.glow} ring-2 ring-[#C9A55A]/50` : ""
              }`}
            >
              {/* Header row: Nap Am + Element + Play button */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#281F15]">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl border ${styling.badge}`}>
                    {elementIcons[rec.element]}
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#F5EAD4] flex items-center gap-2">
                      {rec.napAm}
                      <span className="text-[10px] px-2 py-0.5 rounded-full border border-[#483724] bg-[#221B13] text-[#A89882] font-mono font-normal">
                        Hành {rec.element}
                      </span>
                    </h3>
                    <div className="text-xs text-[#8C7D6B] mt-0.5 flex items-center gap-2">
                      <span>Hoa Giáp:</span>
                      <div className="flex items-center gap-1.5">
                        {rec.canChiList.map((name, i) => {
                          const id = rec.canChiIds[i];
                          return (
                            <button
                              key={id}
                              type="button"
                              onClick={() => onSelectCanChi(id)}
                              className="text-xs font-serif font-bold text-[#C9A55A] hover:underline flex items-center gap-0.5 cursor-pointer bg-[#221B13] px-2 py-0.5 rounded border border-[#3E3020]"
                              title={`Xem chi tiết diễn giải cho ${name}`}
                            >
                              <span>{name}</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interactive Sound Trigger Button */}
                <button
                  type="button"
                  onClick={() => onTogglePlay(rec.soundType)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 shrink-0 ${
                    isPlaying
                      ? "bg-rose-600 text-white shadow-[0_0_12px_rgba(225,29,72,0.6)] animate-pulse"
                      : "bg-[#291F15] hover:bg-[#3B2C1E] text-[#D6B97A] border border-[#52402B]"
                  }`}
                  title={isPlaying ? "Dừng âm tượng" : "Nghe mô phỏng âm thanh tượng trưng"}
                >
                  {isPlaying ? (
                    <>
                      <Square className="w-3 h-3 fill-current" />
                      <span>Dừng</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 fill-current" />
                      <span>Nghe Âm</span>
                    </>
                  )}
                </button>
              </div>

              {/* Sound Wave Animation if active */}
              {isPlaying && (
                <div className="my-2.5 py-1.5 px-3 rounded-xl bg-[#231A12] border border-[#C9A55A]/40 flex items-center justify-between text-xs text-[#D6B97A]">
                  <span className="flex items-center gap-1.5">
                    <Waves className="w-3.5 h-3.5 animate-bounce" />
                    <span className="font-semibold">Đang cộng hưởng âm tượng vũ trụ...</span>
                  </span>
                  <div className="flex items-center gap-0.5">
                    <span className="w-1 h-3 bg-[#D6B97A] rounded-full animate-pulse" />
                    <span className="w-1 h-4 bg-[#D6B97A] rounded-full animate-pulse delay-75" />
                    <span className="w-1 h-2.5 bg-[#D6B97A] rounded-full animate-pulse delay-150" />
                    <span className="w-1 h-3.5 bg-[#D6B97A] rounded-full animate-pulse delay-200" />
                  </div>
                </div>
              )}

              {/* Body: Tượng Khí & Âm Thanh Tượng Trưng */}
              <div className="mt-3 space-y-2 text-xs">
                <div className="bg-[#120F0C] border border-[#271E15] p-2.5 rounded-xl">
                  <span className="text-[#8C7D6B] font-bold block mb-0.5 uppercase text-[10px]">
                    Tượng Khí & Trạng Thái:
                  </span>
                  <p className="text-[#D6C5AD] font-serif leading-relaxed">
                    {rec.qiState}
                  </p>
                </div>

                <div className="bg-[#1C1610] border border-[#3E3020] p-2.5 rounded-xl">
                  <span className="text-[#D6B97A] font-bold flex items-center gap-1 mb-0.5 uppercase text-[10px]">
                    <Volume2 className="w-3 h-3 text-[#D6B97A]" />
                    Âm Thanh Tượng Trưng:
                  </span>
                  <p className="text-[#F5EAD4] font-medium leading-relaxed">
                    {rec.soundName}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
