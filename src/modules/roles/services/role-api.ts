import { apiClient, type PageResult } from "@/services/api";
import type {
  Role,
  RoleCreateRequest,
  RoleListParams,
  RoleStatusRequest,
  RoleUpdateRequest,
} from "../types/role.types";

interface Options {
  signal?: AbortSignal;
}

export const roleApi = {
  list: (params: RoleListParams, { signal }: Options = {}) =>
    apiClient.get<PageResult<Role>>("/roles", {
      params: { ...params },
      signal,
    }),

  getById: (roleId: number, { signal }: Options = {}) =>
    apiClient.get<Role>(`/roles/${roleId}`, { signal }),

  create: (body: RoleCreateRequest) => apiClient.post<Role>("/roles", body),

  update: (roleId: number, body: RoleUpdateRequest) =>
    apiClient.patch<Role>(`/roles/${roleId}`, body),

  updateStatus: (roleId: number, body: RoleStatusRequest) =>
    apiClient.patch<Role>(`/roles/${roleId}/status`, body),
};
