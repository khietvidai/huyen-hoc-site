import { CanonicalHexagram, CanonicalYao } from "./types";
import { CANONICAL_PART_1 } from "./canonicalPart1";
import { CANONICAL_PART_2 } from "./canonicalPart2";
import { CANONICAL_PART_3 } from "./canonicalPart3";
import { CANONICAL_PART_4 } from "./canonicalPart4";

export * from "./types";

export const CANONICAL_ICHING_DATA: Record<number, CanonicalHexagram> = {
  ...CANONICAL_PART_1,
  ...CANONICAL_PART_2,
  ...CANONICAL_PART_3,
  ...CANONICAL_PART_4,
};

export function getCanonicalHexagram(num: number): CanonicalHexagram | undefined {
  return CANONICAL_ICHING_DATA[num];
}

export function formatCanonicalCopyText(hex: CanonicalHexagram, lineIndex?: number): string {
  let text = hex.title + "\n\n";
  text += "Tượng và Ý của toàn quẻ: " + hex.symbolAndMeaning + "\n\n";
  if (lineIndex !== undefined && hex.lines[lineIndex]) {
    const line = hex.lines[lineIndex];
    text += (line.line === 7 ? "【HÀO ĐẶC BIỆT KHI ĐỘNG 6 HÀO】: " : "HÀO " + line.line + ": ") + line.name + "\n\n";
    text += "KINH DỊCH HÀO TỪ CỐT LÕI:\n";
    text += "【Ô CHỮ HÁN】: " + line.hanzi + "\n";
    text += "Lời hào: " + line.coreText + "\n";
    text += "Nghĩa lý: " + line.meaning + "\n";
    text += "Tượng số: " + line.symbolism + "\n";
    text += "Vị trí: " + line.position + "\n";
    text += "✅ Hành động thuận: " + line.favorableAction + "\n";
    text += "🛑 Hành động ngược: " + line.unfavorableAction + "\n";
  } else {
    hex.lines.forEach((line) => {
      text += (line.line === 7 ? "【HÀO ĐẶC BIỆT KHI ĐỘNG 6 HÀO】: " : "HÀO " + line.line + ": ") + line.name + "\n";
      text += "KINH DỊCH HÀO TỪ CỐT LÕI:\n";
      text += "【Ô CHỮ HÁN】: " + line.hanzi + "\n";
      text += "Lời hào: " + line.coreText + "\n";
      text += "Nghĩa lý: " + line.meaning + "\n";
      text += "Tượng số: " + line.symbolism + "\n";
      text += "Vị trí: " + line.position + "\n";
      text += "✅ Hành động thuận: " + line.favorableAction + "\n";
      text += "🛑 Hành động ngược: " + line.unfavorableAction + "\n\n";
    });
  }
  return text;
}