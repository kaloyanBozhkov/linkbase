import { prisma } from "@linkbase/prisma";
import { ai_feature } from "@linkbase/prisma";

export const getAISystemMessageQuery = async (aiFeature: ai_feature) => {
  const result = await prisma.ai_system_message.findFirst({
    where: {
      ai_feature: aiFeature,
    },
    select: {
      system_message: true,
      id: true,
    },
    orderBy: {
      updated_at: "desc",
    },
  });

  if (!result) {
    throw new Error(`No system message found for ${aiFeature}`);
  }

  return result;
};
