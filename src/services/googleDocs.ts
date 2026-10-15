/**
 * Google Docs API Integration Service
 * Scopes: https://www.googleapis.com/auth/documents
 */

export interface CreateDocParams {
  title: string;
  question: string;
  primaryHexagramName: string;
  primaryHexagramNumber: number;
  primaryVietnameseName: string;
  transformedHexagramName?: string;
  transformedHexagramNumber?: number;
  changingLines?: number[];
  judgment?: string;
  imageMeaning?: string;
  lineMeanings?: { line: number; text: string; meaning?: string; detailedExplanation?: string }[];
  aiAnalysis?: string;
  dateStr?: string;
  accessToken: string;
}

export interface GoogleDocResult {
  documentId: string;
  title: string;
  docUrl: string;
}

/**
 * Creates a formatted Google Doc containing an I Ching divination report
 */
export async function exportReadingToGoogleDoc(params: CreateDocParams): Promise<GoogleDocResult> {
  const {
    title,
    question,
    primaryHexagramName,
    primaryHexagramNumber,
    primaryVietnameseName,
    transformedHexagramName,
    transformedHexagramNumber,
    changingLines = [],
    judgment,
    imageMeaning,
    lineMeanings = [],
    aiAnalysis,
    dateStr = new Date().toLocaleString("vi-VN"),
    accessToken,
  } = params;

  // 1. Create document
  const createRes = await fetch("https://docs.googleapis.com/v1/documents", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
    }),
  });

  if (!createRes.ok) {
    const errorText = await createRes.text();
    throw new Error(`Không thể tạo Google Doc: ${createRes.status} ${errorText}`);
  }

  const doc = await createRes.json();
  const documentId = doc.documentId;

  // 2. Build comprehensive text content
  const changingLinesText = changingLines.length > 0 
    ? `Hào động: Hào ${changingLines.join(", ")}` 
    : "Quẻ tịnh (không có hào biến động)";

  let bodyContent = `KẾT QUẢ CHIÊM BÁI KINH DỊCH\n`;
  bodyContent += `Thời điểm thỉnh quẻ: ${dateStr}\n`;
  bodyContent += `Tâm niệm / Vấn đề: ${question || "Chiêm nghiệm vận trình tổng quát"}\n`;
  bodyContent += `\n========================================\n\n`;
  bodyContent += `I. QUẺ CHỦ (QUẺ CHÍNH):\n`;
  bodyContent += `Quẻ số ${primaryHexagramNumber}: ${primaryHexagramName} (${primaryVietnameseName})\n`;
  if (judgment) {
    bodyContent += `\n* Thoán từ (Lời Thoán):\n${judgment}\n`;
  }
  if (imageMeaning) {
    bodyContent += `\n* Đại Tượng (Ý nghĩa tượng hình):\n${imageMeaning}\n`;
  }

  if (transformedHexagramName && transformedHexagramNumber) {
    bodyContent += `\n----------------------------------------\n\n`;
    bodyContent += `II. QUẺ BIẾN (TƯƠNG LAI / HẬU VẬN):\n`;
    bodyContent += `Quẻ số ${transformedHexagramNumber}: ${transformedHexagramName}\n`;
    bodyContent += `${changingLinesText}\n`;
  }

  if (lineMeanings.length > 0) {
    bodyContent += `\n----------------------------------------\n\n`;
    bodyContent += `III. GIẢI NGHĨA CÁC HÀO BIẾN ĐỘNG:\n`;
    lineMeanings.forEach((lm) => {
      bodyContent += `- Hào ${lm.line}: ${lm.text}\n`;
      if (lm.meaning) {
        bodyContent += `  * Nghĩa lý: ${lm.meaning}\n`;
      }
      if (lm.detailedExplanation) {
        bodyContent += `  * Triết lý & Ứng dụng thực tiễn: ${lm.detailedExplanation}\n`;
      }
    });
  }

  if (aiAnalysis) {
    bodyContent += `\n----------------------------------------\n\n`;
    bodyContent += `IV. BÌNH GIẢI & LỜI KHUYÊN CHI TIẾT (DỊCH HỌC MINH TRIẾT):\n`;
    bodyContent += `${aiAnalysis}\n`;
  }

  bodyContent += `\n========================================\n`;
  bodyContent += `Biên soạn tự động từ Ứng dụng Bốc Bài Kinh Dịch Chu Dịch Thần Quẻ\n`;

  // 3. BatchUpdate to insert text into the document
  const updateRes = await fetch(
    `https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requests: [
          {
            insertText: {
              location: {
                index: 1,
              },
              text: bodyContent,
            },
          },
        ],
      }),
    }
  );

  if (!updateRes.ok) {
    const errorText = await updateRes.text();
    console.warn("Doc formatting batch update notice:", errorText);
  }

  return {
    documentId,
    title: doc.title || title,
    docUrl: `https://docs.google.com/document/d/${documentId}/edit`,
  };
}
