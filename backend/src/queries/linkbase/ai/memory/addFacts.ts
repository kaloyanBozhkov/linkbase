import { prisma } from "@linkbase/prisma";
import { TextEmbedding } from "../../../../ai/embeddings";

export const addFactsQuery = async ({
  connectionId,
  embeddings,
}: {
  connectionId: string;
  embeddings: TextEmbedding[];
}) => {
  await prisma.fact.createMany({
    data: embeddings.map(({ text, cachedEmbeddingId }) => ({
      text,
      connection_id: connectionId,
      embedding_id: cachedEmbeddingId,
    })),
  });
  // prisma doesnt support returning on createMany
  return prisma.fact.findMany({
    where: {
      connection_id: connectionId,
      embedding_id: {
        in: embeddings.map(({ cachedEmbeddingId }) => cachedEmbeddingId),
      },
    },
  });
};

export const addFactQuery = async ({
  connectionId,
  embedding,
}: {
  connectionId: string;
  embedding: TextEmbedding;
}) => {
  return prisma.fact.create({
    data: {
      text: embedding.text,
      connection_id: connectionId,
      embedding_id: embedding.cachedEmbeddingId,
    },
  });
};
