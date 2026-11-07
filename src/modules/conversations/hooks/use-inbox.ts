import { isAbortError } from "@/services/api";
import { useCallback, useEffect, useState } from "react";
import { conversationApi } from "../services/conversation-api";
import type {
  InboxFilters,
  InboxItem,
  InboxParams,
} from "../types/conversation.types";
import { mergeInbox } from "../utils/inbox.utils";
import { usePolling } from "./use-polling";

export const INBOX_PAGE_SIZE = 30;
const POLL_INTERVAL_MS = 20_000;

const INITIAL_FILTERS: InboxFilters = { status: "all", assignment: "all" };

interface InboxState {
  key: string;
  items: InboxItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

function toParams(filters: InboxFilters): InboxParams {
  return {
    limit: INBOX_PAGE_SIZE,
    ...(filters.status !== "all" && { status: filters.status }),
    ...(filters.assignment !== "all" && { assignment: filters.assignment }),
  };
}

/**
 * Bandeja de atención con la paginación por cursor del backend: la primera
 * página trae la actividad de las últimas 24 h y `loadMore` retrocede con
 * `next_cursor`. Se actualiza periódicamente (solo la primera página, que se
 * funde con lo ya cargado) y cada cambio de filtros descarta lo anterior.
 */
export function useInbox() {
  const [filters, setFilters] = useState<InboxFilters>(INITIAL_FILTERS);
  const [reloadToken, setReloadToken] = useState(0);
  const [state, setState] = useState<InboxState | null>(null);
  const [error, setError] = useState<{ key: string; error: unknown } | null>(
    null,
  );
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { status, assignment } = filters;
  const key = `${status}|${assignment}`;

  useEffect(() => {
    const controller = new AbortController();
    const params = toParams({ status, assignment });
    conversationApi
      .inbox(params, { signal: controller.signal })
      .then((page) => {
        setError(null);
        setState({
          key,
          items: page.items,
          nextCursor: page.next_cursor,
          hasMore: page.has_more,
        });
      })
      .catch((caught: unknown) => {
        if (isAbortError(caught)) return;
        setError({ key, error: caught });
      });
    return () => controller.abort();
  }, [key, status, assignment, reloadToken]);

  // Actualización silenciosa de la primera página: los fallos no se muestran.
  usePolling(() => {
    if (!state || state.key !== key) return;
    conversationApi
      .inbox(toParams({ status, assignment }))
      .then((page) =>
        setState((prev) =>
          prev && prev.key === key
            ? { ...prev, items: mergeInbox(prev.items, page.items) }
            : prev,
        ),
      )
      .catch(() => undefined);
  }, POLL_INTERVAL_MS);

  const current = state?.key === key ? state : null;
  const currentError = error?.key === key ? error.error : undefined;

  const loadMore = useCallback(async () => {
    if (!current || !current.hasMore || !current.nextCursor || isLoadingMore)
      return;
    setIsLoadingMore(true);
    try {
      const page = await conversationApi.inbox({
        ...toParams({ status, assignment }),
        cursor: current.nextCursor,
      });
      setState((prev) =>
        prev && prev.key === key
          ? {
              ...prev,
              items: mergeInbox(prev.items, page.items),
              nextCursor: page.next_cursor,
              hasMore: page.has_more,
            }
          : prev,
      );
    } catch (caught) {
      if (!isAbortError(caught)) setError({ key, error: caught });
    } finally {
      setIsLoadingMore(false);
    }
  }, [current, isLoadingMore, key, status, assignment]);

  const updateFilters = useCallback((patch: Partial<InboxFilters>) => {
    setFilters((prev) => {
      const changed = (Object.keys(patch) as (keyof InboxFilters)[]).some(
        (field) => prev[field] !== patch[field],
      );
      return changed ? { ...prev, ...patch } : prev;
    });
  }, []);
  const clearFilters = useCallback(() => setFilters(INITIAL_FILTERS), []);
  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  return {
    filters,
    hasFilters: status !== "all" || assignment !== "all",
    updateFilters,
    clearFilters,
    reload,
    loadMore,
    items: current?.items ?? [],
    hasMore: current?.hasMore ?? false,
    error: currentError,
    isLoading: current === null && currentError === undefined,
    isLoadingMore,
  };
}
