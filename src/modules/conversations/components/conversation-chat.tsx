import { Alert, AlertDescription } from "@/components/ui/alert";
import { Can } from "@/modules/auth";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "@/i18n";
import { getPersonFullName } from "@/modules/persons";
import { useState } from "react";
import { useAssignments } from "../hooks/use-assignments";
import { useConversation } from "../hooks/use-conversation";
import { usePeople, useStaffMembers } from "../hooks/use-lookup";
import { useMessages } from "../hooks/use-messages";
import { conversationApi } from "../services/conversation-api";
import type { ConversationStatus } from "../types/conversation.types";
import { getConversationErrorMessage } from "../utils/conversation-error.utils";
import type { AssignmentNotice } from "./assignment-panel";
import { ConversationHeader } from "./conversation-header";
import { ConversationInfoPanel } from "./conversation-info-panel";
import { ConversationStatusDialog } from "./conversation-status-dialog";
import { MessageComposer } from "./message-composer";
import { MessageList } from "./message-list";

export type ChatNotice = AssignmentNotice | "closed" | "reopened";

interface ConversationChatProps {
  conversationId: number;
  onBack: () => void;
  /** Cambió el estado u otro dato que se ve en el listado. */
  onListChanged: () => void;
  onNotice: (notice: ChatNotice) => void;
}

/**
 * Zona central y panel de información de la conversación seleccionada. Se monta
 * con `key={conversationId}`, de modo que al cambiar de conversación se
 * descartan mensajes y asignaciones de la anterior.
 */
export function ConversationChat({
  conversationId,
  onBack,
  onListChanged,
  onNotice,
}: ConversationChatProps) {
  const t = useTranslations("conversations");
  const tErrors = useTranslations("conversations.errors");
  const detail = useConversation(conversationId);
  const messages = useMessages(conversationId);
  const assignments = useAssignments(conversationId);
  const conversation = detail.conversation;

  const people = usePeople(conversation ? [conversation.person_id] : []);
  const staff = useStaffMembers(
    assignments.active ? [assignments.active.staff_member_id] : [],
  );
  const person = conversation ? people[conversation.person_id] : undefined;
  const assignedMember = assignments.active
    ? staff[assignments.active.staff_member_id]
    : undefined;
  const assignedTo = assignments.isLoading
    ? undefined
    : assignments.active
      ? assignedMember
        ? getPersonFullName(assignedMember.person)
        : `#${assignments.active.staff_member_id}`
      : null;

  const [infoOpen, setInfoOpen] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [scrollToken, setScrollToken] = useState(0);
  const [statusTarget, setStatusTarget] = useState<ConversationStatus | null>(
    null,
  );
  const [isStatusPending, setIsStatusPending] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const refreshAll = () => {
    detail.reload();
    messages.refresh();
    assignments.reload();
    onListChanged();
  };

  const closeStatusDialog = () => {
    if (isStatusPending) return;
    setStatusTarget(null);
    setStatusError(null);
  };

  /**
   * Cierra o reabre mediante `PATCH …/status`. El backend termina la asignación
   * activa al cerrar y no asigna nada al reabrir: el frontend solo vuelve a
   * consultar las asignaciones y no ejecuta operaciones propias sobre ellas.
   */
  const confirmStatus = async () => {
    if (!statusTarget || isStatusPending) return;
    setIsStatusPending(true);
    setStatusError(null);
    try {
      const updated = await conversationApi.updateStatus(
        conversationId,
        statusTarget,
      );
      detail.confirm(updated);
      assignments.reload();
      onListChanged();
      onNotice(updated.status === "closed" ? "closed" : "reopened");
      setStatusTarget(null);
    } catch (caught) {
      setStatusError(getConversationErrorMessage(caught, tErrors));
    } finally {
      setIsStatusPending(false);
    }
  };

  if (detail.isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Spinner />
        {t("chat.loading")}
      </div>
    );
  }

  if (detail.error || !conversation) {
    return (
      <div className="flex-1 space-y-4 p-6">
        <Alert variant="destructive">
          <AlertDescription>
            {getConversationErrorMessage(detail.error, tErrors)}
          </AlertDescription>
        </Alert>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>
            {t("chat.backToList")}
          </Button>
          <Button variant="outline" onClick={detail.reload}>
            {t("chat.retry")}
          </Button>
        </div>
      </div>
    );
  }

  const info = (
    <ConversationInfoPanel
      conversation={conversation}
      assignments={assignments}
      onAssignmentNotice={(notice) => {
        onNotice(notice);
        onListChanged();
      }}
    />
  );

  return (
    <div className="flex min-h-0 flex-1">
      <div className="flex min-w-0 flex-1 flex-col">
        <ConversationHeader
          conversation={conversation}
          person={person}
          assignedTo={assignedTo}
          isRefreshing={messages.isLoading}
          onBack={onBack}
          onToggleInfo={() => setInfoOpen((open) => !open)}
          onOpenInfoSheet={() => setSheetOpen(true)}
          onRefresh={refreshAll}
          onChangeStatus={(status) => {
            setStatusError(null);
            setStatusTarget(status);
          }}
        />

        {conversation.status === "closed" && (
          <div className="border-b border-gray-100 px-4 py-2 text-xs text-gray-500 dark:border-white/5 dark:text-gray-400">
            {t("chat.closedNote")}
          </div>
        )}

        <MessageList
          messages={messages.messages}
          error={messages.error}
          isLoading={messages.isLoading}
          hasOlder={messages.hasOlder}
          isLoadingOlder={messages.isLoadingOlder}
          scrollToBottomToken={scrollToken}
          onLoadOlder={() => void messages.loadOlder()}
          onRetry={messages.refresh}
        />

        <Can permission="message.send">
          <MessageComposer
            disabled={conversation.status === "closed"}
            isSending={messages.isSending}
            onSend={messages.send}
            onSent={() => setScrollToken((token) => token + 1)}
          />
        </Can>
      </div>

      {infoOpen && (
        <aside className="hidden w-80 shrink-0 overflow-y-auto border-s border-gray-100 p-4 xl:block dark:border-white/5">
          {info}
        </aside>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="overflow-y-auto xl:hidden">
          <SheetHeader>
            <SheetTitle>{t("info.title")}</SheetTitle>
            <SheetDescription>{t("info.description")}</SheetDescription>
          </SheetHeader>
          {info}
        </SheetContent>
      </Sheet>

      <ConversationStatusDialog
        target={statusTarget}
        isPending={isStatusPending}
        error={statusError}
        onConfirm={() => void confirmStatus()}
        onClose={closeStatusDialog}
      />
    </div>
  );
}
