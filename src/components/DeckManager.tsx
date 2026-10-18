import React, { useState, useEffect, useRef } from "react";
import {
  Upload,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
  Download,
  Search,
  Filter,
  Sparkles,
  Plus,
  Edit3,
  Copy,
  Check,
  Eye,
  RefreshCw,
  AlertCircle,
  X,
  Palette,
  ArrowRight,
  FolderUp,
  HardDrive,
  Crown,
  Lock,
} from "lucide-react";
import { HEXAGRAMS } from "../data/hexagrams";
import { Hexagram } from "../types";
import { CardVisual } from "./CardVisual";
import { GoogleDrivePickerModal } from "./GoogleDrivePickerModal";
import {
  cardImageStore,
  DeckInfo,
  fileToDataUrl,
  DEFAULT_DECK_ID,
} from "../services/cardImageStore";
import { AppUser } from "../services/authService";

interface DeckManagerProps {
  activeDeckId: string;
  onActiveDeckChanged: (newDeckId: string) => void;
  onClose?: () => void;
  currentUser?: AppUser | null;
  onOpenAuthModal?: (mode?: "login" | "register" | "upgrade") => void;
}

export const DeckManager: React.FC<DeckManagerProps> = ({
  activeDeckId,
  onActiveDeckChanged,
  onClose,
  currentUser,
  onOpenAuthModal,
}) => {
  const isVip = Boolean(currentUser?.isMember || currentUser?.isAdmin);

  // Decks list state
  const [decks, setDecks] = useState<DeckInfo[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<string>(activeDeckId || DEFAULT_DECK_ID);
  const [deckImages, setDeckImages] = useState<Record<number, string>>({});
  const [deckCardBack, setDeckCardBack] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter within the selected deck
  const [searchTerm, setSearchTerm] = useState("");
  const [filterState, setFilterState] = useState<"all" | "uploaded" | "missing">("all");

  // Batch upload state
  const [batchProgress, setBatchProgress] = useState<string | null>(null);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);

  // Zoom preview modal
  const [previewCard, setPreviewCard] = useState<{ hex: Hexagram; imageUrl: string } | null>(null);

  // Google Picker modal state
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  // Create Deck Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newDeckName, setNewDeckName] = useState("");
  const [newDeckDesc, setNewDeckDesc] = useState("");
  const [newDeckTheme, setNewDeckTheme] = useState<DeckInfo["themeStyle"]>("golden");

  // Edit Deck Modal
  const [editingDeck, setEditingDeck] = useState<DeckInfo | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  // Refs for file inputs
  const batchInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const singleCardInputRef = useRef<HTMLInputElement>(null);
  const targetCardNumRef = useRef<number | null>(null);

  // Load all decks
  const refreshDeckList = async () => {
    try {
      const list = await cardImageStore.getDeckList();
      setDecks(list);
      return list;
    } catch (err) {
      console.error("Failed to load decks", err);
      return [];
    }
  };

  // Load images and back for the inspected deck
  const loadSelectedDeckData = async (deckId: string) => {
    setIsLoading(true);
    try {
      const [images, back] = await Promise.all([
        cardImageStore.getDeckImages(deckId),
        cardImageStore.getDeckCardBack(deckId),
      ]);
      setDeckImages(images);
      setDeckCardBack(back);
    } catch (err) {
      console.error(`Failed to load data for deck ${deckId}`, err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshDeckList();
  }, []);

  useEffect(() => {
    if (selectedDeckId) {
      loadSelectedDeckData(selectedDeckId);
    }
  }, [selectedDeckId]);

  // Keep selected deck in sync if activeDeckId changes from parent
  useEffect(() => {
    if (activeDeckId && activeDeckId !== selectedDeckId) {
      setSelectedDeckId(activeDeckId);
    }
  }, [activeDeckId]);

  // The deck currently being viewed/edited
  const currentDeck = decks.find((d) => d.id === selectedDeckId) || decks[0];
  const uploadedCount = Object.keys(deckImages).length;

  // Filter hexagrams in current view
  const filteredHexagrams = HEXAGRAMS.filter((hex) => {
    const hasImage = !!deckImages[hex.number];
    if (filterState === "uploaded" && !hasImage) return false;
    if (filterState === "missing" && hasImage) return false;

    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    return (
      hex.name.toLowerCase().includes(term) ||
      hex.vietnameseName.toLowerCase().includes(term) ||
      hex.number.toString() === term ||
      hex.hanzi.includes(term)
    );
  });

  // Handle switching the app's active deck
  const handleSelectActiveDeck = async (deckId: string) => {
    await cardImageStore.setActiveDeckId(deckId);
    setSelectedDeckId(deckId);
    onActiveDeckChanged(deckId);
    await refreshDeckList();
  };

  // Handle creating a new deck
  const handleCreateDeckSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeckName.trim()) return;

    try {
      const created = await cardImageStore.createNewDeck(newDeckName, newDeckDesc, newDeckTheme);
      setIsCreateModalOpen(false);
      setNewDeckName("");
      setNewDeckDesc("");
      const updatedList = await refreshDeckList();
      setSelectedDeckId(created.id);
      onActiveDeckChanged(created.id);
    } catch (err) {
      console.error("Create deck failed", err);
      alert("Không thể tạo bộ bài mới.");
    }
  };

  // Handle updating deck info
  const handleEditDeckSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDeck || !editName.trim()) return;

    try {
      await cardImageStore.updateDeck(editingDeck.id, {
        name: editName.trim(),
        description: editDesc.trim(),
      });
      setEditingDeck(null);
      await refreshDeckList();
    } catch (err) {
      console.error("Edit deck failed", err);
      alert("Không thể cập nhật bộ bài.");
    }
  };

  // Handle duplicating a deck
  const handleDuplicateDeck = async (deckId: string) => {
    try {
      const source = decks.find((d) => d.id === deckId);
      const name = prompt("Nhập tên cho bản sao bộ bài:", `${source?.name || "Bộ Bài"} (Bản Sao)`);
      if (!name) return;

      const duplicated = await cardImageStore.duplicateDeck(deckId, name);
      await refreshDeckList();
      setSelectedDeckId(duplicated.id);
      onActiveDeckChanged(duplicated.id);
    } catch (err) {
      console.error("Duplicate failed", err);
      alert("Không thể nhân bản bộ bài.");
    }
  };

  // Handle deleting a deck
  const handleDeleteDeck = async (deckId: string) => {
    const target = decks.find((d) => d.id === deckId);
    if (!target) return;
    if (target.isPreset) {
      alert("Không thể xóa bộ bài mặc định của hệ thống.");
      return;
    }

    if (
      confirm(
        `Bạn có chắc chắn muốn xóa bộ bài "${target.name}" và toàn bộ ảnh trong bộ này không? Hành động này không thể hoàn tác.`
      )
    ) {
      try {
        await cardImageStore.deleteDeck(deckId);
        const updated = await refreshDeckList();
        const nextId = updated[0]?.id || "deck_golden";
        setSelectedDeckId(nextId);
        onActiveDeckChanged(nextId);
      } catch (err: any) {
        alert(err.message || "Xóa bộ bài thất bại.");
      }
    }
  };

  // Handle Single Card Upload trigger
  const triggerSingleCardUpload = (hexNumber: number) => {
    targetCardNumRef.current = hexNumber;
    if (singleCardInputRef.current) {
      singleCardInputRef.current.value = "";
      singleCardInputRef.current.click();
    }
  };

  // Handle Single Card File selected
  const handleSingleCardSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const targetNum = targetCardNumRef.current;
    if (!file || !targetNum || !currentDeck) return;

    try {
      const dataUrl = await fileToDataUrl(file);
      await cardImageStore.saveDeckCardImage(currentDeck.id, targetNum, dataUrl);
      setDeckImages((prev) => ({ ...prev, [targetNum]: dataUrl }));
      await refreshDeckList();
      if (currentDeck.id === activeDeckId) {
        onActiveDeckChanged(currentDeck.id);
      }
    } catch (err) {
      console.error("Upload single card failed", err);
      alert("Không thể lưu ảnh lá bài.");
    } finally {
      targetCardNumRef.current = null;
    }
  };

  // Handle Drag & Drop single file onto a card
  const handleDropOnCard = async (e: React.DragEvent, hexNumber: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentDeck) return;

    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    try {
      const dataUrl = await fileToDataUrl(file);
      await cardImageStore.saveDeckCardImage(currentDeck.id, hexNumber, dataUrl);
      setDeckImages((prev) => ({ ...prev, [hexNumber]: dataUrl }));
      await refreshDeckList();
      if (currentDeck.id === activeDeckId) {
        onActiveDeckChanged(currentDeck.id);
      }
    } catch (err) {
      console.error("Drop card failed", err);
      alert("Không thể lưu ảnh thả vào lá bài.");
    }
  };

  // Handle Delete Single Card Image
  const handleDeleteCardImage = async (hexNumber: number) => {
    if (!currentDeck) return;
    if (confirm(`Xóa ảnh đã nạp cho lá quẻ #${hexNumber}?`)) {
      await cardImageStore.removeDeckCardImage(currentDeck.id, hexNumber);
      setDeckImages((prev) => {
        const copy = { ...prev };
        delete copy[hexNumber];
        return copy;
      });
      await refreshDeckList();
      if (currentDeck.id === activeDeckId) {
        onActiveDeckChanged(currentDeck.id);
      }
    }
  };

  // Handle Batch Upload (Multiple images at once)
  const handleBatchUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !currentDeck) return;

    setIsProcessingBatch(true);
    setBatchProgress(`Đang chuẩn bị nạp ${files.length} ảnh...`);

    try {
      let matchedCount = 0;
      const fileList = Array.from(files);

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        setBatchProgress(`Đang xử lý ${i + 1}/${fileList.length}: ${file.name}...`);

        let targetNum: number | null = null;
        // Check number in filename e.g. "01.jpg", "card_12.png", "que-64.webp"
        const numMatch = file.name.match(/\b([1-9]|[1-5][0-9]|6[0-4])\b/);
        if (numMatch) {
          targetNum = parseInt(numMatch[1], 10);
        } else {
          // Check by name
          const lower = file.name.toLowerCase();
          const found = HEXAGRAMS.find((h) => lower.includes(h.name.toLowerCase()));
          if (found) {
            targetNum = found.number;
          }
        }

        // Sequential fallback if 64 files uploaded in alphabetical order
        if (!targetNum && fileList.length <= 64 && i < 64) {
          targetNum = i + 1;
        }

        if (targetNum && targetNum >= 1 && targetNum <= 64) {
          const dataUrl = await fileToDataUrl(file);
          await cardImageStore.saveDeckCardImage(currentDeck.id, targetNum, dataUrl);
          matchedCount++;
        }
      }

      await loadSelectedDeckData(currentDeck.id);
      await refreshDeckList();
      if (currentDeck.id === activeDeckId) {
        onActiveDeckChanged(currentDeck.id);
      }

      setBatchProgress(`Hoàn tất! Đã nạp thành công ${matchedCount} lá vào bộ "${currentDeck.name}".`);
      setTimeout(() => setBatchProgress(null), 4000);
    } catch (err) {
      console.error("Batch upload failed", err);
      setBatchProgress("Có lỗi xảy ra trong quá trình nạp ảnh hàng loạt.");
    } finally {
      setIsProcessingBatch(false);
      if (batchInputRef.current) {
        batchInputRef.current.value = "";
      }
    }
  };

  // Handle Card Back upload
  const handleBackUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentDeck) return;

    try {
      const dataUrl = await fileToDataUrl(file);
      await cardImageStore.saveDeckCardBack(currentDeck.id, dataUrl);
      setDeckCardBack(dataUrl);
      await refreshDeckList();
      if (currentDeck.id === activeDeckId) {
        onActiveDeckChanged(currentDeck.id);
      }
    } catch (err) {
      console.error("Card back upload failed", err);
      alert("Không thể lưu ảnh mặt sau.");
    } finally {
      if (backInputRef.current) {
        backInputRef.current.value = "";
      }
    }
  };

  // Remove custom card back
  const handleRemoveBack = async () => {
    if (!currentDeck) return;
    if (confirm("Xóa ảnh mặt sau tùy chỉnh và hoàn nguyên về mặt sau chủ đề gốc?")) {
      await cardImageStore.removeDeckCardBack(currentDeck.id);
      const defaultBack = await cardImageStore.getDeckCardBack(currentDeck.id);
      setDeckCardBack(defaultBack);
      await refreshDeckList();
      if (currentDeck.id === activeDeckId) {
        onActiveDeckChanged(currentDeck.id);
      }
    }
  };

  // Export Deck
  const handleExportDeck = async (deckId: string) => {
    try {
      const bundle = await cardImageStore.exportDeckBundle(deckId);
      const safeName = (bundle.deck?.name || "bo_bai_kinh_dich")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "_");
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(bundle));
      const a = document.createElement("a");
      a.href = dataStr;
      a.download = `${safeName}_64_la_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("Export deck failed", err);
      alert("Xuất bộ bài thất bại.");
    }
  };

  // Import Deck
  const handleImportDeck = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bundle = JSON.parse(evt.target?.result as string);
        const { deck, count } = await cardImageStore.importDeckBundle(bundle);
        const updatedList = await refreshDeckList();
        setSelectedDeckId(deck.id);
        onActiveDeckChanged(deck.id);
        alert(`Đã nhập thành công bộ bài "${deck.name}" với ${count} lá bài!`);
      } catch (err) {
        console.error("Import failed", err);
        alert("Tệp bộ bài JSON không hợp lệ hoặc bị lỗi định dạng.");
      } finally {
        if (importInputRef.current) {
          importInputRef.current.value = "";
        }
      }
    };
    reader.readAsText(file);
  };

  // Clear all images in deck
  const handleClearAllInDeck = async () => {
    if (!currentDeck) return;
    if (
      confirm(
        `Bạn có chắc chắn muốn xóa TOÀN BỘ ảnh lá bài đã nạp trong bộ "${currentDeck.name}"? Thao tác này không thể hoàn tác.`
      )
    ) {
      await cardImageStore.clearDeckImages(currentDeck.id);
      setDeckImages({});
      await refreshDeckList();
      if (currentDeck.id === activeDeckId) {
        onActiveDeckChanged(currentDeck.id);
      }
    }
  };

  if (currentUser !== undefined && !isVip) {
    return (
      <div className="royal-frame p-6 sm:p-10 text-center max-w-xl mx-auto my-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <span className="royal-corner tl" />
        <span className="royal-corner tr" />
        <span className="royal-corner bl" />
        <span className="royal-corner br" />

        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-amber-500/25 to-amber-700/10 border border-gold-600/60 flex items-center justify-center text-gold-400 shadow-xl">
          <Crown className="w-8 h-8 text-amber-400 animate-pulse" />
        </div>

        <div className="royal-eyebrow mt-4">Đặc Quyền Hội Viên VIP Cửu Nhị</div>

        <h3 className="royal-title mt-2 text-2xl sm:text-3xl text-gold-200">
          Thư Viện Bộ Hình 64 Quẻ
        </h3>

        <p className="text-sm font-serif text-ivory-300 leading-relaxed mt-3 max-w-md mx-auto">
          Tính năng xem trọn bộ tranh 64 quẻ vẽ tay nghệ thuật, chuyển đổi linh hoạt giữa các bộ bài độc quyền (Bộ Quân Tử, Bộ 1 Có Chữ, Bộ 2, Bộ Không Chữ) và tùy biến nạp ảnh cá nhân là đặc quyền dành riêng cho <strong>Hội Viên VIP</strong>.
        </p>

        <div className="p-4 rounded-xl bg-lacquer-900/90 border border-gold-800/80 text-left space-y-2 mt-5 text-xs font-serif text-ivory-400">
          <div className="flex items-center gap-2 text-gold-300 font-bold">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Đặc quyền mở khóa cho Hội Viên VIP:</span>
          </div>
          <div className="flex items-start gap-2 pl-6">
            <span className="text-gold-500">•</span>
            <span>Truy cập trọn bộ 64 lá bài tranh vẽ sơn mài cổ truyền & chiêm tinh huyền bí</span>
          </div>
          <div className="flex items-start gap-2 pl-6">
            <span className="text-gold-500">•</span>
            <span>Tự do đổi giữa 4 bộ bài nguyên bản: Bộ Quân Tử, Bộ Có Chữ 1 & 2, Bộ Không Chữ</span>
          </div>
          <div className="flex items-start gap-2 pl-6">
            <span className="text-gold-500">•</span>
            <span>Tải lên bộ bài cá nhân, thay đổi hình ảnh từng quẻ và sao lưu dữ liệu riêng</span>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (onOpenAuthModal) {
                onOpenAuthModal(currentUser ? "upgrade" : "login");
              }
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-gold-500 via-amber-400 to-gold-600 text-stone-950 font-serif font-bold text-sm shadow-lg shadow-amber-950/60 hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Crown className="w-4 h-4 text-stone-950" />
            <span>{currentUser ? "Nâng Cấp Hội Viên VIP (1.000.000 VNĐ/Năm)" : "Đăng Nhập / Đăng Ký VIP"}</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-lacquer-800 hover:bg-lacquer-700 text-ivory-300 border border-gold-800/80 font-serif text-xs font-semibold transition-all cursor-pointer"
            >
              Về Sách Thuyết Minh
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={batchInputRef}
        onChange={handleBatchUpload}
        accept="image/*"
        multiple
        className="hidden"
      />
      <input
        type="file"
        ref={backInputRef}
        onChange={handleBackUpload}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={importInputRef}
        onChange={handleImportDeck}
        accept=".json"
        className="hidden"
      />
      <input
        type="file"
        ref={singleCardInputRef}
        onChange={handleSingleCardSelected}
        accept="image/*"
        className="hidden"
      />

      {/* TOP BANNER & INTRODUCTION */}
      <div className="bg-gradient-to-r from-[#1C1813] via-[#262018] to-[#1C1813] border border-[#443828] rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C9A55A]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-0.5 rounded-full bg-[#302619] border border-[#52422C] text-[#D6B97A] text-xs font-serif flex items-center gap-1.5 shadow">
                <Palette className="w-3.5 h-3.5" /> Quản Lý & Lựa Chọn Bộ Hình
              </span>
              <span className="text-xs text-[#9E907D]">
                Tổng cộng: <strong className="text-[#F5EAD4] font-mono">{decks.length}</strong> bộ hình
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#F5EAD4] tracking-wide">
              BỘ HÌNH 64 QUẺ KINH DỊCH
            </h2>
            <p className="text-xs sm:text-sm text-[#B8AA95] font-serif mt-1 max-w-2xl leading-relaxed">
              Bạn có thể lựa chọn các bộ hình mẫu có sẵn hoặc tự tạo các bộ hình tùy chỉnh riêng, nạp ảnh minh họa cho đủ 64 quẻ và tải lên mặt sau của lá bài.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#C89B3C] to-[#E2C37A] hover:brightness-110 text-[#14120F] font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Tạo Bộ Hình Mới
            </button>
            <button
              type="button"
              onClick={() => importInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#221C16] hover:bg-[#30261D] border border-[#443828] text-[#E5D7C0] text-xs font-medium rounded-xl shadow transition-colors cursor-pointer"
              title="Nhập bộ bài từ tệp .json"
            >
              <FolderUp className="w-4 h-4 text-[#C9A55A]" />
              Nhập Tệp JSON
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: DECK SELECTOR (CHỌN BỘ HÌNH ĐỂ SỬ DỤNG) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#C9A55A]" />
            <h3 className="text-sm font-serif font-bold text-[#F3E7D0] uppercase tracking-wider">
              Chọn Bộ Hình Đang Dùng & Quản Lý
            </h3>
          </div>
          <span className="text-xs text-[#9E8F7A]">
            Bấm vào bất kỳ bộ nào để nạp ảnh hoặc kích hoạt dùng cho việc bốc bài
          </span>
        </div>

        {/* Deck Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {decks.map((deck) => {
            const isActive = deck.id === activeDeckId;
            const isInspected = deck.id === selectedDeckId;

            return (
              <div
                key={deck.id}
                onClick={() => setSelectedDeckId(deck.id)}
                className={`relative rounded-2xl p-4 transition-all cursor-pointer flex flex-col justify-between border ${
                  isInspected
                    ? "bg-[#211B15] border-[#C9A55A] shadow-[0_0_20px_rgba(212,175,55,0.15)] ring-1 ring-[#C9A55A]/50"
                    : "bg-[#181410] border-[#33281C] hover:border-[#54422D] hover:bg-[#1C1712]"
                }`}
              >
                <div>
                  {/* Status & Tag Row */}
                  <div className="flex items-center justify-between gap-1.5 mb-2.5">
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold ${
                        deck.isPreset
                          ? "bg-[#292218] text-[#C9A55A] border border-[#483A26]"
                          : "bg-[#1A2624] text-emerald-300 border border-[#27443E]"
                      }`}
                    >
                      {deck.isPreset ? "Mẫu Hệ Thống" : "Bộ Tự Nạp"}
                    </span>

                    {isActive && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-700/50 px-2 py-0.5 rounded-full shadow">
                        <Check className="w-3 h-3" /> Đang Dùng
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h4 className="font-serif font-bold text-[#F5EAD4] text-sm group-hover:text-amber-300 flex items-center gap-1.5">
                    {deck.name}
                  </h4>
                  <p className="text-[11px] text-[#A89882] line-clamp-2 mt-1 min-h-[32px] leading-relaxed">
                    {deck.description || "Bộ bài 64 quẻ kinh dịch."}
                  </p>

                  {/* Progress: Card Count */}
                  <div className="mt-3 pt-3 border-t border-[#292015] space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#8C7D6A]">Ảnh đã nạp:</span>
                      <span className="font-mono font-bold text-[#D6B97A]">
                        {deck.cardCount || 0} / 64 lá
                      </span>
                    </div>
                    <div className="w-full bg-[#120F0C] rounded-full h-1.5 overflow-hidden border border-[#2C2114]">
                      <div
                        className="bg-gradient-to-r from-[#C89B3C] to-[#E2C37A] h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, ((deck.cardCount || 0) / 64) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions Bottom Bar */}
                <div className="mt-4 pt-2.5 border-t border-[#292015] flex items-center justify-between gap-1.5">
                  {isActive ? (
                    <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Đang kích hoạt
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectActiveDeck(deck.id);
                      }}
                      className="px-2.5 py-1 bg-[#2C2317] hover:bg-[#C89B3C] text-[#E5D7C0] hover:text-[#14120F] text-[11px] font-bold rounded-lg border border-[#483824] transition-all cursor-pointer"
                    >
                      Chọn Dùng Bộ Này
                    </button>
                  )}

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateDeck(deck.id);
                      }}
                      className="p-1 text-[#9E8F7A] hover:text-[#F3E7D0] hover:bg-[#2B2217] rounded transition-colors cursor-pointer"
                      title="Nhân bản bộ này"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportDeck(deck.id);
                      }}
                      className="p-1 text-[#9E8F7A] hover:text-[#F3E7D0] hover:bg-[#2B2217] rounded transition-colors cursor-pointer"
                      title="Xuất tệp JSON"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    {!deck.isPreset && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingDeck(deck);
                            setEditName(deck.name);
                            setEditDesc(deck.description || "");
                          }}
                          className="p-1 text-[#9E8F7A] hover:text-[#F3E7D0] hover:bg-[#2B2217] rounded transition-colors cursor-pointer"
                          title="Đổi tên bộ bài"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDeck(deck.id);
                          }}
                          className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded transition-colors cursor-pointer"
                          title="Xóa bộ bài"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Quick Add Deck Button Card */}
          <div
            onClick={() => setIsCreateModalOpen(true)}
            className="rounded-2xl p-5 border-2 border-dashed border-[#3A2D1F] hover:border-[#C89B3C] bg-[#14110E]/60 hover:bg-[#1A1510] transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2 group min-h-[160px]"
          >
            <div className="w-10 h-10 rounded-full bg-[#241C15] group-hover:bg-[#C89B3C] text-[#C9A55A] group-hover:text-[#14120F] flex items-center justify-center transition-all">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs font-serif font-bold text-[#D4C3A3] group-hover:text-[#FFF]">
              + Tạo Bộ Hình Mới
            </span>
            <span className="text-[11px] text-[#7A6D5A]">
              Tạo bộ sưu tập riêng để nạp 64 ảnh
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 2: CARD UPLOAD & VISUAL GRID FOR SELECTED DECK */}
      {currentDeck && (
        <div className="bg-[#14110E] border border-[#33281C] rounded-2xl p-5 sm:p-6 space-y-6 shadow-xl">
          {/* Header of the Inspected Deck */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-[#261E15]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-serif text-[#C9A55A] font-bold flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4" /> Đang nạp & quản lý ảnh cho bộ:
                </span>
                <span className="text-xs text-[#A89882] bg-[#1F1913] px-2 py-0.5 rounded border border-[#35281A]">
                  {uploadedCount}/64 lá đã nạp hình
                </span>
                {currentDeck.id === activeDeckId ? (
                  <span className="text-[11px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                    ✓ Bộ này đang được kích hoạt sử dụng
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSelectActiveDeck(currentDeck.id)}
                    className="text-[11px] text-[#C9A55A] hover:underline font-bold"
                  >
                    Bấm vào đây để chọn dùng bộ này →
                  </button>
                )}
              </div>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#F5EAD4]">
                {currentDeck.name}
              </h3>
              <p className="text-xs text-[#9E8F7A] font-serif mt-0.5">
                {currentDeck.description || "Bộ bài kinh dịch."}
              </p>
            </div>

            {/* Quick Action Buttons for this Deck */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => batchInputRef.current?.click()}
                disabled={isProcessingBatch}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#2D2317] hover:bg-[#3D3020] border border-[#52412B] text-[#F3E7D0] text-xs font-bold rounded-xl shadow transition-colors cursor-pointer"
              >
                <FolderUp className="w-4 h-4 text-[#C9A55A]" />
                Nạp Hàng Loạt 64 Lá
              </button>

              <button
                type="button"
                onClick={() => backInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#1F1A14] hover:bg-[#2A2219] border border-[#3A2D1F] text-[#D4C4AA] text-xs font-medium rounded-xl transition-colors cursor-pointer"
                title="Đổi mặt sau lá bài cho bộ này"
              >
                <Layers className="w-3.5 h-3.5 text-[#C9A55A]" />
                Đổi Mặt Sau
              </button>

              <button
                type="button"
                onClick={() => setIsGoogleModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#162033] hover:bg-[#1E2E4B] border border-[#2D4573] text-[#93C5FD] text-xs font-medium rounded-xl transition-colors cursor-pointer shadow"
                title="Mở Google Picker để chọn ảnh từ Google Drive cho bộ bài"
              >
                <HardDrive className="w-3.5 h-3.5 text-[#4285F4]" />
                Google Drive (Picker)
              </button>

              <button
                type="button"
                onClick={() => handleExportDeck(currentDeck.id)}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#1F1A14] hover:bg-[#2A2219] border border-[#3A2D1F] text-[#D4C4AA] text-xs font-medium rounded-xl transition-colors cursor-pointer"
                title="Sao lưu bộ bài này thành tệp JSON"
              >
                <Download className="w-3.5 h-3.5 text-[#C9A55A]" />
                Xuất JSON
              </button>

              {uploadedCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllInDeck}
                  className="flex items-center gap-1.5 px-2.5 py-2 bg-rose-950/30 hover:bg-rose-950/60 border border-rose-900/50 text-rose-300 text-xs font-medium rounded-xl transition-colors cursor-pointer"
                  title="Xóa toàn bộ ảnh đã nạp trong bộ bài này"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Xóa Hết Ảnh
                </button>
              )}
            </div>
          </div>

          {/* Batch Upload Progress Notification */}
          {batchProgress && (
            <div className="bg-[#1C1610] border border-[#C89B3C] text-[#F3E6C8] px-4 py-3 rounded-xl flex items-center justify-between gap-3 text-xs shadow-lg animate-pulse">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C9A55A]" />
                <span>{batchProgress}</span>
              </div>
              <button
                type="button"
                onClick={() => setBatchProgress(null)}
                className="text-[#9E8F7A] hover:text-[#FFF]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-[#7A6D5A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm quẻ (#1 - #64, tên quẻ, chữ Hán)..."
                className="w-full bg-[#100D0A] border border-[#2F2417] focus:border-[#C89B3C] rounded-xl pl-9 pr-3.5 py-2 text-xs text-[#EAE0D0] outline-none shadow-inner"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A6D5A] hover:text-[#FFF]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-[#100D0A] border border-[#2B2116] rounded-xl self-stretch sm:self-auto justify-center">
              <button
                type="button"
                onClick={() => setFilterState("all")}
                className={`px-3 py-1.5 text-xs rounded-lg transition-all cursor-pointer ${
                  filterState === "all"
                    ? "bg-[#C89B3C] text-[#121110] font-bold"
                    : "text-[#A89882] hover:text-[#FFF]"
                }`}
              >
                Tất Cả (64)
              </button>
              <button
                type="button"
                onClick={() => setFilterState("uploaded")}
                className={`px-3 py-1.5 text-xs rounded-lg transition-all cursor-pointer ${
                  filterState === "uploaded"
                    ? "bg-[#C89B3C] text-[#121110] font-bold"
                    : "text-[#A89882] hover:text-[#FFF]"
                }`}
              >
                Đã Nạp ({uploadedCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterState("missing")}
                className={`px-3 py-1.5 text-xs rounded-lg transition-all cursor-pointer ${
                  filterState === "missing"
                    ? "bg-[#C89B3C] text-[#121110] font-bold"
                    : "text-[#A89882] hover:text-[#FFF]"
                }`}
              >
                Chưa Nạp ({64 - uploadedCount})
              </button>
            </div>
          </div>

          {/* 64 CARDS VISUAL GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {filteredHexagrams.map((hex) => {
              const customUrl = deckImages[hex.number];

              return (
                <div
                  key={hex.number}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDropOnCard(e, hex.number)}
                  className={`group relative rounded-xl border transition-all duration-200 flex flex-col p-2 bg-[#120F0C] ${
                    customUrl
                      ? "border-[#4A3A25] hover:border-[#C9A55A] hover:bg-[#19140E]"
                      : "border-[#261E14] hover:border-[#3E3020] hover:bg-[#16120E]"
                  }`}
                >
                  {/* Card Header Tag */}
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] font-mono font-bold text-[#D6B97A]">
                      #{hex.number < 10 ? `0${hex.number}` : hex.number}
                    </span>
                    <span className="text-[10px] font-serif text-[#C4B49D] font-bold">
                      {hex.hanzi}
                    </span>
                  </div>

                  {/* Card Visual Slot */}
                  <div
                    onClick={() => {
                      if (customUrl) {
                        setPreviewCard({ hex, imageUrl: customUrl });
                      } else {
                        triggerSingleCardUpload(hex.number);
                      }
                    }}
                    className="relative aspect-[2/3] w-full rounded-lg overflow-hidden bg-[#18130D] border border-[#2D2216] flex items-center justify-center cursor-pointer shadow-inner group/slot"
                  >
                    {customUrl ? (
                      <img
                        src={customUrl}
                        alt={hex.name}
                        className="w-full h-full object-cover group-hover/slot:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-2 text-center text-[#6B5E4D] group-hover/slot:text-[#C9A55A] transition-colors">
                        <span className="text-xl font-serif mb-1 opacity-70">☯</span>
                        <span className="text-[10px] font-serif block font-bold text-[#B0A089]">
                          {hex.vietnameseName}
                        </span>
                        <span className="text-[9px] text-[#6B5E4D] mt-1 block">
                          + Tải ảnh lên
                        </span>
                      </div>
                    )}

                    {/* Hover Overlay Action on Slot */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/slot:opacity-100 transition-opacity flex items-center justify-center gap-2 p-1">
                      {customUrl ? (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewCard({ hex, imageUrl: customUrl });
                            }}
                            className="p-1.5 bg-[#2B2217] hover:bg-[#C89B3C] text-[#FFF] hover:text-[#14120F] rounded-lg transition-colors cursor-pointer shadow"
                            title="Xem phóng to"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerSingleCardUpload(hex.number);
                            }}
                            className="p-1.5 bg-[#2B2217] hover:bg-[#C89B3C] text-[#FFF] hover:text-[#14120F] rounded-lg transition-colors cursor-pointer shadow"
                            title="Đổi ảnh khác"
                          >
                            <Upload className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsGoogleModalOpen(true);
                            }}
                            className="p-1.5 bg-[#172033] hover:bg-[#202E48] text-[#93C5FD] rounded-lg transition-colors cursor-pointer shadow"
                            title="Chọn ảnh từ Google Drive (Google Picker)"
                          >
                            <HardDrive className="w-3.5 h-3.5 text-[#4285F4]" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCardImage(hex.number);
                            }}
                            className="p-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 rounded-lg transition-colors cursor-pointer shadow"
                            title="Xóa ảnh này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <span className="text-[11px] font-serif font-bold text-[#F3E7D0] flex items-center gap-1">
                          <Upload className="w-3.5 h-3.5" /> Bấm để nạp
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Footer Info */}
                  <div className="mt-2 text-center">
                    <h5 className="text-[11px] font-serif font-bold text-[#EAE0D0] truncate">
                      {hex.name}
                    </h5>
                    <span className="text-[9px] text-[#8C7E6C] truncate block">
                      {hex.vietnameseName}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredHexagrams.length === 0 && (
            <div className="py-12 text-center text-[#7A6D5A] space-y-2">
              <Search className="w-8 h-8 mx-auto text-[#483A27]" />
              <p className="text-xs font-serif">
                Không tìm thấy quẻ nào phù hợp với từ khóa "{searchTerm}".
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setFilterState("all");
                }}
                className="text-xs text-[#C9A55A] hover:underline"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}
        </div>
      )}

      {/* CREATE NEW DECK MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181410] border border-[#483A26] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-[#F5EAD4] flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#C9A55A]" />
                Tạo Bộ Hình Thẻ Bài Mới
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-[#8C7D6A] hover:text-[#FFF]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDeckSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#C9A55A] mb-1.5">
                  Tên bộ hình thẻ bài: <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newDeckName}
                  onChange={(e) => setNewDeckName(e.target.value)}
                  placeholder="VD: Bộ Tranh Thủy Mặc Cổ, Bộ Vẽ Tay 2026..."
                  className="w-full bg-[#100D0A] border border-[#3A2D1F] focus:border-[#C89B3C] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#F0E4D0] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#C9A55A] mb-1.5">
                  Mô tả ngắn:
                </label>
                <textarea
                  rows={2}
                  value={newDeckDesc}
                  onChange={(e) => setNewDeckDesc(e.target.value)}
                  placeholder="Ghi chú về nguồn ảnh, phong cách nghệ thuật..."
                  className="w-full bg-[#100D0A] border border-[#3A2D1F] focus:border-[#C89B3C] rounded-xl px-3.5 py-2 text-xs text-[#F0E4D0] outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#C9A55A] mb-1.5">
                  Mặt sau thẻ bài ban đầu:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "golden", label: "Hoàng Kim Sơn Son" },
                    { id: "ink", label: "Thủy Mặc Sơn Thủy" },
                    { id: "woodblock", label: "Cổ Thư Mộc Bản" },
                    { id: "mystic", label: "Huyền Bí Tinh Tú" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setNewDeckTheme(t.id as any)}
                      className={`p-2.5 rounded-xl border text-xs text-left transition-all ${
                        newDeckTheme === t.id
                          ? "bg-[#2D2317] border-[#C9A55A] text-[#F5EAD4] font-bold"
                          : "bg-[#120F0C] border-[#2A2015] text-[#9E8F7A] hover:bg-[#1A1510]"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#A89882] hover:text-[#FFF] rounded-xl"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#C89B3C] to-[#E2C37A] hover:brightness-110 text-[#14120F] font-bold text-xs rounded-xl shadow cursor-pointer"
                >
                  Tạo Bộ Hình
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT DECK MODAL */}
      {editingDeck && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181410] border border-[#483A26] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-[#F5EAD4] flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#C9A55A]" />
                Đổi Tên & Thông Tin Bộ Bài
              </h3>
              <button
                type="button"
                onClick={() => setEditingDeck(null)}
                className="text-[#8C7D6A] hover:text-[#FFF]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditDeckSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#C9A55A] mb-1.5">
                  Tên bộ bài:
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#100D0A] border border-[#3A2D1F] focus:border-[#C89B3C] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#F0E4D0] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#C9A55A] mb-1.5">
                  Mô tả:
                </label>
                <textarea
                  rows={2}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full bg-[#100D0A] border border-[#3A2D1F] focus:border-[#C89B3C] rounded-xl px-3.5 py-2 text-xs text-[#F0E4D0] outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingDeck(null)}
                  className="px-4 py-2 text-xs text-[#A89882] hover:text-[#FFF] rounded-xl"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#C89B3C] to-[#E2C37A] hover:brightness-110 text-[#14120F] font-bold text-xs rounded-xl shadow cursor-pointer"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL-SIZE CARD PREVIEW MODAL */}
      {previewCard && (
        <div
          onClick={() => setPreviewCard(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#181410] border border-[#52422C] rounded-2xl p-4 max-w-sm w-full shadow-2xl flex flex-col items-center gap-3 animate-scaleUp cursor-default"
          >
            <div className="w-full flex items-center justify-between pb-2 border-b border-[#2C2216]">
              <div>
                <span className="text-[10px] font-mono text-[#C9A55A] block">
                  Lá quẻ #{previewCard.hex.number}
                </span>
                <h4 className="font-serif font-bold text-base text-[#F5EAD4]">
                  {previewCard.hex.name} ({previewCard.hex.hanzi})
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setPreviewCard(null)}
                className="text-[#9E8F7A] hover:text-[#FFF] p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-full aspect-[2/3] max-h-[460px] rounded-xl overflow-hidden shadow-2xl border border-[#3D3020]">
              <img
                src={previewCard.imageUrl}
                alt={previewCard.hex.name}
                className="w-full h-full object-contain bg-[#0E0C09]"
              />
            </div>

            <div className="w-full flex items-center justify-between pt-1">
              <span className="text-xs text-[#A89882] font-serif">
                {previewCard.hex.vietnameseName}
              </span>
              <button
                type="button"
                onClick={() => {
                  triggerSingleCardUpload(previewCard.hex.number);
                  setPreviewCard(null);
                }}
                className="text-xs text-[#C9A55A] hover:underline font-serif flex items-center gap-1"
              >
                <Upload className="w-3.5 h-3.5" /> Đổi ảnh này
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Drive Picker Modal */}
      <GoogleDrivePickerModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        activeDeckId={currentDeck?.id || activeDeckId}
        onCardImageSet={async (hexNum, dataUrl) => {
          setDeckImages((prev) => ({ ...prev, [hexNum]: dataUrl }));
          await refreshDeckList();
          if (currentDeck?.id === activeDeckId) {
            onActiveDeckChanged(currentDeck.id);
          }
        }}
        onCardBackSet={async (dataUrl) => {
          setDeckCardBack(dataUrl);
          await refreshDeckList();
          if (currentDeck?.id === activeDeckId) {
            onActiveDeckChanged(currentDeck.id);
          }
        }}
      />
    </div>
  );
};
