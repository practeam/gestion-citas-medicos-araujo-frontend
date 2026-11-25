import { personApi, type Person } from "@/modules/persons";
import { staffMemberApi, type StaffMember } from "@/modules/staff";
import { useEffect, useRef, useState } from "react";

type Kind = "person" | "staff";
type Items = { person: Person; staff: StaffMember };

/**
 * Consulta de registros por id con caché mientras el componente vive (una
 * llamada por id distinto). Si falla, el id queda sin datos y la interfaz muestra
 * `#id`; no se reintenta en bucle.
 */
function useById<K extends Kind>(kind: K, ids: readonly number[]) {
  const [items, setItems] = useState<Record<number, Items[K]>>({});
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
      const request: Promise<Person | StaffMember> =
        kind === "person" ? personApi.getById(id) : staffMemberApi.getById(id);
      request
        .then((item) =>
          setItems((prev) => ({ ...prev, [id]: item as Items[K] })),
        )
        .catch(() => undefined);
    }
  }, [key, kind]);

  return items;
}

/** Personas por id (la API de conversaciones solo entrega `person_id`). */
export function usePeople(ids: readonly number[]) {
  return useById("person", ids);
}

/** Personal por id (la API de asignaciones solo entrega `staff_member_id`). */
export function useStaffMembers(ids: readonly number[]) {
  return useById("staff", ids);
}
