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
import { PERMISSION_NAME_MAX_LENGTH } from "../schemas/permission-schema";
import type { PermissionStatusFilter } from "../types/permission.types";

const SEARCH_DEBOUNCE_MS = 400;
const STATUS_OPTIONS: PermissionStatusFilter[] = ["all", "active", "inactive"];

interface PermissionsFiltersProps {
  status: PermissionStatusFilter;
  onNameChange: (name: string) => void;
  onStatusChange: (status: PermissionStatusFilter) => void;
}

export function PermissionsFilters({
  status,
  onNameChange,
  onStatusChange,
}: PermissionsFiltersProps) {
  const t = useTranslations("permissions.filters");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(
      () => onNameChange(search.trim()),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [search, onNameChange]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="relative w-full sm:max-w-xs">
        <SearchIcon className="pointer-events-none absolute inset-s-4 top-1/2 size-5 -translate-y-1/2 fill-gray-500 dark:fill-gray-400" />
        <Input
          type="search"
          value={search}
          maxLength={PERMISSION_NAME_MAX_LENGTH}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchLabel")}
          className="ps-11"
        />
      </div>
      <Select
        value={status}
        onValueChange={(value) =>
          onStatusChange(value as PermissionStatusFilter)
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
    </div>
  );
}
