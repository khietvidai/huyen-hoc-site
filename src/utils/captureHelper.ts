import { toPng, toJpeg, toBlob } from "html-to-image";

export interface CaptureOptions {
  backgroundColor?: string;
  pixelRatio?: number;
  width?: number;
  height?: number;
  maxDimension?: number;
  minWidth?: number;
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
 * Tự động tính toán tỷ lệ an toàn, xử lý chống lỗi bộ nhớ trình duyệt,
 * hỗ trợ fallback đa tầng (PNG 2x -> PNG 1x -> JPEG -> toBlob)
 */
export async function captureElementToPng(
  element: HTMLElement,
  options?: CaptureOptions
): Promise<string> {
  if (!element) {
    throw new Error("Không tìm thấy phần tử cần chụp ảnh");
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

  await waitForImages(element);

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
      outerWrapper.style.backgroundColor = options.backgroundColor || "#15100A";

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
      await waitForImages(clone);
      await new Promise((resolve) => setTimeout(resolve, 80));

      targetElement = outerWrapper;
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

  try {
    return await doCaptureElement(targetElement, options);
  } finally {
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
  options?: CaptureOptions
): Promise<string> {
  // Đo đạc kích thước thực tế của phần tử
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
  const maxSafeDim = options?.maxDimension || 3600;
  const requestedRatio = options?.pixelRatio || 2;
  const maxRaw = Math.max(rawWidth, rawHeight);

  // Tính tỷ lệ an toàn không vượt quá maxSafeDim
  let safeRatio = requestedRatio;
  if (maxRaw * requestedRatio > maxSafeDim) {
    safeRatio = Math.max(0.6, Math.floor((maxSafeDim / maxRaw) * 100) / 100);
  }

  const transparent1x1 =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

  const buildConfig = (ratio: number, useCanvasDims = false) => {
    const config: any = {
      backgroundColor: options?.backgroundColor || "#15100A",
      pixelRatio: ratio,
      cacheBust: false,
      skipFonts: true,
      fontEmbedCSS: "",
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
        transform: "none",
        maxHeight: "none",
        height: options?.height ? `${options.height}px` : "auto",
        overflow: options?.height ? "hidden" : "visible",
        "-webkit-print-color-adjust": "exact",
        "color-adjust": "exact",
      },
    };

    if (useCanvasDims) {
      config.canvasWidth = Math.round((options?.width || rawWidth) * ratio);
      config.canvasHeight = Math.round((options?.height || rawHeight) * ratio);
    }

    if (options?.width) config.width = options.width;
    if (options?.height) config.height = options.height;

    return config;
  };

  // Tầng 1: Thử chụp PNG với safeRatio và kích thước canvas chuẩn
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
