import { InfiniteData } from "@tanstack/react-query";

export const getInfiniteQueryItems = <T>(
  data?: InfiniteData<{ items: T[] }>
): T[] => {
  return data?.pages.flatMap((page) => page.items) ?? [];
};
