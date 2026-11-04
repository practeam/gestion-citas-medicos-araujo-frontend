/**
 * Importes decimales sin `float`: se trabaja con la cadena de la API y con
 * céntimos enteros (`bigint`) para comparaciones y sumas.
 */
const PRICE_PATTERN = /^\d+(\.\d{1,2})?$/;

/** Decimal ≥ 0 con como máximo dos decimales (ni signo, ni notación científica). */
export function isValidPrice(value: string): boolean {
  return PRICE_PATTERN.test(value.trim());
}

/** `"150.5"` → `15050n`. Devuelve `null` si no es un precio válido. */
export function priceToCents(value: string): bigint | null {
  const price = value.trim();
  if (!PRICE_PATTERN.test(price)) return null;
  const [units, decimals = ""] = price.split(".");
  return BigInt(units) * 100n + BigInt(decimals.padEnd(2, "0"));
}

/** `15050n` → `"150.50"`. */
export function centsToPrice(cents: bigint): string {
  const units = cents / 100n;
  const decimals = (cents % 100n).toString().padStart(2, "0");
  return `${units}.${decimals}`;
}

/** Normaliza a dos decimales (`"150.5"` → `"150.50"`); `null` si no es válido. */
export function normalizePrice(value: string): string | null {
  const cents = priceToCents(value);
  return cents === null ? null : centsToPrice(cents);
}

/** `unit_price × quantity` en céntimos exactos. */
export function multiplyPrice(unitPrice: string, quantity: number): string {
  const cents = priceToCents(unitPrice);
  return cents === null
    ? unitPrice
    : centsToPrice(cents * BigInt(Math.trunc(quantity)));
}
