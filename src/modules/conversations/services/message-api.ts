import { apiClient, type CursorPage, type PageResult } from "@/services/api";
import type {
  Message,
  MessageListParams,
  OutboundMessageCreateRequest,
  TemplateMessageRequest,
} from "../types/message.types";

interface Options {
  signal?: AbortSignal;
}

/**
 * Mensajes de una conversación. El envío (texto, archivo o plantilla) lo
 * realiza el backend por WhatsApp: 201 devuelve el mensaje ya registrado
 * (`queued`/`sent`) y los cambios de entrega llegan por el webhook del
 * proveedor. `PATCH /messages/{id}/delivery-status` no lo usa la interfaz; los
 * mensajes no se editan ni se eliminan.
 */
export const messageApi = {
  /**
   * Historial por cursor: sin `cursor`, últimas 24 h; con `next_cursor`, más
   * antiguos. Cada página viene en orden cronológico.
   */
  history: (
    conversationId: number,
    params: { limit?: number; cursor?: string },
    { signal }: Options = {},
  ) =>
    apiClient.get<CursorPage<Message>>(
      `/conversations/${conversationId}/history`,
      { params: { ...params }, signal },
    ),

  /** `multipart/form-data` con `file` y `caption` opcional (no aplica a audios). */
  sendMedia: (conversationId: number, file: File, caption?: string) => {
    const form = new FormData();
    form.append("file", file);
    if (caption) form.append("caption", caption);
    return apiClient.post<Message>(
      `/conversations/${conversationId}/messages/media`,
      form,
    );
  },

  /** Plantilla aprobada: se admite también fuera de la ventana de 24 h. */
  sendTemplate: (conversationId: number, body: TemplateMessageRequest) =>
    apiClient.post<Message>(
      `/conversations/${conversationId}/messages/template`,
      body,
    ),

  /** Binario del adjunto (requiere el token: no puede usarse como `src` directo). */
  downloadMedia: (
    conversationId: number,
    messageId: number,
    { signal }: Options = {},
  ) =>
    apiClient.blob(
      `/conversations/${conversationId}/messages/${messageId}/media`,
      { signal },
    ),

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
