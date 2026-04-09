## Постачальник: одне джерело для форми та КП

**Дата:** 2026-04-08

- **`lib/proposal-supplier-defaults.ts`:** додано `resolveSupplierForProposal(data)` — ті самі правила порожнього вводу, що й для рендеру КП/PDF.
- **`format-proposal-data`** використовує лише `resolveSupplierForProposal` (без дублювання `DEFAULT_*`).
- **`mergeFormData`** у ProposalForm підставляє `supplier_*` через той самий `resolveSupplierForProposal(fd)`, тож після завантаження з історії поля форми збігаються з тим, що бачить КП.