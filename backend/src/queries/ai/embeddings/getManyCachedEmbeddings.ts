import { type ai_cached_embedding, prisma } from "@linkbase/prisma";

export const getManyCachedEmbeddings = async (texts: string[]) => {
  const embeddings = await prisma.ai_cached_embedding.findMany({
    where: {
      text: { in: texts },
    },
  });

  return embeddings as ai_cached_embedding[];
};
