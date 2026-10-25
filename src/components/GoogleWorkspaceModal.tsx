import React, { useState, useEffect } from "react";
import {
  X,
  HardDrive,
  FileText,
  Table,
  Mail,
  Send,
  ExternalLink,
  Check,
  Download,
  LogOut,
  Sparkles,
  AlertCircle,
  Loader2,
  FileImage,
  PlusCircle,
  RefreshCw,
  Clock,
  ArrowRight,
  BookOpen,
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
import { exportReadingToGoogleDoc } from "../services/googleDocs";
import {
  createDivinationSpreadsheet,
  appendRowsToSpreadsheet,
  readSpreadsheetValues,
} from "../services/googleSheets";
import { sendDivinationEmail, createDivinationDraft } from "../services/gmail";
import { HEXAGRAMS } from "../data/hexagrams";
import { Hexagram } from "../types";
import { cardImageStore } from "../services/cardImageStore";

export type WorkspaceTab = "docs" | "sheets" | "gmail" | "picker";

export interface DivinationReadingData {
  question?: string;
  primaryHexagram?: Hexagram | null;
  transformedHexagram?: Hexagram | null;
  changingLines?: number[];
  aiAnalysis?: string;
  divinationMethod?: string;
}

interface GoogleWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: WorkspaceTab;
  activeDeckId?: string;
  onCardImageSet?: (hexagramNum: number, dataUrl: string) => void;
  onCardBackSet?: (dataUrl: string) => void;
  readingData?: DivinationReadingData;
}

const SAVED_SPREADSHEET_KEY = "iching_saved_spreadsheet_id";

export const GoogleWorkspaceModal: React.FC<GoogleWorkspaceModalProps> = ({
  isOpen,
  onClose,
  defaultTab = "docs",
  activeDeckId = "deck_cuu_nhi_vi",
  onCardImageSet,
  onCardBackSet,
  readingData,
}) => {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>(defaultTab);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
    actionUrl?: string;
    actionText?: string;
  } | null>(null);

  // --- GOOGLE DOCS STATE ---
  const [docTitle, setDocTitle] = useState("");
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);
  const [lastCreatedDoc, setLastCreatedDoc] = useState<{ id: string; url: string; title: string } | null>(null);

  // --- GOOGLE SHEETS STATE ---
  const [sheetMode, setSheetMode] = useState<"create_new" | "append_existing">("create_new");
  const [spreadsheetIdInput, setSpreadsheetIdInput] = useState("");
  const [isProcessingSheet, setIsProcessingSheet] = useState(false);
  const [lastUpdatedSheet, setLastUpdatedSheet] = useState<{ id: string; url: string; title: string } | null>(null);
  const [sheetPreviewRows, setSheetPreviewRows] = useState<string[][]>([]);

  // --- GMAIL STATE ---
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSuccessNote, setEmailSuccessNote] = useState<string | null>(null);

  // --- GOOGLE PICKER & DRIVE STATE ---
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isSavingToDrive, setIsSavingToDrive] = useState(false);
  const [selectedHexNumber, setSelectedHexNumber] = useState<number>(1);
  const [targetApplication, setTargetApplication] = useState<"back" | "card">("back");
  const [activeFilePreview, setActiveFilePreview] = useState<{ file: PickedFile; dataUrl?: string } | null>(null);

  // Sync default tab if changed externally
  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  // Load saved spreadsheet ID from cache
  useEffect(() => {
    const saved = localStorage.getItem(SAVED_SPREADSHEET_KEY);
    if (saved) {
      setSpreadsheetIdInput(saved);
    }
  }, []);

  // Update default titles & email subject based on current reading
  useEffect(() => {
    if (readingData?.primaryHexagram) {
      const q = readingData.question ? ` - ${readingData.question.slice(0, 30)}` : "";
      setDocTitle(`Luận Giải Kinh Dịch: ${readingData.primaryHexagram.name}${q}`);
      setEmailSubject(`[Kinh Dịch] Kết Quả Quẻ ${readingData.primaryHexagram.name}${q}`);
    } else {
      setDocTitle("Nhật Ký Chiêm Bái Kinh Dịch");
      setEmailSubject("[Kinh Dịch] Chia sẻ kết quả bốc quẻ");
    }
  }, [readingData]);

  // Listen to Auth
  useEffect(() => {
    if (!isOpen) return;

    getAccessToken().then((t) => {
      if (t) setToken(t);
    });

    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
        if (currentUser.email && !emailTo) {
          setEmailTo(currentUser.email);
        }
      },
      () => {
        // Not authenticated
      }
    );

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [isOpen, emailTo]);

  if (!isOpen) return null;

  // --- AUTH HELPERS ---
  const handleSignIn = async () => {
    setIsSigningIn(true);
    setStatusMessage(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        if (res.user.email && !emailTo) {
          setEmailTo(res.user.email);
        }
        setStatusMessage({
          type: "success",
          text: `Đã kết nối tài khoản Google: ${res.user.displayName || res.user.email}`,
        });
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      setStatusMessage({
        type: "error",
        text: err.message || "Đăng nhập Google thất bại. Vui lòng thử lại.",
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
      setActiveFilePreview(null);
      setStatusMessage({ type: "info", text: "Đã đăng xuất tài khoản Google." });
    } catch (err) {
      console.error("Sign out error", err);
    }
  };

  const ensureToken = async (): Promise<string | null> => {
    if (token) return token;
    try {
      setIsSigningIn(true);
      const res = await googleSignIn();
      if (!res) return null;
      setUser(res.user);
      setToken(res.accessToken);
      return res.accessToken;
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: "Yêu cầu đăng nhập tài khoản Google để thực hiện tác vụ này.",
      });
      return null;
    } finally {
      setIsSigningIn(false);
    }
  };

  // --- HANDLER: CREATE GOOGLE DOC ---
  const handleCreateGoogleDoc = async () => {
    const accessToken = await ensureToken();
    if (!accessToken) return;

    if (!readingData?.primaryHexagram) {
      setStatusMessage({
        type: "info",
        text: "Bạn cần bốc một quẻ trước khi xuất bài luận giải sang Google Docs.",
      });
      return;
    }

    setIsGeneratingDoc(true);
    setStatusMessage(null);

    try {
      const hex = readingData.primaryHexagram;
      const trans = readingData.transformedHexagram;
      const chLines = readingData.changingLines || [];

      // Extract line meanings if changing lines exist
      const lineMeanings = (hex.lineMeanings || [])
        .filter((l) => chLines.includes(l.line))
        .map((l) => ({
          line: l.line,
          text: `${l.name ? l.name + ": " : ""}${l.text || ""}`,
          meaning: l.meaning,
          detailedExplanation: l.detailedExplanation,
        }));

      const result = await exportReadingToGoogleDoc({
        title: docTitle || `Luận Giải Kinh Dịch - Quẻ ${hex.name}`,
        question: readingData.question || "Tâm niệm tổng quan",
        primaryHexagramName: hex.name,
        primaryHexagramNumber: hex.number,
        primaryVietnameseName: hex.vietnameseName,
        transformedHexagramName: trans ? trans.name : undefined,
        transformedHexagramNumber: trans ? trans.number : undefined,
        changingLines: chLines,
        judgment: hex.judgment,
        imageMeaning: hex.image || "",
        lineMeanings,
        aiAnalysis: readingData.aiAnalysis,
        accessToken,
      });

      setLastCreatedDoc({
        id: result.documentId,
        url: result.docUrl,
        title: result.title,
      });

      setStatusMessage({
        type: "success",
        text: `Đã khởi tạo tài liệu Google Docs thành công: "${result.title}"!`,
        actionUrl: result.docUrl,
        actionText: "Mở trên Google Docs",
      });
    } catch (err: any) {
      console.error("Docs creation error:", err);
      setStatusMessage({
        type: "error",
        text: `Không thể tạo Google Doc: ${err.message}`,
      });
    } finally {
      setIsGeneratingDoc(false);
    }
  };

  // --- HANDLER: GOOGLE SHEETS ---
  const handleSyncGoogleSheet = async () => {
    const accessToken = await ensureToken();
    if (!accessToken) return;

    if (!readingData?.primaryHexagram) {
      setStatusMessage({
        type: "info",
        text: "Bạn cần có kết quả quẻ bốc trước khi ghi vào Google Sheets.",
      });
      return;
    }

    setIsProcessingSheet(true);
    setStatusMessage(null);

    try {
      const hex = readingData.primaryHexagram;
      const trans = readingData.transformedHexagram;
      const chLines = readingData.changingLines || [];

      const timestamp = new Date().toLocaleString("vi-VN");
      const qText = readingData.question || "Tâm niệm tổng quan";
      const primaryText = `${hex.number}. ${hex.name} (${hex.vietnameseName})`;
      const changingText = chLines.length > 0 ? `Hào ${chLines.join(", ")}` : "Quẻ tịnh";
      const transformedText = trans ? `${trans.number}. ${trans.name} (${trans.vietnameseName})` : "Không";
      const methodText = readingData.divinationMethod || "Bốc bài 3 lá";
      const adviceSummary = (readingData.aiAnalysis || hex.judgment || "Vạn sự tùy duyên").slice(0, 300);

      const newRow = [
        timestamp,
        qText,
        primaryText,
        changingText,
        transformedText,
        methodText,
        adviceSummary,
      ];

      let targetSheetId = spreadsheetIdInput.trim();
      let sheetTitle = "Nhật Ký Chiêm Bái";
      let docUrl = "";
      let displayedTitle = "Nhật Ký Bốc Quẻ Kinh Dịch";

      if (sheetMode === "create_new" || !targetSheetId) {
        // Create brand new sheet
        const created = await createDivinationSpreadsheet(
          "Nhật Ký Bốc Quẻ Kinh Dịch - Chu Dịch Thần Quẻ",
          accessToken
        );
        targetSheetId = created.id;
        sheetTitle = created.sheetTitle;
        docUrl = created.url;
        displayedTitle = created.title;

        // Append initial reading row
        await appendRowsToSpreadsheet(targetSheetId, sheetTitle, [newRow], accessToken);

        // Save into local storage for convenience
        setSpreadsheetIdInput(targetSheetId);
        localStorage.setItem(SAVED_SPREADSHEET_KEY, targetSheetId);
      } else {
        // Append to existing spreadsheet
        await appendRowsToSpreadsheet(targetSheetId, sheetTitle, [newRow], accessToken);
        docUrl = `https://docs.google.com/spreadsheets/d/${targetSheetId}/edit`;
      }

      setLastUpdatedSheet({
        id: targetSheetId,
        url: docUrl,
        title: displayedTitle,
      });

      // Try reading preview
      try {
        const preview = await readSpreadsheetValues(targetSheetId, accessToken);
        if (preview.rows) {
          setSheetPreviewRows(preview.rows.slice(-5)); // Last 5 rows
        }
      } catch (e) {
        console.warn("Could not read sheet preview", e);
      }

      setStatusMessage({
        type: "success",
        text: `Đã ghi thành công quẻ vào bảng tính Google Sheets!`,
        actionUrl: docUrl,
        actionText: "Mở Google Sheets",
      });
    } catch (err: any) {
      console.error("Sheets error:", err);
      setStatusMessage({
        type: "error",
        text: `Lỗi Google Sheets: ${err.message}`,
      });
    } finally {
      setIsProcessingSheet(false);
    }
  };

  // --- HANDLER: GMAIL ---
  const handleSendEmail = async (asDraft: boolean = false) => {
    const accessToken = await ensureToken();
    if (!accessToken) return;

    if (!emailTo || !emailTo.includes("@")) {
      setStatusMessage({
        type: "error",
        text: "Vui lòng nhập địa chỉ email hợp lệ để nhận kết quả luận giải.",
      });
      return;
    }

    if (!readingData?.primaryHexagram) {
      setStatusMessage({
        type: "info",
        text: "Chưa có kết quả bốc quẻ để gửi qua Gmail.",
      });
      return;
    }

    setIsSendingEmail(true);
    setStatusMessage(null);
    setEmailSuccessNote(null);

    try {
      const hex = readingData.primaryHexagram;
      const trans = readingData.transformedHexagram;
      const chLines = readingData.changingLines || [];

      const params = {
        to: emailTo.trim(),
        subject: emailSubject || `[Kinh Dịch] Kết Quả Quẻ ${hex.name}`,
        question: readingData.question || "Tâm niệm tổng quan",
        primaryHexagramName: hex.name,
        primaryHexagramNumber: hex.number,
        primaryVietnameseName: hex.vietnameseName,
        transformedHexagramName: trans ? trans.name : undefined,
        transformedHexagramNumber: trans ? trans.number : undefined,
        changingLines: chLines,
        judgment: hex.judgment,
        aiAnalysis: readingData.aiAnalysis,
        senderEmail: user?.email || undefined,
        accessToken,
      };

      if (asDraft) {
        await createDivinationDraft(params);
        setEmailSuccessNote(`Đã tạo thư nháp trong Gmail của bạn thành công!`);
        setStatusMessage({
          type: "success",
          text: `Đã lưu thư nháp quẻ Kinh Dịch vào hộp thư Gmail của bạn.`,
          actionUrl: "https://mail.google.com/mail/u/0/#drafts",
          actionText: "Mở Thư Nháp Gmail",
        });
      } else {
        await sendDivinationEmail(params);
        setEmailSuccessNote(`Đã gửi thư báo cáo luận giải tới: ${emailTo}`);
        setStatusMessage({
          type: "success",
          text: `Email luận giải quẻ đã được gửi thành công đến ${emailTo}!`,
          actionUrl: "https://mail.google.com/mail/u/0/#sent",
          actionText: "Mở Thư Đã Gửi",
        });
      }
    } catch (err: any) {
      console.error("Gmail error:", err);
      setStatusMessage({
        type: "error",
        text: `Lỗi khi gửi qua Gmail: ${err.message}`,
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  // --- HANDLER: GOOGLE PICKER ---
  const handleOpenPicker = async (viewType: "images" | "all" = "images") => {
    setStatusMessage(null);
    const accessToken = await ensureToken();
    if (!accessToken) return;

    try {
      await openGooglePicker({
        accessToken,
        viewType,
        title: viewType === "images" ? "Chọn Hình Ảnh từ Google Drive" : "Chọn Tệp từ Google Drive",
        multiselect: false,
        onPick: async (files) => {
          if (files.length === 0) return;
          const first = files[0];

          if (first.mimeType.startsWith("image/") && accessToken) {
            setIsLoadingFile(true);
            try {
              const dataUrl = await fetchDriveFileAsDataUrl(first.id, accessToken);
              setActiveFilePreview({ file: first, dataUrl });
              setStatusMessage({
                type: "success",
                text: `Đã chọn tệp: "${first.name}". Bạn có thể áp dụng vào mặt lưng bài hoặc tranh 64 quẻ!`,
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
        onCancel: () => {},
      });
    } catch (err: any) {
      console.error("Picker error:", err);
      setStatusMessage({
        type: "error",
        text: err.message || "Không thể mở Google Picker. Vui lòng thử lại.",
      });
    }
  };

  // --- HANDLER: APPLY TO DECK ---
  const handleApplyToDeck = async () => {
    if (!activeFilePreview?.file || !token) return;

    setIsLoadingFile(true);
    try {
      let dataUrl = activeFilePreview.dataUrl;
      if (!dataUrl) {
        dataUrl = await fetchDriveFileAsDataUrl(activeFilePreview.file.id, token);
      }

      if (targetApplication === "back") {
        await cardImageStore.saveDeckCardBack(activeDeckId, dataUrl);
        if (onCardBackSet) onCardBackSet(dataUrl);
        setStatusMessage({
          type: "success",
          text: `Đã cập nhật hình ảnh từ Drive làm MẶT LƯNG BÀI thành công!`,
        });
      } else {
        await cardImageStore.saveDeckCardImage(activeDeckId, selectedHexNumber, dataUrl);
        if (onCardImageSet) onCardImageSet(selectedHexNumber, dataUrl);
        const hexName = HEXAGRAMS.find((h) => h.number === selectedHexNumber)?.name || `Quẻ #${selectedHexNumber}`;
        setStatusMessage({
          type: "success",
          text: `Đã áp dụng ảnh Drive vào quẻ số ${selectedHexNumber} (${hexName})!`,
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

  // --- HANDLER: SAVE READING TEXT AS MARKDOWN ON DRIVE ---
  const handleSaveReadingToDrive = async () => {
    const accessToken = await ensureToken();
    if (!accessToken) return;

    if (!readingData?.primaryHexagram) {
      setStatusMessage({
        type: "info",
        text: "Hiện chưa có quẻ bốc nào để lưu lên Google Drive.",
      });
      return;
    }

    setIsSavingToDrive(true);
    try {
      const hex = readingData.primaryHexagram;
      const trans = readingData.transformedHexagram;
      const chLines = readingData.changingLines || [];
      const dateStr = new Date().toISOString().slice(0, 10);
      const cleanTitle = (readingData.question || hex.name).replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1E00-\u1EFF]/g, "_").slice(0, 40);
      const fileName = `Kinh_Dich_${hex.number}_${cleanTitle}_${dateStr}.md`;

      const content =
        `# Luận Giải Quẻ Kinh Dịch: ${hex.name} (${hex.vietnameseName})\n\n` +
        `**Thời điểm thỉnh quẻ:** ${new Date().toLocaleString("vi-VN")}\n\n` +
        `**Tâm niệm / Câu hỏi:** ${readingData.question || "Chiêm nghiệm tổng thể"}\n\n` +
        `---\n\n` +
        `### I. QUẺ CHỦ:\n` +
        `- Quẻ số ${hex.number}: **${hex.name}**\n` +
        `- Lời Thoán: ${hex.judgment}\n` +
        `- Ý nghĩa hình tượng: ${hex.image || ""}\n\n` +
        (trans ? `### II. QUẺ BIẾN:\n- Quẻ số ${trans.number}: **${trans.name}**\n- Hào động: ${chLines.join(", ")}\n\n` : "") +
        (readingData.aiAnalysis ? `### III. BÌNH GIẢI DỊCH HỌC:\n${readingData.aiAnalysis}\n` : "");

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#16130F] border border-[#3D3021] w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#2B2116] flex items-center justify-between bg-[#1B1611]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4285F4]/20 via-[#34A853]/20 to-[#EA4335]/20 border border-[#C9A55A]/40 flex items-center justify-center text-[#C9A55A] shadow-md">
              <Sparkles className="w-5 h-5 text-[#C9A55A]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-[#F5EAD4] flex items-center gap-2">
                Google Workspace & Drive Hub
              </h3>
              <p className="text-xs text-[#A89882]">
                Tích hợp Google Docs, Google Sheets, Gmail và Google Drive cho Kinh Dịch
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#8F816F] hover:text-[#F3EFE6] p-1.5 rounded-lg hover:bg-[#251E17] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workspace Navigation Tabs */}
        <div className="flex items-center gap-1 px-4 sm:px-6 pt-3 bg-[#13100D] border-b border-[#271E15] overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => {
              setActiveTab("docs");
              setStatusMessage(null);
            }}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs font-semibold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === "docs"
                ? "bg-[#1F1913] text-[#4285F4] border-[#4285F4]"
                : "text-[#A89882] hover:text-[#DDD0BE] border-transparent hover:bg-[#1A1510]"
            }`}
          >
            <FileText className="w-4 h-4 text-[#4285F4]" />
            <span>Google Docs</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("sheets");
              setStatusMessage(null);
            }}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs font-semibold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === "sheets"
                ? "bg-[#1F1913] text-[#34A853] border-[#34A853]"
                : "text-[#A89882] hover:text-[#DDD0BE] border-transparent hover:bg-[#1A1510]"
            }`}
          >
            <Table className="w-4 h-4 text-[#34A853]" />
            <span>Google Sheets</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("gmail");
              setStatusMessage(null);
            }}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs font-semibold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === "gmail"
                ? "bg-[#1F1913] text-[#EA4335] border-[#EA4335]"
                : "text-[#A89882] hover:text-[#DDD0BE] border-transparent hover:bg-[#1A1510]"
            }`}
          >
            <Mail className="w-4 h-4 text-[#EA4335]" />
            <span>Gmail</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("picker");
              setStatusMessage(null);
            }}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs font-semibold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === "picker"
                ? "bg-[#1F1913] text-[#C9A55A] border-[#C9A55A]"
                : "text-[#A89882] hover:text-[#DDD0BE] border-transparent hover:bg-[#1A1510]"
            }`}
          >
            <HardDrive className="w-4 h-4 text-[#C9A55A]" />
            <span>Drive & Picker</span>
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
              <div className="flex-1 leading-relaxed">
                <div>{statusMessage.text}</div>
                {statusMessage.actionUrl && (
                  <a
                    href={statusMessage.actionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-bold mt-1.5 underline hover:text-[#FFF]"
                  >
                    <span>{statusMessage.actionText || "Mở liên kết"}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
              <button
                onClick={() => setStatusMessage(null)}
                className="opacity-70 hover:opacity-100 p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Google Account Bar */}
          <div className="bg-[#120F0C] border border-[#2B2217] rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
            {user ? (
              <div className="flex items-center gap-3 w-full sm:w-auto">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "Avatar"}
                    className="w-9 h-9 rounded-full border border-[#C9A55A]/50 object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#2C2114] border border-[#443623] flex items-center justify-center text-[#C9A55A] font-bold text-xs">
                    {(user.displayName || user.email || "G").charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="text-xs font-bold text-[#F3EFE6]">
                    {user.displayName || "Người dùng Google"}
                  </div>
                  <div className="text-[11px] text-[#A69780] font-mono">{user.email}</div>
                  <div className="text-[10px] text-[#34A853] flex items-center gap-1 font-medium">
                    <Check className="w-3 h-3" /> Đã liên kết Google Docs, Sheets, Gmail & Drive
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-0.5 text-center sm:text-left">
                <div className="text-xs font-bold text-[#E8DCC8]">Tài khoản Google Workspace</div>
                <p className="text-[11px] text-[#8C7D6B]">
                  Đăng nhập để đồng bộ quẻ vào Google Docs, Sheets, Gmail và Drive.
                </p>
              </div>
            )}

            <div>
              {user ? (
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#A89882] hover:text-[#E2837D] border border-[#3A2E20] hover:border-[#632924] rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Đăng xuất
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSigningIn}
                  onClick={handleSignIn}
                  className="flex items-center gap-2.5 px-3.5 py-1.5 bg-white text-gray-800 hover:bg-gray-100 rounded-lg font-medium text-xs shadow transition-all border border-gray-300 disabled:opacity-50 cursor-pointer"
                >
                  {isSigningIn ? (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  ) : (
                    <svg className="w-3.5 h-3.5" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                    </svg>
                  )}
                  <span>Đăng nhập Google</span>
                </button>
              )}
            </div>
          </div>

          {/* Current Reading Context Card */}
          <div className="bg-[#120F0C] border border-[#2F2417] rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4 text-[#C9A55A]" />
              <div>
                <span className="text-[#8C7D6B]">Quẻ hiện thời: </span>
                {readingData?.primaryHexagram ? (
                  <span className="font-bold text-[#EAD8B1]">
                    Quẻ {readingData.primaryHexagram.number}: {readingData.primaryHexagram.name} ({readingData.primaryHexagram.vietnameseName})
                  </span>
                ) : (
                  <span className="text-[#8C7D6B] italic">Chưa chọn quẻ (bạn có thể bốc quẻ ở màn hình chính)</span>
                )}
              </div>
            </div>
            {readingData?.question && (
              <div className="text-[11px] text-[#A69780] truncate max-w-[200px]">
                "{readingData.question}"
              </div>
            )}
          </div>

          {/* ==================== TAB 1: GOOGLE DOCS ==================== */}
          {activeTab === "docs" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-[#1B1611] border border-[#4285F4]/30 rounded-xl p-4 space-y-3.5">
                <div className="flex items-center gap-2.5 text-[#4285F4]">
                  <FileText className="w-5 h-5" />
                  <h4 className="font-bold text-sm text-[#F5EAD4]">
                    Xuất Toàn Văn Luận Giải Sang Google Docs
                  </h4>
                </div>
                <p className="text-xs text-[#A89882] leading-relaxed">
                  Hệ thống sẽ tự động tạo một tài liệu Google Docs mới với bố cục trang nhã: Thoán từ, Tượng quẻ, Hào động chi tiết và bài phân tích của Dịch học AI.
                </p>

                <div className="space-y-1.5 pt-1">
                  <label className="text-xs text-[#C8B89E] font-medium block">
                    Tiêu đề tài liệu Google Doc:
                  </label>
                  <input
                    type="text"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    placeholder="Ví dụ: Luận Giải Kinh Dịch - Dự Định Kinh Doanh 2026"
                    className="w-full bg-[#120F0C] border border-[#3E3022] text-[#F5EAD4] text-xs rounded-lg px-3 py-2.5 focus:border-[#4285F4] outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    disabled={isGeneratingDoc || !readingData?.primaryHexagram}
                    onClick={handleCreateGoogleDoc}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-[#4285F4] to-[#2B6CB0] hover:from-[#5A95F5] hover:to-[#3177C2] text-white font-bold text-xs rounded-xl shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isGeneratingDoc ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Đang tạo tài liệu trên Google Docs...</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4" />
                        <span>Tạo Google Doc & Mở Chỉnh Sửa</span>
                      </>
                    )}
                  </button>
                </div>

                {lastCreatedDoc && (
                  <div className="p-3 bg-[#131924] border border-[#233A5C] rounded-lg flex items-center justify-between text-xs text-[#93C5FD] mt-2">
                    <div className="flex items-center gap-2 truncate">
                      <Check className="w-4 h-4 text-[#34A853]" />
                      <span className="truncate">{lastCreatedDoc.title}</span>
                    </div>
                    <a
                      href={lastCreatedDoc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[#4285F4] hover:underline font-bold shrink-0 ml-2"
                    >
                      <span>Mở Google Doc</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== TAB 2: GOOGLE SHEETS ==================== */}
          {activeTab === "sheets" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-[#1B1611] border border-[#34A853]/30 rounded-xl p-4 space-y-3.5">
                <div className="flex items-center gap-2.5 text-[#34A853]">
                  <Table className="w-5 h-5" />
                  <h4 className="font-bold text-sm text-[#F5EAD4]">
                    Đồng Bộ Nhật Ký Bốc Quẻ Vào Google Sheets
                  </h4>
                </div>
                <p className="text-xs text-[#A89882] leading-relaxed">
                  Lưu trữ có cấu trúc các lần chiêm bái để dễ dàng theo dõi xác suất, thời gian nghiệm chứng và kết quả thực tế qua thời gian.
                </p>

                {/* Mode Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <label
                    className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                      sheetMode === "create_new"
                        ? "bg-[#17251B] border-[#34A853] text-[#FFF]"
                        : "bg-[#120F0C] border-[#312519] text-[#A69780]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="sheet_mode"
                      checked={sheetMode === "create_new"}
                      onChange={() => setSheetMode("create_new")}
                      className="accent-[#34A853]"
                    />
                    <div>
                      <div className="text-xs font-bold">Tạo Bảng Tính Mới</div>
                      <div className="text-[10px] text-[#8C7D6B]">Tự động tạo bảng & đặt các cột chuẩn</div>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                      sheetMode === "append_existing"
                        ? "bg-[#17251B] border-[#34A853] text-[#FFF]"
                        : "bg-[#120F0C] border-[#312519] text-[#A69780]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="sheet_mode"
                      checked={sheetMode === "append_existing"}
                      onChange={() => setSheetMode("append_existing")}
                      className="accent-[#34A853]"
                    />
                    <div>
                      <div className="text-xs font-bold">Ghi Vào Bảng Tính Đã Có</div>
                      <div className="text-[10px] text-[#8C7D6B]">Thêm một hàng mới vào bảng tính hiện hữu</div>
                    </div>
                  </label>
                </div>

                {sheetMode === "append_existing" && (
                  <div className="space-y-1 pt-1">
                    <label className="text-xs text-[#C8B89E] font-medium block">
                      Google Spreadsheet ID hoặc Liên kết:
                    </label>
                    <input
                      type="text"
                      value={spreadsheetIdInput}
                      onChange={(e) => setSpreadsheetIdInput(e.target.value)}
                      placeholder="Ví dụ: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                      className="w-full bg-[#120F0C] border border-[#3E3022] text-[#F5EAD4] text-xs rounded-lg px-3 py-2.5 focus:border-[#34A853] outline-none font-mono"
                    />
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="button"
                    disabled={isProcessingSheet || !readingData?.primaryHexagram}
                    onClick={handleSyncGoogleSheet}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-[#34A853] to-[#25793C] hover:from-[#40BD62] hover:to-[#2B8A44] text-white font-bold text-xs rounded-xl shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isProcessingSheet ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Đang xử lý dữ liệu với Google Sheets...</span>
                      </>
                    ) : (
                      <>
                        <Table className="w-4 h-4" />
                        <span>
                          {sheetMode === "create_new"
                            ? "Khởi Tạo Bảng & Ghi Quẻ Vào Google Sheets"
                            : "Thêm Bản Ghi Mới Vào Google Sheets"}
                        </span>
                      </>
                    )}
                  </button>
                </div>

                {lastUpdatedSheet && (
                  <div className="p-3 bg-[#132317] border border-[#204928] rounded-lg flex items-center justify-between text-xs text-[#A7F3D0] mt-2">
                    <div className="flex items-center gap-2 truncate">
                      <Check className="w-4 h-4 text-[#34A853]" />
                      <span className="truncate">Đã đồng bộ vào bảng tính: {lastUpdatedSheet.title}</span>
                    </div>
                    <a
                      href={lastUpdatedSheet.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[#34A853] hover:underline font-bold shrink-0 ml-2"
                    >
                      <span>Mở Google Sheets</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}

                {sheetPreviewRows.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    <div className="text-[11px] text-[#A89882] font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Các hàng mới nhất trong trang tính:
                    </div>
                    <div className="overflow-x-auto border border-[#3E3022] rounded-lg bg-[#120F0C]">
                      <table className="w-full text-[11px] text-left">
                        <tbody className="divide-y divide-[#2B2117]">
                          {sheetPreviewRows.map((r, i) => (
                            <tr key={i} className="hover:bg-[#1A1510]">
                              {r.slice(0, 4).map((c, ci) => (
                                <td key={ci} className="px-2.5 py-1.5 text-[#DDD0BE] truncate max-w-[150px]">
                                  {c}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== TAB 3: GMAIL ==================== */}
          {activeTab === "gmail" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-[#1B1611] border border-[#EA4335]/30 rounded-xl p-4 space-y-3.5">
                <div className="flex items-center gap-2.5 text-[#EA4335]">
                  <Mail className="w-5 h-5" />
                  <h4 className="font-bold text-sm text-[#F5EAD4]">
                    Gửi Thư Báo Cáo Luận Giải Qua Gmail
                  </h4>
                </div>
                <p className="text-xs text-[#A89882] leading-relaxed">
                  Soạn và gửi báo cáo phân tích quẻ trực tiếp qua hộp thư Gmail của bạn tới bạn bè, đối tác hoặc chính mình.
                </p>

                <div className="space-y-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-xs text-[#C8B89E] font-medium block">
                      Gửi đến địa chỉ Email (To):
                    </label>
                    <input
                      type="email"
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                      placeholder="nhap.email.nhan@gmail.com"
                      className="w-full bg-[#120F0C] border border-[#3E3022] text-[#F5EAD4] text-xs rounded-lg px-3 py-2 focus:border-[#EA4335] outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-[#C8B89E] font-medium block">
                      Tiêu đề thư (Subject):
                    </label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Ví dụ: [Kinh Dịch] Kết quả quẻ hỏi về công việc"
                      className="w-full bg-[#120F0C] border border-[#3E3022] text-[#F5EAD4] text-xs rounded-lg px-3 py-2 focus:border-[#EA4335] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    disabled={isSendingEmail || !readingData?.primaryHexagram}
                    onClick={() => handleSendEmail(false)}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-[#EA4335] to-[#C5221F] hover:from-[#F05545] hover:to-[#D93025] text-white font-bold text-xs rounded-xl shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isSendingEmail ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Đang gửi thư qua Gmail...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Gửi Thư Qua Gmail Ngay</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={isSendingEmail || !readingData?.primaryHexagram}
                    onClick={() => handleSendEmail(true)}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 bg-[#231A17] hover:bg-[#31231E] border border-[#52302A] text-[#FCA5A5] font-semibold text-xs rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Lưu Vào Hộp Thư Nháp</span>
                  </button>
                </div>

                {emailSuccessNote && (
                  <div className="p-3 bg-[#241716] border border-[#592723] rounded-lg text-xs text-[#FCA5A5] flex items-center justify-between">
                    <span>{emailSuccessNote}</span>
                    <a
                      href="https://mail.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-bold text-white ml-2 flex items-center gap-1"
                    >
                      Mở Gmail <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== TAB 4: GOOGLE DRIVE & PICKER ==================== */}
          {activeTab === "picker" && (
            <div className="space-y-4 animate-in fade-in duration-150">
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
                      Mở Google Picker lọc hình ảnh/video để làm tranh quẻ hoặc lưng bài.
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
                      Duyệt Toàn Bộ Tệp Drive
                    </div>
                    <div className="text-[11px] text-[#A69780] leading-snug">
                      Mở giao diện Picker đầy đủ để tìm kiếm tài liệu trên Google Drive.
                    </div>
                  </div>
                </button>
              </div>

              {/* Picked File Preview & Apply to Deck */}
              {activeFilePreview && (
                <div className="bg-[#1B1611] border border-[#483724] rounded-xl p-4 space-y-4">
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
                      className="text-[#8C7C68] hover:text-[#E2837D] p-1 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

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
                          name="picker_target_hub"
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
                          name="picker_target_hub"
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
                          {HEXAGRAMS.map((h) => (
                            <option key={h.number} value={h.number}>
                              Quẻ {h.number}: {h.name} ({h.vietnameseName})
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
                          <span>Đang cập nhật bộ bài...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>
                            Xác Nhận Áp Dụng (
                            {targetApplication === "back" ? "Mặt Lưng" : `Quẻ #${selectedHexNumber}`}
                            )
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Save Markdown to Drive button */}
              {readingData?.primaryHexagram && (
                <div className="bg-[#14110E] border border-[#2F2417] rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-[#EAD8B1] flex items-center gap-1.5">
                      <Download className="w-4 h-4 text-[#C9A55A]" />
                      Lưu Toàn Bộ Lời Thoán & Bình Giải (.md) Lên Drive
                    </div>
                    <p className="text-[11px] text-[#8C7D6B]">
                      Tạo tệp Markdown lưu trực tiếp vào thư mục gốc Google Drive của bạn.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={isSavingToDrive}
                    onClick={handleSaveReadingToDrive}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#251D14] hover:bg-[#34271A] border border-[#483622] hover:border-[#C9A55A] text-xs text-[#EAD8B1] font-medium rounded-lg transition-all shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    {isSavingToDrive ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C9A55A]" />
                    ) : (
                      <Download className="w-3.5 h-3.5 text-[#C9A55A]" />
                    )}
                    <span>Lưu Tệp Lên Drive</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-[#14110E] border-t border-[#2B2116] flex items-center justify-between text-[11px] text-[#807261]">
          <span>Google Workspace (Docs, Sheets, Gmail, Drive) & Picker</span>
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
