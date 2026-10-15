import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Sparkles,
  RotateCcw,
  Copy,
  Check,
  Loader2,
  HelpCircle,
  ChevronRight,
  Compass,
} from "lucide-react";
import Markdown from "react-markdown";
import { Hexagram, SpreadType, DoubleCardMode, ThreeCardMode, CustomCardPosition } from "../types";
import { BOOK_HEXAGRAMS } from "../data/bookHexagrams";

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: number;
}

interface IChingChatbotProps {
  question: string;
  category: string;
  primaryHexagram: Hexagram;
  changingLines: number[];
  transformedHexagram?: Hexagram;
  drawnCards?: Hexagram[];
  spreadType?: SpreadType;
  doubleMode?: DoubleCardMode;
  choiceALabel?: string;
  choiceBLabel?: string;
  threeMode?: ThreeCardMode;
  choiceCLabel?: string;
  isCard2Reversed?: boolean;
  customPositions?: CustomCardPosition[];
  initialInterpretation?: string;
}

export const IChingChatbot: React.FC<IChingChatbotProps> = ({
  question,
  category,
  primaryHexagram,
  changingLines,
  transformedHexagram,
  drawnCards,
  spreadType,
  doubleMode,
  choiceALabel,
  choiceBLabel,
  threeMode,
  choiceCLabel,
  isCard2Reversed,
  customPositions,
  initialInterpretation,
}) => {
  // Generate a tailored welcome message based on Sách Thuyết Minh
  const getInitialWelcome = (): string => {
    const hexName = `Quẻ #${primaryHexagram.number} ${primaryHexagram.name} (${primaryHexagram.vietnameseName})`;
    let spreadDesc = "";
    if (drawnCards && drawnCards.length === 10) {
      spreadDesc = "Trận Pháp Thập Tinh (10 lá)";
    } else if (drawnCards && drawnCards.length === 7) {
      spreadDesc = "Trận Pháp Thất Tinh (7 lá)";
    } else if (drawnCards && drawnCards.length === 3) {
      if (threeMode === "choice_abc") {
        spreadDesc = `Trận Pháp 3 lá: So sánh 3 lựa chọn (${choiceALabel || "A"} — ${choiceBLabel || "B"} — ${choiceCLabel || "C"})`;
      } else if (threeMode === "tam_tai") {
        spreadDesc = "Trận Pháp 3 lá: Tam Tài (Thiên Thời — Địa Lợi — Nhân Hòa)";
      } else {
        spreadDesc = "Trận Pháp 3 lá: Tiến Trình Dòng Thời Gian (Quá Khứ — Hiện Tại — Tương Lai)";
      }
    } else if (doubleMode === "choice_ab") {
      spreadDesc = "Trận Pháp so sánh 2 lựa chọn A & B";
    } else if (transformedHexagram) {
      spreadDesc = `Quẻ Chủ ${hexName} và Quẻ Biến #${transformedHexagram.number} ${transformedHexagram.name}`;
    } else {
      spreadDesc = `${hexName}`;
    }

    return `Kính chào hiền hữu. Ta là **Dịch Tiên Sinh AI**. 

Ta cùng bạn luận giải trận pháp quẻ bài **hoàn toàn theo nghĩa ý trong cuốn Sách Thuyết Minh** đi kèm bộ bài, không dùng kiến thức kinh điển hay bói toán truyền thống.

*Sách Thuyết Minh khẳng định: Kinh Dịch không áp đặt số phận hay định cát hung cố định, mà phản chiếu tình thế hiện tại và gợi mở hướng đi; người thấu suốt biết lấy nhu chế cương, lấy tĩnh chế động, ứng biến đúng thời.*

Ta đã tường minh vấn đề thỉnh vấn: **"${question || "Xem thời vận tổng quan"}"** (${category}), thuộc ${spreadDesc}.

Bạn muốn thỉnh giáo sâu hơn về dòng chữ đỏ trên lá bài, tượng thơ, vận thế, tình cảm hay đạo lý hành xử tối ưu nào?`;
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "msg_welcome",
      role: "model",
      text: getInitialWelcome(),
      timestamp: Date.now(),
    },
  ]);

  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Dynamic suggestion chips based on divination context and Sách Thuyết Minh
  const getSuggestions = (): string[] => {
    const list: string[] = [];

    if (drawnCards && drawnCards.length === 7) {
      list.push("Thông điệp từ dòng chữ đỏ của Lá Gợi Ý (Lá 4) và Lá Kết Quả (Lá 5) theo sách?");
      list.push("Sách Thuyết minh khuyên tôi khắc phục điểm yếu ở Lá số 7 (Thiếu sót) thế nào?");
      list.push("Vận thế bối cảnh ở Lá số 6 (Môi trường) được sách Thuyết minh luận giải ra sao?");
      list.push("Theo sách Thuyết minh, tôi nên giữ tâm thế cương hay nhu trong cục diện này?");
    } else if (drawnCards && drawnCards.length === 10) {
      list.push(
        isCard2Reversed
          ? "Lá số 2 thế NGƯỢC (Trở ngại) - Theo sách Thuyết minh cần tháo gỡ điểm nào?"
          : "Lá số 2 thế XUÔI (Trợ lực) - Theo sách Thuyết minh làm sao nắm bắt cơ hội?"
      );
      list.push("Dòng chữ đỏ và đại tượng của Lá số 10 (Lá khuyên bảo) định hướng ra sao?");
      list.push("Vận thế chung cuộc của vấn đề ở Lá số 9 (Kết quả) theo sách Thuyết minh?");
      list.push("Lời khuyên về tâm thế ứng biến theo triết lý của sách Thuyết minh?");
    } else if (drawnCards && drawnCards.length === 3) {
      if (threeMode === "choice_abc") {
        list.push("So sánh chi tiết 3 phương án A - B - C theo dòng chữ đỏ và lời quẻ?");
        list.push("Phương án nào hợp thời thế và đem lại sự an hòa, phát triển bền vững nhất?");
        list.push("Những rủi ro tiềm ẩn ở từng lựa chọn theo Sách Thuyết Minh là gì?");
        list.push("Lời khuyên hành động chung cuộc để chọn được phương án tối ưu?");
      } else if (threeMode === "tam_tai") {
        list.push("Lá THIÊN ĐẠO (Thiên thời) theo sách Thuyết minh chỉ ra vận hội khách quan gì?");
        list.push("Lá ĐỊA ĐẠO (Địa lợi) phản ánh nền tảng thực tế và điểm tựa ra sao?");
        list.push("Lá NHÂN ĐẠO (Nhân hòa) khuyên con người nên ứng xử và hành động thế nào?");
        list.push("Sự phối hợp Thiên - Địa - Nhân trong trận này dẫn dắt đến kết cục nào?");
      } else {
        list.push("Từ Quá khứ sang Hiện tại, dòng chữ đỏ và hình tượng cho thấy bước chuyển gì?");
        list.push("Vận thế lá Tương Lai trong sách Thuyết minh gợi mở điều gì?");
        list.push("Theo sách Thuyết minh, tôi nên hành động chủ động (Tiến) hay tĩnh tại (Thoái)?");
        list.push("Ý nghĩa thơ tượng của lá bài Hiện Tại ứng với tình huống này ra sao?");
      }
    } else if (doubleMode === "choice_ab") {
      list.push("So sánh Vận thế và dòng chữ đỏ giữa Lựa chọn A và Lựa chọn B theo sách Thuyết minh?");
      list.push("Lựa chọn nào thuận theo đạo lý tự nhiên và mang lại sự bền vững hơn?");
      list.push("Lời khuyên hành động cụ thể cho từng lựa chọn theo sách Thuyết minh?");
    } else {
      list.push("Dòng chữ đỏ và đại tượng quẻ này trong sách Thuyết minh khuyên điều gì?");
      list.push("Vận thế và tình cảm của quẻ theo sách Thuyết minh ứng với tôi ra sao?");
      list.push("Theo thuyết minh, tôi nên lấy Nhu chế Cương hay chủ động bứt phá?");
      list.push("Bài thơ tượng và lời giải nghĩa thơ trong sách có ngụ ý gì?");
    }

    return list.slice(0, 4);
  };

  const suggestions = getSuggestions();

  // Auto scroll to bottom
  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend !== undefined ? textToSend : inputText).trim();
    if (!text || isLoading) return;

    setErrorMsg(null);
    const userMessage: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: "user",
      text,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/iching/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            text: m.text,
          })),
          context: {
            question,
            category,
            primaryHexagram,
            changingLines,
            transformedHexagram,
            drawnCards,
            spreadType,
            doubleMode,
            choiceALabel,
            choiceBLabel,
            isCard2Reversed,
            customPositions,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Lỗi máy chủ (${response.status})`);
      }

      const data = await response.json();
      if (data.reply) {
        const botMessage: ChatMessage = {
          id: `msg_bot_${Date.now()}`,
          role: "model",
          text: data.reply,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        throw new Error(data.error || "Không nhận được phản hồi từ Dịch Tiên Sinh.");
      }
    } catch (err: any) {
      console.warn("Chat API unavailable, using local Sách Thuyết Minh engine:", err);
      const cardsToAnalyze =
        Array.isArray(drawnCards) && drawnCards.length > 0 ? drawnCards : [primaryHexagram];
      const bookSummary = cardsToAnalyze
        .map((c, idx) => {
          const b = BOOK_HEXAGRAMS.find((item) => item.number === c.number);
          if (!b) return `**Quẻ #${c.number} ${c.name}**`;
          return `### Lá ${idx + 1}: Quẻ #${b.number} ${b.name} (${b.hanzi})\n- **Châm ngôn chữ đỏ:** *"${b.redHeadline}"*\n- **Cấu trúc quái:** ${b.structure}\n- **Đại tượng:** ${b.bigImage}\n- **Vận thế:** ${b.destiny}\n- **Tình cảm:** ${b.love}`;
        })
        .join("\n\n");
      const fallbackReply = `**Luận Giải Trực Tiếp Theo Sách Thuyết Minh Đi Kèm Bộ Bài**\n\nĐối chiếu câu hỏi của quý bạn (*"${text}"*) với các lá bài đã bốc:\n\n${bookSummary}\n\n> **Lời bàn cốt tủy:** Theo tôn chỉ Sách Thuyết Minh, Dịch không định đoạt cát hung cố định mà phản chiếu thời thế hiện tại. Quý bạn hãy lấy dòng chữ đỏ trên lá bài làm kim chỉ nam, lấy tĩnh chế động, lấy nhu thắng cương, tiến thoái hợp thời.`;
      const botMessage: ChatMessage = {
        id: `msg_bot_${Date.now()}`,
        role: "model",
        text: fallbackReply,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: "msg_welcome_reset",
        role: "model",
        text: getInitialWelcome(),
        timestamp: Date.now(),
      },
    ]);
    setErrorMsg(null);
  };

  return (
    <div className="bg-[#15120E] border border-[#3E3222] rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[650px] sm:h-[720px]">
      {/* Chatbot Top Bar */}
      <div className="bg-gradient-to-r from-[#211B15] via-[#1C1712] to-[#211B15] border-b border-[#35291C] px-4 py-3 sm:px-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8C6D23] p-[1.5px] shadow-[0_0_12px_rgba(212,175,55,0.3)]">
              <div className="w-full h-full rounded-full bg-[#16120E] flex items-center justify-center text-[#D4AF37]">
                <Compass className="w-4 h-4 animate-[spin_24s_linear_infinite]" />
              </div>
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#16120E]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-serif font-bold text-[#F5EAD4] tracking-wide">
                Dịch Tiên Sinh AI
              </h3>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#2B2115] text-[#D4AF37] border border-[#483721]">
                Gemini 3.8
              </span>
            </div>
            <p className="text-[11px] text-[#A69780]">
              Luận giải theo Sách Thuyết Minh đi kèm bộ bài (bỏ kiến thức truyền thống)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleResetChat}
            className="flex items-center gap-1 text-[11px] text-[#A69780] hover:text-[#EAE0D0] px-2.5 py-1.5 rounded-lg bg-[#201912] hover:bg-[#2B2218] border border-[#3A2E1F] transition-colors cursor-pointer"
            title="Làm mới cuộc trò chuyện"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Hội Thoại Mới</span>
          </button>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scroll-smooth">
        {messages.map((msg) => {
          const isModel = msg.role === "model";
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isModel ? "justify-start" : "justify-end"}`}
            >
              {isModel && (
                <div className="w-7 h-7 rounded-full bg-[#241C14] border border-[#4A3822] flex items-center justify-center shrink-0 text-[#D4AF37] mt-1 shadow">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-xs sm:text-sm shadow-md transition-all ${
                  isModel
                    ? "bg-[#1C1712] border border-[#3E3120] text-[#EAD8B1] rounded-tl-sm"
                    : "bg-[#2F2417] border border-[#523F27] text-[#FFF4E0] rounded-tr-sm"
                }`}
              >
                {isModel ? (
                  <div>
                    <div className="markdown-body prose prose-invert max-w-none text-[#DDD0BD] leading-relaxed [&>p]:mb-2.5 [&>p:last-child]:mb-0 [&>ul]:list-disc [&>ul]:pl-4 [&>ul]:mb-2.5 [&>ol]:list-decimal [&>ol]:pl-4 [&>ol]:mb-2.5 [&>strong]:text-[#F5EAD4] [&>strong]:font-semibold [&>h3]:text-sm [&>h3]:font-serif [&>h3]:text-[#E6C673] [&>h3]:mt-2 [&>h3]:mb-1.5 [&>blockquote]:border-l-2 [&>blockquote]:border-[#D4AF37] [&>blockquote]:pl-2.5 [&>blockquote]:italic [&>blockquote]:text-[#BCAE99]">
                      <Markdown>{msg.text}</Markdown>
                    </div>

                    <div className="mt-2 pt-2 border-t border-[#2D2317] flex items-center justify-between text-[10px] text-[#8C7B67]">
                      <span className="font-serif italic">Dịch Đạo Sách Lược</span>
                      <button
                        type="button"
                        onClick={() => handleCopyMessage(msg.text, msg.id)}
                        className="flex items-center gap-1 hover:text-[#D4AF37] transition-colors cursor-pointer"
                        title="Sao chép câu trả lời"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Đã chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Sao chép</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                )}
              </div>

              {!isModel && (
                <div className="w-7 h-7 rounded-full bg-[#3D2C1A] border border-[#5E4427] flex items-center justify-center shrink-0 text-[#EAD8B1] mt-1 shadow">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {/* Thinking / Loading indicator */}
        {isLoading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-7 h-7 rounded-full bg-[#241C14] border border-[#4A3822] flex items-center justify-center shrink-0 text-[#D4AF37] shadow">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-[#1C1712] border border-[#3E3120] rounded-2xl rounded-tl-sm px-4 py-3 text-xs text-[#C8B89E] flex items-center gap-2.5 shadow">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4AF37]" />
              <span className="font-serif italic animate-pulse">
                Dịch Tiên Sinh đang chiêm nghiệm tượng quẻ và hào từ...
              </span>
            </div>
          </div>
        )}

        {/* Error notification */}
        {errorMsg && (
          <div className="p-3 bg-[#261512] border border-[#5A251E] rounded-xl text-xs text-[#FFAE9E] flex items-center justify-between">
            <span>{errorMsg}</span>
            <button
              type="button"
              onClick={() => handleSendMessage()}
              className="px-2 py-1 bg-[#381B16] hover:bg-[#48221C] text-[#FFF] rounded border border-[#6B2D24] text-[11px] font-medium cursor-pointer"
            >
              Thử lại
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      {suggestions.length > 0 && (
        <div className="px-4 py-2 border-t border-[#261E14] bg-[#120F0C] overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 flex-nowrap text-[11px]">
            <span className="text-[#8C7B67] shrink-0 font-serif flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#D4AF37]" />
              Gợi ý hỏi:
            </span>
            {suggestions.map((sug, idx) => (
              <button
                key={idx}
                type="button"
                disabled={isLoading}
                onClick={() => handleSendMessage(sug)}
                className="shrink-0 px-2.5 py-1 rounded-full bg-[#1C1610] hover:bg-[#291F14] border border-[#362A1B] hover:border-[#D4AF37]/50 text-[#C8B89E] hover:text-[#FFF] transition-all cursor-pointer truncate max-w-xs"
                title={sug}
              >
                {sug}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Bar */}
      <div className="p-3 sm:p-4 bg-[#18140F] border-t border-[#312618]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-end gap-2"
        >
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="Thỉnh giáo Dịch Tiên Sinh về từng lá bài, sự nghiệp, tài lộc, thời cơ, cách hóa giải... (Nhấn Enter để gửi)"
              className="w-full bg-[#110E0B] border border-[#3A2E1E] focus:border-[#D4AF37] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#F0E4D2] placeholder-[#7E6F5C] outline-none resize-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className={`h-11 px-4 rounded-xl flex items-center justify-center gap-1.5 text-xs font-serif font-bold transition-all shadow-md cursor-pointer ${
              isLoading || !inputText.trim()
                ? "bg-[#231C14] text-[#6A5A48] border border-[#352A1C] cursor-not-allowed"
                : "bg-gradient-to-r from-[#D4AF37] to-[#B8902A] text-[#14100C] hover:brightness-110 border border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.25)]"
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Hỏi</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
