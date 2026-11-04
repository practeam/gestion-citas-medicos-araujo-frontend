import {
  BoxIcon,
  ChatIcon,
  CalendarIcon,
  ClockIcon,
  LayoutGridIcon,
  ListIcon,
  UserIcon,
  LockIcon,
  PageIcon,
  PieChartIcon,
  TaskIcon,
  UsersIcon,
  TableIcon,
  UserCircleIcon,
} from "@/icons";
import type { NavItem } from "./types";

export const navItems: NavItem[] = [
  {
    icon: <LayoutGridIcon className="size-6" />,
    key: "dashboard",
    subItems: [{ key: "ecommerceHome", path: "/" }],
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
    icon: <CalendarIcon className="size-6" />,
    key: "appointmentManagement",
    subItems: [
      {
        key: "appointmentsAgenda",
        path: "/appointments",
        permission: "appointment.read",
      },
    ],
  },
  {
    icon: <CalendarIcon className="size-6" />,
    key: "calendar",
    path: "/calendar",
  },
  {
    icon: <UserCircleIcon className="size-6" />,
    key: "userProfile",
    path: "/profile",
  },
  {
    key: "forms",
    icon: <ListIcon className="size-6" />,
    subItems: [{ key: "formElements", path: "/form-elements", pro: false }],
  },
  {
    key: "tables",
    icon: <TableIcon className="size-6" />,
    subItems: [{ key: "basicTables", path: "/basic-tables", pro: false }],
  },
  {
    key: "pages",
    icon: <PageIcon className="size-6" />,
    subItems: [
      { key: "blankPage", path: "/blank" },
      { key: "error404", path: "/error-404" },
    ],
  },
];

export const othersItems: NavItem[] = [
  {
    icon: <PieChartIcon className="size-6" />,
    key: "charts",
    subItems: [
      { key: "lineChart", path: "/line-chart", pro: false },
      { key: "barChart", path: "/bar-chart", pro: false },
    ],
  },
  {
    icon: <BoxIcon className="size-6" />,
    key: "uiElements",
    subItems: [
      { key: "alerts", path: "/alerts" },
      { key: "avatar", path: "/avatars" },
      { key: "badge", path: "/badge" },
      { key: "buttons", path: "/buttons" },
      { key: "images", path: "/images" },
      { key: "videos", path: "/videos" },
    ],
  },
];

export const supportItems: NavItem[] = [];
