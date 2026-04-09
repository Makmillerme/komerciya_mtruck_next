## Lazy + cache + КМП JSON історія

- **Dynamic:** [`app/page.tsx`](app/page.tsx) — `dynamic()` для `ProposalForm` + Skeleton. [`app/kmp/page.tsx`](app/kmp/page.tsx) — dynamic для `KMPCalculator`.
- **Charts:** [`components/kmp/KMPCharts.tsx`](components/kmp/KMPCharts.tsx) — `KmpPieStructureCard`, `KmpBarLineChartGrid` (recharts). У [`KMPCalculator`](components/kmp/KMPCalculator.tsx) підвантажуються через `next/dynamic` + Skeleton.
- **TanStack Query:** [`components/providers/query-provider.tsx`](components/providers/query-provider.tsx) у [`app/layout.tsx`](app/layout.tsx). Ключі [`lib/query-keys.ts`](lib/query-keys.ts): `proposalHistory`, `currency`, `kmpHistory`. KMPCalculator: query + мутації save/delete kmp history + інвалідація.
- **ProposalForm:** історія та курси через `useQuery`; `reloadHistory` → `invalidateQueries(proposalHistory)`.
- **Чернетка КМП:** [`lib/kmp-draft.ts`](lib/kmp-draft.ts) ключ `kmp-draft-v1`, `useLayoutEffect` restore + debounced 400ms `writeKmpDraft` (values + historyPick + vatGrossInput).
- **JSON store КМП:** [`data/kmp-history.json`](data/kmp-history.json), [`lib/kmp-history-store.ts`](lib/kmp-history-store.ts) (MAX 80), API [`app/api/kmp-history/route.ts`](app/api/kmp-history/route.ts) GET/POST/DELETE, клієнт [`lib/kmp-history-api.ts`](lib/kmp-history-api.ts). Зв’язок КП: поле `sourceProposalHistoryId` у записі.
- **Схема форми КМП:** винесено в [`lib/kmp-form.ts`](lib/kmp-form.ts) для валідації POST.
- **Допомога:** [`lib/currency-api.ts`](lib/currency-api.ts) — `parseCurrencyApiPayload` (KMPCalculator).

Збірка та lint: OK (можливі попередження exhaustive-deps у ProposalForm для гідратації історії).