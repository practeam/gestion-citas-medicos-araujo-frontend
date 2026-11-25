import type { ScheduleExceptionFormValues } from "../schemas/schedule-exception-schema";
import type {
  ExceptionType,
  ScheduleException,
  ScheduleExceptionCreateRequest,
  ScheduleExceptionUpdateRequest,
  TargetType,
} from "../types/schedule-exception.types";
import {
  isSameInstant,
  toLocalInputValue,
  toOffsetIso,
} from "./schedule-exception-datetime.utils";

/** Exactamente uno de los dos identificadores va informado; el otro, `null`. */
function targetIds(type: TargetType, id: number | null) {
  return {
    clinic_id: type === "clinic" ? id : null,
    staff_member_id: type === "staff" ? id : null,
  };
}

export function getTargetType(exception: ScheduleException): TargetType {
  return exception.clinic_id !== null ? "clinic" : "staff";
}

export function getTargetId(exception: ScheduleException): number | null {
  return exception.clinic_id ?? exception.staff_member_id;
}

/** Fechas con zona horaria; el motivo vacío se envía como `null`, no como texto inventado. */
export function toCreatePayload(
  values: ScheduleExceptionFormValues,
): ScheduleExceptionCreateRequest {
  return {
    ...targetIds(values.targetType, values.targetId),
    exception_type: values.exceptionType,
    reason: values.reason.trim() || null,
    starts_at: toOffsetIso(values.startsAt),
    ends_at: toOffsetIso(values.endsAt),
  };
}

/**
 * Solo los campos modificados. Si cambia el objetivo se envían ambos
 * identificadores (uno `null`) y si cambia el intervalo se envían ambos
 * extremos, para que el backend revalide todas las reglas.
 */
export function toUpdatePayload(
  values: ScheduleExceptionFormValues,
  exception: ScheduleException,
): ScheduleExceptionUpdateRequest {
  const payload: ScheduleExceptionUpdateRequest = {};

  if (
    values.targetType !== getTargetType(exception) ||
    values.targetId !== getTargetId(exception)
  ) {
    Object.assign(payload, targetIds(values.targetType, values.targetId));
  }
  if (values.exceptionType !== exception.exception_type) {
    payload.exception_type = values.exceptionType;
  }
  if ((values.reason.trim() || null) !== exception.reason) {
    payload.reason = values.reason.trim() || null;
  }
  if (
    !isSameInstant(values.startsAt, exception.starts_at) ||
    !isSameInstant(values.endsAt, exception.ends_at)
  ) {
    payload.starts_at = toOffsetIso(values.startsAt);
    payload.ends_at = toOffsetIso(values.endsAt);
  }
  return payload;
}

export function toFormValues(
  exception: ScheduleException,
): ScheduleExceptionFormValues {
  return {
    targetType: getTargetType(exception),
    targetId: getTargetId(exception),
    // Si el backend devolviera un valor fuera de la lista, se muestra el tipo "other" sin enviarlo.
    exceptionType: (["closure", "absence", "maintenance", "other"].includes(
      exception.exception_type,
    )
      ? exception.exception_type
      : "other") as ExceptionType,
    reason: exception.reason ?? "",
    startsAt: toLocalInputValue(exception.starts_at),
    endsAt: toLocalInputValue(exception.ends_at),
  };
}
