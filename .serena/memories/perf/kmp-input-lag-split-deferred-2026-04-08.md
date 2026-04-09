## КМП: прибрано лаг вводу (план split + defer + single parse)

**Дата:** 2026-04-08

**Зміни:**
- `components/kmp/KmpCalculatorLiveBlocks.tsx`: `KmpCalculatorLiveLayout` замінено на **`KmpCalculatorLivePanel`** без `children`. Підписка `useWatch` + **`useDeferredValue`** — один `safeParse` + `buildLoanFromParsed` у `useMemo` від `deferredWatched`; pie/fingerprint використовують той самий `parsed`, без повторних safeParse в JSX. Кнопка збереження: **`form.getValues()`** + parse + `buildLoanFromParsed`, з перевіркою `if (!loanNow) return`.
- `components/kmp/KMPCalculator.tsx`: сітка **`xl:grid-cols-2`** — зліва лише `<Form>`, справа `<KmpCalculatorLivePanel />` (сиблінги, не батько інпутів).

**Ефект:** інпути не в піддереві компонента з важкими ре-рендерами; графіки/таблиця відстають від вводу через deferred — основний потік легший під час друку.
