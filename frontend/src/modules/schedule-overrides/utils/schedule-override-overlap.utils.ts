import type { ScheduleOverrideFormValues } from "../schemas/schedule-override-schema";
import { scheduleOverrideApi } from "../services/schedule-override-api";
import type { ScheduleOverride } from "../types/schedule-override.types";
import { toOffsetIso } from "./schedule-override-datetime.utils";

/**
 * Aviso preventivo de solapamiento: consulta, con el endpoint de listado, los
 * overrides **activos** del mismo objetivo cuyo intervalo se cruza (parcial o
 * totalmente) con el indicado. Es solo una ayuda: el backend decide si el
 * solapamiento es ambiguo y su rechazo (409/422) prevalece.
 */
export async function findOverlappingOverrides(
  values: ScheduleOverrideFormValues,
  excludeId?: number,
): Promise<ScheduleOverride[]> {
  if (values.targetId === null) return [];
  const page = await scheduleOverrideApi.list({
    page: 1,
    page_size: 100,
    is_active: true,
    ...(values.targetType === "clinic"
      ? { clinic_id: values.targetId }
      : { staff_member_id: values.targetId }),
    // "termina después del inicio" y "empieza antes del fin" = se cruzan.
    range_start: toOffsetIso(values.startsAt),
    range_end: toOffsetIso(values.endsAt),
  });
  return page.items.filter((override) => override.id !== excludeId);
}
