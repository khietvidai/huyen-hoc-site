export interface VoiceTuningProfile {
  id: string;
  label: string;
  voice: string;
  edgeVoice: string;
  pitch: string;
  rate: string;
  volume: string;
  useVoxCpm?: boolean;
  voxControl?: string;
}

const SEC_MS_GEC_VERSION = "1-143.0.3650.75";
const TRUSTED_CLIENT_TOKEN = "6A5AA1D4EAFF4E9FB37E23D68491D6F4";
const VOXCPM_SPACE_BASE = "https://openbmb-voxcpm-demo.hf.space";

let cachedRefGradioPath: string | null = null;
let cachedRefExpireAt = 0;
let pendingRefUploadPromise: Promise<string | null> | null = null;

const VI_DIGITS = [
  "không",
  "một",
  "hai",
  "ba",
  "bốn",
  "năm",
  "sáu",
  "bảy",
  "tám",
  "chín",
];

function readThreeDigitsVi(num: number, showZeroHundred: boolean): string {
  const h = Math.floor(num / 100);
  const rem = num % 100;
  const t = Math.floor(rem / 10);
  const u = rem % 10;
  const parts: string[] = [];

  if (h > 0 || showZeroHundred) {
    parts.push(`${VI_DIGITS[h]} trăm`);
  }

  if (t === 0 && u > 0) {
    if (h > 0 || showZeroHundred) {
      parts.push("linh", VI_DIGITS[u]);
    } else {
      parts.push(VI_DIGITS[u]);
    }
  } else if (t === 1) {
    parts.push("mười");
    if (u === 5) parts.push("lăm");
    else if (u > 0) parts.push(VI_DIGITS[u]);
  } else if (t > 1) {
    parts.push(`${VI_DIGITS[t]} mươi`);
    if (u === 1) parts.push("mốt");
    else if (u === 4) parts.push("bốn");
    else if (u === 5) parts.push("lăm");
    else if (u > 0) parts.push(VI_DIGITS[u]);
  }

  return parts.join(" ");
}

/**
 * Converts a non-negative integer into natural Vietnamese spoken words
 * so TTS engines (especially VoxCPM2) never read digits 1, 2, 3, 4... in English.
 */
export function numberToVietnameseWords(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "";
  const intVal = Math.floor(n);
  if (intVal === 0) return "không";
  if (intVal >= 1_000_000_000_000) {
    return String(intVal)
      .split("")
      .map((d) => VI_DIGITS[Number(d)] || "")
      .join(" ");
  }

  const units = ["", "nghìn", "triệu", "tỷ"];
  const groups: number[] = [];
  let temp = intVal;
  while (temp > 0) {
    groups.push(temp % 1000);
    temp = Math.floor(temp / 1000);
  }

  const parts: string[] = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    const grp = groups[i];
    if (grp === 0) continue;
    const showZeroHundred = i < groups.length - 1;
    const grpWords = readThreeDigitsVi(grp, showZeroHundred);
    const unitLabel = units[i] || "";
    parts.push(unitLabel ? `${grpWords} ${unitLabel}` : grpWords);
  }

  return parts.join(" ").replace(/\s+/g, " ").trim();
}

/**
 * Converts all numbers, ordinals, card/yao indices, percentages, and ratios in a Vietnamese string
 * into 100% Vietnamese words (zero Arabic digits 0-9 remaining), preventing VoxCPM2 or multilingual
 * TTS from ever reading numbers as "one, two, three, four...".
 */
export function convertNumbersToVietnameseWords(raw: string): string {
  if (!raw) return "";
  let s = raw;

  // 1. Strip Hanzi / CJK characters and empty brackets
  s = s
    .replace(
      /[\u2E80-\u2EFF\u3000-\u303F\u3400-\u4DBF\u4DC0-\u4DFF\u4E00-\u9FFF\uF900-\uFAFF\uFF00-\uFFEF]+/g,
      " "
    )
    .replace(/\(\s*[-·•,;:]*\s*\)/g, " ")
    .replace(/\[\s*[-·•,;:]*\s*\]/g, " ")
    .replace(/【\s*[-·•,;:]*\s*】/g, " ");

  // 2. Specific I Ching & Card ordinal patterns
  s = s.replace(/\bLá\s*(?:bài\s*)?(?:số\s*)?(\d+)\b/gi, (_m, d) => {
    return `Lá bài số ${numberToVietnameseWords(Number(d))}`;
  });
  s = s.replace(/\bHào\s*Động\s*(?:thứ\s*|số\s*)?(\d+)\b/gi, (_m, d) => {
    const num = Number(d);
    if (num === 1) return "Hào động thứ nhất";
    if (num === 4) return "Hào động thứ tư";
    return `Hào động thứ ${numberToVietnameseWords(num)}`;
  });
  s = s.replace(/\bHào\s*(?:số\s*)?(\d+)\b/gi, (_m, d) => {
    return `Hào số ${numberToVietnameseWords(Number(d))}`;
  });
  s = s.replace(/\bQuẻ\s*(?:số\s*)?#?(\d+)\b/gi, (_m, d) => {
    return `Quẻ số ${numberToVietnameseWords(Number(d))}`;
  });
  s = s.replace(/\b(thứ|Thứ)\s+1\b/g, "$1 nhất");
  s = s.replace(/\b(thứ|Thứ)\s+4\b/g, "$1 tư");
  s = s.replace(/\b(thứ|Thứ)\s+(\d+)\b/g, (_m, prefix, d) => {
    return `${prefix} ${numberToVietnameseWords(Number(d))}`;
  });

  // 3. Numbered list items like "1. ", "2. ", "3. ", "4. " -> "một, ", "hai, "...
  s = s.replace(/(?:^|(?<=[.!?;\n]))\s*(\d+)\.\s+/g, (_m, d) => {
    return ` ${numberToVietnameseWords(Number(d))}, `;
  });
  s = s.replace(/\s+(\d+)\.\s+(?=[A-ZÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬĐÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴ])/g, (_m, d) => {
    return `. ${numberToVietnameseWords(Number(d))}, `;
  });

  // 4. Percentages: "100%" -> "một trăm phần trăm", "12,5%" -> "mười hai phẩy năm phần trăm"
  s = s.replace(/(\d+)[.,](\d+)\s*%/g, (_m, a, b) => {
    return `${numberToVietnameseWords(Number(a))} phẩy ${numberToVietnameseWords(Number(b))} phần trăm`;
  });
  s = s.replace(/(\d+)\s*%/g, (_m, a) => {
    return `${numberToVietnameseWords(Number(a))} phần trăm`;
  });

  // 5. Fractions / steps: "Bước 1/4" or "1/4" -> "một trên bốn"
  s = s.replace(/\b(\d+)\s*\/\s*(\d+)\b/g, (_m, a, b) => {
    return `${numberToVietnameseWords(Number(a))} trên ${numberToVietnameseWords(Number(b))}`;
  });

  // 6. Numeric ranges: "1-4" or "1 - 4" -> "một đến bốn"
  s = s.replace(/\b(\d+)\s*[-–—]\s*(\d+)\b/g, (_m, a, b) => {
    return `${numberToVietnameseWords(Number(a))} đến ${numberToVietnameseWords(Number(b))}`;
  });

  // 7. Decimals: "2,5" or "2.5" -> "hai phẩy năm"
  s = s.replace(/\b(\d+)[.,](\d+)\b/g, (_m, a, b) => {
    return `${numberToVietnameseWords(Number(a))} phẩy ${numberToVietnameseWords(Number(b))}`;
  });

  // 8. Any remaining integer sequences (e.g., "1, 2, 3, 4", "4 lá", "64 quẻ", "384 hào")
  s = s.replace(/\d+/g, (m) => {
    return ` ${numberToVietnameseWords(Number(m))} `;
  });

  return s
    .replace(/[䷀-䷿⚊⚏☰☱☲☳☴☵☶☷➔•·|#*~_`]/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Resolves the tuning profile for Vietnamese voices on ichingtarot.com.
 * - "nam_tram_am" / "test_vi_design" / "voxcpm-nam-tram-am":
 *   Uses `test_vi_design.wav` (`ref-nam-tram-am.wav`) as the reference voice via VoxCPM2
 *   Controllable Voice Cloning, with automatic fallback to Edge Neural `vi-VN-NamMinhNeural` (-6Hz).
 */
export function resolveVietnameseVoiceProfile(voiceParam?: string | null): VoiceTuningProfile {
  const v = (voiceParam || "nam_tram_am").trim().toLowerCase();

  if (
    v === "test_vi_design" ||
    v === "test_vi_design.wav" ||
    v === "nam_tram_am" ||
    v === "voxcpm-nam-tram-am" ||
    v === "voxcpm_male_warm" ||
    v === "nam-tram-am" ||
    v === "male_warm" ||
    v === "vi-vn-namminhneural-warm"
  ) {
    return {
      id: "nam_tram_am",
      label: "Nam Trầm Ấm (Giọng test_vi_design · Thủy Mặc)",
      voice: "vi-VN-NamMinhNeural",
      edgeVoice: "vi-VN-NamMinhNeural",
      pitch: "-6Hz",
      rate: "-10%",
      volume: "+10%",
      useVoxCpm: true,
      voxControl:
        "Deep, calm, resonant Vietnamese male narrator voice, authoritative and philosophical, clear articulation",
    };
  }

  if (v === "namminh_elder" || v === "dich_su_truong_lao" || v === "elder") {
    return {
      id: "namminh_elder",
      label: "Dịch Sư Trưởng Lão (Trầm Sâu Uy Nghiêm)",
      voice: "vi-VN-NamMinhNeural",
      edgeVoice: "vi-VN-NamMinhNeural",
      pitch: "-10Hz",
      rate: "-14%",
      volume: "+12%",
      useVoxCpm: false,
    };
  }

  if (
    v === "female" ||
    v === "nu" ||
    v === "nu_thanh_thoat" ||
    v.includes("hoaimy")
  ) {
    return {
      id: "vi-VN-HoaiMyNeural",
      label: "Nữ Hoài My (Truyền Cảm · Rõ Nét)",
      voice: "vi-VN-HoaiMyNeural",
      edgeVoice: "vi-VN-HoaiMyNeural",
      pitch: "-1Hz",
      rate: "-8%",
      volume: "+4%",
      useVoxCpm: false,
    };
  }

  if (v === "male_standard" || v === "vi-vn-namminhneural") {
    return {
      id: "vi-VN-NamMinhNeural",
      label: "Nam Minh Chuẩn",
      voice: "vi-VN-NamMinhNeural",
      edgeVoice: "vi-VN-NamMinhNeural",
      pitch: "-2Hz",
      rate: "-8%",
      volume: "+5%",
      useVoxCpm: false,
    };
  }

  // Default to Nam Trầm Ấm (test_vi_design.wav) for Kinh Dịch & Phim Thủy Mặc
  return {
    id: "nam_tram_am",
    label: "Nam Trầm Ấm (Giọng test_vi_design · Thủy Mặc)",
    voice: "vi-VN-NamMinhNeural",
    edgeVoice: "vi-VN-NamMinhNeural",
    pitch: "-6Hz",
    rate: "-10%",
    volume: "+10%",
    useVoxCpm: true,
    voxControl:
      "Deep, calm, resonant Vietnamese male narrator voice, authoritative and philosophical, clear articulation",
  };
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toHexUpper(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex.toUpperCase();
}

function randomHex(byteLength: number): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex;
}

export async function generateSecMsGec(): Promise<string> {
  let ticks = Math.floor(Date.now() / 1000) + 11644473600;
  ticks -= ticks % 300;
  const ticks100ns = ticks * 1e7;
  const strToHash = `${ticks100ns.toFixed(0)}${TRUSTED_CLIENT_TOKEN}`;
  const data = new TextEncoder().encode(strToHash);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return toHexUpper(hashBuffer);
}

/**
 * Ensures the reference voice (`test_vi_design.wav` / `ref-nam-tram-am.wav`) is uploaded
 * once to the VoxCPM2 Space and shared across concurrent synthesis requests.
 */
export async function ensureVoxCpmRefUploaded(
  refSource?:
    | Uint8Array
    | ArrayBuffer
    | null
    | (() => Promise<Uint8Array | null>)
): Promise<string | null> {
  const now = Date.now();
  if (cachedRefGradioPath && now < cachedRefExpireAt) {
    return cachedRefGradioPath;
  }
  if (!refSource) {
    return null;
  }
  if (pendingRefUploadPromise) {
    return pendingRefUploadPromise;
  }

  pendingRefUploadPromise = (async () => {
    try {
      const refBytes =
        typeof refSource === "function" ? await refSource() : refSource;
      if (!refBytes || refBytes.byteLength < 512) {
        return null;
      }

      const formData = new FormData();
      const blob = new Blob([refBytes as BlobPart], { type: "audio/wav" });
      formData.append("files", blob, "test_vi_design.wav");
      const upRes = await fetch(`${VOXCPM_SPACE_BASE}/gradio_api/upload`, {
        method: "POST",
        body: formData,
      });
      if (upRes.ok) {
        const upJson = (await upRes.json()) as string[];
        if (Array.isArray(upJson) && upJson[0]) {
          cachedRefGradioPath = upJson[0];
          cachedRefExpireAt = Date.now() + 15 * 60 * 1000;
          return cachedRefGradioPath;
        }
      }
      return null;
    } catch {
      return null;
    } finally {
      pendingRefUploadPromise = null;
    }
  })();

  return pendingRefUploadPromise;
}

/**
 * Synthesizes Vietnamese speech via OpenBMB VoxCPM2 (Controllable Voice Cloning)
 * anchored to `test_vi_design.wav` (`ref-nam-tram-am.wav`).
 *
 * Automatically normalizes all digits 0-9 into Vietnamese words so VoxCPM2 never
 * pronounces numbers in English.
 */
export async function synthesizeVoxCpmAnchored(
  text: string,
  arg2?: string | Uint8Array | ArrayBuffer | null,
  arg3?: string | (() => Promise<Uint8Array | null>),
  timeoutMs = 15000
): Promise<Uint8Array | null> {
  const spokenViText = convertNumbersToVietnameseWords(text);
  if (!spokenViText) return null;

  let controlInstruction =
    "Deep, calm, resonant Vietnamese male narrator voice, authoritative and philosophical, clear articulation";
  let refSource:
    | Uint8Array
    | ArrayBuffer
    | null
    | (() => Promise<Uint8Array | null>) = null;

  if (typeof arg2 === "string") {
    controlInstruction = arg2 || controlInstruction;
    if (typeof arg3 === "function") {
      refSource = arg3;
    }
  } else {
    refSource = arg2 ?? null;
    if (typeof arg3 === "string" && arg3) {
      controlInstruction = arg3;
    }
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const refGradioPath = await ensureVoxCpmRefUploaded(refSource);

    const refData = refGradioPath
      ? {
          path: refGradioPath,
          meta: { _type: "gradio.FileData" },
          orig_name: "test_vi_design.wav",
        }
      : null;

    const payload = {
      data: [
        spokenViText,
        controlInstruction,
        refData,
        false, // ultimate_clone = false -> Controllable Voice Cloning using test_vi_design.wav timbre
        "",
        2.0, // cfg_value
        12, // steps
        false, // normalize = false (digits already converted to pure Vietnamese words)
        false, // denoise (preserve warm bass)
      ],
    };

    const callRes = await fetch(`${VOXCPM_SPACE_BASE}/gradio_api/call/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!callRes.ok) {
      return null;
    }
    const { event_id } = (await callRes.json()) as { event_id?: string };
    if (!event_id) {
      return null;
    }

    const sseRes = await fetch(
      `${VOXCPM_SPACE_BASE}/gradio_api/call/generate/${event_id}`,
      { signal: controller.signal }
    );
    if (!sseRes.ok) {
      return null;
    }
    const sseText = await sseRes.text();
    let audioUrl: string | null = null;
    for (const line of sseText.split("\n")) {
      const trimmed = line.trim();
      if (trimmed.startsWith("data:")) {
        try {
          const parsed = JSON.parse(trimmed.slice(5).trim());
          if (Array.isArray(parsed) && parsed[0]) {
            if (parsed[0].url) {
              audioUrl = parsed[0].url;
            } else if (parsed[0].path) {
              audioUrl = `${VOXCPM_SPACE_BASE}/gradio_api/file=${parsed[0].path}`;
            }
          }
        } catch {
          // continue parsing lines
        }
      }
    }

    if (!audioUrl) {
      return null;
    }

    const wavRes = await fetch(audioUrl, { signal: controller.signal });
    if (!wavRes.ok) {
      return null;
    }
    const arrayBuffer = await wavRes.arrayBuffer();
    if (arrayBuffer.byteLength < 512) {
      return null;
    }
    return new Uint8Array(arrayBuffer);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Synthesizes a chunk of Vietnamese speech via Microsoft Edge Read Aloud Neural WebSocket
 * with custom prosody (pitch, rate, volume) for warm, deep I Ching reading.
 */
export async function synthesizeEdgeNeuralChunk(
  text: string,
  profileOrVoice?: VoiceTuningProfile | string | null,
  customWsFactory?: (url: string, headers: Record<string, string>) => any
): Promise<Uint8Array | null> {
  const spokenViText = convertNumbersToVietnameseWords(text);
  if (!spokenViText) return null;

  const baseProfile =
    typeof profileOrVoice === "object" && profileOrVoice !== null
      ? profileOrVoice
      : resolveVietnameseVoiceProfile(profileOrVoice);

  const voice = baseProfile.edgeVoice || baseProfile.voice;
  const pitch = baseProfile.pitch;
  const rate = baseProfile.rate;
  const volume = baseProfile.volume;

  const secMsGec = await generateSecMsGec();
  const connId = randomHex(16);
  const reqId = randomHex(16);

  const wsUrl =
    `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1` +
    `?TrustedClientToken=${TRUSTED_CLIENT_TOKEN}` +
    `&Sec-MS-GEC=${secMsGec}` +
    `&Sec-MS-GEC-Version=${SEC_MS_GEC_VERSION}` +
    `&ConnectionId=${connId}`;

  const wsHeaders: Record<string, string> = {
    Pragma: "no-cache",
    Origin: "chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold",
    "Cache-Control": "no-cache",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0",
  };

  return new Promise<Uint8Array | null>((resolve) => {
    let ws: any;
    try {
      ws = customWsFactory ? customWsFactory(wsUrl, wsHeaders) : new WebSocket(wsUrl);
      if ("binaryType" in ws) {
        ws.binaryType = "arraybuffer";
      }
    } catch {
      resolve(null);
      return;
    }

    const audioChunks: Uint8Array[] = [];
    let settled = false;

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        try {
          ws.close();
        } catch {}
        resolve(null);
      }
    }, 9500);

    const finishSuccess = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try {
        ws.close();
      } catch {}

      let totalLen = 0;
      for (const c of audioChunks) totalLen += c.byteLength;
      if (totalLen === 0) {
        resolve(null);
        return;
      }
      const merged = new Uint8Array(totalLen);
      let offset = 0;
      for (const c of audioChunks) {
        merged.set(c, offset);
        offset += c.byteLength;
      }
      resolve(merged);
    };

    const finishError = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try {
        ws.close();
      } catch {}
      resolve(null);
    };

    const onOpen = () => {
      try {
        const configHeader =
          `X-Timestamp:${new Date().toISOString()}\r\n` +
          `Content-Type:application/json; charset=utf-8\r\n` +
          `Path:speech.config\r\n\r\n` +
          JSON.stringify({
            context: {
              synthesis: {
                audio: {
                  metadataoptions: {
                    sentenceBoundaryEnabled: "false",
                    wordBoundaryEnabled: "false",
                  },
                  outputFormat: "audio-24khz-48kbitrate-mono-mp3",
                },
              },
            },
          });
        ws.send(configHeader);

        const ssml =
          `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='vi-VN'>` +
          `<voice name='${voice}'>` +
          `<prosody pitch='${pitch}' rate='${rate}' volume='${volume}'>` +
          `${escapeXml(spokenViText)}` +
          `</prosody>` +
          `</voice>` +
          `</speak>`;

        const ssmlMessage =
          `X-RequestId:${reqId}\r\n` +
          `Content-Type:application/ssml+xml\r\n` +
          `X-Timestamp:${new Date().toISOString()}Z\r\n` +
          `Path:ssml\r\n\r\n` +
          ssml;
        ws.send(ssmlMessage);
      } catch {
        finishError();
      }
    };

    const handleRawMessage = (rawData: any) => {
      try {
        if (typeof rawData === "string") {
          if (rawData.includes("Path:turn.end")) {
            finishSuccess();
          }
          return;
        }

        let buf: ArrayBuffer | null = null;
        if (rawData instanceof ArrayBuffer) {
          buf = rawData;
        } else if (ArrayBuffer.isView(rawData)) {
          buf = rawData.buffer.slice(rawData.byteOffset, rawData.byteOffset + rawData.byteLength);
        }

        if (buf) {
          const textCandidate = new TextDecoder().decode(new Uint8Array(buf, 0, Math.min(buf.byteLength, 256)));
          if (textCandidate.includes("Path:turn.end")) {
            finishSuccess();
            return;
          }
          const view = new DataView(buf);
          if (view.byteLength < 2) return;
          const headerLen = view.getUint16(0, false);
          const payloadOffset = 2 + headerLen;
          if (view.byteLength > payloadOffset) {
            const headerText = new TextDecoder().decode(new Uint8Array(buf, 2, headerLen));
            if (headerText.includes("Path:audio")) {
              audioChunks.push(new Uint8Array(buf.slice(payloadOffset)));
            }
          }
        }
      } catch {
        finishError();
      }
    };

    if (typeof ws.addEventListener === "function") {
      ws.addEventListener("open", onOpen);
      ws.addEventListener("message", (ev: any) => handleRawMessage(ev.data));
      ws.addEventListener("error", finishError);
      ws.addEventListener("close", () => {
        if (!settled) {
          if (audioChunks.length > 0) finishSuccess();
          else finishError();
        }
      });
    } else if (typeof ws.on === "function") {
      ws.on("open", onOpen);
      ws.on("message", (data: any, isBinary: boolean) => {
        if (!isBinary && Buffer.isBuffer(data)) {
          handleRawMessage(data.toString("utf-8"));
        } else {
          handleRawMessage(data);
        }
      });
      ws.on("error", finishError);
      ws.on("close", () => {
        if (!settled) {
          if (audioChunks.length > 0) finishSuccess();
          else finishError();
        }
      });
    }
  });
}

export const synthesizeEdgeNeuralMp3 = synthesizeEdgeNeuralChunk;
