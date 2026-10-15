/**
 * Gmail API Integration Service
 * Scopes: https://www.googleapis.com/auth/gmail.send, https://www.googleapis.com/auth/gmail.compose
 */

export interface EmailParams {
  to: string;
  subject: string;
  question: string;
  primaryHexagramName: string;
  primaryHexagramNumber: number;
  primaryVietnameseName: string;
  transformedHexagramName?: string;
  transformedHexagramNumber?: number;
  changingLines?: number[];
  judgment?: string;
  aiAnalysis?: string;
  senderEmail?: string;
  accessToken: string;
}

/**
 * Utility to encode unicode RFC 2822 email to Base64URL
 */
function makeEmailRaw(
  to: string,
  from: string | undefined,
  subject: string,
  plainText: string,
  htmlText: string
): string {
  // UTF-8 encoded subject
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
  const boundary = `__iching_divination_${Date.now()}__`;

  let emailLines: string[] = [];
  emailLines.push(`To: ${to}`);
  if (from) {
    emailLines.push(`From: ${from}`);
  }
  emailLines.push(`Subject: ${utf8Subject}`);
  emailLines.push("MIME-Version: 1.0");
  emailLines.push(`Content-Type: multipart/alternative; boundary="${boundary}"`);
  emailLines.push("");
  emailLines.push(`--${boundary}`);
  emailLines.push("Content-Type: text/plain; charset=UTF-8");
  emailLines.push("Content-Transfer-Encoding: 7bit");
  emailLines.push("");
  emailLines.push(plainText);
  emailLines.push("");
  emailLines.push(`--${boundary}`);
  emailLines.push("Content-Type: text/html; charset=UTF-8");
  emailLines.push("Content-Transfer-Encoding: 7bit");
  emailLines.push("");
  emailLines.push(htmlText);
  emailLines.push("");
  emailLines.push(`--${boundary}--`);

  const fullEmail = emailLines.join("\r\n");

  // UTF-8 encode and base64url
  const encoder = new TextEncoder();
  const bytes = encoder.encode(fullEmail);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Builds standard plain & HTML divination message bodies
 */
function buildDivinationEmailBodies(params: EmailParams): { plainText: string; htmlText: string } {
  const dateStr = new Date().toLocaleString("vi-VN");
  const changingLinesText =
    params.changingLines && params.changingLines.length > 0
      ? `Hào động: Hào ${params.changingLines.join(", ")}`
      : "Quẻ tịnh (không động hào)";

  const plainText =
    `KẾT QUẢ CHIÊM BÁI KINH DỊCH\n\n` +
    `Thời gian: ${dateStr}\n` +
    `Câu hỏi: ${params.question || "Chiêm nghiệm sự việc"}\n\n` +
    `Quẻ Chủ: Số ${params.primaryHexagramNumber}. ${params.primaryHexagramName} (${params.primaryVietnameseName})\n` +
    (params.judgment ? `Thoán từ: ${params.judgment}\n` : "") +
    (params.transformedHexagramName
      ? `\nQuẻ Biến: Số ${params.transformedHexagramNumber}. ${params.transformedHexagramName}\n${changingLinesText}\n`
      : "") +
    (params.aiAnalysis ? `\n--- BÌNH GIẢI DỊCH LÝ ---\n${params.aiAnalysis}\n\n` : "") +
    `--\nTrân trọng từ Ứng dụng Bốc Bài Kinh Dịch Chu Dịch`;

  const htmlText = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f7f4ed; margin: 0; padding: 20px; color: #2c251e; }
    .card { background: #ffffff; border: 1px solid #d4af37; border-radius: 12px; max-width: 600px; margin: 0 auto; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.06); }
    .header { background: #1b1612; color: #f5ead4; padding: 24px; text-align: center; border-bottom: 2px solid #d4af37; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 1px; }
    .content { padding: 24px; line-height: 1.6; }
    .box { background: #faf6ee; border: 1px solid #e2d4be; border-radius: 8px; padding: 16px; margin-bottom: 18px; }
    .badge { display: inline-block; background: #d4af37; color: #1b1612; padding: 3px 10px; border-radius: 12px; font-weight: bold; font-size: 12px; margin-bottom: 8px; }
    .footer { background: #faf6ee; padding: 16px; text-align: center; font-size: 12px; color: #887a6c; border-top: 1px solid #e8decb; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>KẾT QUẢ CHIÊM BÁI KINH DỊCH</h1>
      <p style="margin: 6px 0 0 0; font-size: 13px; color: #c4b59f;">${dateStr}</p>
    </div>
    <div class="content">
      <div class="box">
        <strong style="color: #8c6d23;">TÂM NIỆM / VẤN ĐỀ:</strong>
        <p style="margin: 6px 0 0 0; font-size: 15px; font-weight: 600;">${params.question || "Chiêm nghiệm tổng quát"}</p>
      </div>

      <div class="box" style="border-left: 4px solid #d4af37;">
        <span class="badge">QUẺ CHỦ</span>
        <h2 style="margin: 0 0 6px 0; color: #1b1612; font-size: 18px;">Quẻ ${params.primaryHexagramNumber}: ${params.primaryHexagramName} (${params.primaryVietnameseName})</h2>
        ${params.judgment ? `<p style="margin: 6px 0 0 0; font-size: 14px; color: #4a3e31;"><strong>Lời Thoán:</strong> ${params.judgment}</p>` : ""}
      </div>

      ${
        params.transformedHexagramName
          ? `
      <div class="box" style="border-left: 4px solid #3b82f6;">
        <span class="badge" style="background: #3b82f6; color: #fff;">QUẺ BIẾN</span>
        <h2 style="margin: 0 0 6px 0; color: #1b1612; font-size: 18px;">Quẻ ${params.transformedHexagramNumber}: ${params.transformedHexagramName}</h2>
        <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">${changingLinesText}</p>
      </div>`
          : ""
      }

      ${
        params.aiAnalysis
          ? `
      <div class="box" style="background: #ffffff; border: 1px solid #dcd4c5;">
        <h3 style="margin: 0 0 10px 0; color: #8c6d23; font-size: 15px;">BÌNH GIẢI CHI TIẾT & LỜI KHUYÊN</h3>
        <div style="font-size: 14px; color: #332a22; white-space: pre-wrap;">${params.aiAnalysis}</div>
      </div>`
          : ""
      }
    </div>
    <div class="footer">
      Thư gửi tự động qua Gmail API từ Ứng dụng Bốc Bài Kinh Dịch.
    </div>
  </div>
</body>
</html>
  `.trim();

  return { plainText, htmlText };
}

/**
 * Send an email directly using the Gmail API
 */
export async function sendDivinationEmail(params: EmailParams): Promise<{ id: string; threadId: string }> {
  const { plainText, htmlText } = buildDivinationEmailBodies(params);
  const raw = makeEmailRaw(params.to, params.senderEmail, params.subject, plainText, htmlText);

  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Không thể gửi email qua Gmail: ${res.status} ${errText}`);
  }

  return await res.json();
}

/**
 * Create an email draft in the user's Gmail
 */
export async function createDivinationDraft(params: EmailParams): Promise<{ id: string }> {
  const { plainText, htmlText } = buildDivinationEmailBodies(params);
  const raw = makeEmailRaw(params.to, params.senderEmail, params.subject, plainText, htmlText);

  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/drafts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: { raw },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Không thể tạo thư nháp trong Gmail: ${res.status} ${errText}`);
  }

  return await res.json();
}
