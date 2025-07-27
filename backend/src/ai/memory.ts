import { getEmbeddings, getManyEmbeddings, TextEmbedding } from "./embeddings";
import { addFactsQuery, addFactQuery } from "../queries/ai/memory/addFacts";
import {
  searchFactsQuery,
  listAllFactsQuery,
  SearchFactsResult,
} from "../queries/ai/memory/searchFacts";
import {
  deleteFactQuery,
  deleteAllFactsQuery,
} from "../queries/ai/memory/deleteFact";
import { updateFactQuery } from "../queries/ai/memory/updateFact";
import { fact } from "@linkbase/prisma";
import { getFacts } from "@/queries/ai/memory/getFacts";

type SearchFactsParams = {
  searchTopic?: string;
  similarity?: number;
  limit?: number;
  cursor?: string;
};

export const getConnectionMemory = ({
  connectionId,
}: {
  connectionId: string;
}) => {
  const memory = {
    /**
     * Add multiple facts to a connection
     */
    async addFacts(facts: string[]): Promise<fact[]> {
      if (facts.length === 0) return [];

      try {
        const embeddings = await getManyEmbeddings({ texts: facts });
        return addFactsQuery({ connectionId, embeddings });
      } catch (error) {
        console.error("Failed to add facts:", error);
        throw new Error("Failed to add facts to connection");
      }
    },

    /**
     * Add a single fact to a connection
     */
    async addFact(factText: string): Promise<fact> {
      try {
        const embedding = await getEmbeddings({ text: factText.trim() });
        return await addFactQuery({ connectionId, embedding });
      } catch (error) {
        console.error("Failed to add fact:", error);
        throw new Error("Failed to add fact to connection");
      }
    },

    /**
     * Search facts by semantic similarity or list all facts
     */
    async searchFacts({
      searchTopic,
      similarity = 0.2,
      limit = 10,
      cursor,
    }: SearchFactsParams = {}): Promise<SearchFactsResult> {
      try {
        if (!searchTopic) {
          // List all facts when no search topic is provided
          return await listAllFactsQuery({ connectionId, limit, cursor });
        }

        // Search by semantic similarity
        const searchEmbedding = await getEmbeddings({ text: searchTopic });
        return await searchFactsQuery({
          connectionId,
          searchEmbedding,
          minSimilarity: similarity,
          limit,
          cursor,
        });
      } catch (error) {
        console.error("Failed to search facts:", error);
        return { facts: [] };
      }
    },

    /**
     * Get facts related to specific topics
     */
    async getRelatedFacts(
      topics: string[],
      { similarity = 0.2, limit = 5 } = {}
    ) {
      const results = await Promise.all(
        topics.map(async (topic) => {
          const result = await this.searchFacts({
            searchTopic: topic,
            similarity,
            limit,
          });
          return {
            topic,
            facts: result.facts,
          };
        })
      );

      return results;
    },

    /**
     * Delete a specific fact
     */
    async deleteFact(factId: string): Promise<void> {
      try {
        await deleteFactQuery({ factId, connectionId });
      } catch (error) {
        console.error("Failed to delete fact:", error);
        throw new Error("Failed to delete fact");
      }
    },

    async deleteFacts(factIds: string[]): Promise<void> {
      for (const factId of factIds) {
        await deleteFactQuery({ factId, connectionId });
      }
    },

    /**
     * Delete all facts for a connection
     */
    async deleteAllFacts(): Promise<void> {
      try {
        await deleteAllFactsQuery({ connectionId });
      } catch (error) {
        console.error("Failed to delete all facts:", error);
        throw new Error("Failed to delete all facts");
      }
    },

    /**
     * Update a fact's text (and regenerate embedding if text changes)
     */
    async updateFact(factId: string, newText: string): Promise<fact> {
      try {
        const newTextTrimmed = newText.trim();
        const embedding = await getEmbeddings({ text: newTextTrimmed });
        return await updateFactQuery({
          factId,
          connectionId,
          text: newTextTrimmed,
          embedding,
        });
      } catch (error) {
        console.error("Failed to update fact:", error);
        throw new Error("Failed to update fact");
      }
    },

    /**
     * Update multiple facts
     */
    async updateFacts(facts: { id: string; text: string }[]): Promise<fact[]> {
      const updatedFacts = [];
      for (const fact of facts) {
        const updatedFact = await this.updateFact(fact.id, fact.text);
        updatedFacts.push(updatedFact);
      }
      return updatedFacts;
    },

    /**
     * upsert multiple facts
     */
    async upsertFacts(facts: string[], withDelete = true): Promise<fact[]> {
      if (facts.length === 0) return [];

      const fetchedFacts = await getFacts(connectionId, facts);
      const newFacts = facts.filter(
        (fact) => !fetchedFacts.some((f) => f.text === fact)
      );
      const updatedFacts = facts.filter((fact) =>
        fetchedFacts.some((f) => f.text === fact)
      );
      const deletedFacts = fetchedFacts.filter((f) => !facts.includes(f.text));

      const newlyAddedFacts = await this.addFacts(newFacts);
      const justUpdatedFacts = await this.updateFacts(
        fetchedFacts.filter((f) => updatedFacts.includes(f.text))
      );
      if (withDelete) {
        await this.deleteFacts(deletedFacts.map((f) => f.id));
      }

      return [...newlyAddedFacts, ...justUpdatedFacts];
    },

    /**
     * Find facts similar to a given fact (useful for deduplication)
     */
    async findSimilarFacts(
      factText: string,
      { similarity = 0.9, limit = 5 } = {}
    ) {
      return await this.searchFacts({
        searchTopic: factText,
        similarity,
        limit,
      });
    },

    /**
     * Check if a fact already exists (high similarity threshold)
     */
    async factExists(
      factText: string,
      { similarity = 0.95 } = {}
    ): Promise<boolean> {
      const result = await this.findSimilarFacts(factText, {
        similarity,
        limit: 1,
      });
      return result.facts.length > 0;
    },

    /**
     * Add fact only if it doesn't already exist
     */
    async addFactIfNew(
      factText: string,
      { similarity = 0.9 } = {}
    ): Promise<fact | null> {
      const exists = await this.factExists(factText, { similarity });
      if (exists) {
        return null;
      }
      return await this.addFact(factText);
    },
  };

  return memory;
};
