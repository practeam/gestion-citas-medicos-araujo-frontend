import { isAbortError, type PageResult } from "@/services/api";
import { useCallback, useEffect, useState } from "react";
import { patientApi } from "../services/patient-api";
import type {
  Patient,
  PatientListParams,
  PatientSortField,
  PatientStatusFilter,
  SortOrder,
} from "../types/patient.types";

export const PATIENTS_PAGE_SIZE = 20;

export interface PatientsFilters {
  name: string;
  documentNumber: string;
  patientNumber: string;
  status: PatientStatusFilter;
  sortBy: PatientSortField;
  order: SortOrder;
  page: number;
}

interface PatientsResult {
  key: string;
  data?: PageResult<Patient>;
  error?: unknown;
}

const INITIAL_FILTERS: PatientsFilters = {
  name: "",
  documentNumber: "",
  patientNumber: "",
  status: "all",
  sortBy: "id",
  order: "asc",
  page: 1,
};

export function usePatients() {
  const [filters, setFilters] = useState<PatientsFilters>(INITIAL_FILTERS);
  const [reloadToken, setReloadToken] = useState(0);
  const [result, setResult] = useState<PatientsResult | null>(null);

  const { name, documentNumber, patientNumber, status, sortBy, order, page } =
    filters;
  const requestKey = [
    name,
    documentNumber,
    patientNumber,
    status,
    sortBy,
    order,
    page,
    reloadToken,
  ].join("|");

  useEffect(() => {
    const controller = new AbortController();
    const params: PatientListParams = {
      page,
      page_size: PATIENTS_PAGE_SIZE,
      sort_by: sortBy,
      order,
      ...(name && { name }),
      ...(documentNumber && { document_number: documentNumber }),
      ...(patientNumber && { patient_number: patientNumber }),
      ...(status !== "all" && { is_active: status === "active" }),
    };

    patientApi
      .list(params, { signal: controller.signal })
      .then((data) => setResult({ key: requestKey, data }))
      .catch((error: unknown) => {
        if (isAbortError(error)) return;
        setResult({ key: requestKey, error });
      });

    return () => controller.abort();
  }, [
    requestKey,
    name,
    documentNumber,
    patientNumber,
    status,
    sortBy,
    order,
    page,
  ]);

  /** Cambia filtros u ordenamiento y vuelve a la primera página. */
  const updateFilters = useCallback(
    (patch: Partial<Omit<PatientsFilters, "page">>) =>
      setFilters((prev) => {
        const changed = (Object.keys(patch) as (keyof typeof patch)[]).some(
          (key) => prev[key] !== patch[key],
        );
        return changed ? { ...prev, ...patch, page: 1 } : prev;
      }),
    [],
  );
  const setPage = useCallback(
    (value: number) => setFilters((prev) => ({ ...prev, page: value })),
    [],
  );
  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  const current = result?.key === requestKey ? result : null;
  const hasFilters =
    name !== "" ||
    documentNumber !== "" ||
    patientNumber !== "" ||
    status !== "all";

  return {
    filters,
    hasFilters,
    updateFilters,
    setPage,
    reload,
    data: (current ?? result)?.data,
    error: current?.error,
    isLoading: current === null,
  };
}
