import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Sparkles,
  Search,
  Upload,
  Image as ImageIcon,
  Trash2,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  FileUp,
  FileCode2,
  FileText,
  Copy,
  Check,
  HelpCircle,
  ArrowRight,
  Filter,
  CheckCircle2,
  Layers,
  BookOpen,
  Eye,
  Info,
  Compass,
  Flame,
  Droplets,
  Mountain,
  Trees,
  CircleDot,
  RefreshCw,
  Volume2,
  VolumeX,
  Play,
  Square,
  Waves,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";
import {
  SIXTY_JIAZI,
  JIAZI_BRANCH_LIST,
  JIAZI_CAN_LIST,
  JiaziEntry,
  getJiaziById,
  JiaziHexagramLink,
} from "../data/jiazi";
import {
  saveJiaziImage,
  getJiaziImage,
  getAllJiaziImages,
  removeJiaziImage,
  clearAllJiaziImages,
  exportJiaziBackupJSON,
  importJiaziBackupJSON,
  exportJiaziTemplateJSON,
  parseJiaziJSON,
  saveBatchJiaziImages,
  ParsedJiaziResult,
  ParsedJiaziItem,
  subscribeJiaziImageChanges,
} from "../services/jiaziImageStore";
import { jiaziSoundSynthesizer } from "../services/jiaziSoundSynthesizer";
import { JiaziSoundTable } from "./JiaziSoundTable";
import { JiaziHexagramTable } from "./JiaziHexagramTable";
import { BaziExtendedFortune } from "./BaziExtendedFortune";
import { JiaziLucNhamSection } from "./JiaziLucNhamSection";
import { HEXAGRAMS } from "../data/hexagrams";
import { CardVisual } from "./CardVisual";
import { downloadDataUrlAsPng } from "../utils/captureHelper";

export interface JiaziSectionProps {
  onSelectHexagram?: (hexNumber: number) => void;
  cardImages?: Record<number, string>;
  onImageUpdated?: (hexNumber: number, newUrl: string) => void;
}

export const JiaziSection: React.FC<JiaziSectionProps> = ({
  onSelectHexagram,
  cardImages = {},
  onImageUpdated,
}) => {
  // All stored images: { [canChiId]: dataUrl }
  const [images, setImages] = useState<Record<string, string>>({});
  const [selectedId, setSelectedId] = useState<string>("giap_ty");
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [selectedCan, setSelectedCan] = useState<string>("all");
  const [imageFilter, setImageFilter] = useState<"all" | "has_image" | "no_image">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"detail" | "full_image" | "grid" | "sounds" | "hexagrams">("detail");
  const [hexagramModalData, setHexagramModalData] = useState<JiaziHexagramLink | null>(null);
  const [detailImageTab, setDetailImageTab] = useState<"jiazi" | "hexagram">("jiazi");
  const [fullImageTab, setFullImageTab] = useState<"jiazi" | "hexagram">("jiazi");
  // Chế độ hiển thị ảnh: "contain" = FULL (toàn bộ ảnh 100% không cắt xén, luôn mặc định), "cover" = Lấp đầy
  const [imageFitMode, setImageFitMode] = useState<"contain" | "cover">(() => {
    try {
      const saved = localStorage.getItem("jiazi_image_fit_mode");
      return saved === "cover" ? "cover" : "contain";
    } catch {
      return "contain";
    }
  });
  const [lightboxZoom, setLightboxZoom] = useState<number>(1);
  const [playingSoundType, setPlayingSoundType] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [isUploadingBatch, setIsUploadingBatch] = useState<boolean>(false);
  const [batchUploadStatus, setBatchUploadStatus] = useState<string | null>(null);
  const [isUrlModalOpen, setIsUrlModalOpen] = useState<boolean>(false);
  const [inputImageUrl, setInputImageUrl] = useState<string>("");

  // Hexagram link search & lookup states
  const [selectedHexagram, setSelectedHexagram] = useState<string>("all");
  const [isHexLookupModalOpen, setIsHexLookupModalOpen] = useState<boolean>(false);
  const [hexLookupQuery, setHexLookupQuery] = useState<string>("");
  const [hexLookupTrigram, setHexLookupTrigram] = useState<string>("all");

  // JSON import states & modals
  const [isJsonModalOpen, setIsJsonModalOpen] = useState<boolean>(false);
  const [jsonModalTab, setJsonModalTab] = useState<"file" | "paste" | "template">("file");
  const [pastedJson, setPastedJson] = useState<string>("");
  const [parsedJsonData, setParsedJsonData] = useState<ParsedJiaziResult | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [jsonSuccessMsg, setJsonSuccessMsg] = useState<string | null>(null);
  const [isImportingJson, setIsImportingJson] = useState<boolean>(false);
  const [copiedTemplate, setCopiedTemplate] = useState<boolean>(false);
  const jsonFileInputInModalRef = useRef<HTMLInputElement>(null);

  const handleToggleImageFitMode = () => {
    setImageFitMode((prev) => {
      const next = prev === "contain" ? "cover" : "contain";
      try {
        localStorage.setItem("jiazi_image_fit_mode", next);
      } catch {}
      return next;
    });
  };

  const singleFileInputRef = useRef<HTMLInputElement>(null);
  const batchFileInputRef = useRef<HTMLInputElement>(null);
  const jsonImportInputRef = useRef<HTMLInputElement>(null);

  // Play / Stop sound handler
  const handleTogglePlaySound = (soundType: string) => {
    if (playingSoundType === soundType) {
      jiaziSoundSynthesizer.stopSound();
      setPlayingSoundType(null);
    } else {
      jiaziSoundSynthesizer.playSound(soundType, () => {
        setPlayingSoundType(null);
      });
      setPlayingSoundType(soundType);
    }
  };

  // Stop sound on unmount
  useEffect(() => {
    return () => {
      jiaziSoundSynthesizer.stopSound();
    };
  }, []);

  // Load images on mount and subscribe to changes
  useEffect(() => {
    let isMounted = true;
    getAllJiaziImages().then((loaded) => {
      if (isMounted) setImages(loaded);
    });

    const unsubscribe = subscribeJiaziImageChanges(() => {
      getAllJiaziImages().then((loaded) => {
        if (isMounted) setImages(loaded);
      });
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const selectedEntry = useMemo(() => {
    return getJiaziById(selectedId) || SIXTY_JIAZI[0];
  }, [selectedId]);

  // Filtered list
  const filteredJiazi = useMemo(() => {
    return SIXTY_JIAZI.filter((item) => {
      if (selectedBranch !== "all" && item.branchGroup !== selectedBranch) {
        return false;
      }
      if (selectedCan !== "all" && item.can !== selectedCan) {
        return false;
      }
      if (selectedHexagram !== "all" && item.hexagramLink?.hexagramNumber.toString() !== selectedHexagram) {
        return false;
      }
      if (imageFilter === "has_image" && !images[item.id]) {
        return false;
      }
      if (imageFilter === "no_image" && !!images[item.id]) {
        return false;
      }

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const matchName = item.name.toLowerCase().includes(q);
      const matchChinese = item.chinese.toLowerCase().includes(q);
      const matchNapAm = item.elementNapAm.toLowerCase().includes(q);
      const matchCreature = item.symbolicCreature.toLowerCase().includes(q);
      const matchSummary = item.summary.toLowerCase().includes(q);
      const matchOrder = item.order.toString() === q;
      const matchPart1 = item.part1.items.some(
        (it) =>
          it.title.toLowerCase().includes(q) ||
          it.description.toLowerCase().includes(q) ||
          (it.chineseTerm && it.chineseTerm.toLowerCase().includes(q))
      );
      const matchPart2 = item.part2.items.some(
        (it) =>
          it.title.toLowerCase().includes(q) ||
          it.description.toLowerCase().includes(q) ||
          (it.chineseTerm && it.chineseTerm.toLowerCase().includes(q))
      );
      const matchSoundName = item.soundSymbolism?.soundName.toLowerCase().includes(q);
      const matchQiState = item.soundSymbolism?.qiState.toLowerCase().includes(q);
      const matchSoundNapAm = item.soundSymbolism?.napAm.toLowerCase().includes(q);

      // Kinh Dịch hexagram link matching
      const matchHexNumber =
        item.hexagramLink?.hexagramNumber.toString() === q ||
        `quẻ ${item.hexagramLink?.hexagramNumber}` === q ||
        `quẻ #${item.hexagramLink?.hexagramNumber}` === q ||
        `#${item.hexagramLink?.hexagramNumber}` === q;
      const matchHexName = item.hexagramLink?.hexagramName.toLowerCase().includes(q);
      const matchHexHanzi = item.hexagramLink?.hexagramHanzi.includes(q);
      const matchUpperTrigram = item.hexagramLink?.upperTrigram.toLowerCase().includes(q);
      const matchLowerTrigram = item.hexagramLink?.lowerTrigram.toLowerCase().includes(q);
      const matchHexNature = item.hexagramLink?.natureMeaning.toLowerCase().includes(q);
      const matchHexAnalysis = item.hexagramLink?.linkAnalysis.toLowerCase().includes(q);
      const matchHexSymbol = item.hexagramLink?.symbol === q;

      return (
        matchName ||
        matchChinese ||
        matchNapAm ||
        matchCreature ||
        matchSummary ||
        matchOrder ||
        matchPart1 ||
        matchPart2 ||
        matchSoundName ||
        matchQiState ||
        matchSoundNapAm ||
        matchHexNumber ||
        matchHexName ||
        matchHexHanzi ||
        matchUpperTrigram ||
        matchLowerTrigram ||
        matchHexNature ||
        matchHexAnalysis ||
        matchHexSymbol
      );
    });
  }, [selectedBranch, selectedCan, selectedHexagram, imageFilter, searchQuery, images]);

  // Hexagram lookup modal list
  const hexLookupList = useMemo(() => {
    return SIXTY_JIAZI.filter((item) => {
      if (!item.hexagramLink) return false;
      if (hexLookupTrigram !== "all") {
        const tri = hexLookupTrigram.toLowerCase();
        const up = item.hexagramLink.upperTrigram.toLowerCase();
        const low = item.hexagramLink.lowerTrigram.toLowerCase();
        if (!up.includes(tri) && !low.includes(tri)) {
          return false;
        }
      }
      if (!hexLookupQuery.trim()) return true;
      const q = hexLookupQuery.toLowerCase().trim();
      const num = item.hexagramLink.hexagramNumber.toString();
      return (
        num === q ||
        `#${num}` === q ||
        `quẻ ${num}` === q ||
        `quẻ #${num}` === q ||
        item.hexagramLink.hexagramName.toLowerCase().includes(q) ||
        item.hexagramLink.hexagramHanzi.includes(q) ||
        item.hexagramLink.upperTrigram.toLowerCase().includes(q) ||
        item.hexagramLink.lowerTrigram.toLowerCase().includes(q) ||
        item.hexagramLink.natureMeaning.toLowerCase().includes(q) ||
        item.hexagramLink.linkAnalysis.toLowerCase().includes(q) ||
        item.hexagramLink.symbol === q ||
        item.name.toLowerCase().includes(q) ||
        item.chinese.includes(q) ||
        item.elementNapAm.toLowerCase().includes(q)
      );
    });
  }, [hexLookupQuery, hexLookupTrigram]);

  // Quick navigation prev / next
  const currentIndex = SIXTY_JIAZI.findIndex((item) => item.id === selectedId);
  const prevEntry = currentIndex > 0 ? SIXTY_JIAZI[currentIndex - 1] : SIXTY_JIAZI[SIXTY_JIAZI.length - 1];
  const nextEntry = currentIndex < SIXTY_JIAZI.length - 1 ? SIXTY_JIAZI[currentIndex + 1] : SIXTY_JIAZI[0];

  const handleSelectEntry = (id: string) => {
    setSelectedId(id);
    if (viewMode === "grid") {
      setViewMode("detail");
    }
    // Scroll detail area to top
    const detailContainer = document.getElementById("jiazi-detail-container");
    if (detailContainer) {
      detailContainer.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Upload single file for current Can Chi
  const handleSingleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      await saveJiaziImage(selectedId, dataUrl);
      setImages((prev) => ({ ...prev, [selectedId]: dataUrl }));
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  // Drag & drop on card
  const handleDropOnCard = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        await saveJiaziImage(selectedId, dataUrl);
        setImages((prev) => ({ ...prev, [selectedId]: dataUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Batch upload multiple image files
  const handleBatchUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingBatch(true);
    setBatchUploadStatus(`Đang xử lý ${files.length} tệp tin ảnh...`);

    let matchedCount = 0;
    const newImages: Record<string, string> = { ...images };

    // Build normalize helper
    const normalizeStr = (s: string) =>
      s
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "");

    const nameMap: Record<string, string> = {};
    SIXTY_JIAZI.forEach((item) => {
      nameMap[normalizeStr(item.name)] = item.id;
      nameMap[normalizeStr(item.id)] = item.id;
      nameMap[item.order.toString()] = item.id;
      nameMap[`0${item.order}`] = item.id;
    });

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;

      const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
      const normalizedBase = normalizeStr(baseName);

      // Find matching Jiazi
      let targetId = nameMap[normalizedBase];
      if (!targetId) {
        // Try substring match
        for (const [key, id] of Object.entries(nameMap)) {
          if (normalizedBase.includes(key) || key.includes(normalizedBase)) {
            targetId = id;
            break;
          }
        }
      }

      if (targetId) {
        await new Promise<void>((resolve) => {
          const reader = new FileReader();
          reader.onload = async () => {
            const dataUrl = reader.result as string;
            await saveJiaziImage(targetId, dataUrl);
            newImages[targetId] = dataUrl;
            matchedCount++;
            resolve();
          };
          reader.readAsDataURL(file);
        });
      }
    }

    setImages(newImages);
    setIsUploadingBatch(false);
    setBatchUploadStatus(`Đã nạp thành công ${matchedCount} ảnh vào Lục Thập Hoa Giáp!`);
    e.target.value = "";
    setTimeout(() => setBatchUploadStatus(null), 5000);
  };

  // Remove current image
  const handleRemoveImage = async (id: string) => {
    await removeJiaziImage(id);
    setImages((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  // Clear all images
  const handleClearAll = async () => {
    await clearAllJiaziImages();
    setImages({});
  };

  // Export JSON backup
  const handleExportBackup = async () => {
    const json = await exportJiaziBackupJSON();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Luc_Thap_Hoa_Giap_Images_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download template JSON
  const handleDownloadTemplate = async () => {
    const template = await exportJiaziTemplateJSON();
    const blob = new Blob([template], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Luc_Thap_Hoa_Giap_Mau_Nap_Anh.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON backup (direct file input)
  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const count = await importJiaziBackupJSON(text);
      const reloaded = await getAllJiaziImages();
      setImages(reloaded);
      alert(`Đã nạp thành công ${count} hình ảnh Hoa Giáp từ tệp tin JSON!`);
    } catch (err) {
      alert("Lỗi khi nhập tệp tin sao lưu: " + (err as Error).message);
    }
    e.target.value = "";
  };

  // Parse JSON file in modal
  const handleJsonFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setJsonError(null);
    setJsonSuccessMsg(null);
    try {
      const text = await file.text();
      const parsed = parseJiaziJSON(text);
      if (parsed.matched.length === 0) {
        setJsonError(
          "Không tìm thấy dữ liệu ảnh Hoa Giáp nào hợp lệ trong tệp JSON đã chọn. Hãy đảm bảo các khóa là ID (giap_ty), số thứ tự (1-60), hoặc tên Can Chi."
        );
        setParsedJsonData(null);
      } else {
        setParsedJsonData(parsed);
      }
    } catch (err: any) {
      setJsonError("Lỗi đọc tệp JSON: " + (err.message || "Tệp không đúng định dạng JSON chuẩn"));
      setParsedJsonData(null);
    }
  };

  // Parse pasted JSON in modal
  const handleParsePastedJson = () => {
    setJsonError(null);
    setJsonSuccessMsg(null);
    if (!pastedJson.trim()) {
      setJsonError("Vui lòng dán nội dung JSON vào ô bên dưới trước khi phân tích.");
      return;
    }
    try {
      const parsed = parseJiaziJSON(pastedJson.trim());
      if (parsed.matched.length === 0) {
        setJsonError(
          "Không tìm thấy khóa hoặc hình ảnh nào khớp với 60 Hoa Giáp trong chuỗi JSON đã dán."
        );
        setParsedJsonData(null);
      } else {
        setParsedJsonData(parsed);
      }
    } catch (err: any) {
      setJsonError("Cú pháp JSON không hợp lệ: " + err.message);
      setParsedJsonData(null);
    }
  };

  // Apply parsed JSON into storage
  const handleApplyJsonImport = async () => {
    if (!parsedJsonData || parsedJsonData.matched.length === 0) return;
    setIsImportingJson(true);
    setJsonError(null);
    try {
      const count = await saveBatchJiaziImages(parsedJsonData.matched);
      const reloaded = await getAllJiaziImages();
      setImages(reloaded);
      setJsonSuccessMsg(`Đã nạp thành công ${count} hình ảnh vào Lục Thập Hoa Giáp!`);
      setTimeout(() => {
        setIsJsonModalOpen(false);
        setParsedJsonData(null);
        setPastedJson("");
        setJsonSuccessMsg(null);
      }, 1800);
    } catch (err: any) {
      setJsonError("Lỗi lưu ảnh vào bộ nhớ: " + err.message);
    } finally {
      setIsImportingJson(false);
    }
  };

  // Copy sample JSON
  const handleCopySampleJson = () => {
    const sample = `{
  "giap_ty": "https://example.com/images/giap_ty.jpg",
  "at_suu": "https://example.com/images/at_suu.jpg",
  "binh_dan": "https://example.com/images/binh_dan.jpg",
  "dinh_mao": "https://example.com/images/dinh_mao.jpg"
}`;
    navigator.clipboard.writeText(sample);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 3000);
  };

  // Save by URL
  const handleSaveByUrl = async () => {
    if (!inputImageUrl.trim()) return;
    await saveJiaziImage(selectedId, inputImageUrl.trim());
    setImages((prev) => ({ ...prev, [selectedId]: inputImageUrl.trim() }));
    setInputImageUrl("");
    setIsUrlModalOpen(false);
  };

  const uploadedCount = Object.keys(images).length;

  return (
    <div className="text-ivory-100 pb-24 selection:bg-gold-500 selection:text-lacquer-900">
      {/* Hidden File Inputs */}
      <input
        ref={singleFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleSingleImageUpload}
      />
      <input
        ref={batchFileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleBatchUpload}
      />
      <input
        ref={jsonImportInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleImportBackup}
      />

      {/* Hero / Header Section */}
      <div className="royal-frame px-5 py-8 sm:px-10 sm:py-12">
        <span className="royal-corner tl" />
        <span className="royal-corner tr" />
        <span className="royal-corner bl" />
        <span className="royal-corner br" />
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6">
            <div>
              <div className="royal-eyebrow before:hidden">Kho tàng diễn giải 60 Hoa Giáp</div>
              <h1 className="royal-title mt-3 text-4xl sm:text-5xl flex flex-wrap items-baseline gap-x-4 gap-y-1">
                Lục Thập Hoa Giáp
                <span className="font-serif text-lg sm:text-xl tracking-[0.35em] text-gold-400">
                  六十花甲
                </span>
              </h1>
              <p className="mt-4 text-sm sm:text-[15px] font-serif text-ivory-300 max-w-2xl leading-relaxed">
                Chi tiết toàn diện về <strong className="text-gold-400">60 phối tượng tự nhiên</strong> (自然配象) cùng{" "}
                <strong className="text-gold-400">triết lý nhân sinh minh triết</strong> (哲理/擬人化), hỗ trợ nạp hình
                ảnh cá nhân hóa cho từng Hoa Giáp với bộ nhớ lưu trữ bền vững.
              </p>
            </div>

            {/* Quick Stats & Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 self-stretch md:self-auto">
              <div className="border border-gold-800 rounded-sm px-3.5 py-2 flex items-center gap-2.5">
                <ImageIcon className="w-4 h-4 text-gold-400" />
                <div className="text-xs">
                  <div className="text-ivory-500 text-[10px] uppercase tracking-[0.18em]">Hình đã nạp</div>
                  <div className="font-bold text-ivory-100">
                    <span className="text-gold-400 text-sm">{uploadedCount}</span> / 60
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => batchFileInputRef.current?.click()}
                className="royal-btn-ghost !px-3.5 !py-2 !text-[11px]"
                title="Nạp nhiều file ảnh cùng lúc (tự động nhận diện theo tên file)"
              >
                <Upload className="w-3.5 h-3.5 text-gold-400" />
                <span>Nạp Ảnh Hàng Loạt</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setJsonError(null);
                  setJsonSuccessMsg(null);
                  setParsedJsonData(null);
                  setIsJsonModalOpen(true);
                }}
                className="royal-btn-ghost !px-3.5 !py-2 !text-[11px]"
                title="Nạp tệp tin JSON hoặc dán trực tiếp JSON dữ liệu/hình ảnh vào Hoa Giáp"
              >
                <FileCode2 className="w-3.5 h-3.5 text-gold-400" />
                <span>Nạp Tệp JSON</span>
              </button>

              <div className="flex items-center gap-1.5 p-1 border border-gold-800 rounded-sm">
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="p-1.5 text-ivory-500 hover:text-gold-200 hover:bg-lacquer-700 rounded-sm transition-colors cursor-pointer"
                  title="Sao lưu toàn bộ ảnh ra tệp JSON"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setJsonError(null);
                    setJsonSuccessMsg(null);
                    setParsedJsonData(null);
                    setIsJsonModalOpen(true);
                  }}
                  className="p-1.5 text-ivory-500 hover:text-gold-200 hover:bg-lacquer-700 rounded-sm transition-colors cursor-pointer"
                  title="Mở giao diện nạp tệp JSON vào Hoa Giáp"
                >
                  <FileUp className="w-4 h-4" />
                </button>
                {uploadedCount > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="p-1.5 text-[#E57373] hover:text-gold-200 hover:bg-[#3F1B1B] rounded-sm transition-colors cursor-pointer"
                    title="Xóa tất cả ảnh đã nạp"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Status banner if batch uploading */}
          {batchUploadStatus && (
            <div className="mt-4 p-3 rounded-sm bg-lacquer-700 border border-gold-500 text-xs text-ivory-100 flex items-center justify-between animate-in fade-in">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gold-500" />
                {batchUploadStatus}
              </span>
              <button
                type="button"
                onClick={() => setBatchUploadStatus(null)}
                className="text-ivory-500 hover:text-gold-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Search & Filter Toolbar */}
          <div className="mt-8 pt-6 border-t border-gold-800 flex flex-col gap-3 items-stretch">
            {/* Search Input */}
            <div className="relative w-full max-w-xl">
              <Search className="w-4 h-4 text-ivory-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm Can Chi (Giáp Tý...), quẻ Dịch (Càn, Phục, #24...), nạp âm..."
                className="w-full pl-10 pr-9 py-2.5 text-sm font-serif bg-lacquer-950 border border-gold-800 focus:border-gold-500 rounded-sm text-ivory-100 placeholder:text-ivory-500/70 outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ivory-500 hover:text-gold-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Filters & View Mode */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Button Tra Cứu Quẻ Dịch Liên Kết */}
              <button
                type="button"
                onClick={() => {
                  setHexLookupQuery("");
                  setHexLookupTrigram("all");
                  setIsHexLookupModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-lacquer-800 hover:bg-lacquer-700 text-gold-400 border border-gold-800 hover:border-gold-400 rounded-sm transition-all cursor-pointer shadow-sm active:scale-95"
                title="Mở bảng tra cứu nhanh Quẻ Kinh Dịch đối ứng với 60 Hoa Giáp"
              >
                <Compass className="w-3.5 h-3.5 text-gold-400" />
                <span>Tìm Quẻ Dịch Liên Kết</span>
              </button>

              {/* Kinh Dịch Hexagram Filter Dropdown */}
              <select
                value={selectedHexagram}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedHexagram(val);
                  if (val !== "all") {
                    const match = SIXTY_JIAZI.find(
                      (it) => it.hexagramLink?.hexagramNumber.toString() === val
                    );
                    if (match) {
                      setSelectedId(match.id);
                    }
                  }
                }}
                className="px-2.5 py-2 text-xs bg-lacquer-800 border border-gold-800 rounded-sm text-ivory-300 outline-none cursor-pointer hover:border-gold-500 max-w-[190px]"
                title="Lọc theo Quẻ Kinh Dịch liên kết (60 Quẻ)"
              >
                <option value="all">Mọi Quẻ Kinh Dịch (60)</option>
                {SIXTY_JIAZI.map((item) => (
                  <option
                    key={item.id}
                    value={item.hexagramLink?.hexagramNumber.toString()}
                  >
                    #{item.hexagramLink?.hexagramNumber} {item.hexagramLink?.hexagramName} ({item.name})
                  </option>
                ))}
              </select>

              {/* Can Filter */}
              <select
                value={selectedCan}
                onChange={(e) => setSelectedCan(e.target.value)}
                className="px-2.5 py-2 text-xs bg-lacquer-800 border border-gold-800 rounded-sm text-ivory-300 outline-none cursor-pointer hover:border-gold-500"
              >
                <option value="all">Mọi Thiên Can (10)</option>
                {JIAZI_CAN_LIST.map((can) => (
                  <option key={can} value={can}>
                    Can {can}
                  </option>
                ))}
              </select>

              {/* Image Filter */}
              <select
                value={imageFilter}
                onChange={(e) => setImageFilter(e.target.value as any)}
                className="px-2.5 py-2 text-xs bg-lacquer-800 border border-gold-800 rounded-sm text-ivory-300 outline-none cursor-pointer hover:border-gold-500"
              >
                <option value="all">Tất cả ảnh (60)</option>
                <option value="has_image">Đã có ảnh ({uploadedCount})</option>
                <option value="no_image">Chưa có ảnh ({60 - uploadedCount})</option>
              </select>

              {/* View Switcher */}
              <div className="flex items-center bg-lacquer-800 p-1 border border-gold-800 rounded-sm flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => setViewMode("detail")}
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-sm font-medium transition-colors cursor-pointer ${
                    viewMode === "detail"
                      ? "bg-gold-500/15 text-gold-200 font-semibold ring-1 ring-inset ring-gold-500/70"
                      : "text-ivory-500 hover:text-gold-200"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Diễn Giải</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("full_image")}
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-sm font-medium transition-colors cursor-pointer ${
                    viewMode === "full_image"
                      ? "bg-gold-500/15 text-gold-200 font-semibold ring-1 ring-inset ring-gold-500/70"
                      : "text-ivory-500 hover:text-gold-200"
                  }`}
                  title="Chế độ hiển thị Ảnh Full & Toàn Cảnh Hoa Giáp"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Ảnh Full (Toàn Cảnh)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-sm font-medium transition-colors cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-gold-500/15 text-gold-200 font-semibold ring-1 ring-inset ring-gold-500/70"
                      : "text-ivory-500 hover:text-gold-200"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Lưới Thẻ (60)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("sounds")}
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-sm font-medium transition-colors cursor-pointer ${
                    viewMode === "sounds"
                      ? "bg-gold-500/15 text-gold-200 font-semibold ring-1 ring-inset ring-gold-500/70"
                      : "text-ivory-500 hover:text-gold-200"
                  }`}
                  title="Bảng tra 30 Tượng Khí & Âm Thanh Nạp Âm Hoa Giáp"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Tượng Âm Thanh (30)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("hexagrams")}
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-sm font-medium transition-colors cursor-pointer ${
                    viewMode === "hexagrams"
                      ? "bg-gold-500/15 text-gold-200 font-semibold ring-1 ring-inset ring-gold-500/70"
                      : "text-ivory-500 hover:text-gold-200"
                  }`}
                  title="Bảng đối ứng 60 Hoa Giáp và 60 Quẻ Kinh Dịch"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Liên Kết Kinh Dịch (60)</span>
                </button>
              </div>

              {/* Fast Toggle Image Fit Mode: Contain (Full 100%) vs Cover */}
              <button
                type="button"
                onClick={handleToggleImageFitMode}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded-sm border transition-all cursor-pointer font-medium ${
                  imageFitMode === "contain"
                    ? "bg-lacquer-700 border-gold-400 text-gold-300"
                    : "bg-lacquer-800 border-gold-800 text-ivory-500 hover:text-gold-200"
                }`}
                title={
                  imageFitMode === "contain"
                    ? "Ảnh Hoa Giáp đang luôn ở trạng thái FULL (Toàn bộ ảnh 100% nguyên vẹn không bị cắt xén). Nhấp để đổi sang lấp đầy."
                    : "Đang lấp đầy khung bài. Nhấp để chuyển về trạng thái FULL nguyên vẹn."
                }
              >
                <Maximize2 className="w-3.5 h-3.5 text-gold-400" />
                <span>
                  Trạng Thái:{" "}
                  <strong className={imageFitMode === "contain" ? "text-gold-400 font-bold" : "text-white"}>
                    {imageFitMode === "contain" ? "FULL (Toàn Bộ 100%)" : "Lấp Đầy Khung"}
                  </strong>
                </span>
              </button>
            </div>
          </div>

          {/* 12 Địa Chi Tabs */}
          <div className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            <button
              type="button"
              onClick={() => setSelectedBranch("all")}
              className={`px-3 py-1.5 text-xs rounded-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedBranch === "all"
                  ? "bg-gold-500/15 text-gold-200 font-semibold ring-1 ring-inset ring-gold-500/70"
                  : "bg-lacquer-800 text-ivory-500 hover:text-gold-200 border border-lacquer-700"
              }`}
            >
              Tất cả (60)
            </button>
            {JIAZI_BRANCH_LIST.map((branch) => {
              const countInBranch = SIXTY_JIAZI.filter((j) => j.branchGroup === branch).length;
              const hasImagesInBranch = SIXTY_JIAZI.filter(
                (j) => j.branchGroup === branch && images[j.id]
              ).length;
              return (
                <button
                  key={branch}
                  type="button"
                  onClick={() => setSelectedBranch(branch)}
                  className={`px-3 py-1.5 text-xs rounded-sm font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedBranch === branch
                      ? "bg-gold-500/15 text-gold-200 font-semibold ring-1 ring-inset ring-gold-500/70"
                      : "bg-lacquer-800 text-ivory-500 hover:text-gold-200 border border-lacquer-700"
                  }`}
                >
                  <span>Chi {branch}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-sm ${
                      selectedBranch === branch
                        ? "bg-gold-500/20 text-gold-200"
                        : "bg-lacquer-700 text-ivory-500"
                    }`}
                  >
                    {hasImagesInBranch}/{countInBranch}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bảng Bát Tự Mở Rộng: Tứ Trụ • Đại Vận • Lưu Niên • Nam Nữ • Thu Gọn & Lưu Bát Tự */}
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <BaziExtendedFortune
          cardImages={images}
          onSelectJiazi={(id) => {
            setSelectedId(id);
            setViewMode("detail");
            const detailContainer = document.getElementById("jiazi-detail-container");
            if (detailContainer) {
              detailContainer.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }}
        />
      </div>

      {/* Phần Lục Nhâm Đại Độn (Thập Nhị Thiên Tướng • Nguyệt Tướng • Hoạt Thời • Thiên Địa Bàn) - Bỏ hoàn toàn phần Lục Nhâm Hóa Dịch ở Tab Hoa Giáp */}
      <div className="max-w-6xl mx-auto px-4 pt-6" id="lucnham-chart-area-hoagiap">
        <JiaziLucNhamSection
          id="lucnham-chart-area-hoagiap"
          mode="hoagiap"
          storageKey="iching_lucnham_bazi_hoagiap"
          storageScope="hoagiap"
          boardContextLabel="Bảng Tab Hoa Giáp"
          showHoaDich={false}
          onSelectJiazi={(id) => {
            setSelectedId(id);
            setViewMode("detail");
            const detailContainer = document.getElementById("jiazi-detail-container");
            if (detailContainer) {
              detailContainer.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }}
        />
      </div>

      {/* Main Content Area */}
      <div id="jiazi-detail-container" className="max-w-6xl mx-auto px-4 py-8">
        {viewMode === "sounds" ? (
          /* ========================================================
             VIEW MODE: 30 NAP AM SOUND SYMBOLISM TABLE & SYNTHESIZER
             ======================================================== */
          <JiaziSoundTable
            onSelectCanChi={handleSelectEntry}
            activeSoundType={playingSoundType}
            onTogglePlay={handleTogglePlaySound}
          />
        ) : viewMode === "hexagrams" ? (
          /* ========================================================
             VIEW MODE: 60 HOA GIÁP & KINH DỊCH CORRELATION TABLE
             ======================================================== */
          <JiaziHexagramTable
            cardImages={cardImages}
            onSelectJiazi={(id) => {
              handleSelectEntry(id);
              setViewMode("detail");
            }}
            onSelectHexagram={(hexNum) => {
              if (onSelectHexagram) {
                onSelectHexagram(hexNum);
              } else {
                const link = selectedEntry.hexagramLink;
                if (link && link.hexagramNumber === hexNum) {
                  setHexagramModalData(link);
                }
              }
            }}
          />
        ) : viewMode === "grid" ? (
          /* ========================================================
             VIEW MODE: GRID GALLERY OF ALL 60 JIAZI
             ======================================================== */
          <div>
            <div className="mb-4 flex items-center justify-between text-xs text-ivory-500">
              <span>Hiển thị {filteredJiazi.length} / 60 Hoa Giáp</span>
              <span>Bấm vào thẻ để xem chi tiết diễn giải hoặc bấm loa để nghe âm tượng</span>
            </div>

            {filteredJiazi.length === 0 ? (
              <div className="text-center py-16 bg-lacquer-900 border border-lacquer-700 rounded-md p-6">
                <Search className="w-10 h-10 text-gold-700 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-gold-500">Không tìm thấy Hoa Giáp phù hợp</h3>
                <p className="text-xs text-ivory-500 mt-1">
                  Vui lòng thử điều chỉnh lại bộ lọc hoặc từ khóa tìm kiếm.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
                {filteredJiazi.map((item) => {
                  const hasImg = !!images[item.id];
                  const isSelected = item.id === selectedId;
                  const isPlayingThis = playingSoundType === item.soundSymbolism.soundType;

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectEntry(item.id)}
                      className={`group relative bg-lacquer-800 border rounded-md overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${
                        isSelected
                          ? "border-gold-500 ring-2 ring-gold-500/30"
                          : "border-lacquer-700 hover:border-gold-700"
                      }`}
                    >
                      {/* Image / Card Visual - Luôn ở trạng thái Full */}
                      <div className="relative aspect-[3/4] bg-lacquer-900 overflow-hidden flex items-center justify-center">
                        {hasImg ? (
                          <>
                            {/* Ambient blurred glow from image */}
                            <div
                              className="absolute inset-0 bg-cover bg-center filter blur-md opacity-25 scale-125 pointer-events-none"
                              style={{ backgroundImage: `url(${images[item.id]})` }}
                            />
                            <img
                              src={images[item.id]}
                              alt={item.name}
                              className={`relative z-10 w-full h-full ${
                                imageFitMode === "cover" ? "object-cover" : "object-contain p-1"
                              } group-hover:scale-105 transition-transform duration-300 drop-shadow`}
                              loading="lazy"
                            />
                          </>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-gradient-to-br from-lacquer-800 to-lacquer-900">
                            <div className="text-3xl font-serif font-bold text-gold-400/30 mb-2">
                              {item.chinese}
                            </div>
                            <div className="text-xs text-gold-700 line-clamp-2 px-2">
                              {item.symbolicCreature}
                            </div>
                            <span className="mt-3 text-[10px] text-ivory-500 px-2 py-0.5 rounded border border-gold-800 bg-lacquer-800/70 flex items-center gap-1">
                              <Upload className="w-2.5 h-2.5 text-gold-400" /> Nạp hình
                            </span>
                          </div>
                        )}

                        {/* Order Badge */}
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-lacquer-900/80 backdrop-blur-md border border-gold-800 text-[10px] font-mono font-bold text-gold-400">
                          #{item.order.toString().padStart(2, "0")}
                        </div>

                        {/* Image status badge */}
                        {hasImg && (
                          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400" />
                        )}
                      </div>

                      {/* Card Info Bottom */}
                      <div className="p-3 bg-lacquer-800">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-serif font-bold text-sm text-ivory-100 group-hover:text-gold-400 transition-colors">
                            {item.name}
                          </h4>
                          <span className="text-xs font-serif text-ivory-500">{item.chinese}</span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-gold-500 font-medium truncate mt-0.5">
                          <span className="truncate">{item.elementNapAm}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTogglePlaySound(item.soundSymbolism.soundType);
                            }}
                            className={`p-1 rounded-md transition-colors shrink-0 ml-1 cursor-pointer ${
                              isPlayingThis
                                ? "bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse"
                                : "text-ivory-500 hover:text-gold-400 hover:bg-lacquer-700"
                            }`}
                            title={`Nghe tượng âm thanh: ${item.soundSymbolism.soundName}`}
                          >
                            {isPlayingThis ? (
                              <Square className="w-3 h-3 fill-current" />
                            ) : (
                              <Volume2 className="w-3 h-3" />
                            )}
                          </button>
                        </div>

                        {/* Sound description teaser */}
                        <div
                          className="text-[10px] text-ivory-500 truncate mt-1 flex items-center gap-1"
                          title={item.soundSymbolism.soundName}
                        >
                          <Waves className="w-2.5 h-2.5 shrink-0 text-gold-400/70" />
                          <span className="truncate">{item.soundSymbolism.soundName}</span>
                        </div>

                        {/* Hexagram Link Badge */}
                        {item.hexagramLink && (() => {
                          const hexImg = cardImages?.[item.hexagramLink.hexagramNumber];
                          return (
                            <div
                              className="text-[10px] text-ivory-500 hover:text-gold-400 truncate mt-1 pt-1.5 border-t border-lacquer-700 flex items-center justify-between gap-1"
                              title={`Quẻ Kinh Dịch tương ứng: #${item.hexagramLink.hexagramNumber} ${item.hexagramLink.hexagramName}`}
                            >
                              <span className="truncate flex items-center gap-1.5">
                                {hexImg ? (
                                  <img
                                    src={hexImg}
                                    alt={item.hexagramLink.hexagramName}
                                    className="w-3.5 h-5 rounded-[3px] object-cover border border-gold-800 shrink-0"
                                  />
                                ) : (
                                  <Compass className="w-2.5 h-2.5 text-gold-400 shrink-0" />
                                )}
                                <span className="truncate">#{item.hexagramLink.hexagramNumber} {item.hexagramLink.hexagramName}</span>
                              </span>
                              <span className="font-serif text-gold-400 font-bold text-xs shrink-0">{item.hexagramLink.symbol}</span>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : viewMode === "full_image" ? (
          /* ========================================================
             VIEW MODE: FULL IMAGE & HERO SHOWCASE (ẢNH FULL TOÀN CẢNH)
             ======================================================== */
          <div className="space-y-6">
            {/* Top Bar for Full Image Mode */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-lacquer-800 border border-gold-800 rounded-md p-4 shadow-xl">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-sm bg-lacquer-700 border border-gold-800 text-sm font-mono font-bold text-gold-400">
                  #{selectedEntry.order.toString().padStart(2, "0")} / 60
                </span>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-display font-semibold text-ivory-100 flex items-center gap-2">
                    <span>{selectedEntry.name}</span>
                    <span className="text-base text-gold-400 font-serif font-normal">({selectedEntry.chinese})</span>
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-ivory-500">Nạp Âm:</span>
                    <button
                      type="button"
                      onClick={() => handleTogglePlaySound(selectedEntry.soundSymbolism.soundType)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm border text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                        playingSoundType === selectedEntry.soundSymbolism.soundType
                          ? "bg-gold-800 border-gold-400 text-gold-300 ring-2 ring-gold-400/50 animate-pulse"
                          : "bg-lacquer-700 hover:bg-gold-800 border-gold-800 hover:border-gold-500 text-gold-400 hover:text-gold-200"
                      }`}
                      title={
                        playingSoundType === selectedEntry.soundSymbolism.soundType
                          ? `Đang phát âm tượng: ${selectedEntry.soundSymbolism.soundName}. Bấm để dừng.`
                          : `Bấm để nghe âm tượng Nạp Âm: ${selectedEntry.soundSymbolism.soundName}`
                      }
                    >
                      <Volume2 className="w-3 h-3 text-gold-400" />
                      <span>{selectedEntry.elementNapAm}</span>
                    </button>
                    {selectedEntry.hexagramLink && (
                      <button
                        type="button"
                        onClick={() => {
                          if (onSelectHexagram) {
                            onSelectHexagram(selectedEntry.hexagramLink.hexagramNumber);
                          } else {
                            setHexagramModalData(selectedEntry.hexagramLink);
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-lacquer-800 hover:bg-lacquer-700 border border-gold-800 hover:border-gold-400 text-xs font-bold text-gold-400 transition-all cursor-pointer shadow-sm"
                        title={`Quẻ Kinh Dịch tương ứng: #${selectedEntry.hexagramLink.hexagramNumber} ${selectedEntry.hexagramLink.hexagramName}. Nhấp để xem luận giải.`}
                      >
                        <Compass className="w-3 h-3 text-gold-400" />
                        <span>Quẻ #{selectedEntry.hexagramLink.hexagramNumber} {selectedEntry.hexagramLink.hexagramName}</span>
                        <span className="font-serif text-ivory-100">{selectedEntry.hexagramLink.symbol}</span>
                      </button>
                    )}
                    <span className="text-xs text-ivory-500">• Chi {selectedEntry.branchGroup} ({selectedEntry.chi}) • Can {selectedEntry.can}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Switcher between Hoa Giap and Hexagram artwork */}
                {selectedEntry.hexagramLink && (
                  <div className="flex items-center gap-1 p-1 rounded-sm bg-lacquer-700 border border-gold-800">
                    <button
                      type="button"
                      onClick={() => setFullImageTab("jiazi")}
                      className={`px-3 py-1 text-xs font-semibold rounded-sm transition-all cursor-pointer ${
                        fullImageTab === "jiazi"
                          ? "bg-gold-500/15 text-gold-200 font-semibold ring-1 ring-inset ring-gold-500/70"
                          : "text-ivory-500 hover:text-gold-200"
                      }`}
                    >
                      Ảnh Hoa Giáp
                    </button>
                    <button
                      type="button"
                      onClick={() => setFullImageTab("hexagram")}
                      className={`px-3 py-1 text-xs font-semibold rounded-sm transition-all cursor-pointer flex items-center gap-1.5 ${
                        fullImageTab === "hexagram"
                          ? "bg-gold-500/15 text-gold-200 font-semibold ring-1 ring-inset ring-gold-500/70"
                          : "text-ivory-500 hover:text-gold-200"
                      }`}
                    >
                      <span>Quẻ #{selectedEntry.hexagramLink.hexagramNumber}</span>
                      <span className="font-serif font-bold text-gold-400">{selectedEntry.hexagramLink.symbol}</span>
                      {cardImages?.[selectedEntry.hexagramLink.hexagramNumber] && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      )}
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleToggleImageFitMode}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-lacquer-700 hover:bg-lacquer-700 text-gold-300 border border-gold-800 rounded-sm transition-all cursor-pointer font-medium shadow"
                  title="Chuyển đổi trạng thái Full (100% không cắt xén) hoặc Lấp đầy"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-gold-400" />
                  <span>Ảnh: <strong>{imageFitMode === "contain" ? "FULL (Toàn Bộ 100%)" : "Lấp Đầy Khung"}</strong></span>
                </button>

                {(fullImageTab === "hexagram" ? cardImages?.[selectedEntry.hexagramLink?.hexagramNumber || 0] : images[selectedEntry.id]) && (
                  <button
                    type="button"
                    onClick={() => {
                      setLightboxZoom(1);
                      const targetImg = fullImageTab === "hexagram"
                        ? cardImages?.[selectedEntry.hexagramLink?.hexagramNumber || 0]
                        : images[selectedEntry.id];
                      if (targetImg) setLightboxImage(targetImg);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-lacquer-700 hover:bg-lacquer-700 text-ivory-300 hover:text-gold-200 border border-gold-800 rounded-sm transition-all cursor-pointer shadow"
                    title="Mở toàn màn hình phóng to cực đại"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Phóng To Cực Đại</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setViewMode("detail")}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-gold-500 hover:bg-gold-400 text-lacquer-900 rounded-sm transition-all cursor-pointer shadow"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Xem Diễn Giải Chi Tiết</span>
                </button>
              </div>
            </div>

            {/* Expansive Full Hero Image Canvas */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDropOnCard}
              className="relative w-full min-h-[520px] sm:min-h-[640px] max-h-[820px] rounded-md overflow-hidden bg-lacquer-950 border-2 border-gold-800 flex items-center justify-center p-3 sm:p-6 group"
            >
              {fullImageTab === "hexagram" && selectedEntry.hexagramLink ? (
                (() => {
                  const hexObj = HEXAGRAMS.find((h) => h.number === selectedEntry.hexagramLink?.hexagramNumber);
                  const hexImg = cardImages?.[selectedEntry.hexagramLink?.hexagramNumber || 0];

                  return (
                    <>
                      {hexImg ? (
                        <>
                          {/* Atmospheric blurred ambient glow from image */}
                          <div
                            className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-35 scale-110 pointer-events-none transition-all duration-700"
                            style={{ backgroundImage: `url(${hexImg})` }}
                          />

                          {/* The full hexagram image */}
                          <img
                            src={hexImg}
                            alt={selectedEntry.hexagramLink.hexagramName}
                            className={`relative z-10 w-full h-full max-h-[760px] ${
                              imageFitMode === "cover" ? "object-cover" : "object-contain"
                            } transition-all duration-300 drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)]`}
                          />

                          {/* Quick Floating Overlays */}
                          <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                            <span className="px-3 py-1 rounded-sm bg-lacquer-900/85 backdrop-blur-md border border-gold-800 text-xs font-bold text-gold-400">
                              Quẻ #{selectedEntry.hexagramLink.hexagramNumber} {selectedEntry.hexagramLink.hexagramName} ({selectedEntry.hexagramLink.symbol})
                            </span>
                            <span className="px-2.5 py-0.5 rounded-sm bg-emerald-950/80 border border-emerald-700/80 text-[11px] text-emerald-300 font-mono">
                              ✓ Hình Quẻ Kinh Dịch
                            </span>
                          </div>

                          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setLightboxZoom(1);
                                setLightboxImage(hexImg);
                              }}
                              className="p-2 rounded-sm bg-lacquer-900/85 hover:bg-lacquer-800 backdrop-blur-md text-ivory-100 border border-gold-800 transition-all cursor-pointer shadow hover:text-gold-400"
                              title="Mở ảnh toàn màn hình"
                            >
                              <Maximize2 className="w-4 h-4" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center">
                          {hexObj ? (
                            <CardVisual
                              hexagram={hexObj}
                              size="lg"
                              showName={true}
                              enableZoomModal={true}
                            />
                          ) : (
                            <div className="text-center">
                              <div className="text-7xl font-serif text-gold-400 mb-2">{selectedEntry.hexagramLink.symbol}</div>
                              <div className="text-xl font-serif text-ivory-100">Quẻ {selectedEntry.hexagramLink.hexagramName}</div>
                            </div>
                          )}
                          <div className="mt-4 px-3 py-1 rounded-sm bg-lacquer-800 border border-gold-800 text-xs text-gold-500">
                            Chưa có hình riêng cho quẻ này — hiển thị hào quái Chu Dịch nguyên bản
                          </div>
                        </div>
                      )}

                      {/* Navigation Arrows floating on side */}
                      <button
                        type="button"
                        onClick={() => handleSelectEntry(prevEntry.id)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-md bg-lacquer-900/80 hover:bg-lacquer-700 text-gold-400 hover:text-gold-200 border border-gold-800 backdrop-blur-md shadow-2xl transition-all cursor-pointer active:scale-95 group/arrow"
                        title={`Xem #${prevEntry.order} ${prevEntry.name}`}
                      >
                        <ChevronLeft className="w-6 h-6 group-hover/arrow:-translate-x-0.5 transition-transform" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectEntry(nextEntry.id)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-md bg-lacquer-900/80 hover:bg-lacquer-700 text-gold-400 hover:text-gold-200 border border-gold-800 backdrop-blur-md shadow-2xl transition-all cursor-pointer active:scale-95 group/arrow"
                        title={`Xem #${nextEntry.order} ${nextEntry.name}`}
                      >
                        <ChevronRight className="w-6 h-6 group-hover/arrow:translate-x-0.5 transition-transform" />
                      </button>
                    </>
                  );
                })()
              ) : images[selectedEntry.id] ? (
                <>
                  {/* Atmospheric blurred ambient glow from image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-35 scale-110 pointer-events-none transition-all duration-700"
                    style={{ backgroundImage: `url(${images[selectedEntry.id]})` }}
                  />

                  {/* The full image */}
                  <img
                    src={images[selectedEntry.id]}
                    alt={selectedEntry.name}
                    className={`relative z-10 w-full h-full max-h-[760px] ${
                      imageFitMode === "cover" ? "object-cover" : "object-contain"
                    } transition-all duration-300 drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)]`}
                  />

                  {/* Quick Floating Overlays */}
                  <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                    <span className="px-3 py-1 rounded-sm bg-lacquer-900/85 backdrop-blur-md border border-gold-800 text-xs font-bold text-gold-400">
                      Trạng Thái: FULL (100% Toàn Bộ)
                    </span>
                  </div>

                  <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const img = images[selectedEntry.id];
                        if (img) {
                          downloadDataUrlAsPng(
                            img,
                            `hoa-giap-${selectedEntry.id}-${selectedEntry.name}.png`
                          );
                        }
                      }}
                      className="p-2 rounded-sm bg-lacquer-900/85 hover:bg-lacquer-800 backdrop-blur-md text-ivory-100 border border-gold-800 transition-all cursor-pointer shadow hover:text-gold-400"
                      title="Tải ảnh Hoa Giáp này về máy"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLightboxZoom(1);
                        setLightboxImage(images[selectedEntry.id]);
                      }}
                      className="p-2 rounded-sm bg-lacquer-900/85 hover:bg-lacquer-800 backdrop-blur-md text-ivory-100 border border-gold-800 transition-all cursor-pointer shadow hover:text-gold-400"
                      title="Mở toàn màn hình"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => singleFileInputRef.current?.click()}
                      className="p-2 rounded-sm bg-lacquer-900/85 hover:bg-lacquer-800 backdrop-blur-md text-gold-400 border border-gold-800 transition-all cursor-pointer shadow"
                      title="Đổi ảnh khác"
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(selectedEntry.id)}
                      className="p-2 rounded-sm bg-lacquer-900/85 hover:bg-red-900/60 backdrop-blur-md text-red-400 border border-gold-800 transition-all cursor-pointer shadow"
                      title="Xóa ảnh"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Navigation Arrows floating on side */}
                  <button
                    type="button"
                    onClick={() => handleSelectEntry(prevEntry.id)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-md bg-lacquer-900/80 hover:bg-lacquer-700 text-gold-400 hover:text-gold-200 border border-gold-800 backdrop-blur-md shadow-2xl transition-all cursor-pointer active:scale-95 group/arrow"
                    title={`Xem #${prevEntry.order} ${prevEntry.name}`}
                  >
                    <ChevronLeft className="w-6 h-6 group-hover/arrow:-translate-x-0.5 transition-transform" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectEntry(nextEntry.id)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-md bg-lacquer-900/80 hover:bg-lacquer-700 text-gold-400 hover:text-gold-200 border border-gold-800 backdrop-blur-md shadow-2xl transition-all cursor-pointer active:scale-95 group/arrow"
                    title={`Xem #${nextEntry.order} ${nextEntry.name}`}
                  >
                    <ChevronRight className="w-6 h-6 group-hover/arrow:translate-x-0.5 transition-transform" />
                  </button>
                </>
              ) : (
                /* Placeholder if no image */
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-32 h-32 rounded-full border-2 border-gold-800 bg-lacquer-700/70 flex items-center justify-center mb-6">
                    <span className="text-5xl font-serif font-bold text-gold-400">
                      {selectedEntry.chinese}
                    </span>
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-display font-semibold text-ivory-100">
                    {selectedEntry.name}
                  </h3>
                  <p className="text-sm text-gold-400 font-medium mt-1">
                    {selectedEntry.elementNapAm}
                  </p>
                  <p className="text-sm text-ivory-500 mt-3 max-w-md leading-relaxed">
                    {selectedEntry.symbolicCreature}
                  </p>

                  <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      type="button"
                      onClick={() => singleFileInputRef.current?.click()}
                      className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-gold-400 hover:bg-gold-400 text-lacquer-900 rounded-sm transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      <Upload className="w-4 h-4" /> Nạp Hình Cho Can Chi Này
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsUrlModalOpen(true)}
                      className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-lacquer-800 hover:bg-lacquer-700 text-ivory-300 rounded-sm border border-gold-800 transition-all cursor-pointer"
                    >
                      <span>Nhập link ảnh online</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Summary Strip under Full Showcase */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Tượng Âm Thanh Card */}
              <div className="bg-lacquer-800 border border-gold-800 rounded-md p-4 shadow">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-serif font-bold text-gold-400 flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-gold-400" />
                    <span>TƯỢNG ÂM THANH NẠP ÂM</span>
                  </h4>
                  {selectedEntry.soundSymbolism && (
                    <button
                      type="button"
                      onClick={() => handleTogglePlaySound(selectedEntry.soundSymbolism!.soundType)}
                      className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-sm transition-colors cursor-pointer font-medium ${
                        playingSoundType === selectedEntry.soundSymbolism.soundType
                          ? "bg-red-900/60 text-red-200 border border-red-700 animate-pulse"
                          : "bg-lacquer-700 hover:bg-gold-800 text-gold-300 border border-gold-800"
                      }`}
                    >
                      {playingSoundType === selectedEntry.soundSymbolism.soundType ? (
                        <>
                          <Square className="w-3 h-3 text-red-400" />
                          <span>Dừng</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 text-gold-400" />
                          <span>Phát Âm Tượng</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
                <div className="text-sm font-semibold text-ivory-100">
                  {selectedEntry.soundSymbolism ? selectedEntry.soundSymbolism.soundName : "Âm thanh nạp âm"}
                </div>
                <p className="text-xs text-ivory-500 mt-1 line-clamp-2">
                  {selectedEntry.soundSymbolism ? `${selectedEntry.soundSymbolism.napAm} • Hành ${selectedEntry.soundSymbolism.element}` : ""}
                </p>
              </div>

              {/* Tượng Khí Card */}
              <div className="bg-lacquer-800 border border-gold-800 rounded-md p-4 shadow">
                <h4 className="text-xs font-serif font-bold text-gold-400 flex items-center gap-1.5 mb-2">
                  <Waves className="w-3.5 h-3.5 text-gold-400" />
                  <span>KHÍ TƯỢNG BẢN MỆNH</span>
                </h4>
                <div className="text-sm font-semibold text-ivory-100">
                  {selectedEntry.soundSymbolism ? `Hành ${selectedEntry.soundSymbolism.element}` : ""}
                </div>
                <p className="text-xs text-ivory-500 mt-1 line-clamp-2">
                  {selectedEntry.soundSymbolism ? selectedEntry.soundSymbolism.qiState : ""}
                </p>
              </div>

              {/* Biểu Tượng & Luận Đoán Card */}
              <div className="bg-lacquer-800 border border-gold-800 rounded-md p-4 shadow flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-serif font-bold text-gold-400 flex items-center gap-1.5 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                    <span>HÌNH TƯỢNG VĂN HÓA</span>
                  </h4>
                  <p className="text-xs text-ivory-300 line-clamp-2">
                    {selectedEntry.symbolicCreature}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewMode("detail")}
                  className="mt-3 flex items-center justify-center gap-1.5 w-full py-1.5 text-xs font-bold text-lacquer-900 bg-gradient-to-r from-gold-500 to-gold-400 hover:brightness-110 rounded-sm transition-all cursor-pointer shadow"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Đọc Toàn Văn Diễn Giải 60 Hoa Giáp</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================
             VIEW MODE: MASTER-DETAIL / IN-DEPTH INTERPRETATION
             ======================================================== */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: Can Chi Selector & Card Image (lg:col-span-5) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Card Image Display & Upload Frame */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDropOnCard}
                className="relative bg-gradient-to-b from-lacquer-800 to-lacquer-900 border-2 border-gold-800 rounded-md p-5 sm:p-6 shadow-2xl transition-all"
              >
                {/* Decorative header */}
                <div className="flex items-center justify-between mb-3 border-b border-gold-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-sm bg-lacquer-700 border border-gold-800 text-xs font-mono font-bold text-gold-400">
                      #{selectedEntry.order.toString().padStart(2, "0")} / 60
                    </span>
                    <span className="text-xs text-ivory-500">Chi {selectedEntry.branchGroup}</span>
                  </div>
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => handleTogglePlaySound(selectedEntry.soundSymbolism.soundType)}
                      className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-sm border transition-all cursor-pointer active:scale-95 ${
                        playingSoundType === selectedEntry.soundSymbolism.soundType
                          ? "bg-gold-800 border-gold-400 text-gold-300 ring-2 ring-gold-400/50 animate-pulse"
                          : "bg-lacquer-700 hover:bg-gold-800 border-gold-800 hover:border-gold-500 text-gold-400 hover:text-gold-200"
                      }`}
                      title={
                        playingSoundType === selectedEntry.soundSymbolism.soundType
                          ? `Đang phát âm tượng: ${selectedEntry.soundSymbolism.soundName}. Bấm để dừng.`
                          : `Bấm để nghe âm tượng Nạp Âm: ${selectedEntry.soundSymbolism.soundName}`
                      }
                    >
                      <Volume2 className="w-3 h-3 text-gold-400" />
                      <span>{selectedEntry.elementNapAm}</span>
                    </button>
                  </div>
                </div>

                {/* Tab Switcher: [ 🎋 Tượng Hoa Giáp ] vs [ ☯️ Quẻ Kinh Dịch ] */}
                {selectedEntry.hexagramLink && (
                  <div className="flex items-center gap-1.5 p-1 rounded-sm bg-lacquer-900 border border-lacquer-700 mb-3.5">
                    <button
                      type="button"
                      onClick={() => setDetailImageTab("jiazi")}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-sm text-xs font-semibold transition-all cursor-pointer ${
                        detailImageTab === "jiazi"
                          ? "bg-lacquer-700 text-gold-300 border border-gold-700 shadow-sm"
                          : "text-ivory-500 hover:text-ivory-300 hover:bg-lacquer-800"
                      }`}
                    >
                      <Trees className="w-3.5 h-3.5 text-gold-400" />
                      <span>Ảnh Hoa Giáp</span>
                      {images[selectedEntry.id] && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDetailImageTab("hexagram")}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-sm text-xs font-semibold transition-all cursor-pointer ${
                        detailImageTab === "hexagram"
                          ? "bg-lacquer-700 text-gold-300 border border-gold-700 shadow-sm"
                          : "text-ivory-500 hover:text-ivory-300 hover:bg-lacquer-800"
                      }`}
                    >
                      <Compass className="w-3.5 h-3.5 text-gold-400" />
                      <span>Quẻ #{selectedEntry.hexagramLink.hexagramNumber}</span>
                      <span className="font-serif font-bold text-gold-400 text-xs">
                        {selectedEntry.hexagramLink.symbol}
                      </span>
                      {cardImages?.[selectedEntry.hexagramLink.hexagramNumber] && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      )}
                    </button>
                  </div>
                )}

                {/* Card Visual / Image Canvas */}
                <div className="relative w-full aspect-[3/4] min-h-[460px] sm:min-h-[520px] max-h-[660px] rounded-md overflow-hidden bg-lacquer-950 border border-gold-800 shadow-2xl group flex items-center justify-center">
                  {detailImageTab === "hexagram" && selectedEntry.hexagramLink ? (
                    (() => {
                      const hexObj = HEXAGRAMS.find((h) => h.number === selectedEntry.hexagramLink?.hexagramNumber);
                      const hexImg = cardImages?.[selectedEntry.hexagramLink?.hexagramNumber || 0];

                      return (
                        <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
                          {hexImg ? (
                            <>
                              <div
                                className="absolute inset-0 bg-cover bg-center filter blur-2xl opacity-35 scale-110 pointer-events-none transition-all duration-500"
                                style={{ backgroundImage: `url(${hexImg})` }}
                              />
                              <img
                                src={hexImg}
                                alt={selectedEntry.hexagramLink.hexagramName}
                                className={`relative z-10 w-full h-full ${
                                  imageFitMode === "cover" ? "object-cover" : "object-contain"
                                } transition-all duration-300 drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)]`}
                              />
                            </>
                          ) : hexObj ? (
                            <div className="relative z-10 scale-95 sm:scale-100">
                              <CardVisual
                                hexagram={hexObj}
                                size="md"
                                showName={true}
                                enableZoomModal={true}
                              />
                            </div>
                          ) : (
                            <div className="relative z-10 text-center">
                              <div className="text-6xl font-serif text-gold-400 mb-2">{selectedEntry.hexagramLink.symbol}</div>
                              <div className="text-lg font-serif font-bold text-ivory-100">Quẻ {selectedEntry.hexagramLink.hexagramName}</div>
                            </div>
                          )}

                          {/* Top badges for hexagram card */}
                          <div className="absolute top-3 left-3 z-20">
                            <span className="px-2.5 py-1 rounded-sm text-[10px] font-bold bg-lacquer-900/85 backdrop-blur-md text-gold-400 border border-gold-800 shadow flex items-center gap-1">
                              <Compass className="w-3 h-3 text-gold-400" />
                              <span>Quẻ #{selectedEntry.hexagramLink.hexagramNumber} ({selectedEntry.hexagramLink.symbol})</span>
                            </span>
                          </div>

                          <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
                            {hexImg && (
                              <button
                                type="button"
                                onClick={() => {
                                  setLightboxZoom(1);
                                  setLightboxImage(hexImg);
                                }}
                                className="p-1.5 rounded-sm bg-lacquer-900/85 hover:bg-lacquer-800 backdrop-blur-md text-ivory-100 border border-gold-800 transition-all cursor-pointer shadow hover:text-gold-400"
                                title="Mở toàn màn hình cực đại"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })()
                  ) : images[selectedEntry.id] ? (
                    <>
                      {/* Ambient blurred glow from image */}
                      <div
                        className="absolute inset-0 bg-cover bg-center filter blur-2xl opacity-35 scale-110 pointer-events-none transition-all duration-500"
                        style={{ backgroundImage: `url(${images[selectedEntry.id]})` }}
                      />
                      <img
                        src={images[selectedEntry.id]}
                        alt={selectedEntry.name}
                        onClick={() => {
                          setLightboxZoom(1);
                          setLightboxImage(images[selectedEntry.id]);
                        }}
                        className={`relative z-10 w-full h-full ${
                          imageFitMode === "cover" ? "object-cover" : "object-contain"
                        } transition-all duration-300 drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)] cursor-pointer`}
                        title="Nhấp để phóng to toàn màn hình"
                      />

                      {/* Top badges on image */}
                      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={handleToggleImageFitMode}
                          className="px-2 py-1 rounded-sm text-[10px] font-bold bg-lacquer-900/85 hover:bg-lacquer-800 backdrop-blur-md text-gold-400 border border-gold-800 transition-all cursor-pointer shadow flex items-center gap-1"
                          title={
                            imageFitMode === "contain"
                              ? "Ảnh đang luôn ở trạng thái FULL (Toàn bộ ảnh 100% không cắt xén). Nhấp để đổi sang lấp đầy."
                              : "Đang lấp đầy khung. Nhấp để chuyển về trạng thái FULL nguyên vẹn."
                          }
                        >
                          <Maximize2 className="w-3 h-3 text-gold-400" />
                          <span>{imageFitMode === "contain" ? "FULL (100%)" : "Lấp đầy"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setLightboxZoom(1);
                            setLightboxImage(images[selectedEntry.id]);
                          }}
                          className="p-1.5 rounded-sm bg-lacquer-900/85 hover:bg-lacquer-800 backdrop-blur-md text-ivory-100 border border-gold-800 transition-all cursor-pointer shadow hover:text-gold-400"
                          title="Mở toàn màn hình cực đại"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  ) : (
                    /* Default Placeholder with Calligraphy styling */
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-lacquer-800 via-lacquer-900 to-lacquer-950">
                      {/* Decorative Hanzi Emblem */}
                      <div className="w-24 h-24 rounded-full border-2 border-gold-800 bg-lacquer-700/70 flex items-center justify-center mb-4">
                        <span className="text-4xl font-serif font-bold text-gold-400">
                          {selectedEntry.chinese}
                        </span>
                      </div>
                      <h3 className="text-2xl font-display font-semibold text-ivory-100">
                        {selectedEntry.name}
                      </h3>
                      <p className="text-xs text-gold-400 font-medium mt-1">
                        {selectedEntry.elementNapAm}
                      </p>
                      <p className="text-xs text-ivory-500 mt-2 max-w-[240px] leading-relaxed">
                        {selectedEntry.symbolicCreature}
                      </p>

                      <div className="mt-6 pt-4 border-t border-lacquer-700 w-full flex flex-col items-center gap-2">
                        <button
                          type="button"
                          onClick={() => singleFileInputRef.current?.click()}
                          className="w-full max-w-[200px] flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold bg-gold-400 hover:bg-gold-400 text-lacquer-900 rounded-sm transition-all shadow-md active:scale-95 cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" /> Nạp Hình Cho Can Chi Này
                        </button>
                        <span className="text-[10px] text-gold-700">
                          (Hỗ trợ kéo thả ảnh trực tiếp vào đây)
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick actions row underneath image */}
                <div className="mt-4 pt-3 border-t border-lacquer-700 flex items-center justify-between text-xs text-ivory-500 flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {detailImageTab === "jiazi" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => singleFileInputRef.current?.click()}
                          className="flex items-center gap-1 hover:text-gold-400 cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5 text-gold-400" />
                          <span>{images[selectedEntry.id] ? "Đổi ảnh" : "Tải ảnh lên"}</span>
                        </button>
                        <span className="text-[#443525]">•</span>
                        <button
                          type="button"
                          onClick={() => setIsUrlModalOpen(true)}
                          className="flex items-center gap-1 hover:text-gold-400 cursor-pointer"
                        >
                          <span>Nhập link ảnh</span>
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-gold-500 flex items-center gap-1">
                        <Compass className="w-3.5 h-3.5" />
                        <span>Ảnh Quẻ #{selectedEntry.hexagramLink?.hexagramNumber} ({selectedEntry.hexagramLink?.hexagramName})</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleToggleImageFitMode}
                      className="flex items-center gap-1 text-gold-400 hover:text-gold-300 font-medium cursor-pointer"
                      title="Bật/tắt trạng thái Full (100% không cắt) hoặc Lấp đầy"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>{imageFitMode === "contain" ? "FULL (100%)" : "Lấp đầy"}</span>
                    </button>

                    {(detailImageTab === "hexagram" ? cardImages?.[selectedEntry.hexagramLink?.hexagramNumber || 0] : images[selectedEntry.id]) && (
                      <>
                        <span className="text-[#443525]">•</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (detailImageTab === "hexagram") {
                              setFullImageTab("hexagram");
                            } else {
                              setFullImageTab("jiazi");
                            }
                            setViewMode("full_image");
                          }}
                          className="flex items-center gap-1 hover:text-gold-400 cursor-pointer"
                          title="Chuyển sang chế độ xem Ảnh Full & Toàn Cảnh"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                          <span>Toàn Cảnh</span>
                        </button>
                        <span className="text-[#443525]">•</span>
                        <button
                          type="button"
                          onClick={() => {
                            setLightboxZoom(1);
                            const targetImg = detailImageTab === "hexagram"
                              ? cardImages?.[selectedEntry.hexagramLink?.hexagramNumber || 0]
                              : images[selectedEntry.id];
                            if (targetImg) setLightboxImage(targetImg);
                          }}
                          className="flex items-center gap-1 hover:text-gold-200 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Phóng to</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Companion Bridge Card: Hoa Giáp ↔ Quẻ Kinh Dịch */}
              {selectedEntry.hexagramLink && (() => {
                const hexImg = cardImages?.[selectedEntry.hexagramLink.hexagramNumber];

                return (
                  <div className="bg-lacquer-800 border border-gold-800 rounded-md p-3.5 shadow-md flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-14 rounded-sm overflow-hidden border border-gold-800 bg-lacquer-900 flex items-center justify-center shrink-0 shadow-sm">
                        {hexImg ? (
                          <img
                            src={hexImg}
                            alt={selectedEntry.hexagramLink.hexagramName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-center p-0.5">
                            <span className="text-xl font-serif text-gold-400 leading-none">
                              {selectedEntry.hexagramLink.symbol}
                            </span>
                            <span className="text-[8px] font-mono text-ivory-500 mt-0.5">
                              #{selectedEntry.hexagramLink.hexagramNumber}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] text-ivory-500 font-mono">
                          QUẺ KINH DỊCH TƯƠNG ỨNG
                        </div>
                        <div className="text-xs font-serif font-bold text-ivory-100 truncate flex items-center gap-1.5 mt-0.5">
                          <span>#{selectedEntry.hexagramLink.hexagramNumber} {selectedEntry.hexagramLink.hexagramName}</span>
                          <span className="text-gold-500 font-normal">({selectedEntry.hexagramLink.hexagramHanzi})</span>
                        </div>
                        <div className="text-[10px] text-ivory-500 truncate">
                          {hexImg ? "✓ Đã có hình quẻ Kinh Dịch" : "Vạch hào Chu Dịch"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {hexImg && (
                        <button
                          type="button"
                          onClick={() => {
                            setLightboxZoom(1);
                            setLightboxImage(hexImg);
                          }}
                          className="px-2.5 py-1.5 text-xs font-medium bg-lacquer-700 hover:bg-lacquer-700 text-gold-300 border border-gold-800 rounded-sm transition-all cursor-pointer shadow-sm flex items-center gap-1"
                          title="Xem ảnh phóng to"
                        >
                          <Eye className="w-3 h-3 text-gold-400" />
                          <span>Xem Hình</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setDetailImageTab((prev) => (prev === "jiazi" ? "hexagram" : "jiazi"));
                        }}
                        className="px-2.5 py-1.5 text-xs font-bold bg-gold-800 hover:bg-gold-800 text-gold-400 border border-gold-700 rounded-sm transition-all cursor-pointer shadow-sm flex items-center gap-1"
                        title="Đổi khung ảnh chính sang xem quẻ kinh dịch hoặc hoa giáp"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>{detailImageTab === "jiazi" ? "Hiện Quẻ" : "Hiện Hoa Giáp"}</span>
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Prev / Next Navigation Bar */}
              <div className="flex items-center justify-between gap-3 bg-lacquer-800 border border-lacquer-700 p-3 rounded-md">
                <button
                  type="button"
                  onClick={() => handleSelectEntry(prevEntry.id)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-ivory-300 hover:text-gold-200 hover:bg-lacquer-700 rounded-sm transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4 text-gold-400" />
                  <div className="text-left">
                    <div className="text-[10px] text-gold-700">Trước</div>
                    <div className="font-bold">{prevEntry.name}</div>
                  </div>
                </button>

                <div className="text-center">
                  <div className="text-xs font-serif font-bold text-gold-400">
                    {selectedEntry.name}
                  </div>
                  <div className="text-[10px] text-gold-700">
                    #{selectedEntry.order} / 60
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectEntry(nextEntry.id)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-ivory-300 hover:text-gold-200 hover:bg-lacquer-700 rounded-sm transition-colors cursor-pointer text-right"
                >
                  <div className="text-right">
                    <div className="text-[10px] text-gold-700">Kế tiếp</div>
                    <div className="font-bold">{nextEntry.name}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gold-400" />
                </button>
              </div>

              {/* Quick Horizontal Carousel of Current Branch (5 items) */}
              <div className="bg-lacquer-800 border border-lacquer-700 rounded-md p-4">
                <div className="text-xs font-bold text-gold-500 mb-2.5 flex items-center justify-between">
                  <span>CÙNG CHI {selectedEntry.branchGroup.toUpperCase()} ({SIXTY_JIAZI.filter(j => j.branchGroup === selectedEntry.branchGroup).length} CAN CHI)</span>
                  <span className="text-[10px] text-gold-700 font-normal">Bấm chuyển nhanh</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {SIXTY_JIAZI.filter((j) => j.branchGroup === selectedEntry.branchGroup).map((item) => {
                    const isCur = item.id === selectedEntry.id;
                    const hasPic = !!images[item.id];
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectEntry(item.id)}
                        className={`p-2 rounded-sm text-center border transition-all cursor-pointer ${
                          isCur
                            ? "bg-lacquer-700 border-gold-500 text-gold-500 font-bold shadow-sm"
                            : "bg-lacquer-900 border-lacquer-700 text-ivory-500 hover:border-gold-800 hover:text-gold-200"
                        }`}
                      >
                        <div className="text-[10px] text-gold-700">#{item.order}</div>
                        <div className="text-xs font-serif font-bold mt-0.5 truncate">{item.can}</div>
                        <div className="text-[10px] mt-1 flex justify-center">
                          {hasPic ? (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-gold-800" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Full PDF In-depth Interpretations (lg:col-span-7) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Title & Summary Banner */}
              <div className="relative overflow-hidden border border-gold-800 border-t-gold-600 bg-lacquer-900/80 p-6 sm:p-8">
                <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 text-8xl font-serif text-gold-500/[0.06] select-none pointer-events-none">
                  {selectedEntry.chinese}
                </div>

                <div className="relative">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {/* Nạp Âm Badge - Nhấn vào để phát âm tượng Nạp Âm */}
                    <button
                      type="button"
                      onClick={() => handleTogglePlaySound(selectedEntry.soundSymbolism.soundType)}
                      className={`group inline-flex items-center gap-1.5 px-3 py-1 rounded-sm border text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95 ${
                        playingSoundType === selectedEntry.soundSymbolism.soundType
                          ? "bg-gold-800 border-gold-400 text-gold-300 ring-2 ring-gold-400/50 animate-pulse"
                          : "bg-lacquer-700 hover:bg-gold-800 border-gold-800 hover:border-gold-500 text-gold-400 hover:text-ivory-100"
                      }`}
                      title={
                        playingSoundType === selectedEntry.soundSymbolism.soundType
                          ? `Đang phát âm tượng: ${selectedEntry.soundSymbolism.soundName}. Bấm để dừng.`
                          : `Bấm để nghe âm tượng Nạp Âm: ${selectedEntry.soundSymbolism.soundName}`
                      }
                    >
                      <Volume2
                        className={`w-3.5 h-3.5 transition-transform duration-300 ${
                          playingSoundType === selectedEntry.soundSymbolism.soundType
                            ? "text-gold-400 scale-110"
                            : "text-gold-400/80 group-hover:text-gold-400 group-hover:scale-110"
                        }`}
                      />
                      <span>{selectedEntry.elementNapAm}</span>
                      {playingSoundType === selectedEntry.soundSymbolism.soundType ? (
                        <span className="flex items-center gap-0.5 ml-1">
                          <span className="w-1 h-2.5 bg-gold-400 rounded-full animate-pulse" />
                          <span className="w-1 h-3.5 bg-gold-300 rounded-full animate-pulse delay-75" />
                          <span className="w-1 h-2 bg-gold-400 rounded-full animate-pulse delay-150" />
                        </span>
                      ) : (
                        <span className="text-[10px] text-ivory-500 group-hover:text-gold-400 ml-0.5 transition-colors">
                          (Nghe âm)
                        </span>
                      )}
                    </button>

                    {/* Quẻ Kinh Dịch Badge */}
                    {selectedEntry.hexagramLink && (
                      <button
                        type="button"
                        onClick={() => {
                          if (onSelectHexagram) {
                            onSelectHexagram(selectedEntry.hexagramLink.hexagramNumber);
                          } else {
                            setHexagramModalData(selectedEntry.hexagramLink);
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-lacquer-800 hover:bg-lacquer-700 border border-gold-800 hover:border-gold-400 text-xs font-bold text-gold-400 transition-all cursor-pointer shadow-sm active:scale-95"
                        title={`Quẻ Kinh Dịch tương ứng: #${selectedEntry.hexagramLink.hexagramNumber} ${selectedEntry.hexagramLink.hexagramName} (${selectedEntry.hexagramLink.hexagramHanzi}). Nhấp để xem luận giải.`}
                      >
                        <Compass className="w-3.5 h-3.5 text-gold-400" />
                        <span>Quẻ #{selectedEntry.hexagramLink.hexagramNumber} {selectedEntry.hexagramLink.hexagramName}</span>
                        <span className="font-serif text-ivory-100 text-sm leading-none ml-0.5">{selectedEntry.hexagramLink.symbol}</span>
                      </button>
                    )}

                    <span className="text-xs text-ivory-500">
                      Thứ tự hoa giáp #{selectedEntry.order}
                    </span>
                  </div>

                  <h2 className="royal-title mt-2 text-4xl sm:text-5xl flex flex-wrap items-baseline gap-x-4">
                    {selectedEntry.name}
                    <span className="text-xl font-serif tracking-[0.3em] text-gold-500">
                      {selectedEntry.chinese}
                    </span>
                  </h2>

                  <div className="mt-3 text-sm font-serif italic text-gold-400 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rotate-45 bg-gold-500" />
                    <span>Biểu tượng cốt lõi: {selectedEntry.symbolicCreature}</span>
                  </div>

                  <p className="mt-5 text-[15px] font-serif text-ivory-300 leading-relaxed border-l border-gold-600 pl-4">
                    {selectedEntry.summary}
                  </p>
                </div>
              </div>

              {/* TƯỢNG ÂM THANH & KHÍ TƯỢNG (氣象與象徵之聲) */}
              {(() => {
                const companionOrder =
                  selectedEntry.order % 2 === 1
                    ? selectedEntry.order + 1
                    : selectedEntry.order - 1;
                const companionEntry = SIXTY_JIAZI.find(
                  (item) => item.order === companionOrder
                );
                const isCurrentPlaying =
                  playingSoundType === selectedEntry.soundSymbolism.soundType;

                return (
                  <div
                    className={`bg-lacquer-800 border rounded-md p-6 sm:p-7 shadow-xl transition-all relative overflow-hidden ${
                      isCurrentPlaying
                        ? "border-gold-500 ring-2 ring-gold-500/30"
                        : "border-gold-800"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold-800 pb-4 mb-5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-md border flex items-center justify-center transition-colors ${
                            isCurrentPlaying
                              ? "bg-gold-500/15 text-gold-200 border-gold-500"
                              : "bg-lacquer-700 border-gold-800 text-gold-400"
                          }`}
                        >
                          <Volume2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg sm:text-xl font-display font-semibold text-ivory-100">
                              Tượng Âm Thanh & Khí Tượng
                            </h3>
                            <span className="text-xs font-serif text-gold-500 bg-lacquer-700 px-2 py-0.5 rounded border border-gold-800">
                              氣象與象徵之聲
                            </span>
                          </div>
                          <div className="text-xs text-ivory-500 mt-0.5">
                            Trạng thái khí vận và âm thanh biểu trưng của {selectedEntry.elementNapAm}
                          </div>
                        </div>
                      </div>

                      {/* Interactive Sound Trigger */}
                      <button
                        type="button"
                        onClick={() =>
                          handleTogglePlaySound(selectedEntry.soundSymbolism.soundType)
                        }
                        className={`flex items-center gap-2 px-4 py-2 rounded-sm text-xs font-bold transition-all cursor-pointer shadow-md active:scale-95 shrink-0 ${
                          isCurrentPlaying
                            ? "bg-rose-600 text-white animate-pulse"
                            : "bg-gold-400 hover:bg-gold-400 text-lacquer-900"
                        }`}
                      >
                        {isCurrentPlaying ? (
                          <>
                            <Square className="w-3.5 h-3.5 fill-current" />
                            <span>Dừng Âm Tượng</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Nghe Tượng Âm Thanh</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Playing wave indicator */}
                    {isCurrentPlaying && (
                      <div className="mb-4 py-2 px-4 rounded-sm bg-lacquer-800 border border-gold-500/50 flex items-center justify-between text-xs text-gold-400 animate-in fade-in">
                        <span className="flex items-center gap-2 font-medium">
                          <Waves className="w-4 h-4 animate-bounce" />
                          <span>Đang mô phỏng cộng hưởng âm tượng: {selectedEntry.soundSymbolism.soundName}</span>
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="w-1 h-3.5 bg-gold-400 rounded-full animate-pulse" />
                          <span className="w-1 h-5 bg-gold-400 rounded-full animate-pulse delay-75" />
                          <span className="w-1 h-2.5 bg-gold-400 rounded-full animate-pulse delay-150" />
                          <span className="w-1 h-4 bg-gold-400 rounded-full animate-pulse delay-200" />
                        </div>
                      </div>
                    )}

                    {/* Two Primary Descriptive Blocks */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Block 1: Tượng Khí & Trạng Thái */}
                      <div className="bg-lacquer-900 border border-lacquer-700 rounded-md p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-bold text-ivory-500 tracking-wider uppercase">
                            Tượng Khí & Trạng Thái
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-sm bg-lacquer-700 border border-gold-800 text-gold-500 font-mono">
                            Hành {selectedEntry.soundSymbolism.element}
                          </span>
                        </div>
                        <p className="text-sm font-serif text-ivory-100 leading-relaxed">
                          {selectedEntry.soundSymbolism.qiState}
                        </p>
                      </div>

                      {/* Block 2: Âm Thanh Tượng Trưng */}
                      <div className="bg-lacquer-800 border border-gold-800 rounded-md p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-bold text-gold-400 tracking-wider uppercase flex items-center gap-1">
                            <Volume2 className="w-3 h-3 text-gold-400" />
                            Âm Thanh Tượng Trưng
                          </span>
                          <span className="text-[10px] text-ivory-500 font-mono">
                            {selectedEntry.soundSymbolism.napAm}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-ivory-100 leading-relaxed">
                          {selectedEntry.soundSymbolism.soundName}
                        </p>
                      </div>
                    </div>

                    {/* Companion info & Link to 30 sounds table */}
                    <div className="mt-4 pt-3 border-t border-lacquer-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                      {companionEntry && (
                        <div className="text-ivory-500 flex items-center gap-1.5 flex-wrap">
                          <span>Đồng nạp âm ({selectedEntry.elementNapAm}):</span>
                          <button
                            type="button"
                            onClick={() => handleSelectEntry(companionEntry.id)}
                            className="text-gold-400 hover:underline font-serif font-bold flex items-center gap-1 cursor-pointer bg-lacquer-700 px-2 py-0.5 rounded border border-gold-800"
                          >
                            <span>#{companionEntry.order} {companionEntry.name} ({companionEntry.chinese})</span>
                          </button>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => setViewMode("sounds")}
                        className="text-ivory-500 hover:text-gold-500 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>Xem toàn bộ bảng 30 Tượng Âm Thanh</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* LIÊN KẾT KINH DỊCH: QUẺ TƯƠNG ỨNG VỚI HOA GIÁP */}
              {selectedEntry.hexagramLink && (
                <div className="bg-lacquer-800 border border-gold-800 rounded-md p-6 sm:p-7 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 text-8xl font-serif text-gold-500/10 select-none pointer-events-none">
                    {selectedEntry.hexagramLink.symbol}
                  </div>

                  <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gold-800 pb-4 mb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-lacquer-700 border border-gold-800 flex items-center justify-center text-gold-400 shadow-sm text-2xl font-serif">
                          {selectedEntry.hexagramLink.symbol}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg sm:text-xl font-display font-semibold text-ivory-100">
                              Quẻ Kinh Dịch Tương Ứng
                            </h3>
                            <span className="text-xs font-serif text-gold-500 bg-lacquer-700 px-2 py-0.5 rounded border border-gold-800">
                              周易對應卦象
                            </span>
                          </div>
                          <div className="text-xs text-ivory-500 mt-0.5">
                            Quy luật Tiên Thiên Chu Kỳ Tiêu Trưởng: {selectedEntry.name} ({selectedEntry.elementNapAm}) ↔ Quẻ #{selectedEntry.hexagramLink.hexagramNumber} {selectedEntry.hexagramLink.hexagramName}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {onSelectHexagram && (
                          <button
                            type="button"
                            onClick={() => onSelectHexagram(selectedEntry.hexagramLink.hexagramNumber)}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-sm text-xs font-bold bg-gold-500 hover:bg-gold-400 text-lacquer-900 transition-all cursor-pointer shadow-md active:scale-95 shrink-0"
                            title="Mở toàn bộ luận giải chi tiết của quẻ này trong mục Giải Nghĩa Kinh Dịch"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Tra Cứu Quẻ Này</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setViewMode("hexagrams")}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-sm text-xs font-medium bg-lacquer-700 hover:bg-lacquer-700 text-ivory-300 border border-gold-800 transition-colors cursor-pointer shrink-0"
                          title="Mở bảng đối ứng đầy đủ 60 Hoa Giáp và 60 Quẻ Dịch"
                        >
                          <Compass className="w-3.5 h-3.5 text-gold-400" />
                          <span>Xem Bảng 60 Quẻ</span>
                        </button>
                      </div>
                    </div>

                    {/* Hexagram Banner Info & Visual Artwork */}
                    {(() => {
                      const hexObj = HEXAGRAMS.find((h) => h.number === selectedEntry.hexagramLink?.hexagramNumber);
                      const hexImg = cardImages?.[selectedEntry.hexagramLink?.hexagramNumber || 0];

                      return (
                        <div className="bg-lacquer-900 border border-lacquer-700 rounded-md p-4 sm:p-5 shadow-inner">
                          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 pb-4 border-b border-gold-800">
                            {/* Visual Thumbnail & Zoom Button */}
                            <div className="shrink-0 flex flex-col items-center">
                              {hexObj ? (
                                <div className="rounded-sm overflow-hidden shadow-lg border border-gold-800 bg-lacquer-950">
                                  <CardVisual
                                    hexagram={hexObj}
                                    imageUrl={hexImg}
                                    size="sm"
                                    showName={false}
                                    enableZoomModal={true}
                                  />
                                </div>
                              ) : (
                                <div className="w-24 h-32 rounded-sm bg-lacquer-700 border border-gold-800 flex items-center justify-center text-3xl text-gold-400 font-serif shadow-inner">
                                  {selectedEntry.hexagramLink.symbol}
                                </div>
                              )}

                              <div className="mt-2 text-center space-y-1">
                                {hexImg && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setLightboxZoom(1);
                                      setLightboxImage(hexImg);
                                    }}
                                    className="text-[11px] text-gold-500 hover:text-gold-300 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                                  >
                                    <Eye className="w-3 h-3" />
                                    <span>Phóng to ảnh</span>
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Hexagram Meta & Meaning */}
                            <div className="flex-1 min-w-0 w-full">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-2xl font-serif text-gold-400 font-bold">
                                    {selectedEntry.hexagramLink.symbol}
                                  </span>
                                  <span className="text-lg font-serif font-bold text-ivory-100">
                                    {selectedEntry.hexagramLink.hexagramName}
                                  </span>
                                  <span className="text-xs font-serif text-ivory-500">
                                    ({selectedEntry.hexagramLink.hexagramHanzi})
                                  </span>
                                  <span className="px-2 py-0.5 rounded-md bg-lacquer-700 border border-gold-800 text-[10px] font-mono font-bold text-gold-400">
                                    Quẻ #{selectedEntry.hexagramLink.hexagramNumber}
                                  </span>
                                </div>
                                <div className="text-xs text-ivory-500 flex items-center gap-2">
                                  <span>Thượng: <strong className="text-ivory-300">{selectedEntry.hexagramLink.upperTrigram}</strong></span>
                                  <span>•</span>
                                  <span>Hạ: <strong className="text-gold-400">{selectedEntry.hexagramLink.lowerTrigram}</strong></span>
                                </div>
                              </div>

                              <p className="text-xs text-ivory-300 leading-relaxed mb-3">
                                {hexObj ? hexObj.overview : selectedEntry.hexagramLink.natureMeaning}
                              </p>

                              <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-lacquer-700">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDetailImageTab("hexagram");
                                    const el = document.getElementById("jiazi-detail-container");
                                    if (el) el.scrollIntoView({ behavior: "smooth" });
                                  }}
                                  className="px-2.5 py-1 text-xs rounded-sm bg-lacquer-700 hover:bg-gold-800 text-gold-300 border border-gold-800 font-medium transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                                >
                                  <Maximize2 className="w-3 h-3 text-gold-400" />
                                  <span>Hiện hình quẻ ở khung chính</span>
                                </button>
                                {onSelectHexagram && (
                                  <button
                                    type="button"
                                    onClick={() => onSelectHexagram(selectedEntry.hexagramLink.hexagramNumber)}
                                    className="px-2.5 py-1 text-xs rounded-sm bg-lacquer-700 hover:bg-gold-800 text-gold-300 hover:text-gold-200 border border-gold-800 hover:border-gold-400 font-medium transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                                    title="Nhấp để nhảy sang phần giải thích trong Sách Thuyết Minh Kinh Dịch"
                                  >
                                    <BookOpen className="w-3.5 h-3.5 text-gold-400" />
                                    <span>Xem giải nghĩa quẻ #{selectedEntry.hexagramLink.hexagramNumber}</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs mt-3.5">
                            <div className="bg-lacquer-800 border border-lacquer-700 rounded-sm p-3">
                              <div className="text-[11px] font-bold text-gold-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Tượng Quẻ & Khí Vận</span>
                              </div>
                              <p className="text-ivory-300 leading-relaxed">
                                {selectedEntry.hexagramLink.natureMeaning}
                              </p>
                            </div>

                            <div className="bg-lacquer-800 border border-lacquer-700 rounded-sm p-3">
                              <div className="text-[11px] font-bold text-gold-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                <Compass className="w-3.5 h-3.5" />
                                <span>Luận Giải Tương Liên Hoa Giáp & Quẻ Dịch</span>
                              </div>
                              <p className="text-ivory-300 leading-relaxed">
                                {selectedEntry.hexagramLink.linkAnalysis}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* PART 1: CHI TIẾT TƯỢNG HÌNH (Phối tượng tự nhiên - 自然配象) */}
              <div className="bg-lacquer-800 border border-gold-800 rounded-md p-6 sm:p-7 shadow-xl">
                <div className="flex items-center gap-3 border-b border-gold-800 pb-4 mb-5">
                  <div className="w-9 h-9 rounded-sm bg-lacquer-700 border border-gold-800 flex items-center justify-center text-gold-400">
                    <Trees className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-display font-semibold text-ivory-100">
                      {selectedEntry.part1.title}
                    </h3>
                    <div className="text-xs text-ivory-500">
                      Tự nhiên phối tượng • Tượng hình vũ trụ quan
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {selectedEntry.part1.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-lacquer-900 border border-lacquer-700 hover:border-gold-800 rounded-md p-4 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1.5">
                        <h4 className="text-sm font-serif font-bold text-ivory-100 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-lacquer-700 text-gold-400 text-xs flex items-center justify-center font-mono">
                            {idx + 1}
                          </span>
                          {item.title}
                        </h4>
                        {item.chineseTerm && (
                          <span className="text-xs text-gold-500 font-serif bg-lacquer-800 px-2 py-0.5 rounded border border-gold-800 self-start sm:self-auto">
                            {item.chineseTerm}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-ivory-300 leading-relaxed pl-7">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* PART 2: Ý NGHĨA TRIẾT LÝ & NHÂN SINH (哲理 / 擬人化) */}
              <div className="bg-lacquer-800 border border-gold-800 rounded-md p-6 sm:p-7 shadow-xl">
                <div className="flex items-center gap-3 border-b border-gold-800 pb-4 mb-5">
                  <div className="w-9 h-9 rounded-sm bg-lacquer-700 border border-gold-800 flex items-center justify-center text-gold-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-display font-semibold text-ivory-100">
                      {selectedEntry.part2.title}
                    </h3>
                    <div className="text-xs text-ivory-500">
                      Nhân sinh minh triết • Nghệ thuật xử thế & tu dưỡng
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {selectedEntry.part2.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-lacquer-900 border border-lacquer-700 hover:border-gold-800 rounded-md p-4 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1.5">
                        <h4 className="text-sm font-serif font-bold text-gold-400 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-gold-800 text-ivory-100 text-xs flex items-center justify-center font-mono">
                            {idx + 1}
                          </span>
                          {item.title}
                        </h4>
                        {item.chineseTerm && (
                          <span className="text-xs text-ivory-500 font-serif bg-lacquer-800 px-2 py-0.5 rounded border border-gold-800 self-start sm:self-auto">
                            {item.chineseTerm}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-ivory-300 leading-relaxed pl-7">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal for Large Image View - Trạng thái FULL 100% */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-4"
          onClick={() => {
            setLightboxImage(null);
            setLightboxZoom(1);
          }}
        >
          <div
            className="relative max-w-5xl w-full max-h-[96vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Toolbar in Lightbox */}
            <div className="w-full flex items-center justify-between mb-3 px-2 text-xs text-ivory-300 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-base text-ivory-100">
                  #{selectedEntry.order.toString().padStart(2, "0")} {selectedEntry.name} ({selectedEntry.chinese})
                </span>
                <button
                  type="button"
                  onClick={() => handleTogglePlaySound(selectedEntry.soundSymbolism.soundType)}
                  className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-sm border font-medium cursor-pointer transition-all active:scale-95 ${
                    playingSoundType === selectedEntry.soundSymbolism.soundType
                      ? "bg-gold-800 border-gold-400 text-gold-300 ring-2 ring-gold-400/50 animate-pulse"
                      : "bg-lacquer-700 hover:bg-gold-800 border-gold-800 hover:border-gold-500 text-gold-400 hover:text-gold-200"
                  }`}
                  title={
                    playingSoundType === selectedEntry.soundSymbolism.soundType
                      ? `Đang phát âm tượng: ${selectedEntry.soundSymbolism.soundName}. Bấm để dừng.`
                      : `Bấm để nghe âm tượng Nạp Âm: ${selectedEntry.soundSymbolism.soundName}`
                  }
                >
                  <Volume2 className="w-3 h-3 text-gold-400" />
                  <span>{selectedEntry.elementNapAm}</span>
                </button>
                {selectedEntry.hexagramLink && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectHexagram) {
                        setLightboxImage(null);
                        onSelectHexagram(selectedEntry.hexagramLink.hexagramNumber);
                      } else {
                        setHexagramModalData(selectedEntry.hexagramLink);
                      }
                    }}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-sm bg-lacquer-800 hover:bg-lacquer-700 border border-gold-800 hover:border-gold-400 text-gold-400 font-medium cursor-pointer transition-all shadow-sm"
                    title={`Quẻ Kinh Dịch tương ứng: #${selectedEntry.hexagramLink.hexagramNumber} ${selectedEntry.hexagramLink.hexagramName}`}
                  >
                    <Compass className="w-3 h-3 text-gold-400" />
                    <span>Quẻ #{selectedEntry.hexagramLink.hexagramNumber} {selectedEntry.hexagramLink.hexagramName}</span>
                    <span className="font-serif text-ivory-100">{selectedEntry.hexagramLink.symbol}</span>
                  </button>
                )}
                <span className="text-[11px] text-emerald-400 font-mono bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60 font-semibold">
                  TRẠNG THÁI: FULL (100% NGUYÊN BẢN)
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setLightboxZoom((z) => Math.max(0.5, Math.round((z - 0.25) * 100) / 100))}
                  className="p-1.5 rounded-sm bg-lacquer-700 hover:bg-gold-800 border border-gold-800 text-gold-300 cursor-pointer"
                  title="Thu nhỏ"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono text-gold-500 min-w-[42px] text-center font-bold">
                  {Math.round(lightboxZoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setLightboxZoom((z) => Math.min(3, Math.round((z + 0.25) * 100) / 100))}
                  className="p-1.5 rounded-sm bg-lacquer-700 hover:bg-gold-800 border border-gold-800 text-gold-300 cursor-pointer"
                  title="Phóng to"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxZoom(1)}
                  className="p-1.5 rounded-sm bg-lacquer-700 hover:bg-gold-800 border border-gold-800 text-gold-300 cursor-pointer"
                  title="Đặt lại kích thước chuẩn 100%"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (lightboxImage) {
                      downloadDataUrlAsPng(
                        lightboxImage,
                        `hoa-giap-${selectedEntry.id}-${selectedEntry.name}.png`
                      );
                    }
                  }}
                  className="p-1.5 rounded-sm bg-lacquer-700 hover:bg-gold-800 border border-gold-800 text-gold-300 hover:text-gold-400 cursor-pointer"
                  title="Tải ảnh Hoa Giáp này về máy"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLightboxImage(null);
                    setLightboxZoom(1);
                  }}
                  className="p-1.5 text-ivory-300 hover:text-gold-200 bg-white/10 hover:bg-white/20 rounded-full cursor-pointer transition-colors ml-2"
                  title="Đóng xem ảnh"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Image Canvas with Zoom in Lightbox */}
            <div className="w-full flex items-center justify-center overflow-auto max-h-[82vh] rounded-md border border-gold-800 bg-lacquer-950 p-3 shadow-2xl relative">
              <img
                src={lightboxImage}
                alt={`Hình ảnh Hoa Giáp ${selectedEntry.name}`}
                style={{
                  transform: `scale(${lightboxZoom})`,
                  transformOrigin: "center center",
                }}
                className="max-w-full max-h-[78vh] object-contain transition-transform duration-200 drop-shadow-2xl"
              />
            </div>

            <div className="mt-3 text-xs text-ivory-500 text-center">
              {selectedEntry.symbolicCreature} • Toàn bộ đường nét, thư họa và chi tiết của Hoa Giáp được bảo toàn 100% không cắt xén
            </div>
          </div>
        </div>
      )}

      {/* Modal: Input Image URL */}
      {isUrlModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsUrlModalOpen(false)}
        >
          <div
            className="bg-lacquer-800 border border-gold-800 rounded-md p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gold-800">
              <h3 className="font-display font-semibold text-lg text-ivory-100">
                Nhập Đường Dẫn Hình Ảnh (URL)
              </h3>
              <button
                type="button"
                onClick={() => setIsUrlModalOpen(false)}
                className="text-ivory-500 hover:text-gold-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-xs text-ivory-500">
                Dán đường dẫn trực tiếp đến tệp ảnh (JPG, PNG, WebP) cho <strong>{selectedEntry.name}</strong>:
              </p>
              <input
                type="url"
                value={inputImageUrl}
                onChange={(e) => setInputImageUrl(e.target.value)}
                placeholder="https://example.com/hinh-anh.jpg"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-lacquer-900 border border-gold-800 focus:border-gold-500 rounded-sm text-ivory-100 outline-none"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUrlModalOpen(false)}
                  className="px-4 py-2 text-xs text-ivory-500 hover:text-gold-200"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveByUrl}
                  disabled={!inputImageUrl.trim()}
                  className="px-4 py-2 text-xs font-bold bg-gold-400 hover:bg-gold-400 text-lacquer-900 rounded-sm disabled:opacity-50 cursor-pointer"
                >
                  Lưu Ảnh
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Hexagram Detail Modal */}
      {hexagramModalData && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setHexagramModalData(null)}
        >
          <div
            className="bg-lacquer-800 border-2 border-gold-800 rounded-md p-6 sm:p-7 max-w-lg w-full shadow-2xl relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 right-0 p-6 text-9xl font-serif text-gold-500/10 select-none pointer-events-none">
              {hexagramModalData.symbol}
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between pb-4 border-b border-gold-800 mb-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-sm bg-lacquer-700 border border-gold-800 text-xs font-mono font-bold text-gold-400">
                    Hoa Giáp #{hexagramModalData.order}
                  </span>
                  <span className="font-serif font-bold text-base text-ivory-100">
                    {hexagramModalData.jiaziName}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setHexagramModalData(null)}
                  className="p-1.5 text-ivory-500 hover:text-gold-200 rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Hexagram Hero */}
              <div className="flex items-center gap-4 bg-lacquer-900 border border-gold-800 p-4 rounded-md mb-4">
                <div className="w-16 h-16 rounded-sm bg-lacquer-700 border border-gold-800 flex items-center justify-center text-4xl text-gold-400 shadow-inner font-serif">
                  {hexagramModalData.symbol}
                </div>
                <div>
                  <div className="text-xs font-mono text-gold-500">
                    QUẺ KINH DỊCH #{hexagramModalData.hexagramNumber}
                  </div>
                  <h3 className="text-2xl font-display font-semibold text-ivory-100 flex items-center gap-2 mt-0.5">
                    <span>{hexagramModalData.hexagramName}</span>
                    <span className="text-sm text-ivory-500 font-normal font-serif">
                      ({hexagramModalData.hexagramHanzi})
                    </span>
                  </h3>
                  <div className="text-xs text-ivory-500 mt-1">
                    Thượng: <strong className="text-ivory-300">{hexagramModalData.upperTrigram}</strong> • Hạ: <strong className="text-gold-400">{hexagramModalData.lowerTrigram}</strong>
                  </div>
                </div>
              </div>

              {/* Meanings */}
              <div className="space-y-3 text-xs mb-5">
                <div className="bg-lacquer-900 border border-lacquer-700 p-3.5 rounded-sm">
                  <div className="font-bold text-gold-400 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>TƯỢNG QUẺ & KHÍ VẬN:</span>
                  </div>
                  <p className="text-ivory-300 leading-relaxed">
                    {hexagramModalData.natureMeaning}
                  </p>
                </div>

                <div className="bg-lacquer-900 border border-lacquer-700 p-3.5 rounded-sm">
                  <div className="font-bold text-gold-500 mb-1 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5" />
                    <span>LUẬN GIẢI TƯƠNG LIÊN HOA GIÁP & KINH DỊCH:</span>
                  </div>
                  <p className="text-ivory-300 leading-relaxed">
                    {hexagramModalData.linkAnalysis}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2.5 pt-2 border-t border-lacquer-700">
                <button
                  type="button"
                  onClick={() => setHexagramModalData(null)}
                  className="flex-1 py-2.5 text-xs text-ivory-500 hover:text-gold-200 bg-lacquer-800 hover:bg-lacquer-700 rounded-sm font-medium transition-colors cursor-pointer"
                >
                  Đóng
                </button>
                {onSelectHexagram && (
                  <button
                    type="button"
                    onClick={() => {
                      const num = hexagramModalData.hexagramNumber;
                      setHexagramModalData(null);
                      onSelectHexagram(num);
                    }}
                    className="flex-2 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold bg-gold-500 hover:bg-gold-400 text-lacquer-900 rounded-sm transition-all cursor-pointer shadow-md active:scale-95"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Xem Giải Thích Thuyết Minh Quẻ #{hexagramModalData.hexagramNumber}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Nạp Tệp JSON Vào Hoa Giáp */}
      {isJsonModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in"
          onClick={() => setIsJsonModalOpen(false)}
        >
          <div
            className="bg-lacquer-800 border-2 border-gold-800 rounded-md max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gold-800 bg-gradient-to-r from-lacquer-800 to-lacquer-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-lacquer-700 border border-gold-700 flex items-center justify-center text-gold-400">
                  <FileCode2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg sm:text-xl text-ivory-100">
                    Nạp Tệp Dữ Liệu JSON Vào Hoa Giáp
                  </h3>
                  <p className="text-xs text-ivory-500">
                    Tải tệp tin .JSON hoặc dán chuỗi cấu hình để nạp hàng loạt ảnh cho 60 Hoa Giáp
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsJsonModalOpen(false)}
                className="text-ivory-500 hover:text-gold-200 p-1 rounded-sm hover:bg-lacquer-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-gold-800 bg-lacquer-900 px-6 pt-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setJsonModalTab("file");
                  setJsonError(null);
                }}
                className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 font-medium transition-colors cursor-pointer ${
                  jsonModalTab === "file"
                    ? "border-gold-400 text-gold-300 font-bold"
                    : "border-transparent text-ivory-500 hover:text-[#DDD]"
                }`}
              >
                <FileUp className="w-4 h-4" />
                <span>Tải Tệp .JSON</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setJsonModalTab("paste");
                  setJsonError(null);
                }}
                className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 font-medium transition-colors cursor-pointer ${
                  jsonModalTab === "paste"
                    ? "border-gold-400 text-gold-300 font-bold"
                    : "border-transparent text-ivory-500 hover:text-[#DDD]"
                }`}
              >
                <Copy className="w-4 h-4" />
                <span>Dán Chuỗi JSON</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setJsonModalTab("template");
                  setJsonError(null);
                }}
                className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 font-medium transition-colors cursor-pointer ${
                  jsonModalTab === "template"
                    ? "border-gold-400 text-gold-300 font-bold"
                    : "border-transparent text-ivory-500 hover:text-[#DDD]"
                }`}
              >
                <Download className="w-4 h-4" />
                <span>File Mẫu & Hướng Dẫn</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Feedback messages */}
              {jsonError && (
                <div className="p-3.5 rounded-sm bg-[#351616] border border-[#8B2D2D] text-xs text-[#FFC4C4] flex items-start gap-2.5">
                  <X className="w-4 h-4 text-[#FF6B6B] shrink-0 mt-0.5" />
                  <div className="leading-relaxed">{jsonError}</div>
                </div>
              )}

              {jsonSuccessMsg && (
                <div className="p-3.5 rounded-sm bg-[#17301B] border border-[#2E7D32] text-xs text-[#C8E6C9] flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#66BB6A] shrink-0" />
                  <div className="font-semibold">{jsonSuccessMsg}</div>
                </div>
              )}

              {/* TAB 1: FILE UPLOAD */}
              {jsonModalTab === "file" && (
                <div className="space-y-4">
                  <input
                    ref={jsonFileInputInModalRef}
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleJsonFileSelect}
                  />

                  <div
                    onClick={() => jsonFileInputInModalRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) {
                        const fakeEvent = { target: { files: [file] } } as any;
                        handleJsonFileSelect(fakeEvent);
                      }
                    }}
                    className="border-2 border-dashed border-gold-800 hover:border-gold-400 bg-lacquer-800 hover:bg-lacquer-700 rounded-md p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full bg-lacquer-700 group-hover:bg-gold-800 border border-gold-800 flex items-center justify-center text-gold-400 mb-3 transition-colors">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-semibold text-ivory-100">
                      Bấm để chọn tệp .json hoặc kéo thả vào đây
                    </div>
                    <div className="text-xs text-ivory-500 mt-1 max-w-sm">
                      Hỗ trợ tệp backup chuẩn, object key-value (theo tên hoặc ID), hoặc mảng dữ liệu 60 Hoa Giáp.
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PASTE JSON */}
              {jsonModalTab === "paste" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-ivory-500">
                    <span>Dán nội dung chuỗi JSON vào đây:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setPastedJson(`{
  "giap_ty": "https://example.com/images/giap_ty.jpg",
  "at_suu": "https://example.com/images/at_suu.jpg",
  "binh_dan": "https://example.com/images/binh_dan.jpg"
}`);
                      }}
                      className="text-gold-400 hover:underline"
                    >
                      Dán mẫu thử
                    </button>
                  </div>
                  <textarea
                    rows={8}
                    value={pastedJson}
                    onChange={(e) => setPastedJson(e.target.value)}
                    placeholder={`{\n  "giap_ty": "https://...",\n  "1": "https://...",\n  "Giáp Tý": "https://..."\n}`}
                    className="w-full p-3 text-xs font-mono bg-lacquer-900 border border-gold-800 focus:border-gold-400 rounded-sm text-ivory-100 outline-none transition-colors"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleParsePastedJson}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-lacquer-700 hover:bg-gold-800 text-gold-300 border border-gold-700 rounded-sm transition-all cursor-pointer shadow-sm active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                      <span>Phân Tích Cú Pháp JSON</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: TEMPLATE & GUIDE */}
              {jsonModalTab === "template" && (
                <div className="space-y-4 text-xs">
                  <div className="bg-lacquer-800 border border-gold-800 rounded-md p-4 space-y-3">
                    <div className="font-bold text-gold-400 flex items-center gap-1.5 text-sm">
                      <FileCode2 className="w-4 h-4" />
                      <span>4 ĐỊNH DẠNG JSON ĐƯỢC HỖ TRỢ TỰ ĐỘNG:</span>
                    </div>
                    <ul className="space-y-2 text-ivory-300 pl-4 list-disc">
                      <li>
                        <strong className="text-ivory-100">Dạng 1 (Khóa theo ID):</strong>{" "}
                        <code className="bg-lacquer-900 px-1 py-0.5 rounded text-gold-400">{`{"giap_ty": "url", "at_suu": "url"}`}</code>
                      </li>
                      <li>
                        <strong className="text-ivory-100">Dạng 2 (Khóa theo Số thứ tự 1-60):</strong>{" "}
                        <code className="bg-lacquer-900 px-1 py-0.5 rounded text-gold-400">{`{"1": "url", "2": "url", "60": "url"}`}</code>
                      </li>
                      <li>
                        <strong className="text-ivory-100">Dạng 3 (Khóa theo Tên Can Chi):</strong>{" "}
                        <code className="bg-lacquer-900 px-1 py-0.5 rounded text-gold-400">{`{"Giáp Tý": "url", "Ất Sửu": "url"}`}</code>
                      </li>
                      <li>
                        <strong className="text-ivory-100">Dạng 4 (Mảng đối tượng):</strong>{" "}
                        <code className="bg-lacquer-900 px-1 py-0.5 rounded text-gold-400">{`[{"id": "giap_ty", "imageUrl": "url"}]`}</code>
                      </li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={handleDownloadTemplate}
                      className="flex flex-col items-center justify-center p-3.5 bg-lacquer-700 hover:bg-gold-800 border border-gold-800 hover:border-gold-400 rounded-sm text-center transition-all cursor-pointer group"
                    >
                      <Download className="w-5 h-5 text-gold-400 mb-1.5 group-hover:scale-110 transition-transform" />
                      <span className="font-bold text-ivory-100">Tải Tệp Mẫu JSON</span>
                      <span className="text-[10px] text-ivory-500 mt-0.5">Mẫu 60 Hoa Giáp có sẵn ID & Tên</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopySampleJson}
                      className="flex flex-col items-center justify-center p-3.5 bg-lacquer-700 hover:bg-gold-800 border border-gold-800 hover:border-gold-400 rounded-sm text-center transition-all cursor-pointer group"
                    >
                      {copiedTemplate ? (
                        <Check className="w-5 h-5 text-[#4CAF50] mb-1.5" />
                      ) : (
                        <Copy className="w-5 h-5 text-gold-400 mb-1.5 group-hover:scale-110 transition-transform" />
                      )}
                      <span className="font-bold text-ivory-100">
                        {copiedTemplate ? "Đã Sao Chép!" : "Sao Chép Đoạn Mẫu"}
                      </span>
                      <span className="text-[10px] text-ivory-500 mt-0.5">Dán nhanh vào ô JSON</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleExportBackup}
                      className="flex flex-col items-center justify-center p-3.5 bg-lacquer-700 hover:bg-gold-800 border border-gold-800 hover:border-gold-400 rounded-sm text-center transition-all cursor-pointer group"
                    >
                      <Download className="w-5 h-5 text-gold-400 mb-1.5 group-hover:scale-110 transition-transform" />
                      <span className="font-bold text-ivory-100">Tải Sao Lưu Hiện Tại</span>
                      <span className="text-[10px] text-ivory-500 mt-0.5">Xuất {uploadedCount} ảnh đã lưu</span>
                    </button>
                  </div>
                </div>
              )}

              {/* PARSED DATA PREVIEW & CONFIRMATION */}
              {parsedJsonData && parsedJsonData.matched.length > 0 && (
                <div className="mt-4 border-t border-lacquer-700 pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-gold-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#4CAF50]" />
                      <span>
                        Nhận diện thành công {parsedJsonData.matched.length} / 60 Hoa Giáp
                      </span>
                    </div>
                    {parsedJsonData.unmatchedKeys.length > 0 && (
                      <span className="text-[10px] text-ivory-500">
                        ({parsedJsonData.unmatchedKeys.length} khóa không khớp)
                      </span>
                    )}
                  </div>

                  {/* Preview grid */}
                  <div className="max-h-48 overflow-y-auto bg-lacquer-900 border border-lacquer-700 rounded-sm p-2 divide-y divide-lacquer-700">
                    {parsedJsonData.matched.map((item) => (
                      <div key={item.id} className="py-1.5 px-2 flex items-center justify-between text-xs gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-gold-500 font-mono font-bold text-[11px] shrink-0">
                            #{item.order.toString().padStart(2, "0")}
                          </span>
                          <span className="font-semibold text-ivory-100 truncate">
                            {item.name}
                          </span>
                          <span className="text-[10px] text-ivory-500 font-mono hidden sm:inline">
                            ({item.id})
                          </span>
                        </div>
                        <div className="text-[11px] text-ivory-500 font-mono truncate max-w-[200px]">
                          {item.url.startsWith("data:") ? "[Tệp Base64 Image]" : item.url}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action to apply */}
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setParsedJsonData(null)}
                      className="px-3 py-2 text-xs text-ivory-500 hover:text-gold-200"
                    >
                      Bỏ qua
                    </button>
                    <button
                      type="button"
                      disabled={isImportingJson}
                      onClick={handleApplyJsonImport}
                      className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold bg-gold-500 hover:bg-gold-400 text-lacquer-900 rounded-sm transition-all cursor-pointer shadow-lg active:scale-95 disabled:opacity-50"
                    >
                      {isImportingJson ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Đang lưu vào bộ nhớ...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Lưu Ngay {parsedJsonData.matched.length} Ảnh Vào Hoa Giáp</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-lacquer-700 bg-lacquer-900 flex justify-end">
              <button
                type="button"
                onClick={() => setIsJsonModalOpen(false)}
                className="px-4 py-2 text-xs text-ivory-500 hover:text-gold-200 bg-lacquer-800 hover:bg-lacquer-700 rounded-sm font-medium transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Tra Cứu Quẻ Kinh Dịch Liên Kết Hoa Giáp */}
      {isHexLookupModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in"
          onClick={() => setIsHexLookupModalOpen(false)}
        >
          <div
            className="bg-lacquer-800 border-2 border-gold-800 rounded-md max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gold-800 bg-gradient-to-r from-lacquer-800 to-lacquer-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-lacquer-700 border border-gold-700 flex items-center justify-center text-gold-400">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg sm:text-xl text-ivory-100">
                    Tìm Quẻ Kinh Dịch Liên Kết 60 Hoa Giáp
                  </h3>
                  <p className="text-xs text-ivory-500">
                    Tra cứu nhanh phối tượng giữa 60 Quẻ Kinh Dịch và Lục Thập Hoa Giáp
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsHexLookupModalOpen(false)}
                className="text-ivory-500 hover:text-gold-200 p-1 rounded-sm hover:bg-lacquer-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search & Trigram Filters */}
            <div className="p-4 sm:p-5 border-b border-gold-800 bg-lacquer-900 space-y-3">
              {/* Search bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-ivory-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={hexLookupQuery}
                  onChange={(e) => setHexLookupQuery(e.target.value)}
                  placeholder="Tìm theo tên quẻ (Càn, Phục, Truân...), số quẻ (#1..#64), tên Hoa Giáp, nạp âm..."
                  className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-lacquer-800 border border-gold-800 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 rounded-sm text-ivory-100 placeholder-[#7E6E5C] outline-none transition-all"
                  autoFocus
                />
                {hexLookupQuery && (
                  <button
                    type="button"
                    onClick={() => setHexLookupQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ivory-500 hover:text-gold-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Trigram Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[11px] text-ivory-500 mr-1">Bát quái:</span>
                {[
                  { id: "all", label: "Tất cả (60)" },
                  { id: "Càn", label: "Càn (Trời)" },
                  { id: "Đoài", label: "Đoài (Đầm)" },
                  { id: "Ly", label: "Ly (Lửa)" },
                  { id: "Chấn", label: "Chấn (Sấm)" },
                  { id: "Tốn", label: "Tốn (Gió)" },
                  { id: "Khảm", label: "Khảm (Nước)" },
                  { id: "Cấn", label: "Cấn (Núi)" },
                  { id: "Khôn", label: "Khôn (Đất)" },
                ].map((tg) => (
                  <button
                    key={tg.id}
                    type="button"
                    onClick={() => setHexLookupTrigram(tg.id)}
                    className={`px-2.5 py-1 rounded-sm text-[11px] font-medium transition-colors cursor-pointer ${
                      hexLookupTrigram === tg.id
                        ? "bg-gold-500/15 text-gold-200 font-semibold ring-1 ring-inset ring-gold-500/70"
                        : "bg-lacquer-800 text-ivory-500 hover:text-gold-200 hover:bg-lacquer-700"
                    }`}
                  >
                    {tg.label}
                  </button>
                ))}
              </div>

              <div className="text-[11px] text-ivory-500 flex items-center justify-between">
                <span>
                  Tìm thấy <strong className="text-gold-400">{hexLookupList.length}</strong> quẻ đối ứng
                </span>
                {selectedHexagram !== "all" && (
                  <button
                    type="button"
                    onClick={() => setSelectedHexagram("all")}
                    className="text-gold-400 hover:underline"
                  >
                    Xóa bộ lọc quẻ ngoài trang chính
                  </button>
                )}
              </div>
            </div>

            {/* Results Grid */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1">
              {hexLookupList.length === 0 ? (
                <div className="py-12 text-center text-ivory-500 text-xs">
                  Không tìm thấy quẻ Kinh Dịch hoặc Hoa Giáp nào phù hợp với từ khóa &quot;{hexLookupQuery}&quot;.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {hexLookupList.map((item) => {
                    const hex = item.hexagramLink;
                    if (!hex) return null;
                    return (
                      <div
                        key={item.id}
                        className="bg-lacquer-800 hover:bg-lacquer-700 border border-gold-800 hover:border-gold-400 rounded-md p-3.5 transition-all flex flex-col justify-between group shadow-sm"
                      >
                        <div>
                          {/* Top row: Hexagram */}
                          <div className="flex items-start justify-between gap-2 pb-2 border-b border-gold-800">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl text-gold-400 font-serif leading-none" title={hex.symbol}>
                                {hex.symbol}
                              </span>
                              <div>
                                <div className="text-[10px] text-ivory-500 uppercase font-mono font-semibold">
                                  Quẻ #{hex.hexagramNumber}
                                </div>
                                <div className="font-serif font-bold text-sm text-ivory-100 flex items-center gap-1.5">
                                  <span>{hex.hexagramName}</span>
                                  <span className="text-xs font-normal text-ivory-500 font-serif">
                                    ({hex.hexagramHanzi})
                                  </span>
                                </div>
                              </div>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-lacquer-700 text-gold-500 font-medium border border-gold-800 shrink-0">
                              {hex.upperTrigram} / {hex.lowerTrigram}
                            </span>
                          </div>

                          {/* Middle: Linked Hoa Giáp */}
                          <div className="py-2.5 space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold text-gold-400 bg-lacquer-700 px-1.5 py-0.5 rounded font-mono">
                                #{item.order.toString().padStart(2, "0")}
                              </span>
                              <span className="font-bold text-xs text-ivory-100">
                                {item.name}
                              </span>
                              <span className="text-xs text-ivory-500 font-serif">
                                ({item.chinese})
                              </span>
                            </div>

                            <div className="text-[11px] text-ivory-500 flex items-center gap-2">
                              <span>Nạp Âm: <strong className="text-gold-400">{item.elementNapAm}</strong></span>
                              <span>•</span>
                              <span>{item.symbolicCreature}</span>
                            </div>

                            <p className="text-[11px] text-ivory-500 leading-relaxed line-clamp-2 mt-1.5">
                              {hex.natureMeaning}
                            </p>
                          </div>
                        </div>

                        {/* Card actions */}
                        <div className="pt-2.5 border-t border-lacquer-700 flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              handleSelectEntry(item.id);
                              setIsHexLookupModalOpen(false);
                            }}
                            className="flex-1 py-1.5 text-center text-[11px] font-bold bg-lacquer-700 hover:bg-gold-500 text-gold-400 hover:text-lacquer-900 border border-gold-800 hover:border-gold-500 rounded-sm transition-all cursor-pointer"
                          >
                            Xem Hoa Giáp
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (onSelectHexagram) {
                                setIsHexLookupModalOpen(false);
                                onSelectHexagram(hex.hexagramNumber);
                              } else {
                                setHexagramModalData(hex);
                              }
                            }}
                            className="px-2.5 py-1.5 text-[11px] text-gold-300 hover:text-lacquer-900 bg-lacquer-800 hover:bg-gold-500 border border-gold-800 hover:border-gold-500 rounded-sm transition-colors cursor-pointer flex items-center gap-1 font-medium shadow-sm active:scale-95"
                            title="Xem giải thích trong Sách Thuyết Minh Kinh Dịch"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Thuyết Minh</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-lacquer-700 bg-lacquer-900 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setViewMode("hexagrams");
                  setIsHexLookupModalOpen(false);
                }}
                className="text-xs text-gold-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Mở Toàn Bộ Bảng Đối Ứng 60 Hoa Giáp ↔ Kinh Dịch</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsHexLookupModalOpen(false)}
                className="px-4 py-2 text-xs text-ivory-500 hover:text-gold-200 bg-lacquer-800 hover:bg-lacquer-700 rounded-sm font-medium transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
