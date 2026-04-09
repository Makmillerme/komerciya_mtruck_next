"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  fetchKmpHistory,
  removeKmpHistoryEntry,
  saveKmpHistoryEntry,
} from "@/lib/kmp-history-api";
import type { KmpHistoryEntry } from "@/lib/kmp-history-store";
import { queryKeys } from "@/lib/query-keys";

export const kmpHistoryQueryOptions = {
  queryKey: queryKeys.kmpHistory,
  queryFn: fetchKmpHistory,
  staleTime: 15 * 60_000,
  refetchOnWindowFocus: false,
} as const;

export function useKmpHistoryList() {
  return useQuery(kmpHistoryQueryOptions);
}

export function useSaveKmpHistoryEntry(options?: {
  onSaved?: (entry: Awaited<ReturnType<typeof saveKmpHistoryEntry>>) => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveKmpHistoryEntry,
    onSuccess: (entry) => {
      options?.onSaved?.(entry);
      if (entry) {
        queryClient.setQueryData<KmpHistoryEntry[]>(
          queryKeys.kmpHistory,
          (prev) => [entry, ...(prev ?? [])]
        );
      }
    },
  });
}

export function useRemoveKmpHistoryEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeKmpHistoryEntry,
    onSuccess: (_ok, id) => {
      queryClient.setQueryData<KmpHistoryEntry[]>(
        queryKeys.kmpHistory,
        (prev) => (prev ?? []).filter((e) => e.id !== id)
      );
    },
  });
}
