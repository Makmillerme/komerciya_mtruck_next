## КМП: чекбокс «Відображати ПДВ (20%) у структурі виплат»

**Дата:** 2026-04-08

**Проблема:** діаграма/структура виплат не реагували на перемикання, бо `useMemo(..., [watched])` не бачив зміни — `form.watch()` повертає стабільне посилання.

**Виправлення в `components/kmp/KMPCalculator.tsx`:**
- `pieData` і `currentKmpFingerprint`: залежності явно перелічені по полях `watched.*` + `loanParsed` (і `historyPick` де треба).
- `KmpPieStructureCard`: `key` `pie-vat-on` / `pie-vat-off` за `showVatBreakdown` для перемальовки Recharts.
- Чекбокс: `ref`/`name`/`onBlur` на input; `checked={field.value !== false}` щоб узгодити з `z.boolean().default(true)` у `lib/kmp-form.ts` (undefined трактується як увімкнено).

**Перевірка:** `npx tsc --noEmit` — OK.