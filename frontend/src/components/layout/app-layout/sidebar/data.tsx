import {
  BoxIcon,
  ChatIcon,
  CalendarIcon,
  ClockIcon,
  LayoutGridIcon,
  UserIcon,
  LockIcon,
  TaskIcon,
  UsersIcon,
  UserCircleIcon,
} from "@/icons";
import type { NavItem } from "./types";

export const navItems: NavItem[] = [
  {
    icon: <LayoutGridIcon className="size-6" />,
    key: "dashboard",
    path: "/",
    permission: "dashboard.read",
  },
  {
    icon: <CalendarIcon className="size-6" />,
    key: "appointmentManagement",
    path: "/appointments",
    permission: "appointment.read",
  },
  {
    icon: <ChatIcon className="size-6" />,
    key: "communication",
    subItems: [
      {
        key: "conversations",
        path: "/conversations",
        permission: "conversation.read",
      },
    ],
  },
  {
    icon: <UsersIcon className="size-6" />,
    key: "peopleManagement",
    subItems: [{ key: "persons", path: "/persons", permission: "person.read" }],
  },
  {
    icon: <UserIcon className="size-6" />,
    key: "patientManagement",
    subItems: [
      { key: "patients", path: "/patients", permission: "patient.read" },
      {
        key: "guardians",
        path: "/guardians",
        permission: "patient_guardian.read",
      },
      {
        key: "specialConditions",
        path: "/special-conditions",
        permission: "special_condition.read",
      },
    ],
  },
  {
    icon: <UserCircleIcon className="size-6" />,
    key: "staffManagement",
    subItems: [
      { key: "staff", path: "/staff", permission: "staff_member.read" },
    ],
  },
  {
    icon: <TaskIcon className="size-6" />,
    key: "clinicalManagement",
    subItems: [
      { key: "clinics", path: "/clinics", permission: "clinic.read" },
      {
        key: "specialties",
        path: "/specialties",
        permission: "specialty.read",
      },
    ],
  },
  {
    icon: <BoxIcon className="size-6" />,
    key: "serviceManagement",
    subItems: [
      { key: "procedures", path: "/procedures", permission: "procedure.read" },
    ],
  },
  {
    icon: <ClockIcon className="size-6" />,
    key: "scheduleManagement",
    subItems: [
      {
        key: "scheduleExceptions",
        path: "/schedule-exceptions",
        permission: "schedule_exception.read",
      },
      {
        key: "scheduleOverrides",
        path: "/schedule-overrides",
        permission: "schedule_override.read",
      },
    ],
  },
  {
    icon: <LockIcon className="size-6" />,
    key: "administration",
    subItems: [
      { key: "roles", path: "/roles", permission: "role.read" },
      {
        key: "permissions",
        path: "/permissions",
        permission: "permission.read",
      },
    ],
  },
  {
    icon: <UserCircleIcon className="size-6" />,
    key: "userProfile",
    path: "/profile",
  },
];

export const othersItems: NavItem[] = [];

export const supportItems: NavItem[] = [];
