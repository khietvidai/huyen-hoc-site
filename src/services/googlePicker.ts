/**
 * Google Picker API Integration
 * Scopes:
 * - https://www.googleapis.com/auth/drive.file
 * - https://www.googleapis.com/auth/drive.metadata.readonly
 */

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

export interface PickedFile {
  id: string;
  name: string;
  mimeType: string;
  url: string;
  iconUrl?: string;
  sizeBytes?: number;
  lastEditedUtc?: number;
  description?: string;
}

export interface OpenPickerOptions {
  accessToken: string;
  viewType?: "images" | "all" | "docs";
  title?: string;
  multiselect?: boolean;
  onPick: (files: PickedFile[]) => void;
  onCancel?: () => void;
}

/**
 * Loads the Google API client and Picker library dynamically
 */
export function loadPickerApi(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Window is not defined"));
      return;
    }

    if (window.google?.picker) {
      resolve();
      return;
    }

    const onScriptLoaded = () => {
      if (window.gapi) {
        window.gapi.load("picker", {
          callback: () => resolve(),
          onerror: () => reject(new Error("Không thể khởi tạo thư viện Google Picker")),
        });
      } else {
        reject(new Error("Không tìm thấy đối tượng gapi"));
      }
    };

    if (window.gapi) {
      onScriptLoaded();
      return;
    }

    const existingScript = document.querySelector('script[src="https://apis.google.com/js/api.js"]');
    if (existingScript) {
      existingScript.addEventListener("load", onScriptLoaded);
      existingScript.addEventListener("error", () => reject(new Error("Không thể tải Google API script")));
    } else {
      const script = document.createElement("script");
      script.src = "https://apis.google.com/js/api.js";
      script.async = true;
      script.defer = true;
      script.onload = onScriptLoaded;
      script.onerror = () => reject(new Error("Không thể tải Google API script"));
      document.body.appendChild(script);
    }
  });
}

/**
 * Opens the Google Picker widget
 */
export async function openGooglePicker(options: OpenPickerOptions): Promise<void> {
  await loadPickerApi();

  if (!window.google?.picker) {
    throw new Error("Google Picker API chưa sẵn sàng.");
  }

  const {
    accessToken,
    viewType = "all",
    title = "Chọn tệp từ Google Drive",
    multiselect = false,
    onPick,
    onCancel,
  } = options;

  const pickerOrigin =
    window.location.ancestorOrigins &&
    window.location.ancestorOrigins.length > 0
      ? window.location.ancestorOrigins[window.location.ancestorOrigins.length - 1]
      : window.location.origin;

  const builder = new window.google.picker.PickerBuilder();

  // Add views based on requested type
  if (viewType === "images") {
    const imagesView = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS_IMAGES);
    imagesView.setMimeTypes("image/png,image/jpeg,image/jpg,image/webp,image/gif,video/mp4");
    imagesView.setMode(window.google.picker.DocsViewMode.GRID);
    builder.addView(imagesView);
  } else if (viewType === "docs") {
    builder.addView(window.google.picker.ViewId.DOCS);
  } else {
    // Both standard docs and images view
    builder.addView(window.google.picker.ViewId.DOCS);
    const imagesView = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS_IMAGES);
    imagesView.setMimeTypes("image/png,image/jpeg,image/jpg,image/webp,image/gif,video/mp4");
    builder.addView(imagesView);
  }

  if (multiselect) {
    builder.enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED);
  }

  builder.setTitle(title);
  builder.setOAuthToken(accessToken);
  builder.setOrigin(pickerOrigin);

  builder.setCallback((data: any) => {
    if (data.action === window.google.picker.Action.PICKED) {
      const docs: PickedFile[] = (data.docs || []).map((doc: any) => ({
        id: doc.id,
        name: doc.name,
        mimeType: doc.mimeType,
        url: doc.url,
        iconUrl: doc.iconUrl,
        sizeBytes: doc.sizeBytes,
        lastEditedUtc: doc.lastEditedUtc,
        description: doc.description,
      }));
      onPick(docs);
    } else if (data.action === window.google.picker.Action.CANCEL) {
      if (onCancel) onCancel();
    }
  });

  const picker = builder.build();
  picker.setVisible(true);
}

/**
 * Downloads a file selected via Google Picker as Data URL
 */
export async function fetchDriveFileAsDataUrl(fileId: string, accessToken: string): Promise<string> {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`Không thể tải tệp từ Google Drive (HTTP ${res.status}): ${res.statusText}`);
  }

  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Uploads a text/json file (e.g. divination reading or cards bundle) to Google Drive
 */
export async function saveFileToDrive(params: {
  name: string;
  mimeType: string;
  content: string;
  accessToken: string;
}): Promise<{ id: string; name: string; webViewLink?: string }> {
  const metadata = {
    name: params.name,
    mimeType: params.mimeType,
  };

  const boundary = "-------314159265358979323846";
  const delimiter = "\r\n--" + boundary + "\r\n";
  const close_delim = "\r\n--" + boundary + "--";

  const multipartRequestBody =
    delimiter +
    "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
    JSON.stringify(metadata) +
    delimiter +
    "Content-Type: " +
    params.mimeType +
    "\r\n\r\n" +
    params.content +
    close_delim;

  const res = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${params.accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Lỗi khi lưu lên Google Drive: ${errText}`);
  }

  return await res.json();
}
