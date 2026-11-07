import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useLocale, useTranslations } from "@/i18n";
import { useEffect, useMemo, useRef, useState } from "react";
import type { SendResult } from "../hooks/use-messages";
import {
  CAPTION_MAX_LENGTH,
  MESSAGE_MAX_LENGTH,
  type TemplateMessageRequest,
} from "../types/message.types";
import { formatDateTime } from "../utils/conversation-datetime.utils";
import { getConversationErrorMessage } from "../utils/conversation-error.utils";
import {
  MEDIA_ACCEPT,
  formatFileSize,
  validateMediaFile,
} from "../utils/media.utils";
import { isBlank } from "../utils/message.utils";
import type { ReplyWindow } from "../utils/reply-window.utils";
import { TemplateDialog } from "./template-dialog";

interface MessageComposerProps {
  /** Conversación cerrada u otra causa: el historial es de solo lectura. */
  disabled: boolean;
  /** Ventana de respuesta de 24 h: cerrada, solo se pueden enviar plantillas. */
  replyWindow: ReplyWindow;
  isSending: boolean;
  onSend: (content: string) => Promise<SendResult>;
  onSendMedia: (file: File, caption?: string) => Promise<SendResult>;
  onSendTemplate: (body: TemplateMessageRequest) => Promise<SendResult>;
  /** Tras registrar el mensaje (volver al último mensaje). */
  onSent: () => void;
}

/**
 * Compositor: texto (Enter envía, Mayús+Enter salto de línea), archivo adjunto
 * con vista previa y pie opcional, y plantillas. Con la ventana de 24 h cerrada
 * solo queda la plantilla. Si falla el envío conserva el contenido; mientras se
 * envía bloquea reenvíos.
 */
export function MessageComposer({
  disabled,
  replyWindow,
  isSending,
  onSend,
  onSendMedia,
  onSendTemplate,
  onSent,
}: MessageComposerProps) {
  const t = useTranslations("conversations.composer");
  const tMedia = useTranslations("conversations.media");
  const tErrors = useTranslations("conversations.errors");
  const locale = useLocale();
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [templateOpen, setTemplateOpen] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const validation = useMemo(
    () => (file ? validateMediaFile(file) : null),
    [file],
  );
  const isAudio = validation?.kind === "audio";
  const limit = file ? CAPTION_MAX_LENGTH : MESSAGE_MAX_LENGTH;
  const tooLong = content.length > limit;

  // Vista previa de imagen; se libera al cambiar o quitar el archivo.
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!file || validation?.kind !== "image") return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
      setPreviewUrl(null);
    };
  }, [file, validation?.kind]);

  const clearFile = () => {
    setFile(null);
    if (fileInput.current) fileInput.current.value = "";
  };

  const pickFile = (picked: File | undefined) => {
    setError(null);
    if (!picked) return;
    const result = validateMediaFile(picked);
    if (result.error) {
      setFile(null);
      setError(tMedia(`validation.${result.error}`));
      if (fileInput.current) fileInput.current.value = "";
      return;
    }
    setFile(picked);
    if (result.kind === "audio") setContent("");
  };

  const submit = async () => {
    if (disabled || isSending || !replyWindow.open) return;
    setNotice(null);

    if (file) {
      if (!validation || validation.error) return;
      if (tooLong) {
        setError(t("captionTooLong", { max: CAPTION_MAX_LENGTH }));
        return;
      }
      setError(null);
      const result = await onSendMedia(
        file,
        isAudio || isBlank(content) ? undefined : content,
      );
      if (result.ok) {
        setContent("");
        clearFile();
        onSent();
      } else {
        // Archivo y pie se conservan para poder reintentar.
        setError(getConversationErrorMessage(result.error, tErrors));
      }
      return;
    }

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

  const canType = replyWindow.open;

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

      {!canType && (
        <Alert variant="warning">
          <AlertDescription className="flex flex-wrap items-center justify-between gap-2">
            <span>
              {replyWindow.expiresAt
                ? t("windowClosedAt", {
                    date: formatDateTime(replyWindow.expiresAt, locale),
                  })
                : t("windowNeverOpened")}
            </span>
            <Button
              type="button"
              size="xs"
              disabled={isSending}
              onClick={() => setTemplateOpen(true)}
            >
              {t("sendTemplate")}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {file && validation && (
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-2 text-sm dark:border-white/10">
          {previewUrl && (
            <img
              src={previewUrl}
              alt=""
              className="size-12 rounded object-cover"
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-gray-800 dark:text-white/90">
              {file.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatFileSize(file.size)}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="xs"
            disabled={isSending}
            onClick={clearFile}
          >
            {tMedia("remove")}
          </Button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <input
          ref={fileInput}
          type="file"
          accept={MEDIA_ACCEPT}
          className="hidden"
          onChange={(event) => pickFile(event.target.files?.[0])}
        />
        <Button
          type="button"
          variant="outline"
          disabled={isSending || !canType}
          aria-label={tMedia("attach")}
          title={tMedia("attach")}
          onClick={() => fileInput.current?.click()}
        >
          📎
        </Button>
        <Textarea
          value={content}
          rows={2}
          disabled={isSending || !canType || isAudio}
          placeholder={
            isAudio
              ? t("noCaptionForAudio")
              : file
                ? t("captionPlaceholder")
                : t("placeholder")
          }
          aria-label={file ? t("captionLabel") : t("label")}
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
          disabled={isSending || tooLong || !canType}
          onClick={() => void submit()}
        >
          {isSending && <Spinner />}
          {isSending ? t("sending") : t("send")}
        </Button>
        {canType && (
          <Button
            type="button"
            variant="outline"
            disabled={isSending}
            onClick={() => setTemplateOpen(true)}
          >
            {t("template")}
          </Button>
        )}
      </div>
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{t("hint")}</span>
        <span className={tooLong ? "text-red-500" : undefined}>
          {content.length}/{limit}
        </span>
      </div>

      <TemplateDialog
        open={templateOpen}
        isSending={isSending}
        onClose={() => setTemplateOpen(false)}
        onSend={onSendTemplate}
        onSent={onSent}
      />
    </div>
  );
}
