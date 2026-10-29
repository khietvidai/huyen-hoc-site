import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  Camera,
  Sparkles,
  Film,
  Smartphone,
  Monitor,
  Mic,
  MicOff,
  Check,
  Loader2,
} from "lucide-react";
import {
  InkWashCardInput,
  DecomposedCardInk,
  decomposeCardToInkLayers,
  buildInkWashFilmPlan,
  InkWashRenderer,
} from "../utils/inkWashEngine";
import { InkWashAudioEngine } from "../utils/inkWashAudio";
import { downloadDataUrlAsPng } from "../utils/captureHelper";

interface InkWashFilmModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: InkWashCardInput[];
  spreadMode?: string;
  question?: string;
  defaultTab?: "live" | "sample";
}

export const InkWashFilmModal: React.FC<InkWashFilmModalProps> = ({
  isOpen,
  onClose,
  cards,
  spreadMode = "thap_la",
  question = "",
  defaultTab = "live",
}) => {
  const [activeTab, setActiveTab] = useState<"live" | "sample">(defaultTab);
  const [aspect, setAspect] = useState<"16:9" | "9:16">("16:9");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(true);
  const [isDecomposing, setIsDecomposing] = useState<boolean>(false);

  // Editable overrides for question, seal stamp characters, and final conclusion
  const [customQuestion, setCustomQuestion] = useState<string>(question);
  const [sealChars, setSealChars] = useState<string>("玖貳");
  const [customConclusion, setCustomConclusion] = useState<string>("");

  // Video recording state
  const [isRecordingVideo, setIsRecordingVideo] = useState<boolean>(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [recordedExt, setRecordedExt] = useState<string>("webm");
  const [snapshotSaved, setSnapshotSaved] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<InkWashRenderer | null>(null);
  const audioRef = useRef<InkWashAudioEngine | null>(null);
  const decomposedMapRef = useRef<Map<string, DecomposedCardInk>>(new Map());
  const rafRef = useRef<number | null>(null);
  const lastFrameTsRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (question) {
      setCustomQuestion(question);
    }
  }, [question]);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  // Build film plan whenever cards, mode, or custom text changes
  const filmPlan = useMemo(() => {
    return buildInkWashFilmPlan(
      cards,
      spreadMode,
      customQuestion || question,
      sealChars,
      customConclusion
    );
  }, [cards, spreadMode, customQuestion, question, sealChars, customConclusion]);

  // Decompose all card images into wet, dry, and vermilion ink-wash layers
  useEffect(() => {
    if (!isOpen || cards.length === 0) return;
    let cancelled = false;
    setIsDecomposing(true);

    Promise.all(
      cards.map(async (c) => {
        if (!c.img) return;
        const res = await decomposeCardToInkLayers(c.img);
        if (res && !cancelled) {
          decomposedMapRef.current.set(c.img, res);
        }
      })
    ).finally(() => {
      if (!cancelled) {
        setIsDecomposing(false);
        // Render initial frame at t = 1.2s so preview looks rich immediately
        if (rendererRef.current) {
          rendererRef.current.renderFrame(
            Math.min(1.2, filmPlan.totalDurationSec),
            filmPlan,
            decomposedMapRef.current
          );
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isOpen, cards, filmPlan]);

  // Initialize Canvas Renderer & Audio Engine when modal opens
  useEffect(() => {
    if (!isOpen) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (audioRef.current) audioRef.current.stopAll();
      setIsPlaying(false);
      setIsRecordingVideo(false);
      return;
    }

    if (!audioRef.current) {
      audioRef.current = new InkWashAudioEngine();
    }

    const timer = window.setTimeout(() => {
      if (canvasRef.current) {
        const W = aspect === "16:9" ? 1280 : 720;
        const H = aspect === "16:9" ? 720 : 1280;
        if (!rendererRef.current) {
          rendererRef.current = new InkWashRenderer(canvasRef.current);
        }
        rendererRef.current.resize(W, H);
        rendererRef.current.renderFrame(currentTime, filmPlan, decomposedMapRef.current);
      }
    }, 40);

    return () => window.clearTimeout(timer);
  }, [isOpen, aspect]);

  // Re-render current frame when scrubbing or editing while paused
  useEffect(() => {
    if (!isOpen || isPlaying || !rendererRef.current) return;
    rendererRef.current.renderFrame(currentTime, filmPlan, decomposedMapRef.current);
  }, [currentTime, filmPlan, isOpen, isPlaying]);

  // Main requestAnimationFrame playback loop
  useEffect(() => {
    if (!isOpen || !isPlaying || activeTab !== "live") {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastFrameTsRef.current = null;
      return;
    }

    const step = (ts: number) => {
      if (lastFrameTsRef.current === null) {
        lastFrameTsRef.current = ts;
      }
      const dt = Math.min(0.1, (ts - lastFrameTsRef.current) / 1000);
      lastFrameTsRef.current = ts;

      setCurrentTime((prev) => {
        const next = prev + dt;
        if (next >= filmPlan.totalDurationSec) {
          // End of film reached
          setIsPlaying(false);
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            try {
              mediaRecorderRef.current.stop();
            } catch {}
          }
          if (rendererRef.current) {
            rendererRef.current.renderFrame(
              filmPlan.totalDurationSec - 0.05,
              filmPlan,
              decomposedMapRef.current
            );
          }
          return filmPlan.totalDurationSec;
        }

        if (rendererRef.current) {
          rendererRef.current.renderFrame(next, filmPlan, decomposedMapRef.current);
        }
        if (audioRef.current) {
          const shotStarts = filmPlan.shots.map((s) => s.startSec);
          audioRef.current.tick(next, shotStarts, filmPlan.sealTimeSec, filmPlan.narrationCues);
        }
        return next;
      });

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isOpen, isPlaying, activeTab, filmPlan]);

  const handleTogglePlay = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new InkWashAudioEngine();
    }
    audioRef.current.init();

    if (isPlaying) {
      setIsPlaying(false);
      audioRef.current.stopAll();
    } else {
      if (currentTime >= filmPlan.totalDurationSec - 0.2) {
        setCurrentTime(0);
        audioRef.current.resetTimeline();
      }
      setIsPlaying(true);
    }
  }, [isPlaying, currentTime, filmPlan.totalDurationSec]);

  const handleRestart = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.init();
      audioRef.current.resetTimeline();
    }
    setCurrentTime(0);
    setIsPlaying(true);
  }, []);

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    if (audioRef.current) audioRef.current.setMuted(next);
  };

  const handleToggleVoice = () => {
    const next = !isVoiceEnabled;
    setIsVoiceEnabled(next);
    if (audioRef.current) audioRef.current.setVoiceEnabled(next);
  };

  // Capture current Xuan-paper canvas frame as PNG
  const handleSnapshotPng = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL("image/png");
    downloadDataUrlAsPng(dataUrl, `tranh-thuy-mac-kinh-dich-${Date.now()}.png`);
    setSnapshotSaved(true);
    setTimeout(() => setSnapshotSaved(false), 2500);
  };

  // Record full video from 0:00 to end using MediaRecorder + Web Audio stream
  const handleStartRecordVideo = () => {
    if (!canvasRef.current || isRecordingVideo) return;
    if (!audioRef.current) {
      audioRef.current = new InkWashAudioEngine();
    }
    audioRef.current.init();
    audioRef.current.resetTimeline();

    if (recordedVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl);
      setRecordedVideoUrl(null);
    }

    try {
      const canvasStream = canvasRef.current.captureStream(24);
      const audioStream = audioRef.current.getMediaStream();
      const tracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()];
      if (audioStream) {
        tracks.push(...audioStream.getAudioTracks());
      }
      const combinedStream = new MediaStream(tracks);

      const mimeCandidates = [
        "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
        "video/mp4",
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm",
      ];
      let chosenMime = "";
      for (const m of mimeCandidates) {
        if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(m)) {
          chosenMime = m;
          break;
        }
      }

      const ext = chosenMime.includes("mp4") ? "mp4" : "webm";
      setRecordedExt(ext);
      recordedChunksRef.current = [];

      const recorder = chosenMime
        ? new MediaRecorder(combinedStream, {
            mimeType: chosenMime,
            videoBitsPerSecond: 4500000,
          })
        : new MediaRecorder(combinedStream);

      recorder.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) {
          recordedChunksRef.current.push(ev.data);
        }
      };

      recorder.onstop = () => {
        setIsRecordingVideo(false);
        const blob = new Blob(recordedChunksRef.current, {
          type: chosenMime || "video/webm",
        });
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);

        // Auto trigger download
        const a = document.createElement("a");
        a.href = url;
        a.download = `phim-thuy-mac-kinh-dich-${aspect.replace(":", "x")}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };

      mediaRecorderRef.current = recorder;
      setIsRecordingVideo(true);
      setCurrentTime(0);
      recorder.start(250);
      setIsPlaying(true);
    } catch (err) {
      console.error("MediaRecorder error:", err);
      setIsRecordingVideo(false);
    }
  };

  const formatTime = (sec: number) => {
    const s = Math.max(0, Math.floor(sec));
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m}:${rem < 10 ? "0" : ""}${rem}`;
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[280] bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-6xl max-h-[94vh] bg-[#16120D] border-2 border-[#C4963E]/80 rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden text-[#F5EAD4]"
      >
        {/* 1. TOP HEADER BAR */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#1E1812] border-b border-[#3A2D1E] gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-[#9E2A2B] border border-[#D4AF37] text-[#FFF8E7] font-serif font-bold text-sm flex items-center justify-center shadow-sm">
              墨
            </span>
            <div>
              <h3 className="font-serif font-bold text-sm sm:text-base text-[#F5EAD4] flex items-center gap-2">
                <span>Xưởng Phim Thủy Mặc Chu Dịch (水墨周易)</span>
                <span className="hidden md:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#2A2016] text-[#E5C158] border border-[#C4963E]/50">
                  WebGL2 · Cổ Cầm &amp; Tiêu Trúc · Giấy Tuyên Thành
                </span>
              </h3>
            </div>
          </div>

          {/* Mode Switch Tabs: Live Engine vs Studio Sample MP4 */}
          <div className="flex items-center gap-1.5 bg-[#120E0A] p-1 rounded-xl border border-[#3A2D1E]">
            <button
              type="button"
              onClick={() => setActiveTab("live")}
              className={`px-3 py-1.5 rounded-lg text-xs font-serif font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === "live"
                  ? "bg-gradient-to-r from-[#9E2A2B] to-[#7D1D1E] text-[#FFF8E7] border border-[#D4AF37]/70 shadow-sm"
                  : "text-[#B8A68E] hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E5C158]" />
              <span>Phim Theo Quẻ Đang Bốc ({cards.length} Lá)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                if (audioRef.current) audioRef.current.stopAll();
                setActiveTab("sample");
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-serif font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === "sample"
                  ? "bg-gradient-to-r from-[#9E2A2B] to-[#7D1D1E] text-[#FFF8E7] border border-[#D4AF37]/70 shadow-sm"
                  : "text-[#B8A68E] hover:text-white"
              }`}
            >
              <Film className="w-3.5 h-3.5 text-[#E5C158]" />
              <span>Phim Mẫu Studio (Cách ➔ Vô Vọng · 48s)</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#2A2016] hover:bg-[#9E2A2B] text-[#F5EAD4] border border-[#4A3928] transition cursor-pointer"
            title="Đóng cửa sổ"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. MAIN WORKSPACE */}
        {activeTab === "live" ? (
          <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-4 p-4">
            {/* LEFT / CENTER: XUAN-PAPER FILM STAGE */}
            <div className="lg:col-span-8 flex flex-col items-center justify-between bg-[#0E0B08] rounded-2xl border border-[#34281B] p-3 sm:p-4 shadow-inner">
              {/* Top Stage Controls: Aspect Ratio & Decomposition Status */}
              <div className="w-full flex items-center justify-between gap-2 mb-2.5 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAspect("16:9")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-serif font-bold flex items-center gap-1 cursor-pointer border transition ${
                      aspect === "16:9"
                        ? "bg-[#2A2016] text-[#F3E5AB] border-[#D4AF37]"
                        : "bg-[#18130E] text-[#9E8C74] border-[#2E2318]"
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>16:9 Ngang (Cinema)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAspect("9:16")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-serif font-bold flex items-center gap-1 cursor-pointer border transition ${
                      aspect === "9:16"
                        ? "bg-[#2A2016] text-[#F3E5AB] border-[#D4AF37]"
                        : "bg-[#18130E] text-[#9E8C74] border-[#2E2318]"
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>9:16 Dọc (TikTok/Reels)</span>
                  </button>
                </div>

                {isDecomposing ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#E5C158] font-serif">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang tách 3 lớp mực Tuyên Thành (Ướt · Khô · Chu Sa)...</span>
                  </span>
                ) : (
                  <span className="text-[11px] text-[#A89880] font-serif">
                    ✦ Đã chuyển hóa {cards.length} lá bài sang họa pháp Thủy Mặc
                  </span>
                )}
              </div>

              {/* Canvas Viewport */}
              <div className="relative w-full flex-1 flex items-center justify-center overflow-hidden min-h-[280px] sm:min-h-[380px]">
                <canvas
                  ref={canvasRef}
                  width={aspect === "16:9" ? 1280 : 720}
                  height={aspect === "16:9" ? 720 : 1280}
                  onClick={handleTogglePlay}
                  className={`rounded-xl shadow-[0_14px_45px_rgba(0,0,0,0.85)] border border-[#C4963E]/50 cursor-pointer transition-all ${
                    aspect === "16:9"
                      ? "w-full max-h-[54vh] aspect-video object-contain"
                      : "h-[54vh] aspect-[9/16] object-contain"
                  }`}
                />

                {!isPlaying && (
                  <button
                    type="button"
                    onClick={handleTogglePlay}
                    className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-[#16120D]/85 hover:bg-[#9E2A2B] text-[#F3E5AB] border-2 border-[#D4AF37] flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.45)] transition transform hover:scale-105 cursor-pointer"
                    title="Phát phim Thủy Mặc"
                  >
                    <Play className="w-7 h-7 fill-current ml-0.5" />
                  </button>
                )}

                {isRecordingVideo && (
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-[#9E2A2B] text-white text-xs font-bold border border-[#D4AF37] flex items-center gap-1.5 animate-pulse shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-white" />
                    <span>ĐANG GHI VIDEO ({Math.round((currentTime / filmPlan.totalDurationSec) * 100)}%)</span>
                  </div>
                )}
              </div>

              {/* Timeline Scrubber & Transport Controls */}
              <div className="w-full mt-3 space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-[#D4AF37] w-10 text-right">
                    {formatTime(currentTime)}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={filmPlan.totalDurationSec}
                    step={0.05}
                    value={currentTime}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setCurrentTime(val);
                      if (rendererRef.current) {
                        rendererRef.current.renderFrame(val, filmPlan, decomposedMapRef.current);
                      }
                    }}
                    className="flex-1 accent-[#D4AF37] h-1.5 bg-[#2E2318] rounded-lg cursor-pointer"
                  />
                  <span className="text-xs font-mono text-[#A89880] w-10">
                    {formatTime(filmPlan.totalDurationSec)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleTogglePlay}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8862D] text-[#16120D] font-serif font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm hover:brightness-110"
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{isPlaying ? "Tạm Dừng" : "Phát Phim"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleRestart}
                      className="p-1.5 rounded-xl bg-[#241C14] hover:bg-[#33281C] text-[#E5C158] border border-[#3E3022] cursor-pointer"
                      title="Phát lại từ đầu"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={handleToggleMute}
                      className="p-1.5 rounded-xl bg-[#241C14] hover:bg-[#33281C] text-[#E5C158] border border-[#3E3022] cursor-pointer"
                      title={isMuted ? "Bật âm thanh Cổ Cầm & Tiêu" : "Tắt âm thanh"}
                    >
                      {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      type="button"
                      onClick={handleToggleVoice}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-serif font-semibold border flex items-center gap-1 cursor-pointer ${
                        isVoiceEnabled
                          ? "bg-[#241C14] text-[#F3E5AB] border-[#C4963E]/60"
                          : "bg-[#18130E] text-[#7D6E57] border-[#2E2318]"
                      }`}
                      title="Bật/tắt giọng đọc thuyết minh tự động (đã chuẩn hóa phát âm Lá bài số một, số hai...)"
                    >
                      {isVoiceEnabled ? <Mic className="w-3.5 h-3.5 text-emerald-400" /> : <MicOff className="w-3.5 h-3.5" />}
                      <span>Giọng Đọc</span>
                    </button>
                  </div>

                  {/* Export Buttons: Record Video & Capture PNG */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSnapshotPng}
                      className="px-3 py-1.5 rounded-xl bg-[#241C14] hover:bg-[#33281C] text-[#F5EAD4] border border-[#C4963E]/55 text-xs font-serif font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      {snapshotSaved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Camera className="w-3.5 h-3.5 text-[#E5C158]" />}
                      <span>{snapshotSaved ? "Đã Lưu PNG" : "Chụp Tranh PNG"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleStartRecordVideo}
                      disabled={isRecordingVideo}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#9E2A2B] to-[#7D1D1E] hover:brightness-110 disabled:opacity-60 text-[#FFF8E7] border border-[#D4AF37] text-xs font-serif font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      {isRecordingVideo ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E5C158]" />
                          <span>Đang Xuất Video...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5 text-[#E5C158]" />
                          <span>Xuất Video Clip</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL: SHOT CHAPTERS, CUSTOM SEAL & VERDICT EDITOR */}
            <div className="lg:col-span-4 flex flex-col justify-between gap-3 bg-[#1B150F] rounded-2xl border border-[#34281B] p-4">
              <div className="space-y-3">
                <div className="border-b border-[#34281B] pb-2 flex items-center justify-between">
                  <span className="text-xs font-serif font-bold uppercase tracking-wider text-[#E5C158]">
                    📜 Phân Cảnh Thủy Mặc ({filmPlan.shots.length} Cảnh)
                  </span>
                  <span className="text-[11px] text-[#A89880] font-mono">
                    24 fps · 墨分五色
                  </span>
                </div>

                {/* Clickable Shot List */}
                <div className="space-y-1.5 max-h-[210px] overflow-y-auto pr-1">
                  {filmPlan.shots.map((s) => {
                    const isActive = currentTime >= s.startSec && currentTime < s.endSec;
                    return (
                      <button
                        key={s.index}
                        type="button"
                        onClick={() => {
                          setCurrentTime(s.startSec + 0.2);
                          if (rendererRef.current) {
                            rendererRef.current.renderFrame(
                              s.startSec + 0.2,
                              filmPlan,
                              decomposedMapRef.current
                            );
                          }
                        }}
                        className={`w-full text-left p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-2 ${
                          isActive
                            ? "bg-[#2C2015] border-[#D4AF37] text-[#FFF8E7] shadow-sm"
                            : "bg-[#14100B] hover:bg-[#211911] border-[#2C2217] text-[#C8B89E]"
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-serif font-bold truncate">{s.title}</div>
                          <div className="text-[10.5px] text-[#C4963E] truncate">{s.subtitle}</div>
                        </div>
                        <span className="text-[10px] font-mono text-[#A89880] shrink-0">
                          {formatTime(s.startSec)}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Question & Cinnabar Seal Editor */}
                <div className="pt-2 border-t border-[#34281B] space-y-2.5">
                  <div>
                    <label className="block text-[11px] font-serif font-bold text-[#E5C158] mb-1">
                      Câu Hỏi Tâm Niệm (Hiện Ở Cảnh Kết &amp; Châu Ấn):
                    </label>
                    <input
                      type="text"
                      value={customQuestion}
                      onChange={(e) => setCustomQuestion(e.target.value)}
                      placeholder="VD: Phiên bản này đã được chưa?..."
                      className="w-full px-3 py-1.5 rounded-lg bg-[#110D09] border border-[#3E3022] focus:border-[#D4AF37] text-xs text-[#F5EAD4] font-serif outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="block text-[11px] font-serif font-bold text-[#E5C158] mb-1">
                        Châu Ấn Chu Sa (#B02E22):
                      </label>
                      <div className="flex items-center gap-1.5">
                        {["玖貳", "大吉", "慎行", "中正"].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setSealChars(preset)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-serif font-bold border cursor-pointer ${
                              sealChars === preset
                                ? "bg-[#9E2A2B] text-white border-[#D4AF37]"
                                : "bg-[#120E0A] text-[#C8B89E] border-[#34281B]"
                            }`}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-serif font-bold text-[#E5C158] mb-1">
                      Lời Đúc Kết Cuối Phim (Tùy chỉnh):
                    </label>
                    <textarea
                      rows={2}
                      value={customConclusion}
                      onChange={(e) => setCustomConclusion(e.target.value)}
                      placeholder="Để trống sẽ tự động đúc kết từ Thoán Từ & Hào Động..."
                      className="w-full px-3 py-1.5 rounded-lg bg-[#110D09] border border-[#3E3022] focus:border-[#D4AF37] text-xs text-[#F5EAD4] font-serif outline-none resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Downloaded video link if recorded */}
              {recordedVideoUrl && (
                <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 flex items-center justify-between gap-2">
                  <span className="text-xs text-emerald-200 font-serif">
                    ✓ Đã kết xuất xong Video Thủy Mặc!
                  </span>
                  <a
                    href={recordedVideoUrl}
                    download={`phim-thuy-mac-kinh-dich.${recordedExt}`}
                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                  >
                    Tải Lại (.{recordedExt})
                  </a>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* TAB 2: STUDIO SAMPLE MP4 (TRẠCH HỎA CÁCH -> THIÊN LÔI VÔ VỌNG 48s) */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center gap-4 bg-[#0E0B08]">
            <div className="max-w-3xl text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#2A2016] border border-[#D4AF37]/60 text-[11px] text-[#F3E5AB] font-serif">
                <span>✦ Bản Dựng Mẫu Chuẩn Lemo-Opuscar (`ink-wash`) · 1920×1080 · 24fps · -14 LUFS</span>
              </div>
              <h4 className="text-base sm:text-lg font-serif font-bold text-[#F5EAD4]">
                Tháp La Kinh Dịch (4 Lá): Trạch Hỏa Cách (䷰) ➔ Hào 3 &amp; Hào 6 ➔ Thiên Lôi Vô Vọng (䷘)
              </h4>
              <p className="text-xs text-[#A89880] font-serif">
                Tâm niệm: “Phiên bản này đã được chưa?” — Đã chuẩn hóa phát âm “Lá bài số một, số hai, số ba, số bốn” &amp; nhạc nền Cổ Cầm + Tiêu Trúc.
              </p>
            </div>

            <div className="w-full max-w-4xl rounded-2xl overflow-hidden border-2 border-[#C4963E]/70 shadow-2xl bg-black aspect-video">
              <video
                src="/videos/thap-la-kinh-dich.mp4"
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex items-center gap-3">
              <a
                href="/videos/thap-la-kinh-dich.mp4"
                download="thap-la-kinh-dich-thuy-mac.mp4"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8862D] text-[#16120D] font-serif font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:brightness-110"
              >
                <Download className="w-4 h-4" />
                <span>Tải Video Mẫu Studio MP4 (Full HD)</span>
              </a>
              <button
                type="button"
                onClick={() => setActiveTab("live")}
                className="px-5 py-2.5 rounded-xl bg-[#241C14] hover:bg-[#33281C] text-[#F3E5AB] border border-[#C4963E]/60 font-serif font-bold text-xs sm:text-sm cursor-pointer"
              >
                <span>🖌️ Chuyển Sang Dựng Phim Theo Quẻ Đang Bốc</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
