import { isAbortError, type PageResult } from "@/services/api";
import { useCallback, useEffect, useState } from "react";
import { conversationApi } from "../services/conversation-api";
import type {
  Conversation,
  ConversationFilters,
  ConversationListParams,
} from "../types/conversation.types";

export const CONVERSATIONS_PAGE_SIZE = 20;

interface ConversationsResult {
  key: string;
  data?: PageResult<Conversation>;
  error?: unknown;
}

const INITIAL_FILTERS: ConversationFilters = {
  personId: null,
  channel: "all",
  status: "all",
};

/**
 * Listado de conversaciones con filtros por persona, canal y estado, y
 * paginación del servidor. El orden es el del backend (`started_at` desc). Los
 * filtros se conservan mientras se navega entre conversaciones.
 */
export function useConversations() {
  const [filters, setFilters] = useState<ConversationFilters>(INITIAL_FILTERS);
  const [page, setPage] = useState(1);
  const [reloadToken, setReloadToken] = useState(0);
  const [result, setResult] = useState<ConversationsResult | null>(null);

  const { personId, channel, status } = filters;
  const requestKey = [personId, channel, status, page, reloadToken].join("|");

  useEffect(() => {
    const controller = new AbortController();
    const params: ConversationListParams = {
      page,
      page_size: CONVERSATIONS_PAGE_SIZE,
      ...(personId !== null && { person_id: personId }),
      ...(channel !== "all" && { channel }),
      ...(status !== "all" && { status }),
    };

    conversationApi
      .list(params, { signal: controller.signal })
      .then((data) => setResult({ key: requestKey, data }))
      .catch((error: unknown) => {
        if (isAbortError(error)) return;
        setResult({ key: requestKey, error });
      });

    return () => controller.abort();
  }, [requestKey, personId, channel, status, page]);

  /** Cambia filtros y vuelve a la primera página. */
  const updateFilters = useCallback((patch: Partial<ConversationFilters>) => {
    setFilters((prev) => {
      const changed = (
        Object.keys(patch) as (keyof ConversationFilters)[]
      ).some((key) => prev[key] !== patch[key]);
      return changed ? { ...prev, ...patch } : prev;
    });
    setPage(1);
  }, []);
  const clearFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    setPage(1);
  }, []);
  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  const current = result?.key === requestKey ? result : null;
  const hasFilters = personId !== null || channel !== "all" || status !== "all";

  return {
    filters,
    hasFilters,
    updateFilters,
    clearFilters,
    page,
    setPage,
    reload,
    data: (current ?? result)?.data,
    error: current?.error,
    isLoading: current === null,
  };
}
