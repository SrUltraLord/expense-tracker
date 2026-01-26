import { Context } from "hono";
import { TelegramMessage } from "../types";
import { formatUserMessage } from "../utils/user-message-utils";
import { sendTelegramMessage } from "../services/telegram";

export async function handleCommand(context: Context) {
  const { TELEGRAM_BOT_TOKEN } = context.env;

  const { message } = await context.req.json<{ message: TelegramMessage }>();
  if (!message) {
    return context.json({ ok: true });
  }

  const chatId = message.chat.id;

  const commandHandlers: Record<string, () => Promise<void>> = {
    "/start": async () => await handleStart(TELEGRAM_BOT_TOKEN, chatId),
  };

  const command = message.text?.split(" ")[0];
  if (command && commandHandlers[command]) {
    await commandHandlers[command]();

    return context.json({ ok: true });
  }

  const userMessage = formatUserMessage({
    title: "⚠️ Comando no reconocido",
    body: `El comando "${command}" no es válido. Usa /start para comenzar.`,
  });

  await sendTelegramMessage(TELEGRAM_BOT_TOKEN, chatId, userMessage);

  return context.json({ ok: true });
}

async function handleStart(telegramToken: string, chatId: number) {
  const userMessage = formatUserMessage({
    title: "🎉 ¡Bienvenido a Expense Tracker Bot!",
    body: "Envía un mensaje describiendo tu gasto o una foto de tu recibo y yo me encargo del resto.",
    footer: "Usa /help para ver todos los comandos disponibles.",
  });

  await sendTelegramMessage(telegramToken, chatId, userMessage);
}
