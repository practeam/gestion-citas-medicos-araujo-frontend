export const MESSAGE_TYPES = [
  "text",
  "image",
  "audio",
  "document",
  "template",
  "unsupported",
] as const;
export type MessageType = (typeof MESSAGE_TYPES)[number];

export type MessageDirection = "inbound" | "outbound";
export type MessageSenderType = "person" | "ai" | "staff";
export type MessageDeliveryStatus =
  "received" | "queued" | "sent" | "delivered" | "read" | "failed";

/**
 * `MessageMediaResponse`: metadatos del adjunto. El archivo se descarga con
 * `GET .../messages/{id}/media`; `is_stored = false` indica que aún no está
 * guardado (descarga pendiente o fallida).
 */
export interface MessageMedia {
  id: number;
  mime_type: string;
  file_name: string | null;
  file_size_bytes: number | null;
  is_stored: boolean;
}

/**
 * `MessageResponse` de OpenAPI. El backend entrega `direction`, `sender_type`,
 * `message_type` y `delivery_status` como `string`; se tipan con los valores
 * de dominio.
 */
export interface Message {
  id: number;
  conversation_id: number;
  direction: MessageDirection;
  sender_type: MessageSenderType;
  /** Texto plano: siempre se renderiza como texto, nunca como HTML. */
  content: string;
  message_type: MessageType;
  /** Adjunto de imagen, audio o documento; `null` en el resto. */
  media: MessageMedia | null;
  /** `null` mientras el proveedor no confirma el envío. */
  sent_at: string | null;
  delivery_status: MessageDeliveryStatus;
  external_message_id: string | null;
  created_at: string;
  updated_at: string;
}

/** `TemplateMessageRequest`: plantilla aprobada en Meta. */
export interface TemplateMessageRequest {
  /** Minúsculas, números y guion bajo (`^[a-z0-9_]{1,512}$`). */
  template_name: string;
  /** Código de idioma, p. ej. `es` o `es_PE` (`^[a-z]{2,3}(_[A-Z]{2})?$`). */
  language_code: string;
  /** Formato de la Graph API (parámetros del cuerpo, etc.); máx. 10. */
  components?: Record<string, unknown>[];
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
export const CAPTION_MAX_LENGTH = 1024;
export const TEMPLATE_NAME_PATTERN = /^[a-z0-9_]{1,512}$/;
export const TEMPLATE_LANGUAGE_PATTERN = /^[a-z]{2,3}(_[A-Z]{2})?$/;

export type MediaKind = "image" | "audio" | "document";

/** Tipos de archivo y tamaños máximos admitidos por WhatsApp (spec 26). */
export const MEDIA_RULES: Record<
  MediaKind,
  { mimes: readonly string[]; maxBytes: number }
> = {
  image: {
    mimes: ["image/jpeg", "image/png", "image/webp"],
    maxBytes: 5 * 1024 * 1024,
  },
  audio: {
    mimes: ["audio/aac", "audio/amr", "audio/mpeg", "audio/mp4", "audio/ogg"],
    maxBytes: 16 * 1024 * 1024,
  },
  document: {
    mimes: [
      "text/plain",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ],
    maxBytes: 100 * 1024 * 1024,
  },
};
