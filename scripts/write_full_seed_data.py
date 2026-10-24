import json

def main():
    with open("data/yilore_scan/scraped/transformed_chat_messages.json", "r", encoding="utf-8") as f:
        chat_msgs = json.load(f)

    # Convert readingIdRef into divinationRecord reference in TS
    msgs_ts_lines = []
    for m in chat_msgs:
        rid = m.pop("readingIdRef", None)
        s = json.dumps(m, ensure_ascii=False, indent=8)
        if rid == "b72d4ac3-30ce-4125-b707-d9140c2b0722":
            s = s[:-2] + ',\n        "divinationRecord": YILORE_INITIAL_HISTORY_RECORDS[1]\n      }'
        elif rid == "16813bd0-b255-48bb-82f4-bdb5967105ec":
            s = s[:-2] + ',\n        "divinationRecord": YILORE_INITIAL_HISTORY_RECORDS[0]\n      }'
        msgs_ts_lines.append("      " + s.strip())

    msgs_ts_block = ",\n".join(msgs_ts_lines)

    ts_content = f'''import {{
  YILORE_HEXAGRAM_CATALOG_64,
  YILORE_TEN_GOD_DAILY_PICKS,
  YILORE_FIVE_ELEMENT_DAILY_PICKS,
  YILORE_OCCASION_CATEGORIES,
  YILORE_HOUR_STARS_12,
  YILORE_TEN_GOD_FOCUS_AFFINITIES,
  YILORE_ZIWEI_ASTROLABE,
  YILORE_HELUO_LISHU_EN,
  YILORE_HELUO_LISHU_ZH,
  YILORE_BLOG_ARTICLES,
  YILORE_SCRAPED_STATS,
}} from "./yiloreScrapedCatalog";

export {{
  YILORE_HEXAGRAM_CATALOG_64,
  YILORE_TEN_GOD_DAILY_PICKS,
  YILORE_FIVE_ELEMENT_DAILY_PICKS,
  YILORE_OCCASION_CATEGORIES,
  YILORE_HOUR_STARS_12,
  YILORE_TEN_GOD_FOCUS_AFFINITIES,
  YILORE_ZIWEI_ASTROLABE,
  YILORE_HELUO_LISHU_EN,
  YILORE_HELUO_LISHU_ZH,
  YILORE_BLOG_ARTICLES,
  YILORE_SCRAPED_STATS,
}};

export interface YiloreUserProfile {{
  id: string;
  ylId: string;
  email: string;
  userName: string;
  gender: "male" | "female";
  birthDate: string; // YYYY-MM-DD
  birthHour: number; // 0-23
  birthMinute: number;
  birthplace: string;
  birthplaceLongitude?: number;
  birthplaceLatitude?: number;
  timezone: string;
  trueSolarTime: boolean;
  lunarYear: string;
  lunarMonth: number;
  lunarDay: number;
  lunarHour: string;
  bazi: [string, string, string, string]; // Year, Month, Day, Hour
  dayun: {{
    previous: {{ startAge: number; endAge: number; startYear: number; endYear: number; ganZhi: string }};
    current: {{ startAge: number; endAge: number; startYear: number; endYear: number; ganZhi: string }};
    next: {{ startAge: number; endAge: number; startYear: number; endYear: number; ganZhi: string }};
    startDescription: string;
  }};
  destinyHexagram: {{
    hexagramNumber: number;
    binary: string;
    archetypeTitle: string;
    archetypeTitleZh?: string;
    cardTitleEn?: string;
    cardTitleZh?: string;
    hexagramNameEn: string;
    hexagramNameZh: string;
    descriptionEn: string;
    descriptionZh?: string;
    descriptionVi: string;
    traitsEn: string[];
    traitsZh?: string[];
    traitsVi: string[];
    frontImageUrl?: string;
  }};
  preHeavenGua?: {{
    binary: string;
    guaNameEn: string;
    guaNameZh: string;
    frontImageUrl: string;
    backImageUrl: string;
    panciZh: string;
  }};
  postHeavenGua?: {{
    binary: string;
    guaNameEn: string;
    guaNameZh: string;
    frontImageUrl: string;
    backImageUrl: string;
    panciZh: string;
  }};
  yuanTang: {{
    position: number;
    lineTextEn: string;
    lineTextVi: string;
    lineTextZh: string;
    frontImageUrl?: string;
    backImageUrl?: string;
  }};
  lifeScript: {{
    verseZh: string;
    verseVi: string;
    verseEn: string;
  }};
  dayPillarCard: {{
    ganZhi: string;
    archetypeZh: string;
    archetypeEn: string;
    archetypeVi: string;
    poeticLineZh: string;
    poeticLineVi: string;
    introZh?: string;
    tagsZh: string[];
    tagsVi: string[];
    tagsEn: string[];
    imageUrl?: string;
  }};
  credits: number;
  dailyMessagesRemaining: number;
  dailyMessagesLimit: number;
}}

export interface YiloreFollowupItem {{
  id: string;
  question: string;
  answer: string;
  createdAt: string;
}}

export interface YiloreDailyGuidanceRecord {{
  id: string;
  drawnDate: string; // YYYY-MM-DD
  hexagramNumber: number;
  guaName: string;
  guaNameEn: string;
  guaNameVi: string;
  cardTitle: string;
  cardTitleEn: string;
  guaCi: string;
  dailyGuidance: string;
  dailyGuidanceEn: string;
  dailyGuidanceVi: string;
  keywords: string[];
  dayBadge: string;
  frontImageUrl: string;
  backImageUrl: string;
  followupHistory: YiloreFollowupItem[];
}}

export interface YiloreReadingRecord {{
  readingId: string;
  question: string;
  createdAt: string;
  summaryBrief: string;
  summaryHighlight: string;
  baziAnalysis?: string;
  suggestedFollowups?: string[];
  benGua: {{
    position: number;
    name: string;
    nameVi: string;
    title: string;
    guaCi: string;
    brief: string;
    detailExplain: string;
    frontUrl: string;
    backUrl: string;
    lines: number[]; // 6 values: 6 (old yin), 7 (young yang), 8 (young yin), 9 (old yang)
  }};
  zhiGua: {{
    position: number;
    name: string;
    nameVi: string;
    title: string;
    guaCi: string;
    brief: string;
    detailExplain: string;
    frontUrl: string;
    backUrl: string;
  }};
  yaoList: {{
    position: number;
    lineName: string;
    yaoTitle?: string;
    yaoCi: string;
    brief: string;
    detailExplain?: string;
    frontUrl?: string;
    backUrl?: string;
  }}[];
}}

export interface YiloreRelationshipProfile {{
  id: string;
  name: string;
  relation: "Partner" | "Family" | "Friend" | "Colleague" | "Other";
  gender: "male" | "female";
  birthDate: string;
  birthTime: string;
  birthCity: string;
  bazi: string;
  dayMaster: string;
  destinyHexagramName: string;
  compatibilityScore: number;
  synastrySummary: string;
}}

export interface YiloreQuickLotPayload {{
  position: number;
  guaName: string;
  cardTitle: string;
  guaCi: string;
  luckTier: "上签" | "中平" | "下签";
  frontUrl: string;
  backUrl: string;
}}

export interface YiloreChatMessage {{
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  type?: "text" | "divination_prompt" | "divination_result" | "lot_card" | "auspicious_result";
  divinationRecord?: YiloreReadingRecord;
  lotHexagramNumber?: number;
  quickLot?: YiloreQuickLotPayload;
}}

export interface YiloreConversation {{
  id: string;
  title: string;
  updatedAt: string;
  activePersonIds: string[];
  activeReportIds: string[];
  messages: YiloreChatMessage[];
}}

export interface YiloreStrategyItem {{
  id: string;
  category: string;
  title: string;
  time: string;
  tenGod: string;
  score: number;
  tipEn: string;
  tipVi: string;
}}

export function getYiloreCardUrl(hexagramNumber: number, side: "a" | "b" = "a", lang: "en" | "hant" = "en"): string {{
  const n = Math.max(1, Math.min(64, hexagramNumber || 1));
  if (lang === "hant") {{
    return `/yilore-cards/hant/${{n}}${{side}}.webp`;
  }}
  return `/yilore-cards/en/${{n}}${{side}}-en.webp`;
}}

export function getYiloreRizhuCardUrl(rizhuIndex: number): string {{
  const idx = Math.max(1, Math.min(60, rizhuIndex || 2));
  return `/yilore-cards/rizhu/${{idx}}.webp`;
}}

export function getYiloreYaoCardUrl(hexagramNumber: number, yaoPosition: number): string {{
  const n = Math.max(1, Math.min(64, hexagramNumber || 1));
  const y = Math.max(1, Math.min(6, yaoPosition || 1));
  return `/yilore-cards/yao_all/${{n}}-${{y}}a.webp`;
}}

export const YILORE_STEM_COLORS: Record<string, string> = {{
  // Wood (甲, 乙, 寅, 卯)
  "甲": "#15803d",
  "乙": "#15803d",
  "寅": "#15803d",
  "卯": "#15803d",
  // Fire (丙, 丁, 巳, 午)
  "丙": "#b91c1c",
  "丁": "#b91c1c",
  "巳": "#b91c1c",
  "午": "#b91c1c",
  // Earth (戊, 己, 辰, 戌, 丑, 未)
  "戊": "#92400e",
  "己": "#92400e",
  "辰": "#92400e",
  "戌": "#92400e",
  "丑": "#92400e",
  "未": "#92400e",
  // Metal (庚, 辛, 申, 酉)
  "庚": "#b45309",
  "辛": "#b45309",
  "申": "#b45309",
  "酉": "#b45309",
  // Water (壬, 癸, 亥, 子)
  "壬": "#1d4ed8",
  "癸": "#1d4ed8",
  "亥": "#1d4ed8",
  "子": "#1d4ed8",
}};

export const YILORE_12_HOURS_ENERGY = [
  {{ branch: "子", hour: "01", tenGodEn: "Officer", tenGodVi: "Chính Quan", tenGodZh: "正官", score: 28, highlight: false }},
  {{ branch: "丑", hour: "03", tenGodEn: "Wealth", tenGodVi: "Chính Tài", tenGodZh: "正财", score: 29, highlight: false }},
  {{ branch: "寅", hour: "05", tenGodEn: "Officer", tenGodVi: "Chính Quan", tenGodZh: "正官", score: 86, highlight: true }},
  {{ branch: "卯", hour: "07", tenGodEn: "7K", tenGodVi: "Thất Sát", tenGodZh: "七杀", score: 78, highlight: true }},
  {{ branch: "辰", hour: "09", tenGodEn: "Direct", tenGodVi: "Chính Ấn", tenGodZh: "正印", score: 30, highlight: false }},
  {{ branch: "巳", hour: "11", tenGodEn: "Indirect", tenGodVi: "Thiên Ấn", tenGodZh: "偏印", score: 72, highlight: true }},
  {{ branch: "午", hour: "13", tenGodEn: "Rob", tenGodVi: "Kiếp Tài", tenGodZh: "劫财", score: 50, highlight: true }},
  {{ branch: "未", hour: "15", tenGodEn: "Peer", tenGodVi: "Tỷ Kiên", tenGodZh: "比肩", score: 33, highlight: false }},
  {{ branch: "申", hour: "17", tenGodEn: "Hurting", tenGodVi: "Thương Quan", tenGodZh: "伤官", score: 68, highlight: true }},
  {{ branch: "酉", hour: "19", tenGodEn: "Food", tenGodVi: "Thực Thần", tenGodZh: "食神", score: 64, highlight: false }},
  {{ branch: "戌", hour: "21", tenGodEn: "Wealth", tenGodVi: "Thiên Tài", tenGodZh: "偏财", score: 45, highlight: false }},
  {{ branch: "亥", hour: "23", tenGodEn: "7K", tenGodVi: "Thất Sát", tenGodZh: "七杀", score: 35, highlight: false }},
];

export const YILORE_STRATEGY_CATEGORIES = [
  "Custom",
  "Meeting",
  "Interview",
  "Focus",
  "Study",
  "Social",
  "Date",
  "Contract",
  "Travel",
  "Finance",
  "Shopping",
  "Move",
  "Renovation",
  "Opening",
  "Rest",
  "Other",
];

export const YILORE_DAILY_QUESTIONS = [
  "How is my career fortune today?",
  "What surprises might today bring?",
  "How is my love fortune today?",
  "Is today suitable for major decisions?",
  "How is my financial fortune today?",
  "What should I pay attention to today?",
  "How are my interpersonal relationships today?",
  "Is today good for traveling?",
  "How is my academic fortune today?",
  "What is my lucky direction today?",
];

export const YILORE_INITIAL_PROFILE: YiloreUserProfile = {{
  id: "c6e4506d-950b-419f-a372-01afe8dc49a5",
  ylId: "YL104062",
  email: "thedat.hk@gmail.com",
  userName: "d",
  gender: "male",
  birthDate: "1992-10-16",
  birthHour: 9,
  birthMinute: 0,
  birthplace: "广东 · 广州",
  birthplaceLongitude: 113.2644,
  birthplaceLatitude: 23.1291,
  timezone: "Asia/Ho_Chi_Minh",
  trueSolarTime: false,
  lunarYear: "壬申年",
  lunarMonth: 9,
  lunarDay: 21,
  lunarHour: "巳时",
  bazi: ["壬申", "庚戌", "乙丑", "辛巳"],
  dayun: {{
    previous: {{ startAge: 19, endAge: 28, startYear: 2010, endYear: 2019, ganZhi: "壬子" }},
    current: {{ startAge: 29, endAge: 38, startYear: 2020, endYear: 2029, ganZhi: "癸丑" }},
    next: {{ startAge: 39, endAge: 48, startYear: 2030, endYear: 2039, ganZhi: "甲寅" }},
    startDescription: "7年4个月10天后起运",
  }},
  destinyHexagram: {{
    hexagramNumber: 18,
    binary: "011001",
    archetypeTitle: "The Reconstructor",
    archetypeTitleZh: "重構者",
    cardTitleEn: "Sweeping Away the Dust",
    cardTitleZh: "淨手掃積塵",
    hexagramNameEn: "Decay",
    hexagramNameZh: "山風蠱",
    descriptionEn:
      "You never shy away from a problem. With foresight and a profound sense of duty, you perceive the heart of chaos to rebuild order. You wield sharp insight and decisive action to confront corruption, forging solutions from the depths of disarray and despair",
    descriptionZh:
      "從不逃避問題，富有責任感和遠見，善於在混亂中洞悉本質，重構秩序，利用深刻的洞察力與堅定的行動力直面弊端，在絕境和混亂中找到解決辦法",
    descriptionVi:
      "Bạn không bao giờ né tránh nan đề. Với tầm nhìn xa và tinh thần trách nhiệm sâu sắc, bạn nhìn thấu tâm điểm của sự hỗn loạn để tái thiết trật tự. Bằng nhãn quan sắc bén và hành động quyết đoán, bạn chấn chỉnh những trì trệ cũ kỹ và kiến tạo giải pháp từ trong nghịch cảnh.",
    traitsEn: ["Accountability", "Resilience", "Decisiveness"],
    traitsZh: ["擔當", "堅韌", "果決"],
    traitsVi: ["Trách nhiệm", "Kiên cường", "Quyết đoán"],
    frontImageUrl: "/yilore-cards/en/18a-en.webp",
  }},
  preHeavenGua: {{
    binary: "001011",
    guaNameEn: "Development",
    guaNameZh: "風山漸",
    frontImageUrl: "/yilore-cards/heluo/53a.webp",
    backImageUrl: "/yilore-cards/heluo/53b.webp",
    panciZh: "幾度江邊釣，游魚未上鉤。瀟湘一片景，將久快心頭。",
  }},
  postHeavenGua: {{
    binary: "010001",
    guaNameEn: "Youthful Folly",
    guaNameZh: "山水蒙",
    frontImageUrl: "/yilore-cards/heluo/4a.webp",
    backImageUrl: "/yilore-cards/heluo/4b.webp",
    panciZh: "隔江驚曉不成危，木盡煙消總作灰。陽氣復來先報喜，雪含觀笑賞江梅。",
  }},
  yuanTang: {{
    position: 6,
    lineTextEn:
      "The wild goose gradually draws near the clouds on high. Its feathers can be used for the sacred dance. Good fortune.",
    lineTextVi:
      "Hồng tiệm vu lục, kỳ vũ khả dụng vi nghi, cát. (Chim hồng bay dần lên tầng mây cao, lông vũ của nó dùng làm nghi trượng lễ nhạc cao quý, đại cát).",
    lineTextZh: "上九，鴻漸于陸，其羽可用為儀，吉",
    frontImageUrl: "/yilore-cards/yao/53-6a.webp",
    backImageUrl: "/yilore-cards/yao/53-6b.webp",
  }},
  lifeScript: {{
    verseZh: "人存清远志，脱迹离尘埃。万里人扶上，端为庙廊材。",
    verseVi: "Người mang chí thanh viễn, thoát khỏi chốn bụi trần. Vạn dặm có quý nhân nâng đỡ, xứng bậc rường cột miếu đường.",
    verseEn:
      "Holding a pure and far-reaching aspiration, stepping beyond worldly dust. Supported across ten thousand miles, destined to be a pillar of the grand hall.",
  }},
  dayPillarCard: {{
    ganZhi: "乙丑",
    archetypeZh: "雪原幽兰",
    archetypeEn: "Orchid in the Snowfield",
    archetypeVi: "Tuyết Nguyên U Lan (Hoa Lan Trên Cánh Đồng Tuyết)",
    poeticLineZh: "凌寒嫩蕊欺霜雪，冻土深根养暗金",
    poeticLineVi: "Nhụy non vượt giá lạnh coi thường sương tuyết, rễ sâu trong đất đóng băng nuôi dưỡng ánh kim ngầm.",
    introZh:
      "如同一株在寒冬冻土中顽强绽放的幽兰，这是一种极具韧性与现实主义精神的性格底色。乙木虽柔，却能克制脚下的丑土，意味着看似柔弱的外表下，藏着惊人的生存能力与掌控力。生于寒湿之境，不求一时的绚烂夺目，而习惯在逆境中默默扎根（丑土为金库），在无人问津的角落积蓄力量。这是一种“低开高走”的生命形态，内里潜藏的价值（海中金）往往要在历经风霜后，才会发出夺目的光芒。",
    tagsZh: ["#外柔内刚", "#务实隐忍", "#外圆内方"],
    tagsVi: ["#Ngoại nhu nội cương", "#Thực tế nhẫn nại", "#Ngoài tròn trong vuông"],
    tagsEn: ["#GentleOutsideFirmInside", "#PragmaticResilient", "#DiplomaticPrincipled"],
    imageUrl: "/yilore-cards/rizhu/2.webp",
  }},
  credits: 0,
  dailyMessagesRemaining: 20,
  dailyMessagesLimit: 20,
}};

export const YILORE_INITIAL_DAILY_RECORDS: YiloreDailyGuidanceRecord[] = [
  {{
    id: "3c9064c8-2929-4ae0-8e94-8e624a9cbc78",
    drawnDate: "2026-10-20",
    hexagramNumber: 26,
    guaName: "山天大蓄",
    guaNameEn: "Great Taming (Da Chu)",
    guaNameVi: "Sơn Thiên Đại Súc",
    cardTitle: "神牛鎮雲巔",
    cardTitleEn: "Sacred Ox Atop the Cloud Peak",
    guaCi: "利貞，不家食吉，利涉大川",
    dailyGuidance: "今日且專注耕耘。時機一到，水到渠成",
    dailyGuidanceEn: "Focus on steady cultivation today. When the right moment arrives, everything will fall into place naturally.",
    dailyGuidanceVi: "Hôm nay hãy chuyên tâm vun bồi nội lực. Khi thời cơ chín muồi, nước chảy thành sông, đại sự tự khắc thành tựu.",
    keywords: ["收斂鋒芒", "靜待時機"],
    dayBadge: "Contemplation Day",
    frontImageUrl: "/yilore-cards/hant/26a.webp",
    backImageUrl: "/yilore-cards/hant/26b.webp",
    followupHistory: [
      {{
        id: "647921ea-bf4f-40b1-81a7-931aab08a2cd",
        question: "今日事業運如何？",
        answer:
          "今日得「山天大蓄」卦，事業運穩健向上。指引建議「專注耕耘」，意味著現在是積累實力、沉澱經驗的最佳時機，不宜急於求成或頻繁變動。請耐心處理手頭任務，將基礎打牢，待時機成熟，成果自會水到渠成。",
        createdAt: "2026-10-20 03:03",
      }},
      {{
        id: "b69c2229-5525-4f65-8028-0fbf63d819ae",
        question: "chòa",
        answer:
          "您好，「chòa」似乎不是完整的提問。若您想進一步了解今日運勢細節，或探討如轉職等重大決策，建議您前往**主頁**的提問框輸入具體問題並正式起卦，以便我為您進行更精準、深入的易理推演與指引。",
        createdAt: "2026-10-20 03:29",
      }},
    ],
  }},
  {{
    id: "3aa94ef5-be9a-486e-94b0-2c0ee9d51d59",
    drawnDate: "2026-10-19",
    hexagramNumber: 39,
    guaName: "Obstruction",
    guaNameEn: "Obstruction",
    guaNameVi: "Thủy Sơn Kiển",
    cardTitle: "The Wise One Stops at the Icefall",
    cardTitleEn: "The Wise One Stops at the Icefall",
    guaCi: "The southwest furthers. The northeast does not further. It furthers one to see the great man. Perseverance brings good fortune.",
    dailyGuidance: "The road is blocked today. Pause, look inward, and the answer will emerge",
    dailyGuidanceEn: "The road is blocked today. Pause, look inward, and the answer will emerge",
    dailyGuidanceVi: "Lối đi phía trước đang bị cản trở. Hãy tạm dừng, quán chiếu nội tâm, câu trả lời sẽ tự khắc hiển lộ.",
    keywords: ["进退两难", "待时而动"],
    dayBadge: "Regulation Day",
    frontImageUrl: "/yilore-cards/en/39a-en.webp",
    backImageUrl: "/yilore-cards/en/39b-en.webp",
    followupHistory: [],
  }},
];

export const YILORE_INITIAL_HISTORY_RECORDS: YiloreReadingRecord[] = [
  {{
    readingId: "16813bd0-b255-48bb-82f4-bdb5967105ec",
    question: "當前狀態是否穩定",
    createdAt: "2026-10-20 03:15",
    summaryHighlight: "表面动荡，实则临近转折，关键在能否克制焦虑、稳住节奏。",
    summaryBrief:
      "**你不是不稳，而是正处于突破前的震颤期**\\n\\n你感觉不稳定，是因为你已经走到了旧阶段的尽头，而新状态尚未完全成型。就像小狐狸的爪子已经抓住了岸，身体却还在水中摇晃——这不是失败，而是蜕变必经的悬空时刻。\\n\\n两个变爻揭示了你内心的两股力量：一股是六三的‘进退维谷’，告诉你旧路已堵死，不能再用老方法硬闯；另一股是上九的‘饮酒濡首’，提醒你最近可能刚完成某个阶段性任务，有些松懈，甚至有点自我怀疑：‘我是不是太急了？’\\n\\n但卦象说得很清楚：你不是走错了，而是走得太快，环境还没跟上。之卦雷风恒，像那对树下静坐的白发夫妻，告诉你真正的稳定不是风平浪静，而是**在波动中依然选择坚守方向**。\\n\\n**行动建议：暂停推进，转为观察与准备**\\n\\n与其焦虑地等对方回应，不如把精力放在梳理已有成果、优化下一步方案上。把这段时间当作庆功后的休整期，但别真的放松下来。\\n\\n**心智建议：把‘不确定’重新定义为‘酝酿期’**\\n\\n你怕的不是变化，而是不知道变化会带来什么。但未济之后是恒，说明这场波动最终指向的，是一段更长久的稳定。你现在要做的，不是追求立刻的安定，而是**在心中建立不可动摇的锚点**——你知道自己要去哪里，就够了。",
    baziAnalysis:
      "当前大运癸丑（29-38岁）与日柱乙丑伏吟，主内在压力与反复拉扯，情绪易受外界波动影响。癸水偏印透出，思维敏感多虑，面对不确定性时容易陷入过度分析。但时柱辛巳中藏丙火伤官，暗藏突破困局的创造力与表达力，关键在于能否将焦虑转化为清晰的行动策略。",
    suggestedFollowups: [
      "我该如何判断对方的回应是拖延还是真的无能为力？",
      "当前外部环境的变化，到底是威胁还是隐藏的机会？",
      "如果必须主动打破僵局，我该从哪个具体动作开始？",
    ],
    benGua: {{
      position: 64,
      name: "火水未济",
      nameVi: "Hỏa Thủy Vị Tế",
      title: "现状 · 功成垂成",
      guaCi: "亨，小狐汔济，濡其尾，无攸利",
      brief:
        "你现在就像那只即将登岸的小狐狸，眼看目标就在眼前，却总觉得尾巴还拖在水里，被无形的力量牵制着。\\n\\n这种状态不是失败，而是临门一脚前的必经震荡。计划总在变动，人也飘忽不定，但你要明白——混乱本身，就是过渡期最真实的模样。真正的转机，不在于环境是否稳定，而在于你能否在波动中守住自己的节奏。",
      detailExplain:
        "火水未济，离上坎下，火在水上，不相为用，象征事未成、气不交。卦辞‘小狐汔济，濡其尾’，正是你当下写照：接近成功，却因最后一点疏忽或外力干扰而难以彻底跨越。\\n\\n易罗画面中，小狐前爪已触岸，尾却沾水——这正是‘功成垂成’之象。此时最忌急躁冒进，也忌因等待而松懈。未济之局，贵在知险而慎行，以静制动，在混乱中建立内在秩序。",
      frontUrl: "/yilore-cards/hant/64a.webp",
      backUrl: "/yilore-cards/hant/64b.webp",
      lines: [8, 7, 6, 7, 8, 9],
    }},
    zhiGua: {{
      position: 32,
      name: "雷风恒",
      nameVi: "Lôi Phong Hằng",
      title: "趋势 · 静守以恒",
      guaCi: "恒，亨，无咎，利贞，利有攸往",
      brief:
        "恒卦像一棵老树，根深叶茂，不因风雨而动摇。它告诉你，真正的稳定不是没有波动，而是在波动中依然能保持核心不变。\\n\\n你现在所经历的混乱，最终会导向一种更深层的恒常——但前提是，你得先熬过这段‘看似无序’的过渡期。",
      detailExplain:
        "雷风恒，震上巽下，雷动风行，二者同向，故能长久。卦辞‘利有攸往’，说明只要方向正确，持续前行就有利。\\n\\n与未济的‘事未成’相反，恒卦强调‘道可久’。之卦为恒，意味着当前的不稳定只是表象，整体趋势正朝向长期稳定发展。易罗画面中白发夫妻静坐树下，正是‘静守以待时’的象征——他们不急，因为他们知道，时间会证明一切。",
      frontUrl: "/yilore-cards/hant/32a.webp",
      backUrl: "/yilore-cards/hant/32b.webp",
    }},
    yaoList: [
      {{
        position: 3,
        lineName: "六三，未濟，征凶，利涉大川",
        yaoTitle: "困境 · 歧路徘徊",
        yaoCi: "未濟，征凶，利涉大川",
        brief:
          "你正卡在一个看似能走实则不通的路上，继续往前冲只会耗费更多心力。\\n\\n就像商队被困在落石的山道，绕路或折返不是退缩，而是智慧。现在最需要的，不是坚持，而是**果断放弃无效路径**。",
        detailExplain:
          "六三爻辞‘未济，征凶，利涉大川’，表面矛盾，实则深意：当下形势未济，强行进取（征）必凶；但若能认清现实，转向更根本的变革（涉大川），反而有利。\\n\\n爻位六三，阴居阳位，不中不正，象征行动与位置不匹配。你可能正用不适合的方式，去应对一个已经变化的问题。易罗画面中商旅犹豫，正是你内心的投射——不是没有路，而是你还不愿承认旧路已断。",
        frontUrl: "/yilore-cards/yao/64-3a.webp",
        backUrl: "/yilore-cards/yao/64-3b.webp",
      }},
      {{
        position: 6,
        lineName: "上九，有孚于飲酒，无咎。濡其首，有孚失是",
        yaoTitle: "警示 · 乐极防失",
        yaoCi: "有孚于飲酒，无咎。濡其首，有孚失是",
        brief:
          "你最近可能刚完成某件事，心里有点轻松，甚至有点得意，但危险就藏在这份放松里。\\n\\n酒洒衣冠，看似无伤大雅，实则暗示你可能忽略了某个细节，或对他人态度有所松懈。此刻的松一口气，可能让之前的努力打折扣。",
        detailExplain:
          "上九爻辞‘有孚于饮酒，无咎；濡其首，有孚失是’，前半句是肯定——你有信用、有成果，可以庆祝；后半句是警告——若因喜悦而失态（濡其首），就会失去应有的分寸（有孚失是）。\\n\\n这是全卦最后一爻，象征阶段性的终结。你正处于一个‘成果验收期’，外界可能还没反馈，但你内心已有评判。此时最忌自我满足，而应保持清醒，做好收尾与预案。",
        frontUrl: "/yilore-cards/yao/64-6a.webp",
        backUrl: "/yilore-cards/yao/64-6b.webp",
      }},
    ],
  }},
  {{
    readingId: "b72d4ac3-30ce-4125-b707-d9140c2b0722",
    question: "當下行動是否正確",
    createdAt: "2026-10-20 02:27",
    summaryHighlight: "行動方向已偏，短期退守可避禍，重整指揮權是轉機關鍵",
    summaryBrief:
      "**行動已偏離正軌，但你已察覺危機**——這就是為什麼卦象同時出現『輿尸之凶』與『左次無咎』。你不是錯在行動本身，而是錯在『誰在指揮』與『為誰而戰』這兩個根本問題上。現在的挫敗感，其實是系統在警告你：有人在消耗你的戰力，而你還在試圖用更多努力去填補裂縫。\\n\\n**真正的轉機不在前進，而在重定指揮鏈**。你必須暫停推進，釐清誰才是真正能凝聚團隊的『丈人』角色——是你自己？還是該讓位給更有威望者？若不解決這個權力結構問題，任何行動都只是重複失敗。\\n\\n**心智層：放下『必須成功』的執念**。你被賦予的使命不是打勝仗，而是守住原則與隊伍不散。退一步不是失敗，而是把資源從無謂消耗中拉回來。當你不再試圖控制所有聲音，反而能聽見真正該聽的聲音。\\n\\n**行動層：啟動『營壘重建』程序**。像畫面中那支有序撤退的軍隊一樣，制定明確的防禦節奏：暫停非核心項目、重新確認團隊成員的職責邊界、召開一次只談『我們為何而戰』的對話。不要急著解決問題，先解決『誰來解決問題』。",
    baziAnalysis:
      "當前大運癸丑與日柱乙丑伏吟，主內在壓力與重複性困局，行動易受舊有模式牽制。需特別留意決策是否陷入慣性思維，尤其在團隊協作中易因隱性權力拉扯而耗損資源。",
    suggestedFollowups: [
      "我該如何識別團隊中真正阻礙決策的人或機制？",
      "這次退守的底線與時間極限在哪裡？",
      "當前行動是否仍符合我最初的正當性目標？",
    ],
    benGua: {{
      position: 7,
      name: "地水師",
      nameVi: "Địa Thủy Sư",
      title: "現狀 · 指令分裂",
      guaCi: "貞，丈人吉，無咎",
      brief:
        "你正處於一場需要統籌與指揮的關鍵時刻，但局面已出現失控徵兆。這不是單靠意志或努力就能突破的關卡，而是結構性問題——指揮系統混亂、方向不一，導致集體行動陷入泥沼。\\n\\n卦象中的老將軍代表真正的領導力：沉穩、有威望、以大局為重。而你目前的行動模式，卻更接近那面即將斷裂的戰旗——有人在背後動搖根基，或你自己正承受著不該由你獨自承擔的指揮責任。",
      detailExplain:
        "地水師卦強調『貞，丈人吉』，意指唯有德高望重者領導，方能無咎。此卦不適合個人英雄主義，必須依賴制度與集體意志。當前局勢已非單純進退問題，而是『師』的本質是否正當、指揮權是否統一。\\n\\n易羅畫面中『將軍領萬士』背後的整齊隊伍，對比『將令不一』的撕裂戰旗，正暗示：你擁有凝聚團隊的潛能，但現實中已有權力分散或意見分歧的危機。若不正視此結構矛盾，再強的士氣也終將潰散。",
      frontUrl: "/yilore-cards/hant/7a.webp",
      backUrl: "/yilore-cards/hant/7b.webp",
      lines: [8, 7, 6, 6, 8, 8],
    }},
    zhiGua: {{
      position: 32,
      name: "雷風恆",
      nameVi: "Lôi Phong Hằng",
      title: "終局 · 恆久之道",
      guaCi: "恆，亨，無咎，利貞，利有攸往",
      brief:
        "之卦雷風恆，揭示你最終要走向的不是一場勝利，而是一種『恆久狀態』——穩定、持續、經得起時間考驗的結構。\\n\\n這不是靠一次衝鋒就能達成的，而是需要長期耕耘。恆卦提醒你：當前的混亂與退守，都是為了未來能建立真正穩固的關係或事業基礎。你正在經歷的考驗，正是通往『百年偕老』式成果的必經之路。",
      detailExplain:
        "雷風恆卦，上震下巽，雷動風行，二者同向而行，故能恆久。此卦強調『利有攸往』，但前提是『利貞』——必須堅守正道。\\n\\n易羅畫面中白髮夫妻靜坐古樹下，象徵時間沉澱出的默契與信任。對比本卦的戰場喧囂，形成強烈對照：你終將從『師』的衝突狀態，過渡到『恆』的和諧狀態。但前提是，你必須先經歷『輿尸之凶』的教訓，並執行『左次無咎』的調整。",
      frontUrl: "/yilore-cards/hant/32a.webp",
      backUrl: "/yilore-cards/hant/32b.webp",
    }},
    yaoList: [
      {{
        position: 3,
        lineName: "六三，師或輿尸，凶",
        yaoTitle: "危機 · 輿尸而行",
        yaoCi: "師或輿尸，凶",
        brief:
          "你正面對一次慘痛的挫敗，根源不在能力不足，而在『將令不一』——指揮系統出現分裂，導致行動像抬著屍體前進，徒耗資源。\\n\\n這可能是一場隱性的權力鬥爭，或是你被迫執行一個你並不認同的策略。無論是誰在發號施令，結果都是士氣崩解、方向混亂。你必須正視：這場失敗是結構性的，不是個人的。",
        detailExplain:
          "六三爻『師或輿尸，凶』，象曰『師或輿尸，大無功也』。『輿尸』意為抬著屍體行軍，象徵行動已失去意義，只是機械性延續。此爻居下卦之極，陰爻居陽位，位置不正，代表指揮者名不正言不順。\\n\\n結合易羅畫面中兩面相互抽打的戰旗，顯示內部已有明確的對立勢力。風雨欲來的天象，預示若不立即處理，將迎來更大風暴。此爻提醒：繼續前進只會加深傷亡，必須立刻停止消耗性行動。",
        frontUrl: "/yilore-cards/yao/7-3a.webp",
        backUrl: "/yilore-cards/yao/7-3b.webp",
      }},
      {{
        position: 4,
        lineName: "六四，師左次，無咎",
        yaoTitle: "轉機 · 以退為進",
        yaoCi: "師左次，無咎",
        brief:
          "你選擇了退守，這不是怯懦，而是極其清醒的戰略判斷。你明白當前形勢不利，主動撤回陣地，重整防線，為未來保留火種。\\n\\n這支軍隊的步伐整齊，顯示你仍有掌控力；他們正在挖壕溝、築工事，代表你正在建立新的防禦機制。這不是逃避，而是把資源從衝突前線轉向基礎建設。",
        detailExplain:
          "六四爻『師左次，無咎』，象曰『左次無咎，未失常也』。『左次』為古代軍事術語，指撤至側後方高地駐防，屬於標準戰術動作。此爻陰居陰位，得正，且處上卦之初，象徵雖退不亂，仍守節制。\\n\\n易羅畫面中軍隊有序撤回營寨，對比本卦的混亂戰場，形成強烈反差。這說明你已具備跳出情緒衝動的能力，能以理性規劃未來。此舉非但無咎，反而是扭轉局勢的起點。",
        frontUrl: "/yilore-cards/yao/7-4a.webp",
        backUrl: "/yilore-cards/yao/7-4b.webp",
      }},
    ],
  }},
];

export const YILORE_INITIAL_CONVERSATIONS: YiloreConversation[] = [
  {{
    id: "592076b9-e879-4835-8fa9-e74cd8a55ad7",
    title: "打招呼",
    updatedAt: "10/20 04:47",
    activePersonIds: [],
    activeReportIds: ["b72d4ac3-30ce-4125-b707-d9140c2b0722", "16813bd0-b255-48bb-82f4-bdb5967105ec"],
    messages: [
{msgs_ts_block}
    ],
  }},
  {{
    id: "604d031e-4153-4d7d-86a7-1f5e1b3b4808",
    title: "新对话",
    updatedAt: "10/20 02:17",
    activePersonIds: [],
    activeReportIds: [],
    messages: [],
  }},
  {{
    id: "bc953b1f-f17e-46e5-884d-7f8ade346eb6",
    title: "新对话",
    updatedAt: "10/19 15:36",
    activePersonIds: [],
    activeReportIds: [],
    messages: [],
  }},
];
'''
    with open("src/data/yiloreSeedData.ts", "w", encoding="utf-8") as f:
        f.write(ts_content)
    print(f"Wrote updated src/data/yiloreSeedData.ts ({len(ts_content)} chars)")

if __name__ == "__main__":
    main()
