export type MessageDirection = "inbound" | "outbound";
export type MessageSenderType = "person" | "ai" | "staff";
export type MessageDeliveryStatus =
  "received" | "queued" | "sent" | "delivered" | "read" | "failed";

/**
 * `MessageResponse` de OpenAPI. El backend entrega `direction`, `sender_type`
 * y `delivery_status` como `string`; se tipan con los valores de dominio.
 */
export interface Message {
  id: number;
  conversation_id: number;
  direction: MessageDirection;
  sender_type: MessageSenderType;
  /** Texto plano: siempre se renderiza como texto, nunca como HTML. */
  content: string;
  message_type: string;
  /** `null` mientras el proveedor no confirma el envío. */
  sent_at: string | null;
  delivery_status: MessageDeliveryStatus;
  external_message_id: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * `OutboundMessageCreateRequest`: solo contenido y remitente. El backend fija
 * dirección, estado de entrega, tipo y `sent_at`; `person` no es un remitente
 * admitido.
 */
export interface OutboundMessageCreateRequest {
  content: string;
  sender_type: Exclude<MessageSenderType, "person">;
}

/** Parámetros de `GET /conversations/{id}/messages` (`order` es cronológico). */
export interface MessageListParams {
  page: number;
  page_size: number;
  order?: "asc" | "desc";
  direction?: MessageDirection;
  sender_type?: MessageSenderType;
  delivery_status?: MessageDeliveryStatus;
}

export const MESSAGE_MAX_LENGTH = 4096;
