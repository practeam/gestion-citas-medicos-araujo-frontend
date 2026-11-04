import { apiClient, type PageResult } from "@/services/api";
import type {
  Procedure,
  ProcedureCreateRequest,
  ProcedureListParams,
  ProcedureStatusRequest,
  ProcedureUpdateRequest,
} from "../types/procedure.types";

interface Options {
  signal?: AbortSignal;
}

/** `/procedures`. No existe `DELETE`: los procedimientos se desactivan con `/status`. */
export const procedureApi = {
  list: (params: ProcedureListParams, { signal }: Options = {}) =>
    apiClient.get<PageResult<Procedure>>("/procedures", {
      params: { ...params },
      signal,
    }),

  getById: (procedureId: number, { signal }: Options = {}) =>
    apiClient.get<Procedure>(`/procedures/${procedureId}`, { signal }),

  create: (body: ProcedureCreateRequest) =>
    apiClient.post<Procedure>("/procedures", body),

  update: (procedureId: number, body: ProcedureUpdateRequest) =>
    apiClient.patch<Procedure>(`/procedures/${procedureId}`, body),

  updateStatus: (procedureId: number, body: ProcedureStatusRequest) =>
    apiClient.patch<Procedure>(`/procedures/${procedureId}/status`, body),
};
