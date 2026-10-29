// ============================================================================
// PURE TYPESCRIPT EDGE NEURAL TTS + VOXCPM2 ANCHORED VIETNAMESE MALE ENGINE
// Works in both Cloudflare Workers (fetch Upgrade: websocket) and Node.js 20+
// Provides genuine Warm Deep Male Vietnamese voices (vi-VN-NamMinhNeural
// tuned for I Ching hexagram reading, plus VoxCPM2 48kHz voice cloning).
// ============================================================================

const TRUSTED_CLIENT_TOKEN = "6A5AA1D4EAFF4E9FB37E23D68491D6F4";
const CHROMIUM_FULL_VERSION = "143.0.3650.75";
const CHROMIUM_MAJOR_VERSION = "143";
const SEC_MS_GEC_VERSION = `2-${CHROMIUM_FULL_VERSION}`;
const WIN_EPOCH = 11644473600;

const SHA256_INITIAL = [
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
  0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
];
const SHA256_STATE = [
  0xfd9fbea2, 0x91243ce7, 0xbe499094, 0xcd2e1e0a,
  0x6c006f49, 0x04bd35ab, 0xfeb0a7e4, 0x03effbd2,
];
const SHA256_SCHEDULE = [
  0xeb24bf9e, 0x1558691f, 0xa0c09ee2, 0x0cfa32ba,
  0xa622ee8c, 0xd1dd9491, 0xc0dd25a0, 0xf9e70ab6,
  0xf0c31573, 0x7058ce4e, 0x7188e606, 0x00e5ab33,
  0xd258b060, 0x72766564,
];
const SHA256_ROUND_CONSTANTS = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];
const SHA256_ADJUSTMENT = 0xc9dc06a7;
const SHA256_BLOCK_CONSTANTS = SHA256_ROUND_CONSTANTS.map((v, i) => (i === 14 ? SHA256_ADJUSTMENT : v));
const SHA256_SIGMA0_ADJUSTMENT = 0x059c0b80;
const SHA256_SIGMA1_ADJUSTMENT = 0x000b92c0;

const CS64_COEFFICIENTS: Array<[number, number]> = [
  [0xe82e91b1, 0xb32700d0],
  [0x44de24c6, 0x88dff51d],
  [0x3beb65bc, 0x29514038],
  [0xc89c5933, 0xb328cbdf],
  [0x8d1ec211, 0xd405b4d5],
  [0x314ef5d5, 0x26e55f3c],
  [0xe92491b1, 0x607801c6],
  [0xf0a5b9d5, 0x82b2c1fb],
  [0x06064cf3, 0xfa51a3da],
  [0xda79fa60, 0x207cc464],
  [0xbed20560, 0x3c3c74f3],
  [0x89f9c9f8, 0xd2d14b61],
  [0x35fa38c6, 0xbb04a2c1],
  [0xcb49e3c6, 0xc5626167],
];
const CS64_FACTOR = 0x82893933;
const CS64_ADJUSTMENT0 = 0xf2f90b1a;
const CS64_ADJUSTMENT1 = 0x0b1a0000;

function u32(v: number): number {
  return v >>> 0;
}

function mul32(a: number, b: number): number {
  return Math.imul(a >>> 0, b >>> 0) >>> 0;
}

function rotr32(v: number, n: number): number {
  const x = v >>> 0;
  return ((x >>> n) | (x << (32 - n))) >>> 0;
}

function rol16(v: number): number {
  const x = v >>> 0;
  return ((x << 16) | (x >>> 16)) >>> 0;
}

function sigma0(v: number): number {
  return (rotr32(v, 7) ^ rotr32(v, 18) ^ (v >>> 3)) >>> 0;
}

function sigma1(v: number): number {
  return (rotr32(v, 17) ^ rotr32(v, 19) ^ (v >>> 10)) >>> 0;
}

function bigSigma0(v: number): number {
  return (rotr32(v, 2) ^ rotr32(v, 13) ^ rotr32(v, 22)) >>> 0;
}

function bigSigma1(v: number): number {
  return (rotr32(v, 6) ^ rotr32(v, 11) ^ rotr32(v, 25)) >>> 0;
}

function sha256Rounds(state: number[], words: number[], firstRound = 0): number[] {
  let [a, b, c, d, e, f, g, h] = state.map(u32);
  const constants = firstRound === 14 ? SHA256_BLOCK_CONSTANTS : SHA256_ROUND_CONSTANTS;
  for (let i = firstRound; i < 64; i++) {
    const ch = (g ^ (e & (f ^ g))) >>> 0;
    const maj = ((a & b) | (c & (a | b))) >>> 0;
    const t1 = (h + bigSigma1(e) + ch + constants[i] + words[i]) >>> 0;
    const t2 = (bigSigma0(a) + maj) >>> 0;
    h = g;
    g = f;
    f = e;
    e = (d + t1) >>> 0;
    d = c;
    c = b;
    b = a;
    a = (t1 + t2) >>> 0;
  }
  return [a, b, c, d, e, f, g, h];
}

function expandSha256Schedule(words: number[], firstWord = 16): void {
  for (let i = firstWord; i < 64; i++) {
    const s1 = sigma1(words[i - 2]);
    const s0 = sigma0(words[i - 15]);
    words.push((s1 + words[i - 7] + s0 + words[i - 16]) >>> 0);
  }
}

function sha256Init(data7: Uint8Array): number[] {
  const w14 = ((data7[0] << 16) | (data7[1] << 8) | data7[2]) >>> 0;
  const w15 = ((data7[3] << 24) | (data7[4] << 16) | (data7[5] << 8) | data7[6]) >>> 0;
  const words: number[] = new Array(14).fill(0);
  words.push(w14, w15);
  for (let index = 16; index < 30; index++) {
    let value = SHA256_SCHEDULE[index - 16];
    if (index - 2 >= 14) {
      const s1 = sigma1(words[index - 2]);
      value = (value + (index === 16 ? (s1 ^ SHA256_SIGMA1_ADJUSTMENT) >>> 0 : s1)) >>> 0;
    }
    if (index - 7 >= 14) {
      value = (value + words[index - 7]) >>> 0;
    }
    if (index - 15 >= 14) {
      const s0 = sigma0(words[index - 15]);
      value = (value + (index === 29 ? (s0 ^ SHA256_SIGMA0_ADJUSTMENT) >>> 0 : s0)) >>> 0;
    }
    words.push(value >>> 0);
  }
  words.push(
    (sigma1(words[28]) +
      words[23] +
      sigma0(words[15]) +
      words[14] +
      SHA256_ADJUSTMENT -
      SHA256_ROUND_CONSTANTS[14]) >>>
      0
  );
  expandSha256Schedule(words, 31);
  const working = sha256Rounds(SHA256_STATE, words, 14);
  return SHA256_INITIAL.map((x, idx) => (x + working[idx]) >>> 0);
}

function sha256Digest(data: Uint8Array): Uint8Array {
  const length = 57 + data.length;
  const rest = data.slice(7);
  const padZeroCount = (((55 - length) % 64) + 64) % 64;
  const padded = new Uint8Array(rest.length + 1 + padZeroCount + 8);
  padded.set(rest, 0);
  padded[rest.length] = 0x80;
  const bitLen = BigInt(length) * 8n;
  const dv = new DataView(padded.buffer, padded.byteOffset, padded.byteLength);
  dv.setBigUint64(padded.length - 8, bitLen, false);

  let state = sha256Init(data.slice(0, 7));
  for (let offset = 0; offset < padded.length; offset += 64) {
    const words: number[] = [];
    for (let i = 0; i < 16; i++) {
      words.push(dv.getUint32(offset + i * 4, false));
    }
    expandSha256Schedule(words, 16);
    const working = sha256Rounds(state, words, 0);
    state = state.map((x, idx) => (x + working[idx]) >>> 0);
  }
  const out = new Uint8Array(32);
  const outDv = new DataView(out.buffer);
  for (let i = 0; i < 8; i++) {
    outDv.setUint32(i * 4, state[i], false);
  }
  return out;
}

function wordsLe4Even(data: Uint8Array): number[] {
  const pad = (4 - (data.length % 4)) % 4;
  const padded = new Uint8Array(data.length + pad);
  padded.set(data, 0);
  if (padded.length === 0) return [];
  const dv = new DataView(padded.buffer, padded.byteOffset, padded.byteLength);
  const words: number[] = [];
  for (let i = 0; i < padded.length; i += 4) {
    words.push(dv.getUint32(i, true));
  }
  if (words.length % 2 === 1) words.push(0);
  return words;
}

function cs64Digest(data: Uint8Array, digest: Uint8Array): [number, number] {
  const dDv = new DataView(digest.buffer, digest.byteOffset, digest.byteLength);
  const keyA = (dDv.getUint32(0, true) | 1) >>> 0;
  const keyB = (dDv.getUint32(4, true) | 1) >>> 0;
  const factors: [number, number] = [mul32(keyA, CS64_FACTOR), mul32(keyB, CS64_FACTOR)];
  const terms: number[] = CS64_COEFFICIENTS.map(([coeff], idx) => mul32(coeff, factors[idx % 2]));
  const offsets: number[] = CS64_COEFFICIENTS.map(([, off]) => off >>> 0);

  const prefixed = new Uint8Array(1 + data.length);
  prefixed.set(data, 1);
  const dataWords = wordsLe4Even(prefixed);

  for (let index = 0; index < dataWords.length; index++) {
    const word = dataWords[index];
    let term = mul32(word, index % 2 === 0 ? keyA : keyB);
    let offset = mul32(rol16(word), index % 2 === 0 ? 0xef0569fb : 0xc31713db);
    if (index === 0) {
      term = (term + mul32(CS64_ADJUSTMENT0, factors[0])) >>> 0;
      offset = (offset + CS64_ADJUSTMENT1) >>> 0;
    }
    terms.push(term >>> 0);
    offsets.push(offset >>> 0);
  }

  let swapAcc = 0;
  let swapLast = 0;
  let state = 0;
  let acc = 0;

  for (let index = 0; index < terms.length; index += 2) {
    const x = terms[index];
    const y = terms[index + 1];
    let t = rol16((offsets[index] + x) >>> 0);
    let q = mul32(t, 0x76f50f34);
    swapAcc = (swapAcc + ((mul32(rol16(q), 0xc3efea97) + q) >>> 0)) >>> 0;

    t = rol16((offsets[index + 1] + y) >>> 0);
    q = mul32(t, 0x1881ce3c);
    swapLast = (mul32(rol16(q), 0x35bd1ec9) + q) >>> 0;
    swapAcc = (swapAcc + swapLast) >>> 0;

    state = (mul32(state, keyA) + x) >>> 0;
    state = mul32(rol16(state), 0xcf98b111);
    state = mul32(rol16(state), 0x87085b9f);
    state = mul32(rol16(state), 0x12ceb96d);
    state = mul32(rol16(state), 0x257e1d83);
    acc = (acc + state) >>> 0;

    t = (mul32(state, keyB) + y) >>> 0;
    t = mul32(rol16(t), 0xa27416f5);
    t = mul32(rol16(t), 0xd38396ff);
    state = mul32(rol16(mul32(rol16(t), 0x7c932b89)), 0xbfa49f69);
    acc = (acc + state) >>> 0;
  }

  return [(swapLast ^ state) >>> 0, (swapAcc ^ acc) >>> 0];
}

function bytesToHexUpper(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i].toString(16).padStart(2, "0").toUpperCase();
  }
  return out;
}

export function generateSecMsGecV2(unixTimestampSec?: number): string {
  let ticks = unixTimestampSec !== undefined ? unixTimestampSec : Date.now() / 1000;
  ticks += WIN_EPOCH;
  ticks -= ticks % 300;
  const ticks100ns = Math.round(ticks * 1e7);
  const strToHash = `${ticks100ns}${TRUSTED_CLIENT_TOKEN}`;
  const data = new TextEncoder().encode(strToHash);
  const digest = sha256Digest(data);
  const [cs0, cs1] = cs64Digest(data, digest);
  const csBytes = new Uint8Array(8);
  const csDv = new DataView(csBytes.buffer);
  csDv.setUint32(0, cs0, true);
  csDv.setUint32(4, cs1, true);
  return `${bytesToHexUpper(csBytes)}-${bytesToHexUpper(digest)}`;
}

function randomHex(byteCount: number): string {
  const arr = new Uint8Array(byteCount);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(arr);
  } else {
    for (let i = 0; i < byteCount; i++) arr[i] = Math.floor(Math.random() * 256);
  }
  return bytesToHexUpper(arr).toLowerCase();
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export interface VoiceProsodyProfile {
  edgeVoice: string;
  pitch: string;
  rate: string;
  volume: string;
  useVoxCpm?: boolean;
  voxControl?: string;
}

export function resolveVietnameseVoiceProfile(voiceParam?: string): VoiceProsodyProfile {
  const v = (voiceParam || "nam_tram_am").trim().toLowerCase();
  if (v.includes("hoaimy") || v.includes("female")) {
    return {
      edgeVoice: "vi-VN-HoaiMyNeural",
      pitch: "-2Hz",
      rate: "-2%",
      volume: "+4%",
    };
  }
  if (v.includes("elder") || v.includes("truong_lao") || v.includes("truonglao")) {
    return {
      edgeVoice: "vi-VN-NamMinhNeural",
      pitch: "-10Hz",
      rate: "-7%",
      volume: "+10%",
      useVoxCpm: v.startsWith("voxcpm"),
      voxControl:
        "Wise elderly Vietnamese I Ching master, deep resonant baritone voice, slow, solemn, authoritative tone",
    };
  }
  if (v.startsWith("voxcpm")) {
    return {
      edgeVoice: "vi-VN-NamMinhNeural",
      pitch: "-6Hz",
      rate: "-4%",
      volume: "+8%",
      useVoxCpm: true,
      voxControl:
        "Deep, warm, calm Vietnamese male narrator, resonant baritone voice, steady philosophical I Ching reading pace",
    };
  }
  if (v === "vi-vn-namminhneural") {
    return {
      edgeVoice: "vi-VN-NamMinhNeural",
      pitch: "-5Hz",
      rate: "-3%",
      volume: "+6%",
    };
  }
  // Default: Giọng Nam Trầm Ấm Đọc Quẻ Kinh Dịch (nam_tram_am)
  return {
    edgeVoice: "vi-VN-NamMinhNeural",
    pitch: "-6Hz",
    rate: "-4%",
    volume: "+8%",
  };
}

/**
 * Synthesize a single text chunk to MP3 via Microsoft Edge Neural TTS WebSocket.
 * Works in both Cloudflare Workers (fetch with Upgrade: websocket) and Node.js (via optional nodeWsFactory).
 */
export async function synthesizeEdgeNeuralChunk(
  text: string,
  profile: VoiceProsodyProfile,
  nodeWsFactory?: (wssUrl: string, headers: Record<string, string>) => any
): Promise<Uint8Array | null> {
  const clean = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, " ").trim();
  if (!clean) return null;

  const connId = randomHex(16);
  const secMsGec = generateSecMsGecV2();
  const muid = randomHex(16).toUpperCase();
  const timestamp = new Date().toUTCString();

  const configMsg =
    `X-Timestamp:${timestamp}\r\n` +
    `Content-Type:application/json; charset=utf-8\r\n` +
    `Path:speech.config\r\n\r\n` +
    `{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"true","wordBoundaryEnabled":"false"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}\r\n`;

  const ssml =
    `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='vi-VN'>` +
    `<voice name='${profile.edgeVoice}'>` +
    `<prosody pitch='${profile.pitch}' rate='${profile.rate}' volume='${profile.volume}'>` +
    `${escapeXml(clean)}` +
    `</prosody></voice></speak>`;

  const ssmlMsg =
    `X-RequestId:${randomHex(16)}\r\n` +
    `Content-Type:application/ssml+xml\r\n` +
    `X-Timestamp:${timestamp}Z\r\n` +
    `Path:ssml\r\n\r\n` +
    `${ssml}`;

  const baseQuery =
    `TrustedClientToken=${TRUSTED_CLIENT_TOKEN}` +
    `&ConnectionId=${connId}` +
    `&Sec-MS-GEC=${secMsGec}` +
    `&Sec-MS-GEC-Version=${SEC_MS_GEC_VERSION}`;

  const headers: Record<string, string> = {
    Pragma: "no-cache",
    "Cache-Control": "no-cache",
    Origin: "chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold",
    "User-Agent": `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${CHROMIUM_MAJOR_VERSION}.0.0.0 Safari/537.36 Edg/${CHROMIUM_MAJOR_VERSION}.0.0.0`,
    "Accept-Encoding": "gzip, deflate, br, zstd",
    "Accept-Language": "en-US,en;q=0.9",
    Cookie: `muid=${muid};`,
  };

  // Strategy A: Node.js ws factory if provided (Express server.ts)
  if (nodeWsFactory) {
    try {
      const wssUrl = `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?${baseQuery}`;
      const ws = nodeWsFactory(wssUrl, headers);
      const res = await collectAudioFromNodeWs(ws, configMsg, ssmlMsg);
      if (res && res.byteLength > 200) return res;
    } catch {
      // Fall through
    }
  }

  // Strategy B: Cloudflare Workers fetch() with Upgrade: websocket
  try {
    const httpsUrl = `https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?${baseQuery}`;
    const resp: any = await fetch(httpsUrl, {
      headers: {
        ...headers,
        Upgrade: "websocket",
      },
    });
    if (resp && resp.webSocket) {
      const ws = resp.webSocket;
      ws.accept();
      return await collectAudioFromWebSocket(ws, configMsg, ssmlMsg);
    }
  } catch {
    // Fall through
  }

  return null;
}

function collectAudioFromWebSocket(
  ws: any,
  configMsg: string,
  ssmlMsg: string
): Promise<Uint8Array | null> {
  return new Promise((resolve) => {
    const audioChunks: Uint8Array[] = [];
    let totalBytes = 0;
    let settled = false;

    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try {
        ws.close();
      } catch {}
      if (!ok || totalBytes === 0) {
        resolve(null);
        return;
      }
      const merged = new Uint8Array(totalBytes);
      let offset = 0;
      for (const c of audioChunks) {
        merged.set(c, offset);
        offset += c.byteLength;
      }
      resolve(merged);
    };

    const timer = setTimeout(() => finish(totalBytes > 0), 15000);

    ws.addEventListener("message", (event: any) => {
      const data = event.data;
      if (typeof data === "string") {
        if (data.includes("Path:turn.end")) {
          finish(true);
        }
      } else if (data instanceof ArrayBuffer || ArrayBuffer.isView(data)) {
        const bytes =
          data instanceof ArrayBuffer
            ? new Uint8Array(data)
            : new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
        extractAudioPayload(bytes, audioChunks, (len) => {
          totalBytes += len;
        });
      }
    });

    ws.addEventListener("error", () => finish(false));
    ws.addEventListener("close", () => finish(totalBytes > 0));

    try {
      ws.send(configMsg);
      ws.send(ssmlMsg);
    } catch {
      finish(false);
    }
  });
}

function collectAudioFromNodeWs(
  ws: any,
  configMsg: string,
  ssmlMsg: string
): Promise<Uint8Array | null> {
  return new Promise((resolve) => {
    const audioChunks: Uint8Array[] = [];
    let totalBytes = 0;
    let settled = false;

    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try {
        ws.close();
      } catch {}
      if (!ok || totalBytes === 0) {
        resolve(null);
        return;
      }
      const merged = new Uint8Array(totalBytes);
      let offset = 0;
      for (const c of audioChunks) {
        merged.set(c, offset);
        offset += c.byteLength;
      }
      resolve(merged);
    };

    const timer = setTimeout(() => finish(totalBytes > 0), 15000);

    ws.on("open", () => {
      try {
        ws.send(configMsg);
        ws.send(ssmlMsg);
      } catch {
        finish(false);
      }
    });

    ws.on("message", (data: any, isBinary: boolean) => {
      if (!isBinary) {
        const str = typeof data === "string" ? data : data.toString("utf-8");
        if (str.includes("Path:turn.end")) {
          finish(true);
        }
      } else {
        const bytes =
          data instanceof Uint8Array
            ? new Uint8Array(data.buffer, data.byteOffset, data.byteLength)
            : new Uint8Array(data);
        extractAudioPayload(bytes, audioChunks, (len) => {
          totalBytes += len;
        });
      }
    });

    ws.on("error", () => finish(false));
    ws.on("close", () => finish(totalBytes > 0));
  });
}

function extractAudioPayload(
  bytes: Uint8Array,
  audioChunks: Uint8Array[],
  addLen: (n: number) => void
): void {
  if (bytes.byteLength < 2) return;
  const headerLen = (bytes[0] << 8) | bytes[1];
  if (headerLen + 2 > bytes.byteLength) return;
  const headerStr = new TextDecoder().decode(bytes.subarray(2, 2 + headerLen));
  if (headerStr.includes("Path:audio")) {
    const audioPayload = bytes.subarray(2 + headerLen);
    if (audioPayload.byteLength > 0) {
      audioChunks.push(audioPayload);
      addLen(audioPayload.byteLength);
    }
  }
}

// ---------- VoxCPM2 Anchored Voice Cloning (with Vietnamese Male Reference) ----------

let cachedVoxCpmRefFileData: any = null;
let cachedVoxCpmUploadedAt = 0;

export async function synthesizeVoxCpmAnchored(
  text: string,
  controlPrompt: string,
  getReferenceWavBytes?: () => Promise<Uint8Array | null>
): Promise<Uint8Array | null> {
  try {
    const spaceBase = "https://openbmb-voxcpm-demo.hf.space";
    const now = Date.now();

    if ((!cachedVoxCpmRefFileData || now - cachedVoxCpmUploadedAt > 15 * 60 * 1000) && getReferenceWavBytes) {
      const refBytes = await getReferenceWavBytes();
      if (refBytes && refBytes.byteLength > 1000) {
        const boundary = "----VoxCPMRefBoundary" + randomHex(8);
        const enc = new TextEncoder();
        const head = enc.encode(
          `--${boundary}\r\nContent-Disposition: form-data; name="files"; filename="ref-nam-tram-am.wav"\r\nContent-Type: audio/wav\r\n\r\n`
        );
        const tail = enc.encode(`\r\n--${boundary}--\r\n`);
        const body = new Uint8Array(head.byteLength + refBytes.byteLength + tail.byteLength);
        body.set(head, 0);
        body.set(refBytes, head.byteLength);
        body.set(tail, head.byteLength + refBytes.byteLength);

        const upRes = await fetch(`${spaceBase}/gradio_api/upload`, {
          method: "POST",
          headers: {
            "Content-Type": `multipart/form-data; boundary=${boundary}`,
            "User-Agent": "VoxCPM-Client/2.0",
          },
          body,
        });
        if (upRes.ok) {
          const upJson: any = await upRes.json();
          if (Array.isArray(upJson) && upJson[0]) {
            cachedVoxCpmRefFileData = {
              path: upJson[0],
              orig_name: "ref-nam-tram-am.wav",
              meta: { _type: "gradio.FileData" },
            };
            cachedVoxCpmUploadedAt = now;
          }
        }
      }
    }

    const clean = text.replace(/[*#_~`>|]/g, " ").replace(/\s+/g, " ").trim();
    if (!clean) return null;

    const callRes = await fetch(`${spaceBase}/gradio_api/call/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "VoxCPM-Client/2.0",
      },
      body: JSON.stringify({
        data: [
          clean.slice(0, 800),
          controlPrompt,
          cachedVoxCpmRefFileData,
          false,
          "",
          2.0,
          false,
          false,
        ],
      }),
    });
    if (!callRes.ok) return null;
    const callJson: any = await callRes.json();
    if (!callJson?.event_id) return null;

    const sseRes = await fetch(`${spaceBase}/gradio_api/call/generate/${callJson.event_id}`, {
      headers: { "User-Agent": "VoxCPM-Client/2.0" },
    });
    if (!sseRes.ok) return null;
    const sseText = await sseRes.text();
    let fileUrl = "";
    for (const ln of sseText.split(/\r?\n/)) {
      const s = ln.trim();
      if (s.startsWith("data:")) {
        try {
          const arr = JSON.parse(s.slice(5).trim());
          if (Array.isArray(arr) && arr[0]) {
            fileUrl = arr[0].url || (arr[0].path ? `${spaceBase}/gradio_api/file=${arr[0].path}` : "");
            if (fileUrl) break;
          }
        } catch {}
      }
    }
    if (!fileUrl) return null;

    const dlRes = await fetch(fileUrl, { headers: { "User-Agent": "VoxCPM-Client/2.0" } });
    if (!dlRes.ok) return null;
    const ab = await dlRes.arrayBuffer();
    return ab.byteLength > 800 ? new Uint8Array(ab) : null;
  } catch {
    return null;
  }
}
