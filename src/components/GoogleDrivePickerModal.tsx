import React, { useState, useEffect } from "react";
import {
  X,
  HardDrive,
  FileImage,
  ExternalLink,
  Check,
  Download,
  UploadCloud,
  LogOut,
  Sparkles,
  AlertCircle,
  Loader2,
  FileText,
} from "lucide-react";
import { User } from "firebase/auth";
import {
  initAuth,
  googleSignIn,
  getAccessToken,
  logout,
} from "../services/googleAuth";
import {
  openGooglePicker,
  fetchDriveFileAsDataUrl,
  saveFileToDrive,
  PickedFile,
} from "../services/googlePicker";
import { HEXAGRAMS } from "../data/hexagrams";
import { cardImageStore } from "../services/cardImageStore";

interface GoogleDrivePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeDeckId?: string;
  onCardImageSet?: (hexagramNum: number, dataUrl: string) => void;
  onCardBackSet?: (dataUrl: string) => void;
  currentReadingText?: string;
  readingQuestion?: string;
}

export const GoogleDrivePickerModal: React.FC<GoogleDrivePickerModalProps> = ({
  isOpen,
  onClose,
  activeDeckId = "deck_cuu_nhi_vi",
  onCardImageSet,
  onCardBackSet,
  currentReadingText,
  readingQuestion,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isSavingToDrive, setIsSavingToDrive] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [pickedFiles, setPickedFiles] = useState<PickedFile[]>([]);
  const [selectedHexNumber, setSelectedHexNumber] = useState<number>(1);
  const [targetApplication, setTargetApplication] = useState<"back" | "card">("back");
  const [activeFilePreview, setActiveFilePreview] = useState<{ file: PickedFile; dataUrl?: string } | null>(null);

  // Initialize auth listener
  useEffect(() => {
    if (!isOpen) return;

    // Check if token already exists in memory
    getAccessToken().then((t) => {
      if (t) setToken(t);
    });

    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
      },
      () => {
        // Not authenticated
      }
    );

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setStatusMessage(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        setStatusMessage({
          type: "success",
          text: `Đã kết nối với tài khoản Google: ${res.user.displayName || res.user.email}`,
        });
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      setStatusMessage({
        type: "error",
        text: err.message || "Đăng nhập Google không thành công. Vui lòng thử lại.",
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setUser(null);
      setToken(null);
      setPickedFiles([]);
      setActiveFilePreview(null);
      setStatusMessage({ type: "info", text: "Đã đăng xuất khỏi tài khoản Google." });
    } catch (err) {
      console.error("Sign out error", err);
    }
  };

  const handleOpenPicker = async (viewType: "images" | "all" = "images") => {
    setStatusMessage(null);
    let accessToken = token;

    if (!accessToken) {
      try {
        setIsSigningIn(true);
        const res = await googleSignIn();
        if (!res) return;
        setUser(res.user);
        setToken(res.accessToken);
        accessToken = res.accessToken;
      } catch (err: any) {
        setStatusMessage({
          type: "error",
          text: "Cần đăng nhập Google để mở Google Picker.",
        });
        return;
      } finally {
        setIsSigningIn(false);
      }
    }

    try {
      await openGooglePicker({
        accessToken,
        viewType,
        title: viewType === "images" ? "Chọn Hình Ảnh / Video từ Google Drive" : "Chọn Tệp từ Google Drive",
        multiselect: false,
        onPick: async (files) => {
          if (files.length === 0) return;
          setPickedFiles(files);
          const first = files[0];

          // If it's an image, let's fetch preview
          if (first.mimeType.startsWith("image/") && accessToken) {
            setIsLoadingFile(true);
            try {
              const dataUrl = await fetchDriveFileAsDataUrl(first.id, accessToken);
              setActiveFilePreview({ file: first, dataUrl });
              setStatusMessage({
                type: "success",
                text: `Đã chọn tệp: "${first.name}" từ Google Drive. Bạn có thể áp dụng vào bộ bài bên dưới!`,
              });
            } catch (err: any) {
              console.error("Error fetching preview:", err);
              setActiveFilePreview({ file: first });
              setStatusMessage({
                type: "info",
                text: `Đã chọn tệp: "${first.name}".`,
              });
            } finally {
              setIsLoadingFile(false);
            }
          } else {
            setActiveFilePreview({ file: first });
            setStatusMessage({
              type: "info",
              text: `Đã chọn tệp: "${first.name}".`,
            });
          }
        },
        onCancel: () => {
          // User closed picker dialog without selecting
        },
      });
    } catch (err: any) {
      console.error("Picker error:", err);
      setStatusMessage({
        type: "error",
        text: err.message || "Không thể mở Google Picker. Vui lòng thử lại.",
      });
    }
  };

  const handleApplyToDeck = async () => {
    if (!activeFilePreview?.file || !token) return;

    setIsLoadingFile(true);
    try {
      // Ensure we have dataUrl
      let dataUrl = activeFilePreview.dataUrl;
      if (!dataUrl) {
        dataUrl = await fetchDriveFileAsDataUrl(activeFilePreview.file.id, token);
      }

      if (targetApplication === "back") {
        await cardImageStore.saveDeckCardBack(activeDeckId, dataUrl);
        if (onCardBackSet) onCardBackSet(dataUrl);
        setStatusMessage({
          type: "success",
          text: `Đã đặt hình ảnh từ Google Drive làm MẶT LƯNG BÀI của bộ bài hiện tại!`,
        });
      } else {
        await cardImageStore.saveDeckCardImage(activeDeckId, selectedHexNumber, dataUrl);
        if (onCardImageSet) onCardImageSet(selectedHexNumber, dataUrl);
        const hexName = HEXAGRAMS.find((h) => h.number === selectedHexNumber)?.name || `Quẻ #${selectedHexNumber}`;
        setStatusMessage({
          type: "success",
          text: `Đã áp dụng ảnh Google Drive vào quẻ số ${selectedHexNumber} (${hexName})!`,
        });
      }
    } catch (err: any) {
      console.error("Apply error:", err);
      setStatusMessage({
        type: "error",
        text: `Không thể áp dụng hình ảnh: ${err.message}`,
      });
    } finally {
      setIsLoadingFile(false);
    }
  };

  const handleSaveReadingToDrive = async () => {
    let accessToken = token;
    if (!accessToken) {
      try {
        const res = await googleSignIn();
        if (!res) return;
        setUser(res.user);
        setToken(res.accessToken);
        accessToken = res.accessToken;
      } catch (err: any) {
        setStatusMessage({ type: "error", text: "Cần đăng nhập Google để lưu lên Drive." });
        return;
      }
    }

    if (!currentReadingText) {
      setStatusMessage({
        type: "info",
        text: "Hiện chưa có kết quả quẻ nào vừa bốc để lưu lên Google Drive.",
      });
      return;
    }

    setIsSavingToDrive(true);
    try {
      const dateStr = new Date().toISOString().slice(0, 10);
      const cleanTitle = (readingQuestion || "Que_Kinh_Dich").replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1E00-\u1EFF]/g, "_").slice(0, 40);
      const fileName = `Kinh_Dich_${cleanTitle}_${dateStr}.md`;

      const content = `# Luận Giải Quẻ Kinh Dịch - ${readingQuestion || "Thỉnh Vấn Dịch Học"}\n\n` +
        `**Thời gian:** ${new Date().toLocaleString("vi-VN")}\n\n` +
        `---\n\n` +
        currentReadingText;

      const result = await saveFileToDrive({
        name: fileName,
        mimeType: "text/markdown",
        content,
        accessToken,
      });

      setStatusMessage({
        type: "success",
        text: `Đã lưu thành công tệp "${result.name}" lên Google Drive của bạn!`,
      });
    } catch (err: any) {
      console.error("Save to Drive error:", err);
      setStatusMessage({
        type: "error",
        text: `Lỗi khi lưu lên Drive: ${err.message}`,
      });
    } finally {
      setIsSavingToDrive(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#171410] border border-[#3E3122] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#2C2317] flex items-center justify-between bg-[#1B1713]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4285F4]/20 to-[#34A853]/20 border border-[#4285F4]/40 flex items-center justify-center text-[#4285F4] shadow-md">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-[#F5EAD4] flex items-center gap-2">
                Google Picker & Google Drive
              </h3>
              <p className="text-xs text-[#A89882]">
                Chọn tranh quẻ, lưng bài và xuất tài liệu trực tiếp từ Google Drive
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#8F816F] hover:text-[#F3EFE6] p-1.5 rounded-lg hover:bg-[#251E17] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 scrollbar-thin scrollbar-thumb-[#3F3325]">
          {/* Status Message Alert */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                statusMessage.type === "success"
                  ? "bg-[#162719] border-[#2A5730] text-[#7DE28D]"
                  : statusMessage.type === "error"
                  ? "bg-[#2A1715] border-[#572722] text-[#E2837D]"
                  : "bg-[#1E232B] border-[#2A3F5B] text-[#93C5FD]"
              }`}
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{statusMessage.text}</div>
              <button onClick={() => setStatusMessage(null)} className="opacity-70 hover:opacity-100">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Google Account Section */}
          <div className="bg-[#120F0C] border border-[#2B2217] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            {user ? (
              <div className="flex items-center gap-3 w-full sm:w-auto">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "Avatar"}
                    className="w-10 h-10 rounded-full border border-[#C9A55A]/50"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#2C2114] border border-[#443623] flex items-center justify-center text-[#C9A55A] font-bold">
                    {(user.displayName || user.email || "G").charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="text-xs font-bold text-[#F3EFE6]">
                    {user.displayName || "Người dùng Google"}
                  </div>
                  <div className="text-[11px] text-[#A69780] font-mono">{user.email}</div>
                  <div className="text-[10px] text-[#34A853] flex items-center gap-1 font-medium mt-0.5">
                    <Check className="w-3 h-3" /> Đã kết nối OAuth Drive thành công
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-1 text-center sm:text-left">
                <div className="text-xs font-bold text-[#E8DCC8]">Chưa đăng nhập tài khoản Google</div>
                <p className="text-[11px] text-[#8C7D6B]">
                  Đăng nhập để thỉnh hình ảnh từ Drive của bạn thông qua Google Picker.
                </p>
              </div>
            )}

            <div>
              {user ? (
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#A89882] hover:text-[#E2837D] border border-[#3A2E20] hover:border-[#632924] rounded-lg transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Đăng xuất
                </button>
              ) : (
                /* Official Sign In with Google Button Pattern as specified in SKILL.md */
                <button
                  type="button"
                  disabled={isSigningIn}
                  onClick={handleSignIn}
                  className="flex items-center gap-2.5 px-4 py-2 bg-white text-gray-800 hover:bg-gray-100 rounded-lg font-medium text-xs shadow-md transition-all border border-gray-300 disabled:opacity-50 cursor-pointer"
                >
                  {isSigningIn ? (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                    </svg>
                  )}
                  <span>Đăng nhập với Google</span>
                </button>
              )}
            </div>
          </div>

          {/* Primary Action Buttons: Open Google Picker */}
          <div className="space-y-3">
            <h4 className="text-xs font-serif font-bold text-[#EAD8B1] tracking-wider uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A55A]" />
              Thao Tác Với Google Picker
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleOpenPicker("images")}
                className="p-3.5 rounded-xl border border-[#3E3122] bg-[#1F1913] hover:bg-[#282119] hover:border-[#C9A55A]/60 text-left transition-all group cursor-pointer flex items-start gap-3 shadow-md"
              >
                <div className="w-9 h-9 rounded-lg bg-[#2E2419] border border-[#4E3924] flex items-center justify-center text-[#C9A55A] group-hover:scale-105 transition-transform shrink-0">
                  <FileImage className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-[#F3EFE6] group-hover:text-[#C9A55A] transition-colors">
                    Chọn Ảnh / Video từ Drive
                  </div>
                  <div className="text-[11px] text-[#A69780] leading-snug">
                    Mở Google Picker lọc riêng hình ảnh và video để làm tranh quẻ hoặc lưng bài.
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleOpenPicker("all")}
                className="p-3.5 rounded-xl border border-[#3E3122] bg-[#1F1913] hover:bg-[#282119] hover:border-[#C9A55A]/60 text-left transition-all group cursor-pointer flex items-start gap-3 shadow-md"
              >
                <div className="w-9 h-9 rounded-lg bg-[#2E2419] border border-[#4E3924] flex items-center justify-center text-[#93C5FD] group-hover:scale-105 transition-transform shrink-0">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-[#F3EFE6] group-hover:text-[#93C5FD] transition-colors">
                    Duyệt Mọi Tệp Trên Drive
                  </div>
                  <div className="text-[11px] text-[#A69780] leading-snug">
                    Mở giao diện Picker đầy đủ để duyệt tìm bất kỳ tài liệu nào trên Drive.
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Picked File Preview & Application */}
          {activeFilePreview && (
            <div className="bg-[#1B1611] border border-[#483724] rounded-xl p-4 space-y-4 animate-in fade-in duration-150">
              <div className="flex items-start justify-between gap-3 border-b border-[#2C2216] pb-3">
                <div className="flex items-center gap-3">
                  {activeFilePreview.dataUrl ? (
                    <img
                      src={activeFilePreview.dataUrl}
                      alt={activeFilePreview.file.name}
                      className="w-14 h-20 object-cover rounded-lg border border-[#C9A55A] shadow"
                    />
                  ) : (
                    <div className="w-12 h-16 rounded-lg bg-[#251D16] border border-[#3E3022] flex items-center justify-center text-[#A69780]">
                      <FileText className="w-6 h-6" />
                    </div>
                  )}
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-[#F5EAD4] flex items-center gap-1.5 flex-wrap">
                      <span>{activeFilePreview.file.name}</span>
                      <span className="text-[10px] font-mono bg-[#2C2216] text-[#C9A55A] px-1.5 py-0.2 rounded border border-[#433422]">
                        {activeFilePreview.file.mimeType}
                      </span>
                    </div>
                    {activeFilePreview.file.sizeBytes && (
                      <div className="text-[10px] text-[#8C7C68] font-mono">
                        {(activeFilePreview.file.sizeBytes / 1024).toFixed(1)} KB
                      </div>
                    )}
                    {activeFilePreview.file.url && (
                      <a
                        href={activeFilePreview.file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-[#93C5FD] hover:underline mt-0.5"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Mở xem trên Google Drive
                      </a>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveFilePreview(null)}
                  className="text-[#8C7C68] hover:text-[#E2837D] p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Configure Target Application (Card Back or Specific Hexagram) */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-[#C9A55A]">
                  Áp dụng hình ảnh vừa chọn vào bộ bài:
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <label
                    className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                      targetApplication === "back"
                        ? "bg-[#2A2015] border-[#C9A55A] text-[#FFF]"
                        : "bg-[#14110E] border-[#312519] text-[#A69780]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="picker_target"
                      checked={targetApplication === "back"}
                      onChange={() => setTargetApplication("back")}
                      className="accent-[#C9A55A]"
                    />
                    <span className="text-xs font-medium">Làm Mặt Lưng Bài (Card Back)</span>
                  </label>

                  <label
                    className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                      targetApplication === "card"
                        ? "bg-[#2A2015] border-[#C9A55A] text-[#FFF]"
                        : "bg-[#14110E] border-[#312519] text-[#A69780]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="picker_target"
                      checked={targetApplication === "card"}
                      onChange={() => setTargetApplication("card")}
                      className="accent-[#C9A55A]"
                    />
                    <span className="text-xs font-medium">Làm Tranh Quẻ (64 Quẻ)</span>
                  </label>
                </div>

                {targetApplication === "card" && (
                  <div className="space-y-1 pt-1">
                    <label className="text-[11px] text-[#A69780] block">
                      Chọn số quẻ muốn gán hình ảnh này:
                    </label>
                    <select
                      value={selectedHexNumber}
                      onChange={(e) => setSelectedHexNumber(Number(e.target.value))}
                      className="w-full bg-[#120F0C] border border-[#3E3022] text-[#F5EAD4] text-xs rounded-lg px-3 py-2 focus:border-[#C9A55A] outline-none"
                    >
                      {HEXAGRAMS.map((hex) => (
                        <option key={hex.number} value={hex.number}>
                          Quẻ {hex.number}: {hex.name} ({hex.hanzi || hex.vietnameseName})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  type="button"
                  disabled={isLoadingFile}
                  onClick={handleApplyToDeck}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-[#C9A55A] to-[#B38728] hover:from-[#E2BE4B] hover:to-[#C29633] text-[#120F0C] font-bold text-xs rounded-xl shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isLoadingFile ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang tải và cập nhật bộ bài...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>
                        Xác Nhận Áp Dụng Vào Bộ Bài (
                        {targetApplication === "back" ? "Mặt Lưng" : `Quẻ #${selectedHexNumber}`}
                        )
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Export / Save Reading to Google Drive */}
          {currentReadingText && (
            <div className="bg-[#14110E] border border-[#2F2417] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-[#EAD8B1] flex items-center gap-1.5">
                  <UploadCloud className="w-4 h-4 text-[#C9A55A]" />
                  Lưu Luận Giải Quẻ Vào Google Drive
                </div>
                <p className="text-[11px] text-[#8C7D6B]">
                  Lưu câu hỏi và toàn văn giải quẻ hiện tại thành tệp Markdown trên Drive của bạn.
                </p>
              </div>
              <button
                type="button"
                disabled={isSavingToDrive}
                onClick={handleSaveReadingToDrive}
                className="flex items-center gap-2 px-3.5 py-2 bg-[#251D14] hover:bg-[#34271A] border border-[#483622] hover:border-[#C9A55A] text-xs text-[#EAD8B1] font-medium rounded-lg transition-all shrink-0 cursor-pointer disabled:opacity-50"
              >
                {isSavingToDrive ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#C9A55A]" />
                ) : (
                  <Download className="w-4 h-4 text-[#C9A55A]" />
                )}
                <span>Lưu Lên Drive</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-[#14110E] border-t border-[#2C2317] flex items-center justify-between text-[11px] text-[#807261]">
          <span>Google Drive File & Metadata API (Readonly/File Scopes)</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-[#221B14] hover:bg-[#2E241B] border border-[#3E3022] text-[#DDD0BE] rounded-lg transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
