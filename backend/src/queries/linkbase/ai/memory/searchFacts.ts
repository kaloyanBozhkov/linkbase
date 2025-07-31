import { prisma, fact } from "@linkbase/prisma";
import { TextEmbedding } from "../../../../ai/embeddings";
import {
  getSimilarityExpression,
  VectorSimilarityType,
  assertMinSimilarityRange,
} from "../../../../ai/embeddings";
import {
  createQueryBuilder,
  addSelectField,
  addFrom,
  addJoin,
  addWhereCondition,
  addOrderBy,
  setLimit,
  buildQuery,
  createInCondition,
} from "../../../../helpers/sql";

export interface SearchCursor {
  id: string;
  similarityValue?: number;
}

export interface SearchFactsResult {
  facts: Array<
    Pick<fact, "id" | "text"> & {
      connectionId: fact["connection_id"];
      similarity?: number;
    }
  >;
  nextCursor?: SearchCursor;
}

// Special arguments for listing all facts without search
export const getFactsListAllArgs = {
  searchEmbedding: null,
  minSimilarity: 0,
};

export const searchFactsQuery = async ({
  userId,
  limit = 10,
  skipVectorIds = [],
  searchEmbedding,
  minSimilarity = 0.2,
  cursor,
}: {
  userId?: string;
  limit?: number;
  skipVectorIds?: string[];
  searchEmbedding: TextEmbedding | null;
  minSimilarity?: number;
  cursor?: SearchCursor;
}): Promise<SearchFactsResult> => {
  assertMinSimilarityRange(minSimilarity);

  const isSearch = searchEmbedding !== getFactsListAllArgs.searchEmbedding;
  const similarityType = VectorSimilarityType.COSINE;

  // Build the similarity expression for search queries
  const similarityExpression =
    isSearch && searchEmbedding
      ? getSimilarityExpression({
          type: similarityType,
          embedding: searchEmbedding.embedding,
          embeddingColumn: "ace.embedding",
        })
      : null;

  // Start building the query
  let builder = createQueryBuilder();

  // Add SELECT fields
  // TODO: can select connection fields from here to skip 1 extra call to db - but keeping short cuz of this builder pattern hack until prisma supports vectors
  builder = addSelectField(builder, "f.id");
  builder = addSelectField(builder, "f.text");
  builder = addSelectField(builder, "f.connection_id");

  if (isSearch && similarityExpression) {
    builder = addSelectField(builder, similarityExpression, "similarity");
  }

  // Add FROM and JOINs
  builder = addFrom(builder, "fact", "f");
  builder = addJoin(
    builder,
    "JOIN",
    "ai_cached_embedding",
    "f.embedding_id = ace.id",
    "ace"
  );

  // connect to connections to get user id
  builder = addJoin(
    builder,
    "JOIN",
    "connection",
    "f.connection_id = c.id",
    "c"
  );

  // Add WHERE conditions
  if (userId) {
    builder = addWhereCondition(
      builder,
      `c.user_id = $${builder.paramIndex}`,
      userId
    );
  }

  builder = addWhereCondition(
    builder,
    `$${builder.paramIndex}::embedding_feature_type = ANY(ace.feature_type)`,
    "FACT" // ensure to filter by feature to max speed of similarity search
  );

  if (skipVectorIds.length > 0) {
    const { condition, updatedBuilder } = createInCondition(
      "f.embedding_id",
      skipVectorIds,
      builder,
      true // negate = true for NOT IN
    );
    builder = {
      ...updatedBuilder,
      where: [...updatedBuilder.where, condition],
    };
  }

  if (isSearch && similarityExpression) {
    builder = addWhereCondition(
      builder,
      `${similarityExpression} >= $${builder.paramIndex}`,
      minSimilarity
    );
  }

  // Add cursor-based pagination
  if (cursor) {
    if (
      isSearch &&
      cursor.similarityValue !== undefined &&
      similarityExpression
    ) {
      builder = addWhereCondition(
        builder,
        `${similarityExpression} < $${builder.paramIndex}`,
        cursor.similarityValue
      );
    } else {
      builder = addWhereCondition(
        builder,
        `f.id < $${builder.paramIndex}`,
        cursor.id
      );
    }
  }

  // Add ORDER BY
  if (isSearch && similarityExpression) {
    builder = addOrderBy(builder, similarityExpression, "DESC");
  }
  builder = addOrderBy(builder, "f.created_at", "DESC");
  builder = addOrderBy(builder, "f.id", "DESC");

  // Set limit
  builder = setLimit(builder, limit + 1);

  // Build and execute the query
  const { query, parameters } = buildQuery(builder);

  const results = await prisma.$queryRawUnsafe<
    Array<{
      id: string;
      text: string;
      connection_id: string;
      similarity?: number;
    }>
  >(query, ...parameters);

  // Process results (same as the main implementation)
  const hasMore = results.length > limit;
  const facts = hasMore ? results.slice(0, -1) : results;

  const lastItem = facts.length > 0 ? facts[facts.length - 1] : null;
  const nextCursor =
    hasMore && lastItem
      ? {
          id: lastItem.id,
          similarityValue: lastItem.similarity,
        }
      : undefined;

  const formattedFacts = facts.map((item) => ({
    id: item.id,
    text: item.text,
    connectionId: item.connection_id,
    ...(item.similarity !== undefined && { similarity: item.similarity }),
  }));

  return {
    facts: formattedFacts as Array<
      Pick<fact, "id" | "text"> & {
        connectionId: fact["connection_id"];
        similarity?: number;
      }
    >,
    nextCursor,
  };
};
