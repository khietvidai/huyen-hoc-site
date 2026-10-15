/**
 * IndexedDB Service to store and retrieve images for all 60 Can Chi (Lục Thập Hoa Giáp).
 * Bypasses localStorage 5MB limit, provides durable client-side persistence,
 * and supports individual and batch image management.
 */

const DB_NAME = "IChingSixtyJiaziDB";
const DB_VERSION = 1;
const STORE_NAME = "jiazi_images";

type ChangeListener = (canChiId?: string) => void;
const listeners: Set<ChangeListener> = new Set();

export function subscribeJiaziImageChanges(listener: ChangeListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners(canChiId?: string) {
  listeners.forEach((fn) => {
    try {
      fn(canChiId);
    } catch (e) {
      console.error("Error in jiazi image listener", e);
    }
  });
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("IndexedDB is not supported in this browser"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
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

/**
 * Save an image (dataURL, base64 or URL) for a specific Can Chi (e.g. 'giap_ty')
 */
export async function saveJiaziImage(canChiId: string, dataUrl: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put({ id: canChiId, dataUrl, updatedAt: Date.now() });

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    notifyListeners(canChiId);
  } catch (error) {
    console.error(`Failed to save image for ${canChiId} to IndexedDB`, error);
    // Fallback to localStorage if possible
    try {
      localStorage.setItem(`jiazi_img_${canChiId}`, dataUrl);
      notifyListeners(canChiId);
    } catch (e) {
      console.warn("LocalStorage fallback also failed", e);
    }
  }
}

/**
 * Get image for a specific Can Chi
 */
export async function getJiaziImage(canChiId: string): Promise<string | null> {
  try {
    const db = await openDB();
    return await new Promise<string | null>((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(canChiId);

      req.onsuccess = () => {
        if (req.result && req.result.dataUrl) {
          resolve(req.result.dataUrl);
        } else {
          // Check localStorage fallback
          const local = localStorage.getItem(`jiazi_img_${canChiId}`);
          resolve(local);
        }
      };
      req.onerror = () => {
        const local = localStorage.getItem(`jiazi_img_${canChiId}`);
        resolve(local);
      };
    });
  } catch {
    return localStorage.getItem(`jiazi_img_${canChiId}`);
  }
}

/**
 * Get all stored images for 60 Can Chi as a Record<canChiId, dataUrl>
 */
export async function getAllJiaziImages(): Promise<Record<string, string>> {
  const result: Record<string, string> = {};

  try {
    const db = await openDB();
    const records = await new Promise<any[]>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });

    records.forEach((rec) => {
      if (rec && rec.id && rec.dataUrl) {
        result[rec.id] = rec.dataUrl;
      }
    });
  } catch (err) {
    console.warn("Could not read from IndexedDB, reading from localStorage fallback", err);
  }

  // Also merge any localStorage entries
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("jiazi_img_")) {
        const id = key.replace("jiazi_img_", "");
        if (!result[id]) {
          const val = localStorage.getItem(key);
          if (val) result[id] = val;
        }
      }
    }
  } catch (e) {
    console.warn("Error reading localStorage keys", e);
  }

  return result;
}

/**
 * Remove image for a specific Can Chi
 */
export async function removeJiaziImage(canChiId: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(canChiId);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("IndexedDB delete failed", err);
  }

  try {
    localStorage.removeItem(`jiazi_img_${canChiId}`);
  } catch (e) {
    console.warn("LocalStorage remove failed", e);
  }

  notifyListeners(canChiId);
}

/**
 * Clear all uploaded images for Lục Thập Hoa Giáp
 */
export async function clearAllJiaziImages(): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("IndexedDB clear failed", err);
  }

  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("jiazi_img_")) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch (e) {
    console.warn("LocalStorage clear failed", e);
  }

  notifyListeners();
}

import { SIXTY_JIAZI } from "../data/jiazi";

/**
 * Export all uploaded images as a JSON string backup
 */
export async function exportJiaziBackupJSON(): Promise<string> {
  const images = await getAllJiaziImages();
  const backup = {
    version: 1,
    type: "luc_thap_hoa_giap_images",
    exportedAt: new Date().toISOString(),
    count: Object.keys(images).length,
    images,
  };
  return JSON.stringify(backup, null, 2);
}

/**
 * Export a blank or populated template JSON for all 60 Hoa Giáp
 */
export async function exportJiaziTemplateJSON(): Promise<string> {
  const currentImages = await getAllJiaziImages();
  const template = {
    version: 1,
    type: "luc_thap_hoa_giap_template",
    description:
      "Tệp mẫu nạp hình ảnh Lục Thập Hoa Giáp. Điền đường dẫn ảnh (https://... hoặc data:image/...) vào thuộc tính imageUrl của từng Hoa Giáp.",
    generatedAt: new Date().toISOString(),
    totalItems: 60,
    items: SIXTY_JIAZI.map((item) => ({
      order: item.order,
      id: item.id,
      name: item.name,
      chinese: item.chinese,
      elementNapAm: item.elementNapAm,
      hexagramNumber: item.hexagramLink?.hexagramNumber,
      hexagramName: item.hexagramLink?.hexagramName,
      imageUrl: currentImages[item.id] || "",
    })),
  };
  return JSON.stringify(template, null, 2);
}

export interface ParsedJiaziItem {
  id: string;
  name: string;
  order: number;
  url: string;
}

export interface ParsedJiaziResult {
  matched: ParsedJiaziItem[];
  unmatchedKeys: string[];
  totalEntries: number;
}

function normalizeKey(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Parse any JSON format (backup, key-value, array of objects, by order, by name)
 */
export function parseJiaziJSON(jsonString: string): ParsedJiaziResult {
  const parsed = JSON.parse(jsonString);

  // Build lookup map for 60 Hoa Giap
  const lookup: Record<string, typeof SIXTY_JIAZI[0]> = {};
  SIXTY_JIAZI.forEach((item) => {
    lookup[item.id] = item;
    lookup[normalizeKey(item.id)] = item;
    lookup[normalizeKey(item.name)] = item;
    lookup[item.chinese] = item;
    lookup[item.order.toString()] = item;
    lookup[`#${item.order}`] = item;
    lookup[item.order.toString().padStart(2, "0")] = item;
  });

  const matchedMap: Record<string, ParsedJiaziItem> = {};
  const unmatchedKeys: string[] = [];
  let totalEntries = 0;

  const extractUrl = (val: any): string | null => {
    if (!val) return null;
    if (typeof val === "string") {
      const trimmed = val.trim();
      if (
        trimmed.startsWith("data:image/") ||
        trimmed.startsWith("http://") ||
        trimmed.startsWith("https://") ||
        trimmed.startsWith("blob:") ||
        trimmed.startsWith("/")
      ) {
        return trimmed;
      }
      // Possible raw base64
      if (trimmed.length > 100 && /^[A-Za-z0-9+/=]+$/.test(trimmed.slice(0, 100))) {
        return `data:image/jpeg;base64,${trimmed}`;
      }
      return null;
    }
    if (typeof val === "object") {
      const candidate =
        val.imageUrl ||
        val.url ||
        val.image ||
        val.dataUrl ||
        val.src ||
        val.link;
      if (typeof candidate === "string") {
        return extractUrl(candidate);
      }
    }
    return null;
  };

  // Case 1: Array of items
  const arrayData = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed?.items)
    ? parsed.items
    : Array.isArray(parsed?.data)
    ? parsed.data
    : Array.isArray(parsed?.hoaGiap)
    ? parsed.hoaGiap
    : null;

  if (arrayData) {
    totalEntries = arrayData.length;
    for (const rawItem of arrayData) {
      if (!rawItem || typeof rawItem !== "object") continue;
      const keyCandidates = [
        rawItem.id,
        rawItem.name,
        rawItem.canChi,
        rawItem.order?.toString(),
        rawItem.chinese,
      ].filter(Boolean);

      let targetJiazi: typeof SIXTY_JIAZI[0] | undefined;
      for (const k of keyCandidates) {
        const strKey = String(k);
        targetJiazi = lookup[strKey] || lookup[normalizeKey(strKey)];
        if (targetJiazi) break;
      }

      const url = extractUrl(rawItem);
      if (targetJiazi && url) {
        matchedMap[targetJiazi.id] = {
          id: targetJiazi.id,
          name: targetJiazi.name,
          order: targetJiazi.order,
          url,
        };
      } else if (keyCandidates.length > 0) {
        unmatchedKeys.push(String(keyCandidates[0]));
      }
    }
  } else if (typeof parsed === "object" && parsed !== null) {
    // Case 2: Object dictionary { [key]: url/object }
    const sourceObj: Record<string, any> =
      parsed.images || parsed.cards || parsed.data || parsed;

    const entries = Object.entries(sourceObj);
    totalEntries = entries.length;

    for (const [key, val] of entries) {
      // Ignore non-item meta properties if root object was passed
      if (["version", "type", "description", "generatedAt", "exportedAt", "count", "totalItems"].includes(key)) {
        continue;
      }

      const targetJiazi = lookup[key] || lookup[normalizeKey(key)];
      const url = extractUrl(val);

      if (targetJiazi && url) {
        matchedMap[targetJiazi.id] = {
          id: targetJiazi.id,
          name: targetJiazi.name,
          order: targetJiazi.order,
          url,
        };
      } else {
        unmatchedKeys.push(key);
      }
    }
  }

  return {
    matched: Object.values(matchedMap).sort((a, b) => a.order - b.order),
    unmatchedKeys,
    totalEntries,
  };
}

/**
 * Save multiple parsed items into storage
 */
export async function saveBatchJiaziImages(items: ParsedJiaziItem[]): Promise<number> {
  let count = 0;
  for (const item of items) {
    if (item.id && item.url) {
      await saveJiaziImage(item.id, item.url);
      count++;
    }
  }
  notifyListeners();
  return count;
}

/**
 * Import images from a JSON backup (flexible format support)
 */
export async function importJiaziBackupJSON(jsonString: string): Promise<number> {
  try {
    const { matched } = parseJiaziJSON(jsonString);
    if (matched.length === 0) {
      throw new Error("Không tìm thấy dữ liệu ảnh Hoa Giáp nào hợp lệ trong tệp JSON.");
    }
    const count = await saveBatchJiaziImages(matched);
    return count;
  } catch (e: any) {
    console.error("Failed to import jiazi backup", e);
    throw new Error(e.message || "Tệp tin sao lưu JSON không hợp lệ.");
  }
}

