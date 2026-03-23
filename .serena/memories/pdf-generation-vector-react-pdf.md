# PDF генерація: векторний PDF через @react-pdf/renderer

**Дата:** 2025-03-17

## Рішення

Замість Playwright + скріншотів + pdf-lib (растровий текст) використовується **@react-pdf/renderer** для генерації PDF з векторним текстом.

## Файли

| Файл | Призначення |
|------|-------------|
| `lib/ProposalPDFDocument.tsx` | React-компонент для PDF (Document, Page, View, Text, Image) |
| `app/api/generate/route.tsx` | API: `renderToBuffer(<ProposalPDFDocument />)` → base64 |
| `next.config.ts` | `serverExternalPackages: ["@react-pdf/renderer"]` |

## Конвертація WebP

- react-pdf не підтримує WebP. QR-код `qrcode.webp` конвертується в PNG через sharp перед передачею в Image.
- `getProposalPDFPaths()` — async, повертає `qrPath` як data URL для webp.

## Макет

- Структура повторює ProposalTemplate.tsx (2 сторінки A4).
- Сторінка 1: header, модель, 2 блоки характеристик, 4 фото.
- Сторінка 2: 4 фото, вартість, фінансування + QR, постачальник, footer з logo.
- Шрифт: Helvetica (за замовчуванням).

## Видалено (2025-03-17)
- lib/proposal-print-store, app/proposal-print/* — застаріла логіка Playwright
- playwright, pdf-lib

## Залежності

- @react-pdf/renderer
- sharp (для webp → png)
