import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "@/i18n";
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
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field>
          <FieldLabel className="text-xs">{t("clinic")}</FieldLabel>
          <Select
            value={filters.clinicId === null ? ALL : String(filters.clinicId)}
            onValueChange={(value) =>
              onChange({ clinicId: value === ALL ? null : Number(value) })
            }
          >
            <SelectTrigger size="sm">
              <SelectValue>
                {() =>
                  optionLabel(clinics.options, filters.clinicId) ??
                  t("allClinics")
                }
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
        </Field>
        <Field>
          <FieldLabel className="text-xs">{t("staff")}</FieldLabel>
          <Select
            value={
              filters.staffMemberId === null
                ? ALL
                : String(filters.staffMemberId)
            }
            onValueChange={(value) =>
              onChange({ staffMemberId: value === ALL ? null : Number(value) })
            }
          >
            <SelectTrigger size="sm">
              <SelectValue>
                {() =>
                  optionLabel(staff.options, filters.staffMemberId) ??
                  t("allStaff")
                }
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
        </Field>
        <Field>
          <FieldLabel className="text-xs">{t("status")}</FieldLabel>
          <Select
            value={filters.status}
            onValueChange={(value) =>
              onChange({ status: value as OverrideStatusFilter })
            }
          >
            <SelectTrigger size="sm">
              <SelectValue>
                {(value: string) => t(`statusOptions.${value}`)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {t(`statusOptions.${option}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <div className="flex items-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!hasFilters}
            onClick={onClear}
          >
            {t("clear")}
          </Button>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field>
          <FieldLabel className="text-xs">{t("rangeStart")}</FieldLabel>
          <Input
            type="datetime-local"
            value={filters.rangeStart}
            onChange={(event) => onChange({ rangeStart: event.target.value })}
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
        <p className="self-end text-xs text-gray-500 sm:col-span-2 dark:text-gray-400">
          {t("rangeHint")}
        </p>
      </div>
    </div>
  );
}
