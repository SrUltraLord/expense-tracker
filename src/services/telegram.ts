import axios from "axios";

const telegramClient = axios.create({
  baseURL: "https://api.telegram.org",
});

export async function sendTelegramMessage(
  chatId: number,
  text: string,
  botToken: string
): Promise<void> {
  const { data } = await telegramClient.post(`/bot${botToken}/sendMessage`, {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
  });

  if (!data.ok) {
    throw new Error(`Telegram API error: ${data.statusText}`);
  }
}
