import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "@/i18n";
import { SearchIcon } from "@/icons";
import { useEffect, useState } from "react";
import { useEntityOptions, type EntityKind } from "../hooks/use-entity-options";
import type { EntityOption } from "../types/conversation.types";

const SEARCH_DEBOUNCE_MS = 400;

interface EntitySelectorProps {
  kind: EntityKind;
  /** Id elegido. */
  value: number | null;
  /** Ids que no se pueden elegir (p. ej. el trabajador ya asignado). */
  excludeIds?: readonly number[];
  onSelect: (option: EntityOption) => void;
  disabled?: boolean;
}

/**
 * Elige una persona (no tiene que ser paciente) o un miembro del personal
 * activo, con búsqueda por nombre. No crea personas ni trabajadores.
 */
export function EntitySelector({
  kind,
  value,
  excludeIds = [],
  onSelect,
  disabled = false,
}: EntitySelectorProps) {
  const t = useTranslations("conversations.selector");
  const [searchInput, setSearchInput] = useState("");
  const { options, total, hasData, error, isLoading, setSearch, reload } =
    useEntityOptions(kind);
  const visible = options.filter((option) => !excludeIds.includes(option.id));

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
          onKeyDown={(event) => {
            if (event.key === "Enter") event.preventDefault();
          }}
          placeholder={t(`searchPlaceholder.${kind}`)}
          aria-label={t(`searchLabel.${kind}`)}
          className="ps-11"
          autoComplete="off"
        />
      </div>

      {error ? (
        <div className="space-y-3">
          <Alert variant="destructive">
            <AlertDescription>{t(`loadError.${kind}`)}</AlertDescription>
          </Alert>
          <Button type="button" variant="outline" size="sm" onClick={reload}>
            {t("retry")}
          </Button>
        </div>
      ) : !hasData ? (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Spinner />
          {t(`loading.${kind}`)}
        </div>
      ) : visible.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t(`noResults.${kind}`)}
        </p>
      ) : (
        <>
          <ul
            className={`max-h-56 divide-y divide-gray-100 overflow-y-auto rounded-xl border border-gray-200 dark:divide-white/5 dark:border-gray-800 ${isLoading ? "opacity-60" : ""}`}
            aria-busy={isLoading}
          >
            {visible.map((option) => {
              const selected = option.id === value;
              return (
                <li
                  key={option.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5"
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
