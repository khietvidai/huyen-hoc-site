export interface SpreadExampleCard {
  hexNumber: number;
  label: string;
  role: string;
  keyMeaning: string;
}

export interface SpreadExample {
  id: string;
  code: string;
  spreadType: "1_card" | "2_card" | "3_card" | "that_tinh" | "thap_tinh";
  spreadTypeName: string;
  spreadTypeShort: string;
  title: string;
  category: string;
  categoryColor: string;
  context: string;
  cards: SpreadExampleCard[];
  analysis: string;
  outcome: string;
  takeaway: string;
}

export const SPREAD_METHODS_SUMMARY = [
  {
    type: "1_card",
    name: "Phương Pháp Bói 1 Lá Bài",
    subName: "Đơn Quẻ Định Tâm • Khởi Ý Ban Đầu",
    desc: "Dành cho khi tâm trí có một nghi vấn cụ thể, cần một gợi mở tức thời, một thông điệp cốt lõi hoặc cái nhìn bao quát về bản chất hiện thời của sự việc.",
    steps: [
      "Tĩnh tâm, tập trung duy nhất vào một câu hỏi rõ ràng, không hỏi mập mờ hai ý.",
      "Xào bài đều tay với sự tập trung cao độ, sau đó rút 1 lá bài duy nhất.",
      "Đối chiếu Thoán từ, Đại tượng và ý nghĩa quái để tìm ra sách lược ứng biến.",
    ],
  },
  {
    type: "2_card",
    name: "Phương Pháp Bói 2 Lá Bài",
    subName: "Bản Quái & Biến Quái • Nhân & Quả • Lựa Chọn A/B",
    desc: "Dành cho việc dự đoán 2 giai đoạn phát triển liên hoàn (Lá 1 là Hiện tại / Căn nguyên; Lá 2 là Chuyển biến / Kết quả) hoặc Đặt lên bàn cân 2 phương án đối lập.",
    steps: [
      "Quy định rõ ràng ý nghĩa từng vị trí trước khi rút (ví dụ: Lá 1 là Điểm Khởi, Lá 2 là Đích Đến; hoặc Lá 1 là Chọn Ở Lại, Lá 2 là Chọn Đi).",
      "Rút lần lượt từng lá bài theo đúng thứ tự đã định tâm.",
      "Phân tích mối tương quan sinh khắc giữa 2 quẻ: Quẻ 1 dẫn dắt sang Quẻ 2 như thế nào, từ nguy hóa an hay từ an sinh nguy.",
    ],
  },
  {
    type: "3_card",
    name: "Phương Pháp Bói 3 Lá Bài",
    subName: "Dòng Thời Gian: Quá Khứ • Hiện Tại • Tương Lai",
    desc: "Dành cho việc khảo sát một chu kỳ vận động hoàn chỉnh của sự việc, dự án, hoặc tiến trình kinh tế - sự nghiệp xuyên suốt theo trục thời gian.",
    steps: [
      "Xác lập 3 mốc thời gian rõ rệt: Lá 1 (Quá khứ / Nguyên nhân), Lá 2 (Hiện tại / Trọng tâm), Lá 3 (Tương lai / Viễn cảnh).",
      "Trải 3 lá bài từ trái sang phải theo thứ tự thời gian.",
      "Xem xét quy luật chuyển dịch Âm Dương qua 3 quẻ để nhận diện chu kỳ Thịnh - Suy - Bĩ - Cực - Thái Lai.",
    ],
  },
];

export const SPREAD_EXAMPLES: SpreadExample[] = [
  {
    id: "example_a",
    code: "Ví Dụ A",
    spreadType: "1_card",
    spreadTypeName: "Phương Pháp 1 Lá Bài",
    spreadTypeShort: "Trải 1 Lá",
    title: "Dự đoán xu hướng thị trường chứng khoán VN-Index",
    category: "Tài Chính & Chứng Khoán",
    categoryColor: "text-emerald-400 border-emerald-800/60 bg-emerald-950/40",
    context:
      "Vào một buổi sáng giao dịch, chỉ số VN-Index tăng vọt gần 20 điểm với sắc xanh lan tỏa toàn thị trường, khối lượng giao dịch tăng cao, tâm lý nhà đầu tư vô cùng hưng phấn muốn mua đuổi. Tác giả đã tĩnh tâm gieo quẻ 1 lá để nhận định diễn biến đóng cửa của phiên giao dịch buổi chiều.",
    cards: [
      {
        hexNumber: 9,
        label: "Quẻ bốc được: Quẻ số 9",
        role: "Đơn Quẻ Phản Chiếu",
        keyMeaning: "Mật vân bất vũ (mây dày mà không mưa), sức bật hạn chế, chịu lực kìm hãm",
      },
    ],
    analysis:
      "Quẻ Phong Thiên Tiểu Súc có ngoại quái Tốn (Gió/Mộc) ở trên, nội quái Càn (Trời/Kim) ở dưới. Gió bay trên bầu trời cuộn mây dầy đặc nhưng chưa đủ điều kiện hội tụ để thành mưa rào lớn; toàn quẻ chỉ có duy nhất 1 hào Âm (Lục tứ) ở vị trí đắc trung nhưng phải nỗ lực kìm hãm 5 hào Dương xung quanh. Ý nghĩa Dịch học là 'tích lũy quy mô nhỏ, thế tiến bị chặn lại, sức bật tạm thời bị kiềm chế'.",
    outcome:
      "Đúng như dự báo của tượng Tiểu Súc, bước sang phiên chiều thị trường bất ngờ vấp phải áp lực bán chốt lời ngắn hạn ồ ạt từ các nhà đầu tư lớn. Đà tăng bốc đồng buổi sáng bị ghìm cương triệt để, chỉ số VN-Index thu hẹp đà tăng chỉ còn vỏn vẹn vài điểm khi kết phiên. Toàn bộ diễn biến diễn ra đúng như tượng 'mây đen giăng kín nhưng không thể mưa lớn'.",
    takeaway:
      "Khi gặp quẻ Tiểu Súc trong đầu tư hay kinh doanh, chớ để sự hưng phấn tức thời làm mờ mắt mà vội vàng tất tay. Lúc này lực cản còn lớn, nên giữ sách lược tích lũy nhỏ, thận trọng quan sát và chờ đợi khi nguyên khí tích đủ mới hành động lớn.",
  },
  {
    id: "example_b",
    code: "Ví Dụ B",
    spreadType: "1_card",
    spreadTypeName: "Phương Pháp 1 Lá Bài",
    spreadTypeShort: "Trải 1 Lá",
    title: "Thoát hiểm khủng hoảng cạnh tranh của nhà hàng ẩm thực",
    category: "Kinh Doanh & Khởi Nghiệp",
    categoryColor: "text-amber-400 border-amber-800/60 bg-amber-950/40",
    context:
      "Ông Lâm là chủ một nhà hàng ẩm thực truyền thống lâu năm. Gần đây, khu phố mọc lên hàng loạt quán ăn hiện đại với phong cách trẻ trung và công nghệ mới, khiến nhà hàng của ông rơi vào cảnh ế ẩm nghiêm trọng, doanh thu sụt giảm 60%. Đứng trước nguy cơ phá sản, ông bốc 1 lá bài xin lời khuyên cứu vãn tình thế.",
    cards: [
      {
        hexNumber: 49,
        label: "Quẻ bốc được: Quẻ số 49",
        role: "Đơn Quẻ Định Hướng",
        keyMeaning: "Cách cố đỉnh tân (lột xác bỏ cái cũ, kiến tạo cái mới), cải tổ triệt để mới hanh thông",
      },
    ],
    analysis:
      "Quẻ Trạch Hỏa Cách có ngoại quái Đoài (Đầm/Nước) ở trên, nội quái Ly (Lửa) ở dưới. Nước dập lửa, lửa đun nước, hai nguồn năng lượng tương tranh tạo nên một cuộc biến đổi sâu sắc và căn bản. Đạo của quẻ Cách khẳng định: những quy chuẩn, thói quen và lề lối cũ đã tích tụ bất cập đến cùng cực; nếu tiếp tục níu giữ tư duy cũ sẽ tự đào mồ chôn mình.",
    outcome:
      "Thấu suốt lời chỉ dẫn của quẻ Cách, ông Lâm dũng cảm tiến hành một cuộc 'cách mạng' toàn diện: thiết kế lại không gian nhà hàng vừa giữ nét mộc mạc truyền thống vừa tiện nghi hiện đại, tinh gọn thực đơn tập trung vào 5 món đặc sản độc bản, đào tạo lại toàn bộ quy chuẩn phục vụ thân thiện và mở kênh truyền thông ẩm thực số. Kết quả chỉ sau 2 tháng, nhà hàng lột xác ngoạn mục và lượng khách đông nghịt trở lại.",
    takeaway:
      "Kinh Dịch chỉ rõ: 'Cùng tắc biến, biến tắc thông, thông tắc cửu'. Khi hoàn cảnh thị trường đã xoay vần, kẻ cố chấp giữ nếp cũ ắt diệt vong. Người thức thời phải dám cắt bỏ cái cũ lỗi thời, tự làm mới mình đúng thời điểm thì mới chuyển nguy thành cơ hội vàng.",
  },
  {
    id: "example_c",
    code: "Ví Dụ C",
    spreadType: "2_card",
    spreadTypeName: "Phương Pháp 2 Lá Bài (Nhân & Quả / Bản Quái & Biến Quái)",
    spreadTypeShort: "Trải 2 Lá",
    title: "Suy đoán vận hạn và bước ngoặt trong 3 tháng tới",
    category: "Vận Hạn & Tiến Trình",
    categoryColor: "text-blue-400 border-blue-800/60 bg-blue-950/40",
    context:
      "Ông Trần liên tiếp gặp trắc trở trong công việc và các khoản đầu tư cá nhân, tiền bạc tắc nghẽn, tâm lý chán nản hoang mang. Ông quyết định gieo quẻ 2 lá theo cấu trúc: Lá 1 là Bản Quái (tình cảnh hiện tại) và Lá 2 là Biến Quái (xu thế chuyển biến trong 3 tháng tới) để biết mình nên làm gì.",
    cards: [
      {
        hexNumber: 3,
        label: "Lá 1: Bản Quái (Hiện Tại)",
        role: "Khởi Điểm / Căn Nguyên",
        keyMeaning: "Vạn sự khởi đầu nan, mầm non đội đá, gian truân thử thách",
      },
      {
        hexNumber: 63,
        label: "Lá 2: Biến Quái (3 Tháng Tới)",
        role: "Đích Đến / Thành Tựu",
        keyMeaning: "Việc đã thành, thủy hỏa tương tế, âm dương chính vị, đại cát hanh thông",
      },
    ],
    analysis:
      "Lá 1 là Quẻ Truân (Khảm trên Chấn dưới): Sấm chớp dồn nén dưới làn nước sâu, mầm sống non nớt cựa mình nảy nở trong giá rét. Đây là thời kỳ bế tắc tạm thời, việc gì mới khởi sự cũng đầy gian truân, hào từ khuyên 'chớ vội vã tiến bước mà nên củng cố nội lực, tìm người hiền tài phò tá'.\nLá 2 là Quẻ Ký Tế (Khảm trên Ly dưới): Nước ở trên đun sôi lửa ở dưới, tạo ra sự chuyển hóa hoàn hảo. Đặc biệt trong 64 quẻ, chỉ duy nhất Ký Tế có tất cả 6 hào đều đắc vị (Dương ở ngôi Dương, Âm ở ngôi Âm) — tượng trưng cho công việc đi đến hồi kết viên mãn, thành tựu rực rỡ.",
    outcome:
      "Sự kết hợp giữa Truân và Ký Tế là quẻ 'Tiền hung hậu cát' kinh điển. Quẻ động viên ông Trần: giai đoạn ngổn ngang khó khăn hiện tại chỉ là bài thử thách tôi luyện bản lĩnh; chỉ cần giữ vững tâm thế kiên trì, không bỏ cuộc thì trong vòng 3 tháng tới tình thế sẽ xoay chuyển 180 độ sang thành tựu. Quả đúng như vậy, sang tháng thứ ba, dự án bế tắc của ông được đối tác lớn rót vốn giải ngân và gặt hái kết quả ngoài mong đợi.",
    takeaway:
      "Đạo Dịch dạy rằng: Khi gặp Truân (khởi đầu nan) chớ buông xuôi, hãy âm thầm nuôi dưỡng chí khí. Nhưng khi đã bước sang Ký Tế (công thành danh toại) thì phải luôn phòng bị hiểm nguy vì 'Sơ cát chung loạn' — vạn vật đạt đỉnh hưng thịnh thì dễ bắt đầu suy thoái nếu chủ quan.",
  },
  {
    id: "example_d",
    code: "Ví Dụ D",
    spreadType: "2_card",
    spreadTypeName: "Phương Pháp 2 Lá Bài (So Sánh Hai Phương Án)",
    spreadTypeShort: "Trải 2 Lá",
    title: "Lựa chọn giữa hai cơ hội nghề nghiệp của cô Lý",
    category: "Sự Nghiệp & Quyết Định",
    categoryColor: "text-purple-400 border-purple-800/60 bg-purple-950/40",
    context:
      "Cô Lý hiện đang là Giám đốc kinh doanh tại một công ty viễn thông lớn với môi trường ổn định. Một công ty công nghệ mới khởi nghiệp tiếp cận và mời cô sang với mức lương gấp rưỡi cùng nhiều đãi ngộ cổ phần hấp dẫn. Phân vân giữa ở lại hay nhảy việc, cô rút 2 lá bài so sánh: Phương án A (Ở lại công ty cũ) và Phương án B (Nhận lời mời sang công ty mới).",
    cards: [
      {
        hexNumber: 2,
        label: "Phương Án A: Tiếp Tục Ở Lại",
        role: "Lựa Chọn 1",
        keyMeaning: "Đất mẹ nhu thuận, tích lũy đức dày, ổn định bền vững như đất chở vạn vật",
      },
      {
        hexNumber: 59,
        label: "Phương Án B: Sang Công Ty Mới",
        role: "Lựa Chọn 2",
        keyMeaning: "Gió thổi tan nước, phân tán ly khai, xa nhìn rực rỡ nhưng gần lại sóng gió bất an",
      },
    ],
    analysis:
      "Phương án A được quẻ Thuần Khôn: Quẻ thuần Âm tượng trưng cho Đất Mẹ hiền hòa, 'Hậu đức tải vật'. Công ty hiện tại có nền móng tổ chức vững chãi, quy chế an toàn; ở lại tuy không giàu xổi ngay tức khắc nhưng giống như hạt giống gieo vào đất lành, càng tận tụy cống hiến càng được cấp trên tin cậy trao quyền lớn.\nPhương án B được quẻ Phong Thủy Hoán: Gió thổi trên mặt nước làm sóng dậy ly tán. Hình tượng quẻ Hoán cảnh báo: Bề ngoài lời mời chào rất lung linh như ngắm đóa sen từ bờ bên này, nhưng khi bước chân vào thực tế thì nội bộ công ty mới đang lục đục, bè phái tranh quyền, nguồn lực phân tán, tiềm ẩn nguy cơ đổ vỡ lớn.",
    outcome:
      "Nhờ thấu hiểu ý nghĩa tượng quẻ Hoán, cô Lý đã sáng suốt từ chối lời mời hấp dẫn và quyết định tiếp tục gắn bó với công ty cũ. Đúng 6 tháng sau, công ty mới kia vướng phải bê bối tài chính nội bộ và nhà đầu tư rút vốn khiến toàn bộ phòng ban kinh doanh bị sa thải đột ngột; trong khi đó tại công ty cũ, cô Lý được bổ nhiệm làm Phó Tổng Giám đốc phụ trách toàn quốc.",
    takeaway:
      "Khi đứng trước những ngã rẽ cuộc đời, trực giác và Dịch học giúp ta nhìn thấu qua lớp sương mù hào nhoáng để thấy rõ thực chất. Sự bình ổn bền vững (Khôn) luôn quý giá hơn những ảo ảnh phân ly đầy rủi ro (Hoán).",
  },
  {
    id: "example_e",
    code: "Ví Dụ E",
    spreadType: "3_card",
    spreadTypeName: "Phương Pháp 3 Lá Bài (Quá Khứ • Hiện Tại • Tương Lai)",
    spreadTypeShort: "Trải 3 Lá",
    title: "Dự đoán chu kỳ kinh tế vĩ mô Việt Nam giai đoạn 2008 – 2016",
    category: "Kinh Tế Vĩ Mô & Chu Kỳ",
    categoryColor: "text-rose-400 border-rose-800/60 bg-rose-950/40",
    context:
      "Năm 2008, cơn bão khủng hoảng tài chính nổ ra từ thị trường nhà đất Mỹ lan rộng toàn cầu. Tại Việt Nam, lạm phát tăng vọt lên trên 20%, thị trường chứng khoán giảm sâu kỷ lục từ đỉnh 1170 điểm xuống dưới 300 điểm, các doanh nghiệp hoang mang tột độ. Cô Hà đã gieo 3 lá bài theo trục thời gian để nhận diện quy luật vận hành của nền kinh tế.",
    cards: [
      {
        hexNumber: 46,
        label: "Lá 1: Quá Khứ (Trước 2008)",
        role: "Giai Đoạn Thăng Hoa",
        keyMeaning: "Cây non vươn khỏi lòng đất, kinh tế thăng hoa, dòng vốn FDI ồ ạt sau WTO",
      },
      {
        hexNumber: 27,
        label: "Lá 2: Hiện Tại (Năm 2008)",
        role: "Giai Đoạn Tiết Chế",
        keyMeaning: "Tượng hàm răng nuôi dưỡng, cẩn ngôn tiết thực, thắt lưng buộc bụng giữ gìn nguồn lực",
      },
      {
        hexNumber: 23,
        label: "Lá 3: Tương Lai (2009 – 2012 & 2014+)",
        role: "Giai Đoạn Thanh Lọc & Tái Sinh",
        keyMeaning: "Bong tróc suy tàn, vỡ bong bóng, đào thải nợ xấu trước khi Phục sinh chu kỳ mới",
      },
    ],
    analysis:
      "1. Quá khứ - Quẻ Thăng (Địa Phong Thăng): Cây đâm chồi từ đất vươn lên đón ánh mặt trời. Phản ánh chính xác giai đoạn 2006-2007 khi Việt Nam chính thức gia nhập WTO, dòng vốn ngoại đổ vào như vũ bão, GDP tăng trưởng phi mã, người người say sưa với cơn sốt tài sản.\n2. Hiện tại - Quẻ Di (Sơn Lôi Di): Hình tượng chiếc miệng và hàm răng, lời dạy là 'di dưỡng đức hạnh, cẩn trọng lời nói, tiết chế ăn uống'. Năm 2008 đối mặt lạm phát phi mã, giải pháp sống còn duy nhất là chính phủ siết chặt tín dụng, doanh nghiệp thắt lưng buộc bụng, cắt giảm đầu tư dàn trải để duy trì sự sống.\n3. Tương lai - Quẻ Bác (Sơn Địa Bác) hướng về Quẻ Phục (Địa Lôi Phục): Quẻ Bác có 5 hào Âm ở dưới xói mòn hào Dương duy nhất ở trên đỉnh núi — tượng trưng cho sự bong tróc, lột vỏ. Dự báo giai đoạn 2009-2012 kinh tế phải chịu đựng nỗi đau thanh lọc: bong bóng bất động sản xì hơi, nợ xấu ngân hàng lộ diện, doanh nghiệp yếu kém bị đào thải. Tuy nhiên theo luật Dịch 'Bác cực tất Phục' — khi lớp vỏ mục rữa rơi rụng hết thì một hào Dương sẽ tái sinh từ đáy (Quẻ Phục), mở ra kỷ nguyên phục hồi bền vững từ 2014-2016.",
    outcome:
      "Lịch sử kinh tế vĩ mô Việt Nam đã diễn biến đúng từng bước như 3 quẻ bài chỉ điểm: Thăng hoa bùng nổ (Thăng) ➔ Thắt lưng buộc bụng sinh tồn (Di) ➔ Đào thải thanh lọc nợ xấu khốc liệt (Bác) ➔ và Tái cơ cấu hồi sinh mạnh mẽ (Phục) từ năm 2014 trở đi.",
    takeaway:
      "Quy luật Kinh Dịch chứng minh: Bất kỳ chu kỳ kinh tế nào cũng có Mùa Xuân đâm chồi (Thăng), Mùa Hè dưỡng sức (Di), Mùa Thu trút lá mục ruỗng (Bác) và Mùa Đông ươm mầm tái sinh (Phục). Người lãnh đạo nắm được luật Dịch sẽ không tham lam khi Thăng, không hoảng loạn khi Bác, mà kiên nhẫn tích lũy đón đầu ngày Phục sinh.",
  },
  {
    id: "example_f",
    code: "Ví Dụ F",
    spreadType: "that_tinh",
    spreadTypeName: "Trận Pháp Thất Tinh (7 Lá)",
    spreadTypeShort: "Thất Tinh (7 Lá)",
    title: "Khảo sát toàn diện sự nghiệp & bước ngoặt khởi nghiệp",
    category: "Sự Nghiệp & Doanh Nghiệp",
    categoryColor: "text-amber-400 border-amber-800/60 bg-amber-950/40",
    context:
      "Một sáng lập viên chuẩn bị đưa dự án công nghệ mới ra thị trường sau chuỗi ngày chịu áp lực tài chính và biến động nhân sự. Anh bốc Trận Pháp Thất Tinh (7 lá) để soi chiếu 7 phương diện: Quá khứ, Tâm thế bản thân, Diễn biến kế tiếp, Lời khuyên, Kết quả, Ngoại cảnh và Điểm mù nội tại.",
    cards: [
      {
        hexNumber: 28,
        label: "Lá 1: Quá Khứ",
        role: "Căn Nguyên & Nền Tảng",
        keyMeaning: "Trạch Phong Đại Quá: Kèo cột gánh nặng oằn mình, áp lực vượt quá sức chịu đựng ban đầu",
      },
      {
        hexNumber: 8,
        label: "Lá 2: Bản Thân Hiện Tại",
        role: "Tâm Thế & Thực Lực",
        keyMeaning: "Thủy Địa Tỷ: Thân ái, gắn kết đồng hành, cởi mở hợp tác tìm kiếm đồng minh",
      },
      {
        hexNumber: 47,
        label: "Lá 3: Diễn Biến Tiếp Theo",
        role: "Xu Thế Chuyển Dịch",
        keyMeaning: "Trạch Thủy Khốn: Thử thách ngặt nghèo, cây cối thiếu nước, cần giữ đức nhẫn nại",
      },
      {
        hexNumber: 50,
        label: "Lá 4: Lá Bài Gợi Ý",
        role: "Minh Triết & Sách Lược",
        keyMeaning: "Hỏa Phong Đỉnh: Tượng cái vạc luyện đan, cải cách đổi mới triệt để, tôi luyện nhân tài",
      },
      {
        hexNumber: 64,
        label: "Lá 5: Kết Quả",
        role: "Thành Tựu & Triển Vọng",
        keyMeaning: "Hỏa Thủy Vị Tế: Chưa xong nhưng sắp xong, mở ra một chu kỳ phát triển mới đầy hứa hẹn",
      },
      {
        hexNumber: 29,
        label: "Lá 6: Môi Trường Bên Ngoài",
        role: "Ngoại Duyên & Khách Quan",
        keyMeaning: "Khảm Vi Thủy: Vực sâu trùng điệp, thị trường đầy sóng gió cạnh tranh khốc liệt",
      },
      {
        hexNumber: 46,
        label: "Lá 7: Thiếu Sót Của Bản Thân",
        role: "Điểm Mù Cần Tu Sửa",
        keyMeaning: "Địa Phong Thăng: Tham vọng leo cao quá nhanh, dục tốc bất đạt khi móng chưa thật chắc",
      },
    ],
    analysis:
      "Trận Pháp Thất Tinh cho thấy bức tranh hoàn chỉnh: Quá khứ chịu gánh nặng quá tải (Đại Quá) nhưng hiện tại đã biết liên kết tạo đồng minh (Tỷ). Diễn biến trước mắt còn phải trải qua thử thách cam go (Khốn) vì môi trường bên ngoài hiểm trở như vực sâu (Khảm). Tuy nhiên điểm mù lớn nhất là bản thân quá nôn nóng thăng tiến (Thăng). Lời giải mấu chốt nằm ở Lá Gợi Ý: Quẻ Đỉnh (Đỉnh Tân Cách Cố) — phải thay đổi toàn diện mô hình, tinh chỉnh sản phẩm và rèn luyện đội ngũ như tôi kim loại trong vạc lửa, từ đó chuyển hóa tình thế sang Vị Tế (bình minh trước vận hội mới).",
    outcome:
      "Nhờ thấu hiểu lời chỉ dẫn của Thất Tinh Trận, nhà sáng lập đã hoãn chiến lược mở rộng ồ ạt, tập trung tinh gọn bộ máy và cải tiến sản phẩm cốt lõi. Sau 6 tháng, doanh nghiệp đã vượt qua cửa ải khó khăn và đạt mức tăng trưởng ấn tượng.",
    takeaway:
      "Thất Tinh Trận chỉ ra: Thành bại lớn của đời người không nằm ở việc gặp khó khăn (Khốn, Khảm), mà nằm ở việc nhìn thấy điểm mù của chính mình (Thăng) và can đảm tôi luyện đổi mới (Đỉnh) để bước vào chu kỳ thành công mới.",
  },
  {
    id: "example_g",
    code: "Ví Dụ G",
    spreadType: "thap_tinh",
    spreadTypeName: "Trận Pháp Thập Tinh (10 Lá Celtic Cross)",
    spreadTypeShort: "Thập Tinh (10 Lá)",
    title: "Định vị đại sự & Hóa giải trở ngại - trợ lực tâm điểm",
    category: "Vận Hạn & Đại Cục",
    categoryColor: "text-purple-400 border-purple-800/60 bg-purple-950/40",
    context:
      "Một nhà đầu tư đứng trước thương vụ M&A quy mô lớn có tính chất bước ngoặt. Ông trải Trận Pháp Thập Tinh 10 lá. Đặc biệt ở vị trí Lá thứ 2 — nếu ở chiều xuôi là Hỗ Trợ, ở chiều ngược là Trở Ngại trực diện chắn ngang tâm điểm hiện tại.",
    cards: [
      {
        hexNumber: 48,
        label: "Lá 1: Tình Huống Hiện Tại",
        role: "Tâm Điểm Vấn Đề",
        keyMeaning: "Thủy Phong Tỉnh: Tượng cái giếng làng, nguồn lực sẵn có nhưng sâu, cần nỗ lực múc lên",
      },
      {
        hexNumber: 14,
        label: "Lá 2: Xuôi Hỗ Trợ / Ngược Trở Ngại",
        role: "Lực Chắn Ngang Tâm Điểm",
        keyMeaning: "Hỏa Thiên Đại Hữu (Xuôi: Hỗ Trợ tài chính dồi dào; Ngược: Trở Ngại từ lòng tham và kiêu ngạo)",
      },
      {
        hexNumber: 61,
        label: "Lá 3: Yếu Tố Bên Ngoài",
        role: "Nền Tảng Khách Quan",
        keyMeaning: "Phong Trạch Trung Phu: Sự chân thành tín nghĩa, lòng tin giữa các bên tham gia",
      },
      {
        hexNumber: 11,
        label: "Lá 4: Điều Bạn Không Biết",
        role: "Góc Khuất Tiềm Thức",
        keyMeaning: "Địa Thiên Thái: Vận khí hanh thông ngầm đang ủng hộ, thiên thời địa lợi hòa hợp",
      },
      {
        hexNumber: 10,
        label: "Lá 5: Tình Huống Trước Đây",
        role: "Gốc Rễ Quá Khứ",
        keyMeaning: "Thiên Trạch Lý: Dẫm đuôi cọp mà cọp không cắn, từng vượt qua nhiều tình huống hiểm nguy",
      },
      {
        hexNumber: 1,
        label: "Lá 6: Tương Lai Tiếp Theo",
        role: "Diễn Biến Ngắn Hạn",
        keyMeaning: "Thuần Càn: Sức sáng tạo dũng mãnh, thời cơ hành động quyết đoán đang tới",
      },
      {
        hexNumber: 44,
        label: "Lá 7: Vận Hạn Năm Nay",
        role: "Chu Kỳ Vận Khí",
        keyMeaning: "Thiên Phong Cấu: Gặp gỡ bất ngờ, phòng ngừa sự lôi kéo và cám dỗ từ bên ngoài",
      },
      {
        hexNumber: 33,
        label: "Lá 8: Cách Nhìn Của Người Ngoài",
        role: "Nhãn Quan Xã Hội",
        keyMeaning: "Thiên Sơn Độn: Người ngoài đánh giá bạn nên lùi một bước, cẩn trọng tránh va chạm",
      },
      {
        hexNumber: 29,
        label: "Lá 9: Kết Quả Cuối Cùng",
        role: "Hồi Kết Đại Định",
        keyMeaning: "Khảm Vi Thủy: Thử thách lớn nhưng giữ được lòng chí thành thì vẫn hanh thông",
      },
      {
        hexNumber: 14,
        label: "Lá 10: Lá Bài Khuyên Bảo",
        role: "Minh Triết Tối Hậu",
        keyMeaning: "Hỏa Thiên Đại Hữu: Khiêm tốn hưởng phúc lớn, chia sẻ lợi ích, giữ lòng công minh",
      },
    ],
    analysis:
      "Tâm điểm của Thập Tinh Trận nằm ở sự tương tác giữa Lá 1 (Tỉnh - khai thác nguồn tài nguyên sâu) và Lá 2 (Đại Hữu). Ở chiều xuôi, Đại Hữu là Trợ lực cực mạnh về vốn và đối tác danh tiếng; ở chiều ngược, nó cảnh báo Trở ngại phát sinh nếu để lòng tham hoặc tính tự kiêu lấn át. Các vị trí ngoại cảnh (Trung Phu - chữ Tín) và tiềm thức (Thái - vận hanh thông) khẳng định nền tảng vững vàng. Lá Khuyên Bảo (Lá 10) nhấn mạnh: Muốn hưởng phúc lộc Đại Hữu thì người đứng đầu phải biết 'ngăn ngừa điều ác, biểu dương điều thiện, thuận theo mệnh trời'.",
    outcome:
      "Nhờ nắm chắc quy luật Lá thứ 2 và lời khuyên Lá 10, nhà đầu tư đã chủ động nhượng bộ một phần lợi ích để đạt được sự đồng thuận tuyệt đối của các cổ đông, giúp thương vụ hoàn tất thắng lợi vẻ vang.",
    takeaway:
      "Thập Tinh Trận đem lại cái nhìn toàn cảnh như la bàn phong thủy: Lá 2 chính là chìa khóa then chốt — biết chuyển hóa trở ngại thành hỗ trợ bằng đức khiêm nhu thì mọi việc nan giải đều hóa thành đại cát hanh thông.",
  },
];
