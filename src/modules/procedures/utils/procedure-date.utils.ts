/** Formatea un `date-time` ISO del backend en la zona horaria del navegador. */
export function formatDateTime(value: string, locale: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

/** Formatea una fecha `YYYY-MM-DD` sin desplazamientos de zona horaria. */
export function formatDate(value: string, locale: string): string {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date);
}
