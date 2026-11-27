import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "@/i18n";
import { SearchIcon } from "@/icons";
import { useEffect, useState } from "react";
import type { ProcedureFilters } from "../hooks/use-procedures";
import { useProcedureLabels } from "../hooks/use-procedure-labels";
import type { ProcedureStatusFilter } from "../types/procedure.types";
import { isValidPrice } from "../utils/procedure-price.utils";
import { ProcedureParentSelector } from "./procedure-parent-selector";

const SEARCH_DEBOUNCE_MS = 400;
const STATUS_OPTIONS: ProcedureStatusFilter[] = ["all", "active", "inactive"];

interface ProceduresFiltersProps {
  filters: ProcedureFilters;
  hasFilters: boolean;
  onChange: (patch: Partial<Omit<ProcedureFilters, "page">>) => void;
  onClear: () => void;
}

export function ProceduresFilters({
  filters,
  hasFilters,
  onChange,
  onClear,
}: ProceduresFiltersProps) {
  const t = useTranslations("procedures.filters");
  const [search, setSearch] = useState(filters.search);
  const [parentOpen, setParentOpen] = useState(false);
  const labels = useProcedureLabels(
    filters.parentId === null ? [] : [filters.parentId],
  );

  useEffect(() => {
    const timer = setTimeout(
      () => onChange({ search: search.trim() }),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [search, onChange]);

  const minInvalid = filters.minPrice !== "" && !isValidPrice(filters.minPrice);
  const maxInvalid = filters.maxPrice !== "" && !isValidPrice(filters.maxPrice);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <div className="relative w-full sm:max-w-xs">
          <SearchIcon className="pointer-events-none absolute inset-s-4 top-1/2 size-5 -translate-y-1/2 fill-gray-500 dark:fill-gray-400" />
          <Input
            type="search"
            value={search}
            maxLength={150}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchLabel")}
            className="ps-11"
          />
        </div>
        <Select
          value={filters.status}
          onValueChange={(value) =>
            onChange({ status: value as ProcedureStatusFilter })
          }
        >
          <SelectTrigger className="sm:w-44" aria-label={t("statusLabel")}>
            <SelectValue>{(value: string) => t(`status.${value}`)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {t(`status.${option}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field>
          <FieldLabel className="text-xs">{t("parent")}</FieldLabel>
          <Popover open={parentOpen} onOpenChange={setParentOpen}>
            <PopoverTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full justify-start truncate font-normal"
                />
              }
            >
              {filters.parentId === null
                ? t("allParents")
                : (labels[filters.parentId] ?? `#${filters.parentId}`)}
            </PopoverTrigger>
            <PopoverContent align="start" className="w-80 max-w-[90vw] p-4">
              <ProcedureParentSelector
                value={filters.parentId}
                onSelect={(procedure) => {
                  onChange({ parentId: procedure?.id ?? null });
                  setParentOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
        </Field>
        <Field data-invalid={minInvalid}>
          <FieldLabel className="text-xs">{t("minPrice")}</FieldLabel>
          <Input
            inputMode="decimal"
            value={filters.minPrice}
            placeholder="0.00"
            aria-invalid={minInvalid ? "true" : undefined}
            onChange={(event) =>
              onChange({ minPrice: event.target.value.trim() })
            }
          />
          {minInvalid && (
            <p className="text-xs text-red-500">{t("priceInvalid")}</p>
          )}
        </Field>
        <Field data-invalid={maxInvalid}>
          <FieldLabel className="text-xs">{t("maxPrice")}</FieldLabel>
          <Input
            inputMode="decimal"
            value={filters.maxPrice}
            placeholder="0.00"
            aria-invalid={maxInvalid ? "true" : undefined}
            onChange={(event) =>
              onChange({ maxPrice: event.target.value.trim() })
            }
          />
          {maxInvalid && (
            <p className="text-xs text-red-500">{t("priceInvalid")}</p>
          )}
        </Field>
        <div className="flex items-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!hasFilters}
            onClick={() => {
              setSearch("");
              onClear();
            }}
          >
            {t("clear")}
          </Button>
        </div>
      </div>
    </div>
  );
}
