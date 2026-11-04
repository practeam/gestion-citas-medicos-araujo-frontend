import { apiClient, type PageResult } from "@/services/api";
import type {
  StaffSchedule,
  StaffScheduleCreateRequest,
  StaffScheduleUpdateRequest,
} from "../types/staff-schedule.types";

interface Options {
  signal?: AbortSignal;
}

const SCHEDULES_PAGE_SIZE = 100;

/**
 * Horarios semanales de un integrante: `/staff-members/{id}/schedules`
 * (independiente de `POST`/`PATCH /staff`). No se elimina físicamente: se desactiva.
 */
export const staffScheduleApi = {
  /** Primera página (máx. 100) con activos e inactivos. */
  list: (staffMemberId: number, { signal }: Options = {}) =>
    apiClient.get<PageResult<StaffSchedule>>(
      `/staff-members/${staffMemberId}/schedules`,
      { params: { page: 1, page_size: SCHEDULES_PAGE_SIZE }, signal },
    ),

  create: (staffMemberId: number, body: StaffScheduleCreateRequest) =>
    apiClient.post<StaffSchedule>(
      `/staff-members/${staffMemberId}/schedules`,
      body,
    ),

  update: (
    staffMemberId: number,
    scheduleId: number,
    body: StaffScheduleUpdateRequest,
  ) =>
    apiClient.patch<StaffSchedule>(
      `/staff-members/${staffMemberId}/schedules/${scheduleId}`,
      body,
    ),

  updateStatus: (
    staffMemberId: number,
    scheduleId: number,
    isActive: boolean,
  ) =>
    apiClient.patch<StaffSchedule>(
      `/staff-members/${staffMemberId}/schedules/${scheduleId}/status`,
      { is_active: isActive },
    ),
};
