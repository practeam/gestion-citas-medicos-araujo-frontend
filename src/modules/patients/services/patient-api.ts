import { apiClient, type PageResult } from "@/services/api";
import type {
  Patient,
  PatientCreateRequest,
  PatientListParams,
  PatientStatusRequest,
  PatientUpdateRequest,
} from "../types/patient.types";

interface Options {
  signal?: AbortSignal;
}

export const patientApi = {
  list: (params: PatientListParams, { signal }: Options = {}) =>
    apiClient.get<PageResult<Patient>>("/patients", {
      params: { ...params },
      signal,
    }),

  getById: (patientId: number, { signal }: Options = {}) =>
    apiClient.get<Patient>(`/patients/${patientId}`, { signal }),

  create: (body: PatientCreateRequest) =>
    apiClient.post<Patient>("/patients", body),

  update: (patientId: number, body: PatientUpdateRequest) =>
    apiClient.patch<Patient>(`/patients/${patientId}`, body),

  updateStatus: (patientId: number, body: PatientStatusRequest) =>
    apiClient.patch<Patient>(`/patients/${patientId}/status`, body),
};
