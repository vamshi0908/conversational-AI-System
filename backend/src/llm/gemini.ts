import { GoogleGenerativeAI } from "@google/generative-ai";
import { ExtractSchema, ReplySchema, type ExtractResult, type ReplyResult } from "./schemas.js";
import { maskPII, truncate } from "./redact.js";

const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
  console.warn("[WARN] GOOGLE_API_KEY is not set. LLM calls will fail.");
}
const genAI = new GoogleGenerativeAI(apiKey ?? "");
const MODEL = process.env.GEMINI_MODEL ?? "gemini-1.5-flash";

async function withTimeout<T>(p: Promise<T>, ms = 4000): Promise<T> {
  return (await Promise.race([
    p,
    new Promise<T>((_, rej) => setTimeout(() => rej(new Error("LLM_TIMEOUT")), ms))
  ])) as T;
}

function model(systemInstruction?: string) {
  return genAI.getGenerativeModel({
    model: MODEL,
    ...(systemInstruction ? { systemInstruction } : {})
  });
}

export async function extractIntentAndSlots(userText: string): Promise<ExtractResult | null> {
  const m = model(`You extract banking intents and slots. Return ONLY valid JSON.`);
  const prompt = `From the USER message, fill this JSON:
{
  "intent": "block_card" | "mini_statement" | "loan_precheck" | "unknown",
  "slots": {
    "cardLast4"?: string,
    "accountId"?: string,
    "limit"?: number,
    "monthlyIncome"?: number,
    "existingEmi"?: number,
    "tenureMonths"?: number
  },
  "confidence": number
}
USER: ${truncate(maskPII(userText))}`;

  const result = await withTimeout(
    m.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }]}],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 256,
        responseMimeType: "application/json"
      }
    }),
    5000
  );

  const raw = result.response.text().trim();
  try {
    const parsed = JSON.parse(raw);
    const valid = ExtractSchema.parse(parsed);
    return valid;
  } catch {
    return null;
  }
}

export async function composeReply(context: {
  intent: ExtractResult["intent"];
  slots: ExtractResult["slots"];
  toolResult: unknown;
}): Promise<ReplyResult | null> {
  const m = model(`You write short, professional banking replies. 1–3 sentences. No PII. No speculation.`);
  const prompt = `Create a concise reply.

Intent: ${context.intent}
Slots: ${JSON.stringify(context.slots)}
ToolResult: ${JSON.stringify(context.toolResult).slice(0, 800)}

Return ONLY JSON: {"text": "<message>"}`;

  const result = await withTimeout(
    m.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }]}],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 200,
        responseMimeType: "application/json"
      }
    }),
    5000
  );

  const raw = result.response.text().trim();
  try {
    const parsed = JSON.parse(raw);
    const valid = ReplySchema.parse(parsed);
    return valid;
  } catch {
    return null;
  }
}
