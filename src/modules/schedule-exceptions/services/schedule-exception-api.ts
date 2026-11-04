import { apiClient, type PageResult } from "@/services/api";
import type {
  ScheduleException,
  ScheduleExceptionCreateRequest,
  ScheduleExceptionListParams,
  ScheduleExceptionUpdateRequest,
} from "../types/schedule-exception.types";

interface Options {
  signal?: AbortSignal;
}

/**
 * `/schedule-exceptions`. El backend no expone `DELETE` para este recurso, por
 * lo que no hay operación de eliminación.
 */
export const scheduleExceptionApi = {
  list: (params: ScheduleExceptionListParams, { signal }: Options = {}) =>
    apiClient.get<PageResult<ScheduleException>>("/schedule-exceptions", {
      params: { ...params },
      signal,
    }),

  getById: (exceptionId: number, { signal }: Options = {}) =>
    apiClient.get<ScheduleException>(`/schedule-exceptions/${exceptionId}`, {
      signal,
    }),

  create: (body: ScheduleExceptionCreateRequest) =>
    apiClient.post<ScheduleException>("/schedule-exceptions", body),

  update: (exceptionId: number, body: ScheduleExceptionUpdateRequest) =>
    apiClient.patch<ScheduleException>(
      `/schedule-exceptions/${exceptionId}`,
      body,
    ),
};
