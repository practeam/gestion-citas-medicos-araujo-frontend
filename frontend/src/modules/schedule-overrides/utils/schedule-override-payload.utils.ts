import type { ScheduleOverrideFormValues } from "../schemas/schedule-override-schema";
import type {
  ScheduleOverride,
  ScheduleOverrideCreateRequest,
  ScheduleOverrideUpdateRequest,
  TargetType,
} from "../types/schedule-override.types";
import {
  isSameInstant,
  toLocalInputValue,
  toOffsetIso,
} from "./schedule-override-datetime.utils";

export function getTargetType(override: ScheduleOverride): TargetType {
  return override.clinic_id !== null ? "clinic" : "staff";
}

export function getTargetId(override: ScheduleOverride): number | null {
  return override.clinic_id ?? override.staff_member_id;
}

/** Exactamente uno de los dos identificadores va informado; el otro, `null`. */
export function toCreatePayload(
  values: ScheduleOverrideFormValues,
): ScheduleOverrideCreateRequest {
  return {
    clinic_id: values.targetType === "clinic" ? values.targetId : null,
    staff_member_id: values.targetType === "staff" ? values.targetId : null,
    starts_at: toOffsetIso(values.startsAt),
    ends_at: toOffsetIso(values.endsAt),
    reason: values.reason.trim() || null,
    is_active: values.isActive,
  };
}

/**
 * Solo intervalo y motivo (el objetivo no se puede cambiar y el estado va por
 * `/status`). Si cambia un extremo se envían ambos para que el backend
 * revalide el intervalo completo.
 */
export function toUpdatePayload(
  values: ScheduleOverrideFormValues,
  override: ScheduleOverride,
): ScheduleOverrideUpdateRequest {
  const payload: ScheduleOverrideUpdateRequest = {};
  if (
    !isSameInstant(values.startsAt, override.starts_at) ||
    !isSameInstant(values.endsAt, override.ends_at)
  ) {
    payload.starts_at = toOffsetIso(values.startsAt);
    payload.ends_at = toOffsetIso(values.endsAt);
  }
  if ((values.reason.trim() || null) !== override.reason) {
    payload.reason = values.reason.trim() || null;
  }
  return payload;
}

export function toFormValues(
  override: ScheduleOverride,
): ScheduleOverrideFormValues {
  return {
    targetType: getTargetType(override),
    targetId: getTargetId(override),
    reason: override.reason ?? "",
    startsAt: toLocalInputValue(override.starts_at),
    endsAt: toLocalInputValue(override.ends_at),
    isActive: override.is_active,
  };
}
