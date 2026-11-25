import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "@/i18n";
import { SearchIcon, XIcon } from "@/icons";
import type { Role } from "@/modules/roles";
import { useEffect, useState } from "react";
import { useActiveRoles } from "../hooks/use-active-roles";

const SEARCH_DEBOUNCE_MS = 400;

interface StaffRolePickerProps {
  /** Roles elegidos (estado del formulario que lo contiene). */
  selected: Role[];
  onChange: (roles: Role[]) => void;
  /** Roles ya asignados: se muestran como asignados y no pueden elegirse de nuevo. */
  assignedIds?: number[];
  disabled?: boolean;
}

/**
 * Selección múltiple de roles **activos** del catálogo (servicio del módulo
 * `roles`). No crea ni modifica roles. La selección se conserva al buscar.
 */
export function StaffRolePicker({
  selected,
  onChange,
  assignedIds = [],
  disabled = false,
}: StaffRolePickerProps) {
  const t = useTranslations("staff.roles");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const { roles, total, hasData, error, isLoading, reload } =
    useActiveRoles(search);

  useEffect(() => {
    const timer = setTimeout(
      () => setSearch(searchInput.trim()),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [searchInput]);

  const selectedIds = new Set(selected.map((role) => role.id));

  const toggle = (role: Role) =>
    onChange(
      selectedIds.has(role.id)
        ? selected.filter((item) => item.id !== role.id)
        : [...selected, role],
    );

  return (
    <div className="space-y-4">
      {selected.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label={t("selectedLabel")}>
          {selected.map((role) => (
            <li key={role.id}>
              <Badge size="lg" color="primary" className="gap-2">
                {role.name}
                <button
                  type="button"
                  className="inline-flex"
                  disabled={disabled}
                  aria-label={t("removeSelection", { name: role.name })}
                  onClick={() => toggle(role)}
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
          maxLength={80}
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
      ) : roles.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {search ? t("noResults") : t("catalogEmpty")}
        </p>
      ) : (
        <>
          <ul
            className={`divide-y divide-gray-100 rounded-xl border border-gray-200 dark:divide-white/5 dark:border-gray-800 ${isLoading ? "opacity-60" : ""}`}
            aria-busy={isLoading}
          >
            {roles.map((role) => {
              const isSelected = selectedIds.has(role.id);
              const isAssigned = assignedIds.includes(role.id);
              return (
                <li
                  key={role.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">
                      {role.name}
                    </p>
                    {role.description && (
                      <p className="line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                        {role.description}
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
                      onClick={() => toggle(role)}
                    >
                      {isSelected ? t("selected") : t("select")}
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
          {total > roles.length && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t("refine", { shown: roles.length, total })}
            </p>
          )}
        </>
      )}
    </div>
  );
}
