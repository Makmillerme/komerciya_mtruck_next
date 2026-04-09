## КП (ProposalTemplate + PDF HTML): характеристики стор. 1

**Дата:** 2026-04-08

**Зміни:**
- У шапці (`<header>`) під "КОМЕРЦІЙНА ПРОПОЗИЦІЯ" показується `data.model` замість тексту "Автомобільний транспорт" (і в `render-proposal-html.ts` аналогічно).
- `lib/proposal-specs.ts`: `MAIN_SPEC_KEYS` — без `model` і `technical_state`; перший пункт — `body_type` (Тип кузова). `TECH_SPEC_KEYS` — без `body_type`.
- Технічний стан: не в основній колонці SpecList; окремий повноширинний блок під двоколонковою сіткою (основні | технічні) у `ProposalTemplate.tsx` і в `render-proposal-html.ts` (`technicalStateFullRow`).

**Файли:** `lib/proposal-specs.ts`, `components/templates/ProposalTemplate.tsx`, `lib/render-proposal-html.ts`.