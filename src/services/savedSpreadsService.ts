export interface SavedSpreadItem {
  id: string;
  timestamp: number;
  createdAt: string;
  mode: string;
  spreadTitle: string;
  cards: any[];
  isCard2Reversed?: boolean;
  question: string; // Câu hỏi gửi AI
  hexagramPrediction?: string; // Dự đoán của quẻ / Điềm báo ở giữa
  userAnswer?: string; // Đáp án tự điền / Chiêm nghiệm thực tế
  isRitualCompleted?: boolean;
}

const STORAGE_KEY = "iching_saved_user_spreads_v1";

export function getSavedSpreads(): SavedSpreadItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch (err) {
    console.error("Lỗi khi đọc danh sách quẻ đã lưu:", err);
    return [];
  }
}

export function saveSpreadItem(data: {
  mode: string;
  spreadTitle: string;
  cards: any[];
  isCard2Reversed?: boolean;
  question: string;
  hexagramPrediction?: string;
  userAnswer?: string;
  isRitualCompleted?: boolean;
}): SavedSpreadItem {
  const current = getSavedSpreads();
  const now = new Date();
  const createdAt = now.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const newItem: SavedSpreadItem = {
    id: `spread_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: Date.now(),
    createdAt,
    mode: data.mode,
    spreadTitle: data.spreadTitle,
    cards: data.cards,
    isCard2Reversed: data.isCard2Reversed,
    question: data.question || "",
    hexagramPrediction: data.hexagramPrediction || "",
    userAnswer: data.userAnswer || "",
    isRitualCompleted: data.isRitualCompleted,
  };

  const updated = [newItem, ...current];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Lỗi khi ghi quẻ đã lưu vào localStorage:", err);
  }

  return newItem;
}

export function updateSpreadItemAnswer(id: string, userAnswer: string): void {
  const current = getSavedSpreads();
  const updated = current.map((item) => {
    if (item.id === id) {
      return { ...item, userAnswer };
    }
    return item;
  });

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Lỗi khi cập nhật đáp án quẻ:", err);
  }
}

export function deleteSavedSpreadItem(id: string): void {
  const current = getSavedSpreads();
  const updated = current.filter((item) => item.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Lỗi khi xóa quẻ:", err);
  }
}

export function clearAllSavedSpreads(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {}
}

/* ══════════════════════════════════════════════════════════════════
   QUẢN LÝ QUẺ TẠM THỜI TRONG NGÀY (CHƯA NHẤN LƯU)
   ══════════════════════════════════════════════════════════════════ */

export interface TempSpreadItem {
  id: string;
  timestamp: number;
  dateKey: string; // Định dạng YYYY-MM-DD để lọc chính xác trong ngày
  createdAt: string;
  mode: string;
  spreadTitle: string;
  cards: any[];
  isCard2Reversed?: boolean;
  question: string;
  hexagramPrediction?: string;
  userAnswer?: string;
  isRitualCompleted?: boolean;
  isSaved?: boolean;
}

const TEMP_STORAGE_KEY = "iching_temp_daily_spreads_v1";

/** Lấy chuỗi ngày YYYY-MM-DD theo giờ địa phương */
export function getTodayDateKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Lấy danh sách quẻ tạm thời mới mở trong ngày hôm nay mà chưa nhấn lưu */
export function getTodayTempSpreads(): TempSpreadItem[] {
  try {
    const raw = localStorage.getItem(TEMP_STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];

    const todayKey = getTodayDateKey();
    // Chỉ giữ các quẻ được mở trong ngày hôm nay và chưa được lưu chính thức
    const todayUnsaved = list.filter(
      (item: TempSpreadItem) => item && item.dateKey === todayKey && !item.isSaved
    );

    // Tự động dọn dẹp các quẻ ngày cũ khỏi localStorage để tránh đầy bộ nhớ
    if (list.length !== todayUnsaved.length) {
      try {
        localStorage.setItem(TEMP_STORAGE_KEY, JSON.stringify(todayUnsaved));
      } catch {}
    }

    return todayUnsaved;
  } catch (err) {
    console.error("Lỗi khi đọc danh sách quẻ tạm thời:", err);
    return [];
  }
}

/** Thêm một quẻ vừa mở vào danh sách quẻ tạm thời trong ngày */
export function addTempSpreadItem(data: {
  mode: string;
  spreadTitle: string;
  cards: any[];
  isCard2Reversed?: boolean;
  question?: string;
  hexagramPrediction?: string;
  userAnswer?: string;
  isRitualCompleted?: boolean;
}): TempSpreadItem | null {
  if (!Array.isArray(data.cards) || data.cards.length === 0) return null;

  const current = getTodayTempSpreads();
  const now = new Date();
  const todayKey = getTodayDateKey();
  const createdAt = now.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // Kiểm tra trùng lặp với quẻ ngay trước đó để tránh ghi đè liên tục khi re-render
  const isDuplicateOfLatest =
    current.length > 0 &&
    current[0].mode === data.mode &&
    current[0].cards.length === data.cards.length &&
    current[0].cards.every(
      (c: any, i: number) =>
        (c?.id && c.id === data.cards[i]?.id) || (c?.name && c.name === data.cards[i]?.name)
    );

  if (isDuplicateOfLatest) {
    return current[0];
  }

  const newItem: TempSpreadItem = {
    id: `temp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: Date.now(),
    dateKey: todayKey,
    createdAt,
    mode: data.mode,
    spreadTitle: data.spreadTitle,
    cards: data.cards,
    isCard2Reversed: data.isCard2Reversed,
    question: data.question || "",
    hexagramPrediction: data.hexagramPrediction || "",
    userAnswer: data.userAnswer || "",
    isRitualCompleted: data.isRitualCompleted,
    isSaved: false,
  };

  const updated = [newItem, ...current];
  try {
    localStorage.setItem(TEMP_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Lỗi khi lưu quẻ tạm vào localStorage:", err);
  }

  return newItem;
}

/** Cập nhật câu hỏi, dự đoán hoặc đáp án cho một quẻ tạm */
export function updateTempSpreadItem(
  id: string,
  patch: Partial<Pick<TempSpreadItem, "question" | "hexagramPrediction" | "userAnswer">>
): void {
  const current = getTodayTempSpreads();
  const updated = current.map((item) => {
    if (item.id === id) {
      return { ...item, ...patch };
    }
    return item;
  });

  try {
    localStorage.setItem(TEMP_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Lỗi khi cập nhật quẻ tạm:", err);
  }
}

/** Đánh dấu quẻ tạm đã được lưu chính thức (hoặc xóa khỏi danh sách tạm) */
export function markTempSpreadAsSaved(idOrCards: string | any[]): void {
  const current = getTodayTempSpreads();
  let updated: TempSpreadItem[];

  if (typeof idOrCards === "string") {
    updated = current.filter((item) => item.id !== idOrCards);
  } else if (Array.isArray(idOrCards)) {
    updated = current.filter((item) => {
      if (item.cards.length !== idOrCards.length) return true;
      const isMatch = item.cards.every(
        (c: any, idx: number) =>
          (c?.id && c.id === idOrCards[idx]?.id) || (c?.name && c.name === idOrCards[idx]?.name)
      );
      return !isMatch;
    });
  } else {
    return;
  }

  try {
    localStorage.setItem(TEMP_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Lỗi khi cập nhật trạng thái đã lưu cho quẻ tạm:", err);
  }
}

/** Xóa một quẻ tạm cụ thể */
export function deleteTempSpreadItem(id: string): void {
  const current = getTodayTempSpreads();
  const updated = current.filter((item) => item.id !== id);
  try {
    localStorage.setItem(TEMP_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Lỗi khi xóa quẻ tạm:", err);
  }
}

/** Xóa tất cả quẻ tạm thời trong ngày */
export function clearTodayTempSpreads(): void {
  try {
    localStorage.removeItem(TEMP_STORAGE_KEY);
  } catch (err) {}
}
