import {
  convertNumbersToVietnameseWords,
  resolveVietnameseVoiceProfile,
  synthesizeEdgeNeuralChunk,
  synthesizeVoxCpmAnchored,
} from "./utils/edgeNeuralTts";

export interface Env {
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
}

function cleanTextForVietnameseTts(rawText: string): string {
  return convertNumbersToVietnameseWords(rawText || "");
}

function splitTextForTts(rawText: string, maxLen = 175): string[] {
  const cleaned = cleanTextForVietnameseTts(rawText);
  if (!cleaned) return [];

  const rawSentences = cleaned.split(/(?<=[.!?…。；;:\n])\s+|(?=[,，])\s*/);
  const chunks: string[] = [];
  let current = "";

  for (const part of rawSentences) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    if ((current + " " + trimmed).trim().length <= maxLen) {
      current = (current + " " + trimmed).trim();
    } else {
      if (current) chunks.push(current);
      if (trimmed.length <= maxLen) {
        current = trimmed;
      } else {
        const words = trimmed.split(/\s+/);
        current = "";
        for (const w of words) {
          if ((current + " " + w).trim().length <= maxLen) {
            current = (current + " " + w).trim();
          } else {
            if (current) chunks.push(current);
            current = w.slice(0, maxLen);
          }
        }
      }
    }
  }
  if (current) chunks.push(current);
  return chunks.slice(0, 24);
}

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS" && url.pathname.startsWith("/api/")) {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // Cloud Vietnamese TTS MP3 synthesizer (Warm Deep Male I Ching Master voice primary)
    if (url.pathname === "/api/tts") {
      try {
        let text = url.searchParams.get("text") || "";
        let voice = url.searchParams.get("voice") || "nam_tram_am";
        if (request.method === "POST") {
          const body: any = await request.json().catch(() => ({}));
          if (!text) text = body?.text || "";
          if (body?.voice) voice = String(body.voice);
        }

        const cleaned = cleanTextForVietnameseTts(text);
        if (!cleaned) {
          return new Response(JSON.stringify({ error: "Empty text" }), {
            status: 400,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
          });
        }

        const profile = resolveVietnameseVoiceProfile(voice);

        // 1. Optional VoxCPM2 48kHz Anchored Vietnamese Male Voice Cloning
        if (profile.useVoxCpm) {
          const voxMp3 = await synthesizeVoxCpmAnchored(
            cleaned,
            profile.voxControl ||
              "Deep, warm, calm Vietnamese male narrator, resonant baritone voice, steady philosophical I Ching reading pace",
            async () => {
              if (!env.ASSETS) return null;
              const assetUrl = new URL("/assets/test_vi_design.wav", url.origin);
              const assetRes = await env.ASSETS.fetch(new Request(assetUrl.toString()));
              if (!assetRes.ok) return null;
              return new Uint8Array(await assetRes.arrayBuffer());
            }
          );
          if (voxMp3 && voxMp3.byteLength > 800) {
            return new Response(voxMp3 as BodyInit, {
              status: 200,
              headers: {
                ...CORS_HEADERS,
                "Content-Type": "audio/mpeg",
                "X-TTS-Engine": "voxcpm2-test-vi-design",
                "Cache-Control": "public, max-age=3600",
              },
            });
          }
        }

        // 2. Primary: Genuine Microsoft Edge Neural TTS (vi-VN-NamMinhNeural Trầm Ấm -6Hz / Trưởng Lão -10Hz)
        const neuralChunks = splitTextForTts(cleaned, 950);
        const neuralBuffers: Uint8Array[] = [];
        let neuralTotal = 0;
        let neuralOk = true;

        for (const nChunk of neuralChunks) {
          const audio = await synthesizeEdgeNeuralChunk(nChunk, profile);
          if (audio && audio.byteLength > 200) {
            neuralBuffers.push(audio);
            neuralTotal += audio.byteLength;
          } else {
            neuralOk = false;
            break;
          }
        }

        if (neuralOk && neuralTotal > 200) {
          const mergedNeural = new Uint8Array(neuralTotal);
          let off = 0;
          for (const b of neuralBuffers) {
            mergedNeural.set(b, off);
            off += b.byteLength;
          }
          return new Response(mergedNeural.buffer, {
            status: 200,
            headers: {
              ...CORS_HEADERS,
              "Content-Type": "audio/mpeg",
              "X-TTS-Engine": `edge-neural-${profile.edgeVoice}`,
              "Cache-Control": "public, max-age=3600",
            },
          });
        }

        // 3. Fallback: Chunked Vietnamese TTS
        const chunks = splitTextForTts(cleaned, 175);
        const buffers: Uint8Array[] = [];
        let totalLength = 0;

        for (const chunk of chunks) {
          const endpoints = [
            `https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=${encodeURIComponent(chunk)}`,
            `https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=vi&q=${encodeURIComponent(chunk)}`,
          ];
          for (const ttsUrl of endpoints) {
            const res = await fetch(ttsUrl, {
              headers: {
                "User-Agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                Referer: "https://translate.google.com/",
              },
            });
            if (res.ok) {
              const arr = new Uint8Array(await res.arrayBuffer());
              if (arr.byteLength > 0) {
                buffers.push(arr);
                totalLength += arr.byteLength;
                break;
              }
            }
          }
        }

        if (totalLength === 0) {
          return new Response(JSON.stringify({ error: "TTS upstream empty" }), {
            status: 502,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
          });
        }

        const merged = new Uint8Array(totalLength);
        let offset = 0;
        for (const b of buffers) {
          merged.set(b, offset);
          offset += b.byteLength;
        }

        return new Response(merged.buffer, {
          status: 200,
          headers: {
            ...CORS_HEADERS,
            "Content-Type": "audio/mpeg",
            "X-TTS-Engine": "fallback-vi",
            "Cache-Control": "public, max-age=3600",
          },
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err?.message || "TTS error" }), {
          status: 500,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });
      }
    }

    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }
    return new Response("Not Found", { status: 404 });
  },
};
