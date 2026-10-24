/**
 * Service to store and retrieve card images for all 64 hexagrams and custom card back
 * Supports Multiple Decks (Bộ hình) with preset themes and custom user-created decks.
 * Uses IndexedDB for reliable, high-capacity image storage (bypassing localStorage 5MB limit)
 */

export interface DeckInfo {
  id: string;
  name: string;
  description: string;
  cardBackImage: string | null;
  cardCount: number; // number of cards with custom uploaded images (0..64)
  isPreset?: boolean;
  themeStyle?: "golden" | "ink" | "woodblock" | "mystic" | "custom";
  createdAt: number;
}

const DB_NAME = "IChingCardDeckDB";
const DB_VERSION = 1;
const STORE_NAME = "card_images";
const ACTIVE_DECK_STORAGE_KEY = "iching_active_deck_id";

type ChangeListener = (cardNumber?: number, deckId?: string) => void;
const listeners: Set<ChangeListener> = new Set();

export function subscribeCardImageChanges(listener: ChangeListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners(cardNumber?: number, deckId?: string) {
  listeners.forEach((fn) => {
    try {
      fn(cardNumber, deckId);
    } catch (e) {
      console.error("Error in card image listener", e);
    }
  });
}

// Preset Default Card Backs as SVG Data URLs
export const PRESET_CARD_BACKS: Record<string, string> = {
  golden: `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450" width="100%" height="100%">
  <defs>
    <radialGradient id="bgG" cx="50%" cy="50%" r="75%">
      <stop offset="0%" stop-color="#261E14"/>
      <stop offset="60%" stop-color="#18130C"/>
      <stop offset="100%" stop-color="#0E0B07"/>
    </radialGradient>
    <linearGradient id="goldG" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FCE8A6"/>
      <stop offset="50%" stop-color="#C9A55A"/>
      <stop offset="100%" stop-color="#8C6E23"/>
    </linearGradient>
  </defs>
  <rect width="300" height="450" rx="16" fill="url(#bgG)"/>
  <rect x="10" y="10" width="280" height="430" rx="12" fill="none" stroke="url(#goldG)" stroke-width="2" stroke-opacity="0.8"/>
  <rect x="16" y="16" width="268" height="418" rx="8" fill="none" stroke="url(#goldG)" stroke-width="1" stroke-dasharray="4,4" stroke-opacity="0.4"/>
  <!-- Corner Ornaments -->
  <path d="M 24 36 C 24 24 36 24 36 24" fill="none" stroke="url(#goldG)" stroke-width="2"/>
  <path d="M 276 36 C 276 24 264 24 264 24" fill="none" stroke="url(#goldG)" stroke-width="2"/>
  <path d="M 24 414 C 24 426 36 426 36 426" fill="none" stroke="url(#goldG)" stroke-width="2"/>
  <path d="M 276 414 C 276 426 264 426 264 426" fill="none" stroke="url(#goldG)" stroke-width="2"/>
  <!-- Center Bagua Circle -->
  <circle cx="150" cy="225" r="76" fill="none" stroke="url(#goldG)" stroke-width="1.5" stroke-opacity="0.6"/>
  <circle cx="150" cy="225" r="70" fill="none" stroke="url(#goldG)" stroke-width="2" stroke-opacity="0.9"/>
  <circle cx="150" cy="225" r="50" fill="none" stroke="url(#goldG)" stroke-width="1" stroke-dasharray="2,3" stroke-opacity="0.5"/>
  <!-- Center Taiji -->
  <g transform="translate(150, 225) scale(0.65)">
    <circle cx="0" cy="0" r="50" fill="#FCE8A6" stroke="url(#goldG)" stroke-width="2"/>
    <path d="M 0 -50 A 50 50 0 0 1 0 50 A 25 25 0 0 1 0 0 A 25 25 0 0 0 0 -50 Z" fill="#18130C"/>
    <circle cx="0" cy="-25" r="7" fill="#18130C"/>
    <circle cx="0" cy="25" r="7" fill="#FCE8A6"/>
  </g>
  <!-- Trigram Symbols around Bagua -->
  <g fill="url(#goldG)" font-family="serif" font-size="16" text-anchor="middle">
    <text x="150" y="145">☰</text>
    <text x="210" y="165">☱</text>
    <text x="235" y="230">☲</text>
    <text x="210" y="295">☳</text>
    <text x="150" y="320">☷</text>
    <text x="90" y="295">☶</text>
    <text x="65" y="230">☵</text>
    <text x="90" y="165">☴</text>
  </g>
  <!-- Top & Bottom Text -->
  <text x="150" y="75" fill="url(#goldG)" font-family="serif" font-weight="bold" font-size="13" letter-spacing="4" text-anchor="middle">KINH DỊCH</text>
  <text x="150" y="93" fill="#A68D5B" font-family="serif" font-size="9" letter-spacing="3" text-anchor="middle">THẦN BÁCH DỊCH HỌA</text>
  <text x="150" y="375" fill="#A68D5B" font-family="serif" font-size="9" letter-spacing="3" text-anchor="middle">ÂM DƯƠNG BIẾN HÓA</text>
  <text x="150" y="393" fill="url(#goldG)" font-family="serif" font-weight="bold" font-size="13" letter-spacing="4" text-anchor="middle">THÁI CỰC BÁT QUÁI</text>
</svg>
`)}`,
  ink: `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450" width="100%" height="100%">
  <defs>
    <radialGradient id="inkBg" cx="50%" cy="50%" r="75%">
      <stop offset="0%" stop-color="#1D2228"/>
      <stop offset="60%" stop-color="#14181E"/>
      <stop offset="100%" stop-color="#0D1014"/>
    </radialGradient>
    <linearGradient id="silverInk" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E2E8F0"/>
      <stop offset="50%" stop-color="#94A3B8"/>
      <stop offset="100%" stop-color="#475569"/>
    </linearGradient>
  </defs>
  <rect width="300" height="450" rx="16" fill="url(#inkBg)"/>
  <rect x="12" y="12" width="276" height="426" rx="10" fill="none" stroke="url(#silverInk)" stroke-width="1.5" stroke-opacity="0.7"/>
  <!-- Mountain Silhouette / Ink Wash -->
  <path d="M 20 360 Q 90 280 150 320 T 280 340 L 280 430 L 20 430 Z" fill="#182026" opacity="0.6"/>
  <path d="M 20 380 Q 80 310 140 350 T 280 370 L 280 430 L 20 430 Z" fill="#202A33" opacity="0.8"/>
  <!-- Center Calligraphic Ring -->
  <circle cx="150" cy="210" r="64" fill="none" stroke="url(#silverInk)" stroke-width="2.5" stroke-opacity="0.8" stroke-dasharray="160 15"/>
  <!-- Center Taiji -->
  <g transform="translate(150, 210) scale(0.6)">
    <circle cx="0" cy="0" r="50" fill="#E2E8F0"/>
    <path d="M 0 -50 A 50 50 0 0 1 0 50 A 25 25 0 0 1 0 0 A 25 25 0 0 0 0 -50 Z" fill="#0D1014"/>
    <circle cx="0" cy="-25" r="7" fill="#0D1014"/>
    <circle cx="0" cy="25" r="7" fill="#E2E8F0"/>
  </g>
  <text x="150" y="75" fill="#E2E8F0" font-family="serif" font-weight="bold" font-size="14" letter-spacing="6" text-anchor="middle">THỦY MẶC</text>
  <text x="150" y="94" fill="#94A3B8" font-family="serif" font-size="10" letter-spacing="3" text-anchor="middle">ĐẠO PHÁP TỰ NHIÊN</text>
  <text x="150" y="380" fill="#CBD5E1" font-family="serif" font-size="11" letter-spacing="4" text-anchor="middle">SƠN THỦY HỮU TÌNH</text>
</svg>
`)}`,
  woodblock: `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450" width="100%" height="100%">
  <defs>
    <radialGradient id="woodBg" cx="50%" cy="50%" r="75%">
      <stop offset="0%" stop-color="#241710"/>
      <stop offset="70%" stop-color="#180E09"/>
      <stop offset="100%" stop-color="#0E0704"/>
    </radialGradient>
  </defs>
  <rect width="300" height="450" rx="16" fill="url(#woodBg)"/>
  <rect x="12" y="12" width="276" height="426" rx="10" fill="none" stroke="#A86E45" stroke-width="2" stroke-opacity="0.8"/>
  <rect x="18" y="18" width="264" height="414" rx="6" fill="none" stroke="#D99B6A" stroke-width="1" stroke-opacity="0.4"/>
  <!-- Red Seal / Cinnabar stamp in center -->
  <rect x="110" y="175" width="80" height="80" rx="10" fill="#992218" stroke="#D14334" stroke-width="2"/>
  <text x="150" y="215" fill="#FEE2E2" font-family="serif" font-weight="bold" font-size="28" text-anchor="middle">易</text>
  <text x="150" y="242" fill="#FECACA" font-family="serif" font-size="11" letter-spacing="2" text-anchor="middle">CHÍ BẢO</text>
  <!-- Ornate Wood Borders -->
  <text x="150" y="80" fill="#E0A97E" font-family="serif" font-weight="bold" font-size="14" letter-spacing="5" text-anchor="middle">MỘC BẢN CỔ THƯ</text>
  <text x="150" y="100" fill="#A87550" font-family="serif" font-size="10" letter-spacing="2" text-anchor="middle">CHU SA ẤN TÍCH</text>
  <text x="150" y="360" fill="#E0A97E" font-family="serif" font-size="12" letter-spacing="3" text-anchor="middle">CHU DỊCH CHÍNH NGHĨA</text>
</svg>
`)}`,
  mystic: `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450" width="100%" height="100%">
  <defs>
    <radialGradient id="mysticBg" cx="50%" cy="50%" r="80%">
      <stop offset="0%" stop-color="#17122E"/>
      <stop offset="60%" stop-color="#0E0A1E"/>
      <stop offset="100%" stop-color="#06040D"/>
    </radialGradient>
    <linearGradient id="mysticGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E9D5FF"/>
      <stop offset="50%" stop-color="#C084FC"/>
      <stop offset="100%" stop-color="#7E22CE"/>
    </linearGradient>
  </defs>
  <rect width="300" height="450" rx="16" fill="url(#mysticBg)"/>
  <rect x="10" y="10" width="280" height="430" rx="12" fill="none" stroke="url(#mysticGold)" stroke-width="1.5" stroke-opacity="0.8"/>
  <rect x="16" y="16" width="268" height="418" rx="8" fill="none" stroke="#E9D5FF" stroke-width="0.8" stroke-dasharray="3,3" stroke-opacity="0.4"/>
  <!-- Constellation circles and lines -->
  <circle cx="150" cy="220" r="70" fill="none" stroke="#C084FC" stroke-width="1.5" stroke-dasharray="6,4" opacity="0.6"/>
  <circle cx="150" cy="220" r="45" fill="none" stroke="#E9D5FF" stroke-width="1" opacity="0.5"/>
  <!-- Crescent Moon & Star -->
  <path d="M 140 185 A 36 36 0 1 0 160 255 A 30 30 0 1 1 140 185 Z" fill="#F3E8FF" opacity="0.9"/>
  <polygon points="150,150 153,158 161,161 153,164 150,172 147,164 139,161 147,158" fill="#FDE047"/>
  <polygon points="190,200 191,204 195,205 191,206 190,210 189,206 185,205 189,204" fill="#FDE047"/>
  <polygon points="105,240 106,244 110,245 106,246 105,250 104,246 100,245 104,244" fill="#FDE047"/>
  <text x="150" y="75" fill="#E9D5FF" font-family="serif" font-weight="bold" font-size="13" letter-spacing="5" text-anchor="middle">HUYỀN BÍ TINH TÚ</text>
  <text x="150" y="94" fill="#A855F7" font-family="serif" font-size="9" letter-spacing="3" text-anchor="middle">CHIÊM TINH THẦN DỊCH</text>
  <text x="150" y="380" fill="#E9D5FF" font-family="serif" font-size="11" letter-spacing="4" text-anchor="middle">CÀN KHÔN BẤT TUYỆT</text>
</svg>
`)}`,
};

export const PRESET_DECK_VERSION = "20261019_11";

export const PRESET_DECK_CONFIG: Record<string, { ext: string; back: string; version?: string }> = {
  deck_bo_1: { ext: "png", back: "/decks/deck_bo_1/back.jpg" },
  deck_bo_2: { ext: "png", back: "/decks/deck_bo_2/back.svg" },
  deck_bo_khong_chu: { ext: "png", back: "/decks/deck_bo_khong_chu/back.jpg" },
  deck_quan_tu: { ext: "jpg", back: "/decks/deck_quan_tu/back.svg" },
  deck_ngu_che: { ext: "png", back: `/decks/deck_ngu_che/back.jpg?v=${PRESET_DECK_VERSION}`, version: PRESET_DECK_VERSION },
};

export const DEFAULT_DECK_ID = "deck_quan_tu";
export const DEFAULT_VIP_DECK_ID = "deck_bo_khong_chu";

export const PRESET_DECK_NAMES: Record<string, string> = {
  deck_bo_khong_chu: "Bộ Không Chữ (Nguyên Bản)",
  deck_quan_tu: "Bộ Quân Tử (64 Quẻ)",
  deck_bo_1: "Bộ 1 (Nguyên Bản Có Chữ)",
  deck_bo_2: "Bộ 2 (Có Chữ)",
  deck_ngu_che: "Bộ Ngự Chế Tinh Túy (Có Chữ)",
};

export const INITIAL_PRESET_DECKS: DeckInfo[] = [
  {
    id: "deck_bo_khong_chu",
    name: "Bộ Không Chữ (Nguyên Bản)",
    description: "Bộ bài Kinh Dịch 64 quẻ không in chữ, tranh thủy mặc và biểu tượng quẻ nguyên sơ thuần khiết.",
    isPreset: true,
    themeStyle: "golden",
    cardBackImage: "/decks/deck_bo_khong_chu/back.jpg",
    cardCount: 64,
    createdAt: 1700000000000,
  },
  {
    id: "deck_quan_tu",
    name: "Bộ Quân Tử (64 Quẻ)",
    description: "Bộ bài Quân Tử 64 quẻ phong cách chiêm tinh huyền bí, hàm súc đạo lý người quân tử.",
    isPreset: true,
    themeStyle: "mystic",
    cardBackImage: "/decks/deck_quan_tu/back.svg",
    cardCount: 64,
    createdAt: 1700000001000,
  },
  {
    id: "deck_bo_1",
    name: "Bộ 1 (Nguyên Bản Có Chữ)",
    description: "Bộ bài Kinh Dịch 64 quẻ nguyên bản có chữ giải nghĩa và quẻ hào chi tiết.",
    isPreset: true,
    themeStyle: "golden",
    cardBackImage: "/decks/deck_bo_1/back.jpg",
    cardCount: 64,
    createdAt: 1700000002000,
  },
  {
    id: "deck_bo_2",
    name: "Bộ 2 (Có Chữ)",
    description: "Bộ bài Kinh Dịch 64 quẻ hoa văn cổ thư đồ họa có chữ sắc nét.",
    isPreset: true,
    themeStyle: "golden",
    cardBackImage: "/decks/deck_bo_2/back.svg",
    cardCount: 64,
    createdAt: 1700000003000,
  },
  {
    id: "deck_ngu_che",
    name: "Bộ Ngự Chế Tinh Túy (Có Chữ)",
    description: "Bộ bài Kinh Dịch 64 quẻ vẽ theo phong cách cung đình Ngự Chế Tân Tập Đoán Dịch Tinh Túy dựa trên Bộ 1 (Nguyên Bản Có Chữ).",
    isPreset: true,
    themeStyle: "golden",
    cardBackImage: "/decks/deck_ngu_che/back.jpg",
    cardCount: 64,
    createdAt: 1700000004000,
  },
];

/**
 * Lấy ID bộ bài mà người dùng VIP đã tự tay tùy chỉnh chọn dùng (nếu có)
 */
export function getUserCustomDeckId(userId?: string, userPreferredDeckId?: string): string | null {
  if (userPreferredDeckId && !LEGACY_OLD_PRESET_IDS.has(userPreferredDeckId)) return userPreferredDeckId;
  if (typeof window === "undefined") return null;
  if (userId) {
    const custom = localStorage.getItem(`iching_user_deck_${userId}`);
    if (custom && !LEGACY_OLD_PRESET_IDS.has(custom)) return custom;
  }
  const globalVipCustom = localStorage.getItem("iching_vip_custom_deck");
  if (globalVipCustom && !LEGACY_OLD_PRESET_IDS.has(globalVipCustom)) return globalVipCustom;
  return null;
}

/**
 * Lưu ID bộ bài mà người dùng VIP tùy chỉnh chọn dùng
 */
export function setUserCustomDeckId(deckId: string, userId?: string): void {
  if (typeof window === "undefined") return;
  if (userId) {
    localStorage.setItem(`iching_user_deck_${userId}`, deckId);
  }
  localStorage.setItem("iching_vip_custom_deck", deckId);
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not supported"));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

const LEGACY_OLD_PRESET_IDS = new Set(["deck_golden", "deck_ink", "deck_woodblock", "deck_mystic", "deck_ngu_che_khong_chu"]);

/**
 * Get active deck ID (sync with localStorage)
 */
export async function getActiveDeckId(isVip?: boolean): Promise<string> {
  const defaultFallback = isVip ? DEFAULT_VIP_DECK_ID : DEFAULT_DECK_ID;
  const local = typeof window !== "undefined" ? localStorage.getItem(ACTIVE_DECK_STORAGE_KEY) : null;
  if (local && !LEGACY_OLD_PRESET_IDS.has(local)) return local;

  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction([STORE_NAME], "readonly");
      const req = tx.objectStore(STORE_NAME).get("_system_active_deck_id");
      req.onsuccess = () => {
        let id = (req.result as string) || defaultFallback;
        if (LEGACY_OLD_PRESET_IDS.has(id)) {
          id = defaultFallback;
        }
        if (typeof window !== "undefined") {
          localStorage.setItem(ACTIVE_DECK_STORAGE_KEY, id);
        }
        resolve(id);
      };
      req.onerror = () => resolve(defaultFallback);
    });
  } catch {
    return defaultFallback;
  }
}

/**
 * Set active deck ID
 */
export async function setActiveDeckId(deckId: string): Promise<void> {
  if (typeof window !== "undefined") {
    localStorage.setItem(ACTIVE_DECK_STORAGE_KEY, deckId);
  }
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], "readwrite");
      const req = tx.objectStore(STORE_NAME).put(deckId, "_system_active_deck_id");
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error("Failed to store active deck id", err);
  }
  notifyListeners(undefined, deckId);
}

/**
 * Load list of all decks
 */
export async function getDeckList(): Promise<DeckInfo[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction([STORE_NAME], "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get("_system_decks_meta");

      req.onsuccess = async () => {
        let storedList: DeckInfo[] = req.result as DeckInfo[];

        // Retain any custom user-created decks
        const customDecks = Array.isArray(storedList)
          ? storedList.filter((d) => !d.isPreset && !LEGACY_OLD_PRESET_IDS.has(d.id))
          : [];

        // Build current preset decks with exact 64 card count
        const presets = INITIAL_PRESET_DECKS.map((preset) => ({ ...preset }));

        // Combined list
        const mergedList = [...presets, ...customDecks];

        // If stored list was empty or still had old presets or missing any current preset, update database
        const needsUpdate =
          !storedList ||
          !Array.isArray(storedList) ||
          storedList.some((d) => LEGACY_OLD_PRESET_IDS.has(d.id)) ||
          INITIAL_PRESET_DECKS.some((p) => !storedList.some((d) => d.id === p.id));

        if (needsUpdate) {
          store.put(mergedList, "_system_decks_meta");
        }

        resolve(mergedList);
      };

      req.onerror = () => {
        resolve(INITIAL_PRESET_DECKS);
      };
    });
  } catch (err) {
    console.error("Failed to get deck list", err);
    return INITIAL_PRESET_DECKS;
  }
}

/**
 * Save updated deck metadata
 */
export async function saveDeckList(decks: DeckInfo[]): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], "readwrite");
    const req = tx.objectStore(STORE_NAME).put(decks, "_system_decks_meta");
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Create a new custom deck
 */
export async function createNewDeck(
  name: string,
  description = "",
  themeStyle: DeckInfo["themeStyle"] = "custom"
): Promise<DeckInfo> {
  const decks = await getDeckList();
  const id = `deck_custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newDeck: DeckInfo = {
    id,
    name: name.trim() || `Bộ Bài Mới #${decks.length + 1}`,
    description: description.trim(),
    cardBackImage: null,
    cardCount: 0,
    isPreset: false,
    themeStyle,
    createdAt: Date.now(),
  };

  const updated = [...decks, newDeck];
  await saveDeckList(updated);
  await setActiveDeckId(id);
  return newDeck;
}

/**
 * Update deck metadata
 */
export async function updateDeck(deckId: string, updates: Partial<DeckInfo>): Promise<void> {
  const decks = await getDeckList();
  const index = decks.findIndex((d) => d.id === deckId);
  if (index >= 0) {
    decks[index] = { ...decks[index], ...updates };
    await saveDeckList(decks);
    notifyListeners(undefined, deckId);
  }
}

/**
 * Delete a custom deck
 */
export async function deleteDeck(deckId: string): Promise<void> {
  const decks = await getDeckList();
  const target = decks.find((d) => d.id === deckId);
  if (target?.isPreset) {
    throw new Error("Không thể xóa bộ bài mặc định của hệ thống.");
  }

  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], "readwrite");
    const store = tx.objectStore(STORE_NAME);

    // Delete all cards for this deck
    for (let i = 1; i <= 64; i++) {
      store.delete(`${deckId}_card_${i}`);
    }
    store.delete(`${deckId}_back`);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  const remaining = decks.filter((d) => d.id !== deckId);
  await saveDeckList(remaining);

  const currentActive = await getActiveDeckId();
  if (currentActive === deckId) {
    await setActiveDeckId(DEFAULT_DECK_ID);
  } else {
    notifyListeners(undefined, deckId);
  }
}

/**
 * Duplicate a deck
 */
export async function duplicateDeck(deckId: string, newName?: string): Promise<DeckInfo> {
  const decks = await getDeckList();
  const original = decks.find((d) => d.id === deckId);
  if (!original) throw new Error("Không tìm thấy bộ bài nguồn.");

  const newId = `deck_custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const sourceImages = await getDeckImages(deckId);
  const sourceBack = await getDeckCardBack(deckId);

  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], "readwrite");
    const store = tx.objectStore(STORE_NAME);

    for (const [numStr, dataUrl] of Object.entries(sourceImages)) {
      store.put(dataUrl, `${newId}_card_${numStr}`);
    }
    if (sourceBack) {
      store.put(sourceBack, `${newId}_back`);
    }

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  const copyDeck: DeckInfo = {
    id: newId,
    name: newName || `${original.name} (Bản Sao)`,
    description: original.description,
    cardBackImage: sourceBack,
    cardCount: Object.keys(sourceImages).length,
    isPreset: false,
    themeStyle: original.themeStyle,
    createdAt: Date.now(),
  };

  await saveDeckList([...decks, copyDeck]);
  await setActiveDeckId(newId);
  return copyDeck;
}

/**
 * Get card images for a specific deck
 */
export async function getDeckImages(deckId: string): Promise<Record<number, string>> {
  const presetConfig = PRESET_DECK_CONFIG[deckId];
  const results: Record<number, string> = {};

  // If this is a preset deck, populate default static paths for all 64 cards
  if (presetConfig) {
    const vQuery = presetConfig.version ? `?v=${presetConfig.version}` : "";
    for (let i = 1; i <= 64; i++) {
      results[i] = `/decks/${deckId}/${i}.${presetConfig.ext}${vQuery}`;
    }
  }

  if (deckId === "deck_ngu_che") {
    return results;
  }

  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction([STORE_NAME], "readonly");
      const store = tx.objectStore(STORE_NAME);

      const req = store.openCursor();
      req.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          const key = cursor.key.toString();
          const prefix = `${deckId}_card_`;
          if (key.startsWith(prefix)) {
            const num = parseInt(key.replace(prefix, ""), 10);
            if (!isNaN(num) && num >= 1 && num <= 64 && cursor.value) {
              results[num] = cursor.value;
            }
          }
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      req.onerror = () => resolve(results);
    });
  } catch (err) {
    console.error("Failed to load deck images", err);
    return results;
  }
}

/**
 * Save image for a card in a specific deck
 */
export async function saveDeckCardImage(
  deckId: string,
  cardNumber: number,
  dataUrl: string
): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], "readwrite");
    const req = tx.objectStore(STORE_NAME).put(dataUrl, `${deckId}_card_${cardNumber}`);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });

  // Update cardCount in deck meta
  const images = await getDeckImages(deckId);
  await updateDeck(deckId, { cardCount: Object.keys(images).length });
  notifyListeners(cardNumber, deckId);
}

/**
 * Remove image for a card in a specific deck
 */
export async function removeDeckCardImage(deckId: string, cardNumber: number): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], "readwrite");
    const req = tx.objectStore(STORE_NAME).delete(`${deckId}_card_${cardNumber}`);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });

  const images = await getDeckImages(deckId);
  await updateDeck(deckId, { cardCount: Object.keys(images).length });
  notifyListeners(cardNumber, deckId);
}

/**
 * Get card back for a specific deck
 */
export async function getDeckCardBack(deckId: string): Promise<string | null> {
  try {
    const db = await openDB();
    const customBack = await new Promise<string | null>((resolve) => {
      const tx = db.transaction([STORE_NAME], "readonly");
      const req = tx.objectStore(STORE_NAME).get(`${deckId}_back`);
      req.onsuccess = () => resolve((req.result as string) || null);
      req.onerror = () => resolve(null);
    });
    if (customBack) return customBack;
  } catch {
    // Ignore error
  }

  // Preset deck configured back
  if (PRESET_DECK_CONFIG[deckId]) {
    return PRESET_DECK_CONFIG[deckId].back;
  }

  // Fallback to preset style SVG if available
  const decks = await getDeckList();
  const deck = decks.find((d) => d.id === deckId);
  const style = deck?.themeStyle || "golden";
  return PRESET_CARD_BACKS[style] || PRESET_CARD_BACKS.golden;
}

/**
 * Save card back for a specific deck
 */
export async function saveDeckCardBack(deckId: string, dataUrl: string): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], "readwrite");
    const req = tx.objectStore(STORE_NAME).put(dataUrl, `${deckId}_back`);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });

  await updateDeck(deckId, { cardBackImage: dataUrl });
  notifyListeners(0, deckId);
}

/**
 * Remove custom card back for a specific deck (reverts to preset SVG)
 */
export async function removeDeckCardBack(deckId: string): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], "readwrite");
    const req = tx.objectStore(STORE_NAME).delete(`${deckId}_back`);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });

  await updateDeck(deckId, { cardBackImage: null });
  notifyListeners(0, deckId);
}

/**
 * Clear all cards in a deck
 */
export async function clearDeckImages(deckId: string): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], "readwrite");
    const store = tx.objectStore(STORE_NAME);

    for (let i = 1; i <= 64; i++) {
      store.delete(`${deckId}_card_${i}`);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  await updateDeck(deckId, { cardCount: 0 });
  notifyListeners(undefined, deckId);
}

/**
 * Export deck as a JSON bundle
 */
export async function exportDeckBundle(deckId?: string): Promise<{
  deck: DeckInfo | null;
  cards: Record<number, string>;
  cardBack: string | null;
  version: number;
  exportedAt: string;
}> {
  const targetId = deckId || (await getActiveDeckId());
  const decks = await getDeckList();
  const deck = decks.find((d) => d.id === targetId) || null;
  const cards = await getDeckImages(targetId);
  const cardBack = await getDeckCardBack(targetId);

  return {
    deck,
    cards,
    cardBack,
    version: 2,
    exportedAt: new Date().toISOString(),
  };
}

/**
 * Import a JSON deck bundle into the database
 */
export async function importDeckBundle(bundle: {
  deck?: Partial<DeckInfo>;
  cards?: Record<string | number, string>;
  cardBack?: string | null;
}): Promise<{ deck: DeckInfo; count: number }> {
  const newName = bundle.deck?.name
    ? `${bundle.deck.name} (Đã Nhập)`
    : `Bộ Bài Nhập #${Date.now().toString().slice(-4)}`;
  const newDeck = await createNewDeck(
    newName,
    bundle.deck?.description || "Bộ bài nhập từ tệp sao lưu",
    bundle.deck?.themeStyle || "custom"
  );

  let count = 0;
  if (bundle.cards) {
    for (const [key, dataUrl] of Object.entries(bundle.cards)) {
      const num = parseInt(key, 10);
      if (!isNaN(num) && num >= 1 && num <= 64 && typeof dataUrl === "string") {
        await saveDeckCardImage(newDeck.id, num, dataUrl);
        count++;
      }
    }
  }

  if (bundle.cardBack && typeof bundle.cardBack === "string") {
    await saveDeckCardBack(newDeck.id, bundle.cardBack);
  }

  await updateDeck(newDeck.id, { cardCount: count });
  await setActiveDeckId(newDeck.id);

  return { deck: newDeck, count };
}

// =========================================================================
// BACKWARDS-COMPATIBLE API (Maps directly to Active Deck)
// =========================================================================

export async function getCardImage(cardNumber: number): Promise<string | null> {
  const activeDeckId = await getActiveDeckId();
  if (activeDeckId !== "deck_ngu_che") {
    try {
      const db = await openDB();
      const custom = await new Promise<string | null>((resolve) => {
        const tx = db.transaction([STORE_NAME], "readonly");
        const req = tx.objectStore(STORE_NAME).get(`${activeDeckId}_card_${cardNumber}`);
        req.onsuccess = () => resolve((req.result as string) || null);
        req.onerror = () => resolve(null);
      });
      if (custom) return custom;
    } catch {
      // ignore
    }
  }

  if (PRESET_DECK_CONFIG[activeDeckId]) {
    const cfg = PRESET_DECK_CONFIG[activeDeckId];
    const vQuery = cfg.version ? `?v=${cfg.version}` : "";
    return `/decks/${activeDeckId}/${cardNumber}.${cfg.ext}${vQuery}`;
  }
  return null;
}

export async function getAllCardImages(): Promise<Record<number, string>> {
  const activeDeckId = await getActiveDeckId();
  return getDeckImages(activeDeckId);
}

export async function saveCardImage(cardNumber: number, dataUrl: string): Promise<void> {
  const activeDeckId = await getActiveDeckId();
  return saveDeckCardImage(activeDeckId, cardNumber, dataUrl);
}

export async function removeCardImage(cardNumber: number): Promise<void> {
  const activeDeckId = await getActiveDeckId();
  return removeDeckCardImage(activeDeckId, cardNumber);
}

export async function getCardBackImage(): Promise<string | null> {
  const activeDeckId = await getActiveDeckId();
  return getDeckCardBack(activeDeckId);
}

export async function saveCardBackImage(dataUrl: string): Promise<void> {
  const activeDeckId = await getActiveDeckId();
  return saveDeckCardBack(activeDeckId, dataUrl);
}

export async function removeCardBackImage(): Promise<void> {
  const activeDeckId = await getActiveDeckId();
  return removeDeckCardBack(activeDeckId);
}

export async function clearAllCardImages(): Promise<void> {
  const activeDeckId = await getActiveDeckId();
  return clearDeckImages(activeDeckId);
}

/**
 * Helper to convert a File to compressed image data URL for fast rendering
 */
export function fileToDataUrl(
  file: File,
  maxWidth = 1000,
  maxHeight = 1500,
  quality = 0.88
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const isPng = file.type === "image/png";
        const format = isPng ? "image/png" : "image/jpeg";
        const result = canvas.toDataURL(format, isPng ? undefined : quality);
        resolve(result);
      };
      img.onerror = () => {
        resolve(e.target?.result as string);
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Save video animation for a card in a specific deck
 */
export async function saveDeckCardVideo(
  deckId: string,
  cardNumber: number,
  videoData: string | Blob
): Promise<void> {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], "readwrite");
    const req = tx.objectStore(STORE_NAME).put(videoData, `${deckId}_video_${cardNumber}`);
    req.onsuccess = () => {
      notifyListeners(cardNumber, deckId);
      resolve();
    };
    req.onerror = () => reject(req.error);
  });
}

/**
 * Get card videos for a specific deck
 */
export async function getDeckVideos(deckId: string): Promise<Record<number, string>> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction([STORE_NAME], "readonly");
      const store = tx.objectStore(STORE_NAME);
      const results: Record<number, string> = {};

      const req = store.openCursor();
      req.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          const key = cursor.key.toString();
          const prefix = `${deckId}_video_`;
          if (key.startsWith(prefix)) {
            const num = parseInt(key.replace(prefix, ""), 10);
            if (!isNaN(num) && num >= 1 && num <= 64) {
              const val = cursor.value;
              if (val instanceof Blob) {
                results[num] = URL.createObjectURL(val);
              } else if (typeof val === "string") {
                results[num] = val;
              }
            }
          }
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      req.onerror = () => resolve({});
    });
  } catch (err) {
    console.error("Failed to load deck videos", err);
    return {};
  }
}

/**
 * Remove video animation for a card in a specific deck
 */
export async function removeDeckCardVideo(deckId: string, cardNumber: number): Promise<void> {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], "readwrite");
    const req = tx.objectStore(STORE_NAME).delete(`${deckId}_video_${cardNumber}`);
    req.onsuccess = () => {
      notifyListeners(cardNumber, deckId);
      resolve();
    };
    req.onerror = () => reject(req.error);
  });
}

/**
 * Active deck convenience methods for videos
 */
export async function getAllCardVideos(): Promise<Record<number, string>> {
  const activeDeckId = await getActiveDeckId();
  return getDeckVideos(activeDeckId);
}

export async function saveCardVideo(cardNumber: number, videoData: string | Blob): Promise<void> {
  const activeDeckId = await getActiveDeckId();
  return saveDeckCardVideo(activeDeckId, cardNumber, videoData);
}

export async function removeCardVideo(cardNumber: number): Promise<void> {
  const activeDeckId = await getActiveDeckId();
  return removeDeckCardVideo(activeDeckId, cardNumber);
}

export const cardImageStore = {
  // Multi-deck APIs
  getDeckList,
  getActiveDeckId,
  setActiveDeckId,
  createNewDeck,
  updateDeck,
  deleteDeck,
  duplicateDeck,
  getDeckImages,
  saveDeckCardImage,
  removeDeckCardImage,
  getDeckVideos,
  saveDeckCardVideo,
  removeDeckCardVideo,
  getDeckCardBack,
  saveDeckCardBack,
  removeDeckCardBack,
  clearDeckImages,
  exportDeckBundle,
  importDeckBundle,
  DEFAULT_DECK_ID,
  DEFAULT_VIP_DECK_ID,
  PRESET_DECK_NAMES,
  getUserCustomDeckId,
  setUserCustomDeckId,
  PRESET_CARD_BACKS,
  INITIAL_PRESET_DECKS,
  PRESET_DECK_CONFIG,

  // Active-deck APIs
  getImage: getCardImage,
  saveImage: saveCardImage,
  removeImage: removeCardImage,
  getAllImages: getAllCardImages,
  getVideo: async (num: number) => {
    const activeDeckId = await getActiveDeckId();
    const videos = await getDeckVideos(activeDeckId);
    return videos[num] || null;
  },
  getAllVideos: getAllCardVideos,
  saveVideo: saveCardVideo,
  removeVideo: removeCardVideo,
  getCardBack: getCardBackImage,
  saveCardBack: saveCardBackImage,
  removeCardBack: removeCardBackImage,
  clearAll: clearAllCardImages,
  exportBundle: exportDeckBundle,
  importBundle: importDeckBundle,
  fileToDataUrl,
  subscribe: subscribeCardImageChanges,
};
