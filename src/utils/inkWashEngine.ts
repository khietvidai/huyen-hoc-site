// ============================================================================
// CHINESE INK WASH (THỦY MẶC CHU DỊCH · 水墨周易) — WEBGL2 & CANVAS 2D ENGINE
// Ported from Lemo-Opuscar `ink-wash` architecture for ichingtarot.com.
// Features:
//  - Two-layer wet/dry ink + #B02E22 cinnabar vermilion on Xuan paper (#EAE3D2)
//  - WebGL2 3-pass separable Gaussian bleed + grain + deckle edge vignette
//  - Dynamic client-side Card-to-Ink-Wash decomposer (`wet`, `dry`, `col`)
//  - Animated Hexagram 6-line brushwork & live Yang<->Yin line transformations
//  - Hand-carved Cinnabar Vermilion Seal (`可成`, `大吉`, `慎行`)
// ============================================================================

import { HEXAGRAMS } from "../data/hexagrams";
import { InkWashNarrationCue } from "./inkWashAudio";

export interface InkWashCardInput {
  id: string;
  type: "hexagram" | "yao";
  hexNumber: number;
  yaoNumber?: number;
  symbol: string;
  hanzi?: string;
  name: string;
  sub: string;
  desc: string;
  img: string;
  positionLabel?: string;
}

export interface DecomposedCardInk {
  wet: HTMLCanvasElement;
  dry: HTMLCanvasElement;
  col: HTMLCanvasElement;
}

export interface InkWashShotInfo {
  index: number;
  title: string;
  subtitle: string;
  startSec: number;
  endSec: number;
  cardIndex?: number;
}

export interface InkWashFilmPlan {
  totalDurationSec: number;
  shots: InkWashShotInfo[];
  narrationCues: InkWashNarrationCue[];
  sealTimeSec: number;
  sealChars: string;
  orderedCards: InkWashCardInput[];
  primaryLines: number[];
  transformedLines: number[];
  changingLines: number[];
  question: string;
  conclusionText: string;
}

// ── DETERMINISTIC PRNG & VALUE NOISE (FROM LEMO-OPUSCAR INK.JS) ──
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeNoise(seed: number = 1337) {
  const R = mulberry32(seed);
  const T = new Float32Array(512);
  const P = new Uint8Array(512);
  for (let i = 0; i < 256; i++) {
    T[i] = R();
    P[i] = i;
  }
  for (let i = 255; i > 0; i--) {
    const j = (R() * (i + 1)) | 0;
    const t = P[i];
    P[i] = P[j];
    P[j] = t;
  }
  for (let i = 0; i < 256; i++) {
    P[i + 256] = P[i];
    T[i + 256] = T[i];
  }
  const n2 = (x: number, y: number) => {
    const xi = Math.floor(x) & 255;
    const yi = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const u = xf * xf * (3 - 2 * xf);
    const v = yf * yf * (3 - 2 * yf);
    const aa = P[P[xi] + yi];
    const ab = P[P[xi] + yi + 1];
    const ba = P[P[xi + 1] + yi];
    const bb = P[P[xi + 1] + yi + 1];
    return (
      (T[aa] * (1 - u) + T[ba] * u) * (1 - v) +
      (T[ab] * (1 - u) + T[bb] * u) * v
    );
  };
  const fbm = (x: number, y: number, oct: number = 4) => {
    let v = 0;
    let a = 0.5;
    let f = 1;
    for (let i = 0; i < oct; i++) {
      v += a * n2(x * f, y * f);
      f *= 2.03;
      a *= 0.5;
    }
    return v;
  };
  return { n2, fbm, R };
}

export const clamp = (x: number, a: number = 0, b: number = 1) =>
  x < a ? a : x > b ? b : x;
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
export const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
export const easeInOut = (t: number) => {
  const c = clamp(t);
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
};

const defaultNoise = makeNoise(77);

// ── BRUSH ENGINE: CALLIGRAPHY STROKE, FLYING WHITE, BLOT, VERMILION BLOT ──
export interface StrokeOpts {
  w0?: number;
  w1?: number;
  a0?: number;
  a1?: number;
  dry?: number;
  jit?: number;
  seed?: number;
  prog?: number;
  color?: string;
}

export function drawBrushStroke(
  ctx: CanvasRenderingContext2D,
  pts: [number, number][],
  opts: StrokeOpts = {}
): void {
  const {
    w0 = 14,
    w1 = 4,
    a0 = 0.85,
    a1 = 0.65,
    dry = 0,
    jit = 2.5,
    seed = 1,
    prog = 1,
    color = "0,0,0",
  } = opts;
  if (pts.length < 2 || prog <= 0) return;

  const N = makeNoise(seed);
  const steps = Math.max(10, Math.floor(pts.length * 16 * clamp(prog)));
  const total = pts.length - 1;
  const sample = (t: number): [number, number] => {
    const s = clamp(t) * total;
    const i = Math.min(total - 1, s | 0);
    const f = s - i;
    return [
      lerp(pts[i][0], pts[i + 1][0], f),
      lerp(pts[i][1], pts[i + 1][1], f),
    ];
  };

  ctx.save();
  for (let k = 0; k < steps; k++) {
    const t = (k / steps) * clamp(prog);
    const [x, y] = sample(t);
    const [x2, y2] = sample(Math.min(1, t + 0.01));
    const ang = Math.atan2(y2 - y, x2 - x);
    const env = Math.sin(Math.pow(t, 0.7) * Math.PI);
    const w = lerp(w0, w1, t) * (0.45 + 0.75 * env) * (0.8 + 0.4 * N.n2(t * 9, 1.3));
    const jx = (N.n2(t * 14, 3.1) - 0.5) * jit * 2;
    const jy = (N.n2(t * 14, 7.7) - 0.5) * jit * 2;

    if (dry > 0 && N.n2(t * 32, 5.2) < dry * (0.3 + 0.7 * t)) continue;
    const a = lerp(a0, a1, t) * (0.75 + 0.25 * N.n2(t * 18, 2.2));

    if (dry > 0.25) {
      const hairs = 6;
      const nx = -Math.sin(ang);
      const ny = Math.cos(ang);
      for (let b = 0; b < hairs; b++) {
        if (N.n2(t * 40 + b * 3, b * 1.7) < dry * 0.65) continue;
        const off = (b / (hairs - 1) - 0.5) * w * 1.5;
        ctx.fillStyle = `rgba(${color},${(a * 0.55).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(x + jx + nx * off, y + jy + ny * off, Math.max(0.8, w * 0.16), 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      ctx.fillStyle = `rgba(${color},${(a * 0.36).toFixed(3)})`;
      ctx.beginPath();
      ctx.ellipse(x + jx, y + jy, w * 0.68, w * 0.44, ang, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

export function drawInkBlot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  a: number = 0.5,
  seed: number = 1,
  rgb: string = "0,0,0"
): void {
  if (r <= 0.5 || a <= 0.002) return;
  const N = makeNoise(seed);
  ctx.save();
  ctx.globalAlpha = clamp(a);
  ctx.fillStyle = `rgb(${rgb})`;
  ctx.beginPath();
  const M = 44;
  for (let i = 0; i <= M; i++) {
    const th = (i / M) * Math.PI * 2;
    const rad =
      r *
      (0.68 +
        0.5 * N.fbm(Math.cos(th) * 1.8 + seed, Math.sin(th) * 1.8 + seed, 3));
    const px = x + Math.cos(th) * rad;
    const py = y + Math.sin(th) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// ── SHAN-SHUI DISTANT MISTY MOUNTAINS ──
export function drawShanShuiRidge(
  wetCtx: CanvasRenderingContext2D,
  W: number,
  H: number,
  yBase: number,
  amp: number,
  inkAlpha: number,
  seed: number,
  scrollX: number = 0
): void {
  const N = makeNoise(seed);
  wetCtx.save();
  const grad = wetCtx.createLinearGradient(0, yBase - amp, 0, yBase + amp * 1.5);
  grad.addColorStop(0, `rgba(0,0,0,${(inkAlpha * 0.92).toFixed(3)})`);
  grad.addColorStop(0.55, `rgba(0,0,0,${(inkAlpha * 0.35).toFixed(3)})`);
  grad.addColorStop(1, "rgba(0,0,0,0)");
  wetCtx.fillStyle = grad;

  wetCtx.beginPath();
  wetCtx.moveTo(-20, H + 20);
  const step = 12;
  for (let x = -20; x <= W + 20; x += step) {
    const nx = (x + scrollX) * 0.0022;
    const y =
      yBase -
      N.fbm(nx, seed * 0.37, 4) * amp +
      Math.sin(nx * 2.1 + seed) * (amp * 0.18);
    wetCtx.lineTo(x, y);
  }
  wetCtx.lineTo(W + 20, H + 20);
  wetCtx.closePath();
  wetCtx.fill();
  wetCtx.restore();
}

// ── HAND-CARVED CINNABAR VERMILION SEAL (ZHUWEN / BAIWEN) ──
export function carveSealCanvas(chars: string = "可成", size: number = 148): HTMLCanvasElement {
  const cv = document.createElement("canvas");
  cv.width = size;
  cv.height = size;
  const c = cv.getContext("2d")!;
  const N = makeNoise(902);
  const pad = size * 0.08;
  const s = size - pad * 2;

  c.fillStyle = "#B02E22";
  // Rough carved stone border
  const seg = 64;
  c.beginPath();
  for (let i = 0; i <= seg; i++) {
    const u = i / seg;
    let x = 0;
    let y = 0;
    if (u < 0.25) {
      x = u * 4 * s;
      y = 0;
    } else if (u < 0.5) {
      x = s;
      y = (u - 0.25) * 4 * s;
    } else if (u < 0.75) {
      x = (1 - (u - 0.5) * 4) * s;
      y = s;
    } else {
      x = 0;
      y = (1 - (u - 0.75) * 4) * s;
    }
    const jx = (N.fbm(u * 25, 1.1, 3) - 0.5) * size * 0.04;
    const jy = (N.fbm(u * 25, 6.7, 3) - 0.5) * size * 0.04;
    if (i === 0) c.moveTo(pad + x + jx, pad + y + jy);
    else c.lineTo(pad + x + jx, pad + y + jy);
  }
  c.closePath();
  c.fill();

  // Inner carved cavity (Zhuwen relief characters)
  c.save();
  c.globalCompositeOperation = "destination-out";
  const inPad = pad + size * 0.075;
  const inS = size - inPad * 2;
  c.fillStyle = "#000";
  c.fillRect(inPad, inPad, inS, inS);
  c.restore();

  // Draw classical seal characters
  c.save();
  c.fillStyle = "#B02E22";
  c.textAlign = "center";
  c.textBaseline = "middle";
  const chArr = Array.from(chars).slice(0, 4);
  if (chArr.length === 1) {
    c.font = `bold ${Math.round(size * 0.54)}px "Noto Serif TC", "STKaiti", "KaiTi", serif`;
    c.fillText(chArr[0], size / 2, size / 2 + size * 0.02);
  } else if (chArr.length === 2) {
    c.font = `bold ${Math.round(size * 0.36)}px "Noto Serif TC", "STKaiti", "KaiTi", serif`;
    c.fillText(chArr[0], size / 2, size * 0.34);
    c.fillText(chArr[1], size / 2, size * 0.67);
  } else {
    c.font = `bold ${Math.round(size * 0.28)}px "Noto Serif TC", "STKaiti", "KaiTi", serif`;
    c.fillText(chArr[0] || "", size * 0.65, size * 0.35);
    c.fillText(chArr[1] || "", size * 0.65, size * 0.66);
    c.fillText(chArr[2] || "", size * 0.35, size * 0.35);
    c.fillText(chArr[3] || "", size * 0.35, size * 0.66);
  }
  c.restore();

  // Weathering / stone chips
  const id = c.getImageData(0, 0, size, size);
  const d = id.data;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      if (d[idx + 3] === 0) continue;
      const gn = N.fbm(x * 0.14, y * 0.14, 3);
      if (gn < 0.3) d[idx + 3] = 0;
      else if (gn < 0.45) d[idx + 3] = Math.round(d[idx + 3] * ((gn - 0.3) / 0.15));
    }
  }
  c.putImageData(id, 0, 0);
  return cv;
}

// ── CLIENT-SIDE CARD IMAGE DECOMPOSER INTO INK-WASH LAYERS (WET, DRY, COL) ──
const decomposedCache = new Map<string, DecomposedCardInk>();

export async function decomposeCardToInkLayers(imgUrl: string): Promise<DecomposedCardInk | null> {
  if (decomposedCache.has(imgUrl)) {
    return decomposedCache.get(imgUrl)!;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const TW = 420;
        const TH = 620;

        // Crop inner artwork region to exclude outer dark frame and bottom title plaque
        const sw = img.naturalWidth || 400;
        const sh = img.naturalHeight || 640;
        const sx = Math.round(sw * 0.07);
        const sy = Math.round(sh * 0.09);
        const sWidth = Math.round(sw * 0.86);
        const sHeight = Math.round(sh * 0.68);

        const srcCv = document.createElement("canvas");
        srcCv.width = TW;
        srcCv.height = TH;
        const srcCtx = srcCv.getContext("2d")!;
        srcCtx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, TW, TH);

        const srcData = srcCtx.getImageData(0, 0, TW, TH).data;

        const wetCv = document.createElement("canvas");
        const dryCv = document.createElement("canvas");
        const colCv = document.createElement("canvas");
        wetCv.width = dryCv.width = colCv.width = TW;
        wetCv.height = dryCv.height = colCv.height = TH;

        const wetCtx = wetCv.getContext("2d")!;
        const dryCtx = dryCv.getContext("2d")!;
        const colCtx = colCv.getContext("2d")!;

        const wetId = wetCtx.createImageData(TW, TH);
        const dryId = dryCtx.createImageData(TW, TH);
        const colId = colCtx.createImageData(TW, TH);

        const wD = wetId.data;
        const dD = dryId.data;
        const cD = colId.data;

        const lum = new Float32Array(TW * TH);
        const vig = new Float32Array(TW * TH);

        for (let y = 0; y < TH; y++) {
          const ny = (y / TH - 0.5) * 2;
          for (let x = 0; x < TW; x++) {
            const nx = (x / TW - 0.5) * 2;
            const p = y * TW + x;
            const idx = p * 4;
            const r = srcData[idx];
            const g = srcData[idx + 1];
            const b = srcData[idx + 2];
            lum[p] = 0.299 * r + 0.587 * g + 0.114 * b;

            // Organic brush-wash vignette mask
            const dist = Math.sqrt(nx * nx * 1.08 + ny * ny * 1.04);
            const nVal = (defaultNoise.fbm(x * 0.018, y * 0.018, 3) - 0.5) * 0.28;
            const mask = 1 - smooth(0.54, 0.96, dist + nVal);
            vig[p] = clamp(mask, 0, 1);
          }
        }

        for (let y = 1; y < TH - 1; y++) {
          for (let x = 1; x < TW - 1; x++) {
            const p = y * TW + x;
            const idx = p * 4;
            const vMask = vig[p];
            if (vMask <= 0.005) continue;

            const r = srcData[idx];
            const g = srcData[idx + 1];
            const b = srcData[idx + 2];
            const L = lum[p];

            // Sobel gradient for dry brushwork contours (勾勒)
            const gx =
              -lum[p - TW - 1] +
              lum[p - TW + 1] -
              2 * lum[p - 1] +
              2 * lum[p + 1] -
              lum[p + TW - 1] +
              lum[p + TW + 1];
            const gy =
              -lum[p - TW - 1] -
              2 * lum[p - TW] -
              lum[p - TW + 1] +
              lum[p + TW - 1] +
              2 * lum[p + TW] +
              lum[p + TW + 1];
            const edge = Math.min(255, Math.sqrt(gx * gx + gy * gy));

            // 1. Wet ink wash (墨分五色: 5-tone quantized + soft wash)
            const invL = 1 - L / 255;
            const washTone = Math.pow(clamp((invL - 0.12) / 0.78), 1.25);
            const wetAlpha = Math.round(washTone * 165 * vMask);
            wD[idx + 3] = wetAlpha;

            // 2. Dry brush contour (浓墨勾勒)
            const edgeStrength = smooth(32, 135, edge);
            const darkCore = smooth(185, 65, L);
            const dryAlpha = Math.round(
              clamp(edgeStrength * 0.78 + darkCore * 0.42) * 225 * vMask
            );
            dD[idx + 3] = dryAlpha;

            // 3. Vermilion accent (#B02E22 朱砂点染) from warm/red/gold highlights
            const redness = r - Math.max(g * 0.82, b * 1.1);
            if (redness > 26 && r > 95) {
              const colStrength = clamp((redness - 26) / 95);
              cD[idx] = 176;
              cD[idx + 1] = 46;
              cD[idx + 2] = 34;
              cD[idx + 3] = Math.round(colStrength * 195 * vMask);
            }
          }
        }

        wetCtx.putImageData(wetId, 0, 0);
        dryCtx.putImageData(dryId, 0, 0);
        colCtx.putImageData(colId, 0, 0);

        const res = { wet: wetCv, dry: dryCv, col: colCv };
        decomposedCache.set(imgUrl, res);
        resolve(res);
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = imgUrl;
  });
}

// ── HEXAGRAM 6-LINE RENDERER WITH LIVE MOVING-LINE TRANSFORMATION ──
export function drawAnimatedHexagram(
  wetCtx: CanvasRenderingContext2D,
  dryCtx: CanvasRenderingContext2D,
  colCtx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  width: number,
  height: number,
  lines: number[], // [line1..line6] bottom to top (1=Yang, 0=Yin)
  drawProgress: number,
  activeChangingLine?: number, // 1..6 if currently transforming
  transformProgress: number = 0, // 0..1
  highlightLines: number[] = []
): void {
  const lineSpacing = height / 5.4;
  const bottomY = cy + height * 0.46;

  for (let i = 0; i < 6; i++) {
    const lineNum = i + 1;
    const lp = clamp(drawProgress * 6 - i);
    if (lp <= 0) continue;

    const y = bottomY - i * lineSpacing;
    const isValYang = lines[i] === 1;
    const isChangingNow = activeChangingLine === lineNum;
    const isHighlighted = highlightLines.includes(lineNum) || isChangingNow;
    const x0 = cx - width * 0.5;
    const x1 = cx + width * 0.5;
    const gapHalf = width * 0.11;

    if (isChangingNow && transformProgress > 0.01) {
      const tp = easeInOut(transformProgress);
      if (isValYang) {
        // Yang (⚊) splitting into Yin (⚏) with vermilion glow
        const curGap = gapHalf * tp;
        if (curGap < width * 0.02) {
          drawBrushStroke(dryCtx, [[x0, y], [x1, y]], {
            w0: 15,
            w1: 13,
            seed: 200 + i,
            prog: 1,
          });
        } else {
          drawBrushStroke(dryCtx, [[x0, y], [cx - curGap, y]], {
            w0: 15,
            w1: 12,
            seed: 210 + i,
            prog: 1,
          });
          drawBrushStroke(dryCtx, [[cx + curGap, y], [x1, y]], {
            w0: 12,
            w1: 15,
            seed: 220 + i,
            prog: 1,
          });
        }
        // Vermilion energy burst at split center
        drawInkBlot(colCtx, cx, y, 16 * Math.sin(tp * Math.PI) + 6, 0.72, 300 + i, "176,46,34");
      } else {
        // Yin (⚏) fusing into Yang (⚊) via flying-white vermilion/ink bridge
        drawBrushStroke(dryCtx, [[x0, y], [cx - gapHalf, y]], {
          w0: 15,
          w1: 12,
          seed: 230 + i,
          prog: 1,
        });
        drawBrushStroke(dryCtx, [[cx + gapHalf, y], [x1, y]], {
          w0: 12,
          w1: 15,
          seed: 240 + i,
          prog: 1,
        });
        // Flying-white stroke bridging the gap
        drawBrushStroke(dryCtx, [[x0, y], [x1, y]], {
          w0: 17,
          w1: 13,
          dry: 0.35 * (1 - tp * 0.5),
          seed: 250 + i,
          prog: tp,
        });
        drawBrushStroke(colCtx, [[cx - gapHalf * 1.4, y], [cx + gapHalf * 1.4, y]], {
          w0: 14,
          w1: 10,
          seed: 260 + i,
          prog: tp,
          color: "176,46,34",
        });
      }
    } else {
      // Normal static or progressive drawing of Yang / Yin line
      if (isValYang) {
        drawBrushStroke(wetCtx, [[x0, y], [x1, y]], {
          w0: 18,
          w1: 15,
          a0: 0.42,
          a1: 0.35,
          seed: 100 + i,
          prog: lp,
        });
        drawBrushStroke(dryCtx, [[x0, y], [x1, y]], {
          w0: 14,
          w1: 12,
          a0: 0.9,
          a1: 0.8,
          dry: 0.18,
          seed: 110 + i,
          prog: lp,
        });
      } else {
        const pLeft = clamp(lp * 2);
        const pRight = clamp(lp * 2 - 1);
        drawBrushStroke(wetCtx, [[x0, y], [cx - gapHalf, y]], {
          w0: 17,
          w1: 14,
          a0: 0.42,
          a1: 0.35,
          seed: 120 + i,
          prog: pLeft,
        });
        drawBrushStroke(dryCtx, [[x0, y], [cx - gapHalf, y]], {
          w0: 14,
          w1: 11,
          a0: 0.9,
          a1: 0.8,
          seed: 130 + i,
          prog: pLeft,
        });
        if (pRight > 0) {
          drawBrushStroke(wetCtx, [[cx + gapHalf, y], [x1, y]], {
            w0: 14,
            w1: 17,
            a0: 0.35,
            a1: 0.42,
            seed: 140 + i,
            prog: pRight,
          });
          drawBrushStroke(dryCtx, [[cx + gapHalf, y], [x1, y]], {
            w0: 11,
            w1: 14,
            a0: 0.8,
            a1: 0.9,
            seed: 150 + i,
            prog: pRight,
          });
        }
      }

      if (isHighlighted && lp > 0.8) {
        drawInkBlot(colCtx, x1 + 18, y, 7, 0.78, 400 + i, "176,46,34");
      }
    }
  }
}

// ── BUILD STRUCTURED FILM PLAN FROM ANY DRAWN CARDS ──
export function buildInkWashFilmPlan(
  rawCards: InkWashCardInput[],
  mode: string,
  question: string,
  customSealChars?: string,
  customConclusion?: string
): InkWashFilmPlan {
  const cleanQ = question.trim() || "Xin chỉ điểm vận trình và lời khuyên hành động?";

  // Arrange cards in Tháp La reading order if mode is thap_la:
  // [Quẻ Chủ (cards[0]), ...Hào Động (cards.slice(2)), Quẻ Biến (cards[1])]
  let orderedCards: InkWashCardInput[] = [];
  let primaryHex = HEXAGRAMS.find((h) => h.number === rawCards[0]?.hexNumber) || HEXAGRAMS[48];
  let transformedHex = primaryHex;
  let changingLines: number[] = [];

  if ((mode === "thap_la" || mode === "thapla") && rawCards.length >= 2) {
    const priCard = rawCards[0];
    const transCard = rawCards[1];
    const yaoCards = rawCards.slice(2);
    primaryHex = HEXAGRAMS.find((h) => h.number === priCard.hexNumber) || HEXAGRAMS[0];
    transformedHex = HEXAGRAMS.find((h) => h.number === transCard.hexNumber) || primaryHex;
    changingLines = yaoCards
      .map((y) => y.yaoNumber || 0)
      .filter((n) => n >= 1 && n <= 6);

    orderedCards = [priCard, ...yaoCards, transCard];
  } else {
    orderedCards = rawCards.length > 0 ? [...rawCards] : [];
    if (orderedCards.length > 0) {
      primaryHex = HEXAGRAMS.find((h) => h.number === orderedCards[0].hexNumber) || HEXAGRAMS[0];
      const lastCard = orderedCards[orderedCards.length - 1];
      transformedHex = HEXAGRAMS.find((h) => h.number === lastCard.hexNumber) || primaryHex;
      changingLines = orderedCards
        .filter((c) => c.type === "yao" && c.yaoNumber)
        .map((c) => c.yaoNumber!);
    }
  }

  const shots: InkWashShotInfo[] = [];
  const narrationCues: InkWashNarrationCue[] = [];
  let cursor = 0;

  const roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

  orderedCards.forEach((card, idx) => {
    const cardNum = idx + 1;
    const dur = idx === 0 ? 9.5 : card.type === "yao" ? 9.0 : 8.5;
    const startSec = cursor;
    const endSec = cursor + dur;
    cursor = endSec;

    const hexObj = HEXAGRAMS.find((h) => h.number === card.hexNumber) || primaryHex;
    let roleLabel = card.positionLabel || `Lá ${cardNum}`;
    if (mode === "thap_la" || mode === "thapla") {
      if (idx === 0) roleLabel = "Bản Quái · Định Vị Bối Cảnh";
      else if (idx === orderedCards.length - 1) roleLabel = "Biến Quái · Định Hướng Tương Lai";
      else roleLabel = `Hào Động ${idx} · Hào ${card.yaoNumber || idx}`;
    }

    shots.push({
      index: idx,
      title: `${roman[idx] || idx + 1}. Lá ${cardNum} — ${card.name}`,
      subtitle: roleLabel,
      startSec,
      endSec,
      cardIndex: idx,
    });

    // Build concise poetic subtitle + speech cue (using "Lá bài số..." to prevent TTS bug)
    let cue1Text = "";
    let cue2Text = "";

    if (idx === 0) {
      cue1Text = `Lá ${cardNum} · ${roleLabel}: ${hexObj.name} (${hexObj.hanzi || ""}).`;
      cue2Text = `${hexObj.judgment || hexObj.overview || card.desc}`.slice(0, 145);
    } else if (card.type === "yao" && card.yaoNumber) {
      const lm = hexObj.lineMeanings?.find((m) => m.line === card.yaoNumber);
      const isYang = hexObj.lines[card.yaoNumber - 1] === 1;
      cue1Text = `Lá ${cardNum} · Hào ${card.yaoNumber} (${isYang ? "Dương biến Âm" : "Âm biến Dương"}): ${lm?.text || card.name}.`;
      cue2Text = `${lm?.meaning || card.desc}`.slice(0, 145);
    } else {
      cue1Text = `Lá ${cardNum} · ${roleLabel}: ${hexObj.name} (${hexObj.hanzi || ""}).`;
      cue2Text = `${hexObj.advice || hexObj.overview || hexObj.judgment || card.desc}`.slice(0, 145);
    }

    narrationCues.push({
      id: `card_${cardNum}_a`,
      startSec: startSec + 0.5,
      endSec: startSec + dur * 0.46,
      text: cue1Text,
      speakText: cue1Text.replace(/^Lá\s+(\d+)/, `Lá bài số $1`),
    });
    narrationCues.push({
      id: `card_${cardNum}_b`,
      startSec: startSec + dur * 0.48,
      endSec: endSec - 0.3,
      text: cue2Text,
      speakText: cue2Text,
    });
  });

  // Final Shot: Full Spread Overview & Cinnabar Vermilion Seal Verdict
  const finalStart = cursor;
  const finalDur = 9.0;
  const finalEnd = finalStart + finalDur;
  const sealTimeSec = finalStart + 3.2;

  const autoConclusion =
    customConclusion?.trim() ||
    `Đúc kết cho câu hỏi "${cleanQ}": Từ ${primaryHex.name} chuyển sang ${transformedHex.name}, ${
      transformedHex.advice || primaryHex.advice || "hãy giữ tâm trung chính,审thời độ thế, chuẩn bị thấu đáo ắt thành công đại cát."
    }`;

  const defaultSeal =
    customSealChars?.trim() ||
    (transformedHex.omen.includes("Cát") ? "可成" : transformedHex.omen.includes("Hung") ? "慎行" : "中正");

  shots.push({
    index: orderedCards.length,
    title: `${roman[orderedCards.length] || orderedCards.length + 1}. Châu Ấn Kết Luận — Toàn Cảnh Trận Pháp`,
    subtitle: `Ấn Chu Sa: ${defaultSeal} · Giải Đáp Tâm Niệm`,
    startSec: finalStart,
    endSec: finalEnd,
  });

  narrationCues.push({
    id: "final_verdict_a",
    startSec: finalStart + 0.4,
    endSec: finalStart + 4.2,
    text: `Toàn cảnh ${orderedCards.length} lá bài khép lại. Châu ấn "${defaultSeal}" chính thức hạ xuống.`,
    speakText: `Toàn cảnh ${orderedCards.length} lá bài khép lại. Châu ấn chính thức hạ xuống.`,
  });
  narrationCues.push({
    id: "final_verdict_b",
    startSec: finalStart + 4.4,
    endSec: finalEnd - 0.3,
    text: autoConclusion.slice(0, 165),
    speakText: autoConclusion.slice(0, 165),
  });

  return {
    totalDurationSec: finalEnd,
    shots,
    narrationCues,
    sealTimeSec,
    sealChars: defaultSeal,
    orderedCards,
    primaryLines: [...primaryHex.lines],
    transformedLines: [...transformedHex.lines],
    changingLines,
    question: cleanQ,
    conclusionText: autoConclusion,
  };
}

// ── MAIN INK-WASH COMPOSITOR & FRAME RENDERER ──
export class InkWashRenderer {
  private outCanvas: HTMLCanvasElement;
  private wetCv: HTMLCanvasElement;
  private dryCv: HTMLCanvasElement;
  private colCv: HTMLCanvasElement;
  private paperCv: HTMLCanvasElement;
  private wetCtx: CanvasRenderingContext2D;
  private dryCtx: CanvasRenderingContext2D;
  private colCtx: CanvasRenderingContext2D;
  private outCtx: CanvasRenderingContext2D;
  private sealCv: HTMLCanvasElement;
  private currentSealChars: string = "";

  constructor(canvas: HTMLCanvasElement) {
    this.outCanvas = canvas;
    this.outCtx = canvas.getContext("2d")!;

    this.wetCv = document.createElement("canvas");
    this.dryCv = document.createElement("canvas");
    this.colCv = document.createElement("canvas");
    this.paperCv = document.createElement("canvas");

    this.wetCtx = this.wetCv.getContext("2d")!;
    this.dryCtx = this.dryCv.getContext("2d")!;
    this.colCtx = this.colCv.getContext("2d")!;
    this.sealCv = carveSealCanvas("可成", 148);
    this.resize(canvas.width || 1280, canvas.height || 720);
  }

  public resize(W: number, H: number): void {
    this.outCanvas.width = W;
    this.outCanvas.height = H;
    this.wetCv.width = this.dryCv.width = this.colCv.width = this.paperCv.width = W;
    this.wetCv.height = this.dryCv.height = this.colCv.height = this.paperCv.height = H;
    this.buildXuanPaperTexture(W, H);
  }

  private buildXuanPaperTexture(W: number, H: number): void {
    const ctx = this.paperCv.getContext("2d")!;
    const N = makeNoise(4925);

    // Base warm raw Xuan paper gradient (#EAE3D2 -> #DFD6C0)
    const bg = ctx.createRadialGradient(W * 0.5, H * 0.48, W * 0.1, W * 0.5, H * 0.5, Math.max(W, H) * 0.72);
    bg.addColorStop(0, "#EFE9DA");
    bg.addColorStop(0.68, "#E8E0CE");
    bg.addColorStop(1, "#D8CEB8");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Subtle mulberry fiber texture & age spots
    ctx.save();
    for (let i = 0; i < 220; i++) {
      const x = N.R() * W;
      const y = N.R() * H;
      const len = 14 + N.R() * 38;
      const ang = N.R() * Math.PI * 2;
      ctx.strokeStyle = i % 3 === 0 ? "rgba(255,252,244,0.22)" : "rgba(165,148,118,0.12)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
      ctx.stroke();
    }
    ctx.restore();
  }

  public renderFrame(
    timeSec: number,
    plan: InkWashFilmPlan,
    decomposedMap: Map<string, DecomposedCardInk>
  ): void {
    const W = this.outCanvas.width;
    const H = this.outCanvas.height;
    const isPortrait = H > W;

    if (plan.sealChars !== this.currentSealChars) {
      this.currentSealChars = plan.sealChars;
      this.sealCv = carveSealCanvas(plan.sealChars, 156);
    }

    this.wetCtx.clearRect(0, 0, W, H);
    this.dryCtx.clearRect(0, 0, W, H);
    this.colCtx.clearRect(0, 0, W, H);

    // Find active shot
    const shot =
      plan.shots.find((s) => timeSec >= s.startSec && timeSec <= s.endSec) ||
      plan.shots[plan.shots.length - 1];
    const shotDur = Math.max(0.1, shot.endSec - shot.startSec);
    const u = clamp((timeSec - shot.startSec) / shotDur);

    // 1. Background Shan-Shui distant misty mountain ridges (always breathing gently)
    drawShanShuiRidge(this.wetCtx, W, H, H * 0.78, H * 0.22, 0.14, 11 + shot.index * 3, timeSec * 12);
    drawShanShuiRidge(this.wetCtx, W, H, H * 0.88, H * 0.16, 0.22, 29 + shot.index * 5, -timeSec * 8);

    const isFinalShot = shot.cardIndex === undefined;

    if (!isFinalShot && shot.cardIndex !== undefined) {
      // ── INDIVIDUAL CARD SHOT (BẢN QUÁI / HÀO ĐỘNG / BIẾN QUÁI) ──
      const card = plan.orderedCards[shot.cardIndex];
      const decomp = card ? decomposedMap.get(card.img) : undefined;
      const hexObj = HEXAGRAMS.find((h) => h.number === card?.hexNumber) || HEXAGRAMS[0];

      // Determine which 6 lines to show and whether a line is actively transforming
      const isLastCard = shot.cardIndex === plan.orderedCards.length - 1 && plan.orderedCards.length > 1;
      const linesToDraw = isLastCard ? plan.transformedLines : plan.primaryLines;
      const activeYao = card?.type === "yao" ? card.yaoNumber : undefined;
      const drawProg = smooth(0.02, 0.42, u);
      const transProg = activeYao ? smooth(0.28, 0.72, u) : 0;

      // Layout coordinates for 16:9 vs 9:16
      const hexCx = isPortrait ? W * 0.28 : W * 0.27;
      const hexCy = isPortrait ? H * 0.42 : H * 0.46;
      const hexW = isPortrait ? W * 0.32 : W * 0.22;
      const hexH = isPortrait ? H * 0.24 : H * 0.38;

      drawAnimatedHexagram(
        this.wetCtx,
        this.dryCtx,
        this.colCtx,
        hexCx,
        hexCy,
        hexW,
        hexH,
        linesToDraw,
        drawProg,
        activeYao,
        transProg,
        plan.changingLines
      );

      // Draw decomposed Ink-Wash Card Illustration on the right/center
      if (decomp) {
        const cardAppear = easeOut(smooth(0.08, 0.45, u));
        const scale = (isPortrait ? W * 0.52 : H * 0.64) / decomp.wet.height;
        const dw = decomp.wet.width * scale * (0.96 + 0.04 * cardAppear);
        const dh = decomp.wet.height * scale * (0.96 + 0.04 * cardAppear);
        const dx = (isPortrait ? W * 0.66 : W * 0.63) - dw * 0.5;
        const dy = (isPortrait ? H * 0.42 : H * 0.45) - dh * 0.5;

        this.wetCtx.save();
        this.wetCtx.globalAlpha = cardAppear * 0.88;
        this.wetCtx.drawImage(decomp.wet, dx, dy, dw, dh);
        this.wetCtx.restore();

        this.dryCtx.save();
        this.dryCtx.globalAlpha = smooth(0.16, 0.55, u) * 0.94;
        this.dryCtx.drawImage(decomp.dry, dx, dy, dw, dh);
        this.dryCtx.restore();

        this.colCtx.save();
        this.colCtx.globalAlpha = smooth(0.24, 0.65, u) * 0.92;
        this.colCtx.drawImage(decomp.col, dx, dy, dw, dh);
        this.colCtx.restore();
      }

      // Draw vertical calligraphy & card title header
      this.drawShotCalligraphy(
        W,
        H,
        isPortrait,
        `LÁ BÀI SỐ ${shot.cardIndex + 1}`,
        card?.name || hexObj.name,
        shot.subtitle,
        hexObj.hanzi || card?.symbol || "易",
        u
      );
    } else {
      // ── FINAL SHOT: FULL THÁP LA SPREAD OVERVIEW + VERMILION SEAL STAMP ──
      const count = plan.orderedCards.length;
      const cols = Math.min(4, Math.max(2, count));
      const cardW = isPortrait ? W * 0.36 : Math.min(W * 0.18, (W * 0.72) / cols);
      const cardH = cardW * (620 / 420);

      plan.orderedCards.forEach((c, idx) => {
        const decomp = decomposedMap.get(c.img);
        if (!decomp) return;
        const appear = easeOut(smooth(0.04 * idx, 0.35 + 0.05 * idx, u));
        let cx = W * 0.5;
        let cy = H * 0.42;

        if (isPortrait) {
          const r = Math.floor(idx / 2);
          const col = idx % 2;
          cx = W * (col === 0 ? 0.3 : 0.7);
          cy = H * (0.26 + r * 0.24);
        } else {
          const totalSpan = (count - 1) * (cardW * 1.12);
          cx = W * 0.45 - totalSpan * 0.5 + idx * (cardW * 1.12);
          cy = H * 0.44 + (idx % 2 === 1 ? 12 : -12);
        }

        const dx = cx - cardW * 0.5;
        const dy = cy - cardH * 0.5;

        this.wetCtx.save();
        this.wetCtx.globalAlpha = appear * 0.82;
        this.wetCtx.drawImage(decomp.wet, dx, dy, cardW, cardH);
        this.wetCtx.restore();

        this.dryCtx.save();
        this.dryCtx.globalAlpha = appear * 0.9;
        this.dryCtx.drawImage(decomp.dry, dx, dy, cardW, cardH);
        this.dryCtx.restore();

        this.colCtx.save();
        this.colCtx.globalAlpha = appear * 0.88;
        this.colCtx.drawImage(decomp.col, dx, dy, cardW, cardH);
        this.colCtx.restore();
      });

      this.drawShotCalligraphy(
        W,
        H,
        isPortrait,
        "CHÂU ẤN ĐÚC KẾT",
        plan.question.slice(0, 52),
        shot.subtitle,
        plan.sealChars,
        u
      );

      // Stamp the hand-carved Cinnabar Vermilion Seal
      if (timeSec >= plan.sealTimeSec) {
        const sp = clamp((timeSec - plan.sealTimeSec) / 0.32);
        const scale = sp < 1 ? 1.55 - 0.55 * easeOut(sp) : 1.0;
        const sealSize = (isPortrait ? W * 0.22 : H * 0.21) * scale;
        const sx = isPortrait ? W * 0.78 : W * 0.84;
        const sy = isPortrait ? H * 0.68 : H * 0.46;

        this.colCtx.save();
        this.colCtx.translate(sx, sy);
        this.colCtx.rotate(-0.04);
        this.colCtx.globalAlpha = clamp(sp * 1.35) * 0.94;
        this.colCtx.drawImage(this.sealCv, -sealSize * 0.5, -sealSize * 0.5, sealSize, sealSize);
        this.colCtx.restore();
      }
    }

    // ── COMPOSITE WET (SOFT INK BLEED) + DRY (CRISP BRUSH) + COL (VERMILION) ONTO XUAN PAPER ──
    this.outCtx.clearRect(0, 0, W, H);
    this.outCtx.drawImage(this.paperCv, 0, 0);

    // Wet layer with soft Gaussian ink diffusion into Xuan paper fibers
    this.outCtx.save();
    this.outCtx.filter = "blur(2.6px)";
    this.outCtx.globalAlpha = 0.86;
    this.outCtx.drawImage(this.wetCv, 0, 0);
    this.outCtx.restore();

    // Dry layer (crisp dark ink strokes)
    this.outCtx.save();
    this.outCtx.globalAlpha = 0.94;
    this.outCtx.drawImage(this.dryCv, 0, 0);
    this.outCtx.restore();

    // Vermilion cinnabar layer (#B02E22)
    this.outCtx.save();
    this.outCtx.globalAlpha = 0.95;
    this.outCtx.drawImage(this.colCv, 0, 0);
    this.outCtx.restore();

    // Deckle paper edge vignette
    const vig = this.outCtx.createRadialGradient(
      W * 0.5,
      H * 0.5,
      Math.min(W, H) * 0.36,
      W * 0.5,
      H * 0.5,
      Math.max(W, H) * 0.74
    );
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(42,32,20,0.22)");
    this.outCtx.fillStyle = vig;
    this.outCtx.fillRect(0, 0, W, H);

    // Render active subtitle cue at bottom
    const activeCue = plan.narrationCues.find(
      (c) => timeSec >= c.startSec && timeSec <= c.endSec
    );
    if (activeCue) {
      this.drawSubtitleCue(W, H, isPortrait, activeCue, timeSec);
    }
  }

  private drawShotCalligraphy(
    W: number,
    H: number,
    isPortrait: boolean,
    badge: string,
    title: string,
    subtitle: string,
    hanziWatermark: string,
    u: number
  ): void {
    const fade = smooth(0.0, 0.16, u) * (1 - smooth(0.9, 1.0, u));
    if (fade <= 0.01) return;

    // Large translucent Hanzi watermark in background
    this.wetCtx.save();
    this.wetCtx.globalAlpha = fade * 0.085;
    this.wetCtx.fillStyle = "#1B1712";
    this.wetCtx.font = `bold ${Math.round(Math.min(W, H) * 0.34)}px "Noto Serif TC", "STKaiti", serif`;
    this.wetCtx.textAlign = "center";
    this.wetCtx.textBaseline = "middle";
    this.wetCtx.fillText(hanziWatermark.slice(0, 2), W * 0.5, H * 0.42);
    this.wetCtx.restore();

    // Top-left classical title block
    this.dryCtx.save();
    this.dryCtx.globalAlpha = fade * 0.94;
    const padX = isPortrait ? W * 0.06 : W * 0.055;
    const padY = isPortrait ? H * 0.065 : H * 0.085;

    // Vermilion pill tag
    this.colCtx.save();
    this.colCtx.globalAlpha = fade * 0.92;
    this.colCtx.fillStyle = "#B02E22";
    this.colCtx.font = `bold ${Math.round(Math.min(W, H) * 0.022)}px "Noto Serif", serif`;
    this.colCtx.fillText(`印 ${badge} · ${subtitle}`, padX, padY);
    this.colCtx.restore();

    this.dryCtx.fillStyle = "#1A1510";
    this.dryCtx.font = `bold ${Math.round(Math.min(W, H) * 0.038)}px "Noto Serif", Georgia, serif`;
    this.dryCtx.fillText(title, padX, padY + Math.min(W, H) * 0.046);
    this.dryCtx.restore();
  }

  private drawSubtitleCue(
    W: number,
    H: number,
    isPortrait: boolean,
    cue: InkWashNarrationCue,
    timeSec: number
  ): void {
    const dur = Math.max(0.2, cue.endSec - cue.startSec);
    const localT = (timeSec - cue.startSec) / dur;
    const alpha = smooth(0, 0.12, localT) * (1 - smooth(0.88, 1.0, localT));
    if (alpha <= 0.01) return;

    const ctx = this.outCtx;
    ctx.save();
    ctx.globalAlpha = alpha;

    const fontSize = Math.round(isPortrait ? W * 0.034 : H * 0.033);
    ctx.font = `600 ${fontSize}px "Noto Serif", Georgia, serif`;
    const maxW = W * 0.84;

    // Wrap text into 1-2 lines
    const words = cue.text.split(" ");
    const lines: string[] = [];
    let currentLine = "";
    for (const w of words) {
      const test = currentLine ? `${currentLine} ${w}` : w;
      if (ctx.measureText(test).width > maxW && currentLine) {
        lines.push(currentLine);
        currentLine = w;
      } else {
        currentLine = test;
      }
    }
    if (currentLine) lines.push(currentLine);

    const lineH = fontSize * 1.42;
    const boxH = lines.length * lineH + fontSize * 0.9;
    const boxY = H - boxH - (isPortrait ? H * 0.055 : H * 0.048);

    // Subtle Xuan-paper frosted backing strip for subtitle legibility
    const grad = ctx.createLinearGradient(0, boxY - 12, 0, boxY + boxH + 12);
    grad.addColorStop(0, "rgba(238,231,215,0)");
    grad.addColorStop(0.2, "rgba(238,231,215,0.86)");
    grad.addColorStop(0.85, "rgba(232,224,206,0.92)");
    grad.addColorStop(1, "rgba(232,224,206,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, boxY - 12, W, boxH + 24);

    // Thin vermilion hairline rule above subtitle
    ctx.strokeStyle = "rgba(176,46,34,0.45)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W * 0.25, boxY + 2);
    ctx.lineTo(W * 0.75, boxY + 2);
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#18130E";
    lines.forEach((ln, i) => {
      const ly = boxY + fontSize * 0.65 + i * lineH;
      ctx.fillText(ln, W * 0.5, ly);
    });

    ctx.restore();
  }
}
