import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Check,
  Maximize2,
  Minimize2,
  Move,
  Eye,
  Copy,
  ExternalLink,
} from "lucide-react";
import { downloadDataUrlAsPng, dataUrlToBlob } from "../utils/captureHelper";

interface ExportImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  title?: string;
  filename?: string;
}

export const ExportImageModal: React.FC<ExportImageModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title = "Ảnh Trận Pháp Đã Xuất",
  filename = "tran-phap-dich-hoc.png",
}) => {
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isImgError, setIsImgError] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Khởi tạo Blob URL bền vững khi mở ảnh
  useEffect(() => {
    if (!imageUrl) {
      setBlobUrl("");
      return;
    }
    let url = "";
    if (imageUrl.startsWith("data:")) {
      try {
        const blob = dataUrlToBlob(imageUrl);
        url = URL.createObjectURL(blob);
        setBlobUrl(url);
      } catch {
        setBlobUrl(imageUrl);
      }
    } else {
      setBlobUrl(imageUrl);
    }
    return () => {
      if (url && url.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(url);
        } catch {}
      }
    };
  }, [imageUrl]);

  const isJpeg = imageUrl?.startsWith("data:image/jpeg");
  const ext = isJpeg ? ".jpg" : ".png";
  const cleanFilename =
    filename.toLowerCase().endsWith(".png") || filename.toLowerCase().endsWith(".jpg")
      ? filename
      : `${filename}${ext}`;

  // Reset zoom and pan whenever a new image is opened
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPan({ x: 0, y: 0 });
      setIsDownloaded(false);
      setIsCopied(false);
      setIsImgError(false);
    }
  }, [isOpen, imageUrl]);

  // Handle zoom in / out
  const handleZoomIn = () => {
    setScale((prev) => Math.min(4, Math.round((prev + 0.25) * 100) / 100));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(0.3, Math.round((prev - 0.25) * 100) / 100));
  };

  const handleReset = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    setScale((prev) => {
      const next = Math.round(prev * zoomFactor * 100) / 100;
      return Math.min(4, Math.max(0.3, next));
    });
  }, []);

  // Drag pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch drag handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1) {
      setPan({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Double click to toggle 1x <-> 2x
  const handleDoubleClick = () => {
    if (scale === 1) {
      setScale(1.8);
    } else {
      setScale(1);
      setPan({ x: 0, y: 0 });
    }
  };

  // Tải file an toàn qua Blob URL
  const handleDownload = () => {
    if (!imageUrl) return;
    downloadDataUrlAsPng(imageUrl, filename);
    setIsDownloaded(true);
    setTimeout(() => setIsDownloaded(false), 2500);
  };

  // Mở tab mới để xem toàn màn hình hoặc lưu thủ công
  const handleOpenNewTab = () => {
    if (!imageUrl) return;
    try {
      if (imageUrl.startsWith("data:")) {
        const blob = dataUrlToBlob(imageUrl);
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, "_blank", "noopener,noreferrer");
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
        return;
      }
      window.open(imageUrl, "_blank", "noopener,noreferrer");
    } catch (e) {
      console.warn("Không thể mở tab mới:", e);
      // Fallback: Tải file
      handleDownload();
    }
  };

  // Sao chép hình ảnh vào bộ nhớ tạm Clipboard
  const handleCopyImage = async () => {
    if (!imageUrl) return;
    try {
      if (imageUrl.startsWith("data:") && typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
        const blob = dataUrlToBlob(imageUrl);
        await navigator.clipboard.write([
          new ClipboardItem({ [blob.type || "image/png"]: blob })
        ]);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
        return;
      }
      handleDownload();
    } catch (e) {
      console.warn("Không thể chép ảnh trực tiếp vào clipboard:", e);
      handleDownload();
    }
  };

  if (!isOpen || !imageUrl) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-2 sm:p-4 select-none animate-in fade-in"
    >
      {/* Modal Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl h-[92vh] bg-[#14100D] border border-[#483B29] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Top Header & Controls */}
        <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 bg-[#1B1612] border-b border-[#30251A] gap-2 flex-wrap z-20">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-[#C9A55A] shadow-[0_0_6px_#C9A55A]" />
            <h3 className="font-serif font-bold text-sm sm:text-base text-[#F5EBD6] truncate">
              {title}
            </h3>
            <span className="hidden sm:inline-block text-[11px] font-mono text-[#A89882] bg-[#271F17] px-2 py-0.5 rounded border border-[#3C2F21]">
              Độ nét cao
            </span>
          </div>

          {/* Zoom & Action Toolbar */}
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
            {/* Zoom Out Button */}
            <button
              onClick={handleZoomOut}
              disabled={scale <= 0.3}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-[#251E17] hover:bg-[#34291E] disabled:opacity-40 text-[#DCD0BC] border border-[#3E3122] flex items-center gap-1 text-xs font-medium cursor-pointer transition-colors"
              title="Thu nhỏ hình ảnh (-)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Thu nhỏ</span>
            </button>

            {/* Current Scale Display & Quick Reset */}
            <button
              onClick={handleReset}
              className="px-2.5 py-1.5 rounded-lg bg-[#2B2219] hover:bg-[#392D20] text-[#C9A55A] border border-[#4E3D28] text-xs font-mono font-bold cursor-pointer transition-colors min-w-[55px] text-center"
              title="Nhấp để đặt lại tỷ lệ 100%"
            >
              {Math.round(scale * 100)}%
            </button>

            {/* Zoom In Button */}
            <button
              onClick={handleZoomIn}
              disabled={scale >= 4}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-[#251E17] hover:bg-[#34291E] disabled:opacity-40 text-[#DCD0BC] border border-[#3E3122] flex items-center gap-1 text-xs font-medium cursor-pointer transition-colors"
              title="Phóng to hình ảnh (+)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Phóng to</span>
            </button>

            {/* Reset View Button */}
            <button
              onClick={handleReset}
              className="p-1.5 sm:p-2 rounded-lg bg-[#251E17] hover:bg-[#34291E] text-[#B8A892] hover:text-[#FFF] border border-[#3E3122] cursor-pointer transition-colors"
              title="Đặt lại vị trí ban đầu"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Copy Image Button */}
            <button
              onClick={handleCopyImage}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-[#251E17] hover:bg-[#34291E] text-[#DCD0BC] hover:text-white border border-[#3E3122] flex items-center gap-1 text-xs font-medium cursor-pointer transition-colors"
              title="Sao chép hình ảnh vào bộ nhớ tạm"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline text-emerald-400 font-semibold">Đã chép!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden sm:inline">Sao chép</span>
                </>
              )}
            </button>

            {/* Open New Tab Button */}
            <button
              onClick={handleOpenNewTab}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-[#251E17] hover:bg-[#34291E] text-[#DCD0BC] hover:text-white border border-[#3E3122] flex items-center gap-1 text-xs font-medium cursor-pointer transition-colors"
              title="Mở ảnh trong tab mới"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Mở Tab</span>
            </button>

            {/* Download Button */}
            <a
              href={blobUrl || imageUrl}
              download={cleanFilename}
              onClick={() => {
                setIsDownloaded(true);
                setTimeout(() => setIsDownloaded(false), 2500);
                downloadDataUrlAsPng(imageUrl, filename);
              }}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#C89B3C] to-[#E2C37A] hover:brightness-110 text-[#14120F] font-bold text-xs flex items-center gap-1.5 shadow cursor-pointer transition-all active:scale-95 no-underline"
              title="Tải ảnh về máy tính"
            >
              {isDownloaded ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-950 font-bold" />
                  <span>Đã tải về!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Tải Về Máy</span>
                  <span className="sm:hidden">Lưu</span>
                </>
              )}
            </a>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-lg bg-[#251E17] hover:bg-red-950/80 text-[#B8A892] hover:text-red-300 border border-[#3E3122] hover:border-red-800 cursor-pointer transition-colors"
              title="Đóng (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Viewport Canvas (Supports Smooth Zoom & Drag Pan) */}
        <div
          ref={containerRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onDoubleClick={handleDoubleClick}
          className={`flex-1 w-full h-full overflow-hidden flex items-center justify-center bg-[#0D0A08] relative ${
            isDragging ? "cursor-grabbing" : scale > 1 ? "cursor-grab" : "cursor-default"
          }`}
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(60, 48, 33, 0.15) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        >
          <div
            className="transition-transform duration-75 ease-out select-none"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
              transformOrigin: "center center",
            }}
          >
            {isImgError ? (
              <div className="p-8 rounded-xl bg-[#1E1711] border border-amber-600/60 text-center max-w-md mx-auto space-y-4">
                <p className="text-sm text-amber-200 font-serif leading-relaxed">
                  Hình ảnh đã được chụp thành công! Bạn có thể tải ngay về thiết bị hoặc mở xem trong tab mới.
                </p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="px-4 py-2 rounded-lg bg-[#C9A55A] hover:bg-amber-300 text-black font-bold text-xs cursor-pointer transition-all flex items-center gap-1.5 shadow"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải Về Máy</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenNewTab}
                    className="px-4 py-2 rounded-lg bg-[#2D2319] hover:bg-[#3D2F22] text-[#F5EBD6] font-semibold text-xs cursor-pointer transition-all border border-[#4E3D2A] flex items-center gap-1.5 shadow"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                    <span>Mở Tab Mới</span>
                  </button>
                </div>
              </div>
            ) : (
              <img
                src={imageUrl}
                alt="Ảnh trận pháp đã xuất"
                referrerPolicy="no-referrer"
                onError={() => setIsImgError(true)}
                draggable={false}
                className="max-w-[85vw] max-h-[75vh] object-contain rounded-lg shadow-[0_0_30px_rgba(0,0,0,0.8)] border border-[#3E3224]/50 cursor-grab active:cursor-grabbing"
              />
            )}
          </div>

          {/* Bottom Floating Action & Download Bar */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#17130F]/95 backdrop-blur-md px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl border border-[#4E3E2A] text-xs text-[#EADBBF] shadow-2xl flex items-center gap-2 sm:gap-3 flex-wrap justify-center z-20 max-w-[94vw]">
            <a
              href={blobUrl || imageUrl}
              download={cleanFilename}
              onClick={() => {
                setIsDownloaded(true);
                setTimeout(() => setIsDownloaded(false), 2500);
                downloadDataUrlAsPng(imageUrl, filename);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:brightness-110 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-transform active:scale-95 no-underline"
              title="Tải ảnh này về máy tính hoặc điện thoại"
            >
              {isDownloaded ? (
                <>
                  <Check className="w-4 h-4 text-emerald-950" />
                  <span>Đã tải về máy!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-stone-950" />
                  <span>Tải Hình Về Máy (PNG)</span>
                </>
              )}
            </a>

            <button
              type="button"
              onClick={handleCopyImage}
              className="px-3 py-1.5 rounded-xl bg-[#282017] hover:bg-[#382C20] text-amber-200 border border-[#4F3C28] font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Sao chép ảnh vào bộ nhớ tạm để dán vào Zalo/Messenger/Word"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Đã chép!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sao chép</span>
                </>
              )}
            </button>

            <span className="text-[11px] text-[#A69780] hidden lg:inline">
              • Bạn cũng có thể nhấp chuột phải chọn "Lưu hình ảnh thành..."
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
