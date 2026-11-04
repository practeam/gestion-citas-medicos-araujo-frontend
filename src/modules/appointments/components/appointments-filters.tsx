import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
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
import { useState } from "react";
import { useEntityLabels } from "../hooks/use-entity-labels";
import {
  APPOINTMENT_STATUSES,
  type AppointmentEntityType,
  type AppointmentFilters,
  type AppointmentStatusFilter,
} from "../types/appointment.types";
import { AppointmentEntitySelector } from "./appointment-entity-selector";

const STATUS_OPTIONS: AppointmentStatusFilter[] = [
  "all",
  ...APPOINTMENT_STATUSES,
];

interface EntityFilterProps {
  type: AppointmentEntityType;
  value: number | null;
  onChange: (id: number | null) => void;
}

/** Filtro por paciente o personal: popover con búsqueda (no limita a las primeras opciones). */
function EntityFilter({ type, value, onChange }: EntityFilterProps) {
  const t = useTranslations("appointments.filters");
  const [open, setOpen] = useState(false);
  const labels = useEntityLabels(type, value === null ? [] : [value]);
  const all = type === "patient" ? t("allPatients") : t("allStaff");

  return (
    <Field>
      <FieldLabel className="text-xs">
        {type === "patient" ? t("patient") : t("staff")}
      </FieldLabel>
      <Popover open={open} onOpenChange={setOpen}>
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
          {value === null ? all : (labels[value] ?? `#${value}`)}
        </PopoverTrigger>
        <PopoverContent align="start" className="w-80 max-w-[90vw] p-4">
          <div className="space-y-3">
            <AppointmentEntitySelector
              type={type}
              value={value}
              onSelect={(option) => {
                onChange(option.id);
                setOpen(false);
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={value === null}
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
            >
              {all}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </Field>
  );
}

interface AppointmentsFiltersProps {
  filters: AppointmentFilters;
  hasFilters: boolean;
  onChange: (patch: Partial<AppointmentFilters>) => void;
  onClear: () => void;
}

/** Filtros de la agenda: paciente, personal y estado (combinables). */
export function AppointmentsFilters({
  filters,
  hasFilters,
  onChange,
  onClear,
}: AppointmentsFiltersProps) {
  const t = useTranslations("appointments.filters");
  const tStatus = useTranslations("appointments.status");

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <EntityFilter
        type="patient"
        value={filters.patientId}
        onChange={(patientId) => onChange({ patientId })}
      />
      <EntityFilter
        type="staff"
        value={filters.staffMemberId}
        onChange={(staffMemberId) => onChange({ staffMemberId })}
      />
      <Field>
        <FieldLabel className="text-xs">{t("status")}</FieldLabel>
        <Select
          value={filters.status}
          onValueChange={(value) =>
            onChange({ status: value as AppointmentStatusFilter })
          }
        >
          <SelectTrigger size="sm">
            <SelectValue>
              {(value: string) =>
                value === "all" ? t("allStatuses") : tStatus(value)
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option === "all" ? t("allStatuses") : tStatus(option)}
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
  );
}
