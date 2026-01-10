import { Context, Next } from "hono";

export async function verifySecretToken(context: Context, next: Next) {
  const secretToken = context.env.SECRET_TOKEN;
  const requestToken = context.req.header("X-Telegram-Bot-Api-Secret-Token");

  if (!requestToken || requestToken !== secretToken) {
    return context.json({ error: "Unauthorized" }, 401);
  }

  await next();
}
