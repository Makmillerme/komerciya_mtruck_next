# Генерація PDF: Playwright HTML→PDF (оптимальний підхід)

## Ідея

**Один джерело правди:** PDF генерується з тієї самої HTML-сторінки (шаблону), що й прев'ю. Не окрема бібліотека (react-pdf), а нативний print Chromium через Playwright. Що бачить користувач у прев'ю — те саме потрапляє в PDF (шрифти, іконки SVG, верстка).

## Архітектура

1. **Сторінка друку:** `/proposal-print?id=<uuid>`
   - Рендерить `ProposalTemplate` з даними з тимчасового store.
   - Layout: `app/proposal-print/layout.tsx` — підключає Noto Sans (latin, cyrillic, latin-ext, cyrillic-ext), print CSS.
   - Контент обгорнутий у `[data-print-root]`; кожна сторінка документа — `[data-page="1"]`, `[data-page="2"]` тощо.

2. **Тимчасове сховище:** `lib/proposal-print-store.ts`
   - Зберігає `{ formData, imageDataUrls }` у `.proposal-print-temp/<id>.json`.
   - TTL не автоматичний — дані видаляються після успішної генерації PDF в API.
   - ID — UUID без дефісів (safeId перевіряє алфавітно-цифровий рядок).

3. **API:** `POST /api/generate`
   - Приймає FormData (поля форми + файли `photos`).
   - Конвертує фото в base64 data URLs (до 8 штук), зберігає в store, отримує `id`.
   - Визначає `baseUrl` (NEXT_PUBLIC_APP_URL або origin запиту або fallback 127.0.0.1:3000).
   - Запускає Playwright `chromium.launch({ headless: true })`, відкриває `baseUrl/proposal-print?id=<id>` з `waitUntil: "networkidle"`.
   - Перевіряє відсутність тексту "Дані не знайдено"; якщо є — закриває браузер, видаляє дані, повертає помилку.
   - Чекає селектор `[data-page="1"]` (state: attached).
   - Викликає `page.pdf({ format: "A4", printBackground: true, margin: 0 })`.
   - Закриває браузер, видаляє дані з store, повертає JSON: `{ success, file, pdf_base64, message }`.

## Print CSS (у layout)

```css
@media print {
  @page { size: A4; margin: 0; }
  body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  [data-print-root] { background: white !important; padding: 0 !important; gap: 0 !important; }
  [data-page] { page-break-after: always; box-shadow: none !important; border-radius: 0 !important; }
  [data-page]:last-child { page-break-after: auto; }
}
```

- Розриви сторінок: кожен блок з `[data-page]` — нова сторінка PDF, крім останнього.
- Фони та кольори зберігаються за рахунок `print-color-adjust: exact`.

## Ключові файли

| Файл | Призначення |
|------|-------------|
| `app/api/generate/route.ts` | POST: FormData → store → Playwright → PDF base64 |
| `app/proposal-print/page.tsx` | Server component: id з query → getProposalPrintData → formatProposalData → ProposalTemplate (printMode) |
| `app/proposal-print/layout.tsx` | Noto Sans, print CSS, обгортка для шрифтів |
| `lib/proposal-print-store.ts` | setProposalPrintData, getProposalPrintData, deleteProposalPrintData (файлова система) |
| `components/templates/ProposalTemplate.tsx` | Єдиний шаблон для прев'ю та PDF; приймає `printMode` |

## Залежності

- `playwright` — для `chromium.launch()` та `page.pdf()`.
- `next.config`: `serverExternalPackages: ["playwright"]`.

## Чому це оптимально

- Один макет: зміни в ProposalTemplate одразу відображаються і в прев'ю, і в PDF.
- Векторний текст і SVG-іконки (Lucide), коректні шрифти (Noto Sans з кирилицею/латиницею).
- Не потрібно дублювати верстку в react-pdf або іншому рендерері.
- Розбивка на сторінки керується CSS (page-break-after), передбачувано.
