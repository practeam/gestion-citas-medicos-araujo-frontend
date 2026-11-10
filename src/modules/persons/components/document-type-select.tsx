import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "@/i18n";
import { PERSON_DOCUMENT_TYPES } from "../schemas/person-schema";

/** Valor interno de "sin selección" (el valor real vacío es `""`). */
const NONE = "__none__";

interface DocumentTypeSelectProps {
  /** Tipo de documento en mayúsculas; `""` = sin selección. */
  value: string;
  onChange: (value: string) => void;
  /** Texto de la opción que deja el campo vacío. */
  emptyLabel: string;
  ariaLabel: string;
  invalid?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Selector del tipo de documento: DNI y los documentos de identificación más
 * comunes en Perú. Los valores se guardan en mayúsculas (así los espera la
 * base de datos). Si una persona ya tiene un tipo que no está en la lista
 * (datos anteriores), se conserva como opción para no perderlo al editar.
 */
export function DocumentTypeSelect({
  value,
  onChange,
  emptyLabel,
  ariaLabel,
  invalid,
  disabled,
  className,
}: DocumentTypeSelectProps) {
  const t = useTranslations("persons.documentTypes");
  const known = (PERSON_DOCUMENT_TYPES as readonly string[]).includes(value);
  const options =
    value && !known ? [...PERSON_DOCUMENT_TYPES, value] : PERSON_DOCUMENT_TYPES;
  const label = (option: string) =>
    option === NONE
      ? emptyLabel
      : (PERSON_DOCUMENT_TYPES as readonly string[]).includes(option)
        ? t(option)
        : option;

  return (
    <Select
      value={value || NONE}
      disabled={disabled}
      onValueChange={(next) => onChange(next === NONE ? "" : (next ?? ""))}
    >
      <SelectTrigger
        aria-label={ariaLabel}
        aria-invalid={invalid ? "true" : undefined}
        className={className}
      >
        <SelectValue>{(selected: string) => label(selected)}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE}>{emptyLabel}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {label(option)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
