/**
 * Fecha y hora con zona horaria. Los campos `datetime-local` entregan
 * `YYYY-MM-DDTHH:mm` sin zona; el backend exige `date-time` con desplazamiento,
 * así que se completa con el desplazamiento del navegador **para esa fecha**
 * (respeta cambios de horario de verano). Se asume que el navegador está en la
 * zona horaria de la clínica: `time_zone` no se expone en la API.
 */
const LOCAL_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

export function isValidLocalDateTime(value: string): boolean {
  return LOCAL_DATETIME.test(value) && !Number.isNaN(new Date(value).getTime());
}

function pad(value: number) {
  return String(Math.trunc(Math.abs(value))).padStart(2, "0");
}

/** `2026-11-02T13:00` → `2026-11-02T13:00:00-05:00` (desplazamiento del navegador). */
export function toOffsetIso(local: string): string {
  const date = new Date(local);
  // getTimezoneOffset() es positivo al oeste de UTC; el desplazamiento ISO tiene el signo contrario.
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const hours = pad(offsetMinutes / 60);
  const minutes = pad(offsetMinutes % 60);
  return `${local}:00${sign}${hours}:${minutes}`;
}

/** Instante ISO del backend → `YYYY-MM-DDTHH:mm` en hora local del navegador. */
export function toLocalInputValue(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Zona horaria IANA válida o `undefined` (→ la del navegador). */
function resolveTimeZone(timeZone?: string | null): string | undefined {
  if (!timeZone) return undefined;
  try {
    new Intl.DateTimeFormat("en", { timeZone });
    return timeZone;
  } catch {
    return undefined;
  }
}

/**
 * Fecha y hora legibles con la zona horaria indicada (por defecto la del
 * navegador; una zona inválida cae a la del navegador). `dateStyle`/`timeStyle`
 * no pueden combinarse con `timeZoneName` (lanza TypeError), por eso se usan
 * campos explícitos. Valor vacío → "—"; fecha inválida → el valor original.
 */
export function formatDateTimeWithZone(
  iso: string | null | undefined,
  locale: string,
  timeZone?: string | null,
): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: resolveTimeZone(timeZone),
    timeZoneName: "short",
  }).format(date);
}

/** Dos instantes (local o con desplazamiento) son el mismo momento. */
export function isSameInstant(localValue: string, iso: string): boolean {
  return (
    new Date(toOffsetIso(localValue)).getTime() === new Date(iso).getTime()
  );
}
