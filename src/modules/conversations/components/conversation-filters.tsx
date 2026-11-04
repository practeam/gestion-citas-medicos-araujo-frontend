import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "@/i18n";
import { getPersonFullName } from "@/modules/persons";
import { useState } from "react";
import { usePeople } from "../hooks/use-lookup";
import {
  CONVERSATION_CHANNELS,
  CONVERSATION_STATUSES,
  type ConversationChannelFilter,
  type ConversationFilters,
  type ConversationStatusFilter,
} from "../types/conversation.types";
import { EntitySelector } from "./entity-selector";

const STATUS_OPTIONS: ConversationStatusFilter[] = [
  "all",
  ...CONVERSATION_STATUSES,
];
const CHANNEL_OPTIONS: ConversationChannelFilter[] = [
  "all",
  ...CONVERSATION_CHANNELS,
];

interface ConversationFiltersProps {
  filters: ConversationFilters;
  hasFilters: boolean;
  onChange: (patch: Partial<ConversationFilters>) => void;
  onClear: () => void;
}

/**
 * Filtros del listado: persona (búsqueda en el servidor, no solo pacientes),
 * canal y estado. Son los únicos parámetros que admite el endpoint.
 */
export function ConversationFilters({
  filters,
  hasFilters,
  onChange,
  onClear,
}: ConversationFiltersProps) {
  const t = useTranslations("conversations.filters");
  const tStatus = useTranslations("conversations.status");
  const tChannel = useTranslations("conversations.channel");
  const [open, setOpen] = useState(false);
  const people = usePeople(filters.personId === null ? [] : [filters.personId]);
  const person =
    filters.personId === null ? undefined : people[filters.personId];

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full justify-start truncate font-normal"
            />
          }
        >
          {filters.personId === null
            ? t("allPeople")
            : person
              ? getPersonFullName(person)
              : `#${filters.personId}`}
        </PopoverTrigger>
        <PopoverContent align="start" className="w-80 max-w-[90vw] p-4">
          <div className="space-y-3">
            <EntitySelector
              kind="person"
              value={filters.personId}
              onSelect={(option) => {
                onChange({ personId: option.id });
                setOpen(false);
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={filters.personId === null}
              onClick={() => {
                onChange({ personId: null });
                setOpen(false);
              }}
            >
              {t("allPeople")}
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <div className="grid grid-cols-2 gap-2">
        <Select
          value={filters.channel}
          onValueChange={(value) =>
            onChange({ channel: value as ConversationChannelFilter })
          }
        >
          <SelectTrigger size="sm" aria-label={t("channelLabel")}>
            <SelectValue>
              {(value: string) =>
                value === "all" ? t("allChannels") : tChannel(value)
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {CHANNEL_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option === "all" ? t("allChannels") : tChannel(option)}
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
