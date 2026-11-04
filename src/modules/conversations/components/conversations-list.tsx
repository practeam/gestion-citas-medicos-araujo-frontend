import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useLocale, useTranslations } from "@/i18n";
import { getPersonDocument, getPersonFullName } from "@/modules/persons";
import type { PageResult } from "@/services/api";
import { CONVERSATIONS_PAGE_SIZE } from "../hooks/use-conversations";
import { usePeople } from "../hooks/use-lookup";
import type { Conversation } from "../types/conversation.types";
import { formatListDate } from "../utils/conversation-datetime.utils";
import { getConversationErrorMessage } from "../utils/conversation-error.utils";
import {
  ConversationChannelBadge,
  ConversationStatusBadge,
} from "./conversation-badges";
import { PersonAvatar } from "./person-avatar";

interface ConversationsListProps {
  data: PageResult<Conversation> | undefined;
  error: unknown;
  isLoading: boolean;
  hasFilters: boolean;
  page: number;
  selectedId: number | null;
  onSelect: (conversationId: number) => void;
  onPageChange: (page: number) => void;
  onRetry: () => void;
}

/**
 * Listado lateral de conversaciones. Muestra los datos del contrato (persona
 * resuelta por `person_id`, canal, estado y fecha de inicio); no muestra el
 * último mensaje porque el endpoint de conversaciones no lo entrega.
 */
export function ConversationsList({
  data,
  error,
  isLoading,
  hasFilters,
  page,
  selectedId,
  onSelect,
  onPageChange,
  onRetry,
}: ConversationsListProps) {
  const t = useTranslations("conversations.list");
  const tErrors = useTranslations("conversations.errors");
  const locale = useLocale();
  const items = data?.items ?? [];
  const people = usePeople(items.map((item) => item.person_id));
  const totalPages = data
    ? Math.max(
        1,
        Math.ceil(data.total / (data.page_size || CONVERSATIONS_PAGE_SIZE)),
      )
    : 1;

  if (error) {
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

  if (!data) {
    return (
      <div className="flex items-center justify-center gap-2 p-8 text-sm text-gray-500 dark:text-gray-400">
        <Spinner />
        {t("loading")}
      </div>
    );
  }

  return (
    <div
      className={`flex min-h-0 flex-1 flex-col ${isLoading ? "opacity-60 transition-opacity" : ""}`}
      aria-busy={isLoading}
    >
      {items.length === 0 ? (
        <p className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
          {hasFilters ? t("noResults") : t("empty")}
        </p>
      ) : (
        <ul className="min-h-0 flex-1 divide-y divide-gray-100 overflow-y-auto dark:divide-white/5">
          {items.map((conversation) => {
            const person = people[conversation.person_id];
            const selected = conversation.id === selectedId;
            const name = person
              ? getPersonFullName(person)
              : `#${conversation.person_id}`;
            return (
              <li key={conversation.id}>
                <button
                  type="button"
                  onClick={() => onSelect(conversation.id)}
                  aria-current={selected ? "true" : undefined}
                  className={`flex w-full items-start gap-3 px-4 py-3 text-start transition hover:bg-gray-50 dark:hover:bg-white/5 ${selected ? "bg-brand-50 dark:bg-brand-500/10" : ""}`}
                >
                  <PersonAvatar person={person} />
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">
                        {name}
                      </p>
                      <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
                        {formatListDate(conversation.started_at, locale)}
                      </span>
                    </div>
                    {person && getPersonDocument(person) && (
                      <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                        {getPersonDocument(person)}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <ConversationChannelBadge
                        channel={conversation.channel}
                      />
                      <ConversationStatusBadge status={conversation.status} />
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {data.total > 0 && (
        <div className="flex items-center justify-between gap-2 border-t border-gray-100 px-4 py-2 text-xs text-gray-500 dark:border-white/5 dark:text-gray-400">
          <span>{t("page", { page, totalPages })}</span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="xs"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              {t("previous")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="xs"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              {t("next")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
