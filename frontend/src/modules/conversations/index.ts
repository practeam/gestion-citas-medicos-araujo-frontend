export { default as ConversationsPage } from "./pages/conversations-page";

// API pública para otros módulos: consulta de conversaciones asignadas a un trabajador
export { conversationApi } from "./services/conversation-api";
export type {
  AssignedConversation,
  Conversation,
} from "./types/conversation.types";
