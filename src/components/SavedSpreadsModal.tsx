import React, { useState } from "react";
import {
  X,
  FolderOpen,
  Search,
  Trash2,
  Calendar,
  Copy,
  Check,
  Edit3,
  Bookmark,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import {
  SavedSpreadItem,
  updateSpreadItemAnswer,
  deleteSavedSpreadItem,
} from "../services/savedSpreadsService";

interface SavedSpreadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedSpreads: SavedSpreadItem[];
  onReloadList: () => void;
  onLoadSpread: (spread: SavedSpreadItem) => void;
  onCopySpreadForAI: (spread: SavedSpreadItem) => void;
}

export const SavedSpreadsModal: React.FC<SavedSpreadsModalProps> = ({
  isOpen,
  onClose,
  savedSpreads,
  onReloadList,
  onLoadSpread,
  onCopySpreadForAI,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingAnswerText, setEditingAnswerText] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredSpreads = savedSpreads.filter((item) => {
    const q = searchTerm.toLowerCase();
    return (
      item.spreadTitle.toLowerCase().includes(q) ||
      item.question.toLowerCase().includes(q) ||
      (item.userAnswer && item.userAnswer.toLowerCase().includes(q)) ||
      item.cards.some((c) => c.name?.toLowerCase().includes(q))
    );
  });

  const handleStartEditAnswer = (item: SavedSpreadItem) => {
    setEditingId(item.id);
    setEditingAnswerText(item.userAnswer || "");
  };

  const handleSaveAnswer = (id: string) => {
    updateSpreadItemAnswer(id, editingAnswerText);
    setEditingId(null);
    onReloadList();
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa quẻ này khỏi danh sách đã lưu?")) {
      deleteSavedSpreadItem(id);
      onReloadList();
    }
  };

  const handleCopy = (item: SavedSpreadItem) => {
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
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-600/30 text-amber-300 border border-amber-500/50 flex items-center justify-center shadow">
              <FolderOpen className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm sm:text-base text-amber-200 flex items-center gap-2">
                Danh Sách Quẻ Đã Lưu ({savedSpreads.length})
              </h3>
              <p className="text-[11px] text-stone-400">
                Lưu giữ quẻ tượng, câu hỏi AI &amp; đáp án chiêm nghiệm thực tế
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#271E17] hover:bg-rose-950/80 text-stone-400 hover:text-rose-200 border border-[#3E3120] transition cursor-pointer"
            title="Đóng (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thanh tìm kiếm */}
        <div className="px-4 sm:px-6 py-2.5 bg-[#18130E] border-b border-[#2F2317] flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm theo câu hỏi, tên quẻ, trận pháp hoặc đáp án tự điền..."
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

        {/* Danh sách quẻ */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4">
          {filteredSpreads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-[#1F1710] border border-[#3D2D1B] flex items-center justify-center text-amber-400/60">
                <Bookmark className="w-6 h-6" />
              </div>
              <p className="text-sm font-serif text-stone-400">
                {searchTerm
                  ? "Không tìm thấy quẻ nào khớp với từ khóa tìm kiếm."
                  : "Chưa có quẻ nào được lưu. Bạn hãy bốc quẻ và nhấn 'Lưu Quẻ' để lưu giữ!"}
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
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-sm text-amber-200">
                      {item.spreadTitle}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#271E15] text-amber-300/90 border border-amber-600/30 font-mono">
                      {item.cards.length} lá bài
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

                {/* Câu hỏi tâm niệm đã gửi AI */}
                <div className="p-2.5 rounded-xl bg-[#140F0A] border border-[#332517] space-y-1">
                  <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block font-bold">
                    🕊️ Câu Hỏi / Tâm Niệm Đã Hỏi AI:
                  </span>
                  <p className="text-xs text-stone-200 italic font-serif">
                    "{item.question || "Không ghi nội dung tâm niệm"}"
                  </p>
                </div>

                {/* Mục Đáp Án Tự Điền / Chiêm Nghiệm Thực Tế */}
                <div className="p-2.5 rounded-xl bg-[#120E09] border border-[#382818] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block font-bold flex items-center gap-1">
                      <span>✍️ Đáp Án / Chiêm Nghiệm Thực Tế Tự Điền:</span>
                    </span>
                    {editingId !== item.id && (
                      <button
                        type="button"
                        onClick={() => handleStartEditAnswer(item)}
                        className="text-[11px] text-amber-300 hover:text-white flex items-center gap-1 cursor-pointer transition"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Sửa đáp án</span>
                      </button>
                    )}
                  </div>

                  {editingId === item.id ? (
                    <div className="space-y-2 pt-1">
                      <textarea
                        rows={3}
                        value={editingAnswerText}
                        onChange={(e) => setEditingAnswerText(e.target.value)}
                        placeholder="Điền đáp án, lời giải hoặc kết quả thực tế ứng nghiệm của quẻ này..."
                        className="w-full p-2.5 rounded-lg bg-[#0A0805] border border-amber-500/50 text-xs text-stone-100 focus:outline-none leading-relaxed"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="px-2.5 py-1 rounded bg-[#251E17] text-stone-400 hover:text-white text-xs cursor-pointer"
                        >
                          Hủy
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveAnswer(item.id)}
                          className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs cursor-pointer shadow transition"
                        >
                          Lưu Đáp Án
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-stone-300 whitespace-pre-wrap leading-relaxed pl-2 border-l-2 border-emerald-500/40">
                      {item.userAnswer
                        ? item.userAnswer
                        : "Chưa điền đáp án. Bạn có thể nhấn 'Sửa đáp án' để ghi lại kết quả ứng nghiệm thực tế!"}
                    </p>
                  )}
                </div>

                {/* Hàng nút hành động trên mỗi quẻ */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-rose-950/40 transition cursor-pointer"
                    title="Xóa quẻ này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopy(item)}
                    className="px-3 py-1.5 rounded-xl bg-[#251D16] hover:bg-[#34271A] text-amber-200 border border-amber-600/40 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition active:scale-95"
                    title="Sao chép toàn bộ quẻ, câu hỏi và đáp án cho AI"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">Đã chép!</span>
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
                    onClick={() => onLoadSpread(item)}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition active:scale-95"
                    title="Nạp lại toàn bộ trận bài, câu hỏi và đáp án này lên màn hình chính"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Mở / Nạp Quẻ Này</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
