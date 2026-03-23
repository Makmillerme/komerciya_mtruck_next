# PDF: виправлення 4 сторінок та layout (2025-03-17)

## Проблеми
- 4 сторінки замість 2 (overflow)
- Emoji (💰📞✉🏢📍) відображалися як mojibake — Roboto не підтримує emoji
- Ціни в колонках переносились вертикально
- Занадто великі відступи

## Рішення

### Компактний layout
- header: paddingVertical 18→12, fontSize 22→18
- content: padding 12→10, 8→6
- modelSection: padding 12→8, marginBottom 12→8
- specBox: padding 12→8, specRow paddingVertical 4→2, fontSize 9→8
- photoCell: 270x200 → 268x168
- priceSection: padding 20→12, minHeight прибрано
- priceCell: minWidth: 0, padding 16→8, fontSize 10→9
- financeBox, supplierSection, footer: зменшено padding/margin

### Заміна emoji
- 📷 → "Ф" (фото)
- ⚙⚡ → "i" (інфо)
- 💰 → прибрано
- 📞✉ → "Тел:", "Telegram:"
- 🏢 → "ПП"
- 📍 → "Адр"

### Price column
- minWidth: 0 для flex
- textAlign: "center"
- paddingHorizontal 16→8
