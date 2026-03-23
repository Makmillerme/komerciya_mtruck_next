export function addUnitIfNeeded(value: string | undefined, unit: string): string {
  if (!value?.trim()) return value ?? '';
  const v = value.trim();
  if (v.includes(unit)) return v;
  return `${v} ${unit}`;
}

export function formatNumberWithSpaces(value: string | undefined): string {
  if (!value?.trim()) return value ?? '';
  try {
    const numStr = value.trim().replace(/\s/g, '').replace(',', '.');
    const [intPart, decPart] = numStr.split('.');
    const formatted = parseInt(intPart || '0', 10).toLocaleString('uk-UA').replace(/\s/g, ' ');
    return decPart !== undefined ? `${formatted}.${decPart}` : formatted;
  } catch {
    return value;
  }
}