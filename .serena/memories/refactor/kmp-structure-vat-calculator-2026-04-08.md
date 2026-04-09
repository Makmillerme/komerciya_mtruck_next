## KMP UI: структура виплат + ПДВ блок (2026-04-08)

- **Структура виплат** (`KmpPieStructureCard`): підписи сум і разом використовують `formatUah2` (2 знаки після коми), а не `formatUah` з `maximumFractionDigits: 0`, щоб не показувати заокруглення до цілих грн. Tooltip на pie теж через той самий форматер.
- **Зворотний калькулятор ПДВ** повністю прибрано з `KMPCalculator` (картка, стан, `vatSplit`).
- **Чернетка:** `lib/kmp-draft.ts` — `KmpDraftV1` без `vatGrossInput`; збереження лише `values` + `historyPick`. Старі записи в localStorage з зайвим полем ігноруються при читанні.
