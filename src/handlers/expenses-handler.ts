import { Context } from "hono";
import {
  sendTelegramMessage,
  getTelegramFile,
  downloadTelegramFile,
} from "../services/telegram";
import {
  processTextWithGemini,
  processImageWithGemini,
  GeminiError,
} from "../services/gemini";
import { saveToGoogleSheets } from "../services/google-sheets";
import {
  buildExpenseSummaryMessage,
  formatErrorMessage,
  formatUserMessage,
} from "../utils/user-message-utils";
import { TelegramMessage, TelegramPhotoSize, ExpenseData } from "../types";

export async function expensesHandler(context: Context): Promise<Response> {
  const {
    GEMINI_API_KEY: geminiKey,
    GOOGLE_SERVICE_ACCOUNT_CREDENTIALS: googleCredentials,
    GOOGLE_SPREADSHEET_ID: spreadsheetId,
    TELEGRAM_BOT_TOKEN: telegramToken,
  } = context.env;

  const { message } = await context.req.json<{ message: TelegramMessage }>();
  if (!message) {
    return context.json({ ok: true });
  }

  const chatId = message.chat.id;

  try {
    const expenseResponse = await analyzeUserMessageWithGemini(
      geminiKey,
      telegramToken,
      message
    );

    if (!expenseResponse) {
      const userMessage = formatUserMessage({
        title: "⚠️ No se pudo procesar el gasto",
        body: "Tu mensaje no contiene suficiente información para registrar un gasto.",
      });

      await sendTelegramMessage(telegramToken, chatId, userMessage);

      return context.json({ ok: true });
    }

    const isSaved = await saveToGoogleSheets(
      googleCredentials,
      spreadsheetId,
      expenseResponse
    );

    if (!isSaved) {
      const userMessage = formatUserMessage({
        title: "⚠️ Gasto procesado pero hubo un error al guardarlo",
        body: buildExpenseSummaryMessage(expenseResponse),
        footer: "🕑 Inténtalo de nuevo más tarde.",
      });

      await sendTelegramMessage(telegramToken, chatId, userMessage);

      return context.json({ ok: false });
    }

    const userMessage = formatUserMessage({
      title: "✅ Gasto registrado correctamente",
      body: buildExpenseSummaryMessage(expenseResponse),
      footer: "¡Sigue manteniendo tus finanzas en orden! 🚀",
    });

    await sendTelegramMessage(telegramToken, chatId, userMessage);

    return context.json({ ok: true });
  } catch (error) {
    if (error instanceof GeminiError) {
      const userMessage = formatErrorMessage(error.code as any);

      await sendTelegramMessage(telegramToken, chatId, userMessage);
      return context.json({ ok: true, error: error.code });
    }

    console.error("Unhandled error:", error);
    return context.json({ ok: false });
  }
}

async function analyzeUserMessageWithGemini(
  geminiKey: string,
  telegramToken: string,
  message: TelegramMessage
): Promise<ExpenseData | null> {
  const { text, caption, photo: photos } = message;

  const hasImageAttached = photos && photos.length > 0;
  if (hasImageAttached) {
    const { file_id: fileId } = photos[photos.length - 1];
    const { file_path: filePath } = await getTelegramFile(
      telegramToken,
      fileId
    );
    if (!filePath) {
      throw new Error("No se pudo obtener la ruta del archivo");
    }

    const imageData = await downloadTelegramFile(telegramToken, filePath);

    return await processImageWithGemini(geminiKey, imageData, caption);
  }

  if (text) {
    return await processTextWithGemini(geminiKey, text);
  }

  return null;
}
