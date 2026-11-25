/**
 * Las fechas del backend llegan en UTC; se muestran en la zona horaria de la
 * aplicación (`VITE_APP_TIMEZONE`, por defecto `America/Lima`) sin modificar los
 * valores originales.
 */
const TIME_ZONE =
  (import.meta.env.VITE_APP_TIMEZONE as string | undefined) || "America/Lima";

function format(
  iso: string,
  locale: string,
  options: Intl.DateTimeFormatOptions,
): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(locale, {
    ...options,
    timeZone: TIME_ZONE,
  }).format(date);
}

export function formatDateTime(iso: string, locale: string): string {
  return format(iso, locale, { dateStyle: "medium", timeStyle: "short" });
}

export function formatTime(iso: string, locale: string): string {
  return format(iso, locale, { timeStyle: "short" });
}

export function formatDay(iso: string, locale: string): string {
  return format(iso, locale, { dateStyle: "full" });
}

/** Fecha corta para el listado: la hora si es hoy, la fecha en otro caso. */
export function formatListDate(iso: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return dayKey(iso) === dayKey(new Date().toISOString())
    ? formatTime(iso, locale)
    : format(iso, locale, { dateStyle: "short" });
}

/** `YYYY-MM-DD` del día del instante en la zona de la aplicación (agrupa por día). */
export function dayKey(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
