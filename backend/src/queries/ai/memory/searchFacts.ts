import { prisma, fact, Prisma } from "@linkbase/prisma";
import { TextEmbedding } from "../../../ai/embeddings";

export interface SearchFactsResult {
  facts: Array<fact & { similarity?: number }>;
  nextCursor?: string;
}

export const searchFactsQuery = async ({
  connectionId,
  searchEmbedding,
  minSimilarity = 0.2,
  limit = 10,
  cursor,
}: {
  connectionId: string;
  searchEmbedding: TextEmbedding;
  minSimilarity?: number;
  limit?: number;
  cursor?: string;
}): Promise<SearchFactsResult> => {
  const embeddingJson = JSON.stringify(searchEmbedding.embedding);
  
  let results: Array<fact & { similarity: number }>;
  
  if (cursor) {
    results = await prisma.$queryRaw<Array<fact & { similarity: number }>>(
      Prisma.sql`
        SELECT f.*, 
               (1 - (f.embedding <=> ${embeddingJson}::vector)) as similarity
        FROM fact f
        WHERE f.connection_id = ${connectionId}
          AND (1 - (f.embedding <=> ${embeddingJson}::vector)) >= ${minSimilarity}
          AND f.id > ${cursor}
        ORDER BY f.embedding <=> ${embeddingJson}::vector
        LIMIT ${limit + 1}
      `
    );
  } else {
    results = await prisma.$queryRaw<Array<fact & { similarity: number }>>(
      Prisma.sql`
        SELECT f.*, 
               (1 - (f.embedding <=> ${embeddingJson}::vector)) as similarity
        FROM fact f
        WHERE f.connection_id = ${connectionId}
          AND (1 - (f.embedding <=> ${embeddingJson}::vector)) >= ${minSimilarity}
        ORDER BY f.embedding <=> ${embeddingJson}::vector
        LIMIT ${limit + 1}
      `
    );
  }

  const hasMore = results.length > limit;
  const facts = hasMore ? results.slice(0, -1) : results;
  const nextCursor = hasMore ? facts[facts.length - 1].id : undefined;

  return {
    facts: facts as Array<fact & { similarity: number }>,
    nextCursor,
  };
};

export const listAllFactsQuery = async ({
  connectionId,
  limit = 10,
  cursor,
}: {
  connectionId: string;
  limit?: number;
  cursor?: string;
}): Promise<SearchFactsResult> => {
  const facts = await prisma.fact.findMany({
    where: {
      connection_id: connectionId,
      ...(cursor && { id: { gt: cursor } }),
    },
    orderBy: {
      created_at: 'desc',
    },
    take: limit + 1,
  });

  const hasMore = facts.length > limit;
  const resultFacts = hasMore ? facts.slice(0, -1) : facts;
  const nextCursor = hasMore ? resultFacts[resultFacts.length - 1].id : undefined;

  return {
    facts: resultFacts as fact[],
    nextCursor,
  };
}; 