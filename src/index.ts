import { Hono } from "hono";
import { handleCommand, handleExpense } from "./handlers";
import { verifySecretToken, userAuthMiddleware } from "./middlewares";
import { TelegramMessage } from "./types";

type Bindings = {
  SECRET_TOKEN: string;
  TELEGRAM_BOT_TOKEN: string;
  GEMINI_API_KEY: string;
  GOOGLE_SERVICE_ACCOUNT_CREDENTIALS: string;
  GOOGLE_SPREADSHEET_ID: string;
  ALLOWED_CHAT_IDS?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (context) => context.json({ ok: true }));

app.use("/webhook", verifySecretToken);
app.use("/webhook", userAuthMiddleware);
app.post("/webhook", async (context) => {
  const { message } = await context.req.json<{ message: TelegramMessage }>();
  if (!message) {
    return context.json({ ok: true });
  }

  if (message.text?.startsWith("/")) {
    return await handleCommand(context);
  }

  return await handleExpense(context);
});

export default app;
