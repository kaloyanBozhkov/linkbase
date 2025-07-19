import React, { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpcClient, trpc } from "../utils/trpc";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Prevent refetching immediately on the client
      staleTime: 60 * 1000, // 1 minute
      // Avoid showing loading states for cached data
      refetchOnWindowFocus: false,
      // Retry failed requests
      retry: 2,
    },
  },
});

interface TRPCProviderProps {
  children: ReactNode;
}

export function TRPCProvider({ children }: TRPCProviderProps) {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
