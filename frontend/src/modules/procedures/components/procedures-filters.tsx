import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
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
import {
  CheckCircleIcon,
  DollarIcon,
  FilterIcon,
  LayerIcon,
  SearchIcon,
  TrashBinIcon,
  XIcon,
} from "@/icons";
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
    <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,3fr)_8rem_12rem_9rem_2rem]">
      <div className="min-w-0 sm:col-span-2 xl:col-span-1">
        <InputGroup className="min-w-0">
          <InputGroupAddon>
            <SearchIcon className="size-5 fill-none text-blue-500 dark:text-blue-400" />
          </InputGroupAddon>
          <InputGroupInput
            type="search"
            value={search}
            maxLength={150}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchLabel")}
          />
        </InputGroup>
      </div>
      <div>
        <Select
          value={filters.status}
          onValueChange={(value) =>
            onChange({ status: value as ProcedureStatusFilter })
          }
        >
          <SelectTrigger
            className="w-full xl:w-32"
            aria-label={t("statusLabel")}
          >
            <SelectValue>
              {(value: string) => (
                <>
                  {value === "active" ? (
                    <CheckCircleIcon className="size-4 text-green-500" />
                  ) : value === "inactive" ? (
                    <XIcon className="size-4 text-red-500" />
                  ) : (
                    <FilterIcon className="size-4 text-gray-500" />
                  )}
                  {t(`status.${value}`)}
                </>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option === "active" ? (
                  <CheckCircleIcon className="size-4 text-green-500" />
                ) : option === "inactive" ? (
                  <XIcon className="size-4 text-red-500" />
                ) : (
                  <FilterIcon className="size-4 text-gray-500" />
                )}
                {t(`status.${option}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Popover open={parentOpen} onOpenChange={setParentOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start truncate font-normal"
            />
          }
        >
          <LayerIcon className="fill-current text-purple-500" />
          <span className="truncate">
            {filters.parentId === null
              ? t("allParents")
              : (labels[filters.parentId] ?? `#${filters.parentId}`)}
          </span>
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

      <Popover>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              className={`w-full justify-start font-normal ${
                minInvalid || maxInvalid
                  ? "border-red-500 text-red-600 dark:border-red-500 dark:text-red-400"
                  : ""
              }`}
            />
          }
        >
          <DollarIcon className="fill-current text-green-500" />
          {t("price")}
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72 p-4">
          <div className="grid grid-cols-2 gap-3">
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
            </Field>
          </div>
          {(minInvalid || maxInvalid) && (
            <p className="mt-2 text-xs text-red-500">{t("priceInvalid")}</p>
          )}
        </PopoverContent>
      </Popover>

      <div className="flex items-center xl:justify-end">
        <Button
          type="button"
          variant="outline"
          size="icon-xs"
          className="border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700 disabled:text-gray-300 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300 dark:disabled:text-gray-600"
          disabled={!hasFilters}
          aria-label={t("clear")}
          title={t("clear")}
          onClick={() => {
            setSearch("");
            onClear();
          }}
        >
          <TrashBinIcon className="fill-current" />
        </Button>
      </div>
    </div>
  );
}
