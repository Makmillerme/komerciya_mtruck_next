## КМП: лаг введення та «залипання» 0 у числових полях

**Дата:** 2026-04-08

**Причини:**
1. `form.watch()` у корені `KMPCalculator` — будь-яка зміна поля ре-рендерила всю форму + графіки.
2. Поля з `value={finiteNum(field.value)}` показували 0 замість порожнього рядка після очищення.

**Зміни:**
- Новий модуль `components/kmp/KmpCalculatorLiveBlocks.tsx`: `KmpDraftAutosave`, `KmpHistoryToolbarBlock`, `KmpDealResultsBlock` — кожен використовує `useWatch` у своєму дереві; форма в батьківському `KMPCalculator` без глобального `watch()`, тому при введенні перераховуються лише тулбар/ліва колонка результатів, а не всі `FormField`.
- `numericInputDisplay(v, int|float)`: для 0 — порожній рядок у value; onChange обробляє `t === ""` → `field.onChange(0)`.
- Вартість ТЗ: при price ≤ 0 скидаються суми авансу та залишку в 0.
- Дубль графіків з основного файлу прибрано; dynamic-імпорти перенесені в LiveBlocks.

**Перевірка:** `npx tsc --noEmit` OK.