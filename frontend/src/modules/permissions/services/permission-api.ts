import { apiClient, type PageResult } from "@/services/api";
import type {
  Permission,
  PermissionCreateRequest,
  PermissionListParams,
  PermissionStatusRequest,
  PermissionUpdateRequest,
} from "../types/permission.types";

interface Options {
  signal?: AbortSignal;
}

export const permissionApi = {
  list: (params: PermissionListParams, { signal }: Options = {}) =>
    apiClient.get<PageResult<Permission>>("/permissions", {
      params: { ...params },
      signal,
    }),

  getById: (permissionId: number, { signal }: Options = {}) =>
    apiClient.get<Permission>(`/permissions/${permissionId}`, { signal }),

  create: (body: PermissionCreateRequest) =>
    apiClient.post<Permission>("/permissions", body),

  updateDescription: (permissionId: number, body: PermissionUpdateRequest) =>
    apiClient.patch<Permission>(`/permissions/${permissionId}`, body),

  updateStatus: (permissionId: number, body: PermissionStatusRequest) =>
    apiClient.patch<Permission>(`/permissions/${permissionId}/status`, body),
};
