import axios from "axios";
import { ExpenseCategory, ExpenseData } from "../types";
import {
  getAccessToken as getJwt,
  ServiceAccountCredentials,
} from "../utils/jwt-utils";

const googleSheetsClient = axios.create({
  baseURL: "https://sheets.googleapis.com/v4/spreadsheets",
  headers: {
    "Content-Type": "application/json",
  },
});

const googleOAuthClient = axios.create({
  baseURL: "https://oauth2.googleapis.com",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
});

export async function saveToGoogleSheets(
  expense: ExpenseData,
  credentials: string,
  spreadsheetId: string
): Promise<boolean> {
  try {
    const creds: ServiceAccountCredentials = JSON.parse(credentials);
    const jwt = await getJwt({
      ...creds,
      private_key: creds.private_key,
    });

    const { data: authResponse } = await googleOAuthClient.post(
      "/token",
      `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
    );

    const values = [
      [
        expense.description,
        getSheetsCategory(expense.category),
        expense.subCategory ?? "-",
        new Date(expense.date).toISOString().split("T")[0],
        expense.amount,
      ],
    ];

    await googleSheetsClient.post(
      `/${spreadsheetId}/values/2026!A:E:append`,
      { values },
      {
        params: {
          valueInputOption: "USER_ENTERED",
        },
        headers: {
          Authorization: `Bearer ${authResponse.access_token}`,
        },
      }
    );

    console.log("✅ Gasto guardado en Google Sheets");
    return true;
  } catch (error) {
    console.error("❌ Error guardando en Google Sheets:", error);
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
