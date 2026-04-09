## КМП: лаг вводу та Maximum update depth — фінальне виправлення

**Симптом:** React «Maximum update depth exceeded», stack через `react-hook-form` `trigger` / `useForm` layout subscription.

**Зміни (2026-04-08):**
1. **`components/kmp/KMPCalculator.tsx`:** `useLayoutEffect` для гідрації чернетки — залежності **`[form]` → `[]`**.
2. **`components/kmp/KMPCalculator.tsx`:** **`defaultValues: useMemo(() => kmpFormEmptyValues(), [])`**.
3. **`components/kmp/KmpCalculatorLiveBlocks.tsx`:** прибрано **`useDeferredValue(watched)`**.
4. **`components/kmp/KmpCalculatorLiveBlocks.tsx`:** Повністю прибрано `useWatch` з панелі графіків. Замінено на `useState` + ручна підписка через `form.watch()` із затримкою `setTimeout` на 400мс. Діаграми та важкі розрахунки виконуються **лише після того, як користувач перестав вводити текст**, що повністю розблоковує основний потік для інпутів і робить набір плавним на 100%.
5. **`components/kmp/KMPCharts.tsx`:** Додано `isAnimationActive={false}` для `Pie`, `Bar` і `Line`. Дуже швидкі зміни під час набору провокували нескінченні цикли анімацій у `recharts/es6/polar/Pie.js` (`JavascriptAnimate.useEffect`).

6. **`components/kmp/KMPCalculator.tsx`:** Повністю переписано форму з **`FormField`/`Controller`** (controlled) на **`form.register()`** (uncontrolled). Інпути працюють через DOM напряму, React не робить жодних re-renders при кожному натисканні клавіші. Синхронізація пов'язаних полів (аванс % ↔ сума) через `setInputValue` на DOM refs. Прибрано `<Form>`, `<FormField>`, `<FormControl>`, `<FormMessage>` — замість них `<Label>` + `<Input {...register()}>`. Режим валідації: `mode: "onBlur"` (Zod запускається тільки при виході з поля).

**Збережено:** розділення дерева (форма та `KmpCalculatorLivePanel` сусіди) — залишається для продуктивності.
