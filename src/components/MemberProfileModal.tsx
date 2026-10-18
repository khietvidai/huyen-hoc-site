import React, { useState } from "react";
import {
  X,
  Crown,
  ShieldCheck,
  User,
  KeyRound,
  Calendar,
  Sparkles,
  Flame,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  LogOut,
  ShieldAlert,
  Clock,
  ArrowRight,
} from "lucide-react";
import { AppUser, AuthService } from "../services/authService";

interface MemberProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser | null;
  onShowToast?: (msg: string) => void;
  onOpenAdminModal?: () => void;
  onOpenAuthModal?: (mode: "login" | "register" | "upgrade") => void;
  onLogout?: () => void;
}

export const MemberProfileModal: React.FC<MemberProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onShowToast,
  onOpenAdminModal,
  onOpenAuthModal,
  onLogout,
}) => {
  // Password change states
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);

  if (!isOpen || !currentUser) return null;

  // Tính toán thời hạn thành viên
  const isVip = Boolean(currentUser.isMember || currentUser.isAdmin);
  const expiryDate = currentUser.memberExpiryDate;
  const isPermanent = expiryDate === "2099-12-31" || currentUser.isAdmin;

  let daysRemaining: number | null = null;
  if (expiryDate && !isPermanent) {
    const diff = new Date(expiryDate).getTime() - Date.now();
    daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (!currentPassword) {
      setPassError("Vui lòng nhập mật khẩu hiện tại!");
      return;
    }
    if (newPassword.length < 6) {
      setPassError("Mật khẩu mới phải có tối thiểu 6 ký tự!");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError("Xác nhận mật khẩu mới không trùng khớp!");
      return;
    }
    if (newPassword === currentPassword) {
      setPassError("Mật khẩu mới không được trùng với mật khẩu hiện tại!");
      return;
    }

    setIsChangingPass(true);
    try {
      const res = await AuthService.changePassword(
        currentUser.email || currentUser.username || currentUser.id,
        currentPassword,
        newPassword
      );

      if (res.success) {
        setPassSuccess("Đổi mật khẩu thành công! Mật khẩu mới đã được cập nhật.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        if (onShowToast) onShowToast("Đổi mật khẩu tài khoản thành công!");
      } else {
        setPassError(res.message);
      }
    } catch {
      setPassError("Không thể kết nối đến máy chủ. Vui lòng thử lại sau!");
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#140F0A] border-2 border-[#C9A55A] rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden text-[#EDE0D0] font-serif">
        {/* Glow ambient background decoration */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="px-5 py-4 sm:px-6 border-b border-[#3E2B18] bg-gradient-to-r from-[#20150D] via-[#170E08] to-[#20150D] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-base shrink-0 border shadow-md ${
                currentUser.isAdmin
                  ? "bg-red-950/80 border-red-500 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                  : isVip
                  ? "bg-gradient-to-br from-[#C9A55A] to-[#8C6218] text-[#120F0B] border-[#E6D3A3] shadow-[0_0_15px_rgba(201,165,90,0.3)]"
                  : "bg-[#24170E] border-[#442F1B] text-[#C9A55A]"
              }`}
            >
              {currentUser.isAdmin ? (
                <ShieldCheck className="w-6 h-6 text-red-300" />
              ) : isVip ? (
                <Crown className="w-6 h-6 text-black" />
              ) : (
                <User className="w-5 h-5 text-amber-400" />
              )}
            </div>

            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-[#F5EAD4] truncate flex items-center gap-1.5">
                <span>{currentUser.name}</span>
              </h2>
              <p className="text-xs text-[#A89882] font-mono truncate">{currentUser.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-[#22170D] hover:bg-rose-950 text-[#8C7A65] hover:text-rose-300 border border-[#4A321D] transition-colors cursor-pointer shrink-0"
            title="Đóng bảng thông tin"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Scrollable */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 max-h-[80vh]">
          {/* CỘT 1: LOẠI THÀNH VIÊN (LÀ THÀNH VIÊN GÌ?) */}
          <div className="p-4 rounded-2xl bg-[#1B120A] border border-[#46311D] space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#A6957F] uppercase tracking-wider font-sans">
                Cấp Bậc & Quyền Hạn
              </span>
              {currentUser.isAdmin ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-950/80 text-red-300 border border-red-600/70">
                  ROOT ADMIN
                </span>
              ) : isVip ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-600/70 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  VIP MEMBER
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#281B10] text-[#998772] border border-[#3E2918]">
                  STANDARD
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-[#F5EAD4]">
                {currentUser.isAdmin
                  ? "Quản Trị Viên Tối Cao Cửu Nhị"
                  : isVip
                  ? "Hội Viên VIP Hoàng Gia"
                  : "Thành Viên Tiêu Chuẩn"}
              </span>
            </div>

            <p className="text-xs text-[#B5A48F] leading-relaxed">
              {currentUser.isAdmin
                ? "Toàn quyền quản trị danh sách người dùng, điều phối phân cấp hội viên và cấu hình máy chủ hệ thống."
                : isVip
                ? "Mở khóa trọn bộ 64 Quẻ Sách Thuyết Minh Kinh Dịch, giải mã Bát Tự Lục Nhâm chuyên sâu, bốc quẻ không giới hạn."
                : "Tài khoản tiêu chuẩn với các chức năng chiêm nghiệm cơ bản."}
            </p>

            {/* Nếu là tài khoản thường, gợi ý nâng cấp VIP */}
            {!isVip && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenAuthModal) onOpenAuthModal("upgrade");
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#C9A55A] via-[#E6D3A3] to-[#B38728] text-black font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:brightness-110 active:scale-98 transition-all cursor-pointer"
                >
                  <Crown className="w-4 h-4 text-black" />
                  <span>Nâng Cấp Lên Hội Viên VIP (Mở Toàn Bộ Sách Thuyết Minh)</span>
                  <ArrowRight className="w-3.5 h-3.5 text-black" />
                </button>
              </div>
            )}
          </div>

          {/* CỘT 2: THỜI HẠN THÀNH VIÊN (THỜI HẠN BAO LÂU?) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Thẻ 1: Thời hạn VIP */}
            <div className="p-3.5 rounded-2xl bg-[#1B120A] border border-[#46311D] space-y-1.5 shadow-sm">
              <div className="text-[11px] text-[#A6957F] flex items-center justify-between">
                <span>Thời Hạn Thành Viên</span>
                <Clock className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-base font-bold text-[#E6D3A3] flex items-center gap-1.5">
                {isPermanent ? (
                  <span className="text-amber-300 flex items-center gap-1">
                    <span>♾️ Vĩnh Viễn</span>
                    <span className="text-[10px] text-[#998772] font-normal">(Trọn đời)</span>
                  </span>
                ) : daysRemaining !== null ? (
                  <span className="text-amber-300">
                    Còn {daysRemaining} ngày
                  </span>
                ) : (
                  <span className="text-[#8C7A65]">Chưa kích hoạt VIP</span>
                )}
              </div>
              <div className="text-[11px] text-[#8C7A65] flex items-center gap-1 font-mono">
                <Calendar className="w-3 h-3 text-[#6E5D4B]" />
                <span>
                  {isPermanent
                    ? "Hiệu lực đến: 31/12/2099"
                    : expiryDate
                    ? `Hết hạn: ${new Date(expiryDate).toLocaleDateString("vi-VN")}`
                    : "Không thời hạn VIP"}
                </span>
              </div>
            </div>

            {/* Thẻ 2: Kho nhang tích lũy */}
            <div className="p-3.5 rounded-2xl bg-[#1B120A] border border-[#46311D] space-y-1.5 shadow-sm">
              <div className="text-[11px] text-[#A6957F] flex items-center justify-between">
                <span>Kho Nhang Dâng Lễ</span>
                <Flame className="w-3.5 h-3.5 text-orange-400" />
              </div>
              <div className="text-base font-bold text-orange-300 flex items-center gap-1.5">
                <span>{currentUser.incenseSticks ?? 0} nén nhang</span>
              </div>
              <div className="text-[11px] text-[#8C7A65] leading-tight">
                Dùng gieo quẻ & bái lễ Thánh Hiền
              </div>
            </div>
          </div>

          {/* CỘT 3: TÍNH NĂNG ĐỔI MẬT KHẨU */}
          <div className="p-4 rounded-2xl bg-[#18110A] border border-[#46311D] space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-[#E6D3A3]">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>BẢO MẬT & ĐỔI MẬT KHẨU</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordSection(!showPasswordSection);
                  setPassError(null);
                  setPassSuccess(null);
                }}
                className="text-xs text-[#C9A55A] hover:text-[#F5EAD4] underline cursor-pointer transition-colors"
              >
                {showPasswordSection ? "Thu gọn ✕" : "Đổi mật khẩu"}
              </button>
            </div>

            {showPasswordSection && (
              <form onSubmit={handlePasswordSubmit} className="space-y-3 pt-2 text-xs border-t border-[#312213]">
                {passError && (
                  <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-600/70 text-red-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{passError}</span>
                  </div>
                )}

                {passSuccess && (
                  <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-600/70 text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>{passSuccess}</span>
                  </div>
                )}

                {/* Mật khẩu hiện tại */}
                <div>
                  <label className="block text-[#A6957F] mb-1">Mật khẩu hiện tại:</label>
                  <div className="relative">
                    <input
                      type={showCurrentPass ? "text" : "password"}
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Nhập mật khẩu đang dùng"
                      className="w-full bg-[#100B07] border border-[#3A2818] focus:border-[#C9A55A] rounded-xl px-3 py-2 text-xs text-[#F2E5D2] outline-none pr-9 font-sans"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-2.5 top-2 text-[#7A6A57] hover:text-[#C9A55A] cursor-pointer"
                    >
                      {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Mật khẩu mới */}
                <div>
                  <label className="block text-[#A6957F] mb-1">Mật khẩu mới (tối thiểu 6 ký tự):</label>
                  <div className="relative">
                    <input
                      type={showNewPass ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nhập mật khẩu mới"
                      className="w-full bg-[#100B07] border border-[#3A2818] focus:border-[#C9A55A] rounded-xl px-3 py-2 text-xs text-[#F2E5D2] outline-none pr-9 font-sans"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-2.5 top-2 text-[#7A6A57] hover:text-[#C9A55A] cursor-pointer"
                    >
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Xác nhận mật khẩu mới */}
                <div>
                  <label className="block text-[#A6957F] mb-1">Xác nhận mật khẩu mới:</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full bg-[#100B07] border border-[#3A2818] focus:border-[#C9A55A] rounded-xl px-3 py-2 text-xs text-[#F2E5D2] outline-none font-sans"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordSection(false);
                      setCurrentPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#22170D] hover:bg-[#2C1E12] text-[#A6957F] text-xs cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isChangingPass}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#C9A55A] to-[#B38728] hover:from-[#E6D3A3] hover:to-[#C9A55A] text-black font-bold text-xs cursor-pointer shadow flex items-center gap-1.5 transition-all"
                  >
                    {isChangingPass ? "Đang cập nhật..." : "Cập Nhật Mật Khẩu"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 sm:px-6 border-t border-[#3E2B18] bg-[#1A120B] flex items-center justify-between text-xs text-[#8C7A65] shrink-0 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            {currentUser.isAdmin && onOpenAdminModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAdminModal();
                }}
                className="px-3 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-600/70 text-red-200 text-xs font-serif cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                <span>Bảng Quản Trị Hệ Thống</span>
              </button>
            )}
            {onLogout && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="px-3 py-1.5 rounded-xl bg-[#22170D] hover:bg-rose-950 border border-[#3E2B18] hover:border-rose-700 text-[#A6957F] hover:text-rose-300 text-xs font-serif cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5 text-[#8C7A65]" />
                <span>Đăng Xuất</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#C9A55A] to-[#B38728] text-black font-bold text-xs cursor-pointer shadow hover:brightness-110 active:scale-95 transition-all"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
