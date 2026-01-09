import { AppErrors, ExpenseCategory, ExpenseData } from "../types";
import { ERROR_MESSAGES, MessageData } from "./messages";

export function buildExpenseSummaryMessage(expense: ExpenseData): string {
  return `💰 <b>Monto:</b> $${expense.amount}
📝 <b>Concepto:</b> ${expense.description}
📶 <b>Categoría:</b> ${getCategoryDisplay(expense.category)}
📅 <b>Fecha:</b> ${expense.date.toISOString().split("T")[0]}`;
}

export function getCategoryDisplay(category: ExpenseCategory): string {
  const categoryMap: Record<ExpenseCategory, string> = {
    needs: "Necesidades",
    wants: "Deseos",
    savings: "Inversión",
  };

  return categoryMap[category];
}

export function formatErrorMessage(
  errorCode: AppErrors,
  context?: string
): string {
  const error = ERROR_MESSAGES[errorCode];

  return `
<b>${error.title}</b>

${error.body}${context ? `\n\n${context}` : ""}${
    error.footer ? `\n\n<i>${error.footer}</i>` : ""
  }
`.trim();
}

export function formatUserMessage({
  title,
  body,
  footer,
}: MessageData): string {
  return `
<b>${title}</b>

${body}

${footer ? `<i>${footer}</i>` : ""}
`.trim();
}
