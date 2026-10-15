/**
 * Dữ Liệu Tượng Truyện 64 Quẻ Kinh Dịch (Khổng Tử - Thập Dực)
 * Gồm: Đại Tượng Truyện (toàn quẻ) & Tiểu Tượng Truyện (từng hào 1 đến 6).
 * Chuẩn xác nguyên văn Hán Việt & Dịch nghĩa kinh điển.
 */

export interface LineXiangzhuan {
  line: number; // 1 to 6
  lineName: string; // Sơ Cửu / Sơ Lục, Cửu Nhị / Lục Nhị...
  xiangOriginal: string; // Tượng viết: ... (Phiên âm Hán Việt)
  xiangMeaning: string; // Dịch nghĩa lời Tiểu Tượng
  explanation: string; // Giải thích chi tiết dịch lý & bài học ứng biến của hào
}

export interface HexagramXiangzhuan {
  number: number;
  name: string;
  vietnameseName: string;
  daxiang: {
    original: string; // Tượng viết: ... (Hán Việt)
    meaning: string; // Dịch nghĩa Đại Tượng
    explanation: string; // Giải thích chi tiết triết lý Đại Tượng Truyện & đạo quân tử
  };
  xiaoxiang: LineXiangzhuan[]; // Đầy đủ 6 hào
}

export const XIANGZHUAN_DATA: Record<number, HexagramXiangzhuan> = {
  "1": {
    "number": 1,
    "name": "Thuần Càn",
    "vietnameseName": "Càn Vi Thiên (Trời cương kiện)",
    "daxiang": {
      "original": "Thiên hành kiện, quân tử dĩ tự cường bất tức.",
      "meaning": "Trời vận hành mạnh mẽ không ngừng nghỉ, người quân tử noi theo đó mà tự lực tự cường, không một phút giây nào ngơi nghỉ.",
      "explanation": "Quẻ Càn thuần dương gồm hai quẻ Càn chồng lên nhau, biểu thị thiên đạo vận hành chí cương chí kiện. 'Kiện' là sức mạnh sinh hóa vô biên, xoay vần bốn mùa không sai lệch một li. Người quân tử học tập quy luật của Trời: muốn làm nên đại nghiệp phải không ngừng tu thân, rèn luyện ý chí sắt đá, chủ động nắm giữ vận mệnh và tiến bước vững vàng."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Cửu",
        "xiangOriginal": "Tượng viết: Tiềm long vật dụng, dương tại hạ dã.",
        "xiangMeaning": "Rồng còn lặn chớ dùng, vì khí dương còn ở tận dưới đáy.",
        "explanation": "Thời cơ chưa tới, tài năng phải giấu kín tích lũy nội lực, chớ vội manh động."
      },
      {
        "line": 2,
        "lineName": "Cửu Nhị",
        "xiangOriginal": "Tượng viết: Hiện long tại điền, đức thi phổ dã.",
        "xiangMeaning": "Rồng hiện trên đồng, ân đức ban bố rộng khắp muôn nơi.",
        "explanation": "Tài năng bắt đầu phát lộ, gặp quý nhân và bạn hiền nâng đỡ, nên kết giao bậc tài đức."
      },
      {
        "line": 3,
        "lineName": "Cửu Tam",
        "xiangOriginal": "Tượng viết: Chung nhật càn càn, hành sự đạo dã.",
        "xiangMeaning": "Cả ngày nỗ lực hăng hái, hành sự đúng theo đường lối chính đạo.",
        "explanation": "Ở vị trí chông chênh, cả ngày phải thận trọng tu thân, tối về tự kiểm điểm để tránh sai lầm."
      },
      {
        "line": 4,
        "lineName": "Cửu Tứ",
        "xiangOriginal": "Tượng viết: Hoặc dược tại uyên, tiến vô cữu dã.",
        "xiangMeaning": "Hoặc nhảy vọt nơi vực sâu, tiến lên sẽ không có lỗi gì.",
        "explanation": "Đứng trước bước ngoặt lớn, tiến thoái linh hoạt; khi thời cơ chín muồi thì can đảm bứt phá."
      },
      {
        "line": 5,
        "lineName": "Cửu Ngũ",
        "xiangOriginal": "Tượng viết: Phi long tại thiên, đại nhân tạo dã.",
        "xiangMeaning": "Rồng bay trên trời xanh, bậc đại nhân làm nên sự nghiệp huy hoàng.",
        "explanation": "Ngôi chí tôn trung chính, thời vận hanh thông rực rỡ nhất; đem tài đức phụng sự muôn dân."
      },
      {
        "line": 6,
        "lineName": "Thượng Cửu",
        "xiangOriginal": "Tượng viết: Kháng long hữu hối, cùng chi tai dã.",
        "xiangMeaning": "Rồng bay quá cao sinh hối hận, vì đến bước cùng cực ắt chuốc lấy tai họa.",
        "explanation": "Ở đỉnh cao danh vọng nếu tự kiêu tự mãn sẽ rơi vào cô lập; bài học biết thoái lui đúng lúc."
      },
      {
        "line": 7,
        "lineName": "Dụng Cửu (Động 6 Hào)",
        "xiangOriginal": "Tượng viết: Dụng cửu, thiên đức bất khả vi thủ dã.",
        "xiangMeaning": "Tượng nói rằng: Dùng chín, đức của Trời không thể tự xưng mình làm đầu vậy.",
        "explanation": "Toàn quẻ Càn biến Khôn; đạo Trời nuôi dưỡng vạn vật mà chẳng hề kể công hay tranh đoạt danh vị đứng đầu. Người đại trí đại dũng biết dung hòa cương nhu, lấy khiêm hạ nhu thuận làm trọng thì vạn sự đại cát viên thành."
      }
    ]
  },
  "2": {
    "number": 2,
    "name": "Khôn Vi Địa",
    "vietnameseName": "Thuần Khôn (Đất mẹ nhu thuận)",
    "daxiang": {
      "original": "Địa thế khôn, quân tử dĩ hậu đức tải vật.",
      "meaning": "Đất có thế sâu dày rộng lớn, người quân tử noi theo đó mà bồi đắp đức dày để bao dung nâng đỡ muôn loài.",
      "explanation": "Quẻ Khôn thuần âm, đất mẹ tĩnh tại nâng đỡ vạn vật mà chẳng hề tranh công. Người quân tử noi gương đất mẹ, lấy sự khoan dung độ lượng làm gốc, lấy nhu chế cương, lấy tĩnh chế động, biết nhẫn nhịn và thầm lặng cống hiến để cùng thành công."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Lục",
        "xiangOriginal": "Tượng viết: Lý sương kiên băng, âm thủy ngưng dã. Thuận bỉ đạo, chí kiên băng dã.",
        "xiangMeaning": "Giẫm lên sương biết băng dày sắp tới, khí âm bắt đầu ngưng tụ. Thuận theo quy luật thì băng dày sẽ đến.",
        "explanation": "Thấy dấu hiệu nhỏ đã phải đoán trước nguy cơ lớn, ngăn chặn cái xấu từ khi mới manh nha."
      },
      {
        "line": 2,
        "lineName": "Lục Nhị",
        "xiangOriginal": "Tượng viết: Lục nhị chi động, trực dĩ phương dã. Bất tập vô bất lợi, địa đạo quang dã.",
        "xiangMeaning": "Hào Lục Nhị vận động chính trực và vuông vức. Không cần học mà việc gì cũng lợi, vì đạo đất sáng sủa.",
        "explanation": "Lòng thẳng thắn, nết đoan chính, tâm bao la; giữ trọn bản tính lương thiện tự nhiên được phúc lành."
      },
      {
        "line": 3,
        "lineName": "Lục Tam",
        "xiangOriginal": "Tượng viết: Hàm chương khả trinh, dĩ thời phát dã. Hoặc tòng vương sự, tri quang đại dã.",
        "xiangMeaning": "Gậm giấu tài đức mà giữ vững chính đạo, tùy thời mà phát tiết. Theo việc triều chính, trí tuệ quang minh rộng lớn.",
        "explanation": "Có tài nhưng không phô trương khoe khoang; hết lòng vì việc chung, không tranh công giành danh."
      },
      {
        "line": 4,
        "lineName": "Lục Tứ",
        "xiangOriginal": "Tượng viết: Quát nang vô cữu, thận bất hại dã.",
        "xiangMeaning": "Buộc kín miệng túi thì không lỗi, cẩn trọng kín đáo thì không ai hại được.",
        "explanation": "Ở gần kẻ quyền thế nguy hiểm, giữ miệng kín như bưng, không thị phi thì bảo toàn thân mình."
      },
      {
        "line": 5,
        "lineName": "Lục Ngũ",
        "xiangOriginal": "Tượng viết: Hoàng thường nguyên cát, văn tại trung dã.",
        "xiangMeaning": "Xiêm y màu vàng điều đại cát, vẻ đẹp văn vẻ ở ẩn nơi trung đạo.",
        "explanation": "Ở ngôi cao mà khiêm nhu đoan trang, lấy đức phục người thì đạt điều tốt lành viên mãn."
      },
      {
        "line": 6,
        "lineName": "Thượng Lục",
        "xiangOriginal": "Tượng viết: Long chiến vu dã, kỳ đạo cùng dã.",
        "xiangMeaning": "Rồng đánh nhau nơi đồng nội, đạo âm đã đến lúc cùng cực.",
        "explanation": "Âm thịnh tranh quyền với dương thì đổ máu tang thương; bài học không lộng quyền soán nghịch."
      },
      {
        "line": 7,
        "lineName": "Dụng Lục (Động 6 Hào)",
        "xiangOriginal": "Tượng viết: Dụng lục dĩ vĩnh trinh, đại chung dã.",
        "xiangMeaning": "Tượng nói rằng: Dùng sáu để mãi giữ lòng chính bền, ấy là kết cục lớn lao tốt đẹp viên mãn vậy.",
        "explanation": "Toàn quẻ Khôn biến Càn; đạo Khôn nhu thuận chuyển biến thành sức mạnh cương kiện của Trời, chỉ cần giữ trọn sự kiên định bền vững với chính đạo (vĩnh trinh) thì sự nghiệp trường tồn viên mãn tột cùng."
      }
    ]
  },
  "3": {
    "number": 3,
    "name": "Thủy Lôi Truân",
    "vietnameseName": "Truân (Gian nan khởi đầu)",
    "daxiang": {
      "original": "Vân lôi truân, quân tử dĩ kinh luân.",
      "meaning": "Mây và sấm dồn dập là quẻ Truân, người quân tử noi theo đó mà vận dụng tài kinh luân sắp xếp trật tự từ đống hỗn độn.",
      "explanation": "Nước ở trên, sấm ở dưới; mầm non xé đất nảy chồi trong mưa giông sấm sét. Buổi đầu khởi nghiệp gian nan, sự việc rối ren như tơ vò. Người quân tử không hoảng sợ buông xuôi, mà đem tài kinh bang tế thế phân định rành mạch, từng bước gỡ rối thiết lập nền tảng."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Cửu",
        "xiangOriginal": "Tượng viết: Tuy bàn hoàn, chí hành chính dã. Dĩ quý hạ tiện, đại đắc dân dã.",
        "xiangMeaning": "Tuy còn ngập ngừng do dự, nhưng ý chí vẫn hướng theo đường chính. Kẻ sang hạ mình đãi người hèn kém, ắt thu phục được lòng dân.",
        "explanation": "Khởi đầu gian nan chớ vội tiến bừa, hãy hạ mình chiêu mộ hiền tài, tạo dựng niềm tin cơ sở vững chắc."
      },
      {
        "line": 2,
        "lineName": "Lục Nhị",
        "xiangOriginal": "Tượng viết: Lục nhị chi nan, thừa cương dã. Thập niên nãi tự, phản thường dã.",
        "xiangMeaning": "Cái khó khăn của hào Lục Nhị là do cưỡi lên hào cương. Mười năm mới hứa gả, sau mới trở về nếp bình thường.",
        "explanation": "Bị hoàn cảnh ép uổng khó xử; cần kiên trinh giữ vững nguyên tắc, dù đợi lâu cũng không đổi chí."
      },
      {
        "line": 3,
        "lineName": "Lục Tam",
        "xiangOriginal": "Tượng viết: Tức lộc vô ngu, dĩ tòng cầm dã. Quân tử xả chi, vãng lận cùng dã.",
        "xiangMeaning": "Đuổi hươu không có người dẫn đường vì tham thú săn bắn. Quân tử thà bỏ đi, cố đi sẽ chuốc xấu hổ khốn cùng.",
        "explanation": "Không có cố vấn chuyên môn mà tham lam dấn thân sẽ lạc lối nguy hiểm; người khôn biết buông bỏ kịp thời."
      },
      {
        "line": 4,
        "lineName": "Lục Tứ",
        "xiangOriginal": "Tượng viết: Cầu nhi vãng, minh dã.",
        "xiangMeaning": "Cầu viện người hiền tài rồi mới tiến bước, thật là sáng suốt.",
        "explanation": "Tự biết sức mình có hạn nên chủ động cầu kiến người giỏi hợp tác cùng tiến, rất đắc sách."
      },
      {
        "line": 5,
        "lineName": "Cửu Ngũ",
        "xiangOriginal": "Tượng viết: Truân kỳ cao, thi vị quang dã.",
        "xiangMeaning": "Ơn huệ còn bị ngưng trệ, sự ban phát ơn nghĩa chưa được rộng khắp sáng tỏ.",
        "explanation": "Ơn huệ chưa lan tỏa sâu rộng; nên làm việc nhỏ chu đáo, tránh làm việc lớn quá sức quần chúng."
      },
      {
        "line": 6,
        "lineName": "Thượng Lục",
        "xiangOriginal": "Tượng viết: Khấp huyết liên như, hà khả trường dã.",
        "xiangMeaning": "Khóc chảy máu mắt giàn giụa, cảnh ngộ bế tắc ấy sao mà kéo dài được.",
        "explanation": "Gian nan cùng cực mà cô độc bất lực; mau chóng thay đổi phương pháp kẻo kiệt quệ tiêu vong."
      }
    ]
  },
  "4": {
    "number": 4,
    "name": "Sơn Thủy Mông",
    "vietnameseName": "Mông (Khai mờ mông muội)",
    "daxiang": {
      "original": "Sơn hạ xuất tuyền, Mông; quân tử dĩ quả hành dục đức.",
      "meaning": "Dưới chân núi có dòng suối chảy ra là quẻ Mông, người quân tử noi theo đó mà rèn luyện hành vi quả quyết và nuôi dưỡng đức hạnh.",
      "explanation": "Núi ở trên tĩnh chỉ, suối ở dưới mờ mịt chưa thông dòng. Tượng trưng cho đứa trẻ thơ ngây ngô mông muội cần khai sáng. Người quân tử dạy người lấy đạo đức làm gốc, kiên trì uốn nắn hành vi quả quyết kiên định như dòng suối bền bỉ chảy qua vách đá."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Lục",
        "xiangOriginal": "Tượng viết: Dụng phát mông, dĩ hình nhân dã.",
        "xiangMeaning": "Dùng hình thức kỷ luật để khai phá mông muội là để đưa người vào khuôn khổ đúng đắn.",
        "explanation": "Giáo dục ban đầu cần nghiêm khắc thiết lập quy củ, sau đó mới mở rộng bồi dưỡng tư duy."
      },
      {
        "line": 2,
        "lineName": "Cửu Nhị",
        "xiangOriginal": "Tượng viết: Tử khắc gia, cương nhu tiếp dã.",
        "xiangMeaning": "Con gánh vác được việc nhà, nhờ biết kết hợp cương nhu giao hòa thích đáng.",
        "explanation": "Người thầy giỏi có tâm bao dung đón nhận học trò vụng về, lấy tình thương cảm hóa nên người."
      },
      {
        "line": 3,
        "lineName": "Lục Tam",
        "xiangOriginal": "Tượng viết: Vật dụng thủ nữ, hành bất thuận dã.",
        "xiangMeaning": "Chớ cưới cô gái ấy, vì hành vi không đoan trang thuận hòa.",
        "explanation": "Thấy kẻ giàu sang thì chạy theo mê muội, đánh mất tự trọng; đối tượng này không nên tin cậy hợp tác."
      },
      {
        "line": 4,
        "lineName": "Lục Tứ",
        "xiangOriginal": "Tượng viết: Khốn mông chi lận, độc viễn thực dã.",
        "xiangMeaning": "Sự khó khăn đáng tiếc của kẻ mông muội là do tự mình xa rời thực tế và chân lý.",
        "explanation": "Cố chấp trong thiếu hiểu biết, tự cô lập mình không chịu học hỏi ắt chuốc lấy thất bại ê chề."
      },
      {
        "line": 5,
        "lineName": "Lục Ngũ",
        "xiangOriginal": "Tượng viết: Đồng mông chi cát, thuận dĩ tốn dã.",
        "xiangMeaning": "Điều tốt lành của đứa trẻ ngây thơ cầu học là nhờ thái độ khiêm tốn nhu thuận.",
        "explanation": "Tâm trong sáng, thành tâm kính lễ người chỉ dẫn; giữ được thái độ cầu thị như thế ắt mau thành đạt."
      },
      {
        "line": 6,
        "lineName": "Thượng Cửu",
        "xiangOriginal": "Tượng viết: Lợi dụng ngự khấu, thuận thượng hạ dã.",
        "xiangMeaning": "Có lợi khi ngăn ngừa giặc cướp hung hăng, để trên dưới đều giữ được trật tự an định.",
        "explanation": "Trị sự ngỗ nghịch quá trớn phải nghiêm khắc răn đe, phòng ngừa mầm họa chứ không bức hại vô lối."
      }
    ]
  },
  "5": {
    "number": 5,
    "name": "Thủy Thiên Nhu",
    "vietnameseName": "Nhu (Chờ thời cơ chín muồi)",
    "daxiang": {
      "original": "Vân thượng vu thiên, Nhu; quân tử dĩ ẩm thực yến lạc.",
      "meaning": "Mây bay lên tận trời cao là quẻ Nhu, người quân tử noi theo đó mà ung dung ăn uống, vui vẻ bồi dưỡng thân tâm đợi thời.",
      "explanation": "Mây tụ trên bầu trời chưa kịp hóa mưa, giục giã cũng vô ích. Người quân tử ở thời Nhu biết nghỉ ngơi, vui vẻ ăn uống tẩm bổ, tích tụ năng lượng, rèn giũa kỹ năng, chuẩn bị chu đáo để khi cơ hội chín muồi là hành động ngay."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Cửu",
        "xiangOriginal": "Tượng viết: Nhu vu giao, bất phạm nan hành dã. Lợi dụng hằng, vô cữu, vị thất thường dã.",
        "xiangMeaning": "Chờ đợi nơi vùng ngoại ô xa nguy hiểm, không dấn bước vào nơi hiểm trở. Kiên nhẫn giữ điều bình thường thì không lỗi.",
        "explanation": "Khó khăn còn ở xa, hãy bình tĩnh giữ nếp sinh hoạt điều độ, chớ nóng vội bước vào vùng nguy hiểm."
      },
      {
        "line": 2,
        "lineName": "Cửu Nhị",
        "xiangOriginal": "Tượng viết: Nhu vu sa, diễn tại trung dã. Tuy hữu tiểu ngôn, dĩ cát chung dã.",
        "xiangMeaning": "Chờ đợi nơi bãi cát, ung dung rộng rãi ở ngôi trung. Tuy có chút lời qua tiếng lại nhưng kết cục tốt lành.",
        "explanation": "Hiểm nguy tiến gần hơn, có người gièm pha dị nghị; giữ tâm khoan hòa, nhẫn nhịn thì tai qua nạn khỏi."
      },
      {
        "line": 3,
        "lineName": "Cửu Tam",
        "xiangOriginal": "Tượng viết: Nhu vu nê, tai tại ngoại dã. Tự ngã trí khấu, kính thận bất bại dã.",
        "xiangMeaning": "Chờ đợi nơi bùn lầy, tai họa ở ngay sát cạnh. Tự mình rước giặc đến, nhưng nếu cẩn trọng cung kính thì không bại vong.",
        "explanation": "Tiến quá sát bờ vực nguy nan; cần hết sức thận trọng cảnh giác cao độ để tự bảo vệ mình."
      },
      {
        "line": 4,
        "lineName": "Lục Tứ",
        "xiangOriginal": "Tượng viết: Nhu vu huyết, thuận dĩ thính dã.",
        "xiangMeaning": "Chờ đợi nơi hố máu hiểm nạn, thuận theo lẽ trời mà bình tĩnh lắng nghe phục tùng.",
        "explanation": "Rơi vào cảnh ngộ hiểm nghèo nguy khốn; tuyệt đối không manh động chống cự liều lĩnh, ẩn nhẫn để thoát hiểm."
      },
      {
        "line": 5,
        "lineName": "Cửu Ngũ",
        "xiangOriginal": "Tượng viết: Tửu thực trinh cát, dĩ trung chính dã.",
        "xiangMeaning": "Rượu thịt ăn uống giữ đạo chính thì tốt lành, nhờ ở vào ngôi vị trung chính cao quý.",
        "explanation": "Thời cơ thuận lợi đã đến, giữ tâm chí công vô tư, chia sẻ thành quả với mọi người thì đại cát."
      },
      {
        "line": 6,
        "lineName": "Thượng Lục",
        "xiangOriginal": "Tượng viết: Bất tốc chi khách lai, kính chi chung cát. Tuy bất đương vị, vị đại thất dã.",
        "xiangMeaning": "Khách không mời mà đến ba người, cung kính tiếp đãi cuối cùng sẽ tốt lành. Tuy ngôi vị không hợp nhưng chưa đến nỗi mất mát lớn.",
        "explanation": "Thời chờ đợi đã qua, xuất hiện những biến chuyển bất ngờ ngoài dự kiến; hãy khiêm cung tiếp đón."
      }
    ]
  },
  "6": {
    "number": 6,
    "name": "Thiên Thủy Tụng",
    "vietnameseName": "Tụng (Tranh chấp, bất hòa)",
    "daxiang": {
      "original": "Thiên dữ thủy vi hành, Tụng; quân tử dĩ tác sự mưu thủy.",
      "meaning": "Trời chuyển sang tây, nước chảy về đông, đi ngược chiều nhau là quẻ Tụng; người quân tử noi theo đó mà làm việc gì cũng phải mưu tính cẩn thận ngay từ ban đầu.",
      "explanation": "Trời bốc lên cao, nước chảy xuống thấp, hai chí hướng hoàn toàn tương phản dẫn đến xung đột kiện tụng. Người quân tử thấy vậy biết rằng phòng bệnh hơn chữa bệnh: trước khi hợp tác phải minh bạch hợp đồng, ranh giới rõ ràng để không nảy sinh tranh chấp về sau."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Lục",
        "xiangOriginal": "Tượng viết: Bất vĩnh sở sự, tụng bất khả trường dã. Tuy hữu tiểu ngôn, kỳ biện minh dã.",
        "xiangMeaning": "Không kéo dài sự việc tranh chấp, vì kiện tụng chẳng thể lâu bền. Tuy có chút lời qua tiếng lại nhưng lẽ phải sẽ sáng tỏ.",
        "explanation": "Xảy ra xích mích ban đầu thì mau chóng hòa giải, chớ cố chấp đẩy sự việc đi xa mà thiệt thân."
      },
      {
        "line": 2,
        "lineName": "Cửu Nhị",
        "xiangOriginal": "Tượng viết: Bất khắc tụng, quy thoái hữu tị dã. Tự hạ tụng thượng, hoạn chí quy dã.",
        "xiangMeaning": "Không tranh tụng được thì lui về lẩn tránh. Kẻ dưới mà tranh kiện với người trên ắt chuốc lấy tai vạ dồn về mình.",
        "explanation": "Biết mình thế yếu không thể thắng kiện, biết điều thoái lui quy phục là thượng sách bảo toàn."
      },
      {
        "line": 3,
        "lineName": "Lục Tam",
        "xiangOriginal": "Tượng viết: Thực cựu đức, tòng thượng cát dã.",
        "xiangMeaning": "Hưởng phúc đức cũ của tổ tiên để lại, thuận theo bậc bề trên thì tốt lành.",
        "explanation": "An phận thủ thường, giữ vững phẩm hạnh vốn có, không tranh giành công danh ảo huyền thì bình an."
      },
      {
        "line": 4,
        "lineName": "Cửu Tứ",
        "xiangOriginal": "Tượng viết: Phục tức mệnh, du an trinh, bất thất dã.",
        "xiangMeaning": "Trở về yên phận theo mệnh trời, đổi sang nếp sống an định giữ chính đạo thì không mất mát gì.",
        "explanation": "Thấy sai biết dừng lại, đổi tính hiếu thắng thành hòa hiếu khiêm nhường thì chuyển nguy thành an."
      },
      {
        "line": 5,
        "lineName": "Cửu Ngũ",
        "xiangOriginal": "Tượng viết: Tụng nguyên cát, dĩ trung chính dã.",
        "xiangMeaning": "Xử kiện đạt điều đại cát, nhờ giữ đức trung chính chí công vô tư.",
        "explanation": "Bậc phân xử cầm cân nảy mực công bằng, sáng suốt bênh vực lẽ phải thì thiên hạ tâm phục khẩu phục."
      },
      {
        "line": 6,
        "lineName": "Thượng Cửu",
        "xiangOriginal": "Tượng viết: Dĩ tụng thụ tức, diệc bất túc kính dã.",
        "xiangMeaning": "Nhờ tranh kiện thắng mà được ban thưởng đai áo quan chức, thì cũng chẳng đáng được người ta kính trọng.",
        "explanation": "Thắng kiện nhờ mưu mô xảo quyệt thì vinh quang cũng chỉ là tạm bợ, sớm muộn cũng bị người tước đoạt."
      }
    ]
  },
  "7": {
    "number": 7,
    "name": "Địa Thủy Sư",
    "vietnameseName": "Sư (Hành quân, kỷ luật đội ngũ)",
    "daxiang": {
      "original": "Địa trung hữu thủy, Sư; quân tử dĩ dung dân súc chúng.",
      "meaning": "Trong lòng đất có mạch nước ngầm tụ lại là quẻ Sư; người quân tử noi theo đó mà bao dung nuôi dưỡng nhân dân, quy tụ quần chúng thành khối sức mạnh.",
      "explanation": "Nước tàng ẩn trong lòng đất như sức mạnh của binh sĩ tiềm tàng trong lòng muôn dân. Thời bình lấy đạo nhân từ giáo hóa nuôi dưỡng, khi có biến mới huy động lòng dân đứng lên bảo vệ chính nghĩa. Kỷ luật quân đội phải nghiêm minh, tướng soái phải có lòng nhân."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Lục",
        "xiangOriginal": "Tượng viết: Sư xuất dĩ luật, thất luật hung dã.",
        "xiangMeaning": "Quân đội xuất chinh phải lấy kỷ luật làm đầu, đánh mất kỷ luật tất chuốc lấy hung họa.",
        "explanation": "Khởi sự bất cứ việc gì cũng phải thiết lập quy củ nghiêm minh; kỷ luật lỏng lẻo ắt cầm chắc thất bại."
      },
      {
        "line": 2,
        "lineName": "Cửu Nhị",
        "xiangOriginal": "Tượng viết: Tại sư trung cát, thừa thiên sủng dã. Vương tam tích mệnh, hoài vạn bang dã.",
        "xiangMeaning": "Ở trong quân được tốt lành, vì nhận được sự sủng ái tin cậy của bề trên. Vua ba lần ban thưởng mệnh lệnh, vì tấm lòng bao bọc muôn cõi.",
        "explanation": "Bậc tướng soái tài đức vẹn toàn, được trao trọn quyền chỉ huy, đem lại thắng lợi và thái bình cho đất nước."
      },
      {
        "line": 3,
        "lineName": "Lục Tam",
        "xiangOriginal": "Tượng viết: Sư hoặc dư thi, đại vô công dã.",
        "xiangMeaning": "Quân đội chở xác chết đầy xe, hoàn toàn thất bại không có chút công trạng nào.",
        "explanation": "Tài hèn mà tranh quyền chỉ huy, bất tài kiêu ngạo dẫn đoàn quân vào chỗ chết chóc tiêu vong."
      },
      {
        "line": 4,
        "lineName": "Lục Tứ",
        "xiangOriginal": "Tượng viết: Sư tả thứ, vô cữu, vị thất thường dã.",
        "xiangMeaning": "Quân đội tạm thời rút về đóng trại phòng thủ thì không có lỗi, chưa hề làm mất phép dùng binh thông thường.",
        "explanation": "Thấy thế giặc mạnh chủ động lui quân bảo toàn lực lượng; lùi một bước để tiến hai bước là sáng suốt."
      },
      {
        "line": 5,
        "lineName": "Lục Ngũ",
        "xiangOriginal": "Tượng viết: Trưởng tử soái sư, dĩ trung hành dã. Đệ tử dư thi, sử bất đương dã.",
        "xiangMeaning": "Giao cho người con trưởng chỉ huy quân vì hành sự hợp trung đạo. Kẻ con em kém cỏi chở xác chết vì dùng người sai lầm.",
        "explanation": "Dùng tướng phải chọn người đức độ chững chạc; nếu dùng kẻ non nớt a dua ắt chuốc lấy thảm họa."
      },
      {
        "line": 6,
        "lineName": "Thượng Lục",
        "xiangOriginal": "Tượng viết: Đại quân hữu mệnh, dĩ chính công dã. Tiểu nhân vật dụng, tất loạn bang dã.",
        "xiangMeaning": "Đấng minh quân ban bố sắc lệnh để phong thưởng công lao chính đáng. Kẻ tiểu nhân chớ trao quyền hành, vì ắt làm loạn đất nước.",
        "explanation": "Sau chiến thắng luận công ban thưởng: thưởng tiền của cho tiểu nhân nhưng tuyệt đối không trao binh quyền chính trị."
      }
    ]
  },
  "8": {
    "number": 8,
    "name": "Thủy Địa Tỷ",
    "vietnameseName": "Tỷ (Thân thiện, gắn kết đồng tâm)",
    "daxiang": {
      "original": "Địa thượng hữu thủy, Tỷ; tiên vương dĩ kiến vạn quốc, thân chư hầu.",
      "meaning": "Nước chảy trên mặt đất thấm nhuần gắn kết là quẻ Tỷ; các bậc tiên vương noi theo đó mà xây dựng muôn nước, thân ái liên kết cùng các chư hầu.",
      "explanation": "Nước và đất hòa quyện nâng đỡ lẫn nhau, tượng trưng cho sự gắn bó đồng tâm của cộng đồng. Bậc lãnh đạo lấy lòng chân thành, cởi mở để chiêu hiền đãi sĩ, xây dựng khối liên minh đoàn kết vững chắc từ cơ sở."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Lục",
        "xiangOriginal": "Tượng viết: Tỷ chi sơ lục, hữu tha cát dã.",
        "xiangMeaning": "Lấy lòng chí thành mà kết thân ngay từ ban đầu, có sự tốt lành bất ngờ đưa tới.",
        "explanation": "Giao thiệp ban đầu phải đặt chữ tín và chân thành lên hàng đầu, tự nhiên được quý nhân cảm mến."
      },
      {
        "line": 2,
        "lineName": "Lục Nhị",
        "xiangOriginal": "Tượng viết: Tỷ chi tự nội, bất tự thất dã.",
        "xiangMeaning": "Kết thân bắt nguồn tự trong lòng mình, không hề đánh mất phẩm hạnh bản thân.",
        "explanation": "Giữ tâm trung chính, tự hoàn thiện mình thì người hiền đức tự tìm đến kết giao, không cần luồn cúi."
      },
      {
        "line": 3,
        "lineName": "Lục Tam",
        "xiangOriginal": "Tượng viết: Tỷ chi phỉ nhân, bất diệc thương hồ.",
        "xiangMeaning": "Kết thân với những kẻ bất hảo chẳng ra gì, chẳng đáng đau buồn xót xa lắm sao.",
        "explanation": "Chọn bạn không cẩn thận kết bè với phường bất lương ắt chịu vạ lây; bài học thận trọng trong kết giao."
      },
      {
        "line": 4,
        "lineName": "Lục Tứ",
        "xiangOriginal": "Tượng viết: Ngoại tỷ vu hiền, dĩ tòng thượng dã.",
        "xiangMeaning": "Hướng ra bên ngoài kết thân cùng bậc hiền tài, để phò tá người lãnh đạo có tài đức.",
        "explanation": "Chủ động hợp tác với người có năng lực bề trên, phụng sự việc công hết lòng thì sự nghiệp hanh thông."
      },
      {
        "line": 5,
        "lineName": "Cửu Ngũ",
        "xiangOriginal": "Tượng viết: Hiển tỷ chi cát, vị chính trung dã. Xá nghịch thủ thuận, thất tiền cầm dã. Dân phụ bất xá, thượng trung chính dã.",
        "xiangMeaning": "Sự liên kết quang minh tốt lành nhờ ngôi vị chính trung. Bỏ kẻ chống đối, thu nạp người thuận theo, như để xổng con thú chạy trước. Dân chúng gắn bó không sợ hãi vì người trên giữ đức trung chính.",
        "explanation": "Lãnh đạo có lòng bao dung quảng đại: người đến thì niềm nở đón nhận, người đi không ép uổng níu kéo, tự nhiên vạn người quy phục."
      },
      {
        "line": 6,
        "lineName": "Thượng Lục",
        "xiangOriginal": "Tượng viết: Tỷ chi vô thủ, vô sở chung dã.",
        "xiangMeaning": "Kết thân mà chậm trễ không có đầu mối khởi xướng chân thành, thì chẳng có kết cục tốt đẹp nào.",
        "explanation": "Do dự chần chừ bỏ lỡ thời cơ liên kết, đến khi cô lập mới tìm người cầu cứu thì đã quá muộn màng."
      }
    ]
  },
  "9": {
    "number": 9,
    "name": "Phong Thiên Tiểu Súc",
    "vietnameseName": "Tiểu Súc (Tích lũy nhỏ, mây dồn chưa mưa)",
    "daxiang": {
      "original": "Phong hành thiên thượng, Tiểu Súc; quân tử dĩ ý văn đức.",
      "meaning": "Gió thổi trên bầu trời là quẻ Tiểu Súc; người quân tử noi theo đó mà trau dồi đức hạnh văn hóa tốt đẹp và tích lũy từng bước nhỏ.",
      "explanation": "Gió bay lượn trên cao nhưng chưa thể kéo mây làm thành mưa lớn, lực tích tụ còn nhỏ. Người quân tử hiểu rằng tích tiểu mới thành đại: khi hoàn cảnh chưa cho phép làm việc lớn thì hãy kiên nhẫn trau dồi phẩm hạnh, học vấn và bồi đắp nguồn lực vững chắc."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Cửu",
        "xiangOriginal": "Tượng viết: Phục tự đạo, hà kỳ cữu, cát dã.",
        "xiangMeaning": "Tự quay về con đường chính của mình, nào có lỗi gì, tốt lành vậy.",
        "explanation": "Thấy thời thế chưa thuận thì kịp thời dừng bước quay về củng cố nội lực, không phạm sai lầm."
      },
      {
        "line": 2,
        "lineName": "Cửu Nhị",
        "xiangOriginal": "Tượng viết: Khiên phục tại trung, diệc bất tự thất dã.",
        "xiangMeaning": "Dắt nhau cùng quay về giữ đạo trung, cũng không tự đánh mất phẩm hạnh của mình.",
        "explanation": "Đồng tâm hiệp lực cùng bạn bè giữ trọn chuẩn mực, cùng nhau tiến thoái nhịp nhàng."
      },
      {
        "line": 3,
        "lineName": "Cửu Tam",
        "xiangOriginal": "Tượng viết: Phu thê phản mục, bất năng chính thất dã.",
        "xiangMeaning": "Vợ chồng cắn đắng trừng mắt nhau, vì không biết giữ gia phong nếp nhà cho có quy củ.",
        "explanation": "Nóng vội tiến bừa khi nội bộ chưa đồng lòng, ắt dẫn tới tranh cãi gay gắt và tan vỡ liên minh."
      },
      {
        "line": 4,
        "lineName": "Lục Tứ",
        "xiangOriginal": "Tượng viết: Hữu phu, dịch khứ dịch cữu, thượng hợp chí dã.",
        "xiangMeaning": "Có lòng chí thành thì nỗi sợ tiêu tan, cùng hòa hợp ý chí với bậc bề trên.",
        "explanation": "Lấy sự thành tâm chân thật làm cầu nối hòa giải mâu thuẫn, biến nguy thành an."
      },
      {
        "line": 5,
        "lineName": "Cửu Ngũ",
        "xiangOriginal": "Tượng viết: Hữu phu loan như, bất độc phú dã.",
        "xiangMeaning": "Lòng chí thành gắn kết khăng khít, chẳng hưởng giàu sang phú quý riêng một mình.",
        "explanation": "Có tài sản quyền thế biết sẻ chia cho thuộc cấp và xóm giềng, tạo dựng khối thịnh vượng chung."
      },
      {
        "line": 6,
        "lineName": "Thượng Cửu",
        "xiangOriginal": "Tượng viết: Ký vũ ký xử, đức tích tải dã. Quân tử chinh hung, hữu sở nghi dã.",
        "xiangMeaning": "Đã mưa rồi lại yên vị, ân đức tích tụ đầy đủ rồi. Quân tử nếu còn cố tiến nữa thì gặp hung, vì ắt sinh ngờ vực.",
        "explanation": "Thành quả đã trọn vẹn, phải biết điểm dừng để bảo tồn thành quả; tham lam tiến tới ắt chuốc lấy tai họa đảo lộn."
      }
    ]
  },
  "10": {
    "number": 10,
    "name": "Thiên Trạch Lý",
    "vietnameseName": "Lý (Dẫm đuôi cọp, giữ lễ nghi phép tắc)",
    "daxiang": {
      "original": "Thượng thiên hạ trạch, Lý; quân tử dĩ biện thượng hạ, định dân chí.",
      "meaning": "Trời ở trên cao đầm ở dưới thấp là quẻ Lý; người quân tử noi theo đó mà phân định rõ tôn ti trên dưới, an định ý chí và bổn phận của muôn dân.",
      "explanation": "Trời ở trên, đầm nước ở dưới, thứ bậc tự nhiên rõ ràng không thể đảo lộn. 'Lý' là lễ nghi, quy tắc ứng xử. Sống ở đời giẫm lên đuôi cọp mà không bị cắn là nhờ hành vi cẩn trọng, đúng mực, hòa nhã. Lễ nghi phép tắc chính là tấm khiên bảo vệ con người trước mọi hiểm nguy."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Cửu",
        "xiangOriginal": "Tượng viết: Tố lý chi vãng, độc hành nguyện dã.",
        "xiangMeaning": "Điềm nhiên giữ nết mộc mạc thanh bạch mà tiến tới, một lòng thực hiện ý nguyện thanh cao của mình.",
        "explanation": "Mới khởi đầu, giữ nếp sống giản dị trong sạch, không màng danh lợi hão huyền thì đường đi vững chãi."
      },
      {
        "line": 2,
        "lineName": "Cửu Nhị",
        "xiangOriginal": "Tượng viết: U nhân trinh cát, trung bất tự loạn dã.",
        "xiangMeaning": "Người ẩn dật giữ đạo chính bền lòng thì tốt lành, nhờ tâm giữ trung dung không tự làm rối loạn mình.",
        "explanation": "Đi trên con đường bằng phẳng ung dung, không a dua xu phụ kẻ quyền thế, tâm thanh thản thì phúc lộc tự đến."
      },
      {
        "line": 3,
        "lineName": "Lục Tam",
        "xiangOriginal": "Tượng viết: Diệu năng thị, bất túc dĩ hữu minh dã. Bả năng lý, bất túc dĩ dữ hành dã. Diệt hổ vĩ chi hung, vị bất đáng dã. Vũ nhân vi vu đại quân, chí cương dã.",
        "xiangMeaning": "Chột mắt mà đòi nhìn sáng thì chẳng đủ sáng suốt; què chân mà đòi bước thì chẳng thể đi xa; dẫm đuôi cọp bị cắn là do ở ngôi bất chính; võ biền đòi làm tướng lớn vì chí khí hung hăng mù quáng.",
        "explanation": "Sức mọn tài hèn mà háo danh liều lĩnh, không biết tự lượng sức mình ắt chuốc lấy thảm họa."
      },
      {
        "line": 4,
        "lineName": "Cửu Tứ",
        "xiangOriginal": "Tượng viết: Sóc sóc chung cát, chí hành dã.",
        "xiangMeaning": "Giẫm đuôi cọp mà run sợ thận trọng thì cuối cùng tốt lành, ý nguyện được thực hiện trọn vẹn.",
        "explanation": "Ở kề bên người quyền lực nguy hiểm; biết sợ hãi, cẩn trọng từng đường đi nước bước thì hóa giải được nguy hiểm."
      },
      {
        "line": 5,
        "lineName": "Cửu Ngũ",
        "xiangOriginal": "Tượng viết: Quyết lý trinh lệ, vị chính đương dã.",
        "xiangMeaning": "Phán đoán quả quyết mà lòng vẫn răn sợ nguy nan, bởi ở vào ngôi chí tôn chính đáng.",
        "explanation": "Cầm quyền tối cao hành động dứt khoát nhưng tâm niệm luôn cẩn trọng canh cánh lo âu để giữ trọn cơ đồ."
      },
      {
        "line": 6,
        "lineName": "Thượng Cửu",
        "xiangOriginal": "Tượng viết: Nguyên cát tại thượng, đại hữu khánh dã.",
        "xiangMeaning": "Điều đại cát ở ngôi thượng đỉnh, hưởng sự phúc khánh lớn lao tốt đẹp trọn vẹn.",
        "explanation": "Xem lại toàn bộ chặng đường đã qua thấy trọn vẹn không lỗi lầm; hành xử theo lễ nghĩa suốt đời thì hưởng phúc ấm viên mãn."
      }
    ]
  },
  "11": {
    "number": 11,
    "name": "Địa Thiên Thái",
    "vietnameseName": "Thái (Thái bình thịnh vượng, trời đất giao hòa)",
    "daxiang": {
      "original": "Thiên địa giao, Thái; hậu dĩ tài thành thiên địa chi đạo, phụ tướng thiên địa chi nghi, dĩ tả hữu dân.",
      "meaning": "Trời đất giao hòa là quẻ Thái; bậc quân vương noi theo đó mà tài thành đạo lý trời đất, tương trợ sự thích nghi của đất trời để dẫn dắt phò trợ nhân dân.",
      "explanation": "Khí trời giáng xuống, khí đất bốc lên, âm dương giao cảm sinh sôi vạn vật. Quẻ Càn (Trời) ở dưới quẻ Khôn (Đất) biểu thị người trên hạ mình đãi kẻ dưới, dưới một lòng hướng lên trên, đất nước thái bình thăng hoa. Người cầm quyền noi theo lẽ tự nhiên điều tiết xã hội ấm no."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Cửu",
        "xiangOriginal": "Tượng viết: Bạt mao chinh cát, chí tại ngoại dã.",
        "xiangMeaning": "Nhổ cụm cỏ tranh cùng rễ mà tiến thì tốt, ý chí hướng ra việc lớn bên ngoài để đồng tâm hiệp lực.",
        "explanation": "Bậc hiền tài cùng nhau xuất đầu lộ diện giúp đời; người có chí đồng lòng liên kết tạo nên sức mạnh to lớn."
      },
      {
        "line": 2,
        "lineName": "Cửu Nhị",
        "xiangOriginal": "Tượng viết: Bao hoang, đắc thượng vu trung đạo, quang đại dã.",
        "xiangMeaning": "Bao dung tính thô lậu hoang dã, giữ trọn trung đạo tiến bước, đức sáng rộng lớn rực rỡ.",
        "explanation": "Có tấm lòng khoáng đạt dung nạp mọi hạng người, không kết bè phái cục bộ, lấy đại cuộc làm trọng."
      },
      {
        "line": 3,
        "lineName": "Cửu Tam",
        "xiangOriginal": "Tượng viết: Vô vãng bất phục, thiên địa tế dã.",
        "xiangMeaning": "Không có gì đi mà không quay lại, đó là ranh giới quy luật tuần hoàn của trời đất.",
        "explanation": "Đang lúc thịnh trị phải lường trước lúc suy vi; giữ tâm bền vững, chớ chủ quan khi đang trên đỉnh cao."
      },
      {
        "line": 4,
        "lineName": "Lục Tứ",
        "xiangOriginal": "Tượng viết: Phiên phiên bất phú, giai thất thực dã. Bất giới dĩ phu, trung tâm nguyện dã.",
        "xiangMeaning": "Bay lượn nhẹ nhàng chẳng cần giàu sang, đều không cậy vào của cải; không răn đe mà tự có lòng thành, từ đáy lòng tự nguyện gắn kết.",
        "explanation": "Người trên kẻ dưới kết nối bằng sự chân thành mộc mạc, không màng vật chất vụ lợi."
      },
      {
        "line": 5,
        "lineName": "Lục Ngũ",
        "xiangOriginal": "Tượng viết: Dĩ chỉ nguyên cát, trung dĩ hành nguyện dã.",
        "xiangMeaning": "Đem lại phúc lành đại cát, nhờ giữ đức trung thuận để thực hiện trọn vẹn chí nguyện.",
        "explanation": "Vua chúa gả con gái cho người hiền, hạ mình cầu người tài đức giúp nước; khiêm hạ đem lại phúc khánh vô biên."
      },
      {
        "line": 6,
        "lineName": "Thượng Lục",
        "xiangOriginal": "Tượng viết: Thành phục vu quặc, kỳ mệnh loạn dã.",
        "xiangMeaning": "Thành lũy đổ lở xuống chân hào, mệnh lệnh quốc gia đã đến hồi rối ren tan rã.",
        "explanation": "Thời thịnh cực ắt chuyển sang suy thoái; không còn khả năng cứu vãn bên ngoài, phải thu vén tự bảo toàn nội bộ."
      }
    ]
  },
  "12": {
    "number": 12,
    "name": "Thiên Địa Bĩ",
    "vietnameseName": "Bĩ (Bế tắc, tiểu nhân lộng hành)",
    "daxiang": {
      "original": "Thiên địa bất giao, Bĩ; quân tử dĩ kiệm đức tị nan, bất khả vinh dĩ lộc.",
      "meaning": "Trời đất không giao hòa là quẻ Bĩ; người quân tử noi theo đó mà thu vén đức hạnh để lánh nạn, không màng bổng lộc vinh hoa bất chính.",
      "explanation": "Trời bay lên cao ngất, đất chìm xuống sâu thẳm, đôi bên cách trở không tương giao. Thời bế tắc đạo quân tử tiêu điều, tiểu nhân đắc chí. Người có chí khí biết ẩn nhẫn giữ mình, tiết chế danh lợi, thà sống thanh bạch giữ trọn khí tiết chứ không luồn cúi phụng sự tà quyền."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Lục",
        "xiangOriginal": "Tượng viết: Bạt mao trinh cát, chí tại quân dã.",
        "xiangMeaning": "Nhổ cụm cỏ tranh giữ lòng chính bền thì tốt, ý chí giữ trọn đạo quân tử.",
        "explanation": "Thời buổi nhiễu nhương, rủ bạn hiền cùng nhau lui về ẩn cư giữ gìn thanh danh, chớ ham chức tước."
      },
      {
        "line": 2,
        "lineName": "Lục Nhị",
        "xiangOriginal": "Tượng viết: Đại nhân bĩ cát, bất thích loạn quần dã.",
        "xiangMeaning": "Bậc đại nhân giữ đức nhẫn nhục trong cảnh bĩ thì tốt lành, không a dua cùng bè lũ rối loạn.",
        "explanation": "Kẻ tiểu nhân ton hót cầu vinh, quân tử điềm nhiên chịu khó chịu nhục, không thỏa hiệp với cái xấu."
      },
      {
        "line": 3,
        "lineName": "Lục Tam",
        "xiangOriginal": "Tượng viết: Bao tu, vị bất đáng dã.",
        "xiangMeaning": "Ngậm điều hổ thẹn, vì ở vào ngôi vị bất xứng không thích hợp.",
        "explanation": "A dua nịnh hót kẻ quyền thế để kiếm lợi, cuối cùng bị khinh bỉ và tự chuốc lấy nhục nhã ê chề."
      },
      {
        "line": 4,
        "lineName": "Cửu Tứ",
        "xiangOriginal": "Tượng viết: Hữu mệnh vô cữu, chí hành dã.",
        "xiangMeaning": "Vâng mệnh thời cơ cứu đời thì không lỗi, chí hướng chấn hưng bắt đầu được thực thi.",
        "explanation": "Thời cơ đổi mới hé lộ, người tài đức xuất hiện nắm bắt sứ mệnh xoay chuyển tình thế."
      },
      {
        "line": 5,
        "lineName": "Cửu Ngũ",
        "xiangOriginal": "Tượng viết: Đại nhân chi cát, vị chính đương dã.",
        "xiangMeaning": "Sự tốt lành của bậc đại nhân, nhờ ở vào ngôi vị trung chính thích đáng.",
        "explanation": "Bậc lãnh đạo tài đức nắm quyền dẹp tan bế tắc, nhưng luôn tự răn mình đề phòng hiểm họa tái diễn."
      },
      {
        "line": 6,
        "lineName": "Thượng Cửu",
        "xiangOriginal": "Tượng viết: Bĩ chung tắc khuynh, hà khả trường dã.",
        "xiangMeaning": "Cảnh bĩ cực ắt phải nghiêng đổ chuyển dời, cảnh ngộ bế tắc sao có thể kéo dài mãi được.",
        "explanation": "Vật cùng tất phản, gian nan bế tắc đã đến hồi kết; bình minh chuẩn bị ló rạng, vận hội mới bắt đầu."
      }
    ]
  },
  "13": {
    "number": 13,
    "name": "Thiên Hỏa Đồng Nhân",
    "vietnameseName": "Đồng Nhân (Đồng lòng hòa hợp, bè bạn tri kỷ)",
    "daxiang": {
      "original": "Thiên dữ hỏa, Đồng Nhân; quân tử dĩ loại tộc biện vật.",
      "meaning": "Trời cùng với lửa cùng hướng lên trên là quẻ Đồng Nhân; người quân tử noi theo đó mà phân định rõ dòng tộc và biện biệt vạn vật để đồng tâm hòa hợp.",
      "explanation": "Lửa bốc lên cao hòa nhập vào bầu trời bao la, tượng trưng cho tinh thần đoàn kết đại đồng. Người quân tử muốn quy tụ thiên hạ phải thấu hiểu sự khác biệt của từng thành phần, tôn trọng sự đa dạng để cùng hướng về mục tiêu chung cao cả chí công vô tư."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Cửu",
        "xiangOriginal": "Tượng viết: Xuất môn đồng nhân, hựu thùy cữu dã.",
        "xiangMeaning": "Vừa ra khỏi cửa đã hòa đồng kết giao cùng mọi người, nào ai trách cứ chê bai được.",
        "explanation": "Mở rộng lòng mình đón nhận mọi mối quan hệ không phân biệt thân sơ, khởi đầu trong sáng và thuận lợi."
      },
      {
        "line": 2,
        "lineName": "Lục Nhị",
        "xiangOriginal": "Tượng viết: Đồng nhân vu tông, lận đạo dã.",
        "xiangMeaning": "Chỉ biết kết thân hạn hẹp trong gia tộc bè phái, đó là con đường hẹp hòi đáng xấu hổ.",
        "explanation": "Tư tưởng cục bộ địa phương, ích kỷ bè phái sẽ làm hỏng đại sự và cô lập bản thân."
      },
      {
        "line": 3,
        "lineName": "Cửu Tam",
        "xiangOriginal": "Tượng viết: Phục nhung vu mãng, địch cương dã. Tam tuế bất hưng, an hành dã.",
        "xiangMeaning": "Mai phục quân nơi bụi rậm vì đối phương cương cường; ba năm không dám dấy binh, biết đi đâu làm gì được.",
        "explanation": "Bụng dạ nghi ngờ toan tính mưu hại người khác nhưng sức yếu, tự giam mình trong sợ hãi và bế tắc."
      },
      {
        "line": 4,
        "lineName": "Cửu Tứ",
        "xiangOriginal": "Tượng viết: Thừa kỳ dung, nghĩa phất khắc dã. Kỳ cát, tắc khốn nhi phản tắc dã.",
        "xiangMeaning": "Trèo lên bờ thành định đánh nhưng thấy việc phi nghĩa nên dừng lại; được tốt là vì biết dừng bước khó khăn để quay về phép tắc chính đạo.",
        "explanation": "Trước cám dỗ sai lầm biết dừng lại đúng lúc, lắng nghe tiếng nói lương tri quay về đường chính thì không lỗi."
      },
      {
        "line": 5,
        "lineName": "Cửu Ngũ",
        "xiangOriginal": "Tượng viết: Đồng nhân chi tiên, dĩ trung trực dã. Đại sư khắc tương ngộ, ngôn tương khắc dã.",
        "xiangMeaning": "Lúc đầu Đồng Nhân khóc lóc vì lòng trung chính cương trực; quân lớn thắng rồi gặp nhau, cùng nhau chia vui hòa hợp.",
        "explanation": "Tình bạn tri kỷ, đồng chí hướng gặp trắc trở ban đầu; kiên trì vượt gian nan cuối cùng sẽ đoàn tụ sum vầy."
      },
      {
        "line": 6,
        "lineName": "Thượng Cửu",
        "xiangOriginal": "Tượng viết: Đồng nhân vu giao, chí vị đắc dã.",
        "xiangMeaning": "Hòa đồng nơi đồng nội ngoài xa, chí nguyện đại đồng khắp thiên hạ tuy chưa trọn vẹn nhưng chẳng chút oán hận.",
        "explanation": "Giữ tinh thần hòa nhã với đời dù ở nơi hẻo lánh, tâm trong sạch không vướng bận thị phi ganh ghét."
      }
    ]
  },
  "14": {
    "number": 14,
    "name": "Hỏa Thiên Đại Hữu",
    "vietnameseName": "Đại Hữu (Sở hữu lớn, mặt trời giữa ban trưa)",
    "daxiang": {
      "original": "Hỏa tại thiên thượng, Đại Hữu; quân tử dĩ át ác dương thiện, thuận thiên hưu mệnh.",
      "meaning": "Lửa sáng trên bầu trời cao là quẻ Đại Hữu; người quân tử noi theo đó mà ngăn chặn điều ác, biểu dương việc thiện, thuận theo mệnh trời tốt đẹp.",
      "explanation": "Mặt trời trên đỉnh trời soi rọi khắp dương gian, mọi vật đều rõ ràng, phúc lộc dồi dào tột bực. Nắm giữ tài sản quyền lực lớn lao, người quân tử không kiêu căng xa xỉ mà dùng quyền lực để bài trừ cái xấu, nâng đỡ điều thiện, tạo phúc cho muôn dân."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Cửu",
        "xiangOriginal": "Tượng viết: Đại Hữu sơ cửu, vô giao hại dã.",
        "xiangMeaning": "Hào Sơ Cửu quẻ Đại Hữu chưa dính líu đến thói xấu kiêu căng làm hại mình.",
        "explanation": "Mới bước vào thời giàu có thịnh vượng, giữ mình khiêm tốn thanh đạm thì không chuốc lấy tai ương."
      },
      {
        "line": 2,
        "lineName": "Cửu Nhị",
        "xiangOriginal": "Tượng viết: Đại xa dĩ tải, tích trung bất bại dã.",
        "xiangMeaning": "Dùng xe lớn để chở nặng, tích chứa đạo đức trung chính vào trong thì không thất bại.",
        "explanation": "Có tài năng và trách nhiệm lớn, được giao trọng trách gánh vác việc nước việc nhà vững vàng."
      },
      {
        "line": 3,
        "lineName": "Cửu Tam",
        "xiangOriginal": "Tượng viết: Công dụng hưởng vu thiên tử, tiểu nhân hại dã.",
        "xiangMeaning": "Bậc công hầu đem của cải cống hiến phụng sự thiên tử; kẻ tiểu nhân bụng dạ hẹp hòi nếu làm việc đó ắt sinh tổn hại.",
        "explanation": "Của cải dồi dào nên dùng vào việc thiện nguyện phụng sự xã hội; kẻ ích kỷ tham quyền ắt tự rước họa."
      },
      {
        "line": 4,
        "lineName": "Cửu Tứ",
        "xiangOriginal": "Tượng viết: Phỉ kỳ bành, vô cữu, minh biện trí dã.",
        "xiangMeaning": "Chẳng khoe khoang sự giàu sang quyền thế thì không lỗi, nhờ có trí tuệ sáng suốt phân minh.",
        "explanation": "Ở vị trí giàu sang phú quý mà biết giấu bớt hào quang, không phô trương khoe của tránh được sự đố kỵ ghen ghét."
      },
      {
        "line": 5,
        "lineName": "Lục Ngũ",
        "xiangOriginal": "Tượng viết: Quyết phu giao như, tín dĩ phát chí dã. Uy như chi cát, dị nhi vô bị dã.",
        "xiangMeaning": "Lòng chí thành gắn kết mọi người, lấy đức tín phát huy ý chí; vẻ uy nghiêm tốt lành vì đôn hậu bình dị mà khiến người tự phục không cần phòng bị.",
        "explanation": "Lấy ân đức và uy tín cảm hóa lòng người; lãnh đạo đôn hậu vị tha được muôn người kính phục."
      },
      {
        "line": 6,
        "lineName": "Thượng Cửu",
        "xiangOriginal": "Tượng viết: Đại Hữu thượng cát, tự thiên hữu dã.",
        "xiangMeaning": "Hào Thượng quẻ Đại Hữu cực kỳ tốt lành, nhờ được trời chở che giúp đỡ vậy.",
        "explanation": "Giàu sang tột đỉnh mà đức độ vẹn toàn, thuận thiên ứng nhân thì phúc đức truyền lại muôn đời."
      }
    ]
  },
  "15": {
    "number": 15,
    "name": "Địa Sơn Khiêm",
    "vietnameseName": "Khiêm (Khiêm tốn, núi cao giấu dưới lòng đất)",
    "daxiang": {
      "original": "Địa trung hữu sơn, Khiêm; quân tử dĩ phẫu đa ích quả, xứng vật bình thi.",
      "meaning": "Trong lòng đất có núi cao ẩn giấu là quẻ Khiêm; người quân tử noi theo đó mà bớt chỗ thừa bù chỗ thiếu, cân nhắc sự vật phân bổ công bằng.",
      "explanation": "Núi cao vòi vọi mà chịu nhún mình nằm dưới mặt đất bằng phẳng, tượng trưng cho đức tính khiêm tốn tột bực. Càng có tài năng học vấn càng phải khiêm nhường dung dị. Đạo trời bớt chỗ dư thừa bù vào chỗ thiếu hụt, người khiêm hạ đi đâu cũng được yêu thương giúp đỡ."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Lục",
        "xiangOriginal": "Tượng viết: Khiêm khiêm quân tử, ti dĩ tự mục dã.",
        "xiangMeaning": "Quân tử khiêm tốn lại càng khiêm tốn, lấy sự nhún nhường tự chăn dắt tu dưỡng bản thân.",
        "explanation": "Giữ thái độ khiêm nhường nhã nhặn ngay từ vị trí thấp nhất, vượt qua mọi trở ngại bình an vô sự."
      },
      {
        "line": 2,
        "lineName": "Lục Nhị",
        "xiangOriginal": "Tượng viết: Minh khiêm trinh cát, trung tâm đắc dã.",
        "xiangMeaning": "Tiếng khiêm nhường vang xa giữ đạo chính tốt lành, từ tận đáy lòng phát tiết ra ngoài.",
        "explanation": "Đức khiêm tốn xuất phát từ nội tâm chân thành tự nhiên lan tỏa, được mọi người quý trọng tôn vinh."
      },
      {
        "line": 3,
        "lineName": "Cửu Tam",
        "xiangOriginal": "Tượng viết: Lao khiêm quân tử, vạn dân phục dã.",
        "xiangMeaning": "Người quân tử có công lao to lớn mà vẫn khiêm tốn, muôn dân vạn họ đều khâm phục.",
        "explanation": "Lập nên công trạng hiển hách mà không hề kể công tự mãn; tấm gương sáng khiến thiên hạ ngưỡng mộ noi theo."
      },
      {
        "line": 4,
        "lineName": "Lục Tứ",
        "xiangOriginal": "Tượng viết: Vô bất lợi huy khiêm, bất vi tắc dã.",
        "xiangMeaning": "Không gì là không lợi khi phát huy đức khiêm tốn, không hề trái với quy tắc chuẩn mực.",
        "explanation": "Ở vị trí thừa hành cận kề lãnh đạo, giữ đức khiêm nhu cẩn trọng thì công việc thuận buồm xuôi gió."
      },
      {
        "line": 5,
        "lineName": "Lục Ngũ",
        "xiangOriginal": "Tượng viết: Lợi dụng xâm phạt, chinh bất phục dã.",
        "xiangMeaning": "Có lợi khi dùng uy vũ trừng phạt kẻ ngang ngạnh không phục tùng đức khiêm nhường.",
        "explanation": "Khiêm tốn không có nghĩa là nhu nhược; khi cần thiết phải nghiêm minh kỷ luật những kẻ ngoan cố phá hoại."
      },
      {
        "line": 6,
        "lineName": "Thượng Lục",
        "xiangOriginal": "Tượng viết: Minh khiêm, chí vị đắc dã. Khả dụng hành sư, chinh ấp quốc dã.",
        "xiangMeaning": "Tiếng khiêm vang khắp mà chí nguyện chưa trọn; có thể dùng binh lực để chỉnh đốn ấp ấp xứ sở của mình.",
        "explanation": "Luôn thấy mình còn thiếu sót để không ngừng tự kiểm điểm chỉnh đốn bản thân và nội bộ."
      }
    ]
  },
  "16": {
    "number": 16,
    "name": "Lôi Địa Dự",
    "vietnameseName": "Dự (Vui vẻ, hân hoan chuẩn bị)",
    "daxiang": {
      "original": "Lôi xuất địa phấn, Dự; tiên vương dĩ tác nhạc sùng đức, ân tiến chi thượng đế, dĩ phối tổ khảo.",
      "meaning": "Sấm phát ra từ lòng đất vang dội hưng phấn là quẻ Dự; các bậc tiên vương noi theo đó mà làm ra âm nhạc để tôn sùng đạo đức, long trọng dâng lên Thượng đế và phối hưởng cùng tổ tiên.",
      "explanation": "Khí dương bị dồn nén trong lòng đất nay bật dậy nổ ra tiếng sấm mùa xuân ấm áp đánh thức muôn loài vui tươi. Dự là hân hoan và cũng là dự bị chu đáo. Người quân tử biết dùng âm nhạc, văn hóa nghệ thuật làm thanh lọc tâm hồn, gắn kết cộng đồng trong niềm hân hoan hòa bình."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Lục",
        "xiangOriginal": "Tượng viết: Minh dự hung, chí cùng hung dã.",
        "xiangMeaning": "Khoe khoang niềm vui hưởng lạc ắt gặp hung họa, ý chí cùng quẫn chuốc lấy tai ương.",
        "explanation": "Chưa làm nên trò trống gì đã ham mê hưởng lạc, khoe khoang tự phụ ắt chuốc lấy thất bại ê chề."
      },
      {
        "line": 2,
        "lineName": "Lục Nhị",
        "xiangOriginal": "Tượng viết: Giới vu thạch, bất chung nhật, trinh cát, dĩ trung chính dã.",
        "xiangMeaning": "Vững chắc như đá tảng, không đợi hết ngày đã hành động, giữ đạo chính thì tốt lành, nhờ ở vào đức trung chính.",
        "explanation": "Sáng suốt nhìn thấu cơ vi từ sớm, không bị thói vui chơi làm mê muội; kiên định nguyên tắc tự chủ bảo toàn danh dự."
      },
      {
        "line": 3,
        "lineName": "Lục Tam",
        "xiangOriginal": "Tượng viết: Hu dự hữu hối, vị bất đáng dã.",
        "xiangMeaning": "Ngước nhìn người trên mà cầu vui thì sinh hối hận, vì ở vào ngôi vị không thích đáng.",
        "explanation": "Dựa dẫm luồn cúi bám đuôi kẻ quyền thế để kiếm chác mua vui, sớm muộn cũng bị người khinh rẻ và chuốc tiếc nuối."
      },
      {
        "line": 4,
        "lineName": "Cửu Tứ",
        "xiangOriginal": "Tượng viết: Do dự đại hữu đắc, chí đại hành dã.",
        "xiangMeaning": "Nguồn cội của niềm vui hân hoan thu được kết quả lớn lao, chí nguyện lớn được thực thi trọn vẹn.",
        "explanation": "Là trụ cột đem lại niềm vui và sự phồn vinh cho cả tập thể; được mọi người tin cậy gửi gắm ước mơ."
      },
      {
        "line": 5,
        "lineName": "Lục Ngũ",
        "xiangOriginal": "Tượng viết: Trinh tật, thừa cương dã. Hằng bất tử, trung vị vong dã.",
        "xiangMeaning": "Mang bệnh tật triền miên vì cưỡi lên hào cương cường. Nhưng bền bỉ không chết nhờ đức trung dung chưa từng mất.",
        "explanation": "Ở trong môi trường cám dỗ trụy lạc nhưng biết tự răn mình kiềm chế, tuy vất vả nhưng không bị suy thoái nhân cách."
      },
      {
        "line": 6,
        "lineName": "Thượng Lục",
        "xiangOriginal": "Tượng viết: Minh dự tại thượng, hà khả trường dã.",
        "xiangMeaning": "Mê muội trong hưởng lạc ở ngôi cao ngất, cảnh ấy sao có thể kéo dài lâu bền được.",
        "explanation": "Đắm chìm trong men say chiến thắng và khoái lạc; nếu không mau tỉnh ngộ quay đầu thì tai họa ập đến ngay tức khắc."
      }
    ]
  },
  "17": {
    "number": 17,
    "name": "Trạch Lôi Tùy",
    "vietnameseName": "Tùy (Tùy duyên, thuận theo tự nhiên)",
    "daxiang": {
      "original": "Trạch trung hữu lôi, Tùy; quân tử dĩ hướng hối nhập yến tức.",
      "meaning": "Trong đầm có sấm ẩn náu là quẻ Tùy; người quân tử noi theo đó mà khi trời sập tối thì vào nhà nghỉ ngơi an dưỡng.",
      "explanation": "Sấm mùa đông lặn dưới đầm sâu tĩnh lặng, thuận theo quy luật ngày đêm bốn mùa. 'Tùy' là thuận theo lẽ tự nhiên, tùy thời ứng biến, không cưỡng cầu chống lại quy luật. Người quân tử ngày làm đêm nghỉ, động tĩnh có lúc, giữ gìn sức lực và thích nghi linh hoạt với mọi hoàn cảnh."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Cửu",
        "xiangOriginal": "Tượng viết: Quan hữu du, tòng chính cát dã. Xuất môn giao hữu công, bất thất dã.",
        "xiangMeaning": "Mục tiêu thay đổi nhưng theo điều chính đáng thì tốt lành. Ra khỏi cửa kết giao lập nên công trạng, không hề mất mát.",
        "explanation": "Biết thay đổi quan điểm theo lẽ phải, sẵn sàng mở rộng giao lưu với nhân tài bên ngoài thì việc làm có kết quả tốt."
      },
      {
        "line": 2,
        "lineName": "Lục Nhị",
        "xiangOriginal": "Tượng viết: Hệ tiểu tử, phất kiêm dữ dã.",
        "xiangMeaning": "Ràng buộc quấn quýt với kẻ non trẻ, chẳng thể cùng lúc kết giao với người trượng phu tài đức.",
        "explanation": "Cứ bám víu vào những mối quan hệ tầm thường vụn vặt thì sẽ đánh mất cơ hội tiếp cận bậc đại trí."
      },
      {
        "line": 3,
        "lineName": "Lục Tam",
        "xiangOriginal": "Tượng viết: Hệ trượng phu, chí xả hạ dã.",
        "xiangMeaning": "Gắn bó noi theo bậc trượng phu tài đức, ý chí dứt khoát buông bỏ những điều thấp kém bên dưới.",
        "explanation": "Biết chọn bạn mà chơi, từ bỏ những thói quen xấu và đối tượng tầm thường để học hỏi người giỏi giang hơn."
      },
      {
        "line": 4,
        "lineName": "Cửu Tứ",
        "xiangOriginal": "Tượng viết: Tùy hữu hoạch, kỳ nghĩa hung dã. Hữu phu tại đạo dĩ minh, hà cữu hĩ.",
        "xiangMeaning": "Thuận theo mà có kẻ trục lợi theo sau, về mặt đạo nghĩa là điều hung. Nhưng nếu giữ lòng chí thành sáng suốt theo đạo lý thì nào có lỗi gì.",
        "explanation": "Có người theo phục tùng mình phải thận trọng đề phòng kẻ nịnh bợ trục lợi; giữ tâm sáng chí công vô tư."
      },
      {
        "line": 5,
        "lineName": "Cửu Ngũ",
        "xiangOriginal": "Tượng viết: Phu vu gia, vị chính trung dã.",
        "xiangMeaning": "Chí thành tin cậy nơi điều tốt đẹp thiện lành, nhờ ở vào ngôi vị trung chính cao đẹp.",
        "explanation": "Lãnh đạo tin dùng bậc hiền tài, hết lòng vì điều thiện thì sự nghiệp đạt đỉnh cao rực rỡ."
      },
      {
        "line": 6,
        "lineName": "Thượng Lục",
        "xiangOriginal": "Tượng viết: Câu hệ chi, thượng cùng dã.",
        "xiangMeaning": "Bị trói buộc níu kéo lấy, vì ở ngôi cao cùng cực mà lòng người quy phục khăng khít.",
        "explanation": "Tấm lòng gắn bó son sắt trung kiên đến cùng; sự chân thành trọn vẹn cảm hóa lòng người đến tột bực."
      }
    ]
  },
  "18": {
    "number": 18,
    "name": "Sơn Phong Cổ",
    "vietnameseName": "Cổ (Sửa chữa sai lầm, đổi mới chấn hưng)",
    "daxiang": {
      "original": "Sơn hạ hữu phong, Cổ; quân tử dĩ chấn dân dục đức.",
      "meaning": "Dưới chân núi có luồng gió luẩn quẩn sinh sâu bọ hư hỏng là quẻ Cổ; người quân tử noi theo đó mà chấn hưng lòng dân, nuôi dưỡng đạo đức tốt đẹp.",
      "explanation": "Gió bị núi chắn lại sinh đình trệ, hủ bại, sâu mọt nảy sinh. 'Cổ' là việc đổ nát tích tụ cần cải tổ, dọn dẹp. Người quân tử không trốn tránh sai lầm quá khứ mà dũng cảm đối diện, chỉnh đốn tệ nạn, cải cách quy trình, vực dậy tinh thần cộng đồng để bước sang trang mới."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Lục",
        "xiangOriginal": "Tượng viết: Can phụ chi cổ, ý thừa khảo dã.",
        "xiangMeaning": "Gánh vác sửa chữa lỗi lầm hủ bại của đời cha trước để lại, ý chí nối dõi sự nghiệp của tổ tiên.",
        "explanation": "Con kế nghiệp cha dũng cảm cải tổ sai lầm của thế hệ trước; khéo léo đổi mới mà không làm tổn thương truyền thống."
      },
      {
        "line": 2,
        "lineName": "Cửu Nhị",
        "xiangOriginal": "Tượng viết: Can mẫu chi cổ, đắc trung đạo dã.",
        "xiangMeaning": "Sửa chữa điều sai hỏng của người mẹ, giữ được đạo trung dung ôn hòa khéo léo.",
        "explanation": "Uốn nắn khuyết điểm của người thân thuộc cần tế nhị, mềm mỏng lấy tình cảm cảm hóa, tránh nóng vội gay gắt."
      },
      {
        "line": 3,
        "lineName": "Cửu Tam",
        "xiangOriginal": "Tượng viết: Can phụ chi cổ, chung vô cữu dã.",
        "xiangMeaning": "Gánh vác sửa đổi sự việc của đời cha có chút quá tay hối hận, nhưng cuối cùng không có lỗi gì.",
        "explanation": "Cải cách quá quyết liệt có thể gây va chạm nhất thời, nhưng vì mục tiêu đúng đắn nên kết quả vẫn tốt."
      },
      {
        "line": 4,
        "lineName": "Lục Tứ",
        "xiangOriginal": "Tượng viết: Dụ phụ chi cổ, vãng kiến lận dã.",
        "xiangMeaning": "Khoan nhượng dung túng điều hủ bại của đời trước, cứ để thế mà tiến tới tất chuốc lấy xấu hổ thất bại.",
        "explanation": "Nhu nhược nhắm mắt làm ngơ trước tiêu cực, bao che sai phạm ắt dẫn đến sự sụp đổ nghiêm trọng."
      },
      {
        "line": 5,
        "lineName": "Lục Ngũ",
        "xiangOriginal": "Tượng viết: Can phụ chi cổ, thừa dĩ đức dã.",
        "xiangMeaning": "Sửa chữa di hại của tiền nhân mà dùng đức hạnh bao dung, ắt nhận được lời ca ngợi danh thơm.",
        "explanation": "Cải tổ bằng uy tín đạo đức và chính sách nhân văn; được mọi người đồng lòng ủng hộ tạo nên thành công vang dội."
      },
      {
        "line": 6,
        "lineName": "Thượng Cửu",
        "xiangOriginal": "Tượng viết: Bất sự vương hầu, chí khả tắc dã.",
        "xiangMeaning": "Không phụng sự vương hầu mà giữ phẩm hạnh thanh cao, ý chí ấy thật đáng làm khuôn phép cho đời.",
        "explanation": "Rời xa danh lợi trần tục để theo đuổi lý tưởng cao đẹp; nhân cách thanh bạch là tấm gương sáng muôn đời."
      }
    ]
  },
  "19": {
    "number": 19,
    "name": "Địa Trạch Lâm",
    "vietnameseName": "Lâm (Tới gần, bao quát mở rộng)",
    "daxiang": {
      "original": "Địa thượng hữu trạch, Lâm; quân tử dĩ giáo tư vô cùng, dung bảo dân vô cương.",
      "meaning": "Trên mặt đất có đầm nước thấm nhuần nuôi dưỡng là quẻ Lâm; người quân tử noi theo đó mà suy nghĩ việc giáo hóa muôn dân không ngừng nghỉ, bao dung chở che nhân dân vô bờ bến.",
      "explanation": "Đầm nước nằm áp sát mặt đất đem hơi ẩm màu mỡ tưới mát cho cây cỏ. Khí dương lớn mạnh từ dưới đi lên, thời cơ tiến bước thuận lợi. Bậc cai trị thân cận gần gũi dân chúng, lắng nghe tâm tư nguyện vọng, kiên trì giáo dục bồi dưỡng nhân tài không biết mệt mỏi."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Cửu",
        "xiangOriginal": "Tượng viết: Hàm lâm trinh cát, chí hành chính dã.",
        "xiangMeaning": "Cùng nhau tiến tới giữ đạo chính thì tốt lành, ý chí thực thi con đường ngay thẳng.",
        "explanation": "Dương khí vừa bừng khởi, đồng lòng cùng bạn hiền tiến bước theo chính đạo thì tiền đồ xán lạn."
      },
      {
        "line": 2,
        "lineName": "Cửu Nhị",
        "xiangOriginal": "Tượng viết: Hàm lâm cát vô bất lợi, vị thuận mệnh dã.",
        "xiangMeaning": "Cùng nhau tiến tới tốt lành không gì là không lợi, dẫu chưa hoàn toàn thuận theo mệnh trời cũng tự phát dương.",
        "explanation": "Tài năng đức độ sung mãn ở ngôi trung chính, tự tin gánh vác trọng trách lớn tạo nên thành tựu vượt bậc."
      },
      {
        "line": 3,
        "lineName": "Lục Tam",
        "xiangOriginal": "Tượng viết: Cam lâm, vị bất đáng dã. Ký ưu chi, cữu bất trường dã.",
        "xiangMeaning": "Dùng lời đường mật ngọt ngào mà tiếp cận người khác, vì ở ngôi vị không thích đáng. Nhưng đã biết lo lắng sửa sai thì lỗi lầm không kéo dài.",
        "explanation": "Thấy thuận lợi mà sinh thói xu nịnh nịnh bợ; may mắn biết tự kiểm điểm sửa mình nên tai họa tiêu tan."
      },
      {
        "line": 4,
        "lineName": "Lục Tứ",
        "xiangOriginal": "Tượng viết: Chí lâm vô cữu, vị đương dã.",
        "xiangMeaning": "Đích thân thân hành tiếp cận kẻ hiền tài thì không lỗi, vì ngôi vị thích hợp hòa thuận.",
        "explanation": "Người ở vị trí cao chủ động hạ mình cầu hiền, phối hợp nhịp nhàng với thuộc cấp tài năng."
      },
      {
        "line": 5,
        "lineName": "Lục Ngũ",
        "xiangOriginal": "Tượng viết: Đại quân chi nghi, hành trung chi vị dã.",
        "xiangMeaning": "Tư thế xứng đáng của bậc minh quân, chính là hành động theo đạo trung dung sáng suốt.",
        "explanation": "Bậc lãnh đạo anh minh biết trao quyền cho người giỏi, đứng ở ngôi trung điều phối nhịp nhàng mà đại trị."
      },
      {
        "line": 6,
        "lineName": "Thượng Lục",
        "xiangOriginal": "Tượng viết: Đôn lâm chi cát, chí tại nội dã.",
        "xiangMeaning": "Lấy lòng đôn hậu chân thành mà tiếp đãi muôn người thì tốt lành, tâm ý hướng về lợi ích bên trong.",
        "explanation": "Đức độ thuần hậu, tận tụy chỉ dẫn thế hệ sau mà không màng danh vị cá nhân; phúc đức sâu dày viên mãn."
      }
    ]
  },
  "20": {
    "number": 20,
    "name": "Phong Địa Quan",
    "vietnameseName": "Quan (Quan sát, chiêm nghiệm thấu suốt)",
    "daxiang": {
      "original": "Phong hành địa thượng, Quan; tiên vương dĩ tỉnh phương quán dân thiết giáo.",
      "meaning": "Gió thổi lướt khắp trên mặt đất là quẻ Quan; các bậc tiên vương noi theo đó mà tuần thú các phương, quan sát phong tục lòng dân mà thiết lập sự giáo hóa.",
      "explanation": "Gió thổi đến đâu cỏ rạp đến đó, lan tỏa khắp chốn dương gian không góc khuất nào bỏ sót. 'Quan' vừa là quan sát sâu sắc bản thân và thế sự, vừa là tấm gương mẫu mực cho người khác noi theo. Lãnh đạo phải giữ thân tâm trong sạch, nêu gương sáng đức độ để dân chúng tự giác quy phục."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Lục",
        "xiangOriginal": "Tượng viết: Sơ lục đồng quan, tiểu nhân đạo dã.",
        "xiangMeaning": "Hào Sơ Lục nhìn đời như con trẻ ngây ngô nông cạn, đó là con đường của kẻ tiểu nhân ít học.",
        "explanation": "Tầm nhìn thiển cận nhìn việc phiến diện bề ngoài; cần mở rộng nhãn quan học hỏi người hiểu biết sâu rộng."
      },
      {
        "line": 2,
        "lineName": "Lục Nhị",
        "xiangOriginal": "Tượng viết: Khuy quan nữ trinh, diệc khả xú dã.",
        "xiangMeaning": "Dòm ngó qua khe cửa hẹp như thói quen phụ nữ trong nhà, đối với đấng trượng phu cũng là điều đáng xấu hổ.",
        "explanation": "Góc nhìn hạn hẹp định kiến qua lỗ khóa; người làm việc lớn cần phóng tầm mắt bao quát toàn cục."
      },
      {
        "line": 3,
        "lineName": "Lục Tam",
        "xiangOriginal": "Tượng viết: Quan ngã sinh tiến thoái, vị thất đạo dã.",
        "xiangMeaning": "Tự nhìn lại hành vi sinh hoạt của bản thân mà quyết định tiến thoái, chưa hề đánh mất con đường chính đạo.",
        "explanation": "Thường xuyên tự soi xét năng lực và hoàn cảnh của mình; khi nào nên tiến khi nào nên lui một cách sáng suốt."
      },
      {
        "line": 4,
        "lineName": "Lục Tứ",
        "xiangOriginal": "Tượng viết: Quan quốc chi quang, thượng tân dã.",
        "xiangMeaning": "Chiêm ngưỡng ánh sáng văn hóa chính trị thịnh vượng của đất nước, được triều đình trọng đãi như bậc thượng khách.",
        "explanation": "Có tài năng và hiểu biết sâu rộng về thời cuộc, được bậc lãnh đạo tin dùng làm cố vấn chiến lược."
      },
      {
        "line": 5,
        "lineName": "Cửu Ngũ",
        "xiangOriginal": "Tượng viết: Quan ngã sinh, quan dân dã.",
        "xiangMeaning": "Quan sát nếp sống đức hạnh của bản thân ta, cũng chính là nhìn vào đời sống của trăm họ muôn dân.",
        "explanation": "Bậc cầm quyền lấy sự no ấm hạnh phúc của nhân dân làm thước đo đánh giá sự thành công của chính mình."
      },
      {
        "line": 6,
        "lineName": "Thượng Cửu",
        "xiangOriginal": "Tượng viết: Quan kỳ sinh, chí vị bình dã.",
        "xiangMeaning": "Chiêm nghiệm nếp sống đạo đức của người khác để tự răn mình, ý chí vẫn chưa bao giờ nguôi ngoai tự kiểm điểm.",
        "explanation": "Bậc hiền triết cao tuổi rời xa quan trường nhưng vẫn luôn ưu thời mẫn thế, tự hoàn thiện nhân cách đến cuối đời."
      }
    ]
  },
  "21": {
    "number": 21,
    "name": "Hỏa Lôi Phệ Hạp",
    "vietnameseName": "Phệ Hạp (Cắn đứt vật cản, pháp luật nghiêm minh)",
    "daxiang": {
      "original": "Lôi điện, Phệ Hạp; tiên vương dĩ minh phạt sắc pháp.",
      "meaning": "Sấm chớp cùng nổi lên uy phong sáng lòa là quẻ Phệ Hạp; các bậc tiên vương noi theo đó mà làm rõ hình phạt, chỉnh đốn pháp luật nghiêm minh.",
      "explanation": "Sấm nổ vang răn đe kẻ ác, chớp giật sáng soi rõ mọi ngóc ngách khuất tất. 'Phệ hạp' là cắn nghiến đứt vật cản ở giữa hai hàm răng để hai hàm khớp lại. Xã hội có kẻ gian tà cản trở sự hòa hợp thì phải dùng pháp luật công minh, thưởng phạt phân minh để trừ khử trở ngại thiết lập trật tự."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Cửu",
        "xiangOriginal": "Tượng viết: Tê diệt tị, bất hành dã.",
        "xiangMeaning": "Mang cùm chân ngập đến ngón chân để răn đe, ngăn không cho tiếp tục bước vào đường sai quấy.",
        "explanation": "Mắc lỗi nhỏ bị nhắc nhở phạt nhẹ kịp thời; răn đe từ sớm để không trượt dài vào tội ác nghiêm trọng."
      },
      {
        "line": 2,
        "lineName": "Lục Nhị",
        "xiangOriginal": "Tượng viết: Phệ phu diệt tị, thừa cương dã.",
        "xiangMeaning": "Cắn miếng thịt mềm mà ngập mũi, vì cưỡi lên hào cương cường quyết liệt.",
        "explanation": "Xử lý việc vi phạm dễ dàng trót lọt nhưng hơi quá tay; giữ công tâm thì không để lại hậu họa."
      },
      {
        "line": 3,
        "lineName": "Lục Tam",
        "xiangOriginal": "Tượng viết: Ngộ độc, vị bất đáng dã.",
        "xiangMeaning": "Cắn phải thịt khô trúng độc, vì ở vào ngôi vị bất xứng không thích đáng.",
        "explanation": "Tài năng uy tín chưa đủ mà nhận việc xử lý tranh chấp nan giải, bị người chống đối trách cứ."
      },
      {
        "line": 4,
        "lineName": "Cửu Tứ",
        "xiangOriginal": "Tượng viết: Lợi gian trinh cát, vị quang dã.",
        "xiangMeaning": "Cắn phải sụn cứng có mũi tên sắt, có lợi khi kiên trì vượt gian khó giữ đạo chính thì tốt lành; đạo đức chưa thực sự rạng rỡ.",
        "explanation": "Đối đầu với thế lực ngoan cố hiểm hóc; phải kiên quyết, công tâm như mũi tên đồng mới dẹp tan được cản trở."
      },
      {
        "line": 5,
        "lineName": "Lục Ngũ",
        "xiangOriginal": "Tượng viết: Trinh lệ vô cữu, đắc đương dã.",
        "xiangMeaning": "Cắn thịt khô tìm thấy vàng ròng, giữ lòng chính đính răn sợ thì không lỗi, vì hành xử đúng đắn thích hợp.",
        "explanation": "Nắm quyền xét xử khoan dung nhưng giữ nghiêm phép nước; tâm công bằng sáng suốt như vàng mười."
      },
      {
        "line": 6,
        "lineName": "Thượng Cửu",
        "xiangOriginal": "Tượng viết: Hà hiệu diệt nhĩ, thông bất minh dã.",
        "xiangMeaning": "Đeo gông to trùm lấp cả hai tai, tai bị điếc không nghe lời can gián, chịu họa cực hình.",
        "explanation": "Bảo thủ ngoan cố bịt tai không nghe lẽ phải, cố tình làm điều phi pháp đến cùng ắt chuốc lấy đại họa diệt vong."
      }
    ]
  },
  "22": {
    "number": 22,
    "name": "Sơn Hỏa Bí",
    "vietnameseName": "Bí (Trang trí, vẻ đẹp văn hóa lễ nghi)",
    "daxiang": {
      "original": "Sơn hạ hữu hỏa, Bí; quân tử dĩ minh thứ chính, vô cảm chiết ngục.",
      "meaning": "Dưới chân núi có ánh lửa bừng sáng soi rọi cảnh vật là quẻ Bí; người quân tử noi theo đó mà làm sáng tỏ các công việc chính sự nhỏ, nhưng không dám dùng trang sức bề ngoài để quyết đoán việc ngục hình lớn.",
      "explanation": "Lửa soi sáng rực rỡ dưới chân núi làm cảnh vật thêm lung linh gấm vóc. 'Bí' là trang hoàng, văn vẻ, lễ nghi. Hình thức bề ngoài làm cho đời sống thêm tươi đẹp thanh nhã, nhưng bản chất bên trong mới là gốc. Trong việc hệ trọng như án ngục, phải dựa vào sự thật chứ không thể bị che mắt bởi vẻ hào nhoáng giả tạo."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Cửu",
        "xiangOriginal": "Tượng viết: Xả xa nhi đồ, nghĩa phất thừa xa dã.",
        "xiangMeaning": "Bỏ xe ngựa mà đi bộ cho thanh thản, theo đạo nghĩa thì không nên ngồi cỗ xe không chính đáng.",
        "explanation": "Thà chịu vất vả đi bộ giữ khí tiết thanh bạch, chứ không nhận ân huệ bất minh của kẻ quyền thế."
      },
      {
        "line": 2,
        "lineName": "Lục Nhị",
        "xiangOriginal": "Tượng viết: Bí kỳ tu, dữ thượng hưng dã.",
        "xiangMeaning": "Tỉa tót trang điểm cho bộ râu, cùng nhau hướng lên hòa nhịp với bậc bề trên.",
        "explanation": "Làm đẹp phụ thuộc vào gốc rễ; khéo léo giúp việc phụ tá cho người đứng đầu tạo nên sự hài hòa."
      },
      {
        "line": 3,
        "lineName": "Cửu Tam",
        "xiangOriginal": "Tượng viết: Vĩnh trinh chi cát, chung mạc chi lăng dã.",
        "xiangMeaning": "Bền bỉ giữ đạo chính thì tốt lành, trọn đời chẳng có ai có thể khinh nhờn lấn lướt được.",
        "explanation": "Được hưởng ân huệ và vẻ đẹp rực rỡ nhưng không sa đà trụy lạc; giữ trọn phẩm cách thì uy tín bền lâu."
      },
      {
        "line": 4,
        "lineName": "Lục Tứ",
        "xiangOriginal": "Tượng viết: Lục tứ đương vị, nghi dã. Bạch mã hàn như, phi khấu hôn cấu, chung vô vưu dã.",
        "xiangMeaning": "Hào Lục Tứ ở đúng ngôi vị nhưng còn nghi ngờ do dự. Ngựa trắng như bay, không phải giặc cướp mà là người cầu hôn tốt lành, cuối cùng chẳng có lỗi oán trách.",
        "explanation": "Thấy người chân thành đến với mình mộc mạc đừng nghi kỵ; bỏ qua hình thức cầu kỳ hướng đến sự gắn kết son sắt."
      },
      {
        "line": 5,
        "lineName": "Lục Ngũ",
        "xiangOriginal": "Tượng viết: Lục ngũ chi cát, hữu hỉ dã.",
        "xiangMeaning": "Sự tốt lành của hào Lục Ngũ đem lại niềm vui mừng hân hoan to lớn.",
        "explanation": "Lễ vật sơ sài mộc mạc nơi vườn dưa nhưng tấm lòng thành kính vô biên; được bậc cao nhân cảm kích kết giao."
      },
      {
        "line": 6,
        "lineName": "Thượng Cửu",
        "xiangOriginal": "Tượng viết: Bạch bí vô cữu, thượng đắc chí dã.",
        "xiangMeaning": "Dùng sắc trắng thuần khiết không tô vẽ mà không có lỗi, ở ngôi trên cùng đạt được chí nguyện thanh tao trọn vẹn.",
        "explanation": "Đỉnh cao của nghệ thuật và văn hóa là trở về với sự giản dị thuần phác nguyên sơ; chân phương mộc mạc là đẹp nhất."
      }
    ]
  },
  "23": {
    "number": 23,
    "name": "Sơn Địa Bác",
    "vietnameseName": "Bác (Bào mòn, suy tàn sụp đổ)",
    "daxiang": {
      "original": "Sơn phụ vu địa, Bác; thượng dĩ hậu hạ an trạch.",
      "meaning": "Núi sạt lở nằm dính trên mặt đất là quẻ Bác; người ở trên noi theo đó mà bồi đắp cho kẻ dưới vững vàng để yên ổn nhà cửa.",
      "explanation": "Năm hào âm từ dưới xông lên đục khoét làm hào dương duy nhất trên đỉnh núi sắp gãy đổ sụp lở. Thời tiểu nhân thịnh trị đục rỗng nền tảng. Người lãnh đạo muốn giữ vững địa vị thì phải chăm lo bảo bọc cho người dân cùng cấp dưới; gốc rễ bền chắc thì ngôi nhà mới không nghiêng ngả."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Lục",
        "xiangOriginal": "Tượng viết: Bác sàng dĩ túc, dĩ diệt hạ dã.",
        "xiangMeaning": "Bào mòn chân giường từ bên dưới, nhằm tiêu diệt nền tảng cơ sở.",
        "explanation": "Kẻ xấu bắt đầu ngấm ngầm đục khoét từ cấp cơ sở; phải cảnh giác nhận diện nguy cơ từ trong trứng nước."
      },
      {
        "line": 2,
        "lineName": "Lục Nhị",
        "xiangOriginal": "Tượng viết: Bác sàng dĩ biện, vị hữu dữ dã.",
        "xiangMeaning": "Bào mòn đến thân giường, vì chưa có ai đứng ra tương trợ che chở.",
        "explanation": "Hiểm họa lấn tới gần hơn, sự cô lập không có người cứu giúp; tuyệt đối không manh động chống trả lúc này."
      },
      {
        "line": 3,
        "lineName": "Lục Tam",
        "xiangOriginal": "Tượng viết: Bác chi vô cữu, thất thượng hạ dã.",
        "xiangMeaning": "Cùng trong cảnh bào mòn mà không có lỗi, vì tách rời khỏi bè lũ tiểu nhân trên dưới để theo về bậc chính nhân.",
        "explanation": "Gần bùn mà chẳng hôi tanh mùi bùn; dũng cảm rời bỏ phe cánh sai trái để quay về với lẽ phải."
      },
      {
        "line": 4,
        "lineName": "Lục Tứ",
        "xiangOriginal": "Tượng viết: Bác sàng dĩ phu, thiết cận tai dã.",
        "xiangMeaning": "Bào mòn chạm đến tận da thịt người nằm trên giường, tai họa kề sát ngay gang tấc.",
        "explanation": "Nguy hiểm đã cận kề trước mắt, không thể chần chừ; phải mau chóng rút lui tìm nơi ẩn náu an toàn."
      },
      {
        "line": 5,
        "lineName": "Lục Ngũ",
        "xiangOriginal": "Tượng viết: Dĩ cung nhân sủng, chung vô vưu dã.",
        "xiangMeaning": "Dẫn dắt các cung nhân theo thứ tự đón nhận ân sủng, cuối cùng không có điều gì oán trách sai phạm.",
        "explanation": "Khéo léo quy tụ quần chúng quy phục bậc quân tử chính đạo, hóa giải mầm mống phản trắc."
      },
      {
        "line": 6,
        "lineName": "Thượng Cửu",
        "xiangOriginal": "Tượng viết: Quân tử đắc dư, dân sở tải dã. Tiểu nhân bác lư, chung bất khả dụng dã.",
        "xiangMeaning": "Quân tử như quả to chưa rụng được ngồi trên xe lớn, nhờ muôn dân nâng đỡ chở che. Tiểu nhân nếu phá nát túp lều ắt cuối cùng tự làm hại mình chẳng còn chỗ nương thân.",
        "explanation": "Chân lý và điều thiện không bao giờ bị tiêu diệt hoàn toàn; trải qua cơn giông bão hạt giống thiện lành sẽ nảy mầm tái sinh rực rỡ."
      }
    ]
  },
  "24": {
    "number": 24,
    "name": "Địa Lôi Phục",
    "vietnameseName": "Phục (Tái sinh, một luồng dương khí trở lại)",
    "daxiang": {
      "original": "Lôi tại địa trung, Phục; tiên vương dĩ chí nhật bế quan, thương lữ bất hành, hậu bất tỉnh phương.",
      "meaning": "Sấm chấn động tiềm tàng trong lòng đất mùa đông là quẻ Phục; các bậc tiên vương noi theo đó mà vào ngày Đông chí đóng cửa ải, lái buôn không đi lại, vua không đi tuần thú các phương.",
      "explanation": "Một luồng hào dương vừa quay trở lại dưới đáy năm hào âm, mầm sống mới bắt đầu hồi sinh sau thời kỳ tàn tạ. 'Phục' là quay về bản tính thiện lương, khởi đầu một chu kỳ mới. Khí dương lúc này còn rất non nớt, cần được tĩnh dưỡng nghỉ ngơi, bế quan bảo tồn sinh lực, tránh làm xáo động."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Cửu",
        "xiangOriginal": "Tượng viết: Bất viễn chi phục, dĩ tu thân dã.",
        "xiangMeaning": "Sai lầm chưa xa đã kịp quay đầu trở lại con đường chính, đó là phương pháp tốt nhất để tu dưỡng bản thân.",
        "explanation": "Thấy sai lập tức sửa chữa ngay khi mới manh nha; đức hạnh quý báu của bậc hiền nhân không để lỗi lầm kéo dài."
      },
      {
        "line": 2,
        "lineName": "Lục Nhị",
        "xiangOriginal": "Tượng viết: Hưu phục chi cát, dĩ nhân hạ dã.",
        "xiangMeaning": "Sự quay về tốt lành đẹp đẽ, nhờ biết hạ mình noi theo bậc nhân đức.",
        "explanation": "Biết phục thiện, gần gũi và học tập người có đạo đức trí tuệ; bước chuyển mình vô cùng may mắn."
      },
      {
        "line": 3,
        "lineName": "Lục Tam",
        "xiangOriginal": "Tượng viết: Tần phục chi lệ, nghĩa vô cữu dã.",
        "xiangMeaning": "Nhiều lần lầm lỡ rồi lại quay về tuy đáng lo ngại nguy nan, nhưng về mặt đạo nghĩa thì không mắc lỗi lớn.",
        "explanation": "Ý chí chưa vững vàng nên hay ngập ngừng tái phạm, nhưng vẫn giữ tâm muốn hướng thiện thì còn cơ hội cứu vãn."
      },
      {
        "line": 4,
        "lineName": "Lục Tứ",
        "xiangOriginal": "Tượng viết: Trung hành độc phục, dĩ tòng đạo dã.",
        "xiangMeaning": "Đi giữa đám bạn bè mà một mình quay về chính đạo, quyết tâm noi theo con đường chân lý.",
        "explanation": "Không a dua theo đám đông lầm lạc; có dũng khí bước đi trên con đường đúng đắn dẫu phải đơn độc."
      },
      {
        "line": 5,
        "lineName": "Lục Ngũ",
        "xiangOriginal": "Tượng viết: Đôn phục vô hối, trung dĩ tự khảo dã.",
        "xiangMeaning": "Đôn hậu kiên định quay về nếp thiện thì không có gì hối hận, nhờ giữ tâm trung chính tự kiểm điểm nghiêm khắc bản thân.",
        "explanation": "Thành tâm sám hối và kiên trì rèn giũa phẩm cách ở ngôi cao; tấm gương đức độ được thiên hạ ngợi khen."
      },
      {
        "line": 6,
        "lineName": "Thượng Lục",
        "xiangOriginal": "Tượng viết: Mê phục chi hung, phản quân đạo dã.",
        "xiangMeaning": "Mê muội lầm lạc không chịu quay về ắt gặp hung họa, làm trái ngược lại với đạo lý của bậc minh quân.",
        "explanation": "Cố chấp trong sai lầm, bỏ lỡ hết cơ hội thức tỉnh; hậu quả tất yếu là chuốc lấy tai vạ thảm khốc không thể cứu vãn."
      }
    ]
  },
  "25": {
    "number": 25,
    "name": "Thiên Lôi Vô Vọng",
    "vietnameseName": "Vô Vọng (Thuận lẽ tự nhiên, không toan tính gian tà)",
    "daxiang": {
      "original": "Thiên hạ lôi hành, vật dữ Vô Vọng; tiên vương dĩ mậu đối thời, dục vạn vật.",
      "meaning": "Dưới trời có tiếng sấm rền vang thức tỉnh muôn loài, vạn vật đều giữ bản tính chân thật tự nhiên không vọng động là quẻ Vô Vọng; các bậc tiên vương noi theo đó mà thuận ứng đúng thời tiết, nuôi dưỡng vạn vật tốt tươi.",
      "explanation": "Sấm vang dưới trời dấy khởi sức sống mãnh liệt. 'Vô vọng' là chân thật, không hư ngụy dối trá, không vọng tưởng toan tính vụ lợi. Sống ngay thẳng thuận theo đạo trời thì không cần mưu mô xảo quyệt mà tự nhiên được hưởng phúc lộc bình an."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Cửu",
        "xiangOriginal": "Tượng viết: Vô vọng chi vãng, đắc chí dã.",
        "xiangMeaning": "Giữ lòng trong sáng không vọng tưởng mà tiến bước, ắt đạt được chí nguyện tốt lành.",
        "explanation": "Khởi đầu bằng tâm địa chân thật, không toan tính lọc lừa thì đi đến đâu cũng được người yêu mến giúp đỡ."
      },
      {
        "line": 2,
        "lineName": "Lục Nhị",
        "xiangOriginal": "Tượng viết: Bất canh hoạch, vị phú dã.",
        "xiangMeaning": "Không mong tính chuyện gặt hái khi vừa cày cấy, không nghĩ đến chuyện làm giàu tư lợi.",
        "explanation": "Chuyên tâm làm tốt bổn phận hiện tại mà không sốt ruột đòi hỏi kết quả tức thì; hữu xạ tự nhiên hương."
      },
      {
        "line": 3,
        "lineName": "Lục Tam",
        "xiangOriginal": "Tượng viết: Ấp nhân đắc ngưu, ấp nhân chi tai dã.",
        "xiangMeaning": "Người trong xóm dắt trâu đi mất, là tai họa bất ngờ ập xuống người qua đường vô can.",
        "explanation": "Gặp tai bay vạ gió oan ức ngoài ý muốn; điềm tĩnh nhẫn nại đợi thời gian giải tỏa, chớ nóng vội tranh cãi vô ích."
      },
      {
        "line": 4,
        "lineName": "Cửu Tứ",
        "xiangOriginal": "Tượng viết: Khả trinh vô cữu, hữu sở cố dã.",
        "xiangMeaning": "Có thể giữ lòng kiên định không mắc lỗi, vì trong tâm có điểm tựa đạo đức vững chắc cố định.",
        "explanation": "Giữ vững nguyên tắc và tâm trong sáng trước mọi cám dỗ, đứng vững vàng không bị hoàn cảnh lay chuyển."
      },
      {
        "line": 5,
        "lineName": "Cửu Ngũ",
        "xiangOriginal": "Tượng viết: Vô vọng chi dược, bất khả thí dã.",
        "xiangMeaning": "Gặp bệnh không do càn bậy sinh ra thì không cần uống thuốc bừa bãi, chớ thử thuốc càn.",
        "explanation": "Khó khăn tự nhiên đến rồi sẽ tự nhiên qua đi; đừng cuống cuồng dùng mưu mẹo đối phó kẻo làm sự việc thêm rối ren."
      },
      {
        "line": 6,
        "lineName": "Thượng Cửu",
        "xiangOriginal": "Tượng viết: Vô vọng chi hành, cùng chi tai dã.",
        "xiangMeaning": "Thời vận đã đến lúc cùng cực mà vẫn cố tiến hành, ắt chuốc lấy tai họa vì hành động sai thời.",
        "explanation": "Dù bản tâm không xấu nhưng thời thế chưa cho phép hành động; biết dừng lại an phận thủ thường để tránh tai ương."
      }
    ]
  },
  "26": {
    "number": 26,
    "name": "Sơn Thiên Đại Súc",
    "vietnameseName": "Đại Súc (Tích lũy lớn, đức dày chứa đựng càn khôn)",
    "daxiang": {
      "original": "Thiên tại sơn trung, Đại Súc; quân tử dĩ đa thức tiền ngôn vãng hạnh, dĩ súc kỳ đức.",
      "meaning": "Cả bầu trời bao la được chứa đựng trong lòng núi cao là quẻ Đại Súc; người quân tử noi theo đó mà học hỏi ghi nhớ sâu rộng lời nói và hành vi của tiền nhân thuở trước, để tích tụ đức hạnh tài năng cho mình.",
      "explanation": "Núi ngưng tụ sức mạnh chứa đựng cả khí trời, tượng trưng cho dung lượng tích tụ cực kỳ vĩ đại. Muốn làm nên sự nghiệp lớn lao giúp ích cho đời, người quân tử phải không ngừng học tập, nghiên cứu lịch sử, tiếp thu tinh hoa trí tuệ cổ nhân để rèn đức luyện tài dày dặn."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Cửu",
        "xiangOriginal": "Tượng viết: Hữu lệ lợi dĩ, bất phạm tai dã.",
        "xiangMeaning": "Có nguy hiểm thì dừng lại là điều có lợi, không phạm vào tai họa rủi ro.",
        "explanation": "Thấy chướng ngại phía trước thì chủ động dừng lại củng cố nội lực, không mạo hiểm mù quáng."
      },
      {
        "line": 2,
        "lineName": "Cửu Nhị",
        "xiangOriginal": "Tượng viết: Dư thuyết phúc, trung vô vưu dã.",
        "xiangMeaning": "Xe tháo rời thanh hãm trục xe để dừng lại, giữ đạo trung nên không có điều gì oán trách hối tiếc.",
        "explanation": "Tự mình kiềm chế năng lượng nóng vội, nhẫn nại chờ thời cơ chín muồi mới xuất kích."
      },
      {
        "line": 3,
        "lineName": "Cửu Tam",
        "xiangOriginal": "Tượng viết: Lợi hữu du vãng, thượng hợp chí dã.",
        "xiangMeaning": "Có lợi khi tiến bước tới phía trước, vì cùng hòa hợp ý chí với bậc bề trên đồng lòng phụng sự.",
        "explanation": "Rèn luyện kỹ năng thành thạo, có bạn bè tài giỏi đồng hành; tiến lên gánh vác việc lớn thu được thắng lợi."
      },
      {
        "line": 4,
        "lineName": "Lục Tứ",
        "xiangOriginal": "Tượng viết: Lục tứ nguyên cát, hữu hỉ dã.",
        "xiangMeaning": "Hào Lục Tứ đạt điều đại cát, đem lại niềm vui mừng hân hoan to lớn.",
        "explanation": "Đeo ván ngăn sừng con bò tơ khi nó chưa hung hãn; phòng ngừa hiểm họa từ gốc rễ là mưu lược tài tình nhất."
      },
      {
        "line": 5,
        "lineName": "Lục Ngũ",
        "xiangOriginal": "Tượng viết: Lục ngũ chi cát, hữu khánh dã.",
        "xiangMeaning": "Sự tốt lành của hào Lục Ngũ, đem lại điều phúc khánh vui tươi xum vầy.",
        "explanation": "Thiến răng nanh lợn rừng hung dữ để cảm hóa nó; khéo léo triệt tiêu mầm mống bạo lực bằng sự mềm mỏng thông tuệ."
      },
      {
        "line": 6,
        "lineName": "Thượng Cửu",
        "xiangOriginal": "Tượng viết: Hà thiên chi cù, đạo đại hành dã.",
        "xiangMeaning": "Gánh vác con đường thênh thang của trời xanh, đạo lý chính nghĩa được thực thi rộng khắp thiên hạ.",
        "explanation": "Sau thời gian dài tích lũy nội lực thâm hậu, nay thời cơ đại phát đã đến; mặc sức tung hoành lập nên đại nghiệp."
      }
    ]
  },
  "27": {
    "number": 27,
    "name": "Sơn Lôi Di",
    "vietnameseName": "Di (Nuôi dưỡng, lời ăn tiếng nói và đạo dưỡng sinh)",
    "daxiang": {
      "original": "Sơn hạ hữu lôi, Di; quân tử dĩ thận ngôn ngữ, tiết ẩm thực.",
      "meaning": "Dưới chân núi có tiếng sấm chấn động mùa xuân nảy mầm vạn vật là quẻ Di; người quân tử noi theo đó mà cẩn trọng trong từng lời ăn tiếng nói, tiết độ trong việc ăn uống sinh hoạt.",
      "explanation": "Hình quẻ giống như khuôn miệng đang hé mở. 'Di' là nuôi dưỡng thân tâm. Bệnh từ miệng vào, họa từ miệng ra; người quân tử dưỡng thân bằng cách ăn uống thanh đạm điều độ, dưỡng tâm bằng cách nói năng cẩn trọng, không buông lời thô thiển thị phi làm hại người hại mình."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Cửu",
        "xiangOriginal": "Tượng viết: Quan ngã đóa di, diệc bất túc quý dã.",
        "xiangMeaning": "Nhìn ta mà thèm thuồng rỏ dãi thèm muốn miếng ăn, hành vi ấy thật chẳng đáng quý trọng chút nào.",
        "explanation": "Có sẵn tài sản năng lực của mình mà không tự lực bồi dưỡng, lại đi ghen tị thèm muốn của người khác; thật đáng xấu hổ."
      },
      {
        "line": 2,
        "lineName": "Lục Nhị",
        "xiangOriginal": "Tượng viết: Lục nhị chinh hung, hành thất loại dã.",
        "xiangMeaning": "Hào Lục Nhị tiến bước gặp hung, vì hành động sai lệch rời bỏ đồng loại phụ thuộc người khác.",
        "explanation": "Cầu xin sự bảo bọc nuôi dưỡng không đúng đối tượng; tự hạ thấp nhân cách làm chuyện trái với lẽ thường."
      },
      {
        "line": 3,
        "lineName": "Lục Tam",
        "xiangOriginal": "Tượng viết: Thập niên vật dụng, đạo đại bối dã.",
        "xiangMeaning": "Mười năm chớ dùng vào việc gì, vì đi ngược lại quá xa với đạo lý nuôi dưỡng chân chính.",
        "explanation": "Sa đọa vào thói ăn chơi trác táng, chạy theo dục vọng tầm thường; tự hủy hoại bản thân suốt thời gian dài."
      },
      {
        "line": 4,
        "lineName": "Lục Tứ",
        "xiangOriginal": "Tượng viết: Điên di chi cát, thượng thi quang dã.",
        "xiangMeaning": "Tìm kiếm người nuôi dưỡng từ phía dưới được tốt lành, vì ánh sáng ân đức ban bố từ ngôi trên rộng khắp.",
        "explanation": "Người có địa vị cầu hiền tài bên dưới để cùng chăm lo đời sống nhân dân; mục đích cao cả được người người ủng hộ."
      },
      {
        "line": 5,
        "lineName": "Lục Ngũ",
        "xiangOriginal": "Tượng viết: Cư trinh chi cát, thuận dĩ tòng thượng dã.",
        "xiangMeaning": "Ở yên giữ đạo chính thì tốt lành, thuận theo mà nương tựa vào bậc hiền minh tài đức ở trên.",
        "explanation": "Tự biết sức mình có hạn, biết tin cậy nương tựa vào người tài giỏi hơn để cùng gánh vác việc chung."
      },
      {
        "line": 6,
        "lineName": "Thượng Cửu",
        "xiangOriginal": "Tượng viết: Do di lệ cát, đại hữu khánh dã.",
        "xiangMeaning": "Cội nguồn nuôi dưỡng muôn dân dẫu có nguy nan nhưng tốt lành, đem lại phúc khánh lớn lao cho thiên hạ.",
        "explanation": "Gánh vác trọng trách nuôi dưỡng tinh thần và vật chất cho cả cộng đồng; công lao vĩ đại được muôn đời ghi nhớ."
      }
    ]
  },
  "28": {
    "number": 28,
    "name": "Trạch Phong Đại Quá",
    "vietnameseName": "Đại Quá (Quá tải, cột nhà oằn mình)",
    "daxiang": {
      "original": "Trạch diệt mộc, Đại Quá; quân tử dĩ độc lập bất cụ, độn thế vô muộn.",
      "meaning": "Nước đầm dâng cao dìm ngập cả cây cối là quẻ Đại Quá; người quân tử noi theo đó mà đứng vững một mình không hề sợ hãi, dẫu ẩn dật lánh đời cũng chẳng chút buồn phiền phiền muộn.",
      "explanation": "Bốn hào dương cương cường ở giữa bị kẹp bởi hai hào âm nhu yếu ở hai đầu, như cây cột chính gánh quá nặng mà uốn cong sắp gãy. Thời kỳ khủng hoảng nghiêm trọng, người quân tử có bản lĩnh kiên cường phi thường, dám đứng mũi chịu sào, kiên định lý tưởng dù cả thế gian không hiểu mình."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Lục",
        "xiangOriginal": "Tượng viết: Tạ dụng bạch mao, nhu tại hạ dã.",
        "xiangMeaning": "Dùng cỏ tranh trắng mềm mại lót dưới vật quý, đức nhu thuận ở dưới cẩn trọng vô cùng.",
        "explanation": "Làm việc hệ trọng phải cẩn thận từ những chi tiết nhỏ nhất; khiêm tốn chu đáo thì tránh được mọi đổ vỡ."
      },
      {
        "line": 2,
        "lineName": "Cửu Nhị",
        "xiangOriginal": "Tượng viết: Lão phu đắc kỳ nữ thê, quá dĩ tương dữ dã.",
        "xiangMeaning": "Cây dương già đâm chồi nảy lộc, ông già lấy được vợ trẻ, sự vượt mức tương giao tương trợ nảy sinh sinh khí mới.",
        "explanation": "Tình huống đặc biệt đem lại sức sống bất ngờ; sự kết hợp bù trừ làm hồi sinh tình thế hiểm nghèo."
      },
      {
        "line": 3,
        "lineName": "Cửu Tam",
        "xiangOriginal": "Tượng viết: Đống nạo chi hung, bất khả dĩ hữu phụ dã.",
        "xiangMeaning": "Cột nhà oằn cong sụp đổ gặp hung hiểm, không thể tìm được chỗ nương tựa chống đỡ nào khác.",
        "explanation": "Cương cường quá mức lại tự phụ không chịu nghe ai can gián; gánh nặng quá sức dẫn đến gãy đổ tan tành."
      },
      {
        "line": 4,
        "lineName": "Cửu Tứ",
        "xiangOriginal": "Tượng viết: Đống long chi cát, bất nạo hồ hạ dã.",
        "xiangMeaning": "Cột nhà được dựng cao thẳng đứng tốt lành, không bị oằn cong chao đảo ở bên dưới.",
        "explanation": "Biết cân bằng sức mạnh, khéo léo kết nối với cấp dưới; gánh vác trọng trách lớn lao một cách vững vàng."
      },
      {
        "line": 5,
        "lineName": "Cửu Ngũ",
        "xiangOriginal": "Tượng viết: Khô dương sinh hoa, hà khả cửu dã. Lão phụ đắc kỳ sĩ phu, diệc khả xú dã.",
        "xiangMeaning": "Cây dương khô cằn trổ hoa sao mà lâu bền được. Bà lão già lấy được chàng trai trẻ, cũng là điều dị kỳ đáng ngượng ngùng.",
        "explanation": "Thịnh vượng giả tạo bên ngoài chỉ là lóe sáng nhất thời; hào quang muộn màng không thể cứu vãn xu thế lụi tàn."
      },
      {
        "line": 6,
        "lineName": "Thượng Lục",
        "xiangOriginal": "Tượng viết: Quá thiệp chi hung, bất khả cữu dã.",
        "xiangMeaning": "Cố lội qua sông sâu nước ngập quá đầu gặp hung, nhưng tinh thần dũng cảm hy sinh ấy không ai nỡ trách cứ.",
        "explanation": "Dám dấn thân hy sinh thân mình vì nghĩa lớn; dẫu thất bại trong gang tấc nhưng khí tiết hào hùng lưu danh muôn thuở."
      }
    ]
  },
  "29": {
    "number": 29,
    "name": "Thuần Khảm",
    "vietnameseName": "Khảm Vi Thủy (Nước chảy vực sâu, gian nan thử thách)",
    "daxiang": {
      "original": "Thủy tiệp chí, Tập Khảm; quân tử dĩ thường đức hạnh, tập giáo sự.",
      "meaning": "Nước chảy triền miên sóng này nối tiếp sóng khác tới vực sâu là quẻ Tập Khảm; người quân tử noi theo đó mà luôn giữ vững đức hạnh thường hằng không đổi, chuyên cần học tập rèn luyện và giáo hóa việc đời.",
      "explanation": "Hai quẻ Khảm chồng lên nhau, hiểm họa trùng trùng như vượt qua vực thẳm này lại đến hố sâu khác. Bản tính của nước luôn chảy về chỗ trũng, gặp vực sâu thì lấp đầy rồi mới chảy tiếp, không bao giờ bỏ cuộc. Đối diện gian nan, người quân tử giữ vững đạo tâm như dòng nước kiên định bền bỉ."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Lục",
        "xiangOriginal": "Tượng viết: Tập khảm nhập khảm, thất đạo hung dã.",
        "xiangMeaning": "Hiểm nạn chồng chất rơi sâu vào hố thẳm, đánh mất con đường thoát thân ắt gặp hung.",
        "explanation": "Mới bước vào đời đã lún sâu vào cạm bẫy tội lỗi do thói quen buông thả; nguy nan khôn lường."
      },
      {
        "line": 2,
        "lineName": "Cửu Nhị",
        "xiangOriginal": "Tượng viết: Cầu tiểu đắc, vị xuất trung dã.",
        "xiangMeaning": "Cầu mong việc nhỏ thì được, vì vẫn còn đang ở giữa nơi hiểm nạn chưa thoát ra được.",
        "explanation": "Đang ở giữa tâm bão gian nguy, chớ mơ mộng làm việc lớn; giải quyết từng bước nhỏ thực tế để tự bảo toàn."
      },
      {
        "line": 3,
        "lineName": "Lục Tam",
        "xiangOriginal": "Tượng viết: Lai chi khảm khảm, chung vô công dã.",
        "xiangMeaning": "Tiến hay lui đều vướng phải hố sâu hiểm trở, hành động mù quáng cuối cùng chẳng nên công trạng gì.",
        "explanation": "Tiến thoái lưỡng nan; lúc này manh động chỉ làm hỏng việc, giữ tâm tĩnh lặng chờ đợi chuyển biến."
      },
      {
        "line": 4,
        "lineName": "Lục Tứ",
        "xiangOriginal": "Tượng viết: Tôn tửu quĩ nhị, cương nhu tế dã.",
        "xiangMeaning": "Chỉ có một bầu rượu hai giỏ cơm đơn sơ dâng qua cửa sổ, tượng trưng cho sự giao tiếp chân thành giữa cương và nhu.",
        "explanation": "Lúc gian nan không cần lễ nghi hình thức xa hoa; lấy lòng chân thành mộc mạc kết nối với lãnh đạo sẽ được che chở."
      },
      {
        "line": 5,
        "lineName": "Cửu Ngũ",
        "xiangOriginal": "Tượng viết: Khảm bất doanh, trung vị đại dã.",
        "xiangMeaning": "Nước trong hố phẳng lặng chưa tràn bờ, giữ đạo trung nên tai nạn chưa phát tác quá lớn.",
        "explanation": "Giữ đức trung chính xử lý hiểm nguy êm thấm; bình tĩnh giải quyết từng phần không để tai họa lan rộng."
      },
      {
        "line": 6,
        "lineName": "Thượng Lục",
        "xiangOriginal": "Tượng viết: Thượng lục thất đạo, hung tam tuế dã.",
        "xiangMeaning": "Hào Thượng Lục đánh mất con đường chính đạo, bị trói bằng dây thừng gai nhốt trong ngục tù ba năm chịu hung.",
        "explanation": "Cố chấp làm điều xằng bậy sa vào lưới pháp luật; trả giá đắt trong chốn lao tù tối tăm để sám hối tội lỗi."
      }
    ]
  },
  "30": {
    "number": 30,
    "name": "Thuần Ly",
    "vietnameseName": "Ly Vi Hỏa (Lửa sáng bừng, nương tựa chính đạo)",
    "daxiang": {
      "original": "Minh lưỡng tác, Ly; đại nhân dĩ kế minh chiếu vu tứ phương.",
      "meaning": "Hai ánh lửa cùng bừng sáng rực rỡ nối tiếp nhau là quẻ Ly; bậc đại nhân noi theo đó mà nối tiếp ánh sáng trí tuệ soi rọi khắp bốn phương trời.",
      "explanation": "Lửa sáng bừng bừng đem lại hơi ấm và ánh quang, nhưng lửa không thể tự cháy trong hư không mà phải nương tựa vào củi. 'Ly' là bám víu, nương tựa. Con người muốn tỏa sáng tài năng phải nương tựa vào chính đạo, thuận theo lẽ trời, lấy đức hạnh làm củi đốt cho ngọn lửa trí tuệ trường tồn."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Cửu",
        "xiangOriginal": "Tượng viết: Lý thác chi kính, dĩ tị cữu dã.",
        "xiangMeaning": "Bước chân bước đi lộn xộn nhưng lòng luôn giữ sự cung kính thận trọng, nhờ đó mà tránh được lỗi lầm.",
        "explanation": "Mới khởi sự nhiều việc bỡ ngỡ đan xen; giữ thái độ khiêm cung cẩn trọng thì không phạm sai sót."
      },
      {
        "line": 2,
        "lineName": "Lục Nhị",
        "xiangOriginal": "Tượng viết: Hoàng ly nguyên cát, đắc trung đạo dã.",
        "xiangMeaning": "Ánh sáng vàng rực rỡ đại cát, nhờ đắc được đức trung đạo ôn hòa sáng suốt.",
        "explanation": "Nắm giữ sự thông tuệ hòa nhã ở ngôi vị trung chính; tỏa sáng vừa phải, được muôn người kính mến tôn vinh."
      },
      {
        "line": 3,
        "lineName": "Cửu Tam",
        "xiangOriginal": "Tượng viết: Nhật trắc chi ly, hà khả cửu dã.",
        "xiangMeaning": "Ánh lửa trong cảnh mặt trời xế bóng chiều tà, sự rực rỡ ấy sao có thể kéo dài mãi được.",
        "explanation": "Tuổi xế chiều hay thời vận sắp suy tàn; thản nhiên gõ vò ca hát đón nhận quy luật sinh lão bệnh tử, chớ than thở bi ai."
      },
      {
        "line": 4,
        "lineName": "Cửu Tứ",
        "xiangOriginal": "Tượng viết: Đột như kỳ lai như, vô sở dung dã.",
        "xiangMeaning": "Đột ngột ập đến bốc cháy bừng bừng rồi lụi tàn nhanh chóng, chẳng còn chỗ nào dung nạp được.",
        "explanation": "Tính tình nóng nảy bốc đồng, muốn đốt cháy giai đoạn; ngọn lửa bộc phát thiếu gốc rễ tự thiêu rụi chính mình."
      },
      {
        "line": 5,
        "lineName": "Lục Ngũ",
        "xiangOriginal": "Tượng viết: Lục ngũ chi cát, ly vương công dã.",
        "xiangMeaning": "Sự tốt lành của hào Lục Ngũ, nhờ biết nương tựa gắn bó với các bậc vương công tài đức.",
        "explanation": "Biết lo xa rơi lệ sám hối, biết chọn chỗ nương tựa vững chắc nơi bậc minh chủ thì giữ được phúc lành."
      },
      {
        "line": 6,
        "lineName": "Thượng Cửu",
        "xiangOriginal": "Tượng viết: Vương dụng xuất chinh, dĩ chính bang dã.",
        "xiangMeaning": "Vua dùng xuất quân chinh phạt dẹp loạn, để chấn chỉnh đem lại trật tự cho đất nước.",
        "explanation": "Dùng trí tuệ và quyền uy để dẹp tan kẻ đầu sỏ làm loạn, nhưng khoan dung tha thứ cho kẻ bị ép buộc đi theo."
      }
    ]
  },
  "31": {
    "number": 31,
    "name": "Trạch Sơn Hàm",
    "vietnameseName": "Hàm (Cảm ứng giao thoa, tình duyên gắn kết)",
    "daxiang": {
      "original": "Sơn thượng hữu trạch, Hàm; quân tử dĩ hư thụ nhân.",
      "meaning": "Trên đỉnh núi cao có đầm nước lắng đọng là quẻ Hàm; người quân tử noi theo đó mà giữ lòng hư tĩnh trống không để đón nhận lòng người.",
      "explanation": "Đầm nước trên đỉnh núi thấm nhuần vào lòng núi, núi vững chãi nâng đỡ lòng đầm, âm dương tương cảm tự nhiên như tình yêu đôi lứa. 'Hàm' là cảm ứng không điều kiện. Người quân tử muốn thu phục và cảm hóa lòng người phải dẹp bỏ cái tôi thành kiến, giữ lòng khiêm tốn trống rỗng để lắng nghe."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Lục",
        "xiangOriginal": "Tượng viết: Hàm kỳ cái, chí tại ngoại dã.",
        "xiangMeaning": "Rung động cảm ứng ở ngón chân cái, ý chí hướng ra bên ngoài.",
        "explanation": "Tình cảm mới chớm nở ở bước đầu còn kín đáo; chớ vội biểu lộ thô thiển, hãy để duyên lành tự nhiên phát triển."
      },
      {
        "line": 2,
        "lineName": "Lục Nhị",
        "xiangOriginal": "Tượng viết: Tuy hung cư cát, thuận bất hại dã.",
        "xiangMeaning": "Rung động nơi bắp chân tuy hành động vội vã gặp hung, nhưng ở yên giữ đạo chính thì tốt lành, thuận theo thì không bị tổn hại.",
        "explanation": "Chớ để cảm xúc nhất thời xúi giục hành động bồng bột; tĩnh tại chờ đối phương chủ động bày tỏ."
      },
      {
        "line": 3,
        "lineName": "Cửu Tam",
        "xiangOriginal": "Tượng viết: Hàm kỳ cổ, diệc bất xử dã. Chí tại tùy nhân, sở chấp hạ dã.",
        "xiangMeaning": "Rung động nơi bắp đùi cũng chẳng chịu ở yên. Ý chí cứ chạy theo người khác, chỗ bám víu thật thấp kém tầm thường.",
        "explanation": "Chạy theo dục vọng cảm xúc mù quáng đánh mất sự tự chủ; bị người khác dẫn dắt thao túng làm trò cười."
      },
      {
        "line": 4,
        "lineName": "Cửu Tứ",
        "xiangOriginal": "Tượng viết: Trinh cát hối vong, vị cảm hại dã. Tràng tràng vãng lai, vị quang đại dã.",
        "xiangMeaning": "Giữ đạo chính bền vững thì tốt lành hối hận tiêu tan, chưa bị tổn hại. Nhưng nếu lòng dạ bồn chồn nghĩ suy qua lại liên miên, thì đạo cảm ứng chưa được quang minh rộng lớn.",
        "explanation": "Tâm chân thành không toan tính vụ lợi thì kết nối bền chặt; nếu trong lòng đầy toan tính vị kỷ thì tình cảm khó lâu bền."
      },
      {
        "line": 5,
        "lineName": "Cửu Ngũ",
        "xiangOriginal": "Tượng viết: Hàm kỳ mai, chí mạt dã.",
        "xiangMeaning": "Cảm ứng nơi thịt lưng sống trâu, ý chí còn nông cạn ở phần ngọn.",
        "explanation": "Tình cảm còn khô cứng chưa rung động sâu sắc từ con tim; cần thêm sự chân thành ấm áp để chạm đến tâm can."
      },
      {
        "line": 6,
        "lineName": "Thượng Lục",
        "xiangOriginal": "Tượng viết: Hàm kỳ phụ giáp thiệt, đằng khẩu thuyết dã.",
        "xiangMeaning": "Cảm ứng chỉ dừng lại nơi má, hàm và đầu lưỡi, chỉ là lời nói ba hoa đãi bôi chót lưỡi đầu môi.",
        "explanation": "Nói lời hoa mỹ ngọt ngào nhưng bụng dạ rỗng tuếch không có thực tâm; chớ vội tin kẻ dẻo miệng khéo nói."
      }
    ]
  },
  "32": {
    "number": 32,
    "name": "Lôi Phong Hằng",
    "vietnameseName": "Hằng (Bền vững dài lâu, thủy chung như nhất)",
    "daxiang": {
      "original": "Lôi phong, Hằng; quân tử dĩ lập bất dịch phương.",
      "meaning": "Sấm gió luôn nương tựa đi đôi cùng nhau là quẻ Hằng; người quân tử noi theo đó mà đứng vững lập trường, không bao giờ thay đổi phương hướng lý tưởng đúng đắn.",
      "explanation": "Sấm động thì gió thổi, gió thổi thì sấm truyền, hai hiện tượng tương trợ trường cửu. 'Hằng' là bền bỉ, kiên định, thủy chung như nhất. Sự bền vững không phải là đứng yên bất động xơ cứng, mà là kiên trì theo đuổi mục tiêu chính đạo giữa vạn biến cuộc đời, đạo vợ chồng keo sơn gắn bó suốt đời."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Lục",
        "xiangOriginal": "Tượng viết: Tuấn hằng chi hung, thủy cầu thâm dã.",
        "xiangMeaning": "Mưu cầu sự bền lâu quá sâu xa một cách nóng vội ắt gặp hung, vì mới bắt đầu đã đòi hỏi quá mức.",
        "explanation": "Mới khởi đầu đã đòi hỏi cam kết trọn đời hay thành công bền vững; nóng vội đốt cháy giai đoạn chỉ làm hỏng việc."
      },
      {
        "line": 2,
        "lineName": "Cửu Nhị",
        "xiangOriginal": "Tượng viết: Cửu nhị hối vong, năng cửu trung dã.",
        "xiangMeaning": "Hào Cửu Nhị hối hận tiêu tan, nhờ có khả năng kiên trì giữ vững đạo trung dung lâu dài.",
        "explanation": "Biết giữ chừng mực vừa phải, không thái quá bất cập; kiên nhẫn bền bỉ đi trên con đường chính đạo."
      },
      {
        "line": 3,
        "lineName": "Cửu Tam",
        "xiangOriginal": "Tượng viết: Bất hằng kỳ đức, vô sở dung dã.",
        "xiangMeaning": "Không giữ vững đức hạnh bền bỉ của mình, thì chẳng có nơi nào có thể dung chứa được.",
        "explanation": "Tính tình thất thường nay đổi mai dời, không có lập trường kiên định ắt chuốc lấy sự khinh miệt và hổ thẹn."
      },
      {
        "line": 4,
        "lineName": "Cửu Tứ",
        "xiangOriginal": "Tượng viết: Cửu phi kỳ vị, an đắc cầm dã.",
        "xiangMeaning": "Lâu ngày ở vào chỗ không thích hợp với mình, làm sao mà săn được muông thú chim muông.",
        "explanation": "Bền bỉ nhầm chỗ sai phương pháp thì chỉ tốn công vô ích; cần sáng suốt xem lại vị trí và định hướng của mình."
      },
      {
        "line": 5,
        "lineName": "Lục Ngũ",
        "xiangOriginal": "Tượng viết: Phụ nhân trinh cát, tòng nhất nhi chung dã. Phu tử chế nghĩa, tòng phụ hung dã.",
        "xiangMeaning": "Đàn bà giữ nết bền lòng theo một chồng trọn đời thì tốt. Bậc trượng phu phải tùy cơ ứng biến theo đạo nghĩa, nếu chỉ biết nhu thuận theo phụ nữ thì gặp hung.",
        "explanation": "Người lãnh đạo cần có tầm nhìn quyết đoán, không thể nhu nhược rập khuôn máy móc thiếu chính kiến."
      },
      {
        "line": 6,
        "lineName": "Thượng Lục",
        "xiangOriginal": "Tượng viết: Chấn hằng tại thượng, đại vô công dã.",
        "xiangMeaning": "Dao động bồn chồn không yên ở ngôi trên cùng, hoàn toàn chẳng lập nên công trạng gì.",
        "explanation": "Tâm trạng nôn nóng xáo động đứng ngồi không yên; thiếu tĩnh tâm thì việc lớn đều tan thành mây khói."
      }
    ]
  },
  "33": {
    "number": 33,
    "name": "Thiên Sơn Độn",
    "vietnameseName": "Độn (Thoái lui bảo toàn, tránh xa thị phi)",
    "daxiang": {
      "original": "Thiên hạ hữu sơn, Độn; quân tử dĩ viễn tiểu nhân, bất ác nhi nghiêm.",
      "meaning": "Dưới trời có núi cao sừng sững nhưng trời vẫn cao vút lùi xa là quẻ Độn; người quân tử noi theo đó mà tránh xa kẻ tiểu nhân, không cần thù ghét gay gắt mà giữ thái độ trang nghiêm uy cẩn.",
      "explanation": "Hai hào âm ở dưới bắt đầu lớn mạnh xua đuổi các hào dương lên trên. 'Độn' là thoái lui, lánh xa thời loạn. Người quân tử biết lúc nào nên rút lui để bảo toàn nguyên khí, không đối đầu trực diện vô ích với tiểu nhân, giữ khoảng cách đúng mực, trang nghiêm tự bảo vệ danh tiết."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Lục",
        "xiangOriginal": "Tượng viết: Độn vĩ chi lệ, vật dụng hữu du vãng, hà tai dã.",
        "xiangMeaning": "Rút lui chậm trễ ở phần đuôi thì nguy hiểm, đừng nên hành động dấn bước đi đâu thì làm sao gặp tai vạ được.",
        "explanation": "Thoái lui muộn màng rơi vào thế nguy hiểm; lúc này chỉ nên nằm im ẩn náu, tránh manh động lộ diện."
      },
      {
        "line": 2,
        "lineName": "Lục Nhị",
        "xiangOriginal": "Tượng viết: Chấp chi dụng hoàng ngưu, cố chí dã.",
        "xiangMeaning": "Dùng da bò vàng trói chặt lấy, để giữ vững ý chí kiên định không gì lay chuyển nổi.",
        "explanation": "Ý chí rút lui hoặc gắn bó với lý tưởng bền chặt như chão da bò; trung thành với bổn phận không đổi lòng."
      },
      {
        "line": 3,
        "lineName": "Cửu Tam",
        "xiangOriginal": "Tượng viết: Hệ độn chi lệ, hữu tật bế dã. Súc thần thiếp cát, bất khả đại sự dã.",
        "xiangMeaning": "Rút lui mà còn vương vấn dùng dằng mắc mớ thì nguy khốn, như mắc bệnh mệt mỏi rã rời. Nuôi kẻ tôi tớ phụ nữ thì tốt, không thể làm nên việc lớn.",
        "explanation": "Bị tình cảm riêng tư hay lợi lộc vụn vặt níu chân không nỡ dứt áo ra đi; không thể gánh vác đại sự cứu đời."
      },
      {
        "line": 4,
        "lineName": "Cửu Tứ",
        "xiangOriginal": "Tượng viết: Quân tử hảo độn, tiểu nhân phủ dã.",
        "xiangMeaning": "Người quân tử biết thoái lui một cách đẹp đẽ dứt khoát, kẻ tiểu nhân thì chẳng thể làm được như thế.",
        "explanation": "Quân tử xem nhẹ danh lợi dứt khoát buông tay lui về dưỡng thân; tiểu nhân tham lam bám víu ghế quyền lực."
      },
      {
        "line": 5,
        "lineName": "Cửu Ngũ",
        "xiangOriginal": "Tượng viết: Gia độn trinh cát, dĩ chính chí dã.",
        "xiangMeaning": "Thoái lui một cách tốt đẹp giữ đạo chính thì tốt lành, nhờ giữ tâm chí quang minh chính đại.",
        "explanation": "Rút lui đúng thời điểm trong sự vinh quang và tôn kính của muôn người; sự nghiệp khép lại trọn vẹn bình an."
      },
      {
        "line": 6,
        "lineName": "Thượng Cửu",
        "xiangOriginal": "Tượng viết: Phì độn vô bất lợi, vô sở nghi dã.",
        "xiangMeaning": "Thoái lui một cách thênh thang ung dung tự tại không gì là không lợi, chẳng có điều gì phải ngờ vực do dự nữa.",
        "explanation": "Hoàn toàn giải thoát khỏi mọi ràng buộc trần tục, ngao du sơn thủy tự tại thảnh thơi; cảnh giới an lạc tuyệt đối."
      }
    ]
  },
  "34": {
    "number": 34,
    "name": "Lôi Thiên Đại Tráng",
    "vietnameseName": "Đại Tráng (Lớn mạnh khí thế, dê húc hàng rào)",
    "daxiang": {
      "original": "Lôi tại thiên thượng, Đại Tráng; quân tử dĩ phi lễ phất lý.",
      "meaning": "Sấm sét vang rền trên bầu trời cao là quẻ Đại Tráng; người quân tử noi theo đó mà điều gì không hợp với lễ nghi đạo đức thì quyết không dấn bước thực thi.",
      "explanation": "Bốn hào dương lớn mạnh từ dưới trỗi dậy đẩy lùi hai hào âm lên ngọn, khí thế cương cường dũng mãnh tột bực. Sức mạnh to lớn rất dễ biến thành bạo lực mù quáng nếu thiếu sự kiềm chế. Người quân tử lấy Lễ tiết chế sức mạnh, không cậy thế hiếp người, hành sự chuẩn mực."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Cửu",
        "xiangOriginal": "Tượng viết: Tráng vu chỉ, kỳ phu cùng dã.",
        "xiangMeaning": "Cậy sức mạnh ở ngón chân mới bước đi, sự tin cậy ắt đi vào đường cùng bế tắc.",
        "explanation": "Mới khởi đầu mà đã háo thắng phô trương sức mạnh; cậy thế xốc nổi chỉ rước lấy thất bại ê chề."
      },
      {
        "line": 2,
        "lineName": "Cửu Nhị",
        "xiangOriginal": "Tượng viết: Cửu nhị trinh cát, dĩ trung dã.",
        "xiangMeaning": "Hào Cửu Nhị giữ lòng chính đính tốt lành, nhờ nắm giữ được đạo trung dung không thái quá.",
        "explanation": "Sức mạnh dồi dào nhưng biết kiềm chế, hành động đúng mực ôn hòa; phát huy năng lực hiệu quả bền vững."
      },
      {
        "line": 3,
        "lineName": "Cửu Tam",
        "xiangOriginal": "Tượng viết: Tiểu nhân dụng tráng, quân tử dụng võng dã.",
        "xiangMeaning": "Kẻ tiểu nhân thích dùng sức mạnh cơ bắp thô bạo, người quân tử dùng mạng lưới đạo đức trí tuệ để xử thế.",
        "explanation": "Dê đực húc bừa vào hàng rào bị mắc kẹt sừng tiến thoái lưỡng nan; chớ ỷ thế càn rỡ tự đẩy mình vào bẫy rập."
      },
      {
        "line": 4,
        "lineName": "Cửu Tứ",
        "xiangOriginal": "Tượng viết: Phiên quyết bất doanh, chí hành dã.",
        "xiangMeaning": "Hàng rào rách bung không còn vướng mắc sừng, ý chí tiến bước được thực thi trọn vẹn.",
        "explanation": "Kiên trì giữ chính đạo phá tan mọi rào cản cản trở; đường đi thông suốt, tha hồ vẫy vùng lập công."
      },
      {
        "line": 5,
        "lineName": "Lục Ngũ",
        "xiangOriginal": "Tượng viết: Táng dương vu dịch, vị bất đáng dã.",
        "xiangMeaning": "Mất dê nơi bờ ruộng một cách dễ dàng, vì ở vào ngôi vị không thích đáng.",
        "explanation": "Biết từ bỏ thói hung hăng hiếu thắng, chuyển sang nhu hòa hòa giải; tránh được xung đột đổ máu."
      },
      {
        "line": 6,
        "lineName": "Thượng Lục",
        "xiangOriginal": "Tượng viết: Bất năng thoái, bất năng toại, bất tường dã. Gian tắc cát, cữu bất trường dã.",
        "xiangMeaning": "Không thể lui cũng chẳng thể tiến tới, sự tình chẳng lành. Nhưng biết gian nan mà tỉnh ngộ cẩn trọng thì tốt, lỗi lầm không kéo dài.",
        "explanation": "Húc vào đường cùng bị mắc kẹt; bình tâm hạ mình dừng lại sám hối thì tai họa tự khắc tiêu tan."
      }
    ]
  },
  "35": {
    "number": 35,
    "name": "Hỏa Địa Tấn",
    "vietnameseName": "Tấn (Tiến lên rực rỡ, mặt trời mọc trên mặt đất)",
    "daxiang": {
      "original": "Minh xuất địa thượng, Tấn; quân tử dĩ tự chiêu minh đức.",
      "meaning": "Mặt trời rực rỡ nhô lên khỏi mặt đất soi sáng muôn phương là quẻ Tấn; người quân tử noi theo đó mà tự làm rạng rỡ đức sáng vốn có của bản thân mình.",
      "explanation": "Lửa sáng (Ly) vươn lên trên mặt đất (Khôn), tượng trưng cho thời kỳ phát triển thịnh vượng, công danh sự nghiệp tiến bước hanh thông. Bậc quân tử gặp thời thuận lợi không buông thả hưởng lạc, mà càng phải nỗ lực tu thân, làm cho phẩm chất đạo đức và trí tuệ ngày càng tỏa sáng cứu đời."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Lục",
        "xiangOriginal": "Tượng viết: Tấn như tồi như, độc hành chính dã. Dụ vô cữu, vị thụ mệnh dã.",
        "xiangMeaning": "Muốn tiến lên mà bị cản trở ngăn lại, một mình giữ vững đường lối chính trực. Khoan dung rộng lượng thì không lỗi, vì chưa được trao trao mệnh lệnh.",
        "explanation": "Bước đầu muốn tiến lên nhưng gặp trở ngại dèm pha; hãy bình tĩnh giữ lòng ngay thẳng, chớ oán trách ai."
      },
      {
        "line": 2,
        "lineName": "Lục Nhị",
        "xiangOriginal": "Tượng viết: Thụ tư giới phúc, dĩ trung chính dã.",
        "xiangMeaning": "Đón nhận phúc lớn lành này từ bà mẹ tổ mẫu, nhờ giữ trọn đạo đức trung chính bền bỉ.",
        "explanation": "Gặp lúc khó khăn buồn bã nhưng giữ vẹn khí tiết; sau được bậc trưởng bối quý nhân ban thưởng che chở."
      },
      {
        "line": 3,
        "lineName": "Lục Tam",
        "xiangOriginal": "Tượng viết: Chúng doãn chi, chí thượng hành dã.",
        "xiangMeaning": "Được mọi người đồng lòng tin tưởng ủng hộ, ý chí tiến bước lên trên được toại nguyện.",
        "explanation": "Được tập thể tín nhiệm suy tôn; cùng nhau đoàn kết tiến lên gặt hái thành công mỹ mãn."
      },
      {
        "line": 4,
        "lineName": "Cửu Tứ",
        "xiangOriginal": "Tượng viết: Thước thử trinh lệ, vị bất đáng dã.",
        "xiangMeaning": "Tiến lên như chuột chũi tham lam sợ sệt, giữ lòng như thế dẫu có chức vị cũng nguy nan, vì ở ngôi vị không thích đáng.",
        "explanation": "Dùng thủ đoạn gian dối tham nhũng để leo cao; sống trong lo sợ phập phồng, sớm muộn cũng bị vạch trần trừng trị."
      },
      {
        "line": 5,
        "lineName": "Lục Ngũ",
        "xiangOriginal": "Tượng viết: Thất đắc vật tuất, vãng hữu khánh dã.",
        "xiangMeaning": "Được mất hơn thua chớ bận lòng lo nghĩ, cứ dấn bước tiến tới ắt có việc phúc khánh chúc mừng.",
        "explanation": "Tấm lòng bao dung khoáng đạt không chấp nhặt được mất nhỏ nhen; tập trung đại cục ắt đạt vinh hiển rực rỡ."
      },
      {
        "line": 6,
        "lineName": "Thượng Cửu",
        "xiangOriginal": "Tượng viết: Duy dụng phạt ấp, đạo vị quang dã.",
        "xiangMeaning": "Chỉ nên dùng vũ lực để chỉnh đốn ấp thành của mình, đạo lý tiến lên như thế chưa thực sự quang minh.",
        "explanation": "Đã ở đỉnh cao danh vọng chớ hiếu chiến mở rộng biên cương; chỉ nên tự kiểm điểm chỉnh đốn nội bộ bản thân."
      }
    ]
  },
  "36": {
    "number": 36,
    "name": "Địa Hỏa Minh Di",
    "vietnameseName": "Minh Di (Ánh sáng bị che khuất, giấu sáng trong đêm)",
    "daxiang": {
      "original": "Minh nhập địa trung, Minh Di; quân tử dĩ lị chúng, dụng hối nhi minh.",
      "meaning": "Mặt trời lặn chìm sâu vào lòng đất tăm tối là quẻ Minh Di; người quân tử noi theo đó mà khi coi sóc dẫn dắt dân chúng, biết dùng vẻ ngoài mờ tối vụng về để che giấu đức sáng bên trong.",
      "explanation": "Ánh sáng bị đất vùi dập, thời kỳ bạo chúa hôn quân lộng hành, kẻ chính nhân bị bức hại tù đày. Đạo xử thế thời Minh Di là 'giả ngô giả ngọng', giấu bớt tài năng trí tuệ bên trong, ngoài mặt tỏ ra khờ khạo để tránh mũi tên hòn đạn, bảo toàn sinh mạng đợi ngày khôi phục chính nghĩa."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Cửu",
        "xiangOriginal": "Tượng viết: Quân tử vu hành, nghĩa bất thực dã.",
        "xiangMeaning": "Người quân tử dấn bước ra đi lánh nạn, theo đạo nghĩa thà nhịn đói ba ngày chứ không nhận lộc bất nghĩa.",
        "explanation": "Sớm nhận ra thời loạn lạc mau chóng lánh xa; thà chịu cảnh bần hàn đói khát chứ quyết không thỏa hiệp với tà quyền."
      },
      {
        "line": 2,
        "lineName": "Lục Nhị",
        "xiangOriginal": "Tượng viết: Lục nhị chi cát, thuận dĩ tắc dã.",
        "xiangMeaning": "Sự tốt lành của hào Lục Nhị, nhờ giữ lòng nhu thuận đúng theo khuôn phép đạo lý.",
        "explanation": "Bị tổn thương ở đùi nhưng dùng ngựa khỏe cứu thoát; giữ trọn lòng trung trinh vượt qua cơn hoạn nạn."
      },
      {
        "line": 3,
        "lineName": "Cửu Tam",
        "xiangOriginal": "Tượng viết: Nam thú chi chí, đại đắc dã.",
        "xiangMeaning": "Ý chí đi săn phương nam bắt được kẻ đầu sỏ gian ác, thu được thắng lợi to lớn.",
        "explanation": "Chớp thời cơ trừ khử tên bạo chúa làm loạn giải cứu muôn dân; nhưng phải thận trọng từng bước chớ vội vàng hấp tấp."
      },
      {
        "line": 4,
        "lineName": "Lục Tứ",
        "xiangOriginal": "Tượng viết: Nhập vu tả phúc, hoạch tâm ý dã.",
        "xiangMeaning": "Đi sâu vào bụng bên trái hang ổ kẻ gian, nắm thấu tâm can mưu mô của chúng rồi nhanh chóng thoát ra ngoài.",
        "explanation": "Hiểu rõ bản chất thối nát của tập đoàn gian tà; dứt khoát rời bỏ bóng tối tìm về vùng đất tự do."
      },
      {
        "line": 5,
        "lineName": "Lục Ngũ",
        "xiangOriginal": "Tượng viết: Cơ Tử chi trinh, minh bất khả tức dã.",
        "xiangMeaning": "Đạo chính bền bỉ như Cơ Tử giả điên để bảo toàn tính mạng, ánh sáng trí tuệ bên trong không bao giờ lụi tắt.",
        "explanation": "Chịu nhục giả ngây giả dại trước mặt bạo chúa; trong lòng vẫn kiên định ngọn lửa chính nghĩa chờ ngày đổi đời."
      },
      {
        "line": 6,
        "lineName": "Thượng Lục",
        "xiangOriginal": "Tượng viết: Sơ đăng vu thiên, chiếu tứ quốc dã. Hậu nhập vu địa, thất tắc dã.",
        "xiangMeaning": "Ban đầu lên tận trời cao soi sáng bốn cõi nước; sau đó chìm sâu xuống đất đen vì đánh mất chuẩn mực đạo lý.",
        "explanation": "Kẻ bạo ngược kiêu căng lộng hành tột bực cuối cùng phải nhận lấy kết cục sụp đổ chìm vào bóng tối diệt vong."
      }
    ]
  },
  "37": {
    "number": 37,
    "name": "Phong Hỏa Gia Nhân",
    "vietnameseName": "Gia Nhân (Gia đình hòa thuận, trong ấm ngoài êm)",
    "daxiang": {
      "original": "Phong tự hỏa xuất, Gia Nhân; quân tử dĩ ngôn hữu vật, nhi hành hữu hằng.",
      "meaning": "Gió từ trong ngọn lửa bốc ra lan tỏa sức nóng là quẻ Gia Nhân; người quân tử noi theo đó mà lời nói phải có nội dung chân thật, hành vi phải có nền nếp bền bỉ thường hằng.",
      "explanation": "Lửa cháy bên trong sinh ra gió thổi ra ngoài. Muốn tề gia trị quốc, cội nguồn phải bắt đầu từ đạo đức nếp nhà. Người đứng đầu gia đình nói năng phải chân thực, làm gương sáng đạo đức chuẩn mực; trong nhà có trên có dưới, vợ chồng hòa thuận thì muôn việc ngoài xã hội mới hanh thông."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Cửu",
        "xiangOriginal": "Tượng viết: Nhàn hữu gia, chí vị biến dã.",
        "xiangMeaning": "Ngăn ngừa gìn giữ gia phong ngay từ ban đầu, khi tâm tính mọi người chưa bị biến đổi tha hóa.",
        "explanation": "Uốn nắn nếp nhà, giáo dục con cái từ thuở nhỏ; thiết lập gia quy kỷ luật từ sớm để ngừa mầm hư hỏng."
      },
      {
        "line": 2,
        "lineName": "Lục Nhị",
        "xiangOriginal": "Tượng viết: Lục nhị chi cát, thuận dĩ tốn dã.",
        "xiangMeaning": "Sự tốt lành của hào Lục Nhị, nhờ nết nhu thuận khiêm tốn lo việc tề gia nội trợ.",
        "explanation": "Người nội tướng đảm đang chăm lo bếp núc, thuận thảo phụng dưỡng cha mẹ; nếp nhà ấm êm yên ấm."
      },
      {
        "line": 3,
        "lineName": "Cửu Tam",
        "xiangOriginal": "Tượng viết: Gia nhân hạc hạc, vị thất dã. Phụ tử hí hí, chung lận dã.",
        "xiangMeaning": "Gia quy quá nghiêm khắc có tiếng rầy la tuy hơi căng nhưng chưa mất đạo. Nếu để đàn bà con trẻ cười đùa cợt nhả mất nết thì cuối cùng chuốc lấy xấu hổ.",
        "explanation": "Nghiêm khắc trong quản lý gia đình vẫn tốt hơn buông lỏng nuông chiều sinh hư hỏng bê tha."
      },
      {
        "line": 4,
        "lineName": "Lục Tứ",
        "xiangOriginal": "Tượng viết: Phú gia đại cát, thuận tại vị dã.",
        "xiangMeaning": "Làm cho gia đình giàu có phồn vinh đạt điều đại cát, nhờ thuận theo ngôi vị đảm đang của mình.",
        "explanation": "Khéo léo vun vén kinh tế tài chính gia đình ấm no sung túc; hậu phương vững chắc nâng đỡ tiền tuyến."
      },
      {
        "line": 5,
        "lineName": "Cửu Ngũ",
        "xiangOriginal": "Tượng viết: Vương giả hữu gia, giao tương ái dã.",
        "xiangMeaning": "Bậc minh vương thân cận với gia đình gương mẫu, người trong nhà yêu thương gắn bó lẫn nhau.",
        "explanation": "Người chủ gia đình lấy tình yêu thương và đức độ cảm hóa mọi người; cả nhà kính yêu đồng lòng noi theo."
      },
      {
        "line": 6,
        "lineName": "Thượng Cửu",
        "xiangOriginal": "Tượng viết: Oai như chi cát, phản thân chi vị dã.",
        "xiangMeaning": "Có vẻ uy nghiêm tôn kính thì tốt lành, đó là lời khuyên hãy luôn biết tự soi xét kiểm điểm bản thân mình.",
        "explanation": "Muốn người khác kính sợ nể phục thì bản thân phải nghiêm cẩn làm gương; tu thân là gốc rễ của tề gia."
      }
    ]
  },
  "38": {
    "number": 38,
    "name": "Hỏa Trạch Khuê",
    "vietnameseName": "Khuê (Bất đồng ly tán, tìm điểm chung trong dị biệt)",
    "daxiang": {
      "original": "Thượng hỏa hạ trạch, Khuê; quân tử dĩ đồng nhi dị.",
      "meaning": "Lửa bốc lên cao, nước đầm chảy xuống thấp, hai chiều trái ngược nhau là quẻ Khuê; người quân tử noi theo đó mà hòa đồng nhưng vẫn giữ nét dị biệt đặc thù độc lập.",
      "explanation": "Lửa và nước chống đối nhau, tượng trưng cho sự bất đồng quan điểm, ly tán mâu thuẫn. Người quân tử ở thời Khuê hiểu rằng vạn vật muôn hình vạn trạng: trong sự khác biệt tìm kiếm tiếng nói chung (cầu đồng tồn dị), tôn trọng cá tính riêng mà không đánh mất nguyên tắc đạo đức."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Cửu",
        "xiangOriginal": "Tượng viết: Kiến ác nhân, dĩ tị cữu dã.",
        "xiangMeaning": "Ngựa chạy mất không thèm đuổi tự về. Thấy kẻ xấu mà tiếp kiến để giải tỏa nghi kỵ, nhờ đó tránh được lỗi lầm.",
        "explanation": "Bị hiểu lầm chớ vội thanh minh đôi co; chủ động gặp gỡ kẻ nghi kỵ mình để hóa giải mâu thuẫn."
      },
      {
        "line": 2,
        "lineName": "Cửu Nhị",
        "xiangOriginal": "Tượng viết: Ngộ chủ vu hạng, vị thất đạo dã.",
        "xiangMeaning": "Tình cờ gặp gỡ minh chủ nơi con ngõ hẻm nhỏ, chưa hề đánh mất con đường chính đạo.",
        "explanation": "Hoàn cảnh trắc trở không thể gặp nhau nơi công đường thì linh hoạt tiếp xúc nơi ngõ hẻm; cốt ở lòng thành hợp tác."
      },
      {
        "line": 3,
        "lineName": "Lục Tam",
        "xiangOriginal": "Tượng viết: Kiến dư duệ, vị bất đáng dã. Vô sơ hữu chung, ngộ cương dã.",
        "xiangMeaning": "Thấy xe bị kéo giật lùi trâu bị hãm, vì ở vào ngôi vị không thích đáng. Lúc đầu không thuận nhưng kết cục tốt, nhờ gặp được hào cương cường che chở.",
        "explanation": "Bị hoàn cảnh chèn ép ngỡ như tuyệt lộ; kiên trì chịu đựng cuối cùng cũng gặp được người tốt giải cứu."
      },
      {
        "line": 4,
        "lineName": "Cửu Tứ",
        "xiangOriginal": "Tượng viết: Giao phu vô cữu, chí hành dã.",
        "xiangMeaning": "Giữa cảnh cô độc bất hòa mà tìm được bạn hiền chí thành cùng nhau vượt khó thì không lỗi, ý chí được thực thi.",
        "explanation": "Trong lúc bế tắc tìm được tri kỷ đồng điệu; đôi bên tin cậy lẫn nhau cùng nhau xoay chuyển tình thế."
      },
      {
        "line": 5,
        "lineName": "Lục Ngũ",
        "xiangOriginal": "Tượng viết: Quyết tông phệ phu, vãng hà cữu dã.",
        "xiangMeaning": "Người cùng dòng họ cắn miếng thịt rào cản để đến với nhau, tiến tới thì nào có lỗi gì.",
        "explanation": "Gạt bỏ nghi ngờ cố hữu trong thân tộc; chân thành mở rộng vòng tay đón nhận sự giúp sức của người thân."
      },
      {
        "line": 6,
        "lineName": "Thượng Cửu",
        "xiangOriginal": "Tượng viết: Hối vong chi cát, quần nghi vong dã.",
        "xiangMeaning": "Nghi ngờ con lợn lấm bùn biến thành cỗ xe rước dâu tốt lành, mọi nỗi nghi kỵ đều tan biến sạch sẽ.",
        "explanation": "Nhìn lầm người tốt thành kẻ thù do tâm ma nghi kỵ; khi mây mù tan biến, sự thật sáng tỏ, hiểu lầm được hóa giải hoàn toàn."
      }
    ]
  },
  "39": {
    "number": 39,
    "name": "Thủy Sơn Kiển",
    "vietnameseName": "Kiển (Trở ngại khó khăn, quay về tu dưỡng bản thân)",
    "daxiang": {
      "original": "Sơn thượng hữu thủy, Kiển; quân tử dĩ phản thân tu đức.",
      "meaning": "Trên núi cao dốc đứng có vực nước hiểm sâu là quẻ Kiển; người quân tử noi theo đó mà quay về soi xét lại bản thân, tu dưỡng đạo đức để đợi thời.",
      "explanation": "Trước mặt là vực nước sâu hiểm trở (Khảm), sau lưng là vách núi sừng sững chắn lối (Cấn), bước đi khập khiễng gian nan. Thấy hiểm nghèo mà biết dừng lại là bậc đại trí. Không oán trời trách người, người quân tử quay về tự tu thân rèn tài, bồi đắp nội lực vượt qua nghịch cảnh."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Lục",
        "xiangOriginal": "Tượng viết: Vãng kiển lai dự, nghi đãi dã.",
        "xiangMeaning": "Tiến tới gặp khó khăn hiểm trở, quay lui về được ngợi khen, nên biết chờ đợi thời cơ thích hợp.",
        "explanation": "Thấy phía trước nguy hiểm chớ cố đấm ăn xôi; biết lùi lại quan sát là quyết định sáng suốt được người khen ngợi."
      },
      {
        "line": 2,
        "lineName": "Lục Nhị",
        "xiangOriginal": "Tượng viết: Vương thần kiển kiển, chung vô vưu dã.",
        "xiangMeaning": "Bề tôi của vua xông pha trong muôn trùng gian nan, cuối cùng không có điều gì phải ân hận trách cứ.",
        "explanation": "Gánh vác gian khổ không phải vì lợi ích cá nhân mà vì trách nhiệm cứu giúp xã tắc; tấm lòng tận tụy sáng ngời."
      },
      {
        "line": 3,
        "lineName": "Cửu Tam",
        "xiangOriginal": "Tượng viết: Vãng kiển lai phản, nội hỉ chi dã.",
        "xiangMeaning": "Tiến lên thì vướng hiểm nạn, quay trở về nhà thì người thân trong nhà đều mừng vui hân hoan.",
        "explanation": "Thấy sức không kham nổi việc bên ngoài thì lui về bảo vệ che chở cho gia đình và nội bộ thân thuộc."
      },
      {
        "line": 4,
        "lineName": "Lục Tứ",
        "xiangOriginal": "Tượng viết: Vãng kiển lai liên, đương vị thực dã.",
        "xiangMeaning": "Tiến lên thì gặp khó khăn, lui về thì liên kết được cùng đồng bạn bè trợ giúp, nhờ ở ngôi vị thiết thực.",
        "explanation": "Một mình không thể vượt qua khó khăn lớn; phải chủ động tìm kiếm sự liên minh đồng lòng của bè bạn hiền tài."
      },
      {
        "line": 5,
        "lineName": "Cửu Ngũ",
        "xiangOriginal": "Tượng viết: Đại kiển bằng lai, dĩ trung tiết dã.",
        "xiangMeaning": "Ở giữa cơn đại nạn hiểm nghèo mà có bạn bè kéo đến cứu giúp, nhờ giữ được đạo trung dung tiết thấu.",
        "explanation": "Bậc lãnh đạo có uy tín đức độ gặp nạn được nhân sĩ bốn phương tự nguyện kéo đến phò trợ giải cứu."
      },
      {
        "line": 6,
        "lineName": "Thượng Lục",
        "xiangOriginal": "Tượng viết: Vãng kiển lai thạc, chí tại nội dã. Lợi kiến đại nhân, dĩ tòng quý dã.",
        "xiangMeaning": "Tiến lên gặp gian nan hiểm trở, quay về nương tựa bậc đại đức thu được thành tựu to lớn, ý chí hướng về việc giúp đỡ bên trong. Gặp bậc đại nhân thì có lợi, để noi theo người tôn quý.",
        "explanation": "Bậc cao nhân đắc đạo hạ mình đến cứu giúp thời cuộc; hiệp sức cùng lãnh đạo đưa đất nước thoát khỏi cơn nguy khốn."
      }
    ]
  },
  "40": {
    "number": 40,
    "name": "Lôi Thủy Giải",
    "vietnameseName": "Giải (Hóa giải ách tắc, mưa rào giải tỏa cơn hạn)",
    "daxiang": {
      "original": "Lôi vũ tác, Giải; quân tử dĩ xá quá hựu tội.",
      "meaning": "Sấm sét và mưa rào cùng nổi lên giải tỏa cơn oi bức là quẻ Giải; người quân tử noi theo đó mà tha thứ lỗi lầm vô ý, giảm nhẹ tội lỗi cho người phạm pháp.",
      "explanation": "Mưa sấm giao hòa làm tan biến bầu không khí ngột ngạt, vạn vật hồi sinh tươi tốt. 'Giải' là tháo gỡ khó khăn, hòa giải mâu thuẫn. Khi khủng hoảng vừa qua đi, người quân tử áp dụng chính sách khoan hồng đại xá, buông bỏ oán hờn cũ, tạo điều kiện cho mọi người làm lại cuộc đời."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Lục",
        "xiangOriginal": "Tượng viết: Cương nhu chi tế, nghĩa vô cữu dã.",
        "xiangMeaning": "Giao tiếp hòa hợp giữa cương và nhu khi nguy nan vừa giải tỏa, về mặt đạo nghĩa không có lỗi gì.",
        "explanation": "Khó khăn vừa qua đi, hãy yên tĩnh nghỉ ngơi phục hồi sức lực, tránh khuấy động thêm phiền toái."
      },
      {
        "line": 2,
        "lineName": "Cửu Nhị",
        "xiangOriginal": "Tượng viết: Cửu nhị trinh cát, đắc trung đạo dã.",
        "xiangMeaning": "Bắn được ba con cáo săn được mũi tên vàng giữ đạo chính tốt lành, nhờ đắc được đức trung đạo sáng suốt.",
        "explanation": "Trừ khử kẻ tiểu nhân giảo hoạt nịnh bợ bằng sự cương trực công minh; đem lại sự trong sạch cho tổ chức."
      },
      {
        "line": 3,
        "lineName": "Lục Tam",
        "xiangOriginal": "Tượng viết: Phụ thả thừa, diệc khả xú dã. Tự ngã trí nhung, hựu thùy cữu dã.",
        "xiangMeaning": "Lưng vác đồ nặng mà lại ngồi chễm chệ trên xe lớn, thật đáng xấu hổ cười chê. Tự mình rước giặc cướp đến cướp phá, còn trách cứ ai được nữa.",
        "explanation": "Kẻ bất tài đức mọn mà ngồi ghế quyền cao sang trọng, phô trương của cải ắt chuốc lấy tai vạ trộm cướp vào thân."
      },
      {
        "line": 4,
        "lineName": "Cửu Tứ",
        "xiangOriginal": "Tượng viết: Giải nhi cái, vị bất đáng dã.",
        "xiangMeaning": "Dứt bỏ ngón chân cái ràng buộc tầm thường, vì ở vào ngôi vị chưa thật thích đáng.",
        "explanation": "Dứt khoát cắt đứt quan hệ với đám bạn bè xấu trục lợi, thì người bạn chân chính đàng hoàng mới tìm đến."
      },
      {
        "line": 5,
        "lineName": "Lục Ngũ",
        "xiangOriginal": "Tượng viết: Quân tử hữu giải, tiểu nhân thoái dã.",
        "xiangMeaning": "Người quân tử tự giải thoát khỏi trói buộc sai trái, kẻ tiểu nhân thấy thế tự khắc phải lui bước.",
        "explanation": "Dứt khoát đoạn tuyệt với những thói xấu và kẻ nịnh thần; tổ chức lập tức được thanh lọc lành mạnh."
      },
      {
        "line": 6,
        "lineName": "Thượng Lục",
        "xiangOriginal": "Tượng viết: Công dụng xạ chuẩn, dĩ giải bội dã.",
        "xiangMeaning": "Bậc vương công giương cung bắn rơi chim cắt bạo ngược trên bờ thành cao, để giải tỏa kẻ phản nghịch quấy rối.",
        "explanation": "Chuẩn bị kỹ lưỡng ra tay dứt khoát tiêu diệt mầm mống phá hoại cứng đầu nhất; hoàn tất công cuộc giải phóng an bình."
      }
    ]
  },
  "41": {
    "number": 41,
    "name": "Sơn Trạch Tổn",
    "vietnameseName": "Tổn (Bớt chỗ thừa bù chỗ thiếu, hy sinh vì đại cục)",
    "daxiang": {
      "original": "Sơn hạ hữu trạch, Tổn; quân tử dĩ trừng phẫn trất dục.",
      "meaning": "Dưới chân núi cao có đầm nước sâu chịu bốc hơi bồi đắp cho núi là quẻ Tổn; người quân tử noi theo đó mà kiềm chế cơn phẫn nộ nóng giận, dập tắt những ham muốn dục vọng buông thả.",
      "explanation": "Đầm nước chịu hao tổn hơi ẩm để nuôi dưỡng cây cỏ trên núi thêm xanh tốt. 'Tổn' là bớt chỗ thừa bù đắp cho chỗ thiếu, biết hy sinh cái nhỏ để vun đắp cái lớn. Đạo tu thân cốt ở việc 'trừng phẫn trất dục': dập tắt ngọn lửa nóng nảy sân hận và kiềm tỏa lòng tham lam ích kỷ."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Cửu",
        "xiangOriginal": "Tượng viết: Dĩ sự tật vãng, thượng hợp chí dã.",
        "xiangMeaning": "Xong việc của mình lập tức mau chóng đến giúp đỡ người khác, cùng hòa hợp ý chí với bậc bề trên.",
        "explanation": "Nhiệt tình giúp đỡ người gặp khó khăn nhưng phải làm tròn bổn phận của mình trước; giúp đúng mức thích hợp."
      },
      {
        "line": 2,
        "lineName": "Cửu Nhị",
        "xiangOriginal": "Tượng viết: Cửu nhị lợi trinh, trung dĩ vi chí dã.",
        "xiangMeaning": "Hào Cửu Nhị giữ đạo chính thì có lợi, lấy sự giữ gìn đạo trung làm ý chí kiên định.",
        "explanation": "Giúp người nhưng không tự làm tổn thương phẩm giá của mình; giữ trọn tư cách đứng đắn thì sự giúp đỡ mới có giá trị."
      },
      {
        "line": 3,
        "lineName": "Lục Tam",
        "xiangOriginal": "Tượng viết: Nhất nhân hành, tam tắc nghi dã.",
        "xiangMeaning": "Ba người cùng đi ắt sinh nghi ngờ bất đồng, một người đi đơn độc ắt tìm thấy bạn tri kỷ bè bạn.",
        "explanation": "Chuyên tâm vào một mối quan hệ trọng tâm, tránh tình trạng 'lắm mối tối nằm không' gây nghi kỵ chia rẽ."
      },
      {
        "line": 4,
        "lineName": "Lục Tứ",
        "xiangOriginal": "Tượng viết: Tổn kỳ tật, diệc khả hỉ dã.",
        "xiangMeaning": "Cắt giảm trừ tiệt được bệnh tật thói xấu của mình, thật là điều đáng vui mừng phấn khởi.",
        "explanation": "Dũng cảm loại bỏ những tật xấu và sai lầm khuyết điểm của bản thân; được quý nhân hoan hỷ đến nâng đỡ."
      },
      {
        "line": 5,
        "lineName": "Lục Ngũ",
        "xiangOriginal": "Tượng viết: Lục ngũ nguyên cát, tự thượng hữu dã.",
        "xiangMeaning": "Hào Lục Ngũ đạt điều đại cát được ban tặng rùa quý mười đôi, nhờ nhận được phúc lành chở che từ cõi trên.",
        "explanation": "Người có lòng chân thành vị tha vì dân vì nước; tự nhiên phúc lộc dồi dào, trời đất phù hộ chở che."
      },
      {
        "line": 6,
        "lineName": "Thượng Cửu",
        "xiangOriginal": "Tượng viết: Phất tổn ích chi, đại đắc chí dã.",
        "xiangMeaning": "Chẳng cần làm tổn hại mình mà vẫn làm ích lợi cho muôn người, đạt được chí nguyện phụng sự lớn lao.",
        "explanation": "Cảnh giới tối cao của sự hy sinh: đem lại hạnh phúc phồn vinh cho cộng đồng mà bản thân vẫn sung túc vinh quang."
      }
    ]
  },
  "42": {
    "number": 42,
    "name": "Phong Lôi Ích",
    "vietnameseName": "Ích (Thêm vào phong phú, gió sấm tăng cường sức mạnh)",
    "daxiang": {
      "original": "Phong lôi, Ích; quân tử dĩ kiến thiện tắc thiên, hữu quá tắc cải.",
      "meaning": "Gió thổi mạnh thì sấm càng vang xa, sấm rung chuyển làm gió thêm cuộn xiết là quẻ Ích; người quân tử noi theo đó mà thấy điều thiện thì mau chóng noi theo, thấy mình có lỗi thì lập tức sửa chữa đổi mới.",
      "explanation": "Gió và sấm tương trợ lẫn nhau cùng gia tăng sức mạnh sinh sôi cho vạn vật mùa xuân. 'Ích' là làm tăng thêm, bồi đắp lợi ích cho muôn dân. Đạo tu thân tiến đức cốt yếu ở hai việc: thấy ai có điều hay lẽ phải thì dẹp bỏ tự ái học tập ngay, thấy mình có khuyết điểm thì kiên quyết sửa đổi."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Cửu",
        "xiangOriginal": "Tượng viết: Nguyên cát vô cữu, hạ bất hậu sự dã.",
        "xiangMeaning": "Được điều đại cát không có lỗi, kẻ ở dưới bình thường không nên gánh vác việc quá nặng nề nhưng lúc này được trao quyền làm việc lớn.",
        "explanation": "Được tin tưởng giao trọng trách lớn lao; hãy tận tâm dốc sức làm nên công nghiệp giúp ích cho cộng đồng."
      },
      {
        "line": 2,
        "lineName": "Lục Nhị",
        "xiangOriginal": "Tượng viết: Hoặc ích chi, tự ngoại lai dã.",
        "xiangMeaning": "Có người mang phúc ích đến giúp đỡ, điều may mắn tốt lành tự bên ngoài đưa tới.",
        "explanation": "Giữ tâm trung chính hiền hòa, không mưu cầu tư lợi; phúc đức và cơ hội lớn tự nhiên gõ cửa."
      },
      {
        "line": 3,
        "lineName": "Lục Tam",
        "xiangOriginal": "Tượng viết: Ích dụng hung sự, cố hữu chi dã.",
        "xiangMeaning": "Dùng lợi ích tài lực cứu giúp việc nguy nan tang tóc hoạn nạn, việc làm trượng nghĩa vốn có sẵn trong tâm.",
        "explanation": "Đem tài lực cứu trợ thiên tai hoạn nạn cho nhân dân; việc làm nhân đạo cao cả không ai bắt bẻ trách cứ."
      },
      {
        "line": 4,
        "lineName": "Lục Tứ",
        "xiangOriginal": "Tượng viết: Cáo công tòng, dĩ ích chí dã.",
        "xiangMeaning": "Trình bày kiến nghị được bậc công hầu tin tưởng làm theo, để mở rộng chí nguyện ích nước lợi dân.",
        "explanation": "Làm cầu nối trung thực giữa nhân dân và lãnh đạo; đề xuất chính sách an dân được cấp trên chuẩn y."
      },
      {
        "line": 5,
        "lineName": "Cửu Ngũ",
        "xiangOriginal": "Tượng viết: Hữu phu huệ tâm, vật vấn nguyên cát. Huệ ngã đức, đại đắc chí dã.",
        "xiangMeaning": "Có lòng chí thành ban ơn cho thiên hạ, chẳng cần phải bói cũng biết là đại cát. Dân chúng biết ơn đức của ta, đạt được chí nguyện vĩ đại.",
        "explanation": "Bậc lãnh đạo có tâm từ bi thương dân như con; cả nước đồng lòng tri ân tạo nên sự nghiệp thái bình thịnh trị."
      },
      {
        "line": 6,
        "lineName": "Thượng Cửu",
        "xiangOriginal": "Tượng viết: Mạc ích chi, phiến từ dã. Hoặc kích chi, tự ngoại lai dã.",
        "xiangMeaning": "Chẳng ai muốn giúp đỡ kẻ ích kỷ tham lam, đó là lời chỉ trích thiên lệch của thói đời. Có kẻ đánh phá đánh vào lòng tham, tai họa tự bên ngoài ập tới.",
        "explanation": "Chỉ chăm chăm vun vén tư lợi cho bản thân mà không chia sẻ cho ai; ắt chuốc lấy sự thù ghét và đòn trừng phạt thích đáng."
      }
    ]
  },
  "43": {
    "number": 43,
    "name": "Trạch Thiên Quải",
    "vietnameseName": "Quải (Quyết đoán dứt khoát, trừ khử kẻ gian)",
    "daxiang": {
      "original": "Trạch thượng vu thiên, Quải; quân tử dĩ thi lộc cập hạ, cư đức tắc kỵ.",
      "meaning": "Nước đầm bốc lên tận trời cao sắp hóa thành mưa rào trút xuống là quẻ Quải; người quân tử noi theo đó mà ban phát bổng lộc ân huệ xuống cho kẻ dưới, tránh kiêu ngạo cậy vào đức độ mà tự cô lập mình.",
      "explanation": "Năm hào dương cương quyết tiến lên đẩy lùi một hào âm duy nhất ở trên chót vót. 'Quải' là quyết đoán, loại bỏ kẻ tiểu nhân tà vạy. Trừ gian phải dùng trí tuệ và sự công khai minh bạch nơi công đường, không dùng mưu hèn ám toán, đồng thời phải chăm lo thu phục lòng dân để củng cố hậu thuẫn."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Cửu",
        "xiangOriginal": "Tượng viết: Bất thắng nhi vãng, cữu dã.",
        "xiangMeaning": "Biết mình chưa đủ sức thắng mà vẫn cố tiến bừa, ắt chuốc lấy lỗi lầm thất bại.",
        "explanation": "Thực lực còn yếu chớ vội manh động ra đòn chống lại kẻ thù; nóng vội chỉ làm lộ kế hoạch thất bại."
      },
      {
        "line": 2,
        "lineName": "Cửu Nhị",
        "xiangOriginal": "Tượng viết: Hữu nhung vật tuất, đắc trung đạo dã.",
        "xiangMeaning": "Có giặc giã hiểm nguy giữa đêm tối nhưng chẳng cần lo âu, nhờ giữ được đạo trung dung cảnh giác phòng bị chu đáo.",
        "explanation": "Luôn có phương án dự phòng chuẩn bị chu đáo; dù có biến cố bất ngờ xảy ra vẫn điềm tĩnh ứng phó an toàn."
      },
      {
        "line": 3,
        "lineName": "Cửu Tam",
        "xiangOriginal": "Tượng viết: Quân tử quải quải, chung vô cữu dã.",
        "xiangMeaning": "Người quân tử kiên quyết quyết đoán dù đi một mình gặp mưa ướt bị người nghi ngờ, cuối cùng không có lỗi.",
        "explanation": "Có dũng khí hành động quyết liệt vì đại nghĩa dẫu chịu sự hiểu lầm nhất thời của bạn bè; thời gian sẽ chứng minh sự trong sạch."
      },
      {
        "line": 4,
        "lineName": "Cửu Tứ",
        "xiangOriginal": "Tượng viết: Kỳ hành thứ thả, vị bất đáng dã. Văn ngôn bất tín, thông bất minh dã.",
        "xiangMeaning": "Bước đi khập khiễng chần chừ vì ở vào ngôi vị không thích đáng. Nghe lời can ngăn mà không tin theo, tai điếc tâm trí không sáng suốt.",
        "explanation": "Bảo thủ ngoan cố không nghe lời khuyên của người hiểu biết; tiến thoái lưỡng nan tự đẩy mình vào thế bí."
      },
      {
        "line": 5,
        "lineName": "Cửu Ngũ",
        "xiangOriginal": "Tượng viết: Trung hành vô cữu, trung vị quang dã.",
        "xiangMeaning": "Quyết tâm dẹp trừ cỏ dại giữ lòng trung đạo thì không có lỗi, nhưng đạo trung dung ấy chưa thực sự rạng rỡ vì còn dùng dằng quan hệ.",
        "explanation": "Ở cương vị lãnh đạo phải dứt khoát trừng trị kẻ xấu thân cận; chớ dung túng nể nang tình riêng làm hỏng việc nước."
      },
      {
        "line": 6,
        "lineName": "Thượng Lục",
        "xiangOriginal": "Tượng viết: Vô hào chi hung, chung bất khả trường dã.",
        "xiangMeaning": "Kẻ gian tà cùng đường gào khóc than thở gặp hung họa, ngày tàn đã đến chung cuộc chẳng thể kéo dài được nữa.",
        "explanation": "Kẻ tiểu nhân tác oai tác quái đến lúc cùng đường mạt lộ; quy luật nhân quả tất yếu không thể trốn thoát."
      }
    ]
  },
  "44": {
    "number": 44,
    "name": "Thiên Phong Cấu",
    "vietnameseName": "Cấu (Gặp gỡ bất ngờ, phòng ngừa sự xâm lấn của tà khí)",
    "daxiang": {
      "original": "Thiên hạ hữu phong, Cấu; hậu dĩ thi mệnh cáo tứ phương.",
      "meaning": "Dưới trời có luồng gió thổi lướt qua tiếp xúc với vạn vật là quẻ Cấu; bậc quân vương noi theo đó mà ban bố mệnh lệnh giáo hóa khắp bốn phương trời.",
      "explanation": "Gió thổi dưới vòm trời tiếp xúc với muôn vật, tượng trưng cho sự tao ngộ ngẫu nhiên bất ngờ. Dưới đáy xuất hiện một hào âm mới sinh đang lén lút xâm lấn năm hào dương. Người cầm quyền phải nhạy bén thấy trước mầm mống tha hóa suy đồi từ sớm, mau chóng ra lệnh ngăn ngừa tà khí lan rộng."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Lục",
        "xiangOriginal": "Tượng viết: Hệ vu kim nê, nhu đạo khiên dã.",
        "xiangMeaning": "Buộc chặt vào cái hãm xe bằng kim loại để giữ lại, ngăn chặn con đường âm nhu quyến rũ lôi kéo làm bậy.",
        "explanation": "Ngăn chặn cái xấu từ khi mới nhú mầm; có biện pháp kiểm soát kiên quyết từ đầu thì không để lại hậu họa khôn lường."
      },
      {
        "line": 2,
        "lineName": "Cửu Nhị",
        "xiangOriginal": "Tượng viết: Bao hữu ngư, nghĩa bất cập tân dã.",
        "xiangMeaning": "Trong bọc có cá tươi ngon, theo đạo nghĩa không nên đem đãi người khách ngoài.",
        "explanation": "Kiểm soát tốt nhân sự tiêu cực trong nội bộ của mình, không để kẻ xấu liên kết với thế lực bên ngoài phá hoại."
      },
      {
        "line": 3,
        "lineName": "Cửu Tam",
        "xiangOriginal": "Tượng viết: Kỳ hành thứ thả, hành vị khiên dã.",
        "xiangMeaning": "Bước đi ngập ngừng khó nhọc, nhưng may mắn là bước chân chưa bị kẻ xấu dắt mũi lôi kéo sa ngã.",
        "explanation": "Cảm thấy bứt rứt khó xử trước cám dỗ; tuy vất vả nhưng giữ được mình không sa vào bẫy tình hay bẫy tiền bạc."
      },
      {
        "line": 4,
        "lineName": "Cửu Tứ",
        "xiangOriginal": "Tượng viết: Vô ngư chi hung, ly dân dã.",
        "xiangMeaning": "Trong bọc chẳng còn cá gặp điều hung, vì đã tự mình xa rời dân chúng cấp dưới.",
        "explanation": "Cao ngạo xa rời quần chúng, bỏ bê cấp dưới; để kẻ gian lôi kéo mất lòng người dẫn đến sự cô lập nguy nan."
      },
      {
        "line": 5,
        "lineName": "Cửu Ngũ",
        "xiangOriginal": "Tượng viết: Cửu ngũ hàm chương, trung chính dã. Hữu vẫn tự thiên, chí bất xả mệnh dã.",
        "xiangMeaning": "Hào Cửu Ngũ ngậm giấu vẻ đẹp tài đức vào trong, nhờ giữ đức trung chính. Điều may mắn từ trời rơi xuống, ý chí không bao giờ buông bỏ mệnh trời.",
        "explanation": "Lấy đức độ bao dung cảm hóa kẻ dưới mà không dùng bạo lực áp chế; trời cao ắt ban phúc lành lớn lao."
      },
      {
        "line": 6,
        "lineName": "Thượng Cửu",
        "xiangOriginal": "Tượng viết: Cấu kỳ giác, thượng cùng lận dã.",
        "xiangMeaning": "Gặp gỡ mà nghênh sừng nhọn chống đối kiêu ngạo, ở ngôi vị trên cùng cực ắt chuốc lấy hổ thẹn cô độc.",
        "explanation": "Thái độ gay gắt cực đoan xua đuổi tất cả mọi người; kiêu căng tự phụ dẫn đến sự cô lập hoàn toàn."
      }
    ]
  },
  "45": {
    "number": 45,
    "name": "Trạch Địa Tụy",
    "vietnameseName": "Tụy (Hội tụ nhân tài, tích tụ tinh hoa)",
    "daxiang": {
      "original": "Trạch thượng vu địa, Tụy; quân tử dĩ trừ nhung khí, giới bất ngu.",
      "meaning": "Nước tụ đọng trên mặt đất thành hồ đầm bao la là quẻ Tụy; người quân tử noi theo đó mà sửa sang vũ khí phòng bị, cảnh giác răn ngừa những biến cố bất ngờ xảy ra.",
      "explanation": "Nước tụ hội về đầm nước màu mỡ nuôi dưỡng muôn loài, tượng trưng cho sự quy tụ đông đảo quần chúng và tài sản của cải. Nơi nào đông đúc của cải người đông thì nơi đó dễ nảy sinh trộm cắp, tranh giành, xung đột. Người quân tử phải tăng cường an ninh trật tự, phòng ngừa bất trắc từ xa."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Lục",
        "xiangOriginal": "Tượng viết: Tri loạn nãi tụy, kỳ chí loạn dã.",
        "xiangMeaning": "Lòng dạ rối bời rồi mới tìm chỗ tụ hội nương tựa, vì ý chí còn bối rối chưa xác định rõ phương hướng.",
        "explanation": "Muốn gắn kết nhưng còn dao động nghi ngại; hãy tìm đến người có uy tín đức độ để nương tựa an tâm."
      },
      {
        "line": 2,
        "lineName": "Lục Nhị",
        "xiangOriginal": "Tượng viết: Dẫn cát vô cữu, trung vị biến dã.",
        "xiangMeaning": "Được dẫn dắt tốt lành không có lỗi, nhờ lòng dạ giữ đạo trung dung chưa từng biến đổi.",
        "explanation": "Giữ tấm lòng chân thành mộc mạc dẫu lễ vật sơ sài; được lãnh đạo thấu hiểu và tin cậy nâng đỡ."
      },
      {
        "line": 3,
        "lineName": "Lục Tam",
        "xiangOriginal": "Tượng viết: Vãng vô cữu, thượng tốn dã.",
        "xiangMeaning": "Tiến lên tụ hội thì không có lỗi, nhờ biết khiêm tốn nhu thuận noi theo bậc hiền đức bề trên.",
        "explanation": "Thấy mình lẻ loi cô độc thì chủ động tìm đến hòa nhập với tập thể chính phái; được đón nhận thân tình."
      },
      {
        "line": 4,
        "lineName": "Cửu Tứ",
        "xiangOriginal": "Tượng viết: Đại cát vô cữu, vị bất đáng dã.",
        "xiangMeaning": "Đạt điều đại cát thì mới không có lỗi, vì ở vào ngôi vị thừa hành không phải người đứng đầu.",
        "explanation": "Được lòng dân quy tụ ủng hộ nhiệt liệt; phải hết lòng trung thành phụng sự minh chủ, chớ sinh lòng tham quyền soán vị."
      },
      {
        "line": 5,
        "lineName": "Cửu Ngũ",
        "xiangOriginal": "Tượng viết: Tụy hữu vị, chí vị quang dã.",
        "xiangMeaning": "Quy tụ được lòng người nhờ có ngôi vị cao, nhưng đức sáng cảm hóa lòng người chưa thực sự rạng rỡ rộng khắp.",
        "explanation": "Có quyền lực trong tay nhưng cần bồi đắp thêm đức độ và uy tín để mọi người tâm phục khẩu phục tự giác đi theo."
      },
      {
        "line": 6,
        "lineName": "Thượng Lục",
        "xiangOriginal": "Tượng viết: Tê tư thế thế, vị an thượng dã.",
        "xiangMeaning": "Than thở rơi nước mắt ròng ròng, vì ở ngôi cao nhất mà chưa an định được lòng người quy phục.",
        "explanation": "Ở đỉnh cao mà bị cô lập không ai chịu đến tụ hội; biết đau xót ăn năn hạ mình cầu hiền thì chuyển nguy thành an."
      }
    ]
  },
  "46": {
    "number": 46,
    "name": "Địa Phong Thăng",
    "vietnameseName": "Thăng (Vươn lên từng bước, cây mọc từ lòng đất)",
    "daxiang": {
      "original": "Địa trung sinh mộc, Thăng; quân tử dĩ thuận đức, tích tiểu dĩ cao đại.",
      "meaning": "Cây xanh từ trong lòng đất bền bỉ mọc vươn cao lên bầu trời là quẻ Thăng; người quân tử noi theo đó mà thuận theo đức hạnh nhu hòa, tích lũy từng việc nhỏ để đạt đến cảnh giới cao lớn vĩ đại.",
      "explanation": "Hạt giống nảy mầm trong lòng đất, âm thầm bám rễ sâu rồi từng ngày từng giờ vươn cao thành cây đại thụ che bóng mát. 'Thăng' là tiến lên, thăng tiến thuận chiều. Muốn thành công lớn, người quân tử không được nóng vội nhảy cóc, mà phải kiên trì bồi đắp kiến thức, đạo đức từ những điều nhỏ nhất."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Lục",
        "xiangOriginal": "Tượng viết: Doãn thăng đại cát, thượng hợp chí dã.",
        "xiangMeaning": "Được tin cậy mà thăng tiến đạt điều đại cát, vì hòa hợp ý chí với bậc bề trên đồng lòng nâng đỡ.",
        "explanation": "Được cấp trên và đồng nghiệp tín nhiệm hết lòng ủng hộ ngay từ bước đầu; tiền đồ rộng mở thênh thang."
      },
      {
        "line": 2,
        "lineName": "Cửu Nhị",
        "xiangOriginal": "Tượng viết: Cửu nhị chi phu, hữu hỉ dã.",
        "xiangMeaning": "Lòng chí thành tin cậy của hào Cửu Nhị đem lại niềm vui mừng hân hoan to lớn.",
        "explanation": "Có tài năng và lòng thành thực thà; dẫu lễ mọn đơn sơ vẫn được lãnh đạo tin dùng trọng đãi."
      },
      {
        "line": 3,
        "lineName": "Cửu Tam",
        "xiangOriginal": "Tượng viết: Thăng hư ấp, vô sở nghi dã.",
        "xiangMeaning": "Tiến lên như bước vào mảnh đất trống thênh thang không chướng ngại, chẳng có điều gì phải ngờ vực do dự.",
        "explanation": "Gặp thời vận cực kỳ thuận lợi, mọi cản trở đều biến mất; tự tin tiến bước gặt hái thành quả vượt bậc."
      },
      {
        "line": 4,
        "lineName": "Lục Tứ",
        "xiangOriginal": "Tượng viết: Vương dụng hanh vu Kỳ Sơn, thuận sự dã.",
        "xiangMeaning": "Được vua cử làm chủ tế lễ tạ ơn nơi núi Kỳ Sơn, nhờ luôn hành sự nhu thuận theo lẽ phải.",
        "explanation": "Được triều đình trao ban vinh dự lớn lao; khiêm tốn tận tụy phục vụ được quần chúng kính yêu."
      },
      {
        "line": 5,
        "lineName": "Lục Ngũ",
        "xiangOriginal": "Tượng viết: Trinh cát thăng giai, đại đắc chí dã.",
        "xiangMeaning": "Giữ đạo chính bền vững tốt lành bước lên từng bậc thềm rực rỡ, thỏa mãn chí nguyện lớn lao.",
        "explanation": "Thăng tiến từng bước vững chắc lên đỉnh cao danh vọng; thành công đàng hoàng quang minh chính đại."
      },
      {
        "line": 6,
        "lineName": "Thượng Lục",
        "xiangOriginal": "Tượng viết: Minh thăng tại thượng, tiêu bất phú dã.",
        "xiangMeaning": "Mù quáng u mê cố thăng tiến mãi ở ngôi trên cùng, tài lực tiêu hao chẳng thể giàu sang lâu bền.",
        "explanation": "Đã lên tới đỉnh điểm mà vẫn tham quyền cố vị mù quáng; lòng tham không đáy sẽ dẫn đến sự suy sụp tiêu vong."
      }
    ]
  },
  "47": {
    "number": 47,
    "name": "Trạch Thủy Khốn",
    "vietnameseName": "Khốn (Khốn cùng gian nan, đầm cạn hết nước)",
    "daxiang": {
      "original": "Trạch vô thủy, Khốn; quân tử dĩ trí mệnh toại chí.",
      "meaning": "Đầm nước khô cạn không còn giọt nước nào là quẻ Khốn; người quân tử noi theo đó mà dám liều mình giữ trọn sứ mệnh, hy sinh thân mình để thực hiện đến cùng chí nguyện thanh cao.",
      "explanation": "Nước đầm bị rò rỉ chảy hết xuống đáy sâu, cây cỏ khô héo tiêu điều. Thời kỳ khốn cùng cực điểm thử thách khí tiết con người. Kẻ tầm thường gặp khốn thì than khóc kêu gào làm điều xằng bậy; bậc quân tử điềm nhiên xem gian nan như lò lửa tôi luyện ý chí, thà chết vì nghĩa chứ không đổi lòng."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Lục",
        "xiangOriginal": "Tượng viết: Nhập vu u cốc, u bất minh dã.",
        "xiangMeaning": "Ngồi khốn đốn dưới gốc cây cụt rồi rơi sâu vào thung lũng u tối ba năm không thấy ai, vì mê muội tối tăm không thấy lối ra.",
        "explanation": "Rơi vào cảnh ngộ bế tắc cùng cực do sai lầm của chính mình; chán nản bi quan chỉ làm kéo dài thời gian tăm tối."
      },
      {
        "line": 2,
        "lineName": "Cửu Nhị",
        "xiangOriginal": "Tượng viết: Khốn vu tửu thực, trung hữu khánh dã.",
        "xiangMeaning": "Khốn đốn trong sự ê hề rượu thịt no đủ, nhưng nhờ giữ lòng trung chính mà cuối cùng có sự phúc khánh đưa tới.",
        "explanation": "Bị ràng buộc bởi miếng cơm manh áo hay bổng lộc trói buộc; kiên trì giữ phẩm cách chờ cơ hội phụng sự lý tưởng."
      },
      {
        "line": 3,
        "lineName": "Lục Tam",
        "xiangOriginal": "Tượng viết: Cứ vu tật lê, thừa cương dã. Nhập vu kỳ cung, bất kiến kỳ thê, bất tường dã.",
        "xiangMeaning": "Dựa lưng vào bụi gai tật lê vì cưỡi lên hào cương cường. Vào trong nhà mình mà chẳng thấy vợ đâu, cảnh ngộ chẳng lành chút nào.",
        "explanation": "Cố chấp bám víu vào chỗ nguy hiểm bất an; người thân ruột thịt quay lưng xa lánh, tự chuốc lấy cô độc bất hạnh."
      },
      {
        "line": 4,
        "lineName": "Cửu Tứ",
        "xiangOriginal": "Tượng viết: Lai từ từ, chí tại hạ dã. Tuy bất đương vị, hữu dữ dã.",
        "xiangMeaning": "Chậm rãi từ từ tìm đến cứu giúp, vì tâm ý hướng về người hoạn nạn bên dưới. Tuy ngôi vị chưa hợp nhưng có người đồng lòng chia sẻ.",
        "explanation": "Muốn ra tay cứu viện nhưng còn vướng rào cản; kiên trì từng bước một rồi cũng đến được với nhau."
      },
      {
        "line": 5,
        "lineName": "Cửu Ngũ",
        "xiangOriginal": "Tượng viết: Tị tiệt, chí vị đắc dã. Nãi từ từ lợi dụng tế tự, thụ phúc dã.",
        "xiangMeaning": "Bị xẻo mũi cắt chân đau đớn, chí nguyện chưa đạt được. Nhưng rồi từ từ cởi mở lòng dạ dùng lòng thành lễ tế, sẽ đón nhận phúc lành.",
        "explanation": "Bị hoàn cảnh chèn ép đau đớn tột cùng; kiên trinh giữ đức chí thành cầu nguyện hướng thượng ắt tai qua nạn khỏi."
      },
      {
        "line": 6,
        "lineName": "Thượng Lục",
        "xiangOriginal": "Tượng viết: Khốn vu cát lũy, vị đương dã. Động hối hữu hối, cát hành dã.",
        "xiangMeaning": "Bị trói buộc trong dây leo chằng chịt, vì hành xử chưa thật thích đáng. Biết ăn năn hối hận mà hành động dứt khoát phá tan dây trói thì tiến bước tốt lành.",
        "explanation": "Cơn bĩ cực đã đến hồi kết thúc; dũng cảm cắt đứt mọi vướng mắc trói buộc để bước sang trang mới tươi sáng."
      }
    ]
  },
  "48": {
    "number": 48,
    "name": "Thủy Phong Tỉnh",
    "vietnameseName": "Tỉnh (Giếng nước ngọt lành, nguồn sống vô tận)",
    "daxiang": {
      "original": "Mộc thượng hữu thủy, Tỉnh; quân tử dĩ lao dân khuyến tương.",
      "meaning": "Cây gỗ múc nước giếng dâng lên nuôi người là quẻ Tỉnh; người quân tử noi theo đó mà an ủi vỗ về nhọc nhằn của nhân dân, khuyên răn dân chúng đùm bọc tương trợ lẫn nhau.",
      "explanation": "Đổi dời cả làng xóm làng ấp chứ không bao giờ dời được giếng nước. Giếng múc lên không bao giờ cạn, không múc thì cũng chẳng tràn bờ, nguồn nước mát lành nuôi dưỡng muôn đời. Người quân tử phải tu dưỡng đạo đức tài năng như giếng nước trong lành, không ngừng cống hiến cho đời mà không màng đền đáp."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Lục",
        "xiangOriginal": "Tượng viết: Tỉnh nê bất thực, hạ dã. Cựu tỉnh vô cầm, thời xả dã.",
        "xiangMeaning": "Giếng bùn lầy nước đục chẳng ai thèm uống, vì ở tận dưới đáy thấp hèn. Giếng cũ hoang phế chẳng có chim muông đến đậu, vì thời thế đã bỏ rơi.",
        "explanation": "Tài năng phẩm chất chưa được tôi luyện, tâm trí còn vướng bùn nhơ; không ai đoái hoài, phải mau chóng tự thanh lọc bản thân."
      },
      {
        "line": 2,
        "lineName": "Cửu Nhị",
        "xiangOriginal": "Tượng viết: Tỉnh cốc xạ phụ, vô dữ dã.",
        "xiangMeaning": "Nước giếng trong lòng máng chỉ để bắn cá lòng tong vụn vặt, thùng múc nước thì vỡ nát, chẳng có ai cùng phối hợp sử dụng.",
        "explanation": "Có chút tài năng nhưng dùng vào việc vặt vãnh tầm thường, kết bè với kẻ kém cỏi; lãng phí năng lực quý báu."
      },
      {
        "line": 3,
        "lineName": "Cửu Tam",
        "xiangOriginal": "Tượng viết: Tỉnh tiết bất thực, hành trắc dã. Cầu vương minh, thụ phúc dã.",
        "xiangMeaning": "Giếng đã được nạo vét trong veo mà người qua đường chưa hay biết uống, lòng người xót xa đau buồn. Mong có đấng minh vương sáng suốt biết đến, để muôn người cùng hưởng phúc lành.",
        "explanation": "Tài đức vẹn toàn nhưng chưa được người đời biết đến trọng dụng; kiên nhẫn giữ mình chờ minh chủ xuất hiện."
      },
      {
        "line": 4,
        "lineName": "Lục Tứ",
        "xiangOriginal": "Tượng viết: Tỉnh tu vô cữu, tu tỉnh dã.",
        "xiangMeaning": "Thành giếng được xây lát gạch đá cẩn thận thì không có lỗi, nhờ biết tu sửa chỉnh trang giếng nước sạch sẽ.",
        "explanation": "Thời gian tạm dừng công việc bên ngoài để củng cố chuyên môn, rèn luyện tu thân nội bộ; chuẩn bị cho bước tiến mới."
      },
      {
        "line": 5,
        "lineName": "Cửu Ngũ",
        "xiangOriginal": "Tượng viết: Hàn tuyền chi thực, trung chính dã.",
        "xiangMeaning": "Mạch nước giếng mát lạnh ngọt lành cho mọi người ăn uống, nhờ giữ được ngôi vị trung chính cao đẹp.",
        "explanation": "Đạt đến đỉnh cao tài năng và đức độ; nguồn trí tuệ dồi dào đem lại lợi ích và sự sống ấm no cho muôn người."
      },
      {
        "line": 6,
        "lineName": "Thượng Lục",
        "xiangOriginal": "Tượng viết: Nguyên cát tại thượng, đại thành dã.",
        "xiangMeaning": "Giếng nước mở toang nắp không đậy cho thiên hạ cùng múc uống, đạt điều đại cát ở ngôi trên cùng, sự nghiệp đại thành công viên mãn.",
        "explanation": "Đem trọn vẹn tài năng đức độ phụng sự xã hội một cách vô tư không vụ lợi; công đức lưu truyền muôn đời muôn thế hệ."
      }
    ]
  },
  "49": {
    "number": 49,
    "name": "Trạch Hỏa Cách",
    "vietnameseName": "Cách (Cách mạng đổi mới, lột xác chuyển mình)",
    "daxiang": {
      "original": "Trạch trung hữu hỏa, Cách; quân tử dĩ trị lịch minh thời.",
      "meaning": "Trong lòng đầm nước có ngọn lửa bùng cháy dữ dội là quẻ Cách; người quân tử noi theo đó mà làm ra lịch pháp, làm sáng tỏ các mùa và thời khắc trong năm.",
      "explanation": "Lửa và nước tiêu diệt lẫn nhau nhưng cũng biến hóa chuyển dịch tạo nên sự thay đổi triệt để. 'Cách' là lột xác, đổi mới toàn diện, cách mạng bỏ cũ lập mới. Người lãnh đạo muốn cải cách thành công phải thuận theo lòng trời và hợp ý nguyện muôn dân, chọn đúng thời cơ chín muồi, có kế hoạch rõ ràng minh bạch như lịch pháp."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Cửu",
        "xiangOriginal": "Tượng viết: Củng chi dụng hoàng ngưu, bất khả dĩ hữu vi dã.",
        "xiangMeaning": "Dùng da bò vàng trói chặt lại giữ yên, chưa thể vội vàng làm nên việc gì lớn.",
        "explanation": "Thời cơ chưa chín muồi chớ vội tiến hành cải cách; hãy nhẫn nại giữ mình, chuẩn bị nội lực kỹ càng."
      },
      {
        "line": 2,
        "lineName": "Lục Nhị",
        "xiangOriginal": "Tượng viết: Tị nhật cách chi, hành hữu gia dã.",
        "xiangMeaning": "Đợi đến ngày Tị (thời cơ chín muồi) mới tiến hành đổi mới, hành động ắt thu được kết quả tốt đẹp vẻ vang.",
        "explanation": "Nắm bắt chính xác thời cơ bước ngoặt để ra tay; sự chuẩn bị chu đáo đem lại thành công vang dội."
      },
      {
        "line": 3,
        "lineName": "Cửu Tam",
        "xiangOriginal": "Tượng viết: Cách ngôn tam tựu, hựu chi hà chi.",
        "xiangMeaning": "Bàn bạc việc cải cách ba lần thảo luận kỹ lưỡng thấu đáo rồi mới hành động, còn đi đâu mà lo thất bại nữa.",
        "explanation": "Việc cải cách hệ trọng phải lắng nghe ý kiến nhiều chiều, bàn bạc thấu đáo thận trọng trước khi ban hành."
      },
      {
        "line": 4,
        "lineName": "Cửu Tứ",
        "xiangOriginal": "Tượng viết: Cải mệnh chi cát, tín chí dã.",
        "xiangMeaning": "Thay đổi thể chế vận mệnh tốt lành, nhờ muôn dân đặt trọn niềm tin cậy vào ý chí chính nghĩa của ta.",
        "explanation": "Có được lòng tin tuyệt đối của quần chúng thì dũng cảm thay đổi lề lối cũ, lập nên trật tự mới tiến bộ."
      },
      {
        "line": 5,
        "lineName": "Cửu Ngũ",
        "xiangOriginal": "Tượng viết: Đại nhân hổ biến, kỳ văn tư dã.",
        "xiangMeaning": "Bậc đại nhân lột xác rực rỡ như lông hổ vằn vện sáng láng, vẻ đẹp văn hóa rực rỡ sáng ngời.",
        "explanation": "Cuộc cải cách của bậc vĩ nhân thành công rực rỡ; diện mạo đất nước lột xác hoàn toàn, văn minh rạng rỡ."
      },
      {
        "line": 6,
        "lineName": "Thượng Lục",
        "xiangOriginal": "Tượng viết: Quân tử báo biến, kỳ văn úy dã. Tiểu nhân cách diện, thuận dĩ tòng quân dã.",
        "xiangMeaning": "Người quân tử đổi mới tinh tế như lông báo hoa mỹ. Kẻ tiểu nhân thay đổi vẻ mặt ngoài, thuần phục theo lệnh bậc minh quân.",
        "explanation": "Đổi mới đã thành nếp, người có học tiếp tục hoàn thiện tinh hoa; quần chúng tự giác chấp hành pháp luật mới an cư lạc nghiệp."
      }
    ]
  },
  "50": {
    "number": 50,
    "name": "Hỏa Phong Đỉnh",
    "vietnameseName": "Đỉnh (Vạc báu luyện ngọc, tôi luyện nhân tài)",
    "daxiang": {
      "original": "Mộc thượng hữu hỏa, Đỉnh; quân tử dĩ chính vị ngưng mệnh.",
      "meaning": "Cây gỗ chụm lửa đun sôi thức ăn trong vạc là quẻ Đỉnh; người quân tử noi theo đó mà đính chính ngôi vị cho đàng hoàng đoan chính, ngưng tụ đón nhận sứ mệnh thiêng liêng vững bền.",
      "explanation": "Vạc báu ba chân tượng trưng cho sự vững chắc của chính quyền quốc gia, nơi nấu nướng thức ăn tinh khiết dâng cúng tổ tiên và nuôi dưỡng người hiền tài. 'Cách' là bỏ cái cũ, 'Đỉnh' là dựng cái mới. Bậc lãnh đạo sau khi đổi mới phải mau chóng củng cố thể chế, trọng dụng hiền tài, tôi luyện tinh hoa đất nước."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Lục",
        "xiangOriginal": "Tượng viết: Đỉnh điên chỉ, vị bội dã. Lợi xuất bỉ, dĩ tòng quý dã.",
        "xiangMeaning": "Lật ngược chân vạc dốc sạch cặn bã ra ngoài, chưa hề trái với đạo lý. Có lợi khi đổ bỏ đồ ôi thiu hỏng hóc, để đón nhận thức ăn thanh quý mới.",
        "explanation": "Khởi đầu loại bỏ hoàn toàn thói quen xấu, cặn bã quá khứ; thanh lọc bản thân để đón nhận tinh hoa mới."
      },
      {
        "line": 2,
        "lineName": "Cửu Nhị",
        "xiangOriginal": "Tượng viết: Đỉnh hữu thực, thận sở phó dã. Ngã cừu hữu tật, chung vô vưu dã.",
        "xiangMeaning": "Trong vạc có sẵn thức ăn ngon, phải thận trọng nơi ta bước tới. Kẻ thù ghen ghét mắc bệnh tật không hại được ta, cuối cùng chẳng có lỗi gì.",
        "explanation": "Có tài năng thực lực trong người ắt bị kẻ xấu ganh ghét; thận trọng giữ mình giữ đạo trung chính thì kẻ tiểu nhân tự bại."
      },
      {
        "line": 3,
        "lineName": "Cửu Tam",
        "xiangOriginal": "Tượng viết: Đỉnh nhĩ cách, thất kỳ nghĩa dã.",
        "xiangMeaning": "Tai quai vạc bị biến đổi hư hỏng chưa khiêng đi được, tạm thời đánh mất ý nghĩa công dụng của nó.",
        "explanation": "Có tài nhưng tạm thời bị ngưng trệ, chưa tìm được tiếng nói chung với cấp trên; kiên nhẫn đợi mưa rào giải tỏa."
      },
      {
        "line": 4,
        "lineName": "Cửu Tứ",
        "xiangOriginal": "Tượng viết: Phúc công tốc, tín như hà dã.",
        "xiangMeaning": "Làm gãy chân vạc đổ hết món canh ngon của vương công làm nhơ nhuốc khắp nơi, lòng tin cậy sẽ ra sao đây.",
        "explanation": "Tài hèn đức mọn mà ham gánh trọng trách quá lớn; làm hỏng đại sự làm mất hết uy tín danh dự."
      },
      {
        "line": 5,
        "lineName": "Lục Ngũ",
        "xiangOriginal": "Tượng viết: Đỉnh hoàng nhĩ, trung dĩ vi thực dã.",
        "xiangMeaning": "Quai vạc bằng vàng đòn khiêng bằng kim loại vững chắc, lấy đức trung dung làm thực chất phẩm hạnh.",
        "explanation": "Lãnh đạo khiêm tốn dung dị có tài chiêu mộ hiền tài; cùng các bậc tài đức gánh vác việc triều chính vững vàng."
      },
      {
        "line": 6,
        "lineName": "Thượng Cửu",
        "xiangOriginal": "Tượng viết: Ngọc nhĩ tại thượng, cương nhu tiết dã.",
        "xiangMeaning": "Quai vạc bằng ngọc quý sáng đẹp ở ngôi trên cùng, kết hợp nhuần nhuyễn giữa đức cương cường và nhu thuận.",
        "explanation": "Đạt đến đỉnh cao hoàn mỹ về tài năng đức độ; ôn nhu quý báu như ngọc, đem lại phúc lộc thịnh vượng muôn đời."
      }
    ]
  },
  "51": {
    "number": 51,
    "name": "Thuần Chấn",
    "vietnameseName": "Chấn Vi Lôi (Sấm sét rung chuyển, thức tỉnh nhân tâm)",
    "daxiang": {
      "original": "Tiến lôi, Chấn; quân tử dĩ khủng cụ tu tỉnh.",
      "meaning": "Sấm sét nối tiếp nhau vang dội rung chuyển trời đất là quẻ Chấn; người quân tử noi theo đó mà biết sợ hãi tôn kính thiên nhiên mệnh trời, tự kiểm điểm tu dưỡng tâm tính bản thân.",
      "explanation": "Hai tiếng sấm nổ liên hồi làm kinh động muôn loài, cảnh tỉnh người đời khỏi cơn u mê ru ngủ. Người tầm thường nghe sấm thì kinh hoàng bạt vía đánh rơi muỗng đũa; bậc quân tử nhờ thường ngày biết sợ mệnh trời mà tu thân cẩn trọng, nên khi biến cố long trời lở đất ập đến vẫn giữ được nụ cười điềm đạm, tâm không hề hoảng loạn."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Cửu",
        "xiangOriginal": "Tượng viết: Chấn lai khích khích, khủng trí phúc dã. Tiếu ngôn ách ách, hậu hữu tắc dã.",
        "xiangMeaning": "Sấm sét ập tới giật mình lo sợ, biết sợ hãi răn mình lại đem lại phúc lành. Sau đó cười nói vui vẻ rộn rã, vì đã giữ được phép tắc khuôn mẫu đúng đắn.",
        "explanation": "Gặp biến cố biết cảnh giác sợ hãi tự xét mình; vượt qua thử thách một cách bình an và thành công tốt đẹp."
      },
      {
        "line": 2,
        "lineName": "Lục Nhị",
        "xiangOriginal": "Tượng viết: Chấn lai lệ, thừa cương dã.",
        "xiangMeaning": "Sấm sét ập tới nguy nan vội bỏ của cải leo lên đồi cao lánh nạn, vì cưỡi lên hào cương cường hiểm trở.",
        "explanation": "Gặp hiểm họa bất ngờ, thà bỏ của cải để bảo toàn tính mạng; sau bảy ngày khó khăn qua đi của cải lại về tay."
      },
      {
        "line": 3,
        "lineName": "Lục Tam",
        "xiangOriginal": "Tượng viết: Chấn tô tô, vị bất đáng dã.",
        "xiangMeaning": "Sấm sét nổ vang lòng dạ bàng hoàng hoảng hốt, vì ở vào ngôi vị không thích đáng.",
        "explanation": "Tâm lý yếu đuối mất bình tĩnh trước biến động; nhờ sợ hãi mà kịp thời dừng lại hành vi sai trái nên không mắc họa."
      },
      {
        "line": 4,
        "lineName": "Cửu Tứ",
        "xiangOriginal": "Tượng viết: Chấn toại nê, vị quang dã.",
        "xiangMeaning": "Tiếng sấm sét chìm ngập vào bùn lầy không vang xa được, tài năng đức độ chưa thực sự sáng sủa quang minh.",
        "explanation": "Có tài nhưng bị hoàn cảnh trói buộc thụ động, sa lầy trong lúng túng; chưa thể phát huy được sức mạnh bứt phá."
      },
      {
        "line": 5,
        "lineName": "Lục Ngũ",
        "xiangOriginal": "Tượng viết: Chấn vãng lai lệ, nguy hành dã. Sự tại trung, đại vô táng dã.",
        "xiangMeaning": "Sấm sét qua lại hiểm nguy rập rình, hành động thận trọng trong nguy nan. Nắm giữ việc ở ngôi trung chính, không để mất mát điều gì lớn lao.",
        "explanation": "Đứng trước bao sóng gió dập dồn của thời cuộc; giữ vững tâm trung dung bình thản điều hành đại cuộc không bị tổn thất."
      },
      {
        "line": 6,
        "lineName": "Thượng Lục",
        "xiangOriginal": "Tượng viết: Chấn tác tác, trung vị đắc dã. Tuy hung vô cữu, úy lân giới dã.",
        "xiangMeaning": "Sấm sét kinh hoàng mắt nhìn đảo quanh sợ hãi, vì chưa nắm được đạo trung dung. Tuy tình cảnh hung hiểm nhưng không mắc lỗi, nhờ thấy tai họa nhà hàng xóm mà biết sợ hãi cảnh giác phòng ngừa.",
        "explanation": "Thấy người khác gặp họa mà biết tự răn mình đề phòng từ sớm; nhờ cảnh giác mà tránh được tai ương ập xuống đầu."
      }
    ]
  },
  "52": {
    "number": 52,
    "name": "Thuần Cấn",
    "vietnameseName": "Cấn Vi Sơn (Núi đứng sừng sững, biết dừng đúng lúc)",
    "daxiang": {
      "original": "Kiêm sơn, Cấn; quân tử dĩ tư bất xuất kỳ vị.",
      "meaning": "Hai ngọn núi sừng sững trùng điệp đứng yên bất động là quẻ Cấn; người quân tử noi theo đó mà suy nghĩ việc gì cũng không vượt quá phạm vi cương vị bổn phận của mình.",
      "explanation": "Núi đứng im phăng phắc, tĩnh lặng như như bất động. 'Cấn' là dừng lại, an định tâm trí. Biết dừng đúng lúc, đúng chỗ là đỉnh cao của trí tuệ. Người quân tử an phận thủ thường, không vọng tưởng viển vông, không can thiệp vào việc ngoài quyền hạn, giữ tâm thanh tịnh như ngọn núi cao."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Lục",
        "xiangOriginal": "Tượng viết: Cấn kỳ chỉ, vị thất chính dã.",
        "xiangMeaning": "Dừng lại ở ngay ngón chân khi mới bước đi, chưa hề đánh mất con đường chính đạo.",
        "explanation": "Thấy manh nha sai quấy lập tức dừng bước ngay từ đầu; bảo toàn sự trong sạch và bình yên trọn vẹn."
      },
      {
        "line": 2,
        "lineName": "Lục Nhị",
        "xiangOriginal": "Tượng viết: Bất chưng kỳ tùy, vị thoái thính dã.",
        "xiangMeaning": "Dừng lại ở bắp chân mà không thể cứu vớt người theo sau, lòng đau xót mà người ta chẳng chịu nghe lời khuyên dừng lại.",
        "explanation": "Mình biết dừng lại an toàn nhưng người trên bướng bỉnh cứ tiến bừa; bất lực xót xa vì không thể can ngăn."
      },
      {
        "line": 3,
        "lineName": "Cửu Tam",
        "xiangOriginal": "Tượng viết: Cấn kỳ hạn, nguy huân tâm dã.",
        "xiangMeaning": "Dừng ép buộc ở chỗ thắt lưng làm gãy xương sống, nguy hiểm như ngọn lửa thiêu đốt tâm can.",
        "explanation": "Dùng ý chí cưỡng ép dừng lại một cách thô bạo gượng gạo; làm nội tâm xung đột giằng xé thống khổ khôn cùng."
      },
      {
        "line": 4,
        "lineName": "Lục Tứ",
        "xiangOriginal": "Tượng viết: Cấn kỳ thân, chỉ chư cung dã.",
        "xiangMeaning": "Dừng lại ở nơi thân mình không vọng động, tự kiềm chế được cả thể xác và tâm tính của bản thân.",
        "explanation": "Làm chủ được cảm xúc và hành vi của chính mình; giữ thân tâm thanh thản không phạm sai lầm."
      },
      {
        "line": 5,
        "lineName": "Lục Ngũ",
        "xiangOriginal": "Tượng viết: Cấn kỳ phụ, dĩ trung chính dã.",
        "xiangMeaning": "Dừng lại ở nơi gò má mép miệng, lời nói phát ra có trật tự chừng mực, nhờ giữ được đạo trung chính.",
        "explanation": "Uốn lưỡi bảy lần trước khi nói, nói năng cẩn trọng đúng mực; tránh được mọi tai họa thị phi từ miệng sinh ra."
      },
      {
        "line": 6,
        "lineName": "Thượng Cửu",
        "xiangOriginal": "Tượng viết: Đôn cấn chi cát, dĩ hậu chung dã.",
        "xiangMeaning": "Dừng lại một cách đôn hậu vững bền trọn vẹn thì tốt lành, lấy sự dày dặn đức độ để kết thúc cuộc đời viên mãn.",
        "explanation": "Đạt đến cảnh giới tĩnh lặng an nhiên tuyệt đối; sống cuộc đời đức hạnh trọn vẹn hưởng phúc thọ an khang."
      }
    ]
  },
  "53": {
    "number": 53,
    "name": "Phong Sơn Tiệm",
    "vietnameseName": "Tiệm (Tiến bước tuần tự, chim nhạn bay về núi)",
    "daxiang": {
      "original": "Sơn thượng hữu mộc, Tiệm; quân tử dĩ cư hiền đức, thiện tục.",
      "meaning": "Trên núi cao có cây xanh chậm rãi lớn lên từng ngày là quẻ Tiệm; người quân tử noi theo đó mà bồi đắp đức hạnh hiền thiện vững bền, cảm hóa làm tốt đẹp phong tục xã hội.",
      "explanation": "Cây trên đỉnh núi mọc chầm chậm bám rễ sâu vào kẽ đá, không vội vã nhưng gió bão không thể lay đổ. 'Tiệm' là tuần tự từng bước, như đàn chim nhạn bay về phương nam có trật tự thứ lớp, như lễ cưới hỏi đủ nghi thức. Làm việc lớn phải kiên nhẫn tích lũy, đốt cháy giai đoạn tất chuốc lấy thất bại."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Lục",
        "xiangOriginal": "Tượng viết: Sơ lục chi nan, nghĩa vô cữu dã.",
        "xiangMeaning": "Cái khó khăn bước đầu của chim nhạn đậu bờ nước, về mặt đạo nghĩa thì chẳng có lỗi lầm gì.",
        "explanation": "Người trẻ mới vào đời bị người ta gièm pha chỉ trích; cứ bình tâm nhẫn nại làm tròn bổn phận thì không lỗi."
      },
      {
        "line": 2,
        "lineName": "Lục Nhị",
        "xiangOriginal": "Tượng viết: Ẩm thực khản khản, bất tố xan dã.",
        "xiangMeaning": "Chim nhạn bay đến đậu trên tảng đá lớn ăn uống vui vẻ ung dung, không phải là kẻ ăn bám ngồi không hưởng lộc.",
        "explanation": "Có tài đức được trọng dụng đãi ngộ xứng đáng; sống thanh thản ấm no không thẹn với lòng."
      },
      {
        "line": 3,
        "lineName": "Cửu Tam",
        "xiangOriginal": "Tượng viết: Phu chinh bất phục, ly quần xú dã. Phụ dựng bất dục, thất kỳ đạo dã. Lợi ngự khấu, thuận tương bảo dã.",
        "xiangMeaning": "Chồng đi chinh chiến không trở về xa rời bầu bạn thật đáng buồn. Vợ có thai mà không nuôi dạy được con vì đánh mất nếp nhà. Có lợi khi chống cự giặc giã để cùng thuận theo bảo vệ lẫn nhau.",
        "explanation": "Nóng vội tiến bừa xa rời tổ chức gây nên cảnh ly tán tan vỡ; phải mau chóng quay về bảo vệ mái ấm."
      },
      {
        "line": 4,
        "lineName": "Lục Tứ",
        "xiangOriginal": "Tượng viết: Hoặc đắc kỳ quác, thuận dĩ tốn dã.",
        "xiangMeaning": "Chim nhạn bay đến cành cây bằng phẳng được chỗ nghỉ chân an toàn, nhờ nết nhu thuận khiêm tốn.",
        "explanation": "Ở vị thế chông chênh biết tìm chỗ dung thân an toàn thích hợp; khiêm nhường thì tránh được hiểm nguy."
      },
      {
        "line": 5,
        "lineName": "Cửu Ngũ",
        "xiangOriginal": "Tượng viết: Chung mạc chi thắng cát, đắc sở nguyện dã.",
        "xiangMeaning": "Cuối cùng chẳng ai có thể ngăn cản được sự tốt lành, thỏa mãn được tâm nguyện đoàn tụ sau ba năm xa cách.",
        "explanation": "Tình cảm chân thành bị kẻ xấu ngăn cản nhất thời; kiên trì giữ trọn niềm tin cuối cùng cũng gặt hái quả ngọt viên mãn."
      },
      {
        "line": 6,
        "lineName": "Thượng Cửu",
        "xiangOriginal": "Tượng viết: Kỳ vũ khả dụng vi nghi cát, bất khả loạn dã.",
        "xiangMeaning": "Lông chim nhạn rụng xuống có thể dùng làm đồ trang sức nghi lễ tôn quý tốt lành, không ai có thể làm rối loạn phẩm hạnh thanh cao ấy.",
        "explanation": "Đạt đến cảnh giới cao đẹp thoát tục; nhân cách sáng ngời để lại tấm gương mẫu mực cho muôn đời noi theo."
      }
    ]
  },
  "54": {
    "number": 54,
    "name": "Lôi Trạch Quy Muội",
    "vietnameseName": "Quy Muội (Gả em gái, chớ để cảm xúc lấn át lý trí)",
    "daxiang": {
      "original": "Trạch thượng hữu lôi, Quy Muội; quân tử dĩ vĩnh chung tri tệ.",
      "meaning": "Trên mặt đầm nước có tiếng sấm sét xao động là quẻ Quy Muội; người quân tử noi theo đó mà suy nghĩ đến kết cục lâu dài về sau, để thấu hiểu và phòng ngừa những sai lầm tệ hại từ lúc đầu.",
      "explanation": "Sấm rung động mặt đầm làm nước xao xuyến, tượng trưng cho tình cảm bồng bột si mê của tuổi trẻ. 'Quy muội' là gả gái trẻ về nhà chồng. Nếu kết hợp chỉ vì đam mê cảm xúc nhất thời mà thiếu sự cân nhắc lý trí lễ nghi thì kết cục ắt sinh bẽ bàng dở dang. Phải nhìn xa trông rộng đến cái kết để phòng ngừa tệ nạn."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Cửu",
        "xiangOriginal": "Tượng viết: Quy muội dĩ đễ, dĩ hằng dã. Bả năng lý cát, tương thừa dã.",
        "xiangMeaning": "Lấy thân phận em gái theo nàng dâu về nhà chồng, giữ lòng bền bỉ thường hằng. Người thọt chân vẫn có thể bước đi được, nhờ có sự giúp đỡ nương tựa lẫn nhau.",
        "explanation": "Ở vị trí phụ thuộc khiêm tốn biết an phận thủ thường, nhẫn nhịn giúp đỡ người khác thì giữ được bình an."
      },
      {
        "line": 2,
        "lineName": "Cửu Nhị",
        "xiangOriginal": "Tượng viết: Lợi u nhân chi trinh, vị biến thường dã.",
        "xiangMeaning": "Người ẩn dật giữ đạo chính thì có lợi, nhờ tấm lòng son sắt chưa từng biến đổi điều thường hằng.",
        "explanation": "Người bạn đời hoặc thuộc cấp chí tình dù chịu cảnh cô đơn quạnh quẽ vẫn một lòng thủy chung giữ trọn phẩm giá."
      },
      {
        "line": 3,
        "lineName": "Lục Tam",
        "xiangOriginal": "Tượng viết: Quy muội dĩ tu, vị đương dã.",
        "xiangMeaning": "Gả gái mà hạ mình làm nàng hầu thiếp, vì ở vào ngôi vị không thích đáng.",
        "explanation": "Quá ham muốn vội vàng hạ thấp phẩm giá của mình để cầu cạnh danh lợi; tự chuốc lấy sự khinh miệt rẻ rúng."
      },
      {
        "line": 4,
        "lineName": "Cửu Tứ",
        "xiangOriginal": "Tượng viết: Khiên kỳ chi chí, hữu đãi nhi hành dã.",
        "xiangMeaning": "Ý chí hoãn lại ngày cưới gả, là để chờ đợi đối tượng chân chính xứng đáng rồi mới xuất giá.",
        "explanation": "Thà muộn màng chờ đợi người tri kỷ xứng đáng, chứ không chịu nhắm mắt đưa chân bừa bãi; quyết định sáng suốt."
      },
      {
        "line": 5,
        "lineName": "Lục Ngũ",
        "xiangOriginal": "Tượng viết: Đế Ất quy muội, bất như kỳ đễ chi quần lương dã. Kỳ vị tại trung, dĩ quý hành dã.",
        "xiangMeaning": "Vua Đế Ất gả công chúa mà áo cưới không lộng lẫy bằng áo nàng hầu, ngôi vị ở nơi trung chính, lấy phẩm hạnh quý báu nội tâm mà hành xử.",
        "explanation": "Người có địa vị cao sang quý phái nhưng nếp sống giản dị khiêm nhường; lấy đức hạnh làm gốc được người người kính trọng."
      },
      {
        "line": 6,
        "lineName": "Thượng Lục",
        "xiangOriginal": "Tượng viết: Thượng lục vô thực, thừa hư khuông dã.",
        "xiangMeaning": "Hào Thượng Lục chẳng có thực chất bên trong, chỉ bưng chiếc giỏ hoa quả trống rỗng dâng lễ tế.",
        "explanation": "Hôn nhân hay hợp tác chỉ có hình thức bề ngoài mà thiếu vắng tình cảm thực tâm; sớm muộn cũng tan vỡ bẽ bàng."
      }
    ]
  },
  "55": {
    "number": 55,
    "name": "Lôi Hỏa Phong",
    "vietnameseName": "Phong (Phong phú tột bực, sấm chớp sáng lòa)",
    "daxiang": {
      "original": "Lôi điện giai chí, Phong; quân tử dĩ chiết ngục trí hình.",
      "meaning": "Sấm sét và ánh chớp cùng ập tới sáng lòa uy nghiêm là quẻ Phong; người quân tử noi theo đó mà phân xử các vụ án ngục công minh dứt khoát, thi hành hình phạt đích đáng.",
      "explanation": "Ánh chớp soi tỏ mọi u uất khuất tất, tiếng sấm nổ vang răn đe kẻ gian tà. 'Phong' là phong phú, thịnh vượng tột bậc như mặt trời giữa ban trưa. Thịnh cực ắt suy, như mặt trời đứng bóng rồi xế chiều. Người nắm quyền lực tối thượng phải dùng trí tuệ sáng suốt và sự nghiêm minh để duy trì công lý xã hội."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Cửu",
        "xiangOriginal": "Tượng viết: Tuy tuần vô cữu, quá tuần tai dã.",
        "xiangMeaning": "Gặp được bạn hiền tương xứng mười ngày thì không lỗi, nếu vượt quá thời hạn ấy ắt chuốc lấy tai vạ dèm pha.",
        "explanation": "Gặp gỡ hợp tác cùng bạn hữu môn đăng hộ đối; giữ chừng mực đúng lúc thì sự nghiệp phát triển vững bền."
      },
      {
        "line": 2,
        "lineName": "Lục Nhị",
        "xiangOriginal": "Tượng viết: Hữu phu phát nhược, tín dĩ phát chí dã.",
        "xiangMeaning": "Có lòng chí thành cảm hóa lòng người, lấy đức tín phát huy ý chí mở rộng tấm lòng.",
        "explanation": "Bị hoàn cảnh che mắt như rèm che ban trưa thấy sao Bắc Đẩu; giữ trọn tấm lòng chí thành rồi sự thật cũng sáng tỏ."
      },
      {
        "line": 3,
        "lineName": "Cửu Tam",
        "xiangOriginal": "Tượng viết: Phong kỳ bái, bất khả đại sự dã. Chiết kỳ hữu quăng, chung bất khả dụng dã.",
        "xiangMeaning": "Rèm che quá dày giữa ban trưa thấy sao nhỏ, không thể làm nên đại sự. Gãy mất cánh tay phải đắc lực, cuối cùng chẳng thể dùng vào việc gì.",
        "explanation": "Mất đi người phụ tá đắc lực, hoàn cảnh tối tăm trói buộc; lúc này đành nhẫn nại lui về dưỡng sức."
      },
      {
        "line": 4,
        "lineName": "Cửu Tứ",
        "xiangOriginal": "Tượng viết: Phong kỳ bộ, vị bất đáng dã. Nhật trung kiến đẩu, u bất minh dã. Ngộ kỳ di chủ cát, hành dã.",
        "xiangMeaning": "Màn che tối tăm vì ở vào ngôi vị không thích đáng. Giữa trưa thấy sao Bắc Đẩu vì mờ tối chưa sáng sủa. Gặp được người chủ bình đẳng tốt lành, tiến bước hành động thuận lợi.",
        "explanation": "Thoát khỏi màn đêm tăm tối gặp được đồng minh tri kỷ cùng chí hướng; cùng nhau tiến lên làm nên nghiệp lớn."
      },
      {
        "line": 5,
        "lineName": "Lục Ngũ",
        "xiangOriginal": "Tượng viết: Lục ngũ chi cát, hữu khánh lai dã.",
        "xiangMeaning": "Sự tốt lành của hào Lục Ngũ thu nạp được bậc hiền tài, ắt có phúc khánh và danh tiếng vẻ vang đưa tới.",
        "explanation": "Lãnh đạo biết hạ mình cầu hiền, lắng nghe lời can gián của người tài đức; đất nước phồn vinh thái bình thịnh trị."
      },
      {
        "line": 6,
        "lineName": "Thượng Lục",
        "xiangOriginal": "Tượng viết: Phong kỳ ốc, thiên tế tường dã. Khuy kỳ hộ khánh kỳ vô nhân, tự tàng dã.",
        "xiangMeaning": "Làm nhà quá to lớn như muốn bay lượn trên chân trời. Nhìn trộm qua khe cửa vắng lặng chẳng thấy bóng người, vì tự cô lập giấu mình xa lánh muôn dân.",
        "explanation": "Kiêu ngạo xa hoa xây lâu đài biệt lập tự mãn; kết cục là bị mọi người quay lưng xa lánh, cô độc quạnh quẽ trong túp lều hoang tàn."
      }
    ]
  },
  "56": {
    "number": 56,
    "name": "Hỏa Sơn Lữ",
    "vietnameseName": "Lữ (Lữ khách tha hương, bôn ba lưu lạc)",
    "daxiang": {
      "original": "Sơn thượng hữu hỏa, Lữ; quân tử dĩ minh thận dụng hình, nhi bất lưu ngục.",
      "meaning": "Trên núi có ngọn lửa cháy lan mau lẹ rồi dời đi nơi khác là quẻ Lữ; người quân tử noi theo đó mà sáng suốt thận trọng khi áp dụng hình phạt, không bao giờ dây dưa kéo dài việc ngục tù giam giữ.",
      "explanation": "Lửa cháy trên núi bốc lên cao rồi theo gió dời đi không ở yên một chỗ, tượng trưng cho thân phận người lữ khách xa quê lưu lạc nơi đất khách quê người. Ở nơi xứ lạ người ta phải khiêm nhường, cẩn trọng lời ăn tiếng nói, tuân thủ pháp luật sở tại, giải quyết mọi việc mau chóng dứt khoát không dây dưa."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Lục",
        "xiangOriginal": "Tượng viết: Lữ tỏa tỏa, chí cùng lận tai dã.",
        "xiangMeaning": "Người lữ khách vụn vặt so đo từng chút lợi nhỏ, ý chí cùng quẫn chuốc lấy tai họa khinh ghét.",
        "explanation": "Ở nơi đất khách quê người mà tính tình bủn xỉn hẹp hòi; tự chuốc lấy sự khinh bỉ và tai họa vào thân."
      },
      {
        "line": 2,
        "lineName": "Lục Nhị",
        "xiangOriginal": "Tượng viết: Đắc đồng bộc trinh, chung vô vưu dã.",
        "xiangMeaning": "Đến quán trọ ấm êm, có tiền của giắt lưng và tìm được tôi tớ trung thành, cuối cùng không có điều gì oán trách lỗi lầm.",
        "explanation": "Biết cách đối nhân xử thế ôn hòa nhã nhặn; được người bản xứ giúp đỡ, có chỗ trú chân an toàn thuận lợi."
      },
      {
        "line": 3,
        "lineName": "Cửu Tam",
        "xiangOriginal": "Tượng viết: Lữ phần kỳ thứ, diệc dĩ thương hĩ. Dĩ lữ dữ hạ, kỳ nghĩa táng dã.",
        "xiangMeaning": "Người khách lữ hành làm cháy rụi quán trọ, tự mình làm tổn thương mình. Đang cảnh tha hương mà đối xử bạo ngược với kẻ dưới, theo đạo nghĩa đã đánh mất tất cả.",
        "explanation": "Tha hương mà tính tình hống hách coi thường cấp dưới; tự thiêu rụi chỗ nương thân, lâm vào cảnh bơ vơ nguy khốn."
      },
      {
        "line": 4,
        "lineName": "Cửu Tứ",
        "xiangOriginal": "Tượng viết: Lữ vu xử, vị đắc vị dã. Đắc kỳ tư phủ, tâm vị khoái dã.",
        "xiangMeaning": "Khách lữ hành tạm có chỗ nghỉ chân, nhưng chưa thật đắc được ngôi vị an ổn. Dù có được tiền tài rìu búa phòng thân, trong lòng vẫn chưa thật vui sướng thỏa mãn.",
        "explanation": "Có được công việc và thu nhập tạm bợ nơi xứ người nhưng lòng luôn canh cánh nhớ về quê hương bản quán."
      },
      {
        "line": 5,
        "lineName": "Lục Ngũ",
        "xiangOriginal": "Tượng viết: Chung dĩ dự mệnh, thượng đãi dã.",
        "xiangMeaning": "Bắn rơi một con chim trĩ mất một mũi tên nhưng cuối cùng được khen ngợi ban thưởng chức tước, được người bề trên trọng đãi.",
        "explanation": "Dùng tài năng và sự khiêm tốn khéo léo hòa nhập với xã hội mới; được chính quyền sở tại tin dùng ban tặng danh thơm."
      },
      {
        "line": 6,
        "lineName": "Thượng Cửu",
        "xiangOriginal": "Tượng viết: Dĩ lữ tại thượng, kỳ nghĩa phần dã. Táng ngưu vu dịch, chung mạc chi văn dã.",
        "xiangMeaning": "Làm khách tha hương ở ngôi cao chót vót mà kiêu căng, theo đạo lý tất bị thiêu rụi tổ ấm. Làm mất bò một cách dễ dàng, cuối cùng chẳng còn ai thèm nghe lời hay đoái hoài giúp đỡ.",
        "explanation": "Được chút thành công nơi xứ người mà kiêu ngạo lộng quyền; kết cục tổ ấm bị hủy hoại, bơ vơ trắng tay không chốn nương thân."
      }
    ]
  },
  "57": {
    "number": 57,
    "name": "Thuần Tốn",
    "vietnameseName": "Tốn Vi Phong (Gió thoảng thấu nhập, khiêm tốn nhu thuận)",
    "daxiang": {
      "original": "Tùy phong, Tốn; quân tử dĩ thân mệnh hành sự.",
      "meaning": "Gió này nối tiếp gió kia thổi không ngừng thấu nhập muôn nơi là quẻ Tốn; người quân tử noi theo đó mà nhiều lần nhắc lại mệnh lệnh giáo hóa, kiên trì thi hành mọi công việc.",
      "explanation": "Hai cơn gió hòa quyện thổi luồn lách qua mọi ngõ ngách khe hẹp, không gì là không thấu suốt. 'Tốn' là khiêm nhường, nhu thuận, thâm nhập tinh tế. Người lãnh đạo muốn mệnh lệnh thấm nhuần vào tâm trí dân chúng thì không thể dùng mệnh lệnh hành chính thô bạo một lần, mà phải kiên nhẫn tuyên truyền giáo dục nhiều lần như gió thoảng."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Lục",
        "xiangOriginal": "Tượng viết: Tiến thoái, chí nghi dã. Lợi vũ nhân chi trinh, chí trị dã.",
        "xiangMeaning": "Tiến thoái ngập ngừng do dự, vì ý chí còn nghi ngại dao động. Có lợi khi giữ lòng kiên định quả cảm như người lính dũng cảm, để ý chí được rèn giũa vững vàng.",
        "explanation": "Tính tình nhu nhược do dự không dám quyết định; cần rèn luyện ý chí quả cảm, dứt khoát hành động để nắm bắt thời cơ."
      },
      {
        "line": 2,
        "lineName": "Cửu Nhị",
        "xiangOriginal": "Tượng viết: Phân phân chi cát, đắc trung dã.",
        "xiangMeaning": "Cầu cúng thầy bói thần linh nhiều lần được tốt lành, nhờ giữ được đạo trung dung chân thành.",
        "explanation": "Thành tâm cầu người hiền tài và lắng nghe lời khuyên răn thấu đáo; làm sáng tỏ mọi nghi ngờ khuất tất."
      },
      {
        "line": 3,
        "lineName": "Cửu Tam",
        "xiangOriginal": "Tượng viết: Tần tốn chi lận, chí cùng dã.",
        "xiangMeaning": "Nhiều lần nhún nhường quỳ gối quá mức chuốc lấy xấu hổ, ý chí cùng quẫn thiếu tự trọng.",
        "explanation": "Nhún nhường thái quá biến thành luồn cúi đê hèn; mất hết nhân cách và sự tôn trọng của người đời."
      },
      {
        "line": 4,
        "lineName": "Lục Tứ",
        "xiangOriginal": "Tượng viết: Điền hoạch tam phẩm, hữu công dã.",
        "xiangMeaning": "Đi săn bắt được ba loại muông thú lớn, lập nên công trạng vẻ vang.",
        "explanation": "Khéo léo dung hòa giữa cấp trên và cấp dưới; công việc thành tựu xuất sắc, được ban thưởng xứng đáng."
      },
      {
        "line": 5,
        "lineName": "Cửu Ngũ",
        "xiangOriginal": "Tượng viết: Cửu ngũ chi cát, vị chính trung dã.",
        "xiangMeaning": "Sự tốt lành của hào Cửu Ngũ sửa đổi mệnh lệnh chu đáo trước sau ba ngày, nhờ ở vào ngôi vị chính trung tôn quý.",
        "explanation": "Ban hành chính sách cải cách phải cân nhắc trước sau kỹ lưỡng; lãnh đạo sáng suốt đem lại thịnh trị."
      },
      {
        "line": 6,
        "lineName": "Thượng Cửu",
        "xiangOriginal": "Tượng viết: Tốn tại sàng hạ, thượng cùng dã. Táng kỳ tư phủ, chính hung dã.",
        "xiangMeaning": "Nhún nhường bò núp dưới gầm giường, ở ngôi trên cùng mà suy sụp cùng cực. Mất cả tiền tài và rìu búa phòng thân, thực sự là gặp hung họa.",
        "explanation": "Nhu nhược hèn nhát đến mức trốn chui trốn lủi dưới gầm giường; đánh mất hết năng lực tự vệ ắt chuốc lấy diệt vong."
      }
    ]
  },
  "58": {
    "number": 58,
    "name": "Thuần Đoài",
    "vietnameseName": "Đoài Vi Trạch (Đầm hồ hỷ lạc, niềm vui chân chính)",
    "daxiang": {
      "original": "Lệ trạch, Đoài; quân tử dĩ bằng hữu giảng tập.",
      "meaning": "Hai đầm nước liền kề nhau cùng trao đổi nguồn nước thấm nhuần là quẻ Đoài; người quân tử noi theo đó mà cùng bạn bè tụ họp giảng giải sách vở, thực hành đạo lý làm người.",
      "explanation": "Đầm nước này tiếp nước cho đầm nước kia không bao giờ cạn kiệt, cỏ hoa đôi bờ xanh tươi mơn mởn. 'Đoài' là niềm vui sướng hỷ lạc, hòa duyệt. Niềm vui chân chính thanh cao nhất của người quân tử là có bạn bè tri kỷ cùng nhau học tập đàm đạo, trao đổi kiến thức, hoàn thiện nhân cách lẫn nhau."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Cửu",
        "xiangOriginal": "Tượng viết: Hòa đoài chi cát, hành vị nghi dã.",
        "xiangMeaning": "Niềm vui hòa nhã thanh thản tốt lành, hành động chưa hề vướng bận chút nghi ngờ vụ lợi nào.",
        "explanation": "Giữ tâm hồn trong sáng hòa nhã với mọi người; niềm vui thuần khiết không toan tính đem lại bình an."
      },
      {
        "line": 2,
        "lineName": "Cửu Nhị",
        "xiangOriginal": "Tượng viết: Phu đoài chi cát, tín chí dã.",
        "xiangMeaning": "Niềm vui chân thành tin cậy tốt lành hối hận tiêu tan, nhờ có niềm tin kiên định vào ý chí chính đạo.",
        "explanation": "Gắn kết bạn bè bằng sự thành thực tin cậy lẫn nhau; không sa đà vào những trò vui trụy lạc tầm thường."
      },
      {
        "line": 3,
        "lineName": "Lục Tam",
        "xiangOriginal": "Tượng viết: Lai đoài chi hung, vị bất đáng dã.",
        "xiangMeaning": "Chạy vạy nài nỉ cầu xin niềm vui gặp hung, vì ở vào ngôi vị không thích đáng.",
        "explanation": "Ham muốn khoái lạc mù quáng buông thả chạy theo cám dỗ bên ngoài; tự rước lấy nhục nhã và tai họa."
      },
      {
        "line": 4,
        "lineName": "Cửu Tứ",
        "xiangOriginal": "Tượng viết: Cửu tứ chi cát, hữu khánh dã.",
        "xiangMeaning": "Hào Cửu Tứ toan tính cân nhắc chọn lựa niềm vui thanh cao mà tránh xa thói xấu thì tốt lành, đem lại phúc khánh hân hoan.",
        "explanation": "Đứng trước ngã ba đường biết cân nhắc dứt khoát rời bỏ bạn xấu để tìm đến người có đức; chuyển nguy thành phúc."
      },
      {
        "line": 5,
        "lineName": "Cửu Ngũ",
        "xiangOriginal": "Tượng viết: Phu vu bộc, vị bất đáng dã.",
        "xiangMeaning": "Tin cậy vào kẻ tiểu nhân đang làm xói mòn đạo đức thì nguy hiểm, vì ngôi vị tuy cao nhưng đặt niềm tin sai chỗ.",
        "explanation": "Lãnh đạo tin dùng kẻ nịnh bợ gian tà làm hỏng kỷ cương; phải mau chóng tỉnh ngộ trừ khử kẻ xấu."
      },
      {
        "line": 6,
        "lineName": "Thượng Lục",
        "xiangOriginal": "Tượng viết: Dẫn đoài, vị quang dã.",
        "xiangMeaning": "Dẫn dụ lôi kéo nhau vào trò vui hưởng lạc, đạo đức chưa thực sự quang minh sáng sủa.",
        "explanation": "Dùng chiêu trò mua vui lôi kéo người khác sa đà phóng túng; niềm vui hời hợt không có kết cục tốt đẹp."
      }
    ]
  },
  "59": {
    "number": 59,
    "name": "Phong Thủy Hoán",
    "vietnameseName": "Hoán (Gió thổi tan băng tuyết, giải tỏa chia rẽ)",
    "daxiang": {
      "original": "Phong hành thủy thượng, Hoán; tiên vương dĩ hưởng vu đế, lập miếu.",
      "meaning": "Gió mùa xuân ấm áp thổi trên mặt nước làm tan chảy băng giá là quẻ Hoán; các bậc tiên vương noi theo đó mà tế lễ Thượng đế, lập nên đền miếu tổ tiên để quy tụ lòng dân.",
      "explanation": "Gió thổi trên làn nước làm tan biến giá lạnh, xua đi những đợt sóng ngầm ngăn cách. 'Hoán' là phân tán, giải tỏa bế tắc, hàn gắn chia rẽ. Khi nội bộ xã hội nảy sinh phân hóa, người lãnh đạo dùng tín ngưỡng thiêng liêng, đền miếu đạo đức tâm linh để gắn kết muôn triệu con tim đồng lòng quy tụ về một cội nguồn."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Lục",
        "xiangOriginal": "Tượng viết: Sơ lục chi cát, thuận dã.",
        "xiangMeaning": "Sự tốt lành của hào Sơ Lục dùng ngựa khỏe cứu thoát gian nan, nhờ biết hành sự nhu thuận theo thời thế.",
        "explanation": "Vừa mới xuất hiện mầm mống chia rẽ đã mau chóng nhờ cậy quý nhân giải tỏa kịp thời; biến nguy thành an."
      },
      {
        "line": 2,
        "lineName": "Cửu Nhị",
        "xiangOriginal": "Tượng viết: Hoán bôn kỳ cơ, đắc nguyện dã.",
        "xiangMeaning": "Lúc ly tán mau chóng chạy về chỗ dựa vững chắc nương tựa, thỏa mãn được tâm nguyện bình yên.",
        "explanation": "Giữa cơn bão táp phân tán biết tìm về nương tựa nơi an toàn vững chắc; giữ được tâm định tĩnh vượt qua khó khăn."
      },
      {
        "line": 3,
        "lineName": "Lục Tam",
        "xiangOriginal": "Tượng viết: Hoán kỳ cung, chí tại ngoại dã.",
        "xiangMeaning": "Quên đi thân mình mà hy sinh vì việc chung không chút ân hận, vì ý chí hướng về lợi ích đại chúng bên ngoài.",
        "explanation": "Quên đi cái tôi vị kỷ cá nhân, dấn thân cứu giúp cộng đồng; hành động nghĩa hiệp được muôn người kính phục."
      },
      {
        "line": 4,
        "lineName": "Lục Tứ",
        "xiangOriginal": "Tượng viết: Hoán kỳ quần nguyên cát, quang đại dã.",
        "xiangMeaning": "Giải tán bè phái cục bộ nhỏ hẹp để đạt điều đại cát, tấm lòng và sự nghiệp quang minh rộng lớn vô cùng.",
        "explanation": "Xóa bỏ tư tưởng địa phương bè phái hẹp hòi, quy tụ đại đoàn kết toàn dân tộc; lập nên công trạng vĩ đại."
      },
      {
        "line": 5,
        "lineName": "Cửu Ngũ",
        "xiangOriginal": "Tượng viết: Vương cư vô cữu, chính vị dã.",
        "xiangMeaning": "Vua ban bố hiệu lệnh lớn giải tán kho tàng cứu đói cho muôn dân thì không lỗi, nhờ ở vào ngôi vị trung chính cao quý.",
        "explanation": "Lãnh đạo mở kho cứu trợ nhân dân lúc nguy khốn; hiệu lệnh nhân từ cảm hóa hàng triệu con tim hướng về triều đình."
      },
      {
        "line": 6,
        "lineName": "Thượng Cửu",
        "xiangOriginal": "Tượng viết: Hoán kỳ huyết, viễn hại dã.",
        "xiangMeaning": "Giải tỏa được mối hiểm họa đổ máu tai ương, tránh xa được hiểm họa tổn hại thân thể.",
        "explanation": "Khéo léo hòa giải thoát khỏi cuộc xung đột đẫm máu; hóa thù thành bạn, bảo toàn sinh mạng cho mọi người."
      }
    ]
  },
  "60": {
    "number": 60,
    "name": "Thủy Trạch Tiết",
    "vietnameseName": "Tiết (Tiết độ chừng mực, đầm giữ nước có chừng)",
    "daxiang": {
      "original": "Trạch thượng hữu thủy, Tiết; quân tử dĩ chế số độ, nghị đức hạnh.",
      "meaning": "Đầm nước chứa đựng nước có dung lượng giới hạn chừng mực là quẻ Tiết; người quân tử noi theo đó mà chế định ra quy chuẩn chế độ đo lường, bàn định chuẩn mực đức hạnh hành vi.",
      "explanation": "Đầm nước nếu không có bờ ngăn thì nước sẽ tràn lan ngập lụt, cạn kiệt thì khô hạn; bờ đầm điều tiết lượng nước vừa vặn. 'Tiết' là tiết chế, chừng mực, kỷ cương quy củ. Sống ở đời ăn uống phải tiết độ, chi tiêu phải có kế hoạch, dục vọng phải được kiềm chế, luật pháp xã hội phải có khung khổ chuẩn mực rõ ràng."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Cửu",
        "xiangOriginal": "Tượng viết: Bất xuất hộ đình, tri thông tắc dã.",
        "xiangMeaning": "Không bước chân ra khỏi sân nhà thì không lỗi, vì thấu hiểu thời nào nên thông suốt thời nào nên bế tắc để dừng lại.",
        "explanation": "Biết thời thế chưa thuận thì ở yên trong nhà giữ mình cẩn trọng; không manh động tránh được mọi phiền toái."
      },
      {
        "line": 2,
        "lineName": "Cửu Nhị",
        "xiangOriginal": "Tượng viết: Bất xuất môn đình hung, thất thời cực dã.",
        "xiangMeaning": "Thời cơ hành động đã đến mà vẫn cố chấp không chịu bước ra khỏi cổng ngõ ắt gặp hung, vì đã bỏ lỡ thời cơ tột bực.",
        "explanation": "Thời thế đã thuận buồm xuôi gió mà chần chừ do dự không dám hành động; bỏ lỡ thời cơ quý báu ắt chuốc lấy tiếc nuối thất bại."
      },
      {
        "line": 3,
        "lineName": "Lục Tam",
        "xiangOriginal": "Tượng viết: Bất tiết chi ta, hựu thùy cữu dã.",
        "xiangMeaning": "Không biết giữ tiết độ chừng mực mà phải than khóc xót xa, còn trách cứ ai được nữa ngoài chính bản thân mình.",
        "explanation": "Sống buông thả phóng túng không biết điểm dừng; khi chuốc lấy hậu quả phá sản bẽ bàng thì chẳng thể đổ lỗi cho ai."
      },
      {
        "line": 4,
        "lineName": "Lục Tứ",
        "xiangOriginal": "Tượng viết: An tiết chi cát, thừa thượng đạo dã.",
        "xiangMeaning": "Thanh thản yên vui giữ nếp sống tiết độ thì tốt lành, nhờ biết thuận theo con đường đạo lý của bậc bề trên.",
        "explanation": "Xem việc tiết kiệm giản dị là niềm vui tự nhiên chứ không phải sự ép uổng khổ sở; cuộc sống nhẹ nhàng bình an."
      },
      {
        "line": 5,
        "lineName": "Cửu Ngũ",
        "xiangOriginal": "Tượng viết: Cam tiết chi cát, cư vị trung dã.",
        "xiangMeaning": "Tiết độ ngọt ngào êm ái tốt lành tiến bước có công trạng, nhờ ở vào ngôi vị trung chính thích đáng.",
        "explanation": "Bậc cầm quyền thi hành chính sách tiết kiệm kỷ cương nhưng hợp lòng dân; bản thân làm gương sáng cho muôn người noi theo."
      },
      {
        "line": 6,
        "lineName": "Thượng Lục",
        "xiangOriginal": "Tượng viết: Khổ tiết trinh hung, kỳ đạo cùng dã.",
        "xiangMeaning": "Tiết độ hà khắc quá mức làm khổ sở bản thân và người khác dẫu bền lòng cũng gặp hung, con đường ấy ắt dẫn tới bước đường cùng bế tắc.",
        "explanation": "Kỷ luật quá khắt khe bủn xỉn làm ngột ngạt cuộc sống; cái gì thái quá cũng sinh họa, cần biết linh hoạt điều độ."
      }
    ]
  },
  "61": {
    "number": 61,
    "name": "Phong Trạch Trung Phu",
    "vietnameseName": "Trung Phu (Lòng thành tín ở trong tâm, cảm hóa muôn loài)",
    "daxiang": {
      "original": "Trạch thượng hữu phong, Trung Phu; quân tử dĩ nghị ngục hoãn tử.",
      "meaning": "Gió thổi lướt trên mặt đầm nước làm rung động từng làn sóng từ tận đáy sâu là quẻ Trung Phu; người quân tử noi theo đó mà bàn thảo việc ngục hình công tâm, khoan dung hoãn án tử hình để cứu người.",
      "explanation": "Hình quẻ ở giữa rỗng (hai hào âm) ngoài đặc (bốn hào dương), như lòng dạ trống không không tì vết, chân thành tuyệt đối. 'Trung phu' là đức tin và sự thành tín xuất phát từ tận đáy lòng. Lòng thành tín có thể cảm hóa được cả loài heo cá vô tri; người cầm cân nảy mực lấy lòng nhân ái xem xét cẩn trọng sinh mạng con người."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Cửu",
        "xiangOriginal": "Tượng viết: Sơ cửu ngu cát, chí vị biến dã.",
        "xiangMeaning": "Hào Sơ Cửu cẩn trọng chuẩn bị từ trước thì tốt lành, vì ý chí thành tín chưa bị ngoại cảnh làm biến đổi.",
        "explanation": "Giữ trọn sự thành thực ngay từ bước khởi đầu; tâm hồn thuần khiết không vướng bận toan tính vụ lợi."
      },
      {
        "line": 2,
        "lineName": "Cửu Nhị",
        "xiangOriginal": "Tượng viết: Kỳ tử hòa chi, tâm tâm nguyện dã.",
        "xiangMeaning": "Hạc kêu trong bóng râm con của nó hót họa theo, chén rượu ngon cùng chia sẻ, từ tận đáy lòng tự nguyện gắn kết đồng điệu.",
        "explanation": "Đức thành tín tự nhiên lan tỏa lay động lòng người; gặp được bạn bè tri kỷ cùng chí hướng gắn bó keo sơn."
      },
      {
        "line": 3,
        "lineName": "Lục Tam",
        "xiangOriginal": "Tượng viết: Hoặc cổ hoặc bãi, vị bất đáng dã.",
        "xiangMeaning": "Lúc thì đánh trống hăng hái lúc thì buông xuôi mệt mỏi, vì ở vào ngôi vị bất xứng thiếu sự tự chủ vững vàng.",
        "explanation": "Cảm xúc thất thường phụ thuộc vào thái độ của người khác; thiếu sự tự tin và lòng chân thành kiên định."
      },
      {
        "line": 4,
        "lineName": "Lục Tứ",
        "xiangOriginal": "Tượng viết: Mã thất vong, tuyệt loại thượng dã.",
        "xiangMeaning": "Ngựa kéo xe rời bỏ đôi bạn cùng đàn để hướng lên theo bậc trên, dứt bỏ bè phái thiên lệch để theo về chính đạo.",
        "explanation": "Dũng cảm từ bỏ những quan hệ phe nhóm hẹp hòi; một lòng trung thành phụng sự lý tưởng cao đẹp."
      },
      {
        "line": 5,
        "lineName": "Cửu Ngũ",
        "xiangOriginal": "Tượng viết: Hữu phu loan như, vị chính đương dã.",
        "xiangMeaning": "Có lòng chí thành gắn kết mọi người khăng khít không rời, nhờ ở vào ngôi vị trung chính chí tôn thích đáng.",
        "explanation": "Lấy chữ Tín làm đầu trong quản trị lãnh đạo; được cấp dưới và nhân dân hết lòng tin tưởng phụng sự."
      },
      {
        "line": 6,
        "lineName": "Thượng Cửu",
        "xiangOriginal": "Tượng viết: Hàn âm đăng vu thiên, hà khả trường dã.",
        "xiangMeaning": "Tiếng gà gáy bay bổng tận trời xanh chỉ là tiếng kêu rỗng tuếch hão huyền, cảnh ngộ giả tạo ấy sao có thể lâu dài được.",
        "explanation": "Nói nhiều làm ít, khoe khoang lời hứa sáo rỗng giả tạo; mất hết uy tín ắt chuốc lấy thất bại bẽ bàng."
      }
    ]
  },
  "62": {
    "number": 62,
    "name": "Lôi Sơn Tiểu Quá",
    "vietnameseName": "Tiểu Quá (Vượt mức chút ít, chim bay chớ lên cao)",
    "daxiang": {
      "original": "Sơn thượng hữu lôi, Tiểu Quá; quân tử dĩ hành quá hồ cung, tang quá hồ ai, dụng quá hồ kiệm.",
      "meaning": "Trên đỉnh núi cao có tiếng sấm sét nổ vang gần sát là quẻ Tiểu Quá; người quân tử noi theo đó mà hành động có thể vượt mức một chút về sự khiêm cung, tang lễ có thể vượt mức một chút về sự đau buồn xót thương, chi dùng có thể vượt mức một chút về sự tiết kiệm giản dị.",
      "explanation": "Hai hào dương ở giữa bị bốn hào âm ở ngoài bao bọc, hình như con chim đang dang cánh bay. 'Tiểu quá' là vượt qua chút ít trong những việc nhỏ. Trong những đức tính tốt, thà khiêm cung hơn một chút, đau xót hơn một chút, tiết kiệm hơn một chút thì không có hại gì mà còn giữ gìn được thuần phong mỹ tục."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Lục",
        "xiangOriginal": "Tượng viết: Phi điểu dĩ hung, bất khả vi dã.",
        "xiangMeaning": "Chim non chưa đủ lông cánh mà cố bay cao ắt gặp hung họa, làm sao có thể cứu vãn được.",
        "explanation": "Tài năng còn non kém chớ vội đua đòi làm việc vượt quá sức mình; cố đấm ăn xôi chỉ rước lấy tai họa gãy cánh."
      },
      {
        "line": 2,
        "lineName": "Lục Nhị",
        "xiangOriginal": "Tượng viết: Can quá kỳ tổ, bất khả quá dã.",
        "xiangMeaning": "Bước qua ông nội để gặp bà nội, đến phụng sự bề trên chứ không được vượt quyền quá mức.",
        "explanation": "Biết giữ chừng mực đúng phận phận cấp dưới; làm việc cẩn trọng mềm mỏng không vượt quyền lãnh đạo."
      },
      {
        "line": 3,
        "lineName": "Cửu Tam",
        "xiangOriginal": "Tượng viết: Tòng hoặc tường chi, hung như hà dã.",
        "xiangMeaning": "Chẳng chịu phòng ngừa để kẻ xấu theo sau sát hại, tai họa hung hiểm biết dường nào.",
        "explanation": "Quá tự tin chủ quan mất cảnh giác; bị kẻ tiểu nhân đâm sau lưng rơi vào tình thế hiểm nghèo."
      },
      {
        "line": 4,
        "lineName": "Cửu Tứ",
        "xiangOriginal": "Tượng viết: Phất quá ngộ chi, vị bất đáng dã. Vãng lệ tất giới, chung bất khả trường dã.",
        "xiangMeaning": "Chẳng dám vượt quá mà gặp gỡ người trên, vì ở vào ngôi vị không thật thích đáng. Tiến tới thì nguy hiểm phải cảnh giác răn mình, chẳng thể kéo dài mãi sự cứng nhắc.",
        "explanation": "Ở vị trí nhạy cảm phải hết sức thận trọng nhún nhường; tuyệt đối không manh động hiếu chiến."
      },
      {
        "line": 5,
        "lineName": "Lục Ngũ",
        "xiangOriginal": "Tượng viết: Mật vân bất vũ, dĩ thượng dã.",
        "xiangMeaning": "Mây dày đặc mà chưa mưa vì khí dương đã lên quá cao, bắn mũi tên có dây lấy được con mồi trong hang sâu.",
        "explanation": "Tài lực chưa đủ để làm việc lớn bao quát, nhưng đủ khéo léo để thu phục nhân tài giải quyết việc cụ thể cục bộ."
      },
      {
        "line": 6,
        "lineName": "Thượng Lục",
        "xiangOriginal": "Tượng viết: Phất ngộ quá chi, dĩ kháng dã.",
        "xiangMeaning": "Chẳng gặp gỡ ai mà cứ cố bay vượt lên quá cao, con chim bay quá cao ắt bị bắn rơi chuốc lấy tai họa vì thói kiêu ngạo quá mức.",
        "explanation": "Tự phụ kiêu căng muốn bay cao quá sức mình; kết cục bị rơi xuống vực sâu chuốc lấy tai họa khôn lường."
      }
    ]
  },
  "63": {
    "number": 63,
    "name": "Thủy Hỏa Ký Tế",
    "vietnameseName": "Ký Tế (Đã hoàn thành viên mãn, giữ gìn thành quả)",
    "daxiang": {
      "original": "Thủy tại hỏa thượng, Ký Tế; quân tử dĩ tư hoạn nhi dự phòng chi.",
      "meaning": "Nước ở trên bếp lửa đun nấu chín thức ăn là quẻ Ký Tế; người quân tử noi theo đó mà suy nghĩ lường trước những mối lo toan hiểm họa từ xa, để chuẩn bị phương án dự phòng chu đáo.",
      "explanation": "Sáu hào đều đúng ngôi vị (dương ở ngôi dương 1,3,5; âm ở ngôi âm 2,4,6), việc lớn đã hoàn tất viên mãn tột bực. Nhưng đỉnh cao của sự hoàn hảo cũng là khởi đầu của sự thoái trào mục ruỗng. Người quân tử ở thời thái bình thịnh trị không ngủ quên trên chiến thắng, mà phải luôn cảnh giác phòng ngừa mầm mống suy vi từ trước."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Cửu",
        "xiangOriginal": "Tượng viết: Dực kỳ luân, nghĩa vô cữu dã.",
        "xiangMeaning": "Kéo hãm bánh xe lại khi qua sông ướt đuôi chồn, về mặt đạo nghĩa thì chẳng có lỗi lầm gì.",
        "explanation": "Thành công ban đầu biết cẩn thận kìm hãm tốc độ, thận trọng dò đường qua sông an toàn."
      },
      {
        "line": 2,
        "lineName": "Lục Nhị",
        "xiangOriginal": "Tượng viết: Thất nhật đắc, dĩ trung đạo dã.",
        "xiangMeaning": "Người đàn bà làm mất màn che xe không thèm đuổi tìm, sau bảy ngày tự nhiên lấy lại được, nhờ giữ vững đạo trung dung.",
        "explanation": "Mất mát tài sản nhỏ chớ hốt hoảng bồn chồn; giữ lòng kiên định không làm mất phẩm hạnh thì phúc lộc tự về."
      },
      {
        "line": 3,
        "lineName": "Cửu Tam",
        "xiangOriginal": "Tượng viết: Tam tuế khắc chi, bế dã.",
        "xiangMeaning": "Vua Cao Tông nhà Ân đánh dẹp quỷ phương ba năm mới thắng được, hao tổn sức lực mệt mỏi rã rời.",
        "explanation": "Làm việc lớn tuy thắng lợi nhưng hao tổn nguyên khí nặng nề; cẩn trọng không được hiếu chiến bừa bãi."
      },
      {
        "line": 4,
        "lineName": "Lục Tứ",
        "xiangOriginal": "Tượng viết: Chung nhật giới, hữu sở nghi dã.",
        "xiangMeaning": "Thuyền đi qua sông có áo tơi giẻ rách nhét chỗ rò rỉ, suốt ngày luôn giữ lòng cảnh giác lo âu vì có mối nghi ngờ bất trắc.",
        "explanation": "Sự nghiệp đã thành nhưng bắt đầu xuất hiện những lỗ rò rỉ rạn nứt nhỏ; phải thường xuyên kiểm tra vá víu kịp thời."
      },
      {
        "line": 5,
        "lineName": "Cửu Ngũ",
        "xiangOriginal": "Tượng viết: Đông lân sát ngưu, bất như tây lân chi thời dã. Cát đại lai, đại phúc tư dã.",
        "xiangMeaning": "Nhà hàng xóm phía đông mổ bò tế lễ linh đình mà không bằng nhà hàng xóm phía tây cúng tế đơn sơ đúng thời. Điều tốt lành lớn lao sẽ đến, phúc lành lớn được ban phát.",
        "explanation": "Lễ vật linh đình hình thức xa hoa không bằng tấm lòng thành kính đúng lúc; trời đất chứng giám cho lòng thành thực tế."
      },
      {
        "line": 6,
        "lineName": "Thượng Lục",
        "xiangOriginal": "Tượng viết: Nhu kỳ thủ lệ, hà khả cửu dã.",
        "xiangMeaning": "Lội qua sông mà nước ngập ướt cả đầu thật là nguy nan, cảnh ngộ ấy sao có thể kéo dài lâu bền được.",
        "explanation": "Thành công tột đỉnh sinh chủ quan kiêu ngạo, đi quá đà để nước ngập đầu; hiểm họa diệt vong cận kề trong gang tấc."
      }
    ]
  },
  "64": {
    "number": 64,
    "name": "Hỏa Thủy Vị Tế",
    "vietnameseName": "Vị Tế (Chưa hoàn tất, khởi đầu của một chu kỳ mới)",
    "daxiang": {
      "original": "Hỏa tại thủy thượng, Vị Tế; quân tử dĩ thận biện vật cư phương.",
      "meaning": "Lửa bốc lên trên, nước chảy xuống dưới, hai bên cách biệt chưa giao hòa tương trợ là quẻ Vị Tế; người quân tử noi theo đó mà cẩn trọng phân định rõ ràng tính chất sự vật, đặt đúng vị trí phương hướng thích hợp.",
      "explanation": "Quẻ cuối cùng trong 64 quẻ Kinh Dịch không phải là Ký Tế (đã xong) mà là Vị Tế (chưa xong). Cuộc sống là một dòng chảy bất tận, điểm kết thúc của một giai đoạn lại chính là khởi đầu của một hành trình mới. Người quân tử luôn giữ tinh thần cẩn trọng, không ngừng hoàn thiện bản thân, xếp đặt vạn sự đúng vị trí để mở ra tương lai."
    },
    "xiaoxiang": [
      {
        "line": 1,
        "lineName": "Sơ Lục",
        "xiangOriginal": "Tượng viết: Nhu kỳ vĩ, diệc bất tri cực dã.",
        "xiangMeaning": "Con chồn non vội qua sông bị ướt đuôi, cũng là do không biết tự lượng sức mình một cách đúng mực.",
        "explanation": "Khởi đầu nông nổi hấp tấp khi chưa chuẩn bị chu đáo ắt gặp trở ngại; cần bình tĩnh lượng sức mình."
      },
      {
        "line": 2,
        "lineName": "Cửu Nhị",
        "xiangOriginal": "Tượng viết: Cửu nhị trinh cát, trung dĩ hành chính dã.",
        "xiangMeaning": "Hào Cửu Nhị kìm hãm bánh xe giữ đạo chính tốt lành, nhờ giữ tâm trung dung để thực thi con đường ngay thẳng.",
        "explanation": "Biết kiên nhẫn kìm hãm tốc độ, củng cố nội lực vững chắc; chờ thời cơ thuận lợi mới bứt phá."
      },
      {
        "line": 3,
        "lineName": "Lục Tam",
        "xiangOriginal": "Tượng viết: Vị tế chinh hung, vị bất đáng dã.",
        "xiangMeaning": "Việc chưa thành mà nóng vội tiến bước ắt gặp hung họa, vì ở vào ngôi vị bất xứng không thích đáng.",
        "explanation": "Thực lực chưa đủ mà nôn nóng dấn bước vào nơi hiểm trở; cần tìm kiếm sự tương trợ hợp tác của người có tài đức."
      },
      {
        "line": 4,
        "lineName": "Cửu Tứ",
        "xiangOriginal": "Tượng viết: Trinh cát hối vong, chí hành dã.",
        "xiangMeaning": "Giữ đạo chính bền bỉ thì tốt lành, nỗi hối hận tiêu tan, ý chí trừ gian cứu đời được thực thi trọn vẹn.",
        "explanation": "Kiên trì chiến đấu vượt qua ba năm gian khổ; dẹp tan mọi trở ngại giành lại thắng lợi vẻ vang."
      },
      {
        "line": 5,
        "lineName": "Cửu Ngũ",
        "xiangOriginal": "Tượng viết: Quân tử chi quang, kỳ huy cát dã.",
        "xiangMeaning": "Ánh sáng tài đức của người quân tử rạng rỡ, hào quang ấy đem lại điều tốt lành đại cát.",
        "explanation": "Đạt đến đỉnh cao trí tuệ và sự nghiệp rực rỡ; đem ân huệ và ánh sáng chân lý soi đường cho nhân loại."
      },
      {
        "line": 6,
        "lineName": "Thượng Cửu",
        "xiangOriginal": "Tượng viết: Ẩm tửu nhu thủ, diệc bất tri tiết dã.",
        "xiangMeaning": "Uống rượu mừng thắng lợi mà say sưa ngập đầu ngập cổ, cũng là kẻ không biết tiết độ chừng mực.",
        "explanation": "Ăn mừng chiến thắng mà buông thả say sưa trác táng; tự làm hoen ố thành quả và chuốc lấy tai họa đảo lộn mới."
      }
    ]
  }
};
