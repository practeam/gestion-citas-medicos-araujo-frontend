import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "@/i18n";
import { UserCircleIcon, UserIcon } from "@/icons";
import { useEffect, useState } from "react";
import { useEntityOptions } from "../hooks/use-entity-options";
import type {
  AppointmentEntityOption,
  AppointmentEntityType,
} from "../types/appointment.types";

const SEARCH_DEBOUNCE_MS = 400;

interface AppointmentEntitySelectorProps {
  type: AppointmentEntityType;
  /** Id elegido. */
  value: number | null;
  onSelect: (option: AppointmentEntityOption) => void;
  disabled?: boolean;
  /** Permite elegir desde toda la fila y oculta el botÃ³n de selecciÃ³n. */
  rowSelection?: boolean;
}

/**
 * Elige un paciente o un miembro del personal activo, con búsqueda por nombre.
 * Sirve de `AppointmentPatientSelector` y `AppointmentStaffSelector` según
 * `type`; usa los servicios de `patients` y `staff`. No crea registros.
 */
export function AppointmentEntitySelector({
  type,
  value,
  onSelect,
  disabled = false,
  rowSelection = false,
}: AppointmentEntitySelectorProps) {
  const t = useTranslations("appointments.selector");
  const [searchInput, setSearchInput] = useState("");
  const { options, total, hasData, error, isLoading, setSearch, reload } =
    useEntityOptions(type);

  useEffect(() => {
    const timer = setTimeout(
      () => setSearch(searchInput.trim()),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [searchInput, setSearch]);

  return (
    <div className="space-y-3">
      <InputGroup className="min-w-0">
        <InputGroupAddon className="border-e border-gray-200 px-3 dark:border-gray-700">
          {type === "patient" ? (
            <UserIcon className="size-4 text-blue-500" />
          ) : (
            <UserCircleIcon className="size-4 text-purple-500" />
          )}
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {type === "patient" ? t("patientOption") : t("staffOption")}
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
          placeholder={t(`searchPlaceholder.${type}`)}
          aria-label={t(`searchLabel.${type}`)}
          autoComplete="off"
        />
      </InputGroup>

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
            className={`max-h-56 divide-y divide-gray-100 overflow-y-auto rounded-xl border border-gray-200 dark:divide-white/5 dark:border-gray-800 ${isLoading ? "opacity-60" : ""}`}
            aria-busy={isLoading}
          >
            {options.map((option) => {
              const selected = option.id === value;
              return (
                <li
                  key={option.id}
                  className={`flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 transition-colors ${
                    rowSelection
                      ? selected
                        ? "cursor-pointer bg-blue-50 dark:bg-blue-500/15"
                        : "cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5"
                      : ""
                  }`}
                  role={rowSelection ? "button" : undefined}
                  tabIndex={rowSelection && !disabled ? 0 : undefined}
                  aria-pressed={rowSelection ? selected : undefined}
                  title={
                    rowSelection
                      ? selected
                        ? t("selected")
                        : t("select")
                      : undefined
                  }
                  onClick={() => rowSelection && !disabled && onSelect(option)}
                  onKeyDown={(event) => {
                    if (
                      rowSelection &&
                      !disabled &&
                      (event.key === "Enter" || event.key === " ")
                    ) {
                      event.preventDefault();
                      onSelect(option);
                    }
                  }}
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
                  {!rowSelection && (
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
                  )}
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
