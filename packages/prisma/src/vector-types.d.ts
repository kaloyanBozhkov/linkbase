// Global type augmentation for Prisma vector fields
// This file adds embedding: number[] to models that have vector fields

import type { ai_cached_embedding as PrismaAiCachedEmbedding } from "../client/client";

export interface ai_cached_embedding
  extends Omit<PrismaAiCachedEmbedding, "embedding"> {
  embedding: number[];
}

// Re-export everything else from Prisma client
export * from "../client/client";
