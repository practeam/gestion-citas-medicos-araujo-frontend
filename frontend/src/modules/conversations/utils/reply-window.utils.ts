/** Ventana de atención de WhatsApp: 24 h desde el último mensaje del contacto. */
export const REPLY_WINDOW_MS = 24 * 60 * 60 * 1000;

export interface ReplyWindow {
  /** Se puede enviar texto y archivos libres; si es `false`, solo plantillas. */
  open: boolean;
  /** Fin de la ventana (ISO); `null` si el contacto aún no ha escrito. */
  expiresAt: string | null;
}

/**
 * Ventana de respuesta a partir del último mensaje entrante. No confundir con
 * las 24 h de visualización de la bandeja y del historial. El backend sigue
 * siendo quien decide: si rechaza un envío, se muestra su mensaje.
 */
export function getReplyWindow(
  lastInboundAt: string | null,
  now: number,
): ReplyWindow {
  const inbound = Date.parse(lastInboundAt ?? "");
  if (Number.isNaN(inbound)) return { open: false, expiresAt: null };
  const expires = inbound + REPLY_WINDOW_MS;
  return { open: now < expires, expiresAt: new Date(expires).toISOString() };
}
