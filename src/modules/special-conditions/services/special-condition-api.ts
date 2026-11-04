import { apiClient, type PageResult } from "@/services/api";
import type {
  SpecialCondition,
  SpecialConditionCreateRequest,
  SpecialConditionListParams,
  SpecialConditionStatusRequest,
  SpecialConditionUpdateRequest,
} from "../types/special-condition.types";

interface Options {
  signal?: AbortSignal;
}

export const specialConditionApi = {
  list: (params: SpecialConditionListParams, { signal }: Options = {}) =>
    apiClient.get<PageResult<SpecialCondition>>("/special-conditions", {
      params: { ...params },
      signal,
    }),

  getById: (specialConditionId: number, { signal }: Options = {}) =>
    apiClient.get<SpecialCondition>(
      `/special-conditions/${specialConditionId}`,
      { signal },
    ),

  create: (body: SpecialConditionCreateRequest) =>
    apiClient.post<SpecialCondition>("/special-conditions", body),

  update: (specialConditionId: number, body: SpecialConditionUpdateRequest) =>
    apiClient.patch<SpecialCondition>(
      `/special-conditions/${specialConditionId}`,
      body,
    ),

  updateStatus: (
    specialConditionId: number,
    body: SpecialConditionStatusRequest,
  ) =>
    apiClient.patch<SpecialCondition>(
      `/special-conditions/${specialConditionId}/status`,
      body,
    ),
};
