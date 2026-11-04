import { patientApi } from "@/modules/patients";
import { getPersonFullName } from "@/modules/persons";
import { staffMemberApi } from "@/modules/staff";
import { useEffect, useRef, useState } from "react";
import type { AppointmentEntityType } from "../types/appointment.types";

/**
 * Nombres de pacientes o personal por id (una consulta por id distinto, con
 * caché mientras el componente vive). La API de citas solo entrega ids; si la
 * consulta de un nombre falla, la interfaz muestra `#id`.
 */
export function useEntityLabels(
  type: AppointmentEntityType,
  ids: readonly number[],
) {
  const [labels, setLabels] = useState<Record<number, string>>({});
  const requested = useRef(new Set<number>());
  const key = [...new Set(ids)].sort((a, b) => a - b).join(",");

  useEffect(() => {
    const missing = key
      .split(",")
      .filter(Boolean)
      .map(Number)
      .filter((id) => !requested.current.has(id));

    for (const id of missing) {
      requested.current.add(id);
      const request =
        type === "patient"
          ? patientApi.getById(id).then((item) => item.person)
          : staffMemberApi.getById(id).then((item) => item.person);
      request
        .then((person) =>
          setLabels((prev) => ({ ...prev, [id]: getPersonFullName(person) })),
        )
        // Sin nombre: se muestra `#id` y no se reintenta en bucle.
        .catch(() => undefined);
    }
  }, [key, type]);

  return labels;
}
