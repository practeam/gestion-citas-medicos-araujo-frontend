/**
 * `AssignmentResponse` de OpenAPI. Una asignación con `ended_at = null` es la
 * activa; la API no devuelve datos del trabajador, solo su id.
 */
export interface ConversationAssignment {
  id: number;
  conversation_id: number;
  staff_member_id: number;
  assigned_at: string;
  ended_at: string | null;
}

/** `AssignmentCreateRequest`: solo el trabajador; la conversación va en la ruta. */
export interface AssignConversationRequest {
  staff_member_id: number;
}
