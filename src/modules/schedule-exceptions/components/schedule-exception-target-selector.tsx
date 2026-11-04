import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "@/i18n";
import { SearchIcon } from "@/icons";
import { useEffect, useState } from "react";
import {
  useTargetOptions,
  type TargetOption,
} from "../hooks/use-target-options";
import type { TargetType } from "../types/schedule-exception.types";

const SEARCH_DEBOUNCE_MS = 400;

interface TargetSelectorProps {
  type: TargetType;
  /** Id del objetivo elegido. */
  value: number | null;
  onSelect: (option: TargetOption) => void;
  disabled?: boolean;
}

/**
 * Elige la clínica o el trabajador a bloquear (solo activos), con búsqueda por
 * nombre. Usa los servicios de `clinics` y `staff` según `type`; el tipo de
 * objetivo se decide fuera (selección excluyente).
 */
export function ScheduleExceptionTargetSelector({
  type,
  value,
  onSelect,
  disabled = false,
}: TargetSelectorProps) {
  const t = useTranslations("scheduleExceptions.targetSelector");
  const [searchInput, setSearchInput] = useState("");
  const { options, total, hasData, error, isLoading, setSearch, reload } =
    useTargetOptions(type);

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
          maxLength={120}
          disabled={disabled}
          onChange={(event) => setSearchInput(event.target.value)}
          // Dentro de un formulario, Enter no debe enviarlo.
          onKeyDown={(event) => {
            if (event.key === "Enter") event.preventDefault();
          }}
          placeholder={t(`searchPlaceholder.${type}`)}
          aria-label={t(`searchLabel.${type}`)}
          className="ps-11"
          autoComplete="off"
        />
      </div>

      {error ? (
        <div className="space-y-3">
          <Alert variant="destructive">
            <AlertDescription>{t(`loadError.${type}`)}</AlertDescription>
          </Alert>
          <Button type="button" variant="outline" size="sm" onClick={reload}>
            {t("retry")}
          </Button>
        </div>
      ) : !hasData ? (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Spinner />
          {t(`loading.${type}`)}
        </div>
      ) : options.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t(`noResults.${type}`)}
        </p>
      ) : (
        <>
          <ul
            className={`divide-y divide-gray-100 rounded-xl border border-gray-200 dark:divide-white/5 dark:border-gray-800 ${isLoading ? "opacity-60" : ""}`}
            aria-busy={isLoading}
          >
            {options.map((option) => {
              const selected = option.id === value;
              return (
                <li
                  key={option.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">
                      {option.label}
                    </p>
                    {option.description && (
                      <p className="line-clamp-1 text-xs text-gray-500 dark:text-gray-400">
                        {option.description}
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    size="xs"
                    variant={selected ? "default" : "outline"}
                    aria-pressed={selected}
                    disabled={disabled}
                    onClick={() => onSelect(option)}
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
