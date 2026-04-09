## Форма КП: колісна формула, тип двигуна, КПП — Select + Zod enum

**Дата:** 2026-04-08

- **`lib/proposal-select-options.ts`:** константи `WHEEL_FORMULA_OPTIONS` (4x2…10x8, зокрема 6x2/4), `ENGINE_TYPE_OPTIONS` (Дизель, Бензин, Газ CNG/LPG, Гібрид, Електро), `GEARBOX_OPTIONS` (механіка, автомат, AMT, преселективна, гідромеханіка, двоступенева); хелпери `coerceWheelFormula`, `coerceEngineTypeOption`, `coerceGearboxOption` для історії.
- **`lib/schema.ts`:** ці три поля як `z.enum` замість довільного рядка.
- **`ProposalForm`:** shadcn `Select` замість `Input`; дефолти — перший пункт кожного списку; `mergeFormData` приводить старі значення через coerce.