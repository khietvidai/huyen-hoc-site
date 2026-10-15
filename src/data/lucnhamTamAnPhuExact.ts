/**
 * Dữ liệu 12 Thiên Tướng và Khẩu Quyết Tâm Ấn Phú chuẩn xác 100% theo bản dịch & chú giải yêu cầu
 * Tuyệt đối không lấy thông tin bên ngoài.
 */

export interface TamAnPhuEntry {
  branch: string;            // Cư Tý, Cư Sửu, ...
  chineseBranch: string;     // 子, 丑, ...
  tuongName: string;         // Giải phân, Thăng đường, ...
  tuongChinese: string;      // 解分, 升堂, ...
  meaning: string;           // Diễn giải chính xác theo bản cung cấp
  fullLine: string;          // Dòng đầy đủ
}

export interface TamAnPhuGeneral {
  id: number;
  name: string;              // Quý Nhân, Đằng Xà, Chu Tước, ...
  overview: string;          // Khái lược bản chất
  notes?: string;            // Ghi chú đặc biệt (ví dụ: Số, Câu Trần cùng ra Huyền Vũ...)
  cungVi: Record<string, TamAnPhuEntry>;
}

export const TAM_AN_PHU_EXACT_DATA: TamAnPhuGeneral[] = [
  // 01 Quý Nhân
  {
    id: 1,
    name: "Quý Nhân",
    overview: "Ngọc hoàng đại đế, quan nhân cấp cao, sử lý công đạo",
    cungVi: {
      "Tý": {
        branch: "Tý",
        chineseBranch: "子",
        tuongName: "Giải phân",
        tuongChinese: "解分",
        meaning: "Ủy thác bề bộn cho kẻ tôi tớ, hồ thành hà (hệ thống thoát nước của thành trì)",
        fullLine: "Cư Tý— Giải phân (解分): Ủy thác bề bộn cho kẻ tôi tớ, hồ thành hà (hệ thống thoát nước của thành trì)"
      },
      "Sửu": {
        branch: "Sửu",
        chineseBranch: "丑",
        tuongName: "Thăng đường",
        tuongChinese: "升堂",
        meaning: "Làm đúng, không có nương nhờ, trang nghiêm (như thẩm phán hiện đại)",
        fullLine: "Cư Sửu— Thăng đường (升堂): làm đúng, không có nương nhờ, trang nghiêm (như thẩm phán hiện đại)"
      },
      "Dần": {
        branch: "Dần",
        chineseBranch: "寅",
        tuongName: "Bằng kỷ",
        tuongChinese: "凭几",
        meaning: "Quan gia đang nghỉ ngơi, ngồi im không giúp. (Quan liêu)",
        fullLine: "Cư Dần— Bằng kỷ (凭几): quan gia đang nghỉ ngơi, ngồi im không giúp. (Quan liêu)"
      },
      "Mão": {
        branch: "Mão",
        chineseBranch: "卯",
        tuongName: "Đăng xa",
        tuongChinese: "登车",
        meaning: "Còn gọi là thừa hiên, quan đại lão gia đã đi khỏi nhà, đã đến trễ một bước.",
        fullLine: "Cư Mão— Đăng xa (登车): còn gọi là thừa hiên, quan đại lão gia đã đi khỏi nhà, đã đến trễ một bước."
      },
      "Thìn": {
        branch: "Thìn",
        chineseBranch: "辰",
        tuongName: "Thiên lao",
        tuongChinese: "天牢",
        meaning: "Thụ nhục, đi tù nhưng địa vị vẫn còn, có đặc quyền.",
        fullLine: "Cư Thìn— Thiên lao (天牢): thụ nhục, đi tù nhưng địa vị vẫn còn, có đặc quyền."
      },
      "Tỵ": {
        branch: "Tỵ",
        chineseBranch: "巳",
        tuongName: "Thụ cống",
        tuongChinese: "受贡",
        meaning: "Cầu nguyện trong chùa, miếu, sự thành thì trả lễ (cho chùa, miếu).",
        fullLine: "Cư Tỵ— Thụ cống (受贡): cầu nguyện trong chùa, miếu, sự thành thì trả lễ (cho chùa, miếu)."
      },
      "Ngọ": {
        branch: "Ngọ",
        chineseBranch: "午",
        tuongName: "Thụ cống",
        tuongChinese: "受贡",
        meaning: "Hối lộ cấp trên.",
        fullLine: "Cư Ngọ— Thụ cống (受贡): hối lộ cấp trên."
      },
      "Mùi": {
        branch: "Mùi",
        chineseBranch: "未",
        tuongName: "Liệt tịch",
        tuongChinese: "列席",
        meaning: "Đánh trống kêu to làm tiệc nhưng quan đại lão gia không tới. Nếu ngồi chung bàn nhất định sẽ có thứ bị mất ( nhan sắc, tài sản)",
        fullLine: "Cư Mùi— Liệt tịch (列席): đánh trống kêu to làm tiệc nhưng quan đại lão gia không tới. Nếu ngồi chung bàn nhất định sẽ có thứ bị mất ( nhan sắc, tài sản)"
      },
      "Thân": {
        branch: "Thân",
        chineseBranch: "申",
        tuongName: "Di đồ",
        tuongChinese: "移途",
        meaning: "Thấy quan đại lão gia đang trên kiệu đi trên đường, nên né ra, nếu nhảy ra kêu oan trước bị đánh 30 hèo.",
        fullLine: "Cư Thân— Di đồ (移途): Thấy quan đại lão gia đang trên kiệu đi trên đường, nên né ra, nếu nhảy ra kêu oan trước bị đánh 30 hèo."
      },
      "Dậu": {
        branch: "Dậu",
        chineseBranch: "酉",
        tuongName: "Nhập tư thất",
        tuongChinese: "入私室",
        meaning: "Quan đại lão gia nhìn trúng con gái nhà này, tới tận nhà khoác vai làm quen. (Chắc chắn mất đồ)",
        fullLine: "Cư Dậu— Nhập tư thất (入私室): quan đại lão gia nhìn trúng con gái nhà này, tới tận nhà khoác vai làm quen. (Chắc chắn mất đồ)"
      },
      "Tuất": {
        branch: "Tuất",
        chineseBranch: "戌",
        tuongName: "Nhập ngục",
        tuongChinese: "地狱",
        meaning: "Nhập ngục không có đặc quyền.",
        fullLine: "Cư Tuất— nhập ngục (地狱): nhập ngục không có đặc quyền."
      },
      "Hợi": {
        branch: "Hợi",
        chineseBranch: "亥",
        tuongName: "Đăng Thiên Môn",
        tuongChinese: "还原",
        meaning: "Ngọc Hoàng về chỗ. (Không kỳ hạn được giải quyết).",
        fullLine: "Cư Hợi— Đăng Thiên Môn (还原): Ngọc Hoàng về chỗ. (Không kỳ hạn được giải quyết)."
      }
    }
  },

  // 02 Đằng Xà
  {
    id: 2,
    name: "Đằng Xà",
    overview: "Kinh hoảng, địa hộ, nhân khẩu, gia trạch, khu đèn đỏ chớp nhoáng.",
    cungVi: {
      "Tý": {
        branch: "Tý",
        chineseBranch: "子",
        tuongName: "Yểm mục",
        tuongChinese: "掩目",
        meaning: "Đằng xà không cảm nhận thấy bạn.",
        fullLine: "Cư Tý— Yểm mục (掩目): đằng xà không cảm nhận thấy bạn."
      },
      "Sửu": {
        branch: "Sửu",
        chineseBranch: "丑",
        tuongName: "Bàn quy",
        tuongChinese: "蟠龟",
        meaning: "Cùng ở với nhau một thời gian, sau đó đường ai nấy đi.",
        fullLine: "Cư Sửu— Bàn quy (蟠龟): cùng ở với nhau một thời gian, sau đó đường ai nấy đi."
      },
      "Dần": {
        branch: "Dần",
        chineseBranch: "寅",
        tuongName: "Sinh giác",
        tuongChinese: "生角",
        meaning: "Mọc sừng, có độc, rắn trên cây, người không vào rừng thì an toàn đừng vào.",
        fullLine: "Cư Dần— Sinh giác (生角): Mọc sừng, có độc, rắn trên cây, người không vào rừng thì an toàn đừng vào."
      },
      "Mão": {
        branch: "Mão",
        chineseBranch: "卯",
        tuongName: "Đương môn",
        tuongChinese: "当门",
        meaning: "Rắn trước cửa thường không có độc, rắn nhà, nhà sẽ không có chuột, không có nguy hiểm.",
        fullLine: "Cư Mão— Đương môn (当门): rắn trước cửa thường không có độc, rắn nhà, nhà sẽ không có chuột, không có nguy hiểm."
      },
      "Thìn": {
        branch: "Thìn",
        chineseBranch: "辰",
        tuongName: "Tượng long",
        tuongChinese: "象龍",
        meaning: "Rắn vẫn là rắn không thành rồng được, giống rồng vẫn là rắn, bạn dưới cấp người ta, cùng đám nhưng vẫn thấp hơn một bậc. Nên an phận ở tầng mây của mình.",
        fullLine: "Cư Thìn— Tượng long (象龍): rắn vẫn là rắn không thành rồng được, giống rồng vẫn là rắn, bạn dưới cấp người ta, cùng đám nhưng vẫn thấp hơn một bậc. Nên an phận ở tầng mây của mình."
      },
      "Tỵ": {
        branch: "Tỵ",
        chineseBranch: "巳",
        tuongName: "Thừa vụ",
        tuongChinese: "乘雾",
        meaning: "Trở về bản vị, rắn phun sương tự bảo vệ mình, ai thấy thì nên tránh xa ra.",
        fullLine: "Cư Tỵ— Thừa vụ (乘雾): trở về bản vị, rắn phun sương tự bảo vệ mình, ai thấy thì nên tránh xa ra."
      },
      "Ngọ": {
        branch: "Ngọ",
        chineseBranch: "午",
        tuongName: "Phi không",
        tuongChinese: "飞空",
        meaning: "Công kích, ở nhân sinh lộ, trên đường đời có nhiều kinh hiểm.",
        fullLine: "Cư Ngọ— Phi không (飞空): công kích, ở nhân sinh lộ, trên đường đời có nhiều kinh hiểm."
      },
      "Mùi": {
        branch: "Mùi",
        chineseBranch: "未",
        tuongName: "Nhập lâm",
        tuongChinese: "入林",
        meaning: "Rắn cỏ, không có độc.",
        fullLine: "Cư Mùi— Nhập lâm (入林): rắn cỏ, không có độc."
      },
      "Thân": {
        branch: "Thân",
        chineseBranch: "申",
        tuongName: "Hàm kiếm",
        tuongChinese: "衔剑",
        meaning: "Rắn thấy kiếm tưởng như con rắn khác nên ăn, ai ngờ là giả tượng ăn xong bị lủng bụng.",
        fullLine: "Cư Thân— Hàm kiếm (衔剑): rắn thấy kiếm tưởng như con rắn khác nên ăn, ai ngờ là giả tượng ăn xong bị lủng bụng."
      },
      "Dậu": {
        branch: "Dậu",
        chineseBranch: "酉",
        tuongName: "Lộ xỉ",
        tuongChinese: "露齿",
        meaning: "Tham há miệng nhanh cắn con dao, tham nhanh không màn hậu quả.",
        fullLine: "Cư Dậu— Lộ xỉ (露齿): Tham há miệng nhanh cắn con dao, tham nhanh không màn hậu quả."
      },
      "Tuất": {
        branch: "Tuất",
        chineseBranch: "戌",
        tuongName: "Nhập trủng",
        tuongChinese: "入塚",
        meaning: "Về tổ rắn, có nguy hiểm, nhưng không thấy, nhưng lại không nguy hiểm. (Không cần lo lắng về nguy hiểm nhưng vẫn phải phòng bị)",
        fullLine: "Cư Tuất— Nhập trủng (入塚): về tổ rắn, có nguy hiểm, nhưng không thấy, nhưng lại không nguy hiểm. (Không cần lo lắng về nguy hiểm nhưng vẫn phải phòng bị)"
      },
      "Hợi": {
        branch: "Hợi",
        chineseBranch: "亥",
        tuongName: "Trụy thủy",
        tuongChinese: "坠水",
        meaning: "Rắn nước, lửa rơi vào nước không có uy lực",
        fullLine: "Cư Hợi— Trụy thủy (坠水): rắn nước, lửa rơi vào nước không có uy lực"
      }
    }
  },

  // 03 Chu Tước
  {
    id: 3,
    name: "Chu Tước",
    overview: "Văn thư, văn chương, văn xương, phô trương, làm đẹp, rực rỡ, khoe khoang, khẩu thiệt. Số 9",
    notes: "Số 9",
    cungVi: {
      "Tý": {
        branch: "Tý",
        chineseBranch: "子",
        tuongName: "Tổn vũ",
        tuongChinese: "损羽",
        meaning: "Ý là rụng lông sau sẽ mọc lại, tin tức sẽ tới sau, tạm thời tin tức chưa tới được. (Không có bị tổn thương)",
        fullLine: "Cư Tý— Tổn vũ (损羽): ý là rụng lông sau sẽ mọc lại, tin tức sẽ tới sau, tạm thời tin tức chưa tới được. (Không có bị tổn thương)"
      },
      "Sửu": {
        branch: "Sửu",
        chineseBranch: "丑",
        tuongName: "Yểm mục",
        tuongChinese: "掩目",
        meaning: "Ngủ, nên không thấy được, không có phần của bạn.",
        fullLine: "Cư Sửu— Yểm mục (掩目): ngủ, nên không thấy được, không có phần của bạn."
      },
      "Dần": {
        branch: "Dần",
        chineseBranch: "寅",
        tuongName: "An sào",
        tuongChinese: "安巢",
        meaning: "Phản bội mang theo tài liệu, tin tức, bí mật của chủ cũ sang nơi mới.",
        fullLine: "Cư Dần— An sào (安巢): phản bội mang theo tài liệu, tin tức, bí mật của chủ cũ sang nơi mới."
      },
      "Mão": {
        branch: "Mão",
        chineseBranch: "卯",
        tuongName: "An sào",
        tuongChinese: "安巢",
        meaning: "Âm trạch, an thần vị, nạp bia, xem tinh tinh (ma quỷ, yêu quái)",
        fullLine: "Cư Mão—An sào (安巢): âm trạch, an thần vị, nạp bia, xem tinh tinh (ma quỷ, yêu quái)"
      },
      "Thìn": {
        branch: "Thìn",
        chineseBranch: "辰",
        tuongName: "Đầu võng",
        tuongChinese: "投网",
        meaning: "Tin tới nữa chừng bị cắt đứt liên lạc.",
        fullLine: "Cư Thìn— Đầu võng (投网): tin tới nữa chừng bị cắt đứt liên lạc."
      },
      "Tỵ": {
        branch: "Tỵ",
        chineseBranch: "巳",
        tuongName: "Ngao tường",
        tuongChinese: "翱翔",
        meaning: "Bay hướng tới mặt trời, tức mạo hiểm, ý chí kiên định. Trên đời ko có hỏa phượng hoàng, trước chết sau sống, nói xạo, mơ mộng, chém gió, không làm được, chỉ có đường chết.",
        fullLine: "Cư Tỵ— Ngao tường (翱翔): bay hướng tới mặt trời, tức mạo hiểm, ý chí kiên định. Trên đời ko có hỏa phượng hoàng, trước chết sau sống, nói xạo, mơ mộng, chém gió, không làm được, chỉ có đường chết."
      },
      "Ngọ": {
        branch: "Ngọ",
        chineseBranch: "午",
        tuongName: "Hàm phù",
        tuongChinese: "衔符",
        meaning: "Đang tới, giờ chưa có, đang bay tới.",
        fullLine: "Cư Ngọ— Hàm phù (衔符): đang tới, giờ chưa có, đang bay tới."
      },
      "Mùi": {
        branch: "Mùi",
        chineseBranch: "未",
        tuongName: "Lâm Phần",
        tuongChinese: "临坟",
        meaning: "Không có người tế bái, tuyệt tử tuyệt tôn.",
        fullLine: "Cư Mùi— Lâm Phần: không có người tế bái, tuyệt tử tuyệt tôn."
      },
      "Thân": {
        branch: "Thân",
        chineseBranch: "申",
        tuongName: "Lệ chủy",
        tuongChinese: "厉嘴",
        meaning: "Đấu đá, đấu hãnh, hành động lấy mạng.",
        fullLine: "Cư Thân— Lệ chủy (厉嘴): đấu đá, đấu hãnh, hành động lấy mạng."
      },
      "Dậu": {
        branch: "Dậu",
        chineseBranch: "酉",
        tuongName: "Dạ táo",
        tuongChinese: "夜鸣",
        meaning: "Gia trạch bất linh, nhà thưởng có cãi vả.",
        fullLine: "Cư Dậu— Dạ táo (夜鸣): gia trạch bất linh, nhà thưởng có cãi vả."
      },
      "Tuất": {
        branch: "Tuất",
        chineseBranch: "戌",
        tuongName: "Lạc võng",
        tuongChinese: "落网",
        meaning: "Người khác làm thì không sao, tới mình nhờ làm thì nữa chừng lăn ra chết.",
        fullLine: "Cư Tuất— lạc võng: người khác làm thì không sao, tới mình nhờ làm thì nữa chừng lăn ra chết."
      },
      "Hợi": {
        branch: "Hợi",
        chineseBranch: "亥",
        tuongName: "Nhập thủy",
        tuongChinese: "入水",
        meaning: "Hỏa bị chìm xuống nước tắt ngủm, bị người khác quăng, bỏ, vứt đi, kết thúc, hết.",
        fullLine: "Cư Hợi— Nhập thủy (入水): hỏa bị chìm xuống nước tắt ngủm, bị người khác quăng, bỏ, vứt đi, kết thúc, hết."
      }
    }
  },

  // 04 Lục Hợp
  {
    id: 4,
    name: "Lục Hợp",
    overview: "Hợp đồng, khế ước, mai mối, nữ gặp thanh long hoặc quan quỷ, nam gặp tài hoặc quan quỷ là kết hôn. Số 04",
    notes: "Số 04",
    cungVi: {
      "Tý": {
        branch: "Tý",
        chineseBranch: "子",
        tuongName: "Phản mục",
        tuongChinese: "反目",
        meaning: "Địa phạm thiên, ý hạ phạm thượng.",
        fullLine: "Cư Tý— Phản mục (反目): địa phạm thiên, ý hạ phạm thượng."
      },
      "Sửu": {
        branch: "Sửu",
        chineseBranch: "丑",
        tuongName: "Trang nghiêm",
        tuongChinese: "庄严",
        meaning: "Quy tắc, chỉnh tề vì tượng cắm lúa đồng đều.",
        fullLine: "Cư Sửu— Trang nghiêm (庄严): quy tắc, chỉnh tề vì tượng cắm lúa đồng đều."
      },
      "Dần": {
        branch: "Dần",
        chineseBranch: "寅",
        tuongName: "Thừa hiên",
        tuongChinese: "乘轩",
        meaning: "Nguyện theo, nguyện lấy thân đền đáp, lấy phu tòng phu, đi theo, nhờ vả, sinh tử ý phùng, như dây leo bám vào cột cầu.",
        fullLine: "Cư Dần— Thừa hiên (乘轩): nguyện theo, nguyện lấy thân đền đáp, lấy phu tòng phu, đi theo, nhờ vả, sinh tử ý phùng, như dây leo bám vào cột cầu."
      },
      "Mão": {
        branch: "Mão",
        chineseBranch: "卯",
        tuongName: "Nhập thất",
        tuongChinese: "入室",
        meaning: "Quy y bái tổ, vợ lẻ vào nhà nhưng không có địa vị, hay con hoang về nhà, người bị bỏ quên bên ngoài về nhà.",
        fullLine: "Cư Mão— Nhập thất (入室): quy y bái tổ, vợ lẻ vào nhà nhưng không có địa vị, hay con hoang về nhà, người bị bỏ quên bên ngoài về nhà."
      },
      "Thìn": {
        branch: "Thìn",
        chineseBranch: "辰",
        tuongName: "Vi lý",
        tuongChinese: "违理",
        meaning: "Phạm luật, không phải phạm pháp.",
        fullLine: "Cư Thìn— Vi lý (违理): phạm luật, không phải phạm pháp."
      },
      "Tỵ": {
        branch: "Tỵ",
        chineseBranch: "巳",
        tuongName: "Bất hài",
        tuongChinese: "不谐",
        meaning: "Thiên sinh địa, địa không chịu nổi. Vô phúc tiêu sầu.",
        fullLine: "Cư Tỵ— Bất hài (不谐): thiên sinh địa, địa không chịu nổi. Vô phúc tiêu sầu."
      },
      "Ngọ": {
        branch: "Ngọ",
        chineseBranch: "午",
        tuongName: "Thăng đường",
        tuongChinese: "升堂",
        meaning: "Nhân sinh lộ vào nhầm đường, cấp trên đề bạc nhưng bạn không đủ năng lực.",
        fullLine: "Cư Ngọ— Thăng đường (升堂): nhân sinh lộ vào nhầm đường, cấp trên đề bạc nhưng bạn không đủ năng lực."
      },
      "Mùi": {
        branch: "Mùi",
        chineseBranch: "未",
        tuongName: "Nạp thái",
        tuongChinese: "纳采",
        meaning: "Tiểu đăng khoa, mở tiệc.",
        fullLine: "Cư Mùi— Nạp thái (纳采): tiểu đăng khoa, mở tiệc."
      },
      "Thân": {
        branch: "Thân",
        chineseBranch: "申",
        tuongName: "Kết phát",
        tuongChinese: "结发",
        meaning: "Định tình, hiệp định, hợp đồng miệng, nói tín nhiệm.",
        fullLine: "Cư Thân— Kết phát (结发): định tình, hiệp định, hợp đồng miệng, nói tín nhiệm."
      },
      "Dậu": {
        branch: "Dậu",
        chineseBranch: "酉",
        tuongName: "Tư Thử",
        tuongChinese: "私许",
        meaning: "Chạy thôi, đến sai địa điểm rồi, chỗ này không an toàn.",
        fullLine: "Cư Dậu— Tư Thử: chạy thôi, đến sai địa điểm rồi, chỗ này không an toàn."
      },
      "Tuất": {
        branch: "Tuất",
        chineseBranch: "戌",
        tuongName: "Vong tu",
        tuongChinese: "忘羞",
        meaning: "Tuất mão hợp, tưởng mộc khắc thổ nhưng tân trong tuất trở ra khắc ngược. Tham hợp quên khắc, tự chiêu tội nghiệp. Phẫu thuật (hỏi bệnh)",
        fullLine: "Cư Tuất— Vong tu (忘羞): tuất mão hợp, tưởng mộc khắc thổ nhưng tân trong tuất trở ra khắc ngược. Tham hợp quên khắc, tự chiêu tội nghiệp. Phẫu thuật (hỏi bệnh)"
      },
      "Hợi": {
        branch: "Hợi",
        chineseBranch: "亥",
        tuongName: "Đãi mệnh",
        tuongChinese: "待命",
        meaning: "Chuẩn bị đợi lệnh.",
        fullLine: "Cư Hợi— Đãi mệnh (待命): chuẩn bị đợi lệnh."
      }
    }
  },

  // 05 Câu Trần
  {
    id: 5,
    name: "Câu Trần",
    overview: "Nha sai, người chấp pháp, ngưu đầu mã diện. Khi đồng thời câu trần cùng ra với huyền vũ thì có quan phi. Số 05,10, 09",
    notes: "Số 05, 10, 09",
    cungVi: {
      "Tý": {
        branch: "Tý",
        chineseBranch: "子",
        tuongName: "Đầu cơ",
        tuongChinese: "投机",
        meaning: "Người ta đầu cơ vào bạn, bạn có giá trị lợi dụng, cần cẩn thận, có tổn thất.",
        fullLine: "Cư Tý— Đầu cơ (投机): người ta đầu cơ vào bạn, bạn có giá trị lợi dụng, cần cẩn thận, có tổn thất."
      },
      "Sửu": {
        branch: "Sửu",
        chineseBranch: "丑",
        tuongName: "Thụ việt",
        tuongChinese: "受越",
        meaning: "Quan sai chiếm dụng tài sản của bạn. Bị tịch thu.",
        fullLine: "Cư Sửu— Thụ việt (受越): quan sai chiếm dụng tài sản của bạn. Bị tịch thu."
      },
      "Dần": {
        branch: "Dần",
        chineseBranch: "寅",
        tuongName: "Tao tù",
        tuongChinese: "遭囚",
        meaning: "Bị giam trên xe tù diễu hành đến pháp trường (bị chọi rau cà chua)",
        fullLine: "Cư Dần— Tao tù (遭囚): bị giam trên xe tù diễu hành đến pháp trường (bị chọi rau cà chua)"
      },
      "Mão": {
        branch: "Mão",
        chineseBranch: "卯",
        tuongName: "Lâm môn",
        tuongChinese: "临门",
        meaning: "Công an ở khắp nơi chỗ bạn sinh sống, có thể có vụ án gần đó, chưa chắc liên quan tới bạn, cũng có thể có liên quan.",
        fullLine: "Cư Mão— Lâm môn (临门): công an ở khắp nơi chỗ bạn sinh sống, có thể có vụ án gần đó, chưa chắc liên quan tới bạn, cũng có thể có liên quan."
      },
      "Thìn": {
        branch: "Thìn",
        chineseBranch: "辰",
        tuongName: "Thăng đường",
        tuongChinese: "升堂",
        meaning: "Chấp hành trật tự nơi công đường.",
        fullLine: "Cư Thìn— Thăng đường (升堂): chấp hành trật tự nơi công đường."
      },
      "Tỵ": {
        branch: "Tỵ",
        chineseBranch: "巳",
        tuongName: "Thụ cống",
        tuongChinese: "受贡",
        meaning: "Cống nạp, dâng hiến tiền bạc, vật phẩm cho quan sai, miếu mạo để giải hạn, mong cầu bình an nhưng cũng dễ bị lợi dụng.",
        fullLine: "Cư Tỵ— Thụ cống (受贡): cống nạp, dâng hiến tiền bạc, vật phẩm cho quan sai, miếu mạo để giải hạn, mong cầu bình an nhưng cũng dễ bị lợi dụng."
      },
      "Ngọ": {
        branch: "Ngọ",
        chineseBranch: "午",
        tuongName: "Phản mục",
        tuongChinese: "反目",
        meaning: "Hỏa sinh thổ, địa sinh thiên tiêu hao quá độ. Câu trần là thi hành pháp luật, chu tước là văn thư, tin tức sẽ có mâu thuẫn, hoặc chu tước gặp thiên la bị bắt.",
        fullLine: "Cư Ngọ— Phản mục (反目): hỏa sinh thổ, địa sinh thiên tiêu hao quá độ. Câu trần là thi hành pháp luật, chu tước là văn thư, tin tức sẽ có mâu thuẫn, hoặc chu tước gặp thiên la bị bắt."
      },
      "Mùi": {
        branch: "Mùi",
        chineseBranch: "未",
        tuongName: "Nhập dịch",
        tuongChinese: "入驿",
        meaning: "Quan phủ vào dịch trạm, có việc gấp.",
        fullLine: "Cư Mùi— Nhập dịch (入驿): quan phủ vào dịch trạm, có việc gấp."
      },
      "Thân": {
        branch: "Thân",
        chineseBranch: "申",
        tuongName: "Xu hộ",
        tuongChinese: "趋户",
        meaning: "Truyền phiếu, giấy phạt.",
        fullLine: "Cư Thân— Xu hộ (趋户): truyền phiếu, giấy phạt."
      },
      "Dậu": {
        branch: "Dậu",
        chineseBranch: "酉",
        tuongName: "Phi nhận",
        tuongChinese: "披刃",
        meaning: "Ở trước nhà bạn công an rút hết kiếm, súng ra.",
        fullLine: "Cư Dậu— Phi nhận (披刃): ở trước nhà bạn công an rút hết kiếm, súng ra."
      },
      "Tuất": {
        branch: "Tuất",
        chineseBranch: "戌",
        tuongName: "Hạ ngục",
        tuongChinese: "下狱",
        meaning: "Vào ngục tù.",
        fullLine: "Cư Tuất— Hạ ngục (下狱): Vào ngục tù."
      },
      "Hợi": {
        branch: "Hợi",
        chineseBranch: "亥",
        tuongName: "Hàn thường",
        tuongChinese: "褰裳",
        meaning: "Trách phạt mà không thèm tìm hiểu lý do bên trong, không quan tâm đối phương có khó khăn gì. Hoặc nói rồi thôi không làm.",
        fullLine: "Cư Hợi— Hàn thường (褰裳): trách phạt mà không thèm tìm hiểu lý do bên trong, không quan tâm đối phương có khó khăn gì. Hoặc nói rồi thôi không làm."
      }
    }
  },

  // 06 Thanh Long
  {
    id: 6,
    name: "Thanh Long",
    overview: "Số 03, đắc lực, công tào, người giúp đỡ. Đối với nữ thanh long là chồng.",
    notes: "Số 03",
    cungVi: {
      "Tý": {
        branch: "Tý",
        chineseBranch: "子",
        tuongName: "Nhập hải",
        tuongChinese: "入海",
        meaning: "Lặn xuống biển sâu, mất tăm biệt tích.",
        fullLine: "Cư Tý— Nhập hải (入海): Lặn xuống biển sâu, mất tăm biệt tích."
      },
      "Sửu": {
        branch: "Sửu",
        chineseBranch: "丑",
        tuongName: "Bàn nê",
        tuongChinese: "蟠泥",
        meaning: "Tiềm long vật dụng. Ở đó không giúp được.",
        fullLine: "Cư Sửu— Bàn nê (蟠泥): tiềm long vật dụng. Ở đó không giúp được."
      },
      "Dần": {
        branch: "Dần",
        chineseBranch: "寅",
        tuongName: "Thừa vân",
        tuongChinese: "乘云",
        meaning: "Cưỡi mây lướt gió, không thấy đâu.",
        fullLine: "Cư Dần— Thừa vân (乘云): Cưỡi mây lướt gió, không thấy đâu."
      },
      "Mão": {
        branch: "Mão",
        chineseBranch: "卯",
        tuongName: "Khu lôi",
        tuongChinese: "驱雷",
        meaning: "Kinh hãi, lo sợ, như nghe tiếng sấm nhưng không sao.",
        fullLine: "Cư Mão— Khu lôi (驱雷): kinh hãi, lo sợ, như nghe tiếng sấm nhưng không sao."
      },
      "Thìn": {
        branch: "Thìn",
        chineseBranch: "辰",
        tuongName: "Phi thiên",
        tuongChinese: "飞天",
        meaning: "Bay vút lên trời, về thiên đình (thìn là thiên đình), không kiếm được.",
        fullLine: "Cư Thìn— Phi thiên (飞天): Bay vút lên trời, về thiên đình (thìn là thiên đình), không kiếm được."
      },
      "Tỵ": {
        branch: "Tỵ",
        chineseBranch: "巳",
        tuongName: "Yểm mục",
        tuongChinese: "掩目",
        meaning: "Che khuất tầm nhìn",
        fullLine: "Cư Tỵ— Yểm mục (掩目): Che khuất tầm nhìn"
      },
      "Ngọ": {
        branch: "Ngọ",
        chineseBranch: "午",
        tuongName: "Thiêu thân",
        tuongChinese: "烧身",
        meaning: "Lửa thiêu đốt mình, vô dụng.",
        fullLine: "Cư Ngọ— Thiêu thân (烧身): Lửa thiêu đốt mình, vô dụng."
      },
      "Mùi": {
        branch: "Mùi",
        chineseBranch: "未",
        tuongName: "Tại lục",
        tuongChinese: "在陆",
        meaning: "Trong phong thủy là cắm cọc, nhà trên lưng núi cắm cọc để xây.",
        fullLine: "Cư Mùi— Tại lục (在陆): trong phong thủy là cắm cọc, nhà trên lưng núi cắm cọc để xây."
      },
      "Thân": {
        branch: "Thân",
        chineseBranch: "申",
        tuongName: "Thương lân",
        tuongChinese: "伤鱗",
        meaning: "Tổn thương vảy rồng. Cần thời gian dưỡng thương.",
        fullLine: "Cư Thân— Thương lân (伤鱗): Tổn thương vảy rồng. Cần thời gian dưỡng thương."
      },
      "Dậu": {
        branch: "Dậu",
        chineseBranch: "酉",
        tuongName: "Tồi giác",
        tuongChinese: "摧角",
        meaning: "Rắn mọc sừng thành rồng. (Quẻ cát)",
        fullLine: "Cư Dậu— Tồi giác (摧角): rắn mọc sừng thành rồng. (Quẻ cát)"
      },
      "Tuất": {
        branch: "Tuất",
        chineseBranch: "戌",
        tuongName: "Đăng khôi",
        tuongChinese: "登魁",
        meaning: "Rơi vào lưới bủa",
        fullLine: "Cư Tuất— Đăng khôi (登魁): Rơi vào lưới bủa"
      },
      "Hợi": {
        branch: "Hợi",
        chineseBranch: "亥",
        tuongName: "Du giang",
        tuongChinese: "游江",
        meaning: "Dạo chơi sông lớn, tâm lo chơi không làm việc.",
        fullLine: "Cư Hợi— Du giang (游江): Dạo chơi sông lớn, tâm lo chơi không làm việc."
      }
    }
  },

  // 07 Thiên Không
  {
    id: 7,
    name: "Thiên Không",
    overview: "Đang sử dụng mà không biết như không khí, bất tri bất giác. Thiên không vào không vong là niềm tin tôn giáo. Tín ngưỡng thứ không có, tôn giáo tín niệm, dù giả cũng xem đồ thiệt mà dùng. Chiêm thời là thiên không, mà lại không vong thì mặt trời (nguyệt tướng) là chiêm thời (hoạt). Tuy không tồn tại nhưng vẫn ảnh hưởng người chiêm, nguyệt tướng không vong không tính không vong. Ví dụ buổi tối không thấy mặt trời nhưng vẫn ảnh hưởng bạn. Không tin thì không vấn đề, nhất định không được khẩu xuất cuồng ngôn.",
    cungVi: {
      "Tý": {
        branch: "Tý",
        chineseBranch: "子",
        tuongName: "Phục thất",
        tuongChinese: "伏室",
        meaning: "Đồ mất có thể tìm lại được, hồi phục, trở lại, không có biến, muốn thay đổi cũng không được, trở về.",
        fullLine: "Cư Tý— Phục thất (伏室): đồ mất có thể tìm lại được, hồi phục, trở lại, không có biến, muốn thay đổi cũng không được, trở về."
      },
      "Sửu": {
        branch: "Sửu",
        chineseBranch: "丑",
        tuongName: "Thị trắc",
        tuongChinese: "侍侧",
        meaning: "Có ở đây, chuẩn bị, chưa có, chưa tới.",
        fullLine: "Cư Sửu— Thị trắc (侍侧): có ở đây, chuẩn bị, chưa có, chưa tới."
      },
      "Dần": {
        branch: "Dần",
        chineseBranch: "寅",
        tuongName: "Bị chế",
        tuongChinese: "被制",
        meaning: "Thụ nhục, tiểu sơn cốc, trên là cây dưới là đá, cạm bẫy. Nhìn xa bước hụt chân là chết. Không có phát triển. Người ta áp bức mình, địa khắc thiên.",
        fullLine: "Cư Dần— Bị chế (被制): thụ nhục, tiểu sơn cốc, trên là cây dưới là đá, cạm bẫy. Nhìn xa bước hụt chân là chết. Không có phát triển. Người ta áp bức mình, địa khắc thiên."
      },
      "Mão": {
        branch: "Mão",
        chineseBranch: "卯",
        tuongName: "Bị chế",
        tuongChinese: "被制",
        meaning: "Thụ nhục, một bãi tha ma, không nên đi. Không có phát triển. Người ta áp bức mình",
        fullLine: "Cư Mão— bị chế; thụ nhục, một bãi tha ma, không nên đi. Không có phát triển. Người ta áp bức mình"
      },
      "Thìn": {
        branch: "Thìn",
        chineseBranch: "辰",
        tuongName: "Tứ ngược",
        tuongChinese: "肆虐",
        meaning: "Tàn phá dữ dội, bệnh, thìn là tường thành, tuất là cửu tức là tường hình cửu long.",
        fullLine: "Cư Thìn— tứ ngược; tàn phá dữ dội, bệnh, thìn là tường thành, tuất là cửu tức là tường hình cửu long."
      },
      "Tỵ": {
        branch: "Tỵ",
        chineseBranch: "巳",
        tuongName: "Thụ nhục",
        tuongChinese: "受辱",
        meaning: "Nhẫn nhịn chịu đựng, địa sinh thiên, địa sao sinh thiên được, không biết thân phận nhận công.",
        fullLine: "Cư Tỵ— Thụ nhục (受辱): Nhẫn nhịn chịu đựng, địa sinh thiên, địa sao sinh thiên được, không biết thân phận nhận công."
      },
      "Ngọ": {
        branch: "Ngọ",
        chineseBranch: "午",
        tuongName: "Thức tự",
        tuongChinese: "识字",
        meaning: "Đại đạo đạo lý, nhân sinh lộ…",
        fullLine: "Cư Ngọ— Thức tự (识字): đại đạo đạo lý, nhân sinh lộ…"
      },
      "Mùi": {
        branch: "Mùi",
        chineseBranch: "未",
        tuongName: "Xu tiến",
        tuongChinese: "趋进",
        meaning: "Ép bạn làm, ép buộc, không nên gấp, nên làm từ từ.",
        fullLine: "Cư Mùi— Xu tiến (趋进): ép bạn làm, ép buộc, không nên gấp, nên làm từ từ."
      },
      "Thân": {
        branch: "Thân",
        chineseBranch: "申",
        tuongName: "Cổ thiệt",
        tuongChinese: "鼓舌",
        meaning: "Tiếng chê bai như đá banh chỉ có cầu môn mà còn sút hụt. Tin tức truyền tin hồi âm.",
        fullLine: "Cư Thân— Cổ thiệt (鼓舌): tiếng chê bai như đá banh chỉ có cầu môn mà còn sút hụt. Tin tức truyền tin hồi âm."
      },
      "Dậu": {
        branch: "Dậu",
        chineseBranch: "酉",
        tuongName: "Xảo thuyết",
        tuongChinese: "巧说",
        meaning: "Nói xạo.",
        fullLine: "Cư Dậu— Xảo thuyết (巧说): nói xạo."
      },
      "Tuất": {
        branch: "Tuất",
        chineseBranch: "戌",
        tuongName: "Cư gia",
        tuongChinese: "居家",
        meaning: "Về nhà, trở về, quay lại, vật mất quay lại.",
        fullLine: "Cư Tuất— Cư gia (居家): về nhà, trở về, quay lại, vật mất quay lại."
      },
      "Hợi": {
        branch: "Hợi",
        chineseBranch: "亥",
        tuongName: "Vọng từ",
        tuongChinese: "妄词",
        meaning: "Làm pháp sự, cầu nguyện, maketing, quảng cáo, mù thuật.",
        fullLine: "Cư Hợi— Vọng từ (妄词): làm pháp sự, cầu nguyện, maketing, quảng cáo, mù thuật."
      }
    }
  },

  // 08 Bạch Hổ
  {
    id: 8,
    name: "Bạch Hổ",
    overview: "Truyền tống, số 7, tử thần, bạch thổ thực sự ở dần.",
    notes: "Số 7",
    cungVi: {
      "Tý": {
        branch: "Tý",
        chineseBranch: "子",
        tuongName: "Nịch thủy",
        tuongChinese: "溺水",
        meaning: "Cọp đi xuống suối uống nước, thấy thì đừng lại gần. Hoặc là gương, kính, phản chiếu.",
        fullLine: "Cư Tý— Nịch thủy (溺水): cọp đi xuống suối uống nước, thấy thì đừng lại gần. Hoặc là gương, kính, phản chiếu."
      },
      "Sửu": {
        branch: "Sửu",
        chineseBranch: "丑",
        tuongName: "Tại dã",
        tuongChinese: "在野",
        meaning: "Tổn thất tài sản.",
        fullLine: "Cư Sửu— Tại dã (在野): tổn thất tài sản."
      },
      "Dần": {
        branch: "Dần",
        chineseBranch: "寅",
        tuongName: "Đăng sơn",
        tuongChinese: "登山",
        meaning: "Treo lồng đèn báo chết, người quan trọng mất, đã chết.",
        fullLine: "Cư Dần— Đăng sơn (登山): treo lồng đèn báo chết, người quan trọng mất, đã chết."
      },
      "Mão": {
        branch: "Mão",
        chineseBranch: "卯",
        tuongName: "Lâm môn",
        tuongChinese: "临门",
        meaning: "Tin đồn có nguy hiểm, đồn miệng… quân sự diễn tập",
        fullLine: "Cư Mão— Lâm môn (临门): tin đồn có nguy hiểm, đồn miệng… quân sự diễn tập"
      },
      "Thìn": {
        branch: "Thìn",
        chineseBranch: "辰",
        tuongName: "Phân thi",
        tuongChinese: "分尸",
        meaning: "Cọp đang ăn thịt, đừng làm phiền nó, né ra mà đi",
        fullLine: "Cư Thìn— phân thi: cọp đang ăn thịt, đừng làm phiền nó, né ra mà đi"
      },
      "Tỵ": {
        branch: "Tỵ",
        chineseBranch: "巳",
        tuongName: "Phần thân",
        tuongChinese: "焚身",
        meaning: "Cọp nóng nảy bất an gặp ai cũng cắn.",
        fullLine: "Cư Tỵ— Phần thân (焚身): cọp nóng nảy bất an gặp ai cũng cắn."
      },
      "Ngọ": {
        branch: "Ngọ",
        chineseBranch: "午",
        tuongName: "Thiêu thân",
        tuongChinese: "烧身",
        meaning: "Cọp bị thiêu rụi không còn nguy hiểm, cẩn thận né nó ra, coi chừng bị đốt chung.",
        fullLine: "Cư Ngọ— thiêu thân: cọp bị thiêu rụi không còn nguy hiểm, cẩn thận né nó ra, coi chừng bị đốt chung."
      },
      "Mùi": {
        branch: "Mùi",
        chineseBranch: "未",
        tuongName: "Tại dã",
        tuongChinese: "在野",
        meaning: "Cọp không đúng chỗ, ở thảo nguyên, nhất cử nhất động đều bị quan sát thấy, có báo động, không nên lại gần. Cọp chưa phát huy được uy dũng",
        fullLine: "Cư Mùi— Tại dã (在野): cọp không đúng chỗ, ở thảo nguyên, nhất cử nhất động đều bị quan sát thấy, có báo động, không nên lại gần. Cọp chưa phát huy được uy dũng"
      },
      "Thân": {
        branch: "Thân",
        chineseBranch: "申",
        tuongName: "Hàm điệp",
        tuongChinese: "衔牒",
        meaning: "Có tin tức tốt mới tới nhanh, cọp gặm thư về nhà. Cọp xem người chiêm là chủ nhân.",
        fullLine: "Cư Thân— Hàm điệp (衔牒): có tin tức tốt mới tới nhanh, cọp gặm thư về nhà. Cọp xem người chiêm là chủ nhân."
      },
      "Dậu": {
        branch: "Dậu",
        chineseBranch: "酉",
        tuongName: "Lâm môn",
        tuongChinese: "临门",
        meaning: "Cọp vào nhà, nhà này là hung trạch.",
        fullLine: "Cư Dậu— Lâm môn (临门): cọp vào nhà, nhà này là hung trạch."
      },
      "Tuất": {
        branch: "Tuất",
        chineseBranch: "戌",
        tuongName: "Lạc tỉnh",
        tuongChinese: "落井",
        meaning: "Rơi xuống giếng sâu, không còn nguy hiểm.",
        fullLine: "Cư Tuất— Lạc tỉnh (落井): Rơi xuống giếng sâu, không còn nguy hiểm."
      },
      "Hợi": {
        branch: "Hợi",
        chineseBranch: "亥",
        tuongName: "Nịch thủy",
        tuongChinese: "溺水",
        meaning: "Sa chìm xuống nước, cọp bị chết đuối.",
        fullLine: "Cư Hợi— Nịch thủy (溺水): Sa chìm xuống nước, cọp bị chết đuối."
      }
    }
  },

  // 09 Thái Thường
  {
    id: 9,
    name: "Thái Thường",
    overview: "Số 08, thuốc, dược sư, hắc bạch vô thường, y sư, nhậu nhẹt, áo lụa, nông sản, vải…",
    notes: "Số 08",
    cungVi: {
      "Tý": {
        branch: "Tý",
        chineseBranch: "子",
        tuongName: "Tao gia",
        tuongChinese: "遭枷",
        meaning: "Bị gông cùm, gông cổ.",
        fullLine: "Cư Tý— Tao gia (遭枷): bị gông cùm, gông cổ."
      },
      "Sửu": {
        branch: "Sửu",
        chineseBranch: "丑",
        tuongName: "Thụ tước",
        tuongChinese: "受爵",
        meaning: "Tử kỳ, đợi chết.",
        fullLine: "Cư Sửu— Thụ tước (受爵): tử kỳ, đợi chết."
      },
      "Dần": {
        branch: "Dần",
        chineseBranch: "寅",
        tuongName: "Trắc mục",
        tuongChinese: "侧目",
        meaning: "Liếc mắt, đã cảnh báo rồi mà vẫn làm sai. Biết sai vẫn làm.",
        fullLine: "Cư Dần— Trắc mục (侧目): Liếc mắt, đã cảnh báo rồi mà vẫn làm sai. Biết sai vẫn làm."
      },
      "Mão": {
        branch: "Mão",
        chineseBranch: "卯",
        tuongName: "Di quan",
        tuongChinese: "遗冠",
        meaning: "Đánh rơi mũ quan, mất đi đồ vật trọng yếu, đồ vua bang bị mất dẫn tới mất mạng.",
        fullLine: "Cư Mão— vi quan (遗冠): Đánh rơi mũ quan, mất đi đồ vật trọng yếu, đồ vua bang bị mất dẫn tới mất mạng."
      },
      "Thìn": {
        branch: "Thìn",
        chineseBranch: "辰",
        tuongName: "Bội ấn",
        tuongChinese: "佩印",
        meaning: "Hiện tại là passport, giấy thông quan, hỏi bệnh thì chết chắc.",
        fullLine: "Cư Thìn— Bội ấn (佩印): hiện tại là passport, giấy thông quan, hỏi bệnh thì chết chắc."
      },
      "Tỵ": {
        branch: "Tỵ",
        chineseBranch: "巳",
        tuongName: "Chú ấn",
        tuongChinese: "铸印",
        meaning: "Đúc tạo ấn vàng, chuẩn bị, đang làm rồi, đang chế tạo. 10 vạch chưa ghi 1 chấm. Đang quy hoạch, còn lâu mới xong.",
        fullLine: "Cư Tỵ— Chú ấn (铸印): Đúc tạo ấn vàng, chuẩn bị, đang làm rồi, đang chế tạo. 10 vạch chưa ghi 1 chấm. Đang quy hoạch, còn lâu mới xong."
      },
      "Ngọ": {
        branch: "Ngọ",
        chineseBranch: "午",
        tuongName: "Thừa hiên",
        tuongChinese: "乘轩",
        meaning: "Bước lên xe gấm, vì kế sinh nhai mà xuất phát.",
        fullLine: "Cư Ngọ— Thừa hiên (乘轩): Bước lên xe gấm, vì kế sinh nhai mà xuất phát."
      },
      "Mùi": {
        branch: "Mùi",
        chineseBranch: "未",
        tuongName: "Phủng thương",
        tuongChinese: "捧觞",
        meaning: "Nạp vòng, nâng chén rượu mừng, tiểu đăng khoa",
        fullLine: "Cư Mùi—nạp vòng, Phủng thương (捧觞): Nâng chén rượu mừng, tiểu đăng khoa"
      },
      "Thân": {
        branch: "Thân",
        chineseBranch: "申",
        tuongName: "Hàm bôi",
        tuongChinese: "衔杯",
        meaning: "Nâng ly yến ẩm",
        fullLine: "Cư Thân— Hàm bôi (衔杯): Nâng ly yến ẩm"
      },
      "Dậu": {
        branch: "Dậu",
        chineseBranch: "酉",
        tuongName: "Trung quyển",
        tuongChinese: "重卷",
        meaning: "Đọc sách xong cuộn lại, đã xong",
        fullLine: "Cư Dậu— trung quyển: đọc sách xong cuộn lại, đã xong"
      },
      "Tuất": {
        branch: "Tuất",
        chineseBranch: "戌",
        tuongName: "Nghịch mệnh",
        tuongChinese: "逆命",
        meaning: "Bạch sự, anh hùng yến, đã kết thúc, đãi rượu ở hà khôi là chết.",
        fullLine: "Cư Tuất— Nghịch mệnh (逆命): bạch sự, anh hùng yến, đã kết thúc, đãi rượu ở hà khôi là chết."
      },
      "Hợi": {
        branch: "Hợi",
        chineseBranch: "亥",
        tuongName: "Trưng triệu",
        tuongChinese: "征召",
        meaning: "Bề trên triệu gọi, chết chắc, chiến tranh kêu gọi đi lính.",
        fullLine: "Cư Hợi— Trưng triệu (征召): Bề trên triệu gọi, chết chắc, chiến tranh kêu gọi đi lính."
      }
    }
  },

  // 10 Huyền Vũ
  {
    id: 10,
    name: "Huyền Vũ",
    overview: "Phong thủy lai long, có cơ hội là tọa (trong tọa hướng), màu đen, cướp tặc, số 04, 13, 14. Câu trần gặp Huyền vũ thì có quan phi. Kiếm đồ có thể kiếm được.",
    notes: "Số 04, 13, 14",
    cungVi: {
      "Tý": {
        branch: "Tý",
        chineseBranch: "子",
        tuongName: "Tát phát",
        tuongChinese: "散发",
        meaning: "Bị dọa sợ, hư kinh.",
        fullLine: "Cư Tý— Tát phát (散发): bị dọa sợ, hư kinh."
      },
      "Sửu": {
        branch: "Sửu",
        chineseBranch: "丑",
        tuongName: "Thăng đường",
        tuongChinese: "升堂",
        meaning: "Bị áp giải đi gặp quan. (Hạ thấp mình, vì quan đã đứng ở phe ta, nhận lỗi có thể giảm nhẹ tội)",
        fullLine: "Cư Sửu— Thăng đường (升堂): bị áp giải đi gặp quan. (Hạ thấp mình, vì quan đã đứng ở phe ta, nhận lỗi có thể giảm nhẹ tội)"
      },
      "Dần": {
        branch: "Dần",
        chineseBranch: "寅",
        tuongName: "Nhập lâm",
        tuongChinese: "入林",
        meaning: "An toàn, cướp tặc đi rồi.",
        fullLine: "Cư Dần— Nhập lâm (入林): an toàn, cướp tặc đi rồi."
      },
      "Mão": {
        branch: "Mão",
        chineseBranch: "卯",
        tuongName: "Khuy hộ",
        tuongChinese: "窥户",
        meaning: "Thám thính, ghi ký hiệu (cướp đánh dấu nhà giàu nghèo trong thôn)",
        fullLine: "Cư Mão— Khuy hộ (窥户): thám thính, ghi ký hiệu (cướp đánh dấu nhà giàu nghèo trong thôn)"
      },
      "Thìn": {
        branch: "Thìn",
        chineseBranch: "辰",
        tuongName: "Thất lộ",
        tuongChinese: "失路",
        meaning: "Có cơ hội cũng là thăng đường, kiện cáo lên chỗ cao nhất là thiên đình, nên cố sức ở tòa án dùng hết thủ đoạn để thoát thân. Ko thì bị phán tội chắc.",
        fullLine: "Cư Thìn— Thất lộ (失路): có cơ hội cũng là thăng đường, kiện cáo lên chỗ cao nhất là thiên đình, nên cố sức ở tòa án dùng hết thủ đoạn để thoát thân. Ko thì bị phán tội chắc."
      },
      "Tỵ": {
        branch: "Tỵ",
        chineseBranch: "巳",
        tuongName: "Phản cố",
        tuongChinese: "反顾",
        meaning: "Hư kinh, cướp có tâm tà, đi phải ngoái cổ lại xem có ai đuổi bắt mình không? Tâm hư, chả sao cả.",
        fullLine: "Cư Tỵ— Phản cố (反顾): hư kinh, cướp có tâm tà, đi phải ngoái cổ lại xem có ai đuổi bắt mình không? Tâm hư, chả sao cả."
      },
      "Ngọ": {
        branch: "Ngọ",
        chineseBranch: "午",
        tuongName: "Tiệt lộ",
        tuongChinese: "截路",
        meaning: "Cướp chặn đường, trên đường đời xuất hiện nguy cơ trọng đại nguy hiểm, không nên đi tiếp.",
        fullLine: "Cư Ngọ— Tiệt lộ (截路): cướp chặn đường, trên đường đời xuất hiện nguy cơ trọng đại nguy hiểm, không nên đi tiếp."
      },
      "Mùi": {
        branch: "Mùi",
        chineseBranch: "未",
        tuongName: "Bất thành",
        tuongChinese: "不成",
        meaning: "Mưu sự thất bại, không rõ chưa sử dụng bao giờ.",
        fullLine: "Cư Mùi— Bất thành (不成): Mưu sự thất bại, không rõ chưa sử dụng bao giờ."
      },
      "Thân": {
        branch: "Thân",
        chineseBranch: "申",
        tuongName: "Chiết túc",
        tuongChinese: "折足",
        meaning: "Gãy chân vấp ngã, cướp vừa nhảy ra đã gãy chân, tốt lành.",
        fullLine: "Cư Thân— Chiết túc (折足): Gãy chân vấp ngã, cướp vừa nhảy ra đã gãy chân, tốt lành."
      },
      "Dậu": {
        branch: "Dậu",
        chineseBranch: "酉",
        tuongName: "Bạt kiếm",
        tuongChinese: "拔剑",
        meaning: "Rút kiếm hung hãn, cướp bóc, đả kiếp, có nguy hiểm.",
        fullLine: "Cư Dậu— Bạt kiếm (拔剑): Rút kiếm hung hãn, cướp bóc, đả kiếp, có nguy hiểm."
      },
      "Tuất": {
        branch: "Tuất",
        chineseBranch: "戌",
        tuongName: "Tao tù",
        tuongChinese: "遭囚",
        meaning: "Cướp bị bắt vào tù.",
        fullLine: "Cư Tuất— tao tù; cướp bị bắt vào tù."
      },
      "Hợi": {
        branch: "Hợi",
        chineseBranch: "亥",
        tuongName: "Phục tàng",
        tuongChinese: "伏藏",
        meaning: "Nguy hiểm cực độ, cướp mai phục đối bạn bất lợi.",
        fullLine: "Cư Hợi— Phục tàng (伏藏): nguy hiểm cực độ, cướp mai phục đối bạn bất lợi."
      }
    }
  },

  // 11 Thái Âm
  {
    id: 11,
    name: "Thái Âm",
    overview: "Số 06, kẻ phá hoại, thiếu nữ, yểu mị, tử thần, tối âm, không đáy, quỷ quái, yêu quái. Linh vị, bài vị, Châu báu, sáng chói, vỏ ốc.",
    notes: "Số 06",
    cungVi: {
      "Tý": {
        branch: "Tý",
        chineseBranch: "子",
        tuongName: "Thùy liêm",
        tuongChinese: "垂簾",
        meaning: "Thính chính, thêm 1 phụ nữ có quan hệ. Hư ảo có thực có ảo.",
        fullLine: "Cư Tý— Thùy liêm (垂簾): thính chính, thêm 1 phụ nữ có quan hệ. Hư ảo có thực có ảo."
      },
      "Sửu": {
        branch: "Sửu",
        chineseBranch: "丑",
        tuongName: "Nhập nội",
        tuongChinese: "入內",
        meaning: "Vào chốn nội cung, đắc kỷ trụ vương. Loạn triều chính. Vào được chỗ này thì hãy quên đi chuyện cũ mình là yêu quái, vì đã dưới 1 người trên vạn người. Cửu vỹ hồ chẳng lẽ có tên trong phong thần bảng, nếu không hại người, vì nghĩ mình là yêu nên sợ đã hại người. Đã ngồi chính vị rồi, còn nghỉ việc không tốt nữa làm chi, tự làm khổ mình.",
        fullLine: "Cư Sửu— Nhập nội (入內): Vào chốn nội cung, đắc kỷ trụ vương. Loạn triều chính. Vào được chỗ này thì hãy quên đi chuyện cũ mình là yêu quái, vì đã dưới 1 người trên vạn người. Cửu vỹ hồ chẳng lẽ có tên trong phong thần bảng, nếu không hại người, vì nghĩ mình là yêu nên sợ đã hại người. Đã ngồi chính vị rồi, còn nghỉ việc không tốt nữa làm chi, tự làm khổ mình."
      },
      "Dần": {
        branch: "Dần",
        chineseBranch: "寅",
        tuongName: "Tiển túc",
        tuongChinese: "跣足",
        meaning: "Khoe chân, quyến rũ, kêu gọi, dụ dỗ, có cho nhiều điều kiện.",
        fullLine: "Cư Dần— Tiển túc (跣足): khoe chân, quyến rũ, kêu gọi, dụ dỗ, có cho nhiều điều kiện."
      },
      "Mão": {
        branch: "Mão",
        chineseBranch: "卯",
        tuongName: "Vi hành",
        tuongChinese: "微行",
        meaning: "Gia tộc, thay đổi nhỏ.",
        fullLine: "Cư Mão— Vi hành (微行): gia tộc, thay đổi nhỏ."
      },
      "Thìn": {
        branch: "Thìn",
        chineseBranch: "辰",
        tuongName: "Tạo đình",
        tuongChinese: "造庭",
        meaning: "Đã lên thiên đình, đã không còn là yêu quái, đừng nghĩ đừng sợ mình là yêu quái nữa, đã tu thành chính đạo.",
        fullLine: "Cư Thìn— Tạo đình (造庭): đã lên thiên đình, đã không còn là yêu quái, đừng nghĩ đừng sợ mình là yêu quái nữa, đã tu thành chính đạo."
      },
      "Tỵ": {
        branch: "Tỵ",
        chineseBranch: "巳",
        tuongName: "Phục chẩm",
        tuongChinese: "伏枕",
        meaning: "Gái đẹp ngủ tới trưa, lười biếng, không nên quỷ thác cho làm việc. Hỏi âm trạch thì ở đó có chủ rồi, là hũ cốt hoặc mộ có chủ.",
        fullLine: "Cư Tỵ— Phục chẩm (伏枕): gái đẹp ngủ tới trưa, lười biếng, không nên quỷ thác cho làm việc. Hỏi âm trạch thì ở đó có chủ rồi, là hũ cốt hoặc mộ có chủ."
      },
      "Ngọ": {
        branch: "Ngọ",
        chineseBranch: "午",
        tuongName: "Thoát cân",
        tuongChinese: "脫巾",
        meaning: "Có người để ý, cho bạn một cơ hội.",
        fullLine: "Cư Ngọ— Thoát cân (脫巾): có người để ý, cho bạn một cơ hội."
      },
      "Mùi": {
        branch: "Mùi",
        chineseBranch: "未",
        tuongName: "Cuốn thư",
        tuongChinese: "卷书",
        meaning: "Sách cổ là tre, sắp xếp, tra từ điển, nghiên cứu, thu thập dữ liệu. Kết thúc.",
        fullLine: "Cư Mùi— cuốn thư: sách cổ là tre, sắp xếp, tra từ điển, nghiên cứu, thu thập dữ liệu. Kết thúc."
      },
      "Thân": {
        branch: "Thân",
        chineseBranch: "申",
        tuongName: "Chấp chính",
        tuongChinese: "執政",
        meaning: "Nắm quyền định đoạt",
        fullLine: "Cư Thân— Chấp chính (執政): Nắm quyền định đoạt"
      },
      "Dậu": {
        branch: "Dậu",
        chineseBranch: "酉",
        tuongName: "Bế hộ",
        tuongChinese: "閉戶",
        meaning: "Đóng chặt cửa ngõ, an toàn.",
        fullLine: "Cư Dậu— Bế hộ (閉戶): Đóng chặt cửa ngõ, an toàn."
      },
      "Tuất": {
        branch: "Tuất",
        chineseBranch: "戌",
        tuongName: "Bị sát",
        tuongChinese: "被察",
        meaning: "Bị tra xét dòm ngó, phân tích bạn, kiểm tra bạn, với bạn có nghi ngờ.",
        fullLine: "Cư Tuất— Bị sát (被察): Bị tra xét dòm ngó, phân tích bạn, kiểm tra bạn, với bạn có nghi ngờ."
      },
      "Hợi": {
        branch: "Hợi",
        chineseBranch: "亥",
        tuongName: "Khỏa hình",
        tuongChinese: "裸形",
        meaning: "Trần trụi thân mình, hình phạt, không có khả năng phản kháng.",
        fullLine: "Cư Hợi— Khỏa hình (裸形): Trần trụi thân mình, hình phạt, không có khả năng phản kháng."
      }
    }
  },

  // 12 Thiên Hậu
  {
    id: 12,
    name: "Thiên Hậu",
    overview: "Sau cùng, kết thúc, thiên hậu nương nương, bà lão, bảo hộ. Chiêm thời không vong là miệng vs tâm bất nhất hoặc bị che giấu sự việc không rõ ràng.",
    cungVi: {
      "Tý": {
        branch: "Tý",
        chineseBranch: "子",
        tuongName: "Thủ khuê",
        tuongChinese: "守閨",
        meaning: "Bảo vệ nhà cửa, bảo toàn gia đình.",
        fullLine: "Cư Tý— Thủ khuê (守閨): bảo vệ nhà cửa, bảo toàn gia đình."
      },
      "Sửu": {
        branch: "Sửu",
        chineseBranch: "丑",
        tuongName: "Thâu khuy",
        tuongChinese: "偷窺",
        meaning: "Đi vệ sinh buổi tối ở điền án, sợ bị dòm ngó.",
        fullLine: "Cư Sửu— Thâu khuy (偷窺): đi vệ sinh buổi tối ở điền án, sợ bị dòm ngó."
      },
      "Dần": {
        branch: "Dần",
        chineseBranch: "寅",
        tuongName: "Lý phát",
        tuongChinese: "理發",
        meaning: "Chải tóc, dọn dẹp và quăng bớt đồ.",
        fullLine: "Cư Dần— Lý phát (理發): Chải tóc, dọn dẹp và quăng bớt đồ."
      },
      "Mão": {
        branch: "Mão",
        chineseBranch: "卯",
        tuongName: "Lâm môn",
        tuongChinese: "臨門",
        meaning: "Lão bà vào nhà, trước là thiếp, giờ vợ lớn phê chuẩn vào nhà (hoặc vợ lớn mất), nhận tổ quy tông.",
        fullLine: "Cư Mão— Lâm môn (臨門): lão bà vào nhà, trước là thiếp, giờ vợ lớn phê chuẩn vào nhà (hoặc vợ lớn mất), nhận tổ quy tông."
      },
      "Thìn": {
        branch: "Thìn",
        chineseBranch: "辰",
        tuongName: "Hủy trang",
        tuongChinese: "毀妝",
        meaning: "Phát điên.",
        fullLine: "Cư Thìn— Hủy trang (毀妝): Phát điên."
      },
      "Tỵ": {
        branch: "Tỵ",
        chineseBranch: "巳",
        tuongName: "Khỏa thể",
        tuongChinese: "裸體",
        meaning: "Chết chắc, lão bà khỏa thể là mất rồi để đại liệm trước khi bỏ vào quan tài.",
        fullLine: "Cư Tỵ— Khỏa thể (裸體): chết chắc, lão bà khỏa thể là mất rồi để đại liệm trước khi bỏ vào quan tài."
      },
      "Ngọ": {
        branch: "Ngọ",
        chineseBranch: "午",
        tuongName: "Phục chẩm",
        tuongChinese: "伏枕",
        meaning: "Bệnh, lão bà ngủ tới trưa thì bệnh chắc.",
        fullLine: "Cư Ngọ— Phục chẩm (伏枕): bệnh, lão bà ngủ tới trưa thì bệnh chắc."
      },
      "Mùi": {
        branch: "Mùi",
        chineseBranch: "未",
        tuongName: "Mộc dục",
        tuongChinese: "沐浴",
        meaning: "Tắm gội giếng sâu, sợ người ta dòm ngó, dư thừa già rồi ai thèm dòm.",
        fullLine: "Cư Mùi— Mộc dục (沐浴): Tắm gội giếng sâu, sợ người ta dòm ngó, dư thừa già rồi ai thèm dòm."
      },
      "Thân": {
        branch: "Thân",
        chineseBranch: "申",
        tuongName: "Tu dung",
        tuongChinese: "修容",
        meaning: "Sửa sang dung mạo, thêm vào, bổ xung vào.",
        fullLine: "Cư Thân— Tu dung (修容): Sửa sang dung mạo, thêm vào, bổ xung vào."
      },
      "Dậu": {
        branch: "Dậu",
        chineseBranch: "酉",
        tuongName: "Ỷ hộ",
        tuongChinese: "倚戶",
        meaning: "Dựa dẫm, dựa vào ai đó.",
        fullLine: "Cư Dậu— Ỷ hộ (倚戶): dựa dẫm, dựa vào ai đó."
      },
      "Tuất": {
        branch: "Tuất",
        chineseBranch: "戌",
        tuongName: "Hàn vi",
        tuongChinese: "寒微",
        meaning: "Cô đơn một mình, cái long giường có 1 mình ngồi, đúng ra phải 2 người ngồi. Thói quen không tốt, hành quân đánh trận một mình. Đi khám bệnh 1 mình.",
        fullLine: "Cư Tuất— hàn vi: cô đơn một mình, cái long giường có 1 mình ngồi, đúng ra phải 2 người ngồi. Thói quen không tốt, hành quân đánh trận một mình. Đi khám bệnh 1 mình."
      },
      "Hợi": {
        branch: "Hợi",
        chineseBranch: "亥",
        tuongName: "Trị sự",
        tuongChinese: "治事",
        meaning: "Có người cùng sử lý việc.",
        fullLine: "Cư Hợi— Trị sự (治事): có người cùng sử lý việc."
      }
    }
  }
];

/**
 * Chuẩn hóa tên Thiên Tướng (hỗ trợ cả Câu Trận / Câu Trần và các biến thể)
 */
export function normalizeGeneralName(name: string): string {
  const norm = (name || "").trim();
  if (norm === "Câu Trận" || norm === "câu trận" || norm === "Câu trận" || norm === "CÂU TRẬN") {
    return "Câu Trần";
  }
  return norm;
}

/**
 * Tra cứu Tâm Ấn Phú chuẩn xác theo tên Tướng và Chi
 */
export function getTamAnPhuExactEntry(generalName: string, branch: string): {
  general: TamAnPhuGeneral;
  entry?: TamAnPhuEntry;
} | undefined {
  if (!generalName || !branch) return undefined;
  const rawName = generalName.trim();
  const normName = normalizeGeneralName(rawName);

  // Chuẩn hóa Địa Chi: Tị -> Tỵ, Tí -> Tý, Mẹo -> Mão
  const rawBranch = branch.trim().replace(/[()\[\]{}:,.\s]/g, "");
  const normBranch = rawBranch === "Tị" ? "Tỵ" : rawBranch === "Tí" ? "Tý" : rawBranch === "Mẹo" ? "Mão" : rawBranch;

  const general = TAM_AN_PHU_EXACT_DATA.find(
    (g) =>
      g.name === normName ||
      g.name === rawName ||
      (g.name === "Câu Trần" && (rawName === "Câu Trận" || normName === "Câu Trận")) ||
      normName.includes(g.name) ||
      g.name.includes(normName)
  );
  if (!general) return undefined;

  const entry =
    general.cungVi[normBranch] ||
    general.cungVi[rawBranch] ||
    general.cungVi[branch.trim()];

  return { general, entry };
}
