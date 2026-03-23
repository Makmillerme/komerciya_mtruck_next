# Очищення PDF-генерації та консолідація (2025-03-17)

## Видалено (застаріла логіка Playwright)
- `lib/proposal-print-store.ts` — файлове сховище для /proposal-print (більше не використовується)
- `app/proposal-print/page.tsx`, `app/proposal-print/layout.tsx` — маршрут /proposal-print
- Залежності: `playwright`, `pdf-lib`

## Оновлено
- `components/ConditionalLayout.tsx` — прибрано гілку `isPrintPage` (usePathname більше не потрібен)
- `lib/proposal-specs.ts` — єдине джерело для списків характеристик (MAIN_SPEC_KEYS, TECH_SPEC_KEYS, getMainSpecItems, getTechSpecItems)
- `components/templates/ProposalTemplate.tsx` — використовує getMainSpecItems, getTechSpecItems
- `lib/ProposalPDFDocument.tsx` — використовує getMainSpecItems, getTechSpecItems; зменшено розмір фото (270x200) для запобігання overflow

## Поточний потік PDF
1. ProposalForm → POST /api/generate (FormData)
2. API викликає renderToBuffer(ProposalPDFDocument) з @react-pdf/renderer
3. Повертає base64 PDF (2 сторінки A4, векторний текст)
