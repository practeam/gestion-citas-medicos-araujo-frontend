import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "@/i18n";
import { useState } from "react";
import type { SendResult } from "../hooks/use-messages";
import { MESSAGE_MAX_LENGTH } from "../types/message.types";
import { getConversationErrorMessage } from "../utils/conversation-error.utils";
import { isBlank } from "../utils/message.utils";

interface MessageComposerProps {
  /** Conversación cerrada u otra causa: el historial es de solo lectura. */
  disabled: boolean;
  isSending: boolean;
  onSend: (content: string) => Promise<SendResult>;
  /** Tras registrar el mensaje (volver al último mensaje). */
  onSent: () => void;
}

/**
 * Compositor de texto. Enter envía y Shift+Enter inserta un salto de línea.
 * Valida contenido no vacío y ≤ 4096 caracteres (el texto no se recorta al
 * enviar). Si falla el envío conserva el texto; mientras se envía bloquea
 * reenvíos. No ofrece adjuntos: el backend solo admite texto.
 */
export function MessageComposer({
  disabled,
  isSending,
  onSend,
  onSent,
}: MessageComposerProps) {
  const t = useTranslations("conversations.composer");
  const tErrors = useTranslations("conversations.errors");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const tooLong = content.length > MESSAGE_MAX_LENGTH;

  const submit = async () => {
    if (disabled || isSending) return;
    setNotice(null);
    if (isBlank(content)) {
      setError(t("empty"));
      return;
    }
    if (tooLong) {
      setError(t("tooLong", { max: MESSAGE_MAX_LENGTH }));
      return;
    }
    setError(null);
    const result = await onSend(content);
    if (result.ok) {
      setContent("");
      if (result.recovered) setNotice(t("recovered"));
      onSent();
    } else {
      // El texto se conserva para poder reintentar.
      setError(getConversationErrorMessage(result.error, tErrors));
    }
  };

  if (disabled) {
    return (
      <div className="border-t border-gray-100 p-3 text-center text-sm text-gray-500 dark:border-white/5 dark:text-gray-400">
        {t("closed")}
      </div>
    );
  }

  return (
    <div className="space-y-2 border-t border-gray-100 p-3 dark:border-white/5">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {notice && (
        <Alert variant="info">
          <AlertDescription>{notice}</AlertDescription>
        </Alert>
      )}
      <div className="flex items-end gap-2">
        <Textarea
          value={content}
          rows={2}
          disabled={isSending}
          placeholder={t("placeholder")}
          aria-label={t("label")}
          aria-invalid={tooLong ? "true" : undefined}
          className="max-h-40 min-h-12 flex-1 resize-none"
          onChange={(event) => {
            setContent(event.target.value);
            setError(null);
          }}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing
            ) {
              event.preventDefault();
              void submit();
            }
          }}
        />
        <Button
          type="button"
          disabled={isSending || tooLong}
          onClick={() => void submit()}
        >
          {isSending && <Spinner />}
          {isSending ? t("sending") : t("send")}
        </Button>
      </div>
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{t("hint")}</span>
        <span className={tooLong ? "text-red-500" : undefined}>
          {content.length}/{MESSAGE_MAX_LENGTH}
        </span>
      </div>
    </div>
  );
}
