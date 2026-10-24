import React from "react";
import { RotateCw, Plus, Edit3, Trash2, HeartHandshake } from "lucide-react";
import {
  YiloreUserProfile,
  YiloreDailyGuidanceRecord,
  YiloreReadingRecord,
  YiloreRelationshipProfile,
  YiloreConversation,
  YILORE_STEM_COLORS,
  YILORE_DAILY_QUESTIONS,
  formatGanZhiVi,
} from "../../data/yiloreSeedData";
import { YiloreLang, TrashIcon, renderInlineMarkdown } from "./YiloreShellParts";

const RELATION_LABELS_VI: Record<string, string> = {
  Partner: "Người yêu / Bạn đời",
  Family: "Gia đình",
  Friend: "Bạn bè",
  Colleague: "Đồng nghiệp",
  Other: "Khác",
};

// ============================================================================
// VIEW 1: DAILY GUIDANCE (/en/app/daily-guidance) — 1:1 DOM & Assets
// ============================================================================
interface DailyGuidanceViewProps {
  lang: YiloreLang;
  dailyRecords: YiloreDailyGuidanceRecord[];
  isCalendarExpanded: boolean;
  setIsCalendarExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  selectedCalendarDate: string;
  setSelectedCalendarDate: (d: string) => void;
  selectedDateGuidanceRecord: YiloreDailyGuidanceRecord | null;
  todayGuidanceRecord: YiloreDailyGuidanceRecord | null;
  isHoldingGuidance: boolean;
  setIsHoldingGuidance: (v: boolean) => void;
  holdProgress: number;
  handleCompleteTodayGuidanceDraw: () => void;
  isDailyCardFlipped: boolean;
  setIsDailyCardFlipped: React.Dispatch<React.SetStateAction<boolean>>;
  dailyFollowupInput: string;
  setDailyFollowupInput: (v: string) => void;
  handleAskDailyFollowup: (q: string) => void;
}

export const YiloreDailyGuidanceView: React.FC<DailyGuidanceViewProps> = ({
  dailyRecords,
  isCalendarExpanded,
  setIsCalendarExpanded,
  selectedCalendarDate,
  setSelectedCalendarDate,
  selectedDateGuidanceRecord,
  todayGuidanceRecord,
  isHoldingGuidance,
  setIsHoldingGuidance,
  holdProgress,
  handleCompleteTodayGuidanceDraw,
  isDailyCardFlipped,
  setIsDailyCardFlipped,
  dailyFollowupInput,
  setDailyFollowupInput,
  handleAskDailyFollowup,
}) => {
  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-12">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1">
              <h1 className="font-serif text-2xl font-semibold tracking-tight text-stone-900 sm:text-[1.65rem]">
                Chỉ Dẫn Hàng Ngày
              </h1>
              <button
                type="button"
                aria-expanded={isCalendarExpanded}
                aria-label={isCalendarExpanded ? "Ẩn lịch tháng" : "Xem theo ngày"}
                title={isCalendarExpanded ? "Ẩn lịch tháng" : "Xem theo ngày"}
                onClick={() => setIsCalendarExpanded((v) => !v)}
                className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border bg-white text-stone-600 shadow-sm transition hover:text-stone-900 focus-visible:outline focus-visible:ring-2 focus-visible:ring-amber-400/80 ${
                  isCalendarExpanded
                    ? "border-amber-400/80 bg-amber-50/60 ring-1 ring-amber-300/50"
                    : "border-stone-300/90 hover:border-amber-400/70 hover:bg-amber-50/40"
                }`}
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    isCalendarExpanded ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div className="shrink-0 self-start">
            <p className="max-w-[18rem] text-right text-sm leading-snug">
              <span className="font-semibold tabular-nums text-teal-700">{dailyRecords.length}</span>
              <span className="text-stone-600"> ngày điểm danh liên tiếp</span>
            </p>
          </div>
        </div>

        {/* Expandable Monthly Calendar (1:1 from modal_settings HTML) */}
        {isCalendarExpanded && (
          <div className="w-full min-w-0 border-t border-stone-200/40 pt-3">
            <div className="rounded-2xl border border-stone-200/90 bg-stone-50 shadow-sm">
              <div className="space-y-2.5 p-2.5 sm:space-y-3 sm:p-3">
                <div className="flex w-full min-w-0 items-center justify-center gap-1 sm:gap-1.5">
                  <button
                    type="button"
                    aria-label="Tháng trước"
                    title="Tháng trước"
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-600 transition hover:border-stone-300 hover:bg-stone-50 hover:text-stone-900"
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  <p className="min-w-0 truncate rounded-full border border-stone-200/80 bg-white px-3 py-1 text-center text-sm font-semibold tracking-wide text-stone-800 sm:px-4 sm:text-[0.95rem]">
                    Tháng 10 năm 2026
                  </p>
                  <button
                    type="button"
                    aria-label="Tháng sau"
                    title="Tháng sau"
                    disabled
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-600 opacity-30"
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>

                <div className="rounded-xl border border-stone-200/80 bg-white p-1.5 sm:p-2" aria-label="Lịch sử">
                  <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                    {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d) => (
                      <div
                        key={d}
                        className="pb-1 text-center text-[9px] font-semibold uppercase tracking-[0.12em] text-stone-400 sm:text-[10px]"
                      >
                        {d}
                      </div>
                    ))}

                    {/* 3 leading empty slots for Oct 2026 */}
                    <div className="min-h-[5.25rem] rounded-lg bg-transparent sm:min-h-[5.75rem]" aria-hidden="true" />
                    <div className="min-h-[5.25rem] rounded-lg bg-transparent sm:min-h-[5.75rem]" aria-hidden="true" />
                    <div className="min-h-[5.25rem] rounded-lg bg-transparent sm:min-h-[5.75rem]" aria-hidden="true" />

                    {Array.from({ length: 31 }, (_, i) => i + 1).map((dayNum) => {
                      const iso = `2026-10-${String(dayNum).padStart(2, "0")}`;
                      const rec = dailyRecords.find((r) => r.drawnDate === iso);
                      const isToday = dayNum === 24;
                      const isFuture = dayNum > 24;
                      const isSelected = selectedCalendarDate === iso;

                      if (rec) {
                        const shortTitle = rec.guaNameVi || rec.guaName;
                        return (
                          <button
                            key={iso}
                            type="button"
                            title={shortTitle}
                            onClick={() => setSelectedCalendarDate(iso)}
                            className={`group relative flex min-w-0 flex-col overflow-hidden rounded-xl border bg-white text-left text-stone-800 shadow-sm transition duration-150 hover:brightness-[1.02] ${
                              isSelected ? "border-amber-500 ring-2 ring-amber-400/50" : "border-stone-200/90"
                            }`}
                          >
                            <div className="flex min-w-0 items-center gap-1 px-1.5 pb-0.5 pt-1.5">
                              <span className="flex h-5 min-w-[1.35rem] shrink-0 items-center justify-center rounded-md bg-gradient-to-b from-teal-900 to-teal-950 font-mono text-[10px] font-bold tabular-nums leading-none text-amber-50 shadow-sm sm:h-[1.35rem] sm:text-[11px]">
                                {dayNum}
                              </span>
                              <span
                                className="min-w-0 flex-1 truncate text-[9px] font-semibold leading-tight text-teal-900/70 sm:text-[10px]"
                                title={shortTitle}
                              >
                                {shortTitle}
                              </span>
                            </div>
                            <div className="relative mx-1 mb-1.5 mt-0.5">
                              <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-white ring-1 ring-stone-200/90 transition-transform duration-150 group-hover:scale-[1.02]">
                                <img
                                  alt={shortTitle}
                                  className="h-full w-full object-cover object-center"
                                  src={rec.frontImageUrl}
                                />
                              </div>
                            </div>
                          </button>
                        );
                      }

                      if (isToday) {
                        return (
                          <button
                            key={iso}
                            type="button"
                            title="Hôm nay chưa rút quẻ"
                            onClick={() => setSelectedCalendarDate(iso)}
                            className="group relative flex min-w-0 flex-col overflow-hidden rounded-xl border border-stone-200/90 bg-amber-50/40 text-left text-stone-700 ring-2 ring-amber-400/30 transition duration-150 hover:brightness-[1.02]"
                          >
                            <span
                              className="pointer-events-none absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_0_2px_white]"
                              aria-hidden="true"
                            />
                            <div className="flex min-w-0 items-center gap-1 px-1.5 pb-0.5 pt-1.5">
                              <span className="flex h-5 min-w-[1.35rem] shrink-0 items-center justify-center rounded-md bg-amber-200/90 font-mono text-[10px] font-bold tabular-nums text-amber-950 ring-1 ring-amber-400/35 sm:h-[1.35rem] sm:text-[11px]">
                                {dayNum}
                              </span>
                            </div>
                            <div className="relative mx-1 mb-1.5 mt-0.5">
                              <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg border border-amber-200/50 bg-amber-50/50">
                                <span className="flex h-full items-center justify-center text-[10px] text-amber-700/50">
                                  ○
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      }

                      if (isFuture) {
                        return (
                          <button
                            key={iso}
                            type="button"
                            disabled
                            title="Ngày này chưa tới"
                            className="group relative flex min-w-0 flex-col overflow-hidden rounded-xl border border-dotted border-stone-300/90 bg-stone-100/40 text-left text-stone-500 opacity-70"
                          >
                            <div className="flex min-w-0 items-center gap-1 px-1.5 pb-0.5 pt-1.5">
                              <span className="flex h-5 min-w-[1.35rem] shrink-0 items-center justify-center rounded-md bg-stone-200/90 font-mono text-[10px] font-bold tabular-nums text-stone-500 sm:h-[1.35rem] sm:text-[11px]">
                                {dayNum}
                              </span>
                            </div>
                            <div className="relative mx-1 mb-1.5 mt-0.5">
                              <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg border border-dotted border-stone-300/70 bg-stone-100/30">
                                <span className="flex h-full items-center justify-center text-[10px] text-stone-300">
                                  ···
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      }

                      // Past day with no draw -> uses /yilore-assets/hero-frame.webp
                      return (
                        <button
                          key={iso}
                          type="button"
                          disabled
                          title="Không có quẻ trong ngày này"
                          className="group relative flex min-w-0 flex-col overflow-hidden rounded-xl border border-dashed border-stone-400/60 bg-stone-50/90 text-left text-stone-600 opacity-70"
                        >
                          <div className="flex min-w-0 items-center gap-1 px-1.5 pb-0.5 pt-1.5">
                            <span className="flex h-5 min-w-[1.35rem] shrink-0 items-center justify-center rounded-md bg-stone-200 font-mono text-[10px] font-bold tabular-nums text-stone-600 sm:h-[1.35rem] sm:text-[11px]">
                              {dayNum}
                            </span>
                          </div>
                          <div className="relative mx-1 mb-1.5 mt-0.5">
                            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg border border-dashed border-stone-400/45 bg-stone-50/80">
                              <div className="relative h-full w-full overflow-hidden" aria-hidden="true">
                                <img
                                  alt=""
                                  className="h-full w-full object-cover object-[50%_15%] opacity-[0.92]"
                                  src="/yilore-assets/hero-frame.webp"
                                />
                                <div className="pointer-events-none absolute inset-0 bg-white/20" aria-hidden="true" />
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                    <div className="min-h-[5.25rem] rounded-lg bg-transparent sm:min-h-[5.75rem]" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Daily Guidance Banner (1:1 from 02_daily_guidance.html) */}
      <section className="flex flex-col gap-6 sm:gap-7" aria-label="Chỉ Dẫn Hàng Ngày">
        <div className="p-4 sm:p-5">
          <div
            role="button"
            tabIndex={0}
            aria-label="Nhấn giữ để nhận chỉ dẫn hôm nay"
            onMouseDown={() => setIsHoldingGuidance(true)}
            onMouseUp={() => setIsHoldingGuidance(false)}
            onMouseLeave={() => setIsHoldingGuidance(false)}
            onTouchStart={() => setIsHoldingGuidance(true)}
            onTouchEnd={() => setIsHoldingGuidance(false)}
            onClick={handleCompleteTodayGuidanceDraw}
            className="relative w-full scale-100 cursor-pointer touch-none select-none overflow-hidden rounded-2xl bg-transparent text-left shadow-lg shadow-stone-900/20 outline-none ring-1 ring-black/10 transition-[transform,filter] duration-150 ease-out hover:brightness-[1.03] active:brightness-[0.98]"
          >
            <img
              alt=""
              className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
              decoding="async"
              src="/yilore-assets/mainpage-bg.png"
            />
            <div
              className="pointer-events-none absolute inset-y-0 left-0 z-[4] overflow-hidden rounded-2xl"
              style={{ width: `${holdProgress}%` }}
              aria-hidden="true"
            >
              <div className="h-full w-full min-w-[1px] bg-gradient-to-b from-white/30 to-white/15" />
            </div>
            <div className="relative z-10 flex min-h-[148px] items-start gap-3 px-5 pb-5 pt-4 sm:min-h-[160px] sm:gap-4 sm:px-6 sm:pt-5">
              <div className="pointer-events-none flex min-w-0 flex-1 flex-col items-stretch justify-start [text-shadow:0_1px_10px_rgba(0,0,0,0.45)]">
                <p className="font-serif text-[0.8125rem] font-normal leading-normal text-white/90 sm:text-sm">
                  24 Tháng 10 · Ngày 15 tháng 9 Âm lịch · Ngày Tân Mùi (辛未)
                </p>
                <p className="mt-3 font-serif text-3xl font-normal leading-[1.15] tracking-tight text-white sm:mt-4 sm:text-4xl md:text-[2.75rem] md:leading-[1.12]">
                  {todayGuidanceRecord
                    ? `${todayGuidanceRecord.guaName} · ${todayGuidanceRecord.cardTitle}`
                    : isHoldingGuidance
                    ? `Đang cảm ứng quẻ... ${holdProgress}%`
                    : "Nhấn giữ để nhận chỉ dẫn hôm nay"}
                </p>
              </div>
              <div className="pointer-events-none shrink-0 self-start pt-0.5 drop-shadow-[0_4px_14px_rgba(0,0,0,0.45)]">
                <img
                  alt=""
                  width="96"
                  height="96"
                  className="h-[88px] w-[88px] object-contain opacity-[0.92] sm:h-[96px] sm:w-[96px]"
                  src="/yilore-assets/icon4.png"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Selected Day's Drawn Card & Follow-up Q&A */}
        {selectedDateGuidanceRecord && (
          <div className="mx-4 grid grid-cols-1 gap-6 rounded-2xl border border-stone-200/80 bg-white/95 p-5 shadow-sm sm:mx-5 md:grid-cols-12">
            <div className="flex flex-col items-center justify-center md:col-span-5">
              <div
                onClick={() => setIsDailyCardFlipped((v) => !v)}
                className="group relative aspect-[3/4.3] w-56 cursor-pointer overflow-hidden rounded-2xl border border-stone-200 shadow-md transition-transform duration-300 hover:scale-[1.02]"
              >
                <img
                  src={
                    isDailyCardFlipped
                      ? selectedDateGuidanceRecord.backImageUrl
                      : selectedDateGuidanceRecord.frontImageUrl
                  }
                  alt={selectedDateGuidanceRecord.guaName}
                  className="h-full w-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => setIsDailyCardFlipped((v) => !v)}
                className="mt-2.5 inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800"
              >
                <RotateCw className="h-3.5 w-3.5" />
                <span>Chạm vào thẻ để lật ({isDailyCardFlipped ? "Mặt sau" : "Mặt trước"})</span>
              </button>
            </div>

            <div className="flex flex-col justify-between space-y-4 md:col-span-7">
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-amber-50 px-3 py-0.5 text-xs font-medium text-amber-900 ring-1 ring-amber-200">
                    {selectedDateGuidanceRecord.dayBadge}
                  </span>
                  <span className="text-xs text-stone-400">{selectedDateGuidanceRecord.drawnDate}</span>
                </div>
                <h2 className="mt-2 font-serif text-xl font-semibold text-stone-900 sm:text-2xl">
                  {selectedDateGuidanceRecord.guaName} · {selectedDateGuidanceRecord.cardTitle}
                </h2>
                <div className="mt-1 text-xs text-stone-500">Quẻ từ: {selectedDateGuidanceRecord.guaCi}</div>
                <p className="mt-3 rounded-xl bg-stone-50 p-3.5 text-sm leading-relaxed text-stone-800">
                  {selectedDateGuidanceRecord.dailyGuidanceVi || selectedDateGuidanceRecord.dailyGuidance}
                </p>
              </div>

              <div className="space-y-3 border-t border-stone-200/70 pt-3">
                <div className="text-xs font-medium text-stone-600">
                  Bạn muốn hỏi thêm điều gì về ngày {selectedDateGuidanceRecord.drawnDate}?
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {YILORE_DAILY_QUESTIONS.slice(0, 4).map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => handleAskDailyFollowup(q)}
                      className="rounded-full border border-stone-200 bg-stone-50/80 px-2.5 py-1 text-[11px] text-stone-600 transition hover:border-stone-400 hover:bg-white hover:text-stone-900"
                    >
                      {q}
                    </button>
                  ))}
                </div>

                {selectedDateGuidanceRecord.followupHistory.length > 0 && (
                  <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                    {selectedDateGuidanceRecord.followupHistory.map((f) => (
                      <div key={f.id} className="rounded-xl bg-stone-50 p-3 text-xs ring-1 ring-stone-200/70">
                        <div className="font-semibold text-stone-900">Hỏi: {f.question}</div>
                        <div className="mt-1 leading-relaxed text-stone-600">
                          {renderInlineMarkdown(f.answer)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={dailyFollowupInput}
                    onChange={(e) => setDailyFollowupInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAskDailyFollowup(dailyFollowupInput);
                    }}
                    placeholder="Đặt câu hỏi tiếp theo về quẻ ngày..."
                    className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-800 outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleAskDailyFollowup(dailyFollowupInput)}
                    className="shrink-0 rounded-xl bg-stone-900 px-4 py-2 text-xs font-medium text-white hover:bg-stone-800"
                  >
                    Gửi
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

// ============================================================================
// VIEW 2: CHAT (/en/app/chat) — 1:1 DOM & Assets
// ============================================================================
interface ChatViewProps {
  conversations: YiloreConversation[];
  activeConversation: YiloreConversation;
  setActiveConvId: (id: string) => void;
  handleStartNewChat: () => void;
  setConversations: React.Dispatch<React.SetStateAction<YiloreConversation[]>>;
  historyRecords: YiloreReadingRecord[];
  relationships: YiloreRelationshipProfile[];
  setSelectedHistoryRecord: (r: YiloreReadingRecord) => void;
  chatInput: string;
  setChatInput: (v: string) => void;
  handleSendChatMessage: (customText?: string, forceCast?: boolean) => void;
  handleDrawQuickLot: () => void;
  isCastingInChat: boolean;
  showReadingPicker: boolean;
  setShowReadingPicker: React.Dispatch<React.SetStateAction<boolean>>;
  showPeoplePicker: boolean;
  setShowPeoplePicker: React.Dispatch<React.SetStateAction<boolean>>;
  setActiveRoute: (r: any) => void;
}

export const YiloreChatView: React.FC<ChatViewProps> = ({
  conversations,
  activeConversation,
  setActiveConvId,
  handleStartNewChat,
  setConversations,
  historyRecords,
  relationships,
  setSelectedHistoryRecord,
  chatInput,
  setChatInput,
  handleSendChatMessage,
  handleDrawQuickLot,
  isCastingInChat,
  showReadingPicker,
  setShowReadingPicker,
  showPeoplePicker,
  setShowPeoplePicker,
  setActiveRoute,
}) => {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden lg:flex-row">
      {/* Left 200px Conversation Sidebar (1:1 from function L in 0ib.3e8tnanrm.js) */}
      <aside className="hidden min-h-0 w-[200px] shrink-0 flex-col overflow-hidden border-r border-stone-200 bg-white font-serif lg:flex lg:flex-col">
        <ul className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain p-2 pt-2 [scrollbar-gutter:stable]">
          <li className="mb-1 shrink-0">
            <button
              type="button"
              onClick={handleStartNewChat}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2.5 text-left text-[15px] leading-relaxed text-stone-800 transition hover:bg-stone-50"
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-stone-300 bg-white text-lg font-light leading-none text-stone-700"
                aria-hidden="true"
              >
                +
              </span>
              <span className="min-w-0 font-medium">Cuộc trò chuyện mới</span>
            </button>
          </li>

          {conversations.map((conv) => {
            const isSelected = conv.id === activeConversation?.id;
            return (
              <li
                key={conv.id}
                className={`relative mb-1 rounded-lg ${isSelected ? "bg-amber-50" : "hover:bg-stone-50"}`}
              >
                <div className="group relative flex items-start">
                  <button
                    type="button"
                    onClick={() => setActiveConvId(conv.id)}
                    className={`min-w-0 flex-1 rounded-b-none rounded-t-lg pb-0 pl-2 pr-9 pt-2 text-left text-[15px] leading-snug transition ${
                      isSelected ? "font-semibold text-amber-950" : "font-normal text-stone-700"
                    }`}
                  >
                    <span className="line-clamp-2">{conv.title || "Cuộc trò chuyện mới"}</span>
                  </button>
                  {conversations.length > 1 && (
                    <button
                      type="button"
                      aria-label="Xóa cuộc trò chuyện"
                      title="Xóa cuộc trò chuyện"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConversations((prev) => prev.filter((c) => c.id !== conv.id));
                      }}
                      className="absolute right-1 top-1.5 rounded-md p-1.5 text-stone-400 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                    >
                      <TrashIcon />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setActiveConvId(conv.id)}
                  className="w-full rounded-b-lg rounded-t-none px-2 pb-1.5 pt-0 text-left text-[10px] font-normal leading-none text-stone-400 transition hover:text-stone-500"
                >
                  {conv.updatedAt}
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Main Chat Stream */}
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-4 sm:p-6">
        <div className="mx-auto flex min-h-0 w-full min-w-0 max-w-6xl flex-1 flex-col gap-3 pb-0 lg:min-h-[420px]">
          <header className="flex min-w-0 w-full shrink-0 flex-col gap-1.5 border-b border-stone-200 pb-3">
            <h1 className="flex min-w-0 flex-1 items-baseline gap-2 font-serif font-semibold text-stone-900">
              <span className="min-w-0 truncate text-2xl leading-snug">{activeConversation?.title}</span>
              <span className="shrink-0 whitespace-nowrap text-[11px] font-normal leading-none tabular-nums text-stone-400">
                {activeConversation?.updatedAt}
              </span>
            </h1>

            {/* Context Chips (#... / @...) */}
            <div className="mt-1 flex min-w-0 w-full max-w-full flex-nowrap items-center gap-1.5 overflow-x-auto py-0.5">
              {activeConversation?.activeReportIds.map((rid) => {
                const rec = historyRecords.find((r) => r.readingId === rid);
                return (
                  <div key={rid} className="group relative inline-flex max-w-full shrink-0">
                    <button
                      type="button"
                      onClick={() => rec && setSelectedHistoryRecord(rec)}
                      className="mx-0.5 inline-flex shrink-0 cursor-pointer select-none items-center whitespace-nowrap rounded-full border border-stone-200/90 bg-stone-100 px-3 py-0.5 font-serif text-[0.9375rem] font-semibold leading-snug text-stone-900 shadow-sm transition-colors hover:bg-stone-200/85"
                    >
                      #{rec ? rec.question : "…"}
                    </button>
                  </div>
                );
              })}
            </div>
          </header>

          {/* Messages Scroll Area */}
          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
            <div className="flex min-h-0 flex-1 flex-col bg-gradient-to-b from-stone-50/90 to-stone-100/50">
              <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-3 pb-36 sm:p-4 sm:pb-40">
                <div className="mt-auto w-full space-y-3">
                  {activeConversation?.messages.map((m) => (
                    <React.Fragment key={m.id}>
                      <div
                        className={`flex flex-col gap-0.5 ${
                          m.role === "user" ? "items-end" : "items-start"
                        }`}
                      >
                        <div
                          className={
                            m.role === "user"
                              ? "ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-stone-900 px-4 py-3 text-[15px] leading-relaxed text-white"
                              : "mr-auto max-w-[85%] rounded-2xl rounded-bl-md border border-stone-200 bg-[#E1E5E5] px-4 py-3 text-[15px] leading-relaxed text-stone-900 shadow-sm"
                          }
                        >
                          <div className="min-w-0 whitespace-pre-line break-words font-serif text-[15px] leading-relaxed">
                            {renderInlineMarkdown(m.content)}
                          </div>
                        </div>
                        {m.role === "assistant" && (
                          <span className="self-start px-1 text-[10px] text-stone-400">{m.timestamp}</span>
                        )}
                      </div>

                      {/* Quick Lot Card inside Chat (1:1 from chat HTML) */}
                      {m.quickLot && (
                        <div className="flex flex-col items-start gap-1">
                          <div className="mr-auto flex w-full min-w-0 max-w-[min(calc(100%-5rem),20rem)] items-start gap-2">
                            <button
                              type="button"
                              className="relative min-h-[168px] w-full cursor-pointer overflow-hidden text-left outline-none transition"
                              style={{
                                borderRadius: "12px 12px 12px 2px",
                                boxShadow: "rgba(0, 0, 0, 0.06) 0px 1px 2px",
                              }}
                            >
                              <div className="absolute inset-0 bg-[#2A2E2E]">
                                <img
                                  alt=""
                                  className="h-full w-full object-cover object-center"
                                  src={m.quickLot.frontUrl}
                                />
                              </div>
                              <div
                                className="pointer-events-none absolute inset-0"
                                style={{
                                  background:
                                    "linear-gradient(rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.6) 100%)",
                                }}
                                aria-hidden="true"
                              />
                              <div
                                className="pointer-events-none absolute inset-0 border border-white/25"
                                style={{ borderRadius: "12px 12px 12px 2px" }}
                                aria-hidden="true"
                              />
                              <div className="relative z-[1] flex min-h-[168px] h-full flex-col px-4 py-2">
                                <div className="min-h-2 shrink-0" aria-hidden="true" />
                                <p
                                  className="text-center font-serif text-[18px] leading-snug text-white"
                                  style={{ lineHeight: 1.35 }}
                                >
                                  {m.quickLot.cardTitle} - {m.quickLot.guaName}
                                </p>
                                <div className="flex shrink-0 items-center justify-center py-2.5">
                                  <img
                                    alt=""
                                    className="h-20 w-auto max-w-[min(100%,14rem)] object-contain"
                                    src={
                                      m.quickLot.luckTier === "下签"
                                        ? "/yilore-assets/xiaqian.svg"
                                        : m.quickLot.luckTier === "上签"
                                        ? "/yilore-assets/shangqian.svg"
                                        : "/yilore-assets/zhongqian.svg"
                                    }
                                  />
                                </div>
                                <p
                                  className="line-clamp-2 text-center font-serif text-[12px] leading-relaxed text-white/70 sm:line-clamp-3"
                                  style={{ lineHeight: 1.5 }}
                                >
                                  {m.quickLot.guaCi}
                                </p>
                                <div className="min-h-2 shrink-0" aria-hidden="true" />
                              </div>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 6-Line Divination 4-Card Fan + Report Card inside Chat (1:1 from chat HTML) */}
                      {m.divinationRecord && (
                        <>
                          <div className="flex flex-col items-start gap-1">
                            <div className="max-w-[min(100%,36rem)] rounded-bl-sm rounded-br-xl rounded-tl-xl rounded-tr-xl border border-[#DCE0E0] bg-[#E1E5E5] px-3.5 py-3 font-serif shadow-sm">
                              <div className="flex gap-0 overflow-x-auto pb-1 pt-1">
                                <button
                                  type="button"
                                  onClick={() => setSelectedHistoryRecord(m.divinationRecord!)}
                                  className="relative mr-2 h-[134px] w-[100px] shrink-0 overflow-hidden rounded-[10px] border-2 border-white bg-stone-200 shadow-sm"
                                  style={{ transform: "rotate(-4deg)" }}
                                >
                                  <img
                                    alt="Bản quái"
                                    className="h-full w-full object-cover object-center"
                                    src={m.divinationRecord.benGua.frontUrl}
                                  />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setSelectedHistoryRecord(m.divinationRecord!)}
                                  className="relative mr-2 h-[134px] w-[100px] shrink-0 overflow-hidden rounded-[10px] border-2 border-white bg-stone-200 shadow-sm"
                                  style={{ transform: "rotate(4deg)" }}
                                >
                                  <img
                                    alt="Chi quái"
                                    className="h-full w-full object-cover object-center"
                                    src={m.divinationRecord.zhiGua.frontUrl}
                                  />
                                </button>
                              </div>
                              <div className="my-2.5 h-px bg-black/[0.04]" />
                              <div className="flex items-center gap-2">
                                <span
                                  className="shrink-0 rounded-md px-2 py-1 text-[13px] font-medium text-white shadow-md"
                                  style={{
                                    background: "linear-gradient(rgb(70, 71, 71), rgb(50, 51, 51))",
                                    boxShadow: "rgba(0, 0, 0, 0.25) 0px 2px 4px",
                                  }}
                                >
                                  Quẻ tượng
                                </span>
                                <span className="min-w-0 flex-1 truncate text-[13px] leading-snug text-stone-700">
                                  {m.divinationRecord.benGua.name} → {m.divinationRecord.zhiGua.name}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-start gap-1">
                            <button
                              type="button"
                              onClick={() => setSelectedHistoryRecord(m.divinationRecord!)}
                              className="max-w-[min(100%,28rem)] rounded-bl-sm rounded-br-xl rounded-tl-xl rounded-tr-xl border border-[#DCE0E0] text-left shadow-sm"
                              style={{
                                backgroundImage:
                                  "linear-gradient(to top, rgb(228, 235, 235), rgb(240, 244, 245)), radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.35), transparent 55%)",
                              }}
                            >
                              <div className="space-y-2 px-4 py-3.5">
                                <p className="line-clamp-2 font-serif text-[15px] font-semibold leading-snug text-stone-900">
                                  {m.divinationRecord.summaryHighlight}
                                </p>
                                <p className="font-serif text-[11px] leading-snug text-stone-400 sm:text-xs">
                                  {m.divinationRecord.createdAt}
                                </p>
                                <div className="h-px bg-black/[0.04]" />
                                <div className="flex items-center gap-2">
                                  <span
                                    className="shrink-0 rounded-md px-2 py-1 font-serif text-[13px] font-medium text-white shadow-md"
                                    style={{
                                      background: "linear-gradient(rgb(70, 71, 71), rgb(50, 51, 51))",
                                      boxShadow: "rgba(0, 0, 0, 0.25) 0px 2px 4px",
                                    }}
                                  >
                                    Báo cáo
                                  </span>
                                  <span className="min-w-0 flex-1 truncate font-serif text-[13px] leading-snug text-stone-600">
                                    {m.divinationRecord.question}
                                  </span>
                                  <span className="shrink-0 font-serif text-sm text-stone-400" aria-hidden="true">
                                    ›
                                  </span>
                                </div>
                              </div>
                            </button>
                          </div>
                        </>
                      )}
                    </React.Fragment>
                  ))}

                  {isCastingInChat && (
                    <div className="py-2 text-center font-serif text-xs text-stone-500">
                      Đang gieo quẻ Lục Hào và luận giải...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Bottom Chat Action Pills & Composer (1:1 from chat HTML) */}
          <div
            className="fixed bottom-0 left-0 right-0 z-40 min-w-0 lg:left-[200px] xl:left-[calc(13rem+200px)]"
            style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
          >
            <div className="min-w-0 bg-gradient-to-b from-stone-200/25 via-stone-50/88 to-stone-100/95 backdrop-blur-xl">
              <div className="mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-1.5 px-4 pb-2 pt-1.5 sm:px-6 sm:pb-3 sm:pt-2">
                {showReadingPicker && (
                  <div className="mb-1 rounded-xl border border-stone-200 bg-white p-2.5 text-xs shadow-sm">
                    <div className="mb-1.5 font-medium text-stone-700">Chọn báo cáo quẻ đã gieo (#):</div>
                    <div className="flex flex-wrap gap-1.5">
                      {historyRecords.map((r) => (
                        <button
                          key={r.readingId}
                          type="button"
                          onClick={() => {
                            setShowReadingPicker(false);
                            handleSendChatMessage(`📜 Hãy giúp tôi luận giải sâu hơn báo cáo quẻ #${r.question}`);
                          }}
                          className="rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-stone-700 hover:bg-stone-100"
                        >
                          #{r.question} ({r.benGua.name})
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {showPeoplePicker && (
                  <div className="mb-1 rounded-xl border border-stone-200 bg-white p-2.5 text-xs shadow-sm">
                    <div className="mb-1.5 font-medium text-stone-700">Chọn hồ sơ mối quan hệ (@):</div>
                    {relationships.length === 0 ? (
                      <button
                        type="button"
                        onClick={() => {
                          setShowPeoplePicker(false);
                          setActiveRoute("relationships");
                        }}
                        className="text-amber-800 underline"
                      >
                        + Thêm hồ sơ trong mục Hồ Sơ Quan Hệ trước
                      </button>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {relationships.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setShowPeoplePicker(false);
                              handleSendChatMessage(`💬 Hãy giúp tôi phân tích hợp bàn mối quan hệ với @${p.name}`);
                            }}
                            className="rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-stone-700 hover:bg-stone-100"
                          >
                            @{p.name} ({RELATION_LABELS_VI[p.relation] || p.relation})
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 5 Gradient Action Pills */}
                <div className="min-w-0 max-w-full overflow-x-auto pb-1 pt-0 [scrollbar-width:none]">
                  <div className="flex w-max min-w-full flex-nowrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleSendChatMessage(
                          chatInput || "✨ Hãy giúp tôi gieo một quẻ Kinh Dịch cho vấn đề hiện tại",
                          true
                        )
                      }
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#C5D0D0]/95 bg-gradient-to-b from-[#EBF0F0] to-[#DCE8E8]/95 px-3 py-2 text-[13px] font-medium leading-none text-[#1A1A1A] shadow-[0_1px_0_rgba(255,255,255,0.65)_inset] transition hover:brightness-[0.97] active:scale-[0.99]"
                    >
                      <svg
                        className="h-3.5 w-3.5 shrink-0 opacity-85"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                        />
                      </svg>
                      Xin gieo quẻ
                    </button>

                    <button
                      type="button"
                      onClick={handleDrawQuickLot}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#C5D0D0]/95 bg-gradient-to-b from-[#EBF0F0] to-[#DCE8E8]/95 px-3 py-2 text-[13px] font-medium leading-none text-[#1A1A1A] shadow-[0_1px_0_rgba(255,255,255,0.65)_inset] transition hover:brightness-[0.97] active:scale-[0.99]"
                    >
                      <svg
                        className="h-3.5 w-3.5 shrink-0 opacity-85"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                        />
                      </svg>
                      Rút xâm Kinh Dịch
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSendChatMessage("Khung giờ cát tường hôm nay của tôi là khi nào?")}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#C5D0D0]/95 bg-gradient-to-b from-[#EBF0F0] to-[#DCE8E8]/95 px-3 py-2 text-[13px] font-medium leading-none text-[#1A1A1A] shadow-[0_1px_0_rgba(255,255,255,0.65)_inset] transition hover:brightness-[0.97] active:scale-[0.99]"
                    >
                      Giờ cát tường
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowReadingPicker((v) => !v)}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#C5D0D0]/95 bg-gradient-to-b from-[#EBF0F0] to-[#DCE8E8]/95 px-3 py-2 text-[13px] font-medium leading-none text-[#1A1A1A] shadow-[0_1px_0_rgba(255,255,255,0.65)_inset] transition hover:brightness-[0.97] active:scale-[0.99]"
                    >
                      Luận giải quẻ
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowPeoplePicker((v) => !v)}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#C5D0D0]/95 bg-gradient-to-b from-[#EBF0F0] to-[#DCE8E8]/95 px-3 py-2 text-[13px] font-medium leading-none text-[#1A1A1A] shadow-[0_1px_0_rgba(255,255,255,0.65)_inset] transition hover:brightness-[0.97] active:scale-[0.99]"
                    >
                      Hợp bàn quan hệ
                    </button>
                  </div>
                </div>

                {/* Chat Composer Bar */}
                <div className="relative w-full min-w-0 max-w-full">
                  <div className="flex w-full min-w-0 max-w-full items-center gap-2 rounded-[1.2rem] bg-white/93 px-3 py-2 shadow-[0_6px_32px_-8px_rgba(28,25,23,0.16),0_1px_0_rgba(255,255,255,0.9)_inset] ring-1 ring-stone-200/65">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSendChatMessage();
                      }}
                      placeholder="Nhập tin nhắn… (@ người quen, # báo cáo quẻ; nhấn Enter để gửi)"
                      className="h-[2.5rem] w-full bg-transparent px-1 font-serif text-[0.9375rem] leading-snug text-stone-900 outline-none placeholder:text-stone-400/85"
                    />
                    <button
                      type="button"
                      aria-label="Gửi"
                      title="Gửi"
                      onClick={() => handleSendChatMessage()}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-600 text-white shadow-sm transition hover:bg-amber-500"
                    >
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="M22 2L11 13"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M22 2L15 22L11 13L2 9L22 2Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// ============================================================================
// VIEW 3: HISTORY (/en/app/history) — 1:1 DOM & 4-Card Fan
// ============================================================================
export const YiloreHistoryView: React.FC<{
  historyRecords: YiloreReadingRecord[];
  onSelectRecord: (rec: YiloreReadingRecord) => void;
}> = ({ historyRecords, onSelectRecord }) => {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col px-1 pb-14 pt-2 sm:px-2 sm:pt-4">
      <header className="border-b border-stone-200 pb-8 pl-[15px]">
        <h1 className="font-serif text-2xl font-semibold leading-snug text-stone-900">
          Lịch sử gieo quẻ
        </h1>
        <p className="mt-3 max-w-2xl font-serif text-[17px] leading-relaxed text-[#1A1A1A]/60">
          Tất cả các bài luận giải hoàn chỉnh của bạn đều được lưu trữ tại đây.
        </p>
      </header>

      <div className="mt-6 w-full">
        <ul className="grid grid-cols-1 gap-4 px-[15px] sm:grid-cols-2 xl:grid-cols-3">
          {historyRecords.map((rec) => (
            <li key={rec.readingId} className="min-w-0">
              <button
                type="button"
                onClick={() => onSelectRecord(rec)}
                className="block w-full max-w-full cursor-pointer overflow-visible text-left transition hover:brightness-[0.99]"
                style={{
                  padding: "18px",
                  borderRadius: "12px",
                  background: "linear-gradient(to right bottom, rgb(255, 255, 255), rgb(237, 232, 227))",
                  border: "0.5px solid rgba(0, 0, 0, 0.05)",
                  boxShadow:
                    "rgba(0, 0, 0, 0.04) 0px 1px 1px, rgba(0, 0, 0, 0.06) 0px 2px 4px, rgba(0, 0, 0, 0.04) 0px 4px 10px",
                }}
              >
                <div className="flex flex-row items-stretch" style={{ gap: "16px" }}>
                  <div
                    className="min-w-0 flex-1"
                    style={{ display: "flex", flexDirection: "column", gap: "8px" }}
                  >
                    <p className="line-clamp-5 font-serif text-lg font-semibold leading-snug tracking-tight text-stone-900 sm:text-xl">
                      {rec.question}
                    </p>
                    <p className="line-clamp-5 font-serif text-base font-normal leading-relaxed tracking-normal text-stone-900 sm:text-lg sm:leading-[1.6]">
                      {rec.summaryHighlight}
                    </p>
                  </div>

                  {/* Exact 4-Card Layered Fan from history HTML */}
                  <div
                    className="flex min-h-0 shrink-0 flex-col items-end justify-center self-stretch"
                    style={{ width: "100px", paddingRight: "8px" }}
                  >
                    <div
                      className="relative isolate shrink-0 overflow-visible"
                      style={{ width: "100px", minHeight: "155px" }}
                    >
                      <div
                        className="pointer-events-none absolute"
                        style={{
                          zIndex: 1,
                          left: "50px",
                          top: "87.4px",
                          transform: "translate(-50%, -50%) rotate(0deg) translate(0px)",
                        }}
                      >
                        <img
                          alt=""
                          style={{
                            width: "75px",
                            maxWidth: "75px",
                            borderRadius: "18px",
                            border: "2px solid rgb(255, 255, 255)",
                            boxShadow: "rgba(0, 0, 0, 0.2) 0px 1px 3px",
                            display: "block",
                          }}
                          src={rec.zhiGua.frontUrl}
                        />
                      </div>
                      <div
                        className="pointer-events-none absolute"
                        style={{
                          zIndex: 2,
                          left: "50px",
                          top: "71.4px",
                          transform: "translate(-50%, -50%) rotate(-15deg) translate(-25px)",
                        }}
                      >
                        <img
                          alt=""
                          style={{
                            width: "75px",
                            maxWidth: "75px",
                            borderRadius: "18px",
                            border: "2px solid rgb(255, 255, 255)",
                            boxShadow: "rgba(0, 0, 0, 0.2) 0px 1px 3px",
                            display: "block",
                          }}
                          src={rec.benGua.frontUrl}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// ============================================================================
// VIEW 4: MEMORY (/en/app/memory-management) — 1:1 DOM from 05_memory.html
// ============================================================================
export const YiloreMemoryView: React.FC<{
  memoryPrefs: { useChartProfile: boolean; usePastContext: boolean; notes: string };
  setMemoryPrefs: React.Dispatch<
    React.SetStateAction<{ useChartProfile: boolean; usePastContext: boolean; notes: string }>
  >;
  onSaveToast: (msg: string) => void;
}> = ({ memoryPrefs, setMemoryPrefs, onSaveToast }) => {
  return (
    <div className="mx-auto max-w-3xl font-serif text-stone-900">
      <header className="border-b border-stone-200 pb-8">
        <h1 className="text-2xl font-semibold leading-snug text-stone-900">Quản lý bộ nhớ</h1>
        <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-[#1A1A1A]/60">
          Kiểm soát những thông tin mà Cửu Nhị có thể sử dụng khi bạn trò chuyện hoặc gieo quẻ trên web.
        </p>
      </header>

      <div className="mt-10 space-y-12">
        <section aria-labelledby="memory-prefs-heading">
          <h2
            id="memory-prefs-heading"
            className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-500"
          >
            Tùy chọn cá nhân hóa
          </h2>
          <div className="mt-3 divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:px-5 sm:py-5">
              <div className="min-w-0 flex-1 space-y-1">
                <label
                  htmlFor="memory-oracle-personal"
                  className="block text-[15px] font-medium text-[#1A1A1A]"
                >
                  Sử dụng lá số Bát Tự &amp; hồ sơ mệnh lý của tôi
                </label>
                <p className="text-[15px] leading-relaxed text-[#1A1A1A]/65">
                  Khi bật, các phần luận giải quẻ và trò chuyện sẽ kết hợp dữ liệu Bát Tự / Hà Lạc Lý Số đã lưu của bạn. Tự động lưu ngay khi bạn thay đổi.
                </p>
              </div>
              <div className="flex shrink-0 items-center sm:pt-0.5">
                <input
                  id="memory-oracle-personal"
                  type="checkbox"
                  checked={memoryPrefs.useChartProfile}
                  onChange={(e) => {
                    setMemoryPrefs((p) => ({ ...p, useChartProfile: e.target.checked }));
                    onSaveToast("Đã lưu tùy chọn sử dụng lá số & hồ sơ mệnh lý.");
                  }}
                  className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/35"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:px-5 sm:py-5">
              <div className="min-w-0 flex-1 space-y-1">
                <label
                  htmlFor="memory-use-history"
                  className="block text-[15px] font-medium text-[#1A1A1A]"
                >
                  Sử dụng ngữ cảnh các quẻ đã gieo trước đây
                </label>
                <p className="text-[15px] leading-relaxed text-[#1A1A1A]/65">
                  Được ghi nhớ ngay trên trình duyệt này, giúp hệ thống liên kết mạch câu chuyện và lịch sử luận giải của bạn.
                </p>
              </div>
              <div className="flex shrink-0 items-center sm:pt-0.5">
                <input
                  id="memory-use-history"
                  type="checkbox"
                  checked={memoryPrefs.usePastContext}
                  onChange={(e) => {
                    setMemoryPrefs((p) => ({ ...p, usePastContext: e.target.checked }));
                    onSaveToast("Đã lưu tùy chọn sử dụng ngữ cảnh lịch sử gieo quẻ.");
                  }}
                  className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/35"
                />
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="memory-notes-heading">
          <h2
            id="memory-notes-heading"
            className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-500"
          >
            Ghi chú dành cho Cửu Nhị
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSaveToast("Đã lưu ghi chú dành cho Cửu Nhị.");
            }}
            className="mt-3 rounded-lg border border-stone-200 bg-white p-5 shadow-sm sm:p-6"
          >
            <label htmlFor="memory-user-tags" className="block text-[15px] font-medium text-[#1A1A1A]">
              Những điều khác bạn muốn Cửu Nhị ghi nhớ về bạn
            </label>
            <textarea
              id="memory-user-tags"
              name="user_tags"
              rows={6}
              value={memoryPrefs.notes}
              onChange={(e) => setMemoryPrefs((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Ví dụ: Tôi đang khởi nghiệp trong lĩnh vực công nghệ và cần cân bằng giữa công việc với gia đình."
              className="mt-2 w-full resize-y rounded-lg border border-black/10 bg-white/90 px-3 py-2.5 text-[15px] leading-relaxed text-stone-900 shadow-sm outline-none ring-0 placeholder:text-stone-500 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/25"
            />
            <div className="mt-5 flex flex-wrap items-center justify-end gap-3 border-t border-stone-100 pt-5">
              <button
                type="submit"
                className="inline-flex min-h-[2.5rem] items-center justify-center rounded-lg bg-stone-900 px-5 text-[15px] font-medium text-white shadow-sm transition hover:bg-stone-800"
              >
                Lưu ghi chú
              </button>
            </div>
          </form>
        </section>

        <p className="border-t border-stone-200 pt-8 text-[15px] leading-relaxed text-[#1A1A1A]/60">
          Bạn càng chia sẻ cụ thể tại đây, các câu trả lời và lời khuyên sẽ càng sát với hoàn cảnh thực tế của bạn. Bạn có thể thay đổi bất cứ lúc nào.
        </p>
      </div>
    </div>
  );
};

// ============================================================================
// VIEW 5: PROFILE (/en/app/profile) — 1:1 DOM from profile HTML
// ============================================================================
export const YiloreProfileView: React.FC<{
  profile: YiloreUserProfile;
  onOpenEdit: () => void;
}> = ({ profile, onOpenEdit }) => {
  const PILLAR_LABELS = ["Trụ Năm", "Trụ Tháng", "Trụ Ngày", "Trụ Giờ"] as const;
  const DAYUN_LABELS: Record<"previous" | "current" | "next", string> = {
    previous: "Đại vận trước",
    current: "Đại vận hiện tại",
    next: "Đại vận kế tiếp",
  };

  return (
    <div className="flex w-full flex-col items-stretch pb-14 pt-2 sm:pt-4">
      <section className="mb-4 w-full min-w-0" aria-label="Tóm tắt hồ sơ">
        <h1 className="sr-only">Hồ sơ cá nhân</h1>
        <div className="flex flex-col gap-3 rounded-[14px] border border-[#1A1A1A]/10 bg-white px-4 py-3.5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5 sm:py-3">
          <p className="min-w-0 flex-1 font-serif text-[16px] leading-snug text-[#1A1A1A] sm:text-[17px]">
            <span className="font-semibold">{profile.userName}</span>
            <span className="font-normal text-[#1A1A1A]/45"> · </span>
            <span className="font-normal text-[#1A1A1A]/80">
              {profile.gender === "male" ? "Nam" : "Nữ"} · {profile.birthDate} ·{" "}
              {String(profile.birthHour).padStart(2, "0")}:00 · {profile.birthplace}
            </span>
          </p>
          <button
            type="button"
            onClick={onOpenEdit}
            className="shrink-0 self-start rounded-[14px] bg-[#1A1A1A] px-4 py-2 font-serif text-[15px] leading-snug text-white transition hover:bg-[#333] active:scale-[0.99] sm:self-auto"
          >
            Chỉnh sửa
          </button>
        </div>
      </section>

      <div className="w-full min-w-0">
        <div className="grid w-full min-w-0 grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">
          {/* Card 1: Bazi & major cycles */}
          <div>
            <article className="w-full rounded-2xl text-left">
              <div className="relative overflow-hidden rounded-2xl border border-stone-300/95 bg-gradient-to-br from-white via-amber-50/35 to-stone-100/90 p-4 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_1px_2px_rgba(28,25,23,0.06),0_10px_28px_-8px_rgba(28,25,23,0.14)] ring-1 ring-stone-900/[0.04] sm:p-6">
                <p className="mb-4 font-serif text-[0.8125rem] font-normal leading-normal text-stone-600 sm:mb-5 sm:text-sm">
                  Bát Tự &amp; Đại Vận
                </p>
                <div className="relative z-10 text-[15px] leading-relaxed text-stone-800">
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {PILLAR_LABELS.map((label, idx) => {
                      const gz = profile.bazi[idx] || "壬申";
                      const s = gz[0] || "壬";
                      const b = gz[1] || "申";
                      return (
                        <div key={label} className="flex flex-col gap-1">
                          <span className="font-serif text-xs text-stone-500 sm:text-[13px]">
                            {label}
                          </span>
                          <div className="flex items-center justify-center gap-0 font-serif text-lg font-semibold leading-none sm:text-xl">
                            <span style={{ color: YILORE_STEM_COLORS[s] || "#1c1917" }}>{s}</span>
                            <span style={{ color: YILORE_STEM_COLORS[b] || "#1c1917" }}>{b}</span>
                          </div>
                          <span className="font-serif text-[11px] font-medium text-stone-600">
                            {formatGanZhiVi(gz)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-5 space-y-2 border-t border-stone-200/70 pt-4">
                    <div className="grid grid-cols-3 gap-1.5 text-center">
                      {(["previous", "current", "next"] as const).map((key) => {
                        const item = profile.dayun[key];
                        const isCurrent = key === "current";
                        const s = item.ganZhi[0] || "癸";
                        const b = item.ganZhi[1] || "丑";
                        return (
                          <div
                            key={key}
                            className={
                              isCurrent
                                ? "rounded-lg bg-white/70 px-1 py-2 shadow-[0_1px_2px_rgba(28,25,23,0.06)] ring-1 ring-stone-200/90"
                                : "rounded-lg px-1 py-2"
                            }
                          >
                            <span
                              className={`font-serif text-[10px] ${
                                isCurrent ? "font-semibold text-stone-800" : "text-stone-500"
                              }`}
                            >
                              {DAYUN_LABELS[key]}
                            </span>
                            <div className="mt-1 flex items-center justify-center gap-0 font-serif text-base font-semibold leading-none sm:text-lg">
                              <span style={{ color: YILORE_STEM_COLORS[s] || "#1c1917" }}>{s}</span>
                              <span style={{ color: YILORE_STEM_COLORS[b] || "#1c1917" }}>{b}</span>
                            </div>
                            <div className="mt-0.5 font-serif text-[11px] font-medium text-stone-600">
                              {formatGanZhiVi(item.ganZhi)}
                            </div>
                            <div className="mt-0.5 font-serif text-[11px] text-stone-500">
                              {item.startAge}–{item.endAge} tuổi
                            </div>
                            <div className="font-serif text-[10px] text-stone-400">
                              {item.startYear}–{item.endYear}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <p className="font-serif text-xs leading-relaxed text-stone-500">
                      {profile.dayun.startDescription
                        ? profile.dayun.startDescription.startsWith("Khởi vận")
                          ? profile.dayun.startDescription
                          : `Khởi vận: ${profile.dayun.startDescription}`
                        : ""}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          </div>

          {/* Card 2: Destiny hexagram */}
          <div>
            <article className="w-full rounded-2xl text-left">
              <div className="relative overflow-hidden rounded-2xl border border-stone-300/95 bg-gradient-to-br from-white via-amber-50/35 to-stone-100/90 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_1px_2px_rgba(28,25,23,0.06),0_10px_28px_-8px_rgba(28,25,23,0.14)] ring-1 ring-stone-900/[0.04]">
                <div
                  className="pointer-events-none absolute bottom-0 left-0 right-0 z-[1] h-28 translate-x-3 translate-y-7 pl-[calc(0.5rem+2px+0.75rem)] opacity-[0.22] sm:left-[140px] sm:right-0 sm:h-40 sm:translate-x-6 sm:translate-y-10 sm:pl-4 sm:opacity-[0.2]"
                  aria-hidden="true"
                >
                  <img
                    alt=""
                    decoding="async"
                    className="h-full w-full scale-x-[-1] object-contain object-right-bottom"
                    src="/yilore-assets/mountain.svg"
                  />
                </div>
                <div className="relative z-10 grid gap-0 sm:grid-cols-[minmax(0,140px)_1fr]">
                  <div className="relative aspect-video overflow-hidden bg-stone-900/5 sm:aspect-auto sm:min-h-[min(200px,42vw)]">
                    <img
                      alt="Mệnh quái"
                      className="h-full w-full object-cover"
                      decoding="async"
                      src={profile.destinyHexagram.frontImageUrl || "/assets/oss/18/18a.webp"}
                    />
                  </div>
                  <div className="relative flex min-h-0 flex-1 flex-col justify-center p-4 sm:min-h-[168px] sm:p-5">
                    <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-3 sm:gap-4">
                      <div className="flex min-w-0 flex-col gap-1 sm:gap-1.5">
                        <p className="min-w-0 font-serif text-[0.8125rem] font-normal leading-normal text-stone-600 sm:text-sm">
                          Mệnh Quái Tiên Thiên (Hà Lạc)
                        </p>
                        <div className="min-w-0">
                          <h2 className="font-serif text-xl font-semibold leading-snug tracking-tight text-stone-900 sm:text-2xl">
                            <span style={{ color: "rgb(49, 81, 44)" }}>
                              {profile.destinyHexagram.archetypeTitle}
                            </span>
                            <span className="text-stone-500"> · </span>
                            <span>{profile.destinyHexagram.hexagramNameEn}</span>
                          </h2>
                        </div>
                      </div>
                      <p className="line-clamp-6 whitespace-pre-wrap font-serif text-base font-normal leading-relaxed tracking-normal text-stone-900 sm:text-lg sm:leading-[1.65]">
                        {profile.destinyHexagram.descriptionVi || profile.destinyHexagram.descriptionEn}
                      </p>
                      <div className="flex flex-wrap gap-2 pt-0.5">
                        {(profile.destinyHexagram.traitsVi || profile.destinyHexagram.traitsEn).map((t) => (
                          <span
                            key={t}
                            className="rounded-full border border-stone-200/95 bg-white/85 px-2.5 py-1 font-serif text-xs text-stone-700 shadow-[0_1px_2px_rgba(28,25,23,0.06)]"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>

          {/* Card 3: Yuan tang */}
          <div>
            <article className="w-full rounded-2xl text-left">
              <div className="relative overflow-hidden rounded-2xl border border-stone-300/95 bg-gradient-to-br from-white via-amber-50/35 to-stone-100/90 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_1px_2px_rgba(28,25,23,0.06),0_10px_28px_-8px_rgba(28,25,23,0.14)] ring-1 ring-stone-900/[0.04]">
                <div
                  className="pointer-events-none absolute bottom-0 left-0 right-0 z-[1] h-28 translate-x-3 translate-y-7 pl-[calc(0.5rem+2px+0.75rem)] opacity-[0.22] sm:left-[140px] sm:right-0 sm:h-40 sm:translate-x-6 sm:translate-y-10 sm:pl-4 sm:opacity-[0.2]"
                  aria-hidden="true"
                >
                  <img
                    alt=""
                    decoding="async"
                    className="h-full w-full scale-x-[-1] object-contain object-right-bottom"
                    src="/yilore-assets/mountain.svg"
                  />
                </div>
                <div className="relative z-10 grid gap-0 sm:grid-cols-[minmax(0,140px)_1fr]">
                  <div className="relative aspect-video overflow-hidden bg-stone-900/5 sm:aspect-auto sm:min-h-[min(200px,42vw)]">
                    <img
                      alt="Hào Nguyên Đường"
                      className="h-full w-full object-cover"
                      decoding="async"
                      src={profile.yuanTang.frontImageUrl || "/assets/oss/53/53-6a.webp"}
                    />
                  </div>
                  <div className="relative flex min-h-0 flex-1 flex-col justify-center p-4 sm:min-h-[168px] sm:p-5">
                    <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-3 sm:gap-4">
                      <div className="flex min-w-0 flex-col gap-1 sm:gap-1.5">
                        <p className="min-w-0 font-serif text-[0.8125rem] font-normal leading-normal text-stone-600 sm:text-sm">
                          Hào Nguyên Đường
                        </p>
                        <div className="min-w-0">
                          <h2 className="font-serif text-lg font-semibold leading-snug tracking-tight text-stone-900 sm:text-xl">
                            <span>{profile.yuanTang.lineTextVi || profile.yuanTang.lineTextEn}</span>
                          </h2>
                          <p className="mt-1.5 font-serif text-sm font-normal text-stone-600">
                            Kịch Bản Nhân Sinh (Hà Lạc Lý Số)
                          </p>
                        </div>
                      </div>
                      <p className="line-clamp-6 whitespace-pre-wrap font-serif text-base font-normal leading-relaxed tracking-normal text-stone-900 sm:text-lg sm:leading-[1.65]">
                        {profile.lifeScript.verseVi || profile.lifeScript.verseZh}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>

          {/* Card 4: Day pillar */}
          <div>
            <article className="w-full rounded-2xl text-left">
              <div className="relative overflow-hidden rounded-2xl border border-stone-300/95 bg-gradient-to-br from-white via-amber-50/35 to-stone-100/90 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_1px_2px_rgba(28,25,23,0.06),0_10px_28px_-8px_rgba(28,25,23,0.14)] ring-1 ring-stone-900/[0.04]">
                <div
                  className="pointer-events-none absolute bottom-0 left-0 right-0 z-[1] h-28 translate-x-3 translate-y-7 pl-[calc(0.5rem+2px+0.75rem)] opacity-[0.22] sm:left-[140px] sm:right-0 sm:h-40 sm:translate-x-6 sm:translate-y-10 sm:pl-4 sm:opacity-[0.2]"
                  aria-hidden="true"
                >
                  <img
                    alt=""
                    decoding="async"
                    className="h-full w-full scale-x-[-1] object-contain object-right-bottom"
                    src="/yilore-assets/mountain.svg"
                  />
                </div>
                <div className="relative z-10 grid gap-0 sm:grid-cols-[minmax(0,140px)_1fr]">
                  <div className="relative aspect-video overflow-hidden bg-stone-900/5 sm:aspect-auto sm:min-h-[min(200px,42vw)]">
                    <img
                      alt={profile.dayPillarCard.ganZhi}
                      className="h-full w-full object-cover"
                      decoding="async"
                      src={profile.dayPillarCard.imageUrl || "/yilore-cards/rizhu/2.webp"}
                    />
                  </div>
                  <div className="relative flex min-h-0 flex-1 flex-col justify-center p-4 sm:min-h-[168px] sm:p-5">
                    <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-3 sm:gap-4">
                      <div className="flex min-w-0 flex-col gap-1 sm:gap-1.5">
                        <p className="min-w-0 font-serif text-[0.8125rem] font-normal leading-normal text-stone-600 sm:text-sm">
                          Nhật Trụ (Trụ Ngày)
                        </p>
                        <div className="min-w-0">
                          <h2 className="font-serif text-xl font-semibold leading-snug tracking-tight text-stone-900 sm:text-2xl">
                            <span>{profile.dayPillarCard.ganZhi}</span>
                          </h2>
                          <p className="mt-1.5 font-serif text-sm font-normal text-stone-600">
                            {profile.dayPillarCard.archetypeVi || profile.dayPillarCard.archetypeZh}
                          </p>
                        </div>
                      </div>
                      <p className="line-clamp-6 whitespace-pre-wrap font-serif text-base font-normal leading-relaxed tracking-normal text-stone-900 sm:text-lg sm:leading-[1.65]">
                        {profile.dayPillarCard.poeticLineVi || profile.dayPillarCard.poeticLineZh}
                      </p>
                      <div className="flex flex-wrap gap-2 pt-0.5">
                        {(profile.dayPillarCard.tagsVi || profile.dayPillarCard.tagsZh).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-stone-200/95 bg-white/85 px-2.5 py-1 font-serif text-xs text-stone-700 shadow-[0_1px_2px_rgba(28,25,23,0.06)]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// VIEW 6: RELATIONSHIPS (/en/app/relationships) — 1:1 DOM from relationships HTML
// ============================================================================
export const YiloreRelationshipsView: React.FC<{
  relationships: YiloreRelationshipProfile[];
  onAddNew: () => void;
  onEdit: (rel: YiloreRelationshipProfile) => void;
  onDelete: (id: string) => void;
  onOpenSynastryInChat: (rel: YiloreRelationshipProfile) => void;
}> = ({ relationships, onAddNew, onEdit, onDelete, onOpenSynastryInChat }) => {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-3 pb-12 pt-2 sm:px-4 sm:pt-4">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold leading-snug text-[#1A1A1A]">
            Hồ Sơ Quan Hệ
          </h1>
          <p className="mt-1 font-serif text-[17px] leading-relaxed text-[#1A1A1A]/60">
            Danh sách người thân, bạn bè, đối tác đã lưu; chạm vào một hồ sơ để chỉnh sửa hoặc xem hợp bàn.
          </p>
        </div>
        <button
          type="button"
          onClick={onAddNew}
          className="inline-flex items-center gap-1.5 rounded-[14px] bg-[#1A1A1A] px-4 py-2 font-serif text-[14px] text-white transition hover:bg-[#333]"
        >
          <Plus className="h-4 w-4" />
          <span>Thêm hồ sơ</span>
        </button>
      </header>

      {relationships.length === 0 ? (
        <div
          onClick={onAddNew}
          className="cursor-pointer rounded-[14px] border border-dashed border-[#1A1A1A]/15 bg-white/70 px-[18px] py-12 text-center transition hover:bg-white"
        >
          <p className="font-serif text-[17px] text-[#1A1A1A]/80">Chưa có hồ sơ mối quan hệ nào</p>
          <p className="mt-2 font-serif text-[17px] leading-relaxed text-[#1A1A1A]/60">
            Nhấn vào đây hoặc nút &ldquo;Thêm hồ sơ&rdquo; để lập lá số hợp bàn Bát Tự &amp; Kinh Dịch.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {relationships.map((rel) => (
            <div
              key={rel.id}
              className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-sm transition hover:border-stone-300"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-lg font-semibold text-stone-900">
                      {rel.name}
                    </span>
                    <span className="rounded-full bg-stone-100 px-2.5 py-0.5 font-serif text-xs text-stone-700">
                      {RELATION_LABELS_VI[rel.relation] || rel.relation}
                    </span>
                  </div>
                  <div className="mt-1 font-serif text-xs text-stone-500">
                    {rel.gender === "male" ? "Nam" : "Nữ"} · {rel.birthDate} {rel.birthTime} ·{" "}
                    {rel.birthCity}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onEdit(rel)}
                    title="Chỉnh sửa"
                    className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-900"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(rel.id)}
                    title="Xóa"
                    className="rounded-lg p-1.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-3 rounded-xl bg-stone-50 p-3 font-serif text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-stone-600">Bát Tự: {rel.bazi}</span>
                  <span className="font-semibold text-teal-800">
                    Độ hòa hợp {rel.compatibilityScore}%
                  </span>
                </div>
                <p className="mt-1.5 leading-relaxed text-stone-600">{rel.synastrySummary}</p>
              </div>

              <button
                type="button"
                onClick={() => onOpenSynastryInChat(rel)}
                className="mt-3 inline-flex items-center gap-1.5 font-serif text-xs font-medium text-amber-800 hover:underline"
              >
                <HeartHandshake className="h-3.5 w-3.5" />
                <span>Mở Luận Giải Hợp Bàn Trong Trò Chuyện</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
