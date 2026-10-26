import React, { useState, useMemo, useEffect } from "react";
import {
  GitMerge,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  Swords,
  Activity,
  AlertTriangle,
  Save,
  Camera,
  Compass,
  Waves,
  Sparkles,
} from "lucide-react";
import { PillarItem, CHI_MAP, CAN_MAP } from "../data/baziConstants";

export type LucThanType = "Ấn" | "Tỷ" | "Thực" | "Tài" | "Quan";

export const LUC_THAN_CYCLE: LucThanType[] = ["Ấn", "Tỷ", "Thực", "Tài", "Quan"];

export interface KetCauVanSettings {
  activeTabB1?: "van_nguyen_cuc" | "tam_hop" | "tam_hoi";
  selectedRuleId?: string | null;
  dichList?: string[];
  ngaList?: string[];
  duocChiList?: string[];
  benhChiList?: string[];
  ngoaiTaChiList?: string[];
  nguyenLuuStart?: LucThanType;
  isOpen?: boolean;
}

export interface BaziKetCauVanThienProps {
  pillars?: [PillarItem, PillarItem, PillarItem, PillarItem]; // [0]: Giờ, [1]: Ngày, [2]: Tháng, [3]: Năm
  activeDaiVan?: {
    step?: number;
    can?: string;
    chi: string;
    fullName?: string;
    ageStart?: number;
    ageEnd?: number;
    yearStart?: number;
    yearEnd?: number;
  } | null;
  activeLuuNien?: {
    year: number;
    can: string;
    chi: string;
    fullName: string;
    age?: number;
  } | null;
  className?: string;
  savedSettings?: KetCauVanSettings;
  onSaveToBazi?: (settings: KetCauVanSettings) => void;
  onCapture?: () => void;
}

interface CungRuleItem {
  id: string;
  type: "tam_hop" | "tam_hoi";
  groupName: string;
  element: "Thủy" | "Hỏa" | "Kim" | "Mộc";
  branch1: string;
  branch2: string;
  cungChi: string | null; // null if exception
  isException?: boolean;
  exceptionNote?: string;
}

// Toàn bộ quy tắc củng Tam Hợp và Tam Hội theo chuẩn Bát Tự
const CUNG_RULES: CungRuleItem[] = [
  // TAM HỢP CỤC
  { id: "th-thuy-1", type: "tam_hop", groupName: "Tam Hợp Thủy (Thân Tý Thìn)", element: "Thủy", branch1: "Thân", branch2: "Tý", cungChi: "Thìn" },
  { id: "th-thuy-2", type: "tam_hop", groupName: "Tam Hợp Thủy (Thân Tý Thìn)", element: "Thủy", branch1: "Thân", branch2: "Thìn", cungChi: "Tý" },
  { id: "th-thuy-3", type: "tam_hop", groupName: "Tam Hợp Thủy (Thân Tý Thìn)", element: "Thủy", branch1: "Tý", branch2: "Thìn", cungChi: "Thân" },

  { id: "th-hoa-1", type: "tam_hop", groupName: "Tam Hợp Hỏa (Dần Ngọ Tuất)", element: "Hỏa", branch1: "Dần", branch2: "Ngọ", cungChi: "Tuất" },
  { id: "th-hoa-2", type: "tam_hop", groupName: "Tam Hợp Hỏa (Dần Ngọ Tuất)", element: "Hỏa", branch1: "Dần", branch2: "Tuất", cungChi: "Ngọ" },
  { id: "th-hoa-3", type: "tam_hop", groupName: "Tam Hợp Hỏa (Dần Ngọ Tuất)", element: "Hỏa", branch1: "Ngọ", branch2: "Tuất", cungChi: "Dần" },

  { id: "th-kim-1", type: "tam_hop", groupName: "Tam Hợp Kim (Tỵ Dậu Sửu)", element: "Kim", branch1: "Tỵ", branch2: "Dậu", cungChi: "Sửu" },
  { id: "th-kim-2", type: "tam_hop", groupName: "Tam Hợp Kim (Tỵ Dậu Sửu)", element: "Kim", branch1: "Tỵ", branch2: "Sửu", cungChi: "Dậu" },
  { id: "th-kim-3", type: "tam_hop", groupName: "Tam Hợp Kim (Tỵ Dậu Sửu)", element: "Kim", branch1: "Dậu", branch2: "Sửu", cungChi: "Tỵ" },

  { id: "th-moc-1", type: "tam_hop", groupName: "Tam Hợp Mộc (Hợi Mão Mùi)", element: "Mộc", branch1: "Hợi", branch2: "Mão", cungChi: "Mùi" },
  { id: "th-moc-2", type: "tam_hop", groupName: "Tam Hợp Mộc (Hợi Mão Mùi)", element: "Mộc", branch1: "Hợi", branch2: "Mùi", cungChi: "Mão" },
  { id: "th-moc-3", type: "tam_hop", groupName: "Tam Hợp Mộc (Hợi Mão Mùi)", element: "Mộc", branch1: "Mão", branch2: "Mùi", cungChi: "Hợi" },

  // TAM HỘI CỤC
  { id: "thoi-bac-1", type: "tam_hoi", groupName: "Tam Hội Bắc Phương (Hợi Tý Sửu)", element: "Thủy", branch1: "Tý", branch2: "Sửu", cungChi: "Hợi" },
  { id: "thoi-bac-2", type: "tam_hoi", groupName: "Tam Hội Bắc Phương (Hợi Tý Sửu)", element: "Thủy", branch1: "Sửu", branch2: "Hợi", cungChi: "Tý" },
  { id: "thoi-bac-3", type: "tam_hoi", groupName: "Tam Hội Bắc Phương (Hợi Tý Sửu)", element: "Thủy", branch1: "Tý", branch2: "Hợi", cungChi: "Sửu" },

  { id: "thoi-nam-1", type: "tam_hoi", groupName: "Tam Hội Nam Phương (Tỵ Ngọ Mùi)", element: "Hỏa", branch1: "Tỵ", branch2: "Ngọ", cungChi: "Mùi" },
  { id: "thoi-nam-2", type: "tam_hoi", groupName: "Tam Hội Nam Phương (Tỵ Ngọ Mùi)", element: "Hỏa", branch1: "Tỵ", branch2: "Mùi", cungChi: "Ngọ" },
  { id: "thoi-nam-3", type: "tam_hoi", groupName: "Tam Hội Nam Phương (Tỵ Ngọ Mùi)", element: "Hỏa", branch1: "Ngọ", branch2: "Mùi", cungChi: "Tỵ" },

  { id: "thoi-dong-1", type: "tam_hoi", groupName: "Tam Hội Đông Phương (Dần Mão Thìn)", element: "Mộc", branch1: "Dần", branch2: "Mão", cungChi: "Thìn" },
  { id: "thoi-dong-2", type: "tam_hoi", groupName: "Tam Hội Đông Phương (Dần Mão Thìn)", element: "Mộc", branch1: "Dần", branch2: "Thìn", cungChi: "Mão" },
  { id: "thoi-dong-3", type: "tam_hoi", groupName: "Tam Hội Đông Phương (Dần Mão Thìn)", element: "Mộc", branch1: "Thìn", branch2: "Mão", cungChi: null, isException: true, exceptionNote: "Thìn - Mão vẫn bán hợp nhưng KHÔNG củng Dần" },

  { id: "thoi-tay-1", type: "tam_hoi", groupName: "Tam Hội Tây Phương (Thân Dậu Tuất)", element: "Kim", branch1: "Thân", branch2: "Dậu", cungChi: "Tuất" },
  { id: "thoi-tay-2", type: "tam_hoi", groupName: "Tam Hội Tây Phương (Thân Dậu Tuất)", element: "Kim", branch1: "Thân", branch2: "Tuất", cungChi: "Dậu" },
  { id: "thoi-tay-3", type: "tam_hoi", groupName: "Tam Hội Tây Phương (Thân Dậu Tuất)", element: "Kim", branch1: "Tuất", branch2: "Dậu", cungChi: null, isException: true, exceptionNote: "Tuất - Dậu vẫn bán hợp nhưng KHÔNG củng Thân" },
];

export const BaziKetCauVanThien: React.FC<BaziKetCauVanThienProps> = ({
  pillars,
  activeDaiVan,
  className = "",
  savedSettings,
  onSaveToBazi,
  onCapture,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  // Tab của Bước 1
  const [activeTabB1, setActiveTabB1] = useState<"van_nguyen_cuc" | "tam_hop" | "tam_hoi">("van_nguyen_cuc");
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);

  // Bước 2: Quan hệ Địch - Ngã (Chọn nhiều hơn 1)
  const [dichList, setDichList] = useState<string[]>([]); // Bên ĐI hình hại
  const [ngaList, setNgaList] = useState<string[]>([]);   // Bên BỊ hình hại

  // Bước 3: Dược, Bệnh, Ngoại Tà
  const [duocChiList, setDuocChiList] = useState<string[]>([]);
  const [benhChiList, setBenhChiList] = useState<string[]>([]);
  const [ngoaiTaChiList, setNgoaiTaChiList] = useState<string[]>([]);

  // Bước 4: Nguyên Lưu (Ấn >>> Tỷ >>> Thực >>> Tài >>> Quan)
  const [nguyenLuuStart, setNguyenLuuStart] = useState<LucThanType>("Ấn");

  // Tự động nạp thiết lập đã lưu
  useEffect(() => {
    if (!savedSettings) return;
    if (savedSettings.activeTabB1 !== undefined) setActiveTabB1(savedSettings.activeTabB1);
    if (savedSettings.selectedRuleId !== undefined) setSelectedRuleId(savedSettings.selectedRuleId);
    if (savedSettings.dichList !== undefined) setDichList(savedSettings.dichList);
    if (savedSettings.ngaList !== undefined) setNgaList(savedSettings.ngaList);
    if (savedSettings.duocChiList !== undefined) setDuocChiList(savedSettings.duocChiList);
    if (savedSettings.benhChiList !== undefined) setBenhChiList(savedSettings.benhChiList);
    if (savedSettings.ngoaiTaChiList !== undefined) setNgoaiTaChiList(savedSettings.ngoaiTaChiList);
    if (savedSettings.nguyenLuuStart !== undefined) setNguyenLuuStart(savedSettings.nguyenLuuStart);
    if (savedSettings.isOpen !== undefined) setIsOpen(savedSettings.isOpen);
  }, [savedSettings]);

  // 4 Trụ nguyên cục (Chi & Can)
  const nienChi = pillars?.[3]?.chi || "Dậu";
  const nguyetChi = pillars?.[2]?.chi || "Dậu";
  const nhatChi = pillars?.[1]?.chi || "Dậu";
  const thoiChi = pillars?.[0]?.chi || "Tỵ";

  const nienCan = pillars?.[3]?.can || "Đinh";
  const nguyetCan = pillars?.[2]?.can || "Đinh";
  const nhatCan = pillars?.[1]?.can || "Kỷ";
  const thoiCan = pillars?.[0]?.can || "Ất";

  const dayCan = nhatCan;
  const dayCanData = CAN_MAP.get(dayCan);
  const dayElement = dayCanData?.element || "Thổ";

  // Chi của Đại Vận hiện chọn
  const daiVanChi = activeDaiVan?.chi || "Tý";
  const daiVanCan = activeDaiVan?.can || "";
  const daiVanLabel = activeDaiVan?.fullName
    ? `Đại Vận ${activeDaiVan.fullName}`
    : "Đại Vận";
  const daiVanSub = activeDaiVan?.ageStart !== undefined && activeDaiVan?.ageEnd !== undefined
    ? `${activeDaiVan.ageStart}-${activeDaiVan.ageEnd}t`
    : "Vận chọn";

  // Danh sách 5 Trụ: [Đại Vận (Vận hiện chọn), Thời Trụ, Nhật Trụ, Nguyệt Trụ, Niên Trụ]
  const allPillars = useMemo(
    () => [
      {
        key: "daivan",
        label: "Đại Vận",
        pillar: daiVanLabel,
        subPillar: daiVanSub,
        chi: daiVanChi,
        isDaiVan: true,
      },
      {
        key: "thoi",
        label: "Chi Giờ",
        pillar: "Thời Trụ",
        subPillar: "Nguyên Cục",
        chi: thoiChi,
        isDaiVan: false,
      },
      {
        key: "nhat",
        label: "Chi Ngày",
        pillar: "Nhật Trụ",
        subPillar: "Nguyên Cục",
        chi: nhatChi,
        isDaiVan: false,
      },
      {
        key: "nguyet",
        label: "Chi Tháng",
        pillar: "Nguyệt Trụ",
        subPillar: "Nguyên Cục",
        chi: nguyetChi,
        isDaiVan: false,
      },
      {
        key: "nien",
        label: "Chi Năm",
        pillar: "Niên Trụ",
        subPillar: "Nguyên Cục",
        chi: nienChi,
        isDaiVan: false,
      },
    ],
    [daiVanChi, daiVanLabel, daiVanSub, thoiChi, nhatChi, nguyetChi, nienChi]
  );

  const allChiList = useMemo(
    () => allPillars.map((p) => p.chi),
    [allPillars]
  );

  // Vòng tròn ngũ hành tương sinh chuẩn: Mộc -> Hỏa -> Thổ -> Kim -> Thủy -> Mộc
  const FIVE_ELEMENTS = useMemo<("Mộc" | "Hỏa" | "Thổ" | "Kim" | "Thủy")[]>(
    () => ["Mộc", "Hỏa", "Thổ", "Kim", "Thủy"],
    []
  );

  const lucThanDataMap = useMemo(() => {
    const dayIdx = FIVE_ELEMENTS.indexOf(dayElement);

    const tyElement = FIVE_ELEMENTS[dayIdx];
    const thucElement = FIVE_ELEMENTS[(dayIdx + 1) % 5];
    const taiElement = FIVE_ELEMENTS[(dayIdx + 2) % 5];
    const quanElement = FIVE_ELEMENTS[(dayIdx + 3) % 5];
    const anElement = FIVE_ELEMENTS[(dayIdx + 4) % 5];

    // Đếm số lượng can chi trong 5 trụ (Đại Vận + 4 Trụ) mang ngũ hành tương ứng
    const chartElementsCount: Record<"Mộc" | "Hỏa" | "Thổ" | "Kim" | "Thủy", number> = {
      Mộc: 0,
      Hỏa: 0,
      Thổ: 0,
      Kim: 0,
      Thủy: 0,
    };

    [nienCan, nguyetCan, nhatCan, thoiCan, daiVanCan].forEach((c) => {
      if (!c) return;
      const el = CAN_MAP.get(c)?.element;
      if (el) chartElementsCount[el] = (chartElementsCount[el] || 0) + 1;
    });

    [nienChi, nguyetChi, nhatChi, thoiChi, daiVanChi].forEach((c) => {
      const el = CHI_MAP.get(c)?.element;
      if (el) chartElementsCount[el] = (chartElementsCount[el] || 0) + 1;
    });

    const getDetail = (
      type: LucThanType,
      element: "Mộc" | "Hỏa" | "Thổ" | "Kim" | "Thủy",
      generates: LucThanType,
      fullName: string,
      relationText: string,
      meaning: string,
      typicalCan: string,
      typicalChi: string
    ) => {
      const emojiMap: Record<"Mộc" | "Hỏa" | "Thổ" | "Kim" | "Thủy", string> = {
        Mộc: "🌳",
        Hỏa: "🔥",
        Thổ: "⛰️",
        Kim: "🪓",
        Thủy: "🌊",
      };

      return {
        type,
        fullName,
        element,
        elementEmoji: emojiMap[element],
        generates,
        relationText,
        meaning,
        typicalCan,
        typicalChi,
        countInChart: chartElementsCount[element] || 0,
      };
    };

    return {
      Ấn: getDetail(
        "Ấn",
        anElement,
        "Tỷ",
        "Chính Ấn / Kiêu Thần (Ấn Tinh)",
        `Ấn (${anElement}) sinh Tỷ (${tyElement})`,
        "Cội nguồn học vấn, bằng cấp, phúc đức tổ tiên, sự bảo bọc, dưỡng dục tâm tính.",
        anElement === "Mộc" ? "Giáp, Ất" : anElement === "Hỏa" ? "Bính, Đinh" : anElement === "Thổ" ? "Mậu, Kỷ" : anElement === "Kim" ? "Canh, Tân" : "Nhâm, Quý",
        anElement === "Mộc" ? "Dần, Mão" : anElement === "Hỏa" ? "Tỵ, Ngọ" : anElement === "Thổ" ? "Thìn, Tuất, Sửu, Mùi" : anElement === "Kim" ? "Thân, Dậu" : "Hợi, Tý"
      ),
      Tỷ: getDetail(
        "Tỷ",
        tyElement,
        "Thực",
        "Tỷ Kiên / Kiếp Tài (Tỷ Kiếp - Nhật Chủ)",
        `Tỷ (${tyElement}) sinh Thực (${thucElement})`,
        "Ý chí tự cường, bản lĩnh cá nhân, đồng đội chí hướng, nội lực gánh vác trách nhiệm.",
        tyElement === "Mộc" ? "Giáp, Ất" : tyElement === "Hỏa" ? "Bính, Đinh" : tyElement === "Thổ" ? "Mậu, Kỷ" : tyElement === "Kim" ? "Canh, Tân" : "Nhâm, Quý",
        tyElement === "Mộc" ? "Dần, Mão" : tyElement === "Hỏa" ? "Tỵ, Ngọ" : tyElement === "Thổ" ? "Thìn, Tuất, Sửu, Mùi" : tyElement === "Kim" ? "Thân, Dậu" : "Hợi, Tý"
      ),
      Thực: getDetail(
        "Thực",
        thucElement,
        "Tài",
        "Thực Thần / Thương Quan (Thực Thương)",
        `Thực (${thucElement}) sinh Tài (${taiElement})`,
        "Trí tuệ phát tiết, sáng tạo, kỹ nghệ, tư duy thương mại, hưởng thụ tài hoa.",
        thucElement === "Mộc" ? "Giáp, Ất" : thucElement === "Hỏa" ? "Bính, Đinh" : thucElement === "Thổ" ? "Mậu, Kỷ" : thucElement === "Kim" ? "Canh, Tân" : "Nhâm, Quý",
        thucElement === "Mộc" ? "Dần, Mão" : thucElement === "Hỏa" ? "Tỵ, Ngọ" : thucElement === "Thổ" ? "Thìn, Tuất, Sửu, Mùi" : thucElement === "Kim" ? "Thân, Dậu" : "Hợi, Tý"
      ),
      Tài: getDetail(
        "Tài",
        taiElement,
        "Quan",
        "Chính Tài / Thiên Tài (Tài Tinh)",
        `Tài (${taiElement}) sinh Quan (${quanElement})`,
        "Của cải, tiền tài vật chất, năng lực quản trị tài chính, nguồn lực thị trường.",
        taiElement === "Mộc" ? "Giáp, Ất" : taiElement === "Hỏa" ? "Bính, Đinh" : taiElement === "Thổ" ? "Mậu, Kỷ" : taiElement === "Kim" ? "Canh, Tân" : "Nhâm, Quý",
        taiElement === "Mộc" ? "Dần, Mão" : taiElement === "Hỏa" ? "Tỵ, Ngọ" : taiElement === "Thổ" ? "Thìn, Tuất, Sửu, Mùi" : taiElement === "Kim" ? "Thân, Dậu" : "Hợi, Tý"
      ),
      Quan: getDetail(
        "Quan",
        quanElement,
        "Ấn",
        "Chính Quan / Thất Sát (Quan Sát)",
        `Quan (${quanElement}) sinh Ấn (${anElement})`,
        "Quyền lực, chức vụ, quy củ, pháp luật, uy quyền xã hội, tinh thần trách nhiệm.",
        quanElement === "Mộc" ? "Giáp, Ất" : quanElement === "Hỏa" ? "Bính, Đinh" : quanElement === "Thổ" ? "Mậu, Kỷ" : quanElement === "Kim" ? "Canh, Tân" : "Nhâm, Quý",
        quanElement === "Mộc" ? "Dần, Mão" : quanElement === "Hỏa" ? "Tỵ, Ngọ" : quanElement === "Thổ" ? "Thìn, Tuất, Sửu, Mùi" : quanElement === "Kim" ? "Thân, Dậu" : "Hợi, Tý"
      ),
    };
  }, [dayElement, nienCan, nguyetCan, nhatCan, thoiCan, daiVanCan, nienChi, nguyetChi, nhatChi, thoiChi, daiVanChi, FIVE_ELEMENTS]);

  // Luồng nguyên lưu chạy tuần tự theo đúng chiều mũi tên bắt đầu từ lựa chọn của người dùng
  const nguyenLuuSequence = useMemo(() => {
    const startIdx = LUC_THAN_CYCLE.indexOf(nguyenLuuStart);
    const seq: LucThanType[] = [];
    for (let i = 0; i < 5; i++) {
      seq.push(LUC_THAN_CYCLE[(startIdx + i) % 5]);
    }
    return seq.map((type) => lucThanDataMap[type]);
  }, [nguyenLuuStart, lucThanDataMap]);

  const nguyenLuuInterpretation = useMemo(() => {
    switch (nguyenLuuStart) {
      case "Ấn":
        return {
          title: "Khởi phát từ Ấn Tinh: Cung đường Học Vấn & Phúc Đức Sinh Tài Danh",
          summary: "Ấn >>> Tỷ >>> Thực >>> Tài >>> Quan",
          detail:
            "Khởi nguồn từ cội rễ Ấn (học thức, bằng cấp, phúc ấm tổ tiên). Ấn sinh Tỷ (truyền thụ tri thức và bồi dưỡng ý chí kiên định), Tỷ sinh Thực (phát huy tài hoa năng lực sáng tạo), Thực sinh Tài (biến ý tưởng thành sản phẩm và của cải vật chất), Tài sinh Quan (dùng tài lực tạo dựng vị thế xã hội và chức vụ cao). Đây là con đường danh giá chính đạo: Do học vấn uyên thâm mà lập thân, nhờ sáng tạo mà giàu sang, nhờ tài đức mà thăng quan tiến chức.",
        };
      case "Tỷ":
        return {
          title: "Khởi phát từ Tỷ Kiếp: Con đường Tự Lực Cánh Sinh & Khởi Nghiệp Vươn Lên",
          summary: "Tỷ >>> Thực >>> Tài >>> Quan >>> Ấn",
          detail:
            "Khởi nguồn từ bản lĩnh tự thân Nhật Chủ (nghị lực, anh em, đồng chí hướng). Tỷ sinh Thực (hành động quyết đoán, lao động sáng tạo), Thực sinh Tài (gặt hái của cải và xây dựng cơ nghiệp thịnh vượng), Tài sinh Quan (được xã hội và tổ chức công nhận bổ nhiệm cương vị trọng yếu), Quan sinh Ấn (được tôn vinh danh dự, củng cố uy tín và để lại phúc ấm). Đây là con đường của người tự lập làm nên nghiệp lớn.",
        };
      case "Thực":
        return {
          title: "Khởi phát từ Thực Thương: Con đường Trí Tuệ Sáng Tạo & Đổi Mới Hóa Phú Quý",
          summary: "Thực >>> Tài >>> Quan >>> Ấn >>> Tỷ",
          detail:
            "Khởi nguồn từ năng khiếu xuất chúng, tư duy đổi mới và tài hoa nghệ thuật. Thực sinh Tài (ý tưởng sinh sôi lợi nhuận lớn, dòng tiền dồi dào), Tài sinh Quan (tiềm lực kinh tế mở đường cho tầm ảnh hưởng và tiếng nói uy quyền), Quan sinh Ấn (được định vị thương hiệu và chứng nhận danh giá), Ấn sinh Tỷ (danh tiếng bồi dưỡng thêm sự tự tin vững chắc cho bản thân). Đây là chu trình của chuyên gia, nghệ sĩ, nhà phát minh tài ba.",
        };
      case "Tài":
        return {
          title: "Khởi phát từ Tài Tinh: Con đường Doanh Thương & Tài Lực Mở Lối Công Danh",
          summary: "Tài >>> Quan >>> Ấn >>> Tỷ >>> Thực",
          detail:
            "Khởi nguồn từ nguồn vốn dồi dào, sự nhạy bén thị trường và năng lực quản lý của cải. Tài sinh Quan (dùng tài lực kiến tạo uy quyền, thăng tiến sự nghiệp quản lý), Quan sinh Ấn (chức vị mang lại bằng cấp, danh vị và sự che chở an toàn), Ấn sinh Tỷ (được bảo bọc giúp bản thân an tâm định hướng), Tỷ sinh Thực (thân vững tâm an thì sinh sáng kiến tiếp tục đầu tư sinh lợi). Đây là con đường phú quý của các nhà tài phiệt và doanh nhân lớn.",
        };
      case "Quan":
        return {
          title: "Khởi phát từ Quan Sát: Con đường Kỷ Cương, Trọng Trách & Tôi Luyện Thành Tài",
          summary: "Quan >>> Ấn >>> Tỷ >>> Thực >>> Tài",
          detail:
            "Khởi nguồn từ quy chế, khuôn phép, trọng trách công vụ và môi trường kỷ luật. Quan sinh Ấn (áp lực thúc đẩy tôi luyện học hỏi, thu nạp kiến thức sâu rộng), Ấn sinh Tỷ (tri thức rèn giũa bản lĩnh vững như bàn thạch), Tỷ sinh Thực (bản lĩnh sinh sáng kiến giải quyết bài toán khó), Thực sinh Tài (thành quả công vụ đem lại tài lộc và phần thưởng xứng đáng). Đây là con đường của quan chức lãnh đạo, nhà quản trị tài năng gánh vác sứ mệnh lớn.",
        };
    }
  }, [nguyenLuuStart]);

  const getLucThanElementTheme = (el: "Thủy" | "Hỏa" | "Kim" | "Mộc" | "Thổ") => {
    switch (el) {
      case "Thủy":
        return {
          cardBg: "from-[#FFFDF8] via-[#FFFDF8] to-[#FFFDF8]",
          border: "border-sky-600/60",
          activeRing: "ring-2 ring-sky-400 border-sky-400 shadow-sky-500/30",
          text: "text-[#1E3A8A]",
          badgeBg: "bg-[#E0F2FE]/90 text-[#1E3A8A] border-sky-600/70",
          dot: "bg-sky-400",
        };
      case "Hỏa":
        return {
          cardBg: "from-[#FFFDF8] via-[#FFFDF8] to-[#FFFDF8]",
          border: "border-rose-600/60",
          activeRing: "ring-2 ring-rose-400 border-rose-400 shadow-rose-500/30",
          text: "text-[#991B1B]",
          badgeBg: "bg-[#FEE2E2]/90 text-[#991B1B] border-rose-600/70",
          dot: "bg-rose-400",
        };
      case "Thổ":
        return {
          cardBg: "from-[#FAF6EE] via-[#FFFDF8] to-[#FFFDF8]",
          border: "border-amber-600/60",
          activeRing: "ring-2 ring-amber-400 border-amber-400 shadow-amber-500/30",
          text: "text-[#78350F]",
          badgeBg: "bg-[#FEF3C7] text-[#78350F] border-amber-600/70",
          dot: "bg-amber-400",
        };
      case "Kim":
        return {
          cardBg: "from-[#FAF6EE] via-[#FFFDF8] to-[#FFFDF8]",
          border: "border-slate-500/60",
          activeRing: "ring-2 ring-slate-300 border-slate-300 shadow-slate-400/30",
          text: "text-[#3F3F46]",
          badgeBg: "bg-[#F1F5F9] text-[#334155] border-[#CBD5E1]",
          dot: "bg-slate-300",
        };
      case "Mộc":
        return {
          cardBg: "from-[#FFFDF8] via-[#FFFDF8] to-[#FFFDF8]",
          border: "border-emerald-600/60",
          activeRing: "ring-2 ring-emerald-400 border-emerald-400 shadow-emerald-500/30",
          text: "text-[#14532D]",
          badgeBg: "bg-[#DCFCE7]/90 text-[#14532D] border-emerald-600/70",
          dot: "bg-emerald-400",
        };
    }
  };

  // Quét kẹp củng ở Bước 1 trên 5 trụ (Đại Vận + 4 Trụ Nguyên Cục)
  const detectedCung = useMemo(() => {
    interface DetectedItem {
      rule: CungRuleItem;
      p1Label: string;
      p1Chi: string;
      p1IsDaiVan: boolean;
      p2Label: string;
      p2Chi: string;
      p2IsDaiVan: boolean;
      pairKey: string;
      cungChiAlreadyInChart: boolean;
      involvesDaiVan: boolean;
    }

    const results: DetectedItem[] = [];
    const seenPairs = new Set<string>();

    for (let i = 0; i < allPillars.length; i++) {
      for (let j = i + 1; j < allPillars.length; j++) {
        const p1 = allPillars[i];
        const p2 = allPillars[j];

        CUNG_RULES.forEach((rule) => {
          if (rule.isException || !rule.cungChi) return;

          // Nếu đã có sẵn chữ củng này trong 5 trụ (Đại Vận + Nguyên Cục) thì không còn kẹp củng ra nữa
          if (allChiList.includes(rule.cungChi)) return;

          const matchNormal = p1.chi === rule.branch1 && p2.chi === rule.branch2;
          const matchReverse = p1.chi === rule.branch2 && p2.chi === rule.branch1;

          if (matchNormal || matchReverse) {
            const pairKey = `${p1.key}-${p2.key}-${rule.id}`;
            if (!seenPairs.has(pairKey)) {
              seenPairs.add(pairKey);
              results.push({
                rule,
                p1Label: p1.label,
                p1Chi: p1.chi,
                p1IsDaiVan: p1.isDaiVan,
                p2Label: p2.label,
                p2Chi: p2.chi,
                p2IsDaiVan: p2.isDaiVan,
                pairKey,
                cungChiAlreadyInChart: false,
                involvesDaiVan: p1.isDaiVan || p2.isDaiVan,
              });
            }
          }
        });
      }
    }

    return results;
  }, [allPillars, allChiList]);

  // Toggle helpers
  const toggleDich = (key: string) => {
    setDichList((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const toggleNga = (key: string) => {
    setNgaList((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const toggleDuoc = (key: string) => {
    setDuocChiList((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const toggleBenh = (key: string) => {
    setBenhChiList((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const toggleNgoaiTa = (key: string) => {
    setNgoaiTaChiList((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const hasFullGroupInChart = (rule: CungRuleItem) => {
    if (!rule.cungChi) return false;
    return (
      allChiList.includes(rule.branch1) &&
      allChiList.includes(rule.branch2) &&
      allChiList.includes(rule.cungChi)
    );
  };

  const isRuleActiveInChart = (rule: CungRuleItem) => {
    if (rule.isException) return false;
    if (rule.cungChi && allChiList.includes(rule.cungChi)) return false;
    return allChiList.includes(rule.branch1) && allChiList.includes(rule.branch2);
  };

  const getElementBadgeColor = (el: "Thủy" | "Hỏa" | "Kim" | "Mộc") => {
    switch (el) {
      case "Thủy": return "bg-[#E0F2FE]/80 text-[#1E3A8A] border-sky-700/60";
      case "Hỏa": return "bg-[#FEE2E2] text-[#991B1B] border-rose-700/60";
      case "Kim": return "bg-[#F4F4F5] text-[#3F3F46] border-slate-600/60";
      case "Mộc": return "bg-[#DCFCE7] text-[#14532D] border-[#16A34A]/45";
    }
  };

  return (
    <div
      className={`p-3 sm:p-5 rounded-2xl bg-gradient-to-b from-[#FFFDF8] via-[#FFFDF8] to-[#FFFDF8] border border-[#C4963E]/45 shadow-xl ${className}`}
    >
      {/* Header Kết Cấu Vận Thiên */}
      <div className="flex flex-row items-center justify-between gap-2 pb-2.5 sm:pb-3 border-b border-[#C4963E]/45">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#6B21A8] text-[#FFF9F5] flex items-center justify-center shadow-md shrink-0">
            <Compass className="w-4 h-4 text-[#6B21A8]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-xs sm:text-base font-bold text-[#1C1813] font-serif tracking-wide truncate">
                KẾT CẤU VẬN THIÊN (結構運篇)
              </h3>
              {activeDaiVan && (
                <span className="text-[9.5px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F3E8FF] text-[#6B21A8] border border-purple-500/70 shrink-0">
                  {activeDaiVan.fullName} ({activeDaiVan.ageStart} - {activeDaiVan.ageEnd}t)
                </span>
              )}
            </div>
            <p className="text-[10px] sm:text-xs text-[#6B21A8]/80 mt-0.5 line-clamp-1">
              Phân tích kẹp củng Tam Hợp/Tam Hội, quan hệ Địch - Ngã, Dược Bệnh Ngoại Tà và Nguyên Lưu Ngũ Hành (kết hợp Đại Vận).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {onSaveToBazi && (
            <button
              type="button"
              onClick={() =>
                onSaveToBazi({
                  activeTabB1,
                  selectedRuleId,
                  dichList,
                  ngaList,
                  duocChiList,
                  benhChiList,
                  ngoaiTaChiList,
                  nguyenLuuStart,
                  isOpen,
                })
              }
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] sm:text-xs font-bold rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white shadow-sm shadow-purple-600/30 transition-all cursor-pointer active:scale-95 whitespace-nowrap"
              title="Lưu thiết lập Kết Cấu Vận Thiên vào lá số Bát Tự"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Lưu Vào Bát Tự</span>
            </button>
          )}

          {onCapture && (
            <button
              type="button"
              onClick={onCapture}
              className="no-capture flex items-center gap-1 px-2.5 py-1 text-[11px] sm:text-xs font-semibold rounded-lg bg-[#FFFDF8] hover:bg-[#FAF6EE] text-[#6B21A8] border border-[#C4963E]/45 hover:border-purple-400 transition-all cursor-pointer shadow-sm active:scale-95 whitespace-nowrap"
              title="Chụp ảnh riêng Kết Cấu Vận Thiên"
            >
              <Camera className="w-3.5 h-3.5 text-[#6B21A8]" />
              <span>Chụp Kết Cấu Vận</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 px-2 py-1 text-[11px] sm:text-xs font-medium rounded-lg bg-[#FFFDF8] text-[#6B21A8] border border-[#C4963E]/45 hover:bg-[#FAF6EE] transition-all cursor-pointer whitespace-nowrap"
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
        <div className="mt-3 sm:mt-4 text-xs space-y-3">
          {/* =================================================================
              BƯỚC 1: HỢP COI NGUYÊN CỤC + ĐẠI VẬN XEM CÓ KẸP CỦNG GÌ KHÔNG?
              ================================================================= */}
          <div className="space-y-2.5 p-2.5 sm:p-3 rounded-xl bg-[#FFFDF8] border border-[#C4963E]/45">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-[#C4963E]/45">
              <div className="text-[10.5px] sm:text-[11px] font-bold text-[#6B21A8] flex items-center gap-1.5 uppercase tracking-wider">
                <span className="w-4 h-4 rounded-full bg-purple-500/20 text-[#6B21A8] flex items-center justify-center text-[10px] font-mono shrink-0">
                  1
                </span>
                <span>Bước 1: Hợp coi nguyên cục + Vận hiện chọn xem có kẹp củng gì không?</span>
              </div>
              <div className="text-[9.5px] sm:text-[10px] text-[#6B21A8]/80 font-mono">
                {detectedCung.length > 0 ? (
                  <span className="text-[#15803D] font-bold">
                    Phát hiện {detectedCung.length} thế kẹp củng
                  </span>
                ) : (
                  <span className="text-[#5C4D3C]">(Không có kẹp củng)</span>
                )}
              </div>
            </div>

            {/* 5 CHI THẲNG HÀNG: ĐẠI VẬN HIỆN CHỌN + 4 CHI NGUYÊN CỤC */}
            <div className="grid grid-cols-5 gap-1 sm:gap-2">
              {allPillars.map((p) => {
                const chiData = CHI_MAP.get(p.chi);
                return (
                  <div
                    key={p.key}
                    className={`p-1 sm:p-1.5 rounded-lg text-center flex flex-col items-center justify-between min-h-[54px] sm:min-h-[62px] transition-all ${
                      p.isDaiVan
                        ? "bg-gradient-to-b from-[#FAF6EE] to-[#FFFDF8] border-2 border-purple-400/90 shadow-md shadow-purple-950/60 ring-1 ring-purple-400/50"
                        : "bg-gradient-to-b from-[#FFFDF8] to-[#FFFDF8] border border-[#C4963E]/45"
                    }`}
                  >
                    <div
                      className={`text-[8px] sm:text-[9.5px] font-bold truncate w-full pb-0.5 border-b ${
                        p.isDaiVan
                          ? "text-[#6B21A8] border-purple-500/50"
                          : "text-[#6E4E16] border-[#C4963E]/45"
                      }`}
                    >
                      {p.label}
                    </div>
                    <div className="flex items-center justify-center gap-0.5 sm:gap-1 my-0.5">
                      <span className="text-xs sm:text-base leading-none">{chiData?.emoji || "⭐"}</span>
                      <span
                        className={`text-xs sm:text-sm font-serif font-bold leading-none ${
                          p.isDaiVan ? "text-[#6B21A8]" : "text-[#1C1813]"
                        }`}
                      >
                        {p.chi}
                      </span>
                      <span className="text-[7.5px] sm:text-[8.5px] text-[#5C4D3C] font-serif">
                        ({chiData?.chinese || ""})
                      </span>
                    </div>
                    <div
                      className={`text-[7px] sm:text-[8px] font-mono leading-none truncate max-w-full ${
                        p.isDaiVan ? "text-[#6B21A8] font-bold" : "text-[#5C4D3C]"
                      }`}
                      title={p.pillar}
                    >
                      {p.subPillar || p.pillar}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* THANH ĐIỀU HƯỚNG TAB BƯỚC 1 */}
            <div className="flex items-center gap-1.5 pt-1 border-t border-[#C4963E]/45 overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveTabB1("van_nguyen_cuc")}
                className={`px-2.5 py-1 rounded-md text-[10.5px] sm:text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                  activeTabB1 === "van_nguyen_cuc"
                    ? "bg-[#FAF6EE] border border-purple-400 text-[#6B21A8] font-bold"
                    : "bg-[#FFFDF8] hover:bg-[#FAF6EE] border border-[#C4963E]/45 text-[#6B21A8]/70"
                }`}
              >
                Vận + Nguyên Cục Kẹp Củng ({detectedCung.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTabB1("tam_hop")}
                className={`px-2.5 py-1 rounded-md text-[10.5px] sm:text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                  activeTabB1 === "tam_hop"
                    ? "bg-[#FAF6EE] border border-purple-400 text-[#6B21A8] font-bold"
                    : "bg-[#FFFDF8] hover:bg-[#FAF6EE] border border-[#C4963E]/45 text-[#6B21A8]/70"
                }`}
              >
                Tam Hợp Củng
              </button>
              <button
                type="button"
                onClick={() => setActiveTabB1("tam_hoi")}
                className={`px-2.5 py-1 rounded-md text-[10.5px] sm:text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                  activeTabB1 === "tam_hoi"
                    ? "bg-[#FAF6EE] border border-purple-400 text-[#6B21A8] font-bold"
                    : "bg-[#FFFDF8] hover:bg-[#FAF6EE] border border-[#C4963E]/45 text-[#6B21A8]/70"
                }`}
              >
                Tam Hội Củng & Ngoại Lệ
              </button>
            </div>

            {/* TAB CONTENT BƯỚC 1 */}
            {activeTabB1 === "van_nguyen_cuc" && (
              <div className="space-y-1.5 pt-1">
                {detectedCung.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                    {detectedCung.map((item) => (
                      <div
                        key={item.pairKey}
                        className={`p-2 rounded-lg border shadow-sm flex flex-col justify-between ${
                          item.involvesDaiVan
                            ? "bg-gradient-to-r from-[#FFFDF8] to-[#FFFDF8] border-purple-400/70 ring-1 ring-purple-500/40"
                            : "bg-gradient-to-r from-[#FFFDF8] to-[#FFFDF8] border-amber-600/50"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-serif text-[11px] sm:text-xs font-bold text-[#78350F] flex items-center gap-1">
                            {item.involvesDaiVan && (
                              <span className="text-[7.5px] px-1 py-0.2 rounded bg-[#F3E8FF] text-[#6B21A8] border border-purple-400">
                                Có Vận
                              </span>
                            )}
                            <span>
                              {item.p1Chi} ({item.p1Label}) + {item.p2Chi} ({item.p2Label})
                            </span>
                          </span>
                          <span
                            className={`text-[8.5px] sm:text-[9px] px-1.5 py-0.5 rounded border font-semibold ${getElementBadgeColor(
                              item.rule.element
                            )}`}
                          >
                            {item.rule.type === "tam_hop" ? "Tam Hợp" : "Tam Hội"} • {item.rule.element}
                          </span>
                        </div>
                        <div className="mt-1 pt-1 border-t border-[#C4963E]/45 flex items-center justify-between text-[10px]">
                          <span className="text-[#6B21A8]">
                            ➔ Củng chữ:{" "}
                            <strong className="text-[#15803D] font-serif text-xs">
                              {item.rule.cungChi}
                            </strong>
                          </span>
                          <span className="text-[8.5px] text-[#5C4D3C] font-mono">
                            {item.cungChiAlreadyInChart ? "(Có sẵn trong cục/vận)" : "(Hư thần củng nhập)"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg bg-[#FFFDF8] border border-dashed border-[#C4963E]/45 text-center text-[#6B21A8]/70 text-[11px]">
                    Đại Vận kết hợp 4 trụ nguyên cục hiện tại không tạo thành thế kẹp củng Tam Hợp hay Tam Hội.
                  </div>
                )}
              </div>
            )}

            {activeTabB1 === "tam_hop" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 sm:gap-2 pt-1">
                {CUNG_RULES.filter((r) => r.type === "tam_hop").map((rule) => {
                  const activeInChart = isRuleActiveInChart(rule);
                  const isSelected = selectedRuleId === rule.id;
                  return (
                    <button
                      key={rule.id}
                      type="button"
                      onClick={() => setSelectedRuleId((prev) => (prev === rule.id ? null : rule.id))}
                      className={`p-2 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        activeInChart
                          ? "bg-gradient-to-r from-[#ECFDF5] to-[#FFFDF8] border-emerald-400 text-[#14532D] ring-1 ring-emerald-500/50 shadow-md"
                          : isSelected
                          ? "bg-[#FFFDF8] border-purple-400 text-[#1C1813] ring-1 ring-purple-400/50"
                          : "bg-[#FFFDF8] hover:bg-[#FFFDF8] border-[#C4963E]/45 text-[#5C4D3C]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 w-full">
                        <span className="font-serif text-[11px] sm:text-xs font-bold text-[#6E4E16]">
                          {rule.branch1} - {rule.branch2} củng {rule.cungChi}
                        </span>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded border font-semibold ${getElementBadgeColor(rule.element)}`}>
                          {rule.element} Cục
                        </span>
                      </div>
                      <div className="mt-1 flex items-center justify-between w-full text-[9px] text-[#5C4D3C]">
                        <span>{rule.groupName}</span>
                        {activeInChart && (
                          <span className="text-[#15803D] font-bold flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3 text-[#15803D]" />
                            <span>Có trong vận/cục</span>
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {activeTabB1 === "tam_hoi" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 sm:gap-2 pt-1">
                {CUNG_RULES.filter((r) => r.type === "tam_hoi").map((rule) => {
                  const activeInChart = isRuleActiveInChart(rule);
                  const isSelected = selectedRuleId === rule.id;
                  const isException = rule.isException;

                  return (
                    <button
                      key={rule.id}
                      type="button"
                      onClick={() => setSelectedRuleId((prev) => (prev === rule.id ? null : rule.id))}
                      className={`p-2 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isException
                          ? "bg-gradient-to-r from-[#FFFDF8] to-[#FFFDF8] border-rose-800/80 text-[#991B1B]"
                          : activeInChart
                          ? "bg-gradient-to-r from-[#ECFDF5] to-[#FFFDF8] border-emerald-400 text-[#14532D] ring-1 ring-emerald-500/50 shadow-md"
                          : isSelected
                          ? "bg-[#FFFDF8] border-purple-400 text-[#1C1813] ring-1 ring-purple-400/50"
                          : "bg-[#FFFDF8] hover:bg-[#FFFDF8] border-[#C4963E]/45 text-[#5C4D3C]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 w-full">
                        <span className={`font-serif text-[11px] sm:text-xs font-bold ${isException ? "text-[#991B1B]" : "text-[#6E4E16]"}`}>
                          {isException ? `${rule.branch1} - ${rule.branch2} (Ngoại lệ)` : `${rule.branch1} - ${rule.branch2} củng ${rule.cungChi}`}
                        </span>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded border font-semibold ${isException ? "bg-[#FEE2E2] text-[#991B1B] border-rose-700/60" : getElementBadgeColor(rule.element)}`}>
                          {isException ? "Ngoại Lệ" : `${rule.element} Hội`}
                        </span>
                      </div>
                      <div className="mt-1 w-full text-[9px]">
                        {isException ? (
                          <div className="text-[#991B1B] font-medium flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-[#991B1B] shrink-0" />
                            <span>{rule.exceptionNote}</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-[#5C4D3C]">
                            <span>{rule.groupName}</span>
                            {activeInChart && (
                              <span className="text-[#15803D] font-bold flex items-center gap-0.5">
                                <CheckCircle2 className="w-3 h-3 text-[#15803D]" />
                                <span>Có trong vận/cục</span>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* =================================================================
              BƯỚC 2: NGUYÊN CỤC + ĐẠI VẬN XEM HÌNH HẠI - TÌM ĐỊCH NGÃ ĐÍCH QUAN HỆ
              ================================================================= */}
          <div className="space-y-2.5 p-2.5 sm:p-3 rounded-xl bg-[#FFFDF8] border border-[#C4963E]/45">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-[#C4963E]/45">
              <div className="text-[10.5px] sm:text-[11px] font-bold text-[#6B21A8] flex items-center gap-1.5 uppercase tracking-wider">
                <span className="w-4 h-4 rounded-full bg-purple-500/20 text-[#6B21A8] flex items-center justify-center text-[10px] font-mono shrink-0">
                  2
                </span>
                <Swords className="w-3.5 h-3.5 text-[#7E22CE] shrink-0" />
                <span>Bước 2: Nguyên cục + Vận xem hình hại (Địch - Ngã quan hệ)</span>
              </div>
              <div className="text-[9px] sm:text-[10px] text-[#6B21A8]/80 font-mono">
                {dichList.length > 0 || ngaList.length > 0 ? (
                  <span>
                    {dichList.length > 0 && <span className="text-[#92400E] font-bold">Địch: {dichList.map(k => allPillars.find(p => p.key === k)?.chi).join(", ")}</span>}
                    {dichList.length > 0 && ngaList.length > 0 && <span className="text-[#7E22CE]"> ➔ </span>}
                    {ngaList.length > 0 && <span className="text-[#1D4ED8] font-bold">Ngã: {ngaList.map(k => allPillars.find(p => p.key === k)?.chi).join(", ")}</span>}
                  </span>
                ) : (
                  <span>(Chưa chọn Địch / Ngã)</span>
                )}
              </div>
            </div>

            {/* LỜI DẪN BƯỚC 2 */}
            <div className="text-[10px] text-[#6B21A8]/80 leading-relaxed">
              Mục tiêu tìm quan hệ <strong className="text-[#78350F]">Địch</strong> - <strong className="text-[#1E3A8A]">Ngã</strong> giữa Đại Vận và 4 Trụ: <span className="text-[#78350F] font-semibold">Địch là đi hình hại</span>, <span className="text-[#1E3A8A] font-semibold">Ngã là bị hình hại</span>.
            </div>

            {/* HÀNG ĐỊCH: ĐI HÌNH HẠI (CHỌN ĐƯỢC NHIỀU HƠN 1, 5 CỘT) */}
            <div className="space-y-1 pt-1 border-t border-[#C4963E]/45">
              <div className="flex items-center justify-between text-[9.5px] sm:text-[10px]">
                <span className="font-semibold text-[#92400E] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Địch (Bên ĐI hình hại - có thể chọn nhiều):</span>
                </span>
                <span className="text-[#6B21A8]/70 text-[8.5px] sm:text-[9px]">
                  {dichList.length > 0
                    ? `Đã chọn: ${dichList.map((k) => allPillars.find((p) => p.key === k)?.chi).join(", ")}`
                    : "Chưa chọn"}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1 sm:gap-2">
                {allPillars.map((p) => {
                  const isSelected = dichList.includes(p.key);
                  const chiData = CHI_MAP.get(p.chi);
                  return (
                    <button
                      key={`dich-van-${p.key}`}
                      type="button"
                      onClick={() => toggleDich(p.key)}
                      className={`relative p-1 sm:p-2 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-between min-h-[56px] sm:min-h-[64px] ${
                        isSelected
                          ? "bg-gradient-to-b from-[#FAF6EE] to-[#FFFDF8] border-amber-400 text-[#78350F] font-bold shadow-md shadow-amber-500/20 ring-1 ring-amber-500/60"
                          : p.isDaiVan
                          ? "bg-gradient-to-b from-[#FFFDF8] to-[#FFFDF8] hover:bg-[#FAF6EE] border-purple-400/80 text-[#6B21A8]"
                          : "bg-gradient-to-b from-[#FFFDF8] to-[#FFFDF8] hover:bg-[#FFFDF8] border-[#C4963E]/45 text-[#5C4D3C]"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full px-0.5 pb-0.5 border-b border-[#C4963E]/45">
                        <span className={`text-[8px] sm:text-[9.5px] font-bold truncate ${isSelected ? "text-[#78350F]" : p.isDaiVan ? "text-[#6B21A8]" : "text-[#6E4E16]"}`}>
                          {p.label}
                        </span>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />}
                      </div>
                      <div className="flex items-center justify-center gap-0.5 sm:gap-1 my-0.5 sm:my-1">
                        <span className="text-xs sm:text-base leading-none">{chiData?.emoji || "⭐"}</span>
                        <span className={`text-xs sm:text-sm font-serif font-bold leading-none ${isSelected ? "text-[#78350F]" : "text-[#1C1813]"}`}>
                          {p.chi}
                        </span>
                        <span className="text-[7.5px] sm:text-[9px] text-[#5C4D3C] font-serif">({chiData?.chinese || ""})</span>
                      </div>
                      <div className="text-[7px] sm:text-[8px] text-[#5C4D3C] font-mono leading-none truncate max-w-full">
                        {p.subPillar || p.pillar}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* HÀNG NGÃ: BỊ HÌNH HẠI (CHỌN ĐƯỢC NHIỀU HƠN 1, 5 CỘT) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[9.5px] sm:text-[10px]">
                <span className="font-semibold text-[#1D4ED8] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  <span>Ngã (Bên BỊ hình hại - có thể chọn nhiều):</span>
                </span>
                <span className="text-[#6B21A8]/70 text-[8.5px] sm:text-[9px]">
                  {ngaList.length > 0
                    ? `Đã chọn: ${ngaList.map((k) => allPillars.find((p) => p.key === k)?.chi).join(", ")}`
                    : "Chưa chọn"}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1 sm:gap-2">
                {allPillars.map((p) => {
                  const isSelected = ngaList.includes(p.key);
                  const chiData = CHI_MAP.get(p.chi);
                  return (
                    <button
                      key={`nga-van-${p.key}`}
                      type="button"
                      onClick={() => toggleNga(p.key)}
                      className={`relative p-1 sm:p-2 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-between min-h-[56px] sm:min-h-[64px] ${
                        isSelected
                          ? "bg-gradient-to-b from-[#FFFDF8] to-[#FFFDF8] border-sky-400 text-[#1E3A8A] font-bold shadow-md shadow-sky-500/20 ring-1 ring-sky-500/60"
                          : p.isDaiVan
                          ? "bg-gradient-to-b from-[#FFFDF8] to-[#FFFDF8] hover:bg-[#FAF6EE] border-purple-400/80 text-[#6B21A8]"
                          : "bg-gradient-to-b from-[#FFFDF8] to-[#FFFDF8] hover:bg-[#FFFDF8] border-[#C4963E]/45 text-[#5C4D3C]"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full px-0.5 pb-0.5 border-b border-[#C4963E]/45">
                        <span className={`text-[8px] sm:text-[9.5px] font-bold truncate ${isSelected ? "text-[#1E3A8A]" : p.isDaiVan ? "text-[#6B21A8]" : "text-[#6E4E16]"}`}>
                          {p.label}
                        </span>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />}
                      </div>
                      <div className="flex items-center justify-center gap-0.5 sm:gap-1 my-0.5 sm:my-1">
                        <span className="text-xs sm:text-base leading-none">{chiData?.emoji || "⭐"}</span>
                        <span className={`text-xs sm:text-sm font-serif font-bold leading-none ${isSelected ? "text-[#1E3A8A]" : "text-[#1C1813]"}`}>
                          {p.chi}
                        </span>
                        <span className="text-[7.5px] sm:text-[9px] text-[#5C4D3C] font-serif">({chiData?.chinese || ""})</span>
                      </div>
                      <div className="text-[7px] sm:text-[8px] text-[#5C4D3C] font-mono leading-none truncate max-w-full">
                        {p.subPillar || p.pillar}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* =================================================================
              BƯỚC 3: CHỌN DƯỢC, BỆNH, NGOẠI TÀ (CÓ TÍNH THÊM ĐẠI VẬN)
              ================================================================= */}
          <div className="space-y-2.5 p-2.5 sm:p-3 rounded-xl bg-[#FFFDF8] border border-[#C4963E]/45">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-[#C4963E]/45">
              <div className="text-[10.5px] sm:text-[11px] font-bold text-[#6B21A8] flex items-center gap-1.5 uppercase tracking-wider">
                <span className="w-4 h-4 rounded-full bg-purple-500/20 text-[#6B21A8] flex items-center justify-center text-[10px] font-mono shrink-0">
                  3
                </span>
                <Activity className="w-3.5 h-3.5 text-[#7E22CE] shrink-0" />
                <span>Bước 3: Chọn Dược, Bệnh, Ngoại Tà (Vận + Nguyên Cục)</span>
              </div>
              <div className="text-[9px] sm:text-[10px] text-[#6B21A8]/80 font-mono">
                {duocChiList.length > 0 || benhChiList.length > 0 || ngoaiTaChiList.length > 0
                  ? [
                      duocChiList.length > 0 &&
                        `Dược: ${duocChiList.map((k) => allPillars.find((p) => p.key === k)?.chi).join(",")}`,
                      benhChiList.length > 0 &&
                        `Bệnh: ${benhChiList.map((k) => allPillars.find((p) => p.key === k)?.chi).join(",")}`,
                      ngoaiTaChiList.length > 0 &&
                        `Tà: ${ngoaiTaChiList.map((k) => allPillars.find((p) => p.key === k)?.chi).join(",")}`,
                    ]
                      .filter(Boolean)
                      .join(" • ")
                  : "(Chưa chọn)"}
              </div>
            </div>

            {/* Đoạn nguyên lý then chốt */}
            <div className="p-2 sm:p-2.5 rounded-lg bg-[#FFFDF8] border border-[#C4963E]/45 space-y-1 text-[10px] text-[#6B21A8]/90 leading-relaxed">
              <div>
                • <strong className="text-[#14532D]">Dụng nguyên cục và đại vận, giải hình hại phương gọi là Dược.</strong>
              </div>
              <div>
                • Có thể hợp (<em className="text-[#6B21A8] font-semibold">Lục Hợp, Tam Hợp, Tam Hội trừ Thìn - Mão và Dậu - Tuất</em>) Địch hoặc Ngã đều là Dược.
              </div>
              <div className="text-[#78350F] font-semibold flex items-center gap-1 mt-0.5">
                <AlertTriangle className="w-3 h-3 text-[#92400E] shrink-0" />
                <span>Đại vận hoặc Lưu niên coi chừng biến thành độc dược còn gọi là ngoại tà.</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              {/* HÀNG DƯỢC */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[9.5px] sm:text-[10px]">
                  <span className="font-semibold text-[#15803D] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Dược (Có thể chọn nhiều Chi):</span>
                  </span>
                  <span className="text-[#6B21A8]/70 text-[8.5px] sm:text-[9px]">
                    {duocChiList.length > 0
                      ? `Đã chọn: ${duocChiList.map((k) => allPillars.find((p) => p.key === k)?.chi).join(", ")}`
                      : "Chưa chọn"}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1 sm:gap-2">
                  {allPillars.map((b) => {
                    const isSelected = duocChiList.includes(b.key);
                    const chiData = CHI_MAP.get(b.chi);

                    return (
                      <button
                        key={`duoc-van-${b.key}`}
                        type="button"
                        onClick={() => toggleDuoc(b.key)}
                        className={`relative p-1 sm:p-2 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-between min-h-[56px] sm:min-h-[64px] ${
                          isSelected
                            ? "bg-gradient-to-b from-[#FAF6EE] to-[#FFFDF8] border-emerald-400 text-[#14532D] font-bold shadow-md shadow-emerald-500/20 ring-1 ring-emerald-500/60"
                            : b.isDaiVan
                            ? "bg-gradient-to-b from-[#FFFDF8] to-[#FFFDF8] hover:bg-[#FAF6EE] border-purple-400/80 text-[#6B21A8]"
                            : "bg-gradient-to-b from-[#FFFDF8] to-[#FFFDF8] hover:bg-[#FFFDF8] border-[#C4963E]/45 text-[#5C4D3C]"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full px-0.5 pb-0.5 border-b border-[#C4963E]/45">
                          <span
                            className={`text-[8px] sm:text-[9.5px] font-bold truncate ${
                              isSelected ? "text-[#14532D]" : b.isDaiVan ? "text-[#6B21A8]" : "text-[#6E4E16]"
                            }`}
                          >
                            {b.label}
                          </span>
                          {isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center justify-center gap-0.5 sm:gap-1 my-0.5 sm:my-1">
                          <span className="text-xs sm:text-base leading-none">
                            {chiData?.emoji || "⭐"}
                          </span>
                          <span
                            className={`text-xs sm:text-sm font-serif font-bold leading-none ${
                              isSelected ? "text-[#14532D]" : "text-[#1C1813]"
                            }`}
                          >
                            {b.chi}
                          </span>
                          <span className="text-[7.5px] sm:text-[9px] text-[#5C4D3C] font-serif">
                            ({chiData?.chinese || ""})
                          </span>
                        </div>
                        <div className="text-[7px] sm:text-[8px] text-[#5C4D3C] font-mono leading-none truncate max-w-full">
                          {b.subPillar || b.pillar}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* HÀNG BỆNH */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[9.5px] sm:text-[10px]">
                  <span className="font-semibold text-[#991B1B] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    <span>Bệnh (Có thể chọn nhiều Chi):</span>
                  </span>
                  <span className="text-[#6B21A8]/70 text-[8.5px] sm:text-[9px]">
                    {benhChiList.length > 0
                      ? `Đã chọn: ${benhChiList.map((k) => allPillars.find((p) => p.key === k)?.chi).join(", ")}`
                      : "Chưa chọn"}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1 sm:gap-2">
                  {allPillars.map((b) => {
                    const isSelected = benhChiList.includes(b.key);
                    const chiData = CHI_MAP.get(b.chi);

                    return (
                      <button
                        key={`benh-van-${b.key}`}
                        type="button"
                        onClick={() => toggleBenh(b.key)}
                        className={`relative p-1 sm:p-2 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-between min-h-[56px] sm:min-h-[64px] ${
                          isSelected
                            ? "bg-gradient-to-b from-[#FFFDF8] to-[#FFFDF8] border-rose-400 text-[#991B1B] font-bold shadow-md shadow-rose-500/20 ring-1 ring-rose-500/60"
                            : b.isDaiVan
                            ? "bg-gradient-to-b from-[#FFFDF8] to-[#FFFDF8] hover:bg-[#FAF6EE] border-purple-400/80 text-[#6B21A8]"
                            : "bg-gradient-to-b from-[#FFFDF8] to-[#FFFDF8] hover:bg-[#FFFDF8] border-[#C4963E]/45 text-[#5C4D3C]"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full px-0.5 pb-0.5 border-b border-[#C4963E]/45">
                          <span
                            className={`text-[8px] sm:text-[9.5px] font-bold truncate ${
                              isSelected ? "text-[#991B1B]" : b.isDaiVan ? "text-[#6B21A8]" : "text-[#6E4E16]"
                            }`}
                          >
                            {b.label}
                          </span>
                          {isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center justify-center gap-0.5 sm:gap-1 my-0.5 sm:my-1">
                          <span className="text-xs sm:text-base leading-none">
                            {chiData?.emoji || "⭐"}
                          </span>
                          <span
                            className={`text-xs sm:text-sm font-serif font-bold leading-none ${
                              isSelected ? "text-[#991B1B]" : "text-[#1C1813]"
                            }`}
                          >
                            {b.chi}
                          </span>
                          <span className="text-[7.5px] sm:text-[9px] text-[#5C4D3C] font-serif">
                            ({chiData?.chinese || ""})
                          </span>
                        </div>
                        <div className="text-[7px] sm:text-[8px] text-[#5C4D3C] font-mono leading-none truncate max-w-full">
                          {b.subPillar || b.pillar}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* HÀNG NGOẠI TÀ */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[9.5px] sm:text-[10px]">
                  <span className="font-semibold text-[#7E22CE] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    <span>Ngoại Tà (Có thể chọn nhiều Chi):</span>
                  </span>
                  <span className="text-[#6B21A8]/70 text-[8.5px] sm:text-[9px]">
                    {ngoaiTaChiList.length > 0
                      ? `Đã chọn: ${ngoaiTaChiList.map((k) => allPillars.find((p) => p.key === k)?.chi).join(", ")}`
                      : "Chưa chọn"}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1 sm:gap-2">
                  {allPillars.map((b) => {
                    const isSelected = ngoaiTaChiList.includes(b.key);
                    const chiData = CHI_MAP.get(b.chi);

                    return (
                      <button
                        key={`ngoaita-van-${b.key}`}
                        type="button"
                        onClick={() => toggleNgoaiTa(b.key)}
                        className={`relative p-1 sm:p-2 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-between min-h-[56px] sm:min-h-[64px] ${
                          isSelected
                            ? "bg-gradient-to-b from-[#FFFDF8] to-[#FFFDF8] border-purple-400 text-[#6B21A8] font-bold shadow-md shadow-purple-500/20 ring-1 ring-purple-500/60"
                            : b.isDaiVan
                            ? "bg-gradient-to-b from-[#FFFDF8] to-[#FFFDF8] hover:bg-[#FAF6EE] border-purple-400/80 text-[#6B21A8]"
                            : "bg-gradient-to-b from-[#FFFDF8] to-[#FFFDF8] hover:bg-[#FFFDF8] border-[#C4963E]/45 text-[#5C4D3C]"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full px-0.5 pb-0.5 border-b border-[#C4963E]/45">
                          <span
                            className={`text-[8px] sm:text-[9.5px] font-bold truncate ${
                              isSelected ? "text-[#6B21A8]" : b.isDaiVan ? "text-[#6B21A8]" : "text-[#6E4E16]"
                            }`}
                          >
                            {b.label}
                          </span>
                          {isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center justify-center gap-0.5 sm:gap-1 my-0.5 sm:my-1">
                          <span className="text-xs sm:text-base leading-none">
                            {chiData?.emoji || "⭐"}
                          </span>
                          <span
                            className={`text-xs sm:text-sm font-serif font-bold leading-none ${
                              isSelected ? "text-[#6B21A8]" : "text-[#1C1813]"
                            }`}
                          >
                            {b.chi}
                          </span>
                          <span className="text-[7.5px] sm:text-[9px] text-[#5C4D3C] font-serif">
                            ({chiData?.chinese || ""})
                          </span>
                        </div>
                        <div className="text-[7px] sm:text-[8px] text-[#5C4D3C] font-mono leading-none truncate max-w-full">
                          {b.subPillar || b.pillar}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* =================================================================
              BƯỚC 4: NGUYÊN LƯU (ẤN >>> TỶ >>> THỰC >>> TÀI >>> QUAN)
              - Lựa chọn cái nào trước cũng chạy theo cái mũi tên
              - Lục thân gắn ngũ hành phù hợp theo Nhật Can
              ================================================================= */}
          <div className="space-y-3 p-2.5 sm:p-3.5 rounded-xl bg-gradient-to-b from-[#FFFDF8] via-[#FFFDF8] to-[#FFFDF8] border border-[#C4963E]/45 shadow-lg">
            {/* Header Bước 4 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2.5 border-b border-[#C4963E]/45">
              <div className="text-[10.5px] sm:text-[11px] font-bold text-[#6B21A8] flex items-center gap-2 uppercase tracking-wider">
                <span className="w-4 h-4 rounded-full bg-purple-500/20 text-[#6B21A8] flex items-center justify-center text-[10px] font-mono shrink-0">
                  4
                </span>
                <Waves className="w-3.5 h-3.5 text-[#7E22CE] shrink-0" />
                <span>Bước 4: Nguyên Lưu (Ấn &gt;&gt;&gt; Tỷ &gt;&gt;&gt; Thực &gt;&gt;&gt; Tài &gt;&gt;&gt; Quan)</span>
              </div>
              <div className="flex items-center gap-2 text-[9.5px] sm:text-[10px] text-[#6B21A8]/80 font-mono">
                <span>
                  Nhật Can: <strong className="text-[#78350F] font-serif font-bold">{dayCan}</strong> ({dayElement})
                </span>
                <span className="text-purple-600">•</span>
                <span className="text-[#15803D] font-bold">
                  Khởi Điểm: {nguyenLuuStart} ({lucThanDataMap[nguyenLuuStart].element})
                </span>
              </div>
            </div>

            {/* Khung Nguyên Lý & Lục Thân Gắn Ngũ Hành */}
            <div className="p-2 sm:p-2.5 rounded-lg bg-[#FFFDF8] border border-[#C4963E]/45 space-y-1.5 text-[10px] leading-relaxed">
              <div className="text-[#5C4D3C]">
                • <strong className="text-[#6B21A8]">Nguyên Lưu (源流):</strong> Là chu trình tương sinh khép kín của ngũ hành và thập thần trong mệnh cục Bát Tự theo nguyên lý: <span className="text-[#78350F] font-mono font-bold">Ấn &gt;&gt;&gt; Tỷ &gt;&gt;&gt; Thực &gt;&gt;&gt; Tài &gt;&gt;&gt; Quan &gt;&gt;&gt; Ấn</span>.
              </div>
              <div className="text-[#5C4D3C]">
                • <strong className="text-[#1E3A8A]">Quy tắc chạy theo mũi tên:</strong> Bạn có thể chọn bất kỳ Lục Thân nào làm điểm khởi nguồn; chuỗi nguyên lưu sẽ tự động chạy tuần hoàn theo chiều mũi tên tương sinh <span className="text-[#92400E] font-mono font-bold">&gt;&gt;&gt;</span> từ chữ đó.
              </div>
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[9px] sm:text-[9.5px]">
                <span className="text-[#6B21A8]/70 font-semibold">Ngũ hành gắn theo Nhật Can ({dayCan} {dayElement}):</span>
                {LUC_THAN_CYCLE.map((type) => {
                  const info = lucThanDataMap[type];
                  const theme = getLucThanElementTheme(info.element);
                  return (
                    <span
                      key={`badge-van-top-${type}`}
                      className={`px-1.5 py-0.5 rounded border font-medium flex items-center gap-1 ${theme.badgeBg}`}
                    >
                      <span className="font-bold">{type}:</span>
                      <span>{info.element}</span>
                      <span>{info.elementEmoji}</span>
                    </span>
                  );
                })}
              </div>
            </div>

            {/* BỘ NÚT CHỌN LỤC THÂN KHỞI ĐIỂM (CHỌN CÁI NÀO TRƯỚC CŨNG CHẠY THEO MŨI TÊN) */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[9.5px] sm:text-[10px]">
                <span className="font-semibold text-[#6B21A8] flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#7E22CE]" />
                  <span>Chọn Lục Thân Khởi Điểm (Bấm cái nào chuỗi sẽ chạy theo mũi tên từ đó):</span>
                </span>
                <span className="text-[#6B21A8]/70 text-[8.5px] sm:text-[9px]">
                  Đang khởi phát từ: <strong className="text-[#78350F]">{nguyenLuuStart}</strong>
                </span>
              </div>

              {/* 5 Nút Lục Thân lớn có gắn ngũ hành chuẩn */}
              <div className="grid grid-cols-5 gap-1 sm:gap-2">
                {LUC_THAN_CYCLE.map((type) => {
                  const info = lucThanDataMap[type];
                  const theme = getLucThanElementTheme(info.element);
                  const isSelected = nguyenLuuStart === type;

                  return (
                    <button
                      key={`btn-van-luc-than-${type}`}
                      type="button"
                      onClick={() => setNguyenLuuStart(type)}
                      className={`relative p-1.5 sm:p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between min-h-[64px] sm:min-h-[72px] bg-gradient-to-b ${theme.cardBg} ${
                        isSelected
                          ? `${theme.activeRing} shadow-lg font-bold scale-[1.02]`
                          : `${theme.border} hover:border-purple-400/80 hover:bg-[#FFFDF8] opacity-85 hover:opacity-100`
                      }`}
                    >
                      {/* Huy hiệu khởi điểm */}
                      <div className="flex items-center justify-between w-full px-0.5 pb-0.5 border-b border-[#C4963E]/45">
                        <span className={`text-[8.5px] sm:text-[9.5px] font-bold ${isSelected ? "text-[#78350F]" : "text-[#6E4E16]"}`}>
                          {isSelected ? "★ Khởi Đầu" : "Lục Thân"}
                        </span>
                        <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`} />
                      </div>

                      {/* Tên Lục Thân & Ngũ hành */}
                      <div className="my-0.5 sm:my-1 flex flex-col items-center justify-center">
                        <span className={`text-sm sm:text-base font-serif font-black leading-none ${theme.text}`}>
                          {type}
                        </span>
                        <div className="flex items-center gap-0.5 mt-0.5 text-[8.5px] sm:text-[9px] text-[#5C4D3C]">
                          <span>{info.element}</span>
                          <span>{info.elementEmoji}</span>
                        </div>
                      </div>

                      {/* Chi tiết ngắn */}
                      <div className="text-[7.5px] sm:text-[8px] text-[#5C4D3C] truncate w-full">
                        ➔ Sinh {info.generates}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Hàng chọn nhanh cả chuỗi mũi tên hoàn chỉnh */}
              <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-none py-1">
                <span className="text-[8.5px] sm:text-[9px] text-[#6B21A8]/70 whitespace-nowrap shrink-0">
                  Chuỗi nhanh:
                </span>
                {LUC_THAN_CYCLE.map((type) => {
                  const isSelected = nguyenLuuStart === type;
                  const startIdx = LUC_THAN_CYCLE.indexOf(type);
                  const labels = [
                    LUC_THAN_CYCLE[startIdx],
                    LUC_THAN_CYCLE[(startIdx + 1) % 5],
                    LUC_THAN_CYCLE[(startIdx + 2) % 5],
                    LUC_THAN_CYCLE[(startIdx + 3) % 5],
                    LUC_THAN_CYCLE[(startIdx + 4) % 5],
                  ];
                  return (
                    <button
                      key={`quick-van-seq-${type}`}
                      type="button"
                      onClick={() => setNguyenLuuStart(type)}
                      className={`px-2 py-0.5 rounded-md text-[9px] sm:text-[9.5px] font-mono whitespace-nowrap border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#F3E8FF] border-purple-400 text-[#6B21A8] font-bold ring-1 ring-purple-500/50"
                          : "bg-[#FFFDF8] hover:bg-[#FFFDF8] border-[#C4963E]/45 text-[#6B21A8]/80"
                      }`}
                    >
                      {labels.join(" ❯ ")}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TRÌNH DIỄN DÒNG CHẢY NGUYÊN LƯU VỚI CÁC MŨI TÊN >>> */}
            <div className="p-2 sm:p-3 rounded-xl bg-[#FFFDF8] border border-[#C4963E]/45 space-y-2.5">
              <div className="flex items-center justify-between text-[10px]">
                <div className="font-bold text-[#6B21A8] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Dòng Chảy Nguyên Lưu Khởi Phát Từ: <strong className="text-[#78350F] font-serif text-xs">{nguyenLuuStart} ({lucThanDataMap[nguyenLuuStart].element})</strong></span>
                </div>
                <div className="text-[9px] text-[#6B21A8]/70 font-mono">
                  (Bấm vào bất kỳ thẻ nào để đổi điểm xuất phát)
                </div>
              </div>

              {/* 5 THẺ CHẠY THEO MŨI TÊN >>> */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-1.5 sm:gap-1 items-stretch">
                {nguyenLuuSequence.map((item, idx) => {
                  const theme = getLucThanElementTheme(item.element);
                  const isFirst = idx === 0;

                  return (
                    <React.Fragment key={`seq-van-card-${item.type}-${idx}`}>
                      <div
                        onClick={() => setNguyenLuuStart(item.type)}
                        className={`relative p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between bg-gradient-to-b ${theme.cardBg} ${
                          isFirst
                            ? `${theme.activeRing} shadow-md shadow-purple-500/20`
                            : `${theme.border} hover:border-purple-400/70 hover:scale-[1.01]`
                        }`}
                      >
                        {/* Header của từng bước */}
                        <div className="flex items-center justify-between pb-1 border-b border-[#C4963E]/45">
                          <span className={`text-[8.5px] sm:text-[9px] font-bold font-mono ${isFirst ? "text-[#78350F]" : "text-[#5C4D3C]"}`}>
                            {isFirst ? "1. Khởi Điểm" : `${idx + 1}. Lưu Chuyển`}
                          </span>
                          <span className={`text-[8px] sm:text-[8.5px] px-1 py-0.2 rounded border font-semibold ${theme.badgeBg}`}>
                            {item.element} {item.elementEmoji}
                          </span>
                        </div>

                        {/* Tiêu đề Lục Thân to rõ */}
                        <div className="my-1.5 text-center">
                          <div className={`text-base sm:text-lg font-serif font-black leading-tight ${theme.text}`}>
                            {item.type}
                          </div>
                          <div className="text-[8.5px] sm:text-[9px] text-[#6E4E16] font-serif truncate mt-0.5">
                            {item.fullName}
                          </div>
                        </div>

                        {/* Chi tiết quan hệ sinh và thống kê trong tứ trụ */}
                        <div className="space-y-1 pt-1 border-t border-[#C4963E]/45 text-[8px] sm:text-[8.5px]">
                          <div className="text-[#5C4D3C] flex items-center justify-between">
                            <span>Quan hệ sinh:</span>
                            <span className="font-semibold text-[#78350F]">➔ {item.generates}</span>
                          </div>
                          <div className="text-[#5C4D3C] truncate" title={`Can: ${item.typicalCan} | Chi: ${item.typicalChi}`}>
                            {item.typicalCan} • {item.typicalChi}
                          </div>
                          <div className="pt-0.5 flex items-center justify-between border-t border-[#C4963E]/45">
                            <span className="text-[#5C4D3C]">Nguyên cục + Vận:</span>
                            {item.countInChart > 0 ? (
                              <span className="text-[#15803D] font-bold font-mono">
                                {item.countInChart} chữ (Thông)
                              </span>
                            ) : (
                              <span className="text-[#92400E]/80 font-mono">
                                0 chữ (Khuyết)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Biểu tượng mũi tên phân tách trên màn hình mobile */}
                        <div className="sm:hidden flex items-center justify-center pt-1 text-[#92400E]/80 font-mono text-xs">
                          {idx < 4 ? "▼" : "🔄 Vòng Lặp Lại Ấn Tinh"}
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Dải mũi tên tuần hoàn khép kín >>> trên màn hình máy tính */}
              <div className="hidden sm:flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#FFFDF8] border border-[#C4963E]/45 text-[9.5px] font-mono">
                <span className="text-[#6B21A8] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  <span>Dòng Sinh Khép Kín:</span>
                </span>
                <div className="flex items-center gap-1.5 text-[#78350F] font-bold">
                  {nguyenLuuSequence.map((item, idx) => (
                    <React.Fragment key={`inline-van-flow-${item.type}-${idx}`}>
                      <span className={idx === 0 ? "text-[#78350F] underline font-black" : "text-[#5C4D3C]"}>
                        {item.type} ({item.element})
                      </span>
                      {idx < 4 ? (
                        <span className="text-[#92400E] font-mono font-black">&gt;&gt;&gt;</span>
                      ) : (
                        <span className="text-[#15803D] font-mono font-black">&gt;&gt;&gt; (Tuần Hoàn ↺)</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* LUẬN GIẢI Ý NGHĨA MỆNH LÝ & ĐÁNH GIÁ ĐỘ LƯU THÔNG CỦA NGUYÊN LƯU */}
            <div className="p-2 sm:p-2.5 rounded-lg bg-[#FFFDF8] border border-[#C4963E]/45 space-y-1.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1 border-b border-[#C4963E]/45">
                <div className="font-serif font-bold text-xs sm:text-[13px] text-[#78350F]">
                  {nguyenLuuInterpretation.title}
                </div>
                <div className="text-[9px] sm:text-[9.5px] text-[#15803D] font-mono font-bold">
                  {nguyenLuuInterpretation.summary}
                </div>
              </div>
              <p className="text-[10px] sm:text-[10.5px] text-[#5C4D3C] leading-relaxed">
                {nguyenLuuInterpretation.detail}
              </p>

              {/* Đánh giá độ thông suốt trong lá số */}
              <div className="mt-1.5 pt-1.5 border-t border-[#C4963E]/45 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[9.5px]">
                <div className="text-[#6B21A8]/70 flex items-center gap-1">
                  <span>Khảo sát lưu thông ngũ hành:</span>
                  <span className="text-[#1C1813] font-medium">
                    {nguyenLuuSequence.filter((i) => i.countInChart > 0).length}/5 mắt xích hiện diện (Tứ Trụ + Đại Vận)
                  </span>
                </div>
                <div className="text-[9px] text-[#5C4D3C]">
                  {nguyenLuuSequence.every((i) => i.countInChart > 0) ? (
                    <span className="text-[#15803D] font-bold">
                      ✓ Nguyên lưu chu lưu thông suốt không bị gián đoạn.
                    </span>
                  ) : (
                    <span className="text-[#92400E]">
                      ⚠ Có mắt xích chưa hiển lộ, cần thêm Lưu Niên bổ cứu để thông dòng.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
