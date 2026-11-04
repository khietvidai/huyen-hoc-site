import {
  convertNumbersToVietnameseWords,
  resolveVietnameseVoiceProfile,
  synthesizeEdgeNeuralChunk,
  synthesizeVoxCpmAnchored,
} from "./utils/edgeNeuralTts";
import { BOOK_HEXAGRAMS } from "./data/bookHexagrams";

export interface Env {
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
  DEEPSEEK_API_KEY?: string;
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

const TECH_PROBE_REGEX =
  /\b(deepseek|openai|chatgpt|gpt-?4|gpt-?3|claude|anthropic|gemini|google\s*ai|llama|llm|large\s*language\s*model|mô\s*hình\s*ngôn\s*ngữ|mô\s*hình\s*gì|model\s*gì|api\s*key|system\s*prompt|prompt\s*injection|ai\s*lập\s*trình|dùng\s*api\s*nào|fastapi|vite|express|node\.?js|python)\b/i;

const CONFIDENTIAL_IDENTITY_REPLY =
  "Kính thưa quý bạn, tại Cửu Nhị Dịch Quán, ta là **Tiểu Long Cửu Nhị** — người cùng bạn soi chiếu lẽ biến dịch của đất trời dựa trên tinh hoa Chu Dịch và cuốn **Sách Thuyết Minh 64 Quẻ Đi Kèm Bộ Bài**. Nơi đây chỉ đàm đạo về Đạo Tùy Thời, Nhân sinh, Thời thế và Hướng ứng xử trung chính; không bàn về những sự vụ kỹ thuật thế tục bên ngoài. Mời bạn trở lại với tâm niệm của trận pháp quẻ bài.";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS" && url.pathname.startsWith("/api/")) {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (url.pathname === "/api/direct_home/status") {
      return new Response(JSON.stringify({ status: "idle" }), {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    if (url.pathname === "/api/auth/sync") {
      return new Response(JSON.stringify({ ok: true, users: [] }), {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    if (url.pathname === "/api/dragon_agent/chat" && request.method === "POST") {
      try {
        const body: any = await request.json().catch(() => ({}));
        const userMessage = String(body?.user_message || "").trim();
        const mainQuestion = String(body?.main_question || "").trim();
        const spreadTitle = String(body?.spread_title || "Trận Pháp Chu Dịch").trim();
        const rawCards: any[] = Array.isArray(body?.cards) ? body.cards : [];

        if (TECH_PROBE_REGEX.test(userMessage) || TECH_PROBE_REGEX.test(mainQuestion)) {
          return new Response(
            JSON.stringify({
              ok: true,
              reply: CONFIDENTIAL_IDENTITY_REPLY,
              pose_badge: "🐉 Bảo Mật Dịch Quán",
              hexagram_focus: spreadTitle,
            }),
            {
              status: 200,
              headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
            }
          );
        }

        const cardLines = rawCards.map((c, idx) => {
          const hNum = Number(c?.hexNumber) || 1;
          const b = BOOK_HEXAGRAMS.find((x) => x.number === hNum) || BOOK_HEXAGRAMS[0];
          const posLabel = String(c?.positionLabel || `Lá thứ ${idx + 1}`).trim();
          const yaoNum = Number(c?.yaoNumber) || 0;
          return `- **Lá ${idx + 1} [${posLabel}] — Quẻ #${b.number} ${b.name}${yaoNum ? ` (Hào ${yaoNum})` : ""}**: *${b.redHeadline}* — ${b.bigImage} Vận thế: ${b.destiny}`;
        });

        const firstNum = Number(rawCards[0]?.hexNumber) || 1;
        const lastNum = Number(rawCards[rawCards.length - 1]?.hexNumber) || firstNum;
        const bookFirst = BOOK_HEXAGRAMS.find((x) => x.number === firstNum) || BOOK_HEXAGRAMS[0];
        const bookLast = BOOK_HEXAGRAMS.find((x) => x.number === lastNum) || bookFirst;

        const reply = [
          `Kính chào quý bạn! **Tiểu Long Cửu Nhị** đã cẩn trọng soi chiếu tâm niệm **"${mainQuestion || userMessage || "Vấn sự thời vận"}"** cùng toàn bộ **${rawCards.length || 1} lá bài** trong **${spreadTitle}**:`,
          cardLines.join("\n"),
          `**Châu Ấn Đúc Kết:** Khởi đầu từ tinh thần *${bookFirst.redHeadline}* (${bookFirst.name}) chuyển sang *${bookLast.redHeadline}* (${bookLast.name}). ${bookLast.destiny} Quý bạn hãy giữ tâm trung chính, chuẩn bị chu toàn từng bước và thuận theo đạo tùy thời thì mưu sự ắt hanh thông.`,
        ]
          .filter(Boolean)
          .join("\n\n");

        return new Response(
          JSON.stringify({
            ok: true,
            reply,
            pose_badge: "📜 Chiếu Soi Sách Thuyết Minh",
            hexagram_focus: `${spreadTitle} · ${rawCards.length || 1} Lá Bài`,
          }),
          {
            status: 200,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
          }
        );
      } catch (err: any) {
        return new Response(
          JSON.stringify({ error: err?.message || "Lỗi xử lý đàm đạo" }),
          {
            status: 500,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
          }
        );
      }
    }

    if (url.pathname === "/api/ink_wash/ai_interpret" && request.method === "POST") {
      try {
        const body: any = await request.json().catch(() => ({}));
        const question = String(body?.question || "Thỉnh vấn thiên cơ").trim();
        const spreadTitle = String(body?.spread_title || "Trận Pháp Chu Dịch").trim();
        const rawCards: any[] = Array.isArray(body?.cards) ? body.cards : [];

        const firstNum = Number(rawCards[0]?.hexNumber) || 1;
        const lastNum = Number(rawCards[rawCards.length - 1]?.hexNumber) || firstNum;
        const bookFirst = BOOK_HEXAGRAMS.find((x) => x.number === firstNum) || BOOK_HEXAGRAMS[0];
        const bookLast = BOOK_HEXAGRAMS.find((x) => x.number === lastNum) || bookFirst;

        const cardAnalyses = rawCards.map((c, idx) => {
          const hNum = Number(c?.hexNumber) || firstNum;
          const b = BOOK_HEXAGRAMS.find((x) => x.number === hNum) || bookFirst;
          const posLabel = String(c?.positionLabel || `Lá ${idx + 1}`).trim();
          const cardTitle = String(c?.name || b.name).trim();
          return {
            card_number: idx + 1,
            card_title: cardTitle,
            position_label: posLabel,
            concise_analysis: `Lá số ${idx + 1} ở vị trí ${posLabel} ứng vào Quẻ ${b.name}: ${b.redHeadline} — ${b.destiny}`,
          };
        });

        const sealChars = bookLast.redHeadline.includes("Cát")
          ? "大吉"
          : bookLast.redHeadline.includes("Hung")
          ? "慎行"
          : "玖貳";

        return new Response(
          JSON.stringify({
            success: true,
            hexagram_title:
              rawCards.length > 1
                ? `${spreadTitle} (${rawCards.length} Lá): Quẻ #${bookFirst.number} ${bookFirst.name} ➔ Quẻ #${bookLast.number} ${bookLast.name}`
                : `Quẻ #${bookFirst.number} ${bookFirst.name} — ${bookFirst.redHeadline}`,
            direct_answer: `Đối với câu hỏi "${question}", toàn cục ${rawCards.length} lá bài khuyên quý bạn giữ vững nội lực theo tinh thần ${bookFirst.redHeadline}. ${bookFirst.destiny}`,
            card_analyses: cardAnalyses,
            key_turning_point:
              rawCards.length > 1
                ? `Mạch biến chuyển của ${rawCards.length} lá bài hội tụ về Quẻ ${bookLast.name} (${bookLast.redHeadline}): ${bookLast.destiny}`
                : `${bookFirst.bigImage} ${bookFirst.destiny}`,
            final_verdict: `Châu Ấn Cửu Nhị quyết đoán cho trọn vẹn ${rawCards.length} lá bài: Giữ chữ Tín, hành sự thận trọng theo đạo lý Quẻ ${bookLast.name} thì mưu sự ắt viên mãn.`,
            seal_chars: sealChars,
          }),
          {
            status: 200,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
          }
        );
      } catch (err: any) {
        return new Response(
          JSON.stringify({ success: false, error: err?.message || "Lỗi phân tích quẻ" }),
          {
            status: 500,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
          }
        );
      }
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
      const assetRes = await env.ASSETS.fetch(request);
      if (assetRes.status >= 500 && url.pathname.startsWith("/assets/")) {
        const mirrorUrl = `https://khietvidai.github.io/huyen-hoc-site${url.pathname}`;
        const mirrorRes = await fetch(mirrorUrl).catch(() => null);
        if (mirrorRes && mirrorRes.ok) {
          return new Response(mirrorRes.body, {
            status: 200,
            headers: {
              "Content-Type":
                mirrorRes.headers.get("Content-Type") || "application/javascript; charset=utf-8",
              "Cache-Control": "public, max-age=31536000, immutable",
              ...CORS_HEADERS,
            },
          });
        }
      }
      return assetRes;
    }
    return new Response("Not Found", { status: 404 });
  },
};
