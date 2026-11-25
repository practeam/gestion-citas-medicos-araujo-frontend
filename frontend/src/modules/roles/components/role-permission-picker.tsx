import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "@/i18n";
import { SearchIcon, XIcon } from "@/icons";
import type { Permission } from "@/modules/permissions";
import { useEffect, useState } from "react";
import { useActivePermissions } from "../hooks/use-active-permissions";

const SEARCH_DEBOUNCE_MS = 400;

interface RolePermissionPickerProps {
  /** Permisos elegidos (estado del formulario que lo contiene). */
  selected: Permission[];
  onChange: (permissions: Permission[]) => void;
  /** Permisos ya asignados: se muestran como asignados y no pueden elegirse de nuevo. */
  assignedIds?: number[];
  disabled?: boolean;
}

/**
 * Selección múltiple de permisos **activos** del catálogo (servicio del módulo
 * `permissions`), con búsqueda y paginación del servidor. No crea ni modifica
 * permisos. La selección se conserva al buscar o cambiar de página.
 */
export function RolePermissionPicker({
  selected,
  onChange,
  assignedIds = [],
  disabled = false,
}: RolePermissionPickerProps) {
  const t = useTranslations("roles.permissions");
  const [searchInput, setSearchInput] = useState("");
  const {
    permissions,
    total,
    page,
    pageSize,
    hasData,
    error,
    isLoading,
    setSearch,
    setPage,
    reload,
  } = useActivePermissions();

  useEffect(() => {
    const timer = setTimeout(
      () => setSearch(searchInput.trim()),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [searchInput, setSearch]);

  const selectedIds = new Set(selected.map((permission) => permission.id));
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const toggle = (permission: Permission) =>
    onChange(
      selectedIds.has(permission.id)
        ? selected.filter((item) => item.id !== permission.id)
        : [...selected, permission],
    );

  return (
    <div className="space-y-4">
      {selected.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label={t("selectedLabel")}>
          {selected.map((permission) => (
            <li key={permission.id}>
              <Badge size="lg" color="primary" className="font-mono gap-2">
                {permission.name}
                <button
                  type="button"
                  className="inline-flex"
                  disabled={disabled}
                  aria-label={t("removeSelection", { name: permission.name })}
                  onClick={() => toggle(permission)}
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
      ) : permissions.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {total === 0 && page === 1 ? t("noResults") : t("emptyPage")}
        </p>
      ) : (
        <ul
          className={`divide-y divide-gray-100 rounded-xl border border-gray-200 dark:divide-white/5 dark:border-gray-800 ${isLoading ? "opacity-60" : ""}`}
          aria-busy={isLoading}
        >
          {permissions.map((permission) => {
            const isSelected = selectedIds.has(permission.id);
            const isAssigned = assignedIds.includes(permission.id);
            return (
              <li
                key={permission.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="font-mono truncate text-sm font-medium text-gray-800 dark:text-white/90">
                    {permission.name}
                  </p>
                  {permission.description && (
                    <p className="line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                      {permission.description}
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
                    onClick={() => toggle(permission)}
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
