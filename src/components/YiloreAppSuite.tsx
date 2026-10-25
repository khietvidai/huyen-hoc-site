import React, { useState, useEffect, useMemo } from "react";
import { X, Trash2 } from "lucide-react";
import { BrandMark } from "./BrandMark";
import { HEXAGRAMS } from "../data/hexagrams";
import { BOOK_HEXAGRAMS } from "../data/bookHexagrams";
import {
  YiloreUserProfile,
  YiloreDailyGuidanceRecord,
  YiloreReadingRecord,
  YiloreRelationshipProfile,
  YiloreConversation,
  YiloreChatMessage,
  YiloreStrategyItem,
  YILORE_INITIAL_PROFILE,
  YILORE_INITIAL_DAILY_RECORDS,
  YILORE_INITIAL_HISTORY_RECORDS,
  YILORE_INITIAL_CONVERSATIONS,
  YILORE_12_HOURS_ENERGY,
  YILORE_STRATEGY_CATEGORIES,
  getYiloreCardUrl,
  formatGanZhiVi,
} from "../data/yiloreSeedData";
import {
  YiloreRouteId,
  YiloreLang,
  YiloreDesktopSidebar,
  YiloreMobileHeader,
  YiloreEnergyCurveChart,
  YiloreCreditUsageModal,
  renderInlineMarkdown,
} from "./yilore/YiloreShellParts";
import {
  YiloreDailyGuidanceView,
  YiloreChatView,
  YiloreHistoryView,
  YiloreMemoryView,
  YiloreProfileView,
  YiloreRelationshipsView,
} from "./yilore/YiloreSubViews";

export type { YiloreRouteId, YiloreLang };

interface YiloreAppSuiteProps {
  currentUser?: {
    id?: string;
    username?: string;
    email?: string;
    name?: string;
    isMember?: boolean;
    isAdmin?: boolean;
    incenseSticks?: number;
  } | null;
  onGoHome?: () => void;
  onExitToMainApp?: () => void;
  onShowToast?: (msg: string) => void;
}

const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

const RELATION_OPTIONS: { value: string; label: string }[] = [
  { value: "Partner", label: "Người yêu / Bạn đời" },
  { value: "Family", label: "Gia đình" },
  { value: "Friend", label: "Bạn bè" },
  { value: "Colleague", label: "Đồng nghiệp" },
  { value: "Other", label: "Khác" },
];

const WORKBENCH_RANGE_LABELS: Record<string, string> = {
  today: "Hôm nay",
  tomorrow: "Ngày mai",
  within_1_week: "Trong tuần này",
};

function computeBaziFromDate(dateStr: string, hour: number): [string, string, string, string] {
  const parts = dateStr.split("-").map(Number);
  const y = parts[0] || 1992;
  const m = parts[1] || 10;
  const d = parts[2] || 16;
  if (y === 1992 && m === 10 && d === 16 && hour >= 9 && hour < 11) {
    return ["壬申", "庚戌", "乙丑", "辛巳"];
  }
  const yearStemIdx = (y - 4) % 10;
  const yearBranchIdx = (y - 4) % 12;
  const yearGZ = `${STEMS[(yearStemIdx + 10) % 10]}${BRANCHES[(yearBranchIdx + 12) % 12]}`;

  const monthBranchIdx = (m + 1) % 12;
  const monthStemIdx = ((yearStemIdx % 5) * 2 + m) % 10;
  const monthGZ = `${STEMS[(monthStemIdx + 10) % 10]}${BRANCHES[(monthBranchIdx + 12) % 12]}`;

  const utcDays = Math.floor(Date.UTC(y, m - 1, d) / 86400000);
  const dayStemIdx = (utcDays + 9) % 10;
  const dayBranchIdx = (utcDays + 1) % 12;
  const dayGZ = `${STEMS[(dayStemIdx + 10) % 10]}${BRANCHES[(dayBranchIdx + 12) % 12]}`;

  const hourBranchIdx = Math.floor(((hour + 1) % 24) / 2);
  const hourStemIdx = ((dayStemIdx % 5) * 2 + hourBranchIdx) % 10;
  const hourGZ = `${STEMS[(hourStemIdx + 10) % 10]}${BRANCHES[(hourBranchIdx + 12) % 12]}`;

  return [yearGZ, monthGZ, dayGZ, hourGZ];
}

export const YiloreAppSuite: React.FC<YiloreAppSuiteProps> = ({
  currentUser,
  onGoHome,
  onExitToMainApp,
  onShowToast,
}) => {
  const [activeRoute, setActiveRoute] = useState<YiloreRouteId>("ledger");
  const [lang, setLang] = useState<YiloreLang>(() => {
    return (localStorage.getItem("yilore_clone_lang_v4") as YiloreLang) || "vi";
  });

  // Persistent state (v4 with Cửu Nhị branding & /assets/oss/ Vietnamese cards)
  const [profile, setProfile] = useState<YiloreUserProfile>(() => {
    try {
      const saved = localStorage.getItem("yilore_clone_profile_v4");
      if (saved) return JSON.parse(saved);
    } catch {}
    return YILORE_INITIAL_PROFILE;
  });

  const [dailyRecords, setDailyRecords] = useState<YiloreDailyGuidanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem("yilore_clone_daily_v4");
      if (saved) return JSON.parse(saved);
    } catch {}
    return YILORE_INITIAL_DAILY_RECORDS;
  });

  const [historyRecords, setHistoryRecords] = useState<YiloreReadingRecord[]>(() => {
    try {
      const saved = localStorage.getItem("yilore_clone_history_v4");
      if (saved) return JSON.parse(saved);
    } catch {}
    return YILORE_INITIAL_HISTORY_RECORDS;
  });

  const [conversations, setConversations] = useState<YiloreConversation[]>(() => {
    try {
      const saved = localStorage.getItem("yilore_clone_conversations_v4");
      if (saved) return JSON.parse(saved);
    } catch {}
    return YILORE_INITIAL_CONVERSATIONS;
  });

  const [relationships, setRelationships] = useState<YiloreRelationshipProfile[]>(() => {
    try {
      const saved = localStorage.getItem("yilore_clone_relationships_v4");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [strategyItems, setStrategyItems] = useState<YiloreStrategyItem[]>(() => {
    try {
      const saved = localStorage.getItem("yilore_clone_strategy_v4");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [memoryPrefs, setMemoryPrefs] = useState<{
    useChartProfile: boolean;
    usePastContext: boolean;
    notes: string;
  }>(() => {
    try {
      const saved = localStorage.getItem("yilore_clone_memory_v4");
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      useChartProfile: true,
      usePastContext: true,
      notes: "",
    };
  });

  useEffect(() => {
    localStorage.setItem("yilore_clone_lang_v4", lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem("yilore_clone_profile_v4", JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem("yilore_clone_daily_v4", JSON.stringify(dailyRecords));
  }, [dailyRecords]);

  useEffect(() => {
    localStorage.setItem("yilore_clone_history_v4", JSON.stringify(historyRecords));
  }, [historyRecords]);

  useEffect(() => {
    localStorage.setItem("yilore_clone_conversations_v4", JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem("yilore_clone_relationships_v4", JSON.stringify(relationships));
  }, [relationships]);

  useEffect(() => {
    localStorage.setItem("yilore_clone_strategy_v4", JSON.stringify(strategyItems));
  }, [strategyItems]);

  useEffect(() => {
    localStorage.setItem("yilore_clone_memory_v4", JSON.stringify(memoryPrefs));
  }, [memoryPrefs]);

  // Live Clock
  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Modals & Interactive States
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCreditsModalOpen, setIsCreditsModalOpen] = useState(false);
  const [isAddStrategyOpen, setIsAddStrategyOpen] = useState(false);
  const [isStrategyInfoOpen, setIsStrategyInfoOpen] = useState(false);
  const [newStrategyCat, setNewStrategyCat] = useState("Tùy chỉnh");
  const [newStrategyTitle, setNewStrategyTitle] = useState("");
  const [newStrategyTime, setNewStrategyTime] = useState("");

  // Hold-to-draw state
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHoldingGuidance, setIsHoldingGuidance] = useState(false);

  // Quick Lot Modal
  const [quickLotHexNumber, setQuickLotHexNumber] = useState<number | null>(null);
  const [isQuickLotFlipped, setIsQuickLotFlipped] = useState(false);

  // Auspicious Workbench state
  const [workbenchRange, setWorkbenchRange] = useState("today");
  const [workbenchOccasion, setWorkbenchOccasion] = useState("Họp hành");
  const [workbenchResults, setWorkbenchResults] = useState<
    { window: string; branch: string; tenGod: string; score: number; advice: string }[] | null
  >(null);

  // Ledger quick chat input
  const [ledgerChatInput, setLedgerChatInput] = useState("");

  // Daily Guidance view state
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(() => {
    return YILORE_INITIAL_DAILY_RECORDS[0]?.drawnDate || "2026-10-20";
  });
  const [isDailyCardFlipped, setIsDailyCardFlipped] = useState(false);
  const [dailyFollowupInput, setDailyFollowupInput] = useState("");

  // Chat view state
  const [activeConvId, setActiveConvId] = useState<string>(
    () => conversations[0]?.id || "592076b9-e879-4835-8fa9-e74cd8a55ad7"
  );
  const [chatInput, setChatInput] = useState("");
  const [showPeoplePicker, setShowPeoplePicker] = useState(false);
  const [showReadingPicker, setShowReadingPicker] = useState(false);
  const [isCastingInChat, setIsCastingInChat] = useState(false);

  // History Detail Overlay
  const [selectedHistoryRecord, setSelectedHistoryRecord] = useState<YiloreReadingRecord | null>(null);
  const [overlayFlipBen, setOverlayFlipBen] = useState(false);
  const [overlayFlipZhi, setOverlayFlipZhi] = useState(false);

  // Profile Edit Modal
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState(profile.userName);
  const [editGender, setEditGender] = useState<"male" | "female">(profile.gender);
  const [editBirthDate, setEditBirthDate] = useState(profile.birthDate);
  const [editBirthHour, setEditBirthHour] = useState(profile.birthHour);
  const [editBirthCity, setEditBirthCity] = useState(profile.birthplace);

  // Relationship Edit Sheet
  const [isRelationshipModalOpen, setIsRelationshipModalOpen] = useState(false);
  const [editingRelationship, setEditingRelationship] = useState<YiloreRelationshipProfile | null>(null);
  const [relName, setRelName] = useState("");
  const [relType, setRelType] = useState<YiloreRelationshipProfile["relation"]>("Partner");
  const [relGender, setRelGender] = useState<"male" | "female">("female");
  const [relBirthDate, setRelBirthDate] = useState("1995-06-15");
  const [relBirthTime, setRelBirthTime] = useState("10:00");
  const [relBirthCity, setRelBirthCity] = useState("Hà Nội");

  const toast = (msg: string) => {
    if (onShowToast) onShowToast(msg);
  };

  const todayIso = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  const todayGuidanceRecord = useMemo(() => {
    return dailyRecords.find((r) => r.drawnDate === todayIso) || null;
  }, [dailyRecords, todayIso]);

  const selectedDateGuidanceRecord = useMemo(() => {
    return dailyRecords.find((r) => r.drawnDate === selectedCalendarDate) || null;
  }, [dailyRecords, selectedCalendarDate]);

  const handleCompleteTodayGuidanceDraw = () => {
    setIsHoldingGuidance(false);
    if (todayGuidanceRecord) {
      setSelectedCalendarDate(todayIso);
      setActiveRoute("daily-guidance");
      return;
    }
    const randomNum = Math.floor(Math.random() * 64) + 1;
    const hex = HEXAGRAMS.find((h) => h.number === randomNum) || HEXAGRAMS[25];
    const bookHex = BOOK_HEXAGRAMS.find((b) => b.number === randomNum);
    const dayBadges = [
      "Ngày Bứt Phá",
      "Ngày Tĩnh Quán",
      "Ngày Hợp Tác",
      "Ngày Thu Hoạch",
      "Ngày Sáng Tạo",
      "Ngày Cát Tường",
    ];
    const newRec: YiloreDailyGuidanceRecord = {
      id: `dg-${Date.now()}`,
      drawnDate: todayIso,
      hexagramNumber: hex.number,
      guaName: `${hex.name} (${hex.hanzi})`,
      guaNameEn: hex.name,
      guaNameVi: hex.name,
      cardTitle: bookHex?.redHeadline || hex.vietnameseName || hex.name,
      cardTitleEn: hex.judgment.slice(0, 42),
      guaCi: bookHex?.poemMeaning || hex.judgment,
      dailyGuidance: bookHex?.destiny || hex.overview || hex.judgment,
      dailyGuidanceEn: bookHex?.destiny || hex.overview || hex.judgment,
      dailyGuidanceVi: bookHex?.destiny || hex.overview || hex.judgment,
      keywords: ["Tĩnh Tâm", "Quan Sát Thời Cơ", "Hành Động Tỉnh Thức"],
      dayBadge: dayBadges[hex.number % dayBadges.length],
      frontImageUrl: getYiloreCardUrl(hex.number, "a", "hant"),
      backImageUrl: getYiloreCardUrl(hex.number, "b", "hant"),
      followupHistory: [],
    };
    setDailyRecords((prev) => [newRec, ...prev]);
    setSelectedCalendarDate(todayIso);
    toast("Đã nhận thông điệp Chỉ Dẫn Quẻ Dịch Hôm Nay!");
  };

  // Hold-to-draw animation effect
  useEffect(() => {
    if (!isHoldingGuidance) {
      setHoldProgress(0);
      return;
    }
    const interval = setInterval(() => {
      setHoldProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          handleCompleteTodayGuidanceDraw();
          return 100;
        }
        return prev + 10;
      });
    }, 80);
    return () => clearInterval(interval);
  }, [isHoldingGuidance]);

  const handleDrawQuickLot = () => {
    const randomNum = Math.floor(Math.random() * 64) + 1;
    setQuickLotHexNumber(randomNum);
    setIsQuickLotFlipped(false);
  };

  const handleAddStrategyItem = () => {
    if (!newStrategyTitle.trim()) return;
    const hourNum = newStrategyTime ? parseInt(newStrategyTime.split(":")[0], 10) : now.getHours();
    const branchIdx = Math.floor(((hourNum + 1) % 24) / 2);
    const hourData = YILORE_12_HOURS_ENERGY[branchIdx] || YILORE_12_HOURS_ENERGY[8];
    const dayMasterVi = formatGanZhiVi(profile.bazi[2]);

    const item: YiloreStrategyItem = {
      id: `st-${Date.now()}`,
      category: newStrategyCat,
      title: newStrategyTitle.trim(),
      time: newStrategyTime || "Thời gian linh hoạt",
      tenGod: hourData.tenGodVi,
      score: hourData.score,
      tipEn: `Ứng với giờ ${hourData.branch} (${hourData.tenGodVi} · Năng lượng ${hourData.score}/100). Chủ động chuẩn bị dữ kiện rõ ràng, giữ nhịp độ điềm tĩnh và phát huy ưu thế Nhật chủ ${dayMasterVi} (${profile.bazi[2]}).`,
      tipVi: `Ứng với giờ ${hourData.branch} (${hourData.tenGodVi} · Năng lượng ${hourData.score}/100). Chủ động chuẩn bị dữ kiện rõ ràng, giữ nhịp độ điềm tĩnh và phát huy ưu thế Nhật chủ ${dayMasterVi} (${profile.bazi[2]}).`,
    };
    setStrategyItems((prev) => [item, ...prev]);
    setNewStrategyTitle("");
    setNewStrategyTime("");
    setIsAddStrategyOpen(false);
    toast("Đã phân tích chiến lược Bát Tự + Hoàng Lịch cho lịch trình của bạn!");
  };

  const handleRunWorkbenchSearch = () => {
    const picks = [
      {
        window: "09:00 – 11:00 (Giờ Tỵ · 巳时)",
        branch: "Tỵ",
        tenGod: "Thiên Ấn",
        score: 92,
        advice: `Khung giờ tốt nhất cho việc "${workbenchOccasion}": Trực giác nhạy bén và tư duy chiến lược sáng rõ; rất thuận lợi để ký kết, tập trung sâu hoặc thống nhất quyết sách quan trọng.`,
      },
      {
        window: "15:00 – 17:00 (Giờ Thân · 申时)",
        branch: "Thân",
        tenGod: "Thương Quan",
        score: 100,
        advice: `Đỉnh cao sáng tạo & biểu đạt cho việc "${workbenchOccasion}": Lý tưởng để trình bày ý tưởng, kết nối xã giao hoặc tháo gỡ điểm nghẽn.`,
      },
      {
        window: "19:00 – 21:00 (Giờ Tuất · 戌时)",
        branch: "Tuất",
        tenGod: "Thiên Tài",
        score: 79,
        advice: `Nhịp điệu buổi tối cân bằng cho việc "${workbenchOccasion}": Giao tiếp hài hòa, mở rộng nhân mạch và đàm phán nhẹ nhàng.`,
      },
    ];
    setWorkbenchResults(picks);
  };

  const handleAskDailyFollowup = (qText: string) => {
    const q = qText.trim();
    if (!q || !selectedDateGuidanceRecord) return;
    const hex = HEXAGRAMS.find((h) => h.number === selectedDateGuidanceRecord.hexagramNumber) || HEXAGRAMS[25];
    const bookHex = BOOK_HEXAGRAMS.find((b) => b.number === hex.number);

    const ans = `Với quẻ **${selectedDateGuidanceRecord.guaName}** (${hex.name}), lời khuyên cốt lõi cho câu hỏi *"${q}"* là: **${
      bookHex?.destiny || hex.overview || selectedDateGuidanceRecord.dailyGuidanceVi
    }**. Trong công việc và quyết định hôm nay, ${
      hex.career || "hãy giữ vững nguyên tắc, tích lũy nội lực và tránh nóng vội trước biến động ngắn hạn."
    }`;

    const newFollowup = {
      id: `fu-${Date.now()}`,
      question: q,
      answer: ans,
      createdAt: now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    };

    setDailyRecords((prev) =>
      prev.map((rec) =>
        rec.id === selectedDateGuidanceRecord.id
          ? { ...rec, followupHistory: [...rec.followupHistory, newFollowup] }
          : rec
      )
    );
    setDailyFollowupInput("");
  };

  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.id === activeConvId) || conversations[0];
  }, [conversations, activeConvId]);

  const handleStartNewChat = () => {
    const dayMasterVi = formatGanZhiVi(profile.bazi[2]);
    const newConv: YiloreConversation = {
      id: `conv-${Date.now()}`,
      title: "Cuộc trò chuyện mới",
      updatedAt: "Vừa xong",
      activePersonIds: [],
      activeReportIds: [],
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: "assistant",
          content: `Xin chào **${profile.userName}** (Nhật chủ **${dayMasterVi} (${profile.bazi[2]})** · Mệnh quái **${profile.destinyHexagram.archetypeTitle} · ${profile.destinyHexagram.hexagramNameEn}**). Hôm nay bạn muốn gieo quẻ Lục Hào, rút xâm Kinh Dịch, chọn giờ cát tường hay phân tích hợp bàn mệnh lý?`,
          timestamp: now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        },
      ],
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConvId(newConv.id);
  };

  const handleCastSixLineReadingInChat = (questionText: string) => {
    setIsCastingInChat(true);
    setTimeout(() => {
      const benNum = Math.floor(Math.random() * 64) + 1;
      let zhiNum = Math.floor(Math.random() * 64) + 1;
      if (zhiNum === benNum) zhiNum = (benNum % 64) + 1;

      const benHex = HEXAGRAMS.find((h) => h.number === benNum) || HEXAGRAMS[6];
      const zhiHex = HEXAGRAMS.find((h) => h.number === zhiNum) || HEXAGRAMS[31];
      const benBook = BOOK_HEXAGRAMS.find((b) => b.number === benNum);
      const zhiBook = BOOK_HEXAGRAMS.find((b) => b.number === zhiNum);

      const lines = [7, 8, 6, 9, 7, 8];
      const newRecord: YiloreReadingRecord = {
        readingId: `rd-${Date.now()}`,
        question: questionText || "Tôi nên tiếp cận quyết định hiện tại như thế nào?",
        createdAt: todayIso,
        summaryHighlight:
          benBook?.destiny ||
          benHex.overview ||
          `Từ quẻ ${benHex.name} biến sang ${zhiHex.name}: Giữ vững định hướng và nắm bắt thời cơ sẽ mang lại bước đột phá.`,
        summaryBrief: `**Thông Điệp Cốt Lõi (${benHex.name} → ${zhiHex.name})**\n${
          benBook?.poemMeaning || benHex.judgment
        }\n\n**Chỉ Dẫn Chiến Lược**\n${
          benHex.career || benHex.image
        }\n\n**Xu Hướng Chung Cục (${zhiHex.name} · ${zhiHex.hanzi})**\n${zhiBook?.destiny || zhiHex.overview || zhiHex.judgment}`,
        benGua: {
          position: benHex.number,
          name: `${benHex.name} (${benHex.hanzi})`,
          nameVi: benHex.name,
          title: `Hiện trạng · ${benBook?.redHeadline || benHex.vietnameseName || benHex.name}`,
          guaCi: benBook?.poemHan || benHex.judgment,
          brief: benBook?.poemMeaning || benHex.judgment,
          detailExplain: benBook?.bigImage || benHex.image,
          frontUrl: getYiloreCardUrl(benHex.number, "a", "hant"),
          backUrl: getYiloreCardUrl(benHex.number, "b", "hant"),
          lines,
        },
        zhiGua: {
          position: zhiHex.number,
          name: `${zhiHex.name} (${zhiHex.hanzi})`,
          nameVi: zhiHex.name,
          title: `Chung cục · ${zhiBook?.redHeadline || zhiHex.vietnameseName || zhiHex.name}`,
          guaCi: zhiBook?.poemHan || zhiHex.judgment,
          brief: zhiBook?.poemMeaning || zhiHex.judgment,
          detailExplain: zhiBook?.bigImage || zhiHex.image,
          frontUrl: getYiloreCardUrl(zhiHex.number, "a", "hant"),
          backUrl: getYiloreCardUrl(zhiHex.number, "b", "hant"),
        },
        yaoList: [
          {
            position: 3,
            lineName: "Hào 3 Động",
            yaoCi: benHex.lineMeanings?.[2]?.text || "Quân tử chung nhật kiền kiền, tịch dịch nhược, lệ vô cữu.",
            brief: benHex.lineMeanings?.[2]?.meaning || "Giữ sự tỉnh thức ở bước ngoặt quan trọng; hành sự cẩn trọng sẽ tránh được sai sót.",
          },
          {
            position: 4,
            lineName: "Hào 4 Động",
            yaoCi: benHex.lineMeanings?.[3]?.text || "Hoặc dược tại uyên, vô cữu.",
            brief: benHex.lineMeanings?.[3]?.meaning || "Thăm dò thời thế và chuẩn bị kỹ lưỡng để bứt phá khi điều kiện chín muồi.",
          },
        ],
      };

      setHistoryRecords((prev) => [newRecord, ...prev]);

      const assistantMsg: YiloreChatMessage = {
        id: `msg-${Date.now()}-cast`,
        role: "assistant",
        content: `Đã hoàn tất gieo quẻ: Bản quái **${newRecord.benGua.name}** biến sang Chi quái **${newRecord.zhiGua.name}** (Hào động: Hào 3, Hào 4).\n\n${newRecord.summaryHighlight}`,
        timestamp: now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        type: "divination_result",
        divinationRecord: newRecord,
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversation.id
            ? {
                ...c,
                title: questionText.slice(0, 28) || c.title,
                updatedAt: "Vừa xong",
                activeReportIds: [newRecord.readingId, ...c.activeReportIds],
                messages: [...c.messages, assistantMsg],
              }
            : c
        )
      );
      setIsCastingInChat(false);
    }, 650);
  };

  const handleSendChatMessage = (customText?: string, forceCast?: boolean) => {
    const text = (customText ?? chatInput).trim();
    if (!text && !forceCast) return;

    const userMsg: YiloreChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: text || "Hãy gieo một quẻ Lục Hào Kinh Dịch cho câu hỏi hiện tại của tôi",
      timestamp: now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversation.id
          ? { ...c, updatedAt: "Vừa xong", messages: [...c.messages, userMsg] }
          : c
      )
    );
    if (!customText) setChatInput("");

    const lower = text.toLowerCase();
    if (
      forceCast ||
      lower.includes("gieo quẻ") ||
      lower.includes("rút cho tôi một quẻ") ||
      lower.includes("xin gieo quẻ") ||
      lower.includes("起卦")
    ) {
      handleCastSixLineReadingInChat(text);
      return;
    }

    setTimeout(() => {
      const linkedReports = historyRecords.filter((r) =>
        activeConversation.activeReportIds.includes(r.readingId)
      );
      const linkedPeople = relationships.filter((p) =>
        activeConversation.activePersonIds.includes(p.id)
      );

      const baziVi = profile.bazi.map((gz) => `${formatGanZhiVi(gz)} (${gz})`).join(" · ");
      const currentDayunVi = `${formatGanZhiVi(profile.dayun.current.ganZhi)} (${profile.dayun.current.ganZhi})`;

      let reply = `Dựa trên lá số Bát Tự của bạn (**${baziVi}**, Đại vận hiện tại **${currentDayunVi}**) và Mệnh quái **${profile.destinyHexagram.archetypeTitle} · ${profile.destinyHexagram.hexagramNameEn}**:\n\n`;
      if (linkedReports.length > 0) {
        reply += `• **Liên kết báo cáo quẻ (${linkedReports[0].benGua.name} → ${linkedReports[0].zhiGua.name}):** ${linkedReports[0].summaryHighlight}\n`;
      }
      if (linkedPeople.length > 0) {
        reply += `• **Hợp bàn với @${linkedPeople[0].name} (${linkedPeople[0].bazi}):** Độ hòa hợp ${linkedPeople[0].compatibilityScore}% — ${linkedPeople[0].synastrySummary}\n`;
      }
      reply += `\n**Lời khuyên trọng tâm cho "${text}":**\n• **Điểm tựa Nhật Trụ (${profile.dayPillarCard.ganZhi} · ${profile.dayPillarCard.archetypeVi}):** Kết hợp sự mềm mỏng linh hoạt bên ngoài với nguyên tắc kiên định bên trong.\n• **Thời cơ cát tường hôm nay:** Khung giờ *Dần (03:00–05:00)*, *Tỵ (09:00–11:00)* và *Thân (15:00–17:00)* mang lại nguồn năng lượng Thập Thần trợ lực mạnh nhất cho bạn.\n• Bạn có muốn tôi **gieo một quẻ Lục Hào** chuyên sâu riêng cho quyết định này không?`;

      const replyMsg: YiloreChatMessage = {
        id: `msg-${Date.now()}-reply`,
        role: "assistant",
        content: reply,
        timestamp: now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversation.id
            ? { ...c, updatedAt: "Vừa xong", messages: [...c.messages, replyMsg] }
            : c
        )
      );
    }, 450);
  };

  const handleSaveProfileEdit = () => {
    const newBazi = computeBaziFromDate(editBirthDate, Number(editBirthHour));
    setProfile((prev) => ({
      ...prev,
      userName: editName.trim() || prev.userName,
      gender: editGender,
      birthDate: editBirthDate,
      birthHour: Number(editBirthHour),
      birthplace: editBirthCity.trim() || prev.birthplace,
      bazi: newBazi,
      dayPillarCard: {
        ...prev.dayPillarCard,
        ganZhi: `${formatGanZhiVi(newBazi[2])} (${newBazi[2]})`,
      },
    }));
    setIsEditProfileOpen(false);
    toast("Đã cập nhật hồ sơ Bát Tự & Hà Lạc Lý Số thành công!");
  };

  const handleOpenAddRelationship = () => {
    setEditingRelationship(null);
    setRelName("");
    setRelType("Partner");
    setRelGender("female");
    setRelBirthDate("1995-06-15");
    setRelBirthTime("10:00");
    setRelBirthCity("Hà Nội");
    setIsRelationshipModalOpen(true);
  };

  const handleOpenEditRelationship = (rel: YiloreRelationshipProfile) => {
    setEditingRelationship(rel);
    setRelName(rel.name);
    setRelType(rel.relation);
    setRelGender(rel.gender);
    setRelBirthDate(rel.birthDate);
    setRelBirthTime(rel.birthTime);
    setRelBirthCity(rel.birthCity);
    setIsRelationshipModalOpen(true);
  };

  const handleDeleteRelationship = (id: string) => {
    setRelationships((prev) => prev.filter((r) => r.id !== id));
    toast("Đã xóa hồ sơ quan hệ.");
  };

  const handleSaveRelationship = () => {
    if (!relName.trim()) return;
    const hourNum = parseInt(relBirthTime.split(":")[0] || "10", 10);
    const baziArr = computeBaziFromDate(relBirthDate, hourNum);
    const hexIdx = (relName.length * 7 + hourNum) % 64;
    const hex = HEXAGRAMS[hexIdx] || HEXAGRAMS[0];
    const score = 78 + ((relName.charCodeAt(0) + hourNum) % 19);
    const relDayMasterVi = formatGanZhiVi(baziArr[2]);
    const userDayMasterVi = formatGanZhiVi(profile.bazi[2]);

    const newRel: YiloreRelationshipProfile = {
      id: editingRelationship ? editingRelationship.id : `rel-${Date.now()}`,
      name: relName.trim(),
      relation: relType,
      gender: relGender,
      birthDate: relBirthDate,
      birthTime: relBirthTime,
      birthCity: relBirthCity,
      bazi: baziArr.map((gz) => `${formatGanZhiVi(gz)} (${gz})`).join(" · "),
      dayMaster: `${relDayMasterVi} (${baziArr[2]})`,
      destinyHexagramName: `${hex.name} (${hex.hanzi})`,
      compatibilityScore: score,
      synastrySummary: `Nhật trụ ${relDayMasterVi} (${baziArr[2]}) tạo sự cộng hưởng Ngũ Hành bổ khuyết với Nhật chủ ${userDayMasterVi} (${profile.bazi[2]}) của bạn (Độ hòa hợp ${score}%). Tương trợ tốt trong hoạch định dài hạn và sự tin cậy nội tâm.`,
    };

    if (editingRelationship) {
      setRelationships((prev) => prev.map((r) => (r.id === editingRelationship.id ? newRel : r)));
    } else {
      setRelationships((prev) => [newRel, ...prev]);
    }
    setIsRelationshipModalOpen(false);
    setEditingRelationship(null);
    setRelName("");
    toast("Đã lưu Hồ Sơ Quan Hệ & tính toán hợp bàn Bát Tự!");
  };

  // Current hour index (0..11) for Today's Energy Curve
  const currentBranchIndex = Math.floor(((now.getHours() + 1) % 24) / 2);
  const currentEnergyPoint = YILORE_12_HOURS_ENERGY[currentBranchIndex] || YILORE_12_HOURS_ENERGY[8];
  const shortTenGodLabel = currentEnergyPoint.tenGodVi;
  const userShortCode =
    currentUser?.username ||
    (currentUser?.email ? currentUser.email.split("@")[0] : (profile.id || "c6e4506d-950b-419f-a372-01afe8dc49a5").slice(-8).toUpperCase());
  const userCredits = currentUser
    ? currentUser.incenseSticks ?? (currentUser.isMember || currentUser.isAdmin ? 999 : 30)
    : 999;
  const userTierLabel = currentUser
    ? currentUser.isAdmin
      ? "Quản trị viên"
      : currentUser.isMember
      ? "Hội viên VIP"
      : "Thành viên"
    : "Khách vãng lai";

  const formattedMonthDay = now.toLocaleDateString("vi-VN", { day: "numeric", month: "long" });
  const formattedWeekday = now.toLocaleDateString("vi-VN", { weekday: "long" });
  const formattedTime = now.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  // ============================================================================
  // RENDER 1:1 YILORE APP SHELL (Synchronized with Cửu Nhị Xuan Parchment Theme)
  // ============================================================================
  return (
    <div className="yilore-1to1-root font-serif flex h-svh min-h-0 flex-col bg-[#F6F3EB] text-[#1C1813]">
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* 1:1 Desktop Sidebar (xl:flex w-52) */}
        <YiloreDesktopSidebar
          activeRoute={activeRoute}
          setActiveRoute={setActiveRoute}
          lang={lang}
          setLang={setLang}
          userIdDisplay={userShortCode}
          userCredits={userCredits}
          userTierLabel={userTierLabel}
          onOpenCreditsModal={() => setIsCreditsModalOpen(true)}
          onGoHome={onGoHome}
          onExitToMainApp={onExitToMainApp}
          onShowToast={onShowToast}
        />

        {/* Right Content Column */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {/* Mobile Header (< xl) */}
          <YiloreMobileHeader
            activeRoute={activeRoute}
            setActiveRoute={setActiveRoute}
            lang={lang}
            setLang={setLang}
            userIdDisplay={userShortCode}
            isOpen={isMobileMenuOpen}
            setIsOpen={setIsMobileMenuOpen}
            onOpenCreditsModal={() => setIsCreditsModalOpen(true)}
            onGoHome={onGoHome}
            onExitToMainApp={onExitToMainApp}
            onShowToast={onShowToast}
          />

          {/* Main Area */}
          {activeRoute === "chat" ? (
            <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden p-0 bg-[radial-gradient(ellipse_at_top,#FDFBF7_0%,#F6F3EB_55%,#EDE5D5_100%)]">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.42]"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, rgba(180,145,70,0.13) 1px, transparent 1px), linear-gradient(to bottom, rgba(180,145,70,0.13) 1px, transparent 1px)",
                  backgroundSize: "48px 48px",
                }}
              />
              <YiloreChatView
                conversations={conversations}
                activeConversation={activeConversation}
                setActiveConvId={setActiveConvId}
                handleStartNewChat={handleStartNewChat}
                setConversations={setConversations}
                historyRecords={historyRecords}
                relationships={relationships}
                setSelectedHistoryRecord={(rec) => {
                  setSelectedHistoryRecord(rec);
                  setOverlayFlipBen(false);
                  setOverlayFlipZhi(false);
                }}
                chatInput={chatInput}
                setChatInput={setChatInput}
                handleSendChatMessage={handleSendChatMessage}
                handleDrawQuickLot={handleDrawQuickLot}
                isCastingInChat={isCastingInChat}
                showReadingPicker={showReadingPicker}
                setShowReadingPicker={setShowReadingPicker}
                showPeoplePicker={showPeoplePicker}
                setShowPeoplePicker={setShowPeoplePicker}
                setActiveRoute={setActiveRoute}
              />
            </main>
          ) : (
            <main className="relative min-h-0 flex-1 overflow-auto p-4 sm:p-6 bg-[radial-gradient(ellipse_at_top,#FDFBF7_0%,#F6F3EB_55%,#EDE5D5_100%)]">
              {/* Subtle 48x48px Antique Copper Grid matching LandingPage */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.45]"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, rgba(180,145,70,0.13) 1px, transparent 1px), linear-gradient(to bottom, rgba(180,145,70,0.13) 1px, transparent 1px)",
                  backgroundSize: "48px 48px",
                }}
              />
              {/* Rotating Celestial Bagua Watermark matching LandingPage */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute right-[-120px] top-[60px] h-[480px] w-[480px] select-none opacity-[0.045]"
              >
                <svg viewBox="0 0 200 200" className="h-full w-full animate-[spin_180s_linear_infinite]">
                  <circle cx="100" cy="100" r="95" fill="none" stroke="#8A6A2F" strokeWidth="1.2" strokeDasharray="3 3" />
                  <circle cx="100" cy="100" r="78" fill="none" stroke="#8A6A2F" strokeWidth="0.9" />
                  <circle cx="100" cy="100" r="56" fill="none" stroke="#8A6A2F" strokeWidth="0.8" strokeDasharray="6 4" />
                  <polygon points="100,12 162,38 188,100 162,162 100,188 38,162 12,100 38,38" fill="none" stroke="#8A6A2F" strokeWidth="1" />
                  <circle cx="100" cy="100" r="28" fill="none" stroke="#8A6A2F" strokeWidth="1.2" />
                </svg>
              </div>
              {/* Watermark Decorations with Cửu Nhị BrandMark */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute top-5 select-none opacity-[0.12] right-[max(1.25rem,15vw)]"
              >
                <BrandMark size={56} />
              </div>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 select-none overflow-hidden"
              >
                <img src="/yilore-assets/mountain.svg" alt="" className="w-full opacity-[0.065]" />
              </div>

              {/* ============================================================
                  ROUTE 0: CỬU NHỊ LEDGER (/en/app — 1:1 Hydrated DOM)
                 ============================================================ */}
              {activeRoute === "ledger" && (
                <div className="relative mx-auto flex w-full max-w-6xl flex-col px-1 pb-8 pt-0 sm:px-0">
                  <header className="mb-1">
                    <p className="font-serif text-[12px] font-medium tracking-wide text-stone-400">
                      Sổ Tay Mệnh Lý Cửu Nhị
                    </p>
                    <div className="mt-2 grid grid-cols-1 gap-y-1 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-baseline sm:gap-x-5 sm:gap-y-1.5">
                      <h1 className="font-serif text-2xl font-semibold leading-snug tracking-tight text-stone-900 sm:text-[1.75rem]">
                        {profile.userName}，{formattedMonthDay}
                        <span className="text-stone-500"> · </span>
                        {formattedWeekday}
                      </h1>
                      <p className="font-serif text-2xl font-semibold tabular-nums leading-snug tracking-tight text-stone-900 sm:text-right sm:text-[1.75rem]">
                        {formattedTime}
                      </p>
                      <p className="font-serif text-[13px] leading-relaxed text-stone-600 sm:text-sm">
                        <span>Âm lịch: 15 tháng 9</span>
                        <span className="text-stone-400"> · </span>
                        <span className="font-medium text-stone-800">Năm Bính Ngọ · Tháng Mậu Tuất · Ngày Tân Mùi</span>
                        <span className="text-stone-400"> · </span>
                        <span className="font-medium text-stone-800">Thất Sát</span>
                      </p>
                      <p className="font-serif text-[13px] leading-relaxed text-stone-600 sm:text-right sm:text-sm">
                        Giờ Bính {currentEnergyPoint.branch} · {shortTenGodLabel}
                      </p>
                    </div>
                  </header>

                  {/* 1:1 2-Column Asymmetric Grid */}
                  <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] md:items-start md:gap-3 lg:gap-5">
                    {/* LEFT COLUMN: Today's Energy Curve + Today's Strategy Sandbox */}
                    <div className="flex min-w-0 flex-col gap-4">
                      <section className="relative overflow-hidden rounded-2xl border border-stone-200/60 bg-gradient-to-b from-[#fdfcfa] via-[#fbfaf7] to-[#faf9f6] shadow-[0_2px_12px_-8px_rgba(28,25,23,0.06)]">
                        <header className="relative flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-3 pb-2 sm:px-5 sm:pb-2.5">
                          <div className="flex min-w-0 items-center gap-1.5">
                            <h2 className="font-serif text-sm font-normal leading-normal text-stone-600 sm:text-[0.9375rem]">
                              Đường cong năng lượng hôm nay
                            </h2>
                          </div>
                          <div className="shrink-0">
                            <div className="inline-flex h-5 max-w-full flex-wrap items-center justify-end gap-x-2 gap-y-0.5 font-serif">
                              <span className="shrink-0 text-[13px] leading-none text-stone-500">
                                Hiện tại
                              </span>
                              <span className="shrink-0 text-[12px] font-medium leading-none text-stone-600">
                                {shortTenGodLabel}
                              </span>
                              <span
                                className="inline-flex h-5 items-center gap-1.5 font-serif"
                                role="status"
                              >
                                <span className="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                                  <svg
                                    width="11"
                                    height="12"
                                    viewBox="0 0 16 18"
                                    className="block shrink-0"
                                    aria-hidden="true"
                                  >
                                    <path
                                      d="M8.2 1 3 10.2h3.5L4.8 17l8-8.8H9.2L12.4 1z"
                                      fill="#9a3412"
                                      opacity="1"
                                    />
                                  </svg>
                                </span>
                                <span className="text-[14px] font-semibold leading-none text-stone-900">
                                  Vượng
                                </span>
                                <span
                                  className="select-none text-[14px] leading-none text-stone-300"
                                  aria-hidden="true"
                                >
                                  ·
                                </span>
                                <span
                                  className="inline-flex items-center gap-0.5 text-[15px] font-semibold tabular-nums leading-none"
                                  style={{ color: "rgb(154, 52, 18)" }}
                                >
                                  100
                                </span>
                              </span>
                            </div>
                          </div>
                        </header>

                        <div className="relative px-4 py-4 !px-3 !py-2 sm:px-5 sm:py-5 sm:!px-4 sm:!py-3">
                          <YiloreEnergyCurveChart
                            now={now}
                            currentBranchIndex={currentBranchIndex}
                          />
                        </div>
                      </section>

                      {/* Today's Strategy Sandbox (1:1 from yilore_1to1_dom_spec.json) */}
                      <section
                        aria-label="Bàn cờ chiến lược hôm nay"
                        className="relative overflow-hidden rounded-2xl border border-stone-200/75 bg-white shadow-[0_1px_2px_rgba(28,25,23,0.04),0_8px_24px_-12px_rgba(28,25,23,0.1)]"
                      >
                        <header className="relative flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-stone-100/90 px-4 py-3 sm:px-5">
                          <div className="flex min-w-0 items-center gap-1.5">
                            <h2 className="font-serif text-sm font-normal leading-normal text-stone-600 sm:text-[0.9375rem]">
                              Bàn cờ chiến lược hôm nay
                            </h2>
                            <button
                              type="button"
                              onClick={() => setIsStrategyInfoOpen(true)}
                              aria-label="Cách hoạt động của gợi ý chiến lược"
                              className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-stone-400 ring-1 ring-stone-200/90 transition hover:bg-stone-100 hover:text-stone-600"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                className="h-3.5 w-3.5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                aria-hidden="true"
                              >
                                <circle cx="12" cy="12" r="9" />
                                <path strokeLinecap="round" d="M12 10v6M12 7h.01" />
                              </svg>
                            </button>
                          </div>
                          <div className="shrink-0">
                            <button
                              type="button"
                              onClick={() => setIsAddStrategyOpen(true)}
                              className="cursor-pointer font-serif text-[12px] font-medium text-stone-600 transition hover:text-stone-900 sm:text-[13px]"
                            >
                              Thêm việc cần làm
                            </button>
                          </div>
                        </header>

                        <div className="relative px-4 py-4 sm:px-5 sm:py-5">
                          {strategyItems.length === 0 ? (
                            <div className="space-y-3">
                              <div className="rounded-xl border border-dashed border-stone-200/70 bg-stone-50/35 px-4 py-8 text-center font-serif text-[13px] leading-relaxed text-stone-500">
                                Thêm các việc bạn dự định làm hôm nay để nhận gợi ý chiến lược cá nhân hóa.
                              </div>
                              <button
                                type="button"
                                onClick={() => setIsAddStrategyOpen(true)}
                                className="mx-auto block font-serif text-[12px] text-stone-600 underline decoration-stone-300 underline-offset-2 transition hover:text-stone-900"
                              >
                                Thêm việc cần làm
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-2.5">
                              {strategyItems.map((item) => (
                                <div
                                  key={item.id}
                                  className="rounded-xl border border-stone-200/80 bg-stone-50/70 p-3 text-xs"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <span className="rounded-md bg-stone-200/75 px-1.5 py-0.5 text-[10px] font-medium text-stone-700">
                                        {item.category}
                                      </span>
                                      <span className="font-semibold text-stone-900">
                                        {item.title}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[11px] text-stone-500">{item.time}</span>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setStrategyItems((prev) =>
                                            prev.filter((x) => x.id !== item.id)
                                          )
                                        }
                                        className="text-stone-400 hover:text-rose-600"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                  <p className="mt-1.5 leading-relaxed text-stone-600">
                                    {item.tipVi || item.tipEn}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </section>
                    </div>

                    {/* RIGHT COLUMN: Daily Hexagram + Almanac + Quick Lot + Pick a Time + Quick Chat */}
                    <div className="flex min-w-0 flex-col gap-4">
                      <section aria-label="Quẻ dịch hàng ngày" className="flex min-w-0 flex-col gap-3">
                        {/* Today's Hexagram Guidance Banner (1:1 from yilore_1to1_dom_spec.json) */}
                        <div
                          role="button"
                          tabIndex={0}
                          aria-disabled="false"
                          aria-label="Nhấn giữ để nhận chỉ dẫn hôm nay"
                          onMouseDown={() => setIsHoldingGuidance(true)}
                          onMouseUp={() => setIsHoldingGuidance(false)}
                          onMouseLeave={() => setIsHoldingGuidance(false)}
                          onTouchStart={() => setIsHoldingGuidance(true)}
                          onTouchEnd={() => setIsHoldingGuidance(false)}
                          onClick={handleCompleteTodayGuidanceDraw}
                          className="relative w-full scale-100 cursor-pointer touch-none select-none overflow-hidden rounded-2xl bg-transparent text-left shadow-lg shadow-stone-900/20 outline-none ring-1 ring-black/10 transition-[transform,filter] duration-150 ease-out hover:brightness-[1.03] focus-visible:ring-2 focus-visible:ring-amber-400 active:brightness-[0.98]"
                        >
                          <img
                            alt=""
                            className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
                            decoding="async"
                            src="/yilore-assets/mainpage-bg.png"
                          />
                          <div
                            className="pointer-events-none absolute inset-y-0 left-0 z-[4] overflow-hidden rounded-2xl"
                            style={{ width: `${holdProgress}%` }}
                            aria-hidden="true"
                          >
                            <div className="h-full w-full min-w-[1px] bg-gradient-to-b from-white/30 to-white/15" />
                          </div>
                          <div className="relative z-10 flex min-h-[118px] items-start gap-3 px-5 py-4 pb-5 pt-4 sm:min-h-[120px] sm:gap-4 sm:px-6 sm:pt-5">
                            <div className="pointer-events-none flex min-w-0 flex-1 flex-col items-stretch justify-start [text-shadow:0_1px_10px_rgba(0,0,0,0.45)]">
                              <p className="font-serif text-[0.8125rem] font-normal leading-normal text-white/90 opacity-100 transition-opacity duration-150 sm:text-sm">
                                Chỉ Dẫn Quẻ Dịch Hôm Nay
                              </p>
                              <p className="mt-2 font-serif text-2xl font-normal leading-[1.15] tracking-tight text-white opacity-100 transition-opacity duration-150 sm:mt-2.5 sm:text-[1.65rem] sm:leading-[1.2]">
                                {todayGuidanceRecord
                                  ? `${todayGuidanceRecord.guaName} · ${todayGuidanceRecord.cardTitle}`
                                  : isHoldingGuidance
                                  ? `Đang cảm ứng quẻ... ${holdProgress}%`
                                  : "Nhấn giữ để nhận chỉ dẫn hôm nay"}
                              </p>
                            </div>
                            <div className="pointer-events-none shrink-0 self-start pt-0.5 drop-shadow-[0_4px_14px_rgba(0,0,0,0.45)]">
                              <img
                                alt=""
                                width="96"
                                height="96"
                                className="h-[72px] w-[72px] object-contain opacity-[0.92] sm:h-[80px] sm:w-[80px]"
                                src="/yilore-assets/icon2.png"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Today's picks · Ten god: Seven Killings (1:1 from yilore_1to1_dom_spec.json) */}
                        <div className="rounded-xl border border-stone-200/70 bg-gradient-to-br from-amber-50/50 via-stone-50/80 to-white/90 px-3 py-3">
                          <p className="min-w-0 font-serif text-sm font-normal leading-normal text-stone-600 sm:text-[0.9375rem]">
                            Gợi ý dụng sự hôm nay<span className="text-stone-400"> · </span>
                            <span className="text-stone-500">Thập thần: Thất Sát</span>
                          </p>
                          <div className="mt-2.5 space-y-2 rounded-lg border border-stone-100/80 bg-white/70 px-2.5 py-2">
                            <div className="flex items-start gap-2">
                              <img
                                alt=""
                                width="20"
                                height="20"
                                className="h-5 w-5 shrink-0 object-contain"
                                decoding="async"
                                draggable="false"
                                src="/yilore-assets/yi.svg"
                              />
                              <p className="min-w-0 font-serif text-[13px] leading-relaxed text-[#2f4f4f]">
                                <span className="font-medium text-stone-600">Nên làm: </span>
                                Giải quyết việc khó, rèn luyện thể lực cường độ cao, chuyển hóa áp lực thành hành động bứt phá
                              </p>
                            </div>
                            <div className="flex items-start gap-2">
                              <img
                                alt=""
                                width="20"
                                height="20"
                                className="h-5 w-5 shrink-0 object-contain"
                                decoding="async"
                                draggable="false"
                                src="/yilore-assets/ji.svg"
                              />
                              <p className="min-w-0 font-serif text-[13px] leading-relaxed text-stone-600">
                                <span className="font-medium text-stone-500">Nên tránh: </span>
                                Tranh cãi trực diện với cấp trên, hành động bốc đồng mạo hiểm, quyết định đại sự khi đang nóng giận
                              </p>
                            </div>
                          </div>
                          <dl className="mt-2.5 font-serif text-[13px] leading-relaxed text-stone-700">
                            <dt className="text-[11px] font-medium text-stone-500">Âm nhạc gợi ý</dt>
                            <dd className="mt-0.5">Nhạc vận động nhịp trống rõ ràng, nhạc hòa tấu hào hùng tiếp thêm sinh khí</dd>
                          </dl>
                        </div>
                      </section>

                      {/* Section: I Ching lot (1:1 from yilore_1to1_dom_spec.json) */}
                      <section
                        aria-label="Rút xâm Kinh Dịch"
                        className="relative overflow-hidden rounded-2xl border border-stone-200/75 bg-white shadow-[0_1px_2px_rgba(28,25,23,0.04),0_8px_24px_-12px_rgba(28,25,23,0.1)]"
                      >
                        <div
                          className="pointer-events-none absolute inset-y-0 left-0 w-[6px] bg-gradient-to-b from-[#dcc9a8] via-[#c4a574] to-[#b8956a]"
                          aria-hidden="true"
                        />
                        <div className="relative !p-0 px-4 py-4 sm:!p-0 sm:px-5 sm:py-5">
                          <div className="flex min-h-[3.25rem] w-full items-center gap-3 px-4 py-3.5 sm:min-h-[3.5rem] sm:gap-4 sm:px-5 sm:py-4">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center justify-start gap-x-0.5 gap-y-1.5 font-serif text-[15px] font-normal leading-[1.6] text-stone-600 sm:text-base sm:leading-[1.65]">
                                <svg
                                  className="mr-1.5 h-[17px] w-[17px] shrink-0 text-[#b8956a] sm:mr-2 sm:h-[18px] sm:w-[18px]"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.75"
                                  aria-hidden="true"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                                  />
                                </svg>
                                <span className="mr-0.5">Khởi một niệm trong tâm, chạm để rút quẻ</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={handleDrawQuickLot}
                              className="inline-flex h-9 min-w-[4.75rem] shrink-0 items-center justify-center gap-1.5 rounded-full bg-stone-800 px-4 font-serif text-[14px] font-medium tracking-[0.06em] text-stone-50 transition hover:bg-stone-700 active:bg-stone-900 sm:h-10 sm:min-w-[5.25rem] sm:px-5 sm:text-[15px]"
                            >
                              <span className="leading-none">Rút quẻ</span>
                            </button>
                          </div>
                        </div>
                      </section>

                      {/* Section: Pick a time (1:1 from yilore_1to1_dom_spec.json) */}
                      <section
                        aria-label="Chọn giờ cát tường"
                        className="relative overflow-hidden rounded-2xl border border-stone-200/75 bg-white shadow-[0_1px_2px_rgba(28,25,23,0.04),0_8px_24px_-12px_rgba(28,25,23,0.1)]"
                      >
                        <div
                          className="pointer-events-none absolute inset-y-0 left-0 w-[6px] bg-gradient-to-b from-[#aec9bb] via-[#7a9e8e] to-[#6d9585]"
                          aria-hidden="true"
                        />
                        <div className="relative !p-0 px-4 py-4 sm:!p-0 sm:px-5 sm:py-5">
                          <div className="space-y-0">
                            <div className="flex min-h-[3.25rem] w-full items-center gap-3 px-4 py-3.5 sm:min-h-[3.5rem] sm:gap-4 sm:px-5 sm:py-4">
                              <div className="min-w-0 flex-1">
                                <div className="flex min-w-0 gap-2 text-stone-600">
                                  <svg
                                    className="mt-0.5 h-[17px] w-[17px] shrink-0 text-[#7a9e8e] sm:mt-1 sm:h-[18px] sm:w-[18px]"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.75"
                                    aria-hidden="true"
                                  >
                                    <rect x="3" y="4" width="18" height="18" rx="2" />
                                    <path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" />
                                  </svg>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-x-1 gap-y-1 text-left font-serif text-[15px] font-normal leading-snug sm:text-base">
                                      <span className="text-stone-600">Giúp tôi chọn giờ tốt</span>
                                      <select
                                        aria-label="Khi nào"
                                        value={workbenchRange}
                                        onChange={(e) => setWorkbenchRange(e.target.value)}
                                        className="mx-0.5 min-w-[2.75rem] shrink-0 cursor-pointer rounded-md border border-stone-200 bg-stone-50/80 py-0.5 pl-1.5 pr-2 text-center font-serif text-[15px] font-normal leading-none text-stone-700 transition-colors hover:border-stone-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-stone-300/50 sm:text-base"
                                      >
                                        <option value="today">Hôm nay</option>
                                        <option value="tomorrow">Ngày mai</option>
                                        <option value="within_1_week">Trong tuần này</option>
                                      </select>
                                      <span className="text-stone-600">cho việc</span>
                                      <span className="mx-0.5 inline-flex shrink-0 rounded-md border border-stone-200 bg-stone-50/80 px-1.5 py-0.5 text-center font-serif text-[15px] font-medium leading-none text-stone-700 sm:text-base">
                                        {workbenchOccasion}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => setIsStrategyInfoOpen(true)}
                                        aria-label="Cách hoạt động của gợi ý thời gian"
                                        className="ml-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-stone-400 ring-1 ring-stone-200/90 transition hover:bg-stone-100 hover:text-stone-600"
                                      >
                                        <svg
                                          viewBox="0 0 24 24"
                                          className="h-3.5 w-3.5"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          aria-hidden="true"
                                        >
                                          <circle cx="12" cy="12" r="9" />
                                          <path strokeLinecap="round" d="M12 10v6M12 7h.01" />
                                        </svg>
                                      </button>
                                    </div>

                                    <div className="mt-1.5">
                                      <div
                                        className="flex flex-wrap gap-1.5"
                                        role="group"
                                        aria-label="Dịp dụng sự"
                                      >
                                        {["Họp hành", "Tập trung", "Giao tiếp", "Hẹn hò", "Xuất hành", "Nghỉ ngơi", "Khác"].map(
                                          (occ) => (
                                            <button
                                              key={occ}
                                              type="button"
                                              onClick={() => setWorkbenchOccasion(occ)}
                                              className={`rounded-full px-2.5 py-1 font-serif text-[11px] ring-1 transition sm:text-[12px] ${
                                                workbenchOccasion === occ
                                                  ? "bg-stone-800 text-white ring-stone-800"
                                                  : "bg-stone-100 text-stone-600 ring-stone-200/80 hover:bg-stone-200/60"
                                              }`}
                                            >
                                              {occ}
                                            </button>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={handleRunWorkbenchSearch}
                                className="inline-flex h-9 min-w-[4.75rem] shrink-0 items-center justify-center gap-1.5 rounded-full bg-stone-800 px-4 font-serif text-[14px] font-medium tracking-[0.06em] text-stone-50 transition hover:bg-stone-700 active:bg-stone-900 sm:h-10 sm:min-w-[5.25rem] sm:px-5 sm:text-[15px]"
                              >
                                <span className="leading-none">Tra cứu</span>
                              </button>
                            </div>

                            {workbenchResults && (
                              <div className="space-y-2 border-t border-stone-100 px-4 pb-3.5 pt-2.5 sm:px-5">
                                <div className="flex items-center justify-between text-[11px] font-medium text-stone-500">
                                  <span>
                                    Khung giờ cát tường đề xuất ({WORKBENCH_RANGE_LABELS[workbenchRange] || workbenchRange})
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setWorkbenchResults(null)}
                                    className="text-stone-400 hover:text-stone-700"
                                  >
                                    Xóa
                                  </button>
                                </div>
                                {workbenchResults.map((w, i) => (
                                  <div
                                    key={i}
                                    className="rounded-lg border border-stone-200/80 bg-stone-50/70 p-2 text-xs"
                                  >
                                    <div className="flex items-center justify-between font-semibold text-stone-900">
                                      <span>{w.window}</span>
                                      <span className="text-emerald-800">
                                        {w.tenGod} · {w.score} điểm
                                      </span>
                                    </div>
                                    <p className="mt-0.5 text-[11px] text-stone-600">{w.advice}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </section>

                      {/* Questions? Chat with Cửu Nhị */}
                      <div>
                        <h2 className="mb-2 font-serif text-[13px] font-medium tracking-wide text-stone-700 sm:text-sm">
                          Có điều trăn trở? Trò chuyện cùng Cửu Nhị
                        </h2>
                        <div className="rounded-3xl bg-white/95 shadow-[0_2px_16px_-4px_rgba(28,25,23,0.08),0_6px_28px_-8px_rgba(28,25,23,0.06)] ring-1 ring-stone-200/50">
                          <label className="sr-only" htmlFor="app-home-composer">
                            Gần đây bạn đang băn khoăn điều gì…
                          </label>
                          <div className="relative px-4 pb-1 pt-4 sm:px-5 sm:pt-5">
                            <textarea
                              id="app-home-composer"
                              rows={2}
                              value={ledgerChatInput}
                              onChange={(e) => setLedgerChatInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  if (!ledgerChatInput.trim()) return;
                                  const q = ledgerChatInput;
                                  setLedgerChatInput("");
                                  setActiveRoute("chat");
                                  handleSendChatMessage(q);
                                }
                              }}
                              placeholder="Nhập tin nhắn… (@ người quen, # báo cáo quẻ; nhấn Enter để gửi)"
                              className="relative z-10 min-h-[5.5rem] w-full max-w-full resize-none border-0 bg-transparent py-1 pr-2 font-serif text-base leading-relaxed text-stone-900 placeholder:text-stone-400/80 outline-none focus:ring-0 sm:min-h-[6.5rem]"
                            />
                          </div>
                          <div className="flex items-center justify-between gap-3 px-3 pb-3 pt-1 sm:px-4 sm:pb-4">
                            <div className="flex min-w-0 items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveRoute("chat");
                                  setShowPeoplePicker(true);
                                }}
                                className="rounded-full px-3 py-1.5 font-serif text-[12px] font-medium text-stone-500 ring-1 ring-inset ring-stone-200/80 transition hover:bg-stone-50 hover:text-stone-700"
                              >
                                @Người quen
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveRoute("chat");
                                  setShowReadingPicker(true);
                                }}
                                className="rounded-full px-3 py-1.5 font-serif text-[12px] font-medium text-stone-500 ring-1 ring-inset ring-stone-200/80 transition hover:bg-stone-50 hover:text-stone-700"
                              >
                                #Báo cáo quẻ
                              </button>
                            </div>
                            <button
                              type="button"
                              aria-label="Gửi"
                              title="Gửi"
                              onClick={() => {
                                if (!ledgerChatInput.trim()) {
                                  setActiveRoute("chat");
                                  return;
                                }
                                const q = ledgerChatInput;
                                setLedgerChatInput("");
                                setActiveRoute("chat");
                                handleSendChatMessage(q);
                              }}
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-600 text-white shadow-sm transition hover:bg-amber-500 active:scale-95 focus-visible:outline focus-visible:ring-2 focus-visible:ring-amber-400/80 focus-visible:ring-offset-2 sm:h-10 sm:w-10"
                            >
                              <svg
                                className="h-[14px] w-[14px] translate-x-px"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden="true"
                              >
                                <path
                                  d="M22 2L11 13"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M22 2L15 22L11 13L2 9L22 2Z"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================
                  ROUTE 1: DAILY GUIDANCE (/en/app/daily-guidance)
                 ============================================================ */}
              {activeRoute === "daily-guidance" && (
                <YiloreDailyGuidanceView
                  lang={lang}
                  dailyRecords={dailyRecords}
                  isCalendarExpanded={isCalendarExpanded}
                  setIsCalendarExpanded={setIsCalendarExpanded}
                  selectedCalendarDate={selectedCalendarDate}
                  setSelectedCalendarDate={setSelectedCalendarDate}
                  selectedDateGuidanceRecord={selectedDateGuidanceRecord}
                  todayGuidanceRecord={todayGuidanceRecord}
                  isHoldingGuidance={isHoldingGuidance}
                  setIsHoldingGuidance={setIsHoldingGuidance}
                  holdProgress={holdProgress}
                  handleCompleteTodayGuidanceDraw={handleCompleteTodayGuidanceDraw}
                  isDailyCardFlipped={isDailyCardFlipped}
                  setIsDailyCardFlipped={setIsDailyCardFlipped}
                  dailyFollowupInput={dailyFollowupInput}
                  setDailyFollowupInput={setDailyFollowupInput}
                  handleAskDailyFollowup={handleAskDailyFollowup}
                />
              )}

              {/* ============================================================
                  ROUTE 3: HISTORY (/en/app/history)
                 ============================================================ */}
              {activeRoute === "history" && (
                <YiloreHistoryView
                  historyRecords={historyRecords}
                  onSelectRecord={(rec) => {
                    setSelectedHistoryRecord(rec);
                    setOverlayFlipBen(false);
                    setOverlayFlipZhi(false);
                  }}
                />
              )}

              {/* ============================================================
                  ROUTE 4: MEMORY MANAGEMENT (/en/app/memory-management)
                 ============================================================ */}
              {activeRoute === "memory" && (
                <YiloreMemoryView
                  memoryPrefs={memoryPrefs}
                  setMemoryPrefs={setMemoryPrefs}
                  onSaveToast={toast}
                />
              )}

              {/* ============================================================
                  ROUTE 5: PROFILE (/en/app/profile)
                 ============================================================ */}
              {activeRoute === "profile" && (
                <YiloreProfileView
                  profile={profile}
                  onOpenEdit={() => setIsEditProfileOpen(true)}
                />
              )}

              {/* ============================================================
                  ROUTE 6: RELATIONSHIPS (/en/app/relationships)
                 ============================================================ */}
              {activeRoute === "relationships" && (
                <YiloreRelationshipsView
                  relationships={relationships}
                  onAddNew={handleOpenAddRelationship}
                  onEdit={handleOpenEditRelationship}
                  onDelete={handleDeleteRelationship}
                  onOpenSynastryInChat={(rel) => {
                    setActiveRoute("chat");
                    handleSendChatMessage(
                      `👥 Hãy phân tích hợp bàn chuyên sâu giữa tôi (${profile.bazi.join(" ")}) và @${rel.name} (${rel.bazi})`
                    );
                  }}
                />
              )}
            </main>
          )}
        </div>
      </div>

      {/* ============================================================
          MODAL 1: ADD STRATEGY ITEM MODAL
         ============================================================ */}
      {isAddStrategyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <button
            type="button"
            aria-label="Đóng"
            onClick={() => setIsAddStrategyOpen(false)}
            className="absolute inset-0"
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-stone-200/80 bg-[#fdfcfa] p-5 shadow-xl">
            <h3 className="text-base font-semibold text-stone-900">Thêm việc cần làm</h3>
            <div className="mt-4 flex items-center gap-2">
              <div className="flex flex-1 items-center rounded-xl border border-stone-200/90 bg-white">
                <select
                  value={newStrategyCat}
                  onChange={(e) => setNewStrategyCat(e.target.value)}
                  className="border-r border-stone-200/80 bg-transparent px-3 py-2.5 text-xs text-stone-800 outline-none sm:text-sm"
                >
                  {YILORE_STRATEGY_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={newStrategyTitle}
                  onChange={(e) => setNewStrategyTitle(e.target.value)}
                  placeholder="VD: Họp với quản lý, Ký hợp đồng..."
                  className="w-full bg-transparent px-3 py-2.5 text-xs text-stone-800 outline-none sm:text-sm"
                />
              </div>
              <input
                type="time"
                aria-label="Thời gian (tùy chọn)"
                value={newStrategyTime}
                onChange={(e) => setNewStrategyTime(e.target.value)}
                className="w-[6.5rem] shrink-0 rounded-xl border border-stone-200/90 bg-white px-2.5 py-2.5 text-xs text-stone-800 outline-none focus:border-stone-400 sm:text-sm"
              />
            </div>

            <button
              type="button"
              onClick={handleAddStrategyItem}
              className="mt-4 w-full rounded-xl bg-stone-800 py-2.5 text-sm font-medium text-white transition hover:bg-stone-900"
            >
              Nhận gợi ý chiến lược
            </button>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL 2: STRATEGY SANDBOX INFO MODAL
         ============================================================ */}
      {isStrategyInfoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-[#fdfcfa] p-5 shadow-xl">
            <h3 className="text-base font-semibold text-stone-900">Cách hệ thống gợi ý thời gian &amp; chiến lược</h3>
            <p className="mt-2 text-xs leading-relaxed text-stone-600">
              <strong>Quy trình 2 bước kết hợp:</strong>
              <br />
              1. <strong>Đối chiếu lá số cá nhân trước:</strong> Phân tích Nhật Chủ Bát Tự của bạn ({formatGanZhiVi(profile.bazi[2])} · {profile.bazi[2]}) tương tác với năng lượng Thập Thần của từng khung giờ (12 canh giờ).
              <br />
              2. <strong>Kết hợp Hoàng Lịch Dụng Sự:</strong> Đối chiếu các việc Nên làm (Nghi) và Nên tránh (Kỵ) trong ngày để đưa ra lời khuyên tối ưu.
            </p>
            <button
              type="button"
              onClick={() => setIsStrategyInfoOpen(false)}
              className="mt-4 w-full rounded-xl bg-stone-800 py-2 text-xs font-medium text-white"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL 3: QUICK LOT DRAW MODAL (Hold one thought, tap to draw)
         ============================================================ */}
      {quickLotHexNumber !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="relative w-full max-w-md rounded-3xl border border-stone-200 bg-[#fdfcfa] p-6 text-center shadow-2xl">
            <button
              type="button"
              onClick={() => setQuickLotHexNumber(null)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="text-xs uppercase tracking-widest text-stone-400">Rút Xâm Nhanh Kinh Dịch</div>
            <h3 className="mt-1 text-xl font-semibold text-stone-900">
              {HEXAGRAMS.find((h) => h.number === quickLotHexNumber)?.name} ·{" "}
              {HEXAGRAMS.find((h) => h.number === quickLotHexNumber)?.hanzi}
            </h3>

            <div
              onClick={() => setIsQuickLotFlipped((v) => !v)}
              className="mx-auto mt-4 aspect-[3/4.3] w-56 cursor-pointer overflow-hidden rounded-2xl border border-stone-300 shadow-lg transition hover:scale-[1.02]"
            >
              <img
                src={getYiloreCardUrl(quickLotHexNumber, isQuickLotFlipped ? "b" : "a", "hant")}
                alt="Thẻ Xâm Kinh Dịch Cửu Nhị"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="mt-2 text-xs text-stone-400">
              Chạm vào thẻ bài để lật xem ({isQuickLotFlipped ? "Mặt sau" : "Mặt trước"})
            </div>

            <p className="mt-3 text-xs leading-relaxed text-stone-600">
              {BOOK_HEXAGRAMS.find((b) => b.number === quickLotHexNumber)?.destiny ||
                HEXAGRAMS.find((h) => h.number === quickLotHexNumber)?.overview ||
                HEXAGRAMS.find((h) => h.number === quickLotHexNumber)?.judgment}
            </p>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={handleDrawQuickLot}
                className="flex-1 rounded-full border border-stone-300 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100"
              >
                Rút lại
              </button>
              <button
                type="button"
                onClick={() => {
                  const h = HEXAGRAMS.find((x) => x.number === quickLotHexNumber);
                  setQuickLotHexNumber(null);
                  setActiveRoute("chat");
                  handleSendChatMessage(
                    `🎲 Tôi vừa rút được quẻ xâm Kinh Dịch: ${h?.name} (${h?.hanzi}). Hãy giúp tôi luận giải ý nghĩa quẻ này đối với tình huống hiện tại của tôi.`
                  );
                }}
                className="flex-1 rounded-full bg-stone-900 py-2 text-xs font-medium text-white hover:bg-stone-700"
              >
                Luận giải trong Trò chuyện
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL 4: READING INTERPRETATION REPORT OVERLAY (History / Chat)
         ============================================================ */}
      {selectedHistoryRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-stone-200 bg-[#fdfcfa] p-6 shadow-2xl sm:p-8">
            <button
              type="button"
              onClick={() => setSelectedHistoryRecord(null)}
              className="sticky top-0 float-right rounded-full bg-stone-100 p-2 text-stone-600 hover:bg-stone-200"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="text-xs uppercase tracking-widest text-stone-400">Kết Quả Luận Giải Quẻ Dịch</div>
            <h2 className="mt-1 text-2xl font-semibold text-stone-900">
              {selectedHistoryRecord.question}
            </h2>
            <div className="mt-1 text-xs text-stone-500">
              {selectedHistoryRecord.benGua.name} → {selectedHistoryRecord.zhiGua.name} ·{" "}
              {selectedHistoryRecord.createdAt}
            </div>

            {/* Summary Box */}
            <div className="mt-5 rounded-2xl border border-stone-200/80 bg-[#f6f3ec] p-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-amber-900">
                Tổng Quan Luận Giải
              </div>
              <div className="mt-2 whitespace-pre-line text-sm leading-relaxed text-stone-800">
                {renderInlineMarkdown(selectedHistoryRecord.summaryBrief)}
              </div>
              {selectedHistoryRecord.baziAnalysis && (
                <div className="mt-4 border-t border-stone-200/80 pt-3">
                  <div className="text-xs font-semibold uppercase tracking-wider text-teal-900">
                    Đối Chiếu Lá Số Bát Tự &amp; Đại Vận
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-stone-700">
                    {selectedHistoryRecord.baziAnalysis}
                  </p>
                </div>
              )}
            </div>

            {/* Original & Changed Hexagrams with Flippable Cards */}
            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-stone-200/80 bg-white p-5">
                <div className="text-xs text-stone-400">Bản Quái (本卦) · Hiện Trạng</div>
                <div className="mt-0.5 text-lg font-semibold text-stone-900">
                  {selectedHistoryRecord.benGua.name} · {selectedHistoryRecord.benGua.title}
                </div>
                <div
                  onClick={() => setOverlayFlipBen((v) => !v)}
                  className="mx-auto my-3 aspect-[3/4.2] w-44 cursor-pointer overflow-hidden rounded-xl border border-stone-200 shadow-md"
                >
                  <img
                    src={
                      overlayFlipBen
                        ? selectedHistoryRecord.benGua.backUrl
                        : selectedHistoryRecord.benGua.frontUrl
                    }
                    alt={selectedHistoryRecord.benGua.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="text-xs font-medium text-stone-700">
                  Quẻ từ: {selectedHistoryRecord.benGua.guaCi}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-stone-600">
                  {selectedHistoryRecord.benGua.detailExplain}
                </p>
              </div>

              <div className="rounded-2xl border border-stone-200/80 bg-white p-5">
                <div className="text-xs text-stone-400">Chi Quái (之卦) · Xu Hướng Biến Đổi</div>
                <div className="mt-0.5 text-lg font-semibold text-stone-900">
                  {selectedHistoryRecord.zhiGua.name} · {selectedHistoryRecord.zhiGua.title}
                </div>
                <div
                  onClick={() => setOverlayFlipZhi((v) => !v)}
                  className="mx-auto my-3 aspect-[3/4.2] w-44 cursor-pointer overflow-hidden rounded-xl border border-stone-200 shadow-md"
                >
                  <img
                    src={
                      overlayFlipZhi
                        ? selectedHistoryRecord.zhiGua.backUrl
                        : selectedHistoryRecord.zhiGua.frontUrl
                    }
                    alt={selectedHistoryRecord.zhiGua.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="text-xs font-medium text-stone-700">
                  Quẻ từ: {selectedHistoryRecord.zhiGua.guaCi}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-stone-600">
                  {selectedHistoryRecord.zhiGua.detailExplain}
                </p>
              </div>
            </div>

            {selectedHistoryRecord.yaoList.length > 0 && (
              <div className="mt-6 space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Hào Động (變爻)
                </div>
                {selectedHistoryRecord.yaoList.map((y) => {
                  const yaoFront =
                    y.frontUrl ||
                    `/assets/oss/${selectedHistoryRecord.benGua.position}/${selectedHistoryRecord.benGua.position}-${y.position}a.webp`;
                  return (
                    <div
                      key={y.position}
                      className="flex flex-col gap-4 rounded-xl border border-stone-200/80 bg-white p-4 sm:flex-row sm:items-start"
                    >
                      <div className="mx-auto aspect-[3/4.2] w-28 shrink-0 overflow-hidden rounded-lg border border-stone-200 shadow-sm sm:mx-0">
                        <img
                          src={yaoFront}
                          alt={y.lineName}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-stone-900">
                          {y.lineName} — {y.yaoCi}
                        </div>
                        <p className="mt-1.5 whitespace-pre-line text-xs leading-relaxed text-stone-700">
                          {renderInlineMarkdown(y.brief)}
                        </p>
                        {y.detailExplain && (
                          <p className="mt-2 whitespace-pre-line border-t border-stone-100 pt-2 text-xs leading-relaxed text-stone-600">
                            {renderInlineMarkdown(y.detailExplain)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL 5: EDIT PROFILE MODAL
         ============================================================ */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-[#fdfcfa] p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-stone-900">Thiết lập hồ sơ mệnh lý của bạn</h3>
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-stone-600">Tên gọi / Biệt danh của bạn</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900"
                />
              </div>

              <div>
                <label className="block text-stone-600">Giới tính (để lập lá số Bát Tự &amp; Đại Vận)</label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  {(["male", "female"] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setEditGender(g)}
                      className={`rounded-xl border py-2 text-sm ${
                        editGender === g
                          ? "border-stone-900 bg-stone-900 text-white"
                          : "border-stone-200 bg-white text-stone-700"
                      }`}
                    >
                      {g === "male" ? "Nam" : "Nữ"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-600">Ngày sinh (Dương lịch)</label>
                  <input
                    type="date"
                    value={editBirthDate}
                    onChange={(e) => setEditBirthDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-stone-600">Giờ sinh (0–23h)</label>
                  <input
                    type="number"
                    min={0}
                    max={23}
                    value={editBirthHour}
                    onChange={(e) => setEditBirthHour(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-600">Nơi sinh (Tùy chọn)</label>
                <input
                  type="text"
                  value={editBirthCity}
                  onChange={(e) => setEditBirthCity(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(false)}
                className="rounded-full border border-stone-200 px-4 py-2 text-xs text-stone-600"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveProfileEdit}
                className="rounded-full bg-stone-900 px-5 py-2 text-xs font-medium text-white hover:bg-stone-700"
              >
                Lưu &amp; Tính lại lá số
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL 6: RELATIONSHIP PROFILE EDIT SHEET
         ============================================================ */}
      {isRelationshipModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-[#fdfcfa] p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-stone-900">
                {editingRelationship ? "Chỉnh sửa hồ sơ quan hệ" : "Thêm hồ sơ quan hệ mới"}
              </h3>
              <button
                type="button"
                onClick={() => setIsRelationshipModalOpen(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-stone-600">Tên / Biệt danh</label>
                <input
                  type="text"
                  value={relName}
                  onChange={(e) => setRelName(e.target.value)}
                  placeholder="VD: Linh, Người yêu, Quản lý..."
                  className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-600">Mối quan hệ</label>
                  <select
                    value={relType}
                    onChange={(e) =>
                      setRelType(e.target.value as YiloreRelationshipProfile["relation"])
                    }
                    className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900"
                  >
                    {RELATION_OPTIONS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-stone-600">Giới tính</label>
                  <select
                    value={relGender}
                    onChange={(e) => setRelGender(e.target.value as "male" | "female")}
                    className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900"
                  >
                    <option value="female">Nữ (女)</option>
                    <option value="male">Nam (男)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-600">Ngày sinh</label>
                  <input
                    type="date"
                    value={relBirthDate}
                    onChange={(e) => setRelBirthDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-stone-600">Giờ sinh</label>
                  <input
                    type="time"
                    value={relBirthTime}
                    onChange={(e) => setRelBirthTime(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900"
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsRelationshipModalOpen(false)}
                className="rounded-full border border-stone-200 px-4 py-2 text-xs text-stone-600"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleSaveRelationship}
                className="rounded-full bg-stone-900 px-5 py-2 text-xs font-medium text-white hover:bg-stone-700"
              >
                Lưu hồ sơ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL 7: 1:1 DARK CREDIT USAGE MODAL (#111518)
         ============================================================ */}
      <YiloreCreditUsageModal
        isOpen={isCreditsModalOpen}
        onClose={() => setIsCreditsModalOpen(false)}
      />
    </div>
  );
};
