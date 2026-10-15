export interface TrigramDetail {
  id: string;
  name: string;
  hanzi: string;
  symbol: string;
  lines: string;
  nature: string;
  element: string;
  familyRole: string; // Lục thân
  bodyParts: string[]; // Bộ phận cơ thể
  direction: string; // Phương vị
  attribute: string; // Đức tính / ý tượng
  order: string; // Quái 1/8 .. 8/8
}

export const TRIGRAM_DETAILS: TrigramDetail[] = [
  {
    id: "can",
    name: "Càn",
    hanzi: "乾",
    symbol: "☰",
    lines: "Càn tam liên (ba vạch liền)",
    nature: "Trời (Thiên)",
    element: "Kim",
    familyRole: "Cha (Phụ)",
    bodyParts: ["Đầu", "Cổ", "Phổi", "Xương sống"],
    direction: "Tây Bắc",
    attribute: "Quẻ thuần Dương, lấy tượng là Trời, chủ tể của vạn vật, tượng trưng cho sự dũng mãnh, vận hành không ngừng của Trời. Cương kiện trung chính.",
    order: "Quái 1/8",
  },
  {
    id: "kham",
    name: "Khảm",
    hanzi: "坎",
    symbol: "☵",
    lines: "Khảm trung mãn (ở giữa đầy, hai bên đứt)",
    nature: "Nước (Thủy)",
    element: "Thủy",
    familyRole: "Thứ Nam",
    bodyParts: ["Tai", "Thận", "Cơ quan sinh dục"],
    direction: "Bắc",
    attribute: "Một Dương hãm ở giữa hai Âm, trong cứng ngoài mềm, lấy tượng là Nước, tượng trưng cho nguy hiểm, hiểm hãm. Đột phá gian nan.",
    order: "Quái 2/8",
  },
  {
    id: "can_mountain",
    name: "Cấn",
    hanzi: "艮",
    symbol: "☶",
    lines: "Cấn phúc uyển (như cái bát úp)",
    nature: "Núi (Sơn)",
    element: "Thổ",
    familyRole: "Thiếu Nam",
    bodyParts: ["Mũi", "Da", "Dạ dày", "Tay", "Ngón tay", "Ngón chân"],
    direction: "Đông Bắc",
    attribute: "Một Dương ở trên hai Âm, Dương đã thăng đến cực điểm cho nên dừng lại, lấy tượng là Núi, tượng trưng cho sự dừng lại, tĩnh chỉ. Thích khả nhi chỉ.",
    order: "Quái 3/8",
  },
  {
    id: "chan",
    name: "Chấn",
    hanzi: "震",
    symbol: "☳",
    lines: "Chấn ngửa chậu (đáy liền, trên đứt)",
    nature: "Sấm sét (Lôi)",
    element: "Mộc",
    familyRole: "Trưởng Nam",
    bodyParts: ["Gan", "Chân"],
    direction: "Đông",
    attribute: "Một Dương động ở bên dưới làm cho đại địa chấn động, cũng có ý nghĩa âm dương giao hợp phát sinh lôi điện, lấy tượng là Sấm sét, tượng trưng cho sự chấn động, rung chuyển. Lâm nguy bất loạn.",
    order: "Quái 4/8",
  },
  {
    id: "ton",
    name: "Tốn",
    hanzi: "巽",
    symbol: "☴",
    lines: "Tốn dưới đứt (hào 1 đứt, hai hào trên liền)",
    nature: "Gió, Cây (Phong, Mộc)",
    element: "Mộc",
    familyRole: "Trưởng Nữ",
    bodyParts: ["Đường hô hấp", "Túi mật", "Đùi"],
    direction: "Đông Nam",
    attribute: "Một hào Âm ẩn dưới hai hào Dương, tức là khí Âm đi vào phía dưới của luồng khí Dương mạnh mẽ, lấy tượng là Gió và Cây, tượng trưng cho sự đi vào, phát tán. Hữu dụng nãi đại.",
    order: "Quái 5/8",
  },
  {
    id: "ly",
    name: "Ly",
    hanzi: "離",
    symbol: "☲",
    lines: "Ly trung hư (ở giữa rỗng, hai hào ngoài liền)",
    nature: "Lửa (Hỏa)",
    element: "Hỏa",
    familyRole: "Thứ Nữ",
    bodyParts: ["Mắt", "Tim"],
    direction: "Nam",
    attribute: "Một hào Âm gắn giữa hai hào Dương, bên trong rỗng tuếch, lấy tượng là Lửa, tượng trưng cho sự sáng tỏ và sự nương tựa. Phụ hòa nhu trung.",
    order: "Quái 6/8",
  },
  {
    id: "khon",
    name: "Khôn",
    hanzi: "坤",
    symbol: "☷",
    lines: "Khôn lục đoạn (sáu đoạn đứt)",
    nature: "Đất (Địa)",
    element: "Thổ",
    familyRole: "Mẹ (Mẫu)",
    bodyParts: ["Tỳ", "Dạ dày", "Bụng"],
    direction: "Tây Nam",
    attribute: "Quẻ thuần Âm, lấy tượng là Đất, tượng trưng cho sự bao dung, thuận tòng của vạn vật. Nhu thuận thân triển.",
    order: "Quái 7/8",
  },
  {
    id: "doai",
    name: "Đoài",
    hanzi: "兌",
    symbol: "☱",
    lines: "Đoài trên khuyết (hào trên đứt, hai hào dưới liền)",
    nature: "Đầm, Hồ (Trạch)",
    element: "Kim",
    familyRole: "Thiếu Nữ",
    bodyParts: ["Miệng", "Lưỡi", "Họng"],
    direction: "Tây",
    attribute: "Một hào Âm đang cố thuận theo hai hào Dương, là hình tượng khí Dương vượng bị khí Âm làm mềm, lấy tượng là Đầm (Trạch), tượng trưng cho sự vui mừng. Nội cương ngoại nhu.",
    order: "Quái 8/8",
  },
];

export const MANUAL_SECTIONS = [
  {
    id: "preface",
    title: "1. Lời nói đầu & Giới thiệu",
    icon: "BookOpen",
    summary: "Nguồn gốc bộ bài Tarot Kinh Dịch 64 quẻ và vai trò công cụ trí tuệ cuộc đời.",
    content: `
### LỜI NÓI ĐẦU
Trong hành trình cuộc đời, chúng ta luôn phải đối mặt với sự lựa chọn trong nhiều sự kiện quan trọng. Khi đó, ta thường cần đưa ra những dự đoán về tương lai hoặc tìm kiếm sự soi sáng từ trí tuệ và nguồn cảm hứng để giải đáp các vấn đề, qua đó giúp bản thân đưa ra quyết định sáng suốt.

Bộ **“Bài Tarot Kinh Dịch”** mang đến một công cụ tích cực và hiệu quả, đặc biệt là trong những tình huống bạn đã cân nhắc toàn diện cả mong muốn chủ quan lẫn hoàn cảnh khách quan mà vẫn khó lòng đưa ra quyết định. Nó có thể mang đến cho bạn những chỉ dẫn rõ ràng, hơn nữa lại không cần phải nhờ cậy người khác hay tốn kém tiền bạc. Mọi thứ đều đến một cách tự nhiên và thuận tiện, hoàn toàn phù hợp với xu hướng DIY (Do-It-Yourself / Tự mình làm) mới nhất hiện nay.

> *“Công cụ trí tuệ không thể thiếu trên hành trình cuộc đời.”*

---

### GIỚI THIỆU
“Kinh Dịch” là một trong những cội nguồn của văn hóa phương Đông, được tôn vinh là cuốn sách đứng đầu các kinh, là *“kinh của các kinh”*. Kinh Dịch là kết tinh của một quá trình sáng tác tập thể, tác giả sớm nhất có thể truy nguyên từ thời Phục Hy xa xưa. Lúc bấy giờ, Kinh Dịch lấy việc bói toán làm hình thức ứng dụng. Trải qua sự diễn giải của Văn Vương, Chu Công, Khổng Tử, nó đã biến thành một tác phẩm triết học với hệ thống độc lập, chứa đựng trí tuệ cuộc sống phong phú. Nó có tác dụng to lớn đối với sự nghiệp và tiền đồ của đời người, giúp con người xây dựng một nhân sinh quan và lý tưởng đúng đắn, cũng như bồi dưỡng một tố chất tâm lý khỏe mạnh.

Nội dung của “Kinh Dịch” vô cùng uyên bác và sâu sắc, nhưng ngôn từ lại trừu tượng khó hiểu, hơn nữa còn bị phủ lên một lớp áo bói toán thần bí. Chính sự thâm sâu khó hiểu này khiến người ta kính trọng nhưng lại giữ khoảng cách. Nhằm mục đích phổ biến văn hóa Kinh Dịch, giúp nhiều người dễ dàng thấu hiểu được tinh túy và vận dụng trí tuệ của nó vào cuộc sống thường ngày, bộ **“Bài Tarot Kinh Dịch”** được sáng tác:
- Sử dụng **sáu mươi tư bức tranh** để diễn đạt một cách đơn giản trọng tâm của mỗi quẻ cũng như triết lý bên trong nó.
- Tận dụng mô hình công cụ trực quan của các lá bài hình ảnh để giúp độc giả dự đoán tương lai và tìm kiếm trí tuệ, nguồn cảm hứng trong cuộc sống.
    `,
  },
  {
    id: "history_yinyang",
    title: "2. Sơ lược về Kinh Dịch & Thuyết Âm Dương",
    icon: "Compass",
    summary: "Chu Dịch, Tam Dịch (Giản dịch, Biến dịch, Bất dịch) và quy luật biến chuyển của vũ trụ.",
    content: `
### SƠ LƯỢC VỀ KINH DỊCH
“Kinh Dịch” có nguồn gốc lâu đời, là kết tinh trí tuệ dân tộc từ quá trình sáng tác tập thể. Ngay từ thời đồ đá, con người đã dùng quẻ bói để dự đoán cát hung. Trên mai rùa, xương thú và đồ đồng thời Thương và sơ kỳ Tây Chu, đã có khắc các quẻ số gồm sáu nét.

“Kinh Dịch” mà chúng ta nói đến hiện nay chính xác là “Chu Dịch” (Dịch của nhà Chu), kế thừa qua hai giai đoạn: *“Liên Sơn”* (thời Hạ) và *“Quy Tàng”* (thời Ân). “Chu Dịch” có thể coi là bản tổng kết những kinh nghiệm và bài học đối nhân xử thế, cuốn sách giáo khoa cuộc đời phong phú. 64 quẻ, thoán từ và 384 hào từ đã tiết lộ triết lý về những gì con người nên làm và không nên làm trên đời.

#### Ý nghĩa ba chữ “DỊCH” (Trịnh Huyền thời Hậu Hán):
1. **Biến dịch (biến đổi):** Vạn vật trong vũ trụ luôn biến đổi không ngừng, nhân sự cũng vậy.
2. **Bất dịch (không thay đổi):** Vũ trụ biến đổi không ngừng ấy lại có tính quy luật, trật tự rõ ràng, bất biến có thể tuân theo.
3. **Giản dịch (đơn giản, dễ hiểu):** Nhờ có tính quy luật bất dịch, ta có thể dùng những ký hiệu biểu tượng và con số đơn giản để suy diễn, dự đoán chính xác sự biến đổi của tự nhiên và nhân sự.

#### Cấu trúc của Kinh Dịch:
- **Kinh (Chính văn):** Gồm 64 quẻ (mỗi quẻ 6 vạch gọi là hào: hào liền \`—\` Dương và hào đứt \`--\` Âm) kèm Quái từ (Chu Văn Vương) và Hào từ (Chu Công). Chia làm *Thượng Kinh* (30 quẻ đầu) và *Hạ Kinh* (34 quẻ sau).
- **Truyện (Giải thuyết):** Mười thiên gọi là **“Thập Dực”** (đôi cánh phò trợ làm sáng tỏ ý nghĩa của Kinh), tương truyền do Khổng Tử và môn đồ san định.

---

### THUYẾT ÂM DƯƠNG
Mọi sự biến đổi của vạn vật đều có mối liên hệ lẫn nhau và tồn tại mâu thuẫn đối lập:
- *“Dịch có Thái cực, sinh Lưỡng nghi”* (Âm và Dương).
- Lưỡng nghi sinh Tứ tượng (Thái Âm, Thiếu Dương, Thiếu Âm, Thái Dương - ứng với bốn mùa).
- Tứ tượng sinh Bát quái (Càn, Đoài, Ly, Chấn, Tốn, Khảm, Cấn, Khôn).
- Chồng Bát quái lên nhau cấu thành 64 quẻ, mở ra đồ thức tương tác của thế giới.

#### Ba quy luật Âm Dương cốt lõi:
1. **Hai mặt đối lập luôn thống nhất:** Càn là trời, Khôn là đất. Đất nhận sự che chở của trời, hai bên nương tựa nhau. Trong âm có dương, trong dương có âm, giao cảm tạo thành chỉnh thể.
2. **Hai mặt mâu thuẫn đối lập:** Càn tôn Khôn ti, cương nhu, trên dưới, đối lập và xung đột tạo động lực tồn tại.
3. **Hai mặt đối lập chuyển hóa lẫn nhau:** Khi một sự vật phát triển đến tột độ, nó sẽ chuyển hóa sang mặt đối lập (*“Vật cực tất phản”*, *“Bĩ cực thái lai”*). Ví dụ: Hào Thượng Cửu của quẻ Càn: *“Kháng long hữu hối”* (Rồng bay cao quá sẽ sinh hối hận).
    `,
  },
  {
    id: "eight_trigrams",
    title: "3. Đặc tính của Bát Quái",
    icon: "Layers",
    summary: "Khảo cứu sâu 8 đơn quái: Lục thân, Cơ thể học, Phương vị, Ngũ hành và Tượng quẻ.",
    content: `
### ĐẶC TÍNH CỦA BÁT QUÁI (ĐƠN QUÁI)
64 quẻ trong chính văn Kinh Dịch được tạo thành từ việc xếp chồng Bát quái lên nhau. Vị đế vương thời cổ đại là **Phục Hy**, qua việc ngẩng lên quan sát thiên văn, cúi xuống khảo sát địa lý và mô phỏng vạn vật, đã vẽ nên **“Tiên thiên Bát quái đồ”**.

Muốn dự đoán và suy diễn chính xác mọi sự thay đổi trên thế gian, việc nắm vững các đặc tính Bát quái (Lục thân, Bộ phận cơ thể, Phương vị, Ngũ hành, Tượng) là điều bắt buộc.
    `,
  },
  {
    id: "divination_principles",
    title: "4. Nguyên lý dự đoán & Chuẩn bị tâm lý",
    icon: "Sparkles",
    summary: "Cơ chế tiềm thức, lòng thành tắc linh, cẩm nang Trai Giới Mộc Dục và cách đặt câu hỏi định hướng mở.",
    content: `
### NGUYÊN LÝ CỦA SỰ DỰ ĐOÁN
Các công cụ bói toán cổ xưa như Kinh Dịch hay Tarot phương Tây hoàn toàn không phải ảo thuật, cũng không dựa trên mê tín. Thực chất, khả năng dự báo này là việc **phát huy chức năng tiềm thức của não bộ**.

Mọi việc xảy ra trên thế giới đều liên kết với nhau qua các luồng thông tin tín hiệu (dạng sóng điện từ). Não bộ con người chia thành ý thức và tiềm thức, trong đó tiềm thức chính là bộ thu và bộ lưu trữ những thông tin vô hình này. Các công cụ (thẻ tre, tiền xu, bài Tarot) đóng vai trò chất xúc tác để kích hoạt linh giác vốn có của con người.

#### Điều kiện tiên quyết: SỰ THÀNH TÂM
- *“Tâm thành tắc linh”* (Lòng thành thì linh ứng).
- *“Tinh thành sở chí, kim thạch vi khai”* (Lòng thành tột bậc, vàng đá cũng nứt).
- Khi tâm ở trạng thái “thành”, sẽ sinh ra **Định lực**, từ Định lực sẽ khai mở **Trí tuệ**. Giống như nhà Phật dạy: nhờ Giới nhiếp tâm sinh Định, từ Định sinh ra trí tuệ Bát Nhã. Công cụ chỉ là thứ yếu; quẻ có ứng nghiệm hay không hoàn toàn phụ thuộc vào tâm cảnh định tĩnh của người hỏi.

---

### TRAI GIỚI MỘC DỤC (齋戒沐浴) — BƯỚC CHUẨN BỊ TỐI THƯỢNG
Trước khi bốc bài, gieo quẻ, cổ nhân luôn nghiêm cẩn thực hành nghi thức **Trai Giới Mộc Dục**:
1. **Mộc Dục (沐浴 - Tẩy Thân):**
   - *Mộc (沐):* Gội đầu, rửa mặt, súc miệng cho hơi thở thanh khiết.
   - *Dục (浴):* Tắm gội toàn thân, đặc biệt là **rửa sạch đôi bàn tay dưới dòng nước tinh khiết** trước khi chạm vào thẻ bài hay công cụ gieo quẻ. Đôi tay là cửa ngõ giao cảm từ trường sinh học, bàn tay thanh sạch thì cảm ứng mới tinh khôi. Y phục chỉnh tề, đoan chính để tỏ lòng cung kính với Đạo Trời Đất.
2. **Trai Giới (齋戒 - Tịnh Tâm):**
   - *Trai (齋):* Tề tĩnh tâm thần, thanh tâm quả dục. Tránh ăn uống quá no, kiêng bia rượu, chất kích thích và những cuộc vui ồn ào trước giờ bốc.
   - *Giới (戒):* Phòng ngừa tà niệm, dứt bỏ tâm tham lam vụ lợi, sân hận, đố kỵ hoặc toan tính hại người. Đưa tâm về trạng thái *“Hư Tĩnh Sinh Minh”* (lòng rỗng rang, tĩnh lặng như mặt gương phẳng không dính bụi).
3. **Khẩu Quyết "Tứ Bất Bốc" (Bốn Điều Tuyệt Đối Không Gieo):**
   - *Bất thành bất bốc:* Lòng không thành kính, chỉ tò mò thử nghiệm thì không bốc.
   - *Bất nghi bất bốc:* Trong lòng không có sự việc thực sự băn khoăn, không cần chỉ dẫn thì không bốc.
   - *Phi nghĩa bất bốc:* Hỏi việc phi pháp, thất đức, mưu cầu lợi bất chính thì không bốc.
   - *Độc tắc bất cáo:* Một việc bốc đi bốc lại nhiều lần để ép quẻ tốt là bất kính, quẻ sẽ loạn.

---

### CHUẨN BỊ TÂM LÝ TRƯỚC KHI DỰ ĐOÁN
Khi trong lòng có nghi vấn mà chưa thể quyết định:
1. **Xác định rõ ràng vấn đề:** Tuyệt đối không mơ hồ, không đặt câu hỏi mang tính chủ quan phiến diện hay ép buộc câu trả lời “Có/Không”.
   - ❌ *Câu hỏi chưa chuẩn:* “Năm nay liệu tôi có tìm được bạn trai không?”, “Công việc này không hợp với tôi, đúng không?”
   - ✅ *Câu hỏi chuẩn xác (mang tính định hướng, toàn cảnh và gợi mở):*
     - *“Tình hình phát triển tình cảm trong năm nay sẽ ra sao?”*
     - *“Những khó khăn gặp phải trong công việc hiện tại nên giải quyết như thế nào?”*
     - *“Tình hình tài chính cá nhân trong nửa cuối năm sẽ có viễn cảnh gì?”*
2. **Quyết định phương pháp trải bài trước khi xào bài:** Một khi đã chọn cách trải (1 lá, 2 lá, 3 lá...), tuyệt đối không được tùy tiện thay đổi giữa chừng. Bởi vì trong lúc bạn suy nghĩ và xáo bài, tiềm thức đã bắt đầu sắp xếp các lá bài tương ứng với cấu trúc trải đã định.
    `,
  },
  {
    id: "spread_methods",
    title: "5. Phương pháp trải bài & 5 Ví dụ thực tế",
    icon: "Scroll",
    summary: "Phương pháp 1 lá, 2 lá (Nhân - Quả), 3 lá (Thời gian & Xăm Khổng Minh Tam Tài) kèm 5 ví dụ minh họa chứng khoán, kinh doanh, vận hạn.",
    content: `
### PHƯƠNG PHÁP TRẢI BÀI & CÁC VÍ DỤ THỰC TẾ

#### I. PHƯƠNG PHÁP BÓI MỘT LÁ BÀI
- **Mục đích:** Khi trong lòng có một nghi vấn, chỉ cần một sự gợi ý đơn giản hoặc cái nhìn tổng thể về một sự việc.
- **Phương pháp:** Vừa xào bài vừa tập trung vào câu hỏi rõ ràng. Sau đó rút một lá bài và đọc ý tượng.
- **Ví dụ thực tế A (Dự đoán thị trường chứng khoán VN-Index):**
  - *Tình huống:* Buổi sáng VN-Index tăng vọt gần 20 điểm. Tác giả gieo quẻ xem tình hình đóng cửa phiên chiều.
  - *Quẻ bốc được:* **Phong Thiên Tiểu Súc [9]** (Tượng mây dày mà không mưa, kìm hãm, trì trệ).
  - *Ứng nghiệm:* Phiên chiều thị trường bị chốt lời, chỉ số thu hẹp đà tăng chỉ còn vài điểm, hoàn toàn ứng với ý nghĩa kìm hãm của Tiểu Súc.
- **Ví dụ thực tế B (Đối mặt hoàn cảnh khó khăn của nhà hàng):**
  - *Tình huống:* Ông Lâm có nhà hàng ế ẩm do cạnh tranh mới mở, muốn tìm phương án cải thiện doanh thu.
  - *Quẻ bốc được:* **Trạch Hỏa Cách [49]** (Cách mạng, đổi mới, bỏ cũ lập mới).
  - *Ứng nghiệm:* Lời khuyên là phải cải tổ toàn diện từ phong cách phục vụ, thực đơn đến trang trí không gian; nếu giữ mãi nếp cũ sẽ thất bại.

---

#### II. PHƯƠNG PHÁP BÓI HAI LÁ BÀI (BẢN QUÁI & BIẾN QUÁI / SO SÁNH)
- **Mục đích:** Dự đoán hai giai đoạn phát triển của sự việc (*Lá 1: Bản quái là Nhân; Lá 2: Biến quái là Quả*) hoặc So sánh hai lựa chọn để chọn một.
- **Phương pháp:** Rút lá thứ 1 làm khởi điểm/hiện tại, lá thứ 2 làm chuyển biến/kết quả tương lai (hoặc Phương án A vs Phương án B).
- **Ví dụ thực tế C (Suy đoán vận hạn trong 3 tháng tới):**
  - *Tình huống:* Ông Trần thấy vận hạn gần đây gặp trở ngại, muốn xem tương lai để xu cát tị hung.
  - *Quẻ bốc được:* Lá 1 là **Thủy Lôi Truân [3]** (Bản quái: vạn sự khởi đầu nan, trước khó sau dễ); Lá 2 là **Thủy Hỏa Ký Tế [63]** (Biến quái: việc đã thành, đại cát, nhưng đề phòng vật cực tất phản).
  - *Ứng nghiệm:* Thời kỳ hiện tại nhiều chông gai nhưng trong vòng 3 tháng tới chắc chắn sẽ thấy ánh sáng và đạt thành tựu.
- **Ví dụ thực tế D (Chọn một trong hai công việc của cô Lý):**
  - *Tình huống:* Đang làm giám đốc kinh doanh công ty viễn thông, nhận lời mời công ty mới đãi ngộ cao hơn. Phân vân đi hay ở.
  - *Quẻ bốc được:*
    - Tiếp tục ở lại công ty cũ: Quẻ **Khôn [2]** (Môi trường ổn định, cần kiên nhẫn bồi dưỡng như mẹ chăm con).
    - Chuyển sang công ty mới: Quẻ **Hoán [59]** (Phong Thủy Hoán: cảnh xa hoa sen rất đẹp nhưng cảnh gần nước xao động phân tán, bề ngoài hào nhoáng nhưng bên trong nội bộ phức tạp, dễ đối mặt sóng gió chia rẽ).

---

#### III. PHƯƠNG PHÁP BÓI BA LÁ BÀI (QUÁ KHỨ - HIỆN TẠI - TƯƠNG LAI)
- **Mục đích:** Phân tích một tiến trình xuyên suốt theo 3 mốc thời gian.
- **Ví dụ thực tế E (Dự đoán kinh tế Việt Nam giai đoạn 2008 – 2016):**
  - *Tình huống:* Năm 2008 bão khủng hoảng tài chính toàn cầu, lạm phát và chứng khoán lao dốc. Cô Hà thỉnh vấn viễn cảnh kinh tế.
  - *Ba lá bài rút được:*
    - **Quá khứ (Trước 2008):** Quẻ **Địa Phong Thăng [46]** (Kinh tế thăng hoa, gia nhập WTO 2007, dòng vốn FDI ồ ạt đổ vào, tăng trưởng nóng).
    - **Hiện tại (Năm 2008):** Quẻ **Sơn Lôi Di [27]** (Tượng nuôi dưỡng, cần nghỉ ngơi dưỡng sức, thắt lưng buộc bụng, thận trọng quản lý dòng tiền, không mở rộng dàn trải).
    - **Tương lai (Giai đoạn 2009 – 2012):** Quẻ **Sơn Địa Bác [23]** (Bong tróc, suy tàn, nợ xấu gia tăng, bong bóng bất động sản xì hơi, đào thải doanh nghiệp yếu). Phải tái cấu trúc chuyển Bác thành **Phục [24]** (hồi sinh), đúng như thực tế nền kinh tế đến 2014–2016 mới bước vào chu kỳ phục hồi mạnh mẽ.

---

#### IV. PHƯƠNG PHÁP XĂM KHỔNG MINH (TAM TÀI: THIÊN — ĐỊA — NHÂN & 12 ĐỊA CHI KHỞI HÀO ĐỘNG)
- **Mục đích:** Khảo sát toàn diện 3 chiều không gian - thời gian - nhân tâm: Thiên thời, Địa lợi, Nhân hòa kết hợp gieo xúc xắc 12 mặt (12 Địa Chi) định vị hào động biến và liên kết linh ứng tới 384 Quẻ Xăm Khổng Minh Thần Toán.
- **Cấu trúc trận pháp Tam Tài:**
  1. **Thiên Đạo (Thiên Thời & Vận Hội Khách Quan):** Phản ánh thời vận vũ trụ, thời cơ khách quan, bối cảnh vĩ mô và các biến số bên ngoài chi phối. Tra cứu theo Đại Tượng, Vận Thế và Quẻ Xăm Khổng Minh trích trong Thuyết Minh.
  2. **Địa Đạo (Địa Lợi & Nền Tảng Môi Trường Thực Địa):** Phản ánh thực trạng địa bàn thực tế, nền tảng cơ sở vật chất, tài nguyên sẵn có và vị thế chỗ đứng. Tra cứu theo Cấu trúc quẻ, Tượng hào và Quẻ Xăm Khổng Minh trích trong Thuyết Minh.
  3. **Nhân Đạo (Nhân Hòa & Tâm Thế Con Người Hành Động):** Phản ánh tâm thế nỗ lực chủ quan, tương tác đối nhân xử thế và ý chí quyết sách hành động. Tra cứu theo Dòng Chữ Đỏ (Kim chỉ nam), Lời Khuyên và Quẻ Xăm Khổng Minh trích trong Thuyết Minh.
- **Quy tắc gieo xúc xắc 12 Địa Chi khởi hào động:**
  - Sau khi an vị trận pháp 3 lá Tam Tài, người thỉnh quẻ chọn lá bài muốn khảo sát sâu và gieo xúc xắc 12 mặt (Tý 01 đến Hợi 12):
    - *Số 1 (Tý) & Số 7 (Ngọ):* Động Sơ Hào (Hào 1).
    - *Số 2 (Sửu) & Số 8 (Mùi):* Động Nhị Hào (Hào 2).
    - *Số 3 (Dần) & Số 9 (Thân):* Động Tam Hào (Hào 3).
    - *Số 4 (Mão) & Số 10 (Dậu):* Động Tứ Hào (Hào 4).
    - *Số 5 (Thìn) & Số 11 (Tuất):* Động Ngũ Hào (Hào 5).
    - *Số 6 (Tỵ) & Số 12 (Hợi):* Động Thượng Hào (Hào 6).
  - Hào động làm phát sáng đồ hình quẻ Dịch và mở ra bài thơ **Quẻ Xăm Khổng Minh** (Gia Cát Vũ Hầu Thần Toán) tương ứng, kèm giải nghĩa chi tiết từng câu thơ, điển tích lịch sử, triết lý Đạo học, hành động thuận nghịch và góc nhìn ứng dụng 4 quẻ Dịch: Quẻ Chính, Quẻ Tông (đối phương), Quẻ Hỗ (tiềm ẩn), Quẻ Thác (mặt trái đối lập).
    `,
  },
  {
    id: "changing_lines_rules",
    title: "6. Quy tắc xem Hào Động (Chu Hy - Thái Phát)",
    icon: "Compass",
    summary: "Bảng tổng hợp quy tắc Chu Hy - Thái Phát và hướng dẫn chi tiết từng trường hợp từ 0 đến 6 hào động: cách chọn lời quẻ gốc, quẻ biến hay hào từ.",
    content: `
### QUY TẮC XEM HÀO ĐỘNG (CHU HY - THÁI PHÁT)

Khi chiêm bặc Lục Hào, điểm mấu chốt quyết định sự chuẩn xác nằm ở việc xác định: **khi nào đọc lời Thoán từ của Quẻ gốc, khi nào đọc Hào từ của hào động, khi nào đọc Quẻ biến, và khi nào đọc các hào không động?**

Đại Nho thời Tống là **Chu Hi (Chu Hy)** cùng học giả dịch học kiệt xuất **Thái Nguyên Định (Thái Phát)** đã dày công khảo chứng toàn bộ các trường hợp bói Dịch ghi lại trong cổ thư (đặc biệt là Tả Truyện và Quốc Ngữ) để đúc kết thành **Hệ thống 7 Quy tắc Chu Hy - Thái Phát**, trở thành chuẩn mực kinh điển cho người học Dịch suốt hàng ngàn năm qua.

---

### 📊 BẢNG TỔNG HỢP QUY TẮC CHU HY - THÁI PHÁT

| Số hào động | Cách chọn lời hào / lời quẻ để luận giải |
| :--- | :--- |
| **0 hào động** | Xem **Thoán từ (lời kinh của quẻ gốc)** làm chính; xem thêm Thoán truyện để hiểu bối cảnh. |
| **1 hào động** | Xem duy nhất **Hào từ của hào động** đó ở quẻ gốc. |
| **2 hào động** | Xem **Hào từ của cả 2 hào động** ở quẻ gốc; lấy hào **trên** làm chính, hào **dưới** làm phụ. |
| **3 hào động** | Xem **Thoán từ của cả Quẻ gốc và Quẻ biến**; lấy Quẻ gốc làm quá khứ/hiện tại, Quẻ biến làm tương lai. |
| **4 hào động** | Xem **Hào từ của 2 hào KHÔNG động** ở quẻ biến; lấy hào **dưới** làm chính, hào **trên** làm phụ. |
| **5 hào động** | Xem duy nhất **Hào từ của 1 hào KHÔNG động** ở quẻ biến. |
| **6 hào động** | Xem **Thoán từ của Quẻ biến**. *(Ngoại lệ: Nếu là quẻ Càn/Khôn thì xem lời hào Dụng Cửu / Dụng Lục).* |

---

### 📑 HƯỚNG DẪN CHI TIẾT TỪNG TRƯỜNG HỢP

#### 1. Trường hợp 0 hào động (Quẻ Tĩnh)
- **Hiện tượng:** Khi gieo quẻ (bằng 3 đồng xu hoặc bằng các phương pháp Mai Hoa) không xuất hiện hào lão âm hay lão dương nào biến đổi.
- **Cách đọc:** Tình huống này trạng thái sự việc đang đứng yên, ổn định. Bạn chỉ đọc **Thoán từ (lời tổng quát của Quẻ gốc)** và **Đại Tượng truyện** để tìm lời khuyên, không cần quan tâm đến Quẻ biến vì quẻ không biến.

#### 2. Trường hợp 1 hào động
- **Hiện tượng:** Chỉ có duy nhất một hào thay đổi âm sang dương hoặc dương sang âm.
- **Cách đọc:** Đây là trường hợp phổ biến và dễ luận nhất. Bạn tìm đến đúng **lời Hào từ của hào động đó ở quẻ gốc** để đọc. Lời hào này phản ánh trực tiếp mấu chốt, cát hung của sự việc bạn đang hỏi.

#### 3. Trường hợp 2 hào động
- **Hiện tượng:** Có hai hào cùng động một lúc.
- **Cách đọc:** Đọc **lời Hào từ của cả 2 hào động này ở Quẻ gốc**. Tuy nhiên, để đưa ra quyết định, bạn lấy lời của **hào động nằm ở vị trí cao hơn (phía trên) làm hướng đi chính**, và dùng **hào động phía dưới để bổ trợ thông tin**.

#### 4. Trường hợp 3 hào động
- **Hiện tượng:** Quẻ bị phân đôi (3 hào động, 3 hào tĩnh), năng lượng dịch chuyển ở mức cân bằng 50/50.
- **Cách đọc:** Không đọc lời của bất kỳ hào cụ thể nào. Thay vào đó, bạn đọc **Thoán từ của Quẻ gốc kết hợp với Thoán từ của Quẻ biến**. Quẻ gốc đại diện cho trạng thái ban đầu và nguyên nhân, còn Quẻ biến là kết quả cuối cùng mà sự việc sẽ dẫn tới.

#### 5. Trường hợp 4 hào động
- **Hiện tượng:** Phần lớn các hào đều động (4 hào), chỉ còn 2 hào giữ nguyên.
- **Cách đọc:** Lúc này năng lượng đã dịch chuyển mạnh sang Quẻ biến. Bạn cần **tìm 2 hào KHÔNG động ở Quẻ biến** để đọc. Trong hai hào này, lấy **lời hào ở vị trí thấp hơn (phía dưới) làm trọng tâm luận đoán**, hào trên làm phụ.

#### 6. Trường hợp 5 hào động
- **Hiện tượng:** Gần như toàn bộ quẻ thay đổi, chỉ sót lại đúng 1 hào tĩnh.
- **Cách đọc:** Bạn tập trung vào **1 hào duy nhất KHÔNG động ở Quẻ biến** để đọc lời hào từ. Hào tĩnh duy nhất này đóng vai trò là "trục chốt" giữ cho toàn bộ sự việc không bị sụp đổ hoặc là yếu tố định hình kết quả.

#### 7. Trường hợp cả 6 hào đều động (Lục hào đại động)
- **Hiện tượng:** Tất cả 6 hào âm dương đều đảo ngược vị trí.
- **Cách đọc:** Sự việc biến đổi hoàn toàn, lật ngược thế cờ từ đầu đến cuối.
  - **Quy tắc chung:** Đọc **Thoán từ của Quẻ biến** để xem cái kết mới.
  - **Trường hợp đặc biệt:**
    - Nếu quẻ gốc là **Thuần Càn** (6 hào dương động hóa 6 hào âm thành Thuần Khôn): Đọc lời hào **Dụng Cửu** (用九: Kiến quần long vô thủ, cát).
    - Nếu quẻ gốc là **Thuần Khôn** (6 hào âm động hóa 6 hào dương thành Thuần Càn): Đọc lời hào **Dụng Lục** (用六: Lợi vĩnh trinh).

---

### 💡 CƠ CHẾ TRIẾT LÝ: VÌ SAO CÓ QUY TẮC "DĨ THIỂU VI QUÝ"?

Nhiều người thường thắc mắc: *Tại sao khi có 4 hoặc 5 hào động, ta lại không xem hào động mà lại quay về xem hào tĩnh ở Quẻ biến?*

Câu trả lời nằm ở nguyên lý kinh điển của Kinh Dịch: **"Dĩ thiểu vi quý" (Lấy số ít làm quý)** và **"Độc tĩnh vi tông" (Một điểm tĩnh nắm quyền thống lĩnh)**:
1. **Giai đoạn 1 - 2 hào động:** Đa số các hào trong quẻ còn tĩnh, chỉ có 1 - 2 hào động là thiểu số. Thiểu số này là mầm mống biến chuyển nên nó làm chủ, ta xem hào động ở Quẻ gốc.
2. **Giai đoạn 3 hào động:** Cục diện nửa cũ nửa mới, âm dương cân bằng, nên ta phải nhìn toàn cục thông qua Thoán từ của cả hai quẻ Gốc và Biến.
3. **Giai đoạn 4 - 5 hào động:** Biến động đã lan tràn áp đảo. Lúc này, thế lực mới (Quẻ Biến) đã hình thành. Trong Quẻ Biến đó, 1 hoặc 2 hào không động lại trở thành **thiểu số giữ vai trò điểm tựa then chốt**, là "trục chốt" điều tiết trật tự mới. Do đó ta lấy hào tĩnh của Quẻ Biến làm kim chỉ nam!
4. **Giai đoạn 6 hào động:** Toàn thể vũ trụ lật ngược thế cờ. Quẻ Biến đã thay thế hoàn toàn Quẻ Gốc. Riêng Càn và Khôn là cha mẹ của vạn quẻ, có đức thuần cương và thuần nhu, nên khi cực biến sẽ xuất hiện hai hào cứu cánh vĩ đại là **Dụng Cửu** và **Dụng Lục**.
    `,
  },
  {
    id: "lookup_matrix",
    title: "7. Bảng tra ma trận 64 quẻ Kinh Dịch",
    icon: "Hash",
    summary: "Bảng tra cứu phối quái 8x8 giữa Nội quái (quái dưới) và Ngoại quái (quái trên).",
    content: `
### BẢNG TRA 64 QUẺ KINH DỊCH
Tra cứu số quẻ tương ứng bằng cách phối hợp:
- **Hàng ngang:** Quái NỘI (quái hạ / quẻ ở dưới).
- **Cột dọc:** Quái NGOẠI (quái thượng / quẻ ở trên).
    `,
  },
  {
    id: "iching_story",
    title: "8. Câu chuyện Kinh Dịch (Tiến trình 64 quẻ)",
    icon: "Scroll",
    summary: "Dòng chảy sử thi 64 quẻ theo Tự Quái Truyện: Vì sao quẻ này sinh ra, nối tiếp quẻ trước và dẫn lối quẻ sau.",
    content: `
### CÂU CHUYỆN KINH DỊCH (TIẾN TRÌNH 64 QUẺ)
Mỗi quẻ trong 64 quẻ Kinh Dịch là một mắt xích không thể tách rời trong chuỗi nhân quả của tạo hóa và nhân sinh. Khởi nguồn từ Càn Khôn sinh hóa vạn vật, bước vào gian khó sơ sinh (Truân), được khai trí (Mông), tích dưỡng kiên nhẫn (Nhu)... cho tới việc đã thành (Ký Tế) và vòng xoay bất tận mở ra tương lai mới (Vị Tế).
    `,
  },
  {
    id: "hexagram_interpretations",
    title: "9. Giải thích 64 quẻ (Cẩm nang luận giải)",
    icon: "BookOpen",
    summary: "Trọn bộ 64 quẻ chuẩn sách: Dòng chữ đỏ, Thơ tượng, Đại tượng truyện & Tiểu tượng truyện (Thập Dực), Vận thế, Tình yêu, Câu chuyện Kinh Dịch.",
    content: `
### GIẢI THÍCH 64 QUẺ KINH DỊCH
Mỗi quẻ tương ứng một trang theo đúng thứ tự đánh số trên mặt thẻ (1 đến 64). Bao gồm: Dòng chữ đỏ kim chỉ nam trên lá bài, Thơ tượng & Dịch nghĩa, Luận giải Vận thế & Tình cảm, Toàn văn **Đại Tượng Truyện & Tiểu Tượng Truyện** (Khổng Tử - Thập Dực), cùng **Câu Chuyện Kinh Dịch** (Tự Quái Truyện).

*Sử dụng bộ công cụ tra cứu 64 quẻ bên dưới để xem toàn văn từng quẻ:*
    `,
  },
  {
    id: "khong_minh_bridge",
    title: "10. Liên kết Kinh Dịch & Khổng Minh Thần Quẻ (384 Hào)",
    icon: "Scroll",
    summary: "Cầu nối vũ trụ học: 64 quẻ × 6 hào = 384 hào tương ứng 384 quẻ Khổng Minh Thần Toán kèm Tượng Quẻ, Ý Quẻ và thi phú chỉ dẫn.",
    content: `
### LIÊN KẾT KINH DỊCH & KHỔNG MINH THẦN QUẺ (384 HÀO)

Mỗi quẻ trong 64 quẻ Kinh Dịch gồm 6 hào, tạo thành đồ hình chuyển dịch toàn cảnh gồm đúng **384 hào** (64 quẻ × 6 hào = 384 thời thế).
Trong văn hóa Dịch học và thuật toán số Á Đông, hệ thống **Khổng Minh Thần Quẻ (Khổng Minh Thần Toán - 諸葛神數)** gồm đúng **384 quẻ thần diệu**, tương ứng một-đối-một với 384 hào của 64 quẻ Kinh Dịch theo thứ tự Bát Cung kinh điển:

1. **Khởi Cung Càn (乾宮 • 8 quẻ • 48 hào):** Thiên Vi Càn (乾為天), Thiên Trạch Lý (天澤履), Thiên Hỏa Đồng Nhân (天火同人), Thiên Lôi Vô Vọng (天雷無妄), Thiên Phong Cấu (天風姤), Thiên Thủy Tụng (天水訟), Thiên Sơn Độn (天山遯), Thiên Địa Bĩ (天地否) — *Quẻ Khổng Minh 001 đến 048*.
2. **Cung Đoài (兌宮 • 8 quẻ • 48 hào):** Bát Thuần Đoài (兌為澤), Trạch Hỏa Cách (澤火革), Trạch Lôi Tùy (澤雷隨), Trạch Địa Tụy (澤地萃), Trạch Thiên Quải (澤天夬), Trạch Phong Đại Quá (澤風大過), Trạch Thủy Khốn (澤水困), Trạch Sơn Hàm (澤山咸) — *Quẻ Khổng Minh 049 đến 096*.
3. **Cung Ly (離宮 • 8 quẻ • 48 hào):** Hỏa Vi Ly (離為火), Hỏa Lôi Phệ Hạp (火雷噬嗑), Hỏa Địa Tấn (火地晉), Hỏa Sơn Lữ (火山旅), Hỏa Trạch Khuê (火澤睽), Hỏa Thiên Đại Hữu (火天大有), Hỏa Phong Đỉnh (火風鼎), Hỏa Thủy Vị Tế (火水未濟) — *Quẻ Khổng Minh 097 đến 144*.
4. **Cung Chấn (震宮 • 8 quẻ • 48 hào):** Lôi Vi Chấn (震為雷), Lôi Địa Dự (雷地豫), Lôi Sơn Tiểu Quá (雷山小過), Lôi Thủy Giải (雷水解), Lôi Hỏa Phong (雷火豐), Lôi Trạch Quy Muội (雷澤歸妹), Lôi Thiên Đại Tráng (雷天大壯), Lôi Phong Hằng (雷風恒) — *Quẻ Khổng Minh 145 đến 192*.
5. **Cung Tốn (巽宮 • 8 quẻ • 48 hào):** Phong Vi Tốn (巽為風), Phong Thiên Tiểu Súc (風天小畜), Phong Trạch Trung Phu (風澤中孚), Phong Hỏa Gia Nhân (風火家人), Phong Thủy Hoán (風水渙), Phong Sơn Tiệm (風山漸), Phong Địa Quán (風地觀), Phong Lôi Ích (風雷益) — *Quẻ Khổng Minh 193 đến 240*.
6. **Cung Khảm (坎宮 • 8 quẻ • 48 hào):** Thủy Vi Khảm (坎為水), Thủy Phong Tỉnh (水風井), Thủy Thiên Nhu (水天需), Thủy Trạch Tiết (水澤節), Thủy Sơn Kiển (水山蹇), Thủy Địa Tỷ (水地比), Thủy Lôi Truân (水雷屯), Thủy Hỏa Ký Tế (水火既濟) — *Quẻ Khổng Minh 241 đến 288*.
7. **Cung Cấn (艮宮 • 8 quẻ • 48 hào):** Sơn Vi Cấn (艮為山), Sơn Thủy Mông (山水蒙), Sơn Phong Cổ (山風蠱), Sơn Thiên Đại Súc (山天大畜), Sơn Địa Bác (山地剝), Sơn Lôi Di (山雷頤), Sơn Hỏa Bí (山火賁), Sơn Trạch Tổn (山澤損) — *Quẻ Khổng Minh 289 đến 336*.
8. **Cung Khôn (坤宮 • 8 quẻ • 48 hào):** Địa Vi Khôn (坤為地), Địa Sơn Khiêm (地山謙), Địa Thủy Sư (地水師), Địa Phong Thăng (地風升), Địa Lôi Phục (地雷復), Địa Hỏa Minh Di (地火明夷), Địa Trạch Lâm (地澤臨), Địa Thiên Thái (地天泰) — *Quẻ Khổng Minh 337 đến 384*.

#### Cấu Trúc Toàn Diện Cho Từng Quẻ & Từng Hào:
- **Chữ Hán & Tên Quẻ:** Tên quẻ kèm Chữ Hán nguyên bản (như 乾為天, 天澤履...) và tên dịch nghĩa tiếng Việt.
- **Tượng Quẻ (卦象) & Ý Quẻ (卦意):** Hiển thị cả nguyên văn Chữ Hán, Phiên âm Hán-Việt cùng **Dịch nghĩa chi tiết**, vạch rõ cục diện thời thế.
- **Tượng Hào (爻象) & Ý Hào (爻意):** Ứng với từng hào vị (Sơ Cửu 初九, Cửu Nhị 九二, Lục Tam 六三...), chỉ rõ thế đứng và phương châm hành động.
- **Thơ Khổng Minh Thần Toán (384 Quẻ):** Mỗi hào đính kèm bài thơ nguyên tác Chữ Hán, phiên âm Hán-Việt, bản dịch nghĩa thơ, cùng **giải thích theo điển tích lịch sử, đạo giáo và triết học phương Đông**, giúp người đọc thấu tỏ đạo lý nhân sinh và xử thế an hòa!
    `,
  },
  {
    id: "dealing_with_bad_omens",
    title: "11. Cách xử lý khi gặp quẻ hung & Đạo Dịch",
    icon: "Flame",
    summary: "Độc tắc bất cáo, xem quẻ hung là gương soi sửa mình, phát huy cảm nhận và trực giác.",
    content: `
### CÁCH XỬ LÝ KHI GẶP QUẺ HUNG
Nhiều người sau khi gieo quẻ, phát hiện quẻ tượng không được tốt liền gieo đi gieo lại lần nữa, cứ thế cho đến khi nhận được quẻ tốt mới thôi. **Cách làm này là tuyệt đối không được phép.**

#### 1. “Độc tắc bất cáo” (Hỏi đi hỏi lại bạo nhờn thì không bảo nữa)
Việc lặp đi lặp lại quá trình gieo quẻ cho cùng một vấn đề là một sự thiếu tôn trọng đối với Kinh Dịch và là hành vi tự lừa dối chính mình.
Quẻ Dịch không bao giờ cố ý lừa gạt ai; nó dùng biểu tượng để phản ánh trung thực nhất tình hình thực tế và vạch trần cốt lõi của vấn đề bạn đang đối diện.

#### 2. Quẻ hung chính là chiếc gương soi cảnh tỉnh
Khi bốc phải quẻ hung, điều đó không có nghĩa là số phận đã an bài đen tối, mà chỉ ra rằng: **phương pháp xử lý sự việc hoặc tâm thế hiện tại của bạn đang có sai sót**, nếu cứ khăng khăng tiếp tục sẽ dẫn đến hậu quả bất lợi.

#### 3. Cách chuyển hung thành cát:
- Dựa vào lời khuyên và sự gợi mở của quẻ tượng để điều chỉnh hành vi, cách ứng xử, sửa đổi sai lầm.
- Sau một khoảng thời gian, khi bạn đã thực sự thay đổi tâm thế và hành động, bạn hoàn toàn có thể thỉnh quẻ lại. Khi tình hình thực tế được cải thiện, quẻ tượng ắt hẳn sẽ tự nhiên chuyển hóa thành cát lành!

#### 4. Gieo quẻ không phải là mê tín hay thuyết định mệnh
Quẻ tượng là **kim chỉ nam dẫn đường và khơi mở trực giác**. Bức tranh Tarot Kinh Dịch vẽ theo phong cách tranh khắc gỗ Á Đông nhằm truyền tải thông điệp hình ảnh trực tiếp vào tiềm thức. Hãy vận dụng cảm nhận tĩnh tại, bạn sẽ thấu suốt con đường đúng đắn.
    `,
  },
  {
    id: "colophon",
    title: "12. Về cuốn sách & Bản quyền",
    icon: "Info",
    summary: "Bộ bài Tarot Kinh Dịch 64 quẻ, tranh khắc gỗ Á Đông và triết lý đồng hành cuộc đời.",
    content: `
### VỀ CUỐN SÁCH NÀY
- **Phong cách nghệ thuật:** Tranh minh họa 64 quẻ được vẽ theo lối tranh khắc gỗ Á Đông truyền thống, mang gam màu trầm mặc, uy nghiêm và cổ kính của nghệ thuật mộc bản phương Đông, hòa quyện trọn vẹn cùng hệ thống biểu tượng Kinh Dịch.
- **Tái tạo nguyên bản:** Bộ bài và sách hướng dẫn được dàn trang và số hóa trọn vẹn từ nguyên tác.
- **Triết lý:**
  > *“Sáu mươi tư bức tranh diễn đạt trọng tâm của mỗi quẻ và triết lý bên trong nó. Cuốn sách này giải thích ý nghĩa từng quẻ, cách trải bài và cách đọc quẻ tượng.*
  > *Quẻ Dịch không định đoạt số phận. Nó phản chiếu tình thế hiện tại và gợi mở hướng đi — phần còn lại thuộc về người đọc quẻ.”*

**BÀI TAROT KINH DỊCH • SÁCH THUYẾT MINH**
Bộ bài Kinh Dịch 64 quẻ • Tranh minh họa & thiết kế thẻ thuộc bản quyền nhóm biên soạn.
    `,
  },
];

// Matrix 8x8 for lookup table
export const HEXAGRAM_LOOKUP_MATRIX: {
  inner: { name: string; symbol: string };
  outers: number[]; // 8 values corresponding to Càn, Đoài, Ly, Chấn, Tốn, Khảm, Cấn, Khôn
}[] = [
  { inner: { name: "Càn ☰", symbol: "☰" }, outers: [1, 43, 14, 34, 9, 5, 26, 11] },
  { inner: { name: "Đoài ☱", symbol: "☱" }, outers: [10, 58, 38, 54, 61, 60, 41, 19] },
  { inner: { name: "Ly ☲", symbol: "☲" }, outers: [13, 49, 30, 55, 37, 63, 22, 36] },
  { inner: { name: "Chấn ☳", symbol: "☳" }, outers: [25, 17, 21, 51, 42, 3, 27, 24] },
  { inner: { name: "Tốn ☴", symbol: "☴" }, outers: [44, 28, 50, 32, 57, 48, 18, 46] },
  { inner: { name: "Khảm ☵", symbol: "☵" }, outers: [6, 47, 64, 40, 59, 29, 4, 7] },
  { inner: { name: "Cấn ☶", symbol: "☶" }, outers: [33, 31, 56, 62, 53, 39, 52, 15] },
  { inner: { name: "Khôn ☷", symbol: "☷" }, outers: [12, 45, 35, 16, 20, 8, 23, 2] },
];
