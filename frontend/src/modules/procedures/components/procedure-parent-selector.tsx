import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "@/i18n";
import { SearchIcon } from "@/icons";
import { useEffect, useState } from "react";
import { useParentOptions } from "../hooks/use-parent-options";
import type { Procedure } from "../types/procedure.types";

const SEARCH_DEBOUNCE_MS = 400;

interface ProcedureParentSelectorProps {
  /** Id del padre elegido (`null` = sin padre). */
  value: number | null;
  /** Procedimiento que se edita: no puede ser su propio padre. */
  excludeId?: number;
  onSelect: (procedure: Procedure | null) => void;
  disabled?: boolean;
}

/**
 * Elige el procedimiento padre entre los procedimientos **activos**, con
 * búsqueda por nombre o código. Es opcional: "Sin padre" lo deja vacío. Los
 * ciclos jerárquicos los valida el backend.
 */
export function ProcedureParentSelector({
  value,
  excludeId,
  onSelect,
  disabled = false,
}: ProcedureParentSelectorProps) {
  const t = useTranslations("procedures.parentSelector");
  const [searchInput, setSearchInput] = useState("");
  const { options, total, hasData, error, isLoading, setSearch, reload } =
    useParentOptions(excludeId);

  useEffect(() => {
    const timer = setTimeout(
      () => setSearch(searchInput.trim()),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [searchInput, setSearch]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:max-w-xs">
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
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || value === null}
          onClick={() => onSelect(null)}
        >
          {t("none")}
        </Button>
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
              const selected = procedure.id === value;
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
                        `${procedure.base_price}`,
                        `${procedure.base_duration_minutes} min`,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="xs"
                    variant={selected ? "default" : "outline"}
                    aria-pressed={selected}
                    disabled={disabled}
                    onClick={() => onSelect(procedure)}
                  >
                    {selected ? t("selected") : t("select")}
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
