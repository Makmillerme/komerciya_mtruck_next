/**
 * Заводські значення блоку «Фінансування / консультація» на стор. 2 КП (під вартістю).
 */

import type { ProposalFormData } from "./schema";

export const DEFAULT_FINANCING_BLOCK_TITLE =
  "Фінансування авто | Кредит | Лізинг";
export const DEFAULT_FINANCING_BLOCK_PHONE = "+38 050 231 13 39";
export const DEFAULT_FINANCING_BLOCK_MESSENGER = "M-Truck_finans";
export const DEFAULT_FINANCING_BLOCK_CTA =
  "Отримати консультацію - Перейди за QR-кодом →";

export function getDefaultFinancingFormValues(): Pick<
  ProposalFormData,
  | "financing_block_title"
  | "financing_block_phone"
  | "financing_block_messenger"
  | "financing_block_cta"
> {
  return {
    financing_block_title: DEFAULT_FINANCING_BLOCK_TITLE,
    financing_block_phone: DEFAULT_FINANCING_BLOCK_PHONE,
    financing_block_messenger: DEFAULT_FINANCING_BLOCK_MESSENGER,
    financing_block_cta: DEFAULT_FINANCING_BLOCK_CTA,
  };
}
