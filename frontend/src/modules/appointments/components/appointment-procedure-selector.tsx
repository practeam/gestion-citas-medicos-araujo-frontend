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
      <div className="relative">
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
            className={`grid custom-scrollbar max-h-96 gap-3 overflow-y-auto pe-1 ${isLoading ? "opacity-60" : ""}`}
            aria-busy={isLoading}
          >
            {options.map((procedure) => {
              const added = selectedIds.has(procedure.id);
              return (
                <li
                  key={procedure.id}
                  className={`rounded-xl border px-4 py-3 transition-colors ${
                    added
                      ? "border-green-300 bg-green-50 dark:border-green-500/40 dark:bg-green-500/10"
                      : "cursor-pointer border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 dark:border-gray-800 dark:bg-white/3 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10"
                  }`}
                  role={!added ? "button" : undefined}
                  tabIndex={!added && !disabled ? 0 : undefined}
                  aria-pressed={added}
                  title={added ? t("added") : t("add")}
                  onClick={() => !added && !disabled && onAdd(procedure)}
                  onKeyDown={(event) => {
                    if (
                      !added &&
                      !disabled &&
                      (event.key === "Enter" || event.key === " ")
                    ) {
                      event.preventDefault();
                      onAdd(procedure);
                    }
                  }}
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
