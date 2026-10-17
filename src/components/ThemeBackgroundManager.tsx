import React, { useState, useEffect, useRef } from "react";
import {
  Sun,
  Moon,
  Sliders,
  Check,
  Upload,
  Image as ImageIcon,
  RotateCcw,
  X,
  Sparkles,
  Palette,
  ChevronRight,
  Eye,
  Trash2,
} from "lucide-react";

export type ThemeMode = "dark" | "light";
export type BackgroundPatternId =
  | "none"
  | "bagua"
  | "clouds"
  | "mountains"
  | "lotus"
  | "paper"
  | "stars"
  | "taiji"
  | "custom";

export interface ThemeConfig {
  mode: ThemeMode;
  pattern: BackgroundPatternId;
  brightness: number; // 10 to 100
  customUrl?: string;
}

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  mode: "dark",
  pattern: "clouds",
  brightness: 45,
  customUrl: "",
};

// SVG PATTERN 1: Bát Quái Càn Khôn & Thái Cực (Taiji & Bagua)
const BAGUA_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <defs>
    <radialGradient id="g1" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="%23C9A55A" stop-opacity="0.14"/>
      <stop offset="60%" stop-color="%23C9A55A" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="%23C9A55A" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <circle cx="200" cy="200" r="180" fill="url(%23g1)"/>
  <circle cx="200" cy="200" r="170" fill="none" stroke="%23C9A55A" stroke-width="1.2" stroke-opacity="0.32" stroke-dasharray="6,4"/>
  <circle cx="200" cy="200" r="145" fill="none" stroke="%23C9A55A" stroke-width="0.8" stroke-opacity="0.25"/>
  <circle cx="200" cy="200" r="105" fill="none" stroke="%23C9A55A" stroke-width="1.2" stroke-opacity="0.28"/>
  <circle cx="200" cy="200" r="50" fill="none" stroke="%23C9A55A" stroke-width="1.5" stroke-opacity="0.35"/>
  <path d="M 200,150 A 25,25 0 0,1 200,200 A 25,25 0 0,0 200,250 A 50,50 0 0,1 200,150 Z" fill="%23C9A55A" fill-opacity="0.22"/>
  <circle cx="200" cy="175" r="5" fill="%23C9A55A" fill-opacity="0.5"/>
  <circle cx="200" cy="225" r="5" fill="%23000000" fill-opacity="0.45"/>
  <g stroke="%23C9A55A" stroke-width="2" stroke-opacity="0.35" stroke-linecap="round">
    <line x1="185" y1="36" x2="215" y2="36"/>
    <line x1="185" y1="42" x2="215" y2="42"/>
    <line x1="185" y1="48" x2="215" y2="48"/>
    <line x1="185" y1="352" x2="197" y2="352"/><line x1="203" y1="352" x2="215" y2="352"/>
    <line x1="185" y1="358" x2="197" y2="358"/><line x1="203" y1="358" x2="215" y2="358"/>
    <line x1="185" y1="364" x2="197" y2="364"/><line x1="203" y1="364" x2="215" y2="364"/>
    <line x1="352" y1="185" x2="352" y2="215"/>
    <line x1="358" y1="185" x2="358" y2="197"/><line x1="358" y1="203" x2="358" y2="215"/>
    <line x1="364" y1="185" x2="364" y2="215"/>
    <line x1="36" y1="185" x2="36" y2="197"/><line x1="36" y1="203" x2="36" y2="215"/>
    <line x1="42" y1="185" x2="42" y2="215"/>
    <line x1="48" y1="185" x2="48" y2="197"/><line x1="48" y1="203" x2="48" y2="215"/>
  </g>
</svg>`;

// SVG PATTERN 2: Tường Vân Cát Tường (Auspicious Clouds)
const CLOUDS_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="240" height="160" viewBox="0 0 240 160">
  <path d="M 20,80 Q 25,60 45,65 Q 65,45 90,60 Q 115,50 125,70 Q 140,75 135,90 Q 120,105 95,95 Q 75,105 50,95 Q 25,100 20,80 Z" fill="none" stroke="%23C9A55A" stroke-width="1.2" stroke-opacity="0.25"/>
  <path d="M 40,75 Q 55,68 70,76 Q 85,68 100,75" fill="none" stroke="%23C9A55A" stroke-width="0.8" stroke-opacity="0.18"/>
  <path d="M 140,40 Q 145,20 165,25 Q 185,10 205,25 Q 225,15 235,35 Q 240,50 225,58 Q 200,65 180,55 Q 160,65 145,52 Z" fill="none" stroke="%23C9A55A" stroke-width="1.2" stroke-opacity="0.25"/>
  <path d="M 120,130 Q 130,115 150,120 Q 170,108 190,122 Q 210,115 218,132 Q 215,148 195,152 Q 170,158 150,148 Q 130,155 120,130 Z" fill="none" stroke="%23C9A55A" stroke-width="1.1" stroke-opacity="0.2"/>
</svg>`;

// SVG PATTERN 3: Sơn Thủy Thủy Mặc (Zen Mountains & Mist)
const MOUNTAINS_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="300" viewBox="0 0 600 300">
  <path d="M 0,300 L 0,190 Q 70,110 140,165 Q 210,90 290,180 Q 360,120 440,200 Q 520,130 600,195 L 600,300 Z" fill="%23C9A55A" fill-opacity="0.08"/>
  <path d="M 0,300 L 0,220 Q 90,160 180,210 Q 270,150 370,220 Q 480,170 600,240 L 600,300 Z" fill="%23C9A55A" fill-opacity="0.1"/>
  <circle cx="480" cy="80" r="38" fill="%23C9A55A" fill-opacity="0.1"/>
  <line x1="50" y1="210" x2="250" y2="210" stroke="%23C9A55A" stroke-width="1.5" stroke-opacity="0.16" stroke-dasharray="40,20,60,15"/>
  <line x1="280" y1="235" x2="520" y2="235" stroke="%23C9A55A" stroke-width="1.5" stroke-opacity="0.14" stroke-dasharray="50,25,40,10"/>
</svg>`;

// SVG PATTERN 4: Hoa Sen Thiền Định (Sacred Zen Lotus)
const LOTUS_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
  <g fill="none" stroke="%23C9A55A" stroke-width="1.2" stroke-opacity="0.28">
    <path d="M 150,80 C 135,120 135,160 150,190 C 165,160 165,120 150,80 Z" fill="%23C9A55A" fill-opacity="0.09"/>
    <path d="M 150,190 C 115,165 95,130 115,95 C 135,120 145,155 150,190 Z" fill="%23C9A55A" fill-opacity="0.06"/>
    <path d="M 150,190 C 90,180 70,140 85,120 C 110,135 130,165 150,190 Z" fill="%23C9A55A" fill-opacity="0.04"/>
    <path d="M 150,190 C 185,165 205,130 185,95 C 165,120 155,155 150,190 Z" fill="%23C9A55A" fill-opacity="0.06"/>
    <path d="M 150,190 C 210,180 230,140 215,120 C 190,135 170,165 150,190 Z" fill="%23C9A55A" fill-opacity="0.04"/>
    <ellipse cx="150" cy="205" rx="80" ry="12" stroke-dasharray="8,6" stroke-opacity="0.22"/>
    <ellipse cx="150" cy="215" rx="120" ry="18" stroke-dasharray="12,8" stroke-opacity="0.16"/>
  </g>
</svg>`;

// SVG PATTERN 5: Giấy Xuyến Cổ Điển (Handmade Rice Paper texture)
const PAPER_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
  <filter id="noise">
    <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
    <feColorMatrix type="matrix" values="1 0 0 0 0.8  0 1 0 0 0.7  0 0 1 0 0.5  0 0 0 0.08 0"/>
  </filter>
  <rect width="160" height="160" filter="url(%23noise)"/>
  <path d="M 10,25 Q 35,28 60,22 Q 85,18 110,24" stroke="%23C9A55A" stroke-width="0.5" stroke-opacity="0.12" fill="none"/>
  <path d="M 40,85 Q 75,80 120,88" stroke="%23C9A55A" stroke-width="0.5" stroke-opacity="0.1" fill="none"/>
  <path d="M 20,135 Q 80,140 140,132" stroke="%23C9A55A" stroke-width="0.5" stroke-opacity="0.1" fill="none"/>
</svg>`;

// SVG PATTERN 6: Tinh Tú Bắc Đẩu & Nhị Thập Bát Tú (Sacred Constellations)
const STARS_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
  <g fill="%23C9A55A">
    <circle cx="50" cy="50" r="2" fill-opacity="0.45"/>
    <circle cx="120" cy="35" r="1.5" fill-opacity="0.35"/>
    <circle cx="210" cy="70" r="2.5" fill-opacity="0.5"/>
    <circle cx="260" cy="40" r="1.2" fill-opacity="0.3"/>
    <circle cx="40" cy="180" r="1.8" fill-opacity="0.4"/>
    <circle cx="160" cy="160" r="3" fill-opacity="0.6"/>
    <circle cx="240" cy="200" r="1.5" fill-opacity="0.35"/>
    <circle cx="90" cy="240" r="2" fill-opacity="0.45"/>
    <circle cx="200" cy="260" r="1.8" fill-opacity="0.4"/>
  </g>
  <path d="M 50,50 L 120,35 L 210,70 L 160,160 L 90,240" stroke="%23C9A55A" stroke-width="0.6" stroke-opacity="0.22" stroke-dasharray="3,3" fill="none"/>
</svg>`;

// SVG PATTERN 7: Thái Cực Lưỡng Nghi Vàng Kim (Taiji Symbol)
const TAIJI_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="260" height="260" viewBox="0 0 260 260">
  <g transform="translate(130,130)">
    <circle cx="0" cy="0" r="95" fill="none" stroke="%23C9A55A" stroke-width="1.5" stroke-opacity="0.3"/>
    <circle cx="0" cy="0" r="115" fill="none" stroke="%23C9A55A" stroke-width="0.8" stroke-opacity="0.2" stroke-dasharray="4,4"/>
    <path d="M 0,-95 A 95,95 0 0,1 0,95 A 47.5,47.5 0 0,1 0,0 A 47.5,47.5 0 0,0 0,-95 Z" fill="%23C9A55A" fill-opacity="0.14"/>
    <circle cx="0" cy="-47.5" r="9" fill="%23C9A55A" fill-opacity="0.4"/>
    <circle cx="0" cy="47.5" r="9" fill="%23000000" fill-opacity="0.35"/>
  </g>
</svg>`;

export const PATTERN_OPTIONS: {
  id: BackgroundPatternId;
  name: string;
  subtitle: string;
  icon: string;
  svgUrl?: string;
}[] = [
  {
    id: "none",
    name: "Tối Giản Thuần Túy",
    subtitle: "Màu trơn dịu êm, không họa tiết",
    icon: "☯",
  },
  {
    id: "bagua",
    name: "Bát Quái Càn Khôn",
    subtitle: "Thái Cực & 8 quẻ hào chìm uy nghiêm",
    icon: "☰",
    svgUrl: BAGUA_SVG,
  },
  {
    id: "clouds",
    name: "Tường Vân Cát Tường",
    subtitle: "Mây lành uốn lượn phong thủy đại cát",
    icon: "☁",
    svgUrl: CLOUDS_SVG,
  },
  {
    id: "mountains",
    name: "Sơn Thủy Hữu Tình",
    subtitle: "Tranh thủy mặc núi non & sương mờ",
    icon: "⛰",
    svgUrl: MOUNTAINS_SVG,
  },
  {
    id: "lotus",
    name: "Hoa Sen Thiền Định",
    subtitle: "Liên hoa thanh tịnh thoát tục an yên",
    icon: "🪷",
    svgUrl: LOTUS_SVG,
  },
  {
    id: "stars",
    name: "Tinh Tú Bắc Đẩu",
    subtitle: "Ngàn sao lung linh định hướng tương lai",
    icon: "✨",
    svgUrl: STARS_SVG,
  },
  {
    id: "taiji",
    name: "Thái Cực Lưỡng Nghi",
    subtitle: "Âm dương giao hòa sinh vạn vật",
    icon: "☯",
    svgUrl: TAIJI_SVG,
  },
  {
    id: "paper",
    name: "Giấy Xuyến Cổ Điển",
    subtitle: "Vân giấy điệp hoàng cung cổ xưa",
    icon: "📜",
    svgUrl: PAPER_SVG,
  },
  {
    id: "custom",
    name: "Hình Nền Tự Chọn",
    subtitle: "Tải ảnh từ máy hoặc dán liên kết ảnh",
    icon: "🖼",
  },
];

// Hook to load & persist theme config (Fixed dark spiritual aesthetic)
export const useThemeConfig = () => {
  const [config, setConfig] = useState<ThemeConfig>(() => {
    try {
      localStorage.removeItem("iching_theme_config");
    } catch {}
    return { ...DEFAULT_THEME_CONFIG, mode: "dark" };
  });

  const saveConfig = (newConfig: Partial<ThemeConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig, mode: "dark" }));
  };

  useEffect(() => {
    // Ensure document element uses dark mode without light theme remnants
    const root = document.documentElement;
    root.classList.remove("theme-light");
    root.classList.add("theme-dark");
  }, []);

  return { config, saveConfig };
};

// DYNAMIC BACKGROUND COMPONENT
export const DynamicBackgroundLayer: React.FC<{ config: ThemeConfig }> = ({ config }) => {
  const currentOption = PATTERN_OPTIONS.find((p) => p.id === config.pattern);
  const patternUrl = config.pattern === "custom" ? config.customUrl : currentOption?.svgUrl;
  const isLight = config.mode === "light";

  // Base background color and radial gradient adjusted by brightness
  const baseBgDark =
    config.brightness < 30
      ? "#050403"
      : config.brightness < 65
      ? "#0D0B09"
      : "#15100C";

  const baseGradientDark =
    config.brightness < 30
      ? "radial-gradient(ellipse at 50% -10%, #15100B 0%, #080605 50%, #030202 100%)"
      : config.brightness < 65
      ? "radial-gradient(ellipse at 50% -10%, #1C1712 0%, #0D0B09 55%, #070605 100%)"
      : "radial-gradient(ellipse at 50% -10%, #302317 0%, #1A130E 55%, #0B0806 100%)";

  const baseBgLight =
    config.brightness < 30
      ? "#EDE2D2"
      : config.brightness < 65
      ? "#F7F2E9"
      : "#FFFDF9";

  const baseGradientLight =
    config.brightness < 30
      ? "radial-gradient(ellipse at 50% -10%, #F4ECE0 0%, #E8DDC9 50%, #D8CBB6 100%)"
      : config.brightness < 65
      ? "radial-gradient(ellipse at 50% -10%, #FFFFFF 0%, #F6F0E4 50%, #ECE3D4 100%)"
      : "radial-gradient(ellipse at 50% -10%, #FFFFFF 0%, #FCFAF5 50%, #F5ECE0 100%)";

  // Pattern opacity & brightness scaling
  const patternOpacity =
    config.pattern === "none"
      ? 0
      : (config.brightness / 100) * (isLight ? 0.42 : 0.65);

  const patternBrightness = isLight
    ? 0.75 + (config.brightness / 100) * 0.45
    : 0.35 + (config.brightness / 100) * 0.85;

  return (
    <div
      aria-hidden="true"
      id="dynamic-theme-background-layer"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-all duration-500 select-none"
    >
      {/* 1. Base Gradient Atmosphere */}
      <div
        className="absolute inset-0 transition-colors duration-500"
        style={{
          backgroundColor: isLight ? baseBgLight : baseBgDark,
          backgroundImage: isLight ? baseGradientLight : baseGradientDark,
        }}
      />

      {/* 2. Feng Shui Pattern / Wallpaper Layer */}
      {patternUrl && config.pattern !== "none" && (
        <div
          className="absolute inset-0 bg-repeat bg-center transition-all duration-300"
          style={{
            backgroundImage: `url("${patternUrl}")`,
            backgroundSize: config.pattern === "custom" ? "cover" : undefined,
            opacity: patternOpacity,
            filter: `brightness(${patternBrightness}) contrast(1.1)`,
          }}
        />
      )}

      {/* 3. Ambient Lighting & Dimming Overlay */}
      {isLight ? (
        config.brightness < 50 ? (
          // Dimming tea-tint overlay for soft eye-protection in light mode
          <div
            className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
            style={{
              backgroundColor: "#3D2B1A",
              opacity: ((50 - config.brightness) / 50) * 0.22,
            }}
          />
        ) : (
          // Radiant clean white glow for high brightness in light mode
          <div
            className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
            style={{
              backgroundColor: "#FFFFFF",
              opacity: ((config.brightness - 50) / 50) * 0.55,
            }}
          />
        )
      ) : (
        config.brightness < 50 ? (
          // Deep black darkening overlay for nocturnal low brightness in dark mode
          <div
            className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
            style={{
              backgroundColor: "#000000",
              opacity: ((50 - config.brightness) / 50) * 0.72,
            }}
          />
        ) : (
          // Warm golden temple ambient aura for high brightness in dark mode
          <div
            className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 20%, rgba(212, 175, 55, ${
                ((config.brightness - 50) / 50) * 0.18
              }) 0%, rgba(255, 230, 150, ${
                ((config.brightness - 50) / 50) * 0.08
              }) 50%, transparent 80%)`,
            }}
          />
        )
      )}

      {/* 4. Fine Grain Texture overlay for spiritual tactile depth */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};

// THEME & BACKGROUND SETTINGS MODAL
interface ThemeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ThemeConfig;
  onUpdateConfig: (newConfig: Partial<ThemeConfig>) => void;
}

export const ThemeSettingsModal: React.FC<ThemeSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [customInputUrl, setCustomInputUrl] = useState(config.customUrl || "");
  const [previewError, setPreviewError] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    setCustomInputUrl(config.customUrl || "");
  }, [config.customUrl]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Tệp ảnh vượt quá 5MB. Vui lòng chọn ảnh nhẹ hơn để tải mượt mà.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setCustomInputUrl(dataUrl);
        onUpdateConfig({ pattern: "custom", customUrl: dataUrl });
        setPreviewError(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = () => {
    setUploadError(null);
    if (!customInputUrl.trim()) return;
    onUpdateConfig({ pattern: "custom", customUrl: customInputUrl.trim() });
    setPreviewError(false);
  };

  const handleClearCustomUrl = () => {
    setCustomInputUrl("");
    onUpdateConfig({ pattern: "bagua", customUrl: "" });
  };

  const handleReset = () => {
    onUpdateConfig(DEFAULT_THEME_CONFIG);
    setCustomInputUrl("");
    setUploadError(null);
  };

  const isLight = config.mode === "light";
  const currentOption = PATTERN_OPTIONS.find((p) => p.id === config.pattern);
  const patternUrl = config.pattern === "custom" ? config.customUrl : currentOption?.svgUrl;

  const BRIGHTNESS_PRESETS = [
    { label: "Tối Dịu", val: 20 },
    { label: "Huyền Mặc", val: 40 },
    { label: "Cân Bằng", val: 55 },
    { label: "Sáng Rõ", val: 80 },
    { label: "Sáng Rực", val: 100 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ${
          isLight
            ? "bg-[#FCF9F3] border-[#D6C5AF] text-[#281E15]"
            : "bg-[#16120E] border-[#443322] text-[#F0E5D5]"
        }`}
      >
        {/* Modal Header */}
        <div
          className={`flex items-center justify-between px-5 py-4 border-b ${
            isLight
              ? "border-[#E4D7C5] bg-[#F4ECDF]"
              : "border-[#332517] bg-[#1E1711]"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#C9A55A] to-[#8C6218] flex items-center justify-center text-[#120F0C] font-bold shadow-md">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-serif font-bold tracking-wide">
                Chỉnh Hình Nền & Độ Sáng / Tối
              </h3>
              <p className="text-[11px] opacity-75 font-serif">
                Tùy biến không gian chiêm bái theo nhãn lực & sở thích
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg opacity-70 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 text-xs sm:text-sm">
          {/* LIVE MINI PREVIEW OF BACKGROUND */}
          <div className="relative w-full h-24 sm:h-28 rounded-xl overflow-hidden border border-[#C9A55A]/50 shadow-inner flex flex-col justify-between p-3 select-none">
            {/* Background preview */}
            <div
              className="absolute inset-0 transition-all duration-300"
              style={{
                backgroundColor: isLight
                  ? config.brightness < 30
                    ? "#EDE2D2"
                    : config.brightness < 65
                    ? "#F7F2E9"
                    : "#FFFDF9"
                  : config.brightness < 30
                  ? "#050403"
                  : config.brightness < 65
                  ? "#0D0B09"
                  : "#15100C",
              }}
            />

            {/* Pattern in preview */}
            {patternUrl && config.pattern !== "none" && (
              <div
                className="absolute inset-0 bg-repeat bg-center transition-all duration-200"
                style={{
                  backgroundImage: `url("${patternUrl}")`,
                  backgroundSize: config.pattern === "custom" ? "cover" : "180px",
                  opacity: (config.brightness / 100) * (isLight ? 0.42 : 0.65),
                  filter: `brightness(${isLight ? 0.9 : 0.8}) contrast(1.1)`,
                }}
              />
            )}

            {/* Overlay in preview */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundColor: isLight ? "#FFFFFF" : "#000000",
                opacity: isLight
                  ? config.brightness > 50
                    ? ((config.brightness - 50) / 50) * 0.45
                    : 0
                  : config.brightness < 50
                  ? ((50 - config.brightness) / 50) * 0.6
                  : 0,
              }}
            />

            {/* Live badge in preview */}
            <div className="relative z-10 flex items-center justify-between">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-serif font-bold shadow-sm border ${
                  isLight
                    ? "bg-white/90 text-[#523712] border-[#C9A55A]"
                    : "bg-black/70 text-[#E6D3A3] border-[#C9A55A]/60"
                }`}
              >
                <Eye className="w-3 h-3 text-[#C9A55A]" />
                Xem trước: {isLight ? "Nền Sáng" : "Nền Tối"} • {currentOption?.name}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#C9A55A] text-black shadow">
                Độ Sáng: {config.brightness}%
              </span>
            </div>

            <div
              className={`relative z-10 text-center font-serif text-xs font-semibold ${
                isLight ? "text-[#3D2C1C]" : "text-[#F5EAD4]"
              }`}
            >
              Bát Quái Càn Khôn • Âm Dương Giao Cảm • Tâm Động Quẻ Sinh
            </div>
          </div>

          {/* 1. CHUYỂN ĐỔI CHẾ ĐỘ NỀN: SÁNG ⇋ TỐI */}
          <div>
            <label className="font-serif font-bold text-xs uppercase tracking-wider block mb-2 opacity-85">
              1. Chế Độ Hiển Thị Tổng Quan (Sáng / Tối)
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Nền Tối Option */}
              <button
                type="button"
                onClick={() => onUpdateConfig({ mode: "dark" })}
                className={`p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer text-left ${
                  config.mode === "dark"
                    ? "bg-[#251B12] border-[#C9A55A] ring-2 ring-[#C9A55A] shadow-lg text-[#E6D3A3]"
                    : "bg-[#1A140F] border-[#38281A] text-[#A69580] hover:border-[#63482F]"
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-[#0F0D0B] border border-[#423120] flex items-center justify-center text-[#C9A55A] shrink-0 shadow-inner">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-serif font-bold text-sm">Chế Độ Tối (Huyền Bí)</div>
                  <div className="text-[10px] opacity-75 mt-0.5">
                    Gỗ mun & trầm hương tĩnh mịch, dịu mắt
                  </div>
                </div>
                {config.mode === "dark" && (
                  <Check className="w-4 h-4 ml-auto text-[#C9A55A] shrink-0" />
                )}
              </button>

              {/* Nền Sáng Option */}
              <button
                type="button"
                onClick={() => onUpdateConfig({ mode: "light" })}
                className={`p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer text-left ${
                  config.mode === "light"
                    ? "bg-[#FFF9EE] border-[#C9A55A] ring-2 ring-[#C9A55A] shadow-lg text-[#7C530E]"
                    : "bg-[#F3EDE2] border-[#D8C9B5] text-[#7A6956] hover:border-[#B5A189]"
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-[#FAF6EE] border border-[#D8C7B0] flex items-center justify-center text-amber-600 shrink-0 shadow-sm">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-serif font-bold text-sm">Chế Độ Sáng (Thanh Nhã)</div>
                  <div className="text-[10px] opacity-75 mt-0.5">
                    Giấy xuyến ngọc ngà, trong sáng tao nhã
                  </div>
                </div>
                {config.mode === "light" && (
                  <Check className="w-4 h-4 ml-auto text-amber-600 shrink-0" />
                )}
              </button>
            </div>
          </div>

          {/* 2. THANH TRƯỢT ĐIỀU CHỈNH ĐỘ SÁNG / TỐI NỀN */}
          <div
            className={`p-3.5 rounded-xl border ${
              isLight ? "bg-[#F5EDE1] border-[#DECFC0]" : "bg-[#1C1611] border-[#3A2A1B]"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-serif font-bold text-xs flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#C9A55A]" />
                2. Thanh Trượt Chỉnh Độ Sáng / Tối Hình Nền:
              </span>
              <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-full bg-[#C9A55A]/20 text-[#C9A55A] border border-[#C9A55A]/40 flex items-center gap-1">
                {config.brightness > 50 ? (
                  <Sun className="w-3 h-3 text-amber-400" />
                ) : (
                  <Moon className="w-3 h-3 text-amber-300" />
                )}
                {config.brightness}%
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] opacity-70 font-mono shrink-0">Tối (10%)</span>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={config.brightness}
                onChange={(e) => onUpdateConfig({ brightness: Number(e.target.value) })}
                className="w-full h-2.5 bg-[#2D2116] rounded-lg appearance-none cursor-pointer accent-[#C9A55A]"
              />
              <span className="text-[11px] opacity-70 font-mono shrink-0">Sáng (100%)</span>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 mt-3 flex-wrap">
              <span className="text-[10px] opacity-75 font-serif mr-1">Mức nhanh:</span>
              {BRIGHTNESS_PRESETS.map((preset) => (
                <button
                  key={preset.val}
                  type="button"
                  onClick={() => onUpdateConfig({ brightness: preset.val })}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-serif transition-all cursor-pointer border ${
                    config.brightness === preset.val
                      ? "bg-[#C9A55A] text-black font-bold border-[#C9A55A] shadow-sm scale-105"
                      : isLight
                      ? "bg-white border-[#D6C6B2] text-[#4A3928] hover:border-[#C9A55A]"
                      : "bg-[#251D16] border-[#443322] text-[#C4B29A] hover:border-[#C9A55A]"
                  }`}
                >
                  {preset.label} ({preset.val}%)
                </button>
              ))}
            </div>

            <div className="flex justify-between text-[10px] opacity-60 font-serif mt-2 px-1">
              <span>Huyền mịch êm mắt</span>
              <span>Cân bằng thư thái</span>
              <span>Rạng rỡ sắc nét</span>
            </div>
          </div>

          {/* 3. BỘ SƯU TẬP HÌNH NỀN PHONG THỦY */}
          <div>
            <label className="font-serif font-bold text-xs uppercase tracking-wider block mb-2 opacity-85 flex items-center justify-between">
              <span>3. Bộ Sưu Tập Hình Nền Tuyển Chọn:</span>
              <span className="text-[10px] font-normal normal-case opacity-70">
                Nhấp chọn để áp dụng ngay
              </span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {PATTERN_OPTIONS.map((item) => {
                const isSelected = config.pattern === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onUpdateConfig({ pattern: item.id })}
                    className={`p-2.5 rounded-xl border flex flex-col items-center text-center transition-all cursor-pointer relative ${
                      isSelected
                        ? "bg-[#C9A55A]/15 border-[#C9A55A] ring-1 ring-[#C9A55A] shadow-md font-bold"
                        : isLight
                        ? "bg-[#FAF5ED] border-[#DCCEC0] hover:border-[#BFAF9C]"
                        : "bg-[#18130E] border-[#352518] hover:border-[#523A25]"
                    }`}
                  >
                    <span className="text-xl sm:text-2xl mb-1">{item.icon}</span>
                    <span className="font-serif text-xs line-clamp-1">{item.name}</span>
                    <span className="text-[9px] opacity-70 line-clamp-1 font-serif mt-0.5">
                      {item.subtitle}
                    </span>
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#C9A55A] text-black rounded-full flex items-center justify-center text-[9px] font-bold">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. TÙY BIẾN HÌNH NỀN TỰ CHỌN (CUSTOM WALLPAPER) */}
          {config.pattern === "custom" && (
            <div
              className={`p-3.5 rounded-xl border space-y-3 animate-in fade-in duration-200 ${
                isLight ? "bg-[#FAF3E8] border-[#DFCFC0]" : "bg-[#1A140F] border-[#3D2C1C]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-xs flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-[#C9A55A]" />
                  Tải Ảnh Hình Nền Cá Nhân:
                </span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1 px-3 py-1 text-[11px] font-serif font-bold bg-[#C9A55A] text-[#120F0C] rounded-lg shadow hover:brightness-110 cursor-pointer"
                >
                  <Upload className="w-3 h-3" />
                  <span>Chọn Tệp Ảnh Từ Máy</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {uploadError && (
                <div className="text-[11px] text-rose-400 bg-rose-950/40 border border-rose-800/60 p-2 rounded-lg">
                  {uploadError}
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Hoặc dán liên kết URL ảnh (https://...)"
                  value={customInputUrl}
                  onChange={(e) => setCustomInputUrl(e.target.value)}
                  className={`flex-1 px-3 py-1.5 text-xs rounded-lg border outline-none font-mono ${
                    isLight
                      ? "bg-white border-[#D6C6B2] text-[#281D14] focus:border-[#C9A55A]"
                      : "bg-[#110D09] border-[#3E2B1A] text-[#F3E7D5] focus:border-[#C9A55A]"
                  }`}
                />
                <button
                  type="button"
                  onClick={handleApplyCustomUrl}
                  className="px-3 py-1.5 text-xs font-serif font-bold bg-[#2A1D12] text-[#E6D3A3] border border-[#5A3F23] rounded-lg hover:border-[#C9A55A] cursor-pointer shrink-0"
                >
                  Áp Dụng
                </button>
              </div>

              {config.customUrl && (
                <div className="relative w-full h-24 rounded-lg overflow-hidden border border-[#523C27]">
                  <img
                    src={config.customUrl}
                    alt="Xem trước hình nền"
                    className="w-full h-full object-cover"
                    onError={() => setPreviewError(true)}
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-between px-3 text-[11px] text-white font-serif">
                    <span>
                      {previewError ? "Ảnh lỗi, vui lòng kiểm tra lại liên kết" : "Đang áp dụng hình nền này"}
                    </span>
                    <button
                      type="button"
                      onClick={handleClearCustomUrl}
                      className="px-2 py-1 rounded bg-rose-600/80 hover:bg-rose-600 text-white flex items-center gap-1 text-[10px]"
                      title="Xóa hình nền này"
                    >
                      <Trash2 className="w-3 h-3" />
                      Xóa
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className={`flex items-center justify-between px-5 py-3 border-t ${
            isLight
              ? "border-[#E4D7C5] bg-[#F4ECDF]"
              : "border-[#332517] bg-[#1E1711]"
          }`}
        >
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs opacity-75 hover:opacity-100 hover:text-[#C9A55A] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Mặc Định Ban Đầu</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-serif font-bold rounded-xl bg-gradient-to-r from-[#C9A55A] via-[#F2CA65] to-[#B8860B] text-[#120F0C] shadow-lg hover:brightness-110 transition-all cursor-pointer active:scale-95"
          >
            Hoàn Tất & Lưu Lại
          </button>
        </div>
      </div>
    </div>
  );
};

// QUICK TOGGLE BUTTON FOR HEADER
interface ThemeQuickToggleButtonProps {
  config: ThemeConfig;
  onToggleMode: () => void;
  onOpenSettings: () => void;
}

export const ThemeQuickToggleButton: React.FC<ThemeQuickToggleButtonProps> = ({
  config,
  onToggleMode,
  onOpenSettings,
}) => {
  const isLight = config.mode === "light";

  return (
    <div className="flex items-center bg-[#1A1510] border border-[#3A2C1D] rounded-xl p-0.5 shadow-sm">
      {/* Quick toggle Light / Dark */}
      <button
        type="button"
        onClick={onToggleMode}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-serif font-bold rounded-lg transition-all cursor-pointer ${
          isLight
            ? "bg-[#FDF8EE] text-[#7A5210] shadow"
            : "bg-[#281D14] text-[#E6D3A3] shadow"
        }`}
        title={
          isLight
            ? "Đang ở Nền Sáng. Bấm để đổi sang Nền Tối Huyền Mặc"
            : "Đang ở Nền Tối. Bấm để đổi sang Nền Sáng Thanh Nhã"
        }
      >
        {isLight ? (
          <Sun className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
        ) : (
          <Moon className="w-3.5 h-3.5 text-[#C9A55A]" />
        )}
        <span className="hidden sm:inline">
          {isLight ? "Nền Sáng" : "Nền Tối"}
        </span>
      </button>

      {/* Button to open Wallpaper & Brightness adjustments */}
      <button
        type="button"
        onClick={onOpenSettings}
        className="flex items-center gap-1 px-2 py-1.5 text-xs text-[#A89882] hover:text-[#C9A55A] hover:bg-[#251A11] rounded-lg transition-colors cursor-pointer"
        title="Mở bảng chỉnh hình nền phong thủy và thanh trượt sáng/tối"
      >
        <Sliders className="w-3.5 h-3.5" />
        <span className="hidden md:inline font-serif font-medium text-[11px]">
          Chỉnh Nền ({config.brightness}%)
        </span>
      </button>
    </div>
  );
};

// FLOATING WIDGET FOR EASY DISCOVERY & ACCESS ON ANY PAGE
export const ThemeFloatingWidget: React.FC<{
  config: ThemeConfig;
  onToggleMode: () => void;
  onOpenSettings: () => void;
}> = ({ config, onToggleMode, onOpenSettings }) => {
  const [minimized, setMinimized] = useState(false);
  const isLight = config.mode === "light";

  if (minimized) {
    return (
      <button
        type="button"
        onClick={() => setMinimized(false)}
        className="fixed bottom-5 left-5 z-40 w-9 h-9 rounded-full bg-[#1C1611]/90 border border-[#C9A55A]/60 text-[#C9A55A] flex items-center justify-center shadow-xl backdrop-blur-md hover:scale-110 transition-transform cursor-pointer"
        title="Mở bảng chỉnh hình nền sáng/tối"
      >
        <Palette className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 left-5 z-40 flex items-center gap-1 p-1 rounded-2xl bg-[#18130E]/90 border border-[#443322] shadow-2xl backdrop-blur-md text-[#E8DCC9] select-none text-xs animate-in fade-in slide-in-from-bottom-2">
      {/* Quick toggle mode button */}
      <button
        type="button"
        onClick={onToggleMode}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-serif font-bold transition-all cursor-pointer ${
          isLight
            ? "bg-[#FFF9EE] text-[#7A5310] shadow"
            : "bg-[#2A1E14] text-[#E6D3A3] shadow"
        }`}
        title={
          isLight
            ? "Chuyển sang Nền Tối Huyền Mặc"
            : "Chuyển sang Nền Sáng Thanh Nhã"
        }
      >
        {isLight ? (
          <Sun className="w-3.5 h-3.5 text-amber-500" />
        ) : (
          <Moon className="w-3.5 h-3.5 text-[#C9A55A]" />
        )}
        <span className="text-[11px]">{isLight ? "Sáng" : "Tối"}</span>
      </button>

      {/* Open settings button */}
      <button
        type="button"
        onClick={onOpenSettings}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-[#2A1E14] text-[#CBB9A3] hover:text-[#C9A55A] transition-colors cursor-pointer"
        title="Chỉnh hình nền & độ sáng/tối"
      >
        <Sliders className="w-3.5 h-3.5 text-[#C9A55A]" />
        <span className="font-serif text-[11px]">Chỉnh Nền ({config.brightness}%)</span>
      </button>

      {/* Minimize button */}
      <button
        type="button"
        onClick={() => setMinimized(true)}
        className="p-1 rounded-lg text-[#887865] hover:text-[#CBB9A3] hover:bg-black/20 transition-colors cursor-pointer"
        title="Thu gọn nút chỉnh nền"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};
