import { GoogleGenerativeAI } from "@google/generative-ai";
import promptTemplate from "../assets/prompt.md";
import { ExpenseData } from "../types";

export class GeminiError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = "GeminiError";
  }
}

export async function processWithGemini(
  description: string,
  apiKey: string
): Promise<ExpenseData | null> {
  const prompt =
    promptTemplate.replace(
      "${currentDate}",
      new Date().toISOString().split("T")[0]
    ) + description;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    console.log("Gemini response:", text);

    const jsonMatch = text.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) {
      console.error("No JSON found in response");
      return null;
    }

    const parsed: ExpenseData = JSON.parse(jsonMatch[0]);

    if (!parsed || parsed === null) {
      return null;
    }

    return {
      ...parsed,
      date: new Date(parsed.date),
    } as ExpenseData;
  } catch (error: any) {
    console.error("Error processing with Gemini:", error);

    // Detectar error 503 (servicio sobrecargado)
    if (
      error?.message?.includes("503") ||
      error?.message?.includes("overloaded")
    ) {
      throw new GeminiError(
        "SERVICE_OVERLOADED",
        "El servicio de IA está temporalmente sobrecargado"
      );
    }

    // Detectar otros errores de red
    if (
      error?.message?.includes("fetch") ||
      error?.message?.includes("network")
    ) {
      throw new GeminiError(
        "NETWORK_ERROR",
        "Error de conexión con el servicio de IA"
      );
    }

    return null;
  }
}
