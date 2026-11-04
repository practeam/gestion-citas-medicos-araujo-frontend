import { isAbortError } from "@/services/api";
import { useEffect, useState } from "react";
import { patientApi } from "../services/patient-api";
import type { Patient } from "../types/patient.types";

interface PatientResult {
  patientId: number;
  patient?: Patient;
  error?: unknown;
}

/** Consulta un rol por id. `patientId` inválido (NaN) se trata como no encontrado. */
export function usePatient(patientId: number) {
  const [result, setResult] = useState<PatientResult | null>(null);
  const isValidId = Number.isInteger(patientId) && patientId > 0;

  useEffect(() => {
    if (!isValidId) return;
    const controller = new AbortController();

    patientApi
      .getById(patientId, { signal: controller.signal })
      .then((patient) => setResult({ patientId, patient }))
      .catch((error: unknown) => {
        if (isAbortError(error)) return;
        setResult({ patientId, error });
      });

    return () => controller.abort();
  }, [patientId, isValidId]);

  const current = result?.patientId === patientId ? result : null;

  return {
    patient: current?.patient,
    error: current?.error,
    isInvalidId: !isValidId,
    isLoading: isValidId && current === null,
  };
}
