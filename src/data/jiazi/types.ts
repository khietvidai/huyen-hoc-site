export interface JiaziItemDetail {
  title: string;
  chineseTerm?: string;
  description: string;
}

export interface JiaziSoundSymbolism {
  napAm: string; // Tên nạp âm (e.g. 'Hải Trung Kim')
  qiState: string; // Tượng Khí & Trạng Thái (e.g. 'Ẩn sâu đáy biển, chưa gặp lửa tôi luyện')
  soundName: string; // Âm Thanh Tượng Trưng (e.g. 'Tiếng kim khí trầm đục, nghẹt dưới đáy nước sâu')
  element: "Kim" | "Mộc" | "Thủy" | "Hỏa" | "Thổ";
  soundType: string; // identifier for sound synthesizer
}

export interface JiaziHexagramLink {
  order: number; // 1 to 60
  jiaziName: string; // 'Giáp Tý'
  hexagramNumber: number; // e.g. 24
  hexagramName: string; // e.g. 'Địa Lôi Phục'
  hexagramHanzi: string; // e.g. '地雷復'
  symbol: string; // e.g. '䷗'
  upperTrigram: string; // e.g. 'Khôn' (Địa)
  lowerTrigram: string; // e.g. 'Chấn' (Lôi)
  natureMeaning: string; // Tượng Quẻ & Khí vận
  linkAnalysis: string; // Luận giải mối liên hệ tương ứng giữa Hoa Giáp và Quẻ Dịch
}

export interface JiaziEntry {
  id: string; // e.g. 'giap_ty'
  order: number; // 1 to 60
  name: string; // 'Giáp Tý'
  chinese: string; // '甲子'
  can: string; // 'Giáp'
  chi: string; // 'Tý'
  branchGroup: string; // 'Tý'
  elementNapAm: string; // 'Hải Trung Kim (Vàng trong biển)'
  symbolicCreature: string; // 'Nguồn Nước & Xe Linh' / 'Chuột'
  summary: string;
  soundSymbolism?: JiaziSoundSymbolism;
  part1: {
    title: string;
    items: JiaziItemDetail[];
  };
  part2: {
    title: string;
    items: JiaziItemDetail[];
  };
}
