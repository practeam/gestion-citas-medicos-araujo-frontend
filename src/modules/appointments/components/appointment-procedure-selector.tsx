import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "@/i18n";
import { SearchIcon } from "@/icons";
import type { Procedure } from "@/modules/procedures";
import { useEffect, useState } from "react";
import { useProcedureOptions } from "../hooks/use-procedure-options";

const SEARCH_DEBOUNCE_MS = 400;

interface AppointmentProcedureSelectorProps {
  /** Ids de procedimientos que ya forman parte de la cita. */
  selectedIds: ReadonlySet<number>;
  onAdd: (procedure: Procedure) => void;
  disabled?: boolean;
}

/**
 * Búsqueda y selección de procedimientos **activos** del catálogo para añadirlos
 * a la cita. No crea procedimientos: deben existir previamente.
 */
export function AppointmentProcedureSelector({
  selectedIds,
  onAdd,
  disabled = false,
}: AppointmentProcedureSelectorProps) {
  const t = useTranslations("appointments.procedures.selector");
  const [searchInput, setSearchInput] = useState("");
  const {
    options,
    total,
    hasData,
    catalogEmpty,
    error,
    isLoading,
    setSearch,
    reload,
  } = useProcedureOptions();

  useEffect(() => {
    const timer = setTimeout(
      () => setSearch(searchInput.trim()),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [searchInput, setSearch]);

  return (
    <div className="space-y-3">
      <div className="relative sm:max-w-xs">
        <SearchIcon className="pointer-events-none absolute inset-s-4 top-1/2 size-5 -translate-y-1/2 fill-gray-500 dark:fill-gray-400" />
        <Input
          type="search"
          value={searchInput}
          maxLength={150}
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
            <AlertDescription>{t("loadError")}</AlertDescription>
          </Alert>
          <Button type="button" variant="outline" size="sm" onClick={reload}>
            {t("retry")}
          </Button>
        </div>
      ) : !hasData ? (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Spinner />
          {t("loading")}
        </div>
      ) : catalogEmpty ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t("catalogEmpty")}
        </p>
      ) : options.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t("noResults")}
        </p>
      ) : (
        <>
          <ul
            className={`max-h-56 divide-y divide-gray-100 overflow-y-auto rounded-xl border border-gray-200 dark:divide-white/5 dark:border-gray-800 ${isLoading ? "opacity-60" : ""}`}
            aria-busy={isLoading}
          >
            {options.map((procedure) => {
              const added = selectedIds.has(procedure.id);
              return (
                <li
                  key={procedure.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">
                      {procedure.name}
                    </p>
                    <p className="line-clamp-1 text-xs text-gray-500 dark:text-gray-400">
                      {[
                        procedure.code,
                        procedure.base_price,
                        t("minutes", {
                          count: procedure.base_duration_minutes,
                        }),
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="xs"
                    variant="outline"
                    disabled={disabled || added}
                    onClick={() => onAdd(procedure)}
                  >
                    {added ? t("added") : t("add")}
                  </Button>
                </li>
              );
            })}
          </ul>
          {total > options.length && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t("refine", { shown: options.length, total })}
            </p>
          )}
        </>
      )}
    </div>
  );
}
