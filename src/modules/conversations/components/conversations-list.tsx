import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useLocale, useTranslations } from "@/i18n";
import type { InboxItem } from "../types/conversation.types";
import { formatListDate } from "../utils/conversation-datetime.utils";
import { getConversationErrorMessage } from "../utils/conversation-error.utils";
import { ConversationStatusBadge } from "./conversation-badges";

interface ConversationsListProps {
  items: InboxItem[];
  error: unknown;
  isLoading: boolean;
  hasFilters: boolean;
  hasMore: boolean;
  isLoadingMore: boolean;
  selectedId: number | null;
  onSelect: (conversationId: number) => void;
  onLoadMore: () => void;
  onRetry: () => void;
}

function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase() || "?"
  );
}

/** Texto de la vista previa: el contenido, o una etiqueta si el último mensaje es un archivo o una plantilla. */
function usePreview() {
  const t = useTranslations("conversations.list.preview");
  return (item: InboxItem): string => {
    const last = item.last_message;
    if (!last) return t("none");
    const prefix = last.direction === "outbound" ? `${t("you")}: ` : "";
    switch (last.message_type) {
      case "image":
      case "audio":
      case "document":
        return `${prefix}${last.content || t(last.message_type)}`;
      case "template":
        return `${prefix}${last.content || t("template")}`;
      case "unsupported":
        return t("unsupported");
      default:
        return `${prefix}${last.content}`;
    }
  };
}

/**
 * Bandeja lateral (`GET /conversations/inbox`): contacto, teléfono, vista
 * previa del último mensaje, hora, estado, asignación y ventana de respuesta.
 * Muestra la actividad de las últimas 24 h; "ver anteriores" retrocede con el
 * cursor del backend.
 */
export function ConversationsList({
  items,
  error,
  isLoading,
  hasFilters,
  hasMore,
  isLoadingMore,
  selectedId,
  onSelect,
  onLoadMore,
  onRetry,
}: ConversationsListProps) {
  const t = useTranslations("conversations.list");
  const tErrors = useTranslations("conversations.errors");
  const locale = useLocale();
  const preview = usePreview();

  if (error && items.length === 0) {
    return (
      <div className="space-y-3 p-4">
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
      <div className="flex items-center justify-center gap-2 p-8 text-sm text-gray-500 dark:text-gray-400">
        <Spinner />
        {t("loading")}
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {error !== undefined && error !== null && (
        <Alert variant="destructive" className="m-3">
          <AlertDescription>
            {getConversationErrorMessage(error, tErrors)}
          </AlertDescription>
        </Alert>
      )}

      <ul className="min-h-0 flex-1 divide-y divide-gray-100 overflow-y-auto dark:divide-white/5">
        {items.length === 0 && (
          <li className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
            {hasFilters ? t("noResults") : t("emptyRecent")}
          </li>
        )}
        {items.map((item) => {
          const selected = item.id === selectedId;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelect(item.id)}
                aria-current={selected ? "true" : undefined}
                className={`flex w-full items-start gap-3 px-4 py-3 text-start transition hover:bg-gray-50 dark:hover:bg-white/5 ${selected ? "bg-brand-50 dark:bg-brand-500/10" : ""}`}
              >
                <Avatar>
                  <AvatarFallback>{initials(item.contact_name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">
                      {item.contact_name}
                    </p>
                    {item.last_message_at && (
                      <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
                        {formatListDate(item.last_message_at, locale)}
                      </span>
                    )}
                  </div>
                  {item.contact_phone && (
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                      {item.contact_phone}
                    </p>
                  )}
                  <p className="truncate text-xs text-gray-600 dark:text-gray-300">
                    {preview(item)}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <ConversationStatusBadge status={item.status} />
                    <Badge
                      size="sm"
                      color={
                        item.assigned_staff_member_id === null
                          ? "warning"
                          : "light"
                      }
                    >
                      {item.assigned_staff_member_id === null
                        ? t("unassigned")
                        : t("assigned")}
                    </Badge>
                    {item.status === "open" && !item.reply_window_open && (
                      <Badge size="sm" color="gray">
                        {t("templateOnly")}
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      {hasMore && (
        <div className="flex justify-center border-t border-gray-100 p-2 dark:border-white/5">
          <Button
            type="button"
            variant="outline"
            size="xs"
            disabled={isLoadingMore}
            onClick={onLoadMore}
          >
            {isLoadingMore && <Spinner />}
            {t("loadOlder")}
          </Button>
        </div>
      )}
    </div>
  );
}
