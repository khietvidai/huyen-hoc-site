export interface CanonicalYao {
  line: number; // 1..6
  name: string; // "Sơ Cửu", "Lục Nhị", "Cửu Tam", etc.
  hanzi: string; // Chữ Hán lời hào
  pinyinMeaning: string; // Phiên âm và dịch nghĩa ngắn
  coreText: string; // Lời hào đầy đủ
  meaning: string; // Nghĩa lý
  symbolism: string; // Tượng số
  position: string; // Vị trí
  favorableAction: string; // ✅ Hành động thuận
  unfavorableAction: string; // 🛑 Hành động ngược
}

export interface CanonicalHexagram {
  number: number;
  name: string; // Ví dụ: BÁT THUẦN CÀN
  hanzi: string; // 乾
  title: string; // QUẺ: BÁT THUẦN CÀN (乾)
  symbolAndMeaning: string; // Tượng và Ý của toàn quẻ
  lines: CanonicalYao[];
}
