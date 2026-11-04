import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "@/i18n";
import { getFieldErrors, isApiError } from "@/services/api";
import { useState } from "react";
import { conversationApi } from "../services/conversation-api";
import {
  CONVERSATION_CHANNELS,
  type Conversation,
  type ConversationChannel,
} from "../types/conversation.types";
import { getConversationErrorMessage } from "../utils/conversation-error.utils";
import { EntitySelector } from "./entity-selector";

interface ConversationCreateModalProps {
  open: boolean;
  onClose: () => void;
  /** Tras la confirmación de la API: abrir la conversación creada y refrescar el listado. */
  onCreated: (conversation: Conversation) => void;
}

/**
 * Crea una conversación interna para una persona existente (no tiene que ser
 * paciente) y un canal habilitado. No envía fechas ni estado (los fija el
 * backend), no crea personas ni llama a proveedores externos. Un error no se
 * reintenta automáticamente, para no duplicar conversaciones.
 */
export function ConversationCreateModal({
  open,
  onClose,
  onCreated,
}: ConversationCreateModalProps) {
  const t = useTranslations("conversations.create");

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        {open && <CreateForm onClose={onClose} onCreated={onCreated} />}
      </DialogContent>
    </Dialog>
  );
}

function CreateForm({
  onClose,
  onCreated,
}: Omit<ConversationCreateModalProps, "open">) {
  const t = useTranslations("conversations.create");
  const tChannel = useTranslations("conversations.channel");
  const tErrors = useTranslations("conversations.errors");
  const [personId, setPersonId] = useState<number | null>(null);
  const [personLabel, setPersonLabel] = useState<string | null>(null);
  const [channel, setChannel] = useState<ConversationChannel>(
    CONVERSATION_CHANNELS[0],
  );
  const [error, setError] = useState<string | null>(null);
  const [personError, setPersonError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const submit = async () => {
    if (isPending) return;
    setError(null);
    if (personId === null) {
      setPersonError(t("personRequired"));
      return;
    }
    setPersonError(null);
    setIsPending(true);
    try {
      const created = await conversationApi.create({
        person_id: personId,
        channel,
      });
      onCreated(created);
    } catch (caught) {
      const fieldErrors =
        isApiError(caught) && caught.status === 422
          ? getFieldErrors(caught.details)
          : {};
      if (fieldErrors.person_id) setPersonError(fieldErrors.person_id);
      else setError(getConversationErrorMessage(caught, tErrors));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-5">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <section className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
          {t("personSection")}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {t("personHint")}
        </p>
        {personId !== null && (
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {t("selectedPerson")}:{" "}
            <strong>{personLabel ?? `#${personId}`}</strong>
          </p>
        )}
        <EntitySelector
          kind="person"
          value={personId}
          disabled={isPending}
          onSelect={(option) => {
            setPersonId(option.id);
            setPersonLabel(option.label);
            setPersonError(null);
          }}
        />
        {personError && <p className="text-xs text-red-500">{personError}</p>}
      </section>

      <section className="space-y-3 border-t border-gray-100 pt-4 dark:border-gray-800">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
          {t("channelSection")}
        </h4>
        <div className="flex flex-wrap gap-2">
          {CONVERSATION_CHANNELS.map((option) => (
            <Button
              key={option}
              type="button"
              variant={channel === option ? "default" : "outline"}
              aria-pressed={channel === option}
              disabled={isPending}
              onClick={() => setChannel(option)}
            >
              {tChannel(option)}
            </Button>
          ))}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {t("internalNote")}
        </p>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="outline" disabled={isPending} onClick={onClose}>
          {t("cancel")}
        </Button>
        <Button disabled={isPending} onClick={() => void submit()}>
          {isPending && <Spinner />}
          {isPending ? t("creating") : t("submit")}
        </Button>
      </div>
    </div>
  );
}
