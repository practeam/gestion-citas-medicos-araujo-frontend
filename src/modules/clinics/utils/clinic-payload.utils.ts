import type { ClinicFormValues } from "../schemas/clinic-schema";
import type {
  Clinic,
  ClinicCreateRequest,
  ClinicUpdateRequest,
} from "../types/clinic.types";

/** Los opcionales vacíos no se envían al crear. */
export function toCreatePayload(values: ClinicFormValues): ClinicCreateRequest {
  const description = values.description.trim();
  const phone = values.phone.trim();
  const email = values.email.trim();
  return {
    name: values.name.trim(),
    address: values.address.trim(),
    ...(description && { description }),
    ...(phone && { phone }),
    ...(email && { email }),
  };
}

/** Solo incluye lo modificado; los opcionales vaciados se envían como `null`. */
export function toUpdatePayload(
  values: ClinicFormValues,
  clinic: Clinic,
): ClinicUpdateRequest {
  const payload: ClinicUpdateRequest = {};
  const name = values.name.trim();
  const address = values.address.trim();

  if (name !== clinic.name) payload.name = name;
  if (address !== clinic.address) payload.address = address;

  for (const field of ["description", "phone", "email"] as const) {
    const value = values[field].trim();
    if (value !== (clinic[field] ?? "")) payload[field] = value || null;
  }
  return payload;
}
