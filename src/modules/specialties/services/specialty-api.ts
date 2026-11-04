import { apiClient, type PageResult } from "@/services/api";
import type {
  Specialty,
  SpecialtyCreateRequest,
  SpecialtyListParams,
  SpecialtyStatusRequest,
  SpecialtyUpdateRequest,
} from "../types/specialty.types";

interface Options {
  signal?: AbortSignal;
}

export const specialtyApi = {
  list: (params: SpecialtyListParams, { signal }: Options = {}) =>
    apiClient.get<PageResult<Specialty>>("/specialties", {
      params: { ...params },
      signal,
    }),

  getById: (specialtyId: number, { signal }: Options = {}) =>
    apiClient.get<Specialty>(`/specialties/${specialtyId}`, { signal }),

  create: (body: SpecialtyCreateRequest) =>
    apiClient.post<Specialty>("/specialties", body),

  update: (specialtyId: number, body: SpecialtyUpdateRequest) =>
    apiClient.patch<Specialty>(`/specialties/${specialtyId}`, body),

  updateStatus: (specialtyId: number, body: SpecialtyStatusRequest) =>
    apiClient.patch<Specialty>(`/specialties/${specialtyId}/status`, body),
};
