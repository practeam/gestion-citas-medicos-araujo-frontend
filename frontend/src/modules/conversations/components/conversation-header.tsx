import { Button } from "@/components/ui/button";
import { Can } from "@/modules/auth";
import { useLocale, useTranslations } from "@/i18n";
import { ArrowLeftIcon, InfoIcon } from "@/icons";
import { getPersonFullName } from "@/modules/persons";
import type { Person } from "@/modules/persons";
import type {
  Conversation,
  ConversationStatus,
} from "../types/conversation.types";
import { formatDateTime } from "../utils/conversation-datetime.utils";
import {
  ConversationChannelBadge,
  ConversationStatusBadge,
} from "./conversation-badges";
import { PersonAvatar } from "./person-avatar";

interface ConversationHeaderProps {
  conversation: Conversation;
  person: Person | undefined;
  /** Nombre del trabajador asignado; `null` si no hay asignación activa; `undefined` si aún no se sabe. */
  assignedTo: string | null | undefined;
  isRefreshing: boolean;
  onBack: () => void;
  /** Muestra/oculta el panel de información en pantallas grandes. */
  onToggleInfo: () => void;
  /** Abre el panel de información como hoja en pantallas pequeñas y medianas. */
  onOpenInfoSheet: () => void;
  onRefresh: () => void;
  onChangeStatus: (status: ConversationStatus) => void;
}

/** Encabezado del chat: persona, canal, estado, inicio, asignación y acciones del ciclo de vida. */
export function ConversationHeader({
  conversation,
  person,
  assignedTo,
  isRefreshing,
  onBack,
  onToggleInfo,
  onOpenInfoSheet,
  onRefresh,
  onChangeStatus,
}: ConversationHeaderProps) {
  const t = useTranslations("conversations.header");
  const tAssign = useTranslations("conversations.assignments");
  const locale = useLocale();
  const isOpen = conversation.status === "open";

  return (
    <header className="flex flex-wrap items-center gap-3 border-b border-gray-100 px-3 py-3 sm:px-4 dark:border-white/5">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="md:hidden"
        aria-label={t("back")}
        onClick={onBack}
      >
        <ArrowLeftIcon className="size-5 fill-current rtl:rotate-180" />
      </Button>
      <PersonAvatar person={person} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-gray-800 dark:text-white/90">
          {person ? getPersonFullName(person) : `#${conversation.person_id}`}
        </p>
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <ConversationChannelBadge channel={conversation.channel} />
          <ConversationStatusBadge status={conversation.status} />
          <span>
            {t("startedAt", {
              date: formatDateTime(conversation.started_at, locale),
            })}
          </span>
          {assignedTo !== undefined && (
            <span>
              ·{" "}
              {assignedTo
                ? t("assignedTo", { name: assignedTo })
                : tAssign("unassigned")}
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="xs"
          disabled={isRefreshing}
          onClick={onRefresh}
        >
          {t("refresh")}
        </Button>
        <Can permission="conversation.update">
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => onChangeStatus(isOpen ? "closed" : "open")}
          >
            {isOpen ? t("close") : t("reopen")}
          </Button>
        </Can>
        <Button
          type="button"
          variant="outline"
          size="xs"
          className="hidden xl:inline-flex"
          aria-label={t("toggleInfo")}
          onClick={onToggleInfo}
        >
          <InfoIcon className="size-4 fill-current" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="xs"
          className="xl:hidden"
          aria-label={t("openInfo")}
          onClick={onOpenInfoSheet}
        >
          <InfoIcon className="size-4 fill-current" />
        </Button>
      </div>
    </header>
  );
}
