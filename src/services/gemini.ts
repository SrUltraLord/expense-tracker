import { GoogleGenerativeAI } from "@google/generative-ai";
import promptTemplate from "../assets/prompt.md";
import { AppError, AppErrors, ExpenseData } from "../types";

export async function processTextWithGemini(
  apiKey: string,
  text: string,
): Promise<ExpenseData | null> {
  const prompt = buildBasePrompt() + text;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const { response } = await model.generateContent(prompt);
    const responseText = response.text().trim();

    return parseGeminiResponse(responseText);
  } catch (error: any) {
    handleGeminiError(error);
  }
}

export async function processImageWithGemini(
  apiKey: string,
  imageData: ArrayBuffer,
  caption?: string,
): Promise<ExpenseData | null> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const parts = [{ text: buildBasePrompt() }];

    if (caption) {
      parts.push({ text: `\n\nContexto adicional: ${caption}` });
    }

    const bytes = new Uint8Array(imageData);
    const base64Image = btoa(String.fromCharCode(...bytes));

    parts.push({
      inlineData: {
        data: base64Image,
        mimeType: "image/jpeg",
      },
    } as any);

    const result = await model.generateContent(parts);
    const response = await result.response;
    const responseText = response.text().trim();

    return parseGeminiResponse(responseText);
  } catch (error: any) {
    handleGeminiError(error);
  }
}

function buildBasePrompt(): string {
  const now = new Date();
  const isoDate = now.toISOString().split("T")[0];

  return promptTemplate.replace("${currentDate}", isoDate);
}

function parseGeminiResponse(responseText: string): ExpenseData | null {
  console.log("Gemini response:", responseText);

  const jsonMatch = responseText.match(/\{[\s\S]*?\}/);
  if (!jsonMatch) {
    console.error("No JSON found in response");
    return null;
  }

  try {
    const parsed: ExpenseData = JSON.parse(jsonMatch[0]);

    if (!parsed || parsed === null) {
      return null;
    }

    return {
      ...parsed,
      date: new Date(parsed.date),
    } as ExpenseData;
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return null;
  }
}

function handleGeminiError(error: any): never {
  console.error("Error processing with Gemini:", error);

  const message = error?.message;
  const isOverloadError =
    message?.includes("503") || message?.includes("overloaded");
  if (isOverloadError) {
    throw new AppError(AppErrors.SERVICE_OVERLOADED);
  }

  const isNetworkError =
    message?.includes("fetch") || message?.includes("network");
  if (isNetworkError) {
    throw new AppError(AppErrors.NETWORK_ERROR);
  }

  throw error;
}
