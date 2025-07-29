import { Prisma, prisma } from "@linkbase/prisma";
import { ai_cached_embedding } from "@linkbase/prisma";

export const getCachedEmbedding = async (text: string) => {
  const embeddings = await prisma.$queryRaw<ai_cached_embedding[]>(
    Prisma.sql`
    SELECT id, text, created_at, updated_at, embedding::text FROM ai_cached_embedding 
    WHERE text = ${text} 
    LIMIT 1
  `
  );

  if (!embeddings || embeddings.length === 0) {
    return null;
  }

  return {
    ...embeddings[0],
    embedding: JSON.parse(
      embeddings[0].embedding as unknown as string
    ) as number[],
  };
};
