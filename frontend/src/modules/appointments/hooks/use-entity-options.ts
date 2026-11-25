import { patientApi } from "@/modules/patients";
import { getPersonDocument, getPersonFullName } from "@/modules/persons";
import { staffMemberApi } from "@/modules/staff";
import { isAbortError } from "@/services/api";
import { useCallback, useEffect, useState } from "react";
import type {
  AppointmentEntityOption,
  AppointmentEntityType,
} from "../types/appointment.types";

interface OptionsResult {
  key: string;
  options?: AppointmentEntityOption[];
  total?: number;
  error?: unknown;
}

/**
 * Pacientes o personal **activos** (según `type`), con búsqueda por nombre,
 * consultados con los servicios de `patients` y `staff`. No duplica su lógica.
 * Las reglas definitivas (persona activa, estado laboral) las valida el backend.
 */
export function useEntityOptions(type: AppointmentEntityType, pageSize = 10) {
  const [search, setSearch] = useState("");
  const [reloadToken, setReloadToken] = useState(0);
  const [result, setResult] = useState<OptionsResult | null>(null);
  const requestKey = `${type}|${search}|${pageSize}|${reloadToken}`;

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    const name = search ? { name: search } : {};

    const request: Promise<{
      options: AppointmentEntityOption[];
      total: number;
    }> =
      type === "patient"
        ? patientApi
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
              options: page.items.map((patient) => ({
                id: patient.id,
                label: getPersonFullName(patient.person),
                description:
                  [getPersonDocument(patient.person), patient.patient_number]
                    .filter(Boolean)
                    .join(" · ") || null,
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
