import { prisma, fact } from "@linkbase/prisma";
import { TextEmbedding } from "../../../../ai/embeddings";

export const updateFactQuery = async ({
  factId,
  connectionId,
  text,
  embedding,
}: {
  factId: string;
  connectionId: string;
  text: string;
  embedding: TextEmbedding;
}): Promise<fact> => {
  return prisma.fact.update({
    where: {
      id: factId,
      connection_id: connectionId,
    },
    data: {
      text,
      embedding_id: embedding.cachedEmbeddingId,
    },
  });
};
