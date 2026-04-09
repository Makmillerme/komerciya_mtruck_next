"use client";



import {

  useMutation,

  useQuery,

  useQueryClient,

} from "@tanstack/react-query";



import {

  fetchProposalHistory,

  removeProposalHistoryEntry,

  saveProposalHistoryEntry,

  type ProposalHistoryEntry,

} from "@/lib/proposal-history";

import { queryKeys } from "@/lib/query-keys";



/** Збігається з MAX_ENTRIES у lib/proposal-history-store. */

const PROPOSAL_HISTORY_CACHE_MAX = 50;



export const proposalHistoryQueryOptions = {

  queryKey: queryKeys.proposalHistory,

  queryFn: async (): Promise<ProposalHistoryEntry[]> => {

    const rows = await fetchProposalHistory();

    return [...rows].sort(

      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()

    );

  },

  staleTime: 15 * 60_000,

  refetchOnWindowFocus: false,

} as const;



export function useProposalHistoryList() {

  return useQuery(proposalHistoryQueryOptions);

}



export function useSaveProposalHistoryEntry(options?: {

  onSaved?: (

    entry: NonNullable<Awaited<ReturnType<typeof saveProposalHistoryEntry>>>

  ) => void;

}) {

  const queryClient = useQueryClient();

  return useMutation({

    mutationFn: saveProposalHistoryEntry,

    onSuccess: (entry) => {

      if (entry) {

        options?.onSaved?.(entry);

        queryClient.setQueryData<ProposalHistoryEntry[]>(

          queryKeys.proposalHistory,

          (prev) =>

            [entry, ...(prev ?? [])].slice(0, PROPOSAL_HISTORY_CACHE_MAX)

        );

      }

    },

  });

}



export function useRemoveProposalHistoryEntry() {

  const queryClient = useQueryClient();

  return useMutation({

    mutationFn: removeProposalHistoryEntry,

    onSuccess: (ok, id) => {

      if (!ok) return;

      queryClient.setQueryData<ProposalHistoryEntry[]>(

        queryKeys.proposalHistory,

        (prev) => (prev ?? []).filter((e) => e.id !== id)

      );

    },

  });

}

