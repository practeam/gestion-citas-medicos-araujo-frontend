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
  XIcon,
} from "@/icons";
import { useEffect, useState } from "react";
import {
  PERSON_DOCUMENT_MAX_LENGTH,
  normalizeDocumentNumber,
  normalizeDocumentType,
} from "../schemas/person-schema";
import type { PersonsFilters as Filters } from "../hooks/use-persons";
import { DocumentTypeSelect } from "./document-type-select";
import type { PersonStatusFilter } from "../types/person.types";

const SEARCH_DEBOUNCE_MS = 400;
type SearchKind = "name" | "documentNumber";
const SEARCH_KINDS: SearchKind[] = ["name", "documentNumber"];
const STATUS_OPTIONS: PersonStatusFilter[] = ["all", "active", "inactive"];
interface PersonsFiltersProps {
  filters: Pick<Filters, "status">;
  onChange: (patch: Partial<Omit<Filters, "page">>) => void;
}

export function PersonsFilters({ filters, onChange }: PersonsFiltersProps) {
  const t = useTranslations("persons.filters");
  const [searchKind, setSearchKind] = useState<SearchKind>("name");
  const [query, setQuery] = useState("");
  const [documentType, setDocumentType] = useState("");

  // Los campos de texto se envían al servidor con retardo para no consultar en cada tecla.
  useEffect(() => {
    const timer = setTimeout(
      () =>
        onChange({
          name: searchKind === "name" ? query.trim() : "",
          documentType:
            searchKind === "documentNumber"
              ? normalizeDocumentType(documentType)
              : "",
          documentNumber:
            searchKind === "documentNumber"
              ? normalizeDocumentNumber(query)
              : "",
        }),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [query, searchKind, documentType, onChange]);

  return (
    <div
      className={`grid w-full grid-cols-1 gap-3 ${
        searchKind === "documentNumber"
          ? "md:grid-cols-[minmax(0,3fr)_10rem_8rem]"
          : "md:grid-cols-[minmax(0,3fr)_8rem]"
      }`}
    >
      <InputGroup className="min-w-0">
        <InputGroupAddon className="border-e border-gray-200 p-1 dark:border-gray-700">
          <Select
            value={searchKind}
            onValueChange={(value) => setSearchKind(value as SearchKind)}
          >
            <SelectTrigger
              size="sm"
              className="h-8! w-32 border-0 bg-transparent px-2 shadow-none hover:bg-gray-50 focus:border-0 focus:ring-0 focus-visible:border-0 focus-visible:ring-0 data-popup-open:border-0 data-popup-open:ring-0 dark:border-0 dark:bg-transparent dark:hover:bg-white/5 dark:focus:border-0 dark:focus-visible:border-0 dark:data-popup-open:border-0"
              aria-label={
                searchKind === "name"
                  ? t("searchLabel")
                  : t("documentNumberLabel")
              }
            >
              <SelectValue>
                {(value: string) => (
                  <>
                    {value === "name" ? (
                      <SearchIcon className="size-4 text-blue-500" />
                    ) : (
                      <FileIcon className="size-4 text-purple-500" />
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
                  ) : (
                    <FileIcon className="size-4 text-purple-500" />
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
          maxLength={searchKind === "name" ? 200 : PERSON_DOCUMENT_MAX_LENGTH}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={
            searchKind === "name"
              ? t("searchPlaceholder")
              : t("documentNumberPlaceholder")
          }
          aria-label={
            searchKind === "name" ? t("searchLabel") : t("documentNumberLabel")
          }
          autoComplete="off"
        />
      </InputGroup>
      {searchKind === "documentNumber" && (
        <DocumentTypeSelect
          value={documentType}
          onChange={setDocumentType}
          emptyLabel={t("allDocumentTypes")}
          ariaLabel={t("documentTypeLabel")}
          className="w-full"
        />
      )}
      <Select
        value={filters.status}
        onValueChange={(value) =>
          onChange({ status: value as PersonStatusFilter })
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
