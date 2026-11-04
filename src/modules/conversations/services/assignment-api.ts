import { apiClient } from "@/services/api";
import type { ConversationAssignment } from "../types/assignment.types";

interface Options {
  signal?: AbortSignal;
}

/**
 * Asignaciones de conversaciones. `POST` sirve para asignar y para transferir
 * (el backend termina la anterior y crea la nueva en una sola transacción);
 * si el trabajador ya es el asignado activo devuelve la existente (200), lo
 * cual también es un éxito. No existe `DELETE`: las asignaciones se conservan.
 */
export const assignmentApi = {
  list: (conversationId: number, { signal }: Options = {}) =>
    apiClient.get<ConversationAssignment[]>(
      `/conversations/${conversationId}/assignments`,
      { signal },
    ),

  assign: (conversationId: number, staffMemberId: number) =>
    apiClient.post<ConversationAssignment>(
      `/conversations/${conversationId}/assignments`,
      { staff_member_id: staffMemberId },
    ),

  end: (assignmentId: number) =>
    apiClient.patch<ConversationAssignment>(
      `/conversation-assignments/${assignmentId}/end`,
      undefined,
    ),
};
