import { useLocale, useTranslations } from "@/i18n";
import { cn } from "@/utils";
import type { Message, MessageDeliveryStatus } from "../types/message.types";
import { formatTime } from "../utils/conversation-datetime.utils";
import { getMessageTimestamp } from "../utils/message.utils";

const DELIVERY_SYMBOLS: Record<
  Exclude<MessageDeliveryStatus, "received">,
  { symbol: string; className: string }
> = {
  queued: { symbol: "◷", className: "text-gray-400" },
  sent: { symbol: "✓", className: "text-gray-500" },
  delivered: { symbol: "✓✓", className: "text-gray-500" },
  read: { symbol: "✓✓", className: "text-brand-500" },
  failed: { symbol: "!", className: "font-bold text-red-500" },
};

/**
 * Estado de entrega tal como lo informa el backend (no se simula ni se cambia
 * desde la interfaz). Los entrantes (`received`) no muestran indicador. Lleva
 * texto accesible además del símbolo.
 */
export function MessageDeliveryIndicator({
  status,
}: {
  status: MessageDeliveryStatus;
}) {
  const t = useTranslations("conversations.messages.delivery");
  if (status === "received") return null;
  const config = DELIVERY_SYMBOLS[status];
  if (!config) return null;

  return (
    <span
      className={cn("text-xs leading-none", config.className)}
      title={t(status)}
    >
      <span aria-hidden>{config.symbol}</span>
      <span className="sr-only">{t(status)}</span>
    </span>
  );
}

export function MessageBubble({ message }: { message: Message }) {
  const t = useTranslations("conversations.messages");
  const locale = useLocale();
  const outbound = message.direction === "outbound";
  const timestamp = getMessageTimestamp(message);
  const sender = t(`sender.${message.sender_type}`);

  return (
    <div className={cn("flex", outbound ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm shadow-theme-xs sm:max-w-[70%]",
          outbound
            ? "rounded-br-sm bg-brand-500 text-white"
            : "rounded-bl-sm bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-white/90",
          message.delivery_status === "failed" &&
            "bg-red-50 text-red-800 dark:bg-red-500/15 dark:text-red-300",
        )}
      >
        <p
          className={cn(
            "mb-0.5 text-[11px] font-medium opacity-80",
            message.delivery_status === "failed" && "opacity-100",
          )}
        >
          {sender}
        </p>
        {/* Texto plano: React lo escapa; nunca se interpreta como HTML. */}
        <p className="break-words whitespace-pre-wrap">{message.content}</p>
        <div className="mt-1 flex items-center justify-end gap-1.5 text-[11px] opacity-80">
          <time
            dateTime={timestamp}
            title={message.sent_at ? undefined : t("notConfirmed")}
          >
            {formatTime(timestamp, locale)}
          </time>
          {outbound && (
            <MessageDeliveryIndicator status={message.delivery_status} />
          )}
        </div>
        {message.delivery_status === "failed" && (
          <p className="mt-1 text-xs font-medium">{t("failedNote")}</p>
        )}
      </div>
    </div>
  );
}
