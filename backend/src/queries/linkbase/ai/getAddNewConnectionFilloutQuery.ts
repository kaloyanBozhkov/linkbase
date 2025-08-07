import { getOpenAISFWInstance } from "@/ai/openai";
import { ai_feature, prisma } from "@linkbase/prisma";
import z from "zod";

export const getAddNewConnectionFilloutQuery = async ({
  audioFileUrl,
}: {
  audioFileUrl: string;
}) => {
  try {
    console.log("audioFileUrl", audioFileUrl);
    const openai = getOpenAISFWInstance();
    const file = await fetch(audioFileUrl);
    const fileBlob = await file.blob();
    const namedBlob = new Blob([fileBlob], { type: fileBlob.type });
    // @ts-ignore
    namedBlob.name = "userAudio.m4a"; // Add required name
    console.log("about to transcribe file");
    const transcription = await openai.audio.transcriptions.create({
      file: namedBlob,
      model: "gpt-4o-transcribe",
      response_format: "text",
    });
    console.log("transcription", transcription);
    const systemMessage = await prisma.ai_system_message.findFirstOrThrow({
      where: {
        ai_feature: ai_feature.ADD_CONNECTION_FILL_OUT,
      },
    });
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemMessage?.system_message },
        { role: "user", content: transcription },
      ],
    });

    const responseText = response.choices[0].message.content;
    if (!responseText) {
      throw new Error("No fillout response from LLM");
    }
    console.log("response before parsing", responseText);
    const parsedResponse = filloutSchema.parse(JSON.parse(responseText));
    return parsedResponse;
  } catch (error) {
    console.error("error", error);
    throw error;
  }
};

const filloutSchema = z.object({
  name: z.string(),
  metWhere: z.string().default("-"),
  facts: z.array(z.string()),
});
