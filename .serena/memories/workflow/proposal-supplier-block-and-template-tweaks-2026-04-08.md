## КП / форма: постачальник, прибрано дубль заголовка

**Дата:** 2026-04-08

- У **ProposalTemplate** та **render-proposal-html** прибрано `<h2>` з моделлю під блакитною смугою (залишились шапка з моделлю + підзаголовок «Вантажний автомобіль…» + блоки характеристик).
- Картка «Примітка про курс»: кнопка скидання — **іконка** `RotateCcw` (`Button` size="icon"), title/aria-label «Скинути до заводських».
- **`lib/proposal-supplier-defaults.ts`**: заводські ПП, ЄДРПОУ, адреса; `parseSupplierAddressLines`.
- Схема: **supplier_company**, **supplier_edrpou**, **supplier_address** (обовʼязкові рядки).
- **format-proposal-data**: `supplier_company`, `supplier_edrpou`, `supplier_address_lines` для шаблону/PDF.
- Форма: картка **«Інформація про постачальника (у КП)»** внизу (після примітки про курс), поля + іконка скидання постачальника до заводських.