import React, { useState, useEffect, useMemo } from "react";
import { Hexagram } from "../types";
import {
  NGU_CHE_DICE_ITEMS,
  NGU_CHE_DAY_STEMS,
  LUC_THAN_VI_MAP,
  CUNG_HAN_VI_MAP,
  NGU_HANH_VI_MAP,
  translateCanChiNguHanh,
  stripNguHanhFromCanChiHan,
  NguCheHexagramData,
  NguCheSection,
  NguCheIntroData,
  loadNguCheHexagram,
  loadNguCheIntro,
  updateNguCheHexCache,
} from "../data/nguCheTinhTuyData";
import {
  getJulianDay,
  getDayCanChi,
  convertSolarToLunar,
} from "../utils/lunarCalendar";
import { zenAudio } from "../utils/zenAudio";

const playCardClick = () => zenAudio.playCardFlipSound();
const playSuccessChime = () => zenAudio.playCardDrawChime();
import {
  Dices,
  Sparkles,
  Calendar,
  BookOpen,
  ScrollText,
  Compass,
  ZoomIn,
  X,
  RefreshCw,
  Crown,
  CheckCircle2,
  Layers,
  Eye,
  Flame,
  Info,
  Copy,
  Check,
  FileText,
  ChevronLeft,
  ChevronRight,
  Palette,
  Maximize2,
} from "lucide-react";

// Helper làm nổi bật và định dạng Họa Cảnh Cố Cung rõ ràng, thanh thoát
const renderFormattedHoaCanh = (text: string) => {
  if (!text) return null;
  // Tách các đoạn chữ Hán trong dấu «...» hoặc [...]
  const parts = text.split(/(«[^»]+»|\[[^\]]+\])/g);
  return (
    <>
      {parts.map((p, idx) => {
        if (p.startsWith("«") && p.endsWith("»")) {
          return (
            <span
              key={idx}
              className="inline-block mx-1 px-2 py-0.5 rounded-lg bg-[#2B170E] border border-[#E5C168]/70 text-[#FFF2C2] font-serif font-bold text-xs sm:text-[13px] tracking-wide shadow-sm"
            >
              {p}
            </span>
          );
        }
        if (p.startsWith("[") && p.endsWith("]")) {
          return (
            <span key={idx} className="font-semibold text-[#F3D787]">
              {p}
            </span>
          );
        }
        return <span key={idx}>{p}</span>;
      })}
    </>
  );
};

interface NguCheTinhTuySectionProps {
  drawnCards: Hexagram[];
  changedCards?: (Hexagram | null)[];
  movingLinesPerCard?: number[][];
  initialDiceValue?: number | null;
  question?: string;
  category?: string;
  onShowToast?: (msg: string) => void;
}

export const NguCheTinhTuySection: React.FC<NguCheTinhTuySectionProps> = ({
  drawnCards,
  initialDiceValue = null,
  question = "",
  category = "",
  onShowToast,
}) => {
  // Mặc định lấy lá cuối cùng (lá thứ 3 - Nhân) làm Quẻ Chủ theo đúng phép Ngự Chế Tam Tài
  const defaultCardIdx = drawnCards.length >= 3 ? 2 : Math.max(0, drawnCards.length - 1);
  const [selectedCardIdx, setSelectedCardIdx] = useState<number>(defaultCardIdx);

  useEffect(() => {
    setSelectedCardIdx(drawnCards.length >= 3 ? 2 : Math.max(0, drawnCards.length - 1));
  }, [drawnCards]);

  const activeHexagram = drawnCards[selectedCardIdx] || drawnCards[drawnCards.length - 1] || drawnCards[0];

  // State dữ liệu JSON của quẻ đang chọn
  const [hexData, setHexData] = useState<NguCheHexagramData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State Xí ngầu 12 mặt (1..12)
  const [diceValue, setDiceValue] = useState<number | null>(initialDiceValue);
  const [rollingDisplay, setRollingDisplay] = useState<number>(initialDiceValue || 9);
  const [isRolling, setIsRolling] = useState<boolean>(false);

  // State Ngày xem quẻ (mặc định là hôm nay)
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });

  // Cho phép người dùng bấm chọn nhanh 1 trong 10 Thiên Can ngày (Giáp..Quý) hoặc tự động theo ngày
  const [manualCanIdx, setManualCanIdx] = useState<number | null>(null);

  // Chế độ hiển thị: 'modern' (Thẻ hiện đại rõ chữ + tranh lớn) | 'palace' (Trang đôi Cổ Bản Cố Cung chữ dọc) | 'gallery' (Bảo tàng duyệt 22 họa cảnh Cố Cung)
  const [displayStyle, setDisplayStyle] = useState<"modern" | "palace" | "gallery">("modern");

  // Bộ lọc cho Bảo tàng 22 Họa Cảnh: 'all' | 'que' | 'ngay'
  const [galleryFilter, setGalleryFilter] = useState<"all" | "que" | "ngay">("all");
  const [selectedGalleryMucIdx, setSelectedGalleryMucIdx] = useState<number>(3);

  // Tab phụ lục bên dưới: 'nap_giap' | 'phong_thuy' | 'su_vu_1' | 'su_vu_2'
  const [extraTab, setExtraTab] = useState<"nap_giap" | "phong_thuy" | "su_vu_1" | "su_vu_2">("nap_giap");

  // Modal phóng to tranh Cố Cung
  const [lightboxImg, setLightboxImg] = useState<{
    src: string;
    title: string;
    subtitle: string;
    moTa: string;
    poem?: string;
    mucIdx?: number;
  } | null>(null);

  // Modal Lời Tựa Ngự Chế & Văn Khấn (Chúc Hương Văn)
  const [showIntroModal, setShowIntroModal] = useState<boolean>(false);
  const [introData, setIntroData] = useState<NguCheIntroData | null>(null);
  const [introLoading, setIntroLoading] = useState<boolean>(false);
  const [activeIntroPageIdx, setActiveIntroPageIdx] = useState<number>(0);

  // State phục chế & AI vẽ lại tranh lụa Công Bút HD
  const [redrawingMucIdx, setRedrawingMucIdx] = useState<number | null>(null);
  const [isBatchRedrawing, setIsBatchRedrawing] = useState<boolean>(false);

  const handleRedrawPainting = async (section: NguCheSection, poem?: string) => {
    if (!hexData || redrawingMucIdx !== null || isBatchRedrawing) return;
    playCardClick();
    const targetHexNum = hexData.hexNumber || activeHexagram?.number || 1;
    setRedrawingMucIdx(section.mucIdx);
    try {
      const resp = await fetch("/api/ngu-che/redraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hexNumber: targetHexNum,
          mucIdx: section.mucIdx,
          title: section.title,
          moTaTranh: section.moTaTranh,
          poem: poem || "",
        }),
      });
      const data = await resp.json();
      if (data.success && data.painting) {
        setHexData((prev) => {
          if (!prev) return prev;
          const updated: NguCheHexagramData = {
            ...prev,
            sections: {
              ...prev.sections,
              [section.mucIdx]: {
                ...prev.sections[section.mucIdx],
                painting: data.painting,
              },
            },
          };
          updateNguCheHexCache(targetHexNum, updated);
          return updated;
        });
        setLightboxImg((prev) =>
          prev && prev.mucIdx === section.mucIdx
            ? { ...prev, src: data.painting }
            : prev
        );
        playSuccessChime();
        onShowToast?.(data.message || "Đã phục chế rõ nét Công Bút HD cho đúng bức họa cảnh gốc!");
      } else {
        onShowToast?.(data.message || "Không thể phục chế họa cảnh lúc này.");
      }
    } catch {
      onShowToast?.("Lỗi kết nối máy chủ khi phục chế tranh Công Bút HD.");
    } finally {
      setRedrawingMucIdx(null);
    }
  };

  const handleBatchRedrawHexagram = async () => {
    if (!hexData || isBatchRedrawing || redrawingMucIdx !== null) return;
    playCardClick();
    const targetHexNum = hexData.hexNumber || activeHexagram?.number || 1;
    setIsBatchRedrawing(true);
    onShowToast?.(`Đang phục chế rõ nét Công Bút HD cho toàn bộ 22 tranh Quẻ #${targetHexNum} (${hexData.quyen.tenQue})...`);
    try {
      const resp = await fetch("/api/ngu-che/redraw-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hexNumber: targetHexNum }),
      });
      const data = await resp.json();
      if (data.success && data.paintings) {
        setHexData((prev) => {
          if (!prev) return prev;
          const nextSections = { ...prev.sections };
          for (const [k, uri] of Object.entries<string>(data.paintings)) {
            const numK = Number(k);
            if (nextSections[numK]) {
              nextSections[numK] = { ...nextSections[numK], painting: uri };
            }
          }
          const updated: NguCheHexagramData = { ...prev, sections: nextSections };
          updateNguCheHexCache(targetHexNum, updated);
          return updated;
        });
        playSuccessChime();
        onShowToast?.(
          data.message || `Đã hoàn tất phục chế 22 bức họa cảnh Công Bút HD của Quẻ #${targetHexNum} (${hexData.quyen.tenQue})!`
        );
      } else {
        onShowToast?.(data.message || "Lỗi khi phục chế 22 họa cảnh.");
      }
    } catch {
      onShowToast?.("Lỗi kết nối máy chủ khi phục chế 22 họa cảnh.");
    } finally {
      setIsBatchRedrawing(false);
    }
  };

  // Load dữ liệu Ngự Chế khi đổi quẻ
  useEffect(() => {
    if (!activeHexagram) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    loadNguCheHexagram(activeHexagram.number)
      .then((data) => {
        if (!cancelled) {
          setHexData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Lỗi tải dữ liệu Ngự Chế");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeHexagram?.number]);

  // Tính Can Chi của ngày đang chọn
  const dateInfo = useMemo(() => {
    const parts = selectedDateStr.split("-").map(Number);
    const now = new Date();
    const yy = parts[0] || now.getFullYear();
    const mm = parts[1] || now.getMonth() + 1;
    const dd = parts[2] || now.getDate();

    const jdn = getJulianDay(yy, mm, dd);
    const dayCC = getDayCanChi(jdn);
    const lunar = convertSolarToLunar(dd, mm, yy);

    return {
      yy,
      mm,
      dd,
      jdn,
      dayCC,
      lunar,
    };
  }, [selectedDateStr]);

  const activeCanIdx = manualCanIdx !== null ? manualCanIdx : dateInfo.dayCC.canIdx;
  const activeDayStem = NGU_CHE_DAY_STEMS[activeCanIdx] || NGU_CHE_DAY_STEMS[0];

  // Xử lý lắc xí ngầu 12 mặt
  const handleRollDice = () => {
    if (isRolling) return;
    playCardClick();
    setIsRolling(true);

    let ticks = 0;
    const maxTicks = 18;
    const interval = setInterval(() => {
      ticks++;
      const tempRand = Math.floor(Math.random() * 12) + 1;
      setRollingDisplay(tempRand);

      if (ticks >= maxTicks) {
        clearInterval(interval);
        const finalResult = Math.floor(Math.random() * 12) + 1;
        setRollingDisplay(finalResult);
        setDiceValue(finalResult);
        setIsRolling(false);
        playSuccessChime();
      }
    }, 65);
  };

  const handleSelectDiceFace = (num: number) => {
    if (isRolling) return;
    playCardClick();
    setRollingDisplay(num);
    setDiceValue(num);
  };

  const handleOpenIntro = async () => {
    playCardClick();
    setShowIntroModal(true);
    if (!introData && !introLoading) {
      setIntroLoading(true);
      try {
        const res = await loadNguCheIntro();
        setIntroData(res);
      } catch {
        // ignore
      } finally {
        setIntroLoading(false);
      }
    }
  };

  // Lấy thông tin mặt xí ngầu đang chọn
  const currentDiceItem = useMemo(() => {
    const targetNum = diceValue || rollingDisplay;
    return NGU_CHE_DICE_ITEMS.find((item) => item.diceNumber === targetNum) || NGU_CHE_DICE_ITEMS[0];
  }, [diceValue, rollingDisplay]);

  // Section của kết quả Xí ngầu 12 mặt (mucIdx 3..14)
  const diceSection: NguCheSection | null = useMemo(() => {
    if (!hexData || !diceValue) return null;
    const item = NGU_CHE_DICE_ITEMS.find((d) => d.diceNumber === diceValue);
    if (!item) return null;
    return hexData.sections[item.mucIdx] || null;
  }, [hexData, diceValue]);

  // Section của Ngày đó của Quẻ đó (mucIdx 15..24)
  const daySection: NguCheSection | null = useMemo(() => {
    if (!hexData) return null;
    return hexData.sections[activeDayStem.mucIdx] || null;
  }, [hexData, activeDayStem]);

  // Section Tổng quan Quẻ tượng · Nạp giáp · Thi đoán · Chiết tự (mucIdx = 2)
  const overviewSection: NguCheSection | null = useMemo(() => {
    if (!hexData) return null;
    return hexData.sections[2] || null;
  }, [hexData]);

  // Toàn bộ 22 Họa Cảnh Cố Cung của quẻ (12 mục của quẻ + 10 mục của ngày can)
  const allHoaCanhItems = useMemo(() => {
    if (!hexData) return [];
    const items: Array<{
      mucIdx: number;
      category: "que" | "ngay";
      categoryLabel: string;
      badgeColor: string;
      titleVi: string;
      titleHan: string;
      shortLabel: string;
      section: NguCheSection;
      pageNum: number;
      diceNumber?: number;
      canIdx?: number;
    }> = [];

    // 12 mục của Quẻ: Thoán (3), Tượng (4), Hào 1..6 (5..10), Toàn động (11), Toàn tĩnh (12), Thế động (13), Ứng động (14)
    for (const dice of NGU_CHE_DICE_ITEMS) {
      const sec = hexData.sections[dice.mucIdx];
      if (sec) {
        items.push({
          mucIdx: dice.mucIdx,
          category: "que",
          categoryLabel: "Họa Cảnh Quẻ",
          badgeColor: dice.badgeColor,
          titleVi: dice.titleVi,
          titleHan: dice.titleHan,
          shortLabel: dice.shortLabel,
          section: sec,
          pageNum: sec.pageNum,
          diceNumber: dice.diceNumber,
        });
      }
    }

    // 10 mục của Ngày Can: Giáp (15) .. Quý (24)
    for (const stem of NGU_CHE_DAY_STEMS) {
      const sec = hexData.sections[stem.mucIdx];
      if (sec) {
        items.push({
          mucIdx: stem.mucIdx,
          category: "ngay",
          categoryLabel: `Ngày ${stem.canVi}`,
          badgeColor: "from-rose-700 to-red-800 text-rose-100 border-rose-400/60",
          titleVi: stem.titleVi,
          titleHan: stem.titleHan,
          shortLabel: `Ngày ${stem.canVi} (${stem.canHan})`,
          section: sec,
          pageNum: sec.pageNum,
          canIdx: stem.canIdx,
        });
      }
    }

    return items;
  }, [hexData]);

  // Họa cảnh đang chọn xem tiêu điểm trong Bảo tàng 22 Họa Cảnh
  const selectedGalleryItem = useMemo(() => {
    if (!allHoaCanhItems.length) return null;
    return allHoaCanhItems.find((it) => it.mucIdx === selectedGalleryMucIdx) || allHoaCanhItems[0];
  }, [allHoaCanhItems, selectedGalleryMucIdx]);

  // Tách 1 đoạn thơ gộp (nếu có nhiều câu cách nhau bởi dấu câu hoặc xuống dòng) thành từng câu thơ riêng
  const splitPoemSegment = (sg: { han?: string; hv?: string; vi?: string }) => {
    const han = (sg.han || "").replace(/^詩\s*[曰日][：:\s]*/, "").trim();
    const hv = (sg.hv || "").replace(/^(Thi\s*viết|Thơ\s*rằng)[：:\s]*/i, "").trim();
    const vi = (sg.vi || "").replace(/^(Thơ\s*(đoán\s*)?rằng|Thi\s*viết)[：:\s]*/i, "").trim();

    const hanClauses = han
      .split(/(?<=[，。；！？、\n])\s*|\n+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (hanClauses.length >= 2) {
      const hvClauses = hv
        .split(/(?<=[,.;!?\n])\s*|\n+/)
        .map((s) => s.trim())
        .filter(Boolean);
      const viClauses = vi
        .split(/(?<=[.;!?\n])\s*|\n+/)
        .map((s) => s.trim())
        .filter(Boolean);

      return hanClauses.map((hc, i) => ({
        han: hc,
        hv: hvClauses.length === hanClauses.length ? hvClauses[i] : i === 0 ? hv : "",
        vi: viClauses.length === hanClauses.length ? viClauses[i] : i === 0 ? vi : "",
      }));
    }

    return [{ han, hv, vi }];
  };

  // Làm sạch Ngũ hành thừa sau Can Chi trong tiêu đề Hào (ví dụ: 初爻甲子水 -> 初爻甲子, Giáp Tý Thủy -> Giáp Tý)
  const stripNguHanhInText = (text?: string) => {
    if (!text) return "";
    return text
      .replace(/([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])[金木水火土]/g, "$1")
      .replace(
        /\b(Giáp|Ất|Bính|Đinh|Mậu|Kỷ|Canh|Tân|Nhâm|Quý)\s+(Tý|Sửu|Dần|Mão|Thìn|Tỵ|Tị|Ngọ|Mùi|Thân|Dậu|Tuất|Hợi)\s+(Kim|Mộc|Thủy|Hỏa|Thổ)\b/gi,
        "$1 $2"
      )
      .trim();
  };

  // Trích xuất bài thơ và chú giải từ một section 'tho-tranh'
  const extractPoemAndContent = (sec: NguCheSection | null) => {
    if (!sec) return { headerSeg: null, poemSegs: [], dichTho: "", blockNotes: [], pageNotes: [] };
    const chuBlock = sec.blocks.find((b) => b.loai === "chu") || sec.blocks[0];
    const doan = chuBlock?.doan || [];
    const isShiYueStandalone = (han?: string) => /^詩\s*[曰日][：:\s]*$/.test((han || "").trim());

    const syIdx = doan.findIndex((sg) => isShiYueStandalone(sg.han));
    const headerItems = syIdx > 0 ? doan.slice(0, syIdx) : doan.slice(0, 1);
    const rawPoemItems = syIdx >= 0 ? doan.slice(syIdx + 1) : doan.slice(1);

    const headerSeg =
      headerItems.length > 0
        ? {
            han: stripNguHanhInText(headerItems.map((x) => x.han || "").filter(Boolean).join(" ")),
            hv: stripNguHanhInText(headerItems.map((x) => x.hv || "").filter(Boolean).join(" · ")),
            vi: stripNguHanhInText(headerItems.map((x) => x.vi || "").filter(Boolean).join(" — ")),
          }
        : null;

    const poemSegs = rawPoemItems
      .filter((sg) => !isShiYueStandalone(sg.han))
      .flatMap(splitPoemSegment)
      .filter((sg) => sg.han);

    return {
      headerSeg,
      poemSegs,
      dichTho: chuBlock?.dichTho || "",
      blockNotes: chuBlock?.ghiChu || [],
      pageNotes: sec.notes || [],
    };
  };

  // Điều hướng phím mũi tên Trái / Phải trong Modal Phóng To Họa Cảnh
  useEffect(() => {
    if (!lightboxImg || !allHoaCanhItems.length) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxImg(null);
      } else if (e.key === "ArrowLeft") {
        const curIdx = allHoaCanhItems.findIndex((it) => it.mucIdx === lightboxImg.mucIdx);
        if (curIdx > 0) {
          const prev = allHoaCanhItems[curIdx - 1];
          const parsed = extractPoemAndContent(prev.section);
          setLightboxImg({
            src: prev.section.painting,
            title: prev.section.title,
            subtitle: `${hexData?.quyen.tenQue} • ${prev.titleVi} (${prev.titleHan})`,
            moTa: prev.section.moTaTranh,
            poem: parsed.dichTho,
            mucIdx: prev.mucIdx,
          });
        }
      } else if (e.key === "ArrowRight") {
        const curIdx = allHoaCanhItems.findIndex((it) => it.mucIdx === lightboxImg.mucIdx);
        if (curIdx >= 0 && curIdx < allHoaCanhItems.length - 1) {
          const next = allHoaCanhItems[curIdx + 1];
          const parsed = extractPoemAndContent(next.section);
          setLightboxImg({
            src: next.section.painting,
            title: next.section.title,
            subtitle: `${hexData?.quyen.tenQue} • ${next.titleVi} (${next.titleHan})`,
            moTa: next.section.moTaTranh,
            poem: parsed.dichTho,
            mucIdx: next.mucIdx,
          });
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxImg, allHoaCanhItems, hexData]);

  // Renderer cho Khối Họa Cảnh Hoàng Cung Cố Cung sắc nét, sang trọng
  const renderHoaCanhCard = (
    section: NguCheSection,
    title: string = "Họa Cảnh Cố Cung Chi Tiết",
    subtitle: string = "TƯỢNG HÌNH BẢN GỐC TRIỀU MINH (1482)",
    onViewFullscreen?: () => void
  ) => {
    if (!section.moTaTranh) return null;
    return (
      <div className="relative rounded-2xl bg-gradient-to-br from-[#1C100B] via-[#140B07] to-[#0D0704] border-2 border-[#C9A55A]/70 p-4 sm:p-5 shadow-[0_10px_30px_rgba(0,0,0,0.6)] space-y-3 overflow-hidden group">
        {/* 4 Góc Thếp Vàng Hoàng Gia */}
        <div className="absolute top-1.5 left-1.5 w-3.5 h-3.5 border-t-2 border-l-2 border-[#E5C168] pointer-events-none" />
        <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 border-t-2 border-r-2 border-[#E5C168] pointer-events-none" />
        <div className="absolute bottom-1.5 left-1.5 w-3.5 h-3.5 border-b-2 border-l-2 border-[#E5C168] pointer-events-none" />
        <div className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 border-b-2 border-r-2 border-[#E5C168] pointer-events-none" />

        {/* Header Họa Cảnh */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#3D2517]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#E5C168] to-[#996515] text-black flex items-center justify-center font-bold text-base shadow">
              🖼️
            </div>
            <div>
              <div className="text-[10px] font-serif uppercase tracking-widest text-[#E5C168] font-bold">
                {subtitle}
              </div>
              <h5 className="text-sm sm:text-base font-serif font-black text-[#FCE6B4] tracking-wide">
                {title}
              </h5>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-[#2A160C] border border-[#8C5E28] text-[11px] font-serif font-semibold text-[#F3D787]">
              Trang {section.pageNum}/1734
            </span>
            {onViewFullscreen && (
              <button
                type="button"
                onClick={onViewFullscreen}
                className="px-2.5 py-1 rounded-lg bg-[#2A170F] hover:bg-[#3D2216] border border-[#C9A55A]/50 text-[#FCE6B4] text-[11px] font-serif flex items-center gap-1 cursor-pointer transition-colors"
              >
                <ZoomIn className="w-3.5 h-3.5 text-[#E5C168]" />
                <span>Phóng to</span>
              </button>
            )}
          </div>
        </div>

        {/* Nội Dung Miêu Tả Họa Cảnh */}
        <div className="text-sm sm:text-[15px] font-serif text-[#F2E7D3] leading-relaxed tracking-wide space-y-2">
          {renderFormattedHoaCanh(section.moTaTranh)}
        </div>

        {/* Footer chú dẫn xuất xứ */}
        <div className="pt-2 border-t border-[#2E1A0F] flex items-center justify-between text-[11px] font-serif text-[#B8A58E]">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#E5C168]" />
            <span>Ngự Chế Tân Tập Đoán Dịch Tinh Túy • Bảo Tàng Cố Cung Đài Bắc</span>
          </span>
          <span className="text-[#A8947B]">Tranh lụa màu khoáng triều Minh</span>
        </div>
      </div>
    );
  };

  // Renderer cho Khung Tranh Hoàng Cung Triều Minh khổ lớn sắc nét
  const renderPalacePaintingFrame = (
    section: NguCheSection,
    subtitle: string,
    dichTho?: string,
    onOpenLightbox?: () => void
  ) => {
    if (!section.painting) {
      return (
        <div className="p-6 rounded-2xl bg-[#1A0E08] border border-[#5C3D22] text-center font-serif text-sm text-[#D4C3AA]">
          {section.moTaTranh}
        </div>
      );
    }

    const triggerZoom =
      onOpenLightbox ||
      (() => {
        setLightboxImg({
          src: section.painting,
          title: section.title,
          subtitle,
          moTa: section.moTaTranh,
          poem: dichTho,
          mucIdx: section.mucIdx,
        });
      });

    return (
      <div className="relative rounded-2xl overflow-hidden border-2 border-[#C9A55A]/80 bg-[#120805] shadow-[0_12px_36px_rgba(0,0,0,0.85)] group">
        {/* 4 Góc Thếp Vàng */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#E5C168] pointer-events-none z-10" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#E5C168] pointer-events-none z-10" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#E5C168] pointer-events-none z-10" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#E5C168] pointer-events-none z-10" />

        {/* Ảnh Tranh Cố Cung */}
        <div
          className="relative p-3 sm:p-4 bg-gradient-to-b from-[#1C100B] via-[#120805] to-[#0A0503] flex items-center justify-center cursor-zoom-in"
          onClick={triggerZoom}
        >
          <img
            src={section.painting}
            alt={section.title}
            className="w-full max-h-[460px] sm:max-h-[520px] object-contain mx-auto rounded-lg transition-all duration-300 contrast-[1.06] saturate-[1.04] group-hover:scale-[1.02] shadow-2xl"
            style={{ imageRendering: "-webkit-optimize-contrast" }}
          />
          {redrawingMucIdx === section.mucIdx && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2 z-20">
              <RefreshCw className="w-8 h-8 text-[#E5C168] animate-spin" />
              <span className="text-xs sm:text-sm font-serif font-bold text-[#FCE6B4]">
                Đang họa lại nét Công Bút HD...
              </span>
            </div>
          )}
        </div>

        {/* Thanh Điều Khiển & Phóng To Ở Chân Tranh */}
        <div className="p-2.5 sm:p-3 bg-gradient-to-t from-black/95 via-black/85 to-[#160B07] border-t border-[#4A2E1B] flex flex-wrap items-center justify-between gap-2 text-xs font-serif">
          <span className="text-[#E5C168] font-bold text-xs truncate pr-2 flex items-center gap-1.5">
            <span>📜</span>
            <span className="truncate">{section.title}</span>
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              disabled={redrawingMucIdx !== null || isBatchRedrawing}
              onClick={() => handleRedrawPainting(section, dichTho)}
              title="Tái tạo nét bút mực & màu khoáng Công Bút Cố Cung HD"
              className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-[#8B1E14] to-[#B3281B] hover:brightness-110 border border-[#E5C168]/60 text-[#FCE6B4] font-bold text-[11px] flex items-center gap-1 shrink-0 shadow cursor-pointer active:scale-95 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-3 h-3 text-[#F3D787]" />
              <span>{redrawingMucIdx === section.mucIdx ? "Đang vẽ..." : "Vẽ Lại Công Bút HD"}</span>
            </button>
            <button
              type="button"
              onClick={triggerZoom}
              className="px-3 py-1 rounded-xl bg-gradient-to-r from-[#C9A55A] via-[#E5C168] to-[#A67C2E] hover:brightness-110 text-black font-extrabold text-[11px] flex items-center gap-1.5 shrink-0 shadow-lg cursor-pointer active:scale-95 transition-all"
            >
              <ZoomIn className="w-3.5 h-3.5" />
              <span>Phóng To</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Trích xuất thông tin trang Quẻ tượng (mucIdx = 2) — hỗ trợ cả cấu trúc 2 block và 3 block
  const overviewParsed = useMemo(() => {
    if (!overviewSection) return null;
    const blocks = overviewSection.blocks || [];

    const rightBlocks = blocks.filter((b) => /phải/i.test(b.viTri || ""));
    const leftBlocks = blocks.filter((b) => /trái|chiết/i.test(b.viTri || ""));

    const effectiveRight = rightBlocks.length > 0 ? rightBlocks : blocks.slice(0, -1);
    const effectiveLeft = leftBlocks.length > 0 ? leftBlocks : blocks.slice(-1);

    const isShiYueStandalone = (han?: string) => /^詩\s*[曰日][：:\s]*$/.test((han || "").trim());
    const hasShiYueInline = (han?: string) => /^詩\s*[曰日][：:\s]*\S+/.test((han || "").trim());
    const isRedundantHaoLine = (han?: string) => {
      const h = (han || "").trim();
      if (!h) return true;
      if (/^六爻納甲/.test(h)) return true;
      if (/^(上|初|[二三四五六]|[初二三四五上][九六]|[九六][初二三四五上])(爻|九|六)?[：:\s―\-]/.test(h)) {
        return true;
      }
      if (h.includes("\n") && /[初二三四五上][九六爻]/.test(h)) return true;
      return false;
    };

    let rawInfoDoan: { han?: string; hv?: string; vi?: string }[] = [];
    let rawPoem: { han?: string; hv?: string; vi?: string }[] = [];
    let dichTho = "";

    if (effectiveRight.length >= 2) {
      rawInfoDoan = effectiveRight[0]?.doan || [];
      rawPoem = (effectiveRight[1]?.doan || []).filter((sg) => !isShiYueStandalone(sg.han));
      dichTho = effectiveRight[1]?.dichTho || effectiveRight[0]?.dichTho || "";
    } else if (effectiveRight.length === 1) {
      const allRight = effectiveRight[0]?.doan || [];
      const shiyueIdx = allRight.findIndex(
        (sg) => isShiYueStandalone(sg.han) || hasShiYueInline(sg.han)
      );
      if (shiyueIdx >= 0) {
        rawInfoDoan = allRight.slice(0, shiyueIdx);
        rawPoem = isShiYueStandalone(allRight[shiyueIdx].han)
          ? allRight.slice(shiyueIdx + 1)
          : allRight.slice(shiyueIdx);
      } else if (allRight.length >= 8) {
        rawInfoDoan = allRight.slice(0, allRight.length - 8);
        rawPoem = allRight.slice(-8);
      } else {
        rawInfoDoan = [];
        rawPoem = allRight;
      }
      dichTho = effectiveRight[0]?.dichTho || "";
    }

    const infoDoan = rawInfoDoan
      .filter((sg) => !isRedundantHaoLine(sg.han))
      .map((sg) => ({
        han: stripNguHanhInText((sg.han || "").split(/。?\s*六爻納甲/)[0]),
        hv: stripNguHanhInText(sg.hv),
        vi: stripNguHanhInText(sg.vi),
      }));

    const poemSegs = rawPoem.flatMap(splitPoemSegment).filter((sg) => sg.han);

    const chietSegs = effectiveLeft
      .flatMap((b) => b.doan || [])
      .filter((sg) => (sg.han || "").trim() !== "拆字");

    return {
      infoDoan,
      poemSegs,
      dichTho,
      chietSegs,
      notes: overviewSection.notes || [],
    };
  }, [overviewSection]);

  // Kiểm tra hào nào đang kích hoạt bởi Xí ngầu 12 mặt để highlight trên đồ hình 6 hào
  const isHaoHighlightedByDice = (haoNum: number, isThe: boolean, isUng: boolean): boolean => {
    if (!diceValue) return false;
    if (diceValue >= 1 && diceValue <= 6) return diceValue === haoNum;
    if (diceValue >= 7 && diceValue <= 12) return diceValue - 6 === haoNum;
    return false;
  };

  // Từ hào 7 trở đi (7..12) sẽ có 1 chấm đỏ chỗ hào 1..6 tương ứng (7 -> hào 1, 8 -> hào 2, ..., 12 -> hào 6)
  const isHaoRedDotByDice = (haoNum: number): boolean => {
    if (!diceValue || diceValue < 7) return false;
    return diceValue - 6 === haoNum;
  };

  const PILLAR_INFO = [
    { idx: 0, title: "THIÊN THỜI", sub: "Lá Thứ 1 • Khởi Cơ", badge: "Thiên" },
    { idx: 1, title: "ĐỊA LỢI", sub: "Lá Thứ 2 • Trung Gian", badge: "Địa" },
    { idx: 2, title: "NHÂN HÒA (QUẺ CHỦ)", sub: "Lá Cuối Cùng • Lấy Làm Quẻ Đoán", badge: "Nhân • Quẻ Chủ" },
  ];

  // State cho ô Copy nội dung quẻ gửi AI phân tích
  const [copiedAi, setCopiedAi] = useState<boolean>(false);
  const [showAiCopyBox, setShowAiCopyBox] = useState<boolean>(false);

  // Tổng hợp toàn bộ nội dung Quẻ Ngự Chế Tinh Túy thành văn bản chuẩn để copy cho AI phân tích
  const aiCopyText = useMemo(() => {
    if (!activeHexagram) return "";
    const lines: string[] = [];
    lines.push("=================================================================");
    lines.push("📜 DỮ LIỆU QUẺ DỊCH: NGỰ CHẾ TÂN TẬP ĐOÁN DỊCH TINH TÚY (1482)");
    lines.push("   (Dùng để cung cấp ngữ cảnh đầy đủ cho AI phân tích & luận giải)");
    lines.push("=================================================================");
    lines.push("");

    // 1. Câu hỏi & Thời gian
    lines.push("I. THÔNG TIN CÂU HỎI & THỜI GIAN BỐC QUẺ:");
    lines.push(`- Câu hỏi / Việc cần xem: ${question && question.trim() ? question.trim() : "(Chưa nhập câu hỏi cụ thể — Nhờ AI luận giải tổng quan và gợi ý theo từng phương diện)"}`);
    if (category) {
      lines.push(`- Lĩnh vực: ${category}`);
    }
    lines.push(
      `- Ngày xem (Dương lịch): ${String(dateInfo.dd).padStart(2, "0")}/${String(dateInfo.mm).padStart(2, "0")}/${dateInfo.yy}`
    );
    lines.push(
      `- Ngày Âm lịch: Ngày ${dateInfo.lunar.day}/${dateInfo.lunar.month}/${dateInfo.lunar.year}${dateInfo.lunar.isLeap ? " (Nhuận)" : ""}`
    );
    lines.push(`- Nhật thần (Can Chi ngày): Ngày ${dateInfo.dayCC.fullName} (Thiên Can: ${dateInfo.dayCC.can} — Địa Chi: ${dateInfo.dayCC.chi})`);
    lines.push(
      `- Thiên Can đang dùng tra Ca Đoán Ngày: Ngày ${activeDayStem.canVi} (${activeDayStem.canHan}日)${manualCanIdx !== null ? " [Chọn thủ công]" : " [Theo lịch ngày xem]"}`
    );
    lines.push("");

    // 2. Thông tin Quẻ Chủ & Lục Hào Nạp Giáp
    lines.push("II. BẢN QUẺ ĐANG TRA CỨU & LỤC HÀO NẠP GIÁP:");
    lines.push(
      `- Quẻ tra cứu: Quyển ${hexData?.quyenSo || activeHexagram.number}/64 — ${hexData?.quyen.tenQue || activeHexagram.name} (${hexData?.quyen.chuHan || activeHexagram.hanzi || ""})`
    );
    if (hexData) {
      const cungVi = CUNG_HAN_VI_MAP[hexData.quyen.cungHan] || hexData.quyen.cungTen;
      const nguHanhVi = NGU_HANH_VI_MAP[hexData.cungElem] || hexData.cungElem;
      lines.push(
        `- Cung Bát Thuần: Cung ${cungVi} (${hexData.quyen.cungHan}) — Thứ tự trong cung: ${hexData.quyen.theQuai} (${hexData.quyen.thuTuHan}) | Ngũ hành cung: ${nguHanhVi} (${hexData.cungElem})`
      );
      lines.push(
        `- Quẻ tượng: ${hexData.quyen.quaiTuong} (Thượng ${activeHexagram.upperTrigram} — Hạ ${activeHexagram.lowerTrigram})`
      );
      lines.push(`- Vị trí Thế / Ứng: Thế tại Hào ${hexData.theHao} — Ứng tại Hào ${hexData.ungHao}`);
      if (hexData.haoRows && hexData.haoRows.length > 0) {
        lines.push("- Đồ hình 6 Hào Nạp Giáp (từ Hào 6 xuống Hào 1):");
        hexData.haoRows.forEach((hr) => {
          const isRedDot = isHaoRedDotByDice(hr.hao);
          const isHighlight = isHaoHighlightedByDice(hr.hao, hr.isThe, hr.isUng);
          const tags: string[] = [];
          if (hr.isThe) tags.push("THẾ");
          if (hr.isUng) tags.push("ỨNG");
          if (isRedDot) tags.push("🔴 CHẤM ĐỎ XÍ NGẦU KÍCH HOẠT");
          else if (isHighlight) tags.push("⚡ HÀO XÍ NGẦU TRỎ TỚI");
          const lucThanVi = LUC_THAN_VI_MAP[hr.lucThan] || hr.lucThan;
          const canChiVi = stripNguHanhInText(translateCanChiNguHanh(hr.canChi));
          const canChiHan = stripNguHanhFromCanChiHan(hr.canChi);
          lines.push(
            `  • Hào ${hr.hao} (${hr.isYang ? "Dương ⚊" : "Âm ⚋"}): ${lucThanVi} (${hr.lucThan}) — ${canChiVi} (${canChiHan})${tags.length ? ` [${tags.join(" | ")}]` : ""}`
          );
        });
      }
    }

    // Thi đoán tổng quát & Chiết tự của Quẻ (Mục 2)
    if (overviewParsed) {
      if (overviewParsed.infoDoan.length > 0) {
        lines.push("- Thông tin Nạp Giáp & Thần Sát đầu quyển:");
        overviewParsed.infoDoan.forEach((d) => {
          if (d.han) lines.push(`  • Chữ Hán: ${d.han}`);
          if (d.hv) lines.push(`    Phiên âm: ${d.hv}`);
          if (d.vi) lines.push(`    Dịch nghĩa: ${d.vi}`);
        });
      }
      if (overviewParsed.poemSegs.length > 0) {
        lines.push("- Thi Đoán Tổng Quát Của Quẻ (8 câu cổ thi đầu quyển):");
        lines.push(`  • Nguyên văn Hán: ${overviewParsed.poemSegs.map((s) => s.han).join(" ")}`);
        lines.push(`  • Phiên âm Hán-Việt: ${overviewParsed.poemSegs.map((s) => s.hv).filter(Boolean).join(" / ")}`);
        if (overviewParsed.dichTho) {
          lines.push(`  • Dịch thơ:\n${overviewParsed.dichTho.split("\n").map((l) => `    ${l}`).join("\n")}`);
        }
        lines.push("  • Giải nghĩa từng câu:");
        overviewParsed.poemSegs.forEach((s, idx) => {
          lines.push(`    (${idx + 1}) ${s.han} (${s.hv}) => ${s.vi}`);
        });
      }
      if (overviewParsed.chietSegs.length > 0) {
        lines.push("- Phép Chiết Tự (Tách chữ đoán điềm):");
        overviewParsed.chietSegs.forEach((c) => {
          lines.push(`  • ${c.han} (${c.hv}): ${c.vi}`);
        });
      }
    }
    lines.push("");

    // 3. Kết quả Xí Ngầu 12 mặt (Tranh & Thơ của Quẻ/Hào)
    lines.push("III. KẾT QUẢ LẮC XÍ NGẦU 12 MẶT NGỰ CHẾ (TRANH & THƠ ĐOÁN CỦA QUẺ):");
    if (diceValue && diceSection) {
      const parsedDice = extractPoemAndContent(diceSection);
      lines.push(
        `- Mặt xí ngầu gieo được: Mặt số ${diceValue}/12 — ${currentDiceItem.titleVi} (${currentDiceItem.titleHan}) — ${currentDiceItem.description}`
      );
      if (diceValue >= 7) {
        lines.push(
          `- Ý nghĩa đặc biệt: Mặt số ${diceValue} thuộc nhóm Thượng (7..12), điểm CHẤM ĐỎ (🔴) kích hoạt trực tiếp tại HÀO ${diceValue - 6}.`
        );
      } else {
        lines.push(
          `- Ý nghĩa đặc biệt: Mặt số ${diceValue} thuộc nhóm Sơ (1..6), ứng trực tiếp vào HÀO ${diceValue}.`
        );
      }
      if (parsedDice.headerSeg) {
        lines.push(
          `- Tiêu đề mục Hào/Quẻ: ${parsedDice.headerSeg.han} | ${parsedDice.headerSeg.hv} | ${parsedDice.headerSeg.vi}`
        );
      }
      if (parsedDice.poemSegs.length > 0) {
        lines.push(`- Thơ đoán (Nguyên bản chữ Hán): ${parsedDice.poemSegs.map((s) => s.han).join(" ")}`);
        lines.push(`- Phiên âm Hán-Việt: ${parsedDice.poemSegs.map((s) => s.hv).filter(Boolean).join(" / ")}`);
        if (parsedDice.dichTho) {
          lines.push(`- Bản dịch thơ:\n${parsedDice.dichTho.split("\n").map((l) => `  ${l}`).join("\n")}`);
        }
        lines.push("- Dịch nghĩa từng câu thơ:");
        parsedDice.poemSegs.forEach((s, idx) => {
          lines.push(`  (${idx + 1}) ${s.han} (${s.hv}) => ${s.vi}`);
        });
      }
      if (diceSection.moTaTranh) {
        lines.push(`- Họa cảnh tranh lụa Cố Cung (Tượng hình của Hào/Quẻ): ${diceSection.moTaTranh}`);
      }
      const allDiceNotes = [...parsedDice.blockNotes, ...parsedDice.pageNotes];
      if (allDiceNotes.length > 0) {
        lines.push("- Chú thích:");
        allDiceNotes.forEach((n) => lines.push(`  • ${n}`));
      }
    } else {
      lines.push("- (Chưa lắc xí ngầu 12 mặt — Hãy bấm nút 'Lắc Xí Ngầu 12 Mặt' hoặc chọn mặt 1..12 để có thêm Thơ & Tranh Hào đoán)");
    }
    lines.push("");

    // 4. Kết quả Ca Đoán Dịch Ảnh Theo Thiên Can Ngày
    lines.push(`IV. TRANH VẼ & THƠ ĐOÁN THEO THIÊN CAN NGÀY (${activeDayStem.titleVi.toUpperCase()} — ${activeDayStem.titleHan}):`);
    if (daySection) {
      const parsedDay = extractPoemAndContent(daySection);
      if (parsedDay.headerSeg) {
        lines.push(
          `- Tiêu đề Ngày: ${parsedDay.headerSeg.han} | ${parsedDay.headerSeg.hv} | ${parsedDay.headerSeg.vi}`
        );
      }
      if (parsedDay.poemSegs.length > 0) {
        lines.push(`- Ca đoán ngày ${activeDayStem.canVi} (Nguyên bản chữ Hán): ${parsedDay.poemSegs.map((s) => s.han).join(" ")}`);
        lines.push(`- Phiên âm Hán-Việt: ${parsedDay.poemSegs.map((s) => s.hv).filter(Boolean).join(" / ")}`);
        if (parsedDay.dichTho) {
          lines.push(`- Bản dịch thơ:\n${parsedDay.dichTho.split("\n").map((l) => `  ${l}`).join("\n")}`);
        }
        lines.push("- Dịch nghĩa từng câu ca đoán ngày:");
        parsedDay.poemSegs.forEach((s, idx) => {
          lines.push(`  (${idx + 1}) ${s.han} (${s.hv}) => ${s.vi}`);
        });
      }
      if (daySection.moTaTranh) {
        lines.push(`- Họa cảnh tranh lụa Cố Cung của Ngày ${activeDayStem.canVi}: ${daySection.moTaTranh}`);
      }
      const allDayNotes = [...parsedDay.blockNotes, ...parsedDay.pageNotes];
      if (allDayNotes.length > 0) {
        lines.push("- Chú thích:");
        allDayNotes.forEach((n) => lines.push(`  • ${n}`));
      }
    }
    return lines.join("\n").trim();
  }, [
    activeHexagram,
    question,
    category,
    dateInfo,
    activeDayStem,
    manualCanIdx,
    drawnCards,
    selectedCardIdx,
    hexData,
    overviewParsed,
    diceValue,
    diceSection,
    currentDiceItem,
    daySection,
  ]);

  const handleCopyAiText = async () => {
    playCardClick();
    if (!aiCopyText) return;
    try {
      await navigator.clipboard.writeText(aiCopyText);
      setCopiedAi(true);
      onShowToast?.("Đã sao chép toàn bộ nội dung Quẻ Ngự Chế để gửi cho AI phân tích!");
      setTimeout(() => setCopiedAi(false), 2500);
    } catch {
      // Fallback nếu trình duyệt chặn clipboard API
      const ta = document.createElement("textarea");
      ta.value = aiCopyText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopiedAi(true);
      onShowToast?.("Đã sao chép toàn bộ nội dung Quẻ Ngự Chế để gửi cho AI phân tích!");
      setTimeout(() => setCopiedAi(false), 2500);
    }
  };

  // Chế độ Bảo Tàng 22 Họa Cảnh Cố Cung Hoàng Gia
  const renderGalleryView = () => {
    if (!hexData) return null;
    const filteredItems = allHoaCanhItems.filter((it) => {
      if (galleryFilter === "que") return it.category === "que";
      if (galleryFilter === "ngay") return it.category === "ngay";
      return true;
    });

    const featured = selectedGalleryItem || allHoaCanhItems[0];
    const parsedFeatured = featured ? extractPoemAndContent(featured.section) : null;

    return (
      <div className="space-y-6">
        {/* Header Gallery & Bộ Lọc */}
        <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-[#382011] via-[#2A170D] to-[#1F1109] border-2 border-[#C9A55A]/80 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full bg-gradient-to-r from-[#8B1E14] to-[#63120B] border border-[#E6B86A]/60 text-[#FCE6B4] text-[10px] font-serif font-bold uppercase tracking-wider shadow">
                🎨 BẢO TÀNG HỌA CẢNH HOÀNG CUNG
              </span>
              <span className="text-[11px] font-serif text-[#D4B475]">
                Quẻ #{hexData.hexNumber} (Quyển {hexData.quyenSo}/64): {hexData.quyen.tenQue} ({hexData.quyen.chuHan})
              </span>
            </div>
            <h3 className="text-lg sm:text-2xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FCE6B4] via-[#F3D787] to-[#C9A55A]">
              Bộ Sưu Tập Trọn Vẹn 22 Bức Họa Cảnh Cố Cung (1482)
            </h3>
            <p className="text-xs sm:text-sm font-serif text-[#C8B69E] max-w-2xl leading-relaxed">
              Chiêm ngưỡng rõ nét từng bức tranh lụa màu khoáng cung đình triều Minh: 12 tượng hình quẻ (Thoán, Tượng, Lục hào, Toàn động/tĩnh, Thế/Ứng) và 10 ca đoán theo 10 ngày Thiên Can.
            </p>
          </div>

          {/* Bộ Lọc Danh Mục & Nút Vẽ Lại 22 Tranh HD */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isBatchRedrawing || redrawingMucIdx !== null}
              onClick={handleBatchRedrawHexagram}
              className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-[#8B1E14] via-[#B3281B] to-[#6E140D] hover:brightness-110 border border-[#E5C168] text-[#FCE6B4] text-xs font-serif font-extrabold flex items-center gap-1.5 shadow-lg cursor-pointer transition-all disabled:opacity-50"
            >
              {isBatchRedrawing ? (
                <RefreshCw className="w-3.5 h-3.5 text-[#F3D787] animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-[#F3D787]" />
              )}
              <span>
                {isBatchRedrawing
                  ? "Đang Vẽ Lại 22 Tranh HD..."
                  : "✨ Vẽ Lại 22 Tranh Công Bút HD"}
              </span>
            </button>

            <div className="flex flex-wrap items-center gap-1.5 bg-[#140B07] p-1.5 rounded-2xl border border-[#3E2718]">
              <button
                type="button"
                onClick={() => setGalleryFilter("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer ${
                  galleryFilter === "all"
                    ? "bg-gradient-to-r from-[#C9A55A] to-[#A67C2E] text-black shadow font-extrabold"
                    : "text-[#A8947B] hover:text-white"
                }`}
              >
                Tất Cả ({allHoaCanhItems.length})
              </button>
              <button
                type="button"
                onClick={() => setGalleryFilter("que")}
                className={`px-3 py-1.5 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer ${
                  galleryFilter === "que"
                    ? "bg-gradient-to-r from-[#8B1E14] to-[#B3281B] text-[#FCE6B4] shadow font-extrabold"
                    : "text-[#A8947B] hover:text-white"
                }`}
              >
                12 Họa Cảnh Quẻ
              </button>
              <button
                type="button"
                onClick={() => setGalleryFilter("ngay")}
                className={`px-3 py-1.5 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer ${
                  galleryFilter === "ngay"
                    ? "bg-gradient-to-r from-[#8B1E14] to-[#B3281B] text-[#FCE6B4] shadow font-extrabold"
                    : "text-[#A8947B] hover:text-white"
                }`}
              >
                10 Họa Cảnh Ngày Can
              </button>
            </div>
          </div>
        </div>

        {/* KHU VỰC BỨC HỌA ĐANG XEM TRỰC TIẾP (FEATURED HERO VIEWER) */}
        {featured && parsedFeatured && (
          <div className="rounded-3xl border-2 border-[#C9A55A]/90 bg-gradient-to-b from-[#23150E] via-[#1A0F0A] to-[#120906] p-5 sm:p-6 shadow-2xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#3D2517] pb-3.5">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-serif font-bold border bg-gradient-to-r ${featured.badgeColor}`}>
                  {featured.categoryLabel}
                </span>
                <div>
                  <h4 className="text-base sm:text-xl font-serif font-black text-[#FCE6B4]">
                    {featured.titleVi} — {featured.titleHan}
                  </h4>
                  <div className="text-[11px] font-serif text-[#C9A55A]">
                    Trang {featured.pageNum}/1734 • Bản gốc Cố Cung Đài Bắc
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setLightboxImg({
                    src: featured.section.painting,
                    title: featured.section.title,
                    subtitle: `${hexData.quyen.tenQue} • ${featured.titleVi} (${featured.titleHan})`,
                    moTa: featured.section.moTaTranh,
                    poem: parsedFeatured.dichTho,
                    mucIdx: featured.mucIdx,
                  })
                }
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#C9A55A] via-[#F3D787] to-[#A67C2E] hover:brightness-110 text-black font-serif font-extrabold text-xs flex items-center gap-1.5 shadow-lg cursor-pointer transition-all"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Xem Toàn Màn Hình</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Cột Trái (5/12): Khung Tranh Hoàng Cung */}
              <div className="lg:col-span-5">
                {renderPalacePaintingFrame(
                  featured.section,
                  `${hexData.quyen.tenQue} • ${featured.titleVi} (${featured.titleHan})`,
                  parsedFeatured.dichTho
                )}
              </div>

              {/* Cột Phải (7/12): Thơ Đoán & Họa Cảnh Chi Tiết */}
              <div className="lg:col-span-7 space-y-4">
                {/* Khung Thơ Đoán */}
                <div className="p-4 rounded-2xl bg-[#180E09] border border-[#4A2E1B] space-y-3">
                  {parsedFeatured.headerSeg && (
                    <div className="pb-2 border-b border-[#362214] flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-sm sm:text-base font-serif font-black text-[#F3D787]">
                        {parsedFeatured.headerSeg.han} — {parsedFeatured.headerSeg.hv}
                      </span>
                      <span className="text-xs font-serif text-[#B8A58E]">{parsedFeatured.headerSeg.vi}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Nguyên bản */}
                    <div className="p-3 rounded-xl bg-[#21140D] border border-[#382315] space-y-1.5">
                      <div className="text-[10px] font-serif uppercase tracking-wider text-[#C9A55A] font-bold">
                        📜 Nguyên Bản & Phiên Âm:
                      </div>
                      <div className="space-y-1">
                        {parsedFeatured.poemSegs.map((sg, idx) => (
                          <div key={idx} className="leading-snug">
                            <div className="text-sm font-serif font-bold text-[#FCE6B4] tracking-wide">
                              {sg.han}
                            </div>
                            {sg.hv && (
                              <div className="text-xs font-serif text-[#E5C168] italic">
                                {sg.hv}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Dịch thơ */}
                    {parsedFeatured.dichTho && (
                      <div className="p-3 rounded-xl bg-gradient-to-br from-[#2E1A0F] to-[#1F110A] border border-[#8B6220]/60 shadow-inner flex flex-col justify-center">
                        <div className="text-[10px] font-serif uppercase tracking-widest text-[#F3D787] font-bold mb-1.5 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#F3D787]" />
                          <span>Dịch Thơ:</span>
                        </div>
                        <div className="text-sm font-serif font-bold italic text-[#FFF3D1] whitespace-pre-line leading-relaxed pl-2.5 border-l-2 border-[#E5C168]">
                          {parsedFeatured.dichTho}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Giải nghĩa thơ */}
                  {parsedFeatured.poemSegs.some((sg) => sg.vi) && (
                    <div className="p-3 rounded-xl bg-[#140B07] border border-[#331F12] space-y-1 text-xs font-serif text-[#C8B69E] leading-relaxed">
                      <div className="text-[10px] uppercase tracking-wider text-[#D4B475] font-bold">
                        Giải Nghĩa Từng Câu:
                      </div>
                      {parsedFeatured.poemSegs.map(
                        (sg, idx) =>
                          sg.vi && (
                            <div key={idx}>
                              <span className="font-bold text-[#E5C168]">{sg.han}</span>: <span>{sg.vi}</span>
                            </div>
                          )
                      )}
                    </div>
                  )}
                </div>

                {/* KHỐI HỌA CẢNH CỐ CUNG CHI TIẾT SẮC NÉT */}
                {renderHoaCanhCard(
                  featured.section,
                  `Họa Cảnh Chi Tiết: ${featured.titleVi}`,
                  "TƯỢNG HÌNH BẢN GỐC TRIỀU MINH (1482)",
                  () =>
                    setLightboxImg({
                      src: featured.section.painting,
                      title: featured.section.title,
                      subtitle: `${hexData.quyen.tenQue} • ${featured.titleVi} (${featured.titleHan})`,
                      moTa: featured.section.moTaTranh,
                      poem: parsedFeatured.dichTho,
                      mucIdx: featured.mucIdx,
                    })
                )}
              </div>
            </div>
          </div>
        )}

        {/* LƯỚI 22 BỨC HỌA CẢNH MINIATURES GRID */}
        <div className="rounded-3xl border border-[#5C3D22] bg-gradient-to-b from-[#1E120A] via-[#160D08] to-[#100905] p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#362214] pb-3">
            <div className="flex items-center gap-2">
              <span className="text-base">🖼️</span>
              <h4 className="text-sm sm:text-base font-serif font-black text-[#FCE6B4] uppercase tracking-wider">
                Danh Sách {filteredItems.length} Bức Họa Cảnh Cố Cung (Bấm vào tranh để xem chi tiết)
              </h4>
            </div>
            <span className="text-xs font-serif text-[#C9A55A]">
              Bấm chọn bất kỳ bức họa nào để xem phóng to
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filteredItems.map((item, idx) => {
              const isSelected = item.mucIdx === (featured?.mucIdx || 3);
              return (
                <button
                  key={item.mucIdx}
                  type="button"
                  onClick={() => {
                    playCardClick();
                    setSelectedGalleryMucIdx(item.mucIdx);
                  }}
                  className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
                    isSelected
                      ? "bg-gradient-to-b from-[#382011] via-[#2A170D] to-[#1C0E07] border-2 border-[#F3D787] shadow-[0_0_20px_rgba(243,215,135,0.4)] scale-[1.02]"
                      : "bg-[#160D08] border-[#382315] hover:border-[#8C5E28] hover:bg-[#20130B]"
                  }`}
                >
                  {/* Thumbnail tranh */}
                  <div className="w-full aspect-[4/5] bg-black/60 rounded-xl overflow-hidden mb-2 relative flex items-center justify-center border border-[#3E2718]">
                    {item.section.painting ? (
                      <img
                        src={item.section.painting}
                        alt={item.titleVi}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="text-[10px] text-center p-2 text-[#8C6520]">Không có tranh</div>
                    )}
                    <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/80 text-[9px] font-mono font-bold text-[#F3D787] border border-[#C9A55A]/50">
                      #{idx + 1}
                    </span>
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-[#8B1E14] text-[9px] font-serif font-bold text-white border border-[#F3D787]">
                        Đang xem
                      </span>
                    )}
                  </div>

                  {/* Tiêu đề */}
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-serif uppercase tracking-wider text-[#C9A55A] font-bold truncate">
                      {item.shortLabel}
                    </div>
                    <div className="text-xs font-serif font-bold text-[#FCE6B4] leading-snug line-clamp-1 group-hover:text-[#F3D787]">
                      {item.titleVi}
                    </div>
                    <div className="text-[10px] font-serif text-[#9E8C75] italic truncate">
                      {item.titleHan}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-6 space-y-6">
      {/* BANNER CỐ CUNG NGỰ CHẾ */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-[#B38728]/70 bg-gradient-to-br from-[#23140D] via-[#180E09] to-[#120A06] shadow-[0_15px_50px_rgba(0,0,0,0.85)] p-5 sm:p-7">
        {/* Hoa văn nền */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, #F3D787 1px, transparent 1px), radial-gradient(circle at 80% 80%, #C9A55A 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-[#4A2E1B] pb-5">
          <div className="space-y-1.5">
            <div className="inline-flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[#8B1E14] to-[#63120B] border border-[#E6B86A]/60 text-[#FCE6B4] text-[11px] font-serif font-bold tracking-wider uppercase shadow">
                御製新集斷易精粹 • Niên Hiệu Thành Hóa (1482)
              </span>
              {hexData && (
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-serif font-semibold border ${
                    hexData.quyen.loaiNguon === "goc"
                      ? "bg-amber-950/80 text-amber-300 border-amber-600/50"
                      : "bg-purple-950/80 text-purple-200 border-purple-500/50"
                  }`}
                >
                  {hexData.quyen.loaiNguon === "goc"
                    ? `📜 Bản gốc Cố Cung • Tập ${hexData.quyen.tapGoc} (Quyển ${hexData.quyenSo}/64)`
                    : `✨ Bản phục dựng Cố Cung #${hexData.quyen.queBoKhuyet} (Quyển ${hexData.quyenSo}/64)`}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FCE6B4] via-[#E5C168] to-[#D4A238] tracking-wide">
              NGỰ CHẾ TÂN TẬP ĐOÁN DỊCH TINH TÚY
            </h2>
            <p className="text-xs sm:text-sm text-[#C8B69E] font-serif leading-relaxed max-w-3xl">
              Phép bốc <strong>Tam Tài (Thiên — Địa — Nhân)</strong>: Rút 3 lá bài, lấy{" "}
              <strong className="text-[#F3D787] underline decoration-[#C9A55A]/60">
                lá cuối cùng (Đạo Nhân) làm Quẻ Chủ
              </strong>
              , sau đó <strong>lắc xí ngầu 12 mặt</strong> để định ngôi hào/quẻ đoán và đối chiếu{" "}
              <strong className="text-[#F3D787]">Tranh vẽ & Thơ đoán của Quẻ</strong> cùng với{" "}
              <strong className="text-[#F3D787]">Tranh vẽ & Thơ đoán của Ngày hôm đó</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-stretch lg:self-center">
            {/* Nút Copy nhanh Nội Dung Quẻ Cho AI Phân Tích + Mở Ô Copy */}
            <div className="flex items-center rounded-xl overflow-hidden border border-emerald-500/60 bg-[#10261D] shadow-lg">
              <button
                type="button"
                onClick={handleCopyAiText}
                title="Sao chép toàn bộ nội dung Quẻ, Hào, Xí ngầu 12 mặt, Ca đoán Ngày & Sự vụ để dán vào ChatGPT/Claude/Gemini phân tích"
                className={`px-3.5 py-2 text-xs font-serif font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  copiedAi
                    ? "bg-emerald-600 text-white"
                    : "bg-gradient-to-r from-emerald-800/90 to-teal-900/90 hover:from-emerald-700 hover:to-teal-800 text-emerald-100"
                }`}
              >
                {copiedAi ? (
                  <>
                    <Check className="w-4 h-4 text-white shrink-0" />
                    <span>Đã Copy Quẻ Cho AI!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-emerald-300 shrink-0" />
                    <span>Copy Nội Dung Quẻ (Cho AI Phân Tích)</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  playCardClick();
                  setShowAiCopyBox((prev) => !prev);
                }}
                title="Hiển thị / Ẩn ô văn bản nội dung quẻ để xem trước hoặc chỉnh sửa trước khi copy cho AI"
                className={`px-2.5 py-2 text-xs font-serif font-bold border-l border-emerald-600/40 flex items-center gap-1 transition-all cursor-pointer ${
                  showAiCopyBox
                    ? "bg-emerald-950 text-amber-300"
                    : "bg-[#0D1F18] hover:bg-emerald-950/80 text-emerald-300"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{showAiCopyBox ? "Ẩn Ô Copy" : "Xem Ô Copy"}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleOpenIntro}
              className="px-3.5 py-2 rounded-xl bg-[#2A1810] hover:bg-[#3A2217] text-[#F3D787] border border-[#6E4726] text-xs font-serif font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow"
            >
              <ScrollText className="w-4 h-4 text-[#E5C168]" />
              <span>Lời Tựa Vua Minh & Chúc Hương Văn</span>
            </button>

            <div className="flex items-center bg-[#140B07] p-1 rounded-xl border border-[#3E2718]">
              <button
                type="button"
                onClick={() => setDisplayStyle("modern")}
                className={`px-3 py-1.5 rounded-lg text-xs font-serif font-bold transition-all cursor-pointer ${
                  displayStyle === "modern"
                    ? "bg-gradient-to-r from-[#C9A55A] to-[#A67C2E] text-black shadow"
                    : "text-[#A8947B] hover:text-white"
                }`}
              >
                Bản Dịch & Tranh Rõ
              </button>
              <button
                type="button"
                onClick={() => setDisplayStyle("palace")}
                className={`px-3 py-1.5 rounded-lg text-xs font-serif font-bold transition-all cursor-pointer ${
                  displayStyle === "palace"
                    ? "bg-gradient-to-r from-[#8B1E14] to-[#B3281B] text-[#FCE6B4] shadow"
                    : "text-[#A8947B] hover:text-white"
                }`}
              >
                Trang Đôi Lụa Cố Cung
              </button>
              <button
                type="button"
                onClick={() => setDisplayStyle("gallery")}
                className={`px-3 py-1.5 rounded-lg text-xs font-serif font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  displayStyle === "gallery"
                    ? "bg-gradient-to-r from-[#E5C168] via-[#F3D787] to-[#C9A55A] text-black shadow font-extrabold"
                    : "text-[#E5C168] hover:text-white"
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Bảo Tàng 22 Họa Cảnh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Ô COPY NỘI DUNG QUẺ CHO AI PHÂN TÍCH (HIỂN THỊ KHI BẤM "XEM Ô COPY" HOẶC VỪA COPY) */}
        {showAiCopyBox && (
          <div className="relative z-10 mt-4 rounded-2xl border border-emerald-500/50 bg-gradient-to-b from-[#0E1F18]/95 to-[#091410]/95 p-4 shadow-xl animate-in fade-in duration-200">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-800/80 border border-emerald-400/50 text-emerald-200 text-[11px] font-serif font-bold uppercase tracking-wider">
                  🤖 Prompt Chuẩn Hóa Cho AI
                </span>
                <span className="text-xs sm:text-sm font-serif font-bold text-[#F3D787]">
                  Ô Nội Dung Quẻ Ngự Chế Tinh Túy (Dùng để dán vào ChatGPT, Claude, Gemini, DeepSeek...)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyAiText}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-serif font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow ${
                    copiedAi
                      ? "bg-emerald-500 text-black"
                      : "bg-gradient-to-r from-[#C9A55A] to-[#A67C2E] hover:brightness-110 text-black"
                  }`}
                >
                  {copiedAi ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAi ? "Đã Sao Chép Toàn Bộ!" : "Sao Chép Tất Cả Nội Dung"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAiCopyBox(false)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#1A2E25] hover:bg-[#243E32] text-emerald-200 border border-emerald-700/50 text-xs font-serif cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
            <p className="text-[11px] sm:text-xs text-emerald-200/80 font-serif mb-2">
              💡 <strong>Mẹo:</strong> Nội dung trong ô dưới đây tự động cập nhật theo <strong>Quẻ đang chọn</strong>,{" "}
              <strong>kết quả Xí Ngầu 12 Mặt ({diceValue ? `Mặt số ${diceValue}` : "chưa lắc"})</strong> và{" "}
              <strong>Thiên Can Ngày ({activeDayStem.titleVi})</strong>. Bạn có thể bấm nút <em>Sao Chép Tất Cả Nội Dung</em> hoặc bôi đen từng phần trong ô:
            </p>
            <textarea
              readOnly
              value={aiCopyText}
              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              rows={12}
              className="w-full rounded-xl bg-[#07100C] border border-emerald-700/50 p-3 text-xs sm:text-sm font-mono text-emerald-100/95 leading-relaxed focus:outline-none focus:border-emerald-400 selection:bg-emerald-700 selection:text-white resize-y"
            />
          </div>
        )}

        {/* 3 LÁ TAM TÀI: THIÊN - ĐỊA - NHÂN (LẤY LÁ CUỐI LÀM QUẺ) */}
        {drawnCards.length > 0 && (
          <div className="relative z-10 mt-5">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-serif uppercase tracking-wider text-[#D4B475] font-bold flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-[#F3D787]" />
                <span>Tam Tài Định Quẻ (Mặc định lấy Lá Thứ 3 — Nhân Hòa làm Quẻ Chủ):</span>
              </span>
              <span className="text-[11px] font-serif text-[#9E8C75]">
                Có thể bấm vào từng lá để tra cứu thêm quyển Ngự Chế của lá đó
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {drawnCards.slice(0, 3).map((card, idx) => {
                const isLastCard = idx === (drawnCards.length >= 3 ? 2 : drawnCards.length - 1);
                const isSelected = idx === selectedCardIdx;
                const pInfo = PILLAR_INFO[idx] || PILLAR_INFO[2];

                return (
                  <button
                    key={`${card.number}-${idx}`}
                    type="button"
                    onClick={() => {
                      playCardClick();
                      setSelectedCardIdx(idx);
                    }}
                    className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                      isSelected
                        ? "bg-gradient-to-br from-[#382112] via-[#28160C] to-[#1D0F08] border-2 border-[#F3D787] shadow-[0_0_25px_rgba(243,215,135,0.25)]"
                        : "bg-[#190F0A]/90 border-[#3E2718] hover:border-[#7A542E] opacity-80 hover:opacity-100"
                    }`}
                  >
                    {isLastCard && (
                      <div className="absolute top-0 right-0 bg-gradient-to-r from-[#9E1F14] to-[#C92A1D] text-[#FCE6B4] text-[10px] font-serif font-extrabold px-2.5 py-0.5 rounded-bl-xl border-l border-b border-[#F3D787]/50 flex items-center gap-1 shadow">
                        <Crown className="w-3 h-3 text-[#F3D787]" />
                        <span>LÁ CUỐI • QUẺ CHỦ</span>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center font-serif font-black border shrink-0 ${
                          isSelected
                            ? "bg-gradient-to-br from-[#F3D787] to-[#B88928] text-black border-[#FFF3C4]"
                            : "bg-[#26170F] text-[#D4B475] border-[#4A301D]"
                        }`}
                      >
                        <span className="text-[10px] uppercase leading-none opacity-80">#{card.number}</span>
                        <span className="text-sm leading-tight mt-0.5">{card.hanzi?.slice(0, 2)}</span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-serif font-bold uppercase tracking-wider text-[#C9A55A]">
                          {pInfo.title}
                        </div>
                        <div className="text-sm sm:text-base font-serif font-extrabold text-[#FDF0D5] truncate">
                          Quẻ {card.number}: {card.name}
                        </div>
                        <div className="text-[11px] font-serif text-[#A8947B] truncate">{pInfo.sub}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* KHU VỰC ĐIỀU KHIỂN: XÍ NGẦU 12 MẶT + CHỌN THIÊN CAN NGÀY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* CỘT TRÁI (7/12): XÍ NGẦU 12 MẶT NGỰ CHẾ */}
        <div className="lg:col-span-7 rounded-3xl border border-[#5C3D22] bg-gradient-to-b from-[#21150E] via-[#180F0A] to-[#120B07] p-5 shadow-xl relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#382315] pb-3.5 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#C9A55A] to-[#8C6520] text-black flex items-center justify-center shadow">
                <Dices className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-serif font-black text-[#FCE6B4] uppercase tracking-wider">
                  Bước 1: Lắc Xí Ngầu 12 Mặt Ngự Chế
                </h3>
                <p className="text-[11px] font-serif text-[#A8947B]">
                  1–6: Hào 1–6 • 7: Không động hào • 8: Thế • 9: Thoán Dương • 10: Tượng Âm • 11: Ứng • 12: Động 6 hào
                </p>
              </div>
            </div>

            {diceValue !== null && (
              <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-serif font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Đã gieo mặt số {diceValue}</span>
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-5">
            {/* Viên Xí Ngầu 12 Mặt D12 */}
            <div className="flex flex-col items-center shrink-0">
              <div
                onClick={handleRollDice}
                title="Bấm để lắc xí ngầu 12 mặt"
                className="relative group cursor-pointer select-none"
              >
                <div
                  className={`w-28 h-28 sm:w-32 sm:h-32 flex flex-col items-center justify-center p-3 transition-all duration-300 ${
                    isRolling
                      ? "animate-spin scale-105 bg-gradient-to-br from-[#FCE6B4] via-[#C9A55A] to-[#8B1E14] shadow-[0_0_35px_rgba(243,215,135,0.7)]"
                      : diceValue !== null
                      ? "bg-gradient-to-br from-[#8B1E14] via-[#4A120C] to-[#240B07] hover:scale-105 shadow-[0_0_25px_rgba(201,165,90,0.4)]"
                      : "bg-gradient-to-br from-[#3A2618] via-[#24160E] to-[#160D08] hover:scale-105 shadow-[0_0_20px_rgba(201,165,90,0.2)]"
                  }`}
                  style={{
                    clipPath:
                      "polygon(50% 0%, 88% 16%, 100% 55%, 78% 95%, 22% 95%, 0% 55%, 12% 16%)",
                    border: "2px solid #E5C168",
                  }}
                >
                  <span className="text-[10px] font-serif uppercase tracking-widest text-[#E5C168]/90">
                    XÍ NGẦU D12
                  </span>
                  <span
                    className={`text-3xl sm:text-4xl font-mono font-black leading-none my-1 ${
                      isRolling ? "text-black" : "text-[#FCE6B4]"
                    }`}
                  >
                    {diceValue !== null || isRolling ? rollingDisplay : "?"}
                  </span>
                  <span
                    className={`text-[11px] font-serif font-bold text-center leading-tight px-1 ${
                      isRolling ? "text-black" : "text-[#F3D787]"
                    }`}
                  >
                    {diceValue !== null || isRolling ? currentDiceItem.shortLabel : "Bấm Để Lắc"}
                  </span>
                </div>

                {/* Huy hiệu góc */}
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br from-[#F3D787] to-[#B88928] text-black flex items-center justify-center shadow-lg border border-white/40">
                  <Dices className={`w-4 h-4 ${isRolling ? "animate-spin" : ""}`} />
                </div>
              </div>

              <button
                type="button"
                onClick={handleRollDice}
                disabled={isRolling}
                className={`mt-3.5 px-5 py-2.5 rounded-xl font-serif font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95 ${
                  isRolling
                    ? "bg-[#3A2718] text-[#9E8C75] cursor-not-allowed"
                    : "bg-gradient-to-r from-[#C9A55A] via-[#F3D787] to-[#C2922B] text-black hover:brightness-110 border border-[#FFF2C2]"
                }`}
              >
                {isRolling ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang Lắc Xí Ngầu...</span>
                  </>
                ) : (
                  <>
                    <Dices className="w-4 h-4" />
                    <span>{diceValue !== null ? "Lắc Lại Xí Ngầu 12 Mặt" : "Lắc Xí Ngầu 12 Mặt Ngay"}</span>
                  </>
                )}
              </button>
            </div>

            {/* Bảng 12 Mặt Xí Ngầu */}
            <div className="flex-1 w-full">
              <div className="text-[11px] font-serif text-[#C8B69E] mb-2 flex items-center justify-between">
                <span>Bảng 12 mặt xí ngầu (có thể bấm chọn trực tiếp mặt vừa gieo):</span>
                {hexData && (
                  <span className="text-[#F3D787] font-bold">
                    Thế: Hào {hexData.theHao} • Ứng: Hào {hexData.ungHao}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                {NGU_CHE_DICE_ITEMS.map((item) => {
                  const isSelected = diceValue === item.diceNumber;
                  let extraSub = item.titleHan;
                  if (hexData) {
                    if (item.diceNumber === 8) extraSub = `Hào ${hexData.theHao} (世)`;
                    if (item.diceNumber === 11) extraSub = `Hào ${hexData.ungHao} (應)`;
                  }
                  return (
                    <button
                      key={item.diceNumber}
                      type="button"
                      onClick={() => handleSelectDiceFace(item.diceNumber)}
                      disabled={isRolling}
                      className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                        isSelected
                          ? "bg-gradient-to-r from-[#8B1E14] to-[#5E130C] border-[#F3D787] text-[#FCE6B4] shadow-[0_0_12px_rgba(243,215,135,0.35)] scale-[1.02]"
                          : "bg-[#160E09] border-[#362214] text-[#C8B69E] hover:border-[#6E4726] hover:bg-[#22150E]"
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg font-mono text-xs font-black flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "bg-[#F3D787] text-black"
                            : "bg-[#261810] text-[#D4B475] border border-[#452C1B]"
                        }`}
                      >
                        {item.diceNumber}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-serif font-bold truncate leading-tight">
                          {item.shortLabel}
                        </div>
                        <div className="text-[9px] font-serif text-[#9E8C75] truncate">{extraSub}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Giải thích mặt đang chọn */}
              {diceValue !== null && (
                <div className="mt-3 p-2.5 rounded-xl bg-[#190F0A] border border-[#4A2E1B] text-xs font-serif text-[#E5D3B3] flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-[#F3D787] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#F3D787]">
                      Mặt số {currentDiceItem.diceNumber} — {currentDiceItem.titleVi} ({currentDiceItem.titleHan}):
                    </span>{" "}
                    <span>{currentDiceItem.description}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CỘT PHẢI (5/12): THIÊN CAN NGÀY BỐC QUẺ (GIÁP NHẬT ĐOÁN .. QUÝ NHẬT ĐOÁN) */}
        <div className="lg:col-span-5 rounded-3xl border border-[#5C3D22] bg-gradient-to-b from-[#21150E] via-[#180F0A] to-[#120B07] p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 border-b border-[#382315] pb-3.5 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#8B1E14] to-[#59110A] text-[#FCE6B4] border border-[#E5C168]/50 flex items-center justify-center shadow">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-serif font-black text-[#FCE6B4] uppercase tracking-wider">
                    Bước 2: Thiên Can Ngày Xem Quẻ
                  </h3>
                  <p className="text-[11px] font-serif text-[#A8947B]">
                    Đối chiếu «Ca Đoán Dịch Ảnh» theo 10 ngày Thiên Can (Giáp → Quý)
                  </p>
                </div>
              </div>
            </div>

            {/* Chọn ngày Dương lịch -> Tự động tính Âm lịch & Can Chi ngày */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[#160D08] border border-[#3E2718] mb-3.5">
              <div>
                <div className="text-[10px] font-serif uppercase tracking-wider text-[#A8947B]">
                  Ngày Bốc Quẻ (Tự Động Tính Can Chi)
                </div>
                <div className="text-sm font-serif font-bold text-[#FCE6B4] mt-0.5">
                  Ngày <span className="text-[#F3D787]">{dateInfo.dayCC.fullName}</span> ({dateInfo.dayCC.chineseCan}
                  {dateInfo.dayCC.chineseChi}) • Âm lịch: {dateInfo.lunar.day}/{dateInfo.lunar.month}/
                  {dateInfo.lunar.yearFullName}
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={selectedDateStr}
                  onChange={(e) => {
                    if (e.target.value) {
                      setSelectedDateStr(e.target.value);
                      setManualCanIdx(null);
                    }
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-[#24160E] border border-[#5C3D22] text-xs font-serif text-[#FCE6B4] focus:outline-none focus:border-[#F3D787]"
                />
              </div>
            </div>

            {/* Lưới 10 Thiên Can Ngày (Giáp .. Quý) */}
            <div className="text-[11px] font-serif text-[#C8B69E] mb-2 flex items-center justify-between">
              <span>10 Thiên Can Ngày của Quẻ (Mặc định theo ngày hôm nay):</span>
              {manualCanIdx !== null && (
                <button
                  type="button"
                  onClick={() => setManualCanIdx(null)}
                  className="text-[10px] text-[#F3D787] underline cursor-pointer"
                >
                  Đặt lại theo ngày {dateInfo.dayCC.fullName}
                </button>
              )}
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              {NGU_CHE_DAY_STEMS.map((stem) => {
                const isSelected = activeCanIdx === stem.canIdx;
                const isTodayStem = dateInfo.dayCC.canIdx === stem.canIdx;
                return (
                  <button
                    key={stem.canIdx}
                    type="button"
                    onClick={() => {
                      playCardClick();
                      setManualCanIdx(stem.canIdx);
                    }}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer relative ${
                      isSelected
                        ? "bg-gradient-to-b from-[#8B1E14] to-[#59110A] border-[#F3D787] text-[#FCE6B4] shadow-[0_0_12px_rgba(243,215,135,0.35)]"
                        : "bg-[#160E09] border-[#362214] text-[#C8B69E] hover:border-[#6E4726]"
                    }`}
                  >
                    {isTodayStem && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-black" title="Thiên Can của ngày đang chọn" />
                    )}
                    <div className="text-sm font-serif font-black text-[#F3D787]">{stem.canHan}</div>
                    <div className="text-[11px] font-serif font-bold leading-tight">{stem.canVi}</div>
                    <div className="text-[9px] font-serif text-[#9E8C75]">{stem.nguHanh}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-3 p-2.5 rounded-xl bg-[#190F0A] border border-[#4A2E1B] text-xs font-serif text-[#E5D3B3] flex items-center justify-between">
            <span>
              Đang trích lục:{" "}
              <strong className="text-[#F3D787]">
                {activeDayStem.titleVi} ({activeDayStem.titleHan})
              </strong>
            </span>
            <span className="text-[11px] text-[#A8947B]">
              Mục {activeDayStem.mucIdx}/27
            </span>
          </div>
        </div>
      </div>

      {/* TRẠNG THÁI ĐANG TẢI HOẶC LỖI */}
      {loading && (
        <div className="p-12 rounded-3xl border border-[#4A2E1B] bg-[#160D08] text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#F3D787] animate-spin mx-auto" />
          <div className="text-sm font-serif text-[#FCE6B4]">
            Đang mở thư tịch Cố Cung cho Quẻ #{activeHexagram?.number} ({activeHexagram?.name})...
          </div>
        </div>
      )}

      {error && (
        <div className="p-6 rounded-3xl border border-red-500/40 bg-red-950/30 text-center text-red-200 font-serif text-sm">
          {error}
        </div>
      )}

      {/* KẾT QUẢ TRÍCH XUẤT SONG HÀNH: (1) HÌNH & THƠ ĐOÁN CỦA QUẺ ĐÓ + (2) HÌNH & THƠ ĐOÁN CỦA NGÀY ĐÓ CỦA QUẺ ĐÓ */}
      {!loading && hexData && (
        <div className="space-y-6">
          {displayStyle === "gallery" ? (
            renderGalleryView()
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ==================== CỘT 1: HÌNH & THƠ ĐOÁN CỦA QUẺ ĐÓ (THEO XÍ NGẦU 12 MẶT) ==================== */}
            <div className="rounded-3xl border-2 border-[#C9A55A]/70 bg-gradient-to-b from-[#23150E] via-[#190F0A] to-[#120A06] shadow-2xl overflow-hidden flex flex-col">
              {/* Header Cột 1 */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-[#382011] via-[#2A170D] to-[#1F1109] border-b border-[#5C3D22] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#F3D787] to-[#B88928] text-black font-serif font-black flex flex-col items-center justify-center shrink-0 shadow">
                    <span className="text-[9px] leading-none">XÍ NGẦU</span>
                    <span className="text-base leading-tight">{diceValue ?? "?"}</span>
                  </div>
                  <div>
                    <div className="text-[10px] font-serif uppercase tracking-widest text-[#E5C168] font-bold">
                      I. HÌNH & THƠ ĐOÁN CỦA QUẺ ĐÓ ({hexData.quyen.tenQue} — {hexData.quyen.chuHan})
                    </div>
                    <h4 className="text-base sm:text-lg font-serif font-black text-[#FCE6B4]">
                      {diceValue !== null
                        ? `${currentDiceItem.titleVi} (${currentDiceItem.titleHan})`
                        : "Chưa Lắc Xí Ngầu 12 Mặt"}
                    </h4>
                  </div>
                </div>

                {diceSection && (
                  <span className="px-2.5 py-1 rounded-lg bg-[#160D08] border border-[#4A2E1B] text-[11px] font-serif text-[#D4B475] shrink-0">
                    Trang {diceSection.pageNum}/1734
                  </span>
                )}
              </div>

              {/* Nội dung Cột 1 */}
              {diceValue === null ? (
                <div className="p-8 sm:p-10 flex-1 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-[#2A1810] border-2 border-dashed border-[#C9A55A] flex items-center justify-center text-[#F3D787]">
                    <Dices className="w-10 h-10 animate-bounce" />
                  </div>
                  <div className="space-y-1.5 max-w-md">
                    <h5 className="text-lg font-serif font-bold text-[#FCE6B4]">
                      Hãy Lắc Xí Ngầu 12 Mặt Để Khai Mở Tranh & Thơ Đoán Của Quẻ
                    </h5>
                    <p className="text-xs font-serif text-[#A8947B] leading-relaxed">
                      Mỗi quẻ trong «Ngự Chế Tân Tập Đoán Dịch Tinh Túy» có 12 bức họa và bài thơ ứng với 12 mặt xí ngầu:
                      1–6 là Hào 1 đến Hào 6, 7 là Không động hào (Toàn tĩnh), 8 là Thế động, 9 là Thoán Dương, 10 là Tượng Âm, 11 là Ứng động, 12 là Động 6 hào (Toàn động).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRollDice}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#C9A55A] via-[#F3D787] to-[#C2922B] text-black font-serif font-black text-sm flex items-center gap-2 shadow-xl hover:brightness-110 cursor-pointer active:scale-95"
                  >
                    <Dices className="w-5 h-5" />
                    <span>LẮC XÍ NGẦU 12 MẶT NGAY</span>
                  </button>
                </div>
              ) : diceSection ? (
                <div className="p-4 sm:p-5 space-y-5 flex-1 flex flex-col">
                  {(() => {
                    const { headerSeg, poemSegs, dichTho, blockNotes, pageNotes } =
                      extractPoemAndContent(diceSection);
                    const allNotes = [...blockNotes, ...pageNotes];

                    if (displayStyle === "palace") {
                      // CHẾ ĐỘ TRANG ĐÔI LỤA CỐ CUNG (CỔ BẢN DIPTYCH)
                      return (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#2B1B11] p-3 rounded-2xl border-2 border-[#7A542E] shadow-inner">
                            {/* Nửa Trái: Thơ chữ Hán dọc trên nền lụa */}
                            <div className="bg-[#F4EBD8] text-[#1C150E] rounded-xl p-4 border border-[#C9A55A] min-h-[340px] flex flex-row-reverse items-center justify-center gap-4 overflow-x-auto shadow">
                              <div
                                className="font-serif font-black text-lg text-[#A8281A] tracking-[0.25em] border-l border-[#C9A55A] pl-2"
                                style={{ writingMode: "vertical-rl" }}
                              >
                                {headerSeg?.han || currentDiceItem.titleHan}
                              </div>
                              <div
                                className="font-serif font-bold text-xs text-[#7A542E] tracking-[0.3em]"
                                style={{ writingMode: "vertical-rl" }}
                              >
                                詩曰
                              </div>
                              <div className="flex flex-row-reverse gap-3">
                                {poemSegs.map((sg, idx) => (
                                  <div
                                    key={idx}
                                    className="font-serif font-bold text-base sm:text-lg text-[#1C150E] tracking-[0.2em] leading-relaxed"
                                    style={{ writingMode: "vertical-rl" }}
                                  >
                                    {(sg.han || "").replace(/[，。；;、：:]/g, "")}
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Nửa Phải: Tranh vẽ Cố Cung */}
                            <div className="bg-[#EADBBE] rounded-xl p-2 border border-[#C9A55A] flex flex-col items-center justify-center relative group">
                              {diceSection.painting ? (
                                <img
                                  src={diceSection.painting}
                                  alt={diceSection.title}
                                  onClick={() =>
                                    setLightboxImg({
                                      src: diceSection.painting,
                                      title: diceSection.title,
                                      subtitle: `${hexData.quyen.tenQue} • Mặt xí ngầu số ${diceValue}: ${currentDiceItem.titleVi}`,
                                      moTa: diceSection.moTaTranh,
                                      poem: dichTho,
                                      mucIdx: diceSection.mucIdx,
                                    })
                                  }
                                  className="w-full h-[320px] object-contain rounded-lg cursor-zoom-in transition-transform group-hover:scale-[1.02]"
                                  style={{ imageRendering: "-webkit-optimize-contrast" }}
                                />
                              ) : (
                                <div className="text-xs font-serif text-[#5C4938] p-4 text-center">
                                  {diceSection.moTaTranh}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Bản dịch thơ bên dưới */}
                          {dichTho && (
                            <div className="p-4 rounded-2xl bg-[#1A0F0A] border border-[#5C3D22]">
                              <div className="text-[10px] font-serif uppercase tracking-widest text-[#E5C168] font-bold mb-1">
                                Dịch Thơ Đoán Quẻ:
                              </div>
                              <div className="text-sm sm:text-base font-serif italic text-[#FCE6B4] whitespace-pre-line leading-relaxed">
                                {dichTho}
                              </div>
                            </div>
                          )}

                          {/* Họa Cảnh Cố Cung Chi Tiết & Rõ Ràng */}
                          {diceSection.moTaTranh &&
                            renderHoaCanhCard(
                              diceSection,
                              `Họa Cảnh Mặt Xí Ngầu #${diceValue}: ${currentDiceItem.titleVi}`,
                              `${hexData.quyen.tenQue} • ${currentDiceItem.titleHan}`,
                              diceSection.painting
                                ? () =>
                                    setLightboxImg({
                                      src: diceSection.painting,
                                      title: diceSection.title,
                                      subtitle: `${hexData.quyen.tenQue} • Mặt xí ngầu số ${diceValue}: ${currentDiceItem.titleVi}`,
                                      moTa: diceSection.moTaTranh,
                                      poem: dichTho,
                                      mucIdx: diceSection.mucIdx,
                                    })
                                : undefined
                            )}
                        </div>
                      );
                    }

                    // CHẾ ĐỘ HIỆN ĐẠI GỌN ĐẸP: TRANH CỐ CUNG + KHUNG THƠ ĐỐI XỨNG (NGUYÊN BẢN & DỊCH THƠ) + GIẢI NGHĨA
                    return (
                      <>
                        {/* 1. Tranh màu cung đình nhà Minh khổ lớn sắc nét */}
                        {renderPalacePaintingFrame(
                          diceSection,
                          `${hexData.quyen.tenQue} • Mặt xí ngầu số ${diceValue}: ${currentDiceItem.titleVi}`,
                          dichTho,
                          diceSection.painting
                            ? () =>
                                setLightboxImg({
                                  src: diceSection.painting,
                                  title: diceSection.title,
                                  subtitle: `${hexData.quyen.tenQue} • Mặt xí ngầu số ${diceValue}: ${currentDiceItem.titleVi}`,
                                  moTa: diceSection.moTaTranh,
                                  poem: dichTho,
                                  mucIdx: diceSection.mucIdx,
                                })
                            : undefined
                        )}

                        {/* 2. Khối Họa Cảnh Cố Cung Chi Tiết với Huy Hiệu Tượng Hình */}
                        {diceSection.moTaTranh &&
                          renderHoaCanhCard(
                            diceSection,
                            `Họa Cảnh Cố Cung: ${currentDiceItem.titleVi}`,
                            `${hexData.quyen.tenQue} • ${currentDiceItem.titleHan}`,
                            diceSection.painting
                              ? () =>
                                  setLightboxImg({
                                    src: diceSection.painting,
                                    title: diceSection.title,
                                    subtitle: `${hexData.quyen.tenQue} • Mặt xí ngầu số ${diceValue}: ${currentDiceItem.titleVi}`,
                                    moTa: diceSection.moTaTranh,
                                    poem: dichTho,
                                    mucIdx: diceSection.mucIdx,
                                  })
                              : undefined
                          )}

                        {/* 3. Khung Thơ Đoán Gọn (Nguyên Bản Hán-Việt & Dịch Thơ Đối Xứng) */}
                        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#170E09] border border-[#4A2E1B] space-y-3">
                          {headerSeg && (
                            <div className="pb-2 border-b border-[#362214] flex flex-wrap items-baseline justify-between gap-2">
                              <span className="text-sm sm:text-base font-serif font-black text-[#F3D787]">
                                {headerSeg.han} — {headerSeg.hv}
                              </span>
                              <span className="text-[11px] font-serif text-[#B8A58E]">{headerSeg.vi}</span>
                            </div>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Cột Trái: Nguyên bản 4 câu Hán & Hán-Việt gọn trong 1 khung */}
                            <div className="p-3 rounded-xl bg-[#21140D] border border-[#382315] space-y-1.5">
                              <div className="text-[10px] font-serif uppercase tracking-wider text-[#C9A55A] font-bold">
                                📜 Nguyên Bản & Phiên Âm:
                              </div>
                              <div className="space-y-1">
                                {poemSegs.map((sg, idx) => (
                                  <div key={idx} className="leading-snug">
                                    <div className="text-sm sm:text-base font-serif font-bold text-[#FCE6B4] tracking-wide">
                                      {sg.han}
                                    </div>
                                    {sg.hv && (
                                      <div className="text-xs font-serif text-[#E5C168] italic">
                                        {sg.hv}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Cột Phải: Dịch Thơ Đoán Quẻ */}
                            {dichTho && (
                              <div className="p-3 rounded-xl bg-gradient-to-br from-[#2E1A0F] to-[#1F110A] border border-[#8B6220]/60 shadow-inner flex flex-col justify-center">
                                <div className="text-[10px] font-serif uppercase tracking-widest text-[#F3D787] font-bold mb-1.5 flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5 text-[#F3D787]" />
                                  <span>Dịch Thơ Đoán Quẻ:</span>
                                </div>
                                <div className="text-sm sm:text-base font-serif font-bold italic text-[#FFF3D1] whitespace-pre-line leading-relaxed pl-2.5 border-l-2 border-[#E5C168]">
                                  {dichTho}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Giải nghĩa từng câu thơ gọn bên dưới */}
                          {poemSegs.some((sg) => sg.vi) && (
                            <div className="p-3 rounded-xl bg-[#140B07] border border-[#331F12] space-y-1">
                              <div className="text-[10px] font-serif uppercase tracking-wider text-[#D4B475] font-bold">
                                Giải Nghĩa Thơ Đoán:
                              </div>
                              <div className="space-y-1 text-xs font-serif text-[#C8B69E] leading-relaxed">
                                {poemSegs.map(
                                  (sg, idx) =>
                                    sg.vi && (
                                      <div key={idx}>
                                        <span className="font-bold text-[#E5C168]">{sg.han}</span>{" "}
                                        <span>{sg.vi}</span>
                                      </div>
                                    )
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 4. Chú thích nếu có */}
                        {allNotes.length > 0 && (
                          <div className="p-3 rounded-2xl bg-[#150C08] border border-[#382315] space-y-1 text-xs font-serif">
                            <div className="font-bold text-[#D4B475] flex items-center gap-1">
                              <Info className="w-3.5 h-3.5 text-[#C9A55A]" />
                              <span>Chú Thích:</span>
                            </div>
                            <ul className="list-disc list-inside space-y-0.5 text-[#B8A58E] leading-relaxed">
                              {allNotes.map((n, i) => (
                                <li key={i}>{n}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              ) : null}
            </div>

            {/* ==================== CỘT 2: HÌNH & THƠ ĐOÁN CỦA NGÀY ĐÓ CỦA QUẺ ĐÓ ==================== */}
            <div className="rounded-3xl border-2 border-[#8B1E14]/80 bg-gradient-to-b from-[#23120E] via-[#190D0A] to-[#120906] shadow-2xl overflow-hidden flex flex-col">
              {/* Header Cột 2 */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-[#4A150E] via-[#33100B] to-[#210B07] border-b border-[#6E251B] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#B3281B] to-[#73150C] text-[#FCE6B4] border border-[#F3D787]/60 font-serif font-black flex flex-col items-center justify-center shrink-0 shadow">
                    <span className="text-[9px] leading-none">NGÀY</span>
                    <span className="text-base leading-tight">{activeDayStem.canHan}</span>
                  </div>
                  <div>
                    <div className="text-[10px] font-serif uppercase tracking-widest text-[#F3D787] font-bold">
                      II. HÌNH & THƠ ĐOÁN CỦA NGÀY {activeDayStem.canVi.toUpperCase()} CỦA QUẺ ĐÓ
                    </div>
                    <h4 className="text-base sm:text-lg font-serif font-black text-[#FCE6B4]">
                      {activeDayStem.titleVi} — {activeDayStem.titleHan} ({hexData.quyen.tenQue})
                    </h4>
                  </div>
                </div>

                {daySection && (
                  <span className="px-2.5 py-1 rounded-lg bg-[#160B08] border border-[#5E2219] text-[11px] font-serif text-[#F3D787] shrink-0">
                    Trang {daySection.pageNum}/1734
                  </span>
                )}
              </div>

              {/* Nội dung Cột 2 */}
              {daySection && (
                <div className="p-4 sm:p-5 space-y-4 flex-1 flex flex-col">
                  {(() => {
                    const { headerSeg, poemSegs, dichTho, blockNotes, pageNotes } =
                      extractPoemAndContent(daySection);
                    const allNotes = [...blockNotes, ...pageNotes];

                    if (displayStyle === "palace") {
                      return (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#2B1611] p-3 rounded-2xl border-2 border-[#8B3226] shadow-inner">
                            {/* Nửa Trái: Thơ chữ Hán dọc trên nền lụa */}
                            <div className="bg-[#F4EBD8] text-[#1C150E] rounded-xl p-4 border border-[#C9A55A] min-h-[340px] flex flex-row-reverse items-center justify-center gap-4 overflow-x-auto shadow">
                              <div
                                className="font-serif font-black text-lg text-[#A8281A] tracking-[0.25em] border-l border-[#C9A55A] pl-2"
                                style={{ writingMode: "vertical-rl" }}
                              >
                                {headerSeg?.han || activeDayStem.titleHan}
                              </div>
                              <div
                                className="font-serif font-bold text-xs text-[#7A542E] tracking-[0.3em]"
                                style={{ writingMode: "vertical-rl" }}
                              >
                                詩曰
                              </div>
                              <div className="flex flex-row-reverse gap-3">
                                {poemSegs.map((sg, idx) => (
                                  <div
                                    key={idx}
                                    className="font-serif font-bold text-base sm:text-lg text-[#1C150E] tracking-[0.2em] leading-relaxed"
                                    style={{ writingMode: "vertical-rl" }}
                                  >
                                    {(sg.han || "").replace(/[，。；;、：:]/g, "")}
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Nửa Phải: Tranh vẽ Cố Cung của Ngày đó */}
                            <div className="bg-[#EADBBE] rounded-xl p-2 border border-[#C9A55A] flex flex-col items-center justify-center relative group">
                              {daySection.painting ? (
                                <img
                                  src={daySection.painting}
                                  alt={daySection.title}
                                  onClick={() =>
                                    setLightboxImg({
                                      src: daySection.painting,
                                      title: daySection.title,
                                      subtitle: `${hexData.quyen.tenQue} • ${activeDayStem.titleVi} (${activeDayStem.titleHan})`,
                                      moTa: daySection.moTaTranh,
                                      poem: dichTho,
                                      mucIdx: daySection.mucIdx,
                                    })
                                  }
                                  className="w-full h-[320px] object-contain rounded-lg cursor-zoom-in transition-transform group-hover:scale-[1.02]"
                                  style={{ imageRendering: "-webkit-optimize-contrast" }}
                                />
                              ) : (
                                <div className="text-xs font-serif text-[#5C4938] p-4 text-center">
                                  {daySection.moTaTranh}
                                </div>
                              )}
                            </div>
                          </div>

                          {dichTho && (
                            <div className="p-4 rounded-2xl bg-[#1A0D0A] border border-[#6E251B]">
                              <div className="text-[10px] font-serif uppercase tracking-widest text-[#F3D787] font-bold mb-1">
                                Dịch Thơ Đoán Ngày {activeDayStem.canVi}:
                              </div>
                              <div className="text-sm sm:text-base font-serif italic text-[#FCE6B4] whitespace-pre-line leading-relaxed">
                                {dichTho}
                              </div>
                            </div>
                          )}

                          {/* Họa Cảnh Ngày Can Chi Tiết & Rõ Ràng */}
                          {daySection.moTaTranh &&
                            renderHoaCanhCard(
                              daySection,
                              `Họa Cảnh Ngày ${activeDayStem.canVi}: ${activeDayStem.titleVi}`,
                              `${hexData.quyen.tenQue} • ${activeDayStem.titleHan}`,
                              daySection.painting
                                ? () =>
                                    setLightboxImg({
                                      src: daySection.painting,
                                      title: daySection.title,
                                      subtitle: `${hexData.quyen.tenQue} • ${activeDayStem.titleVi} (${activeDayStem.titleHan})`,
                                      moTa: daySection.moTaTranh,
                                      poem: dichTho,
                                      mucIdx: daySection.mucIdx,
                                    })
                                : undefined
                            )}
                        </div>
                      );
                    }

                    return (
                      <>
                        {/* 1. Tranh màu Cố Cung của Ngày đó khổ lớn thếp vàng */}
                        {renderPalacePaintingFrame(
                          daySection,
                          `${hexData.quyen.tenQue} • ${activeDayStem.titleVi} (${activeDayStem.titleHan})`,
                          dichTho,
                          daySection.painting
                            ? () =>
                                setLightboxImg({
                                  src: daySection.painting,
                                  title: daySection.title,
                                  subtitle: `${hexData.quyen.tenQue} • ${activeDayStem.titleVi} (${activeDayStem.titleHan})`,
                                  moTa: daySection.moTaTranh,
                                  poem: dichTho,
                                  mucIdx: daySection.mucIdx,
                                })
                            : undefined
                        )}

                        {/* 2. Khối Họa Cảnh Ngày Can Chi Tiết với Huy Hiệu Tượng Hình */}
                        {daySection.moTaTranh &&
                          renderHoaCanhCard(
                            daySection,
                            `Họa Cảnh Ngày ${activeDayStem.canVi}: ${activeDayStem.titleVi}`,
                            `${hexData.quyen.tenQue} • ${activeDayStem.titleHan}`,
                            daySection.painting
                              ? () =>
                                  setLightboxImg({
                                    src: daySection.painting,
                                    title: daySection.title,
                                    subtitle: `${hexData.quyen.tenQue} • ${activeDayStem.titleVi} (${activeDayStem.titleHan})`,
                                    moTa: daySection.moTaTranh,
                                    poem: dichTho,
                                    mucIdx: daySection.mucIdx,
                                  })
                              : undefined
                          )}

                        {/* 3. Khung Thơ Đoán Ngày Gọn (Nguyên Bản Hán-Việt & Dịch Thơ Đối Xứng) */}
                        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#170C09] border border-[#5E2219] space-y-3">
                          {headerSeg && (
                            <div className="pb-2 border-b border-[#421913] flex flex-wrap items-baseline justify-between gap-2">
                              <span className="text-sm sm:text-base font-serif font-black text-[#F3D787]">
                                {headerSeg.han} — {headerSeg.hv}
                              </span>
                              <span className="text-[11px] font-serif text-[#B8A58E]">{headerSeg.vi}</span>
                            </div>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Cột Trái: Nguyên bản 4 câu Hán & Hán-Việt gọn trong 1 khung */}
                            <div className="p-3 rounded-xl bg-[#21110D] border border-[#451D16] space-y-1.5">
                              <div className="text-[10px] font-serif uppercase tracking-wider text-[#F3D787] font-bold">
                                📜 Nguyên Bản & Phiên Âm:
                              </div>
                              <div className="space-y-1">
                                {poemSegs.map((sg, idx) => (
                                  <div key={idx} className="leading-snug">
                                    <div className="text-sm sm:text-base font-serif font-bold text-[#FCE6B4] tracking-wide">
                                      {sg.han}
                                    </div>
                                    {sg.hv && (
                                      <div className="text-xs font-serif text-[#E5C168] italic">
                                        {sg.hv}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Cột Phải: Dịch Thơ Ngày */}
                            {dichTho && (
                              <div className="p-3 rounded-xl bg-gradient-to-br from-[#38160F] to-[#210D09] border border-[#A8382B]/60 shadow-inner flex flex-col justify-center">
                                <div className="text-[10px] font-serif uppercase tracking-widest text-[#F3D787] font-bold mb-1.5 flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5 text-[#F3D787]" />
                                  <span>Dịch Thơ Ngày {activeDayStem.canVi}:</span>
                                </div>
                                <div className="text-sm sm:text-base font-serif font-bold italic text-[#FFF3D1] whitespace-pre-line leading-relaxed pl-2.5 border-l-2 border-[#F3D787]">
                                  {dichTho}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Giải nghĩa từng câu thơ gọn bên dưới */}
                          {poemSegs.some((sg) => sg.vi) && (
                            <div className="p-3 rounded-xl bg-[#140907] border border-[#3B1712] space-y-1">
                              <div className="text-[10px] font-serif uppercase tracking-wider text-[#F3D787] font-bold">
                                Giải Nghĩa Thơ Ngày {activeDayStem.canVi}:
                              </div>
                              <div className="space-y-1 text-xs font-serif text-[#C8B69E] leading-relaxed">
                                {poemSegs.map(
                                  (sg, idx) =>
                                    sg.vi && (
                                      <div key={idx}>
                                        <span className="font-bold text-[#F3D787]">{sg.han}</span>{" "}
                                        <span>{sg.vi}</span>
                                      </div>
                                    )
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 4. Chú thích nếu có */}
                        {allNotes.length > 0 && (
                          <div className="p-3 rounded-2xl bg-[#150A08] border border-[#421913] space-y-1 text-xs font-serif">
                            <div className="font-bold text-[#F3D787] flex items-center gap-1">
                              <Info className="w-3.5 h-3.5 text-[#F3D787]" />
                              <span>Chú Thích:</span>
                            </div>
                            <ul className="list-disc list-inside space-y-0.5 text-[#B8A58E] leading-relaxed">
                              {allNotes.map((n, i) => (
                                <li key={i}>{n}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        )}

          {/* ==================== PHẦN III: TỔNG QUAN BẢN QUẺ (NẠP GIÁP · THI ĐOÁN CHUNG · CHIẾT TỰ) & CHIÊM PHONG THỦY / SỰ VỤ ==================== */}
          <div className="rounded-3xl border border-[#5C3D22] bg-gradient-to-b from-[#1F130C] via-[#160D09] to-[#110A06] p-5 sm:p-6 shadow-xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#382315] pb-4">
              <div>
                <div className="text-[10px] font-serif uppercase tracking-widest text-[#C9A55A] font-bold">
                  III. TỔNG QUAN QUYỂN {hexData.quyenSo}/64 — {hexData.quyen.cungTen.toUpperCase()}
                </div>
                <h3 className="text-lg sm:text-xl font-serif font-black text-[#FCE6B4]">
                  {hexData.quyen.quaiTuong} {hexData.quyen.tenQue} ({hexData.quyen.chuHan}) — Nạp Giáp · Thi Đoán Bản Quẻ · Chiết Tự & Chiêm Sự Vụ
                </h3>
              </div>

              {/* Tabs chọn xem trong Quyển */}
              <div className="flex flex-wrap items-center gap-1.5 bg-[#120A06] p-1.5 rounded-2xl border border-[#382315]">
                <button
                  type="button"
                  onClick={() => setExtraTab("nap_giap")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    extraTab === "nap_giap"
                      ? "bg-gradient-to-r from-[#C9A55A] to-[#A37B2C] text-black shadow"
                      : "text-[#A8947B] hover:text-white"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Nạp Giáp · Thi Đoán · Chiết Tự</span>
                </button>
                <button
                  type="button"
                  onClick={() => setExtraTab("phong_thuy")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    extraTab === "phong_thuy"
                      ? "bg-gradient-to-r from-[#C9A55A] to-[#A37B2C] text-black shadow"
                      : "text-[#A8947B] hover:text-white"
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Chiêm Phong Thủy (占風水)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setExtraTab("su_vu_1")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    extraTab === "su_vu_1"
                      ? "bg-gradient-to-r from-[#C9A55A] to-[#A37B2C] text-black shadow"
                      : "text-[#A8947B] hover:text-white"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Chiêm Sự Vụ (Phần 1)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setExtraTab("su_vu_2")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    extraTab === "su_vu_2"
                      ? "bg-gradient-to-r from-[#C9A55A] to-[#A37B2C] text-black shadow"
                      : "text-[#A8947B] hover:text-white"
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Chiêm Sự Vụ (Phần 2) & Lục Hào</span>
                </button>
              </div>
            </div>

            {/* TAB 1: NẠP GIÁP · THI ĐOÁN TỔNG QUÁT · CHIẾT TỰ (MUC 2) */}
            {extraTab === "nap_giap" && overviewParsed && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Bảng Lục Hào Nạp Giáp Kinh Phòng (6/12) */}
                <div className="lg:col-span-6 p-4 rounded-2xl bg-[#160D08] border border-[#422918] space-y-3">
                  {(() => {
                    const cungVi =
                      CUNG_HAN_VI_MAP[hexData.quyen.cungHan] ||
                      hexData.quyen.cungTen.split("(")[0].trim();
                    const hanhVi = NGU_HANH_VI_MAP[hexData.cungElem] || hexData.cungElem;
                    return (
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#331F12] pb-2">
                        <span className="text-xs font-serif font-bold uppercase tracking-wider text-[#F3D787]">
                          Đồ Hình Lục Hào Nạp Giáp ({cungVi} {hexData.quyen.cungHan} — Hành {hanhVi} {hexData.cungElem})
                        </span>
                        <span className="text-[11px] font-serif text-[#A8947B]">
                          Trang {overviewSection?.pageNum}/1734
                        </span>
                      </div>
                    );
                  })()}

                  <div className="space-y-2 overflow-x-auto">
                    {hexData.haoRows.map((row) => {
                      const highlighted = isHaoHighlightedByDice(row.hao, row.isThe, row.isUng);
                      const hasRedDot = isHaoRedDotByDice(row.hao);
                      const lucThanVi = LUC_THAN_VI_MAP[row.lucThan] || row.lucThan;
                      const canChiVi = translateCanChiNguHanh(row.canChi);
                      const canChiHanOnly = stripNguHanhFromCanChiHan(row.canChi);
                      return (
                        <div
                          key={row.hao}
                          onClick={() =>
                            handleSelectDiceFace(diceValue === row.hao ? row.hao + 6 : row.hao)
                          }
                          title={`Bấm để xem Hào ${row.hao} (1–6) hoặc Hào ${row.hao + 6} (Chấm đỏ Hào ${row.hao})`}
                          className={`p-2.5 rounded-xl border grid grid-cols-[46px_114px_18px_76px_48px_1fr] sm:grid-cols-[50px_126px_20px_92px_54px_1fr] items-center gap-1.5 sm:gap-2 cursor-pointer transition-all min-w-[430px] ${
                            highlighted
                              ? "bg-gradient-to-r from-[#59180E] to-[#36110A] border-[#F3D787] shadow-[0_0_12px_rgba(243,215,135,0.25)]"
                              : "bg-[#1E120B] border-[#331F12] hover:border-[#6E4726]"
                          }`}
                        >
                          {/* Cột 1: Thứ tự Hào */}
                          <span className="text-[11px] font-serif font-bold text-[#D4B475] whitespace-nowrap">
                            Hào {row.hao}
                          </span>

                          {/* Cột 2: Lục Thân (Hán + Việt) */}
                          <span className="text-xs font-serif font-bold text-[#FCE6B4] whitespace-nowrap">
                            {row.lucThan} ({lucThanVi})
                          </span>

                          {/* Cột 3: Chấm đỏ ở bên trái của hào (khi từ hào 7..12 ứng với hào 1..6) */}
                          <div className="flex items-center justify-end">
                            {hasRedDot && (
                              <span
                                title={`Hào ${diceValue}: 1 chấm đỏ bên trái Hào ${row.hao}`}
                                className="w-3 h-3 rounded-full bg-red-600 border border-red-200 shadow-[0_0_8px_rgba(239,68,68,1)] shrink-0"
                              />
                            )}
                          </div>

                          {/* Cột 4: Vạch hào Âm / Dương — Cố định tọa độ thẳng tắp 6 hào */}
                          <div className="w-full flex items-center justify-center">
                            {row.isYang ? (
                              <div className="w-full h-2.5 rounded-sm bg-gradient-to-r from-[#C9A55A] via-[#F3D787] to-[#C9A55A] shadow-xs" />
                            ) : (
                              <div className="w-full flex items-center justify-between">
                                <div className="w-[43%] h-2.5 rounded-sm bg-gradient-to-r from-[#C9A55A] to-[#F3D787] shadow-xs" />
                                <div className="w-[43%] h-2.5 rounded-sm bg-gradient-to-r from-[#F3D787] to-[#C9A55A] shadow-xs" />
                              </div>
                            )}
                          </div>

                          {/* Cột 5: Thế / Ứng — Bên phải của hào */}
                          <div className="flex items-center justify-center">
                            {row.isThe && (
                              <span className="px-1.5 py-0.5 rounded bg-red-700 text-white text-[10px] font-serif font-black whitespace-nowrap shadow-xs">
                                世 Thế
                              </span>
                            )}
                            {row.isUng && (
                              <span className="px-1.5 py-0.5 rounded bg-blue-700 text-blue-50 text-[10px] font-serif font-black whitespace-nowrap shadow-xs">
                                應 Ứng
                              </span>
                            )}
                          </div>

                          {/* Cột 5: Can Chi (Chỉ hiện Can Chi, không kèm Ngũ Hành) */}
                          <div className="text-right whitespace-nowrap">
                            <span className="text-xs font-serif font-bold text-[#FCE6B4]">
                              {canChiVi}
                            </span>
                            <span className="ml-1.5 text-[11px] font-serif font-semibold text-[#C9A55A]">
                              ({canChiHanOnly})
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Thông tin Phi thần / Phục thần / Nguyệt quái từ doan0 (đã lọc bỏ 6 dòng hào trùng lặp) */}
                  {overviewParsed.infoDoan.length > 0 && (
                    <div className="pt-2 border-t border-[#331F12] space-y-1">
                      {overviewParsed.infoDoan.map((sg, i) => (
                        <div key={i} className="text-[11px] font-serif text-[#B8A58E] flex flex-wrap gap-1.5">
                          <span className="font-bold text-[#E5C168]">{sg.han}:</span>
                          <span>{sg.vi}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Thơ Đoán Tổng Quát 8 Câu Của Bản Quẻ + Chiết Tự (6/12) */}
                <div className="lg:col-span-6 space-y-4">
                  {/* Thơ đoán tổng quát 8 câu trình bày gọn */}
                  <div className="p-4 rounded-2xl bg-[#160D08] border border-[#422918] space-y-3">
                    <div className="text-xs font-serif font-bold uppercase tracking-wider text-[#F3D787]">
                      📜 Thi Đoán Tổng Quát Của Quẻ {hexData.quyen.tenQue} ({hexData.quyen.chuHan}):
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-[#21140D] border border-[#362214] space-y-1">
                        <div className="text-[10px] font-serif uppercase tracking-wider text-[#C9A55A] font-bold">
                          Nguyên Bản & Phiên Âm (8 Câu):
                        </div>
                        {overviewParsed.poemSegs.map((sg, i) => (
                          <div key={i} className="leading-snug">
                            <div className="text-xs sm:text-sm font-serif font-bold text-[#FCE6B4]">{sg.han}</div>
                            {sg.hv && <div className="text-[11px] font-serif text-[#E5C168] italic">{sg.hv}</div>}
                          </div>
                        ))}
                      </div>

                      {overviewParsed.dichTho && (
                        <div className="p-3 rounded-xl bg-[#26160D] border border-[#6E4726] flex flex-col justify-center">
                          <div className="text-[10px] font-serif uppercase tracking-widest text-[#F3D787] font-bold mb-1">
                            Dịch Thơ Bản Quẻ (8 Câu):
                          </div>
                          <div className="text-xs sm:text-sm font-serif italic text-[#FFF3D1] whitespace-pre-line leading-relaxed pl-2 border-l-2 border-[#E5C168]">
                            {overviewParsed.dichTho}
                          </div>
                        </div>
                      )}
                    </div>

                    {overviewParsed.poemSegs.some((sg) => sg.vi) && (
                      <div className="p-3 rounded-xl bg-[#140B07] border border-[#331F12] space-y-1">
                        <div className="text-[10px] font-serif uppercase tracking-wider text-[#D4B475] font-bold">
                          Giải Nghĩa Từng Câu:
                        </div>
                        <div className="space-y-1 text-[11px] font-serif text-[#B8A58E] leading-relaxed">
                          {overviewParsed.poemSegs.map(
                            (sg, i) =>
                              sg.vi && (
                                <div key={i}>
                                  <span className="font-bold text-[#E5C168]">{sg.han}</span>{" "}
                                  <span>{sg.vi}</span>
                                </div>
                              )
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Chiết tự (Phân tích chữ Hán tên quẻ) */}
                  {overviewParsed.chietSegs.length > 0 && (
                    <div className="p-4 rounded-2xl bg-[#160D08] border border-[#422918] space-y-2.5">
                      <div className="text-xs font-serif font-bold uppercase tracking-wider text-[#F3D787]">
                        🔍 Chiết Tự (拆字 — Phân Tích Tự Hình Chữ «{hexData.quyen.chuHan}»):
                      </div>
                      <div className="space-y-1.5">
                        {overviewParsed.chietSegs.map((sg, i) => (
                          <div key={i} className="text-xs font-serif text-[#D4C3AA] leading-relaxed">
                            <span className="font-bold text-[#FCE6B4]">{sg.han}</span>{" "}
                            <span className="italic text-[#E5C168]">({sg.hv})</span> — {sg.vi}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2, 3, 4: CHIÊM PHONG THỦY (MUC 25) & CHIÊM SỰ VỤ (MUC 26, 27) */}
            {(extraTab === "phong_thuy" || extraTab === "su_vu_1" || extraTab === "su_vu_2") && (
              <div>
                {(() => {
                  const targetMuc =
                    extraTab === "phong_thuy" ? 25 : extraTab === "su_vu_1" ? 26 : 27;
                  const sec = hexData.sections[targetMuc];
                  if (!sec) return null;

                  return (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs font-serif text-[#D4B475]">
                        <span className="font-bold text-sm text-[#FCE6B4]">{sec.title}</span>
                        <span>Trang {sec.pageNum}/1734</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sec.blocks.map((b, bIdx) => (
                          <div
                            key={bIdx}
                            className="p-4 rounded-2xl bg-[#160D08] border border-[#422918] space-y-2.5"
                          >
                            {b.viTri && (
                              <div className="text-xs font-serif font-bold uppercase tracking-wider text-[#E5C168] border-b border-[#331F12] pb-1.5">
                                {b.viTri}
                              </div>
                            )}
                            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                              {(b.doan || []).map((sg, sIdx) => (
                                <div
                                  key={sIdx}
                                  className="p-2.5 rounded-xl bg-[#21140D] border border-[#331F12] space-y-0.5"
                                >
                                  <div className="text-sm font-serif font-bold text-[#FCE6B4]">{sg.han}</div>
                                  <div className="text-xs font-serif text-[#E5C168] italic">{sg.hv}</div>
                                  <div className="text-xs font-serif text-[#C8B69E]">{sg.vi}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {sec.notes?.length > 0 && (
                        <div className="p-3.5 rounded-2xl bg-[#150C08] border border-[#382315] space-y-1">
                          <div className="text-xs font-serif font-bold text-[#D4B475]">Ghi chú:</div>
                          <ul className="list-disc list-inside text-xs font-serif text-[#B8A58E] space-y-1">
                            {sec.notes.map((n, idx) => (
                              <li key={idx}>{n}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* LIGHTBOX PHÓNG TO TRANH CỐ CUNG */}
      {lightboxImg && (() => {
        const curLbIdx = allHoaCanhItems.findIndex((it) => it.mucIdx === lightboxImg.mucIdx);
        const hasPrev = curLbIdx > 0;
        const hasNext = curLbIdx >= 0 && curLbIdx < allHoaCanhItems.length - 1;

        const handlePrev = () => {
          if (!hasPrev) return;
          const prev = allHoaCanhItems[curLbIdx - 1];
          const parsed = extractPoemAndContent(prev.section);
          setLightboxImg({
            src: prev.section.painting,
            title: prev.section.title,
            subtitle: `${hexData?.quyen.tenQue} • ${prev.titleVi} (${prev.titleHan})`,
            moTa: prev.section.moTaTranh,
            poem: parsed.dichTho,
            mucIdx: prev.mucIdx,
          });
        };

        const handleNext = () => {
          if (!hasNext) return;
          const next = allHoaCanhItems[curLbIdx + 1];
          const parsed = extractPoemAndContent(next.section);
          setLightboxImg({
            src: next.section.painting,
            title: next.section.title,
            subtitle: `${hexData?.quyen.tenQue} • ${next.titleVi} (${next.titleHan})`,
            moTa: next.section.moTaTranh,
            poem: parsed.dichTho,
            mucIdx: next.mucIdx,
          });
        };

        return (
          <div
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-5"
            onClick={() => setLightboxImg(null)}
          >
            <div
              className="max-w-5xl w-full bg-[#1A0E08] border-2 border-[#C9A55A] rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.95)] flex flex-col max-h-[92vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Modal */}
              <div className="p-4 bg-gradient-to-r from-[#2E180E] via-[#23120A] to-[#160A05] border-b border-[#4A2E1B] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E5C168] to-[#996515] text-black font-bold flex items-center justify-center shadow shrink-0">
                    🖼️
                  </div>
                  <div>
                    <div className="text-xs font-serif text-[#E5C168] flex items-center gap-2">
                      <span>{lightboxImg.subtitle}</span>
                      {curLbIdx >= 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-[#3D2012] border border-[#8C5E28] text-[10px] text-[#F3D787] font-bold">
                          Bức #{curLbIdx + 1}/22
                        </span>
                      )}
                    </div>
                    <h4 className="text-base sm:text-lg font-serif font-bold text-[#FCE6B4] truncate">
                      {lightboxImg.title}
                    </h4>
                  </div>
                </div>

                {/* Điều hướng Trước / Sau, Vẽ Lại HD & Nút Đóng */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {lightboxImg.mucIdx !== undefined && hexData?.sections[lightboxImg.mucIdx] && (
                    <button
                      type="button"
                      disabled={redrawingMucIdx !== null || isBatchRedrawing}
                      onClick={() =>
                        handleRedrawPainting(
                          hexData.sections[lightboxImg.mucIdx!],
                          lightboxImg.poem
                        )
                      }
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#8B1E14] to-[#B3281B] hover:brightness-110 border border-[#E5C168]/70 text-[#FCE6B4] text-xs font-serif font-bold flex items-center gap-1.5 shadow cursor-pointer transition-all disabled:opacity-50 mr-1"
                    >
                      {redrawingMucIdx === lightboxImg.mucIdx ? (
                        <RefreshCw className="w-3.5 h-3.5 text-[#F3D787] animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-[#F3D787]" />
                      )}
                      <span className="hidden sm:inline">
                        {redrawingMucIdx === lightboxImg.mucIdx
                          ? "Đang Vẽ HD..."
                          : "Vẽ Lại Công Bút HD"}
                      </span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={!hasPrev}
                    title="Bức trước (Mũi tên trái ←)"
                    className={`p-2 rounded-xl border transition-all cursor-pointer ${
                      hasPrev
                        ? "bg-[#28150C] hover:bg-[#3D2012] border-[#C9A55A]/50 text-[#FCE6B4]"
                        : "bg-[#160D08] border-[#2A180E] text-[#5C4533] cursor-not-allowed opacity-40"
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!hasNext}
                    title="Bức tiếp theo (Mũi tên phải →)"
                    className={`p-2 rounded-xl border transition-all cursor-pointer ${
                      hasNext
                        ? "bg-[#28150C] hover:bg-[#3D2012] border-[#C9A55A]/50 text-[#FCE6B4]"
                        : "bg-[#160D08] border-[#2A180E] text-[#5C4533] cursor-not-allowed opacity-40"
                    }`}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setLightboxImg(null)}
                    title="Đóng (Esc)"
                    className="w-9 h-9 rounded-xl bg-[#3A2316] hover:bg-[#523220] text-[#FCE6B4] flex items-center justify-center cursor-pointer ml-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Thân Modal */}
              <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-5 items-start overflow-y-auto flex-1">
                {/* Khung tranh lớn */}
                <div className="md:col-span-7 bg-[#100704] p-3 rounded-2xl border-2 border-[#C9A55A]/60 relative shadow-2xl group flex items-center justify-center min-h-[360px]">
                  {/* Nút lướt tranh mờ trên ảnh */}
                  {hasPrev && (
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/75 hover:bg-black border border-[#C9A55A] text-[#FCE6B4] flex items-center justify-center shadow-2xl cursor-pointer z-10 transition-transform hover:scale-110 active:scale-95"
                      title="Bức trước (←)"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  )}
                  {hasNext && (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/75 hover:bg-black border border-[#C9A55A] text-[#FCE6B4] flex items-center justify-center shadow-2xl cursor-pointer z-10 transition-transform hover:scale-110 active:scale-95"
                      title="Bức tiếp theo (→)"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  )}

                  <img
                    src={lightboxImg.src}
                    alt={lightboxImg.title}
                    className="w-full max-h-[64vh] object-contain mx-auto rounded-lg contrast-[1.06] saturate-[1.04]"
                    style={{ imageRendering: "-webkit-optimize-contrast" }}
                  />
                  {redrawingMucIdx !== null && redrawingMucIdx === lightboxImg.mucIdx && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2 z-20 rounded-2xl">
                      <RefreshCw className="w-9 h-9 text-[#E5C168] animate-spin" />
                      <span className="text-sm font-serif font-bold text-[#FCE6B4]">
                        Đang họa lại nét Công Bút Cố Cung HD...
                      </span>
                    </div>
                  )}
                </div>

                {/* Khối Thông Tin: Thơ & Miêu Tả Họa Cảnh Định Dạng */}
                <div className="md:col-span-5 space-y-4">
                  {lightboxImg.poem && (
                    <div className="p-4 rounded-2xl bg-[#26160D] border border-[#6E4726] shadow">
                      <div className="text-xs font-serif uppercase tracking-wider text-[#F3D787] font-bold mb-1.5 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#F3D787]" />
                        <span>Thơ Đoán:</span>
                      </div>
                      <div className="text-sm sm:text-base font-serif italic text-[#FFF3D1] whitespace-pre-line leading-relaxed pl-2.5 border-l-2 border-[#E5C168]">
                        {lightboxImg.poem}
                      </div>
                    </div>
                  )}

                  {lightboxImg.moTa && (
                    <div className="p-4 rounded-2xl bg-[#140A06] border border-[#422615] space-y-2.5 shadow">
                      <div className="flex items-center justify-between border-b border-[#2B180D] pb-2">
                        <span className="font-serif font-black text-xs uppercase tracking-wider text-[#E5C168] flex items-center gap-1.5">
                          <span>🖼️</span>
                          <span>Họa Cảnh Cố Cung Chi Tiết:</span>
                        </span>
                        <span className="text-[10px] font-serif text-[#A8947B]">Bản triều Minh 1482</span>
                      </div>
                      <div className="text-xs sm:text-sm font-serif text-[#F2E7D3] leading-relaxed space-y-2">
                        {renderFormattedHoaCanh(lightboxImg.moTa)}
                      </div>
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-[#120804] border border-[#2B180D] text-[11px] font-serif text-[#A8947B] flex items-center justify-between">
                    <span>💡 Phím tắt: <strong>←</strong> / <strong>→</strong> để lướt 22 họa cảnh</span>
                    <span><strong>Esc</strong> để đóng</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL LỜI TỰA NGỰ CHẾ (1482), TƯỢNG QUỶ CỐC TỬ & VĂN KHẤN THẮP HƯƠNG (CHÚC HƯƠNG VĂN) */}
      {showIntroModal && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowIntroModal(false)}
        >
          <div
            className="max-w-4xl w-full bg-[#1C110B] border-2 border-[#C9A55A] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[88vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-5 bg-gradient-to-r from-[#382011] to-[#24140B] border-b border-[#5C3D22] flex items-center justify-between">
              <div>
                <div className="text-[11px] font-serif uppercase tracking-widest text-[#E5C168] font-bold">
                  QUYỂN ĐẦU TIÊN • NGỰ CHẾ TÂN TẬP ĐOÁN DỊCH TINH TÚY (1482)
                </div>
                <h3 className="text-base sm:text-xl font-serif font-black text-[#FCE6B4]">
                  Lời Tựa Hoàng Đế Minh Hiến Tông · Tượng Quỷ Cốc Tử · Chúc Hương Văn
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIntroModal(false)}
                className="w-9 h-9 rounded-xl bg-[#3A2316] hover:bg-[#523220] text-[#FCE6B4] flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {introLoading || !introData ? (
              <div className="p-12 text-center text-[#FCE6B4] font-serif">
                Đang tải Lời Tựa Ngự Chế...
              </div>
            ) : (
              <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
                <div className="flex flex-wrap gap-1.5">
                  {introData.introPages.map((pg, idx) => (
                    <button
                      key={pg.pageNum}
                      type="button"
                      onClick={() => setActiveIntroPageIdx(idx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer border ${
                        activeIntroPageIdx === idx
                          ? "bg-[#C9A55A] text-black border-[#FCE6B4]"
                          : "bg-[#160D08] text-[#C8B69E] border-[#3E2718] hover:border-[#7A542E]"
                      }`}
                    >
                      {idx + 1}. {pg.title.replace("Ngự chế Tân tập Đoán Dịch Tinh túy — ", "")}
                    </button>
                  ))}
                </div>

                {(() => {
                  const curPg = introData.introPages[activeIntroPageIdx] || introData.introPages[0];
                  if (!curPg) return null;

                  return (
                    <div className="space-y-4">
                      {curPg.painting && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#140B07] p-3 rounded-2xl border border-[#5C3D22]">
                          <img
                            src={curPg.painting}
                            alt={curPg.title}
                            className="w-full max-h-[300px] object-contain mx-auto rounded-xl"
                            style={{ imageRendering: "-webkit-optimize-contrast" }}
                          />
                          {curPg.paintingLeft ? (
                            <img
                              src={curPg.paintingLeft}
                              alt={curPg.title}
                              className="w-full max-h-[300px] object-contain mx-auto rounded-xl"
                              style={{ imageRendering: "-webkit-optimize-contrast" }}
                            />
                          ) : (
                            curPg.moTaTranh && (
                              <div className="p-3 text-xs sm:text-sm font-serif text-[#F2E7D3] leading-relaxed space-y-1.5 flex flex-col justify-center">
                                <div className="text-[#E5C168] font-bold text-xs uppercase tracking-wider">
                                  🖼️ Miêu tả họa cảnh:
                                </div>
                                <div>{renderFormattedHoaCanh(curPg.moTaTranh)}</div>
                              </div>
                            )
                          )}
                        </div>
                      )}

                      <div className="space-y-3">
                        {curPg.blocks.map((b, bIdx) => (
                          <div
                            key={bIdx}
                            className="p-4 rounded-2xl bg-[#160D08] border border-[#3E2718] space-y-2"
                          >
                            {b.viTri && (
                              <div className="text-xs font-serif font-bold text-[#E5C168]">
                                {b.viTri}
                              </div>
                            )}
                            {(b.doan || []).map((sg, sIdx) => (
                              <div
                                key={sIdx}
                                className="p-2.5 rounded-xl bg-[#21140D] border border-[#331F12] space-y-0.5"
                              >
                                <div className="text-sm font-serif font-bold text-[#FCE6B4]">{sg.han}</div>
                                <div className="text-xs font-serif text-[#E5C168] italic">{sg.hv}</div>
                                <div className="text-xs font-serif text-[#C8B69E]">{sg.vi}</div>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
