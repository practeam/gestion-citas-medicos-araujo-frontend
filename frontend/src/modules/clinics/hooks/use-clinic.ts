import { isAbortError } from "@/services/api";
import { useEffect, useState } from "react";
import { clinicApi } from "../services/clinic-api";
import type { Clinic } from "../types/clinic.types";

interface ClinicResult {
  clinicId: number;
  clinic?: Clinic;
  error?: unknown;
}

/** Consulta un rol por id. `clinicId` inválido (NaN) se trata como no encontrado. */
export function useClinic(clinicId: number) {
  const [result, setResult] = useState<ClinicResult | null>(null);
  const isValidId = Number.isInteger(clinicId) && clinicId > 0;

  useEffect(() => {
    if (!isValidId) return;
    const controller = new AbortController();

    clinicApi
      .getById(clinicId, { signal: controller.signal })
      .then((clinic) => setResult({ clinicId, clinic }))
      .catch((error: unknown) => {
        if (isAbortError(error)) return;
        setResult({ clinicId, error });
      });

    return () => controller.abort();
  }, [clinicId, isValidId]);

  const current = result?.clinicId === clinicId ? result : null;

  return {
    clinic: current?.clinic,
    error: current?.error,
    isInvalidId: !isValidId,
    isLoading: isValidId && current === null,
  };
}
