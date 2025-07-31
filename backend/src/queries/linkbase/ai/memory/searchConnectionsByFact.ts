import {
  prisma,
  fact,
  connection,
  embedding_feature_type,
  Prisma,
} from "@linkbase/prisma";
import { TextEmbedding } from "../../../../ai/embeddings";
import {
  getSimilarityExpression,
  VectorSimilarityType,
  assertMinSimilarityRange,
} from "../../../../ai/embeddings";
import { env } from "@/env";

export interface SearchConnectionsByFactResult {
  connections: Array<connection & { facts: { id: string; text: string }[] }>;
  nextCursor?: number;
}

export const searchConnectionsByFactQuery = async ({
  limit = 10,
  searchEmbedding,
  minSimilarity = 0.8,
  offset = 0,
  userId,
}: {
  userId: string;
  limit?: number;
  searchEmbedding: TextEmbedding;
  minSimilarity?: number;
  offset: number;
}) => {
  assertMinSimilarityRange(minSimilarity);

  const similarityType = VectorSimilarityType.COSINE;
  // Build the similarity expression for search queries
  const similarityExpression = getSimilarityExpression({
    type: similarityType,
    embedding: searchEmbedding.embedding,
    embeddingColumn: "e.embedding",
  });

  const featureType = embedding_feature_type.FACT;

  const query = `
    WITH matched_facts AS (
      SELECT
        f.*,
        ${similarityExpression} AS similarity,
        c.id AS connection_id,
        ROW_NUMBER() OVER (
          PARTITION BY f.connection_id
          ORDER BY ${similarityExpression} DESC
        )::int AS rn
      FROM ai_cached_embedding e
      JOIN fact f ON f.embedding_id = e.id
      JOIN connection c ON f.connection_id = c.id
      WHERE
        c.user_id = '${userId}'
        AND '${featureType}' = ANY (e.feature_type)
        AND ${similarityExpression} > ${minSimilarity}
    )
    SELECT *
    FROM matched_facts
    WHERE rn = 1
    ORDER BY similarity DESC
    LIMIT ${limit} OFFSET ${offset};
  `;

  const result = await prisma.$queryRaw<
    {
      id: string;
      text: string;
      created_at: string;
      updated_at: string;
      connection_id: string;
      embedding_id: string;
      similarity: number;
      rn: number;
    }[]
  >(Prisma.sql([query]));

  const connections = await prisma.connection.findMany({
    where: {
      id: { in: result.map((r) => r.connection_id) },
    },
    include: {
      facts: true,
      social_medias: true,
    },
  });

  const sortedConnectionsAndFacts = connections
    .map((c) => ({
      ...c,
      facts: c.facts
        .map((f) => {
          const similarity = result.find((r) => r.id === f.id)?.similarity ?? 0;
          return {
            id: f.id,
            text:
              f.text +
              (env.NODE_ENV === "development" ? " \n" + similarity : ""),
            similarity,
          };
        })
        .sort((a, b) => b.similarity - a.similarity), // make sure facts get sorted by similarity too for viewing
    }))
    .sort(
      (a, b) =>
        b.facts.reduce((acc, f) => acc + f.similarity, 0) -
        a.facts.reduce((acc, f) => acc + f.similarity, 0)
    );

  return {
    connections: sortedConnectionsAndFacts.map((c) => ({
      ...c,
      facts: c.facts.map((f) => ({
        id: f.id,
        text: f.text,
      })),
    })),
  };
};
