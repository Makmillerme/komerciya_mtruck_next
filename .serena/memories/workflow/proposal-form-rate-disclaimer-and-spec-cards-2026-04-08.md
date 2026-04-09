## Форма КП — примітка про курс і блоки характеристик

**Дата:** 2026-04-08

- **`rate_disclaimer_text`** у `lib/schema.ts`; у формі — картка «Примітка про курс у КП» під «Вартість», Textarea + кнопка «Скинути до заводських» (`getDefaultRateDisclaimerText()`).
- **`lib/rate-disclaimer.ts`:** `getDefaultRateDisclaimerText`, `parseRateDisclaimerLines` (порожній текст → заводські 3 рядки з поточною датою).
- **`format-proposal-data`:** поле `rate_disclaimer_lines` у `FormattedProposalData`; шаблон і `render-proposal-html` рендерять його замість жорстко прошитих `getRateDisclaimerLines`.
- Характеристики в формі: два картки **Основні** (модель, тип кузова, VIN, рік, пробіг, колір, виробник) та **Технічні** (колісна формула, двигун, об'єм, потужність, КПП, місця + окремо знизу **Технічний стан**).
- Додано shadcn **`components/ui/textarea.tsx`**.