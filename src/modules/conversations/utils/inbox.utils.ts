import type { InboxItem } from "../types/conversation.types";

function activity(item: InboxItem): number {
  const time = Date.parse(item.last_message_at ?? "");
  return Number.isNaN(time) ? 0 : time;
}

/**
 * Une listas de la bandeja sin duplicar ids (gana la más reciente) y las
 * ordena por actividad, de la más reciente a la más antigua (igual que el
 * backend), con desempate estable por id.
 */
export function mergeInbox(
  current: InboxItem[],
  incoming: InboxItem[],
): InboxItem[] {
  const byId = new Map<number, InboxItem>();
  for (const item of current) byId.set(item.id, item);
  for (const item of incoming) byId.set(item.id, item);
  return [...byId.values()].sort(
    (a, b) => activity(b) - activity(a) || b.id - a.id,
  );
}

/** Vista previa del último mensaje: el texto, o una etiqueta si es un archivo. */
export function previewKind(item: InboxItem): "text" | string {
  return item.last_message?.message_type ?? "text";
}
