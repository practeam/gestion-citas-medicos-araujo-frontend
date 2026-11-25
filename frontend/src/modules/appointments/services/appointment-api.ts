import { apiClient, type PageResult } from "@/services/api";
import type {
  Appointment,
  AppointmentDetail,
  AppointmentDetailCreateRequest,
  AppointmentDetailUpdateRequest,
  AppointmentCreateRequest,
  AppointmentListParams,
  AppointmentStatus,
  AppointmentUpdateRequest,
  RelatedAppointmentListParams,
} from "../types/appointment.types";

interface Options {
  signal?: AbortSignal;
}

/**
 * `/appointments`. No existe `DELETE`: las citas se cancelan con el endpoint
 * de estado. El `PATCH` general nunca cambia el estado.
 */
export const appointmentApi = {
  list: (params: AppointmentListParams, { signal }: Options = {}) =>
    apiClient.get<PageResult<Appointment>>("/appointments", {
      params: { ...params },
      signal,
    }),

  getById: (appointmentId: number, { signal }: Options = {}) =>
    apiClient.get<Appointment>(`/appointments/${appointmentId}`, { signal }),

  create: (body: AppointmentCreateRequest) =>
    apiClient.post<Appointment>("/appointments", body),

  update: (appointmentId: number, body: AppointmentUpdateRequest) =>
    apiClient.patch<Appointment>(`/appointments/${appointmentId}`, body),

  updateStatus: (appointmentId: number, status: AppointmentStatus) =>
    apiClient.patch<Appointment>(`/appointments/${appointmentId}/status`, {
      status,
    }),

  listByPatient: (
    patientId: number,
    params: RelatedAppointmentListParams,
    { signal }: Options = {},
  ) =>
    apiClient.get<PageResult<Appointment>>(
      `/patients/${patientId}/appointments`,
      { params: { ...params }, signal },
    ),

  listByStaffMember: (
    staffMemberId: number,
    params: RelatedAppointmentListParams,
    { signal }: Options = {},
  ) =>
    apiClient.get<PageResult<Appointment>>(
      `/staff-members/${staffMemberId}/appointments`,
      { params: { ...params }, signal },
    ),

  listDetails: (appointmentId: number, { signal }: Options = {}) =>
    apiClient.get<AppointmentDetail[]>(
      `/appointments/${appointmentId}/details`,
      { signal },
    ),

  createDetail: (appointmentId: number, body: AppointmentDetailCreateRequest) =>
    apiClient.post<AppointmentDetail>(
      `/appointments/${appointmentId}/details`,
      body,
    ),

  updateDetail: (
    appointmentId: number,
    detailId: number,
    body: AppointmentDetailUpdateRequest,
  ) =>
    apiClient.patch<AppointmentDetail>(
      `/appointments/${appointmentId}/details/${detailId}`,
      body,
    ),

  /** Solo permitido por el backend en citas que no estén completadas ni canceladas. */
  deleteDetail: (appointmentId: number, detailId: number) =>
    apiClient.delete<AppointmentDetail>(
      `/appointments/${appointmentId}/details/${detailId}`,
    ),
};
