// Export the prisma instance
export { prisma } from "./prisma";

// Export all types from the generated client
export * from "../client/client";

// Export vector-enabled types that include embedding fields
export type { ai_cached_embedding } from "./vector-types";
