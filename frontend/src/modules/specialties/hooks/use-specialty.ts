import { isAbortError } from "@/services/api";
import { useEffect, useState } from "react";
import { specialtyApi } from "../services/specialty-api";
import type { Specialty } from "../types/specialty.types";

interface SpecialtyResult {
  specialtyId: number;
  specialty?: Specialty;
  error?: unknown;
}

/** Consulta un rol por id. `specialtyId` inválido (NaN) se trata como no encontrado. */
export function useSpecialty(specialtyId: number) {
  const [result, setResult] = useState<SpecialtyResult | null>(null);
  const isValidId = Number.isInteger(specialtyId) && specialtyId > 0;

  useEffect(() => {
    if (!isValidId) return;
    const controller = new AbortController();

    specialtyApi
      .getById(specialtyId, { signal: controller.signal })
      .then((specialty) => setResult({ specialtyId, specialty }))
      .catch((error: unknown) => {
        if (isAbortError(error)) return;
        setResult({ specialtyId, error });
      });

    return () => controller.abort();
  }, [specialtyId, isValidId]);

  const current = result?.specialtyId === specialtyId ? result : null;

  return {
    specialty: current?.specialty,
    error: current?.error,
    isInvalidId: !isValidId,
    isLoading: isValidId && current === null,
  };
}
