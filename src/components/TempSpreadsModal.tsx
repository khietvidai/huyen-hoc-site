import React, { useState } from "react";
import {
  X,
  Clock,
  Search,
  Trash2,
  Calendar,
  Copy,
  Check,
  Bookmark,
  Sparkles,
  FolderOpen,
  AlertCircle,
} from "lucide-react";
import {
  TempSpreadItem,
  deleteTempSpreadItem,
  clearTodayTempSpreads,
} from "../services/savedSpreadsService";

interface TempSpreadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tempSpreads: TempSpreadItem[];
  onReloadList: () => void;
  onLoadSpread: (spread: TempSpreadItem) => void;
  onSaveSpreadPermanently: (spread: TempSpreadItem) => void;
  onCopySpreadForAI: (spread: TempSpreadItem) => void;
  onOpenSavedSpreadsModal?: () => void;
  savedSpreadsCount?: number;
}

export const TempSpreadsModal: React.FC<TempSpreadsModalProps> = ({
  isOpen,
  onClose,
  tempSpreads,
  onReloadList,
  onLoadSpread,
  onSaveSpreadPermanently,
  onCopySpreadForAI,
  onOpenSavedSpreadsModal,
  savedSpreadsCount = 0,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredSpreads = tempSpreads.filter((item) => {
    const q = searchTerm.toLowerCase();
    return (
      item.spreadTitle.toLowerCase().includes(q) ||
      (item.question && item.question.toLowerCase().includes(q)) ||
      (item.hexagramPrediction && item.hexagramPrediction.toLowerCase().includes(q)) ||
      (item.userAnswer && item.userAnswer.toLowerCase().includes(q)) ||
      item.cards.some((c) => c?.name?.toLowerCase().includes(q))
    );
  });

  const handleDelete = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa quẻ tạm này?")) {
      deleteTempSpreadItem(id);
      onReloadList();
    }
  };

  const handleClearAll = () => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn xóa toàn bộ danh sách quẻ tạm thời trong ngày hôm nay?"
      )
    ) {
      clearTodayTempSpreads();
      onReloadList();
    }
  };

  const handleCopy = (item: TempSpreadItem) => {
    onCopySpreadForAI(item);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl h-[90vh] bg-[#14100D] border border-[#524128] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-[#EFE7D8]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-gradient-to-r from-[#1E1712] via-[#2A1F16] to-[#1E1712] border-b border-[#3D2F1F] z-20">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center shadow shrink-0">
              <Clock className="w-4 h-4 text-amber-300" />
            </div>
            <div className="min-w-0">
              <h3 className="font-serif font-bold text-sm sm:text-base text-amber-200 flex items-center gap-2 truncate">
                <span>Quẻ Tạm Thời Trong Ngày</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                  {tempSpreads.length} quẻ
                </span>
              </h3>
              <p className="text-[11px] text-stone-400 truncate">
                Tự động lưu trữ các quẻ mới mở hôm nay chưa nhấn lưu • Tự làm mới sau 24:00
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenSavedSpreadsModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSavedSpreadsModal();
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#221A13] hover:bg-[#2D2218] text-amber-300 text-xs border border-amber-600/30 transition cursor-pointer"
                title="Chuyển sang xem danh sách quẻ đã lưu chính thức"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Xem Quẻ Đã Lưu ({savedSpreadsCount})</span>
              </button>
            )}

            {tempSpreads.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-[#221712] hover:bg-rose-950/80 text-stone-400 hover:text-rose-200 border border-[#3E2B1E] hover:border-rose-800 text-xs flex items-center gap-1 transition cursor-pointer"
                title="Xóa tất cả quẻ tạm thời hôm nay"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dọn sạch</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#271E17] hover:bg-rose-950/80 text-stone-400 hover:text-rose-200 border border-[#3E3120] transition cursor-pointer"
              title="Đóng (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Thanh tìm kiếm & Banner nhắc nhở */}
        <div className="px-4 sm:px-6 py-2.5 bg-[#18130E] border-b border-[#2F2317] flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm quẻ tạm theo câu hỏi, tên quẻ, dự đoán..."
              className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-[#0F0C09] border border-[#3A2B1C] text-xs text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-400 transition"
            />
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-xs text-stone-400 hover:text-stone-200 px-2 py-1 cursor-pointer"
            >
              Xóa lọc
            </button>
          )}
        </div>

        {/* Danh sách quẻ tạm */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4">
          {filteredSpreads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-[#1F1710] border border-[#3D2D1B] flex items-center justify-center text-amber-400/60">
                <Clock className="w-6 h-6" />
              </div>
              <p className="text-sm font-serif text-stone-300 max-w-md">
                {searchTerm
                  ? "Không tìm thấy quẻ tạm thời nào khớp với từ khóa tìm kiếm."
                  : "Chưa có quẻ tạm thời nào hôm nay."}
              </p>
              <p className="text-xs text-stone-400 max-w-md leading-relaxed">
                Mỗi khi bạn bốc một quẻ mới mà chưa kịp nhấn &quot;Lưu Quẻ&quot;, hệ thống sẽ tự động lưu tạm tại đây trong ngày để bạn không bao giờ lo bị mất quẻ!
              </p>
            </div>
          ) : (
            filteredSpreads.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-[#1A140F] border border-[#3D2E1D] hover:border-amber-500/50 transition-all space-y-3 shadow-lg"
              >
                {/* Dòng tiêu đề trận & thời gian */}
                <div className="flex items-center justify-between gap-2 flex-wrap border-b border-[#2E2215] pb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-serif font-bold text-sm text-amber-200">
                      {item.spreadTitle}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#271E15] text-amber-300/90 border border-amber-600/30 font-mono">
                      {item.cards.length} lá bài
                    </span>
                    <span className="text-[9.5px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/40 font-semibold">
                      ⏳ Quẻ tạm hôm nay
                    </span>
                    {item.isRitualCompleted && (
                      <span className="text-[9.5px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 font-bold">
                        ✦ Tam Kính
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-stone-400 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>{item.createdAt}</span>
                  </div>
                </div>

                {/* Danh sách các lá bài trong trận */}
                <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
                  {item.cards.map((c, idx) => (
                    <div
                      key={idx}
                      className="shrink-0 px-2.5 py-1 rounded-lg bg-[#221A12] border border-[#3D2C1B] flex items-center gap-1.5 text-xs"
                    >
                      <span className="font-serif text-amber-400 text-sm">{c.symbol || "䷀"}</span>
                      <div className="leading-tight">
                        <span className="font-semibold text-stone-200 block text-[11px]">
                          {c.name}
                        </span>
                        {c.positionLabel && (
                          <span className="text-[9px] text-stone-400 block font-serif">
                            {c.positionLabel}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 1. Câu hỏi tâm niệm (nếu có) */}
                {item.question ? (
                  <div className="p-2.5 rounded-xl bg-[#140F0A] border border-[#332517] space-y-1">
                    <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block font-bold">
                      🕊️ Câu Hỏi / Tâm Niệm:
                    </span>
                    <p className="text-xs text-stone-200 italic font-serif">
                      &quot;{item.question}&quot;
                    </p>
                  </div>
                ) : null}

                {/* 2. Dự đoán của quẻ (nếu có) */}
                {item.hexagramPrediction ? (
                  <div className="p-2.5 rounded-xl bg-[#16100B] border border-amber-600/30 space-y-1">
                    <span className="text-[10px] font-mono text-amber-300 uppercase tracking-wider block font-bold flex items-center gap-1">
                      <span>🔮</span>
                      <span>Dự Đoán / Điềm Báo Của Quẻ:</span>
                    </span>
                    <p className="text-xs text-amber-100/90 leading-relaxed font-sans pl-2 border-l-2 border-amber-500/50">
                      {item.hexagramPrediction}
                    </p>
                  </div>
                ) : null}

                {/* Các nút thao tác với quẻ tạm */}
                <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="px-2.5 py-1.5 rounded-xl bg-[#241B14] hover:bg-rose-950 text-stone-400 hover:text-rose-200 border border-[#3E2B1E] hover:border-rose-800 text-xs flex items-center gap-1 transition cursor-pointer"
                    title="Xóa quẻ tạm này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa</span>
                  </button>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleCopy(item)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#221A12] hover:bg-[#2C2117] text-amber-300 border border-amber-600/40 text-xs flex items-center gap-1.5 transition cursor-pointer"
                      title="Sao chép toàn bộ quẻ tạm cho AI"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-bold">Đã chép!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-amber-400" />
                          <span>Chép cho AI</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onSaveSpreadPermanently(item)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#2A1F13] hover:bg-[#382918] text-amber-200 border border-amber-500/50 hover:border-amber-400 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow"
                      title="Lưu quẻ này vào danh sách quẻ đã lưu chính thức"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                      <span>Lưu Quẻ Chính Thức</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onLoadSpread(item)}
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer active:scale-95"
                      title="Nạp quẻ này vào bàn trải bài chính"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Mở / Nạp Quẻ Này</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
