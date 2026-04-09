## План КМП/рефакторинг — виконано (2026-04-08)

**Фаза 0:** Прибрано footer `HistoryActionBar` у `KmpHistoryToolbar`; скорочено підказки в `KmpImportFromProposalCard` та «Параметри угоди»; `clampPercent0to100` + обмеження суми авансу ≤ ціна ТЗ; вкладку «Рахунки» прибрано з `Sidebar`/`AppHeader`; `app/invoices/page.tsx` → `redirect("/")` для старих URL.

**Фаза 1:** `KmpCalculatorLiveLayout` — один `useWatch` для тулбару + графіків; `KmpDraftAutosave` через `form.subscribe({ formState: { values: true }})` + дебаунс; React Query: `staleTime` 15 хв + `refetchOnWindowFocus: false` для історій; `setQueryData` після save/delete замість invalidate для КМП.

**Фаза 2–3:** `hooks/use-kmp-history.ts`, `use-proposal-history.ts`, `use-proposal-cost-fields.ts`; `ProposalForm` без окремих `form.watch`, без дубль сортування історії.

**Фаза 4:** `.gitignore` — `data/kmp-history.json`. E2E не додано (немає playwright.config).

**Перевірка:** `npx tsc --noEmit`, `npm run lint`.