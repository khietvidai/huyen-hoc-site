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
  Copy,
  FileText,
} from "lucide-react";
import {
  InkWashCardInput,
  DecomposedCardInk,
  InkWashAISummaryData,
  InkWashFilmPlan,
  decomposeCardToInkLayers,
  buildFullAIPromptForInkWash,
  interpretAndSummarizeSpreadWithAI,
  buildInkWashFilmPlan,
  syncFilmPlanWithAudioDurations,
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
  onTriggerCopyAllForAI?: () => Promise<string | void> | string | void;
}

export const InkWashFilmModal: React.FC<InkWashFilmModalProps> = ({
  isOpen,
  onClose,
  cards,
  spreadMode = "thap_la",
  question = "",
  defaultTab = "live",
  onTriggerCopyAllForAI,
}) => {
  const [activeTab, setActiveTab] = useState<"live" | "sample">(defaultTab);
  const [aspect, setAspect] = useState<"16:9" | "9:16">("16:9");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(true);
  const [inkWashVoice, setInkWashVoice] = useState<string>("nam_tram_am");
  const [isDecomposing, setIsDecomposing] = useState<boolean>(false);

  // Editable overrides for question, seal stamp characters ("玖貳"), and final conclusion
  const [customQuestion, setCustomQuestion] = useState<string>(question);
  const [sealChars, setSealChars] = useState<string>("玖貳");
  const [customConclusion, setCustomConclusion] = useState<string>("");

  // 4-Step Automated Pipeline State:
  // Step 1: Chép Toàn Bộ Cho AI -> Step 2: Quăng vào AI giải quẻ -> Step 3: Tóm tắt giữ ý chính -> Step 4: Đem về đọc đầy đủ thông tin Xưởng Phim Thủy Mặc
  const [pipelineStep, setPipelineStep] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [pipelineStatusText, setPipelineStatusText] = useState<string>(
    "Chưa chạy quy trình Chép Cho AI ➔ AI Giải Quẻ ➔ Tóm Tắt Giữ Ý Chính"
  );
  const [isRunningPipeline, setIsRunningPipeline] = useState<boolean>(false);
  const [aiSummaryData, setAiSummaryData] = useState<InkWashAISummaryData | null>(null);
  const [audioDurationsMap, setAudioDurationsMap] = useState<Map<string, number>>(new Map());
  const [infoViewTab, setInfoViewTab] = useState<"summary" | "ai_full" | "copied_prompt">("summary");
  const [copiedPromptFeedback, setCopiedPromptFeedback] = useState<boolean>(false);

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
  const lastFrameRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const lastPreparedSigRef = useRef<string>("");

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

  // Build base film plan whenever cards, mode, AI summary, or custom text changes
  const baseFilmPlan = useMemo(() => {
    return buildInkWashFilmPlan(
      cards,
      spreadMode,
      customQuestion || question,
      sealChars,
      customConclusion,
      aiSummaryData
    );
  }, [cards, spreadMode, customQuestion, question, sealChars, customConclusion, aiSummaryData]);

  // Synchronize film plan shot & cue timings with actual Vietnamese TTS audio durations so 100% of every sentence is read in full
  const filmPlan: InkWashFilmPlan = useMemo(() => {
    if (audioDurationsMap.size > 0) {
      return syncFilmPlanWithAudioDurations(baseFilmPlan, audioDurationsMap);
    }
    return baseFilmPlan;
  }, [baseFilmPlan, audioDurationsMap]);

  // Execute the 4-step workflow:
  // 1. Nhấn vào "Chép Toàn Bộ Cho AI"
  // 2. Quăng vào cho AI giải quẻ
  // 3. Tóm tắt quẻ đó lại giữ ý chính
  // 4. Đem về đọc đầy đủ thông tin trong Xưởng Phim Thủy Mặc
  const runFourStepAIPipeline = useCallback(async (): Promise<InkWashFilmPlan> => {
    if (!audioRef.current) {
      audioRef.current = new InkWashAudioEngine();
    }
    audioRef.current.init();

    const effectiveQ = (customQuestion || question || "").trim() || "Xin chỉ điểm vận trình và lời khuyên hành động tối ưu?";
    setIsRunningPipeline(true);

    try {
      // BƯỚC 1: Nhấn vào "Chép Toàn Bộ Cho AI"
      setPipelineStep(1);
      setPipelineStatusText("Bước 1/4: Đang nhấn 'Chép Toàn Bộ Cho AI' để lấy toàn văn dữ liệu quẻ & tâm niệm...");
      let externalCopied = "";
      if (onTriggerCopyAllForAI) {
        try {
          const res = await onTriggerCopyAllForAI();
          if (typeof res === "string" && res.trim().length > 30) {
            externalCopied = res.trim();
          }
        } catch {}
      }
      const fullPromptText =
        externalCopied || buildFullAIPromptForInkWash(cards, spreadMode, effectiveQ);
      try {
        if (navigator?.clipboard?.writeText) {
          await navigator.clipboard.writeText(fullPromptText);
        }
      } catch {}
      await new Promise((r) => setTimeout(r, 180));

      // BƯỚC 2: Quăng vào cho AI giải quẻ
      setPipelineStep(2);
      setPipelineStatusText("Bước 2/4: Đang gửi bản 'Chép Toàn Bộ Cho AI' vào AI giải quẻ toàn diện...");
      const summaryResult = await interpretAndSummarizeSpreadWithAI(
        cards,
        spreadMode,
        effectiveQ,
        fullPromptText
      );

      // BƯỚC 3: Tóm tắt quẻ lại giữ ý chính
      setPipelineStep(3);
      setPipelineStatusText("Bước 3/4: Đang tóm tắt quẻ giữ trọn ý chính cho từng lá bài & lời kết Châu Ấn 玖貳...");
      setAiSummaryData(summaryResult);
      if (!customConclusion.trim()) {
        setCustomConclusion(summaryResult.conclusionCueB);
      }
      await new Promise((r) => setTimeout(r, 150));

      // BƯỚC 4: Đem về đọc đầy đủ thông tin trong Xưởng Phim Thủy Mặc (đo thời lượng TTS thực tế từng câu)
      setPipelineStep(4);
      setPipelineStatusText("Bước 4/4: Đang nạp giọng đọc Tiếng Việt đầy đủ 100% thông tin vào Xưởng Phim Thủy Mặc...");
      const planWithSummary = buildInkWashFilmPlan(
        cards,
        spreadMode,
        effectiveQ,
        sealChars,
        customConclusion.trim() || summaryResult.conclusionCueB,
        summaryResult
      );
      const measuredDurations = await audioRef.current.preloadAndMeasureCues(
        planWithSummary.narrationCues
      );
      setAudioDurationsMap(new Map(measuredDurations));

      const syncedPlan = syncFilmPlanWithAudioDurations(planWithSummary, measuredDurations);
      const sig = `${cards.map((c) => `${c.id}_${c.hexNumber}_${c.yaoNumber || 0}`).join("|")}__${effectiveQ}`;
      lastPreparedSigRef.current = sig;

      setPipelineStatusText(
        `Hoàn tất 4 bước! Đã tóm tắt giữ ý chính & đồng bộ đầy đủ giọng đọc Tiếng Việt (${Math.round(
          syncedPlan.totalDurationSec
        )}s).`
      );
      return syncedPlan;
    } finally {
      setIsRunningPipeline(false);
    }
  }, [cards, spreadMode, customQuestion, question, sealChars, customConclusion, onTriggerCopyAllForAI]);

  // Automatically run the 4-step pipeline when the modal opens on a new spread
  useEffect(() => {
    if (!isOpen || cards.length === 0) return;
    const effectiveQ = (customQuestion || question || "").trim() || "Xin chỉ điểm vận trình và lời khuyên hành động tối ưu?";
    const sig = `${cards.map((c) => `${c.id}_${c.hexNumber}_${c.yaoNumber || 0}`).join("|")}__${effectiveQ}`;
    if (lastPreparedSigRef.current !== sig && !isRunningPipeline) {
      runFourStepAIPipeline().catch(() => {});
    }
  }, [isOpen, cards, customQuestion, question, isRunningPipeline, runFourStepAIPipeline]);

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

    const timer = window.setTimeout(async () => {
      try {
        if (typeof document !== "undefined" && (document as any).fonts?.ready) {
          await (document as any).fonts.ready;
        }
      } catch {}
      if (canvasRef.current) {
        const W = aspect === "16:9" ? 1280 : 720;
        const H = aspect === "16:9" ? 720 : 1280;
        if (!rendererRef.current) {
          rendererRef.current = new InkWashRenderer(canvasRef.current);
        }
        rendererRef.current.resize(W, H);
        rendererRef.current.renderFrame(timeRef.current, filmPlan, decomposedMapRef.current);
      }
    }, 40);

    return () => window.clearTimeout(timer);
  }, [isOpen, aspect, filmPlan]);

  // Re-render current frame when scrubbing or editing while paused
  useEffect(() => {
    if (!isOpen || isPlaying || !rendererRef.current) return;
    rendererRef.current.renderFrame(currentTime, filmPlan, decomposedMapRef.current);
  }, [currentTime, filmPlan, isOpen, isPlaying]);

  // Main requestAnimationFrame playback loop (strictly outside React state updater to prevent double-ticking)
  useEffect(() => {
    if (!isOpen || !isPlaying || activeTab !== "live") {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastFrameRef.current = null;
      return;
    }

    const shotStarts = filmPlan.shots.map((s) => s.startSec);

    const step = (ts: number) => {
      if (lastFrameRef.current === null) {
        lastFrameRef.current = ts;
      }
      const dt = Math.min(0.08, (ts - lastFrameRef.current) / 1000);
      lastFrameRef.current = ts;

      const next = timeRef.current + dt;
      if (next >= filmPlan.totalDurationSec) {
        const voiceStillSpeaking = audioRef.current ? audioRef.current.isVoiceSpeaking() : false;
        if (voiceStillSpeaking) {
          // Hold on final frame while AI voice finishes reading the remaining syllables
          timeRef.current = filmPlan.totalDurationSec - 0.05;
          setCurrentTime(filmPlan.totalDurationSec - 0.05);
          if (rendererRef.current) {
            rendererRef.current.renderFrame(
              filmPlan.totalDurationSec - 0.05,
              filmPlan,
              decomposedMapRef.current
            );
          }
          rafRef.current = requestAnimationFrame(step);
          return;
        }

        timeRef.current = filmPlan.totalDurationSec;
        setCurrentTime(filmPlan.totalDurationSec);
        setIsPlaying(false);
        if (audioRef.current) {
          audioRef.current.stopAll();
        }
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
        return;
      }

      timeRef.current = next;
      setCurrentTime(next);

      if (rendererRef.current) {
        rendererRef.current.renderFrame(next, filmPlan, decomposedMapRef.current);
      }
      if (audioRef.current) {
        audioRef.current.tick(next, shotStarts, filmPlan.sealTimeSec, filmPlan.narrationCues);
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isOpen, isPlaying, activeTab, filmPlan]);

  const handleTogglePlay = useCallback(async () => {
    if (!audioRef.current) {
      audioRef.current = new InkWashAudioEngine();
    }
    audioRef.current.init();

    if (isPlaying) {
      setIsPlaying(false);
      audioRef.current.stopAll();
      return;
    }

    // Ensure the 4-step pipeline (Chép Cho AI -> AI Giải Quẻ -> Tóm Tắt Giữ Ý Chính -> Nạp Giọng Đọc Đầy Đủ) has completed before playing
    const effectiveQ = (customQuestion || question || "").trim() || "Xin chỉ điểm vận trình và lời khuyên hành động tối ưu?";
    const sig = `${cards.map((c) => `${c.id}_${c.hexNumber}_${c.yaoNumber || 0}`).join("|")}__${effectiveQ}`;
    let activePlan = filmPlan;
    if (lastPreparedSigRef.current !== sig || !aiSummaryData) {
      activePlan = await runFourStepAIPipeline();
    }

    if (timeRef.current >= activePlan.totalDurationSec - 0.2) {
      timeRef.current = 0;
      setCurrentTime(0);
      audioRef.current.resetTimeline();
    }
    audioRef.current.startBgmAt(timeRef.current);
    setIsPlaying(true);
  }, [isPlaying, filmPlan, customQuestion, question, cards, aiSummaryData, runFourStepAIPipeline]);

  const handleRestart = useCallback(async () => {
    if (!audioRef.current) {
      audioRef.current = new InkWashAudioEngine();
    }
    audioRef.current.init();
    audioRef.current.stopAll();

    const effectiveQ = (customQuestion || question || "").trim() || "Xin chỉ điểm vận trình và lời khuyên hành động tối ưu?";
    const sig = `${cards.map((c) => `${c.id}_${c.hexNumber}_${c.yaoNumber || 0}`).join("|")}__${effectiveQ}`;
    if (lastPreparedSigRef.current !== sig || !aiSummaryData) {
      await runFourStepAIPipeline();
    }

    audioRef.current.resetTimeline();
    timeRef.current = 0;
    setCurrentTime(0);
    audioRef.current.startBgmAt(0);
    setIsPlaying(true);
  }, [customQuestion, question, cards, aiSummaryData, runFourStepAIPipeline]);

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

  // Before exporting/running video:
  // Always execute Step 1 (Chép Toàn Bộ Cho AI) -> Step 2 (Quăng vào AI giải quẻ) -> Step 3 (Tóm tắt giữ ý chính) -> Step 4 (Đem về đọc đầy đủ thông tin Xưởng Phim Thủy Mặc),
  // then record from 0:00 to the end of the full narration!
  const handleStartRecordVideo = async () => {
    if (!canvasRef.current || isRecordingVideo || isRunningPipeline) return;
    if (!audioRef.current) {
      audioRef.current = new InkWashAudioEngine();
    }
    audioRef.current.init();
    audioRef.current.stopAll();
    setIsPlaying(false);

    if (recordedVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl);
      setRecordedVideoUrl(null);
    }

    // Run the 4-step pipeline first so the video reads 100% of the AI-summarized spread
    await runFourStepAIPipeline();

    try {
      audioRef.current.resetTimeline();
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

        const a = document.createElement("a");
        a.href = url;
        a.download = `phim-thuy-mac-kinh-dich-${aspect.replace(":", "x")}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };

      mediaRecorderRef.current = recorder;
      setIsRecordingVideo(true);
      timeRef.current = 0;
      setCurrentTime(0);
      audioRef.current.startBgmAt(0);
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
                  Chép Cho AI ➔ AI Giải Quẻ ➔ Tóm Tắt Giữ Ý Chính ➔ Đọc Đầy Đủ · Ấn 玖貳
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
            <div className="lg:col-span-7 flex flex-col items-center justify-between bg-[#0E0B08] rounded-2xl border border-[#34281B] p-3 sm:p-4 shadow-inner">
              {/* Top Stage Controls: Aspect Ratio & 4-Step Pipeline Status */}
              <div className="w-full flex items-center justify-between gap-2 mb-2.5 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAspect("16:9")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-serif font-bold flex items-center gap-1 cursor-pointer border transition ${
                      aspect === "16:9"
                        ? "bg-[#2C2015] text-[#F3E5AB] border-[#D4AF37]"
                        : "bg-[#16120D] text-[#9E8C74] border-[#2E2318]"
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Ngang 16:9 (1280×720)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAspect("9:16")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-serif font-bold flex items-center gap-1 cursor-pointer border transition ${
                      aspect === "9:16"
                        ? "bg-[#2C2015] text-[#F3E5AB] border-[#D4AF37]"
                        : "bg-[#16120D] text-[#9E8C74] border-[#2E2318]"
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Dọc 9:16 (TikTok / Shorts)</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 text-[11px] font-serif">
                  {isDecomposing || isRunningPipeline ? (
                    <span className="inline-flex items-center gap-1.5 text-amber-300 bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-600/40">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>
                        {isRunningPipeline
                          ? `Đang xử lý Bước ${pipelineStep}/4...`
                          : "Đang tách lớp mực tàu & chu sa..."}
                      </span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-emerald-300 bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-600/40">
                      <Check className="w-3 h-3" />
                      <span>Đã tóm tắt AI &amp; đồng bộ đầy đủ {cards.length} lá bài</span>
                    </span>
                  )}
                </div>
              </div>

              {/* 4-Step Pipeline Progress Strip */}
              <div className="w-full mb-2.5 px-3 py-2 rounded-xl bg-[#17120C] border border-[#C4963E]/45 flex flex-col gap-1.5">
                <div className="grid grid-cols-4 gap-1 text-[10px] font-serif font-bold">
                  {[
                    { id: 1, label: "1. Chép Toàn Bộ Cho AI" },
                    { id: 2, label: "2. Quăng Vào AI Giải Quẻ" },
                    { id: 3, label: "3. Tóm Tắt Giữ Ý Chính" },
                    { id: 4, label: "4. Đọc Đầy Đủ Thủy Mặc" },
                  ].map((st) => {
                    const done = pipelineStep >= st.id && !isRunningPipeline;
                    const active = isRunningPipeline && pipelineStep === st.id;
                    return (
                      <div
                        key={st.id}
                        className={`px-2 py-1 rounded-lg border text-center truncate transition ${
                          done
                            ? "bg-emerald-950/60 text-emerald-200 border-emerald-600/50"
                            : active
                            ? "bg-amber-900/70 text-amber-100 border-amber-400 animate-pulse"
                            : "bg-[#110D09] text-[#8A7960] border-[#2C2217]"
                        }`}
                      >
                        {done ? "✓ " : active ? "⏳ " : ""}
                        {st.label}
                      </div>
                    );
                  })}
                </div>
                <div className="text-[11px] text-[#E5C158] font-serif truncate">
                  ✦ {pipelineStatusText}
                </div>
              </div>

              {/* Canvas Viewport Container */}
              <div className="relative w-full flex-1 flex items-center justify-center overflow-hidden py-1">
                <div
                  className={`relative rounded-xl overflow-hidden border-2 border-[#C4963E]/75 shadow-[0_15px_50px_rgba(0,0,0,0.85)] bg-[#EAE3D2] ${
                    aspect === "16:9"
                      ? "w-full aspect-video max-h-[50vh]"
                      : "h-[50vh] aspect-[9/16]"
                  }`}
                >
                  <canvas
                    ref={canvasRef}
                    width={aspect === "16:9" ? 1280 : 720}
                    height={aspect === "16:9" ? 720 : 1280}
                    className="w-full h-full object-contain block"
                  />

                  {/* Recording Badge Overlay */}
                  {isRecordingVideo && (
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-rose-900/90 border border-rose-400 text-white text-xs font-bold flex items-center gap-1.5 animate-pulse shadow-lg">
                      <span className="w-2 h-2 rounded-full bg-rose-300" />
                      <span>ĐANG GHI VIDEO ({formatTime(currentTime)})</span>
                    </div>
                  )}
                </div>
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
                      timeRef.current = val;
                      setCurrentTime(val);
                      if (audioRef.current && isPlaying) {
                        audioRef.current.startBgmAt(val);
                      }
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
                      disabled={isRunningPipeline}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8862D] text-[#16120D] font-serif font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm hover:brightness-110 disabled:opacity-60"
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{isPlaying ? "Tạm Dừng" : "Phát Phim Đầy Đủ"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleRestart}
                      disabled={isRunningPipeline}
                      className="p-1.5 rounded-xl bg-[#241C14] hover:bg-[#33281C] text-[#E5C158] border border-[#3E3022] cursor-pointer disabled:opacity-60"
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
                      title="Bật/tắt giọng đọc thuyết minh Tiếng Việt"
                    >
                      {isVoiceEnabled ? <Mic className="w-3.5 h-3.5 text-emerald-400" /> : <MicOff className="w-3.5 h-3.5" />}
                      <span>Giọng Việt</span>
                    </button>

                    <select
                      value={inkWashVoice}
                      onChange={async (e) => {
                        const v = e.target.value;
                        setInkWashVoice(v);
                        if (audioRef.current) {
                          audioRef.current.setVoiceProfile(v);
                          const measured = await audioRef.current.preloadAndMeasureCues(filmPlan.narrationCues);
                          setAudioDurationsMap(new Map(measured));
                        }
                      }}
                      disabled={isRunningPipeline || isRecordingVideo}
                      className="px-2 py-1.5 rounded-xl text-xs font-serif font-bold bg-[#241C14] text-[#F3E5AB] border border-[#C4963E]/60 focus:outline-none cursor-pointer"
                      title="Chọn giọng đọc Tiếng Việt đọc quẻ Kinh Dịch"
                    >
                      <option value="nam_tram_am">🎙️ Nam Trầm Ấm (Giọng test_vi_design · Thủy Mặc)</option>
                      <option value="namminh_elder">🧙‍♂️ Dịch Sư Trưởng Lão (Tiếng Việt)</option>
                      <option value="vi-VN-HoaiMyNeural">🎙️ Nữ Hoài My (Tiếng Việt)</option>
                    </select>
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
                      disabled={isRecordingVideo || isRunningPipeline}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#9E2A2B] to-[#7D1D1E] hover:brightness-110 disabled:opacity-60 text-[#FFF8E7] border border-[#D4AF37] text-xs font-serif font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                      title="Tự động Chép Toàn Bộ Cho AI -> AI Giải Quẻ -> Tóm Tắt Giữ Ý Chính -> Đọc Đầy Đủ & Xuất Video"
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

            {/* RIGHT PANEL: 4-STEP AI PIPELINE TRIGGER, FULL SCRIPT READER & SHOT CHAPTERS */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-3 bg-[#1B150F] rounded-2xl border border-[#34281B] p-4">
              <div className="space-y-3">
                {/* Primary CTA to re-trigger the 4-step pipeline anytime */}
                <button
                  type="button"
                  onClick={() => runFourStepAIPipeline()}
                  disabled={isRunningPipeline || isRecordingVideo}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#C4963E] text-[#16120D] font-serif font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:brightness-105 cursor-pointer disabled:opacity-60"
                >
                  {isRunningPipeline ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang Chép Cho AI ➔ Giải Quẻ ➔ Tóm Tắt &amp; Đồng Bộ Giọng...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>⚡ Chép Toàn Bộ Cho AI ➔ AI Giải Quẻ ➔ Tóm Tắt &amp; Đọc Thủy Mặc</span>
                    </>
                  )}
                </button>

                {/* 3-Tab Viewer: Tóm Tắt Đọc Thủy Mặc | Bài Giải AI Đầy Đủ | Bản Chép Cho AI */}
                <div className="bg-[#120E0A] rounded-xl border border-[#34281B] p-2.5 space-y-2">
                  <div className="flex items-center justify-between gap-1 border-b border-[#2C2217] pb-1.5">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setInfoViewTab("summary")}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-serif font-bold cursor-pointer transition ${
                          infoViewTab === "summary"
                            ? "bg-[#9E2A2B] text-[#FFF8E7] border border-[#D4AF37]/60"
                            : "text-[#A89880] hover:text-white"
                        }`}
                      >
                        1. Tóm Tắt Đọc Thủy Mặc
                      </button>
                      <button
                        type="button"
                        onClick={() => setInfoViewTab("ai_full")}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-serif font-bold cursor-pointer transition ${
                          infoViewTab === "ai_full"
                            ? "bg-[#9E2A2B] text-[#FFF8E7] border border-[#D4AF37]/60"
                            : "text-[#A89880] hover:text-white"
                        }`}
                      >
                        2. Bài AI Giải Quẻ
                      </button>
                      <button
                        type="button"
                        onClick={() => setInfoViewTab("copied_prompt")}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-serif font-bold cursor-pointer transition ${
                          infoViewTab === "copied_prompt"
                            ? "bg-[#9E2A2B] text-[#FFF8E7] border border-[#D4AF37]/60"
                            : "text-[#A89880] hover:text-white"
                        }`}
                      >
                        3. Bản Chép Cho AI
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const textToCopy =
                          infoViewTab === "summary"
                            ? aiSummaryData?.fullSpokenSummaryText || ""
                            : infoViewTab === "ai_full"
                            ? aiSummaryData?.fullAiInterpretation || ""
                            : aiSummaryData?.copiedPromptText || "";
                        if (textToCopy && navigator?.clipboard?.writeText) {
                          navigator.clipboard.writeText(textToCopy);
                          setCopiedPromptFeedback(true);
                          setTimeout(() => setCopiedPromptFeedback(false), 2000);
                        }
                      }}
                      className="px-2 py-0.5 rounded bg-[#241C14] hover:bg-[#33281C] text-[#E5C158] border border-[#3E3022] text-[10px] font-serif flex items-center gap-1 cursor-pointer"
                      title="Sao chép nội dung đang xem"
                    >
                      {copiedPromptFeedback ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedPromptFeedback ? "Đã chép" : "Chép"}</span>
                    </button>
                  </div>

                  {/* Content of the selected tab */}
                  <div className="max-h-[200px] overflow-y-auto pr-1 text-xs font-serif leading-relaxed text-[#E6D7B8] space-y-2">
                    {infoViewTab === "summary" && (
                      <>
                        {aiSummaryData ? (
                          <div className="space-y-2">
                            {aiSummaryData.cardSummaries.map((cs) => (
                              <div
                                key={cs.cardNumber}
                                className="p-2 rounded-lg bg-[#1A140E] border border-[#34281B]"
                              >
                                <div className="text-[11px] font-bold text-[#E5C158] mb-0.5">
                                  ✦ Lá {cs.cardNumber} ({cs.roleLabel}) — {cs.cardTitle}
                                </div>
                                <p className="text-[11.5px] text-[#F5EAD4]">{cs.cueA}</p>
                                <p className="text-[11.5px] text-[#D8C8A8] mt-1">{cs.cueB}</p>
                              </div>
                            ))}
                            <div className="p-2 rounded-lg bg-[#241811] border border-[#C4963E]/50">
                              <div className="text-[11px] font-bold text-[#F3E5AB] mb-0.5">
                                印 Châu Ấn Đúc Kết ({sealChars}) — Trả Lời Tâm Niệm
                              </div>
                              <p className="text-[11.5px] text-[#F5EAD4]">{aiSummaryData.conclusionCueA}</p>
                              <p className="text-[11.5px] text-emerald-200 mt-1 font-semibold">
                                {customConclusion || aiSummaryData.conclusionCueB}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="text-[#A89880] italic py-4 text-center">
                            Đang tự động Chép Toàn Bộ Cho AI ➔ Giải Quẻ ➔ Tóm Tắt Giữ Ý Chính...
                          </div>
                        )}
                      </>
                    )}

                    {infoViewTab === "ai_full" && (
                      <pre className="whitespace-pre-wrap font-serif text-[11.5px] text-[#E6D7B8] leading-relaxed">
                        {aiSummaryData?.fullAiInterpretation || "Đang tổng hợp bài giải quẻ từ AI..."}
                      </pre>
                    )}

                    {infoViewTab === "copied_prompt" && (
                      <pre className="whitespace-pre-wrap font-mono text-[10.5px] text-[#C8B89E] leading-relaxed">
                        {aiSummaryData?.copiedPromptText || "Đang trích xuất dữ liệu Chép Toàn Bộ Cho AI..."}
                      </pre>
                    )}
                  </div>
                </div>

                {/* Clickable Shot List with Synchronized Durations */}
                <div className="border-t border-[#34281B] pt-2">
                  <div className="pb-1.5 flex items-center justify-between">
                    <span className="text-xs font-serif font-bold uppercase tracking-wider text-[#E5C158] flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Phân Cảnh Thủy Mặc ({filmPlan.shots.length} Cảnh · {formatTime(filmPlan.totalDurationSec)})</span>
                    </span>
                    <span className="text-[10.5px] text-emerald-300 font-serif">
                      Đọc đủ 100% ý chính
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-[145px] overflow-y-auto pr-1">
                    {filmPlan.shots.map((s) => {
                      const isActive = currentTime >= s.startSec && currentTime < s.endSec;
                      return (
                        <button
                          key={s.index}
                          type="button"
                          onClick={() => {
                            const targetT = s.startSec + 0.15;
                            timeRef.current = targetT;
                            setCurrentTime(targetT);
                            if (audioRef.current && isPlaying) {
                              audioRef.current.startBgmAt(targetT);
                            }
                            if (rendererRef.current) {
                              rendererRef.current.renderFrame(
                                targetT,
                                filmPlan,
                                decomposedMapRef.current
                              );
                            }
                          }}
                          className={`w-full text-left p-2 rounded-xl border transition cursor-pointer flex items-center justify-between gap-2 ${
                            isActive
                              ? "bg-[#2C2015] border-[#D4AF37] text-[#FFF8E7] shadow-sm"
                              : "bg-[#14100B] hover:bg-[#211911] border-[#2C2217] text-[#C8B89E]"
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-serif font-bold truncate">{s.title}</div>
                            <div className="text-[10px] text-[#C4963E] truncate">{s.subtitle}</div>
                          </div>
                          <span className="text-[10px] font-mono text-[#E5C158] shrink-0">
                            {formatTime(s.startSec)} – {formatTime(s.endSec)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Question & Cinnabar Seal Editor */}
                <div className="pt-2 border-t border-[#34281B] space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
                    <div className="sm:col-span-7">
                      <label className="block text-[11px] font-serif font-bold text-[#E5C158] mb-1">
                        Câu Hỏi Tâm Niệm:
                      </label>
                      <input
                        type="text"
                        value={customQuestion}
                        onChange={(e) => setCustomQuestion(e.target.value)}
                        placeholder="VD: Phiên bản này đã được chưa?..."
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#110D09] border border-[#3E3022] focus:border-[#D4AF37] text-xs text-[#F5EAD4] font-serif outline-none"
                      />
                    </div>
                    <div className="sm:col-span-5">
                      <label className="block text-[11px] font-serif font-bold text-[#E5C158] mb-1">
                        Châu Ấn (#B02E22):
                      </label>
                      <div className="flex items-center gap-1">
                        {["玖貳", "大吉", "慎行", "中正"].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setSealChars(preset)}
                            className={`px-2 py-1 rounded-lg text-xs font-serif font-bold border cursor-pointer ${
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
                      Lời Đúc Kết Cuối Phim (Tự động tóm tắt từ AI hoặc tùy chỉnh):
                    </label>
                    <textarea
                      rows={2}
                      value={customConclusion}
                      onChange={(e) => setCustomConclusion(e.target.value)}
                      placeholder="Tự động điền từ bước Tóm Tắt Giữ Ý Chính của AI..."
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#110D09] border border-[#3E3022] focus:border-[#D4AF37] text-xs text-[#F5EAD4] font-serif outline-none resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Downloaded video link if recorded */}
              {recordedVideoUrl && (
                <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 flex items-center justify-between gap-2">
                  <span className="text-xs text-emerald-200 font-serif">
                    ✓ Đã kết xuất xong Video Thủy Mặc (đọc đầy đủ ý chính)!
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
                Tâm niệm: “Phiên bản này đã được chưa?” — Đã chuẩn hóa phát âm “Lá bài số một, số hai, số ba, số bốn” &amp; nhạc nền Cổ Cầm + Tiêu Trúc liền mạch.
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
