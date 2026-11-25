import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "@/i18n";
import {
  GUARDIAN_RELATIONSHIPS,
  type GuardianRelationship,
} from "../types/guardian.types";

interface GuardianRelationshipSelectProps {
  /** `null` mientras no se haya elegido: el parentesco es obligatorio y no tiene valor por defecto. */
  value: GuardianRelationship | null;
  onChange: (value: GuardianRelationship) => void;
  disabled?: boolean;
  invalid?: boolean;
  ariaLabel: string;
}

/** Parentesco con el paciente (valores del backend; las etiquetas se traducen, nunca se envían). */
export function GuardianRelationshipSelect({
  value,
  onChange,
  disabled = false,
  invalid = false,
  ariaLabel,
}: GuardianRelationshipSelectProps) {
  const t = useTranslations("guardians.relationship");
  const tCommon = useTranslations("guardians");

  return (
    <Select
      value={value ?? ""}
      disabled={disabled}
      onValueChange={(next) => onChange(next as GuardianRelationship)}
    >
      <SelectTrigger
        aria-label={ariaLabel}
        aria-invalid={invalid ? "true" : undefined}
      >
        <SelectValue>
          {(selected: string) =>
            selected ? t(selected) : tCommon("relationshipPlaceholder")
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {GUARDIAN_RELATIONSHIPS.map((option) => (
          <SelectItem key={option} value={option}>
            {t(option)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
