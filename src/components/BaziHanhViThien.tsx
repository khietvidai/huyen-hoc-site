import React, { useState, useMemo, useEffect } from "react";
import {
  Compass,
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
  Save,
  Camera,
  RotateCcw,
  Move,
  BookOpen,
} from "lucide-react";
import { PillarItem, CHI_MAP, getChiData } from "../data/baziConstants";
import { TAM_AN_PHU_EXACT_DATA } from "../data/lucnhamTamAnPhuExact";
import {
  BaziTwoTierCard,
  TwoTierZone,
  TwoTierCardSize,
  TWO_TIER_CARD_SIZE_CONFIG,
  BaziTwoTierSizeSelector,
} from "./BaziTwoTierCard";
import { BaziTwoTierDropZone } from "./BaziTwoTierDropZone";

export interface HanhViSettings {
  selectedBranch?: string;
  branchRatings?: Record<string, BranchRating | null>;
  isOpen?: boolean;
  showEmoji?: boolean;
}

export interface BaziHanhViThienProps {
  pillars?: [PillarItem, PillarItem, PillarItem, PillarItem]; // [0]: Giờ, [1]: Ngày, [2]: Tháng, [3]: Năm
  className?: string;
  savedSettings?: HanhViSettings;
  onSaveToBazi?: (settings: HanhViSettings) => void;
  onCapture?: () => void;
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

// Toàn bộ các cặp củng (Tam Hợp & Tam Hội, trừ ngoại lệ Thìn-Mão & Tuất-Dậu)
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

// Mục chọn chữ gồm: Hỷ, Trung Cát, Trung, Trung Kỵ, Kỵ
export const RATING_OPTIONS = ["Hỷ", "Trung Cát", "Trung", "Trung Kỵ", "Kỵ"] as const;
export type BranchRating = (typeof RATING_OPTIONS)[number];

export const BaziHanhViThien: React.FC<BaziHanhViThienProps> = ({
  pillars,
  className = "",
  savedSettings,
  onSaveToBazi,
  onCapture,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  // Mở đầu khảo sát là TÝ theo chỉ định
  const [selectedBranch, setSelectedBranch] = useState<string>("Tý");

  // Đánh giá thuộc tính cho từng Chi: Hỷ, Trung Cát, Trung, Trung Kỵ, Kỵ
  const [branchRatings, setBranchRatings] = useState<Record<string, BranchRating | null>>({});

  // Trạng thái thu gọn / mở rộng riêng cho khối bố cục 2 tầng
  const [isTwoTierOpen, setIsTwoTierOpen] = useState<boolean>(true);

  // Chế độ hiển thị: hiện icon thú (emoji) đồng bộ cho tất cả các chữ hay chỉ hiện chữ (mặc định: true)
  const [showTableEmoji, setShowTableEmoji] = useState<boolean>(true);

  // Chế độ đóng / mở hiện tên gọi Tâm Ấn Phú trong bố cục 2 tầng (mặc định mở)
  const [showTwoTierTamAnPhu, setShowTwoTierTamAnPhu] = useState<boolean>(true);

  // Tra cứu Tên gọi Tâm Ấn Phú gắn với Địa Chi từ bảng TAM_AN_PHU_EXACT_DATA chuẩn xác
  const getTamAnPhuInfoForChi = useMemo(() => {
    return (chiName: string) => {
      if (!chiName) return null;
      for (const gen of TAM_AN_PHU_EXACT_DATA) {
        const ent = gen.cungVi[chiName];
        if (ent) {
          return {
            tuongName: ent.tuongName,
            tuongChinese: ent.tuongChinese,
            fullLine: ent.fullLine,
            meaning: ent.meaning,
            generalName: gen.name,
          };
        }
      }
      return null;
    };
  }, []);

  // Khi mở file hoặc nạp hồ sơ: nhảy ra luôn thiết lập đã lưu
  useEffect(() => {
    if (!savedSettings) return;
    if (savedSettings.selectedBranch !== undefined) setSelectedBranch(savedSettings.selectedBranch);
    if (savedSettings.branchRatings !== undefined) setBranchRatings(savedSettings.branchRatings);
    if (savedSettings.isOpen !== undefined) setIsOpen(savedSettings.isOpen);
    if (savedSettings.showEmoji !== undefined) setShowTableEmoji(savedSettings.showEmoji);
  }, [savedSettings]);

  // 4 Chi nguyên cục (Hiển thị từ Giờ tới Năm là từ trái sang phải)
  const nienChi = pillars?.[3]?.chi || "Dậu";
  const nguyetChi = pillars?.[2]?.chi || "Dậu";
  const nhatChi = pillars?.[1]?.chi || "Dậu";
  const thoiChi = pillars?.[0]?.chi || "Tỵ";

  const chartPillars = useMemo(
    () => [
      { key: "thoi", label: "Chi Giờ", pillar: "Thời Trụ", chi: thoiChi },
      { key: "nhat", label: "Chi Ngày", pillar: "Nhật Trụ", chi: nhatChi },
      { key: "nguyet", label: "Chi Tháng", pillar: "Nguyệt Trụ", chi: nguyetChi },
      { key: "nien", label: "Chi Năm", pillar: "Niên Trụ", chi: nienChi },
    ],
    [thoiChi, nhatChi, nguyetChi, nienChi]
  );

  const chartChis = useMemo(() => chartPillars.map((p) => p.chi), [chartPillars]);

  // 1. Kiểm tra Tam Hợp / Tam Hội cục đầy đủ trong 4 trụ nguyên cục (không tính Lục Hợp)
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

  // Tập hợp các Chi thuộc Tam Hợp / Tam Hội đầy đủ trong nguyên cục
  const fullGroupBranchNames = useMemo(() => {
    const set = new Set<string>();
    fullTamHopList.forEach((g) => g.branches.forEach((b) => set.add(b)));
    fullTamHoiList.forEach((g) => g.branches.forEach((b) => set.add(b)));
    return set;
  }, [fullTamHopList, fullTamHoiList]);

  // Kiểm tra sự xuất hiện của Tý hoặc Hợi trong hệ thống (Nguyên cục + Chi khảo sát)
  // Quy tắc người dùng: "Tỵ với thân khi không có tý, hợi sẽ tính là lục hợp, khi có tý hợi sẽ tính là hình"
  const hasTyOrHoi = useMemo(() => {
    return chartChis.some((b) => b === "Tý" || b === "Hợi") || selectedBranch === "Tý" || selectedBranch === "Hợi";
  }, [chartChis, selectedBranch]);

  // Hàm kiểm tra quan hệ Hợp giữa 1 Chi nguyên cục với Chi khảo sát
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

  // Hàm kiểm tra mức độ đối kháng (Xung, Hại, Hình) với thứ tự ưu tiên
  // Ưu tiên: Xung (1) -> Hại (2) -> Hình (3)
  const checkOpposeRelation = (
    branch: string,
    target: string
  ): { priority: number; type: "Xung" | "Hại" | "Hình" | "Thường"; label: string } => {
    // 1. Tương Xung (Ưu tiên cao nhất)
    const isXung = LUC_XUNG_PAIRS.some(
      ([b1, b2]) => (target === b1 && branch === b2) || (target === b2 && branch === b1)
    );
    if (isXung) {
      return { priority: 1, type: "Xung", label: `Tương Xung với ${target}` };
    }

    // 2. Tương Hại (Ưu tiên thứ hai)
    const isHai = LUC_HAI_PAIRS.some(
      ([b1, b2]) => (target === b1 && branch === b2) || (target === b2 && branch === b1)
    );
    if (isHai) {
      return { priority: 2, type: "Hại", label: `Tương Hại với ${target}` };
    }

    // 3. Tương Hình (Ưu tiên thứ ba)
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
          return { priority: 3, type: "Hình", label: `${hinhMatch.type} (${hinhMatch.desc} do có Tý/Hợi) với ${target}` };
        }
      } else {
        return { priority: 3, type: "Hình", label: `${hinhMatch.type} (${hinhMatch.desc}) với ${target}` };
      }
    }

    return { priority: 4, type: "Thường", label: "Không xung hại hình" };
  };

  // Hàm kiểm tra quan hệ liên quan (Âm hợp, Lục hợp, Hợp cục) của 1 chi đối với chữ đối diện
  const checkRelationWithOpposite = (branch: string, oppBranch: string): string[] => {
    const rels: string[] = [];

    // Lục Hợp
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

    // Tam Hợp
    TAM_HOP_GROUPS.forEach((g) => {
      if (g.branches.includes(oppBranch) && g.branches.includes(branch) && oppBranch !== branch) {
        rels.push(`Tam Hợp (${g.name})`);
      }
    });

    // Tam Hội
    TAM_HOI_GROUPS.forEach((g) => {
      if (g.branches.includes(oppBranch) && g.branches.includes(branch) && oppBranch !== branch) {
        rels.push(`Tam Hội (${g.name})`);
      }
    });

    // Âm Hợp (Ám Hợp)
    AM_HOP_PAIRS.forEach(([b1, b2]) => {
      if ((oppBranch === b1 && branch === b2) || (oppBranch === b2 && branch === b1)) {
        rels.push(`Âm Hợp ${oppBranch}`);
      }
    });

    return rels;
  };

  // 2. TÌM CHỮ TRÙNG TRONG NGUYÊN CỤC:
  // "ở nguyên cục có chữ như Tý ở địa chi Tý sẽ bị kéo xuống dưới chung, đặt ở dưới chữ Tý mới"
  const sameBranches = useMemo(() => {
    return chartPillars.filter((p) => p.chi === selectedBranch);
  }, [chartPillars, selectedBranch]);

  // 3. PHÂN CHIA BỐ CỤC:
  // - TẦNG DƯỚI:
  //   + Các chữ nguyên cục có quan hệ Hợp với selectedBranch (Tam Hội, Tam Hợp, Lục Hợp, Âm Hợp).
  // - TẦNG TRÊN:
  //   + Toàn bộ các chữ không bị kéo xuống dưới (hoặc được giữ nguyên do Tam Hợp / Tam Hội toàn cục).
  //   + Phân tách rõ ràng:
  //     a) Chữ có Hình, Xung, Hại với Chi mới -> Đứng vị trí ĐỐI DIỆN TRỰC DIỆN với Chi mới (Ưu tiên Xung -> Hại -> Hình).
  //     b) Chữ có quan hệ Âm hợp, Lục hợp, Hợp cục với chữ đối diện mà không bị kéo xuống dưới -> Đứng KẾ BÊN TRÁI HOẶC PHẢI chữ đối diện!
  //     c) Chữ không liên quan -> Đứng ở trên tầng trên luôn (hàng chi độc lập).
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
      const hopReasons = checkHopRelation(p.chi, selectedBranch);
      if (hopReasons.length > 0) {
        directHopMap.set(p.key, hopReasons);
      }
    });

    // 1B. QUY TẮC ĐẶC BIỆT: HỢP CỤC HÓA KHÍ (NGŨ HÀNH TƯƠNG SINH) & LOẠI TRỪ DO XUNG/HÌNH/HẠI:
    // - Mộc cục (Dần Mão Thìn / Hợi Mão Mùi) hóa Hỏa: Kéo Ngọ xuống, không kéo Tỵ vì Dần Tỵ hình.
    // - Hỏa cục (Dần Ngọ Tuất / Tỵ Ngọ Mùi) hóa Thổ: Chỉ kéo Thìn, không kéo Sửu vì Sửu Ngọ hại và Tuất hình nhau.
    // - Thủy cục (Thân Tý Thìn / Hợi Tý Sửu) hóa Mộc: Chỉ kéo Dần, không kéo Mão vì Mão Thìn hại và Tý Mão hình.
    const allPresentChis = [...chartPillars.map((p) => p.chi), selectedBranch];

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

    // 2. Kiểm tra xem có Tam Hợp hoặc Tam Hội đầy đủ nào trong nguyên cục bị kéo theo không:
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
        const opp = checkOpposeRelation(b, selectedBranch);
        return opp.type === "Xung" || opp.type === "Hại" || opp.type === "Hình";
      });

      // Kiểm tra xem có chữ nào trong nhóm có quan hệ Hợp trực tiếp hoặc trùng với Chi mới không:
      const triggeredMembers = memberPillars.filter(
        (p) => directHopMap.has(p.key) || p.chi === selectedBranch
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
      const isSame = p.chi === selectedBranch;
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

      // D2. Chữ có Xung, Hình, Hại với Chi mới -> BẮT BUỘC ĐỂ ĐỐI DIỆN ĐỊA CHI MỚI Ở TẦNG TRÊN
      const opp = checkOpposeRelation(p.chi, selectedBranch);
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
  }, [chartPillars, selectedBranch, fullGroupBranchNames, hasTyOrHoi]);

  // 3B. CỦNG SẴN Ở NGUYÊN CỤC (Để xếp ở Góc Phải Phía Trên)
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
      // 1. Kiểm tra xem Địa Chi mới có Xung, Hình, Hại với 1 trong 2 chữ củng không
      // (Quy tắc: Các địa chi mới khi xung, hình, hại 1 địa chi nào đó ở nguyên cục, cũng sẽ phá vỡ luôn củng cục)
      const opp1 = checkOpposeRelation(c.p1.chi, selectedBranch);
      const opp2 = checkOpposeRelation(c.p2.chi, selectedBranch);
      const isOpposed =
        opp1.type === "Xung" || opp1.type === "Hại" || opp1.type === "Hình" ||
        opp2.type === "Xung" || opp2.type === "Hại" || opp2.type === "Hình";
      if (isOpposed) return; // Bị phá vỡ -> không tính là củng hợp lệ ở Cánh Hữu

      // 2. Kiểm tra có bị kéo xuống tầng dưới (1 chữ hoặc cả 2 chữ) không:
      // (Ví dụ: Hợi tới âm hợp Ngọ, Hợi Dần lục hợp -> Dần Ngọ đều xuống dưới -> mất củng Tuất, mất củng Mão, mất củng Sửu, mất củng Mùi)
      const p1InBottom = bottomKeys.has(c.p1.key);
      const p2InBottom = bottomKeys.has(c.p2.key);
      const isRetainedInTop =
        retainedInTopFullGroupPillarKeys.has(c.p1.key) &&
        retainedInTopFullGroupPillarKeys.has(c.p2.key);

      // Nếu bất kỳ chữ nào bị kéo xuống tầng dưới (hoặc cả 2 chữ đều bị kéo xuống):
      // Đều phá củng ở Tầng Trên, không tính là củng hợp lệ ở Cánh Hữu
      if (!isRetainedInTop && (p1InBottom || p2InBottom)) {
        return;
      }

      s.add(c.p1.key);
      s.add(c.p2.key);
    });
    return s;
  }, [cungOriginSummary, bottomBranches, selectedBranch, retainedInTopFullGroupPillarKeys, hasTyOrHoi]);

  // 3C. TÍNH TOÁN BỐ CỤC MẶC ĐỊNH & HỖ TRỢ KÉO THẢ TÙY BIẾN VỊ TRÍ
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
      // 1. Ưu tiên cao nhất: Địa chi có Xung, Hình, Hại với Chi mới -> Đặt đối diện Chi mới ở tầng trên
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

  const sizeCfg = TWO_TIER_CARD_SIZE_CONFIG[cardSize] || TWO_TIER_CARD_SIZE_CONFIG["2x"];

  // Tự động khôi phục vị trí chuẩn khi chọn Chi mới để khảo sát
  useEffect(() => {
    setCustomZoneMap({});
  }, [selectedBranch]);

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
    const allPresentChis = [...chartPillars.map((p) => p.chi), selectedBranch];

    // 1) Chi mới kết hợp với từng chi kéo xuống
    pulledBranches.forEach((b) => {
      ALL_CUNG_RULES.forEach((rule) => {
        // NGUYÊN TẮC: Nếu nguyên cục hoặc Chi mới đã có sẵn chữ củng này rồi thì không còn kẹp củng ra nữa!
        if (allPresentChis.includes(rule.cungChi)) return;

        const match =
          (selectedBranch === rule.b1 && b.chi === rule.b2) ||
          (selectedBranch === rule.b2 && b.chi === rule.b1);
        if (match) {
          const key = `${rule.cungChi}-${selectedBranch}-${b.chi}`;
          if (!seen.has(key)) {
            seen.add(key);
            results.push({
              cungChi: rule.cungChi,
              groupName: rule.groupName,
              desc: `Do [${selectedBranch}] mới và [${b.chi}] (${b.label}) củng xuất chữ (${rule.cungChi})`,
            });
          }
        }
      });
    });

    // 2) Ngoại lệ các chi kéo xuống kết hợp với nhau do Hóa Cục hợp khí:
    // Các chi bình thường bị kéo xuống do cùng hợp với Chi mới (như Mão Thân âm hợp, Mão Tuất lục hợp) thì tham hợp với Chi mới nên KHÔNG củng với nhau được (Thân Tuất không củng Dậu).
    // Chỉ các trường hợp Hợp Cục Hóa Khí sau mới củng khí ở tầng dưới:

    // a) Mộc cục (Dần Mão Thìn) hợp Mộc hóa Hỏa kéo Ngọ xuống: Ngọ và Dần củng Tuất (nếu Chi mới không phải Hợi)
    const hasDanMaoThin =
      allPresentChis.includes("Dần") &&
      allPresentChis.includes("Mão") &&
      allPresentChis.includes("Thìn");
    const hasDanAndNgoInBottom =
      pulledBranches.some((b) => b.chi === "Dần") &&
      pulledBranches.some((b) => b.chi === "Ngọ");

    if (hasDanMaoThin && selectedBranch !== "Hợi" && hasDanAndNgoInBottom && !allPresentChis.includes("Tuất")) {
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
  }, [selectedBranch, displayedBottomLeft, displayedBottomRight, displayedMiddleSame, chartPillars]);

  const getPillarCardInfo = (p: (typeof chartPillars)[0], zone: TwoTierZone) => {
    const tamAn = getTamAnPhuInfoForChi(p.chi);
    const tamAnPhu = tamAn
      ? {
          tuongName: tamAn.tuongName,
          tuongChinese: tamAn.tuongChinese,
          fullLine: tamAn.fullLine,
        }
      : undefined;

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
        badgeText: "🏛️ CỦNG NGUYÊN CỤC",
        subNote: `Củng sẵn: (${matchCung.cungChi})`,
        tamAnPhu,
      };
    }
    const bHop = bottomBranches.find((b) => b.pillar.key === p.key);
    if (bHop && (zone === "bottom_left" || zone === "bottom_right" || zone === "bottom_hop")) {
      const gInfo = pulledFullGroupInfoMap.get(p.key);
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
    if (fullGroupBranchNames.has(p.chi)) {
      return {
        badgeType: "toancuc" as const,
        badgeText: "✨ TOÀN CỤC",
        subNote: "Tam Hợp / Tam Hội đầy đủ",
        tamAnPhu,
      };
    }
    if (zone === "middle_same" || sameBranches.some((s) => s.key === p.key) || p.chi === selectedBranch) {
      return {
        badgeType: "same" as const,
        badgeText: "Chữ Trùng (Chung Ô)",
        subNote: `Trùng với Chi Mới ${selectedBranch}`,
        tamAnPhu,
      };
    }
    return {
      badgeType: "doclap" as const,
      badgeText: "Độc Lập",
      subNote: p.pillar,
      tamAnPhu,
    };
  };

  // 4. PHÂN TÍCH BIẾN ĐỘNG CỦNG: CÒN GÌ - MẤT GÌ - MỚI THÊM GÌ (Phản ánh vị trí kéo thả thực tế)
  const { initialCungList, intactCungList, lostCungList, newCungList } = useMemo(() => {
    const allPresentChis = [...chartPillars.map((p) => p.chi), selectedBranch];

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

    // Lấy tập hợp các Chi đang thực tế ở Tầng Dưới
    const bottomBranchKeys = new Set(displayedBottom.map((b) => b.key));

    initialCungs.forEach((c) => {
      const p1InBottom = bottomBranchKeys.has(c.p1.key);
      const p2InBottom = bottomBranchKeys.has(c.p2.key);

      // 1. KIỂM TRA ĐỊA CHI MỚI XUNG, HÌNH, HẠI VỚI ĐỊA CHI NGUYÊN CỤC:
      // "các địa chi mới khi xung, hình, hại 1 địa chi nào đó ở nguyên cục, cũng sẽ phá vỡ luôn củng cục"
      const opp1 = checkOpposeRelation(c.p1.chi, selectedBranch);
      const opp2 = checkOpposeRelation(c.p2.chi, selectedBranch);
      const isP1Opposed = opp1.type === "Xung" || opp1.type === "Hại" || opp1.type === "Hình";
      const isP2Opposed = opp2.type === "Xung" || opp2.type === "Hại" || opp2.type === "Hình";

      if (isP1Opposed || isP2Opposed) {
        let reason = "";
        if (isP1Opposed && isP2Opposed) {
          reason = `Phá cục củng [${c.rule.cungChi}] do cả ${c.p1.label} (${c.p1.chi}) [${opp1.type}] và ${c.p2.label} (${c.p2.chi}) [${opp2.type}] đều bị xung/hình/hại bởi Địa Chi mới [${selectedBranch}].`;
        } else if (isP1Opposed) {
          reason = `Phá cục củng [${c.rule.cungChi}] do ${c.p1.label} (${c.p1.chi}) bị ${opp1.type} (${opp1.label}) bởi Địa Chi mới [${selectedBranch}].`;
        } else {
          reason = `Phá cục củng [${c.rule.cungChi}] do ${c.p2.label} (${c.p2.chi}) bị ${opp2.type} (${opp2.label}) bởi Địa Chi mới [${selectedBranch}].`;
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
      // Lưu ý: Nếu Chi mới là Hợi (vận Dậu lưu niên Hợi): Hợi tới âm hợp Ngọ, Hợi Dần lục hợp -> Dần Ngọ không củng được Tuất, mất luôn củng Mão, Sửu, Mùi.
      const hasDanMaoThin =
        allPresentChis.includes("Dần") &&
        allPresentChis.includes("Mão") &&
        allPresentChis.includes("Thìn");
      const isDanNgoCungTuat =
        hasDanMaoThin &&
        selectedBranch !== "Hợi" &&
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
      // - Nếu cả 2 chữ đều bị kéo xuống tầng dưới: Do đã bị Địa Chi mới hợp cuốn đi (tham hợp), nên không thể củng cục nguyên cục được nữa.
      //   (Ví dụ: Địa chi mới Hợi tới âm hợp Ngọ, Hợi Dần lục hợp -> Dần Ngọ đều xuống tầng dưới -> không củng được Tuất).
      // - Nếu 1 chữ bị kéo xuống, 1 chữ ở trên: Bị phân tầng chia cắt -> Phá củng.
      if (p1InBottom && p2InBottom) {
        lost.push({
          cungChi: c.rule.cungChi,
          groupName: c.rule.groupName,
          p1: c.p1,
          p2: c.p2,
          reason: `Phá cục củng [${c.rule.cungChi}] do cả ${c.p1.label} (${c.p1.chi}) và ${c.p2.label} (${c.p2.chi}) đều bị hợp kéo xuống tầng dưới cùng [${selectedBranch}], tham hợp với Chi mới nên không củng được [${c.rule.cungChi}].`,
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
          reason: `Phá cục củng [${c.rule.cungChi}] do ${movedBranch.label} (${movedBranch.chi}) ở tầng dưới cùng ${selectedBranch}, tách rời ${stayBranch.label} (${stayBranch.chi}) ở tầng trên.`,
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

    // Tìm CỦNG MỚI THÊM VÀO (ở tầng dưới):
    interface NewCung {
      cungChi: string;
      groupName: string;
      withBranch: string;
      desc: string;
    }
    const newlyAdded: NewCung[] = [];
    const seenNew = new Set<string>();

    displayedBottom.forEach((b) => {
      const bChi = b.chi;

      ALL_CUNG_RULES.forEach((rule) => {
        // NGUYÊN TẮC: Nếu nguyên cục hoặc Chi mới đã có sẵn chữ củng này rồi thì không củng ra nữa!
        if (chartPillars.some((p) => p.chi === rule.cungChi)) return;
        if (selectedBranch === rule.cungChi) return;

        const match =
          (selectedBranch === rule.b1 && bChi === rule.b2) ||
          (selectedBranch === rule.b2 && bChi === rule.b1);

        if (match) {
          const key = `${rule.cungChi}-${b.key}`;
          if (!seenNew.has(key)) {
            seenNew.add(key);
            newlyAdded.push({
              cungChi: rule.cungChi,
              groupName: rule.groupName,
              withBranch: `${b.label} (${bChi})`,
              desc: `Do [${selectedBranch}] mới và [${bChi}] kết hợp ở tầng dưới củng xuất chữ [${rule.cungChi}] (${rule.groupName}).`,
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
  }, [chartPillars, displayedBottom, selectedBranch, retainedInTopFullGroupPillarKeys, hasTyOrHoi]);

  // Kiểm tra củng cục nguyên cục có bị mất hay không
  const isCungLost = (item: { p1: { key: string }; p2: { key: string }; cungChi: string }) => {
    return lostCungList.some(
      (l) =>
        l.cungChi === item.cungChi &&
        ((l.p1.key === item.p1.key && l.p2.key === item.p2.key) ||
          (l.p1.key === item.p2.key && l.p2.key === item.p1.key))
    );
  };

  const targetChiData = getChiData(selectedBranch) || CHI_MAP.get(selectedBranch);

  const getRatingBadgeStyle = (rating: BranchRating | null | undefined, isButton = false) => {
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
      className={`p-3 sm:p-5 rounded-2xl bg-gradient-to-b from-[#1C140B] via-[#161009] to-[#120D08] border border-[#523B25] shadow-xl ${className}`}
    >
      {/* Header Hành Vi Thiên */}
      <div className="flex flex-row items-center justify-between gap-2 pb-2.5 sm:pb-3 border-b border-[#3B291A]">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 text-[#F5EAD4] flex items-center justify-center shadow-md shrink-0">
            <Compass className="w-4 h-4 text-amber-200" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-base font-bold text-[#F5EAD4] font-serif tracking-wide truncate">
              HÀNH VI THIÊN (行為篇)
            </h3>
            <p className="text-[10px] sm:text-xs text-[#A89882] mt-0.5 line-clamp-1">
              Phân tích 12 Địa Chi so với nguyên cục, chia 2 tầng Trên - Dưới, đối diện Xung Hại Hình & các Chi liên quan kế bên.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {onSaveToBazi && (
            <button
              type="button"
              onClick={() =>
                onSaveToBazi({
                  selectedBranch,
                  branchRatings,
                  isOpen,
                  showEmoji: showTableEmoji,
                })
              }
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] sm:text-xs font-bold rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:from-[#F3CE65] hover:to-[#C69214] text-[#1A1208] shadow-sm shadow-[#D4AF37]/20 transition-all cursor-pointer active:scale-95 whitespace-nowrap"
              title="Lưu thiết lập Hành Vi Thiên vào lá số Bát Tự"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Lưu Vào Bát Tự</span>
            </button>
          )}

          {onCapture && (
            <button
              type="button"
              onClick={onCapture}
              className="no-capture flex items-center gap-1 px-2.5 py-1 text-[11px] sm:text-xs font-semibold rounded-lg bg-[#271E15] hover:bg-[#382B1E] text-amber-200 border border-[#523F27] hover:border-[#D4AF37] transition-all cursor-pointer shadow-sm active:scale-95 whitespace-nowrap"
              title="Chụp ảnh riêng Hành Vi Thiên"
            >
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span>Chụp Hành Vi</span>
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

      {isOpen && (
        <div className="mt-3 sm:mt-4 text-xs space-y-3.5">
          {/* =================================================================
              THANH CHỌN 12 ĐỊA CHI KHẢO SÁT (MỞ ĐẦU LÀ TÝ)
              ================================================================= */}
          <div className="p-2 sm:p-2.5 rounded-xl bg-[#171109] border border-[#3A2817] space-y-1.5">
            <div className="flex items-center justify-between text-[10px] sm:text-[10.5px]">
              <span className="font-bold text-[#E2B755] flex items-center gap-1.5 uppercase tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Chọn Địa Chi khảo sát (Mở đầu là Tý):</span>
              </span>
              <span className="text-[#8C7D6B] font-mono text-[9px]">
                Đang khảo sát: <strong className="text-amber-300 font-serif text-xs">{showTableEmoji && targetChiData?.emoji ? `${targetChiData.emoji} ` : ""}{selectedBranch}</strong> ({targetChiData?.chinese})
              </span>
            </div>

            {/* Thanh 12 Địa Chi */}
            <div className="grid grid-cols-6 sm:grid-cols-12 gap-1 sm:gap-1.5 pt-0.5">
              {TWELVE_BRANCHES.map((bName) => {
                const cData = getChiData(bName) || CHI_MAP.get(bName);
                const isCurrent = selectedBranch === bName;
                const currentRating = branchRatings[bName];

                return (
                  <button
                    key={bName}
                    type="button"
                    onClick={() => setSelectedBranch(bName)}
                    className={`py-1.5 sm:py-2 px-1 sm:px-1.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between min-h-[72px] sm:min-h-[84px] ${
                      isCurrent
                        ? "bg-gradient-to-b from-[#3E2914] to-[#25170B] border-amber-400 text-amber-200 font-bold shadow-md shadow-amber-500/25 ring-2 ring-amber-400/70 scale-[1.03]"
                        : "bg-[#1E150D] hover:bg-[#281C12] border-[#44301D] text-[#A89882]"
                    }`}
                  >
                    {showTableEmoji && (
                      <span className="text-base sm:text-xl leading-none my-0.5">{cData?.emoji}</span>
                    )}
                    <span
                      className={`text-sm sm:text-base font-serif font-bold leading-tight mt-0.5 ${
                        isCurrent ? "text-amber-200" : "text-[#F5EAD4]"
                      }`}
                    >
                      {bName}
                    </span>
                    <span className="text-[10px] sm:text-xs text-[#A89882] font-serif leading-none mt-0.5">
                      {cData?.chinese}
                    </span>
                    {currentRating && (
                      <span
                        className={`text-[8.5px] sm:text-[9.5px] px-1.5 py-0.5 rounded font-bold border mt-1 leading-none shadow-xs ${getRatingBadgeStyle(
                          currentRating
                        )}`}
                      >
                        {currentRating}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* MỤC CHỌN CHỮ GỒM: HỶ, TRUNG CÁT, TRUNG, TRUNG KỴ, KỴ */}
            <div className="pt-2.5 border-t border-[#2C1D10] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <span className="font-bold text-[#E2B755] flex items-center gap-1.5">
                  <span>Mục chọn chữ cho Địa Chi <strong className="text-amber-300 font-serif text-sm sm:text-base">{showTableEmoji && targetChiData?.emoji ? `${targetChiData.emoji} ` : ""}{selectedBranch}</strong>:</span>
                </span>
                {branchRatings[selectedBranch] && (
                  <span
                    className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-md font-bold border ${getRatingBadgeStyle(
                      branchRatings[selectedBranch]
                    )}`}
                  >
                    {branchRatings[selectedBranch]}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                {RATING_OPTIONS.map((opt) => {
                  const isSelected = branchRatings[selectedBranch] === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() =>
                        setBranchRatings((prev) => ({
                          ...prev,
                          [selectedBranch]: isSelected ? null : opt,
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
                {branchRatings[selectedBranch] && (
                  <button
                    type="button"
                    onClick={() =>
                      setBranchRatings((prev) => ({
                        ...prev,
                        [selectedBranch]: null,
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

          {/* CẢNH BÁO TAM HỢP / TAM HỘI TOÀN CỤC NGUYÊN CỤC NẾU CÓ */}
          {(fullTamHopList.length > 0 || fullTamHoiList.length > 0) && (
            <div className="p-2 sm:p-2.5 rounded-lg bg-[#2A1E0E] border border-amber-500/60 flex items-center justify-between text-[10px] text-amber-200">
              <div className="flex items-center gap-1.5">
                <Gem className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Nguyên cục có <strong>{[...fullTamHopList, ...fullTamHoiList].map((g) => `${g.name} (${g.branches.join("-")})`).join(", ")}</strong> đầy đủ.
                  Theo quy tắc: <strong>Ở trên vẫn giữ nguyên toàn bộ cục</strong>, đồng thời <strong>ở dưới vẫn kéo các chữ hợp theo</strong>!
                </span>
              </div>
            </div>
          )}

          {/* =================================================================
              BỐ CỤC 2 TẦNG VỚI TRỤC TRUNG TÂM Ở GIỮA BẢNG CHIA (HỖ TRỢ KÉO THẢ TÙY BIẾN):
              1. TẦNG TRÊN (Thượng tầng):
                 - Hàng độc lập (các chi không liên quan đứng ở trên)
                 - Hàng đối diện:
                   + Chữ có Hình, Xung, Hại đối diện trực tiếp với Chi mới
                   + Chữ liên quan (Âm hợp, Lục hợp, Hợp cục) với chữ đối diện đứng KẾ BÊN TRÁI HOẶC PHẢI
              2. Ở GIỮA BẢNG CHIA (Trục phân chia trung tâm):
                 - Chữ Địa Chi Mới Khảo Sát
                 - Đặt ở dưới chữ mới là chữ trùng của nguyên cục kéo xuống (kích thước to chuẩn)
              3. TẦNG DƯỚI (Hạ tầng: Các chữ nguyên cục có quan hệ Hợp kéo xuống theo)
              ================================================================= */}
          <div className="p-2.5 sm:p-3.5 rounded-xl bg-gradient-to-b from-[#181109] via-[#140E07] to-[#100B05] border border-[#3A2817] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-1.5 border-b border-[#2C1D10] gap-1.5">
              <span className="font-bold text-[#E2B755] flex items-center gap-1.5 text-[10.5px] sm:text-[11px] uppercase tracking-wider">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Bố Cục Hai Tầng: Thượng Tầng (Trên) ⟷ Trục Giữa ⟷ Hạ Tầng (Dưới)</span>
              </span>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap ml-auto sm:ml-0">
                {/* Nút bật/tắt hiển thị Icon Thú đồng bộ cho toàn bộ các ô chữ */}
                <button
                  type="button"
                  onClick={() => setShowTableEmoji(!showTableEmoji)}
                  className={`px-2 py-0.5 text-[9.5px] font-bold rounded-lg border transition-all cursor-pointer ${
                    showTableEmoji
                      ? "bg-amber-950/90 text-amber-300 border-amber-600/70 shadow-sm"
                      : "bg-[#271C11] text-[#A89882] border-[#4D3620] hover:bg-[#382717] hover:text-amber-200"
                  }`}
                  title={
                    showTableEmoji
                      ? "Bấm để chuyển sang chế độ chỉ hiện thông tin chữ (không hiện icon thú)"
                      : "Bấm để hiện thêm icon thú con giáp cho tất cả các ô chữ"
                  }
                >
                  {showTableEmoji ? "🐾 Hiện Icon Thú" : "🔤 Chỉ Hiện Chữ"}
                </button>

                {/* Chế độ đóng / mở hiện tên gọi Tâm Ấn Phú trong bố cục 2 tầng */}
                <button
                  type="button"
                  onClick={() => setShowTwoTierTamAnPhu(!showTwoTierTamAnPhu)}
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

                {/* Bộ Chọn Kích Cỡ Ô Hình Bố Cục Hai Tầng (1x, 1.4x, 1.7x, 2x) */}
                <BaziTwoTierSizeSelector currentSize={cardSize} onChangeSize={handleCardSizeChange} />

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
                    Nắm giữ thẻ Địa Chi để kéo di chuyển giữa các vùng (Hàng Độc Lập, Cánh Tả, Đối Diện, Cánh Hữu, Trục Giữa, Hạ Tầng) hoặc bấm nút ✥ để chuyển nhanh.
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
                {/* ---------------- 0. CHI CỦNG Ở TẦNG TRÊN (ĐƯỢC ĐƯA LÊN TRÊN CÙNG) ---------------- */}
                {cungOriginSummary.length > 0 && (
                  <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-b from-[#261331] via-[#1B0D23] to-[#120818] border-2 border-purple-500/80 shadow-lg space-y-1.5">
                    <div className="flex items-center justify-between text-[9.5px] sm:text-[10px]">
                      <span className="font-bold text-purple-300 flex items-center gap-1.5 uppercase tracking-wider font-mono">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                        <span>Chi Củng Ở Tầng Trên (Đưa Lên Trên Cùng)</span>
                      </span>
                      <span className="text-[8.5px] px-2 py-0.2 rounded-full bg-purple-950/90 text-purple-200 border border-purple-500/70 font-mono">
                        Hư Thần Củng Khí Nguyên Cục
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-1.5 pt-0.5">
                      {cungOriginSummary.map((s, idx) => {
                        const cData = getChiData(s.cungChi) || CHI_MAP.get(s.cungChi);
                        const isLost = isCungLost(s);
                        const lostInfo = lostCungList.find(
                          (l) =>
                            l.cungChi === s.cungChi &&
                            ((l.p1.key === s.p1.key && l.p2.key === s.p2.key) ||
                              (l.p1.key === s.p2.key && l.p2.key === s.p1.key))
                        );
                        return (
                          <div
                            key={`top-cung-result-${idx}`}
                            className={`relative shrink-0 border-2 text-center flex flex-col items-center justify-center select-none transition-all ${sizeCfg.cardClasses} ${
                              isLost
                                ? "bg-[#250F14] border-rose-500/90 shadow-sm shadow-rose-950/60 ring-1 ring-rose-500/50"
                                : "bg-gradient-to-b from-[#381647] via-[#260E32] to-[#17081E] border-2 border-purple-400/90 shadow-md shadow-purple-900/40 ring-1 ring-purple-500/50 hover:scale-[1.05]"
                            }`}
                            title={
                              isLost
                                ? `[BỊ PHÁ VỠ] ${lostInfo?.reason || `Củng chữ (${s.cungChi}) từ cặp [${s.p1.chi}]-[${s.p2.chi}] bị phá vỡ!`}`
                                : `Củng xuất chữ (${s.cungChi}) từ cặp [${s.p1.chi}] (${s.p1.label}) và [${s.p2.chi}] (${s.p2.label})`
                            }
                          >
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
                                {cData?.emoji}
                              </span>
                            )}
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
                            {showTwoTierTamAnPhu && (() => {
                              const cungTamAn = getTamAnPhuInfoForChi(s.cungChi);
                              return cungTamAn?.tuongName ? (
                                <span
                                  className={`font-serif font-bold text-[#FFE28A] bg-[#291A0E]/95 px-1 py-0.2 rounded border border-amber-600/60 truncate max-w-full leading-tight shadow-xs ${sizeCfg.tamAnClasses} select-none my-0.5`}
                                  title={cungTamAn.fullLine ? `Tâm Ấn Phú: ${cungTamAn.fullLine}` : `Tâm Ấn: 《${cungTamAn.tuongName}》`}
                                >
                                  《{cungTamAn.tuongName}》
                                </span>
                              ) : null;
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
                          return (
                            <BaziTwoTierCard
                              key={`left-${p.key}`}
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
                            />
                          );
                        })}
                      </div>
                    </BaziTwoTierDropZone>
                  </div>

                  {/* CỘT GIỮA: ĐỐI DIỆN TRỰC DIỆN ĐỊA CHI MỚI (CHỨA ĐỊA CHI CÓ XUNG • HÌNH • HẠI) */}
                  <div className="space-y-1 sm:space-y-1.5 flex flex-col items-center">
                    <div className="w-full flex items-center justify-between pb-0.5 border-b border-[#4D3620] text-center">
                      <span className="text-[8px] sm:text-[9.5px] font-bold text-rose-300 flex items-center gap-0.5 sm:gap-1 truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
                        <span className="truncate">Đối Diện Chi Mới</span>
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
                      emptyDesc="Xung • Hình • Hại với Chi mới"
                      className="w-full"
                    >
                      <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 p-0.5 sm:p-1">
                        {displayedTopOppose.map((p) => {
                          const info = getPillarCardInfo(p, "top_oppose");
                          return (
                            <BaziTwoTierCard
                              key={`opp-${p.key}`}
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
                          return (
                            <BaziTwoTierCard
                              key={`hanhvi-right-${p.key}`}
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
                            />
                          );
                        })}
                      </div>
                    </BaziTwoTierDropZone>
                  </div>
                </div>

                {/* ---------------- 2. KHỐI ĐỊA CHI MỚI & CÁC CHI KÉO XUỐNG TRÁI / PHẢI ---------------- */}
                <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-b from-[#25180D] via-[#1E1209] to-[#180E07] border-2 border-[#7D5A2F] shadow-xl space-y-3.5">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-[1.5px] flex-1 bg-gradient-to-r from-transparent via-[#C6923C] to-transparent" />
                    <span className="text-[10.5px] sm:text-[11px] font-bold text-[#E2B755] uppercase tracking-wider flex items-center gap-1.5">
                      <ArrowUpDown className="w-4 h-4 text-amber-400" />
                      <span>Trục Phân Tầng: Địa Chi Mới ⟷ Chi Bị Kéo Xuống Ở Trái & Phải</span>
                    </span>
                    <div className="h-[1.5px] flex-1 bg-gradient-to-r from-transparent via-[#C6923C] to-transparent" />
                  </div>

                  {/* HÀNG 3 CỘT ĐỐI XỨNG: [BÊN TRÁI (CÁNH TẢ)] [Ở GIỮA (ĐỊA CHI MỚI)] [BÊN PHẢI (CÁNH HỮU)] */}
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
                                  return (
                                    <BaziTwoTierCard
                                      key={`hanhvi-cluster-${zone}-${p.key}`}
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
                                return (
                                  <BaziTwoTierCard
                                    key={`hanhvi-${zone}-${p.key}`}
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

                        {/* CỘT GIỮA: ĐỊA CHI MỚI & CHI TRÙNG NẰM CHUNG 1 Ô (ĐÃ BỎ Ô ĐẶT DƯỚI) */}
                        <div className="space-y-1 sm:space-y-1.5 flex flex-col items-center">
                          <div className="w-full flex items-center justify-center pb-0.5 border-b border-[#4D3620] text-center">
                            <span className="text-[8px] sm:text-[9.5px] font-bold text-amber-300 truncate flex items-center justify-center gap-1 w-full">
                              <span>Địa Chi Mới {showTableEmoji && targetChiData?.emoji ? `${targetChiData.emoji} ` : ""}{selectedBranch}</span>
                              {displayedMiddleSame.length > 0 && (
                                <span className="text-[7.5px] px-1 py-0.2 rounded bg-amber-900/80 text-amber-200 border border-amber-600/60 font-mono">
                                  Trùng {displayedMiddleSame.length} Chi
                                </span>
                              )}
                            </span>
                          </div>

                          {/* DROP ZONE CHUNG 1 Ô CHO CẢ CHI MỚI VÀ CHI TRÙNG NGUYÊN CỤC */}
                          <BaziTwoTierDropZone
                            zoneKey="middle_same"
                            activeDropZone={activeDropZone}
                            onDropToZone={handleMoveToZone}
                            onDragOverZone={setActiveDropZone}
                            onDragLeaveZone={() => setActiveDropZone(null)}
                            itemCount={1 + displayedMiddleSame.length}
                            emptyLabel={`Chung ô ${selectedBranch}`}
                            className="w-full"
                          >
                            <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 p-1 rounded-xl bg-gradient-to-b from-[#221509] to-[#170E06] border border-[#5A3F22] shadow-inner min-h-[52px]">
                              {/* THẺ ĐỊA CHI MỚI */}
                              <div
                                className={`shrink-0 bg-gradient-to-b from-[#3E2914] via-[#2A1B0C] to-[#1C1208] border-2 border-[#D4AF37] text-center flex flex-col items-center justify-center shadow-md shadow-amber-600/30 ring-1 ring-amber-400/50 select-none relative ${sizeCfg.cardClasses}`}
                                title={
                                  branchRatings[selectedBranch]
                                    ? `Địa Chi Mới: ${selectedBranch} (${branchRatings[selectedBranch]})`
                                    : `Địa Chi Mới: ${selectedBranch}`
                                }
                              >
                                <span className={`text-amber-300 font-bold uppercase tracking-tighter leading-none mb-0.5 ${sizeCfg.badgeClasses}`}>
                                  Chi Mới
                                </span>
                                {branchRatings[selectedBranch] && (
                                  <span
                                    className={`absolute -top-1 -right-1 px-1 py-0.2 rounded font-bold border ${getRatingBadgeStyle(
                                      branchRatings[selectedBranch]
                                    )} ${sizeCfg.badgeClasses}`}
                                  >
                                    {branchRatings[selectedBranch]}
                                  </span>
                                )}
                                {showTableEmoji && (
                                  <span className={`${sizeCfg.emojiClasses} select-none`}>
                                    {targetChiData?.emoji}
                                  </span>
                                )}
                                <span
                                  className={`font-serif font-bold text-amber-200 leading-none select-none ${
                                    showTableEmoji
                                      ? sizeCfg.chiClasses
                                      : `${sizeCfg.chiClasses} py-1 my-0.5 text-base sm:text-lg`
                                  }`}
                                >
                                  {selectedBranch}
                                </span>
                                {showTwoTierTamAnPhu && (() => {
                                  const bTamAn = getTamAnPhuInfoForChi(selectedBranch);
                                  return bTamAn?.tuongName ? (
                                    <span
                                      className={`font-serif font-bold text-[#FFE28A] bg-[#291A0E]/95 px-1 py-0.2 rounded border border-amber-600/60 truncate max-w-full leading-tight shadow-xs ${sizeCfg.tamAnClasses} select-none my-0.5`}
                                      title={bTamAn.fullLine ? `Tâm Ấn Phú: ${bTamAn.fullLine}` : `Tâm Ấn: 《${bTamAn.tuongName}》`}
                                    >
                                      《{bTamAn.tuongName}》
                                    </span>
                                  ) : null;
                                })()}
                              </div>

                              {/* CÁC CHI TRÙNG TỪ NGUYÊN CỤC NẰM CHUNG Ô VỚI CHI MỚI */}
                              {displayedMiddleSame.map((p) => {
                                const info = getPillarCardInfo(p, "middle_same");
                                return (
                                  <BaziTwoTierCard
                                    key={`hanhvi-mid-${p.key}`}
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
                            <span className="text-[7.5px] sm:text-[8px] text-[#8C7D6B] font-mono shrink-0">{displayedBottomRight.length}</span>
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
                          const cData = getChiData(cung.cungChi) || CHI_MAP.get(cung.cungChi);
                          return (
                            <div
                              key={`cung-result-${idx}`}
                              className={`shrink-0 bg-gradient-to-b from-[#381647] via-[#260E32] to-[#17081E] border-2 border-purple-400/90 shadow-md shadow-purple-900/40 ring-1 ring-purple-500/50 text-center flex flex-col items-center justify-center select-none transition-all hover:scale-[1.05] ${sizeCfg.cardClasses}`}
                              title={cung.desc}
                            >
                              {showTableEmoji && (
                                <span className={`${sizeCfg.emojiClasses} select-none`}>
                                  {cData?.emoji}
                                </span>
                              )}
                              <span
                                className={`font-serif font-bold text-purple-100 leading-none select-none ${
                                  showTableEmoji
                                    ? sizeCfg.chiClasses
                                    : `${sizeCfg.chiClasses} py-1 my-0.5 text-base sm:text-lg`
                                }`}
                              >
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
              </>
            )}
          </div>

          {/* =================================================================
              KHU VỰC LUẬN CỦNG: CÒN GÌ - MẤT GÌ - MỚI THÊM GÌ (3 CỘT ĐỐI CHIẾU)
              (Thu gọn cùng lúc khi thu gọn bố cục hai tầng)
              ================================================================= */}
          {isTwoTierOpen && (
            <div className="p-2.5 sm:p-3.5 rounded-xl bg-[#171109] border border-[#3A2817] space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1.5 border-b border-[#2C1D10]">
              <span className="font-bold text-[#E2B755] flex items-center gap-1.5 text-[10.5px] sm:text-[11px] uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Biến Động Củng Khí: Còn Gì ⟷ Mất Gì ⟷ Mới Thêm Gì</span>
              </span>
              <span className="text-[9px] text-[#8C7D6B] font-mono">
                Nguyên cục: {initialCungList.length} Củng (
                <span className="text-amber-300 font-bold">{intactCungList.length} Còn</span> •{" "}
                <span className="text-rose-400 font-bold">{lostCungList.length} Mất</span>) •{" "}
                <span className="text-emerald-400 font-bold">+{newCungList.length} Mới</span>
              </span>
            </div>

            <div className="text-[10px] text-[#A89882] leading-relaxed">
              • <strong className="text-amber-300">Còn Gì</strong>: Các cặp củng trong nguyên cục mà 2 chi không bị chia cắt phân tầng, vẫn giữ nguyên thế củng ban đầu.
              <br />
              • <strong className="text-rose-400">Mất Gì</strong>: Khi một chi trong cặp củng nguyên cục bị hợp kéo xuống tầng dưới cùng <strong className="text-amber-300">{selectedBranch}</strong>, thế kẹp củng ban đầu bị phá vỡ.
              <br />
              • <strong className="text-emerald-400">Mới Thêm Gì</strong>: Tại tầng dưới, <strong className="text-amber-300">{selectedBranch} mới</strong> kết hợp với các Chi hợp kéo xuống tạo thành tổ hợp Tam Hợp / Tam Hội cục mới sinh ra củng.
            </div>

            {/* 3 CỘT GHI CHÚ KẾ BÊN: CÒN GÌ - MẤT GÌ - MỚI THÊM GÌ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {/* CỘT 1: CỦNG NGUYÊN CỤC CÒN GÌ (BẢO TOÀN) */}
              <div className="p-2 rounded-lg bg-gradient-to-b from-[#241C10] to-[#17120A] border border-amber-600/70 space-y-1.5 shadow-sm">
                <div className="flex items-center justify-between text-[10.5px]">
                  <span className="font-bold text-amber-300 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Củng Nguyên Cục Còn Lại:</span>
                  </span>
                  <span className="text-[8.5px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-200 border border-amber-700/60 font-semibold font-mono">
                    {intactCungList.length} Cục
                  </span>
                </div>

                {intactCungList.length > 0 ? (
                  <div className="space-y-1.5">
                    {intactCungList.map((item, idx) => (
                      <div
                        key={`intact-${idx}`}
                        className="p-1.5 rounded bg-[#2E2214] border border-amber-700/60 flex flex-col gap-0.5 text-[9.5px]"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-200">
                            🛡️ Còn củng: <strong className="text-amber-300 font-serif text-xs">{showTableEmoji && (getChiData(item.cungChi)?.emoji || CHI_MAP.get(item.cungChi)?.emoji) ? `${getChiData(item.cungChi)?.emoji || CHI_MAP.get(item.cungChi)?.emoji} ` : ""}[{item.cungChi}]</strong>
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
                      ? "Nguyên cục ban đầu không có cặp củng kẹp."
                      : "Tất cả các cục củng nguyên cục đều đã bị phân tách."}
                  </div>
                )}
              </div>

              {/* CỘT 2: CỦNG NGUYÊN CỤC MẤT GÌ (PHÁ CỤC CỦNG) */}
              <div className="p-2 rounded-lg bg-gradient-to-b from-[#241211] to-[#180C0B] border border-rose-800/70 space-y-1.5 shadow-sm">
                <div className="flex items-center justify-between text-[10.5px]">
                  <span className="font-bold text-rose-300 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Củng Nguyên Cục Mất Đi:</span>
                  </span>
                  <span className="text-[8.5px] px-1.5 py-0.2 rounded bg-rose-950 text-rose-200 border border-rose-700/60 font-semibold font-mono">
                    {lostCungList.length} Cục
                  </span>
                </div>

                {lostCungList.length > 0 ? (
                  <div className="space-y-1.5">
                    {lostCungList.map((item, idx) => (
                      <div
                        key={`lost-${idx}`}
                        className="p-1.5 rounded bg-[#2D1412] border border-rose-700/60 flex flex-col gap-0.5 text-[9.5px]"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-rose-200">
                            🔴 Mất củng: <strong className="text-rose-300 font-serif text-xs">{showTableEmoji && (getChiData(item.cungChi)?.emoji || CHI_MAP.get(item.cungChi)?.emoji) ? `${getChiData(item.cungChi)?.emoji || CHI_MAP.get(item.cungChi)?.emoji} ` : ""}[{item.cungChi}]</strong>
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
                    Không có cục củng nguyên cục nào bị phá vỡ khi xét {selectedBranch}.
                  </div>
                )}
              </div>

              {/* CỘT 3: CỦNG MỚI THÊM VÀO (TÂN CỦNG Ở TẦNG DƯỚI) */}
              <div className="p-2 rounded-lg bg-gradient-to-b from-[#112417] to-[#0A180F] border border-emerald-800/70 space-y-1.5 shadow-sm">
                <div className="flex items-center justify-between text-[10.5px]">
                  <span className="font-bold text-emerald-300 flex items-center gap-1">
                    <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Mới Thêm Vào Củng:</span>
                  </span>
                  <span className="text-[8.5px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-200 border border-emerald-700/60 font-semibold font-mono">
                    {newCungList.length} Cục
                  </span>
                </div>

                {newCungList.length > 0 ? (
                  <div className="space-y-1.5">
                    {newCungList.map((item, idx) => (
                      <div
                        key={`new-${idx}`}
                        className="p-1.5 rounded bg-[#132D1D] border border-emerald-700/60 flex flex-col gap-0.5 text-[9.5px]"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-200">
                            🟢 Mới củng: <strong className="text-emerald-300 font-serif text-xs">{showTableEmoji && (getChiData(item.cungChi)?.emoji || CHI_MAP.get(item.cungChi)?.emoji) ? `${getChiData(item.cungChi)?.emoji || CHI_MAP.get(item.cungChi)?.emoji} ` : ""}[{item.cungChi}]</strong>
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
                    Tại tầng dưới chưa hội đủ cặp để sinh thêm chữ củng mới.
                  </div>
                )}
              </div>
            </div>
          </div>
          )}
        </div>
      )}
    </div>
  );
};
