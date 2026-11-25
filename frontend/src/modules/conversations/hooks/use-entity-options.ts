import {
  getPersonDocument,
  getPersonFullName,
  personApi,
} from "@/modules/persons";
import { staffMemberApi } from "@/modules/staff";
import { isAbortError } from "@/services/api";
import { useCallback, useEffect, useState } from "react";
import type { EntityOption } from "../types/conversation.types";

export type EntityKind = "person" | "staff";

interface OptionsResult {
  key: string;
  options?: EntityOption[];
  total?: number;
  error?: unknown;
}

/**
 * Personas o personal **activos** con búsqueda por nombre, consultados con los
 * servicios de `persons` y `staff`. Las personas no necesitan ser pacientes. La
 * elegibilidad definitiva de un trabajador (estado laboral) la valida el
 * backend; sus rechazos se muestran tal cual.
 */
export function useEntityOptions(kind: EntityKind, pageSize = 10) {
  const [search, setSearch] = useState("");
  const [reloadToken, setReloadToken] = useState(0);
  const [result, setResult] = useState<OptionsResult | null>(null);
  const requestKey = `${kind}|${search}|${pageSize}|${reloadToken}`;

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    const common = {
      page: 1,
      page_size: pageSize,
      is_active: true,
      sort_by: "last_name" as const,
      order: "asc" as const,
      ...(search && { name: search }),
    };

    const request: Promise<{ options: EntityOption[]; total: number }> =
      kind === "person"
        ? personApi.list(common, { signal }).then((page) => ({
            total: page.total,
            options: page.items.map((person) => ({
              id: person.id,
              label: getPersonFullName(person),
              description: getPersonDocument(person),
            })),
          }))
        : staffMemberApi.list(common, { signal }).then((page) => ({
            total: page.total,
            options: page.items.map((member) => ({
              id: member.id,
              label: getPersonFullName(member.person),
              description:
                [getPersonDocument(member.person), member.employee_number]
                  .filter(Boolean)
                  .join(" · ") || null,
            })),
          }));

    request
      .then(({ options, total }) =>
        setResult({ key: requestKey, options, total }),
      )
      .catch((error: unknown) => {
        if (isAbortError(error)) return;
        setResult({ key: requestKey, error });
      });

    return () => controller.abort();
  }, [requestKey, kind, search, pageSize]);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);
  const current = result?.key === requestKey ? result : null;
  // Al cambiar de tipo no se muestran opciones del tipo anterior.
  const sameKind = result?.key.startsWith(`${kind}|`) ?? false;

  return {
    options: (sameKind ? result?.options : undefined) ?? [],
    total: (sameKind ? result?.total : undefined) ?? 0,
    hasData: sameKind && result?.options !== undefined,
    error: current?.error,
    isLoading: current === null,
    setSearch,
    reload,
  };
}
