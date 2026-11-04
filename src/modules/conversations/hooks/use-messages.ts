import { isAbortError, isApiError } from "@/services/api";
import { useCallback, useEffect, useRef, useState } from "react";
import { messageApi } from "../services/message-api";
import type { Message } from "../types/message.types";
import { mergeMessages } from "../utils/message.utils";

export const MESSAGES_PAGE_SIZE = 50;
/** Margen para reconocer un mensaje propio ya registrado tras un fallo de conexión. */
const RECOVERY_WINDOW_MS = 60_000;

interface MessagesState {
  conversationId: number;
  messages: Message[];
  loadedPages: number;
  total: number;
}

export type SendResult =
  { ok: true; recovered: boolean } | { ok: false; error: unknown };

/**
 * Historial de una conversación. Se pide la página más reciente (`order=desc`)
 * y se muestra en orden cronológico; "cargar anteriores" pide la siguiente
 * página. Los mensajes se agrupan por conversación: al cambiar de conversación
 * no se muestra nada de la anterior. No hay tiempo real: se actualiza al abrir,
 * al enviar y a petición (`refresh`).
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
  const requestKey = `${conversationId}|${reloadToken}`;

  useEffect(() => {
    if (conversationId === null) return;
    const controller = new AbortController();

    messageApi
      .list(
        conversationId,
        { page: 1, page_size: MESSAGES_PAGE_SIZE, order: "desc" },
        { signal: controller.signal },
      )
      .then((page) => {
        setError(null);
        setState((prev) => ({
          conversationId,
          // Al recargar la misma conversación se conservan las páginas anteriores ya cargadas.
          messages: mergeMessages(
            prev?.conversationId === conversationId ? prev.messages : [],
            page.items,
          ),
          loadedPages:
            prev?.conversationId === conversationId ? prev.loadedPages : 1,
          total: page.total,
        }));
      })
      .catch((caught: unknown) => {
        if (isAbortError(caught)) return;
        setError({ id: conversationId, error: caught });
      });

    return () => controller.abort();
  }, [conversationId, requestKey]);

  const current =
    state && state.conversationId === conversationId ? state : null;
  const currentError =
    error && error.id === conversationId ? error.error : undefined;

  const refresh = useCallback(() => setReloadToken((token) => token + 1), []);

  const loadOlder = useCallback(async () => {
    if (conversationId === null || !current || isLoadingOlder) return;
    setIsLoadingOlder(true);
    try {
      const page = await messageApi.list(conversationId, {
        page: current.loadedPages + 1,
        page_size: MESSAGES_PAGE_SIZE,
        order: "desc",
      });
      setState((prev) =>
        prev && prev.conversationId === conversationId
          ? {
              ...prev,
              messages: mergeMessages(prev.messages, page.items),
              loadedPages: prev.loadedPages + 1,
              total: page.total,
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
   * Registra un mensaje saliente de personal. Si la conexión se pierde y no se
   * sabe si el backend lo registró, se consulta el historial antes de dar el
   * envío por fallido (para no duplicar al reintentar).
   */
  const send = useCallback(
    async (content: string): Promise<SendResult> => {
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
        const message = await messageApi.create(conversationId, {
          content,
          sender_type: "staff",
        });
        incorporate([message]);
        return { ok: true, recovered: false };
      } catch (caught) {
        if (isApiError(caught) && caught.kind === "network") {
          try {
            const page = await messageApi.list(conversationId, {
              page: 1,
              page_size: 20,
              order: "desc",
            });
            incorporate(page.items);
            const found = page.items.some(
              (message) =>
                message.direction === "outbound" &&
                message.sender_type === "staff" &&
                message.content === content &&
                Date.parse(message.created_at) >=
                  startedAt - RECOVERY_WINDOW_MS,
            );
            if (found) return { ok: true, recovered: true };
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

  return {
    messages: current?.messages ?? [],
    total: current?.total ?? 0,
    hasOlder: current ? current.messages.length < current.total : false,
    error: currentError,
    isLoading: conversationId !== null && current === null && !currentError,
    isLoadingOlder,
    isSending,
    refresh,
    loadOlder,
    send,
  };
}
