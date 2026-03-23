## PDF Generation — HTML-to-PDF (2025-03)

**Підхід:** Playwright `page.pdf()` на /proposal-print — нативний print engine браузера. Векторний текст, коректний CSS, як перенесення HTML в PDF.

**Потік:**
1. Збереження даних у файл (.proposal-print-temp)
2. Навігація на /proposal-print?id=xxx
3. page.pdf({ format: A4, printBackground: true })
4. Повернення base64 PDF

**Зміни:**
- ProposalTemplate: page-break-before на другій сторінці (printMode)
- proposal-print/layout: @media print для білого фону
- api/generate: page.pdf() замість screenshot + pdf-lib

**Видалено:** pdf-lib, скріншоти, deviceScaleFactor