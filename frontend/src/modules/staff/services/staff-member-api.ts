import { apiClient, type PageResult } from "@/services/api";
import type {
  StaffMember,
  StaffMemberCreateRequest,
  StaffMemberListParams,
  StaffMemberStatusRequest,
  StaffMemberUpdateRequest,
} from "../types/staff-member.types";

interface Options {
  signal?: AbortSignal;
}

export const staffMemberApi = {
  list: (params: StaffMemberListParams, { signal }: Options = {}) =>
    apiClient.get<PageResult<StaffMember>>("/staff", {
      params: { ...params },
      signal,
    }),

  getById: (staffId: number, { signal }: Options = {}) =>
    apiClient.get<StaffMember>(`/staff/${staffId}`, { signal }),

  create: (body: StaffMemberCreateRequest) =>
    apiClient.post<StaffMember>("/staff", body),

  update: (staffId: number, body: StaffMemberUpdateRequest) =>
    apiClient.patch<StaffMember>(`/staff/${staffId}`, body),

  updateStatus: (staffId: number, body: StaffMemberStatusRequest) =>
    apiClient.patch<StaffMember>(`/staff/${staffId}/status`, body),
};
