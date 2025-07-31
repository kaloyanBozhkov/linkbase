import { z } from "zod";
import { prisma } from "@/helpers/prisma";
import { getConnectionMemory } from "@/ai/linkbase/memory";
import { SearchFactsResult } from "../ai/memory/searchFacts";
import { connection, fact } from "@linkbase/prisma";

const PAGE_SIZE = 20;

// Zod schema for search connections parameters
export const searchConnectionsSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  userId: z.string().min(1, "User ID is required"),
  cursor: z
    .object({
      lastFactId: z.string(),
      lastFactSimilarity: z.number(),
      skipConnectionIds: z.array(z.string()).optional(),
    })
    .optional(),
  pageSize: z.number().min(1).max(100).optional().default(PAGE_SIZE),
});

export type SearchConnectionsInput = z.infer<typeof searchConnectionsSchema>;

/**
 * Searches connections by name, facts, or meeting location in the database.
 *
 * @param params - Search parameters (query, user_id?, limit, offset)
 * @returns Promise<Connection[]> - Array of matching connections
 */
export const searchConnectionsQuery = async ({
  query,
  userId,
  cursor,
  pageSize,
}: SearchConnectionsInput) => {
  const memory = getConnectionMemory({ userId: userId });
  const results = await memory.searchFacts({
    searchTopic: query,
    cursor,
    limit: pageSize,
  });

  const uniqueConnectionIds = [
    ...new Set(results.facts.map((fact) => fact.connectionId)),
  ];

  const connections = await prisma.connection.findMany({
    where: {
      user_id: userId,
      id: { in: uniqueConnectionIds, notIn: cursor?.skipConnectionIds },
    },
    include: {
      facts: true,
    },
  });

  const connectionsSortedByFactSimilarity = sortConnectionsByMostSimilarFacts(
    results.facts,
    connections
  );

  return {
    connections: connectionsSortedByFactSimilarity,
    nextCursor: {
      ...results.nextCursor,
      skipConnectionIds: [
        ...(cursor?.skipConnectionIds || []),
        ...uniqueConnectionIds,
      ],
    },
  };
};

const sortConnectionsByMostSimilarFacts = (
  factsSearchResult: SearchFactsResult["facts"],
  connections: (connection & { facts: fact[] })[]
) => {
  const groupedFactsByConnectionId = factsSearchResult.reduce((acc, fact) => {
    acc[fact.connectionId] = [...(acc[fact.connectionId] || []), fact];
    return acc;
  }, {} as Record<string, SearchFactsResult["facts"]>);

  const connectionsWithFactsSortedByFactSimilarity = connections.map(
    (connection) => ({
      ...connection,
      facts: (groupedFactsByConnectionId[connection.id] || []).sort(
        (a, b) => (b.similarity ?? 0) - (a.similarity ?? 0)
      ),
    })
  );

  const sortedConnectionsByMostSimilarFacts =
    connectionsWithFactsSortedByFactSimilarity.sort(
      (a, b) => (b.facts[0]?.similarity ?? 0) - (a.facts[0]?.similarity ?? 0)
    );

  return sortedConnectionsByMostSimilarFacts;
};
