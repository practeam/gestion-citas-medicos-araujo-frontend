import { apiClient, type PageResult } from "@/services/api";
import type {
  ClinicSchedule,
  ClinicScheduleCreateRequest,
  ClinicScheduleUpdateRequest,
} from "../types/clinic-schedule.types";

interface Options {
  signal?: AbortSignal;
}

const SCHEDULES_PAGE_SIZE = 100;

/**
 * Horarios semanales de una clínica: `/clinics/{id}/schedules` (independiente
 * de `POST`/`PATCH /clinics`). No se elimina físicamente: se desactiva.
 */
export const clinicScheduleApi = {
  /** Primera página (máx. 100) con activos e inactivos. */
  list: (clinicId: number, { signal }: Options = {}) =>
    apiClient.get<PageResult<ClinicSchedule>>(
      `/clinics/${clinicId}/schedules`,
      { params: { page: 1, page_size: SCHEDULES_PAGE_SIZE }, signal },
    ),

  create: (clinicId: number, body: ClinicScheduleCreateRequest) =>
    apiClient.post<ClinicSchedule>(`/clinics/${clinicId}/schedules`, body),

  update: (
    clinicId: number,
    scheduleId: number,
    body: ClinicScheduleUpdateRequest,
  ) =>
    apiClient.patch<ClinicSchedule>(
      `/clinics/${clinicId}/schedules/${scheduleId}`,
      body,
    ),

  updateStatus: (clinicId: number, scheduleId: number, isActive: boolean) =>
    apiClient.patch<ClinicSchedule>(
      `/clinics/${clinicId}/schedules/${scheduleId}/status`,
      { is_active: isActive },
    ),
};
