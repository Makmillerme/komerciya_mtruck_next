## Калькулятор вартості в КП (блок Вартість)

### Вхідні поля (один рядок)
- **Валютна вартість** — число (currency_value)
- **Відсоткова база (%)** — доплюсування до валюти (percent_base)
- **Дод. послуги** — опційно (additional_services)

### Обчислення
- Валютна безготівкова = currency_value * (1 + percent_base/100) + additional_services (read-only у формі)
- Курс: /api/currency повертає usd/eur buy/sell; використовується **продаж** (sell)
- Вартість з ПДВ (грн) = валютна безготівкова * курс продажу
- ПДВ = 20% від вартості з ПДВ
- Вартість без ПДВ = вартість з ПДВ − ПДВ

### Форма
- Валюту вибирають зі списку (USD за замовчуванням, EUR)
- Три поля (з ПДВ, ПДВ, без ПДВ) — тільки для читання, заповнюються useEffect при зміні currency_value, percent_base, additional_services, currency_code або currencyRates
- Чекбокс: «Показувати валютну безготівкову вартість у шаблоні КП» (show_currency_non_cash)

### Схема (lib/schema.ts)
currency_value, percent_base, additional_services (string), currency_code (usd|eur), show_currency_non_cash (boolean), price_with_vat, price_without_vat, vat (обчислені, requiredString)

### Шаблон (ProposalTemplate)
Якщо show_currency_non_cash і є currency_non_cash — показується 4-та комірка «Вал. безгот. вартість» і підзаголовок «за курсом продажу {currency_label}». Інакше — 3 комірки (без ПДВ, ПДВ, з ПДВ).

### Історія
При завантаженні з історії mergeFormData підставляє defaultCostFields для старих записів без нових полів.