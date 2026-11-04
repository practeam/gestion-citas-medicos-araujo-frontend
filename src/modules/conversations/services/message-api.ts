import { apiClient, type PageResult } from "@/services/api";
import type {
  Message,
  MessageListParams,
  OutboundMessageCreateRequest,
} from "../types/message.types";

interface Options {
  signal?: AbortSignal;
}

/**
 * Mensajes de una conversación. Registrar un mensaje lo deja en cola en el
 * backend; no lo envía a ningún proveedor. `PATCH /messages/{id}/delivery-status`
 * es del proveedor/webhooks: la interfaz no lo usa y los mensajes no se editan
 * ni se eliminan.
 */
export const messageApi = {
  list: (
    conversationId: number,
    params: MessageListParams,
    { signal }: Options = {},
  ) =>
    apiClient.get<PageResult<Message>>(
      `/conversations/${conversationId}/messages`,
      { params: { ...params }, signal },
    ),

  getById: (
    conversationId: number,
    messageId: number,
    { signal }: Options = {},
  ) =>
    apiClient.get<Message>(
      `/conversations/${conversationId}/messages/${messageId}`,
      { signal },
    ),

  create: (conversationId: number, body: OutboundMessageCreateRequest) =>
    apiClient.post<Message>(`/conversations/${conversationId}/messages`, body),
};
