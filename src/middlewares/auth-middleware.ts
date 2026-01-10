import { Context, Next } from "hono";

export async function userAuthMiddleware(context: Context, next: Next) {
  const { message } = await context.req.json();

  if (!message) {
    return context.json({ ok: true });
  }

  const chatId = message.chat.id;
  const allowedUsers =
    context.env.ALLOWED_CHAT_IDS?.split(",").map(Number) || [];

  if (allowedUsers.length > 0 && !allowedUsers.includes(chatId)) {
    console.log(`Unauthorized access attempt from chat ID: ${chatId}`);
    return context.json({ ok: false, message: "Unauthorized" });
  }

  await next();
}
