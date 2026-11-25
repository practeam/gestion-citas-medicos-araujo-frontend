import { isAbortError } from "@/services/api";
import { useEffect, useState } from "react";
import { personApi } from "../services/person-api";
import type { Person } from "../types/person.types";

interface PersonResult {
  personId: number;
  person?: Person;
  error?: unknown;
}

/** Consulta un rol por id. `personId` inválido (NaN) se trata como no encontrado. */
export function usePerson(personId: number) {
  const [result, setResult] = useState<PersonResult | null>(null);
  const isValidId = Number.isInteger(personId) && personId > 0;

  useEffect(() => {
    if (!isValidId) return;
    const controller = new AbortController();

    personApi
      .getById(personId, { signal: controller.signal })
      .then((person) => setResult({ personId, person }))
      .catch((error: unknown) => {
        if (isAbortError(error)) return;
        setResult({ personId, error });
      });

    return () => controller.abort();
  }, [personId, isValidId]);

  const current = result?.personId === personId ? result : null;

  return {
    person: current?.person,
    error: current?.error,
    isInvalidId: !isValidId,
    isLoading: isValidId && current === null,
  };
}
