import AppLayout from "@/components/layout/app-layout";
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
import CalendarPage from "@/pages/main/calendar";
import EcommercePage from "@/pages/main/dashboard/ecommerce";
import FormElementsPage from "@/pages/main/forms/form-elements";
import { BlankPage, Error404Page } from "@/pages/main/pages";
import ProfilePage from "@/pages/main/profile";
import BasicTablesPage from "@/pages/main/tables/basic-tables";
import { AuthLayout, SignInPage, SignUpPage } from "@/pages/others/auth";
import BarChartPage from "@/pages/others/charts/bar-chart";
import LineChartPage from "@/pages/others/charts/line-chart";
import Alerts from "@/pages/others/ui-elements/alerts";
import Avatars from "@/pages/others/ui-elements/avatars";
import Badges from "@/pages/others/ui-elements/badges";
import Buttons from "@/pages/others/ui-elements/buttons";
import Images from "@/pages/others/ui-elements/images";
import Videos from "@/pages/others/ui-elements/videos";
import "flatpickr/dist/flatpickr.css";
import { Route, Routes } from "react-router";

export default function App() {
  return (
    <Routes>
      {/* Dashboard Layout */}
      <Route element={<AppLayout />}>
        <Route index element={<EcommercePage />} />

        {/* Roles */}
        <Route path="/roles" element={<RolesPage />} />
        <Route path="/roles/create" element={<RoleCreatePage />} />
        <Route path="/roles/:roleId" element={<RoleDetailPage />} />
        <Route path="/roles/:roleId/edit" element={<RoleEditPage />} />

        {/* Permissions */}
        <Route path="/permissions" element={<PermissionsPage />} />
        <Route path="/permissions/create" element={<PermissionCreatePage />} />
        <Route
          path="/permissions/:permissionId"
          element={<PermissionDetailPage />}
        />
        <Route
          path="/permissions/:permissionId/edit"
          element={<PermissionEditPage />}
        />

        {/* Specialties */}
        <Route path="/specialties" element={<SpecialtiesPage />} />
        <Route path="/specialties/create" element={<SpecialtyCreatePage />} />
        <Route
          path="/specialties/:specialtyId"
          element={<SpecialtyDetailPage />}
        />
        <Route
          path="/specialties/:specialtyId/edit"
          element={<SpecialtyEditPage />}
        />

        {/* Special conditions */}
        <Route path="/special-conditions" element={<SpecialConditionsPage />} />
        <Route
          path="/special-conditions/create"
          element={<SpecialConditionCreatePage />}
        />
        <Route
          path="/special-conditions/:specialConditionId"
          element={<SpecialConditionDetailPage />}
        />
        <Route
          path="/special-conditions/:specialConditionId/edit"
          element={<SpecialConditionEditPage />}
        />

        {/* Clinics */}
        <Route path="/clinics" element={<ClinicsPage />} />
        <Route path="/clinics/create" element={<ClinicCreatePage />} />
        <Route path="/clinics/:clinicId" element={<ClinicDetailPage />} />
        <Route path="/clinics/:clinicId/edit" element={<ClinicEditPage />} />

        {/* Persons */}
        <Route path="/persons" element={<PersonsPage />} />
        <Route path="/persons/create" element={<PersonCreatePage />} />
        <Route path="/persons/:personId" element={<PersonDetailPage />} />
        <Route path="/persons/:personId/edit" element={<PersonEditPage />} />

        {/* Patients */}
        <Route path="/patients" element={<PatientsPage />} />
        <Route path="/patients/create" element={<PatientCreatePage />} />
        <Route path="/patients/:patientId" element={<PatientDetailPage />} />
        <Route path="/patients/:patientId/edit" element={<PatientEditPage />} />

        {/* Staff */}
        <Route path="/staff" element={<StaffMembersPage />} />
        <Route path="/staff/create" element={<StaffMemberCreatePage />} />
        <Route path="/staff/:staffId" element={<StaffMemberDetailPage />} />
        <Route path="/staff/:staffId/edit" element={<StaffMemberEditPage />} />

        {/* Schedule exceptions */}
        <Route
          path="/schedule-exceptions"
          element={<ScheduleExceptionsPage />}
        />
        <Route
          path="/schedule-exceptions/create"
          element={<ScheduleExceptionCreatePage />}
        />
        <Route
          path="/schedule-exceptions/:exceptionId"
          element={<ScheduleExceptionDetailPage />}
        />
        <Route
          path="/schedule-exceptions/:exceptionId/edit"
          element={<ScheduleExceptionEditPage />}
        />

        {/* Schedule overrides */}
        <Route path="/schedule-overrides" element={<ScheduleOverridesPage />} />
        <Route
          path="/schedule-overrides/create"
          element={<ScheduleOverrideCreatePage />}
        />
        <Route
          path="/schedule-overrides/:overrideId"
          element={<ScheduleOverrideDetailPage />}
        />
        <Route
          path="/schedule-overrides/:overrideId/edit"
          element={<ScheduleOverrideEditPage />}
        />

        {/* Procedures */}
        <Route path="/procedures" element={<ProceduresPage />} />
        <Route path="/procedures/create" element={<ProcedureCreatePage />} />
        <Route
          path="/procedures/:procedureId"
          element={<ProcedureDetailPage />}
        />
        <Route
          path="/procedures/:procedureId/edit"
          element={<ProcedureEditPage />}
        />

        {/* Conversations */}
        <Route path="/conversations" element={<ConversationsPage />} />

        {/* Appointments */}
        <Route path="/appointments" element={<AppointmentsCalendarPage />} />

        {/* Others Page */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/blank" element={<BlankPage />} />

        {/* Forms */}
        <Route path="/form-elements" element={<FormElementsPage />} />

        {/* Tables */}
        <Route path="/basic-tables" element={<BasicTablesPage />} />

        {/* Ui Elements */}
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/avatars" element={<Avatars />} />
        <Route path="/badge" element={<Badges />} />
        <Route path="/buttons" element={<Buttons />} />
        <Route path="/images" element={<Images />} />
        <Route path="/videos" element={<Videos />} />

        {/* Charts */}
        <Route path="/line-chart" element={<LineChartPage />} />
        <Route path="/bar-chart" element={<BarChartPage />} />
      </Route>

      {/* Auth Layout */}
      <Route element={<AuthLayout />}>
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
      </Route>

      {/* Full-width / Error / Status Pages */}
      <Route path="/error-404" element={<Error404Page />} />

      {/* Fallback Route */}
      <Route path="*" element={<Error404Page />} />
    </Routes>
  );
}
