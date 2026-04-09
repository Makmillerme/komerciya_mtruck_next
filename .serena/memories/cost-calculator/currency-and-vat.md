## Cost block (2026 update)

- **cost_mode**: `calculator` | `manual` (schema + form).
- **Шаблон 1**: калькулятор — валютна вартість, % база, дод. послуги, валюта; автоматичні грн поля.
- **Шаблон 2**: вручну — перший слот: `currency_non_cash_manual` (ціле), наступні два слоти — disabled placeholders для збереження ширини; валюта + ПДВ блок редаговані.
- **Валютна безготівкова**: калькулятор = `Math.round(cv*(1+pct/100)+addSvc)`; без копійок у UI та PDF.
- **Грн (калькулятор)**: `priceWithVatInt = Math.round(roundedNonCash * rate)`; `vat = priceWithVatInt * 0.2`; `without = priceWithVatInt - vat` без додаткового round. У PDF «з ПДВ» як `X,00 грн`.
- **Ручний шаблон**: три суми в грн вводяться користувачем; з ПДВ форматується через звичайний `formatNumberWithSpaces`.
- Валідація manual: `currency_non_cash_manual` > 0.

Git: commit a8bc28f on main.
