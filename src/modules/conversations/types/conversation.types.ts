/** Estados de la conversación (contrato actual: solo abierta o cerrada). */
export const CONVERSATION_STATUSES = ["open", "closed"] as const;
export type ConversationStatus = (typeof CONVERSATION_STATUSES)[number];

/** Canales habilitados por el backend. Se amplía aquí cuando se habiliten otros. */
export const CONVERSATION_CHANNELS = ["whatsapp"] as const;
export type ConversationChannel = (typeof CONVERSATION_CHANNELS)[number];

/**
 * `ConversationResponse` de OpenAPI. La conversación pertenece a una `person`
 * (no a un `patient`) y la respuesta no incluye datos de la persona ni mensajes.
 */
export interface Conversation {
  id: number;
  person_id: number;
  channel: ConversationChannel;
  status: ConversationStatus;
  /** `date-time` con zona (UTC). */
  started_at: string;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}

/** `ConversationCreateRequest`: el backend fija estado y fechas. */
export interface ConversationCreateRequest {
  person_id: number;
  channel: ConversationChannel;
}

/** Parámetros de `GET /conversations`. */
export interface ConversationListParams {
  page: number;
  page_size: number;
  person_id?: number;
  channel?: ConversationChannel;
  status?: ConversationStatus;
  started_from?: string;
  started_to?: string;
  sort_by?: "id" | "started_at";
  order?: "asc" | "desc";
}

export type ConversationStatusFilter = "all" | ConversationStatus;
export type ConversationChannelFilter = "all" | ConversationChannel;

export interface ConversationFilters {
  personId: number | null;
  channel: ConversationChannelFilter;
  status: ConversationStatusFilter;
}

/** Opción de persona o de trabajador para selectores. */
export interface EntityOption {
  id: number;
  label: string;
  description: string | null;
}

/** `AssignedConversationResponse`: conversación actualmente asignada a un trabajador. */
export interface AssignedConversation extends Conversation {
  assignment_id: number;
  assigned_at: string;
}
