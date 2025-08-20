import { createTRPCReact, httpBatchLink } from "@trpc/react-query";
import type { AppRouter } from "@linkbase/backend/src/trpc/routers/index";
import { API_CONFIG } from "../config/api.config";
import { useSessionUserStore } from "@/hooks/useGetSessionUser";
import superjson from "superjson";

// @ts-ignore
export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      transformer: superjson,
      url: `${API_CONFIG.BASE_URL}/trpc`,
      async headers() {
        const { userId } = useSessionUserStore.getState();
        return {
          "x-user-id": userId || "",
          "x-app-name": "linkbase",
        };
      },
    }),
  ],
});

/**
 * Updates the infinite query cache after a successful deletion
 * @param utils - TRPC utils from useUtils()
 * @param queryKey - The path to the infinite query (e.g. ['linkbase', 'connections', 'getAll'])
 * @param deletedId - The ID of the deleted item
 */
export const updateInfiniteQueryDataOnDelete = (
  utils: ReturnType<typeof trpc.useUtils>,
  queryKey: string[],
  deletedId: string
) => {
  const queryUtils = queryKey.reduce((obj, key) => (obj as any)[key], utils) as any;
  queryUtils.setInfiniteData({ cursor: 0 }, (oldData: any) => {
    if (!oldData) return oldData;
    return {
      ...oldData,
      pages: oldData.pages.map((page: any) => ({
        ...page,
        items: page.items.filter(
          (item: { id: string }) => item.id !== deletedId
        ),
      })),
    };
  });
};

/**
 * Updates an item in the infinite query cache
 * @param utils - TRPC utils from useUtils()
 * @param queryKey - The path to the infinite query (e.g. ['linkbase', 'connections', 'getAll'])
 * @param itemId - The ID of the item to update
 * @param updatedItem - The updated item data
 */
export const updateInfiniteQueryDataOnEdit = <T extends { id: string }>(
  utils: ReturnType<typeof trpc.useUtils>,
  queryKey: string[],
  itemId: string,
  updatedItem: T
) => {
  // Get the query utils by path
  const queryUtils = queryKey.reduce((obj, key) => (obj as any)[key], utils) as any;

  // Update the infinite query data
  queryUtils.setInfiniteData({ cursor: 0 }, (oldData: any) => {
    if (!oldData) return oldData;
    return {
      ...oldData,
      pages: oldData.pages.map((page: any) => ({
        ...page,
        items: page.items.map((item: T) =>
          item.id === itemId ? updatedItem : item
        ),
      })),
    };
  });
};

/**
 * Adds an item to the infinite query cache
 * @param utils - TRPC utils from useUtils()
 * @param queryKey - The path to the infinite query (e.g. ['linkbase', 'connections', 'getAll'])
 * @param newItem - The item to add
 * @param options - Optional settings for how to add the item
 */
export const updateInfiniteQueryDataOnAdd = <T extends { id: string }>(
  utils: ReturnType<typeof trpc.useUtils>,
  queryKey: string[],
  newItem: T,
  options: { prepend?: boolean } = { prepend: true }
) => {
  const queryUtils = queryKey.reduce((obj, key) => (obj as any)[key], utils) as any;

  queryUtils.setInfiniteData({ cursor: 0 }, (oldData: any) => {
    if (!oldData) return oldData;
    return {
      ...oldData,
      pages: oldData.pages.map((page: any, idx: number) => ({
        ...page,
        items: idx === 0
          ? options.prepend
            ? [newItem, ...page.items]
            : [...page.items, newItem]
          : page.items,
      })),
    };
  });
};
