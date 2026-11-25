import { apiClient, type CursorPage, type PageResult } from "@/services/api";
import type {
  AssignedConversation,
  Conversation,
  ConversationCreateRequest,
  ConversationListParams,
  ConversationStatus,
  InboxItem,
  InboxParams,
} from "../types/conversation.types";

interface Options {
  signal?: AbortSignal;
}

/**
 * `/conversations`. No existe `DELETE`: las conversaciones se cierran o
 * reabren con `/status`; el backend termina la asignación activa al cerrar.
 */
export const conversationApi = {
  /**
   * Bandeja de atención. Sin `cursor` devuelve la actividad de las últimas 24 h
   * (más reciente primero); `next_cursor` permite retroceder.
   */
  inbox: (params: InboxParams, { signal }: Options = {}) =>
    apiClient.get<CursorPage<InboxItem>>("/conversations/inbox", {
      params: { ...params },
      signal,
    }),

  list: (params: ConversationListParams, { signal }: Options = {}) =>
    apiClient.get<PageResult<Conversation>>("/conversations", {
      params: { ...params },
      signal,
    }),

  getById: (conversationId: number, { signal }: Options = {}) =>
    apiClient.get<Conversation>(`/conversations/${conversationId}`, { signal }),

  create: (body: ConversationCreateRequest) =>
    apiClient.post<Conversation>("/conversations", body),

  updateStatus: (conversationId: number, status: ConversationStatus) =>
    apiClient.patch<Conversation>(`/conversations/${conversationId}/status`, {
      status,
    }),

  listByPerson: (
    personId: number,
    params: Omit<ConversationListParams, "person_id">,
    { signal }: Options = {},
  ) =>
    apiClient.get<PageResult<Conversation>>(
      `/persons/${personId}/conversations`,
      { params: { ...params }, signal },
    ),

  /** Conversaciones actualmente asignadas a un trabajador (base de una vista personal futura). */
  listByStaffMember: (
    staffMemberId: number,
    params: {
      page: number;
      page_size: number;
      status?: ConversationStatus;
      channel?: Conversation["channel"];
    },
    { signal }: Options = {},
  ) =>
    apiClient.get<PageResult<AssignedConversation>>(
      `/staff-members/${staffMemberId}/conversations`,
      { params: { ...params }, signal },
    ),
};
