import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useLocale, useTranslations } from "@/i18n";
import { Fragment, useLayoutEffect, useRef } from "react";
import type { Message } from "../types/message.types";
import { dayKey, formatDay } from "../utils/conversation-datetime.utils";
import { getConversationErrorMessage } from "../utils/conversation-error.utils";
import { getMessageTimestamp } from "../utils/message.utils";
import { MessageBubble } from "./message-bubble";

/** Distancia (px) al final a partir de la cual se considera que se está leyendo mensajes anteriores. */
const NEAR_BOTTOM_PX = 80;

interface MessageListProps {
  messages: Message[];
  error: unknown;
  isLoading: boolean;
  hasOlder: boolean;
  isLoadingOlder: boolean;
  /** Cambia cuando se debe volver al último mensaje (p. ej. tras enviar uno). */
  scrollToBottomToken: number;
  onLoadOlder: () => void;
  onRetry: () => void;
}

/**
 * Historial cronológico con separadores de fecha. Abre en el mensaje más
 * reciente, baja al enviar uno nuevo y no fuerza el desplazamiento si el
 * usuario está revisando mensajes anteriores. Al cargar mensajes anteriores se
 * conserva la posición de lectura.
 */
export function MessageList({
  messages,
  error,
  isLoading,
  hasOlder,
  isLoadingOlder,
  scrollToBottomToken,
  onLoadOlder,
  onRetry,
}: MessageListProps) {
  const t = useTranslations("conversations.messages");
  const tErrors = useTranslations("conversations.errors");
  const locale = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const prependHeight = useRef<number | null>(null);
  const lastToken = useRef(scrollToBottomToken);

  useLayoutEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    if (lastToken.current !== scrollToBottomToken) {
      lastToken.current = scrollToBottomToken;
      stickToBottom.current = true;
    }
    if (prependHeight.current !== null) {
      // Mensajes anteriores añadidos arriba: se mantiene la posición de lectura.
      element.scrollTop += element.scrollHeight - prependHeight.current;
      prependHeight.current = null;
    } else if (stickToBottom.current) {
      element.scrollTop = element.scrollHeight;
    }
  }, [messages, scrollToBottomToken]);

  const handleScroll = () => {
    const element = containerRef.current;
    if (!element) return;
    stickToBottom.current =
      element.scrollHeight - element.scrollTop - element.clientHeight <
      NEAR_BOTTOM_PX;
  };

  const loadOlder = () => {
    const element = containerRef.current;
    if (element) prependHeight.current = element.scrollHeight;
    onLoadOlder();
  };

  if (error && messages.length === 0) {
    return (
      <div className="flex-1 space-y-3 p-4">
        <Alert variant="destructive">
          <AlertDescription>
            {getConversationErrorMessage(error, tErrors)}
          </AlertDescription>
        </Alert>
        <Button variant="outline" size="sm" onClick={onRetry}>
          {t("retry")}
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Spinner />
        {t("loading")}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 space-y-2 overflow-y-auto px-3 py-4 sm:px-5"
      role="log"
      aria-label={t("historyLabel")}
    >
      {hasOlder && (
        <div className="flex justify-center pb-2">
          <Button
            type="button"
            variant="outline"
            size="xs"
            disabled={isLoadingOlder}
            onClick={loadOlder}
          >
            {isLoadingOlder && <Spinner />}
            {t("loadOlder")}
          </Button>
        </div>
      )}

      {error !== undefined && error !== null && (
        <Alert variant="destructive">
          <AlertDescription>
            {getConversationErrorMessage(error, tErrors)}
          </AlertDescription>
        </Alert>
      )}

      {messages.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
          {t("empty")}
        </p>
      ) : (
        messages.map((message, index) => {
          const timestamp = getMessageTimestamp(message);
          const previous = messages[index - 1];
          const newDay =
            !previous ||
            dayKey(getMessageTimestamp(previous)) !== dayKey(timestamp);
          return (
            <Fragment key={message.id}>
              {newDay && (
                <div className="flex justify-center py-2">
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500 dark:bg-white/10 dark:text-gray-400">
                    {formatDay(timestamp, locale)}
                  </span>
                </div>
              )}
              <MessageBubble message={message} />
            </Fragment>
          );
        })
      )}
    </div>
  );
}
