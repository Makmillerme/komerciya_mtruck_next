## Історія КП без invalidateQueries

**Дата:** 2026-04-08

**Зміни:**
- `hooks/use-proposal-history.ts`: додано `useSaveProposalHistoryEntry` та `useRemoveProposalHistoryEntry` (TanStack `useMutation`). Після успішного POST новий запис додається на початок кешу через `setQueryData`; довжина обмежена `PROPOSAL_HISTORY_CACHE_MAX = 50` (як `MAX_ENTRIES` у `lib/proposal-history-store`). Після успішного DELETE запис прибирається з кешу за `id`.
- `components/ProposalForm.tsx`: прибрано `reloadHistory` / `invalidateQueries(proposalHistory)` та прямі імпорти `save`/`remove` з lib; використовуються нові хуки.

**Чому:** узгоджено з КМП — миттєве оновлення UI без зайвого refetch.
