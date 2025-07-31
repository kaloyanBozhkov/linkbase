import { logError } from "@/helpers/logger";
import { OpenRouterTextGenerationModel } from "./constants";
import { getOpenRouterInstance } from "./openrouter";
import { getAISystemMessageQuery } from "@/queries/ai/getAISystemMessage";
import { ai_feature } from "@linkbase/prisma";
import { retry } from "@/helpers/retry";

const getExpandedQuery = async (text: string, systemMessage: string) => {
  const response = await getOpenRouterInstance().chat.completions.create({
    model: OpenRouterTextGenerationModel.GEMMA_3_27B_IT,
    temperature: 0,
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: text },
    ],
  });

  const expandedText = response.choices[0]?.message?.content?.trim();

  if (!expandedText) {
    logError(
      {
        name: "embeddings.expandQuery",
        message: "No expanded text received from AI, returning original text",
      },
      { text }
    );
    return text;
  }

  return text + ", " +expandedText;
};

export const expandQuery = async (text: string, withRetry = false): Promise<string> => {
  try {
    const { system_message } = await getAISystemMessageQuery(
      ai_feature.QUERY_EXPANSION
    );

    if (withRetry) {
      return retry(() => getExpandedQuery(text, system_message), 3);
    }

    return getExpandedQuery(text, system_message);
  } catch (error) {
    logError(
      {
        name: "embeddings.expandQuery",
        message: `Failed to expand query${withRetry ? " after 3 attempts" : ""}`,
      },
      { error }
    );
    return text;
  }
};
