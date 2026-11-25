import { apiClient } from "@/services/api";
import type {
  DashboardParams,
  DashboardResult,
} from "../types/dashboard.types";

interface Options {
  signal?: AbortSignal;
}

export const dashboardApi = {
  /** Una sola petición devuelve las cuatro tarjetas y los cinco gráficos. */
  get: (params: DashboardParams, { signal }: Options = {}) =>
    apiClient.get<DashboardResult>("/dashboard", {
      params: { ...params },
      signal,
    }),
};
