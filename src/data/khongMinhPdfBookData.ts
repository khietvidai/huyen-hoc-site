import rawPdfBookData from "./khongMinhPdfBookData.json";

export interface KhongMinhPdfLineData {
  line: number; // 1..6
  lineName: string; // e.g. "Cửu Nhị", "Sơ Lục"
  haoVi: string; // e.g. "Cửu Nhị (Hào 2)"
  tuongYHanViet: string; // e.g. "Hiện long tại điền chi tượng, Đắc phùng quý nhân chi ý."
  tuongYMeaning: string; // Giải nghĩa ngắn Tượng & Ý
  haoTu: string; // Nguyên văn Hán Việt & Dịch nghĩa theo sách (Cột 2)
  tieuTuongQuote: string; // Câu trích Tiểu tượng truyện (Cột 3)
  tieuTuongNghia: string; // Nghĩa là: ... (Giải nghĩa chi tiết Tiểu tượng truyện, Cột 3)
  goiYNhacNho: string; // Gợi ý / Nhắc nhở theo sách (Cột 4)
  oracleNum: number; // 1..384
  poemHaniViet: string; // Bài thơ Khổng Minh âm Hán Việt chuẩn theo sách
}

export interface KhongMinhPdfHexagramData {
  orderIndex: number; // 1..64 theo thứ tự Bát Cung trong sách
  kingWenNumber: number; // 1..64 theo thứ tự Chu Dịch Văn Vương
  pdfHexName: string; // Tên quẻ trong sách (vd: "Thiên Vi Càn", "Trạch Phong Đại Quá")
  tuongYHanViet: string; // Tượng & Ý toàn quẻ (Hán Việt)
  tuongYMeaning: string; // Dịch nghĩa Tượng & Ý toàn quẻ
  lines: Record<string, KhongMinhPdfLineData>;
}

export const KHONG_MINH_PDF_BOOK_DATA: Record<string, KhongMinhPdfHexagramData> =
  rawPdfBookData as unknown as Record<string, KhongMinhPdfHexagramData>;

export function getKhongMinhPdfHexagram(kingWenNumber: number): KhongMinhPdfHexagramData | undefined {
  return KHONG_MINH_PDF_BOOK_DATA[String(kingWenNumber)];
}

export function getKhongMinhPdfLine(
  kingWenNumber: number,
  lineNum: number
): KhongMinhPdfLineData | undefined {
  const hex = KHONG_MINH_PDF_BOOK_DATA[String(kingWenNumber)];
  if (!hex) return undefined;
  return hex.lines[String(lineNum)];
}
