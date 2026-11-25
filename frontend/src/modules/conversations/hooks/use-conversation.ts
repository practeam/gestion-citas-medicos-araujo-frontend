import { isAbortError } from "@/services/api";
import { useCallback, useEffect, useState } from "react";
import { conversationApi } from "../services/conversation-api";
import type { Conversation } from "../types/conversation.types";

interface ConversationResult {
  key: string;
  conversation?: Conversation;
  error?: unknown;
}

/**
 * Detalle de la conversación seleccionada (`GET /conversations/{id}`). Nunca
 * muestra datos de otra conversación: el resultado solo vale para su propio id.
 * `confirm` incorpora la respuesta confirmada de un cambio de estado.
 */
export function useConversation(conversationId: number | null) {
  const [reloadToken, setReloadToken] = useState(0);
  const [result, setResult] = useState<ConversationResult | null>(null);
  const [confirmed, setConfirmed] = useState<Conversation | null>(null);
  const requestKey = `${conversationId}|${reloadToken}`;

  useEffect(() => {
    if (conversationId === null) return;
    const controller = new AbortController();

    conversationApi
      .getById(conversationId, { signal: controller.signal })
      .then((conversation) => setResult({ key: requestKey, conversation }))
      .catch((error: unknown) => {
        if (isAbortError(error)) return;
        setResult({ key: requestKey, error });
      });

    return () => controller.abort();
  }, [conversationId, requestKey]);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);
  const current = result?.key === requestKey ? result : null;
  // Solo se muestran datos de la conversación pedida.
  const sameId = (value: Conversation | null | undefined) =>
    value && value.id === conversationId ? value : undefined;
  const conversation =
    sameId(confirmed) ??
    sameId(current?.conversation) ??
    sameId(
      result?.key.startsWith(`${conversationId}|`)
        ? result.conversation
        : undefined,
    );

  return {
    conversation,
    error: current?.error,
    isLoading: conversationId !== null && !conversation && current === null,
    confirm: setConfirmed,
    reload,
  };
}
