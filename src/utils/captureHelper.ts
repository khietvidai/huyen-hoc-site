import { toPng, toJpeg, toBlob } from "html-to-image";

export interface CaptureOptions {
  backgroundColor?: string;
  pixelRatio?: number;
  width?: number;
  height?: number;
  maxDimension?: number;
  minWidth?: number;
}

const DEFAULT_GOOGLE_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,600&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Lora:ital,wght@0,400..700;1,400..700&family=Noto+Serif:ital,wght@0,400..700;1,400..700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap";

/**
 * Quy tắc CSS nhúng trực tiếp vào SVG <foreignObject> khi chụp ảnh:
 * 1. Đảm bảo chuỗi font ưu tiên đầy đủ dấu Tiếng Việt (Lora / Be Vietnam Pro / Georgia / Times New Roman) đứng TRƯỚC font chữ Hán (Noto Serif TC).
 * 2. Chống lỗi html-to-image sao chép cứng width/height co cụm của thẻ inline/flex/button khiến chữ rớt dòng và đè chồng lên dòng dưới.
 */
const CAPTURE_LAYOUT_SAFETY_CSS = `
* {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: geometricPrecision;
  font-synthesis: weight style;
  font-kerning: normal;
}

.font-serif {
  font-family: "Lora", "Noto Serif", Georgia, Cambria, "Times New Roman", "Noto Serif TC", "Microsoft JhengHei", "PingFang TC", serif !important;
  font-size-adjust: from-font;
}

.font-display {
  font-family: "Cormorant Garamond", "Playfair Display", "Lora", "Noto Serif", Georgia, "Times New Roman", "Noto Serif TC", serif !important;
  font-size-adjust: from-font;
}

.font-classic,
.font-book,
.font-prose-serif {
  font-family: "Lora", "Playfair Display", "Noto Serif", Georgia, "Times New Roman", "Noto Serif TC", serif !important;
  font-size-adjust: from-font;
}

.font-sans {
  font-family: "Be Vietnam Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
}

@supports not (font-size-adjust: from-font) {
  .font-serif,
  .font-display,
  .font-classic,
  .font-book,
  .font-prose-serif {
    line-height: 1.4;
  }
}

span:not(:empty):not([class*="w-"]):not([class*="h-"]):not([class*="size-"]),
strong:not([class*="w-"]):not([class*="h-"]),
b:not([class*="w-"]):not([class*="h-"]),
em:not([class*="w-"]):not([class*="h-"]),
i:not(:empty):not([class*="w-"]):not([class*="h-"]),
label:not([class*="w-"]):not([class*="h-"]) {
  width: auto !important;
  inline-size: auto !important;
  height: auto !important;
  block-size: auto !important;
}

button:not([class*="h-"]):not([class*="size-"]),
button div:not([class*="h-"]):not([class*="size-"]),
p:not([class*="h-"]),
h1:not([class*="h-"]),
h2:not([class*="h-"]),
h3:not([class*="h-"]),
h4:not([class*="h-"]),
h5:not([class*="h-"]),
h6:not([class*="h-"]),
li:not([class*="h-"]) {
  height: auto !important;
  block-size: auto !important;
}

div:not(:empty):not([data-keep-h]):not([data-capture-fixed-size="true"]):not([data-capture-root="true"]):not(.flip-card-3d-inner):not(.flip-card-front-face):not([class*="h-"]):not([class*="size-"]):not([class*="aspect-"]):not([class*="inset-"]):not([class*="bottom-"]) {
  height: auto !important;
  block-size: auto !important;
}
`;

let cachedFontEmbedCSSPromise: Promise<string> | null = null;

function fetchWithTimeout(url: string, timeoutMs = 3500, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...init, signal: controller.signal }).finally(() => clearTimeout(timer));
}

function blobToBase64DataUrl(blob: Blob, fallbackMime = "font/woff2"): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string" && reader.result.length > 0) {
        if (reader.result.startsWith("data:application/octet-stream")) {
          resolve(reader.result.replace("data:application/octet-stream", `data:${fallbackMime}`));
        } else {
          resolve(reader.result);
        }
      } else {
        reject(new Error("Empty font data URL"));
      }
    };
    reader.onerror = () => reject(reader.error || new Error("FileReader error"));
    reader.readAsDataURL(blob);
  });
}

/**
 * Tải và nhúng bộ font Tiếng Việt + Latin (Lora, Be Vietnam Pro, Cormorant Garamond, Noto Serif, Playfair Display)
 * dưới dạng base64 @font-face để SVG <foreignObject> hiển thị chuẩn 100% dấu Tiếng Việt và kích thước chữ.
 * Bỏ qua các mảnh CJK khổng lồ (Noto Serif TC/SC) để tốc độ chụp nhanh tức thì và không tràn bộ nhớ.
 */
export async function getCaptureFontEmbedCSS(): Promise<string> {
  if (typeof document === "undefined" || typeof fetch === "undefined") {
    return CAPTURE_LAYOUT_SAFETY_CSS;
  }

  if (cachedFontEmbedCSSPromise) {
    return cachedFontEmbedCSSPromise;
  }

  cachedFontEmbedCSSPromise = (async () => {
    try {
      const linkEls = Array.from(
        document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')
      ).filter((l) => l.href && l.href.includes("fonts.googleapis.com"));

      const stylesheetUrls =
        linkEls.length > 0 ? linkEls.map((l) => l.href) : [DEFAULT_GOOGLE_FONTS_URL];

      const embeddedBlocks: string[] = [];
      const allowedSubsets = new Set(["vietnamese", "latin", "latin-ext", ""]);

      for (const cssUrl of stylesheetUrls) {
        let cssText = "";
        try {
          const res = await fetchWithTimeout(cssUrl, 3500, {
            mode: "cors",
            credentials: "omit",
          });
          if (res.ok) {
            cssText = await res.text();
          }
        } catch {
          continue;
        }

        if (!cssText) continue;

        const blockRegex = /(?:\/\*\s*([^*]+?)\s*\*\/\s*)?@font-face\s*\{[^}]+\}/g;
        const candidates: string[] = [];
        let match: RegExpExecArray | null;

        while ((match = blockRegex.exec(cssText)) !== null) {
          const subset = (match[1] || "").trim().toLowerCase();
          const block = match[0];

          const familyMatch = block.match(/font-family:\s*['"]?([^;'"]+)['"]?/i);
          const familyName = (familyMatch?.[1] || "").trim().toLowerCase();

          // Bỏ qua các họ font CJK nặng hàng trăm mảnh (chữ Hán dùng thẳng font hệ thống sắc nét)
          if (
            familyName.includes("noto serif tc") ||
            familyName.includes("noto serif sc") ||
            familyName.includes("noto sans tc") ||
            familyName.includes("noto sans sc")
          ) {
            continue;
          }

          if (!allowedSubsets.has(subset)) {
            continue;
          }

          candidates.push(block);
        }

        const resolvedBlocks = await Promise.all(
          candidates.map(async (block) => {
            const urlMatch = block.match(/url\((['"]?)([^'")]+)\1\)/i);
            if (!urlMatch) return null;
            const rawFontUrl = urlMatch[2];
            try {
              const fontRes = await fetchWithTimeout(rawFontUrl, 4000, {
                mode: "cors",
                credentials: "omit",
                cache: "force-cache",
              });
              if (!fontRes.ok) return null;
              const blob = await fontRes.blob();
              const mime = rawFontUrl.includes(".woff2")
                ? "font/woff2"
                : blob.type || "font/woff2";
              const dataUrl = await blobToBase64DataUrl(blob, mime);
              return block.replace(urlMatch[0], `url("${dataUrl}")`);
            } catch {
              return null;
            }
          })
        );

        for (const rb of resolvedBlocks) {
          if (rb) embeddedBlocks.push(rb);
        }
      }

      if (embeddedBlocks.length === 0) {
        // Cho phép thử tải lại ở lần chụp sau nếu mạng tạm thời gián đoạn
        cachedFontEmbedCSSPromise = null;
        return CAPTURE_LAYOUT_SAFETY_CSS;
      }

      return `${embeddedBlocks.join("\n")}\n${CAPTURE_LAYOUT_SAFETY_CSS}`;
    } catch {
      cachedFontEmbedCSSPromise = null;
      return CAPTURE_LAYOUT_SAFETY_CSS;
    }
  })();

  return cachedFontEmbedCSSPromise;
}

/**
 * Chuẩn hóa chuỗi văn bản Tiếng Việt về chuẩn Unicode dựng sẵn (NFC) để tránh tách rời dấu thanh
 */
function normalizeTextNodesToNFC(root: HTMLElement): void {
  try {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let current = walker.nextNode();
    while (current) {
      const val = current.nodeValue;
      if (val && typeof val.normalize === "function") {
        const nfc = val.normalize("NFC");
        if (nfc !== val) {
          current.nodeValue = nfc;
        }
      }
      current = walker.nextNode();
    }
  } catch {}
}

/**
 * Đánh dấu các phần tử vốn có inline style height/blockSize tường minh để không bị reset thành height: auto
 */
function markExplicitInlineHeights(root: HTMLElement): () => void {
  const marked: HTMLElement[] = [];
  try {
    const all = root.querySelectorAll<HTMLElement>("*");
    all.forEach((el) => {
      if (
        (el.style.height && el.style.height !== "auto") ||
        (el.style.blockSize && el.style.blockSize !== "auto")
      ) {
        if (!el.hasAttribute("data-keep-h")) {
          el.setAttribute("data-keep-h", "1");
          marked.push(el);
        }
      }
    });
  } catch {}

  return () => {
    for (const el of marked) {
      try {
        el.removeAttribute("data-keep-h");
      } catch {}
    }
  };
}

/**
 * Chuyển đổi chuỗi Data URL (base64) thành Blob đối tượng
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  if (!dataUrl || dataUrl === "data:," || !dataUrl.includes(",")) {
    throw new Error("Data URL trống hoặc không hợp lệ");
  }
  const arr = dataUrl.split(",");
  if (!arr[1] || arr[1].trim().length === 0) {
    throw new Error("Data URL không có dữ liệu ảnh");
  }
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "image/png";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Chụp ảnh phần tử HTML và trả về Data URL
 * Tự động tính toán tỷ lệ an toàn, nhúng WebFont Tiếng Việt chuẩn NFC,
 * xử lý chống đè chữ & lỗi bộ nhớ trình duyệt, hỗ trợ fallback đa tầng (PNG 2x -> PNG 1x -> JPEG -> toBlob)
 */
export async function captureElementToPng(
  element: HTMLElement,
  options?: CaptureOptions
): Promise<string> {
  if (!element) {
    throw new Error("Không tìm thấy phần tử cần chụp ảnh");
  }

  // Đợi bộ font trên trang sẵn sàng trước khi đo kích thước bố cục
  if (typeof document !== "undefined" && (document as any).fonts?.ready) {
    try {
      await Promise.race([
        (document as any).fonts.ready,
        new Promise((res) => setTimeout(res, 1500)),
      ]);
    } catch {}
  }

  // Đảm bảo mọi hình ảnh bên trong phần tử đã nạp và decode hoàn toàn (tránh ảnh trắng/placeholder trên mobile)
  const waitForImages = async (target: HTMLElement) => {
    const images = Array.from(target.querySelectorAll("img"));
    if (images.length === 0) return;
    await Promise.all(
      images.map(async (img) => {
        try {
          if (img.loading === "lazy") {
            img.loading = "eager";
          }
          img.removeAttribute("loading");
          if (!img.complete || img.naturalWidth === 0) {
            await new Promise((res) => {
              img.onload = () => res(true);
              img.onerror = () => res(false);
              setTimeout(() => res(false), 1800);
            });
          }
          if (typeof img.decode === "function") {
            await img.decode().catch(() => {});
          }
        } catch {}
      })
    );
  };

  const [, fontEmbedCSS] = await Promise.all([
    waitForImages(element),
    getCaptureFontEmbedCSS(),
  ]);

  // Nếu người dùng yêu cầu minWidth và độ rộng thực tế trên điện thoại nhỏ hơn minWidth:
  // Tự động tạo bản sao Offscreen chuẩn desktop để ảnh xuất ra không bị co rút, chữ không bị tràn vỡ
  let targetElement = element;
  let cleanupOffscreen: (() => void) | null = null;

  const currentWidth = Math.max(
    element.scrollWidth || 0,
    element.offsetWidth || 0,
    Math.round(element.getBoundingClientRect().width) || 0
  );

  if (options?.minWidth && currentWidth < options.minWidth) {
    try {
      const outerWrapper = document.createElement("div");
      outerWrapper.setAttribute("data-capture-root", "true");
      outerWrapper.setAttribute("data-capturing", "true");
      outerWrapper.style.position = "fixed";
      outerWrapper.style.left = "-99999px";
      outerWrapper.style.top = "0";
      outerWrapper.style.width = `${options.minWidth}px`;
      outerWrapper.style.maxWidth = `${options.minWidth}px`;
      outerWrapper.style.overflow = "visible";
      outerWrapper.style.zIndex = "-9999";
      outerWrapper.style.backgroundColor = options.backgroundColor || "#FDFBF7";

      const clone = element.cloneNode(true) as HTMLElement;
      clone.setAttribute("data-capturing", "true");
      clone.style.width = "100%";
      clone.style.maxWidth = "none";
      clone.style.transform = "none";
      clone.style.overflow = "visible";

      // Sao chép trạng thái vẽ của các thẻ canvas (nếu có)
      const origCanvases = element.querySelectorAll("canvas");
      const cloneCanvases = clone.querySelectorAll("canvas");
      origCanvases.forEach((orig, idx) => {
        const cl = cloneCanvases[idx];
        if (cl && orig.width > 0 && orig.height > 0) {
          cl.width = orig.width;
          cl.height = orig.height;
          const ctx = cl.getContext("2d");
          if (ctx) ctx.drawImage(orig, 0, 0);
        }
      });

      outerWrapper.appendChild(clone);
      document.body.appendChild(outerWrapper);
      normalizeTextNodesToNFC(outerWrapper);
      await waitForImages(clone);
      await new Promise((resolve) => setTimeout(resolve, 80));

      targetElement = clone;
      cleanupOffscreen = () => {
        if (outerWrapper.parentNode) {
          outerWrapper.parentNode.removeChild(outerWrapper);
        }
      };
    } catch (cloneErr) {
      console.warn("Không thể tạo offscreen clone, dùng targetElement gốc:", cloneErr);
      targetElement = element;
    }
  }

  const hadCapturingAttr = targetElement.hasAttribute("data-capturing");
  if (!hadCapturingAttr) {
    targetElement.setAttribute("data-capturing", "true");
  }
  normalizeTextNodesToNFC(targetElement);
  const cleanupInlineHeights = markExplicitInlineHeights(targetElement);

  // Chờ 1 khung hình để các quy tắc [data-capturing="true"] mở rộng hết văn bản trước khi đo chiều cao
  await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

  try {
    return await doCaptureElement(targetElement, options, fontEmbedCSS);
  } finally {
    cleanupInlineHeights();
    if (!hadCapturingAttr) {
      targetElement.removeAttribute("data-capturing");
    }
    if (cleanupOffscreen) {
      cleanupOffscreen();
    }
  }
}

/**
 * Hàm thực thi render canvas đa tầng
 */
async function doCaptureElement(
  element: HTMLElement,
  options?: CaptureOptions,
  fontEmbedCSS: string = CAPTURE_LAYOUT_SAFETY_CSS
): Promise<string> {
  // Đo đạc kích thước thực tế của phần tử sau khi áp dụng chế độ chụp
  const rect = element.getBoundingClientRect();
  const rawWidth = Math.max(
    element.scrollWidth || 0,
    element.offsetWidth || 0,
    Math.round(rect.width) || 0,
    320
  );
  const rawHeight = Math.max(
    element.scrollHeight || 0,
    element.offsetHeight || 0,
    Math.round(rect.height) || 0,
    180
  );

  // Giới hạn an toàn chiều dài/rộng lớn nhất (tránh tràn RAM/Canvas crash trên Safari & Mobile)
  const maxSafeDim = options?.maxDimension || 4096;
  const requestedRatio = options?.pixelRatio || 2;
  const maxRaw = Math.max(rawWidth, rawHeight);

  // Tính tỷ lệ an toàn không vượt quá maxSafeDim
  let safeRatio = requestedRatio;
  if (maxRaw * requestedRatio > maxSafeDim) {
    safeRatio = Math.max(0.75, Math.floor((maxSafeDim / maxRaw) * 100) / 100);
  }

  const transparent1x1 =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

  const buildConfig = (ratio: number, useCanvasDims = false) => {
    const targetW = Math.round(options?.width || rawWidth);
    const targetH = Math.round(options?.height || rawHeight);

    const config: any = {
      backgroundColor: options?.backgroundColor || "#FDFBF7",
      pixelRatio: ratio,
      cacheBust: false,
      skipFonts: true,
      fontEmbedCSS,
      imagePlaceholder: transparent1x1,
      filter: (node: Node) => {
        if (node instanceof HTMLElement) {
          if (node.classList.contains("no-capture")) return false;
          const tag = node.tagName.toLowerCase();
          if (tag === "script" || tag === "noscript" || tag === "iframe") return false;
        }
        return true;
      },
      style: {
        margin: "0",
        position: "static",
        left: "auto",
        top: "auto",
        right: "auto",
        bottom: "auto",
        opacity: "1",
        visibility: "visible",
        transform: "none",
        maxHeight: "none",
        height: options?.height ? `${options.height}px` : "auto",
        overflow: options?.height ? "hidden" : "visible",
        "-webkit-print-color-adjust": "exact",
        "color-adjust": "exact",
      },
    };

    // Lưu ý: html-to-image tự nhân canvasWidth/canvasHeight với pixelRatio bên trong toCanvas()
    if (useCanvasDims) {
      config.width = targetW;
      config.height = targetH;
      config.canvasWidth = targetW;
      config.canvasHeight = targetH;
    } else {
      if (options?.width) config.width = options.width;
      if (options?.height) config.height = options.height;
    }

    return config;
  };

  // Tầng 1: Thử chụp PNG với safeRatio và kích thước chuẩn
  try {
    const dataUrl = await toPng(element, buildConfig(safeRatio, true));
    if (dataUrl && dataUrl !== "data:," && dataUrl.length > 200) {
      return dataUrl;
    }
  } catch (err1) {
    console.warn("Lần chụp 1 (PNG canvas dims) chưa thành công:", err1);
  }

  // Tầng 2: Thử lại PNG chuẩn với tỷ lệ nhẹ hơn (tối đa 1x)
  try {
    const fallbackRatio = Math.min(safeRatio, 1);
    const dataUrl = await toPng(element, buildConfig(fallbackRatio, false));
    if (dataUrl && dataUrl !== "data:," && dataUrl.length > 200) {
      return dataUrl;
    }
  } catch (err2) {
    console.warn("Lần chụp 2 (PNG chuẩn 1x) chưa thành công:", err2);
  }

  // Tầng 3: Thử chụp với JPEG chất lượng cao (92%) - Nhẹ hơn rất nhiều và cực kỳ bền bỉ
  try {
    const fallbackRatio = Math.min(safeRatio, 1);
    const dataUrl = await toJpeg(element, {
      ...buildConfig(fallbackRatio, false),
      quality: 0.92,
    });
    if (dataUrl && dataUrl !== "data:," && dataUrl.length > 200) {
      return dataUrl;
    }
  } catch (err3) {
    console.warn("Lần chụp 3 (JPEG 92%) chưa thành công:", err3);
  }

  // Tầng 4: Thử với toBlob rồi chuyển thành Data URL
  try {
    const blob = await toBlob(element, buildConfig(Math.min(safeRatio, 0.8), false));
    if (blob && blob.size > 200) {
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result && typeof reader.result === "string") {
            resolve(reader.result);
          } else {
            reject(new Error("Không thể đọc blob ảnh"));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
  } catch (err4) {
    console.warn("Lần chụp 4 (toBlob) chưa thành công:", err4);
  }

  throw new Error("Không thể kết xuất hình ảnh từ canvas. Vui lòng thử lại!");
}

/**
 * Tải Data URL / Blob URL về máy tính dưới dạng tệp ảnh PNG/JPG
 * Chuyển sang Blob URL nội bộ để vượt qua rào cản iframe/sandbox và giới hạn kích thước URI của trình duyệt
 */
export function downloadDataUrlAsPng(dataUrl: string, filename: string): boolean {
  if (!dataUrl) return false;

  const isJpeg = dataUrl.startsWith("data:image/jpeg");
  const ext = isJpeg ? ".jpg" : ".png";
  const cleanFilename =
    filename.toLowerCase().endsWith(".png") || filename.toLowerCase().endsWith(".jpg")
      ? filename
      : `${filename}${ext}`;

  // Helper thực hiện tải xuống qua thẻ a DOM
  const triggerAnchor = (href: string, shouldRevoke: boolean = false): boolean => {
    try {
      const link = document.createElement("a");
      // Tránh display: none vì Chrome sandbox iframe có thể bỏ qua click
      link.style.position = "fixed";
      link.style.top = "-9999px";
      link.style.left = "-9999px";
      link.style.width = "1px";
      link.style.height = "1px";
      link.style.opacity = "0.01";
      link.style.pointerEvents = "none";
      link.href = href;
      link.download = cleanFilename;
      link.setAttribute("download", cleanFilename);

      document.body.appendChild(link);

      try {
        const clickEvent = new MouseEvent("click", {
          view: window,
          bubbles: true,
          cancelable: true,
        });
        link.dispatchEvent(clickEvent);
      } catch {
        link.click();
      }

      setTimeout(() => {
        try {
          if (link.parentNode) {
            link.parentNode.removeChild(link);
          }
          if (shouldRevoke && href.startsWith("blob:")) {
            URL.revokeObjectURL(href);
          }
        } catch {}
      }, 15000);

      return true;
    } catch (e) {
      console.warn("Lỗi khi kích hoạt anchor download:", e);
      return false;
    }
  };

  // Phương thức 1: Sử dụng Blob URL tiêu chuẩn
  try {
    if (dataUrl.startsWith("data:")) {
      const blob = dataUrlToBlob(dataUrl);
      const blobUrl = URL.createObjectURL(blob);
      return triggerAnchor(blobUrl, true);
    } else if (dataUrl.startsWith("blob:")) {
      return triggerAnchor(dataUrl, false);
    } else if (dataUrl.startsWith("http://") || dataUrl.startsWith("https://")) {
      // Đối với URL ngoài, thử tải qua fetch blob
      fetch(dataUrl, { mode: "cors" })
        .then((res) => res.blob())
        .then((blob) => {
          const blobUrl = URL.createObjectURL(blob);
          triggerAnchor(blobUrl, true);
        })
        .catch(() => {
          triggerAnchor(dataUrl, false);
        });
      return true;
    }
    return triggerAnchor(dataUrl, false);
  } catch (err) {
    console.warn("Lỗi khi tải bằng Blob URL, thử phương thức trực tiếp:", err);
    return triggerAnchor(dataUrl, false);
  }
}
