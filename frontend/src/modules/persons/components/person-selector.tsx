import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "@/i18n";
import { isAbortError } from "@/services/api";
import { useRef, useState } from "react";
import {
  PERSON_DOCUMENT_MAX_LENGTH,
  normalizeDocumentNumber,
  normalizeDocumentType,
} from "../schemas/person-schema";
import { personApi } from "../services/person-api";
import type { Person, PersonListParams } from "../types/person.types";
import { getPersonErrorMessage } from "../utils/person-error.utils";
import {
  getPersonDocument,
  getPersonFullName,
} from "../utils/person-payload.utils";
import { DocumentTypeSelect } from "./document-type-select";
import { PersonStatusBadge } from "./person-status-badge";

const RESULTS_PAGE_SIZE = 10;

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
}

/**
 * Busca personas existentes por nombre o por documento (coincidencia exacta) y
 * permite seleccionar una. No lista a nadie hasta que se indica algún criterio.
 */
export function PersonSelector({
  value = null,
  onSelect,
  activeOnly = false,
}: PersonSelectorProps) {
  const t = useTranslations("persons.selector");
  const tErrors = useTranslations("persons.errors");
  const [name, setName] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [state, setState] = useState<SearchState>({ status: "idle" });
  const [missingCriteria, setMissingCriteria] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  const search = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    const params: PersonListParams = {
      page: 1,
      page_size: RESULTS_PAGE_SIZE,
      sort_by: "last_name",
      order: "asc",
      ...(name.trim() && { name: name.trim() }),
      ...(normalizeDocumentNumber(documentNumber) && {
        document_number: normalizeDocumentNumber(documentNumber),
        ...(normalizeDocumentType(documentType) && {
          document_type: normalizeDocumentType(documentType),
        }),
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
        className="flex flex-col gap-3 sm:flex-row sm:flex-wrap"
        noValidate
      >
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={t("namePlaceholder")}
          aria-label={t("nameLabel")}
          maxLength={200}
          className="sm:max-w-xs"
          autoComplete="off"
        />
        <DocumentTypeSelect
          value={documentType}
          onChange={setDocumentType}
          emptyLabel={t("anyDocumentType")}
          ariaLabel={t("documentTypeLabel")}
          className="sm:w-48"
        />
        <Input
          value={documentNumber}
          onChange={(event) => setDocumentNumber(event.target.value)}
          placeholder={t("documentNumberPlaceholder")}
          aria-label={t("documentNumberLabel")}
          maxLength={PERSON_DOCUMENT_MAX_LENGTH + 10}
          className="uppercase sm:w-44"
          autoComplete="off"
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Spinner />}
          {t("search")}
        </Button>
      </form>

      {missingCriteria && (
        <Alert variant="info">
          <AlertDescription>{t("criteriaRequired")}</AlertDescription>
        </Alert>
      )}
      {state.status === "idle" && !missingCriteria && (
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
          <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 dark:divide-white/5 dark:border-gray-800">
            {state.items.map((person) => {
              const selected = person.id === value;
              const disabled = activeOnly && !person.is_active;
              return (
                <li
                  key={person.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
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
