import React, { useMemo, useState } from "react";
import {
  Sparkles,
  Compass,
  CalendarDays,
  Layers,
  BookOpen,
  History,
  Sun,
  Moon,
  ArrowRight,
  Shield,
  Star,
  Clock,
  HeartHandshake,
  Flame,
  CheckCircle2,
  Phone,
  MessageSquare,
  HelpCircle,
  Copy,
  Check,
  Building,
  User,
  CalendarCheck,
  Coins,
  ChevronRight,
  X,
  FileText,
  BadgeAlert,
  Info,
  Crown,
  Gift,
  Percent,
  Award,
  Lock,
} from "lucide-react";
import { NavTab } from "./Header";
import { BrandMark, LuopanRing } from "./BrandMark";
import { getDailyHexagramData } from "../utils/dailyHexagram";
import { getThongThuDayDetails } from "../utils/thongThuDungSu";
import { AppUser } from "../services/authService";

export interface HomeSectionProps {
  onNavigateTab: (tab: NavTab) => void;
  onOpenDailyHexagram: () => void;
  cardImages?: Record<number, string>;
  historyCount?: number;
  currentUser?: AppUser | null;
  onOpenAuthModal?: (mode?: "login" | "register" | "upgrade") => void;
}

export interface ServiceItem {
  id: string;
  number: number;
  title: string;
  chineseTitle: string;
  category: "fengshui" | "naming" | "bazi" | "calendar" | "divination";
  standardPriceText: string;
  standardPriceNote?: string;
  memberPriceText: string;
  memberOriginalPrice?: string;
  memberPromoBadge: string;
  memberPriceNote?: string;
  memberDiscountType: "special_member" | "percent_20";
  memberTeaser: string;
  badge?: string;
  summary: string;
  details?: string[];
  schools?: {
    name: string;
    description: string;
    statusBadge?: string;
  }[];
  conditionNote?: string;
}

export const getServicePriceInfo = (service: ServiceItem, isMember: boolean) => {
  if (isMember) {
    return {
      priceText: service.memberPriceText,
      originalPrice: service.memberOriginalPrice,
      promoBadge: service.memberPromoBadge,
      priceNote: service.memberPriceNote || service.standardPriceNote,
      isDiscountApplied: true,
      discountType: service.memberDiscountType,
    };
  }
  return {
    priceText: service.standardPriceText,
    originalPrice: undefined,
    promoBadge: undefined,
    priceNote: service.standardPriceNote,
    isDiscountApplied: false,
    discountType: undefined,
  };
};

const PAID_SERVICES: ServiceItem[] = [
  {
    id: "duong-trach",
    number: 1,
    title: "Phong thủy dương trạch",
    chineseTitle: "陽宅風水勘輿",
    category: "fengshui",
    standardPriceText: "18.000.000 VNĐ",
    standardPriceNote: "Cho diện tích dưới 100 m² (mỗi tầng thêm 8.000.000 VNĐ)",
    memberPriceText: "14.400.000 VNĐ",
    memberOriginalPrice: "18.000.000 VNĐ",
    memberPromoBadge: "Ưu đãi hội viên -20%",
    memberPriceNote: "Đã giảm 20% cho Hội Viên (mỗi tầng thêm 6.400.000 VNĐ thay vì 8.000.000 VNĐ)",
    memberDiscountType: "percent_20",
    memberTeaser: "Đăng ký Hội Viên giảm -20% còn 14.400.000 VNĐ",
    badge: "Khảo Sát Hiện Trường",
    conditionNote: "Chỉ tính riêng cho khu vực quanh Tp.HCM",
    summary:
      "Khảo sát địa thế Loan Đầu thực địa, đo đạc phân kim La Bàn, luận giải Lý Khí Huyền Không, bố cục Môn - Chủ - Táo, kích hoạt cung tài vị và hóa giải sát khí cho nhà ở, biệt thự, văn phòng.",
    details: [
      "Khảo sát Loan Đầu ngoại cảnh (hình thế đường sá, sông ngòi, công trình xung quanh).",
      "Đo đạc chính xác độ số La Bàn phân kim và lập tinh bàn Huyền Không Phi Tinh.",
      "Quy hoạch công năng: Cửa chính (Môn), phòng ngủ gia chủ (Chủ), khu bếp (Táo), bàn thờ tổ tiên.",
      "Tư vấn bài trí chiêu tài, kích vận sự nghiệp và phương án hóa giải sát khí triệt để.",
    ],
  },
  {
    id: "dat-ten",
    number: 2,
    title: "Đặt tên",
    chineseTitle: "姓名學起名",
    category: "naming",
    standardPriceText: "9.800.000 VNĐ",
    standardPriceNote: "15.800.000 VNĐ đối với tên công ty / doanh nghiệp / thương hiệu",
    memberPriceText: "7.840.000 VNĐ",
    memberOriginalPrice: "9.800.000 VNĐ",
    memberPromoBadge: "Ưu đãi hội viên -20%",
    memberPriceNote: "Đã giảm 20% cho Hội Viên (Tên công ty / thương hiệu: 12.640.000 VNĐ thay vì 15.800.000 VNĐ)",
    memberDiscountType: "percent_20",
    memberTeaser: "Đăng ký Hội Viên giảm -20% còn từ 7.840.000 VNĐ",
    badge: "Cát Tường Đại Cát",
    summary:
      "Đặt tên danh xưng cá nhân, đặt tên con theo Bát Tự bổ khuyết Dụng Thần, phối hợp Âm Dương Ngũ Hành, Ngũ Cách Thiên Địa Nhân và nạp Quẻ Kinh Dịch đại cát cho cá nhân hoặc doanh nghiệp.",
    details: [
      "Tên cá nhân: 9.800.000 VNĐ (Hội Viên: 7.840.000 VNĐ) — Khảo sát Tứ Trụ Bát Tự mệnh chủ để xác định Hỷ Dụng Thần.",
      "Tên công ty / thương hiệu: 15.800.000 VNĐ (Hội Viên: 12.640.000 VNĐ) — Phối hợp bản mệnh người sáng lập và linh hồn ngành nghề.",
      "Phối hợp chuẩn xác Ngũ Cách (Thiên cách, Địa cách, Nhân cách, Ngoại cách, Tổng cách) đạt số lý đại cát.",
      "Bảo đảm âm điệu thanh nhã, hàm nghĩa sâu sắc, biến quẻ Dịch đắc thời đắc địa.",
    ],
  },
  {
    id: "bat-tu",
    number: 3,
    title: "Bát tự (Tứ Trụ Mệnh Lý)",
    chineseTitle: "八字四柱命理",
    category: "bazi",
    standardPriceText: "16.800.000 VNĐ",
    standardPriceNote: "Phí khảo sát & luận giải đại vận trọn đời theo đa trường phái",
    memberPriceText: "1.000.000 VNĐ hoặc tùy hỷ",
    memberOriginalPrice: "16.800.000 VNĐ",
    memberPromoBadge: "Ưu đãi hội viên",
    memberPriceNote: "Áp dụng giá ưu đãi đặc quyền cho Hội Viên Cửu Nhị",
    memberDiscountType: "special_member",
    memberTeaser: "Đăng ký Hội Viên mở khóa giá ưu đãi: 1.000.000 VNĐ hoặc tùy hỷ",
    badge: "Đa Trường Phái Chuyên Sâu",
    summary:
      "Luận giải bản mệnh Bát Tự toàn diện: Cốt cách, tính tình, công danh, tài lộc, tình duyên gia đạo, lục thân và đại vận cuộc đời với sự kết hợp tinh hoa các phái cổ truyền.",
    schools: [
      {
        name: "Bát tự Tô Phái",
        description:
          "Theo thuyết Hàn Nhiệt Mệnh của Tô phái — Tạo Hóa Nguyên Nhược (hay còn gọi là Cùng Thông Bảo Giám), kết hợp linh hoạt phép xem Tướng Tay và Tướng Mặt để định chuẩn Dụng Thần Điều Hầu.",
        statusBadge: "Ứng dụng thực tiễn cao",
      },
      {
        name: "Bát tự Phong Sơn phái",
        description:
          "Dựa trên các trước tác kinh điển: Tam Mệnh Thông Hội, Tích Thiên Tủy (Đích Thiên Tủy), Âm Phù Kinh, Tiêu Tức Phú, Huyền Cơ Phú, Vạn Kim Phú...",
        statusBadge: "Đang phát triển, nghiên cứu",
      },
      {
        name: "Bát tự Manh Phái",
        description:
          "Theo hệ thống truyền thừa khẩu quyết thần diệu của Thầy Hạ Trọng Kỳ (quan sát tượng quái, ứng kỳ, bế khố, khử khí).",
        statusBadge: "Đang nghiên cứu chuyên sâu",
      },
    ],
    details: [
      "Xác định thân cường / thân nhược / tòng cách và chuẩn hóa Ngũ Hành Hỷ Dụng Thần.",
      "Phân tích 10 đại vận can chi, xu hướng tài vận và nghề nghiệp phát triển thuận lợi.",
      "Định hướng hôn nhân, gia đạo, con cái và phương thức tu dưỡng bổ khuyết bản mệnh.",
    ],
  },
  {
    id: "van-han-luu-nien",
    number: 4,
    title: "Vận hạn lưu niên",
    chineseTitle: "流年太歲運限",
    category: "bazi",
    standardPriceText: "9.800.000 VNĐ",
    standardPriceNote: "Chỉ dành riêng cho khách hàng đã từng xem Bát Tự",
    conditionNote: "Dành riêng cho khách đã xem Bát Tự tại Cửu Nhị",
    memberPriceText: "500.000 VNĐ",
    memberOriginalPrice: "9.800.000 VNĐ",
    memberPromoBadge: "Ưu đãi hội viên",
    memberPriceNote: "Dành riêng cho khách đã xem Bát Tự tại Cửu Nhị",
    memberDiscountType: "special_member",
    memberTeaser: "Đăng ký Hội Viên mở khóa giá ưu đãi: 500.000 VNĐ",
    badge: "Khách Cũ Ưu Đãi",
    summary:
      "Chiêm đoán tường tận vận trình năm hiện tại hoặc năm sắp tới, đại hạn kết hợp tiểu hạn, sự xung hợp hình hại của Thái Tuế, lưu nguyệt và phương pháp nghênh cát tị hung.",
    details: [
      "Khảo sát sự tương tác giữa Thiên can Địa chi năm đương quyền với tứ trụ nguyên cục và đại vận.",
      "Cảnh báo trước các tháng xung khắc, hạn tài chính, thị phi, tai ương hoặc thời điểm bứt phá cát lợi.",
      "Tư vấn giải pháp chủ động điều chỉnh tâm thái, phương hướng hành sự và hướng xuất hành hợp khí.",
    ],
  },
  {
    id: "trach-nhat",
    number: 5,
    title: "Trạch nhật, chọn ngày",
    chineseTitle: "擇日擇時吉課",
    category: "calendar",
    standardPriceText: "9.800.000 VNĐ",
    standardPriceNote: "Chọn ngày giờ hoàng đạo đại cát & hướng dẫn nghi thức đầy đủ",
    memberPriceText: "7.840.000 VNĐ",
    memberOriginalPrice: "9.800.000 VNĐ",
    memberPromoBadge: "Ưu đãi hội viên -20%",
    memberPriceNote: "Đã giảm 20% cho Hội Viên Cửu Nhị",
    memberDiscountType: "percent_20",
    memberTeaser: "Đăng ký Hội Viên giảm -20% còn 7.840.000 VNĐ",
    badge: "Hiệp Kỷ Biện Phương Thư",
    summary:
      "Chọn ngày giờ hoàng đạo đại cát cho đại sự: Động thổ xây dựng, Nhập trạch về nhà mới, Cưới hỏi đính hôn, Khai trương công ty, Xuất hành, An táng cầu an dựa trên phép Hiệp Kỷ Biện Phương Thư và Huyền Không Đại Quái.",
    details: [
      "Loại bỏ triệt để các thần sát đại hung (Tam Nương, Nguyệt Kỵ, Sát Chủ, Thọ Tử, Hoang Vu...).",
      "Khảo sát tương hợp giữa Thiên Can - Địa Chi ngày giờ với Bát Tự tuổi gia chủ/đương số.",
      "Ứng dụng phối quẻ Huyền Không Đại Quái nạp khí sinh vượng, đắc Thiên Thời - Địa Lợi - Nhân Hòa.",
      "Cung cấp bản hướng dẫn chi tiết nghi thức khai sự, phương vị xuất hành và giờ khắc tiến hành.",
    ],
  },
  {
    id: "boc-que-hoi-su",
    number: 6,
    title: "Bốc quẻ hỏi sự",
    chineseTitle: "問事占卜神算",
    category: "divination",
    standardPriceText: "Từ 500.000 VNĐ",
    standardPriceNote: "500.000 VNĐ (1 câu hỏi) • 1.000.000 VNĐ (3 câu hỏi)",
    memberPriceText: "Từ 200.000 VNĐ",
    memberOriginalPrice: "500.000 - 1.000.000 VNĐ",
    memberPromoBadge: "Ưu đãi hội viên",
    memberPriceNote: "Ưu đãi Hội Viên giá hiện tại: 200.000 VNĐ (1 câu hỏi) • 500.000 VNĐ (3 câu hỏi)",
    memberDiscountType: "special_member",
    memberTeaser: "Đăng ký Hội Viên mở khóa giá ưu đãi hiện tại: 200.000 VNĐ (1 câu) • 500.000 VNĐ (3 câu)",
    badge: "Đa Dạng Pháp Môn",
    summary:
      "Chiêm bốc định hướng giải đáp các câu hỏi vụ việc cụ thể (công việc, tài vận, tình cảm, đầu tư kinh doanh, thi cử) thông qua các pháp môn: Tarot Kinh Dịch, Quẻ Kinh Dịch, Quẻ Khổng Minh Thần Toán...",
    details: [
      "Giá tiêu chuẩn: Gói 1 câu hỏi 500.000 VNĐ • Gói 3 câu hỏi toàn diện 1.000.000 VNĐ.",
      "Ưu đãi hội viên: Mở khóa mức giá hiện tại (200.000 VNĐ / 1 câu hỏi • 500.000 VNĐ / 3 câu hỏi) sau khi đăng ký Hội Viên Cửu Nhị.",
      "Pháp môn linh hoạt: Tarot Kinh Dịch 64 lá bài, Quẻ Chu Dịch (Chủ - Biến - Hỗ), Quẻ Khổng Minh.",
      "Giải đoán rõ bản chất nguyên nhân, diễn biến hiện tại, xu thế tương lai và lời khuyên sách lược xử lý.",
    ],
  },
  {
    id: "luc-nham",
    number: 7,
    title: "Xem quẻ Lục Nhâm đại độn",
    chineseTitle: "六壬大六壬神課",
    category: "divination",
    standardPriceText: "16.800.000 VNĐ",
    standardPriceNote: "Tam Thức tuyệt kỹ định thời khắc và cát hung đại sự",
    memberPriceText: "1.000.000 VNĐ",
    memberOriginalPrice: "16.800.000 VNĐ",
    memberPromoBadge: "Ưu đãi hội viên",
    memberPriceNote: "Áp dụng giá ưu đãi đặc quyền cho Hội Viên Cửu Nhị",
    memberDiscountType: "special_member",
    memberTeaser: "Đăng ký Hội Viên mở khóa giá ưu đãi: 1.000.000 VNĐ",
    badge: "Tam Thức Tuyệt Kỹ",
    summary:
      "Phép chiêm bốc thượng thừa cổ truyền Đại Lục Nhâm (trong Tam Thức: Thái Ất, Kỳ Môn, Lục Nhâm) dùng Thần Sát, 12 Thiên Tướng, Tứ Khóa, Tam Truyền để đoán định sự việc tinh vi, xác định chính xác cơ duyên và ứng kỳ cát hung.",
    details: [
      "Khảo sát Thiên Bàn - Địa Bàn, Thái Dương Nguyệt Tướng giáp Nhật Khảm.",
      "Lập Tứ Khóa định mối quan hệ chủ khách, sự tình khởi phát.",
      "Khởi Tam Truyền (Sơ truyền, Trung truyền, Mạt truyền) thấy rõ nguồn cơn, phát triển và kết cục sự việc.",
      "Luận đoán chuẩn xác thời điểm ứng nghiệm (ứng kỳ) cho những quyết định trọng đại mang tính bước ngoặt.",
    ],
  },
];

export const HomeSection: React.FC<HomeSectionProps> = ({
  onNavigateTab,
  onOpenDailyHexagram,
  cardImages = {},
  historyCount = 0,
  currentUser = null,
  onOpenAuthModal,
}) => {
  const isMember = Boolean(currentUser?.isMember);
  const today = useMemo(() => new Date(), []);
  const dailyData = useMemo(() => getDailyHexagramData(today), [today]);
  const thongThuData = useMemo(
    () => getThongThuDayDetails(today.getFullYear(), today.getMonth() + 1, today.getDate()),
    [today]
  );

  const { solarDateFormatted, hexNumber, hexagram, advice } = dailyData;
  const cardImage = cardImages[hexNumber];

  // Services filtering & consultation booking modal state
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedConsultService, setSelectedConsultService] = useState<ServiceItem | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [copiedInfo, setCopiedInfo] = useState(false);

  const ZALO_PHONE = "090 285 3305";
  const ZALO_LINK = "https://zalo.me/0902853305";

  const filteredServices = useMemo(() => {
    if (activeCategory === "all") return PAID_SERVICES;
    return PAID_SERVICES.filter((s) => s.category === activeCategory);
  }, [activeCategory]);

  const handleRegisterZalo = (service: ServiceItem) => {
    try {
      const priceInfo = getServicePriceInfo(service, isMember);
      const memberStatusText = isMember
        ? `Hội Viên Cửu Nhị (Đã kích hoạt ${priceInfo.promoBadge || "Ưu Đãi Hội Viên"})`
        : `Khách vãng lai (Chưa đăng ký Hội Viên)`;

      const text = `[CỬU NHỊ 玖貳 - TƯ VẤN PHONG THỦY MỆNH LÝ]
Kính chào Thầy, tôi muốn đăng ký tư vấn dịch vụ:
- Dịch vụ: ${service.number}. ${service.title} (${service.chineseTitle})
- Trạng thái khách hàng: ${memberStatusText}
- Mức phí áp dụng: ${priceInfo.priceText}${priceInfo.priceNote ? ` (${priceInfo.priceNote})` : ""}${service.conditionNote ? `\n- Lưu ý: ${service.conditionNote}` : ""}${!isMember ? `\n- Quyền lợi Hội Viên sau khi đăng ký: ${service.memberTeaser}` : ""}
Xin Thầy tư vấn chi tiết và sắp xếp lịch giúp tôi.
Trang web: Cửu Nhị Phong Thủy Mệnh Lý`;
      navigator.clipboard.writeText(text);
    } catch (err) {
      // ignore
    }
  };

  const handleRegisterMembership = () => {
    try {
      const text = `[CỬU NHỊ 玖貳 - ĐĂNG KÝ THÀNH VIÊN VIP HỘI VIÊN]
Kính chào Thầy, tôi muốn đăng ký Gói Thành Viên Thường Niên (1 Năm):
- Mức phí: 1.000.000 VNĐ / 1 Năm
- Quyền lợi đặc biệt:
  + Được 6 lần bốc quẻ hỏi sự trực tiếp (Trị giá 3.000.000 VNĐ)
  + Hưởng chính sách Ưu Đãi Hội Viên: Bát Tự (1.000.000 VNĐ), Lục Nhâm (1.000.000 VNĐ), Vận Hạn (500.000 VNĐ), Bốc Quẻ Hỏi Sự giá hiện tại (200.000 VNĐ / 500.000 VNĐ)
  + Giảm giá 20% cho tất cả các dịch vụ phong thủy, đặt tên, trạch nhật khác
Xin Thầy xác nhận kích hoạt tài khoản hội viên giúp tôi.
Trang web: Cửu Nhị Phong Thủy Mệnh Lý`;
      navigator.clipboard.writeText(text);
    } catch (err) {
      // ignore
    }
  };

  const handleCopyConsultation = () => {
    if (!selectedConsultService) return;
    const priceInfo = getServicePriceInfo(selectedConsultService, isMember);
    const memberStatusText = isMember
      ? `Hội Viên Cửu Nhị (Đã kích hoạt ${priceInfo.promoBadge || "Ưu Đãi Hội Viên"})`
      : `Khách vãng lai (Chưa đăng ký Hội Viên)`;

    const text = `[ĐĂNG KÝ DỊCH VỤ CỬU NHỊ 玖貳]
- Dịch vụ: ${selectedConsultService.number}. ${selectedConsultService.title} (${priceInfo.priceText})
- Trạng thái khách hàng: ${memberStatusText}
${priceInfo.originalPrice ? `- Giá gốc: ${priceInfo.originalPrice}\n` : ""}${priceInfo.promoBadge ? `- Ưu đãi: ${priceInfo.promoBadge}\n` : ""}${priceInfo.priceNote ? `- Ghi chú giá: ${priceInfo.priceNote}\n` : ""}${selectedConsultService.conditionNote ? `- Điều kiện: ${selectedConsultService.conditionNote}\n` : ""}- Họ và tên: ${customerName || "(Chưa nhập)"}
- Số điện thoại / Zalo: ${customerContact || "(Chưa nhập)"}
- Nội dung câu hỏi / Nhu cầu: ${customerNote || "Xin tư vấn chi tiết về dịch vụ này"}
${!isMember ? `- Quyền lợi Hội Viên sau khi đăng ký: ${selectedConsultService.memberTeaser}\n` : ""}Trang web: Cửu Nhị Phong Thủy Mệnh Lý`;
    navigator.clipboard.writeText(text);
    setCopiedInfo(true);
    setTimeout(() => setCopiedInfo(false), 2500);
  };

  const handleDirectZaloFromModal = () => {
    handleCopyConsultation();
  };

  const portals: {
    numeral: string;
    title: string;
    chinese: string;
    desc: string;
    cta: string;
    icon: React.ComponentType<{ className?: string }>;
    onClick: () => void;
  }[] = [
    {
      numeral: "壹",
      title: "Bốc Bài Kinh Dịch",
      chinese: "周易占卜",
      desc: "Nghi thức Trai Giới Mộc Dục, 8 phương thức khởi quẻ (Chu Dịch, Khổng Minh, Cỏ Thi, Mai Hoa, Lục Nhâm...), giải mã Quẻ Chủ, Hào Động, Quẻ Biến & Quẻ Hỗ.",
      cta: "Bắt đầu bốc quẻ",
      icon: Layers,
      onClick: () => onNavigateTab("divination"),
    },
    {
      numeral: "貳",
      title: "Lịch Dụng Sự & Hiệp Kỷ",
      chinese: "協紀辨方",
      desc: "Lịch vạn sự Thông Thư: Can Chi, Trực Nhật Tinh, 12 Giờ Tâm Ấn Phú, Việc Hỷ Nên Làm & Việc Kỵ Cần Tránh, hướng xuất hành Hỷ Thần, Tài Thần.",
      cta: "Tra cứu Thông Thư",
      icon: CalendarDays,
      onClick: () => onNavigateTab("calendar"),
    },
    {
      numeral: "參",
      title: "Hàn Nhiệt Mệnh & Vận 2027",
      chinese: "寒熱命理",
      desc: "Trường phái Tô Dân Phong: Tra cứu Hàn - Nhiệt - Bình Mệnh, Cửu Cung Phi Tinh, Phạm Thái Tuế, Thảm Cửa Vượng Trạch & 12 Con Giáp 2027.",
      cta: "Khám phá Hàn Nhiệt Mệnh",
      icon: Flame,
      onClick: () => onNavigateTab("hannhiet"),
    },
    {
      numeral: "肆",
      title: "Lục Thập Hoa Giáp",
      chinese: "六十花甲",
      desc: "Kho tàng 60 Can Chi Nạp Âm Ngũ Hành, luận giải hình tượng cát hung nhân duyên, bổ trợ Bát Tự & Lục Nhâm và nạp hình ảnh cá nhân.",
      cta: "Khám phá 60 Hoa Giáp",
      icon: Compass,
      onClick: () => onNavigateTab("jiazi"),
    },
    {
      numeral: "伍",
      title: "Thuyết Minh 64 Quẻ",
      chinese: "周易闡微",
      desc: "Toàn thư giải nghĩa 64 quẻ Kinh Dịch: Quái Từ, Thoán Truyện, Đại Tượng Truyện, Hào Từ, giải mã triết lý âm dương và lời bình ứng dụng đời sống.",
      cta: "Đọc sách Thuyết Minh",
      icon: BookOpen,
      onClick: () => onNavigateTab("manual"),
    },
    {
      numeral: "陸",
      title: "Quẻ Ngày (Lịch Dương)",
      chinese: "每日一卦",
      desc: "Nhận một quẻ Kinh Dịch ngẫu nhiên mỗi ngày theo lịch dương kèm lời bình ngắn gọn, đạo xử thế, việc nên làm và việc cần tránh.",
      cta: "Mở quẻ ngày hôm nay",
      icon: Sun,
      onClick: onOpenDailyHexagram,
    },
    {
      numeral: "柒",
      title: "Sổ Tay Lịch Sử Bói",
      chinese: "占卜記錄",
      desc: "Lưu trữ các lần chiêm bốc, câu hỏi tâm niệm, kết quả quẻ, hỗ trợ xuất hình ảnh và đồng bộ Google Workspace (Docs/Sheets).",
      cta: `Xem lịch sử (${historyCount})`,
      icon: History,
      onClick: () => onNavigateTab("history"),
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 animate-in fade-in duration-300">
      {/* ================= HERO ================= */}
      <section className="royal-frame relative px-6 pt-16 pb-12 sm:px-12 sm:pt-24 sm:pb-16 text-center overflow-hidden">
        <span className="royal-corner tl" />
        <span className="royal-corner tr" />
        <span className="royal-corner bl" />
        <span className="royal-corner br" />

        {/* La bàn Bát Quái chìm phía sau */}
        <LuopanRing className="pointer-events-none absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[720px] max-w-none opacity-[0.09]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_45%,rgba(11,10,8,0.85),transparent_75%)]" />

        <div className="relative max-w-3xl mx-auto">
          <div className="royal-reveal" style={{ animationDelay: "0ms" }}>
            <BrandMark size={56} className="mx-auto" />
          </div>

          <div className="royal-reveal mt-7" style={{ animationDelay: "60ms" }}>
            <div className="royal-eyebrow">Mệnh Lý · Phong Thủy · Kinh Dịch</div>
          </div>

          <h1
            className="royal-reveal royal-title mt-6 [text-wrap:balance] text-[2.6rem] sm:text-6xl md:text-[4.75rem] !leading-[1.05]"
            style={{ animationDelay: "120ms" }}
          >
            Tinh hoa huyền học
            <span className="block italic royal-gold-text">phương Đông</span>
          </h1>

          <div className="royal-reveal mt-8 flex items-center justify-center gap-4" style={{ animationDelay: "180ms" }}>
            <span className="h-px w-10 sm:w-20 bg-gradient-to-r from-transparent to-gold-700" />
            <span className="font-serif text-base sm:text-xl tracking-[0.4em] text-gold-400 pl-[0.4em]">玖貳命理風水</span>
            <span className="h-px w-10 sm:w-20 bg-gradient-to-l from-transparent to-gold-700" />
          </div>

          <p
            className="royal-reveal mt-8 text-[15px] sm:text-[17px] leading-[1.8] text-ivory-300 font-serif max-w-2xl mx-auto"
            style={{ animationDelay: "240ms" }}
          >
            Luận giải riêng tư theo nguyên bản cổ thư — Chu Dịch Chiêm Bốc, Hiệp Kỷ Biện Phương Thư,
            Tứ Trụ Bát Tự và Phong Thủy Dương Trạch — dành cho những quyết định hệ trọng của
            đời người, gia đạo và cơ nghiệp.
          </p>

          <div
            className="royal-reveal mt-11 flex flex-col sm:flex-row items-center justify-center gap-3"
            style={{ animationDelay: "300ms" }}
          >
            <a href="#dich-vu-tra-phi" className="royal-btn w-full sm:w-auto">
              Đặt lịch luận giải riêng
              <ArrowRight className="w-4 h-4" />
            </a>
            <button type="button" onClick={() => onNavigateTab("divination")} className="royal-btn-ghost w-full sm:w-auto">
              Bốc quẻ Kinh Dịch
            </button>
          </div>

          <div
            className="royal-reveal mt-9 flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
            style={{ animationDelay: "360ms" }}
          >
            <button type="button" onClick={onOpenDailyHexagram} className="royal-link cursor-pointer">
              <Sun className="w-3.5 h-3.5 text-gold-500" />
              Quẻ ngày hôm nay
            </button>
            <a href={ZALO_LINK} target="_blank" rel="noopener noreferrer" className="royal-link">
              <MessageSquare className="w-3.5 h-3.5 text-gold-500" />
              Zalo riêng <span className="tabular-nums">{ZALO_PHONE}</span>
            </a>
          </div>
        </div>

        {/* Dải số liệu học thuật */}
        <dl
          className="royal-reveal relative mt-14 sm:mt-16 pt-8 border-t border-gold-800 grid grid-cols-2 md:grid-cols-4 gap-y-7 max-w-4xl mx-auto"
          style={{ animationDelay: "420ms" }}
        >
          {[
            { value: "64", label: "Quẻ Kinh Dịch", chinese: "六十四卦" },
            { value: "60", label: "Hoa Giáp", chinese: "六十花甲" },
            { value: "8", label: "Phép chiêm đoán", chinese: "八法起卦" },
            { value: "7", label: "Dịch vụ chuyên sâu", chinese: "七項服務" },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className={`px-3 ${index % 2 === 1 ? "border-l border-gold-800" : ""} ${
                index === 2 ? "md:border-l md:border-gold-800" : ""
              }`}
            >
              <dt className="sr-only">{stat.label}</dt>
              <dd className="font-display text-4xl sm:text-5xl text-gold-300 leading-none tabular-nums">{stat.value}</dd>
              <dd className="mt-2.5 text-[10px] sm:text-[11px] font-sans uppercase tracking-[0.12em] sm:tracking-[0.2em] text-ivory-300 whitespace-nowrap">
                {stat.label}
              </dd>
              <dd className="mt-1 text-[11px] font-serif tracking-[0.3em] text-gold-700">{stat.chinese}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ================= CÁC PHÂN HỆ HỌC THUẬT ================= */}
      <section id="cac-phan-he-hoc-thuat" className="scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto">
          <div className="royal-eyebrow">Nền tảng học thuật chính tống</div>
          <h2 className="royal-title mt-4 text-3xl sm:text-[2.75rem]">Các phân hệ học thuật</h2>
          <p className="mt-4 text-sm text-ivory-500 font-serif leading-relaxed">
            Tri thức kinh điển, công cụ xem quẻ và dụng sự phong thủy cổ truyền phương Đông.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {portals.map((portal, index) => {
            const Icon = portal.icon;
            return (
              <button
                key={portal.title}
                type="button"
                onClick={portal.onClick}
                className={`royal-card group p-6 sm:p-7 text-left flex flex-col cursor-pointer ${index === 0 ? "sm:col-span-2" : ""}`}
              >
                <div className="flex items-start justify-between">
                  <Icon className="w-5 h-5 text-gold-500" />
                  <span className="font-serif text-2xl text-gold-700 group-hover:text-gold-500 transition-colors leading-none">
                    {portal.numeral}
                  </span>
                </div>
                <h3 className="font-display text-2xl text-ivory-100 mt-6 leading-tight">{portal.title}</h3>
                <div className="text-[11px] font-serif tracking-[0.3em] text-gold-600 mt-1.5">{portal.chinese}</div>
                <p className="mt-4 text-[13px] text-ivory-500 font-serif leading-relaxed flex-1">{portal.desc}</p>
                <div className="mt-6 pt-4 border-t border-gold-800 flex items-center justify-between text-[11px] font-sans uppercase tracking-[0.16em] text-gold-500 group-hover:text-gold-300 transition-colors">
                  <span>{portal.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ================= DAILY HEXAGRAM & TODAY ENERGY SUMMARY ================= */}
      <section className="royal-frame p-5 sm:p-8">
        <div className="flex flex-col md:flex-row items-stretch justify-between gap-5">
          {/* Left: Quẻ Ngày preview */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-sans font-medium uppercase tracking-[0.24em] text-gold-500 flex items-center gap-2">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>QUẺ NGÀY KINH DỊCH • {solarDateFormatted}</span>
              </span>
              <button
                type="button"
                onClick={onOpenDailyHexagram}
                className="text-xs text-amber-400 hover:text-amber-200 underline cursor-pointer font-serif font-semibold"
              >
                Xem Toàn Văn »
              </button>
            </div>

            <div className="flex items-center gap-4 bg-[#140E08]/80 p-3 rounded-xl border border-[#3E2B17]">
              {cardImage ? (
                <div className="w-14 h-20 rounded-lg overflow-hidden border border-[#C9A55A] shadow shrink-0">
                  <img
                    src={cardImage}
                    alt={hexagram.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#D6B97A] to-[#75511A] flex flex-col items-center justify-center text-[#14120F] shadow border border-[#E6D3A3] shrink-0 font-bold">
                  <span className="text-xl leading-none">☯</span>
                  <span className="text-[9px] font-mono mt-0.5">#{hexNumber}</span>
                </div>
              )}

              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-serif font-bold text-base sm:text-lg text-[#F5EAD4]">
                    Quẻ #{hexNumber}: {hexagram.name} ({hexagram.vietnameseName})
                  </h3>
                  <span className="text-[11px] font-serif font-bold text-amber-300 px-2 py-0.5 rounded bg-amber-950/80 border border-amber-600/60">
                    {advice.headline}
                  </span>
                </div>
                <p className="text-xs text-[#C8B89E] font-serif line-clamp-2">
                  {advice.summary}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Thông Thư Lịch Dụng Sự tóm lược */}
          <div className="w-full md:w-80 flex flex-col justify-between p-3.5 rounded-xl bg-[#171009] border border-[#48331A] space-y-2">
            <div className="flex items-center justify-between border-b border-[#352514] pb-2">
              <span className="text-xs font-serif font-bold text-amber-300 flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Khí Tiết Dụng Sự Hôm Nay</span>
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${thongThuData.overallAssessment.badgeClass}`}>
                {thongThuData.overallAssessment.title}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-serif">
              <div className="space-y-0.5">
                <span className="text-[10px] text-[#8C7D6B] font-mono block">ÂM LỊCH</span>
                <span className="text-[#DECBB3] font-bold">
                  {thongThuData.lunarDate.day}/{thongThuData.lunarDate.month} ({thongThuData.lunarDate.monthFullName})
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] text-[#8C7D6B] font-mono block">CAN CHI NGÀY</span>
                <span className="text-[#E6D3A3] font-bold">
                  {thongThuData.dayCanChi.fullName}
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] text-[#8C7D6B] font-mono block">NẠP ÂM NGŨ HÀNH</span>
                <span className="text-emerald-300 truncate block">
                  {thongThuData.napAm.napAm}
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] text-[#8C7D6B] font-mono block">TRỰC NHẬT TINH</span>
                <span className="text-amber-200 truncate block">
                  {thongThuData.trucNhatTinh.name} ({thongThuData.trucNhatTinh.nature})
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#352514] flex items-center justify-between">
              <span className="text-[11px] text-[#A89882] font-serif">
                Hỷ Thần: {thongThuData.xuatHanh.hyThan.direction} • Tài Thần: {thongThuData.xuatHanh.taiThan.direction}
              </span>
              <button
                type="button"
                onClick={() => onNavigateTab("calendar")}
                className="text-xs text-amber-400 hover:text-white font-serif font-bold cursor-pointer"
              >
                Chi tiết »
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= DỊCH VỤ TRẢ PHÍ (CỬU NHỊ MỆNH LÝ PHONG THỦY) ================= */}
      <section id="dich-vu-tra-phi" className="space-y-6 pt-2 scroll-mt-20">
        {/* Header section title */}
        <div className="text-center space-y-4">
          <div className="royal-eyebrow">Dịch vụ tư vấn chuyên sâu · 收費服務</div>

          <h2 className="royal-title text-3xl sm:text-[2.75rem]">
            Dịch vụ Phong Thủy &amp; Mệnh Lý
          </h2>

          <p className="text-sm text-ivory-500 font-serif max-w-2xl mx-auto leading-relaxed">
            Dịch vụ tư vấn thực địa và luận đoán chuẩn xác theo nguyên bản cổ thư phương Đông, kết hợp khảo sát trực tiếp, tướng pháp và tam thức bí truyền.
          </p>

          {/* Quick Zalo Hotline & Nhóm Zalo Banner */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            <a href={ZALO_LINK} target="_blank" rel="noopener noreferrer" className="royal-link">
              <MessageSquare className="w-3.5 h-3.5 text-gold-500" />
              Hotline / Zalo <span className="tabular-nums">{ZALO_PHONE}</span>
            </a>

            <a
              href="https://zalo.me/g/vwzsqvnh3gdbzst2psyh"
              target="_blank"
              rel="noopener noreferrer"
              className="royal-link"
            >
              <span>Tham gia nhóm Zalo Cửu Nhị</span>
              <span className="text-gold-500">→</span>
            </a>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-x-1 gap-y-1 pt-4 border-b border-gold-800/80">
            {[
              { id: "all", label: "Tất Cả Dịch Vụ (7)" },
              { id: "fengshui", label: "Phong Thủy Dương Trạch" },
              { id: "naming", label: "Đặt Tên Cát Tường" },
              { id: "bazi", label: "Bát Tự & Vận Hạn" },
              { id: "calendar", label: "Trạch Nhật Chọn Ngày" },
              { id: "divination", label: "Chiêm Bốc & Lục Nhâm" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                className={`-mb-px px-3 sm:px-4 py-2.5 text-[11px] sm:text-xs font-sans uppercase tracking-[0.12em] border-b transition-colors cursor-pointer ${
                  activeCategory === tab.id
                    ? "border-gold-400 text-gold-300"
                    : "border-transparent text-ivory-500 hover:text-ivory-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Banner thông báo trạng thái Hội Viên & Ưu Đãi */}
        {isMember ? (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/80 via-[#23170D] to-amber-950/80 border-2 border-[#C9A55A]/70 shadow-lg shadow-amber-950/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-serif">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center shrink-0">
                <Crown className="w-5 h-5 text-amber-300 animate-pulse" />
              </div>
              <div>
                <span className="text-sm font-bold text-[#E6D3A3] flex items-center gap-2">
                  <span>ĐẶC QUYỀN HỘI VIÊN ĐANG KÍCH HOẠT</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-900/80 text-amber-200 border border-amber-600/60 font-mono">
                    Hội Viên Cửu Nhị
                  </span>
                </span>
                <span className="text-[#E0CFB9] leading-relaxed block mt-0.5">
                  Tài khoản của quý bạn đã kích hoạt hội viên: Biểu phí đang tự động áp dụng <strong>Giá Ưu Đãi Hội Viên</strong> (Bát Tự, Vận Hạn, Bốc Quẻ, Lục Nhâm) và <strong>Ưu Đãi -20%</strong> cho toàn bộ các dịch vụ còn lại.
                </span>
              </div>
            </div>
            <a
              href="#membership-vip-section"
              className="px-3.5 py-1.5 rounded-xl bg-[#2A1D0F] hover:bg-[#382715] text-amber-300 border border-amber-600/40 text-[11px] font-bold shrink-0 transition-colors cursor-pointer whitespace-nowrap"
            >
              Xem Thẻ Hội Viên ➔
            </a>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#24170D] via-[#1B1108] to-[#24170D] border border-[#614522] shadow-md flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-serif">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <span className="text-sm font-bold text-[#E6D3A3] block">
                  CHÍNH SÁCH ƯU ĐÃI DÀNH RIÊNG CHO HỘI VIÊN
                </span>
                <span className="text-[#C8B89E] leading-relaxed block mt-0.5">
                  Bảng giá dưới đây đang hiển thị biểu phí tiêu chuẩn. <strong>Sau khi quý bạn đăng ký hội viên</strong>, hệ thống sẽ mở khóa mức <strong>Giá Ưu Đãi Hội Viên</strong> (Bát Tự, Vận Hạn, Bốc Quẻ, Lục Nhâm) và giảm <strong>-20% cho tất cả các dịch vụ còn lại</strong>!
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (onOpenAuthModal) onOpenAuthModal("register");
                  else {
                    const el = document.getElementById("membership-vip-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C9A55A] to-[#B38728] hover:brightness-110 active:scale-95 text-[#120F0C] font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Crown className="w-4 h-4 text-[#120F0C]" />
                <span>Đăng Ký Hội Viên Ngay</span>
              </button>
            </div>
          </div>
        )}

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredServices.map((service) => {
            const priceInfo = getServicePriceInfo(service, isMember);

            return (
              <div
                key={service.id}
                className={`royal-card flex flex-col justify-between overflow-hidden ${
                  service.id === "duong-trach" ? "!border-gold-500/70" : ""
                }`}
              >
                {/* Card Header Top */}
                <div className="p-5 sm:p-6 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 border border-gold-700 text-gold-400 flex items-center justify-center font-display text-base shrink-0">
                        {service.number}
                      </div>
                      <div>
                        <h3 className="font-display text-[22px] text-ivory-100 leading-tight">
                          {service.title}
                        </h3>
                        <span className="text-[11px] font-serif text-[#A89882] tracking-wider block">
                          {service.chineseTitle}
                        </span>
                      </div>
                    </div>

                    {service.badge && (
                      <span className="text-[10px] font-serif font-bold px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-600/50 shrink-0">
                        {service.badge}
                      </span>
                    )}
                  </div>

                  {/* Price Display */}
                  <div className="py-3 border-y border-gold-800 space-y-2">
                    {(priceInfo.originalPrice || priceInfo.promoBadge) && (
                      <div className="flex items-center gap-2 flex-wrap text-xs font-serif">
                        {priceInfo.originalPrice && (
                          <>
                            <span className="text-[#8E7E6A]">Giá gốc:</span>
                            <span className="line-through text-[#9E8B76] font-medium decoration-rose-500/80 decoration-2">
                              {priceInfo.originalPrice}
                            </span>
                          </>
                        )}
                        {priceInfo.promoBadge && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/90 text-amber-300 border border-amber-600/60 font-mono shadow-xs">
                            ✦ {priceInfo.promoBadge}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="font-display text-2xl sm:text-[28px] font-semibold text-gold-300">
                        {priceInfo.priceText}
                      </span>
                    </div>
                    {priceInfo.priceNote && (
                      <div className="text-[11px] font-serif text-amber-200/90 leading-tight">
                        {priceInfo.priceNote}
                      </div>
                    )}
                    {service.conditionNote && (
                      <div className="inline-flex items-center gap-1 text-[11px] text-rose-300 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-900/40 mt-0.5">
                        <BadgeAlert className="w-3 h-3 text-rose-400 shrink-0" />
                        <span>{service.conditionNote}</span>
                      </div>
                    )}

                    {/* Member Benefit Callout */}
                    {!isMember ? (
                      <div className="pt-2 border-t border-[#2F2113] flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-[11px] font-serif text-amber-300 min-w-0">
                          <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="truncate">{service.memberTeaser}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (onOpenAuthModal) onOpenAuthModal("register");
                            else {
                              const el = document.getElementById("membership-vip-section");
                              if (el) el.scrollIntoView({ behavior: "smooth" });
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#C9A55A] to-[#B38728] hover:brightness-110 active:scale-95 text-[#120F0C] text-[10px] font-serif font-bold shrink-0 cursor-pointer shadow-xs whitespace-nowrap"
                        >
                          Đăng ký
                        </button>
                      </div>
                    ) : (
                      <div className="pt-1.5 border-t border-[#2F2113] flex items-center gap-1.5 text-[11px] font-serif text-emerald-300">
                        <Crown className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                        <span>{service.memberDiscountType === "percent_20" ? "Đã áp dụng ưu đãi Hội Viên -20%" : "Đã kích hoạt mức giá Ưu Đãi Hội Viên"}</span>
                      </div>
                    )}
                  </div>

                {/* Summary */}
                <p className="text-xs text-[#C8B89E] font-serif leading-relaxed">
                  {service.summary}
                </p>

                {/* Specific Schools (for Bát Tự) */}
                {service.schools && service.schools.length > 0 && (
                  <div className="space-y-2.5 pt-2 border-t border-[#352514]">
                    <div className="text-[11px] font-serif font-bold text-[#E6D3A3] flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-amber-400" />
                      <span>Các hệ phái nghiên cứu & ứng dụng:</span>
                    </div>
                    <div className="space-y-2">
                      {service.schools.map((school, sIdx) => (
                        <div
                          key={sIdx}
                          className="p-2.5 rounded-lg bg-[#140E08]/70 border border-[#332313] space-y-1"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-serif font-bold text-[#EED8B5]">
                              • {school.name}
                            </span>
                            {school.statusBadge && (
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-medium ${
                                school.statusBadge.includes("Ứng dụng")
                                  ? "bg-emerald-950/80 text-emerald-300 border border-emerald-700/50"
                                  : "bg-amber-950/60 text-amber-300 border border-amber-800/40"
                              }`}>
                                {school.statusBadge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#A89882] font-serif leading-normal">
                            {school.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Detailed bullet points */}
                {service.details && !service.schools && (
                  <div className="space-y-1.5 pt-2 border-t border-[#352514]">
                    <span className="text-[11px] font-serif font-bold text-[#E6D3A3] block">
                      Chi tiết nội dung & phạm vi:
                    </span>
                    <ul className="space-y-1 text-xs text-[#B8A790] font-serif">
                      {service.details.map((item, dIdx) => (
                        <li key={dIdx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Card Footer Action */}
              <div className="p-5 pt-0">
                <a
                  href={ZALO_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleRegisterZalo(service)}
                  className="royal-btn-ghost w-full !py-2.5 !text-[11px] text-center"
                  title={`Nhấn để tự động copy thông tin dịch vụ và nhảy qua Zalo số ${ZALO_PHONE}`}
                >
                  <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                  <span>Đăng ký tư vấn qua Zalo</span>
                </a>
              </div>
            </div>
          );
        })}
        </div>

        {/* Commitment & Transparency Notice */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#171009] border border-[#48331A] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-serif text-[#C8B89E]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-600/40 text-amber-300 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <strong className="text-[#E6D3A3] block text-sm">
                Cam Kết Học Thuật & Bảo Mật Tuyệt Đối Cửu Nhị
              </strong>
              <span>
                Toàn bộ thông tin Bát Tự, bản vẽ nhà đất và câu hỏi riêng tư của quý khách luôn được giữ kín tuyệt đối, luận giải trung thực theo đúng đạo lý cổ nhân.
              </span>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <a
              href={ZALO_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A55A] to-[#B38728] hover:brightness-110 text-[#120F0C] font-serif font-bold text-xs shadow-md transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-[#120F0C]" />
              <span>Nhảy Qua Zalo: {ZALO_PHONE}</span>
            </a>
          </div>
        </div>

        {/* ================= GÓI ĐĂNG KÝ THÀNH VIÊN VIP (MEMBERSHIP 1 NĂM) - ĐẶC QUYỀN HỘI VIÊN THƯỜNG NIÊN ================= */}
        <div id="membership-vip-section" className="royal-frame mt-6 p-6 sm:p-10">
          <span className="royal-corner tl" />
          <span className="royal-corner tr" />
          <span className="royal-corner bl" />
          <span className="royal-corner br" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
            {/* Left Content */}
            <div className="flex-1 space-y-4 text-center lg:text-left">
              <div className="royal-eyebrow before:!hidden lg:after:!block">
                <Crown className="w-3.5 h-3.5" />
                <span>{isMember ? "Hội viên đang kích hoạt · 貴賓會員" : "Đặc quyền hội viên · 貴賓會員"}</span>
              </div>

              <div>
                <h3 className="royal-title text-3xl sm:text-4xl">
                  {isMember ? "Thẻ Hội Viên Cửu Nhị (Đang Kích Hoạt)" : "Đăng Ký Thành Viên Cửu Nhị (1 Năm)"}
                </h3>
                <p className="text-xs sm:text-sm text-[#D8C7B0] font-serif mt-1.5 leading-relaxed max-w-2xl">
                  {isMember
                    ? "Quý bạn đã đăng ký gia nhập Hội viên thân thiết của Phong Thủy Mệnh Lý Cửu Nhị. Toàn bộ giá Ưu Đãi Hội Viên và chính sách giảm -20% đang được kích hoạt tự động trên trang web."
                    : "Gia nhập Hội viên thân thiết của Phong Thủy Mệnh Lý Cửu Nhị để mở khóa toàn bộ mức giá Ưu Đãi Hội Viên, giảm -20% tất cả các dịch vụ khác và nhận 6 lượt bốc quẻ hỏi sự trực tiếp."}
                </p>
              </div>

              {/* 2 Core Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <div className="p-3.5 rounded-2xl bg-[#150E07]/80 border border-[#523A1F] flex items-start gap-3 hover:border-amber-500/50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-950/60 border border-amber-500/40 flex items-center justify-center shrink-0 text-amber-300">
                    <Gift className="w-5 h-5 text-amber-300" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-serif font-bold text-[#E6D3A3] flex items-center gap-1.5">
                      <span>Tặng 6 Lần Bốc Quẻ Hỏi Sự</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-mono font-normal">Trị giá 3.000.000 VNĐ</span>
                    </div>
                    <p className="text-xs text-[#BBA990] font-serif mt-0.5 leading-relaxed">
                      Sử dụng cho 6 câu hỏi vụ việc trong năm qua Tarot Kinh Dịch, Chu Dịch hoặc Quẻ Khổng Minh cùng Thầy.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#150E07]/80 border border-[#523A1F] flex items-start gap-3 hover:border-amber-500/50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-rose-950/60 border border-rose-500/40 flex items-center justify-center shrink-0 text-rose-300">
                    <Percent className="w-5 h-5 text-rose-300" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-serif font-bold text-[#E6D3A3] flex items-center gap-1.5">
                      <span>Giảm Giá 20% Tất Cả Dịch Vụ Khác</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-700/60 font-mono font-normal">Tiết kiệm lớn</span>
                    </div>
                    <p className="text-xs text-[#BBA990] font-serif mt-0.5 leading-relaxed">
                      Tự động áp dụng giảm -20% cho Phong thủy dương trạch, Đặt tên, Trạch nhật và giá ưu đãi đặc quyền cho Bát tự, Vận hạn lưu niên, Lục Nhâm.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Price & CTA Card */}
            <div className="w-full lg:w-72 shrink-0 p-5 rounded-2xl bg-[#120B05] border border-[#614522] text-center space-y-4 shadow-xl">
              <div>
                <span className="text-[11px] font-serif uppercase tracking-wider text-[#A89882] block">
                  {isMember ? "Trạng Thái Tài Khoản" : "Phí Hội Viên Thường Niên"}
                </span>
                <div className="font-display text-4xl sm:text-5xl font-semibold text-gold-300 mt-1">
                  {isMember ? "ĐÃ KÍCH HOẠT" : "1.000.000 VNĐ"}
                </div>
                <div className="text-xs font-serif font-bold text-amber-300/90 mt-0.5">
                  Thời hạn: 1 Năm (365 Ngày)
                </div>
              </div>

              <div className="space-y-1.5 text-[11px] font-serif text-[#C4B299] text-left border-t border-[#362515] pt-3">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{isMember ? "Quyền lợi thành viên đang áp dụng" : `Kích hoạt ngay qua Zalo số ${ZALO_PHONE}`}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Theo dõi lịch sử và số lượt quẻ hỏi sự</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Ưu tiên xếp lịch tư vấn nhanh nhất</span>
                </div>
              </div>

              <div className="space-y-2">
                {!isMember && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenAuthModal) onOpenAuthModal("register");
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#C9A55A] via-[#F2D075] to-[#B38728] hover:brightness-110 active:scale-95 text-[#120F0C] font-serif font-bold text-xs shadow-lg shadow-amber-950/70 transition-all cursor-pointer text-center"
                  >
                    <Crown className="w-4 h-4 shrink-0 text-[#120F0C]" />
                    <span>Đăng Ký Hội Viên Trên Web</span>
                  </button>
                )}

                <a
                  href={ZALO_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleRegisterMembership}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-serif font-bold text-xs shadow-md transition-all cursor-pointer text-center ${
                    isMember
                      ? "bg-gradient-to-r from-[#C9A55A] to-[#B38728] text-[#120F0C] hover:brightness-110"
                      : "bg-[#251A10] hover:bg-[#342417] text-[#E6D3A3] border border-[#5C4124]"
                  }`}
                  title={`Nhấn để tự động copy thông tin đăng ký thành viên 1.000.000 VNĐ/năm và nhảy qua Zalo số ${ZALO_PHONE}`}
                >
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  <span>{isMember ? "Gia Hạn / Liên Hệ Qua Zalo" : "Đăng Ký Hội Viên Qua Zalo"}</span>
                </a>
              </div>

              <div className="text-[10px] text-[#8E7E6A] font-serif">
                Zalo tư vấn: <strong className="text-emerald-400 font-mono">{ZALO_PHONE}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CỬU NHỊ PHILOSOPHY FOOTER BANNER ================= */}
      <section className="py-10 sm:py-14 text-center space-y-5 border-t border-gold-800/80">
        <div className="royal-eyebrow">Ý nghĩa danh xưng · 玖貳</div>
        <BrandMark size={88} className="mx-auto" />
        <div className="font-display italic text-2xl sm:text-[2rem] leading-snug text-ivory-100 max-w-2xl mx-auto">
          "Cửu Nhị: Hiện long tại điền, lợi kiến đại nhân."
        </div>
        <div className="text-sm text-ivory-500 font-serif max-w-xl mx-auto leading-relaxed">
          Trong Kinh Dịch, hào Cửu Nhị của quẻ Càn là rồng đã hiện ra trên đồng ruộng, đức trạch bao la, người quân tử giữ lòng chân chính để phụng sự đạo lý, hướng tới sự hanh thông và trí tuệ sáng suốt.
        </div>
        <div className="text-[11px] font-sans uppercase tracking-[0.24em] text-gold-600 max-w-lg mx-auto leading-loose">
          Biểu tượng Cửu Nhị: sáu hào dương của quẻ Càn trong khung Bát Quái —{" "}
          <span className="text-cinnabar-400">hào thứ hai điểm son</span>
        </div>
      </section>

      {/* ================= CONSULTATION BOOKING MODAL ================= */}
      {selectedConsultService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl bg-gradient-to-b from-[#22170E] via-[#1A110A] to-[#130D08] border-2 border-[#8E692B] shadow-2xl p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                setSelectedConsultService(null);
                setCopiedInfo(false);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[#A89882] hover:text-white hover:bg-[#332214] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title */}
            <div className="space-y-1">
              <span className="text-[11px] font-serif font-bold text-amber-400 uppercase tracking-wider block">
                ĐĂNG KÝ TƯ VẤN DỊCH VỤ • CỬU NHỊ
              </span>
              <h3 className="text-xl font-serif font-bold text-[#F5EAD4]">
                {selectedConsultService.number}. {selectedConsultService.title}
              </h3>
              {(() => {
                const priceInfo = getServicePriceInfo(selectedConsultService, isMember);
                return (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {priceInfo.originalPrice && (
                        <span className="text-xs font-serif text-[#9E8B76] line-through decoration-rose-500/80">
                          Giá gốc: {priceInfo.originalPrice}
                        </span>
                      )}
                      <div className="text-sm font-serif font-bold text-amber-300">
                        {isMember ? "Giá ưu đãi Hội Viên: " : "Biểu phí tiêu chuẩn: "}
                        {priceInfo.priceText}
                      </div>
                      {priceInfo.promoBadge && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/90 text-amber-300 border border-amber-600/60 font-mono">
                          ✦ {priceInfo.promoBadge}
                        </span>
                      )}
                    </div>
                    {priceInfo.priceNote && (
                      <div className="text-xs font-serif text-[#C8B89E]">
                        ({priceInfo.priceNote})
                      </div>
                    )}
                    {selectedConsultService.conditionNote && (
                      <div className="text-xs font-serif text-rose-300">
                        Lưu ý: {selectedConsultService.conditionNote}
                      </div>
                    )}
                    {!isMember ? (
                      <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-600/40 flex items-center justify-between gap-2 mt-2">
                        <div className="flex items-center gap-1.5 text-xs text-amber-300 font-serif min-w-0">
                          <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="truncate">{selectedConsultService.memberTeaser}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedConsultService(null);
                            if (onOpenAuthModal) onOpenAuthModal("register");
                            else {
                              const el = document.getElementById("membership-vip-section");
                              if (el) el.scrollIntoView({ behavior: "smooth" });
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#C9A55A] to-[#B38728] text-[#120F0C] text-[10px] font-serif font-bold shrink-0 cursor-pointer shadow-xs whitespace-nowrap"
                        >
                          Đăng ký Hội Viên
                        </button>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 text-xs text-emerald-300 font-serif bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-600/40 mt-1">
                        <Crown className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                        <span>Đã kích hoạt đặc quyền ưu đãi dành cho Hội Viên Cửu Nhị</span>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Input Form Fields */}
            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-serif text-[#D4C3AC] block mb-1">
                  Họ và tên của quý khách:
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn An"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#140E08] border border-[#48331A] text-sm text-[#F5EAD4] placeholder-[#705C48] focus:outline-none focus:border-[#C9A55A]"
                />
              </div>

              <div>
                <label className="text-xs font-serif text-[#D4C3AC] block mb-1">
                  Số điện thoại / Zalo liên hệ:
                </label>
                <input
                  type="text"
                  value={customerContact}
                  onChange={(e) => setCustomerContact(e.target.value)}
                  placeholder="Ví dụ: 0912 345 678"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#140E08] border border-[#48331A] text-sm text-[#F5EAD4] placeholder-[#705C48] focus:outline-none focus:border-[#C9A55A]"
                />
              </div>

              <div>
                <label className="text-xs font-serif text-[#D4C3AC] block mb-1">
                  Nội dung câu hỏi / Tình trạng cần tư vấn:
                </label>
                <textarea
                  rows={3}
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  placeholder="Quý khách vui lòng ghi tóm tắt yêu cầu (năm sinh âm/dương lịch, địa chỉ khảo sát, số lượng câu hỏi, v.v.)..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#140E08] border border-[#48331A] text-sm text-[#F5EAD4] placeholder-[#705C48] focus:outline-none focus:border-[#C9A55A]"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <a
                href={ZALO_LINK}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleDirectZaloFromModal}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#C9A55A] via-[#D6B97A] to-[#B38728] text-[#120F0C] font-serif font-bold text-sm shadow-lg shadow-amber-950/60 hover:brightness-110 active:scale-95 transition-all cursor-pointer text-center"
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span>Nhảy Qua Zalo ({ZALO_PHONE}) & Gửi Yêu Cầu</span>
              </a>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyConsultation}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#20160E] hover:bg-[#2C1E14] text-[#E6D3A3] border border-[#523A1F] font-serif font-semibold text-xs transition-all cursor-pointer"
                >
                  {copiedInfo ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Đã Sao Chép!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao Chép Mẫu Tin Nhắn</span>
                    </>
                  )}
                </button>

                <a
                  href="tel:0902853305"
                  className="px-3 py-2 rounded-xl bg-[#20160E] hover:bg-[#2C1E14] text-[#D4C3AC] hover:text-white border border-[#523A1F] font-serif font-semibold text-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>Gọi {ZALO_PHONE}</span>
                </a>
              </div>

              <p className="text-[11px] text-[#A89882] font-serif text-center pt-1">
                Khi nhấn <strong className="text-[#E6D3A3]">"Nhảy Qua Zalo"</strong>, hệ thống tự động sao chép thông tin vào bộ nhớ tạm và mở ngay Zalo tới số <strong className="text-emerald-400">{ZALO_PHONE}</strong>. Quý khách chỉ cần chọn Dán (Paste) để gửi.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
