## Постачальник: структурована адреса + контакти (умовний показ)

**Дата:** 2026-04-08

- **Схема:** замість `supplier_address` — `supplier_postal_code`, `supplier_region`, `supplier_city`, `supplier_street` (усі `z.string()`, не обовʼязкові окремо); `supplier_phone_primary`, `supplier_phone_secondary` (до 2 номерів, max 32 символи).
- **`lib/proposal-supplier-defaults.ts`:** `composeSupplierAddressLinesFromParts`, `migrateLegacySupplierAddress`, `mergeSupplierFormFieldsForHistory`, `resolveSupplierForProposal` повертає `supplier_show_address`, `supplier_show_contact`, `supplier_contact_phones`.
- **КП:** колонка з адресою лише якщо є хоч один непорожній рядок після збирання; блок «Контактна інформація» лише якщо є хоча б один телефон.
- **Форма:** окремі інпути + підказка; історія зі старим `supplier_address` мігрує при завантаженні.
- **`data/proposal-history.json`:** оновлено під нові ключі.