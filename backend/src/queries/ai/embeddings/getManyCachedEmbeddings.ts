import { Prisma, type ai_cached_embedding, prisma } from "@linkbase/prisma";

export const getManyCachedEmbeddings = async (texts: string[]) => {
  const embeddings = await prisma.$queryRaw<ai_cached_embedding[]>(
    Prisma.sql`
      SELECT id, text, created_at, updated_at, embedding::text FROM ai_cached_embedding 
      WHERE text IN (${Prisma.join(texts)})
    `
  );

  return embeddings.map((embedding) => ({
    ...embedding,
    embedding: JSON.parse(embedding.embedding as unknown as string) as number[],
  }));
};
