import React, { useState, useRef, useEffect } from "react";
import { YILORE_12_HOURS_ENERGY } from "../../data/yiloreSeedData";
import { BrandMark } from "../BrandMark";

export type YiloreRouteId =
  | "ledger"
  | "daily-guidance"
  | "chat"
  | "history"
  | "memory"
  | "profile"
  | "relationships";

export type YiloreLang = "en" | "vi" | "zh";

export function renderInlineMarkdown(text?: string): React.ReactNode {
  if (!text) return null;
  // Strip surrogate-pair decorative emojis that render as [01F4DC] tofu in serif fonts on Windows Firefox
  const cleaned = text.replace(/^[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]\s*/gu, "");
  const parts = cleaned.split(/(\*\*[^*]+\*\*|\*[^*\n]+\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={idx} className="font-semibold text-current">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return (
        <em key={idx} className="italic">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}

export const YILORE_NAV_ITEMS: {
  id: YiloreRouteId;
  icon: "sun" | "chat" | "history" | "memory" | "user" | "people";
  labelEn: string;
  labelVi: string;
  labelZh: string;
}[] = [
  { id: "daily-guidance", icon: "sun", labelEn: "Chỉ Dẫn Hàng Ngày", labelVi: "Chỉ Dẫn Hàng Ngày", labelZh: "每日指引" },
  { id: "chat", icon: "chat", labelEn: "Trò Chuyện", labelVi: "Trò Chuyện", labelZh: "对话" },
  { id: "history", icon: "history", labelEn: "Lịch Sử Quẻ", labelVi: "Lịch Sử Quẻ", labelZh: "占卜记录" },
  { id: "memory", icon: "memory", labelEn: "Quản Lý Bộ Nhớ", labelVi: "Quản Lý Bộ Nhớ", labelZh: "记忆管理" },
  { id: "profile", icon: "user", labelEn: "Hồ Sơ Cá Nhân", labelVi: "Hồ Sơ Cá Nhân", labelZh: "个人档案" },
  { id: "relationships", icon: "people", labelEn: "Hồ Sơ Quan Hệ", labelVi: "Hồ Sơ Quan Hệ", labelZh: "关系档案" },
];

export const YiloreNavIcon: React.FC<{
  name: "sun" | "chat" | "history" | "memory" | "user" | "people";
  className?: string;
}> = ({ name, className = "h-5 w-5 shrink-0 text-stone-600" }) => {
  const strokeProps = {
    stroke: "currentColor",
    strokeWidth: 1.75,
    fill: "none",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "sun":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <circle cx="12" cy="12" r="4" {...strokeProps} />
          <path
            {...strokeProps}
            d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
          />
        </svg>
      );
    case "chat":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path {...strokeProps} d="M21 12a8 8 0 0 1-8 8H8l-5 3v-3a8 8 0 1 1 18-8Z" />
        </svg>
      );
    case "history":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path {...strokeProps} d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path {...strokeProps} d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
          <path {...strokeProps} d="M8 7h8M8 11h8" />
        </svg>
      );
    case "memory":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path {...strokeProps} d="M12 3a5 5 0 0 1 5 5v6a5 5 0 1 1-10 0V8a5 5 0 0 1 5-5Z" />
          <path {...strokeProps} d="M12 11v3" />
        </svg>
      );
    case "user":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <circle cx="12" cy="8" r="4" {...strokeProps} />
          <path {...strokeProps} d="M6 21v-1a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v1" />
        </svg>
      );
    case "people":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <circle cx="9" cy="7" r="3" {...strokeProps} />
          <path {...strokeProps} d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
          <circle cx="17" cy="7" r="2.5" {...strokeProps} />
          <path {...strokeProps} d="M21 21v-1.5a3 3 0 0 0-3-3h-1" />
        </svg>
      );
  }
};

export const CreditCoinIcon: React.FC<{ member?: boolean }> = ({ member = false }) => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0 opacity-90">
    <path
      d="M8 0.333008C12.2339 0.333184 15.6658 3.76607 15.666 8C15.6658 12.2339 12.2339 15.6658 8 15.666C3.76607 15.6658 0.333184 12.2339 0.333008 8C0.333184 3.76607 3.76607 0.333184 8 0.333008ZM9.17871 5.40723C8.52784 4.75635 7.47216 4.75635 6.82129 5.40723L5.40723 6.82129C4.75658 7.47218 4.75741 8.52694 5.4082 9.17773L6.82227 10.5928C7.47298 11.2428 8.52702 11.2428 9.17773 10.5928L10.5918 9.17773C11.2426 8.52694 11.2434 7.47218 10.5928 6.82129L9.17871 5.40723Z"
      fill={member ? "#CAAA6D" : "#78716c"}
    />
  </svg>
);

export const CopyIcon: React.FC<{ className?: string }> = ({ className = "text-current" }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.75" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);

export const GlobeIcon: React.FC<{ className?: string }> = ({ className = "h-4 w-4 shrink-0 text-stone-500" }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.75" />
    <path d="M2 12h20" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    <path
      d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z"
      stroke="currentColor"
      strokeWidth="1.75"
    />
  </svg>
);

export const TrashIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const TEN_GOD_TOP_LABELS = [
  "Chính Quan",
  "Chính Tài",
  "Chính Quan",
  "Thất Sát",
  "Chính Ấn",
  "Thiên Ấn",
  "Kiếp Tài",
  "Tỷ Kiên",
  "Thương Quan",
  "Thực Thần",
  "Thiên Tài",
  "Chính Tài",
];

// Exact 1:1 visual replica of ECharts Today's Energy Curve from 01_ledger_top.png
export const YiloreEnergyCurveChart: React.FC<{
  now: Date;
  currentBranchIndex: number;
}> = ({ now, currentBranchIndex }) => {
  const width = 600;
  const height = 184;
  const padLeft = 26;
  const padRight = 24;
  const topPlotY = 38;
  const bottomPlotY = 148;
  const plotHeight = bottomPlotY - topPlotY;
  const stepX = (width - padLeft - padRight) / 11;

  // Scores matching 01_ledger_top.png curve shape
  const scores = [52, 65, 52, 26, 78, 92, 26, 40, 100, 92, 65, 65];

  const points = YILORE_12_HOURS_ENERGY.map((item, idx) => {
    const score = scores[idx] ?? item.score;
    const x = padLeft + idx * stepX;
    const y = topPlotY + ((100 - score) / 100) * plotHeight;
    return {
      x,
      y,
      score,
      branch: item.branch,
      hour: item.hour,
      tenGodLabel: TEN_GOD_TOP_LABELS[idx] || item.tenGodVi,
      isPeak: score >= 90 || idx === 3 || idx === 6,
    };
  });

  // Smooth monotone cubic spline
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cx1 = p0.x + stepX * 0.45;
    const cy1 = p0.y;
    const cx2 = p1.x - stepX * 0.45;
    const cy2 = p1.y;
    d += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p1.x} ${p1.y}`;
  }

  const areaD = `${d} L ${points[points.length - 1].x} ${bottomPlotY} L ${points[0].x} ${bottomPlotY} Z`;

  // Continuous x position based on current time
  const hoursFloat = now.getHours() + now.getMinutes() / 60;
  // Map 23:00..22:59 across 0..11
  const shiftedHours = (hoursFloat + 1) % 24;
  const exactIndexFloat = Math.min(11, Math.max(0, shiftedHours / 2));
  const redLineX = padLeft + exactIndexFloat * stepX;

  const shortTimeLabel = now.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <div style={{ height: "184px", width: "100%", userSelect: "none", position: "relative" }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-[184px] w-full overflow-visible select-none"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="yiloreEchartsArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a8a29e" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#a8a29e" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Horizontal dashed grid lines */}
        <line
          x1={padLeft}
          y1={topPlotY}
          x2={width - padRight}
          y2={topPlotY}
          stroke="#e7e5e4"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
        <line
          x1={padLeft}
          y1={topPlotY + plotHeight * 0.5}
          x2={width - padRight}
          y2={topPlotY + plotHeight * 0.5}
          stroke="#e7e5e4"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
        <line
          x1={padLeft}
          y1={bottomPlotY}
          x2={width - padRight}
          y2={bottomPlotY}
          stroke="#d6d3d1"
          strokeWidth="1"
        />

        {/* 12 Ten Gods labels along the top */}
        {points.map((pt, idx) => (
          <text
            key={`tg-${idx}`}
            x={pt.x}
            y={15}
            textAnchor="middle"
            fill="#78716c"
            fontSize="8.2"
            fontFamily="'Lora', 'Be Vietnam Pro', 'Noto Serif TC', serif"
          >
            {pt.tenGodLabel}
          </text>
        ))}

        {/* Red Current Time Label + Vertical Dashed Line */}
        <text
          x={redLineX}
          y={29}
          textAnchor="middle"
          fill="#9a3412"
          fontSize="10.5"
          fontWeight="600"
          fontFamily="'Lora', 'Be Vietnam Pro', 'Noto Serif TC', serif"
        >
          {shortTimeLabel}
        </text>
        <line
          x1={redLineX}
          y1={34}
          x2={redLineX}
          y2={bottomPlotY}
          stroke="#9a3412"
          strokeWidth="1.25"
          strokeDasharray="3 3"
        />

        {/* Area Fill & Smooth Curve */}
        <path d={areaD} fill="url(#yiloreEchartsArea)" />
        <path d={d} fill="none" stroke="#a8a29e" strokeWidth="1.8" />

        {/* Data Nodes (Hollow circles matching ECharts) */}
        {points.map((pt, idx) => {
          const isRed = idx === currentBranchIndex || idx === 4 || idx === 5 || idx === 8 || idx === 9;
          return (
            <circle
              key={`node-${idx}`}
              cx={pt.x}
              cy={pt.y}
              r={idx === currentBranchIndex ? 3.5 : 3}
              fill="#ffffff"
              stroke={isRed ? "#9a3412" : "#a8a29e"}
              strokeWidth="1.6"
            />
          );
        })}

        {/* Bottom X-Axis Labels: Vietnamese Branch on top, 2-digit hour below (zero overlap) */}
        {points.map((pt, idx) => (
          <g key={`x-${idx}`}>
            <text
              x={pt.x}
              y={bottomPlotY + 16}
              textAnchor="middle"
              fill="#57534e"
              fontSize="10"
              fontWeight="500"
              fontFamily="'Lora', 'Be Vietnam Pro', 'Noto Serif TC', serif"
            >
              {pt.branch.split(" ")[0]}
            </text>
            <text
              x={pt.x}
              y={bottomPlotY + 29}
              textAnchor="middle"
              fill="#a8a29e"
              fontSize="9"
              fontFamily="'Lora', 'Be Vietnam Pro', 'Noto Serif TC', serif"
            >
              {pt.hour.split(":")[0]}h
            </text>
            {/* Axis tick */}
            <line
              x1={pt.x}
              y1={bottomPlotY}
              x2={pt.x}
              y2={bottomPlotY + 4}
              stroke="#d6d3d1"
              strokeWidth="1"
            />
          </g>
        ))}
      </svg>
    </div>
  );
};

interface YiloreDesktopSidebarProps {
  activeRoute: YiloreRouteId;
  setActiveRoute: (r: YiloreRouteId) => void;
  lang: YiloreLang;
  setLang: (l: YiloreLang) => void;
  userIdDisplay: string;
  userCredits?: number;
  userTierLabel?: string;
  onOpenCreditsModal: () => void;
  onExitToMainApp?: () => void;
  onShowToast?: (msg: string) => void;
}

export const YiloreDesktopSidebar: React.FC<YiloreDesktopSidebarProps> = ({
  activeRoute,
  setActiveRoute,
  lang,
  setLang,
  userIdDisplay,
  userCredits = 0,
  userTierLabel = "Chưa đăng ký",
  onOpenCreditsModal,
  onExitToMainApp,
  onShowToast,
}) => {
  const [copied, setCopied] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!langMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [langMenuOpen]);

  const handleCopyId = () => {
    navigator.clipboard?.writeText(userIdDisplay);
    setCopied(true);
    onShowToast?.(`Đã sao chép Mã ID: ${userIdDisplay}`);
    setTimeout(() => setCopied(false), 2000);
  };

  const langOptions: { code: YiloreLang; label: string }[] = [
    { code: "vi", label: "Tiếng Việt" },
    { code: "en", label: "English" },
    { code: "zh", label: "繁體中文" },
  ];

  return (
    <aside className="hidden min-h-0 w-52 shrink-0 flex-col border-r border-stone-200 bg-white/95 font-serif xl:flex">
      {/* Top Brand Logo -> Ledger (/en/app) */}
      <div className="flex shrink-0 items-center gap-2 border-b border-stone-200/90 px-3 py-3">
        <button
          type="button"
          onClick={() => setActiveRoute("ledger")}
          className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg p-1 text-left text-stone-900 transition hover:bg-stone-100"
          title="Sổ Tay Cửu Nhị"
        >
          <BrandMark size={36} className="shrink-0" />
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-[15px] font-semibold tracking-tight text-stone-900">Cửu Nhị</span>
            <span className="truncate text-[10px] font-medium tracking-[0.18em] text-stone-500">玖 貳 · 易 數</span>
          </div>
        </button>
      </div>

      {/* 6 Navigation Links */}
      <nav className="min-h-0 w-full flex-1 space-y-0.5 overflow-y-auto py-3 pl-2 pr-2">
        {YILORE_NAV_ITEMS.map((item) => {
          const isActive = activeRoute === item.id;
          const label = item.labelVi;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveRoute(item.id)}
              title={label}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                isActive ? "bg-amber-50 text-amber-950" : "text-stone-700 hover:bg-stone-100"
              }`}
            >
              <YiloreNavIcon name={item.icon} className="h-5 w-5 shrink-0 text-stone-600" />
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Footer: User ID, Language, Credits Card, Buy Credits, iOS/Android, Sign out */}
      <div className="mt-auto shrink-0 space-y-3 border-t border-stone-200/90 px-3 py-3">
        {/* User ID Row */}
        <div className="flex items-center justify-between gap-2 text-[11px] leading-tight">
          <span className="shrink-0 font-medium text-stone-600">Mã ID:</span>
          <div className="flex min-w-0 max-w-[58%] items-center justify-end gap-1">
            <span
              className="truncate font-mono text-[12px] font-semibold tracking-wide text-stone-900"
              title={userIdDisplay}
            >
              {copied ? "Đã chép" : userIdDisplay}
            </span>
            <button
              type="button"
              onClick={handleCopyId}
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-stone-500 transition hover:bg-stone-200/60 hover:text-stone-900 active:opacity-80"
              aria-label="Sao chép mã ID"
              title="Sao chép mã ID"
            >
              <CopyIcon />
            </button>
          </div>
        </div>

        {/* Language Selector */}
        <div ref={langRef} className="relative">
          <button
            type="button"
            onClick={() => setLangMenuOpen((v) => !v)}
            className="flex w-full items-center gap-2 rounded-lg py-1.5 text-left text-xs font-medium text-stone-700 transition-colors hover:bg-stone-100 hover:text-stone-900"
          >
            <GlobeIcon className="h-4 w-4 shrink-0 text-stone-500" />
            <span>Ngôn ngữ</span>
            <span className="ml-auto text-[11px] font-semibold text-stone-500">
              {langOptions.find((o) => o.code === lang)?.label || "Tiếng Việt"}
            </span>
          </button>

          {langMenuOpen && (
            <div className="absolute bottom-full left-0 z-50 mb-1 w-full overflow-hidden rounded-lg border border-stone-200 bg-white py-1 shadow-lg">
              {langOptions.map((opt) => (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => {
                    setLang(opt.code);
                    setLangMenuOpen(false);
                  }}
                  className={`flex w-full items-center px-3 py-1.5 text-left text-xs font-medium transition-colors ${
                    opt.code === lang
                      ? "bg-amber-50 text-amber-900"
                      : "text-stone-700 hover:bg-stone-50 hover:text-stone-900"
                  }`}
                >
                  {opt.label}
                  {opt.code === lang && (
                    <svg
                      className="ml-auto h-3.5 w-3.5 text-amber-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M20 6 9 17l-5-5"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* CreditsSidebarCard (variant="balancePanel") using /yilore-assets/credit-bg.svg */}
        <div
          onClick={onOpenCreditsModal}
          className="relative cursor-pointer overflow-hidden rounded-2xl transition hover:brightness-105"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
            style={{
              backgroundImage: 'url("/yilore-assets/credit-bg.svg")',
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
            }}
          />
          <div className="relative flex min-w-0 items-start justify-between gap-2 px-3 py-4">
            <div className="min-w-0 space-y-2">
              <div className="flex items-center gap-2 text-white/60">
                <CreditCoinIcon member={userTierLabel !== "Chưa đăng ký"} />
                <span className="text-[11px] font-medium leading-none">Tín dụng</span>
              </div>
              <p className="pl-0.5 text-[26px] font-bold leading-none tracking-tight text-white">{userCredits}</p>
            </div>
            <p className="shrink-0 bg-gradient-to-b from-white/90 to-white/60 bg-clip-text pt-1 text-[12px] font-normal leading-snug text-transparent">
              {userTierLabel}
            </p>
          </div>
        </div>

        {/* Buy credits · Member benefits */}
        <button
          type="button"
          onClick={onOpenCreditsModal}
          className="flex w-full items-center rounded-lg py-1.5 text-left text-xs font-medium text-stone-700 transition-colors hover:bg-stone-100 hover:text-stone-900"
        >
          Nạp tín dụng · Đặc quyền hội viên
        </button>

        {/* Sign out (or Return to main app) */}
        <button
          type="button"
          onClick={() => {
            if (onExitToMainApp) {
              onExitToMainApp();
            } else {
              onShowToast?.("Đã đăng xuất khỏi phiên Cửu Nhị.");
            }
          }}
          className="w-full rounded-full border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-800 transition hover:bg-stone-100"
          title="Đăng xuất"
        >
          Đăng xuất
        </button>
      </div>
    </aside>
  );
};

interface YiloreMobileHeaderProps {
  activeRoute: YiloreRouteId;
  setActiveRoute: (r: YiloreRouteId) => void;
  lang: YiloreLang;
  setLang?: (l: YiloreLang) => void;
  userIdDisplay?: string;
  isOpen?: boolean;
  setIsOpen?: (v: boolean) => void;
  onOpenCreditsModal?: () => void;
  onExitToMainApp?: () => void;
  onShowToast?: (msg: string) => void;
  onOpenSettings?: () => void;
  onOpenConvList?: () => void;
}

export const YiloreMobileHeader: React.FC<YiloreMobileHeaderProps> = ({
  activeRoute,
  setActiveRoute,
  onOpenCreditsModal,
  onExitToMainApp,
  onOpenSettings,
  onOpenConvList,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <div className="flex min-w-0 shrink-0 items-center gap-2 border-b border-stone-200 bg-white/95 px-3 py-0 font-serif xl:hidden">
        <button
          type="button"
          onClick={() => setActiveRoute("ledger")}
          className="flex shrink-0 items-center gap-2 rounded-md py-2 pl-0.5 pr-2 text-stone-900 transition-colors hover:bg-stone-50"
          title="Sổ Tay Cửu Nhị"
        >
          <BrandMark size={34} className="shrink-0" />
          <span className="whitespace-nowrap text-[15px] font-semibold tracking-tight">Cửu Nhị</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-stone-600 transition hover:bg-stone-100 md:hidden"
          aria-label="Trình đơn"
          title="Trình đơn"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
            <rect x="4" y="5" width="16" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
            <line x1="10" y1="5.5" x2="10" y2="18.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>

        <span className="hidden h-6 w-px shrink-0 bg-stone-200 md:block" aria-hidden="true" />

        <nav
          className="hidden min-w-0 flex-1 items-center gap-0.5 overflow-x-auto overscroll-x-contain py-1 md:flex [scrollbar-width:thin]"
          aria-label="Điều hướng"
        >
          {YILORE_NAV_ITEMS.map((item) => {
            const isActive = activeRoute === item.id;
            const label = item.labelVi;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveRoute(item.id)}
                className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-2.5 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-amber-950 underline decoration-amber-500 decoration-2 underline-offset-4"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                }`}
                title={label}
              >
                <YiloreNavIcon
                  name={item.icon}
                  className={`h-5 w-5 shrink-0 ${isActive ? "text-amber-800" : "text-stone-500"}`}
                />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1">
          {activeRoute === "chat" && onOpenConvList && (
            <button
              type="button"
              onClick={onOpenConvList}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-stone-600 transition hover:bg-stone-100 lg:hidden"
              aria-label="Danh sách hội thoại"
              title="Danh sách hội thoại"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                <path
                  d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              if (onOpenSettings) onOpenSettings();
              else if (onOpenCreditsModal) onOpenCreditsModal();
            }}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-stone-600 transition hover:bg-stone-100"
            aria-label="Cài đặt"
            title="Cài đặt"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
              <path
                d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.75" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Left Drawer */}
      {mobileMenuOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[250] bg-black/40"
            aria-label="Đóng"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-[260] flex w-[min(80vw,280px)] flex-col overflow-hidden border-r border-stone-200 bg-white font-serif shadow-xl">
            <div className="flex h-14 shrink-0 items-center gap-2 border-b border-stone-200 px-4">
              <button
                type="button"
                onClick={() => {
                  setActiveRoute("ledger");
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 text-stone-900"
              >
                <BrandMark size={34} className="shrink-0" />
                <span className="text-[15px] font-semibold tracking-tight">Cửu Nhị</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-full text-stone-500 transition hover:bg-stone-100"
                aria-label="Đóng"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                  <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
              {YILORE_NAV_ITEMS.map((item) => {
                const isActive = activeRoute === item.id;
                const label = item.labelVi;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveRoute(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                      isActive ? "bg-amber-50 text-amber-950" : "text-stone-700 hover:bg-stone-100"
                    }`}
                  >
                    <YiloreNavIcon name={item.icon} className="h-5 w-5 shrink-0 text-stone-600" />
                    <span>{label}</span>
                  </button>
                );
              })}
            </nav>
            {onExitToMainApp && (
              <div className="border-t border-stone-200 p-3">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onExitToMainApp();
                  }}
                  className="w-full rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-800 transition hover:bg-stone-100"
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </aside>
        </>
      )}
    </>
  );
};

// Exact Credit Usage Modal from 0ib.3e8tnanrm.js (function z)
export const YiloreCreditUsageModal: React.FC<{
  open?: boolean;
  isOpen?: boolean;
  onClose: () => void;
}> = ({ open, isOpen, onClose }) => {
  const visible = open ?? isOpen ?? false;
  if (!visible) return null;
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative mx-4 w-full max-w-sm overflow-hidden rounded-2xl bg-[#111518] font-serif text-sm shadow-2xl ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="font-semibold text-white">Sử Dụng Tín Dụng</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white"
            aria-label="Đóng"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="space-y-5 px-5 py-5">
          <div className="space-y-2.5">
            <p className="font-medium text-white">Chi Phí Tín Dụng</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                <span className="font-medium text-white/75">Gieo quẻ luận giải chuyên sâu: 50 tín dụng</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                <span className="font-medium text-white/75">Hỏi đáp tiếp theo Chỉ dẫn hàng ngày: 10 tín dụng</span>
              </div>
            </div>
          </div>
          <div className="space-y-2.5">
            <p className="font-medium text-white">Đặc Quyền Hội Viên</p>
            <div className="space-y-1.5">
              <div className="flex items-start gap-2.5">
                <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                <span className="font-medium leading-relaxed text-white/75">
                  Tặng 600 tín dụng miễn phí mỗi tháng, được cộng dồn và không bao giờ hết hạn
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                <span className="font-medium leading-relaxed text-white/75">
                  Hơn 100 tin nhắn mỗi ngày (chưa đăng ký hội viên: 8 tin nhắn/ngày)
                </span>
              </div>
            </div>
          </div>
          <p className="border-t border-white/10 pt-5 text-xs font-medium leading-relaxed text-white/55">
            Tài khoản Cửu Nhị đồng bộ lá số Bát Tự, lịch sử gieo quẻ và bộ nhớ cá nhân hóa xuyên suốt trên trình duyệt web của bạn.
          </p>
        </div>
        <div className="border-t border-white/10 px-5 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg bg-white/10 py-2 font-semibold text-white/85 transition hover:bg-white/15 hover:text-white"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
