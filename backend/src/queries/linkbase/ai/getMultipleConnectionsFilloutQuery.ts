import { getAudioTranscription } from "@/ai/getAudioTranscription";
import { getLLMResponse } from "@/ai/getLLMResponse";
import { retry } from "@/helpers/retry";
import { ai_feature, prisma } from "@linkbase/prisma";
import z from "zod";

const _getMultipleConnectionsFilloutQuery = async ({
  audioFileUrl,
}: {
  audioFileUrl: string;
}) => {
  try {
    const transcription = await getAudioTranscription(audioFileUrl);
    const systemMessage = await prisma.ai_system_message.findFirstOrThrow({
      where: {
        ai_feature: ai_feature.ADD_MULTIPLE_CONNECTIONS_FILL_OUT,
      },
    });
    const response = await getLLMResponse({
      userMessage: transcription,
      systemMessage: systemMessage.system_message,
      schema: multipleConnectionsFilloutSchema,
    });
    return response;
  } catch (error) {
    console.error("error parsing multiple connections", error);
    throw error;
  }
};

const connectionSchema = z.object({
  name: z.string(),
  metWhere: z.string().default("-"),
  facts: z.array(z.string()),
});

const multipleConnectionsFilloutSchema = z.object({
  connections: z.array(connectionSchema),
});

export const getMultipleConnectionsFilloutQuery = async ({
  audioFileUrl,
}: {
  audioFileUrl: string;
}) => {
  return retry(() => _getMultipleConnectionsFilloutQuery({ audioFileUrl }), 3);
};
