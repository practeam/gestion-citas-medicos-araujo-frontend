import { apiClient, type PageResult } from "@/services/api";
import type {
  Person,
  PersonCreateRequest,
  PersonListParams,
  PersonStatusRequest,
  PersonUpdateRequest,
} from "../types/person.types";

interface Options {
  signal?: AbortSignal;
}

export const personApi = {
  list: (params: PersonListParams, { signal }: Options = {}) =>
    apiClient.get<PageResult<Person>>("/persons", {
      params: { ...params },
      signal,
    }),

  getById: (personId: number, { signal }: Options = {}) =>
    apiClient.get<Person>(`/persons/${personId}`, { signal }),

  create: (body: PersonCreateRequest) =>
    apiClient.post<Person>("/persons", body),

  update: (personId: number, body: PersonUpdateRequest) =>
    apiClient.patch<Person>(`/persons/${personId}`, body),

  updateStatus: (personId: number, body: PersonStatusRequest) =>
    apiClient.patch<Person>(`/persons/${personId}/status`, body),
};
