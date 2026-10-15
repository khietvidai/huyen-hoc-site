import { JiaziSoundSymbolism } from "./types";

export interface NapAmSoundRecord {
  napAm: string;
  canChiList: string[]; // Tên Can Chi (e.g. ['Giáp Tý', 'Ất Sửu'])
  canChiIds: string[]; // Id Can Chi (e.g. ['giap_ty', 'at_suu'])
  qiState: string; // Tượng Khí & Trạng Thái
  soundName: string; // Âm Thanh Tượng Trưng
  element: "Kim" | "Mộc" | "Thủy" | "Hỏa" | "Thổ";
  soundType: string;
}

export const NAP_AM_SOUND_RECORDS: NapAmSoundRecord[] = [
  // ================= KIM (6 pairs) =================
  {
    napAm: "Hải Trung Kim",
    canChiList: ["Giáp Tý", "Ất Sửu"],
    canChiIds: ["giap_ty", "at_suu"],
    qiState: "Ẩn sâu đáy biển, chưa gặp lửa tôi luyện",
    soundName: "Tiếng kim khí trầm đục, nghẹt dưới đáy nước sâu",
    element: "Kim",
    soundType: "hai_trung_kim",
  },
  {
    napAm: "Kim Bạc Kim",
    canChiList: ["Nhâm Dần", "Quý Mão"],
    canChiIds: ["nham_dan", "quy_mao"],
    qiState: "Vàng lá dát mỏng, dùng trang trí",
    soundName: "Tiếng lụa bay sột soạt, kim loại dát mỏng chạm nhau thanh mảnh",
    element: "Kim",
    soundType: "kim_bac_kim",
  },
  {
    napAm: "Bạch Chá Kim",
    canChiList: ["Canh Thìn", "Tân Tị"],
    canChiIds: ["canh_thin", "tan_ti"],
    qiState: "Quặng khoáng mới thành, cần lửa đúc",
    soundName: "Tiếng búa đập đá quặng, thanh mà sắc",
    element: "Kim",
    soundType: "bach_cha_kim",
  },
  {
    napAm: "Sa Trung Kim",
    canChiList: ["Giáp Ngọ", "Ất Mùi"],
    canChiIds: ["giap_ngo", "at_mui"],
    qiState: "Vàng vụn lẫn trong cát sạn",
    soundName: "Tiếng đãi cát lạo xạo, kim sa chạm đá dưới dòng nước",
    element: "Kim",
    soundType: "sa_trung_kim",
  },
  {
    napAm: "Kiếm Phong Kim",
    canChiList: ["Nhâm Thân", "Quý Dậu"],
    canChiIds: ["nham_than", "quy_dau"],
    qiState: "Lưỡi kiếm sắc bén rèn từ sương tuyết",
    soundName: "Tiếng gươm rút khỏi vỏ, keng rợn lạnh lùng",
    element: "Kim",
    soundType: "kiem_phong_kim",
  },
  {
    napAm: "Thoa Xuyến Kim",
    canChiList: ["Canh Tuất", "Tân Hợi"],
    canChiIds: ["canh_tuat", "tan_hoi"],
    qiState: "Trâm cài, vòng ngọc khuê các",
    soundName: "Tiếng trâm ngọc va chạm khe khẽ, tao nhã",
    element: "Kim",
    soundType: "thoa_xuyen_kim",
  },

  // ================= MỘC (6 pairs) =================
  {
    napAm: "Tang Chá Mộc",
    canChiList: ["Nhâm Tý", "Quý Sửu"],
    canChiIds: ["nham_ty", "quy_suu"],
    qiState: "Cây dâu non dùng nuôi tằm dệt lụa",
    soundName: "Tiếng tằm ăn rào rào, tiếng thoi đưa kẽo kẹt",
    element: "Mộc",
    soundType: "tang_cha_moc",
  },
  {
    napAm: "Tùng Bách Mộc",
    canChiList: ["Canh Dần", "Tân Mão"],
    canChiIds: ["canh_dan", "tan_mao"],
    qiState: "Cây tùng chịu sương tuyết, vươn cao",
    soundName: "Tiếng gió rít qua rừng thông u u, trầm hùng",
    element: "Mộc",
    soundType: "tung_bach_moc",
  },
  {
    napAm: "Đại Lâm Mộc",
    canChiList: ["Mậu Thìn", "Kỷ Tị"],
    canChiIds: ["mau_thin", "ky_ti"],
    qiState: "Rừng già rậm rạp, cành nhánh che trời",
    soundName: "Tiếng đại ngàn gầm vang, gió lay tán lá ào ạt",
    element: "Mộc",
    soundType: "dai_lam_moc",
  },
  {
    napAm: "Dương Liễu Mộc",
    canChiList: ["Nhâm Ngọ", "Quý Mùi"],
    canChiIds: ["nham_ngo", "quy_mui"],
    qiState: "Cành mềm rủ trên bờ đê mùa hạ",
    soundName: "Tiếng cành liễu phất nhẹ trong gió thoảng",
    element: "Mộc",
    soundType: "duong_lieu_moc",
  },
  {
    napAm: "Thạch Lựu Mộc",
    canChiList: ["Canh Thân", "Tân Dậu"],
    canChiIds: ["canh_than", "tan_dau"],
    qiState: "Mộc mọc đất kim, kết trái ngọt cay",
    soundName: "Tiếng quả nứt hạt, cành cứng cọ xát giòn sắc",
    element: "Mộc",
    soundType: "thach_luu_moc",
  },
  {
    napAm: "Bình Địa Mộc",
    canChiList: ["Mậu Tuất", "Kỷ Hợi"],
    canChiIds: ["mau_tuat", "ky_hoi"],
    qiState: "Mầm non trên đất bằng, chớm nở",
    soundName: "Tiếng mầm cây cựa mình nứt đất êm đềm",
    element: "Mộc",
    soundType: "binh_dia_moc",
  },

  // ================= HỎA (6 pairs) =================
  {
    napAm: "Phích Lịch Hỏa",
    canChiList: ["Mậu Tý", "Kỷ Sửu"],
    canChiIds: ["mau_ty", "ky_suu"],
    qiState: "Sấm sét xé toạc tầng mây",
    soundName: "Tiếng sét nổ đanh vang rền giữa cơn giông",
    element: "Hỏa",
    soundType: "phich_lich_hoa",
  },
  {
    napAm: "Lư Trung Hỏa",
    canChiList: ["Bính Dần", "Đinh Mão"],
    canChiIds: ["binh_dan", "dinh_mao"],
    qiState: "Lò lửa âm dương rực cháy",
    soundName: "Tiếng củi nổ lách tách, lửa phì phò trong lò",
    element: "Hỏa",
    soundType: "lu_trung_hoa",
  },
  {
    napAm: "Phúc Đăng Hỏa",
    canChiList: ["Giáp Thìn", "Ất Tị"],
    canChiIds: ["giap_thin", "at_ti"],
    qiState: "Đèn soi đêm vắng, ấm cúng",
    soundName: "Tiếng dầu bấc tí tách rất khẽ trong đêm tĩnh",
    element: "Hỏa",
    soundType: "phuc_dang_hoa",
  },
  {
    napAm: "Thiên Thượng Hỏa",
    canChiList: ["Mậu Ngọ", "Kỷ Mùi"],
    canChiIds: ["mau_ngo", "ky_mui"],
    qiState: "Ánh dương và trăng sao tỏa nhiệt",
    soundName: "Yên lặng tuyệt đối nhưng chói chang, áp đảo vạn vật",
    element: "Hỏa",
    soundType: "thien_thuong_hoa",
  },
  {
    napAm: "Sơn Hạ Hỏa",
    canChiList: ["Bính Thân", "Đinh Dậu"],
    canChiIds: ["binh_than", "dinh_dau"],
    qiState: "Lửa cỏ dưới chân núi lúc chạng vạng",
    soundName: "Tiếng cỏ khô cháy xèo xèo, lụi dần",
    element: "Hỏa",
    soundType: "son_ha_hoa",
  },
  {
    napAm: "Sơn Đầu Hỏa",
    canChiList: ["Giáp Tuất", "Ất Hợi"],
    canChiIds: ["giap_tuat", "at_hoi"],
    qiState: "Lửa đốt rẫy trên đỉnh non chiều tà",
    soundName: "Tiếng lửa táp gió hú lồng lộng trên đỉnh núi",
    element: "Hỏa",
    soundType: "son_dau_hoa",
  },

  // ================= THỔ (6 pairs) =================
  {
    napAm: "Bích Thượng Thổ",
    canChiList: ["Canh Tý", "Tân Sửu"],
    canChiIds: ["canh_ty", "tan_suu"],
    qiState: "Đất đắp tường nhà chắn gió sương",
    soundName: "Tiếng gió rít đập vào vách tường bị chặn đứng",
    element: "Thổ",
    soundType: "bich_thuong_tho",
  },
  {
    napAm: "Thành Đầu Thổ",
    canChiList: ["Mậu Dần", "Kỷ Mão"],
    canChiIds: ["mau_dan", "ky_mao"],
    qiState: "Thành trì kiên cố bao bọc đế đô",
    soundName: "Tiếng bước chân lính tuần và tiếng gió dội tường đá",
    element: "Thổ",
    soundType: "thanh_dau_tho",
  },
  {
    napAm: "Sa Trung Thổ",
    canChiList: ["Bính Thìn", "Đinh Tị"],
    canChiIds: ["binh_thin", "dinh_ti"],
    qiState: "Đất phù sa, cồn bãi bồi tụ",
    soundName: "Tiếng sóng vỗ bờ cát ì oạp, đất lở bồi trầm",
    element: "Thổ",
    soundType: "sa_trung_tho",
  },
  {
    napAm: "Lộ Bàng Thổ",
    canChiList: ["Canh Ngọ", "Tân Mùi"],
    canChiIds: ["canh_ngo", "tan_mui"],
    qiState: "Đất ven đường dẫn ra đồng ruộng",
    soundName: "Tiếng vó ngựa, bánh xe lăn lọc cọc trên lối đi",
    element: "Thổ",
    soundType: "lo_bang_tho",
  },
  {
    napAm: "Đại Dịch Thổ",
    canChiList: ["Mậu Thân", "Kỷ Dậu"],
    canChiIds: ["mau_than", "ky_dau"],
    qiState: "Đường thiên lý thông suốt chín châu",
    soundName: "Tiếng xe cộ dập dìu, người qua lại nhộn nhịp",
    element: "Thổ",
    soundType: "dai_dich_tho",
  },
  {
    napAm: "Ốc Thượng Thổ",
    canChiList: ["Bính Tuất", "Đinh Hợi"],
    canChiIds: ["binh_tuat", "dinh_hoi"],
    qiState: "Ngói nung lợp trên mái nhà",
    soundName: "Tiếng mưa rơi lộp bộp gõ đều trên mái ngói",
    element: "Thổ",
    soundType: "oc_thuong_tho",
  },

  // ================= THỦY (6 pairs) =================
  {
    napAm: "Giản Hạ Thủy",
    canChiList: ["Bính Tý", "Đinh Sửu"],
    canChiIds: ["binh_ty", "dinh_suu"],
    qiState: "Nước ngầm trong lòng đất, róc rách",
    soundName: "Tiếng suối ngầm róc rách luồn qua khe đá",
    element: "Thủy",
    soundType: "gian_ha_thuy",
  },
  {
    napAm: "Đại Khê Thủy",
    canChiList: ["Giáp Dần", "Ất Mão"],
    canChiIds: ["giap_dan", "at_mao"],
    qiState: "Nước khe suối lớn đổ ra đông",
    soundName: "Tiếng thác đổ cuồn cuộn, nước va bờ đá rền vang",
    element: "Thủy",
    soundType: "dai_khe_thuy",
  },
  {
    napAm: "Trường Lưu Thủy",
    canChiList: ["Nhâm Thìn", "Quý Tị"],
    canChiIds: ["nham_thin", "quy_ti"],
    qiState: "Dòng sông dài chảy miệt mài",
    soundName: "Tiếng dòng chảy êm đềm, nước vỗ mạn thuyền đều đặn",
    element: "Thủy",
    soundType: "truong_luu_thuy",
  },
  {
    napAm: "Thiên Hà Thủy",
    canChiList: ["Bính Ngọ", "Đinh Mùi"],
    canChiIds: ["binh_ngo", "dinh_mui"],
    qiState: "Nước mưa từ trời dội xuống",
    soundName: "Tiếng mưa rào sầm sập từ trời cao",
    element: "Thủy",
    soundType: "thien_ha_thuy",
  },
  {
    napAm: "Tỉnh Tuyền Thủy",
    canChiList: ["Giáp Thân", "Ất Dậu"],
    canChiIds: ["giap_than", "at_dau"],
    qiState: "Nước giếng trong mát ngọt ngào",
    soundName: "Tiếng gàu múc nước bì bõm, giọt nước rỏ tõm xuống lòng giếng",
    element: "Thủy",
    soundType: "tinh_tuyen_thuy",
  },
  {
    napAm: "Đại Hải Thủy",
    canChiList: ["Nhâm Tuất", "Quý Hợi"],
    canChiIds: ["nham_tuat", "quy_hoi"],
    qiState: "Biển cả mênh mông thâu nạp trăm sông",
    soundName: "Tiếng sóng đại dương gầm thét, triều dâng ầm ầm",
    element: "Thủy",
    soundType: "dai_hai_thuy",
  },
];

// Helper mapping by canChi ID (e.g. 'giap_ty' -> sound symbolism)
const JIAZI_SOUND_MAP: Record<string, JiaziSoundSymbolism> = {};

NAP_AM_SOUND_RECORDS.forEach((record) => {
  record.canChiIds.forEach((id) => {
    JIAZI_SOUND_MAP[id] = {
      napAm: record.napAm,
      qiState: record.qiState,
      soundName: record.soundName,
      element: record.element,
      soundType: record.soundType,
    };
  });
});

export function getJiaziSoundSymbolism(canChiId: string): JiaziSoundSymbolism {
  if (JIAZI_SOUND_MAP[canChiId]) {
    return JIAZI_SOUND_MAP[canChiId];
  }
  // Fallback if not directly found
  return {
    napAm: "Ngũ Hành Khí",
    qiState: "Khí tự nhiên tuần hoàn biến dịch",
    soundName: "Âm ba vũ trụ biến chuyển vô cùng",
    element: "Kim",
    soundType: "default",
  };
}
