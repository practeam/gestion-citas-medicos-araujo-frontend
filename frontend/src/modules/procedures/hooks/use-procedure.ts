import { isAbortError } from "@/services/api";
import { useEffect, useState } from "react";
import { procedureApi } from "../services/procedure-api";
import type { Procedure } from "../types/procedure.types";

interface ProcedureResult {
  procedureId: number;
  procedure?: Procedure;
  error?: unknown;
}

/** Consulta un rol por id. `procedureId` inválido (NaN) se trata como no encontrado. */
export function useProcedure(procedureId: number) {
  const [result, setResult] = useState<ProcedureResult | null>(null);
  const isValidId = Number.isInteger(procedureId) && procedureId > 0;

  useEffect(() => {
    if (!isValidId) return;
    const controller = new AbortController();

    procedureApi
      .getById(procedureId, { signal: controller.signal })
      .then((procedure) => setResult({ procedureId, procedure }))
      .catch((error: unknown) => {
        if (isAbortError(error)) return;
        setResult({ procedureId, error });
      });

    return () => controller.abort();
  }, [procedureId, isValidId]);

  const current = result?.procedureId === procedureId ? result : null;

  return {
    procedure: current?.procedure,
    error: current?.error,
    isInvalidId: !isValidId,
    isLoading: isValidId && current === null,
  };
}
