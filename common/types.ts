/**
 * Centralized Types for Linkbase
 *
 * This file contains all shared types used across the Linkbase application.
 * Types are generated from Prisma schema and re-exported here for consistency.
 *
 * Usage:
 * - Backend: import { User, Connection } from "@common/types";
 * - Frontend: import { User, Connection } from "@/common/types";
 *
 * To update types: run `pnpm run db:generate` from root or backend directory
 */

// Import Prisma types from the generated shared client
import type { User, Connection, SocialMedia } from "./prisma";
import { SocialMediaType } from "./prisma";

// Re-export Prisma types for all apps to use
export type { User, Connection, SocialMedia } from "./prisma";

// Re-export enum as value for runtime use
export { SocialMediaType } from "./prisma";

// Additional API-specific types that aren't in Prisma
export interface CreateConnectionInput {
  name: string;
  metAt: string;
  facts?: string[];
  socialMedias?: Array<{
    type: SocialMediaType;
    handle: string;
  }>;
}

export interface UpdateConnectionInput extends Partial<CreateConnectionInput> {
  id: string;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface PaginationResult {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface ConnectionsResponse {
  connections: Connection[];
  pagination: PaginationResult;
}

export interface SearchConnectionsParams extends PaginationParams {
  query: string;
}

export interface SearchConnectionsResponse {
  connections: Connection[];
  query: string;
}

// Connection with relationships (for API responses)
export interface ConnectionWithRelations extends Connection {
  socialMedias: SocialMedia[];
}
