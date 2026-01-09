import { Context } from "hono";
import { sendTelegramMessage } from "../services/telegram";
import { processWithGemini, GeminiError } from "../services/gemini";
import { saveToGoogleSheets } from "../services/google-sheets";
import {
  buildExpenseSummaryMessage,
  formatErrorMessage,
  formatUserMessage,
} from "../utils/user-message-utils";

export async function expensesHandler(context: Context): Promise<Response> {
  const {
    GEMINI_API_KEY: geminiKey,
    GOOGLE_SERVICE_ACCOUNT_CREDENTIALS: googleCredentials,
    GOOGLE_SPREADSHEET_ID: spreadsheetId,
    TELEGRAM_BOT_TOKEN: telegramToken,
  } = context.env;

  const { message } = await context.req.json();
  if (!message) {
    return context.json({ ok: true });
  }

  const chatId = message.chat.id;
  const text = message.text;

  try {
    const expenseResponse = await processWithGemini(text, geminiKey);
    if (!expenseResponse) {
      return context.json({ ok: true });
    }

    const isSaved = await saveToGoogleSheets(
      expenseResponse,
      googleCredentials,
      spreadsheetId
    );

    if (!isSaved) {
      const userMessage = formatUserMessage({
        title: "⚠️ Gasto procesado pero hubo un error al guardarlo",
        body: buildExpenseSummaryMessage(expenseResponse),
        footer: "🕑 Inténtalo de nuevo más tarde.",
      });

      await sendTelegramMessage(chatId, userMessage, telegramToken);

      return context.json({ ok: false });
    }

    const userMessage = formatUserMessage({
      title: "✅ Gasto registrado correctamente",
      body: buildExpenseSummaryMessage(expenseResponse),
      footer: "¡Sigue manteniendo tus finanzas en orden! 🚀",
    });

    await sendTelegramMessage(chatId, userMessage, telegramToken);

    return context.json({ ok: true });
  } catch (error) {
    if (error instanceof GeminiError) {
      const userMessage = formatErrorMessage(error.code as any);

      await sendTelegramMessage(chatId, userMessage, telegramToken);
      return context.json({ ok: true, error: error.code });
    }

    console.error("Unhandled error:", error);
    return context.json({ ok: false });
  }
}
