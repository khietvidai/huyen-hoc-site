import React, { useState, useEffect } from "react";
import { X, Bookmark, Check } from "lucide-react";

interface SaveSpreadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  spreadTitle: string;
  cardsCount: number;
  question: string;
  prediction: string;
  initialAnswer: string;
  onConfirmSave: (data: { question: string; prediction: string; answer: string }) => void;
}

export const SaveSpreadDialog: React.FC<SaveSpreadDialogProps> = ({
  isOpen,
  onClose,
  spreadTitle,
  cardsCount,
  question,
  prediction,
  initialAnswer,
  onConfirmSave,
}) => {
  const [questionText, setQuestionText] = useState(question);
  const [predictionText, setPredictionText] = useState(prediction);
  const [answerText, setAnswerText] = useState(initialAnswer);

  useEffect(() => {
    if (isOpen) {
      setQuestionText(question);
      setPredictionText(prediction);
      setAnswerText(initialAnswer);
    }
  }, [isOpen, question, prediction, initialAnswer]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmSave({
      question: questionText.trim(),
      prediction: predictionText.trim(),
      answer: answerText.trim(),
    });
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#15110D] border border-[#524128] rounded-2xl shadow-2xl p-4 sm:p-6 text-[#EFE7D8] space-y-4 max-h-[92vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between border-b border-[#34271A] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-600/30 text-amber-300 border border-amber-500/50 flex items-center justify-center shadow">
              <Bookmark className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm sm:text-base text-amber-200">
                Lưu Quẻ &amp; Đáp Án Chiêm Nghiệm
              </h3>
              <p className="text-[11px] text-stone-400">
                {spreadTitle} • {cardsCount} lá bài
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#271E17] hover:bg-rose-950/80 text-stone-400 hover:text-rose-200 border border-[#3E3120] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* 1. Câu hỏi đã gửi AI */}
          <div className="space-y-1">
            <label className="text-xs font-serif font-bold text-amber-300 flex items-center gap-1.5">
              <span>🕊️</span>
              <span>1. Nội dung tâm niệm / Câu hỏi:</span>
            </label>
            <textarea
              rows={2}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Câu hỏi hoặc việc đang trăn trở khi bốc quẻ này..."
              className="w-full p-2.5 rounded-xl bg-[#0D0A08] border border-[#3E2F1F] text-xs text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-400 leading-relaxed shadow-inner"
            />
          </div>

          {/* 2. Dự đoán của quẻ ở giữa */}
          <div className="space-y-1">
            <label className="text-xs font-serif font-bold text-amber-400 flex items-center gap-1.5">
              <span>🔮</span>
              <span>2. Dự đoán của quẻ / Điềm báo:</span>
            </label>
            <textarea
              rows={2}
              value={predictionText}
              onChange={(e) => setPredictionText(e.target.value)}
              placeholder="Dự đoán, lời giải và điềm báo cát hung của quẻ..."
              className="w-full p-2.5 rounded-xl bg-[#0D0A08] border border-amber-600/40 text-xs text-amber-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-400 leading-relaxed shadow-inner"
            />
          </div>

          {/* 3. Đáp án tự điền */}
          <div className="space-y-1">
            <label className="text-xs font-serif font-bold text-emerald-400 flex items-center gap-1.5">
              <span>✍️</span>
              <span>3. Đáp án tự điền / Chiêm nghiệm thực tế:</span>
            </label>
            <textarea
              rows={2}
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="Nhập đáp án, lời giải của bạn hoặc kết quả thực tế ứng nghiệm sau này..."
              className="w-full p-2.5 rounded-xl bg-[#0D0A08] border border-emerald-600/40 text-xs text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-emerald-400 leading-relaxed shadow-inner"
            />
            <span className="text-[10px] text-stone-400 block italic">
              💡 Bạn có thể để trống và cập nhật đáp án này bất cứ lúc nào trong mục &apos;Mở Quẻ&apos;.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#34271A]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-[#251E17] text-stone-300 hover:text-white text-xs font-semibold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Xác Nhận Lưu Quẻ</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
