import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "@/i18n";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  RegenerateIcon,
  TrashBinIcon,
} from "@/icons";
import type { Procedure } from "@/modules/procedures";
import { useState } from "react";
import {
  createLine,
  getLineAmount,
  getLineDuration,
  getLineOperation,
  isEstimate,
  isPriceValid,
  summarizeLines,
  type AppointmentLine,
} from "../utils/appointment-lines.utils";
import { AppointmentProcedureSelector } from "./appointment-procedure-selector";
import { AppointmentProcedureSummary } from "./appointment-procedure-summary";

interface AppointmentProceduresSectionProps {
  lines: AppointmentLine[];
  onChange: (lines: AppointmentLine[]) => void;
  /** Minutos reservados por la cita (fin − inicio); `null` si el intervalo aún no es válido. */
  reservedMinutes: number | null;
  /** Ajusta la hora de fin a la duración requerida (solo por acción del usuario). */
  onAdjustEnd: (requiredMinutes: number) => void;
  disabled?: boolean;
}

/**
 * Sección de procedimientos dentro del formulario de citas: añadir desde el
 * catálogo (solo activos), cantidad, notas, precio unitario y duración por
 * línea, y resumen. Los valores calculados son derivados; el backend calcula
 * los definitivos. No cambia la hora de fin sin confirmación.
 */
export function AppointmentProceduresSection({
  lines,
  onChange,
  reservedMinutes,
  onAdjustEnd,
  disabled = false,
}: AppointmentProceduresSectionProps) {
  const t = useTranslations("appointments.procedures");
  const [expandedLineKey, setExpandedLineKey] = useState<string | null>(
    lines.find((line) => !line.removed)?.key ?? null,
  );
  const activeLines = lines.filter((line) => !line.removed);
  const selectedIds = new Set(activeLines.map((line) => line.procedure.id));

  const update = (key: string, patch: Partial<AppointmentLine>) =>
    onChange(
      lines.map((line) =>
        line.key === key ? { ...line, ...patch, error: null } : line,
      ),
    );

  const add = (procedure: Procedure) => {
    const line = createLine({
      id: procedure.id,
      name: procedure.name,
      code: procedure.code,
      isActive: procedure.is_active,
      basePrice: procedure.base_price,
      baseDurationMinutes: procedure.base_duration_minutes,
    });
    onChange([...lines, line]);
    setExpandedLineKey(line.key);
  };

  const remove = (line: AppointmentLine) =>
    onChange(
      line.saved
        ? // Un detalle guardado se retira con DELETE al guardar (se puede deshacer antes).
          lines.map((item) =>
            item.key === line.key
              ? { ...item, removed: true, error: null }
              : item,
          )
        : lines.filter((item) => item.key !== line.key),
    );

  const summary = summarizeLines(lines);

  return (
    <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
      <div className="space-y-3 lg:col-start-2 lg:row-start-1">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {t("selectedTitle")}
        </p>
        {lines.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("empty")}
          </p>
        ) : (
          <ul className="custom-scrollbar max-h-96 space-y-3 overflow-y-auto pe-1">
            {lines.map((line) => {
              const priceValid = isPriceValid(line);
              const duration = getLineDuration(line);
              const amount = getLineAmount(line);
              const operation = getLineOperation(line);
              const estimate = isEstimate(line);
              const expanded = !line.removed && expandedLineKey === line.key;

              return (
                <li
                  key={line.key}
                  className={`rounded-xl border border-s-4 p-4 ${line.error ? "border-red-300 border-s-red-500 dark:border-red-500/40" : expanded ? "border-blue-300 border-s-blue-500 bg-blue-50/40 dark:border-blue-500/40 dark:bg-blue-500/5" : "border-gray-200 border-s-gray-300 dark:border-gray-800 dark:border-s-gray-700"} ${line.removed ? "opacity-60" : ""}`}
                >
                  <Collapsible
                    open={expanded}
                    onOpenChange={(open) =>
                      setExpandedLineKey(open ? line.key : null)
                    }
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <span
                          className={`text-sm font-medium text-gray-800 dark:text-white/90 ${line.removed ? "line-through" : ""}`}
                        >
                          {line.procedure.code
                            ? `${line.procedure.code} · `
                            : ""}
                          {line.procedure.name}
                        </span>
                        {!line.procedure.isActive && (
                          <Badge size="sm" color="gray">
                            {t("inactive")}
                          </Badge>
                        )}
                        {line.saved ? (
                          <Badge size="sm" color="light">
                            {t("saved")}
                          </Badge>
                        ) : (
                          <Badge size="sm" color="warning">
                            {t("pending")}
                          </Badge>
                        )}
                        {line.removed && (
                          <Badge size="sm" color="error">
                            {t("willRemove")}
                          </Badge>
                        )}
                        {operation === "update" && (
                          <Badge size="sm" color="info">
                            {t("modified")}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {!line.removed && (
                          <CollapsibleTrigger
                            aria-label={
                              expanded ? t("hideDetails") : t("editDetails")
                            }
                            title={
                              expanded ? t("hideDetails") : t("editDetails")
                            }
                            render={
                              <Button
                                type="button"
                                variant="outline"
                                size="icon-xs"
                                className="border-blue-200 text-blue-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-500/30 dark:text-blue-400 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
                                disabled={disabled}
                              />
                            }
                          >
                            {expanded ? (
                              <ChevronUpIcon className="fill-current" />
                            ) : (
                              <ChevronDownIcon className="fill-current" />
                            )}
                          </CollapsibleTrigger>
                        )}
                        {line.removed ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="xs"
                            className="border-amber-200 text-amber-600 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-500/30 dark:text-amber-400 dark:hover:bg-amber-500/10 dark:hover:text-amber-300"
                            disabled={disabled}
                            onClick={() => update(line.key, { removed: false })}
                          >
                            <RegenerateIcon className="fill-current" />
                            {t("undoRemove")}
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-xs"
                            className="border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                            disabled={disabled}
                            onClick={() => remove(line)}
                            aria-label={t("remove")}
                            title={t("remove")}
                          >
                            <TrashBinIcon className="fill-current" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <CollapsibleContent>
                      <div className="space-y-3 border-t border-gray-100 pt-3 dark:border-gray-800">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <label className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                            <span>{t("unitPrice")}</span>
                            <Input
                              inputMode="decimal"
                              value={line.unitPrice}
                              disabled={disabled}
                              placeholder="0.00"
                              aria-invalid={priceValid ? undefined : "true"}
                              onChange={(event) =>
                                update(line.key, {
                                  unitPrice: event.target.value,
                                })
                              }
                            />
                          </label>
                          <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                            <p>{t("duration")}</p>
                            <p className="text-sm text-gray-800 dark:text-white/90">
                              {duration === null
                                ? t("unknown")
                                : `${estimate ? "≈ " : ""}${t("minutes", { count: Math.ceil(duration) })}`}
                            </p>
                          </div>
                          <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                            <p>{t("amount")}</p>
                            <p className="text-sm text-gray-800 dark:text-white/90">
                              {amount === null
                                ? t("unknown")
                                : `${estimate ? "≈ " : ""}${amount}`}
                            </p>
                          </div>
                        </div>
                        {!priceValid && (
                          <p className="text-xs text-red-500">
                            {t("priceInvalid")}
                          </p>
                        )}
                        <label className="block space-y-1 text-xs text-gray-500 dark:text-gray-400">
                          <span>
                            {t("notes")} ({t("optional")})
                          </span>
                          <Textarea
                            rows={2}
                            value={line.notes}
                            disabled={disabled}
                            placeholder={t("notesPlaceholder")}
                            onChange={(event) =>
                              update(line.key, { notes: event.target.value })
                            }
                          />
                        </label>
                      </div>
                    </CollapsibleContent>

                    {line.error && (
                      <Alert variant="destructive">
                        <AlertDescription>
                          {t("lineError", {
                            name: line.procedure.name,
                            message: line.error,
                          })}
                        </AlertDescription>
                      </Alert>
                    )}
                  </Collapsible>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="space-y-2 lg:col-start-1 lg:row-start-1">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {t("addFromCatalog")}
        </p>
        <AppointmentProcedureSelector
          selectedIds={selectedIds}
          onAdd={add}
          disabled={disabled}
        />
      </div>

      <div className="lg:col-span-2">
        <AppointmentProcedureSummary
          summary={summary}
          lines={activeLines}
          reservedMinutes={reservedMinutes}
          onAdjustEnd={onAdjustEnd}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
