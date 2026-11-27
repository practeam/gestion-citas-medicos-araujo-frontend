import AppLayout from "@/components/layout/app-layout";
import { GuardiansPage } from "@/modules/guardians";
import {
  LoginPage,
  ProtectedRoute,
  PublicOnlyRoute,
  RequirePermission,
} from "@/modules/auth";
import { DashboardPage } from "@/modules/dashboard";
import { AppointmentsCalendarPage } from "@/modules/appointments";
import { ConversationsPage } from "@/modules/conversations";
import {
  ProcedureCreatePage,
  ProcedureDetailPage,
  ProcedureEditPage,
  ProceduresPage,
} from "@/modules/procedures";
import {
  ClinicCreatePage,
  ClinicDetailPage,
  ClinicEditPage,
  ClinicsPage,
} from "@/modules/clinics";
import {
  ScheduleOverrideCreatePage,
  ScheduleOverrideDetailPage,
  ScheduleOverrideEditPage,
  ScheduleOverridesPage,
} from "@/modules/schedule-overrides";
import {
  ScheduleExceptionCreatePage,
  ScheduleExceptionDetailPage,
  ScheduleExceptionEditPage,
  ScheduleExceptionsPage,
} from "@/modules/schedule-exceptions";
import {
  StaffMemberCreatePage,
  StaffMemberDetailPage,
  StaffMemberEditPage,
  StaffMembersPage,
} from "@/modules/staff";
import {
  PatientCreatePage,
  PatientDetailPage,
  PatientEditPage,
  PatientsPage,
} from "@/modules/patients";
import {
  PersonCreatePage,
  PersonDetailPage,
  PersonEditPage,
  PersonsPage,
} from "@/modules/persons";
import {
  PermissionCreatePage,
  PermissionDetailPage,
  PermissionEditPage,
  PermissionsPage,
} from "@/modules/permissions";
import {
  RoleCreatePage,
  RoleDetailPage,
  RoleEditPage,
  RolesPage,
} from "@/modules/roles";
import {
  SpecialConditionCreatePage,
  SpecialConditionDetailPage,
  SpecialConditionEditPage,
  SpecialConditionsPage,
} from "@/modules/special-conditions";
import {
  SpecialtiesPage,
  SpecialtyCreatePage,
  SpecialtyDetailPage,
  SpecialtyEditPage,
} from "@/modules/specialties";
import { Error404Page } from "@/pages/main/pages";
import ProfilePage from "@/pages/main/profile";
import { AuthLayout } from "@/pages/others/auth";
import "flatpickr/dist/flatpickr.css";
import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router";

/** Ruta protegida por permiso efectivo del backend (`<entidad>.<acción>`). */
const guard = (permission: string, element: ReactNode) => (
  <RequirePermission permission={permission}>{element}</RequirePermission>
);

export default function App() {
  return (
    <Routes>
      {/* Rutas privadas: sesión obligatoria */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={guard("dashboard.read", <DashboardPage />)} />

          {/* Roles */}
          <Route path="/roles" element={guard("role.read", <RolesPage />)} />
          <Route
            path="/roles/create"
            element={guard("role.create", <RoleCreatePage />)}
          />
          <Route
            path="/roles/:roleId"
            element={guard("role.read", <RoleDetailPage />)}
          />
          <Route
            path="/roles/:roleId/edit"
            element={guard("role.update", <RoleEditPage />)}
          />

          {/* Permissions */}
          <Route
            path="/permissions"
            element={guard("permission.read", <PermissionsPage />)}
          />
          <Route
            path="/permissions/create"
            element={guard("permission.create", <PermissionCreatePage />)}
          />
          <Route
            path="/permissions/:permissionId"
            element={guard("permission.read", <PermissionDetailPage />)}
          />
          <Route
            path="/permissions/:permissionId/edit"
            element={guard("permission.update", <PermissionEditPage />)}
          />

          {/* Specialties */}
          <Route
            path="/specialties"
            element={guard("specialty.read", <SpecialtiesPage />)}
          />
          <Route
            path="/specialties/create"
            element={guard("specialty.create", <SpecialtyCreatePage />)}
          />
          <Route
            path="/specialties/:specialtyId"
            element={guard("specialty.read", <SpecialtyDetailPage />)}
          />
          <Route
            path="/specialties/:specialtyId/edit"
            element={guard("specialty.update", <SpecialtyEditPage />)}
          />

          {/* Special conditions */}
          <Route
            path="/special-conditions"
            element={guard("special_condition.read", <SpecialConditionsPage />)}
          />
          <Route
            path="/special-conditions/create"
            element={guard(
              "special_condition.create",
              <SpecialConditionCreatePage />,
            )}
          />
          <Route
            path="/special-conditions/:specialConditionId"
            element={guard(
              "special_condition.read",
              <SpecialConditionDetailPage />,
            )}
          />
          <Route
            path="/special-conditions/:specialConditionId/edit"
            element={guard(
              "special_condition.update",
              <SpecialConditionEditPage />,
            )}
          />

          {/* Clinics */}
          <Route
            path="/clinics"
            element={guard("clinic.read", <ClinicsPage />)}
          />
          <Route
            path="/clinics/create"
            element={guard("clinic.create", <ClinicCreatePage />)}
          />
          <Route
            path="/clinics/:clinicId"
            element={guard("clinic.read", <ClinicDetailPage />)}
          />
          <Route
            path="/clinics/:clinicId/edit"
            element={guard("clinic.update", <ClinicEditPage />)}
          />

          {/* Persons */}
          <Route
            path="/persons"
            element={guard("person.read", <PersonsPage />)}
          />
          <Route
            path="/persons/create"
            element={guard("person.create", <PersonCreatePage />)}
          />
          <Route
            path="/persons/:personId"
            element={guard("person.read", <PersonDetailPage />)}
          />
          <Route
            path="/persons/:personId/edit"
            element={guard("person.update", <PersonEditPage />)}
          />

          {/* Patients */}
          <Route
            path="/patients"
            element={guard("patient.read", <PatientsPage />)}
          />
          <Route
            path="/patients/create"
            element={guard("patient.create", <PatientCreatePage />)}
          />
          <Route
            path="/patients/:patientId"
            element={guard("patient.read", <PatientDetailPage />)}
          />
          <Route
            path="/patients/:patientId/edit"
            element={guard("patient.update", <PatientEditPage />)}
          />

          {/* Guardians */}
          <Route
            path="/guardians"
            element={guard("patient_guardian.read", <GuardiansPage />)}
          />

          {/* Staff */}
          <Route
            path="/staff"
            element={guard("staff_member.read", <StaffMembersPage />)}
          />
          <Route
            path="/staff/create"
            element={guard("staff_member.create", <StaffMemberCreatePage />)}
          />
          <Route
            path="/staff/:staffId"
            element={guard("staff_member.read", <StaffMemberDetailPage />)}
          />
          <Route
            path="/staff/:staffId/edit"
            element={guard("staff_member.update", <StaffMemberEditPage />)}
          />

          {/* Schedule exceptions */}
          <Route
            path="/schedule-exceptions"
            element={guard(
              "schedule_exception.read",
              <ScheduleExceptionsPage />,
            )}
          />
          <Route
            path="/schedule-exceptions/create"
            element={guard(
              "schedule_exception.create",
              <ScheduleExceptionCreatePage />,
            )}
          />
          <Route
            path="/schedule-exceptions/:exceptionId"
            element={guard(
              "schedule_exception.read",
              <ScheduleExceptionDetailPage />,
            )}
          />
          <Route
            path="/schedule-exceptions/:exceptionId/edit"
            element={guard(
              "schedule_exception.update",
              <ScheduleExceptionEditPage />,
            )}
          />

          {/* Schedule overrides */}
          <Route
            path="/schedule-overrides"
            element={guard("schedule_override.read", <ScheduleOverridesPage />)}
          />
          <Route
            path="/schedule-overrides/create"
            element={guard(
              "schedule_override.create",
              <ScheduleOverrideCreatePage />,
            )}
          />
          <Route
            path="/schedule-overrides/:overrideId"
            element={guard(
              "schedule_override.read",
              <ScheduleOverrideDetailPage />,
            )}
          />
          <Route
            path="/schedule-overrides/:overrideId/edit"
            element={guard(
              "schedule_override.update",
              <ScheduleOverrideEditPage />,
            )}
          />

          {/* Procedures */}
          <Route
            path="/procedures"
            element={guard("procedure.read", <ProceduresPage />)}
          />
          <Route
            path="/procedures/create"
            element={guard("procedure.create", <ProcedureCreatePage />)}
          />
          <Route
            path="/procedures/:procedureId"
            element={guard("procedure.read", <ProcedureDetailPage />)}
          />
          <Route
            path="/procedures/:procedureId/edit"
            element={guard("procedure.update", <ProcedureEditPage />)}
          />

          {/* Conversations */}
          <Route
            path="/conversations"
            element={guard("conversation.read", <ConversationsPage />)}
          />

          {/* Appointments */}
          <Route
            path="/appointments"
            element={guard("appointment.read", <AppointmentsCalendarPage />)}
          />

          {/* Others Page */}
          <Route path="/profile" element={<ProfilePage />} />

          {/* Tables */}
        </Route>
      </Route>

      {/* Ruta pública */}
      <Route element={<PublicOnlyRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>
      </Route>
      <Route path="/signin" element={<Navigate to="/login" replace />} />

      {/* Full-width / Error / Status Pages */}
      <Route path="/error-404" element={<Error404Page />} />

      {/* Fallback Route */}
      <Route path="*" element={<Error404Page />} />
    </Routes>
  );
}
