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
} from "lucide-react";
import { ZenAudioPlayer } from "./ZenAudioPlayer";
import { AppUser } from "../services/authService";

export type NavTab =
  | "home"
  | "divination"
  | "manual"
  | "jiazi"
  | "calendar"
  | "detail"
  | "library"
  | "decks"
  | "history";

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
}

interface TabConfig {
  id: NavTab;
  label: string;
  chinese: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  showOnlyIf?: boolean;
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
}) => {
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const navMenuRef = useRef<HTMLDivElement>(null);

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
      desc: "Lời chào Cửu Nhị, bảng giá dịch vụ & đặc quyền hội viên",
      icon: Home,
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
    },
    {
      id: "jiazi",
      label: "Hoa Giáp (60)",
      chinese: "六十花甲",
      desc: "Lục Thập Hoa Giáp, nạp ảnh & Bát Tự Lục Nhâm",
      icon: Compass,
    },
    {
      id: "calendar",
      label: "Lịch Dụng Sự",
      chinese: "用事曆",
      desc: "Can Chi, Trực Nhật Tinh & 12 Giờ Tâm Ấn Phú",
      icon: CalendarDays,
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

  const handleSelectTab = (tabId: NavTab) => {
    onSelectTab(tabId);
    setIsNavMenuOpen(false);
  };

  return (
    <header className="border-b border-[#2C241B] bg-[#12100E]/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-2.5 sm:py-3 flex items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div
          onClick={() => handleSelectTab("home")}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none group"
          title="Về Trang Chủ Cửu Nhị"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#E2B755] to-[#75511A] flex items-center justify-center text-[#14120F] shadow-[0_0_15px_rgba(226,183,85,0.3)] border border-[#FFE28A] group-hover:scale-105 transition-transform shrink-0">
            <span className="text-lg sm:text-xl font-serif font-bold">☯</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-serif font-bold tracking-wide text-[#F3E7D0] flex items-center gap-1.5 sm:gap-2 leading-tight">
              <span>CỬU NHỊ</span>
              <span className="text-xs px-1.5 py-0.2 rounded bg-amber-950/80 text-[#FFE28A] border border-amber-600/50 font-serif font-normal">
                玖貳
              </span>
            </h1>
            <div className="text-[10px] text-[#A89882] font-serif tracking-wider truncate">
              Phong Thủy Mệnh Lý • Kinh Dịch
            </div>
          </div>
        </div>

        {/* Right Actions: Member / Login Button & Compact 3-bar Hamburger Menu */}
        <div className="flex items-center gap-2 justify-end">
          {/* NÚT QUẢN TRỊ ADMIN (Dành cho tài khoản cuunhi) */}
          {currentUser?.isAdmin && (
            <button
              type="button"
              onClick={() => onOpenAdminModal && onOpenAdminModal()}
              className="px-2.5 py-1.5 rounded-xl text-xs font-serif font-bold bg-gradient-to-r from-red-950 via-amber-950 to-amber-900 hover:from-red-900 hover:to-amber-800 text-[#FFE58F] border border-amber-500/90 shadow-[0_0_15px_rgba(245,158,11,0.35)] flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shrink-0"
              title="Mở Bảng Điều Khiển Quản Trị Viên (cuunhi): Quản lý tài khoản & phân quyền hệ thống"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden xs:inline">Quản Trị Admin</span>
              <span className="xs:hidden">Admin</span>
            </button>
          )}

          {/* Nút Đăng Ký Thành Viên / Đăng Nhập / Thông Tin Tài Khoản */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#24190F] border border-[#5A3F22] text-xs font-serif shadow-xs">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  currentUser.isAdmin
                    ? "bg-red-700 text-white border border-amber-400"
                    : "bg-gradient-to-br from-[#E2B755] to-[#75511A] text-[#14120F]"
                }`}
              >
                {currentUser.isAdmin ? "🛡️" : currentUser.isMember ? "👑" : "👤"}
              </div>
              <div className="flex items-center gap-1 text-[11px] leading-tight">
                <span className="font-bold text-[#FFE28A] max-w-[85px] sm:max-w-[120px] truncate">
                  {currentUser.name}
                </span>
                {currentUser.isAdmin ? (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-red-900 text-red-200 border border-red-500 font-bold shrink-0">
                    Admin
                  </span>
                ) : currentUser.isMember ? (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-600/60 font-semibold shrink-0">
                    Hội Viên
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onOpenAuthModal && onOpenAuthModal("upgrade")}
                    className="text-[9px] px-1.5 py-0.2 rounded bg-[#3A2412] hover:bg-[#4D3118] text-[#FFE28A] border border-[#7D5325] font-semibold cursor-pointer shrink-0"
                    title="Nâng cấp lên Hội Viên Thường Niên để đọc toàn văn thuyết minh và mở rộng tiện ích"
                  >
                    + VIP
                  </button>
                )}
              </div>
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="text-[#8C7A65] hover:text-rose-400 p-0.5 rounded cursor-pointer ml-0.5"
                  title="Đăng xuất tài khoản"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onOpenAuthModal && onOpenAuthModal("login")}
                className="px-2.5 py-1.5 rounded-xl text-xs font-serif font-bold text-[#E2C798] hover:text-[#FFF] bg-[#1E1710] hover:bg-[#2A1E14] border border-[#48331E] transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1"
                title="Đăng nhập tài khoản"
              >
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden xs:inline sm:inline">Đăng Nhập</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenAuthModal && onOpenAuthModal("register")}
                className="px-2.5 py-1.5 rounded-xl text-xs font-serif font-bold text-[#14100C] bg-gradient-to-r from-[#D4AF37] to-[#B38728] hover:from-[#FFE28A] hover:to-[#D4AF37] transition-all cursor-pointer shadow-md active:scale-95 flex items-center gap-1 border border-[#FFE28A]"
                title="Đăng ký thành viên Cửu Nhị"
              >
                <Crown className="w-3.5 h-3.5 text-amber-950" />
                <span>Đăng Ký</span>
              </button>
            </div>
          )}

          {/* ========================================================
              NÚT 3 GẠCH NGANG (HAMBURGER MENU) GỌN GÀNG CHỨA CÁC TAB & TIỆN ÍCH
              ======================================================== */}
          <div className="relative" ref={navMenuRef}>
            <button
              type="button"
              onClick={() => setIsNavMenuOpen(!isNavMenuOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-serif font-bold rounded-xl transition-all cursor-pointer shadow-md active:scale-95 border ${
                isNavMenuOpen
                  ? "bg-gradient-to-r from-[#D4AF37] to-[#B38728] text-[#14100C] border-[#FFE28A] shadow-[0_0_15px_rgba(212,175,55,0.35)]"
                  : "bg-gradient-to-r from-[#1E1711] to-[#2B1F14] hover:from-[#2B1F14] hover:to-[#382819] text-[#FFE28A] hover:text-white border-[#523E28] hover:border-[#D4AF37]"
              }`}
              aria-label="Danh mục 3 gạch ngang"
              title="Danh mục các phân hệ & tiện ích (3 gạch ngang)"
            >
              {/* 3 gạch ngang / Icon Menu */}
              {isNavMenuOpen ? (
                <X className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-current shrink-0" />
              ) : (
                <Menu className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-current shrink-0" />
              )}

              {/* Tên tab hiện tại */}
              <div className="flex items-center gap-1.5">
                <span className="hidden xs:inline sm:inline">Danh Mục:</span>
                <span className="px-1.5 py-0.5 rounded text-[11px] font-sans font-semibold bg-black/40 text-amber-200 border border-amber-700/40 truncate max-w-[105px] sm:max-w-[130px]">
                  {currentTabObj.label}
                </span>
              </div>

              {/* Chỉ báo nhạc thiền đang phát */}
              {isAudioPlaying && (
                <span
                  className="flex items-center gap-1 text-[10px] text-amber-300 font-sans px-1.5 py-0.5 rounded-full bg-amber-950/90 border border-amber-500/60 animate-pulse shrink-0"
                  title="Nhạc thiền đang phát"
                >
                  <Music className="w-3 h-3 text-amber-400" />
                  <span className="hidden md:inline">Nhạc Thiền</span>
                </span>
              )}

              {/* Mũi tên chỉ thị */}
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${
                  isNavMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Backdrop mờ để đóng khi bấm ra ngoài */}
            {isNavMenuOpen && (
              <div
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
                onClick={() => setIsNavMenuOpen(false)}
              />
            )}

            {/* Khung danh sách các Tab & 2 Ô Tiện Ích (giữ nguyên DOM để ZenAudioPlayer không bị ngắt nhạc khi đóng mở) */}
            <div
              className={`absolute right-0 mt-2 w-80 sm:w-92 bg-[#16120E] border border-[#4D3A24] rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.85)] p-2.5 z-50 transition-all duration-200 max-h-[85vh] overflow-y-auto space-y-2.5 ${
                isNavMenuOpen
                  ? "opacity-100 translate-y-0 pointer-events-auto visible"
                  : "opacity-0 -translate-y-2 pointer-events-none invisible"
              }`}
            >
              {/* Header của Popup Menu */}
              <div className="px-2.5 py-2 border-b border-[#2C2116] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 border border-amber-600/40 flex items-center justify-center text-xs font-serif font-bold">
                    ☰
                  </div>
                  <div>
                    <div className="text-xs font-serif font-bold text-[#F5EAD4] flex items-center gap-1.5">
                      <span>HỆ THỐNG CỬU NHỊ</span>
                      <span className="text-[10px] text-amber-400 font-serif">玖貳</span>
                    </div>
                    <div className="text-[10px] text-[#9E8B76]">
                      Tiện ích & phân hệ chuyển đổi nhanh
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsNavMenuOpen(false)}
                  className="text-[#8C7A65] hover:text-[#FFE28A] p-1 rounded-lg hover:bg-[#251D15] transition-colors cursor-pointer"
                  title="Đóng menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mục dành riêng cho Admin cuunhi trong menu */}
              {currentUser?.isAdmin && (
                <div className="bg-gradient-to-r from-red-950 via-[#2E180D] to-amber-950 border border-amber-500/80 rounded-xl p-2.5 space-y-1">
                  <div className="flex items-center justify-between text-xs font-serif font-bold text-[#FFE28A]">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-amber-300" />
                      <span>QUẢN TRỊ ADMIN (CUUNHI)</span>
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-red-900 text-red-200 border border-red-500 font-bold">
                      Tối Cao
                    </span>
                  </div>
                  <p className="text-[10px] text-[#CDBEAA]">
                    Xem danh sách tài khoản, quản lý quyền hội viên VIP, xóa tài khoản.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsNavMenuOpen(false);
                      if (onOpenAdminModal) onOpenAdminModal();
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#B38728] hover:from-[#FFE28A] hover:to-[#D4AF37] text-black font-serif font-bold text-xs shadow-md active:scale-95 cursor-pointer mt-1 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>Mở Bảng Điều Khiển Quản Trị</span>
                    <span>➔</span>
                  </button>
                </div>
              )}

              {/* ========================================================
                  2 Ô TIỆN ÍCH KÉO VÀO Ô 3 GẠCH (QUẺ NGÀY ☀️ & NHẠC THIỀN 🎵)
                  ======================================================== */}
              <div className="space-y-2 bg-[#1C1611]/80 border border-[#3E2F1E] rounded-xl p-2">
                <div className="text-[10px] font-mono text-[#A89882] uppercase tracking-wider px-1 flex items-center justify-between">
                  <span>Tiện ích mỗi ngày & tĩnh tâm</span>
                  <span className="text-[9px] text-amber-400 font-serif">2 tiện ích</span>
                </div>

                {/* Ô 1: Quẻ Ngày Kinh Dịch ☀️ */}
                {onOpenDailyHexagram && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsNavMenuOpen(false);
                      onOpenDailyHexagram();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl bg-gradient-to-r from-[#2A1B0E] via-[#352212] to-[#25170B] hover:from-[#3B2615] hover:to-[#2F1D0F] border border-amber-600/50 hover:border-amber-400 text-[#FFE28A] transition-all shadow-sm group cursor-pointer"
                    title="Xem Quẻ Ngày Kinh Dịch ngẫu nhiên mỗi ngày theo lịch dương kèm lời bình ngắn gọn"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center shrink-0 group-hover:rotate-45 transition-transform">
                        <Sun className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="text-left min-w-0">
                        <div className="text-xs sm:text-sm font-serif font-bold text-[#FFE28A] flex items-center gap-1.5 truncate">
                          <span>Quẻ Ngày Kinh Dịch</span>
                          <span className="text-[10px] text-amber-300/80 font-normal">今日一卦</span>
                        </div>
                        <div className="text-[10px] text-[#C2AA87] truncate">
                          Bốc quẻ nhật khóa & lời khuyên cát hung
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-900/70 text-amber-200 border border-amber-600/50 shrink-0 font-serif font-bold ml-2">
                      Xem Quẻ ☀️
                    </span>
                  </button>
                )}

                {/* Ô 2: Zen Audio Music Player (Nhạc Thiền & Cổ Cầm 🎵) */}
                <ZenAudioPlayer variant="menu-card" />
              </div>

              {/* ========================================================
                  DANH MỤC CÁC PHÂN HỆ TAB CHÍNH (7 PHÂN HỆ)
                  ======================================================== */}
              <div className="space-y-1">
                <div className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-wider px-1 pt-1 font-bold flex items-center justify-between">
                  <span>Các phân hệ học thuật Cửu Nhị</span>
                  <span className="text-[9px] text-[#A89882] font-normal">玖貳學術</span>
                </div>
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
                            className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-left cursor-pointer group ${
                              isActive
                                ? "bg-gradient-to-r from-[#C89B3C] via-[#D8AC4F] to-[#B2842B] text-[#120F0C] font-bold shadow-md shadow-amber-950/50 scale-[1.01]"
                                : "text-[#DCD1BF] hover:text-white hover:bg-[#231A12] border border-transparent hover:border-[#3D2C1C]"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                                  isActive
                                    ? "bg-[#14100C]/25 text-[#14100C]"
                                    : "bg-[#1F1710] text-amber-400 border border-[#3E2D1D]"
                                }`}
                              >
                                <Icon className="w-4 h-4" />
                              </div>

                              <div className="min-w-0">
                                <div className="text-xs sm:text-sm font-serif font-bold truncate flex items-center gap-1.5">
                                  <span>{tab.label}</span>
                                  <span
                                    className={`text-[10px] font-normal ${
                                      isActive ? "text-[#120F0C]/80" : "text-[#8C7A65]"
                                    }`}
                                  >
                                    ({tab.chinese})
                                  </span>
                                </div>
                                <div
                                  className={`text-[10px] truncate ${
                                    isActive ? "text-[#241A0A]" : "text-[#8C7D6A]"
                                  }`}
                                >
                                  {tab.desc}
                                </div>
                              </div>
                            </div>

                            {/* Badges / Trạng thái */}
                            <div className="flex items-center gap-1.5 shrink-0 ml-2">
                              {tab.id === "detail" && hasActiveReading && (
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34D399]" />
                              )}

                              {tab.id === "history" && historyCount > 0 && (
                                <span
                                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                                    isActive
                                      ? "bg-[#14120F] text-[#D4AF37]"
                                      : "bg-[#2A1F14] text-[#E0CEB1] border border-[#443120]"
                                  }`}
                                >
                                  {historyCount}
                                </span>
                              )}

                              {isActive && (
                                <Check className="w-4 h-4 text-[#14100C] stroke-[2.5]" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                  </div>

                  {/* Phụ Lục Menu: Zalo, Quẻ Ngày & Google Workspace cho tiện dụng */}
                  <div className="mt-2 pt-2 border-t border-[#2C2116] space-y-1">
                    {/* Link Nhóm Zalo Cửu Nhị */}
                    <a
                      href="https://zalo.me/g/vwzsqvnh3gdbzst2psyh"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-between p-2 rounded-xl text-xs text-[#FFE28A] hover:text-white bg-gradient-to-r from-emerald-950/80 via-[#182C1B] to-emerald-950/80 hover:bg-emerald-900/60 transition-all border border-emerald-600/70 shadow-xs"
                      title="Tham gia nhóm Zalo Cửu Nhị: Giao lưu kinh nghiệm, giải quẻ & học thuật"
                    >
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-400" />
                        <div>
                          <span className="font-bold font-serif text-emerald-300">Nhóm Zalo Cửu Nhị:</span>{" "}
                          <span className="text-[11px] text-[#CBE2D0]">Giao lưu Dịch Lý</span>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-800 text-emerald-100 font-serif font-bold">
                        Tham gia ➔
                      </span>
                    </a>

                    {/* Hotline Zalo nhanh */}
                    <a
                      href="https://zalo.me/0902853305"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-between p-2 rounded-xl text-xs text-emerald-300 hover:text-white hover:bg-emerald-950/60 transition-colors border border-emerald-900/40"
                    >
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-emerald-400" />
                        <div>
                          <span className="font-semibold font-serif">Zalo Tư Vấn Dịch Vụ:</span>{" "}
                          <span className="font-mono font-bold">090 285 3305</span>
                        </div>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-200">
                        Liên hệ
                      </span>
                    </a>

                    {/* Google Workspace shortcut */}
                    {onOpenWorkspace && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsNavMenuOpen(false);
                          onOpenWorkspace("docs");
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-xl text-xs text-[#DCD1BF] hover:text-white hover:bg-[#241C15] transition-colors border border-[#3A2A1A]"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex items-center -space-x-1">
                            <span className="w-2 h-2 rounded-full bg-[#4285F4]"></span>
                            <span className="w-2 h-2 rounded-full bg-[#34A853]"></span>
                            <span className="w-2 h-2 rounded-full bg-[#EA4335]"></span>
                          </div>
                          <span className="font-serif">Google Workspace (Docs/Sheets)</span>
                        </div>
                        <span className="text-[10px] text-[#8C7D6A]">Mở</span>
                      </button>
                    )}
                  </div>
                </div>
          </div>
        </div>
      </div>
    </header>
  );
};
