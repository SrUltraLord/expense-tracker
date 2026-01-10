import { Hono } from "hono";
import { expensesHandler } from "./handlers";
import { verifySecretToken, userAuthMiddleware } from "./middlewares";

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
app.post("/webhook", expensesHandler);

export default app;
