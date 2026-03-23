## PDF Generation Fix (2025-03-17)

**Проблема:** Згенерований PDF не відповідав шаблону — 3 сторінки замість 2, стилі не застосовувались (Tailwind CDN не працював при file://).

**Зміни:**
1. **lib/render-proposal-html.ts** — Tailwind CDN замінено на статичний CSS блок `pdfStyles` з усіма потрібними utility-класами. Додано inline styles для specRow, photoCell, photoBox. Додано CSS для arbitrary values: text-[11px], text-[13px], border-[#e5e7eb], bg-white/10, w-[110px] тощо.
2. **app/api/generate/route.ts** — margins зменшено з 0.5in до 10mm; waitForTimeout зменшено з 2000ms до 800ms.
3. **Print CSS** — @page size A4, @media print з page-break-before: always для другої сторінки.

**Структура PDF:** Сторінка 1 — header, модель, 2 блоки характеристик, фото 1–4. Сторінка 2 — фото 5–8, вартість, фінансування+QR, постачальник, футер.