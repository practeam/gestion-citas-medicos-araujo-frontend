import { Button } from "@/components/ui/button";
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
  ClockIcon,
  FilterIcon,
  TaskIcon,
  TrashBinIcon,
  UserCircleIcon,
  UserIcon,
  XIcon,
} from "@/icons";
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
  const icon =
    type === "patient" ? (
      <UserIcon className="size-4 text-blue-500" />
    ) : (
      <UserCircleIcon className="size-4 text-purple-500" />
    );

  return (
    <div className="min-w-0">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start truncate font-normal"
              aria-label={type === "patient" ? t("patient") : t("staff")}
            />
          }
        >
          {icon}
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
    </div>
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
    <div className="grid w-full grid-cols-1 items-center gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_11rem_2.75rem]">
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
      <div className="min-w-0">
        <Select
          value={filters.status}
          onValueChange={(value) =>
            onChange({ status: value as AppointmentStatusFilter })
          }
        >
          <SelectTrigger aria-label={t("status")}>
            <SelectValue>
              {(value: string) => (
                <>
                  {value === "pending" ? (
                    <ClockIcon className="size-4 text-amber-500" />
                  ) : value === "confirmed" ? (
                    <CheckCircleIcon className="size-4 text-blue-500" />
                  ) : value === "completed" ? (
                    <TaskIcon className="size-4 text-green-500" />
                  ) : value === "cancelled" ? (
                    <XIcon className="size-4 text-red-500" />
                  ) : (
                    <FilterIcon className="size-4 text-gray-500" />
                  )}
                  {value === "all" ? t("allStatuses") : tStatus(value)}
                </>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option === "pending" ? (
                  <ClockIcon className="size-4 text-amber-500" />
                ) : option === "confirmed" ? (
                  <CheckCircleIcon className="size-4 text-blue-500" />
                ) : option === "completed" ? (
                  <TaskIcon className="size-4 text-green-500" />
                ) : option === "cancelled" ? (
                  <XIcon className="size-4 text-red-500" />
                ) : (
                  <FilterIcon className="size-4 text-gray-500" />
                )}
                {option === "all" ? t("allStatuses") : tStatus(option)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex lg:justify-end">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
          disabled={!hasFilters}
          onClick={onClear}
          aria-label={t("clear")}
          title={t("clear")}
        >
          <TrashBinIcon className="fill-current" />
        </Button>
      </div>
    </div>
  );
}
