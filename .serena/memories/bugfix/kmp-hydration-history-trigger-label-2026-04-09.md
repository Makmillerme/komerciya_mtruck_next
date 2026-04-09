## Hydration mismatch: KMP history select label

**Cause:** `useState` initializer called `readKmpDraft()` — on SSR `typeof window === "undefined"` so `historyPick` stayed `KMP_PROPOSAL_HISTORY_NONE` and label "Оберіть КП з історії"; on client, initializer read localStorage and set UUID before `history` loaded, so `historyTriggerLabel` fell through to raw `historyPick` (UUID) → server/client text mismatch.

**Fix:** Initialize `historyPick` always with `KMP_PROPOSAL_HISTORY_NONE`; restore `d.historyPick` in the existing mount-only `useLayoutEffect` alongside form reset from draft. `historyTriggerLabel` when pick is set but entry missing: "Завантаження…" until `useProposalHistoryList().isFetched`, then "Запис у історії КП не знайдено".

**File:** `components/kmp/KMPCalculator.tsx`.
