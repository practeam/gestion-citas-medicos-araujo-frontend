import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "@/i18n";
import { FileIcon, SearchIcon } from "@/icons";
import { isAbortError } from "@/services/api";
import { useRef, useState } from "react";
import {
  PERSON_DOCUMENT_MAX_LENGTH,
  normalizeDocumentNumber,
} from "../schemas/person-schema";
import { personApi } from "../services/person-api";
import type { Person, PersonListParams } from "../types/person.types";
import { getPersonErrorMessage } from "../utils/person-error.utils";
import {
  getPersonDocument,
  getPersonFullName,
} from "../utils/person-payload.utils";
import { PersonStatusBadge } from "./person-status-badge";

const RESULTS_PAGE_SIZE = 10;
type SearchKind = "name" | "documentNumber";

type SearchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; items: Person[]; total: number };

export interface PersonSelectorProps {
  /** `id` de la persona seleccionada, si ya hay una. */
  value?: number | null;
  /** Recibe la persona elegida; su `id` es el `person_id` para el módulo consumidor. */
  onSelect: (person: Person) => void;
  /** Solo permite elegir personas activas (las inactivas se muestran deshabilitadas). */
  activeOnly?: boolean;
  /** Permite ocultar la ayuda inicial en contextos donde el flujo ya es explÃ­cito. */
  showHint?: boolean;
  /** Permite seleccionar haciendo clic en toda la fila, sin mostrar un botÃ³n adicional. */
  rowSelection?: boolean;
  /** Cantidad de columnas para presentar los resultados en pantallas amplias. */
  resultColumns?: 1 | 2;
}

/**
 * Busca personas existentes por nombre o por documento (coincidencia exacta) y
 * permite seleccionar una. No lista a nadie hasta que se indica algún criterio.
 */
export function PersonSelector({
  value = null,
  onSelect,
  activeOnly = false,
  showHint = true,
  rowSelection = false,
  resultColumns = 1,
}: PersonSelectorProps) {
  const t = useTranslations("persons.selector");
  const tErrors = useTranslations("persons.errors");
  const [searchKind, setSearchKind] = useState<SearchKind>("name");
  const [query, setQuery] = useState("");
  const [state, setState] = useState<SearchState>({ status: "idle" });
  const [missingCriteria, setMissingCriteria] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  const search = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    const normalizedQuery = query.trim();
    const params: PersonListParams = {
      page: 1,
      page_size: RESULTS_PAGE_SIZE,
      sort_by: "last_name",
      order: "asc",
      ...(searchKind === "name" &&
        normalizedQuery && {
          name: normalizedQuery,
        }),
      ...(searchKind === "documentNumber" &&
        normalizeDocumentNumber(normalizedQuery) && {
          document_number: normalizeDocumentNumber(normalizedQuery),
        }),
      ...(activeOnly && { is_active: true }),
    };
    if (!params.name && !params.document_number) {
      setMissingCriteria(true);
      return;
    }

    setMissingCriteria(false);
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setState({ status: "loading" });
    try {
      const page = await personApi.list(params, { signal: controller.signal });
      setState({ status: "success", items: page.items, total: page.total });
    } catch (error) {
      if (isAbortError(error)) return;
      setState({
        status: "error",
        message: getPersonErrorMessage(error, tErrors),
      });
    }
  };

  const isLoading = state.status === "loading";

  return (
    <div className="space-y-4">
      <form
        onSubmit={search}
        className="flex flex-col gap-3 sm:flex-row"
        noValidate
      >
        <InputGroup className="min-w-0 flex-1">
          <InputGroupAddon className="border-e border-gray-200 p-1 dark:border-gray-700">
            <Select
              value={searchKind}
              onValueChange={(value) => {
                setSearchKind(value as SearchKind);
                setQuery("");
                setMissingCriteria(false);
              }}
            >
              <SelectTrigger
                size="sm"
                className="h-8! w-32 border-0 bg-transparent px-2 shadow-none hover:bg-gray-50 focus:border-0 focus:ring-0 focus-visible:border-0 focus-visible:ring-0 data-popup-open:border-0 data-popup-open:ring-0 dark:border-0 dark:bg-transparent dark:hover:bg-white/5 dark:focus:border-0 dark:focus-visible:border-0 dark:data-popup-open:border-0"
                aria-label={
                  searchKind === "name"
                    ? t("nameLabel")
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
                      {value === "name"
                        ? t("nameOption")
                        : t("documentNumberOption")}
                    </>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">
                  <SearchIcon className="size-4 text-blue-500" />
                  {t("nameOption")}
                </SelectItem>
                <SelectItem value="documentNumber">
                  <FileIcon className="size-4 text-purple-500" />
                  {t("documentNumberOption")}
                </SelectItem>
              </SelectContent>
            </Select>
          </InputGroupAddon>
          <InputGroupInput
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={
              searchKind === "name"
                ? t("namePlaceholder")
                : t("documentNumberPlaceholder")
            }
            aria-label={
              searchKind === "name" ? t("nameLabel") : t("documentNumberLabel")
            }
            maxLength={
              searchKind === "name" ? 200 : PERSON_DOCUMENT_MAX_LENGTH + 10
            }
            className={searchKind === "documentNumber" ? "uppercase" : ""}
            autoComplete="off"
          />
        </InputGroup>
        <Button type="submit" className="sm:w-auto" disabled={isLoading}>
          {isLoading && <Spinner />}
          {t("search")}
        </Button>
      </form>

      {missingCriteria && (
        <Alert variant="info">
          <AlertDescription>{t("criteriaRequired")}</AlertDescription>
        </Alert>
      )}
      {showHint && state.status === "idle" && !missingCriteria && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{t("hint")}</p>
      )}
      {state.status === "error" && (
        <Alert variant="destructive">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}
      {state.status === "success" && state.items.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t("noResults")}
        </p>
      )}
      {state.status === "success" && state.items.length > 0 && (
        <>
          <ul
            className={
              resultColumns === 2
                ? "grid gap-3 sm:grid-cols-2"
                : "divide-y divide-gray-100 rounded-xl border border-gray-200 dark:divide-white/5 dark:border-gray-800"
            }
          >
            {state.items.map((person) => {
              const selected = person.id === value;
              const disabled = activeOnly && !person.is_active;
              return (
                <li
                  key={person.id}
                  className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 transition-colors ${
                    resultColumns === 2
                      ? "rounded-xl border border-gray-200 dark:border-gray-800"
                      : ""
                  } ${
                    rowSelection
                      ? disabled
                        ? "cursor-not-allowed opacity-60"
                        : "cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand-500"
                      : ""
                  } ${
                    rowSelection && selected
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"
                      : rowSelection && !disabled
                        ? "hover:bg-gray-50 dark:hover:bg-white/5"
                        : ""
                  }`}
                  role={rowSelection ? "button" : undefined}
                  tabIndex={rowSelection && !disabled ? 0 : undefined}
                  aria-pressed={rowSelection ? selected : undefined}
                  title={
                    rowSelection
                      ? selected
                        ? t("selected")
                        : t("select")
                      : undefined
                  }
                  onClick={() => rowSelection && !disabled && onSelect(person)}
                  onKeyDown={(event) => {
                    if (
                      rowSelection &&
                      !disabled &&
                      (event.key === "Enter" || event.key === " ")
                    ) {
                      event.preventDefault();
                      onSelect(person);
                    }
                  }}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">
                      {getPersonFullName(person)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {getPersonDocument(person) ?? t("noDocument")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <PersonStatusBadge isActive={person.is_active} />
                    {!rowSelection && (
                      <Button
                        type="button"
                        size="xs"
                        variant={selected ? "default" : "outline"}
                        disabled={disabled}
                        aria-pressed={selected}
                        onClick={() => onSelect(person)}
                      >
                        {selected ? t("selected") : t("select")}
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          {state.total > state.items.length && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t("refine", { shown: state.items.length, total: state.total })}
            </p>
          )}
        </>
      )}
    </div>
  );
}
