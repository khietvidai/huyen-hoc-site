import { Hexagram } from "../types";
import { findHexagramByLines } from "./hexagrams";
import { getCanonicalHexagram, CanonicalHexagram, CanonicalYao } from "./canonical";
import { getKhongMinhForHexagram } from "./khongMinhBridgeData";
import { XIANGZHUAN_DATA } from "./xiangzhuanData";

export interface KhongMinhTuongYAnalysis {
  // Tượng Quẻ & Ý Quẻ (Toàn Quẻ)
  tuongQue: string;
  tuongQueHanzi?: string;
  tuongQueMeaning?: string;
  yQue: string;
  yQueHanzi?: string;
  yQueMeaning?: string;

  // Tượng Hào & Ý Hào (Hào Động)
  tuongHao: string;
  tuongHaoHanzi?: string;
  tuongHaoMeaning?: string;
  yHao: string;
  yHaoHanzi?: string;
  yHaoMeaning?: string;

  // Tượng Truyện Kinh Dịch (Đại Tượng & Tiểu Tượng - Khổng Tử Thập Dực)
  daiTuong?: string;
  daiTuongMeaning?: string;
  tieuTuong?: string;
  tieuTuongMeaning?: string;
}

export function getKhongMinhTuongY(
  hexNumber: number,
  lineNumber: number
): KhongMinhTuongYAnalysis | undefined {
  const km = getKhongMinhForHexagram(hexNumber);
  const xz = XIANGZHUAN_DATA[hexNumber];
  const lineItem = km?.lines?.[lineNumber - 1];
  const xzLine = xz?.xiaoxiang?.[lineNumber - 1];

  if (!km && !xz) return undefined;

  return {
    tuongQue: km?.tuongQue || (xz ? `Tượng quẻ ${xz.name}` : ""),
    tuongQueHanzi: km?.tuongQueHanzi,
    tuongQueMeaning: km?.tuongQueMeaning || xz?.daxiang?.meaning,
    yQue: km?.yQue || "",
    yQueHanzi: km?.yQueHanzi,
    yQueMeaning: km?.yQueMeaning || xz?.daxiang?.explanation,

    tuongHao: lineItem?.tuongHao || xzLine?.xiangOriginal || "",
    tuongHaoHanzi: lineItem?.tuongHaoHanzi,
    tuongHaoMeaning: lineItem?.tuongHaoMeaning || xzLine?.xiangMeaning,
    yHao: lineItem?.yHao || "",
    yHaoHanzi: lineItem?.yHaoHanzi,
    yHaoMeaning: lineItem?.yHaoMeaning || xzLine?.explanation,

    daiTuong: xz?.daxiang?.original,
    daiTuongMeaning: xz?.daxiang?.meaning,
    tieuTuong: xzLine?.xiangOriginal,
    tieuTuongMeaning: xzLine?.xiangMeaning,
  };
}

export interface AuxiliaryHexagramAnalysis {
  name: string;
  hanzi: string;
  number: number;
  line: number;
  lineName: string;
  lineHanziText: string;
  apDung: string;
  nghiaLy: string;
  tuongSo: string;
  hanhDongThuan: string;
  hanhDongNguoc: string;
  tuongY?: KhongMinhTuongYAnalysis;
}

export interface TongHopHanhDongThuanNghich {
  thuan: {
    tieuDe: string;
    chinh: string;
    tong: string;
    ho: string;
    thac: string;
    loiKhuyenCotLoi: string;
  };
  nghich: {
    tieuDe: string;
    chinh: string;
    tong: string;
    ho: string;
    thac: string;
    canhBaoCotLoi: string;
  };
}

export interface MovingLineComprehensiveAnalysis {
  hexNumber: number;
  hexName: string;
  hexHanzi: string;
  activeLine: number;
  lineName: string;
  coreLine: {
    loiHao: string;
    nghiaLy: string;
    tuongSo: string;
    viTri: string;
    hanhDongThuan: string;
    hanhDongNguoc: string;
    tuongY?: KhongMinhTuongYAnalysis;
  };
  queTong: AuxiliaryHexagramAnalysis;
  queHo: AuxiliaryHexagramAnalysis;
  queThac: AuxiliaryHexagramAnalysis;
  tongHopHanhDong: TongHopHanhDongThuanNghich;
}

/**
 * Tập dữ liệu mẫu chuẩn mực được biên tập thủ công cho các quẻ/hào trọng điểm
 */
export const CUSTOM_MOVING_LINE_ANALYSES: Record<string, MovingLineComprehensiveAnalysis> = {
  "64-1": {
    hexNumber: 64,
    hexName: "HỎA THỦY VỊ TẾ",
    hexHanzi: "未濟",
    activeLine: 1,
    lineName: "Sơ Lục",
    coreLine: {
      loiHao: "濡其尾，吝 (Nhu kỳ vĩ, lận - Ướt cái đuôi, khó khăn).",
      nghiaLy:
        "Ở giai đoạn đầu tiên của một công việc còn ngổn ngang (Vị tế), bản thân chưa có đủ kinh nghiệm, năng lực mỏng manh (Âm nhu). Nếu nôn nóng muốn đạt được thành tựu ngay lập tức, đâm sầm tiến lên như con cáo nhỏ vội vã lội xuống dòng nước xiết, chắc chắn sẽ bị đuối sức, kéo lê nặng nề (ướt đuôi). Hành động bốc đồng lúc khởi thủy khi mọi điều kiện chưa sẵn sàng sẽ dìm hệ thống vào sự bế tắc, lúng túng và chuốc lấy vô vàn khó khăn.",
      tuongSo:
        "Tượng của việc lực bất tòng tâm nhưng lại nôn nóng làm việc lớn, ắt chuốc lấy khó khăn. Có tượng \"chưa học bò đã lo học chạy\", \"cầm đèn chạy trước ô tô\" tự rước lấy mệt mỏi vào thân.",
      viTri:
        "Hào Âm cư ngôi Dương, bất chính. Ở dưới cùng của hạ quái Khảm (nước sâu, hiểm nguy), mang tính bồng bột của ngôi Dương nhưng thực lực yếu ớt (Âm). Việc không biết lượng sức mình đâm xuống nước lập tức bị nhấn chìm.",
      hanhDongThuan:
        "Rút chân khỏi các dự án vượt quá năng lực, dừng lại để quan sát và đánh giá rủi ro, tập trung trau dồi chuyên môn nền tảng.",
      hanhDongNguoc:
        "Gia tăng tốc độ triển khai, liên tục bước vào các khu vực chưa được khảo sát, công bố hoàn thành các hạng mục dẫu chưa đủ điều kiện.",
    },
    queTong: {
      name: "Thủy Hỏa Ký Tế",
      hanzi: "既濟",
      number: 63,
      line: 1,
      lineName: "Hào 1 (Sơ Cửu)",
      lineHanziText:
        "曳其輪，濡其尾，無咎 (Duệ kỳ luân, nhu kỳ vĩ, vô cữu - Kéo bánh xe lại, ướt cái đuôi, không lỗi - Hào 1).",
      apDung:
        "Khách quan cho thấy đối phương đang vô cùng tỉnh táo, họ sẵn sàng phanh gấp, chấp nhận chậm tiến độ để không đâm sầm vào hố sâu.",
      nghiaLy:
        "Bức tranh bên ngoài lại chỉ ra sự khôn ngoan. Khi bước vào chỗ khó, môi trường hay đối phương không hề lao tới, mà chủ động \"kéo bánh xe lại\" để hãm đà. Rào cản khách quan là sự cảnh giác tột độ này. Dẫu việc phanh gấp có gây ra sự chệch choạng (ướt đuôi), nhưng họ giữ được an toàn. Việc bạn nôn nóng lội nước hoàn toàn ngược pha với sự cẩn trọng của thời cuộc, khiến bạn trở thành kẻ lãnh đủ mọi rủi ro.",
      tuongSo:
        "Tượng của việc đối phương biết hãm đà tiến, phòng thủ từ xa. Có tượng \"cẩn tắc vô áy náy\", \"chậm mà chắc\" để qua ải bình an.",
      hanhDongThuan:
        "Chủ động phanh hãm tốc độ, nhường nhịp tiến cho đối phương, kiên nhẫn phối hợp theo nhịp độ cẩn trọng của thời cuộc.",
      hanhDongNguoc:
        "Cố tình gia tăng sức ép, thúc ép đối phương đẩy nhanh tiến độ khi họ đang muốn phòng thủ an toàn.",
    },
    queHo: {
      name: "Thủy Hỏa Ký Tế",
      hanzi: "既濟",
      number: 63,
      line: 1,
      lineName: "Hào 1 (Sơ Cửu)",
      lineHanziText:
        "曳其輪，濡其尾，無咎 (Duệ kỳ luân, nhu kỳ vĩ, vô cữu - Kéo bánh xe lại, ướt cái đuôi, không lỗi - Hào 1).",
      apDung:
        "Bóc tách tâm lý cho thấy cấu trúc nội tại đang liên tục phát ra cảnh báo đỏ, yêu cầu hệ thống phải kiềm chế cái tôi bốc đồng để bảo toàn sinh lực.",
      nghiaLy:
        "Bề mặt là sự vội vã ướt đuôi, nhưng sâu thẳm bên trong (Hỗ trùng Tông) là một mệnh lệnh gắt gao bắt buộc phải hãm phanh (kéo bánh xe lại). Động lực ngầm này đang giằng xé với sự nôn nóng bề mặt. Tâm lý ngầm yêu cầu phải chấp nhận việc chậm trễ, nhọc nhằn ban đầu, ghìm cương dục vọng thể hiện mình thì mới mong thoát khỏi cái bẫy \"Vị Tế\" đầy rẫy hiểm nguy.",
      tuongSo:
        "Tượng lúc này nội tâm đang ra sức hãm phanh trước miệng vực. Tượng rơi vào cảnh \"biết mình biết ta\", phanh gấp để tránh sa lầy diện rộng.",
      hanhDongThuan:
        "Tự giác kìm hãm tham vọng bồng bột, chấp nhận sự chậm trễ bước đầu để củng cố nền tảng nội lực vững chắc.",
      hanhDongNguoc:
        "Thả lỏng cái tôi háo thắng, để sự nóng vội bề mặt dẫn dắt hành vi mà bỏ qua các tín hiệu cảnh báo nội tâm.",
    },
    queThac: {
      name: "Thủy Hỏa Ký Tế",
      hanzi: "既濟",
      number: 63,
      line: 1,
      lineName: "Hào 1 (Sơ Cửu)",
      lineHanziText:
        "曳其輪，濡其尾，無咎 (Duệ kỳ luân, nhu kỳ vĩ, vô cữu - Kéo bánh xe lại, ướt cái đuôi, không lỗi - Hào 1).",
      apDung:
        "Lời cảnh báo đanh thép: nếu ngoan cố chạy theo tham vọng mạo hiểm mà không chịu hãm đà, bạn sẽ bị dòng nước vô minh nuốt chửng hoàn toàn.",
      nghiaLy:
        "Mặt trái của sự hăng hái mù quáng là cái chết. Đạo lý lặp lại ba lần ở Tông - Hỗ - Thác nhấn mạnh: tuyệt đối phải \"kéo bánh xe lại\". Dẫu cho bạn có bị gièm pha là nhút nhát, lấm lem bùn đất (ướt đuôi), nhưng sự nhún nhường lùi bước này là ranh giới sống còn. Bỏ qua sự phanh hãm này, cái \"đuôi\" của bạn không chỉ ướt, mà sẽ kéo cả cơ thể bạn vĩnh viễn chìm xuống đáy sông.",
      tuongSo:
        "Tượng rơi vào thế nếu đâm đầu mù quáng ắt sẽ chết đuối. Có tượng \"lùi một bước biển rộng trời cao\", bảo toàn tính mạng quan trọng hơn hư danh.",
      hanhDongThuan:
        "Nhìn từ mặt trái đối lập (Quẻ Thác Thủy Hỏa Ký Tế): Chấp nhận lùi một bước để giữ an toàn, bảo toàn tối đa sinh lực và nguồn lực cốt lõi trước vùng nước xoáy hiểm ác.",
      hanhDongNguoc:
        "Sa vào cạm bẫy cực đoan của quẻ Thác: Liều lĩnh đánh cược tất tay, bất chấp mọi rào cản và cảnh báo nguy hiểm để lao vào chỗ chết đuối.",
    },
    tongHopHanhDong: {
      thuan: {
        tieuDe: "HÀNH ĐỘNG THUẬN (ĐẮC THỜI - HỢP NGOẠI - AN NỘI - VỮNG NỀN)",
        chinh: "Rút chân khỏi các dự án vượt quá năng lực, dừng lại để quan sát và đánh giá rủi ro, tập trung trau dồi chuyên môn nền tảng.",
        tong: "Nhìn từ thế đối phương (Quẻ Tông Thủy Hỏa Ký Tế): Chủ động phanh hãm tốc độ, nhường nhịp tiến cho đối phương, kiên nhẫn phối hợp theo nhịp độ cẩn trọng của thời cuộc.",
        ho: "Kiểm soát động lực ngầm (Quẻ Hỗ Thủy Hỏa Ký Tế): Tự giác kìm hãm tham vọng bồng bột, chấp nhận sự chậm trễ bước đầu để củng cố nền tảng nội lực vững chắc.",
        thac: "Phòng ngừa mặt trái đối lập (Quẻ Thác Thủy Hỏa Ký Tế): Chấp nhận lùi một bước để giữ an toàn, bảo toàn tối đa sinh lực và nguồn lực cốt lõi trước vùng nước xoáy hiểm ác.",
        loiKhuyenCotLoi: "Hợp nhất 4 góc nhìn: Chủ động phanh hãm tốc độ, ghìm cương dục vọng bồng bột, nhún nhường lùi bước trước hiểm nguy để bảo toàn đại cục sinh tồn.",
      },
      nghich: {
        tieuDe: "HÀNH ĐỘNG NGHỊCH (NGHỊCH LÝ - CƯỠNG CẦU - RẠN NỨT - TAI HỌA)",
        chinh: "Gia tăng tốc độ triển khai, liên tục bước vào các khu vực chưa được khảo sát, công bố hoàn thành các hạng mục dẫu chưa đủ điều kiện.",
        tong: "Cố tình gia tăng sức ép, thúc ép đối phương đẩy nhanh tiến độ khi họ đang muốn phòng thủ an toàn.",
        ho: "Thả lỏng cái tôi háo thắng, để sự nóng vội bề mặt dẫn dắt hành vi mà bỏ qua các tín hiệu cảnh báo nội tâm.",
        thac: "Liều lĩnh đánh cược tất tay, bất chấp mọi rào cản và cảnh báo nguy hiểm để lao vào chỗ chết đuối.",
        canhBaoCotLoi: "Tuyệt đối tránh: Bốc đồng xuất kích khi thực lực non nớt, cưỡng ép ngoại cảnh, buông lỏng tự kỷ luật và đánh cược mạng sống vào sự may rủi.",
      },
    },
  },
};

/**
 * Trích xuất và xây dựng phân tích hào động toàn diện theo Tứ Quái (Chính - Tông - Hỗ - Thác)
 */
export function getMovingLineComprehensiveAnalysis(
  targetHex: Hexagram,
  activeLine: number
): MovingLineComprehensiveAnalysis {
  const key = `${targetHex.number}-${activeLine}`;
  if (CUSTOM_MOVING_LINE_ANALYSES[key]) {
    const custom = { ...CUSTOM_MOVING_LINE_ANALYSES[key] };
    if (!custom.coreLine.tuongY) {
      custom.coreLine = {
        ...custom.coreLine,
        tuongY: getKhongMinhTuongY(targetHex.number, activeLine),
      };
    }
    if (!custom.queTong.tuongY) {
      custom.queTong = {
        ...custom.queTong,
        tuongY: getKhongMinhTuongY(custom.queTong.number, custom.queTong.line),
      };
    }
    if (!custom.queHo.tuongY) {
      custom.queHo = {
        ...custom.queHo,
        tuongY: getKhongMinhTuongY(custom.queHo.number, custom.queHo.line),
      };
    }
    if (!custom.queThac.tuongY) {
      custom.queThac = {
        ...custom.queThac,
        tuongY: getKhongMinhTuongY(custom.queThac.number, custom.queThac.line),
      };
    }
    return custom;
  }

  // 1. Quẻ Chính & Hào Động
  const canonicalHex: CanonicalHexagram | undefined = getCanonicalHexagram(targetHex.number);
  const canonicalYao: CanonicalYao | undefined = canonicalHex?.lines?.[activeLine - 1];
  const hexLines = targetHex.lines; // [line1, line2, line3, line4, line5, line6]
  const coreTuongY = getKhongMinhTuongY(targetHex.number, activeLine);

  const lineName = canonicalYao?.name || targetHex.lineMeanings?.[activeLine - 1]?.name || `Hào ${activeLine}`;
  
  let rawCoreText = canonicalYao?.coreText || targetHex.lineMeanings?.[activeLine - 1]?.text || "";
  rawCoreText = rawCoreText.replace(/\.\s*$/, "").trim();
  const loiHao = canonicalYao?.hanzi
    ? `${canonicalYao.hanzi} (${rawCoreText}).`
    : rawCoreText ? `${rawCoreText}.` : "Đang cập nhật lời hào.";

  const nghiaLy = canonicalYao?.meaning || targetHex.lineMeanings?.[activeLine - 1]?.meaning || targetHex.lineMeanings?.[activeLine - 1]?.detailedExplanation || "";
  const tuongSo = canonicalYao?.symbolism || `Tượng của hào ${activeLine} quẻ ${targetHex.name}, phản ánh sự dịch chuyển thời vận cần được quán xét tường minh.`;
  const viTri = canonicalYao?.position || (hexLines[activeLine - 1] === 1 ? "Hào Dương" : "Hào Âm") + ` ở ngôi vị thứ ${activeLine}.`;
  const hanhDongThuan = canonicalYao?.favorableAction || "Giữ vững đạo trung chính, hành sự thận trọng, biết dừng đúng lúc khi thời cơ chưa thuận.";
  const hanhDongNguoc = canonicalYao?.unfavorableAction || "Tránh nôn nóng manh động, cố chấp lao vào chốn hiểm nguy.";

  // 2. Tính Quẻ Tông (Lộn ngược 180 độ các hào: line 6 -> 1)
  const tongLines = [hexLines[5], hexLines[4], hexLines[3], hexLines[2], hexLines[1], hexLines[0]];
  const tongHex = findHexagramByLines(tongLines);
  const tongLine = activeLine; // Hào động quẻ Tông cùng hào động với quẻ chính
  const tongCanonical = getCanonicalHexagram(tongHex.number);
  const tongYao = tongCanonical?.lines?.[tongLine - 1];

  let rawTongCore = tongYao?.coreText || tongHex.lineMeanings?.[tongLine - 1]?.text || tongHex.judgment || "";
  rawTongCore = rawTongCore.replace(/\.\s*$/, "").trim();
  const tongLineName = tongYao?.name || `Hào ${tongLine}`;
  const tongLineText = tongYao?.hanzi
    ? `${tongYao.hanzi} (${rawTongCore} - ${tongLineName}).`
    : `${rawTongCore} - ${tongLineName}.`;

  const tongMeaningFirst = tongYao?.meaning ? tongYao.meaning.split(".")[0].trim() + "." : "quan sát cẩn trọng và ứng biến linh hoạt theo thời thế.";
  const tongActionThuanRaw = tongYao?.favorableAction || tongHex.advice || "Chủ động hòa nhịp và phối hợp nhịp nhàng theo thế ngoại cảnh.";
  const tongActionNguocRaw = tongYao?.unfavorableAction || "Cố tình gia tăng sức ép, thúc ép đối phương đẩy nhanh tiến độ khi ngoại cảnh chưa sẵn sàng.";

  const queTong: AuxiliaryHexagramAnalysis = {
    name: tongHex.name,
    hanzi: tongCanonical?.hanzi || tongHex.hanzi,
    number: tongHex.number,
    line: tongLine,
    lineName: tongLineName,
    lineHanziText: tongLineText,
    apDung: `Khách quan cho thấy đối phương và môi trường bên ngoài (quẻ Tông ${tongHex.name} - ${tongLineName}) đang ở vị thế: ${tongMeaningFirst} Cần tỉnh táo quan sát để điều chỉnh bước đi tương thích với nhịp độ khách quan, không thể mù quáng áp đặt ý chí.`,
    nghiaLy: `Bức tranh bên ngoài chỉ ra sự khôn ngoan và thế ứng biến của thời cuộc. Nhìn từ góc độ đối phương ở quẻ Tông ${tongHex.name} (${tongLineName}): ${tongYao?.meaning || "môi trường đang đòi hỏi sự phòng thủ và giữ gìn trật tự an toàn"}. Dẫu có đôi chút chậm trễ ban đầu, nhưng sự phối hợp này bảo đảm không bị lệch pha với dòng chảy chung.`,
    tuongSo: tongYao?.symbolism || `Tượng của việc đối phương biết hãm đà tiến, phòng thủ từ xa. Có tượng "cẩn tắc vô áy náy", "chậm mà chắc" để qua ải bình an.`,
    hanhDongThuan: `Nhìn từ thế đối phương (${tongHex.name} - ${tongLineName}): ${tongActionThuanRaw} Cần chủ động hòa nhịp, tôn trọng vị thế và sự thận trọng của đối tác/ngoại cảnh, không đối đầu trực diện.`,
    hanhDongNguoc: `Cưỡng cầu áp đặt ý chí lên đối phương, làm trái nhịp ngoại cảnh: ${tongActionNguocRaw} Manh động đòi hỏi kết quả tức thì khiến quan hệ đổ vỡ và chuốc lấy sự kháng cự.`,
    tuongY: getKhongMinhTuongY(tongHex.number, tongLine),
  };

  // 3. Tính Quẻ Hỗ (Hạ: 2,3,4; Thượng: 3,4,5)
  const hoLines = [hexLines[1], hexLines[2], hexLines[3], hexLines[2], hexLines[3], hexLines[4]];
  const hoHex = findHexagramByLines(hoLines);
  const hoLine =
    activeLine === 1 ? 1 :
    activeLine === 2 ? 1 :
    activeLine === 3 ? 2 :
    activeLine === 4 ? 3 :
    activeLine === 5 ? 6 : 6;
  const hoCanonical = getCanonicalHexagram(hoHex.number);
  const hoYao = hoCanonical?.lines?.[hoLine - 1];

  let rawHoCore = hoYao?.coreText || hoHex.lineMeanings?.[hoLine - 1]?.text || hoHex.judgment || "";
  rawHoCore = rawHoCore.replace(/\.\s*$/, "").trim();
  const hoLineName = hoYao?.name || `Hào ${hoLine}`;
  const hoLineText = hoYao?.hanzi
    ? `${hoYao.hanzi} (${rawHoCore} - ${hoLineName}).`
    : `${rawHoCore} - ${hoLineName}.`;

  const hoMeaningFirst = hoYao?.meaning ? hoYao.meaning.split(".")[0].trim() + "." : "yêu cầu hệ thống phải kiềm chế cảm xúc, kiểm soát động lực ngầm.";
  const hoActionThuanRaw = hoYao?.favorableAction || hoHex.advice || "Tự giác kìm hãm tham vọng bồng bột, củng cố nền tảng nội lực vững chắc.";
  const hoActionNguocRaw = hoYao?.unfavorableAction || "Thả lỏng cái tôi háo thắng, để sự nóng vội bề mặt dẫn dắt hành vi mà bỏ qua cảnh báo nội tâm.";

  const queHo: AuxiliaryHexagramAnalysis = {
    name: hoHex.name,
    hanzi: hoHex.hanzi,
    number: hoHex.number,
    line: hoLine,
    lineName: hoLineName,
    lineHanziText: hoLineText,
    apDung: `Bóc tách tâm lý cho thấy cấu trúc nội tại (quẻ Hỗ ${hoHex.name} - ${hoLineName}) đang liên tục phát ra cảnh báo: ${hoMeaningFirst} Động lực ngầm bên trong đòi hỏi hệ thống phải ghìm cương dục vọng bộc phát bề mặt để bảo toàn sinh lực.`,
    nghiaLy: `Bề mặt là sự vận động bên ngoài, nhưng sâu thẳm bên trong (quẻ Hỗ ${hoHex.name} - ${hoLineName}) là một mệnh lệnh gắt gao. ${hoYao?.meaning || "Tâm lý ngầm yêu cầu phải chấp nhận việc chậm trễ, nhọc nhằn ban đầu, ghìm cương dục vọng thể hiện mình thì mới mong thoát khỏi cạm bẫy hiểm nguy"}. Động lực nội tâm này đang thử thách bản lĩnh định tĩnh.`,
    tuongSo: hoYao?.symbolism || `Tượng lúc này nội tâm đang ra sức hãm phanh trước miệng vực. Tượng rơi vào cảnh "biết mình biết ta", phanh gấp để tránh sa lầy diện rộng.`,
    hanhDongThuan: `Kiểm soát động lực ngầm và củng cố nội lực (${hoHex.name} - ${hoLineName}): ${hoActionThuanRaw} Tự giác kiểm soát cảm xúc, giải tỏa mâu thuẫn nội tâm, củng cố nền móng bản chất trước khi bành trướng ra ngoài.`,
    hanhDongNguoc: `Dung dưỡng mầm mống bất an, để dục vọng nội tâm dẫn dắt: ${hoActionNguocRaw} Bỏ qua các tín hiệu rạn nứt bên trong, dung dưỡng lòng tham hoặc sự sợ hãi ngấm ngầm phá hủy đại cuộc.`,
    tuongY: getKhongMinhTuongY(hoHex.number, hoLine),
  };

  // 4. Tính Quẻ Thác (Đổi toàn bộ âm -> dương, dương -> âm)
  const thacLines = hexLines.map((l) => (l === 1 ? 0 : 1));
  const thacHex = findHexagramByLines(thacLines);
  const thacCanonical = getCanonicalHexagram(thacHex.number);
  const thacYao = thacCanonical?.lines?.[activeLine - 1];

  let rawThacCore = thacYao?.coreText || thacHex.lineMeanings?.[activeLine - 1]?.text || thacHex.judgment || "";
  rawThacCore = rawThacCore.replace(/\.\s*$/, "").trim();
  const thacLineName = thacYao?.name || `Hào ${activeLine}`;
  const thacLineText = thacYao?.hanzi
    ? `${thacYao.hanzi} (${rawThacCore} - ${thacLineName}).`
    : `${rawThacCore} - ${thacLineName}.`;

  const thacMeaningFirst = thacYao?.meaning ? thacYao.meaning.split(".")[0].trim() + "." : "sự suy sụp và bế tắc khó lường nếu hành xử sai lầm.";
  const thacActionThuanRaw = thacYao?.favorableAction || thacHex.advice || "Chấp nhận lùi một bước để giữ an toàn, bảo toàn tối đa sinh lực và nguồn lực cốt lõi.";
  const thacActionNguocRaw = thacYao?.unfavorableAction || "Liều lĩnh đánh cược tất tay, bất chấp mọi rào cản và cảnh báo nguy hiểm để lao vào chỗ bế tắc.";

  const queThac: AuxiliaryHexagramAnalysis = {
    name: thacHex.name,
    hanzi: thacHex.hanzi,
    number: thacHex.number,
    line: activeLine,
    lineName: thacLineName,
    lineHanziText: thacLineText,
    apDung: `Lời cảnh báo đanh thép: nếu ngoan cố chạy theo tham vọng mạo hiểm mà không chịu hãm đà, mặt trái đối lập của quẻ Thác ${thacHex.name} (${thacLineName}) sẽ là: ${thacMeaningFirst} Cảnh giới này là lằn ranh đỏ cảnh tỉnh người gieo quẻ.`,
    nghiaLy: `Mặt trái của sự hăng hái mù quáng là vực thẳm khôn lường. Góc nhìn phản chiếu từ quẻ Thác ${thacHex.name} (${thacLineName}) nhấn mạnh: ${thacYao?.meaning || "tuyệt đối phải biết điểm dừng và lùi bước an toàn"}. Dẫu cho việc nhún nhường có bị chê trách là nhút nhát, nhưng sự lùi bước này là ranh giới sống còn để bảo toàn thành quả.`,
    tuongSo: thacYao?.symbolism || `Tượng rơi vào thế nếu đâm đầu mù quáng ắt sẽ chuốc lấy tai họa. Có tượng "lùi một bước biển rộng trời cao", bảo toàn tính mạng và nguồn lực quan trọng hơn hư danh.`,
    hanhDongThuan: `Phòng ngừa mặt trái đối lập và giữ vững giới hạn an toàn (${thacHex.name} - ${thacLineName}): ${thacActionThuanRaw} Luôn chừa đường lui, biết điểm dừng đúng lúc, chuẩn bị phương án dự phòng khi thái cực nghịch chuyển.`,
    hanhDongNguoc: `Sa vào cạm bẫy cực đoan của quẻ Thác: ${thacActionNguocRaw} Đánh cược liều lĩnh, đẩy mâu thuẫn lên đỉnh điểm khiến biến cát thành hung, rơi vào hiểm cảnh khôn cùng.`,
    tuongY: getKhongMinhTuongY(thacHex.number, activeLine),
  };

  // 5. Tổng hợp Hành Động Thuận Nghịch đúc kết từ 3 quẻ phụ
  const tongHopHanhDong: TongHopHanhDongThuanNghich = {
    thuan: {
      tieuDe: "HÀNH ĐỘNG THUẬN (ĐẮC THỜI - HỢP NGOẠI - AN NỘI - VỮNG NỀN)",
      chinh: hanhDongThuan,
      tong: queTong.hanhDongThuan,
      ho: queHo.hanhDongThuan,
      thac: queThac.hanhDongThuan,
      loiKhuyenCotLoi: `Hợp nhất 4 góc nhìn: Chủ động giữ đạo trung chính (${targetHex.name}), hòa hợp và tôn trọng nhịp đối phương (${tongHex.name}), định tĩnh làm chủ động lực nội tâm (${hoHex.name}), và chủ động phòng ngừa lằn ranh đỏ từ mặt trái đối lập (${thacHex.name}).`,
    },
    nghich: {
      tieuDe: "HÀNH ĐỘNG NGHỊCH (NGHỊCH LÝ - CƯỠNG CẦU - RẠN NỨT - TAI HỌA)",
      chinh: hanhDongNguoc,
      tong: queTong.hanhDongNguoc,
      ho: queHo.hanhDongNguoc,
      thac: queThac.hanhDongNguoc,
      canhBaoCotLoi: `Tuyệt đối tránh: Nôn nóng manh động từ chủ quan (${targetHex.name}), áp đặt cưỡng ép đối phương (${tongHex.name}), buông lỏng tự kỷ luật nội tâm (${hoHex.name}), và bước qua lằn ranh đỏ của cực đoan đối lập (${thacHex.name}).`,
    },
  };

  return {
    hexNumber: targetHex.number,
    hexName: targetHex.name.toUpperCase(),
    hexHanzi: canonicalHex?.hanzi || targetHex.hanzi,
    activeLine,
    lineName,
    coreLine: {
      loiHao,
      nghiaLy,
      tuongSo,
      viTri,
      hanhDongThuan,
      hanhDongNguoc,
      tuongY: coreTuongY,
    },
    queTong,
    queHo,
    queThac,
    tongHopHanhDong,
  };
}
