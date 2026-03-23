## PDF Generation — Screenshot-based (2025-03-17)

**Підхід:** Скріншоти React-шаблону через Playwright, збірка PDF через pdf-lib. WYSIWYG — що в превʼю, те й в PDF.

**Потік:**
1. POST /api/generate зберігає formData + imageDataUrls у lib/proposal-print-store (TTL 1 хв)
2. Playwright відкриває /proposal-print?id=xxx
3. Скріншоти [data-page="1"] та [data-page="2"]
4. pdf-lib: embedPng + drawImage на A4 сторінках
5. Повертає base64 PDF

**Файли:** proposal-print-store, proposal-print/page, api/generate, document-preview (data-page), ProposalTemplate (printMode).

**Важливо:** Сервер має бути запущений. baseUrl з request.url або NEXT_PUBLIC_APP_URL.