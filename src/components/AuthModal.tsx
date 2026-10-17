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
    <div className="fixed inset-0 z-50 flex justify-center p-3 sm:p-4 overflow-y-auto bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="royal-frame my-auto w-full max-w-md px-5 py-7 sm:px-8 sm:py-9 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.95)]">
        <span className="royal-corner tl" />
        <span className="royal-corner tr" />
        <span className="royal-corner bl" />
        <span className="royal-corner br" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-ivory-500 hover:text-gold-300 p-1.5 rounded-sm transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Title */}
        <div className="text-center mb-6">
          <span className="royal-seal w-12 h-12 text-sm">
            {mode === "upgrade" ? <Crown className="w-5 h-5" /> : regStep === "otp" && mode === "register" ? <KeyRound className="w-5 h-5" /> : <span className="[writing-mode:vertical-rl] leading-none">玖貳</span>}
          </span>

          <div className="royal-eyebrow mt-5">Cửu Nhị · Phong Thủy Mệnh Lý</div>

          <h3 className="royal-title mt-3 text-2xl sm:text-[1.75rem] tracking-[0.04em]">
            {mode === "login"
              ? "ĐĂNG NHẬP CỬU NHỊ"
              : mode === "register"
              ? regStep === "otp"
                ? "XÁC THỰC MÃ 6 SỐ EMAIL"
                : "ĐĂNG KÝ THÀNH VIÊN"
              : "NÂNG CẤP HỘI VIÊN THƯỜNG NIÊN"}
          </h3>

          <p className="mt-2 text-[13px] text-ivory-500 font-serif leading-relaxed">
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
          <div className="grid grid-cols-2 border-b border-gold-800 mb-5">
            <button
              type="button"
              onClick={() => handleModeChange("login")}
              className={`py-2.5 -mb-px border-b-2 text-[11px] uppercase tracking-[0.18em] transition-colors cursor-pointer ${
                mode === "login"
                  ? "border-gold-400 text-gold-200"
                  : "border-transparent text-ivory-500 hover:text-gold-300"
              }`}
            >
              Đăng Nhập
            </button>
            <button
              type="button"
              onClick={() => handleModeChange("register")}
              className={`py-2.5 -mb-px border-b-2 text-[11px] uppercase tracking-[0.18em] transition-colors cursor-pointer ${
                mode === "register"
                  ? "border-gold-400 text-gold-200"
                  : "border-transparent text-ivory-500 hover:text-gold-300"
              }`}
            >
              Đăng Ký Thành Viên
            </button>
          </div>
        )}

        {/* Benefits Box for Members */}
        {regStep !== "otp" && (
          <div className="border border-gold-800 bg-lacquer-950/50 p-4 mb-5 text-xs font-serif space-y-2.5">
            <div className="text-[10.5px] font-sans font-medium text-gold-400 uppercase tracking-[0.2em] flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-gold-500" />
              <span>ĐẶC QUYỀN THÀNH VIÊN CỬU NHỊ:</span>
            </div>
            <div className="space-y-1.5 text-ivory-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gold-500 shrink-0" />
                <span>
                  <strong>Đọc toàn văn Thuyết Minh:</strong> 64 Quẻ Dịch & Tiên Triết Đạo Học Chu Dịch.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gold-500 shrink-0" />
                <span>
                  <strong>Lưu trữ & tra cứu vô hạn:</strong> Toàn bộ lịch sử thỉnh quẻ chiêm đoán.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gold-500 shrink-0" />
                <span>
                  <strong>Đầy đủ 8 phương thức:</strong> Bốc Bài (12 Trận), Mai Hoa, Lục Hào, Cỏ Thi, Xăm Khổng Minh, Lục Nhâm, Kỳ Môn, Thái Ất.
                </span>
              </div>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="p-2.5 rounded-sm bg-rose-950/80 border border-rose-600/70 text-rose-200 text-xs font-serif flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        {mode === "upgrade" ? (
          <div className="space-y-4">
            <p className="text-xs text-ivory-300 font-serif leading-relaxed">
              Bạn đang ở tài khoản thường. Kích hoạt ngay gói <strong>Hội Viên Thường Niên (1.000.000 VNĐ / 1 Năm)</strong> để nhận trọn vẹn đặc quyền đọc thuyết minh toàn thư và trải nghiệm trọn bộ 8 phương thức chiêm đoán.
            </p>
            <button
              type="button"
              onClick={handleSubmit}
              className="royal-btn w-full"
            >
              Xác Nhận Kích Hoạt Hội Viên VIP ➔
            </button>
          </div>
        ) : mode === "register" && regStep === "otp" ? (
          /* GIAO DIỆN BƯỚC 2: NHẬP MÃ 6 SỐ TỪ MAIL */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-4 border border-gold-700 bg-lacquer-950/50 text-xs font-serif space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gold-300 font-bold flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  Mã xác thực 6 số gửi đến:
                </span>
                <span className="text-[10px] text-amber-300 font-mono underline">{email}</span>
              </div>
              <p className="text-ivory-300 leading-relaxed text-[11px]">
                Vui lòng kiểm tra hộp thư đến (hoặc hòm thư Spam/Quảng cáo). Nhập chính xác dãy 6 chữ số bên dưới để kích hoạt tài khoản và chính thức đăng nhập:
              </p>
              {lastGeneratedOtp && (
                <div className="p-2 rounded-sm bg-lacquer-900 border border-amber-500/40 text-center space-y-1">
                  <span className="text-[10px] text-ivory-500 block">Mã gửi về email của bạn là:</span>
                  <div className="font-mono font-black text-xl tracking-[0.3em] text-gold-300">
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
              <label className="block text-[10.5px] uppercase tracking-[0.18em] text-gold-500 mb-2 text-center">
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
                className="w-full bg-lacquer-950 border border-gold-600 focus:border-gold-400 rounded-sm py-3 text-center text-2xl font-mono font-bold tracking-[0.4em] text-gold-300 placeholder:text-gold-700 outline-none transition-colors"
              />
            </div>

            <div className="flex items-center justify-between text-xs font-serif pt-1">
              <button
                type="button"
                onClick={() => setRegStep("form")}
                className="text-ivory-500 hover:text-gold-200 cursor-pointer"
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
              className={`w-full ${
                otpCode.length === 6
                  ? "royal-btn"
                  : "royal-btn-ghost opacity-50 !cursor-not-allowed"
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
                <label className="block text-[10.5px] uppercase tracking-[0.18em] text-gold-500 mb-1.5">
                  Họ và tên / Pháp danh:
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gold-700" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="VD: Nguyễn Văn An"
                    className="w-full bg-lacquer-950 border border-gold-800 focus:border-gold-500 rounded-sm pl-9 pr-3 py-2.5 text-sm text-ivory-100 placeholder:text-ivory-500/60 outline-none font-serif transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[10.5px] uppercase tracking-[0.18em] text-gold-500">
                  {mode === "login" ? "Email hoặc Tên đăng nhập:" : "Địa chỉ Email tiếp nhận mã 6 số:"}
                </label>
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gold-700" />
                <input
                  type={mode === "login" ? "text" : "email"}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={mode === "login" ? "name@example.com hoặc cuunhi" : "name@example.com"}
                  className="w-full bg-lacquer-950 border border-gold-800 focus:border-gold-500 rounded-sm pl-9 pr-3 py-2.5 text-sm text-ivory-100 placeholder:text-ivory-500/60 outline-none font-serif transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10.5px] uppercase tracking-[0.18em] text-gold-500 mb-1.5">
                Mật khẩu:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gold-700" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mật khẩu của bạn (tối thiểu 6 ký tự)"
                  className="w-full bg-lacquer-950 border border-gold-800 focus:border-gold-500 rounded-sm pl-9 pr-3 py-2.5 text-sm text-ivory-100 placeholder:text-ivory-500/60 outline-none font-serif transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              className="royal-btn w-full !mt-5"
            >
              <span>{mode === "login" ? "ĐĂNG NHẬP NGAY" : "TIẾP TỤC ➔ NHẬN MÃ 6 SỐ QUA EMAIL"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ========================================================
            LINK THAM GIA NHÓM ZALO GIAO LƯU HỌC THUẬT & HỖ TRỢ
            ======================================================== */}
        <div className="mt-6 pt-5 border-t border-gold-800">
          <a
            href={ZALO_GROUP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between p-3 border border-gold-800 hover:border-gold-500 bg-lacquer-950/50 transition-colors group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-sm border border-gold-700 flex items-center justify-center shrink-0">
                <MessageSquare className="w-4 h-4 text-gold-400" />
              </div>
              <div className="text-left min-w-0">
                <div className="text-[13px] font-serif text-ivory-100 group-hover:text-gold-200 flex items-center gap-1.5 truncate">
                  <span>Tham Gia Nhóm Zalo Cửu Nhị</span>
                  <span className="text-[9.5px] uppercase tracking-[0.14em] text-gold-600">Official</span>
                </div>
                <div className="text-[11px] text-ivory-500 truncate">
                  Giao lưu luận quẻ, chia sẻ kinh nghiệm & giải đáp
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10.5px] uppercase tracking-[0.14em] text-gold-500 group-hover:text-gold-300 shrink-0 ml-2">
              <span>Vào Nhóm</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};
