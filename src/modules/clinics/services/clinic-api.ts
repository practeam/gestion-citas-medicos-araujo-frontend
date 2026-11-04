import { apiClient, type PageResult } from "@/services/api";
import type {
  Clinic,
  ClinicCreateRequest,
  ClinicListParams,
  ClinicStatusRequest,
  ClinicUpdateRequest,
} from "../types/clinic.types";

interface Options {
  signal?: AbortSignal;
}

export const clinicApi = {
  list: (params: ClinicListParams, { signal }: Options = {}) =>
    apiClient.get<PageResult<Clinic>>("/clinics", {
      params: { ...params },
      signal,
    }),

  getById: (clinicId: number, { signal }: Options = {}) =>
    apiClient.get<Clinic>(`/clinics/${clinicId}`, { signal }),

  create: (body: ClinicCreateRequest) =>
    apiClient.post<Clinic>("/clinics", body),

  update: (clinicId: number, body: ClinicUpdateRequest) =>
    apiClient.patch<Clinic>(`/clinics/${clinicId}`, body),

  updateStatus: (clinicId: number, body: ClinicStatusRequest) =>
    apiClient.patch<Clinic>(`/clinics/${clinicId}/status`, body),
};
