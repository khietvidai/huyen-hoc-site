export interface ChangingLineCase {
  count: number;
  name: string;
  phenomenon: string;
  readingInstruction: string;
  tableSummary: string;
  principle: string;
  specialNote?: string;
}

export const CHU_HY_THAI_PHAT_RULES: ChangingLineCase[] = [
  {
    count: 0,
    name: "Trường hợp 0 hào động (Quẻ Tĩnh)",
    phenomenon: "Khi gieo quẻ (bằng 3 đồng xu hoặc bằng các phương pháp Mai Hoa) không xuất hiện hào lão âm hay lão dương nào biến đổi.",
    readingInstruction: "Tình huống này trạng thái sự việc đang đứng yên, ổn định. Bạn chỉ đọc Thoán từ (lời tổng quát của Quẻ gốc) và Đại Tượng truyện để tìm lời khuyên, không cần quan tâm đến Quẻ biến vì quẻ không biến.",
    tableSummary: "Xem Thoán từ (lời kinh của quẻ gốc) làm chính; xem thêm Thoán truyện để hiểu bối cảnh.",
    principle: "Quẻ thuần tĩnh, nội lực ổn định chưa phát sinh động năng chuyển hóa, lấy toàn thể quẻ làm đại diện.",
  },
  {
    count: 1,
    name: "Trường hợp 1 hào động",
    phenomenon: "Chỉ có duy nhất một hào thay đổi âm sang dương hoặc dương sang âm.",
    readingInstruction: "Đây là trường hợp phổ biến và dễ luận nhất. Bạn tìm đến đúng lời Hào từ của hào động đó ở quẻ gốc để đọc. Lời hào này phản ánh trực tiếp mấu chốt, cát hung của sự việc bạn đang hỏi.",
    tableSummary: "Xem duy nhất Hào từ của hào động đó ở quẻ gốc.",
    principle: "Dĩ động vi chủ: Một hào động là đầu mối then chốt quyết định chiều hướng phát triển của toàn bộ sự việc.",
  },
  {
    count: 2,
    name: "Trường hợp 2 hào động",
    phenomenon: "Có hai hào cùng động một lúc.",
    readingInstruction: "Đọc lời Hào từ của cả 2 hào động này ở Quẻ gốc. Tuy nhiên, để đưa ra quyết định, bạn lấy lời của hào động nằm ở vị trí cao hơn (phía trên) làm hướng đi chính, và dùng hào động phía dưới để bổ trợ thông tin.",
    tableSummary: "Xem Hào từ của cả 2 hào động ở quẻ gốc; lấy hào trên làm chính, hào dưới làm phụ.",
    principle: "Thế biến đa chiều: Hào trên biểu thị diễn tiến xa hơn, tầng mức cao hơn hoặc xu hướng phát triển tối hậu; hào dưới là nguyên nhân, bệ phóng ban đầu.",
  },
  {
    count: 3,
    name: "Trường hợp 3 hào động",
    phenomenon: "Quẻ bị phân đôi (3 hào động, 3 hào tĩnh), năng lượng dịch chuyển ở mức cân bằng 50/50.",
    readingInstruction: "Không đọc lời của bất kỳ hào cụ thể nào. Thay vào đó, bạn đọc Thoán từ của Quẻ gốc kết hợp với Thoán từ của Quẻ biến. Quẻ gốc đại diện cho trạng thái ban đầu và nguyên nhân, còn Quẻ biến là kết quả cuối cùng mà sự việc sẽ dẫn tới.",
    tableSummary: "Xem Thoán từ của cả Quẻ gốc và Quẻ biến; lấy Quẻ gốc làm quá khứ/hiện tại, Quẻ biến làm tương lai.",
    principle: "Thế cân bằng nửa cũ nửa mới: Ba hào động làm rung chuyển một nửa thể chế quẻ, cục diện chuyển sang thế đối trọng Quẻ Gốc (Nhân) và Quẻ Biến (Quả).",
  },
  {
    count: 4,
    name: "Trường hợp 4 hào động",
    phenomenon: "Phần lớn các hào đều động (4 hào), chỉ còn 2 hào giữ nguyên.",
    readingInstruction: "Lúc này năng lượng đã dịch chuyển mạnh sang Quẻ biến. Bạn cần tìm 2 hào KHÔNG động ở Quẻ biến để đọc. Trong hai hào này, lấy lời hào ở vị trí thấp hơn (phía dưới) làm trọng tâm luận đoán.",
    tableSummary: "Xem Hào từ của 2 hào KHÔNG động ở quẻ biến; lấy hào dưới làm chính, hào trên làm phụ.",
    principle: "Dĩ thiểu vi quý (Lấy số ít làm quý): Đa số (4 hào) đã động nên thế mạnh đã thuộc về Quẻ Biến; lúc này 2 hào tĩnh còn lại là điểm tựa cân bằng then chốt, lấy hào dưới làm gốc rễ dẫn dắt.",
  },
  {
    count: 5,
    name: "Trường hợp 5 hào động",
    phenomenon: "Gần như toàn bộ quẻ thay đổi, chỉ sót lại đúng 1 hào tĩnh.",
    readingInstruction: "Bạn tập trung vào 1 hào duy nhất KHÔNG động ở Quẻ biến để đọc lời hào từ. Hào tĩnh duy nhất này đóng vai trò là \"trục chốt\" giữ cho toàn bộ sự việc không bị sụp đổ hoặc là yếu tố định hình kết quả.",
    tableSummary: "Xem duy nhất Hào từ của 1 hào KHÔNG động ở quẻ biến.",
    principle: "Độc tĩnh vi tông: Giữa muôn vàn biến động dữ dội, một điểm tĩnh duy nhất trở thành thái cực điều động toàn bộ vận thế của quẻ biến.",
  },
  {
    count: 6,
    name: "Trường hợp cả 6 hào đều động (Lục hào đại động)",
    phenomenon: "Tất cả 6 hào âm dương đều đảo ngược vị trí.",
    readingInstruction: "Sự việc biến đổi hoàn toàn, lật ngược thế cờ từ đầu đến cuối.\n• Quy tắc chung: Đọc Thoán từ của Quẻ biến để xem cái kết mới.\n• Trường hợp đặc biệt:\n  - Nếu quẻ gốc là Thuần Càn (6 hào dương động hóa 6 hào âm thành Thuần Khôn): Đọc lời hào Dụng Cửu.\n  - Nếu quẻ gốc là Thuần Khôn (6 hào âm động hóa 6 hào dương thành Thuần Càn): Đọc lời hào Dụng Lục.",
    tableSummary: "Xem Thoán từ của Quẻ biến. (Ngoại lệ: Nếu là quẻ Càn/Khôn thì xem lời hào Dụng Cửu / Dụng Lục).",
    principle: "Càn khôn dịch vị, vật cực tất phản: Toàn bộ cấu trúc thực thể đã thay đổi sang cảnh giới mới hoàn toàn.",
    specialNote: "Với Quẻ Càn biến Khôn xem 'Dụng Cửu' (Kiến quần long vô thủ, cát). Với Quẻ Khôn biến Càn xem 'Dụng Lục' (Lợi vĩnh trinh).",
  },
];

export interface CurrentGuidanceResult {
  count: number;
  caseRule: ChangingLineCase;
  headline: string;
  mainAction: string;
  supportingAction?: string;
  recommendedLines: {
    line: number;
    hexType: "primary" | "transformed";
    role: "chính" | "phụ" | "trục chốt" | "đặc biệt";
    note: string;
  }[];
  focusJudgement?: {
    hexType: "primary" | "transformed" | "both";
    note: string;
  };
}

export function getCurrentChangingLinesGuidance(
  changingLines: number[],
  primaryHexNumber: number,
  transformedHexNumber?: number
): CurrentGuidanceResult {
  const count = changingLines.length;
  const sortedChanging = [...changingLines].sort((a, b) => a - b);
  const allLines = [1, 2, 3, 4, 5, 6];
  const unchangedLines = allLines.filter((l) => !changingLines.includes(l));

  const caseRule = CHU_HY_THAI_PHAT_RULES.find((r) => r.count === count) || CHU_HY_THAI_PHAT_RULES[0];

  switch (count) {
    case 0: {
      return {
        count: 0,
        caseRule,
        headline: "Quẻ Tĩnh — Sự việc đang ổn định, đứng yên",
        mainAction: `Đọc Thoán từ (lời kinh toàn quẻ) của Quẻ gốc #${primaryHexNumber} làm định hướng chính. Xem thêm Thoán Truyện & Đại Tượng Truyện để hiểu rõ bối cảnh và lời khuyên xử thế.`,
        focusJudgement: {
          hexType: "primary",
          note: `Quẻ tĩnh không biến, vận khí đang tích lũy hoặc duy trì trạng thái hiện hữu. Tập trung lĩnh hội Thoán từ Quẻ #${primaryHexNumber}.`,
        },
        recommendedLines: [],
      };
    }
    case 1: {
      const activeLine = sortedChanging[0];
      return {
        count: 1,
        caseRule,
        headline: `1 Hào Động — Trọng tâm tại Hào ${activeLine} ở Quẻ Gốc`,
        mainAction: `Xem duy nhất lời Hào từ của Hào ${activeLine} ở Quẻ gốc #${primaryHexNumber}. Lời hào này phản ánh trực tiếp mấu chốt then chốt và cát hung của sự việc bạn đang chiêm vấn.`,
        recommendedLines: [
          {
            line: activeLine,
            hexType: "primary",
            role: "chính",
            note: `Hào ${activeLine} (Quẻ gốc #${primaryHexNumber}) là điểm xuất phát và nhân tố định đoạt mấu chốt.`,
          },
        ],
      };
    }
    case 2: {
      const lower = sortedChanging[0];
      const upper = sortedChanging[1];
      return {
        count: 2,
        caseRule,
        headline: `2 Hào Động — Xem Hào ${upper} (làm chính) & Hào ${lower} (bổ trợ)`,
        mainAction: `Đọc lời Hào từ của cả 2 hào động này ở Quẻ gốc #${primaryHexNumber}. Lấy lời Hào ${upper} (vị trí cao hơn) làm hướng đi chính, và lấy lời Hào ${lower} (vị trí thấp hơn) làm thông tin bổ trợ.`,
        recommendedLines: [
          {
            line: upper,
            hexType: "primary",
            role: "chính",
            note: `Hào ${upper} nằm ở vị trí cao hơn ➔ Làm kim chỉ nam quyết định chính.`,
          },
          {
            line: lower,
            hexType: "primary",
            role: "phụ",
            note: `Hào ${lower} nằm ở vị trí thấp hơn ➔ Làm dữ kiện bổ trợ nền tảng.`,
          },
        ],
      };
    }
    case 3: {
      return {
        count: 3,
        caseRule,
        headline: "3 Hào Động (50/50) — Xem Thoán từ Quẻ Gốc & Quẻ Biến",
        mainAction: `Không đọc lời của bất kỳ hào cụ thể nào. Thay vào đó, bạn đọc Thoán từ Quẻ gốc #${primaryHexNumber} (đại diện cho trạng thái ban đầu/nguyên nhân) kết hợp với Thoán từ Quẻ biến #${transformedHexNumber ?? "?"} (kết quả cuối cùng dẫn tới).`,
        focusJudgement: {
          hexType: "both",
          note: `Quẻ Gốc #${primaryHexNumber} là Quá khứ / Hiện tại; Quẻ Biến #${transformedHexNumber ?? "?"} là Tương lai / Kết cuộc.`,
        },
        recommendedLines: [],
      };
    }
    case 4: {
      const lowerUnchanged = unchangedLines[0];
      const upperUnchanged = unchangedLines[1];
      return {
        count: 4,
        caseRule,
        headline: `4 Hào Động — Xem 2 hào TĨNH ở Quẻ Biến (Hào ${lowerUnchanged} làm chính, Hào ${upperUnchanged} làm phụ)`,
        mainAction: `Năng lượng đã dịch chuyển mạnh sang Quẻ biến. Bạn tìm 2 hào KHÔNG động ở Quẻ biến #${transformedHexNumber ?? "?"} là Hào ${lowerUnchanged} và Hào ${upperUnchanged}. Lấy lời Hào ${lowerUnchanged} (vị trí thấp hơn) làm trọng tâm luận đoán, Hào ${upperUnchanged} làm phụ.`,
        recommendedLines: [
          {
            line: lowerUnchanged,
            hexType: "transformed",
            role: "chính",
            note: `Hào ${lowerUnchanged} (Quẻ biến) không động, ở vị trí thấp hơn ➔ Trọng tâm luận đoán chính.`,
          },
          {
            line: upperUnchanged,
            hexType: "transformed",
            role: "phụ",
            note: `Hào ${upperUnchanged} (Quẻ biến) không động, ở vị trí cao hơn ➔ Bổ trợ thông tin.`,
          },
        ],
      };
    }
    case 5: {
      const singleUnchanged = unchangedLines[0];
      return {
        count: 5,
        caseRule,
        headline: `5 Hào Động — Xem duy nhất Hào TĨNH (Hào ${singleUnchanged}) ở Quẻ Biến`,
        mainAction: `Tập trung vào duy nhất Hào ${singleUnchanged} KHÔNG động ở Quẻ biến #${transformedHexNumber ?? "?"} để đọc lời hào. Hào tĩnh duy nhất này giữ vai trò là "trục chốt" định hình kết quả toàn cục.`,
        recommendedLines: [
          {
            line: singleUnchanged,
            hexType: "transformed",
            role: "trục chốt",
            note: `Hào ${singleUnchanged} (Quẻ biến #${transformedHexNumber ?? "?"}) là trục chốt giữ cho đại cuộc không sụp đổ.`,
          },
        ],
      };
    }
    case 6: {
      if (primaryHexNumber === 1) {
        return {
          count: 6,
          caseRule,
          headline: "Quẻ Thuần Càn động 6 hào ➔ NGOẠI LỆ: Xem HÀO DỤNG CỬU (用九)",
          mainAction: "Cả 6 hào dương của Thuần Càn cùng động biến hóa sang Thuần Khôn: Xem lời hào DỤNG CỬU: 'Kiến quần long vô thủ, cát' (Thấy đàn rồng không đầu, tốt lành). Thể hiện đức tính khiêm nhường tột bậc, không tranh làm thủ lĩnh.",
          recommendedLines: [
            {
              line: 7,
              hexType: "primary",
              role: "đặc biệt",
              note: "Hào 7 đặc biệt: Dụng Cửu (Quẻ Càn khi động đủ 6 hào).",
            },
          ],
        };
      }
      if (primaryHexNumber === 2) {
        return {
          count: 6,
          caseRule,
          headline: "Quẻ Thuần Khôn động 6 hào ➔ NGOẠI LỆ: Xem HÀO DỤNG LỤC (用六)",
          mainAction: "Cả 6 hào âm của Thuần Khôn cùng động biến hóa sang Thuần Càn: Xem lời hào DỤNG LỤC: 'Lợi vĩnh trinh' (Lợi về giữ bền lòng chính). Thể hiện đức nhu thuận bền bỉ, kiên định với đạo chính.",
          recommendedLines: [
            {
              line: 7,
              hexType: "primary",
              role: "đặc biệt",
              note: "Hào 7 đặc biệt: Dụng Lục (Quẻ Khôn khi động đủ 6 hào).",
            },
          ],
        };
      }
      return {
        count: 6,
        caseRule,
        headline: "Lục Hào Đại Động — Sự việc biến chuyển toàn diện, xem Thoán từ Quẻ Biến",
        mainAction: `Tất cả 6 hào đều đảo ngược vị trí, thế cờ lật ngược hoàn toàn từ đầu đến cuối. Đọc Thoán từ của Quẻ biến #${transformedHexNumber ?? "?"} để xem kết cuộc và trạng thái mới.`,
        focusJudgement: {
          hexType: "transformed",
          note: `Đọc Thoán từ Quẻ Biến #${transformedHexNumber ?? "?"} để nắm bắt trọn vẹn cục diện mới.`,
        },
        recommendedLines: [],
      };
    }
    default:
      return {
        count: 0,
        caseRule,
        headline: "Xem Thoán từ Quẻ Gốc",
        mainAction: "Xem lời quẻ gốc làm chính.",
        recommendedLines: [],
      };
  }
}
