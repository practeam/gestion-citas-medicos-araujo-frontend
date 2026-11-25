import { clinicApi } from "@/modules/clinics";
import { getPersonFullName } from "@/modules/persons";
import { staffMemberApi } from "@/modules/staff";
import { useEffect, useRef, useState } from "react";
import type { ScheduleException } from "../types/schedule-exception.types";

/** Clave estable del objetivo de una excepción: `clinic:3` / `staff:7`. */
export function targetKey(exception: ScheduleException): string {
  return exception.clinic_id !== null
    ? `clinic:${exception.clinic_id}`
    : `staff:${exception.staff_member_id}`;
}

/**
 * Resuelve el nombre de la clínica o del trabajador de cada excepción, porque
 * la API solo devuelve identificadores. Cada objetivo se consulta una vez con
 * los servicios de `clinics` y `staff`; si falla, se muestra el identificador.
 */
export function useTargetLabels(items: ScheduleException[] | undefined) {
  const [labels, setLabels] = useState<Record<string, string>>({});
  const requested = useRef(new Set<string>());

  useEffect(() => {
    for (const item of items ?? []) {
      const key = targetKey(item);
      if (requested.current.has(key)) continue;
      requested.current.add(key);

      const request =
        item.clinic_id !== null
          ? clinicApi.getById(item.clinic_id).then((clinic) => clinic.name)
          : staffMemberApi
              .getById(item.staff_member_id as number)
              .then((member) => getPersonFullName(member.person));

      request
        .then((label) => setLabels((prev) => ({ ...prev, [key]: label })))
        .catch(() => undefined);
    }
  }, [items]);

  return labels;
}
