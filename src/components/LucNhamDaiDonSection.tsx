import React, { useEffect, useRef, useState } from "react";
import {
  Compass,
  Sun,
  Moon,
  RotateCcw,
  Maximize2,
  Minimize2,
  ExternalLink,
  Sparkles,
} from "lucide-react";

export const LucNhamDaiDonSection: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [boardTheme, setBoardTheme] = useState<"light" | "dark">("light");
  const [iframeHeight, setIframeHeight] = useState<number>(1380);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [frameKey, setFrameKey] = useState<number>(0);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return;
      if (event.data.type === "LUCNHAM_HEIGHT" && typeof event.data.height === "number") {
        setIframeHeight(Math.max(980, event.data.height));
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleToggleTheme = (nextTheme: "light" | "dark") => {
    setBoardTheme(nextTheme);
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "LUCNHAM_SET_THEME", theme: nextTheme },
        "*"
      );
    }
  };

  const handleReloadBoard = () => {
    setIsLoaded(false);
    setFrameKey((prev) => prev + 1);
  };

  const handleIframeLoad = () => {
    setIsLoaded(true);
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "LUCNHAM_SET_THEME", theme: boardTheme },
        "*"
      );
    }
  };

  return (
    <div
      className={
        isFullscreen
          ? "fixed inset-0 z-[120] bg-[#0d0705] overflow-y-auto p-3 sm:p-6"
          : "w-full space-y-5"
      }
    >
      {/* Thanh Điều Khiển Hoàng Gia Lục Nhâm Đại Độn */}
      <div className="relative overflow-hidden rounded-2xl border border-[#d4af37]/35 bg-gradient-to-r from-[#1c0f0a]/95 via-[#26140d]/95 to-[#1c0f0a]/95 p-4 sm:p-5 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
        <div className="pointer-events-none absolute -top-20 -left-20 h-48 w-48 rounded-full bg-[#d4af37]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#d4af37]/25 to-[#b38728]/10 border border-[#d4af37]/50 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(212,175,55,0.25)]">
              <Compass className="w-6 h-6 text-[#ffd700]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#d4af37]/20 text-[#ffd700] border border-[#d4af37]/40">
                  <Sparkles className="w-3 h-3" />
                  大六壬 • Bát Tự • Khổng Minh
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  DeepSeek Flash AI
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-serif font-bold tracking-wide text-[#fef5e7] mt-1">
                Lục Nhâm Đại Độn × Bát Tự × Khổng Minh Thần Toán
              </h1>
              <p className="text-xs text-[#e8d5b5]/70 mt-0.5">
                Hệ thống lập quẻ chuẩn hóa Database 12 Cung Mandala, 60 Hoa Giáp Nạp Âm, Tâm Ấn Phú, 384 Quẻ Xăm &amp; AI DeepSeek Flash luận giải chuyên sâu
              </p>
            </div>
          </div>

          {/* Nút công cụ nhanh */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Chuyển chế độ Sáng / Tối của Bàn Lá Số */}
            <div className="inline-flex items-center rounded-xl bg-black/40 p-1 border border-[#d4af37]/25">
              <button
                type="button"
                onClick={() => handleToggleTheme("light")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  boardTheme === "light"
                    ? "bg-gradient-to-r from-[#d4af37] to-[#b38728] text-[#1a0f0a] font-bold shadow-sm"
                    : "text-[#e8d5b5]/75 hover:text-[#ffd700]"
                }`}
                title="Giao diện Sáng (Cổ điển dễ đọc & in ấn)"
              >
                <Sun className="w-3.5 h-3.5" />
                Nền Sáng
              </button>
              <button
                type="button"
                onClick={() => handleToggleTheme("dark")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  boardTheme === "dark"
                    ? "bg-gradient-to-r from-[#d4af37] to-[#b38728] text-[#1a0f0a] font-bold shadow-sm"
                    : "text-[#e8d5b5]/75 hover:text-[#ffd700]"
                }`}
                title="Giao diện Tối (Huyền bí)"
              >
                <Moon className="w-3.5 h-3.5" />
                Nền Tối
              </button>
            </div>

            <button
              type="button"
              onClick={handleReloadBoard}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-white/5 hover:bg-[#d4af37]/15 text-[#e8d5b5] hover:text-[#ffd700] border border-[#d4af37]/25 transition-all cursor-pointer"
              title="Làm mới bàn lập quẻ"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Làm mới</span>
            </button>

            <button
              type="button"
              onClick={() => setIsFullscreen((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-white/5 hover:bg-[#d4af37]/15 text-[#e8d5b5] hover:text-[#ffd700] border border-[#d4af37]/25 transition-all cursor-pointer"
              title={isFullscreen ? "Thu nhỏ" : "Mở toàn màn hình"}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-[#ffd700]" />
                  <span>Thu nhỏ</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Toàn màn hình</span>
                </>
              )}
            </button>

            <a
              href="https://lucnham.khietvidai.workers.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-[#d4af37]/15 hover:bg-[#d4af37]/25 text-[#ffd700] border border-[#d4af37]/35 transition-all"
              title="Mở trang gốc Lục Nhâm Đại Độn trong tab mới"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Bản gốc</span>
            </a>
          </div>
        </div>
      </div>

      {/* Khung Bàn Lập Quẻ & Lá Số Lục Nhâm Đại Độn */}
      <div className="relative rounded-2xl border border-[#d4af37]/30 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.65)] bg-[#f8fafc]">
        {!isLoaded && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#140a07]/90 backdrop-blur-sm gap-3">
            <div className="w-12 h-12 rounded-full border-2 border-[#d4af37]/30 border-t-[#ffd700] animate-spin" />
            <p className="text-sm font-serif text-[#ffd700] tracking-wider">
              Đang khởi tạo Bàn Lục Nhâm Đại Độn × Bát Tự × Khổng Minh...
            </p>
          </div>
        )}

        <iframe
          key={frameKey}
          ref={iframeRef}
          src="/lucnham-daidon/index.html"
          title="Hệ Thống Lập Quẻ Lục Nhâm Đại Độn × Bát Tự × Khổng Minh"
          onLoad={handleIframeLoad}
          style={{
            width: "100%",
            height: `${iframeHeight}px`,
            border: "none",
            display: "block",
          }}
          className="w-full transition-[height] duration-200"
        />
      </div>
    </div>
  );
};
