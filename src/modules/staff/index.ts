export { default as StaffMemberCreatePage } from "./pages/staff-member-create-page";
export { default as StaffMemberDetailPage } from "./pages/staff-member-detail-page";
export { default as StaffMemberEditPage } from "./pages/staff-member-edit-page";
export { default as StaffMembersPage } from "./pages/staff-members-page";

// API pública para módulos consumidores (schedule-exceptions): consulta de personal
export { staffMemberApi } from "./services/staff-member-api";
export type { StaffMember } from "./types/staff-member.types";
