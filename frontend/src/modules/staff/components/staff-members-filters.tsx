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
import {
  CheckCircleIcon,
  FileIcon,
  FilterIcon,
  SearchIcon,
  TagIcon,
  XIcon,
} from "@/icons";
import { useEffect, useState } from "react";
import type { StaffMembersFilters as Filters } from "../hooks/use-staff-members";
import {
  EMPLOYEE_NUMBER_MAX_LENGTH,
  normalizeEmployeeNumber,
} from "../schemas/staff-member-schema";
import type { StaffMemberStatusFilter } from "../types/staff-member.types";

const SEARCH_DEBOUNCE_MS = 400;
type SearchKind = "name" | "documentNumber" | "employeeNumber";
const SEARCH_KINDS: SearchKind[] = ["name", "documentNumber", "employeeNumber"];
const STATUS_OPTIONS: StaffMemberStatusFilter[] = ["all", "active", "inactive"];
interface StaffMembersFiltersProps {
  filters: Pick<Filters, "status">;
  onChange: (patch: Partial<Omit<Filters, "page">>) => void;
}

export function StaffMembersFilters({
  filters,
  onChange,
}: StaffMembersFiltersProps) {
  const t = useTranslations("staff.filters");
  const [searchKind, setSearchKind] = useState<SearchKind>("name");
  const [query, setQuery] = useState("");

  // Los campos de texto se envían al servidor con retardo para no consultar en cada tecla.
  useEffect(() => {
    const timer = setTimeout(
      () =>
        onChange({
          name: searchKind === "name" ? query.trim() : "",
          documentNumber:
            searchKind === "documentNumber"
              ? query.replace(/\s+/g, "").toUpperCase()
              : "",
          employeeNumber:
            searchKind === "employeeNumber"
              ? normalizeEmployeeNumber(query)
              : "",
        }),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [query, searchKind, onChange]);

  return (
    <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-[minmax(0,3fr)_8rem]">
      <InputGroup className="min-w-0">
        <InputGroupAddon className="border-e border-gray-200 p-1 dark:border-gray-700">
          <Select
            value={searchKind}
            onValueChange={(value) => setSearchKind(value as SearchKind)}
          >
            <SelectTrigger
              size="sm"
              className="h-8! w-36 border-0 bg-transparent px-2 shadow-none hover:bg-gray-50 focus:border-0 focus:ring-0 focus-visible:border-0 focus-visible:ring-0 data-popup-open:border-0 data-popup-open:ring-0 dark:border-0 dark:bg-transparent dark:hover:bg-white/5 dark:focus:border-0 dark:focus-visible:border-0 dark:data-popup-open:border-0"
              aria-label={
                searchKind === "name"
                  ? t("searchLabel")
                  : searchKind === "documentNumber"
                    ? t("documentNumberLabel")
                    : t("employeeNumberLabel")
              }
            >
              <SelectValue>
                {(value: string) => (
                  <>
                    {value === "name" ? (
                      <SearchIcon className="size-4 text-blue-500" />
                    ) : value === "documentNumber" ? (
                      <FileIcon className="size-4 text-purple-500" />
                    ) : (
                      <TagIcon className="size-4 text-amber-500" />
                    )}
                    {t(`searchType.${value}`)}
                  </>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {SEARCH_KINDS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option === "name" ? (
                    <SearchIcon className="size-4 text-blue-500" />
                  ) : option === "documentNumber" ? (
                    <FileIcon className="size-4 text-purple-500" />
                  ) : (
                    <TagIcon className="size-4 text-amber-500" />
                  )}
                  {t(`searchType.${option}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </InputGroupAddon>
        <InputGroupInput
          type="search"
          value={query}
          maxLength={
            searchKind === "name"
              ? 200
              : searchKind === "documentNumber"
                ? 40
                : EMPLOYEE_NUMBER_MAX_LENGTH
          }
          onChange={(event) => setQuery(event.target.value)}
          placeholder={
            searchKind === "name"
              ? t("searchPlaceholder")
              : searchKind === "documentNumber"
                ? t("documentNumberPlaceholder")
                : t("employeeNumberPlaceholder")
          }
          aria-label={
            searchKind === "name"
              ? t("searchLabel")
              : searchKind === "documentNumber"
                ? t("documentNumberLabel")
                : t("employeeNumberLabel")
          }
          autoComplete="off"
        />
      </InputGroup>
      <Select
        value={filters.status}
        onValueChange={(value) =>
          onChange({ status: value as StaffMemberStatusFilter })
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
