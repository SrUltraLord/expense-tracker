import { Hono } from "hono";
import { expensesHandler } from "./handlers";
import { verifySecretToken } from "./middlewares";

const app = new Hono();

app.get("/", (context) => context.json({ ok: true }));

app.use("/webhook", verifySecretToken);
app.post("/webhook", expensesHandler);

export default app;
