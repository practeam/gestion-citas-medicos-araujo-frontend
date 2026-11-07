import { isAbortError, isApiError } from "@/services/api";
import { useCallback, useEffect, useRef, useState } from "react";
import { messageApi } from "../services/message-api";
import type { Message, TemplateMessageRequest } from "../types/message.types";
import { mergeMessages } from "../utils/message.utils";
import { usePolling } from "./use-polling";

export const MESSAGES_PAGE_SIZE = 50;
const POLL_INTERVAL_MS = 10_000;
/** Margen para reconocer un mensaje propio ya registrado tras un fallo de conexión. */
const RECOVERY_WINDOW_MS = 60_000;

interface MessagesState {
  conversationId: number;
  messages: Message[];
  /** Cursor para pedir mensajes más antiguos. */
  nextCursor: string | null;
  hasOlder: boolean;
}

export type SendResult =
  { ok: true; recovered: boolean } | { ok: false; error: unknown };

/**
 * Historial de una conversación con la paginación por cursor del backend: la
 * primera página trae las últimas 24 h y `loadOlder` retrocede con
 * `next_cursor`, incorporando los mensajes antiguos al inicio. Se actualiza
 * periódicamente (la primera página se funde por id, así cambian los estados de
 * entrega) y al enviar. Al cambiar de conversación no se muestra nada de la
 * anterior.
 */
export function useMessages(conversationId: number | null) {
  const [reloadToken, setReloadToken] = useState(0);
  const [state, setState] = useState<MessagesState | null>(null);
  const [error, setError] = useState<{ id: number; error: unknown } | null>(
    null,
  );
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const sendingRef = useRef(false);

  useEffect(() => {
    if (conversationId === null) return;
    const controller = new AbortController();

    messageApi
      .history(
        conversationId,
        { limit: MESSAGES_PAGE_SIZE },
        { signal: controller.signal },
      )
      .then((page) => {
        setError(null);
        setState((prev) => {
          const same = prev?.conversationId === conversationId ? prev : null;
          return {
            conversationId,
            // Al recargar se conservan los mensajes anteriores ya cargados.
            messages: mergeMessages(same?.messages ?? [], page.items),
            nextCursor: same ? same.nextCursor : page.next_cursor,
            hasOlder: same ? same.hasOlder : page.has_more,
          };
        });
      })
      .catch((caught: unknown) => {
        if (isAbortError(caught)) return;
        setError({ id: conversationId, error: caught });
      });

    return () => controller.abort();
  }, [conversationId, reloadToken]);

  const current =
    state && state.conversationId === conversationId ? state : null;
  const currentError =
    error && error.id === conversationId ? error.error : undefined;

  const refresh = useCallback(() => setReloadToken((token) => token + 1), []);

  // Actualización silenciosa: no toca el cursor ni muestra errores.
  usePolling(() => {
    if (conversationId === null || !current) return;
    messageApi
      .history(conversationId, { limit: MESSAGES_PAGE_SIZE })
      .then((page) =>
        setState((prev) =>
          prev && prev.conversationId === conversationId
            ? { ...prev, messages: mergeMessages(prev.messages, page.items) }
            : prev,
        ),
      )
      .catch(() => undefined);
  }, POLL_INTERVAL_MS);

  const loadOlder = useCallback(async () => {
    if (
      conversationId === null ||
      !current ||
      !current.hasOlder ||
      !current.nextCursor ||
      isLoadingOlder
    )
      return;
    setIsLoadingOlder(true);
    try {
      const page = await messageApi.history(conversationId, {
        limit: MESSAGES_PAGE_SIZE,
        cursor: current.nextCursor,
      });
      setState((prev) =>
        prev && prev.conversationId === conversationId
          ? {
              ...prev,
              messages: mergeMessages(prev.messages, page.items),
              nextCursor: page.next_cursor,
              hasOlder: page.has_more,
            }
          : prev,
      );
    } catch (caught) {
      if (!isAbortError(caught))
        setError({ id: conversationId, error: caught });
    } finally {
      setIsLoadingOlder(false);
    }
  }, [conversationId, current, isLoadingOlder]);

  /**
   * Envía algo y lo incorpora al historial. Un envío a la vez. Si falla por
   * conexión y `recover` está definido, se consulta el historial antes de dar
   * el envío por fallido (para no duplicar al reintentar).
   */
  const run = useCallback(
    async (
      action: (conversationId: number) => Promise<Message>,
      recover?: (items: Message[], startedAt: number) => boolean,
    ): Promise<SendResult> => {
      if (conversationId === null || sendingRef.current)
        return { ok: false, error: new Error("busy") };
      sendingRef.current = true;
      setIsSending(true);
      const startedAt = Date.now();
      const incorporate = (items: Message[]) =>
        setState((prev) =>
          prev && prev.conversationId === conversationId
            ? { ...prev, messages: mergeMessages(prev.messages, items) }
            : prev,
        );
      try {
        incorporate([await action(conversationId)]);
        return { ok: true, recovered: false };
      } catch (caught) {
        if (recover && isApiError(caught) && caught.kind === "network") {
          try {
            const page = await messageApi.history(conversationId, {
              limit: 20,
            });
            incorporate(page.items);
            if (recover(page.items, startedAt))
              return { ok: true, recovered: true };
          } catch {
            // Sin conexión también para consultar: se informa el error original.
          }
        }
        return { ok: false, error: caught };
      } finally {
        sendingRef.current = false;
        setIsSending(false);
      }
    },
    [conversationId],
  );

  const send = useCallback(
    (content: string) =>
      run(
        (id) => messageApi.create(id, { content, sender_type: "staff" }),
        (items, startedAt) =>
          items.some(
            (message) =>
              message.direction === "outbound" &&
              message.sender_type === "staff" &&
              message.message_type === "text" &&
              message.content === content &&
              Date.parse(message.created_at) >= startedAt - RECOVERY_WINDOW_MS,
          ),
      ),
    [run],
  );

  const sendMedia = useCallback(
    (file: File, caption?: string) =>
      run((id) => messageApi.sendMedia(id, file, caption)),
    [run],
  );

  const sendTemplate = useCallback(
    (body: TemplateMessageRequest) =>
      run((id) => messageApi.sendTemplate(id, body)),
    [run],
  );

  return {
    messages: current?.messages ?? [],
    hasOlder: current?.hasOlder ?? false,
    error: currentError,
    isLoading: conversationId !== null && current === null && !currentError,
    isLoadingOlder,
    isSending,
    refresh,
    loadOlder,
    send,
    sendMedia,
    sendTemplate,
  };
}
