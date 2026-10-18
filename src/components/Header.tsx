import React, { useState, useEffect, useRef } from "react";
import {
  Menu,
  X,
  Layers,
  History,
  BookOpen,
  Scroll,
  Palette,
  HardDrive,
  FileText,
  Table,
  Mail,
  ChevronDown,
  Compass,
  CalendarDays,
  Sun,
  Home,
  MessageSquare,
  Check,
  Music,
  Flame,
  User,
  Users,
  Crown,
  LogOut,
  ShieldCheck,
  Receipt,
  Lock,
  Type,
} from "lucide-react";
import { ZenAudioPlayer } from "./ZenAudioPlayer";
import { BrandLockup } from "./BrandMark";
import { AppUser } from "../services/authService";
import { MemberProfileModal } from "./MemberProfileModal";

export type NavTab =
  | "home"
  | "pricing"
  | "divination"
  | "manual"
  | "jiazi"
  | "calendar"
  | "hannhiet"
  | "detail"
  | "library"
  | "decks"
  | "history";

export type FontSizeId = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";

export interface FontSizeOption {
  id: FontSizeId;
  label: string;
  badge: string;
  sizePx: string;
  percent: string;
  desc: string;
}

export const FONT_SIZE_OPTIONS: FontSizeOption[] = [
  { id: "sm", label: "Chữ Nhỏ", badge: "A⁻", sizePx: "14px", percent: "88%", desc: "Gọn gàng, vừa vặn" },
  { id: "md", label: "Tiêu Chuẩn (100%)", badge: "A", sizePx: "16px", percent: "100%", desc: "Mặc định chuẩn ban đầu (100%)" },
  { id: "lg", label: "Chữ Lớn", badge: "A⁺", sizePx: "18px", percent: "113%", desc: "To rõ, dễ đọc kinh văn" },
  { id: "xl", label: "Rất Lớn", badge: "A⁺⁺", sizePx: "20.5px", percent: "128%", desc: "To rõ, thoáng đãng (128%)" },
  { id: "2xl", label: "Cực Đại", badge: "A³⁺", sizePx: "23.5px", percent: "147%", desc: "Chữ to vượt trội, xem từ xa" },
  { id: "3xl", label: "Siêu Lớn", badge: "A⁴⁺", sizePx: "27px", percent: "169%", desc: "Khổng lồ, nhìn rõ từng nét" },
  { id: "4xl", label: "Đại Tự Max", badge: "MAX", sizePx: "31px", percent: "194%", desc: "Cỡ cực đại tối đa, không cần kính" },
];

interface HeaderProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  hasActiveReading: boolean;
  historyCount: number;
  onOpenGooglePicker?: () => void;
  onOpenWorkspace?: (tab?: "docs" | "sheets" | "gmail" | "picker") => void;
  onOpenDailyHexagram?: () => void;
  currentUser?: AppUser | null;
  onOpenAuthModal?: (mode?: "login" | "register" | "upgrade") => void;
  onLogout?: () => void;
  onOpenAdminModal?: () => void;
  onShowToast?: (msg: string) => void;
}

interface TabConfig {
  id: NavTab;
  label: string;
  chinese: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  showOnlyIf?: boolean;
  vipOnly?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  hasActiveReading,
  historyCount,
  onOpenGooglePicker,
  onOpenWorkspace,
  onOpenDailyHexagram,
  currentUser,
  onOpenAuthModal,
  onLogout,
  onOpenAdminModal,
  onShowToast,
}) => {
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [isFontSizeMenuOpen, setIsFontSizeMenuOpen] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const navMenuRef = useRef<HTMLDivElement>(null);
  const fontSizeMenuRef = useRef<HTMLDivElement>(null);

  const [fontSize, setFontSize] = useState<FontSizeId>(() => {
    try {
      const saved = localStorage.getItem("cuunhi_font_size");
      // Giữ nguyên tỷ lệ phóng to nhỏ trước đó người dùng đã chọn
      if (saved && FONT_SIZE_OPTIONS.some((o) => o.id === saved)) {
        return saved as FontSizeId;
      }
    } catch {
      // fallback
    }
    return "md"; // Tỷ lệ mới vào lần đầu là 100% (md = 16px)
  });

  useEffect(() => {
    const opt = FONT_SIZE_OPTIONS.find((o) => o.id === fontSize) || FONT_SIZE_OPTIONS[1];
    try {
      document.documentElement.style.fontSize = opt.sizePx;
      localStorage.setItem("cuunhi_font_size", fontSize);
    } catch {
      // ignore
    }
  }, [fontSize]);

  const currentFontIndex = FONT_SIZE_OPTIONS.findIndex((o) => o.id === fontSize);
  const currentFontOption = FONT_SIZE_OPTIONS[currentFontIndex >= 0 ? currentFontIndex : 1];

  const handleDecreaseFontSize = () => {
    if (currentFontIndex > 0) {
      setFontSize(FONT_SIZE_OPTIONS[currentFontIndex - 1].id);
    }
  };

  const handleIncreaseFontSize = () => {
    if (currentFontIndex < FONT_SIZE_OPTIONS.length - 1) {
      setFontSize(FONT_SIZE_OPTIONS[currentFontIndex + 1].id);
    }
  };

  const handleSelectFontSize = (id: FontSizeId) => {
    setFontSize(id);
    setIsFontSizeMenuOpen(false);
  };

  // Listen to audio playing state to show subtle indicator on hamburger button
  useEffect(() => {
    const handleAudioState = (e: any) => {
      if (e.detail && typeof e.detail.isPlaying === "boolean") {
        setIsAudioPlaying(e.detail.isPlaying);
      }
    };
    window.addEventListener("zen-audio-state", handleAudioState);
    return () => window.removeEventListener("zen-audio-state", handleAudioState);
  }, []);

  // Close menus on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsNavMenuOpen(false);
        setIsWorkspaceMenuOpen(false);
        setIsFontSizeMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleOpenWorkspaceTab = (tab: "docs" | "sheets" | "gmail" | "picker") => {
    setIsWorkspaceMenuOpen(false);
    if (onOpenWorkspace) {
      onOpenWorkspace(tab);
    } else if (onOpenGooglePicker && tab === "picker") {
      onOpenGooglePicker();
    }
  };

  const tabs: TabConfig[] = [
    {
      id: "home",
      label: "Trang Chủ",
      chinese: "首頁",
      desc: "Phương pháp bốc bài I Ching Tarot & thông tin liên lạc Cửu Nhị",
      icon: Home,
    },
    {
      id: "pricing",
      label: "Báo Giá",
      chinese: "報價",
      desc: "Bảng giá dịch vụ phong thủy, mệnh lý & đặc quyền hội viên",
      icon: Receipt,
    },
    {
      id: "divination",
      label: "Bốc Quẻ",
      chinese: "起卦",
      desc: "Bói bài Kinh Dịch, Khổng Minh, Cỏ Thi, Mai Hoa, Tam Thức",
      icon: Layers,
    },
    {
      id: "manual",
      label: "Thuyết Minh",
      chinese: "說卦",
      desc: "Sách thuyết minh 64 quẻ dịch & thư viện bộ hình",
      icon: BookOpen,
      vipOnly: true,
    },
    {
      id: "jiazi",
      label: "Hoa Giáp (60)",
      chinese: "六十花甲",
      desc: "Lục Thập Hoa Giáp, nạp ảnh & Bát Tự Lục Nhâm",
      icon: Compass,
      vipOnly: true,
    },
    {
      id: "calendar",
      label: "Lịch Dụng Sự",
      chinese: "用事曆",
      desc: "Can Chi, Trực Nhật Tinh & 12 Giờ Tâm Ấn Phú",
      icon: CalendarDays,
      vipOnly: true,
    },
    {
      id: "hannhiet",
      label: "Hàn Nhiệt Mệnh",
      chinese: "寒熱命",
      desc: "Bát Tự Hàn Nhiệt Tô Dân Phong, Cửu Cung Phi Tinh & Vận Trình 2027",
      icon: Flame,
      vipOnly: true,
    },
    {
      id: "detail",
      label: "Quẻ Đã Bốc",
      chinese: "當前卦",
      desc: "Luận giải chi tiết quẻ dịch bạn vừa thỉnh",
      icon: Scroll,
      showOnlyIf: hasActiveReading,
    },
    {
      id: "history",
      label: "Lịch Sử Bói",
      chinese: "占卜記錄",
      desc: "Nhật ký và hồ sơ các lần gieo quẻ đã lưu",
      icon: History,
    },
  ];

  const currentTabObj = tabs.find((t) => t.id === currentTab) || tabs[0];
  const isVip = Boolean(currentUser?.isMember || currentUser?.isAdmin);

  const handleSelectTab = (tabId: NavTab) => {
    const targetTab = tabs.find((t) => t.id === tabId);
    if (targetTab?.vipOnly && !isVip) {
      setIsNavMenuOpen(false);
      if (!currentUser) {
        if (onShowToast) {
          onShowToast(`Phân hệ "${targetTab.label}" chỉ dành riêng cho Hội Viên VIP. Vui lòng đăng nhập!`);
        }
        if (onOpenAuthModal) onOpenAuthModal("login");
      } else {
        if (onShowToast) {
          onShowToast(`Phân hệ "${targetTab.label}" là đặc quyền dành cho Hội Viên VIP. Vui lòng nâng cấp VIP!`);
        }
        if (onOpenAuthModal) onOpenAuthModal("upgrade");
      }
      return;
    }
    onSelectTab(tabId);
    setIsNavMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0B0A08]/95">
      <div className="max-w-6xl mx-auto px-4 h-16 sm:h-[72px] flex items-center justify-between gap-3">
        {/* Logo: quẻ Càn với hào Cửu Nhị điểm son */}
        <button
          type="button"
          onClick={() => handleSelectTab("home")}
          className="cursor-pointer select-none min-w-0 hover:brightness-110 transition"
          title="Về Trang Chủ Cửu Nhị"
        >
          <BrandLockup markSize={38} />
        </button>

        {/* Hành động bên phải */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 justify-end">
          {/* Bộ điều khiển cỡ chữ: Lớn / Nhỏ */}
          <div className="relative" ref={fontSizeMenuRef}>
            <div
              className="flex items-center h-8 sm:h-9 rounded-[2px] border border-gold-700/60 bg-lacquer-900/90 p-0.5 shadow-inner"
              title="Chế độ cỡ chữ: Thu nhỏ / Phóng to chữ toàn trang"
            >
              <button
                type="button"
                onClick={handleDecreaseFontSize}
                disabled={currentFontIndex <= 0}
                aria-label="Thu nhỏ chữ"
                title={
                  currentFontIndex <= 0
                    ? "Đã ở cỡ nhỏ nhất"
                    : `Thu nhỏ chữ (${FONT_SIZE_OPTIONS[currentFontIndex - 1]?.label})`
                }
                className="w-6 sm:w-7 h-full flex items-center justify-center font-serif text-[11px] sm:text-xs font-bold text-gold-300 hover:text-gold-100 hover:bg-gold-500/15 disabled:opacity-25 disabled:hover:bg-transparent disabled:cursor-not-allowed rounded-[2px] transition cursor-pointer select-none"
              >
                A⁻
              </button>
              <button
                type="button"
                onClick={() => setIsFontSizeMenuOpen(!isFontSizeMenuOpen)}
                aria-label="Tùy chọn cỡ chữ"
                aria-expanded={isFontSizeMenuOpen}
                title="Nhấn để chọn cỡ chữ chi tiết (88%, 100%, 113%, 128%)"
                className={`px-1.5 sm:px-2 h-full flex items-center gap-1 text-[11px] font-sans font-medium transition cursor-pointer rounded-[2px] ${
                  isFontSizeMenuOpen
                    ? "bg-gold-500/20 text-gold-200"
                    : "text-gold-300 hover:text-gold-100 hover:bg-gold-500/10"
                }`}
              >
                <Type className="w-3.5 h-3.5 text-gold-400" />
                <span className="text-[10px] sm:text-[11px] font-mono tracking-tight text-gold-300">
                  {currentFontOption.percent}
                </span>
              </button>
              <button
                type="button"
                onClick={handleIncreaseFontSize}
                disabled={currentFontIndex >= FONT_SIZE_OPTIONS.length - 1}
                aria-label="Phóng to chữ"
                title={
                  currentFontIndex >= FONT_SIZE_OPTIONS.length - 1
                    ? "Đã ở cỡ lớn nhất"
                    : `Phóng to chữ (${FONT_SIZE_OPTIONS[currentFontIndex + 1]?.label})`
                }
                className="w-6 sm:w-7 h-full flex items-center justify-center font-serif text-[11px] sm:text-xs font-bold text-gold-300 hover:text-gold-100 hover:bg-gold-500/15 disabled:opacity-25 disabled:hover:bg-transparent disabled:cursor-not-allowed rounded-[2px] transition cursor-pointer select-none"
              >
                A⁺
              </button>
            </div>

            {/* Popover danh mục cỡ chữ chi tiết */}
            {isFontSizeMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]"
                  onClick={() => setIsFontSizeMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-72 royal-frame !outline-offset-[2px] shadow-[0_20px_50px_rgba(0,0,0,0.95)] z-50 p-3 bg-lacquer-950/98 backdrop-blur max-h-[75vh] overflow-y-auto">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-gold-700/40">
                    <div className="flex items-center gap-1.5 text-xs font-sans uppercase tracking-[0.14em] text-gold-400">
                      <Type className="w-3.5 h-3.5" />
                      <span>Cỡ chữ trang</span>
                    </div>
                    <span className="text-[10px] font-mono text-gold-500">
                      {currentFontOption.percent}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {FONT_SIZE_OPTIONS.map((opt) => {
                      const isSelected = opt.id === fontSize;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleSelectFontSize(opt.id)}
                          className={`w-full flex items-center justify-between px-2.5 py-2 text-left rounded-[2px] transition cursor-pointer group ${
                            isSelected
                              ? "bg-gold-500/15 border border-gold-500/40 text-gold-200"
                              : "hover:bg-white/[0.04] text-ivory-300 hover:text-ivory-100 border border-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className={`w-6 h-6 flex items-center justify-center font-serif font-bold text-xs rounded-[2px] border ${
                                isSelected
                                  ? "bg-gold-600/30 border-gold-500 text-gold-200"
                                  : "bg-lacquer-800 border-gold-800 text-gold-400 group-hover:border-gold-600"
                              }`}
                            >
                              {opt.badge}
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-xs font-medium">{opt.label}</span>
                                <span className="text-[10px] font-mono text-ivory-500">({opt.percent})</span>
                              </div>
                              <div className="text-[10px] text-ivory-500 truncate">{opt.desc}</div>
                            </div>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-gold-400 shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>

                  {fontSize !== "xl" && (
                    <button
                      type="button"
                      onClick={() => handleSelectFontSize("xl")}
                      className="w-full mt-2 pt-2 border-t border-gold-700/30 text-center text-[11px] text-gold-500 hover:text-gold-300 transition cursor-pointer"
                    >
                      Đặt lại cỡ mặc định (128%)
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {currentUser?.isAdmin && (
            <button
              type="button"
              onClick={() => onOpenAdminModal && onOpenAdminModal()}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-[11px] font-sans uppercase tracking-[0.14em] text-cinnabar-400 hover:text-[#E7A08F] border border-cinnabar-600/60 hover:border-cinnabar-400 rounded-[2px] transition-colors cursor-pointer"
              title="Mở Bảng Điều Khiển Quản Trị Viên (cuunhi): Quản lý tài khoản & phân quyền hệ thống"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Quản trị</span>
            </button>
          )}

          {currentUser ? (
            <div
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-2 pl-1 pr-1.5 py-1 border border-gold-700/60 hover:border-gold-400 bg-black/40 hover:bg-gold-950/40 rounded-xl transition-all cursor-pointer group shadow-xs select-none"
              title="Nhấn để xem thông tin Hội Viên, thời hạn và Đổi Mật Khẩu"
            >
              <span
                className={`w-7 h-7 flex items-center justify-center text-[11px] font-display font-bold rounded-lg ${
                  currentUser.isAdmin
                    ? "bg-cinnabar-600 text-[#F6E7D6] shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                    : currentUser.isMember
                    ? "bg-gradient-to-br from-[#C9A55A] to-[#8C6218] text-black font-bold border border-gold-400 shadow-[0_0_8px_rgba(201,165,90,0.4)]"
                    : "bg-gold-800 text-gold-300 border border-gold-700"
                }`}
              >
                {currentUser.isAdmin ? (
                  "🛡️"
                ) : currentUser.isMember ? (
                  "👑"
                ) : (
                  currentUser.name?.charAt(0).toUpperCase() || "•"
                )}
              </span>
              <span className="hidden xs:flex sm:flex flex-col leading-tight min-w-0">
                <span className="text-xs font-sans font-medium text-ivory-100 group-hover:text-gold-300 max-w-[90px] sm:max-w-[130px] truncate transition-colors">
                  {currentUser.name}
                </span>
                {currentUser.isAdmin ? (
                  <span className="text-[9px] uppercase tracking-[0.16em] text-cinnabar-400 font-bold">
                    Quản trị
                  </span>
                ) : currentUser.isMember ? (
                  <span className="text-[9px] uppercase tracking-[0.16em] text-gold-400 font-bold flex items-center gap-0.5">
                    <span>Hội viên VIP</span>
                  </span>
                ) : (
                  <span className="text-[9px] uppercase tracking-[0.16em] text-[#998772]">
                    Thành viên
                  </span>
                )}
              </span>
              {onLogout && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLogout();
                  }}
                  className="text-ivory-500 hover:text-cinnabar-400 p-1 cursor-pointer transition-colors"
                  title="Đăng xuất tài khoản"
                  aria-label="Đăng xuất"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={() => onOpenAuthModal && onOpenAuthModal("login")}
                className="px-1.5 sm:px-3 py-2 text-[11px] sm:text-xs font-sans uppercase tracking-[0.08em] sm:tracking-[0.14em] whitespace-nowrap text-ivory-300 hover:text-gold-300 transition-colors cursor-pointer"
                title="Đăng nhập tài khoản"
                aria-label="Đăng nhập"
              >
                <User className="w-4 h-4 sm:hidden" />
                <span className="hidden sm:inline">Đăng nhập</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenAuthModal && onOpenAuthModal("register")}
                className="royal-btn whitespace-nowrap !tracking-[0.08em] sm:!tracking-[0.08em] !px-2.5 sm:!px-4 !py-2 !text-[11px] sm:!text-xs"
                title="Đăng ký thành viên Cửu Nhị"
              >
                <Crown className="w-3.5 h-3.5 hidden sm:block" />
                <span>Đăng ký</span>
              </button>
            </div>
          )}

          {/* Nút danh mục */}
          <div className="relative" ref={navMenuRef}>
            <button
              type="button"
              onClick={() => setIsNavMenuOpen(!isNavMenuOpen)}
              className={`flex items-center gap-2 h-9 sm:h-10 px-2.5 sm:px-3.5 rounded-[2px] border transition-colors cursor-pointer ${
                isNavMenuOpen
                  ? "border-gold-400 text-gold-200 bg-gold-500/10"
                  : "border-gold-700/60 text-gold-300 hover:border-gold-500 hover:text-gold-200"
              }`}
              aria-label="Mở danh mục"
              aria-expanded={isNavMenuOpen}
              title="Danh mục các phân hệ & tiện ích"
            >
              {isNavMenuOpen ? <X className="w-4 h-4 shrink-0" /> : <Menu className="w-4 h-4 shrink-0" />}
              <span className="hidden md:inline text-xs font-sans uppercase tracking-[0.16em] max-w-[140px] truncate">
                {currentTabObj.label}
              </span>
              {isAudioPlaying && (
                <span title="Nhạc thiền đang phát" className="flex items-center">
                  <Music className="w-3.5 h-3.5 text-gold-500 animate-pulse" />
                </span>
              )}
              <ChevronDown
                className={`hidden sm:block w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${
                  isNavMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isNavMenuOpen && (
              <div
                className="fixed inset-0 z-40 bg-black/70 backdrop-blur-[2px]"
                onClick={() => setIsNavMenuOpen(false)}
              />
            )}

            {/* Bảng danh mục (giữ nguyên DOM để ZenAudioPlayer không bị ngắt nhạc khi đóng mở) */}
            <div
              className={`absolute right-0 mt-3 w-[min(22rem,calc(100vw-2rem))] royal-frame !outline-offset-[3px] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.95)] z-50 transition-all duration-200 max-h-[82vh] overflow-y-auto ${
                isNavMenuOpen
                  ? "opacity-100 translate-y-0 pointer-events-auto visible"
                  : "opacity-0 -translate-y-2 pointer-events-none invisible"
              }`}
            >
              <div className="px-5 pt-5 pb-4 flex items-start justify-between">
                <div>
                  <div className="royal-eyebrow !tracking-[0.3em] before:!hidden">Hệ thống Cửu Nhị</div>
                  <div className="font-display text-lg text-ivory-100 mt-1">玖貳學術 · Các phân hệ</div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNavMenuOpen(false)}
                  className="text-ivory-500 hover:text-gold-300 p-1 cursor-pointer"
                  title="Đóng menu"
                  aria-label="Đóng menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {currentUser && (
                <div
                  onClick={() => {
                    setIsNavMenuOpen(false);
                    setIsProfileModalOpen(true);
                  }}
                  className="mx-5 mb-3 p-3 border border-gold-700/60 bg-gold-950/30 hover:bg-gold-950/50 rounded-2xl cursor-pointer hover:border-gold-400 transition-colors flex items-center justify-between shadow-xs select-none"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow ${
                        currentUser.isAdmin
                          ? "bg-cinnabar-600 text-white"
                          : currentUser.isMember
                          ? "bg-gradient-to-br from-[#C9A55A] to-[#8C6218] text-black"
                          : "bg-gold-800 text-gold-300"
                      }`}
                    >
                      {currentUser.isAdmin ? "🛡️" : currentUser.isMember ? "👑" : "👤"}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-ivory-100 truncate">{currentUser.name}</div>
                      <div className="text-[10px] text-gold-400 flex items-center gap-1">
                        <span>
                          {currentUser.isAdmin
                            ? "Quản Trị Viên"
                            : currentUser.isMember
                            ? "⭐ Hội Viên VIP"
                            : "Thành Viên Thường"}
                        </span>
                        <span>•</span>
                        <span className="underline">Xem hạn & Đổi pass</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-gold-500 text-xs font-mono">→</span>
                </div>
              )}

              {currentUser?.isAdmin && (
                <div className="mx-5 mb-4 p-3 border border-cinnabar-600/50 bg-cinnabar-600/10">
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-cinnabar-400">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Quản trị (cuunhi)
                    </span>
                  </div>
                  <p className="text-[11px] text-ivory-300 mt-1">
                    Xem danh sách tài khoản, quản lý quyền hội viên VIP, xóa tài khoản.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsNavMenuOpen(false);
                      if (onOpenAdminModal) onOpenAdminModal();
                    }}
                    className="royal-btn w-full mt-2.5 !py-2 !text-[11px]"
                  >
                    Mở bảng điều khiển
                  </button>
                </div>
              )}

              {/* Tùy chỉnh cỡ chữ trong danh mục */}
              <div className="mx-5 mb-3 p-2.5 bg-lacquer-800/60 border border-gold-800/70 rounded-[2px]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] uppercase tracking-[0.16em] text-gold-400 font-sans flex items-center gap-1.5">
                    <Type className="w-3 h-3" />
                    Cỡ chữ trang
                  </span>
                  <span className="text-[10px] font-mono text-gold-500">{currentFontOption.label} ({currentFontOption.percent})</span>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {FONT_SIZE_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectFontSize(opt.id)}
                      className={`py-1 text-center rounded-[2px] border text-xs font-serif font-bold transition cursor-pointer ${
                        opt.id === fontSize
                          ? "bg-gold-500/20 border-gold-400 text-gold-200"
                          : "bg-lacquer-900/60 border-gold-800/60 text-ivory-400 hover:text-gold-300 hover:border-gold-700"
                      }`}
                      title={`${opt.label} (${opt.percent})`}
                    >
                      {opt.badge}
                    </button>
                  ))}
                </div>
              </div>

              {/* Danh sách phân hệ */}
              <nav className="px-2 pb-2">
                {tabs
                  .filter((tab) => tab.showOnlyIf === undefined || tab.showOnlyIf)
                  .map((tab) => {
                    const Icon = tab.icon;
                    const isActive = currentTab === tab.id;

                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => handleSelectTab(tab.id)}
                        className={`relative w-full flex items-center gap-3.5 px-3 py-2.5 text-left cursor-pointer group transition-colors ${
                          isActive ? "bg-gold-500/[0.08]" : "hover:bg-white/[0.03]"
                        }`}
                      >
                        {isActive && <span className="absolute left-0 top-2 bottom-2 w-px bg-gold-400" />}
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive ? "text-gold-400" : "text-gold-700 group-hover:text-gold-500"
                          }`}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-baseline gap-2 flex-wrap">
                            <span
                              className={`font-display text-[17px] leading-tight ${
                                isActive ? "text-gold-200" : "text-ivory-100"
                              }`}
                            >
                              {tab.label}
                            </span>
                            <span className="text-[11px] text-ivory-500 font-serif">{tab.chinese}</span>
                            {tab.vipOnly && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/40 inline-flex items-center gap-0.5 tracking-tight">
                                <Crown className="w-2.5 h-2.5 text-amber-400" />
                                VIP
                              </span>
                            )}
                          </span>
                          <span className="block text-[11px] text-ivory-500 truncate mt-0.5">{tab.desc}</span>
                        </span>
                        {tab.id === "detail" && hasActiveReading && (
                          <span className="w-1.5 h-1.5 rounded-full bg-gold-400 shrink-0" />
                        )}
                        {tab.id === "history" && historyCount > 0 && (
                          <span className="text-[10px] font-sans text-gold-500 tabular-nums shrink-0">
                            {historyCount}
                          </span>
                        )}
                        {tab.vipOnly && !isVip && (
                          <Lock className="w-3.5 h-3.5 text-amber-500/70 shrink-0" />
                        )}
                        {isActive && <Check className="w-3.5 h-3.5 text-gold-400 shrink-0" />}
                      </button>
                    );
                  })}
              </nav>

              {/* Tiện ích mỗi ngày */}
              <div className="mx-5 royal-rule text-[8px]">◆</div>
              <div className="px-5 py-4 space-y-2.5">
                <div className="text-[10px] font-sans uppercase tracking-[0.28em] text-gold-600">
                  Tiện ích tĩnh tâm
                </div>
                {onOpenDailyHexagram && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsNavMenuOpen(false);
                      onOpenDailyHexagram();
                    }}
                    className="w-full flex items-center gap-3 p-2.5 border border-gold-700/40 hover:border-gold-500/70 transition-colors group cursor-pointer text-left"
                    title="Xem Quẻ Ngày Kinh Dịch ngẫu nhiên mỗi ngày theo lịch dương kèm lời bình ngắn gọn"
                  >
                    <Sun className="w-4 h-4 text-gold-500 shrink-0 group-hover:rotate-45 transition-transform" />
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-base text-ivory-100 leading-tight">
                        Quẻ Ngày Kinh Dịch <span className="text-[11px] text-ivory-500 font-serif">今日一卦</span>
                      </span>
                      <span className="block text-[11px] text-ivory-500 truncate">
                        Bốc quẻ nhật khóa & lời khuyên cát hung
                      </span>
                    </span>
                  </button>
                )}
                <ZenAudioPlayer variant="menu-card" />
              </div>

              {/* Liên hệ & công cụ */}
              <div className="mx-5 royal-rule text-[8px]">◆</div>
              <div className="px-5 py-4 space-y-1">
                <a
                  href="https://zalo.me/g/vwzsqvnh3gdbzst2psyh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between py-2 text-xs text-ivory-300 hover:text-gold-300 transition-colors"
                  title="Tham gia nhóm Zalo Cửu Nhị: Giao lưu kinh nghiệm, giải quẻ & học thuật"
                >
                  <span className="flex items-center gap-2.5">
                    <Users className="w-3.5 h-3.5 text-gold-600" />
                    Nhóm Zalo Cửu Nhị · Giao lưu Dịch Lý
                  </span>
                  <span className="text-gold-600">→</span>
                </a>
                <a
                  href="https://zalo.me/0902853305"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between py-2 text-xs text-ivory-300 hover:text-gold-300 transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <MessageSquare className="w-3.5 h-3.5 text-gold-600" />
                    Zalo tư vấn · <span className="tabular-nums tracking-wide">090 285 3305</span>
                  </span>
                  <span className="text-gold-600">→</span>
                </a>
                {onOpenWorkspace && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsNavMenuOpen(false);
                      onOpenWorkspace("docs");
                    }}
                    className="w-full flex items-center justify-between py-2 text-xs text-ivory-300 hover:text-gold-300 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <FileText className="w-3.5 h-3.5 text-gold-600" />
                      Google Workspace (Docs/Sheets)
                    </span>
                    <span className="text-gold-600">→</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Đường chỉ vàng dưới header */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold-600/50 to-transparent" />

      {/* Modal Thông Tin Hội Viên & Đổi Mật Khẩu */}
      <MemberProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser || null}
        onShowToast={onShowToast}
        onOpenAdminModal={onOpenAdminModal}
        onOpenAuthModal={onOpenAuthModal}
        onLogout={onLogout}
      />
    </header>
  );
};
