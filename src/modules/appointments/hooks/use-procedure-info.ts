import { procedureApi } from "@/modules/procedures";
import { useEffect, useRef, useState } from "react";
import type { ProcedureInfo } from "../utils/appointment-lines.utils";

/**
 * Datos de catálogo de procedimientos por id (una consulta por id distinto, con
 * caché mientras el componente vive). Los procedimientos inactivos asociados a
 * citas existentes también se consultan: siguen siendo visibles. Si la
 * consulta de uno falla, `isLoading` termina y la interfaz muestra `#id`.
 */
export function useProcedureInfo(ids: readonly number[]) {
  const [known, setKnown] = useState<Record<number, ProcedureInfo>>({});
  const [failed, setFailed] = useState<Record<number, true>>({});
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
      procedureApi
        .getById(id)
        .then((procedure) =>
          setKnown((prev) => ({
            ...prev,
            [id]: {
              id,
              name: procedure.name,
              code: procedure.code,
              isActive: procedure.is_active,
              basePrice: procedure.base_price,
              baseDurationMinutes: procedure.base_duration_minutes,
            },
          })),
        )
        .catch(() => setFailed((prev) => ({ ...prev, [id]: true })));
    }
  }, [key]);

  const wanted = key.split(",").filter(Boolean).map(Number);
  return {
    procedures: known,
    isLoading: wanted.some((id) => !(id in known) && !(id in failed)),
  };
}

/** Información mínima cuando el catálogo no respondió. */
export function fallbackProcedureInfo(id: number): ProcedureInfo {
  return {
    id,
    name: `#${id}`,
    code: null,
    isActive: true,
    basePrice: null,
    baseDurationMinutes: null,
  };
}
