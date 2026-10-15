import { HEXAGRAMS } from "../data/hexagrams";
import { BOOK_HEXAGRAMS, BookHexagramSummary } from "../data/bookHexagrams";
import { Hexagram } from "../types";

export interface DailyHexagramAdvice {
  hexNumber: number;
  title: string;
  headline: string;
  summary: string;
  favorable: string[]; // Việc nên làm
  unfavorable: string[]; // Việc nên tránh
  motto: string; // Lời dặn minh triết
  mindset: string; // Tâm thế cần giữ
}

// Bảng lời bình ngắn gọn chuyên sâu cho 64 quẻ Kinh Dịch
export const DAILY_HEXAGRAM_ADVICE_MAP: Record<number, DailyHexagramAdvice> = {
  1: {
    hexNumber: 1,
    title: "Càn Vi Thiên (Thuần Càn)",
    headline: "CƯƠNG KIỆN TRUNG CHÍNH",
    summary: "Hôm nay trường năng lượng dồi dào, sinh khí mạnh mẽ và sáng tạo vô tận. Thích hợp để bạn khởi đầu kế hoạch mới, ra quyết định then chốt và khẳng định bản lĩnh.",
    favorable: ["Chủ động hành động", "Khởi sự dự án lớn", "Giữ vững lập trường quang minh"],
    unfavorable: ["Tự phụ kiêu ngạo", "Độc đoán áp đặt", "Hành động khi chưa chuẩn bị"],
    motto: "Thiên hành kiện, quân tử dĩ tự cường bất tức — Trời vận hành mạnh mẽ không ngừng, bậc quân tử noi theo mà tự cường không nghỉ.",
    mindset: "Tự tin, quyết đoán nhưng luôn khiêm nhường để tránh 'kháng long hữu hối'.",
  },
  2: {
    hexNumber: 2,
    title: "Khôn Vi Địa (Thuần Khôn)",
    headline: "NHU THUẬN THÂN TRIỂN",
    summary: "Năng lượng hôm nay thiên về nuôi dưỡng, lắng nghe và tiếp nhận. Đây là ngày thuận theo hoàn cảnh, lấy nhu thắng cương, chậm mà chắc.",
    favorable: ["Lắng nghe & học hỏi", "Hỗ trợ đồng đội", "Dưỡng sinh, tĩnh tâm"],
    unfavorable: ["Tranh giành quyền dẫn đầu", "Bốc đồng mạo hiểm", "Gây xung đột trực diện"],
    motto: "Địa thế khôn, quân tử dĩ hậu đức tải vật — Đất dày nâng đỡ vạn vật, người có đức lớn bao dung tất cả.",
    mindset: "Mềm dẻo như nước, kiên định như đất; lấy sự bao dung làm sức mạnh lớn nhất.",
  },
  3: {
    hexNumber: 3,
    title: "Thủy Lôi Truân",
    headline: "KHỞI THỦY GIAN NAN",
    summary: "Mọi việc ở giai đoạn manh nha ban đầu ắt gặp chút trắc trở hoặc bối rối. Hãy kiên nhẫn tích lũy từng bước, chớ vội nản lòng trước khó khăn bước đầu.",
    favorable: ["Xây dựng nền móng", "Tìm kiếm người hướng dẫn", "Kiên nhẫn quan sát"],
    unfavorable: ["Nóng vội muốn thấy kết quả", "Bỏ cuộc giữa chừng", "Hành động thiếu kế hoạch"],
    motto: "Vạn sự khởi đầu nan — mầm cây non xuyên qua đất cằn vươn lên đón ánh sáng.",
    mindset: "Bình tĩnh trước hỗn loạn, từng bước vững chãi tháo gỡ từng nút thắt.",
  },
  4: {
    hexNumber: 4,
    title: "Sơn Thủy Mông",
    headline: "KHAI MINH KHAI TRÍ",
    summary: "Hôm nay là thời điểm lý tưởng để học hỏi điều mới, khai mở nhận thức và hạ mình xin ý kiến từ bậc minh sư hay người có kinh nghiệm.",
    favorable: ["Đọc sách, nghiên cứu", "Xin lời khuyên tiền bối", "Thừa nhận điều chưa biết"],
    unfavorable: ["Giấu dốt, bảo thủ", "Hành động mò mẫm mù quáng", "Tự mãn hiểu biết nửa vời"],
    motto: "Không phải thầy cầu trò, mà trò phải thành tâm cầu thầy khai mở trí huệ.",
    mindset: "Tâm trí rỗng không như chiếc cốc sạch sẵn sàng đón nhận nước suối tri thức trong lành.",
  },
  5: {
    hexNumber: 5,
    title: "Thủy Thiên Nhu",
    headline: "KIÊN NHẪN CHỜ THỜI",
    summary: "Thời cơ chưa chín muồi hoàn toàn. Lời khuyên vàng cho hôm nay là an tâm chờ đợi, bồi dưỡng thể lực và tinh thần, chuẩn bị sẵn sàng khi gió thuận buồm xuôi.",
    favorable: ["Tích lũy thực lực", "Nghỉ ngơi bồi bổ sức khỏe", "Chuẩn bị hậu cần vững chắc"],
    unfavorable: ["Sốt ruột manh động", "Lo âu thái quá", "Đốt cháy giai đoạn"],
    motto: "Người có chí lớn biết chờ mây tụ đủ thành mưa, ung dung thưởng trà đợi thời cơ.",
    mindset: "Bình tâm dưỡng khí; chờ đợi trong tỉnh thức là cảnh giới cao nhất của hành động.",
  },
  6: {
    hexNumber: 6,
    title: "Thiên Thủy Tụng",
    headline: "HÒA GIẢI TRANH CHẤP",
    summary: "Hôm nay dễ nảy sinh bất đồng quan điểm hoặc hiểu lầm. Hãy chủ động lùi một bước để thấy trời cao biển rộng, dập tắt mầm mống tranh cãi ngay từ đầu.",
    favorable: ["Lắng nghe đối phương", "Chủ động hòa giải", "Ký kết văn bản minh bạch"],
    unfavorable: ["Hiếu thắng đôi co", "Theo đuổi kiện tụng thị phi", "Cố chấp bảo vệ cái tôi"],
    motto: "Tụng thì có việc hối hận; một điều nhịn bằng chín điều lành.",
    mindset: "Thắng một cuộc tranh cãi nhưng có thể mất một người bạn; hòa khí là phúc khí lớn nhất.",
  },
  7: {
    hexNumber: 7,
    title: "Địa Thủy Sư",
    headline: "KỶ LUẬT ĐOÀN ĐỘI",
    summary: "Hôm nay đòi hỏi tính kỷ luật cao độ, tổ chức bài bản và tinh thần hợp tác tập thể. Hãy gương mẫu, có trách nhiệm và giữ đúng nguyên tắc làm việc.",
    favorable: ["Lập kế hoạch chi tiết", "Đoàn kết đội ngũ", "Tuân thủ kỷ luật nghiêm minh"],
    unfavorable: ["Vô tổ chức, tùy hứng", "Lạm quyền, thiếu công bằng", "Chia rẽ nội bộ"],
    motto: "Quân đội không kỷ luật như đàn ong vỡ tổ; người có kỷ luật làm chủ được chính mình.",
    mindset: "Tác phong chuẩn mực, lãnh đạo bằng tấm gương chân chính và lòng trắc ẩn.",
  },
  8: {
    hexNumber: 8,
    title: "Thủy Địa Tỷ",
    headline: "THÂN THIỆN LIÊN KẾT",
    summary: "Ngày của sự gắn kết, tìm kiếm đối tác và xây dựng mối quan hệ tin cậy. Hãy mở rộng vòng tay, đối đãi chân thành để thu hút những người cùng chí hướng.",
    favorable: ["Gặp gỡ bạn hữu", "Hợp tác đối tác", "Giúp đỡ người xung quanh"],
    unfavorable: ["Đa nghi, cô lập bản thân", "Đến muộn lỡ duyên", "Lợi dụng lòng tin"],
    motto: "Nước thấm vào đất hòa làm một thể; chân thành đối đãi ắt gặp tri âm.",
    mindset: "Mở lòng tin yêu, xây cầu nối nhân duyên tốt đẹp trong từng cuộc gặp gỡ.",
  },
  9: {
    hexNumber: 9,
    title: "Phong Thiên Tiểu Súc",
    headline: "TÍCH LŨY NHỎ BỀN VỮNG",
    summary: "Chưa phải lúc làm việc kinh thiên động địa. Hãy tập trung giải quyết chu đáo từng việc nhỏ, tích gió thành bão, tích tiểu thành đại từng ngày.",
    favorable: ["Làm tốt việc chi tiết", "Tiết kiệm tích lũy", "Tu sửa, dọn dẹp không gian"],
    unfavorable: ["Kỳ vọng thành công lớn ngay", "Xem thường chi tiết nhỏ", "Vội vã vượt cấp"],
    motto: "Mây giăng dày đặc từ phương tây nhưng chưa thành mưa; cần kiên trì tích tụ từng giọt nước.",
    mindset: "Tỉ mỉ, chu đáo; thành tựu vĩ đại luôn bắt nguồn từ những việc nhỏ hoàn thành xuất sắc.",
  },
  10: {
    hexNumber: 10,
    title: "Thiên Trạch Lý",
    headline: "CẨN TRỌNG ĐẠO LỄ",
    summary: "Bước đi trên hoàn cảnh nhạy cảm (dẫm đuôi cọp mà cọp không cắn). Lấy sự lễ độ, khiêm nhường và khéo léo để hóa giải mọi hiểm nguy tiềm ẩn hôm nay.",
    favorable: ["Cư xử lịch thiệp, lễ độ", "Tôn trọng thứ bậc & quy tắc", "Thận trọng từng lời nói"],
    unfavorable: ["Cợt nhả, lỗ mãng", "Coi thường rủi ro", "Tỏ ra thông minh hơn người"],
    motto: "Dẫm đuôi cọp nhưng cọp không cắn vì lòng thành kính và thái độ đúng mực.",
    mindset: "Đi đứng thận trọng như bước trên băng mỏng, giữ lễ nghĩa làm tấm khiên hộ thân.",
  },
  11: {
    hexNumber: 11,
    title: "Địa Thiên Thái",
    headline: "HANH THÔNG THÁI BÌNH",
    summary: "Một trong những quẻ đại cát nhất! Trời Đất giao hòa, âm dương thông suốt. Thời vận vô cùng thuận lợi cho mọi mặt công việc, tài lộc và tình cảm.",
    favorable: ["Nắm bắt cơ hội", "Khai trương, ký kết, tỏ tình", "Mở rộng quy mô công việc"],
    unfavorable: ["Chủ quan lơ là", "Lãng phí thời gian vàng", "Tự mãn quên phòng ngừa tương lai"],
    motto: "Tiểu khứ đại lai, cát hanh — Cái nhỏ đi qua, cái lớn tốt lành ùa đến.",
    mindset: "Biết ơn và tận hưởng phúc lành, đồng thời gieo thêm hạt giống thiện lành cho mai sau.",
  },
  12: {
    hexNumber: 12,
    title: "Thiên Địa Bĩ",
    headline: "BẢO TỒN THỰC LỰC",
    summary: "Thời thế bế tắc, lòng người xa cách. Không nên gượng ép thúc đẩy những việc lớn lúc này. Hãy bảo tồn thực lực, giữ gìn phẩm hạnh và chờ đợi chu kỳ mới.",
    favorable: ["Ẩn nhẫn chờ thời", "Tu thân, dưỡng tính", "Bảo toàn vốn và tài sản"],
    unfavorable: ["Đâm đầu vào ngõ cụt", "Tham gia tranh giành quyền lực", "Khoe khoang tài sản"],
    motto: "Bĩ cực thái lai — sau cơn mưa trời lại sáng, thời đen tối qua đi ánh bình minh sẽ tới.",
    mindset: "Điềm tĩnh giữ mình, không vì ngoại cảnh hỗn loạn mà đánh mất bản tâm.",
  },
  13: {
    hexNumber: 13,
    title: "Thiên Hỏa Đồng Nhân",
    headline: "ĐỒNG TÂM HIỆP LỰC",
    summary: "Ngày rất tốt cho tình đồng chí, hội họp và kết nối cộng đồng. Hãy gạt bỏ định kiến cá nhân, tìm điểm tương đồng để cùng nhau hướng tới mục tiêu chung.",
    favorable: ["Hội thảo, gặp mặt bạn hữu", "Làm việc nhóm", "Tìm kiếm sự đồng thuận"],
    unfavorable: ["Cục bộ, bè phái nhỏ nhen", "Phân biệt đối xử", "Ghen ghét tị hiềm"],
    motto: "Đồng nhân vu dã, hanh — Tìm người cùng chí hướng chốn đồng nội, việc gì cũng hanh thông.",
    mindset: "Cùng nhìn về một hướng, lấy cái chung làm trọng, sẻ chia niềm vui và trách nhiệm.",
  },
  14: {
    hexNumber: 14,
    title: "Hỏa Thiên Đại Hữu",
    headline: "THU HOẠCH LỚN LAO",
    summary: "Mặt trời soi sáng giữa trời cao, thu hoạch phong phú cả về vật chất lẫn tinh thần. Hãy chia sẻ thành quả, hành thiện tích đức để phúc lộc được trường tồn.",
    favorable: ["Gặt hái thành quả", "Làm từ thiện, tri ân", "Quản lý tài chính thận trọng"],
    unfavorable: ["Khoe của, tự kiêu", "Bủn xỉn hẹp hòi", "Sa đà hưởng lạc quá độ"],
    motto: "Ngăn chặn điều ác, tuyên dương điều thiện, thuận theo mệnh trời mà hưởng trọn phúc lành.",
    mindset: "Sở hữu nhiều tài sản là gánh vác nhiều trách nhiệm cống hiến cho đời.",
  },
  15: {
    hexNumber: 15,
    title: "Địa Sơn Khiêm",
    headline: "KHIÊM TỐN TÍCH PHÚC",
    summary: "Quẻ duy nhất trong 64 quẻ cả 6 hào đều cát lợi! Càng khiêm tốn nhún nhường, phúc đức càng tự tìm đến. Núi cao giấu mình dưới lòng đất là tượng đại trí.",
    favorable: ["Lắng nghe người khác", "Tự xét khuyết điểm bản thân", "Tôn vinh công lao tập thể"],
    unfavorable: ["Tự đắc, phô trương", "Coi thường người dưới", "Tranh công đoạt lợi"],
    motto: "Khiêm tốn được người thương, trời giúp, đất chở che, quỷ thần kính phục.",
    mindset: "Bông lúa chín là bông lúa cúi đầu; người thực sự có tài luôn giữ phong thái mộc mạc.",
  },
  16: {
    hexNumber: 16,
    title: "Lôi Địa Dự",
    headline: "HỨNG KHỞI LẠC QUAN",
    summary: "Không khí ngày tràn ngập niềm vui, cảm hứng sáng tạo và sự chuẩn bị chu đáo. Hãy truyền năng lượng tích cực cho những người xung quanh nhưng chớ vui quá đà.",
    favorable: ["Tổ chức sự kiện, ăn mừng", "Sáng tạo nghệ thuật", "Lên dây cót tinh thần"],
    unfavorable: ["Vui chơi quên nhiệm vụ", "Ảo tưởng kế hoạch", "Chi tiêu bạt mạng"],
    motto: "Sấm động trên mặt đất sinh sôi niềm hứng khởi; có chuẩn bị kỹ càng thì niềm vui mới trọn vẹn.",
    mindset: "Lạc quan có căn cứ; nuôi dưỡng niềm vui lành mạnh và năng lượng tích cực mỗi ngày.",
  },
  17: {
    hexNumber: 17,
    title: "Trạch Lôi Tùy",
    headline: "TÙY THỜI THÍCH ỨNG",
    summary: "Biết tùy thời biến hóa, linh hoạt thích ứng với hoàn cảnh. Đừng cố chấp theo ý mình mà hãy lắng nghe xu thế của đám đông và tiếng gọi của tự nhiên.",
    favorable: ["Linh hoạt đổi mới", "Học cách thuận theo hoàn cảnh", "Nghỉ ngơi lấy lại nhịp sống"],
    unfavorable: ["Cố chấp nguyên tắc cũ", "Bảo thủ chống lại xu hướng", "Bắt chước mù quáng"],
    motto: "Tùy thời mà động, mặt trời lặn thì nghỉ ngơi, bình minh lên thì bắt đầu ngày mới.",
    mindset: "Mềm dẻo như nhành liễu trước gió, linh hoạt uyển chuyển không bao giờ gãy.",
  },
  18: {
    hexNumber: 18,
    title: "Sơn Phong Cổ",
    headline: "CẢI TỔ SỬA SAI",
    summary: "Đã đến lúc dọn dẹp những gì trì trệ, hỏng hóc hoặc tiêu cực đã tích tụ bấy lâu. Hãy dũng cảm nhìn thẳng vào sai lầm và quyết tâm cải tổ làm mới mọi mặt.",
    favorable: ["Dọn dẹp nhà cửa/bàn làm việc", "Khắc phục lỗi tồn đọng", "Từ bỏ thói quen xấu"],
    unfavorable: ["Dung túng sai phạm", "Lười biếng né tránh sự thật", "Chần chừ không dứt khoát"],
    motto: "Trước ba ngày suy xét, sau ba ngày hành động — cải biến triệt để để tái sinh tươi mới.",
    mindset: "Mỗi sai lầm nhận ra là một bước tiến gần hơn tới sự hoàn thiện và tự do.",
  },
  19: {
    hexNumber: 19,
    title: "Địa Trạch Lâm",
    headline: "TIẾP CẬN CƠ HỘI",
    summary: "Dương khí đang lớn mạnh dần, cơ hội đang tiến đến gần cửa nhà bạn. Hãy chủ động đón nhận, nhiệt tình chăm sóc công việc và đối xử ân cần với người dưới.",
    favorable: ["Gặp gỡ cấp dưới/khách hàng", "Bắt tay thực hiện dự án", "Ân cần quan tâm gia đình"],
    unfavorable: ["Thờ ơ bỏ lỡ thời cơ", "Kiêu ngạo khi có chút quyền lực", "Lười nhác bỏ bê"],
    motto: "Mùa xuân đang về, vạn vật hồi sinh; hãy nắm lấy thời cơ khi vận may đang hé mở.",
    mindset: "Thân thiện, bao dung và luôn sẵn sàng hành động khi cánh cửa mở ra.",
  },
  20: {
    hexNumber: 20,
    title: "Phong Địa Quan",
    headline: "QUAN SÁT TỈNH THỨC",
    summary: "Hôm nay cần tĩnh lặng để quán chiếu bản thân và quan sát toàn cảnh bức tranh lớn. Đừng vội phán xét hay hành động gấp; sự sáng suốt đến từ việc lắng đọng tâm tư.",
    favorable: ["Thiền định, tự soi xét mình", "Quan sát thị trường/xu hướng", "Làm gương cho người khác"],
    unfavorable: ["Phán xét hấp tấp", "Hành động thiếu quan sát", "Bị ngoại cảnh thao túng"],
    motto: "Gió thổi trên mặt đất, đi khắp muôn nơi để nhìn thấu mọi ngóc ngách nhân gian.",
    mindset: "Tĩnh lặng quan sát như mặt hồ phẳng lặng phản chiếu cả vầng trăng sáng tỏ.",
  },
  21: {
    hexNumber: 21,
    title: "Hỏa Lôi Phệ Hạp",
    headline: "TRỪ BỎ CHƯỚNG NGẠI",
    summary: "Có chướng ngại cản trở giữa hai bên cần phải dứt khoát loại trừ (như cắn đứt vật cản). Cần sự cương quyết, minh bạch và thực thi kỷ luật rõ ràng hôm nay.",
    favorable: ["Giải quyết dứt điểm khúc mắc", "Thực thi nguyên tắc nghiêm túc", "Làm rõ thỏa thuận hợp đồng"],
    unfavorable: ["Cả nể bao che", "Nương nhẹ với điều sai trái", "Nói nửa vời không dứt khoát"],
    motto: "Sấm chớp cùng nổi lên, pháp luật nghiêm minh để bảo vệ trật tự công bằng.",
    mindset: "Cương nghị, công minh, dám chịu trách nhiệm và hành động không do dự.",
  },
  22: {
    hexNumber: 22,
    title: "Sơn Hỏa Bí",
    headline: "TRANG NHÃ TỰ NHIÊN",
    summary: "Vẻ đẹp hình thức có thể điểm xuyết nhưng phẩm chất bên trong mới là cốt lõi. Hãy giữ nét trang nhã, mộc mạc và chân thực trong giao tiếp hôm nay.",
    favorable: ["Chăm chút trang phục lịch sự", "Thưởng thức nghệ thuật", "Giữ lời nói mộc mạc chân thành"],
    unfavorable: ["Hào nhoáng giả tạo", "Quá coi trọng bề ngoài", "Lừa dối bản thân và người khác"],
    motto: "Dưới chân núi có ngọn lửa sáng; vẻ đẹp cao quý nhất là vẻ đẹp của sự giản dị chân phương.",
    mindset: "Tâm hồn đẹp tự phát ra ánh sáng; không cần tô vẽ cầu kỳ vẫn tỏa ngát hương thơm.",
  },
  23: {
    hexNumber: 23,
    title: "Sơn Địa Bác",
    headline: "ẨN NHẪN THỦ THÀNH",
    summary: "Khí thế suy vi, những gì cũ kỹ đang rụng dần để chuẩn bị cho chu kỳ mới. Lúc này tuyệt đối không khởi công việc mạo hiểm, hãy an phận thủ thường và bảo vệ sức khỏe.",
    favorable: ["Phòng thủ an toàn", "Bảo dưỡng cơ thể", "Chấp nhận buông bỏ điều không hợp"],
    unfavorable: ["Cố chấp cưỡng cầu", "Đầu tư rủi ro cao", "Tin lời dèm pha"],
    motto: "Trái cây cuối mùa còn vương trên cành cao; người quân tử biết giữ mình chờ thời tái sinh.",
    mindset: "Buông bỏ để tái sinh; chấp nhận mất mát tạm thời để chuẩn bị cho mùa vụ mới.",
  },
  24: {
    hexNumber: 24,
    title: "Địa Lôi Phục",
    headline: "BÌNH MINH TRỞ LẠI",
    summary: "Ánh sáng đã quay trở lại sau đêm trường tăm tối! Một tia hy vọng mới, một cơ hội tái khởi động. Hãy bắt đầu lại từ những bước nhỏ nhẹ nhàng và vững chắc.",
    favorable: ["Khởi động lại thói quen tốt", "Làm hòa sau hiểu lầm", "Bắt đầu dự án mới từng bước"],
    unfavorable: ["Vội vàng quá mức", "Lặp lại vết xe đổ cũ", "Nghi ngờ tương lai"],
    motto: "Bảy ngày quay trở lại; sấm vang trong lòng đất báo hiệu mùa xuân tái sinh.",
    mindset: "Đón nhận khởi đầu mới với lòng biết ơn và sự cẩn trọng tinh khôi.",
  },
  25: {
    hexNumber: 25,
    title: "Thiên Lôi Vô Vọng",
    headline: "CHÂN THẬT TỰ NHIÊN",
    summary: "Hành sự thuận theo tự nhiên, chân thành không toan tính vụ lợi mờ ám. Nếu giữ tâm trong sáng thì không có tai họa; nếu mưu toan gian trá ắt rước lấy thất bại.",
    favorable: ["Chân thật trong mọi việc", "Thuận theo lẽ phải", "Giúp đỡ không cầu đền đáp"],
    unfavorable: ["Toan tính vụ lợi xảo quyệt", "Nghĩ một đằng làm một nẻo", "Mộng tưởng hão huyền"],
    motto: "Dưới trời có tiếng sấm vang; người vô tư lự thì trời đất chở che.",
    mindset: "Hành sự hết lòng, kết quả để tùy duyên; sống chân thật là lá bùa bình an lớn nhất.",
  },
  26: {
    hexNumber: 26,
    title: "Sơn Thiên Đại Súc",
    headline: "TÍCH LŨY ĐỨC TÀI",
    summary: "Khả năng tích lũy to lớn cả về kiến thức, đạo đức và tài chính. Hôm nay là ngày học hỏi các tấm gương tiền nhân, rèn luyện ý chí và chờ đợi thời cơ lớn.",
    favorable: ["Đọc sách lịch sử, triết học", "Tích lũy tài chính", "Rèn luyện kỷ luật bản thân"],
    unfavorable: ["Ăn xổi ở thì", "Tự mãn tài năng non trẻ", "Chi tiêu hoang phí"],
    motto: "Trong núi chứa cả bầu trời; bậc quân tử học rộng nhớ nhiều để bồi dưỡng đức hạnh.",
    mindset: "Tĩnh lặng gom góp ngàn dặm cát để đắp thành núi cao trí huệ.",
  },
  27: {
    hexNumber: 27,
    title: "Sơn Lôi Di",
    headline: "DƯỠNG THÂN DƯỠNG KHÍ",
    summary: "Coi trọng việc nuôi dưỡng: Chú ý lời ăn tiếng nói (những gì phát ra từ miệng) và dinh dưỡng ăn uống (những gì nạp vào miệng). Cả thân thể lẫn tâm trí đều cần được chăm sóc lành mạnh.",
    favorable: ["Ăn uống thanh đạm, lành mạnh", "Nói lời ái ngữ xây dựng", "Chọn lọc thông tin tiếp nhận"],
    unfavorable: ["Ăn uống vô độ, chất kích thích", "Phát ngôn bừa bãi thị phi", "Xem nội dung độc hại"],
    motto: "Xem cách người ta nuôi dưỡng bản thân và người khác sẽ biết được phẩm giá của họ.",
    mindset: "Thức ăn lành mạnh nuôi dưỡng thân; tư tưởng trong sáng nuôi dưỡng tâm hồn.",
  },
  28: {
    hexNumber: 28,
    title: "Trạch Phong Đại Quá",
    headline: "GÁNH VÁC ĐẠI TRỌNG",
    summary: "Áp lực quá lớn đè nặng (xà nhà oằn xuống vì quá tải). Hôm nay đòi hỏi sự can đảm, quyết đoán phi thường để chống đỡ tình thế. Hãy tìm điểm tựa và giảm tải kịp thời.",
    favorable: ["Dũng cảm đối mặt áp lực", "Chia sẻ gánh nặng với người khác", "Loại bỏ những việc không cần thiết"],
    unfavorable: ["Cố chấp ôm đồm một mình", "Sợ hãi trốn tránh", "Hoảng loạn đưa ra quyết định sai"],
    motto: "Cây đứng độc lập không sợ hãi; bậc quân tử ung dung giữa muôn trùng sóng gió.",
    mindset: "Bản lĩnh tôi luyện qua thử thách; khi áp lực lớn nhất cũng là lúc sức mạnh bên trong thức tỉnh.",
  },
  29: {
    hexNumber: 29,
    title: "Thuần Khảm (Khảm Vi Thủy)",
    headline: "VƯỢT QUA HIỂM TRỞ",
    summary: "Nước sâu hiểm trở, trùng trùng thử thách. Đừng hoảng sợ thoái lui, hãy giữ tâm trong sáng vững vàng như dòng nước, bền bỉ chảy qua mọi khe đá để tới đích.",
    favorable: ["Giữ vững niềm tin", "Thận trọng từng bước đi", "Kiên trì đối mặt sự thật"],
    unfavorable: ["Hành động liều lĩnh", "Mất bình tĩnh hoảng sợ", "Oán trách số phận"],
    motto: "Nước chảy không ngừng nghỉ, qua chỗ sâu mà không chìm; giữ lòng chân thành ắt vượt qua hiểm cảnh.",
    mindset: "Tâm định thì hiểm nguy biến thành bài học quý giá rèn luyện ý chí thép.",
  },
  30: {
    hexNumber: 30,
    title: "Thuần Ly (Ly Vi Hỏa)",
    headline: "SÁNG SUỐT KHAI MINH",
    summary: "Ánh lửa bừng sáng soi rọi vạn vật! Trí tuệ mẫn tiệp, mắt nhìn sáng suốt. Hãy gắn kết với những điều chính đáng, duy trì ngọn lửa nhiệt huyết và lan tỏa sự ấm áp.",
    favorable: ["Học tập, sáng tạo", "Làm rõ những điều mập mờ", "Thể hiện lòng tốt với người thân"],
    unfavorable: ["Nóng nảy thiêu rụi hòa khí", "Bốc hỏa vô cớ", "Phụ thuộc vào điều tiêu cực"],
    motto: "Mặt trời và mặt trăng nương tựa vào bầu trời; ngọn lửa cần củi tốt để sáng mãi không tàn.",
    mindset: "Dùng trí tuệ thắp sáng tương lai, dùng trái tim ấm áp sưởi ấm lòng người.",
  },
  31: {
    hexNumber: 31,
    title: "Trạch Sơn Hàm",
    headline: "GIAO CẢM CHÂN THÀNH",
    summary: "Sự rung động chân thành giữa hai trái tim, sự đồng điệu tâm hồn. Hôm nay rất thuận cho tình duyên, kết bạn và thấu hiểu lẫn nhau mà không cần quá nhiều lời.",
    favorable: ["Bày tỏ tình cảm", "Lắng nghe trực giác", "Hòa hợp trong các mối quan hệ"],
    unfavorable: ["Tính toán lạnh lùng", "Vội vã đòi hỏi đối phương", "Giả vờ cảm xúc"],
    motto: "Hồ nước trên đỉnh núi thấm nhuần lòng đất; tâm chân thành ắt chạm đến vạn trái tim.",
    mindset: "Lắng nghe bằng cả trái tim, đón nhận sự đồng điệu kỳ diệu của nhân duyên.",
  },
  32: {
    hexNumber: 32,
    title: "Lôi Phong Hằng",
    headline: "BỀN BỈ DÀI LÂU",
    summary: "Đức tính kiên trì, thủy chung và nhất quán là chìa khóa hôm nay. Giữ vững mục tiêu ban đầu, không đứng núi này trông núi nọ, kiên định trên con đường đã chọn.",
    favorable: ["Duy trì thói quen tốt", "Chung thủy trong tình cảm", "Kiên định thực hiện kế hoạch"],
    unfavorable: ["Cả thèm chóng chán", "Thay đổi xoành xoạch", "Bỏ dở mục tiêu giữa chừng"],
    motto: "Sấm gió cùng tồn tại dài lâu; người kiên định đi đến cuối con đường sẽ thấy đích đến.",
    mindset: "Sự kiên trì bình dị qua năm tháng tạo nên sức mạnh vĩ đại nhất của đời người.",
  },
  33: {
    hexNumber: 33,
    title: "Thiên Sơn Độn",
    headline: "LÙI BƯỚC KHÔN NGOAN",
    summary: "Thế bất lợi, tiểu nhân đang lấn lướt. Lùi lại một bước không phải hèn nhát mà là sự khôn ngoan giữ gìn sinh khí. Tránh xa thị phi và các cuộc đối đầu vô bổ hôm nay.",
    favorable: ["Rút lui êm đẹp", "Giữ khoảng cách với kẻ xấu", "Tạm hoãn các tranh chấp"],
    unfavorable: ["Cố đấm ăn xôi", "Hiếu chiến đôi co", "Lưu luyến hư danh"],
    motto: "Dưới trời có núi cao lùi về sau; bậc quân tử lánh xa thị phi mà không đem lòng oán hận.",
    mindset: "Biết tiến là dũng khí, biết thoái là đại trí; lui lại để nhìn rõ hơn con đường phía trước.",
  },
  34: {
    hexNumber: 34,
    title: "Lôi Thiên Đại Tráng",
    headline: "SỨC MẠNH CHÍNH TRỰC",
    summary: "Sức mạnh dương khí đang cực kỳ sung mãn. Tuy nhiên, sức mạnh lớn phải đi kèm đạo đức và sự kiềm chế. Đừng như chú dê húc bờ rào mà mắc kẹt sừng (đê xúc phiên).",
    favorable: ["Làm việc thiện quả quyết", "Bảo vệ lẽ phải", "Tự chủ kiềm chế năng lượng"],
    unfavorable: ["Dùng vũ lực hay quyền lực chèn ép", "Hành động thô bạo", "Tự tin thái quá"],
    motto: "Sấm vang trên trời cao; bậc quân tử không đi vào con đường trái với quy chuẩn đạo đức.",
    mindset: "Sức mạnh thực sự nằm ở khả năng kiểm soát chính mình chứ không phải áp đảo kẻ khác.",
  },
  35: {
    hexNumber: 35,
    title: "Hỏa Địa Tấn",
    headline: "THĂNG TIẾN RỰC RỠ",
    summary: "Mặt trời mọc lên khỏi mặt đất, thời vận thăng tiến sáng sủa. Công việc hanh thông, được cấp trên hoặc quý nhân ghi nhận và trao gửi trọng trách.",
    favorable: ["Báo cáo thành quả", "Nhận nhiệm vụ mới", "Lan tỏa năng lượng tích cực"],
    unfavorable: ["Rụt rè bỏ lỡ cơ hội", "Kiêu căng tự mãn", "Đố kỵ thành công của người khác"],
    motto: "Mặt trời nhô lên chiếu rọi đại địa; người quân tử tự làm sáng tỏ đức hạnh của mình.",
    mindset: "Đón nhận thành công với tâm thế phụng sự và lòng biết ơn sâu sắc.",
  },
  36: {
    hexNumber: 36,
    title: "Địa Hỏa Minh Di",
    headline: "GIẤU SÁNG TRONG ĐÊM",
    summary: "Ánh sáng chìm sâu vào lòng đất, thời kỳ đen tối hoặc chịu hiểu lầm. Hãy giấu tài chờ thời (Minh Di), bên ngoài nhẫn nhục hòa nhã nhưng bên trong giữ trọn tâm sáng.",
    favorable: ["Kín tiếng, khiêm nhường", "Bảo toàn ngọn lửa niềm tin", "Tránh phô trương tài năng"],
    unfavorable: ["Ra mặt tranh cãi", "Tự làm nổi bật giữa chốn nguy hiểm", "Bi quan tuyệt vọng"],
    motto: "Như Văn Vương bị giam ở Dữu Lý, bên ngoài hòa hoãn bên trong kiên định đạo sáng.",
    mindset: "Đêm càng tối thì sao càng sáng; giữ trọn niềm tin thuần khiết đợi ngày rạng đông.",
  },
  37: {
    hexNumber: 37,
    title: "Phong Hỏa Gia Nhân",
    headline: "GIA ĐẠO BÌNH AN",
    summary: "Gốc rễ của vạn sự nằm ở gia đình và nội bộ. Hôm nay hãy dành thời gian chăm sóc tổ ấm, vun vén tình thân, giữ nếp nhà hòa thuận và làm tròn bổn phận.",
    favorable: ["Bữa cơm sum họp gia đình", "Lắng nghe tâm sự người thân", "Giữ lời hứa trong nhà"],
    unfavorable: ["Cáu gắt với người thân", "Bỏ bê trách nhiệm gia đình", "Mang bực bội bên ngoài về nhà"],
    motto: "Gió thổi từ ngọn lửa bốc lên; lời nói có căn cứ, việc làm có thủy chung thì nhà ắt yên.",
    mindset: "Gia hòa vạn sự hưng — ngôi nhà ấm êm là bến đỗ bình yên nhất của đời người.",
  },
  38: {
    hexNumber: 38,
    title: "Hỏa Trạch Khuê",
    headline: "HÒA HỢP TRONG KHÁC BIỆT",
    summary: "Hai bên có góc nhìn đối nghịch hoặc bất đồng quan điểm (Lửa bốc lên, Đầm chảy xuống). Hãy tôn trọng sự khác biệt của nhau, tìm kiếm điểm chung trong việc nhỏ.",
    favorable: ["Tôn trọng quan điểm đối lập", "Làm những việc độc lập", "Tìm kiếm sự dung hòa"],
    unfavorable: ["Ép người khác giống mình", "Tranh cãi gay gắt", "Cực đoan chia rẽ"],
    motto: "Dù chí hướng khác biệt nhưng vẫn cùng chia sẻ một bầu trời; đồng nhi bất hòa.",
    mindset: "Sự phong phú của thế giới nằm ở chỗ muôn màu muôn vẻ; tôn trọng dị biệt là biểu hiện của trí tuệ.",
  },
  39: {
    hexNumber: 39,
    title: "Thủy Sơn Kiển",
    headline: "DỪNG LẠI XÉT MÌNH",
    summary: "Phía trước là vực sâu hiểm trở, sau lưng là núi cao chắn lối. Thấy nguy nan thì dừng lại tự xét lỗi mình, tìm kiếm sự tương trợ từ bậc trưởng bối tài ba.",
    favorable: ["Tạm dừng kế hoạch", "Tự kiểm điểm sai sót", "Tìm kiếm lời khuyên chuyên gia"],
    unfavorable: ["Cố tình lao vào nguy hiểm", "Đổ lỗi cho người khác", "Hành động trong hoảng loạn"],
    motto: "Thấy hiểm nguy biết dừng lại là trí; tự xét sửa lỗi mình là đức.",
    mindset: "Chậm lại một nhịp để nhìn thấu bản thân, không có con đường cùng với người biết dừng đúng lúc.",
  },
  40: {
    hexNumber: 40,
    title: "Lôi Thủy Giải",
    headline: "GIẢI TỎA ÁP LỰC",
    summary: "Mưa rào sấm nổ xua tan oi bức, khúc mắc bấy lâu được tháo gỡ! Hãy tha thứ cho lỗi lầm cũ, mở rộng lòng khoan dung và nhanh chóng đưa mọi việc về trạng thái bình thường.",
    favorable: ["Tha thứ, bỏ qua hiềm khích", "Giải quyết dứt điểm nợ nần", "Thư giãn xả stress"],
    unfavorable: ["Bới móc chuyện đã qua", "Dây dưa không chịu buông", "Nghi ngờ sau khi đã hòa giải"],
    motto: "Sấm sét xua tan mây mù; khoan thứ cho lỗi lầm của tha nhân là giải thoát cho chính mình.",
    mindset: "Nhẹ nhõm trút bỏ gánh nặng quá khứ, hân hoan bước đi dưới bầu trời trong lành mới mẻ.",
  },
  41: {
    hexNumber: 41,
    title: "Sơn Trạch Tổn",
    headline: "BỚT TƯ DỤC BỒI ĐỨC",
    summary: "Bớt cái xấu để thêm cái tốt, bớt lòng tham để thêm phúc đức. Biết hy sinh lợi ích nhỏ trước mắt để đổi lấy lợi ích lâu dài và sự thanh thản tâm hồn.",
    favorable: ["Tiết chế ham muốn", "Bố thí, chia sẻ tài vật", "Giản dị hóa cuộc sống"],
    unfavorable: ["Tham lam vơ vét", "Ích kỷ hẹp hòi", "Tức giận vì mất mát nhỏ"],
    motto: "Bớt giận dữ, kiềm chế dục vọng; hai giỏ tre đựng cơm đạm bạc vẫn dâng cúng trời đất được.",
    mindset: "Cho đi là còn mãi; giảm bớt dục vọng là mở rộng dung lượng chứa đựng hạnh phúc.",
  },
  42: {
    hexNumber: 42,
    title: "Phong Lôi Ích",
    headline: "TĂNG TRƯỞNG PHÚC LỢI",
    summary: "Gió sấm cùng gia tăng sức mạnh, thời kỳ sinh sôi và thăng hoa! Thấy điều thiện thì theo ngay, thấy lỗi lầm thì sửa liền. Hãy mang lại lợi ích cho cộng đồng.",
    favorable: ["Học tập tiến bộ", "Mở rộng kinh doanh", "Làm việc thiện giúp đỡ người nghèo"],
    unfavorable: ["Ích kỷ gom về một mình", "Chần chừ khi thấy việc tốt", "Bỏ qua lỗi lầm nhỏ"],
    motto: "Thấy điều thiện thì học theo, thấy lỗi lầm thì sửa đổi; gió sấm tương trợ ngàn dặm xuân phong.",
    mindset: "Không ngừng hoàn thiện bản thân mỗi ngày, lan tỏa lợi lạc đến mọi người chung quanh.",
  },
  43: {
    hexNumber: 43,
    title: "Trạch Thiên Quái",
    headline: "DỨT KHOÁT LOẠI ÁC",
    summary: "Dương khí áp đảo, thời điểm phải công khai dứt khoát đoạn tuyệt với thói hư tật xấu. Hành sự phải đàng hoàng, minh bạch, tránh dùng mưu hèn kế bẩn.",
    favorable: ["Tuyên bố rõ ràng lập trường", "Chấm dứt mối quan hệ độc hại", "Công khai minh bạch tài chính"],
    unfavorable: ["Lén lút dùng thủ đoạn", "Chần chừ dây dưa với điều xấu", "Quá khích gây đổ vỡ lớn"],
    motto: "Đầm nước bốc hơi lên trời cao; công khai sự thật nhưng luôn giữ trọn đức khoan dung.",
    mindset: "Rõ ràng, dứt khoát, quang minh chính đại như ánh mặt trời chiếu rọi mọi ngóc ngách.",
  },
  44: {
    hexNumber: 44,
    title: "Thiên Phong Cấu",
    headline: "CẢNH GIÁC BẤT NGỜ",
    summary: "Cuộc tương phùng bất ngờ, nhưng có mầm mống tiêu cực mới nảy sinh (một hào Âm mới xuất hiện). Cần thận trọng trước những lời đường mật hay sự cám dỗ nhất thời.",
    favorable: ["Tỉnh táo trước cám dỗ", "Đề phòng tiểu nhân tiếp cận", "Giữ vững nguyên tắc cốt lõi"],
    unfavorable: ["Bị lời tâng bốc mê hoặc", "Nhẹ dạ cả tin", "Bắt đầu những thói quen xấu"],
    motto: "Gió thổi dưới gầm trời; chớ vội vàng kết duyên với kẻ không rõ nguồn cơn đạo đức.",
    mindset: "Giữ tâm trí sáng suốt; nhận diện nguy cơ ngay từ khi nó mới chỉ là một đốm lửa nhỏ.",
  },
  45: {
    hexNumber: 45,
    title: "Trạch Địa Tụy",
    headline: "TỤ HỘI TINH HOA",
    summary: "Mọi nguồn lực, con người và tài lộc tụ hội về một mối. Để duy trì sự tụ họp bền vững, cần có người lãnh đạo đức độ, tinh thần cúng tế thiêng liêng và kỷ luật chung.",
    favorable: ["Tụ họp nhóm/đoàn thể", "Huy động vốn/nguồn lực", "Cúng lễ tổ tiên tạ ơn"],
    unfavorable: ["Tụ tập nhảm nhí buôn chuyện", "Không có sự chuẩn bị chu đáo", "Chia rẽ sau hội họp"],
    motto: "Hồ nước tụ lại trên mặt đất; chuẩn bị binh khí đề phòng bất trắc trong lúc vui vầy.",
    mindset: "Tụ họp vì mục đích cao cả; tạo dựng niềm tin vững chắc để mọi người an tâm gắn kết.",
  },
  46: {
    hexNumber: 46,
    title: "Địa Phong Thăng",
    headline: "TỪNG BƯỚC LÊN CAO",
    summary: "Mầm cây vươn lên từng tấc trong lòng đất, tiến triển vững chắc và êm đềm. Hãy kiên trì leo từng bậc thang, tìm gặp người nâng đỡ có tầm nhìn để bay cao hơn.",
    favorable: ["Kiên nhẫn học tập thăng tiến", "Tiếp cận cấp trên xin hướng dẫn", "Đi về hướng Nam thuận lợi"],
    unfavorable: ["Đốt cháy giai đoạn nhảy cóc", "Nghi ngờ năng lực bản thân", "Ngủ quên trên thành tích"],
    motto: "Cây lớn sinh trưởng từ đất; bậc quân tử tích lũy điều nhỏ để thành tựu việc lớn cao vời.",
    mindset: "Mỗi ngày tiến bộ một chút; kiên định không ngừng nghỉ ắt chạm tới đỉnh cao.",
  },
  47: {
    hexNumber: 47,
    title: "Trạch Thủy Khốn",
    headline: "THỬ THÁCH Ý CHÍ",
    summary: "Hồ cạn kiệt nước, tình cảnh khốn cùng thử thách bản lĩnh tột cùng. Lúc này nói nhiều không ai tin, chỉ có hành động âm thầm và ý chí sắt đá mới cứu vãn được tình thế.",
    favorable: ["Ít nói, làm nhiều", "Chấp nhận khó khăn rèn ý chí", "Giữ vững tiết tháo thanh sạch"],
    unfavorable: ["Than vãn kể khổ", "Biện bạch vô ích", "Làm điều sai quấy để thoát nghèo"],
    motto: "Khốn cùng là thước đo lòng dạ bậc quân tử; vàng thật không sợ lửa đỏ.",
    mindset: "Ý chí không khuất phục trước nghịch cảnh; sau cơn bão lớn cây tùng bách càng thêm xanh tươi.",
  },
  48: {
    hexNumber: 48,
    title: "Thủy Phong Tỉnh",
    headline: "GIẾNG NƯỚC NUÔI NGƯỜI",
    summary: "Giếng nước ngàn năm không đổi, nuôi sống muôn dân. Nhắc nhở ta về việc bồi dưỡng nguồn cội tri thức và đạo đức. Múc nước phải cẩn thận đừng làm vỡ gàu khi gần tới miệng giếng.",
    favorable: ["Bồi dưỡng chuyên môn sâu", "Chăm sóc phúc lợi chung", "Kiên nhẫn làm việc tới bước cuối"],
    unfavorable: ["Bỏ dở khi sắp thành công", "Làm ô nhiễm nguồn nước sạch", "Bỏ bê không tu sửa giếng xưa"],
    motto: "Giếng có thể đổi người nhưng mạch nước ngọt lành không bao giờ cạn; chia sẻ tri thức nuôi dưỡng nhân gian.",
    mindset: "Vun bồi chiều sâu nội tâm; giá trị đích thực luôn bền vững cùng thời gian.",
  },
  49: {
    hexNumber: 49,
    title: "Trạch Hỏa Cách",
    headline: "CẢI CÁCH ĐỔI MỚI",
    summary: "Thời điểm chín muồi để lột xác thay đổi triệt để (như da thú thay lông). Hãy dũng cảm vứt bỏ cái cũ đã lỗi thời để kiến tạo cái mới phù hợp với thời đại.",
    favorable: ["Đổi mới tư duy/quy trình", "Thay đổi môi trường sống/làm việc", "Công bố chính sách cải cách"],
    unfavorable: ["Bảo thủ níu kéo tàn dư cũ", "Đổi mới nửa vời thiếu lòng tin", "Cải cách khi chưa đủ duyên"],
    motto: "Thuận theo đạo trời, ứng với lòng người; cách mạng đổi mới đưa xã hội tiến lên văn minh.",
    mindset: "Dũng cảm lột xác đón nhận phiên bản mới rực rỡ hơn của chính mình.",
  },
  50: {
    hexNumber: 50,
    title: "Hỏa Phong Đỉnh",
    headline: "ĐỈNH NỒI LUYỆN TÀI",
    summary: "Chiếc Đỉnh linh thiêng nấu luyện đồ cúng tế, tượng trưng cho sự ổn định, nuôi dưỡng nhân tài và thành tựu đỉnh cao văn hóa. Hãy trọng dụng hiền tài và trau dồi phẩm hạnh.",
    favorable: ["Bồi dưỡng thế hệ kế cận", "Xác lập vị thế vững chắc", "Đầu tư cho tri thức đỉnh cao"],
    unfavorable: ["Làm gãy quai đỉnh vì bất cẩn", "Lãng phí đồ ăn tinh hoa", "Dùng người bất tài"],
    motto: "Củi nhóm dưới nồi đồng; bậc quân tử giữ vững vị trí để đón nhận mệnh trời giao phó.",
    mindset: "Biến bản thân thành chiếc đỉnh luyện vàng; vững vàng, tôn nghiêm và hữu ích cho đời.",
  },
  51: {
    hexNumber: 51,
    title: "Thuần Chấn (Chấn Vi Lôi)",
    headline: "SẤM ĐỘNG TỈNH THỨC",
    summary: "Tiếng sấm vang rền làm kinh động trăm dặm, mang đến sự bất ngờ hoặc biến cố. Đừng hoảng hốt; hãy giữ vững chén ngọc không rơi, tự xét mình sửa sai để đón lành tránh dữ.",
    favorable: ["Bình tĩnh trước biến động", "Rà soát lại toàn bộ quy trình", "Tỉnh thức trước những cảnh báo"],
    unfavorable: ["Hốt hoảng mất phương hướng", "Đổ lỗi khi xảy ra sự cố", "Lơ là xem nhẹ dấu hiệu cảnh báo"],
    motto: "Sấm vang làm người kinh sợ trăm dặm, nhưng bậc quân tử không làm rơi chén rượu tế lễ.",
    mindset: "Bất biến giữa vạn biến; tiếng sấm thức tỉnh ta khỏi những cơn mê muội tầm thường.",
  },
  52: {
    hexNumber: 52,
    title: "Thuần Cấn (Cấn Vi Sơn)",
    headline: "TĨNH LẶNG DỪNG LẠI",
    summary: "Núi đứng sừng sững bất động. Bài học lớn nhất hôm nay là biết điểm dừng (tri chỉ). Khi lòng tĩnh lặng không vọng tưởng thì mọi sự bình an, không vướng bận thị phi.",
    favorable: ["Tĩnh tâm, thiền định", "Dừng lại không can thiệp", "Giữ tâm ý bất động"],
    unfavorable: ["Chạy lăng xăng vô định", "Nhiều chuyện xía vào việc khác", "Không chịu ngồi yên một chỗ"],
    motto: "Núi chồng lên núi; bậc quân tử suy nghĩ không vượt quá vị trí phận sự của mình.",
    mindset: "Biết dừng đúng lúc là đỉnh cao của tự chủ; tĩnh lặng là cội nguồn của mọi sức mạnh.",
  },
  53: {
    hexNumber: 53,
    title: "Phong Sơn Tiệm",
    headline: "TIẾN TỪNG BƯỚC VỮNG",
    summary: "Như chim nhạn bay về phương nam từng chặng nghỉ ngơi. Tiến từng bước theo đúng trình tự lễ nghi, không đốt cháy giai đoạn. Rất tốt cho hôn nhân và sự nghiệp bền lâu.",
    favorable: ["Làm theo đúng quy trình", "Bồi đắp tình cảm từ từ", "Tôn trọng các bước truyền thống"],
    unfavorable: ["Cưới chạy tang, làm tắt", "Hấp tấp muốn nhanh", "Phá vỡ trật tự thứ bậc"],
    motto: "Cây mọc trên đỉnh núi lớn lên từng tấc; bậc quân tử lấy đức độ hoàn thiện phong tục tập quán.",
    mindset: "Chậm mà chắc; tiến từng bước vững vàng là con đường ngắn nhất tới thành công bền vững.",
  },
  54: {
    hexNumber: 54,
    title: "Lôi Trạch Quy Muội",
    headline: "CẨN TRỌNG NÔNG NỔI",
    summary: "Hành động theo cảm xúc bốc đồng, tình thế ở vào vị trí thứ yếu hoặc danh bất chính ngôn bất thuận. Cần xem xét lại động cơ, không nên tiến hành việc hôn nhân hay dự án lớn vội vàng.",
    favorable: ["Xem xét lại động cơ thực sự", "Chấp nhận vị trí phụ", "Tỉnh táo trước cám dỗ tình ái"],
    unfavorable: ["Hành sự theo cảm tính bốc đồng", "Khởi sự việc danh không chính", "Cam kết mù quáng"],
    motto: "Chinh hung, vô du lợi — Tiến bước lúc này ắt gặp hung họa, không có chút lợi ích nào.",
    mindset: "Tỉnh táo tách bạch cảm xúc và lý trí; danh chính ngôn thuận mới mong bền lâu.",
  },
  55: {
    hexNumber: 55,
    title: "Lôi Hỏa Phong",
    headline: "CỰC THỊNH NÊN PHÒNG",
    summary: "Thời kỳ đỉnh cao của sự sung túc, rực rỡ như mặt trời giữa trưa. Tuy nhiên mặt trời đứng bóng rồi sẽ lặn, hãy tận dụng thời cơ làm việc lớn và chuẩn bị cho lúc thoái trào.",
    favorable: ["Xử lý việc dứt khoát nhanh chóng", "Phân xử công minh", "Tận dụng đỉnh cao thời vận"],
    unfavorable: ["Ngủ quên trong vinh quang", "Lo âu trước quy luật suy tàn", "Bỏ lỡ ánh sáng ban trưa"],
    motto: "Mặt trời giữa trưa rồi sẽ xế bóng, trăng tròn rồi sẽ khuyết; bậc quân tử xử án công minh không thiên vị.",
    mindset: "Trân trọng từng khoảnh khắc huy hoàng; hành động dứt khoát khi thời cơ ở đỉnh cao.",
  },
  56: {
    hexNumber: 56,
    title: "Hỏa Sơn Lữ",
    headline: "LỮ KHÁCH THẬN TRỌNG",
    summary: "Tượng người khách lữ hành nơi đất khách quê người. Hãy giữ thái độ khiêm nhường, cẩn trọng trong từng lời nói, không phô trương tài sản và tôn trọng phong tục địa phương.",
    favorable: ["Khiêm tốn, hòa nhã", "Thận trọng khi đi xa", "Tìm nơi trú ngụ an toàn"],
    unfavorable: ["Khoe của chốn đông người", "Gây sự với người bản địa", "Bất cẩn làm mất giấy tờ/tài sản"],
    motto: "Ngọn lửa cháy trên sườn núi lướt qua nhanh; người lữ hành sáng suốt dùng hình phạt khoan hòa.",
    mindset: "Hành trang gọn nhẹ, tâm thế khiêm nhường; đi ngàn dặm đường bình an nhờ sự cẩn trọng.",
  },
  57: {
    hexNumber: 57,
    title: "Thuần Tốn (Tốn Vi Phong)",
    headline: "THẨM THẤU NHU THUẬN",
    summary: "Gió luồn qua mọi kẽ lá, sự thâm nhập nhẹ nhàng mà sâu sắc. Dùng lời nói khéo léo, kiên trì tác động mềm mỏng từng chút một sẽ đạt được kết quả kỳ diệu hơn sự áp đặt thô bạo.",
    favorable: ["Thuyết phục bằng lý lẽ nhẹ nhàng", "Kiên trì thực hiện mục tiêu", "Tham khảo ý kiến chuyên gia"],
    unfavorable: ["Thiếu quyết đoán do dự mãi", "Áp đặt mệnh lệnh thô bạo", "Thay đổi lập trường liên tục"],
    motto: "Gió nối tiếp gió thổi qua muôn phương; người quân tử ban bố mệnh lệnh đi sâu vào lòng người.",
    mindset: "Nhu hòa nhưng bền bỉ; lời nói chân thành như làn gió xuân làm tan chảy mọi băng giá.",
  },
  58: {
    hexNumber: 58,
    title: "Thuần Đoài (Đoài Vi Trạch)",
    headline: "VUI VẺ CHÂN THÀNH",
    summary: "Hai đầm nước tương trợ lẫn nhau, niềm vui gặp gỡ và sẻ chia. Hãy mang lại nụ cười chân thành cho mọi người, cùng bạn hữu đàm đạo học hỏi điều hay lẽ phải.",
    favorable: ["Gặp gỡ bạn bè thân thiết", "Thảo luận học thuật", "Mang lại niềm vui cho người khác"],
    unfavorable: ["Vui vẻ nịnh bợ giả tạo", "Sa đà tiệc tùng buông thả", "Nói lời châm chọc xúc phạm"],
    motto: "Hai đầm nước nối liền cùng thấm nhuần; bạn bè cùng nhau học tập thảo luận mở mang trí huệ.",
    mindset: "Niềm vui chân chính bắt nguồn từ sự sẻ chia và tâm hồn trong sáng không tì vết.",
  },
  59: {
    hexNumber: 59,
    title: "Phong Thủy Hoán",
    headline: "XUA TAN BẾ TẮC",
    summary: "Gió thổi trên mặt nước làm tan biến mây mù và sự ngăn cách bấy lâu. Hãy dẹp bỏ cái tôi nhỏ hẹp, cùng hướng về mục tiêu lớn và cứu vãn những rạn nứt trong quan hệ.",
    favorable: ["Xóa bỏ nghi kỵ hiềm khích", "Hướng về đức tin/tâm linh", "Đóng góp cho công việc chung"],
    unfavorable: ["Cố chấp bảo thủ cái tôi", "Gom vén lợi ích cá nhân", "Gây chia rẽ nội bộ"],
    motto: "Gió lướt trên mặt nước làm tan biến mọi ngăn cách; vua đến chốn đền miếu cầu nguyện an lành.",
    mindset: "Tan biến mọi định kiến hẹp hòi; dung nạp muôn dòng sông nhỏ để hòa vào biển lớn.",
  },
  60: {
    hexNumber: 60,
    title: "Thủy Trạch Tiết",
    headline: "TIẾT CHẾ CHỪNG MỰC",
    summary: "Đầm nước chứa nước phải có bờ cõi giới hạn, cây tre có đốt mới đứng thẳng được. Biết tiết chế chi tiêu, điều độ sinh hoạt và giữ đúng giới hạn sẽ mang lại sự an ổn lâu dài.",
    favorable: ["Lập ngân sách chi tiêu", "Ăn uống điều độ, ngủ đúng giờ", "Giữ chừng mực trong các mối quan hệ"],
    unfavorable: ["Hoang phí bừa bãi", "Khắt khe quá mức đến ngột ngạt", "Phá vỡ các giới hạn an toàn"],
    motto: "Tiết chế có chừng mực thì vui vẻ; tiết chế quá cay nghiệt thì không thể bền lâu.",
    mindset: "Tự do đích thực bắt nguồn từ sự tự giác tuân thủ kỷ luật và biết điểm dừng vừa đủ.",
  },
  61: {
    hexNumber: 61,
    title: "Phong Trạch Trung Phu",
    headline: "TÂM THÀNH CẢM ỨNG",
    summary: "Lòng thành thật từ đáy tim có thể cảm hóa cả loài heo cá. Trong mọi giao dịch hay mối quan hệ hôm nay, sự trung thực tuyệt đối là chìa khóa mở toang mọi cánh cửa khó khăn nhất.",
    favorable: ["Giữ chữ tín trọn vẹn", "Bộc bạch tâm tư chân thật", "Công minh xét xử không thiên vị"],
    unfavorable: ["Nói dối, mưu mẹo gian xảo", "Hứa suông không làm", "Đa nghi người chân thành"],
    motto: "Gió thổi trên mặt đầm; tâm thành chạm đến cả heo cá muông thú.",
    mindset: "Chân thành là đỉnh cao của trí tuệ; người giữ trọn chữ tín đi khắp thiên hạ không sợ cô đơn.",
  },
  62: {
    hexNumber: 62,
    title: "Lôi Sơn Tiểu Quá",
    headline: "CẨN THẬN VIỆC NHỎ",
    summary: "Như cánh chim nhỏ bay lượn chớ nên bay quá cao kẻo gặp bão. Hôm nay hãy chú trọng những việc nhỏ, chi tiêu tiết kiệm hơn bình thường, ăn nói khiêm nhường hơn bình thường.",
    favorable: ["Cẩn trọng từng tiểu tiết", "Chi tiêu tiết kiệm", "Làm tốt nhiệm vụ thường nhật"],
    unfavorable: ["Mưu sự chuyện to lớn vĩ đại", "Bay bổng quá tầm với", "Khinh suất chi tiết nhỏ"],
    motto: "Chim bay chớ ham bay cao, hạ thấp cánh bay thì an toàn; việc tang nên quá phần thương xót, chi tiêu nên quá phần tiết kiệm.",
    mindset: "Hạ thấp cái tôi, chú tâm từng bước nhỏ; tích lũy sự cẩn trọng nhỏ làm nên sự bình an lớn.",
  },
  63: {
    hexNumber: 63,
    title: "Thủy Hỏa Ký Tế",
    headline: "VIỆC ĐÃ HOÀN TẤT",
    summary: "Mọi việc đã vào guồng hoàn tất, âm dương đắc vị tuyệt đối. Tuy nhiên 'nước trên lửa' đạt đỉnh rồi thì dễ sinh sơ suất, cần cảnh giác nguy cơ suy thoái ngay giữa lúc thành công.",
    favorable: ["Kiểm tra bảo dưỡng thành quả", "Duy trì sự ổn định hiện tại", "Đề phòng rủi ro tiềm ẩn"],
    unfavorable: ["Chủ quan tự mãn", "Khởi sự việc mới mạo hiểm", "Buông lỏng quản lý"],
    motto: "Ban đầu cát lợi sau ắt loạn lạc; người quân tử nghĩ đến mối lo sau này để phòng ngừa từ sớm.",
    mindset: "Thành công hôm nay là khởi đầu cho thử thách giữ gìn ngày mai; luôn giữ tâm tỉnh thức cảnh giác.",
  },
  64: {
    hexNumber: 64,
    title: "Hỏa Thủy Vị Tế",
    headline: "CHƯA XONG MỞ LỐI MỚI",
    summary: "Quẻ cuối cùng khép lại 64 quẻ nhưng lại mở ra một chu kỳ bất tận mới! Sự nghiệp chưa hoàn tất như con cáo nhỏ lội qua sông ướt đuôi. Hãy tiếp tục kiên trì chuẩn bị cho hành trình mới.",
    favorable: ["Sắp đặt lại kế hoạch", "Chuẩn bị cho giai đoạn mới", "Kiên nhẫn hoàn thiện từng bước"],
    unfavorable: ["Hấp tấp qua sông khi chưa lượng sức", "Nản lòng vì chưa xong", "Vội vã tuyên bố kết thúc"],
    motto: "Lửa trên nước chưa giao hòa; người quân tử cẩn trọng phân định từng sự vật để xếp đặt đúng chỗ.",
    mindset: "Cuộc sống là dòng chảy bất tận; điểm kết thúc lại chính là khởi đầu của hành trình tươi đẹp mới.",
  },
};

// Hàm PRNG xác định quẻ ngẫu nhiên dựa trên lịch Dương (Năm, Tháng, Ngày)
export function getDailyHexagramNumberForDate(dateInput: Date | string): number {
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();

  // Seed kết hợp: YYYYMMDD
  const seed = year * 10000 + month * 100 + day;

  // Thuật toán MurmurHash3 / LCG băm số nguyên ra phân phối đều 1..64
  let h = Math.imul(seed ^ 0x6ac690c5, 0x5bd1e995);
  h = Math.imul(h ^ (h >>> 15), 0x5bd1e995);
  h ^= h >>> 13;

  const hexNumber = (Math.abs(h) % 64) + 1;
  return hexNumber;
}

// Hàm tính hào động đại diện cho ngày (1..6)
export function getDailyChangingLineForDate(dateInput: Date | string): number {
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();

  const seed = year * 10000 + month * 100 + day;
  let h = Math.imul(seed ^ 0x3d7b4291, 0x1b873593);
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
  h ^= h >>> 13;

  return (Math.abs(h) % 6) + 1;
}

export interface DailyHexagramResult {
  date: Date;
  dateKey: string; // YYYY-MM-DD
  dayOfWeekVi: string;
  solarDateFormatted: string;
  hexNumber: number;
  hexagram: Hexagram;
  bookSummary?: BookHexagramSummary;
  advice: DailyHexagramAdvice;
  changingLine: number;
  changingLineMeaning?: {
    line: number;
    name: string;
    text: string;
    meaning: string;
    detailedExplanation?: string;
  };
  isCustomRandom?: boolean; // Nếu người dùng tự bấm rút quẻ ngẫu nhiên cho chính mình hôm nay
}

const DAY_OF_WEEK_NAMES = [
  "Chủ Nhật",
  "Thứ Hai",
  "Thứ Ba",
  "Thứ Tư",
  "Thứ Năm",
  "Thứ Sáu",
  "Thứ Bảy",
];

export function getDailyHexagramData(
  dateInput: Date | string = new Date(),
  overrideHexNumber?: number
): DailyHexagramResult {
  const d = typeof dateInput === "string" ? new Date(dateInput) : new Date(dateInput.getTime());
  // Đảm bảo xử lý đúng ngày địa phương
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const dateKey = `${year}-${month}-${day}`;

  const dayOfWeekVi = DAY_OF_WEEK_NAMES[d.getDay()] || "Hôm nay";
  const solarDateFormatted = `${dayOfWeekVi}, ngày ${day} tháng ${month} năm ${year}`;

  const hexNumber = overrideHexNumber && overrideHexNumber >= 1 && overrideHexNumber <= 64
    ? overrideHexNumber
    : getDailyHexagramNumberForDate(d);

  const hexagram = HEXAGRAMS.find((h) => h.number === hexNumber) || HEXAGRAMS[0];
  const bookSummary = BOOK_HEXAGRAMS.find((b) => b.number === hexNumber);
  const advice = DAILY_HEXAGRAM_ADVICE_MAP[hexNumber] || {
    hexNumber,
    title: hexagram.name,
    headline: bookSummary?.redHeadline || "MINH TRIẾT HÔM NAY",
    summary: hexagram.overview,
    favorable: ["Giữ tâm thiện lương", "Hành sự cẩn trọng", "Lắng nghe trực giác"],
    unfavorable: ["Bốc đồng nóng vội", "Thất hứa", "Hành động thiếu quan sát"],
    motto: hexagram.judgment,
    mindset: hexagram.advice,
  };

  const changingLine = getDailyChangingLineForDate(d);
  const changingLineMeaning = hexagram.lineMeanings?.find((l) => l.line === changingLine);

  return {
    date: d,
    dateKey,
    dayOfWeekVi,
    solarDateFormatted,
    hexNumber,
    hexagram,
    bookSummary,
    advice,
    changingLine,
    changingLineMeaning,
    isCustomRandom: overrideHexNumber != null,
  };
}
