import { clinicApi } from "@/modules/clinics";
import { getPersonFullName } from "@/modules/persons";
import { staffMemberApi } from "@/modules/staff";
import { isAbortError } from "@/services/api";
import { useCallback, useEffect, useState } from "react";
import type { TargetType } from "../types/schedule-exception.types";

export interface TargetOption {
  id: number;
  label: string;
  description: string | null;
}

interface Query {
  type: TargetType;
  search: string;
}

interface OptionsResult {
  key: string;
  options?: TargetOption[];
  total?: number;
  error?: unknown;
}

/**
 * Clínicas o personal **activos** (según `type`) para elegir el objetivo,
 * consultados con los servicios de los módulos `clinics` y `staff`. No duplica
 * su lógica de consulta.
 */
export function useTargetOptions(type: TargetType, pageSize = 10) {
  const [search, setSearch] = useState("");
  const [reloadToken, setReloadToken] = useState(0);
  const [result, setResult] = useState<OptionsResult | null>(null);
  const query: Query = { type, search };
  const requestKey = `${query.type}|${query.search}|${pageSize}|${reloadToken}`;

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    const name = search ? { name: search } : {};

    const request: Promise<{ options: TargetOption[]; total: number }> =
      type === "clinic"
        ? clinicApi
            .list(
              {
                page: 1,
                page_size: pageSize,
                is_active: true,
                sort_by: "name",
                order: "asc",
                ...name,
              },
              { signal },
            )
            .then((page) => ({
              total: page.total,
              options: page.items.map((clinic) => ({
                id: clinic.id,
                label: clinic.name,
                description: clinic.address,
              })),
            }))
        : staffMemberApi
            .list(
              {
                page: 1,
                page_size: pageSize,
                is_active: true,
                sort_by: "last_name",
                order: "asc",
                ...name,
              },
              { signal },
            )
            .then((page) => ({
              total: page.total,
              options: page.items.map((member) => ({
                id: member.id,
                label: getPersonFullName(member.person),
                description: member.employee_number,
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
  }, [requestKey, type, search, pageSize]);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);
  const current = result?.key === requestKey ? result : null;
  // Al cambiar de tipo no se muestran opciones del tipo anterior.
  const sameType = result?.key.startsWith(`${type}|`) ?? false;

  return {
    options: (sameType ? result?.options : undefined) ?? [],
    total: (sameType ? result?.total : undefined) ?? 0,
    hasData: sameType && result?.options !== undefined,
    error: current?.error,
    isLoading: current === null,
    setSearch,
    reload,
  };
}
