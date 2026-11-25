import { useEffect, useRef, useState } from "react";
import { procedureApi } from "../services/procedure-api";
import type { Procedure } from "../types/procedure.types";

/** `código · nombre` (o solo el nombre si no hay código). */
export function getProcedureLabel(procedure: Pick<Procedure, "code" | "name">) {
  return procedure.code
    ? `${procedure.code} · ${procedure.name}`
    : procedure.name;
}

/**
 * Nombres de procedimientos por id (una consulta por id distinto, con caché
 * mientras el componente vive). Si la consulta falla, la interfaz muestra `#id`.
 */
export function useProcedureLabels(ids: readonly number[]) {
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
      procedureApi
        .getById(id)
        .then((procedure) =>
          setLabels((prev) => ({
            ...prev,
            [id]: getProcedureLabel(procedure),
          })),
        )
        .catch(() => undefined);
    }
  }, [key]);

  return labels;
}
