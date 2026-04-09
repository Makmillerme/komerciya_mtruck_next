## KMP UX alignment + refactor (2026-04-08)

- **Toolbar order:** `KMPCalculator` now renders `KmpHistoryToolbar` (KMP history quick-fill + drawer + save) **before** `KmpImportFromProposalCard`, matching `ProposalForm` pattern (history bar above cards).
- **Shared bar:** `components/history/HistoryActionBar.tsx` — `mb-4`, `gap-3`, `leading` / `trailing` / `footer`. Used by `KmpHistoryToolbar` and `ProposalForm`.
- **Split components:** `components/kmp/KmpHistoryToolbar.tsx`, `KmpHistoryDrawer.tsx`, `KmpImportFromProposalCard.tsx`. Proposal import card owns local search state + `filteredHistory` UX (keep selected row visible when filtered).
- **Labels/helpers:** `lib/kmp-history-labels.ts` — `KMP_MODE_LABELS_LONG`, `formatKmpHistoryDate`, `kmpSavedEntryLabel`, `filterKmpHistoryBySearch`. `KMPCalculator` uses these; removed duplicate KMP history formatters. Mode select uses `KMP_MODE_LABELS_LONG`.
- **Constants:** `lib/kmp-history-constants.ts` — `KMP_PROPOSAL_HISTORY_NONE` (`__none__`).
- **Visual:** Toolbar / proposal history buttons use `h-9` where useful to align with default control height; import card `SelectTrigger` has `h-9`.
- **Copy:** Footer hint references «блоці імпорту» (toolbar is above import card).

**Verify:** `npm run build` and `npm run lint` succeed (existing warnings only).