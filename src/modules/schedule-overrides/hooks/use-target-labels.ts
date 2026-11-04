import { clinicApi } from "@/modules/clinics";
import { getPersonFullName } from "@/modules/persons";
import { staffMemberApi } from "@/modules/staff";
import { useEffect, useRef, useState } from "react";
import type { ScheduleOverride } from "../types/schedule-override.types";

/** Clave estable del objetivo de una modificación: `clinic:3` / `staff:7`. */
export function targetKey(override: ScheduleOverride): string {
  return override.clinic_id !== null
    ? `clinic:${override.clinic_id}`
    : `staff:${override.staff_member_id}`;
}

/**
 * Resuelve el nombre de la clínica o del trabajador de cada modificación, porque
 * la API solo devuelve identificadores. Cada objetivo se consulta una vez con
 * los servicios de `clinics` y `staff`; si falla, se muestra el identificador.
 */
export function useTargetLabels(items: ScheduleOverride[] | undefined) {
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
