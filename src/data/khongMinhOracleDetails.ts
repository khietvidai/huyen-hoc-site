/**
 * Dữ liệu chi tiết 384 Quẻ xăm Khổng Minh (Khổng Minh Thần Toán Gia Kinh Dịch)
 * Trích xuất chuẩn xác 384/384 quẻ xăm chiều thuận (không sử dụng phiên bản đảo ngược 180 độ):
 * - Loại xăm chuẩn theo sách
 * - Bài thơ Hán tự, Âm Hán Việt chuẩn & Dịch thơ / Diễn xuôi
 * - Giải nghĩa chi tiết từng câu thơ (Nghĩa đen & Hàm ý)
 * - Ý nghĩa quẻ xăm (Luận giải chi tiết & Tượng số)
 * - Lời khuyên hành xử (Nên làm, Tránh làm, Thái độ cần có)
 */

import rawOracles384 from "./khongMinhOracles384.json";

export interface KhongMinhLineDetail {
  lineTitle: string;
  literalMeaning: string; // Nghĩa đen
  implication: string; // Hàm ý
}

export interface KhongMinhInvertedDetail {
  poemHanzi: string;
  poemHaniViet: string;
  poemMeaning: string;
  detailedExplanation: string;
  symbolicFigure: string;
  actionAdvice: string;
}

export interface KhongMinhOracleComprehensive {
  oracleNum: number;
  formattedNum: string; // e.g. "001"
  oracleType: string; // e.g. "Thượng Thượng (Đại Cát)"
  poemHanzi: string;
  poemHaniViet: string;
  poemMeaning: string; // Dịch thơ / Diễn xuôi
  lineExplanations: KhongMinhLineDetail[];
  overallMeaning: {
    detailedExplanation: string; // Luận giải chi tiết
    symbolicFigure: string; // Tượng số
  };
  actionGuidance: {
    doList: string; // Nên làm
    avoidList: string; // Tránh làm
    attitude: string; // Thái độ cần có
  };
  invertedVersion?: KhongMinhInvertedDetail;
}

interface RawOracle384Item {
  oracleNum: number;
  oracleType: string;
  poemHanzi: string;
  poemHaniViet: string;
  poemMeaning: string;
  lineExplanations: KhongMinhLineDetail[];
  detailedExplanation: string;
  doList: string;
  avoidList: string;
  attitude: string;
  symbolicFigure: string;
}

const RAW_ORACLES_MAP = rawOracles384 as unknown as Record<string, RawOracle384Item>;

export const KHONG_MINH_ORACLE_DETAILS: Record<number, KhongMinhOracleComprehensive> = {};

for (const [key, item] of Object.entries(RAW_ORACLES_MAP)) {
  const num = Number(key) || item.oracleNum;
  KHONG_MINH_ORACLE_DETAILS[num] = {
    oracleNum: num,
    formattedNum: String(num).padStart(3, "0"),
    oracleType: item.oracleType,
    poemHanzi: item.poemHanzi,
    poemHaniViet: item.poemHaniViet,
    poemMeaning: item.poemMeaning,
    lineExplanations: item.lineExplanations || [],
    overallMeaning: {
      detailedExplanation: item.detailedExplanation,
      symbolicFigure: item.symbolicFigure,
    },
    actionGuidance: {
      doList: item.doList,
      avoidList: item.avoidList,
      attitude: item.attitude,
    },
  };
}

/**
 * Kiểm tra xem Quẻ Khổng Minh thuộc nhóm HUNG (Bất lợi / Xấu) hay CÁT / BÌNH
 * - Nhóm HUNG: Hạ Hạ, Hạ Trung, Trung Hạ, Hạ Hung, hoặc có chú thích Hung / Bất Cát / Bất Lợi
 * - Nhóm CÁT / THUẬN: Thượng Thượng, Thượng Cát, Trung Cát, Hạ Cát, Trung Bình, Bình Bình
 */
export function isKhongMinhOracleHung(oracleType: string): boolean {
  const lower = (oracleType || "").toLowerCase();
  if (lower.includes("hạ cát")) {
    return false;
  }
  return (
    lower.includes("hung") ||
    lower.includes("hạ hạ") ||
    lower.includes("hạ trung") ||
    lower.includes("trung hạ") ||
    lower.includes("bất cát") ||
    lower.includes("bất lợi")
  );
}

/**
 * Lấy chi tiết toàn diện của Quẻ xăm Khổng Minh (chuẩn hóa đủ 384/384 quẻ từ sách)
 */
export const getKhongMinhComprehensive = (
  oracleNum: number,
  fallbackLineItem?: any,
  canonicalYao?: any,
  _hexName?: string
): KhongMinhOracleComprehensive => {
  const clamped = oracleNum >= 1 && oracleNum <= 384 ? oracleNum : 1;
  const exact = KHONG_MINH_ORACLE_DETAILS[clamped];
  if (exact) {
    return exact;
  }

  const formattedNum = String(clamped).padStart(3, "0");
  const poemHanzi = fallbackLineItem?.oracleHanzi || "";
  const poemHaniViet = fallbackLineItem?.oracleText || "";
  const poemMeaning = fallbackLineItem?.oracleMeaning || "";
  const oracleType = "Trung Bình";

  return {
    oracleNum: clamped,
    formattedNum,
    oracleType,
    poemHanzi,
    poemHaniViet,
    poemMeaning,
    lineExplanations: [],
    overallMeaning: {
      detailedExplanation: poemMeaning,
      symbolicFigure: fallbackLineItem?.tuongHao || "",
    },
    actionGuidance: {
      doList: canonicalYao?.favorableAction || "",
      avoidList: canonicalYao?.unfavorableAction || "",
      attitude: "Bình tĩnh, cẩn trọng, hành xử trung chính tùy thời.",
    },
  };
};
