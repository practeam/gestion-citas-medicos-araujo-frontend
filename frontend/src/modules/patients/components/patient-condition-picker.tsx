import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "@/i18n";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  RegenerateIcon,
  SearchIcon,
} from "@/icons";
import type { SpecialCondition } from "@/modules/special-conditions";
import { useEffect, useState } from "react";
import { useActiveSpecialConditions } from "../hooks/use-active-special-conditions";
import type { SelectedCondition } from "../types/patient-special-condition.types";
import { CONDITION_NOTES_MAX_LENGTH } from "../utils/patient-condition-operations";

const SEARCH_DEBOUNCE_MS = 400;

interface PatientConditionPickerProps {
  /** Condiciones elegidas con sus notas (estado del formulario que lo contiene). */
  selected: SelectedCondition[];
  onChange: (selected: SelectedCondition[]) => void;
  /** Condiciones ya asociadas: se muestran como asociadas y no pueden elegirse de nuevo. */
  assignedIds?: number[];
  disabled?: boolean;
}

/**
 * Selección múltiple de condiciones especiales **activas** del catálogo
 * (servicio del módulo `special-conditions`), con búsqueda y paginación del
 * servidor, y notas propias de cada relación. No crea ni modifica el catálogo.
 */
export function PatientConditionPicker({
  selected,
  onChange,
  assignedIds = [],
  disabled = false,
}: PatientConditionPickerProps) {
  const t = useTranslations("patients.conditions");
  const [searchInput, setSearchInput] = useState("");
  const {
    conditions,
    total,
    page,
    pageSize,
    hasData,
    error,
    isLoading,
    setSearch,
    setPage,
    reload,
  } = useActiveSpecialConditions();

  useEffect(() => {
    const timer = setTimeout(
      () => setSearch(searchInput.trim()),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [searchInput, setSearch]);

  const selectedIds = new Set(selected.map(({ condition }) => condition.id));
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const toggle = (condition: SpecialCondition) =>
    onChange(
      selectedIds.has(condition.id)
        ? selected.filter((item) => item.condition.id !== condition.id)
        : [...selected, { condition, notes: "" }],
    );

  const setNotes = (conditionId: number, notes: string) =>
    onChange(
      selected.map((item) =>
        item.condition.id === conditionId ? { ...item, notes } : item,
      ),
    );

  return (
    <div className="space-y-4">
      <InputGroup className="min-w-0">
        <InputGroupAddon className="border-e border-gray-200 px-3 dark:border-gray-700">
          <SearchIcon className="size-4 text-blue-500" />
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {t("searchLabel")}
          </span>
        </InputGroupAddon>
        <InputGroupInput
          type="search"
          value={searchInput}
          maxLength={120}
          disabled={disabled}
          onChange={(event) => setSearchInput(event.target.value)}
          // Dentro de un formulario, Enter no debe enviarlo.
          onKeyDown={(event) => {
            if (event.key === "Enter") event.preventDefault();
          }}
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchLabel")}
          autoComplete="off"
        />
      </InputGroup>

      {error ? (
        <div className="space-y-3">
          <Alert variant="destructive">
            <AlertDescription>{t("catalogError")}</AlertDescription>
          </Alert>
          <Button type="button" variant="outline" size="sm" onClick={reload}>
            <RegenerateIcon className="fill-current" />
            {t("retry")}
          </Button>
        </div>
      ) : !hasData ? (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Spinner />
          {t("loadingCatalog")}
        </div>
      ) : conditions.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {total === 0 && page === 1 ? t("noResults") : t("emptyPage")}
        </p>
      ) : (
        <ul
          className={`grid gap-3 sm:grid-cols-2 ${isLoading ? "opacity-60" : ""}`}
          aria-busy={isLoading}
        >
          {conditions.map((condition) => {
            const isSelected = selectedIds.has(condition.id);
            const isAssigned = assignedIds.includes(condition.id);
            const selectedCondition = selected.find(
              (item) => item.condition.id === condition.id,
            );
            return (
              <li
                key={condition.id}
                className={`space-y-3 rounded-xl border px-4 py-3 transition-colors ${
                  isSelected
                    ? "cursor-pointer border-blue-400 bg-blue-50 dark:border-blue-500/50 dark:bg-blue-500/10"
                    : isAssigned
                      ? "border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-white/3"
                      : "cursor-pointer border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50 dark:border-gray-800 dark:bg-white/3 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/5"
                }`}
                role={!isAssigned ? "button" : undefined}
                tabIndex={!isAssigned && !disabled ? 0 : undefined}
                aria-pressed={!isAssigned ? isSelected : undefined}
                onClick={() => !isAssigned && !disabled && toggle(condition)}
                onKeyDown={(event) => {
                  if (
                    event.target === event.currentTarget &&
                    !isAssigned &&
                    !disabled &&
                    (event.key === "Enter" || event.key === " ")
                  ) {
                    event.preventDefault();
                    toggle(condition);
                  }
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">
                      {condition.name}
                    </p>
                    {condition.description && (
                      <p className="line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                        {condition.description}
                      </p>
                    )}
                  </div>
                  {isAssigned && (
                    <Badge size="sm" color="gray">
                      {t("alreadyAssigned")}
                    </Badge>
                  )}
                </div>
                {isSelected && selectedCondition && (
                  <Field onClick={(event) => event.stopPropagation()}>
                    <FieldLabel className="text-xs">
                      {t("notesLabel")}{" "}
                      <span className="font-normal text-gray-400">
                        ({t("optional")})
                      </span>
                    </FieldLabel>
                    <Textarea
                      value={selectedCondition.notes}
                      rows={2}
                      maxLength={CONDITION_NOTES_MAX_LENGTH}
                      disabled={disabled}
                      placeholder={t("notesPlaceholder")}
                      onChange={(event) =>
                        setNotes(condition.id, event.target.value)
                      }
                    />
                  </Field>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {hasData && total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500 dark:text-gray-400">
          <span>{t("pageSummary", { page, totalPages, total })}</span>
          <div className="flex gap-2">
            <Button
              type="button"
              size="xs"
              variant="outline"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage(page - 1)}
            >
              <ArrowLeftIcon className="fill-current rtl:rotate-180" />
              {t("previous")}
            </Button>
            <Button
              type="button"
              size="xs"
              variant="outline"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage(page + 1)}
            >
              {t("next")}
              <ArrowRightIcon className="fill-current rtl:rotate-180" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
