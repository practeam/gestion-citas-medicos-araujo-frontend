import {
  normalizeEmployeeNumber,
  type StaffMemberFormValues,
} from "../schemas/staff-member-schema";
import type {
  StaffMember,
  StaffMemberCreateRequest,
  StaffMemberUpdateRequest,
} from "../types/staff-member.types";

/** `person_id`, correo y contraseña (obligatorios) y los campos propios; los opcionales vacíos no se envían. */
export function toCreatePayload(
  personId: number,
  values: StaffMemberFormValues,
): StaffMemberCreateRequest {
  const employeeNumber = normalizeEmployeeNumber(values.employee_number);
  return {
    person_id: personId,
    email: values.email.trim(),
    password: values.password,
    ...(employeeNumber && { employee_number: employeeNumber }),
    ...(values.hire_date && { hire_date: values.hire_date }),
  };
}

/** Solo incluye lo modificado; los opcionales vaciados van como `null`. */
export function toUpdatePayload(
  values: StaffMemberFormValues,
  staffMember: StaffMember,
): StaffMemberUpdateRequest {
  const payload: StaffMemberUpdateRequest = {};
  const employeeNumber = normalizeEmployeeNumber(values.employee_number);

  if (employeeNumber !== (staffMember.employee_number ?? "")) {
    payload.employee_number = employeeNumber || null;
  }
  if (values.hire_date !== (staffMember.hire_date ?? "")) {
    payload.hire_date = values.hire_date || null;
  }
  // Contraseña opcional: solo se envía si se escribió una nueva.
  if (values.password) payload.password = values.password;
  return payload;
}

export function toFormValues(staffMember: StaffMember): StaffMemberFormValues {
  return {
    employee_number: staffMember.employee_number ?? "",
    hire_date: staffMember.hire_date ?? "",
    // La API nunca devuelve la contraseña: ni ella ni el correo se precargan.
    email: "",
    password: "",
  };
}
