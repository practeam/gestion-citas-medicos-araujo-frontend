import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "@/i18n";
import {
  CONVERSATION_STATUSES,
  INBOX_ASSIGNMENTS,
  type ConversationStatusFilter,
  type InboxAssignmentFilter,
  type InboxFilters,
} from "../types/conversation.types";

const STATUS_OPTIONS: ConversationStatusFilter[] = [
  "all",
  ...CONVERSATION_STATUSES,
];

interface ConversationFiltersProps {
  filters: InboxFilters;
  hasFilters: boolean;
  onChange: (patch: Partial<InboxFilters>) => void;
  onClear: () => void;
}

/**
 * Filtros de la bandeja: estado y asignación (todas / sin asignar / mías), los
 * únicos que admite `GET /conversations/inbox` junto con el canal, que hoy es
 * solo WhatsApp.
 */
export function ConversationFilters({
  filters,
  hasFilters,
  onChange,
  onClear,
}: ConversationFiltersProps) {
  const t = useTranslations("conversations.filters");
  const tStatus = useTranslations("conversations.status");

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <Select
          value={filters.assignment}
          onValueChange={(value) =>
            onChange({ assignment: value as InboxAssignmentFilter })
          }
        >
          <SelectTrigger size="sm" aria-label={t("assignmentLabel")}>
            <SelectValue>
              {(value: string) => t(`assignment.${value}`)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {INBOX_ASSIGNMENTS.map((option) => (
              <SelectItem key={option} value={option}>
                {t(`assignment.${option}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.status}
          onValueChange={(value) =>
            onChange({ status: value as ConversationStatusFilter })
          }
        >
          <SelectTrigger size="sm" aria-label={t("statusLabel")}>
            <SelectValue>
              {(value: string) =>
                value === "all" ? t("allStatuses") : tStatus(value)
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option === "all" ? t("allStatuses") : tStatus(option)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <Button type="button" variant="outline" size="xs" onClick={onClear}>
          {t("clear")}
        </Button>
      )}
    </div>
  );
}
