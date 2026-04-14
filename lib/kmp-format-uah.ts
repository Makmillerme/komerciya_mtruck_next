/**
 * Формат суми в гривнях для КМП без `Intl` style "currency".
 * Інакше Node (SSR) і браузер можуть дати різний текст (наприклад `0,00 ₴` vs `0,00 грн`) — гідратаційна помилка React.
 */
export function formatKmpUah0(n: number): string {
  return `${new Intl.NumberFormat("uk-UA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n)} грн`;
}

export function formatKmpUah2(n: number): string {
  return `${new Intl.NumberFormat("uk-UA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)} грн`;
}
