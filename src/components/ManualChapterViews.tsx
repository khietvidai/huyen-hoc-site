import React from "react";
import {
  Sparkles,
  BookOpen,
  Compass,
  Layers,
  Scroll,
  Flame,
  Info,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  Scale,
  Brain,
  Sun,
  Moon,
  RefreshCw,
  HelpCircle,
} from "lucide-react";

interface ChapterProps {
  onNavigateToSection?: (sectionId: string) => void;
  onNavigateToHex?: (hexNum: number) => void;
}

/**
 * CHƯƠNG 1: LỜI NÓI ĐẦU & GIỚI THIỆU (TRANG 1 - 2 SÁCH THUYẾT MINH)
 */
export const Chapter1Intro: React.FC<ChapterProps> = ({ onNavigateToSection }) => {
  return (
    <div className="space-y-6">
      {/* Sách Bìa & Dẫn Nhập Chung */}
      <div className="bg-gradient-to-br from-[#1C1610] via-[#16120D] to-[#0F0C09] border border-[#3E301F] rounded-2xl p-5 sm:p-7 shadow-xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#C9A55A]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2C2114] pb-3 mb-4">
          <div className="flex items-center gap-2 text-xs font-serif font-bold text-[#C9A55A] uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Sách Đi Kèm Bộ Bài 64 Quẻ • Sách Thuyết Minh</span>
          </div>
          <span className="text-[11px] font-mono text-[#A3927B] px-2.5 py-0.5 rounded-full bg-[#18130E] border border-[#362719]">
            Trang 1 – 2 / Ấn bản gốc
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-[#F5EBD7] leading-snug">
          Bài Tarot Kinh Dịch
        </h2>
        <p className="text-xs sm:text-sm text-[#C9A55A] font-serif font-semibold mt-1">
          Cẩm Nang Thuyết Minh Toàn Thư 64 Quẻ
        </p>
      </div>

      {/* ========================================================
          PHẦN 1: LỜI NÓI ĐẦU (TRANG 1 SÁCH GỐC)
         ======================================================== */}
      <div className="bg-[#14100C] border border-[#382B1C] rounded-2xl p-5 sm:p-7 space-y-5 shadow-lg relative">
        <div className="flex items-center justify-between border-b border-[#281E13] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#241B12] border border-[#483723] flex items-center justify-center text-[#C9A55A]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#C9A55A] uppercase tracking-wider block">
                Trang 1 • Ấn Bản Gốc
              </span>
              <h3 className="text-base sm:text-xl font-serif font-bold text-[#F5EBD7]">
                Lời Nói Đầu
              </h3>
            </div>
          </div>
          <span className="text-xs font-mono text-[#8C7A65] bg-[#1C1610] px-2 py-1 rounded-md border border-[#2F2215]">
            Trang 1
          </span>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-[#D1C3AB] leading-relaxed font-serif">
          <p className="first-letter:text-2xl first-letter:font-bold first-letter:text-[#C9A55A] first-letter:mr-1">
            Trong hành trình cuộc đời, chúng ta luôn phải đối mặt với sự lựa chọn trong nhiều sự kiện quan trọng. Khi đó, ta thường cần đưa ra những dự đoán về tương lai hoặc tìm kiếm sự soi sáng từ trí tuệ và nguồn cảm hứng để giải đáp các vấn đề, qua đó giúp bản thân đưa ra quyết định sáng suốt.
          </p>

          <p>
            Bộ <strong className="text-[#F5EAD4]">“Bài Tarot Kinh Dịch”</strong> mang đến một công cụ tích cực và hiệu quả, đặc biệt là trong những tình huống bạn đã cân nhắc toàn diện cả mong muốn chủ quan lẫn hoàn cảnh khách quan mà vẫn khó lòng đưa ra quyết định. Nó có thể mang đến cho bạn những chỉ dẫn rõ ràng, hơn nữa lại không cần phải nhờ cậy người khác hay tốn kém tiền bạc. Mọi thứ đều đến một cách tự nhiên và thuận tiện, hoàn toàn phù hợp với xu hướng <strong className="text-[#E0B861]">DIY (Do-It-Yourself / Tự mình làm)</strong> mới nhất hiện nay.
          </p>
        </div>

        {/* Khung Trích Dẫn Đúc Kết Trang 1 */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#1E1710] border-l-4 border-[#C9A55A] border-y border-r border-[#362719] shadow-inner text-center sm:text-left">
          <p className="text-sm sm:text-base font-serif italic font-bold text-[#F0DFBF] tracking-wide">
            “Công cụ trí tuệ không thể thiếu trên hành trình cuộc đời.”
          </p>
          <span className="text-[11px] font-mono text-[#99876E] mt-1 block">
            — Tác giả & Nhóm biên soạn Bộ bài Tarot Kinh Dịch
          </span>
        </div>
      </div>

      {/* ========================================================
          PHẦN 2: GIỚI THIỆU (TRANG 2 SÁCH GỐC)
         ======================================================== */}
      <div className="bg-[#14100C] border border-[#382B1C] rounded-2xl p-5 sm:p-7 space-y-5 shadow-lg relative">
        <div className="flex items-center justify-between border-b border-[#281E13] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#241B12] border border-[#483723] flex items-center justify-center text-[#C9A55A]">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#C9A55A] uppercase tracking-wider block">
                Trang 2 • Ấn Bản Gốc
              </span>
              <h3 className="text-base sm:text-xl font-serif font-bold text-[#F5EBD7]">
                Giới Thiệu
              </h3>
            </div>
          </div>
          <span className="text-xs font-mono text-[#8C7A65] bg-[#1C1610] px-2 py-1 rounded-md border border-[#2F2215]">
            Trang 2
          </span>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-[#D1C3AB] leading-relaxed font-serif">
          <p>
            <strong className="text-[#F5EAD4]">“Kinh Dịch”</strong> là một trong những cội nguồn của văn hóa dân tộc Trung Hoa, được tôn vinh là cuốn sách đứng đầu các kinh, là <em>“kinh của các kinh”</em>. Kinh Dịch là kết tinh của một quá trình sáng tác tập thể, tác giả sớm nhất có thể truy nguyên từ thời Phục Hy xa xưa. Lúc bấy giờ, Kinh Dịch là một cuốn sách bói toán, lấy việc bói toán làm hình thức ứng dụng. Trải qua sự diễn giải của Văn Vương, Chu Công, Khổng Tử, nó đã biến thành một tác phẩm triết học với hệ thống độc lập, chứa đựng trí tuệ cuộc sống phong phú. Nó có tác dụng to lớn đối với sự nghiệp và tiền đồ của đời người, giúp con người xây dựng một nhân sinh quan và lý tưởng to lớn, đúng đắn, cũng như bồi dưỡng một tố chất tâm lý khỏe mạnh.
          </p>

          <p>
            Nội dung của <strong className="text-[#F5EAD4]">“Kinh Dịch”</strong> vô cùng uyên bác và sâu sắc, nhưng ngôn từ lại trừu tượng khó hiểu, hơn nữa còn bị phủ lên một lớp áo bói toán thần bí. Chính sự thâm sâu khó hiểu này khiến người ta kính trọng nhưng lại giữ khoảng cách, thật là điều đáng tiếc. Nhằm mục đích phổ biến văn hóa “Kinh Dịch”, giúp nhiều độc giả dễ dàng thấu hiểu được tinh túy và vận dụng trí tuệ của nó vào cuộc sống thường ngày, người biên soạn đã đặc biệt sáng tác ra <strong className="text-[#C9A55A]">“Bài Tarot Kinh Dịch”</strong>.
          </p>
        </div>

        {/* 2 Giá Trị Trọng Tâm Được Sách Nêu */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
          <div className="bg-[#19130E] border border-[#302315] p-4 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-serif font-bold text-[#E5C378]">
              <Scroll className="w-4 h-4 text-[#C9A55A]" />
              <span>Sáu Mươi Tư Bức Tranh Khắc Gỗ</span>
            </div>
            <p className="text-xs text-[#B8A792] font-serif leading-relaxed">
              Bộ bài sử dụng <strong>sáu mươi tư bức tranh</strong> để diễn đạt một cách đơn giản trọng tâm của mỗi quẻ cũng như triết lý bên trong nó, biến những câu chữ cổ kính thành hình ảnh sống động.
            </p>
          </div>

          <div className="bg-[#19130E] border border-[#302315] p-4 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-serif font-bold text-[#E5C378]">
              <Lightbulb className="w-4 h-4 text-[#C9A55A]" />
              <span>Mô Hình Công Cụ Đơn Giản & Trực Quan</span>
            </div>
            <p className="text-xs text-[#B8A792] font-serif leading-relaxed">
              Tận dụng mô hình công cụ đơn giản của các lá bài hình ảnh để giúp độc giả <strong>dự đoán tương lai</strong> và <strong>tìm kiếm trí tuệ, nguồn cảm hứng</strong> thiết thực trong cuộc sống hàng ngày.
            </p>
          </div>
        </div>

        {/* 4 Cột Mốc Thánh Nhân Dịch Học */}
        <div className="p-4 rounded-xl bg-[#18130E] border border-[#2F2317] space-y-2">
          <span className="text-[10px] font-mono text-[#8C7A65] uppercase tracking-wider block">
            DÒNG CHẢY HÌNH THÀNH KINH DỊCH
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-serif">
            <div className="p-2 rounded-lg bg-[#140F0B] border border-[#261D13]">
              <span className="font-bold text-[#EADBBF] block">Phục Hy</span>
              <span className="text-[10px] text-[#99876E]">Vẽ Bát Quái đồ</span>
            </div>
            <div className="p-2 rounded-lg bg-[#140F0B] border border-[#261D13]">
              <span className="font-bold text-[#EADBBF] block">Chu Văn Vương</span>
              <span className="text-[10px] text-[#99876E]">Sáng tác Quái từ</span>
            </div>
            <div className="p-2 rounded-lg bg-[#140F0B] border border-[#261D13]">
              <span className="font-bold text-[#EADBBF] block">Chu Công</span>
              <span className="text-[10px] text-[#99876E]">Trước tác Hào từ</span>
            </div>
            <div className="p-2 rounded-lg bg-[#140F0B] border border-[#261D13]">
              <span className="font-bold text-[#EADBBF] block">Khổng Tử</span>
              <span className="text-[10px] text-[#99876E]">San định Thập dực</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Shortcut sang Chương 2 */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#14100C] border border-[#2D2115] rounded-xl text-xs font-serif">
        <span className="text-[#A3927B]">Tiếp tục tìm hiểu lịch sử hình thành và thuyết Âm Dương (Trang 3 - 8):</span>
        <button
          type="button"
          onClick={() => onNavigateToSection?.("history_yinyang")}
          className="inline-flex items-center gap-1.5 text-[#C9A55A] hover:text-[#FFF] font-semibold transition-colors cursor-pointer"
        >
          <span>Sang Chương 2: Sơ Lược Kinh Dịch & Thuyết Âm Dương</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

/**
 * CHƯƠNG 2: SƠ LƯỢC VỀ KINH DỊCH & THUYẾT ÂM DƯƠNG
 */
export const Chapter2History: React.FC<ChapterProps> = ({ onNavigateToSection }) => {
  return (
    <div className="space-y-6">
      {/* Sơ lược lịch sử */}
      <div className="bg-[#17120D] border border-[#332517] rounded-2xl p-5 sm:p-6 space-y-3">
        <div className="flex items-center gap-2 text-xs font-serif font-bold text-[#C9A55A] uppercase tracking-wider">
          <Compass className="w-4 h-4" />
          <span>Nguồn Gốc Lịch Sử</span>
        </div>
        <h3 className="text-base sm:text-xl font-serif font-bold text-[#F4E8D3]">
          Từ Mai Rùa Đồ Đồng Đến Cuốn Sách Giáo Khoa Cuộc Đời
        </h3>
        <p className="text-xs sm:text-sm text-[#CDBFA7] font-serif leading-relaxed">
          Kinh Dịch có nguồn gốc lâu đời, là kết tinh trí tuệ của nền văn minh phương Đông qua quá trình sáng tác tập thể. Ngay từ thời đồ đá, con người đã dùng quẻ bói để dự đoán cát hung. Trên mai rùa, xương thú và đồ đồng thời Thương và sơ kỳ Tây Chu, người xưa đã khắc các quẻ số gồm sáu nét.
        </p>
        <p className="text-xs sm:text-sm text-[#CDBFA7] font-serif leading-relaxed">
          Kinh Dịch ngày nay chính xác là <strong className="text-[#F5EAD4]">“Chu Dịch”</strong> (Dịch của nhà Chu), kế thừa qua hai giai đoạn cổ xưa là <em className="text-[#C9A55A]">“Liên Sơn”</em> (thời Hạ) và <em className="text-[#C9A55A]">“Quy Tàng”</em> (thời Ân). Chu Dịch là bản đúc kết kinh nghiệm đối nhân xử thế sâu sắc gồm 64 quẻ, thoán từ và 384 hào từ chỉ dẫn những điều nên làm và không nên làm.
        </p>
      </div>

      {/* Cấu trúc Kinh & Truyện */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#14100D] border border-[#2D2115] rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#C9A55A] uppercase">PHẦN 1: KINH (Chính Văn)</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#241A11] text-[#E0B861] border border-[#3D2C1A]">Chu Văn Vương & Chu Công</span>
          </div>
          <p className="text-xs text-[#C2B29A] font-serif leading-relaxed">
            Gồm <strong>64 quẻ</strong> (mỗi quẻ 6 vạch gọi là hào: hào liền <code className="text-[#C9A55A]">——</code> Dương và hào đứt <code className="text-[#C9A55A]">— —</code> Âm) kèm Quái từ và Hào từ. Được chia làm <em>Thượng Kinh</em> (30 quẻ đầu) và <em>Hạ Kinh</em> (34 quẻ sau).
          </p>
        </div>

        <div className="bg-[#14100D] border border-[#2D2115] rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#C9A55A] uppercase">PHẦN 2: TRUYỆN (Giải Thuyết)</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#241A11] text-[#E0B861] border border-[#3D2C1A]">Khổng Tử & Thập Dực</span>
          </div>
          <p className="text-xs text-[#C2B29A] font-serif leading-relaxed">
            Mười thiên giải nghĩa gọi là <strong>“Thập Dực”</strong> (mười đôi cánh phò trợ làm sáng tỏ ý nghĩa của Kinh), tương truyền do Khổng Tử và các môn đồ đời sau cùng trước tác để xiển dương đạo lý làm người.
          </p>
        </div>
      </div>

      {/* Ý Nghĩa Ba Chữ "DỊCH" (Trịnh Huyền thời Hậu Hán) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-[#C9A55A]" />
          <h4 className="text-sm sm:text-base font-serif font-bold text-[#F3E7CF]">
            Ý Nghĩa Ba Chữ “DỊCH” (Trịnh Huyền thời Hậu Hán)
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-[#19130D] border border-[#382819] rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-amber-400" />
              <h5 className="font-serif font-bold text-sm text-[#F5EAD4]">1. Biến Dịch</h5>
            </div>
            <p className="text-xs text-[#BAAA92] font-serif leading-relaxed">
              <strong className="text-[#EADBBF]">Vạn vật biến đổi không ngừng:</strong> Vũ trụ, xã hội, sự nghiệp và đời người đều trong trạng thái vận động, sinh diệt và chuyển hóa liên tục.
            </p>
          </div>

          <div className="bg-[#19130D] border border-[#382819] rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h5 className="font-serif font-bold text-sm text-[#F5EAD4]">2. Bất Dịch</h5>
            </div>
            <p className="text-xs text-[#BAAA92] font-serif leading-relaxed">
              <strong className="text-[#EADBBF]">Trật tự quy luật vĩnh hằng:</strong> Sự biến đổi ấy không phải hỗn loạn ngẫu nhiên mà luôn vận hành theo trật tự khách quan, có chu kỳ và quy luật bất biến.
            </p>
          </div>

          <div className="bg-[#19130D] border border-[#382819] rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-300" />
              <h5 className="font-serif font-bold text-sm text-[#F5EAD4]">3. Giản Dịch</h5>
            </div>
            <p className="text-xs text-[#BAAA92] font-serif leading-relaxed">
              <strong className="text-[#EADBBF]">Đơn giản & dễ nắm bắt:</strong> Nhờ nắm được tính quy luật bất dịch, người trí tuệ có thể dùng những biểu tượng, con số đơn giản để suy đoán và thấu suốt tương lai.
            </p>
          </div>
        </div>
      </div>

      {/* Thuyết Âm Dương & Cây Tiến Hóa Vũ Trụ */}
      <div className="bg-gradient-to-b from-[#18130E] to-[#120E0A] border border-[#352618] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[#2C2014] pb-3">
          <div className="flex items-center gap-2 text-sm font-serif font-bold text-[#F5EAD4]">
            <span className="text-[#C9A55A] text-base">☯</span>
            <span>Thuyết Âm Dương & Dòng Chảy Sinh Thành Vũ Trụ</span>
          </div>
          <span className="text-[11px] font-mono text-[#C9A55A]">Dịch hữu Thái Cực sinh Lưỡng Nghi</span>
        </div>

        {/* Stepper Flow */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs font-serif">
          <div className="bg-[#201811] p-3 rounded-xl border border-[#382819]">
            <span className="text-lg font-mono text-[#C9A55A] block mb-1">◯</span>
            <span className="font-bold text-[#F0E3CC] block">Thái Cực</span>
            <span className="text-[10px] text-[#8C7A65]">Khối năng lượng ban sơ</span>
          </div>

          <div className="bg-[#201811] p-3 rounded-xl border border-[#382819]">
            <span className="text-lg font-mono text-[#C9A55A] block mb-1">☯</span>
            <span className="font-bold text-[#F0E3CC] block">Lưỡng Nghi</span>
            <span className="text-[10px] text-[#8C7A65]">Âm (— —) & Dương (——)</span>
          </div>

          <div className="bg-[#201811] p-3 rounded-xl border border-[#382819]">
            <span className="text-lg font-mono text-[#C9A55A] block mb-1">⚎ ⚍ ⚏ ⚌</span>
            <span className="font-bold text-[#F0E3CC] block">Tứ Tượng</span>
            <span className="text-[10px] text-[#8C7A65]">Thái/Thiếu Âm & Dương</span>
          </div>

          <div className="bg-[#201811] p-3 rounded-xl border border-[#382819] flex flex-col items-center justify-between">
            <div className="font-mono text-[#C9A55A] leading-tight mb-1 text-sm sm:text-base tracking-widest text-center">
              <div>☰ ☱ ☲ ☳</div>
              <div>☴ ☵ ☶ ☷</div>
            </div>
            <span className="font-bold text-[#F0E3CC] block">Bát Quái</span>
            <span className="text-[10px] text-[#8C7A65]">8 Quái tượng tự nhiên</span>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-[#2C1F13] p-3 rounded-xl border border-[#C9A55A]/50 shadow-[0_0_12px_rgba(212,175,55,0.2)]">
            <span className="text-lg font-mono text-[#C9A55A] block mb-1">䷀...䷿</span>
            <span className="font-bold text-[#FFF] block">64 Quẻ</span>
            <span className="text-[10px] text-[#E5C378]">Trọn vẹn nhân sinh</span>
          </div>
        </div>

        {/* 3 Quy luật Âm Dương cốt lõi */}
        <div className="space-y-2.5 pt-2">
          <div className="text-xs font-serif font-bold text-[#C9A55A] uppercase tracking-wider">
            Ba Quy Luật Âm Dương Cốt Lõi:
          </div>

          <div className="space-y-2 text-xs text-[#C8B89F] font-serif">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#14100C] border border-[#2B1F14]">
              <Sun className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#F0E3CC]">1. Thống nhất & Nương tựa lẫn nhau:</strong> Càn là trời, Khôn là đất. Đất nhận che chở của trời, trời cần đất để che chở vạn vật. Trong Âm có Dương, trong Dương có Âm, giao cảm hòa hợp.
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#14100C] border border-[#2B1F14]">
              <Moon className="w-4 h-4 text-indigo-300 shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#F0E3CC]">2. Đối lập & Xung đột tạo động lực:</strong> Cương và nhu, trên và dưới, sáng và tối. Chính sự mâu thuẫn đối lập này tạo nên xung lực vận hành không ngừng cho mọi sự vật.
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#14100C] border border-[#2B1F14]">
              <RefreshCw className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#F0E3CC]">3. Chuyển hóa khi đến cực điểm (Vật cực tất phản):</strong> Khi sự việc phát triển tới tột cùng sẽ biến hóa sang mặt đối lập (*“Bĩ cực thái lai”* - hết khổ đến sướng, *“Kháng long hữu hối”* - rồng bay quá cao sẽ hối hận).
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Shortcut sang Chương 3 */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#14100C] border border-[#2D2115] rounded-xl text-xs font-serif">
        <span className="text-[#A3927B]">Tiếp tục tìm hiểu Bát Quái và các đặc tính (Lục thân, Phương vị, Ngũ hành):</span>
        <button
          type="button"
          onClick={() => onNavigateToSection?.("eight_trigrams")}
          className="inline-flex items-center gap-1.5 text-[#C9A55A] hover:text-[#FFF] font-semibold transition-colors cursor-pointer"
        >
          <span>Sang Chương 3: Đặc Tính Của Bát Quái</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

/**
 * CHƯƠNG 4: NGUYÊN LÝ DỰ ĐOÁN & CHUẨN BỊ TÂM LÝ
 */
export const Chapter4DivinationPrinciples: React.FC<ChapterProps> = ({ onNavigateToSection }) => {
  return (
    <div className="space-y-6">
      {/* Khối 1: Cơ chế tiềm thức */}
      <div className="bg-[#17120D] border border-[#332517] rounded-2xl p-5 sm:p-6 space-y-3">
        <div className="flex items-center gap-2 text-xs font-serif font-bold text-[#C9A55A] uppercase tracking-wider">
          <Brain className="w-4 h-4" />
          <span>Cơ Chế Khoa Học & Tiềm Thức</span>
        </div>
        <h3 className="text-base sm:text-xl font-serif font-bold text-[#F4E8D3]">
          Phát Huy Chức Năng Tiềm Thức Của Bộ Não
        </h3>
        <p className="text-xs sm:text-sm text-[#CDBFA7] font-serif leading-relaxed">
          Các công cụ bói toán cổ xưa như Kinh Dịch hay Tarot phương Tây <strong className="text-[#F5EAD4]">hoàn toàn không phải ảo thuật, cũng không dựa trên mê tín dị đoan</strong>. Thực chất, khả năng dự đoán này chính là việc đánh thức và phát huy chức năng trực giác của tiềm thức.
        </p>
        <p className="text-xs sm:text-sm text-[#CDBFA7] font-serif leading-relaxed">
          Mọi việc diễn ra trong vũ trụ đều liên kết với nhau qua các luồng thông tin vô hình. Não bộ con người chia thành ý thức và tiềm thức, trong đó tiềm thức chính là bộ thu sóng nhạy bén. Các công cụ biểu tượng (quẻ Dịch, lá bài hình ảnh) đóng vai trò như chiếc chìa khóa kích hoạt linh giác của tâm trí.
        </p>
      </div>

      {/* Khối 2: Điều kiện tiên quyết: Tâm Thành Tắc Linh */}
      <div className="bg-gradient-to-r from-[#21160F] via-[#2A1C12] to-[#1C140E] border-2 border-[#C9A55A]/40 rounded-2xl p-5 sm:p-6 shadow-lg space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-mono font-bold text-[#C9A55A] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            Điều Kiện Tiên Quyết
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-serif italic bg-[#15100B] text-[#F3D58B] border border-[#483723]">
            “Tâm thành tắc linh • Tinh thành sở chí, kim thạch vi khai”
          </span>
        </div>

        <p className="text-xs sm:text-sm text-[#E2D4BF] font-serif leading-relaxed">
          Khi tâm ở trạng thái “thành”, sẽ sinh ra <strong>Định lực</strong>; từ Định lực sẽ phát sinh <strong>Trí tuệ</strong>. Giống như đạo học dạy: nhờ Giới nhiếp tâm sinh Định, từ Định khai mở trí tuệ Bát Nhã. Công cụ chỉ là thứ yếu; quẻ có ứng nghiệm hay không phụ thuộc hoàn toàn vào sự định tĩnh và chân thành của người hỏi.
        </p>
      </div>

      {/* Khối Mới: Cẩm Nang Nghi Lễ Trai Giới Mộc Dục (齋戒沐浴) */}
      <div className="bg-[#15100B] border-2 border-[#C9A55A]/50 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9A55A]/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#302213] pb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">⛩️</span>
            <div>
              <span className="text-[10px] font-mono font-bold text-[#C9A55A] uppercase tracking-wider block">
                Pháp Môn Thanh Tịnh Thân Tâm
              </span>
              <h4 className="text-base sm:text-lg font-serif font-bold text-[#E6D3A3]">
                CẨM NANG NGHI LỄ: TRAI GIỚI MỘC DỤC (齋戒沐浴)
              </h4>
            </div>
          </div>
          <span className="text-[11px] font-mono text-[#C9A55A] bg-[#22160C] px-3 py-1 rounded-full border border-[#4E341B]">
            Cổ Pháp Khổng Tử • Hệ Từ Thượng
          </span>
        </div>

        <p className="text-xs sm:text-sm text-[#E2D5BF] font-serif leading-relaxed italic border-l-2 border-[#C9A55A] pl-3 bg-[#1C140C]/60 py-2 rounded-r-lg">
          “Thánh nhân dĩ thử trai giới, dĩ sùng đức quảng nghiệp... Tịch nhiên bất động, cảm nhi toại thông thiên hạ chi cố.”
          <span className="block text-[11px] text-[#A6957E] mt-1 not-italic">
            (Thánh nhân nhờ trai giới mà tâm rỗng rang định tĩnh, lòng lặng phắc như tờ mà cảm ứng thông suốt mọi lẽ biến hóa trong trời đất).
          </span>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
          {/* Cột 1: Mộc Dục (Tẩy Thân) */}
          <div className="bg-[#1C140D] border border-[#3E2916] rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-[#E6D3A3] font-serif font-bold text-sm">
              <span className="w-6 h-6 rounded-md bg-[#2B1B0E] border border-[#5A3819] flex items-center justify-center text-xs text-[#C9A55A]">
                沐
              </span>
              <span>1. Mộc Dục (沐浴 - Tẩy Thân Thanh Khiết):</span>
            </div>
            <ul className="text-xs text-[#CBB9A0] font-serif leading-relaxed space-y-1.5 list-disc list-inside">
              <li>
                <strong className="text-[#F5EAD4]">Mộc (沐):</strong> Gội đầu, rửa mặt, súc miệng sạch sẽ để ngũ quan thanh tịnh và hơi thở thơm tho.
              </li>
              <li>
                <strong className="text-[#F5EAD4]">Dục (浴):</strong> Tắm gội toàn thân, đặc biệt là <strong className="text-[#E6D3A3]">rửa sạch đôi bàn tay dưới dòng nước tinh khiết</strong> trước khi chạm vào thẻ bài, đồng tiền cổ hay 50 cọng cỏ thi. Đôi tay là cửa ngõ truyền dẫn từ trường sinh học, tay sạch thì từ trường mới tinh khiết không bị tạp nhiễm.
              </li>
              <li>
                <strong className="text-[#F5EAD4]">Y phục:</strong> Ăn mặc ngay ngắn, tề chỉnh, sạch sẽ; tránh mặc luộm thuộm hay hở hang để thể hiện lòng chí kính với linh khí Càn Khôn.
              </li>
            </ul>
          </div>

          {/* Cột 2: Trai Giới (Tịnh Tâm) */}
          <div className="bg-[#1C140D] border border-[#3E2916] rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-[#E6D3A3] font-serif font-bold text-sm">
              <span className="w-6 h-6 rounded-md bg-[#2B1B0E] border border-[#5A3819] flex items-center justify-center text-xs text-[#C9A55A]">
                齋
              </span>
              <span>2. Trai Giới (齋戒 - Tịnh Tâm Hư Tĩnh):</span>
            </div>
            <ul className="text-xs text-[#CBB9A0] font-serif leading-relaxed space-y-1.5 list-disc list-inside">
              <li>
                <strong className="text-[#F5EAD4]">Trai (齋):</strong> Tề chỉnh tâm ý, thanh tâm quả dục. Tránh ăn uống quá no, kiêng bia rượu, chất kích thích và những cuộc tranh cãi, ồn ào trước giờ thỉnh quẻ.
              </li>
              <li>
                <strong className="text-[#F5EAD4]">Giới (戒):</strong> Giữ gìn giới hạn, dứt bỏ mọi tà niệm, tham vọng vị kỷ, đố kỵ, sân hận hoặc toan tính vụ lợi.
              </li>
              <li>
                <strong className="text-[#F5EAD4]">Hư Tĩnh Sinh Minh:</strong> Điều hòa nhịp thở, đưa tâm trí về trạng thái tĩnh lặng sâu lắng như mặt gương phẳng không dính hạt bụi trần, nhất tâm hướng trọn ý thức về sự việc cần thấu tỏ.
              </li>
            </ul>
          </div>
        </div>

        {/* Khẩu Quyết Tứ Bất Bốc */}
        <div className="bg-[#20140A] border border-[#482F18] rounded-xl p-3.5 space-y-2">
          <span className="text-xs font-serif font-bold text-[#E6D3A3] flex items-center gap-2">
            <span className="text-[#C9A55A]">📜</span> KHẨU QUYẾT DỊCH HỌC: "TỨ BẤT BỐC" (4 ĐIỀU TUYỆT ĐỐI KHÔNG BỐC)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[11px] font-serif">
            <div className="bg-[#150E07] p-2 rounded-lg border border-[#331E0D]">
              <strong className="text-[#C9A55A] block mb-0.5">1. Bất thành bất bốc:</strong>
              Lòng không chân thành, chỉ thử xem bói chơi đùa thì quẻ không bao giờ ứng nghiệm.
            </div>
            <div className="bg-[#150E07] p-2 rounded-lg border border-[#331E0D]">
              <strong className="text-[#C9A55A] block mb-0.5">2. Bất nghi bất bốc:</strong>
              Lòng không có điều thực sự băn khoăn hay biến cố cần chỉ dẫn thì không được tùy tiện bốc.
            </div>
            <div className="bg-[#150E07] p-2 rounded-lg border border-[#331E0D]">
              <strong className="text-[#C9A55A] block mb-0.5">3. Phi nghĩa bất bốc:</strong>
              Hỏi những việc trái đạo lý, vi phạm pháp luật, hại người trục lợi thì tuyệt đối không thỉnh quẻ.
            </div>
            <div className="bg-[#150E07] p-2 rounded-lg border border-[#331E0D]">
              <strong className="text-[#C9A55A] block mb-0.5">4. Độc tắc bất cáo:</strong>
              Một việc đã gieo thì phải tín nhận, không được bốc đi bốc lại để ép quẻ tốt (bạo nhờn thì quẻ sẽ loạn).
            </div>
          </div>
        </div>
      </div>

      {/* Khối 3: Cách đặt câu hỏi - So sánh trực quan ❌ vs ✅ */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-[#C9A55A]" />
          <h4 className="text-sm sm:text-base font-serif font-bold text-[#F3E7CF]">
            Nghệ Thuật Đặt Câu Hỏi: Rõ Ràng & Định Hướng Mở
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* CỘT TRÁI: CÂU HỎI CHƯA CHUẨN */}
          <div className="bg-[#1C1113] border border-rose-950/70 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center gap-2 text-rose-400 font-serif font-bold text-xs sm:text-sm">
              <XCircle className="w-4 h-4 shrink-0" />
              <span>❌ Cách Đặt Câu Hỏi Chưa Chuẩn (Nên Tránh)</span>
            </div>
            <p className="text-xs text-[#BBA5A7] font-serif leading-relaxed">
              Tránh đặt câu hỏi mơ hồ, mang tính chủ quan phiến diện, áp đặt hoặc ép buộc câu trả lời nhị phân “Có / Không”.
            </p>
            <div className="space-y-2 pt-1">
              <div className="p-2.5 rounded-xl bg-[#261315] border border-rose-900/40 text-xs text-[#E8C2C5] font-serif italic">
                “Năm nay liệu tôi có tìm được bạn trai không?”
              </div>
              <div className="p-2.5 rounded-xl bg-[#261315] border border-rose-900/40 text-xs text-[#E8C2C5] font-serif italic">
                “Công việc này không hợp với tôi, đúng không?”
              </div>
              <div className="p-2.5 rounded-xl bg-[#261315] border border-rose-900/40 text-xs text-[#E8C2C5] font-serif italic">
                “Tháng tới tôi có giàu to không?”
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: CÂU HỎI CHUẨN XÁC */}
          <div className="bg-[#101813] border border-emerald-950/70 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-serif font-bold text-xs sm:text-sm">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>✅ Cách Đặt Câu Hỏi Chuẩn Xác (Khuyên Dùng)</span>
            </div>
            <p className="text-xs text-[#A1B8A9] font-serif leading-relaxed">
              Đặt câu hỏi mang tính định hướng, toàn cảnh, tìm kiếm lời khuyên hành động và phương hướng giải quyết.
            </p>
            <div className="space-y-2 pt-1">
              <div className="p-2.5 rounded-xl bg-[#142319] border border-emerald-900/40 text-xs text-[#C8E5D1] font-serif">
                “Tình hình phát triển tình cảm trong năm nay sẽ có xu hướng ra sao?”
              </div>
              <div className="p-2.5 rounded-xl bg-[#142319] border border-emerald-900/40 text-xs text-[#C8E5D1] font-serif">
                “Những khó khăn gặp phải trong công việc hiện tại nên giải quyết thế nào?”
              </div>
              <div className="p-2.5 rounded-xl bg-[#142319] border border-emerald-900/40 text-xs text-[#C8E5D1] font-serif">
                “Tài chính cá nhân nửa cuối năm cần thận trọng những rủi ro gì?”
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Khối 4: Quyết định phương pháp trải bài trước khi xào */}
      <div className="bg-[#16120D] border border-[#332617] rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-[#C9A55A] shrink-0 mt-0.5" />
        <div className="text-xs text-[#C8BBA5] font-serif space-y-1">
          <strong className="text-[#F5EAD4] block">Nguyên Tắc Bất Di Bất Dịch:</strong>
          <span>
            Một khi đã chọn cách trải (1 lá, 2 lá, 3 lá...), tuyệt đối không được tùy tiện thay đổi giữa chừng. Trong suốt quá trình bạn tập trung và xáo bài, tiềm thức đã bắt đầu tương tác với các lá bài tương ứng với quy chuẩn trải bạn đã định.
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * CHƯƠNG 8: CÁCH XỬ LÝ KHI GẶP QUẺ HUNG & ĐẠO DỊCH
 */
export const Chapter8BadOmens: React.FC<ChapterProps> = ({ onNavigateToSection }) => {
  return (
    <div className="space-y-6">
      {/* Warning Banner */}
      <div className="bg-gradient-to-r from-[#291316] via-[#1E1113] to-[#160D0E] border-2 border-rose-900/60 rounded-2xl p-5 sm:p-6 shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-rose-400 font-serif font-bold text-xs sm:text-sm uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4" />
          <span>Quy Tắc Tối Kỵ Trong Bói Dịch</span>
        </div>
        <h3 className="text-base sm:text-xl font-serif font-bold text-rose-200">
          Tuyệt Đối Không Gieo Đi Gieo Lại Cho Cùng Một Việc
        </h3>
        <p className="text-xs sm:text-sm text-[#DFBAC0] font-serif leading-relaxed">
          Nhiều người sau khi gieo quẻ, thấy quẻ tượng không như ý liền vội vã bốc lại lần nữa, cứ thế cho đến khi nhận được quẻ tốt mới thôi. <strong className="text-rose-300 underline">Cách làm này là hoàn toàn sai lầm</strong>, vừa làm nhiễu loạn tâm trí vừa đánh mất giá trị dẫn đường của Kinh Dịch.
        </p>
      </div>

      {/* 4 Nguyên Tắc Cốt Tủy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Độc tắc bất cáo */}
        <div className="bg-[#18130E] border border-[#352718] rounded-2xl p-5 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#C9A55A] uppercase">
            <span className="w-2 h-2 rounded-full bg-[#C9A55A]" />
            <span>1. “Độc Tắc Bất Cáo”</span>
          </div>
          <h4 className="text-sm sm:text-base font-serif font-bold text-[#F3E5CC]">
            Hỏi Đi Hỏi Lại Bạo Nhờn Thì Không Bảo Nữa
          </h4>
          <p className="text-xs sm:text-sm text-[#BFAFA0] font-serif leading-relaxed">
            Hành vi lặp lại quá trình gieo quẻ cho cùng một việc là sự thiếu tôn trọng và tự lừa dối bản thân. Quẻ Dịch không lừa dối ai; nó dùng biểu tượng trung thực nhất để phản ánh thực trạng và vạch trần cốt lõi nan giải bạn đang gặp phải.
          </p>
        </div>

        {/* 2. Quẻ hung là gương soi */}
        <div className="bg-[#18130E] border border-[#352718] rounded-2xl p-5 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>2. Chiếc Gương Cảnh Tỉnh</span>
          </div>
          <h4 className="text-sm sm:text-base font-serif font-bold text-[#F3E5CC]">
            Nhận Diện Sai Lầm Trong Cách Tiếp Cận
          </h4>
          <p className="text-xs sm:text-sm text-[#BFAFA0] font-serif leading-relaxed">
            Gặp quẻ hung không có nghĩa là số phận đã an bài bi đát. Đó là hồi chuông cảnh báo rằng <strong>phương pháp xử lý hoặc tâm thế hiện tại của bạn đang có sai lệch</strong>. Nếu ngoan cố giữ nguyên thì sẽ chuốc lấy thất bại.
          </p>
        </div>

        {/* 3. Cách chuyển hung thành cát */}
        <div className="bg-[#18130E] border border-[#352718] rounded-2xl p-5 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>3. Chuyển Hung Thành Cát</span>
          </div>
          <h4 className="text-sm sm:text-base font-serif font-bold text-[#F3E5CC]">
            Sửa Mình Thì Vận Thế Tự Chuyển Biến
          </h4>
          <p className="text-xs sm:text-sm text-[#BFAFA0] font-serif leading-relaxed">
            Dựa vào lời khuyên của quẻ để điều chỉnh thái độ, hành vi và sách lược. Khi bạn đã thực sự hành động cải thiện và thay đổi cục diện, sau một khoảng thời gian thỉnh quẻ lại, bạn sẽ thấy quẻ tượng tự nhiên chuyển hóa thành cát lành.
          </p>
        </div>

        {/* 4. Đạo Dịch khai mở trực giác */}
        <div className="bg-[#18130E] border border-[#352718] rounded-2xl p-5 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-sky-400 uppercase">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span>4. Kim Chỉ Nam Hành Động</span>
          </div>
          <h4 className="text-sm sm:text-base font-serif font-bold text-[#F3E5CC]">
            Không Phải Định Mệnh Bất Biến
          </h4>
          <p className="text-xs sm:text-sm text-[#BFAFA0] font-serif leading-relaxed">
            Quẻ Dịch không định đoạt số phận của bạn. Bức tranh Tarot Kinh Dịch vẽ theo lối mộc bản cổ kính giúp đánh thức trực giác. Hãy tĩnh tâm chiêm nghiệm hình ảnh và câu chốt của quẻ, bạn sẽ tìm thấy con đường sáng suốt nhất.
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * CHƯƠNG 9: VỀ CUỐN SÁCH & BẢN QUYỀN
 */
export const Chapter9Colophon: React.FC<ChapterProps> = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-b from-[#18130E] to-[#120E0A] border border-[#332517] rounded-2xl p-5 sm:p-7 space-y-4">
        <div className="flex items-center gap-2 text-xs font-serif font-bold text-[#C9A55A] uppercase tracking-wider">
          <Info className="w-4 h-4" />
          <span>Thông Tin Xuất Bản & Tác Phẩm</span>
        </div>

        <h3 className="text-base sm:text-xl font-serif font-bold text-[#F4E8D3]">
          Bộ Bài Tarot Kinh Dịch 64 Quẻ • Nghệ Thuật Khắc Gỗ Á Đông
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm font-serif pt-2">
          <div className="bg-[#15100B] border border-[#2B1F13] p-4 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-mono text-[#8C7A65] block">Phong Cách Minh Họa</span>
            <strong className="text-[#F0E3CB] block text-sm">Tranh Khắc Gỗ Cổ Truyền</strong>
            <p className="text-[#AFA18E] text-xs pt-1">
              Hòa quyện sắc màu trầm mặc, uy nghiêm của nghệ thuật mộc bản phương Đông cùng hệ thống biểu tượng Dịch học.
            </p>
          </div>

          <div className="bg-[#15100B] border border-[#2B1F13] p-4 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-mono text-[#8C7A65] block">Định Dạng Kỹ Thuật Số</span>
            <strong className="text-[#F0E3CB] block text-sm">Tái Bản & Số Hóa Toàn Phần</strong>
            <p className="text-[#AFA18E] text-xs pt-1">
              Dàn trang trọn vẹn từ 64 quẻ, thơ tượng, đại tượng, lời khuyên và các phương pháp trải bài thực chiến.
            </p>
          </div>
        </div>

        {/* Core Philosophy Quote */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#201811] border-l-3 border-[#C9A55A] border-y border-r border-[#38291A]">
          <p className="text-xs sm:text-sm text-[#E8DCC4] font-serif italic leading-relaxed">
            “Quẻ Dịch không định đoạt số phận. Nó phản chiếu tình thế hiện tại và gợi mở hướng đi — phần còn lại thuộc về người đọc quẻ và hành động của chính bạn.”
          </p>
        </div>
      </div>
    </div>
  );
};
