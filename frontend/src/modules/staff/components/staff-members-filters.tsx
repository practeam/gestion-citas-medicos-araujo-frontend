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
import type { StaffMembersFilters as Filters } from "../hooks/use-staff-members";
import {
  EMPLOYEE_NUMBER_MAX_LENGTH,
  normalizeEmployeeNumber,
} from "../schemas/staff-member-schema";
import type {
  StaffMemberSortField,
  StaffMemberStatusFilter,
  SortOrder,
} from "../types/staff-member.types";

const SEARCH_DEBOUNCE_MS = 400;
const STATUS_OPTIONS: StaffMemberStatusFilter[] = ["all", "active", "inactive"];
const SORT_FIELDS: StaffMemberSortField[] = [
  "id",
  "created_at",
  "employee_number",
  "last_name",
];
const SORT_ORDERS: SortOrder[] = ["asc", "desc"];

interface StaffMembersFiltersProps {
  filters: Pick<Filters, "status" | "sortBy" | "order">;
  onChange: (patch: Partial<Omit<Filters, "page">>) => void;
}

export function StaffMembersFilters({
  filters,
  onChange,
}: StaffMembersFiltersProps) {
  const t = useTranslations("staff.filters");
  const [name, setName] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [employeeNumber, setEmployeeNumber] = useState("");

  // Los campos de texto se envían al servidor con retardo para no consultar en cada tecla.
  useEffect(() => {
    const timer = setTimeout(
      () =>
        onChange({
          name: name.trim(),
          documentNumber: documentNumber.replace(/\s+/g, "").toUpperCase(),
          employeeNumber: normalizeEmployeeNumber(employeeNumber),
        }),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [name, documentNumber, employeeNumber, onChange]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <div className="relative w-full sm:max-w-xs">
        <SearchIcon className="pointer-events-none absolute inset-s-4 top-1/2 size-5 -translate-y-1/2 fill-gray-500 dark:fill-gray-400" />
        <Input
          type="search"
          value={name}
          maxLength={200}
          onChange={(event) => setName(event.target.value)}
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchLabel")}
          className="ps-11"
          autoComplete="off"
        />
      </div>
      <Input
        value={documentNumber}
        maxLength={40}
        onChange={(event) => setDocumentNumber(event.target.value)}
        placeholder={t("documentNumberPlaceholder")}
        aria-label={t("documentNumberLabel")}
        className="sm:w-44"
        autoComplete="off"
      />
      <Input
        value={employeeNumber}
        maxLength={EMPLOYEE_NUMBER_MAX_LENGTH}
        onChange={(event) => setEmployeeNumber(event.target.value)}
        placeholder={t("employeeNumberPlaceholder")}
        aria-label={t("employeeNumberLabel")}
        className="sm:w-44"
        autoComplete="off"
      />
      <Select
        value={filters.status}
        onValueChange={(value) =>
          onChange({ status: value as StaffMemberStatusFilter })
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
        value={filters.sortBy}
        onValueChange={(value) =>
          onChange({ sortBy: value as StaffMemberSortField })
        }
      >
        <SelectTrigger className="sm:w-56" aria-label={t("sortByLabel")}>
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
        value={filters.order}
        onValueChange={(value) => onChange({ order: value as SortOrder })}
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
