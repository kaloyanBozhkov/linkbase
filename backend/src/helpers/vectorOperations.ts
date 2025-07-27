import { prisma, fact, ai_cached_embedding, Prisma } from "@linkbase/prisma";
import { enquote } from "./sql";

export type VectorSimilarityType = "cosine" | "l2_distance" | "inner_product";

interface VectorSearchOptions {
  similarity?: number;
  limit?: number;
  offset?: number;
}

/**
 * Search for facts similar to a given embedding vector
 */
export async function searchSimilarFacts(
  searchEmbedding: number[],
  connectionId?: string,
  options: VectorSearchOptions = {}
): Promise<(fact & { similarity: number })[]> {
  const { similarity = 0.7, limit = 10, offset = 0 } = options;
  const embeddingJson = JSON.stringify(searchEmbedding);

  let results: (fact & { similarity: number })[];

  if (connectionId) {
    results = await prisma.$queryRaw<(fact & { similarity: number })[]>(
      Prisma.sql`
        SELECT 
          id,
          uuid,
          text,
          connection_id,
          created_at,
          updated_at,
          embedding,
          1 - (embedding <=> ${embeddingJson}::vector) as similarity
        FROM fact 
        WHERE 1 - (embedding <=> ${embeddingJson}::vector) > ${similarity}
          AND connection_id = ${connectionId}
        ORDER BY embedding <=> ${embeddingJson}::vector
        LIMIT ${limit}
        OFFSET ${offset}
      `
    );
  } else {
    results = await prisma.$queryRaw<(fact & { similarity: number })[]>(
      Prisma.sql`
        SELECT 
          id,
          uuid,
          text,
          connection_id,
          created_at,
          updated_at,
          embedding,
          1 - (embedding <=> ${embeddingJson}::vector) as similarity
        FROM fact 
        WHERE 1 - (embedding <=> ${embeddingJson}::vector) > ${similarity}
        ORDER BY embedding <=> ${embeddingJson}::vector
        LIMIT ${limit}
        OFFSET ${offset}
      `
    );
  }

  return results;
}

/**
 * Create a new fact with embedding
 */
export async function createFactWithEmbedding(data: {
  text: string;
  embedding: number[];
  connectionId: string;
}): Promise<fact> {
  const { text, embedding, connectionId } = data;

  const result = await prisma.$queryRaw<fact[]>`
    INSERT INTO fact (id, uuid, text, embedding, connection_id, created_at, updated_at)
    VALUES (gen_random_uuid(), gen_random_uuid(), ${enquote(
      text
    )}, ${JSON.stringify(embedding)}::vector, ${connectionId}, now(), now())
    RETURNING id, uuid, text, embedding, connection_id, created_at, updated_at
  `;

  return result[0];
}

/**
 * Update a fact's embedding
 */
export async function updateFactEmbedding(
  factId: string,
  embedding: number[]
): Promise<fact> {
  const result = await prisma.$queryRaw<fact[]>`
    UPDATE fact 
    SET embedding = ${JSON.stringify(embedding)}::vector, updated_at = now()
    WHERE id = ${factId}
    RETURNING id, uuid, text, embedding, connection_id, created_at, updated_at
  `;

  return result[0];
}

/**
 * Get a fact by ID with embedding
 */
export async function getFactWithEmbedding(
  factId: string
): Promise<fact | null> {
  const result = await prisma.$queryRaw<fact[]>`
    SELECT id, uuid, text, embedding, connection_id, created_at, updated_at
    FROM fact 
    WHERE id = ${factId}
  `;

  return result[0] || null;
}

/**
 * Delete a fact by ID
 */
export async function deleteFact(
  factId: string,
  connectionId?: string
): Promise<void> {
  if (connectionId) {
    await prisma.fact.delete({
      where: {
        id: factId,
        connection_id: connectionId,
      },
    });
  } else {
    await prisma.fact.delete({
      where: {
        id: factId,
      },
    });
  }
}

/**
 * Search for cached embeddings similar to a given text embedding
 */
export async function searchSimilarCachedEmbeddings(
  searchEmbedding: number[],
  options: VectorSearchOptions = {}
): Promise<(ai_cached_embedding & { similarity: number })[]> {
  const { similarity = 0.8, limit = 5, offset = 0 } = options;
  const embeddingJson = JSON.stringify(searchEmbedding);

  const results = await prisma.$queryRaw<
    (ai_cached_embedding & { similarity: number })[]
  >(
    Prisma.sql`
      SELECT 
        id,
        text,
        embedding,
        expanded_text,
        user_id,
        ai_system_message_id,
        created_at,
        updated_at,
        1 - (embedding <=> ${embeddingJson}::vector) as similarity
      FROM ai_cached_embedding 
      WHERE 1 - (embedding <=> ${embeddingJson}::vector) > ${similarity}
      ORDER BY embedding <=> ${embeddingJson}::vector
      LIMIT ${limit}
      OFFSET ${offset}
    `
  );

  return results;
}
