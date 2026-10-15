import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  PlayCircle,
  ChevronDown,
  ArrowUpDown,
  Zap,
  Sparkles,
  Layers,
  XCircle,
  PlusCircle,
  Gem,
  ArrowDown,
  Link2,
  ShieldCheck,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Flame,
  Save,
  Camera,
  Download,
  RotateCcw,
  Move,
  ArrowRight,
  ArrowLeft,
  ArrowLeftRight,
  Trash2,
  Check,
  X,
  Plus,
  MousePointerClick,
  Eye,
  EyeOff,
  Network,
  Edit3,
  GripVertical,
  BookOpen,
  Sun,
  Dices,
} from "lucide-react";
import { PillarItem, CHI_MAP, CAN_MAP, CAN_LIST, CHI_LIST } from "../data/baziConstants";
import { SIXTY_JIAZI, JiaziEnrichedEntry } from "../data/jiazi";
import { getAllJiaziImages, subscribeJiaziImageChanges } from "../services/jiaziImageStore";
import {
  LUC_NHAM_THIEN_TUONG_12_CUNG_DATA,
  LucNhamThienTuongDetail,
  LucNhamThienTuongCungVi,
} from "../data/lucnhamThienTuong12Cung";
import {
  TAM_AN_PHU_EXACT_DATA,
  getTamAnPhuExactEntry,
} from "../data/lucnhamTamAnPhuExact";
import { getLucNhamNobleBranches } from "./JiaziD12Dice";
import {
  BaziTwoTierCard,
  TwoTierZone,
  TwoTierCardSize,
  TWO_TIER_CARD_SIZE_CONFIG,
  BaziTwoTierSizeSelector,
} from "./BaziTwoTierCard";
import { BaziTwoTierDropZone } from "./BaziTwoTierDropZone";

export interface ThucThiArrowLink {
  id: string;
  fromKey: string; // e.g. "luunien-can", "daivan-chi", "thoi-can", v.v.
  toKey: string;
  label: string; // e.g. "Hợp", "Xung", "Sinh", "Khắc", "Hình", v.v.
  direction: "forward" | "backward" | "both" | "none"; // ➔, ⬅, ⟷, ──
  color?: string;
  note?: string;
  badgeOffset?: { x: number; y: number }; // Độ lệch di chuyển ghi chú / huy hiệu
  curveOffset?: { x: number; y: number }; // Độ lệch điểm uốn cong của đường dẫn
  startOffset?: { x: number; y: number }; // Độ lệch điểm bắt đầu mũi tên
  endOffset?: { x: number; y: number }; // Độ lệch điểm kết thúc mũi tên
}

export interface ThucThiSettings {
  selectedYear?: number;
  branchRatings?: Record<string, ThucThiBranchRating | null>;
  isOpen?: boolean;
  selectedNodes?: string[];
  arrows?: ThucThiArrowLink[];
  twoTierSelectedNodes?: string[];
  twoTierArrows?: ThucThiArrowLink[];
}

export interface BaziThucThiThienProps {
  pillars?: [PillarItem, PillarItem, PillarItem, PillarItem]; // [0]: Giờ, [1]: Ngày, [2]: Tháng, [3]: Năm
  activeDaiVan?: {
    can: string;
    chi: string;
    fullName?: string;
    step?: number;
    ageStart?: number;
    ageEnd?: number;
    yearStart?: number;
    yearEnd?: number;
  } | null;
  activeLuuNien?: {
    year: number;
    can: string;
    chi: string;
    fullName?: string;
    age?: number;
  } | null;
  className?: string;
  savedSettings?: ThucThiSettings;
  onSaveToBazi?: (settings: ThucThiSettings) => void;
  onCapture?: () => void;
  onDownload?: () => void;
  title?: string;
  badgeLabel?: string;
  subTitle?: string;
  saveButtonText?: string;
  captureButtonText?: string;
  downloadButtonText?: string;
  storageKeyPrefix?: string;
  onSelectJiazi?: (jiaziId: string) => void;
  // Bổ sung hỗ trợ đồng bộ Thiên Bàn Lục Nhâm vào 12 dòng Lục Hợp - Thiên Tướng - Tâm Ấn Phú
  activeThoiBranch?: string;
  nguyetTuongBranch?: string;
}

// 12 Địa Chi theo thứ tự chuẩn
const TWELVE_BRANCHES = [
  "Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ",
  "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"
];

// Định nghĩa Lục Hợp
const LUC_HOP_MAP: Record<string, string> = {
  Tý: "Sửu", Sửu: "Tý",
  Dần: "Hợi", Hợi: "Dần",
  Mão: "Tuất", Tuất: "Mão",
  Thìn: "Dậu", Dậu: "Thìn",
  Tỵ: "Thân", Thân: "Tỵ",
  Ngọ: "Mùi", Mùi: "Ngọ",
};

const GENERAL_COLOR_MAP: Record<string, string> = {
  "Quý Nhân": "text-amber-300",
  "Đằng Xà": "text-orange-400",
  "Chu Tước": "text-rose-400",
  "Lục Hợp": "text-emerald-300",
  "Câu Trần": "text-yellow-400",
  "Câu Trận": "text-yellow-400",
  "Thanh Long": "text-teal-300",
  "Thiên Không": "text-sky-300",
  "Bạch Hổ": "text-stone-300",
  "Thái Thường": "text-amber-200",
  "Huyền Vũ": "text-indigo-300",
  "Thái Âm": "text-purple-300",
  "Thiên Hậu": "text-pink-300",
};

const CHINESE_GENERAL_MAP: Record<string, string> = {
  "Quý Nhân": "貴人",
  "Đằng Xà": "螣蛇",
  "Chu Tước": "朱雀",
  "Lục Hợp": "六合",
  "Câu Trần": "勾陳",
  "Câu Trận": "勾陳",
  "Thanh Long": "青龍",
  "Thiên Không": "天空",
  "Bạch Hổ": "白虎",
  "Thái Thường": "太常",
  "Huyền Vũ": "玄武",
  "Thái Âm": "太陰",
  "Thiên Hậu": "天后",
};

// Định nghĩa Tam Hợp
const TAM_HOP_GROUPS: { name: string; branches: string[] }[] = [
  { name: "Tam Hợp Thủy Cục", branches: ["Thân", "Tý", "Thìn"] },
  { name: "Tam Hợp Hỏa Cục", branches: ["Dần", "Ngọ", "Tuất"] },
  { name: "Tam Hợp Kim Cục", branches: ["Tỵ", "Dậu", "Sửu"] },
  { name: "Tam Hợp Mộc Cục", branches: ["Hợi", "Mão", "Mùi"] },
];

// Định nghĩa Tam Hội
const TAM_HOI_GROUPS: { name: string; branches: string[] }[] = [
  { name: "Tam Hội Bắc Phương Thủy", branches: ["Hợi", "Tý", "Sửu"] },
  { name: "Tam Hội Đông Phương Mộc", branches: ["Dần", "Mão", "Thìn"] },
  { name: "Tam Hội Nam Phương Hỏa", branches: ["Tỵ", "Ngọ", "Mùi"] },
  { name: "Tam Hội Tây Phương Kim", branches: ["Thân", "Dậu", "Tuất"] },
];

// Định nghĩa Âm Hợp (Ám Hợp)
const AM_HOP_PAIRS: [string, string, string][] = [
  ["Tý", "Tỵ", "Quý trong Tý ám hợp Mậu trong Tỵ"],
  ["Dần", "Sửu", "Giáp Bính Mậu trong Dần hợp Kỷ Tân Quý trong Sửu"],
  ["Mão", "Thân", "Ất trong Mão ám hợp Canh trong Thân"],
  ["Ngọ", "Hợi", "Đinh Kỷ trong Ngọ ám hợp Nhâm Giáp trong Hợi"],
  ["Mùi", "Thân", "Mùi Thân là Âm Hợp"],
];

// Định nghĩa Lục Xung
const LUC_XUNG_PAIRS: [string, string][] = [
  ["Tý", "Ngọ"],
  ["Sửu", "Mùi"],
  ["Dần", "Thân"],
  ["Mão", "Dậu"],
  ["Thìn", "Tuất"],
  ["Tỵ", "Hợi"],
];

// Định nghĩa Lục Hại
const LUC_HAI_PAIRS: [string, string][] = [
  ["Tý", "Mùi"],
  ["Sửu", "Ngọ"],
  ["Dần", "Tỵ"],
  ["Mão", "Thìn"],
  ["Thân", "Hợi"],
  ["Dậu", "Tuất"],
];

// Định nghĩa Tương Hình
const TUONG_HINH_PAIRS: { b1: string; b2: string; type: string; desc: string }[] = [
  { b1: "Dần", b2: "Tỵ", type: "Tam Hình", desc: "Hình Vô Ân" },
  { b1: "Tỵ", b2: "Thân", type: "Tam Hình", desc: "Hình Vô Ân" },
  { b1: "Thân", b2: "Dần", type: "Tam Hình", desc: "Hình Vô Ân" },
  { b1: "Sửu", b2: "Tuất", type: "Tam Hình", desc: "Hình Trì Thế" },
  { b1: "Tuất", b2: "Mùi", type: "Tam Hình", desc: "Hình Trì Thế" },
  { b1: "Mùi", b2: "Sửu", type: "Tam Hình", desc: "Hình Trì Thế" },
  { b1: "Tý", b2: "Mão", type: "Nhị Hình", desc: "Hình Vô Lễ" },
  { b1: "Mão", b2: "Tý", type: "Nhị Hình", desc: "Hình Vô Lễ" },
  { b1: "Thìn", b2: "Thìn", type: "Tự Hình", desc: "Tự Hình" },
  { b1: "Ngọ", b2: "Ngọ", type: "Tự Hình", desc: "Tự Hình" },
  { b1: "Dậu", b2: "Dậu", type: "Tự Hình", desc: "Tự Hình" },
  { b1: "Hợi", b2: "Hợi", type: "Tự Hình", desc: "Tự Hình" },
];

// Toàn bộ các cặp củng
interface CungRule {
  b1: string;
  b2: string;
  cungChi: string;
  groupName: string;
  type: "tam_hop" | "tam_hoi";
}

const ALL_CUNG_RULES: CungRule[] = [
  // Tam Hợp Củng
  { b1: "Thân", b2: "Tý", cungChi: "Thìn", groupName: "Tam Hợp Thủy", type: "tam_hop" },
  { b1: "Thân", b2: "Thìn", cungChi: "Tý", groupName: "Tam Hợp Thủy", type: "tam_hop" },
  { b1: "Tý", b2: "Thìn", cungChi: "Thân", groupName: "Tam Hợp Thủy", type: "tam_hop" },
  { b1: "Dần", b2: "Ngọ", cungChi: "Tuất", groupName: "Tam Hợp Hỏa", type: "tam_hop" },
  { b1: "Dần", b2: "Tuất", cungChi: "Ngọ", groupName: "Tam Hợp Hỏa", type: "tam_hop" },
  { b1: "Ngọ", b2: "Tuất", cungChi: "Dần", groupName: "Tam Hợp Hỏa", type: "tam_hop" },
  { b1: "Tỵ", b2: "Dậu", cungChi: "Sửu", groupName: "Tam Hợp Kim", type: "tam_hop" },
  { b1: "Tỵ", b2: "Sửu", cungChi: "Dậu", groupName: "Tam Hợp Kim", type: "tam_hop" },
  { b1: "Dậu", b2: "Sửu", cungChi: "Tỵ", groupName: "Tam Hợp Kim", type: "tam_hop" },
  { b1: "Hợi", b2: "Mão", cungChi: "Mùi", groupName: "Tam Hợp Mộc", type: "tam_hop" },
  { b1: "Hợi", b2: "Mùi", cungChi: "Mão", groupName: "Tam Hợp Mộc", type: "tam_hop" },
  { b1: "Mão", b2: "Mùi", cungChi: "Hợi", groupName: "Tam Hợp Mộc", type: "tam_hop" },
  // Tam Hội Củng
  { b1: "Tý", b2: "Sửu", cungChi: "Hợi", groupName: "Bắc Phương Thủy", type: "tam_hoi" },
  { b1: "Hợi", b2: "Sửu", cungChi: "Tý", groupName: "Bắc Phương Thủy", type: "tam_hoi" },
  { b1: "Hợi", b2: "Tý", cungChi: "Sửu", groupName: "Bắc Phương Thủy", type: "tam_hoi" },
  { b1: "Tỵ", b2: "Ngọ", cungChi: "Mùi", groupName: "Nam Phương Hỏa", type: "tam_hoi" },
  { b1: "Tỵ", b2: "Mùi", cungChi: "Ngọ", groupName: "Nam Phương Hỏa", type: "tam_hoi" },
  { b1: "Ngọ", b2: "Mùi", cungChi: "Tỵ", groupName: "Nam Phương Hỏa", type: "tam_hoi" },
  { b1: "Dần", b2: "Mão", cungChi: "Thìn", groupName: "Đông Phương Mộc", type: "tam_hoi" },
  { b1: "Dần", b2: "Thìn", cungChi: "Mão", groupName: "Đông Phương Mộc", type: "tam_hoi" },
  { b1: "Thân", b2: "Dậu", cungChi: "Tuất", groupName: "Tây Phương Kim", type: "tam_hoi" },
  { b1: "Thân", b2: "Tuất", cungChi: "Dậu", groupName: "Tây Phương Kim", type: "tam_hoi" },
];

export const THUC_THI_RATING_OPTIONS = ["Hỷ", "Trung Cát", "Trung", "Trung Kỵ", "Kỵ"] as const;
export type ThucThiBranchRating = (typeof THUC_THI_RATING_OPTIONS)[number];

export const BaziThucThiThien: React.FC<BaziThucThiThienProps> = ({
  pillars,
  activeDaiVan,
  activeLuuNien,
  className = "",
  savedSettings,
  onSaveToBazi,
  onCapture,
  onDownload,
  title,
  badgeLabel,
  subTitle,
  saveButtonText,
  captureButtonText,
  downloadButtonText,
  storageKeyPrefix,
  onSelectJiazi,
  activeThoiBranch: propActiveThoiBranch,
  nguyetTuongBranch: propNguyetTuongBranch,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Thứ tự hiển thị 6 cột: Mặc định "bazi" (Trụ Giờ, Trụ Ngày, Trụ Tháng, Trụ Năm, Đại Vận, Lưu Niên) như bảng Bát Tự chính
  const [columnOrder, setColumnOrder] = useState<"bazi" | "luunien_first">("bazi");

  // Xem ảnh Hoa Giáp Modal & Tải ảnh thẻ bài từ IndexedDB
  const [previewJiazi, setPreviewJiazi] = useState<JiaziEnrichedEntry | null>(null);
  const [jiaziImages, setJiaziImages] = useState<Record<string, string>>({});

  // Modal xem chi tiết Thiên Tướng Tâm Ấn Phú (Chuẩn 100% theo bảng cung cấp, không lấy bên ngoài)
  const [selectedTamAnPhuItem, setSelectedTamAnPhuItem] = useState<{
    branch: string;
    lucHopBranch: string;
    generalName: string;
    generalChinese?: string;
    generalOverview?: string;
    generalNotes?: string;
    generalColor?: string;
    tuongName: string;
    tuongChinese?: string;
    fullLine: string;
    meaning: string;
    skyBranchName: string;
    groundSittingName?: string;
  } | null>(null);

  // Xác định scope của quẻ Lục Nhâm tương ứng: "bocque" hoặc "hoagiap"
  const defaultScope = storageKeyPrefix?.includes("bocque") ? "bocque" : "hoagiap";

  // Trạng thái sao chép trực tiếp từ Bàn Lục Nhâm bên dưới (không liên quan tới bàn Bát Tự của Thực Thi Thiên)
  const [lucNhamBoardState, setLucNhamBoardState] = useState<{
    skyGeneralMap?: Record<string, { generalName: string; groundName: string }>;
    dayCan?: string;
    dayChi?: string;
    nguyetTuong?: string;
    nguyetTuongName?: string;
    nguyetTuongTerm?: string;
    activeThoi?: string;
    nobleRule?: string;
    nguyetTuongTamAn?: any;
    hoatThoiTamAn?: any;
    nhatTrucTamAn?: any;
  }>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedMap = localStorage.getItem(`lucnham_thien_ban_map_${defaultScope}`);
        let parsedMap: any = null;
        let parsedNTTamAn: any = null;
        let parsedHTTamAn: any = null;
        let parsedNTrucTamAn: any = null;
        let parsedDayChi = "Mão";
        let parsedNTName = "Thần Hậu";
        let parsedNTTerm = "Đại Tuyết";
        if (savedMap) {
          const parsed = JSON.parse(savedMap);
          parsedMap = parsed.skyGeneralMap;
          if (parsed.nguyetTuongTamAn) parsedNTTamAn = parsed.nguyetTuongTamAn;
          if (parsed.hoatThoiTamAn) parsedHTTamAn = parsed.hoatThoiTamAn;
          if (parsed.nhatTrucTamAn) parsedNTrucTamAn = parsed.nhatTrucTamAn;
          if (parsed.dayChi) parsedDayChi = parsed.dayChi;
          if (parsed.nguyetTuongName) parsedNTName = parsed.nguyetTuongName;
          if (parsed.nguyetTuongTerm) parsedNTTerm = parsed.nguyetTuongTerm;
        }

        const savedBazi = localStorage.getItem(
          defaultScope === "bocque" ? "iching_lucnham_bazi_bocque" : "iching_lucnham_bazi_hoagiap"
        );
        let baziDayCan = "Kỷ";
        let baziHourChi = "Tỵ";
        if (savedBazi) {
          const parsed = JSON.parse(savedBazi);
          if (Array.isArray(parsed) && parsed[1]?.can) baziDayCan = parsed[1].can;
          if (Array.isArray(parsed) && parsed[1]?.chi) parsedDayChi = parsed[1].chi;
          if (Array.isArray(parsed) && parsed[0]?.chi) baziHourChi = parsed[0].chi;
        }

        const savedNT = localStorage.getItem(`lucnham_nguyet_tuong_${defaultScope}`) || "Hợi";
        const savedHT = localStorage.getItem(`lucnham_hoat_thoi_${defaultScope}`) || "Tỵ";
        const savedTimeSource = localStorage.getItem(`lucnham_time_source_${defaultScope}`) || "hoatthoi";
        const savedRule = localStorage.getItem(`lucnham_noble_rule_${defaultScope}`) || "jia_yang_wu_geng_niu";

        return {
          skyGeneralMap: parsedMap,
          dayCan: baziDayCan,
          dayChi: parsedDayChi,
          nguyetTuong: savedNT,
          nguyetTuongName: parsedNTName,
          nguyetTuongTerm: parsedNTTerm,
          activeThoi: savedTimeSource === "hoatthoi" ? savedHT : baziHourChi,
          nobleRule: savedRule,
          nguyetTuongTamAn: parsedNTTamAn,
          hoatThoiTamAn: parsedHTTamAn,
          nhatTrucTamAn: parsedNTrucTamAn,
        };
      } catch {}
    }
    return {};
  });

  // Lắng nghe sự kiện bàn Lục Nhâm bên dưới thay đổi để tự động sao chép theo thời gian thực
  useEffect(() => {
    if (typeof window === "undefined") return;

    const readAndSync = () => {
      try {
        const savedMap = localStorage.getItem(`lucnham_thien_ban_map_${defaultScope}`);
        let parsedMap: any = null;
        let parsedNTTamAn: any = null;
        let parsedHTTamAn: any = null;
        let parsedNTrucTamAn: any = null;
        let parsedDayChi = "Mão";
        let parsedNTName = "Thần Hậu";
        let parsedNTTerm = "Đại Tuyết";
        if (savedMap) {
          const parsed = JSON.parse(savedMap);
          parsedMap = parsed.skyGeneralMap;
          if (parsed.nguyetTuongTamAn) parsedNTTamAn = parsed.nguyetTuongTamAn;
          if (parsed.hoatThoiTamAn) parsedHTTamAn = parsed.hoatThoiTamAn;
          if (parsed.nhatTrucTamAn) parsedNTrucTamAn = parsed.nhatTrucTamAn;
          if (parsed.dayChi) parsedDayChi = parsed.dayChi;
          if (parsed.nguyetTuongName) parsedNTName = parsed.nguyetTuongName;
          if (parsed.nguyetTuongTerm) parsedNTTerm = parsed.nguyetTuongTerm;
        }

        const savedBazi = localStorage.getItem(
          defaultScope === "bocque" ? "iching_lucnham_bazi_bocque" : "iching_lucnham_bazi_hoagiap"
        );
        let baziDayCan = "Kỷ";
        let baziHourChi = "Tỵ";
        if (savedBazi) {
          const parsed = JSON.parse(savedBazi);
          if (Array.isArray(parsed) && parsed[1]?.can) baziDayCan = parsed[1].can;
          if (Array.isArray(parsed) && parsed[1]?.chi) parsedDayChi = parsed[1].chi;
          if (Array.isArray(parsed) && parsed[0]?.chi) baziHourChi = parsed[0].chi;
        }

        const savedNT = localStorage.getItem(`lucnham_nguyet_tuong_${defaultScope}`) || "Hợi";
        const savedHT = localStorage.getItem(`lucnham_hoat_thoi_${defaultScope}`) || "Tỵ";
        const savedTimeSource = localStorage.getItem(`lucnham_time_source_${defaultScope}`) || "hoatthoi";
        const savedRule = localStorage.getItem(`lucnham_noble_rule_${defaultScope}`) || "jia_yang_wu_geng_niu";

        setLucNhamBoardState((prev) => ({
          ...prev,
          skyGeneralMap: parsedMap,
          dayCan: baziDayCan,
          dayChi: parsedDayChi,
          nguyetTuong: savedNT,
          nguyetTuongName: parsedNTName,
          nguyetTuongTerm: parsedNTTerm,
          activeThoi: savedTimeSource === "hoatthoi" ? savedHT : baziHourChi,
          nobleRule: savedRule,
          nguyetTuongTamAn: parsedNTTamAn || prev.nguyetTuongTamAn,
          hoatThoiTamAn: parsedHTTamAn || prev.hoatThoiTamAn,
          nhatTrucTamAn: parsedNTrucTamAn || prev.nhatTrucTamAn,
        }));
      } catch {}
    };

    const handleChartUpdate = (e: any) => {
      if (!e?.detail?.storageScope || e.detail.storageScope === defaultScope) {
        if (e?.detail?.skyGeneralMap) {
          setLucNhamBoardState((prev) => ({
            ...prev,
            skyGeneralMap: e.detail.skyGeneralMap,
            dayCan: e.detail.dayCan || prev.dayCan,
            dayChi: e.detail.dayChi || prev.dayChi,
            nguyetTuong: e.detail.nguyetTuong || prev.nguyetTuong,
            nguyetTuongName: e.detail.nguyetTuongName || prev.nguyetTuongName,
            nguyetTuongTerm: e.detail.nguyetTuongTerm || prev.nguyetTuongTerm,
            activeThoi: e.detail.hoatThoi || prev.activeThoi,
            nobleRule: e.detail.nobleRule || prev.nobleRule,
            nguyetTuongTamAn: e.detail.nguyetTuongTamAn || prev.nguyetTuongTamAn,
            hoatThoiTamAn: e.detail.hoatThoiTamAn || prev.hoatThoiTamAn,
            nhatTrucTamAn: e.detail.nhatTrucTamAn || prev.nhatTrucTamAn,
          }));
        } else {
          readAndSync();
        }
      }
    };

    // Thực hiện đồng bộ ngay khi mount
    readAndSync();

    window.addEventListener("lucnham-chart-updated", handleChartUpdate);
    window.addEventListener("storage", readAndSync);

    // Chu kỳ đồng bộ ngắn để chắc chắn dữ liệu luôn phản ánh mới nhất từ bàn Lục Nhâm bên dưới
    const interval = setInterval(readAndSync, 2000);

    return () => {
      clearInterval(interval);
      window.removeEventListener("lucnham-chart-updated", handleChartUpdate);
      window.removeEventListener("storage", readAndSync);
    };
  }, [defaultScope]);

  // 12 DÒNG LỤC HỢP • THIÊN TƯỚNG THIÊN BÀN • TÂM ẤN PHÚ
  // Sao chép trực tiếp 100% từ Bàn Lục Nhâm bên dưới, KHÔNG liên quan tới bàn Bát Tự của Thực Thi Thiên
  const lucNham12Lines = useMemo(() => {
    // 12 Địa Chi theo thứ tự chuẩn Dần khởi đầu:
    const orderedBranches = [
      "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi",
      "Thân", "Dậu", "Tuất", "Hợi", "Tý", "Sửu"
    ];

    const GENERAL_COLOR_MAP: Record<string, string> = {
      "Quý Nhân": "text-amber-300",
      "Đằng Xà": "text-orange-400",
      "Chu Tước": "text-rose-400",
      "Lục Hợp": "text-emerald-400",
      "Câu Trần": "text-yellow-400",
      "Câu Trận": "text-yellow-400",
      "Thanh Long": "text-cyan-400",
      "Thiên Không": "text-sky-300",
      "Bạch Hổ": "text-stone-300",
      "Thái Thường": "text-amber-200",
      "Huyền Vũ": "text-indigo-300",
      "Thái Âm": "text-purple-300",
      "Thiên Hậu": "text-pink-300",
    };

    const CHINESE_GENERAL_MAP: Record<string, string> = {
      "Quý Nhân": "貴人",
      "Đằng Xà": "螣蛇",
      "Chu Tước": "朱雀",
      "Lục Hợp": "六合",
      "Câu Trần": "勾陳",
      "Câu Trận": "勾陳",
      "Thanh Long": "青龍",
      "Thiên Không": "天空",
      "Bạch Hổ": "白虎",
      "Thái Thường": "太常",
      "Huyền Vũ": "玄武",
      "Thái Âm": "太陰",
      "Thiên Hậu": "天后",
    };

    const directMap = lucNhamBoardState.skyGeneralMap;

    // Fallback: Tính toán từ các thông số của Bàn Lục Nhâm bên dưới (không lấy từ Bát Tự Thực Thi Thiên)
    const baziDayCan = lucNhamBoardState.dayCan || "Kỷ";
    const effectiveNT = lucNhamBoardState.nguyetTuong || "Hợi";
    const effectiveHour = lucNhamBoardState.activeThoi || "Tỵ";
    const nobleRule = (lucNhamBoardState.nobleRule as any) || "jia_yang_wu_geng_niu";

    const NT_IDX = Math.max(0, TWELVE_BRANCHES.indexOf(effectiveNT));
    const H_IDX = Math.max(0, TWELVE_BRANCHES.indexOf(effectiveHour));
    const calcGroundBranch = (sIdx: number) => (H_IDX + (sIdx - NT_IDX + 12)) % 12;

    const nobleDef = getLucNhamNobleBranches(baziDayCan, nobleRule);
    const isDaytime = ["Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân"].includes(effectiveHour);
    const activeNoble = isDaytime ? nobleDef.truQuy : nobleDef.daQuy;
    const activeNobleIdx = Math.max(0, TWELVE_BRANCHES.indexOf(activeNoble));
    const nobleGroundIdx = calcGroundBranch(activeNobleIdx);
    const isShunXing = [11, 0, 1, 2, 3, 4].includes(nobleGroundIdx);

    const generalNames = [
      "Quý Nhân", "Đằng Xà", "Chu Tước", "Lục Hợp", "Câu Trần", "Thanh Long",
      "Thiên Không", "Bạch Hổ", "Thái Thường", "Huyền Vũ", "Thái Âm", "Thiên Hậu"
    ];

    const generalMapByGround: Record<number, string> = {};
    for (let k = 0; k < 12; k++) {
      const gIndex = isShunXing
        ? (nobleGroundIdx + k) % 12
        : (nobleGroundIdx - k + 12) % 12;
      generalMapByGround[gIndex] = generalNames[k];
    }

    return orderedBranches.map((branch) => {
      const lucHopBranch = LUC_HOP_MAP[branch] || "";
      const lucHopIdx = Math.max(0, TWELVE_BRANCHES.indexOf(lucHopBranch));

      let generalName = "Quý Nhân";
      let groundSittingName = "";

      // Ưu tiên 1: Copy trực tiếp từ Bàn Lục Nhâm bên dưới
      if (directMap && directMap[lucHopBranch]) {
        generalName = directMap[lucHopBranch].generalName;
        groundSittingName = directMap[lucHopBranch].groundName;
      } else {
        // Fallback: Tính theo Bát Tự Lục Nhâm bên dưới
        const groundSittingIdx = calcGroundBranch(lucHopIdx);
        groundSittingName = TWELVE_BRANCHES[groundSittingIdx];
        generalName = generalMapByGround[groundSittingIdx] || "Quý Nhân";
      }

      // Chuẩn hóa tên Thiên Tướng nếu gặp biến thể (Câu Trận -> Câu Trần)
      if (generalName === "Câu Trận") {
        generalName = "Câu Trần";
      }

      // Lấy chuẩn xác 100% từ bảng TAM_AN_PHU_EXACT_DATA do người dùng cung cấp (không lấy bên ngoài)
      const exactLookup = getTamAnPhuExactEntry(generalName, lucHopBranch);
      const exactGeneral = exactLookup?.general || TAM_AN_PHU_EXACT_DATA.find((g) => g.name === generalName || (generalName === "Câu Trận" && g.name === "Câu Trần"));
      const exactEntry = exactLookup?.entry || exactGeneral?.cungVi[lucHopBranch];

      // Đảm bảo dữ liệu chuẩn xác tuyệt đối cho Câu Trần Cư Tỵ: 'Thụ cống (受贡): cống nạp, dâng hiến tiền bạc, vật phẩm cho quan sai, miếu mạo để giải hạn, mong cầu bình an nhưng cũng dễ bị lợi dụng.'
      const isCauTranCuTy =
        (generalName === "Câu Trần" || generalName === "Câu Trận") &&
        (lucHopBranch === "Tỵ" ||
          lucHopBranch === "Tị" ||
          groundSittingName === "Tỵ" ||
          groundSittingName === "Tị" ||
          branch === "Tỵ" ||
          branch === "Tị");

      let tuongName = isCauTranCuTy ? "Thụ cống" : (exactEntry?.tuongName || "");
      if (!tuongName || tuongName.toLowerCase() === "hậu cung") {
        tuongName = (generalName === "Thiên Hậu" && lucHopBranch === "Hợi")
          ? "Thủ khuê"
          : (exactEntry?.tuongName || `${generalName} cư ${lucHopBranch}`);
      }

      const tuongChinese = isCauTranCuTy ? "受贡" : (exactEntry?.tuongChinese || "");
      const meaning = isCauTranCuTy
        ? "Cống nạp, dâng hiến tiền bạc, vật phẩm cho quan sai, miếu mạo để giải hạn, mong cầu bình an nhưng cũng dễ bị lợi dụng."
        : (exactEntry?.meaning || "");
      const fullLine = isCauTranCuTy
        ? "Cư Tỵ— Thụ cống (受贡): cống nạp, dâng hiến tiền bạc, vật phẩm cho quan sai, miếu mạo để giải hạn, mong cầu bình an nhưng cũng dễ bị lợi dụng."
        : (exactEntry?.fullLine || `Cư ${lucHopBranch}— ${tuongName}: ${meaning}`);

      return {
        branch,
        lucHopBranch,
        generalName,
        generalChinese: CHINESE_GENERAL_MAP[generalName] || "",
        generalOverview: exactGeneral?.overview || "",
        generalNotes: exactGeneral?.notes || "",
        generalColor: GENERAL_COLOR_MAP[generalName] || "text-amber-300",
        tuongName,
        tuongChinese,
        meaning,
        fullLine,
        skyBranchName: lucHopBranch, // Thiên bàn Hợi
        groundSittingName,           // Địa bàn nơi Thiên bàn Hợi ngự lên
      };
    });
  }, [lucNhamBoardState]);

  useEffect(() => {
    let isMounted = true;
    getAllJiaziImages().then((imgs) => {
      if (isMounted) setJiaziImages(imgs);
    });
    const unsub = subscribeJiaziImageChanges(() => {
      getAllJiaziImages().then((imgs) => {
        if (isMounted) setJiaziImages(imgs);
      });
    });
    return () => {
      isMounted = false;
      unsub();
    };
  }, []);

  const handleViewJiazi = (entry: JiaziEnrichedEntry) => {
    setPreviewJiazi(entry);
    if (onSelectJiazi) {
      onSelectJiazi(entry.id);
    }
  };

  // Năm khảo sát (mặc định lấy theo activeLuuNien hoặc năm 2026)
  const currentYearDefault = activeLuuNien?.year || new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYearDefault);

  // Mũi tên và đường dẫn kết nối giữa các Can Chi trong Thực Thi Thiên
  const [selectedNodes, setSelectedNodes] = useState<string[]>(savedSettings?.selectedNodes || []);
  const [arrows, setArrows] = useState<ThucThiArrowLink[]>(savedSettings?.arrows || []);
  const [showArrowCreator, setShowArrowCreator] = useState<boolean>(false);
  const [newArrowFrom, setNewArrowFrom] = useState<string>("");
  const [newArrowTo, setNewArrowTo] = useState<string>("");
  const [newArrowLabel, setNewArrowLabel] = useState<string>("Tương Tác");
  const [newArrowDirection, setNewArrowDirection] = useState<"forward" | "backward" | "both" | "none">("forward");
  const [newArrowColor, setNewArrowColor] = useState<string>("#F59E0B");
  const [showArrows, setShowArrows] = useState<boolean>(true);

  // Trạng thái kéo di chuyển (ghi chú / điểm uốn cong đường dẫn / toàn bộ đường mũi tên / điểm đầu / điểm cuối)
  const [draggingItem, setDraggingItem] = useState<{
    type: "badge" | "curve" | "arrow_line" | "endpoint_start" | "endpoint_end";
    arrowId: string;
    startX: number;
    startY: number;
    initialBadgeOffset: { x: number; y: number };
    initialCurveOffset: { x: number; y: number };
    initialStartOffset: { x: number; y: number };
    initialEndOffset: { x: number; y: number };
  } | null>(null);

  // Mũi tên đang được chỉnh sửa nội dung
  const [editingArrowId, setEditingArrowId] = useState<string | null>(null);
  const [editingArrowLabel, setEditingArrowLabel] = useState<string>("");
  const [editingArrowColor, setEditingArrowColor] = useState<string>("#F59E0B");
  const [editingArrowDirection, setEditingArrowDirection] = useState<"forward" | "backward" | "both" | "none">("forward");
  const [hoveredArrowId, setHoveredArrowId] = useState<string | null>(null);

  // Quản lý toạ độ DOM các Can Chi để vẽ SVG chính xác
  const nodeContainerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [coordsMap, setCoordsMap] = useState<Record<string, { x: number; y: number; width: number; height: number }>>({});

  // --- MŨI TÊN & ĐƯỜNG DẪN CHO PHÂN TRỤC 2 TẦNG ---
  const [twoTierSelectedNodes, setTwoTierSelectedNodes] = useState<string[]>(
    savedSettings?.twoTierSelectedNodes || []
  );
  const [twoTierArrows, setTwoTierArrows] = useState<ThucThiArrowLink[]>(
    savedSettings?.twoTierArrows || []
  );
  const [twoTierShowArrows, setTwoTierShowArrows] = useState<boolean>(true);
  const [twoTierShowArrowCreator, setTwoTierShowArrowCreator] = useState<boolean>(false);
  const [twoTierNewArrowFrom, setTwoTierNewArrowFrom] = useState<string>("");
  const [twoTierNewArrowTo, setTwoTierNewArrowTo] = useState<string>("");
  const [twoTierNewArrowLabel, setTwoTierNewArrowLabel] = useState<string>("Tương Tác");
  const [twoTierNewArrowDirection, setTwoTierNewArrowDirection] = useState<
    "forward" | "backward" | "both" | "none"
  >("forward");
  const [twoTierNewArrowColor, setTwoTierNewArrowColor] = useState<string>("#F59E0B");

  // Kéo di chuyển trong phân trục 2 tầng
  const [twoTierDraggingItem, setTwoTierDraggingItem] = useState<{
    type: "badge" | "curve" | "arrow_line" | "endpoint_start" | "endpoint_end";
    arrowId: string;
    startX: number;
    startY: number;
    initialBadgeOffset: { x: number; y: number };
    initialCurveOffset: { x: number; y: number };
    initialStartOffset: { x: number; y: number };
    initialEndOffset: { x: number; y: number };
  } | null>(null);

  const [twoTierEditingArrowId, setTwoTierEditingArrowId] = useState<string | null>(null);
  const [twoTierEditingArrowLabel, setTwoTierEditingArrowLabel] = useState<string>("");
  const [twoTierEditingArrowColor, setTwoTierEditingArrowColor] = useState<string>("#F59E0B");
  const [twoTierEditingArrowDirection, setTwoTierEditingArrowDirection] = useState<
    "forward" | "backward" | "both" | "none"
  >("forward");
  const [twoTierHoveredArrowId, setTwoTierHoveredArrowId] = useState<string | null>(null);

  // Quản lý toạ độ DOM các thẻ trong phân trục 2 tầng
  const twoTierContainerRef = useRef<HTMLDivElement>(null);
  const twoTierNodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [twoTierCoordsMap, setTwoTierCoordsMap] = useState<
    Record<string, { x: number; y: number; width: number; height: number }>
  >({});

  // Chế độ hiển thị: chỉ hiện thông tin chữ (không hiện emoji/icon) theo yêu cầu người dùng
  const [showTableEmoji, setShowTableEmoji] = useState<boolean>(false);

  // Khi mở file hoặc nạp hồ sơ: nhảy ra luôn thiết lập đã lưu
  useEffect(() => {
    if (!savedSettings) return;
    if (savedSettings.selectedYear !== undefined) setSelectedYear(savedSettings.selectedYear);
    if (savedSettings.branchRatings !== undefined) setBranchRatings(savedSettings.branchRatings);
    if (savedSettings.isOpen !== undefined) setIsOpen(savedSettings.isOpen);
    if (savedSettings.selectedNodes !== undefined) setSelectedNodes(savedSettings.selectedNodes);
    if (savedSettings.arrows !== undefined) setArrows(savedSettings.arrows);
    if (savedSettings.twoTierSelectedNodes !== undefined) setTwoTierSelectedNodes(savedSettings.twoTierSelectedNodes);
    if (savedSettings.twoTierArrows !== undefined) setTwoTierArrows(savedSettings.twoTierArrows);
  }, [savedSettings]);

  // Nạp thiết lập từ storageKeyPrefix nếu chưa có savedSettings
  useEffect(() => {
    if (savedSettings || !storageKeyPrefix) return;
    try {
      const stored = localStorage.getItem(storageKeyPrefix);
      if (stored) {
        const parsed = JSON.parse(stored) as ThucThiSettings;
        if (parsed.selectedYear !== undefined) setSelectedYear(parsed.selectedYear);
        if (parsed.branchRatings !== undefined) setBranchRatings(parsed.branchRatings);
        if (parsed.isOpen !== undefined) setIsOpen(parsed.isOpen);
        if (parsed.selectedNodes !== undefined) setSelectedNodes(parsed.selectedNodes);
        if (parsed.arrows !== undefined) setArrows(parsed.arrows);
        if (parsed.twoTierSelectedNodes !== undefined) setTwoTierSelectedNodes(parsed.twoTierSelectedNodes);
        if (parsed.twoTierArrows !== undefined) setTwoTierArrows(parsed.twoTierArrows);
      }
    } catch (e) {
      console.error("Lỗi nạp thiết lập từ bộ nhớ:", e);
    }
  }, [savedSettings, storageKeyPrefix]);

  const handleSaveSettings = () => {
    const currentSettings: ThucThiSettings = {
      selectedYear,
      branchRatings,
      isOpen,
      selectedNodes,
      arrows,
      twoTierSelectedNodes,
      twoTierArrows,
    };
    if (onSaveToBazi) {
      onSaveToBazi(currentSettings);
    }
    if (storageKeyPrefix) {
      try {
        localStorage.setItem(storageKeyPrefix, JSON.stringify(currentSettings));
        showToast(`Đã lưu thiết lập ${title || "Lưu Niên Thiên"}!`);
      } catch (err) {
        console.error("Lỗi lưu thiết lập:", err);
      }
    }
  };

  // Tính Can Chi cho năm Lưu Niên được chọn
  const luuNienInfo = useMemo(() => {
    const y = selectedYear;
    const canIdx = (((y - 4) % 10) + 10) % 10;
    const chiIdx = (((y - 4) % 12) + 12) % 12;
    const canName = CAN_LIST[canIdx].name;
    const chiName = CHI_LIST[chiIdx].name;
    const entry = SIXTY_JIAZI.find((j) => j.can === canName && j.chi === chiName);

    return {
      year: y,
      can: canName,
      chi: chiName,
      fullName: `${canName} ${chiName}`,
      chinese: entry?.chinese || "",
      napAm: entry?.elementNapAm || "",
    };
  }, [selectedYear]);

  // Chi Lưu Niên đang khảo sát
  const selectedLuuNienChi = luuNienInfo.chi;

  // Đánh giá thuộc tính: Hỷ, Trung Cát, Trung, Trung Kỵ, Kỵ
  const [branchRatings, setBranchRatings] = useState<Record<string, ThucThiBranchRating | null>>({});

  // THIÊN CAN VÀ ĐỊA CHI CỦA 4 TRỤ NGUYÊN CỤC + 1 TRỤ HÀNH VẬN (ĐẠI VẬN) + LƯU NIÊN
  const nienCan = pillars?.[3]?.can || "Ất";
  const nienChi = pillars?.[3]?.chi || "Dậu";
  const nguyetCan = pillars?.[2]?.can || "Ất";
  const nguyetChi = pillars?.[2]?.chi || "Dậu";
  const nhatCan = pillars?.[1]?.can || "Ất";
  const nhatChi = pillars?.[1]?.chi || "Dậu";
  const thoiCan = pillars?.[0]?.can || "Tân";
  const thoiChi = pillars?.[0]?.chi || "Tỵ";

  // Đại Vận Can & Chi
  const daiVanCan =
    activeDaiVan?.can ||
    (activeDaiVan?.fullName ? activeDaiVan.fullName.trim().split(" ")[0] : "Canh");
  const daiVanChi = activeDaiVan?.chi || "Thân";

  // Lưu Niên Can & Chi
  const luuNienCan = luuNienInfo.can;
  const luuNienChi = luuNienInfo.chi;

  // 6 Trụ đầy đủ Thiên Can & Địa Chi cùng nằm chung 1 hàng (Mặc định: Giờ, Ngày, Tháng, Năm, Đại Vận, Lưu Niên theo chuẩn Bát Tự chính)
  const sixPillarsInOneRow = useMemo(() => {
    const list = [
      {
        key: "thoi",
        label: "Trụ Giờ",
        subLabel: "Thời Trụ (時柱)",
        can: thoiCan,
        chi: thoiChi,
        fullName: `${thoiCan} ${thoiChi}`,
        type: "nguyen_cuc" as const,
      },
      {
        key: "nhat",
        label: "Trụ Ngày",
        subLabel: "Nhật Trụ (日柱)",
        can: nhatCan,
        chi: nhatChi,
        fullName: `${nhatCan} ${nhatChi}`,
        type: "nguyen_cuc" as const,
      },
      {
        key: "nguyet",
        label: "Trụ Tháng",
        subLabel: "Nguyệt Trụ (月柱)",
        can: nguyetCan,
        chi: nguyetChi,
        fullName: `${nguyetCan} ${nguyetChi}`,
        type: "nguyen_cuc" as const,
      },
      {
        key: "nien",
        label: "Trụ Năm",
        subLabel: "Niên Trụ (年柱)",
        can: nienCan,
        chi: nienChi,
        fullName: `${nienCan} ${nienChi}`,
        type: "nguyen_cuc" as const,
      },
      {
        key: "daivan",
        label: "Trụ Đ.Vận",
        subLabel: activeDaiVan?.step ? `Vận ${activeDaiVan.step} (${activeDaiVan.ageStart || 4}-${activeDaiVan.ageEnd || 13}t)` : "Hành Vận",
        can: daiVanCan,
        chi: daiVanChi,
        fullName: activeDaiVan?.fullName || `${daiVanCan} ${daiVanChi}`,
        type: "dai_van" as const,
      },
      {
        key: "luunien",
        label: "Trụ L.Niên",
        subLabel: `Năm ${selectedYear}`,
        can: luuNienCan,
        chi: luuNienChi,
        fullName: luuNienInfo.fullName,
        type: "luu_nien" as const,
      },
    ];

    if (columnOrder === "luunien_first") {
      return [list[5], list[4], list[0], list[1], list[2], list[3]];
    }
    return list;
  }, [
    columnOrder,
    thoiCan,
    thoiChi,
    nhatCan,
    nhatChi,
    nguyetCan,
    nguyetChi,
    nienCan,
    nienChi,
    daiVanCan,
    daiVanChi,
    activeDaiVan,
    selectedYear,
    luuNienCan,
    luuNienChi,
    luuNienInfo.fullName,
  ]);

  const chartPillars = useMemo(
    () => [
      { key: "thoi", label: "Chi Giờ", pillar: `${thoiCan} ${thoiChi} (Thời Trụ)`, chi: thoiChi, can: thoiCan },
      { key: "nhat", label: "Chi Ngày", pillar: `${nhatCan} ${nhatChi} (Nhật Trụ)`, chi: nhatChi, can: nhatCan },
      { key: "nguyet", label: "Chi Tháng", pillar: `${nguyetCan} ${nguyetChi} (Nguyệt Trụ)`, chi: nguyetChi, can: nguyetCan },
      { key: "nien", label: "Chi Năm", pillar: `${nienCan} ${nienChi} (Niên Trụ)`, chi: nienChi, can: nienCan },
      {
        key: "daivan",
        label: "Chi Đại Vận",
        pillar: activeDaiVan?.fullName ? `Hành Vận (${activeDaiVan.fullName})` : `${daiVanCan} ${daiVanChi} (Đại Vận)`,
        chi: daiVanChi,
        can: daiVanCan,
      },
    ],
    [thoiChi, nhatChi, nguyetChi, nienChi, daiVanChi, thoiCan, nhatCan, nguyetCan, nienCan, daiVanCan, activeDaiVan]
  );

  const chartChis = useMemo(() => chartPillars.map((p) => p.chi), [chartPillars]);

  // Danh sách 12 vị trí Can Chi trong hàng 6 Trụ của Thực Thi Thiên
  const allNodesList = useMemo(() => {
    return [
      { key: "luunien-can", name: "Can Lưu Niên", value: luuNienCan, pillar: "Lưu Niên", type: "can" as const },
      { key: "luunien-chi", name: "Chi Lưu Niên", value: luuNienChi, pillar: "Lưu Niên", type: "chi" as const },
      { key: "daivan-can", name: "Can Đại Vận", value: daiVanCan, pillar: "Đại Vận", type: "can" as const },
      { key: "daivan-chi", name: "Chi Đại Vận", value: daiVanChi, pillar: "Đại Vận", type: "chi" as const },
      { key: "thoi-can", name: "Can Giờ", value: thoiCan, pillar: "Trụ Giờ", type: "can" as const },
      { key: "thoi-chi", name: "Chi Giờ", value: thoiChi, pillar: "Trụ Giờ", type: "chi" as const },
      { key: "nhat-can", name: "Can Ngày", value: nhatCan, pillar: "Trụ Ngày", type: "can" as const },
      { key: "nhat-chi", name: "Chi Ngày", value: nhatChi, pillar: "Trụ Ngày", type: "chi" as const },
      { key: "nguyet-can", name: "Can Tháng", value: nguyetCan, pillar: "Trụ Tháng", type: "can" as const },
      { key: "nguyet-chi", name: "Chi Tháng", value: nguyetChi, pillar: "Trụ Tháng", type: "chi" as const },
      { key: "nien-can", name: "Can Năm", value: nienCan, pillar: "Trụ Năm", type: "can" as const },
      { key: "nien-chi", name: "Chi Năm", value: nienChi, pillar: "Trụ Năm", type: "chi" as const },
    ];
  }, [luuNienCan, luuNienChi, daiVanCan, daiVanChi, thoiCan, thoiChi, nhatCan, nhatChi, nguyetCan, nguyetChi, nienCan, nienChi]);

  const getNodeInfo = useCallback((nodeKey: string) => {
    return allNodesList.find((n) => n.key === nodeKey);
  }, [allNodesList]);

  // Hàm tự động gợi ý quan hệ phong thủy ngũ hành giữa hai Can/Chi
  const suggestRelation = useCallback((fromKey: string, toKey: string): { label: string; color: string; direction: "forward" | "backward" | "both" | "none" } => {
    const nodeFrom = allNodesList.find((n) => n.key === fromKey);
    const nodeTo = allNodesList.find((n) => n.key === toKey);
    if (!nodeFrom || !nodeTo) return { label: "Liên Kết", color: "#F59E0B", direction: "forward" };

    const valA = nodeFrom.value;
    const valB = nodeTo.value;

    // 1. Can với Can
    if (nodeFrom.type === "can" && nodeTo.type === "can") {
      const hopCanMap: Record<string, string> = {
        "Giáp": "Kỷ", "Kỷ": "Giáp",
        "Ất": "Canh", "Canh": "Ất",
        "Bính": "Tân", "Tân": "Bính",
        "Đinh": "Nhâm", "Nhâm": "Đinh",
        "Mậu": "Quý", "Quý": "Mậu",
      };
      if (hopCanMap[valA] === valB) {
        return { label: `Hợp (${valA}-${valB})`, color: "#A855F7", direction: "both" };
      }
      const xungCanMap: Record<string, string> = {
        "Giáp": "Canh", "Canh": "Giáp",
        "Ất": "Tân", "Tân": "Ất",
        "Bính": "Nhâm", "Nhâm": "Bính",
        "Đinh": "Quý", "Quý": "Đinh",
      };
      if (xungCanMap[valA] === valB) {
        return { label: `Xung (${valA}⚡${valB})`, color: "#EF4444", direction: "both" };
      }
      const elA = CAN_MAP.get(valA)?.element;
      const elB = CAN_MAP.get(valB)?.element;
      const sinhMap: Record<string, string> = { "Mộc": "Hỏa", "Hỏa": "Thổ", "Thổ": "Kim", "Kim": "Thủy", "Thủy": "Mộc" };
      if (elA && elB && sinhMap[elA] === elB) {
        return { label: `Sinh (${elA}➔${elB})`, color: "#10B981", direction: "forward" };
      }
      if (elA && elB && sinhMap[elB] === elA) {
        return { label: `Sinh (${elB}➔${elA})`, color: "#10B981", direction: "backward" };
      }
      const khacMap: Record<string, string> = { "Mộc": "Thổ", "Thổ": "Thủy", "Thủy": "Hỏa", "Hỏa": "Kim", "Kim": "Mộc" };
      if (elA && elB && khacMap[elA] === elB) {
        return { label: `Khắc (${elA}➔${elB})`, color: "#F43F5E", direction: "forward" };
      }
      if (elA && elB && khacMap[elB] === elA) {
        return { label: `Khắc (${elB}➔${elA})`, color: "#F43F5E", direction: "backward" };
      }
      if (valA === valB) {
        return { label: `Đồng Can (${valA})`, color: "#EAB308", direction: "both" };
      }
    }

    // 2. Chi với Chi
    if (nodeFrom.type === "chi" && nodeTo.type === "chi") {
      if (LUC_HOP_MAP[valA] === valB) {
        return { label: `Lục Hợp (${valA}-${valB})`, color: "#A855F7", direction: "both" };
      }
      const tamHop = TAM_HOP_GROUPS.find((g) => g.branches.includes(valA) && g.branches.includes(valB));
      if (tamHop) {
        return { label: `Tam Hợp (${valA}-${valB})`, color: "#8B5CF6", direction: "both" };
      }
      const lucXung = LUC_XUNG_PAIRS.find(([b1, b2]) => (b1 === valA && b2 === valB) || (b1 === valB && b2 === valA));
      if (lucXung) {
        return { label: `Lục Xung (${valA}⚡${valB})`, color: "#EF4444", direction: "both" };
      }
      const haiPairs: [string, string][] = [
        ["Tý", "Mùi"], ["Sửu", "Ngọ"], ["Dần", "Tỵ"], ["Mão", "Thìn"], ["Thân", "Hợi"], ["Dậu", "Tuất"]
      ];
      if (haiPairs.some(([b1, b2]) => (b1 === valA && b2 === valB) || (b1 === valB && b2 === valA))) {
        return { label: `Tương Hại (${valA}-${valB})`, color: "#EC4899", direction: "both" };
      }
      const phaPairs: [string, string][] = [
        ["Tý", "Dậu"], ["Mão", "Ngọ"], ["Dần", "Hợi"], ["Thìn", "Sửu"], ["Tỵ", "Thân"], ["Tuất", "Mùi"]
      ];
      if (phaPairs.some(([b1, b2]) => (b1 === valA && b2 === valB) || (b1 === valB && b2 === valA))) {
        return { label: `Tương Phá (${valA}-${valB})`, color: "#F97316", direction: "both" };
      }
      if (valA === valB) {
        return { label: `Chi Trùng (${valA})`, color: "#EAB308", direction: "both" };
      }
    }

    return { label: "Tương Tác", color: "#F59E0B", direction: "forward" };
  }, [allNodesList]);

  // Cập nhật vị trí toạ độ tương đối giữa các nút Can Chi trên khung
  const updateCoords = useCallback(() => {
    if (!nodeContainerRef.current) return;
    const containerRect = nodeContainerRef.current.getBoundingClientRect();
    const newCoords: Record<string, { x: number; y: number; width: number; height: number }> = {};

    Object.entries(nodeRefs.current).forEach(([k, el]) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      newCoords[k] = {
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top + rect.height / 2,
        width: rect.width,
        height: rect.height,
      };
    });
    setCoordsMap(newCoords);
  }, []);

  useEffect(() => {
    updateCoords();
    const timer = setTimeout(updateCoords, 80);
    window.addEventListener("resize", updateCoords);
    const observer = new ResizeObserver(updateCoords);
    if (nodeContainerRef.current) {
      observer.observe(nodeContainerRef.current);
    }
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateCoords);
      observer.disconnect();
    };
  }, [updateCoords, selectedYear, arrows]);

  // Gợi ý quan hệ ngũ hành khi chọn nhiều ô cùng lúc (Tam Hợp, Tam Hội, Tam Hình, Chuỗi Sinh/Khắc...)
  const suggestMultiRelation = useCallback((nodeKeys: string[]): { label: string; color: string } => {
    if (nodeKeys.length < 2) return { label: "Liên Kết", color: "#F59E0B" };
    if (nodeKeys.length === 2) {
      const sug = suggestRelation(nodeKeys[0], nodeKeys[1]);
      return { label: sug.label, color: sug.color };
    }

    const nodes = nodeKeys.map((k) => allNodesList.find((n) => n.key === k)).filter(Boolean);
    const areAllChi = nodes.every((n) => n?.type === "chi");
    const areAllCan = nodes.every((n) => n?.type === "can");

    if (areAllChi) {
      const branches = nodes.map((n) => n!.value);
      // Tam Hợp
      const tamHop = TAM_HOP_GROUPS.find((g) => g.branches.every((b) => branches.includes(b)));
      if (tamHop) {
        return { label: `${tamHop.name}`, color: "#8B5CF6" };
      }
      // Tam Hội
      const tamHoi = TAM_HOI_GROUPS.find((g) => g.branches.every((b) => branches.includes(b)));
      if (tamHoi) {
        return { label: `${tamHoi.name}`, color: "#3B82F6" };
      }
      // Tam Hình
      const danTyThan = ["Dần", "Tỵ", "Thân"];
      const suuMuiTuat = ["Sửu", "Mùi", "Tuất"];
      if (danTyThan.every((b) => branches.includes(b))) {
        return { label: "Tam Hình (Dần-Tỵ-Thân)", color: "#EF4444" };
      }
      if (suuMuiTuat.every((b) => branches.includes(b))) {
        return { label: "Tam Hình (Sửu-Mùi-Tuất)", color: "#EF4444" };
      }
      return { label: `Tổ Hợp Địa Chi (${branches.join("-")})`, color: "#F59E0B" };
    }

    if (areAllCan) {
      const stems = nodes.map((n) => n!.value);
      return { label: `Chuỗi Thiên Can (${stems.join("➔")})`, color: "#10B981" };
    }

    return { label: `Liên Kết ${nodeKeys.length} Vị Trí`, color: "#F59E0B" };
  }, [allNodesList, suggestRelation]);

  // Bấm chọn một vị trí Can hoặc Chi (hỗ trợ chọn nhiều ô liên tiếp)
  const handleToggleNode = (nodeKey: string) => {
    setSelectedNodes((prev) => {
      let next: string[];
      if (prev.includes(nodeKey)) {
        next = prev.filter((k) => k !== nodeKey);
      } else {
        next = [...prev, nodeKey];
      }

      if (next.length >= 2) {
        const sug = suggestMultiRelation(next);
        setNewArrowFrom(next[0]);
        setNewArrowTo(next[next.length - 1]);
        setNewArrowLabel(sug.label);
        setNewArrowColor(sug.color);
        setNewArrowDirection("forward");
        setShowArrowCreator(true);
      } else {
        setShowArrowCreator(false);
      }
      return next;
    });
  };

  // Thêm một mũi tên đơn lẻ
  const handleAddArrow = () => {
    if (!newArrowFrom || !newArrowTo || newArrowFrom === newArrowTo) return;
    const newArrow: ThucThiArrowLink = {
      id: `arrow-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      fromKey: newArrowFrom,
      toKey: newArrowTo,
      label: newArrowLabel.trim() || "Tương Tác",
      direction: newArrowDirection,
      color: newArrowColor,
    };
    setArrows((prev) => [...prev, newArrow]);
    setSelectedNodes([]);
    setShowArrowCreator(false);
    setTimeout(updateCoords, 50);
  };

  // KẾT NỐI NHIỀU Ô ĐỒNG THỜI (Hỗ trợ: Chuỗi tuần tự, Vòng khép kín, Mạng lưới tất cả, Hội tụ về ô cuối, Tỏa ra từ ô đầu, Cặp đầu-cuối)
  const handleConnectMultiple = (mode: "chain" | "cycle" | "all_to_all" | "to_target" | "from_source" | "first_to_last") => {
    if (selectedNodes.length < 2) return;
    const newLinks: ThucThiArrowLink[] = [];
    const color = newArrowColor || "#F59E0B";
    const label = newArrowLabel.trim() || "Tương Tác";
    const dir = newArrowDirection;

    if (mode === "chain") {
      // 1 -> 2 -> 3 -> 4...
      for (let i = 0; i < selectedNodes.length - 1; i++) {
        newLinks.push({
          id: `arrow-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
          fromKey: selectedNodes[i],
          toKey: selectedNodes[i + 1],
          label: selectedNodes.length <= 3 ? label : `${label} (${i + 1}➔${i + 2})`,
          direction: dir === "none" ? "none" : dir === "both" ? "both" : "forward",
          color: color,
        });
      }
    } else if (mode === "cycle") {
      // 1 -> 2 -> 3 -> 1 (Vòng tròn tuần hoàn / Tam Hợp / Tam Hội)
      for (let i = 0; i < selectedNodes.length; i++) {
        const nextIdx = (i + 1) % selectedNodes.length;
        newLinks.push({
          id: `arrow-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
          fromKey: selectedNodes[i],
          toKey: selectedNodes[nextIdx],
          label: selectedNodes.length <= 3 ? label : `${label} (${i + 1})`,
          direction: dir === "none" ? "none" : "forward",
          color: color,
        });
      }
    } else if (mode === "all_to_all") {
      // Mọi ô đều nối qua lại lẫn nhau (Lưới đa giác tương tác)
      let counter = 0;
      for (let i = 0; i < selectedNodes.length; i++) {
        for (let j = i + 1; j < selectedNodes.length; j++) {
          newLinks.push({
            id: `arrow-${Date.now()}-${counter++}-${Math.random().toString(36).slice(2, 6)}`,
            fromKey: selectedNodes[i],
            toKey: selectedNodes[j],
            label: label,
            direction: dir === "none" ? "none" : "both",
            color: color,
          });
        }
      }
    } else if (mode === "to_target") {
      // Tất cả hội tụ về ô cuối cùng
      const target = selectedNodes[selectedNodes.length - 1];
      for (let i = 0; i < selectedNodes.length - 1; i++) {
        newLinks.push({
          id: `arrow-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
          fromKey: selectedNodes[i],
          toKey: target,
          label: `${label} ➔ Đích`,
          direction: dir === "none" ? "none" : "forward",
          color: color,
        });
      }
    } else if (mode === "from_source") {
      // Ô đầu tiên tỏa ra tất cả các ô khác
      const source = selectedNodes[0];
      for (let i = 1; i < selectedNodes.length; i++) {
        newLinks.push({
          id: `arrow-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
          fromKey: source,
          toKey: selectedNodes[i],
          label: `${label} (Tỏa)`,
          direction: dir === "none" ? "none" : "forward",
          color: color,
        });
      }
    } else if (mode === "first_to_last") {
      // Chỉ nối ô đầu với ô cuối
      newLinks.push({
        id: `arrow-${Date.now()}-firstlast-${Math.random().toString(36).slice(2, 6)}`,
        fromKey: selectedNodes[0],
        toKey: selectedNodes[selectedNodes.length - 1],
        label: label,
        direction: dir,
        color: color,
      });
    }

    setArrows((prev) => [...prev, ...newLinks]);
    setSelectedNodes([]);
    setShowArrowCreator(false);
    setTimeout(updateCoords, 50);
  };

  // 1. Chọn nhanh toàn bộ 6 Thiên Can
  const handleSelectAllCan = () => {
    const canKeys = allNodesList.filter((n) => n.type === "can").map((n) => n.key);
    setSelectedNodes(canKeys);
    setNewArrowFrom(canKeys[0]);
    setNewArrowTo(canKeys[canKeys.length - 1]);
    setNewArrowLabel("Chuỗi 6 Thiên Can");
    setNewArrowColor("#10B981");
    setShowArrowCreator(true);
  };

  // 2. Chọn nhanh toàn bộ 6 Địa Chi
  const handleSelectAllChi = () => {
    const chiKeys = allNodesList.filter((n) => n.type === "chi").map((n) => n.key);
    setSelectedNodes(chiKeys);
    setNewArrowFrom(chiKeys[0]);
    setNewArrowTo(chiKeys[chiKeys.length - 1]);
    setNewArrowLabel("Chuỗi 6 Địa Chi");
    setNewArrowColor("#8B5CF6");
    setShowArrowCreator(true);
  };

  // 3. Chọn nhanh 4 Chi Nguyên Cục (Giờ, Ngày, Tháng, Năm)
  const handleSelectNguyenCucChi = () => {
    const ncKeys = ["thoi-chi", "nhat-chi", "nguyet-chi", "nien-chi"];
    setSelectedNodes(ncKeys);
    setNewArrowFrom(ncKeys[0]);
    setNewArrowTo(ncKeys[ncKeys.length - 1]);
    setNewArrowLabel("4 Chi Bát Tự Nguyên Cục");
    setNewArrowColor("#F59E0B");
    setShowArrowCreator(true);
  };

  // 4. Chọn nhanh nhóm Tam Hợp có mặt
  const handleSelectTamHopIfAny = () => {
    for (const g of TAM_HOP_GROUPS) {
      const matchingKeys = allNodesList
        .filter((n) => n.type === "chi" && g.branches.includes(n.value))
        .map((n) => n.key);
      if (matchingKeys.length >= 2) {
        setSelectedNodes(matchingKeys);
        setNewArrowFrom(matchingKeys[0]);
        setNewArrowTo(matchingKeys[matchingKeys.length - 1]);
        setNewArrowLabel(matchingKeys.length === 3 ? `${g.name} (Tam Hợp)` : `Bán Hợp ${g.name}`);
        setNewArrowColor("#8B5CF6");
        setShowArrowCreator(true);
        return;
      }
    }
  };

  // --- CHỈNH SỬA VÀ DI CHUYỂN MŨI TÊN / ĐƯỜNG DẪN / GHI CHÚ ---
  const handleStartEditArrow = (arrow: ThucThiArrowLink) => {
    setEditingArrowId(arrow.id);
    setEditingArrowLabel(arrow.label);
    setEditingArrowColor(arrow.color || "#F59E0B");
    setEditingArrowDirection(arrow.direction);
  };

  const handleSaveEditArrow = () => {
    if (!editingArrowId) return;
    setArrows((prev) =>
      prev.map((a) =>
        a.id === editingArrowId
          ? {
              ...a,
              label: editingArrowLabel.trim() || a.label,
              color: editingArrowColor,
              direction: editingArrowDirection,
            }
          : a
      )
    );
    setEditingArrowId(null);
  };

  const handleResetArrowOffsets = (arrowId: string) => {
    setArrows((prev) =>
      prev.map((a) =>
        a.id === arrowId
          ? {
              ...a,
              badgeOffset: { x: 0, y: 0 },
              curveOffset: { x: 0, y: 0 },
              startOffset: { x: 0, y: 0 },
              endOffset: { x: 0, y: 0 },
            }
          : a
      )
    );
  };

  const handlePointerDownBadge = (e: React.PointerEvent, arrowId: string) => {
    e.stopPropagation();
    e.preventDefault();
    const arrow = arrows.find((a) => a.id === arrowId);
    if (!arrow) return;
    setDraggingItem({
      type: "badge",
      arrowId,
      startX: e.clientX,
      startY: e.clientY,
      initialBadgeOffset: { ...(arrow.badgeOffset || { x: 0, y: 0 }) },
      initialCurveOffset: { ...(arrow.curveOffset || { x: 0, y: 0 }) },
      initialStartOffset: { ...(arrow.startOffset || { x: 0, y: 0 }) },
      initialEndOffset: { ...(arrow.endOffset || { x: 0, y: 0 }) },
    });
  };

  const handlePointerDownCurve = (e: React.PointerEvent, arrowId: string) => {
    e.stopPropagation();
    e.preventDefault();
    const arrow = arrows.find((a) => a.id === arrowId);
    if (!arrow) return;
    setDraggingItem({
      type: "curve",
      arrowId,
      startX: e.clientX,
      startY: e.clientY,
      initialBadgeOffset: { ...(arrow.badgeOffset || { x: 0, y: 0 }) },
      initialCurveOffset: { ...(arrow.curveOffset || { x: 0, y: 0 }) },
      initialStartOffset: { ...(arrow.startOffset || { x: 0, y: 0 }) },
      initialEndOffset: { ...(arrow.endOffset || { x: 0, y: 0 }) },
    });
  };

  const handlePointerDownLine = (e: React.PointerEvent, arrowId: string) => {
    e.stopPropagation();
    e.preventDefault();
    const arrow = arrows.find((a) => a.id === arrowId);
    if (!arrow) return;
    setDraggingItem({
      type: "arrow_line",
      arrowId,
      startX: e.clientX,
      startY: e.clientY,
      initialBadgeOffset: { ...(arrow.badgeOffset || { x: 0, y: 0 }) },
      initialCurveOffset: { ...(arrow.curveOffset || { x: 0, y: 0 }) },
      initialStartOffset: { ...(arrow.startOffset || { x: 0, y: 0 }) },
      initialEndOffset: { ...(arrow.endOffset || { x: 0, y: 0 }) },
    });
  };

  const handlePointerDownEndpoint = (
    e: React.PointerEvent,
    arrowId: string,
    which: "start" | "end"
  ) => {
    e.stopPropagation();
    e.preventDefault();
    const arrow = arrows.find((a) => a.id === arrowId);
    if (!arrow) return;
    setDraggingItem({
      type: which === "start" ? "endpoint_start" : "endpoint_end",
      arrowId,
      startX: e.clientX,
      startY: e.clientY,
      initialBadgeOffset: { ...(arrow.badgeOffset || { x: 0, y: 0 }) },
      initialCurveOffset: { ...(arrow.curveOffset || { x: 0, y: 0 }) },
      initialStartOffset: { ...(arrow.startOffset || { x: 0, y: 0 }) },
      initialEndOffset: { ...(arrow.endOffset || { x: 0, y: 0 }) },
    });
  };

  // Nút tinh chỉnh nhanh vị trí mũi tên / đường uốn cong / ghi chú
  const handleNudgeArrow = (
    arrowId: string,
    target: "arrow" | "curve" | "badge",
    dx: number,
    dy: number
  ) => {
    setArrows((prev) =>
      prev.map((a) => {
        if (a.id !== arrowId) return a;
        if (target === "arrow") {
          return {
            ...a,
            startOffset: { x: (a.startOffset?.x || 0) + dx, y: (a.startOffset?.y || 0) + dy },
            endOffset: { x: (a.endOffset?.x || 0) + dx, y: (a.endOffset?.y || 0) + dy },
            curveOffset: { x: (a.curveOffset?.x || 0) + dx, y: (a.curveOffset?.y || 0) + dy },
          };
        }
        if (target === "curve") {
          return {
            ...a,
            curveOffset: { x: (a.curveOffset?.x || 0) + dx, y: (a.curveOffset?.y || 0) + dy },
          };
        }
        if (target === "badge") {
          return {
            ...a,
            badgeOffset: { x: (a.badgeOffset?.x || 0) + dx, y: (a.badgeOffset?.y || 0) + dy },
          };
        }
        return a;
      })
    );
  };

  useEffect(() => {
    if (!draggingItem) return;

    const onPointerMove = (e: PointerEvent) => {
      const dx = e.clientX - draggingItem.startX;
      const dy = e.clientY - draggingItem.startY;

      setArrows((prev) =>
        prev.map((a) => {
          if (a.id !== draggingItem.arrowId) return a;
          if (draggingItem.type === "badge") {
            return {
              ...a,
              badgeOffset: {
                x: draggingItem.initialBadgeOffset.x + dx,
                y: draggingItem.initialBadgeOffset.y + dy,
              },
            };
          }
          if (draggingItem.type === "curve") {
            return {
              ...a,
              curveOffset: {
                x: draggingItem.initialCurveOffset.x + dx,
                y: draggingItem.initialCurveOffset.y + dy,
              },
            };
          }
          if (draggingItem.type === "arrow_line") {
            return {
              ...a,
              curveOffset: {
                x: draggingItem.initialCurveOffset.x + dx,
                y: draggingItem.initialCurveOffset.y + dy,
              },
              startOffset: {
                x: draggingItem.initialStartOffset.x + dx,
                y: draggingItem.initialStartOffset.y + dy,
              },
              endOffset: {
                x: draggingItem.initialEndOffset.x + dx,
                y: draggingItem.initialEndOffset.y + dy,
              },
            };
          }
          if (draggingItem.type === "endpoint_start") {
            return {
              ...a,
              startOffset: {
                x: draggingItem.initialStartOffset.x + dx,
                y: draggingItem.initialStartOffset.y + dy,
              },
            };
          }
          if (draggingItem.type === "endpoint_end") {
            return {
              ...a,
              endOffset: {
                x: draggingItem.initialEndOffset.x + dx,
                y: draggingItem.initialEndOffset.y + dy,
              },
            };
          }
          return a;
        })
      );
    };

    const onPointerUp = () => {
      setDraggingItem(null);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [draggingItem]);

  // 1. Kiểm tra Tam Hợp / Tam Hội cục đầy đủ trong 5 chi (Nguyên Cục + Đại Vận)
  const fullTamHopList = useMemo(() => {
    return TAM_HOP_GROUPS.filter((g) =>
      g.branches.every((b) => chartChis.includes(b))
    );
  }, [chartChis]);

  const fullTamHoiList = useMemo(() => {
    return TAM_HOI_GROUPS.filter((g) =>
      g.branches.every((b) => chartChis.includes(b))
    );
  }, [chartChis]);

  const fullGroupBranchNames = useMemo(() => {
    const set = new Set<string>();
    fullTamHopList.forEach((g) => g.branches.forEach((b) => set.add(b)));
    fullTamHoiList.forEach((g) => g.branches.forEach((b) => set.add(b)));
    return set;
  }, [fullTamHopList, fullTamHoiList]);

  // Kiểm tra sự xuất hiện của Tý hoặc Hợi trong hệ thống (Nguyên Cục + Đại Vận + Chi Lưu Niên)
  // Quy tắc người dùng: "Tỵ với thân khi không có tý, hợi sẽ tính là lục hợp, khi có tý hợi sẽ tính là hình"
  const hasTyOrHoi = useMemo(() => {
    return chartChis.some((b) => b === "Tý" || b === "Hợi") || selectedLuuNienChi === "Tý" || selectedLuuNienChi === "Hợi";
  }, [chartChis, selectedLuuNienChi]);

  // Hàm kiểm tra quan hệ Hợp giữa 1 Chi (trong Nguyên Cục + Hành Vận) với Chi Lưu Niên
  const checkHopRelation = (branch: string, target: string): string[] => {
    const reasons: string[] = [];

    // Lục Hợp
    if (LUC_HOP_MAP[target] === branch) {
      const isTyThan = (target === "Tỵ" && branch === "Thân") || (target === "Thân" && branch === "Tỵ");
      if (isTyThan) {
        // Tỵ với Thân:
        // - Khi nguyên cục có Tam Hợp Thủy đầy đủ (Thân Tý Thìn): Thân hợp Tỵ hóa Thủy thành công, kéo cả Tam Hợp Thủy xuống theo
        // - Khi không có Tý, Hợi: tính là Lục Hợp
        const isPartOfTamHopThuy = fullTamHopList.some((g) =>
          g.branches.includes("Thân") && g.branches.includes("Tý") && g.branches.includes("Thìn")
        );
        if (!hasTyOrHoi || isPartOfTamHopThuy) {
          reasons.push("Lục Hợp");
        }
      } else {
        reasons.push("Lục Hợp");
      }
    }

    // Tam Hợp
    TAM_HOP_GROUPS.forEach((g) => {
      if (g.branches.includes(target) && g.branches.includes(branch) && target !== branch) {
        reasons.push(`Tam Hợp (${g.name})`);
      }
    });

    // Tam Hội
    TAM_HOI_GROUPS.forEach((g) => {
      if (g.branches.includes(target) && g.branches.includes(branch) && target !== branch) {
        reasons.push(`Tam Hội (${g.name})`);
      }
    });

    // Âm Hợp (Ám Hợp)
    AM_HOP_PAIRS.forEach(([b1, b2]) => {
      if ((target === b1 && branch === b2) || (target === b2 && branch === b1)) {
        reasons.push(`Âm Hợp`);
      }
    });

    return reasons;
  };

  // Hàm kiểm tra mức độ đối kháng (Xung, Hại, Hình) với Chi Lưu Niên
  // Ưu tiên: Xung (1) -> Hại (2) -> Hình (3)
  const checkOpposeRelation = (
    branch: string,
    target: string
  ): { priority: number; type: "Xung" | "Hại" | "Hình" | "Thường"; label: string } => {
    const isXung = LUC_XUNG_PAIRS.some(
      ([b1, b2]) => (target === b1 && branch === b2) || (target === b2 && branch === b1)
    );
    if (isXung) {
      return { priority: 1, type: "Xung", label: `Tương Xung trực diện với Lưu Niên (${target})` };
    }

    const isHai = LUC_HAI_PAIRS.some(
      ([b1, b2]) => (target === b1 && branch === b2) || (target === b2 && branch === b1)
    );
    if (isHai) {
      return { priority: 2, type: "Hại", label: `Tương Hại với Lưu Niên (${target})` };
    }

    const hinhMatch = TUONG_HINH_PAIRS.find(
      (h) => (target === h.b1 && branch === h.b2) || (target === h.b2 && branch === h.b1)
    );
    if (hinhMatch) {
      const isTyThan = (target === "Tỵ" && branch === "Thân") || (target === "Thân" && branch === "Tỵ");
      if (isTyThan) {
        const isPartOfTamHopThuy = fullTamHopList.some((g) =>
          g.branches.includes("Thân") && g.branches.includes("Tý") && g.branches.includes("Thìn")
        );
        if (!hasTyOrHoi || isPartOfTamHopThuy) {
          // Tính là Lục Hợp, bỏ qua Hình
        } else {
          return { priority: 3, type: "Hình", label: `${hinhMatch.type} (${hinhMatch.desc} do có Tý/Hợi) với Lưu Niên (${target})` };
        }
      } else {
        return { priority: 3, type: "Hình", label: `${hinhMatch.type} (${hinhMatch.desc}) với Lưu Niên (${target})` };
      }
    }

    return { priority: 4, type: "Thường", label: "Không xung hại hình" };
  };

  // Hàm kiểm tra quan hệ liên quan (Âm hợp, Lục hợp, Hợp cục) của 1 chi đối với chữ đối diện
  const checkRelationWithOpposite = (branch: string, oppBranch: string): string[] => {
    const rels: string[] = [];

    if (LUC_HOP_MAP[oppBranch] === branch) {
      const isTyThan = (oppBranch === "Tỵ" && branch === "Thân") || (oppBranch === "Thân" && branch === "Tỵ");
      if (isTyThan) {
        const isPartOfTamHopThuy = fullTamHopList.some((g) =>
          g.branches.includes("Thân") && g.branches.includes("Tý") && g.branches.includes("Thìn")
        );
        if (!hasTyOrHoi || isPartOfTamHopThuy) {
          rels.push(`Lục Hợp ${oppBranch}`);
        }
      } else {
        rels.push(`Lục Hợp ${oppBranch}`);
      }
    }

    TAM_HOP_GROUPS.forEach((g) => {
      if (g.branches.includes(oppBranch) && g.branches.includes(branch) && oppBranch !== branch) {
        rels.push(`Tam Hợp (${g.name})`);
      }
    });

    TAM_HOI_GROUPS.forEach((g) => {
      if (g.branches.includes(oppBranch) && g.branches.includes(branch) && oppBranch !== branch) {
        rels.push(`Tam Hội (${g.name})`);
      }
    });

    AM_HOP_PAIRS.forEach(([b1, b2]) => {
      if ((oppBranch === b1 && branch === b2) || (oppBranch === b2 && branch === b1)) {
        rels.push(`Âm Hợp ${oppBranch}`);
      }
    });

    return rels;
  };

  // 2. TÌM CHỮ TRÙNG TRONG (NGUYÊN CỤC + HÀNH VẬN) VỚI CHI LƯU NIÊN
  const sameBranches = useMemo(() => {
    return chartPillars.filter((p) => p.chi === selectedLuuNienChi);
  }, [chartPillars, selectedLuuNienChi]);

  // 3. PHÂN CHIA BỐ CỤC:
  // - TẦNG DƯỚI: Các chữ trong (Nguyên Cục + Đại Vận) có quan hệ Hợp với Lưu Niên kéo xuống theo.
  // - TẦNG TRÊN:
  //   + Chữ có Hình, Xung, Hại đối diện trực diện với Chi Lưu Niên (Xung -> Hại -> Hình).
  //   + Chữ có liên quan hợp với chữ đối diện đứng KẾ BÊN TRÁI HOẶC PHẢI.
  //   + Chữ không liên quan đứng ở HÀNG TRÊN CÙNG.
  const {
    opposeCenterBranches,
    relatedToOpposeBranches,
    independentTopBranches,
    bottomBranches,
    retainedTopPillars,
    retainedInTopFullGroupPillarKeys,
    pulledFullGroupInfoMap,
  } = useMemo(() => {
    // 1. Xác định các Chi có quan hệ Hợp trực tiếp
    const directHopMap = new Map<string, string[]>();
    chartPillars.forEach((p) => {
      const hopReasons = checkHopRelation(p.chi, selectedLuuNienChi);
      if (hopReasons.length > 0) {
        directHopMap.set(p.key, hopReasons);
      }
    });

    // 1B. QUY TẮC ĐẶC BIỆT: HỢP CỤC HÓA KHÍ (NGŨ HÀNH TƯƠNG SINH) & LOẠI TRỪ DO XUNG/HÌNH/HẠI:
    // - Mộc cục (Dần Mão Thìn / Hợi Mão Mùi) hóa Hỏa: Kéo Ngọ xuống, không kéo Tỵ vì Dần Tỵ hình.
    // - Hỏa cục (Dần Ngọ Tuất / Tỵ Ngọ Mùi) hóa Thổ: Chỉ kéo Thìn, không kéo Sửu vì Sửu Ngọ hại và Tuất hình nhau.
    // - Thủy cục (Thân Tý Thìn / Hợi Tý Sửu) hóa Mộc: Chỉ kéo Dần, không kéo Mão vì Mão Thìn hại và Tý Mão hình.
    const allPresentChis = [...chartPillars.map((p) => p.chi), selectedLuuNienChi];

    const hasDanMaoThin =
      allPresentChis.includes("Dần") &&
      allPresentChis.includes("Mão") &&
      allPresentChis.includes("Thìn");
    const hasHoiMaoMui =
      allPresentChis.includes("Hợi") &&
      allPresentChis.includes("Mão") &&
      allPresentChis.includes("Mùi");
    const hasMocCuc = hasDanMaoThin || hasHoiMaoMui;

    const hasDanNgoTuat =
      allPresentChis.includes("Dần") &&
      allPresentChis.includes("Ngọ") &&
      allPresentChis.includes("Tuất");
    const hasTyNgoMui =
      allPresentChis.includes("Tỵ") &&
      allPresentChis.includes("Ngọ") &&
      allPresentChis.includes("Mùi");
    const hasHoaCuc = hasDanNgoTuat || hasTyNgoMui;

    const hasThanTyThin =
      allPresentChis.includes("Thân") &&
      allPresentChis.includes("Tý") &&
      allPresentChis.includes("Thìn");
    const hasHoiTySuu =
      allPresentChis.includes("Hợi") &&
      allPresentChis.includes("Tý") &&
      allPresentChis.includes("Sửu");
    const hasThuyCuc = hasThanTyThin || hasHoiTySuu;

    const hasThanDauTuat =
      allPresentChis.includes("Thân") &&
      allPresentChis.includes("Dậu") &&
      allPresentChis.includes("Tuất");
    const hasTyDauSuu =
      allPresentChis.includes("Tỵ") &&
      allPresentChis.includes("Dậu") &&
      allPresentChis.includes("Sửu");
    const hasKimCuc = hasThanDauTuat || hasTyDauSuu;

    chartPillars.forEach((p) => {
      // 1. Mộc cục hóa Hỏa: Kéo Ngọ xuống, không kéo Tỵ vì Dần Tỵ hình
      if (hasMocCuc) {
        if (p.chi === "Ngọ") {
          const currentReasons = directHopMap.get(p.key) || [];
          directHopMap.set(p.key, [
            ...currentReasons,
            "Mộc cục hóa Hỏa kéo Ngọ xuống (Dần Ngọ củng Tuất)",
          ]);
        }
        if (p.chi === "Tỵ") {
          directHopMap.delete(p.key);
        }
      }

      // 2. Hỏa cục hóa Thổ: Chỉ kéo Thìn, không kéo Sửu vì Sửu Ngọ hại và Tuất hình nhau
      if (hasHoaCuc) {
        if (p.chi === "Thìn") {
          const currentReasons = directHopMap.get(p.key) || [];
          directHopMap.set(p.key, [
            ...currentReasons,
            "Hỏa cục (Dần Ngọ Tuất / Tỵ Ngọ Mùi) hóa Thổ kéo Thìn xuống (Dần Thìn củng Mão)",
          ]);
        }
        if (p.chi === "Sửu") {
          directHopMap.delete(p.key);
        }
      }

      // 3. Thủy cục hóa Mộc: Chỉ kéo Dần, không kéo Mão vì Mão Thìn hại và Tý Mão hình
      if (hasThuyCuc) {
        if (p.chi === "Dần") {
          const currentReasons = directHopMap.get(p.key) || [];
          directHopMap.set(p.key, [
            ...currentReasons,
            "Thủy cục (Thân Tý Thìn / Hợi Tý Sửu) hóa Mộc kéo Dần xuống (Thìn Dần củng Mão)",
          ]);
        }
        if (p.chi === "Mão") {
          directHopMap.delete(p.key);
        }
      }

      // 4. Kim cục hóa Thủy: Kéo Tý xuống (Thân Tý củng Thìn)
      if (hasKimCuc) {
        if (p.chi === "Tý") {
          const currentReasons = directHopMap.get(p.key) || [];
          directHopMap.set(p.key, [
            ...currentReasons,
            "Kim cục (Thân Dậu Tuất / Tỵ Dậu Sửu) hóa Thủy kéo Tý xuống (Thân Tý củng Thìn)",
          ]);
        }
      }
    });

    // 2. Kiểm tra xem có Tam Hợp hoặc Tam Hội đầy đủ nào trong nguyên cục + hành vận bị kéo theo không:
    // Quy tắc 1 (Turn 318): Khi nguyên cục có đủ tam hợp hoặc tam hội, khi bị kéo 1 chữ xuống thì cả tam hợp tam hội sẽ kéo theo.
    // Quy tắc 2 (Turn 320): NẾU Chi mới có TƯƠNG XUNG với 1 chữ trong nhóm (ví dụ: Thìn Tuất xung, trong khi nhóm có Thân Dậu Tuất):
    // -> Bộ Tam Hội / Tam Hợp KHÔNG bị kéo cả cục xuống!
    // -> Ở TRÊN VẪN GIỮ NGUYÊN Tam Hội / Tam Hợp cục (gồm cả chữ bị xung, chữ không hợp, và cả chữ hợp)!
    // -> Ở DƯỚI: Chỉ chữ có quan hệ Hợp (như Dậu) bị kéo xuống cùng Chi mới (Thìn), còn các chữ khác (Thân, Tuất) không bị kéo xuống!
    const allFullGroups = [...fullTamHopList, ...fullTamHoiList];
    const fullGroupPulledPillars = new Map<string, string[]>(); // key -> reasons kéo theo (chỉ khi KHÔNG có xung)
    const retainedInTopKeys = new Set<string>();
    const pulledFullGroupInfoMap = new Map<string, { groupName: string; groupKey: string; branches: string[] }>();

    allFullGroups.forEach((group) => {
      const memberPillars = chartPillars.filter((p) => group.branches.includes(p.chi));

      // Kiểm tra xem Chi mới có quan hệ đối kháng (Tương Xung, Tương Hại, hoặc Tương Hình) với bất kỳ chữ nào trong nhóm không:
      // (Turn 407: Ngọ hại Sửu -> Sửu đối diện Ngọ, tam cục Tỵ Dậu Sửu có ở 2 chỗ 1 là đối diện Ngọ, và 2 là kế bên Ngọ, các trường hợp khác tương tự)
      const hasOpposeWithGroup = group.branches.some((b) => {
        const opp = checkOpposeRelation(b, selectedLuuNienChi);
        return opp.type === "Xung" || opp.type === "Hại" || opp.type === "Hình";
      });

      // Kiểm tra xem có chữ nào trong nhóm có quan hệ Hợp trực tiếp hoặc trùng với Chi mới không:
      const triggeredMembers = memberPillars.filter(
        (p) => directHopMap.has(p.key) || p.chi === selectedLuuNienChi
      );

      if (hasOpposeWithGroup) {
        // CÓ ĐỐI KHÁNG (XUNG • HẠI • HÌNH):
        // 1. Ở TRÊN (ĐỐI DIỆN VÀ KẾ BÊN ĐỐI DIỆN):
        //    Giữ nguyên Tam Cục / Tam Hội ở Tầng Trên:
        //    - Chữ có Xung / Hại / Hình (như Sửu khi Ngọ hại Sửu) sẽ đứng ĐỐI DIỆN Chi mới ở tầng trên.
        //    - Các chữ còn lại trong cục (như Tỵ, Dậu) giữ ở tầng trên kế bên chữ đối diện (Cánh Tả).
        memberPillars.forEach((mp) => {
          retainedInTopKeys.add(mp.key);
        });

        // 2. Ở DƯỚI (KẾ BÊN CHI MỚI):
        //    Tam cục Tỵ Dậu Sửu xuất hiện ở chỗ thứ 2 là KẾ BÊN Ngọ (Cánh Tả/Hữu tầng dưới):
        //    Nếu có chữ có quan hệ Hợp (như Tỵ Tam Hội Hỏa với Ngọ) hoặc tương tác:
        //    -> Kéo toàn bộ Tam Cục / Tam Hội xuống Tầng Dưới làm thành 1 Cụm kế bên Chi mới!
        if (triggeredMembers.length > 0) {
          const triggerDesc = triggeredMembers.map((tm) => `${tm.label} (${tm.chi})`).join(", ");
          memberPillars.forEach((mp) => {
            pulledFullGroupInfoMap.set(mp.key, {
              groupName: group.name,
              groupKey: group.name,
              branches: group.branches,
            });
            if (directHopMap.has(mp.key)) {
              fullGroupPulledPillars.set(mp.key, directHopMap.get(mp.key)!);
            } else {
              fullGroupPulledPillars.set(mp.key, [`Kéo theo ${group.name} (cùng ${triggerDesc})`]);
            }
          });
        }
      } else {
        // KHÔNG CÓ ĐỐI KHÁNG: Kéo cả cục xuống nếu có ít nhất 1 chữ bị kéo
        if (triggeredMembers.length > 0) {
          const triggerDesc = triggeredMembers.map((tm) => `${tm.label} (${tm.chi})`).join(", ");
          memberPillars.forEach((mp) => {
            pulledFullGroupInfoMap.set(mp.key, {
              groupName: group.name,
              groupKey: group.name,
              branches: group.branches,
            });
            if (directHopMap.has(mp.key)) {
              fullGroupPulledPillars.set(mp.key, directHopMap.get(mp.key)!);
            } else {
              fullGroupPulledPillars.set(mp.key, [`Kéo theo ${group.name} (cùng ${triggerDesc})`]);
            }
          });
        }
      }
    });

    const bottom: { pillar: (typeof chartPillars)[0]; hopReasons: string[] }[] = [];
    const opposeList: { pillar: (typeof chartPillars)[0]; oppInfo: ReturnType<typeof checkOpposeRelation> }[] = [];
    const nonOpposeList: typeof chartPillars = [];
    const retainedTop: (typeof chartPillars)[0][] = [];

    chartPillars.forEach((p) => {
      const isSame = p.chi === selectedLuuNienChi;
      const isRetainedInTop = retainedInTopKeys.has(p.key);

      // A. Nếu thuộc nhóm Tam Hợp / Tam Hội đầy đủ bị kéo theo cả cục:
      if (fullGroupPulledPillars.has(p.key)) {
        bottom.push({ pillar: p, hopReasons: fullGroupPulledPillars.get(p.key)! });
        if (!isRetainedInTop) {
          return;
        }
        // Nếu được giữ lại ở trên (ví dụ: Sửu bị Ngọ hại): tiếp tục xét bên dưới để đưa vào đối diện hoặc kế bên đối diện!
      } else if (directHopMap.has(p.key)) {
        // B. Nếu có quan hệ Hợp trực tiếp
        bottom.push({ pillar: p, hopReasons: directHopMap.get(p.key)! });
        if (!isRetainedInTop) {
          return;
        }
      } else if (isSame) {
        // C. Nếu là chữ trùng (sameBranches): middle_same sẽ hiển thị ở tầng dưới
        if (!isRetainedInTop) {
          return;
        }
      }

      // D1. Loại trừ do Hình / Hại khi hợp cục hóa khí -> Giữ ở Tầng Trên đối diện:
      // a) Mộc cục hóa Hỏa: Tỵ bị Dần ở tầng dưới hình (Dần Tỵ hình)
      if (hasMocCuc && p.chi === "Tỵ") {
        opposeList.push({
          pillar: p,
          oppInfo: {
            priority: 2,
            type: "Hình",
            label: "Tương Hình (Dần Tỵ hình với Mộc cục ở tầng dưới)",
          },
        });
        return;
      }

      // b) Hỏa cục hóa Thổ: Sửu bị Ngọ hại và Tuất hình
      if (hasHoaCuc && p.chi === "Sửu") {
        opposeList.push({
          pillar: p,
          oppInfo: {
            priority: 2,
            type: "Hại",
            label: "Tương Hại & Hình (Sửu Ngọ hại, Sửu Tuất hình với Hỏa cục ở tầng dưới)",
          },
        });
        return;
      }

      // c) Thủy cục hóa Mộc: Mão bị Thìn hại và Tý hình
      if (hasThuyCuc && p.chi === "Mão") {
        opposeList.push({
          pillar: p,
          oppInfo: {
            priority: 2,
            type: "Hình",
            label: "Tương Hình & Hại (Tý Mão hình, Mão Thìn hại với Thủy cục ở tầng dưới)",
          },
        });
        return;
      }

      // D2. Chữ có Xung, Hình, Hại với Chi Lưu Niên -> BẮT BUỘC ĐỂ ĐỐI DIỆN ĐỊA CHI LƯU NIÊN Ở TẦNG TRÊN
      const opp = checkOpposeRelation(p.chi, selectedLuuNienChi);
      if (opp.type === "Xung" || opp.type === "Hại" || opp.type === "Hình") {
        opposeList.push({ pillar: p, oppInfo: opp });
        return;
      }

      // E. Các chữ còn lại ở tầng trên (Cánh Tả / Cánh Hữu / Độc lập)
      nonOpposeList.push(p);
    });

    // Chữ retainedTop (ví dụ Dậu) cũng được đưa vào nonOpposeList ở tầng trên nếu chưa có
    retainedTop.forEach((p) => {
      if (!nonOpposeList.some((np) => np.key === p.key) && !opposeList.some((op) => op.pillar.key === p.key)) {
        nonOpposeList.push(p);
      }
    });

    opposeList.sort((a, b) => a.oppInfo.priority - b.oppInfo.priority);
    const primaryOpposeBranch = opposeList[0]?.pillar?.chi;

    const relatedList: { pillar: (typeof chartPillars)[0]; relReasons: string[] }[] = [];
    const independentList: typeof chartPillars = [];

    nonOpposeList.forEach((p) => {
      let rels: string[] = [];
      if (primaryOpposeBranch) {
        rels = checkRelationWithOpposite(p.chi, primaryOpposeBranch);
      } else if (opposeList.length > 0) {
        for (const op of opposeList) {
          const r = checkRelationWithOpposite(p.chi, op.pillar.chi);
          if (r.length > 0) {
            rels = r;
            break;
          }
        }
      }

      if (rels.length > 0) {
        relatedList.push({ pillar: p, relReasons: rels });
      } else {
        independentList.push(p);
      }
    });

    return {
      opposeCenterBranches: opposeList,
      relatedToOpposeBranches: relatedList,
      independentTopBranches: independentList,
      bottomBranches: bottom,
      retainedTopPillars: retainedTop,
      retainedInTopFullGroupPillarKeys: retainedInTopKeys,
      pulledFullGroupInfoMap,
    };
  }, [chartPillars, selectedLuuNienChi, fullGroupBranchNames, hasTyOrHoi]);

  // CÁC CẶP CỦNG SẴN TRONG NGUYÊN CỤC + HÀNH VẬN (TRƯỚC KHI TƯƠNG TÁC VỚI LƯU NIÊN)
  const cungOriginSummary = useMemo(() => {
    const list: { p1: (typeof chartPillars)[0]; p2: (typeof chartPillars)[0]; cungChi: string; groupName: string }[] = [];
    const seen = new Set<string>();
    for (let i = 0; i < chartPillars.length; i++) {
      for (let j = i + 1; j < chartPillars.length; j++) {
        const p1 = chartPillars[i];
        const p2 = chartPillars[j];
        ALL_CUNG_RULES.forEach((rule) => {
          // Nếu nguyên cục đã có sẵn chữ củng này rồi thì không còn kẹp củng hư thần nữa
          if (chartPillars.some((p) => p.chi === rule.cungChi)) return;

          const match =
            (p1.chi === rule.b1 && p2.chi === rule.b2) ||
            (p1.chi === rule.b2 && p2.chi === rule.b1);
          if (match) {
            const key = `${rule.cungChi}-${p1.key}-${p2.key}`;
            if (!seen.has(key)) {
              seen.add(key);
              list.push({ p1, p2, cungChi: rule.cungChi, groupName: rule.groupName });
            }
          }
        });
      }
    }
    return list;
  }, [chartPillars]);

  const cungOriginPillarKeySet = useMemo(() => {
    const s = new Set<string>();
    const bottomKeys = new Set(bottomBranches.map((b) => b.pillar.key));

    cungOriginSummary.forEach((c) => {
      // 1. Kiểm tra xem Địa Chi Lưu Niên có Xung, Hình, Hại với 1 trong 2 chữ củng không
      // (Quy tắc: Các địa chi mới khi xung, hình, hại 1 địa chi nào đó ở nguyên cục, cũng sẽ phá vỡ luôn củng cục)
      const opp1 = checkOpposeRelation(c.p1.chi, selectedLuuNienChi);
      const opp2 = checkOpposeRelation(c.p2.chi, selectedLuuNienChi);
      const isOpposed =
        opp1.type === "Xung" || opp1.type === "Hại" || opp1.type === "Hình" ||
        opp2.type === "Xung" || opp2.type === "Hại" || opp2.type === "Hình";
      if (isOpposed) return; // Bị phá vỡ -> không tính là củng hợp lệ

      // 2. Kiểm tra có bị kéo xuống tầng dưới (1 chữ hoặc cả 2 chữ) không:
      // (Ví dụ: Lưu niên Hợi tới âm hợp Ngọ, Hợi Dần lục hợp -> Dần Ngọ đều xuống dưới -> mất củng Tuất, mất củng Mão, mất củng Sửu, mất củng Mùi)
      const p1InBottom = bottomKeys.has(c.p1.key);
      const p2InBottom = bottomKeys.has(c.p2.key);
      const isRetainedInTop =
        retainedInTopFullGroupPillarKeys.has(c.p1.key) &&
        retainedInTopFullGroupPillarKeys.has(c.p2.key);

      // Nếu bất kỳ chữ nào bị kéo xuống tầng dưới (hoặc cả 2 chữ đều bị kéo xuống):
      // Đều phá củng ở Tầng Trên, không tính là củng bảo toàn ở Cánh Hữu
      if (!isRetainedInTop && (p1InBottom || p2InBottom)) {
        return;
      }

      s.add(c.p1.key);
      s.add(c.p2.key);
    });
    return s;
  }, [cungOriginSummary, bottomBranches, selectedLuuNienChi, retainedInTopFullGroupPillarKeys, hasTyOrHoi]);

  // 3B. TÍNH TOÁN BỐ CỤC MẶC ĐỊNH & HỖ TRỢ KÉO THẢ TÙY BIẾN VỊ TRÍ
  const defaultZoneMap = useMemo<Record<string, TwoTierZone>>(() => {
    const map: Record<string, TwoTierZone> = {};

    // Phân bổ các Chi bị kéo xuống tầng dưới (bottomBranches):
    // QUY TẮC CỤM: Nếu các Chi thuộc cùng một cụm Tam Hợp / Tam Hội đầy đủ (như Tỵ Dậu Sửu khi Tý kéo Sửu xuống)
    // -> Toàn bộ các Chi trong cụm này PHẢI nằm chung 1 cụm ở cùng một bên (mặc định Cánh Tả: bottom_left)!
    // Các Chi riêng lẻ khác (nếu có) sẽ sang Cánh Hữu (bottom_right).
    const groupAssignedZones = new Map<string, TwoTierZone>();
    let individualToggle = false;

    bottomBranches.forEach((b) => {
      const gInfo = pulledFullGroupInfoMap.get(b.pillar.key);
      if (gInfo) {
        if (!groupAssignedZones.has(gInfo.groupKey)) {
          groupAssignedZones.set(gInfo.groupKey, "bottom_left");
        }
        map[b.pillar.key] = groupAssignedZones.get(gInfo.groupKey)!;
      } else {
        if (groupAssignedZones.size > 0) {
          map[b.pillar.key] = "bottom_right";
        } else {
          map[b.pillar.key] = individualToggle ? "bottom_right" : "bottom_left";
          individualToggle = !individualToggle;
        }
      }
    });

    chartPillars.forEach((p) => {
      // 1. Ưu tiên cao nhất: Địa chi có Xung, Hình, Hại với Chi Lưu Niên -> Đặt đối diện Chi Lưu Niên ở tầng trên
      if (opposeCenterBranches.some((o) => o.pillar.key === p.key)) {
        map[p.key] = "top_oppose";
      } else if (sameBranches.some((s) => s.key === p.key)) {
        map[p.key] = "middle_same";
      } else if (bottomBranches.some((b) => b.pillar.key === p.key)) {
        // Đã được gán phía trên theo quy tắc cụm
      } else if (relatedToOpposeBranches.some((r) => r.pillar.key === p.key)) {
        map[p.key] = "top_left";
      } else if (cungOriginPillarKeySet.has(p.key)) {
        // Địa chi củng sẵn ở nguyên cục ở phía trên sẽ nằm ở gốc phải
        map[p.key] = "top_cung_origin";
      } else {
        map[p.key] = "top_independent";
      }
    });
    return map;
  }, [chartPillars, sameBranches, bottomBranches, opposeCenterBranches, relatedToOpposeBranches, cungOriginPillarKeySet, pulledFullGroupInfoMap]);

  // Quản lý vị trí tùy biến do người dùng kéo thả
  const [customZoneMap, setCustomZoneMap] = useState<Record<string, TwoTierZone>>({});
  const [activeDropZone, setActiveDropZone] = useState<TwoTierZone | null>(null);
  const [draggedPillarKey, setDraggedPillarKey] = useState<string | null>(null);
  const [isTwoTierOpen, setIsTwoTierOpen] = useState<boolean>(true);

  // Kích cỡ thẻ trong bố cục hai tầng (Mặc định: "2x" to gấp đôi theo yêu cầu)
  const [cardSize, setCardSize] = useState<TwoTierCardSize>(() => {
    try {
      return (localStorage.getItem("bazi_two_tier_card_size") as TwoTierCardSize) || "2x";
    } catch {
      return "2x";
    }
  });

  const handleCardSizeChange = (newSize: TwoTierCardSize) => {
    setCardSize(newSize);
    try {
      localStorage.setItem("bazi_two_tier_card_size", newSize);
    } catch {}
  };

  // Chế độ đóng / mở hiện tên gọi Tâm Ấn Phú trong bố cục 2 tầng (Mặc định mở)
  const [showTwoTierTamAnPhu, setShowTwoTierTamAnPhu] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("bazi_two_tier_show_tam_an_phu");
      if (saved != null) return saved === "true";
    } catch {}
    return true;
  });

  const handleToggleTwoTierTamAnPhu = () => {
    setShowTwoTierTamAnPhu((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("bazi_two_tier_show_tam_an_phu", String(next));
      } catch {}
      return next;
    });
  };

  const sizeCfg = TWO_TIER_CARD_SIZE_CONFIG[cardSize] || TWO_TIER_CARD_SIZE_CONFIG["2x"];

  // Tự động khôi phục vị trí chuẩn khi chọn năm / Chi Lưu Niên mới
  useEffect(() => {
    setCustomZoneMap({});
  }, [selectedYear, selectedLuuNienChi]);

  const handleMoveToZone = (pillarKey: string, targetZone: TwoTierZone) => {
    setCustomZoneMap((prev) => ({
      ...prev,
      [pillarKey]: targetZone,
    }));
  };

  const handleResetPositions = () => {
    setCustomZoneMap({});
  };

  const hasCustomPositions = Object.keys(customZoneMap).length > 0;

  const getPillarZone = (key: string): TwoTierZone => {
    return customZoneMap[key] || defaultZoneMap[key] || "top_independent";
  };

  // Phân bổ danh sách Chi theo các vị trí
  const displayedIndependent = useMemo(
    () => chartPillars.filter((p) => getPillarZone(p.key) === "top_independent"),
    [chartPillars, customZoneMap, defaultZoneMap]
  );
  const displayedTopLeft = useMemo(() => {
    const list = chartPillars.filter((p) => getPillarZone(p.key) === "top_left");
    // Nếu có chữ được giữ lại ở tầng trên (như Dậu trong bộ Tam Hội bị xung hoặc Tỵ, Dậu trong Tam Cục Tỵ Dậu Sửu khi Sửu bị Ngọ hại):
    retainedTopPillars.forEach((rp) => {
      if (
        relatedToOpposeBranches.some((r) => r.pillar.key === rp.key) &&
        !list.some((item) => item.key === rp.key)
      ) {
        list.push(rp);
      }
    });
    relatedToOpposeBranches.forEach((rel) => {
      if (
        retainedInTopFullGroupPillarKeys.has(rel.pillar.key) &&
        !list.some((item) => item.key === rel.pillar.key)
      ) {
        list.push(rel.pillar);
      }
    });
    return list;
  }, [chartPillars, customZoneMap, defaultZoneMap, retainedTopPillars, relatedToOpposeBranches, retainedInTopFullGroupPillarKeys]);

  const displayedTopOppose = useMemo(() => {
    const list = chartPillars.filter((p) => getPillarZone(p.key) === "top_oppose");
    // Đảm bảo chữ có Xung • Hại • Hình (như Sửu khi Ngọ hại Sửu) luôn xuất hiện ở ô Đối Diện:
    opposeCenterBranches.forEach((op) => {
      if (!list.some((item) => item.key === op.pillar.key)) {
        list.push(op.pillar);
      }
    });
    return list;
  }, [chartPillars, customZoneMap, defaultZoneMap, opposeCenterBranches]);
  // Địa chi củng sẵn ở nguyên cục ở phía trên sẽ nằm ở gốc phải
  const displayedTopCungOrigin = useMemo(
    () => chartPillars.filter((p) => getPillarZone(p.key) === "top_cung_origin" || getPillarZone(p.key) === "top_right"),
    [chartPillars, customZoneMap, defaultZoneMap]
  );
  // Toàn bộ các Chi ở Cánh Hữu tầng trên (Bên phải)
  const displayedTopRight = useMemo(() => {
    const list = chartPillars.filter((p) => {
      const z = getPillarZone(p.key);
      return z === "top_independent" || z === "top_cung_origin" || z === "top_right";
    });
    retainedTopPillars.forEach((rp) => {
      if (
        independentTopBranches.some((ind) => ind.key === rp.key) &&
        !list.some((item) => item.key === rp.key)
      ) {
        list.push(rp);
      }
    });
    return list;
  }, [chartPillars, customZoneMap, defaultZoneMap, retainedTopPillars, independentTopBranches]);
  // Những địa chi bị kéo xuống sẽ ở trái phải địa chi mới
  const displayedBottomLeft = useMemo(() => {
    const list = chartPillars.filter((p) => getPillarZone(p.key) === "bottom_left");
    // Đảm bảo toàn bộ các Chi thuộc cụm kéo xuống Cánh Tả (như Tỵ, Dậu, Sửu kế bên Ngọ) luôn có mặt:
    bottomBranches.forEach((b) => {
      const gInfo = pulledFullGroupInfoMap.get(b.pillar.key);
      if (gInfo && !list.some((item) => item.key === b.pillar.key)) {
        list.push(b.pillar);
      }
    });
    return list;
  }, [chartPillars, customZoneMap, defaultZoneMap, bottomBranches, pulledFullGroupInfoMap]);
  const displayedMiddleSame = useMemo(
    () => chartPillars.filter((p) => getPillarZone(p.key) === "middle_same"),
    [chartPillars, customZoneMap, defaultZoneMap]
  );
  const displayedBottomRight = useMemo(
    () => chartPillars.filter((p) => getPillarZone(p.key) === "bottom_right" || getPillarZone(p.key) === "bottom_hop"),
    [chartPillars, customZoneMap, defaultZoneMap]
  );

  // Danh sách TẤT CẢ các Chi ở tầng dưới (để đối chiếu củng)
  const displayedBottom = useMemo(
    () => [...displayedBottomLeft, ...displayedBottomRight],
    [displayedBottomLeft, displayedBottomRight]
  );

  // Tính danh sách các Địa Chi được củng sinh ra ở tầng dưới cùng (đóng mở ngoặc, màu khác biệt)
  const activeCungResultList = useMemo(() => {
    const pulledBranches = [...displayedBottomLeft, ...displayedBottomRight, ...displayedMiddleSame];
    const results: { cungChi: string; groupName: string; desc: string }[] = [];
    const seen = new Set<string>();
    const allPresentChis = [...chartPillars.map((p) => p.chi), selectedLuuNienChi];

    // 1) Chi Lưu Niên kết hợp với từng chi kéo xuống
    pulledBranches.forEach((b) => {
      ALL_CUNG_RULES.forEach((rule) => {
        // NGUYÊN TẮC: Nếu nguyên cục hoặc Lưu Niên đã có sẵn chữ củng này rồi thì không còn kẹp củng ra nữa!
        if (allPresentChis.includes(rule.cungChi)) return;

        const match =
          (selectedLuuNienChi === rule.b1 && b.chi === rule.b2) ||
          (selectedLuuNienChi === rule.b2 && b.chi === rule.b1);
        if (match) {
          const key = `${rule.cungChi}-${selectedLuuNienChi}-${b.chi}`;
          if (!seen.has(key)) {
            seen.add(key);
            results.push({
              cungChi: rule.cungChi,
              groupName: rule.groupName,
              desc: `Do Lưu Niên [${selectedLuuNienChi}] và [${b.chi}] (${b.label}) củng xuất chữ (${rule.cungChi})`,
            });
          }
        }
      });
    });

    // 2) Ngoại lệ các chi kéo xuống kết hợp với nhau do Hóa Cục hợp khí:
    // Các chi bình thường bị kéo xuống do cùng hợp với Lưu Niên (như Mão Thân âm hợp, Mão Tuất lục hợp) thì tham hợp với Lưu Niên nên KHÔNG củng với nhau được (Thân Tuất không củng Dậu).
    // Chỉ các trường hợp Hợp Cục Hóa Khí sau mới củng khí ở tầng dưới:

    // a) Mộc cục (Dần Mão Thìn) hợp Mộc hóa Hỏa kéo Ngọ xuống: Ngọ và Dần củng Tuất (nếu Lưu Niên không phải Hợi)
    const hasDanMaoThin =
      allPresentChis.includes("Dần") &&
      allPresentChis.includes("Mão") &&
      allPresentChis.includes("Thìn");
    const hasDanAndNgoInBottom =
      pulledBranches.some((b) => b.chi === "Dần") &&
      pulledBranches.some((b) => b.chi === "Ngọ");

    if (hasDanMaoThin && selectedLuuNienChi !== "Hợi" && hasDanAndNgoInBottom && !allPresentChis.includes("Tuất")) {
      const key = `Tuất-Dần-Ngọ`;
      if (!seen.has(key)) {
        seen.add(key);
        results.push({
          cungChi: "Tuất",
          groupName: "Tam Hợp Dần Ngọ Tuất",
          desc: `Do Dần Mão Thìn hợp Mộc hóa Hỏa kéo Ngọ xuống, Ngọ và Dần cùng hợp khí củng xuất chữ (${"Tuất"})`,
        });
      }
    }

    // b) Hỏa cục (Dần Ngọ Tuất / Tỵ Ngọ Mùi) hợp Hỏa hóa Thổ kéo Thìn xuống: Dần và Thìn củng Mão
    const hasDanNgoTuat =
      allPresentChis.includes("Dần") &&
      allPresentChis.includes("Ngọ") &&
      allPresentChis.includes("Tuất");
    const hasTyNgoMui =
      allPresentChis.includes("Tỵ") &&
      allPresentChis.includes("Ngọ") &&
      allPresentChis.includes("Mùi");
    const hasHoaCuc = hasDanNgoTuat || hasTyNgoMui;
    const hasDanAndThinInBottom =
      pulledBranches.some((b) => b.chi === "Dần") &&
      pulledBranches.some((b) => b.chi === "Thìn");

    if (hasHoaCuc && hasDanAndThinInBottom && !allPresentChis.includes("Mão")) {
      const key = `Mão-Dần-Thìn`;
      if (!seen.has(key)) {
        seen.add(key);
        results.push({
          cungChi: "Mão",
          groupName: "Tam Hội Đông Phương Mộc",
          desc: `Do Hỏa cục (Dần Ngọ Tuất / Tỵ Ngọ Mùi) hợp Hỏa hóa Thổ kéo Thìn xuống, Dần và Thìn cùng hợp khí củng xuất chữ (${"Mão"})`,
        });
      }
    }

    // c) Thủy cục (Thân Tý Thìn / Hợi Tý Sửu) hợp Thủy hóa Mộc kéo Dần xuống: Thìn và Dần củng Mão
    const hasThanTyThin =
      allPresentChis.includes("Thân") &&
      allPresentChis.includes("Tý") &&
      allPresentChis.includes("Thìn");
    const hasHoiTySuu =
      allPresentChis.includes("Hợi") &&
      allPresentChis.includes("Tý") &&
      allPresentChis.includes("Sửu");
    const hasThuyCuc = hasThanTyThin || hasHoiTySuu;

    if (hasThuyCuc && hasDanAndThinInBottom && !allPresentChis.includes("Mão")) {
      const key = `Mão-Thìn-Dần`;
      if (!seen.has(key)) {
        seen.add(key);
        results.push({
          cungChi: "Mão",
          groupName: "Tam Hội Đông Phương Mộc",
          desc: `Do Thủy cục (Thân Tý Thìn / Hợi Tý Sửu) hợp Thủy hóa Mộc kéo Dần xuống, Thìn và Dần cùng hợp khí củng xuất chữ (${"Mão"})`,
        });
      }
    }

    // d) Kim cục (Thân Dậu Tuất / Tỵ Dậu Sửu) hợp Kim hóa Thủy kéo Tý xuống: Thân và Tý củng Thìn
    const hasThanDauTuat =
      allPresentChis.includes("Thân") &&
      allPresentChis.includes("Dậu") &&
      allPresentChis.includes("Tuất");
    const hasTyDauSuu =
      allPresentChis.includes("Tỵ") &&
      allPresentChis.includes("Dậu") &&
      allPresentChis.includes("Sửu");
    const hasKimCuc = hasThanDauTuat || hasTyDauSuu;
    const hasThanAndTyInBottom =
      pulledBranches.some((b) => b.chi === "Thân") &&
      pulledBranches.some((b) => b.chi === "Tý");

    if (hasKimCuc && hasThanAndTyInBottom && !allPresentChis.includes("Thìn")) {
      const key = `Thìn-Thân-Tý`;
      if (!seen.has(key)) {
        seen.add(key);
        results.push({
          cungChi: "Thìn",
          groupName: "Tam Hợp Thủy",
          desc: `Do Kim cục (Thân Dậu Tuất / Tỵ Dậu Sửu) hợp Kim hóa Thủy kéo Tý xuống, Thân và Tý cùng hợp khí củng xuất chữ (${"Thìn"})`,
        });
      }
    }

    return results;
  }, [selectedLuuNienChi, displayedBottomLeft, displayedBottomRight, displayedMiddleSame, chartPillars]);

  // Tra cứu chuẩn xác Tên Gọi Tâm Ấn Phú cho bất kỳ Địa Chi nào trong Bố Cục 2 Tầng
  const getTamAnPhuInfoForChi = useCallback(
    (chi: string) => {
      if (!chi) return null;
      const rawChi = chi.trim().replace(/[()\[\]{}:,.\s]/g, "");
      const normChi = rawChi === "Tị" ? "Tỵ" : rawChi;

      // Ưu tiên 1: Tra cứu trực tiếp từ lucNham12Lines theo branch
      const matchBranch = lucNham12Lines.find(
        (r) => r.branch === normChi || r.branch === rawChi || r.skyBranchName === normChi
      );
      if (matchBranch && matchBranch.tuongName) {
        return {
          tuongName: matchBranch.tuongName,
          tuongChinese: matchBranch.tuongChinese,
          generalName: matchBranch.generalName,
          fullLine: matchBranch.fullLine,
          meaning: matchBranch.meaning,
        };
      }

      // Ưu tiên 2: Tra cứu theo Lục Hợp từ lucNham12Lines
      const matchLucHop = lucNham12Lines.find(
        (r) => r.lucHopBranch === normChi || r.lucHopBranch === rawChi
      );
      if (matchLucHop && matchLucHop.tuongName) {
        return {
          tuongName: matchLucHop.tuongName,
          tuongChinese: matchLucHop.tuongChinese,
          generalName: matchLucHop.generalName,
          fullLine: matchLucHop.fullLine,
          meaning: matchLucHop.meaning,
        };
      }

      // Ưu tiên 3: Tra cứu trực tiếp từ skyGeneralMap
      const directMap = lucNhamBoardState.skyGeneralMap;
      if (directMap && directMap[normChi]) {
        const genName = directMap[normChi].generalName;
        const isCauTranTy =
          (genName === "Câu Trần" || genName === "Câu Trận") && (normChi === "Tỵ" || normChi === "Tị");
        if (isCauTranTy) {
          return {
            tuongName: "Thụ cống",
            tuongChinese: "受贡",
            generalName: "Câu Trần",
            fullLine:
              "Cư Tỵ— Thụ cống (受贡): cống nạp, dâng hiến tiền bạc, vật phẩm cho quan sai, miếu mạo để giải hạn, mong cầu bình an nhưng cũng dễ bị lợi dụng.",
          };
        }
        const exact = getTamAnPhuExactEntry(genName, normChi);
        if (exact?.entry) {
          return {
            tuongName: exact.entry.tuongName,
            tuongChinese: exact.entry.tuongChinese,
            generalName: genName,
            fullLine: exact.entry.fullLine,
            meaning: exact.entry.meaning,
          };
        }
      }

      // Ưu tiên 4: Tra cứu theo bảng TAM_AN_PHU_EXACT_DATA nếu chưa tìm thấy
      for (const gen of TAM_AN_PHU_EXACT_DATA) {
        const ent = gen.cungVi[normChi];
        if (ent) {
          return {
            tuongName: ent.tuongName,
            tuongChinese: ent.tuongChinese,
            generalName: gen.name,
            fullLine: ent.fullLine,
            meaning: ent.meaning,
          };
        }
      }

      return null;
    },
    [lucNham12Lines, lucNhamBoardState.skyGeneralMap]
  );

  const getPillarCardInfo = (p: (typeof chartPillars)[0], zone: TwoTierZone) => {
    const tamAnPhu = getTamAnPhuInfoForChi(p.chi);
    const opp = opposeCenterBranches.find((o) => o.pillar.key === p.key);
    if (opp && (zone === "top_oppose" || defaultZoneMap[p.key] === "top_oppose")) {
      const isXung = opp.oppInfo.type === "Xung";
      const isHai = opp.oppInfo.type === "Hại";
      const isHinh = opp.oppInfo.type === "Hình";
      const bType: "xung" | "hai" | "hinh" | "normal" = isXung
        ? "xung"
        : isHai
        ? "hai"
        : isHinh
        ? "hinh"
        : "normal";
      const gInfo = pulledFullGroupInfoMap.get(p.key);
      const groupSuffix = gInfo ? ` • Tam Cục ${gInfo.groupName} (Có ở cả Đối Diện & Kế Bên)` : "";
      return {
        badgeType: bType,
        badgeText: isXung ? "⚡ ĐỐI XUNG" : isHai ? "💥 ĐỐI HẠI" : isHinh ? "⚔️ ĐỐI HÌNH" : "Đối Diện",
        subNote: `${opp.oppInfo.label}${groupSuffix}`,
        tamAnPhu,
      };
    }
    const rel = relatedToOpposeBranches.find((r) => r.pillar.key === p.key);
    if (rel && (zone === "top_left" || defaultZoneMap[p.key] === "top_left")) {
      const gInfo = pulledFullGroupInfoMap.get(p.key);
      const suffix = gInfo ? ` • Thuộc ${gInfo.groupName}` : "";
      return {
        badgeType: "hop" as const,
        badgeText: "Kế Bên Trực Diện",
        subNote: `${rel.relReasons.join(" • ")}${suffix}`,
        tamAnPhu,
      };
    }
    const matchCung = cungOriginSummary.find((s) => s.p1.key === p.key || s.p2.key === p.key);
    if (cungOriginPillarKeySet.has(p.key) && matchCung && (zone === "top_cung_origin" || defaultZoneMap[p.key] === "top_cung_origin")) {
      return {
        badgeType: "cung" as const,
        badgeText: "🏛️ CỦNG SẴN",
        subNote: `Củng sẵn: (${matchCung.cungChi})`,
        tamAnPhu,
      };
    }
    const bHop = bottomBranches.find((b) => b.pillar.key === p.key);
    if (bHop && (zone === "bottom_left" || zone === "bottom_right" || zone === "bottom_hop")) {
      const gInfo = pulledFullGroupInfoMap.get(p.key);
      const isDirectHop = bHop.hopReasons.some((r) => !r.startsWith("Kéo theo"));
      const isPullByCluster = bHop.hopReasons.some((r) => r.startsWith("Kéo theo"));
      const hasOpposeInTop = opposeCenterBranches.some((o) => o.pillar.key === p.key);
      const dualText = hasOpposeInTop ? ` (Có ở cả Đối Diện & Kế Bên)` : "";
      return {
        badgeType: "hop" as const,
        badgeText: gInfo
          ? isPullByCluster
            ? "Cụm Kéo Theo"
            : "Kéo Xuống (Trực Hợp)"
          : zone === "bottom_left"
          ? "Kéo Xuống (Trái)"
          : "Kéo Xuống (Phải)",
        subNote: `${bHop.hopReasons.join(" • ")}${dualText}`,
        tamAnPhu,
      };
    }
    if (zone === "middle_same" || sameBranches.some((s) => s.key === p.key)) {
      return {
        badgeType: "same" as const,
        badgeText: "Chữ Trùng (Chung Ô)",
        subNote: `Trùng với Lưu Niên ${selectedLuuNienChi}`,
        tamAnPhu,
      };
    }
    if (fullGroupBranchNames.has(p.chi)) {
      return {
        badgeType: "toancuc" as const,
        badgeText: "✨ TOÀN CỤC",
        subNote: "Tam Hội / Tam Hợp Toàn Cục",
        tamAnPhu,
      };
    }
    if (p.key === "daivan") {
      return {
        badgeType: "daivan" as const,
        badgeText: "ĐẠI VẬN",
        subNote: "Hành Vận 10 Năm",
        tamAnPhu,
      };
    }
    return {
      badgeType: "normal" as const,
      badgeText: "Độc Lập",
      subNote: undefined,
      tamAnPhu,
    };
  };

  // 4. PHÂN TÍCH BIẾN ĐỘNG CỦNG KHÍ GIỮA (NGUYÊN CỤC + HÀNH VẬN) VÀ LƯU NIÊN
  const { initialCungList, intactCungList, lostCungList, newCungList } = useMemo(() => {
    const allPresentChis = [...chartPillars.map((p) => p.chi), selectedLuuNienChi];

    interface InitialCung {
      p1: (typeof chartPillars)[0];
      p2: (typeof chartPillars)[0];
      rule: CungRule;
    }
    const initialCungs: InitialCung[] = [];

    for (let i = 0; i < chartPillars.length; i++) {
      for (let j = i + 1; j < chartPillars.length; j++) {
        const p1 = chartPillars[i];
        const p2 = chartPillars[j];

        ALL_CUNG_RULES.forEach((rule) => {
          // NGUYÊN TẮC: Nếu nguyên cục đã có sẵn chữ củng này rồi thì không còn kẹp củng hư thần nữa!
          // (Ví dụ: Nguyên cục đã có sẵn Tỵ Dậu Sửu thì không còn củng Tỵ, Dậu, Sửu nữa vì đã có đủ thực thể trong cục)
          if (chartPillars.some((p) => p.chi === rule.cungChi)) return;

          const match =
            (p1.chi === rule.b1 && p2.chi === rule.b2) ||
            (p1.chi === rule.b2 && p2.chi === rule.b1);
          if (match) {
            initialCungs.push({ p1, p2, rule });
          }
        });
      }
    }

    interface CungItemDetail {
      cungChi: string;
      groupName: string;
      p1: (typeof chartPillars)[0];
      p2: (typeof chartPillars)[0];
      reason: string;
    }

    const intact: CungItemDetail[] = [];
    const lost: CungItemDetail[] = [];

    initialCungs.forEach((c) => {
      const p1InBottom = bottomBranches.some((b) => b.pillar.key === c.p1.key);
      const p2InBottom = bottomBranches.some((b) => b.pillar.key === c.p2.key);

      // 1. KIỂM TRA ĐỊA CHI LƯU NIÊN XUNG, HÌNH, HẠI VỚI ĐỊA CHI NGUYÊN CỤC:
      // "các địa chi mới khi xung, hình, hại 1 địa chi nào đó ở nguyên cục, cũng sẽ phá vỡ luôn củng cục"
      const opp1 = checkOpposeRelation(c.p1.chi, selectedLuuNienChi);
      const opp2 = checkOpposeRelation(c.p2.chi, selectedLuuNienChi);
      const isP1Opposed = opp1.type === "Xung" || opp1.type === "Hại" || opp1.type === "Hình";
      const isP2Opposed = opp2.type === "Xung" || opp2.type === "Hại" || opp2.type === "Hình";

      if (isP1Opposed || isP2Opposed) {
        let reason = "";
        if (isP1Opposed && isP2Opposed) {
          reason = `Phá cục củng [${c.rule.cungChi}] do cả ${c.p1.label} (${c.p1.chi}) [${opp1.type}] và ${c.p2.label} (${c.p2.chi}) [${opp2.type}] đều bị xung/hình/hại bởi Lưu Niên [${selectedLuuNienChi}].`;
        } else if (isP1Opposed) {
          reason = `Phá cục củng [${c.rule.cungChi}] do ${c.p1.label} (${c.p1.chi}) bị ${opp1.type} (${opp1.label}) bởi Lưu Niên [${selectedLuuNienChi}].`;
        } else {
          reason = `Phá cục củng [${c.rule.cungChi}] do ${c.p2.label} (${c.p2.chi}) bị ${opp2.type} (${opp2.label}) bởi Lưu Niên [${selectedLuuNienChi}].`;
        }

        lost.push({
          cungChi: c.rule.cungChi,
          groupName: c.rule.groupName,
          p1: c.p1,
          p2: c.p2,
          reason,
        });
        return;
      }

      // 1.5. NGOẠI LỆ ĐẶC BIỆT: DẦN MÃO THÌN HỢP MỘC HÓA HỎA KÉO NGỌ XUỐNG CÙNG DẦN CỦNG TUẤT Ở TẦNG DƯỚI:
      // "Ở ví dụ này vận dậu, năm đinh mão, dần mão thìn hợp mộc sẽ hóa hỏa, nên kéo ngọ xuống nên ngọ dần củng tuất, sẽ không kéo tỵ vì dần tỵ hình"
      // Lưu ý: Nếu Lưu Niên là Hợi (vận Dậu lưu niên Hợi): Hợi tới âm hợp Ngọ, Hợi Dần lục hợp -> Dần Ngọ không củng được Tuất, mất luôn củng Mão, Sửu, Mùi.
      const hasDanMaoThin =
        allPresentChis.includes("Dần") &&
        allPresentChis.includes("Mão") &&
        allPresentChis.includes("Thìn");
      const isDanNgoCungTuat =
        hasDanMaoThin &&
        selectedLuuNienChi !== "Hợi" &&
        c.rule.cungChi === "Tuất" &&
        ((c.p1.chi === "Dần" && c.p2.chi === "Ngọ") || (c.p1.chi === "Ngọ" && c.p2.chi === "Dần"));

      if (isDanNgoCungTuat) {
        intact.push({
          cungChi: c.rule.cungChi,
          groupName: c.rule.groupName,
          p1: c.p1,
          p2: c.p2,
          reason: `Dần Mão Thìn hợp Mộc hóa Hỏa kéo Ngọ xuống Tầng Dưới, Ngọ và Dần cùng hợp khí củng xuất chữ [Tuất] ở Tầng Dưới.`,
        });
        return;
      }

      // b) Hỏa cục (Dần Ngọ Tuất / Tỵ Ngọ Mùi) hợp Hỏa hóa Thổ kéo Thìn xuống: Dần và Thìn củng Mão
      const hasDanNgoTuat =
        allPresentChis.includes("Dần") &&
        allPresentChis.includes("Ngọ") &&
        allPresentChis.includes("Tuất");
      const hasTyNgoMui =
        allPresentChis.includes("Tỵ") &&
        allPresentChis.includes("Ngọ") &&
        allPresentChis.includes("Mùi");
      const hasHoaCuc = hasDanNgoTuat || hasTyNgoMui;
      const isDanThinCungMaoByHoaCuc =
        hasHoaCuc &&
        c.rule.cungChi === "Mão" &&
        ((c.p1.chi === "Dần" && c.p2.chi === "Thìn") || (c.p1.chi === "Thìn" && c.p2.chi === "Dần"));

      if (isDanThinCungMaoByHoaCuc) {
        intact.push({
          cungChi: c.rule.cungChi,
          groupName: c.rule.groupName,
          p1: c.p1,
          p2: c.p2,
          reason: `Hỏa cục (Dần Ngọ Tuất / Tỵ Ngọ Mùi) hợp Hỏa hóa Thổ kéo Thìn xuống Tầng Dưới, Dần và Thìn cùng hợp khí củng xuất chữ [Mão] ở Tầng Dưới.`,
        });
        return;
      }

      // c) Thủy cục (Thân Tý Thìn / Hợi Tý Sửu) hợp Thủy hóa Mộc kéo Dần xuống: Thìn và Dần củng Mão
      const hasThanTyThin =
        allPresentChis.includes("Thân") &&
        allPresentChis.includes("Tý") &&
        allPresentChis.includes("Thìn");
      const hasHoiTySuu =
        allPresentChis.includes("Hợi") &&
        allPresentChis.includes("Tý") &&
        allPresentChis.includes("Sửu");
      const hasThuyCuc = hasThanTyThin || hasHoiTySuu;
      const isThinDanCungMaoByThuyCuc =
        hasThuyCuc &&
        c.rule.cungChi === "Mão" &&
        ((c.p1.chi === "Thìn" && c.p2.chi === "Dần") || (c.p1.chi === "Dần" && c.p2.chi === "Thìn"));

      if (isThinDanCungMaoByThuyCuc) {
        intact.push({
          cungChi: c.rule.cungChi,
          groupName: c.rule.groupName,
          p1: c.p1,
          p2: c.p2,
          reason: `Thủy cục (Thân Tý Thìn / Hợi Tý Sửu) hợp Thủy hóa Mộc kéo Dần xuống Tầng Dưới, Thìn và Dần cùng hợp khí củng xuất chữ [Mão] ở Tầng Dưới.`,
        });
        return;
      }

      // d) Kim cục (Thân Dậu Tuất / Tỵ Dậu Sửu) hợp Kim hóa Thủy kéo Tý xuống: Thân và Tý củng Thìn
      const hasThanDauTuat =
        allPresentChis.includes("Thân") &&
        allPresentChis.includes("Dậu") &&
        allPresentChis.includes("Tuất");
      const hasTyDauSuu =
        allPresentChis.includes("Tỵ") &&
        allPresentChis.includes("Dậu") &&
        allPresentChis.includes("Sửu");
      const hasKimCuc = hasThanDauTuat || hasTyDauSuu;
      const isThanTyCungThinByKimCuc =
        hasKimCuc &&
        c.rule.cungChi === "Thìn" &&
        ((c.p1.chi === "Thân" && c.p2.chi === "Tý") || (c.p1.chi === "Tý" && c.p2.chi === "Thân"));

      if (isThanTyCungThinByKimCuc) {
        intact.push({
          cungChi: c.rule.cungChi,
          groupName: c.rule.groupName,
          p1: c.p1,
          p2: c.p2,
          reason: `Kim cục (Thân Dậu Tuất / Tỵ Dậu Sửu) hợp Kim hóa Thủy kéo Tý xuống Tầng Dưới, Thân và Tý cùng hợp khí củng xuất chữ [Thìn] ở Tầng Dưới.`,
        });
        return;
      }

      // 2. KIỂM TRA BỊ KÉO XUỐNG TẦNG DƯỚI (1 CHI HOẶC CẢ 2 CHI):
      // - Nếu cả 2 chữ đều bị kéo xuống tầng dưới: Do đã bị Lưu Niên hợp cuốn đi (tham hợp), nên không thể củng cục nguyên cục được nữa.
      //   (Ví dụ: Lưu niên Hợi tới âm hợp Ngọ, Hợi Dần lục hợp -> Dần Ngọ đều xuống tầng dưới -> không củng được Tuất).
      // - Nếu 1 chữ bị kéo xuống, 1 chữ ở trên: Bị phân tầng chia cắt -> Phá củng.
      if (p1InBottom && p2InBottom) {
        lost.push({
          cungChi: c.rule.cungChi,
          groupName: c.rule.groupName,
          p1: c.p1,
          p2: c.p2,
          reason: `Phá cục củng [${c.rule.cungChi}] do cả ${c.p1.label} (${c.p1.chi}) và ${c.p2.label} (${c.p2.chi}) đều bị hợp kéo xuống tầng dưới cùng Lưu Niên [${selectedLuuNienChi}], tham hợp với Lưu Niên nên không củng được [${c.rule.cungChi}].`,
        });
        return;
      }

      if (p1InBottom || p2InBottom) {
        const movedBranch = p1InBottom ? c.p1 : c.p2;
        const stayBranch = p1InBottom ? c.p2 : c.p1;
        lost.push({
          cungChi: c.rule.cungChi,
          groupName: c.rule.groupName,
          p1: c.p1,
          p2: c.p2,
          reason: `Phá cục củng [${c.rule.cungChi}] do ${movedBranch.label} (${movedBranch.chi}) bị hợp kéo xuống tầng dưới cùng Lưu Niên [${selectedLuuNienChi}], tách rời ${stayBranch.label} (${stayBranch.chi}) ở tầng trên.`,
        });
        return;
      }

      // 3. BẢO TOÀN (CHỈ KHI CẢ 2 CÙNG AN VỊ Ở TẦNG TRÊN VÀ KHÔNG BỊ XUNG/HÌNH/HẠI)
      intact.push({
        cungChi: c.rule.cungChi,
        groupName: c.rule.groupName,
        p1: c.p1,
        p2: c.p2,
        reason: `Cặp [${c.p1.chi}] (${c.p1.label}) và [${c.p2.chi}] (${c.p2.label}) cùng an vị ở tầng trên, không bị xung/hình/hại và không bị kéo xuống, bảo toàn thế củng [${c.rule.cungChi}] (${c.rule.groupName}).`,
      });
    });

    interface NewCung {
      cungChi: string;
      groupName: string;
      withBranch: string;
      desc: string;
    }
    const newlyAdded: NewCung[] = [];
    const seenNew = new Set<string>();

    bottomBranches.forEach((b) => {
      const bChi = b.pillar.chi;

      ALL_CUNG_RULES.forEach((rule) => {
        // NGUYÊN TẮC: Nếu nguyên cục hoặc Lưu Niên đã có sẵn chữ củng này rồi thì không củng ra nữa!
        if (chartPillars.some((p) => p.chi === rule.cungChi)) return;
        if (selectedLuuNienChi === rule.cungChi) return;

        const match =
          (selectedLuuNienChi === rule.b1 && bChi === rule.b2) ||
          (selectedLuuNienChi === rule.b2 && bChi === rule.b1);

        if (match) {
          const key = `${rule.cungChi}-${b.pillar.key}`;
          if (!seenNew.has(key)) {
            seenNew.add(key);
            newlyAdded.push({
              cungChi: rule.cungChi,
              groupName: rule.groupName,
              withBranch: `${b.pillar.label} (${bChi})`,
              desc: `Do Lưu Niên [${selectedLuuNienChi}] và [${bChi}] kết hợp ở tầng dưới củng xuất chữ [${rule.cungChi}] (${rule.groupName}).`,
            });
          }
        }
      });
    });

    return {
      initialCungList: initialCungs,
      intactCungList: intact,
      lostCungList: lost,
      newCungList: newlyAdded,
    };
  }, [chartPillars, bottomBranches, selectedLuuNienChi, retainedInTopFullGroupPillarKeys, hasTyOrHoi]);

  // Kiểm tra củng cục nguyên cục có bị mất hay không
  const isCungLost = (item: { p1: { key: string }; p2: { key: string }; cungChi: string }) => {
    return lostCungList.some(
      (l) =>
        l.cungChi === item.cungChi &&
        ((l.p1.key === item.p1.key && l.p2.key === item.p2.key) ||
          (l.p1.key === item.p2.key && l.p2.key === item.p1.key))
    );
  };

  const targetChiData = CHI_MAP.get(selectedLuuNienChi);

  // --- HÀM VÀ LOGIC CHO MŨI TÊN PHÂN TRỤC 2 TẦNG ---
  const twoTierAllNodesList = useMemo(() => {
    const list: { key: string; name: string; value: string; zone: TwoTierZone; pillar: string }[] = [];

    // 1. Thẻ Địa Chi Lưu Niên ở giữa tầng dưới
    list.push({
      key: "twoTier-luunien",
      name: `Lưu Niên ${selectedYear}`,
      value: selectedLuuNienChi,
      zone: "middle_same",
      pillar: `Lưu Niên (${selectedYear})`,
    });

    // 2. Các thẻ Chi Củng ở trên cùng
    cungOriginSummary.forEach((s, idx) => {
      list.push({
        key: `twoTier-cung-${s.cungChi}-${idx}`,
        name: `Củng ${s.cungChi}`,
        value: s.cungChi,
        zone: "top_cung_origin",
        pillar: `Củng [${s.p1.chi}]-[${s.p2.chi}]`,
      });
    });

    // 3. Toàn bộ các trụ / Chi trong 2 tầng
    chartPillars.forEach((p) => {
      const currentZone = customZoneMap[p.key] || defaultZoneMap[p.key] || "top_independent";
      list.push({
        key: `twoTier-${p.key}`,
        name: `${p.label} (${p.chi})`,
        value: p.chi,
        zone: currentZone,
        pillar: p.pillar || `${p.can} ${p.chi}`,
      });
      // Nếu có mặt ở cả tầng dưới (do Tam Cục có ở 2 chỗ):
      if (retainedInTopFullGroupPillarKeys.has(p.key) && bottomBranches.some((b) => b.pillar.key === p.key)) {
        const botZone = defaultZoneMap[p.key] || "bottom_left";
        list.push({
          key: `twoTier-${botZone}-${p.key}`,
          name: `${p.label} (${p.chi}) [Hạ Tầng]`,
          value: p.chi,
          zone: botZone,
          pillar: p.pillar || `${p.can} ${p.chi}`,
        });
      }
    });

    // 4. Các thẻ Địa Chi được củng ở dưới cùng
    activeCungResultList.forEach((cung, idx) => {
      list.push({
        key: `twoTier-cung-bot-${cung.cungChi}-${idx}`,
        name: `Củng Mới (${cung.cungChi})`,
        value: cung.cungChi,
        zone: "middle_same",
        pillar: `Củng Mới (${cung.cungChi})`,
      });
    });

    return list;
  }, [selectedYear, selectedLuuNienChi, cungOriginSummary, chartPillars, customZoneMap, defaultZoneMap, activeCungResultList]);

  const getTwoTierNodeInfo = useCallback(
    (key: string) => {
      return twoTierAllNodesList.find((n) => n.key === key);
    },
    [twoTierAllNodesList]
  );

  const updateTwoTierCoords = useCallback(() => {
    if (!twoTierContainerRef.current) return;
    const containerRect = twoTierContainerRef.current.getBoundingClientRect();
    const newCoords: Record<string, { x: number; y: number; width: number; height: number }> = {};
    for (const [key, el] of Object.entries(twoTierNodeRefs.current)) {
      if (el) {
        const rect = el.getBoundingClientRect();
        newCoords[key] = {
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top + rect.height / 2,
          width: rect.width,
          height: rect.height,
        };
      }
    }
    setTwoTierCoordsMap(newCoords);
  }, []);

  useEffect(() => {
    updateTwoTierCoords();
    const timer = setTimeout(updateTwoTierCoords, 60);
    const timer2 = setTimeout(updateTwoTierCoords, 180);
    window.addEventListener("resize", updateTwoTierCoords);
    const observer = new ResizeObserver(updateTwoTierCoords);
    if (twoTierContainerRef.current) {
      observer.observe(twoTierContainerRef.current);
    }
    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
      window.removeEventListener("resize", updateTwoTierCoords);
      observer.disconnect();
    };
  }, [updateTwoTierCoords, cardSize, isTwoTierOpen, hasCustomPositions, selectedYear, twoTierArrows.length, activeCungResultList.length, cungOriginSummary.length]);

  const suggestTwoTierRelation = useCallback(
    (fromKey: string, toKey: string): { label: string; color: string; direction: "forward" | "backward" | "both" | "none" } => {
      const nodeFrom = twoTierAllNodesList.find((n) => n.key === fromKey);
      const nodeTo = twoTierAllNodesList.find((n) => n.key === toKey);
      if (!nodeFrom || !nodeTo) return { label: "Liên Kết", color: "#F59E0B", direction: "forward" };

      const b1 = nodeFrom.value;
      const b2 = nodeTo.value;

      // Lục Xung
      const isXung =
        (b1 === "Tý" && b2 === "Ngọ") || (b1 === "Ngọ" && b2 === "Tý") ||
        (b1 === "Sửu" && b2 === "Mùi") || (b1 === "Mùi" && b2 === "Sửu") ||
        (b1 === "Dần" && b2 === "Thân") || (b1 === "Thân" && b2 === "Dần") ||
        (b1 === "Mão" && b2 === "Dậu") || (b1 === "Dậu" && b2 === "Mão") ||
        (b1 === "Thìn" && b2 === "Tuất") || (b1 === "Tuất" && b2 === "Thìn") ||
        (b1 === "Tỵ" && b2 === "Hợi") || (b1 === "Hợi" && b2 === "Tỵ");
      if (isXung) return { label: "Lục Xung", color: "#EF4444", direction: "both" };

      // Lục Hợp
      const isLucHop =
        (b1 === "Tý" && b2 === "Sửu") || (b1 === "Sửu" && b2 === "Tý") ||
        (b1 === "Dần" && b2 === "Hợi") || (b1 === "Hợi" && b2 === "Dần") ||
        (b1 === "Mão" && b2 === "Tuất") || (b1 === "Tuất" && b2 === "Mão") ||
        (b1 === "Thìn" && b2 === "Dậu") || (b1 === "Dậu" && b2 === "Thìn") ||
        (b1 === "Tỵ" && b2 === "Thân") || (b1 === "Thân" && b2 === "Tỵ") ||
        (b1 === "Ngọ" && b2 === "Mùi") || (b1 === "Mùi" && b2 === "Ngọ");
      if (isLucHop) return { label: "Lục Hợp", color: "#10B981", direction: "both" };

      // Tam Hợp / Bán Hợp
      for (const g of TAM_HOP_GROUPS) {
        if (g.branches.includes(b1) && g.branches.includes(b2)) {
          return { label: `Bán Hợp ${g.name}`, color: "#8B5CF6", direction: "both" };
        }
      }

      // Tương Hại
      const isHai =
        (b1 === "Tý" && b2 === "Mùi") || (b1 === "Mùi" && b2 === "Tý") ||
        (b1 === "Sửu" && b2 === "Ngọ") || (b1 === "Ngọ" && b2 === "Sửu") ||
        (b1 === "Dần" && b2 === "Tỵ") || (b1 === "Tỵ" && b2 === "Dần") ||
        (b1 === "Mão" && b2 === "Thìn") || (b1 === "Thìn" && b2 === "Mão") ||
        (b1 === "Thân" && b2 === "Hợi") || (b1 === "Hợi" && b2 === "Thân") ||
        (b1 === "Dậu" && b2 === "Tuất") || (b1 === "Tuất" && b2 === "Dậu");
      if (isHai) return { label: "Tương Hại", color: "#EC4899", direction: "both" };

      // Trùng Chi
      if (b1 === b2) return { label: "Đồng Khí (Trùng)", color: "#F59E0B", direction: "both" };

      return { label: "Tương Tác", color: "#F59E0B", direction: "forward" };
    },
    [twoTierAllNodesList]
  );

  const suggestTwoTierMultiRelation = useCallback(
    (nodeKeys: string[]): { label: string; color: string } => {
      if (nodeKeys.length < 2) return { label: "Liên Kết", color: "#F59E0B" };
      if (nodeKeys.length === 2) {
        const sug = suggestTwoTierRelation(nodeKeys[0], nodeKeys[1]);
        return { label: sug.label, color: sug.color };
      }

      const nodes = nodeKeys.map((k) => twoTierAllNodesList.find((n) => n.key === k)).filter(Boolean);
      const branches = nodes.map((n) => n!.value);

      // Check Tam Hợp
      for (const g of TAM_HOP_GROUPS) {
        const matchCount = g.branches.filter((b) => branches.includes(b)).length;
        if (matchCount === 3) {
          return { label: `${g.name} (Đầy Đủ)`, color: "#8B5CF6" };
        }
        if (matchCount === 2) {
          return { label: `Bán Hợp ${g.name}`, color: "#A855F7" };
        }
      }

      // Check Tam Hội
      for (const g of TAM_HOI_GROUPS) {
        const matchCount = g.branches.filter((b) => branches.includes(b)).length;
        if (matchCount === 3) {
          return { label: `${g.name} (Hội Cục)`, color: "#3B82F6" };
        }
      }

      return { label: `Chuỗi Tương Tác (${nodeKeys.length} Chi)`, color: "#F59E0B" };
    },
    [twoTierAllNodesList, suggestTwoTierRelation]
  );

  const handleTwoTierToggleNode = (nodeKey: string) => {
    setTwoTierSelectedNodes((prev) => {
      let next: string[];
      if (prev.includes(nodeKey)) {
        next = prev.filter((k) => k !== nodeKey);
      } else {
        next = [...prev, nodeKey];
      }
      if (next.length >= 2) {
        const fromK = next[0];
        const toK = next[next.length - 1];
        setTwoTierNewArrowFrom(fromK);
        setTwoTierNewArrowTo(toK);
        if (next.length === 2) {
          const sug = suggestTwoTierRelation(fromK, toK);
          setTwoTierNewArrowLabel(sug.label);
          setTwoTierNewArrowColor(sug.color);
          setTwoTierNewArrowDirection(sug.direction);
        } else {
          const sug = suggestTwoTierMultiRelation(next);
          setTwoTierNewArrowLabel(sug.label);
          setTwoTierNewArrowColor(sug.color);
        }
        setTwoTierShowArrowCreator(true);
      }
      return next;
    });
  };

  const handleTwoTierAddArrow = () => {
    if (!twoTierNewArrowFrom || !twoTierNewArrowTo || twoTierNewArrowFrom === twoTierNewArrowTo) return;
    const newArrow: ThucThiArrowLink = {
      id: `tt-arrow-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      fromKey: twoTierNewArrowFrom,
      toKey: twoTierNewArrowTo,
      label: twoTierNewArrowLabel.trim() || "Tương Tác",
      direction: twoTierNewArrowDirection,
      color: twoTierNewArrowColor,
    };
    setTwoTierArrows((prev) => [...prev, newArrow]);
    setTwoTierSelectedNodes([]);
    setTwoTierShowArrowCreator(false);
    setTimeout(updateTwoTierCoords, 50);
  };

  const handleTwoTierConnectMultiple = (
    mode: "chain" | "cycle" | "all_to_all" | "to_target" | "from_source" | "first_to_last"
  ) => {
    if (twoTierSelectedNodes.length < 2) return;
    const newLinks: ThucThiArrowLink[] = [];
    const color = twoTierNewArrowColor || "#F59E0B";
    const label = twoTierNewArrowLabel.trim() || "Tương Tác";
    const dir = twoTierNewArrowDirection;

    if (mode === "chain") {
      for (let i = 0; i < twoTierSelectedNodes.length - 1; i++) {
        newLinks.push({
          id: `tt-arrow-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
          fromKey: twoTierSelectedNodes[i],
          toKey: twoTierSelectedNodes[i + 1],
          label,
          direction: dir,
          color,
        });
      }
    } else if (mode === "cycle") {
      for (let i = 0; i < twoTierSelectedNodes.length; i++) {
        const nextIdx = (i + 1) % twoTierSelectedNodes.length;
        newLinks.push({
          id: `tt-arrow-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
          fromKey: twoTierSelectedNodes[i],
          toKey: twoTierSelectedNodes[nextIdx],
          label,
          direction: dir,
          color,
        });
      }
    } else if (mode === "all_to_all") {
      for (let i = 0; i < twoTierSelectedNodes.length; i++) {
        for (let j = i + 1; j < twoTierSelectedNodes.length; j++) {
          newLinks.push({
            id: `tt-arrow-${Date.now()}-${i}-${j}-${Math.random().toString(36).slice(2, 6)}`,
            fromKey: twoTierSelectedNodes[i],
            toKey: twoTierSelectedNodes[j],
            label,
            direction: "both",
            color,
          });
        }
      }
    } else if (mode === "to_target") {
      const target = twoTierSelectedNodes[twoTierSelectedNodes.length - 1];
      for (let i = 0; i < twoTierSelectedNodes.length - 1; i++) {
        newLinks.push({
          id: `tt-arrow-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
          fromKey: twoTierSelectedNodes[i],
          toKey: target,
          label,
          direction: "forward",
          color,
        });
      }
    } else if (mode === "from_source") {
      const source = twoTierSelectedNodes[0];
      for (let i = 1; i < twoTierSelectedNodes.length; i++) {
        newLinks.push({
          id: `tt-arrow-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
          fromKey: source,
          toKey: twoTierSelectedNodes[i],
          label,
          direction: "forward",
          color,
        });
      }
    } else if (mode === "first_to_last") {
      newLinks.push({
        id: `tt-arrow-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        fromKey: twoTierSelectedNodes[0],
        toKey: twoTierSelectedNodes[twoTierSelectedNodes.length - 1],
        label,
        direction: dir,
        color,
      });
    }

    setTwoTierArrows((prev) => [...prev, ...newLinks]);
    setTwoTierSelectedNodes([]);
    setTwoTierShowArrowCreator(false);
    setTimeout(updateTwoTierCoords, 50);
  };

  const handleTwoTierStartEditArrow = (arrow: ThucThiArrowLink) => {
    setTwoTierEditingArrowId(arrow.id);
    setTwoTierEditingArrowLabel(arrow.label);
    setTwoTierEditingArrowColor(arrow.color || "#F59E0B");
    setTwoTierEditingArrowDirection(arrow.direction);
  };

  const handleTwoTierSaveEditArrow = () => {
    if (!twoTierEditingArrowId) return;
    setTwoTierArrows((prev) =>
      prev.map((a) =>
        a.id === twoTierEditingArrowId
          ? {
              ...a,
              label: twoTierEditingArrowLabel.trim() || a.label,
              color: twoTierEditingArrowColor,
              direction: twoTierEditingArrowDirection,
            }
          : a
      )
    );
    setTwoTierEditingArrowId(null);
  };

  const handleTwoTierResetArrowOffsets = (arrowId: string) => {
    setTwoTierArrows((prev) =>
      prev.map((a) =>
        a.id === arrowId
          ? {
              ...a,
              badgeOffset: { x: 0, y: 0 },
              curveOffset: { x: 0, y: 0 },
              startOffset: { x: 0, y: 0 },
              endOffset: { x: 0, y: 0 },
            }
          : a
      )
    );
  };

  const handleTwoTierNudgeArrow = (
    arrowId: string,
    target: "arrow" | "curve" | "badge",
    dx: number,
    dy: number
  ) => {
    setTwoTierArrows((prev) =>
      prev.map((a) => {
        if (a.id !== arrowId) return a;
        if (target === "arrow") {
          return {
            ...a,
            startOffset: { x: (a.startOffset?.x || 0) + dx, y: (a.startOffset?.y || 0) + dy },
            endOffset: { x: (a.endOffset?.x || 0) + dx, y: (a.endOffset?.y || 0) + dy },
            curveOffset: { x: (a.curveOffset?.x || 0) + dx, y: (a.curveOffset?.y || 0) + dy },
          };
        }
        if (target === "curve") {
          return {
            ...a,
            curveOffset: { x: (a.curveOffset?.x || 0) + dx, y: (a.curveOffset?.y || 0) + dy },
          };
        }
        if (target === "badge") {
          return {
            ...a,
            badgeOffset: { x: (a.badgeOffset?.x || 0) + dx, y: (a.badgeOffset?.y || 0) + dy },
          };
        }
        return a;
      })
    );
  };

  const handleTwoTierPointerDownBadge = (e: React.PointerEvent, arrowId: string) => {
    e.stopPropagation();
    e.preventDefault();
    const arrow = twoTierArrows.find((a) => a.id === arrowId);
    if (!arrow) return;
    setTwoTierDraggingItem({
      type: "badge",
      arrowId,
      startX: e.clientX,
      startY: e.clientY,
      initialBadgeOffset: { ...(arrow.badgeOffset || { x: 0, y: 0 }) },
      initialCurveOffset: { ...(arrow.curveOffset || { x: 0, y: 0 }) },
      initialStartOffset: { ...(arrow.startOffset || { x: 0, y: 0 }) },
      initialEndOffset: { ...(arrow.endOffset || { x: 0, y: 0 }) },
    });
  };

  const handleTwoTierPointerDownCurve = (e: React.PointerEvent, arrowId: string) => {
    e.stopPropagation();
    e.preventDefault();
    const arrow = twoTierArrows.find((a) => a.id === arrowId);
    if (!arrow) return;
    setTwoTierDraggingItem({
      type: "curve",
      arrowId,
      startX: e.clientX,
      startY: e.clientY,
      initialBadgeOffset: { ...(arrow.badgeOffset || { x: 0, y: 0 }) },
      initialCurveOffset: { ...(arrow.curveOffset || { x: 0, y: 0 }) },
      initialStartOffset: { ...(arrow.startOffset || { x: 0, y: 0 }) },
      initialEndOffset: { ...(arrow.endOffset || { x: 0, y: 0 }) },
    });
  };

  const handleTwoTierPointerDownLine = (e: React.PointerEvent, arrowId: string) => {
    e.stopPropagation();
    e.preventDefault();
    const arrow = twoTierArrows.find((a) => a.id === arrowId);
    if (!arrow) return;
    setTwoTierDraggingItem({
      type: "arrow_line",
      arrowId,
      startX: e.clientX,
      startY: e.clientY,
      initialBadgeOffset: { ...(arrow.badgeOffset || { x: 0, y: 0 }) },
      initialCurveOffset: { ...(arrow.curveOffset || { x: 0, y: 0 }) },
      initialStartOffset: { ...(arrow.startOffset || { x: 0, y: 0 }) },
      initialEndOffset: { ...(arrow.endOffset || { x: 0, y: 0 }) },
    });
  };

  const handleTwoTierPointerDownEndpoint = (
    e: React.PointerEvent,
    arrowId: string,
    which: "start" | "end"
  ) => {
    e.stopPropagation();
    e.preventDefault();
    const arrow = twoTierArrows.find((a) => a.id === arrowId);
    if (!arrow) return;
    setTwoTierDraggingItem({
      type: which === "start" ? "endpoint_start" : "endpoint_end",
      arrowId,
      startX: e.clientX,
      startY: e.clientY,
      initialBadgeOffset: { ...(arrow.badgeOffset || { x: 0, y: 0 }) },
      initialCurveOffset: { ...(arrow.curveOffset || { x: 0, y: 0 }) },
      initialStartOffset: { ...(arrow.startOffset || { x: 0, y: 0 }) },
      initialEndOffset: { ...(arrow.endOffset || { x: 0, y: 0 }) },
    });
  };

  useEffect(() => {
    if (!twoTierDraggingItem) return;

    const onPointerMove = (e: PointerEvent) => {
      const dx = e.clientX - twoTierDraggingItem.startX;
      const dy = e.clientY - twoTierDraggingItem.startY;

      setTwoTierArrows((prev) =>
        prev.map((a) => {
          if (a.id !== twoTierDraggingItem.arrowId) return a;
          if (twoTierDraggingItem.type === "badge") {
            return {
              ...a,
              badgeOffset: {
                x: twoTierDraggingItem.initialBadgeOffset.x + dx,
                y: twoTierDraggingItem.initialBadgeOffset.y + dy,
              },
            };
          }
          if (twoTierDraggingItem.type === "curve") {
            return {
              ...a,
              curveOffset: {
                x: twoTierDraggingItem.initialCurveOffset.x + dx,
                y: twoTierDraggingItem.initialCurveOffset.y + dy,
              },
            };
          }
          if (twoTierDraggingItem.type === "arrow_line") {
            return {
              ...a,
              curveOffset: {
                x: twoTierDraggingItem.initialCurveOffset.x + dx,
                y: twoTierDraggingItem.initialCurveOffset.y + dy,
              },
              startOffset: {
                x: twoTierDraggingItem.initialStartOffset.x + dx,
                y: twoTierDraggingItem.initialStartOffset.y + dy,
              },
              endOffset: {
                x: twoTierDraggingItem.initialEndOffset.x + dx,
                y: twoTierDraggingItem.initialEndOffset.y + dy,
              },
            };
          }
          if (twoTierDraggingItem.type === "endpoint_start") {
            return {
              ...a,
              startOffset: {
                x: twoTierDraggingItem.initialStartOffset.x + dx,
                y: twoTierDraggingItem.initialStartOffset.y + dy,
              },
            };
          }
          if (twoTierDraggingItem.type === "endpoint_end") {
            return {
              ...a,
              endOffset: {
                x: twoTierDraggingItem.initialEndOffset.x + dx,
                y: twoTierDraggingItem.initialEndOffset.y + dy,
              },
            };
          }
          return a;
        })
      );
    };

    const onPointerUp = () => {
      setTwoTierDraggingItem(null);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [twoTierDraggingItem]);

  const handleSelectTwoTierAll = () => {
    const allKeys = twoTierAllNodesList.map((n) => n.key);
    setTwoTierSelectedNodes(allKeys);
    if (allKeys.length >= 2) {
      setTwoTierNewArrowFrom(allKeys[0]);
      setTwoTierNewArrowTo(allKeys[allKeys.length - 1]);
      setTwoTierNewArrowLabel("Tương Tác 2 Tầng");
      setTwoTierNewArrowColor("#F59E0B");
      setTwoTierShowArrowCreator(true);
    }
  };

  const handleSelectTwoTierTop = () => {
    const topKeys = twoTierAllNodesList
      .filter((n) => n.zone.startsWith("top_"))
      .map((n) => n.key);
    setTwoTierSelectedNodes(topKeys);
    if (topKeys.length >= 2) {
      setTwoTierNewArrowFrom(topKeys[0]);
      setTwoTierNewArrowTo(topKeys[topKeys.length - 1]);
      setTwoTierNewArrowLabel("Tương Tác Tầng Trên");
      setTwoTierNewArrowColor("#10B981");
      setTwoTierShowArrowCreator(true);
    }
  };

  const handleSelectTwoTierBottom = () => {
    const bottomKeys = twoTierAllNodesList
      .filter((n) => n.zone.startsWith("bottom_") || n.zone === "middle_same")
      .map((n) => n.key);
    setTwoTierSelectedNodes(bottomKeys);
    if (bottomKeys.length >= 2) {
      setTwoTierNewArrowFrom(bottomKeys[0]);
      setTwoTierNewArrowTo(bottomKeys[bottomKeys.length - 1]);
      setTwoTierNewArrowLabel("Tương Tác Tầng Dưới");
      setTwoTierNewArrowColor("#06B6D4");
      setTwoTierShowArrowCreator(true);
    }
  };

  const handleSelectTwoTierOppose = () => {
    const oppKeys = displayedTopOppose.map((p) => `twoTier-${p.key}`);
    const keys = ["twoTier-luunien", ...oppKeys];
    setTwoTierSelectedNodes(keys);
    if (keys.length >= 2) {
      setTwoTierNewArrowFrom(keys[0]);
      setTwoTierNewArrowTo(keys[1]);
      setTwoTierNewArrowLabel("Xung Đối Diện Lưu Niên");
      setTwoTierNewArrowColor("#EF4444");
      setTwoTierShowArrowCreator(true);
    }
  };

  const handleSelectTwoTierLuuNien = () => {
    setTwoTierSelectedNodes(["twoTier-luunien"]);
  };

  const getRatingBadgeStyle = (rating: ThucThiBranchRating | null | undefined, isButton = false) => {
    switch (rating) {
      case "Hỷ":
        return isButton
          ? "bg-emerald-900/90 text-emerald-200 border-emerald-400 ring-1 ring-emerald-400 font-bold shadow-sm shadow-emerald-500/20"
          : "bg-emerald-950 text-emerald-300 border-emerald-700/80";
      case "Trung Cát":
        return isButton
          ? "bg-teal-900/90 text-teal-200 border-teal-400 ring-1 ring-teal-400 font-bold shadow-sm shadow-teal-500/20"
          : "bg-teal-950 text-teal-300 border-teal-700/80";
      case "Trung":
        return isButton
          ? "bg-amber-900/90 text-amber-200 border-amber-400 ring-1 ring-amber-400 font-bold shadow-sm shadow-amber-500/20"
          : "bg-amber-950/70 text-amber-300 border-amber-700/80";
      case "Trung Kỵ":
        return isButton
          ? "bg-orange-900/90 text-orange-200 border-orange-400 ring-1 ring-orange-400 font-bold shadow-sm shadow-orange-500/20"
          : "bg-orange-950 text-orange-300 border-orange-700/80";
      case "Kỵ":
        return isButton
          ? "bg-rose-900/90 text-rose-200 border-rose-400 ring-1 ring-rose-400 font-bold shadow-sm shadow-rose-500/20"
          : "bg-rose-950 text-rose-300 border-rose-700/80";
      default:
        return "bg-[#1C140D] text-[#8C7D6B] border-[#3D2C1A]";
    }
  };

  return (
    <div
      className={`p-3 sm:p-5 rounded-2xl bg-gradient-to-b from-[#1A140F] via-[#15100B] to-[#100C08] border border-[#6B4E28] shadow-2xl ${className}`}
    >
      {/* Header Thực Thi Thiên / Lưu Niên Thiên */}
      <div className="flex flex-row items-center justify-between gap-2 pb-2.5 sm:pb-3 border-b border-[#44321D]">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 text-[#F5EAD4] flex items-center justify-center shadow-lg shrink-0 ring-1 ring-amber-500/50">
            <PlayCircle className="w-4 h-4 text-amber-200" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs sm:text-base font-bold text-[#F5EAD4] font-serif tracking-wide truncate">
                {title || "THỰC THI THIÊN (實施篇)"}
              </h3>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-950/90 text-amber-300 border border-amber-600/70 font-semibold font-mono">
                {badgeLabel || "Nguyên Cục + Hành Vận ⟷ Lưu Niên"}
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-[#A89882] mt-0.5 line-clamp-1">
              {subTitle ||
                `Phân tích tương tác giữa Nguyên Cục cộng Hành Vận (5 Trụ) đối với Địa Chi Lưu Niên (${luuNienInfo.fullName} ${selectedYear}).`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {(onSaveToBazi || storageKeyPrefix) && (
            <button
              type="button"
              onClick={handleSaveSettings}
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] sm:text-xs font-bold rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:from-[#F3CE65] hover:to-[#C69214] text-[#1A1208] shadow-sm shadow-[#D4AF37]/20 transition-all cursor-pointer active:scale-95 whitespace-nowrap"
              title={saveButtonText ? `Lưu thiết lập ${saveButtonText}` : "Lưu thiết lập vào hệ thống"}
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saveButtonText || "Lưu Vào Bát Tự"}</span>
            </button>
          )}

          {onCapture && (
            <button
              type="button"
              onClick={async () => {
                if (!isOpen) {
                  setIsOpen(true);
                  await new Promise((r) => setTimeout(r, 320));
                }
                onCapture();
              }}
              className="no-capture flex items-center gap-1 px-2.5 py-1 text-[11px] sm:text-xs font-semibold rounded-lg bg-[#271E15] hover:bg-[#382B1E] text-amber-200 border border-[#523F27] hover:border-[#D4AF37] transition-all cursor-pointer shadow-sm active:scale-95 whitespace-nowrap"
              title={captureButtonText ? `Chụp ảnh riêng ${captureButtonText}` : "Chụp ảnh riêng"}
            >
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span>{captureButtonText || "Chụp Thực Thi"}</span>
            </button>
          )}

          {onDownload && (
            <button
              type="button"
              onClick={async () => {
                if (!isOpen) {
                  setIsOpen(true);
                  await new Promise((r) => setTimeout(r, 320));
                }
                onDownload();
              }}
              className="no-capture flex items-center gap-1 px-2.5 py-1 text-[11px] sm:text-xs font-semibold rounded-lg bg-gradient-to-r from-amber-700/80 to-amber-900/80 hover:brightness-110 text-amber-100 border border-amber-600/60 hover:border-amber-400 transition-all cursor-pointer shadow-sm active:scale-95 whitespace-nowrap"
              title={downloadButtonText ? `Tải ảnh riêng ${downloadButtonText} về máy tính` : "Tải ảnh riêng về máy tính"}
            >
              <Download className="w-3.5 h-3.5 text-amber-300" />
              <span>{downloadButtonText || "Tải Ảnh"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 px-2 py-1 text-[11px] sm:text-xs font-medium rounded-lg bg-[#271C11] text-[#E2B755] border border-[#4D3620] hover:bg-[#382717] transition-all cursor-pointer whitespace-nowrap"
          >
            <span>{isOpen ? "Thu Gọn" : "Mở Rộng"}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Thông báo Toast */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 px-4 py-2 rounded-xl bg-[#291B0F] border border-[#D4AF37] text-[#FFE28A] font-serif text-xs font-bold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <span>✨</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {isOpen && (
        <div className="mt-3 sm:mt-4 text-xs space-y-3.5">
          {/* =================================================================
              BỘ CHỌN NĂM LƯU NIÊN KHẢO SÁT & HIỂN THỊ HÀNH VẬN
              ================================================================= */}
          <div className="p-2.5 sm:p-3 rounded-xl bg-[#171109] border border-[#44301D] space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1.5 border-b border-[#2C1D10]">
              <div className="flex items-center gap-2 flex-wrap">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-[#E2B755] text-xs sm:text-sm">
                  Lưu Niên Khảo Sát:
                </span>
                <span className="text-amber-200 font-serif font-bold text-sm sm:text-base flex items-center gap-1.5">
                  <span>{luuNienInfo.fullName}</span>
                  <span className="text-amber-400 font-mono text-xs sm:text-sm">({selectedYear})</span>
                  <span className="text-xs text-[#A89882]">[{luuNienInfo.napAm}]</span>
                </span>
              </div>

              {/* Điều khiển năm nhanh & Hình Chi Lưu Niên ở bên phải sau cùng */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Điều khiển năm nhanh */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedYear((y) => y - 1)}
                    className="p-1 rounded-lg bg-[#24170E] hover:bg-[#352214] border border-[#4D3620] text-[#E2B755] transition-all cursor-pointer"
                    title="Năm trước"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-2.5 py-0.5 rounded-lg bg-[#2E1D11] border border-amber-600/60 font-mono font-bold text-amber-300 text-xs">
                    {selectedYear}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedYear((y) => y + 1)}
                    className="p-1 rounded-lg bg-[#24170E] hover:bg-[#352214] border border-[#4D3620] text-[#E2B755] transition-all cursor-pointer"
                    title="Năm sau"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedYear(new Date().getFullYear())}
                    className="text-[10px] px-2 py-1 rounded-lg bg-[#24170E] hover:bg-[#352214] border border-[#4D3620] text-[#A89882] hover:text-amber-200 transition-all cursor-pointer font-semibold ml-1"
                  >
                    Hiện Tại
                  </button>
                </div>

                {/* HÌNH CHI LƯU NIÊN Ở BÊN PHẢI SAU CÙNG */}
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-gradient-to-r from-[#2B1B0F] via-[#382313] to-[#24160B] border-2 border-amber-500/80 shadow-md shadow-amber-600/25 ring-1 ring-amber-400/50 shrink-0">
                  <span className="text-2xl sm:text-3xl leading-none select-none drop-shadow">
                    {targetChiData?.emoji || "⭐"}
                  </span>
                  <div className="flex flex-col text-left leading-none">
                    <div className="flex items-center gap-1">
                      <span className="font-serif font-bold text-amber-200 text-xs sm:text-sm">
                        {selectedLuuNienChi}
                      </span>
                      <span className="text-[10px] text-amber-400 font-serif font-bold">
                        ({targetChiData?.chinese || ""})
                      </span>
                    </div>
                    <span className="text-[9px] text-[#D8C7B0] font-semibold mt-0.5">
                      {targetChiData?.zodiac ? `Chi ${selectedLuuNienChi} (${targetChiData.zodiac})` : `Chi ${selectedLuuNienChi}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* THÔNG TIN CAN CHI CỦA TẤT CẢ 6 TRỤ CHUNG 1 HÀNG (GIỜ • NGÀY • THÁNG • NĂM • ĐẠI VẬN • LƯU NIÊN) */}
            <div className="space-y-2 pt-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-1.5 text-[11px] text-[#C4B49F]">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-[#E2B755] flex items-center gap-1.5">
                    <MousePointerClick className="w-3.5 h-3.5 text-amber-400" />
                    <span>Can Chi Bát Tự Toàn Hệ Thống (Trụ Giờ • Trụ Ngày • Trụ Tháng • Trụ Năm • Đại Vận • Lưu Niên)</span>
                  </span>
                  <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-700/60 font-semibold">
                    Bấm chọn Can Chi để thêm Mũi Tên &amp; Kết Nối Nhiều Ô
                  </span>
                </div>

                {/* CÁC NÚT CHỌN NHANH BỘ Ô VÀ ĐIỀU KHIỂN ĐƯỜNG DẪN */}
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-[9.5px] text-[#8C7D6B] font-semibold mr-0.5">Chọn nhanh:</span>
                  <button
                    type="button"
                    onClick={() => setColumnOrder((prev) => (prev === "bazi" ? "luunien_first" : "bazi"))}
                    className="px-1.5 py-0.5 text-[9.5px] font-bold rounded bg-[#24170E] hover:bg-[#382415] text-amber-300 border border-amber-700/60 transition-all cursor-pointer flex items-center gap-1"
                    title="Đổi thứ tự hiển thị: Giờ ➔ Năm ➔ Vận hoặc Lưu Niên ➔ Tứ Trụ"
                  >
                    <ArrowLeftRight className="w-3 h-3 text-amber-400" />
                    <span>{columnOrder === "bazi" ? "Thứ tự: Giờ ➔ Vận" : "Thứ tự: L.Niên ➔ Trụ"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSelectAllCan}
                    className="px-1.5 py-0.5 text-[9.5px] font-bold rounded bg-[#24170E] hover:bg-[#382415] text-emerald-300 border border-emerald-700/60 transition-all cursor-pointer"
                    title="Chọn nhanh toàn bộ 6 Thiên Can để liên kết chuỗi can"
                  >
                    ⚡ 6 Thiên Can
                  </button>
                  <button
                    type="button"
                    onClick={handleSelectAllChi}
                    className="px-1.5 py-0.5 text-[9.5px] font-bold rounded bg-[#24170E] hover:bg-[#382415] text-purple-300 border border-purple-700/60 transition-all cursor-pointer"
                    title="Chọn nhanh toàn bộ 6 Địa Chi để liên kết chuỗi chi"
                  >
                    ⚡ 6 Địa Chi
                  </button>
                  <button
                    type="button"
                    onClick={handleSelectNguyenCucChi}
                    className="px-1.5 py-0.5 text-[9.5px] font-bold rounded bg-[#24170E] hover:bg-[#382415] text-amber-300 border border-amber-700/60 transition-all cursor-pointer"
                    title="Chọn nhanh 4 Chi Bát Tự Nguyên Cục (Giờ, Ngày, Tháng, Năm)"
                  >
                    ⚡ 4 Chi Bát Tự
                  </button>
                  <button
                    type="button"
                    onClick={handleSelectTamHopIfAny}
                    className="px-1.5 py-0.5 text-[9.5px] font-bold rounded bg-[#24170E] hover:bg-[#382415] text-indigo-300 border border-indigo-700/60 transition-all cursor-pointer"
                    title="Tự động phát hiện và chọn nhóm Tam Hợp có mặt"
                  >
                    ⚡ Tam Hợp
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowTableEmoji(!showTableEmoji)}
                    className={`px-1.5 py-0.5 text-[9.5px] font-bold rounded border transition-all cursor-pointer ${
                      !showTableEmoji
                        ? "bg-amber-950/90 text-amber-300 border-amber-600/70 shadow-sm"
                        : "bg-[#24170E] text-[#A89882] border-[#44301D] hover:bg-[#382415] hover:text-amber-200"
                    }`}
                    title={showTableEmoji ? "Bấm để chuyển sang chế độ chỉ hiện thông tin chữ (không hiện icon/emoji)" : "Bấm để hiện thêm icon con giáp trong bảng"}
                  >
                    {showTableEmoji ? "🐾 Hiện Icon" : "🔤 Chỉ Hiện Chữ"}
                  </button>

                  {arrows.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowArrows(!showArrows)}
                      className={`px-1.5 py-0.5 text-[9.5px] font-bold rounded border transition-all cursor-pointer flex items-center gap-1 ml-1 ${
                        showArrows
                          ? "bg-amber-950/80 text-amber-300 border-amber-600/80"
                          : "bg-stone-900 text-stone-400 border-stone-700"
                      }`}
                      title={showArrows ? "Tạm ẩn các đường dẫn / mũi tên" : "Hiển thị lại đường dẫn"}
                    >
                      {showArrows ? <Eye className="w-3 h-3 text-amber-400" /> : <EyeOff className="w-3 h-3" />}
                      <span>{showArrows ? `Hiện (${arrows.length})` : `Ẩn (${arrows.length})`}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* KHUNG CHỨA 6 CỘT & OVERLAY SVG MŨI TÊN / ĐƯỜNG DẪN */}
              <div className="w-full pb-3 -mx-1 px-1 sm:mx-0 sm:px-0 overflow-x-auto scrollbar-thin">
                <div ref={nodeContainerRef} className="relative w-full min-w-0 pt-4 pb-4">
                  {/* SVG OVERLAY VẼ ĐƯỜNG DẪN VÀ MŨI TÊN */}
                  {showArrows && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
                      <defs>
                        {arrows.map((a) => {
                          const c = a.color || "#F59E0B";
                          return (
                            <React.Fragment key={`defs-${a.id}`}>
                              <marker
                                id={`arrow-head-${a.id}`}
                                viewBox="0 0 10 10"
                                refX="7"
                                refY="5"
                                markerWidth="6"
                                markerHeight="6"
                                orient="auto"
                              >
                                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill={c} />
                              </marker>
                              <marker
                                id={`arrow-tail-${a.id}`}
                                viewBox="0 0 10 10"
                                refX="3"
                                refY="5"
                                markerWidth="6"
                                markerHeight="6"
                                orient="auto-start-reverse"
                              >
                                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill={c} />
                              </marker>
                            </React.Fragment>
                          );
                        })}
                      </defs>

                      {arrows.map((a, index) => {
                        const fromCoord = coordsMap[a.fromKey];
                        const toCoord = coordsMap[a.toKey];
                        if (!fromCoord || !toCoord) return null;

                        const startX = fromCoord.x + (a.startOffset?.x || 0);
                        const startY = fromCoord.y + (a.startOffset?.y || 0);
                        const endX = toCoord.x + (a.endOffset?.x || 0);
                        const endY = toCoord.y + (a.endOffset?.y || 0);
                        const color = a.color || "#F59E0B";

                        const dx = endX - startX;
                        const dy = endY - startY;

                        const isBothCan = a.fromKey.endsWith("-can") && a.toKey.endsWith("-can");
                        const isBothChi = a.fromKey.endsWith("-chi") && a.toKey.endsWith("-chi");
                        const archOffset = (index % 4) * 6;

                        const curveOffsetX = a.curveOffset?.x || 0;
                        const curveOffsetY = a.curveOffset?.y || 0;

                        let d = "";
                        let ctrlX = (startX + endX) / 2 + curveOffsetX;
                        let ctrlY = (startY + endY) / 2 + curveOffsetY;

                        if (isBothCan) {
                          const archHeight = Math.min(75, Math.max(22, Math.abs(dx) * 0.22 + archOffset));
                          ctrlY = Math.min(startY, endY) - archHeight + curveOffsetY;
                          d = `M ${startX} ${startY - 18} Q ${ctrlX} ${ctrlY} ${endX} ${endY - 18}`;
                        } else if (isBothChi) {
                          const archHeight = Math.min(75, Math.max(22, Math.abs(dx) * 0.22 + archOffset));
                          ctrlY = Math.max(startY, endY) + archHeight + curveOffsetY;
                          d = `M ${startX} ${startY + 18} Q ${ctrlX} ${ctrlY} ${endX} ${endY + 18}`;
                        } else {
                          const offset = ((index % 3) - 1) * 12;
                          const cx1 = startX + dx * 0.25 + curveOffsetX * 0.7;
                          const cy1 = startY + dy * 0.5 + offset + curveOffsetY;
                          const cx2 = startX + dx * 0.75 + curveOffsetX * 0.7;
                          const cy2 = startY + dy * 0.5 + offset + curveOffsetY;
                          d = `M ${startX} ${startY} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${endX} ${endY}`;
                          ctrlX = (startX + endX) / 2 + curveOffsetX;
                          ctrlY = (cy1 + cy2) / 2;
                        }

                        const hasForward = a.direction === "forward" || a.direction === "both";
                        const hasBackward = a.direction === "backward" || a.direction === "both";
                        const isHovered = hoveredArrowId === a.id;
                        const isEditing = editingArrowId === a.id;

                        const effStartY = isBothCan ? startY - 18 : isBothChi ? startY + 18 : startY;
                        const effEndY = isBothCan ? endY - 18 : isBothChi ? endY + 18 : endY;

                        return (
                          <g
                            key={`arrow-group-${a.id}`}
                            className="transition-all"
                            onMouseEnter={() => setHoveredArrowId(a.id)}
                            onMouseLeave={() => setHoveredArrowId((cur) => (cur === a.id ? null : cur))}
                          >
                            {/* Đường tàng hình rộng để dễ bắt thao tác kéo toàn bộ mũi tên hoặc nhấp đúp để sửa */}
                            <path
                              d={d}
                              fill="none"
                              stroke="transparent"
                              strokeWidth="24"
                              className="pointer-events-auto cursor-move touch-none"
                              onPointerDown={(e) => handlePointerDownLine(e, a.id)}
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                handleStartEditArrow(a);
                              }}
                            >
                              <title>Kéo để di chuyển toàn bộ mũi tên • Nhấp đúp để sửa nội dung</title>
                            </path>

                            {/* Đường viền phát sáng khi hover hoặc đang sửa */}
                            <path
                              d={d}
                              fill="none"
                              stroke={color}
                              strokeWidth={isHovered || isEditing ? "6.5" : "4.5"}
                              strokeOpacity={isHovered || isEditing ? "0.5" : "0.22"}
                            />

                            {/* Đường nét chính mũi tên (có thể kéo để di chuyển) */}
                            <path
                              d={d}
                              fill="none"
                              stroke={color}
                              strokeWidth={isHovered || isEditing ? "3" : "2.2"}
                              strokeDasharray={a.direction === "none" ? "5 3" : undefined}
                              markerEnd={hasForward ? `url(#arrow-head-${a.id})` : undefined}
                              markerStart={hasBackward ? `url(#arrow-tail-${a.id})` : undefined}
                              className="pointer-events-auto cursor-move touch-none"
                              onPointerDown={(e) => handlePointerDownLine(e, a.id)}
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                handleStartEditArrow(a);
                              }}
                            >
                              <title>Kéo để di chuyển mũi tên • Nhấp đúp để sửa</title>
                            </path>

                            {/* Đường gióng điều khiển uốn cong (Dashed guide line) */}
                            {(isHovered || isEditing) && (
                              <line
                                x1={(startX + endX) / 2}
                                y1={(effStartY + effEndY) / 2}
                                x2={ctrlX}
                                y2={ctrlY}
                                stroke={color}
                                strokeWidth="1"
                                strokeDasharray="3 2"
                                opacity="0.6"
                              />
                            )}

                            {/* Điểm điều khiển uốn cong đường dẫn (Draggable Curve Control Point) */}
                            <g
                              className="pointer-events-auto cursor-grab active:cursor-grabbing touch-none"
                              onPointerDown={(e) => handlePointerDownCurve(e, a.id)}
                            >
                              <circle
                                cx={ctrlX}
                                cy={ctrlY}
                                r={isHovered || isEditing ? "8" : "5.5"}
                                fill={color}
                                stroke="#160E08"
                                strokeWidth="2"
                                className="filter drop-shadow-md transition-transform hover:scale-125"
                              />
                              <circle
                                cx={ctrlX}
                                cy={ctrlY}
                                r="12"
                                fill="none"
                                stroke={color}
                                strokeWidth="1.2"
                                strokeDasharray="2 2"
                                opacity={isHovered || isEditing ? 0.9 : 0.4}
                              />
                              <title>Kéo để uốn cong / đổi độ võng của đường mũi tên</title>
                            </g>

                            {/* Điểm neo đầu mút xuất phát (Start Endpoint Handle) */}
                            {(isHovered || isEditing) && (
                              <g
                                className="pointer-events-auto cursor-move touch-none"
                                onPointerDown={(e) => handlePointerDownEndpoint(e, a.id, "start")}
                              >
                                <circle
                                  cx={startX}
                                  cy={effStartY}
                                  r="5"
                                  fill={color}
                                  stroke="#160E08"
                                  strokeWidth="1.5"
                                  className="transition-transform hover:scale-150 drop-shadow"
                                />
                                <title>Kéo để dịch chuyển điểm bắt đầu của mũi tên</title>
                              </g>
                            )}

                            {/* Điểm neo đầu mút kết thúc (End Endpoint Handle) */}
                            {(isHovered || isEditing) && (
                              <g
                                className="pointer-events-auto cursor-move touch-none"
                                onPointerDown={(e) => handlePointerDownEndpoint(e, a.id, "end")}
                              >
                                <circle
                                  cx={endX}
                                  cy={effEndY}
                                  r="5"
                                  fill={color}
                                  stroke="#160E08"
                                  strokeWidth="1.5"
                                  className="transition-transform hover:scale-150 drop-shadow"
                                />
                                <title>Kéo để dịch chuyển điểm kết thúc của mũi tên</title>
                              </g>
                            )}
                          </g>
                        );
                      })}
                    </svg>
                  )}

                  {/* CÁC HUY HIỆU NHÃN TƯƠNG TÁC NẰM TRÊN ĐƯỜNG DẪN (CÓ THỂ KÉO VÀ SỬA TẠI CHỖ) */}
                  {showArrows &&
                    arrows.map((a, index) => {
                      const fromCoord = coordsMap[a.fromKey];
                      const toCoord = coordsMap[a.toKey];
                      if (!fromCoord || !toCoord) return null;

                      const startX = fromCoord.x + (a.startOffset?.x || 0);
                      const startY = fromCoord.y + (a.startOffset?.y || 0);
                      const endX = toCoord.x + (a.endOffset?.x || 0);
                      const endY = toCoord.y + (a.endOffset?.y || 0);
                      const color = a.color || "#F59E0B";
                      const dx = endX - startX;

                      const isBothCan = a.fromKey.endsWith("-can") && a.toKey.endsWith("-can");
                      const isBothChi = a.fromKey.endsWith("-chi") && a.toKey.endsWith("-chi");
                      const archOffset = (index % 4) * 6;

                      const curveOffsetX = a.curveOffset?.x || 0;
                      const curveOffsetY = a.curveOffset?.y || 0;

                      let ctrlX = (startX + endX) / 2 + curveOffsetX;
                      let ctrlY = (startY + endY) / 2 + curveOffsetY;

                      if (isBothCan) {
                        const archHeight = Math.min(75, Math.max(22, Math.abs(dx) * 0.22 + archOffset));
                        ctrlY = Math.min(startY, endY) - archHeight + curveOffsetY;
                      } else if (isBothChi) {
                        const archHeight = Math.min(75, Math.max(22, Math.abs(dx) * 0.22 + archOffset));
                        ctrlY = Math.max(startY, endY) + archHeight + curveOffsetY;
                      }

                      let midX = ctrlX;
                      let midY = ctrlY;

                      if (isBothCan) {
                        midY = ctrlY * 0.75 + ((startY + endY) / 2 - 18) * 0.25;
                      } else if (isBothChi) {
                        midY = ctrlY * 0.75 + ((startY + endY) / 2 + 18) * 0.25;
                      }

                      const badgeX = midX + (a.badgeOffset?.x || 0);
                      const badgeY = midY + (a.badgeOffset?.y || 0);
                      const hasCustomOffset = Boolean(
                        a.badgeOffset?.x ||
                        a.badgeOffset?.y ||
                        a.curveOffset?.x ||
                        a.curveOffset?.y ||
                        a.startOffset?.x ||
                        a.startOffset?.y
                      );
                      const isEditingThis = editingArrowId === a.id;
                      const isHovered = hoveredArrowId === a.id;

                      return (
                        <div
                          key={`badge-${a.id}`}
                          style={{
                            left: `${badgeX}px`,
                            top: `${badgeY}px`,
                            transform: "translate(-50%, -50%)",
                          }}
                          className="absolute z-20 pointer-events-auto select-none"
                          onMouseEnter={() => setHoveredArrowId(a.id)}
                          onMouseLeave={() => setHoveredArrowId((cur) => (cur === a.id ? null : cur))}
                        >
                          {isEditingThis ? (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="p-2 sm:p-2.5 rounded-xl bg-[#1C130A] border-2 border-amber-400 shadow-2xl space-y-2 min-w-[220px] sm:min-w-[260px] text-xs animate-in zoom-in-95"
                            >
                              <div className="flex items-center justify-between pb-1 border-b border-[#3E2B1A]">
                                <span className="text-[10px] font-bold text-amber-300 flex items-center gap-1">
                                  <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                                  <span>Sửa nội dung mũi tên</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setEditingArrowId(null)}
                                  className="text-stone-400 hover:text-white p-0.5 cursor-pointer"
                                  title="Đóng"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div>
                                <input
                                  autoFocus
                                  type="text"
                                  value={editingArrowLabel}
                                  onChange={(e) => setEditingArrowLabel(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSaveEditArrow();
                                    if (e.key === "Escape") setEditingArrowId(null);
                                  }}
                                  placeholder="Nhập nhãn ghi chú..."
                                  className="w-full px-2 py-1 rounded bg-[#27190E] border border-[#53391F] text-amber-100 text-xs font-semibold focus:outline-none focus:border-amber-400"
                                />
                              </div>

                              {/* Gợi ý nhãn nhanh */}
                              <div className="flex items-center gap-1 flex-wrap text-[8.5px]">
                                {[
                                  "Tam Hợp",
                                  "Tam Hội",
                                  "Lục Hợp",
                                  "Lục Xung",
                                  "Tam Hình",
                                  "Tương Sinh",
                                  "Tương Khắc",
                                  "Tương Hại",
                                  "Hóa Khí",
                                  "Tương Tác",
                                ].map((item) => (
                                  <button
                                    key={item}
                                    type="button"
                                    onClick={() => setEditingArrowLabel(item)}
                                    className="px-1.5 py-0.5 rounded bg-[#2D1D10] hover:bg-[#3D2918] border border-[#4E341C] text-stone-300 hover:text-amber-200 cursor-pointer"
                                  >
                                    {item}
                                  </button>
                                ))}
                              </div>

                              {/* Chọn màu và chiều mũi tên */}
                              <div className="flex items-center justify-between pt-0.5">
                                <div className="flex items-center gap-1">
                                  {[
                                    "#F59E0B",
                                    "#10B981",
                                    "#EF4444",
                                    "#A855F7",
                                    "#F97316",
                                    "#06B6D4",
                                    "#EC4899",
                                  ].map((c) => (
                                    <button
                                      key={c}
                                      type="button"
                                      onClick={() => setEditingArrowColor(c)}
                                      className={`w-4 h-4 rounded-full border transition-transform cursor-pointer ${
                                        editingArrowColor === c
                                          ? "scale-125 border-white ring-1 ring-amber-400"
                                          : "border-stone-800"
                                      }`}
                                      style={{ backgroundColor: c }}
                                    />
                                  ))}
                                </div>

                                <div className="flex items-center gap-0.5">
                                  {[
                                    { key: "forward", label: "➔", title: "Xuôi" },
                                    { key: "backward", label: "⬅", title: "Ngược" },
                                    { key: "both", label: "⟷", title: "Hai chiều" },
                                    { key: "none", label: "──", title: "Nối liền" },
                                  ].map((dir) => (
                                    <button
                                      key={dir.key}
                                      type="button"
                                      onClick={() => setEditingArrowDirection(dir.key as any)}
                                      className={`px-1 py-0.5 text-[9px] rounded border cursor-pointer font-bold ${
                                        editingArrowDirection === dir.key
                                          ? "bg-amber-500 text-stone-950 border-amber-300"
                                          : "bg-[#25180D] text-[#A89882] border-[#442E19]"
                                      }`}
                                      title={dir.title}
                                    >
                                      {dir.label}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* BỘ NÚT TINH CHỈNH VỊ TRÍ MŨI TÊN, ĐƯỜNG CONG VÀ GHI CHÚ */}
                              <div className="pt-1.5 border-t border-[#3E2B1A] space-y-1.5 text-[10px]">
                                <div className="flex items-center justify-between text-[#E2B755] font-semibold text-[9.5px]">
                                  <span>📐 Tinh chỉnh vị trí (Nudge):</span>
                                  {hasCustomOffset && (
                                    <button
                                      type="button"
                                      onClick={() => handleResetArrowOffsets(a.id)}
                                      className="text-[9px] text-[#A89882] hover:text-amber-300 flex items-center gap-0.5 cursor-pointer"
                                      title="Đặt lại vị trí gốc"
                                    >
                                      <RotateCcw className="w-2.5 h-2.5" />
                                      <span>Về gốc</span>
                                    </button>
                                  )}
                                </div>

                                {/* Dịch chuyển toàn bộ mũi tên */}
                                <div className="flex items-center justify-between bg-[#140D07] px-1.5 py-1 rounded border border-[#3A2818]">
                                  <span className="text-[#A89882] text-[9px]">Dịch mũi tên:</span>
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleNudgeArrow(a.id, "arrow", 0, -8)}
                                      className="px-1.5 py-0.5 rounded bg-[#25170D] hover:bg-amber-900/60 border border-[#48311D] text-amber-200 text-[9px] cursor-pointer"
                                      title="Dịch mũi tên lên trên"
                                    >
                                      ↑ Lên
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleNudgeArrow(a.id, "arrow", 0, 8)}
                                      className="px-1.5 py-0.5 rounded bg-[#25170D] hover:bg-amber-900/60 border border-[#48311D] text-amber-200 text-[9px] cursor-pointer"
                                      title="Dịch mũi tên xuống dưới"
                                    >
                                      ↓ Xuống
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleNudgeArrow(a.id, "arrow", -10, 0)}
                                      className="px-1.5 py-0.5 rounded bg-[#25170D] hover:bg-amber-900/60 border border-[#48311D] text-amber-200 text-[9px] cursor-pointer"
                                      title="Dịch mũi tên sang trái"
                                    >
                                      ← Trái
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleNudgeArrow(a.id, "arrow", 10, 0)}
                                      className="px-1.5 py-0.5 rounded bg-[#25170D] hover:bg-amber-900/60 border border-[#48311D] text-amber-200 text-[9px] cursor-pointer"
                                      title="Dịch mũi tên sang phải"
                                    >
                                      → Phải
                                    </button>
                                  </div>
                                </div>

                                {/* Uốn cong đường dẫn */}
                                <div className="flex items-center justify-between bg-[#140D07] px-1.5 py-1 rounded border border-[#3A2818]">
                                  <span className="text-[#A89882] text-[9px]">Uốn cong đường:</span>
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleNudgeArrow(a.id, "curve", 0, -10)}
                                      className="px-2 py-0.5 rounded bg-[#25170D] hover:bg-amber-900/60 border border-[#48311D] text-amber-200 text-[9px] cursor-pointer"
                                      title="Uốn cong đường dẫn lên trên"
                                    >
                                      ⤴ Uốn Lên
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleNudgeArrow(a.id, "curve", 0, 10)}
                                      className="px-2 py-0.5 rounded bg-[#25170D] hover:bg-amber-900/60 border border-[#48311D] text-amber-200 text-[9px] cursor-pointer"
                                      title="Uốn cong đường dẫn xuống dưới"
                                    >
                                      ⤵ Uốn Xuống
                                    </button>
                                  </div>
                                </div>

                                {/* Dịch chuyển ghi chú */}
                                <div className="flex items-center justify-between bg-[#140D07] px-1.5 py-1 rounded border border-[#3A2818]">
                                  <span className="text-[#A89882] text-[9px]">Dịch ghi chú:</span>
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleNudgeArrow(a.id, "badge", 0, -8)}
                                      className="px-1.5 py-0.5 rounded bg-[#25170D] hover:bg-amber-900/60 border border-[#48311D] text-amber-200 text-[9px] cursor-pointer"
                                      title="Dịch ghi chú lên"
                                    >
                                      ↑ Lên
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleNudgeArrow(a.id, "badge", 0, 8)}
                                      className="px-1.5 py-0.5 rounded bg-[#25170D] hover:bg-amber-900/60 border border-[#48311D] text-amber-200 text-[9px] cursor-pointer"
                                      title="Dịch ghi chú xuống"
                                    >
                                      ↓ Xuống
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleNudgeArrow(a.id, "badge", -10, 0)}
                                      className="px-1.5 py-0.5 rounded bg-[#25170D] hover:bg-amber-900/60 border border-[#48311D] text-amber-200 text-[9px] cursor-pointer"
                                      title="Dịch ghi chú sang trái"
                                    >
                                      ← Trái
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleNudgeArrow(a.id, "badge", 10, 0)}
                                      className="px-1.5 py-0.5 rounded bg-[#25170D] hover:bg-amber-900/60 border border-[#48311D] text-amber-200 text-[9px] cursor-pointer"
                                      title="Dịch ghi chú sang phải"
                                    >
                                      → Phải
                                    </button>
                                  </div>
                                </div>

                                <div className="text-[8.5px] text-stone-400 italic">
                                  💡 Kéo thả trực tiếp: thân mũi tên, chấm tròn uốn cong hoặc chữ ghi chú trên màn hình.
                                </div>
                              </div>

                              {/* Các nút hành động */}
                              <div className="flex items-center justify-between pt-1 border-t border-[#3E2B1A]">
                                {hasCustomOffset && (
                                  <button
                                    type="button"
                                    onClick={() => handleResetArrowOffsets(a.id)}
                                    className="text-[9.5px] text-[#A89882] hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                                    title="Đặt lại vị trí ghi chú và đường uốn cong về gốc"
                                  >
                                    <RotateCcw className="w-3 h-3" />
                                    <span>Về gốc</span>
                                  </button>
                                )}
                                <div className="flex items-center gap-1.5 ml-auto">
                                  <button
                                    type="button"
                                    onClick={() => setEditingArrowId(null)}
                                    className="px-2 py-0.5 rounded text-[10px] text-stone-400 hover:text-white cursor-pointer"
                                  >
                                    Hủy
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleSaveEditArrow}
                                    className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-[10px] shadow cursor-pointer flex items-center gap-1"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>Lưu</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div
                              className={`group flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold shadow-xl border backdrop-blur-md transition-all cursor-move touch-none ${
                                isHovered
                                  ? "ring-2 ring-amber-400 scale-105 shadow-amber-500/30"
                                  : "hover:scale-105"
                              }`}
                              style={{
                                backgroundColor: "#160E08F5",
                                borderColor: color,
                                color: color,
                              }}
                              onPointerDown={(e) => handlePointerDownBadge(e, a.id)}
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                handleStartEditArrow(a);
                              }}
                              title="Kéo để di chuyển ghi chú • Nhấp đúp hoặc bấm bút để sửa nội dung"
                            >
                              <GripVertical className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100 cursor-move" />
                              <span>{a.label}</span>

                              {/* Nút sửa nội dung */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartEditArrow(a);
                                }}
                                className="opacity-60 hover:opacity-100 hover:text-amber-300 p-0.5 cursor-pointer ml-0.5 transition-colors"
                                title="Sửa nội dung ghi chú"
                              >
                                <Edit3 className="w-2.5 h-2.5" />
                              </button>

                              {/* Nút đặt lại vị trí nếu đã bị kéo */}
                              {hasCustomOffset && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleResetArrowOffsets(a.id);
                                  }}
                                  className="opacity-60 hover:opacity-100 hover:text-blue-300 p-0.5 cursor-pointer transition-colors"
                                  title="Đặt lại vị trí mặc định"
                                >
                                  <RotateCcw className="w-2.5 h-2.5" />
                                </button>
                              )}

                              {/* Nút xóa mũi tên */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setArrows((prev) => prev.filter((item) => item.id !== a.id));
                                }}
                                className="opacity-60 hover:opacity-100 hover:text-rose-400 p-0.5 cursor-pointer transition-colors"
                                title="Xóa mũi tên này"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}

                  {/* LƯỚI 6 CỘT CHỨA CÁC THẺ CAN CHI & HOA GIÁP Y CHANG BẢNG BÁT TỰ CHÍNH */}
                  <div className="grid grid-cols-6 gap-1 sm:gap-2.5 md:gap-3.5 w-full min-w-0 relative z-0">
                    {sixPillarsInOneRow.map((p) => {
                      const canData = CAN_MAP.get(p.can);
                      const chiData = CHI_MAP.get(p.chi);
                      const matchedJiazi = SIXTY_JIAZI.find((j) => j.can === p.can && j.chi === p.chi);
                      const isLuuNien = p.type === "luu_nien";
                      const isDaiVan = p.type === "dai_van";
                      const isDayMaster = p.key === "nhat";

                      const canKey = `${p.key}-can`;
                      const chiKey = `${p.key}-chi`;
                      const isCanSelected = selectedNodes.includes(canKey);
                      const canSelectedIndex = selectedNodes.indexOf(canKey);
                      const isChiSelected = selectedNodes.includes(chiKey);
                      const chiSelectedIndex = selectedNodes.indexOf(chiKey);

                      return (
                        <div
                          key={`row-pillar-${p.key}`}
                          className={`flex flex-col border rounded-lg sm:rounded-2xl p-1 sm:p-2.5 md:p-3 shadow-md transition-all relative ${
                            isLuuNien
                              ? "bg-[#131B15] border-[#294B34] hover:border-emerald-400"
                              : isDaiVan
                              ? "bg-[#1D140C] border-[#5A4026] hover:border-[#D4AF37]"
                              : isDayMaster
                              ? "bg-[#1B140D] border-[#553E26] hover:border-[#D4AF37]"
                              : "bg-[#18130E] border-[#332619] hover:border-[#4D3A26]"
                          }`}
                        >
                          {/* Header: Tên Trụ & Tag */}
                          <div className="text-center pb-1 mb-1 sm:pb-2 sm:mb-2 border-b border-[#281E14]">
                            <div className="flex items-center justify-center gap-1">
                              <span
                                className={`text-[9.5px] sm:text-sm font-bold font-serif whitespace-nowrap ${
                                  isLuuNien
                                    ? "text-emerald-300"
                                    : isDaiVan
                                    ? "text-amber-300"
                                    : "text-[#E2B755]"
                                }`}
                              >
                                {p.label}
                              </span>
                            </div>
                            <div
                              className={`text-[7.5px] sm:text-[10px] font-mono whitespace-nowrap truncate ${
                                isLuuNien
                                  ? "text-emerald-400/80"
                                  : isDaiVan
                                  ? "text-[#A89882]"
                                  : "text-[#8C7D6B]"
                              }`}
                            >
                              {p.subLabel}
                            </div>
                          </div>

                          {/* Ô TRÊN: THIÊN CAN (BẤM CHỌN ĐỂ THÊM MŨI TÊN & KẾT NỐI NHIỀU Ô) */}
                          <div className="mb-1 sm:mb-2">
                            <div
                              ref={(el) => {
                                if (el) nodeRefs.current[canKey] = el;
                              }}
                              onClick={() => handleToggleNode(canKey)}
                              className={`relative min-h-[38px] sm:min-h-[58px] sm:min-h-[66px] rounded-md sm:rounded-xl border flex flex-col items-center justify-center p-0.5 sm:p-2 text-center cursor-pointer transition-all duration-200 select-none group ${
                                isCanSelected
                                  ? "bg-amber-950/95 border-amber-400 ring-2 ring-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)] scale-[1.02]"
                                  : canData
                                  ? "bg-gradient-to-b from-[#251D14] to-[#1C160F] border-[#5A4328] hover:border-[#E2B755] shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
                                  : "bg-[#14100C]/70 border-dashed border-[#3D3021] hover:border-[#D4AF37]"
                              }`}
                              title={
                                isCanSelected
                                  ? `Đã chọn ô #${canSelectedIndex + 1}: ${p.can} (${p.label}). Bấm để bỏ chọn.`
                                  : `Bấm chọn ${p.can} (${p.label}) để thêm mũi tên / kết nối nhiều ô`
                              }
                            >
                              {isCanSelected && (
                                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center text-[9px] font-black shadow ring-1 ring-amber-300 z-10 animate-in zoom-in-75">
                                  {selectedNodes.length > 1 ? canSelectedIndex + 1 : "✓"}
                                </span>
                              )}
                              {canData ? (
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-0 sm:gap-1.5 sm:gap-2">
                                  <span className="text-xs sm:text-2xl leading-none" title={canData.symbol}>
                                    {canData.emoji}
                                  </span>
                                  <span
                                    className={`text-xs sm:text-2xl font-serif font-bold ${canData.colorText} leading-none mt-0.5 sm:mt-0`}
                                  >
                                    {canData.name}
                                  </span>
                                  <span className="hidden md:inline text-xs sm:text-sm text-[#8C7D6B] font-serif">
                                    ({canData.chinese})
                                  </span>
                                </div>
                              ) : (
                                <div className="text-center">
                                  <span className="text-[8px] sm:text-xs text-[#A89882] group-hover:text-[#E2B755] font-medium">
                                    + Can
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* MŨI TÊN KẾT NỐI ÂM DƯƠNG: ⇅ */}
                          <div className="flex items-center justify-center my-0 sm:my-0.5 leading-none">
                            <span className="text-[8px] sm:text-[10px] text-[#6E5A44] font-mono">⇅</span>
                          </div>

                          {/* Ô DƯỚI: ĐỊA CHI (BẤM CHỌN ĐỂ THÊM MŨI TÊN & KẾT NỐI NHIỀU Ô) */}
                          <div className="mb-1.5 sm:mb-3">
                            <div
                              ref={(el) => {
                                if (el) nodeRefs.current[chiKey] = el;
                              }}
                              onClick={() => handleToggleNode(chiKey)}
                              className={`relative min-h-[38px] sm:min-h-[58px] sm:min-h-[66px] rounded-md sm:rounded-xl border flex flex-col items-center justify-center p-0.5 sm:p-2 text-center cursor-pointer transition-all duration-200 select-none group ${
                                isChiSelected
                                  ? "bg-amber-950/95 border-amber-400 ring-2 ring-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)] scale-[1.02]"
                                  : chiData
                                  ? "bg-gradient-to-b from-[#231A12] to-[#1A140E] border-[#5A4328] hover:border-[#E2B755] shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
                                  : "bg-[#14100C]/70 border-dashed border-[#3D3021] hover:border-[#D4AF37]"
                              }`}
                              title={
                                isChiSelected
                                  ? `Đã chọn ô #${chiSelectedIndex + 1}: ${p.chi} (${p.label}). Bấm để bỏ chọn.`
                                  : `Bấm chọn ${p.chi} (${p.label}) để thêm mũi tên / kết nối nhiều ô`
                              }
                            >
                              {isChiSelected && (
                                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center text-[9px] font-black shadow ring-1 ring-amber-300 z-10 animate-in zoom-in-75">
                                  {selectedNodes.length > 1 ? chiSelectedIndex + 1 : "✓"}
                                </span>
                              )}
                              {chiData ? (
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-0 sm:gap-1.5 sm:gap-2">
                                  <span className="text-xs sm:text-2xl leading-none">{chiData.emoji}</span>
                                  <span className="text-xs sm:text-2xl font-serif font-bold text-[#F5EAD4] leading-none mt-0.5 sm:mt-0">
                                    {chiData.name}
                                  </span>
                                  <span className="hidden md:inline text-xs sm:text-sm text-[#8C7D6B] font-serif">
                                    ({chiData.chinese})
                                  </span>
                                </div>
                              ) : (
                                <div className="text-center">
                                  <span className="text-[8px] sm:text-xs text-[#A89882] group-hover:text-[#E2B755] font-medium">
                                    + Chi
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* HOA GIÁP KẾT QUẢ CỦA TRỤ NÀY */}
                          <div className="mt-auto pt-1 sm:pt-2 border-t border-[#251D14]">
                            {matchedJiazi ? (
                              <div
                                className={`border rounded-md sm:rounded-xl p-1 sm:p-2 flex flex-col gap-0.5 sm:gap-1.5 ${
                                  isLuuNien
                                    ? "bg-[#101912] border-[#294B34]"
                                    : isDaiVan
                                    ? "bg-[#24190F] border-[#523A22]"
                                    : "bg-[#201810] border-[#483724]"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-[8px] sm:text-[10px] text-[#D4AF37] font-bold truncate">
                                    #{matchedJiazi.order} {matchedJiazi.name}
                                  </span>
                                  <span
                                    className={`hidden sm:inline text-[8.5px] px-1.5 py-0.2 rounded font-medium whitespace-nowrap ${
                                      isLuuNien
                                        ? "bg-[#142318] text-emerald-300 border border-emerald-900/60"
                                        : isDaiVan
                                        ? "bg-[#17110B] text-amber-300 border border-amber-900/60"
                                        : "bg-[#15110C] text-[#A89882]"
                                    }`}
                                  >
                                    {isLuuNien
                                      ? "Lưu Niên"
                                      : isDaiVan
                                      ? "Đại Vận"
                                      : matchedJiazi.branchGroup}
                                  </span>
                                </div>
                                <div className="text-[7px] sm:text-[10px] text-[#C4B49F] truncate">
                                  {matchedJiazi.elementNapAm}
                                </div>
                                {matchedJiazi.hexagramLink && (
                                  <div
                                    title={`Quẻ #${matchedJiazi.hexagramLink.hexagramNumber}: ${matchedJiazi.hexagramLink.hexagramName}`}
                                    className={`text-[7.5px] sm:text-[9px] flex items-center justify-center sm:justify-start gap-0.5 sm:gap-1 px-0.5 sm:px-1.5 py-0.5 rounded overflow-hidden whitespace-nowrap border ${
                                      isLuuNien
                                        ? "bg-[#0E1610] text-emerald-200 border-emerald-900/60"
                                        : isDaiVan
                                        ? "bg-[#17110B] text-amber-200 border-amber-900/60"
                                        : "bg-[#15110B] text-[#A89882] border-[#3E2E1D]"
                                    }`}
                                  >
                                    <span
                                      className={`shrink-0 font-bold text-[7.5px] sm:text-xs ${
                                        isLuuNien
                                          ? "text-emerald-400"
                                          : isDaiVan
                                          ? "text-amber-400"
                                          : "text-[#D4AF37]"
                                      }`}
                                    >
                                      ☯
                                    </span>
                                    <span className="font-serif whitespace-nowrap truncate font-semibold">
                                      #{matchedJiazi.hexagramLink.hexagramNumber}{" "}
                                      {matchedJiazi.hexagramLink.hexagramName}
                                    </span>
                                  </div>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleViewJiazi(matchedJiazi)}
                                  className="mt-0.5 sm:mt-1 w-full flex items-center justify-center gap-0.5 py-0.5 sm:py-1 text-[7.5px] sm:text-[10px] font-semibold text-[#18130E] bg-[#D4AF37] hover:bg-[#E5C158] rounded sm:rounded-lg transition-colors cursor-pointer whitespace-nowrap shadow-sm"
                                  title={`Xem chi tiết thẻ ảnh Hoa Giáp #${matchedJiazi.order} ${matchedJiazi.name}`}
                                >
                                  <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                                  <span className="hidden sm:inline">Xem #{matchedJiazi.order}</span>
                                  <span className="sm:hidden">Xem</span>
                                </button>
                              </div>
                            ) : (
                              <div className="bg-[#19130D] border border-dashed border-[#3D2E1C] rounded-md sm:rounded-xl p-1 sm:p-2 text-center">
                                <span className="text-[7.5px] sm:text-[10px] text-[#7A6A55] italic">
                                  Chưa phối
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* THANH HÀNH ĐỘNG NHANH KẾT NỐI NHIỀU Ô (KHI CHỌN TỪ 2 Ô TRỞ LÊN) */}
              {selectedNodes.length >= 2 && (
                <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-r from-[#291A0E] via-[#211409] to-[#180E06] border-2 border-amber-500/80 shadow-2xl space-y-2 animate-in fade-in slide-in-from-top-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-black text-amber-300 flex items-center gap-1">
                        <Network className="w-4 h-4 text-amber-400" />
                        <span>KẾT NỐI NHIỀU Ô ({selectedNodes.length} ô đang chọn):</span>
                      </span>
                      {selectedNodes.map((k, idx) => {
                        const node = getNodeInfo(k);
                        return (
                          <span
                            key={`quick-sel-pill-${k}`}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#170E08] border border-amber-600/60 text-[10px] text-amber-200 font-semibold"
                          >
                            <span className="w-3.5 h-3.5 rounded-full bg-amber-400 text-stone-950 font-black text-[8px] flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span>{node?.value} ({node?.name})</span>
                            <button
                              type="button"
                              onClick={() => handleToggleNode(k)}
                              className="text-stone-400 hover:text-rose-400 ml-0.5 cursor-pointer text-[9px]"
                              title="Bỏ chọn ô này"
                            >
                              ✕
                            </button>
                          </span>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowArrowCreator(!showArrowCreator)}
                        className="px-2 py-1 text-[10px] font-bold rounded-lg bg-[#302012] hover:bg-[#422D1A] text-amber-200 border border-amber-600/60 transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>{showArrowCreator ? "Thu Gọn Tùy Chỉnh" : "Tùy Chỉnh Nhãn / Màu"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedNodes([]);
                          setShowArrowCreator(false);
                        }}
                        className="px-2 py-1 text-[10px] text-stone-400 hover:text-rose-300 transition-colors cursor-pointer"
                      >
                        ✕ Bỏ chọn
                      </button>
                    </div>
                  </div>

                  {/* CÁC CHẾ ĐỘ NỐI NHIỀU Ô NHANH CHÓNG */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5 border-t border-[#382617]">
                    <span className="text-[10px] text-[#A89882] font-semibold mr-1">Chế độ nối:</span>

                    <button
                      type="button"
                      onClick={() => handleConnectMultiple("chain")}
                      className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-[11px] font-extrabold shadow transition-all cursor-pointer active:scale-95 flex items-center gap-1"
                      title="Nối tuần tự từ ô 1 tới ô 2, ô 3... theo thứ tự đã chọn"
                    >
                      <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                      <span>🔗 Nối Tuần Tự (1➔2➔3...)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleConnectMultiple("cycle")}
                      className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-extrabold shadow transition-all cursor-pointer active:scale-95 flex items-center gap-1"
                      title="Tạo vòng tròn khép kín tuần hoàn 1➔2➔3➔1 (Tam Hợp, Tam Hội, Tam Hình)"
                    >
                      <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                      <span>🔄 Vòng Khép Kín (1➔2➔3➔1)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleConnectMultiple("all_to_all")}
                      className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-extrabold shadow transition-all cursor-pointer active:scale-95 flex items-center gap-1"
                      title="Tất cả các ô kết nối hai chiều với nhau (Lưới đa giác tương tác)"
                    >
                      <Network className="w-3.5 h-3.5 shrink-0" />
                      <span>🕸️ Nối Tất Cả (Lưới Đa Chiều)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleConnectMultiple("to_target")}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-extrabold shadow transition-all cursor-pointer active:scale-95 flex items-center gap-1"
                      title="Các ô khác cùng chỉ mũi tên hội tụ về ô cuối cùng đã chọn"
                    >
                      <ArrowDown className="w-3.5 h-3.5 shrink-0" />
                      <span>🎯 Hội Tụ Về Ô Cuối</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleConnectMultiple("from_source")}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-extrabold shadow transition-all cursor-pointer active:scale-95 flex items-center gap-1"
                      title="Ô đầu tiên tỏa mũi tên ra tất cả các ô còn lại"
                    >
                      <Zap className="w-3.5 h-3.5 shrink-0" />
                      <span>🌟 Tỏa Ra Từ Ô Đầu</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleConnectMultiple("first_to_last")}
                      className="px-2 py-1 rounded-lg bg-[#2A1D11] hover:bg-[#3D2918] text-amber-200 border border-amber-600/60 text-[10.5px] font-semibold transition-all cursor-pointer active:scale-95 flex items-center gap-1"
                      title="Chỉ tạo 1 đường dẫn giữa ô đầu và ô cuối"
                    >
                      <span>➕ Nối Cặp Đầu - Cuối</span>
                    </button>
                  </div>
                </div>
              )}

              {/* BẢNG TẠO MŨI TÊN & ĐƯỜNG DẪN KHI CHỌN CAN CHI HOẶC MỞ THỦ CÔNG */}
              {showArrowCreator && (
                <div className="p-2.5 sm:p-3 rounded-xl bg-[#1A1209] border-2 border-amber-500/80 shadow-2xl space-y-2.5 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-[#3E2C1B] pb-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>
                        {selectedNodes.length >= 2
                          ? `Tùy Chỉnh & Kết Nối ${selectedNodes.length} Ô Can Chi`
                          : "Thêm Mũi Tên & Đường Dẫn Kết Nối Can Chi"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowArrowCreator(false);
                        setSelectedNodes([]);
                      }}
                      className="text-[#8C7D6B] hover:text-white p-0.5 cursor-pointer"
                      title="Đóng"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* KHI ĐANG CHỌN NHIỀU Ô (≥ 2 Ô): HIỂN THỊ CÁC CHẾ ĐỘ KẾT NỐI NHIỀU Ô */}
                  {selectedNodes.length >= 2 && (
                    <div className="p-2 sm:p-2.5 rounded-lg bg-[#22150A] border border-amber-600/60 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                        <div className="flex items-center gap-1.5">
                          <Network className="w-3.5 h-3.5 text-amber-400" />
                          <span>Chọn chế độ kết nối đồng thời {selectedNodes.length} ô:</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleConnectMultiple("chain")}
                          className="px-2 py-1.5 rounded-lg bg-[#2D1E11] hover:bg-amber-900/60 border border-amber-500/60 text-amber-200 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                          title="Nối tuần tự từ ô 1 tới ô 2, ô 3..."
                        >
                          <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                          <span>🔗 Nối Tuần Tự (Chain)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleConnectMultiple("cycle")}
                          className="px-2 py-1.5 rounded-lg bg-[#2D1E11] hover:bg-purple-900/60 border border-purple-500/60 text-purple-200 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                          title="Nối vòng tròn khép kín 1➔2➔3➔1 (Tam Hợp, Tam Hội, Tam Hình)"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
                          <span>🔄 Vòng Khép Kín (Cycle)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleConnectMultiple("all_to_all")}
                          className="px-2 py-1.5 rounded-lg bg-[#2D1E11] hover:bg-blue-900/60 border border-blue-500/60 text-blue-200 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                          title="Mọi ô kết nối qua lại hai chiều lẫn nhau"
                        >
                          <Network className="w-3.5 h-3.5 text-blue-400" />
                          <span>🕸️ Nối Tất Cả (Hai Chiều)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleConnectMultiple("to_target")}
                          className="px-2 py-1.5 rounded-lg bg-[#2D1E11] hover:bg-emerald-900/60 border border-emerald-500/60 text-emerald-200 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                          title="Các ô cùng chĩa mũi tên hội tụ về ô cuối"
                        >
                          <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />
                          <span>🎯 Hội Tụ Về Ô Cuối</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleConnectMultiple("from_source")}
                          className="px-2 py-1.5 rounded-lg bg-[#2D1E11] hover:bg-rose-900/60 border border-rose-500/60 text-rose-200 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                          title="Ô đầu tiên tỏa mũi tên ra tất cả ô còn lại"
                        >
                          <Zap className="w-3.5 h-3.5 text-rose-400" />
                          <span>🌟 Tỏa Ra Từ Ô Đầu</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleConnectMultiple("first_to_last")}
                          className="px-2 py-1.5 rounded-lg bg-[#2D1E11] hover:bg-amber-800/60 border border-amber-600/40 text-amber-100 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                          title="Chỉ nối 1 mũi tên giữa ô đầu và ô cuối"
                        >
                          <Plus className="w-3.5 h-3.5 text-amber-400" />
                          <span>➕ Nối Cặp Đầu - Cuối</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* CHỌN ĐIỂM XUẤT PHÁT VÀ ĐIỂM ĐẾN THỦ CÔNG */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] text-[#A89882] font-semibold block mb-0.5">
                        Điểm Xuất Phát (Từ):
                      </label>
                      <select
                        value={newArrowFrom}
                        onChange={(e) => {
                          setNewArrowFrom(e.target.value);
                          if (newArrowTo) {
                            const sug = suggestRelation(e.target.value, newArrowTo);
                            setNewArrowLabel(sug.label);
                            setNewArrowColor(sug.color);
                            setNewArrowDirection(sug.direction);
                          }
                        }}
                        className="w-full px-2 py-1.5 rounded-lg bg-[#24170E] border border-[#4D3620] text-amber-200 text-xs font-semibold focus:outline-none focus:border-amber-400 cursor-pointer"
                      >
                        {allNodesList.map((n) => (
                          <option key={`opt-from-${n.key}`} value={n.key}>
                            {n.name} ({n.value}) - {n.pillar}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-[#A89882] font-semibold block mb-0.5">
                        Điểm Đến (Tới):
                      </label>
                      <select
                        value={newArrowTo}
                        onChange={(e) => {
                          setNewArrowTo(e.target.value);
                          if (newArrowFrom) {
                            const sug = suggestRelation(newArrowFrom, e.target.value);
                            setNewArrowLabel(sug.label);
                            setNewArrowColor(sug.color);
                            setNewArrowDirection(sug.direction);
                          }
                        }}
                        className="w-full px-2 py-1.5 rounded-lg bg-[#24170E] border border-[#4D3620] text-amber-200 text-xs font-semibold focus:outline-none focus:border-amber-400 cursor-pointer"
                      >
                        {allNodesList.map((n) => (
                          <option key={`opt-to-${n.key}`} value={n.key}>
                            {n.name} ({n.value}) - {n.pillar}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-[#2C1D10]">
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-[10px] text-[#A89882] font-semibold mr-1">Chiều mũi tên:</span>
                      {[
                        { key: "forward", label: "➔ Xuôi", icon: <ArrowRight className="w-3 h-3" /> },
                        { key: "backward", label: "⬅ Ngược", icon: <ArrowLeft className="w-3 h-3" /> },
                        { key: "both", label: "⟷ Hai chiều", icon: <ArrowLeftRight className="w-3 h-3" /> },
                        { key: "none", label: "── Nối liền", icon: null },
                      ].map((d) => (
                        <button
                          key={d.key}
                          type="button"
                          onClick={() => setNewArrowDirection(d.key as any)}
                          className={`px-2 py-1 text-[10px] font-bold rounded-md border flex items-center gap-1 cursor-pointer transition-all ${
                            newArrowDirection === d.key
                              ? "bg-amber-500 text-stone-950 border-amber-300 shadow-sm"
                              : "bg-[#251A0F] text-[#C4B49F] border-[#44301D] hover:bg-[#322314]"
                          }`}
                        >
                          {d.icon}
                          <span>{d.label}</span>
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-[#A89882] font-semibold">Màu sắc:</span>
                      {[
                        { name: "Vàng", color: "#F59E0B" },
                        { name: "Lục", color: "#10B981" },
                        { name: "Đỏ", color: "#EF4444" },
                        { name: "Tím", color: "#A855F7" },
                        { name: "Cam", color: "#F97316" },
                        { name: "Lam", color: "#06B6D4" },
                        { name: "Hồng", color: "#EC4899" },
                      ].map((c) => (
                        <button
                          key={c.color}
                          type="button"
                          onClick={() => setNewArrowColor(c.color)}
                          className={`w-5 h-5 rounded-full border-2 transition-transform cursor-pointer ${
                            newArrowColor === c.color ? "scale-125 border-white ring-1 ring-amber-400" : "border-stone-800"
                          }`}
                          style={{ backgroundColor: c.color }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-[10px] text-[#A89882] font-semibold mr-1">Gợi ý nhãn nhanh:</span>
                      {[
                        { text: "Tam Hợp", color: "#8B5CF6" },
                        { text: "Tam Hội", color: "#3B82F6" },
                        { text: "Lục Hợp", color: "#A855F7" },
                        { text: "Lục Xung", color: "#EF4444" },
                        { text: "Tam Hình", color: "#EF4444" },
                        { text: "Tương Sinh", color: "#10B981" },
                        { text: "Tương Khắc", color: "#F43F5E" },
                        { text: "Tương Hại", color: "#EC4899" },
                        { text: "Tương Phá", color: "#F97316" },
                        { text: "Củng Cục", color: "#8B5CF6" },
                        { text: "Hóa Khí", color: "#06B6D4" },
                        { text: "Tương Tác", color: "#F59E0B" },
                      ].map((preset) => (
                        <button
                          key={preset.text}
                          type="button"
                          onClick={() => {
                            setNewArrowLabel(preset.text);
                            setNewArrowColor(preset.color);
                          }}
                          className="px-2 py-0.5 text-[9.5px] rounded bg-[#24170E] hover:bg-[#352214] border border-[#44301D] text-[#D8C7B0] hover:text-amber-200 transition-colors cursor-pointer"
                        >
                          {preset.text}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newArrowLabel}
                        onChange={(e) => setNewArrowLabel(e.target.value)}
                        placeholder="Nhập nhãn mũi tên (ví dụ: Tam Hợp Thủy Cục, Sinh Xuất, Hóa Khí...)"
                        className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#24170E] border border-[#4D3620] text-amber-100 text-xs font-semibold focus:outline-none focus:border-amber-400 placeholder:text-stone-600"
                      />

                      <button
                        type="button"
                        onClick={handleAddArrow}
                        className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold text-xs shadow-md cursor-pointer transition-all active:scale-95 flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Thêm Mũi Tên</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* THANH ĐIỀU KHIỂN & QUẢN LÝ MŨI TÊN / ĐƯỜNG DẪN */}
              <div className="pt-2 border-t border-[#2C1D10] flex flex-col gap-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold text-[#E2B755] flex items-center gap-1.5">
                      <MousePointerClick className="w-3.5 h-3.5 text-amber-400" />
                      <span>Tương tác Can Chi:</span>
                    </span>
                    {selectedNodes.length >= 2 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-600/70 font-semibold animate-pulse">
                        🎯 Đang chọn {selectedNodes.length} ô. Dùng thanh nối nhanh bên trên hoặc bấm thêm ô khác!
                      </span>
                    )}
                    {selectedNodes.length === 1 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-600/70 font-semibold animate-pulse">
                        🎯 Đang chọn {getNodeInfo(selectedNodes[0])?.name} ({getNodeInfo(selectedNodes[0])?.value}). Bấm thêm các chữ khác để kết nối!
                      </span>
                    )}
                    {selectedNodes.length === 0 && (
                      <span className="text-[10px] text-[#8C7D6B] italic">
                        (Bấm vào bất kỳ Can hoặc Chi trên bảng để chọn và tạo mũi tên dẫn kết nối nhiều ô)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (!showArrowCreator) {
                          setNewArrowFrom(allNodesList[0].key);
                          setNewArrowTo(allNodesList[1].key);
                          const sug = suggestRelation(allNodesList[0].key, allNodesList[1].key);
                          setNewArrowLabel(sug.label);
                          setNewArrowColor(sug.color);
                          setNewArrowDirection(sug.direction);
                        }
                        setShowArrowCreator(!showArrowCreator);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 text-[10.5px] font-semibold rounded-lg bg-[#271E15] hover:bg-[#382B1E] text-amber-200 border border-[#523F27] hover:border-amber-500 transition-all cursor-pointer"
                    >
                      <Plus className="w-3 h-3 text-amber-400" />
                      <span>{showArrowCreator ? "Đóng Tạo Mũi Tên" : "Thêm Mũi Tên Thủ Công"}</span>
                    </button>

                    {arrows.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setArrows([])}
                        className="flex items-center gap-1 px-2 py-1 text-[10.5px] font-semibold rounded-lg bg-[#2A1512] hover:bg-[#3D1A16] text-rose-300 border border-rose-900/60 hover:border-rose-500 transition-all cursor-pointer"
                        title="Xóa tất cả mũi tên đã tạo"
                      >
                        <Trash2 className="w-3 h-3 text-rose-400" />
                        <span>Xóa Hết ({arrows.length})</span>
                      </button>
                    )}

                    {selectedNodes.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedNodes([]);
                          setShowArrowCreator(false);
                        }}
                        className="text-[10.5px] px-2 py-1 text-[#8C7D6B] hover:text-white transition-colors cursor-pointer"
                      >
                        Bỏ chọn
                      </button>
                    )}
                  </div>
                </div>

                {/* DANH SÁCH CÁC MŨI TÊN ĐÃ TẠO */}
                {arrows.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    <span className="text-[10px] text-[#A89882] font-semibold">Đã tạo ({arrows.length}):</span>
                    {arrows.map((a) => {
                      const fromInfo = getNodeInfo(a.fromKey);
                      const toInfo = getNodeInfo(a.toKey);
                      const dirSymbol = a.direction === "forward" ? "➔" : a.direction === "backward" ? "⬅" : a.direction === "both" ? "⟷" : "──";

                      return (
                        <div
                          key={`chip-${a.id}`}
                          onMouseEnter={() => setHoveredArrowId(a.id)}
                          onMouseLeave={() => setHoveredArrowId((cur) => (cur === a.id ? null : cur))}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-medium shadow-sm transition-all bg-[#1D140C] ${
                            hoveredArrowId === a.id ? "ring-1 ring-amber-400 scale-105" : ""
                          }`}
                          style={{ borderColor: a.color || "#F59E0B" }}
                        >
                          <span style={{ color: a.color || "#F59E0B" }} className="font-bold">
                            {fromInfo?.value || a.fromKey} {dirSymbol} {toInfo?.value || a.toKey}:
                          </span>
                          <span className="text-[#F5EAD4] font-semibold">{a.label}</span>

                          {/* Nút sửa nội dung và vị trí mũi tên */}
                          <button
                            type="button"
                            onClick={() => handleStartEditArrow(a)}
                            className="text-amber-400 hover:text-white p-0.5 rounded cursor-pointer transition-colors ml-0.5"
                            title="Sửa nội dung và vị trí mũi tên"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>

                          {/* Nút đặt lại vị trí nếu đã bị dịch chuyển */}
                          {(a.badgeOffset?.x || a.badgeOffset?.y || a.curveOffset?.x || a.curveOffset?.y || a.startOffset?.x || a.startOffset?.y) && (
                            <button
                              type="button"
                              onClick={() => handleResetArrowOffsets(a.id)}
                              className="text-blue-300 hover:text-white p-0.5 rounded cursor-pointer transition-colors"
                              title="Đặt lại vị trí gốc"
                            >
                              <RotateCcw className="w-2.5 h-2.5" />
                            </button>
                          )}

                          {/* Nút xóa mũi tên */}
                          <button
                            type="button"
                            onClick={() => setArrows((prev) => prev.filter((item) => item.id !== a.id))}
                            className="text-[#8C7D6B] hover:text-rose-400 p-0.5 rounded cursor-pointer transition-colors"
                            title="Xóa mũi tên"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* MỤC CHỌN CHỮ GỒM: HỶ, TRUNG CÁT, TRUNG, TRUNG KỴ, KỴ CHO CHI LƯU NIÊN */}
            <div className="pt-2 border-t border-[#2C1D10] flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <span className="font-bold text-[#E2B755] flex items-center gap-1.5">
                  <span>Mục chọn chữ cho Địa Chi Lưu Niên <strong className="text-amber-300 font-serif text-sm sm:text-base">{selectedLuuNienChi}</strong>:</span>
                </span>
                {branchRatings[selectedLuuNienChi] && (
                  <span
                    className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-md font-bold border ${getRatingBadgeStyle(
                      branchRatings[selectedLuuNienChi]
                    )}`}
                  >
                    {branchRatings[selectedLuuNienChi]}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                {THUC_THI_RATING_OPTIONS.map((opt) => {
                  const isSelected = branchRatings[selectedLuuNienChi] === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() =>
                        setBranchRatings((prev) => ({
                          ...prev,
                          [selectedLuuNienChi]: isSelected ? null : opt,
                        }))
                      }
                      className={`px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
                        isSelected
                          ? getRatingBadgeStyle(opt, true)
                          : "bg-[#1E150D] hover:bg-[#2A1D12] text-[#C4B5A0] border-[#44301D]"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
                {branchRatings[selectedLuuNienChi] && (
                  <button
                    type="button"
                    onClick={() =>
                      setBranchRatings((prev) => ({
                        ...prev,
                        [selectedLuuNienChi]: null,
                      }))
                    }
                    className="text-[10px] sm:text-xs px-2 py-1 text-[#8C7D6B] hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    Xóa
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* CẢNH BÁO TAM HỢP / TAM HỘI TOÀN CỤC NGUYÊN CỤC + HÀNH VẬN */}
          {(fullTamHopList.length > 0 || fullTamHoiList.length > 0) && (
            <div className="p-2 sm:p-2.5 rounded-lg bg-[#2A1E0E] border border-amber-500/60 flex items-center justify-between text-[10px] text-amber-200">
              <div className="flex items-center gap-1.5">
                <Gem className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Nguyên Cục + Hành Vận có <strong>{[...fullTamHopList, ...fullTamHoiList].map((g) => `${g.name} (${g.branches.join("-")})`).join(", ")}</strong> đầy đủ.
                  Theo quy tắc: <strong>Ở trên vẫn giữ nguyên toàn bộ cục</strong>, đồng thời <strong>ở dưới vẫn kéo các chữ hợp theo</strong>!
                </span>
              </div>
            </div>
          )}

          {/* =================================================================
              BỐ CỤC 2 TẦNG VỚI TRỤC TRUNG TÂM Ở GIỮA BẢNG CHIA (HỖ TRỢ KÉO THẢ TÙY BIẾN):
              1. TẦNG TRÊN (Thượng tầng):
                 - Hàng độc lập (các chi không liên quan đứng ở trên)
                 - Hàng đối diện: Chữ có Hình, Xung, Hại đối diện trực tiếp & Chữ cánh tả kế bên
                 - GÓC PHẢI PHÍA TRÊN: Các Địa Chi củng sẵn ở nguyên cục nằm ở góc phải
              2. Ở GIỮA BẢNG CHIA:
                 - Chữ Địa Chi Mới (Lưu Niên) ở giữa
                 - Những Địa Chi bị kéo xuống sẽ ở TRÁI & PHẢI Địa Chi Mới
                 - Đặt trực thuộc dưới chữ mới là chữ trùng kéo xuống
              3. Ở DƯỚI CÙNG:
                 - Địa Chi được củng sẽ ở dưới cùng và được đóng mở ngoặc hoặc màu khác để phân biệt
              ================================================================= */}
          <div className="p-2.5 sm:p-3.5 rounded-xl bg-gradient-to-b from-[#181109] via-[#140E07] to-[#100B05] border border-[#3A2817] space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-1.5 border-b border-[#2C1D10] gap-1.5">
              <span className="font-bold text-[#E2B755] flex items-center gap-1.5 text-[10.5px] sm:text-[11px] uppercase tracking-wider">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Bố Cục Hai Tầng: Thượng Tầng (Trên) ⟷ Chi Lưu Niên ở Giữa ⟷ Hạ Tầng (Dưới)</span>
              </span>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap ml-auto sm:ml-0">
                {/* Bộ Chọn Kích Cỡ Ô Hình Bố Cục Hai Tầng (1x, 1.4x, 1.7x, 2x) */}
                <BaziTwoTierSizeSelector currentSize={cardSize} onChangeSize={handleCardSizeChange} />

                {/* Chế độ chỉ hiện thông tin chữ (không icon) */}
                <button
                  type="button"
                  onClick={() => setShowTableEmoji(!showTableEmoji)}
                  className={`px-2 py-0.5 text-[9.5px] font-bold rounded-lg border transition-all cursor-pointer ${
                    !showTableEmoji
                      ? "bg-amber-950/90 text-amber-300 border-amber-600/70 shadow-sm"
                      : "bg-[#271C11] text-[#A89882] border-[#4D3620] hover:bg-[#382717] hover:text-amber-200"
                  }`}
                  title={showTableEmoji ? "Bấm để chuyển sang chế độ chỉ hiện thông tin chữ (không hiện icon/emoji)" : "Bấm để hiện thêm icon con giáp trong các ô"}
                >
                  {showTableEmoji ? "🐾 Hiện Icon" : "🔤 Chỉ Hiện Chữ"}
                </button>

                {/* Chế độ đóng / mở hiện tên gọi Tâm Ấn Phú trong bố cục 2 tầng */}
                <button
                  type="button"
                  onClick={handleToggleTwoTierTamAnPhu}
                  className={`px-2 py-0.5 text-[9.5px] font-bold rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                    showTwoTierTamAnPhu
                      ? "bg-amber-950/90 text-amber-300 border-amber-500/80 shadow-sm"
                      : "bg-[#271C11] text-[#A89882] border-[#4D3620] hover:bg-[#382717] hover:text-amber-200"
                  }`}
                  title={
                    showTwoTierTamAnPhu
                      ? "Bấm để ẩn tên gọi Tâm Ấn Phú trên các Địa Chi trong bố cục 2 tầng"
                      : "Bấm để hiện tên gọi Tâm Ấn Phú trên các Địa Chi trong bố cục 2 tầng"
                  }
                >
                  <BookOpen className="w-3 h-3 text-amber-400" />
                  <span>{showTwoTierTamAnPhu ? "📜 Hiện Tâm Ấn" : "📜 Ẩn Tâm Ấn"}</span>
                </button>

                {hasCustomPositions && (
                  <button
                    type="button"
                    onClick={handleResetPositions}
                    className="flex items-center gap-1 px-2 py-0.5 text-[9.5px] font-semibold rounded-lg bg-amber-950/90 text-amber-300 border border-amber-600/80 hover:bg-amber-900 transition-all cursor-pointer shadow-sm active:scale-95"
                    title="Khôi phục lại vị trí tính toán ban đầu của các Địa Chi"
                  >
                    <RotateCcw className="w-3 h-3 text-amber-400" />
                    <span>Khôi Phục Vị Trí</span>
                  </button>
                )}
                <span className="text-[9px] text-[#8C7D6B] font-mono hidden sm:inline">
                  {displayedIndependent.length + displayedTopLeft.length + displayedTopOppose.length + displayedTopCungOrigin.length} Chi ở Trên • {displayedBottom.length} Chi ở Dưới
                </span>
                <button
                  type="button"
                  onClick={() => setIsTwoTierOpen(!isTwoTierOpen)}
                  className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-lg bg-[#271C11] text-[#E2B755] border border-[#4D3620] hover:bg-[#382717] transition-all cursor-pointer whitespace-nowrap"
                  title={isTwoTierOpen ? "Thu gọn bố cục 2 tầng" : "Mở rộng bố cục 2 tầng"}
                >
                  <span>{isTwoTierOpen ? "Thu Gọn" : "Mở Rộng"}</span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-200 ${
                      isTwoTierOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Thanh Hướng Dẫn Tương Tác Kéo Thả */}
            {isTwoTierOpen && (
              <div className="px-2.5 py-1.5 rounded-lg bg-[#1E140C] border border-[#432F1A] text-[9.5px] text-[#C4B49F] flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <Move className="w-3 h-3 text-amber-400" />
                    <span>Kéo Thả Vị Trí:</span>
                  </span>
                  <span>
                    Nắm giữ thẻ Địa Chi để kéo di chuyển giữa các vùng (Hàng Độc Lập, Cánh Tả, Đối Diện, Góc Phải Củng Sẵn, Trái/Phải Chữ Mới) hoặc bấm nút ✥ để chuyển nhanh.
                  </span>
                </div>
                {hasCustomPositions && (
                  <span className="text-[8.5px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-600 font-mono shrink-0">
                    Đang tùy biến vị trí
                  </span>
                )}
              </div>
            )}

            {isTwoTierOpen && (
              <>
                {/* THANH HÀNH ĐỘNG NHANH KẾT NỐI NHIỀU Ô 2 TẦNG (KHI CHỌN TỪ 2 Ô TRỞ LÊN) */}
                {twoTierSelectedNodes.length >= 2 && (
                  <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-r from-[#291A0E] via-[#211409] to-[#180E06] border-2 border-amber-500/80 shadow-2xl space-y-2 animate-in fade-in slide-in-from-top-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-black text-amber-300 flex items-center gap-1">
                          <Network className="w-4 h-4 text-amber-400" />
                          <span>KẾT NỐI NHIỀU Ô 2 TẦNG ({twoTierSelectedNodes.length} ô đang chọn):</span>
                        </span>
                        {twoTierSelectedNodes.map((k, idx) => {
                          const node = getTwoTierNodeInfo(k);
                          return (
                            <span
                              key={`tt-quick-sel-pill-${k}`}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#170E08] border border-amber-600/60 text-[10px] text-amber-200 font-semibold"
                            >
                              <span className="w-3.5 h-3.5 rounded-full bg-amber-400 text-stone-950 font-black text-[8px] flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <span>
                                {node?.value} ({node?.name})
                              </span>
                              <button
                                type="button"
                                onClick={() => handleTwoTierToggleNode(k)}
                                className="text-stone-400 hover:text-rose-400 ml-0.5 cursor-pointer text-[9px]"
                                title="Bỏ chọn ô này"
                              >
                                ✕
                              </button>
                            </span>
                          );
                        })}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setTwoTierShowArrowCreator(!twoTierShowArrowCreator)}
                          className="px-2 py-1 text-[10px] font-bold rounded-lg bg-[#302012] hover:bg-[#422D1A] text-amber-200 border border-amber-600/60 transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          <span>{twoTierShowArrowCreator ? "Thu Gọn Tùy Chỉnh" : "Tùy Chỉnh Nhãn / Màu"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setTwoTierSelectedNodes([]);
                            setTwoTierShowArrowCreator(false);
                          }}
                          className="px-2 py-1 text-[10px] text-stone-400 hover:text-rose-300 transition-colors cursor-pointer"
                        >
                          ✕ Bỏ chọn
                        </button>
                      </div>
                    </div>

                    {/* CÁC CHẾ ĐỘ NỐI NHIỀU Ô NHANH CHÓNG */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5 border-t border-[#382617]">
                      <span className="text-[10px] text-[#A89882] font-semibold mr-1">Chế độ nối:</span>

                      <button
                        type="button"
                        onClick={() => handleTwoTierConnectMultiple("chain")}
                        className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-[11px] font-extrabold shadow transition-all cursor-pointer active:scale-95 flex items-center gap-1"
                        title="Nối tuần tự từ ô 1 tới ô 2, ô 3... theo thứ tự đã chọn"
                      >
                        <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                        <span>🔗 Nối Tuần Tự (1➔2➔3...)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTwoTierConnectMultiple("cycle")}
                        className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-extrabold shadow transition-all cursor-pointer active:scale-95 flex items-center gap-1"
                        title="Tạo vòng tròn khép kín tuần hoàn 1➔2➔3➔1 (Tam Hợp, Tam Hội, Tam Hình)"
                      >
                        <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                        <span>🔄 Vòng Khép Kín (1➔2➔3➔1)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTwoTierConnectMultiple("all_to_all")}
                        className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-extrabold shadow transition-all cursor-pointer active:scale-95 flex items-center gap-1"
                        title="Tất cả các ô kết nối hai chiều với nhau (Lưới đa giác tương tác)"
                      >
                        <Network className="w-3.5 h-3.5 shrink-0" />
                        <span>🕸️ Nối Tất Cả (Lưới Đa Chiều)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTwoTierConnectMultiple("to_target")}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-extrabold shadow transition-all cursor-pointer active:scale-95 flex items-center gap-1"
                        title="Các ô khác cùng chỉ mũi tên hội tụ về ô cuối cùng đã chọn"
                      >
                        <ArrowDown className="w-3.5 h-3.5 shrink-0" />
                        <span>🎯 Hội Tụ Về Ô Cuối</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTwoTierConnectMultiple("from_source")}
                        className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-extrabold shadow transition-all cursor-pointer active:scale-95 flex items-center gap-1"
                        title="Ô đầu tiên tỏa mũi tên ra tất cả các ô còn lại"
                      >
                        <Zap className="w-3.5 h-3.5 shrink-0" />
                        <span>🌟 Tỏa Ra Từ Ô Đầu</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTwoTierConnectMultiple("first_to_last")}
                        className="px-2 py-1 rounded-lg bg-[#2A1D11] hover:bg-[#3D2918] text-amber-200 border border-amber-600/60 text-[10.5px] font-semibold transition-all cursor-pointer active:scale-95 flex items-center gap-1"
                        title="Chỉ tạo 1 đường dẫn giữa ô đầu và ô cuối"
                      >
                        <span>➕ Nối Cặp Đầu - Cuối</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* BẢNG TẠO MŨI TÊN & ĐƯỜNG DẪN 2 TẦNG (KHI CHỌN HOẶC MỞ THỦ CÔNG) */}
                {twoTierShowArrowCreator && (
                  <div className="p-2.5 sm:p-3 rounded-xl bg-[#1A1209] border-2 border-amber-500/80 shadow-2xl space-y-2.5 animate-in fade-in">
                    <div className="flex items-center justify-between border-b border-[#3E2C1B] pb-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>
                          {twoTierSelectedNodes.length >= 2
                            ? `Tùy Chỉnh & Kết Nối ${twoTierSelectedNodes.length} Ô Bố Cục 2 Tầng`
                            : "Thêm Mũi Tên & Đường Dẫn Kết Nối 2 Tầng"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setTwoTierShowArrowCreator(false);
                          setTwoTierSelectedNodes([]);
                        }}
                        className="text-[#8C7D6B] hover:text-white p-0.5 cursor-pointer"
                        title="Đóng"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-[#A89882] font-semibold w-16 shrink-0">Từ ô (Gốc):</span>
                        <select
                          value={twoTierNewArrowFrom}
                          onChange={(e) => setTwoTierNewArrowFrom(e.target.value)}
                          className="flex-1 px-2 py-1 rounded bg-[#25180D] border border-[#48331E] text-amber-100 text-xs focus:outline-none focus:border-amber-400"
                        >
                          <option value="">-- Chọn ô bắt đầu --</option>
                          {twoTierAllNodesList.map((n) => (
                            <option key={`tt-opt-from-${n.key}`} value={n.key}>
                              {n.value} - {n.name} ({n.pillar})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-[#A89882] font-semibold w-16 shrink-0">Đến ô (Đích):</span>
                        <select
                          value={twoTierNewArrowTo}
                          onChange={(e) => setTwoTierNewArrowTo(e.target.value)}
                          className="flex-1 px-2 py-1 rounded bg-[#25180D] border border-[#48331E] text-amber-100 text-xs focus:outline-none focus:border-amber-400"
                        >
                          <option value="">-- Chọn ô kết thúc --</option>
                          {twoTierAllNodesList.map((n) => (
                            <option key={`tt-opt-to-${n.key}`} value={n.key}>
                              {n.value} - {n.name} ({n.pillar})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-[#332212]">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-[#A89882] font-semibold mr-1">Chiều mũi tên:</span>
                        {[
                          { key: "forward", label: "➔ Xuôi", icon: <ArrowRight className="w-3 h-3" /> },
                          { key: "backward", label: "⬅ Ngược", icon: <ArrowLeft className="w-3 h-3" /> },
                          { key: "both", label: "⟷ Hai chiều", icon: <ArrowLeftRight className="w-3 h-3" /> },
                          { key: "none", label: "── Nối liền", icon: null },
                        ].map((d) => (
                          <button
                            key={d.key}
                            type="button"
                            onClick={() => setTwoTierNewArrowDirection(d.key as any)}
                            className={`px-2 py-1 text-[10px] font-bold rounded-md border flex items-center gap-1 cursor-pointer transition-all ${
                              twoTierNewArrowDirection === d.key
                                ? "bg-amber-500 text-stone-950 border-amber-300 shadow-sm"
                                : "bg-[#251A0F] text-[#C4B49F] border-[#44301D] hover:bg-[#322314]"
                            }`}
                          >
                            {d.icon}
                            <span>{d.label}</span>
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-[#A89882] font-semibold">Màu sắc:</span>
                        {[
                          { name: "Vàng", color: "#F59E0B" },
                          { name: "Lục", color: "#10B981" },
                          { name: "Đỏ", color: "#EF4444" },
                          { name: "Tím", color: "#A855F7" },
                          { name: "Cam", color: "#F97316" },
                          { name: "Lam", color: "#06B6D4" },
                          { name: "Hồng", color: "#EC4899" },
                        ].map((c) => (
                          <button
                            key={c.color}
                            type="button"
                            onClick={() => setTwoTierNewArrowColor(c.color)}
                            className={`w-5 h-5 rounded-full border-2 transition-transform cursor-pointer ${
                              twoTierNewArrowColor === c.color
                                ? "scale-125 border-white ring-1 ring-amber-400"
                                : "border-stone-800"
                            }`}
                            style={{ backgroundColor: c.color }}
                            title={c.name}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-[10px] text-[#A89882] font-semibold mr-1">Gợi ý nhãn nhanh:</span>
                        {[
                          { text: "Tam Hợp", color: "#8B5CF6" },
                          { text: "Tam Hội", color: "#3B82F6" },
                          { text: "Lục Hợp", color: "#A855F7" },
                          { text: "Lục Xung", color: "#EF4444" },
                          { text: "Tam Hình", color: "#EF4444" },
                          { text: "Tương Sinh", color: "#10B981" },
                          { text: "Tương Khắc", color: "#F43F5E" },
                          { text: "Tương Hại", color: "#EC4899" },
                          { text: "Tương Phá", color: "#F97316" },
                          { text: "Củng Cục", color: "#8B5CF6" },
                          { text: "Hóa Khí", color: "#06B6D4" },
                          { text: "Đồng Khí", color: "#F59E0B" },
                          { text: "Tương Tác", color: "#F59E0B" },
                        ].map((preset) => (
                          <button
                            key={preset.text}
                            type="button"
                            onClick={() => {
                              setTwoTierNewArrowLabel(preset.text);
                              setTwoTierNewArrowColor(preset.color);
                            }}
                            className="px-2 py-0.5 text-[9.5px] rounded bg-[#24170E] hover:bg-[#352214] border border-[#44301D] text-[#D8C7B0] hover:text-amber-200 transition-colors cursor-pointer"
                          >
                            {preset.text}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={twoTierNewArrowLabel}
                          onChange={(e) => setTwoTierNewArrowLabel(e.target.value)}
                          placeholder="Nhập nhãn mũi tên (ví dụ: Tam Hợp Thủy Cục, Xung Đối Diện, Củng Khí...)"
                          className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#24170E] border border-[#4D3620] text-amber-100 text-xs font-semibold focus:outline-none focus:border-amber-400 placeholder:text-stone-600"
                        />

                        <button
                          type="button"
                          onClick={handleTwoTierAddArrow}
                          className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold text-xs shadow-md cursor-pointer transition-all active:scale-95 flex items-center gap-1.5 whitespace-nowrap"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Thêm Mũi Tên</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* KHUNG CHỨA TOÀN BỘ BỐ CỤC 2 TẦNG & OVERLAY SVG MŨI TÊN */}
                <div ref={twoTierContainerRef} className="relative space-y-3.5 pt-1 pb-1">
                  {/* SVG OVERLAY VẼ ĐƯỜNG DẪN VÀ MŨI TÊN TRONG PHÂN TRỤC 2 TẦNG */}
                  {twoTierShowArrows && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
                      <defs>
                        {twoTierArrows.map((a) => {
                          const c = a.color || "#F59E0B";
                          return (
                            <React.Fragment key={`tt-defs-${a.id}`}>
                              <marker
                                id={`tt-arrow-head-${a.id}`}
                                viewBox="0 0 10 10"
                                refX="7"
                                refY="5"
                                markerWidth="6"
                                markerHeight="6"
                                orient="auto"
                              >
                                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill={c} />
                              </marker>
                              <marker
                                id={`tt-arrow-tail-${a.id}`}
                                viewBox="0 0 10 10"
                                refX="3"
                                refY="5"
                                markerWidth="6"
                                markerHeight="6"
                                orient="auto-start-reverse"
                              >
                                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill={c} />
                              </marker>
                            </React.Fragment>
                          );
                        })}
                      </defs>

                      {twoTierArrows.map((a, index) => {
                        const fromCoord = twoTierCoordsMap[a.fromKey];
                        const toCoord = twoTierCoordsMap[a.toKey];
                        if (!fromCoord || !toCoord) return null;

                        const startX = fromCoord.x + (a.startOffset?.x || 0);
                        const startY = fromCoord.y + (a.startOffset?.y || 0);
                        const endX = toCoord.x + (a.endOffset?.x || 0);
                        const endY = toCoord.y + (a.endOffset?.y || 0);
                        const color = a.color || "#F59E0B";

                        const dx = endX - startX;
                        const dy = endY - startY;
                        const dist = Math.hypot(dx, dy);

                        const nx = dist > 0 ? -dy / dist : 0;
                        const ny = dist > 0 ? dx / dist : 0;
                        const defaultArch = Math.min(42, Math.max(16, dist * 0.12)) * (index % 2 === 0 ? 1 : -1);

                        const curveOffsetX = a.curveOffset?.x || 0;
                        const curveOffsetY = a.curveOffset?.y || 0;

                        const ctrlX = (startX + endX) / 2 + nx * defaultArch + curveOffsetX;
                        const ctrlY = (startY + endY) / 2 + ny * defaultArch + curveOffsetY;

                        const d = `M ${startX} ${startY} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`;

                        const hasForward = a.direction === "forward" || a.direction === "both";
                        const hasBackward = a.direction === "backward" || a.direction === "both";
                        const isHovered = twoTierHoveredArrowId === a.id;
                        const isEditing = twoTierEditingArrowId === a.id;

                        return (
                          <g
                            key={`tt-arrow-group-${a.id}`}
                            className="transition-all"
                            onMouseEnter={() => setTwoTierHoveredArrowId(a.id)}
                            onMouseLeave={() => setTwoTierHoveredArrowId((cur) => (cur === a.id ? null : cur))}
                          >
                            {/* Vùng tàng hình bắt chuột kéo toàn bộ mũi tên hoặc nhấp đúp để sửa */}
                            <path
                              d={d}
                              fill="none"
                              stroke="transparent"
                              strokeWidth="24"
                              className="pointer-events-auto cursor-move touch-none"
                              onPointerDown={(e) => handleTwoTierPointerDownLine(e, a.id)}
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                handleTwoTierStartEditArrow(a);
                              }}
                            >
                              <title>Kéo để di chuyển toàn bộ mũi tên • Nhấp đúp để sửa nội dung</title>
                            </path>

                            {/* Đường viền phát sáng khi rê chuột hoặc đang sửa */}
                            <path
                              d={d}
                              fill="none"
                              stroke={color}
                              strokeWidth={isHovered || isEditing ? "6.5" : "4.5"}
                              strokeOpacity={isHovered || isEditing ? "0.5" : "0.22"}
                            />

                            {/* Đường nét chính mũi tên */}
                            <path
                              d={d}
                              fill="none"
                              stroke={color}
                              strokeWidth={isHovered || isEditing ? "3" : "2.2"}
                              strokeDasharray={a.direction === "none" ? "5 3" : undefined}
                              markerEnd={hasForward ? `url(#tt-arrow-head-${a.id})` : undefined}
                              markerStart={hasBackward ? `url(#tt-arrow-tail-${a.id})` : undefined}
                              className="pointer-events-auto cursor-move touch-none"
                              onPointerDown={(e) => handleTwoTierPointerDownLine(e, a.id)}
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                handleTwoTierStartEditArrow(a);
                              }}
                            >
                              <title>Kéo để di chuyển mũi tên • Nhấp đúp để sửa</title>
                            </path>

                            {/* Đường gióng điều khiển uốn cong (Dashed guide line) */}
                            {(isHovered || isEditing) && (
                              <line
                                x1={(startX + endX) / 2}
                                y1={(startY + endY) / 2}
                                x2={ctrlX}
                                y2={ctrlY}
                                stroke={color}
                                strokeWidth="1"
                                strokeDasharray="3 2"
                                opacity="0.6"
                              />
                            )}

                            {/* Điểm điều khiển uốn cong đường dẫn (Draggable Curve Control Point) */}
                            <g
                              className="pointer-events-auto cursor-grab active:cursor-grabbing touch-none"
                              onPointerDown={(e) => handleTwoTierPointerDownCurve(e, a.id)}
                            >
                              <circle
                                cx={ctrlX}
                                cy={ctrlY}
                                r={isHovered || isEditing ? "8" : "5.5"}
                                fill={color}
                                stroke="#160E08"
                                strokeWidth="2"
                                className="filter drop-shadow-md transition-transform hover:scale-125"
                              />
                              <circle
                                cx={ctrlX}
                                cy={ctrlY}
                                r="12"
                                fill="none"
                                stroke={color}
                                strokeWidth="1.2"
                                strokeDasharray="2 2"
                                opacity={isHovered || isEditing ? 0.9 : 0.4}
                              />
                              <title>Kéo để uốn cong / đổi độ võng của đường mũi tên</title>
                            </g>

                            {/* Điểm neo đầu mút xuất phát (Start Endpoint Handle) */}
                            {(isHovered || isEditing) && (
                              <g
                                className="pointer-events-auto cursor-move touch-none"
                                onPointerDown={(e) => handleTwoTierPointerDownEndpoint(e, a.id, "start")}
                              >
                                <circle
                                  cx={startX}
                                  cy={startY}
                                  r="5"
                                  fill={color}
                                  stroke="#160E08"
                                  strokeWidth="1.5"
                                  className="transition-transform hover:scale-150 drop-shadow"
                                />
                                <title>Kéo để dịch chuyển điểm bắt đầu của mũi tên</title>
                              </g>
                            )}

                            {/* Điểm neo đầu mút kết thúc (End Endpoint Handle) */}
                            {(isHovered || isEditing) && (
                              <g
                                className="pointer-events-auto cursor-move touch-none"
                                onPointerDown={(e) => handleTwoTierPointerDownEndpoint(e, a.id, "end")}
                              >
                                <circle
                                  cx={endX}
                                  cy={endY}
                                  r="5"
                                  fill={color}
                                  stroke="#160E08"
                                  strokeWidth="1.5"
                                  className="transition-transform hover:scale-150 drop-shadow"
                                />
                                <title>Kéo để dịch chuyển điểm kết thúc của mũi tên</title>
                              </g>
                            )}
                          </g>
                        );
                      })}
                    </svg>
                  )}

                  {/* CÁC HUY HIỆU NHÃN TƯƠNG TÁC NẰM TRÊN ĐƯỜNG DẪN 2 TẦNG (CÓ THỂ KÉO VÀ SỬA TẠI CHỖ) */}
                  {twoTierShowArrows &&
                    twoTierArrows.map((a, index) => {
                      const fromCoord = twoTierCoordsMap[a.fromKey];
                      const toCoord = twoTierCoordsMap[a.toKey];
                      if (!fromCoord || !toCoord) return null;

                      const startX = fromCoord.x + (a.startOffset?.x || 0);
                      const startY = fromCoord.y + (a.startOffset?.y || 0);
                      const endX = toCoord.x + (a.endOffset?.x || 0);
                      const endY = toCoord.y + (a.endOffset?.y || 0);
                      const color = a.color || "#F59E0B";

                      const dx = endX - startX;
                      const dy = endY - startY;
                      const dist = Math.hypot(dx, dy);

                      const nx = dist > 0 ? -dy / dist : 0;
                      const ny = dist > 0 ? dx / dist : 0;
                      const defaultArch = Math.min(42, Math.max(16, dist * 0.12)) * (index % 2 === 0 ? 1 : -1);

                      const curveOffsetX = a.curveOffset?.x || 0;
                      const curveOffsetY = a.curveOffset?.y || 0;

                      const ctrlX = (startX + endX) / 2 + nx * defaultArch + curveOffsetX;
                      const ctrlY = (startY + endY) / 2 + ny * defaultArch + curveOffsetY;

                      const midX = 0.25 * startX + 0.5 * ctrlX + 0.25 * endX;
                      const midY = 0.25 * startY + 0.5 * ctrlY + 0.25 * endY;

                      const badgeX = midX + (a.badgeOffset?.x || 0);
                      const badgeY = midY + (a.badgeOffset?.y || 0);
                      const hasCustomOffset = Boolean(
                        a.badgeOffset?.x ||
                        a.badgeOffset?.y ||
                        a.curveOffset?.x ||
                        a.curveOffset?.y ||
                        a.startOffset?.x ||
                        a.startOffset?.y ||
                        a.endOffset?.x ||
                        a.endOffset?.y
                      );
                      const isEditingThis = twoTierEditingArrowId === a.id;
                      const isHovered = twoTierHoveredArrowId === a.id;

                      return (
                        <div
                          key={`tt-badge-${a.id}`}
                          style={{
                            left: `${badgeX}px`,
                            top: `${badgeY}px`,
                            transform: "translate(-50%, -50%)",
                          }}
                          className="absolute z-20 pointer-events-auto select-none"
                          onMouseEnter={() => setTwoTierHoveredArrowId(a.id)}
                          onMouseLeave={() => setTwoTierHoveredArrowId((cur) => (cur === a.id ? null : cur))}
                        >
                          {isEditingThis ? (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="p-2 sm:p-2.5 rounded-xl bg-[#1C130A] border-2 border-amber-400 shadow-2xl space-y-2 min-w-[220px] sm:min-w-[260px] text-xs animate-in zoom-in-95"
                            >
                              <div className="flex items-center justify-between pb-1 border-b border-[#3E2B1A]">
                                <span className="text-[10px] font-bold text-amber-300 flex items-center gap-1">
                                  <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                                  <span>Sửa nội dung mũi tên 2 tầng</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setTwoTierEditingArrowId(null)}
                                  className="text-stone-400 hover:text-white p-0.5 cursor-pointer"
                                  title="Đóng"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div>
                                <input
                                  autoFocus
                                  type="text"
                                  value={twoTierEditingArrowLabel}
                                  onChange={(e) => setTwoTierEditingArrowLabel(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") handleTwoTierSaveEditArrow();
                                    if (e.key === "Escape") setTwoTierEditingArrowId(null);
                                  }}
                                  placeholder="Nhập nhãn ghi chú..."
                                  className="w-full px-2 py-1 rounded bg-[#27190E] border border-[#53391F] text-amber-100 text-xs font-semibold focus:outline-none focus:border-amber-400"
                                />
                              </div>

                              {/* Gợi ý nhãn nhanh */}
                              <div className="flex items-center gap-1 flex-wrap text-[8.5px]">
                                {[
                                  "Tam Hợp",
                                  "Tam Hội",
                                  "Lục Hợp",
                                  "Lục Xung",
                                  "Tam Hình",
                                  "Tương Sinh",
                                  "Tương Khắc",
                                  "Tương Hại",
                                  "Củng Cục",
                                  "Đồng Khí",
                                  "Tương Tác",
                                ].map((item) => (
                                  <button
                                    key={item}
                                    type="button"
                                    onClick={() => setTwoTierEditingArrowLabel(item)}
                                    className="px-1.5 py-0.5 rounded bg-[#2D1D10] hover:bg-[#3D2918] border border-[#4E341C] text-stone-300 hover:text-amber-200 cursor-pointer"
                                  >
                                    {item}
                                  </button>
                                ))}
                              </div>

                              {/* Chọn màu và chiều mũi tên */}
                              <div className="flex items-center justify-between pt-0.5">
                                <div className="flex items-center gap-1">
                                  {[
                                    "#F59E0B",
                                    "#10B981",
                                    "#EF4444",
                                    "#A855F7",
                                    "#F97316",
                                    "#06B6D4",
                                    "#EC4899",
                                  ].map((c) => (
                                    <button
                                      key={c}
                                      type="button"
                                      onClick={() => setTwoTierEditingArrowColor(c)}
                                      className={`w-4 h-4 rounded-full border transition-transform cursor-pointer ${
                                        twoTierEditingArrowColor === c
                                          ? "scale-125 border-white ring-1 ring-amber-400"
                                          : "border-stone-800"
                                      }`}
                                      style={{ backgroundColor: c }}
                                    />
                                  ))}
                                </div>

                                <div className="flex items-center gap-0.5">
                                  {[
                                    { key: "forward", label: "➔", title: "Xuôi" },
                                    { key: "backward", label: "⬅", title: "Ngược" },
                                    { key: "both", label: "⟷", title: "Hai chiều" },
                                    { key: "none", label: "──", title: "Nối liền" },
                                  ].map((dir) => (
                                    <button
                                      key={dir.key}
                                      type="button"
                                      onClick={() => setTwoTierEditingArrowDirection(dir.key as any)}
                                      className={`px-1 py-0.5 text-[9px] rounded border cursor-pointer font-bold ${
                                        twoTierEditingArrowDirection === dir.key
                                          ? "bg-amber-500 text-stone-950 border-amber-300"
                                          : "bg-[#25180D] text-[#A89882] border-[#442E19]"
                                      }`}
                                      title={dir.title}
                                    >
                                      {dir.label}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* BỘ NÚT TINH CHỈNH VỊ TRÍ MŨI TÊN, ĐƯỜNG CONG VÀ GHI CHÚ */}
                              <div className="pt-1.5 border-t border-[#3E2B1A] space-y-1.5 text-[10px]">
                                <div className="flex items-center justify-between text-[#E2B755] font-semibold text-[9.5px]">
                                  <span>📐 Tinh chỉnh vị trí (Nudge):</span>
                                  {hasCustomOffset && (
                                    <button
                                      type="button"
                                      onClick={() => handleTwoTierResetArrowOffsets(a.id)}
                                      className="text-[9px] text-[#A89882] hover:text-amber-300 flex items-center gap-0.5 cursor-pointer"
                                      title="Đặt lại vị trí gốc"
                                    >
                                      <RotateCcw className="w-2.5 h-2.5" />
                                      <span>Về gốc</span>
                                    </button>
                                  )}
                                </div>

                                {/* Dịch chuyển toàn bộ mũi tên */}
                                <div className="flex items-center justify-between bg-[#140D07] px-1.5 py-1 rounded border border-[#3A2818]">
                                  <span className="text-[#A89882] text-[9px]">Dịch mũi tên:</span>
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleTwoTierNudgeArrow(a.id, "arrow", 0, -8)}
                                      className="px-1.5 py-0.5 rounded bg-[#25170D] hover:bg-amber-900/60 border border-[#48311D] text-amber-200 text-[9px] cursor-pointer"
                                      title="Dịch mũi tên lên trên"
                                    >
                                      ↑ Lên
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleTwoTierNudgeArrow(a.id, "arrow", 0, 8)}
                                      className="px-1.5 py-0.5 rounded bg-[#25170D] hover:bg-amber-900/60 border border-[#48311D] text-amber-200 text-[9px] cursor-pointer"
                                      title="Dịch mũi tên xuống dưới"
                                    >
                                      ↓ Xuống
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleTwoTierNudgeArrow(a.id, "arrow", -10, 0)}
                                      className="px-1.5 py-0.5 rounded bg-[#25170D] hover:bg-amber-900/60 border border-[#48311D] text-amber-200 text-[9px] cursor-pointer"
                                      title="Dịch mũi tên sang trái"
                                    >
                                      ← Trái
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleTwoTierNudgeArrow(a.id, "arrow", 10, 0)}
                                      className="px-1.5 py-0.5 rounded bg-[#25170D] hover:bg-amber-900/60 border border-[#48311D] text-amber-200 text-[9px] cursor-pointer"
                                      title="Dịch mũi tên sang phải"
                                    >
                                      → Phải
                                    </button>
                                  </div>
                                </div>

                                {/* Uốn cong đường dẫn */}
                                <div className="flex items-center justify-between bg-[#140D07] px-1.5 py-1 rounded border border-[#3A2818]">
                                  <span className="text-[#A89882] text-[9px]">Uốn cong đường:</span>
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleTwoTierNudgeArrow(a.id, "curve", 0, -10)}
                                      className="px-2 py-0.5 rounded bg-[#25170D] hover:bg-amber-900/60 border border-[#48311D] text-amber-200 text-[9px] cursor-pointer"
                                      title="Uốn cong đường dẫn lên trên"
                                    >
                                      ⤴ Uốn Lên
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleTwoTierNudgeArrow(a.id, "curve", 0, 10)}
                                      className="px-2 py-0.5 rounded bg-[#25170D] hover:bg-amber-900/60 border border-[#48311D] text-amber-200 text-[9px] cursor-pointer"
                                      title="Uốn cong đường dẫn xuống dưới"
                                    >
                                      ⤵ Uốn Xuống
                                    </button>
                                  </div>
                                </div>

                                {/* Dịch chuyển ghi chú */}
                                <div className="flex items-center justify-between bg-[#140D07] px-1.5 py-1 rounded border border-[#3A2818]">
                                  <span className="text-[#A89882] text-[9px]">Dịch ghi chú:</span>
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleTwoTierNudgeArrow(a.id, "badge", 0, -8)}
                                      className="px-1.5 py-0.5 rounded bg-[#25170D] hover:bg-amber-900/60 border border-[#48311D] text-amber-200 text-[9px] cursor-pointer"
                                      title="Dịch ghi chú lên"
                                    >
                                      ↑ Lên
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleTwoTierNudgeArrow(a.id, "badge", 0, 8)}
                                      className="px-1.5 py-0.5 rounded bg-[#25170D] hover:bg-amber-900/60 border border-[#48311D] text-amber-200 text-[9px] cursor-pointer"
                                      title="Dịch ghi chú xuống"
                                    >
                                      ↓ Xuống
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleTwoTierNudgeArrow(a.id, "badge", -10, 0)}
                                      className="px-1.5 py-0.5 rounded bg-[#25170D] hover:bg-amber-900/60 border border-[#48311D] text-amber-200 text-[9px] cursor-pointer"
                                      title="Dịch ghi chú sang trái"
                                    >
                                      ← Trái
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleTwoTierNudgeArrow(a.id, "badge", 10, 0)}
                                      className="px-1.5 py-0.5 rounded bg-[#25170D] hover:bg-amber-900/60 border border-[#48311D] text-amber-200 text-[9px] cursor-pointer"
                                      title="Dịch ghi chú sang phải"
                                    >
                                      → Phải
                                    </button>
                                  </div>
                                </div>

                                <div className="text-[8.5px] text-stone-400 italic">
                                  💡 Kéo thả trực tiếp: thân mũi tên, chấm tròn uốn cong hoặc chữ ghi chú trên màn hình.
                                </div>
                              </div>

                              {/* Các nút hành động */}
                              <div className="flex items-center justify-between pt-1 border-t border-[#3E2B1A]">
                                {hasCustomOffset && (
                                  <button
                                    type="button"
                                    onClick={() => handleTwoTierResetArrowOffsets(a.id)}
                                    className="text-[9.5px] text-[#A89882] hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                                    title="Đặt lại vị trí ghi chú và đường uốn cong về gốc"
                                  >
                                    <RotateCcw className="w-3 h-3" />
                                    <span>Về gốc</span>
                                  </button>
                                )}
                                <div className="flex items-center gap-1.5 ml-auto">
                                  <button
                                    type="button"
                                    onClick={() => setTwoTierEditingArrowId(null)}
                                    className="px-2 py-0.5 rounded text-[10px] text-stone-400 hover:text-white cursor-pointer"
                                  >
                                    Hủy
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleTwoTierSaveEditArrow}
                                    className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-[10px] shadow cursor-pointer flex items-center gap-1"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>Lưu</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div
                              className={`group flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold shadow-xl border backdrop-blur-md transition-all cursor-move touch-none ${
                                isHovered
                                  ? "ring-2 ring-amber-400 scale-105 shadow-amber-500/30"
                                  : "hover:scale-105"
                              }`}
                              style={{
                                backgroundColor: "#160E08F5",
                                borderColor: color,
                                color: color,
                              }}
                              onPointerDown={(e) => handleTwoTierPointerDownBadge(e, a.id)}
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                handleTwoTierStartEditArrow(a);
                              }}
                              title="Kéo để di chuyển ghi chú • Nhấp đúp hoặc bấm bút để sửa nội dung"
                            >
                              <GripVertical className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100 cursor-move" />
                              <span>{a.label}</span>

                              {/* Nút sửa nội dung */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTwoTierStartEditArrow(a);
                                }}
                                className="opacity-60 hover:opacity-100 hover:text-amber-300 p-0.5 cursor-pointer ml-0.5 transition-colors"
                                title="Sửa nội dung ghi chú"
                              >
                                <Edit3 className="w-2.5 h-2.5" />
                              </button>

                              {/* Nút đặt lại vị trí nếu đã bị kéo */}
                              {hasCustomOffset && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleTwoTierResetArrowOffsets(a.id);
                                  }}
                                  className="opacity-60 hover:opacity-100 hover:text-blue-300 p-0.5 cursor-pointer transition-colors"
                                  title="Đặt lại vị trí mặc định"
                                >
                                  <RotateCcw className="w-2.5 h-2.5" />
                                </button>
                              )}

                              {/* Nút xóa mũi tên */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTwoTierArrows((prev) => prev.filter((item) => item.id !== a.id));
                                }}
                                className="opacity-60 hover:opacity-100 hover:text-rose-400 p-0.5 cursor-pointer transition-colors"
                                title="Xóa mũi tên này"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}

                  {/* ---------------- 0. CHI CỦNG Ở TẦNG TRÊN (ĐƯỢC ĐƯA LÊN TRÊN CÙNG) ---------------- */}
                  {cungOriginSummary.length > 0 && (
                    <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-b from-[#261331] via-[#1B0D23] to-[#120818] border-2 border-purple-500/80 shadow-lg space-y-1.5">
                      <div className="flex items-center justify-between text-[9.5px] sm:text-[10px]">
                        <span className="font-bold text-purple-300 flex items-center gap-1.5 uppercase tracking-wider font-mono">
                          <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                          <span>🏛️ Củng Sẵn Ở Nguyên Cục (Đưa Lên Trên Cùng)</span>
                        </span>
                        <span className="text-[8.5px] px-2 py-0.2 rounded-full bg-purple-950/90 text-purple-200 border border-purple-500/70 font-mono">
                          Hư Thần Củng Khí Nguyên Cục
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-1.5 pt-0.5">
                        {cungOriginSummary.map((s, idx) => {
                          const isLost = isCungLost(s);
                          const cData = CHI_MAP.get(s.cungChi);
                          const nodeKey = `twoTier-cung-${s.cungChi}-${idx}`;
                          const isSelected = twoTierSelectedNodes.includes(nodeKey);
                          const selIdx = twoTierSelectedNodes.indexOf(nodeKey);
                          const lostInfo = lostCungList.find(
                            (l) =>
                              l.cungChi === s.cungChi &&
                              ((l.p1.key === s.p1.key && l.p2.key === s.p2.key) ||
                                (l.p1.key === s.p2.key && l.p2.key === s.p1.key))
                          );
                          return (
                            <div
                              key={`thucthi-top-cung-result-${idx}`}
                              ref={(el) => {
                                twoTierNodeRefs.current[nodeKey] = el;
                              }}
                              onClick={() => handleTwoTierToggleNode(nodeKey)}
                              className={`relative shrink-0 border-2 text-center flex flex-col items-center justify-center select-none transition-all cursor-pointer hover:scale-[1.05] ${sizeCfg.cardClasses} ${
                                isSelected
                                  ? "!border-amber-400 ring-2 ring-amber-400 scale-[1.04] shadow-lg shadow-amber-500/30 z-10"
                                  : ""
                              } ${
                                isLost
                                  ? "bg-gradient-to-b from-[#381616] via-[#260e0e] to-[#1a0808] border-rose-500/80 shadow-md shadow-rose-950/50 ring-1 ring-rose-500/60"
                                  : "bg-gradient-to-b from-[#381647] via-[#260E32] to-[#17081E] border-purple-400/90 shadow-md shadow-purple-900/40 ring-1 ring-purple-500/50"
                              }`}
                              title={
                                isLost
                                  ? `[BỊ PHÁ VỠ] ${lostInfo?.reason || `Cặp củng [${s.p1.chi}]-[${s.p2.chi}] củng (${s.cungChi}) bị phá vỡ`}`
                                  : `Củng xuất chữ (${s.cungChi}) từ cặp [${s.p1.chi}] (${s.p1.label}) và [${s.p2.chi}] (${s.p2.label})`
                              }
                            >
                              {isSelected && (
                                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center text-[9px] font-black shadow ring-1 ring-amber-300 z-20 animate-in zoom-in-75">
                                  {selIdx + 1}
                                </span>
                              )}

                              {/* VẠCH GẠCH ĐỎ NỔI BẬT NẾU CỦNG BỊ MẤT */}
                              {isLost && (
                                <>
                                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 overflow-hidden rounded-lg">
                                    <div className="w-[140%] h-[2.5px] bg-rose-500 rotate-[-30deg] shadow-[0_0_8px_rgba(244,63,94,1)]" />
                                  </div>
                                  <span className="absolute -top-1.5 -right-1 text-[6.5px] px-1 py-0.2 rounded font-black bg-rose-950 text-rose-300 border border-rose-500 leading-none z-20">
                                    MẤT
                                  </span>
                                </>
                              )}

                              {showTableEmoji && (
                                <span className={`${sizeCfg.emojiClasses} select-none ${isLost ? "opacity-50" : ""}`}>
                                  {cData?.emoji || "⭐"}
                                </span>
                              )}
                              {(() => {
                                const cungTamAn = getTamAnPhuInfoForChi(s.cungChi);
                                return (
                                  <>
                                    <span
                                      className={`font-serif font-bold leading-none select-none ${
                                        showTableEmoji
                                          ? sizeCfg.chiClasses
                                          : `${sizeCfg.chiClasses} py-1 my-0.5 text-base sm:text-lg`
                                      } ${
                                        isLost
                                          ? "line-through decoration-rose-500 decoration-2 text-rose-300 font-black"
                                          : "text-purple-100"
                                      }`}
                                    >
                                      ({s.cungChi})
                                    </span>
                                    {showTwoTierTamAnPhu && cungTamAn?.tuongName && (
                                      <span
                                        className={`font-serif font-bold text-[#FFE28A] bg-[#291A0E]/95 px-1 py-0.2 rounded border border-amber-600/60 truncate max-w-full leading-tight shadow-xs ${sizeCfg.tamAnClasses} select-none my-0.5`}
                                        title={cungTamAn.fullLine ? `Tâm Ấn Phú: ${cungTamAn.fullLine}` : `Tâm Ấn: 《${cungTamAn.tuongName}》`}
                                      >
                                        《{cungTamAn.tuongName}》
                                      </span>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ---------------- 1. TẦNG TRÊN (THƯỢNG TẦNG - 3 CỘT ĐỐI XỨNG: CÁNH TẢ - ĐỐI DIỆN - CỦNG/ĐỘC LẬP) ---------------- */}
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 items-start">
                    {/* CỘT TRÁI: CÁNH TẢ (KẾ BÊN TRÁI CHỮ ĐỐI DIỆN) */}
                    <div className="space-y-1 sm:space-y-1.5">
                      <div className="flex items-center justify-between pb-0.5 border-b border-[#4D3620] text-center">
                        <span className="text-[8px] sm:text-[9.5px] font-bold text-[#D4AF37] flex items-center gap-0.5 sm:gap-1 truncate">
                          <span>⬅️ Cánh Tả (Trái)</span>
                        </span>
                        <span className="text-[7.5px] sm:text-[8px] text-[#8C7D6B] font-mono shrink-0">{displayedTopLeft.length}</span>
                      </div>
                      <BaziTwoTierDropZone
                        zoneKey="top_left"
                        activeDropZone={activeDropZone}
                        onDropToZone={handleMoveToZone}
                        onDragOverZone={setActiveDropZone}
                        onDragLeaveZone={() => setActiveDropZone(null)}
                        itemCount={displayedTopLeft.length}
                        emptyLabel="Thả Cánh Tả"
                        emptyDesc="Kế bên trái chữ đối diện"
                      >
                        <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 p-0.5 sm:p-1">
                          {displayedTopLeft.map((p) => {
                            const info = getPillarCardInfo(p, "top_left");
                            const nodeKey = `twoTier-${p.key}`;
                            return (
                              <BaziTwoTierCard
                                key={`thucthi-left-${p.key}`}
                                pillarKey={p.key}
                                label={p.label}
                                pillar={p.pillar}
                                chi={p.chi}
                                currentZone="top_left"
                                size={cardSize}
                                showEmoji={showTableEmoji}
                                onMoveToZone={handleMoveToZone}
                                isDragging={draggedPillarKey === p.key}
                                onDragStart={() => setDraggedPillarKey(p.key)}
                                onDragEnd={() => {
                                  setDraggedPillarKey(null);
                                  setActiveDropZone(null);
                                }}
                                badgeText={info.badgeText}
                                badgeType={info.badgeType}
                                subNote={info.subNote}
                                tamAnPhuName={info.tamAnPhu?.tuongName}
                                tamAnPhuChinese={info.tamAnPhu?.tuongChinese}
                                tamAnPhuFullLine={info.tamAnPhu?.fullLine}
                                showTamAnPhu={showTwoTierTamAnPhu}
                                innerRef={(el) => {
                                  twoTierNodeRefs.current[nodeKey] = el;
                                }}
                                isSelected={twoTierSelectedNodes.includes(nodeKey)}
                                selectedIndex={twoTierSelectedNodes.indexOf(nodeKey)}
                                onSelect={() => handleTwoTierToggleNode(nodeKey)}
                              />
                            );
                          })}
                        </div>
                      </BaziTwoTierDropZone>
                    </div>

                    {/* CỘT GIỮA: ĐỐI DIỆN TRỰC DIỆN ĐỊA CHI LƯU NIÊN (CHỨA ĐỊA CHI CÓ XUNG • HÌNH • HẠI) */}
                    <div className="space-y-1 sm:space-y-1.5 flex flex-col items-center">
                      <div className="w-full flex items-center justify-between pb-0.5 border-b border-[#4D3620] text-center">
                        <span className="text-[8px] sm:text-[9.5px] font-bold text-rose-300 flex items-center gap-0.5 sm:gap-1 truncate">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
                          <span className="truncate">Đối Diện Lưu Niên</span>
                        </span>
                        <span className="text-[7.5px] sm:text-[8px] text-rose-400 font-mono shrink-0">{displayedTopOppose.length}</span>
                      </div>

                      <BaziTwoTierDropZone
                        zoneKey="top_oppose"
                        activeDropZone={activeDropZone}
                        onDropToZone={handleMoveToZone}
                        onDragOverZone={setActiveDropZone}
                        onDragLeaveZone={() => setActiveDropZone(null)}
                        itemCount={displayedTopOppose.length}
                        emptyLabel="Thả Đối Diện"
                        emptyDesc="Xung • Hình • Hại với Chi Lưu Niên"
                        className="w-full"
                      >
                        <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 p-0.5 sm:p-1">
                          {displayedTopOppose.map((p) => {
                            const info = getPillarCardInfo(p, "top_oppose");
                            const nodeKey = `twoTier-${p.key}`;
                            return (
                              <BaziTwoTierCard
                                key={`thucthi-opp-${p.key}`}
                                pillarKey={p.key}
                                label={p.label}
                                pillar={p.pillar}
                                chi={p.chi}
                                currentZone="top_oppose"
                                size={cardSize}
                                showEmoji={showTableEmoji}
                                onMoveToZone={handleMoveToZone}
                                isDragging={draggedPillarKey === p.key}
                                onDragStart={() => setDraggedPillarKey(p.key)}
                                onDragEnd={() => {
                                  setDraggedPillarKey(null);
                                  setActiveDropZone(null);
                                }}
                                badgeText={info.badgeText}
                                badgeType={info.badgeType}
                                subNote={info.subNote}
                                tamAnPhuName={info.tamAnPhu?.tuongName}
                                tamAnPhuChinese={info.tamAnPhu?.tuongChinese}
                                tamAnPhuFullLine={info.tamAnPhu?.fullLine}
                                showTamAnPhu={showTwoTierTamAnPhu}
                                innerRef={(el) => {
                                  twoTierNodeRefs.current[nodeKey] = el;
                                }}
                                isSelected={twoTierSelectedNodes.includes(nodeKey)}
                                selectedIndex={twoTierSelectedNodes.indexOf(nodeKey)}
                                onSelect={() => handleTwoTierToggleNode(nodeKey)}
                              />
                            );
                          })}
                        </div>
                      </BaziTwoTierDropZone>
                    </div>

                    {/* CỘT PHẢI: CÁNH HỮU (BÊN PHẢI CHỮ ĐỐI DIỆN) */}
                    <div className="space-y-1 sm:space-y-1.5">
                      <div className="flex items-center justify-between pb-0.5 border-b border-[#4D3620] text-center">
                        <span className="text-[8px] sm:text-[9.5px] font-bold text-[#D4AF37] flex items-center gap-0.5 sm:gap-1 truncate">
                          <span>➡️ Cánh Hữu (Phải)</span>
                        </span>
                        <span className="text-[7.5px] sm:text-[8px] text-[#8C7D6B] font-mono shrink-0">
                          {displayedTopRight.length}
                        </span>
                      </div>

                      <BaziTwoTierDropZone
                        zoneKey="top_independent"
                        activeDropZone={activeDropZone}
                        onDropToZone={handleMoveToZone}
                        onDragOverZone={setActiveDropZone}
                        onDragLeaveZone={() => setActiveDropZone(null)}
                        itemCount={displayedTopRight.length}
                        emptyLabel="Thả Cánh Hữu"
                        emptyDesc="Kế bên phải / Độc lập"
                      >
                        <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 p-0.5 sm:p-1">
                          {displayedTopRight.map((p) => {
                            const info = getPillarCardInfo(p, "top_independent");
                            const nodeKey = `twoTier-${p.key}`;
                            return (
                              <BaziTwoTierCard
                                key={`thucthi-right-${p.key}`}
                                pillarKey={p.key}
                                label={p.label}
                                pillar={p.pillar}
                                chi={p.chi}
                                currentZone="top_independent"
                                size={cardSize}
                                showEmoji={showTableEmoji}
                                onMoveToZone={handleMoveToZone}
                                isDragging={draggedPillarKey === p.key}
                                onDragStart={() => setDraggedPillarKey(p.key)}
                                onDragEnd={() => {
                                  setDraggedPillarKey(null);
                                  setActiveDropZone(null);
                                }}
                                badgeText={info.badgeText}
                                badgeType={info.badgeType}
                                subNote={info.subNote}
                                tamAnPhuName={info.tamAnPhu?.tuongName}
                                tamAnPhuChinese={info.tamAnPhu?.tuongChinese}
                                tamAnPhuFullLine={info.tamAnPhu?.fullLine}
                                showTamAnPhu={showTwoTierTamAnPhu}
                                innerRef={(el) => {
                                  twoTierNodeRefs.current[nodeKey] = el;
                                }}
                                isSelected={twoTierSelectedNodes.includes(nodeKey)}
                                selectedIndex={twoTierSelectedNodes.indexOf(nodeKey)}
                                onSelect={() => handleTwoTierToggleNode(nodeKey)}
                              />
                            );
                          })}
                        </div>
                      </BaziTwoTierDropZone>
                    </div>
                  </div>

                  {/* ---------------- 2. KHỐI ĐỊA CHI LƯU NIÊN (CHỮ MỚI) & CÁC CHI KÉO XUỐNG TRÁI / PHẢI ---------------- */}
                  <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-b from-[#25180D] via-[#1E1209] to-[#180E07] border-2 border-[#7D5A2F] shadow-xl space-y-3.5">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-[1.5px] flex-1 bg-gradient-to-r from-transparent via-[#C6923C] to-transparent" />
                      <span className="text-[10.5px] sm:text-[11px] font-bold text-[#E2B755] uppercase tracking-wider flex items-center gap-1.5">
                        <ArrowUpDown className="w-4 h-4 text-amber-400" />
                        <span>Trục Phân Tầng: Địa Chi Lưu Niên {selectedYear} ⟷ Chi Bị Kéo Xuống Ở Trái & Phải</span>
                      </span>
                      <div className="h-[1.5px] flex-1 bg-gradient-to-r from-transparent via-[#C6923C] to-transparent" />
                    </div>

                    {/* HÀNG 3 CỘT ĐỐI XỨNG: [BÊN TRÁI (CÁNH TẢ)] [Ở GIỮA (ĐỊA CHI LƯU NIÊN)] [BÊN PHẢI (CÁNH HỮU)] */}
                    {(() => {
                      const renderBottomPillars = (pillars: typeof displayedBottomLeft, zone: TwoTierZone) => {
                        const groupsMap = new Map<string, { groupName: string; pillars: typeof displayedBottomLeft }>();
                        const independentPillars: typeof displayedBottomLeft = [];

                        pillars.forEach((p) => {
                          const gInfo = pulledFullGroupInfoMap.get(p.key);
                          if (gInfo) {
                            if (!groupsMap.has(gInfo.groupKey)) {
                              groupsMap.set(gInfo.groupKey, { groupName: gInfo.groupName, pillars: [] });
                            }
                            groupsMap.get(gInfo.groupKey)!.pillars.push(p);
                          } else {
                            independentPillars.push(p);
                          }
                        });

                        return (
                          <div className="flex flex-col items-center justify-center gap-1.5 p-0.5 sm:p-1 w-full">
                            {/* Các cụm Tam Hợp / Tam Hội kéo xuống cùng nhau -> Nằm chung 1 cụm */}
                            {Array.from(groupsMap.entries()).map(([gKey, gData]) => (
                              <div
                                key={`cluster-${zone}-${gKey}`}
                                className="w-full p-1.5 rounded-xl bg-gradient-to-r from-amber-950/70 via-[#26170D] to-amber-950/70 border border-amber-500/60 shadow-md space-y-1"
                              >
                                <div className="flex items-center justify-between pb-0.5 border-b border-amber-600/40 text-[8.5px] sm:text-[9.5px] font-bold text-amber-300">
                                  <span className="flex items-center gap-1 truncate">
                                    <Sparkles className="w-3 h-3 text-amber-400 shrink-0 animate-pulse" />
                                    <span className="truncate">Cụm {gData.groupName}</span>
                                  </span>
                                  <span className="text-[7.5px] px-1.5 py-0.2 rounded bg-amber-900/80 text-amber-200 border border-amber-600/60 font-mono shrink-0">
                                    Chung 1 Cụm
                                  </span>
                                </div>
                                <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 pt-0.5">
                                  {gData.pillars.map((p) => {
                                    const info = getPillarCardInfo(p, zone);
                                    const nodeKey = retainedInTopFullGroupPillarKeys.has(p.key)
                                      ? `twoTier-${zone}-${p.key}`
                                      : `twoTier-${p.key}`;
                                    return (
                                      <BaziTwoTierCard
                                        key={`thucthi-cluster-${zone}-${p.key}`}
                                        pillarKey={p.key}
                                        label={p.label}
                                        pillar={p.pillar}
                                        chi={p.chi}
                                        currentZone={zone}
                                        size={cardSize}
                                        showEmoji={showTableEmoji}
                                        onMoveToZone={handleMoveToZone}
                                        isDragging={draggedPillarKey === p.key}
                                        onDragStart={() => setDraggedPillarKey(p.key)}
                                        onDragEnd={() => {
                                          setDraggedPillarKey(null);
                                          setActiveDropZone(null);
                                        }}
                                        badgeText={info.badgeText}
                                        badgeType={info.badgeType}
                                        subNote={info.subNote}
                                        tamAnPhuName={info.tamAnPhu?.tuongName}
                                        tamAnPhuChinese={info.tamAnPhu?.tuongChinese}
                                        tamAnPhuFullLine={info.tamAnPhu?.fullLine}
                                        showTamAnPhu={showTwoTierTamAnPhu}
                                        innerRef={(el) => {
                                          twoTierNodeRefs.current[nodeKey] = el;
                                        }}
                                        isSelected={twoTierSelectedNodes.includes(nodeKey)}
                                        selectedIndex={twoTierSelectedNodes.indexOf(nodeKey)}
                                        onSelect={() => handleTwoTierToggleNode(nodeKey)}
                                      />
                                    );
                                  })}
                                </div>
                              </div>
                            ))}

                            {/* Các Chi độc lập không thuộc cụm */}
                            {independentPillars.length > 0 && (
                              <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5">
                                {independentPillars.map((p) => {
                                  const info = getPillarCardInfo(p, zone);
                                  const nodeKey = retainedInTopFullGroupPillarKeys.has(p.key)
                                    ? `twoTier-${zone}-${p.key}`
                                    : `twoTier-${p.key}`;
                                  return (
                                    <BaziTwoTierCard
                                      key={`thucthi-${zone}-${p.key}`}
                                      pillarKey={p.key}
                                      label={p.label}
                                      pillar={p.pillar}
                                      chi={p.chi}
                                      currentZone={zone}
                                      size={cardSize}
                                      showEmoji={showTableEmoji}
                                      onMoveToZone={handleMoveToZone}
                                      isDragging={draggedPillarKey === p.key}
                                      onDragStart={() => setDraggedPillarKey(p.key)}
                                      onDragEnd={() => {
                                        setDraggedPillarKey(null);
                                        setActiveDropZone(null);
                                      }}
                                      badgeText={info.badgeText}
                                      badgeType={info.badgeType}
                                      subNote={info.subNote}
                                      tamAnPhuName={info.tamAnPhu?.tuongName}
                                      tamAnPhuChinese={info.tamAnPhu?.tuongChinese}
                                      tamAnPhuFullLine={info.tamAnPhu?.fullLine}
                                      showTamAnPhu={showTwoTierTamAnPhu}
                                      innerRef={(el) => {
                                        twoTierNodeRefs.current[nodeKey] = el;
                                      }}
                                      isSelected={twoTierSelectedNodes.includes(nodeKey)}
                                      selectedIndex={twoTierSelectedNodes.indexOf(nodeKey)}
                                      onSelect={() => handleTwoTierToggleNode(nodeKey)}
                                    />
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      };

                      return (
                        <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 items-start">
                          {/* CỘT TRÁI: CÁC CHI BỊ KÉO XUỐNG BÊN TRÁI (CÁNH TẢ) */}
                          <div className="space-y-1 sm:space-y-1.5">
                            <div className="flex items-center justify-between pb-0.5 border-b border-[#4D3620] text-center">
                              <span className="text-[8px] sm:text-[9.5px] font-bold text-emerald-300 flex items-center gap-0.5 sm:gap-1 truncate">
                                <ArrowDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400 shrink-0" />
                                <span className="truncate">Cánh Tả (Trái)</span>
                              </span>
                              <span className="text-[7.5px] sm:text-[8px] text-[#8C7D6B] font-mono shrink-0">{displayedBottomLeft.length}</span>
                            </div>
                            <BaziTwoTierDropZone
                              zoneKey="bottom_left"
                              activeDropZone={activeDropZone}
                              onDropToZone={handleMoveToZone}
                              onDragOverZone={setActiveDropZone}
                              onDragLeaveZone={() => setActiveDropZone(null)}
                              itemCount={displayedBottomLeft.length}
                              emptyLabel="Thả Chi Tả"
                              emptyDesc="Kéo vào bên trái"
                            >
                              {renderBottomPillars(displayedBottomLeft, "bottom_left")}
                            </BaziTwoTierDropZone>
                          </div>

                          {/* CỘT GIỮA: ĐỊA CHI LƯU NIÊN & CHI TRÙNG NẰM CHUNG 1 Ô (ĐÃ BỎ Ô ĐẶT DƯỚI) */}
                          <div className="space-y-1 sm:space-y-1.5 flex flex-col items-center">
                            <div className="w-full flex items-center justify-center pb-0.5 border-b border-[#4D3620] text-center">
                              <span className="text-[8px] sm:text-[9.5px] font-bold text-amber-300 truncate flex items-center justify-center gap-1 w-full">
                                <span>Lưu Niên {selectedYear}</span>
                                {displayedMiddleSame.length > 0 && (
                                  <span className="text-[7.5px] px-1 py-0.2 rounded bg-amber-900/80 text-amber-200 border border-amber-600/60 font-mono">
                                    Trùng {displayedMiddleSame.length} Chi
                                  </span>
                                )}
                              </span>
                            </div>

                            {/* DROP ZONE CHUNG 1 Ô CHO CẢ LƯU NIÊN VÀ CHI TRÙNG NGUYÊN CỤC */}
                            <BaziTwoTierDropZone
                              zoneKey="middle_same"
                              activeDropZone={activeDropZone}
                              onDropToZone={handleMoveToZone}
                              onDragOverZone={setActiveDropZone}
                              onDragLeaveZone={() => setActiveDropZone(null)}
                              itemCount={1 + displayedMiddleSame.length}
                              emptyLabel={`Chung ô ${selectedLuuNienChi}`}
                              className="w-full"
                            >
                              <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 p-1 rounded-xl bg-gradient-to-b from-[#221509] to-[#170E06] border border-[#5A3F22] shadow-inner min-h-[52px]">
                                {/* THẺ ĐỊA CHI LƯU NIÊN */}
                                {(() => {
                                  const isLuuNienSelected = twoTierSelectedNodes.includes("twoTier-luunien");
                                  const luuNienIdx = twoTierSelectedNodes.indexOf("twoTier-luunien");
                                  return (
                                    <div
                                      ref={(el) => {
                                        twoTierNodeRefs.current["twoTier-luunien"] = el;
                                      }}
                                      onClick={() => handleTwoTierToggleNode("twoTier-luunien")}
                                      className={`shrink-0 bg-gradient-to-b from-[#3E2914] via-[#2A1B0C] to-[#1C1208] border-2 border-[#D4AF37] text-center flex flex-col items-center justify-center shadow-md shadow-amber-600/30 ring-1 ring-amber-400/50 select-none relative cursor-pointer hover:scale-[1.05] transition-all ${
                                        isLuuNienSelected
                                          ? "!border-amber-400 ring-2 ring-amber-400 scale-[1.04] shadow-lg shadow-amber-500/30 z-10"
                                          : ""
                                      } ${sizeCfg.cardClasses}`}
                                      title={
                                        branchRatings[selectedLuuNienChi]
                                          ? `Lưu Niên ${selectedYear}: ${selectedLuuNienChi} (${branchRatings[selectedLuuNienChi]})`
                                          : `Lưu Niên ${selectedYear}: ${selectedLuuNienChi}`
                                      }
                                    >
                                      {isLuuNienSelected && (
                                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center text-[9px] font-black shadow ring-1 ring-amber-300 z-20 animate-in zoom-in-75">
                                          {luuNienIdx + 1}
                                        </span>
                                      )}
                                      <span className={`text-amber-300 font-bold uppercase tracking-tighter leading-none mb-0.5 ${sizeCfg.badgeClasses}`}>
                                        Lưu Niên
                                      </span>
                                      {branchRatings[selectedLuuNienChi] && (
                                        <span
                                          className={`absolute -top-1 -right-1 px-1 py-0.2 rounded font-bold border ${getRatingBadgeStyle(
                                            branchRatings[selectedLuuNienChi]
                                          )} ${sizeCfg.badgeClasses}`}
                                        >
                                          {branchRatings[selectedLuuNienChi]}
                                        </span>
                                      )}
                                      {showTableEmoji && (
                                        <span className={`${sizeCfg.emojiClasses} select-none`}>
                                          {targetChiData?.emoji || "⭐"}
                                        </span>
                                      )}
                                      <span className={`font-serif font-bold text-amber-200 leading-none select-none ${
                                        showTableEmoji ? sizeCfg.chiClasses : `${sizeCfg.chiClasses} py-1 my-0.5 text-base sm:text-lg`
                                      }`}>
                                        {selectedLuuNienChi}
                                      </span>
                                      {showTwoTierTamAnPhu && (() => {
                                        const lnTamAn = getTamAnPhuInfoForChi(selectedLuuNienChi);
                                        return lnTamAn?.tuongName ? (
                                          <span
                                            className={`font-serif font-bold text-[#FFE28A] bg-[#291A0E]/95 px-1 py-0.2 rounded border border-amber-600/60 truncate max-w-full leading-tight shadow-xs ${sizeCfg.tamAnClasses} select-none my-0.5`}
                                            title={lnTamAn.fullLine ? `Tâm Ấn Phú: ${lnTamAn.fullLine}` : `Tâm Ấn: 《${lnTamAn.tuongName}》`}
                                          >
                                            《{lnTamAn.tuongName}》
                                          </span>
                                        ) : null;
                                      })()}
                                    </div>
                                  );
                                })()}

                                {/* CÁC CHI TRÙNG TỪ NGUYÊN CỤC NẰM CHUNG Ô VỚI CHI LƯU NIÊN */}
                                {displayedMiddleSame.map((p) => {
                                  const info = getPillarCardInfo(p, "middle_same");
                                  const nodeKey = `twoTier-${p.key}`;
                                  return (
                                    <BaziTwoTierCard
                                      key={`thucthi-mid-${p.key}`}
                                      pillarKey={p.key}
                                      label={p.label}
                                      pillar={p.pillar}
                                      chi={p.chi}
                                      currentZone="middle_same"
                                      size={cardSize}
                                      showEmoji={showTableEmoji}
                                      onMoveToZone={handleMoveToZone}
                                      isDragging={draggedPillarKey === p.key}
                                      onDragStart={() => setDraggedPillarKey(p.key)}
                                      onDragEnd={() => {
                                        setDraggedPillarKey(null);
                                        setActiveDropZone(null);
                                      }}
                                      badgeText={info.badgeText}
                                      badgeType={info.badgeType}
                                      subNote={info.subNote}
                                      tamAnPhuName={info.tamAnPhu?.tuongName}
                                      tamAnPhuChinese={info.tamAnPhu?.tuongChinese}
                                      tamAnPhuFullLine={info.tamAnPhu?.fullLine}
                                      showTamAnPhu={showTwoTierTamAnPhu}
                                      innerRef={(el) => {
                                        twoTierNodeRefs.current[nodeKey] = el;
                                      }}
                                      isSelected={twoTierSelectedNodes.includes(nodeKey)}
                                      selectedIndex={twoTierSelectedNodes.indexOf(nodeKey)}
                                      onSelect={() => handleTwoTierToggleNode(nodeKey)}
                                      className="border-2 border-amber-500/80 shadow-lg ring-1 ring-amber-500/40"
                                    />
                                  );
                                })}
                              </div>
                            </BaziTwoTierDropZone>
                          </div>

                          {/* CỘT PHẢI: CÁC CHI BỊ KÉO XUỐNG BÊN PHẢI (CÁNH HỮU) */}
                          <div className="space-y-1 sm:space-y-1.5">
                            <div className="flex items-center justify-between pb-0.5 border-b border-[#4D3620] text-center">
                              <span className="text-[8px] sm:text-[9.5px] font-bold text-emerald-300 flex items-center gap-0.5 sm:gap-1 truncate">
                                <ArrowDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400 shrink-0" />
                                <span className="truncate">Cánh Hữu (Phải)</span>
                              </span>
                              <span className="text-[7.5px] sm:text-[8px] text-[#8C7D6B] font-mono shrink-0">{displayedBottomRight.length} Chi</span>
                            </div>
                            <BaziTwoTierDropZone
                              zoneKey="bottom_right"
                              activeDropZone={activeDropZone}
                              onDropToZone={handleMoveToZone}
                              onDragOverZone={setActiveDropZone}
                              onDragLeaveZone={() => setActiveDropZone(null)}
                              itemCount={displayedBottomRight.length}
                              emptyLabel="Thả Chi Hữu"
                              emptyDesc="Kéo vào bên phải"
                            >
                              {renderBottomPillars(displayedBottomRight, "bottom_right")}
                            </BaziTwoTierDropZone>
                          </div>
                        </div>
                      );
                    })()}

                    {/* ---------------- 3. ĐỊA CHI ĐƯỢC CỦNG (Ở DƯỚI CÙNG - MÀU KHÁC BIỆT & ĐÓNG MỞ NGOẶC) ---------------- */}
                    <div className="pt-2 border-t-2 border-[#543A1E] space-y-1.5">
                      <div className="flex items-center justify-between text-[9.5px] sm:text-[10px]">
                        <span className="font-bold text-purple-300 flex items-center gap-1.5 uppercase tracking-wider font-mono">
                          <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                          <span>Địa Chi Được Củng (Ở Dưới Cùng)</span>
                        </span>
                        <span className="text-[8.5px] px-2 py-0.2 rounded-full bg-purple-950/90 text-purple-200 border border-purple-500/70 font-mono">
                          Hư Thần Củng Khí • Đóng Mở Ngoặc ( )
                        </span>
                      </div>

                      {activeCungResultList.length > 0 ? (
                        <div className="flex flex-wrap items-center justify-center gap-1.5 p-1">
                          {activeCungResultList.map((cung, idx) => {
                            const cData = CHI_MAP.get(cung.cungChi);
                            const nodeKey = `twoTier-cung-bot-${cung.cungChi}-${idx}`;
                            const isSelected = twoTierSelectedNodes.includes(nodeKey);
                            const selIdx = twoTierSelectedNodes.indexOf(nodeKey);
                            return (
                              <div
                                key={`thucthi-cung-result-${idx}`}
                                ref={(el) => {
                                  twoTierNodeRefs.current[nodeKey] = el;
                                }}
                                onClick={() => handleTwoTierToggleNode(nodeKey)}
                                className={`relative shrink-0 bg-gradient-to-b from-[#381647] via-[#260E32] to-[#17081E] border-2 border-purple-400/90 shadow-md shadow-purple-900/40 ring-1 ring-purple-500/50 text-center flex flex-col items-center justify-center select-none transition-all cursor-pointer hover:scale-[1.05] ${
                                  isSelected
                                    ? "!border-amber-400 ring-2 ring-amber-400 scale-[1.04] shadow-lg shadow-amber-500/30 z-10"
                                    : ""
                                } ${sizeCfg.cardClasses}`}
                                title={cung.desc}
                              >
                                {isSelected && (
                                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center text-[9px] font-black shadow ring-1 ring-amber-300 z-20 animate-in zoom-in-75">
                                    {selIdx + 1}
                                  </span>
                                )}
                                {showTableEmoji && (
                                  <span className={`${sizeCfg.emojiClasses} select-none`}>
                                    {cData?.emoji || "⭐"}
                                  </span>
                                )}
                                <span className={`font-serif font-bold text-purple-100 leading-none select-none ${
                                  showTableEmoji ? sizeCfg.chiClasses : `${sizeCfg.chiClasses} py-1 my-0.5 text-base sm:text-lg`
                                }`}>
                                  ({cung.cungChi})
                                </span>
                                {showTwoTierTamAnPhu && (() => {
                                  const cTamAn = getTamAnPhuInfoForChi(cung.cungChi);
                                  return cTamAn?.tuongName ? (
                                    <span
                                      className={`font-serif font-bold text-[#FFE28A] bg-[#291A0E]/95 px-1 py-0.2 rounded border border-amber-600/60 truncate max-w-full leading-tight shadow-xs ${sizeCfg.tamAnClasses} select-none my-0.5`}
                                      title={cTamAn.fullLine ? `Tâm Ấn Phú: ${cTamAn.fullLine}` : `Tâm Ấn: 《${cTamAn.tuongName}》`}
                                    >
                                      《{cTamAn.tuongName}》
                                    </span>
                                  ) : null;
                                })()}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-1.5 rounded-lg bg-[#1D0F24]/50 border border-dashed border-purple-700/40 text-center text-purple-300/70 text-[9px] italic flex items-center justify-center min-h-[38px]">
                          <span>Chưa có Địa Chi nào được củng sinh ra ở dưới cùng.</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* THANH ĐIỀU KHIỂN & QUẢN LÝ MŨI TÊN / ĐƯỜNG DẪN TRONG PHÂN TRỤC 2 TẦNG */}
                <div className="pt-2 border-t border-[#2C1D10] flex flex-col gap-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold text-[#E2B755] flex items-center gap-1.5">
                        <MousePointerClick className="w-3.5 h-3.5 text-amber-400" />
                        <span>Mũi tên 2 Tầng ({twoTierArrows.length}):</span>
                      </span>
                      {twoTierSelectedNodes.length >= 2 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-600/70 font-semibold animate-pulse">
                          🎯 Đang chọn {twoTierSelectedNodes.length} ô. Dùng thanh nối nhanh bên trên hoặc bấm thêm ô khác!
                        </span>
                      )}
                      {twoTierSelectedNodes.length === 1 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-600/70 font-semibold animate-pulse">
                          🎯 Đang chọn {getTwoTierNodeInfo(twoTierSelectedNodes[0])?.name}. Bấm thêm các chữ khác để kết nối!
                        </span>
                      )}
                      {twoTierSelectedNodes.length === 0 && (
                        <span className="text-[10px] text-[#8C7D6B] italic">
                          (Bấm vào bất kỳ thẻ Địa Chi nào trên bố cục 2 tầng để chọn và tạo mũi tên dẫn kết nối)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Nút bật tắt ẩn hiện mũi tên */}
                      <button
                        type="button"
                        onClick={() => setTwoTierShowArrows(!twoTierShowArrows)}
                        className={`px-2 py-1 text-[10px] font-semibold rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                          twoTierShowArrows
                            ? "bg-[#251A0F] text-amber-300 border-amber-600/50 hover:bg-[#342416]"
                            : "bg-[#1B130B] text-stone-500 border-stone-800 hover:text-stone-300"
                        }`}
                        title={twoTierShowArrows ? "Tạm ẩn mũi tên để nhìn thoáng" : "Hiện lại mũi tên"}
                      >
                        <span>{twoTierShowArrows ? "👁️ Ẩn Mũi Tên" : "👁️ Hiện Mũi Tên"}</span>
                      </button>

                      {/* Nút chọn nhanh */}
                      <button
                        type="button"
                        onClick={handleSelectTwoTierAll}
                        className="px-2 py-1 text-[10px] font-semibold rounded-lg bg-[#271E15] hover:bg-[#382B1E] text-amber-200 border border-[#523F27] hover:border-amber-500 transition-all cursor-pointer"
                        title="Chọn tất cả các ô trong 2 tầng để nối mạng lưới"
                      >
                        <span>Chọn Hết</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSelectTwoTierTop}
                        className="px-2 py-1 text-[10px] font-semibold rounded-lg bg-[#271E15] hover:bg-[#382B1E] text-emerald-200 border border-[#523F27] hover:border-emerald-500 transition-all cursor-pointer"
                        title="Chọn các ô Thượng Tầng (Tầng Trên)"
                      >
                        <span>Tầng Trên</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSelectTwoTierBottom}
                        className="px-2 py-1 text-[10px] font-semibold rounded-lg bg-[#271E15] hover:bg-[#382B1E] text-cyan-200 border border-[#523F27] hover:border-cyan-500 transition-all cursor-pointer"
                        title="Chọn các ô Hạ Tầng (Tầng Dưới)"
                      >
                        <span>Tầng Dưới</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSelectTwoTierOppose}
                        className="px-2 py-1 text-[10px] font-semibold rounded-lg bg-[#271E15] hover:bg-[#382B1E] text-rose-200 border border-[#523F27] hover:border-rose-500 transition-all cursor-pointer"
                        title="Chọn các ô Đối Diện và Chi Lưu Niên"
                      >
                        <span>Đối Diện + Lưu Niên</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (!twoTierShowArrowCreator) {
                            if (twoTierAllNodesList.length >= 2) {
                              setTwoTierNewArrowFrom(twoTierAllNodesList[0].key);
                              setTwoTierNewArrowTo(twoTierAllNodesList[1].key);
                              const sug = suggestTwoTierRelation(twoTierAllNodesList[0].key, twoTierAllNodesList[1].key);
                              setTwoTierNewArrowLabel(sug.label);
                              setTwoTierNewArrowColor(sug.color);
                              setTwoTierNewArrowDirection(sug.direction);
                            }
                          }
                          setTwoTierShowArrowCreator(!twoTierShowArrowCreator);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 text-[10.5px] font-semibold rounded-lg bg-[#271E15] hover:bg-[#382B1E] text-amber-200 border border-[#523F27] hover:border-amber-500 transition-all cursor-pointer"
                      >
                        <Plus className="w-3 h-3 text-amber-400" />
                        <span>{twoTierShowArrowCreator ? "Đóng Tạo Mũi Tên" : "Thêm Mũi Tên Thủ Công"}</span>
                      </button>

                      {twoTierArrows.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setTwoTierArrows([])}
                          className="flex items-center gap-1 px-2 py-1 text-[10.5px] font-semibold rounded-lg bg-[#2A1512] hover:bg-[#3D1A16] text-rose-300 border border-rose-900/60 hover:border-rose-500 transition-all cursor-pointer"
                          title="Xóa tất cả mũi tên đã tạo ở bố cục 2 tầng"
                        >
                          <Trash2 className="w-3 h-3 text-rose-400" />
                          <span>Xóa Hết ({twoTierArrows.length})</span>
                        </button>
                      )}

                      {twoTierSelectedNodes.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setTwoTierSelectedNodes([]);
                            setTwoTierShowArrowCreator(false);
                          }}
                          className="text-[10.5px] px-2 py-1 text-[#8C7D6B] hover:text-white transition-colors cursor-pointer"
                        >
                          Bỏ chọn
                        </button>
                      )}
                    </div>
                  </div>

                  {/* DANH SÁCH CÁC MŨI TÊN ĐÃ TẠO TRONG 2 TẦNG */}
                  {twoTierArrows.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      <span className="text-[10px] text-[#A89882] font-semibold">Đã tạo ({twoTierArrows.length}):</span>
                      {twoTierArrows.map((a) => {
                        const fromInfo = getTwoTierNodeInfo(a.fromKey);
                        const toInfo = getTwoTierNodeInfo(a.toKey);
                        const dirSymbol =
                          a.direction === "forward"
                            ? "➔"
                            : a.direction === "backward"
                            ? "⬅"
                            : a.direction === "both"
                            ? "⟷"
                            : "──";

                        return (
                          <div
                            key={`tt-chip-${a.id}`}
                            onMouseEnter={() => setTwoTierHoveredArrowId(a.id)}
                            onMouseLeave={() => setTwoTierHoveredArrowId((cur) => (cur === a.id ? null : cur))}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-medium shadow-sm transition-all bg-[#1D140C] ${
                              twoTierHoveredArrowId === a.id ? "ring-1 ring-amber-400 scale-105" : ""
                            }`}
                            style={{ borderColor: a.color || "#F59E0B" }}
                          >
                            <span style={{ color: a.color || "#F59E0B" }} className="font-bold">
                              {fromInfo?.value || a.fromKey} {dirSymbol} {toInfo?.value || a.toKey}:
                            </span>
                            <span className="text-[#F5EAD4] font-semibold">{a.label}</span>

                            {/* Nút sửa nội dung và vị trí mũi tên */}
                            <button
                              type="button"
                              onClick={() => handleTwoTierStartEditArrow(a)}
                              className="text-amber-400 hover:text-white p-0.5 rounded cursor-pointer transition-colors ml-0.5"
                              title="Sửa nội dung và vị trí mũi tên"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>

                            {/* Nút đặt lại vị trí nếu đã bị dịch chuyển */}
                            {(a.badgeOffset?.x ||
                              a.badgeOffset?.y ||
                              a.curveOffset?.x ||
                              a.curveOffset?.y ||
                              a.startOffset?.x ||
                              a.startOffset?.y ||
                              a.endOffset?.x ||
                              a.endOffset?.y) && (
                              <button
                                type="button"
                                onClick={() => handleTwoTierResetArrowOffsets(a.id)}
                                className="text-blue-300 hover:text-white p-0.5 rounded cursor-pointer transition-colors"
                                title="Đặt lại vị trí gốc"
                              >
                                <RotateCcw className="w-2.5 h-2.5" />
                              </button>
                            )}

                            {/* Nút xóa mũi tên */}
                            <button
                              type="button"
                              onClick={() => setTwoTierArrows((prev) => prev.filter((item) => item.id !== a.id))}
                              className="text-[#8C7D6B] hover:text-rose-400 p-0.5 rounded cursor-pointer transition-colors"
                              title="Xóa mũi tên"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* =================================================================
              KHU VỰC LUẬN CỦNG: CÒN GÌ - MẤT GÌ - MỚI THÊM GÌ (3 CỘT ĐỐI CHIẾU)
              ================================================================= */}
          <div className="p-2.5 sm:p-3.5 rounded-xl bg-[#171109] border border-[#3A2817] space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1.5 border-b border-[#2C1D10]">
              <span className="font-bold text-[#E2B755] flex items-center gap-1.5 text-[10.5px] sm:text-[11px] uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Biến Động Củng Khí: Nguyên Cục + Hành Vận ⟷ Lưu Niên ({selectedYear})</span>
              </span>
              <span className="text-[9px] text-[#8C7D6B] font-mono">
                5 Trụ ban đầu: {initialCungList.length} Củng (
                <span className="text-amber-300 font-bold">{intactCungList.length} Còn</span> •{" "}
                <span className="text-rose-400 font-bold">{lostCungList.length} Mất</span>) •{" "}
                <span className="text-emerald-400 font-bold">+{newCungList.length} Mới</span>
              </span>
            </div>

            <div className="text-[10px] text-[#A89882] leading-relaxed">
              • <strong className="text-amber-300">Còn Gì</strong>: Các cặp củng giữa Nguyên Cục và Hành Vận mà 2 chi không bị chia cắt phân tầng khi Lưu Niên {selectedYear} tới.
              <br />
              • <strong className="text-rose-400">Mất Gì</strong>: Khi một chi trong cặp củng bị hợp kéo xuống tầng dưới cùng Lưu Niên <strong className="text-amber-300">{selectedLuuNienChi}</strong>, thế kẹp củng ban đầu bị phá vỡ.
              <br />
              • <strong className="text-emerald-400">Mới Thêm Gì</strong>: Tại tầng dưới, <strong className="text-amber-300">Lưu Niên {selectedLuuNienChi}</strong> kết hợp với các Chi hợp kéo xuống tạo thành tổ hợp Tam Hợp / Tam Hội cục mới sinh ra củng.
            </div>

            {/* 3 CỘT GHI CHÚ KẾ BÊN: CÒN GÌ - MẤT GÌ - MỚI THÊM GÌ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {/* CỘT 1: CỦNG CÒN LẠI (BẢO TOÀN) */}
              <div className="p-2 rounded-lg bg-gradient-to-b from-[#241C10] to-[#17120A] border border-amber-600/70 space-y-1.5 shadow-sm">
                <div className="flex items-center justify-between text-[10.5px]">
                  <span className="font-bold text-amber-300 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Củng 5 Trụ Còn Lại:</span>
                  </span>
                  <span className="text-[8.5px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-200 border border-amber-700/60 font-semibold font-mono">
                    {intactCungList.length} Cục
                  </span>
                </div>

                {intactCungList.length > 0 ? (
                  <div className="space-y-1.5">
                    {intactCungList.map((item, idx) => (
                      <div
                        key={`intact-thucthi-${idx}`}
                        className="p-1.5 rounded bg-[#2E2214] border border-amber-700/60 flex flex-col gap-0.5 text-[9.5px]"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-200">
                            🛡️ Còn củng: <strong className="text-amber-300 font-serif text-xs">[{item.cungChi}]</strong>
                          </span>
                          <span className="text-[8px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800/80 font-mono">
                            {item.groupName}
                          </span>
                        </div>
                        <div className="text-[8.5px] text-[#E0D2B8] leading-snug">
                          {item.reason}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-2 rounded bg-[#1B140B] border border-dashed border-amber-900/50 text-center text-[#9E8D7A] text-[9.5px] italic">
                    {initialCungList.length === 0
                      ? "Nguyên Cục và Hành Vận ban đầu không có cặp củng kẹp."
                      : "Tất cả các cục củng đều đã bị phân tách khi Lưu Niên tới."}
                  </div>
                )}
              </div>

              {/* CỘT 2: CỦNG MẤT ĐI (PHÁ CỤC CỦNG) */}
              <div className="p-2 rounded-lg bg-gradient-to-b from-[#241211] to-[#180C0B] border border-rose-800/70 space-y-1.5 shadow-sm">
                <div className="flex items-center justify-between text-[10.5px]">
                  <span className="font-bold text-rose-300 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Củng Bị Lưu Niên Phá:</span>
                  </span>
                  <span className="text-[8.5px] px-1.5 py-0.2 rounded bg-rose-950 text-rose-200 border border-rose-700/60 font-semibold font-mono">
                    {lostCungList.length} Cục
                  </span>
                </div>

                {lostCungList.length > 0 ? (
                  <div className="space-y-1.5">
                    {lostCungList.map((item, idx) => (
                      <div
                        key={`lost-thucthi-${idx}`}
                        className="p-1.5 rounded bg-[#2D1412] border border-rose-700/60 flex flex-col gap-0.5 text-[9.5px]"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-rose-200">
                            🔴 Mất củng: <strong className="text-rose-300 font-serif text-xs">[{item.cungChi}]</strong>
                          </span>
                          <span className="text-[8px] px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800/80 font-mono">
                            {item.groupName}
                          </span>
                        </div>
                        <div className="text-[8.5px] text-[#E0B8B5] leading-snug">
                          {item.reason}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-2 rounded bg-[#1C0E0D] border border-dashed border-rose-900/50 text-center text-[#9E7D7A] text-[9.5px] italic">
                    Không có cục củng nào bị phá vỡ khi xét Lưu Niên {selectedYear} ({selectedLuuNienChi}).
                  </div>
                )}
              </div>

              {/* CỘT 3: CỦNG MỚI THÊM VÀO TẠI TẦNG DƯỚI */}
              <div className="p-2 rounded-lg bg-gradient-to-b from-[#112417] to-[#0A180F] border border-emerald-800/70 space-y-1.5 shadow-sm">
                <div className="flex items-center justify-between text-[10.5px]">
                  <span className="font-bold text-emerald-300 flex items-center gap-1">
                    <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Lưu Niên Sinh Củng Mới:</span>
                  </span>
                  <span className="text-[8.5px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-200 border border-emerald-700/60 font-semibold font-mono">
                    {newCungList.length} Cục
                  </span>
                </div>

                {newCungList.length > 0 ? (
                  <div className="space-y-1.5">
                    {newCungList.map((item, idx) => (
                      <div
                        key={`new-thucthi-${idx}`}
                        className="p-1.5 rounded bg-[#132D1D] border border-emerald-700/60 flex flex-col gap-0.5 text-[9.5px]"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-200">
                            🟢 Mới củng: <strong className="text-emerald-300 font-serif text-xs">[{item.cungChi}]</strong>
                          </span>
                          <span className="text-[8px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/80 font-mono">
                            {item.groupName}
                          </span>
                        </div>
                        <div className="text-[8.5px] text-[#A8D4B7] leading-snug">
                          {item.desc} (với {item.withBranch})
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-2 rounded bg-[#0D1C13] border border-dashed border-emerald-900/50 text-center text-[#7A9E86] text-[9.5px] italic">
                    Tại tầng dưới chưa hội đủ cặp để Lưu Niên sinh thêm chữ củng mới.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* =================================================================
              12 DÒNG LỤC HỢP • THIÊN TƯỚNG (THIÊN BÀN) • TÂM ẤN PHÚ
              - Định dạng tinh gọn chính xác:
                Dần - Hợi - Thiên Tướng - tên tâm ấn phú và con mắt xem
              ================================================================= */}
          <div className="p-2.5 sm:p-3.5 rounded-xl bg-gradient-to-b from-[#1E150B] via-[#171008] to-[#120B05] border border-[#5A4026] space-y-2.5 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1.5 border-b border-[#3E2B18]">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-[#E2B755] text-[11px] sm:text-xs uppercase tracking-wider font-serif">
                  12 ĐỊA CHI LỤC HỢP • THIÊN TƯỚNG THIÊN BÀN • TÂM ẤN PHÚ (心印賦)
                </span>
              </div>
              <span className="text-[9.5px] text-[#A89882] font-mono">
                Sao chép trực tiếp từ Bàn Lục Nhâm bên dưới (Độc lập với Bát Tự Thực Thi Thiên)
              </span>
            </div>

            {/* ================= TÂM ẤN PHÚ TAM KHÍ: NGUYỆT TƯỚNG • NHẬT CHIÊM • HOẠT THỜI ================= */}
            {(() => {
              // 1. Nguyệt Tướng Tâm Ấn
              const ntTamAnObj = lucNhamBoardState.nguyetTuongTamAn;
              const ntBranch = lucNhamBoardState.nguyetTuong || "Hợi";
              const ntTuongName = ntTamAnObj?.tuongName || lucNhamBoardState.nguyetTuongName || "Thần Hậu";
              const ntGeneral = ntTamAnObj?.generalName || "Quý Nhân";
              const ntTamAn = ntTamAnObj?.tamAnPhu || getTamAnPhuExactEntry(ntGeneral, ntBranch)?.entry;

              // 2. Nhật Chiêm Tâm Ấn (Can Chi Ngày)
              const nhatTamAnObj = lucNhamBoardState.nhatTrucTamAn;
              const dayCan = nhatTamAnObj?.dayCan || lucNhamBoardState.dayCan || "Kỷ";
              const dayChi = nhatTamAnObj?.dayChi || lucNhamBoardState.dayChi || "Mão";
              const canThuongTamAn = nhatTamAnObj?.canThuongTamAn;
              const chiThuongTamAn = nhatTamAnObj?.chiThuongTamAn;
              const trucNhatTamAn = nhatTamAnObj?.trucNhatTamAn;

              // 3. Hoạt Thời Tâm Ấn (Thời Thần)
              const htTamAnObj = lucNhamBoardState.hoatThoiTamAn;
              const htBranch = lucNhamBoardState.activeThoi || "Tỵ";
              const htGeneral = htTamAnObj?.generalName || "Thái Thường";
              const htSkyBranch = htTamAnObj?.skyBranch || htBranch;
              const htTamAn = htTamAnObj?.tamAnPhu || getTamAnPhuExactEntry(htGeneral, htSkyBranch)?.entry;

              return (
                <div className="p-2 sm:p-2.5 rounded-lg bg-gradient-to-r from-[#2A1B0E] via-[#21150A] to-[#2A1B0E] border border-amber-600/60 shadow-md space-y-2">
                  <div className="flex items-center justify-between text-[10.5px] font-bold text-amber-300 pb-1 border-b border-amber-700/40">
                    <span className="flex items-center gap-1.5 uppercase font-serif tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Tâm Ấn Phú Tam Khí: Nguyệt Tướng • Nhật Chiêm • Hoạt Thời</span>
                    </span>
                    <span className="text-[8px] text-[#A89882] font-mono hidden sm:inline">
                      Bấm vào từng thẻ để tra cứu khẩu quyết chiêm đoán
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:gap-2">
                    {/* Thẻ 1: Nguyệt Tướng (Thái Dương) */}
                    <div
                      onClick={() => {
                        if (ntTamAn) {
                          setSelectedTamAnPhuItem({
                            branch: ntBranch,
                            lucHopBranch: ntBranch,
                            generalName: ntGeneral,
                            generalChinese: CHINESE_GENERAL_MAP[ntGeneral] || "",
                            tuongName: ntTamAn.tuongName,
                            tuongChinese: ntTamAn.tuongChinese,
                            fullLine: ntTamAn.fullLine || ntTamAn.originalPoem || `Cư ${ntBranch}— ${ntTamAn.tuongName}: ${ntTamAn.meaning}`,
                            meaning: ntTamAn.meaning,
                            skyBranchName: ntBranch,
                          });
                        }
                      }}
                      className="p-2 rounded-lg bg-[#1B1107] hover:bg-[#25170B] border border-sky-600/50 hover:border-sky-400 transition-all cursor-pointer shadow-xs flex flex-col justify-between gap-1 group active:scale-98"
                      title="Bấm để xem chi tiết Tâm Ấn Phú Nguyệt Tướng"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-sky-300 font-bold flex items-center gap-1">
                          <Sun className="w-3 h-3 text-sky-400" />
                          <span>Nguyệt Tướng ({ntTuongName})</span>
                        </span>
                        <span className="text-[8.5px] px-1 rounded bg-sky-950 text-sky-200 border border-sky-700/50 font-mono">
                          {ntBranch}
                        </span>
                      </div>
                      <div className="text-xs font-serif flex items-center justify-between">
                        <span className="text-amber-200 font-semibold">{ntGeneral}</span>
                        <strong className="text-[#FFE28A] group-hover:text-amber-200 font-bold">
                          《{ntTamAn?.tuongName || "Tâm Ấn"}》
                        </strong>
                      </div>
                      {ntTamAn?.meaning && (
                        <div className="text-[9px] text-[#C4B49F] line-clamp-1 italic">
                          {ntTamAn.meaning}
                        </div>
                      )}
                    </div>

                    {/* Thẻ 2: Nhật Chiêm (Can Chi Ngày) */}
                    <div
                      onClick={() => {
                        const targetTamAn = canThuongTamAn || chiThuongTamAn || trucNhatTamAn;
                        if (targetTamAn) {
                          setSelectedTamAnPhuItem({
                            branch: dayChi,
                            lucHopBranch: dayChi,
                            generalName: targetTamAn.tuongName ? `Nhật Chiêm (${dayCan} ${dayChi})` : "Quý Nhân",
                            tuongName: targetTamAn.tuongName,
                            tuongChinese: targetTamAn.tuongChinese,
                            fullLine: targetTamAn.fullLine || targetTamAn.originalPoem || `Nhật Chiêm ${dayCan} ${dayChi}— ${targetTamAn.tuongName}: ${targetTamAn.meaning}`,
                            meaning: targetTamAn.meaning,
                            skyBranchName: dayChi,
                          });
                        }
                      }}
                      className="p-2 rounded-lg bg-[#1B1107] hover:bg-[#25170B] border border-emerald-600/50 hover:border-emerald-400 transition-all cursor-pointer shadow-xs flex flex-col justify-between gap-1 group active:scale-98"
                      title="Bấm để xem chi tiết Tâm Ấn Phú Nhật Chiêm"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-emerald-300 font-bold flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-emerald-400" />
                          <span>Nhật Chiêm ({dayCan} {dayChi})</span>
                        </span>
                        <span className="text-[8.5px] px-1 rounded bg-emerald-950 text-emerald-200 border border-emerald-700/50 font-mono">
                          Trực Nhật
                        </span>
                      </div>
                      <div className="text-xs font-serif flex items-center justify-between">
                        <span className="text-amber-200 font-semibold text-[10.5px]">
                          {canThuongTamAn ? `Can: 《${canThuongTamAn.tuongName}》` : "Can Thượng"}
                        </span>
                        <strong className="text-[#FFE28A] group-hover:text-amber-200 font-bold text-[10.5px]">
                          {chiThuongTamAn ? `Chi: 《${chiThuongTamAn.tuongName}》` : trucNhatTamAn ? `《${trucNhatTamAn.tuongName}》` : "Tâm Ấn"}
                        </strong>
                      </div>
                      {(canThuongTamAn?.meaning || chiThuongTamAn?.meaning) && (
                        <div className="text-[9px] text-[#C4B49F] line-clamp-1 italic">
                          {canThuongTamAn?.meaning || chiThuongTamAn?.meaning}
                        </div>
                      )}
                    </div>

                    {/* Thẻ 3: Hoạt Thời (Thời Thần) */}
                    <div
                      onClick={() => {
                        if (htTamAn) {
                          setSelectedTamAnPhuItem({
                            branch: htBranch,
                            lucHopBranch: htBranch,
                            generalName: htGeneral,
                            generalChinese: CHINESE_GENERAL_MAP[htGeneral] || "",
                            tuongName: htTamAn.tuongName,
                            tuongChinese: htTamAn.tuongChinese,
                            fullLine: htTamAn.fullLine || htTamAn.originalPoem || `Cư ${htBranch}— ${htTamAn.tuongName}: ${htTamAn.meaning}`,
                            meaning: htTamAn.meaning,
                            skyBranchName: htSkyBranch,
                          });
                        }
                      }}
                      className="p-2 rounded-lg bg-[#1B1107] hover:bg-[#25170B] border border-amber-500/50 hover:border-amber-400 transition-all cursor-pointer shadow-xs flex flex-col justify-between gap-1 group active:scale-98"
                      title="Bấm để xem chi tiết Tâm Ấn Phú Hoạt Thời"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-amber-300 font-bold flex items-center gap-1">
                          <Dices className="w-3 h-3 text-amber-400" />
                          <span>Hoạt Thời (Giờ {htBranch})</span>
                        </span>
                        <span className="text-[8.5px] px-1 rounded bg-amber-950 text-amber-200 border border-amber-700/50 font-mono">
                          {htSkyBranch}
                        </span>
                      </div>
                      <div className="text-xs font-serif flex items-center justify-between">
                        <span className="text-amber-200 font-semibold">{htGeneral}</span>
                        <strong className="text-[#FFE28A] group-hover:text-amber-200 font-bold">
                          《{htTamAn?.tuongName || "Tâm Ấn"}》
                        </strong>
                      </div>
                      {htTamAn?.meaning && (
                        <div className="text-[9px] text-[#C4B49F] line-clamp-1 italic">
                          {htTamAn.meaning}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* DANH SÁCH 12 DÒNG TINH GỌN */}
            <div className="space-y-1.5">
              {lucNham12Lines.map((row, idx) => {
                return (
                  <div
                    key={`tamanphu-12line-${row.branch}-${idx}`}
                    className="p-2 sm:p-2.5 rounded-lg bg-[#20160D]/90 hover:bg-[#2A1D11] border border-[#44301D] hover:border-[#D4AF37]/60 transition-all shadow-sm flex items-center justify-between gap-2"
                  >
                    {/* Dần - Hợi - Thiên Tướng - Tên Tâm Ấn Phú */}
                    <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 text-xs sm:text-sm font-serif">
                      <span className="font-black text-amber-200">
                        {row.branch} - {row.lucHopBranch}
                      </span>
                      <span className="text-[#8C7D6B] font-sans font-light">-</span>
                      <span className={`font-bold ${row.generalColor || "text-amber-300"}`}>
                        {row.generalName}
                      </span>
                      <span className="text-[#8C7D6B] font-sans font-light">-</span>
                      <span className="font-bold text-[#FFE28A]">
                        {row.tuongName}
                        {row.tuongChinese ? ` (${row.tuongChinese})` : ""}
                      </span>
                    </div>

                    {/* Con mắt xem */}
                    <button
                      type="button"
                      onClick={() => setSelectedTamAnPhuItem(row)}
                      className="p-1 sm:p-1.5 rounded-lg text-amber-300 hover:text-[#18130E] hover:bg-[#D4AF37] border border-[#523A22] hover:border-[#D4AF37] transition-all cursor-pointer shadow-sm shrink-0 active:scale-95"
                      title={`Xem chi tiết khẩu quyết 《${row.tuongName}》`}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL XEM CHI TIẾT TÂM ẤN PHÚ CHO TỪNG CHI */}
      {selectedTamAnPhuItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          onClick={() => setSelectedTamAnPhuItem(null)}
        >
          <div
            className="relative w-full max-w-lg bg-gradient-to-b from-[#22160C] via-[#1A1109] to-[#120B06] border-2 border-[#D4AF37] rounded-2xl shadow-[0_0_35px_rgba(212,175,55,0.3)] p-4 sm:p-6 text-[#F5EAD4] space-y-4 max-h-[92vh] overflow-y-auto scrollbar-thin"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Nút đóng */}
            <button
              type="button"
              onClick={() => setSelectedTamAnPhuItem(null)}
              className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-[#322013] hover:bg-[#4A301D] text-[#D8C7B0] hover:text-white flex items-center justify-center border border-[#6B4E2B] transition-colors cursor-pointer z-10"
              title="Đóng cửa sổ"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="text-center pb-3 border-b border-[#44301D]">
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-600/50 font-bold font-mono">
                  Lục Hợp: {selectedTamAnPhuItem.branch} ─ {selectedTamAnPhuItem.lucHopBranch}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#2A1D11] text-[#C4B49F] border border-[#523A22] font-medium">
                  Thiên Bàn {selectedTamAnPhuItem.skyBranchName}
                </span>
              </div>
              <h3 className="text-2xl font-serif font-black text-[#F5EAD4] mt-2 tracking-wide">
                Thiên Tướng {selectedTamAnPhuItem.generalName}{" "}
                {selectedTamAnPhuItem.generalChinese && (
                  <span className="text-base text-amber-400 font-normal font-serif">
                    ({selectedTamAnPhuItem.generalChinese})
                  </span>
                )}
              </h3>
              <p className="text-xs text-[#D4AF37] font-semibold mt-1">
                Tượng Thần Tâm Ấn Phú: 《{selectedTamAnPhuItem.tuongName}》
                {selectedTamAnPhuItem.tuongChinese ? ` (${selectedTamAnPhuItem.tuongChinese})` : ""}
              </p>
            </div>

            {/* Khái Lược Bản Chất Thiên Tướng (Từ Bảng Chuẩn) */}
            {selectedTamAnPhuItem.generalOverview && (
              <div className="p-3 rounded-xl bg-[#1A1109] border border-[#4A321D] space-y-1">
                <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  Bản chất Thiên Tướng:
                </div>
                <div className="text-xs text-[#EAD8C3] leading-relaxed">
                  {selectedTamAnPhuItem.generalOverview}
                </div>
                {selectedTamAnPhuItem.generalNotes && (
                  <div className="text-[11px] text-amber-300/90 italic pt-1 border-t border-[#3A2818]">
                    📌 {selectedTamAnPhuItem.generalNotes}
                  </div>
                )}
              </div>
            )}

            {/* Khẩu Quyết Tâm Ấn Phú Chuẩn (Không Lấy Thông Tin Bên Ngoài) */}
            <div className="p-3.5 rounded-xl bg-[#1B120A] border border-[#5A4026] space-y-2">
              <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Khẩu Quyết 《Tâm Ấn Phú》:</span>
              </div>
              <div className="text-sm font-serif font-bold text-[#FFE6A3] bg-[#26180E] p-2.5 rounded-lg border border-amber-700/60 leading-relaxed shadow-inner">
                {selectedTamAnPhuItem.fullLine}
              </div>
            </div>

            {/* Diễn Giải Ý Nghĩa Chiêm Đoán (Từ Bảng Chuẩn) */}
            {selectedTamAnPhuItem.meaning && (
              <div className="p-3 rounded-xl bg-[#170E08] border border-[#3A2818] text-xs text-[#C4B49F] leading-relaxed space-y-1">
                <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  Ý nghĩa chiêm đoán:
                </div>
                <div className="text-[#E2D2BC] leading-relaxed">{selectedTamAnPhuItem.meaning}</div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-end pt-2 border-t border-[#44301D]">
              <button
                type="button"
                onClick={() => setSelectedTamAnPhuItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#A89882] hover:text-white bg-[#20140B] hover:bg-[#2C1D11] border border-[#44301D] transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XEM ẢNH THẺ BÀI HOA GIÁP & CHI TIẾT NẠP ÂM / QUẺ KINH DỊCH */}
      {previewJiazi && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          onClick={() => setPreviewJiazi(null)}
        >
          <div
            className="relative w-full max-w-lg bg-gradient-to-b from-[#22160C] via-[#1A1109] to-[#120B06] border-2 border-[#D4AF37] rounded-2xl shadow-[0_0_35px_rgba(212,175,55,0.3)] p-4 sm:p-6 text-[#F5EAD4] space-y-4 max-h-[92vh] overflow-y-auto scrollbar-thin"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Nút đóng */}
            <button
              type="button"
              onClick={() => setPreviewJiazi(null)}
              className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-[#322013] hover:bg-[#4A301D] text-[#D8C7B0] hover:text-white flex items-center justify-center border border-[#6B4E2B] transition-colors cursor-pointer z-10"
              title="Đóng cửa sổ"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Tiêu đề & Thông tin cơ bản */}
            <div className="text-center pb-3 border-b border-[#44301D]">
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-600/50 font-bold font-mono">
                  Hoa Giáp #{previewJiazi.order}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#2A1D11] text-[#C4B49F] border border-[#523A22] font-medium">
                  {previewJiazi.branchGroup}
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif font-black text-[#F5EAD4] mt-1.5 tracking-wider">
                {previewJiazi.name}{" "}
                <span className="text-lg text-amber-400 font-normal font-serif">({previewJiazi.chinese})</span>
              </h3>
              <p className="text-xs sm:text-sm text-[#D4AF37] font-semibold mt-1">
                Nạp Âm: {previewJiazi.elementNapAm} • {previewJiazi.soundSymbolism?.element || ""}
              </p>
            </div>

            {/* Khối Ảnh Thẻ Bài Hoa Giáp */}
            <div className="flex flex-col items-center justify-center my-2">
              <div className="relative w-44 sm:w-56 aspect-[3/4] rounded-xl overflow-hidden border-2 border-[#8C6D3B] shadow-[0_10px_25px_rgba(0,0,0,0.7)] bg-[#140D07] flex items-center justify-center">
                {jiaziImages[previewJiazi.id] ? (
                  <img
                    src={jiaziImages[previewJiazi.id]}
                    alt={previewJiazi.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-b from-[#2A1D11] to-[#140D07]">
                    <Sparkles className="w-10 h-10 text-amber-400 mb-2 animate-pulse" />
                    <span className="text-lg font-serif font-bold text-amber-300">
                      #{previewJiazi.order} {previewJiazi.name}
                    </span>
                    <span className="text-xs text-[#A89882] mt-1">{previewJiazi.elementNapAm}</span>
                    <span className="text-[10px] text-amber-500/80 mt-3 italic">Thẻ bài 60 Hoa Giáp</span>
                  </div>
                )}
              </div>
            </div>

            {/* Thông tin Quẻ Kinh Dịch tương ứng */}
            {previewJiazi.hexagramLink && (
              <div className="p-3 rounded-xl bg-[#1B120A] border border-[#5A4026] flex items-center justify-between gap-3 shadow-inner">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-xl text-[#D4AF37]">☯</span>
                  <div className="min-w-0">
                    <div className="text-[11px] text-[#A89882]">Quẻ Kinh Dịch phối hợp:</div>
                    <div className="text-sm font-serif font-bold text-amber-300 truncate">
                      #{previewJiazi.hexagramLink.hexagramNumber} {previewJiazi.hexagramLink.hexagramName}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-1 rounded bg-[#2D1D10] text-amber-200 border border-[#523A22] shrink-0 font-medium">
                  Phối Lục Hào
                </span>
              </div>
            )}

            {/* Diễn giải / Ý nghĩa */}
            {previewJiazi.summary && (
              <div className="p-3 rounded-xl bg-[#170E08] border border-[#3A2818] text-xs text-[#C4B49F] leading-relaxed max-h-32 overflow-y-auto scrollbar-thin">
                <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1">
                  Tổng quan ý nghĩa:
                </div>
                {previewJiazi.summary}
              </div>
            )}

            {/* Nút hành động */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#44301D]">
              <button
                type="button"
                onClick={() => setPreviewJiazi(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#A89882] hover:text-white bg-[#20140B] hover:bg-[#2C1D11] border border-[#44301D] transition-colors cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  const id = previewJiazi.id;
                  setPreviewJiazi(null);
                  if (onSelectJiazi) {
                    onSelectJiazi(id);
                  }
                  const el = document.getElementById("jiazi-detail-container");
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#18130E] bg-gradient-to-r from-[#D4AF37] to-[#E5C158] hover:brightness-110 shadow-lg shadow-amber-900/30 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Xem chi tiết tại Tab 60 Hoa Giáp</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const BaziLuuNienThien: React.FC<BaziThucThiThienProps> = (props) => {
  return (
    <BaziThucThiThien
      title="LƯU NIÊN THIÊN (流年篇)"
      badgeLabel="Bát Tự Lục Nhâm ⟷ Lưu Niên"
      subTitle="Phân tích tương tác giữa Bát Tự Lục Nhâm (Thời Trụ, Nhật Trụ, Nguyệt Trụ, Niên Trụ) cộng Hành Vận đối với Địa Chi Lưu Niên."
      saveButtonText="Lưu Lưu Niên Thiên"
      captureButtonText="Chụp Lưu Niên Thiên"
      {...props}
    />
  );
};
