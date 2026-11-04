import { isAbortError } from "@/services/api";
import { useEffect, useState } from "react";
import { procedureApi } from "../services/procedure-api";
import type { Procedure } from "../types/procedure.types";

/** Máximo de niveles que se recorren hacia arriba (evita bucles si hubiera datos inconsistentes). */
const MAX_ANCESTORS = 10;
const MAX_CHILDREN = 100;

interface HierarchyResult {
  procedureId: number;
  ancestors?: Procedure[];
  children?: Procedure[];
  childrenTotal?: number;
  error?: unknown;
}

/**
 * Contexto jerárquico de un procedimiento con los endpoints existentes: los
 * ancestros se obtienen siguiendo `parent_procedure_id` con `GET /procedures/{id}`
 * y los hijos directos con `GET /procedures?parent_procedure_id=`. No hay
 * endpoint de árbol: no se asume que la API entregue todos los descendientes.
 */
export function useProcedureHierarchy(procedure: Procedure | undefined) {
  const [result, setResult] = useState<HierarchyResult | null>(null);
  const procedureId = procedure?.id;
  const parentId = procedure?.parent_procedure_id ?? null;

  useEffect(() => {
    if (procedureId === undefined) return;
    const controller = new AbortController();
    const { signal } = controller;

    async function load(id: number): Promise<HierarchyResult> {
      const ancestors: Procedure[] = [];
      let next = parentId;
      while (next !== null && ancestors.length < MAX_ANCESTORS) {
        const parent = await procedureApi.getById(next, { signal });
        ancestors.unshift(parent);
        next = parent.parent_procedure_id;
      }
      const children = await procedureApi.list(
        {
          page: 1,
          page_size: MAX_CHILDREN,
          parent_procedure_id: id,
          sort_by: "name",
          order: "asc",
        },
        { signal },
      );
      return {
        procedureId: id,
        ancestors,
        children: children.items,
        childrenTotal: children.total,
      };
    }

    load(procedureId)
      .then(setResult)
      .catch((error: unknown) => {
        if (isAbortError(error)) return;
        setResult({ procedureId, error });
      });

    return () => controller.abort();
  }, [procedureId, parentId]);

  const current = result?.procedureId === procedureId ? result : null;

  return {
    ancestors: current?.ancestors ?? [],
    children: current?.children ?? [],
    childrenTotal: current?.childrenTotal ?? 0,
    error: current?.error,
    isLoading: procedureId !== undefined && current === null,
  };
}
