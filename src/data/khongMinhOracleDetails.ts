/**
 * Dữ liệu chi tiết Quẻ xăm Khổng Minh (Gia Cát Vũ Hầu Thần Toán)
 * Cấu trúc chuẩn hóa: Quẻ xăm, Loại xăm, Bài thơ, Dịch nghĩa chi tiết từng câu (Nghĩa đen & Hàm ý),
 * Ý nghĩa quẻ xăm (Luận giải & Tượng số), Lời khuyên hành xử (Nên, Tránh, Thái độ),
 * và Phiên bản đảo ngược 180 độ (khi nghịch vận).
 */

export interface KhongMinhLineDetail {
  lineTitle: string;
  literalMeaning: string; // Nghĩa đen
  implication: string; // Hàm ý
}

export interface KhongMinhInvertedDetail {
  poemHanzi: string;
  poemHaniViet: string;
  poemMeaning: string;
  detailedExplanation: string;
  symbolicFigure: string;
  actionAdvice: string;
}

export interface KhongMinhOracleComprehensive {
  oracleNum: number;
  formattedNum: string; // e.g. "001"
  oracleType: string; // e.g. "Thượng Thượng (Đại Cát)"
  poemHanzi: string;
  poemHaniViet: string;
  poemMeaning: string; // Dịch thơ / Diễn xuôi
  lineExplanations: KhongMinhLineDetail[];
  overallMeaning: {
    detailedExplanation: string; // Luận giải chi tiết
    symbolicFigure: string; // Tượng số
  };
  actionGuidance: {
    doList: string; // Nên làm
    avoidList: string; // Tránh làm
    attitude: string; // Thái độ cần có
  };
  invertedVersion: KhongMinhInvertedDetail;
}

export const KHONG_MINH_ORACLE_DETAILS: Record<number, KhongMinhOracleComprehensive> = {
  80: {
    oracleNum: 80,
    formattedNum: "080",
    oracleType: "Trung Bình",
    poemHanzi: "木向陽春發，三陰又伏根，樵夫不知道，砍去作柴薪。",
    poemHaniViet: "Mộc hướng dương xuân phát, Tam âm hựu phục căn, Tiều phu bất tri đạo, Khảm khứ tác sài tân.",
    poemMeaning:
      "Cây cối hướng về mùa xuân ấm áp mà đâm chồi nảy lộc, nhưng khí lạnh lẽo vẫn còn đang tiềm ẩn dưới rễ sâu. Gã tiều phu ngu ngốc không hiểu được đạo lý sinh tồn ấy, vác búa đốn hạ đem đi làm củi đốt",
    lineExplanations: [
      {
        lineTitle: "Mộc hướng dương xuân phát",
        literalMeaning: "Cây cối hướng về mùa xuân ấm áp mà đâm chồi nảy lộc.",
        implication: "Có tài năng, có khởi đầu tốt, sinh khí hé lộ nhưng cần thời gian tích lũy.",
      },
      {
        lineTitle: "Tam âm hựu phục căn",
        literalMeaning: "Khí lạnh giá vẫn còn tiềm ẩn sâu dưới rễ.",
        implication: "Nguy cơ tiềm ẩn chưa tan, môi trường khắc nghiệt thử thách sức bền.",
      },
      {
        lineTitle: "Tiều phu bất tri đạo",
        literalMeaning: "Gã tiều phu vô tri không hiểu được giá trị sinh tồn ấy.",
        implication: "Bị kẻ phàm phu tục tử và thiển cận coi thường, không nhận ra giá trị.",
      },
      {
        lineTitle: "Khảm khứ tác sài tân",
        literalMeaning: "Đem đốn hạ làm củi đốt tầm thường.",
        implication: "Tài năng bị vùi dập, lãng phí nhân lực và tinh hoa vào những việc phế phẩm.",
      },
    ],
    overallMeaning: {
      detailedExplanation:
        "Quẻ xăm này phản ánh hoàn cảnh của một \"con rồng mắc cạn\" hoặc một người anh hùng bị kẻ phàm phu tục tử coi thường. Bạn có tài năng, có khởi đầu tốt nhưng môi trường hiện tại không hiểu được giá trị của bạn. Bạn dễ bị chèn ép, vùi dập bởi những kẻ thiển cận, coi bạn như những thứ tầm thường vô dụng.",
      symbolicFigure:
        "Có hình tượng cây non vươn cành đón xuân nhưng rễ còn ngậm hàn khí, bị gã tiều phu vô tri đốn hạ làm củi khô. Báo hiệu tài năng bị vùi dập, người không biết nhìn xa làm hỏng việc lớn, vật quý bị lãng phí biến thành phế phẩm.",
    },
    actionGuidance: {
      doList:
        "Biết quý trọng vạn vật, không lãng phí tài nguyên. Bản thân nên tạm thời uốn mình chịu khuất phục, chờ đợi thời cơ mây tuôn mưa dội để thể hiện sức mạnh thực sự.",
      avoidList:
        "Không bộc lộ sự xuất chúng quá sớm ở nơi có nhiều tiểu nhân. Tuyệt đối không hủy hoại đồ vật hay lãng phí nhân lực một cách mù quáng.",
      attitude:
        "Nhẫn nhịn, tĩnh lặng bảo toàn thực lực, điềm đạm trước sự khinh khi.",
    },
    invertedVersion: {
      poemHanzi: "枯木遭寒冬，暖氣透深根，智者明大道，培植作棟梁。",
      poemHaniViet:
        "Khô mộc tao hàn đông, Noãn khí thấu thâm căn, Trí giả minh đại đạo, Bồi thực tác đống lương.",
      poemMeaning:
        "Cây khô héo tao ngộ mùa đông giá rét, nhưng hơi ấm lại xuyên thấu mọc lên từ tận rễ sâu. Bậc trí giả thấu suốt được đại đạo, ra sức vun trồng để tạo thành bậc rường cột.",
      detailedExplanation:
        "Hoàn cảnh tưởng chừng như bế tắc tột cùng, bề ngoài lụi tàn mục nát nhưng thực chất bên trong đang tích tụ sức sống vô cùng mạnh mẽ. Người gieo quẻ may mắn gặp được quý nhân, những người tinh đời nhìn thấu đáo được tiềm năng phi thường ẩn giấu bên trong và dốc lòng bồi dưỡng.",
      actionAdvice:
        "Hãy giữ vững niềm tin, tiếp tục trau dồi bản thân dù hoàn cảnh bề ngoài có khắc nghiệt. Đặt trọn niềm tin vào người đang nâng đỡ và dìu dắt mình.",
      symbolicFigure:
        "Có hình tượng cây khô trong sương giá nhưng rễ vươn hơi ấm, được người trí giả chăm bón thành gỗ quý. Báo hiệu sự hồi sinh kỳ diệu, tài năng tàng ẩn được nhìn nhận và cất nhắc đúng vị trí.",
    },
  },

  1: {
    oracleNum: 1,
    formattedNum: "001",
    oracleType: "Thượng Thượng (Đại Cát)",
    poemHanzi: "天門一掛榜，預定奪標人，馬嘶芳草地，秋高聽鹿鳴。",
    poemHaniViet: "Thiên môn nhất quải bảng, Dự định đoạt tiêu nhân, Mã tê phương thảo địa, Thu cao thính lộc minh.",
    poemMeaning:
      "Cửa trời vừa treo lên tấm bảng vàng, đã định sẵn tên người sẽ đoạt được giải cao nhất. Ngựa hăng hái cất tiếng hí vang trên đồng cỏ thơm tốt tươi, tiết trời thu cao vút nghe tiếng hươu gọi bầy trong trẻo.",
    lineExplanations: [
      {
        lineTitle: "Thiên môn nhất quải bảng",
        literalMeaning: "Bảng vàng vừa được treo lên tại cửa trời.",
        implication:
          "Sự ghi nhận tối cao, danh tính đã được bề trên hoặc cơ quan công quyền công nhận. Mọi nỗ lực đã có kết quả hiển hiện.",
      },
      {
        lineTitle: "Dự định đoạt tiêu nhân",
        literalMeaning: "Đã định sẵn người đoạt lấy cành tiêu (người chiến thắng).",
        implication:
          "Chỉ sự thành công mang tính tất yếu, phần thắng đã nắm chắc trong tay, không ai có thể tranh đoạt được.",
      },
      {
        lineTitle: "Mã tê phương thảo địa",
        literalMeaning: "Ngựa hí vang trên đồng cỏ thơm.",
        implication:
          "Sự đắc ý, tự do tự tại, có môi trường thuận lợi để phát huy hết tài năng và sức lực.",
      },
      {
        lineTitle: "Thu cao thính lộc minh",
        literalMeaning: "Mùa thu trời cao trong xanh, nghe tiếng hươu kêu.",
        implication:
          "Âm thanh của sự thái bình, viên mãn. Chữ 'lộc' (hươu) đồng âm với 'lộc' (tài lộc, bổng lộc), ngụ ý thu hoạch dồi dào về cả danh lẫn lợi.",
      },
    ],
    overallMeaning: {
      detailedExplanation:
        "Hoàn cảnh hiện tại của người gieo quẻ đang bước vào thời kỳ cực thịnh. Mọi nỗ lực học tập, làm việc hay mưu cầu sự nghiệp đều đã đến lúc hái quả ngọt. Không gian xung quanh vô cùng thuận lợi, có đất dụng võ, tài danh đều rạng rỡ.",
      symbolicFigure:
        "Có hình tượng bảng vàng cửa trời đã treo sẵn, ngựa hí vang nơi đồng cỏ xanh tốt, hươu gọi bầy dưới trời thu. Báo hiệu mọi sự mưu cầu đều đi đến thắng lợi rực rỡ, danh hiển tài lộc gõ cửa, vận thế hanh thông tột đỉnh.",
    },
    actionGuidance: {
      doList:
        "Tự tin tiến bước, nắm bắt cơ hội để vươn lên nhận lấy vị trí xứng đáng. Mở rộng các dự án và công việc đang dang dở.",
      avoidList:
        "Tránh thái độ tự cao tự đại, ngủ quên trên chiến thắng mà đánh mất sự cẩn trọng vốn có.",
      attitude:
        "Cương quyết, hoan hỉ nhưng phải giữ sự khiêm nhường để phúc lộc bền vững.",
    },
    invertedVersion: {
      poemHanzi: "地獄重落榜，註定失意人，馬斃枯草地，秋寒聽泣聲。",
      poemHaniViet:
        "Địa ngục trùng lạc bảng, Chú định thất ý nhân, Mã tễ khô thảo địa, Thu hàn thính khấp thanh.",
      poemMeaning:
        "Bảng rớt xuống tận chốn địa ngục, định sẵn là kẻ thất ý ê chề. Ngựa gục chết trên đồng cỏ khô cằn, tiết thu lạnh lẽo chỉ nghe tiếng khóc than.",
      detailedExplanation:
        "Vận thế lao dốc không phanh. Công danh bị tước đoạt hoặc thi cử thất bại thảm hại. Môi trường xung quanh bế tắc, cạn kiệt tài nguyên, mọi hy vọng đều vụt tắt và mang lại nỗi buồn tủi sâu sắc.",
      symbolicFigure:
        "Có hình tượng bảng vàng rớt xuống bùn đen, ngựa gục chết trên cỏ khô, mùa thu lạnh lẽo âm u vẳng tiếng khóc. Báo hiệu danh lợi tiêu tán, sự nghiệp gãy đổ, lâm vào cảnh cùng quẫn bế tắc.",
      actionAdvice:
        "Thu mình tĩnh dưỡng, dừng ngay mọi khoản đầu tư hoặc mưu cầu danh lợi. Chấp nhận nghịch cảnh hiện tại để bảo toàn tính mạng và phần tài sản cốt lõi còn sót lại.",
    },
  },
  325: {
    oracleNum: 325,
    formattedNum: "325",
    oracleType: "Hạ Hạ (Nguy hiểm chí mạng)",
    poemHanzi: "鼠伏穴，本自寧，一露首，貓即跟，揚威伸爪，鼠喪殘生。",
    poemHaniViet:
      "Thử phục huyệt, Bản tự ninh, Nhất lộ thủ, Miêu tức căn, Dương uy thân trảo, Thử tang tàn sinh.",
    poemMeaning:
      "Chuột ẩn nấp trong hang, vốn dĩ đang được bình yên. Vừa mới ló đầu ra, thì mèo đã bám gót theo sát. Mèo vươn vuốt giương oai, chuột mất mạng toi đời.",
    lineExplanations: [
      {
        lineTitle: "Thử phục huyệt, Bản tự ninh",
        literalMeaning: "Chuột nấp trong hang, vốn tự yên ổn.",
        implication:
          "Lời khẳng định: Nếu biết yên phận ở vị trí hiện tại, lùi về vùng an toàn, không bon chen thế sự thì sẽ được bảo toàn tính mạng và tài sản.",
      },
      {
        lineTitle: "Nhất lộ thủ, Miêu tức căn",
        literalMeaning: "Vừa ló đầu ra, mèo đi theo liền.",
        implication:
          "Sự xuất đầu lộ diện, phô trương, hay khởi sự mới lúc này là cực kỳ nguy hiểm. Kẻ thù (mèo - khắc tinh) đang rình rập cực kỳ gắt gao, chỉ chờ bạn sơ hở để tiêu diệt.",
      },
      {
        lineTitle: "Dương uy thân trảo",
        literalMeaning: "Giương oai duỗi vuốt.",
        implication:
          "Đối thủ quá mạnh, hung hãn, quyền lực và tàn nhẫn, áp đảo hoàn toàn so với thực lực bé nhỏ của bạn.",
      },
      {
        lineTitle: "Thử tang tàn sinh",
        literalMeaning: "Chuột mất mạng tàn.",
        implication:
          "Kết cục bi thảm: phá sản, mất mạng, bại lộ bí mật, tai họa giáng xuống không thể chống đỡ nổi nếu cố chấp bước ra ngoài.",
      },
    ],
    overallMeaning: {
      detailedExplanation:
        "Thời vận vô cùng hung hiểm, nguy cơ mất trắng kề cận. Bạn đang ở thế yếu (chuột), xung quanh có kẻ mạnh, sự hà khắc của pháp luật hoặc đối thủ đáng gờm (mèo) chực chờ vùi dập. Bất cứ hành động tranh giành, phô diễn hay mạo hiểm nào lúc này đều tựa như đâm đầu vào chỗ chết. Phương châm sinh tồn duy nhất là 'Tĩnh thì sống, động thì chết'.",
      symbolicFigure:
        "Có hình tượng con chuột vốn dĩ nấp yên trong hang nhưng vừa ló đầu ra liền bị mèo vồ theo giương oai duỗi vuốt, rốt cuộc chuột mất mạng toi đời. Báo hiệu hoàn cảnh tràn ngập sát cơ hiểm độc, kẻ thù hùng mạnh đang rình rập, tuyệt đối phải ẩn mình nằm im, hễ manh động xuất đầu lộ diện ắt chuốc họa diệt thân.",
    },
    actionGuidance: {
      doList:
        "Ẩn mình, nằm im bất động, giữ bí mật tuyệt đối, an phận thủ thường trong 'hang ổ' của mình. Cắt giảm tối đa các mối quan hệ xã giao.",
      avoidList:
        "Cấm kỵ xuất đầu lộ diện, cấm tranh chấp, kiện tụng, cấm khoe khoang tiền tài, cấm mở rộng kinh doanh hay đi xa.",
      attitude:
        "Sợ hãi trước rủi ro, cẩn trọng tột độ, nhẫn nhục lùi bước để bảo toàn mạng sống.",
    },
    invertedVersion: {
      poemHanzi: "虎出林，本自威，一嘯吼，獸即逃，揚首昂步，虎享餘生。",
      poemHaniViet:
        "Hổ xuất lâm, Bản tự uy, Nhất khiếu hống, Thú tức đào, Dương thủ ngang bộ, Hổ hưởng dư sinh.",
      poemMeaning:
        "Hổ bước ra khỏi rừng, vốn dĩ đã vô cùng oai phong lẫm liệt. Vừa cất tiếng gầm rống, muôn thú liền hốt hoảng tháo chạy. Ngẩng cao đầu sải bước hiên ngang, hổ oai vệ tận hưởng nốt quãng đời còn lại.",
      detailedExplanation:
        "Bạn đang nắm giữ sức mạnh tuyệt đối, uy quyền áp đảo mọi đối thủ xung quanh. Đây là thời cơ vàng để bạn bước ra ánh sáng, phô diễn tài năng và khẳng định vị thế bá chủ. Chỉ cần bạn lên tiếng, mọi chướng ngại vật sẽ tự động hoảng sợ lùi bước, mang lại thành quả vinh quang và sự tự tại tuyệt đối.",
      symbolicFigure:
        "Có hình tượng chúa tể sơn lâm bước ra khỏi rừng phô diễn uy phong, cất tiếng gầm làm muôn thú hoảng sợ tháo chạy, hiên ngang sải bước tận hưởng tháng ngày tự tại. Báo hiệu thực lực hùng hậu áp đảo quần hùng, thời cơ vươn mình tỏa sáng đã đến, hễ xuất kích ắt thâu tóm đại cục chẳng ai dám cản bước.",
      actionAdvice:
        "Tự tin xuất kích, đánh phủ đầu đối phương. Không cần phải ẩn nhẫn hay nhún nhường bất kỳ ai, hãy dùng uy thế của mình để thâu tóm cục diện.",
    },
  },
};

/**
 * Helper làm sạch và dịch chuẩn nghĩa thơ thuần Việt
 */
function cleanPureVietnameseMeaning(raw: string): string {
  if (!raw) return "";
  let s = raw.split("Điển tích")[0]
    .replace(/^Dịch nghĩa thơ:\s*["']?/, "")
    .replace(/["']?\s*\.?$/, "")
    .trim();

  // Loại bỏ các lỗi dịch máy và từ ngữ thô
  s = s.replace(/Tài ngựa lưỡng thông mang/g, "Tiền tài xe ngựa đôi đường hối hả");
  s = s.replace(/Quan hươu có định phương/g, "Đường quan lộc công danh đã có phương hướng định sẵn");
  s = s.replace(/Heo dê trâu chó/g, "Heo, dê, trâu, chó trong chuồng trại");
  s = s.replace(/Tự khứ minh chủ trương/g, "Tự mình định đoạt chủ trương việc nhà");
  s = s.replace(/Dê uy đẩu tẩu/g, "Giương oai dũng mãnh rung chuyển");
  s = s.replace(/Dòng sông phạ người đa/g, "Nào sợ người đông thế mạnh");
  s = s.replace(/Hổ khiếu xuất núi non oa/g, "Hổ gầm vang bước ra khỏi hang núi");
  s = s.replace(/Sâu thẳm núi non cứ hổ dữ rừng sâu/g, "Nơi núi sâu hổ dữ ngự trị");
  s = s.replace(/Sự dòng sông lo âu/g, "Việc gì phải lo âu");
  s = s.replace(/Tấm lòng dĩ định/g, "Tâm ý đã định vững vàng");
  s = s.replace(/Nay lân dĩ trên câu/g, "Cá chép vảy vàng đã cắn câu");
  s = s.replace(/Công danh sự nghiệp một võng mùa thu/g, "Một mẻ lưới thu trọn cả công danh phú quý");
  s = s.replace(/Mưu dĩ định/g, "Mưu kế đã định liệu chu toàn");
  s = s.replace(/Chiếu vầng trăng trên trùng lâu/g, "Ánh trăng chiếu rọi lầu gác cao vút");
  s = s.replace(/Mây trong lòng khách điểm đầu/g, "Khách quý chốn mây ngàn mỉm cười gật đầu");
  s = s.replace(/Cơn sóng gió dòng sông túc kỵ/g, "Sóng gió cuộc đời có gì đáng ngại");
  s = s.replace(/Ngộ hiểm chẳng tu lo âu/g, "Gặp chốn hiểm nguy chẳng cần lo sợ");
  s = s.replace(/Dừng lại xích trong trẻo mây con đường/g, "Đường mây xanh hiển đạt chỉ ở ngay gang tấc");
  s = s.replace(/Dòng sông tất ngộ ba lan/g, "Hà tất phải vướng vào sóng gió ba đào");
  s = s.replace(/Dĩ thôn câu trên nhĩ/g, "Cá đã nuốt trọn mồi câu");
  s = s.replace(/Dòng sông dụng tảo đắn đo do dự/g, "Cần gì phải sớm đắn đo do dự");
  s = s.replace(/dòng sông tu/gi, "việc gì phải");
  s = s.replace(/dòng sông tất/gi, "cần gì phải");
  s = s.replace(/dòng sông như/gi, "sao bằng");
  s = s.replace(/như dòng sông như dòng sông/gi, "phải ứng xử thế nào");
  s = s.replace(/dê uy/gi, "giương oai");
  s = s.replace(/dê khí/gi, "dương khí");
  s = s.replace(/thử núi non phục huyệt/gi, "chuột nấp trong hang");
  s = s.replace(/thử táng tàn sinh sôi/gi, "chuột mất mạng tàn");
  s = s.replace(/một con đường thủ/gi, "vừa mới ló đầu ra");
  s = s.replace(/núi non oa/gi, "hang núi");
  s = s.replace(/hoàng nay/gi, "vàng ròng");
  s = s.replace(/nay bảng/gi, "bảng vàng");
  s = s.replace(/mùa đông bôn tây tẩu/gi, "chạy ngược chạy xuôi đông tây");
  s = s.replace(/mặt trời mùa đông thăng/gi, "mặt trời mọc từ phương đông");
  s = s.replace(/thành tựu/gi, "thành");
  s = s.replace(/phẩm đức/gi, "đức hạnh");

  // Dọn dẹp dấu câu kết thúc và khoảng trắng
  s = s.replace(/["']\s*\.?$/, "").replace(/["']\.$/, "").replace(/\.\s*\.+$/, ".").trim();
  s = s.replace(/^["']+|["']+$/g, "").trim();
  if (s.length > 0 && !s.endsWith(".")) {
    s += ".";
  }
  if (s.length > 0) {
    s = s.charAt(0).toUpperCase() + s.slice(1);
  }

  return s;
}

/**
 * Xác định phân hạng loại xăm chuẩn xác theo nội hàm quẻ
 */
function determineOracleType(
  hanzi: string,
  text: string,
  meaning: string,
  canonicalYao?: any
): string {
  const combined = (hanzi + " " + text + " " + meaning).toLowerCase();

  // Cực hung (Hạ Hạ)
  if (
    combined.includes("táng tàn sinh") ||
    combined.includes("tang tàn sinh") ||
    combined.includes("chết") ||
    combined.includes("diệt thân") ||
    combined.includes("mất mạng") ||
    combined.includes("lạc bế tắc") ||
    combined.includes("đại hung") ||
    combined.includes("họa giáng")
  ) {
    return "Hạ Hạ (Nguy hiểm chí mạng)";
  }

  // Hung hiểm (Hạ Hung)
  if (
    combined.includes("gian nan") ||
    combined.includes("trắc trở") ||
    combined.includes("hung hiểm") ||
    combined.includes("nguy") ||
    combined.includes("sầu") ||
    combined.includes("bế tắc") ||
    combined.includes("tai họa") ||
    combined.includes("rối ren")
  ) {
    return "Hạ Hung (Gian Nan Trắc Trở)";
  }

  // Cực cát (Thượng Thượng)
  if (
    combined.includes("đoạt tiêu") ||
    combined.includes("thiên đình") ||
    combined.includes("quải bảng") ||
    combined.includes("thanh vân") ||
    combined.includes("đại cát") ||
    combined.includes("bảng vàng") ||
    combined.includes("cực thịnh") ||
    combined.includes("phong hầu") ||
    combined.includes("long đằng")
  ) {
    return "Thượng Thượng (Đại Cát)";
  }

  // Cát tường (Thượng Cát)
  if (
    combined.includes("kim lân") ||
    combined.includes("thành toàn") ||
    combined.includes("quý nhân") ||
    combined.includes("thắng lợi") ||
    combined.includes("hanh thông") ||
    combined.includes("đắc ngọc") ||
    combined.includes("lợi") ||
    (canonicalYao?.favorableAction && canonicalYao.favorableAction.includes("lớn"))
  ) {
    return "Thượng Cát (Cát Tường Hanh Thông)";
  }

  // Trung Cát
  if (
    combined.includes("an ổn") ||
    combined.includes("bình an") ||
    combined.includes("vui vẻ") ||
    combined.includes("hân hân") ||
    combined.includes("xuân") ||
    combined.includes("tự ninh") ||
    combined.includes("tốt đẹp")
  ) {
    return "Trung Cát (Bình An Thuận Lợi)";
  }

  // Cẩn trọng / Khởi đầu
  if (
    combined.includes("sơ") ||
    combined.includes("khởi") ||
    combined.includes("non nớt") ||
    combined.includes("cẩn trọng")
  ) {
    return "Hạ Cát (Cẩn Trọng Khởi Đầu)";
  }

  // Mặc định: Trung Bình
  return "Trung Bình (Thủ Hộ Đợi Thời)";
}

/**
 * Lấy chi tiết toàn diện của Quẻ xăm Khổng Minh theo cấu trúc chuẩn hoá.
 * Nếu đã có bản tinh chỉnh thì trả về trực tiếp, nếu chưa có thì tổng hợp linh hoạt từ dữ liệu nền.
 */
export const getKhongMinhComprehensive = (
  oracleNum: number,
  fallbackLineItem?: any,
  canonicalYao?: any,
  hexName?: string
): KhongMinhOracleComprehensive => {
  if (KHONG_MINH_ORACLE_DETAILS[oracleNum]) {
    return KHONG_MINH_ORACLE_DETAILS[oracleNum];
  }

  const formattedNum = String(oracleNum).padStart(3, "0");
  const poemHanzi = fallbackLineItem?.oracleHanzi || "";
  const poemHaniViet = fallbackLineItem?.oracleText || "";
  const cleanMeaning = cleanPureVietnameseMeaning(fallbackLineItem?.oracleMeaning || "");

  // Phân hạng loại xăm chuẩn
  const oracleType = determineOracleType(poemHanzi, poemHaniViet, cleanMeaning, canonicalYao);

  // Xây dựng giải nghĩa chi tiết từng câu thơ chuẩn hoá
  let lineExplanations: KhongMinhLineDetail[] = [];
  if (fallbackLineItem?.poemSegments && fallbackLineItem.poemSegments.length > 0) {
    lineExplanations = fallbackLineItem.poemSegments.map((seg: any, idx: number) => {
      const rawTitle = seg.transcription || `Câu ${idx + 1}`;
      const lineTitle = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1);
      const literal = cleanPureVietnameseMeaning(seg.meaning || "Lời câu thơ hàm súc ý vị.");
      
      // Xây dựng hàm ý sâu sắc theo từng phân đoạn
      let implication = seg.analysis || "";
      if (
        !implication ||
        implication.startsWith("Khởi đầu câu thơ") ||
        implication.startsWith("Chuyển tiếp câu thơ") ||
        implication.includes("diễn biến tâm cảnh")
      ) {
        if (idx === 0) {
          implication = `Xác lập bối cảnh ban đầu của thời vận. Gợi ý trạng thái khởi thủy, cần nhận diện chính xác chỗ đứng thực tế của bản thân trước thời cuộc.`;
        } else if (idx === 1) {
          implication = `Điểm chuyển giao mấu chốt: Thời thế bắt đầu xuất hiện sự tương tác với môi trường bên ngoài. Cần sự cẩn trọng và chuẩn bị chu đáo để đón nhận biến chuyển.`;
        } else if (idx === 2) {
          implication = `Thử thách hoặc cơ hội trực diện: Biểu thị sức ép hoặc vận hội bùng nổ, đòi hỏi sự kiên định, bản lĩnh không dao động.`;
        } else {
          implication = `Kết quả tất yếu của quá trình hành động: Nhắc nhở quy luật nhân quả, nếu thuận theo lẽ phải ắt thu hoạch tốt lành, nếu mù quáng sẽ chuốc lấy hối tiếc.`;
        }
      }

      return {
        lineTitle,
        literalMeaning: literal,
        implication,
      };
    });
  } else {
    lineExplanations = [
      {
        lineTitle: poemHaniViet.split(".")[0] || "Câu khởi",
        literalMeaning: cleanMeaning.split(".")[0] || "Hình tượng mở đầu của quẻ xăm.",
        implication: "Thời cơ bắt đầu chuyển động, cần nắm bắt chính đạo và định liệu phương hướng chu toàn.",
      },
    ];
  }

  // Luận giải chi tiết & Tượng số
  const isHung = oracleType.includes("Hạ") || oracleType.includes("Hung");
  const isDaiCat = oracleType.includes("Thượng Thượng") || oracleType.includes("Thượng Cát");

  const detailedExplanation = isHung
    ? `Thời vận lúc này đang gặp nhiều hiểm trở, trắc trở rình rập tứ phía. Bản thân ở thế bất lợi hoặc môi trường xung quanh có nhiều rào cản hung hiểm. Mọi mưu cầu nóng vội hay hành động phô trương lúc này đều tiềm ẩn nguy cơ chuốc lấy tổn thất nặng nề. Phương châm sinh tồn và bảo toàn tốt nhất lúc này là: "Tĩnh thì lành, động thì nguy; ẩn nhẫn chờ thời, không tranh đua thế sự".`
    : isDaiCat
    ? `Thời vận của người gieo quẻ đang bước vào thời kỳ hanh thông rực rỡ. Mọi nỗ lực, tích lũy công sức và mưu cầu từ trước đến nay đều đã hội tụ đủ duyên lành để đơm hoa kết trái. Cơ hội thăng tiến, tài danh và sự nghiệp rộng mở thênh thang. Cần nắm bắt thời cơ vàng để vươn lên xác lập vị thế vững chắc, song phải giữ đức khiêm cung để phúc trạch dài lâu.`
    : `Thời vận đang ở giai đoạn bình ổn, tiến thoái đều có chừng mực. Bối cảnh không quá hiểm nguy nhưng chưa phải thời điểm bung hết sức lực để mạo hiểm. Cần hành sự tuần tự từng bước, giữ vững chữ tín và sự chân thành, củng cố nội lực từ bên trong để chuẩn bị cho bước tiến dài tiếp theo.`;

  const figureSummary = cleanMeaning.split(".")[0] || (fallbackLineItem?.tuongHao || "Thời thế đang vận chuyển tuần hoàn");
  const symbolicFigure = isHung
    ? `Có hình tượng ${figureSummary}. Báo hiệu hoàn cảnh ẩn chứa nhiều nguy cơ rủi ro, kẻ xấu hoặc rào cản khắc nghiệt đang chờ đợi; tuyệt đối phải cẩn mật giữ mình, không được khinh suất manh động kẻo rước họa vào thân.`
    : isDaiCat
    ? `Có hình tượng ${figureSummary}. Báo hiệu mọi sự mưu cầu đều đi đến thắng lợi rực rỡ, quý nhân trợ lực, thời cơ vươn mình tỏa sáng đã đến trọn vẹn.`
    : `Có hình tượng ${figureSummary}. Báo hiệu cuộc diện dẫu có biến động nhưng vẫn trong tầm kiểm soát, giữ tâm ngay thẳng ắt gặt hái kết quả an hòa.`;

  const doList = canonicalYao?.favorableAction || (isHung
    ? "Thu mình tĩnh dưỡng, củng cố phòng thủ, giữ bí mật thông tin, an phận thủ thường trong phạm vi an toàn."
    : isDaiCat
    ? "Tự tin tiến bước, nắm bắt cơ hội vàng, mở rộng kế hoạch và liên kết với đối tác uy tín."
    : "Làm tốt phận sự hiện tại, tích lũy kiến thức và tài lực, đối nhân xử thế hòa nhã.");

  const avoidList = canonicalYao?.unfavorableAction || (isHung
    ? "Cấm kỵ manh động xuất đầu lộ diện, cấm tranh chấp hơn thua, cấm đầu tư mạo hiểm hoặc đi xa."
    : isDaiCat
    ? "Tránh thói kiêu căng tự mãn, ngủ quên trên chiến thắng, coi thường cấp dưới hoặc đối tác."
    : "Tránh nôn nóng đốt cháy giai đoạn, nghi kỵ vô căn cứ.");

  const attitude = isHung
    ? "Cẩn trọng tột độ, kính sợ trước rủi ro, nhẫn nại lùi bước để bảo toàn sinh lực và tài sản."
    : isDaiCat
    ? "Hân hoan, quyết đoán, tự tin nhưng luôn giữ lòng khiêm nhường, lấy đức độ cảm hóa nhân tâm."
    : "Bình tĩnh, điềm đạm, tùy thời biến hóa theo lẽ tự nhiên.";

  // Phiên bản đảo ngược 180 độ (Đối xứng âm dương: Hung đảo thành Cát, Cát đảo thành Hung)
  let invertedVersion: KhongMinhInvertedDetail;
  if (isHung) {
    invertedVersion = {
      poemHanzi: "虎出林，本自威，一嘯吼，獸即逃，揚首昂步，虎享餘生。",
      poemHaniViet: "Hổ xuất lâm, Bản tự uy, Nhất khiếu hống, Thú tức đào, Dương thủ ngang bộ, Hổ hưởng dư sinh.",
      poemMeaning:
        "Hổ bước ra khỏi rừng, vốn dĩ đã vô cùng oai phong lẫm liệt. Vừa cất tiếng gầm rống, muôn thú liền hốt hoảng tháo chạy. Ngẩng cao đầu sải bước hiên ngang, hổ oai vệ tận hưởng nốt quãng đời còn lại.",
      detailedExplanation:
        "Khi thoát khỏi thế yếu và chuyển mình sang thời kỳ bứt phá, bạn nắm giữ sức mạnh tuyệt đối và uy quyền áp đảo. Đây là thời cơ vàng để bước ra ánh sáng, phô diễn tài năng và khẳng định vị thế dẫn đầu. Mọi trở ngại đều tự động lùi bước.",
      actionAdvice:
        "Tự tin xuất kích, nắm thế chủ động dẫn dắt cuộc chơi. Không cần phải nhún nhường e sợ, hãy dùng uy tín và thực lực để định đoạt đại cục.",
      symbolicFigure:
        "Có hình tượng chúa sơn lâm bước ra khỏi rừng sâu phô diễn uy lực, cất tiếng gầm khiến muôn thú khiếp sợ tháo lui, hiên ngang tự tại. Báo hiệu cục diện chuyển nguy thành an, nắm chắc phần thắng trong tay.",
    };
  } else {
    invertedVersion = {
      poemHanzi: "地獄重落榜，註定失意人，馬斃枯草地，秋寒聽泣聲。",
      poemHaniViet: "Địa ngục trùng lạc bảng, Chú định thất ý nhân, Mã tễ khô thảo địa, Thu hàn thính khấp thanh.",
      poemMeaning:
        "Bảng rớt xuống tận chốn địa ngục, định sẵn là kẻ thất ý ê chề. Ngựa gục chết trên đồng cỏ khô cằn, tiết thu lạnh lẽo chỉ nghe tiếng khóc than.",
      detailedExplanation:
        "Mặt trái nguy hiểm nếu để thói tự mãn và khinh suất chi phối: Vận thế có thể lao dốc không phanh, công danh tan biến, cơ nghiệp đổ gãy. Môi trường cạn kiệt nguồn lực và hy vọng vụt tắt nếu không biết giữ gìn sự cẩn trọng vốn có.",
      actionAdvice:
        "Ngay lập tức rà soát lại mọi lỗ hổng, kiềm chế tham vọng bành trướng vô độ. Chuẩn bị quỹ dự phòng rủi ro và biết điểm dừng an toàn.",
      symbolicFigure:
        "Có hình tượng bảng vàng rơi xuống bùn đen, tuấn mã kiệt sức nơi cỏ khô, gió lạnh thê lương. Cảnh báo tai họa sụp đổ bất ngờ nếu hành xử ngạo mạn, đánh mất chính đạo.",
    };
  }

  return {
    oracleNum,
    formattedNum,
    oracleType,
    poemHanzi,
    poemHaniViet,
    poemMeaning: cleanMeaning,
    lineExplanations,
    overallMeaning: {
      detailedExplanation,
      symbolicFigure,
    },
    actionGuidance: {
      doList,
      avoidList,
      attitude,
    },
    invertedVersion,
  };
};
