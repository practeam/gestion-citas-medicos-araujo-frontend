import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "@/i18n";
import { SearchIcon, XIcon } from "@/icons";
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
      <InputGroup>
        <InputGroupAddon>
          <SearchIcon className="size-5 fill-none text-blue-500 dark:text-blue-400" />
        </InputGroupAddon>
        <InputGroupInput
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
          autoComplete="off"
        />
      </InputGroup>

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
                  className={`cursor-pointer px-4 py-2.5 transition-colors ${
                    selected
                      ? "bg-green-50 ring-1 ring-green-300 ring-inset dark:bg-green-500/10 dark:ring-green-500/40"
                      : "hover:bg-blue-50 dark:hover:bg-blue-500/10"
                  }`}
                  role="button"
                  tabIndex={disabled ? undefined : 0}
                  aria-pressed={selected}
                  onClick={() => !disabled && onSelect(procedure)}
                  onKeyDown={(event) => {
                    if (
                      !disabled &&
                      (event.key === "Enter" || event.key === " ")
                    ) {
                      event.preventDefault();
                      onSelect(procedure);
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
                        `${procedure.base_price}`,
                        `${procedure.base_duration_minutes} min`,
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

      <Button
        type="button"
        variant="outline"
        className="w-full border-red-200 bg-red-50/60 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/15 dark:hover:text-red-300"
        disabled={disabled || value === null}
        onClick={() => onSelect(null)}
      >
        <XIcon className="fill-current" />
        {t("none")}
      </Button>
    </div>
  );
}
