import React, { useState } from "react";
import {
  X,
  User,
  Mail,
  Lock,
  Crown,
  CheckCircle2,
  Sparkles,
  Flame,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  RotateCw,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { AuthService, AppUser } from "../services/authService";

const ZALO_GROUP_LINK = "https://zalo.me/g/vwzsqvnh3gdbzst2psyh";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: "login" | "register" | "upgrade";
  onSuccess?: (user: AppUser) => void;
  onShowToast?: (msg: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = "login",
  onSuccess,
  onShowToast,
}) => {
  const [mode, setMode] = useState<"login" | "register" | "upgrade">(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Trạng thái bước OTP xác thực email khi đăng ký
  const [regStep, setRegStep] = useState<"form" | "otp">("form");
  const [otpCode, setOtpCode] = useState("");
  const [lastGeneratedOtp, setLastGeneratedOtp] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  if (!isOpen) return null;

  const handleResetForm = () => {
    setErrorMsg(null);
    setRegStep("form");
    setOtpCode("");
    setLastGeneratedOtp(null);
  };

  const handleModeChange = (newMode: "login" | "register") => {
    setMode(newMode);
    handleResetForm();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (mode === "login") {
      const res = AuthService.login(email, password);
      if (!res.success) {
        setErrorMsg(res.message);
        return;
      }
      if (onShowToast) onShowToast(res.message);
      if (onSuccess && res.user) onSuccess(res.user);
      onClose();
    } else if (mode === "register") {
      if (regStep === "form") {
        // Bước 1: Yêu cầu gửi mã 6 số tới mail
        const res = AuthService.requestRegistrationCode(email, password, name);
        if (!res.success) {
          setErrorMsg(res.message);
          return;
        }
        setLastGeneratedOtp(res.code || null);
        setRegStep("otp");
        if (onShowToast) {
          onShowToast(res.message);
        }
      } else {
        // Bước 2: Điền mã 6 số để chính thức đăng nhập
        const res = AuthService.verifyOtpAndRegister(email, otpCode);
        if (!res.success) {
          setErrorMsg(res.message);
          return;
        }
        if (onShowToast) onShowToast(res.message);
        if (onSuccess && res.user) onSuccess(res.user);
        onClose();
      }
    } else if (mode === "upgrade") {
      const res = AuthService.upgradeToMember();
      if (!res.success) {
        setErrorMsg(res.message);
        return;
      }
      if (onShowToast) onShowToast(res.message);
      if (onSuccess && res.user) onSuccess(res.user);
      onClose();
    }
  };

  const handleResendOtp = () => {
    setIsResending(true);
    setErrorMsg(null);
    setTimeout(() => {
      const res = AuthService.resendRegistrationCode(email);
      setIsResending(false);
      if (res.success) {
        setLastGeneratedOtp(res.code || null);
        if (onShowToast) onShowToast(res.message);
      } else {
        setErrorMsg(res.message);
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#16110C] border border-[#543D24] rounded-3xl p-5 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8A7966] hover:text-[#E6D3A3] p-1.5 rounded-xl hover:bg-[#2A1F14] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Title */}
        <div className="text-center space-y-1 mb-5">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-[#D6B97A] to-[#75511A] flex items-center justify-center text-[#14120F] shadow-lg border border-[#E6D3A3] mb-2 font-serif font-bold text-xl">
            {mode === "upgrade" ? <Crown className="w-6 h-6 text-amber-950" /> : regStep === "otp" && mode === "register" ? <KeyRound className="w-6 h-6 text-amber-950" /> : "☯"}
          </div>

          <h3 className="text-lg sm:text-xl font-serif font-bold text-[#F5EAD4]">
            {mode === "login"
              ? "ĐĂNG NHẬP CỬU NHỊ"
              : mode === "register"
              ? regStep === "otp"
                ? "XÁC THỰC MÃ 6 SỐ EMAIL"
                : "ĐĂNG KÝ THÀNH VIÊN"
              : "NÂNG CẤP HỘI VIÊN THƯỜNG NIÊN"}
          </h3>

          <p className="text-xs text-[#A89882] font-serif">
            {mode === "login"
              ? "Đăng nhập để đọc toàn văn Thuyết Minh & trải nghiệm đầy đủ các tính năng"
              : mode === "register"
              ? regStep === "otp"
                ? `Mã 6 số đã gửi tới mail: ${email}. Nhập mã để chính thức đăng nhập.`
                : "Trở thành thành viên để mở khóa toàn văn Thuyết Minh & lưu trữ quẻ gieo"
              : "Nhận trọn vẹn đặc quyền đọc thuyết minh & lưu trữ quẻ gieo"}
          </p>
        </div>

        {/* Mode Selector Tabs (Login vs Register) */}
        {mode !== "upgrade" && (
          <div className="grid grid-cols-2 p-1 rounded-xl bg-[#20170F] border border-[#3E2D1A] mb-4">
            <button
              type="button"
              onClick={() => handleModeChange("login")}
              className={`py-2 rounded-lg text-xs font-serif font-bold transition-all cursor-pointer ${
                mode === "login"
                  ? "bg-gradient-to-r from-[#C9A55A] to-[#B38728] text-[#120F0C] shadow"
                  : "text-[#A89882] hover:text-white"
              }`}
            >
              Đăng Nhập
            </button>
            <button
              type="button"
              onClick={() => handleModeChange("register")}
              className={`py-2 rounded-lg text-xs font-serif font-bold transition-all cursor-pointer ${
                mode === "register"
                  ? "bg-gradient-to-r from-[#C9A55A] to-[#B38728] text-[#120F0C] shadow"
                  : "text-[#A89882] hover:text-white"
              }`}
            >
              Đăng Ký Thành Viên
            </button>
          </div>
        )}

        {/* Benefits Box for Members */}
        {regStep !== "otp" && (
          <div className="bg-[#1C140D] border border-[#442F1B] rounded-2xl p-3.5 mb-4 text-xs font-serif space-y-2">
            <div className="text-[11px] font-bold text-[#E6D3A3] uppercase tracking-wider flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>ĐẶC QUYỀN THÀNH VIÊN CỬU NHỊ:</span>
            </div>
            <div className="space-y-1.5 text-[#D1C2AC]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>Đọc toàn văn Thuyết Minh:</strong> 64 Quẻ Dịch & Tiên Triết Đạo Học Chu Dịch.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Lưu trữ & tra cứu vô hạn:</strong> Toàn bộ lịch sử thỉnh quẻ chiêm đoán.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Đầy đủ 8 phương thức:</strong> Bốc Bài (12 Trận), Mai Hoa, Lục Hào, Cỏ Thi, Xăm Khổng Minh, Lục Nhâm, Kỳ Môn, Thái Ất.
                </span>
              </div>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-600/70 text-rose-200 text-xs font-serif flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        {mode === "upgrade" ? (
          <div className="space-y-4">
            <p className="text-xs text-[#D1C2AC] font-serif leading-relaxed">
              Bạn đang ở tài khoản thường. Kích hoạt ngay gói <strong>Hội Viên Thường Niên (1.000.000 VNĐ / 1 Năm)</strong> để nhận trọn vẹn đặc quyền đọc thuyết minh toàn thư và trải nghiệm trọn bộ 8 phương thức chiêm đoán.
            </p>
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#C9A55A] to-[#B38728] text-[#120F0C] font-serif font-bold text-sm shadow-lg active:scale-95 cursor-pointer transition-all border border-[#E6D3A3]"
            >
              Xác Nhận Kích Hoạt Hội Viên VIP ➔
            </button>
          </div>
        ) : mode === "register" && regStep === "otp" ? (
          /* GIAO DIỆN BƯỚC 2: NHẬP MÃ 6 SỐ TỪ MAIL */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-600/50 text-xs font-serif space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[#E6D3A3] font-bold flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  Mã xác thực 6 số gửi đến:
                </span>
                <span className="text-[10px] text-amber-300 font-mono underline">{email}</span>
              </div>
              <p className="text-[#CDBEAA] leading-relaxed text-[11px]">
                Vui lòng kiểm tra hộp thư đến (hoặc hòm thư Spam/Quảng cáo). Nhập chính xác dãy 6 chữ số bên dưới để kích hoạt tài khoản và chính thức đăng nhập:
              </p>
              {lastGeneratedOtp && (
                <div className="p-2 rounded-xl bg-[#140E08] border border-amber-500/40 text-center space-y-1">
                  <span className="text-[10px] text-[#A89882] block">Mã gửi về email của bạn là:</span>
                  <div className="font-mono font-black text-xl tracking-[0.3em] text-[#E6D3A3]">
                    {lastGeneratedOtp}
                  </div>
                  <button
                    type="button"
                    onClick={() => setOtpCode(lastGeneratedOtp)}
                    className="text-[10px] text-amber-300 hover:underline cursor-pointer"
                  >
                    (Bấm vào đây để điền tự động mã {lastGeneratedOtp})
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-serif text-[#CDBEAA] mb-1.5 text-center">
                Nhập 6 số xác thực:
              </label>
              <input
                type="text"
                required
                maxLength={6}
                autoFocus
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="• • • • • •"
                className="w-full bg-[#110D09] border-2 border-amber-500/80 focus:border-[#E6D3A3] focus:shadow-[0_0_15px_rgba(255,226,138,0.3)] rounded-2xl py-3 text-center text-2xl font-mono font-bold tracking-[0.4em] text-[#E6D3A3] placeholder-[#59442C] outline-none"
              />
            </div>

            <div className="flex items-center justify-between text-xs font-serif pt-1">
              <button
                type="button"
                onClick={() => setRegStep("form")}
                className="text-[#A89882] hover:text-white cursor-pointer"
              >
                ← Quay lại sửa Email
              </button>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isResending}
                className="text-amber-400 hover:text-amber-300 underline cursor-pointer flex items-center gap-1"
              >
                <RotateCw className={`w-3 h-3 ${isResending ? "animate-spin" : ""}`} />
                <span>Gửi lại mã</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={otpCode.length !== 6}
              className={`w-full py-3 px-4 rounded-xl font-serif font-bold text-xs sm:text-sm shadow-md active:scale-95 cursor-pointer transition-all border border-[#E6D3A3] flex items-center justify-center gap-2 ${
                otpCode.length === 6
                  ? "bg-gradient-to-r from-[#C9A55A] to-[#B38728] hover:from-[#E6C265] text-[#120F0C]"
                  : "bg-[#2A1F14] text-[#8A7966] border-[#443120] cursor-not-allowed"
              }`}
            >
              <span>XÁC THỰC & CHÍNH THỨC ĐĂNG NHẬP</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* FORM NHẬP THÔNG TIN (LOGIN HOẶC BƯỚC 1 REGISTER) */
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === "register" && (
              <div>
                <label className="block text-xs font-serif text-[#CDBEAA] mb-1">
                  Họ và tên / Pháp danh:
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-[#7A6956]" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="VD: Nguyễn Văn An"
                    className="w-full bg-[#110D09] border border-[#3E2D1A] focus:border-[#C9A55A] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F2E5D2] placeholder-[#665442] outline-none font-serif"
                  />
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-serif text-[#CDBEAA]">
                  {mode === "login" ? "Email hoặc Tên đăng nhập:" : "Địa chỉ Email tiếp nhận mã 6 số:"}
                </label>
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-[#7A6956]" />
                <input
                  type={mode === "login" ? "text" : "email"}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={mode === "login" ? "name@example.com hoặc cuunhi" : "name@example.com"}
                  className="w-full bg-[#110D09] border border-[#3E2D1A] focus:border-[#C9A55A] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F2E5D2] placeholder-[#665442] outline-none font-serif"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-serif text-[#CDBEAA] mb-1">
                Mật khẩu:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-[#7A6956]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mật khẩu của bạn (tối thiểu 6 ký tự)"
                  className="w-full bg-[#110D09] border border-[#3E2D1A] focus:border-[#C9A55A] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F2E5D2] placeholder-[#665442] outline-none font-serif"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#C9A55A] to-[#B38728] hover:from-[#E6C265] hover:to-[#C9A55A] text-[#120F0C] font-serif font-bold text-xs sm:text-sm shadow-md active:scale-95 cursor-pointer transition-all border border-[#E6D3A3] mt-2 flex items-center justify-center gap-2"
            >
              <span>{mode === "login" ? "ĐĂNG NHẬP NGAY" : "TIẾP TỤC ➔ NHẬN MÃ 6 SỐ QUA EMAIL"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ========================================================
            LINK THAM GIA NHÓM ZALO GIAO LƯU HỌC THUẬT & HỖ TRỢ
            ======================================================== */}
        <div className="mt-4 pt-3.5 border-t border-[#3A2A1A]">
          <a
            href={ZALO_GROUP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-[#182B1C] to-emerald-950/90 border border-emerald-600/60 hover:border-emerald-400 text-emerald-200 hover:text-white transition-all group shadow-sm"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-left min-w-0">
                <div className="text-xs font-serif font-bold text-emerald-300 flex items-center gap-1.5 truncate">
                  <span>Tham Gia Nhóm Zalo Cửu Nhị</span>
                  <span className="text-[10px] px-1 py-0.2 rounded bg-emerald-900 text-emerald-200">Official</span>
                </div>
                <div className="text-[10px] text-[#A8C4B0] truncate">
                  Giao lưu luận quẻ, chia sẻ kinh nghiệm & giải đáp
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-serif font-bold text-emerald-300 shrink-0 ml-2">
              <span>Vào Nhóm</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};
