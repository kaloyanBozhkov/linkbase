import { getEmbeddings, getManyEmbeddings } from "../embeddings";
import {
  addFactsQuery,
  addFactQuery,
} from "../../queries/linkbase/ai/memory/addFacts";
import {
  type SearchCursor,
  searchFactsQuery,
  SearchFactsResult,
} from "../../queries/linkbase/ai/memory/searchFacts";
import {
  deleteFactQuery,
  deleteAllFactsQuery,
} from "../../queries/linkbase/ai/memory/deleteFact";
import { updateFactQuery } from "../../queries/linkbase/ai/memory/updateFact";
import { fact } from "@linkbase/prisma";
import { getFacts } from "@/queries/linkbase/ai/memory/getFacts";

type SearchFactsParams = {
  searchTopic?: string;
  similarity?: number;
  limit?: number;
  cursor?: SearchCursor;
};

type SearchContactsByFactParams = {
  searchTopic?: string;
  similarity?: number;
  limit?: number;
  cursor?: SearchCursor;
};

export const getConnectionMemory = ({ userId }: { userId: string }) => {
  const memory = {
    /**
     * Add multiple facts to a connection
     */
    async addFacts(connectionId: string, facts: string[]): Promise<fact[]> {
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
    async addFact(connectionId: string, factText: string): Promise<fact> {
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
    }: SearchFactsParams): Promise<SearchFactsResult> {
      try {
        if (!searchTopic) {
          // List all facts when no search topic is provided
          return { facts: [] };
        }
        // TODO expand search query

        // Search by semantic similarity
        const searchEmbedding = await getEmbeddings({ text: searchTopic });
        return searchFactsQuery({
          userId,
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
     * Search contacts by fact semantic similarity
     */
    async searchContactsByFact({
      searchTopic,
      similarity = 0.2,
      limit = 10,
      cursor,
    }: SearchFactsParams) {
      try {
        if (!searchTopic) {
          // List all facts when no search topic is provided
          return { facts: [] };
        }
        // TODO expand search query

        // Search by semantic similarity
        const searchEmbedding = await getEmbeddings({ text: searchTopic });
        return searchFactsQuery({
          userId,
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
     * Delete a specific fact
     */
    async deleteFact(connectionId: string, factId: string): Promise<void> {
      try {
        await deleteFactQuery({ factId, connectionId });
      } catch (error) {
        console.error("Failed to delete fact:", error);
        throw new Error("Failed to delete fact");
      }
    },

    async deleteFacts(connectionId: string, factIds: string[]): Promise<void> {
      for (const factId of factIds) {
        await deleteFactQuery({ factId, connectionId });
      }
    },

    /**
     * Delete all facts for a connection
     */
    async deleteAllFacts(connectionId: string): Promise<void> {
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
    async updateFact(
      connectionId: string,
      factId: string,
      newText: string
    ): Promise<fact> {
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
    async updateFacts(
      connectionId: string,
      facts: { id: string; text: string }[]
    ): Promise<fact[]> {
      const updatedFacts = [];
      for (const fact of facts) {
        const updatedFact = await this.updateFact(
          connectionId,
          fact.id,
          fact.text
        );
        updatedFacts.push(updatedFact);
      }
      return updatedFacts;
    },

    /**
     * upsert multiple facts
     */
    async upsertFacts(
      connectionId: string,
      facts: string[],
      withDelete = true
    ): Promise<fact[]> {
      if (facts.length === 0) return [];

      const fetchedFacts = await getFacts(connectionId, facts);
      const newFacts = facts.filter(
        (fact) => !fetchedFacts.some((f) => f.text === fact)
      );
      const updatedFacts = facts.filter((fact) =>
        fetchedFacts.some((f) => f.text === fact)
      );
      const deletedFacts = fetchedFacts.filter((f) => !facts.includes(f.text));

      const newlyAddedFacts = await this.addFacts(connectionId, newFacts);
      const justUpdatedFacts = await this.updateFacts(
        connectionId,
        fetchedFacts.filter((f) => updatedFacts.includes(f.text))
      );
      if (withDelete) {
        await this.deleteFacts(
          connectionId,
          deletedFacts.map((f) => f.id)
        );
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
      connectionId: string,
      factText: string,
      { similarity = 0.9 } = {}
    ): Promise<fact | null> {
      const exists = await this.factExists(factText, { similarity });
      if (exists) {
        return null;
      }
      return await this.addFact(connectionId, factText);
    },
  };

  return memory;
};
