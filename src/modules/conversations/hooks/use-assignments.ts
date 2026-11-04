import { isAbortError, isApiError } from "@/services/api";
import { useCallback, useEffect, useMemo, useState } from "react";
import { assignmentApi } from "../services/assignment-api";
import type { ConversationAssignment } from "../types/assignment.types";

interface AssignmentsResult {
  key: string;
  assignments?: ConversationAssignment[];
  error?: unknown;
}

/**
 * Asignaciones de la conversación seleccionada. La activa es la que tiene
 * `ended_at = null` (el backend garantiza una sola). Las operaciones se
 * ejecutan en una única llamada y, tras un conflicto, se vuelve a consultar el
 * estado real. Nada se asigna automáticamente al abrir una conversación.
 */
export function useAssignments(conversationId: number | null) {
  const [reloadToken, setReloadToken] = useState(0);
  const [result, setResult] = useState<AssignmentsResult | null>(null);
  const [isPending, setIsPending] = useState(false);
  const requestKey = `${conversationId}|${reloadToken}`;

  useEffect(() => {
    if (conversationId === null) return;
    const controller = new AbortController();

    assignmentApi
      .list(conversationId, { signal: controller.signal })
      .then((assignments) => setResult({ key: requestKey, assignments }))
      .catch((error: unknown) => {
        if (isAbortError(error)) return;
        setResult({ key: requestKey, error });
      });

    return () => controller.abort();
  }, [conversationId, requestKey]);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);
  const current = result?.key === requestKey ? result : null;
  const sameConversation =
    result?.key.startsWith(`${conversationId}|`) ?? false;

  // Más reciente primero.
  const assignments = useMemo(
    () =>
      [...((sameConversation ? result?.assignments : undefined) ?? [])].sort(
        (a, b) =>
          Date.parse(b.assigned_at) - Date.parse(a.assigned_at) || b.id - a.id,
      ),
    [result, sameConversation],
  );
  const active = assignments.find((item) => item.ended_at === null) ?? null;

  /** Ejecuta una operación y refresca el estado; ante un conflicto relee el estado real. */
  const run = useCallback(
    async (operation: () => Promise<unknown>) => {
      if (isPending) return { ok: false as const, error: new Error("busy") };
      setIsPending(true);
      try {
        await operation();
        reload();
        return { ok: true as const };
      } catch (error) {
        if (isApiError(error) && (error.status === 409 || error.status === 404))
          reload();
        return { ok: false as const, error };
      } finally {
        setIsPending(false);
      }
    },
    [isPending, reload],
  );

  const assign = useCallback(
    (staffMemberId: number) =>
      conversationId === null
        ? Promise.resolve({ ok: false as const, error: new Error("none") })
        : run(() => assignmentApi.assign(conversationId, staffMemberId)),
    [conversationId, run],
  );

  const end = useCallback(
    (assignmentId: number) => run(() => assignmentApi.end(assignmentId)),
    [run],
  );

  return {
    assignments,
    active,
    error: current?.error,
    isLoading:
      conversationId !== null &&
      !current &&
      !(sameConversation && result?.assignments),
    isPending,
    reload,
    assign,
    end,
  };
}
