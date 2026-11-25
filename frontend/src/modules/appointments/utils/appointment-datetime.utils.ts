/**
 * Fechas y horas de citas en la zona horaria de la aplicación (`APP_TIMEZONE`,
 * por defecto `America/Lima`). Los campos de fecha/hora de la interfaz son
 * "hora de pared" en esa zona; al enviar se convierten a instantes con
 * desplazamiento y al recibir se convierten de vuelta, sin depender de la zona
 * del navegador y sin conversiones dobles.
 */
export const APP_TIMEZONE =
  (import.meta.env.VITE_APP_TIMEZONE as string | undefined) || "America/Lima";

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^\d{2}:\d{2}$/;

export function isValidDate(value: string): boolean {
  return DATE.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

export function isValidTime(value: string): boolean {
  if (!TIME.test(value)) return false;
  const [hours, minutes] = value.split(":").map(Number);
  return hours < 24 && minutes < 60;
}

function pad(value: number, size = 2) {
  return String(Math.trunc(Math.abs(value))).padStart(size, "0");
}

interface WallClock {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function getFormatter(timeZone: string) {
  let formatter = formatterCache.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    formatterCache.set(timeZone, formatter);
  }
  return formatter;
}

/** Hora de pared de un instante en la zona indicada. */
function getWallClock(instantMs: number, timeZone: string): WallClock {
  const parts = Object.fromEntries(
    getFormatter(timeZone)
      .formatToParts(new Date(instantMs))
      .map((part) => [part.type, Number(part.value)]),
  );
  return {
    year: parts.year,
    month: parts.month,
    day: parts.day,
    hour: parts.hour,
    minute: parts.minute,
    second: parts.second,
  };
}

/** Desplazamiento (minutos, positivo al este de UTC) de la zona en ese instante. */
function getOffsetMinutes(instantMs: number, timeZone: string): number {
  const wall = getWallClock(instantMs, timeZone);
  const asUtc = Date.UTC(
    wall.year,
    wall.month - 1,
    wall.day,
    wall.hour,
    wall.minute,
    wall.second,
  );
  return Math.round((asUtc - Math.floor(instantMs / 1000) * 1000) / 60000);
}

function formatOffset(offsetMinutes: number) {
  const sign = offsetMinutes >= 0 ? "+" : "-";
  return `${sign}${pad(offsetMinutes / 60)}:${pad(offsetMinutes % 60)}`;
}

/**
 * `date` (`YYYY-MM-DD`) + `time` (`HH:mm`) en `APP_TIMEZONE` → instante ISO con
 * desplazamiento, p. ej. `2026-11-03T10:00:00-05:00`.
 */
export function toZonedIso(
  date: string,
  time: string,
  timeZone: string = APP_TIMEZONE,
): string {
  const naiveUtc = Date.parse(`${date}T${time}:00Z`);
  // Dos pasadas para resolver correctamente cambios de horario cercanos.
  let offset = getOffsetMinutes(naiveUtc, timeZone);
  offset = getOffsetMinutes(naiveUtc - offset * 60000, timeZone);
  return `${date}T${time}:00${formatOffset(offset)}`;
}

/** Instante ISO → `{ date, time }` de pared en `APP_TIMEZONE`. */
export function fromIso(
  iso: string,
  timeZone: string = APP_TIMEZONE,
): { date: string; time: string } | null {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return null;
  const wall = getWallClock(ms, timeZone);
  return {
    date: `${pad(wall.year, 4)}-${pad(wall.month)}-${pad(wall.day)}`,
    time: `${pad(wall.hour)}:${pad(wall.minute)}`,
  };
}

/** Hoy (`YYYY-MM-DD`) en `APP_TIMEZONE`. */
export function todayInAppZone(): string {
  return fromIso(new Date().toISOString())!.date;
}

function formatWith(
  iso: string,
  locale: string,
  options: Intl.DateTimeFormatOptions,
): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(locale, {
    ...options,
    timeZone: APP_TIMEZONE,
  }).format(date);
}

/** Fecha y hora legibles, en la zona de la aplicación. */
export function formatDateTime(iso: string, locale: string): string {
  return formatWith(iso, locale, { dateStyle: "medium", timeStyle: "short" });
}

export function formatDateOnly(iso: string, locale: string): string {
  return formatWith(iso, locale, { dateStyle: "full" });
}

export function formatTimeOnly(iso: string, locale: string): string {
  return formatWith(iso, locale, { timeStyle: "short" });
}

/**
 * FullCalendar se configura con `timeZone="UTC"`: las fechas "de pared" viajan
 * como si fueran UTC. Estas funciones convierten entre ambas representaciones.
 */
export function toCalendarDate(iso: string): string | null {
  const wall = fromIso(iso);
  return wall ? `${wall.date}T${wall.time}:00` : null;
}

/** `Date` "de pared" (UTC) del calendario → `YYYY-MM-DD`. */
export function calendarDateToString(date: Date): string {
  return `${pad(date.getUTCFullYear(), 4)}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

/** `Date` "de pared" (UTC) del calendario → `HH:mm`. */
export function calendarDateToTime(date: Date): string {
  return `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`;
}

/** Desplazamiento (`-05:00`) que se aplicará a esa fecha y hora. */
export function getOffsetLabel(date: string, time: string): string | null {
  if (!isValidDate(date) || !isValidTime(time)) return null;
  return toZonedIso(date, time).slice(-6);
}

/**
 * Rango visible del calendario → `starts_from` (incluido) y `starts_to`
 * (excluido) como instantes con zona. `endDate` es exclusivo.
 */
export function toRangeParams(startDate: string, endDate: string) {
  return {
    starts_from: toZonedIso(startDate, "00:00"),
    starts_to: toZonedIso(endDate, "00:00"),
  };
}
