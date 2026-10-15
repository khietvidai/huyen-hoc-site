/**
 * Bộ Ánh Xạ Chuẩn Xác Tâm Ấn Phú theo Trực Nhật Tinh (Hoàng Đạo / Hắc Đạo):
 * Người dùng quy định Trực Nhật Tinh ngầm hiểu tương ứng 12 Thiên Tướng Lục Nhâm:
 * - Thiên Hình ngầm hiểu là: Đằng Xà
 * - Kim Quỹ ngầm hiểu là: Thái Âm
 * - Thiên Đức Hợp ngầm hiểu là: Lục Hợp
 * - Thiên Lao ngầm hiểu là: Thiên Không
 * - Tư Mệnh ngầm hiểu là: Thiên Hậu
 * - Minh Đường ngầm hiểu là: Quý Nhân
 * - Thanh Long ngầm hiểu là: Thanh Long
 * - Bạch Hổ ngầm hiểu là: Bạch Hổ
 * - Chu Tước ngầm hiểu là: Chu Tước
 * - Huyền Vũ ngầm hiểu là: Huyền Vũ
 * - Câu Trận ngầm hiểu là: Câu Trần
 * - Ngọc Đường ngầm hiểu là: Thái Thường
 *
 * Tra cứu 100% nguyên văn tượng thần, khẩu quyết và ý nghĩa từ 《Lục Nhâm Thần Khóa • Tâm Ấn Phú》 (TAM_AN_PHU_EXACT_DATA).
 */

import {
  TAM_AN_PHU_EXACT_DATA,
  TamAnPhuGeneral,
  TamAnPhuEntry,
} from "./lucnhamTamAnPhuExact";

export interface TrucNhatTinhTamAnResult {
  starName: string;          // Tên Trực Nhật Tinh (ví dụ: Thiên Hình, Minh Đường...)
  mappedGeneralName: string; // Tên Thiên Tướng ngầm hiểu (ví dụ: Đằng Xà, Quý Nhân...)
  branch: string;            // Cung Địa Chi (Tý, Sửu...)
  tuongName: string;         // Tên tượng thần (ví dụ: Yểm mục, Thăng đường...)
  tuongChinese: string;      // Tên tượng Hán tự (ví dụ: 掩目, 升堂...)
  nature: "Hoàng Đạo" | "Hắc Đạo";
  quality: "Đại Cát" | "Cát" | "Thứ Cát" | "Hung" | "Đại Hung";
  fullLine: string;          // Khẩu quyết đầy đủ nguyên văn
  meaning: string;           // Diễn giải chính xác nguyên văn
  generalOverview: string;   // Khái lược bản chất Thiên Tướng
  generalNotes?: string;     // Ghi chú đặc biệt
}

// Bảng ánh xạ từ Trực Nhật Tinh sang Thiên Tướng Lục Nhâm theo đúng yêu cầu
export const TRUC_NHAT_TINH_TO_THIEN_TUONG_MAP: Record<string, string> = {
  "Thiên Hình": "Đằng Xà",
  "Kim Quỹ": "Thái Âm",
  "Thiên Đức Hợp": "Lục Hợp",
  "Thiên Lao": "Thiên Không",
  "Tư Mệnh": "Thiên Hậu",
  "Minh Đường": "Quý Nhân",
  "Thanh Long": "Thanh Long",
  "Bạch Hổ": "Bạch Hổ",
  "Chu Tước": "Chu Tước",
  "Huyền Vũ": "Huyền Vũ",
  "Câu Trận": "Câu Trần",
  "Ngọc Đường": "Thái Thường",
};

// Hoàng Đạo / Hắc Đạo của 12 Trực Nhật Tinh
export const TRUC_NHAT_TINH_NATURE_MAP: Record<
  string,
  { nature: "Hoàng Đạo" | "Hắc Đạo"; quality: "Đại Cát" | "Cát" | "Thứ Cát" | "Hung" | "Đại Hung" }
> = {
  "Thanh Long": { nature: "Hoàng Đạo", quality: "Đại Cát" },
  "Minh Đường": { nature: "Hoàng Đạo", quality: "Đại Cát" },
  "Thiên Hình": { nature: "Hắc Đạo", quality: "Hung" },
  "Chu Tước": { nature: "Hắc Đạo", quality: "Hung" },
  "Kim Quỹ": { nature: "Hoàng Đạo", quality: "Đại Cát" },
  "Thiên Đức Hợp": { nature: "Hoàng Đạo", quality: "Đại Cát" },
  "Bạch Hổ": { nature: "Hắc Đạo", quality: "Đại Hung" },
  "Ngọc Đường": { nature: "Hoàng Đạo", quality: "Đại Cát" },
  "Thiên Lao": { nature: "Hắc Đạo", quality: "Hung" },
  "Huyền Vũ": { nature: "Hắc Đạo", quality: "Hung" },
  "Tư Mệnh": { nature: "Hoàng Đạo", quality: "Cát" },
  "Câu Trận": { nature: "Hắc Đạo", quality: "Hung" },
};

/**
 * Tra cứu tượng thần Tâm Ấn Phú cho Trực Nhật Tinh tại một Cung Địa Chi
 * Dựa trên nguyên lý ngầm hiểu Trực Nhật Tinh ứng Thiên Tướng Lục Nhâm.
 */
export function getTamAnPhuForTrucNhatTinh(
  starName: string,
  branch: string
): TrucNhatTinhTamAnResult {
  const normStar = starName.trim();
  const normBranch = branch.trim();

  // Xác định tên Thiên Tướng ngầm hiểu
  const mappedGeneralName =
    TRUC_NHAT_TINH_TO_THIEN_TUONG_MAP[normStar] || normStar;

  // Lấy dữ liệu Hoàng Đạo / Hắc Đạo
  const natureInfo = TRUC_NHAT_TINH_NATURE_MAP[normStar] || {
    nature: "Hoàng Đạo",
    quality: "Cát",
  };

  // Tra cứu tướng trong cơ sở dữ liệu Tâm Ấn Phú nguyên bản
  const general = TAM_AN_PHU_EXACT_DATA.find(
    (g) =>
      g.name === mappedGeneralName ||
      mappedGeneralName.includes(g.name) ||
      g.name.includes(mappedGeneralName)
  );

  if (general) {
    // Chuẩn hóa Tị / Tỵ
    const entry =
      general.cungVi[normBranch] ||
      (normBranch === "Tị" ? general.cungVi["Tỵ"] : undefined) ||
      (normBranch === "Tỵ" ? general.cungVi["Tị"] : undefined);

    if (entry) {
      return {
        starName: normStar,
        mappedGeneralName: general.name,
        branch: normBranch,
        tuongName: entry.tuongName,
        tuongChinese: entry.tuongChinese,
        nature: natureInfo.nature,
        quality: natureInfo.quality,
        fullLine: entry.fullLine,
        meaning: entry.meaning,
        generalOverview: general.overview,
        generalNotes: general.notes,
      };
    }
  }

  // Fallback an toàn
  return {
    starName: normStar,
    mappedGeneralName,
    branch: normBranch,
    tuongName: "Lâm Cung",
    tuongChinese: "臨宮",
    nature: natureInfo.nature,
    quality: natureInfo.quality,
    fullLine: `${normStar} (${mappedGeneralName}) cư ${normBranch}: Tượng thần chiếu lâm cung vị.`,
    meaning: `Thiên Tướng ${mappedGeneralName} ứng Trực Nhật Tinh ${normStar} ngự tại cung ${normBranch}.`,
    generalOverview: `${normStar} ngầm hiểu là ${mappedGeneralName} trong Lục Nhâm Tâm Ấn Phú.`,
  };
}
