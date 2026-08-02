import axios from "axios";
import { env, isAiConfigured } from "../config/env";
import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";
import { ExtractedProjectData } from "../types";
import { EXTRACTION_SYSTEM_PROMPT, buildExtractionUserPrompt } from "../prompts/extractionPrompt";

interface ChatCompletionResponse {
  choices: Array<{ message: { content: string } }>;
}

/**
 * Calls an OpenAI-compatible chat completions endpoint. Provider, base URL,
 * key and model are entirely env-driven (AI_API_URL / AI_API_KEY / AI_MODEL)
 * so swapping providers never requires touching this file.
 */
async function callChatCompletion(systemPrompt: string, userPrompt: string): Promise<string> {
  if (!isAiConfigured()) {
    throw new AppError(
      "AI provider is not configured. Set AI_API_KEY, AI_API_URL and AI_MODEL in backend/.env",
      500
    );
  }

  const url = `${env.ai.apiUrl.replace(/\/+$/, "")}/chat/completions`;

  try {
    const start = Date.now();
    const response = await axios.post<ChatCompletionResponse>(
      url,
      {
        model: env.ai.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.2,
        response_format: { type: "json_object" },
      },
      {
        headers: {
          Authorization: `Bearer ${env.ai.apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 60_000,
      }
    );

    logger.info("AI response received", { durationMs: Date.now() - start, model: env.ai.model });

    const content = response.data.choices?.[0]?.message?.content;
    if (!content) {
      throw new AppError("AI provider returned an empty response", 502);
    }
    return content;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 502;
      const detail = error.response?.data ? JSON.stringify(error.response.data) : error.message;
      logger.error("AI provider call failed", { status, detail });
      throw new AppError(`AI provider request failed (${status}): ${detail}`, 502);
    }
    throw error;
  }
}

function parseJsonResponse(raw: string): Partial<ExtractedProjectData> & Record<string, unknown> {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    logger.error("Failed to parse AI JSON response", { raw: cleaned.slice(0, 500) });
    throw new AppError("AI provider returned malformed JSON", 502);
  }
}

export async function analyzeDocumentText(
  documentText: string
): Promise<Record<string, unknown>> {
  if (!documentText || documentText.trim().length === 0) {
    throw new AppError("No text was extracted from the document; nothing to analyze", 422);
  }

  const raw = await callChatCompletion(EXTRACTION_SYSTEM_PROMPT, buildExtractionUserPrompt(documentText));
  return { ...parseJsonResponse(raw), rawAiResponse: raw };
}
