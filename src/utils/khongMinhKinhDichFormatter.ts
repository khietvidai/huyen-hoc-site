import { Hexagram } from "../types";
import { findHexagramByLines } from "../data/hexagrams";
import { getCanonicalHexagram, CanonicalHexagram } from "../data/canonical";
import { getKhongMinhForHexagram, KhongMinhHexagramBridge } from "../data/khongMinhBridgeData";
import { BOOK_HEXAGRAMS, BookHexagramSummary } from "../data/bookHexagrams";
import { XIANGZHUAN_DATA } from "../data/xiangzhuanData";
import {
  getKhongMinhComprehensive,
  KhongMinhOracleComprehensive,
  KhongMinhLineDetail,
  isKhongMinhOracleHung,
} from "../data/khongMinhOracleDetails";
import { getKhongMinhPdfHexagram, getKhongMinhPdfLine } from "../data/khongMinhPdfBookData";
import { getMovingLineComprehensiveAnalysis } from "../data/ichingAuxiliaryAnalysis";

export interface KhongMinhLineStatus {
  line: number; // 6 down to 1
  polarity: "dương" | "âm";
  isMoving: boolean;
  statusText: string; // Chỉ xét Đắc vị / Thất vị / Đắc trung tại hào động theo sách (các hào tĩnh ghi [Hào tĩnh])
  displayText: string;
}

export interface KhongMinhAuxBlockItem {
  name: string;
  pdfHexName: string;
  hanzi: string;
  tuongYMeaning: string;
  tuongYHanViet: string;
  lineNum: number;
  haoVi: string;
  hanViet: string;
  loiDich: string;
  haoTuSach: string;
  loiHaoCotLoi: string;
  tieuTuong: string;
  tieuTuongNghia: string;
  goiYNhacNho: string;
  apDung: string;
  nghiaLy: string;
  tuongSo: string;
}

export interface KhongMinhKinhDichResult {
  linesStatus: KhongMinhLineStatus[]; // Index 0 is line 6, down to index 5 which is line 1
  activeLine: number;
  findingMethodText: string;

  // Quẻ Chính Block
  primaryBlock: {
    pdfHexName: string;
    hexNameWithHanzi: string;
    tuongYMeaning: string;
    tuongYHanViet: string;
    trichNghiaLuanGiai: string;
    daiTuong: string;
    vanThe: string;
    activeLineBlock: {
      lineNum: number;
      lineName: string;
      haoVi: string;
      hanViet: string;
      loiDich: string;
      phanDinhViThe: string;
      daoTrungChinh: string;
      haoTuSach: string;
      loiHaoCotLoi: string;
      tieuTuong: string;
      tieuTuongNghia: string;
      goiYNhacNho: string;
      nghiaLy: string;
      tuongSo: string;
      viTri: string;
      hanhDongThuan: string;
      saiLamCanTranh: string;
      hanhDongNguoc: string;
    };
  };

  // 3 Quẻ Phụ Block (Tông - Hỗ - Thác, giữ nguyên vị trí hào động n theo sách)
  auxiliaryBlocks: {
    queTong: KhongMinhAuxBlockItem;
    queHo: KhongMinhAuxBlockItem;
    queThac: KhongMinhAuxBlockItem;
  };

  // Trích Quẻ Khổng Minh Thần Toán Block (Chiều Thuận)
  oracleBlock: {
    oracleNum: number;
    formattedNum: string;
    hexName: string;
    activeLine: number;
    oracleType: string;
    isHung: boolean;
    actionPrincipleRule: string;
    appliedKinhDichAction: string;
    avoidedKinhDichAction: string;
    poemHanzi: string;
    poemHaniViet: string;
    poemMeaning: string;
    lineExplanations: KhongMinhLineDetail[];
    detailedExplanation: string;
    oracleDoList: string;
    oracleAvoidList: string;
    doList: string;
    avoidList: string;
    attitude: string;
    symbolicFigure: string;
  };

  actionPrincipleBannerText: string;

  // Toàn văn dữ liệu chuẩn theo sách "Khổng Minh Thần Toán Gia Kinh Dịch"
  plainText: string;
}

/**
 * Tính toán trạng thái Đắc vị / Thất vị và Đắc trung cho hào động (1..6)
 * Theo sách "Khổng Minh Thần Toán Gia Kinh Dịch" (Trang 8–9):
 * - Ngôi lẻ (1, 3, 5) là ngôi Dương; ngôi chẵn (2, 4, 6) là ngôi Âm.
 * - Dương ở ngôi Dương hoặc Âm ở ngôi Âm là Đắc vị (Chính); ngược lại là Thất vị (Bất chính).
 * - Hào 2 (trung tâm hạ quái) và Hào 5 (trung tâm thượng quái) là Đắc trung ("Trung" được đánh giá cao hơn "Chính").
 * - Chỉ căn cứ vào duy nhất HÀO ĐỘNG để xét Đắc vị / Thất vị / Đắc trung.
 */
export function getLinePositionStatus(
  lineNum: number,
  polarityVal: number // 1: Dương, 0: Âm
): {
  viThe: "Đắc vị" | "Thất vị";
  viTheChiTiet: string;
  daoTrungChinh: string;
  statusTag: string;
} {
  const isOdd = lineNum % 2 !== 0;
  const isYang = polarityVal === 1;

  const isDacVi = (isYang && isOdd) || (!isYang && !isOdd);
  const viThe: "Đắc vị" | "Thất vị" = isDacVi ? "Đắc vị" : "Thất vị";

  const viTheChiTiet = isYang
    ? isOdd
      ? `Hào Dương ở ngôi Dương (ngôi lẻ ${lineNum}) — Đắc vị (Chính vị, cương kiện đúng chỗ)`
      : `Hào Dương ở ngôi Âm (ngôi chẵn ${lineNum}) — Thất vị (Bất chính vị, dương cương ở ngôi nhu, cần tiết chế linh hoạt)`
    : isOdd
    ? `Hào Âm ở ngôi Dương (ngôi lẻ ${lineNum}) — Thất vị (Bất chính vị, âm nhu ở ngôi cương, lực chưa tương xứng vị trí)`
    : `Hào Âm ở ngôi Âm (ngôi chẵn ${lineNum}) — Đắc vị (Chính vị, nhu thuận đúng mực)`;

  let daoTrungChinh = "Không cư trung vị (xét trọng tâm theo Đắc vị / Thất vị của hào động)";
  let statusTag = `[${viThe}]`;

  if (lineNum === 2) {
    if (isYang) {
      daoTrungChinh =
        "Đắc trung nhưng Thất vị (Cư trung tâm hạ quái — theo Kinh Dịch, đức 'Trung' được đánh giá cao hơn 'Chính', biết giữ đạo trung dung nên chuyển hóa thuận lợi)";
      statusTag = "[Thất vị • Đắc trung hạ quái]";
    } else {
      daoTrungChinh =
        "Vừa Đắc trung vừa Đắc vị (Trung chính trọn vẹn tại trung tâm hạ quái — cát tường, vững vàng)";
      statusTag = "[Đắc vị • Đắc trung đắc chính]";
    }
  } else if (lineNum === 5) {
    if (isYang) {
      daoTrungChinh =
        "Vừa Đắc trung vừa Đắc vị (Cửu Ngũ chí tôn trung chính tại trung tâm thượng quái — đại cát, đắc thời đắc thế)";
      statusTag = "[Đắc vị • Đắc trung đắc chính]";
    } else {
      daoTrungChinh =
        "Đắc trung nhưng Thất vị (Cư trung tâm thượng quái — theo Kinh Dịch, đức 'Trung' quý hơn 'Chính', lấy đức khiêm nhu trung dung mà cảm hóa đại cuộc)";
      statusTag = "[Thất vị • Đắc trung thượng quái]";
    }
  }

  return { viThe, viTheChiTiet, daoTrungChinh, statusTag };
}

function buildAuxBlockItem(
  auxHex: Hexagram,
  activeLine: number,
  auxAnalysisItem: { apDung: string; nghiaLy: string; tuongSo: string }
): KhongMinhAuxBlockItem {
  const pdfHex = getKhongMinhPdfHexagram(auxHex.number);
  const pdfLine = getKhongMinhPdfLine(auxHex.number, activeLine);
  const canonicalAux = getCanonicalHexagram(auxHex.number);
  const bookAux = BOOK_HEXAGRAMS.find((b) => b.number === auxHex.number);
  const kmAux = getKhongMinhForHexagram(auxHex.number);
  const xzAux = XIANGZHUAN_DATA[auxHex.number];

  const auxYao = canonicalAux?.lines?.[activeLine - 1];
  const kmAuxLine = kmAux?.lines?.[activeLine - 1];
  const xzAuxLine = xzAux?.xiaoxiang?.[activeLine - 1];

  const hanzi = auxHex.hanzi || canonicalAux?.hanzi || "";
  const pdfHexName = pdfHex?.pdfHexName || auxHex.name;
  const displayName = `${pdfHexName}${hanzi ? ` (${hanzi})` : ""}`;

  const tuongYHanViet =
    pdfHex?.tuongYHanViet ||
    (bookAux?.poemHan ? bookAux.poemHan.replace(/\n/g, " ") : `${kmAux?.tuongQue || ""}, ${kmAux?.yQue || ""}.`);
  const tuongYMeaning =
    bookAux?.poemMeaning || pdfHex?.tuongYMeaning || `${kmAux?.tuongQueMeaning || ""}, ${kmAux?.yQueMeaning || ""}`;

  const haoVi = pdfLine?.haoVi || `${auxYao?.name || `Hào ${activeLine}`} (Hào ${activeLine})`;
  const hanViet =
    pdfLine?.tuongYHanViet || (kmAuxLine ? `${kmAuxLine.tuongHao}, ${kmAuxLine.yHao}` : "");
  const loiDich = pdfLine?.tuongYMeaning || auxYao?.pinyinMeaning || "";
  const haoTuSach =
    pdfLine?.haoTu || (auxYao ? `${auxYao.coreText}` : "");
  const loiHaoCotLoi = auxYao
    ? `${auxYao.hanzi} (${auxYao.coreText})`
    : haoTuSach;
  const tieuTuong =
    pdfLine?.tieuTuongQuote || (xzAuxLine?.xiangOriginal ? `"${xzAuxLine.xiangOriginal}"` : "");
  const tieuTuongNghia =
    pdfLine?.tieuTuongNghia || xzAuxLine?.xiangMeaning || "";
  const goiYNhacNho =
    pdfLine?.goiYNhacNho || xzAuxLine?.explanation || "";

  return {
    name: displayName,
    pdfHexName,
    hanzi,
    tuongYMeaning,
    tuongYHanViet,
    lineNum: activeLine,
    haoVi,
    hanViet,
    loiDich,
    haoTuSach,
    loiHaoCotLoi,
    tieuTuong,
    tieuTuongNghia,
    goiYNhacNho,
    apDung: auxAnalysisItem.apDung,
    nghiaLy: auxYao?.meaning || auxAnalysisItem.nghiaLy,
    tuongSo: auxYao?.symbolism || auxAnalysisItem.tuongSo,
  };
}

/**
 * Tạo dữ liệu chi tiết Luận Đoán Quẻ Khổng Minh Kinh Dịch chuẩn 100% theo sách
 * "Bản sao của Khổng Minh Thần Toán Gia Kinh Dịch (1)"
 * - Chỉ lấy Lá thứ 3 (Quẻ Chính + Hào động n)
 * - Giữ nguyên vị trí Hào động n cho cả 3 Quẻ Phụ (Tông - Hỗ - Thác)
 * - Chỉ đọc Thơ Thuận (không dùng Thơ Nghịch 180 độ, không dùng Quẻ Biến)
 * - Giữ quy tắc cốt lõi: Xăm CÁT làm theo Hành động thuận của Kinh Dịch; Xăm HUNG làm ngược lại lời khuyên thuận của Kinh Dịch
 */
export function formatKhongMinhKinhDich(
  primaryHex: Hexagram,
  activeLine: number = 2,
  sourceName: string = "Lá thứ 3"
): KhongMinhKinhDichResult {
  const safeLine = activeLine >= 1 && activeLine <= 6 ? activeLine : 2;
  const hexLines = primaryHex.lines; // [line1, line2, line3, line4, line5, line6]

  const pdfPrimaryHex = getKhongMinhPdfHexagram(primaryHex.number);
  const pdfPrimaryLine = getKhongMinhPdfLine(primaryHex.number, safeLine);
  const canonicalHex: CanonicalHexagram | undefined = getCanonicalHexagram(primaryHex.number);
  const bookHex: BookHexagramSummary | undefined = BOOK_HEXAGRAMS.find((b) => b.number === primaryHex.number);
  const kmBridge: KhongMinhHexagramBridge | undefined = getKhongMinhForHexagram(primaryHex.number);
  const xzData = XIANGZHUAN_DATA[primaryHex.number];
  const movingAnalysis = getMovingLineComprehensiveAnalysis(primaryHex, safeLine);

  // 1. Cấu trúc 6 Hào từ Hào 6 xuống Hào 1 (Chỉ xét Đắc vị / Thất vị & Đắc trung tại duy nhất Hào động theo sách)
  const activeLineStatus = getLinePositionStatus(safeLine, hexLines[safeLine - 1]);
  const linesStatus: KhongMinhLineStatus[] = [];

  for (let line = 6; line >= 1; line--) {
    const polarityVal = hexLines[line - 1];
    const polarity = polarityVal === 1 ? "dương" : "âm";
    const isMoving = line === safeLine;
    const statusText = isMoving ? activeLineStatus.statusTag : "[Hào tĩnh]";
    const displayText = isMoving
      ? `Hào ${line} ${polarity} ★ HÀO ĐỘNG ${activeLineStatus.statusTag}`
      : `Hào ${line} ${polarity} (Hào tĩnh)`;

    linesStatus.push({
      line,
      polarity,
      isMoving,
      statusText,
      displayText,
    });
  }

  const findingMethodText = `Hào động: Hào ${safeLine} (${pdfPrimaryLine?.lineName || `Hào ${safeLine}`} — ${sourceName}) ➔ Chỉ xét vị thế tại Hào động: ${activeLineStatus.statusTag}`;

  // 2. Khối Quẻ Chính & Hào Động (chuẩn dữ liệu sách)
  const canonicalActiveYao = canonicalHex?.lines?.[safeLine - 1];
  const kmActiveLine = kmBridge?.lines?.[safeLine - 1];
  const xzActiveLine = xzData?.xiaoxiang?.[safeLine - 1];

  const primaryHanzi = primaryHex.hanzi || canonicalHex?.hanzi || "";
  const pdfHexName = pdfPrimaryHex?.pdfHexName || primaryHex.name;

  const primaryBlock = {
    pdfHexName,
    hexNameWithHanzi: `${pdfHexName}${primaryHanzi ? ` (${primaryHanzi})` : ""} — Quẻ số ${primaryHex.number}`,
    tuongYMeaning:
      bookHex?.poemMeaning ||
      pdfPrimaryHex?.tuongYMeaning ||
      `${kmBridge?.tuongQueMeaning || ""}, ${kmBridge?.yQueMeaning || ""}`,
    tuongYHanViet:
      pdfPrimaryHex?.tuongYHanViet ||
      (bookHex?.poemHan ? bookHex.poemHan.replace(/\n/g, " ") : `${kmBridge?.tuongQue || ""}, ${kmBridge?.yQue || ""}.`),
    trichNghiaLuanGiai: canonicalHex?.symbolAndMeaning || primaryHex.overview || "",
    daiTuong: xzData?.daxiang
      ? `${xzData.daxiang.original} — ${xzData.daxiang.meaning}`
      : bookHex?.bigImage || primaryHex.image || "",
    vanThe: bookHex?.destiny || primaryHex.career || "",
    activeLineBlock: {
      lineNum: safeLine,
      lineName: pdfPrimaryLine?.lineName || canonicalActiveYao?.name || `Hào ${safeLine}`,
      haoVi: pdfPrimaryLine?.haoVi || `${canonicalActiveYao?.name || `Hào ${safeLine}`} (Hào ${safeLine})`,
      hanViet:
        pdfPrimaryLine?.tuongYHanViet ||
        (kmActiveLine ? `${kmActiveLine.tuongHao}, ${kmActiveLine.yHao}` : ""),
      loiDich:
        pdfPrimaryLine?.tuongYMeaning ||
        canonicalActiveYao?.pinyinMeaning ||
        "",
      phanDinhViThe: `${activeLineStatus.viThe.toUpperCase()} — ${activeLineStatus.viTheChiTiet}`,
      daoTrungChinh: activeLineStatus.daoTrungChinh,
      haoTuSach:
        pdfPrimaryLine?.haoTu ||
        (canonicalActiveYao ? `${canonicalActiveYao.coreText}` : ""),
      loiHaoCotLoi: canonicalActiveYao
        ? `${canonicalActiveYao.hanzi} (${canonicalActiveYao.coreText})`
        : pdfPrimaryLine?.haoTu || "",
      tieuTuong:
        pdfPrimaryLine?.tieuTuongQuote ||
        (xzActiveLine?.xiangOriginal ? `"${xzActiveLine.xiangOriginal}"` : ""),
      tieuTuongNghia:
        pdfPrimaryLine?.tieuTuongNghia || xzActiveLine?.xiangMeaning || "",
      goiYNhacNho:
        pdfPrimaryLine?.goiYNhacNho || xzActiveLine?.explanation || "",
      nghiaLy:
        canonicalActiveYao?.meaning ||
        primaryHex.lineMeanings?.[safeLine - 1]?.meaning ||
        "",
      tuongSo: canonicalActiveYao?.symbolism || "",
      viTri: canonicalActiveYao?.position || "",
      hanhDongThuan:
        canonicalActiveYao?.favorableAction ||
        "Giữ đạo trung chính, tiến hành thận trọng thuận theo thời thế.",
      saiLamCanTranh:
        canonicalActiveYao?.unfavorableAction ||
        "Hành xử nôn nóng, đi ngược quy luật khách quan.",
      hanhDongNguoc: "",
    },
  };

  // 3. Khối 3 Quẻ Phụ (Tông - Hỗ - Thác) — Giữ nguyên Hào động safeLine ở cả 3 quẻ phụ theo Trang 3 của sách!
  const tongLines = [hexLines[5], hexLines[4], hexLines[3], hexLines[2], hexLines[1], hexLines[0]];
  const tongHex = findHexagramByLines(tongLines);

  const hoLines = [hexLines[1], hexLines[2], hexLines[3], hexLines[2], hexLines[3], hexLines[4]];
  const hoHex = findHexagramByLines(hoLines);

  const thacLines = hexLines.map((l) => (l === 1 ? 0 : 1));
  const thacHex = findHexagramByLines(thacLines);

  const auxiliaryBlocks = {
    queTong: buildAuxBlockItem(tongHex, safeLine, movingAnalysis.queTong),
    queHo: buildAuxBlockItem(hoHex, safeLine, movingAnalysis.queHo),
    queThac: buildAuxBlockItem(thacHex, safeLine, movingAnalysis.queThac),
  };

  // 4. Khối Quẻ Xăm Khổng Minh Thần Số (Chiều Thuận — đủ 384 quẻ chuẩn sách)
  const oracleNum = pdfPrimaryLine?.oracleNum || kmActiveLine?.oracleNum || 1;
  const oracleDetail: KhongMinhOracleComprehensive = getKhongMinhComprehensive(
    oracleNum,
    kmActiveLine,
    canonicalActiveYao,
    pdfHexName
  );

  // Đồng bộ Âm Hán Việt chuẩn 100% theo cuốn "Bản sao của Khổng Minh Thần Toán Gia Kinh Dịch (1)"
  const exactPoemHaniViet = pdfPrimaryLine?.poemHaniViet || oracleDetail.poemHaniViet;

  const isHung = isKhongMinhOracleHung(oracleDetail.oracleType);
  const kinhDichThuan = primaryBlock.activeLineBlock.hanhDongThuan;
  const saiLamCanTranh = primaryBlock.activeLineBlock.saiLamCanTranh;
  const chienLuocDaoChieuKhiHung = `Tạm dừng mưu sự xuôi chiều theo quán tính cũ; đảo ngược sang thế thu liễm phòng thủ & điều chỉnh theo chỉ dẫn hóa giải: ${oracleDetail.actionGuidance.doList}`;
  primaryBlock.activeLineBlock.hanhDongNguoc = chienLuocDaoChieuKhiHung;

  const actionPrincipleRule = isHung
    ? `Quẻ Xăm Khổng Minh #${oracleDetail.formattedNum} là HUNG (${oracleDetail.oracleType}) ➔ HÀNH ĐỘNG NGƯỢC LẠI với hướng tiến hành thuận thông thường của Kinh Dịch (đảo chiều cách làm để chuyển họa thành phúc, xu cát tị hung theo Trang 12 & 16 của sách).`
    : `Quẻ Xăm Khổng Minh #${oracleDetail.formattedNum} là CÁT (${oracleDetail.oracleType}) ➔ LÀM THEO lời khuyên hành động thuận của Kinh Dịch (trì doanh bảo thái, giữ vững thành quả).`;

  const resolvedDoList = isHung
    ? chienLuocDaoChieuKhiHung
    : `${kinhDichThuan} — Kết hợp chỉ dẫn thơ xăm: ${oracleDetail.actionGuidance.doList}`;

  const resolvedAvoidList = isHung
    ? `Không cố tiến hành xuôi chiều như lúc thuận thời ("${kinhDichThuan}"); tuyệt đối tránh: ${oracleDetail.actionGuidance.avoidList} — Và tránh sai lầm mặt phản diện của hào: ${saiLamCanTranh}`
    : `${oracleDetail.actionGuidance.avoidList} — Đồng thời tránh sai lầm mặt phản diện của hào: ${saiLamCanTranh}`;

  const appliedKinhDichAction = isHung
    ? `Hành động NGƯỢC LẠI hướng mưu sự xuôi chiều (không áp dụng máy móc lời khuyên thuận thông thường "${kinhDichThuan}" khi xăm đang báo HUNG) ➔ ${chienLuocDaoChieuKhiHung}`
    : `Thực hiện lời khuyên hành động thuận của Kinh Dịch: ${kinhDichThuan} (Kết hợp lời khuyên thơ xăm: ${oracleDetail.actionGuidance.doList})`;

  const avoidedKinhDichAction = isHung
    ? `Không tiến hành xuôi chiều theo dự định cũ; tránh "${oracleDetail.actionGuidance.avoidList}" và tránh mặt phản diện của hào: "${saiLamCanTranh}".`
    : `Cần tránh "${oracleDetail.actionGuidance.avoidList}" và mặt phản diện của hào: "${saiLamCanTranh}".`;

  const actionPrincipleBannerText = isHung
    ? `[QUY TẮC HÀNH ĐỘNG CỐT TỬ]: Quẻ Xăm Khổng Minh #${oracleDetail.formattedNum} là HUNG (${oracleDetail.oracleType}) ➔ HÀNH ĐỘNG NGƯỢC LẠI VỚI HƯỚNG TIẾN HÀNH THUẬN THÔNG THƯỜNG CỦA KINH DỊCH: Không cứ làm xuôi như lúc thuận thời ("${kinhDichThuan}"), mà đảo chiều sang "${oracleDetail.actionGuidance.doList}" — Tuyệt đối tránh "${saiLamCanTranh}".`
    : `[QUY TẮC HÀNH ĐỘNG CỐT TỬ]: Quẻ Xăm Khổng Minh #${oracleDetail.formattedNum} là CÁT (${oracleDetail.oracleType}) ➔ LÀM THEO LỜI KHUYÊN HÀNH ĐỘNG THUẬN CỦA KINH DỊCH: Thực hiện "${kinhDichThuan}" (${oracleDetail.actionGuidance.doList}) — Tránh "${saiLamCanTranh}".`;

  const oracleBlock = {
    oracleNum: oracleDetail.oracleNum,
    formattedNum: oracleDetail.formattedNum,
    hexName: pdfHexName,
    activeLine: safeLine,
    oracleType: oracleDetail.oracleType,
    isHung,
    actionPrincipleRule,
    appliedKinhDichAction,
    avoidedKinhDichAction,
    poemHanzi: oracleDetail.poemHanzi,
    poemHaniViet: exactPoemHaniViet,
    poemMeaning: oracleDetail.poemMeaning,
    lineExplanations: oracleDetail.lineExplanations,
    detailedExplanation: oracleDetail.overallMeaning.detailedExplanation,
    oracleDoList: oracleDetail.actionGuidance.doList,
    oracleAvoidList: oracleDetail.actionGuidance.avoidList,
    doList: resolvedDoList,
    avoidList: resolvedAvoidList,
    attitude: oracleDetail.actionGuidance.attitude,
    symbolicFigure: oracleDetail.overallMeaning.symbolicFigure,
  };

  // 5. Tạo Toàn Văn Dữ Liệu Quẻ (Chuẩn 100% theo sách "Khổng Minh Thần Toán Gia Kinh Dịch")
  const linesFormattedText = linesStatus.map((s) => `  ${s.displayText}`).join("\n");
  const poemLinesBreakdown =
    oracleBlock.lineExplanations.length > 0
      ? oracleBlock.lineExplanations
          .map(
            (exp, idx) =>
              `    * Câu ${idx + 1} (${exp.lineTitle}):\n      - Nghĩa đen: ${exp.literalMeaning}\n      - Hàm ý: ${exp.implication}`
          )
          .join("\n")
      : `    * Giải nghĩa thơ: ${oracleBlock.poemMeaning}`;

  const plainText = `=== DỮ LIỆU QUẺ KHỔNG MINH THẦN TOÁN GIA KINH DỊCH ===
• Quẻ Chính: ${primaryBlock.hexNameWithHanzi}
• ${findingMethodText}
• Sơ đồ 6 hào Quẻ Chính (từ Thượng Hào 6 xuống Sơ Hào 1):
${linesFormattedText}
• Hệ thống Tứ Quái đồng chiếu tại Hào ${safeLine} (Vị trí hào động giữ nguyên ở cả Chính - Tông - Hỗ - Thác):
  - Quẻ Chính: ${primaryBlock.pdfHexName} (tra Hào ${safeLine})
  - Quẻ Tông (xoay ngược 180°): ${auxiliaryBlocks.queTong.pdfHexName} (tra Hào ${safeLine})
  - Quẻ Hỗ (hào 2,3,4 & 3,4,5): ${auxiliaryBlocks.queHo.pdfHexName} (tra Hào ${safeLine})
  - Quẻ Thác (đổi âm ↔ dương 6 hào): ${auxiliaryBlocks.queThac.pdfHexName} (tra Hào ${safeLine})
• ${actionPrincipleBannerText}

----------------------------------------
PHẦN I — QUẺ XĂM KHỔNG MINH THẦN SỐ [DIỆN: BỨC TRANH TOÀN CỤC & CHỖ DỰA CUỐI CÙNG PHÁN ĐOÁN CÁT HUNG]
• Quẻ xăm Khổng Minh số: #${oracleBlock.formattedNum} (ứng với ${primaryBlock.pdfHexName} động Hào ${safeLine})
• Loại xăm: ${oracleBlock.oracleType} [${isHung ? "HUNG — Hành động NGƯỢC LẠI lời khuyên thuận của Kinh Dịch" : "CÁT — Làm THEO lời khuyên hành động thuận của Kinh Dịch"}]
• Bài thơ quẻ xăm (Chữ Hán): ${oracleBlock.poemHanzi}
• Âm Hán Việt: ${oracleBlock.poemHaniViet}
• Dịch thơ / Diễn xuôi: ${oracleBlock.poemMeaning}
• Giải nghĩa chi tiết từng câu thơ (2 câu đầu đối chiếu hiện trạng, 2 câu sau dự báo quá trình & kết cục):
${poemLinesBreakdown}
• Ý nghĩa quẻ xăm:
  - Luận giải chi tiết: ${oracleBlock.detailedExplanation}
  - Tượng số của xăm: ${oracleBlock.symbolicFigure}
  - Lời khuyên riêng của thơ xăm:
    + Nên: ${oracleBlock.oracleDoList}
    + Tránh: ${oracleBlock.oracleAvoidList}
    + Thái độ cần có: ${oracleBlock.attitude}

----------------------------------------
PHẦN II — QUẺ CHÍNH & HÀO ĐỘNG ${safeLine} [TRỤC CỐT LÕI CỦA TUYẾN]
1. Toàn Quẻ Chính (${primaryBlock.hexNameWithHanzi}):
  - Tượng & Ý toàn quẻ: ${primaryBlock.tuongYHanViet} (${primaryBlock.tuongYMeaning})
  - Thoán từ & Tổng quan toàn quẻ: ${primaryBlock.trichNghiaLuanGiai}
  - Đại tượng truyện: ${primaryBlock.daiTuong}

2. Hào Động — ${primaryBlock.activeLineBlock.haoVi}:
  - Tượng & Ý hào động: ${primaryBlock.activeLineBlock.hanViet}${primaryBlock.activeLineBlock.loiDich ? ` (${primaryBlock.activeLineBlock.loiDich})` : ""}
  - Phân định vị thế tại Hào động: ${primaryBlock.activeLineBlock.phanDinhViThe}
  - Đạo Trung Chính: ${primaryBlock.activeLineBlock.daoTrungChinh}
  - Hào từ (Nguyên văn & Dịch nghĩa theo sách): ${primaryBlock.activeLineBlock.haoTuSach} | Chữ Hán: ${primaryBlock.activeLineBlock.loiHaoCotLoi}
  - Tiểu tượng truyện: ${primaryBlock.activeLineBlock.tieuTuong}
    -> Nghĩa là: ${primaryBlock.activeLineBlock.tieuTuongNghia}
  - Gợi ý / Nhắc nhở (Theo sách): ${primaryBlock.activeLineBlock.goiYNhacNho}
  - Phân tích chuyên sâu Hào động:
    + Nghĩa lý: ${primaryBlock.activeLineBlock.nghiaLy}
    + Tượng số: ${primaryBlock.activeLineBlock.tuongSo}
    + Vị trí: ${primaryBlock.activeLineBlock.viTri}
    + ✅ Lời khuyên hành động thuận của Kinh Dịch (Áp dụng khi Xăm Khổng Minh là CÁT): ${primaryBlock.activeLineBlock.hanhDongThuan}
    + 🛑 Mặt phản diện / Sai lầm của hào cần tránh: ${primaryBlock.activeLineBlock.saiLamCanTranh}
    + 🔄 Chiến lược hành động ngược khi Xăm Khổng Minh là HUNG: ${primaryBlock.activeLineBlock.hanhDongNguoc}
    + ⚡ QUYẾT ĐỊNH HÀNH ĐỘNG ÁP DỤNG CHO QUẺ NÀY: ${appliedKinhDichAction}

----------------------------------------
PHẦN III — 3 QUẺ PHỤ ĐỒNG CHIẾU TẠI HÀO ${safeLine} [TUYẾN: TÔNG – HỖ – THÁC]
1. Quẻ Tông (Quẻ Phản — Xoay ngược 180°): ${auxiliaryBlocks.queTong.name}
   [Vai trò theo sách: Góc nhìn từ phía đối phương, quan sát sự việc từ chiều ngược lại, hoặc phương án dự phòng khi cách làm chính không thuận lợi]
   - Tượng & Ý toàn quẻ: ${auxiliaryBlocks.queTong.tuongYHanViet} (${auxiliaryBlocks.queTong.tuongYMeaning})
   - Tra tại ${auxiliaryBlocks.queTong.haoVi}:
     * Tượng & Ý hào: ${auxiliaryBlocks.queTong.hanViet}
     * Hào từ (Nguyên văn & Dịch nghĩa): ${auxiliaryBlocks.queTong.haoTuSach} | Chữ Hán: ${auxiliaryBlocks.queTong.loiHaoCotLoi}
     * Tiểu tượng truyện: ${auxiliaryBlocks.queTong.tieuTuong}
       -> Nghĩa là: ${auxiliaryBlocks.queTong.tieuTuongNghia}
     * Gợi ý / Nhắc nhở (Theo sách): ${auxiliaryBlocks.queTong.goiYNhacNho}
     * Góc nhìn ứng dụng Quẻ Tông: ${auxiliaryBlocks.queTong.apDung}
     * Nghĩa lý: ${auxiliaryBlocks.queTong.nghiaLy}
     * Tượng số: ${auxiliaryBlocks.queTong.tuongSo}

2. Quẻ Hỗ (Hào 2,3,4 & 3,4,5): ${auxiliaryBlocks.queHo.name}
   [Vai trò theo sách: Cấu trúc nội tại, nút thắt ngầm, tâm lý sâu xa hoặc yếu tố trung gian âm thầm chi phối quá trình sự việc]
   - Tượng & Ý toàn quẻ: ${auxiliaryBlocks.queHo.tuongYHanViet} (${auxiliaryBlocks.queHo.tuongYMeaning})
   - Tra tại ${auxiliaryBlocks.queHo.haoVi}:
     * Tượng & Ý hào: ${auxiliaryBlocks.queHo.hanViet}
     * Hào từ (Nguyên văn & Dịch nghĩa): ${auxiliaryBlocks.queHo.haoTuSach} | Chữ Hán: ${auxiliaryBlocks.queHo.loiHaoCotLoi}
     * Tiểu tượng truyện: ${auxiliaryBlocks.queHo.tieuTuong}
       -> Nghĩa là: ${auxiliaryBlocks.queHo.tieuTuongNghia}
     * Gợi ý / Nhắc nhở (Theo sách): ${auxiliaryBlocks.queHo.goiYNhacNho}
     * Góc nhìn ứng dụng Quẻ Hỗ: ${auxiliaryBlocks.queHo.apDung}
     * Nghĩa lý: ${auxiliaryBlocks.queHo.nghiaLy}
     * Tượng số: ${auxiliaryBlocks.queHo.tuongSo}

3. Quẻ Thác (Quẻ Sai — Đổi toàn bộ Âm ↔ Dương): ${auxiliaryBlocks.queThac.name}
   [Vai trò theo sách: Mặt đối lập hoàn toàn, nguy cơ tiềm ẩn, biến số bất ngờ hoặc yếu tố bị bỏ sót cần phòng ngừa]
   - Tượng & Ý toàn quẻ: ${auxiliaryBlocks.queThac.tuongYHanViet} (${auxiliaryBlocks.queThac.tuongYMeaning})
   - Tra tại ${auxiliaryBlocks.queThac.haoVi}:
     * Tượng & Ý hào: ${auxiliaryBlocks.queThac.hanViet}
     * Hào từ (Nguyên văn & Dịch nghĩa): ${auxiliaryBlocks.queThac.haoTuSach} | Chữ Hán: ${auxiliaryBlocks.queThac.loiHaoCotLoi}
     * Tiểu tượng truyện: ${auxiliaryBlocks.queThac.tieuTuong}
       -> Nghĩa là: ${auxiliaryBlocks.queThac.tieuTuongNghia}
     * Gợi ý / Nhắc nhở (Theo sách): ${auxiliaryBlocks.queThac.goiYNhacNho}
     * Góc nhìn ứng dụng Quẻ Thác: ${auxiliaryBlocks.queThac.apDung}
     * Nghĩa lý: ${auxiliaryBlocks.queThac.nghiaLy}
     * Tượng số: ${auxiliaryBlocks.queThac.tuongSo}`;

  return {
    linesStatus,
    activeLine: safeLine,
    findingMethodText,
    actionPrincipleBannerText,
    primaryBlock,
    auxiliaryBlocks,
    oracleBlock,
    plainText,
  };
}

/**
 * Tạo bản sao chép hoàn chỉnh (kèm Câu hỏi & Phương pháp luận giải chuẩn theo sách
 * "Khổng Minh Thần Toán Gia Kinh Dịch") để dán cho hệ thống phân tích.
 * Hoàn toàn loại bỏ toàn bộ nội dung sao chép trải bài / bách khoa cũ.
 */
export function formatKhongMinhPromptForAI(params: {
  primaryHex: Hexagram;
  activeLine: number;
  sourceName?: string;
  question?: string;
  prediction?: string;
  answer?: string;
}): string {
  const {
    primaryHex,
    activeLine,
    sourceName = "Lá thứ 3",
    question,
    prediction,
    answer,
  } = params;

  const cleanedQuestion = (question || "").trim();
  const cleanedPrediction = (prediction || "").trim();
  const cleanedAnswer = (answer || "").trim();

  const kmFull = formatKhongMinhKinhDich(primaryHex, activeLine, sourceName);
  const { oracleBlock, primaryBlock } = kmFull;

  const out: string[] = [];
  out.push(`=== HỒ SƠ LUẬN GIẢI QUẺ KHỔNG MINH THẦN TOÁN GIA KINH DỊCH ===`);
  out.push(`【CÂU HỎI / TÂM NIỆM CẦN XEM】:`);
  out.push(
    cleanedQuestion
      ? `"${cleanedQuestion}"`
      : `"Xem tổng quan vận trình hiện tại và xin định hướng hành xử đúng đắn nhất"`
  );

  if (cleanedPrediction) {
    out.push(`\n【DỰ ĐOÁN BAN ĐẦU CỦA NGƯỜI XEM】:\n"${cleanedPrediction}"`);
  }
  if (cleanedAnswer) {
    out.push(`\n【GHI CHÚ / CHIÊM NGHIỆM THỰC TẾ】:\n"${cleanedAnswer}"`);
  }

  out.push("");
  out.push(kmFull.plainText);
  out.push("");
  out.push(`========================================`);
  out.push(
    `PHẦN IV — PHƯƠNG PHÁP & YÊU CẦU LUẬN GIẢI (CHUẨN SÁCH KHỔNG MINH THẦN TOÁN GIA KINH DỊCH)`
  );
  out.push(
    `Hãy đóng vai bậc thầy Dịch lý thấu suốt hệ thống "Khổng Minh Thần Toán Gia Kinh Dịch", phân tích mạch lạc, rõ ràng, dễ hiểu với người dùng theo đúng nguyên tắc của sách:`
  );
  out.push(
    `1. NGUYÊN TẮC TẬP TRUNG DUY NHẤT VÀO CÂU HỎI:` +
      `\n   - Xoay quanh trực diện câu hỏi: ${cleanedQuestion ? `"${cleanedQuestion}"` : `"Vận trình hiện tại và hướng hành xử"`}.` +
      `\n   - Mỗi quẻ chỉ luận đúng sự việc đang hỏi; tuyệt đối không suy diễn lan man sang lĩnh vực khác ngoài câu hỏi; không bàn tới Lá 1, Lá 2, Quẻ Biến hay Thơ đảo ngược.` +
      `\n   - Nếu câu hỏi là việc phức tạp, kéo dài nhiều yếu tố: lấy NGHĨA LÝ làm chủ, TƯỢNG SỐ làm phụ. Nếu câu hỏi là việc cụ thể, ngắn hạn, rõ ràng: lấy TƯỢNG SỐ làm chủ, NGHĨA LÝ làm phụ. Vận dụng phép "Thủ tượng tỷ loại" (hoán đổi chủ đề, chuyển hóa tình cảnh, loại tỷ vai diễn, thu hẹp phạm vi) để chuyển các hình tượng cổ trong thơ xăm và hào từ thành tình huống đời thực của người hỏi.`
  );
  out.push(
    `2. LUẬN GIẢI THEO TRỤC "DIỆN – TUYẾN – ĐIỂM":` +
      `\n   - Xét DIỆN (Bài thơ xăm Khổng Minh #${oracleBlock.formattedNum} — ${oracleBlock.oracleType}, chỗ dựa tối hậu quyết định Cát/Hung): Đối chiếu hoàn cảnh hiện tại của người hỏi với 2 câu đầu bài thơ để kiểm chứng độ ứng hợp, từ đó giải mã 2 câu sau để chỉ rõ diễn biến và kết cục toàn cục.` +
      `\n   - Xét TUYẾN (Mạch liên kết xuyên suốt tại Hào ${kmFull.activeLine} qua Chính – Tông – Hỗ – Thác):` +
      `\n     + Quẻ Chính (${primaryBlock.pdfHexName} - Hào ${kmFull.activeLine}): Phân tích bản chất cốt lõi, vị thế Hào động (${primaryBlock.activeLineBlock.phanDinhViThe}; lưu ý chỉ xét Đắc vị/Thất vị/Đắc trung tại Hào động, trong đó Đắc trung quý hơn Chính) cùng lời Gợi ý / Nhắc nhở của sách.` +
      `\n     + Quẻ Tông (${kmFull.auxiliaryBlocks.queTong.pdfHexName} - Hào ${kmFull.activeLine}): Chỉ rõ góc nhìn/động thái từ phía đối phương hoặc phương án dự phòng xoay chiều khi cách làm chính gặp trở ngại.` +
      `\n     + Quẻ Hỗ (${kmFull.auxiliaryBlocks.queHo.pdfHexName} - Hào ${kmFull.activeLine}): Bóc tách nút thắt nội tại, tâm lý sâu xa hoặc yếu tố trung gian đang âm thầm tác động.` +
      `\n     + Quẻ Thác (${kmFull.auxiliaryBlocks.queThac.pdfHexName} - Hào ${kmFull.activeLine}): Cảnh báo nguy cơ tiềm ẩn, biến số bất ngờ hoặc điểm mù dễ bị bỏ sót.` +
      `\n   - Xét ĐIỂM & ỨNG KỲ (Điểm mấu chốt & Thời gian ứng nghiệm nếu có): Chỉ ra hình tượng đắt giá nhất chạm trúng trọng tâm câu hỏi; nếu trong thơ xăm hoặc hào từ có hình tượng mùa (Xuân, Hạ, Thu, Đông), Quý nhân hoặc 12 con giáp tháng âm lịch (Tý=Tháng 11 ÂL, Sửu=Tháng 12 ÂL, Dần=Tháng 1 ÂL, Mão=Tháng 2 ÂL, Thìn=Tháng 3 ÂL, Tỵ=Tháng 4 ÂL, Ngọ=Tháng 5 ÂL, Mùi=Tháng 6 ÂL, Thân=Tháng 7 ÂL, Dậu=Tháng 8 ÂL, Tuất=Tháng 9 ÂL, Hợi=Tháng 10 ÂL) thì nêu rõ mốc thời gian tham khảo.`
  );
  out.push(
    `3. CHỐT QUYẾT ĐỊNH & CHIẾN LƯỢC HÀNH ĐỘNG THỰC TẾ (QUY TẮC CỐT TỬ CÁT/HUNG):` +
      `\n   - Áp dụng nghiêm ngặt quy tắc phối hợp Khổng Minh × Kinh Dịch:` +
      `\n     + Khi Quẻ Xăm Khổng Minh là CÁT ➔ LÀM THEO lời khuyên Hành động thuận của Kinh Dịch (trì doanh bảo thái, giữ vững thành quả).` +
      `\n     + Khi Quẻ Xăm Khổng Minh là HUNG ➔ HÀNH ĐỘNG NGƯỢC LẠI với lời khuyên thuận của Kinh Dịch (thực thi Hành động ngược để phá thế bế tắc, chuyển họa thành phúc).` +
      `\n   - Với quẻ hiện tại, Xăm #${oracleBlock.formattedNum} là ${oracleBlock.isHung ? `HUNG (${oracleBlock.oracleType}) ➔ BẮT BUỘC khuyên người hỏi HÀNH ĐỘNG NGƯỢC LẠI với lời khuyên thuận của Kinh Dịch: Thực hiện "${oracleBlock.doList}" — Tuyệt đối tránh làm theo "${oracleBlock.avoidList}"` : `CÁT (${oracleBlock.oracleType}) ➔ BẮT BUỘC khuyên người hỏi LÀM THEO lời khuyên hành động thuận của Kinh Dịch: Thực hiện "${oracleBlock.doList}" — Tránh "${oracleBlock.avoidList}"`}.` +
      `\n   - Tóm lược cuối bài bằng 3 gạch đầu dòng thật ngắn gọn, dễ nhớ cho người hỏi: (1) Kết luận thẳng cho câu hỏi, (2) Việc cần làm ngay, (3) Điều tuyệt đối tránh & thái độ giữ tâm.`
  );

  return out.join("\n");
}
