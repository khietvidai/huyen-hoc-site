export interface Env {
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
}

function splitTextForTts(rawText: string, maxLen = 175): string[] {
  const cleaned = (rawText || "")
    .replace(/[*#_~`>|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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

    // Cloud Vietnamese TTS MP3 synthesizer for Direct Home 9:16 Video
    if (url.pathname === "/api/tts") {
      try {
        let text = url.searchParams.get("text") || "";
        if (!text && request.method === "POST") {
          const body: any = await request.json().catch(() => ({}));
          text = body?.text || "";
        }
        const chunks = splitTextForTts(text);
        if (chunks.length === 0) {
          return new Response(JSON.stringify({ error: "Empty text" }), {
            status: 400,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
          });
        }

        const buffers: Uint8Array[] = [];
        let totalLength = 0;

        for (const chunk of chunks) {
          const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=${encodeURIComponent(
            chunk
          )}`;
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
