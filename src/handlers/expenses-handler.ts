import { Context } from "hono";
import { sendTelegramMessage } from "../services/telegram";
import { processWithGemini, GeminiError } from "../services/gemini";
import { saveToGoogleSheets } from "../services/google-sheets";

export async function expensesHandler(context: Context): Promise<Response> {
  const { message } = await context.req.json();

  if (!message) {
    return context.json({ ok: true });
  }

  const chatId = message.chat.id;
  const text = message.text;

  let response;
  try {
    response = await processWithGemini(text, context.env.GEMINI_API_KEY);
  } catch (error) {
    if (error instanceof GeminiError) {
      let userMessage = "";

      if (error.code === "SERVICE_OVERLOADED") {
        userMessage =
          "⏳ <b>Servicio temporalmente ocupado</b>\n\n" +
          "El servicio de inteligencia artificial está experimentando alta demanda en este momento. " +
          "Por favor, intenta registrar tu gasto nuevamente en unos minutos.\n\n" +
          "<i>Disculpa las molestias.</i> 🙏";
      } else if (error.code === "NETWORK_ERROR") {
        userMessage =
          "🌐 <b>Error de conexión</b>\n\n" +
          "No se pudo conectar con el servicio de IA. Verifica tu conexión e intenta nuevamente.";
      }

      await sendTelegramMessage(
        chatId,
        userMessage,
        context.env.TELEGRAM_BOT_TOKEN
      );
      return context.json({ ok: true, error: error.code });
    }

    // Error no manejado, reintenta o ignora
    console.error("Unhandled error in processWithGemini:", error);
    return context.json({ ok: true });
  }

  if (!response) {
    return context.json({ ok: true });
  }

  const isSaved = await saveToGoogleSheets(
    response,
    context.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS,
    context.env.GOOGLE_SPREADSHEET_ID
  );

  if (!isSaved) {
    await sendTelegramMessage(
      chatId,
      `
⚠️ Gasto procesado pero hubo un error al guardarlo. Intenta de nuevo.
      
💰 <b>Monto:</b> $${response.amount}
📝 <b>Concepto:</b> ${response.description}
📶 <b>Categoría:</b> ${response.category}
📅 <b>Fecha:</b> ${response.date.toISOString().split("T")[0]}`,
      context.env.TELEGRAM_BOT_TOKEN
    );

    return context.json({ ok: false });
  }

  const chatResponse = `
✅ <b>Gasto Registrado Exitosamente</b>

💰 <b>Monto:</b> $${response.amount}
📝 <b>Concepto:</b> ${response.description}
📶 <b>Categoría:</b> ${response.category}
📅 <b>Fecha:</b> ${response.date.toISOString().split("T")[0]}

<i>¡Sigue así manteniendo tus finanzas en orden!</i> 🚀
`.trim();

  await sendTelegramMessage(
    chatId,
    chatResponse,
    context.env.TELEGRAM_BOT_TOKEN
  );

  return context.json({ ok: true, response: chatResponse });
}
