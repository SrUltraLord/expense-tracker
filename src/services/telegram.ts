import axios from "axios";
import { telegramClient } from "../api/clients";
import { TelegramFile } from "../types";

export async function sendTelegramMessage(
  botToken: string,
  chatId: number,
  text: string
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

export async function getTelegramFile(
  botToken: string,
  fileId: string
): Promise<TelegramFile> {
  const { data } = await telegramClient.get(
    `/bot${botToken}/getFile?file_id=${fileId}`
  );

  if (!data.ok) {
    throw new Error(`Telegram API error getting file: ${data.description}`);
  }

  return data.result;
}

export async function downloadTelegramFile(
  botToken: string,
  filePath: string
): Promise<ArrayBuffer> {
  const url = `https://api.telegram.org/file/bot${botToken}/${filePath}`;
  const response = await axios.get(url, { responseType: "arraybuffer" });

  return response.data;
}
