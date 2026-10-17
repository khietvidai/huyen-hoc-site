import React, { useState } from "react";
import {
  Search,
  Trash2,
  Star,
  Download,
  Upload,
  Calendar,
  Eye,
  Edit3,
  BookmarkCheck,
  AlertTriangle,
  Table,
  FileText,
  Mail,
} from "lucide-react";
import { DivinationRecord } from "../types";
import {
  SEVEN_STARS_POSITIONS,
  TEN_STARS_POSITIONS,
  TEN_STARS_EXPANDED_POSITIONS,
  NINE_PALACES_POSITIONS,
} from "../data/spreads";
import { HexagramVisual } from "./HexagramVisual";
import { CardVisual } from "./CardVisual";

interface HistoryViewProps {
  records: DivinationRecord[];
  cardImages?: Record<number, string>;
  onSelectRecord: (record: DivinationRecord) => void;
  onDeleteRecord: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onClearAll: () => void;
  onImportRecords: (records: DivinationRecord[]) => void;
  onOpenWorkspace?: (record?: DivinationRecord, tab?: "docs" | "sheets" | "gmail" | "picker") => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  records,
  cardImages = {},
  onSelectRecord,
  onDeleteRecord,
  onToggleFavorite,
  onUpdateNotes,
  onClearAll,
  onImportRecords,
  onOpenWorkspace,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Tất cả");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState<string>("");
  const [isConfirmClearAll, setIsConfirmClearAll] = useState(false);

  // Categories list
  const categories = [
    "Tất cả",
    "Yêu thích",
    "Tổng quát",
    "Sự nghiệp & Công danh",
    "Tài chính & Đầu tư",
    "Tình cảm & Hôn nhân",
    "Sức khỏe & Bình an",
    "Khởi sự & Ra quyết định",
  ];

  // Filter records
  const filteredRecords = records.filter((rec) => {
    const matchesSearch =
      rec.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.primaryHexagram.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.primaryHexagram.vietnameseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rec.notes && rec.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedCategory === "Tất cả") return true;
    if (selectedCategory === "Yêu thích") return !!rec.isFavorite;
    return rec.category === selectedCategory;
  });

  // Export JSON backup
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(records, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `lich_su_kinh_dich_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON backup
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportRecords(parsed);
        }
      } catch (err) {
        alert("Tệp JSON không hợp lệ.");
      }
    };
    reader.readAsText(file);
  };

  const handleStartEditNote = (rec: DivinationRecord) => {
    setEditingId(rec.id);
    setNoteDraft(rec.notes || "");
  };

  const handleSaveNote = (id: string) => {
    onUpdateNotes(id, noteDraft);
    setEditingId(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Search & Top Action Bar */}
      <div className="bg-[#171512] border border-[#3A3225] rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C7D69]" />
            <input
              type="text"
              placeholder="Tìm kiếm theo câu hỏi, tên quẻ hoặc ghi chú..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#12100E] border border-[#382F22] focus:border-[#C89B3C] rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-[#F0E4D0] outline-none"
            />
          </div>

          {/* Backup / Export controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {onOpenWorkspace && (
              <button
                onClick={() => onOpenWorkspace(undefined, "sheets")}
                className="flex items-center gap-1.5 px-3 py-2 text-xs text-[#A7F3D0] hover:text-[#FFF] bg-[#142318] hover:bg-[#1A3121] border border-[#255231] rounded-xl transition-colors cursor-pointer shadow"
                title="Đồng bộ nhật ký bốc quẻ sang Google Sheets"
              >
                <Table className="w-3.5 h-3.5 text-[#34A853]" />
                Google Sheets
              </button>
            )}
            <label className="flex items-center gap-1.5 px-3 py-2 text-xs text-[#C8B89E] hover:text-[#FFF] bg-[#221D16] hover:bg-[#2E261D] border border-[#3B3224] rounded-xl cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              Nhập JSON
              <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
            </label>
            <button
              onClick={handleExportJSON}
              disabled={records.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 text-xs text-[#C8B89E] hover:text-[#FFF] bg-[#221D16] hover:bg-[#2E261D] border border-[#3B3224] rounded-xl transition-colors cursor-pointer disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" />
              Xuất JSON
            </button>
            {records.length > 0 && (
              isConfirmClearAll ? (
                <div className="flex items-center gap-1.5 bg-red-950/80 border border-red-700 px-2 py-1 rounded-xl animate-in fade-in">
                  <span className="text-[11px] text-red-200">Xóa hết?</span>
                  <button
                    onClick={() => {
                      onClearAll();
                      setIsConfirmClearAll(false);
                    }}
                    className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold cursor-pointer"
                  >
                    Xác nhận
                  </button>
                  <button
                    onClick={() => setIsConfirmClearAll(false)}
                    className="px-2 py-0.5 rounded bg-[#2E261D] text-[#C8B89E] text-[11px] cursor-pointer"
                  >
                    Hủy
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsConfirmClearAll(true)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-950/70 border border-red-900/60 rounded-xl transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Xóa Hết
                </button>
              )
            )}
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-3 py-1.5 text-xs rounded-lg transition-all ${
                selectedCategory === cat
                  ? "bg-[#C89B3C] text-[#121110] font-bold shadow"
                  : "bg-[#1E1A14] text-[#A89A84] hover:text-white border border-[#2F271E]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* History List Content */}
      {filteredRecords.length === 0 ? (
        <div className="bg-[#171512] border border-[#3A3225] rounded-2xl p-12 text-center text-[#8C7D6A]">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#201B15] border border-[#382E22] flex items-center justify-center text-[#C9A55A] mb-3">
            <BookmarkCheck className="w-6 h-6" />
          </div>
          <h4 className="font-serif text-[#EDE0C9] text-base font-bold mb-1">
            Chưa có ghi chép quẻ nào trong mục này
          </h4>
          <p className="text-xs max-w-sm mx-auto leading-relaxed">
            Mỗi khi bạn gieo quẻ hoặc bốc bài Kinh Dịch, hãy nhấn nút "Lưu Quẻ" để lưu giữ và chiêm nghiệm sự ứng nghiệm theo thời gian.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map((record) => {
            const formattedDate = new Date(record.timestamp).toLocaleString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            });

            return (
              <div
                key={record.id}
                className="bg-[#171512] border border-[#362E22] hover:border-[#524430] rounded-2xl p-5 shadow-lg transition-all"
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 border-b border-[#292219] pb-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 text-[11px] text-[#8C7F6E] mb-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#C9A55A]" />
                        {formattedDate}
                      </span>
                      <span>•</span>
                      <span className="px-2 py-0.5 rounded bg-[#241D15] text-[#D8C4A0] border border-[#382E21]">
                        {record.category}
                      </span>
                      {record.drawnCards && (record.spreadType === "custom" || record.customPositions || (record.drawnCards.length !== 1 && record.drawnCards.length !== 2 && record.drawnCards.length !== 3 && record.drawnCards.length !== 7 && record.drawnCards.length !== 10)) ? (
                        <>
                          <span>•</span>
                          <span className="text-[10px] text-[#C9A55A] font-semibold bg-[#261E14] px-1.5 py-0.5 rounded border border-[#443522]">
                            Trận Tùy Chỉnh ({record.drawnCards.length} Lá)
                          </span>
                        </>
                      ) : record.drawnCards && (record.spreadType === "seven_stars" || record.drawnCards.length === 7) ? (
                        <>
                          <span>•</span>
                          <span className="text-[10px] text-[#C9A55A] font-semibold bg-[#261E14] px-1.5 py-0.5 rounded border border-[#443522]">
                            Thất Tinh Trận (7 Lá)
                          </span>
                        </>
                      ) : record.drawnCards && (record.spreadType === "nine_palaces" || record.drawnCards.length === 9) ? (
                        <>
                          <span>•</span>
                          <span className="text-[10px] text-[#C9A55A] font-semibold bg-[#261E14] px-1.5 py-0.5 rounded border border-[#443522]">
                            Cửu Cung Phong Thủy (9 Lá)
                          </span>
                        </>
                      ) : record.drawnCards && (record.spreadType === "ten_stars_expanded" || record.drawnCards.length === 11) ? (
                        <>
                          <span>•</span>
                          <span className="text-[10px] text-[#C9A55A] font-semibold bg-[#261E14] px-1.5 py-0.5 rounded border border-[#443522]">
                            Thập Tinh Mở Rộng (11 Lá: 2A & 2B)
                          </span>
                        </>
                      ) : record.drawnCards && (record.spreadType === "ten_stars" || record.drawnCards.length === 10) ? (
                        <>
                          <span>•</span>
                          <span className="text-[10px] text-[#C9A55A] font-semibold bg-[#261E14] px-1.5 py-0.5 rounded border border-[#443522]">
                            Thập Tinh Trận (10 Lá)
                          </span>
                        </>
                      ) : record.drawnCards && record.drawnCards.length === 3 ? (
                        <>
                          <span>•</span>
                          <span className="text-[10px] text-[#C9A55A] font-semibold bg-[#261E14] px-1.5 py-0.5 rounded border border-[#443522]">
                            {record.threeMode === "choice_abc"
                              ? `3 Lựa chọn: ${record.choiceALabel || "A"} • ${record.choiceBLabel || "B"} • ${record.choiceCLabel || "C"}`
                              : record.threeMode === "tam_tai"
                              ? "3 Lá: Tam Tài (Thiên • Địa • Nhân)"
                              : "3 Lá: Quá khứ • Hiện tại • Tương lai"}
                          </span>
                        </>
                      ) : record.doubleMode === "choice_ab" ? (
                        <>
                          <span>•</span>
                          <span className="text-[10px] text-[#C9A55A] font-semibold bg-[#261E14] px-1.5 py-0.5 rounded border border-[#443522]">
                            So sánh: {record.choiceALabel || "A"} vs {record.choiceBLabel || "B"}
                          </span>
                        </>
                      ) : record.doubleMode === "present_future" ? (
                        <>
                          <span>•</span>
                          <span className="text-[10px] text-[#C9A55A] font-semibold bg-[#261E14] px-1.5 py-0.5 rounded border border-[#443522]">
                            Hiện tại & Tương lai
                          </span>
                        </>
                      ) : record.cardsDrawSummary ? (
                        <>
                          <span>•</span>
                          <span className="text-[10px] text-[#807260] italic">
                            {record.cardsDrawSummary}
                          </span>
                        </>
                      ) : null}

                      {record.deckCount && record.deckCount > 1 && (
                        <>
                          <span>•</span>
                          <span className="text-[10px] text-[#EAD8B1] font-semibold bg-[#2B1F13] px-1.5 py-0.5 rounded border border-[#543E26]">
                            📦 {record.deckCount} Bộ ({record.multiDeckMode === "combined" ? `Trộn chung ${record.deckCount * 64} lá` : "Từng bộ"})
                          </span>
                        </>
                      )}
                    </div>
                    <h4 className="text-base font-serif font-bold text-[#F3E7D0]">
                      "{record.question || "Xem tổng quan thời vận"}"
                    </h4>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {onOpenWorkspace && (
                      <button
                        onClick={() => onOpenWorkspace(record, "docs")}
                        title="Đồng bộ quẻ này với Google Docs, Sheets, Gmail"
                        className="p-2 text-[#A89882] hover:text-[#93C5FD] bg-[#201B15] hover:bg-[#1E2B3E] border border-[#382E22] hover:border-[#2B4366] rounded-lg transition-colors cursor-pointer"
                      >
                        <FileText className="w-4 h-4 text-[#4285F4]" />
                      </button>
                    )}
                    <button
                      onClick={() => onToggleFavorite(record.id)}
                      title={record.isFavorite ? "Bỏ yêu thích" : "Đánh dấu yêu thích"}
                      className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                        record.isFavorite
                          ? "bg-amber-950/80 text-amber-300 border-amber-800"
                          : "bg-[#201B15] text-[#7A6E5E] hover:text-[#C9A55A] border-[#382E22]"
                      }`}
                    >
                      <Star className={`w-4 h-4 ${record.isFavorite ? "fill-amber-400" : ""}`} />
                    </button>
                    <button
                      onClick={() => onSelectRecord(record)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-[#14120F] bg-gradient-to-r from-[#C89B3C] to-[#E2C37A] hover:brightness-110 rounded-lg shadow cursor-pointer transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Xem Lại
                    </button>
                    <button
                      onClick={() => onDeleteRecord(record.id)}
                      className="p-2 text-[#7A6E5E] hover:text-red-400 bg-[#201B15] hover:bg-red-950/40 border border-[#382E22] hover:border-red-900/60 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Hexagram cards and summary details */}
                {record.drawnCards && (record.spreadType === "custom" || record.customPositions || (record.drawnCards.length !== 1 && record.drawnCards.length !== 2 && record.drawnCards.length !== 3 && record.drawnCards.length !== 7 && record.drawnCards.length !== 10)) ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 items-stretch">
                    {record.drawnCards.map((card, idx) => {
                      const pos = record.customPositions?.[idx];
                      const posLabel = pos?.name || `Lá ${idx + 1}`;
                      const purpose = pos?.purpose;
                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-2 bg-[#1B1813] border border-[#2D261E] rounded-xl p-2"
                          title={purpose ? `Mục đích: ${purpose}` : undefined}
                        >
                          <div className="flex-shrink-0">
                            <CardVisual
                              hexagram={card}
                              imageUrl={cardImages[card.number]}
                              size="xs"
                              showUploadTrigger={false}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[9px] font-mono font-bold text-[#C9A55A] truncate" title={posLabel}>
                              {posLabel}
                            </div>
                            <h5 className="font-serif font-bold text-[#EFE2CC] text-xs truncate">
                              #{card.number} {card.name}
                            </h5>
                            {purpose && (
                              <p className="text-[9px] text-[#A69580] truncate italic" title={purpose}>
                                {purpose}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : record.drawnCards && (record.spreadType === "seven_stars" || record.drawnCards.length === 7 || record.spreadType === "nine_palaces" || record.drawnCards.length === 9 || record.spreadType === "ten_stars" || record.drawnCards.length === 10 || record.spreadType === "ten_stars_expanded" || record.drawnCards.length === 11) ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 items-stretch">
                    {record.drawnCards.map((card, idx) => {
                      const isNinePalaces = record.drawnCards!.length === 9 || record.spreadType === "nine_palaces";
                      const isTenStarsExpanded = record.drawnCards!.length === 11 || record.spreadType === "ten_stars_expanded";
                      const isTenStars = !isTenStarsExpanded && (record.drawnCards!.length === 10 || record.spreadType === "ten_stars");
                      const isCard2 = isTenStars && idx === 1;
                      const isCard2A = isTenStarsExpanded && idx === 1;
                      const isCard2B = isTenStarsExpanded && idx === 2;

                      let posName = "";
                      let isReversed = false;

                      if (isNinePalaces) {
                        posName = NINE_PALACES_POSITIONS[idx]?.name || `Cung ${idx + 1}`;
                      } else if (isTenStarsExpanded) {
                        if (isCard2A) {
                          posName = record.isCard2AReversed ? "2A. Trở Ngại (Ngược)" : "2A. Hỗ Trợ (Xuôi)";
                          isReversed = !!record.isCard2AReversed;
                        } else if (isCard2B) {
                          posName = record.isCard2BReversed ? "2B. Trở Ngại (Ngược)" : "2B. Hỗ Trợ (Xuôi)";
                          isReversed = !!record.isCard2BReversed;
                        } else {
                          posName = TEN_STARS_EXPANDED_POSITIONS[idx]?.name || `Lá ${idx + 1}`;
                        }
                      } else if (isTenStars) {
                        if (isCard2) {
                          posName = record.isCard2Reversed ? "Trở Ngại (Ngược)" : "Hỗ Trợ (Xuôi)";
                          isReversed = !!record.isCard2Reversed;
                        } else {
                          posName = TEN_STARS_POSITIONS[idx]?.name || `Lá ${idx + 1}`;
                        }
                      } else {
                        posName = SEVEN_STARS_POSITIONS[idx]?.name || `Lá ${idx + 1}`;
                      }

                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-2 bg-[#1B1813] border border-[#2D261E] rounded-xl p-2"
                        >
                          <div className="flex-shrink-0">
                            <CardVisual
                              hexagram={card}
                              imageUrl={cardImages[card.number]}
                              size="xs"
                              showUploadTrigger={false}
                              isReversed={isReversed}
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[9px] uppercase font-mono font-bold text-[#C9A55A] truncate">
                              {posName}
                            </div>
                            <h5 className="font-serif font-bold text-[#EFE2CC] text-xs truncate">
                              #{card.number} {card.name}
                            </h5>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : record.drawnCards && record.drawnCards.length === 3 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-stretch">
                    {record.drawnCards.map((card, idx) => (
                      <div
                        key={card.number}
                        className="flex items-center gap-3 bg-[#1B1813] border border-[#2D261E] rounded-xl p-2.5"
                      >
                        <div className="flex-shrink-0">
                          <CardVisual
                            hexagram={card}
                            imageUrl={cardImages[card.number]}
                            size="xs"
                            showUploadTrigger={false}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] uppercase font-mono font-bold text-[#C9A55A] truncate">
                            {record.threeMode === "choice_abc"
                              ? idx === 0
                                ? `Lá 1: [A] ${record.choiceALabel || "Lựa chọn A"}`
                                : idx === 1
                                ? `Lá 2: [B] ${record.choiceBLabel || "Lựa chọn B"}`
                                : `Lá 3: [C] ${record.choiceCLabel || "Lựa chọn C"}`
                              : record.threeMode === "tam_tai"
                              ? idx === 0
                                ? "Lá 1: Thiên (Thiên Thời)"
                                : idx === 1
                                ? "Lá 2: Địa (Địa Lợi)"
                                : "Lá 3: Nhân (Nhân Hòa)"
                              : idx === 0
                              ? "Lá 1: Quá Khứ"
                              : idx === 1
                              ? "Lá 2: Hiện Tại"
                              : "Lá 3: Tương Lai"}
                          </div>
                          <h5 className="font-serif font-bold text-[#EFE2CC] text-xs truncate">
                            #{card.number} {card.name}
                          </h5>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`grid gap-4 items-center ${record.transformedHexagram ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
                    <div className="flex items-center gap-3.5 bg-[#1B1813] border border-[#2D261E] rounded-xl p-3">
                      <div className="flex-shrink-0">
                        <CardVisual
                          hexagram={record.primaryHexagram}
                          imageUrl={cardImages[record.primaryHexagram.number]}
                          size="xs"
                          showUploadTrigger={false}
                        />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-mono text-[#C9A55A] truncate max-w-[200px]">
                          {record.doubleMode === "choice_ab"
                            ? `Lựa chọn A: ${record.choiceALabel || "Phương án A"}`
                            : record.doubleMode === "present_future"
                            ? "Hiện tại (Gốc rễ)"
                            : "Quẻ Chủ Đã Bốc"}
                        </div>
                        <h5 className="font-serif font-bold text-[#EFE2CC] text-sm">
                          Quẻ #{record.primaryHexagram.number}: {record.primaryHexagram.name}
                        </h5>
                        <p className="text-[11px] text-[#A69780] font-serif">
                          {record.primaryHexagram.hanzi} • {record.primaryHexagram.vietnameseName}
                        </p>
                      </div>
                    </div>

                    {/* Transformed or 2nd card info */}
                    {record.transformedHexagram && (
                      <div className="flex items-center gap-3.5 bg-[#1B1813] border border-[#2D261E] rounded-xl p-3">
                        <div className="flex-shrink-0">
                          <CardVisual
                            hexagram={record.transformedHexagram}
                            imageUrl={cardImages[record.transformedHexagram.number]}
                            size="xs"
                            showUploadTrigger={false}
                          />
                        </div>
                        <div>
                          <div className="text-[10px] uppercase font-mono text-[#E28355] truncate max-w-[200px]">
                            {record.doubleMode === "choice_ab"
                              ? `Lựa chọn B: ${record.choiceBLabel || "Phương án B"}`
                              : record.doubleMode === "present_future"
                              ? "Tương lai (Xu hướng)"
                              : "Lá Biến Chuyển"}
                          </div>
                          <h5 className="font-serif font-bold text-[#EFE2CC] text-sm">
                            Quẻ #{record.transformedHexagram.number}: {record.transformedHexagram.name}
                          </h5>
                          <p className="text-[11px] text-[#A69780] font-serif">
                            {record.transformedHexagram.hanzi} • {record.transformedHexagram.vietnameseName}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Notes & Reflection row */}
                <div className="mt-3 pt-3 border-t border-[#292219]">
                  {editingId === record.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={noteDraft}
                        onChange={(e) => setNoteDraft(e.target.value)}
                        placeholder="Ghi nhận nghiệm quẻ: việc đã diễn ra ra sao, bài học tâm đắc..."
                        className="w-full bg-[#12100E] border border-[#3D3325] focus:border-[#C89B3C] rounded-lg p-2.5 text-xs text-[#E8DCBF] outline-none"
                        rows={2}
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 text-xs text-[#9E907D] hover:text-white"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={() => handleSaveNote(record.id)}
                          className="px-3 py-1 text-xs font-bold text-[#14120F] bg-[#C89B3C] hover:bg-[#E2C37A] rounded-md shadow"
                        >
                          Lưu Ghi Chú
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs text-[#A89A84]">
                      <div className="flex items-center gap-1.5 italic truncate max-w-lg">
                        <Edit3 className="w-3.5 h-3.5 text-[#C9A55A] flex-shrink-0" />
                        <span className="truncate">
                          {record.notes ? `"${record.notes}"` : "Chưa có ghi chú nghiệm quẻ."}
                        </span>
                      </div>
                      <button
                        onClick={() => handleStartEditNote(record)}
                        className="text-[11px] text-[#C9A55A] hover:underline flex-shrink-0 cursor-pointer"
                      >
                        {record.notes ? "Sửa ghi chú" : "+ Viết nghiệm quẻ"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
