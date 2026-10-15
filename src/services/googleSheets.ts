/**
 * Google Sheets API Integration Service
 * Scopes: https://www.googleapis.com/auth/spreadsheets
 */

export interface SheetRowRecord {
  timestamp: string;
  question: string;
  primaryHexagram: string; // e.g. "1. Thuần Càn (Càn Vi Thiên)"
  changingLines: string; // e.g. "Hào 2, Hào 5"
  transformedHexagram: string; // e.g. "14. Đại Hữu"
  summary: string; // Brief conclusion or advice
  divinationMethod: string; // "Bốc 3 lá bài" | "Gieo 6 hào đồng xu" | "Chọn quẻ"
}

export interface SpreadsheetInfo {
  id: string;
  title: string;
  url: string;
  sheetTitle: string;
}

const DEFAULT_SHEET_TITLE = "Nhật Ký Chiêm Bái";
const HEADER_ROW = [
  "Thời Gian",
  "Câu Hỏi / Tâm Niệm",
  "Quẻ Chủ (Chính)",
  "Hào Động",
  "Quẻ Biến",
  "Phương Thức Gieo",
  "Lời Khuyên / Luận Giải Tóm Tắt",
];

/**
 * Creates a brand new Google Sheets logbook for I Ching readings
 */
export async function createDivinationSpreadsheet(
  title: string = "Nhật Ký Bốc Quẻ Kinh Dịch",
  accessToken: string
): Promise<SpreadsheetInfo> {
  const createRes = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: {
        title,
      },
      sheets: [
        {
          properties: {
            title: DEFAULT_SHEET_TITLE,
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    }),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Không thể tạo bảng tính Google Sheets: ${createRes.status} ${errText}`);
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;

  // Insert Header Row
  await appendRowsToSpreadsheet(spreadsheetId, DEFAULT_SHEET_TITLE, [HEADER_ROW], accessToken);

  return {
    id: spreadsheetId,
    title: sheetData.properties?.title || title,
    url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
    sheetTitle: DEFAULT_SHEET_TITLE,
  };
}

/**
 * Append one or more rows of records to an existing Google Spreadsheet
 */
export async function appendRowsToSpreadsheet(
  spreadsheetId: string,
  sheetTitle: string,
  rows: (string | number)[][],
  accessToken: string
): Promise<{ updatedRows: number }> {
  const encodedRange = encodeURIComponent(`${sheetTitle}!A1`);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      majorDimension: "ROWS",
      values: rows,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Lỗi ghi vào Google Sheets: ${res.status} ${errText}`);
  }

  const data = await res.json();
  return { updatedRows: data.updates?.updatedRows || rows.length };
}

/**
 * Read the first sheet's values from a Google Spreadsheet
 */
export async function readSpreadsheetValues(
  spreadsheetId: string,
  accessToken: string
): Promise<{ rows: string[][]; title: string; sheetName: string }> {
  // 1. Get metadata first to discover sheet name (per SKILL.md Best Practice)
  const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!metaRes.ok) {
    const err = await metaRes.text();
    throw new Error(`Không thể đọc thông tin Google Spreadsheet: ${err}`);
  }

  const meta = await metaRes.json();
  const title = meta.properties?.title || "Bảng tính Kinh Dịch";
  const firstSheetName = meta.sheets?.[0]?.properties?.title || "Sheet1";

  // 2. Read values
  const valRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(firstSheetName)}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!valRes.ok) {
    const err = await valRes.text();
    throw new Error(`Không thể đọc dữ liệu từ trang tính: ${err}`);
  }

  const valData = await valRes.json();
  return {
    rows: valData.values || [],
    title,
    sheetName: firstSheetName,
  };
}
