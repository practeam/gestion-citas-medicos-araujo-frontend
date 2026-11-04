import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "@/i18n";
import { SearchIcon, XIcon } from "@/icons";
import type { Specialty } from "@/modules/specialties";
import { useEffect, useState } from "react";
import { useActiveSpecialties } from "../hooks/use-active-specialties";

const SEARCH_DEBOUNCE_MS = 400;

interface StaffSpecialtyPickerProps {
  /** Permisos elegidos (estado del formulario que lo contiene). */
  selected: Specialty[];
  onChange: (specialties: Specialty[]) => void;
  /** Permisos ya asignados: se muestran como asignados y no pueden elegirse de nuevo. */
  assignedIds?: number[];
  disabled?: boolean;
}

/**
 * Selección múltiple de permisos **activos** del catálogo (servicio del módulo
 * `specialties`), con búsqueda y paginación del servidor. No crea ni modifica
 * permisos. La selección se conserva al buscar o cambiar de página.
 */
export function StaffSpecialtyPicker({
  selected,
  onChange,
  assignedIds = [],
  disabled = false,
}: StaffSpecialtyPickerProps) {
  const t = useTranslations("staff.specialties");
  const [searchInput, setSearchInput] = useState("");
  const {
    specialties,
    total,
    page,
    pageSize,
    hasData,
    error,
    isLoading,
    setSearch,
    setPage,
    reload,
  } = useActiveSpecialties();

  useEffect(() => {
    const timer = setTimeout(
      () => setSearch(searchInput.trim()),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [searchInput, setSearch]);

  const selectedIds = new Set(selected.map((specialty) => specialty.id));
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const toggle = (specialty: Specialty) =>
    onChange(
      selectedIds.has(specialty.id)
        ? selected.filter((item) => item.id !== specialty.id)
        : [...selected, specialty],
    );

  return (
    <div className="space-y-4">
      {selected.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label={t("selectedLabel")}>
          {selected.map((specialty) => (
            <li key={specialty.id}>
              <Badge size="lg" color="primary" className="gap-2">
                {specialty.name}
                <button
                  type="button"
                  className="inline-flex"
                  disabled={disabled}
                  aria-label={t("removeSelection", { name: specialty.name })}
                  onClick={() => toggle(specialty)}
                >
                  <XIcon />
                </button>
              </Badge>
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
      ) : specialties.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {total === 0 && page === 1 ? t("noResults") : t("emptyPage")}
        </p>
      ) : (
        <ul
          className={`divide-y divide-gray-100 rounded-xl border border-gray-200 dark:divide-white/5 dark:border-gray-800 ${isLoading ? "opacity-60" : ""}`}
          aria-busy={isLoading}
        >
          {specialties.map((specialty) => {
            const isSelected = selectedIds.has(specialty.id);
            const isAssigned = assignedIds.includes(specialty.id);
            return (
              <li
                key={specialty.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">
                    {specialty.name}
                  </p>
                  {specialty.description && (
                    <p className="line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                      {specialty.description}
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
                    onClick={() => toggle(specialty)}
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
