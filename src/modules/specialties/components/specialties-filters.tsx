import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "@/i18n";
import { SearchIcon } from "@/icons";
import { useEffect, useState } from "react";
import { SPECIALTY_NAME_MAX_LENGTH } from "../schemas/specialty-schema";
import type {
  SortOrder,
  SpecialtySortField,
  SpecialtyStatusFilter,
} from "../types/specialty.types";

const SEARCH_DEBOUNCE_MS = 400;
const STATUS_OPTIONS: SpecialtyStatusFilter[] = ["all", "active", "inactive"];
const SORT_FIELDS: SpecialtySortField[] = ["id", "name", "created_at"];
const SORT_ORDERS: SortOrder[] = ["asc", "desc"];

interface SpecialtiesFiltersProps {
  status: SpecialtyStatusFilter;
  sortBy: SpecialtySortField;
  order: SortOrder;
  onNameChange: (name: string) => void;
  onStatusChange: (status: SpecialtyStatusFilter) => void;
  onSortByChange: (sortBy: SpecialtySortField) => void;
  onOrderChange: (order: SortOrder) => void;
}

export function SpecialtiesFilters({
  status,
  sortBy,
  order,
  onNameChange,
  onStatusChange,
  onSortByChange,
  onOrderChange,
}: SpecialtiesFiltersProps) {
  const t = useTranslations("specialties.filters");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(
      () => onNameChange(search.trim()),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [search, onNameChange]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <div className="relative w-full sm:max-w-xs">
        <SearchIcon className="pointer-events-none absolute inset-s-4 top-1/2 size-5 -translate-y-1/2 fill-gray-500 dark:fill-gray-400" />
        <Input
          type="search"
          value={search}
          maxLength={SPECIALTY_NAME_MAX_LENGTH}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchLabel")}
          className="ps-11"
        />
      </div>
      <Select
        value={status}
        onValueChange={(value) =>
          onStatusChange(value as SpecialtyStatusFilter)
        }
      >
        <SelectTrigger className="sm:w-48" aria-label={t("statusLabel")}>
          <SelectValue>{(value: string) => t(`status.${value}`)}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option} value={option}>
              {t(`status.${option}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={sortBy}
        onValueChange={(value) => onSortByChange(value as SpecialtySortField)}
      >
        <SelectTrigger className="sm:w-48" aria-label={t("sortByLabel")}>
          <SelectValue>{(value: string) => t(`sortBy.${value}`)}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {SORT_FIELDS.map((option) => (
            <SelectItem key={option} value={option}>
              {t(`sortBy.${option}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={order}
        onValueChange={(value) => onOrderChange(value as SortOrder)}
      >
        <SelectTrigger className="sm:w-40" aria-label={t("orderLabel")}>
          <SelectValue>{(value: string) => t(`order.${value}`)}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {SORT_ORDERS.map((option) => (
            <SelectItem key={option} value={option}>
              {t(`order.${option}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
