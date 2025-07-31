import { enquote, vectorize } from "@/helpers/sql";
import { embedding_feature_type, Prisma, prisma } from "@linkbase/prisma";
import { ai_cached_embedding } from "@linkbase/prisma";
import { createId } from "@paralleldrive/cuid2";

export const createCachedEmbedding = async (
  text: string,
  embedding: number[],
  featureType: embedding_feature_type[]
) => {
  const createdEmbedding =
    await prisma.$queryRaw<ai_cached_embedding[]>(Prisma.sql`
    INSERT INTO ai_cached_embedding (id, text, embedding, feature_type)
    VALUES (${enquote(createId())}, ${enquote(text)}, ${vectorize(embedding)}, ARRAY[${featureType.join(", ")}]::embedding_feature_type[])
    RETURNING id, text, created_at, updated_at
  `);

  return {
    ...createdEmbedding[0],
    embedding,
  };
};
