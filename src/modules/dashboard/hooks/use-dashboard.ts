import { isAbortError } from "@/services/api";
import { useEffect, useState } from "react";
import { dashboardApi } from "../services/dashboard-api";
import type {
  DashboardParams,
  DashboardResult,
} from "../types/dashboard.types";

interface DashboardState {
  key: string;
  data?: DashboardResult;
  error?: unknown;
}

/**
 * Consulta el dashboard del periodo indicado. `params === null` (rango
 * personalizado incompleto o inválido) no lanza ninguna petición. El resultado
 * se asocia a la clave de sus parámetros: mientras cambia el periodo no se
 * muestra información del anterior, y la cancelación evita condiciones de carrera.
 */
export function useDashboard(params: DashboardParams | null) {
  const key = params ? JSON.stringify(params) : "";
  const [state, setState] = useState<DashboardState | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!key) return;
    const controller = new AbortController();
    dashboardApi
      .get(JSON.parse(key) as DashboardParams, { signal: controller.signal })
      .then((data) => setState({ key, data }))
      .catch((error: unknown) => {
        if (isAbortError(error)) return;
        setState({ key, error });
      });
    return () => controller.abort();
  }, [key, reloadToken]);

  const current = key && state?.key === key ? state : null;

  return {
    data: current?.data,
    error: current?.error,
    isLoading: key !== "" && current === null,
    reload: () => {
      setState(null);
      setReloadToken((token) => token + 1);
    },
  };
}
