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

/** Посилання для генерації QR за замовчуванням (канал Telegram). Порожнє поле — статичний QR з `public/img/qr/`. */
export const DEFAULT_FINANCING_BLOCK_QR_URL = "https://t.me/mtruck_sales";

export function getDefaultFinancingFormValues(): Pick<
  ProposalFormData,
  | "financing_block_title"
  | "financing_block_phone"
  | "financing_block_messenger"
  | "financing_block_cta"
  | "financing_block_qr_url"
> {
  return {
    financing_block_title: DEFAULT_FINANCING_BLOCK_TITLE,
    financing_block_phone: DEFAULT_FINANCING_BLOCK_PHONE,
    financing_block_messenger: DEFAULT_FINANCING_BLOCK_MESSENGER,
    financing_block_cta: DEFAULT_FINANCING_BLOCK_CTA,
    financing_block_qr_url: DEFAULT_FINANCING_BLOCK_QR_URL,
  };
}
