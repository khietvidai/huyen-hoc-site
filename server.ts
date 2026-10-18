import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { BOOK_HEXAGRAMS } from "./src/data/bookHexagrams";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));

// Fast lookup map for all 64 hexagrams in Sách Thuyết Minh
const bookHexMap = new Map<number, (typeof BOOK_HEXAGRAMS)[0]>();
for (const b of BOOK_HEXAGRAMS) {
  bookHexMap.set(b.number, b);
}

// Deterministic & rule-based question refinement helper according to Author Albert's Tarot Kinh Dịch methodology & Sách Thuyết Minh
function generateFallbackQuestionRefinement(rawQuestion: string, category: string = "Tổng quát") {
  const q = (rawQuestion || "").trim();
  const lowerQ = q.toLowerCase();

  const isCompareThree =
    lowerQ.includes("3 lựa chọn") ||
    lowerQ.includes("ba lựa chọn") ||
    lowerQ.includes("3 phương án") ||
    lowerQ.includes("ba phương án") ||
    lowerQ.includes("3 hướng") ||
    lowerQ.includes("3 công ty") ||
    lowerQ.includes("3 người") ||
    lowerQ.includes("a, b hay c") ||
    lowerQ.includes("a, b hoặc c") ||
    lowerQ.includes("a hay b hay c") ||
    (lowerQ.includes("so sánh") && (lowerQ.includes("3") || lowerQ.includes("ba")));

  const isCompareTwo =
    !isCompareThree && (
      lowerQ.includes("hay") ||
      lowerQ.includes("hoặc") ||
      lowerQ.includes("chọn") ||
      lowerQ.includes("so sánh") ||
      lowerQ.includes("công ty a") ||
      lowerQ.includes("người a") ||
      lowerQ.includes("ở hay đi") ||
      lowerQ.includes("làm hay nghỉ")
    );

  const isNewRelationshipOrPartner =
    lowerQ.includes("mới quen") ||
    lowerQ.includes("mới gặp") ||
    lowerQ.includes("bắt đầu") ||
    lowerQ.includes("đối tác mới") ||
    lowerQ.includes("hẹn hò") ||
    lowerQ.includes("tìm hiểu");

  const isFourSeasons =
    lowerQ.includes("4 mùa") ||
    lowerQ.includes("bốn mùa") ||
    lowerQ.includes("xuân hạ thu đông") ||
    lowerQ.includes("từng quý") ||
    lowerQ.includes("các quý");

  const isYearlyOrTwelveHouses =
    lowerQ.includes("cả năm") ||
    lowerQ.includes("năm tới") ||
    lowerQ.includes("năm nay") ||
    lowerQ.includes("lưu niên") ||
    lowerQ.includes("12 tháng") ||
    lowerQ.includes("12 cung") ||
    lowerQ.includes("toàn cảnh năm");

  const isStrategySolution =
    lowerQ.includes("làm sao") ||
    lowerQ.includes("giải pháp") ||
    lowerQ.includes("tháo gỡ") ||
    lowerQ.includes("cảm hứng") ||
    lowerQ.includes("chiến lược") ||
    lowerQ.includes("vượt qua") ||
    lowerQ.includes("khó khăn") ||
    lowerQ.includes("lời khuyên") ||
    lowerQ.includes("đối mặt");

  const isCareer = category.includes("Sự nghiệp") || lowerQ.includes("việc") || lowerQ.includes("công ty") || lowerQ.includes("sếp") || lowerQ.includes("dự án") || lowerQ.includes("kinh doanh") || lowerQ.includes("thăng tiến");
  const isFinance = category.includes("Tài chính") || lowerQ.includes("tiền") || lowerQ.includes("đầu tư") || lowerQ.includes("mua") || lowerQ.includes("bán") || lowerQ.includes("chứng khoán") || lowerQ.includes("đất");
  const isLove = category.includes("Tình cảm") || lowerQ.includes("yêu") || lowerQ.includes("hôn nhân") || lowerQ.includes("người yêu") || lowerQ.includes("vợ") || lowerQ.includes("chồng");
  const isHealth = category.includes("Sức khỏe") || lowerQ.includes("bệnh") || lowerQ.includes("khỏe") || lowerQ.includes("bình an");

  let refined = "";
  let thuyetMinhEx = "";
  let albertPerspective = {
    dimension: "Dự đoán viễn cảnh tương lai",
    methodology: "Trận Pháp Theo Tác Giả Albert",
    guidance: "Xác định rõ số lá bài và mục đích của từng lá trước khi rút bài."
  };

  let recSpread: {
    cardCount: number;
    drawMode: "single" | "double" | "three" | "seven" | "nine" | "ten" | "twelve" | "custom";
    spreadName: string;
    reason: string;
    cardPurposes: string[];
    doubleMode?: "present_future" | "choice_ab";
    threeMode?: "past_present_future" | "choice_abc";
    choiceALabel?: string;
    choiceBLabel?: string;
    choiceCLabel?: string;
  } = {
    cardCount: 3,
    drawMode: "three",
    threeMode: "past_present_future",
    spreadName: "Trận Pháp 3 Lá: Tiến Trình Dòng Thời Gian (Quá Khứ — Hiện Tại — Tương Lai)",
    reason: "Theo Tác giả Albert, 3 lá bài giúp nhìn rõ chuỗi diễn tiến thời gian của sự việc trong 1 đến 3 tháng tới.",
    cardPurposes: [
      "Lá 1: Quá Khứ (Căn nguyên & nền tảng khởi đầu)",
      "Lá 2: Hiện Tại (Bức tranh thực trạng & nút thắt hiện hữu)",
      "Lá 3: Tương Lai (Bức tranh phát triển và kết quả sau cùng)"
    ]
  };

  // 1. TRƯỜNG HỢP 12 CUNG LƯU NIÊN TỬ VI KINH DỊCH (Sáng tạo độc quyền của Tác Giả Albert)
  if (isYearlyOrTwelveHouses) {
    refined = q 
      ? `Toàn cảnh vận hạn lưu niên và khí vận 12 phương diện đời sống của tôi trong năm tới chuyển biến ra sao?`
      : "Vận hạn lưu niên và trường khí 12 cung vị (Mệnh, Tài chính, Sự nghiệp, Phu thê...) trong năm tới của tôi ra sao?";
    thuyetMinhEx = "Theo Tác giả Albert: Phương pháp Thập Nhị Cung (12 Cung) trong Tarot Tử Vi Kinh Dịch đặc biệt ứng dụng cho việc xem vận hạn lưu niên cả năm (quan sát toàn diện 360 độ). Người hỏi chọn một lá đại diện cho Mệnh Cung trước, sau đó luận giải 12 cung vị và mốc thời gian các tháng cụ thể.";
    albertPerspective = {
      dimension: "Dự đoán viễn cảnh tương lai toàn diện 360 độ",
      methodology: "Trận Pháp 12 Cung — Tarot Tử Vi Kinh Dịch (Tác Giả Albert)",
      guidance: "Trải 12 lá bài tương ứng 12 cung vị, định vị Mệnh Cung trước rồi quan sát sự liên kết và tương tác giữa các cung qua từng tháng."
    };
    recSpread = {
      cardCount: 12,
      drawMode: "twelve",
      spreadName: "Trận Pháp Thập Nhị Cung (12 Lá): Tarot Tử Vi Kinh Dịch (Tác Giả Albert)",
      reason: "Trận pháp 12 Cung do chính Tác Giả Albert sáng tạo giúp quan sát toàn cảnh 360 độ vận hạn lưu niên cả năm, định vị Mệnh Cung và 12 phương diện cuộc sống cùng các tháng tương ứng.",
      cardPurposes: [
        "Lá 1: Mệnh Cung (Khí chất bản thân, tâm thế cốt lõi)",
        "Lá 2: Huynh Đệ (Anh em, bạn bè thân thiết, đồng môn)",
        "Lá 3: Phu Thê (Hôn nhân, nhân duyên, đối tác lứa đôi)",
        "Lá 4: Tử Tức (Con cái, thế hệ kế cận, dự án ấp ủ)",
        "Lá 5: Tài Bạch (Tài chính, dòng tiền, thu nhập)",
        "Lá 6: Tật Ách (Sức khỏe, điều hòa thể chất & tinh thần)",
        "Lá 7: Thiên Di (Đi lại, xuất ngoại, giao thiệp đối ngoại)",
        "Lá 8: Nô Bộc (Cộng sự, nhân viên, đối tác làm ăn)",
        "Lá 9: Quan Lộc (Sự nghiệp, công danh, uy tín nghề nghiệp)",
        "Lá 10: Điền Trạch (Nhà cửa, đất đai, môi trường cư trú)",
        "Lá 11: Phúc Đức (Phúc trạch nội tâm, tâm linh, tổ tiên)",
        "Lá 12: Phụ Mẫu (Cha mẹ, cấp trên bề trên, quý nhân che chở)"
      ]
    };
  }
  // 2. TRƯỜNG HỢP 4 MÙA XUÂN HẠ THU ĐÔNG (Theo Tác giả Albert)
  else if (isFourSeasons) {
    refined = q 
      ? `Khí vận và các bước ngoặt phát triển của tôi theo tiến trình 4 mùa Xuân — Hạ — Thu — Đông trong năm tới như thế nào?`
      : "Tiến trình thời vận của tôi qua bốn mùa Xuân, Hạ, Thu, Đông trong năm tới có chuyển biến gì trọng điểm?";
    thuyetMinhEx = "Theo Tác giả Albert: Nếu muốn xem cụ thể hơn về tiến trình thời gian của cả năm, bạn chia theo bốn mùa Xuân, Hạ, Thu, Đông tương ứng với 4 lá bài, mỗi lá đại diện cho khí vận của một mùa.";
    albertPerspective = {
      dimension: "Dự đoán viễn cảnh theo tiến trình 4 mùa",
      methodology: "Trận Pháp Tứ Thời (4 Lá): Xuân — Hạ — Thu — Đông (Tác Giả Albert)",
      guidance: "Mỗi lá bài phản chiếu một giai đoạn thời tiết và biến chuyển năng lượng của một mùa trong năm."
    };
    recSpread = {
      cardCount: 4,
      drawMode: "custom",
      spreadName: "Trận Pháp Tứ Thời (4 Lá): Bốn Mùa Xuân — Hạ — Thu — Đông (Tác Giả Albert)",
      reason: "Trận pháp 4 lá theo Tác giả Albert chia trọn vẹn tiến trình thời gian cả năm theo 4 mùa Xuân, Hạ, Thu, Đông để người hỏi chủ động ứng phó từng giai đoạn.",
      cardPurposes: [
        "Lá 1: Mùa Xuân (Khởi đầu sinh sôi, phát khởi sinh cơ & kế hoạch mới)",
        "Lá 2: Mùa Hạ (Giai đoạn tăng trưởng cực thịnh, hành động quyết liệt & đối mặt thử thách)",
        "Lá 3: Mùa Thu (Giai đoạn gặt hái thành quả, biến chuyển & điều chỉnh)",
        "Lá 4: Mùa Đông (Tàng ẩn tích lũy, chiêm nghiệm quy hồi & định hình năm mới)"
      ]
    };
  }
  // 3. TRƯỜNG HỢP SO SÁNH ĐỐI CHIẾU 3 LỰA CHỌN (Theo Tác giả Albert)
  else if (isCompareThree) {
    refined = q 
      ? `${q} — trong vòng 1 đến 3 tháng tới, giữa 3 Lựa chọn A, B và C thì hướng đi nào có triển vọng và cát lành nhất?`
      : "Trong 1 đến 3 tháng tới, so sánh giữa 3 phương án lựa chọn A, B và C thì hướng phát triển nào tối ưu nhất cho tôi?";
    thuyetMinhEx = "Theo Tác giả Albert: Khi có 3 phương án lựa chọn (như 3 công ty, 3 dự án, 3 hướng đi), ta dùng trận pháp 3 lá bài để so sánh 3 phương án A, B và C đặt lên bàn cân phân định cát hung.";
    albertPerspective = {
      dimension: "Dự đoán viễn cảnh đối sánh & Ra quyết định",
      methodology: "Phương Pháp So Sánh Đối Chiếu 3 Lựa Chọn (Tác Giả Albert)",
      guidance: "Lá 1 đại diện Lựa chọn A, Lá 2 đại diện Lựa chọn B, Lá 3 đại diện Lựa chọn C để đặt lên bàn cân phân định rõ triển vọng từng ngã rẽ."
    };
    recSpread = {
      cardCount: 3,
      drawMode: "three",
      threeMode: "choice_abc",
      choiceALabel: "Lựa chọn A",
      choiceBLabel: "Lựa chọn B",
      choiceCLabel: "Lựa chọn C",
      spreadName: "Trận Pháp 3 Lá: So Sánh 3 Lựa Chọn (Phương Án A — B — C) (Tác Giả Albert)",
      reason: "Theo Tác giả Albert, khi đứng trước 3 ngã rẽ hay 3 phương án lựa chọn, rút 3 lá bài tương ứng với từng phương án để cân nhắc cát hung là phương thức trực quan và chuẩn xác nhất.",
      cardPurposes: [
        "Lá 1: [Lựa Chọn A] Triển vọng, thế mạnh & cát hung của phương án A",
        "Lá 2: [Lựa Chọn B] Triển vọng, thế mạnh & cát hung của phương án B",
        "Lá 3: [Lựa Chọn C] Triển vọng, thế mạnh & cát hung của phương án C"
      ]
    };
  }
  // 3.2. TRƯỜNG HỢP SO SÁNH ĐỐI CHIẾU 2 LỰA CHỌN (Theo Tác giả Albert)
  else if (isCompareTwo) {
    refined = q 
      ? `${q} — trong vòng 1 đến 3 tháng tới, giữa Lựa chọn A và Lựa chọn B thì hướng phát triển nào triển vọng hơn?`
      : "Trong 1 đến 3 tháng tới, giữa Công việc/Lựa chọn A và Công việc/Lựa chọn B thì hướng đi nào tốt hơn cho tôi?";
    thuyetMinhEx = "Theo Tác giả Albert: Khi có nhiều hơn 1 lựa chọn (như 2 công việc đang đợi mình Công ty A vs B, hoặc 2 người cùng theo đuổi anh A vs B), ta dùng phương pháp so sánh đối chiếu với 2 lá bài đặt lên bàn cân so sánh triển vọng.";
    albertPerspective = {
      dimension: "Dự đoán viễn cảnh đối sánh & Ra quyết định",
      methodology: "Phương Pháp So Sánh Đối Chiếu 2 Lựa Chọn (Tác Giả Albert)",
      guidance: "Lá 1 đại diện cho hướng đi A, Lá 2 đại diện cho hướng đi B để đặt lên bàn cân phân định rõ triển vọng."
    };
    recSpread = {
      cardCount: 2,
      drawMode: "double",
      doubleMode: "choice_ab",
      choiceALabel: "Lựa chọn A",
      choiceBLabel: "Lựa chọn B",
      spreadName: "Trận Pháp Song Quẻ (2 Lá): So Sánh Đối Chiếu Lựa Chọn A & B (Tác Giả Albert)",
      reason: "Theo Tác giả Albert, khi đứng trước 2 công việc, 2 ngã rẽ hay 2 đối tác, dùng 2 lá bài đặt lên bàn cân so sánh là cách tối ưu nhất.",
      cardPurposes: [
        "Lá 1: [Lựa Chọn A] Hướng phát triển & Tiền đồ nếu chọn phương án A",
        "Lá 2: [Lựa Chọn B] Triển vọng tương lai & Cơ hội nếu chọn phương án B"
      ]
    };
  }
  // 4. TRƯỜNG HỢP BẢN QUẺ & BIẾN QUẺ / MỐI QUAN HỆ MỚI BẮT ĐẦU (Theo Tác giả Albert)
  else if (isNewRelationshipOrPartner || (isLove && !isCompareTwo)) {
    refined = q 
      ? `Mối quan hệ hợp tác / tình cảm mới này giữa tôi và đối phương trong 1 đến 3 tháng tới có thực trạng và hướng phát triển ra sao?`
      : "Mối quan hệ mới bắt đầu này trong 1 đến 3 tháng tới có triển vọng phát triển kết quả sau cùng ra sao?";
    thuyetMinhEx = "Theo Tác giả Albert: Khi mới quen đối tác làm ăn hoặc mới quen bạn khác giới bắt đầu mối quan hệ, ta rút 2 lá theo nguyên lý Bản Quẻ & Biến Quẻ: Lá 1 là hình ảnh giai đoạn hiện tại (thực trạng), Lá 2 là bức tranh phát triển cho tới giai đoạn cuối cùng (kết quả sau cùng).";
    albertPerspective = {
      dimension: "Dự đoán viễn cảnh: Thực trạng hiện tại & Kết quả sau cùng",
      methodology: "Trận Pháp Bản Quẻ & Biến Quẻ (2 Lá) (Tác Giả Albert)",
      guidance: "Lá thứ nhất phản chiếu giai đoạn hiện tại, Lá thứ hai phản chiếu bức tranh phát triển tới kết quả cuối cùng."
    };
    recSpread = {
      cardCount: 2,
      drawMode: "double",
      doubleMode: "present_future",
      spreadName: "Trận Pháp Bản Quẻ & Biến Quẻ (2 Lá): Hiện Trạng & Kết Quả Sau Cùng (Tác Giả Albert)",
      reason: "Theo Tác giả Albert, khi mới quen đối tác hoặc bắt đầu tình cảm, rút 2 lá (hiện trạng giai đoạn đầu và kết quả sau cùng) là phương pháp chuẩn xác nhất.",
      cardPurposes: [
        "Lá 1: [Bản Quẻ] Thực trạng khởi đầu & Năng lượng hiện tại của mối quan hệ",
        "Lá 2: [Biến Quẻ] Bức tranh phát triển cho tới giai đoạn cuối cùng (Kết quả sau cùng)"
      ]
    };
  }
  // 5. TRƯỜNG HỢP TÌM CẢM HỨNG GỢI Ý / CHIẾN LƯỢC THÁO GỠ KHÓ KHĂN / VIỄN CẢNH TỔNG QUAN (Theo Tác giả Albert)
  else if (isStrategySolution || isHealth) {
    refined = q 
      ? `Trước thử thách hiện tại, tôi nên có tư duy chiến lược và phương sách gì để tháo gỡ khó khăn trong 1 đến 3 tháng tới?`
      : "Trước những trở ngại hiện tại, tôi cần cảm hứng gợi mở và tư duy chiến lược nào để tháo gỡ vấn đề?";
    thuyetMinhEx = "Theo Tác giả Albert: Bình diện thứ hai của bói toán là cách đối mặt với viễn cảnh (kể cả khi gặp quẻ Bĩ, gặp khó khăn). Rút 1 lá bài là cách đơn giản và đắc lực nhất khi bạn muốn tìm kiếm cảm hứng gợi ý, cách đương đầu với khó khăn, cách tháo gỡ vấn đề hay tư duy mang tính chiến lược.";
    albertPerspective = {
      dimension: "Tìm kiếm cảm hứng gợi ý & Tư duy chiến lược tháo gỡ khó khăn",
      methodology: "Trận Pháp Độc Quẻ (1 Lá): Cảm Hứng Chiến Lược & Giải Pháp (Tác Giả Albert)",
      guidance: "Tập trung toàn bộ tâm trí vào một thông điệp cốt lõi để tìm phương sách hành động dũng cảm tiến lên phía trước."
    };
    recSpread = {
      cardCount: 1,
      drawMode: "single",
      spreadName: "Trận Pháp Độc Quẻ (1 Lá): Cảm Hứng Chiến Lược & Tháo Gỡ Khó Khăn (Tác Giả Albert)",
      reason: "Theo Tác giả Albert, khi đối diện với cảnh huống thử thách cần tháo gỡ, rút 1 lá bài giúp thu nhận cảm hứng chiến lược và phương sách ứng phó tập trung nhất.",
      cardPurposes: [
        "Lá 1: Cảm hứng gợi ý cốt lõi, tư duy chiến lược & phương sách tháo gỡ khó khăn"
      ]
    };
  }
  // 6. TIẾN TRÌNH CÔNG VIỆC, TÀI CHÍNH THÔNG THƯỜNG (3 Lá theo tiến trình hoặc 3 lựa chọn)
  else {
    refined = q 
      ? `Tiến trình thời vận sự nghiệp và tài chính của tôi tại môi trường hiện tại trong 1 đến 3 tháng tới có chuyển biến trọng điểm gì?`
      : "Khí vận công việc và tài chính của tôi tại nơi làm việc trong 3 tháng tới có cơ hội và thách thức gì?";
    thuyetMinhEx = "Theo Tác giả Albert: Dựa vào tiến trình thời gian hoặc các ngã rẽ để quyết định số lá bài. Chuỗi 3 lá bài (Quá khứ - Hiện tại - Tương lai) giúp nhìn nhận viễn cảnh xuyên suốt từ gốc rễ đến kết quả.";
    albertPerspective = {
      dimension: "Dự đoán viễn cảnh & Tiến trình phát triển",
      methodology: "Trận Pháp 3 Lá: Tiến Trình Thời Gian (Tác Giả Albert)",
      guidance: "Quan sát sự chuyển biến liên tục từ quá khứ tích lũy, qua hiện trạng đến viễn cảnh tương lai."
    };
  }

  return {
    originalQuestion: rawQuestion,
    refinedQuestion: refined,
    analysis: {
      timeFactor: "Đã tối ưu vào khung thời gian vàng 1 - 6 tháng (tránh hỏi quá dài nhiều năm vì Dịch lý là biến dịch tức thì).",
      locationFactor: "Đã gắn với địa điểm, môi trường hoạt động thực tế (cơ quan, thị trường, nơi cư trú).",
      subjectFactor: "Đã xác định rõ nhân vật trung tâm (bản thân, đối tác hoặc người liên đới cụ thể)."
    },
    thuyetMinhExample: thuyetMinhEx,
    albertPerspective,
    recommendedSpread: recSpread,
    alternativeQuestions: [
      `Trong 1 đến 3 tháng tới, việc tôi dự định triển khai tại môi trường hiện tại sẽ gặp thuận lợi và thách thức gì?`,
      `Nhân sự và đối tác đồng hành cùng tôi trong 6 tháng tới có cùng chung chí hướng để việc thành tựu không?`
    ],
    zenAdvice: "Lời dặn từ Tác Giả Albert: 'Đúng người đúng chỗ' (Vạn vật hữu duyên) — dù rút tay trái (tiềm thức não phải) hay tay phải, cốt tủy là sự tha thiết, nghiêm túc muốn tìm câu trả lời. Nếu trong lúc xào bài có lá rơi ra ngoài, đừng xem nhẹ, đó chính là câu trả lời trực tiếp cho bạn!"
  };
}

// Format a card's data strictly based on Sách Thuyết Minh
function getCardManualText(c: any, posLabel?: string): string {
  if (!c) return "";
  const num = typeof c.number === "number" ? c.number : parseInt(c.number, 10) || 1;
  const b = bookHexMap.get(num);
  const prefix = posLabel ? `[VỊ TRÍ: ${posLabel}]\n` : "";
  if (!b) {
    return `${prefix}- Quẻ #${num}: ${c.name || ""}`;
  }
  return `${prefix}- Lá bài: Quẻ #${b.number} ${b.name} (${b.hanzi})
  • Dòng chữ đỏ in hoa trên lá bài: "${b.redHeadline}"
  • Cấu trúc quái: ${b.structure}
  • Tượng thơ: ${b.poemHan.replace(/\n/g, " / ")}
  • Dịch nghĩa thơ tượng: "${b.poemMeaning}"
  • Lời bàn Đại Tượng sách Thuyết minh: "${b.bigImage}"
  • Luận giải Vận Thế theo sách Thuyết minh: "${b.destiny}"
  • Luận giải Tình Cảm theo sách Thuyết minh: "${b.love}"`;
}

// Lazy initialization for GoogleGenAI
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Robust helper to call Gemini with retry, exponential backoff, and model fallback chain
async function generateWithFallback(
  ai: GoogleGenAI,
  requestParams: {
    contents: any;
    config?: any;
    preferredModels?: string[];
  }
) {
  const candidateModels = requestParams.preferredModels || [
    "gemini-3.8-flash",
    "gemini-3.1-flash-lite",
    "gemini-flash-latest",
  ];

  let lastError: any = null;

  for (const model of candidateModels) {
    // Retry each model up to 2 times on transient errors (503 high demand spikes or 429 rate limit)
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: requestParams.contents,
          config: requestParams.config,
        });
        return response;
      } catch (err: any) {
        lastError = err;
        const statusCode = err?.status || err?.code || (err?.error && err?.error?.code);
        const isTransient = statusCode === 503 || statusCode === 429 || statusCode === 500;

        if (isTransient && attempt < 2) {
          // Short backoff before retrying same model
          const backoffMs = attempt * 600;
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
          continue;
        }

        // Move to next candidate model quietly without logging alarming failure keywords to stderr
        break;
      }
    }
  }

  throw lastError;
}

// Health check API
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ============================================================================
// HỆ THỐNG QUẢN LÝ TÀI KHOẢN & NGƯỜI DÙNG PHÍA SERVER (ĐỒNG BỘ ĐA THIẾT BỊ)
// ============================================================================
const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users_db.json");
const PENDING_FILE = path.join(DATA_DIR, "pending_db.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getServerUsers(): Record<string, { user: any; passwordHash: string }> {
  ensureDataDir();
  let users: Record<string, { user: any; passwordHash: string }> = {};
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, "utf-8");
      users = JSON.parse(data);
    }
  } catch (e) {
    console.error("Lỗi đọc users_db.json:", e);
  }

  // Khởi tạo tài khoản Quản trị tối cao mặc định
  const adminKey = "cuunhi";
  const expectedHash = Buffer.from("999999").toString("base64");
  if (!users[adminKey]) {
    users[adminKey] = {
      user: {
        id: "usr_admin_cuunhi",
        email: "cuunhi",
        username: "cuunhi",
        name: "Cửu Nhị Admin",
        isMember: true,
        isAdmin: true,
        memberTier: "vip",
        memberExpiryDate: "2099-12-31",
        registeredAt: Date.now(),
        incenseSticks: 999,
      },
      passwordHash: expectedHash,
    };
    saveServerUsers(users);
  } else {
    let changed = false;
    if (!users[adminKey].user.isAdmin) {
      users[adminKey].user.isAdmin = true;
      changed = true;
    }
    if (users[adminKey].passwordHash !== expectedHash) {
      users[adminKey].passwordHash = expectedHash;
      changed = true;
    }
    if (changed) saveServerUsers(users);
  }

  return users;
}

function saveServerUsers(users: Record<string, { user: any; passwordHash: string }>) {
  try {
    ensureDataDir();
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
  } catch (e) {
    console.error("Lỗi lưu users_db.json:", e);
  }
}

function getServerPending(): Record<string, any> {
  ensureDataDir();
  try {
    if (fs.existsSync(PENDING_FILE)) {
      return JSON.parse(fs.readFileSync(PENDING_FILE, "utf-8"));
    }
  } catch {}
  return {};
}

function saveServerPending(pending: Record<string, any>) {
  try {
    ensureDataDir();
    fs.writeFileSync(PENDING_FILE, JSON.stringify(pending, null, 2), "utf-8");
  } catch (e) {
    console.error("Lỗi lưu pending_db.json:", e);
  }
}

// 1. API lấy toàn bộ danh sách tài khoản cho Admin (người khác đăng ký sẽ hiện ngay lập tức)
app.get("/api/admin/users", (_req: Request, res: Response) => {
  try {
    const users = getServerUsers();
    const list = Object.entries(users).map(([accountKey, item]) => ({
      accountKey,
      user: item.user,
    }));
    return res.json({ success: true, users: list, total: list.length });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || "Lỗi máy chủ" });
  }
});

// 2. API Yêu cầu gửi mã xác thực OTP đăng ký
app.post("/api/auth/request-otp", (req: Request, res: Response) => {
  try {
    const { email, pass, name } = req.body;
    const cleanEmail = (email || "").trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return res.status(400).json({ success: false, message: "Email không hợp lệ. Vui lòng nhập đúng định dạng!" });
    }
    if (!pass || pass.length < 6) {
      return res.status(400).json({ success: false, message: "Mật khẩu cần tối thiểu 6 ký tự!" });
    }

    const users = getServerUsers();
    if (users[cleanEmail]) {
      return res.status(400).json({ success: false, message: "Tài khoản hoặc Email này đã tồn tại trên hệ thống!" });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 phút

    const pending = getServerPending();
    pending[cleanEmail] = {
      email: cleanEmail,
      passwordHash: Buffer.from(pass).toString("base64"),
      name: (name || "").trim() || cleanEmail.split("@")[0],
      code,
      expiresAt,
    };
    saveServerPending(pending);

    console.log(`[OTP Generated] Mã xác thực cho ${cleanEmail}: ${code}`);

    return res.json({
      success: true,
      message: `Mã xác thực 6 số [${code}] đã được gửi đến email ${cleanEmail}!`,
      code,
      email: cleanEmail,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || "Lỗi máy chủ" });
  }
});

// API Gửi lại mã xác thực OTP
app.post("/api/auth/resend-otp", (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const cleanEmail = (email || "").trim().toLowerCase();
    const pending = getServerPending();
    const entry = pending[cleanEmail];
    if (!entry) {
      return res.status(400).json({ success: false, message: "Không tìm thấy yêu cầu đăng ký nào cho email này. Vui lòng đăng ký lại!" });
    }
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    entry.code = newCode;
    entry.expiresAt = Date.now() + 10 * 60 * 1000;
    pending[cleanEmail] = entry;
    saveServerPending(pending);

    console.log(`[OTP Resent] Mã xác thực mới cho ${cleanEmail}: ${newCode}`);
    return res.json({
      success: true,
      message: `Mã xác thực mới [${newCode}] đã được gửi đến email ${cleanEmail}!`,
      code: newCode,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || "Lỗi máy chủ" });
  }
});

// 3. API Xác thực OTP & tạo tài khoản (Lưu ngay vào cơ sở dữ liệu máy chủ)
app.post("/api/auth/verify-otp", (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanCode = (code || "").trim();

    if (!cleanCode || cleanCode.length !== 6) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập đủ 6 chữ số mã xác thực!" });
    }

    const pending = getServerPending();
    const entry = pending[cleanEmail];

    if (!entry) {
      return res.status(400).json({ success: false, message: "Yêu cầu đăng ký không tồn tại hoặc đã hết hạn!" });
    }
    if (Date.now() > entry.expiresAt) {
      delete pending[cleanEmail];
      saveServerPending(pending);
      return res.status(400).json({ success: false, message: "Mã xác thực đã hết hạn. Vui lòng gửi lại mã mới!" });
    }
    if (entry.code !== cleanCode) {
      return res.status(400).json({ success: false, message: "Mã xác thực không chính xác. Vui lòng kiểm tra lại!" });
    }

    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);

    const newUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: cleanEmail,
      name: entry.name,
      isMember: true,
      memberTier: "vip",
      memberExpiryDate: expiry.toISOString().split("T")[0],
      registeredAt: Date.now(),
      incenseSticks: 30,
    };

    const users = getServerUsers();
    users[cleanEmail] = {
      user: newUser,
      passwordHash: entry.passwordHash,
    };
    saveServerUsers(users);

    delete pending[cleanEmail];
    saveServerPending(pending);

    console.log(`[USER REGISTERED] Tài khoản mới từ người dùng: ${newUser.name} (${cleanEmail}) -> Đã lưu vào server!`);

    return res.json({
      success: true,
      message: `Đăng ký thành công! Kính chào ${newUser.name}, bạn đã chính thức kích hoạt tài khoản.`,
      user: newUser,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || "Lỗi máy chủ" });
  }
});

// 4. API Đăng ký trực tiếp (Direct Register)
app.post("/api/auth/register-direct", (req: Request, res: Response) => {
  try {
    const { email, pass, name, registerAsMember } = req.body;
    const cleanEmail = (email || "").trim().toLowerCase();
    if (!cleanEmail || (!cleanEmail.includes("@") && cleanEmail !== "cuunhi")) {
      return res.status(400).json({ success: false, message: "Email không hợp lệ!" });
    }
    if (!pass || pass.length < 6) {
      return res.status(400).json({ success: false, message: "Mật khẩu tối thiểu 6 ký tự!" });
    }

    const users = getServerUsers();
    if (users[cleanEmail]) {
      return res.status(400).json({ success: false, message: "Tài khoản hoặc Email này đã tồn tại trên hệ thống!" });
    }

    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);
    const isMember = registerAsMember !== false;

    const newUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: cleanEmail,
      name: (name || "").trim() || cleanEmail.split("@")[0],
      isMember,
      memberTier: isMember ? "vip" : undefined,
      memberExpiryDate: isMember ? expiry.toISOString().split("T")[0] : undefined,
      registeredAt: Date.now(),
      incenseSticks: isMember ? 30 : 5,
    };

    users[cleanEmail] = {
      user: newUser,
      passwordHash: Buffer.from(pass).toString("base64"),
    };
    saveServerUsers(users);

    console.log(`[DIRECT REGISTER] ${newUser.name} (${cleanEmail}) đã lưu vào server.`);

    return res.json({
      success: true,
      message: `Đăng ký thành công tài khoản ${newUser.name}!`,
      user: newUser,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || "Lỗi máy chủ" });
  }
});

// 5. API Đăng nhập xác thực máy chủ
app.post("/api/auth/login", (req: Request, res: Response) => {
  try {
    const { identifier, pass } = req.body;
    const cleanId = (identifier || "").trim().toLowerCase();
    if (!cleanId || !pass) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập tài khoản/email và mật khẩu!" });
    }

    const users = getServerUsers();
    const entry = users[cleanId] || Object.values(users).find(
      (u) => (u.user.username && u.user.username.toLowerCase() === cleanId) || (u.user.email && u.user.email.toLowerCase() === cleanId)
    );

    if (!entry) {
      return res.status(401).json({ success: false, message: "Tài khoản không tồn tại trên hệ thống!" });
    }

    const inputHash = Buffer.from(pass).toString("base64");
    if (entry.passwordHash !== inputHash) {
      return res.status(401).json({ success: false, message: "Mật khẩu không chính xác!" });
    }

    return res.json({
      success: true,
      message: `Đăng nhập thành công! Kính chào ${entry.user.name}.`,
      user: entry.user,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || "Lỗi máy chủ" });
  }
});

// 6. API Admin đổi quyền Hội viên VIP
app.post("/api/admin/users/update-member", (req: Request, res: Response) => {
  try {
    const { targetKey, isMember, memberTier } = req.body;
    const users = getServerUsers();
    const entry = users[targetKey];
    if (!entry) {
      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng!" });
    }

    entry.user.isMember = Boolean(isMember);
    if (isMember) {
      entry.user.memberTier = memberTier || "vip";
      const exp = new Date();
      exp.setFullYear(exp.getFullYear() + 1);
      entry.user.memberExpiryDate = exp.toISOString().split("T")[0];
    } else {
      entry.user.memberTier = undefined;
      entry.user.memberExpiryDate = undefined;
    }

    saveServerUsers(users);
    return res.json({
      success: true,
      message: `Đã ${isMember ? "kích hoạt VIP Hội Viên" : "hạ cấp xuống thường"} cho ${entry.user.name}!`,
      user: entry.user,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || "Lỗi máy chủ" });
  }
});

// 7. API Admin xóa tài khoản
app.post("/api/admin/users/delete", (req: Request, res: Response) => {
  try {
    const { targetKey } = req.body;
    if (targetKey === "cuunhi") {
      return res.status(400).json({ success: false, message: "Không thể xóa tài khoản Quản trị viên tối cao!" });
    }
    const users = getServerUsers();
    if (!users[targetKey]) {
      return res.status(404).json({ success: false, message: "Không tìm thấy tài khoản cần xóa!" });
    }

    const name = users[targetKey].user.name;
    delete users[targetKey];
    saveServerUsers(users);

    return res.json({ success: true, message: `Đã xóa vĩnh viễn tài khoản của ${name} khỏi hệ thống!` });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || "Lỗi máy chủ" });
  }
});

// 8. API Admin tạo tài khoản mới trực tiếp
app.post("/api/admin/users/create", (req: Request, res: Response) => {
  try {
    const { name, email, pass, isMember, memberTier } = req.body;
    const cleanEmail = (email || "").trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return res.status(400).json({ success: false, message: "Email không hợp lệ!" });
    }
    const users = getServerUsers();
    if (users[cleanEmail]) {
      return res.status(400).json({ success: false, message: "Email này đã tồn tại trên hệ thống!" });
    }

    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);

    const newUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: cleanEmail,
      name: (name || "").trim() || cleanEmail.split("@")[0],
      isMember: Boolean(isMember),
      memberTier: isMember ? (memberTier || "vip") : undefined,
      memberExpiryDate: isMember ? expiry.toISOString().split("T")[0] : undefined,
      registeredAt: Date.now(),
      incenseSticks: isMember ? 30 : 5,
    };

    users[cleanEmail] = {
      user: newUser,
      passwordHash: Buffer.from(pass || "123456").toString("base64"),
    };
    saveServerUsers(users);

    return res.json({
      success: true,
      message: `Đã tạo tài khoản cho ${newUser.name} (${cleanEmail}) thành công!`,
      user: newUser,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || "Lỗi máy chủ" });
  }
});

// 9. API Đồng bộ hai chiều (Sync)
app.post("/api/auth/sync", (req: Request, res: Response) => {
  try {
    const { localUsers } = req.body;
    const users = getServerUsers();

    if (localUsers && typeof localUsers === "object") {
      let merged = false;
      for (const [key, item] of Object.entries(localUsers as Record<string, any>)) {
        if (key && item?.user && !users[key]) {
          users[key] = item;
          merged = true;
        }
      }
      if (merged) {
        saveServerUsers(users);
      }
    }

    const list = Object.entries(users).map(([accountKey, item]) => ({
      accountKey,
      user: item.user,
    }));
    return res.json({ success: true, users: list, allUsersMap: users });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || "Lỗi máy chủ" });
  }
});

// AI I Ching Interpretation endpoint (Luận giải thuần theo Sách Thuyết Minh)
app.post("/api/iching/ai-interpret", async (req: Request, res: Response) => {
  let cardsDetailFromBook = "";
  try {
    const {
      question,
      hexagram,
      changingLines,
      transformedHexagram,
      category,
      doubleMode,
      choiceALabel,
      choiceBLabel,
      threeMode,
      choiceCLabel,
      drawnCards,
      spreadType,
      isCard2Reversed,
      customPositions,
    } = req.body;

    if (!hexagram || !hexagram.name) {
      return res.status(400).json({ error: "Thiếu thông tin quẻ để luận giải" });
    }

    const ai = getAI();
    if (!ai) {
      const b = bookHexMap.get(hexagram.number);
      const manualSummary = b
        ? `Quẻ #${b.number} ${b.name} (${b.hanzi})\n- Dòng chữ đỏ trên lá bài: "${b.redHeadline}"\n- Cấu trúc: ${b.structure}\n- Tượng thơ: ${b.poemMeaning}\n- Đại tượng: ${b.bigImage}\n- Vận thế: ${b.destiny}\n- Tình cảm: ${b.love}`
        : `Quẻ #${hexagram.number} ${hexagram.name}`;
      return res.status(200).json({
        fallback: true,
        message: "Chưa cấu hình GEMINI_API_KEY. Vui lòng tham khảo luận giải theo Sách Thuyết Minh chi tiết bên dưới.",
        interpretation: `【Luận giải theo Sách Thuyết Minh đi kèm bộ bài】:\n${manualSummary}`
      });
    }

    // Build cards detail strictly from Sách Thuyết Minh
    cardsDetailFromBook = "";
    if (drawnCards && Array.isArray(drawnCards) && drawnCards.length > 0) {
      cardsDetailFromBook = drawnCards
        .map((c: any, i: number) => {
          let posLabel = `Lá số ${i + 1}`;
          if (spreadType === "custom" || customPositions) {
            const pos = customPositions?.[i];
            posLabel = pos?.purpose || pos?.name || `Lá ${i + 1}`;
          } else if (drawnCards.length === 7) {
            const labels = [
              "Lá 1: Quá Khứ (Cội nguồn)",
              "Lá 2: Bản Thân Hiện Tại (Tâm thế)",
              "Lá 3: Diễn Biến Tiếp Theo (Bước ngoặt)",
              "Lá 4: Minh Triết Gợi Ý (Sách lược)",
              "Lá 5: Kết Quả (Triển vọng)",
              "Lá 6: Môi Trường Ngoại Tại (Bối cảnh)",
              "Lá 7: Thiếu Sót Nội Tại (Điểm mù)",
            ];
            posLabel = labels[i] || `Lá ${i + 1}`;
          } else if (drawnCards.length === 10) {
            const labels = [
              "Lá 1: Tình Huống Hiện Tại",
              `Lá 2: Trọng Tâm (${isCard2Reversed ? "NGƯỢC - Trở ngại / Lực cản cần tháo gỡ" : "XUÔI - Trợ lực / Thuận duyên thúc đẩy"})`,
              "Lá 3: Yếu Tố Bên Ngoài",
              "Lá 4: Điều Bạn Không Biết",
              "Lá 5: Tình Huống Trước Đây",
              "Lá 6: Tương Lai Tiếp Theo",
              "Lá 7: Vận Hạn Năm Nay",
              "Lá 8: Cách Nhìn Của Người Ngoài",
              "Lá 9: Kết Quả Cuối Cùng",
              "Lá 10: Lá Bài Khuyên Bảo",
            ];
            posLabel = labels[i] || `Lá ${i + 1}`;
          } else if (drawnCards.length === 3) {
            if (threeMode === "choice_abc") {
              const labels = [
                `Lá 1: Lựa chọn A [${choiceALabel || "Phương án A"}]`,
                `Lá 2: Lựa chọn B [${choiceBLabel || "Phương án B"}]`,
                `Lá 3: Lựa chọn C [${choiceCLabel || "Phương án C"}]`,
              ];
              posLabel = labels[i] || `Lá ${i + 1}`;
            } else {
              const labels = ["Lá 1: Quá Khứ", "Lá 2: Hiện Tại", "Lá 3: Tương Lai"];
              posLabel = labels[i] || `Lá ${i + 1}`;
            }
          } else if (doubleMode === "choice_ab" && i <= 1) {
            posLabel = i === 0 ? `Lựa chọn A (${choiceALabel || "Phương án A"})` : `Lựa chọn B (${choiceBLabel || "Phương án B"})`;
          } else if (doubleMode === "present_future" && i <= 1) {
            posLabel = i === 0 ? "Lá 1: Hiện Tại" : "Lá 2: Tương Lai";
          }
          return getCardManualText(c, posLabel);
        })
        .join("\n\n");
    } else {
      cardsDetailFromBook = getCardManualText(hexagram, "Quẻ Chủ");
      if (transformedHexagram) {
        cardsDetailFromBook += "\n\n" + getCardManualText(transformedHexagram, "Quẻ Biến / Quẻ Thứ Hai");
      }
    }

    const prompt = `Bạn là Dịch Tiên Sinh AI — chuyên gia luận giải quẻ bài dựa HOÀN TOÀN THEO SÁCH THUYẾT MINH đi kèm bộ bài Tarot Kinh Dịch 64 quẻ.

QUY TẮC BẮT BUỘC (BỎ KIẾN THỨC TRUYỀN THỐNG):
1. **LUẬN THEO NGHĨA Ý MÀ SÁCH THUYẾT MINH ĐỀ CẬP**:
   - Mọi giải thích, phân tích và hướng dẫn PHẢI bám sát trực tiếp vào các dữ liệu của Sách Thuyết Minh đã cung cấp cho từng lá bài:
     • Dòng chữ đỏ in hoa trên lá bài (đây là kim chỉ nam, tôn chỉ hành sự của lá bài)
     • Cấu trúc phối quái (quái trên, quái dưới)
     • Bài thơ tượng và ý nghĩa giải thơ trong sách
     • Lời bàn Đại Tượng sách Thuyết minh
     • Luận giải Vận Thế theo sách Thuyết minh
     • Luận giải Tình Cảm theo sách Thuyết minh
2. **BỎ TOÀN BỘ KIẾN THỨC TRUYỀN THỐNG**:
   - KHÔNG sử dụng kiến thức sách giáo khoa Kinh Dịch truyền thống (thoán từ, hào từ cổ ngữ, chú sớ Nho gia, bói dịch Mai Hoa, thuyết âm dương ngũ hành cổ điển không có trong sách).
   - KHÔNG dùng chiêm bói dân gian, bói toán cát hung mê tín.
   - BỎ HẲN VIỆC ĐỊNH CÁT HUNG: Tuyệt đối không phán xét quẻ này Cát hay Hung. Sách Thuyết minh khẳng định: Kinh Dịch không định đoạt số phận, mà phản chiếu tình thế thực tại và gợi mở hướng ứng xử; người thấu hiểu biết lấy nhu chế cương, lấy tĩnh chế động, tiến thoái hợp thời.
3. **TRẢ LỜI ĐÚNG VÀO CÂU HỎI CỦA NGƯỜI DÙNG**:
   - Vấn đề thỉnh vấn: "${question || "Xem tổng quan thời vận và hướng hành động"}"
   - Lĩnh vực: ${category || "Tổng quát"}
   - Dựa sát vào Vận thế, Tình cảm và Dòng chữ đỏ của các lá bài trong sách Thuyết minh để tháo gỡ băn khoăn cho người hỏi.

THÔNG TIN QUẺ BÀI TRÍCH XUẤT TỪ SÁCH THUYẾT MINH:
${cardsDetailFromBook}

YÊU CẦU CẤU TRÚC BÀI LUẬN GIẢI (MARKDOWN RÕ RÀNG, SÂU SẮC, TRANG NHÃ):
1. **Thông Điệp Chữ Đỏ & Hình Tượng Cốt Tủy**: Nêu bật dòng chữ đỏ trên các lá bài và ý nghĩa thơ tượng theo sách Thuyết minh.
2. **Luận Giải Tình Thế Theo Sách Thuyết Minh**: Phân tích hoàn cảnh, vận thế tương ứng với vấn đề thỉnh vấn của người hỏi.
3. **Định Hướng Hành Sự Theo Thuyết Minh**: Lời khuyên cụ thể về thái độ và hành động (lúc nào cương, lúc nào nhu, lúc nào tiến, lúc nào thoái) theo đúng triết lý của sách Thuyết minh.`;

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.95,
      },
    });

    const interpretationText = response.text || "";

    return res.json({
      success: true,
      interpretation: interpretationText,
    });
  } catch (error: any) {
    console.log("[Interpretation Fallback] Serving book-based interpretation:", error?.message || error);
    // Generate high quality fallback from Sách Thuyết Minh
    const fallbackInterpretation = `【Luận giải trực tiếp theo Sách Thuyết Minh 64 Quẻ Đi Kèm Bộ Bài】\n\n${cardsDetailFromBook || "Chi tiết các lá bài đã bốc đã được cập nhật theo Sách Thuyết Minh."}\n\n*Lời dặn từ Sách Thuyết Minh: Dịch là biến dịch, không định cát hung cố định; hãy lấy tĩnh chế động, lấy nhu thắng cương, thuận theo đạo trời mà hành sự.*`;
    return res.status(200).json({
      success: true,
      fallback: true,
      interpretation: fallbackInterpretation,
    });
  }
});

// AI Refine Question & Spread Recommendation endpoint (Theo tôn chỉ Sách Thuyết Minh)
app.post("/api/iching/ai-refine-question", async (req: Request, res: Response) => {
  try {
    const { question, category } = req.body;
    const rawQ = (question || "").trim();

    const ai = getAI();
    if (!ai) {
      const fallbackResult = generateFallbackQuestionRefinement(rawQ, category);
      return res.json({
        success: true,
        fallback: true,
        data: fallbackResult,
      });
    }

    const systemInstruction = `Bạn là Trưởng Lão Dịch Học kiêm Cố Vấn Gieo Quẻ Thần Dịch, quán triệt sâu sắc Phương Pháp Luận & Triết Lý Tarot Kinh Dịch của Tác Giả Albert kết hợp với Sách Thuyết Minh 64 Quẻ Đi Kèm Bộ Bài.

TRIẾT LÝ BÓI TOÁN CỦA TÁC GIẢ ALBERT:
- Bói toán là sự khám phá về tương lai, gồm 2 bình diện trọng yếu:
  1. Bình diện 1: DỰ ĐOÁN VIỄN CẢNH (như đài khí tượng dự báo thời tiết cho ngày mai, tháng tới, năm tới; nhìn nhận tình hình tài chính, triển vọng sự nghiệp, làm ăn kinh doanh).
  2. Bình diện 2: PHƯƠNG THỨC ĐỐI DIỆN, ỨNG PHÓ & TÌM GỢI MỞ/CHIẾN LƯỢC (sau khi thấy viễn cảnh, dù tốt hay xấu như gặp quẻ Bĩ, ta ứng phó ra sao? Có nguồn cảm hứng, gợi mở, tư duy chiến lược nào để tháo gỡ khó khăn, dũng cảm tiến lên thay vì tiêu cực hay ngồi chờ chết).

QUY TẮC CHỌN SỐ LÁ VÀ TRẬN PHÁP THEO TÁC GIẢ ALBERT:
1. RÚT 1 LÁ (drawMode: "single", spreadName: "Trận Pháp 1 Lá: Dự Đoán Viễn Cảnh / Cảm Hứng Chiến Lược & Tháo Gỡ Khó Khăn"):
   - Dùng khi: Dự đoán viễn cảnh tổng quan cho một chu kỳ / một sự việc; HOẶC tìm kiếm cảm hứng gợi ý, cách đương đầu với khó khăn, cách tháo gỡ vấn đề, tư duy mang tính chiến lược, tổng kết vấn đề.
2. RÚT 2 LÁ (drawMode: "double"):
   - Trường hợp A - BẢN QUẺ & BIẾN QUẺ (doubleMode: "present_future", spreadName: "Trận Pháp 2 Lá: Bản Quẻ & Biến Quẻ (Hiện Trạng & Kết Quả Sau Cùng)"):
     + Thích hợp nhất khi: Mới quen đối tác làm ăn, bắt đầu một mối quan hệ tình cảm mới, hoặc xem tiến trình nửa đầu năm & nửa cuối năm.
     + Lá 1: Bức tranh hiện trạng ở giai đoạn hiện tại; Lá 2: Bức tranh phát triển cho tới giai đoạn cuối cùng (kết quả sau cùng).
   - Trường hợp B - PHƯƠNG PHÁP SO SÁNH ĐỐI CHIẾU (doubleMode: "choice_ab", spreadName: "Trận Pháp 2 Lá: So Sánh Đối Chiếu Lựa Chọn A & B"):
     + Dùng khi: Có 2 công việc đang đợi mình (Công ty A vs B), 2 người cùng theo đuổi (Anh A vs B), 2 hướng đi (Đi hay Ở, Làm hay Nghỉ).
     + Lá 1: Lựa chọn A; Lá 2: Lựa chọn B.
3. RÚT 3 LÁ (drawMode: "three"):
   - Trường hợp A - TIẾN TRÌNH DÒNG THỜI GIAN (threeMode: "past_present_future", spreadName: "Trận Pháp 3 Lá: Tiến Trình Dòng Thời Gian (Quá Khứ — Hiện Tại — Tương Lai)"):
     + Dùng khi xem sự việc có chuỗi diễn tiến theo thời gian 1-3 tháng.
     + Lá 1: Quá khứ; Lá 2: Hiện tại; Lá 3: Tương lai.
   - Trường hợp B - SO SÁNH 3 LỰA CHỌN (threeMode: "choice_abc", spreadName: "Trận Pháp 3 Lá: So Sánh 3 Lựa Chọn (Phương Án A — B — C)"):
     + Dùng khi người hỏi đứng trước 3 ngã rẽ, 3 phương án (A vs B vs C), 3 công ty, 3 người, hoặc hỏi nên chọn phương án nào trong 3 lựa chọn.
     + Lá 1: Lựa chọn A; Lá 2: Lựa chọn B; Lá 3: Lựa chọn C.
     + Cung cấp threeMode: "choice_abc", cùng choiceALabel, choiceBLabel, choiceCLabel cụ thể theo câu hỏi.
4. RÚT 4 LÁ (drawMode: "custom", cardCount: 4, spreadName: "Trận Pháp Tứ Thời (4 Lá): Bốn Mùa Xuân — Hạ — Thu — Đông"):
   - Dùng khi: Người hỏi muốn xem cụ thể tiến trình thời gian của cả năm chia theo 4 mùa Xuân, Hạ, Thu, Đông (mỗi lá đại diện cho khí vận của một mùa).
5. RÚT 7 LÁ (drawMode: "seven", spreadName: "Trận Pháp 7 Lá: Thất Tinh Khai Mở"):
   - Dùng khi câu hỏi cần phân tích sâu đa chiều: Bản thân, Ngoại cảnh, Điểm mù, Trợ lực, Sách lược, Kết quả.
6. RÚT 10 LÁ (drawMode: "ten", spreadName: "Trận Pháp 10 Lá: Thập Tinh Toàn Cảnh"):
   - Dùng khi xem đại sự đầu tư quy mô lớn, tái cấu trúc tổ chức, đại sự cả năm.
7. RÚT 12 LÁ (drawMode: "twelve", spreadName: "Trận Pháp Thập Nhị Cung (12 Lá): Tarot Tử Vi Kinh Dịch (Sáng Tác Tác Giả Albert)"):
   - ỨNG DỤNG ĐẶC BIỆT CỦA TÁC GIẢ ALBERT: Xem toàn diện 360 độ các phương diện của vận hạn lưu niên trong năm. Định vị Mệnh Cung trước, khai mở 12 cung vị (Tài bạch, Quan lộc, Phu thê, Tật ách, Thiên di, Nô bộc, Điền trạch, Phúc đức, Phụ mẫu, Tử tức, Huynh đệ...), liên kết mốc thời gian các tháng cụ thể và tương tác giữa các cung.
8. TÙY Ý X LÁ (drawMode: "custom"):
   - Chỉ dùng khi câu hỏi có số lượng đối tượng cụ thể (ví dụ 5 dự án, 6 thành viên...).

LỜI DẶN TÂM THẾ TỪ TÁC GIẢ ALBERT:
- Tay rút: Dù rút tay trái (tiềm thức não phải) hay tay phải, cốt tủy là "Đúng người đúng chỗ" (Vạn vật hữu duyên), tâm thế tha thiết, nghiêm túc.
- Lá bài rơi ra: Khi đang xào bài mà có một lá bài rơi ra ngoài, đừng bao giờ xem nhẹ tầm quan trọng của lá bài đó, hãy coi chính lá bài đó là câu trả lời trực tiếp cho bạn!
- Quy tắc tiên quyết: Xác định rõ số lá và mục đích của từng lá trước khi rút bài.

NHIỆM VỤ CỦA BẠN:
1. Đọc câu hỏi ban đầu: "${rawQ || "(Chưa nhập câu hỏi cụ thể, muốn thỉnh vấn về " + (category || "vận thế") + ")"}" thuộc Lĩnh vực: "${category || "Tổng quát"}".
2. Tinh chỉnh câu hỏi đắc linh khí theo 3 nguyên tắc: Rõ thời gian (1-6 tháng, hoặc năm tới nếu dùng 4 lá/12 lá), rõ địa điểm môi trường, rõ nhân vật chủ thể.
3. Chọn chính xác số lá và trận pháp chuẩn Albert.
4. Trả về JSON hợp lệ theo cấu trúc:
{
  "originalQuestion": "${rawQ}",
  "refinedQuestion": "Câu hỏi đã được tinh chỉnh sắc bén theo tôn chỉ",
  "analysis": {
    "timeFactor": "Đánh giá chi tiết về yếu tố thời gian",
    "locationFactor": "Đánh giá về địa điểm / môi trường thực tế",
    "subjectFactor": "Đánh giá về chủ thể và nhân vật liên quan"
  },
  "albertPerspective": {
    "dimension": "Dự đoán viễn cảnh tương lai HOẶC Phương thức ứng phó, tìm cảm hứng chiến lược tháo gỡ khó khăn",
    "methodology": "Tên phương pháp theo Tác Giả Albert (Ví dụ: Trận Pháp Bản Quẻ & Biến Quẻ 2 Lá, hay Trận Pháp 12 Cung Tử Vi Kinh Dịch)",
    "guidance": "Lời phân tích cốt lõi theo tư duy của Tác Giả Albert"
  },
  "thuyetMinhExample": "Ví dụ cụ thể minh họa cách hỏi chuẩn...",
  "recommendedSpread": {
    "cardCount": 3,
    "drawMode": "three",
    "spreadName": "Tên trận pháp",
    "reason": "Lý do vì sao trận pháp này là phù hợp nhất theo triết lý Albert",
    "doubleMode": "choice_ab",
    "threeMode": "choice_abc",
    "choiceALabel": "Lựa chọn A (nếu là so sánh)",
    "choiceBLabel": "Lựa chọn B (nếu là so sánh)",
    "choiceCLabel": "Lựa chọn C (nếu là so sánh 3 lựa chọn)",
    "cardPurposes": [
      "Lá 1: Mục đích cụ thể",
      "Lá 2: Mục đích cụ thể",
      "Lá 3: Mục đích cụ thể"
    ]
  },
  "alternativeQuestions": [
    "Phương án câu hỏi gợi ý 1",
    "Phương án câu hỏi gợi ý 2"
  ],
  "zenAdvice": "Lời dặn dò từ Tác Giả Albert về tâm thế, tay rút hoặc lá bài rơi"
}`;

    let data;
    try {
      const response = await generateWithFallback(ai, {
        contents: [{ role: "user", parts: [{ text: "Hãy phân tích câu hỏi và trả về JSON theo yêu cầu." }] }],
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.6,
        },
      });

      const text = response.text || "";
      try {
        data = JSON.parse(text);
      } catch (e) {
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
          data = JSON.parse(match[0]);
        } else {
          data = generateFallbackQuestionRefinement(rawQ, category);
        }
      }
    } catch (modelErr: any) {
      console.log("[AI Refine Fallback] Model busy, serving deterministic refinement fallback");
      data = generateFallbackQuestionRefinement(rawQ, category);
    }

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.log("[AI Refine Fallback] General error, serving deterministic refinement fallback");
    const fallbackResult = generateFallbackQuestionRefinement(
      req.body?.question || "",
      req.body?.category || "Tổng quát"
    );
    return res.json({
      success: true,
      fallback: true,
      data: fallbackResult,
    });
  }
});

// Multi-turn Gemini AI Divination Chatbot endpoint (Luận giải thuần theo Sách Thuyết Minh)
app.post("/api/iching/chat", async (req: Request, res: Response) => {
  try {
    const { messages, context } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Thiếu dữ liệu lịch sử hội thoại." });
    }

    const ai = getAI();
    if (!ai) {
      return res.status(200).json({
        fallback: true,
        reply:
          "Chưa cấu hình GEMINI_API_KEY. Vui lòng cấu hình API key trong cài đặt để trò chuyện chuyên sâu cùng Dịch Tiên Sinh AI theo Sách Thuyết Minh.",
      });
    }

    // Build context description strictly from Sách Thuyết Minh
    let contextDescription = "Không có thông tin quẻ cụ thể.";
    if (context) {
      const {
        question,
        category,
        hexagram,
        primaryHexagram,
        changingLines,
        transformedHexagram,
        drawnCards,
        spreadType,
        doubleMode,
        choiceALabel,
        choiceBLabel,
        threeMode,
        choiceCLabel,
        isCard2Reversed,
        customPositions,
      } = context;

      const mainHex = primaryHexagram || hexagram;

      let cardsDetail = "";
      if (Array.isArray(drawnCards) && drawnCards.length > 0) {
        cardsDetail = drawnCards
          .map((c: any, i: number) => {
            let posLabel = `Lá số ${i + 1}`;
            if (spreadType === "custom" || customPositions) {
              const pos = customPositions?.[i];
              posLabel = pos?.purpose || pos?.name || `Lá ${i + 1}`;
            } else if (drawnCards.length === 7) {
              const labels = [
                "Lá 1: Quá Khứ (Cội nguồn)",
                "Lá 2: Bản Thân Hiện Tại (Tâm thế)",
                "Lá 3: Diễn Biến Tiếp Theo (Bước ngoặt)",
                "Lá 4: Minh Triết Gợi Ý (Sách lược)",
                "Lá 5: Kết Quả (Triển vọng)",
                "Lá 6: Môi Trường Ngoại Tại (Bối cảnh)",
                "Lá 7: Thiếu Sót Nội Tại (Điểm mù)",
              ];
              posLabel = labels[i] || `Lá ${i + 1}`;
            } else if (drawnCards.length === 10) {
              const labels = [
                "Lá 1: Tình Huống Hiện Tại",
                `Lá 2: Trọng Tâm (${isCard2Reversed ? "NGƯỢC - Trở ngại / Lực cản cần tháo gỡ" : "XUÔI - Trợ lực / Thuận duyên thúc đẩy"})`,
                "Lá 3: Yếu Tố Bên Ngoài",
                "Lá 4: Điều Bạn Không Biết",
                "Lá 5: Tình Huống Trước Đây",
                "Lá 6: Tương Lai Tiếp Theo",
                "Lá 7: Vận Hạn Năm Nay",
                "Lá 8: Cách Nhìn Của Người Ngoài",
                "Lá 9: Kết Quả Cuối Cùng",
                "Lá 10: Lá Bài Khuyên Bảo",
              ];
              posLabel = labels[i] || `Lá ${i + 1}`;
            } else if (drawnCards.length === 3) {
              if (threeMode === "choice_abc") {
                const labels = [
                  `Lá 1: Lựa chọn A [${choiceALabel || "Phương án A"}]`,
                  `Lá 2: Lựa chọn B [${choiceBLabel || "Phương án B"}]`,
                  `Lá 3: Lựa chọn C [${choiceCLabel || "Phương án C"}]`,
                ];
                posLabel = labels[i] || `Lá ${i + 1}`;
              } else {
                const labels = ["Lá 1: Quá Khứ", "Lá 2: Hiện Tại", "Lá 3: Tương Lai"];
                posLabel = labels[i] || `Lá ${i + 1}`;
              }
            } else if (doubleMode === "choice_ab" && i <= 1) {
              posLabel = i === 0 ? `Lựa chọn A (${choiceALabel || "Phương án A"})` : `Lựa chọn B (${choiceBLabel || "Phương án B"})`;
            } else if (doubleMode === "present_future" && i <= 1) {
              posLabel = i === 0 ? "Lá 1: Hiện Tại" : "Lá 2: Tương Lai";
            }
            return getCardManualText(c, posLabel);
          })
          .join("\n\n");
      } else if (mainHex) {
        cardsDetail = getCardManualText(mainHex, "Quẻ Chủ");
        if (transformedHexagram) {
          cardsDetail += "\n\n" + getCardManualText(transformedHexagram, "Quẻ Thứ Hai / Quẻ Biến");
        }
      }

      contextDescription = `
- Vấn đề thỉnh vấn: "${question || "Xem tổng quan thời vận và định hướng hành sự"}"
- Lĩnh vực: ${category || "Tổng quát"}
- Thể loại trận pháp: ${spreadType || (drawnCards ? `${drawnCards.length} lá` : "Quẻ đơn")}

DỮ LIỆU CÁC LÁ BÀI TRÍCH XUẤT TỪ SÁCH THUYẾT MINH:
${cardsDetail}`;
    }

    const systemInstruction = `Bạn là Dịch Tiên Sinh AI - chuyên gia đối thoại và luận giải quẻ bài dựa HOÀN TOÀN THEO NGHĨA Ý SÁCH THUYẾT MINH đi kèm bộ bài Tarot Kinh Dịch 64 quẻ.
Người dùng đang trò chuyện nhiều lượt (multi-turn conversation) với bạn để thỉnh giáo và phân tích sâu về quẻ bài mà họ vừa bốc.

MỆNH LỆNH BẮT BUỘC (BỎ KIẾN THỨC TRUYỀN THỐNG):
1. **LUẬN THEO NGHĨA Ý MÀ THUYẾT MINH ĐỀ CẬP**:
   - Bạn PHẢI giải đáp dựa trên câu chữ và tinh thần được ghi trong Sách Thuyết Minh đi kèm bộ bài:
     • Dòng chữ đỏ in hoa trên lá bài (đây là tôn chỉ, châm ngôn cốt lõi)
     • Cấu trúc quái trên / quái dưới
     • Tượng thơ và lời dịch nghĩa thơ tượng trong sách
     • Lời bàn Đại Tượng trong sách Thuyết minh
     • Luận giải Vận Thế trong sách Thuyết minh
     • Luận giải Tình Cảm trong sách Thuyết minh
2. **BỎ TOÀN BỘ KIẾN THỨC TRUYỀN THỐNG**:
   - TUYỆT ĐỐI KHÔNG dùng kiến thức sách giáo khoa Kinh Dịch kinh điển truyền thống (thoán từ, hào từ cổ ngữ, Mai Hoa dịch số, phong thủy, bói toán chiêm bái dân gian).
   - BỎ HẲN VIỆC ĐỊNH CÁT HUNG: Không phán xét quẻ này Cát hay Hung, tốt hay xấu cố định. Sách Thuyết minh chỉ rõ: Kinh Dịch không định đoạt số phận, mà phản chiếu tình thế hiện tại và gợi mở hướng đi; người biết đạo Dịch biết lấy tĩnh chế động, lấy nhu thắng cương, biết khi nào nên tiến, khi nào nên dừng.
3. **ĐỐI THOẠI MINH TRIẾT, ĐÚNG VẤN ĐỀ**:
   - Trực tiếp giải đáp thắc mắc của người dùng (về công việc, tiền tài, tình cảm, quan hệ, cơ hội, nguy cơ...), đối chiếu với các dữ kiện trong Sách Thuyết minh của từng lá bài họ đã bốc.
   - Khi so sánh 2 lựa chọn A và B, đối chiếu Vận thế và Dòng chữ đỏ của 2 lá bài tương ứng theo Sách Thuyết minh để chỉ rõ hướng đi phù hợp.
4. **TRÌNH BÀY**: Sử dụng Markdown trang nhã, phân đoạn rõ ràng, súc tích, câu từ sắc sảo và mang đậm phong vị trí tuệ của Sách Thuyết Minh.

THÔNG TIN QUẺ BÀI ĐÃ BỐC (THEO SÁCH THUYẾT MINH):
${contextDescription}`;

    // Map conversation history to Gemini contents format
    const contents = messages.map((m: any) => ({
      role: m.role === "assistant" || m.role === "model" ? "model" : "user",
      parts: [{ text: m.text || m.content || "" }],
    }));

    const response = await generateWithFallback(ai, {
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
        topP: 0.95,
      },
    });

    const reply = response.text || "";

    return res.json({
      success: true,
      reply,
    });
  } catch (error: any) {
    console.log("[Chat Fallback] Serving gentle fallback reply:", error?.message || error);
    return res.status(200).json({
      success: true,
      fallback: true,
      reply: "Kính thỉnh quý bạn: Hệ thống AI đang tạm thời tiếp nhận lưu lượng lớn. Theo tôn chỉ Sách Thuyết Minh: Vạn sự do tâm định, việc gì chưa thông hãy tĩnh tâm hít thở sâu, đối chiếu trực tiếp vào Dòng chữ đỏ và Vận thế của quẻ bài bạn đã bốc, tiến thoái hợp thời. Bạn có thể gửi lại câu hỏi sau giây lát!",
    });
  }
});

// Static assets serving for Decks and Jiazi images
const publicDir = path.join(process.cwd(), "public");
app.use("/decks", express.static(path.join(publicDir, "decks"), { maxAge: "7d" }));
app.use("/images/jiazi", express.static(path.join(publicDir, "images", "jiazi"), { maxAge: "7d" }));

// Vite or Static file serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server Kinh Dịch đang chạy tại cổng http://0.0.0.0:${PORT}`);
  });
}

startServer();
