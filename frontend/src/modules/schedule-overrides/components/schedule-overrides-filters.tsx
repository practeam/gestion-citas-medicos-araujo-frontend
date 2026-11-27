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
import {
  CalendarIcon,
  CheckCircleIcon,
  FilterIcon,
  MapIcon,
  TrashBinIcon,
  UsersIcon,
  XIcon,
} from "@/icons";
import type { ScheduleOverrideFilters } from "../hooks/use-schedule-overrides";
import {
  useTargetOptions,
  type TargetOption,
} from "../hooks/use-target-options";
import type { OverrideStatusFilter } from "../types/schedule-override.types";

const ALL = "all";
const STATUS_OPTIONS: OverrideStatusFilter[] = ["all", "active", "inactive"];
/** Máximo que admite el backend por página; las listas de filtros muestran los primeros. */
const FILTER_OPTIONS_PAGE_SIZE = 100;

interface ScheduleOverridesFiltersProps {
  filters: ScheduleOverrideFilters;
  hasFilters: boolean;
  onChange: (patch: Partial<Omit<ScheduleOverrideFilters, "page">>) => void;
  onClear: () => void;
}

function optionLabel(options: TargetOption[], value: number | null) {
  if (value === null) return null;
  return options.find((option) => option.id === value)?.label ?? `#${value}`;
}

export function ScheduleOverridesFilters({
  filters,
  hasFilters,
  onChange,
  onClear,
}: ScheduleOverridesFiltersProps) {
  const t = useTranslations("scheduleOverrides.filters");
  const clinics = useTargetOptions("clinic", FILTER_OPTIONS_PAGE_SIZE);
  const staff = useTargetOptions("staff", FILTER_OPTIONS_PAGE_SIZE);

  return (
    <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_10rem_10rem_2rem]">
      <div>
        <Select
          value={filters.clinicId === null ? ALL : String(filters.clinicId)}
          onValueChange={(value) =>
            onChange({ clinicId: value === ALL ? null : Number(value) })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              {() => (
                <>
                  <MapIcon className="size-4 fill-current text-blue-500" />
                  {optionLabel(clinics.options, filters.clinicId) ??
                    t("allClinics")}
                </>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("allClinics")}</SelectItem>
            {clinics.options.map((option) => (
              <SelectItem key={option.id} value={String(option.id)}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Select
          value={
            filters.staffMemberId === null ? ALL : String(filters.staffMemberId)
          }
          onValueChange={(value) =>
            onChange({ staffMemberId: value === ALL ? null : Number(value) })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              {() => (
                <>
                  <UsersIcon className="size-4 fill-current text-purple-500" />
                  {optionLabel(staff.options, filters.staffMemberId) ??
                    t("allStaff")}
                </>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("allStaff")}</SelectItem>
            {staff.options.map((option) => (
              <SelectItem key={option.id} value={String(option.id)}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Select
          value={filters.status}
          onValueChange={(value) =>
            onChange({ status: value as OverrideStatusFilter })
          }
        >
          <SelectTrigger className="w-full">
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
                  {t(`statusOptions.${value}`)}
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
                {t(`statusOptions.${option}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Popover>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start font-normal"
            />
          }
        >
          <CalendarIcon className="fill-current text-green-500" />
          {t("period")}
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 max-w-[90vw] p-4">
          <div className="space-y-3">
            <Field>
              <FieldLabel className="text-xs">{t("rangeStart")}</FieldLabel>
              <Input
                type="datetime-local"
                value={filters.rangeStart}
                onChange={(event) =>
                  onChange({ rangeStart: event.target.value })
                }
              />
            </Field>
            <Field>
              <FieldLabel className="text-xs">{t("rangeEnd")}</FieldLabel>
              <Input
                type="datetime-local"
                value={filters.rangeEnd}
                onChange={(event) => onChange({ rangeEnd: event.target.value })}
              />
            </Field>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t("rangeHint")}
            </p>
          </div>
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
          onClick={onClear}
        >
          <TrashBinIcon className="fill-current" />
        </Button>
      </div>
    </div>
  );
}
