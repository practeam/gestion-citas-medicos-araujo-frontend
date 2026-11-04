import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "@/i18n";
import { SearchIcon } from "@/icons";
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
      {selected.length > 0 && (
        <ul className="space-y-3" aria-label={t("selectedLabel")}>
          {selected.map(({ condition, notes }) => (
            <li
              key={condition.id}
              className="space-y-2 rounded-xl border border-brand-200 bg-brand-50/50 p-4 dark:border-brand-500/30 dark:bg-brand-500/5"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {condition.name}
                </p>
                <Button
                  type="button"
                  size="xs"
                  variant="outline"
                  disabled={disabled}
                  aria-label={t("removeSelection", { name: condition.name })}
                  onClick={() => toggle(condition)}
                >
                  {t("removeFromSelection")}
                </Button>
              </div>
              <Field>
                <FieldLabel className="text-xs">
                  {t("notesLabel")}{" "}
                  <span className="font-normal text-gray-400">
                    ({t("optional")})
                  </span>
                </FieldLabel>
                <Textarea
                  value={notes}
                  rows={2}
                  maxLength={CONDITION_NOTES_MAX_LENGTH}
                  disabled={disabled}
                  placeholder={t("notesPlaceholder")}
                  onChange={(event) =>
                    setNotes(condition.id, event.target.value)
                  }
                />
              </Field>
            </li>
          ))}
        </ul>
      )}

      <div className="relative sm:max-w-xs">
        <SearchIcon className="pointer-events-none absolute inset-s-4 top-1/2 size-5 -translate-y-1/2 fill-gray-500 dark:fill-gray-400" />
        <Input
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
          className="ps-11"
          autoComplete="off"
        />
      </div>

      {error ? (
        <div className="space-y-3">
          <Alert variant="destructive">
            <AlertDescription>{t("catalogError")}</AlertDescription>
          </Alert>
          <Button type="button" variant="outline" size="sm" onClick={reload}>
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
          className={`divide-y divide-gray-100 rounded-xl border border-gray-200 dark:divide-white/5 dark:border-gray-800 ${isLoading ? "opacity-60" : ""}`}
          aria-busy={isLoading}
        >
          {conditions.map((condition) => {
            const isSelected = selectedIds.has(condition.id);
            const isAssigned = assignedIds.includes(condition.id);
            return (
              <li
                key={condition.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
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
                {isAssigned ? (
                  <Badge size="sm" color="gray">
                    {t("alreadyAssigned")}
                  </Badge>
                ) : (
                  <Button
                    type="button"
                    size="xs"
                    variant={isSelected ? "default" : "outline"}
                    aria-pressed={isSelected}
                    disabled={disabled}
                    onClick={() => toggle(condition)}
                  >
                    {isSelected ? t("selected") : t("select")}
                  </Button>
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
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
