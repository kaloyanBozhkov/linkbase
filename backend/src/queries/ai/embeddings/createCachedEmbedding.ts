import { enquote, vectorize } from "@/helpers/sql";
import { Prisma, prisma } from "@linkbase/prisma";
import { ai_cached_embedding } from "@linkbase/prisma";
import { createId } from "@paralleldrive/cuid2";

export const createCachedEmbedding = async (
  text: string,
  embedding: number[]
) => {
  const createdEmbedding =
    await prisma.$queryRaw<ai_cached_embedding[]>(Prisma.sql`
    INSERT INTO linkbase.ai_cached_embedding (id, text, embedding)
    VALUES (${enquote(createId())}, ${enquote(text)}, ${vectorize(embedding)})
    RETURNING id, text, created_at, updated_at
  `);

  return {
    ...createdEmbedding[0],
    embedding,
  };
};
