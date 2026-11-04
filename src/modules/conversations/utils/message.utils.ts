import type { Message } from "../types/message.types";

/** Fecha de referencia del mensaje: `sent_at` si existe; si no, `created_at` (aún sin confirmar envío). */
export function getMessageTimestamp(message: Message): string {
  return message.sent_at ?? message.created_at;
}

/** Orden cronológico (del más antiguo al más reciente) con desempate estable por id. */
export function compareMessages(a: Message, b: Message): number {
  const diff =
    Date.parse(getMessageTimestamp(a)) - Date.parse(getMessageTimestamp(b));
  return diff !== 0 && !Number.isNaN(diff) ? diff : a.id - b.id;
}

/** Une listas de mensajes sin duplicar ids (gana el más reciente) y ordena. */
export function mergeMessages(
  current: Message[],
  incoming: Message[],
): Message[] {
  const byId = new Map<number, Message>();
  for (const message of current) byId.set(message.id, message);
  for (const message of incoming) byId.set(message.id, message);
  return [...byId.values()].sort(compareMessages);
}

/** Longitud útil: se valida sin espacios en los extremos, pero el texto no se altera. */
export function isBlank(content: string): boolean {
  return content.trim().length === 0;
}
