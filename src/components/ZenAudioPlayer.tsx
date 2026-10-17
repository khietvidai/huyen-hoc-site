import React, { useState, useEffect, useRef } from "react";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Bell,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Music,
  ExternalLink,
  Tv,
  RotateCcw,
  Check,
} from "lucide-react";
import { zenAudio, SOUNDSCAPE_OPTIONS, SoundscapeOption } from "../utils/zenAudio";

interface ZenAudioPlayerProps {
  className?: string;
  defaultExpanded?: boolean;
  variant?: "pill" | "menu-card";
}

const DEFAULT_YT_URL = "https://www.youtube.com/watch?v=bbMRtYuE1PU";
const DEFAULT_YT_ID = "bbMRtYuE1PU";

function extractYouTubeId(url: string): string {
  if (!url) return DEFAULT_YT_ID;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : DEFAULT_YT_ID;
}

export const ZenAudioPlayer: React.FC<ZenAudioPlayerProps> = ({
  className = "",
  variant = "pill",
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem("zen_audio_vol");
    return saved !== null ? parseFloat(saved) : 0.55;
  });
  const [selectedSoundscape, setSelectedSoundscape] = useState<string>(() => {
    return localStorage.getItem("zen_audio_soundscape") || "youtube_yulinling";
  });
  const [youtubeUrl, setYoutubeUrl] = useState<string>(() => {
    return localStorage.getItem("zen_audio_yt_url") || DEFAULT_YT_URL;
  });
  const [customUrlInput, setCustomUrlInput] = useState<string>("");
  const [isCustomUrlOpen, setIsCustomUrlOpen] = useState(false);
  const [showLiveVideo, setShowLiveVideo] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [justChimed, setJustChimed] = useState(false);
  const [isYtReady, setIsYtReady] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const ytPlayerRef = useRef<any>(null);

  const currentYtId = extractYouTubeId(youtubeUrl);
  const currentOption =
    SOUNDSCAPE_OPTIONS.find((s) => s.id === selectedSoundscape) || SOUNDSCAPE_OPTIONS[0];
  const isCurrentYouTube = currentOption.isYouTube || selectedSoundscape.startsWith("youtube");

  // Helper to send postMessage commands to the YouTube iframe
  const sendYtCommand = (func: string, args: any[] = []) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: "command", func, args }),
          "*"
        );
      } catch (e) {
        // cross-origin safe
      }
    }
  };

  const playYouTubeTrack = () => {
    if (ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === "function") {
      try {
        ytPlayerRef.current.playVideo();
      } catch (e) {}
    }
    sendYtCommand("playVideo");
  };

  const pauseYouTubeTrack = () => {
    if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === "function") {
      try {
        ytPlayerRef.current.pauseVideo();
      } catch (e) {}
    }
    sendYtCommand("pauseVideo");
  };

  const updateYouTubeVolume = (vol: number) => {
    const volPct = Math.round(vol * 100);
    if (ytPlayerRef.current && typeof ytPlayerRef.current.setVolume === "function") {
      try {
        ytPlayerRef.current.setVolume(volPct);
        ytPlayerRef.current.unMute();
      } catch (e) {}
    }
    sendYtCommand("setVolume", [volPct]);
    sendYtCommand("unMute");
  };

  // Sync volume to Web Audio & YouTube
  useEffect(() => {
    zenAudio.setVolume(volume);
    localStorage.setItem("zen_audio_vol", volume.toString());
    updateYouTubeVolume(volume);
  }, [volume]);

  // Load YouTube IFrame API once
  useEffect(() => {
    let isMounted = true;

    const initYT = () => {
      if (!(window as any).YT || !(window as any).YT.Player) return;
      try {
        if (ytPlayerRef.current) return;
        ytPlayerRef.current = new (window as any).YT.Player("zen-yt-player-iframe", {
          events: {
            onReady: (event: any) => {
              if (!isMounted) return;
              setIsYtReady(true);
              try {
                event.target.setVolume(Math.round(volume * 100));
              } catch (e) {}
            },
            onStateChange: (event: any) => {
              if (!isMounted) return;
              // 1: PLAYING, 2: PAUSED, 0: ENDED
              if (event.data === 1) {
                setIsPlaying(true);
              } else if (event.data === 2) {
                if (isCurrentYouTube) {
                  setIsPlaying(false);
                }
              } else if (event.data === 0) {
                // Loop video automatically for continuous meditation
                try {
                  event.target.seekTo(0);
                  event.target.playVideo();
                } catch (e) {
                  sendYtCommand("seekTo", [0, true]);
                  sendYtCommand("playVideo");
                }
              }
            },
          },
        });
      } catch (err) {
        // Fallback to postMessage
      }
    };

    if (!(window as any).YT) {
      const prevOnReady = (window as any).onYouTubeIframeAPIReady;
      (window as any).onYouTubeIframeAPIReady = () => {
        if (prevOnReady) prevOnReady();
        initYT();
      };
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
      }
    } else {
      initYT();
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // Listen for iframe postMessage status
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      try {
        if (typeof e.data !== "string") return;
        const data = JSON.parse(e.data);
        if (data.event === "onStateChange") {
          if (data.info === 1) {
            setIsPlaying(true);
          } else if (data.info === 2) {
            if (isCurrentYouTube) {
              setIsPlaying(false);
            }
          } else if (data.info === 0) {
            sendYtCommand("seekTo", [0, true]);
            sendYtCommand("playVideo");
          }
        } else if (data.event === "initialDelivery" || data.event === "onReady") {
          setIsYtReady(true);
          updateYouTubeVolume(volume);
        }
      } catch (err) {
        // Not JSON
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [isCurrentYouTube, volume]);

  // Support global audio toggle event from other components (e.g. CardDraw)
  useEffect(() => {
    const handleGlobalToggle = () => {
      togglePlay();
    };
    window.addEventListener("zen-audio-toggle", handleGlobalToggle);
    return () => {
      window.removeEventListener("zen-audio-toggle", handleGlobalToggle);
    };
  }, [isPlaying, selectedSoundscape, isCurrentYouTube]);

  // Dispatch state updates to window for other components
  useEffect(() => {
    try {
      window.dispatchEvent(
        new CustomEvent("zen-audio-state", {
          detail: { isPlaying, soundscape: selectedSoundscape },
        })
      );
    } catch (e) {}
  }, [isPlaying, selectedSoundscape]);

  // Handle clicking outside to close panel
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const togglePlay = () => {
    if (isPlaying) {
      if (isCurrentYouTube) {
        pauseYouTubeTrack();
      } else {
        zenAudio.stop();
      }
      setIsPlaying(false);
    } else {
      if (isCurrentYouTube) {
        zenAudio.stop();
        playYouTubeTrack();
      } else {
        pauseYouTubeTrack();
        zenAudio.start(selectedSoundscape);
      }
      setIsPlaying(true);
    }
  };

  const handleSelectSoundscape = (id: string) => {
    setSelectedSoundscape(id);
    localStorage.setItem("zen_audio_soundscape", id);
    const targetOpt = SOUNDSCAPE_OPTIONS.find((s) => s.id === id) || SOUNDSCAPE_OPTIONS[0];

    if (targetOpt.isYouTube || id.startsWith("youtube")) {
      zenAudio.stop();
      if (isPlaying) {
        playYouTubeTrack();
      }
    } else {
      pauseYouTubeTrack();
      if (isPlaying) {
        zenAudio.start(id);
      }
    }
  };

  const handleApplyCustomUrl = () => {
    if (!customUrlInput.trim()) return;
    const newId = extractYouTubeId(customUrlInput);
    if (!newId) return;

    setYoutubeUrl(customUrlInput.trim());
    localStorage.setItem("zen_audio_yt_url", customUrlInput.trim());
    setIsCustomUrlOpen(false);
    setCustomUrlInput("");

    if (ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === "function") {
      ytPlayerRef.current.loadVideoById(newId);
      if (!isPlaying) {
        ytPlayerRef.current.pauseVideo();
      }
    }

    if (selectedSoundscape !== "youtube_yulinling") {
      handleSelectSoundscape("youtube_yulinling");
    }
  };

  const handleResetToDefaultYt = () => {
    setYoutubeUrl(DEFAULT_YT_URL);
    localStorage.setItem("zen_audio_yt_url", DEFAULT_YT_URL);
    if (ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === "function") {
      ytPlayerRef.current.loadVideoById(DEFAULT_YT_ID);
      if (!isPlaying) {
        ytPlayerRef.current.pauseVideo();
      }
    }
  };

  const handleStrikeBell = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    zenAudio.strikeSingingBowl(216, 0.7);
    setJustChimed(true);
    setTimeout(() => setJustChimed(false), 2000);
  };

  return (
    <div
      ref={dropdownRef}
      className={`relative ${variant === "menu-card" ? "w-full" : "inline-block"} ${className}`}
    >
      {variant === "menu-card" ? (
        /* Full-width Menu Card Layout */
        <div className="w-full bg-gradient-to-r from-[#201811] via-[#2A1E14] to-[#1E1610] border border-[#523E28] hover:border-[#C9A55A]/70 rounded-xl p-2.5 shadow-md transition-all">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                type="button"
                onClick={togglePlay}
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 cursor-pointer transition-all ${
                  isPlaying
                    ? "bg-gradient-to-br from-[#D6B97A] to-[#B38728] text-[#14110C] shadow-[0_0_12px_rgba(226,183,85,0.4)]"
                    : "bg-[#18130E] text-[#C9A55A] hover:bg-[#261E16] border border-[#483724]"
                }`}
                title={isPlaying ? "Tạm dừng phát nhạc thiền" : "Bật nhạc thiền tĩnh tâm"}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>

              <div className="min-w-0 text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-serif font-bold text-[#F5EAD4] truncate">
                    {isPlaying ? currentOption.shortName : "Nhạc Thiền & Cổ Cầm"}
                  </span>
                  {isPlaying && (
                    <div className="flex items-end gap-[1.5px] h-3 w-3 shrink-0">
                      <span className="w-[2px] bg-[#C9A55A] rounded-full animate-[pulse_0.8s_ease-in-out_infinite] h-full" />
                      <span className="w-[2px] bg-[#C9A55A] rounded-full animate-[pulse_1.2s_ease-in-out_infinite] h-2/3" />
                      <span className="w-[2px] bg-[#C9A55A] rounded-full animate-[pulse_0.9s_ease-in-out_infinite] h-4/5" />
                    </div>
                  )}
                </div>
                <div className="text-[10px] text-[#A69780] truncate font-serif">
                  {isPlaying ? "Đang phát • Vũ Lâm Linh" : "Cổ Cầm & Chuông Bát Tĩnh Tâm"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Chuông bát */}
              <button
                type="button"
                onClick={handleStrikeBell}
                className={`p-1.5 rounded-lg text-[#C4AF92] hover:text-[#C9A55A] hover:bg-[#2A2117] transition-all cursor-pointer border border-[#3E2F1E] ${
                  justChimed ? "text-[#C9A55A] scale-110 shadow-[0_0_8px_#C9A55A]" : ""
                }`}
                title="Thỉnh chuông bát tĩnh tâm 🔔"
              >
                <Bell className="w-4 h-4" />
              </button>

              {/* Nút cài đặt bài hát / âm lượng */}
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-mono transition-colors cursor-pointer border ${
                  isOpen
                    ? "bg-[#332517] text-[#E6D3A3] border-amber-600/60"
                    : "bg-[#18130E] text-[#9E8B76] hover:text-white border-[#382B1B]"
                }`}
                title="Tùy chỉnh bài hát, âm lượng & YouTube"
              >
                <span>{isOpen ? "Thu gọn" : "Cài đặt"}</span>
                {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* Quick Volume Slider in Card */}
          <div className="mt-2 pt-2 border-t border-[#38291B]/80 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setVolume(volume === 0 ? 0.5 : 0)}
              className="text-[#C9A55A] hover:brightness-125 transition-colors cursor-pointer shrink-0"
              title={volume === 0 ? "Bật tiếng" : "Tắt tiếng"}
            >
              {volume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="flex-1 accent-[#C9A55A] h-1.5 bg-[#14100C] rounded-lg cursor-pointer"
            />
            <span className="font-mono text-[10px] text-[#A69780] w-7 text-right">
              {Math.round(volume * 100)}%
            </span>
          </div>

          {/* Accordion Extended Settings (when isOpen is true) */}
          {isOpen && (
            <div className="mt-2.5 pt-2.5 border-t border-[#38291B] space-y-2 animate-in fade-in duration-150">
              {/* Soundscape List */}
              <div className="space-y-1">
                <div className="text-[10px] font-mono text-[#A89882] uppercase tracking-wider px-1">
                  Chọn giai điệu & âm thanh:
                </div>
                {SOUNDSCAPE_OPTIONS.map((item: SoundscapeOption) => {
                  const isSelected = selectedSoundscape === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectSoundscape(item.id)}
                      className={`w-full text-left p-2 rounded-lg border transition-all flex items-center justify-between gap-2 cursor-pointer ${
                        isSelected
                          ? "bg-[#2A2016] border-[#C9A55A] text-white"
                          : "bg-[#14100C] border-[#2A2116] text-[#A69780] hover:border-[#423422] hover:text-[#DDD]"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm">{item.icon}</span>
                        <div className="min-w-0">
                          <div className={`text-xs font-serif font-bold ${isSelected ? "text-[#F5EAD4]" : "text-[#C4B49E]"}`}>
                            {item.name}
                          </div>
                        </div>
                      </div>
                      {isSelected && isPlaying && (
                        <span className="w-2 h-2 rounded-full bg-[#C9A55A] shadow-[0_0_6px_#C9A55A] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* YouTube controls toggle */}
              <div className="pt-1 flex items-center justify-between text-[10px]">
                <button
                  type="button"
                  onClick={() => setShowLiveVideo(!showLiveVideo)}
                  className="text-[#C9A55A] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Tv className="w-3 h-3" />
                  <span>{showLiveVideo ? "Ẩn khung video" : "Xem video YouTube"}</span>
                </button>
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#A69780] hover:text-white flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Mở YouTube</span>
                </a>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Compact Header Pill Button */
        <div className="flex items-center gap-1 bg-[#1A1612]/90 hover:bg-[#221C16] border border-[#3E3222] hover:border-[#C9A55A]/60 rounded-full px-2.5 py-1 shadow-lg backdrop-blur-md transition-all">
          {/* Play/Pause Main Button */}
          <button
            type="button"
            onClick={togglePlay}
            className={`flex items-center gap-2 text-xs font-medium cursor-pointer transition-colors py-0.5 px-1.5 rounded-full ${
              isPlaying ? "text-[#E6C673]" : "text-[#A89882] hover:text-[#E8DAC3]"
            }`}
            title={
              isPlaying
                ? `Dừng phát nhạc thiền (${currentOption.shortName})`
                : `Bật nhạc thiền (${currentOption.shortName})`
            }
          >
            {isPlaying ? (
              <div className="flex items-center gap-1.5">
                {/* Animated sound wave bars */}
                <div className="flex items-end gap-[2px] h-3 w-3.5">
                  <span className="w-[2.5px] bg-[#C9A55A] rounded-full animate-[pulse_0.8s_ease-in-out_infinite] h-full" />
                  <span className="w-[2.5px] bg-[#C9A55A] rounded-full animate-[pulse_1.2s_ease-in-out_infinite] h-2/3" />
                  <span className="w-[2.5px] bg-[#C9A55A] rounded-full animate-[pulse_0.9s_ease-in-out_infinite] h-4/5" />
                </div>
                <span className="hidden sm:inline font-serif font-semibold text-[11px] tracking-wide text-[#F3E3BC]">
                  {currentOption.shortName}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Play className="w-3 h-3 fill-current text-[#C9A55A]" />
                <span className="hidden sm:inline font-serif text-[11px] text-[#B8A790]">
                  {currentOption.shortName || "Nhạc Thiền"}
                </span>
              </div>
            )}
          </button>

          {/* Bell Quick Strike Button */}
          <button
            type="button"
            onClick={handleStrikeBell}
            className={`p-1 rounded-full text-[#BBA588] hover:text-[#C9A55A] hover:bg-[#2A2218] transition-all cursor-pointer ${
              justChimed ? "text-[#C9A55A] scale-110 shadow-[0_0_8px_#C9A55A]" : ""
            }`}
            title="Thỉnh chuông bát tĩnh tâm (Gõ chuông thiền ngay tức thì)"
          >
            <Bell className="w-3 h-3" />
          </button>

          {/* Dropdown Toggle Trigger */}
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="p-1 text-[#8C7B67] hover:text-[#EAE0D0] transition-colors cursor-pointer"
            title="Tùy chỉnh nhạc thiền & âm lượng"
          >
            {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      )}

      {/* Popover Settings Panel (chỉ hiển thị cho variant pill) */}
      {variant === "pill" && isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#16120E] border border-[#483A26] rounded-2xl p-4 shadow-[0_12px_40px_rgba(0,0,0,0.9)] z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#2C2317] pb-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#271E14] border border-[#4A3922] flex items-center justify-center text-[#C9A55A]">
                <Music className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-serif font-bold text-[#F5EAD4] tracking-wide">
                  Âm Thanh Thiền & Cổ Cầm
                </h4>
                <p className="text-[10px] text-[#A69780]">
                  Thanh lọc tâm trí, lắng đọng khi gieo quẻ
                </p>
              </div>
            </div>

            {/* Main on/off switch */}
            <button
              type="button"
              onClick={togglePlay}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                isPlaying
                  ? "bg-[#C9A55A] text-[#14110C] border-[#C9A55A] shadow-[0_0_10px_rgba(212,175,55,0.4)]"
                  : "bg-[#251E16] text-[#A69780] border-[#3E3222] hover:text-[#FFF]"
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3 h-3 fill-current" />
                  Đang Bật
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-current" />
                  Bật Nhạc
                </>
              )}
            </button>
          </div>

          {/* FEATURED TRACK: Vũ Lâm Linh (YouTube) */}
          <div className="mb-3 p-3 rounded-xl bg-gradient-to-r from-[#261C12] via-[#21180F] to-[#18130D] border border-[#5A452B] shadow-lg relative overflow-hidden">
            <div className="flex items-start gap-3">
              {/* Thumbnail / Album Art */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-[#100D0A] border border-[#523F28] shrink-0 group">
                <img
                  src={`https://i.ytimg.com/vi/${currentYtId}/hqdefault.jpg`}
                  alt="Vũ Lâm Linh - Nghiêu Thập Tam"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Play overlay */}
                <button
                  type="button"
                  onClick={() => {
                    if (selectedSoundscape !== "youtube_yulinling") {
                      handleSelectSoundscape("youtube_yulinling");
                      if (!isPlaying) togglePlay();
                    } else {
                      togglePlay();
                    }
                  }}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center text-white hover:bg-black/20 transition-all cursor-pointer"
                  title={isPlaying && isCurrentYouTube ? "Tạm dừng" : "Phát Vũ Lâm Linh"}
                >
                  {isPlaying && isCurrentYouTube ? (
                    <Pause className="w-6 h-6 text-[#C9A55A] fill-current" />
                  ) : (
                    <Play className="w-6 h-6 text-[#C9A55A] fill-current" />
                  )}
                </button>
              </div>

              {/* Track Metadata */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#C9A55A]/20 text-[#E5C778] border border-[#C9A55A]/40">
                    Khuyên Dùng
                  </span>
                  <span className="text-[9px] text-[#A69780] font-mono">YouTube Audio</span>
                </div>
                <h5 className="font-serif font-bold text-xs sm:text-sm text-[#F5EAD4] truncate">
                  Vũ Lâm Linh (雨霖铃)
                </h5>
                <p className="text-[11px] text-[#CBB89B] font-serif truncate">
                  Nghiêu Thập Tam (尧十三)
                </p>
                <p className="text-[10px] text-[#8C7B67] mt-0.5 line-clamp-1">
                  Cổ cầm sâu lắng, thanh tịnh tâm can
                </p>
              </div>
            </div>

            {/* Action Bar for Featured Track */}
            <div className="mt-2.5 pt-2 border-t border-[#3B2C1C] flex items-center justify-between text-[10px] gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowLiveVideo(!showLiveVideo)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                    showLiveVideo
                      ? "bg-[#C9A55A] text-black border-[#C9A55A] font-bold"
                      : "bg-[#1E1710] text-[#BCAEA0] border-[#423220] hover:text-white"
                  }`}
                  title="Hiện hoặc ẩn màn hình video trực tiếp"
                >
                  <Tv className="w-3 h-3" />
                  <span>{showLiveVideo ? "Ẩn Video" : "Xem Video"}</span>
                </button>

                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[#A6957E] hover:text-[#E8DAC3] transition-colors"
                  title="Mở video trên YouTube tab mới"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Mở YouTube</span>
                </a>
              </div>

              <button
                type="button"
                onClick={() => setIsCustomUrlOpen(!isCustomUrlOpen)}
                className="text-[10px] text-[#A6957E] hover:text-[#C9A55A] transition-colors underline cursor-pointer"
              >
                {isCustomUrlOpen ? "Đóng đổi link" : "Đổi link YouTube"}
              </button>
            </div>

            {/* Custom YouTube URL Input Accordion */}
            {isCustomUrlOpen && (
              <div className="mt-2 pt-2 border-t border-[#3B2C1C] text-[11px] animate-in fade-in duration-150">
                <label className="block text-[10px] text-[#A69780] mb-1">
                  Nhập URL video YouTube muốn phát:
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="flex-1 bg-[#130F0B] border border-[#443322] rounded-lg px-2 py-1 text-xs text-[#EAE0D0] focus:outline-none focus:border-[#C9A55A]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCustomUrl}
                    className="px-2.5 py-1 bg-[#C9A55A] hover:bg-[#E5BF47] text-black font-bold text-xs rounded-lg cursor-pointer transition-colors"
                  >
                    Áp dụng
                  </button>
                </div>
                {youtubeUrl !== DEFAULT_YT_URL && (
                  <button
                    type="button"
                    onClick={handleResetToDefaultYt}
                    className="mt-1.5 flex items-center gap-1 text-[10px] text-[#C9A55A] hover:underline cursor-pointer"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>Khôi phục Vũ Lâm Linh (mặc định)</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Volume Control */}
          <div className="bg-[#1C1712] border border-[#33281B] rounded-xl p-2.5 mb-3">
            <div className="flex items-center justify-between text-[11px] text-[#C8B89E] mb-1.5">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setVolume(volume === 0 ? 0.5 : 0)}
                  className="text-[#C9A55A] hover:brightness-125 transition-colors cursor-pointer"
                  title={volume === 0 ? "Bật tiếng" : "Tắt tiếng"}
                >
                  {volume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
                <span>Âm lượng</span>
              </div>
              <span className="font-mono text-[#EAD8B1]">{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full accent-[#C9A55A] h-1.5 bg-[#2B2217] rounded-lg cursor-pointer"
            />
          </div>

          {/* Soundscapes List */}
          <div className="space-y-1.5 mb-3">
            <div className="text-[10px] font-mono text-[#A89882] uppercase tracking-wider px-1">
              Tùy chọn giai điệu khác
            </div>
            {SOUNDSCAPE_OPTIONS.map((item: SoundscapeOption) => {
              const isSelected = selectedSoundscape === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectSoundscape(item.id)}
                  className={`w-full text-left p-2 rounded-xl border transition-all flex items-start gap-2.5 cursor-pointer ${
                    isSelected
                      ? "bg-[#251D14] border-[#C9A55A] text-[#FFF] shadow-[0_0_12px_rgba(212,175,55,0.15)]"
                      : "bg-[#14100C] border-[#2A2116] text-[#A69780] hover:border-[#423422] hover:text-[#DDD]"
                  }`}
                >
                  <span className="text-base mt-0.5">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-serif font-bold ${
                          isSelected ? "text-[#F5EAD4]" : "text-[#C4B49E]"
                        }`}
                      >
                        {item.name}
                      </span>
                      {isSelected && isPlaying && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C9A55A] shadow-[0_0_6px_#C9A55A]" />
                      )}
                    </div>
                    <p className="text-[10px] text-[#8C7B67] leading-relaxed mt-0.5 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Instant Singing Bowl Strike Button */}
          <button
            type="button"
            onClick={handleStrikeBell}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#2A2015] to-[#22190F] hover:from-[#35281B] hover:to-[#2B2014] border border-[#4D3A24] text-[#EAD8B1] hover:text-[#FFF] text-xs font-medium flex items-center justify-center gap-2 shadow transition-all cursor-pointer"
          >
            <Bell className={`w-3.5 h-3.5 text-[#C9A55A] ${justChimed ? "animate-bounce" : ""}`} />
            <span>Thỉnh Tiếng Chuông Bát Tĩnh Tâm</span>
          </button>
        </div>
      )}

      {/* Persistent YouTube Audio Frame: Always stays in DOM so music never stops across page views or popover toggles */}
      <div
        className={
          showLiveVideo && isOpen && isCurrentYouTube
            ? "fixed sm:absolute right-4 sm:right-0 top-16 sm:top-14 z-50 w-72 sm:w-80 h-44 rounded-xl overflow-hidden shadow-2xl border-2 border-[#C9A55A] bg-black"
            : "fixed -left-[9999px] -top-[9999px] w-[200px] h-[150px] pointer-events-none opacity-0"
        }
      >
        <iframe
          id="zen-yt-player-iframe"
          ref={iframeRef}
          src={`https://www.youtube-nocookie.com/embed/${currentYtId}?enablejsapi=1&autoplay=0&loop=1&playlist=${currentYtId}&controls=1&modestbranding=1&playsinline=1`}
          title="Nhạc thiền Vũ Lâm Linh"
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    </div>
  );
};
