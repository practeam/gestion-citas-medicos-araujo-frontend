import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "@/i18n";
import { CheckCircleIcon, FilterIcon, SearchIcon, XIcon } from "@/icons";
import { useEffect, useState } from "react";
import { SPECIAL_CONDITION_NAME_MAX_LENGTH } from "../schemas/special-condition-schema";
import type { SpecialConditionStatusFilter } from "../types/special-condition.types";

const SEARCH_DEBOUNCE_MS = 400;
const STATUS_OPTIONS: SpecialConditionStatusFilter[] = [
  "all",
  "active",
  "inactive",
];

interface SpecialConditionsFiltersProps {
  status: SpecialConditionStatusFilter;
  onNameChange: (name: string) => void;
  onStatusChange: (status: SpecialConditionStatusFilter) => void;
}

export function SpecialConditionsFilters({
  status,
  onNameChange,
  onStatusChange,
}: SpecialConditionsFiltersProps) {
  const t = useTranslations("specialConditions.filters");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(
      () => onNameChange(search.trim()),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [search, onNameChange]);

  return (
    <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-[minmax(0,3fr)_8rem]">
      <InputGroup className="min-w-0">
        <InputGroupAddon>
          <SearchIcon className="text-blue-500 dark:text-blue-400" />
        </InputGroupAddon>
        <InputGroupInput
          type="search"
          value={search}
          maxLength={SPECIAL_CONDITION_NAME_MAX_LENGTH}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchLabel")}
          autoComplete="off"
        />
      </InputGroup>
      <Select
        value={status}
        onValueChange={(value) =>
          onStatusChange(value as SpecialConditionStatusFilter)
        }
      >
        <SelectTrigger
          className="md:w-32 md:justify-self-end"
          aria-label={t("statusLabel")}
        >
          <SelectValue>
            {(value: string) => (
              <>
                {value === "active" ? (
                  <CheckCircleIcon className="size-4 text-green-500" />
                ) : value === "inactive" ? (
                  <XIcon className="size-4 text-red-500" />
                ) : (
                  <FilterIcon className="size-4 text-gray-500" />
                )}
                {t(`status.${value}`)}
              </>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option} value={option}>
              {option === "active" ? (
                <CheckCircleIcon className="size-4 text-green-500" />
              ) : option === "inactive" ? (
                <XIcon className="size-4 text-red-500" />
              ) : (
                <FilterIcon className="size-4 text-gray-500" />
              )}
              {t(`status.${option}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
