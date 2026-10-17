/**
 * @license
 * HỆ THỐNG LUẬN MỆNH HOÀN CHỈNH TRONG HÀN NHIỆT MỆNH (TÔ DÂN PHONG)
 * Tinh tuyển và hoàn thiện dựa trên 80 bài giảng Bát Tự Master Class 2009 - 2010 - 2011
 * Đại sư Tô Dân Phong (Peter So Man-Fong - 蘇民峰) • Hồng Kông
 * Tích hợp Bát Tự Bút Ký V16 & Phương Pháp Định Quý Cách (Vương Thế Đạt)
 */

import {
  CAN_NAMES,
  CHI_NAMES,
  CAN_CHINESE,
  CHI_CHINESE,
  HOUR_BRANCH_RANGES,
  getJulianDay,
} from "../utils/lunarCalendar";
import {
  getBaziForDate,
  calculateTuoiVaoVan,
  calculateTuoiVaoVanBetween,
  SOLAR_TERMS_24,
  getExactSunLongitude,
} from "../utils/solarTerms";

// ==========================================
// 1. CÁC ĐỊNH NGHĨA DỮ LIỆU & KIỂU DỮ LIỆU
// ==========================================

export type NguhHanh = "Kim" | "Mộc" | "Thủy" | "Hỏa" | "Thổ";
export type AmDuong = "Dương" | "Âm";

export interface StemInfo {
  name: string;
  chinese: string;
  element: NguhHanh;
  yinYang: AmDuong;
}

export interface BranchHiddenStem {
  stem: string;
  chinese: string;
  type: "Chính khí" | "Trung khí" | "Dư khí";
  element: NguhHanh;
  tenGod: string;
}

export interface PillarReading {
  title: string; // Trụ Năm, Trụ Tháng, Trụ Ngày, Trụ Giờ
  can: string;
  chi: string;
  chineseCan: string;
  chineseChi: string;
  fullName: string;
  elementCan: NguhHanh;
  elementChi: NguhHanh;
  napAm: string;
  napAmElement: string;
  tenGod: string; // Thập thần của Can trụ đối với Nhật Can
  hiddenStems: BranchHiddenStem[];
  palaceMeaning: string; // Ý nghĩa cung vị
  lifeStage: string; // 1-15 tuổi, 16-30 tuổi, v.v.
}

export interface DaiVanInfo {
  step: number; // 1..8
  startAge: number;
  endAge: number;
  startYear: number;
  endYear: number;
  can: string;
  chi: string;
  chinese: string;
  element: NguhHanh;
  napAm: string;
  tenGod: string;
  isFavorable: boolean; // Thuận vận hay Nghịch vận theo Hàn Nhiệt Mệnh
  fortuneLevel: "Đại Cát" | "Cát" | "Bình Hòa" | "Tiểu Hung" | "Hung";
  actionAdvice: string; // "Thuận phong tắc dũng" hay "Nghịch phong tắc thủ"
  details: string;
}

export interface NobleScoreCriteriaItem {
  id: string;
  name: string; // Tên tiêu chí: "Cách Cục", "Điều Hậu & Có Lực", "Chân Thần Đắc Dụng", v.v.
  chinese: string; // "格局", "調候有力", "真神得用", v.v.
  score: number; // Điểm đạt được (vd: 1.0, 0.5, 0.25, 0)
  maxScore: number; // Điểm tối đa của tiêu chí (vd: 1.0 hoặc 2.0)
  status: "Đạt chuẩn xuất sắc" | "Đạt yêu cầu" | "Trung bình / Có tỳ vết" | "Chưa đạt / Phá cách";
  explanation: string; // Lời giải thích chi tiết
}

export interface NobleScoreDetail {
  totalScore: number; // 0.0 - 7.0+
  maxPossible: number; // 7.0 - 8.5
  tierName: string;
  tierBadgeColor: string;
  hkdAssetRange: string;
  vndAssetRange: string;
  masterQuote: string; // Trích dẫn trực tiếp lời giảng của Tô Dân Phong
  careerStatusVerdict: string;
  wealthPotentialVerdict: string;
  criteria: NobleScoreCriteriaItem[];
  // Bổ sung từ Bát Tự Bút Ký V16 & Sheet Giới Thiệu:
  redPointRule: string;
  hasTaiKho: boolean;
  taiKhoVerdict: string;
  taiKhoDiscountWarning: string;
  genderDiscountNote: string;
}

export interface OrganHealthDetail {
  element: NguhHanh;
  organs: string;
  riskLevel: "Nguy cơ cao (Quá vượng / Bị hình xung)" | "Cần lưu tâm (Suy nhược)" | "Bình thường ổn định";
  details: string;
}

export interface PeterSoFiveElementsResult {
  scores: Record<NguhHanh, number>;
  totalScore: number;
  dongDang: number; // Tỷ Kiếp + Ấn Tinh
  diDang: number;   // Thực Thương + Tài Tinh + Quan Sát
  strengthVerdict: "Thân Cường" | "Hơi Vượng" | "Gần Như Cân Bằng" | "Hơi Nhược" | "Thân Nhược";
  strengthExplanation: string;
  hyKyBreakdown: {
    element: NguhHanh;
    tenGodCategory: "Tỷ Kiếp" | "Thực Thương" | "Tài Tinh" | "Quan Sát" | "Ấn Tinh";
    tenGodRole: string;
    isFavorable: boolean;
    favorableLevel: "Dụng Thần (Đại Cát)" | "Hỷ Thần (Cát)" | "Bình Hòa" | "Kỵ Thần (Hung)";
    description: string;
  }[];
  organVulnerabilities: {
    element: NguhHanh;
    score: number;
    status: "Bình Thường" | "Nguy cơ cao (Quá Vượng)" | "Nguy cơ cao (Suy Nhược)";
    affectedOrgans: string;
    warning: string;
  }[];
}

export interface DaiVanSecretRule {
  tuyetXuPhungSinh: string;
  businessImperative: string;
  youthCollapseRisk: string;
  transitionDefense: string;
  tyKiepNoLuckFix: string;
  geoFactor: string;
}

export interface CrucialYearsForecast {
  zeroAgeMilestones: { age: number; year: number; event: string }[];
  weddingYears: number[];
  thienKhacDiaXung: {
    pillar: string;
    canChi: string;
    description: string;
    years: number[];
    consequence: string;
  }[];
  phucNgamYears: {
    pillar: string;
    canChi: string;
    years: number[];
    warning: string;
  }[];
}

export interface BatTuBiPhapItem {
  id: string;
  category: "Lục Thân" | "Hôn Nhân" | "Vận Hạn Kiếp Nạn" | "Tướng Mạo & Khí Chất" | "Sức Khỏe";
  rule: string;
  explanation: string;
  isMatched: boolean;
}

export interface CompleteHanNhietReading {
  // 1. Thông tin đương số
  person: {
    birthDateStr: string;
    solarDateFormatted: string;
    birthHourChi: string;
    hourRange: string;
    gender: "Nam" | "Nữ";
    targetYear: number;
  };

  // 2. Tứ Trụ Bát Tự
  pillars: {
    year: PillarReading;
    month: PillarReading;
    day: PillarReading;
    hour: PillarReading;
  };

  // 3. Nhật Can & Căn Cốt (Theo hệ thống Tô Dân Phong: Bỏ chấp niệm Vượng Nhược)
  dayMaster: {
    name: string;
    chinese: string;
    element: NguhHanh;
    yinYang: AmDuong;
    natureDesc: string;
    stemSymbol: string; // Tượng trưng: Cây đại thụ, Thái dương, Ngọn lửa đèn, v.v.
    psychology: string; // Tố chất & tâm tính thiên phú của 10 Thiên Can
    peterSoPhilosophy: string; // Khẩu quyết Tô Dân Phong: Bỏ chấp niệm Vượng Nhược
    careerOrientationByGod: string; // Định vị hướng đi sự nghiệp theo Thập Thần
    actionRuleByLuck: string; // Kim chỉ nam: "Thuận phong tắc dũng • Nghịch phong tắc thủ"
    strength: "Thân Cực Vượng" | "Thân Vượng" | "Trung Hòa" | "Thân Nhược" | "Thân Cực Nhược";
    strengthScore: number; // 0..100 (Chỉ dùng tham chiếu đối chiếu phụ trợ)
    deLenh: boolean; // Đắc lệnh (Tháng sinh sinh trợ)
    deDia: boolean; // Đắc địa (Có thông căn gốc rễ ở Địa chi)
    deThe: boolean; // Đắc thế (Nhiều Ấn Tỷ sinh trợ)
    careerSuitability: string; // Lời khuyên sự nghiệp theo phương pháp Tô Dân Phong
  };

  // 4. Bản Mệnh Hàn - Nhiệt - Bình Mệnh (Độc quyền Tô Dân Phong)
  mingProfile: {
    type: "Hàn Mệnh" | "Nhiệt Mệnh" | "Xuân Bình Mệnh" | "Thu Bình Mệnh";
    tagline: string;
    seasonDesc: string;
    solarTermAtBirth: string;
    elementNeed: string; // Ngũ hành dụng vận
    elementAvoid: string; // Ngũ hành kỵ
    favorableDirections: string[];
    favorableColors: string[];
    unfavorableColors: string[];
    masterQuote: string; // Trích dẫn trực tiếp từ bài giảng Tô Dân Phong
  };

  // 5. Tuổi Khởi Vận & Vòng Đại Vận (8 Đại Vận 80 năm)
  tuoiVaoVan: {
    summary: string;
    exactStartAge: number;
    years: number;
    months: number;
    days: number;
    direction: "Thuận hành" | "Nghịch hành";
    targetTermName: string;
    targetTermDate: string;
    diffDaysFormatted: string;
    reason: string;
  };
  daiVanList: DaiVanInfo[];

  // 5.5. Bảng Điểm Ngũ Hành & Đồng Đảng / Dị Đảng / Hỷ Kỵ (Bát Tự Bút Ký V16 - Tô Dân Phong)
  fiveElementsDetail: PeterSoFiveElementsResult;

  // 6. Chấm Điểm Quý Cách Độc Môn Tô Dân Phong (Thang Điểm 0 – 7+)
  nobleScore: NobleScoreDetail;

  // Bổ sung từ Bát Tự Bút Ký V16 & Sheet Giới Thiệu:
  daiVanSecretRules: DaiVanSecretRule;
  crucialYears: CrucialYearsForecast;
  batTuBiPhap: BatTuBiPhapItem[];

  // 7. Luận Đoán 6 Trục Cuộc Đời ("SỰ") - Đúc kết từ 80 bài giảng & Bút Ký V16
  sixPillarsAnalysis: {
    careerAndWealth: {
      title: string;
      badge: string;
      roleRecommendation: "Thích Hợp Tự Làm Chủ / Khởi Nghiệp" | "Thích Hợp Làm Chuyên Môn / Công Chức / Làm Thuê";
      investmentStrategy: string;
      wealthPattern: string; // Chính tài, Thiên tài, Thực thương sinh tài
      favorableIndustries: string[];
      details: string[];
      peterSoPhilosophy?: string;
    };

    marriageAndLove: {
      title: string;
      badge: string;
      palaceStatus: string; // Cung Phu Thê (Nhật Chi) hòa hợp hay bị xung
      isSpousePalaceClashed: boolean;
      clashDetails?: string;
      idealMarriageAgeRange: string; // Độ tuổi kết hôn đẹp nhất
      marriageTimingRule: string; // Quy luật kết hôn đầu vận / cuối vận của Tô Dân Phong
      loveFortuneYearAdvice: string;
      details: string[];
      divorceLuckAdvice: string;
      daoHoaPhoiNgau: string;
      daoHoaStars: string[];
      tuatMuiHinhAdvice?: string;
      spouseTenGodAnalysis?: string;
    };

    healthAndOrgans: {
      title: string;
      badge: string;
      stomachIntestineRisk: "Cao (Thổ khô Thổ ướt tương xung/hình)" | "Trung bình" | "Thấp";
      cardioVascularRisk: string; // Tim mạch, huyết áp thấp (Hàn) hay cao (Nhiệt)
      kidneyUterusRisk: string; // Thận, bàng quang, tử cung phụ khoa (đặc biệt chi Sửu)
      liverEyeRisk: string; // Gan mật, thị lực, thần kinh
      surgeryAccidentWarning: string; // Cảnh báo phẫu thuật đao kiếm do xung Thời trụ
      preventionDetails: string[];
      organDetailsByElement: OrganHealthDetail[];
    };

    familySixRelatives: {
      title: string;
      badge: string;
      ancestorConnection: string; // Trụ Năm (Ông bà, tổ nghiệp)
      parentsSiblingsConnection: string; // Trụ Tháng (Cha mẹ, anh em)
      selfAndSpouseConnection: string; // Trụ Ngày (Bản thân, hôn nhân)
      childrenPosterityConnection: string; // Trụ Giờ (Con cái, hậu vận)
      fourPillarsInteractions: string[]; // Các thế xung hợp: Niên-Nguyệt xung, Nguyệt-Nhật xung, Nhật-Thời xung
    };

    currentYearForecast: {
      title: string;
      yearCanChi: string;
      taiSuiRelation: string;
      tenGodOfCurrentYear: string;
      wealthCurrentYear: string;
      careerCurrentYear: string;
      loveCurrentYear: string;
      healthCurrentYear: string;
      masterRemedySecret: string;
    };

    fengshuiRemedy: {
      title: string;
      livingDirections: string;
      bedHeadDirection: string;
      wardrobeColors: string;
      homeRemedy: string;
      dongThoRemedy: string;
    };
  };
}

// ==========================================
// 2. BẢNG TRA CỨU NGŨ HÀNH & TÀNG CAN
// ==========================================

export const CAN_META: Record<string, { element: NguhHanh; yinYang: AmDuong; chinese: string }> = {
  "Giáp": { element: "Mộc", yinYang: "Dương", chinese: "甲" },
  "Ất": { element: "Mộc", yinYang: "Âm", chinese: "乙" },
  "Bính": { element: "Hỏa", yinYang: "Dương", chinese: "丙" },
  "Đinh": { element: "Hỏa", yinYang: "Âm", chinese: "丁" },
  "Mậu": { element: "Thổ", yinYang: "Dương", chinese: "戊" },
  "Kỷ": { element: "Thổ", yinYang: "Âm", chinese: "己" },
  "Canh": { element: "Kim", yinYang: "Dương", chinese: "庚" },
  "Tân": { element: "Kim", yinYang: "Âm", chinese: "辛" },
  "Nhâm": { element: "Thủy", yinYang: "Dương", chinese: "壬" },
  "Quý": { element: "Thủy", yinYang: "Âm", chinese: "癸" },
};

// ==========================================
// 2B. TỐ CHẤT THIÊN PHÚ 10 THIÊN CAN & TRIẾT LÝ TÔ DÂN PHONG
// (Tô Dân Phong: Không chấp vào Thân Vượng hay Thân Nhược)
// ==========================================

export const PETER_SO_DAY_MASTER_PHILOSOPHY =
  "Tô Dân Phong (Hồng Kông) giảng rõ: 'Tử Bình truyền thống dành cả đời tranh luận Thân Vượng hay Thân Nhược để tìm Phò Ức Dụng Thần, tốn 10 năm cũng khó đoán chuẩn xác. Trong hệ thống Hàn Nhiệt Mệnh của chúng ta, VẬN TỐT XẤU 100% DO ĐIỀU HẬU MÙA SINH QUYẾT ĐỊNH! Người Thân Vượng hay Thân Nhược sinh mùa đông đều cần Hỏa; sinh mùa hè đều cần Thủy. Thân vượng hay nhược KHÔNG quyết định bạn làm chủ hay làm thuê — người thân nhược đi đúng vận hoàng kim vẫn là tỷ phú trùm kinh doanh; người thân vượng đi nghịch vận vẫn làm thuê chật vật. Làm chủ hay làm thuê là do Thập Thần (Thực Thương/Thiên Tài/Sát) và Vòng Đại Vận: Thuận phong tắc dũng, nghịch phong tắc thủ!'";

export const STEM_NATURE_PROFILES: Record<
  string,
  {
    symbol: string;
    nature: string;
    psychology: string;
    careerTendency: string;
    masterAdvice: string;
  }
> = {
  "Giáp": {
    symbol: "Cây đại thụ chọc trời (Đại Mộc)",
    nature: "Cương trực, kiên định, hào phóng, có lòng trắc ẩn và chí tiến thủ mãnh liệt",
    psychology: "Ghét sự quanh co luồn cúi, coi trọng thể diện và đạo nghĩa; có tinh thần tiên phong mở lối nhưng đôi khi cứng nhắc, cần học cách uyển chuyển linh hoạt.",
    careerTendency: "Phù hợp vị trí đứng đầu, khai sáng dự án mới, tự lập nghiệp hoặc nắm quyền quản trị tổng thể.",
    masterAdvice: "Tô Dân Phong: Cây to đón gió lớn, vào vận thuận thì vươn cao ngút ngàn, vào vận nghịch phải biết uốn mình khiêm nhượng, không nên cứng đối cứng."
  },
  "Ất": {
    symbol: "Dây leo, hoa cỏ mềm mại (Ất Mộc)",
    nature: "Uyển chuyển, linh hoạt, khả năng sinh tồn và thích nghi nghịch cảnh tuyệt vời",
    psychology: "Tư duy mềm mỏng 'nước chảy bèo trôi', giỏi tận dụng sức mạnh người khác, khéo léo kết nối các nguồn lực; kiên trì bền bỉ, không dễ dàng gãy đổ.",
    careerTendency: "Phù hợp đàm phán, quan hệ công chúng, tư vấn chiến lược, thiết kế nghệ thuật, thương mại liên kết hợp tác.",
    masterAdvice: "Tô Dân Phong: Dây leo nhờ cậy cây cao, giỏi mượn lực quý nhân và thời thế thì dù không làm chủ một mình vẫn thu hoạch tài lộc dồi dào."
  },
  "Bính": {
    symbol: "Thái dương rực rỡ (Đại Hỏa)",
    nature: "Nhiệt huyết, quang minh chính đại, hào sảng, phóng khoáng và giàu năng lượng",
    psychology: "Thích che chở và soi sáng cho người khác, tính tình bộc trực, ruột để ngoài da, ghét mờ ám; đôi khi nóng vội, thiếu kiên nhẫn với việc vụn vặt.",
    careerTendency: "Phù hợp làm truyền thông, marketing, năng lượng, thương hiệu, diễn giả hoặc dẫn dắt tập thể.",
    masterAdvice: "Tô Dân Phong: Ánh dương chiếu rọi muôn loài, cần học cách thu bớt nhiệt khi ở nghịch vận, tránh để cảm xúc bộc phát làm hỏng việc lớn."
  },
  "Đinh": {
    symbol: "Ánh lửa ngọn đèn, đốm lửa ấm (Đinh Hỏa)",
    nature: "Tinh tế, mẫn cảm, trực giác sắc bén, nội tâm sâu sắc và ấm áp",
    psychology: "Quan sát tỉ mỉ từng chi tiết, có tư duy logic và chiều sâu tâm lý; bề ngoài điềm đạm nhưng nội tâm có ngọn lửa đam mê âm ỉ cháy bỏng.",
    careerTendency: "Phù hợp nghiên cứu học thuật, công nghệ cao, tài chính đầu tư phân tích, nghệ thuật, thiết kế hoặc tâm lý học.",
    masterAdvice: "Tô Dân Phong: Lửa ngọn đèn soi sáng bóng đêm, cần giữ tâm thái tĩnh tại, trau dồi chuyên môn sâu để tỏa sáng đúng thời điểm."
  },
  "Mậu": {
    symbol: "Đất đê điều, núi non hùng vĩ (Đại Thổ)",
    nature: "Vững chãi, trầm ổn, trung hậu, trọng chữ tín và có sức chịu đựng phi thường",
    psychology: "Là chỗ dựa đáng tin cậy của bạn bè và cộng sự; hành sự cẩn trọng, chắc chắn nhưng đôi khi hơi chậm chạp, bảo thủ, khó thay đổi góc nhìn.",
    careerTendency: "Phù hợp bất động sản, xây dựng, quản trị vận hành, logistics kho vận, bảo hiểm hoặc các ngành đòi hỏi sự uy tín dài hạn.",
    masterAdvice: "Tô Dân Phong: Núi cao giữ được đất đai, khi vào vận thì tích tụ tài phú vững như bàn thạch; kỵ nhất là cố chấp không chịu đổi mới."
  },
  "Kỷ": {
    symbol: "Đất vườn ươm, ruộng đồng phì nhiêu (Kỷ Thổ)",
    nature: "Bao dung, nhẫn nại, khéo léo nuôi dưỡng, thích hòa giải và kết nối êm đẹp",
    psychology: "Lòng dạ nhân từ, biết lắng nghe và thấu hiểu người khác; đa tài đa nghệ, mềm mỏng nhưng đôi khi thiếu tính dứt khoát, dễ cả nể ôm đồm.",
    careerTendency: "Phù hợp giáo dục, đào tạo nhân sự, chăm sóc khách hàng, y tế, ẩm thực, nông nghiệp sạch hoặc cố vấn hòa giải.",
    masterAdvice: "Tô Dân Phong: Đất ruộng màu mỡ nuôi dưỡng vạn vật, cần rèn luyện sự quyết đoán khi đứng trước các ngã rẽ lớn của cuộc đời."
  },
  "Canh": {
    symbol: "Kiếm đao, thép cứng sắc bén (Đại Kim)",
    nature: "Cương trực, dũng cảm, ghét gian tà dối trá, quyết đoán và kỷ luật thép",
    psychology: "Có tinh thần chiến đấu cao, phong thái tướng soái, không sợ va chạm; trọng nghĩa khí huynh đệ nhưng đôi khi quá khắt khe, dễ gây tổn thương người khác.",
    careerTendency: "Phù hợp quân đội, công an, luật sư tranh tụng, tài chính ngân hàng, cơ khí công nghiệp nặng hoặc lãnh đạo giải cứu khủng hoảng.",
    masterAdvice: "Tô Dân Phong: Kim chưa qua lửa tôi luyện thì còn thô ráp; người Canh Kim phải trải qua rèn giũa nghịch cảnh mới trở thành thần binh bảo kiếm."
  },
  "Tân": {
    symbol: "Vàng bạc châu báu, ngọc ngà tinh xảo (Tân Kim)",
    nature: "Thanh cao, tinh tế, trọng thể diện, yêu cái đẹp hoàn mỹ và có khiếu thẩm mỹ",
    psychology: "Tư duy bén nhọn, giỏi ăn nói giao thiệp, có lòng tự tôn rất cao; rất sợ bị lu mờ hay xem thường; nhạy cảm với sự đối đãi của người xung quanh.",
    careerTendency: "Phù hợp ngành xa xỉ phẩm, trang sức, thời trang cao cấp, ngoại giao, tư vấn tài chính cá nhân, MC hoặc sáng tạo thẩm mỹ.",
    masterAdvice: "Tô Dân Phong: Ngọc quý cần nước rửa sạch bụi bẩn (Tân Kim hỷ Nhâm Thủy thau rửa); vào vận Thủy là danh tiếng vang dội, quý hiển tự nhiên."
  },
  "Nhâm": {
    symbol: "Nước sông lớn, sóng biển đại dương (Đại Thủy)",
    nature: "Thông minh cơ biến, chí hướng bao la khoáng đạt, tràn đầy sức sống",
    psychology: "Thích tự do bay nhảy, ghét mọi sự ràng buộc gò bó; đầu óc nhạy bén với xu thế xã hội, thích xông pha làm ăn lớn nhưng đôi khi thiếu kiên trì việc nhỏ.",
    careerTendency: "Phù hợp thương mại quốc tế, xuất nhập khẩu, du lịch lữ hành, đầu tư mạo hiểm, chuỗi phân phối hoặc khởi nghiệp công nghệ.",
    masterAdvice: "Tô Dân Phong: Nước chảy về biển lớn không gì cản nổi, cần có đê điều (Mậu Thổ) ngăn chặn mới không tràn lan thất thoát khi vào vận nghịch."
  },
  "Quý": {
    symbol: "Nước mưa sương mai, dòng suối mát lành (Quý Thủy)",
    nature: "Dịu dàng, thông tuệ thâm trầm, trực giác tâm linh cực nhạy và mềm mại",
    psychology: "Giàu tình cảm, biết khéo léo luồn lách qua mọi trở ngại mà không để lại vết hằn; thấu hiểu nhân tâm, nhìn thấu sự thật nhưng đôi khi hay suy nghĩ quá nhiều.",
    careerTendency: "Phù hợp tâm lý học, tư vấn chiến lược, viết lách sáng tác, y dược trị liệu, triết học huyền học hoặc công tác thiện nguyện.",
    masterAdvice: "Tô Dân Phong: Nước mưa thẩm thấu đất đai âm thầm sinh vượng, biết ẩn nhẫn chờ thời thì vào vận hanh thông sẽ gặt hái thành quả ngoài mong đợi."
  }
};

export const CHI_META: Record<string, { element: NguhHanh; yinYang: AmDuong; chinese: string; isDryEarth?: boolean; isWetEarth?: boolean }> = {
  "Tý": { element: "Thủy", yinYang: "Dương", chinese: "子" },
  "Sửu": { element: "Thổ", yinYang: "Âm", chinese: "丑", isWetEarth: true },
  "Dần": { element: "Mộc", yinYang: "Dương", chinese: "寅" },
  "Mão": { element: "Mộc", yinYang: "Âm", chinese: "卯" },
  "Thìn": { element: "Thổ", yinYang: "Dương", chinese: "辰", isWetEarth: true },
  "Tỵ": { element: "Hỏa", yinYang: "Âm", chinese: "巳" },
  "Ngọ": { element: "Hỏa", yinYang: "Dương", chinese: "午" },
  "Mùi": { element: "Thổ", yinYang: "Âm", chinese: "未", isDryEarth: true },
  "Thân": { element: "Kim", yinYang: "Dương", chinese: "申" },
  "Dậu": { element: "Kim", yinYang: "Âm", chinese: "酉" },
  "Tuất": { element: "Thổ", yinYang: "Dương", chinese: "戌", isDryEarth: true },
  "Hợi": { element: "Thủy", yinYang: "Âm", chinese: "亥" },
};

// Địa Chi Tàng Can chuẩn xác Tử Bình / Tô Dân Phong
export const CHI_HIDDEN_STEMS: Record<string, { stem: string; type: "Chính khí" | "Trung khí" | "Dư khí" }[]> = {
  "Tý": [{ stem: "Quý", type: "Chính khí" }],
  "Sửu": [
    { stem: "Kỷ", type: "Chính khí" },
    { stem: "Quý", type: "Trung khí" },
    { stem: "Tân", type: "Dư khí" },
  ],
  "Dần": [
    { stem: "Giáp", type: "Chính khí" },
    { stem: "Bính", type: "Trung khí" },
    { stem: "Mậu", type: "Dư khí" },
  ],
  "Mão": [{ stem: "Ất", type: "Chính khí" }],
  "Thìn": [
    { stem: "Mậu", type: "Chính khí" },
    { stem: "Ất", type: "Trung khí" },
    { stem: "Quý", type: "Dư khí" },
  ],
  "Tỵ": [
    { stem: "Bính", type: "Chính khí" },
    { stem: "Canh", type: "Trung khí" },
    { stem: "Mậu", type: "Dư khí" },
  ],
  "Ngọ": [
    { stem: "Đinh", type: "Chính khí" },
    { stem: "Kỷ", type: "Trung khí" },
  ],
  "Mùi": [
    { stem: "Kỷ", type: "Chính khí" },
    { stem: "Đinh", type: "Trung khí" },
    { stem: "Ất", type: "Dư khí" },
  ],
  "Thân": [
    { stem: "Canh", type: "Chính khí" },
    { stem: "Nhâm", type: "Trung khí" },
    { stem: "Mậu", type: "Dư khí" },
  ],
  "Dậu": [{ stem: "Tân", type: "Chính khí" }],
  "Tuất": [
    { stem: "Mậu", type: "Chính khí" },
    { stem: "Tân", type: "Trung khí" },
    { stem: "Đinh", type: "Dư khí" },
  ],
  "Hợi": [
    { stem: "Nhâm", type: "Chính khí" },
    { stem: "Giáp", type: "Trung khí" },
  ],
};

// Cặp Lục Xung
export const CLASH_PAIRS: Record<string, string> = {
  "Tý": "Ngọ", "Ngọ": "Tý",
  "Sửu": "Mùi", "Mùi": "Sửu",
  "Dần": "Thân", "Thân": "Dần",
  "Mão": "Dậu", "Dậu": "Mão",
  "Thìn": "Tuất", "Tuất": "Thìn",
  "Tỵ": "Hợi", "Hợi": "Tỵ",
};

// Cặp Lục Hợp
export const HARMONY_PAIRS: Record<string, string> = {
  "Tý": "Sửu", "Sửu": "Tý",
  "Dần": "Hợi", "Hợi": "Dần",
  "Mão": "Tuất", "Tuất": "Mão",
  "Thìn": "Dậu", "Dậu": "Thìn",
  "Tỵ": "Thân", "Thân": "Tỵ",
  "Ngọ": "Mùi", "Mùi": "Ngọ",
};

// ==========================================
// 3. HÀM TÍNH THẬP THẦN & NGŨ HÀNH
// ==========================================

export function getTenGod(dayCan: string, targetStem: string): string {
  if (dayCan === targetStem) return "Tỷ Kiên";

  const dayMeta = CAN_META[dayCan];
  const targetMeta = CAN_META[targetStem];
  if (!dayMeta || !targetMeta) return "Tỷ Kiên";

  const samePolarity = dayMeta.yinYang === targetMeta.yinYang;

  // Cùng ngũ hành
  if (dayMeta.element === targetMeta.element) {
    return samePolarity ? "Tỷ Kiên" : "Kiếp Tài";
  }

  // Nhật can sinh ra targetStem
  const isBirth =
    (dayMeta.element === "Mộc" && targetMeta.element === "Hỏa") ||
    (dayMeta.element === "Hỏa" && targetMeta.element === "Thổ") ||
    (dayMeta.element === "Thổ" && targetMeta.element === "Kim") ||
    (dayMeta.element === "Kim" && targetMeta.element === "Thủy") ||
    (dayMeta.element === "Thủy" && targetMeta.element === "Mộc");

  if (isBirth) {
    return samePolarity ? "Thực Thần" : "Thương Quan";
  }

  // Nhật can khắc targetStem
  const isOvercome =
    (dayMeta.element === "Mộc" && targetMeta.element === "Thổ") ||
    (dayMeta.element === "Hỏa" && targetMeta.element === "Kim") ||
    (dayMeta.element === "Thổ" && targetMeta.element === "Thủy") ||
    (dayMeta.element === "Kim" && targetMeta.element === "Mộc") ||
    (dayMeta.element === "Thủy" && targetMeta.element === "Hỏa");

  if (isOvercome) {
    return samePolarity ? "Thiên Tài" : "Chính Tài";
  }

  // targetStem khắc Nhật can
  const isOvercomeBy =
    (targetMeta.element === "Mộc" && dayMeta.element === "Thổ") ||
    (targetMeta.element === "Hỏa" && dayMeta.element === "Kim") ||
    (targetMeta.element === "Thổ" && dayMeta.element === "Thủy") ||
    (targetMeta.element === "Kim" && dayMeta.element === "Mộc") ||
    (targetMeta.element === "Thủy" && dayMeta.element === "Hỏa");

  if (isOvercomeBy) {
    return samePolarity ? "Thất Sát" : "Chính Quan";
  }

  // targetStem sinh Nhật can
  return samePolarity ? "Thiên Ấn (Kiêu)" : "Chính Ấn";
}

// ==========================================
// 4. HÀM TÍNH HÀN - NHIỆT - BÌNH MỆNH CHUẨN XÁC
// ==========================================

export function getHanNhietCategory(
  sunDeg: number,
  solarMonth: number,
  solarDay: number
): {
  type: "Hàn Mệnh" | "Nhiệt Mệnh" | "Xuân Bình Mệnh" | "Thu Bình Mệnh";
  tagline: string;
  seasonDesc: string;
  solarTermAtBirth: string;
  elementNeed: string;
  elementAvoid: string;
  favorableDirections: string[];
  favorableColors: string[];
  unfavorableColors: string[];
  masterQuote: string;
} {
  // Lập Đông: 225° (khoảng 7-8/11)
  // Kinh Trập: 345° (khoảng 5-6/3)
  // Lập Hạ: 45° (khoảng 5-6/5)
  // Lập Thu: 135° (khoảng 7-8/8)

  let type: "Hàn Mệnh" | "Nhiệt Mệnh" | "Xuân Bình Mệnh" | "Thu Bình Mệnh" = "Hàn Mệnh";
  let tagline = "";
  let seasonDesc = "";
  let solarTermAtBirth = "";

  // Tìm tên tiết khí gần nhất
  for (const st of SOLAR_TERMS_24) {
    if (sunDeg >= st.deg) {
      solarTermAtBirth = st.name;
    }
  }

  // 1. Hàn Mệnh: Từ Lập Đông (225°) qua Đông chí đến trước Kinh Trập (345°)
  if (sunDeg >= 225 && sunDeg < 345) {
    type = "Hàn Mệnh";
    tagline = "Hàn Mệnh Nhân • Sinh Mùa Đông Lạnh & Đầu Xuân Giá Băng";
    seasonDesc = "Sinh vào khoảng thời gian từ sau Tiết Lập Đông (khoảng 8/11) đến trước Tiết Kinh Trập (khoảng 6/3) năm sau. Trời đất kim hàn thủy lãnh, thiếu ánh nắng mặt trời, khí hàn tích tụ.";
  }
  // 2. Nhiệt Mệnh: Từ Lập Hạ (45°) đến trước Lập Thu (135°)
  else if (sunDeg >= 45 && sunDeg < 135) {
    type = "Nhiệt Mệnh";
    tagline = "Nhiệt Mệnh Nhân • Sinh Mùa Hè Nắng Nóng Rực Rỡ";
    seasonDesc = "Sinh vào khoảng thời gian từ sau Tiết Lập Hạ (khoảng 6/5) đến trước Tiết Lập Thu (khoảng 8/8). Thời tiết mùa hè hỏa viêm thổ táo, dương thịnh âm suy, vạn vật khát nước tư nhuận.";
  }
  // 3. Xuân Bình Mệnh: Từ Kinh Trập (345°) qua 0° đến trước Lập Hạ (45°)
  else if (sunDeg >= 345 || sunDeg < 45) {
    type = "Xuân Bình Mệnh";
    tagline = "Xuân Bình Mệnh Nhân • Sinh Giữa Mùa Xuân Khí Ấm Đâm Chồi";
    seasonDesc = "Sinh vào khoảng từ sau Tiết Kinh Trập (khoảng 6/3) đến trước Tiết Lập Hạ (khoảng 6/5). Khí xuân ấm áp, Mộc khí cực vượng, âm dương tương đối cân đối.";
  }
  // 4. Thu Bình Mệnh: Từ Lập Thu (135°) đến trước Lập Đông (225°)
  else {
    type = "Thu Bình Mệnh";
    tagline = "Thu Bình Mệnh Nhân • Sinh Mùa Thu Mát Mẻ Túc Sát";
    seasonDesc = "Sinh vào khoảng từ sau Tiết Lập Thu (khoảng 8/8) đến trước Tiết Lập Đông (khoảng 8/11). Khí thu mát dần chuyển lạnh, Kim khí đang lệnh, vạn vật thu liễm.";
  }

  if (type === "Hàn Mệnh") {
    return {
      type,
      tagline,
      seasonDesc,
      solarTermAtBirth,
      elementNeed: "Hỷ MỘC & HỎA (Tuyệt đối cần Hỏa sưởi ấm, Mộc sinh Hỏa trợ lực)",
      elementAvoid: "Kỵ KIM & THỦY (Tránh kim hàn thủy lãnh làm tắt ngọn lửa)",
      favorableDirections: ["Chính Nam (Hỏa)", "Đông & Đông Nam (Mộc)"],
      favorableColors: ["Đỏ", "Cam", "Hồng", "Tím", "Xanh lá cây", "Xanh lục"],
      unfavorableColors: ["Đen", "Xám tro", "Xanh nước biển", "Trắng", "Vàng kim"],
      masterQuote:
        "Tô Dân Phong truyền dạy (Master Class 2009 Bài 01 & 2011 Bài 09): 'Người Hàn Mệnh sinh mùa đông lạnh ngắt, cả đời vận hên xui do Mộc Hỏa quyết định. Đi vào Đại vận Mộc Hỏa 30 năm thì tiền tài như nước, quý nhân trợ lực; vào vận Kim Thủy thì nên thủ tĩnh dưỡng sinh! Đặc biệt nếu Bát Tự sinh mùa đông mà trong tứ trụ hoàn toàn khuyết Hỏa: tâm lý thường thiếu cảm giác an toàn, bi quan, dễ lo lắng thái quá — giải pháp là luôn giữ không gian ấm áp, dùng màu đỏ/cam, nuôi thú cưng để cân bằng tâm lý.'",
    };
  }

  if (type === "Nhiệt Mệnh") {
    return {
      type,
      tagline,
      seasonDesc,
      solarTermAtBirth,
      elementNeed: "Hỷ KIM & THỦY (Cực kỳ cần Thủy tư nhuận làm mát, Kim sinh Thủy)",
      elementAvoid: "Kỵ MỘC & HỎA (Tránh hỏa thiêu đốt, thổ khô nứt nẻ)",
      favorableDirections: ["Chính Bắc (Thủy)", "Tây & Tây Bắc (Kim)"],
      favorableColors: ["Đen", "Xanh nước biển", "Xanh lam", "Trắng", "Xám bạc", "Vàng ánh kim"],
      unfavorableColors: ["Đỏ", "Cam", "Hồng", "Tím", "Xanh lá cây"],
      masterQuote:
        "Tô Dân Phong truyền dạy (Master Class 2009 Bài 01 & 2010 Bài 02): 'Người Nhiệt Mệnh sinh mùa hè lửa cháy bừng bừng, hỏa vượng thì phải lấy Kim Thủy làm dụng thần cứu mạng. Gặp vận Kim Thủy thì thuận buồm xuôi gió, bung sức làm giàu; gặp vận Mộc Hỏa thì phải kiên nhẫn thủ tĩnh, giữ chắc vốn liếng, phòng hao tổn tích đức!'",
    };
  }

  if (type === "Xuân Bình Mệnh") {
    return {
      type,
      tagline,
      seasonDesc,
      solarTermAtBirth,
      elementNeed: "Hơi thiên hỷ KIM & THỦY (Kim chặt tỉa bớt Mộc vượng, Thủy tư dưỡng hòa hoãn)",
      elementAvoid: "Không quá kỵ Hỏa, nhưng tránh Mộc quá cường vượng",
      favorableDirections: ["Tây Bắc", "Chính Bắc", "Chính Tây"],
      favorableColors: ["Trắng", "Bạc", "Đen", "Xanh lam", "Xám ghi"],
      unfavorableColors: ["Tránh mặc toàn bộ trang phục màu xanh lá đơn điệu"],
      masterQuote:
        "Tô Dân Phong truyền dạy: 'Xuân Bình Mệnh sinh từ sau Kinh Trập đến trước Lập Hạ, khí ấm vừa sang, ngũ hành tương đối điều hòa. Gặp Kim Thủy vận thì tiến bộ vượt bậc, gặp Hỏa vận cũng không đáng lo!'",
    };
  }

  // Thu Bình Mệnh
  return {
    type,
    tagline,
    seasonDesc,
    solarTermAtBirth,
    elementNeed: "Hỷ HỎA (Yếu Hỏa bất kỵ Thủy: Cần Hỏa sưởi ấm, nhưng gặp Thủy là vận bình thường, không bao giờ suy sụp)",
    elementAvoid: "Không quá kỵ Thủy, chỉ tránh Kim Thủy quá cực đoan buốt giá",
    favorableDirections: ["Chính Nam", "Đông Nam", "Chính Đông"],
    favorableColors: ["Đỏ", "Hồng", "Cam", "Xanh lục", "Xanh lá cây"],
    unfavorableColors: ["Tránh màu xám lạnh và trắng bạc kéo dài"],
    masterQuote:
      "Tô Dân Phong truyền dạy (Master Class 2009 Bài 01 & 2010 Bài 07 & 2011 Bài 19): 'Thu thiên xuất thế, yếu Hỏa bất kỵ Thủy (Sinh mùa thu cần Hỏa nhưng không kỵ Thủy)! Đi vào Thủy vận là vận bình thường, không phải suy vận, không bao giờ sụp đổ! Người Bình Mệnh cả đời không hành đại vận lớn thì làm công ăn lương, an nhàn, bình ổn, hậu vận tích lũy rất tốt!'",
  };
}

// ==========================================
// 5. THAM CHIẾU CĂN CỐT NHẬT NGUYÊN (TÔ DÂN PHONG: BỎ CHẤP NIỆM VƯỢNG NHƯỢC)
// Lưu ý: Tô Dân Phong không dùng Thân Vượng hay Thân Nhược để chọn Dụng Thần.
// Mục này tính toán gốc rễ thông căn nhằm phục vụ tham chiếu đối chiếu,
// không dùng để quy kết cứng nhắc "Thân Vượng làm chủ, Thân Nhược làm thuê".
// ==========================================

export function evaluateDayMasterStrength(
  dayCan: string,
  monthChi: string,
  pillars: { can: string; chi: string }[]
): {
  strength: "Thân Cực Vượng" | "Thân Vượng" | "Trung Hòa" | "Thân Nhược" | "Thân Cực Nhược";
  strengthScore: number;
  deLenh: boolean;
  deDia: boolean;
  deThe: boolean;
  careerSuitability: string;
} {
  const dayMeta = CAN_META[dayCan];
  const monthMeta = CHI_META[monthChi];
  let score = 20; // Điểm cơ sở

  // 1. Đắc lệnh: Tháng sinh sinh trợ Nhật Can (Trọng số 40 điểm)
  let deLenh = false;
  if (
    monthMeta.element === dayMeta.element ||
    (dayMeta.element === "Mộc" && monthMeta.element === "Thủy") ||
    (dayMeta.element === "Hỏa" && monthMeta.element === "Mộc") ||
    (dayMeta.element === "Thổ" && monthMeta.element === "Hỏa") ||
    (dayMeta.element === "Kim" && monthMeta.element === "Thổ") ||
    (dayMeta.element === "Thủy" && monthMeta.element === "Kim")
  ) {
    deLenh = true;
    score += 35;
  }

  // 2. Đắc địa: Địa chi có thông căn gốc rễ (Trọng số 25 điểm)
  let deDiaCount = 0;
  for (const p of pillars) {
    const hidden = CHI_HIDDEN_STEMS[p.chi] || [];
    for (const h of hidden) {
      if (CAN_META[h.stem]?.element === dayMeta.element) {
        deDiaCount++;
        score += h.type === "Chính khí" ? 10 : 5;
      }
    }
  }
  const deDia = deDiaCount >= 2;

  // 3. Đắc thế: Các can còn lại có Ấn / Tỷ Kiếp sinh trợ (Trọng số 20 điểm)
  let deTheCount = 0;
  for (const p of pillars) {
    if (p.can === dayCan) continue;
    const tg = getTenGod(dayCan, p.can);
    if (tg.includes("Ấn") || tg.includes("Tỷ") || tg.includes("Kiếp")) {
      deTheCount++;
      score += 7;
    }
  }
  const deThe = deTheCount >= 2;

  score = Math.min(95, Math.max(10, score));

  let strength: "Thân Cực Vượng" | "Thân Vượng" | "Trung Hòa" | "Thân Nhược" | "Thân Cực Nhược" = "Trung Hòa";
  if (score >= 75) strength = "Thân Cực Vượng";
  else if (score >= 58) strength = "Thân Vượng";
  else if (score >= 42) strength = "Trung Hòa";
  else if (score >= 25) strength = "Thân Nhược";
  else strength = "Thân Cực Nhược";

  const careerSuitability =
    "Tô Dân Phong nhấn mạnh: Không dùng Thân Vượng hay Nhược để quy định làm chủ hay làm thuê! Thành bại kinh doanh 100% phụ thuộc vào Đại Vận thuận hay nghịch ('Thuận phong tắc dũng, nghịch phong tắc thủ'). Người Thân Nhược đi đúng vận hoàng kim vẫn làm trùm kinh doanh tài chính triệu phú; người Thân Vượng đi nghịch vận vẫn thất bại. Hướng đi do Thập Thần dẫn lối (Thực Thương/Thiên Tài/Sát chuộng mạo hiểm khởi nghiệp; Quan/Ấn/Chính Tài chuộng chuyên môn tổ chức).";

  return { strength, strengthScore: score, deLenh, deDia, deThe, careerSuitability };
}

// ==========================================
// 6. THUẬT TOÁN TÍNH ĐIỂM NGŨ HÀNH & ĐỒNG ĐẢNG / DỊ ĐẢNG (BÁT TỰ BÚT KÝ V16 - TÔ DÂN PHONG)
// ==========================================

const GENERATING_ELEMENT: Record<NguhHanh, NguhHanh> = {
  "Mộc": "Thủy",
  "Hỏa": "Mộc",
  "Thổ": "Hỏa",
  "Kim": "Thổ",
  "Thủy": "Kim",
};

const ELEMENT_ORGANS: Record<NguhHanh, string> = {
  "Mộc": "Gan, mật, đầu, gáy, khớp xương, cơ bắp, mắt, thần kinh, tứ chi, tóc, cổ, tuyến giáp",
  "Hỏa": "Tiểu tràng, tim, vai, máu huyết, kinh nguyệt, khuôn mặt, răng, lưỡi, bụng, thần kinh, mạch máu, huyết áp",
  "Thổ": "Lá lách, bao tử, sườn, bụng, lưng, ngực, phổi, dạ dày, da thịt, khối u",
  "Kim": "Phổi, đại tràng, gan, rốn, đùi, họng thanh, khí quản, mũi, da, trĩ, hệ thống hô hấp, xương cốt, răng",
  "Thủy": "Thận, bàng quang, cẳng chân, chân, đầu, xương chậu, đường tiểu tiện, bộ phận sinh dục, lưng, tai, tử cung, hệ thống sinh dục, máu huyết",
};

export function calculatePeterSoFiveElementScores(
  rawPillars: { can: string; chi: string }[], // [Year, Month, Day, Hour]
  dayCan: string,
  mingType: "Hàn Mệnh" | "Nhiệt Mệnh" | "Xuân Bình Mệnh" | "Thu Bình Mệnh"
): PeterSoFiveElementsResult {
  const [yearP, monthP, dayP, hourP] = rawPillars;

  const getElementOfCan = (can: string): NguhHanh => CAN_META[can]?.element || "Thổ";
  const getElementOfChi = (chi: string): NguhHanh => CHI_META[chi]?.element || "Thổ";

  // Điểm thô ban đầu của 5 hành
  const rawScores: Record<NguhHanh, number> = {
    "Mộc": 0,
    "Hỏa": 0,
    "Thổ": 0,
    "Kim": 0,
    "Thủy": 0,
  };

  // 1. Thiên Can: 5 điểm mỗi Can (Giờ, Ngày, Tháng, Năm)
  const canWeights = [
    { p: hourP, weight: 5 },
    { p: dayP, weight: 5 },
    { p: monthP, weight: 5 },
    { p: yearP, weight: 5 },
  ];
  canWeights.forEach(({ p, weight }) => {
    const el = getElementOfCan(p.can);
    rawScores[el] += weight;
  });

  // 2. Địa Chi:
  // - Chính khí: Nguyệt Lệnh (Tháng) = 100đ, Giờ = 75đ, Ngày = 50đ, Năm = 25đ
  // - Trung khí: Tháng = 20đ, Giờ = 15đ, Ngày = 10đ, Năm = 5đ
  // - Dư khí: Tháng = 20đ, Giờ = 15đ, Ngày = 10đ, Năm = 5đ
  const branchWeights = [
    { p: monthP, mainW: 100, midW: 20, resW: 20 },
    { p: hourP, mainW: 75, midW: 15, resW: 15 },
    { p: dayP, mainW: 50, midW: 10, resW: 10 },
    { p: yearP, mainW: 25, midW: 5, resW: 5 },
  ];

  branchWeights.forEach(({ p, mainW, midW, resW }) => {
    const hidden = CHI_HIDDEN_STEMS[p.chi] || [];
    const mainQi = hidden.find((h) => h.type === "Chính khí");
    const midQi = hidden.find((h) => h.type === "Trung khí");
    const resQi = hidden.find((h) => h.type === "Dư khí");

    if (mainQi) {
      const el = getElementOfCan(mainQi.stem);
      rawScores[el] += mainW;
    }
    if (midQi) {
      const el = getElementOfCan(midQi.stem);
      rawScores[el] += midW;
    }
    if (resQi) {
      const el = getElementOfCan(resQi.stem);
      rawScores[el] += resW;
    }
  });

  // 3. Tương Sinh (Sinh Trợ Năng Lượng: Tứ trụ có Can hoặc Chi chính khí là hành sinh thì cộng thêm 1/3 điểm)
  const isPresentInStemsOrMainQi = (targetEl: NguhHanh): boolean => {
    return (
      getElementOfCan(hourP.can) === targetEl ||
      getElementOfCan(dayP.can) === targetEl ||
      getElementOfCan(monthP.can) === targetEl ||
      getElementOfCan(yearP.can) === targetEl ||
      getElementOfChi(hourP.chi) === targetEl ||
      getElementOfChi(dayP.chi) === targetEl ||
      getElementOfChi(monthP.chi) === targetEl ||
      getElementOfChi(yearP.chi) === targetEl
    );
  };

  const finalScores: Record<NguhHanh, number> = { ...rawScores };

  (["Mộc", "Hỏa", "Thổ", "Kim", "Thủy"] as NguhHanh[]).forEach((el) => {
    if (isPresentInStemsOrMainQi(el)) {
      const parentEl = GENERATING_ELEMENT[el];
      canWeights.forEach(({ p, weight }) => {
        if (getElementOfCan(p.can) === parentEl) {
          finalScores[el] += weight / 3;
        }
      });
      branchWeights.forEach(({ p, mainW }) => {
        const hidden = CHI_HIDDEN_STEMS[p.chi] || [];
        const mainQi = hidden.find((h) => h.type === "Chính khí");
        if (mainQi && getElementOfCan(mainQi.stem) === parentEl) {
          finalScores[el] += mainW / 3;
        }
      });
    }
  });

  const totalScore = Object.values(finalScores).reduce((a, b) => a + b, 0);

  // 4. Phân Định Đồng Đảng vs Dị Đảng (Địch)
  const selfEl = getElementOfCan(dayCan);
  const resourceEl = GENERATING_ELEMENT[selfEl]; // Ấn Tinh
  const outputEl = (Object.keys(GENERATING_ELEMENT) as NguhHanh[]).find(
    (k) => GENERATING_ELEMENT[k] === selfEl
  )!; // Thực Thương
  const wealthEl = (Object.keys(GENERATING_ELEMENT) as NguhHanh[]).find(
    (k) => GENERATING_ELEMENT[k] === outputEl
  )!; // Tài Tinh
  const officerEl = GENERATING_ELEMENT[resourceEl]; // Quan Sát

  const dongDang = finalScores[selfEl] + finalScores[resourceEl];
  const diDang = finalScores[outputEl] + finalScores[wealthEl] + finalScores[officerEl];

  let strengthVerdict: "Thân Cường" | "Hơi Vượng" | "Gần Như Cân Bằng" | "Hơi Nhược" | "Thân Nhược" = "Gần Như Cân Bằng";
  let strengthExplanation = "";

  const diff = diDang - dongDang;
  if (diff >= 150) {
    strengthVerdict = "Thân Nhược";
    strengthExplanation = `Dị Đảng (${diDang.toFixed(1)}đ) áp đảo hoàn toàn Đồng Đảng (${dongDang.toFixed(1)}đ), chênh lệch ${diff.toFixed(1)}đ (≥150đ) -> Bản mệnh thuộc Thân Nhược.`;
  } else if (diff >= 50) {
    strengthVerdict = "Hơi Nhược";
    strengthExplanation = `Dị Đảng (${diDang.toFixed(1)}đ) lớn hơn Đồng Đảng (${dongDang.toFixed(1)}đ), chênh lệch ${diff.toFixed(1)}đ -> Bản mệnh hơi thiên về Thân Nhược.`;
  } else if (dongDang - diDang >= 150) {
    strengthVerdict = "Thân Cường";
    strengthExplanation = `Đồng Đảng (${dongDang.toFixed(1)}đ) áp đảo hoàn toàn Dị Đảng (${diDang.toFixed(1)}đ), chênh lệch ${(dongDang - diDang).toFixed(1)}đ (≥150đ) -> Bản mệnh thuộc Thân Cường (Thân Vượng).`;
  } else if (dongDang - diDang >= 50) {
    strengthVerdict = "Hơi Vượng";
    strengthExplanation = `Đồng Đảng (${dongDang.toFixed(1)}đ) lớn hơn Dị Đảng (${diDang.toFixed(1)}đ), chênh lệch ${(dongDang - diDang).toFixed(1)}đ -> Bản mệnh hơi thiên về Thân Vượng.`;
  } else {
    strengthVerdict = "Gần Như Cân Bằng";
    strengthExplanation = `Đồng Đảng (${dongDang.toFixed(1)}đ) và Dị Đảng (${diDang.toFixed(1)}đ) tương đương nhau (chênh lệch <50đ) -> Ngũ hành tứ trụ tương đối quân bình.`;
  }

  // 5. Ngũ Hành Hỷ Kỵ & Thập Thần Tô Dân Phong
  const hyKyBreakdown = (["Mộc", "Hỏa", "Thổ", "Kim", "Thủy"] as NguhHanh[]).map((el) => {
    let tenGodCategory: "Tỷ Kiếp" | "Thực Thương" | "Tài Tinh" | "Quan Sát" | "Ấn Tinh" = "Tỷ Kiếp";
    let tenGodRole = "";

    if (el === selfEl) {
      tenGodCategory = "Tỷ Kiếp";
      tenGodRole = "Đại diện cho bản thân, anh chị em, bạn bè, đồng nghiệp đồng trang lứa";
    } else if (el === outputEl) {
      tenGodCategory = "Thực Thương";
      tenGodRole = "Đại diện cho tư tưởng, tài năng nghệ thuật, đầu tư sáng tạo, thuộc hạ cấp dưới, con cái, vãn bối";
    } else if (el === wealthEl) {
      tenGodCategory = "Tài Tinh";
      tenGodRole = "Đại diện cho cha, tiền tài, tích lũy bất động sản, năng lực kiểm soát kinh tế, vợ (đối với nam)";
    } else if (el === officerEl) {
      tenGodCategory = "Quan Sát";
      tenGodRole = "Đại diện cho công việc, sếp trực tiếp, chức vụ, địa vị, quyền lực kỷ luật, chồng (đối với nữ)";
    } else {
      tenGodCategory = "Ấn Tinh";
      tenGodRole = "Đại diện cho mẹ, quý nhân nâng đỡ, trưởng bối, học vấn danh tiếng, văn bằng, nơi nương tựa";
    }

    let isFavorable = false;
    let favorableLevel: "Dụng Thần (Đại Cát)" | "Hỷ Thần (Cát)" | "Bình Hòa" | "Kỵ Thần (Hung)" = "Bình Hòa";
    let description = "";

    if (mingType === "Hàn Mệnh") {
      if (el === "Hỏa") {
        isFavorable = true;
        favorableLevel = "Dụng Thần (Đại Cát)";
        description = "Là Dụng thần số 1 làm ấm mệnh cục lạnh buốt, kích phát nhiệt huyết, vận may bùng nổ, đặc biệt có trợ giúp cho bản thân trong cuộc sống.";
      } else if (el === "Mộc") {
        isFavorable = true;
        favorableLevel = "Hỷ Thần (Cát)";
        description = "Là Hỷ thần sinh trợ cho Hỏa khí, giúp phát triển cơ hội và mở rộng tương lai.";
      } else if (el === "Thủy" || el === "Kim") {
        isFavorable = false;
        favorableLevel = "Kỵ Thần (Hung)";
        description = "Là Kỵ thần làm gia tăng hàn khí lạnh lẽo, gây bế tắc, tiểu nhân cản trở, không có nhiều trợ giúp.";
      } else {
        isFavorable = false;
        favorableLevel = "Bình Hòa";
        description = "Ngũ hành trung hòa, bình thường, có tốt có không tốt tùy thuộc vào lưu niên.";
      }
    } else if (mingType === "Nhiệt Mệnh") {
      if (el === "Thủy") {
        isFavorable = true;
        favorableLevel = "Dụng Thần (Đại Cát)";
        description = "Là Dụng thần số 1 làm dịu mát khí nóng gay gắt, đem lại tài lộc, bình hòa tâm tính, đặc biệt có trợ giúp cho bản thân trong cuộc sống.";
      } else if (el === "Kim") {
        isFavorable = true;
        favorableLevel = "Hỷ Thần (Cát)";
        description = "Là Hỷ thần sinh nguồn cho Thủy, đem lại công danh, quyền lực, chức vụ hanh thông.";
      } else if (el === "Hỏa" || el === "Mộc") {
        isFavorable = false;
        favorableLevel = "Kỵ Thần (Hung)";
        description = "Là Kỵ thần thiêu đốt hao tán nguyên khí, gây nóng vội, thị phi thất thoát, không nên tăng cường.";
      } else {
        isFavorable = false;
        favorableLevel = "Bình Hòa";
        description = "Ngũ hành trung hòa, bình thường, có tốt có không tốt tùy thuộc vào lưu niên.";
      }
    } else if (mingType === "Xuân Bình Mệnh") {
      if (el === "Kim" || el === "Thủy") {
        isFavorable = true;
        favorableLevel = "Hỷ Thần (Cát)";
        description = "Khí tiết mùa xuân dần ấm, chuộng Kim Thủy trợ vận giúp đầu óc minh mẫn, tiến bộ thuận lợi.";
      } else {
        isFavorable = false;
        favorableLevel = "Bình Hòa";
        description = "Ngũ hành tương đối bình hòa, linh hoạt tiến thoái.";
      }
    } else {
      if (el === "Mộc" || el === "Hỏa") {
        isFavorable = true;
        favorableLevel = "Hỷ Thần (Cát)";
        description = "Khí tiết mùa thu se lạnh, thêm chút Mộc Hỏa để sinh khí rạng rỡ, làm ăn vượng phát.";
      } else {
        isFavorable = false;
        favorableLevel = "Bình Hòa";
        description = "Khí tiết bốn mùa bình hòa, an ổn điều hòa.";
      }
    }

    return {
      element: el,
      tenGodCategory,
      tenGodRole,
      isFavorable,
      favorableLevel,
      description,
    };
  });

  // 6. Cảnh Báo Sức Khỏe Tạng Phủ theo Ngũ Hành (Ngưỡng Quá Vượng >= 130 hoặc Suy Kiệt < 29)
  const organVulnerabilities = (["Mộc", "Hỏa", "Thổ", "Kim", "Thủy"] as NguhHanh[]).map((el) => {
    const sc = finalScores[el];
    let status: "Bình Thường" | "Nguy cơ cao (Quá Vượng)" | "Nguy cơ cao (Suy Nhược)" = "Bình Thường";
    let warning = "Ngũ hành phân bố ở mức cân bằng ổn định, tạng phủ bình thường.";

    if (isPresentInStemsOrMainQi(el) || sc > 0) {
      if (sc >= 130) {
        status = "Nguy cơ cao (Quá Vượng)";
        warning = `Điểm số đạt ${sc.toFixed(1)}đ (≥130đ) quá vượng gây uất khí tích tụ, bệnh liên quan tới ${el} rất dễ bị tổn thương!`;
      } else if (sc < 29) {
        status = "Nguy cơ cao (Suy Nhược)";
        warning = `Điểm số chỉ đạt ${sc.toFixed(1)}đ (<29đ) quá suy kiệt bất túc, khí huyết nuôi dưỡng kém, dễ sinh mệt mỏi bệnh tật liên quan tới ${el}.`;
      }
    }

    return {
      element: el,
      score: sc,
      status,
      affectedOrgans: ELEMENT_ORGANS[el],
      warning,
    };
  });

  return {
    scores: finalScores,
    totalScore,
    dongDang,
    diDang,
    strengthVerdict,
    strengthExplanation,
    hyKyBreakdown,
    organVulnerabilities,
  };
}

// ==========================================
// 7. THUẬT TOÁN TÍNH VÒNG ĐẠI VẬN 10 NĂM
// ==========================================

export function generateDaiVanList(
  yearCan: string,
  monthCan: string,
  monthChi: string,
  gender: "Nam" | "Nữ",
  tuoiVaoVanApprox: number,
  birthYear: number,
  mingType: "Hàn Mệnh" | "Nhiệt Mệnh" | "Xuân Bình Mệnh" | "Thu Bình Mệnh"
): DaiVanInfo[] {
  const isYearYang = CAN_META[yearCan]?.yinYang === "Dương";
  // Nam Dương / Nữ Âm -> Thuận hành (+1)
  // Nam Âm / Nữ Dương -> Nghịch hành (-1)
  const isForward = (gender === "Nam" && isYearYang) || (gender === "Nữ" && !isYearYang);
  const directionStep = isForward ? 1 : -1;

  const monthCanIdx = CAN_NAMES.indexOf(monthCan);
  const monthChiIdx = CHI_NAMES.indexOf(monthChi);

  const list: DaiVanInfo[] = [];
  const startAgeInt = Math.max(0, Math.round(tuoiVaoVanApprox));

  for (let i = 1; i <= 8; i++) {
    const curCanIdx = (((monthCanIdx + i * directionStep) % 10) + 10) % 10;
    const curChiIdx = (((monthChiIdx + i * directionStep) % 12) + 12) % 12;

    const curCan = CAN_NAMES[curCanIdx];
    const curChi = CHI_NAMES[curChiIdx];
    const curChiMeta = CHI_META[curChi];
    const curCanMeta = CAN_META[curCan];

    const startAge = startAgeInt + (i - 1) * 10;
    const endAge = startAge + 9;
    const startYear = birthYear + startAge;
    const endYear = startYear + 9;

    // Xét đại vận thuộc Mộc Hỏa hay Kim Thủy
    const isWoodFire =
      curChiMeta.element === "Mộc" ||
      curChiMeta.element === "Hỏa" ||
      curCanMeta.element === "Mộc" ||
      curCanMeta.element === "Hỏa";

    const isMetalWater =
      curChiMeta.element === "Kim" ||
      curChiMeta.element === "Thủy" ||
      curCanMeta.element === "Kim" ||
      curCanMeta.element === "Thủy";

    let isFavorable = false;
    let fortuneLevel: "Đại Cát" | "Cát" | "Bình Hòa" | "Tiểu Hung" | "Hung" = "Bình Hòa";
    let actionAdvice = "";
    let details = "";

    if (mingType === "Hàn Mệnh") {
      if (isWoodFire) {
        isFavorable = true;
        fortuneLevel = curChiMeta.element === "Hỏa" ? "Đại Cát" : "Cát";
        actionAdvice = "Thuận phong tắc dũng: Thời cơ vàng để bứt phá, mở rộng quy mô, mạnh dạn đầu tư!";
        details = `Đại vận ${curCan} ${curChi} mang khí Mộc Hỏa sưởi ấm cục diện, giải tỏa khí lạnh buốt giá. Tài lộc thăng hoa, quý nhân dồi dào, sự nghiệp thăng tiến như diều gặp gió.`;
      } else if (isMetalWater) {
        isFavorable = false;
        fortuneLevel = curChiMeta.element === "Thủy" ? "Hung" : "Tiểu Hung";
        actionAdvice = "Nghịch phong tắc thủ: Tuyệt đối không vay nợ đầu tư mạo hiểm, dĩ tĩnh chế động.";
        details = `Đại vận ${curCan} ${curChi} mang khí Kim Thủy làm tăng thêm hàn khí. Vận trình gặp trở lực, tiền bạc dễ thất thoát, nên tập trung học tập, giữ vững vốn liếng và dưỡng sinh.`;
      } else {
        fortuneLevel = "Bình Hòa";
        actionAdvice = "Cân bằng tích lũy, từng bước tiến hành, giữ vững kỷ luật.";
        details = `Đại vận ${curCan} ${curChi} hành Thổ trung hòa, không có biến động đột biến, duy trì sự ổn định.`;
      }
    } else if (mingType === "Nhiệt Mệnh") {
      if (isMetalWater) {
        isFavorable = true;
        fortuneLevel = curChiMeta.element === "Thủy" ? "Đại Cát" : "Cát";
        actionAdvice = "Thuận phong tắc dũng: Nắm bắt thiên thời, mạnh dạn khởi sự và chớp lấy cơ hội lớn!";
        details = `Đại vận ${curCan} ${curChi} mang khí Kim Thủy tươi mát tư nhuận mệnh cục đang oi ả. Tài vận hanh thông rực rỡ, tư duy sáng suốt, công danh và tiền bạc đều viên mãn.`;
      } else if (isWoodFire) {
        isFavorable = false;
        fortuneLevel = curChiMeta.element === "Hỏa" ? "Hung" : "Tiểu Hung";
        actionAdvice = "Nghịch phong tắc thủ: Thu liễm phòng thủ, tránh nôn nóng bung sức kẻo kiệt quệ.";
        details = `Đại vận ${curCan} ${curChi} gia tăng hỏa khí thiêu đốt, áp lực công việc và cảm xúc tăng cao. Cần kiềm chế cảm xúc, cẩn trọng giấy tờ pháp lý và chăm lo sức khỏe tim mạch.`;
      } else {
        fortuneLevel = "Bình Hòa";
        actionAdvice = "Phát triển ổn định, tích lũy nội lực.";
        details = `Đại vận ${curCan} ${curChi} mang khí Thổ bình ổn, vận thế đều đặn.`;
      }
    } else if (mingType === "Xuân Bình Mệnh") {
      // Xuân Bình Mệnh (Mộc vượng sinh xuân) -> Hỷ Kim Thủy tỉa bớt mộc vượng
      isFavorable = isMetalWater;
      fortuneLevel = isMetalWater ? (curChiMeta.element === "Thủy" ? "Đại Cát" : "Cát") : "Bình Hòa";
      actionAdvice = isMetalWater
        ? "Thuận phong tắc dũng: Kim Thủy trợ lực điều hòa khí xuân, thời cơ phát triển tốt."
        : "Vận thế bình hòa, linh hoạt thích ứng theo từng năm để tối ưu tài lộc.";
      details = `Đại vận ${curCan} ${curChi} đối với người Xuân Bình Mệnh ${isMetalWater ? "được Kim Thủy hỗ trợ rất tốt" : "duy trì nhịp độ ổn định"}.`;
    } else {
      // Thu Bình Mệnh (Kim vượng sinh thu) -> Hỷ Mộc Hỏa, nhưng "Yếu Hỏa bất kỵ Thủy"
      isFavorable = isWoodFire;
      fortuneLevel = isWoodFire ? (curChiMeta.element === "Hỏa" ? "Đại Cát" : "Cát") : "Bình Hòa";
      actionAdvice = isWoodFire
        ? "Thuận phong tắc dũng: Mộc Hỏa ấm áp sưởi ấm tôi luyện kim khí, tài lộc vượng phát."
        : "Vận thế bình hòa an nhàn: 'Yếu Hỏa bất kỵ Thủy' — Kim Thủy không gây nguy hại, tích lũy vững chắc, an cư lạc nghiệp.";
      details = `Đại vận ${curCan} ${curChi} đối với người Thu Bình Mệnh ${isWoodFire ? "được Mộc Hỏa bổ trợ khai quang phát tài" : "thuộc vận bình ổn an nhàn (Yếu Hỏa bất kỵ Thủy), không bao giờ sợ suy vận hay đại bại"}.`;
    }

    list.push({
      step: i,
      startAge,
      endAge,
      startYear,
      endYear,
      can: curCan,
      chi: curChi,
      chinese: `${CAN_CHINESE[curCanIdx]}${CHI_CHINESE[curChiIdx]}`,
      element: curChiMeta.element,
      napAm: `${curCan} ${curChi}`,
      tenGod: getTenGod(curCan, curChi), // Tham chiếu
      isFavorable,
      fortuneLevel,
      actionAdvice,
      details,
    });
  }

  return list;
}

// ==========================================
// 7. LUẬN ĐOÁN 6 TRỤC SỰ VỤ THEO 80 BÀI GIẢNG
// ==========================================

export function analyzeSixLifePillars(
  dayCan: string,
  dayChi: string,
  monthChi: string,
  yearChi: string,
  hourChi: string,
  pillars: { can: string; chi: string }[],
  mingType: "Hàn Mệnh" | "Nhiệt Mệnh" | "Xuân Bình Mệnh" | "Thu Bình Mệnh",
  dayMasterStrength: { strengthScore: number; deLenh: boolean; careerSuitability: string },
  gender: "Nam" | "Nữ",
  targetYear: number
) {
  // ----------------------------------------------------
  // TRỤC 1: TÀI VẬN & SỰ NGHIỆP (PHƯƠNG PHÁP TÔ DÂN PHONG)
  // Tô Dân Phong: Không lấy Thân Vượng hay Thân Nhược để phán làm chủ hay làm thuê.
  // Định hướng phong cách công việc dựa vào cấu trúc THẬP THẦN:
  // - Thực Thương, Thiên Tài, Thất Sát: Giàu tinh thần đổi mới, nhạy bén, thích tự do khởi nghiệp làm chủ.
  // - Chính Quan, Chính Ấn, Chính Tài: Thích quy chuẩn, kỷ luật, bền vững, thích hợp chuyên môn / quản lý tập đoàn.
  // - Thành bại kinh doanh: Do Đại Vận Thuận ("Thuận phong tắc dũng") hay Nghịch ("Nghịch phong tắc thủ") quyết định.
  // ----------------------------------------------------
  const tenGodsCount: Record<string, number> = {};
  for (const p of pillars) {
    const tgCan = getTenGod(dayCan, p.can);
    tenGodsCount[tgCan] = (tenGodsCount[tgCan] || 0) + 1;
    const hidden = CHI_HIDDEN_STEMS[p.chi] || [];
    for (const h of hidden) {
      const tgHidden = getTenGod(dayCan, h.stem);
      tenGodsCount[tgHidden] = (tenGodsCount[tgHidden] || 0) + 1;
    }
  }

  const entrepreneurialTendency =
    (tenGodsCount["Thực Thần"] || 0) +
    (tenGodsCount["Thương Quan"] || 0) +
    (tenGodsCount["Thiên Tài"] || 0) +
    (tenGodsCount["Thất Sát"] || 0);

  const corporateTendency =
    (tenGodsCount["Chính Quan"] || 0) +
    (tenGodsCount["Chính Ấn"] || 0) +
    (tenGodsCount["Thiên Ấn"] || 0) +
    (tenGodsCount["Chính Tài"] || 0);

  const roleRecommendation =
    entrepreneurialTendency >= corporateTendency
      ? ("Thích Hợp Tự Làm Chủ / Khởi Nghiệp" as const)
      : ("Thích Hợp Làm Chuyên Môn / Công Chức / Làm Thuê" as const);

  let wealthPattern = "Chính Tài tích lũy bền vững từ công sức chuyên môn";
  if ((tenGodsCount["Thương Quan"] || 0) + (tenGodsCount["Thực Thần"] || 0) >= 3) {
    wealthPattern = "Thực Thương Sinh Tài — Kiếm tiền bằng ý tưởng sáng tạo, khiếu ăn nói và tài buôn bán linh hoạt";
  } else if ((tenGodsCount["Thiên Tài"] || 0) >= 2) {
    wealthPattern = "Thiên Tài phát đạt — Nhạy bén với cơ hội kinh doanh, đầu tư, mua bán nhanh nhạy";
  } else if ((tenGodsCount["Chính Quan"] || 0) + (tenGodsCount["Thất Sát"] || 0) >= 3) {
    wealthPattern = "Quan Sát Hộ Tài — Thu nhập gắn liền với chức quyền, vị trí lãnh đạo và trách nhiệm quản lý";
  }

  const favorableIndustries =
    mingType === "Hàn Mệnh"
      ? ["Ẩm thực, nhà hàng, năng lượng, điện tử (Hỏa)", "Thời trang, giáo dục, mộc, nông lâm nghiệp (Mộc)"]
      : ["Công nghệ, tài chính ngân hàng, kim khí, cơ khí (Kim)", "Thương mại quốc tế, logistics, du lịch, đồ uống (Thủy)"];

  // ----------------------------------------------------
  // TRỤC 2: HÔN NHÂN & TÌNH CẢM
  // ----------------------------------------------------
  const allBranches = pillars.map((p) => p.chi);
  const isSpousePalaceClashed =
    CLASH_PAIRS[dayChi] === monthChi ||
    CLASH_PAIRS[dayChi] === hourChi ||
    CLASH_PAIRS[dayChi] === yearChi;

  let clashDetails = "";
  if (CLASH_PAIRS[dayChi] === monthChi) {
    clashDetails = `Nguyệt Chi (${monthChi}) xung Nhật Chi (${dayChi}) — Vợ/chồng dễ bất hòa với gia đình nội ngoại, tình cảm trước 35 tuổi dễ trắc trở.`;
  } else if (CLASH_PAIRS[dayChi] === hourChi) {
    clashDetails = `Thời Chi (${hourChi}) xung Nhật Chi (${dayChi}) — Vợ/chồng dễ bất đồng quan điểm nuôi dạy con cái hoặc con cái ở xa.`;
  } else if (CLASH_PAIRS[dayChi] === yearChi) {
    clashDetails = `Niên Chi (${yearChi}) xung Nhật Chi (${dayChi}) — Hôn nhân chịu nhiều tác động từ hoàn cảnh gia đình thuở nhỏ.`;
  }

  // Khẩu quyết Tô Dân Phong: Tuất Mùi tương hình
  const hasTuatMuiHinh = allBranches.includes("Tuất") && allBranches.includes("Mùi");
  const tuatMuiHinhAdvice = hasTuatMuiHinh
    ? "Trong Bát Tự phạm Tuất - Mùi tương hình: Khẩu quyết Tô Dân Phong (2010 Bài 06 & 26): 'Tuất Mùi tương hình, trước 30 tuổi quen ai hay lấy ai cũng thấy không hợp tính cách, thường xuyên khắc khẩu mâu thuẫn'. Khuyên nên kết hôn sau 30 tuổi để tâm lý chín chắn, hôn nhân mới êm đẹp."
    : "";

  // Khẩu quyết Tô Dân Phong: Cung Phu Thê tọa Thập Thần
  const spouseMainStem = CHI_HIDDEN_STEMS[dayChi]?.[0]?.stem || "";
  const spouseTenGod = spouseMainStem ? getTenGod(dayCan, spouseMainStem) : "";
  let spouseTenGodAnalysis = "";
  if (spouseTenGod === "Chính Tài" || spouseTenGod === "Thiên Tài") {
    spouseTenGodAnalysis = `Cung Phu Thê tọa ${spouseTenGod}: Người phối ngẫu giỏi giang, có năng lực quản lý tài chính hoặc mang lại nguồn của cải hỗ trợ đắc lực cho gia đình.`;
  } else if (spouseTenGod === "Thất Sát") {
    spouseTenGodAnalysis = `Cung Phu Thê tọa Thất Sát: Bạn đời cá tính mạnh mẽ, cương quyết, có phần nóng nảy hoặc muốn nắm quyền chi phối; hôn nhân cần sự thấu hiểu và lắng nghe.`;
  } else if (spouseTenGod === "Chính Quan") {
    spouseTenGodAnalysis = `Cung Phu Thê tọa Chính Quan: Bạn đời đàng hoàng, có trách nhiệm, coi trọng gia phong danh dự, hôn nhân nền nếp quy chuẩn.`;
  } else if (spouseTenGod === "Chính Ấn" || spouseTenGod === "Thiên Ấn") {
    spouseTenGodAnalysis = `Cung Phu Thê tọa ${spouseTenGod}: Bạn đời dịu dàng, chu đáo chăm lo như người thân trong nhà, là điểm tựa tinh thần vững chãi.`;
  } else if (spouseTenGod === "Thực Thần" || spouseTenGod === "Thương Quan") {
    spouseTenGodAnalysis = `Cung Phu Thê tọa ${spouseTenGod}: Bản thân dành nhiều sự chiều chuộng đối phương, coi trọng tình cảm lãng mạn; bạn đời thông minh nhanh nhẹn, có tài hoa.`;
  } else if (spouseTenGod === "Tỷ Kiên" || spouseTenGod === "Kiếp Tài") {
    spouseTenGodAnalysis = `Cung Phu Thê tọa ${spouseTenGod}: Vợ chồng như bạn hữu đồng trang lứa, cá tính độc lập; cần tôn trọng không gian riêng của nhau.`;
  }

  let palaceStatus = "Cung Phu Thê bình ổn, gắn kết vững vàng.";
  if (isSpousePalaceClashed) {
    palaceStatus =
      "Cung Phu Thê bị tương xung: Trước 45 tuổi tình cảm dễ cảm thấy không hợp tính cách, nên kết hôn muộn hoặc bao dung nhường nhịn.";
  }

  const idealMarriageAgeRange = isSpousePalaceClashed || hasTuatMuiHinh ? "Sau 30 - 35 tuổi (Kết hôn muộn để tránh sóng gió)" : "26 - 32 tuổi";

  // ----------------------------------------------------
  // TRỤC 3: SỨC KHỎE & TẠNG PHỦ BỆNH TẬT
  // ----------------------------------------------------
  const dryEarth = (CHI_META[monthChi]?.isDryEarth ? 1 : 0) + (CHI_META[dayChi]?.isDryEarth ? 1 : 0) + (CHI_META[yearChi]?.isDryEarth ? 1 : 0) + (CHI_META[hourChi]?.isDryEarth ? 1 : 0);
  const wetEarth = (CHI_META[monthChi]?.isWetEarth ? 1 : 0) + (CHI_META[dayChi]?.isWetEarth ? 1 : 0) + (CHI_META[yearChi]?.isWetEarth ? 1 : 0) + (CHI_META[hourChi]?.isWetEarth ? 1 : 0);

  const hasEarthClashOrPenalty =
    hasTuatMuiHinh ||
    (allBranches.includes("Thìn") && allBranches.includes("Tuất")) ||
    (allBranches.includes("Sửu") && allBranches.includes("Mùi"));

  let stomachIntestineRisk: "Cao (Thổ khô Thổ ướt tương xung/hình)" | "Trung bình" | "Thấp" = "Thấp";
  if (hasEarthClashOrPenalty || (dryEarth >= 1 && wetEarth >= 1) || (dryEarth >= 2 && wetEarth >= 1) || (wetEarth >= 2)) {
    stomachIntestineRisk = "Cao (Thổ khô Thổ ướt tương xung/hình)";
  } else if (dryEarth >= 1 || wetEarth >= 1) {
    stomachIntestineRisk = "Trung bình";
  }

  const cardioVascularRisk =
    mingType === "Hàn Mệnh"
      ? "Thủy vượng thiếu Hỏa: Dễ huyết áp thấp, lạnh tay chân, thiếu máu, tim đập chậm, đột quỵ do lạnh mùa đông."
      : "Hỏa vượng thiêu đốt: Dễ huyết áp cao, tim hồi hộp đập nhanh, nóng trong, nguy cơ xơ vữa động mạch mùa hè.";

  const kidneyUterusRisk =
    dayChi === "Sửu" || monthChi === "Sửu" || hourChi === "Sửu"
      ? "Trong Bát Tự có chi Sửu (đại diện Tử Cung & Thận): Chú ý hệ bài tiết, nữ giới cần khám phụ khoa định kỳ, nam giới phòng bệnh thận tiết niệu."
      : "Thận và hệ tiết niệu ở mức ổn định bình thường.";

  const liverEyeRisk =
    CAN_META[dayCan]?.element === "Mộc" && dayMasterStrength.strengthScore < 40
      ? "Mộc suy nhược: Phòng bệnh gan nhiễm mỡ, men gan cao, thị lực kém hoặc mỏi mắt thần kinh."
      : "Gan mật và thị lực ở mức trung bình khá.";

  const surgeryAccidentWarning =
    "Tô Dân Phong nhấn mạnh: Trụ Giờ là cung chân tay hạ bàn và con cái. Những năm Lưu Niên xung Thời Trụ (Trụ Giờ), nếu trong năm đó không sinh con hay cưới hỏi thì rất dễ gặp hạn phẫu thuật mổ xẻ hoặc va quẹt xe cộ đổ máu.";

  // ----------------------------------------------------
  // TRỤC 4: LỤC THÂN & TƯƠNG TÁC 4 CUNG VỊ
  // ----------------------------------------------------
  const fourPillarsInteractions: string[] = [];
  if (CLASH_PAIRS[yearChi] === monthChi) {
    fourPillarsInteractions.push(
      "Niên - Nguyệt Tương Xung: Tự lập sớm từ hai bàn tay trắng, sớm rời xa quê hương để lập nghiệp, quan điểm sống có sự khác biệt lớn với cha mẹ."
    );
  }
  if (CLASH_PAIRS[monthChi] === dayChi) {
    fourPillarsInteractions.push(
      "Nguyệt - Nhật Tương Xung: Vợ/chồng và cha mẹ hai bên có khoảng cách tâm lý, nên ở riêng độc lập để duy trì tình cảm tốt đẹp."
    );
  }
  if (CLASH_PAIRS[dayChi] === hourChi) {
    fourPillarsInteractions.push(
      "Nhật - Thời Tương Xung: Khoảng cách thế hệ với con cái, con cái sau này có xu hướng đi du học hoặc lập nghiệp xa gia đình."
    );
  }
  if (HARMONY_PAIRS[dayChi] === hourChi) {
    fourPillarsInteractions.push(
      "Nhật - Thời Tương Hợp: Con cái hiếu thuận, yêu thương gắn bó, hậu vận được nương nhờ phúc ấm gia đình."
    );
  }
  if (fourPillarsInteractions.length === 0) {
    fourPillarsInteractions.push(
      "Bốn trụ Bát Tự không có hình xung lớn: Gia đạo tuần hoàn ổn định, quan hệ giữa các thế hệ duy trì mức hòa hợp bình thường."
    );
  }

  // ----------------------------------------------------
  // TRỤC 5: LƯU NIÊN VẬN HẠN NĂM ĐƯỢC CHỌN (VD 2027)
  // ----------------------------------------------------
  const targetYearCanIdx = (((targetYear - 4) % 10) + 10) % 10;
  const targetYearChiIdx = (((targetYear - 4) % 12) + 12) % 12;
  const targetCan = CAN_NAMES[targetYearCanIdx];
  const targetChi = CHI_NAMES[targetYearChiIdx];
  const targetCanChi = `${targetCan} ${targetChi}`;

  let taiSuiRelation = "Bình Hòa với Thái Tuế";
  if (targetChi === yearChi) {
    taiSuiRelation = "Trực Thái Tuế (Năm Tuổi / Bản Mệnh)";
  } else if (CLASH_PAIRS[targetChi] === yearChi) {
    taiSuiRelation = "Xung Thái Tuế (Đại dịch chuyển, trong động sinh tài)";
  } else if (
    (targetChi === "Sửu" && yearChi === "Tuất") ||
    (targetChi === "Mùi" && yearChi === "Sửu") ||
    (targetChi === "Tuất" && yearChi === "Mùi") ||
    (targetChi === "Dần" && yearChi === "Tỵ") ||
    (targetChi === "Thân" && yearChi === "Dần")
  ) {
    taiSuiRelation = "Hình Thái Tuế (Thị phi, hợp đồng rà soát kỹ)";
  }

  const tgCurrentYear = getTenGod(dayCan, targetCan);

  return {
    careerAndWealth: {
      title: "Tài Vận & Định Hướng Sự Nghiệp",
      badge: roleRecommendation.includes("Làm Chủ") ? "Tự Lập Nghiệp" : "Chuyên Môn / Công Chức",
      roleRecommendation,
      investmentStrategy:
        mingType === "Hàn Mệnh"
          ? "Gặp vận Mộc Hỏa: Mạnh dạn tiến công, mở rộng kinh doanh. Gặp vận Kim Thủy: Thủ tĩnh, không vay nợ."
          : "Gặp vận Kim Thủy: Tận dụng thời cơ vàng đầu tư. Gặp vận Mộc Hỏa: Thu liễm, giữ chắc tiền mặt.",
      wealthPattern,
      favorableIndustries,
      details: [
        `Mệnh cách có cấu trúc ${wealthPattern}.`,
        dayMasterStrength.careerSuitability,
        `Tô Dân Phong khuyên: Trong các năm/vận thuận lợi, hãy dũng cảm nắm bắt dự án mới; khi vào nghịch vận, ưu tiên đi làm công ăn lương và nâng cao trình độ.`,
      ],
      peterSoPhilosophy:
        "Tô Dân Phong (Master Class 2009 Bài 01): Sinh ý mệnh (làm chủ) bắt buộc phải có Thực Thương hoặc Thiên Tài — vì Thực Thương đại diện cho tư duy đột phá, khách hàng và đặc biệt là năng lực thu phục nhân tâm cấp dưới, nhân viên và học trò. Người không có Thực Thương mà cố làm chủ thì cấp dưới không phục, khó giữ người. Ngược lại, Đả công mệnh (làm thuê) bắt buộc có Ấn Tinh — Ấn là sếp lớn, cấp trên, công ty danh tiếng che chở; có Ấn thì làm thuê được quý nhân nâng đỡ, công danh thăng tiến thuận buồm xuôi gió.",
    },

    marriageAndLove: {
      title: "Hôn Nhân, Tình Duyên & Tuổi Kết Hôn",
      badge: isSpousePalaceClashed || hasTuatMuiHinh ? "Cung Phu Thê Có Xung/Hình" : "Cung Phu Thê Bình Hòa",
      palaceStatus,
      isSpousePalaceClashed,
      clashDetails,
      idealMarriageAgeRange,
      marriageTimingRule:
        "Tô Dân Phong chỉ dạy (Master Class 2009 Bài 01 & 2010 Bài 26): Khi Đại Vận xung Cung Phu Thê (10 năm Vận Ly Dị), nếu kết hôn ở 7 năm đầu vận thì nguy cơ chia tay rất cao; nếu muốn kết hôn thì phải chọn 3 NĂM CUỐI VẬN mới vượt qua hạn sóng gió và hôn nhân bền chặt trọn đời.",
      loveFortuneYearAdvice:
        "Năm Xung Thái Tuế hoặc năm Đào Hoa là thời điểm tuyệt vời nhất để tổ chức hôn lễ hoặc chào đón thành viên mới trong gia đình.",
      details: [
        palaceStatus,
        clashDetails || "Không có xung khắc trực tiếp vào Cung Phu Thê.",
        tuatMuiHinhAdvice,
        spouseTenGodAnalysis,
        `Độ tuổi kết hôn lý tưởng nhất: ${idealMarriageAgeRange}.`,
      ].filter(Boolean),
      divorceLuckAdvice: "Giai đoạn chuyển vận hoặc năm xung khắc Phu thê cung: Không nên quyết định vội vàng khi xảy ra tranh cãi, nên hoãn binh vượt qua năm hạn.",
      daoHoaPhoiNgau: pillars.some(p => ["Tý", "Ngọ", "Mão", "Dậu"].includes(p.chi))
        ? "Mệnh vượng đào hoa, người khác giới dễ mến mộ, bạn đời có sức hút hoặc giao thiệp rộng."
        : "Đào hoa nội liễm, tình cảm chú trọng sự chung thủy và gắn kết lâu dài.",
      daoHoaStars: ["Hồng Loan", "Thiên Hỷ", "Hàm Trì"].filter((_, i) => (targetYear + i) % 2 === 0),
      tuatMuiHinhAdvice,
      spouseTenGodAnalysis,
    },

    healthAndOrgans: {
      title: "Sức Khỏe & Tạng Phủ Ngũ Hành",
      badge: stomachIntestineRisk.includes("Cao") ? "Lưu Ý Dạ Dày" : "Khí Huyết Cần Điều Hòa",
      stomachIntestineRisk,
      cardioVascularRisk,
      kidneyUterusRisk,
      liverEyeRisk,
      surgeryAccidentWarning,
      preventionDetails: [
        `Hệ tiêu hóa: ${stomachIntestineRisk}. Tô Dân Phong giảng (Master Class 2009 Bài 08 & 2010 Bài 04): Hơn 90% người có Thổ khô (Mùi, Tuất) hình/xung Thổ ướt (Sửu, Thìn) bị viêm loét dạ dày, trào ngược axit thực quản hoặc bệnh ngoài da. Cần hạn chế ăn uống thất thường, kiêng đồ cay nóng/quá lạnh.`,
        `Hệ tuần hoàn: ${cardioVascularRisk}`,
        `Hệ bài tiết: ${kidneyUterusRisk}`,
        `Cảnh báo ngoại khoa: ${surgeryAccidentWarning}`,
      ],
      organDetailsByElement: calculateOrganHealthDetails(pillars),
    },

    familySixRelatives: {
      title: "Lục Thân & Tương Tác 4 Trụ Gia Đạo",
      badge: fourPillarsInteractions.length > 1 ? "Độc Lập Sớm" : "Gia Đạo Thuận Hòa",
      ancestorConnection: "Trụ Năm (1-15 tuổi): Đại diện nền tảng ông bà, phúc ấm gia tộc thời thơ ấu.",
      parentsSiblingsConnection: "Trụ Tháng (16-30 tuổi): Đại diện mối quan hệ với phụ mẫu và anh chị em ruột thịt.",
      selfAndSpouseConnection: "Trụ Ngày (31-45 tuổi): Bản thân và người bạn đời cùng chung sống dưới một mái nhà.",
      childrenPosterityConnection: "Trụ Giờ (sau 45 tuổi): Tương lai của con cái và phong cách sống những năm tháng hậu vận.",
      fourPillarsInteractions,
    },

    currentYearForecast: {
      title: `Vận Hạn Lưu Niên Năm ${targetYear} (${targetCanChi})`,
      yearCanChi: targetCanChi,
      taiSuiRelation,
      tenGodOfCurrentYear: `Năm ${targetCanChi} xuất hiện sao ${tgCurrentYear} đối với Bản Mệnh.`,
      wealthCurrentYear:
        mingType === "Hàn Mệnh" && (targetCan === "Bính" || targetCan === "Đinh" || targetChi === "Ngọ" || targetChi === "Tỵ" || targetChi === "Mùi")
          ? "Năm Hỏa Thổ mang lại tài khí vượng phát cho người Hàn Mệnh, có cơ hội gia tăng thu nhập rõ rệt."
          : "Tài chính duy trì ổn định, nên chi tiêu có kế hoạch và tích lũy an toàn.",
      careerCurrentYear: `Sao ${tgCurrentYear} chiếu mệnh, thúc đẩy các công việc liên quan đến hợp đồng, đàm phán và quan hệ đối tác.`,
      loveCurrentYear:
        taiSuiRelation.includes("Xung") || taiSuiRelation.includes("Trực")
          ? "Năm Thái Tuế biến động, rất dễ có bước ngoặt tình cảm (kết hôn, có con, chuyển nhà mới)."
          : "Tình cảm êm đềm, duy trì sự gắn bó sẻ chia thường nhật.",
      healthCurrentYear: "Chú ý dưỡng sinh theo mùa, ngủ đủ giấc và tăng cường vận động nhẹ nhàng.",
      masterRemedySecret:
        "Bí quyết Tô Dân Phong: 'Nhất Hỷ Chắn Tam Tai, Vô Hỷ Thị Phi Lai'. Nếu năm nay gia đình có hỷ sự (cưới hỏi, sinh con, mua nhà) thì mọi hung họa đều tự nhiên hóa giải thành điềm lành đại cát!",
    },

    fengshuiRemedy: {
      title: "Pháp Môn Phong Thủy Cải Vận Độc Môn Tô Dân Phong",
      livingDirections:
        mingType === "Hàn Mệnh"
          ? "Nên định cư hoặc phát triển sự nghiệp ở phương Nam (TP.HCM, phương Nam ấm áp) hoặc phương Đông."
          : "Nên định cư hoặc lập nghiệp ở phương Bắc (Hà Nội, phương Bắc mát mẻ) hoặc phương Tây.",
      bedHeadDirection:
        mingType === "Hàn Mệnh"
          ? "Đầu giường ngủ quay về hướng Nam hoặc Đông Nam để hấp thu sinh khí ấm áp."
          : "Đầu giường ngủ quay về hướng Bắc hoặc Tây Bắc để thanh lọc tâm trí và đón nhận thủy khí mát lành.",
      wardrobeColors:
        mingType === "Hàn Mệnh"
          ? "Ưu tiên trang phục, xe cộ, nội thất màu đỏ, cam, hồng, tím và xanh lá cây."
          : "Ưu tiên trang phục, xe cộ, nội thất màu đen, xanh lam, trắng, xám tro và ánh kim.",
      homeRemedy:
        "Theo Cửu Cung Phi Tinh hàng năm: Tránh khu vực sao Ngũ Hoàng Sát và Nhị Hắc Bệnh Phù (treo chuông gió kim loại hoặc hồ lô đồng để hóa sát).",
      dongThoRemedy:
        "Nếu trước cửa nhà có công trình đào đường phá đất: Ứng dụng 'Ngũ Hành Hóa Động Thổ Cục' bằng chuỗi 5 vật tương sinh đảo nghịch để bảo vệ bình an gia đạo.",
    },
  };
}

// ==========================================
// 7. ĐỘC MÔN TÔ DÂN PHONG: CHẤM ĐIỂM BÁT TỰ QUÝ CÁCH & QUY ĐỔI PHÚ QUÝ (0 – 7+ ĐIỂM)
// ==========================================

export const THIEN_AT_QUY_NHAN: Record<string, string[]> = {
  "Giáp": ["Sửu", "Mùi"],
  "Mậu": ["Sửu", "Mùi"],
  "Canh": ["Sửu", "Mùi"],
  "Ất": ["Tý", "Thân"],
  "Kỷ": ["Tý", "Thân"],
  "Bính": ["Hợi", "Dậu"],
  "Đinh": ["Hợi", "Dậu"],
  "Nhâm": ["Mão", "Tỵ"],
  "Quý": ["Mão", "Tỵ"],
  "Tân": ["Ngọ", "Dần"],
};

export const LOC_THAN: Record<string, string> = {
  "Giáp": "Dần",
  "Ất": "Mão",
  "Bính": "Tỵ",
  "Đinh": "Ngọ",
  "Mậu": "Tỵ",
  "Kỷ": "Ngọ",
  "Canh": "Thân",
  "Tân": "Dậu",
  "Nhâm": "Hợi",
  "Quý": "Tý",
};

export function calculatePeterSoNobleScore(
  dayCan: string,
  monthChi: string,
  rawPillars: { can: string; chi: string }[],
  mingType: "Hàn Mệnh" | "Nhiệt Mệnh" | "Xuân Bình Mệnh" | "Thu Bình Mệnh",
  dayStrength: { strength: string; strengthScore: number; deLenh: boolean; deDia: boolean; deThe: boolean },
  daiVanList: DaiVanInfo[]
): NobleScoreDetail {
  const yearCan = rawPillars[0].can;
  const monthCan = rawPillars[1].can;
  const hourCan = rawPillars[3].can;
  const allStems = [yearCan, monthCan, rawPillars[2].can, hourCan];
  const allBranches = [rawPillars[0].chi, rawPillars[1].chi, rawPillars[2].chi, rawPillars[3].chi];
  const dayChi = rawPillars[2].chi;

  const stemTenGods = [
    getTenGod(dayCan, yearCan),
    getTenGod(dayCan, monthCan),
    getTenGod(dayCan, hourCan),
  ];

  // 1. Cách Cục (格局 - Tối đa 1.0đ)
  let s1 = 0.5;
  let s1Status: NobleScoreCriteriaItem["status"] = "Đạt yêu cầu";
  let s1Exp = "";

  const hasChinhQuan = stemTenGods.includes("Chính Quan");
  const hasThatSat = stemTenGods.includes("Thất Sát");
  const hasChinhTai = stemTenGods.includes("Chính Tài");
  const hasThienTai = stemTenGods.includes("Thiên Tài");
  const hasKiepTai = stemTenGods.includes("Kiếp Tài");
  const hasThucThan = stemTenGods.includes("Thực Thần");
  const hasThuongQuan = stemTenGods.includes("Thương Quan");
  const hasChinhAn = stemTenGods.includes("Chính Ấn");

  const isQuanSatMixed = hasChinhQuan && hasThatSat;
  const isKiepDoatTai = hasKiepTai && (hasChinhTai || hasThienTai);

  if (isQuanSatMixed && isKiepDoatTai) {
    s1 = 0.25;
    s1Status = "Chưa đạt / Phá cách";
    s1Exp = "Thiên can phạm Quan Sát hỗn tạp kèm Kiếp Tài đoạt Tài, cách cục bị tranh khắc phá cách, cần Đại Vận giải cứu.";
  } else if (isQuanSatMixed) {
    s1 = 0.5;
    s1Status = "Trung bình / Có tỳ vết";
    s1Exp = "Thiên can thấu cả Chính Quan lẫn Thất Sát (Quan Sát hỗn tạp), quý khí bị giảm trừ, làm việc dễ lao tâm khổ tứ.";
  } else if (isKiepDoatTai) {
    s1 = 0.5;
    s1Status = "Trung bình / Có tỳ vết";
    s1Exp = "Tài Tinh thấu can nhưng gặp Kiếp Tài đồng trụ hoặc kề sát đoạt tài, tiền tài tích lũy dễ bị phân tán.";
  } else if (hasChinhQuan && (hasChinhAn || dayStrength.strengthScore >= 45)) {
    s1 = 1.0;
    s1Status = "Đạt chuẩn xuất sắc";
    s1Exp = "Chính Quan đắc địa phối hợp Ấn Thụ/Thân vượng, thành 'Chính Quan Phối Ấn Cách' tôn quý hiển hách.";
  } else if (hasThatSat && (hasThucThan || hasChinhAn)) {
    s1 = 1.0;
    s1Status = "Đạt chuẩn xuất sắc";
    s1Exp = "Thất Sát thấu can nhưng có Thực Thần chế phục hoặc Ấn thụ hóa Sát sinh thân ('Sát Ấn tương sinh'), quyền uy tột bậc.";
  } else if ((hasChinhTai || hasThienTai) && (hasThucThan || hasThuongQuan)) {
    s1 = 1.0;
    s1Status = "Đạt chuẩn xuất sắc";
    s1Exp = "Thực Thương sinh Tài hữu lực, dòng tiền lưu thông không dứt, là cách cục của bậc đại thương nhân giàu có.";
  } else if (hasThuongQuan && hasChinhAn) {
    s1 = 1.0;
    s1Status = "Đạt chuẩn xuất sắc";
    s1Exp = "Thương Quan phối Ấn, tài trí xuất chúng phi phàm, danh thơm lan tỏa bốn phương.";
  } else if (dayStrength.strength === "Thân Cực Nhược") {
    s1 = 0.75;
    s1Status = "Đạt yêu cầu";
    s1Exp = "Thân cực nhược có khả năng Tòng Thế Cách (Tòng Sát hoặc Tòng Tài), thuận theo ngũ hành vượng nhất để phát phúc.";
  } else {
    s1 = 0.75;
    s1Status = "Đạt yêu cầu";
    s1Exp = "Bát tự cấu trúc ổn định, không phạm đại kỵ phá cách, ngũ hành tương đối bình hòa cát lợi.";
  }

  // 2. Điều Hậu & Hữu Lực (調候有力 - Tối đa 1.5 - 2.0đ, Peter So: 'Hữu lực hựu điều hậu, song trọng phân!')
  let s2 = 0.5;
  let s2Status: NobleScoreCriteriaItem["status"] = "Đạt yêu cầu";
  let s2Exp = "";

  if (mingType === "Hàn Mệnh") {
    const fireCan = allStems.filter((c) => c === "Bính" || c === "Đinh").length;
    const fireBranches = allBranches.filter((b) => b === "Tỵ" || b === "Ngọ" || b === "Dần");
    // Kiểm tra gốc Hỏa có bị tương xung trực diện (Tý xung Ngọ, Hợi xung Tỵ, Thân xung Dần)
    const uninjuredFireBranches = fireBranches.filter((b) => !allBranches.includes(CLASH_PAIRS[b] || ""));

    if (fireCan >= 1 && uninjuredFireBranches.length >= 1) {
      s2 = 1.75;
      s2Status = "Đạt chuẩn xuất sắc";
      s2Exp = `Hàn Mệnh sinh đông đắc cả Can Hỏa (${fireCan} can Bính/Đinh) và Chi Hỏa (${uninjuredFireBranches.join(", ")}) nguyên vẹn không bị xung phá. Đúng lời Tô Dân Phong: 'Hữu lực hựu điều hậu, song trọng phân!', ấm áp phát phúc.`;
    } else if (fireCan >= 1 && fireBranches.length >= 1) {
      s2 = 1.0;
      s2Status = "Đạt yêu cầu";
      s2Exp = `Hàn Mệnh có Hỏa thấu Thiên Can sưởi ấm, nhưng gốc rễ địa chi (${fireBranches.join(", ")}) bị hình xung làm giảm bớt lực sưởi ấm.`;
    } else if (fireCan >= 1) {
      s2 = 0.75;
      s2Status = "Đạt yêu cầu";
      s2Exp = "Hàn Mệnh có Hỏa thấu Thiên Can chiếu rọi, nhưng địa chi thiếu gốc rễ vững vàng (hư hỏa), cần Đại Vận tiếp ứng.";
    } else if (uninjuredFireBranches.length >= 1) {
      s2 = 0.75;
      s2Status = "Đạt yêu cầu";
      s2Exp = `Hàn Mệnh có Hỏa tàng ẩn dưới Địa Chi (${uninjuredFireBranches.join(", ")}) giữ ấm lòng đất, mầm mống tốt nhưng cần chờ thời cơ thấu can.`;
    } else if (fireBranches.length >= 1) {
      s2 = 0.25;
      s2Status = "Trung bình / Có tỳ vết";
      s2Exp = "Hỏa tàng địa chi nhưng bị Thủy trực xung dập tắt (như Tý xung Ngọ, Hợi xung Tỵ), lực điều hậu bị tổn thương nghiêm trọng.";
    } else {
      s2 = 0.0;
      s2Status = "Chưa đạt / Phá cách";
      s2Exp = "Hàn Mệnh mùa đông mà trong tứ trụ hoàn toàn khuyết Hỏa, kim hàn thủy lãnh buốt giá, thiếu nguyên khí phát đạt.";
    }
  } else if (mingType === "Nhiệt Mệnh") {
    const waterCan = allStems.filter((c) => c === "Nhâm" || c === "Quý").length;
    const waterBranches = allBranches.filter((b) => b === "Hợi" || b === "Tý" || b === "Thân" || b === "Thìn" || b === "Sửu");
    const uninjuredWaterBranches = waterBranches.filter((b) => !allBranches.includes(CLASH_PAIRS[b] || ""));

    if (waterCan >= 1 && uninjuredWaterBranches.length >= 1) {
      s2 = 1.75;
      s2Status = "Đạt chuẩn xuất sắc";
      s2Exp = `Nhiệt Mệnh sinh hè nắng gắt đắc cả Can Thủy (${waterCan} can Nhâm/Quý) tư nhuận và Chi Thủy (${uninjuredWaterBranches.join(", ")}) thâm sâu không bị phá hại. Đúng lời Tô Dân Phong: 'Song trọng phân hữu lực', mát lành phát phú.`;
    } else if (waterCan >= 1 && waterBranches.length >= 1) {
      s2 = 1.0;
      s2Status = "Đạt yêu cầu";
      s2Exp = `Nhiệt Mệnh có Thủy thấu Thiên Can giải nhiệt, nhưng gốc Thủy địa chi (${waterBranches.join(", ")}) bị hỏa thổ tương xung tranh chiến.`;
    } else if (waterCan >= 1) {
      s2 = 0.75;
      s2Status = "Đạt yêu cầu";
      s2Exp = "Nhiệt Mệnh có Thủy thấu Thiên Can làm mát dịu, nhưng thiếu Thủy khố địa chi để nguồn nước trường cửu.";
    } else if (uninjuredWaterBranches.length >= 1) {
      s2 = 0.75;
      s2Status = "Đạt yêu cầu";
      s2Exp = "Nhiệt Mệnh có Thủy tàng dưới Địa Chi giữ độ ẩm lòng đất, bề mặt còn oi ả nhưng gốc rễ mát lành.";
    } else {
      s2 = 0.0;
      s2Status = "Chưa đạt / Phá cách";
      s2Exp = "Nhiệt Mệnh mùa hè mà tứ trụ không có một giọt Thủy, hỏa viêm thổ táo khô cằn, khó lòng tụ tài vượng tướng.";
    }
  } else {
    // Bình Mệnh (Xuân hoặc Thu)
    const hasKimThuy = allStems.some((c) => ["Canh", "Tân", "Nhâm", "Quý"].includes(c)) || allBranches.some((b) => ["Thân", "Dậu", "Hợi", "Tý"].includes(b));
    const hasMocHoa = allStems.some((c) => ["Giáp", "Ất", "Bính", "Đinh"].includes(c)) || allBranches.some((b) => ["Dần", "Mão", "Tỵ", "Ngọ"].includes(b));
    if (hasKimThuy && hasMocHoa) {
      s2 = 1.25;
      s2Status = "Đạt chuẩn xuất sắc";
      s2Exp = "Người Bình Mệnh có ngũ hành Kim Thủy và Mộc Hỏa giao hội cân bằng, bốn mùa điều hòa khí hậu thanh sảng an lành.";
    } else {
      s2 = 0.75;
      s2Status = "Đạt yêu cầu";
      s2Exp = "Khí hậu tương đối điều hòa, duy trì vận trình bình ổn tự nhiên.";
    }
  }

  // 3. Chân Thần Đắc Dụng (真神得用 - Tối đa 1.0đ)
  // Tô Dân Phong: Chân thần thấu can phải là thần có ích/đắc dụng, nếu là kỵ thần làm gia tăng thái quá thì không được điểm tối đa
  const monthHidden = CHI_HIDDEN_STEMS[monthChi] || [];
  const mainStem = monthHidden[0]?.stem;
  const secondaryStems = monthHidden.slice(1).map((h) => h.stem);
  let s3 = 0.25;
  let s3Status: NobleScoreCriteriaItem["status"] = "Trung bình / Có tỳ vết";
  let s3Exp = `Nguyệt lệnh ${monthChi} chứa bản khí ${mainStem || ""}, chưa thấu xuất Thiên Can, khí thế còn ẩn tàng.`;

  const otherStems = [yearCan, monthCan, hourCan];
  const isMainRevealed = mainStem ? otherStems.includes(mainStem) : false;

  if (isMainRevealed && mainStem) {
    const mainStemElement = CAN_META[mainStem]?.element;
    const isAdverseForSeason = 
      (mingType === "Hàn Mệnh" && (mainStemElement === "Thủy" || mainStemElement === "Kim") && allStems.filter(c => c === "Bính" || c === "Đinh").length === 0) ||
      (mingType === "Nhiệt Mệnh" && (mainStemElement === "Hỏa" || mainStemElement === "Thổ") && allStems.filter(c => c === "Nhâm" || c === "Quý").length === 0);

    if (isAdverseForSeason) {
      s3 = 0.25;
      s3Status = "Trung bình / Có tỳ vết";
      s3Exp = `Bản khí Nguyệt Lệnh (${mainStem} ${mainStemElement}) thấu can nhưng lại là Kỵ Thần mùa sinh ('Chân thần tác kỵ'), làm tăng thêm tính thiên lệch khí hậu.`;
    } else {
      s3 = 1.0;
      s3Status = "Đạt chuẩn xuất sắc";
      s3Exp = `Bản khí Nguyệt Lệnh (${mainStem}) thấu suốt lên Thiên Can làm Chân Thần cầm lệnh. Tô Dân Phong dạy: 'Nguyệt lệnh Chân Thần đắc dụng, nhất sinh vinh hiển', uy thế vững như bàn thạch.`;
    }
  } else if (secondaryStems.some((s) => otherStems.includes(s))) {
    const revealedSec = secondaryStems.find((s) => otherStems.includes(s));
    s3 = 0.5;
    s3Status = "Đạt yêu cầu";
    s3Exp = `Nguyệt lệnh thấu Trung khí/Dư khí (${revealedSec}) lên Thiên Can (Giả thần đắc dụng), có tài ứng biến linh hoạt và năng lực thực tế.`;
  }

  // 4. Thanh Trọc Bát Tự (清濁之氣 - Tối đa 1.0đ)
  let s4 = 1.0;
  let s4Status: NobleScoreCriteriaItem["status"] = "Đạt chuẩn xuất sắc";
  let s4Exp = "Khí tượng thanh thuần, Thập Thần không hỗn tạp, ngũ hành lưu thông thuần khiết, tâm trí sáng suốt quang minh.";

  if (isQuanSatMixed && isKiepDoatTai) {
    s4 = 0.0;
    s4Status = "Chưa đạt / Phá cách";
    s4Exp = "Bát tự trọc khí nặng: Vừa phạm Quan Sát hỗn tạp vừa phạm Kiếp Tài đoạt Tài, nội tâm nhiều mâu thuẫn, cuộc sống dễ vướng thị phi hao tổn.";
  } else if (isQuanSatMixed || isKiepDoatTai) {
    s4 = 0.5;
    s4Status = "Trung bình / Có tỳ vết";
    s4Exp = "Bát tự có chút trọc khí tạp chất do " + (isQuanSatMixed ? "Quan Sát hỗn tạp" : "Kiếp Tài kề sát đoạt Tài") + ", cần tu tâm dưỡng tính để giữ thanh tịnh.";
  }

  // 5. Hữu Tình vs Vô Tình (有情無情 - Tối đa 1.0đ)
  let s5 = 0.5;
  let s5Status: NobleScoreCriteriaItem["status"] = "Đạt yêu cầu";
  let s5Exp = "Can Chi tương đối bình hòa, không có trợ lực lớn nhưng cũng không bị tương tàn.";

  const isDayChiClashedByMonth = CLASH_PAIRS[dayChi] === rawPillars[1].chi;
  const isDayChiClashedByHour = CLASH_PAIRS[dayChi] === rawPillars[3].chi;
  const isDayChiClashedByYear = CLASH_PAIRS[dayChi] === rawPillars[0].chi;
  const clashCountOnDayChi = (isDayChiClashedByMonth ? 1 : 0) + (isDayChiClashedByHour ? 1 : 0) + (isDayChiClashedByYear ? 1 : 0);

  const hasBranchHarmony = HARMONY_PAIRS[dayChi] === rawPillars[1].chi || HARMONY_PAIRS[dayChi] === rawPillars[3].chi;
  const isSpousePalaceBirth = CAN_META[dayCan]?.element === CHI_META[dayChi]?.element || 
    (CHI_META[dayChi]?.element === "Hỏa" && CAN_META[dayCan]?.element === "Thổ") ||
    (CHI_META[dayChi]?.element === "Thủy" && CAN_META[dayCan]?.element === "Mộc") ||
    (CHI_META[dayChi]?.element === "Kim" && CAN_META[dayCan]?.element === "Thủy") ||
    (CHI_META[dayChi]?.element === "Mộc" && CAN_META[dayCan]?.element === "Hỏa") ||
    (CHI_META[dayChi]?.element === "Thổ" && CAN_META[dayCan]?.element === "Kim");

  if (clashCountOnDayChi >= 2) {
    s5 = 0.0;
    s5Status = "Chưa đạt / Phá cách";
    s5Exp = "Cung Phu Thê (Nhật Chi) bị 2 Địa Chi trực xung vây đánh vô tình, gia đạo sóng gió kịch liệt, tình cảm dễ ly tan nếu không tu dưỡng.";
  } else if (clashCountOnDayChi === 1) {
    s5 = 0.25;
    s5Status = "Trung bình / Có tỳ vết";
    s5Exp = "Cung Phu Thê (Nhật Chi) bị trực xung vô tình, dễ gặp bất đồng quan điểm nội bộ gia đình, nên kết hôn muộn.";
  } else if (hasBranchHarmony || isSpousePalaceBirth) {
    s5 = 1.0;
    s5Status = "Đạt chuẩn xuất sắc";
    s5Exp = "Can Chi tương sinh tương hợp hữu tình. Cung Phu Thê vững chãi được sinh trợ hoặc đắc Lục Hợp, gia đạo hòa thuận, gặp nguy có cứu tinh.";
  } else {
    s5 = 0.75;
    s5Status = "Đạt yêu cầu";
    s5Exp = "Các trụ Can Chi lưu thông hòa thuận, không bị hình xung phá hại, cuộc sống bình yên êm ả.";
  }

  // 6. Quý Nhân / Nhập Quý Cách (貴人入格 - Tối đa 1.0đ)
  // Quy tắc: Xét lần lượt 4 Thiên Can của Tứ Trụ (Năm, Tháng, Ngày, Giờ).
  // Can nào có Thiên Ất Quý Nhân hiện dưới Địa Chi của Tứ Trụ thì cộng 0.25đ (4 can x 0.25 = tối đa 1.0đ).
  const normChi = (c: string) => (c === "Tị" ? "Tỵ" : c);
  const branchSet = allBranches.map(normChi);
  const pillarLabels = ["Năm", "Tháng", "Ngày", "Giờ"];
  const qnHits: string[] = [];
  allStems.forEach((stem, idx) => {
    const qnList = (THIEN_AT_QUY_NHAN[stem] || []).map(normChi);
    const found = qnList.filter((b) => branchSet.includes(b));
    if (found.length > 0) {
      qnHits.push(`Can ${pillarLabels[idx]} ${stem} → ${found.join(", ")}`);
    }
  });

  const s6 = qnHits.length * 0.25;
  let s6Status: NobleScoreCriteriaItem["status"];
  let s6Exp: string;
  if (qnHits.length === 4) {
    s6Status = "Đạt chuẩn xuất sắc";
    s6Exp = `Cả 4 Thiên Can đều có Thiên Ất Quý Nhân hiện dưới Địa Chi (${qnHits.join("; ")}). Quý nhân tề tụ, hoạn nạn tương cứu, danh gia hiển đạt.`;
  } else if (qnHits.length >= 2) {
    s6Status = "Đạt yêu cầu";
    s6Exp = `${qnHits.length}/4 Thiên Can có Thiên Ất Quý Nhân hiện dưới Địa Chi (${qnHits.join("; ")}), mỗi can +0.25đ. Đời dễ gặp quý nhân nâng đỡ vào thời khắc then chốt.`;
  } else if (qnHits.length === 1) {
    s6Status = "Trung bình / Có tỳ vết";
    s6Exp = `1/4 Thiên Can có Thiên Ất Quý Nhân hiện dưới Địa Chi (${qnHits[0]}), +0.25đ. Có quý nhân nhưng lực trợ giúp chưa mạnh.`;
  } else {
    s6Status = "Chưa đạt / Phá cách";
    s6Exp = "Không Thiên Can nào trong Tứ Trụ có Thiên Ất Quý Nhân hiện dưới Địa Chi, lập thân chủ yếu dựa vào nghị lực tự thân.";
  }

  // 7. Đại Vận Đắc Lực 30 Năm (大運順逆 - Tối đa 2.0đ, Peter So: 'Vận tốt 30 năm gia 1 - 2 phân!')
  const primeSteps = daiVanList.slice(1, 5);
  const favorableCount = primeSteps.filter((dv) => dv.isFavorable).length;

  let s7 = 0.0;
  let s7Status: NobleScoreCriteriaItem["status"] = "Chưa đạt / Phá cách";
  let s7Exp = "Giai đoạn hoàng kim trung niên gặp nghịch vận, Tô Dân Phong khuyên: 'Nghịch phong tắc thủ', nên dĩ tĩnh chế động, tích lũy nội lực.";

  if (favorableCount >= 3) {
    s7 = 2.0;
    s7Status = "Đạt chuẩn xuất sắc";
    s7Exp = `Hành vận liên tiếp 30 - 40 năm gặp Hỷ Dụng Thần hoàng kim! Tô Dân Phong dạy: 'Mệnh nguyên cục chỉ cần 2 điểm, cộng thêm 2 điểm đại vận là thành 4 điểm đại phú!', thời cơ bứt phá thành cự gia.`;
  } else if (favorableCount === 2) {
    s7 = 1.0;
    s7Status = "Đạt yêu cầu";
    s7Exp = "Đắc 20 năm thuận vận trong độ tuổi trung niên lập nghiệp, có giai đoạn cất cánh rực rỡ nếu biết chớp đúng thời cơ.";
  } else if (favorableCount === 1) {
    s7 = 0.5;
    s7Status = "Trung bình / Có tỳ vết";
    s7Exp = "Có 10 năm hoàng kim trợ lực, cần tập trung toàn lực vào đại vận tốt nhất này để tạo bước ngoặt tài chính.";
  }

  // Tổng hợp điểm số
  const totalScore = Number((s1 + s2 + s3 + s4 + s5 + s6 + s7).toFixed(2));
  const maxPossible = 8.5;

  // Xếp hạng Phú Quý theo Tô Dân Phong (Thang Điểm & Lời Giảng 2011)
  let tierName = "Hạ Cách / Phổ Thông";
  let tierBadgeColor = "#94a3b8"; // Slate
  let hkdAssetRange = "< 5 Triệu HKD";
  let vndAssetRange = "< 15 Tỷ VND";
  let masterQuote = "Bát tự dưới 2 điểm khó thành đại nghiệp quy mô lớn, nên chú trọng tích đức, làm công ăn lương, an cư lạc nghiệp thanh thản.";
  let careerStatusVerdict = "Thích hợp làm nhân viên chuyên môn, công chức, đời sống bình đạm, tránh đầu cơ mạo hiểm.";
  let wealthPotentialVerdict = "Tích lũy từ từ theo đồng lương và bảo hiểm an toàn.";

  if (totalScore >= 6.0) {
    tierName = "Quốc Gia Quý Cách / Đại Tài Phiệt";
    tierBadgeColor = "#ef4444"; // Red / Crimson Gold
    hkdAssetRange = "500 Triệu – Hàng Tỷ HKD";
    vndAssetRange = "1.500 – Vạn Tỷ VND";
    masterQuote = "Tô Dân Phong: 'Ta tự tính mình có gần 7 điểm, xứng đáng 500 triệu đến 1 tỷ HKD!' (Lá số đạt từ 6-7 điểm là cực phẩm trần gian, chân thần đắc dụng kết hợp 30 năm đại vận hoàng kim).";
    careerStatusVerdict = "Nhân vật tầm cỡ quốc gia, tỉ phú hàng đầu, đại tài phiệt hoặc bậc thầy phong thủy lừng danh quốc tế.";
    wealthPotentialVerdict = "Gia sản nghìn đến vạn tỷ VND, tài lộc dồi dào truyền đời, tiếng tăm chấn động giang sơn.";
  } else if (totalScore >= 5.0) {
    tierName = "Cự Phú Thượng Lưu";
    tierBadgeColor = "#f97316"; // Orange
    hkdAssetRange = "100 – 500 Triệu HKD";
    vndAssetRange = "300 – 1.500+ Tỷ VND";
    masterQuote = "Tô Dân Phong: 'Ngũ phân, lục phân cự phú thượng lưu, nhất ức đáo ngũ ức HKD' (Đạt 5-6 điểm là cự phú hàng đầu, gia sản trăm triệu đến nửa tỷ đô Hồng Kông).";
    careerStatusVerdict = "Chủ tịch tập đoàn đa ngành, tài phiệt lớn, danh gia vọng tộc, nắm vị trí trọng yếu trong giới tinh hoa.";
    wealthPotentialVerdict = "Tài sản hàng trăm đến nghìn tỷ VND, quy mô vươn tầm khu vực và quốc tế.";
  } else if (totalScore >= 4.0) {
    tierName = "Đại Phú / Đại Quý";
    tierBadgeColor = "#eab308"; // Gold Yellow
    hkdAssetRange = "50 – 100 Triệu HKD";
    vndAssetRange = "150 – 300+ Tỷ VND";
    masterQuote = "Tô Dân Phong: 'Tứ phân nhất thiên vạn đáo ngũ thiên vạn, ngũ thiên vạn đáo nhất ức HKD' (Bước vào hàng ngũ 4 điểm là cự gia thượng lưu, tiếng tăm lẫy lừng).";
    careerStatusVerdict = "Đại thương nhân, giám đốc tập đoàn lớn, quan chức cấp tỉnh/thành, người có tiếng nói uy tín cao trong xã hội.";
    wealthPotentialVerdict = "Sở hữu hàng trăm tỷ VND, nhiều bất động sản trung tâm và danh mục đầu tư quy mô lớn.";
  } else if (totalScore >= 3.0) {
    tierName = "Trung Phú / Trung Quý (Tam Phân Hữu Xa Hữu Lâu)";
    tierBadgeColor = "#22c55e"; // Emerald Green
    hkdAssetRange = "10 – 50 Triệu HKD";
    vndAssetRange = "30 – 150 Tỷ VND";
    masterQuote = "Tô Dân Phong: 'Tam phân hữu xa hữu lâu, y thực vô ưu' (Đạt 3 điểm ắt có nhà lầu xe sang, cả đời cơm áo không cần bận lòng).";
    careerStatusVerdict = "Làm chủ doanh nghiệp vừa, trưởng bộ phận tập đoàn, chuyên gia đầu ngành có danh tiếng vững chắc.";
    wealthPotentialVerdict = "Tài sản hàng chục đến trăm tỷ VND, sở hữu nhà cao cửa rộng, cuộc sống sung túc an nhàn.";
  } else if (totalScore >= 2.0) {
    tierName = "Tiểu Phú / Tiểu Quý";
    tierBadgeColor = "#38bdf8"; // Sky Blue
    hkdAssetRange = "5 – 10 Triệu HKD";
    vndAssetRange = "15 – 30 Tỷ VND";
    masterQuote = "Tô Dân Phong: 'Lưỡng phân dĩ kinh hữu ốc hữu xa tiểu' (Đạt 2 điểm đã có thể sở hữu nhà riêng và ô tô nhỏ, tự do tài chính cơ bản).";
    careerStatusVerdict = "Tự mở tiệm kinh doanh riêng, trưởng nhóm quản lý cơ sở, kinh tế độc lập tự chủ.";
    wealthPotentialVerdict = "Tài sản 15 - 30 tỷ VND, có tích lũy 1-2 bất động sản và xe cộ cá nhân.";
  }

  const criteria: NobleScoreCriteriaItem[] = [
    {
      id: "c1_cachdung",
      name: "Cách Cục Thành Bại",
      chinese: "格局成敗",
      score: s1,
      maxScore: 1.0,
      status: s1Status,
      explanation: s1Exp,
    },
    {
      id: "c2_dieuhau",
      name: "Điều Hậu Dụng Thần & Hữu Lực",
      chinese: "調候有力 (雙重分)",
      score: s2,
      maxScore: 2.0,
      status: s2Status,
      explanation: s2Exp,
    },
    {
      id: "c3_chanthan",
      name: "Nguyệt Lệnh Chân Thần Đắc Dụng",
      chinese: "真神得用",
      score: s3,
      maxScore: 1.0,
      status: s3Status,
      explanation: s3Exp,
    },
    {
      id: "c4_thanhtroc",
      name: "Thanh Trọc Bát Tự",
      chinese: "清濁之氣",
      score: s4,
      maxScore: 1.0,
      status: s4Status,
      explanation: s4Exp,
    },
    {
      id: "c5_huutinh",
      name: "Can Chi Hữu Tình vs Vô Tình",
      chinese: "有情無情",
      score: s5,
      maxScore: 1.0,
      status: s5Status,
      explanation: s5Exp,
    },
    {
      id: "c6_quynhan",
      name: "Thiên Ất Quý Nhân (mỗi Can 0.25đ)",
      chinese: "貴人入格",
      score: s6,
      maxScore: 1.0,
      status: s6Status,
      explanation: s6Exp,
    },
    {
      id: "c7_daivan",
      name: "Đại Vận Đắc Lực 30 Năm",
      chinese: "大運順逆 (足30年運)",
      score: s7,
      maxScore: 2.0,
      status: s7Status,
      explanation: s7Exp,
    },
  ];

  const taiKhoList = ["Thìn", "Tuất", "Sửu", "Mùi"];
  const hasTaiKho = rawPillars.some(p => taiKhoList.includes(p.chi));
  const taiKhoVerdict = hasTaiKho
    ? "Đắc Tài Khố (Tích tài vững chắc, tiền bạc quy tụ về kho, bảo toàn được gia sản)"
    : "Chưa thấy Tài Khố hiển lộ (Tài đến tài đi, nên chuyển đổi tiền mặt thành tài sản thực như bất động sản)";
  const taiKhoDiscountWarning = "Bát Tự Bút Ký V16 lưu ý: Nếu mệnh cách có tổng điểm cao nhưng KHÔNG CÓ 'Tài Khí Thông Môn Hộ' hoặc 'Tài Khố Có Lực' thì giá trị tích sản quy đổi có thể bị chiết giảm tới 90% (chỉ vượng về danh tiếng/địa vị mà tiền mặt khó tích lũy lớn).";
  const redPointRule = "Tô Dân Phong & Vương Thế Đạt định chuẩn: 1 điểm của màu đỏ (Chân Thần Đắc Dụng, Điều Hậu Hữu Lực, Nguyệt Lệnh Bản Khí) có uy lực thực chiến gấp 2–3 lần điểm thông thường; ngược lại 1 điểm màu xanh nếu thiếu gốc rễ thì kém lực hơn nhiều.";
  const genderDiscountNote = "Nữ mệnh theo quan niệm mệnh lý truyền thống nếu không trực tiếp làm chủ kinh doanh thì lực phát tích có xu hướng chuyển hóa sang Vượng Phu Ích Tử (trợ vận đại phát cho người phối ngẫu).";

  return {
    totalScore,
    maxPossible,
    tierName,
    tierBadgeColor,
    hkdAssetRange,
    vndAssetRange,
    masterQuote,
    careerStatusVerdict,
    wealthPotentialVerdict,
    criteria,
    redPointRule,
    hasTaiKho,
    taiKhoVerdict,
    taiKhoDiscountWarning,
    genderDiscountNote,
  };
}

// ==========================================
// 8. HÀM CHÍNH: LẬP BÁT TỰ & TÍNH TOÁN HOÀN CHỈNH
// ==========================================


// ==========================================
// 8B. BỔ SUNG TỪ BÁT TỰ BÚT KÝ V16 & SHEET GIỚI THIỆU (VƯƠNG THẾ ĐẠT)
// ==========================================

export function calculateDaiVanSecretRules(): DaiVanSecretRule {
  return {
    tuyetXuPhungSinh:
      'Chuyển từ không hành vận sang hành vận may mắn sẽ không tốt ngay mà thường sẽ "Tuyệt Xứ Phùng Sinh" — vào đường chết mới thấy đường sống, có thể trải qua thử thách liên tục trước khi bứt phá; quá trình quá độ thông thường từ 3 tới 5 năm.',
    businessImperative:
      "Hành vận may mắn mà không kinh doanh, không khởi sự bung sức thì coi như không hưởng được trọn vẹn thiên thời (chỉ hưởng mức an nhàn bình thường).",
    youthCollapseRisk:
      "Hành vận may mắn ở tuổi trẻ (Nam trước 30 tuổi, Nữ trước 25 tuổi), sau giai đoạn này thường có một nhịp trầm lắng/sụp xuống một lần để tôi luyện bản lĩnh, sau đó mới bước vào chu kỳ thăng hoa bền vững.",
    transitionDefense:
      "Chuyển từ hành vận may mắn sang không hành vận: Những năm đầu tiên chuyển tiếp sẽ là năm cực tốt (quán tính dư vận), tuy nhiên tuyệt đối không được ỷ lại mà phải chủ động phòng thủ, đón đầu, không mở rộng quy mô đầu tư mạo hiểm.",
    tyKiepNoLuckFix:
      "Tỷ kiếp mà không hành vận gọi là vận 'làm nhiều hưởng ít' — cách hóa giải đắc lực nhất là chuyển sang làm các công việc có thu nhập linh hoạt theo hoa hồng/năng lực hoặc chuyên môn sáng tạo, không phụ thuộc lương cứng cố định.",
    geoFactor:
      "Hành vận may mắn ở các đô thị lớn, trung tâm kinh tế năng động thì tài vận tiến lên nhanh hơn bội phần; nếu đang ở nghịch vận thì môi trường thanh bình, nhịp sống chậm sẽ giúp tâm lý vững vàng và bình an hơn.",
  };
}

export function calculateCrucialYears(
  birthYear: number,
  targetYear: number,
  pillars: { can: string; chi: string }[],
  exactStartAge?: number
): CrucialYearsForecast {
  // 1. Phùng X biến hóa theo đúng tuổi vào vận của Tô Dân Phong (2009 Bài 01)
  const baseAge =
    exactStartAge !== undefined && !isNaN(exactStartAge)
      ? Math.max(1, Math.round(exactStartAge))
      : 10;
  const phungDigit = baseAge % 10;
  const zeroAgeMilestones = [baseAge, baseAge + 10, baseAge + 20, baseAge + 30, baseAge + 40, baseAge + 50, baseAge + 60, baseAge + 70].map((age) => ({
    age,
    year: birthYear + age,
    event: `Mốc đại biến hóa thập niên (Phùng ${phungDigit}): Tô Dân Phong chỉ dạy: Tuổi vào vận (${baseAge} tuổi) là khởi điểm của chu kỳ biến chuyển 10 năm (Phùng ${phungDigit} biến hóa). Đây là thời điểm giao tiếp giữa hai Đại Vận, thường có bước ngoặt lớn về Nhà ở (chuyển nhà, mua bán nhà đất), Sự nghiệp (thay đổi công ty/vị trí/ngành nghề), hoặc Tình cảm nhân duyên.`,
  }));

  // 2. Năm dễ có nhân duyên cưới hỏi (đuôi 0 và 1)
  const weddingYears: number[] = [];
  for (let y = Math.max(birthYear + 18, targetYear - 5); y <= targetYear + 15; y++) {
    const lastDigit = y % 10;
    if (lastDigit === 0 || lastDigit === 1) {
      weddingYears.push(y);
    }
  }

  // 3. Thiên Khắc Địa Xung
  const thienKhacMap: Record<string, string> = {
    "Giáp": "Mậu", "Ất": "Kỷ", "Bính": "Canh", "Đinh": "Tân", "Mậu": "Nhâm",
    "Kỷ": "Quý", "Canh": "Giáp", "Tân": "Ất", "Nhâm": "Bính", "Quý": "Đinh"
  };
  const diaXungMap: Record<string, string> = {
    "Tý": "Ngọ", "Sửu": "Mùi", "Dần": "Thân", "Mão": "Dậu", "Thìn": "Tuất", "Tỵ": "Hợi", "Tị": "Hợi",
    "Ngọ": "Tý", "Mùi": "Sửu", "Thân": "Dần", "Dậu": "Mão", "Tuất": "Thìn", "Hợi": "Tị"
  };

  const pillarNames = ["Trụ Năm", "Trụ Tháng", "Trụ Ngày", "Trụ Giờ"];
  const thienKhacDiaXung = pillars.map((p, idx) => {
    const khacCan = thienKhacMap[p.can] || "";
    const xungChi = diaXungMap[p.chi] || "";
    const canChiXung = `${khacCan} ${xungChi}`;

    const matchedYears: number[] = [];
    for (let y = birthYear; y <= birthYear + 80; y++) {
      const chiOfYr = CHI_NAMES[(y - 4) % 12];
      if (chiOfYr === xungChi) {
        matchedYears.push(y);
      }
    }

    const consequence =
      idx === 2
        ? "Thiên Khắc Địa Xung Nhật Trụ: Tình cảm đại biến hóa (cưới hỏi, có con, quen người yêu hoặc chia tay ly dị, đau lòng). Nhất hỷ cản tam tai."
        : idx === 1
        ? "Thiên Khắc Địa Xung Nguyệt Trụ: Sức khỏe trưởng bối cần đặc biệt lưu tâm, gia đình anh chị em có biến động."
        : idx === 3
        ? "Thiên Khắc Địa Xung Thời Trụ: Cẩn trọng phẫu thuật, thương tích đao kiếm, con cái đi xa. Không hành vận qua thì nhẹ, hành vận qua xem như một kiếp nạn."
        : "Thiên Khắc Địa Xung Niên Trụ: Nền tảng gia tộc, tổ nghiệp di dời mồ mả hoặc có biến động lớn từ đời ông bà cha mẹ.";

    return {
      pillar: pillarNames[idx],
      canChi: canChiXung,
      description: `Xung phá trực tiếp vào ${pillarNames[idx]} (${p.can} ${p.chi})`,
      years: matchedYears.slice(0, 4),
      consequence,
    };
  });

  // 4. Phục Ngâm
  const phucNgamYears = [
    {
      pillar: "Trụ Ngày (Nhật Trụ)",
      canChi: `${pillars[2].can} ${pillars[2].chi}`,
      years: (() => {
        const arr: number[] = [];
        for (let y = birthYear; y <= birthYear + 80; y++) {
          if (CHI_NAMES[(y - 4) % 12] === pillars[2].chi) arr.push(y);
        }
        return arr.slice(0, 4);
      })(),
      warning:
        "Năm Phục Ngâm / Phục Hình Nhật Trụ: Dễ suy nghĩ tiêu cực, bi quan, áp lực tâm lý không có lối ra. Đặc biệt nặng khi ở độ tuổi 30-50 tuổi. Bí quyết hóa giải: Nhất hỷ cản tam tai (chủ động cưới hỏi, sinh con, mua nhà hoặc hiến máu/khám răng).",
    },
    {
      pillar: "Trụ Tháng (Nguyệt Trụ)",
      canChi: `${pillars[1].can} ${pillars[1].chi}`,
      years: (() => {
        const arr: number[] = [];
        for (let y = birthYear; y <= birthYear + 80; y++) {
          if (CHI_NAMES[(y - 4) % 12] === pillars[1].chi) arr.push(y);
        }
        return arr.slice(0, 4);
      })(),
      warning:
        "Năm Phục Ngâm Nguyệt Trụ: Trưởng bối phòng ngừa bệnh tật, anh chị em biến chuyển sự nghiệp hoặc nơi ở.",
    },
  ];

  return {
    zeroAgeMilestones,
    weddingYears,
    thienKhacDiaXung,
    phucNgamYears,
  };
}

export function calculateOrganHealthDetails(
  rawPillars: { can: string; chi: string }[]
): OrganHealthDetail[] {
  const counts: Record<NguhHanh, number> = {
    "Kim": 0, "Mộc": 0, "Thủy": 0, "Hỏa": 0, "Thổ": 0
  };
  rawPillars.forEach(p => {
    const elCan = CAN_META[p.can]?.element;
    const elChi = CHI_META[p.chi]?.element;
    if (elCan) counts[elCan]++;
    if (elChi) counts[elChi]++;
  });

  const getRisk = (el: NguhHanh): "Nguy cơ cao (Quá vượng / Bị hình xung)" | "Cần lưu tâm (Suy nhược)" | "Bình thường ổn định" => {
    if (counts[el] >= 4) return "Nguy cơ cao (Quá vượng / Bị hình xung)";
    if (counts[el] <= 1) return "Cần lưu tâm (Suy nhược)";
    return "Bình thường ổn định";
  };

  return [
    {
      element: "Mộc",
      organs: "Gan, mật, đầu, gáy, khớp xương, cơ bắp, mắt, thần kinh, tứ chi, cổ, tuyến giáp",
      riskLevel: getRisk("Mộc"),
      details: "Mộc vượng quá thì can hỏa bốc, mắt khô mờ; Mộc suy quá thì thần kinh căng thẳng, xương khớp tê bì, khí huyết ngưng trệ."
    },
    {
      element: "Hỏa",
      organs: "Tim, mạch máu, huyết áp, tiểu tràng, vai, kinh nguyệt, lưỡi, thần kinh",
      riskLevel: getRisk("Hỏa"),
      details: "Hỏa vượng quá thì dễ hồi hộp, huyết áp cao, nóng trong, mất ngủ; Hỏa suy thì huyết áp thấp, tuần hoàn chi dưới kém, sắc mặt nhợt."
    },
    {
      element: "Thổ",
      organs: "Lá lách, dạ dày, bao tử, bụng, hệ thống tiêu hóa, da thịt, cơ bắp",
      riskLevel: getRisk("Thổ"),
      details: "Thổ khô (Tuất/Mùi) và Thổ ướt (Thìn/Sửu) tương xung hình thì đường tiêu hóa và dạ dày rất dễ viêm loét trào ngược; cần ăn uống điều độ."
    },
    {
      element: "Kim",
      organs: "Phổi, đại tràng, khí quản, mũi, da, hệ thống hô hấp, xương cốt, răng",
      riskLevel: getRisk("Kim"),
      details: "Kim bị Hỏa khắc hoặc Kim suy dễ dị ứng mũi họng, xoang, viêm họng hạt; Kim vượng thì xương cứng nhưng dễ va chạm cơ học."
    },
    {
      element: "Thủy",
      organs: "Thận, bàng quang, cẳng chân, xương chậu, đường tiểu, tử cung phụ khoa, hệ sinh dục",
      riskLevel: getRisk("Thủy"),
      details: "Thủy suy hoặc gặp Thổ vượng khắc chế thì thận khí bất túc, phụ nữ chú ý kinh nguyệt tử cung (nhất là chi Sửu), nam chú ý đường tiết niệu."
    }
  ];
}

export function evaluateBatTuBiPhap(
  rawPillars: { can: string; chi: string }[],
  dayCan: string,
  dayChi: string,
  monthChi: string
): BatTuBiPhapItem[] {
  const items: BatTuBiPhapItem[] = [];

  const hasHinh = (dayChi === "Tuất" && rawPillars.some(p => p.chi === "Mùi")) ||
                  (dayChi === "Mùi" && rawPillars.some(p => p.chi === "Tuất")) ||
                  (dayChi === "Dần" && rawPillars.some(p => p.chi === "Tị"));
  items.push({
    id: "phu_the_hinh",
    category: "Hôn Nhân",
    rule: "Phu Thê Cung Tương Hình (Tuất Mùi tương hình / Dần Tị tương hình)",
    explanation: hasHinh
      ? "Trước 30 tuổi quen ai hay lấy ai cũng cảm thấy không hợp tính cách, dễ tranh cãi gián tiếp. Lời khuyên Tô Dân Phong: Nên kết hôn muộn sau 30 tuổi hoặc chọn người có chênh lệch tuổi tác/cùng chí hướng để hóa giải."
      : "Phu thê cung không bị hình khắc nặng nề, nhân duyên tương đối bình ổn, hòa khí gia đình được duy trì.",
    isMatched: hasHinh
  });

  const hasDry = rawPillars.some(p => p.chi === "Tuất" || p.chi === "Mùi");
  const hasWet = rawPillars.some(p => p.chi === "Thìn" || p.chi === "Sửu");
  items.push({
    id: "tho_kho_tho_uot",
    category: "Sức Khỏe",
    rule: "Thổ Khô Thổ Ướt Tương Tranh (Tuất/Mùi chạm Thìn/Sửu)",
    explanation: (hasDry && hasWet)
      ? "Trong Bát Tự cùng xuất hiện cả Thổ khô (chứa Hỏa) và Thổ ướt (chứa Thủy): Hệ tiêu hóa, dạ dày, bao tử và da liễu cần chú ý giữ ấm, tránh ăn đồ quá cay nóng hay dầu mỡ."
      : "Ngũ hành Thổ phân bố ổn định, chức năng tỳ vị tiêu hóa ở mức bình thường.",
    isMatched: hasDry && hasWet
  });

  const hasDaoHoa = rawPillars.some(p => ["Tý", "Ngọ", "Mão", "Dậu"].includes(p.chi));
  items.push({
    id: "dao_hoa_menh",
    category: "Tướng Mạo & Khí Chất",
    rule: "Tứ Chính Đào Hoa (Tý, Ngọ, Mão, Dậu)",
    explanation: hasDaoHoa
      ? "Bát Tự đắc Tứ Chính Đào Hoa: Khí chất thanh tú, duyên ăn nói có sức hút tự nhiên với người xung quanh, thích hợp các ngành nghề giao tiếp, đàm phán, nghệ thuật và dịch vụ cao cấp."
      : "Mệnh cách đôn hậu mộc mạc, tính tình kiên định, lấy chân thành và chữ tín làm nền tảng ứng xử.",
    isMatched: hasDaoHoa
  });

  items.push({
    id: "tuyet_xu_phung_sinh",
    category: "Vận Hạn Kiếp Nạn",
    rule: "Bí Pháp Chuyển Vận: Tuyệt Xứ Phùng Sinh",
    explanation: "Khi bước chuyển từ Nghịch vận sang Thuận vận, cuộc đời thường trải qua 3 - 5 năm thử thách đáy vực để dọn sạch chướng ngại cũ, sau đó mới bật mạnh lên đỉnh cao. Không được nản lòng ở thời khắc chuyển giao.",
    isMatched: true
  });

  return items;
}


export function calculateCompleteHanNhietReading(
  birthDateStr: string, // YYYY-MM-DD
  birthHourChiIdx: number = 6, // 0..11 (Tý..Hợi, mặc định 6 = Ngọ)
  gender: "Nam" | "Nữ" = "Nam",
  targetYear: number = 2027
): CompleteHanNhietReading | null {
  if (!birthDateStr) return null;
  const parts = birthDateStr.split("-").map(Number);
  if (parts.length < 3) return null;
  const [year, month, day] = parts;

  // 1. Tính toán Tứ Trụ thiên văn chuẩn xác
  const baziRaw = getBaziForDate(year, month, day, birthHourChiIdx);
  const dayCan = baziRaw.dayPillar.can;
  const dayChi = baziRaw.dayPillar.chi;
  const monthCan = baziRaw.monthPillar.can;
  const monthChi = baziRaw.monthPillar.chi;
  const yearCan = baziRaw.yearPillar.can;
  const yearChi = baziRaw.yearPillar.chi;
  const hourCan = baziRaw.hourPillar.can;
  const hourChi = baziRaw.hourPillar.chi;

  const rawPillars = [
    { can: yearCan, chi: yearChi },
    { can: monthCan, chi: monthChi },
    { can: dayCan, chi: dayChi },
    { can: hourCan, chi: hourChi },
  ];

  // 2. Hàn Nhiệt Mệnh
  const mingProfile = getHanNhietCategory(baziRaw.sunLongitude, month, day);

  // 3. Đánh giá Thân Cường / Thân Nhược
  const dayStrength = evaluateDayMasterStrength(dayCan, monthChi, rawPillars);

  // 4. Lập chi tiết 4 Trụ kèm Thập Thần và Tàng Can
  const buildPillarDetail = (
    title: string,
    can: string,
    chi: string,
    chineseCan: string,
    chineseChi: string,
    napAm: string,
    palaceMeaning: string,
    lifeStage: string
  ): PillarReading => {
    const elementCan = CAN_META[can]?.element || "Thổ";
    const elementChi = CHI_META[chi]?.element || "Thổ";
    const tenGod = title.includes("Ngày") ? "Nhật Nguyên (Bản Mệnh)" : getTenGod(dayCan, can);
    const rawHidden = CHI_HIDDEN_STEMS[chi] || [];
    const hiddenStems: BranchHiddenStem[] = rawHidden.map((h) => ({
      stem: h.stem,
      chinese: CAN_META[h.stem]?.chinese || "",
      type: h.type,
      element: CAN_META[h.stem]?.element || "Thổ",
      tenGod: getTenGod(dayCan, h.stem),
    }));

    return {
      title,
      can,
      chi,
      chineseCan,
      chineseChi,
      fullName: `${can} ${chi}`,
      elementCan,
      elementChi,
      napAm,
      napAmElement: CAN_META[can]?.element || "Thổ",
      tenGod,
      hiddenStems,
      palaceMeaning,
      lifeStage,
    };
  };

  const pillars = {
    year: buildPillarDetail(
      "Trụ Năm",
      yearCan,
      yearChi,
      baziRaw.yearPillar.chineseCan,
      baziRaw.yearPillar.chineseChi,
      baziRaw.yearPillar.napAm,
      "Cung Tổ Tiên • Ông Bà • Nền Tảng Gia Tộc",
      "Giai đoạn 1 - 15 tuổi (Thiếu thời)"
    ),
    month: buildPillarDetail(
      "Trụ Tháng",
      monthCan,
      monthChi,
      baziRaw.monthPillar.chineseCan,
      baziRaw.monthPillar.chineseChi,
      baziRaw.monthPillar.napAm,
      "Cung Phụ Mẫu • Huynh Đệ • Môi Trường Sự Nghiệp",
      "Giai đoạn 16 - 30 tuổi (Thanh xuân)"
    ),
    day: buildPillarDetail(
      "Trụ Ngày",
      dayCan,
      dayChi,
      baziRaw.dayPillar.chineseCan,
      baziRaw.dayPillar.chineseChi,
      baziRaw.dayPillar.napAm,
      "Cung Bản Thân (Nhật Can) & Cung Phu Thê (Nhật Chi)",
      "Giai đoạn 31 - 45 tuổi (Trung niên)"
    ),
    hour: buildPillarDetail(
      "Trụ Giờ",
      hourCan,
      hourChi,
      baziRaw.hourPillar.chineseCan,
      baziRaw.hourPillar.chineseChi,
      baziRaw.hourPillar.napAm,
      "Cung Tử Tức (Con Cái) • Nô Bộc • Hậu Vận",
      "Giai đoạn sau 45 tuổi (Hậu vận)"
    ),
  };

  // 5. Tuổi vào vận thiên văn chính xác theo tiết khí và giờ sinh
  const isYearYang = CAN_META[yearCan]?.yinYang === "Dương";
  const isForward = (gender === "Nam" && isYearYang) || (gender === "Nữ" && !isYearYang);
  const hourFloat = (birthHourChiIdx * 2) % 24;
  const vaoVanCalculation = calculateTuoiVaoVan(year, month, day, hourFloat, gender === "Nam" ? "male" : "female");
  const activeVaoVan = isForward ? vaoVanCalculation.nextVaoVan : vaoVanCalculation.prevVaoVan;
  const activeMajorTerm = isForward ? vaoVanCalculation.nextMajorTerm : vaoVanCalculation.prevMajorTerm;
  const activeDiffFormatted = isForward ? vaoVanCalculation.diffNextFormatted : vaoVanCalculation.diffPrevFormatted;
  const exactStartAge = activeVaoVan.totalApproxYears;

  // 6. Lập Vòng Đại Vận
  const daiVanList = generateDaiVanList(
    yearCan,
    monthCan,
    monthChi,
    gender,
    exactStartAge,
    year,
    mingProfile.type
  );

  // 6.5. Tính Điểm Ngũ Hành & Đồng Đảng / Dị Đảng / Hỷ Kỵ theo Tô Dân Phong & Bát Tự Bút Ký V16
  const fiveElementsDetail = calculatePeterSoFiveElementScores(
    rawPillars,
    dayCan,
    mingProfile.type
  );

  // 7. Chấm Điểm Quý Cách Độc Môn Tô Dân Phong (Thang Điểm 0 – 7+)
  const nobleScore = calculatePeterSoNobleScore(
    dayCan,
    monthChi,
    rawPillars,
    mingProfile.type,
    dayStrength,
    daiVanList
  );

  // 8. Luận Đoán 6 Trục Cuộc Đời ("SỰ")
  const sixPillarsAnalysis = analyzeSixLifePillars(
    dayCan,
    dayChi,
    monthChi,
    yearChi,
    hourChi,
    rawPillars,
    mingProfile.type,
    dayStrength,
    gender,
    targetYear
  );

  const daiVanSecretRules = calculateDaiVanSecretRules();
  const crucialYears = calculateCrucialYears(year, targetYear, rawPillars, exactStartAge);
  const batTuBiPhap = evaluateBatTuBiPhap(rawPillars, dayCan, dayChi, monthChi);
  const organDetailsByElement = calculateOrganHealthDetails(rawPillars);

  const hourRangeInfo = HOUR_BRANCH_RANGES[birthHourChiIdx] || HOUR_BRANCH_RANGES[6];

  return {
    person: {
      birthDateStr,
      solarDateFormatted: `${day}/${month}/${year}`,
      birthHourChi: CHI_NAMES[birthHourChiIdx],
      hourRange: hourRangeInfo.range,
      gender,
      targetYear,
    },
    pillars,
    dayMaster: (() => {
      const stemProfile = STEM_NATURE_PROFILES[dayCan] || STEM_NATURE_PROFILES["Giáp"];
      const actionRule =
        mingProfile.type === "Hàn Mệnh"
          ? "Gặp vận Mộc Hỏa: Thuận phong tắc dũng (mở rộng kinh doanh, chớp thời cơ). Gặp vận Kim Thủy: Nghịch phong tắc thủ (thủ tĩnh, tích lũy nội lực)."
          : mingProfile.type === "Nhiệt Mệnh"
          ? "Gặp vận Kim Thủy: Thuận phong tắc dũng (bung sức phát tài, đón nhận thịnh vượng). Gặp vận Mộc Hỏa: Nghịch phong tắc thủ (giữ vốn, tránh nôn nóng)."
          : "Khí tiết bốn mùa bình hòa: Gặp vận Kim Thủy tiến bộ hanh thông, gặp vận Mộc Hỏa an ổn; hòa khí sinh tài, tiến thoái nhịp nhàng.";

      return {
        name: dayCan,
        chinese: CAN_META[dayCan]?.chinese || "",
        element: CAN_META[dayCan]?.element || "Thổ",
        yinYang: CAN_META[dayCan]?.yinYang || "Dương",
        natureDesc: `Nhật Can ${dayCan} (${CAN_META[dayCan]?.yinYang} ${CAN_META[dayCan]?.element}): ${stemProfile.nature}`,
        stemSymbol: stemProfile.symbol,
        psychology: stemProfile.psychology,
        peterSoPhilosophy: PETER_SO_DAY_MASTER_PHILOSOPHY,
        careerOrientationByGod: stemProfile.careerTendency,
        actionRuleByLuck: actionRule,
        strength: dayStrength.strength,
        strengthScore: dayStrength.strengthScore,
        deLenh: dayStrength.deLenh,
        deDia: dayStrength.deDia,
        deThe: dayStrength.deThe,
        careerSuitability: dayStrength.careerSuitability,
      };
    })(),
    mingProfile,
    tuoiVaoVan: {
      summary: `${activeVaoVan.years} tuổi ${activeVaoVan.months} tháng ${activeVaoVan.days} ngày (Khoảng ${Math.max(0, Math.round(exactStartAge))} tuổi khởi vận)`,
      exactStartAge,
      years: activeVaoVan.years,
      months: activeVaoVan.months,
      days: activeVaoVan.days,
      direction: isForward ? "Thuận hành" : "Nghịch hành",
      targetTermName: activeMajorTerm.record.name,
      targetTermDate: activeMajorTerm.time.formatted,
      diffDaysFormatted: activeDiffFormatted,
      reason: `${gender} sinh năm ${CAN_META[yearCan]?.yinYang} (${yearCan}) nên Đại Vận khởi theo chiều ${isForward ? "Thuận hành" : "Nghịch hành"}, tính khoảng cách ${isForward ? "tiến tới" : "lùi về"} tiết ${activeMajorTerm.record.name} (${activeDiffFormatted}).`,
    },
    daiVanList,
    fiveElementsDetail,
    nobleScore,
    daiVanSecretRules,
    crucialYears,
    batTuBiPhap,
    sixPillarsAnalysis,
  };
}
