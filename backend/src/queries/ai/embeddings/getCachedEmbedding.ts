import { prisma } from "@linkbase/prisma";
import { ai_cached_embedding } from "@linkbase/prisma";

export const getCachedEmbedding = async (text: string) => {
  const embedding = await prisma.ai_cached_embedding.findFirst({
    where: {
      text,
    },
  });

  if (!embedding) {
    return null;
  }

  return embedding as ai_cached_embedding;
};
