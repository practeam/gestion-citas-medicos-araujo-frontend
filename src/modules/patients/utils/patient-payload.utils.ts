import {
  normalizePatientNumber,
  type PatientFormValues,
} from "../schemas/patient-schema";
import type {
  Patient,
  PatientCreateRequest,
  PatientUpdateRequest,
} from "../types/patient.types";

/** Solo `person_id` y los campos propios; los opcionales vacíos no se envían. */
export function toCreatePayload(
  personId: number,
  values: PatientFormValues,
): PatientCreateRequest {
  const patientNumber = normalizePatientNumber(values.patient_number);
  const notes = values.notes.trim();
  return {
    person_id: personId,
    ...(patientNumber && { patient_number: patientNumber }),
    ...(notes && { notes }),
  };
}

/** Solo incluye lo modificado; los opcionales vaciados van como `null`. */
export function toUpdatePayload(
  values: PatientFormValues,
  patient: Patient,
): PatientUpdateRequest {
  const payload: PatientUpdateRequest = {};
  const patientNumber = normalizePatientNumber(values.patient_number);
  const notes = values.notes.trim();

  if (patientNumber !== (patient.patient_number ?? "")) {
    payload.patient_number = patientNumber || null;
  }
  if (notes !== (patient.notes ?? "")) {
    payload.notes = notes || null;
  }
  return payload;
}

export function toFormValues(patient: Patient): PatientFormValues {
  return {
    patient_number: patient.patient_number ?? "",
    notes: patient.notes ?? "",
  };
}
