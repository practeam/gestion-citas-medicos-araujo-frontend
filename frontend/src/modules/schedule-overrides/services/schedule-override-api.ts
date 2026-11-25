import { apiClient, type PageResult } from "@/services/api";
import type {
  ScheduleOverride,
  ScheduleOverrideCreateRequest,
  ScheduleOverrideListParams,
  ScheduleOverrideUpdateRequest,
} from "../types/schedule-override.types";

interface Options {
  signal?: AbortSignal;
}

/**
 * `/schedule-overrides`. El backend no expone `DELETE`: los overrides se
 * desactivan con el endpoint específico de estado, nunca con el `PATCH` general.
 */
export const scheduleOverrideApi = {
  list: (params: ScheduleOverrideListParams, { signal }: Options = {}) =>
    apiClient.get<PageResult<ScheduleOverride>>("/schedule-overrides", {
      params: { ...params },
      signal,
    }),

  getById: (overrideId: number, { signal }: Options = {}) =>
    apiClient.get<ScheduleOverride>(`/schedule-overrides/${overrideId}`, {
      signal,
    }),

  create: (body: ScheduleOverrideCreateRequest) =>
    apiClient.post<ScheduleOverride>("/schedule-overrides", body),

  update: (overrideId: number, body: ScheduleOverrideUpdateRequest) =>
    apiClient.patch<ScheduleOverride>(
      `/schedule-overrides/${overrideId}`,
      body,
    ),

  updateStatus: (overrideId: number, isActive: boolean) =>
    apiClient.patch<ScheduleOverride>(
      `/schedule-overrides/${overrideId}/status`,
      { is_active: isActive },
    ),
};
