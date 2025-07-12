import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../../../backend/src/trpc/routers";
import { API_CONFIG } from "../config/api.config";
import { useSessionUserStore } from "../hooks/useGetSessionUser";

// Create tRPC React hooks
export const trpc = createTRPCReact<AppRouter>();

// Create tRPC client
export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${API_CONFIG.BASE_URL}/trpc`,
      // Pass headers including user ID
      async headers() {
        const { userId } = useSessionUserStore.getState();
        return {
          "x-user-id": userId || "",
        };
      },
    }),
  ],
});

// Re-export for convenience
export type { AppRouter } from "../../../backend/src/trpc/routers";

// Import shared types from common folder
export * from "@/common/types";
