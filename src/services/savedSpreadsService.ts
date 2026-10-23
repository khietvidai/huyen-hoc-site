export interface SavedSpreadItem {
  id: string;
  timestamp: number;
  createdAt: string;
  mode: string;
  spreadTitle: string;
  cards: any[];
  isCard2Reversed?: boolean;
  question: string; // Câu hỏi gửi AI
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
