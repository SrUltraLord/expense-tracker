import axios from "axios";
import { ExpenseCategory, ExpenseData, SheetsMetadataResponse } from "../types";
import {
  getAccessToken as getJwt,
  ServiceAccountCredentials,
} from "../utils/jwt-utils";
import { googleOAuthClient, googleSheetsClient } from "../api/clients";

const SHEET_NAME = "2026";
const TABLE_NAME = "Gastos_2026";

export async function saveToGoogleSheets(
  expense: ExpenseData,
  credentials: string,
  spreadsheetId: string
): Promise<boolean> {
  try {
    const creds: ServiceAccountCredentials = JSON.parse(credentials);
    const jwt = await getJwt({ ...creds, private_key: creds.private_key });

    const { data: authResponse } = await googleOAuthClient.post(
      "/token",
      `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
    );

    const accessToken = authResponse.access_token;
    const authHeaders = { Authorization: `Bearer ${accessToken}` };

    const { data: metaData } =
      await googleSheetsClient.get<SheetsMetadataResponse>(
        `/${spreadsheetId}?ranges=${encodeURIComponent(
          SHEET_NAME
        )}&fields=sheets(properties.sheetId,tables)`,
        { headers: authHeaders }
      );

    const targetSheet = metaData.sheets?.[0];
    const targetTable = targetSheet?.tables?.find((t) => t.name === TABLE_NAME);

    if (!targetTable) {
      throw new Error(
        `Table "${TABLE_NAME}" not found in sheet "${SHEET_NAME}"`
      );
    }

    const sheetId = targetTable.range.sheetId;
    const insertRowIndex = targetTable.range.endRowIndex;
    const startColIndex = targetTable.range.startColumnIndex;

    const rowValues = [
      expense.description,
      getSheetsCategory(expense.category),
      expense.subCategory ?? "-",
      new Date(expense.date).toISOString().split("T")[0],
      expense.amount,
    ];

    await googleSheetsClient.post(
      `/${spreadsheetId}:batchUpdate`,
      {
        requests: [
          {
            insertDimension: {
              range: {
                sheetId: sheetId,
                dimension: "ROWS",
                startIndex: insertRowIndex,
                endIndex: insertRowIndex + 1,
              },
              inheritFromBefore: true,
            },
          },
          {
            updateCells: {
              rows: [
                {
                  values: rowValues.map((val) => ({
                    userEnteredValue: mapValue(val),
                  })),
                },
              ],
              fields: "userEnteredValue",
              start: {
                sheetId: sheetId,
                rowIndex: insertRowIndex,
                columnIndex: startColIndex,
              },
            },
          },
        ],
      },
      { headers: authHeaders }
    );

    console.log(`✅ Expense saved to table "${TABLE_NAME}"`);
    return true;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "❌ Google API Error:",
        error.response?.data || error.message
      );
    } else {
      console.error("❌ General Error:", error);
    }
    return false;
  }
}

function getSheetsCategory(category: ExpenseCategory): string {
  const categoryMap: Record<ExpenseCategory, string> = {
    needs: "Necesidades",
    wants: "Deseos",
    savings: "Inversión",
  };
  return categoryMap[category];
}

function mapValue(value: any) {
  if (typeof value === "number") return { numberValue: value };
  if (typeof value === "boolean") return { boolValue: value };
  return { stringValue: String(value) };
}
