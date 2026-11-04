import { Badge } from "@/components/ui/badge";
import { useLocale, useTranslations } from "@/i18n";
import { getPersonDocument, getPersonFullName } from "@/modules/persons";
import type { useAssignments } from "../hooks/use-assignments";
import { usePeople } from "../hooks/use-lookup";
import type { Conversation } from "../types/conversation.types";
import { formatDateTime } from "../utils/conversation-datetime.utils";
import { AssignmentPanel, type AssignmentNotice } from "./assignment-panel";
import {
  ConversationChannelBadge,
  ConversationStatusBadge,
} from "./conversation-badges";
import { PersonAvatar } from "./person-avatar";

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-0.5">
      <dt className="text-xs text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className="text-sm break-words text-gray-800 dark:text-white/90">
        {children}
      </dd>
    </div>
  );
}

interface ConversationInfoPanelProps {
  conversation: Conversation;
  assignments: ReturnType<typeof useAssignments>;
  onAssignmentNotice: (notice: AssignmentNotice) => void;
}

/**
 * Panel derecho: datos de la persona (solo los que entrega la API), datos de la
 * conversación y asignación del trabajador con su historial.
 */
export function ConversationInfoPanel({
  conversation,
  assignments,
  onAssignmentNotice,
}: ConversationInfoPanelProps) {
  const t = useTranslations("conversations.info");
  const locale = useLocale();
  const people = usePeople([conversation.person_id]);
  const person = people[conversation.person_id];
  const empty = t("noValue");

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <PersonAvatar person={person} size="lg" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-800 dark:text-white/90">
              {person
                ? getPersonFullName(person)
                : `#${conversation.person_id}`}
            </p>
            {person && (
              <Badge size="sm" color={person.is_active ? "success" : "gray"}>
                {person.is_active ? t("personActive") : t("personInactive")}
              </Badge>
            )}
          </div>
        </div>
        <dl className="space-y-2">
          <InfoRow label={t("document")}>
            {(person && getPersonDocument(person)) ?? empty}
          </InfoRow>
          <InfoRow label={t("phone")}>{person?.phone ?? empty}</InfoRow>
          <InfoRow label={t("email")}>{person?.email ?? empty}</InfoRow>
        </dl>
      </section>

      <section className="space-y-3 border-t border-gray-100 pt-4 dark:border-gray-800">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
          {t("conversation")}
        </h4>
        <dl className="space-y-2">
          <InfoRow label={t("id")}>{conversation.id}</InfoRow>
          <InfoRow label={t("channel")}>
            <ConversationChannelBadge channel={conversation.channel} />
          </InfoRow>
          <InfoRow label={t("status")}>
            <ConversationStatusBadge status={conversation.status} />
          </InfoRow>
          <InfoRow label={t("startedAt")}>
            {formatDateTime(conversation.started_at, locale)}
          </InfoRow>
          {conversation.closed_at && (
            <InfoRow label={t("closedAt")}>
              {formatDateTime(conversation.closed_at, locale)}
            </InfoRow>
          )}
        </dl>
      </section>

      <div className="border-t border-gray-100 pt-4 dark:border-gray-800">
        <AssignmentPanel
          conversation={conversation}
          assignments={assignments}
          onNotice={onAssignmentNotice}
        />
      </div>
    </div>
  );
}
