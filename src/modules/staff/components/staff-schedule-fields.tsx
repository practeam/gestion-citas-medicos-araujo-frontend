import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "@/i18n";
import type { ScheduleFormValues } from "../types/staff-schedule.types";
import { WEEK_DAYS } from "../utils/staff-schedule.utils";

interface StaffScheduleFieldsProps {
  values: ScheduleFormValues;
  onChange: (values: ScheduleFormValues) => void;
  /** Clave i18n (relativa a `staff.schedules.validation`) del error del intervalo. */
  errorKey?: string;
  disabled?: boolean;
}

/**
 * Campos de un intervalo semanal: día, horas locales y vigencia. No hay zona
 * horaria editable: son horas locales del integrante.
 */
export function StaffScheduleFields({
  values,
  onChange,
  errorKey,
  disabled = false,
}: StaffScheduleFieldsProps) {
  const t = useTranslations("staff.schedules");
  const tValidation = useTranslations("staff.schedules.validation");

  const set = <K extends keyof ScheduleFormValues>(
    key: K,
    value: ScheduleFormValues[K],
  ) => onChange({ ...values, [key]: value });

  return (
    <div className="space-y-2">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Field>
          <FieldLabel className="text-xs">{t("fields.day")}</FieldLabel>
          <Select
            value={String(values.day_of_week)}
            disabled={disabled}
            onValueChange={(value) => set("day_of_week", Number(value))}
          >
            <SelectTrigger size="sm">
              <SelectValue>{(value: string) => t(`days.${value}`)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {WEEK_DAYS.map((day) => (
                <SelectItem key={day} value={String(day)}>
                  {t(`days.${day}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel className="text-xs">{t("fields.startsAt")}</FieldLabel>
          <Input
            type="time"
            value={values.starts_at}
            disabled={disabled}
            aria-invalid={errorKey ? "true" : undefined}
            onChange={(event) => set("starts_at", event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel className="text-xs">{t("fields.endsAt")}</FieldLabel>
          <Input
            type="time"
            value={values.ends_at}
            disabled={disabled}
            aria-invalid={errorKey ? "true" : undefined}
            onChange={(event) => set("ends_at", event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel className="text-xs">{t("fields.validFrom")}</FieldLabel>
          <Input
            type="date"
            value={values.valid_from}
            disabled={disabled}
            aria-invalid={errorKey ? "true" : undefined}
            onChange={(event) => set("valid_from", event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel className="text-xs">
            {t("fields.validUntil")}{" "}
            <span className="font-normal text-gray-400">({t("optional")})</span>
          </FieldLabel>
          <Input
            type="date"
            value={values.valid_until}
            disabled={disabled}
            aria-invalid={errorKey ? "true" : undefined}
            onChange={(event) => set("valid_until", event.target.value)}
          />
        </Field>
      </div>
      {errorKey && <FieldError errors={[{ message: tValidation(errorKey) }]} />}
    </div>
  );
}
